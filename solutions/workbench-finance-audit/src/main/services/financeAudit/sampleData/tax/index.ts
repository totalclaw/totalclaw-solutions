/**
 * 税务组（批次 4）金标准夹具。金额一律分（最小货币单位）；期望值手算写在注释里。
 */
import type { TbRow } from '../../types';
import type { ComparableRow, DisclosureEventRow, RptRow, VatLineRow, WhtRow } from '../../intake/tax';

const L = (row: number, o: Partial<VatLineRow>): VatLineRow => ({
  row, direction: 'sales', date: '2026-09-15', docNo: `INV-${row}`, counterparty: '', counterpartyVatNo: '', net: 0, vat: 0, rate: null,
  category: '', emirate: '', status: 'normal', invoiceType: '', recoverable: null, ...o,
});

/**
 * 沙特增值税（2026-09，标准税率 15%）：
 *   销项：标准 100,000 + 20,000（税额 15,000 + 3,000）→ 第 1 栏 120,000 / 18,000；零税率 30,000；出口 50,000；免税 10,000；
 *         作废 9,999（不计）、10 月日期 1,000（期外不计）；
 *   进项：标准 40,000 / 6,000 + 2,000 / 300（不可抵扣）→ 第 7 栏基数 42,000、税额 6,000；海关已缴 25,000 / 3,750 → 第 8 栏 3,750；
 *         反向征收 8,000（无税额，自行计算 15% = 1,200）→ 销项 +1,200、第 9 栏 1,200；零税率采购 1,000；免税采购 500。
 *   销项合计 18,000 + 1,200 = 19,200；进项合计 6,000 + 3,750 + 1,200 = 10,950；应纳 8,250；减上期留抵 1,000 → 应缴 7,250。
 */
export const saVatLines: VatLineRow[] = [
  L(2, { net: 10_000_000, vat: 1_500_000, category: 'standard', counterparty: 'شركة الأفق', counterpartyVatNo: '300000000000003' }),
  L(3, { net: 2_000_000, vat: 300_000, category: 'standard' }),
  L(4, { net: 3_000_000, category: 'zero' }),
  L(5, { net: 5_000_000, category: 'export' }),
  L(6, { net: 1_000_000, category: 'exempt' }),
  L(7, { net: 999_900, vat: 149_985, category: 'standard', status: 'void' }),
  L(8, { net: 100_000, vat: 15_000, category: 'standard', date: '2026-10-02' }),
  L(9, { direction: 'purchase', net: 4_000_000, vat: 600_000, category: 'standard' }),
  L(10, { direction: 'purchase', net: 200_000, vat: 30_000, category: 'standard', recoverable: false }),
  L(11, { direction: 'purchase', net: 2_500_000, vat: 375_000, category: 'import_customs' }),
  L(12, { direction: 'purchase', net: 800_000, category: 'reverse_charge' }),
  L(13, { direction: 'purchase', net: 100_000, category: 'zero' }),
  L(14, { direction: 'purchase', net: 50_000, category: 'exempt' }),
];
export const SA_VAT = { output: 1_920_000, input: 1_095_000, net: 825_000, carried: 100_000, due: 725_000 };

/**
 * 阿联酋增值税（2026-Q3，5%）：
 *   标准供应 200,000 / 10,000（迪拜）；零税率 30,000；免税 5,000；
 *   标准费用 60,000 / 3,000；境外服务反向征收 10,000 → 500（第 3 栏 + 第 10 栏）；进口货物 40,000 → 2,000（第 6 栏 + 第 10 栏）。
 *   销项 10,000 + 500 + 2,000 = 12,500；进项 3,000 + 500 + 2,000 = 5,500；应缴 7,000。
 */
export const aeVatLines: VatLineRow[] = [
  L(2, { net: 20_000_000, vat: 1_000_000, category: 'standard', emirate: 'Dubai', date: '2026-08-10' }),
  L(3, { net: 3_000_000, category: 'zero', date: '2026-07-10' }),
  L(4, { net: 500_000, category: 'exempt', date: '2026-09-10' }),
  L(5, { direction: 'purchase', net: 6_000_000, vat: 300_000, category: 'standard', date: '2026-08-20' }),
  L(6, { direction: 'purchase', net: 1_000_000, category: 'reverse_charge', date: '2026-09-01' }),
  L(7, { direction: 'purchase', net: 4_000_000, category: 'import_customs', date: '2026-09-05' }),
];
export const AE_VAT = { output: 1_250_000, input: 550_000, due: 700_000 };

/**
 * 中国一般纳税人 2026-09：销项专票 13% 100,000 / 13,000、普票 6% 50,000 / 3,000；
 * 进项专票 60,000 / 7,800；失控进项 10,000 / 1,300（标异常，不计入、列风险）。
 */
export const cnVatLines: VatLineRow[] = [
  L(2, { net: 10_000_000, vat: 1_300_000, rate: 0.13, invoiceType: 'vat_special', counterpartyVatNo: '91310000MA1FL0000X' }),
  L(3, { net: 5_000_000, vat: 300_000, rate: 0.06, invoiceType: 'vat_normal' }),
  L(4, { direction: 'purchase', net: 6_000_000, vat: 780_000, rate: 0.13, invoiceType: 'vat_special', counterparty: '甲供应商' }),
  L(5, { direction: 'purchase', net: 1_000_000, vat: 130_000, rate: 0.13, invoiceType: 'vat_special', counterparty: '乙供应商', status: 'abnormal' }),
];

const T = (row: number, accountCode: string, accountName: string, o: Partial<TbRow>): TbRow => ({
  row, accountCode, accountName, level: 1, openingDr: 0, openingCr: 0, periodDr: 0, periodCr: 0, closingDr: 0, closingCr: 0, ...o,
});

/**
 * 沙特天课（会计年度 2025，公历 365 天），损益未结转：
 *   加项：股本 1,000,000 + 法定公积 100,000 + 留存收益 50,000 + 期末服务金准备 50,000 + 长期借款 200,000 + 本年利润 300,000 = 1,700,000；
 *   减项：固定资产 800,000 − 累计折旧 200,000 + 对子公司投资 100,000 = 700,000；
 *   计算基数 1,000,000，调整后净利润 300,000（收入 900,000 − 工资 600,000，天课费用不计）→ 基数 1,000,000；
 *   回历年：1,000,000 × 2.5% = 25,000；公历年：1,000,000 × 2.5% × 365 / 354 = 25,776.84；
 *   沙特股东 60%：回历 15,000、公历 15,466.10（25,776.836… × 0.6 = 15,466.10）；外资部分所得税 300,000 × 40% × 20% = 24,000。
 */
export const zakatTb: TbRow[] = [
  T(2, '3101', 'Share capital', { closingCr: 100_000_000 }),
  T(3, '3201', 'Statutory reserve', { closingCr: 10_000_000 }),
  T(4, '3301', 'Retained earnings', { closingCr: 5_000_000 }),
  T(5, '2401', 'Provision for end of service benefits', { closingCr: 5_000_000 }),
  T(6, '2501', 'Long-term loan', { closingCr: 20_000_000 }),
  T(7, '2101', 'Accounts payable', { closingCr: 8_000_000 }),
  T(8, '1601', 'Property, plant and equipment', { closingDr: 80_000_000 }),
  T(9, '1602', 'Accumulated depreciation', { closingCr: 20_000_000 }),
  T(10, '1701', 'Investment in subsidiary', { closingDr: 10_000_000 }),
  T(11, '1101', 'Cash at bank', { closingDr: 38_000_000 }),
  T(12, '4101', 'Revenue', { periodCr: 90_000_000, closingCr: 90_000_000 }),
  T(13, '5101', 'Salaries expense', { periodDr: 60_000_000, closingDr: 60_000_000 }),
  T(14, '5901', 'Zakat expense', { periodDr: 1_000_000, closingDr: 1_000_000 }),
];
export const ZAKAT = { additions: 170_000_000, deductions: 70_000_000, base: 100_000_000, profit: 30_000_000, hijri: 2_500_000, greg: 2_577_684, hijri60: 1_500_000, greg60: 1_546_610, cit40: 2_400_000 };

/**
 * 阿联酋企业所得税（2025 税期）：收入 1,600,000 − 费用 600,000 = 会计利润 1,000,000；
 *   (1,000,000 − 375,000) × 9% = 56,250。
 */
export const aeCitTb: TbRow[] = [
  T(2, '4101', 'Revenue', { periodCr: 160_000_000, closingCr: 160_000_000 }),
  T(3, '5101', 'Salaries expense', { periodDr: 60_000_000, closingDr: 60_000_000 }),
];
export const AE_CIT = { profit: 100_000_000, tax: 5_625_000 };

/** 沙特预提税（2026-09）：管理费 100,000 × 20% = 20,000；特许权使用费 50,000 × 15% = 7,500；利息 200,000 × 5% = 10,000；沙特居民收款方不适用 */
export const whtRows: WhtRow[] = [
  { row: 2, date: '2026-09-03', payee: 'Head Office Ltd', country: 'GB', paymentType: 'management_fee', amount: 10_000_000, docNo: 'P-1', withheld: 2_000_000 },
  { row: 3, date: '2026-09-10', payee: 'Brand Co', country: 'US', paymentType: 'royalty', amount: 5_000_000, docNo: 'P-2', withheld: null },
  { row: 4, date: '2026-09-20', payee: 'Lender AG', country: 'DE', paymentType: 'interest', amount: 20_000_000, docNo: 'P-3', withheld: 500_000 },
  { row: 5, date: '2026-09-25', payee: 'مؤسسة محلية', country: 'Saudi Arabia', paymentType: 'rent', amount: 3_000_000, docNo: 'P-4', withheld: null },
];
export const WHT = { total: 3_750_000, due: '2026-10-10' };

/**
 * 转让定价可比公司（完全成本加成率）：5%、8%、3%、10%、6%、12%、4%，另一家缺数据不参与。
 *   排序 3、4、5、6、8、10、12（n = 7）：Q1 位置 1.5 → 4% + 0.5 × 1% = 4.5%；中位值位置 3 → 6%；Q3 位置 4.5 → 8% + 0.5 × 2% = 9%。
 *   受测方：收入 1,000,000、总成本 970,000、营业利润 30,000 → 3.0928% < 4.5% → 低于下四分位；
 *   调到中位值 6%：970,000 × 6% − 30,000 = 28,200。
 */
const C = (row: number, name: string, op: number | null, cost: number | null): ComparableRow => ({ row, name, year: '2025', revenue: null, operatingProfit: op, totalCost: cost, pli: null });
export const comparables: ComparableRow[] = [
  C(2, 'Comp A', 500_000, 10_000_000), C(3, 'Comp B', 800_000, 10_000_000), C(4, 'Comp C', 300_000, 10_000_000), C(5, 'Comp D', 1_000_000, 10_000_000),
  C(6, 'Comp E', 600_000, 10_000_000), C(7, 'Comp F', 1_200_000, 10_000_000), C(8, 'Comp G', 400_000, 10_000_000), C(9, 'Comp H (no data)', null, null),
];
export const TP = { q1: 0.045, median: 0.06, q3: 0.09, tested: { revenue: 100_000_000, totalCost: 97_000_000, operatingProfit: 3_000_000 }, adjustment: 2_820_000 };

/** 关联交易：有形资产 2.5 亿（> 2 亿 → 本地文档）、劳务 3000 万；合计 2.8 亿 < 10 亿（主体文档不需要）；集团收入 60 亿 > 55 亿（国别报告） */
export const rptRows: RptRow[] = [
  { row: 2, counterparty: 'Parent HK', jurisdiction: 'HK', type: 'tangible', amount: 25_000_000_000, direction: 'out', method: 'TNMM' },
  { row: 3, counterparty: 'Sister SG', jurisdiction: 'SG', type: 'service', amount: 3_000_000_000, direction: 'in', method: 'CPM' },
];

/**
 * 上交所口径（分母：总资产 3 亿、净资产 1 亿、营业收入 5 亿、净利润 2000 万）：
 *   E1 交易 1200 万（净资产 12% 且 > 1000 万）→ 披露；E2 交易 900 万但涉及资产 4000 万（总资产 13.3%）→ 披露；
 *   E3 关联法人 350 万（3.5% ≥ 0.5% 且 ≥ 300 万）→ 披露；E4 关联自然人 20 万（< 30 万）→ 不需要；E5 担保 100 万 → 披露；
 *   E6 交易 6000 万（60% 且 > 5000 万）→ 股东大会；E7 关联法人 3500 万（35% ≥ 5% 且 ≥ 3000 万）→ 股东大会。
 */
const E = (row: number, o: Partial<DisclosureEventRow>): DisclosureEventRow => ({ row, date: '2026-09-10', type: 'transaction', description: `事项 ${row}`, counterparty: `对方 ${row}`, amount: 0, rpKind: '', assetTotal: null, profit: null, ...o });
export const events: DisclosureEventRow[] = [
  E(2, { amount: 1_200_000_000 }),
  E(3, { amount: 900_000_000, assetTotal: 4_000_000_000 }),
  E(4, { type: 'related_party', rpKind: 'legal', amount: 350_000_000 }),
  E(5, { type: 'related_party', rpKind: 'natural', amount: 20_000_000 }),
  E(6, { type: 'guarantee', amount: 100_000_000 }),
  E(7, { amount: 6_000_000_000 }),
  E(8, { type: 'related_party', rpKind: 'legal', amount: 3_500_000_000 }),
];
export const DISCLOSURE_BASE = { totalAssets: 30_000_000_000, netAssets: 10_000_000_000, revenue: 50_000_000_000, netProfit: 2_000_000_000 };
export const DISCLOSURE = { shareholder: 2, disclose: 4, none: 1 };
