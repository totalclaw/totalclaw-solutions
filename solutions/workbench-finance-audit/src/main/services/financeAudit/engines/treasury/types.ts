/**
 * G5 资金与金融风险的标准数据集行（批次 6）。规则同 ../../types.ts：金额最小货币单位整数、日期 ISO、row = 原表行号。
 * 比率一律小数（0.05 = 5%）；可空的列没填为 null。应收 / 应付明细（ar / ap）用批次 2 的 OpenItemRow（../../subledgerTypes.ts）。
 */
import type {
  FauEclBucket, FauCovenantMetric, FauFlowCertainty, FauFxCertainty, FauFxKind, FauInvestType, FauLiquidityCategory, FauPayPriority,
} from '@totalclaw/ipc-contracts';

export interface BankBalanceRow {
  row: number; account: string; bank: string; entity: string; currency: string;
  bankBalance: number; bookBalance: number | null; systemBalance: number | null;
  restricted: number; safetyLine: number | null; depositRate: number | null; date: string;
}

export interface CashPlanRow { row: number; date: string; category: string; counterparty: string; inflow: number; outflow: number; certainty: FauFlowCertainty }

export interface PaymentRequestRow {
  row: number; id: string; payee: string; amount: number; dueDate: string; category: string; priority: FauPayPriority | '';
  payFrom: string; payeeAccount: string; accountChanged: boolean; personalAccount: boolean; newSupplier: boolean;
  contractAmount: number | null; paidToDate: number | null; invoiceAmount: number | null; approvalLimit: number | null;
}

export interface CreditFacilityRow {
  row: number; bank: string; limit: number; used: number; rate: number | null; expiry: string;
  response: number | null; innovation: number | null; cooperation: number | null;
}

export interface LiquidityItemRow { row: number; item: string; category: FauLiquidityCategory; amount: number; factor: number | null }

export interface FxExposureRow { row: number; currency: string; kind: FauFxKind; amount: number; certainty: FauFxCertainty; date: string; entity: string }

export interface LoanRow {
  row: number; id: string; lender: string; instrument: 'loan' | 'bond' | 'lease' | 'other'; principal: number;
  rate: number | null; feeRate: number | null; startDate: string; maturityDate: string; repayment: 'bullet' | 'amortizing'; secured: boolean; currency: string;
}

export interface CovenantRow { row: number; lender: string; name: string; metric: FauCovenantMetric; op: 'le' | 'ge'; limit: number }

/** 财务指标（按期间一行，滚动 12 个月口径；预测期标 forecast） */
export interface FinMetricsRow {
  row: number; period: string; forecast: boolean;
  revenue: number | null; cogs: number | null; ebitda: number | null; interest: number | null; debt: number | null; cash: number | null;
  currentAssets: number | null; currentLiabilities: number | null; inventory: number | null; totalAssets: number | null; totalLiabilities: number | null;
  netWorth: number | null; debtService: number | null; equityValue: number | null; days: number | null;
}

export interface CreditExposureRow {
  row: number; id: string; counterparty: string; segment: string; balance: number; undrawn: number; ccf: number | null;
  ratingOrig: string; ratingNow: string; dpd: number; watchlist: boolean; impaired: boolean;
  pd12m: number | null; pdLifetime: number | null; lgd: number | null; eir: number | null; termYears: number | null; priorStage: number | null;
}

export interface MacroScenarioRow { row: number; scenario: string; weight: number; pdMultiplier: number }

export interface LossRateRow { row: number; bucket: FauEclBucket; rate: number }

export interface InventoryRow { row: number; sku: string; name: string; qty: number | null; amount: number; usage: number | null; lastMoveDate: string }

export interface InvestmentRow {
  row: number; id: string; product: string; type: FauInvestType; issuer: string; cost: number; marketValue: number;
  riskRating: number | null; maturityDate: string; approved: boolean | null; yield: number | null; liquidityDays: number | null;
}

export interface TreasuryRowsByKind {
  bank_balance: BankBalanceRow[];
  cash_plan: CashPlanRow[];
  payment_request: PaymentRequestRow[];
  credit_facility: CreditFacilityRow[];
  liquidity_items: LiquidityItemRow[];
  fx_exposure: FxExposureRow[];
  loan: LoanRow[];
  covenant: CovenantRow[];
  fin_metrics: FinMetricsRow[];
  credit_exposure: CreditExposureRow[];
  macro_scenario: MacroScenarioRow[];
  loss_rates: LossRateRow[];
  inventory: InventoryRow[];
  investment: InvestmentRow[];
}
export type TreasuryKind = keyof TreasuryRowsByKind;
export const TREASURY_KINDS: TreasuryKind[] = [
  'bank_balance', 'cash_plan', 'payment_request', 'credit_facility', 'liquidity_items', 'fx_exposure', 'loan', 'covenant',
  'fin_metrics', 'credit_exposure', 'macro_scenario', 'loss_rates', 'inventory', 'investment',
];
