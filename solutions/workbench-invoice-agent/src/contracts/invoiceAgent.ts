/**
 * 解决方案 · 发票智能体 —— 契约类型（docs/invoice-agent-workbench.md）。
 *
 * 财务拿着付款单或一张表（很多行、很多家购买方）→ 识别列 → 逐行校验 → 按规则组票、拆票、算税
 * → 人确认 → 经两条通道之一开具 → 台账回填。
 *   etax_batch  系统浏览器打开电子税务局：应用走到「批量开票」页、放入导入文件，人核对后点「批量开具」，
 *               再从「批量开票记录」按发票流水号读回号码；登录与扫脸由人完成；
 *   api         开票服务商接口（诺诺 · 诺税通 SaaS）：提交 → 查询结果 → 回填；数电账号的税局登录验证由人完成。
 *
 * 三条红线：金额与税额由规则计算，模型不算钱；开具默认停在提交前由人确认；每张发票能追到来源行。
 */

export type IvInvoiceKind = 'special' | 'normal';
export type IvChannel = 'etax_batch' | 'api';
/** buyer 同一购买方合成一张；order 同一订单号一张；row 一行一张 */
export type IvMergeMode = 'buyer' | 'order' | 'row';
export type IvDraftStatus = 'draft' | 'confirmed' | 'handed' | 'issued' | 'failed' | 'red';

export interface IvIssue {
  level: 'error' | 'warning';
  code: string;
  message: string;
}

export interface IvSeller {
  name: string;
  taxNo: string;
  address: string;
  phone: string;
  bank: string;
  bankAccount: string;
  /** 开票人 */
  drawer: string;
  taxpayerType: 'general' | 'small';
  /** 表里没写税率时用它（0.13 这样的小数） */
  defaultTaxRate: number;
  /** 电子税务局省份代码（拼在 etax.<省>.chinatax.gov.cn 里） */
  province: string;
  /** 单张发票价税合计上限，0 = 不拆 */
  perInvoiceLimit: number;
  /** 当月剩余可开额度（不含税），由人从电子税务局首页抄来；0 = 没填，不检查 */
  remainingQuota: number;
}

/** 开票服务商接口配置（密钥明文不回给界面） */
export interface IvApiConfig {
  provider: 'nuonuo';
  /** 沙箱：走服务商测试环境与测试税号，不产生真实发票 */
  sandbox: boolean;
  appKey: string;
  hasSecret: boolean;
  /** 手工填的 accessToken（沙箱应用页面上给的）；正式环境留空，由应用用密钥换取并缓存 */
  hasToken: boolean;
  /** 数电账号（登录电子税务局的手机号 / 身份证号），税局登录验证时用 */
  eleAccount: string;
}

export interface IvSettings {
  seller: IvSeller;
  channel: IvChannel;
  api: IvApiConfig;
  /** 自己从电子税务局下载的《批量导入开具发票模板》（本机路径）；留空用应用自带的官方模板 */
  officialTemplate: string;
  mergeMode: IvMergeMode;
  /** 表里没写票种时用它 */
  defaultKind: IvInvoiceKind;
  /** 表里没写是否含税时：金额按含税算 */
  amountTaxIncluded: boolean;
  /** 单张发票明细行上限 */
  maxLines: number;
  /** 抽取付款单 / 建议税收编码用的模型（provider/model），空 = 系统默认 */
  model: string;
  outputDir: string;
}

/** 客户档案：开过一次就记住，下次只写名称也能补全 */
export interface IvCustomer {
  id: string;
  name: string;
  taxNo: string;
  address: string;
  phone: string;
  bank: string;
  bankAccount: string;
  email: string;
  mobile: string;
  updatedAt: string;
}

/** 商品档案：项目名称 → 税收分类编码（19 位）与税率；编码要人确认过才算数 */
export interface IvGoods {
  id: string;
  name: string;
  taxCode: string;
  /** 税收分类简称（票面「*简称*项目名称」里的那段） */
  shortName: string;
  spec: string;
  unit: string;
  taxRate: number;
  confirmed: boolean;
  /** suggested 模型建议待确认；manual 人填 */
  source: 'manual' | 'suggested';
}

/** 导入的一行（已归一成开票字段） */
export interface IvRow {
  id: string;
  batchId: string;
  /** 来源：文件名 · 工作表 · 行号 */
  file: string;
  sheet: string;
  rowNo: number;
  buyerName: string;
  buyerTaxNo: string;
  buyerAddress: string;
  buyerPhone: string;
  buyerBank: string;
  buyerBankAccount: string;
  email: string;
  mobile: string;
  itemName: string;
  spec: string;
  unit: string;
  qty: number;
  price: number;
  /** 表里的金额（是否含税见 taxIncluded） */
  amount: number;
  taxIncluded: boolean;
  taxRate: number;
  kind: IvInvoiceKind;
  orderNo: string;
  remark: string;
  /** 购方是自然人 / 没有税号的单位 */
  personal: boolean;
  issues: IvIssue[];
  /** 人工排除：不开这一行 */
  skipped: boolean;
}

export interface IvBatch {
  id: string;
  name: string;
  createdAt: string;
  files: string[];
  rowCount: number;
  /** 字段 → 表头 */
  mapping: Record<string, string>;
  /** file 表格导入；slip 付款单抽取；zcy 政采云订单转入 */
  source: 'file' | 'slip' | 'zcy';
}

export interface IvLine {
  itemName: string;
  taxCode: string;
  shortName: string;
  spec: string;
  unit: string;
  qty: number;
  /** 不含税单价 */
  price: number;
  /** 不含税金额 */
  amount: number;
  tax: number;
  /** 价税合计 */
  total: number;
  taxRate: number;
  rowIds: string[];
}

export interface IvDraft {
  id: string;
  batchId: string;
  /** 本批内的流水号（批量导入模板里的「发票流水号」） */
  serial: string;
  kind: IvInvoiceKind;
  buyerName: string;
  buyerTaxNo: string;
  buyerAddress: string;
  buyerPhone: string;
  buyerBank: string;
  buyerBankAccount: string;
  email: string;
  mobile: string;
  personal: boolean;
  lines: IvLine[];
  amount: number;
  tax: number;
  total: number;
  remark: string;
  orderNos: string[];
  /** 因超限额 / 超行数拆出来的：第几张 / 共几张 */
  part?: { index: number; of: number };
  status: IvDraftStatus;
  issues: IvIssue[];
  channel?: IvChannel;
  /** 开具后回填 */
  invoiceNo?: string;
  issuedAt?: string;
  /** 发票文件（PDF / OFD / XML，本机路径） */
  file?: string;
  failReason?: string;
  conversationId?: string;
  /** 服务商接口返回的发票流水号（查询结果用） */
  apiSerial?: string;
  /** 服务商返回的版式文件地址 */
  pdfUrl?: string;
  ofdUrl?: string;
  xmlUrl?: string;
  /** 红冲：这张红字发票对应的蓝票草稿 id */
  redOf?: string;
  redReason?: string;
  updatedAt: string;
}

export interface IvLogEntry {
  at: string;
  text: string;
  ok: boolean;
}

export interface IvColumnGuess {
  headers: string[];
  mapping: Record<string, string>;
  /** 必填但没认出来的字段 */
  missing: string[];
  sample: Record<string, string>[];
  sheet: string;
  rowCount: number;
}

export interface IvBatchSummary {
  rows: number;
  skipped: number;
  errors: number;
  warnings: number;
  buyers: number;
  total: number;
}

export interface IvState {
  settings: IvSettings;
  batches: IvBatch[];
  drafts: IvDraft[];
  customers: IvCustomer[];
  goods: IvGoods[];
  log: IvLogEntry[];
  /** 系统钥匙串可用，接口密钥能安全保存 */
  secretStorage: boolean;
}

/** 开票字段清单（列识别用），required = 没有就开不了 */
export const IV_FIELDS: Array<{ key: string; required: boolean }> = [
  { key: 'buyerName', required: true },
  { key: 'buyerTaxNo', required: false },
  { key: 'itemName', required: true },
  { key: 'amount', required: true },
  { key: 'qty', required: false },
  { key: 'price', required: false },
  { key: 'taxRate', required: false },
  { key: 'taxIncluded', required: false },
  { key: 'spec', required: false },
  { key: 'unit', required: false },
  { key: 'kind', required: false },
  { key: 'orderNo', required: false },
  { key: 'remark', required: false },
  { key: 'buyerAddress', required: false },
  { key: 'buyerPhone', required: false },
  { key: 'buyerBank', required: false },
  { key: 'buyerBankAccount', required: false },
  { key: 'email', required: false },
  { key: 'mobile', required: false },
];

/** 电子税务局页面的当前状态（系统浏览器里读回来的） */
export interface IvEtaxState {
  opened: boolean;
  url: string;
  /** portal 门户未登录；login 登录页；portal_login 门户已登录；invoice_business 发票业务；blue 蓝字发票开具；batch 批量开票；makeout 单张开票表单 */
  kind: 'portal' | 'portal_login' | 'login' | 'invoice_business' | 'blue' | 'batch' | 'makeout' | 'other';
  company: string;
  taxNo: string;
  quota: number | null;
  totalQuota: number | null;
  /** 要人做的事：login 登录；face 扫脸；level 点「开始认证」；session 会话失效；空 = 不用 */
  need: '' | 'face' | 'level' | 'ack' | 'session' | 'login';
  templateVersion: string;
  note: string;
}
