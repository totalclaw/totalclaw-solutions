/**
 * 解决方案 · 流程时效监控智能体的 IPC 数据结构。docs/flow-sla-workbench.md
 *
 * 一条动作通道 WORKBENCH_FS_INVOKE（{ action, payload }），状态变化经 WORKBENCH_FS_EVENT 推给渲染层。
 * 这里只放类型与字段清单，不带运行时依赖。计算结果的结构与主进程 services/flowSla/calc.ts 一致。
 */

export type FsSystem = 'OA' | '费控' | 'CSS';
export type FsFlowStatus = 'done' | 'running' | 'terminated';
export type FsPeriodKind = 'weekly' | 'monthly';
export type FsSlot = 'flow' | 'node' | 'roster';

/** i18n-ignore: 三个来源系统的标识，是导入数据和规则表里的取值，拿来逐字比较，不是界面文案 */
export const FS_SYSTEMS: FsSystem[] = ['OA', '费控', 'CSS'];

/** 流程表（一行一个流程）的列角色 */
export const FS_FLOW_ROLES = ['flowNo', 'flowName', 'feeType', 'title', 'initiator', 'dept', 'status', 'startAt', 'endAt', 'amount', 'currentNode', 'currentHandler'] as const;
/** 节点表（一行一次节点处理）独有的列角色 */
export const FS_NODE_ROLES = ['node', 'handler', 'nodeStart', 'nodeEnd'] as const;
export const FS_ROSTER_ROLES = ['name', 'dept', 'email', 'identity'] as const;

export interface FsPeriod {
  kind: FsPeriodKind;
  /** 统计周期 [start, end)，毫秒 */
  start: number;
  end: number;
  /** 数据导出时刻：在途时长算到这一刻 */
  asOf: number;
  label: string;
}

export interface FsTablePreview {
  path: string;
  fileName: string;
  sheetName: string;
  sheetNames: string[];
  headers: string[];
  rowCount: number;
  preview: Record<string, string>[];
  mapping: Record<string, string>;
  /** 表头所在行（从 1 数） */
  headerRow: number;
  /** 这张表同时带流程列和节点列（一行一个节点、流程字段重复） */
  combined: boolean;
}

export interface FsTableSpec { path: string; sheet?: string; mapping: Record<string, string> }

export interface FsIngestRequest {
  period: FsPeriod;
  systems: Partial<Record<FsSystem, { flow?: FsTableSpec; node?: FsTableSpec }>>;
  roster?: FsTableSpec;
}

export interface FsSkip { file: string; reason: string; count: number; rows: number[] }

export interface FsIngestSummary {
  systems: Array<{ system: FsSystem; flows: number; nodes: number; done: number; running: number; terminated: number; derived: boolean }>;
  roster: number;
  rosterWithEmail: number;
  skipped: FsSkip[];
  warnings: string[];
  files: string[];
  at: string;
}

// ── 计算结果 ─────────────────────────────────────────

export type FsRunningLabel = 'overdue' | 'risk' | 'normal' | 'no_limit';

export interface FsFlowResult {
  system: FsSystem;
  flowNo: string;
  flowName: string;
  title: string;
  category: string;
  flowType: string;
  typeMatched: boolean;
  initiator: string;
  dept: string;
  status: FsFlowStatus;
  startAt: number;
  endAt: number | null;
  days: number;
  limitDays: number | null;
  overtime: boolean | null;
  runningLabel: FsRunningLabel | null;
  overdueDays: number;
  currentNode: string;
  currentHandler: string;
  currentNodeDays: number | null;
  approx: boolean;
  inPeriod: boolean;
}

export interface FsReviewResult {
  system: FsSystem;
  flowNo: string;
  flowName: string;
  flowType: string;
  category: string;
  node: string;
  handler: string;
  identity: string;
  dept: string;
  startAt: number;
  endAt: number;
  days: number;
  unit: string;
  limit: number;
  compliant: boolean;
}

export interface FsTypeStat {
  category: string;
  flowType: string;
  system: string;
  doneCount: number;
  avgDays: number | null;
  limitDays: number | null;
  judged: number;
  overtime: number;
  complianceRate: number | null;
  runningCount: number;
  runningOverdue: number;
  runningOverdueRate: number | null;
}

export interface FsPersonStat { name: string; identity: string; dept: string; count: number; compliant: number; rate: number | null; avgDays: number | null; rank: number }

export interface FsOverall {
  doneCount: number;
  avgDays: number | null;
  judged: number;
  overtime: number;
  complianceRate: number | null;
  runningCount: number;
  runningOverdue: number;
  runningRisk: number;
  reviewCount: number;
  reviewCompliant: number;
  reviewRate: number | null;
}

export interface FsCalcView {
  period: FsPeriod;
  snapshotId: string;
  overall: FsOverall;
  byCategory: FsTypeStat[];
  byType: FsTypeStat[];
  reviewerRank: FsPersonStat[];
  initiatorRank: FsPersonStat[];
  runningByInitiator: Array<{ name: string; count: number; overdue: number; risk: number }>;
  /** 本期办结且超时的流程 */
  overtime: FsFlowResult[];
  /** 在途已逾期 / 较大逾期风险 */
  runningAbnormal: FsFlowResult[];
  /** 没有时效要求或用结束减开始近似的流程数 */
  approxCount: number;
  noLimitCount: number;
}

export interface FsCheckView {
  counts: FsIngestSummary['systems'];
  unmatched: Array<{ system: FsSystem; flowName: string; count: number; regular: boolean }>;
  unknownNodes: Array<{ system: FsSystem; flowName: string; node: string; count: number }>;
  outOfRoster: string[];
  rosterCount: number;
  /** 可以把流程名对上去的规则细类（按系统） */
  ruleTypes: Array<{ system: string; category: string; flowType: string }>;
  aliases: Array<{ system: FsSystem; flowName: string; target: string }>;
  decisions: Array<{ system: FsSystem; flowName: string; node: string; internal: boolean }>;
}

export interface FsTypeCompare {
  category: string;
  flowType: string;
  system: string;
  doneCount: number;
  avgDays: number | null;
  prevAvgDays: number | null;
  avgDelta: number | null;
  complianceRate: number | null;
  prevComplianceRate: number | null;
  rateDelta: number | null;
  abnormal: boolean;
  reasons: string[];
}

export interface FsNodeStat { node: string; internal: boolean | null; count: number; avgDays: number; maxDays: number; avgWaitDays: number; share: number; stuckCount: number; avgStuckDays: number | null }
export interface FsNodeAnalysis { flowType: string; system: string; nodes: FsNodeStat[]; longestNode: string }

export interface FsOverallDelta { doneCount: number | null; avgDays: number | null; complianceRate: number | null; runningCount: number | null; runningOverdue: number | null; reviewRate: number | null }

export interface FsCompareView {
  current: FsSnapshotMeta;
  previous: FsSnapshotMeta | null;
  candidates: FsSnapshotMeta[];
  delta: FsOverallDelta;
  types: FsTypeCompare[];
  abnormal: Array<FsTypeCompare & { analysis: FsNodeAnalysis }>;
  /** 月报：本年度发起、仍未办结且已超时的在途流程 */
  yearOverdue: FsFlowResult[];
}

export interface FsSnapshotMeta {
  id: string;
  kind: FsPeriodKind;
  label: string;
  periodStart: number;
  periodEnd: number;
  savedAt: string;
  overall: FsOverall;
  byType: Array<Pick<FsTypeStat, 'category' | 'flowType' | 'system' | 'doneCount' | 'avgDays' | 'complianceRate'>>;
}

// ── 超时原因 ─────────────────────────────────────────

export const FS_REASON_CATEGORIES = ['materials', 'absence', 'cross_dept', 'external', 'system', 'design', 'other'] as const;
export type FsReasonCategory = typeof FS_REASON_CATEGORIES[number];

export interface FsCase {
  key: string;
  system: FsSystem;
  flowNo: string;
  flowName: string;
  title: string;
  flowType: string;
  category: string;
  kind: 'overtime' | 'running';
  days: number;
  limitDays: number | null;
  overdueDays: number;
  currentNode: string;
  initiator: string;
  owner: string;
  ownerEmail: string;
  ownerRole: 'handler' | 'reviewer' | 'initiator';
  reason: string;
  categoryId: FsReasonCategory | '';
  classifiedBy: '' | 'rule' | 'model' | 'manual';
  mailedAt: string;
}

export interface FsOwnerMail { owner: string; email: string; count: number; subject: string; body: string; mailedAt: string }

export interface FsSuggestion { item: string; dept: string; owner: string; requirement: string; deadline: string; acceptance: string }

export interface FsSession {
  period: FsPeriod | null;
  ingest: FsIngestSummary | null;
  snapshotId: string;
  prevSnapshotId: string;
  cases: FsCase[];
  rootCauses: Partial<Record<FsReasonCategory, string>>;
  summary: string;
  suggestions: FsSuggestion[];
  summaryBy: '' | 'rule' | 'model' | 'manual';
  reportFiles: string[];
  sentAt: string;
  ledgerWritten: boolean;
}

export interface FsReportPreview {
  kind: FsPeriodKind;
  subject: string;
  /** 邮件正文（纯文本） */
  text: string;
  /** 通报正文的网页版，用来预览；周报同时作为附件 */
  html: string;
  files: Array<{ name: string; path: string }>;
}

// ── 在途跟进、改善台账 ─────────────────────────────────

export interface FsTrackNote { at: string; text: string; kind: 'note' | 'mail' | 'system' }

export interface FsTrackItem {
  key: string;
  system: FsSystem;
  flowNo: string;
  flowName: string;
  title: string;
  flowType: string;
  category: string;
  initiator: string;
  handler: string;
  handlerEmail: string;
  currentNode: string;
  startAt: number;
  days: number;
  limitDays: number | null;
  overdueDays: number;
  currentNodeDays: number | null;
  intervalDays: number;
  firstSeenAt: string;
  lastFollowAt: string;
  nextFollowAt: string;
  /** 已经为哪一次到期发过提醒（等于当时的 nextFollowAt） */
  notifiedFor: string;
  notes: FsTrackNote[];
  closedAt: string;
  closeReason: string;
}

export type FsLedgerStatus = 'doing' | 'done' | 'overdue' | 'archived';

export interface FsLedgerItem {
  id: string;
  item: string;
  dept: string;
  owner: string;
  requirement: string;
  /** YYYY-MM-DD */
  deadline: string;
  acceptance: string;
  status: FsLedgerStatus;
  escalated: boolean;
  source: string;
  progress: Array<{ at: string; text: string }>;
  createdAt: string;
  updatedAt: string;
  /** 已经为哪个期限发过到期前确认提醒 */
  remindedFor: string;
  /** 已经为哪个期限发过逾期督办提醒 */
  escalatedFor: string;
}

export interface FsReminder { id: string; at: string; type: 'follow_up' | 'ledger_due' | 'ledger_overdue'; title: string; body: string }

// ── 规则、设置、总状态 ─────────────────────────────────

export interface FsThresholds {
  amountThreshold: number;
  riskRatio: number;
  avgIncreaseDays: number;
  minComplianceRate: number;
  internalDays: number;
  externalDays: number;
  improveRemindDays: number;
}

export interface FsRulesView {
  version: string;
  custom: boolean;
  e2e: Array<{ category: string; flowType: string; system: string; limitDays: number | null; variants?: Array<{ keyword: string; limitDays: number }>; fallback?: boolean }>;
  cssNodes: Array<{ flowType: string; feeType: string; node: string; internal: boolean; limitWorkdays: number | null; note?: string }>;
  oaFkNodes: Array<[string, string, boolean]>;
  personal: Array<{ identity: string; category: string; flowType: string; platform: string; amount: 'le10w' | 'gt10w' | 'any'; importance: string; limitDays: number | null }>;
  managers: string[];
  thresholds: FsThresholds;
  holidays: string[];
  extraWorkdays: string[];
}

export interface FsSettings {
  outputDir: string;
  weeklyRecipients: string;
  monthlyRecipients: string;
  holidays: string[];
  extraWorkdays: string[];
}

export interface FsMailStatus { address: string; smtpConfigured: boolean; officialRelay: boolean }

export interface FsState {
  settings: FsSettings;
  outputDir: string;
  session: FsSession;
  snapshots: FsSnapshotMeta[];
  tracking: FsTrackItem[];
  ledger: FsLedgerItem[];
  reminders: FsReminder[];
  mail: FsMailStatus;
  rules: { version: string; custom: boolean; counts: { e2e: number; cssNodes: number; oaFkNodes: number; personal: number; managers: number } };
  thresholds: FsThresholds;
  hasData: boolean;
}

export interface FsBoardFilters { snapshotId?: string; system?: string; category?: string; flowType?: string; dept?: string }

export interface FsBoardView {
  snapshot: FsSnapshotMeta | null;
  /** 按周期类型分开的趋势点 */
  trend: Array<{ id: string; kind: FsPeriodKind; label: string; periodEnd: number; complianceRate: number | null; avgDays: number | null; doneCount: number }>;
  overall: FsOverall | null;
  byCategory: FsTypeStat[];
  byType: FsTypeStat[];
  reviewerRank: FsPersonStat[];
  flows: FsFlowResult[];
  flowTotal: number;
  options: { systems: string[]; categories: string[]; flowTypes: string[]; depts: string[] };
}
