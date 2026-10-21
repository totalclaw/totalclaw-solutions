/**
 * A2 总账 ↔ 子账夹具（应收子账，2026-09）。金额单位：分（注释里是元）。对账键 = 发票号。
 *
 *   INV-001  总账 10,000 / 10 件 / 09-05        子账同             → 相符
 *   INV-008  总账两行 2,000 + 2,000 / 09-08     子账一行 4,000     → 相符（同键多行先合计）
 *   INV-002  总账 5,000 / 5 件                  子账 5,200 / 5 件  → 金额差异 −200，成因 data_quality（> 100 元，不像费用）
 *   INV-007  总账 USD 1,000.00 = 7,100.00       子账 USD 1,000.00 = 7,150.00 → 金额差异 −50，成因 fx（外币相等本币不等）（埋点）
 *   INV-009  总账 6 件 6,000                    子账两行各 6 件 6,000（重复入账）= 12 件 12,000 → 数量差异 −6,000，成因 duplicate_or_missing，重大
 *   INV-003  总账 8 件 8,000                    子账 10 件 10,000  → 数量差异 −2,000，成因 data_quality
 *   INV-004  总账 3,500 / 09-29                 子账 3,500 / 10-01 → 时间差异，成因 timing
 *   INV-005  总账 3,000                         子账没有           → 仅总账，成因 duplicate_or_missing
 *   INV-006  总账没有                           子账 7,000         → 仅子账，差额 −7,000，重大
 * 计数：相符 2、金额 2、数量 2、时间 1、仅总账 1、仅子账 1；相符率 2 / 9。
 * 合计：总账 10,000+4,000+5,000+7,100+6,000+8,000+3,500+3,000 = 46,600；子账 10,000+4,000+5,200+7,150+12,000+10,000+3,500+7,000 = 58,850；差 −12,250。
 * 重大（≥ 5,000）：INV-006（−7,000）、INV-009（−6,000）。
 */
import type { LedgerExtractRow } from '../../types';

const Y = (yuan: number) => Math.round(yuan * 100);
function r(row: number, key: string, amount: number, quantity: number | null, date: string, extra: Partial<LedgerExtractRow> = {}): LedgerExtractRow {
  return { row, key, date, amount: Y(amount), quantity, fxAmount: null, currency: 'CNY', docNo: key, desc: '', ...extra };
}

export const gl: LedgerExtractRow[] = [
  r(2, 'INV-001', 10000, 10, '2026-09-05'),
  r(3, 'INV-008', 2000, 2, '2026-09-08'),
  r(4, 'INV-008', 2000, 2, '2026-09-08'),
  r(5, 'INV-002', 5000, 5, '2026-09-06'),
  r(6, 'INV-007', 7100, 1, '2026-09-10', { fxAmount: Y(1000), currency: 'USD' }),
  r(7, 'INV-009', 6000, 6, '2026-09-12'),
  r(8, 'INV-003', 8000, 8, '2026-09-14'),
  r(9, 'INV-004', 3500, 3, '2026-09-29'),
  r(10, 'INV-005', 3000, 3, '2026-09-20'),
];

export const sub: LedgerExtractRow[] = [
  r(2, 'INV-001', 10000, 10, '2026-09-05'),
  r(3, 'INV-008', 4000, 4, '2026-09-08'),
  r(4, 'INV-002', 5200, 5, '2026-09-06'),
  r(5, 'INV-007', 7150, 1, '2026-09-10', { fxAmount: Y(1000), currency: 'USD' }),
  r(6, 'INV-009', 6000, 6, '2026-09-12'),
  r(7, 'INV-009', 6000, 6, '2026-09-12'),
  r(8, 'INV-003', 10000, 10, '2026-09-14'),
  r(9, 'INV-004', 3500, 3, '2026-10-01'),
  r(10, 'INV-006', 7000, 7, '2026-09-22'),
];

export const expected = {
  counts: { matched: 2, amount: 2, quantity: 2, timing: 1, gl_only: 1, sub_only: 1 },
  matchRate: 2 / 9,
  totals: { gl: Y(46600), sub: Y(58850), diff: Y(-12250) },
  causes: { 'INV-002': ['data_quality'], 'INV-003': ['data_quality'], 'INV-007': ['fx'], 'INV-009': ['duplicate_or_missing'], 'INV-004': ['timing'], 'INV-005': ['duplicate_or_missing'], 'INV-006': ['duplicate_or_missing'] },
  major: ['INV-006', 'INV-009'],
};
