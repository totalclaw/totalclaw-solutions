/**
 * 解决方案 · 政采云智能体 —— 契约类型（docs/zcy-agent-workbench.md）。
 *
 * 面向在政采云（zcygov.cn）上做生意的供应商：企业给材料与账号，系统在内置浏览器里代做日常工作 ——
 *   账号与材料：账号密码存系统钥匙串，只由应用填进登录框，不进模型对话；资质到期提醒；
 *   商品上架：商品表 → 按区划规则查标题、图片、比价链接与价格 → 数字员工填写，停在「提交审核」前；
 *   询价报价：读回待报价的询价单 → 按成本与毛利率用规则算报价 → 数字员工填写，停在「提交报价」前；
 *   订单履约：读回订单 → 接单与发货时限预警 → 数字员工接单 / 回填物流，停在确认前 → 待开票订单转入发票智能体。
 *
 * 红线：报价与价格由规则计算，模型不算钱；提交审核、提交报价、接单、发货确认、合同签章一律由人点；
 * 验证码、滑块、短信、CA 由人完成；电子投标客户端不碰。各省规则不同，阈值做成可改的区划规则表。
 */

export type ZcModuleKey = 'listing' | 'quote' | 'orders';

export interface ZcIssue {
  level: 'error' | 'warning';
  code: string;
  message: string;
}

export interface ZcQualification {
  id: string;
  name: string;
  /** 本机路径 */
  file: string;
  /** 到期日 YYYY-MM-DD，空 = 长期 */
  expireAt: string;
  note: string;
}

export interface ZcCompany {
  name: string;
  creditCode: string;
  legalPerson: string;
  contact: string;
  phone: string;
  address: string;
  bank: string;
  bankAccount: string;
  qualifications: ZcQualification[];
  // 下面这些是入驻填报页要的（字段来自吉林省供应商入驻表单）
  englishName: string;
  shortName: string;
  postcode: string;
  /** 对外电子邮箱 */
  email: string;
  /** 联系人电话（业务负责人） */
  contactMobile: string;
  /** 上年末资产总额（万元） */
  totalAssets: string;
  /** 上年末从业人员（人） */
  employees: string;
  /** 上年度营业收入（万元） */
  income: string;
  /** 店铺介绍 */
  intro: string;
  /** 营业执照登记机关 */
  registerOrg: string;
  /** 注册资金（万元） */
  registerCapital: string;
  /** 经营范围 */
  scope: string;
  onjobCount: string;
  socialPayCount: string;
}

/** 从供应商工作台读回来的状态 */
export interface ZcWorkbench {
  readAt: string;
  loggedIn: boolean;
  region: string;
  identity: string;
  /** 还是临时供应商：商品中心等后台没有权限，要先完成入驻 */
  temporary: boolean;
  todos: Array<{ label: string; count: number }>;
}

export interface ZcAccount {
  username: string;
  /** 密码是否已保存（明文不回给界面） */
  hasPassword: boolean;
  loginUrl: string;
  /** 登录后的工作台首页 */
  homeUrl: string;
  lastFillAt: string;
}

/** 区划规则：各省电子卖场口径不同，内置的只是公开资料里查到的起点，以本区划现行规则为准 */
export interface ZcRegionRule {
  id: string;
  name: string;
  /** 主图最短边（像素） */
  imageMinSide: number;
  /** 主图最少张数 */
  imageMin: number;
  /** 单张图片上限（KB） */
  imageMaxKb: number;
  /** 比价基准：avg 自营价均值（多于 3 个取最低 3 个）；min 自营最低价 */
  priceRule: 'avg' | 'min';
  /** 高出基准多少算违规（0.1 = 10%）；超过基准但未到这条线只提醒 */
  priceTolerance: number;
  /** 至少要几条自营比价链接 */
  refMin: number;
  /** 接单时限（小时） */
  acceptHours: number;
  titleMax: number;
  /** 标题拼法：brand_first「品牌 品名 型号」；name_first「品名 品牌 型号」（吉林指南的「商品-品牌-型号」） */
  titleOrder: 'brand_first' | 'name_first';
  /** 审核时限（工作日），0 = 不清楚 */
  reviewDays: number;
  bannedWords: string[];
  /** 这套规则的出处与提醒 */
  note: string;
}

export interface ZcPriceRef {
  platform: 'jd' | 'tmall' | 'suning' | 'other';
  url: string;
  price: number;
}

export interface ZcImageInfo {
  path: string;
  width: number;
  height: number;
  kb: number;
}

export type ZcProductStatus = 'draft' | 'confirmed' | 'handed' | 'submitted' | 'listed' | 'rejected' | 'delisted';

export interface ZcProduct {
  id: string;
  /** 品名（不含品牌型号） */
  name: string;
  brand: string;
  model: string;
  category: string;
  /** 上架标题：默认按「品牌 品名 型号」拼，人可改 */
  title: string;
  price: number;
  stock: number;
  unit: string;
  /** 参数，一行一条「名称：值」 */
  params: string;
  detail: string;
  images: ZcImageInfo[];
  refs: ZcPriceRef[];
  status: ZcProductStatus;
  issues: ZcIssue[];
  conversationId?: string;
  productUrl?: string;
  rejectReason?: string;
  updatedAt: string;
}

export interface ZcInquiryItem {
  name: string;
  spec: string;
  qty: number;
  unit: string;
  /** 单价最高限价，0 = 没有 */
  ceiling: number;
  /** 我方含税到货成本（单价），人填 */
  cost: number;
  /** 规则算出的报价（单价） */
  quote: number;
}

export type ZcInquiryStatus = 'new' | 'priced' | 'confirmed' | 'handed' | 'submitted' | 'won' | 'lost' | 'skipped';

export interface ZcInquiry {
  id: string;
  /** 询价单号 */
  no: string;
  title: string;
  buyer: string;
  /** 报价截止时间（ISO），读不出为空 */
  deadline: string;
  /** 项目预算 / 总限价，0 = 没有 */
  budget: number;
  items: ZcInquiryItem[];
  /** 目标毛利率（0.08 = 8%） */
  margin: number;
  total: number;
  status: ZcInquiryStatus;
  issues: ZcIssue[];
  url: string;
  note: string;
  conversationId?: string;
  updatedAt: string;
}

export type ZcOrderStatus = 'to_accept' | 'to_ship' | 'shipped' | 'to_settle' | 'to_invoice' | 'done' | 'closed';

export interface ZcOrder {
  id: string;
  orderNo: string;
  buyer: string;
  buyerTaxNo: string;
  amount: number;
  /** 下单时间（ISO），读不出为空 */
  createdAt: string;
  status: ZcOrderStatus;
  /** 商品摘要 */
  items: string;
  logisticsCompany: string;
  logisticsNo: string;
  /** 转入发票智能体后的批次 id */
  invoiceBatchId?: string;
  conversationId?: string;
  note: string;
  updatedAt: string;
}

export interface ZcAlert {
  level: 'error' | 'warning';
  kind: 'order_accept' | 'order_ship' | 'inquiry_deadline' | 'qualification' | 'price';
  text: string;
  refId: string;
}

export interface ZcLogEntry {
  at: string;
  module: ZcModuleKey | 'account' | 'patrol';
  text: string;
  ok: boolean;
}

export interface ZcSettings {
  company: ZcCompany;
  account: ZcAccount;
  regionId: string;
  regions: ZcRegionRule[];
  /** 默认目标毛利率 */
  defaultMargin: number;
  /** 订单转开票时用的税率 */
  invoiceTaxRate: number;
  /** 写商品详情用的模型（provider/model），空 = 系统默认 */
  model: string;
  /** 每天这些时刻提醒巡检（HH:mm），空 = 不提醒 */
  patrolTimes: string[];
}

export interface ZcState {
  settings: ZcSettings;
  products: ZcProduct[];
  inquiries: ZcInquiry[];
  orders: ZcOrder[];
  alerts: ZcAlert[];
  /** 最近一次从政采云工作台读回的状态；没读过为 null */
  workbench: ZcWorkbench | null;
  log: ZcLogEntry[];
  /** 系统钥匙串可用，密码能安全保存 */
  secretStorage: boolean;
}
