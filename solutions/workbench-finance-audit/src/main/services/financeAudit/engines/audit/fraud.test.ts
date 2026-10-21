/** B5 舞弊排查：本福特用合成数据检出；7 条新规则与 risk.ts 复用规则各有命中；规则覆盖如实标「不适用」。 */
import { describe, expect, it } from 'vitest';
import type { JournalRow } from '../../types';
import { thresholdsFor } from '../../thresholds';
import { BENFORD_EXPECTED, benford } from './fraud/benford';
import { dice, duplicatePayments, parseParties, parsePayments, periodEndManual, relatedNames, roundAmounts, vendorEmployeeBank, weekendEntries } from './fraud/rules';
import { fraudScan } from './fraudRunner';
import { tableOf } from './testTable';
import * as FX from '../../__fixtures__/audit/data';

const th = thresholdsFor('fraud');
let row = 1;
const j = (date: string, voucherNo: string, accountName: string, debit: number, credit: number, source = ''): JournalRow => ({
  row: ++row, date, voucherNo, lineNo: 1, accountCode: '', accountName, summary: 's', debit, credit, currency: 'CNY', fxAmount: null, counterparty: '', dept: '', project: '', businessDate: '', source,
});
/** 对数均匀分布的金额 → 首位数服从本福特 */
const benfordAmounts = (n: number) => Array.from({ length: n }, (_, k) => Math.round(10 ** (5 + (4 * (k + 0.5)) / n)));
/** 首位数 1–9 均匀 → 明显不符合本福特 */
const uniformAmounts = (n: number) => Array.from({ length: n }, (_, k) => ((k % 9) + 1) * 1_000_00 + (k % 97) * 100);

describe('本福特首位数检验', () => {
  it('期望占比：log10(1 + 1/d)，合计为 1', () => {
    expect(BENFORD_EXPECTED[0]).toBeCloseTo(0.30103, 5);
    expect(BENFORD_EXPECTED.reduce((a, b) => a + b, 0)).toBeCloseTo(1, 10);
  });
  it('服从本福特的合成数据 → 高度符合；首位数均匀的合成数据 → 不符合，并指出偏高的数字', () => {
    const good = benford(benfordAmounts(2000), th);
    expect(good.conformity).toBe('close');
    const bad = benford(uniformAmounts(900), th);
    expect(bad.conformity).toBe('nonconformity');
    expect(bad.mad).toBeGreaterThan(0.015);
    expect(bad.chi2).toBeGreaterThan(15.507);
    expect(bad.spikes).toEqual(expect.arrayContaining([7, 8, 9]));
  });
  it('样本不足不下结论', () => {
    expect(benford(uniformAmounts(50), th).conformity).toBe('insufficient');
  });
});

describe('舞弊规则', () => {
  const payments = parsePayments(tableOf(FX.PAYMENTS_HEAD, FX.PAYMENTS, 'payments'));
  const vendors = parseParties(tableOf(FX.VENDORS_HEAD, FX.VENDORS, 'vendors'), 'vendors');
  const employees = parseParties(tableOf(FX.EMPLOYEES_HEAD, FX.EMPLOYEES, 'employees'), 'employees');

  it('重复付款：同收款方同金额同发票号 → 高', () => {
    const h = duplicatePayments(payments, th);
    expect(h).toHaveLength(1);
    expect([h[0].level, h[0].refs, h[0].amount]).toEqual(['high', ['P-1', 'P-2'], 5_000_000]);
  });
  it('供应商与员工账户相同（忽略空格）、名称相似（员工姓名在供应商名里）', () => {
    expect(vendorEmployeeBank(vendors, employees).map((h) => h.refs)).toEqual([['V-2', 'E-1']]);
    expect(relatedNames(vendors, employees, th).map((h) => h.refs)).toEqual([['V-2', 'E-1']]);
    expect(dice('abcd', 'abcd')).toBe(1);
  });
  it('周末分录（2026-09-05 周六）、期末大额手工凭证（9-30 手工 8 万）、整数金额（3 笔 2 万）', () => {
    const journal = [
      j('2026-09-05', 'V-SAT', '管理费用', 200_000, 0), j('2026-09-05', 'V-SAT', '银行存款', 0, 200_000),
      j('2026-09-30', 'V-END', '主营业务收入', 0, 8_000_000, '手工'), j('2026-09-30', 'V-END', '应收账款', 8_000_000, 0, '手工'),
      j('2026-09-29', 'V-SYS', '应收账款', 9_000_000, 0, '系统'),
      ...[1, 2, 3].map((i) => j('2026-09-10', `V-R${i}`, '咨询费', 2_000_000, 0)),
    ];
    expect(weekendEntries(journal, th).map((h) => h.refs[0])).toEqual(['V-SAT']);
    expect(periodEndManual(journal, th).map((h) => h.refs[0])).toEqual(['V-END']);
    expect(roundAmounts(journal, th)[0]?.refs).toEqual(expect.arrayContaining(['V-END', 'V-SYS', 'V-R1', 'V-R2', 'V-R3']));
  });
  it('汇总扫描：规则覆盖列出 risk.ts 不适用的规则（缺发票 / 回单 / 申报数据）', () => {
    const scan = fraudScan({ journal: [j('2026-09-05', 'V1', '库存现金', 6_000_000, 0)], tb: null, payments, vendors, employees, holidays: [], th });
    expect(scan.hits.some((h) => h.rule === 'large_cash')).toBe(true);
    expect(scan.coverage.filter((c) => c.status === 'not_applicable').map((c) => c.rule)).toEqual(expect.arrayContaining(['consecutive', 'pay_person', 'bad_docs', 'low_burden', 'stale_aging', 'idle_other', 'wrong_side']));
    expect(scan.coverage).toHaveLength(18);
  });
});
