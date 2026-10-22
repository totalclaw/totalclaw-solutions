/**
 * 任务执行（R1→R2→派发→汇总→老板拍板），多个任务并发互不阻塞（R6）。
 *
 * 每个任务：收到 → AI 总经理判定 → 生成计划 → 依赖就绪的步骤并行派给承载该部门的机器 →
 * 下游步骤的提示词带上游产物（R7，超长截断）→ 多步时总经理汇总 → 需拍板的进老板待办（O10）→ 办完。
 * 所有阶段都发总线事件，大屏只看事件。
 *
 * 跨机：员工机用现有 worker.run（真实引擎 + 角色提示词）执行；本机步骤直接调模型。
 * 开跑前派发失败（机器刚离线）→ 换下一台候选机器；跑到一半失败 → 不重跑（避免重复执行），该步标失败。
 */
const { randomUUID } = require('node:crypto');
const { triage } = require('./triage.cjs');
const { buildPlan } = require('./planner.cjs');
const { identityLine } = require('./company.cjs');

const UPSTREAM_MAX = 1200;
const STEP_TIMEOUT_MS = 6 * 60_000;
const MAX_TASKS_KEPT = 100;

function clip(s, n) {
  const t = String(s || '').trim();
  return t.length > n ? `${t.slice(0, n)}\n…（后文略，共 ${t.length} 字）` : t;
}

function firstLine(s, n = 60) {
  const line = String(s || '')
    .split('\n')
    .map((x) => x.replace(/^[#>*\-\s]+/, '').trim())
    .find(Boolean);
  return line ? (line.length > n ? `${line.slice(0, n)}…` : line) : '';
}

class TaskRunner {
  /**
   * @param {object} o
   * @param {import('./bus.cjs').LegionBus} o.bus
   * @param {() => object[]} o.legions         本机已装部门（完整清单）
   * @param {import('./fleet.cjs').Fleet} o.fleet
   * @param {(prompt:string, opts?:{model?:string, signal?:AbortSignal}) => Promise<string>} o.llm  本机模型
   * @param {() => object} o.company           生效的公司档案
   * @param {(rec:object) => void} [o.saveTask]  任务全文落盘（控制台查看产出）
   * @param {() => object} [o.settings]        { useModelTriage, outputChars, responseLocale }
   */
  constructor(o) {
    Object.assign(this, { saveTask: () => {}, settings: () => ({}), log: { info() {}, warn() {} }, now: () => Date.now() }, o);
    this.tasks = new Map(); // taskId → 运行态
    this.seqNo = 0;
    this.dispatches = new Map(); // 派给员工机的 dispatchId → { taskId, stepId }（接收员工机回传的执行阶段）
  }

  availableLegions() {
    const ids = new Set(this.fleet.availableLegionIds());
    return this.legions().filter((L) => ids.has(L.id));
  }

  /** 下一个大屏编号（#1、#2…，导演台重置后从 1 开始） */
  nextNo() {
    return ++this.seqNo;
  }

  /**
   * 收一件事（老板下令 / 定时例行 / 客户消息 / 来信 / 剧本），立刻返回 taskId，后台执行。
   * @param {{text:string, source?:string, title?:string, forcedLegions?:string[]}} input
   */
  submit(input) {
    const text = String(input?.text || '').trim().slice(0, 2000);
    if (!text) throw new Error('任务内容不能为空');
    const id = `t-${randomUUID().slice(0, 8)}`;
    const t = {
      id,
      no: this.nextNo(),
      text,
      title: String(input.title || text).trim().slice(0, 60),
      source: ['boss', 'cron', 'customer', 'mail', 'script'].includes(input.source) ? input.source : 'boss',
      forced: Array.isArray(input.forcedLegions) ? input.forcedLegions : null,
      status: 'triaging',
      createdAt: this.now(),
      decision: null,
      plan: null,
      outputs: {},
      summary: '',
      error: null,
      aborts: new Set(),
      cancelled: false,
      confirmWaiter: null,
      rejects: 0,
    };
    this.tasks.set(id, t);
    this.publish(t, 'task:received', { title: t.title, source: t.source });
    this.run(t).catch((e) => this.finish(t, false, String(e && e.message ? e.message : e)));
    return { taskId: id, no: t.no };
  }

  publish(t, type, payload = {}) {
    return this.bus.publish(type, { taskId: t.id, taskNo: t.no, ...payload });
  }

  async run(t) {
    // 判定只在「有机器承载」的部门里挑；剧本 / 导演台强制指定的部门照用全部已装部门，
    // 没有机器承载时让该步如实报「没有在线机器承载 X」，而不是悄悄换成总经理直接处理
    const legions = t.forced ? this.legions() : this.availableLegions();
    const st = this.settings();
    const decision = await triage(t.text, legions, {
      forced: t.forced,
      company: this.company(),
      llm: st.useModelTriage === false ? null : (prompt) => this.llm(prompt, { timeoutMs: 60_000 }),
    });
    if (t.cancelled) return;
    t.decision = decision;
    if (decision.fallbackReason) this.log.warn(`#${t.no} 判定回落规则：${decision.fallbackReason}`);
    this.publish(t, 'task:triaged', { legions: decision.legions, mode: decision.mode, reason: decision.reason, via: decision.via });

    const plan = buildPlan(t.text, decision, legions);
    t.plan = plan;
    t.status = 'running';
    this.publish(t, 'task:planned', {
      steps: plan.steps.map((s) => ({ id: s.id, legionId: s.legionId, goal: s.goal, dependsOn: s.dependsOn })),
      summary: plan.summary,
      approval: plan.approval,
      workflow: plan.workflow ? { id: plan.workflow.id, name: plan.workflow.name } : null,
    });

    if (!plan.steps.length) {
      t.summary = await this.chiefAnswer(t);
    } else {
      await this.runSteps(t);
      if (t.cancelled) return;
      const failed = plan.steps.filter((s) => t.outputs[s.id]?.error);
      if (failed.length === plan.steps.length) throw new Error(t.outputs[failed[0].id].error);
      t.summary = plan.summary ? await this.summarize(t) : t.outputs[plan.steps[0].id].text;
    }
    if (t.cancelled) return;
    if (plan.approval) {
      const ok = await this.awaitConfirm(t);
      if (!ok) return;
    }
    this.finish(t, true);
  }

  async runSteps(t) {
    const steps = t.plan.steps;
    const done = new Set();
    const running = new Map();
    const blocked = new Set();
    while (done.size + blocked.size < steps.length && !t.cancelled) {
      for (const s of steps) {
        if (done.has(s.id) || blocked.has(s.id) || running.has(s.id)) continue;
        if (s.dependsOn.some((d) => blocked.has(d))) {
          blocked.add(s.id);
          t.outputs[s.id] = { error: '上游步骤失败，未执行' };
          this.publish(t, 'node:failed', { stepId: s.id, legionId: s.legionId, error: '上游步骤失败，未执行' });
          continue;
        }
        if (!s.dependsOn.every((d) => done.has(d))) continue;
        running.set(
          s.id,
          this.runStep(t, s).then((ok) => {
            running.delete(s.id);
            (ok ? done : blocked).add(s.id);
          }),
        );
      }
      if (!running.size) break;
      await Promise.race(running.values());
    }
    await Promise.all(running.values());
  }

  stepPrompt(t, s, extra = '') {
    const L = this.legions().find((x) => x.id === s.legionId);
    const company = this.company();
    const ups = s.dependsOn
      .map((d) => t.plan.steps.find((x) => x.id === d))
      .filter(Boolean)
      .map((u) => {
        const UL = this.legions().find((x) => x.id === u.legionId);
        return `【${UL ? UL.name : u.legionId}的产出：${u.goal}】\n${clip(t.outputs[u.id]?.text, UPSTREAM_MAX)}`;
      });
    const chars = Math.min(2000, Math.max(300, Number(this.settings().outputChars) || 900));
    const pack = typeof this.extraContext === 'function' ? this.extraContext() : '';
    return [
      identityLine(company, L),
      L ? `你所在部门：${L.name}（${L.summary}）。` : '',
      pack ? `\n公司资料（可引用其中的数字，资料里没有的不要编）：\n${pack}\n` : '',
      '',
      `老板交办的事：${t.text}`,
      `本部门这一步要交付：${s.goal}`,
      ups.length ? `\n上游部门已经交给你的材料（必须基于它们，引用其中的数字和结论，不要另起炉灶）：\n${ups.join('\n\n')}` : '',
      extra ? `\n${extra}` : '',
      '',
      `要求：直接给出可用的成果（条理清楚、可直接拿去用），约 ${chars} 字以内。`,
      '没有依据的数字不要编，写「待补充：…」；涉及付款、签约、对外发布、录用的最终动作只准备材料，写明「需老板确认」，不要声称已经执行。',
    ]
      .filter((x) => x !== '')
      .join('\n');
  }

  async runStep(t, s) {
    const tried = [];
    for (;;) {
      const machine = this.fleet.pick(s.legionId, tried);
      if (!machine) {
        const L = this.legions().find((x) => x.id === s.legionId);
        const error = tried.length ? '承载该部门的机器都派发失败' : `没有在线机器承载${L ? L.name : s.legionId}`;
        t.outputs[s.id] = { error };
        this.publish(t, 'node:failed', { stepId: s.id, legionId: s.legionId, error });
        return false;
      }
      tried.push(machine.id);
      // R7 交接：上游属于别的部门 → 交接事件（label 取上游这一步的交付物）
      for (const d of s.dependsOn) {
        const u = t.plan.steps.find((x) => x.id === d);
        if (u && u.legionId !== s.legionId && tried.length === 1) {
          this.publish(t, 'node:handoff', { stepId: s.id, fromLegion: u.legionId, toLegion: s.legionId, label: firstLine(u.goal, 14) || '成果' });
        }
      }
      const started = this.now();
      this.fleet.acquire(machine.id);
      this.publish(t, 'node:dispatched', { stepId: s.id, legionId: s.legionId, machineId: machine.id, machineName: machine.name, local: !!machine.local });
      const ac = new AbortController();
      t.aborts.add(ac);
      try {
        const text = await this.execute(t, s, machine, ac.signal);
        t.outputs[s.id] = { text, machine: machine.name, ms: this.now() - started };
        this.publish(t, 'node:done', { stepId: s.id, legionId: s.legionId, ms: this.now() - started, machineId: machine.id });
        return true;
      } catch (e) {
        if (t.cancelled) return false;
        const msg = String(e && e.message ? e.message : e).slice(0, 200);
        // 开跑前失败（目标不可用 / 未连接）→ 换机；执行中失败 → 不重跑
        if (e && e.preDispatch && this.fleet.pick(s.legionId, tried)) {
          this.publish(t, 'node:progress', { stepId: s.id, phase: `${machine.name}不可用，换机` });
          continue;
        }
        t.outputs[s.id] = { error: msg, machine: machine.name };
        this.publish(t, 'node:failed', { stepId: s.id, legionId: s.legionId, error: msg });
        return false;
      } finally {
        t.aborts.delete(ac);
        this.fleet.release(machine.id);
      }
    }
  }

  async execute(t, s, machine, signal) {
    const L = this.legions().find((x) => x.id === s.legionId);
    const prompt = this.stepPrompt(t, s, t.rejectNote && t.rejectStep === s.id ? `老板的修改意见：${t.rejectNote}` : '');
    // L12：部门专用模型 / key（主控本机保存）。专用 key 只随派往员工机的这一步走；主控本机执行的步骤用本机默认 key
    const lk = (this.legionKeys && this.legionKeys(s.legionId)) || null;
    const model = lk?.model || L?.defaultModel || undefined;
    const credential = lk?.provider && lk?.apiKey ? { provider: lk.provider, apiKey: lk.apiKey, ...(lk.baseUrl ? { baseUrl: lk.baseUrl } : {}) } : undefined;
    if (machine.local) {
      this.publish(t, 'node:progress', { stepId: s.id, phase: '生成中' });
      return this.llm(prompt, { model, signal, timeoutMs: STEP_TIMEOUT_MS });
    }
    const proc = this.fleet.proc();
    const dispatchId = `${t.id}-${s.id}-${randomUUID().slice(0, 6)}`;
    this.dispatches.set(dispatchId, { taskId: t.id, stepId: s.id });
    const onAbort = () => {
      // 主控中止 → 通知员工机停掉在跑的会话（best-effort）
      proc
        .dispatchTask({ taskId: `${dispatchId}-cancel`, idempotencyKey: `${dispatchId}-cancel`, targetNodeId: machine.id, roleId: 'cluster.cancel', priority: 'high', payload: { taskId: dispatchId } })
        .catch(() => {});
    };
    signal.addEventListener('abort', onAbort, { once: true });
    this.publish(t, 'node:progress', { stepId: s.id, phase: `${machine.name}执行中` });
    let res;
    try {
      res = await proc.dispatchTask({
        taskId: dispatchId,
        idempotencyKey: dispatchId,
        targetNodeId: machine.id,
        roleId: 'worker.run',
        priority: 'normal',
        payload: {
          // 放在最前：子机的方案读它显示「本机正在做什么」（入站历史只截 payload 前 300 字）；worker.run 忽略此字段
          legionHq: { v: 1, taskNo: t.no, title: t.title, stepId: s.id, legionId: s.legionId, legionName: L ? L.name : s.legionId, goal: s.goal, company: this.company().short || this.company().name || '' },
          roleId: s.roleId,
          prompt,
          model,
          timeoutMs: STEP_TIMEOUT_MS,
          dispatcherNodeId: this.fleet.self().nodeId,
          responseLocale: this.settings().responseLocale || undefined,
          // 放最后：员工机入站预览只截前 300 字，宿主另外也会把 credential 打码
          ...(credential ? { credential } : {}),
        },
      });
    } catch (e) {
      const msg = String(e && e.message ? e.message : e);
      const err = new Error(msg);
      // 传输层「目标不可用 / 连不上」= 还没开跑
      err.preDispatch = /不可用|not available|ECONNREFUSED|EHOSTUNREACH|未启动|unknown node/i.test(msg);
      throw err;
    } finally {
      signal.removeEventListener('abort', onAbort);
      this.dispatches.delete(dispatchId);
    }
    if (!res || res.status !== 'success') throw new Error(res?.error || '员工机执行失败');
    this.publish(t, 'node:progress', { stepId: s.id, phase: '结果回传' });
    const text = String(res.output?.text || '');
    if (!text.trim()) throw new Error('员工机没有返回内容');
    return text;
  }

  /**
   * 员工机回传的执行阶段（宿主 task.progress，2026-10-22 起）：按 dispatchId 找到步骤，转成大屏「正在做什么」。
   * 只认本中心派出去、还在跑的步骤；阶段文字截短，不含原文。
   */
  onRemoteProgress(dispatchId, phase) {
    const ref = this.dispatches.get(String(dispatchId || ''));
    if (!ref) return false;
    const t = this.tasks.get(ref.taskId);
    if (!t || t.cancelled || ['done', 'failed', 'cancelled'].includes(t.status)) return false;
    this.publish(t, 'node:progress', { stepId: ref.stepId, phase: String(phase || '').slice(0, 30), remote: true });
    return true;
  }

  async summarize(t) {
    t.status = 'summarizing';
    this.publish(t, 'task:summarizing');
    const parts = t.plan.steps.map((s) => {
      const L = this.legions().find((x) => x.id === s.legionId);
      const o = t.outputs[s.id] || {};
      return `【${L ? L.name : s.legionId}｜${s.goal}】\n${o.error ? `（未完成：${o.error}）` : clip(o.text, 1500)}`;
    });
    const company = this.company();
    const extra = typeof this.extraContext === 'function' ? this.extraContext() : '';
    const prompt = [
      identityLine(company, null),
      extra ? `公司资料：\n${extra}\n` : '',
      `老板交办的事：${t.text}`,
      '各部门已经交上来的成果如下，请汇总成一份给老板看的结论：',
      parts.join('\n\n'),
      '',
      '格式：先一句话结论；然后分「各部门要点」「需要老板拍板的事」「风险与待补充」三段。只用上面材料里的事实，不要新编数字。',
      t.rejectNote && t.rejectStep === 'summary' ? `老板的修改意见：${t.rejectNote}` : '',
    ]
      .filter(Boolean)
      .join('\n');
    try {
      return await this.llm(prompt, { timeoutMs: STEP_TIMEOUT_MS });
    } catch (e) {
      // 汇总失败不丢各部门成果：把各部门产出原样拼起来交给老板
      this.log.warn(`#${t.no} 汇总失败，改为直接拼接：${e.message}`);
      return parts.join('\n\n');
    }
  }

  async chiefAnswer(t) {
    const extra = typeof this.extraContext === 'function' ? this.extraContext() : '';
    const prompt = `${identityLine(this.company(), null)}${extra ? `\n公司资料：\n${extra}` : ''}\n老板说：${t.text}\n请直接回答，简洁。`;
    return this.llm(prompt, { timeoutMs: 120_000 });
  }

  awaitConfirm(t) {
    t.status = 'awaiting';
    this.publish(t, 'task:awaiting_confirm', { approval: t.plan.approval });
    this.persist(t);
    return new Promise((resolve) => {
      t.confirmWaiter = resolve;
    });
  }

  /** R9 老板批准 */
  confirm(taskId) {
    const t = this.tasks.get(taskId);
    if (!t || t.status !== 'awaiting' || !t.confirmWaiter) throw new Error('这件事不在待确认状态');
    const w = t.confirmWaiter;
    t.confirmWaiter = null;
    this.publish(t, 'task:confirmed');
    w(true);
    this.finish(t, true);
    return { ok: true };
  }

  /** R9 老板驳回：带意见回到最后一步（有汇总就重做汇总）重跑一次，然后再交确认 */
  reject(taskId, comment) {
    const t = this.tasks.get(taskId);
    if (!t || t.status !== 'awaiting' || !t.confirmWaiter) throw new Error('这件事不在待确认状态');
    const note = String(comment || '').trim().slice(0, 300) || '请修改后再提交';
    const w = t.confirmWaiter;
    t.confirmWaiter = null;
    w(false);
    t.rejects++;
    t.rejectNote = note;
    t.status = 'running';
    this.publish(t, 'task:rejected', { comment: note });
    (async () => {
      if (t.plan.summary) {
        t.rejectStep = 'summary';
        t.summary = await this.summarize(t);
      } else {
        const last = t.plan.steps[t.plan.steps.length - 1];
        t.rejectStep = last.id;
        const ok = await this.runStep(t, last);
        if (!ok) throw new Error(t.outputs[last.id].error);
        t.summary = t.outputs[last.id].text;
      }
      if (t.cancelled) return;
      if (await this.awaitConfirm(t)) this.finish(t, true);
    })().catch((e) => this.finish(t, false, String(e.message || e)));
    return { ok: true };
  }

  cancel(taskId) {
    const t = this.tasks.get(taskId);
    if (!t || ['done', 'failed', 'cancelled'].includes(t.status)) return { ok: false };
    t.cancelled = true;
    for (const ac of t.aborts) ac.abort();
    if (t.confirmWaiter) {
      t.confirmWaiter(false);
      t.confirmWaiter = null;
    }
    t.status = 'cancelled';
    this.publish(t, 'task:done', { ok: false, cancelled: true });
    this.persist(t);
    return { ok: true };
  }

  /** 导演台重置：中止全部任务、编号从 1 开始 */
  resetAll() {
    for (const id of this.tasks.keys()) this.cancel(id);
    this.tasks.clear();
    this.seqNo = 0;
    this.bus.publish('screen:reset', {});
  }

  finish(t, ok, error) {
    if (['done', 'failed', 'cancelled'].includes(t.status)) return;
    t.status = ok ? 'done' : 'failed';
    t.error = ok ? null : error || '执行失败';
    t.finishedAt = this.now();
    this.publish(t, 'task:done', ok ? { ok: true, summary: firstLine(t.summary, 80) } : { ok: false, error: t.error });
    this.persist(t);
    // 内存里只留最近的任务
    if (this.tasks.size > MAX_TASKS_KEPT) {
      const old = [...this.tasks.values()].filter((x) => ['done', 'failed', 'cancelled'].includes(x.status)).sort((a, b) => a.finishedAt - b.finishedAt);
      for (const x of old.slice(0, this.tasks.size - MAX_TASKS_KEPT)) this.tasks.delete(x.id);
    }
  }

  /** 控制台查看用的完整记录（不进大屏事件） */
  record(t) {
    return {
      id: t.id,
      no: t.no,
      title: t.title,
      text: t.text,
      source: t.source,
      status: t.status,
      createdAt: t.createdAt,
      finishedAt: t.finishedAt || null,
      decision: t.decision && { legions: t.decision.legions, mode: t.decision.mode, reason: t.decision.reason, via: t.decision.via, fallbackReason: t.decision.fallbackReason || null },
      plan: t.plan && { steps: t.plan.steps, summary: t.plan.summary, approval: t.plan.approval, workflow: t.plan.workflow },
      outputs: t.outputs,
      summary: t.summary,
      error: t.error,
      rejects: t.rejects,
    };
  }

  persist(t) {
    try {
      this.saveTask(this.record(t));
    } catch (e) {
      this.log.warn(`任务记录保存失败：${e.message}`);
    }
  }

  get(taskId) {
    const t = this.tasks.get(taskId);
    return t ? this.record(t) : null;
  }

  list() {
    return [...this.tasks.values()].map((t) => this.record(t)).sort((a, b) => b.createdAt - a.createdAt);
  }
}

module.exports = { TaskRunner, clip, firstLine };
