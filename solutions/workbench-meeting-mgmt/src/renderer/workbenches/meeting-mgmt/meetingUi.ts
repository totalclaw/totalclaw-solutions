/**
 * 会议智能管理 · 首页 / 会议页签自用的纯逻辑与小状态（代理 D1）。
 * 通用的动作调用、事件、导航、状态标签在 ./shared.ts；这里只放首页、会议详情要用的分组、格式和视图模型类型。
 */
import { ref } from 'vue';
import type {
  MmFileKind, MmHomeView, MmMeeting, MmMeetingStatus, MmProcessStage, MmProjectStatus, MmTaskView, MmTodo,
} from '../../../shared/meetingMgmt/types';
import { i18n, t as i18nT } from '../../i18n';
import { mm } from './shared';

// ── 视图模型（docs 3.2 meeting.list / meeting.get 的返回；契约里没有具名类型，先在这里写）──

export interface MmMeetingCard {
  id: string;
  title: string;
  projectName: string;
  time: number;
  status: MmMeetingStatus;
  needsMe: boolean;
  confirmText?: string;
}

export interface MmMeetingDetail {
  meeting: MmMeeting;
  projectName: string;
  projectStatus: MmProjectStatus;
  names: Record<string, { name: string; deptName: string }>;
  /** myLabels：当前身份在这场会议里对应的发言人标签（S1 / 昵称），用来认「本人段」 */
  my: { isHost: boolean; isSpeaker: boolean; isPlanOwner: boolean; myLabels: string[] };
  confirm: { done: number; total: number };
  tasks: MmTaskView[];
}

export interface MmPeople {
  depts: Array<{ id: string; name: string; parentId?: string; leaderIds: string[] }>;
  people: Array<{ id: string; name: string; deptId: string; title?: string; left?: boolean }>;
}

// ── 跨页签的小状态 ─────────────────────────────────────

/** 首页「新建会议」→ 跳到会议页签后自动打开新建弹窗 */
export const pendingCreateMeeting = ref(false);
/** 会议页签上次选中的会议（切走再切回来时恢复） */
export const lastMeetingId = ref('');

/**
 * 坐在这台电脑前的管理员（切成别人之后还能切回来）。
 * 契约只说「管理员或尚未设管理员时可切」，切成普通成员后 boot.me.isAdmin 会变 false —— 记住切换前的管理员，
 * 身份下拉里给一个「回到管理员」入口，切不切得动以主进程为准。
 */
const OPERATOR_KEY = 'totalclaw:meeting-mgmt-operator:v1';
function readOperator(): string {
  try { return localStorage.getItem(OPERATOR_KEY) || ''; } catch { return ''; }
}
export const operatorAdminId = ref(readOperator());
export function rememberOperatorAdmin(personId: string): void {
  operatorAdminId.value = personId;
  try { localStorage.setItem(OPERATOR_KEY, personId); } catch { /* 忽略 */ }
}

let peopleCache: { at: number; data: Promise<MmPeople> } | null = null;
/** 组织人员（people.list），短时间缓存；组织变了传 force */
export function loadPeople(force = false): Promise<MmPeople> {
  if (!force && peopleCache && Date.now() - peopleCache.at < 30_000) return peopleCache.data;
  const data = mm<MmPeople>('people.list').then((r) => ({ depts: r?.depts ?? [], people: r?.people ?? [] }));
  peopleCache = { at: Date.now(), data };
  data.catch(() => { peopleCache = null; });
  return data;
}
export function clearPeopleCache(): void { peopleCache = null; }

/** 按部门分组（搜索时只留命中的人；没有部门的人归到「其他」） */
export function groupPeopleByDept(src: MmPeople, q = '', only?: string[]): Array<{ id: string; name: string; people: MmPeople['people'] }> {
  const k = q.trim().toLowerCase();
  const allow = only ? new Set(only) : null;
  const people = src.people.filter((p) => !p.left && (!allow || allow.has(p.id)) && (!k || p.name.toLowerCase().includes(k) || (p.title || '').toLowerCase().includes(k)));
  const out: Array<{ id: string; name: string; people: MmPeople['people'] }> = [];
  const seen = new Set<string>();
  for (const d of src.depts) {
    const list = people.filter((p) => p.deptId === d.id);
    seen.add(d.id);
    if (list.length) out.push({ id: d.id, name: d.name, people: list });
  }
  const rest = people.filter((p) => !seen.has(p.deptId));
  if (rest.length) out.push({ id: '', name: i18nT('其他'), people: rest });
  return out;
}

// ── 格式 ─────────────────────────────────────────────

const pad = (n: number) => String(n).padStart(2, '0');

/** 毫秒 → 'YYYY-MM-DD HH:mm' */
export function fmtMs(ms: number | undefined): string {
  if (!ms) return '-';
  const d = new Date(ms);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

/** 毫秒 → 'MM-DD' */
export function fmtMd(ms: number | undefined): string {
  if (!ms) return '-';
  const d = new Date(ms);
  return `${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

/** 本地日期 'YYYY-MM-DD' */
export function ymd(ms: number): string {
  const d = new Date(ms);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

/** datetime-local 输入框的值 ↔ 毫秒 */
export function toLocalInput(ms: number): string {
  const d = new Date(ms);
  return `${ymd(ms)}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
export function fromLocalInput(v: string): number {
  const m = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/.exec(v || '');
  if (!m) return NaN;
  return new Date(+m[1], +m[2] - 1, +m[3], +m[4], +m[5]).getTime();
}

export function fmtSize(bytes: number | undefined): string {
  const b = Number(bytes) || 0;
  if (b >= 1024 ** 3) return `${(b / 1024 ** 3).toFixed(2)} GB`;
  if (b >= 1024 ** 2) return `${(b / 1024 ** 2).toFixed(1)} MB`;
  if (b >= 1024) return `${Math.round(b / 1024)} KB`;
  return `${b} B`;
}

/** 秒 → 「52 分钟」「1 小时 07 分」 */
export function fmtDuration(sec: number | undefined): string {
  const s = Math.round(Number(sec) || 0);
  if (!s) return '';
  const m = Math.max(1, Math.round(s / 60));
  if (m < 60) return i18nT('{n} 分钟', { n: m });
  return i18nT('{h} 小时 {m} 分', { h: Math.floor(m / 60), m: pad(m % 60) });
}

/** 毫秒时长 → 「3 分 20 秒」 */
export function fmtElapsed(ms: number): string {
  const s = Math.max(0, Math.floor(ms / 1000));
  if (s < 60) return i18nT('{n} 秒', { n: s });
  const m = Math.floor(s / 60);
  if (m < 60) return i18nT('{m} 分 {s} 秒', { m, s: s % 60 });
  return i18nT('{h} 小时 {m} 分', { h: Math.floor(m / 60), m: pad(m % 60) });
}

/** 问候语按钟点：早上好 / 中午好 / 下午好 / 晚上好 */
export function greetingOf(hour: number): string {
  if (hour >= 5 && hour < 11) return i18nT('早上好');
  if (hour >= 11 && hour < 13) return i18nT('中午好');
  if (hour >= 13 && hour < 18) return i18nT('下午好');
  return i18nT('晚上好');
}

const weekdays = (): string[] => [i18nT('周日'), i18nT('周一'), i18nT('周二'), i18nT('周三'), i18nT('周四'), i18nT('周五'), i18nT('周六')];
/** 截止日 'YYYY-MM-DD' → { day: 今天 / 明天 / 周五, md: '11-13' } */
export function dueDayLabel(due: string, now = Date.now()): { day: string; md: string } {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(due || '');
  if (!m) return { day: '', md: due || '-' };
  const md = `${m[2]}-${m[3]}`;
  if (due === ymd(now)) return { day: i18nT('今天'), md };
  if (due === ymd(now + 86_400_000)) return { day: i18nT('明天'), md };
  const wd = new Date(+m[1], +m[2] - 1, +m[3]).getDay();
  return { day: weekdays()[wd], md };
}

/**
 * 议题序号：中文界面「一、二、三」，其它语言用阿拉伯数字。
 * i18n-ignore：只在中文界面拼序号用，不是展示文案（其它语言走阿拉伯数字）
 */
const CN_DIGITS = ['零', '一', '二', '三', '四', '五', '六', '七', '八', '九', '十'];
export function topicNo(i: number): string {
  const n = i + 1;
  let zh = false;
  try { zh = String(i18n.global.locale.value || 'zh-CN') === 'zh-CN'; } catch { zh = true; }
  if (!zh) return String(n);
  const ten = CN_DIGITS[10];
  if (n <= 10) return CN_DIGITS[n];
  if (n < 20) return ten + CN_DIGITS[n - 10];
  if (n < 100) return CN_DIGITS[Math.floor(n / 10)] + ten + (n % 10 ? CN_DIGITS[n % 10] : '');
  return String(n);
}

// ── 状态色 ───────────────────────────────────────────

export type MmTone = 'brand' | 'ok' | 'warn' | 'bad' | 'muted';

export const MEETING_STATUS_TONE: Record<MmMeetingStatus, MmTone> = {
  pending_upload: 'warn',
  processing: 'muted',
  failed: 'bad',
  pending_assign: 'warn',
  pending_confirm: 'brand',
  pending_review: 'brand',
  finalized: 'ok',
  ended: 'muted',
  pending_owner: 'brand',
  plan_confirm: 'brand',
  dispatched: 'ok',
};

export const STAGE_LABEL: Record<MmProcessStage, string> = {
  extract: i18nT('提取音轨'),
  transcribe: i18nT('转写'),
  diarize: i18nT('识别发言人'),
  parse: i18nT('解析文字记录'),
  organize: i18nT('AI 整理纪要'),
  done: i18nT('处理完成'),
};

export const FILE_KIND_LABEL: Record<MmFileKind, string> = {
  audio: i18nT('录音'),
  video: i18nT('录屏'),
  transcript: i18nT('文字记录'),
};

// ── 首页：待办分组 ───────────────────────────────────

export type TodoFilter = 'all' | 'meeting' | 'task' | 'project';

export interface TodoGroups {
  counts: Record<TodoFilter, number>;
  urgent: MmTodo[];
  today: MmTodo[];
  week: MmTodo[];
}

/** 按 全部 / 会议 / 任务 / 项目 筛选，再按 紧急 / 今天 / 本周 分组；组内按时间先后 */
export function groupTodos(todos: MmTodo[], filter: TodoFilter): TodoGroups {
  const list = Array.isArray(todos) ? todos : [];
  const counts: Record<TodoFilter, number> = {
    all: list.length,
    meeting: list.filter((t) => t.group === 'meeting').length,
    task: list.filter((t) => t.group === 'task').length,
    project: list.filter((t) => t.group === 'project').length,
  };
  const shown = filter === 'all' ? list : list.filter((t) => t.group === filter);
  const by = (u: MmTodo['urgency']) => shown.filter((t) => t.urgency === u).sort((a, b) => (a.at || 0) - (b.at || 0));
  return { counts, urgent: by('urgent'), today: by('today'), week: by('week') };
}

/** 首页身份胶囊：我负责的项目 → 项目负责人；否则按手上的待办推断 */
export function homeRoleLabel(view: MmHomeView | null | undefined): string {
  if (!view) return '';
  const name = view.me?.person?.name;
  if (name && (view.projects || []).some((p) => p.ownerName === name)) return i18nT('项目负责人');
  const types = new Set((view.todos || []).map((t) => t.type));
  if (types.has('arbitrate') || types.has('review_report')) return i18nT('项目负责人');
  if (types.has('review_minutes') || types.has('assign_speaker') || types.has('decide_tasks') || types.has('assign_owner') || types.has('retry_process')) return i18nT('主持人');
  if (types.has('confirm_plan') || types.has('review_objection')) return i18nT('任务负责人');
  if (types.has('accept_task') || types.has('update_progress') || types.has('dept_reply')) return i18nT('部门负责人');
  if (types.has('confirm_speech')) return i18nT('发言人');
  if (view.me?.isAdmin) return i18nT('管理员');
  return i18nT('项目成员');
}

// ── 会议详情 ─────────────────────────────────────────

/** 会议详情里身份胶囊显示的角色 */
export function meetingRoleLabel(d: MmMeetingDetail | null | undefined, meId: string | undefined): string {
  if (!d) return '';
  const st = d.meeting.status;
  if (d.my.isPlanOwner && (st === 'plan_confirm' || st === 'dispatched')) return i18nT('任务负责人');
  if (d.my.isHost) return i18nT('主持人');
  if (d.my.isPlanOwner) return i18nT('任务负责人');
  if (d.my.isSpeaker) return i18nT('发言人');
  if (meId && d.meeting.attendeeIds.includes(meId)) return i18nT('参会人');
  return i18nT('项目成员');
}

/** 发言人标签 → 员工 id（没识别 / 没指认时为空） */
export function speakerPersonId(meeting: MmMeeting, label: string): string | undefined {
  return meeting.speakers.find((s) => s.label === label)?.personId;
}

/** 段落显示的发言人名字：认出来的用员工名，没认出来的「未识别 S3」 */
export function speakerName(d: MmMeetingDetail, label: string): string {
  const pid = speakerPersonId(d.meeting, label);
  if (pid && d.names[pid]) return d.names[pid].name;
  return i18nT('未识别 {label}', { label });
}

/** 是不是当前身份本人的段落 */
export function isOwnSegment(d: MmMeetingDetail, label: string, meId: string | undefined): boolean {
  if (d.my.myLabels.includes(label)) return true;
  const pid = speakerPersonId(d.meeting, label);
  return !!meId && pid === meId;
}

export interface TopicBlock {
  id: string;
  title: string;
  segmentIds: string[];
  /** 本议题出现的发言人名字（去重，按首次出现） */
  speakers: string[];
}

/** 按议题分块；没归到任何议题的段落收进最后的「其他发言」 */
export function topicBlocks(d: MmMeetingDetail): TopicBlock[] {
  const m = d.meeting;
  const byId = new Map(m.segments.map((s) => [s.id, s] as const));
  const used = new Set<string>();
  const blocks: TopicBlock[] = [];
  const namesOf = (ids: string[]) => {
    const out: string[] = [];
    for (const id of ids) {
      const s = byId.get(id);
      if (!s) continue;
      const n = speakerName(d, s.speakerLabel);
      if (!out.includes(n)) out.push(n);
    }
    return out;
  };
  for (const t of m.topics || []) {
    const ids = (t.segmentIds || []).filter((id) => byId.has(id));
    ids.forEach((id) => used.add(id));
    blocks.push({ id: t.id, title: t.title, segmentIds: ids, speakers: namesOf(ids) });
  }
  const rest = m.segments.filter((s) => !used.has(s.id)).sort((a, b) => a.start - b.start).map((s) => s.id);
  if (rest.length) blocks.push({ id: '__rest', title: blocks.length ? i18nT('其他发言') : i18nT('全部发言'), segmentIds: rest, speakers: namesOf(rest) });
  return blocks;
}

/** 处理进度的「最后一次有动静」时间：事件 > 日志最后一条 > 开始时间 */
export function lastProgressAt(process: MmMeeting['process'], liveAt?: number): number | undefined {
  const logAt = process?.log?.length ? process.log[process.log.length - 1].at : undefined;
  return Math.max(liveAt || 0, logAt || 0, process?.startedAt || 0) || undefined;
}

/** 处理多久没动静算「可能卡住」（长录音转写一段可能好几分钟，放宽到 10 分钟） */
export const PROCESS_STALL_MS = 10 * 60_000;
