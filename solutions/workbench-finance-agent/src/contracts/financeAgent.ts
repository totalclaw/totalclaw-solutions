/**
 * 解决方案 · 财务智能体工作台 —— 契约类型。
 *
 * 十个智能体（凭证 / 税务申报 / 费用报销 / 往来对账 / 财务报表 / 财税风险巡检 / 预算管控 /
 * 成本核算 / 合同财税审核 / 财务问答）共用一个「账套」概念：代账公司一个客户一个账套，
 * 企业自己用就一个账套。所有数据、会话记忆都挂在账套下，切账套即换一整套数据。
 *
 * 合规边界（写进产品）：不提交纳税申报、不做电子签名、不改正式账套数据；
 * 只出草稿、核对结果、风险提示和建议，金额一律由确定性规则计算，模型只做抽取与写文字。
 */

export type FaModuleKey =
  | 'voucher' | 'tax' | 'filing' | 'expense' | 'reconcile' | 'statements'
  | 'risk' | 'budget' | 'cost' | 'contract' | 'qa';

export const FA_MODULE_KEYS: FaModuleKey[] = [
  'voucher', 'tax', 'filing', 'expense', 'reconcile', 'statements', 'risk', 'budget', 'cost', 'contract', 'qa',
];

/** 打包套餐（方案第五节） */
export type FaPackage = 'all' | 'micro' | 'agency' | 'manufacturing';

export const FA_PACKAGE_MODULES: Record<Exclude<FaPackage, 'all'>, FaModuleKey[]> = {
  micro: ['voucher', 'expense', 'qa', 'statements'],
  agency: ['voucher', 'tax', 'filing', 'reconcile', 'risk'],
  manufacturing: ['voucher', 'tax', 'filing', 'expense', 'reconcile', 'statements', 'risk', 'budget', 'cost', 'contract', 'qa'],
};

// ─── 账套 ────────────────────────────────────────────────────────────────

export type FaTaxpayerType = 'general' | 'small';
/** 城建税档：市区 7% / 县城镇 5% / 其他 1% */
export type FaCityTier = 'urban' | 'county' | 'other';

export interface FaLedger {
  id: string;
  name: string;
  /** 统一社会信用代码（用来判断票据抬头是不是本公司、进项还是销项） */
  taxId: string;
  taxpayerType: FaTaxpayerType;
  cityTier: FaCityTier;
  industry: string;
  /** 是否按小型微利企业享受所得税优惠 / 六税两费减半 */
  smallLowProfit: boolean;
  /** 账套记忆：人写的备注 + 各智能体沉淀的要点，问答与分析都会带上 */
  notes: string;
  createdAt: string;
}

export interface FaLedgerInput {
  id?: string;
  name: string;
  taxId?: string;
  taxpayerType?: FaTaxpayerType;
  cityTier?: FaCityTier;
  industry?: string;
  smallLowProfit?: boolean;
  notes?: string;
}

// ─── 票据（凭证智能体 / 报销共用） ───────────────────────────────────────

export type FaDocKind =
  | 'vat_special' | 'vat_normal' | 'e_ticket' | 'bank_receipt' | 'receipt' | 'other';
export type FaDirection = 'in' | 'out' | 'unknown';

export interface FaCheck {
  code: string;
  level: 'ok' | 'warn' | 'error';
  message: string;
}

export interface FaDocItem {
  name: string;
  amount: number;
  taxRate: number | null;
  tax: number;
}

export interface FaDoc {
  id: string;
  fileName: string;
  path: string;
  kind: FaDocKind;
  direction: FaDirection;
  invoiceCode?: string;
  invoiceNo?: string;
  date?: string;
  sellerName?: string;
  sellerTaxId?: string;
  buyerName?: string;
  buyerTaxId?: string;
  /** 不含税金额 */
  amount: number;
  tax: number;
  /** 价税合计 */
  total: number;
  taxRate: number | null;
  items: FaDocItem[];
  /** 银行回单：付款方 / 收款方 / 用途 */
  payer?: string;
  payee?: string;
  purpose?: string;
  /** 费用类别（差旅费 / 办公费 …） */
  category: string;
  /** 每个字段来源：rule = 按版式规则读出，model = 模型补的（已回原文核对） */
  fieldSource: Record<string, 'rule' | 'model' | 'manual'>;
  checks: FaCheck[];
  /** 识别出的原文（截断），界面可展开对照 */
  text: string;
  ocr?: boolean;
  status: 'recognized' | 'confirmed' | 'flagged';
  voucherId?: string;
  claimId?: string;
  model?: string;
  createdAt: string;
}

// ─── 凭证 ────────────────────────────────────────────────────────────────

export interface FaVoucherLine {
  summary: string;
  accountCode: string;
  accountName: string;
  debit: number;
  credit: number;
  /** 辅助核算：往来单位 / 部门 */
  aux?: string;
}

export interface FaVoucher {
  id: string;
  /** 记-0001 */
  no: string;
  date: string;
  period: string;
  lines: FaVoucherLine[];
  sourceDocIds: string[];
  status: 'draft' | 'reviewed';
  /** 生成依据（哪条规则），审核时看 */
  basis: string;
  origin: 'doc' | 'manual';
  reviewedAt?: string;
  createdAt: string;
}

export interface FaAccount {
  code: string;
  name: string;
  /** 资产 / 负债 / 权益 / 成本 / 损益 */
  type: 'asset' | 'liability' | 'equity' | 'cost' | 'pl';
  /** 余额方向 */
  side: 'debit' | 'credit';
}

// ─── 账套导出数据（数据对接） ─────────────────────────────────────────────

export interface FaBalanceRow {
  code: string;
  name: string;
  openingDebit: number;
  openingCredit: number;
  debit: number;
  credit: number;
  closingDebit: number;
  closingCredit: number;
}

export interface FaBalanceImport {
  period: string;
  fileName: string;
  importedAt: string;
  rows: FaBalanceRow[];
}

export interface FaJournalRow {
  date: string;
  voucherNo: string;
  summary: string;
  accountCode: string;
  accountName: string;
  debit: number;
  credit: number;
  counterparty?: string;
  dept?: string;
}

export interface FaJournalImport {
  fileName: string;
  importedAt: string;
  source: 'excel' | 'api';
  rows: FaJournalRow[];
}

// ─── 税务申报 ────────────────────────────────────────────────────────────

export interface FaCalcLine {
  label: string;
  formula: string;
  value: number;
}

export interface FaTaxInputs {
  /** 销项：按税率分组的不含税销售额与税额（来自销项票据，可手改） */
  salesByRate: Array<{ rate: number; amount: number; tax: number }>;
  /** 未开票收入（不含税）及其适用税率 */
  uninvoicedSales: number;
  uninvoicedRate: number;
  /** 认证可抵扣进项税额 */
  inputTax: number;
  /** 进项税额转出 */
  inputTransferOut: number;
  /** 上期留抵 */
  carriedCredit: number;
  /** 账面收入（主营 + 其他业务收入贷方），核对账税差异用 */
  bookRevenue: number;
  /** 本年累计利润总额（所得税季度预缴用） */
  profitYtd: number;
  /** 本年已预缴企业所得税 */
  citPaidYtd: number;
  /** 是否季度申报（小规模按季） */
  quarterly: boolean;
}

export interface FaIitRow {
  name: string;
  idNo?: string;
  /** 本月应发工资 */
  salary: number;
  /** 本月个人三险一金 */
  insurance: number;
  /** 本月专项附加扣除合计 */
  special: number;
  /** 本年此前累计：收入 / 三险一金 / 专项附加 / 已预扣税额 / 月数 */
  ytdSalary: number;
  ytdInsurance: number;
  ytdSpecial: number;
  ytdTaxPaid: number;
  monthIndex: number;
  /** 计算结果 */
  taxableYtd?: number;
  rate?: number;
  quickDeduction?: number;
  taxThisMonth?: number;
}

export interface FaTaxResult {
  vat: FaCalcLine[];
  vatPayable: number;
  vatExempt: boolean;
  surcharges: FaCalcLine[];
  surchargeTotal: number;
  cit: FaCalcLine[];
  citPayable: number;
  iit: FaIitRow[];
  iitTotal: number;
  burdenRate: number | null;
}

export interface FaFinding {
  code: string;
  level: 'info' | 'warn' | 'high';
  title: string;
  detail: string;
  suggestion: string;
  /** 证据：票据 id / 凭证号 / 往来单位等 */
  refs?: string[];
}

export interface FaTaxRun {
  id: string;
  period: string;
  inputs: FaTaxInputs;
  iitRows: FaIitRow[];
  result: FaTaxResult;
  findings: FaFinding[];
  note?: string;
  model?: string;
  exportPath?: string;
  createdAt: string;
}

// ─── 申报上报（人登录、数字员工代填、人点提交） ─────────────────────────

export type FaFilingTax = 'vat' | 'surcharge' | 'cit' | 'iit' | 'statements';
export type FaFilingStatus = 'pending' | 'handed' | 'filed' | 'paid';

export interface FaFilingItem {
  tax: FaFilingTax;
  /** 草稿上的应纳（补）税额；财报报送为 0 */
  amount: number;
  status: FaFilingStatus;
  /** 电子税务局回执上的申报序号 / 凭证号 */
  receiptNo?: string;
  receiptPath?: string;
  filedAt?: string;
  paidAmount?: number;
  paidAt?: string;
  note?: string;
}

export interface FaFiling {
  id: string;
  period: string;
  taxRunId: string;
  statementId?: string;
  items: FaFilingItem[];
  /** 申报前核对清单：项 → 已勾 */
  checklist: Record<string, boolean>;
  conversationId?: string;
  handedAt?: string;
  createdAt: string;
}

export interface FaDeadline {
  tax: FaFilingTax | 'cit_annual';
  period: string;
  due: string;
  daysLeft: number;
  done: boolean;
}

// ─── 费用报销 ────────────────────────────────────────────────────────────

export interface FaExpenseRule {
  category: string;
  /** 单张上限（0 = 不限） */
  perItemCap: number;
  /** 按员工级别的单张上限覆盖 */
  capByLevel?: Record<string, number>;
  /** 是否必须专票 */
  requireSpecial?: boolean;
  /** 对应会计科目名 */
  accountName: string;
}

export interface FaExpenseRules {
  rules: FaExpenseRule[];
  /** 员工级别 → 月度报销额度（0 = 不限） */
  monthlyQuota: Record<string, number>;
  /** 票据开具后多少天内有效 */
  validityDays: number;
  /** 跨年票据是否允许（次年 1 月 31 日前） */
  allowCrossYearUntilJan31: boolean;
  /** 必须抬头为本公司 */
  requireCompanyTitle: boolean;
}

export interface FaExpenseItem {
  docId: string;
  category: string;
  amount: number;
  date?: string;
  checks: FaCheck[];
}

export interface FaExpenseClaim {
  id: string;
  employee: string;
  dept: string;
  level: string;
  reason: string;
  items: FaExpenseItem[];
  total: number;
  verdict: 'pass' | 'reject' | 'review' | 'pending';
  rejectReasons: string[];
  /** 人工结论（财务确认后） */
  decision?: 'approved' | 'rejected';
  decidedAt?: string;
  notice?: string;
  createdAt: string;
}

// ─── 往来对账 ────────────────────────────────────────────────────────────

export interface FaRecRow {
  date: string;
  ref: string;
  summary: string;
  /** 统一成「对方欠我们」为正（应收）或「我们欠对方」为正（应付） */
  amount: number;
}

export interface FaRecMatch {
  ours?: FaRecRow;
  theirs?: FaRecRow;
  status: 'matched' | 'amount_diff' | 'only_ours' | 'only_theirs';
  diff: number;
  note?: string;
}

export interface FaReconcileRun {
  id: string;
  side: 'ar' | 'ap';
  counterparty: string;
  asOf: string;
  oursFile?: string;
  theirsFile?: string;
  matches: FaRecMatch[];
  balanceOurs: number;
  balanceTheirs: number;
  letter?: string;
  dunning?: string;
  model?: string;
  exportPath?: string;
  createdAt: string;
}

export interface FaAgingRow {
  counterparty: string;
  docNo: string;
  date: string;
  dueDate: string;
  amount: number;
  paid: number;
  outstanding: number;
  ageDays: number;
  overdueDays: number;
  bucket: string;
}

export interface FaAgingRun {
  id: string;
  side: 'ar' | 'ap';
  asOf: string;
  fileName: string;
  rows: FaAgingRow[];
  buckets: Array<{ bucket: string; amount: number; count: number }>;
  byCounterparty: Array<{ counterparty: string; outstanding: number; overdue: number; maxOverdueDays: number }>;
  warnings: FaFinding[];
  createdAt: string;
}

// ─── 财务报表 ────────────────────────────────────────────────────────────

export interface FaReportLine {
  key: string;
  label: string;
  /** 期末 / 本期 */
  current: number;
  /** 期初 / 上期 */
  prior: number | null;
  indent?: number;
  bold?: boolean;
  /** 取数说明（哪些科目） */
  source?: string;
}

export interface FaStatementRun {
  id: string;
  period: string;
  source: 'balances' | 'vouchers';
  balanceSheet: FaReportLine[];
  income: FaReportLine[];
  cashflow: FaReportLine[];
  checks: FaCheck[];
  analysis?: string;
  model?: string;
  exportPath?: string;
  createdAt: string;
}

// ─── 风险巡检 ────────────────────────────────────────────────────────────

export interface FaRiskThresholds {
  /** 单笔现金支付预警（元） */
  largeCash: number;
  /** 增值税税负率低于此值预警（0.01 = 1%） */
  minVatBurden: number;
  /** 往来挂账超过多少天预警 */
  staleDays: number;
  /** 同一开票方连号张数达到多少预警 */
  consecutiveCount: number;
  /** 费用类别环比上涨倍数预警 */
  expenseSpikeRatio: number;
}

export interface FaRiskRun {
  id: string;
  findings: FaFinding[];
  scanned: { docs: number; vouchers: number; journal: number; aging: number };
  summary?: string;
  model?: string;
  reportPath?: string;
  createdAt: string;
}

// ─── 预算 ────────────────────────────────────────────────────────────────

export interface FaBudgetLine {
  dept: string;
  category: string;
  /** 1..12 → 金额 */
  months: number[];
}

export interface FaBudgetRow {
  dept: string;
  category: string;
  budget: number;
  actual: number;
  usage: number;
  monthBudget: number;
  monthActual: number;
  level: 'ok' | 'warn' | 'over';
}

export interface FaBudgetAnalysis {
  id: string;
  year: number;
  month: number;
  rows: FaBudgetRow[];
  commentary?: string;
  model?: string;
  exportPath?: string;
  createdAt: string;
}

// ─── 成本核算 ────────────────────────────────────────────────────────────

export type FaAllocBasis = 'hours' | 'machine' | 'output' | 'material';

export interface FaCostProduct {
  name: string;
  output: number;
  hours: number;
  machineHours: number;
}

export interface FaCostMaterial {
  product: string;
  material: string;
  qty: number;
  unitPrice: number;
  /** BOM 单耗（每件标准用量），用来判断异常损耗 */
  stdPerUnit?: number;
}

export interface FaCostResultRow {
  product: string;
  output: number;
  material: number;
  labor: number;
  overhead: number;
  total: number;
  unitCost: number;
  priorUnitCost: number | null;
  change: number | null;
}

export interface FaCostRun {
  id: string;
  period: string;
  basis: FaAllocBasis;
  laborTotal: number;
  overheadItems: Array<{ item: string; amount: number }>;
  products: FaCostProduct[];
  materials: FaCostMaterial[];
  lossTolerance: number;
  result: FaCostResultRow[];
  losses: FaFinding[];
  calc: FaCalcLine[];
  commentary?: string;
  model?: string;
  exportPath?: string;
  createdAt: string;
}

// ─── 合同财税审核 ────────────────────────────────────────────────────────

export interface FaContractClause {
  type: string;
  quote: string;
  value: string;
  /** 引用在原文里找到了 */
  verified: boolean;
}

export interface FaContractReview {
  id: string;
  fileName: string;
  path: string;
  contractType: string;
  amount: number | null;
  clauses: FaContractClause[];
  findings: FaFinding[];
  stampDuty: FaCalcLine[] | null;
  model?: string;
  exportPath?: string;
  textLength: number;
  createdAt: string;
}

// ─── 财务问答 ────────────────────────────────────────────────────────────

export interface FaCitation {
  source: 'builtin' | 'policy';
  title: string;
  excerpt: string;
  ref?: string;
}

export interface FaQaMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  citations?: FaCitation[];
  model?: string;
  at: string;
}

export interface FaPolicyDoc {
  id: string;
  fileName: string;
  chunks: number;
  importedAt: string;
}

// ─── 设置与状态 ──────────────────────────────────────────────────────────

export interface FaTaxSettings {
  /** 小规模征收率 */
  smallScaleRate: number;
  /** 小规模月销售额免征额（按季 ×3） */
  smallExemptMonthly: number;
  eduSurchargeRate: number;
  localEduSurchargeRate: number;
  /** 六税两费减半 */
  halveSurcharges: boolean;
  /** 小型微利企业实际税负 */
  smallProfitCitRate: number;
  citRate: number;
  /** 行业增值税税负预警值 */
  industryVatBurden: number;
}

export interface FaTaxPortal {
  /** 省份代码（电子税务局子域名，如 jiangsu），空 = 全国统一入口 */
  province: string;
  /** 自定义地址（优先） */
  url: string;
}

export interface FaApiReceiver {
  enabled: boolean;
  port: number;
  token: string;
}

export interface FaSettings {
  moduleModels: Partial<Record<FaModuleKey, string>>;
  outputDir: string;
  package: FaPackage;
  tax: FaTaxSettings;
  expense: FaExpenseRules;
  risk: FaRiskThresholds;
  apiReceiver: FaApiReceiver;
  taxPortal: FaTaxPortal;
}

/** 单个账套的全部数据 */
export interface FaLedgerData {
  docs: FaDoc[];
  vouchers: FaVoucher[];
  balances: FaBalanceImport[];
  journal: FaJournalImport | null;
  taxRuns: FaTaxRun[];
  filings: FaFiling[];
  claims: FaExpenseClaim[];
  reconciles: FaReconcileRun[];
  agings: FaAgingRun[];
  statements: FaStatementRun[];
  risks: FaRiskRun[];
  budget: { year: number; lines: FaBudgetLine[] };
  budgetAnalyses: FaBudgetAnalysis[];
  costRuns: FaCostRun[];
  contracts: FaContractReview[];
  qa: FaQaMessage[];
  policies: FaPolicyDoc[];
}

export interface FaState {
  ledgers: FaLedger[];
  activeLedgerId: string;
  settings: FaSettings;
  data: FaLedgerData;
  outputDir: string;
  apiStatus: { running: boolean; url?: string; error?: string };
  /** 费用类别全集（归类规则表 + 兜底类别），下拉用 */
  categories: string[];
}

export interface FaModelOption {
  value: string;
  label: string;
  provider: string;
  group?: string;
}

export interface FaModelsResponse {
  options: FaModelOption[];
  defaultLabel: string;
}
