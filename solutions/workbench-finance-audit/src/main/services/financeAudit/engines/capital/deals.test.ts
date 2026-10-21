/** F3 / F4 / F5 规则引擎金标准（期望数字手算，写在注释里）。 */
import { describe, expect, it } from 'vitest';
import { IB_ENGINES, MA_ENGINES, PE_ENGINES, aiPriority, buyerScore, ddChecklist, merger, peReturns, unitEconomics, waterfall } from './deals';

describe('F5 PE', () => {
  it('分配瀑布：出资 100、可分配 200、优先回报 8% 五年、100% 追补、20% 业绩报酬', () => {
    // 返还出资 100；优先回报 = 100 × (1.08^5 − 1) = 46.932808；
    // 追补段 = 20% × 46.932808 / (100% − 20%) = 11.733202，全归 GP；
    // 剩余 200 − 100 − 46.932808 − 11.733202 = 41.33399 → LP 33.067192、GP 8.266798；
    // LP 合计 180、GP 合计 20（= 超额收益 100 的 20%）
    const w = waterfall(100, 200, 0.08, 5, 1, 0.2);
    expect(w.tiers[1].lp).toBeCloseTo(46.932808, 6);
    expect(w.tiers[2].gp).toBeCloseTo(11.733202, 6);
    expect(w.lp).toBeCloseTo(180, 9);
    expect(w.gp).toBeCloseTo(20, 9);
    expect(w.gpShareOfProfit).toBeCloseTo(0.2, 12);
    // 可分配不够返还出资：没有业绩报酬
    expect(waterfall(100, 80, 0.08, 5, 1, 0.2).gp).toBe(0);
  });

  it('回报：MOIC、IRR 与价值创造拆分', () => {
    // 进入股权 = 100 × 10 − 400 = 600；退出股权 = 150 × 11 − 200 = 1450；MOIC = 2.416667；IRR = 2.416667^(1/5) − 1 = 19.3007%
    // 拆分：EBITDA 增长 (150 − 100) × 10 = 500；倍数 (11 − 10) × 150 = 150；去杠杆 400 − 200 = 200；合计 850 = 1450 − 600
    const r = peReturns({ entryEbitda: 100, entryMultiple: 10, entryNetDebt: 400, exitEbitda: 150, exitMultiple: 11, exitNetDebt: 200, holdYears: 5, flows: [] });
    expect(r.moic).toBeCloseTo(2.416667, 6);
    expect(r.irr).toBeCloseTo(0.193007, 5);
    expect(r.attribution.growth + r.attribution.multiple + r.attribution.delever).toBeCloseTo(r.eq1 - r.eq0, 9);
    expect(r.grid.irr[2][2]).toBeCloseTo(r.irr!, 12);
  });

  it('单位经济：LTV = 每客户月收入 × 毛利率 / 月流失率', () => {
    // 100 × 80% / 2% = 4000；LTV/CAC = 4；回本期 1000 / 80 = 12.5 个月
    expect(unitEconomics(100, 0.8, 0.02, 1000)).toEqual({ ltv: 4000, ltvCac: 4, paybackMonths: 12.5, lifetimeMonths: 50 });
  });

  it('投后 KPI 偏离超过阈值进提醒；AI 机会按 0.5 / 0.3 / 0.2 加权', () => {
    const out = PE_ENGINES.portfolio.run({ f: { threshold: 0.1 }, t: { kpis: [{ company: 'Co', metric: 'Revenue', actual: 85, budget: 100 }, { company: 'Co', metric: 'EBITDA', actual: 20, budget: 21 }] } });
    expect(out.flags).toHaveLength(1);
    expect(aiPriority(5, 4, 3)).toBeCloseTo(4.3, 12);
  });
});

describe('F4 投行', () => {
  it('合并模型：增厚 / 摊薄与商誉', () => {
    // 收购方 EPS = 100 / 100 = 1.00；新发股数 = 300 × 50% / 10 = 15；放弃现金收益 = 150 × 2% × 75% = 2.25；
    // 税后协同 = 10 × 75% = 7.5；备考净利 = 100 + 20 + 7.5 − 2.25 = 125.25；备考股数 115；EPS = 1.089130 → 增厚 8.913%
    // 商誉 = 300 − 200 − 20 = 80
    const r = merger({ acqNetIncome: 100, acqShares: 100, acqPrice: 10, tgtNetIncome: 20, purchasePrice: 300, pctStock: 0.5, pctCash: 0.5, pctDebt: 0, costDebt: 0.06, cashYield: 0.02, taxRate: 0.25, synergies: 10, tgtNetAssets: 200, intangibles: 20 });
    expect(r.eps).toBeCloseTo(1.089130, 6);
    expect(r.accretion).toBeCloseTo(0.089130, 6);
    expect(r.goodwill).toBe(80);
    expect(IB_ENGINES.merger_model.check!({ f: { pctStock: 0.5, pctCash: 0.3, pctDebt: 0 }, t: {} })).toHaveLength(1);
  });

  it('买方打分 0.4 / 0.3 / 0.3；交易跟踪按统计日算超期', () => {
    expect(buyerScore(5, 4, 3)).toBeCloseTo(4.1, 12);
    const out = IB_ENGINES.deal_tracker.run({ f: { asOf: '2026-10-19' }, t: { milestones: [
      { deal: 'P1', milestone: 'NDA', due: '2026-10-10', status: 'doing', owner: '' },
      { deal: 'P1', milestone: 'IOI', due: '2026-10-22', status: 'todo', owner: '' },
      { deal: 'P1', milestone: 'Kickoff', due: '2026-10-01', status: 'done', owner: '' },
    ] } });
    const m = Object.fromEntries(out.metrics.map((x) => [x.id, x.value]));
    expect([m.late, m.soon]).toEqual([1, 1]);
  });
});

describe('F3 并购尽调', () => {
  it('尽调清单按行业与交易类型组合：通用 17 + 软件 2 + 剥离 1 = 20；有问题的项进红旗', () => {
    expect(ddChecklist('saas', 'carve_out', [])).toHaveLength(20);
    const out = MA_ENGINES.dd_checklist.run({ f: { industry: 'saas', dealType: 'carve_out' }, t: { status: [{ item: 'fin-03', status: 'issue', note: '' }] } });
    expect(out.flags.filter((f) => f.id.startsWith('issue_'))).toHaveLength(1);
  });

  it('财务尽调：调整后 EBITDA、近 12 个月平均营运资本、含类债务的净债务', () => {
    // 100 + 15 − 5 = 110；营运资本平均 (40 + 60) / 2 = 50；交割 55 − 50 = 5；净债务 300 − 50 + 类债务 20 = 270
    const out = MA_ENGINES.financial_dd.run({ f: { reportedEbitda: 100, pegNwc: null, closingNwc: 55, cash: 50, debt: 300 }, t: {
      qoe: [{ item: 'one-off', amount: 15, category: 'nonrecurring' }, { item: 'owner', amount: -5, category: 'owner' }],
      nwc: [{ period: '2026-01', nwc: 40 }, { period: '2026-02', nwc: 60 }], debtLike: [{ item: 'bonus', amount: 20 }],
    } });
    const m = Object.fromEntries(out.metrics.map((x) => [x.id, x.value]));
    expect([m.adjusted, m.avgNwc, m.nwcAdj, m.adjNetDebt]).toEqual([110, 50, 5, 270]);
  });
});
