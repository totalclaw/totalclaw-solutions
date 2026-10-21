/**
 * A3 应收与账龄：账龄分层金额、坏账准备、宽限期、TOP 风险客户、催款阶段、信用评估（期望值见 __fixtures__/accounting/subledgers.ts 注释，手算）。
 */
import { describe, expect, it } from 'vitest';
import * as FX from '../../__fixtures__/accounting/subledgers';
import { parse } from '../../__fixtures__/accounting/parse';
import { thresholdsFor } from '../../thresholds';
import { arAging, bucketOf, overdueDaysOf } from './ar/engine';

const Y = (yuan: number) => Math.round(yuan * 100);
const items = parse('ar', FX.AR).rows;
const res = arAging({
  asOf: FX.AS_OF, items, receipts: parse('receipt', FX.RECEIPTS).rows, customers: parse('customer', FX.CUSTOMERS).rows,
  priorOverdueRate: null, th: thresholdsFor('ar'), credit: true,
});
const bucket = (b: string) => res.buckets.find((x) => x.bucket === b)!;

describe('A3 账龄', () => {
  it('列识别：未清 0 的已结清行不进账龄；没有到期日的按开票日 + 账期', () => {
    expect(items).toHaveLength(9);
    expect(res.items).toHaveLength(8);
    expect(res.items.find((i) => i.docNo === 'INV-D1')).toMatchObject({ dueDate: '2025-08-31', overdueDays: 395, bucket: 'over365' });
  });

  it('宽限期 3 天内不算逾期；分层边界', () => {
    expect(overdueDaysOf('2026-09-28', FX.AS_OF, 3)).toBe(0);
    expect(overdueDaysOf('2026-09-26', FX.AS_OF, 3)).toBe(4);
    expect([0, 1, 30, 31, 60, 61, 90, 91, 180, 181, 365, 366].map(bucketOf)).toEqual(['current', 'd1_30', 'd1_30', 'd31_60', 'd31_60', 'd61_90', 'd61_90', 'd91_180', 'd91_180', 'd181_365', 'd181_365', 'over365']);
  });

  it('账龄分层金额与手算一致，合计 = 明细', () => {
    expect(bucket('current')).toMatchObject({ amount: Y(150000), count: 2, provision: 0 });
    expect(bucket('d1_30')).toMatchObject({ amount: Y(30000), count: 1, provision: 0 });
    expect(bucket('d31_60')).toMatchObject({ amount: Y(60000), count: 2, provision: Y(6000) });
    expect(bucket('d61_90')).toMatchObject({ amount: 0, count: 0 });
    expect(bucket('d91_180')).toMatchObject({ amount: Y(60000), provision: Y(18000) });
    expect(bucket('d181_365')).toMatchObject({ amount: Y(12345.67), provision: Y(6172.84) });
    expect(bucket('over365')).toMatchObject({ amount: Y(15000), provision: Y(15000) });
    expect(res.total).toBe(Y(327345.67));
    expect(res.overdue).toBe(Y(177345.67));
    expect(res.provision).toBe(Y(45172.84));
    expect(res.buckets.reduce((s, b) => s + b.amount, 0)).toBe(res.total);
  });

  it('TOP 风险客户、催款阶段只出草稿', () => {
    expect(res.top).toEqual(['丙公司', '乙公司', '丁公司']);
    expect(res.letters.map((l) => [l.customer, l.stage])).toEqual([['丙公司', 4], ['乙公司', 2], ['丁公司', 5]]);
    expect(res.customers.find((c) => c.customer === '丙公司')).toMatchObject({ risk: 'high', maxOverdueDays: 91 });
    expect(res.customers.find((c) => c.customer === '乙公司')).toMatchObject({ risk: 'medium', stage: 2 });
  });

  it('信用评估：付款历史定等级，高负债 / 风险信号降为 D，建议额度 = 月均开票 × 账期月数', () => {
    const c = (n: string) => res.credit.find((x) => x.customer === n)!;
    expect(c('甲公司')).toMatchObject({ history: 'excellent', grade: 'A', termDays: 60, avgMonthlyBilling: Y(15000), suggestedLimit: Y(30000), approval: 'ar_supervisor' });
    expect(c('甲公司').reasons.map((r) => r.code)).toContain('credit.over_limit');
    expect(c('乙公司')).toMatchObject({ history: 'good', grade: 'B', termDays: 45, suggestedLimit: Y(15000) });
    expect(c('丙公司')).toMatchObject({ history: 'bad', grade: 'D', suggestedLimit: 0 });
    expect(c('丁公司')).toMatchObject({ grade: 'D', highRisk: ['被执行'] });
    expect(res.customers.find((x) => x.customer === '甲公司')!.flags.map((f) => [f.code, f.level])).toContainEqual(['ar.utilization', 'block']);
  });

  it('升级：逾期 > 90 天、高风险信号、D 级；逾期率上升超过 10 个百分点', () => {
    const keys = res.escalations.map((e) => e.key);
    expect(keys.filter((k) => k.includes('最长逾期'))).toHaveLength(2);
    expect(keys.some((k) => k.includes('高风险信号'))).toBe(true);
    expect(keys.filter((k) => k.includes('D 级'))).toHaveLength(2);
    const r2 = arAging({ asOf: FX.AS_OF, items, receipts: [], customers: [], priorOverdueRate: 0.3, th: thresholdsFor('ar'), credit: false });
    expect(r2.escalations.some((e) => e.key.includes('逾期率由上期'))).toBe(true);
    expect(r2.credit).toEqual([]);
  });
});
