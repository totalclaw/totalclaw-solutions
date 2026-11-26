/**
 * 会议智能管理工作台（workbench-meeting-mgmt）—— 主进程 / 渲染层 / 手机页共用的数据契约。
 * 需求：速腾《会议智能管理系统需求规格说明书（一期）V1.0》，设计与分工见 docs/meeting-mgmt-workbench.md。
 *
 * 约定：
 *   - 所有 id 都是字符串；时间一律毫秒时间戳（number），日期（截止日）用 'YYYY-MM-DD' 字符串。
 *   - 人员只来自组织（企微通讯录同步 / 演示组织），系统内不维护人员信息；角色按项目 / 会议产生。
 *   - 这个文件只放类型和常量，不放逻辑（主进程、渲染层、手机页都会引它）。
 */

// ─── 组织（企微通讯录）────────────────────────────────────────────────

export interface MmDept {
  id: string;
  name: string;
  parentId?: string;
  /** 部门负责人（企微 department_leader 的顺序）；任务下发给第一位 */
  leaderIds: string[];
}

export interface MmPerson {
  id: string;
  name: string;
  /** 主部门 */
  deptId: string;
  title?: string;
  /** 直属上级 */
  leaderId?: string;
  /** 企微 userid（演示组织里与 id 相同） */
  wecomUserId?: string;
  /** 手机号：企微群机器人按它 @ 本人（导入的通讯录表格里带，或管理员手动填） */
  mobile?: string;
  /** 企微账号是管理员手动填的（演示组织里自带的账号是编的，不能拿来 @；手动填过的可以） */
  wecomIdManual?: boolean;
  /** 离职（同步时企微里已经没有了）：保留历史数据，不能再被选 */
  left?: boolean;
}

export interface MmOrgSyncResult {
  at: number;
  by: string;
  /** import = 导入的通讯录表格（企微后台导出） */
  source: 'wecom' | 'demo' | 'import';
  /** 导入时给管理员的提醒（没有负责人的部门、手机号格式不对…） */
  warnings?: string[];
  added: string[];
  changed: string[];
  left: string[];
  error?: string;
}

export interface MmOrg {
  depts: MmDept[];
  people: MmPerson[];
  source: 'wecom' | 'demo' | 'import' | 'none';
  lastSync?: MmOrgSyncResult;
}

// ─── 设置 ─────────────────────────────────────────────────────────────

export interface MmWecomConfig {
  corpId: string;
  agentId: string;
  /** 密钥不出主进程：存在 safeStorage 里，这里只回「有没有配」 */
  hasSecret: boolean;
  /** 卡片按钮跳转的地址前缀（手机页的局域网 / 可信域名地址）；空 = 用手机页服务的局域网地址 */
  cardBaseUrl?: string;
  /**
   * 企微群机器人（群聊「消息推送」）：没有自建应用时把通知发进一个群并 @ 相关人。
   * 地址里的 key 等于凭据，存在 safeStorage 里，这里只回「有没有配」和打码后的样子
   */
  hasWebhook?: boolean;
  webhookMasked?: string;
}

export interface MmSettings {
  /** 管理员（人员 id）；第一次打开时把当前身份设为管理员 */
  adminIds: string[];
  /** 除管理员外可新建项目的人 */
  projectCreatorIds: string[];
  /** 参数（需求 9.8） */
  confirmTimeoutHours: number; // 默认 24
  dueRemindDays: number; // 默认 1
  trackCycleDays: number; // 默认 7
  reportCycleDays: number; // 默认 7
  wecom: MmWecomConfig;
  /** AI 能力配置（需求 9.7）：提示词留空 = 内置 */
  ai: {
    /** local = 本机模型；agent = App 自带的 AI 服务；cloud = 自己填的在线语音识别接口（声纹都在本机算） */
    asr: 'local' | 'agent' | 'cloud';
    /** 本机转写用哪个模型：auto = 装了 FireRedASR2 且内存够用它，否则 SenseVoice */
    localAsrModel?: 'auto' | 'firered' | 'sensevoice' | 'whisper';
    /** 在线语音识别接口（API Key 加密单独存，这里只记有没有） */
    cloudAsr?: { provider: 'dashscope' | 'siliconflow' | 'openai' | 'custom'; baseUrl: string; model: string; hasKey: boolean };
    /** 本场参会人声纹比对的相似度下限（0~1） */
    voiceprintThreshold: number;
    planPrompt?: string;
    summaryPrompt?: string;
    organizePrompt?: string;
  };
}

export const MM_DEFAULT_SETTINGS: MmSettings = {
  adminIds: [],
  projectCreatorIds: [],
  confirmTimeoutHours: 24,
  dueRemindDays: 1,
  trackCycleDays: 7,
  reportCycleDays: 7,
  wecom: { corpId: '', agentId: '', hasSecret: false },
  // 声纹认人门槛：2026-11-16 用真实 67 分钟会议录音实测，同一会议室不同人之间余弦最高 0.53、本人 0.67~0.77，取 0.55
  ai: { asr: 'local', voiceprintThreshold: 0.55 },
};

// ─── 声纹库 ───────────────────────────────────────────────────────────

export interface MmVoiceprint {
  personId: string;
  /** 个保法单独同意：授权人（= 本人）和授权时间 */
  consentAt: number;
  enrolledAt: number;
  /** CAM++ 192 维，已归一化（只装了 ERes2NetV2 时为空数组） */
  vector: number[];
  /** ERes2NetV2 192 维，已归一化（2026-11-17 起采集时装了这个模型就一起算；没有 = 旧声纹，建议重录） */
  vector2?: number[];
  sampleSeconds: number;
  /**
   * 用本人确认过的会议发言自动补充声纹：2026-11-17 起采集同意里已包含，采集时写 true；本人可在声纹库关掉（= false，已补的样本一并删除，重录也保持关）。
   * 缺省（之前采的，当时的同意里没有这一项）= 不补，本人可在声纹库打开。
   */
  autoLearn?: boolean;
  autoLearnAt?: number;
  /** 从本人确认过的会议里补充的样本（最近的在前，最多 MM_VOICEPRINT_MAX_EXTRA 条）：认人时取各样本里最像的那个 */
  extra?: MmVoiceprintSample[];
}

export interface MmVoiceprintSample {
  meetingId: string;
  at: number;
  seconds: number;
  vector?: number[];
  vector2?: number[];
}

/** 每人最多保留几条会议补充样本 */
export const MM_VOICEPRINT_MAX_EXTRA = 5;

// ─── 项目 ─────────────────────────────────────────────────────────────

export type MmProjectStatus = 'active' | 'closing' | 'archived';

export interface MmReportStats {
  total: number;
  done: number;
  cancelled: number;
  overdue: number;
  onTime: number;
  late: number;
  /** 0~100 */
  completionRate: number;
}

export interface MmReport {
  id: string;
  kind: 'weekly' | 'summary';
  generatedAt: number;
  /** 周报的统计区间 */
  periodFrom?: number;
  periodTo?: number;
  /** Markdown 正文 */
  markdown: string;
  /** 确定性统计（总结 / 周报里的数字以这里为准，不让模型编） */
  stats: MmReportStats;
  editedAt?: number;
  approvedAt?: number;
  approvedBy?: string;
}

export interface MmCloseCheckItem {
  kind: 'meeting' | 'task' | 'objection';
  id: string;
  title: string;
  reason: string;
}

export interface MmProject {
  id: string;
  name: string;
  desc: string;
  ownerId: string;
  memberIds: string[];
  status: MmProjectStatus;
  createdAt: number;
  createdBy: string;
  /** 最近一次结项检查（不通过时列出未完成事项） */
  closeCheck?: { at: number; ok: boolean; items: MmCloseCheckItem[] };
  summary?: MmReport;
  weeklyReports: MmReport[];
  archivedAt?: number;
}

// ─── 会议与纪要 ───────────────────────────────────────────────────────

export type MmMeetingSource = 'offline' | 'tencent' | 'zoom';

/** 纪要状态（需求 7.2） */
export type MmMeetingStatus =
  | 'pending_upload' // 待上传
  | 'processing' // 处理中（提取音轨、转写、识别、整理）
  | 'failed' // 失败
  | 'pending_assign' // 待指认
  | 'pending_confirm' // 待确认
  | 'pending_review' // 待终审
  | 'finalized' // 已定稿（纪要锁定，等主持人选生成任务 / 无需）
  | 'ended' // 已结束（无需生成任务）
  | 'pending_owner' // 待指定任务负责人（AI 已生成方案）
  | 'plan_confirm' // 方案待确认
  | 'dispatched'; // 已派发

export type MmFileKind = 'audio' | 'video' | 'transcript';

export interface MmMeetingFile {
  id: string;
  name: string;
  kind: MmFileKind;
  size: number;
  /** 拷进工作台数据目录后的路径 */
  path: string;
  uploadedAt: number;
}

export type MmProcessStage = 'extract' | 'transcribe' | 'diarize' | 'parse' | 'organize' | 'done';

export interface MmProcessState {
  stage: MmProcessStage;
  /** 0~100 */
  progress: number;
  startedAt?: number;
  finishedAt?: number;
  error?: string;
  log: Array<{ at: number; text: string }>;
}

/** 识别出来的一位发言人（声纹聚类 / 文字记录昵称） */
export interface MmSpeakerSlot {
  label: string; // 'S1' / 文字记录里的昵称
  personId?: string; // 识别 / 指认到的员工
  matchedBy?: 'voiceprint' | 'nickname' | 'manual';
  score?: number;
  /** 一小段音频（给主持人试听后指认）：工作台数据目录里的 wav 绝对路径 */
  clipPath?: string;
}

export interface MmSegment {
  id: string;
  /** 秒 */
  start: number;
  end: number;
  speakerLabel: string;
  text: string;
  /** 原始转写（发言人改过后保留原文） */
  originalText?: string;
  editedBy?: string;
  editedAt?: number;
  /** 主持人把这段改给了别人：识别时的发言人标签（只记第一次） */
  originalSpeakerLabel?: string;
  topicId?: string;
}

export interface MmTopic {
  id: string;
  title: string;
  segmentIds: string[];
}

export interface MmDecision {
  id: string;
  text: string;
  segmentIds: string[];
}

export interface MmConfirmation {
  personId: string;
  status: 'pending' | 'confirmed';
  /** 发出「发言待确认」的时间（超时催办从这里起算；被退回时更新为退回时间） */
  requestedAt?: number;
  confirmedAt?: number;
  /** 最近一次催办（超时催办不改状态） */
  remindedAt?: number;
  /** 被主持人退回 */
  returnedAt?: number;
  returnNote?: string;
}

export interface MmPlanItem {
  id: string;
  deptId: string;
  /** 执行事项 */
  title: string;
  /** 交付标准 */
  standard: string;
  /** 建议 / 设定的完成时间 'YYYY-MM-DD' */
  due: string;
  decisionId?: string;
  /** 下发给谁：不填 = 责任部门在通讯录里的第一位负责人；部门没设负责人、或要交给别人时由任务负责人指定（组织里任何在职的人） */
  assigneeId?: string;
}

export interface MmPlan {
  generatedAt: number;
  /** 方案概述（Markdown） */
  summary: string;
  /** 第一位任务负责人（兼容旧数据；新代码一律用 ownerIds） */
  ownerId?: string;
  /** 任务负责人（主持人指定，可以多位）：其中任何一位都能编辑 / 确认方案；派发出的每个任务都归这几位负责 */
  ownerIds?: string[];
  items: MmPlanItem[];
  confirmedAt?: number;
}

export interface MmMeeting {
  id: string;
  projectId: string;
  title: string;
  time: number;
  source: MmMeetingSource;
  hostId: string;
  attendeeIds: string[];
  createdBy: string;
  createdAt: number;
  status: MmMeetingStatus;
  files: MmMeetingFile[];
  process?: MmProcessState;
  speakers: MmSpeakerSlot[];
  segments: MmSegment[];
  topics: MmTopic[];
  decisions: MmDecision[];
  /** 正式纪要的 3 行摘要（企微卡片用） */
  summaryLines: string[];
  confirmations: MmConfirmation[];
  /** 进入待终审的时间 */
  reviewStartedAt?: number;
  finalizedAt?: number;
  finalizedBy?: string;
  /** 已定稿后主持人的选择 */
  taskDecision?: 'generate' | 'none';
  plan?: MmPlan;
  taskIds: string[];
  /** 时长（秒），处理完后填 */
  durationSec?: number;
}

// ─── 任务、异议 ───────────────────────────────────────────────────────

/** 任务状态（需求 7.3）；逾期是标记不是状态 */
export type MmTaskStatus = 'to_accept' | 'not_started' | 'in_progress' | 'done' | 'cancelled';

/** 异议处理阶段（任务处于异议处理中时） */
export type MmObjectionStage = 'review' | 'dept_reply' | 'arbitration' | 'resolved';

export interface MmObjection {
  id: string;
  /** 接收时叫「提出异议」，执行中叫「申请变更」，同一套流程 */
  kind: 'objection' | 'change';
  target: 'content' | 'time' | 'requirement';
  reason: string;
  suggestion: string;
  /** 建议的新截止日（时间类异议） */
  suggestedDue?: string;
  raisedBy: string;
  raisedAt: number;
  /** 发起前的任务状态（接受驳回 / 维持原方案时回到这里） */
  prevStatus: MmTaskStatus;
  stage: MmObjectionStage;
  review?: { by: string; at: number; decision: 'adopt' | 'reject'; note: string };
  arbitration?: { by: string; at: number; decision: 'keep' | 'adjust'; note: string };
  outcome?: 'adopted' | 'accepted_reject' | 'kept' | 'adjusted' | 'cancelled';
  resolvedAt?: number;
}

export interface MmProgressLog {
  at: number;
  by: string;
  status: MmTaskStatus;
  percent: number;
  note: string;
}

export interface MmTaskEvent {
  at: number;
  by: string;
  /** created / accepted / progress / done / objection_raised / review_adopt / review_reject / reply_accept / escalated / arbitrate_keep / arbitrate_adjust / cancelled / adjusted */
  action: string;
  note?: string;
}

export interface MmTask {
  id: string;
  projectId: string;
  meetingId: string;
  planItemId: string;
  deptId: string;
  /** 部门负责人（接收人） */
  assigneeId: string;
  /** 第一位任务负责人（兼容旧数据；判断权限 / 发通知一律用 ownerIds） */
  ownerId: string;
  /** 任务负责人（可多位，来自方案）：任何一位都能复核异议；完成 / 进度更新 / 逾期都通知每一位 */
  ownerIds?: string[];
  title: string;
  standard: string;
  due: string;
  status: MmTaskStatus;
  percent: number;
  createdAt: number;
  acceptedAt?: number;
  doneAt?: number;
  /** 处理中的异议（没有 = 不在异议处理中） */
  objection?: MmObjection;
  objectionHistory: MmObjection[];
  progressLog: MmProgressLog[];
  events: MmTaskEvent[];
  /** 提醒记录（只发提醒，不改状态） */
  reminders: { weeklyAt?: number; dueAt?: number; overdueAt?: number };
}

// ─── 消息中心与待办 ───────────────────────────────────────────────────

/** 推送事件（需求 6.8 推送事件清单，外加「任务已完成」通知任务负责人） */
export type MmNoticeType =
  | 'speech_confirm' // 发言待确认
  | 'speech_remind' // 未确认催办
  | 'minutes_review' // 纪要待终审
  | 'minutes_final' // 正式纪要已生成
  | 'plan_confirm' // 方案待确认
  | 'task_new' // 新任务待接收
  | 'task_progress_remind' // 进度更新提醒
  | 'task_due_remind' // 到期提醒
  | 'task_overdue' // 逾期提醒
  | 'objection_review' // 异议待复核
  | 'plan_adjusted' // 调整后方案待确认
  | 'arbitration' // 待裁决
  | 'arbitration_result' // 裁决结果
  | 'progress_report' // 进度汇总报告
  | 'summary_review' // 总结报告待审核
  | 'project_archived' // 项目已归档
  | 'task_done' // 任务已完成（通知任务负责人）
  | 'task_progress'; // 任务进度有更新（通知任务负责人）

export type MmLinkKind = 'meeting' | 'meeting_plan' | 'task' | 'project' | 'project_summary' | 'report';

export interface MmLink {
  kind: MmLinkKind;
  id: string;
  /** 会议纪要页定位到某段 / 报告 id 等 */
  anchor?: string;
}

export interface MmNotice {
  id: string;
  at: number;
  to: string;
  type: MmNoticeType;
  title: string;
  /** 企微卡片只放摘要，长文在系统内看 */
  summary: string;
  link: MmLink;
  read: boolean;
  wecom?: { sentAt?: number; error?: string };
}

export type MmTodoType =
  | 'assign_speaker' // 待指认（主持人）
  | 'confirm_speech' // 待确认发言（发言人）
  | 'review_minutes' // 待终审（主持人）
  | 'decide_tasks' // 已定稿待选择生成任务 / 无需（主持人）
  | 'assign_owner' // 待指定任务负责人（主持人）
  | 'confirm_plan' // 待确认方案（任务负责人）
  | 'accept_task' // 待接收任务（部门负责人）
  | 'update_progress' // 待更新进度（部门负责人，逾期 / 本周未更新）
  | 'review_objection' // 待复核异议（任务负责人）
  | 'dept_reply' // 异议被驳回待回应（部门负责人）
  | 'arbitrate' // 待裁决（项目负责人）
  | 'review_report' // 待审核总结报告（项目负责人）
  | 'retry_process'; // 处理失败待重试（主持人）

export interface MmTodo {
  id: string;
  type: MmTodoType;
  title: string;
  subtitle: string;
  /** 紧急：待裁决、逾期；今天：今天到期 / 超时；其余本周 */
  urgency: 'urgent' | 'today' | 'week';
  /** 等了多久 / 还剩多久的提示（「已等待 1 天」「剩 6 小时」「逾期 2 天」） */
  hint?: string;
  link: MmLink;
  at: number;
  group: 'meeting' | 'task' | 'project';
}

// ─── 视图模型（invoke 的返回）─────────────────────────────────────────

export interface MmMe {
  person: MmPerson | null;
  isAdmin: boolean;
  canCreateProject: boolean;
}

export interface MmTaskView extends MmTask {
  overdue: boolean;
  overdueDays: number;
  projectName: string;
  meetingTitle: string;
  deptName: string;
  assigneeName: string;
  ownerName: string;
}

/** people.list 的返回（不含已离职） */
export interface MmPeople {
  depts: MmDept[];
  people: MmPerson[];
}

/** meeting.list 的卡片 */
export interface MmMeetingCard {
  id: string;
  title: string;
  projectName: string;
  time: number;
  status: MmMeetingStatus;
  /** 这场会议上有当前身份的待办 */
  needsMe: boolean;
  /** 待确认：「已确认 3/5」；处理中：当前阶段（转写中 / 识别发言人 / 整理中…） */
  confirmText?: string;
  projectId?: string;
  source?: MmMeetingSource;
  hostId?: string;
  hostName?: string;
  /** 当前身份能否删除这场会议（项目未归档，且为主持人 / 创建人 / 项目负责人 / 管理员） */
  canDelete?: boolean;
  /** 已派发的关联任务数（删除确认提示用） */
  taskCount?: number;
}

/** meeting.get 的返回 */
export interface MmMeetingDetail {
  meeting: MmMeeting;
  projectName: string;
  projectStatus: MmProjectStatus;
  names: Record<string, { name: string; deptName: string }>;
  /** myLabels：当前身份在这场会议里对应的发言人标签（S1 / 昵称；声纹识别和手动指认都算） */
  my: { isHost: boolean; isSpeaker: boolean; isPlanOwner: boolean; myLabels: string[] };
  confirm: { done: number; total: number };
  tasks: MmTaskView[];
  /** 部门 id → 名称（方案条目显示用） */
  deptNames?: Record<string, string>;
  /** 部门 id → 第一负责人（任务会下发给他；不可用时为 null） */
  deptLeaders?: Record<string, { id: string; name: string } | null>;
  /** AI 方案正在生成 */
  planGenerating?: boolean;
  /** 当前身份在这场会议上能做的操作 */
  can?: {
    upload: boolean; retry: boolean; assign: boolean; edit: boolean; confirm: boolean; review: boolean;
    decide: boolean; setOwner: boolean; editPlan: boolean; confirmPlan: boolean;
  };
}

export interface MmHomeView {
  me: MmMe;
  greetingName: string;
  counts: { todos: number; dueToday: number; overdue: number; unread: number };
  todos: MmTodo[];
  myTasksThisWeek: MmTaskView[];
  projects: Array<{ id: string; name: string; status: MmProjectStatus; done: number; total: number; overdue: number; ownerName: string }>;
  recentMeetings: Array<{ id: string; title: string; projectName: string; status: MmMeetingStatus; time: number }>;
  notices: MmNotice[];
}

/** 本机语音模型后台下载状态（由主进程持久维护，切换页面不重置） */
export interface MmModelDownloadState {
  activeId: string | null;
  queue: string[];
  percent: number | null;
  line: string;
  error: string;
  updatedAt: number;
}

/** 工作台事件（WORKBENCH_MM_EVENT）：数据变了让界面刷新；处理进度；手机页服务状态；模型后台下载进度 */
export type MmEvent =
  | { type: 'changed'; scope: 'all' | 'org' | 'settings' | 'project' | 'meeting' | 'task' | 'notice'; id?: string }
  | { type: 'process'; meetingId: string; stage: MmProcessStage; progress: number; text?: string }
  | { type: 'mobile'; running: boolean; url?: string }
  | { type: 'model_download'; status: MmModelDownloadState };

/** 统一动作通道：invoke(action, payload) → 结果 / 抛中文错误 */
export interface MmInvokeRequest {
  action: string;
  payload?: unknown;
}
