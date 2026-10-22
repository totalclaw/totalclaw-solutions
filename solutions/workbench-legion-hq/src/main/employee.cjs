/**
 * 子机（员工机）视角（L10）：本机承载哪些部门、正在跑主控派来的哪些任务。
 *
 * - 承载的部门：主控经 config.set 写进本机员工画像的能力标签 `legion:<id>`（<privateRoot>/employee-profile.json）。
 * - 正在跑的任务：订阅宿主集群进程的 task:received / task:result。主控派 worker.run 时在 payload 里带
 *   legionHq 描述（任务号、标题、部门、本步目标、公司名；worker.run 忽略这个字段），这里据此显示；
 *   不是运营中心派来的 worker.run（例如集群工作流）也列出，只是没有部门信息。
 * - 子机不能主动问主控，所以只显示本机真实收到的活，不编造进度。
 */
const { readFileSync } = require('node:fs');
const { tagsToLegions } = require('./fleet.cjs');

const MAX_KEEP = 30;
const REAL_ROLES = new Set(['worker.run', 'delegate.run', 'dynamic.run']);

function describeDispatch(d) {
  const p = (d && d.payload) || {};
  const meta = p.legionHq && typeof p.legionHq === 'object' ? p.legionHq : null;
  const prompt = typeof p.prompt === 'string' ? p.prompt : typeof p.goal === 'string' ? p.goal : '';
  return {
    taskId: String(d.taskId || ''),
    kind: d.roleId,
    fromNodeId: typeof p.dispatcherNodeId === 'string' ? p.dispatcherNodeId : '',
    roleId: typeof p.roleId === 'string' ? p.roleId : null,
    taskNo: meta && Number.isFinite(meta.taskNo) ? meta.taskNo : null,
    title: meta ? String(meta.title || '').slice(0, 60) : prompt.replace(/\s+/g, ' ').slice(0, 60),
    legionId: meta ? String(meta.legionId || '') : null,
    legionName: meta ? String(meta.legionName || '') : null,
    goal: meta ? String(meta.goal || '').slice(0, 120) : '',
    company: meta ? String(meta.company || '').slice(0, 40) : '',
    fromLegionHq: !!meta,
  };
}

class EmployeeWatch {
  constructor({ proc, profilePath, onChange = () => {}, now = () => Date.now() }) {
    Object.assign(this, { proc, profilePath, onChange, now });
    this.items = new Map();
    this.offs = [];
  }

  start() {
    const p = this.proc();
    if (!p || typeof p.on !== 'function') return;
    const onReceived = (d) => {
      try {
        if (!REAL_ROLES.has(String(d?.roleId || ''))) return;
        this.items.set(String(d.taskId), { ...describeDispatch(d), status: 'running', receivedAt: this.now(), finishedAt: null, durationMs: null, error: null });
        this.trim();
        this.onChange(this.snapshot());
      } catch {
        /* 畸形帧忽略 */
      }
    };
    const onResult = (r) => {
      try {
        const it = this.items.get(String(r?.taskId || ''));
        if (!it) return;
        Object.assign(it, { status: r.status === 'success' ? 'done' : 'failed', finishedAt: this.now(), durationMs: r.durationMs ?? null, error: r.error ? String(r.error).slice(0, 120) : null });
        this.onChange(this.snapshot());
      } catch {
        /* */
      }
    };
    p.on('task:received', onReceived);
    p.on('task:result', onResult);
    this.offs.push(() => p.off('task:received', onReceived), () => p.off('task:result', onResult));
  }

  stop() {
    for (const off of this.offs) {
      try {
        off();
      } catch {
        /* */
      }
    }
    this.offs = [];
  }

  trim() {
    if (this.items.size <= MAX_KEEP) return;
    const done = [...this.items.values()].filter((x) => x.status !== 'running').sort((a, b) => a.receivedAt - b.receivedAt);
    for (const x of done.slice(0, this.items.size - MAX_KEEP)) this.items.delete(x.taskId);
  }

  hostedLegions() {
    try {
      const prof = JSON.parse(readFileSync(this.profilePath(), 'utf8'));
      return tagsToLegions(prof.capabilities);
    } catch {
      return [];
    }
  }

  snapshot() {
    const list = [...this.items.values()].sort((a, b) => b.receivedAt - a.receivedAt);
    const company = list.find((x) => x.company)?.company || '';
    return {
      hosted: this.hostedLegions(),
      company,
      running: list.filter((x) => x.status === 'running'),
      recent: list.filter((x) => x.status !== 'running').slice(0, 15),
    };
  }
}

module.exports = { EmployeeWatch, describeDispatch };
