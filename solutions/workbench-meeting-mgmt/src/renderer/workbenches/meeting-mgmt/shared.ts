/**
 * 会议智能管理 · 渲染层共享：动作调用、事件、全局状态、导航、标签与格式。
 * 各页签 / 详情组件只依赖这里和 shared/meetingMgmt/types.ts，彼此不互相 import 内部实现。
 * 动作清单见 docs/meeting-mgmt-workbench.md 第 3.2 节。
 */
import { ref } from 'vue';
import type {
  MmEvent, MmLink, MmMe, MmMeetingSource, MmMeetingStatus, MmNoticeType, MmObjection, MmOrgSyncResult,
  MmProjectStatus, MmSettings, MmTaskStatus, MmTodoType,
} from '../../../shared/meetingMgmt/types';
import { t as i18nT } from '../../i18n';
import { toPlain } from '../../utils/ipcPlain';

/** 注意：fmtDateTime 来自服务商结算工作台，参数是 ISO 字符串，不是毫秒；毫秒时间用下面的 fmtDate / fmtAgo */
export { errorMessage, fmtDateTime } from '../service-settlement/shared';

/** 调主进程：invoke(action, payload)；失败抛中文错误（界面用 errorMessage 显示） */
export async function mm<T = any>(action: string, payload?: unknown): Promise<T> {
  const bridge = (window as any).electronAPI?.workbenches?.meetingMgmt;
  if (!bridge?.invoke) throw new Error(i18nT('泰途会议智能管理接口不可用，请重启应用'));
  return bridge.invoke(action, toPlain(payload ?? {})) as Promise<T>;
}

/** 订阅工作台事件（数据变了 / 处理进度 / 手机页服务）；返回取消订阅 */
export function onMmEvent(cb: (ev: MmEvent) => void): () => void {
  const bridge = (window as any).electronAPI?.workbenches?.meetingMgmt;
  return bridge?.onEvent ? bridge.onEvent(cb) : () => {};
}

// ── 全局状态（boot 的结果）──────────────────────────────

/** 手机页服务状态：lanOnly = 发出去的链接只有公司内网能打开；publicBase = 设置里填的外网地址 */
export interface MmMobileStatus { running: boolean; url?: string; lanOnly?: boolean; publicBase?: string }

export interface MmBoot {
  me: MmMe;
  org: { source: 'wecom' | 'demo' | 'import' | 'none'; deptCount: number; peopleCount: number; lastSync?: MmOrgSyncResult };
  settings: MmSettings;
  wecomConnected: boolean;
  /** 通知往哪发：自建应用（发给个人）/ 群机器人（发进群）/ 都没配（只进消息中心） */
  pushChannel?: 'app' | 'webhook' | null;
  /** 管理员还没走过配置引导：外壳自动弹引导 */
  setupPending?: boolean;
  /** 这台电脑上能切换身份（管理员，或者通讯录换了、还没有在职管理员） */
  canSwitchIdentity?: boolean;
  mobile: MmMobileStatus;
  /** 发送失败的企微卡片条数（只有管理员拿到非 0） */
  pushFailed?: number;
  badges: { home: number; meetings: number; tasks: number };
}

export const mmBoot = ref<MmBoot | null>(null);
/** 这次打开应用里已经自动弹过配置引导了（进出工作台不再重复弹；没走完的下次启动再弹） */
export const mmSetupAutoShown = ref(false);

export async function refreshBoot(): Promise<MmBoot> {
  const b = await mm<MmBoot>('boot');
  mmBoot.value = b;
  return b;
}

// ── 顶部身份胶囊显示的角色（「项目负责人 · 林晓」）：各页签按当前打开的对象设置，外壳只负责显示 ──

/** 空串 = 外壳按默认（管理员 / 项目成员）显示 */
export const mmRole = ref('');

// ── 页签导航（首页待办 / 通知点进去直接落到对象详情）──────────

export type MmTab = 'home' | 'meetings' | 'tasks' | 'projects' | 'settings';

/** 当前页签 + 要打开的对象；各页签 watch 这个 ref 打开对应详情 */
export const mmNav = ref<{ tab: MmTab; link?: MmLink; seq: number }>({ tab: 'home', seq: 0 });

export function goTab(tab: MmTab): void {
  mmNav.value = { tab, seq: mmNav.value.seq + 1 };
}

/** 跳到系统设置的某个分区（如首页「推送失败」→ 消息推送）；设置页打开时读走并清空 */
export const mmSettingsSection = ref('');
export function goSettings(section: string): void {
  mmSettingsSection.value = section;
  goTab('settings');
}

export function openLink(link: MmLink): void {
  const tab: MmTab = link.kind === 'task' ? 'tasks'
    : link.kind === 'meeting' || link.kind === 'meeting_plan' ? 'meetings'
      : 'projects';
  mmNav.value = { tab, link, seq: mmNav.value.seq + 1 };
}

// ── 标签 ─────────────────────────────────────────────

export const MEETING_STATUS_LABEL: Record<MmMeetingStatus, string> = {
  pending_upload: i18nT('待上传'),
  processing: i18nT('处理中'),
  failed: i18nT('处理失败'),
  pending_assign: i18nT('待指认'),
  pending_confirm: i18nT('待确认'),
  pending_review: i18nT('待终审'),
  finalized: i18nT('已定稿'),
  ended: i18nT('已结束'),
  pending_owner: i18nT('待指定负责人'),
  plan_confirm: i18nT('方案待确认'),
  dispatched: i18nT('已派发'),
};

/** 会议详情顶部的进度条（原型：上传 — 处理 — 发言确认 — 终审 — 定稿 — 方案 — 已派发） */
export const MEETING_STEPS: Array<{ key: string; label: string; statuses: MmMeetingStatus[] }> = [
  { key: 'upload', label: i18nT('上传'), statuses: ['pending_upload'] },
  { key: 'process', label: i18nT('处理'), statuses: ['processing', 'failed', 'pending_assign'] },
  { key: 'confirm', label: i18nT('发言确认'), statuses: ['pending_confirm'] },
  { key: 'review', label: i18nT('终审'), statuses: ['pending_review'] },
  { key: 'final', label: i18nT('定稿'), statuses: ['finalized', 'ended'] },
  { key: 'plan', label: i18nT('方案'), statuses: ['pending_owner', 'plan_confirm'] },
  { key: 'dispatched', label: i18nT('已派发'), statuses: ['dispatched'] },
];

export function meetingStepIndex(status: MmMeetingStatus): number {
  const i = MEETING_STEPS.findIndex((s) => s.statuses.includes(status));
  return i < 0 ? 0 : i;
}

export const MEETING_SOURCE_LABEL: Record<MmMeetingSource, string> = {
  offline: i18nT('线下'),
  tencent: i18nT('腾讯会议'),
  zoom: i18nT('Zoom'),
};

export const TASK_STATUS_LABEL: Record<MmTaskStatus, string> = {
  to_accept: i18nT('待接收'),
  not_started: i18nT('未开始'),
  in_progress: i18nT('进行中'),
  done: i18nT('已完成'),
  cancelled: i18nT('已取消'),
};

/** 任务在异议处理中时显示的状态（原型：「异议处理中 · 待裁决」） */
export function objectionLabel(o: MmObjection | undefined): string {
  if (!o) return '';
  if (o.stage === 'review') return i18nT('异议处理中 · 待复核');
  if (o.stage === 'dept_reply') return i18nT('异议处理中 · 待部门回应');
  if (o.stage === 'arbitration') return i18nT('异议处理中 · 待裁决');
  return '';
}

export const OBJECTION_TARGET_LABEL: Record<MmObjection['target'], string> = {
  content: i18nT('任务内容'),
  time: i18nT('时间节点'),
  requirement: i18nT('执行要求'),
};

export const PROJECT_STATUS_LABEL: Record<MmProjectStatus, string> = {
  active: i18nT('进行中'),
  closing: i18nT('结项中'),
  archived: i18nT('已归档'),
};

export const TODO_TYPE_LABEL: Record<MmTodoType, string> = {
  assign_speaker: i18nT('待指认'),
  confirm_speech: i18nT('发言确认'),
  review_minutes: i18nT('纪要终审'),
  decide_tasks: i18nT('定稿待选择'),
  assign_owner: i18nT('指定负责人'),
  confirm_plan: i18nT('方案确认'),
  accept_task: i18nT('待接收'),
  update_progress: i18nT('更新进度'),
  review_objection: i18nT('异议复核'),
  dept_reply: i18nT('异议回应'),
  arbitrate: i18nT('待裁决'),
  review_report: i18nT('报告审核'),
  retry_process: i18nT('处理失败'),
};

/** 待办卡片右侧按钮文字（原型：去裁决 / 查看任务 / 确认发言 / 去终审 / 确认方案） */
export const TODO_ACTION_LABEL: Record<MmTodoType, string> = {
  assign_speaker: i18nT('去指认'),
  confirm_speech: i18nT('确认发言'),
  review_minutes: i18nT('去终审'),
  decide_tasks: i18nT('去选择'),
  assign_owner: i18nT('去指定'),
  confirm_plan: i18nT('确认方案'),
  accept_task: i18nT('去接收'),
  update_progress: i18nT('查看任务'),
  review_objection: i18nT('去复核'),
  dept_reply: i18nT('去回应'),
  arbitrate: i18nT('去裁决'),
  review_report: i18nT('去审核'),
  retry_process: i18nT('去重试'),
};

export const NOTICE_TYPE_LABEL: Record<MmNoticeType, string> = {
  speech_confirm: i18nT('发言待确认'),
  speech_remind: i18nT('发言确认催办'),
  minutes_review: i18nT('纪要待终审'),
  minutes_final: i18nT('正式纪要已生成'),
  plan_confirm: i18nT('方案待确认'),
  task_new: i18nT('新任务待接收'),
  task_progress_remind: i18nT('进度更新提醒'),
  task_due_remind: i18nT('到期提醒'),
  task_overdue: i18nT('逾期提醒'),
  objection_review: i18nT('异议待复核'),
  plan_adjusted: i18nT('调整后方案待确认'),
  arbitration: i18nT('待裁决'),
  arbitration_result: i18nT('裁决结果'),
  progress_report: i18nT('进度汇总报告'),
  summary_review: i18nT('总结报告待审核'),
  project_archived: i18nT('项目已归档'),
  task_done: i18nT('任务已完成'),
  task_progress: i18nT('进度更新'),
};

// ── 格式 ─────────────────────────────────────────────

/** 人名头像：取姓（第一个字）；颜色按名字稳定分配 */
const AVATAR_COLORS = ['#e05a8a', '#3b82f6', '#f59e0b', '#8b5cf6', '#ef4444', '#0ea5a4', '#16a34a', '#6366f1', '#d97706', '#0284c7'];
export function avatarOf(name: string | undefined): { text: string; color: string } {
  const n = String(name || '?');
  let h = 0;
  for (const ch of n) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return { text: n.slice(0, 1), color: AVATAR_COLORS[h % AVATAR_COLORS.length] };
}

/** 'YYYY-MM-DD' → 'MM-DD' */
export const fmtDue = (d: string | undefined): string => (d && /^\d{4}-\d{2}-\d{2}$/.test(d) ? d.slice(5) : d || '-');

export function fmtDate(ms: number | undefined): string {
  if (!ms) return '-';
  const d = new Date(ms);
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

/** 秒 → 'mm:ss' / 'h:mm:ss'（转写时间戳） */
export function fmtClock(sec: number | undefined): string {
  const s = Math.max(0, Math.floor(sec || 0));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const r = s % 60;
  const p = (n: number) => String(n).padStart(2, '0');
  return h ? `${h}:${p(m)}:${p(r)}` : `${p(m)}:${p(r)}`;
}

/** 多久以前（通知时间：「10 分钟前」「昨天 18:00」） */
export function fmtAgo(ms: number | undefined, now = Date.now()): string {
  if (!ms) return '';
  const diff = now - ms;
  if (diff < 60_000) return i18nT('刚刚');
  if (diff < 3600_000) return i18nT('{n} 分钟前', { n: Math.floor(diff / 60_000) });
  const d = new Date(ms);
  const p = (n: number) => String(n).padStart(2, '0');
  const today = new Date(now);
  const yest = new Date(now - 86_400_000);
  const hm = `${p(d.getHours())}:${p(d.getMinutes())}`;
  if (d.toDateString() === today.toDateString()) return i18nT('今天 {t}', { t: hm });
  if (d.toDateString() === yest.toDateString()) return i18nT('昨天 {t}', { t: hm });
  return `${p(d.getMonth() + 1)}-${p(d.getDate())} ${hm}`;
}
