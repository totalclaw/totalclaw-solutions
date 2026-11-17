/**
 * 会议智能管理 · 任务 / 项目 / 系统设置三页的纯逻辑（分组、状态色、文案、导航解析、分页）。
 * 只依赖契约类型与 shared.ts 的标签，不碰界面；单测见 pagesLogic.test.ts。
 */
import type {
  MmCloseCheckItem, MmLink, MmObjection, MmProjectStatus, MmTaskEvent, MmTaskView,
} from '../../../shared/meetingMgmt/types';
import { t as i18nT } from '../../i18n';
import { TASK_STATUS_LABEL, objectionLabel } from './shared';

export type Tone = 'bad' | 'warn' | 'brand' | 'ok' | 'muted' | '';

/** 异议还在处理中（有 objection 且没结束） */
export function hasOpenObjection(t: Pick<MmTaskView, 'objection'>): boolean {
  return !!t.objection && t.objection.stage !== 'resolved';
}

/** 列表里的短状态（原型：待裁决 / 待接收 / 进行中） */
export function taskShortStatus(t: Pick<MmTaskView, 'status' | 'objection'>): string {
  if (hasOpenObjection(t)) {
    const st = t.objection!.stage;
    if (st === 'review') return i18nT('待复核');
    if (st === 'dept_reply') return i18nT('待部门回应');
    if (st === 'arbitration') return i18nT('待裁决');
  }
  return TASK_STATUS_LABEL[t.status] ?? t.status;
}

/** 详情抽屉顶部的完整状态（原型：「异议处理中 · 待裁决」） */
export function taskLongStatus(t: Pick<MmTaskView, 'status' | 'objection'>): string {
  return hasOpenObjection(t) ? objectionLabel(t.objection) : (TASK_STATUS_LABEL[t.status] ?? t.status);
}

export function taskTone(t: Pick<MmTaskView, 'status' | 'objection'>): Tone {
  if (hasOpenObjection(t)) return 'bad';
  switch (t.status) {
    case 'to_accept': return 'warn';
    case 'in_progress': return 'brand';
    case 'done': return 'ok';
    case 'cancelled': return 'muted';
    default: return '';
  }
}

/** 状态分组：需要处理（待接收 / 异议处理中）、进行中（未开始 / 进行中）、已完成（已完成 / 已取消） */
export type TaskBucket = 'action' | 'doing' | 'done';
export function taskBucket(t: Pick<MmTaskView, 'status' | 'objection'>): TaskBucket {
  if (t.status === 'done' || t.status === 'cancelled') return 'done';
  if (t.status === 'to_accept' || hasOpenObjection(t)) return 'action';
  return 'doing';
}

export type TaskGroupBy = 'status' | 'project' | 'dept';

export interface TaskGroup {
  key: string;
  title: string;
  tasks: MmTaskView[];
  /** 默认收起（已完成） */
  collapsedByDefault: boolean;
}

/** 组内排序：没结束的在前；逾期在前；截止日早的在前 */
export function sortTasks(list: MmTaskView[]): MmTaskView[] {
  const finished = (t: MmTaskView) => (t.status === 'done' || t.status === 'cancelled' ? 1 : 0);
  return [...list].sort((a, b) =>
    finished(a) - finished(b)
    || Number(!!b.overdue) - Number(!!a.overdue)
    || String(a.due || '9999').localeCompare(String(b.due || '9999'))
    || String(a.title).localeCompare(String(b.title)));
}

export function groupTasks(tasks: MmTaskView[], by: TaskGroupBy): TaskGroup[] {
  if (by === 'status') {
    const defs: Array<{ key: TaskBucket; title: string }> = [
      { key: 'action', title: i18nT('需要处理') },
      { key: 'doing', title: i18nT('进行中') },
      { key: 'done', title: i18nT('已完成') },
    ];
    return defs
      .map((d) => ({ key: d.key, title: d.title, tasks: sortTasks(tasks.filter((t) => taskBucket(t) === d.key)), collapsedByDefault: d.key === 'done' }))
      .filter((g) => g.tasks.length > 0);
  }
  const map = new Map<string, { title: string; tasks: MmTaskView[] }>();
  for (const t of tasks) {
    const key = by === 'project' ? t.projectId : t.deptId;
    const title = (by === 'project' ? t.projectName : t.deptName) || i18nT('未分类');
    const g = map.get(key) ?? { title, tasks: [] };
    g.tasks.push(t);
    map.set(key, g);
  }
  return [...map.entries()]
    .map(([key, g]) => ({ key, title: g.title, tasks: sortTasks(g.tasks), collapsedByDefault: false }))
    .sort((a, b) => a.title.localeCompare(b.title, 'zh-CN'));
}

/** 关键字过滤：标题、来源会议、部门、部门负责人、任务负责人、项目 */
export function filterTasks(tasks: MmTaskView[], q: string): MmTaskView[] {
  const k = q.trim().toLowerCase();
  if (!k) return tasks;
  return tasks.filter((t) => [t.title, t.meetingTitle, t.deptName, t.assigneeName, t.ownerName, t.projectName, t.standard]
    .some((x) => String(x || '').toLowerCase().includes(k)));
}

/** 百分比（契约里 rate / completionRate / weekRate 都是 0~100）→ 0~100 整数 */
export function pct(n: unknown): number {
  const v = Number(n);
  if (!Number.isFinite(v)) return 0;
  return Math.max(0, Math.min(100, Math.round(v)));
}

export function ratioPct(done: number, total: number): number {
  return total > 0 ? pct((done / total) * 100) : 0;
}

// ── 时间 ─────────────────────────────────────────────

const p2 = (n: number) => String(n).padStart(2, '0');

/** 毫秒 → 'YYYY-MM-DD HH:mm'（seconds=true 时带秒） */
export function fmtMs(ms: number | undefined, seconds = false): string {
  if (!ms) return '—';
  const d = new Date(ms);
  const base = `${d.getFullYear()}-${p2(d.getMonth() + 1)}-${p2(d.getDate())} ${p2(d.getHours())}:${p2(d.getMinutes())}`;
  return seconds ? `${base}:${p2(d.getSeconds())}` : base;
}

/** 毫秒 → 'MM-DD HH:mm'（时间线用） */
export function fmtMdHm(ms: number | undefined): string {
  if (!ms) return '';
  const d = new Date(ms);
  return `${p2(d.getMonth() + 1)}-${p2(d.getDate())} ${p2(d.getHours())}:${p2(d.getMinutes())}`;
}

/** 毫秒 → 'MM-DD' */
export function fmtMd(ms: number | undefined): string {
  if (!ms) return '';
  const d = new Date(ms);
  return `${p2(d.getMonth() + 1)}-${p2(d.getDate())}`;
}

/** 'YYYY-MM-DD'（本地日期，给 <input type="date"> 默认值） */
export function todayIso(now = Date.now()): string {
  const d = new Date(now);
  return `${d.getFullYear()}-${p2(d.getMonth() + 1)}-${p2(d.getDate())}`;
}


// ── 名字 ─────────────────────────────────────────────

export type NameMap = Record<string, string | { name: string; deptName?: string }>;

export function nameOf(names: NameMap | undefined, id: string | undefined, fallback = ''): string {
  if (!id) return fallback;
  const v = names?.[id];
  if (!v) return fallback || id;
  return typeof v === 'string' ? v : v.name || fallback || id;
}

// ── 任务事件 / 异议 ───────────────────────────────────

/** 属于「变更记录」的事件（异议、复核、回应、裁决、调整、删除） */
export const CHANGE_ACTIONS = new Set([
  'objection_raised', 'review_adopt', 'review_reject', 'reply_accept', 'escalated',
  'arbitrate_keep', 'arbitrate_adjust', 'cancelled', 'adjusted',
]);

export function eventText(ev: Pick<MmTaskEvent, 'action'>): string {
  switch (ev.action) {
    case 'created': return i18nT('任务已下发');
    case 'accepted': return i18nT('接收了任务');
    case 'progress': return i18nT('更新了进度');
    case 'done': return i18nT('标记完成');
    case 'objection_raised': return i18nT('提出异议');
    case 'review_adopt': return i18nT('复核：采纳并调整');
    case 'review_reject': return i18nT('复核：驳回');
    case 'reply_accept': return i18nT('接受驳回');
    case 'escalated': return i18nT('不接受驳回，提交裁决');
    case 'arbitrate_keep': return i18nT('裁决：维持原方案');
    case 'arbitrate_adjust': return i18nT('裁决：按异议调整');
    case 'cancelled': return i18nT('删除了该任务');
    case 'adjusted': return i18nT('调整了任务');
    default: return ev.action;
  }
}

/** 变更记录时间线：新的在前 */
export function changeLog(events: MmTaskEvent[] | undefined): MmTaskEvent[] {
  return (events ?? []).filter((e) => CHANGE_ACTIONS.has(e.action)).sort((a, b) => b.at - a.at);
}

export function outcomeLabel(o: MmObjection['outcome']): string {
  switch (o) {
    case 'adopted': return i18nT('已采纳并调整');
    case 'accepted_reject': return i18nT('部门接受驳回');
    case 'kept': return i18nT('裁决维持原方案');
    case 'adjusted': return i18nT('裁决按异议调整');
    case 'cancelled': return i18nT('任务已删除');
    default: return i18nT('已结束');
  }
}

export interface TaskChangesForm { title: string; standard: string; due: string }

/** 只把改了的字段放进 changes；一项都没改返回 undefined */
export function buildChanges(form: TaskChangesForm, task: Pick<MmTaskView, 'title' | 'standard' | 'due'>): { title?: string; standard?: string; due?: string } | undefined {
  const out: { title?: string; standard?: string; due?: string } = {};
  const title = form.title.trim();
  const standard = form.standard.trim();
  const due = form.due.trim();
  if (title && title !== task.title) out.title = title;
  if (standard && standard !== task.standard) out.standard = standard;
  if (due && due !== task.due) out.due = due;
  return Object.keys(out).length ? out : undefined;
}

/** 调整表单的初值：按异议建议的截止日预填 */
export function initialChanges(task: Pick<MmTaskView, 'title' | 'standard' | 'due' | 'objection'>): TaskChangesForm {
  return { title: task.title, standard: task.standard, due: task.objection?.suggestedDue || task.due };
}

export interface TaskCan {
  accept?: boolean; object?: boolean; progress?: boolean; complete?: boolean; change?: boolean;
  review?: boolean; reply?: boolean; escalate?: boolean; arbitrate?: boolean;
}

/** 打开抽屉时默认落在哪个页签：轮到我处理异议 / 有处理中的异议 → 「异议与变更」 */
export function defaultDrawerTab(task: Pick<MmTaskView, 'objection'>, can: TaskCan | undefined): 'detail' | 'progress' | 'objection' {
  if (can?.review || can?.reply || can?.escalate || can?.arbitrate || hasOpenObjection(task)) return 'objection';
  return 'detail';
}

/**
 * 当前身份在这个任务上的角色（顶部身份胶囊显示用）。
 * 轮到谁处理就显示谁（裁决 → 项目负责人、复核 → 任务负责人、接收 / 进度 / 回应 → 部门负责人），
 * 否则按 部门负责人 → 任务负责人 → 项目负责人 → 项目成员 的顺序。
 */
export function taskRole(
  task: Pick<MmTaskView, 'assigneeId' | 'ownerId' | 'ownerIds'>,
  meId: string | undefined,
  projectOwnerId?: string,
  can: TaskCan = {},
): string {
  if (!meId) return '';
  if (can.arbitrate) return i18nT('项目负责人');
  if (can.review) return i18nT('任务负责人');
  if (can.accept || can.object || can.progress || can.complete || can.change || can.reply || can.escalate) return i18nT('部门负责人');
  if (task.assigneeId === meId) return i18nT('部门负责人');
  if ((task.ownerIds?.length ? task.ownerIds : [task.ownerId]).includes(meId)) return i18nT('任务负责人');
  if (projectOwnerId && projectOwnerId === meId) return i18nT('项目负责人');
  return i18nT('项目成员');
}

// ── 项目 ─────────────────────────────────────────────

/** 当前身份在这个项目上的角色 */
export function projectRole(p: { ownerId: string; memberIds: string[] } | null | undefined, meId: string | undefined): string {
  if (!p || !meId) return '';
  if (p.ownerId === meId) return i18nT('项目负责人');
  return p.memberIds.includes(meId) ? i18nT('项目成员') : '';
}

export const PROJECT_STEPS: MmProjectStatus[] = ['active', 'closing', 'archived'];
export function projectStepIndex(s: MmProjectStatus): number {
  const i = PROJECT_STEPS.indexOf(s);
  return i < 0 ? 0 : i;
}

export function projectTone(s: MmProjectStatus): Tone {
  return s === 'active' ? 'brand' : s === 'closing' ? 'warn' : 'muted';
}

/**
 * 结项前需处理的一条：标签、颜色、按钮文字、跳转。
 * 异议已到裁决阶段、且看的人是项目负责人（canArbitrate）时按钮写「去裁决」（原型）。
 */
export function blockerView(
  item: MmCloseCheckItem,
  tasks: Array<Pick<MmTaskView, 'id' | 'overdue'> & { objection?: MmTaskView['objection'] }> = [],
  opts: { canArbitrate?: boolean } = {},
): { chip: string; tone: Tone; action: string; link: MmLink } {
  if (item.kind === 'objection') {
    const stage = tasks.find((t) => t.id === item.id)?.objection?.stage;
    const action = stage === 'arbitration' && opts.canArbitrate ? i18nT('去裁决') : i18nT('去处理');
    return { chip: i18nT('异议'), tone: 'warn', action, link: { kind: 'task', id: item.id } };
  }
  if (item.kind === 'meeting') return { chip: i18nT('会议'), tone: 'brand', action: i18nT('查看'), link: { kind: 'meeting', id: item.id } };
  const overdue = tasks.find((t) => t.id === item.id)?.overdue;
  return { chip: overdue ? i18nT('逾期') : i18nT('未完成'), tone: overdue ? 'bad' : '', action: i18nT('查看'), link: { kind: 'task', id: item.id } };
}

export type ProjectTabKey = 'overview' | 'meetings' | 'tasks' | 'reports' | 'summary';

/** 结项检查清单去重：同一任务既「未完成」又「异议处理中」时只留异议那条（原型每个任务一行） */
export function dedupeBlockers(items: MmCloseCheckItem[] | undefined): MmCloseCheckItem[] {
  const list = items ?? [];
  const objectionIds = new Set(list.filter((i) => i.kind === 'objection').map((i) => i.id));
  return list.filter((i) => !(i.kind === 'task' && objectionIds.has(i.id)));
}

/** 首页 / 通知点进来的项目类链接 → 要打开的项目、页签、报告 */
export interface ProjectNavTarget {
  projectId?: string;
  reportId?: string;
  tab: ProjectTabKey;
}
export function resolveProjectLink(link: MmLink | undefined): ProjectNavTarget | null {
  if (!link) return null;
  if (link.kind === 'project') return { projectId: link.id, tab: 'overview' };
  if (link.kind === 'project_summary') return { projectId: link.id, tab: 'summary' };
  if (link.kind === 'report') {
    // 约定 { kind:'report', id: 项目 id, anchor: 报告 id }；只给了 id 时它可能是项目 id，也可能是报告 id，由调用方再查
    return link.anchor ? { projectId: link.id, reportId: link.anchor, tab: 'reports' } : { projectId: link.id, reportId: link.id, tab: 'reports' };
  }
  return null;
}

// ── 列表通用 ─────────────────────────────────────────

export function paginate<T>(list: T[], page: number, size: number): { rows: T[]; page: number; pages: number } {
  const pages = Math.max(1, Math.ceil(list.length / size));
  const p = Math.min(Math.max(1, page), pages);
  return { rows: list.slice((p - 1) * size, p * size), page: p, pages };
}

/** 动作返回的链接可能是字符串，也可能是 { url } */
export function pickUrl(r: unknown): string {
  if (typeof r === 'string') return r;
  if (r && typeof r === 'object') {
    const o = r as Record<string, unknown>;
    for (const k of ['url', 'link', 'href']) if (typeof o[k] === 'string') return o[k] as string;
  }
  return '';
}

/** 人员按关键字过滤（姓名 / 部门名 / 职务） */
export function matchPerson(p: { name: string; title?: string }, deptName: string, q: string): boolean {
  const k = q.trim().toLowerCase();
  if (!k) return true;
  return [p.name, p.title, deptName].some((x) => String(x || '').toLowerCase().includes(k));
}

// ── 浏览器小工具（非纯函数，放这里给几个设置面板共用）────────────

/** 复制到剪贴板：优先走主进程（窗口没聚焦时 navigator.clipboard 会拒绝） */
export async function copyText(text: string): Promise<boolean> {
  const api = (window as any).electronAPI;
  try {
    if (api?.writeClipboardText) {
      const r = await api.writeClipboardText(text);
      if (!r || r.ok !== false) return true;
    }
  } catch { /* 回落浏览器剪贴板 */ }
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

/** <input type=file> 选中的文件 → 本机路径（Electron 32+ 没有 file.path） */
export function filePath(file: File | undefined | null): string {
  if (!file) return '';
  const get = (window as any).electronAPI?.getPathForFile as ((f: File) => string) | undefined;
  try {
    return (get ? get(file) : (file as any).path) || '';
  } catch {
    return '';
  }
}
