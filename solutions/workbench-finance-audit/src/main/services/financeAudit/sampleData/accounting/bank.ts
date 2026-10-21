/**
 * A2 银企对账夹具：2026-09，两个账户。金额单位：分（注释里是元）。
 *
 * 账户 A：工行基本户 6222000011111234 ↔ 账面 100201「银行存款-工行基本户1234」，期初两边都是 300,000
 *   账面 row2  09-03 付 60,000「支付8月房租」          ↔ 银行 row2 09-04 付 60,000 B0904001        第 2 轮（金额 + 日期 ±3 天）已达
 *   账面 row3  09-15 收 90,000「收回货款 B0915088」    ↔ 银行 row3 09-15 收 90,000 B0915088        第 1 轮（流水号）已达
 *   账面 row4  09-29 付 8,000「支付货款」供应商戊       银行没有                                    企业已付银行未付（1 个工作日，不升级）
 *   银行 row4  09-25 付 35「手续费」                     账面没有                                    银行已付企业未付，成因 fee（埋点：手续费企业未记账）
 *   银行 row5  09-27 付 1,500「扣款」对方空             账面没有                                    银行已付企业未付，成因 unknown_deduction，> 1,000 升级（埋点）
 *   账面期末 300,000 + 90,000 − 60,000 − 8,000 = 322,000；银行期末 300,000 − 60,000 + 90,000 − 35 − 1,500 = 328,465
 *   调节：322,000 − (35 + 1,500) = 320,465 = 328,465 − 8,000 ✓
 *
 * 账户 B：建行一般户 6217000022225678 ↔ 账面 100202「银行存款-建行一般户5678」，期初两边都是 100,000
 *   账面 row5  09-02 收 5,000「收到货款」客户乙          ↔ 银行 row6 09-08 收 5,000                  第 3 轮（金额唯一，日期差 6 天）已达
 *   账面 row6  09-15 付 12,000「支付货款 TX0915001」    ↔ 银行 row7 09-16 付 12,100 TX0915001       第 1 轮单号对上、金额差 100 → 金额差异（埋点）
 *   账面 row7  09-19 付 12,000 + row8 09-19 付 18,000   ↔ 银行 row8 09-20 付 30,000「批量代付」     第 4 轮一对二已达（埋点）
 *   账面 row9  09-26 付 60,000「发放8月工资」            ↔ 银行 row9 09-26 付 60,000 PAY0926         第 2 轮已达
 *   账面期末 100,000 + 5,000 − 12,000 − 12,000 − 18,000 − 60,000 = 3,000；银行期末 100,000 + 5,000 − 12,100 − 30,000 − 60,000 = 2,900
 *   调节：3,000 + (−12,100 − (−12,000)) = 2,900 = 2,900 ✓
 *
 * 分类计数（全部账户）：已达 5（A 2 + B 3）、企业已付银行未付 1、银行已付企业未付 2、金额差异 1，其余 0。
 */
import type { BankRow, JournalRow, TbRow } from '../../types';

const Y = (yuan: number) => Math.round(yuan * 100);
export const PERIOD_END = '2026-09-30';
export const ACCOUNT_A = '6222000011111234';
export const ACCOUNT_B = '6217000022225678';

function b(row: number, date: string, voucherNo: string, accountCode: string, accountName: string, summary: string, debit: number, credit: number, counterparty = ''): JournalRow {
  return {
    row, date, voucherNo, lineNo: 1, accountCode, accountName, summary, debit: Y(debit), credit: Y(credit),
    currency: 'CNY', fxAmount: null, counterparty, dept: '', project: '', businessDate: '', source: '',
  };
}
const A = ['100201', '银行存款-工行基本户1234'] as const;
const B = ['100202', '银行存款-建行一般户5678'] as const;

export const bookRows: JournalRow[] = [
  b(2, '2026-09-03', '记-0001', ...A, '支付8月房租', 0, 60000, '华南物业'),
  b(3, '2026-09-15', '记-0003', ...A, '收回货款 B0915088', 90000, 0, '客户甲'),
  b(4, '2026-09-29', '记-0012', ...A, '支付货款', 0, 8000, '供应商戊'),
  b(5, '2026-09-02', '记-0013', ...B, '收到货款', 5000, 0, '客户乙'),
  b(6, '2026-09-15', '记-0014', ...B, '支付货款 TX0915001', 0, 12000, '供应商丁'),
  b(7, '2026-09-19', '记-0015', ...B, '支付货款', 0, 12000, '供应商己'),
  b(8, '2026-09-19', '记-0016', ...B, '支付货款', 0, 18000, '供应商庚'),
  b(9, '2026-09-26', '记-0005', ...B, '发放8月工资', 0, 60000),
];

function k(row: number, bankAccount: string, date: string, ref: string, counterparty: string, amountIn: number, amountOut: number, balance: number, summary: string): BankRow {
  return { row, bankAccount, date, valueDate: date, ref, counterparty, amountIn: Y(amountIn), amountOut: Y(amountOut), balance: Y(balance), summary };
}

export const bankRows: BankRow[] = [
  k(2, ACCOUNT_A, '2026-09-04', 'B0904001', '华南物业', 0, 60000, 240000, '转账支付'),
  k(3, ACCOUNT_A, '2026-09-15', 'B0915088', '客户甲', 90000, 0, 330000, '货款'),
  k(4, ACCOUNT_A, '2026-09-25', '', '', 0, 35, 329965, '手续费'),
  k(5, ACCOUNT_A, '2026-09-27', '', '', 0, 1500, 328465, '扣款'),
  k(6, ACCOUNT_B, '2026-09-08', '', '客户乙', 5000, 0, 105000, '货款'),
  k(7, ACCOUNT_B, '2026-09-16', 'TX0915001', '供应商丁', 0, 12100, 92900, '货款'),
  k(8, ACCOUNT_B, '2026-09-20', 'BP0920', '', 0, 30000, 62900, '批量代付'),
  k(9, ACCOUNT_B, '2026-09-26', 'PAY0926', '', 0, 60000, 2900, '代发工资'),
];

/** 余额表（只放两个明细户；用于期初核对与账面余额） */
export const tb: TbRow[] = [
  { row: 2, accountCode: '100201', accountName: '银行存款-工行基本户1234', level: 2, openingDr: Y(300000), openingCr: 0, periodDr: Y(90000), periodCr: Y(68000), closingDr: Y(322000), closingCr: 0 },
  { row: 3, accountCode: '100202', accountName: '银行存款-建行一般户5678', level: 2, openingDr: Y(100000), openingCr: 0, periodDr: Y(5000), periodCr: Y(102000), closingDr: Y(3000), closingCr: 0 },
];

export const expected: Record<string, { counts: Record<string, number>; adjusted: number; bookBalance: number; bankBalance: number; escalations: number }> = {
  [ACCOUNT_A]: {
    counts: { matched: 2, book_out_bank_not: 1, book_in_bank_not: 0, bank_out_book_not: 2, bank_in_book_not: 0, amount_diff: 0, unmatched: 0 },
    adjusted: Y(320465), bookBalance: Y(322000), bankBalance: Y(328465), escalations: 1,
  },
  [ACCOUNT_B]: {
    counts: { matched: 3, book_out_bank_not: 0, book_in_bank_not: 0, bank_out_book_not: 0, bank_in_book_not: 0, amount_diff: 1, unmatched: 0 },
    adjusted: Y(2900), bookBalance: Y(3000), bankBalance: Y(2900), escalations: 0,
  },
};
