import { describe, expect, it } from 'vitest';
import { thresholdsFor } from '../../thresholds';
import * as F from '../../__fixtures__/accounting/glsub';
import { glSubledgerRecon } from './recon/glsub';
import { breakFacts, majorBreaks, verifyBreakTrace } from './recon/breakTrace';

const th = thresholdsFor('recon');
const result = glSubledgerRecon({ gl: F.gl, sub: F.sub, th });
const inv009 = result.breaks.find((b) => b.key === 'INV-009')!;
const facts = breakFacts(inv009, F.gl, F.sub);

describe('A2 break-trace 回核', () => {
  it('只追重大差异', () => {
    expect(majorBreaks(result, th).map((b) => b.key).sort()).toEqual(['INV-006', 'INV-009']);
  });

  it('事实集合含两边原始行的金额（元）、键 / 单号、日期', () => {
    expect(facts.amounts).toEqual(expect.arrayContaining([6000, 12000, -6000]));
    expect(facts.refs).toContain('INV-009');
    expect(facts.dates).toEqual(['2026-09-12']);
  });

  it('引用的单号、金额、日期都在数据里 → verified', () => {
    const t = verifyBreakTrace({
      rootCause: 'Subledger posted INV-009 twice on 2026-09-12 (6,000.00 each), so it shows 12,000.00 vs GL 6,000.00 — duplicate post.',
      owner: 'accounting', expectedClearDate: '2026-10-08', action: 'adjust_subledger',
    }, facts);
    expect(t.status).toBe('verified');
    expect(t.missing).toBeUndefined();
  });

  it('桩返回的根因引用了不存在的单号 → 打回', () => {
    const t = verifyBreakTrace({
      rootCause: '子账把发票 INV-999 重复入账 6,000.00，应冲销 INV-999。',
      owner: 'accounting', expectedClearDate: '2026-10-08', action: 'adjust_subledger',
    }, facts);
    expect(t.status).toBe('rejected');
    expect(t.missing).toContain('INV-999');
  });

  it('编造金额或日期、动作不在枚举里 → 打回', () => {
    expect(verifyBreakTrace({ rootCause: 'GL posted 7,777.00 for INV-009.', owner: 'ops', expectedClearDate: '', action: 'adjust_gl' }, facts).missing).toEqual(['7,777.00']);
    expect(verifyBreakTrace({ rootCause: 'INV-009 posted on 2026-08-01.', owner: 'ops', expectedClearDate: '', action: 'adjust_gl' }, facts).missing).toEqual(['2026-08-01']);
    const bad = verifyBreakTrace({ rootCause: 'INV-009 duplicate.', owner: 'ops', expectedClearDate: '', action: 'suppress' }, facts);
    expect(bad.status).toBe('rejected');
    expect(bad.action).toBe('investigate');
  });
});
