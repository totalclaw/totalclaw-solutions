/**
 * 批次 5（fpa）规则引擎金标准：期望数字见 __fixtures__/fpa/fpa.ts 的手算注释。
 */
import { describe, expect, it } from 'vitest';
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import type { FaJournalRow } from '@totalclaw/ipc-contracts';
import { actualsFromJournal, analyzeBudget } from '../../../financeAgent/budget';
import { buildStatements } from '../../../financeAgent/statements';
import * as F from '../../__fixtures__/fpa/fpa';
import { kpiXlsx, pvXlsx } from '../../__fixtures__/fpa/toXlsx';
import { inspectFile, readAndParse } from '../../intake';
import { budgetMetrics, finMetrics, metricAlerts, ratios } from './metrics';
import { evalKpis } from './kpi';
import { budgetExecution, budgetLines, priceVolume } from './budget';
import { costCenters, expenseRatios } from './cost';
import { seriesStats } from './trend';
import { esgCompleteness, esgQuality, matchIndicator, materiality } from './esg';
import { deviationOf, riskScore } from './strategy';
import { thresholdsFor } from '../../thresholds';

const Y = (yuan: number) => Math.round(yuan * 100);

describe('fpa · 财务指标（D1 / D3 / D10）', () => {
  const cur = finMetrics(F.tb, 'cn');
  const prior = finMetrics(F.tbPrior, 'cn');

  it('本期指标与手算一致，每个指标带余额表行号', () => {
    for (const k of ['revenue', 'cogs', 'grossProfit', 'opex', 'incomeTax', 'netProfit', 'totalAssets', 'totalLiabilities', 'equity', 'cash', 'currentAssets', 'currentLiabilities'] as const) {
      expect(cur.m[k], k).toBe(F.expected[k]);
    }
    expect(cur.m.totalAssets).toBe(cur.m.totalLiabilities + cur.m.equity);
    expect(cur.rows.revenue).toEqual([14]);
    expect(cur.rows.cash).toEqual([2, 3]);
  });

  it('上期（损益已结转）按本期发生取数', () => {
    expect(prior.m.revenue).toBe(F.expected.prior.revenue);
    expect(prior.m.grossProfit).toBe(F.expected.prior.grossProfit);
    expect(prior.m.opex).toBe(F.expected.prior.opex);
    expect(prior.m.netProfit).toBe(F.expected.prior.netProfit);
    expect(prior.m.totalAssets).toBe(F.expected.prior.totalAssets);
  });

  it('比率：毛利率 30%、净利率 8.25%、费用率 19%、资产负债率 39.22%、流动比率 1.56', () => {
    const r = ratios(cur.m);
    expect(r.grossMargin).toBeCloseTo(0.3, 10);
    expect(r.netMargin).toBeCloseTo(0.0825, 10);
    expect(r.expenseRatio).toBeCloseTo(0.19, 10);
    expect(r.debtRatio).toBeCloseTo(475000 / 1211250, 10);
    expect(r.currentRatio).toBeCloseTo(741250 / 475000, 10);
  });

  it('净利润与财务智能体 buildStatements 利润表一致（只读复用的交叉核对）', () => {
    const st = buildStatements(F.tb.map((r) => ({ code: r.accountCode, name: r.accountName, openingDebit: r.openingDr / 100, openingCredit: r.openingCr / 100, debit: r.periodDr / 100, credit: r.periodCr / 100, closingDebit: r.closingDr / 100, closingCredit: r.closingCr / 100 })), []);
    expect(Math.round((st.income.find((l) => l.key === 'netProfit')?.current || 0) * 100)).toBe(cur.m.netProfit);
  });

  it('预警：只有毛利率下降 3.33 个百分点一条黄色（收入短缺 3.85% 不升级，费用增长慢于收入）', () => {
    const bud = budgetMetrics(F.budget, 'cn');
    expect(bud.m.revenue).toBe(Y(520000));
    expect(bud.m.opex).toBe(Y(94000));
    const alerts = metricAlerts(cur.m, prior.m, bud.m, thresholdsFor('mgmt-report'));
    expect(alerts.map((a) => [a.id, a.level])).toEqual([['gross_margin_drop', 'yellow']]);
  });

  it('预警阳性对照：亏损、资产负债率 > 70%、流动比率 < 1、收入短缺 > 20% 都是红色', () => {
    const m = { ...cur.m, netProfit: -1, totalLiabilities: Y(1000000), currentLiabilities: Y(1000000), revenue: Y(300000) };
    const ids = metricAlerts(m, null, { revenue: Y(520000) }, thresholdsFor('mgmt-report')).filter((a) => a.level === 'red').map((a) => a.id);
    expect(ids).toEqual(['net_loss', 'debt_ratio', 'current_ratio', 'revenue_short']);
  });
});

describe('fpa · KPI（D2）', () => {
  const ev = evalKpis(F.kpis, thresholdsFor('kpi'), F.PERIOD);
  const by = (n: string) => ev.find((e) => e.indicator === n)!;

  it('达成率、红黄绿、连续未达标、累计达成', () => {
    expect(by('营业收入').achievement).toBeCloseTo(50 / 52, 10);
    expect(by('营业收入').level).toBe('yellow');
    expect(by('营业收入').consecutiveMisses).toBe(3);
    expect(by('营业收入').ytdTarget).toBe(150);
    expect(by('营业收入').ytdActual).toBe(142);
    expect(by('毛利率').level).toBe('yellow');
    expect(by('毛利率').ytdAchievement).toBeNull();
    expect(by('应收账款周转天数').achievement).toBeCloseTo(0.75, 10);
    expect(by('应收账款周转天数').level).toBe('red');
    expect(by('客户满意度').level).toBe('green');
    expect(by('客户满意度').consecutiveMisses).toBe(0);
  });
});

describe('fpa · 预算（D4）', () => {
  const th = thresholdsFor('budget');
  const out = budgetExecution({ budget: F.budget, journal: F.journal, commitments: F.commitments, period: F.PERIOD, basis: 'cn', th });
  const by = (c: string) => out.rows.find((r) => r.category === c)!;

  it('执行率与财务智能体 analyzeBudget 对同一数据的结果一致', () => {
    const faJournal: FaJournalRow[] = F.journal.map((r) => ({ date: r.date, voucherNo: r.voucherNo, summary: r.summary, accountCode: r.accountCode, accountName: r.accountName, debit: r.debit / 100, credit: r.credit / 100, dept: r.dept }));
    const lines = budgetLines(F.budget, '2026').filter((l) => !['主营业务收入', '主营业务成本'].includes(l.category));
    const fa = analyzeBudget(lines, actualsFromJournal(faJournal, 2026), 9);
    for (const r of fa) {
      expect(by(r.category).usage, r.category).toBe(r.usage);
      expect(by(r.category).actual, r.category).toBe(Math.round(r.actual * 100));
      expect(by(r.category).budget, r.category).toBe(Math.round(r.budget * 100));
    }
    expect(fa.length).toBe(3);
  });

  it('销售费用超 14.29%：财务总监；管理费用 90.91% 黄、含承诺 98.18%；财务费用超 25%：CEO 并升级', () => {
    expect(by('销售费用').usage).toBeCloseTo(1.142857, 6);
    expect(by('销售费用').level).toBe('over');
    expect(by('销售费用').approval).toBe('director');
    expect(by('销售费用').escalate).toBe(false);
    expect(by('管理费用').level).toBe('warn');
    expect(by('管理费用').band).toBe('near');
    expect(by('管理费用').usageWithCommit).toBeCloseTo(54000 / 55000, 10);
    expect(by('财务费用').approval).toBe('ceo');
    expect(by('财务费用').escalate).toBe(true);
  });

  it('收入类预算按同一口径另算：500,000 / 520,000 = 96.15%，短缺 3.85% 不升级', () => {
    expect(by('主营业务收入').nature).toBe('revenue');
    expect(by('主营业务收入').actual).toBe(Y(500000));
    expect(by('主营业务收入').usage).toBeCloseTo(0.9615, 4);
    expect(by('主营业务收入').escalate).toBe(false);
  });

  it('量差价差：量差 8,750、价差 −3,750、合计 5,000', () => {
    const [v] = priceVolume(F.pvBudget, th);
    expect([v.qtyVar, v.priceVar, v.totalVar]).toEqual([Y(8750), Y(-3750), Y(5000)]);
  });
});

describe('fpa · 成本（D5）', () => {
  it('标准成本差异：材料 500 / −220、人工 1,000 / 440、制造费用 300 / 210；三项都超 5% 标注', () => {
    const v = priceVolume(F.pvCost, thresholdsFor('cost'));
    expect(v.map((x) => [x.qtyVar, x.priceVar, x.totalVar])).toEqual([[Y(500), Y(-220), Y(280)], [Y(1000), Y(440), Y(1440)], [Y(300), Y(210), Y(510)]]);
    expect(v.every((x) => x.flagged && x.qtyVar + x.priceVar === x.totalVar)).toBe(true);
  });

  it('费用率归因：只有销售费用（增长 14.29% 快于收入 11.11%）被标注', () => {
    const er = expenseRatios(finMetrics(F.tb, 'cn').m, finMetrics(F.tbPrior, 'cn').m, thresholdsFor('cost'));
    expect(er.filter((x) => x.flagged).map((x) => x.key)).toEqual(['selling']);
    expect(er.find((x) => x.key === 'opex')!.ratio).toBeCloseTo(0.19, 10);
  });

  it('成本中心：共同费用 25,000 按直接费用分摊（复用财务智能体 allocate），分出去的合计等于共同费用', () => {
    const cc = costCenters(F.journal, F.PERIOD, 'cn');
    expect(cc.shared).toBe(Y(25000));
    expect(Object.fromEntries(cc.rows.map((r) => [r.center, r.total]))).toEqual(F.expected.centers);
    expect(cc.rows.reduce((s, r) => s + r.allocated, 0)).toBe(cc.shared);
  });
});

describe('fpa · 趋势 / ESG / 战略（D6 / D8 / D9）', () => {
  it('趋势：最近一期 200、环比 56.25%、上升、2026-09 是异常点', () => {
    const [s] = seriesStats(F.series, thresholdsFor('insight'));
    expect([s.last, s.prev]).toEqual([200, 128]);
    expect(s.changePct).toBeCloseTo(0.5625, 10);
    expect(s.trend).toBe('up');
    expect(s.anomalies.map((a) => a.period)).toEqual(['2026-09']);
    expect(s.anomalies[0].z).toBeCloseTo(59.5 / Math.sqrt(505.75), 6);
    expect(s.seasonality).toBeNull();
  });

  it('ESG 完整性：ISSB 缺范围三；GRI 缺 4 项；缺单位 1 条；关键词取最长命中', () => {
    expect(esgCompleteness(F.esg, 'issb').filter((c) => !c.present).map((c) => c.id)).toEqual(['scope3']);
    expect(esgCompleteness(F.esg, 'gri').filter((c) => !c.present).map((c) => c.id)).toEqual(['water', 'waste', 'gender', 'anticorruption']);
    expect(esgQuality(F.esg, thresholdsFor('esg')).map((q) => q.code)).toEqual(['no_unit']);
    expect(matchIndicator('员工离职率')).toBe('turnover');
    expect(matchIndicator('员工人数')).toBe('employees');
    expect(materiality(4, 2, thresholdsFor('esg'))).toEqual({ material: true, quadrant: 'impact' });
    expect(materiality(2, 2, thresholdsFor('esg'))).toEqual({ material: false, quadrant: 'monitor' });
  });

  it('战略偏差：收入 −15% 中度、海外占比 −40% 重度、研发正常；风险评分 4×4=16 高', () => {
    const th = thresholdsFor('strategy');
    const ev = evalKpis(F.objectives, thresholdsFor('kpi'));
    expect(ev.map((e) => deviationOf(e, th).level)).toEqual(['moderate', 'severe', 'on_track']);
    expect(riskScore(4, 4, th)).toEqual({ score: 16, level: 'high' });
    expect(riskScore(3, 3, th)).toEqual({ score: 9, level: 'medium' });
    expect(riskScore(9, 0, th)).toEqual({ score: 5, level: 'low' });
  });
});

describe('fpa · 数据接入（KPI 表 / 量价表，三语表头）', () => {
  const dir = mkdtempSync(join(tmpdir(), 'fau-fpa-intake-'));
  it.each(['zh', 'en', 'ar'] as const)('KPI 表 %s 表头自动识别，方向与期间解析正确', (lang) => {
    const p = kpiXlsx(join(dir, `kpi-${lang}.xlsx`), [...F.kpis, ...F.esg], lang);
    const ins = inspectFile(p, 'kpi');
    expect(ins.missing).toEqual([]);
    const { rows } = readAndParse(p, 'kpi', undefined, ins.mapping, { period: F.PERIOD }) as { rows: typeof F.kpis };
    expect(rows).toHaveLength(F.kpis.length + F.esg.length);
    expect(rows.find((r) => r.indicator === '应收账款周转天数')!.direction).toBe('lower');
    expect(rows.find((r) => r.indicator === '营业收入')!.period).toBe('2026-07');
    expect(rows.find((r) => r.indicator === '员工人数')!.period).toBe('2026');
    expect(rows[0].row).toBe(2);
  });

  it('量价表：成本要素识别，数量单价按原值', () => {
    const p = pvXlsx(join(dir, 'pv.xlsx'), F.pvCost);
    const ins = inspectFile(p, 'price_volume');
    expect(ins.missing).toEqual([]);
    const { rows } = readAndParse(p, 'price_volume', undefined, ins.mapping, { period: F.PERIOD }) as { rows: typeof F.pvCost };
    expect(rows.map((r) => r.element)).toEqual(['material', 'labor', 'overhead']);
    expect(rows[0]).toMatchObject({ stdQty: 1000, stdPrice: 5, actualQty: 1100, actualPrice: 4.8 });
  });
});
