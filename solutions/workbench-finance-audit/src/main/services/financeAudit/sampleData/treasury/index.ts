/**
 * 批次 6（E1–E7）金标准夹具。金额单位：分。期间 2026-09，基准日 2026-09-30，本位币 CNY。
 * 每组夹具下面的注释是手算过程，单测（engines/treasury/*.test.ts）逐项断言这些数。
 */
import type {
  BankBalanceRow, CashPlanRow, CovenantRow, CreditExposureRow, CreditFacilityRow, FinMetricsRow, FxExposureRow,
  InventoryRow, InvestmentRow, LiquidityItemRow, LoanRow, PaymentRequestRow,
} from '../../engines/treasury/types';
import type { FxRateRow } from '../../types';
import type { OpenItemRow } from '../../subledgerTypes';

export const AS_OF = '2026-09-30';
export const PERIOD = '2026-09';
const Y = (yuan: number) => Math.round(yuan * 100);
/** 应收 / 应付明细（批次 2 的 ar / ap 行）：全额未清，没有订单号、账期与争议 */
const oi = (row: number, party: string, docNo: string, docDate: string, dueDate: string, amount: number): OpenItemRow => ({
  row, party, docNo, poNo: '', docDate, dueDate, termDays: null, amount, open: amount, currency: 'CNY', disputed: false,
});

// ── E1 / E2 账户余额 ──
// 本位币账户可用余额 = 1,200,000 + (300,000 − 50,000) + 80,000 + 500,000 = 2,030,000.00；网银合计 2,080,000.00
// A2 账面差 5,000 < 1 万 → 轻微差异；A3 可用 80,000 < 安全线 100,000；A5 账面差 150,000 > 10 万 → 差异较大并升级；美元户不并入合计
export const balances: BankBalanceRow[] = [
  { row: 2, account: '6222-0001', bank: '工商银行', entity: '甲公司', currency: 'CNY', bankBalance: Y(1_200_000), bookBalance: Y(1_200_000), systemBalance: Y(1_200_000), restricted: 0, safetyLine: Y(200_000), depositRate: null, date: AS_OF },
  { row: 3, account: '6225-0002', bank: '招商银行', entity: '甲公司', currency: 'CNY', bankBalance: Y(300_000), bookBalance: Y(295_000), systemBalance: Y(300_000), restricted: Y(50_000), safetyLine: Y(100_000), depositRate: 0.0035, date: AS_OF },
  { row: 4, account: '6227-0003', bank: '建设银行', entity: '乙公司', currency: 'CNY', bankBalance: Y(80_000), bookBalance: Y(80_000), systemBalance: null, restricted: 0, safetyLine: Y(100_000), depositRate: null, date: AS_OF },
  { row: 5, account: 'USD-0004', bank: '中国银行', entity: '甲公司', currency: 'USD', bankBalance: Y(10_000), bookBalance: Y(10_000), systemBalance: null, restricted: 0, safetyLine: null, depositRate: null, date: AS_OF },
  { row: 6, account: '6228-0005', bank: '农业银行', entity: '乙公司', currency: 'CNY', bankBalance: Y(500_000), bookBalance: Y(350_000), systemBalance: null, restricted: 0, safetyLine: null, depositRate: null, date: AS_OF },
];

// ── E1 13 周预测 ── 起点 2026-10-01，第 k 周 = 10-01 + 7(k−1) 起 7 天；期初 2,030,000
// 基准：W1 收 300,000（甲逾期应收，可能）付 800,000（工资 600,000 确定 + 乙供应商逾期应付 200,000 确定）→ 1,530,000
//       W2 收 500,000（甲，预计）付 1,800,000（供应商 A，预计）→ 230,000；W3 收 400,000（丙应收）付 300,000（税款确定）→ 330,000
//       W5 收 200,000（乙，可能）→ 530,000；W6–W13 不变。合计收 1,400,000、付 2,900,000，期末 530,000，最低 230,000，无缺口
// 悲观（非确定收 ×0.8、非确定付 ×1.1）：W1 收 240,000 → 1,470,000；W2 收 400,000 付 1,980,000 → −110,000（第 2 周缺口 110,000）
//       W3 收 320,000 付 300,000 → −90,000；W5 收 160,000 → 70,000。合计收 1,120,000、付 3,080,000，期末 70,000
// 乐观（收 ×1.2、付 ×0.9）：W1 1,590,000；W2 收 600,000 付 1,620,000 → 570,000；W3 收 480,000 → 750,000；W5 收 240,000 → 990,000
// 集中度（基准流入）：甲 800,000 / 1,400,000 = 57.1% > 50% → 越线；2027-02-01 设备款在 13 周外（beyond = 1）
export const cashPlan: CashPlanRow[] = [
  { row: 2, date: '2026-10-05', category: '工资', counterparty: '', inflow: 0, outflow: Y(600_000), certainty: 'committed' },
  { row: 3, date: '2026-10-12', category: '销售回款', counterparty: '客户甲', inflow: Y(500_000), outflow: 0, certainty: 'expected' },
  { row: 4, date: '2026-10-20', category: '税款', counterparty: '', inflow: 0, outflow: Y(300_000), certainty: 'committed' },
  { row: 5, date: '2026-11-02', category: '销售回款', counterparty: '客户乙', inflow: Y(200_000), outflow: 0, certainty: 'possible' },
  { row: 6, date: '2027-02-01', category: '设备款', counterparty: '设备商', inflow: 0, outflow: Y(100_000), certainty: 'expected' },
];
export const forecastAr: OpenItemRow[] = [
  oi(2, '客户甲', 'AR-001', '2026-08-20', '2026-09-20', Y(300_000)),
  oi(3, '客户丙', 'AR-002', '2026-09-16', '2026-10-16', Y(400_000)),
];
export const forecastAp: OpenItemRow[] = [
  oi(2, '供应商A', 'AP-001', '2026-09-10', '2026-10-10', Y(1_800_000)),
  oi(3, '供应商B', 'AP-002', '2026-08-25', '2026-09-25', Y(200_000)),
];

// ── E1 付款计划 ── 可用 2,030,000；排序 P0（R1 工资 10-05、R7 税款 10-15）→ P1（R3 租金）→ P2（R2）→ P3（R5）
// 累计：R1 600,000 → R7 1,100,000 → R3 1,300,000 → R2 1,000,000 放不下 → 延后；之后的非 P0（R5）一并延后（严格按优先级）
// 排入 1,300,000，延后 1,400,000，暂停核实 350,000（R4 个人账户 50,000、R6 收款账户变更 300,000），缺口 0
export const paymentRequests: PaymentRequestRow[] = [
  { row: 2, id: 'R1', payee: '员工工资', amount: Y(600_000), dueDate: '2026-10-05', category: '工资', priority: '', payFrom: '6222-0001', payeeAccount: '', accountChanged: false, personalAccount: false, newSupplier: false, contractAmount: null, paidToDate: null, invoiceAmount: null, approvalLimit: null },
  { row: 3, id: 'R2', payee: '供应商A', amount: Y(1_000_000), dueDate: '2026-10-10', category: '原材料', priority: '', payFrom: '6222-0001', payeeAccount: '', accountChanged: false, personalAccount: false, newSupplier: false, contractAmount: null, paidToDate: null, invoiceAmount: null, approvalLimit: null },
  { row: 4, id: 'R3', payee: '物业公司', amount: Y(200_000), dueDate: '2026-10-03', category: '租金', priority: '', payFrom: '6222-0001', payeeAccount: '', accountChanged: false, personalAccount: false, newSupplier: false, contractAmount: null, paidToDate: null, invoiceAmount: null, approvalLimit: null },
  { row: 5, id: 'R4', payee: '张某', amount: Y(50_000), dueDate: '2026-10-08', category: '服务费', priority: '', payFrom: '6222-0001', payeeAccount: '', accountChanged: false, personalAccount: true, newSupplier: false, contractAmount: null, paidToDate: null, invoiceAmount: null, approvalLimit: null },
  { row: 6, id: 'R5', payee: '供应商C', amount: Y(400_000), dueDate: '2026-10-15', category: '辅料', priority: 'P3', payFrom: '6222-0001', payeeAccount: '', accountChanged: false, personalAccount: false, newSupplier: false, contractAmount: null, paidToDate: null, invoiceAmount: null, approvalLimit: null },
  { row: 7, id: 'R6', payee: '供应商D', amount: Y(300_000), dueDate: '2026-10-08', category: '设备', priority: '', payFrom: '6222-0001', payeeAccount: '', accountChanged: true, personalAccount: false, newSupplier: false, contractAmount: null, paidToDate: null, invoiceAmount: null, approvalLimit: null },
  { row: 8, id: 'R7', payee: '税务局', amount: Y(500_000), dueDate: '2026-10-15', category: '增值税', priority: '', payFrom: '6222-0001', payeeAccount: '', accountChanged: false, personalAccount: false, newSupplier: false, contractAmount: null, paidToDate: null, invoiceAmount: null, approvalLimit: null },
];

// ── E2 授权复核 ── A1 建议放行（大额）；A2 新供应商 + 无发票预付 60% → 补充资料；A3 个人账户 → 建议拒绝；
// A4 收款账户变更 → 暂缓；A5 超审批权限 → 暂缓；A6 付款后招行可用 250,000 − 290,000 = −40,000 → 暂缓
const req = (o: Partial<PaymentRequestRow> & Pick<PaymentRequestRow, 'row' | 'id' | 'payee' | 'amount'>): PaymentRequestRow => ({
  dueDate: '2026-10-10', category: '货款', priority: '', payFrom: '6222-0001', payeeAccount: '', accountChanged: false, personalAccount: false, newSupplier: false,
  contractAmount: null, paidToDate: null, invoiceAmount: null, approvalLimit: null, ...o,
});
export const authRequests: PaymentRequestRow[] = [
  req({ row: 2, id: 'A1', payee: '供应商A', amount: Y(1_000_000), contractAmount: Y(3_000_000), paidToDate: Y(1_500_000), invoiceAmount: Y(1_000_000) }),
  req({ row: 3, id: 'A2', payee: '供应商E', amount: Y(600_000), newSupplier: true, contractAmount: Y(1_000_000) }),
  req({ row: 4, id: 'A3', payee: '李某', amount: Y(50_000), personalAccount: true, contractAmount: Y(50_000), invoiceAmount: Y(50_000) }),
  req({ row: 5, id: 'A4', payee: '供应商D', amount: Y(300_000), accountChanged: true, contractAmount: Y(900_000), invoiceAmount: Y(300_000) }),
  req({ row: 6, id: 'A5', payee: '供应商F', amount: Y(200_000), approvalLimit: Y(100_000), contractAmount: Y(500_000), invoiceAmount: Y(200_000) }),
  req({ row: 7, id: 'A6', payee: '供应商G', amount: Y(290_000), payFrom: '6225-0002', contractAmount: Y(500_000), invoiceAmount: Y(290_000) }),
];

// ── E2 现金池 ── 主账户 = 工行 1,200,000；招行上划 300,000 − 50,000 − 100,000 = 150,000；建行下拨 100,000 − 80,000 = 20,000；
// 农行上划 500,000；归集 1,200,000 + 650,000 − 20,000 = 1,830,000；美元户不入池
// 利息增益 = 150,000 × (1.5% − 0.35%) + 500,000 × (1.5% − 0.25%) = 1,725 + 6,250 = 7,975.00

// ── E2 银行关系 ── 业务量 = 已用授信 + 存款：工行 4,200,000、招行 2,100,000、建行 80,000（合计 6,380,000）
// 业务量分 = 10 × 占比 / 最大占比：10 / 5.0 / 0.190476；利率分 = 10 × 3.6% / 利率：10 / 9.0 / 建行没利率按 5
// 等权总分：工行 (10+10+9+8+9)/5 = 9.2 核心；招行 (5+9+7+9+7)/5 = 7.4 重点；建行 (0.190476+5+5+5+5)/5 = 4.038095 一般
// 工行授信 2026-12-15 到期（76 天 ≤ 90）→ 续期提醒；招行使用率 90% ≥ 85% → 越线
export const facilities: CreditFacilityRow[] = [
  { row: 2, bank: '工商银行', limit: Y(5_000_000), used: Y(3_000_000), rate: 0.036, expiry: '2026-12-15', response: 9, innovation: 8, cooperation: 9 },
  { row: 3, bank: '招商银行', limit: Y(2_000_000), used: Y(1_800_000), rate: 0.04, expiry: '2027-06-30', response: 7, innovation: 9, cooperation: 7 },
  { row: 4, bank: '建设银行', limit: Y(1_000_000), used: 0, rate: null, expiry: '2027-03-31', response: null, innovation: null, cooperation: null },
];

// ── E2 LCR / NSFR ── 一级 1,500,000；二级 A 400,000 × 85% = 340,000；二级 B 200,000 × 50% = 100,000；上限调整均为 0 → HQLA 1,940,000
// 流出 900,000 + 600,000 = 1,500,000；流入 800,000 × 50% + 300,000 = 700,000（< 75% × 流出 1,125,000，不封顶）→ 净流出 800,000
// LCR = 1,940,000 / 800,000 = 242.5%；NSFR = 5,000,000 / (4,000,000 + 800,000 × 50%) = 5,000,000 / 4,400,000 = 113.6%
export const liquidityItems: LiquidityItemRow[] = [
  { row: 2, item: '现金及央行存款', category: 'hqla_l1', amount: Y(1_000_000), factor: null },
  { row: 3, item: '国债', category: 'hqla_l1', amount: Y(500_000), factor: null },
  { row: 4, item: '政策性金融债', category: 'hqla_l2a', amount: Y(400_000), factor: null },
  { row: 5, item: '优质公司债', category: 'hqla_l2b', amount: Y(200_000), factor: null },
  { row: 6, item: '30 天内到期借款', category: 'outflow', amount: Y(900_000), factor: 1 },
  { row: 7, item: '应付账款', category: 'outflow', amount: Y(600_000), factor: null },
  { row: 8, item: '应收账款', category: 'inflow', amount: Y(800_000), factor: null },
  { row: 9, item: '定期存款到期', category: 'inflow', amount: Y(300_000), factor: 1 },
  { row: 10, item: '长期借款', category: 'asf', amount: Y(2_000_000), factor: 1 },
  { row: 11, item: '所有者权益', category: 'asf', amount: Y(3_000_000), factor: 1 },
  { row: 12, item: '固定资产', category: 'rsf', amount: Y(4_000_000), factor: 1 },
  { row: 13, item: '应收账款', category: 'rsf', amount: Y(800_000), factor: 0.5 },
];

// ── E3 外汇 ── USD 7.10、EUR 7.80
// USD 交易敞口 = 1,000,000 − 400,000 + 800,000 − 200,000 = 1,200,000（确定 600,000 / 很可能 800,000 / 可能 −200,000）
// 目标 = 600,000 × 75% + 800,000 × 50% − 200,000 × 25% = 450,000 + 400,000 − 50,000 = 800,000；已卖出 200,000 → 还需卖出 600,000
// 询价单按 450,000 : 400,000 分：确定 317,647.06（10 月）、很可能 282,352.94（12 月）；已对冲比例 200,000 / 1,200,000 = 16.67%
// 会计敞口 300,000 − 500,000 = −200,000；未对冲净头寸 1,200,000 − 200,000 − 200,000 = 800,000 → 汇率 +1% 影响 800,000 × 7.1 × 1% = 56,800.00
// EUR 交易敞口 −400,000（确定 −300,000 / 很可能 −100,000）→ 目标 −275,000 → 买入 225,000（11 月）+ 50,000（12 月）
// 集中度：USD |8,520,000 − 1,420,000| = 7,100,000，EUR 3,120,000 → USD 占 69.5%
export const fxRates: FxRateRow[] = [
  { row: 2, currency: 'USD', rate: 7.1, date: AS_OF },
  { row: 3, currency: 'EUR', rate: 7.8, date: AS_OF },
];
export const fxRows: FxExposureRow[] = [
  { row: 2, currency: 'USD', kind: 'receivable', amount: Y(1_000_000), certainty: 'firm', date: '2026-10-31', entity: '' },
  { row: 3, currency: 'USD', kind: 'payable', amount: Y(400_000), certainty: 'firm', date: '2026-10-20', entity: '' },
  { row: 4, currency: 'USD', kind: 'forecast_inflow', amount: Y(800_000), certainty: 'highly_probable', date: '2026-12-15', entity: '' },
  { row: 5, currency: 'USD', kind: 'forecast_outflow', amount: Y(200_000), certainty: 'possible', date: '2027-01-15', entity: '' },
  { row: 6, currency: 'USD', kind: 'asset', amount: Y(300_000), certainty: 'firm', date: '', entity: '' },
  { row: 7, currency: 'USD', kind: 'liability', amount: Y(500_000), certainty: 'firm', date: '', entity: '' },
  { row: 8, currency: 'USD', kind: 'revenue', amount: Y(5_000_000), certainty: 'firm', date: '', entity: '' },
  { row: 9, currency: 'USD', kind: 'cost', amount: Y(3_000_000), certainty: 'firm', date: '', entity: '' },
  { row: 10, currency: 'USD', kind: 'hedge_sell', amount: Y(200_000), certainty: 'firm', date: '2026-10-31', entity: '' },
  { row: 11, currency: 'EUR', kind: 'payable', amount: Y(300_000), certainty: 'firm', date: '2026-11-30', entity: '' },
  { row: 12, currency: 'EUR', kind: 'forecast_outflow', amount: Y(100_000), certainty: 'highly_probable', date: '2026-12-31', entity: '' },
];

// ── E4 融资 ── L1 3.6% + 0.5% / 2 年 = 3.85%；L2 4.2%；L3 5.0% + 1% / 5 年 = 5.2%
// 债务 6,000,000；税前 Kd = (3,000,000×3.85% + 2,000,000×4.2% + 1,000,000×5.2%) / 6,000,000 = 251,500 / 6,000,000 = 4.19167%
// 税后 Kd = 4.19167% × 75% = 3.14375%；Ke = 2.5% + 1.0 × 6% = 8.5%；权益按账面净资产 9,000,000
// WACC = (9,000,000 × 8.5% + 6,000,000 × 3.14375%) / 15,000,000 = 953,625 / 15,000,000 = 6.3575%
// 到期分布：1 年内 3,000,000（L1 剩 365 天）；3–5 年 3,000,000（L2 剩 3.003 年、L3 剩 5.0 年）
export const loans: LoanRow[] = [
  { row: 2, id: 'L1', lender: '工商银行', instrument: 'loan', principal: Y(3_000_000), rate: 0.036, feeRate: 0.005, startDate: '2025-09-30', maturityDate: '2027-09-30', repayment: 'bullet', secured: false, currency: 'CNY' },
  { row: 3, id: 'L2', lender: '招商银行', instrument: 'bond', principal: Y(2_000_000), rate: 0.042, feeRate: null, startDate: '2024-09-30', maturityDate: '2029-09-30', repayment: 'bullet', secured: false, currency: 'CNY' },
  { row: 4, id: 'L3', lender: '租赁公司', instrument: 'lease', principal: Y(1_000_000), rate: 0.05, feeRate: 0.01, startDate: '2026-09-30', maturityDate: '2031-09-29', repayment: 'amortizing', secured: true, currency: 'CNY' },
];
const fm = (o: Partial<FinMetricsRow> & Pick<FinMetricsRow, 'row' | 'period'>): FinMetricsRow => ({
  forecast: false, revenue: null, cogs: null, ebitda: null, interest: null, debt: null, cash: null, currentAssets: null, currentLiabilities: null,
  inventory: null, totalAssets: null, totalLiabilities: null, netWorth: null, debtService: null, equityValue: null, days: null, ...o,
});
export const metrics: FinMetricsRow[] = [
  fm({ row: 2, period: '2026-09', revenue: Y(3_000_000), cogs: Y(2_100_000), ebitda: Y(2_000_000), interest: Y(300_000), debt: Y(6_000_000), cash: Y(2_030_000), currentAssets: Y(6_000_000), currentLiabilities: Y(4_000_000), inventory: Y(1_500_000), totalAssets: Y(20_000_000), totalLiabilities: Y(11_000_000), netWorth: Y(9_000_000), debtService: Y(1_000_000) }),
  fm({ row: 3, period: '2026-12', forecast: true, ebitda: Y(1_600_000), interest: Y(320_000), debt: Y(6_000_000), currentAssets: Y(5_500_000), currentLiabilities: Y(4_200_000), totalAssets: Y(20_000_000), totalLiabilities: Y(11_500_000), netWorth: Y(8_500_000), debtService: Y(1_000_000) }),
  fm({ row: 4, period: '2027-03', forecast: true, ebitda: Y(1_400_000), interest: Y(330_000), debt: Y(6_000_000), currentAssets: Y(5_000_000), currentLiabilities: Y(4_300_000), totalAssets: Y(19_500_000), totalLiabilities: Y(11_600_000), netWorth: Y(7_900_000), debtService: Y(1_000_000) }),
];
// 契约：C1 杠杆 ≤ 4.0：3.00（缓冲 25%）→ 3.75（6.25% < 10% 关注）→ 4.29 越线（2027-03）
//       C2 利息保障 ≥ 5：6.67 → 5.00（缓冲 0 关注）→ 4.24 越线；C3 流动比率 ≥ 1.6：1.50 当前越线（进待办）
//       C4 净资产 ≥ 8,000,000：9,000,000（12.5%）→ 8,500,000（6.25% 关注）→ 7,900,000 越线
export const covenants: CovenantRow[] = [
  { row: 2, lender: '工商银行', name: '杠杆率', metric: 'debt_to_ebitda', op: 'le', limit: 4 },
  { row: 3, lender: '招商银行', name: '利息保障倍数', metric: 'interest_cover', op: '' as 'ge', limit: 5 },
  { row: 4, lender: '工商银行', name: '流动比率', metric: 'current_ratio', op: 'ge', limit: 1.6 },
  { row: 5, lender: '招商银行', name: '最低净资产', metric: 'net_worth', op: 'ge', limit: 8_000_000 },
];

// ── E5 ECL 一般法 ── 情景默认：乐观 25% × 0.75、基准 50% × 1、悲观 25% × 1.5；ECL = EAD × min(1, PD × 系数) × LGD × DF，四舍五入到分
// X1 BBB 一阶段：EAD 10,000,000；DF = 1.05^-0.5 = 0.975900；基准 = 1e9 分 × 0.6% × 60% × 0.975900 = 3,513,240 分；
//    乐观 2,634,930、悲观 5,269,860；加权 = 0.25×2,634,930 + 0.5×3,513,240 + 0.25×5,269,860 = 3,732,817.5 → 3,732,818 分
// X2 A→BB 降 2 级（且投资级降投机级）二阶段：EAD 50,000,000，存续期 PD 12%，3 年平均 DF = (1.05^-1 + 1.05^-2 + 1.05^-3)/3 = 0.907749；
//    基准 326,789,764、乐观 245,092,323、悲观 490,184,645；加权 347,214,124 分
// X3 逾期 45 天二阶段：EAD 2,000,000，BB 12 个月 PD 2%，2 年存续期 PD = 1 − 0.98² = 3.96%，DF 0.929705；加权 4,694,081.5 → 4,694,082 分
// X4 逾期 120 天三阶段：EAD 2,000,000 × LGD 48.7% = 974,000.00（97,400,000 分）
// X5 关注名单二阶段：EAD = 3,000,000 + 1,000,000 × CCF 50% = 3,500,000；A 档 PD 0.2%，1 年 DF 1/1.05；基准 400,000 分，加权 425,000 分
// X6 AA 一阶段：EAD 4,000,000，PD 0.07%，LGD 45%，DF 1.04^-0.5；加权 131,275.25 → 131,275 分
// 合计 EAD 71,500,000（7,150,000,000 分）；ECL 453,597,299 分；一阶段 3,864,093、二阶段 352,333,206、三阶段 97,400,000
// 迁移：新增→二阶段 1 笔（X5）；1→1 两笔；1→2 一笔（X2）；2→2 一笔（X3）；2→3 一笔（X4）
const ce = (o: Partial<CreditExposureRow> & Pick<CreditExposureRow, 'row' | 'id' | 'counterparty' | 'balance'>): CreditExposureRow => ({
  segment: '对公贷款', undrawn: 0, ccf: null, ratingOrig: '', ratingNow: '', dpd: 0, watchlist: false, impaired: false,
  pd12m: null, pdLifetime: null, lgd: null, eir: null, termYears: null, priorStage: null, ...o,
});
export const exposures: CreditExposureRow[] = [
  ce({ row: 2, id: 'X1', counterparty: '客户甲', balance: Y(10_000_000), ratingOrig: 'BBB', ratingNow: 'BBB', pd12m: 0.006, lgd: 0.6, eir: 0.05, termYears: 2, priorStage: 1 }),
  ce({ row: 3, id: 'X2', counterparty: '客户乙', balance: Y(50_000_000), ratingOrig: 'A', ratingNow: 'BB', pd12m: 0.02, pdLifetime: 0.12, lgd: 0.6, eir: 0.05, termYears: 3, priorStage: 1 }),
  ce({ row: 4, id: 'X3', counterparty: '客户丙', balance: Y(2_000_000), ratingOrig: 'BB', ratingNow: 'BB', dpd: 45, termYears: 2, priorStage: 2 }),
  ce({ row: 5, id: 'X4', counterparty: '客户丁', balance: Y(2_000_000), ratingOrig: 'B', ratingNow: 'CCC', dpd: 120, lgd: 0.487, priorStage: 2 }),
  ce({ row: 6, id: 'X5', counterparty: '客户戊', balance: Y(3_000_000), undrawn: Y(1_000_000), ratingOrig: 'A', ratingNow: 'A', watchlist: true, termYears: 1 }),
  ce({ row: 7, id: 'X6', counterparty: '客户己', balance: Y(4_000_000), ratingOrig: 'AA', ratingNow: 'AA', lgd: 0.45, eir: 0.04, priorStage: 1 }),
];

// ── E5 简化法 / E6 应收 ── 基准日 2026-09-30：A 未到期 500,000；B 逾期 20 天 300,000；C 逾期 46 天 200,000；D 逾期 92 天 100,000；E 逾期 395 天 50,000
// 前瞻系数 = 0.25×0.75 + 0.5×1 + 0.25×1.5 = 1.0625；ECL = 500,000×0.5%×1.0625 = 2,656.25 + 300,000×2%×1.0625 = 6,375
//   + 200,000×5%×1.0625 = 10,625 + 100,000×25%×1.0625 = 26,562.50 + 50,000 × min(1, 100%×1.0625) = 50,000 → 合计 96,218.75
export const agingAr: OpenItemRow[] = [
  oi(2, '客户A', 'S-001', '2026-09-15', '2026-10-15', Y(500_000)),
  oi(3, '客户B', 'S-002', '2026-08-11', '2026-09-10', Y(300_000)),
  oi(4, '客户C', 'S-003', '2026-07-16', '2026-08-15', Y(200_000)),
  oi(5, '客户D', 'S-004', '2026-05-31', '2026-06-30', Y(100_000)),
  oi(6, '客户E', 'S-005', '2025-08-01', '2025-08-31', Y(50_000)),
];

// ── E6 营运资本 ── 9 月 30 天，收入 3,000,000、成本 2,100,000；应收 1,150,000、存货 2,000,000、应付 1,400,000
// DSO = 1,150,000 / 3,000,000 × 30 = 11.5；DIO = 2,000,000 / 2,100,000 × 30 = 28.571；DPO = 1,400,000 / 2,100,000 × 30 = 20.0；CCC = 20.071 天
// 每天释放：应收 100,000、存货 / 应付 70,000；逾期应收 650,000
// ABC（年耗用合计 10,000,000）：S1 6,000,000（之前 0）A、S2 2,000,000（之前 60%）A、S3（之前 80%）B、S4（之前 90%）B、S5（96%）C、S6（99%）C
// 呆滞：S3 241 天 > 180 → 300,000；过时：S5 457 天 > 365 → 150,000；可释放 450,000
// 供应商：A 600,000（42.9% ≥ 30% 关注，账期 45 天，30 天内到期 600,000）；B 400,000（账期 30，30 天内到期 300,000）；C 400,000（账期 60）
// 供应链金融：反向保理 2,100,000 / 30 × 30 = 2,100,000（成本 84,000）；应收保理 1,150,000 × 80% = 920,000（36,800）；
//   动态折扣 30 天内到期 900,000 → 提前付 −900,000、节约 9,000；存货融资 2,000,000 × 50% = 1,000,000（40,000）
export const wcAp: OpenItemRow[] = [
  oi(2, '供应商A', 'P-001', '2026-08-31', '2026-10-15', Y(600_000)),
  oi(3, '供应商B', 'P-002', '2026-09-10', '2026-10-10', Y(300_000)),
  oi(4, '供应商B', 'P-003', '2026-07-01', '2026-07-31', Y(100_000)),
  oi(5, '供应商C', 'P-004', '2026-09-20', '2026-11-19', Y(400_000)),
];
export const inventory: InventoryRow[] = [
  { row: 2, sku: 'S1', name: '主料', qty: 1000, amount: Y(800_000), usage: Y(6_000_000), lastMoveDate: '2026-09-25' },
  { row: 3, sku: 'S2', name: '辅料', qty: 500, amount: Y(500_000), usage: Y(2_000_000), lastMoveDate: '2026-08-01' },
  { row: 4, sku: 'S3', name: '包材', qty: 300, amount: Y(300_000), usage: Y(1_000_000), lastMoveDate: '2026-02-01' },
  { row: 5, sku: 'S4', name: '配件', qty: 200, amount: Y(200_000), usage: Y(600_000), lastMoveDate: '2026-05-01' },
  { row: 6, sku: 'S5', name: '旧型号', qty: 150, amount: Y(150_000), usage: Y(300_000), lastMoveDate: '2025-06-30' },
  { row: 7, sku: 'S6', name: '样品', qty: 50, amount: Y(50_000), usage: Y(100_000), lastMoveDate: '' },
];

// ── E7 投资 ── 市值合计 4,661,000、成本 5,000,000、浮亏 339,000
// I3 浮亏 6% 关注；I4 风险 R5 > R3、不在批准清单、浮亏 55% 重大 → 越线；发行人：招商银行 1,880,000 / 4,661,000 = 40.3% 越线
// 加权收益率 = (1,010,000×2.5% + 501,000×1.8% + 1,880,000×3.2% + 1,090,000×4.5%) / 4,481,000 = 143,478 / 4,481,000 = 3.2019%
// 流动性：现金（本位币可用）2,030,000；30 天内可变现 I1 + I2 = 1,511,000；未用授信 3,200,000；可用合计 6,741,000
//   一年内到期债务 3,000,000（L1）→ 覆盖 3,541,000 / 3,000,000 = 1.180 < 1.2 关注；流动比率 1.5、速动 1.125、授信使用率 60%
export const investments: InvestmentRow[] = [
  { row: 2, id: 'I1', product: '结构性存款', type: 'deposit', issuer: '工商银行', cost: Y(1_000_000), marketValue: Y(1_010_000), riskRating: 1, maturityDate: '2026-10-20', approved: true, yield: 0.025, liquidityDays: null },
  { row: 3, id: 'I2', product: '货币基金', type: 'money_fund', issuer: '某基金', cost: Y(500_000), marketValue: Y(501_000), riskRating: 1, maturityDate: '', approved: true, yield: 0.018, liquidityDays: 1 },
  { row: 4, id: 'I3', product: '银行理财', type: 'wmp', issuer: '招商银行', cost: Y(2_000_000), marketValue: Y(1_880_000), riskRating: 2, maturityDate: '2027-03-31', approved: true, yield: 0.032, liquidityDays: null },
  { row: 5, id: 'I4', product: '股票投资', type: 'equity', issuer: '某上市公司', cost: Y(400_000), marketValue: Y(180_000), riskRating: 5, maturityDate: '', approved: false, yield: null, liquidityDays: null },
  { row: 6, id: 'I5', product: '公司债', type: 'bond', issuer: '某集团', cost: Y(1_100_000), marketValue: Y(1_090_000), riskRating: 3, maturityDate: '2028-09-30', approved: true, yield: 0.045, liquidityDays: null },
];
