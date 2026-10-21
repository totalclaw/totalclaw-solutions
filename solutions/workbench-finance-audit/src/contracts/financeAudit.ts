/**
 * 解决方案 · 财会审计（finance-audit）—— 契约类型。设计稿：docs/finance-audit-solution.md
 *
 * 类型前缀 Fau，避开财务智能体已用的 Fa。一条动作通道 WORKBENCH_FINAUDIT_INVOKE（{action, payload}）
 * + 一条推送通道 WORKBENCH_FINAUDIT_EVENT。
 *
 * 合规边界（写进代码，见第 9 节）：所有产出都是草稿；不过账、不付款、不提交申报、不对外发送、
 * 不出具审计 / 鉴证意见。金额一律存最小货币单位整数（分 / 哈拉拉），模型只抽取与写说明。
 *
 * 文案字段（name / summary / message …）存的是**词典 key**（中文），由展示端 $t / 主进程 tIn 翻译，
 * 不在产出方当场翻译（切换语言后不会腌死在旧语言）。
 *
 * 本文件由多个批次追加：每个分组只在自己的锚点段落里写（第 16.2 节），避免并行冲突。
 */

// ═══ 公共 ════════════════════════════════════════════════════════════════════

/** 与 @totalclaw/i18n 的 SupportedLocale 同值 */
export type FauLocale = 'zh-CN' | 'en-US' | 'ar';
export const FAU_LOCALES: FauLocale[] = ['zh-CN', 'en-US', 'ar'];

export type FauGroup = 'platform' | 'accounting' | 'audit' | 'tax' | 'fpa' | 'treasury' | 'capital';
export const FAU_GROUPS: FauGroup[] = ['platform', 'accounting', 'audit', 'tax', 'fpa', 'treasury', 'capital'];
export type FauArchetype = 'R' | 'S' | 'H' | 'P';
/** 地区档案：中国、国际（批次 1 开放）；沙特、阿联酋（阿语地区，结构预留，税制规则批次 4） */
export type FauRegion = 'CN' | 'SA' | 'AE' | 'INTL';
export type FauStandard = 'CAS' | 'ASBE' /* 小企业会计准则 */ | 'IFRS' | 'IFRS_SME' | 'SOCPA' | 'SOCPA_SME';
export type FauInputKind =
  | 'journal' | 'tb' | 'bank' | 'subledger' | 'ar' | 'ap' | 'po' | 'grn' | 'invoice'
  | 'fa_register' | 'payroll' | 'budget' | 'kpi' | 'contract' | 'policy' | 'evidence'
  | 'confirmation' | 'kyc_packet' | 'lp_statement' | 'nav_pack' | 'model_xlsx' | 'deck'
  | 'market_data' | 'free_text'
  // 批次 1 补充：计提政策表、期末汇率表（第 5.5 节 A1 第 ② 步可选输入）
  | 'accrual_policy' | 'fx_rates'
  // 批次 5 补充：量价表（预算量差价差 D4、标准成本差异 D5）
  | 'price_volume'
  // 批次 4：税务组的数据集类型定义在 tax 段落（FauTaxInputKind）
  | FauTaxInputKind
  // 批次 2 补充（A3–A8 第 ② 步）：收款记录、客户档案、供应商档案、可用资金、报销明细、资产增减单、内部往来、担保台账
  | 'receipt' | 'customer' | 'supplier' | 'funds' | 'expense_claim' | 'fa_movement' | 'intercompany' | 'guarantee'
  // 批次 6 补充：资金与金融风险的输入（类型定义在 treasury 段）
  | FauTreasuryInputKind;
export type FauOutputKind = 'xlsx' | 'docx' | 'pdf' | 'pptx' | 'md' | 'je_import_xlsx';
export type FauSignLevel = 'prepare' | 'review' | 'approve';
export const FAU_SIGN_LEVELS: FauSignLevel[] = ['prepare', 'review', 'approve'];
/** 套餐：决定首页显示哪些分组（第 4.1 节） */
export type FauPackage = 'core' | 'audit' | 'tax' | 'fpa' | 'treasury' | 'capital';
export type FauBundle = 'all' | 'accounting' | 'audit' | 'tax' | 'fpa' | 'treasury' | 'capital';

/** 词典 key + 插值参数（展示端翻译） */
export interface FauMsg {
  key: string;
  params?: Record<string, string | number>;
}

// ─── 模块目录（第 4.2 节，数据驱动；定义在 shared/financeAudit/catalog/） ───

export interface FauModuleMode {
  id: string;
  /** 词典 key */
  name: string;
  /** 用到的技能目录名（finance-audit/<skill>） */
  skills: string[];
  /** 规则引擎（主进程纯函数）id */
  engines?: string[];
}

export interface FauModuleInput {
  /** 槽位 id（同一模块里可能有两份同类数据，如总账提取 / 子账提取） */
  id: string;
  kind: FauInputKind;
  required: boolean;
  /** 词典 key：这份数据是什么 */
  label: string;
  /** 词典 key：怎么导出（查询路径摘要） */
  help: string;
  /** 只在这些模式下出现；不写 = 全部模式 */
  modes?: string[];
  /** 写了就只在这些模式下必需（覆盖 required） */
  requiredModes?: string[];
  multi?: boolean;
}

export interface FauProvenance {
  repo: 'financial-services' | 'finance-skills' | 'self-built';
  path: string;
  type: string;
}

export interface FauModuleDef {
  id: string;
  code: string;
  group: FauGroup;
  name: string;
  summary: string;
  archetype: FauArchetype;
  modes: FauModuleMode[];
  inputs: FauModuleInput[];
  outputs: FauOutputKind[];
  signoff: { required: boolean; levels: FauSignLevel[] };
  regions: FauRegion[] | 'all';
  standards?: FauStandard[];
  connectors?: string[];
  quickActions?: { id: string; name: string; skill: string; command?: string }[];
  handoffTo?: string[];
  reuse?: { workbench: string; action?: string; route?: string; label?: string }[];
  package: FauPackage;
  status: 'ready' | 'planned';
  batch: number;
  /** 来源（由 sourceInventory.json 按模块编号汇总，许可证说明用） */
  provenance: FauProvenance[];
}

/** catalog.get 返回：定义 + 当前公司下的可用状态 */
export interface FauCatalogItem extends FauModuleDef {
  /** 当前地区档案下是否适用（不适用的首页隐藏） */
  applicable: boolean;
  /** 当前套餐是否显示 */
  visible: boolean;
}

// ─── 地区档案（第 13.4 节） ───

export interface FauRegionProfile {
  id: FauRegion;
  name: string;
  /** 批次 1 只开放 CN / INTL；SA / AE 结构预留（批次 4） */
  available: boolean;
  plannedBatch?: number;
  standards: FauStandard[];
  defaultStandard: FauStandard;
  currency: string;
  /** 是否附回历显示 */
  hijri: boolean;
  /** 内控 / 审计框架（词典 key） */
  frameworks: string[];
  /** 税制（词典 key，界面上的选项说明；税率、期限只放 RegionRule 规则表） */
  taxRegimes: string[];
  /** 用到的 RegionRule id（税率、期限只放规则表） */
  ruleIds: string[];
  /** 未经当地专业人员审核前标「草稿口径」 */
  draftBasis: boolean;
}

// ─── 公司档案（P1）与项目空间（P2） ───

export type FauErp = 'yonyou' | 'kingdee' | 'sap' | 'oracle' | 'chanjet' | 'other';

export interface FauSigner {
  id: string;
  name: string;
  title: string;
  levels: FauSignLevel[];
}

/** 科目 → 报表大类 / 行 */
export type FauAccountClass = 'asset' | 'liability' | 'equity' | 'revenue' | 'expense' | 'common';
export interface FauAccountMapEntry {
  code: string;
  name: string;
  cls: FauAccountClass | '';
  /** 报表行 key（reportMap.json 的 key，或 IFRS 行） */
  line: string;
  /** auto：按编码前缀 / 名称自动识别；manual：人确认过 */
  source: 'auto' | 'manual';
}

export interface FauCompany {
  id: string;
  name: string;
  /** 统一社会信用代码 / 商业登记号 */
  regNo: string;
  vatNo: string;
  regions: FauRegion[];
  region: FauRegion;
  standard: FauStandard;
  currency: string;
  fiscalYearStartMonth: number;
  hijriFiscalYear: boolean;
  erp: FauErp;
  accountMap: FauAccountMapEntry[];
  /** 科目映射是否已全部确认（自动完成或人工确认） */
  accountMapConfirmed: boolean;
  /** 阈值覆盖：thresholds/<module>.json 里的 key → 值 */
  thresholds: Record<string, number>;
  signers: FauSigner[];
  /** 职责分离：阻断 / 允许但记录 */
  sodMode: 'block' | 'record';
  packages: FauPackage[];
  outputLocale: FauLocale;
  /** 示例公司（一键体验的示例项目挂在这里，可一键删除） */
  sample?: boolean;
  /** 用「用默认配置开始」建的：首页提示还有哪几项用的是默认值，走完一遍完整向导后清掉 */
  quickStart?: boolean;
  createdAt: string;
  updatedAt: string;
}

export type FauProjectType = 'month_close' | 'annual_audit' | 'filing' | 'controls' | 'ma' | 'custom';
export interface FauProject {
  id: string;
  companyId: string;
  name: string;
  type: FauProjectType;
  /** YYYY-MM（月结）或 YYYY */
  period: string;
  prevProjectId?: string;
  status: 'open' | 'closed' | 'archived';
  createdAt: string;
  updatedAt: string;
}

export interface FauProjectStatus {
  project: FauProject;
  prev?: FauProject | null;
  runs: FauRunSummary[];
  datasets: FauDatasetMeta[];
  signoff: { pending: number; signed: number; returned: number };
  artifacts: Array<FauArtifact & { runId: string; moduleId: string }>;
}

// ─── 数据集（P3） ───

export interface FauIssue {
  id: string;
  level: 'block' | 'warn';
  code: string;
  message: FauMsg;
  /** 原表行号（1-based，含表头那一行之后的第一行 = 2） */
  rows?: number[];
}

export interface FauDatasetMeta {
  id: string;
  projectId: string;
  kind: FauInputKind;
  /** 导入时对应的模块槽位（同项目其它模块可直接引用） */
  slot?: string;
  moduleId?: string;
  label: string;
  fileName: string;
  /** 原文件路径（只读，仅作记录） */
  sourcePath: string;
  /** 复制进项目 files/ 的副本 */
  storedPath: string;
  sha256: string;
  sheetName?: string;
  mapping: Record<string, string>;
  rowCount: number;
  importedAt: string;
  from: 'file' | 'finance-agent' | 'handoff';
  issues: FauIssue[];
  /** 金额币种（数据集内金额均为最小货币单位整数） */
  currency?: string;
}

/** data.inspect 返回：给 TableMapping 确认列 */
export interface FauInspectResult {
  path: string;
  fileName: string;
  kind: FauInputKind;
  sheetName: string;
  sheetNames: string[];
  headers: string[];
  rowCount: number;
  preview: Record<string, string>[];
  mapping: Record<string, string>;
  roles: { key: string; label: string; required?: boolean }[];
  missing: string[];
  /** 按表头特征识别出的 ERP 导出格式（erpProfiles.json） */
  erpProfile?: string;
}

// ─── 运行（七步，第 5.4 节） ───

export type FauStepKey = 'setup' | 'upload' | 'validate' | 'analyze' | 'draft' | 'signoff' | 'archive';
export const FAU_STEP_KEYS: FauStepKey[] = ['setup', 'upload', 'validate', 'analyze', 'draft', 'signoff', 'archive'];
export type FauStepStatus = 'todo' | 'running' | 'done' | 'failed' | 'blocked' | 'interrupted';

export interface FauSubProgress {
  id: string;
  label: FauMsg;
  status: 'todo' | 'running' | 'done' | 'failed' | 'skipped';
  summary?: FauMsg;
}

export interface FauStepState {
  status: FauStepStatus;
  startedAt?: number;
  finishedAt?: number;
  /** 最近一次进度 / 心跳（看门狗用） */
  progressAt?: number;
  /** 预计秒数（看门狗用） */
  estimateSec?: number;
  kind?: 'llm' | 'scan' | 'generic';
  error?: FauMsg;
  summary?: FauMsg;
  sub?: FauSubProgress[];
}

export interface FauReminder {
  id: string;
  source: 'validate' | 'verify' | 'escalation' | 'engine';
  level: 'warn' | 'block';
  message: FauMsg;
  /** 只能由批准人逐条勾选（如跨期调整 > 5 万） */
  approverOnly?: boolean;
}

export interface FauVerificationItem {
  id: string;
  /** 哪段叙述：如 flux:6602 / break:xxx */
  ref: string;
  text: string;
  status: 'verified' | 'unverified';
  /** 没在数据里找到的数字 / 单号 */
  missing?: string[];
}

export interface FauArtifact {
  id: string;
  kind: FauOutputKind;
  title: FauMsg;
  path: string;
  sha256: string;
  locale: FauLocale;
  createdAt: string;
}

export interface FauValidationReport {
  checks: { id: string; ok: boolean; level: 'block' | 'warn'; message: FauMsg }[];
  blockers: FauIssue[];
  warnings: FauIssue[];
}

export type FauRunStatus = 'draft' | 'running' | 'ready' | 'signing' | 'returned' | 'archived' | 'void';

export interface FauConfidence {
  data: 'high' | 'medium' | 'low';
  method: 'high' | 'medium' | 'low';
  overall: 'high' | 'medium' | 'low';
}

export interface FauRun {
  id: string;
  projectId: string;
  companyId: string;
  moduleId: string;
  modeId: string;
  outputLocale: FauLocale;
  params: Record<string, unknown>;
  /** 槽位 id → 数据集 id */
  inputs: Record<string, string[]>;
  status: FauRunStatus;
  steps: Record<FauStepKey, FauStepState>;
  validation?: FauValidationReport;
  /** 模块结果（accounting 段的 FauCloseResult / FauReconResult …） */
  result?: unknown;
  verification: FauVerificationItem[];
  reminders: FauReminder[];
  /** 需要的签核级别（含升级规则强制加上的批准级） */
  requiredLevels: FauSignLevel[];
  artifacts: FauArtifact[];
  confidence?: FauConfidence;
  /** 用到的地区规则 / 阈值版本 */
  rulesUsed: { id: string; version: string }[];
  model?: string;
  returned?: { level: FauSignLevel; by: string; comment: string; toStep: FauStepKey; at: string };
  archivedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface FauRunSummary {
  id: string;
  moduleId: string;
  modeId: string;
  status: FauRunStatus;
  outputLocale: FauLocale;
  createdAt: string;
  updatedAt: string;
  nextLevel?: FauSignLevel | null;
}

// ─── 签核（第 9 节） ───

export interface FauSignoffRecord {
  id: string;
  runId: string;
  moduleId: string;
  projectId: string;
  level: FauSignLevel;
  decision: 'approve' | 'return';
  signer: { name: string; title: string };
  comment?: string;
  /** 已知悉的提醒项 / 未核实条目 id */
  acknowledged: string[];
  /** 签核时的文件哈希 */
  artifacts: { path: string; sha256: string }[];
  /** 职责未分离但按「允许但记录」放行 */
  sodWaived?: boolean;
  returnToStep?: FauStepKey;
  at: string;
  prevHash: string;
  hash: string;
}

export interface FauSignoffQueueItem {
  runId: string;
  moduleId: string;
  projectId: string;
  level: FauSignLevel;
  since: string;
  returned: boolean;
}

export interface FauSignoffVerify {
  ok: boolean;
  chainOk: boolean;
  /** 被改过的文件 */
  tampered: { path: string; expected: string; actual: string | null }[];
  records: number;
  message: FauMsg;
}

// ─── 首页 ───

export interface FauTodo {
  id: string;
  kind: 'recon_unbalanced' | 'checklist_open' | 'signoff_pending' | 'signoff_returned' | 'run_interrupted' | 'escalation';
  severity: 'info' | 'warn' | 'danger';
  moduleId: string;
  runId?: string;
  step?: FauStepKey;
  message: FauMsg;
}

export interface FauSettings {
  currentCompanyId: string;
  currentProjectId: string;
  bundle: FauBundle;
  /** 模块 → provider/model；没选用系统默认 */
  moduleModels: Record<string, string>;
  /** 产出根目录；首次设置后固定 */
  outputRoot: string;
}

export interface FauHome {
  settings: FauSettings;
  company: FauCompany | null;
  companies: { id: string; name: string }[];
  project: FauProject | null;
  projects: FauProject[];
  todos: FauTodo[];
  queue: FauSignoffQueueItem[];
  closeProgress: { checklistDone: number; checklistTotal: number; trialOk: boolean | null; tieIssues: number } | null;
  recent: Array<FauArtifact & { runId: string; moduleId: string; archived: boolean }>;
}

export type FauEvent =
  | { type: 'run.progress'; runId: string; step: FauStepKey }
  | { type: 'run.state'; runId: string }
  | { type: 'todo.changed' };

/** 公共 action（批次 1）；模块特有 action 用「模块 id.」前缀写在各分组的 action 文件里 */
export const FAU_ACTIONS = [
  'home.get', 'catalog.get', 'region.profiles', 'thresholds.get',
  'company.list', 'company.get', 'company.switch', 'company.save', 'company.remove', 'company.mapAccounts',
  'project.list', 'project.create', 'project.switch', 'project.status', 'project.archive',
  'data.pick', 'data.inspect', 'data.import', 'data.list', 'data.remove', 'data.importFromFinanceAgent', 'data.financeAgentLedgers',
  'run.create', 'run.start', 'run.get', 'run.list', 'run.cancel', 'run.retry', 'run.setInputs',
  'artifact.open', 'artifact.reveal', 'artifact.preview',
  'signoff.queue', 'signoff.submit', 'signoff.decide', 'signoff.history', 'signoff.verify',
  'handoff.send', 'handoff.list',
  'todo.list', 'settings.patch', 'models.list',
  'sample.open', 'sample.remove',
] as const;
export type FauAction = (typeof FAU_ACTIONS)[number];

// ═══ platform（P1–P6） ═══════════════════════════════════════════════════════
// 批次 8：P6 技能自建的 DTO 写在这里。

/** 批次 8：ERP 只读取数的插件状态（erp.status）；available=false 时界面退回上传并显示 reason */
export interface FauErpStatus {
  available: boolean;
  enabled: boolean;
  defaultProvider?: string;
  /** 只列本方案支持的四个 backend（金蝶云星空、用友 U8、畅捷通 T+、精斗云） */
  providers: Array<{ id: string; configured: boolean }>;
  reason?: string;
}

/** 批次 8：erp.pull 返回的 CSV（放在项目 files/ 下，之后按上传文件同一条路识别列、确认后导入） */
export interface FauErpPullResult {
  path: string;
  rowCount: number;
  columns: string[];
  checksum: string;
}

/** 批次 8：流程库 / 专家团 / 超级任务可用的 workflow 工具（第 12.2 节） */
export const FAU_WORKFLOW_TOOLS = ['finance-audit:run-engine', 'finance-audit:import-run'] as const;

// ═══ accounting（A1–A8） ═════════════════════════════════════════════════════
// 批次 1：A1 月结关账、A2 对账中心。金额一律最小货币单位整数（分）。

export type FauCheckMark = 'ok' | 'warn' | 'fail' | 'pending';
export interface FauChecklistItem {
  id: string;
  label: FauMsg;
  /** 能从数据判断的自动判；其余由人勾 */
  auto: boolean;
  mark: FauCheckMark;
  /** 试算表 / 银行对账 / 往来核销 / 折旧：这四项不能是 ❌ */
  critical: boolean;
  evidence?: string;
  note?: FauMsg;
}
export interface FauChecklistResult {
  items: FauChecklistItem[];
  counts: Record<FauCheckMark, number>;
  canStart: boolean;
  reasons: FauMsg[];
}

export type FauTieId = 'trial' | 'bs' | 'np_retained' | 'cashflow' | 'opening' | 'movement';
/** 借贷差异分档：≤0.01 忽略；0.01–100 定位；100–1000 停止；>1000 停止并通知经理 */
export type FauDiffTier = 'ignore' | 'locate' | 'stop' | 'stop_notify';
export interface FauTieCheck {
  id: FauTieId;
  ok: boolean;
  left: number;
  right: number;
  diff: number;
  tier?: FauDiffTier;
  message: FauMsg;
  details?: { accountCode: string; accountName: string; left: number; right: number; diff: number }[];
}
export interface FauTrialResult {
  totals: { openingDr: number; openingCr: number; periodDr: number; periodCr: number; closingDr: number; closingCr: number };
  checks: FauTieCheck[];
  balanced: boolean;
}

export type FauCrossPeriodType = 'omitted' | 'early' | 'late';
export type FauApprovalLevel = 'preparer' | 'reviewer' | 'approver';
export interface FauCrossPeriodItem {
  id: string;
  row: number;
  voucherNo: string;
  date: string;
  businessDate: string;
  accountCode: string;
  accountName: string;
  summary: string;
  amount: number;
  type: FauCrossPeriodType;
  days: number;
  amountTier: 1 | 2 | 3 | 4;
  dayTier: 1 | 2 | 3 | 4;
  approval: FauApprovalLevel;
  /** 必须本期调整 */
  adjustThisPeriod: boolean;
  advice: FauMsg;
}

export interface FauAccrualLine {
  policyId: string;
  description: string;
  expenseAccount: string;
  liabilityAccount: string;
  basis: 'fixed' | 'straight_line' | 'rate';
  base: number;
  due: number;
  booked: number;
  accrual: number;
  autoReverse: boolean;
  /** 算式（给人看）：如 120000 / 12 = 10000 */
  formula: string;
  note?: FauMsg;
}

/** 分录草稿：列与财务智能体的「通用凭证导入格式」一致 */
export interface FauJeLine {
  date: string;
  voucherNo: string;
  lineNo: number;
  summary: string;
  accountCode: string;
  accountName: string;
  aux: string;
  debit: number;
  credit: number;
  /** 批次 2 加：固定资产处置 / 工资计提 / 内部往来抵销 */
  source: 'accrual' | 'cross_period' | 'fa_disposal' | 'payroll_accrual' | 'ic_elimination';
  /** accountName 是词典 key（系统生成的标准科目名，产出时按输出语言翻译）；没有就是用户数据，原样保留 */
  nameIsKey?: boolean;
}

export interface FauRollForwardRow {
  accountCode: string;
  accountName: string;
  opening: number;
  additions: number;
  accruals: number;
  reversals: number;
  payments: number;
  reclass: number;
  fx: number;
  other: number;
  /** 期初 + 各活动 */
  computed: number;
  /** 余额表期末 */
  closing: number;
  /** 期末 − 计算值；不倒挤 */
  unexplained: number;
}

export interface FauFluxDriver { label: string; amount: number; count: number }
export interface FauFluxLine {
  accountCode: string;
  accountName: string;
  current: number;
  prior: number;
  budget: number | null;
  diffPrior: number;
  /** 小数，0.12 = 12% */
  diffPriorPct: number | null;
  diffBudget: number | null;
  reason: 'threshold' | 'must_review';
  drivers: FauFluxDriver[];
  commentary: string;
  commentaryStatus: 'none' | 'verified' | 'unverified' | 'unknown';
}

export interface FauOpenItem {
  id: string;
  fromRunId: string;
  fromModuleId: string;
  description: string;
  amount: number;
  owner?: string;
}

export interface FauCloseResult {
  period: string;
  engines: string[];
  checklist?: FauChecklistResult;
  trial?: FauTrialResult;
  crossPeriod?: FauCrossPeriodItem[];
  accruals?: FauAccrualLine[];
  jeDraft?: FauJeLine[];
  rollForward?: FauRollForwardRow[];
  flux?: FauFluxLine[];
  openItems: FauOpenItem[];
}

export type FauBankClass =
  | 'matched' | 'book_out_bank_not' | 'book_in_bank_not' | 'bank_out_book_not' | 'bank_in_book_not'
  | 'amount_diff' | 'unmatched';
export const FAU_BANK_CLASSES: FauBankClass[] = [
  'matched', 'book_out_bank_not', 'book_in_bank_not', 'bank_out_book_not', 'bank_in_book_not', 'amount_diff', 'unmatched',
];
export interface FauBankItem {
  id: string;
  cls: FauBankClass;
  /** 匹配轮次：1 单号 / 2 金额+日期 / 3 金额唯一 / 4 一对多 */
  pass?: 1 | 2 | 3 | 4;
  bookRows: number[];
  bankRows: number[];
  date: string;
  /** 收为正、付为负（本位币最小单位） */
  bookAmount: number;
  bankAmount: number;
  ref: string;
  counterparty: string;
  summary: string;
  /** fee / interest / unknown_deduction … */
  cause?: string;
  ageDays?: number;
  escalate?: FauMsg;
}
export interface FauBankStatement {
  bookBalance: number;
  addBankInNotBook: number;
  lessBankOutNotBook: number;
  /** 金额差异按银行金额调整到账面一侧 */
  amountDiffAdj: number;
  adjustedBook: number;
  bankBalance: number;
  addBookInNotBank: number;
  lessBookOutNotBank: number;
  adjustedBank: number;
  balanced: boolean;
}
export interface FauBankAccountResult {
  account: string;
  items: FauBankItem[];
  counts: Record<FauBankClass, number>;
  statement: FauBankStatement;
  escalations: FauMsg[];
}

export type FauGlSubClass = 'matched' | 'amount' | 'quantity' | 'timing' | 'gl_only' | 'sub_only';
export const FAU_GLSUB_CLASSES: FauGlSubClass[] = ['matched', 'amount', 'quantity', 'timing', 'gl_only', 'sub_only'];
export type FauBreakCause = 'timing' | 'fx' | 'mapping' | 'duplicate_or_missing' | 'fee_or_accrual' | 'data_quality';
export type FauBreakAction = 'adjust_gl' | 'adjust_subledger' | 'wait_timing' | 'investigate' | 'remap' | 'escalate';
export interface FauBreakTrace {
  rootCause: string;
  owner: string;
  expectedClearDate: string;
  action: FauBreakAction;
  status: 'verified' | 'rejected' | 'unverified';
  /** 打回原因：引用了数据里没有的单号 / 金额 / 日期 */
  missing?: string[];
}
export interface FauGlSubBreak {
  id: string;
  key: string;
  cls: FauGlSubClass;
  glRows: number[];
  subRows: number[];
  glAmount: number;
  subAmount: number;
  diff: number;
  glQty: number | null;
  subQty: number | null;
  glFx: number | null;
  subFx: number | null;
  glDate: string;
  subDate: string;
  causes: FauBreakCause[];
  major: boolean;
  trace?: FauBreakTrace;
}
export interface FauGlSubResult {
  breaks: FauGlSubBreak[];
  counts: Record<FauGlSubClass, number>;
  matchRate: number;
  totals: { gl: number; sub: number; diff: number };
  escalations: FauMsg[];
}

export interface FauReconResult {
  mode: 'bank' | 'glsub' | 'retrace';
  bank?: FauBankAccountResult[];
  glsub?: FauGlSubResult;
}

// ─── 批次 2：A3 应收、A4 应付、A5 报销、A6 固定资产、A7 薪酬、A8 内部往来（金额一律分；单价可带小数分） ───

export type FauRiskLevel = 'low' | 'medium' | 'high';
/** 问题标记：code 对应 shared/financeAudit/accountingLabels.ts 的词典 key，params 是插值 */
export interface FauFlag { code: string; level: 'info' | 'warn' | 'block'; params?: Record<string, string | number> }

// A3 应收与账龄
export type FauAgingBucket = 'current' | 'd1_30' | 'd31_60' | 'd61_90' | 'd91_180' | 'd181_365' | 'over365';
export const FAU_AGING_BUCKETS: FauAgingBucket[] = ['current', 'd1_30', 'd31_60', 'd61_90', 'd91_180', 'd181_365', 'over365'];
export interface FauArItem {
  row: number;
  customer: string;
  docNo: string;
  docDate: string;
  dueDate: string;
  amount: number;
  open: number;
  overdueDays: number;
  bucket: FauAgingBucket;
  provisionRate: number;
  provision: number;
  disputed: boolean;
}
export interface FauArBucketLine { bucket: FauAgingBucket; amount: number; count: number; share: number; provisionRate: number; provision: number }
/** 催款阶段：0 未逾期；1 友好提醒（1–30 天）；2 正式提醒；3 书面催款；4 最后通知 + 停止接单；5 诉讼评估 / 核销 */
export type FauDunningStage = 0 | 1 | 2 | 3 | 4 | 5;
export interface FauArCustomer {
  customer: string;
  open: number;
  overdue: number;
  maxOverdueDays: number;
  byBucket: Record<FauAgingBucket, number>;
  provision: number;
  risk: FauRiskLevel;
  stage: FauDunningStage;
  creditLimit: number | null;
  /** 已用额度 / 信用额度 */
  utilization: number | null;
  flags: FauFlag[];
}
export interface FauDunningLetter {
  customer: string;
  stage: FauDunningStage;
  overdue: number;
  items: { docNo: string; dueDate: string; open: number; overdueDays: number }[];
}
export type FauCreditGrade = 'A' | 'B' | 'C' | 'D';
export type FauPayHistory = 'excellent' | 'good' | 'fair' | 'poor' | 'bad' | 'unknown';
export type FauCreditApproval = 'ar_supervisor' | 'credit_manager' | 'cfo';
export interface FauCreditAssessment {
  customer: string;
  history: FauPayHistory;
  lateCount: number;
  maxLateDays: number;
  onTimeRate: number | null;
  debtRatio: number | null;
  cashFlowPositive: boolean | null;
  /** 档案里登记的高风险信号（用户数据原样） */
  highRisk: string[];
  grade: FauCreditGrade;
  termDays: number;
  currentLimit: number | null;
  requestedLimit: number | null;
  avgMonthlyBilling: number;
  suggestedLimit: number;
  approval: FauCreditApproval;
  reasons: FauFlag[];
}
export interface FauArResult {
  asOf: string;
  total: number;
  overdue: number;
  overdueRate: number;
  priorOverdueRate: number | null;
  buckets: FauArBucketLine[];
  items: FauArItem[];
  customers: FauArCustomer[];
  /** TOP N 风险客户（按逾期金额） */
  top: string[];
  provision: number;
  letters: FauDunningLetter[];
  credit: FauCreditAssessment[];
  escalations: FauMsg[];
}

// A4 应付与三单匹配
export type FauMatchQty = 'full' | 'partial' | 'invoice_short' | 'over_invoiced' | 'not_received' | 'not_invoiced';
export type FauMatchGrade = 'match' | 'within_tol' | 'review' | 'reject';
export const FAU_MATCH_GRADES: FauMatchGrade[] = ['match', 'within_tol', 'review', 'reject'];
export interface FauMatchLine {
  key: string;
  poNo: string;
  line: string;
  item: string;
  supplier: string;
  poQty: number;
  grnQty: number;
  invQty: number;
  /** 单价（分，可带小数） */
  poPrice: number;
  invPrice: number | null;
  poTaxRate: number | null;
  invTaxRate: number | null;
  /** PO 单价 × 收货数量 */
  poAmount: number;
  /** 发票不含税金额 */
  invAmount: number;
  /** 单价差 × 可结算数量 */
  priceDiff: number;
  priceDiffRate: number | null;
  qty: FauMatchQty;
  price: FauMatchGrade;
  tax: 'ok' | 'lower' | 'higher' | 'unknown';
  grade: FauMatchGrade;
  /** 可付（不含税）：可结算数量 × 两边较低单价；退回 / 税率不对时为 0 */
  payable: number;
  hold: number;
  invoiceNos: string[];
  poRows: number[];
  grnRows: number[];
  invRows: number[];
  flags: FauFlag[];
}
export type FauPayPriority = 'P0' | 'P1' | 'P2' | 'P3' | 'P4';
export const FAU_PAY_PRIORITIES: FauPayPriority[] = ['P0', 'P1', 'P2', 'P3', 'P4'];
/** 付款审批层级：≤5 万 AP 主管；5–20 万 + 财务经理；20–50 万 + 财务总监；> 50 万 + CEO */
export type FauPayApproval = 'l1' | 'l2' | 'l3' | 'l4';
export type FauOverdueLevel = 'none' | 'normal' | 'attention' | 'warning' | 'high';
export interface FauPayLine {
  row: number;
  supplier: string;
  docNo: string;
  poNo: string;
  dueDate: string;
  open: number;
  overdueDays: number;
  grade: string;
  priority: FauPayPriority;
  /** 进本次付款计划草稿（资金够、没被暂扣） */
  scheduled: boolean;
  /** 暂扣金额（三单不符 / 供应商复核待核实） */
  hold: number;
  holdReason?: FauFlag;
  deferTo?: string;
  approval: FauPayApproval;
  overdueLevel: FauOverdueLevel;
}
export type FauGapTier = 'none' | 'small' | 'medium' | 'large';
export interface FauPayPlan {
  asOf: string;
  /** 可用资金：Σ(余额 − 已排期 − 冻结)；没有资金表为 null */
  available: number | null;
  /** 今天起 30 天内到期（含已逾期）应付合计 */
  due30: number;
  gap: number | null;
  gapTier: FauGapTier | null;
  lines: FauPayLine[];
  scheduledTotal: number;
  deferredTotal: number;
  heldTotal: number;
  byPriority: Record<FauPayPriority, { count: number; amount: number }>;
  concentration: { supplier: string; share: number }[];
}
export interface FauSupplierReview {
  supplier: string;
  open: number;
  flags: FauFlag[];
  conclusion: 'approve' | 'conditional' | 'hold';
}
export interface FauApResult {
  asOf: string;
  match: FauMatchLine[] | null;
  matchCounts: Record<FauMatchGrade, number> | null;
  plan: FauPayPlan | null;
  suppliers: FauSupplierReview[];
  escalations: FauMsg[];
}

// A5 费用报销稽核
export type FauClaimVerdict = 'pass' | 'review' | 'reject' | 'escalate';
export const FAU_CLAIM_VERDICTS: FauClaimVerdict[] = ['pass', 'review', 'reject', 'escalate'];
/** ZATCA 电子发票二维码（TLV，base64）解析与票面核对 */
export interface FauZatcaQr {
  ok: boolean;
  phase: 1 | 2;
  sellerName: string;
  vatNo: string;
  timestamp: string;
  total: number | null;
  vat: number | null;
  /** 不一致 / 有问题的字段：decode / seller / vat_no / vat_no_format / date / total / vat / missing_tags */
  problems: string[];
}
export interface FauExpenseLine {
  row: number;
  claimNo: string;
  employee: string;
  dept: string;
  category: string;
  invoiceNo: string;
  invoiceDate: string;
  submitDate: string;
  seller: string;
  total: number;
  tax: number;
  flags: FauFlag[];
  qr?: FauZatcaQr;
}
export interface FauExpenseClaimResult {
  claimNo: string;
  employee: string;
  dept: string;
  total: number;
  verdict: FauClaimVerdict;
  rows: number[];
  reasons: FauFlag[];
}
export type FauAnomalyCode = 'high_frequency' | 'split' | 'supplier_concentration' | 'cross_period' | 'weekend' | 'round_amount' | 'sequential' | 'duplicate';
export interface FauAnomaly {
  code: FauAnomalyCode;
  level: 'warn' | 'block';
  /** 员工 / 供应商 / 发票号（用户数据） */
  subject: string;
  rows: number[];
  amount: number;
  count: number;
}
export interface FauExpenseResult {
  asOf: string;
  lines: FauExpenseLine[];
  claims: FauExpenseClaimResult[];
  anomalies: FauAnomaly[];
  counts: Record<FauClaimVerdict, number>;
  totals: { amount: number; flagged: number };
  escalations: FauMsg[];
}

// A6 固定资产
export type FauDepMethod = 'straight_line' | 'units' | 'ddb' | 'syd';
export interface FauFaLine {
  row: number;
  assetNo: string;
  name: string;
  category: string;
  acquireDate: string;
  method: FauDepMethod;
  lifeMonths: number;
  cost: number;
  salvage: number;
  impairment: number;
  status: string;
  disposalDate: string;
  /** 本期应提折旧（重算） */
  expectedPeriod: number;
  bookedPeriod: number | null;
  diffPeriod: number | null;
  /** 期末应有累计折旧（重算） */
  expectedAccum: number;
  bookedAccum: number | null;
  diffAccum: number | null;
  nbv: number;
  /** 算式（给人看） */
  formula: string;
  flags: FauFlag[];
}
export interface FauFaRollRow {
  category: string;
  openingCost: number;
  additions: number;
  disposals: number;
  closingCost: number;
  openingAccum: number;
  depreciation: number;
  disposalAccum: number;
  closingAccum: number;
  bookedClosingAccum: number | null;
  nbv: number;
}
export interface FauFaDisposal {
  row: number;
  assetNo: string;
  name: string;
  date: string;
  type: string;
  cost: number;
  accum: number;
  impairment: number;
  nbv: number;
  proceeds: number;
  costs: number;
  net: number;
  /** 正为收益、负为损失 */
  gainLoss: number;
  flags: FauFlag[];
}
export interface FauFaAddition { row: number; assetNo: string; name: string; date: string; amount: number; flags: FauFlag[] }
export interface FauFaResult {
  period: string;
  lines: FauFaLine[];
  roll: FauFaRollRow[];
  disposals: FauFaDisposal[];
  additions: FauFaAddition[];
  je: FauJeLine[];
  /** 资产台账与总账（固定资产 / 累计折旧科目期末）核对；没给余额表为 null */
  glTie: { item: 'cost' | 'accum'; register: number; gl: number; diff: number }[] | null;
  escalations: FauMsg[];
}

// A7 薪酬核算
export type FauPayrollRegime = 'cn' | 'sa' | 'intl';
export interface FauEosb { years: number; wage: number; liability: number; booked: number | null; diff: number | null; formula: string }
export interface FauPayrollLine {
  row: number;
  empId: string;
  name: string;
  dept: string;
  gross: number;
  computedGross: number | null;
  /** 个人社保公积金（或 GOSI 个人部分）：表里实扣 / 按规则应扣 */
  personal: number | null;
  personalExpected: number | null;
  /** 单位负担（计提用） */
  employer: number;
  base: number | null;
  baseFlag: 'ok' | 'below' | 'above' | 'unchecked';
  iitWithheld: number | null;
  iitExpected: number | null;
  iitDetail?: { taxableYtd: number; rate: number; quickDeduction: number };
  net: number | null;
  netExpected: number;
  eosb?: FauEosb;
  flags: FauFlag[];
}
export interface FauHeadcountChange { empId: string; name: string; kind: 'hire' | 'leave'; date: string; flags: FauFlag[] }
export interface FauPayrollResult {
  regime: FauPayrollRegime;
  period: string;
  lines: FauPayrollLine[];
  totals: { headcount: number; gross: number; personal: number; iit: number; net: number; employer: number; eosbAccrual: number };
  changes: FauHeadcountChange[] | null;
  je: FauJeLine[];
  escalations: FauMsg[];
}

// A8 合并与内部往来
export type FauIcPair = 'arap' | 'sales' | 'loan' | 'interest' | 'other';
export const FAU_IC_PAIRS: FauIcPair[] = ['arap', 'sales', 'loan', 'interest', 'other'];
export interface FauIcBreak {
  id: string;
  pair: FauIcPair;
  entity: string;
  counterparty: string;
  key: string;
  cls: FauGlSubClass;
  own: number;
  other: number;
  diff: number;
  causes: FauBreakCause[];
  ownRows: number[];
  otherRows: number[];
}
export interface FauIcPairSummary {
  pair: FauIcPair;
  entity: string;
  counterparty: string;
  own: number;
  other: number;
  diff: number;
  matched: number;
  breaks: number;
  /** 本对抵销金额（两边较小的那个；差额调平前不抵） */
  eliminated: number;
}
export interface FauGuaranteeCheck {
  row: number;
  guarantor: string;
  beneficiary: string;
  amount: number;
  endDate: string;
  status: string;
  netAssets: number | null;
  /** 担保方有效担保余额合计 / 净资产 */
  ratio: number | null;
  flags: FauFlag[];
}
export interface FauTpDeviation {
  row: number;
  entity: string;
  counterparty: string;
  type: string;
  amount: number;
  internalPrice: number;
  marketPrice: number;
  deviation: number;
  flagged: boolean;
}
export interface FauIcResult {
  period: string;
  pairs: FauIcPairSummary[];
  breaks: FauIcBreak[];
  je: FauJeLine[];
  /** 抵销分录借贷是否平衡 */
  balanced: boolean;
  guarantees: FauGuaranteeCheck[] | null;
  pricing: FauTpDeviation[] | null;
  /** 挂账超过 N 天未清的行数 */
  stale: number;
  escalations: FauMsg[];
}

/** A3 已签核账龄（项目内供 E5 预期信用损失读取，第 4.3 节） */
export interface FauSignedAging {
  runId: string;
  asOf: string;
  archivedAt: string;
  buckets: FauArBucketLine[];
  customers: { customer: string; byBucket: Record<FauAgingBucket, number>; open: number }[];
}

// ═══ audit（B1–B6） ══════════════════════════════════════════════════════════
// 批次 3：B1 内控与 SOX、B2 内审、B3 外审配合与函证、B4 报表与底稿复核、B5 舞弊排查、B6 客商尽调；
// 另有 P4 质检入口（平台组的独立工具，DTO 也放这一段）。金额一律最小货币单位整数（分）。
// 合规边界：不出具审计 / 内控 / 鉴证意见；函证只出草稿，发送必须经人工确认（一次性确认令牌）；KYC 从不批准。

export type FauImpactLevel = 'high' | 'medium' | 'low';
export const FAU_IMPACT_LEVELS: FauImpactLevel[] = ['high', 'medium', 'low'];

// ─── B1 内控与 SOX ───
export type FauControlFrequency = 'annual' | 'quarterly' | 'monthly' | 'weekly' | 'daily' | 'multiple';
export const FAU_CONTROL_FREQUENCIES: FauControlFrequency[] = ['annual', 'quarterly', 'monthly', 'weekly', 'daily', 'multiple'];
export interface FauControl {
  id: string;
  process: string;
  risk: string;
  assertion: string;
  description: string;
  type: 'preventive' | 'detective';
  nature: 'manual' | 'automated' | 'itdm';
  frequency: FauControlFrequency;
  owner: string;
  key: boolean;
  /** upload：控制清单；draft：模型按流程文档起草（只是草稿） */
  source: 'upload' | 'draft';
  /** draft：流程文档里的原文依据，回原文定位不到的标未核实 */
  quote?: string;
  docName?: string;
  verified?: boolean;
  row?: number;
}
export interface FauApprovalRule {
  matter: string;
  threshold: string;
  approver: string;
  quote: string;
  docName: string;
  verified: boolean;
}
export interface FauSamplePlan {
  controlId: string;
  frequency: FauControlFrequency;
  population: number;
  /** 小数：0.01 = 1% */
  expectedRate: number;
  tolerableRate: number;
  confidence: number;
  /** 属性抽样（二项分布）算出的样本量与允许偏差数 */
  attributeN: number;
  allowedDeviations: number;
  /** 按控制频率的最小样本量 */
  frequencyMin: number;
  /** 最终样本量 = min(总体, max(属性抽样, 频率下限)) */
  n: number;
  testAll: boolean;
  seed: number;
}
export type FauSampleResult = 'pending' | 'pass' | 'fail';
export interface FauSample {
  controlId: string;
  seq: number;
  /** 总体表行号 */
  row: number;
  ref: string;
  date: string;
  amount: number;
  result: FauSampleResult;
  note?: string;
}
export interface FauControlTest {
  controlId: string;
  sampled: number;
  tested: number;
  deviations: number;
  rate: number | null;
  tolerableRate: number;
  conclusion: 'effective' | 'ineffective' | 'pending';
  reason?: 'rate' | 'systemic';
}
export type FauDeficiencyGrade = 'material_weakness' | 'significant' | 'deficiency' | 'improvement';
export const FAU_DEFICIENCY_GRADES: FauDeficiencyGrade[] = ['material_weakness', 'significant', 'deficiency', 'improvement'];
export type FauCompensating = 'effective' | 'partial' | 'none';
export const FAU_COMPENSATING: FauCompensating[] = ['effective', 'partial', 'none'];
export interface FauDeficiency {
  id: string;
  controlId: string;
  description: string;
  source: 'testing' | 'upload';
  amount: number;
  amountTier: FauImpactLevel;
  opImpact: FauImpactLevel;
  compensating: FauCompensating;
  grade: FauDeficiencyGrade;
  owner: string;
  dueDate: string;
  remediation: string;
  row?: number;
}
export interface FauIcfrResult {
  mode: 'design' | 'testing' | 'deficiency';
  controls: FauControl[];
  approvalMatrix: FauApprovalRule[];
  plans: FauSamplePlan[];
  samples: FauSample[];
  tests: FauControlTest[];
  deficiencies: FauDeficiency[];
  counts: Record<FauDeficiencyGrade, number>;
}

// ─── B2 内部审计 ───
export type FauFindingSeverity = 'major' | 'moderate' | 'low';
export interface FauAuditArea {
  id: string;
  name: string;
  likelihood: FauImpactLevel;
  impact: FauImpactLevel;
  risk: FauImpactLevel;
  mandatory: boolean;
  lastAudited: string;
  days: number;
  quarter: 'Q1' | 'Q2' | 'Q3' | 'Q4' | '';
  included: boolean;
  row?: number;
}
export interface FauAuditPlan {
  areas: FauAuditArea[];
  availableDays: number;
  requiredDays: number;
  /** 需求 − 可用（> 0 = 资源缺口） */
  gap: number;
  narrative: string;
  narrativeStatus: 'none' | 'verified' | 'unverified';
}
export interface FauAuditProcedure {
  id: string;
  area: string;
  objective: string;
  procedure: string;
  evidence: string;
}
export interface FauAuditFinding {
  id: string;
  title: string;
  condition: string;
  criteria: string;
  cause: string;
  effect: string;
  recommendation: string;
  kind: 'deficiency' | 'improvement' | 'compliance';
  likelihood: FauImpactLevel;
  impact: FauImpactLevel;
  severity: FauFindingSeverity;
  quote: string;
  docName: string;
  verified: boolean;
}
export interface FauTrackedFinding {
  id: string;
  title: string;
  severity: FauFindingSeverity;
  owner: string;
  dueDate: string;
  status: 'open' | 'in_progress' | 'closed';
  closedDate: string;
  source: 'upload' | 'handoff';
  fromModule?: string;
  overdueDays: number;
  /** 0 未超期；1 提醒负责人；2 升级 CFO；3 升级审计委员会 */
  tier: 0 | 1 | 2 | 3;
  row?: number;
}
export interface FauInternalAuditResult {
  mode: 'plan' | 'fieldwork' | 'tracking';
  asOf: string;
  plan?: FauAuditPlan;
  procedures?: FauAuditProcedure[];
  findings?: FauAuditFinding[];
  tracked?: FauTrackedFinding[];
}

// ─── B3 外审配合与函证 ───
export type FauConfirmType = 'bank' | 'ar' | 'ap' | 'other';
export type FauConfirmStatus = 'draft' | 'sent' | 'replied_match' | 'replied_diff' | 'no_reply';
export interface FauConfirmation {
  id: string;
  type: FauConfirmType;
  party: string;
  email: string;
  account: string;
  bookAmount: number;
  currency: string;
  letterPath?: string;
  sentAt?: string;
  sentVia?: 'self' | 'official';
  replyFile?: string;
  replyAmount: number | null;
  replyQuote?: string;
  replyVerified?: boolean;
  status: FauConfirmStatus;
  diff: number | null;
  /** 发函后天数（未回函时） */
  ageDays: number | null;
  /** 替代程序建议（词典 key） */
  alternative: string[];
  row?: number;
}
export interface FauPbcItem {
  id: string;
  item: string;
  owner: string;
  dueDate: string;
  status: 'requested' | 'provided' | 'overdue';
  ref: string;
  source: 'upload' | 'handoff';
  row?: number;
}
export interface FauAdjustment {
  voucherNo: string;
  summary: string;
  lines: number;
  debit: number;
  credit: number;
  balanced: boolean;
  /** 对利润的影响（收入增加、费用减少为正） */
  profitImpact: number;
  assetImpact: number;
  liabilityImpact: number;
  equityImpact: number;
  exceedsMateriality: boolean;
}
export interface FauExtAuditResult {
  mode: 'support' | 'confirm_prepare' | 'confirm_replies';
  asOf: string;
  materiality: number;
  pbc?: FauPbcItem[];
  adjustments?: FauAdjustment[];
  adjustmentTotals?: { profit: number; assets: number; liabilities: number; equity: number };
  /** 调整前利润（提供了余额表时） */
  profitBefore?: number | null;
  confirmations?: FauConfirmation[];
  responseRate?: number | null;
  /** 回函核对时引用的函证准备运行 */
  sourceRunId?: string;
}
/** 函证发送前的人工确认节点：预览 + 一次性令牌（主进程校验后才会真正交给邮件发送） */
export interface FauConfirmSendPreview {
  token: string;
  expiresAt: string;
  via: 'self' | 'official' | 'none';
  items: { id: string; party: string; email: string; subject: string; attachment: string }[];
  blocked: FauMsg[];
}

// ─── B4 报表与底稿复核 ───
export type FauXlsRule =
  | 'error_value' | 'hardcode_in_formula' | 'inconsistent_formula' | 'sum_range_gap' | 'broken_link'
  | 'hidden_sheet' | 'hidden_rows' | 'pasted_value' | 'bs_unbalanced';
export type FauQcSeverity = 'critical' | 'important' | 'minor';
export interface FauXlsFinding {
  id: string;
  file: string;
  sheet: string;
  cell: string;
  rule: FauXlsRule;
  severity: FauQcSeverity;
  formula?: string;
  detail?: string;
}
export type FauNavLineId = 'beginning' | 'contributions' | 'distributions' | 'allocatedPnl' | 'carry' | 'ending';
export interface FauNavLine { line: FauNavLineId; statement: number; recomputed: number; diff: number; ok: boolean }
export interface FauNavLp { lpId: string; pct: number; ok: boolean; lines: FauNavLine[]; decision: 'release' | 'hold' }
export interface FauReviewResult {
  mode: 'statements' | 'fund';
  trial?: FauTrialResult;
  xls?: FauXlsFinding[];
  files?: { file: string; sheets: number; formulas: number; findings: number }[];
  crossRefs?: { ref: string; file: string; found: boolean }[];
  nav?: { lps: FauNavLp[]; fundNav: number; sumEnding: number; navTies: boolean };
  recommendation: 'release' | 'hold';
  reasons: FauMsg[];
}

// ─── B5 舞弊排查 ───
export interface FauFraudHit {
  id: string;
  rule: string;
  level: 'high' | 'warn' | 'info';
  source: 'journal' | 'payments' | 'master' | 'tb';
  rows: number[];
  refs: string[];
  amount: number;
  /** 用户数据（单号、往来、摘要），不翻译 */
  detail: string;
}
export interface FauBenfordResult {
  n: number;
  observed: number[];
  expected: number[];
  mad: number;
  chi2: number;
  conformity: 'close' | 'acceptable' | 'marginal' | 'nonconformity' | 'insufficient';
  /** 显著偏高的首位数字（z > 1.96） */
  spikes: number[];
}
export interface FauFraudPlanStep {
  id: string;
  objective: string;
  procedure: string;
  evidence: string;
  owner: string;
  refs: string[];
  verified: boolean;
}
export interface FauFraudResult {
  hits: FauFraudHit[];
  benford: FauBenfordResult;
  coverage: { rule: string; status: 'ran' | 'not_applicable'; hits: number }[];
  plan: FauFraudPlanStep[];
  summary: string;
  summaryStatus: 'none' | 'verified' | 'unverified';
}

// ─── B6 客商尽调与反洗钱 ───
export type FauKycDisposition = 'clear' | 'request-docs' | 'escalate-EDD' | 'decline-recommend';
export const FAU_KYC_DISPOSITIONS: FauKycDisposition[] = ['clear', 'request-docs', 'escalate-EDD', 'decline-recommend'];
export interface FauKycValue { value: string; quote: string; docName: string; verified: boolean }
export interface FauKycRecord {
  applicantType: 'individual' | 'entity' | 'trust' | '';
  legalName: FauKycValue | null;
  dobOrFormation: FauKycValue | null;
  jurisdiction: FauKycValue | null;
  address: FauKycValue | null;
  sourceOfFunds: FauKycValue | null;
  pepDeclared: boolean | null;
  idDocuments: Array<{ type: string; number: FauKycValue; expiry: string }>;
  beneficialOwners: Array<{ name: FauKycValue; nationality: string; pct: number | null }>;
  controllers: Array<{ name: FauKycValue; role: string }>;
  documents: Array<{ type: string; docName: string; date: string }>;
  /** 回原文定位不到被丢弃的字段（事实类条目定位不到直接丢弃） */
  dropped: string[];
}
export interface FauKycRuleOutcome {
  ruleId: string;
  /** 规则文本：内置规则是词典 key，上传的规则表是用户数据 */
  text: string;
  builtin: boolean;
  outcome: 'pass' | 'fail' | 'n/a';
  evidence: string;
  effect: 'escalate' | 'request_docs' | 'decline' | 'risk';
}
export interface FauKycHit {
  subject: string;
  role: 'applicant' | 'ubo' | 'controller';
  listName: string;
  entry: string;
  score: number;
  strength: 'strong' | 'possible';
}
export interface FauKycResult {
  record: FauKycRecord;
  rating: FauImpactLevel;
  factors: { factor: string; value: string; points: number }[];
  outcomes: FauKycRuleOutcome[];
  hits: FauKycHit[];
  missingDocs: string[];
  /** 处置建议：从不批准，由合规官决定 */
  disposition: FauKycDisposition;
  reasons: string[];
}

// ─── P4 办公产出与质检（独立入口，不走七步、不签核） ───
export type FauQcScope = 'selection' | 'sheet' | 'model';
export interface FauQcFinding {
  id: string;
  location: string;
  rule: string;
  severity: FauQcSeverity;
  detail: string;
}
export interface FauQcReport {
  kind: 'xlsx' | 'pptx';
  file: string;
  scope?: FauQcScope;
  findings: FauQcFinding[];
  counts: Record<FauQcSeverity, number>;
  reportPath: string;
}
export interface FauDeckChange { slide: number; sp: number; p: number; r: number; before: string; after: string; from: string; to: string }
export interface FauDeckRefreshPlan {
  id: string;
  file: string;
  changes: FauDeckChange[];
  /** 可能是派生数字（增长率、份额）、不在映射里：只提示，不改 */
  flagged: { slide: number; text: string }[];
}

// ═══ tax（C1–C3） ════════════════════════════════════════════════════════════
// 批次 4：C1 纳税申报准备（中国 / 沙特 / 阿联酋 / 国际）、C2 监管与披露、C3 转让定价。
// 只出申报草稿，不提交申报（中国代填跳转财务智能体，沙特 / 阿联酋由人在 ZATCA / FTA 平台提交）。
// 金额一律最小货币单位整数（分 / 哈拉拉 / 菲尔）；税率、期限只来自 RegionRule（带版本与生效日期）。

/** 税务组的数据集类型 */
export type FauTaxInputKind =
  | 'vat_lines' | 'iit_rows' | 'wht_payments' | 'temp_diffs'
  | 'disclosure_events' | 'rp_transactions' | 'tp_comparables';
export const FAU_TAX_INPUT_KINDS: FauTaxInputKind[] = ['vat_lines', 'iit_rows', 'wht_payments', 'temp_diffs', 'disclosure_events', 'rp_transactions', 'tp_comparables'];

/** 本次用到的地区规则（RegionRule 的快照 + 审核状态）；未经当地专业人员审核 → 草稿口径 */
export interface FauRuleUse {
  id: string;
  jurisdiction: string;
  label: string;
  value: string | number;
  unit?: string;
  version: string;
  effectiveFrom: string;
  effectiveTo?: string;
  source: {
    issuer: string; title: string; clause?: string; versionDate?: string; language: string;
    originalText?: string; translations?: Record<string, string>; url?: string;
  };
  /** 界面语言 → 名称（与文字取值）的译文 */
  translations?: Record<string, { label?: string; value?: string }>;
  reviewed: boolean;
}

export type FauTaxModeId = 'cn' | 'sa_vat' | 'sa_zakat' | 'sa_wht' | 'ae_vat' | 'ae_cit' | 'intl';

export interface FauTaxLine {
  id: string;
  /** 词典 key；中国口径的行是财务智能体按输出语言算好的文字（key 即文字） */
  label: FauMsg;
  /** 计税基数 / 金额（最小货币单位） */
  base?: number | null;
  /** 税额（最小货币单位） */
  tax?: number | null;
  /** 小数，0.15 = 15% */
  rate?: number | null;
  /** 给人看的算式 */
  formula?: string;
  /** 来源行（数据集原表行号） */
  rows?: number[];
  ruleIds?: string[];
}

export interface FauTaxSection {
  id: string;
  title: FauMsg;
  currency: string;
  lines: FauTaxLine[];
  /** 本节应缴（负数 = 留抵 / 可退） */
  payable: number;
}

export interface FauTaxFinding {
  id: string;
  level: 'info' | 'warn' | 'high';
  title: FauMsg;
  detail?: FauMsg;
  suggestion?: FauMsg;
  rows?: number[];
}

export interface FauTaxDeadline {
  id: string;
  label: FauMsg;
  period: string;
  /** YYYY-MM-DD */
  due: string;
  ruleId?: string;
}

export type FauZakatCategory =
  | 'add_equity' | 'add_provision' | 'add_liability'
  | 'deduct_fixed' | 'deduct_investment' | 'deduct_intangible' | 'deduct_other' | 'none';
export const FAU_ZAKAT_CATEGORIES: FauZakatCategory[] = ['add_equity', 'add_provision', 'add_liability', 'deduct_fixed', 'deduct_investment', 'deduct_intangible', 'deduct_other', 'none'];

export interface FauZakatItem {
  row: number;
  accountCode: string;
  accountName: string;
  category: FauZakatCategory;
  /** 期末余额：加项按贷方余额、减项按借方余额计（备抵科目如累计折旧为负数，冲减所在类别） */
  amount: number;
  source: 'auto' | 'manual';
}

export interface FauZakatResult {
  items: FauZakatItem[];
  additions: number;
  deductions: number;
  /** 损益未结转时并入权益加项的本年利润（及其来源行） */
  currentProfit: number;
  profitRows: number[];
  /** 加项 − 减项 */
  computedBase: number;
  /** 调整后净利润（天课基数下限） */
  adjustedProfit: number;
  /** 基数 = max(计算基数, 调整后净利润, 0) */
  base: number;
  floorApplied: boolean;
  yearBasis: 'hijri' | 'gregorian';
  /** 会计年度天数（公历折算用） */
  fiscalDays: number;
  /** 适用天课率（小数） */
  rate: number;
  /** 沙特 / 海湾国家股东持股比例（缴天课的部分） */
  saudiShare: number;
  zakatDue: number;
  /** 外资部分应纳税所得额与所得税 */
  nonSaudiTaxable: number;
  nonSaudiCit: number;
}

export interface FauTaxResult {
  mode: FauTaxModeId;
  region: FauRegion;
  period: string;
  currency: string;
  sections: FauTaxSection[];
  findings: FauTaxFinding[];
  calendar: FauTaxDeadline[];
  zakat?: FauZakatResult;
  rules: FauRuleUse[];
  /** 用到的地区规则未经当地专业人员审核（或档案本身是草稿口径） */
  draftBasis: boolean;
  /** 本期销项 / 可抵扣进项税额（最小货币单位），供下期判断「连续多期进项大于销项」 */
  vatTotals?: { output: number; input: number };
  /** 中国：财务智能体 computeTax 的原样输出（元），逐项对照用 */
  cn?: { vatPayable: number; surchargeTotal: number; citPayable: number; iitTotal: number; burdenRate: number | null };
}

// C2 监管报送与信息披露
export type FauDisclosureRegime = 'cn_sse' | 'sa_cma' | 'intl';
export type FauDisclosureLevel = 'none' | 'disclose' | 'shareholder' | 'notes';
export const FAU_DISCLOSURE_LEVELS: FauDisclosureLevel[] = ['shareholder', 'disclose', 'notes', 'none'];
export interface FauDisclosureTest {
  id: string;
  label: FauMsg;
  /** 占比（小数）；只看绝对额的测试为 null */
  ratio: number | null;
  threshold: number;
  absMin?: number;
  hit: boolean;
  level: FauDisclosureLevel;
}
export interface FauDisclosureItem {
  id: string;
  row: number;
  date: string;
  type: string;
  description: string;
  counterparty: string;
  amount: number;
  level: FauDisclosureLevel;
  tests: FauDisclosureTest[];
  draft?: string;
  draftStatus?: 'none' | 'verified' | 'unverified';
  missing?: string[];
}
export interface FauRegulatoryResult {
  regime: FauDisclosureRegime;
  base: { totalAssets: number; netAssets: number; revenue: number; netProfit: number; source: 'params' | 'tb' };
  items: FauDisclosureItem[];
  counts: Record<FauDisclosureLevel, number>;
  dataChecks: FauTaxFinding[];
  rules: FauRuleUse[];
  draftBasis: boolean;
}

// C3 转让定价
export type FauTpPli = 'ncp' | 'om';
export type FauRptType = 'tangible' | 'intangible_transfer' | 'intangible_license' | 'service' | 'financing' | 'financial_asset' | 'other';
export interface FauTpComparable { row: number; name: string; year: string; pli: number | null; included: boolean; reason?: FauMsg }
export interface FauTpRange { n: number; min: number; q1: number; median: number; q3: number; max: number }
export interface FauTpDoc {
  id: 'disclosure' | 'master' | 'local' | 'cbcr';
  required: boolean;
  reason: FauMsg;
  prepared: boolean;
  ruleIds: string[];
}
export interface FauTpNarrative { id: string; heading: FauMsg; text: string; status: 'verified' | 'unverified'; missing?: string[] }
export interface FauTpResult {
  jurisdiction: FauRegion;
  pli: FauTpPli;
  tested: { revenue: number; operatingProfit: number; totalCost: number; pli: number | null; source: 'params' | 'tb' };
  comparables: FauTpComparable[];
  range: FauTpRange | null;
  position: 'below' | 'within' | 'above' | 'na';
  /** 低于下四分位：调整到中位值所需增加的营业利润 */
  adjustment: { toPli: number; amount: number } | null;
  rpt: { type: FauRptType; amount: number; count: number; rows: number[] }[];
  rptTotal: number;
  docs: FauTpDoc[];
  findings: FauTaxFinding[];
  narrative: FauTpNarrative[];
  rules: FauRuleUse[];
  draftBasis: boolean;
}

// ═══ fpa（D1–D10） ═══════════════════════════════════════════════════════════
// 批次 5：管理报告、KPI、财务分析、预算、成本、商业洞察、董事会材料、ESG、战略、投资者关系。
// 十个模块共用一种结果形状：规则引擎算好的表（金额最小货币单位整数、比例为小数）+ 模型写的叙述（逐条回核）。
// 列名 / 标签存词典 key，展示端与产出端各自按语言翻译；单元格里的用户数据（科目名、指标名）原样保留。

/** text：用户数据原样；label：词典 key（展示时翻译）；amount：分；pct：小数比例；num：普通数值；level：红黄绿 */
export type FauFpaColKind = 'text' | 'label' | 'amount' | 'pct' | 'num' | 'level';
export interface FauFpaColumn { key: string; label: string; kind: FauFpaColKind }
export type FauFpaCell = string | number | null;
export type FauFpaLevel = 'green' | 'yellow' | 'red';
export interface FauFpaTable {
  id: string;
  /** 词典 key */
  title: string;
  columns: FauFpaColumn[];
  rows: Array<Record<string, FauFpaCell>>;
}
export interface FauFpaNarrative {
  id: string;
  /** 词典 key */
  heading: string;
  text: string;
  /** verified：数字 / 引用都在数据里；unverified：有找不到的；unknown：模型说不清 */
  status: 'verified' | 'unverified' | 'unknown';
  missing?: string[];
}
/** 横向条形图数据（界面用 CSS 画，逻辑属性在阿语 RTL 下自动镜像） */
export interface FauFpaChart {
  id: string;
  /** 词典 key */
  title: string;
  unit: 'amount' | 'pct' | 'num';
  /** 用户数据（指标名 / 科目名），labelKeys=true 时是词典 key */
  labels: string[];
  labelKeys?: boolean;
  /** name 是词典 key */
  series: { name: string; values: Array<number | null> }[];
}
export interface FauFpaAlert { id: string; level: FauFpaLevel; message: FauMsg }
/** 数据来源：是否已被本项目里某次签核归档的运行引用（管理报告的数字要能回核到已签核的数据集） */
export interface FauFpaSource {
  datasetId: string;
  label: string;
  kind: FauInputKind;
  slot: string;
  rows: number;
  signed: boolean;
  /** 引用它的已归档运行（模块编号） */
  signedBy?: string[];
}
export interface FauFpaResult {
  moduleId: string;
  period: string;
  tables: FauFpaTable[];
  narratives: FauFpaNarrative[];
  charts: FauFpaChart[];
  alerts: FauFpaAlert[];
  sources: FauFpaSource[];
  /** 勾稽 / 自检（xlsx 的 Checks 页） */
  checks: { id: string; ok: boolean; message: FauMsg }[];
  /** 转交来的上游运行（如 D1 → D7） */
  handoffFrom?: { runId: string; moduleId: string }[];
}

// ═══ treasury（E1–E7） ═══════════════════════════════════════════════════════
// 批次 6：现金、司库、外汇、融资、ECL、营运资本、投融资。金额一律最小货币单位整数（分）；比率一律小数（0.12 = 12%）。
// 硬边界：付款只出计划草稿（不付款、不审批付款，授权复核只给建议）；外汇只出敞口、策略与询价单草稿（不下单、不成交）。

export type FauTreasuryInputKind =
  | 'bank_balance' | 'cash_plan' | 'payment_request' | 'credit_facility' | 'liquidity_items'
  | 'fx_exposure' | 'loan' | 'covenant' | 'fin_metrics' | 'credit_exposure' | 'macro_scenario'
  | 'loss_rates' | 'inventory' | 'investment';

/** 红黄绿：正常 / 关注 / 越线 */
export type FauTreasuryRag = 'ok' | 'watch' | 'breach';

/** 模型写的说明段（H 型模块）：里面的数字逐条回核到引擎结果，找不到的整段标「未核实」 */
export interface FauTreasuryNarrative {
  id: string;
  /** 词典 key：这段讲什么 */
  topic: string;
  text: string;
  status: 'verified' | 'unverified';
  missing?: string[];
}

// ─── E1 现金 / E2 资金头寸 ───

export interface FauCashAccountCheck {
  row: number;
  account: string;
  bank: string;
  entity: string;
  currency: string;
  bankBalance: number;
  bookBalance: number | null;
  systemBalance: number | null;
  /** 参与核对的来源数（网银 / 账面 / 资金系统，不足 2 个无法核对） */
  sources: number;
  /** 三方两两差额的最大绝对值 */
  maxDiff: number;
  /** 三方核对：一致 / 轻微差异 / 差异较大 */
  status: FauTreasuryRag;
  restricted: number;
  available: number;
  safetyLine: number | null;
  belowSafety: boolean;
}
export interface FauCashPosition {
  asOf: string;
  accounts: FauCashAccountCheck[];
  /** 本位币账户合计（外币账户只列示、不并入合计） */
  totals: { bank: number; book: number; system: number; available: number };
  foreignAccounts: number;
}

export type FauCashScenarioId = 'optimistic' | 'base' | 'pessimistic';
export const FAU_CASH_SCENARIOS: FauCashScenarioId[] = ['optimistic', 'base', 'pessimistic'];
export type FauFlowCertainty = 'committed' | 'expected' | 'possible';
export interface FauForecastWeek { week: number; start: string; end: string; opening: number; inflow: number; outflow: number; net: number; closing: number }
export interface FauForecastScenario {
  id: FauCashScenarioId;
  /** 非确定流入 / 流出的系数（确定流量不调整） */
  inFactor: number;
  outFactor: number;
  weeks: FauForecastWeek[];
  totalIn: number;
  totalOut: number;
  endBalance: number;
  minBalance: number;
  firstGapWeek: number | null;
  /** 最大缺口（≥ 0） */
  maxGap: number;
}
export interface FauForecastLine {
  id: string;
  category: string;
  source: 'plan' | 'ar' | 'ap';
  certainty: FauFlowCertainty;
  /** 13 周基准情景，收为正、付为负 */
  weeks: number[];
  total: number;
}
export interface FauCashForecast {
  start: string;
  opening: number;
  lines: FauForecastLine[];
  scenarios: FauForecastScenario[];
  /** 基准情景最大缺口分档：无 / 小额 / 大额 / 超大额 */
  gapTier: 'none' | 'small' | 'large' | 'severe';
  /** 单一付款方收款占比（13 周基准流入） */
  concentration: { counterparty: string; amount: number; share: number; status: FauTreasuryRag }[];
  facilityAvailable: number | null;
  /** 悲观情景缺口扣掉可用授信后仍需新增的融资（≥ 0） */
  financingNeed: number;
  /** 13 周以外、没有计入的流量笔数 */
  beyond: number;
}

export interface FauPaymentLine {
  id: string;
  row: number;
  payee: string;
  amount: number;
  dueDate: string;
  category: string;
  priority: FauPayPriority;
  /** 优先级从哪来：表里写明 / 按类别关键词 / 默认 */
  prioritySource: 'given' | 'category' | 'default';
  /** 计划：排入本期计划 / 延后 / 暂停核实（红线，不排入） */
  plan: 'schedule' | 'defer' | 'hold';
  /** 排入后累计占用（只算 schedule） */
  cumulative: number;
  flags: FauMsg[];
}
export interface FauPaymentPlan {
  available: number;
  total: number;
  byPriority: Record<FauPayPriority, { count: number; amount: number }>;
  scheduled: number;
  deferred: number;
  held: number;
  /** 必须支付的 P0 超出可用资金的部分 */
  gap: number;
  lines: FauPaymentLine[];
}

export interface FauCashResult {
  mode: 'daily' | 'forecast' | 'payment';
  position?: FauCashPosition;
  forecast?: FauCashForecast;
  payments?: FauPaymentPlan;
}

// ─── E2 司库 ───

/** 授权复核只给建议，从不「批准」：建议放行（由有权人审批）/ 补充资料 / 暂缓 / 建议拒绝 */
export type FauAuthAdvice = 'proceed' | 'request_docs' | 'hold' | 'reject_recommend';
export interface FauAuthCheck { id: string; ok: boolean; level: 'warn' | 'block'; message: FauMsg }
export interface FauAuthReview {
  id: string;
  row: number;
  payee: string;
  amount: number;
  advice: FauAuthAdvice;
  large: boolean;
  balanceAfter: number | null;
  checks: FauAuthCheck[];
}

export interface FauPoolAccount { row: number; account: string; entity: string; bank: string; balance: number; restricted: number; target: number; /** 正 = 上划主账户，负 = 下拨 */ sweep: number; rate: number }
export interface FauCashPool {
  header: string;
  currency: string;
  accounts: FauPoolAccount[];
  sweepUp: number;
  sweepDown: number;
  /** 归集后主账户可统一调度的资金 */
  pooled: number;
  /** 年化利息增益估算 */
  interestGain: number;
  investRate: number;
  excluded: { account: string; reason: FauMsg }[];
}

export interface FauBankScore {
  bank: string;
  limit: number;
  used: number;
  utilization: number | null;
  rate: number | null;
  deposits: number;
  volumeShare: number;
  /** 1–10 分 */
  scores: { volume: number; rate: number; response: number; innovation: number; cooperation: number };
  total: number;
  tier: 'core' | 'key' | 'general';
  expiry: string;
  expiringSoon: boolean;
  flags: FauMsg[];
}

export type FauLiquidityCategory = 'hqla_l1' | 'hqla_l2a' | 'hqla_l2b' | 'outflow' | 'inflow' | 'asf' | 'rsf';
export interface FauLcrLine { row: number; item: string; category: FauLiquidityCategory; amount: number; factor: number; weighted: number }
export interface FauLcrResult {
  lines: FauLcrLine[];
  hqla: { l1: number; l2a: number; l2b: number; adj15: number; adj40: number; total: number };
  outflows: number;
  inflows: number;
  /** 流入封顶后计入的部分（≤ 流出 × 75%） */
  inflowsCapped: number;
  netOutflows: number;
  lcr: number | null;
  lcrStatus: FauTreasuryRag;
  asf: number;
  rsf: number;
  nsfr: number | null;
  nsfrStatus: FauTreasuryRag;
}

export interface FauTreasuryResult {
  mode: 'position' | 'authorization' | 'cash_pool' | 'bank_relationship' | 'liquidity';
  position?: FauCashPosition;
  forecast?: FauCashForecast;
  authorizations?: FauAuthReview[];
  pool?: FauCashPool;
  banks?: FauBankScore[];
  liquidity?: FauLcrResult;
  narrative: FauTreasuryNarrative[];
}

// ─── E3 外汇（只到询价单草稿，不下单） ───

export type FauFxKind = 'receivable' | 'payable' | 'forecast_inflow' | 'forecast_outflow' | 'asset' | 'liability' | 'revenue' | 'cost' | 'hedge_sell' | 'hedge_buy';
export type FauFxCertainty = 'firm' | 'highly_probable' | 'possible';
export const FAU_FX_CERTAINTIES: FauFxCertainty[] = ['firm', 'highly_probable', 'possible'];
export interface FauFxCurrencyExposure {
  currency: string;
  rate: number;
  /** 外币金额（最小单位），正 = 多头（净收外币），负 = 空头 */
  transaction: number;
  translation: number;
  economic: number;
  transactionLocal: number;
  translationLocal: number;
  economicLocal: number;
  /** 交易敞口按确定性分层（外币，带方向） */
  layers: Record<FauFxCertainty, number>;
  /** 已有对冲（外币，正 = 已卖出远期） */
  hedged: number;
  /** 按分层比例算出的目标对冲额（外币，带方向） */
  hedgeTarget: number;
  /** 还需对冲：正 = 卖出外币，负 = 买入外币 */
  hedgeNeed: number;
  /** 已对冲比例（|已对冲| / |交易敞口|） */
  hedgeRatio: number | null;
  /** 汇率变动对本位币的影响（交易 + 会计敞口） */
  sensitivity: { shock: number; impact: number }[];
  overLimit: boolean;
  /** 占全部外币敞口（本位币绝对值）的比例 */
  share: number;
}
export interface FauRfqLine {
  id: string;
  currency: string;
  side: 'sell' | 'buy';
  /** 外币名义本金（最小单位） */
  notional: number;
  valueMonth: string;
  instrument: 'forward';
  layer: FauFxCertainty;
}
export interface FauFxResult {
  localCurrency: string;
  exposures: FauFxCurrencyExposure[];
  rfq: FauRfqLine[];
  totalLocal: number;
  narrative: FauTreasuryNarrative[];
}

// ─── E4 融资 ───

export interface FauLoanCost {
  row: number;
  id: string;
  lender: string;
  instrument: string;
  principal: number;
  rate: number;
  feeRate: number;
  tenorYears: number;
  /** 综合成本 = 利率 + 费率 / 期限 */
  allIn: number;
  afterTax: number;
  maturity: string;
  remainingYears: number;
}
export interface FauFinancingCost {
  loans: FauLoanCost[];
  debt: number;
  kdPreTax: number | null;
  kdAfterTax: number | null;
  taxRate: number;
  rf: number;
  beta: number;
  erp: number;
  ke: number;
  equity: number;
  equitySource: 'param' | 'market' | 'book' | 'none';
  wacc: number | null;
  /** 到期分布：1 年内 / 1–2 年 / 2–3 年 / 3–5 年 / 5 年以上 */
  maturity: { bucket: 'y1' | 'y2' | 'y3' | 'y5' | 'y5plus'; amount: number }[];
}
export type FauCovenantMetric = 'debt_to_ebitda' | 'interest_cover' | 'current_ratio' | 'debt_ratio' | 'dscr' | 'net_worth';
export interface FauCovenantValue { period: string; forecast: boolean; value: number | null; headroom: number | null; status: FauTreasuryRag }
export interface FauCovenantCheck {
  id: string;
  row: number;
  lender: string;
  name: string;
  metric: FauCovenantMetric;
  op: 'le' | 'ge';
  /** 比率类为倍数 / 小数；净资产为最小货币单位 */
  limit: number;
  values: FauCovenantValue[];
  current: FauTreasuryRag;
  /** 最早越线的期间（含预测） */
  firstBreach: string | null;
}
export interface FauFinancingResult {
  mode: 'cost' | 'covenant' | 'restructure';
  cost?: FauFinancingCost;
  covenants?: FauCovenantCheck[];
  narrative: FauTreasuryNarrative[];
}

// ─── E5 预期信用损失 ───

export type FauEclStage = 1 | 2 | 3;
export interface FauEclScenario { id: string; name: string; weight: number; pdMultiplier: number }
export interface FauEclLine {
  id: string;
  row: number;
  counterparty: string;
  segment: string;
  ead: number;
  stage: FauEclStage;
  priorStage: FauEclStage | null;
  /** 判定理由代码：dpd90 / default_rating / impaired / dpd30 / downgrade / watchlist / ig_to_sub */
  reasons: string[];
  /** 本阶段用的 PD（一阶段 12 个月、二阶段存续期、三阶段 100%） */
  pd: number;
  lgd: number;
  /** 折现因子 */
  df: number;
  /** 各情景 ECL（情景 id → 分） */
  ecl: Record<string, number>;
  weighted: number;
  coverage: number | null;
}
export interface FauEclStageSummary { stage: FauEclStage; count: number; ead: number; ecl: number; coverage: number | null }
/** 阶段迁移：from = 0 表示本期新增（没有上期阶段） */
export interface FauEclMigration { from: 0 | FauEclStage; to: FauEclStage; count: number; ead: number }
export type FauEclBucket = 'current' | 'd30' | 'd60' | 'd90' | 'd180' | 'd365' | 'd365plus';
export const FAU_ECL_BUCKETS: FauEclBucket[] = ['current', 'd30', 'd60', 'd90', 'd180', 'd365', 'd365plus'];
export interface FauEclMatrixBucket { bucket: FauEclBucket; amount: number; count: number; rate: number; factor: number; ecl: number }
export interface FauEclResult {
  mode: 'general' | 'simplified';
  asOf: string;
  scenarios: FauEclScenario[];
  /** 情景权重合计是否为 100% */
  weightsOk: boolean;
  /** 前瞻系数 = Σ 权重 × PD 调整系数 */
  forwardFactor: number;
  lines?: FauEclLine[];
  stages?: FauEclStageSummary[];
  migration?: FauEclMigration[];
  matrix?: FauEclMatrixBucket[];
  totalEad: number;
  totalEcl: number;
}

// ─── E6 营运资本 ───

export interface FauCccResult {
  days: number;
  revenue: number;
  cogs: number;
  ar: number;
  inventory: number;
  ap: number;
  dso: number | null;
  dio: number | null;
  dpo: number | null;
  ccc: number | null;
  /** 每改善 1 天释放的现金：应收按收入、存货 / 应付按成本 */
  perDay: { dso: number; dio: number; dpo: number };
  /** 逾期应收（按到期日） */
  overdueAr: number;
}
export type FauInventoryClass = 'A' | 'B' | 'C';
export interface FauInventoryItem { row: number; sku: string; name: string; amount: number; usage: number; cls: FauInventoryClass; idleDays: number | null; aging: 'active' | 'slow' | 'obsolete' }
export interface FauInventoryResult {
  items: FauInventoryItem[];
  byClass: Record<FauInventoryClass, { count: number; amount: number; usage: number }>;
  slow: number;
  obsolete: number;
  /** 呆滞 + 过时，可释放的资金占用 */
  release: number;
}
export interface FauSupplierTerm { supplier: string; open: number; share: number; avgTermDays: number | null; dueIn30: number; status: FauTreasuryRag }
export interface FauScfOption {
  id: 'reverse_factoring' | 'receivables_factoring' | 'dynamic_discounting' | 'inventory_finance';
  base: number;
  /** 现金效应（正 = 释放 / 推迟付出） */
  cashEffect: number;
  /** 年化成本（分） */
  annualCost: number;
}
export interface FauWcResult {
  mode: 'ccc' | 'inventory' | 'payables';
  ccc?: FauCccResult;
  inventory?: FauInventoryResult;
  suppliers?: FauSupplierTerm[];
  scf?: FauScfOption[];
}

// ─── E7 投融资 ───

export type FauInvestType = 'deposit' | 'money_fund' | 'wmp' | 'bond' | 'equity' | 'fund' | 'other';
export interface FauInvestLine {
  row: number;
  id: string;
  product: string;
  type: FauInvestType;
  issuer: string;
  cost: number;
  marketValue: number;
  pnl: number;
  pnlPct: number | null;
  riskRating: number | null;
  maturity: string;
  bucket: 'd30' | 'd90' | 'd180' | 'd365' | 'y1plus' | 'open';
  status: FauTreasuryRag;
  flags: FauMsg[];
}
export interface FauPortfolio {
  lines: FauInvestLine[];
  totals: { cost: number; marketValue: number; pnl: number };
  byType: { type: FauInvestType; marketValue: number; share: number }[];
  issuers: { issuer: string; marketValue: number; share: number; status: FauTreasuryRag }[];
  ladder: { bucket: FauInvestLine['bucket']; marketValue: number }[];
  weightedYield: number | null;
}
export interface FauLiquidity {
  cash: number;
  liquidInvestments: number;
  unusedFacilities: number;
  available: number;
  debtDue12m: number;
  currentRatio: number | null;
  quickRatio: number | null;
  cashRatio: number | null;
  /** (现金 + 可快速变现投资) / 一年内到期债务 */
  coverage: number | null;
  facilityUtilization: number | null;
  statuses: { current: FauTreasuryRag; quick: FauTreasuryRag; coverage: FauTreasuryRag; facility: FauTreasuryRag };
}
export interface FauInvestResult {
  mode: 'portfolio' | 'liquidity';
  portfolio?: FauPortfolio;
  liquidity?: FauLiquidity;
  narrative: FauTreasuryNarrative[];
}

// ═══ capital（F1–F8） ════════════════════════════════════════════════════════
// 批次 7：估值、资本配置、并购尽调、投行、PE、研究、固收与市场、财富。
// 估值模型的金额按用户录入的单位（如「百万」）存数值，不是账面金额（账面数据集仍按分存）；比例一律存小数（0.1 = 10%）。
// 数据来源三级降级：有授权连接器 / 上传或公开数据 / 手工录入，每个数字都带来源；连接器未授权时照常靠上传跑通。
// 不做投资建议、不执行交易：研究、市场、财富的产出带「非投资建议」声明，代码里没有任何下单路径。

export type FauCapUnit = 'money' | 'pct' | 'x' | 'num' | 'int' | 'years' | 'months' | 'bp' | 'text' | 'date' | 'select';

/** 一个输入值的来源（第 6.7 节）；default = 模板默认值、还没人确认，按「未注明来源」出 */
export interface FauCapSource {
  kind: 'manual' | 'upload' | 'public' | 'connector' | 'handoff' | 'default';
  file?: string;
  /** 上传表格的原表行号（表头下第一行 = 2） */
  row?: number;
  sha256?: string;
  url?: string;
  /** 连接器名 / 转交来源模块码 */
  name?: string;
  runId?: string;
}
export interface FauCapValue { v: number | string | null; src: FauCapSource }
export interface FauCapRow { cells: Record<string, number | string | null>; src: FauCapSource }
/** 第 ② 步录入（存在 run.params.cap） */
export interface FauCapInputs { fields: Record<string, FauCapValue>; tables: Record<string, FauCapRow[]> }

export interface FauCapColumn { key: string; label: string; unit: FauCapUnit }
export interface FauCapMetric { id: string; label: string; value: number | string | null; unit: FauCapUnit; flag?: 'ok' | 'warn' | 'bad' }
/** 单元格：数字 / 用户数据原样 / 词典 key（FauMsg，展示端翻译；用户数据不翻译） */
export type FauCapCell = number | string | null | FauMsg;
export interface FauCapTable { id: string; title: string; columns: FauCapColumn[]; rows: Array<Record<string, FauCapCell>> }
export interface FauCapFlag { id: string; level: 'warn' | 'info'; message: FauMsg }
export interface FauCapParagraph {
  text: string;
  /** verified：数字都能在结果、输入或已定位的原文里找到；unverified：出 [未注明来源] 并要签核人逐条知悉 */
  status: 'verified' | 'unverified';
  missing?: string[];
  /** 出现了买卖 / 评级 / 配置建议措辞（不做投资建议，第 9.1 节） */
  advice?: boolean;
}
export interface FauCapSection { heading: string; paragraphs: FauCapParagraph[] }
/** 模型从上传资料里抽的事实：quote 回原文定位，定位不到的丢弃（第 6.4 节第 4 条） */
export interface FauCapFact { label: string; value: string; doc: string; quote: string; page?: number; cell?: string; located: boolean }

export interface FauCapResult {
  moduleId: string;
  modeId: string;
  metrics: FauCapMetric[];
  tables: FauCapTable[];
  flags: FauCapFlag[];
  sections?: FauCapSection[];
  facts?: FauCapFact[];
  /** 定位不到原文、已丢弃的事实条数 */
  droppedFacts?: number;
  /** 回显本次用到的输入（带来源），产出物的「输入与来源」页按它写 */
  inputs: {
    fields: Array<{ key: string; label: string; unit: FauCapUnit; value: number | string | null; src: FauCapSource }>;
    tables: Array<{ id: string; title: string; columns: FauCapColumn[]; rows: FauCapRow[] }>;
  };
  /** 上游转交来的估值引用（F1 → F2 / F4 / F5，第 4.3 节） */
  upstream: Array<{ runId: string; moduleId: string; modeId: string; metrics: FauCapMetric[] }>;
  /** 没用授权数据源：第 ⑤ 步顶部写明「本结果未使用授权数据源，数据完整度：X」；completeness 与置信度里的数据完整度同一口径（runner.ts dataConfidence） */
  degraded: { authorized: boolean; completeness: 'high' | 'medium' | 'low'; unsourced: number };
  /** 研究 / 市场 / 财富：「非投资建议」声明 */
  disclaimer: 'research' | 'markets' | 'wealth' | null;
}
