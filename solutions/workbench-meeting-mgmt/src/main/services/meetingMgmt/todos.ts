/**
 * 会议智能管理 · 按当前身份算首页待办（13 类）、任务提醒（本周截止 / 逾期）、计数、紧急程度与提示语。
 * 纯函数：输入状态与「现在」，输出视图数据；不改状态。
 *
 * 紧急程度（types.ts MmTodo.urgency）：待裁决、逾期 → 紧急；今天到期 / 超时 → 今天；其余 → 本周。
 * 提示语：「已等待 1 天」「剩 6 小时」「逾期 2 天」。
 */
import { t as i18nT } from '@totalclaw/i18n';
import type {
  MmMeeting, MmOrg, MmProject, MmSettings, MmTask, MmTaskView, MmTodo,
} from '../../../shared/meetingMgmt/types';
import {
  DAY_MS, HOUR_MS, daysBetweenYmd, endOfDay, hasOpenObjection, isTaskOverdue, isYmd, planOwners, taskOverdueDays, taskOwners, weekRange, ymd, ymdStart,
} from './rules';

/** 多位任务负责人的名字（顿号连起来） */
const ownerNames = (org: MmOrg, ids: string[]): string => ids.map((id) => personName(org, id)).filter(Boolean).join(i18nT('、'));

export interface TodoInput {
  org: MmOrg;
  settings: MmSettings;
  projects: MmProject[];
  meetings: MmMeeting[];
  tasks: MmTask[];
}

// ─── 提示语 ───────────────────────────────────────────────────────────

/** 「已等待 N 天 / N 小时」；不到 1 小时 →「刚刚」 */
export function waitedHint(since: number | undefined, now: number): string {
  if (!since) return '';
  const ms = Math.max(0, now - since);
  if (ms >= DAY_MS) return i18nT('已等待 {n} 天', { n: Math.floor(ms / DAY_MS) });
  if (ms >= HOUR_MS) return i18nT('已等待 {n} 小时', { n: Math.floor(ms / HOUR_MS) });
  return i18nT('刚刚');
}

/** 「剩 N 天 / 剩 N 小时」（向上取整，至少 1） */
export function remainHint(deadline: number, now: number): string {
  const ms = deadline - now;
  if (ms >= DAY_MS) return i18nT('剩 {n} 天', { n: Math.ceil(ms / DAY_MS) });
  return i18nT('剩 {n} 小时', { n: Math.max(1, Math.ceil(ms / HOUR_MS)) });
}

export function overdueHint(days: number): string {
  return i18nT('逾期 {n} 天', { n: Math.max(1, days) });
}

/** 按截止日的提示：逾期 N 天 / 今天到期剩 N 小时 / 剩 N 天 */
export function dueHint(due: string, now: number): string {
  if (!isYmd(due)) return '';
  const today = ymd(now);
  if (due < today) return overdueHint(daysBetweenYmd(due, today));
  if (due === today) return remainHint(endOfDay(now), now);
  return i18nT('剩 {n} 天', { n: daysBetweenYmd(today, due) });
}

// ─── 名字 ─────────────────────────────────────────────────────────────

export function personName(org: MmOrg, id: string | undefined | null): string {
  if (!id) return '';
  return org.people.find((p) => p.id === id)?.name || i18nT('未知人员');
}

export function deptName(org: MmOrg, id: string | undefined | null): string {
  if (!id) return '';
  return org.depts.find((d) => d.id === id)?.name || i18nT('未知部门');
}

/** 任务视图：带好显示用的名字和逾期标记 */
export function taskView(t: MmTask, s: Pick<TodoInput, 'org' | 'projects' | 'meetings'>, now: number): MmTaskView {
  return {
    ...t,
    overdue: isTaskOverdue(t, now),
    overdueDays: taskOverdueDays(t, now),
    projectName: s.projects.find((p) => p.id === t.projectId)?.name || '',
    meetingTitle: s.meetings.find((m) => m.id === t.meetingId)?.title || '',
    deptName: deptName(s.org, t.deptId),
    assigneeName: personName(s.org, t.assigneeId),
    ownerName: ownerNames(s.org, taskOwners(t)),
  };
}

// ─── 待办 ─────────────────────────────────────────────────────────────

const URGENCY_ORDER: Record<MmTodo['urgency'], number> = { urgent: 0, today: 1, week: 2 };

/** 确认发言的起算时间：发出「发言待确认」的时间（被退回时更新为退回时间）；老数据没有就按处理完成时间 */
export function confirmStartAt(m: MmMeeting, personId: string): number {
  const c = m.confirmations.find((x) => x.personId === personId);
  return c?.requestedAt || c?.returnedAt || m.process?.finishedAt || m.createdAt;
}

/** 按截止日的紧急程度：逾期 → 紧急；今天到期 → 今天；其余本周 */
function dueUrgency(t: MmTask, now: number): MmTodo['urgency'] {
  if (isTaskOverdue(t, now)) return 'urgent';
  return t.due === ymd(now) ? 'today' : 'week';
}

/** 最近一次进度更新（没更新过从接收 / 下发时算） */
export function lastProgressAt(t: MmTask): number {
  const last = t.progressLog.length ? t.progressLog[t.progressLog.length - 1].at : 0;
  return last || t.acceptedAt || t.createdAt;
}

/**
 * 「待更新进度」：本人接收的未开始 / 进行中任务（不在异议处理中），且
 * 逾期、或快到期（提前 dueRemindDays 天）、或一个跟踪周期（trackCycleDays）内没更新过。
 */
export function needsProgressUpdate(t: MmTask, settings: MmSettings, now: number): boolean {
  if (t.status !== 'not_started' && t.status !== 'in_progress') return false;
  if (hasOpenObjection(t)) return false;
  if (isTaskOverdue(t, now)) return true;
  if (isYmd(t.due) && daysBetweenYmd(ymd(now), t.due) <= Math.max(0, settings.dueRemindDays)) return true;
  return now - lastProgressAt(t) >= Math.max(1, settings.trackCycleDays) * DAY_MS;
}

/** 当前身份的全部待办（归档项目里的不算），按紧急程度、再按时间先后排 */
export function computeTodos(s: TodoInput, personId: string | null, now: number): MmTodo[] {
  if (!personId) return [];
  const todos: MmTodo[] = [];
  const projectOf = (id: string): MmProject | undefined => s.projects.find((p) => p.id === id);
  const live = (projectId: string): boolean => { const p = projectOf(projectId); return !!p && p.status !== 'archived'; };
  const pname = (projectId: string): string => projectOf(projectId)?.name || '';
  const timeoutMs = Math.max(1, s.settings.confirmTimeoutHours) * HOUR_MS;

  for (const m of s.meetings) {
    if (!live(m.projectId)) continue;
    const base = { at: m.time, group: 'meeting' as const };
    const isHost = m.hostId === personId;
    if (isHost && m.status === 'failed') {
      todos.push({ ...base, id: `retry_process:${m.id}`, type: 'retry_process', title: m.title,
        subtitle: i18nT('{p0} · 处理失败：{p1}', { p0: pname(m.projectId), p1: m.process?.error || i18nT('原因未知') }),
        urgency: 'week', hint: waitedHint(m.process?.finishedAt, now), link: { kind: 'meeting', id: m.id }, at: m.process?.finishedAt || m.time });
    }
    if (isHost && m.status === 'pending_assign') {
      const n = m.speakers.filter((x) => !x.personId).length;
      todos.push({ ...base, id: `assign_speaker:${m.id}`, type: 'assign_speaker', title: m.title,
        subtitle: i18nT('{p0} · 有 {n} 位发言人没有识别出来，请指认', { p0: pname(m.projectId), n }),
        urgency: 'week', hint: waitedHint(m.process?.finishedAt, now), link: { kind: 'meeting', id: m.id }, at: m.process?.finishedAt || m.time });
    }
    if (m.status === 'pending_confirm') {
      const c = m.confirmations.find((x) => x.personId === personId && x.status === 'pending');
      if (c) {
        const start = confirmStartAt(m, personId);
        const deadline = start + timeoutMs;
        const urgency: MmTodo['urgency'] = deadline <= endOfDay(now) ? 'today' : 'week';
        todos.push({ ...base, id: `confirm_speech:${m.id}`, type: 'confirm_speech', title: m.title,
          subtitle: c.returnedAt
            ? i18nT('{p0} · 主持人退回了你的发言：{p1}', { p0: pname(m.projectId), p1: c.returnNote || i18nT('请重新核对') })
            : i18nT('{p0} · 请核对并确认你的发言', { p0: pname(m.projectId) }),
          urgency, hint: deadline > now ? remainHint(deadline, now) : waitedHint(start, now), link: { kind: 'meeting', id: m.id }, at: start });
      }
    }
    if (isHost && m.status === 'pending_review') {
      const since = m.reviewStartedAt || m.time;
      todos.push({ ...base, id: `review_minutes:${m.id}`, type: 'review_minutes', title: m.title,
        subtitle: i18nT('{p0} · 发言人已全部确认，待你终审', { p0: pname(m.projectId) }),
        urgency: now - since >= timeoutMs ? 'today' : 'week', hint: waitedHint(since, now), link: { kind: 'meeting', id: m.id }, at: since });
    }
    if (isHost && m.status === 'finalized' && !m.taskDecision) {
      todos.push({ ...base, id: `decide_tasks:${m.id}`, type: 'decide_tasks', title: m.title,
        subtitle: i18nT('{p0} · 纪要已定稿，请选择是否生成任务', { p0: pname(m.projectId) }),
        urgency: 'week', hint: waitedHint(m.finalizedAt, now), link: { kind: 'meeting', id: m.id }, at: m.finalizedAt || m.time });
    }
    if (isHost && m.status === 'pending_owner') {
      todos.push({ ...base, id: `assign_owner:${m.id}`, type: 'assign_owner', title: m.title,
        subtitle: i18nT('{p0} · AI 已生成执行方案（{n} 项任务），请指定任务负责人', { p0: pname(m.projectId), n: m.plan?.items.length || 0 }),
        urgency: 'week', hint: waitedHint(m.plan?.generatedAt, now), link: { kind: 'meeting_plan', id: m.id }, at: m.plan?.generatedAt || m.time });
    }
    if (m.status === 'plan_confirm' && m.plan && planOwners(m.plan).includes(personId)) {
      todos.push({ ...base, id: `confirm_plan:${m.id}`, type: 'confirm_plan', title: m.title,
        subtitle: i18nT('{p0} · {n} 项任务待你确认后下发', { p0: pname(m.projectId), n: m.plan.items.length }),
        urgency: 'week', hint: waitedHint(m.plan.generatedAt, now), link: { kind: 'meeting_plan', id: m.id }, at: m.plan.generatedAt || m.time });
    }
  }

  for (const t of s.tasks) {
    if (!live(t.projectId)) continue;
    const project = projectOf(t.projectId)!;
    const link = { kind: 'task' as const, id: t.id };
    const o = t.objection && t.objection.stage !== 'resolved' ? t.objection : undefined;
    if (t.assigneeId === personId && t.status === 'to_accept' && !o) {
      const since = [...t.events].reverse().find((e) => e.action === 'review_adopt')?.at || t.createdAt;
      todos.push({ id: `accept_task:${t.id}`, type: 'accept_task', title: t.title,
        subtitle: i18nT('{p0} · 截止 {p1}', { p0: project.name, p1: t.due }),
        urgency: t.due <= ymd(now) ? 'today' : 'week', hint: waitedHint(since, now), link, at: since, group: 'task' });
    }
    if (t.assigneeId === personId && needsProgressUpdate(t, s.settings, now)) {
      const overdue = isTaskOverdue(t, now);
      todos.push({ id: `update_progress:${t.id}`, type: 'update_progress', title: t.title,
        subtitle: overdue
          ? i18nT('{p0} · 截止 {p1} 已逾期，请更新进度', { p0: project.name, p1: t.due })
          : i18nT('{p0} · 截止 {p1} · 当前进度 {n}%', { p0: project.name, p1: t.due, n: t.percent }),
        urgency: dueUrgency(t, now), hint: dueHint(t.due, now), link, at: isYmd(t.due) ? ymdStart(t.due) : t.createdAt, group: 'task' });
    }
    if (!o) continue;
    if (o.stage === 'review' && taskOwners(t).includes(personId)) {
      todos.push({ id: `review_objection:${t.id}`, type: 'review_objection', title: t.title,
        subtitle: o.kind === 'change'
          ? i18nT('{p0}申请变更：{p1}', { p0: personName(s.org, o.raisedBy), p1: o.reason })
          : i18nT('{p0}提出异议：{p1}', { p0: personName(s.org, o.raisedBy), p1: o.reason }),
        urgency: isTaskOverdue(t, now) ? 'urgent' : 'week', hint: waitedHint(o.raisedAt, now), link, at: o.raisedAt, group: 'task' });
    }
    if (o.stage === 'dept_reply' && t.assigneeId === personId) {
      todos.push({ id: `dept_reply:${t.id}`, type: 'dept_reply', title: t.title,
        subtitle: i18nT('{p0}驳回了你的异议，请选择接受驳回或提交裁决', { p0: personName(s.org, o.review?.by || t.ownerId) }),
        urgency: isTaskOverdue(t, now) ? 'urgent' : 'week', hint: waitedHint(o.review?.at || o.raisedAt, now), link, at: o.review?.at || o.raisedAt, group: 'task' });
    }
    if (o.stage === 'arbitration' && project.ownerId === personId) {
      const since = [...t.events].reverse().find((e) => e.action === 'escalated')?.at || o.review?.at || o.raisedAt;
      todos.push({ id: `arbitrate:${t.id}`, type: 'arbitrate', title: t.title,
        subtitle: o.suggestedDue
          ? i18nT('{p0}与{p1}对截止日有分歧（{p2} / {p3}）', { p0: personName(s.org, t.assigneeId), p1: ownerNames(s.org, taskOwners(t)), p2: t.due, p3: o.suggestedDue })
          : i18nT('{p0}与{p1}对任务有分歧，待你裁决', { p0: personName(s.org, t.assigneeId), p1: ownerNames(s.org, taskOwners(t)) }),
        urgency: 'urgent', hint: waitedHint(since, now), link, at: since, group: 'task' });
    }
  }

  for (const p of s.projects) {
    if (p.status === 'closing' && p.ownerId === personId && p.summary && !p.summary.approvedAt) {
      todos.push({ id: `review_report:${p.id}`, type: 'review_report', title: p.name,
        subtitle: i18nT('AI 已生成项目总结报告，待你审核后归档'),
        urgency: 'week', hint: waitedHint(p.summary.generatedAt, now), link: { kind: 'project_summary', id: p.id }, at: p.summary.generatedAt, group: 'project' });
    }
  }

  return todos.sort((a, b) => URGENCY_ORDER[a.urgency] - URGENCY_ORDER[b.urgency] || a.at - b.at);
}

/** 侧栏角标：首页 = 全部待办；会议 / 任务 = 各自分组的待办 */
export function todoBadges(todos: MmTodo[]): { home: number; meetings: number; tasks: number } {
  return {
    home: todos.length,
    meetings: todos.filter((t) => t.group === 'meeting').length,
    tasks: todos.filter((t) => t.group === 'task').length,
  };
}

const ACTIVE_FOR_ME = (t: MmTask): boolean => t.status === 'to_accept' || t.status === 'not_started' || t.status === 'in_progress';

/** 我接收的任务里：本周截止（未逾期）/ 已逾期 */
export function myTaskReminders(s: Pick<TodoInput, 'org' | 'projects' | 'meetings' | 'tasks'>, personId: string | null, now: number): { dueThisWeek: MmTaskView[]; overdue: MmTaskView[] } {
  if (!personId) return { dueThisWeek: [], overdue: [] };
  const week = weekRange(now);
  const today = ymd(now);
  const mine = s.tasks.filter((t) => t.assigneeId === personId && ACTIVE_FOR_ME(t) && s.projects.find((p) => p.id === t.projectId)?.status !== 'archived');
  const byDue = (a: MmTask, b: MmTask): number => a.due.localeCompare(b.due);
  return {
    dueThisWeek: mine.filter((t) => !isTaskOverdue(t, now) && t.due >= today && t.due <= week.toYmd).sort(byDue).map((t) => taskView(t, s, now)),
    overdue: mine.filter((t) => isTaskOverdue(t, now)).sort(byDue).map((t) => taskView(t, s, now)),
  };
}

/** 首页的「我的本周任务」：本周截止的 + 已逾期的，按截止日排 */
export function myTasksThisWeek(s: Pick<TodoInput, 'org' | 'projects' | 'meetings' | 'tasks'>, personId: string | null, now: number): MmTaskView[] {
  const r = myTaskReminders(s, personId, now);
  return [...r.overdue, ...r.dueThisWeek];
}

/** 首页计数：待办数、今天到期、已逾期（我接收的）、未读通知 */
export function homeCounts(todos: MmTodo[], s: Pick<TodoInput, 'tasks' | 'projects'>, personId: string | null, unread: number, now: number): { todos: number; dueToday: number; overdue: number; unread: number } {
  const today = ymd(now);
  const mine = personId ? s.tasks.filter((t) => t.assigneeId === personId && ACTIVE_FOR_ME(t) && s.projects.find((p) => p.id === t.projectId)?.status !== 'archived') : [];
  return {
    todos: todos.length,
    dueToday: mine.filter((t) => t.due === today).length,
    overdue: mine.filter((t) => isTaskOverdue(t, now)).length,
    unread,
  };
}
