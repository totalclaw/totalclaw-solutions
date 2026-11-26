/**
 * 会议智能管理 · 状态机与业务规则（纯函数，不碰磁盘、不发通知）。
 * 严格照需求第七章（docs/meeting-mgmt-workbench.md 1.4）：
 *   项目：进行中 →（结项检查通过）结项中 →（审核通过）已归档；已归档全部只读、不能重新激活。
 *   纪要：待上传 → 处理中 →（失败 / 重试）→ 待指认 / 待确认 → 待终审 →（退回某发言人：只那人回到未确认）
 *         → 已定稿 →「无需」已结束 /「生成任务」待指定负责人 → 方案待确认 → 已派发。
 *   任务：待接收 → 未开始 → 进行中 → 已完成；异议四条支路；已取消是终态。逾期是标记不是状态。
 *
 * 约定：函数直接改传入的对象（调用方在 store.update 里调用，抛错时 store 会回滚）；
 * 越权或非法流转一律抛中文错误（i18nT）。
 */
import { t as i18nT } from '@totalclaw/i18n';
import type {
  MmCloseCheckItem, MmDecision, MmDept, MmMeeting, MmMeetingFile, MmMeetingStatus, MmObjection, MmOrg, MmPerson, MmPlan, MmPlanItem,
  MmProject, MmSegment, MmSpeakerSlot, MmTask, MmTaskStatus, MmTopic,
} from '../../../shared/meetingMgmt/types';

export const DAY_MS = 86_400_000;
export const HOUR_MS = 3_600_000;

function fail(msg: string): never {
  throw new Error(msg);
}

// ─── 日期（截止日一律本地日期 'YYYY-MM-DD'）────────────────────────────

const pad = (n: number): string => String(n).padStart(2, '0');

export function ymd(ms: number): string {
  const d = new Date(ms);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function isYmd(s: unknown): s is string {
  if (typeof s !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(s)) return false;
  const [y, m, d] = s.split('-').map(Number);
  const dt = new Date(y, m - 1, d);
  return dt.getFullYear() === y && dt.getMonth() === m - 1 && dt.getDate() === d;
}

/** 'YYYY-MM-DD' 当天 0 点（本地） */
export function ymdStart(s: string): number {
  const [y, m, d] = s.split('-').map(Number);
  return new Date(y, m - 1, d).getTime();
}

export function addDaysYmd(s: string, n: number): string {
  const [y, m, d] = s.split('-').map(Number);
  return ymd(new Date(y, m - 1, d + n).getTime());
}

/** b - a 的天数（按日历日，跨夏令时也准） */
export function daysBetweenYmd(a: string, b: string): number {
  const [ya, ma, da] = a.split('-').map(Number);
  const [yb, mb, db] = b.split('-').map(Number);
  return Math.round((Date.UTC(yb, mb - 1, db) - Date.UTC(ya, ma - 1, da)) / DAY_MS);
}

/** 本周（周一 0 点 ~ 下周一 0 点） */
export function weekRange(now: number): { from: number; to: number; fromYmd: string; toYmd: string } {
  const d = new Date(now);
  const monday = new Date(d.getFullYear(), d.getMonth(), d.getDate() - ((d.getDay() + 6) % 7));
  const next = new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + 7);
  return { from: monday.getTime(), to: next.getTime(), fromYmd: ymd(monday.getTime()), toYmd: ymd(next.getTime() - 1) };
}

/** 今天 24 点 */
export function endOfDay(now: number): number {
  const d = new Date(now);
  return new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1).getTime();
}

// ─── 标签（错误提示、结项检查里要用）──────────────────────────────────

export function meetingStatusLabel(s: MmMeetingStatus): string {
  switch (s) {
    case 'pending_upload': return i18nT('待上传');
    case 'processing': return i18nT('处理中');
    case 'failed': return i18nT('处理失败');
    case 'pending_assign': return i18nT('待指认');
    case 'pending_confirm': return i18nT('待确认');
    case 'pending_review': return i18nT('待终审');
    case 'finalized': return i18nT('已定稿');
    case 'ended': return i18nT('已结束');
    case 'pending_owner': return i18nT('待指定负责人');
    case 'plan_confirm': return i18nT('方案待确认');
    case 'dispatched': return i18nT('已派发');
    default: return String(s);
  }
}

export function taskStatusLabel(s: MmTaskStatus): string {
  switch (s) {
    case 'to_accept': return i18nT('待接收');
    case 'not_started': return i18nT('未开始');
    case 'in_progress': return i18nT('进行中');
    case 'done': return i18nT('已完成');
    case 'cancelled': return i18nT('已取消');
    default: return String(s);
  }
}

// ─── 组织 ─────────────────────────────────────────────────────────────

export function activePerson(org: MmOrg, id: string | null | undefined): MmPerson | null {
  if (!id) return null;
  const p = org.people.find((x) => x.id === id);
  return p && !p.left ? p : null;
}

export function requireActivePerson(org: MmOrg, id: string | null | undefined, what = i18nT('人员')): MmPerson {
  const p = activePerson(org, id);
  if (!p) fail(i18nT('{p0}不在组织里或已离职', { p0: what }));
  return p;
}

/**
 * 部门在通讯录里的第一位负责人（企微 department_leader 的第一个）：任务下发给他。
 * 只认第一位：第一位不在同步范围（企微应用可见范围之外）或已离职时返回 null，不悄悄换成第二位（需求风险 G）。
 */
export function firstLeader(org: MmOrg, deptId: string): MmPerson | null {
  const dept = org.depts.find((d) => d.id === deptId);
  if (!dept || !dept.leaderIds.length) return null;
  return activePerson(org, dept.leaderIds[0]);
}

/** 部门第一负责人不可用的原因（可用返回 null） */
export function leaderProblem(org: MmOrg, deptId: string): string | null {
  const dept = org.depts.find((d) => d.id === deptId);
  if (!dept) return i18nT('责任部门不在组织里');
  if (!dept.leaderIds.length) return i18nT('部门「{p0}」在通讯录里没有设置负责人，无法下发', { p0: dept.name });
  const p = org.people.find((x) => x.id === dept.leaderIds[0]);
  if (!p) return i18nT('部门「{p0}」的第一负责人不在通讯录同步范围内（企微应用可见范围之外），无法下发；请调整可见范围或部门负责人后重新同步通讯录', { p0: dept.name });
  if (p.left) return i18nT('部门「{p0}」的第一负责人{p1}已离职，无法下发；请在企业微信里调整部门负责人后重新同步通讯录', { p0: dept.name, p1: p.name });
  return null;
}

export function deptOf(org: MmOrg, deptId: string): MmDept | undefined {
  return org.depts.find((d) => d.id === deptId);
}

// ─── 项目 ─────────────────────────────────────────────────────────────

export function assertProjectNotArchived(p: MmProject): void {
  if (p.status === 'archived') fail(i18nT('项目「{p0}」已归档，只能查看', { p0: p.name }));
}

/** 新建会议 / 生成任务前：只有进行中的项目可以 */
export function assertProjectActive(p: MmProject): void {
  assertProjectNotArchived(p);
  if (p.status === 'closing') fail(i18nT('项目「{p0}」正在结项，不能再新建会议或任务', { p0: p.name }));
}

export function assertProjectOwner(p: MmProject, actor: string, what: string): void {
  if (p.ownerId !== actor) fail(i18nT('只有项目负责人可以{p0}', { p0: what }));
}

/** 自动加入项目成员（项目负责人、主持人、参会人、任务负责人、接收任务的部门负责人） */
export function ensureMembers(p: MmProject, ids: Array<string | null | undefined>): string[] {
  const added: string[] = [];
  for (const id of ids) {
    if (!id || p.memberIds.includes(id)) continue;
    p.memberIds.push(id);
    added.push(id);
  }
  return added;
}

const MEETING_CLOSED: MmMeetingStatus[] = ['dispatched', 'ended'];
const TASK_CLOSED: MmTaskStatus[] = ['done', 'cancelled'];

export const isMeetingClosed = (m: MmMeeting): boolean => MEETING_CLOSED.includes(m.status);
export const isTaskClosed = (t: MmTask): boolean => TASK_CLOSED.includes(t.status);
export const hasOpenObjection = (t: MmTask): boolean => !!t.objection && t.objection.stage !== 'resolved';

/** 结项检查：所有会议已派发或已结束；所有任务已完成或已取消；没有处理中的异议 */
export function closeCheckItems(p: MmProject, meetings: MmMeeting[], tasks: MmTask[]): MmCloseCheckItem[] {
  const items: MmCloseCheckItem[] = [];
  for (const m of meetings) {
    if (m.projectId !== p.id || isMeetingClosed(m)) continue;
    items.push({ kind: 'meeting', id: m.id, title: m.title, reason: i18nT('会议纪要状态：{p0}', { p0: meetingStatusLabel(m.status) }) });
  }
  for (const t of tasks) {
    if (t.projectId !== p.id) continue;
    if (!isTaskClosed(t)) items.push({ kind: 'task', id: t.id, title: t.title, reason: i18nT('任务状态：{p0}', { p0: taskStatusLabel(t.status) }) });
    if (hasOpenObjection(t)) items.push({ kind: 'objection', id: t.id, title: t.title, reason: i18nT('异议处理中') });
  }
  return items;
}

/** 发起结项：检查通过进入结项中；不通过留在进行中，记下未完成事项 */
export function startClose(p: MmProject, actor: string, items: MmCloseCheckItem[], now: number): boolean {
  assertProjectNotArchived(p);
  assertProjectOwner(p, actor, i18nT('发起结项'));
  if (p.status !== 'active') fail(i18nT('项目已经在结项中'));
  const ok = items.length === 0;
  p.closeCheck = { at: now, ok, items };
  if (ok) p.status = 'closing';
  return ok;
}

/** 审核通过总结 → 已归档（只读，不能重新激活） */
export function approveSummary(p: MmProject, actor: string, now: number): void {
  assertProjectNotArchived(p);
  assertProjectOwner(p, actor, i18nT('审核总结报告'));
  if (p.status !== 'closing') fail(i18nT('项目还没有通过结项检查'));
  if (!p.summary) fail(i18nT('总结报告还没有生成好'));
  p.summary.approvedAt = now;
  p.summary.approvedBy = actor;
  p.status = 'archived';
  p.archivedAt = now;
}

export function assertSummaryEditable(p: MmProject, actor: string): void {
  assertProjectNotArchived(p);
  assertProjectOwner(p, actor, i18nT('修改总结报告'));
  if (p.status !== 'closing') fail(i18nT('项目还没有通过结项检查'));
}

/** 方案的任务负责人（多位；旧数据只有 ownerId） */
export function planOwners(plan: MmPlan | undefined | null): string[] {
  if (!plan) return [];
  const ids = Array.isArray(plan.ownerIds) && plan.ownerIds.length ? plan.ownerIds : plan.ownerId ? [plan.ownerId] : [];
  return [...new Set(ids.filter(Boolean))];
}

/** 任务的任务负责人（多位；旧数据只有 ownerId） */
export function taskOwners(t: Pick<MmTask, 'ownerId' | 'ownerIds'>): string[] {
  const ids = Array.isArray(t.ownerIds) && t.ownerIds.length ? t.ownerIds : t.ownerId ? [t.ownerId] : [];
  return [...new Set(ids.filter(Boolean))];
}

/** 某人在本项目里还没完成的事项（有就不能移除） */
export function memberOpenItems(personId: string, p: MmProject, meetings: MmMeeting[], tasks: MmTask[]): string[] {
  const out: string[] = [];
  for (const m of meetings) {
    if (m.projectId !== p.id || isMeetingClosed(m)) continue;
    if (m.hostId === personId) out.push(m.title);
    else if (m.confirmations.some((c) => c.personId === personId && c.status === 'pending')) out.push(m.title);
    else if (planOwners(m.plan).includes(personId) && m.status === 'plan_confirm') out.push(m.title);
  }
  for (const t of tasks) {
    if (t.projectId !== p.id || isTaskClosed(t)) continue;
    if (t.assigneeId === personId || taskOwners(t).includes(personId)) out.push(t.title);
  }
  return out;
}

/** 改项目成员：负责人不能移除，有未完成事项的人不能移除 */
export function applyMembers(
  p: MmProject, actor: string, nextIds: string[], meetings: MmMeeting[], tasks: MmTask[], nameOf: (id: string) => string,
): { added: string[]; removed: string[] } {
  assertProjectNotArchived(p);
  assertProjectOwner(p, actor, i18nT('修改项目成员'));
  const next = [...new Set(nextIds.filter(Boolean))];
  if (!next.includes(p.ownerId)) next.unshift(p.ownerId);
  const removed = p.memberIds.filter((id) => !next.includes(id));
  for (const id of removed) {
    if (id === p.ownerId) fail(i18nT('项目负责人不能移除'));
    if (memberOpenItems(id, p, meetings, tasks).length) fail(i18nT('{p0}：该成员还有未完成事项', { p0: nameOf(id) }));
  }
  const added = next.filter((id) => !p.memberIds.includes(id));
  p.memberIds = next;
  return { added, removed };
}

// ─── 会议纪要 ─────────────────────────────────────────────────────────

export function assertHost(m: MmMeeting, actor: string, what: string): void {
  if (m.hostId !== actor) fail(i18nT('只有主持人可以{p0}', { p0: what }));
}

const FINALIZED_STATUSES: MmMeetingStatus[] = ['finalized', 'ended', 'pending_owner', 'plan_confirm', 'dispatched'];
export const isMinutesLocked = (m: MmMeeting): boolean => FINALIZED_STATUSES.includes(m.status);

/** lockedHint：纪要已定稿时给「已锁定」的提示（改发言 / 确认 / 指认这类动作） */
function assertMeetingStatus(m: MmMeeting, allowed: MmMeetingStatus[], what: string, lockedHint = false): void {
  if (allowed.includes(m.status)) return;
  if (lockedHint && isMinutesLocked(m)) fail(i18nT('纪要已定稿锁定，不能{p0}', { p0: what }));
  fail(i18nT('会议当前状态是「{p0}」，不能{p1}', { p0: meetingStatusLabel(m.status), p1: what }));
}

/** 上传文件 / 重试 → 处理中 */
export function startProcessing(m: MmMeeting, actor: string, now: number, opts: { retry?: boolean; reprocess?: boolean; files?: MmMeetingFile[] } = {}): void {
  assertHost(m, actor, opts.reprocess ? i18nT('重新转写') : opts.retry ? i18nT('重试处理') : i18nT('上传会议文件'));
  if (opts.reprocess) {
    // 换了更准的转写模型后重跑：定稿前都行（已确认、改过的内容会清掉，界面先确认）；定稿后纪要锁定，不重跑
    assertMeetingStatus(m, ['pending_assign', 'pending_confirm', 'pending_review', 'failed'], i18nT('重新转写'), true);
    if (!m.files.length) fail(i18nT('还没有上传会议文件'));
  } else if (opts.retry) {
    if (m.status !== 'failed') fail(i18nT('只有处理失败的会议可以重试'));
    if (!m.files.length) fail(i18nT('还没有上传会议文件'));
  } else {
    assertMeetingStatus(m, ['pending_upload', 'failed'], i18nT('上传会议文件'));
    if (!opts.files?.length) fail(i18nT('请选择要上传的会议文件'));
    m.files = opts.files;
  }
  m.status = 'processing';
  m.process = { stage: 'extract', progress: 0, startedAt: now, log: [{ at: now, text: opts.reprocess ? i18nT('重新转写（用当前的转写模型）') : opts.retry ? i18nT('重新开始处理') : i18nT('开始处理') }] };
  m.reviewStartedAt = undefined;
  m.speakers = [];
  m.segments = [];
  m.topics = [];
  m.decisions = [];
  m.summaryLines = [];
  m.confirmations = [];
}

export function failProcessing(m: MmMeeting, error: string, now: number, detail?: string): void {
  if (m.status !== 'processing') return;
  m.status = 'failed';
  const p = m.process || { stage: 'extract', progress: 0, log: [] };
  const entries = [{ at: now, text: error }];
  const extra = typeof detail === 'string' ? detail.trim() : '';
  if (extra && extra !== error.trim()) {
    entries.push({ at: now, text: i18nT('诊断详情：{p0}', { p0: extra.slice(0, 800) }) });
  }
  m.process = { ...p, error, finishedAt: now, log: [...(p.log || []), ...entries].slice(-200) };
}

export interface PipelineOutput {
  segments: MmSegment[];
  speakers: MmSpeakerSlot[];
  topics: MmTopic[];
  decisions: MmDecision[];
  summaryLines: string[];
  durationSec?: number;
}

/** 本场会议的发言人：识别 / 指认到的员工（去重，按首次出现排序） */
export function speakerPersonIds(m: MmMeeting): string[] {
  const out: string[] = [];
  for (const s of m.speakers) if (s.personId && !out.includes(s.personId)) out.push(s.personId);
  return out;
}

/** 某人在本场会议里的发言人标签 */
export function labelsOf(m: MmMeeting, personId: string): string[] {
  return m.speakers.filter((s) => s.personId === personId).map((s) => s.label);
}

/**
 * 按当前的发言人指认重建确认表：标签没变的人保留原状态；新出现或标签变了的人回到未确认。
 * 返回新进入「未确认」的人。
 */
function syncConfirmations(m: MmMeeting, before: Map<string, string>): string[] {
  const persons = speakerPersonIds(m);
  const pending: string[] = [];
  const next = persons.map((pid) => {
    const prev = m.confirmations.find((c) => c.personId === pid);
    const same = prev && before.get(pid) === labelsOf(m, pid).sort().join('|');
    if (prev && same) return prev;
    pending.push(pid);
    return { personId: pid, status: 'pending' as const };
  });
  m.confirmations = next;
  return pending;
}

function labelSnapshot(m: MmMeeting): Map<string, string> {
  const map = new Map<string, string>();
  for (const pid of speakerPersonIds(m)) map.set(pid, labelsOf(m, pid).sort().join('|'));
  return map;
}

/** 记下「发出发言待确认」的时间（超时催办从这里起算） */
function stampRequested(m: MmMeeting, personIds: string[], now: number): void {
  for (const c of m.confirmations) if (personIds.includes(c.personId) && c.status === 'pending') c.requestedAt = now;
}

const pendingIds = (m: MmMeeting): string[] => m.confirmations.filter((c) => c.status === 'pending').map((c) => c.personId);

/** 有未识别的发言人 → 待指认；否则有发言人 → 待确认；一个发言人都没有 → 直接待终审 */
function settleAfterSpeakers(m: MmMeeting, now: number): void {
  if (m.speakers.some((s) => !s.personId)) { m.status = 'pending_assign'; return; }
  if (m.confirmations.length && m.confirmations.some((c) => c.status === 'pending')) { m.status = 'pending_confirm'; return; }
  m.status = 'pending_review';
  m.reviewStartedAt = now;
}

/**
 * 流水线跑完：写入结果，进入待指认 / 待确认（/ 待终审）。
 * 返回进入「未确认」的发言人（要通知他们确认）。
 */
export function applyPipelineResult(m: MmMeeting, r: PipelineOutput, now: number): { pending: string[] } {
  if (m.status !== 'processing') fail(i18nT('会议已不在处理中，结果作废'));
  m.segments = Array.isArray(r.segments) ? r.segments : [];
  // 只保留真有发言的标签
  const used = new Set(m.segments.map((s) => s.speakerLabel));
  m.speakers = (Array.isArray(r.speakers) ? r.speakers : []).filter((s) => used.has(s.label));
  for (const label of used) if (!m.speakers.some((s) => s.label === label)) m.speakers.push({ label });
  m.topics = Array.isArray(r.topics) ? r.topics : [];
  m.decisions = Array.isArray(r.decisions) ? r.decisions : [];
  m.summaryLines = Array.isArray(r.summaryLines) ? r.summaryLines.map(String).slice(0, 3) : [];
  if (typeof r.durationSec === 'number') m.durationSec = r.durationSec;
  const p = m.process || { stage: 'done' as const, progress: 100, log: [] };
  m.process = { ...p, stage: 'done', progress: 100, finishedAt: now, error: undefined, log: [...(p.log || []), { at: now, text: i18nT('处理完成') }].slice(-200) };
  // 识别到的发言人自动算参会人
  for (const pid of speakerPersonIds(m)) if (!m.attendeeIds.includes(pid)) m.attendeeIds.push(pid);
  m.confirmations = [];
  syncConfirmations(m, new Map());
  settleAfterSpeakers(m, now);
  if ((m.status as MmMeetingStatus) !== 'pending_confirm') return { pending: [] };
  const pending = pendingIds(m);
  stampRequested(m, pending, now);
  return { pending };
}

/** 定稿前主持人都能改发言人：待指认、待确认、终审（声纹认错了在这几步都要能更正） */
const SPEAKER_EDIT_STATUSES: MmMeetingStatus[] = ['pending_assign', 'pending_confirm', 'pending_review'];

/** 改完发言人后：重排确认表、推进状态。返回要通知确认的人；终审中改了没影响任何人就留在终审（不重置终审开始时间） */
function afterSpeakerChange(m: MmMeeting, before: Map<string, string>, prevStatus: MmMeetingStatus, now: number, extraPending: string[] = []): { pending: string[] } {
  const prevReviewAt = m.reviewStartedAt;
  const newly = syncConfirmations(m, before);
  for (const pid of extraPending) {
    const c = m.confirmations.find((x) => x.personId === pid);
    if (c && c.status !== 'pending') { c.status = 'pending'; c.confirmedAt = undefined; }
    if (c && !newly.includes(pid)) newly.push(pid);
  }
  settleAfterSpeakers(m, now);
  if (prevStatus === 'pending_review' && m.status === 'pending_review') m.reviewStartedAt = prevReviewAt;
  else if (m.status !== 'pending_review') m.reviewStartedAt = undefined;
  if (m.status !== 'pending_confirm') return { pending: [] };
  // 刚指认完（待指认 → 待确认）：全体未确认的人这时才收到通知；确认中 / 终审中改：只通知受影响的人
  const pending = prevStatus === 'pending_assign' ? pendingIds(m) : newly;
  stampRequested(m, pending, now);
  return { pending };
}

/** 主持人指认 / 更正发言人（整组）；全部指认完自动进入待确认。返回新进入「未确认」的人 */
export function assignSpeaker(m: MmMeeting, actor: string, label: string, personId: string, now: number): { pending: string[] } {
  assertHost(m, actor, i18nT('指认发言人'));
  assertMeetingStatus(m, SPEAKER_EDIT_STATUSES, i18nT('指认发言人'), true);
  const slot = m.speakers.find((s) => s.label === label);
  if (!slot) fail(i18nT('没有找到发言人「{p0}」', { p0: label }));
  if (slot.personId === personId) return { pending: [] };
  const prevStatus = m.status;
  const before = labelSnapshot(m);
  slot.personId = personId;
  slot.matchedBy = 'manual';
  slot.score = undefined;
  if (!m.attendeeIds.includes(personId)) m.attendeeIds.push(personId);
  return afterSpeakerChange(m, before, prevStatus, now);
}

/**
 * 主持人把某一段发言改给另一位发言人（需求第九章：识别错了逐段改）。
 * 目标是已有的发言人标签，或某位员工（本场还没有他的标签就新开一个 S{n}）。
 * 这段原来的发言人不用重新确认；新的发言人要重新确认（多了一段话算在他名下）。
 */
export function moveSegment(m: MmMeeting, actor: string, segmentId: string, target: { label?: string; personId?: string }, now: number): { pending: string[] } {
  assertHost(m, actor, i18nT('修改这段的发言人'));
  assertMeetingStatus(m, SPEAKER_EDIT_STATUSES, i18nT('修改这段的发言人'), true);
  const seg = m.segments.find((s) => s.id === segmentId);
  if (!seg) fail(i18nT('没有找到这段发言'));
  let slot = target.label ? m.speakers.find((s) => s.label === target.label) : undefined;
  if (target.label && !slot) fail(i18nT('没有找到发言人「{p0}」', { p0: target.label }));
  if (!slot && target.personId) {
    slot = m.speakers.find((s) => s.personId === target.personId);
    if (!slot) {
      let n = m.speakers.length + 1;
      while (m.speakers.some((s) => s.label === `S${n}`)) n++;
      slot = { label: `S${n}`, personId: target.personId, matchedBy: 'manual' };
      m.speakers.push(slot);
    }
  }
  if (!slot) fail(i18nT('请选择这段的发言人'));
  if (seg.speakerLabel === slot.label) return { pending: [] };
  const prevStatus = m.status;
  const before = labelSnapshot(m);
  if (seg.originalSpeakerLabel === undefined) seg.originalSpeakerLabel = seg.speakerLabel;
  seg.speakerLabel = slot.label;
  seg.editedBy = actor;
  seg.editedAt = now;
  // 没有发言了的标签不再列为发言人
  const used = new Set(m.segments.map((s) => s.speakerLabel));
  m.speakers = m.speakers.filter((s) => used.has(s.label));
  if (slot.personId && !m.attendeeIds.includes(slot.personId)) m.attendeeIds.push(slot.personId);
  return afterSpeakerChange(m, before, prevStatus, now, slot.personId ? [slot.personId] : []);
}

/**
 * 纪要初稿里的「S3」这类识别编号换成指认后的人名（决议、摘要、议题标题）。
 * 整理时没认出的人以编号出现在模型看到的文字稿里，模型写决议时会照抄「S3 负责…」。
 * 只换 S+数字 形式的标签（文字记录里的昵称原样保留）。返回有没有改动。
 */
export function replaceSpeakerLabels(m: MmMeeting, nameOf: (personId: string) => string | undefined): boolean {
  const pairs = m.speakers
    .filter((s) => /^S\d+$/.test(s.label) && s.personId)
    .map((s) => ({ re: new RegExp(`(?<![A-Za-z0-9])${s.label}(?![0-9])`, 'g'), name: nameOf(s.personId!) || '' }))
    .filter((x) => x.name);
  if (!pairs.length) return false;
  let changed = false;
  const fix = (t: string): string => {
    let out = t;
    for (const p of pairs) out = out.replace(p.re, p.name);
    if (out !== t) changed = true;
    return out;
  };
  for (const d of m.decisions) d.text = fix(d.text);
  m.summaryLines = m.summaryLines.map(fix);
  for (const tp of m.topics) tp.title = fix(tp.title);
  return changed;
}

/** 主持人定稿前改决议事项 / 3 行摘要（AI 初稿只是草稿；决议会拆成任务、摘要进纪要卡片） */
export function saveMinutesDraft(
  m: MmMeeting, actor: string,
  input: { decisions?: Array<{ id?: string; text?: string }>; summaryLines?: string[] },
  newIdFn: () => string,
): void {
  assertHost(m, actor, i18nT('修改决议和摘要'));
  // 定稿后主持人也能修正决议和摘要的文字（已拆出的任务不跟着变）
  if (!FINALIZED_STATUSES.includes(m.status)) assertMeetingStatus(m, SPEAKER_EDIT_STATUSES, i18nT('修改决议和摘要'), true);
  if (Array.isArray(input.decisions)) {
    if (input.decisions.length > 50) fail(i18nT('决议事项最多 50 条'));
    const next: MmMeeting['decisions'] = [];
    for (const d of input.decisions) {
      const text = String(d?.text ?? '').trim();
      if (!text) continue;
      if (text.length > 500) fail(i18nT('一条决议不能超过 500 字'));
      const prev = d?.id ? m.decisions.find((x) => x.id === d.id) : undefined;
      next.push(prev ? { ...prev, text } : { id: newIdFn(), text, segmentIds: [] });
    }
    m.decisions = next;
  }
  if (Array.isArray(input.summaryLines)) {
    const lines = input.summaryLines.map((x) => String(x ?? '').trim()).filter(Boolean);
    if (lines.length > 3) fail(i18nT('摘要最多 3 行'));
    if (lines.some((l) => l.length > 200)) fail(i18nT('一行摘要不能超过 200 字'));
    m.summaryLines = lines;
  }
}

/** 定稿前能不能重新整理 / 改决议摘要（给服务层在等模型回来后复查） */
export function assertMinutesDraftEditable(m: MmMeeting, actor: string, what: string): void {
  assertHost(m, actor, what);
  assertMeetingStatus(m, SPEAKER_EDIT_STATUSES, what, true);
}

/** 发言人改本人发言（待确认、本人未确认时）；终审时主持人可改任意段 */
export function editSegment(m: MmMeeting, actor: string, segmentId: string, text: string, now: number): void {
  const seg = m.segments.find((s) => s.id === segmentId);
  if (!seg) fail(i18nT('没有找到这段发言'));
  const value = String(text ?? '').trim();
  if (!value) fail(i18nT('发言内容不能为空'));
  if (value.length > 10_000) fail(i18nT('这段发言太长了'));
  if (m.status === 'pending_review') {
    assertHost(m, actor, i18nT('在终审时修改发言'));
  } else if (FINALIZED_STATUSES.includes(m.status)) {
    // 定稿后发现错字：主持人还能修正文字（项目归档后不行，调用方已拦）；改发言人不行（会打乱已确认的人）
    assertHost(m, actor, i18nT('修改已定稿纪要'));
  } else if (m.status === 'pending_confirm') {
    // 待确认：主持人可改任意段的文字（补全转写漏的、改错字）；发言人可补全 / 改本人的段，确认过也还能改（会议还没进终审）。
    // 改过的段保留原文（originalText）并记谁改的，纪要里显示「已修改」
    if (m.hostId !== actor) {
      const owner = m.speakers.find((s) => s.label === seg.speakerLabel)?.personId;
      if (owner !== actor) fail(i18nT('只能修改本人的发言'));
    }
  } else {
    assertMeetingStatus(m, ['pending_confirm', 'pending_review'], i18nT('修改发言'), true);
  }
  if (seg.originalText === undefined && seg.text !== value) seg.originalText = seg.text;
  seg.text = value;
  seg.editedBy = actor;
  seg.editedAt = now;
}

/** 当前身份确认本人发言；全员确认后自动进入待终审 */
export function confirmSpeech(m: MmMeeting, actor: string, now: number): { allConfirmed: boolean } {
  assertMeetingStatus(m, ['pending_confirm'], i18nT('确认发言'), true);
  const c = m.confirmations.find((x) => x.personId === actor);
  if (!c) fail(i18nT('你不是这场会议的发言人'));
  if (c.status === 'confirmed') fail(i18nT('你已经确认过了'));
  c.status = 'confirmed';
  c.confirmedAt = now;
  const allConfirmed = m.confirmations.every((x) => x.status === 'confirmed');
  if (allConfirmed) { m.status = 'pending_review'; m.reviewStartedAt = now; }
  return { allConfirmed };
}

/** 终审退回某位发言人：只那人回到未确认，其他人的确认保留 */
export function returnToSpeaker(m: MmMeeting, actor: string, personId: string, note: string, now: number): void {
  assertHost(m, actor, i18nT('退回发言'));
  assertMeetingStatus(m, ['pending_review'], i18nT('退回发言'), true);
  const c = m.confirmations.find((x) => x.personId === personId);
  if (!c) fail(i18nT('这个人不是本场会议的发言人'));
  c.status = 'pending';
  c.confirmedAt = undefined;
  c.returnedAt = now;
  c.requestedAt = now;
  c.returnNote = String(note ?? '').trim().slice(0, 500);
  m.status = 'pending_confirm';
  m.reviewStartedAt = undefined;
}

/** 终审通过 → 已定稿（纪要锁定） */
export function approveMinutes(m: MmMeeting, actor: string, now: number): void {
  assertHost(m, actor, i18nT('终审纪要'));
  assertMeetingStatus(m, ['pending_review'], i18nT('终审纪要'));
  if (m.confirmations.some((c) => c.status !== 'confirmed')) fail(i18nT('还有发言人没有确认'));
  m.status = 'finalized';
  m.finalizedAt = now;
  m.finalizedBy = actor;
}

/** 定稿后的选择：无需生成任务 → 已结束；生成任务 → 先记下选择，方案生成好后 attachPlan */
export function decideTasks(m: MmMeeting, actor: string, decision: 'generate' | 'none'): void {
  assertHost(m, actor, i18nT('选择是否生成任务'));
  if (m.status !== 'finalized') fail(i18nT('会议当前状态是「{p0}」，不能{p1}', { p0: meetingStatusLabel(m.status), p1: i18nT('选择是否生成任务') }));
  if (decision !== 'generate' && decision !== 'none') fail(i18nT('请选择「生成任务」或「无需生成任务」'));
  m.taskDecision = decision;
  if (decision === 'none') m.status = 'ended';
}

/** AI 方案生成好 → 待指定任务负责人 */
export function attachPlan(m: MmMeeting, plan: MmPlan): void {
  if (m.status !== 'finalized' || m.taskDecision !== 'generate') fail(i18nT('会议状态已变化，方案作废'));
  m.plan = { ...plan, ownerId: undefined, ownerIds: undefined, confirmedAt: undefined, items: Array.isArray(plan.items) ? plan.items : [] };
  m.status = 'pending_owner';
}

/** 一个方案最多指定几位任务负责人 */
export const MAX_PLAN_OWNERS = 10;

/** 主持人指定任务负责人（可以多位）→ 方案待确认（方案待确认时也可以改指定） */
export function setPlanOwner(m: MmMeeting, actor: string, ownerIds: string[] | string): void {
  assertHost(m, actor, i18nT('指定任务负责人'));
  assertMeetingStatus(m, ['pending_owner', 'plan_confirm'], i18nT('指定任务负责人'));
  if (!m.plan) fail(i18nT('执行方案还没有生成'));
  const ids = [...new Set((Array.isArray(ownerIds) ? ownerIds : [ownerIds]).map((x) => String(x ?? '').trim()).filter(Boolean))];
  if (!ids.length) fail(i18nT('请至少选一位任务负责人'));
  if (ids.length > MAX_PLAN_OWNERS) fail(i18nT('任务负责人最多 {p0} 位', { p0: MAX_PLAN_OWNERS }));
  m.plan.ownerIds = ids;
  m.plan.ownerId = ids[0];
  m.status = 'plan_confirm';
}

export function assertPlanOwner(m: MmMeeting, actor: string, what: string): void {
  if (!planOwners(m.plan).includes(actor)) fail(i18nT('只有任务负责人可以{p0}', { p0: what }));
}

/** 校验一份方案条目：每项一个责任部门、执行事项必填、完成时间是有效日期 */
export function sanitizePlanItems(raw: unknown, org: MmOrg, newIdFn: () => string): MmPlanItem[] {
  if (!Array.isArray(raw)) fail(i18nT('方案内容格式不对'));
  if (raw.length > 200) fail(i18nT('任务太多了（最多 200 项）'));
  return raw.map((it: any, i: number) => {
    const n = i + 1;
    const deptId = typeof it?.deptId === 'string' ? it.deptId : '';
    if (!deptId) fail(i18nT('第 {p0} 项任务还没有选责任部门（一项任务只能有一个责任部门，多部门的请拆开）', { p0: n }));
    if (!deptOf(org, deptId)) fail(i18nT('第 {p0} 项任务的责任部门不在组织里', { p0: n }));
    const title = String(it?.title ?? '').trim();
    if (!title) fail(i18nT('第 {p0} 项任务的执行事项不能为空', { p0: n }));
    const due = String(it?.due ?? '').trim();
    if (!isYmd(due)) fail(i18nT('第 {p0} 项任务的完成时间请写成 2026-12-15 这样的日期', { p0: n }));
    const assigneeId = typeof it?.assigneeId === 'string' ? it.assigneeId : '';
    if (assigneeId && !activePerson(org, assigneeId)) fail(i18nT('第 {p0} 项任务「下发给」的人不在组织里或已离职', { p0: n }));
    return {
      // 界面新加的条目 id 以 new- 开头（或没有 id）：换成正式 id
      id: typeof it?.id === 'string' && it.id && !it.id.startsWith('new-') ? it.id : newIdFn(),
      deptId,
      title: title.slice(0, 200),
      standard: String(it?.standard ?? '').trim().slice(0, 2000),
      due,
      ...(typeof it?.decisionId === 'string' && it.decisionId ? { decisionId: it.decisionId } : {}),
      ...(assigneeId ? { assigneeId } : {}),
    };
  });
}

/** 任务负责人编辑方案（增删任务、改完成时间） */
export function savePlan(m: MmMeeting, actor: string, items: MmPlanItem[], summary?: string): void {
  assertMeetingStatus(m, ['plan_confirm'], i18nT('编辑执行方案'));
  assertPlanOwner(m, actor, i18nT('编辑执行方案'));
  m.plan!.items = items;
  if (typeof summary === 'string') m.plan!.summary = summary.slice(0, 20_000);
}

/** 方案里一项任务会下发给谁：指定了就是指定的人，否则是责任部门的第一位负责人；都不可用返回 null */
export function planItemAssignee(org: MmOrg, it: MmPlanItem): MmPerson | null {
  return it.assigneeId ? activePerson(org, it.assigneeId) : firstLeader(org, it.deptId);
}

/**
 * 任务负责人确认方案 → 已派发：每项生成一个任务，下发给「下发给」里指定的人；没指定的下发给责任部门在通讯录里的第一位负责人。
 * 返回生成的任务（调用方负责存进 state、把接收人加进项目成员、发通知）。
 */
export function confirmPlan(m: MmMeeting, actor: string, project: MmProject, org: MmOrg, now: number, newIdFn: () => string): MmTask[] {
  assertMeetingStatus(m, ['plan_confirm'], i18nT('确认执行方案'));
  assertPlanOwner(m, actor, i18nT('确认执行方案'));
  assertProjectActive(project);
  const plan = m.plan!;
  if (!plan.items.length) fail(i18nT('方案里还没有任务'));
  const owners = planOwners(plan);
  const tasks: MmTask[] = plan.items.map((it, i) => {
    if (!deptOf(org, it.deptId)) fail(i18nT('第 {p0} 项任务的责任部门不在组织里', { p0: i + 1 }));
    const leader = planItemAssignee(org, it);
    if (!leader) {
      if (it.assigneeId) fail(i18nT('第 {p0} 项任务「下发给」的人不在组织里或已离职', { p0: i + 1 }));
      fail(i18nT('第 {p0} 项任务：{p1}。可以在「下发给」里直接选人', { p0: i + 1, p1: leaderProblem(org, it.deptId) || '' }));
    }
    if (!isYmd(it.due)) fail(i18nT('第 {p0} 项任务的完成时间请写成 2026-12-15 这样的日期', { p0: i + 1 }));
    return {
      id: newIdFn(), projectId: m.projectId, meetingId: m.id, planItemId: it.id, deptId: it.deptId,
      assigneeId: leader.id, ownerId: owners[0]!, ownerIds: owners, title: it.title, standard: it.standard, due: it.due,
      status: 'to_accept', percent: 0, createdAt: now, objectionHistory: [], progressLog: [],
      events: [{ at: now, by: actor, action: 'created' }], reminders: {},
    };
  });
  plan.confirmedAt = now;
  m.status = 'dispatched';
  m.taskIds = tasks.map((t) => t.id);
  return tasks;
}

// ─── 任务 ─────────────────────────────────────────────────────────────

/** 逾期：未开始 / 进行中且过了截止日（异议期间照常计时） */
export function isTaskOverdue(t: MmTask, now: number): boolean {
  if (t.status !== 'not_started' && t.status !== 'in_progress') return false;
  return isYmd(t.due) && ymd(now) > t.due;
}

export function taskOverdueDays(t: MmTask, now: number): number {
  return isTaskOverdue(t, now) ? Math.max(1, daysBetweenYmd(t.due, ymd(now))) : 0;
}

function assertAssignee(t: MmTask, actor: string, what: string): void {
  if (t.assigneeId !== actor) fail(i18nT('只有接收任务的部门负责人可以{p0}', { p0: what }));
}

function assertNoObjection(t: MmTask): void {
  if (hasOpenObjection(t)) fail(i18nT('任务正在异议处理中，等处理完再操作'));
}

function assertTaskStatus(t: MmTask, allowed: MmTaskStatus[], what: string): void {
  if (allowed.includes(t.status)) return;
  fail(i18nT('任务当前状态是「{p0}」，不能{p1}', { p0: taskStatusLabel(t.status), p1: what }));
}

const log = (t: MmTask, by: string, action: string, at: number, note?: string): void => {
  t.events.push({ at, by, action, ...(note ? { note } : {}) });
};

/** 接收 → 未开始 */
export function acceptTask(t: MmTask, actor: string, now: number): void {
  assertAssignee(t, actor, i18nT('接收任务'));
  assertNoObjection(t);
  assertTaskStatus(t, ['to_accept'], i18nT('接收'));
  t.status = 'not_started';
  t.acceptedAt = now;
  log(t, actor, 'accepted', now);
}

/** 更新进度：未开始 → 进行中 */
/** 更新进度：默认算「进行中」；明确选「未开始」时进度必须是 0（手机端进度弹窗可选） */
export function updateProgress(t: MmTask, actor: string, percent: number, note: string, now: number, status?: 'not_started' | 'in_progress'): void {
  assertAssignee(t, actor, i18nT('更新进度'));
  assertNoObjection(t);
  assertTaskStatus(t, ['not_started', 'in_progress'], i18nT('更新进度'));
  const p = Math.round(Number(percent));
  if (!Number.isFinite(p) || p < 0 || p > 100) fail(i18nT('进度请填 0~100 之间的数'));
  if (status === 'not_started' && p > 0) fail(i18nT('「未开始」的任务进度只能是 0'));
  const text = String(note ?? '').trim().slice(0, 2000);
  const next = status === 'not_started' ? 'not_started' : 'in_progress';
  t.status = next;
  t.percent = p;
  t.progressLog.push({ at: now, by: actor, status: next, percent: p, note: text });
  log(t, actor, 'progress', now, text || undefined);
}

/** 标记完成：进行中 → 已完成 */
export function completeTask(t: MmTask, actor: string, note: string | undefined, now: number): void {
  assertAssignee(t, actor, i18nT('标记完成'));
  assertNoObjection(t);
  if (t.status === 'not_started') fail(i18nT('请先更新进度，再标记完成'));
  assertTaskStatus(t, ['in_progress'], i18nT('标记完成'));
  const text = String(note ?? '').trim().slice(0, 2000);
  t.status = 'done';
  t.percent = 100;
  t.doneAt = now;
  t.progressLog.push({ at: now, by: actor, status: 'done', percent: 100, note: text });
  log(t, actor, 'done', now, text || undefined);
}

export interface ObjectionInput {
  target: MmObjection['target'];
  reason: string;
  suggestion: string;
  suggestedDue?: string;
}

/** 提出异议（接收时）/ 申请变更（执行中）→ 异议处理中·待复核 */
export function raiseObjection(t: MmTask, actor: string, input: ObjectionInput, now: number, id: string): MmObjection {
  assertAssignee(t, actor, i18nT('提出异议'));
  assertNoObjection(t);
  assertTaskStatus(t, ['to_accept', 'not_started', 'in_progress'], i18nT('提出异议'));
  if (!['content', 'time', 'requirement'].includes(input?.target)) fail(i18nT('请选择异议针对的是任务内容、时间节点还是执行要求'));
  const reason = String(input.reason ?? '').trim();
  if (!reason) fail(i18nT('请填写异议原因'));
  const due = String(input.suggestedDue ?? '').trim();
  if (due && !isYmd(due)) fail(i18nT('建议的截止日请写成 2026-12-20 这样的日期'));
  const o: MmObjection = {
    id, kind: t.status === 'to_accept' ? 'objection' : 'change', target: input.target,
    reason: reason.slice(0, 2000), suggestion: String(input.suggestion ?? '').trim().slice(0, 2000),
    ...(due ? { suggestedDue: due } : {}),
    raisedBy: actor, raisedAt: now, prevStatus: t.status, stage: 'review',
  };
  t.objection = o;
  log(t, actor, 'objection_raised', now, o.reason);
  return o;
}

export interface TaskChanges { title?: string; standard?: string; due?: string; cancel?: boolean }

/** 按调整内容改任务；截止日变了提醒记录清零（以新截止日为准） */
function applyChanges(t: MmTask, o: MmObjection, changes: TaskChanges | undefined): void {
  const c = changes || {};
  if (c.title !== undefined) {
    const v = String(c.title).trim();
    if (!v) fail(i18nT('执行事项不能为空'));
    t.title = v.slice(0, 200);
  }
  if (c.standard !== undefined) t.standard = String(c.standard).trim().slice(0, 2000);
  let due = c.due !== undefined ? String(c.due).trim() : '';
  // 时间类异议没给新日期时，按异议里建议的截止日调整
  if (!due && o.target === 'time' && o.suggestedDue) due = o.suggestedDue;
  if (due) {
    if (!isYmd(due)) fail(i18nT('截止日请写成 2026-12-20 这样的日期'));
    if (due !== t.due) { t.due = due; t.reminders = {}; }
  }
}

function resolveObjection(t: MmTask, outcome: NonNullable<MmObjection['outcome']>, now: number): void {
  const o = t.objection!;
  o.stage = 'resolved';
  o.outcome = outcome;
  o.resolvedAt = now;
  t.objectionHistory.push(o);
  t.objection = undefined;
}

function cancelTask(t: MmTask, actor: string, now: number, note: string): void {
  resolveObjection(t, 'cancelled', now);
  t.status = 'cancelled';
  log(t, actor, 'cancelled', now, note || undefined);
}

export type ObjectionResult = 'adopted' | 'rejected' | 'cancelled' | 'accepted_reject' | 'escalated' | 'kept' | 'adjusted';

/**
 * 任务负责人复核：
 *   采纳并调整 → 待接收（部门负责人重新确认）；可「删除该任务」→ 已取消
 *   驳回 → 待部门回应
 */
export function reviewObjection(
  t: MmTask, actor: string, decision: 'adopt' | 'reject', note: string, changes: TaskChanges | undefined, now: number,
): ObjectionResult {
  if (!taskOwners(t).includes(actor)) fail(i18nT('只有任务负责人可以复核异议'));
  const o = t.objection;
  if (!o || o.stage !== 'review') fail(i18nT('这个任务没有待复核的异议'));
  const text = String(note ?? '').trim().slice(0, 2000);
  if (decision === 'adopt') {
    o.review = { by: actor, at: now, decision: 'adopt', note: text };
    if (changes?.cancel) { cancelTask(t, actor, now, text); return 'cancelled'; }
    applyChanges(t, o, changes);
    resolveObjection(t, 'adopted', now);
    t.status = 'to_accept';
    t.acceptedAt = undefined;
    log(t, actor, 'review_adopt', now, text || undefined);
    return 'adopted';
  }
  if (decision === 'reject') {
    if (changes?.cancel) fail(i18nT('驳回时不能删除任务；要删除请选择「采纳并调整」'));
    o.review = { by: actor, at: now, decision: 'reject', note: text };
    o.stage = 'dept_reply';
    log(t, actor, 'review_reject', now, text || undefined);
    return 'rejected';
  }
  fail(i18nT('请选择「采纳并调整」或「驳回」'));
}

/** 部门负责人回应驳回：接受驳回 → 回到发起前状态；提交裁决 → 待裁决 */
export function replyObjection(t: MmTask, actor: string, decision: 'accept' | 'escalate', now: number): ObjectionResult {
  assertAssignee(t, actor, i18nT('回应驳回'));
  const o = t.objection;
  if (!o || o.stage !== 'dept_reply') fail(i18nT('这个任务没有待你回应的驳回'));
  if (decision === 'accept') {
    const prev = o.prevStatus;
    resolveObjection(t, 'accepted_reject', now);
    t.status = prev;
    log(t, actor, 'reply_accept', now);
    return 'accepted_reject';
  }
  if (decision === 'escalate') {
    o.stage = 'arbitration';
    log(t, actor, 'escalated', now);
    return 'escalated';
  }
  fail(i18nT('请选择「接受驳回」或「提交裁决」'));
}

/**
 * 项目负责人裁决（最终结果）：
 *   维持原方案 → 回到发起前状态（原来是待接收的直接变未开始）
 *   按异议调整 → 未开始或进行中（按调整后内容）；可「删除该任务」→ 已取消
 */
export function arbitrateObjection(
  t: MmTask, actor: string, projectOwnerId: string, decision: 'keep' | 'adjust', note: string, changes: TaskChanges | undefined, now: number,
): ObjectionResult {
  if (actor !== projectOwnerId) fail(i18nT('只有项目负责人可以裁决'));
  const o = t.objection;
  if (!o || o.stage !== 'arbitration') fail(i18nT('这个任务没有待裁决的异议'));
  const text = String(note ?? '').trim().slice(0, 2000);
  const toRunning = (): void => {
    if (o.prevStatus === 'in_progress') t.status = 'in_progress';
    else { t.status = 'not_started'; if (!t.acceptedAt) t.acceptedAt = now; }
  };
  if (decision === 'keep') {
    o.arbitration = { by: actor, at: now, decision: 'keep', note: text };
    resolveObjection(t, 'kept', now);
    toRunning();
    log(t, actor, 'arbitrate_keep', now, text || undefined);
    return 'kept';
  }
  if (decision === 'adjust') {
    o.arbitration = { by: actor, at: now, decision: 'adjust', note: text };
    if (changes?.cancel) { cancelTask(t, actor, now, text); return 'cancelled'; }
    applyChanges(t, o, changes);
    resolveObjection(t, 'adjusted', now);
    toRunning();
    log(t, actor, 'arbitrate_adjust', now, text || undefined);
    return 'adjusted';
  }
  fail(i18nT('请选择「维持原方案」或「按异议调整」'));
}
