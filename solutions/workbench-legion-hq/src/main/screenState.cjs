/**
 * E6 大屏状态快照：一份内存快照（进行中 / 最近完成的任务、各部门执行中与累计、机器、最近 50 条动态、老板待办）。
 * 新连接先拿快照再接增量；快照只由总线事件推导（reduce），不另存业务状态。
 *
 * 约束：动态最多 50 条、已结束任务最多 20 个；重复事件（seq 不增）与未知任务的事件丢弃。
 */

const MAX_FEED = 50;
const MAX_FINISHED = 20;
const ACTIVE = new Set(['triaging', 'planning', 'running', 'summarizing', 'awaiting']);
const SOURCE_LABEL = { boss: '老板下令', cron: '定时例行', customer: '客户消息', mail: '来信', script: '剧本' };

function createState() {
  return {
    lastSeq: 0,
    replay: false,
    company: null,
    legions: [],
    machines: [],
    tasks: [],
    feed: [],
    stats: {}, // legionId → { done }
    doneToday: 0,
    day: '',
  };
}

function short(s, n = 40) {
  const t = String(s || '').replace(/\s+/g, ' ').trim();
  return t.length > n ? `${t.slice(0, n)}…` : t;
}

function legionShort(state, id) {
  return state.legions.find((L) => L.id === id)?.short || id;
}

function pushFeed(state, ev, who, text, extra) {
  // extra：{ taskId, result, files } —— 办完 / 交付文件的动态在大屏上带「查看报告 / 下载」
  state.feed.unshift({ ts: ev.ts, who, text, taskNo: ev.taskNo ?? null, ...(extra || {}) });
  if (state.feed.length > MAX_FEED) state.feed.length = MAX_FEED;
}

function prune(state) {
  const finished = state.tasks.filter((t) => !ACTIVE.has(t.status));
  if (finished.length <= MAX_FINISHED) return;
  const drop = new Set(finished.sort((a, b) => (b.finishedAt || 0) - (a.finishedAt || 0)).slice(MAX_FINISHED).map((t) => t.id));
  state.tasks = state.tasks.filter((t) => !drop.has(t.id));
}

/** 应用一条事件；返回 true 表示快照有变化 */
function applyEvent(state, ev) {
  if (!ev || typeof ev.type !== 'string') return false;
  if (!ev.replay && typeof ev.seq === 'number') {
    if (ev.seq <= state.lastSeq) return false;
    state.lastSeq = ev.seq;
  }
  const day = new Date(ev.ts || Date.now()).toISOString().slice(0, 10);
  if (state.day !== day) {
    state.day = day;
    state.doneToday = 0;
  }
  switch (ev.type) {
    case 'company:changed':
      state.company = ev.company;
      return true;
    case 'legions:changed':
      state.legions = ev.legions || [];
      return true;
    case 'fleet:changed':
      state.machines = ev.machines || [];
      return true;
    case 'demo:changed':
      state.demoRun = !!ev.on;
      return true;
    case 'screen:reset':
      Object.assign(state, { tasks: [], feed: [], stats: {}, doneToday: 0, replay: !!ev.replay });
      return true;
    // E1：宿主工作流页（集群工作流）的运行，进动态（谁 = 'wf'，带部门时用部门颜色）
    case 'workflow:external':
      pushFeed(state, ev, ev.legionId && state.legions.some((x) => x.id === ev.legionId) ? ev.legionId : 'wf', short(String(ev.text || ''), 80));
      return true;
    default:
      break;
  }
  if (ev.type === 'task:received') {
    if (state.tasks.some((t) => t.id === ev.taskId)) return false;
    state.tasks.push({
      id: ev.taskId,
      no: ev.taskNo,
      title: short(ev.title, 30),
      source: ev.source || 'boss',
      status: 'triaging',
      createdAt: ev.ts,
      legions: [],
      steps: [],
      handoffs: [],
      triage: null,
      approval: null,
      result: null,
    });
    pushFeed(state, ev, 'core', `收到 #${ev.taskNo}「${short(ev.title, 24)}」（${SOURCE_LABEL[ev.source] || '老板下令'}）`);
    return true;
  }
  const task = state.tasks.find((t) => t.id === ev.taskId);
  if (!task) return false;
  const step = ev.stepId ? task.steps.find((s) => s.id === ev.stepId) : null;
  const L = (id) => legionShort(state, id);
  switch (ev.type) {
    case 'task:triaged': {
      task.legions = ev.legions || [];
      task.triage = { mode: ev.mode, reason: short(ev.reason, 60), via: ev.via, at: ev.ts };
      task.status = 'planning';
      const n = task.legions.length;
      const tail = n === 1 ? '（一个部门即可）' : ev.mode === 'all' ? '（全公司协同）' : n ? `（${n} 个部门协同）` : '';
      pushFeed(state, ev, 'core', n ? `#${task.no} 交给：${task.legions.map(L).join('、')}${tail}` : `#${task.no} AI 总经理直接处理`);
      return true;
    }
    case 'task:planned':
      task.steps = (ev.steps || []).map((s) => ({ id: s.id, legionId: s.legionId, goal: short(s.goal, 40), dependsOn: s.dependsOn || [], status: 'waiting', machine: null, phase: '', startedAt: null, endedAt: null }));
      task.summary = !!ev.summary;
      task.approval = ev.approval || null;
      task.workflow = ev.workflow || null;
      task.status = 'running';
      if (ev.workflow) pushFeed(state, ev, 'core', `#${task.no} 按「${ev.workflow.name}」流程办理`);
      return true;
    case 'node:dispatched':
      if (!step) return false;
      Object.assign(step, { status: 'running', machine: ev.machineName || ev.machineId || null, startedAt: ev.ts, phase: ev.local ? '本机执行' : '已派发' });
      pushFeed(state, ev, step.legionId, `#${task.no} 开始：${short(step.goal, 22)}${ev.machineName ? `（${ev.machineName}）` : ''}`);
      return true;
    case 'node:progress':
      if (!step) return false;
      step.phase = short(ev.phase || ev.text, 16);
      return true;
    case 'node:handoff':
      task.handoffs.push({ from: ev.fromLegion, to: ev.toLegion, label: short(ev.label, 14), ts: ev.ts });
      if (task.handoffs.length > 20) task.handoffs.shift();
      pushFeed(state, ev, 'hand', `#${task.no} ${L(ev.fromLegion)} → ${L(ev.toLegion)}：${short(ev.label, 14)}`);
      return true;
    case 'node:done':
      if (!step) return false;
      Object.assign(step, { status: 'done', endedAt: ev.ts, phase: '' });
      state.stats[step.legionId] = { done: (state.stats[step.legionId]?.done || 0) + 1 };
      pushFeed(state, ev, step.legionId, `#${task.no} 完成：${short(step.goal, 22)}`, Array.isArray(ev.files) && ev.files.length ? { taskId: task.id, stepId: ev.stepId, files: ev.files.slice(0, 5) } : undefined);
      return true;
    case 'node:failed':
      if (!step) return false;
      Object.assign(step, { status: 'failed', endedAt: ev.ts, phase: short(ev.error, 16) });
      pushFeed(state, ev, step.legionId, `#${task.no} 失败：${short(ev.error, 30)}`);
      return true;
    case 'task:summarizing':
      task.status = 'summarizing';
      pushFeed(state, ev, 'core', `#${task.no} 汇总 ${task.legions.length} 个部门的产物`);
      return true;
    case 'task:awaiting_confirm':
      task.status = 'awaiting';
      task.approval = ev.approval || task.approval;
      pushFeed(state, ev, 'boss', `#${task.no} 提交老板确认${task.approval?.label ? `（${task.approval.label}）` : ''}`);
      return true;
    case 'task:confirmed':
      pushFeed(state, ev, 'boss', `${state.company?.boss || '老板'} 已批准 #${task.no}`);
      return true;
    case 'task:rejected':
      task.status = 'running';
      pushFeed(state, ev, 'boss', `${state.company?.boss || '老板'} 驳回 #${task.no}：${short(ev.comment, 20)}`);
      return true;
    case 'task:retry': {
      const ids = new Set(ev.stepIds || []);
      for (const s of task.steps) if (ids.has(s.id)) Object.assign(s, { status: 'waiting', machine: null, phase: '', startedAt: null, endedAt: null });
      task.status = 'running';
      task.finishedAt = null;
      task.error = null;
      pushFeed(state, ev, 'boss', `${state.company?.boss || '老板'} 让 #${task.no} 重办没办成的 ${ids.size} 步`);
      return true;
    }
    case 'task:done': {
      const was = task.status;
      task.status = ev.cancelled ? 'cancelled' : ev.ok ? 'done' : 'failed';
      task.finishedAt = ev.ts;
      task.result = ev.ok ? short(ev.summary, 80) : null;
      task.error = ev.ok ? null : short(ev.error, 60);
      for (const s of task.steps) if (s.status === 'running' || s.status === 'waiting') s.status = ev.ok ? 'done' : 'skipped';
      if (ev.ok && ACTIVE.has(was)) state.doneToday++;
      pushFeed(state, ev, 'core', ev.cancelled ? `#${task.no} 已中止` : ev.ok ? `#${task.no} 办完了` : `#${task.no} 没办成：${short(ev.error, 24)}`, ev.ok && !ev.cancelled ? { taskId: task.id, result: true } : undefined);
      prune(state);
      return true;
    }
    default:
      return false;
  }
}

/** 对外快照（大屏 / 控制台）：派生计数，任务按「进行中在前、新的在前」 */
function snapshot(state) {
  const active = state.tasks.filter((t) => ACTIVE.has(t.status)).sort((a, b) => b.createdAt - a.createdAt);
  const finished = state.tasks.filter((t) => !ACTIVE.has(t.status)).sort((a, b) => (b.finishedAt || 0) - (a.finishedAt || 0));
  const legionLoad = {};
  for (const L of state.legions) legionLoad[L.id] = { active: 0, waiting: 0, done: state.stats[L.id]?.done || 0 };
  for (const t of active) {
    for (const s of t.steps) {
      const slot = legionLoad[s.legionId];
      if (!slot) continue;
      if (s.status === 'running') slot.active++;
      else if (s.status === 'waiting') slot.waiting++;
    }
  }
  return {
    company: state.company,
    legions: state.legions,
    machines: state.machines,
    tasks: [...active, ...finished],
    inbox: active.filter((t) => t.status === 'awaiting').map((t) => ({ taskId: t.id, no: t.no, title: t.title, approval: t.approval })),
    feed: state.feed,
    legionLoad,
    counters: {
      staff: state.legions.reduce((n, L) => n + (L.staff || 0), 0),
      running: active.length,
      doneToday: state.doneToday,
      awaiting: active.filter((t) => t.status === 'awaiting').length,
    },
    replay: state.replay,
    demoRun: !!state.demoRun,
    lastSeq: state.lastSeq,
  };
}

module.exports = { createState, applyEvent, snapshot, ACTIVE, SOURCE_LABEL };
