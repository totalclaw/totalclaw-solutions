/**
 * 财会审计 · 主进程内部类型：标准数据集的行（第 7.1 节）。
 *
 * 规则：金额一律最小货币单位整数（分 / 哈拉拉），日期一律 ISO（YYYY-MM-DD），
 * row 是原表的行号（表头下第一行 = 2），所有结果都能追溯回「数据集 + 行号」。
 */
import type { FauCheckMark, FauInputKind, FauOpenItem } from '@totalclaw/ipc-contracts';
import type { KpiRow, PvRow } from './fpaTypes';
import { TAX_PARSED_KINDS, type TaxDatasetRows } from './intake/tax';
import { SUBLEDGER_KINDS, type SubledgerRowsByKind } from './subledgerTypes';
import { TREASURY_KINDS, type TreasuryRowsByKind } from './engines/treasury/types';

export interface JournalRow {
  row: number;
  date: string;
  voucherNo: string;
  lineNo: number;
  accountCode: string;
  accountName: string;
  summary: string;
  debit: number;
  credit: number;
  currency: string;
  fxAmount: number | null;
  counterparty: string;
  dept: string;
  project: string;
  /** 发票 / 业务日期（跨期识别用）；没有这一列时为 ''，由引擎再从摘要里找日期 */
  businessDate: string;
  source: string;
}

export interface TbRow {
  row: number;
  accountCode: string;
  accountName: string;
  level: number | null;
  openingDr: number;
  openingCr: number;
  periodDr: number;
  periodCr: number;
  closingDr: number;
  closingCr: number;
}

export interface BankRow {
  row: number;
  bankAccount: string;
  date: string;
  valueDate: string;
  ref: string;
  counterparty: string;
  amountIn: number;
  amountOut: number;
  /** 流水里的余额列（有就用来推期初 / 期末） */
  balance: number | null;
  summary: string;
}

/** 总账 / 子账提取（同一结构，按对账键全外连接） */
export interface LedgerExtractRow {
  row: number;
  key: string;
  date: string;
  /** 本位币金额 */
  amount: number;
  quantity: number | null;
  /** 外币金额 */
  fxAmount: number | null;
  currency: string;
  docNo: string;
  desc: string;
}

export interface BudgetRow {
  row: number;
  accountCode: string;
  accountName: string;
  period: string;
  amount: number;
}

export type AccrualBasis = 'fixed' | 'straight_line' | 'rate';
export interface AccrualPolicyRow {
  row: number;
  id: string;
  description: string;
  expenseAccount: string;
  expenseAccountName: string;
  liabilityAccount: string;
  liabilityAccountName: string;
  basis: AccrualBasis;
  /** fixed：每期金额；straight_line：合同总额；rate：不用 */
  amount: number;
  /** YYYY-MM，straight_line 的起止期间（含） */
  startPeriod: string;
  endPeriod: string;
  /** rate：费率（小数，0.02 = 2%） */
  rate: number | null;
  /** rate：基数取这个科目本期发生额 */
  baseAccount: string;
  /** 判断「已入账」：序时账里该费用科目、摘要含任一关键词的本期发生额 */
  keywords: string[];
  autoReverse: boolean;
}

export interface FxRateRow {
  row: number;
  currency: string;
  rate: number;
  date: string;
}

/** 批次 4：税务组数据集（intake/tax.ts）并进来 */
/** 批次 2 起的子账类型（A3–A8）见 subledgerTypes.ts */
/** 批次 6：资金与金融风险的数据集行定义在 engines/treasury/types.ts（应收 / 应付用批次 2 的 ar / ap） */
export interface DatasetRowsByKind extends TaxDatasetRows, SubledgerRowsByKind, TreasuryRowsByKind {
  journal: JournalRow[];
  tb: TbRow[];
  bank: BankRow[];
  subledger: LedgerExtractRow[];
  budget: BudgetRow[];
  accrual_policy: AccrualPolicyRow[];
  fx_rates: FxRateRow[];
  // 批次 5（fpa）
  kpi: KpiRow[];
  price_volume: PvRow[];
}
export type ParsedKind = keyof DatasetRowsByKind;
export const PARSED_KINDS: ParsedKind[] = ['journal', 'tb', 'bank', 'subledger', 'budget', 'accrual_policy', 'fx_rates', 'kpi', 'price_volume', ...TAX_PARSED_KINDS, ...SUBLEDGER_KINDS, ...TREASURY_KINDS];
export function isParsedKind(k: FauInputKind): k is ParsedKind {
  return (PARSED_KINDS as string[]).includes(k);
}

/** 关账清单里由人勾的项 */
export type ManualChecklist = Record<string, { mark: FauCheckMark; evidence?: string }>;

export type { FauOpenItem };
