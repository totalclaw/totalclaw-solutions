/**
 * 两个规则型模块：D4 预算管理、D5 成本控制。全部由代码计算，不调用模型（第 4.1 节原型 R）。
 */
import { i18nKey, tIn } from '@totalclaw/i18n';
import type { FauFpaAlert, FauFpaResult, FauFpaTable, FauReminder } from '@totalclaw/ipc-contracts';
import type { RunCtx } from '../../runner';
import type { PvElement } from '../../fpaTypes';
import { fpaRunner, sub } from './base';
import { APPROVAL_LABELS, BAND_LABELS, budgetExecution, priceVolume, type PvVariance } from './budget';
import { SHARED_CENTER, costCenters, expenseRatios } from './cost';
import { METRIC_LABELS, finMetrics } from './metrics';
import { col, fpaPeriod, sourceText, sourcesOf } from './kit';

const LEVEL = { ok: 'green', warn: 'yellow', over: 'red' } as const;
const NATURE_LABELS = { expense: i18nKey('费用类'), revenue: i18nKey('收入类') };
export const ELEMENT_LABELS: Record<PvElement, string> = { material: i18nKey('直接材料'), labor: i18nKey('直接人工'), overhead: i18nKey('制造费用'), other: i18nKey('其他要素') };
const labelOf = (ctx: RunCtx, slot: string) => ctx.datasets(slot).map((d) => d.label).join(', ');

function pvTable(rows: PvVariance[], ds: string, id: string, title: string, stdLabel: string): FauFpaTable {
  return {
    id, title,
    columns: [col('item', i18nKey('成本项目')), col('element', i18nKey('成本要素'), 'label'), col('center', i18nKey('成本中心')), col('std', stdLabel, 'amount'), col('actual', i18nKey('实际成本'), 'amount'),
      col('qtyVar', i18nKey('数量 / 效率差异'), 'amount'), col('priceVar', i18nKey('价格 / 工资率 / 耗费差异'), 'amount'), col('totalVar', i18nKey('总差异'), 'amount'), col('varPct', i18nKey('差异率'), 'pct'),
      col('flag', i18nKey('标注'), 'label'), col('source', i18nKey('来源'))],
    rows: rows.map((r) => ({
      item: r.item, element: ELEMENT_LABELS[r.element], center: r.costCenter, std: r.stdCost, actual: r.actualCost, qtyVar: r.qtyVar, priceVar: r.priceVar, totalVar: r.totalVar, varPct: r.varPct,
      flag: r.flagged ? i18nKey('超过重点说明阈值') : '', source: sourceText(ds, [r.row]),
    })),
  };
}

const pvIdentity = (rows: PvVariance[]) => rows.every((r) => r.qtyVar + r.priceVar === r.totalVar && r.actualCost - r.stdCost === r.totalVar);

// ── D4 预算管理 ────────────────────────────────────────────────────────────

export const budgetRunner = fpaRunner({
  subs: () => ['compute'],
  validate(ctx, report) {
    const year = fpaPeriod(ctx).slice(0, 4);
    if (!ctx.rows<'budget'>('budget').some((b) => !b.period || b.period.startsWith(year))) {
      report.blockers.push({ id: 'budget_year', level: 'block', code: 'budget_year', message: { key: i18nKey('预算表里没有 {p0} 年的预算'), params: { p0: year } } });
    }
  },
  async analyze(ctx) {
    const th = ctx.th('budget');
    const period = fpaPeriod(ctx);
    const { rows } = await sub(ctx, 'compute', () => budgetExecution({
      budget: ctx.rows<'budget'>('budget'), journal: ctx.rows<'journal'>('journal'), commitments: ctx.run.inputs.commitments?.length ? ctx.rows<'budget'>('commitments') : [],
      period, basis: ctx.profile.reportBasis, accountMap: ctx.company.accountMap, th,
    }));
    const ds = labelOf(ctx, 'budget');
    const tables: FauFpaTable[] = [{
      id: 'execution', title: i18nKey('预算执行监控'),
      columns: [col('category', i18nKey('预算项目')), col('nature', i18nKey('项目类型'), 'label'), col('budget', i18nKey('累计预算'), 'amount'), col('actual', i18nKey('累计实际'), 'amount'), col('committed', i18nKey('已承诺'), 'amount'),
        col('usage', i18nKey('执行率'), 'pct'), col('usageWithCommit', i18nKey('含承诺执行率'), 'pct'), col('level', i18nKey('预警'), 'level'), col('band', i18nKey('执行率分档'), 'label'),
        col('overPct', i18nKey('超支 / 短缺比例'), 'pct'), col('approval', i18nKey('审批层级'), 'label'), col('source', i18nKey('来源'))],
      rows: rows.map((r) => ({
        category: r.category, nature: NATURE_LABELS[r.nature], budget: r.budget, actual: r.actual, committed: r.committed, usage: r.usage, usageWithCommit: r.usageWithCommit,
        level: LEVEL[r.level], band: BAND_LABELS[r.band], overPct: r.overPct, approval: r.approval ? APPROVAL_LABELS[r.approval] : '', source: sourceText(ds, r.rows),
      })),
    }];
    const pv = ctx.run.inputs.pv?.length ? priceVolume(ctx.rows<'price_volume'>('pv'), th, 'overrun.tier1Pct') : [];
    if (pv.length) tables.push(pvTable(pv, labelOf(ctx, 'pv'), 'pv', i18nKey('量差价差分解'), i18nKey('预算成本')));
    if (ctx.run.modeId === 'adjustment') {
      tables.push({
        id: 'adjustment', title: i18nKey('预算调整审核要点'),
        columns: [col('category', i18nKey('预算项目')), col('need', i18nKey('建议调整额'), 'amount'), col('adjustPct', i18nKey('调整幅度'), 'pct'), col('approval', i18nKey('审批层级'), 'label'), col('points', i18nKey('审核要点'), 'label')],
        rows: rows.filter((r) => r.nature === 'expense' && r.actual + r.committed > r.budget).map((r) => {
          const need = r.actual + r.committed - r.budget;
          const pct = r.budget ? need / r.budget : null;
          return {
            category: r.category, need, adjustPct: pct, approval: APPROVAL_LABELS[r.approval || 'dept'],
            points: pct != null && pct > (th['adjust.largePct'] ?? 0.3) ? i18nKey('调整幅度过大：预算基础有重大变化，评估后批准或否决') : i18nKey('核实超支理由、资金来源与对其他部门的影响，可附条件批准'),
          };
        }),
      });
    }
    const alerts: FauFpaAlert[] = rows.filter((r) => r.level !== 'ok').map((r) => ({
      id: `budget:${r.category}`, level: r.escalate || r.level === 'over' ? 'red' : 'yellow',
      message: { key: r.nature === 'revenue' ? i18nKey('{p0} 收入达成 {p1}') : i18nKey('{p0} 执行率 {p1}'), params: { p0: r.category, p1: `${(r.usage * 100).toFixed(2)}%` } },
    }));
    const escalated = rows.filter((r) => r.escalate);
    const reminders: FauReminder[] = escalated.map((r) => ({
      id: `budget:esc:${r.category}`, source: 'escalation', level: 'warn',
      message: { key: r.nature === 'revenue' ? i18nKey('{p0} 收入低于预算 {p1}，须升级') : i18nKey('{p0} 超预算 {p1}，须升级'), params: { p0: r.category, p1: `${((r.overPct || 0) * 100).toFixed(2)}%` } },
    }));
    const res: FauFpaResult = {
      moduleId: 'budget', period, tables, narratives: [], alerts, sources: sourcesOf(ctx),
      charts: [{ id: 'usage', title: i18nKey('预算执行率'), unit: 'pct', labels: rows.map((r) => r.category), series: [{ name: i18nKey('执行率'), values: rows.map((r) => r.usage) }] }],
      checks: [
        { id: 'actuals', ok: rows.every((r) => r.actual !== 0), message: { key: i18nKey('每个预算项目都归集到了实际数') } },
        ...(pv.length ? [{ id: 'pv_identity', ok: pvIdentity(pv), message: { key: i18nKey('量差 + 价差 = 总差异') } }] : []),
      ],
    };
    return {
      result: res, reminders, approveRequired: escalated.length > 0,
      summary: { key: i18nKey('{n} 个预算项目，超预算 {m} 个，升级 {k} 个'), params: { n: rows.length, m: rows.filter((r) => r.level === 'over').length, k: escalated.length } },
    };
  },
  outputs: () => ({ title: i18nKey('预算执行与差异分析') }),
});

// ── D5 成本控制 ────────────────────────────────────────────────────────────

export const costRunner = fpaRunner({
  subs: () => ['compute'],
  async analyze(ctx) {
    const th = ctx.th('cost');
    const period = fpaPeriod(ctx);
    const tables: FauFpaTable[] = [];
    const alerts: FauFpaAlert[] = [];
    const checks: FauFpaResult['checks'] = [];
    const charts: FauFpaResult['charts'] = [];
    await sub(ctx, 'compute', () => {
      if (ctx.run.modeId === 'standard') {
        const pv = priceVolume(ctx.rows<'price_volume'>('pv'), th);
        tables.push(pvTable(pv, labelOf(ctx, 'pv'), 'variance', i18nKey('标准成本差异'), i18nKey('标准成本')));
        const els = [...new Set(pv.map((r) => r.element))];
        tables.push({
          id: 'byElement', title: i18nKey('按成本要素汇总'),
          columns: [col('element', i18nKey('成本要素'), 'label'), col('std', i18nKey('标准成本'), 'amount'), col('actual', i18nKey('实际成本'), 'amount'), col('qtyVar', i18nKey('数量 / 效率差异'), 'amount'), col('priceVar', i18nKey('价格 / 工资率 / 耗费差异'), 'amount'), col('totalVar', i18nKey('总差异'), 'amount')],
          rows: els.map((e) => {
            const xs = pv.filter((r) => r.element === e);
            const s = (k: 'stdCost' | 'actualCost' | 'qtyVar' | 'priceVar' | 'totalVar') => xs.reduce((a, r) => a + r[k], 0);
            return { element: ELEMENT_LABELS[e], std: s('stdCost'), actual: s('actualCost'), qtyVar: s('qtyVar'), priceVar: s('priceVar'), totalVar: s('totalVar') };
          }),
        });
        alerts.push(...pv.filter((r) => r.flagged).map((r) => ({ id: `cost:${r.row}`, level: 'yellow' as const, message: { key: i18nKey('{p0} 成本差异率 {p1}'), params: { p0: r.item, p1: `${((r.varPct || 0) * 100).toFixed(2)}%` } } })));
        checks.push({ id: 'pv_identity', ok: pvIdentity(pv), message: { key: i18nKey('数量差异 + 价格差异 = 总差异') } });
        charts.push({ id: 'variance', title: i18nKey('成本差异'), unit: 'amount', labels: pv.map((r) => r.item), series: [{ name: i18nKey('总差异'), values: pv.map((r) => r.totalVar) }] });
      } else if (ctx.run.modeId === 'ratio') {
        const basis = ctx.profile.reportBasis;
        const cur = finMetrics(ctx.rows<'tb'>('tb'), basis, ctx.company.accountMap).m;
        const prior = finMetrics(ctx.rows<'tb'>('tbPrior'), basis, ctx.company.accountMap).m;
        const er = expenseRatios(cur, prior, th);
        tables.push({
          id: 'ratios', title: i18nKey('费用率归因'),
          columns: [col('metric', i18nKey('费用项目'), 'label'), col('current', i18nKey('本期数'), 'amount'), col('prior', i18nKey('上期数'), 'amount'), col('ratio', i18nKey('费用率'), 'pct'), col('priorRatio', i18nKey('上期费用率'), 'pct'),
            col('ratioChange', i18nKey('变化（百分点）'), 'pct'), col('growth', i18nKey('增长率'), 'pct'), col('revenueGrowth', i18nKey('收入增长率'), 'pct'), col('flag', i18nKey('标注'), 'label')],
          rows: er.map((x) => ({ metric: METRIC_LABELS[x.key], current: x.current, prior: x.prior, ratio: x.ratio, priorRatio: x.priorRatio, ratioChange: x.ratioChange, growth: x.growth, revenueGrowth: x.revenueGrowth, flag: x.flagged ? i18nKey('增长快于收入或费用率上升') : '' })),
        });
        alerts.push(...er.filter((x) => x.flagged).map((x) => ({ id: `ratio:${x.key}`, level: 'yellow' as const, message: { key: i18nKey('{p0} 增长快于收入或费用率上升'), params: { p0: tIn(ctx.locale, METRIC_LABELS[x.key]) } } })));
        charts.push({ id: 'ratio', title: i18nKey('费用率'), unit: 'pct', labels: er.map((x) => METRIC_LABELS[x.key]), labelKeys: true, series: [{ name: i18nKey('本期数'), values: er.map((x) => x.ratio) }, { name: i18nKey('上期数'), values: er.map((x) => x.priorRatio) }] });
      } else {
        const cc = costCenters(ctx.rows<'journal'>('journal'), period, ctx.profile.reportBasis, ctx.company.accountMap);
        const ds = labelOf(ctx, 'journal');
        tables.push({
          id: 'centers', title: i18nKey('成本中心绩效'),
          columns: [col('center', i18nKey('成本中心')), col('direct', i18nKey('直接费用'), 'amount'), col('allocated', i18nKey('分摊共同费用'), 'amount'), col('total', i18nKey('费用合计'), 'amount'), col('share', i18nKey('占比'), 'pct'), col('source', i18nKey('来源'))],
          rows: [...cc.rows.map((r) => ({ center: r.center, direct: r.direct, allocated: r.allocated, total: r.total, share: r.share, source: sourceText(ds, r.rows) })),
            ...(cc.shared ? [{ center: SHARED_CENTER, direct: cc.shared, allocated: -cc.shared, total: 0, share: 0, source: sourceText(ds, cc.sharedRows) }] : [])],
        });
        checks.push({ id: 'alloc', ok: cc.rows.reduce((s, r) => s + r.allocated, 0) === (cc.rows.length ? cc.shared : 0), message: { key: i18nKey('分出去的共同费用合计等于共同费用') } });
        charts.push({ id: 'centers', title: i18nKey('成本中心费用'), unit: 'amount', labels: cc.rows.map((r) => r.center), series: [{ name: i18nKey('费用合计'), values: cc.rows.map((r) => r.total) }] });
      }
    });
    const res: FauFpaResult = { moduleId: 'cost', period, tables, narratives: [], alerts, sources: sourcesOf(ctx), charts, checks };
    return { result: res, summary: { key: i18nKey('{n} 张分析表，标注 {m} 项'), params: { n: tables.length, m: alerts.length } } };
  },
  outputs: () => ({ title: i18nKey('成本控制报告') }),
});
