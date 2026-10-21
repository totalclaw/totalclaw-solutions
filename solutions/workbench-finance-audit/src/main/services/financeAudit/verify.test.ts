import { describe, expect, it } from 'vitest';
import { extractDates, extractNumbers, extractRefs, normalizeDigits, verifyNarrative, verifyNumbers } from './verify';

describe('回核：数字抽取（中英阿）', () => {
  it('千分位、小数、百分比、万 / million、阿拉伯-印度数字', () => {
    expect(extractNumbers('管理费用增加 48,000.00 元，增幅 92.31%').map((n) => [n.value, n.percent])).toEqual([[48000, false], [92.31, true]]);
    expect(extractNumbers('约 4.8万').map((n) => [n.value, n.tolerance])).toEqual([[48000, 500]]);
    expect(extractNumbers('up 1.2 million').map((n) => n.value)).toEqual([1200000]);
    expect(normalizeDigits('٤٨٬٠٠٠٫٠٠')).toBe('48,000.00');
    expect(extractNumbers('بمقدار ٤٨٬٠٠٠٫٠٠ أي ٩٢٫٣١٪').map((n) => [n.value, n.percent])).toEqual([[48000, false], [92.31, true]]);
  });
  it('日期与 100 以下的整数（笔数 / 天数 / 月份）不当金额', () => {
    expect(extractNumbers('2026-09-03 支付 8 月房租 3 笔')).toEqual([]);
    expect(extractNumbers('2026年9月30日')).toEqual([]);
    expect(extractDates('于 2026-09-03 与 2026年10月2日')).toEqual(['2026-09-03', '2026-10-02']);
  });
});

describe('回核：叙述里的数字、单号、日期都要在数据里', () => {
  const facts = { amounts: [100000, 52000, 48000, 60000], percents: [92.31], refs: ['记-0001', 'INV-009'], dates: ['2026-09-03'] };
  it('按书写精度容差：48,000 / 4.8万 / 92.3% / 92% 都算对', () => {
    expect(verifyNumbers('增加 48,000，增幅 92.3%', facts.amounts, facts.percents).ok).toBe(true);
    expect(verifyNumbers('增加约 4.8万，增幅约 92%', facts.amounts, facts.percents).ok).toBe(true);
  });
  it('写错的数字被找出来（桩里故意写错的那一行要标「未核实」）', () => {
    const r = verifyNumbers('房租 61,000.00 元导致增加', facts.amounts, facts.percents);
    expect(r.ok).toBe(false);
    expect(r.missing).toEqual(['61,000.00']);
  });
  it('单号里的数字不当金额；不存在的单号、日期被找出来', () => {
    expect(verifyNarrative('凭证 记-0001 于 2026-09-03 支付 60,000.00', facts).ok).toBe(true);
    expect(extractRefs('见 INV-009 与 TX0915001')).toEqual(['INV-009', 'TX0915001']);
    const r = verifyNarrative('凭证 记-0099 于 2026-09-05 支付 60,000.00', facts);
    expect(r.missing).toEqual(['记-0099', '2026-09-05']);
  });
});
