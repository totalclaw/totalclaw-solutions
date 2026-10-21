/**
 * 解决方案 · 配件预警与补库智能体 —— IPC 数据契约。docs/parts-alert-workbench.md
 *
 * 一条动作通道 WORKBENCH_PA_INVOKE（{ action, payload }），状态变化经 WORKBENCH_PA_EVENT 推给渲染层。
 * 库存状态、断货日、补库量全部由主进程的公式算出，每条结果带算式依据（basis）。
 */

export type PaPartState = 'stagnant' | 'redundant' | 'healthy' | 'at_risk' | 'out_of_stock';
/** 越紧急越靠前 */
export const PA_STATES: PaPartState[] = ['out_of_stock', 'at_risk', 'stagnant', 'redundant', 'healthy'];

export type PaDatasetKey = 'monthly' | 'yearly' | 'leadTime' | 'inTransit' | 'stock';
export const PA_DATASETS: PaDatasetKey[] = ['monthly', 'yearly', 'leadTime', 'inTransit', 'stock'];

/** 各数据集可对应的列；required 的列认不出来就读不了这份表 */
export const PA_DATASET_ROLES: Record<PaDatasetKey, Array<{ key: string; required?: boolean }>> = {
  monthly: [{ key: 'partNo', required: true }, { key: 'partName' }, { key: 'month', required: true }, { key: 'shipQty', required: true }],
  yearly: [{ key: 'partNo', required: true }, { key: 'partName' }, { key: 'year', required: true }, { key: 'shipQty', required: true }],
  leadTime: [{ key: 'partNo', required: true }, { key: 'leadDays', required: true }, { key: 'moq' }, { key: 'unitPrice' }, { key: 'supplier' }],
  inTransit: [{ key: 'partNo', required: true }, { key: 'transitQty', required: true }, { key: 'eta' }, { key: 'orderNo' }, { key: 'supplier' }],
  stock: [{ key: 'partNo', required: true }, { key: 'partName' }, { key: 'stockQty', required: true }, { key: 'warehouse' }, { key: 'unitPrice' }],
};

export interface PaRules {
  /** 安全库存天数 */
  safetyDays: number;
  /** 补货周期（两次下单之间的天数） */
  reviewDays: number;
  /** 库存可用月数超过它算冗余 */
  redundantMonths: number;
  /** 连续多少个月没有发货算呆滞 */
  stagnantMonths: number;
  /** 呆滞后超过多少个月没有发货，建议做报废评估 */
  scrapMonths: number;
  /** 提前期表里没有该配件时用的默认天数 */
  defaultLeadDays: number;
  /** 是否按去年同期做季节修正 */
  seasonal: boolean;
}

export interface PaPartAction { kind: string; text: string }

export interface PaPartResult {
  partNo: string;
  partName: string;
  state: PaPartState;
  stockQty: number;
  inTransitQty: number;
  earliestEta: string;
  leadDays: number;
  leadDaysDefaulted: boolean;
  dailyDemand: number;
  monthlyDemand: number;
  coverDays: number | null;
  lastShipMonth: string;
  monthsSinceLastShip: number | null;
  stockoutDate: string;
  latestOrderDate: string;
  yearlyTrend: number | null;
  hasInTransit: boolean;
  actions: PaPartAction[];
  suggestQty: number;
  suggestAmount: number | null;
  basis: string[];
  /** 供应商：提前期表优先，其次在途订单 */
  supplier: string;
  /** 单价：库存表优先，其次提前期表；没有为 null */
  unitPrice: number | null;
}

export interface PaSummary {
  asOf: string;
  total: number;
  byState: Record<PaPartState, number>;
  replenishParts: number;
  replenishQty: number;
  replenishAmount: number;
  partsWithoutStockRow: string[];
  partsWithDefaultLead: string[];
}

/** 行动计划分组：呆滞处理建议 / 冗余处理建议 / 有采购在途的缺货管控 / 无采购在途的缺货管控 */
export type PaPlanGroup = 'stagnant' | 'redundant' | 'shortage_transit' | 'shortage_none';
export const PA_PLAN_GROUPS: PaPlanGroup[] = ['shortage_none', 'shortage_transit', 'stagnant', 'redundant'];
/** 这两组没检验完不能进补库清单 */
export const PA_BLOCKING_GROUPS: PaPlanGroup[] = ['shortage_none', 'shortage_transit'];

export type PaReviewStatus = 'pending' | 'confirmed' | 'rejected';
export interface PaReview {
  status: PaReviewStatus;
  /** 人改过的行动计划文字；没改过为空，用系统建议 */
  text?: string;
  remark?: string;
  at?: string;
}

export interface PaReplenishEdit {
  selected?: boolean;
  qty?: number;
  supplier?: string;
  expectDate?: string;
  unitPrice?: number | null;
}

export interface PaReplenishLine {
  partNo: string;
  partName: string;
  state: PaPartState;
  /** 公式算出的建议量，不随人工修改变化 */
  suggestQty: number;
  /** 下单量：默认等于建议量，可人工改 */
  qty: number;
  supplier: string;
  expectDate: string;
  unitPrice: number | null;
  amount: number | null;
  selected: boolean;
  leadDays: number;
  stockoutDate: string;
  basis: string[];
}

export interface PaSkippedRow { row: number; reason: string }

export interface PaDatasetMeta {
  path: string;
  fileName: string;
  sheetName: string;
  sheetNames: string[];
  headers: string[];
  /** 表里的数据行数 */
  rowCount: number;
  preview: Record<string, string>[];
  mapping: Record<string, string>;
  /** long = 一行一条；wide = 一列一个月份 / 年份 */
  layout: 'long' | 'wide';
  /** 横表里认出的期间列数与范围 */
  periodColumns: number;
  periodFrom: string;
  periodTo: string;
  /** 必填列里没认出来的 */
  missing: string[];
  loaded: boolean;
  /** 读进来的记录数 */
  count: number;
  skippedCount: number;
  /** 跳过的行（最多保留 50 条）及原因 */
  skipped: PaSkippedRow[];
  notes: string[];
  loadedAt: string;
}

export interface PaExported {
  at: string;
  orderFile: string;
  planFile: string;
  lines: number;
  qty: number;
  amount: number;
}

export interface PaRun {
  id: string;
  asOf: string;
  computedAt: string;
  rules: PaRules;
  summary: PaSummary;
  /** 规则或数据在运算之后改过：结果不能再用，要重新运算 */
  stale: boolean;
  staleReason: string;
  reviews: Record<string, PaReview>;
  edits: Record<string, PaReplenishEdit>;
  replenishConfirmedAt: string;
  exported: PaExported | null;
}

export interface PaHistoryEntry {
  id: string;
  at: string;
  asOf: string;
  source: 'manual' | 'schedule';
  total: number;
  byState: Record<PaPartState, number>;
  replenishParts: number;
  replenishQty: number;
  replenishAmount: number;
  /** 相比上一次运算新出现的已缺货 / 将缺货配件号 */
  newOut: string[];
  newRisk: string[];
  files: string[];
  note: string;
}

export interface PaSchedule {
  enabled: boolean;
  /** HH:mm */
  time: string;
  folder: string;
  /** 文件名里含这些字的最新文件，当作对应数据集 */
  keywords: Record<PaDatasetKey, string[]>;
  notify: boolean;
  emailEnabled: boolean;
  /** 收件人，逗号或分号分隔 */
  emailTo: string;
}

export interface PaScheduleStatus {
  lastRunDay: string;
  lastRunAt: string;
  lastOk: boolean;
  lastMessage: string;
  /** 这次定时运算用到的文件 */
  lastFiles: string[];
}

export interface PaSettings {
  rules: PaRules;
  outputDir: string;
  schedule: PaSchedule;
}

export interface PaLatest {
  at: string;
  asOf: string;
  source: 'manual' | 'schedule';
  summary: PaSummary;
}

export interface PaWorkbenchState {
  settings: PaSettings;
  /** 实际使用的输出目录（没设置时是默认目录） */
  outputDir: string;
  defaults: { rules: PaRules; keywords: Record<PaDatasetKey, string[]> };
  datasets: Record<PaDatasetKey, PaDatasetMeta | null>;
  run: PaRun | null;
  /** 行动计划各组还没检验的数量 */
  pending: Record<PaPlanGroup, number>;
  lines: PaReplenishLine[];
  history: PaHistoryEntry[];
  scheduleStatus: PaScheduleStatus;
  latest: PaLatest | null;
}
