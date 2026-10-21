/**
 * F1 估值引擎金标准（期望数字手算，写在注释里）。
 */
import { describe, expect, it } from 'vitest';
import { VALUATION_ENGINES, dcf, lbo, peerMultiples, statsOf, threeStatement, waccOf } from './valuation';
import { DCF_FX, LBO_FX } from '../../__fixtures__/capital/valuation';
import type { CapIn } from './inputs';

const capIn = (f: Record<string, number | string | null>, t: Record<string, object[]> = {}): CapIn => ({ f, t: t as CapIn['t'] });

describe('F1 DCF', () => {
  it('WACC = 10%', () => {
    expect(waccOf(DCF_FX).wacc).toBeCloseTo(0.1, 12);
  });

  it('企业价值与手算一致，终值占比超过 75% 出黄旗', () => {
    const r = dcf(DCF_FX);
    expect(r.sumPv).toBeCloseTo(272.7273, 3);
    expect(r.tv).toBeCloseTo(1542.75, 6);
    expect(r.pvTv).toBeCloseTo(1159.0909, 3);
    expect(r.ev).toBeCloseTo(1431.8182, 3);
    expect(r.tvShare).toBeCloseTo(0.8095, 4);
    expect(r.equity).toBeCloseTo(1231.8182, 3);
    expect(r.perShare).toBeCloseTo(12.3182, 3);
    // 敏感性中间格 = 模型结果
    expect(r.grid.ev[2][2]).toBeCloseTo(r.ev, 9);
    const v = capIn({
      riskFree: 0.04, beta: 1.6, erp: 0.05, sizePremium: 0, costDebt: 0.05, taxRate: 0.2, debtWeight: 0.25, terminalMethod: 'gordon', terminalGrowth: 0.02, exitMultiple: null, midYear: 'no', netDebt: 200, shares: 100,
    }, { forecast: DCF_FX.forecast.map((y) => ({ ...y })) });
    const out = VALUATION_ENGINES.dcf.run(v);
    expect(out.flags.map((f) => f.id)).toContain('tv_high');
    expect(out.metrics.find((m) => m.id === 'ev')?.value).toBeCloseTo(1431.8182, 3);
    // 公司档案把黄旗线调到 85%（runner 经 v.th 传入）：80.95% 不再出黄旗，模型自检行也按 85%
    const relaxed = VALUATION_ENGINES.dcf.run({ ...v, th: { 'dcf.terminalShareHigh': 0.85, 'dcf.terminalShareLow': 0.4 } });
    expect(relaxed.flags.map((f) => f.id)).not.toContain('tv_high');
    expect((relaxed.detail as { tvHigh: number }).tvHigh).toBe(0.85);
  });

  it('期中折现：折现期 0.5 / 1.5 / 2.5，终值按 2.5 折现', () => {
    // 100/1.1^0.5 + 110/1.1^1.5 + 121/1.1^2.5 = 3 × 95.3463 = 286.0388；1542.75 / 1.1^2.5 = 1215.6647；合计 1501.7036
    const r = dcf({ ...DCF_FX, midYear: true });
    expect(r.ev).toBeCloseTo(1501.7036, 3);
  });

  it('永续增长率不小于 WACC 时阻断', () => {
    const v = capIn({ riskFree: 0.04, beta: 1.6, erp: 0.05, sizePremium: 0, costDebt: 0.05, taxRate: 0.2, debtWeight: 0.25, terminalMethod: 'gordon', terminalGrowth: 0.12, netDebt: 0 }, { forecast: DCF_FX.forecast.map((y) => ({ ...y })) });
    expect(VALUATION_ENGINES.dcf.check!(v).length).toBeGreaterThan(0);
  });

  it('退出倍数法：终值 = (EBIT + 折旧摊销) × 倍数', () => {
    // 末年 EBITDA = 151.25 + 20 = 171.25；终值 = 1712.5；现值 = 1712.5 / 1.331 = 1286.6266；EV = 272.7273 + 1286.6266 = 1559.3539
    const r = dcf({ ...DCF_FX, method: 'exit', exitMultiple: 10 });
    expect(r.ev).toBeCloseTo(1559.3539, 3);
  });
});

describe('F1 LBO', () => {
  it('债务偿还、退出股权、MOIC、IRR 与手算一致', () => {
    const r = lbo(LBO_FX);
    expect(r.equity).toBeCloseTo(520, 9);
    expect(r.rows.map((x) => x.sweep)).toEqual([expect.closeTo(23.5, 9), expect.closeTo(33.61, 9), expect.closeTo(44.3266, 9)]);
    expect(r.rows[2].seniorClose).toBeCloseTo(238.5634, 6);
    expect(r.exitEquity).toBeCloseTo(961.4366, 6);
    expect(r.moic).toBeCloseTo(1.848917, 6);
    expect(r.irr).toBeCloseTo(0.227361, 6);
    expect(r.grid.irr[2][2]).toBeCloseTo(r.irr!, 12);
  });

  it('债务超过收购总价时阻断', () => {
    expect(VALUATION_ENGINES.lbo.check!(capIn({ entryEbitda: 100, entryMultiple: 4, feesPct: 0, minCash: 0, seniorX: 4, subX: 1 }, { forecast: LBO_FX.forecast.map((y) => ({ ...y })) })).length).toBe(1);
  });
});

describe('F1 三表与可比公司', () => {
  it('三表逐年平衡、现金由现金流量表推出', () => {
    const { years } = threeStatement({
      years: 3, revenue0: 1000, growth: 0.1, grossMargin: 0.4, opexPct: 0.2, daPct: 0.1, capexPct: 0.05, dso: 36.5, dio: 73, dpo: 36.5,
      taxRate: 0.25, interestRate: 0.05, payout: 0.3, cash0: 100, ppe0: 500, debt0: 300, ar0: 100, inv0: 120, ap0: 60, debtRepay: 50,
    });
    expect(years.every((y) => y.balanced)).toBe(true);
    // Y1：收入 1100；营业成本 660；EBITDA = 440 − 220 = 220；折旧 = 500 × 10% = 50；利息 = 300 × 5% = 15；税 = (170 − 15) × 25% = 38.75；净利 116.25
    expect(years[0].netIncome).toBeCloseTo(116.25, 9);
    // 应收 = 1100 × 36.5 / 365 = 110；存货 = 660 × 73 / 365 = 132；应付 = 66
    expect([years[0].ar, years[0].inv, years[0].ap]).toEqual([expect.closeTo(110, 9), expect.closeTo(132, 9), expect.closeTo(66, 9)]);
  });

  it('可比公司倍数：EBITDA 不为正记 NM，四分位与 Excel QUARTILE.INC 一致', () => {
    const peers = [
      { name: 'A', ev: 800, marketCap: 600, revenue: 400, ebitda: 100, netIncome: 50 },
      { name: 'B', ev: 1000, marketCap: 800, revenue: 500, ebitda: 100, netIncome: 40 },
      { name: 'C', ev: 1200, marketCap: 900, revenue: 600, ebitda: 100, netIncome: 60 },
      { name: 'D', ev: 900, marketCap: 700, revenue: 300, ebitda: -5, netIncome: -1 },
    ];
    expect(peerMultiples(peers[3]).evEbitda).toBeNull();
    // EV/EBITDA = 8、10、12 → 下四分位 9、中位 10、上四分位 11
    const st = statsOf(peers.map(peerMultiples).map((m) => m.evEbitda).filter((x): x is number => x !== null));
    expect([st.q1, st.median, st.q3]).toEqual([9, 10, 11]);
    const out = VALUATION_ENGINES.comps.run(capIn({ targetEbitda: 50, targetNetDebt: 100, targetRevenue: null, targetNetIncome: null, shares: 10 }, { peers }));
    // 隐含股权价值（中位数）= 10 × 50 − 100 = 400；每股 40
    expect(out.metrics.find((m) => m.id === 'equityMid')?.value).toBe(400);
    expect(out.metrics.find((m) => m.id === 'perShareMid')?.value).toBe(40);
  });

  it('多方法整合：权重合计不是 100% 时阻断；加权值 = Σ 权重 × 中值', () => {
    const methods = [{ method: 'DCF', low: 900, high: 1100, weight: 0.5 }, { method: 'Comps', low: 800, high: 1000, weight: 0.5 }];
    expect(VALUATION_ENGINES.integration.check!(capIn({}, { methods: [{ ...methods[0], weight: 0.6 }, methods[1]] })).length).toBe(1);
    // 0.5 × 1000 + 0.5 × 900 = 950
    expect(VALUATION_ENGINES.integration.run(capIn({}, { methods })).metrics[0].value).toBe(950);
  });
});
