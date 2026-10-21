/**
 * 批次 6 规则引擎金标准（夹具与手算过程见 __fixtures__/treasury/index.ts 的注释）。
 */
import { describe, expect, it } from 'vitest';
import * as F from '../../__fixtures__/treasury';
import { thresholdsFor } from '../../thresholds';
import { cashForecast, cashPosition, forecastEscalations, paymentPlan, positionEscalations } from './cash';
import { authorizationReview, bankScores, cashPool, lcr } from './treasuryOps';
import { fxExposure } from './fx';
import { covenantChecks, financingCost, waccParams } from './financing';
import { avgDf, classifyStage, eclGeneral, eclSimplified, forwardFactor, ratingIndex, resolveScenarios, weightsOk } from './ecl';
import { cccMetrics, inventoryAbc, scfOptions, supplierTerms } from './workingCapital';
import { liquidity, portfolio } from './investments';

const th = (m: string) => thresholdsFor(m);
const Y = (yuan: number) => Math.round(yuan * 100);

describe('E1 现金：资金日报三方核对', () => {
  const p = cashPosition(F.balances, 'CNY', F.AS_OF, th('cash'));
  it('三方核对分档、可用余额、安全线、外币户不并入合计', () => {
    expect(p.accounts.map((a) => a.status)).toEqual(['ok', 'watch', 'ok', 'ok', 'breach']);
    expect(p.accounts[1].maxDiff).toBe(Y(5_000));
    expect(p.accounts[2].belowSafety).toBe(true);
    expect(p.totals.bank).toBe(Y(2_080_000));
    expect(p.totals.available).toBe(Y(2_030_000));
    expect(p.foreignAccounts).toBe(1);
  });
  it('差异超 10 万与低于安全线升级', () => {
    const esc = positionEscalations(p, th('cash'));
    expect(esc.map((e) => e.params?.p0)).toEqual(['6227-0003', '6228-0005']);
  });
});

describe('E1 现金：13 周预测三情景', () => {
  const f = cashForecast({ opening: Y(2_030_000), asOf: F.AS_OF, plan: F.cashPlan, ar: F.forecastAr, ap: F.forecastAp, facilities: F.facilities, th: th('cash') });
  const [opt, base, pes] = f.scenarios;
  it('基准情景逐周与手算一致', () => {
    expect(base.weeks).toHaveLength(13);
    expect(base.weeks.slice(0, 5).map((w) => w.closing)).toEqual([Y(1_530_000), Y(230_000), Y(330_000), Y(330_000), Y(530_000)]);
    expect([base.totalIn, base.totalOut, base.endBalance, base.minBalance, base.maxGap]).toEqual([Y(1_400_000), Y(2_900_000), Y(530_000), Y(230_000), 0]);
  });
  it('悲观情景第 2 周出现 110,000 缺口；乐观期末 990,000', () => {
    expect(pes.weeks.slice(0, 5).map((w) => w.closing)).toEqual([Y(1_470_000), Y(-110_000), Y(-90_000), Y(-90_000), Y(70_000)]);
    expect([pes.totalIn, pes.totalOut, pes.endBalance, pes.firstGapWeek, pes.maxGap]).toEqual([Y(1_120_000), Y(3_080_000), Y(70_000), 2, Y(110_000)]);
    expect([opt.totalIn, opt.totalOut, opt.endBalance]).toEqual([Y(1_680_000), Y(2_720_000), Y(990_000)]);
  });
  it('三情景合计与明细一致：逐周收付加总 = 合计，期初 + 收 − 付 = 期末，基准 = 各明细行之和', () => {
    for (const s of f.scenarios) {
      expect(s.weeks.reduce((x, w) => x + w.inflow, 0)).toBe(s.totalIn);
      expect(s.weeks.reduce((x, w) => x + w.outflow, 0)).toBe(s.totalOut);
      expect(f.opening + s.totalIn - s.totalOut).toBe(s.endBalance);
      s.weeks.forEach((w, i) => expect(w.opening).toBe(i ? s.weeks[i - 1].closing : f.opening));
    }
    const lineIn = f.lines.filter((l) => l.total > 0).reduce((x, l) => x + l.total, 0);
    const lineOut = -f.lines.filter((l) => l.total < 0).reduce((x, l) => x + l.total, 0);
    expect([lineIn, lineOut]).toEqual([base.totalIn, base.totalOut]);
  });
  it('集中度、授信覆盖、13 周外流量', () => {
    expect(f.concentration[0]).toMatchObject({ counterparty: '客户甲', amount: Y(800_000), status: 'breach' });
    expect(f.facilityAvailable).toBe(Y(3_200_000));
    expect(f.financingNeed).toBe(0);
    expect(f.beyond).toBe(1);
    expect(f.gapTier).toBe('none');
    expect(forecastEscalations(f, th('cash')).map((e) => e.key)).toEqual(['单一付款方 {p0} 占预测收款 {p1}%，资金来源过于集中']);
  });
});

describe('E1 现金：付款计划草稿（不付款）', () => {
  const plan = paymentPlan(F.paymentRequests, Y(2_030_000), F.AS_OF);
  it('P0–P4 分级与严格按优先级排程', () => {
    const by = Object.fromEntries(plan.lines.map((l) => [l.id, `${l.priority}:${l.plan}`]));
    expect(by).toEqual({ R1: 'P0:schedule', R7: 'P0:schedule', R3: 'P1:schedule', R2: 'P2:defer', R5: 'P3:defer', R4: 'P2:hold', R6: 'P2:hold' });
    expect([plan.scheduled, plan.deferred, plan.held, plan.gap, plan.total]).toEqual([Y(1_300_000), Y(1_400_000), Y(350_000), 0, Y(3_050_000)]);
    expect(plan.lines.find((l) => l.id === 'R5')!.prioritySource).toBe('given');
  });
  it('P0 不可延后：资金不够时记缺口', () => {
    const p = paymentPlan(F.paymentRequests, Y(800_000), F.AS_OF);
    expect(p.lines.filter((l) => l.priority === 'P0').every((l) => l.plan === 'schedule')).toBe(true);
    expect(p.gap).toBe(Y(300_000));
  });
});

describe('E2 司库', () => {
  it('授权复核只给建议（从不出现批准）', () => {
    const r = authorizationReview(F.authRequests, F.balances, th('treasury'));
    expect(r.map((x) => `${x.id}:${x.advice}`)).toEqual(['A1:proceed', 'A2:request_docs', 'A3:reject_recommend', 'A4:hold', 'A5:hold', 'A6:hold']);
    expect(r[0].large).toBe(true);
    expect(r[5].balanceAfter).toBe(Y(-40_000));
    expect(r.find((x) => x.checks.some((c) => c.id === 'prepay'))!.id).toBe('A2');
  });
  it('现金池：上划 / 下拨 / 归集 / 利息增益', () => {
    const p = cashPool(F.balances, 'CNY', th('treasury'));
    expect(p.header).toBe('6222-0001');
    expect(p.accounts.map((a) => [a.account, a.sweep])).toEqual([['6225-0002', Y(150_000)], ['6227-0003', Y(-20_000)], ['6228-0005', Y(500_000)]]);
    expect([p.sweepUp, p.sweepDown, p.pooled, p.interestGain]).toEqual([Y(650_000), Y(20_000), Y(1_830_000), Y(7_975)]);
    expect(p.excluded.map((e) => e.account)).toEqual(['USD-0004']);
  });
  it('银行关系评分与分级', () => {
    const s = bankScores(F.facilities, F.balances, F.AS_OF, th('treasury'));
    expect(s.map((b) => [b.bank, b.tier])).toEqual([['工商银行', 'core'], ['招商银行', 'key'], ['建设银行', 'general']]);
    expect(s[0].total).toBeCloseTo(9.2, 9);
    expect(s[1].total).toBeCloseTo(7.4, 9);
    expect(s[2].total).toBeCloseTo(20.190476190476 / 5, 9);
    expect(s[0].expiringSoon).toBe(true);
    expect(s[1].utilization).toBeCloseTo(0.9, 9);
  });
  it('LCR / NSFR', () => {
    const l = lcr(F.liquidityItems, th('treasury'));
    expect(l.hqla).toEqual({ l1: Y(1_500_000), l2a: Y(340_000), l2b: Y(100_000), adj15: 0, adj40: 0, total: Y(1_940_000) });
    expect([l.outflows, l.inflows, l.inflowsCapped, l.netOutflows]).toEqual([Y(1_500_000), Y(700_000), Y(700_000), Y(800_000)]);
    expect(l.lcr).toBeCloseTo(2.425, 9);
    expect(l.nsfr).toBeCloseTo(5 / 4.4, 9);
    expect([l.lcrStatus, l.nsfrStatus]).toEqual(['ok', 'ok']);
  });
  it('LCR 二级 B 15% 上限：一级 10,000、二级 B 20,000 → 调整 18,235，二级 B 占 HQLA 15%', () => {
    const l = lcr([
      { row: 2, item: 'L1', category: 'hqla_l1', amount: 10_000, factor: 1 },
      { row: 3, item: 'L2B', category: 'hqla_l2b', amount: 20_000, factor: 1 },
      { row: 4, item: 'out', category: 'outflow', amount: 10_000, factor: 1 },
    ], th('treasury'));
    expect(l.hqla.adj15).toBe(18_235);
    expect(l.hqla.total).toBe(11_765);
    expect((l.hqla.l2b - l.hqla.adj15) / l.hqla.total).toBeCloseTo(0.15, 3);
  });
});

describe('E3 外汇：敞口、对冲方案与询价单草稿', () => {
  const r = fxExposure(F.fxRows, F.fxRates, 'CNY', th('fx'));
  const usd = r.exposures.find((e) => e.currency === 'USD')!;
  const eur = r.exposures.find((e) => e.currency === 'EUR')!;
  it('交易 / 会计 / 经济敞口与分层', () => {
    expect([usd.transaction, usd.translation, usd.economic, usd.hedged]).toEqual([Y(1_200_000), Y(-200_000), Y(2_000_000), Y(200_000)]);
    expect(usd.layers).toEqual({ firm: Y(600_000), highly_probable: Y(800_000), possible: Y(-200_000) });
    expect([usd.hedgeTarget, usd.hedgeNeed]).toEqual([Y(800_000), Y(600_000)]);
    expect(usd.hedgeRatio).toBeCloseTo(1 / 6, 9);
    expect(usd.transactionLocal).toBe(Y(8_520_000));
    expect(usd.sensitivity.find((s) => s.shock === 0.01)!.impact).toBe(Y(56_800));
    expect(usd.overLimit).toBe(false);
    expect(usd.share).toBeCloseTo(7_100_000 / 10_220_000, 9);
  });
  it('询价单：USD 卖出按分层拆分，EUR 买入；不出交易', () => {
    expect(r.rfq.map((q) => [q.id, q.side, q.notional, q.valueMonth])).toEqual([
      ['EUR-firm', 'buy', Y(225_000), '2026-11'], ['EUR-highly_probable', 'buy', Y(50_000), '2026-12'],
      ['USD-firm', 'sell', 31_764_706, '2026-10'], ['USD-highly_probable', 'sell', 28_235_294, '2026-12'],
    ]);
    expect(eur.hedgeNeed).toBe(Y(-275_000));
    expect(r.rfq.every((q) => q.instrument === 'forward')).toBe(true);
  });
  it('没有汇率的币种列入缺失', () => {
    expect(fxExposure([{ ...F.fxRows[0], currency: 'JPY' }], F.fxRates, 'CNY', th('fx')).missingRates).toEqual(['JPY']);
  });
});

describe('E4 融资：成本、WACC 与契约', () => {
  it('综合成本、税后 Kd、WACC、到期分布', () => {
    const c = financingCost(F.loans, F.metrics, waccParams(th('financing'), {}), F.AS_OF);
    expect(c.loans.map((l) => Number(l.allIn.toFixed(6)))).toEqual([0.0385, 0.042, 0.052]);
    expect(c.kdPreTax).toBeCloseTo(251_500 / 6_000_000, 12);
    expect(c.kdAfterTax).toBeCloseTo(0.0314375, 12);
    expect(c.ke).toBeCloseTo(0.085, 12);
    expect([c.equity, c.equitySource]).toEqual([Y(9_000_000), 'book']);
    expect(c.wacc).toBeCloseTo(0.063575, 12);
    expect(c.maturity).toEqual([{ bucket: 'y1', amount: Y(3_000_000) }, { bucket: 'y2', amount: 0 }, { bucket: 'y3', amount: 0 }, { bucket: 'y5', amount: Y(3_000_000) }, { bucket: 'y5plus', amount: 0 }]);
  });
  it('手动参数覆盖默认假设', () => {
    const c = financingCost(F.loans, F.metrics, waccParams(th('financing'), { rf: 0.03, beta: 1.2, equity: Y(6_000_000) }), F.AS_OF);
    expect(c.ke).toBeCloseTo(0.03 + 1.2 * 0.06, 12);
    expect(c.equitySource).toBe('param');
  });
  it('契约：当前值、缓冲、预测期越线', () => {
    const cs = covenantChecks(F.covenants, F.metrics, th('financing'));
    expect(cs.map((c) => c.values.map((v) => v.status).join(','))).toEqual(['ok,watch,breach', 'ok,watch,breach', 'breach,breach,breach', 'ok,watch,breach']);
    expect(cs.map((c) => [c.current, c.firstBreach])).toEqual([['ok', '2027-03'], ['ok', '2027-03'], ['breach', '2026-09'], ['ok', '2027-03']]);
    expect(cs[0].values[1].headroom).toBeCloseTo(0.0625, 12);
    expect(cs[1].op).toBe('ge');
    expect(cs[3].limit).toBe(Y(8_000_000));
  });
});

describe('E5 预期信用损失', () => {
  const t = th('ifrs9');
  const sc = resolveScenarios([], t);
  it('评级归一与三阶段判定', () => {
    expect([ratingIndex('BBB+'), ratingIndex('Baa2'), ratingIndex('aa-'), ratingIndex('?')]).toEqual([3, 3, 1, null]);
    expect(F.exposures.map((e) => classifyStage(e, t).stage)).toEqual([1, 2, 2, 3, 2, 1]);
    expect(classifyStage(F.exposures[1], t).reasons).toEqual(['downgrade', 'ig_to_sub']);
    expect(weightsOk(sc)).toBe(true);
    expect(forwardFactor(sc)).toBeCloseTo(1.0625, 12);
    expect(avgDf(0.05, 3)).toBeCloseTo((1 / 1.05 + 1 / 1.05 ** 2 + 1 / 1.05 ** 3) / 3, 12);
  });
  it('计量金额与手算一致、三情景加权', () => {
    const r = eclGeneral(F.exposures, sc, t);
    const by = Object.fromEntries(r.lines.map((l) => [l.id, l]));
    expect(by.X1.ecl).toEqual({ optimistic: 2_634_930, base: 3_513_240, pessimistic: 5_269_860 });
    expect(by.X1.weighted).toBe(3_732_818);
    expect(by.X2.ecl).toEqual({ optimistic: 245_092_323, base: 326_789_764, pessimistic: 490_184_645 });
    expect(by.X2.weighted).toBe(347_214_124);
    expect(by.X3.weighted).toBe(4_694_082);
    expect(by.X4.weighted).toBe(97_400_000);
    expect([by.X5.ead, by.X5.weighted]).toEqual([Y(3_500_000), 425_000]);
    expect(by.X6.weighted).toBe(131_275);
    expect([r.totalEad, r.totalEcl]).toEqual([Y(71_500_000), 453_597_299]);
    expect(r.stages.map((s) => [s.stage, s.count, s.ead, s.ecl])).toEqual([[1, 2, Y(14_000_000), 3_864_093], [2, 3, Y(55_500_000), 352_333_206], [3, 1, Y(2_000_000), 97_400_000]]);
  });
  it('阶段迁移', () => {
    const r = eclGeneral(F.exposures, sc, t);
    expect(r.migration.map((m) => [m.from, m.to, m.count, m.ead])).toEqual([[0, 2, 1, Y(3_500_000)], [1, 1, 2, Y(14_000_000)], [1, 2, 1, Y(50_000_000)], [2, 2, 1, Y(2_000_000)], [2, 3, 1, Y(2_000_000)]]);
  });
  it('简化法拨备矩阵（读应收账龄）', () => {
    const m = eclSimplified(F.agingAr, F.AS_OF, [], forwardFactor(sc), t);
    expect(m.matrix.map((b) => [b.bucket, b.amount, b.ecl])).toEqual([
      ['current', Y(500_000), Y(2_656.25)], ['d30', Y(300_000), Y(6_375)], ['d60', Y(200_000), Y(10_625)], ['d90', 0, 0],
      ['d180', Y(100_000), Y(26_562.5)], ['d365', 0, 0], ['d365plus', Y(50_000), Y(50_000)],
    ]);
    expect(m.totalEcl).toBe(Y(96_218.75));
    const up = eclSimplified(F.agingAr, F.AS_OF, [{ row: 2, bucket: 'current', rate: 0.01 }], 1, t);
    expect(up.matrix[0].ecl).toBe(Y(5_000));
  });
  it('上传情景权重不为 100% 时能识别', () => {
    expect(weightsOk(resolveScenarios([{ row: 2, scenario: 'base', weight: 0.6, pdMultiplier: 1 }, { row: 3, scenario: 'pessimistic', weight: 0.3, pdMultiplier: 1.4 }], t))).toBe(false);
  });
});

describe('E6 营运资本', () => {
  const t = th('working-capital');
  it('DSO / DIO / DPO / CCC', () => {
    const c = cccMetrics({ ar: F.agingAr, ap: F.wcAp, inventory: F.inventory, metrics: F.metrics[0], days: 30, asOf: F.AS_OF });
    expect([c.ar, c.inventory, c.ap]).toEqual([Y(1_150_000), Y(2_000_000), Y(1_400_000)]);
    expect(c.dso).toBeCloseTo(11.5, 12);
    expect(c.dio).toBeCloseTo(2_000_000 / 2_100_000 * 30, 12);
    expect(c.dpo).toBeCloseTo(20, 12);
    expect(c.ccc).toBeCloseTo(11.5 + 2_000_000 / 2_100_000 * 30 - 20, 12);
    expect(c.perDay).toEqual({ dso: Y(100_000), dio: Y(70_000), dpo: Y(70_000) });
    expect(c.overdueAr).toBe(Y(650_000));
  });
  it('ABC 与呆滞 / 过时', () => {
    const r = inventoryAbc(F.inventory, F.AS_OF, t);
    expect(r.items.map((i) => `${i.sku}:${i.cls}:${i.aging}`)).toEqual(['S1:A:active', 'S2:A:active', 'S3:B:slow', 'S4:B:active', 'S5:C:obsolete', 'S6:C:active']);
    expect(r.byClass.A).toEqual({ count: 2, amount: Y(1_300_000), usage: Y(8_000_000) });
    expect([r.slow, r.obsolete, r.release]).toEqual([Y(300_000), Y(150_000), Y(450_000)]);
  });
  it('供应商账期与供应链金融测算', () => {
    const s = supplierTerms(F.wcAp, F.AS_OF, t);
    expect(s.map((x) => [x.supplier, x.open, x.avgTermDays, x.dueIn30, x.status])).toEqual([
      ['供应商A', Y(600_000), 45, Y(600_000), 'watch'], ['供应商B', Y(400_000), 30, Y(300_000), 'ok'], ['供应商C', Y(400_000), 60, 0, 'ok'],
    ]);
    const o = scfOptions({ ar: F.agingAr, ap: F.wcAp, inventory: Y(2_000_000), cogs: Y(2_100_000), days: 30, asOf: F.AS_OF, th: t });
    expect(o.map((x) => [x.id, x.cashEffect, x.annualCost])).toEqual([
      ['reverse_factoring', Y(2_100_000), Y(84_000)], ['receivables_factoring', Y(920_000), Y(36_800)],
      ['dynamic_discounting', Y(-900_000), Y(-9_000)], ['inventory_finance', Y(1_000_000), Y(40_000)],
    ]);
  });
});

describe('E7 投融资', () => {
  const t = th('investments');
  it('投资盘点：浮盈亏、合规、集中度、到期梯度、加权收益率', () => {
    const p = portfolio(F.investments, F.AS_OF, t);
    expect(p.totals).toEqual({ cost: Y(5_000_000), marketValue: Y(4_661_000), pnl: Y(-339_000) });
    expect(p.lines.map((l) => `${l.id}:${l.status}`)).toEqual(['I1:ok', 'I2:ok', 'I3:watch', 'I4:breach', 'I5:ok']);
    expect(p.lines[3].flags).toHaveLength(3);
    expect(p.issuers[0]).toMatchObject({ issuer: '招商银行', status: 'breach' });
    expect(p.ladder.map((x) => [x.bucket, x.marketValue])).toEqual([['d30', Y(1_010_000)], ['d90', 0], ['d180', 0], ['d365', Y(1_880_000)], ['y1plus', Y(1_090_000)], ['open', Y(681_000)]]);
    expect(p.weightedYield).toBeCloseTo(143_478 / 4_481_000, 12);
  });
  it('流动性指标', () => {
    const l = liquidity({ balances: F.balances.filter((b) => b.currency === 'CNY'), investments: F.investments, loans: F.loans, facilities: F.facilities, metrics: F.metrics[0], asOf: F.AS_OF, th: t });
    expect([l.cash, l.liquidInvestments, l.unusedFacilities, l.available, l.debtDue12m]).toEqual([Y(2_030_000), Y(1_511_000), Y(3_200_000), Y(6_741_000), Y(3_000_000)]);
    expect(l.currentRatio).toBeCloseTo(1.5, 12);
    expect(l.quickRatio).toBeCloseTo(1.125, 12);
    expect(l.coverage).toBeCloseTo(3_541_000 / 3_000_000, 12);
    expect(l.facilityUtilization).toBeCloseTo(0.6, 12);
    expect(l.statuses).toEqual({ current: 'ok', quick: 'ok', coverage: 'watch', facility: 'ok' });
  });
});
