/**
 * 外贸业务智能体工作台（解决方案 · `workbench-foreign-trade`）的数据契约。
 *
 * 页面按十个日常工作组织成十个模块（平台运营 / 客户开发 / 新询盘处理 / 客户背调 / 客户跟进 /
 * 内容生产 / 网站社媒 / 报价 / 订单推进 / 数据整理），另有全局的多邮箱接管。
 * 主进程只有一条动作通道（WORKBENCH_FT_INVOKE），按 action 分发；状态变化走 WORKBENCH_FT_EVENT 推送。
 */

export type FtModuleKey =
  | 'platform' | 'prospect' | 'inquiry' | 'background' | 'followup'
  | 'content' | 'social' | 'quote' | 'order' | 'report';

export const FT_MODULE_KEYS: FtModuleKey[] = [
  'platform', 'prospect', 'inquiry', 'background', 'followup', 'content', 'social', 'quote', 'order', 'report',
];

// ─── 邮箱 ────────────────────────────────────────────────────────────────

export type FtMailboxPurpose = 'inquiry' | 'outreach' | 'followup' | 'order';

export interface FtMailboxPreset {
  id: string;
  label: string;
  imapHost: string;
  imapPort: number;
  smtpHost: string;
  smtpPort: number;
  /** 授权码在哪开（给用户看） */
  note?: string;
}

export interface FtMailbox {
  id: string;
  label: string;
  address: string;
  senderName?: string;
  /** 这个邮箱归哪位业务员 */
  owner?: string;
  purposes: FtMailboxPurpose[];
  provider: string;
  imapHost: string;
  imapPort: number;
  smtpHost: string;
  smtpPort: number;
  enabled: boolean;
  /** 收到询盘后按规则自动回复（见 FtSettings.autoReply） */
  autoReply: boolean;
  hasPassword: boolean;
  status: 'unknown' | 'ready' | 'error' | 'disabled';
  statusDetail?: string;
  lastSyncAt?: string;
  lastFetched?: number;
  totalFetched: number;
  createdAt: string;
  /** 增量收取的游标（按文件夹）：只取比上次更新的邮件，不改邮箱里邮件的已读状态 */
  sync?: Record<string, { uidValidity: string; lastUid: number }>;
}

export interface FtMailboxInput {
  id?: string;
  label: string;
  address: string;
  /** 只在新建或更换时传；不传表示沿用已存的 */
  password?: string;
  senderName?: string;
  owner?: string;
  purposes: FtMailboxPurpose[];
  provider: string;
  imapHost: string;
  imapPort: number;
  smtpHost: string;
  smtpPort: number;
  enabled: boolean;
  autoReply: boolean;
}

export interface FtMailboxTestResult {
  imap: { ok: boolean; message: string };
  smtp: { ok: boolean; message: string };
}

export interface FtAttachment {
  name: string;
  path: string;
  size: number;
}

export interface FtMessage {
  id: string;
  mailboxId: string;
  direction: 'in' | 'out';
  messageId?: string;
  inReplyTo?: string;
  from: string;
  fromName?: string;
  to: string[];
  subject: string;
  body: string;
  at: string;
  attachments: FtAttachment[];
}

// ─── 新询盘处理 ──────────────────────────────────────────────────────────

export interface FtInquiryField {
  key: string;
  label: string;
  value: string;
  /** 原文里的依据句 */
  quote?: string;
  /** 出处：正文 / 附件名 */
  source?: string;
  /** 依据句在原文里真的找得到 */
  verified: boolean;
}

export interface FtInquiryItem {
  product: string;
  model?: string;
  spec?: string;
  quantity?: string;
  unit?: string;
}

export interface FtInquiryCategory {
  productLine: string;
  completeness: 'complete' | 'partial' | 'poor';
  intent: 'high' | 'medium' | 'low';
  spam: boolean;
  reason: string;
  /** 来信属于哪一类回复（勿联系 / 暂不需要 / 已有供应商 / 索要资料……），模型初判 */
  replyType?: FtReplyType;
}

export type FtReplyType =
  | 'do_not_contact' | 'not_now' | 'has_supplier' | 'info_request' | 'sample_request' | 'quote_request'
  | 'meeting_request' | 'order_intent' | 'wrong_contact' | 'other';

export interface FtDraft {
  subject: string;
  body: string;
  model: string;
  at: string;
}

export interface FtInquiry {
  id: string;
  mailboxId: string;
  customerEmail: string;
  customerName: string;
  company?: string;
  country?: string;
  subject: string;
  receivedAt: string;
  messageIds: string[];
  status: 'new' | 'extracted' | 'replied' | 'quoted' | 'closed' | 'spam';
  fields: FtInquiryField[];
  items: FtInquiryItem[];
  category?: FtInquiryCategory;
  questions: string[];
  replyDraft?: FtDraft;
  /** 自动回复的结果（已发 / 没发的原因；被发信闸门拦下时 blocked 列出原因） */
  autoReply?: { sent: boolean; at: string; reason?: string; blocked?: FtGateIssue[] };
  model?: string;
  extractedAt?: string;
  repliedAt?: string;
  error?: string;
}

// ─── 客户背调 ────────────────────────────────────────────────────────────

export interface FtSource {
  title: string;
  url: string;
  snippet?: string;
  /** 抓到的正文长度（0 = 没抓到） */
  textLength?: number;
  fetchError?: string;
}

export interface FtBackgroundFact {
  label: string;
  value: string;
  /** 对应 sources 的下标 */
  source?: number;
}

export interface FtBackground {
  id: string;
  company: string;
  website?: string;
  email?: string;
  country?: string;
  inquiryId?: string;
  createdAt: string;
  stage: 'searched' | 'fetched' | 'done';
  model?: string;
  sources: FtSource[];
  summary?: string;
  facts: FtBackgroundFact[];
  risks: FtBackgroundFact[];
  /** 投入建议（给人参考，决定权在人） */
  suggestion?: string;
  /** 每个覆盖面查到 / 查过没有 / 没查（代码判定，不经模型） */
  coverage?: FtCoverageItem[];
  /** 确定性红旗（代码判定） */
  flags?: FtRedFlag[];
  /** 交易对手名单筛查（最近一次） */
  screening?: FtScreeningResult;
  checkedAt?: string;
}

export type FtCoverageArea = 'website' | 'search' | 'domain_age' | 'mail_server' | 'email_domain' | 'screening';

export interface FtCoverageItem {
  area: FtCoverageArea;
  status: 'found' | 'checked_none' | 'not_checked';
  note?: string;
}

export interface FtRedFlag {
  rule: string;
  level: 'critical' | 'minor';
  message: string;
}

// ─── 交易对手筛查（制裁 / 出口管制名单）──────────────────────────────────

export type FtScreeningSourceId = 'us_csl' | 'un' | 'uk' | 'eu';

export interface FtScreeningSourceStatus {
  id: FtScreeningSourceId;
  label: string;
  url: string;
  /** 名单自带的版本 / 生成时间；拿不到时用文件摘要 */
  version?: string;
  fetchedAt?: string;
  count?: number;
  /** 最近一次更新失败的原因（缓存仍可用） */
  error?: string;
  errorAt?: string;
}

export interface FtScreeningMatch {
  score: number;
  level: 'high' | 'review';
  source: FtScreeningSourceId;
  list: string;
  name: string;
  matchedOn: string;
  basis: string;
  type?: string;
  countries?: string[];
  programs?: string;
  ref?: string;
}

export interface FtScreeningResult {
  id: string;
  at: string;
  query: string;
  country?: string;
  level: 'clear' | 'review' | 'high';
  matches: FtScreeningMatch[];
  /** 本次筛查用到的名单版本 */
  lists: { id: FtScreeningSourceId; version?: string; fetchedAt?: string; count?: number }[];
  /** 没有缓存、没参与筛查的名单 */
  missing: FtScreeningSourceId[];
  /** 触发场景：背调 / 建订单 / 生成单据 / 手动 */
  context?: string;
}

// ─── 客户开发 ────────────────────────────────────────────────────────────

export interface FtProspectCriteria {
  country: string;
  industry: string;
  keywords: string;
  customerType: string;
  exclude: string;
  count: number;
}

export interface FtLead {
  id: string;
  batchId: string;
  company: string;
  website?: string;
  emails: string[];
  country?: string;
  snippet?: string;
  score?: number;
  tier?: 'A' | 'B' | 'C';
  reason?: string;
  letter?: FtDraft;
  /** 代码复算前模型给的分数与档位（初判） */
  modelScore?: number;
  modelTier?: 'A' | 'B' | 'C';
  /** 邮箱可触达性（E1 具名 / 采购职能，E2 通用，E3 推断或域名不符，E4 无可用邮箱） */
  emailLevel?: FtEmailLevel;
  /** 复算明细（可审计） */
  scoreDetail?: { email: number; sources: number; decisionMaker: number; scale: number; penalty: number; recomputable: number; flags: string[]; critical: string[] };
  /** 读到的独立证据数（检索结果 / 首页 / 联系页） */
  evidence?: number;
  /** 域名有没有收信服务器（MX），查不到为空 */
  mx?: boolean;
  status: 'found' | 'scored' | 'drafted' | 'sent' | 'excluded';
  sentAt?: string;
  mailboxId?: string;
}

export type FtEmailLevel = 'E1' | 'E2' | 'E3' | 'E4';

export interface FtProspectBatch {
  id: string;
  criteria: FtProspectCriteria;
  createdAt: string;
  leadIds: string[];
}

// ─── 客户跟进 ────────────────────────────────────────────────────────────

export interface FtFollowupRules {
  /** 询盘收到后多少小时没回复算逾期 */
  inquiryNoReplyHours: number;
  /** 报价发出后多少天客户没回信 */
  quoteNoReplyDays: number;
  /** 多少天没有任何往来算沉默客户 */
  silentDays: number;
}

export type FtFollowupReason = 'inquiry_unanswered' | 'quote_no_reply' | 'silent';

export interface FtFollowupItem {
  key: string;
  customerEmail: string;
  customerName: string;
  reason: FtFollowupReason;
  since: string;
  lastContactAt: string;
  lastSubject: string;
  mailboxId: string;
  refId?: string;
  draft?: FtDraft;
}

export interface FtTimelineEntry {
  at: string;
  kind: 'in' | 'out' | 'quote' | 'order';
  subject: string;
  mailboxId?: string;
  refId?: string;
}

// ─── 报价 ────────────────────────────────────────────────────────────────

export interface FtProduct {
  id: string;
  model: string;
  name: string;
  spec?: string;
  /** 出厂成本（基础币种） */
  unitCost: number;
  moq?: number;
  leadTimeDays?: number;
  pcsPerCarton?: number;
  cartonCbm?: number;
  cartonKg?: number;
  images?: string[];
  /** HS 编码（6～10 位）；只有人工确认过的才能进单据 */
  hsCode?: string;
  hsConfirmed?: { at: string; by: string; code: string };
  hsSuggestions?: FtHsCandidate[];
  hsModel?: string;
  /** 单件净重（kg），装箱单用 */
  unitNetKg?: number;
}

export interface FtHsCandidate {
  code: string;
  description: string;
  /** 本地检索分（0～1） */
  score: number;
  /** 模型给的理由（重排后才有） */
  reason?: string;
  rank?: number;
}

export type FtIncoterm = 'EXW' | 'FOB' | 'CFR' | 'CIF';

export interface FtQuoteRules {
  baseCurrency: string;
  quoteCurrency: string;
  /** 1 报价币种 = 多少基础币种（手填时用） */
  manualRate: number;
  rateSource: 'manual' | 'live';
  packagingPct: number;
  /** 国内运输（每票，基础币种） */
  inlandFreight: number;
  /** 海运（每立方，报价币种） */
  oceanFreightPerCbm: number;
  insurancePct: number;
  marginPct: number;
  defaultIncoterm: FtIncoterm;
  validityDays: number;
}

export interface FtQuoteLine {
  productId?: string;
  requested: string;
  model: string;
  name: string;
  quantity: number;
  unitCost: number;
  match: 'exact' | 'partial' | 'none';
  note?: string;
  unitPrice?: number;
  amount?: number;
}

export interface FtCalcLine {
  key: string;
  label: string;
  formula: string;
  value: number;
  currency: string;
}

export interface FtQuote {
  id: string;
  inquiryId?: string;
  customerEmail?: string;
  customerName?: string;
  mailboxId?: string;
  incoterm: FtIncoterm;
  destination?: string;
  lines: FtQuoteLine[];
  calc: FtCalcLine[];
  warnings: string[];
  total: number;
  currency: string;
  fx: { rate: number; source: string; asOf: string };
  status: 'draft' | 'approved' | 'sent';
  approvedAt?: string;
  filePath?: string;
  sentAt?: string;
  model?: string;
  createdAt: string;
}

// ─── 订单推进 ────────────────────────────────────────────────────────────

export interface FtOrderNode {
  key: string;
  label: string;
  due?: string;
  done: boolean;
  doneAt?: string;
}

export type FtOrderDocKind = 'PI' | 'CI' | 'PL' | 'BL' | 'contract' | 'other';

export interface FtOrderDoc {
  id: string;
  kind: FtOrderDocKind;
  name: string;
  path: string;
  fields?: Record<string, string>;
  /** 逐行明细（本工作台生成的单据直接带；上传的 Excel 由代码按表头读出，不经模型） */
  table?: FtDocTable;
  extractedAt?: string;
  error?: string;
}

export interface FtDocLine {
  no?: number;
  description: string;
  model?: string;
  quantity?: number;
  unitPrice?: number;
  amount?: number;
  cartons?: number;
  netWeightKg?: number;
  grossWeightKg?: number;
}

export interface FtDocTable {
  lines: FtDocLine[];
  /** 单据上印的合计金额 */
  total?: number;
  /** 大写金额原文（SAY … ONLY） */
  amountInWords?: string;
  netWeightKg?: number;
  grossWeightKg?: number;
  /** 公式没有缓存值的单元格（不能当 0 参与核对） */
  uncached?: string[];
  generated?: boolean;
}

export interface FtOrderIssue {
  field: string;
  values: { doc: string; value: string }[];
}

export interface FtOrder {
  id: string;
  orderNo: string;
  quoteId?: string;
  customerName: string;
  customerEmail?: string;
  amount?: number;
  currency?: string;
  nodes: FtOrderNode[];
  docs: FtOrderDoc[];
  check?: { at: string; issues: FtOrderIssue[]; compared: string[]; findings?: FtDocFinding[] };
  /** PI / CI / 装箱单生成（全部按规则计算，模型不参与） */
  tradeDocs?: { input: FtTradeDocInput; validation?: FtDocFinding[]; generated?: { at: string; files: { kind: 'PI' | 'CI' | 'PL'; xlsx: string; pdf: string }[]; totals: FtTradeTotals } };
  status: 'active' | 'done';
  createdAt: string;
}

export interface FtTradeParty {
  name: string;
  address?: string;
  contact?: string;
  taxId?: string;
}

export interface FtBankInfo {
  name: string;
  accountName?: string;
  accountNo: string;
  swift: string;
  address?: string;
}

export interface FtTradeLine {
  no: number;
  productId?: string;
  model: string;
  description: string;
  /** 只有人工确认过的 HS 编码才写进单据 */
  hsCode?: string;
  hsConfirmed?: boolean;
  quantity: number;
  unit: string;
  unitPrice?: number;
  /** 本行总净重（kg）；不填按单件净重 × 数量 */
  netWeightKg?: number;
  unitNetKg?: number;
  pcsPerCarton?: number;
  cartonCbm?: number;
}

export interface FtTradeDocInput {
  seller: FtTradeParty;
  buyer: FtTradeParty;
  bank: FtBankInfo;
  piNo: string;
  ciNo: string;
  date: string;
  currency: string;
  /** 计价方式：USD/PCS（按件）、USD/MPCS（按千件）、USD/TON（按吨） */
  priceUnit: string;
  incoterm: string;
  portOfLoading: string;
  portOfDestination: string;
  payment: string;
  lcNumber?: string;
  shippingMarks?: string;
  vessel?: string;
  /** 装箱参数：没给装箱数时按每箱重量分箱；托盘自重计入毛重 */
  packing: { kgPerCarton: number; cartonsPerPallet: number; palletWeightKg: number; cartonTareKg: number; cbmPerPallet: number };
  certificates?: string;
  lines: FtTradeLine[];
}

export interface FtPackingRow {
  no: number;
  description: string;
  quantity: number;
  unit: string;
  cartons: number;
  kgPerCarton: number;
  netWeightKg: number;
  grossWeightKg: number;
  cbm: number;
}

export interface FtTradeTotals {
  amount: number;
  amountInWords: string;
  quantity: number;
  cartons: number;
  pallets: number;
  netWeightKg: number;
  grossWeightKg: number;
  cbm: number;
}

export interface FtDocFinding {
  rule: string;
  level: 'error' | 'warning' | 'info';
  message: string;
  suggestion?: string;
  docs?: string[];
}

// ─── 内容生产 / 网站社媒 / 平台运营 ───────────────────────────────────────

export type FtContentKind = 'product_listing' | 'product_desc' | 'social_post' | 'article' | 'outreach_template';

export interface FtContentDraft {
  id: string;
  kind: FtContentKind;
  productId?: string;
  language: string;
  topic: string;
  title: string;
  body: string;
  /** 平台上架用：标题 / 关键词 / 卖点 */
  keywords?: string[];
  model: string;
  createdAt: string;
  status: 'draft' | 'approved';
  images: string[];
  videos: string[];
  /** 社媒排期 */
  scheduledAt?: string;
  channel?: string;
  published?: { at: string; conversationId?: string; channel: string };
}

export interface FtListingIssue {
  rule: string;
  level: 'warn' | 'bad';
  message: string;
}

export interface FtListing {
  id: string;
  title: string;
  keywords: string[];
  category?: string;
  images?: number;
  descLength?: number;
  attributesFilled?: number;
  attributesTotal?: number;
  exposure?: number;
  clicks?: number;
  inquiries?: number;
  url?: string;
  issues: FtListingIssue[];
  suggestion?: { title: string; keywords: string[]; model: string; reason: string; issues?: FtListingIssue[] };
  status: 'pending' | 'approved' | 'applied';
}

export interface FtPublishJob {
  id: string;
  kind: 'platform_product' | 'social_post';
  contentId: string;
  channel: string;
  conversationId?: string;
  at: string;
}

export interface FtSeoCheck {
  id: string;
  url: string;
  at: string;
  pages: number;
  issues: string[];
  brokenLinks: number;
  brokenImages: number;
}

// ─── 数据整理 ────────────────────────────────────────────────────────────

export interface FtReportStats {
  from: string;
  to: string;
  inquiries: {
    total: number;
    byMailbox: Record<string, number>;
    byCategory: Record<string, number>;
    spam: number;
    replied: number;
    avgFirstReplyHours: number | null;
  };
  outreach: { leads: number; drafted: number; sent: number };
  quotes: { count: number; approved: number; sent: number; amountByCurrency: Record<string, number> };
  orders: { active: number; done: number; overdueNodes: number };
  followups: { due: number };
  mails: { received: number; sent: number };
}

export interface FtReport {
  id: string;
  createdAt: string;
  stats: FtReportStats;
  commentary?: string;
  model?: string;
  filePath?: string;
  sentAt?: string;
}

// ─── 设置与整体状态 ──────────────────────────────────────────────────────

export interface FtSettings {
  /** 每个模块明确用哪个模型（provider/model）；空 = 跟随系统默认模型 */
  moduleModels: Partial<Record<FtModuleKey, string>>;
  followupRules: FtFollowupRules;
  quoteRules: FtQuoteRules;
  /** 自动回复：mode=ack 只自动发确认收到 + 澄清问题；full 自动发完整回复草稿 */
  autoReply: { mode: 'ack' | 'full'; minIntent: 'high' | 'medium' | 'low'; skipSpam: boolean };
  /** 新询盘到了自动做信息提取与分类 */
  autoExtract: boolean;
  reportSchedule: { enabled: boolean; time: string; recipients: string[]; mailboxId?: string; lastSentDate?: string };
  outputDir?: string;
  platform: { name: string; url: string; publishUrl: string };
  website?: string;
  brand: { company: string; intro: string; sellingPoints: string };
  /** 发信闸门的可调项 */
  sendRules: FtSendRules;
  /** 单据抬头、收款银行等（生成 PI / CI 时带出） */
  tradeDocs: { seller: FtTradeParty; bank: FtBankInfo; payment: string; portOfLoading: string; priceUnit: string };
}

export interface FtSendRules {
  /** 每个邮箱每天最多发多少封（工作台发出的） */
  dailyLimit: number;
  /** 开发信 / 跟进的正文上限（词，中文按两个字一个词） */
  maxBodyWords: number;
  maxSubjectLen: number;
  /** 开发信 / 跟进里最多几个链接 */
  maxLinks: number;
  /** 开发信必须带退订句 */
  requireOptOut: boolean;
  /** 一键补上的退订句 */
  optOutLine: string;
  /** 额外禁用词（自己加的） */
  extraBanned: string[];
  /** 退信率超过这个比例（近 30 天、至少发过 10 封）就停发开发信 */
  maxBounceRate: number;
}

// ─── 发信闸门 ────────────────────────────────────────────────────────────

export type FtSendKind = 'outreach' | 'followup' | 'inquiry_reply' | 'auto_reply' | 'quote';

export interface FtGateIssue {
  rule: string;
  level: 'block' | 'warn';
  message: string;
}

export interface FtGateResult {
  ok: boolean;
  issues: FtGateIssue[];
  /** 审批时的内容摘要；发送时内容必须和它一致 */
  hash: string;
  sentToday: number;
  dailyLimit: number;
}

export interface FtSuppression {
  id: string;
  /** 邮箱或整个域名（二选一） */
  email?: string;
  domain?: string;
  reason: string;
  source: 'manual' | 'unsubscribe' | 'bounce';
  at: string;
  mailboxId?: string;
  refId?: string;
}

export interface FtSendRecord {
  id: string;
  mailboxId: string;
  kind: FtSendKind;
  to: string[];
  subject: string;
  hash: string;
  at: string;
  status: 'sent' | 'blocked' | 'failed';
  reason?: string;
  refId?: string;
}

export interface FtState {
  mailboxes: FtMailbox[];
  messages: FtMessage[];
  inquiries: FtInquiry[];
  backgrounds: FtBackground[];
  prospectBatches: FtProspectBatch[];
  leads: FtLead[];
  products: FtProduct[];
  quotes: FtQuote[];
  orders: FtOrder[];
  contents: FtContentDraft[];
  listings: FtListing[];
  publishJobs: FtPublishJob[];
  seoChecks: FtSeoCheck[];
  reports: FtReport[];
  suppressions: FtSuppression[];
  sendLog: FtSendRecord[];
  screenings: FtScreeningResult[];
  settings: FtSettings;
  outputDir: string;
}

export interface FtModelOption {
  value: string;
  label: string;
  provider: string;
  /** 下拉分组（「泰途统一通道（泰豆）」「DeepSeek 官方」…） */
  group?: string;
}

export interface FtModelsResponse {
  options: FtModelOption[];
  /** 系统默认模型（未单独指定的模块用它） */
  defaultLabel: string;
}

export interface FtInvokeRequest {
  action: string;
  payload?: unknown;
}

export interface FtEvent {
  type: 'state' | 'mailbox' | 'inquiry' | 'progress';
  payload?: unknown;
}
