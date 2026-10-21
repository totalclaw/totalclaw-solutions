/** F2 资本配置与项目投资金标准（期望数字手算，写在注释里）。 */
import { describe, expect, it } from 'vitest';
import { CAPEX_ENGINES, binomial, npvIrr, paybackOf, realOption } from './capex';
import { irr, npv, xirr } from './math';
import { bs } from './markets';

describe('F2 NPV / IRR', () => {
  it('投资 1000、三期各 400、折现率 10%', () => {
    // NPV = 400/1.1 + 400/1.21 + 400/1.331 − 1000 = 363.6364 + 330.5785 + 300.5259 − 1000 = −5.2592
    // 回收期：累计 −1000 → −600 → −200 → +200，第 2 期之后 200/400 = 0.5 → 2.5 期
    const r = npvIrr({ rate: 0.1, premium: 0.02, investment: 1000, flows: [1, 2, 3].map((period) => ({ period, cashflow: 400 })) });
    expect(r.npv).toBeCloseTo(-5.2592, 4);
    expect(r.irr).toBeCloseTo(0.097010, 5);
    expect(r.payback).toBeCloseTo(2.5, 9);
    expect(r.verdict).toBe('reject');
    expect(r.grid.npv[2][2]).toBeCloseTo(r.npv, 9);
    // 盈利指数 = 994.7408 / 1000
    expect(r.pi).toBeCloseTo(0.99474, 5);
  });

  it('IRR 与 XIRR：一年翻倍 = 100%，按日期 365 天口径', () => {
    expect(irr([-100, 200])).toBeCloseTo(1, 9);
    expect(xirr([{ date: '2025-01-01', amount: -100 }, { date: '2026-01-01', amount: 110 }])).toBeCloseTo(0.1, 6);
    expect(irr([100, 100])).toBeNull();
    expect(npv(0, [1, 2, 3])).toBe(6);
    expect(paybackOf([-100, 50, 50], [0, 1, 2])).toBeCloseTo(2, 9);
  });
});

describe('F2 实物期权（CRR 二叉树）', () => {
  it('不付股息的美式看涨 = 欧式看涨：500 步收敛到 Black–Scholes（S=K=100，σ=20%，r=5%，T=1 → 10.4506）', () => {
    expect(bs('call', 100, 100, 1, 0.05, 0.2).price).toBeCloseTo(10.4506, 4);
    expect(binomial(100, 0.2, 0.05, 1, 500, (s) => Math.max(0, s - 100)).value).toBeCloseTo(10.4506, 1);
  });

  it('延迟期权：扩展 NPV = 看涨期权价值，静态 NPV = 0 时期权价值 = 全部扩展 NPV', () => {
    const r = realOption({ type: 'defer', pv: 100, cost: 100, vol: 0.2, r: 0.05, years: 1, steps: 200, expandFactor: 0, expandCost: 0, salvage: 0 });
    expect(r.staticNpv).toBe(0);
    expect(r.optionValue).toBeCloseTo(r.expandedNpv, 12);
    expect(r.expandedNpv).toBeGreaterThan(10);
  });

  it('风险中性概率不在 0 ~ 1 之间时阻断', () => {
    // 波动率极低、利率极高：e^{rΔt} > u
    expect(CAPEX_ENGINES.real_options.check!({ f: { optionType: 'defer', pv: 100, cost: 90, vol: 0.01, riskFree: 0.3, years: 1, steps: 1 }, t: {} }).length).toBe(1);
  });
});

describe('F2 WACC / ROIC 与情景', () => {
  it('ROIC − WACC 与经济增加值', () => {
    // E = 750、D = 250 → 负债占比 25%；股权成本 4% + 1.6 × 5% = 12%；税后债务 5% × 0.8 = 4% → WACC 10%
    // ROIC = 150 × (1 − 20%) / 1000 = 12% → 价差 2%，EVA = 20
    const out = CAPEX_ENGINES.wacc_roic.run({ f: { riskFree: 0.04, beta: 1.6, erp: 0.05, costDebt: 0.05, taxRate: 0.2, equityValue: 750, debtValue: 250, ebit: 150, investedCapital: 1000 }, t: { units: [] } });
    const m = Object.fromEntries(out.metrics.map((x) => [x.id, x.value]));
    expect(m.wacc).toBeCloseTo(0.1, 12);
    expect(m.roic).toBeCloseTo(0.12, 12);
    expect(m.eva).toBeCloseTo(20, 9);
  });

  it('情景概率合计不是 100% 时阻断；期望 NPV 与亏损概率', () => {
    const scenarios = [{ name: 'Bull', probability: 0.25, npv: 200 }, { name: 'Base', probability: 0.5, npv: 100 }, { name: 'Bear', probability: 0.25, npv: -80 }];
    expect(CAPEX_ENGINES.scenario.check!({ f: {}, t: { scenarios: scenarios.slice(0, 2) } }).length).toBe(1);
    // 期望 = 50 + 50 − 20 = 80；亏损概率 25%
    const out = CAPEX_ENGINES.scenario.run({ f: {}, t: { scenarios } });
    expect(out.metrics.find((x) => x.id === 'expected')?.value).toBeCloseTo(80, 9);
    expect(out.metrics.find((x) => x.id === 'pLoss')?.value).toBeCloseTo(0.25, 9);
  });
});
