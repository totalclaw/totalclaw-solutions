/**
 * 财会审计 · 批次 2 子账类型（A3–A8）的标准数据集行。规则同 types.ts：
 * 金额一律最小货币单位整数（分 / 哈拉拉），单价允许带小数分；日期 ISO；row 是原表行号（表头下第一行 = 2）。
 */

/** 应收 / 应付未清项（ar / ap） */
export interface OpenItemRow {
  row: number;
  party: string;
  docNo: string;
  poNo: string;
  docDate: string;
  dueDate: string;
  /** 账期天数（没有到期日时用开票日 + 账期） */
  termDays: number | null;
  amount: number;
  /** 未清金额；表里没有未清列时 = 金额 − 已收 / 已付 */
  open: number;
  currency: string;
  disputed: boolean;
}

/** 收款记录（应收付款历史） */
export interface ReceiptRow { row: number; party: string; docNo: string; date: string; amount: number }

/** 客户 / 供应商档案 */
export interface PartyRow {
  row: number;
  name: string;
  regNo: string;
  grade: string;
  termDays: number | null;
  creditLimit: number | null;
  requestedLimit: number | null;
  /** 资产负债率（小数） */
  debtRatio: number | null;
  cashFlowPositive: boolean | null;
  /** 高风险信号原文（诉讼、被执行、破产…） */
  riskFlags: string;
  bankAccount: string;
  bankName: string;
  accountName: string;
  prevBankAccount: string;
  relatedParty: boolean;
  blacklisted: boolean;
}

/** 采购订单 / 收货单 / 采购发票行（三单匹配） */
export interface ProcureRow {
  row: number;
  docNo: string;
  poNo: string;
  line: string;
  item: string;
  supplier: string;
  qty: number;
  /** 不含税单价（分，可带小数） */
  unitPrice: number | null;
  /** 不含税金额 */
  amount: number | null;
  /** 税率（小数） */
  taxRate: number | null;
  date: string;
}

export interface FundsRow { row: number; account: string; balance: number; scheduled: number; frozen: number }

export interface ExpenseClaimRow {
  row: number;
  claimNo: string;
  employee: string;
  dept: string;
  level: string;
  category: string;
  submitDate: string;
  expenseDate: string;
  invoiceKind: string;
  invoiceCode: string;
  invoiceNo: string;
  invoiceDate: string;
  sellerName: string;
  sellerTaxId: string;
  buyerName: string;
  buyerTaxId: string;
  amount: number;
  tax: number;
  total: number;
  taxRate: number | null;
  /** ZATCA 电子发票二维码（base64 TLV） */
  qr: string;
}

export interface FaRegisterRow {
  row: number;
  assetNo: string;
  name: string;
  category: string;
  /** 取得（开始使用）日期 */
  acquireDate: string;
  cost: number;
  /** 原文（直线 / 工作量 / 双倍余额 / 年数总和），引擎归一 */
  method: string;
  lifeMonths: number | null;
  salvageRate: number | null;
  salvage: number | null;
  /** 账面期末累计折旧 */
  bookedAccum: number | null;
  /** 账面本期折旧 */
  bookedPeriod: number | null;
  impairment: number;
  totalUnits: number | null;
  periodUnits: number | null;
  /** 本期之前累计工作量 */
  unitsToDate: number | null;
  dept: string;
  status: string;
  disposalDate: string;
}

export interface FaMovementRow {
  row: number;
  type: 'addition' | 'disposal';
  /** 原文（新增 / 出售 / 报废 / 盘亏 / 捐赠 …） */
  typeText: string;
  assetNo: string;
  name: string;
  date: string;
  /** 新增：入账原值 */
  amount: number;
  proceeds: number;
  costs: number;
}

export interface PayrollRow {
  row: number;
  empId: string;
  name: string;
  dept: string;
  /** 各明细项之和（表里有明细列时），否则 null */
  components: number | null;
  gross: number;
  socialPersonal: number | null;
  fundPersonal: number | null;
  iitWithheld: number | null;
  otherDeductions: number;
  net: number | null;
  socialBase: number | null;
  fundBase: number | null;
  special: number;
  ytdIncome: number;
  ytdInsurance: number;
  ytdSpecial: number;
  ytdTaxPaid: number;
  /** 本年第几个月（累计预扣用；不填按项目期间的月份） */
  monthIndex: number | null;
  /** 单位社保公积金（或 GOSI 单位部分）账面数 */
  employerBooked: number | null;
  hireDate: string;
  leaveDate: string;
  /** 沙特：是否沙特籍、基本工资、住房补贴、服务起始日、期末服务金账面余额 */
  saudi: boolean | null;
  basic: number | null;
  housing: number | null;
  serviceStart: string;
  eosbBooked: number | null;
}

export interface IcRow {
  row: number;
  entity: string;
  counterparty: string;
  /** 原文科目 / 类型，归一见 engines/accounting/intercompany */
  type: string;
  docNo: string;
  date: string;
  amount: number;
  fxAmount: number | null;
  currency: string;
  internalPrice: number | null;
  marketPrice: number | null;
}

export interface GuaranteeRow {
  row: number;
  guarantor: string;
  beneficiary: string;
  beneficiaryType: string;
  amount: number;
  startDate: string;
  endDate: string;
  feeRate: number | null;
  status: string;
  approved: boolean | null;
  netAssets: number | null;
}

export interface SubledgerRowsByKind {
  ar: OpenItemRow[];
  ap: OpenItemRow[];
  receipt: ReceiptRow[];
  customer: PartyRow[];
  supplier: PartyRow[];
  po: ProcureRow[];
  grn: ProcureRow[];
  invoice: ProcureRow[];
  funds: FundsRow[];
  expense_claim: ExpenseClaimRow[];
  fa_register: FaRegisterRow[];
  fa_movement: FaMovementRow[];
  payroll: PayrollRow[];
  intercompany: IcRow[];
  guarantee: GuaranteeRow[];
}

export const SUBLEDGER_KINDS: (keyof SubledgerRowsByKind)[] = [
  'ar', 'ap', 'receipt', 'customer', 'supplier', 'po', 'grn', 'invoice', 'funds', 'expense_claim', 'fa_register', 'fa_movement', 'payroll', 'intercompany', 'guarantee',
];
