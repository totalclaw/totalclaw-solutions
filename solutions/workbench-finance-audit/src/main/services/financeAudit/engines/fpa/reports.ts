/**
 * 以科目余额表为底的三个模块：D1 管理报告、D3 财务分析、D10 投资者关系。
 * 指标、差异、比率、预警全部由 metrics.ts 计算；模型只写说明，说明里的数字回核到这些结果（或已公告的原文）。
 * D1 的每个数字都带「数据集 + 行号」来源，并标出数据集是否已被本项目里某次签核归档的运行引用。
 */
import { i18nKey, tIn } from '@totalclaw/i18n';
import type { FaBalanceRow, FauFpaChart, FauFpaResult, FauFpaTable, FauReminder, FauVerificationItem } from '@totalclaw/ipc-contracts';
import { buildStatements } from '../../../financeAgent/statements';
import type { RunCtx } from '../../runner';
import type { BudgetRow, TbRow } from '../../types';
import type { KpiRow } from '../../fpaTypes';
import { IR_TASK, irSchema, ANALYSIS_TASK, analysisSchema, MGMT_TASK, mgmtSchema, REF_JUDGEMENT } from '../../prompts/fpa';
import { yuan } from '../accounting/common';
import { fmtAmount } from '../../outputs/common';
import { fpaRunner, sub } from './base';
import { evalKpis } from './kpi';
import { expenseRatios } from './cost';
import { METRIC_LABELS, RATIO_LABELS, budgetMetrics, finMetrics, metricAlerts, ratios, type FinMetrics, type MetricKey } from './metrics';
import { col, docsOf, facts, fpaPeriod, narrate, quoteFound, sourceText, sourcesOf, toNarratives, verifyText, type Facts, type LoadedDoc } from './kit';
import { kpiTable } from './indicators';

const toFa = (r: TbRow): FaBalanceRow => ({
  code: r.accountCode, name: r.accountName,
  openingDebit: r.openingDr / 100, openingCredit: r.openingCr / 100, debit: r.periodDr / 100, credit: r.periodCr / 100,
  closingDebit: r.closingDr / 100, closingCredit: r.closingCr / 100,
});

const y = (c: number | null | undefined) => (c == null ? null : yuan(c));
const p2 = (r: number | null | undefined) => (r == null ? null : Math.round(r * 10000) / 100);

export interface TbBlock {
  cur: FinMetrics;
  prior: FinMetrics | null;
  budget: Partial<FinMetrics> | null;
  tables: FauFpaTable[];
  chart: FauFpaChart;
  alerts: ReturnType<typeof metricAlerts>;
  checks: FauFpaResult['checks'];
  facts: Facts;
  /** 交给模型的数据（元 / 百分数） */
  llm: Record<string, unknown>;
}

/** 本期 / 比较期 / 预算的指标表、比率表、偿债能力表、图表、预警与自检 */
export function tbBlock(ctx: RunCtx, keys: MetricKey[], thModule: string, priorLabel = i18nKey('上期数')): TbBlock {
  const basis = ctx.profile.reportBasis;
  const map = ctx.company.accountMap;
  const tb = ctx.rows<'tb'>('tb');
  const tbPrior: TbRow[] | null = ctx.run.inputs.tbPrior?.length ? ctx.rows<'tb'>('tbPrior') : null;
  const budgetRows: BudgetRow[] | null = ctx.run.inputs.budget?.length ? ctx.rows<'budget'>('budget') : null;
  const tbLabel = ctx.datasets('tb').map((d) => d.label).join(', ');
  const cur = finMetrics(tb, basis, map);
  const prior = tbPrior ? finMetrics(tbPrior, basis, map) : null;
  const bud = budgetRows ? budgetMetrics(budgetRows, basis, map) : null;
  const th = ctx.th(thModule);
  const rowsM = keys.map((k) => {
    const c = cur.m[k];
    const pv = prior ? prior.m[k] : null;
    const bv = bud?.m[k] ?? null;
    return {
      metric: METRIC_LABELS[k], current: c, prior: pv, diffPrior: pv == null ? null : c - pv, diffPriorPct: pv ? (c - pv) / Math.abs(pv) : null,
      budget: bv, diffBudget: bv == null ? null : c - bv, achievement: bv ? c / bv : null, source: sourceText(tbLabel, cur.rows[k]),
    };
  });
  const r = ratios(cur.m);
  const pr = prior ? ratios(prior.m) : null;
  const pctKeys = (['grossMargin', 'netMargin', 'expenseRatio', 'debtRatio'] as const).filter((k) => r[k] != null || pr?.[k] != null);
  const metricsTable: FauFpaTable = {
    id: 'metrics', title: i18nKey('核心财务指标'),
    columns: [col('metric', i18nKey('指标'), 'label'), col('current', i18nKey('本期数'), 'amount'), col('prior', priorLabel, 'amount'), col('diffPrior', i18nKey('差额'), 'amount'),
      col('diffPriorPct', i18nKey('变动率'), 'pct'), col('budget', i18nKey('预算'), 'amount'), col('diffBudget', i18nKey('对预算差额'), 'amount'), col('achievement', i18nKey('预算达成率'), 'pct'), col('source', i18nKey('来源'))],
    rows: rowsM,
  };
  const ratioTable: FauFpaTable = {
    id: 'ratios', title: i18nKey('关键比率'),
    columns: [col('metric', i18nKey('指标'), 'label'), col('current', i18nKey('本期数'), 'pct'), col('prior', priorLabel, 'pct'), col('change', i18nKey('变化（百分点）'), 'pct')],
    rows: pctKeys.map((k) => ({ metric: RATIO_LABELS[k], current: r[k], prior: pr?.[k] ?? null, change: r[k] != null && pr?.[k] != null ? (r[k] as number) - (pr[k] as number) : null })),
  };
  const solvency: FauFpaTable = {
    id: 'solvency', title: i18nKey('偿债能力'),
    columns: [col('metric', i18nKey('指标'), 'label'), col('current', i18nKey('本期数'), 'num'), col('prior', priorLabel, 'num'), col('warn', i18nKey('预警线'), 'num')],
    rows: r.currentRatio == null ? [] : [{ metric: RATIO_LABELS.currentRatio, current: Math.round(r.currentRatio * 100) / 100, prior: pr?.currentRatio == null ? null : Math.round(pr.currentRatio * 100) / 100, warn: th['alert.currentRatioWarnRatio'] ?? 1.5 }],
  };
  const chartKeys = keys.filter((k) => ['revenue', 'grossProfit', 'opex', 'netProfit'].includes(k));
  const chart: FauFpaChart = {
    id: 'core', title: i18nKey('核心指标对比'), unit: 'amount', labels: chartKeys.map((k) => METRIC_LABELS[k]), labelKeys: true,
    series: [
      { name: i18nKey('本期数'), values: chartKeys.map((k) => cur.m[k]) },
      ...(prior ? [{ name: priorLabel, values: chartKeys.map((k) => prior.m[k]) }] : []),
      ...(bud ? [{ name: i18nKey('预算'), values: chartKeys.map((k) => bud.m[k] ?? null) }] : []),
    ],
  };
  const alerts = metricAlerts(cur.m, prior?.m || null, bud?.m || null, th);
  const balanced = tb.reduce((s, x) => s + x.closingDr - x.closingCr, 0);
  const checks: FauFpaResult['checks'] = [
    { id: 'tb_balanced', ok: Math.abs(balanced) <= 1, message: { key: i18nKey('科目余额表期末借贷平衡') } },
    { id: 'bs', ok: Math.abs(cur.m.totalAssets - cur.m.totalLiabilities - cur.m.equity) <= 1, message: { key: i18nKey('资产 = 负债 + 所有者权益') } },
  ];
  if (basis === 'cn') {
    // 交叉核对：和财务智能体 buildStatements 的利润表净利润一致（只读复用）
    const st = buildStatements(tb.map(toFa), []);
    const np = st.income.find((l) => l.key === 'netProfit');
    if (np) checks.push({ id: 'np_cross', ok: Math.abs(Math.round(np.current * 100) - cur.m.netProfit) <= 1, message: { key: i18nKey('净利润与财务智能体利润表口径一致') } });
  }
  const allCents = [...rowsM.flatMap((x) => [x.current, x.prior, x.diffPrior, x.budget, x.diffBudget])];
  const allRatios = [...rowsM.flatMap((x) => [x.diffPriorPct, x.achievement]), ...ratioTable.rows.flatMap((x) => [x.current as number | null, x.prior as number | null, x.change as number | null])];
  const llm = {
    metrics: rowsM.map((x, i) => ({ key: keys[i], label: tIn(ctx.locale, x.metric), current: y(x.current), prior: y(x.prior), diffPrior: y(x.diffPrior), diffPriorPct: p2(x.diffPriorPct), budget: y(x.budget), diffBudget: y(x.diffBudget), budgetAchievementPct: p2(x.achievement) })),
    ratios: ratioTable.rows.map((x) => ({ label: tIn(ctx.locale, String(x.metric)), currentPct: p2(x.current as number | null), priorPct: p2(x.prior as number | null) })),
    currentRatio: r.currentRatio == null ? null : Math.round(r.currentRatio * 100) / 100,
    alerts: alerts.map((a) => ({ level: a.level, text: tIn(ctx.locale, a.message.key, a.message.params) })),
  };
  const solvencyNums = solvency.rows.flatMap((x) => [x.current as number | null, x.prior as number | null]);
  return {
    cur: cur.m, prior: prior?.m || null, budget: bud?.m || null, tables: [metricsTable, ratioTable, ...(solvency.rows.length ? [solvency] : [])], chart, alerts, checks,
    facts: facts({ cents: allCents, ratios: allRatios, plain: solvencyNums }), llm,
  };
}

/** 数据来源没被签核：提醒项（签核人逐条确认已知悉） */
function unsignedReminders(res: FauFpaResult, prefix: string): FauReminder[] {
  return res.sources.filter((s) => !s.signed && s.kind !== 'evidence').map((s) => ({
    id: `${prefix}:unsigned:${s.datasetId}`, source: 'engine' as const, level: 'warn' as const,
    message: { key: i18nKey('数据集「{p0}」尚未被本项目里任何已签核归档的运行引用'), params: { p0: s.label } },
  }));
}

function mergeFacts(...fs: Facts[]): Facts {
  return { amounts: fs.flatMap((f) => f.amounts), percents: fs.flatMap((f) => f.percents) };
}

// ── D1 管理报告 ─────────────────────────────────────────────────────────────

const MGMT_HEADINGS: Record<string, string> = {
  overview: i18nKey('业绩概述'), profitability: i18nKey('盈利分析'), position: i18nKey('财务状况'), alerts: i18nKey('预警与行动'), outlook: i18nKey('下期关注'),
};

export const mgmtReportRunner = fpaRunner({
  subs: () => ['compute', 'narrate'],
  async analyze(ctx) {
    const keys: MetricKey[] = ['revenue', 'cogs', 'grossProfit', 'opex', 'incomeTax', 'netProfit', 'cash', 'totalAssets', 'totalLiabilities', 'equity'];
    const b = await sub(ctx, 'compute', () => tbBlock(ctx, keys, 'mgmt-report'));
    const kpiRows: KpiRow[] = ctx.run.inputs.kpi?.length ? ctx.rows<'kpi'>('kpi') : [];
    const kpis = kpiRows.length ? evalKpis(kpiRows, ctx.th('kpi'), fpaPeriod(ctx)) : [];
    const kt = kpis.length ? kpiTable(kpis, ctx.datasets('kpi').map((d) => d.label).join(', ')) : null;
    const kpiFacts = facts({ plain: kpis.flatMap((k) => [k.target, k.actual]), ratios: kpis.map((k) => k.achievement) });
    const f = mergeFacts(b.facts, kpiFacts);
    const out = await sub(ctx, 'narrate', () => narrate(ctx, {
      module: 'mgmt-report', skills: [{ name: 'fa-management-report-master', references: [REF_JUDGEMENT] }, { name: 'fa-management-commentary-writing' }],
      task: MGMT_TASK, data: { period: fpaPeriod(ctx), ...b.llm, kpis: kpis.map((k) => ({ indicator: k.indicator, unit: k.unit, target: k.target, actual: k.actual, achievementPct: p2(k.achievement), level: k.level })) },
      schema: mgmtSchema, texts: (o) => o.sections.map((s) => s.text), facts: f, userData: kpis.map((k) => k.indicator),
    }));
    const nar = toNarratives(out.data.sections.map((s) => ({ id: s.id, heading: MGMT_HEADINGS[s.id] || s.id, text: s.text })), f, 'mgmt');
    const res: FauFpaResult = {
      moduleId: 'mgmt-report', period: fpaPeriod(ctx), tables: [...b.tables, ...(kt ? [kt] : [])], narratives: nar.narratives, charts: [b.chart],
      alerts: b.alerts, sources: sourcesOf(ctx), checks: [...b.checks], handoffFrom: handoffsInto(ctx),
    };
    res.checks.push({ id: 'signed', ok: res.sources.filter((s) => s.kind !== 'evidence').every((s) => s.signed), message: { key: i18nKey('报告用到的数据集都已签核归档') } });
    res.checks.push({ id: 'verified', ok: nar.narratives.every((n) => n.status === 'verified'), message: { key: i18nKey('说明里的数字全部回核通过') } });
    return {
      result: res, verification: nar.verification, model: out.model, reminders: unsignedReminders(res, 'mgmt'),
      approveRequired: b.alerts.some((a) => a.level === 'red'),
      summary: { key: i18nKey('指标 {n} 项，预警 {a} 条，说明 {m} 段'), params: { n: keys.length, a: b.alerts.length, m: nar.narratives.length } },
    };
  },
  outputs: () => ({ title: i18nKey('管理报告') }),
});

/** 转交进本模块的已签核运行（第 4.3 节：A1 / D3 → D1 → D7） */
export function handoffsInto(ctx: RunCtx): { runId: string; moduleId: string }[] {
  return ctx.store.handoffs(ctx.company.id, ctx.project.id).filter((h) => h.toModuleId === ctx.run.moduleId).map((h) => ({ runId: h.fromRunId, moduleId: h.fromModuleId }));
}

// ── D3 财务分析 ─────────────────────────────────────────────────────────────

const ANALYSIS_HEADINGS: Record<string, string> = {
  revenue: i18nKey('收入分析'), margin: i18nKey('毛利分析'), expense: i18nKey('费用分析'), position: i18nKey('财务状况'), summary: i18nKey('改善建议'),
};

export const finAnalysisRunner = fpaRunner({
  subs: () => ['compute', 'narrate'],
  async analyze(ctx) {
    const keys: MetricKey[] = ['revenue', 'cogs', 'grossProfit', 'selling', 'admin', 'finance', 'rd', 'opex', 'netProfit', 'totalAssets', 'totalLiabilities'];
    const priorLabel = ctx.run.modeId === 'yoy' ? i18nKey('去年同期') : i18nKey('上期数');
    const b = await sub(ctx, 'compute', () => tbBlock(ctx, keys, 'fin-analysis', priorLabel));
    const er = expenseRatios(b.cur, b.prior, ctx.th('cost'));
    const expTable: FauFpaTable = {
      id: 'expense', title: i18nKey('费用结构'),
      columns: [col('metric', i18nKey('费用项目'), 'label'), col('current', i18nKey('本期数'), 'amount'), col('ratio', i18nKey('费用率'), 'pct'), col('priorRatio', priorLabel, 'pct'), col('growth', i18nKey('增长率'), 'pct'), col('flag', i18nKey('标注'), 'label')],
      rows: er.map((x) => ({ metric: METRIC_LABELS[x.key], current: x.current, ratio: x.ratio, priorRatio: x.priorRatio, growth: x.growth, flag: x.flagged ? i18nKey('增长快于收入或费用率上升') : '' })),
    };
    const f = mergeFacts(b.facts, facts({ ratios: er.flatMap((x) => [x.ratio, x.priorRatio, x.growth, x.revenueGrowth, x.ratioChange]) }));
    const out = await sub(ctx, 'narrate', () => narrate(ctx, {
      module: 'fin-analysis', skills: [{ name: 'fa-financial-analysis-master', references: [REF_JUDGEMENT] }, { name: 'fa-profit-analysis' }],
      task: ANALYSIS_TASK,
      data: { compare: ctx.run.modeId, period: fpaPeriod(ctx), ...b.llm, expenses: er.map((x) => ({ label: tIn(ctx.locale, METRIC_LABELS[x.key]), current: y(x.current), ratioPct: p2(x.ratio), priorRatioPct: p2(x.priorRatio), growthPct: p2(x.growth), revenueGrowthPct: p2(x.revenueGrowth) })) },
      schema: analysisSchema, texts: (o) => o.sections.map((s) => s.text), facts: f,
    }));
    const nar = toNarratives(out.data.sections.map((s) => ({ id: s.id, heading: ANALYSIS_HEADINGS[s.id] || s.id, text: s.text })), f, 'analysis');
    const res: FauFpaResult = {
      moduleId: 'fin-analysis', period: fpaPeriod(ctx), tables: [...b.tables, expTable], narratives: nar.narratives, charts: [b.chart],
      alerts: b.alerts, sources: sourcesOf(ctx), checks: [...b.checks, { id: 'verified', ok: nar.narratives.every((n) => n.status === 'verified'), message: { key: i18nKey('说明里的数字全部回核通过') } }],
    };
    return {
      result: res, verification: nar.verification, model: out.model,
      summary: { key: i18nKey('指标 {n} 项，预警 {a} 条，说明 {m} 段'), params: { n: keys.length, a: b.alerts.length, m: nar.narratives.length } },
    };
  },
  outputs: () => ({ title: i18nKey('财务分析报告') }),
});

// ── D10 投资者关系 ──────────────────────────────────────────────────────────

const IR_HEADINGS: Record<string, string> = { opening: i18nKey('开场'), highlights: i18nKey('业绩亮点'), outlook: i18nKey('展望'), closing: i18nKey('结束语') };
export const IR_STATEMENT = i18nKey('草稿：仅供内部准备，经批准后由人对外发布；非投资建议');

export const irRunner = fpaRunner({
  subs: () => ['compute', 'narrate', 'quotes'],
  async analyze(ctx) {
    const keys: MetricKey[] = ['revenue', 'grossProfit', 'opex', 'netProfit', 'cash', 'totalAssets', 'equity'];
    const b = await sub(ctx, 'compute', () => tbBlock(ctx, keys, 'fin-analysis'));
    const announcements: LoadedDoc[] = await docsOf(ctx, 'announcements');
    const feedbackDocs: LoadedDoc[] = await docsOf(ctx, 'feedback');
    const f = mergeFacts(b.facts, facts({ docs: announcements }));
    const out = await sub(ctx, 'narrate', () => narrate(ctx, {
      module: 'ir', skills: [{ name: 'fa-investor-relations-master', references: [REF_JUDGEMENT] }, { name: ctx.run.modeId === 'roadshow' ? 'fa-roadshow-material-preparation' : ctx.run.modeId === 'feedback' ? 'fa-investor-feedback-tracking' : 'fa-earnings-call-preparation' }, { name: 'fa-ir-disclosure-management' }],
      task: IR_TASK, data: { mode: ctx.run.modeId, period: fpaPeriod(ctx), ...b.llm },
      untrusted: [...announcements, ...feedbackDocs].map((d) => ({ name: d.name, text: d.text })),
      schema: irSchema, texts: (o) => [...o.script.map((s) => s.text), ...o.qa.flatMap((q) => [q.question, q.answer]), ...o.keyMessages], facts: f,
    }));
    const d = out.data;
    const nar = toNarratives(d.script.map((s) => ({ id: s.id, heading: IR_HEADINGS[s.id] || s.id, text: s.text })), f, 'ir');
    // 披露核对：问答与要点里的每个数字都必须已公开（在结果或公告原文里）
    const qaRows = d.qa.map((q, i) => { const c = verifyText(`${q.question} ${q.answer}`, f); return { no: i + 1, question: q.question, answer: q.answer, check: c.ok ? i18nKey('已核实') : i18nKey('未核实'), missing: c.missing.join(', ') }; });
    const msgRows = d.keyMessages.map((m, i) => { const c = verifyText(m, f); return { no: i + 1, message: m, check: c.ok ? i18nKey('已核实') : i18nKey('未核实'), missing: c.missing.join(', ') }; });
    const verification: FauVerificationItem[] = [
      ...nar.verification,
      ...qaRows.map((q) => ({ id: `ir:qa:${q.no}`, ref: `ir:qa:${q.no}`, text: `${q.question} ${q.answer}`, status: q.check === i18nKey('已核实') ? 'verified' as const : 'unverified' as const, missing: q.missing ? q.missing.split(', ') : undefined })),
      ...msgRows.map((m) => ({ id: `ir:msg:${m.no}`, ref: `ir:msg:${m.no}`, text: m.message, status: m.check === i18nKey('已核实') ? 'verified' as const : 'unverified' as const, missing: m.missing ? m.missing.split(', ') : undefined })),
    ];
    const feedback = await sub(ctx, 'quotes', () => d.feedback.filter((x) => quoteFound(feedbackDocs, x.quote)));
    const dropped = d.feedback.length - feedback.length;
    const tables: FauFpaTable[] = [
      ...b.tables,
      { id: 'qa', title: i18nKey('问答准备'), columns: [col('no', i18nKey('序号'), 'num'), col('question', i18nKey('问题')), col('answer', i18nKey('参考回答')), col('check', i18nKey('披露核对'), 'label'), col('missing', i18nKey('数据里找不到'))], rows: qaRows },
      { id: 'messages', title: i18nKey('关键信息'), columns: [col('no', i18nKey('序号'), 'num'), col('message', i18nKey('要点')), col('check', i18nKey('披露核对'), 'label'), col('missing', i18nKey('数据里找不到'))], rows: msgRows },
      ...(feedback.length ? [{ id: 'feedback', title: i18nKey('投资者反馈'), columns: [col('theme', i18nKey('主题')), col('quote', i18nKey('原文引用'))], rows: feedback.map((x) => ({ theme: x.theme, quote: x.quote })) }] : []),
    ];
    const res: FauFpaResult = {
      moduleId: 'ir', period: fpaPeriod(ctx), tables, narratives: nar.narratives, charts: [b.chart], alerts: b.alerts, sources: sourcesOf(ctx),
      checks: [...b.checks, { id: 'disclosure', ok: verification.every((v) => v.status === 'verified'), message: { key: i18nKey('材料里的数字都已公开（在结果或公告原文里）') } }],
    };
    const reminders: FauReminder[] = dropped ? [{ id: 'ir:dropped', source: 'engine', level: 'warn', message: { key: i18nKey('{n} 条投资者反馈的引用在原文里找不到，已丢弃'), params: { n: dropped } } }] : [];
    return { result: res, verification, model: out.model, reminders, summary: { key: i18nKey('问答 {n} 条，关键信息 {m} 条'), params: { n: qaRows.length, m: msgRows.length } } };
  },
  outputs(ctx, res) {
    const t = (k: string, p?: Record<string, string | number>) => tIn(ctx.locale, k, p);
    const metrics = res.tables.find((x) => x.id === 'metrics');
    const line = (r: Record<string, unknown>) => `${t(String(r.metric))}: ${fmtAmount(r.current as number, ctx.locale)}`;
    const nar = (id: string) => res.narratives.find((n) => n.id === id)?.text || '';
    return {
      title: i18nKey('投资者关系材料'), statements: [IR_STATEMENT], deckTitle: i18nKey('投资者演示材料'),
      deck: {
        cover: { title: t(i18nKey('投资者演示材料')), subtitle: t(ctx.def.modes.find((m) => m.id === ctx.run.modeId)?.name || ''), company: ctx.company.name, period: res.period, draft: t(i18nKey('草稿—待签核')), boundary: t(IR_STATEMENT) },
        footer: `${t(i18nKey('草稿—待签核'))} · ${t(IR_STATEMENT)}`,
        slides: [
          { title: t(i18nKey('开场')), bullets: [nar('opening')] },
          { title: t(i18nKey('核心财务指标')), bullets: (metrics?.rows || []).slice(0, 6).map(line) },
          { title: t(i18nKey('业绩亮点')), bullets: [nar('highlights')] },
          { title: t(i18nKey('关键信息')), bullets: (res.tables.find((x) => x.id === 'messages')?.rows || []).map((r) => String(r.message)) },
          { title: t(i18nKey('展望')), bullets: [nar('outlook')] },
          { title: t(i18nKey('问答准备')), bullets: (res.tables.find((x) => x.id === 'qa')?.rows || []).slice(0, 6).map((r) => String(r.question)) },
          { title: t(i18nKey('结束语')), bullets: [nar('closing'), t(IR_STATEMENT)] },
        ],
      },
    };
  },
});

