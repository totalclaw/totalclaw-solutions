import { describe, expect, it } from 'vitest';
import { thresholdsFor } from '../../thresholds';
import * as F from '../../__fixtures__/accounting/glsub';
import { glSubledgerRecon, normKey } from './recon/glsub';

const th = thresholdsFor('recon');

describe('A2 总账 ↔ 子账', () => {
  const r = glSubledgerRecon({ gl: F.gl, sub: F.sub, th });
  const by = Object.fromEntries(r.breaks.map((b) => [b.key, b]));

  it('六类差异计数与夹具完全一致；相符率 2/9；合计', () => {
    expect(r.counts).toEqual(F.expected.counts);
    expect(r.matchRate).toBeCloseTo(F.expected.matchRate, 10);
    expect(r.totals).toEqual(F.expected.totals);
  });

  it('汇率差异（外币相等本币不等）被标 fx 成因；其余成因按设计', () => {
    for (const [key, causes] of Object.entries(F.expected.causes)) expect(by[key].causes, key).toEqual(causes);
    expect(by['INV-007'].cls).toBe('amount');
    expect(by['INV-008'].cls).toBe('matched'); // 同键多行先合计
  });

  it('按差额绝对值从大到小；重大差异进升级', () => {
    const diffs = r.breaks.map((b) => Math.abs(b.diff));
    expect([...diffs].sort((a, b) => b - a)).toEqual(diffs);
    expect(r.breaks.filter((b) => b.major).map((b) => b.key).sort()).toEqual(F.expected.major);
    expect(r.escalations).toHaveLength(2);
  });

  it('对面有同金额的另一个键 → 映射成因；正负号反 → 数据质量；小额 → 费用 / 计提', () => {
    const res = glSubledgerRecon({
      gl: [{ ...F.gl[0], key: 'A-1' }, { ...F.gl[1], key: 'S-1', amount: 30000 }, { ...F.gl[1], key: 'F-1', amount: 100000 }],
      sub: [{ ...F.sub[0], key: 'A1X' }, { ...F.sub[1], key: 'S-1', amount: -30000, quantity: 2 }, { ...F.sub[1], key: 'F-1', amount: 95000, quantity: 2 }],
      th,
    });
    const b = Object.fromEntries(res.breaks.map((x) => [x.key, x]));
    expect(b['A-1'].causes).toEqual(['mapping']);
    expect(b.A1X.causes).toEqual(['mapping']);
    expect(b['S-1'].causes).toEqual(['data_quality']);
    expect(b['F-1'].causes).toEqual(['fee_or_accrual']);
    expect(normKey(' inv-01 ')).toBe('INV-01');
  });
});
