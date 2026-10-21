/** F7 固定收益与市场分析、F6 研究、F8 财富规则部分金标准（期望数字手算，写在注释里）。 */
import { describe, expect, it } from 'vitest';
import { MARKETS_ENGINES, bondMath, bs, futuresBasis, fxForward, impliedVol, interp, priceStats } from './markets';
import { RESEARCH_ENGINES, WEALTH_ENGINES, holdingsSummary, twr } from './research';

describe('F7 债券与组合', () => {
  it('平价债：票息 5%、收益率 5%、5 年年付 → 价格 100，麦考利久期 4.5460，修正久期 4.3295', () => {
    // 麦考利久期 = (1.05 / 0.05) × (1 − 1.05^−5) = 21 × 0.2164738 = 4.545951；修正久期 = 4.545951 / 1.05 = 4.329477；DV01 = 4.329477 × 100 × 0.0001
    const b = bondMath(0.05, 0.05, 5, 1);
    expect(b.price).toBeCloseTo(100, 9);
    expect(b.macaulay).toBeCloseTo(4.545951, 6);
    expect(b.modified).toBeCloseTo(4.329477, 6);
    expect(b.dv01).toBeCloseTo(0.04329477, 8);
  });

  it('期货基差：总基差、持有收益、隐含回购', () => {
    // 发票价 = 98 × 0.9 = 88.2；总基差 = 90 − 88.2 = 1.8；票息收入 = 100 × 4% × 90 / 365 = 0.986301；
    // 融资成本 = (90 + 1) × 2% × 90 / 360 = 0.455；持有收益 = 0.531301；净基差 = 1.268699；
    // 隐含回购 = (88.2 − 90 + 0.986301) / 91 × 360 / 90 = −3.5767%
    const r = futuresBasis(98, 0.02, 90, { clean: 90, coupon: 0.04, cf: 0.9, accrued: 1 });
    expect(r.gross).toBeCloseTo(1.8, 9);
    expect(r.carry).toBeCloseTo(0.531301, 6);
    expect(r.net).toBeCloseTo(1.268699, 6);
    expect(r.impliedRepo).toBeCloseTo(-0.035767, 6);
  });

  it('外汇远期：利率平价', () => {
    // t = 90 / 365 = 0.246575；F = 7 × (1 + 2% × t) / (1 + 5% × t) = 7 × 1.0049315 / 1.0123288 = 6.948850；远期点 −511.50
    const f = fxForward(7, 0.05, 0.02, 90);
    expect(f.fwd).toBeCloseTo(6.948850, 6);
    expect(f.carry).toBeCloseTo(0.03, 12);
  });

  it('期权：Black–Scholes 价格反推隐含波动率；无套利区间外返回 null', () => {
    const price = bs('call', 100, 100, 1, 0.05, 0.2).price;
    expect(impliedVol('call', 100, 100, 1, 0.05, price)).toBeCloseTo(0.2, 6);
    expect(impliedVol('call', 100, 100, 1, 0.05, 0.001)).toBeNull();
    // 看跌看涨平价：C − P = S − K e^{−rT}
    expect(price - bs('put', 100, 100, 1, 0.05, 0.2).price).toBeCloseTo(100 - 100 * Math.exp(-0.05), 9);
  });

  it('曲线插值、相对价值利差与互换曲线倒挂', () => {
    expect(interp([{ t: 2, y: 0.02 }, { t: 10, y: 0.04 }], 6)).toBeCloseTo(0.03, 12);
    const rv = MARKETS_ENGINES.bond_rv.run({ f: {}, t: { bonds: [{ bond: 'X', maturity: 6, yield: 0.033, avgSpread: 10, stdSpread: 10 }], curve: [{ tenor: 2, yield: 0.02 }, { tenor: 10, yield: 0.04 }] } });
    // 利差 = (3.3% − 3.0%) × 10000 = 30 基点；Z = (30 − 10) / 10 = 2 → 偏便宜
    expect(rv.tables[0].rows[0].spread).toBeCloseTo(30, 9);
    expect(rv.tables[0].rows[0].z).toBeCloseTo(2, 9);
    const sw = MARKETS_ENGINES.swap_curve.run({ f: {}, t: { curve: [{ tenor: 2, rate: 0.045, prior: null }, { tenor: 5, rate: 0.04, prior: null }, { tenor: 10, rate: 0.038, prior: null }] } });
    expect(sw.flags.map((f) => f.id)).toContain('inverted');
    // 2-5-10 蝴蝶 = (2 × 4% − 4.5% − 3.8%) × 10000 = −30 基点
    expect(sw.metrics.find((m) => m.id === 'fly')?.value).toBeCloseTo(-30, 9);
  });

  it('组合久期与平行冲击；个股区间收益与最大回撤', () => {
    const out = MARKETS_ENGINES.fi_portfolio.run({ f: { shockBp: 100 }, t: { holdings: [{ bond: 'A', face: 1000, coupon: 0.05, yield: 0.05, maturity: 5, freq: 1 }] } });
    expect(out.metrics.find((m) => m.id === 'mv')?.value).toBeCloseTo(1000, 6);
    expect(out.metrics.find((m) => m.id === 'duration')?.value).toBeCloseTo(4.329477, 6);
    const p = priceStats([{ date: '2026-01-02', close: 100 }, { date: '2026-02-02', close: 120 }, { date: '2026-03-02', close: 90 }, { date: '2026-04-02', close: 110 }]);
    // 最大回撤 = 90 / 120 − 1 = −25%；年初至今 = 110 / 100 − 1 = 10%
    expect(p.mdd).toBeCloseTo(-0.25, 12);
    expect(p.ytd).toBeCloseTo(0.1, 12);
  });
});

describe('F6 研究 / F8 财富', () => {
  it('财报点评：偏差超过判定线才算超预期 / 不及预期', () => {
    const out = RESEARCH_ENGINES.earnings.run({ f: { beatPct: 0.02 }, t: { actuals: [{ metric: 'Rev', actual: 103, consensus: 100 }, { metric: 'EPS', actual: 0.99, consensus: 1 }] } });
    expect(out.metrics.map((m) => m.value)).toEqual([1, 0]);
  });

  it('竞争集中度：份额 50% / 30% / 20% → HHI 3800', () => {
    const out = RESEARCH_ENGINES.competitive.run({ f: {}, t: { competitors: [{ name: 'A', revenue: 50, positioning: '' }, { name: 'B', revenue: 30, positioning: '' }, { name: 'C', revenue: 20, positioning: '' }] } });
    expect(out.metrics[0].value).toBeCloseTo(3800, 9);
  });

  it('时间加权收益与配置偏离；配置权重合计不是 100% 阻断', () => {
    // (1 + 10%) × (1 − 5%) − 1 = 4.5%
    expect(twr([0.1, -0.05])).toBeCloseTo(0.045, 12);
    const s = holdingsSummary([{ asset: 'X', assetClass: 'Equity', value: 70, target: 0.6 }, { asset: 'Y', assetClass: 'Bond', value: 30, target: 0.4 }]);
    expect(s.classes.find((c) => c.assetClass === 'Equity')?.drift).toBeCloseTo(0.1, 12);
    expect(WEALTH_ENGINES.investment_proposal.check!({ f: {}, t: { allocation: [{ assetClass: 'A', weight: 0.5, expReturn: 0.05 }] } })).toHaveLength(1);
  });
});
