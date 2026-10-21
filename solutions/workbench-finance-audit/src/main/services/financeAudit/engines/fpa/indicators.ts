/**
 * 以指标表（kpi 数据集）为底的四个模块：D2 KPI 管理、D6 商业洞察、D8 ESG 报告、D9 战略规划。
 * 达成率、预警分级、趋势、完整性、偏差、风险评分由代码算；模型只写根因、洞察、报告草稿、假设与风险描述，
 * 数字逐条回核，引用上传文件原文的事实类条目定位不到原文就丢弃。
 */
import { i18nKey, tIn } from '@totalclaw/i18n';
import type { FauFpaAlert, FauFpaChart, FauFpaResult, FauFpaTable, FauReminder, FauVerificationItem } from '@totalclaw/ipc-contracts';
import type { RunCtx } from '../../runner';
import type { KpiRow } from '../../fpaTypes';
import { ESG_TASK, esgSchema, INSIGHT_TASK, insightSchema, KPI_TASK, kpiSchema, STRATEGY_TASK, strategySchema, REF_JUDGEMENT, REF_ESG_FRAMEWORKS } from '../../prompts/fpa';
import { fpaRunner, sub } from './base';
import { evalKpis, type KpiEval } from './kpi';
import { seriesStats } from './trend';
import { ESG_FRAMEWORKS, FRAMEWORK_LABELS, INDICATOR_LABELS, QUADRANT_LABELS, esgCompleteness, esgQuality, materiality, type EsgFramework } from './esg';
import { DEVIATION_LABELS, DEVIATION_LEVEL, RISK_LEVEL, deviationOf, riskScore } from './strategy';
import { col, docsOf, facts, fpaPeriod, narrate, quoteFound, sourceText, sourcesOf, toNarratives, verifyText } from './kit';

const p2 = (r: number | null | undefined) => (r == null ? null : Math.round(r * 10000) / 100);
const labelOf = (ctx: RunCtx, slot: string) => ctx.datasets(slot).map((d) => d.label).join(', ');
const verdict = (ok: boolean) => (ok ? i18nKey('已核实') : i18nKey('未核实'));

export function kpiTable(evals: KpiEval[], dsLabel: string, id = 'kpi', title = i18nKey('KPI 达成')): FauFpaTable {
  return {
    id, title,
    columns: [col('indicator', i18nKey('指标')), col('category', i18nKey('类别')), col('period', i18nKey('期间')), col('unit', i18nKey('单位')), col('target', i18nKey('目标值'), 'num'),
      col('actual', i18nKey('实际值'), 'num'), col('achievement', i18nKey('达成率'), 'pct'), col('level', i18nKey('预警'), 'level'), col('misses', i18nKey('连续未达标期数'), 'num'),
      col('ytdAchievement', i18nKey('累计达成率'), 'pct'), col('owner', i18nKey('责任人')), col('source', i18nKey('来源'))],
    rows: evals.map((e) => ({
      indicator: e.indicator, category: e.category, period: e.period, unit: e.unit, target: e.target, actual: e.actual, achievement: e.achievement, level: e.level,
      misses: e.consecutiveMisses, ytdAchievement: e.ytdAchievement, owner: e.owner, source: sourceText(dsLabel, e.rows),
    })),
  };
}

function achievementChart(evals: KpiEval[], id: string, title: string): FauFpaChart {
  return { id, title, unit: 'pct', labels: evals.map((e) => e.indicator), series: [{ name: i18nKey('达成率'), values: evals.map((e) => e.achievement) }] };
}

function kpiFacts(evals: KpiEval[]) {
  return facts({ plain: evals.flatMap((e) => [e.target, e.actual, e.ytdTarget, e.ytdActual, e.consecutiveMisses]), ratios: evals.flatMap((e) => [e.achievement, e.ytdAchievement, ...e.history.map((h) => h.achievement)]) });
}

// ── D2 KPI 管理 ────────────────────────────────────────────────────────────

const CAUSE_LABELS: Record<string, string> = { systemic: i18nKey('系统性'), one_off: i18nKey('一次性'), unknown: i18nKey('原因不明，待主管确认') };

export const kpiRunner = fpaRunner({
  subs: (mode) => (mode === 'tracking' ? ['compute', 'narrate'] : ['compute']),
  async analyze(ctx) {
    const th = ctx.th('kpi');
    const rows: KpiRow[] = ctx.rows<'kpi'>('kpi');
    const evals = await sub(ctx, 'compute', () => evalKpis(rows, th, fpaPeriod(ctx)));
    const ds = labelOf(ctx, 'kpi');
    const tables: FauFpaTable[] = [kpiTable(evals, ds)];
    const missTh = th['escalate.consecutiveMisses'] ?? 3;
    const alerts: FauFpaAlert[] = evals.filter((e) => e.level === 'red' || e.level === 'yellow').map((e) => ({
      id: `kpi:${e.indicator}`, level: e.level!, message: { key: i18nKey('{p0} 达成率 {p1}'), params: { p0: e.indicator, p1: `${p2(e.achievement)}%` } },
    }));
    const escalated = evals.filter((e) => e.consecutiveMisses >= missTh);
    const reminders: FauReminder[] = escalated.map((e) => ({
      id: `kpi:esc:${e.indicator}`, source: 'escalation', level: 'warn',
      message: { key: i18nKey('{p0} 连续 {n} 期未达标，须 CFO 关注'), params: { p0: e.indicator, n: e.consecutiveMisses } },
    }));
    if (ctx.run.modeId === 'target') {
      tables.push({
        id: 'ytd', title: i18nKey('目标分解与累计'),
        columns: [col('indicator', i18nKey('指标')), col('period', i18nKey('期间')), col('achievement', i18nKey('当期达成率'), 'pct')],
        rows: evals.flatMap((e) => e.history.map((h) => ({ indicator: e.indicator, period: h.period, achievement: h.achievement }))),
      });
    }
    let verification: FauVerificationItem[] = [];
    let model: string | undefined;
    const miss = evals.filter((e) => e.level === 'red' || e.level === 'yellow');
    if (ctx.run.modeId === 'tracking' && miss.length) {
      const f = kpiFacts(evals);
      const ids = miss.map((_e, i) => `K${i + 1}`);
      const out = await sub(ctx, 'narrate', () => narrate(ctx, {
        module: 'kpi', skills: [{ name: 'fa-kpi-management-master', references: [REF_JUDGEMENT] }, { name: 'fa-kpi-root-cause-analysis' }],
        task: KPI_TASK,
        data: { kpis: miss.map((e, i) => ({ id: ids[i], indicator: e.indicator, unit: e.unit, target: e.target, actual: e.actual, achievementPct: p2(e.achievement), level: e.level, consecutiveMisses: e.consecutiveMisses, history: e.history.map((h) => ({ period: h.period, achievementPct: p2(h.achievement) })) })) },
        schema: kpiSchema, texts: (o) => o.causes.flatMap((c) => [c.reason, c.action]), facts: f, userData: evals.map((e) => e.indicator),
      }));
      model = out.model;
      const causeRows = miss.map((e, i) => {
        const c = out.data.causes.find((x) => x.id === ids[i]);
        const chk = c ? verifyText(`${c.reason} ${c.action}`, f) : { ok: true, missing: [] as string[] };
        return { indicator: e.indicator, type: CAUSE_LABELS[c?.type || 'unknown'], reason: c?.reason || tIn(ctx.locale, CAUSE_LABELS.unknown), action: c?.action || '', check: verdict(chk.ok), missing: chk.missing.join(', ') };
      });
      tables.push({ id: 'causes', title: i18nKey('根因分析'), columns: [col('indicator', i18nKey('指标')), col('type', i18nKey('原因类型'), 'label'), col('reason', i18nKey('原因')), col('action', i18nKey('改进措施')), col('check', i18nKey('回核'), 'label'), col('missing', i18nKey('数据里找不到'))], rows: causeRows });
      verification = causeRows.map((r, i) => ({ id: `kpi:cause:${ids[i]}`, ref: `kpi:${r.indicator}`, text: `${r.reason} ${r.action}`, status: r.check === i18nKey('已核实') ? 'verified' : 'unverified', missing: r.missing ? r.missing.split(', ') : undefined }));
    }
    const res: FauFpaResult = {
      moduleId: 'kpi', period: fpaPeriod(ctx), tables, narratives: [], charts: [achievementChart(evals, 'kpi', i18nKey('KPI 达成率'))], alerts, sources: sourcesOf(ctx),
      checks: [{ id: 'targets', ok: evals.every((e) => e.target != null), message: { key: i18nKey('每个指标都有目标值') } }],
    };
    return {
      result: res, verification, reminders, model, approveRequired: escalated.length > 0,
      summary: { key: i18nKey('{n} 个指标，红灯 {r}，黄灯 {y}'), params: { n: evals.length, r: evals.filter((e) => e.level === 'red').length, y: evals.filter((e) => e.level === 'yellow').length } },
    };
  },
  outputs: () => ({ title: i18nKey('KPI 追踪表') }),
});

// ── D6 商业洞察 ────────────────────────────────────────────────────────────

const TREND_LABELS: Record<string, string> = { up: i18nKey('上升趋势'), down: i18nKey('下降趋势'), flat: i18nKey('持平'), insufficient: i18nKey('数据不足') };
const GRADE_LABELS: Record<string, string> = { A: i18nKey('已验证（强）'), B: i18nKey('已验证（弱）'), C: i18nKey('待验证') };

export const insightRunner = fpaRunner({
  subs: () => ['compute', 'narrate', 'quotes'],
  async analyze(ctx) {
    const th = ctx.th('insight');
    const stats = await sub(ctx, 'compute', () => seriesStats(ctx.rows<'kpi'>('kpi'), th));
    const ds = labelOf(ctx, 'kpi');
    const ids = stats.map((_s, i) => `S${i + 1}`);
    const seriesTable: FauFpaTable = {
      id: 'series', title: i18nKey('趋势与季节性'),
      columns: [col('indicator', i18nKey('指标')), col('unit', i18nKey('单位')), col('points', i18nKey('期数'), 'num'), col('last', i18nKey('最近一期'), 'num'), col('prev', i18nKey('上一期'), 'num'),
        col('changePct', i18nKey('环比'), 'pct'), col('avgChangePct', i18nKey('平均环比'), 'pct'), col('trend', i18nKey('趋势'), 'label'), col('anomalies', i18nKey('异常点'), 'num'), col('source', i18nKey('来源'))],
      rows: stats.map((s) => ({ indicator: s.indicator, unit: s.unit, points: s.points.length, last: s.last, prev: s.prev, changePct: s.changePct, avgChangePct: s.avgChangePct, trend: TREND_LABELS[s.trend], anomalies: s.anomalies.length, source: sourceText(ds, s.points.map((p) => p.row)) })),
    };
    const survey = await docsOf(ctx, 'survey');
    const f = facts({ plain: stats.flatMap((s) => [s.last, s.prev, s.change, ...s.points.map((p) => p.value), ...s.anomalies.map((a) => a.value)]), ratios: stats.flatMap((s) => [s.changePct, s.avgChangePct]), docs: survey });
    const out = await sub(ctx, 'narrate', () => narrate(ctx, {
      module: 'insight', skills: [{ name: 'fa-business-insight-master', references: [REF_JUDGEMENT] }, { name: 'fa-insight-generation' }, { name: 'fa-insight-validation' }],
      task: INSIGHT_TASK,
      data: { series: stats.map((s, i) => ({ id: ids[i], indicator: s.indicator, unit: s.unit, last: s.last, prev: s.prev, changePct: p2(s.changePct), avgChangePct: p2(s.avgChangePct), trend: s.trend, anomalies: s.anomalies.map((a) => ({ period: a.period, value: a.value })), seasonality: s.seasonality })) },
      untrusted: survey.map((d) => ({ name: d.name, text: d.text })),
      schema: insightSchema, texts: (o) => o.insights.flatMap((x) => [x.title, x.finding, x.recommendation]), facts: f, userData: stats.map((s) => s.indicator),
    }));
    // 验证分级（代码判，不交给模型）：数字回核 + 依据的序列有足够数据 / 原文引用定位得到
    const kept = await sub(ctx, 'quotes', () => out.data.insights.filter((x) => !x.quote || quoteFound(survey, x.quote)));
    const dropped = out.data.insights.length - kept.length;
    const rows = kept.map((x, i) => {
      const s = stats[ids.indexOf(x.seriesId)];
      const chk = verifyText(`${x.title} ${x.finding} ${x.recommendation}`, f);
      const grade = !chk.ok ? 'C' : (s && s.trend !== 'insufficient') || x.quote ? 'A' : 'B';
      return { no: i + 1, title: x.title, finding: x.finding, grade: GRADE_LABELS[grade], basis: s ? s.indicator : x.quote, recommendation: x.recommendation, missing: chk.missing.join(', ') };
    });
    const verification: FauVerificationItem[] = rows.map((r) => ({ id: `insight:${r.no}`, ref: `insight:${r.no}`, text: `${r.title} ${r.finding}`, status: r.grade === GRADE_LABELS.C ? 'unverified' : 'verified', missing: r.missing ? r.missing.split(', ') : undefined }));
    const res: FauFpaResult = {
      moduleId: 'insight', period: fpaPeriod(ctx), narratives: [], alerts: [], sources: sourcesOf(ctx),
      tables: [seriesTable, { id: 'insights', title: i18nKey('洞察'), columns: [col('no', i18nKey('序号'), 'num'), col('title', i18nKey('洞察')), col('finding', i18nKey('发现内容')), col('grade', i18nKey('验证分级'), 'label'), col('basis', i18nKey('依据')), col('recommendation', i18nKey('建议')), col('missing', i18nKey('数据里找不到'))], rows }],
      charts: [{ id: 'change', title: i18nKey('环比变化'), unit: 'pct', labels: stats.map((s) => s.indicator), series: [{ name: i18nKey('环比'), values: stats.map((s) => s.changePct) }] }],
      checks: [{ id: 'graded', ok: rows.every((r) => r.grade !== GRADE_LABELS.C), message: { key: i18nKey('洞察里的数字全部回核通过') } }],
    };
    const reminders: FauReminder[] = dropped ? [{ id: 'insight:dropped', source: 'engine', level: 'warn', message: { key: i18nKey('{n} 条洞察引用的原文找不到，已丢弃'), params: { n: dropped } } }] : [];
    return { result: res, verification, reminders, model: out.model, summary: { key: i18nKey('{n} 个指标序列，洞察 {m} 条'), params: { n: stats.length, m: rows.length } } };
  },
  outputs: () => ({ title: i18nKey('商业洞察报告') }),
});

// ── D8 ESG 报告 ─────────────────────────────────────────────────────────────

const ESG_HEADINGS: Record<string, string> = { environment: i18nKey('环境'), social: i18nKey('社会'), governance: i18nKey('治理'), gaps: i18nKey('数据缺口与改进') };
const QUALITY_LABELS: Record<string, string> = { no_unit: i18nKey('缺单位'), no_period: i18nKey('缺期间'), yoy_jump: i18nKey('同比变化过大，须核实') };

export const esgRunner = fpaRunner({
  subs: () => ['compute', 'narrate'],
  async analyze(ctx) {
    const th = ctx.th('esg');
    const fw: EsgFramework = (ESG_FRAMEWORKS as string[]).includes(ctx.run.modeId) ? ctx.run.modeId as EsgFramework : 'issb';
    const rows: KpiRow[] = ctx.rows<'kpi'>('esg');
    const ds = labelOf(ctx, 'esg');
    const { comp, quality } = await sub(ctx, 'compute', () => ({ comp: esgCompleteness(rows, fw), quality: esgQuality(rows, th) }));
    const policies = await docsOf(ctx, 'policies');
    const f = facts({ plain: [...rows.map((r) => r.actual), ...quality.flatMap((q) => [q.value, q.prior])], ratios: quality.map((q) => q.changePct), docs: policies });
    const out = await sub(ctx, 'narrate', () => narrate(ctx, {
      module: 'esg', skills: [{ name: 'fa-esg-reporting-master', references: [REF_JUDGEMENT, REF_ESG_FRAMEWORKS] }, { name: 'fa-esg-materiality-assessment' }, { name: 'fa-esg-reporting' }],
      task: ESG_TASK,
      data: {
        framework: tIn(ctx.locale, FRAMEWORK_LABELS[fw]),
        completeness: comp.map((c) => ({ id: c.id, label: tIn(ctx.locale, INDICATOR_LABELS[c.id]), category: c.category, present: c.present, value: c.value, unit: c.unit, period: c.period })),
        quality: quality.map((q) => ({ indicator: q.indicator, issue: q.code, value: q.value, prior: q.prior, changePct: p2(q.changePct) })),
        indicators: rows.map((r) => ({ indicator: r.indicator, category: r.category, value: r.actual, unit: r.unit, period: r.period })),
      },
      untrusted: policies.map((d) => ({ name: d.name, text: d.text })),
      schema: esgSchema, texts: (o) => [...o.sections.map((s) => s.text), ...o.topics.map((x) => x.rationale)], facts: f, userData: rows.map((r) => r.indicator),
    }));
    const nar = toNarratives(out.data.sections.map((s) => ({ id: s.id, heading: ESG_HEADINGS[s.id] || s.id, text: s.text })), f, 'esg');
    const topics = out.data.topics.map((x) => ({ ...x, ...materiality(x.impact, x.financial, th), chk: verifyText(x.rationale, f) }));
    const verification: FauVerificationItem[] = [...nar.verification, ...topics.map((x, i) => ({ id: `esg:topic:${i + 1}`, ref: `esg:${x.topic}`, text: x.rationale, status: x.chk.ok ? 'verified' as const : 'unverified' as const, missing: x.chk.missing.length ? x.chk.missing : undefined }))];
    const reminders: FauReminder[] = [
      ...comp.filter((c) => !c.present).map((c) => ({ id: `esg:missing:${c.id}`, source: 'engine' as const, level: 'warn' as const, message: { key: i18nKey('框架核心指标缺数据：{p0}'), params: { p0: tIn(ctx.locale, INDICATOR_LABELS[c.id]) } } })),
      ...quality.filter((q) => q.code === 'yoy_jump').map((q) => ({ id: `esg:yoy:${q.row}`, source: 'engine' as const, level: 'warn' as const, message: { key: i18nKey('{p0} 同比变化 {p1}，须核实数据'), params: { p0: q.indicator, p1: `${p2(q.changePct)}%` } } })),
    ];
    const res: FauFpaResult = {
      moduleId: 'esg', period: fpaPeriod(ctx), narratives: nar.narratives, charts: [], sources: sourcesOf(ctx),
      alerts: comp.filter((c) => !c.present).map((c) => ({ id: `esg:${c.id}`, level: 'yellow' as const, message: { key: i18nKey('框架核心指标缺数据：{p0}'), params: { p0: tIn(ctx.locale, INDICATOR_LABELS[c.id]) } } })),
      tables: [
        {
          id: 'completeness', title: i18nKey('数据完整性核查'),
          columns: [col('indicator', i18nKey('核心指标'), 'label'), col('category', i18nKey('维度')), col('present', i18nKey('状态'), 'label'), col('name', i18nKey('对应的数据')), col('value', i18nKey('数值'), 'num'), col('unit', i18nKey('单位')), col('period', i18nKey('期间')), col('source', i18nKey('来源'))],
          rows: comp.map((c) => ({ indicator: INDICATOR_LABELS[c.id], category: c.category, present: c.present ? i18nKey('有数据') : i18nKey('缺失'), name: c.indicator, value: c.value, unit: c.unit, period: c.period, source: c.present ? sourceText(ds, c.rows) : '' })),
        },
        {
          id: 'quality', title: i18nKey('数据质量'),
          columns: [col('row', i18nKey('行号'), 'num'), col('indicator', i18nKey('指标')), col('issue', i18nKey('问题'), 'label'), col('value', i18nKey('本期数'), 'num'), col('prior', i18nKey('上期数'), 'num'), col('changePct', i18nKey('变动率'), 'pct')],
          rows: quality.map((q) => ({ row: q.row, indicator: q.indicator, issue: QUALITY_LABELS[q.code], value: q.value ?? null, prior: q.prior ?? null, changePct: q.changePct ?? null })),
        },
        {
          id: 'materiality', title: i18nKey('重大性矩阵'),
          columns: [col('topic', i18nKey('议题')), col('category', i18nKey('维度')), col('impact', i18nKey('影响重要性'), 'num'), col('financial', i18nKey('财务重要性'), 'num'), col('quadrant', i18nKey('象限'), 'label'), col('rationale', i18nKey('理由')), col('check', i18nKey('回核'), 'label')],
          rows: topics.map((x) => ({ topic: x.topic, category: x.category, impact: x.impact, financial: x.financial, quadrant: QUADRANT_LABELS[x.quadrant], rationale: x.rationale, check: verdict(x.chk.ok) })),
        },
      ],
      checks: [
        { id: 'complete', ok: comp.every((c) => c.present), message: { key: i18nKey('框架核心指标都有数据') } },
        { id: 'verified', ok: verification.every((v) => v.status === 'verified'), message: { key: i18nKey('说明里的数字全部回核通过') } },
      ],
    };
    return { result: res, verification, reminders, model: out.model, summary: { key: i18nKey('核心指标 {n} 项，缺 {m} 项，重大议题 {k} 个'), params: { n: comp.length, m: comp.filter((c) => !c.present).length, k: topics.filter((x) => x.material).length } } };
  },
  outputs: () => ({ title: i18nKey('ESG 报告草稿'), statements: [i18nKey('框架核心指标清单按公开指引整理，正式披露前须按最新版本核实')] }),
});

// ── D9 战略规划 ─────────────────────────────────────────────────────────────

const STRATEGY_HEADINGS: Record<string, string> = { summary: i18nKey('战略摘要'), deviation: i18nKey('执行偏差与纠偏') };
const ASSUMPTION_LABELS: Record<string, string> = { holding: i18nKey('仍成立'), changed: i18nKey('已变化'), unknown: i18nKey('待确认') };

export const strategyRunner = fpaRunner({
  subs: () => ['compute', 'narrate', 'quotes'],
  async analyze(ctx) {
    const th = ctx.th('strategy');
    const evals = await sub(ctx, 'compute', () => evalKpis(ctx.rows<'kpi'>('objectives'), ctx.th('kpi'), fpaPeriod(ctx)));
    const devs = evals.map((e) => ({ e, ...deviationOf(e, th) }));
    const doc = await docsOf(ctx, 'strategyDoc');
    const ds = labelOf(ctx, 'objectives');
    const f = facts({ plain: evals.flatMap((e) => [e.target, e.actual]), ratios: devs.flatMap((d) => [d.e.achievement, d.deviation]), docs: doc });
    const out = await sub(ctx, 'narrate', () => narrate(ctx, {
      module: 'strategy', skills: [{ name: 'fa-strategic-planning-master', references: [REF_JUDGEMENT] }, { name: ctx.run.modeId === 'tracking' ? 'fa-strategy-execution-tracking' : 'fa-strategic-objective-setting' }, { name: 'fa-strategic-risk-assessment' }],
      task: STRATEGY_TASK,
      data: { mode: ctx.run.modeId, objectives: devs.map((d, i) => ({ id: `O${i + 1}`, indicator: d.e.indicator, unit: d.e.unit, target: d.e.target, actual: d.e.actual, achievementPct: p2(d.e.achievement), deviationPct: p2(d.deviation), level: d.level })) },
      untrusted: doc.map((d) => ({ name: d.name, text: d.text })),
      schema: strategySchema, texts: (o) => [...o.sections.map((s) => s.text), ...o.risks.map((r) => `${r.risk} ${r.response}`), ...o.decomposition.map((x) => x.milestone)], facts: f, userData: evals.map((e) => e.indicator),
    }));
    const d = out.data;
    const nar = toNarratives(d.sections.map((s) => ({ id: s.id, heading: STRATEGY_HEADINGS[s.id] || s.id, text: s.text })), f, 'strategy');
    // 假设是从战略文件里来的事实：有文件时引用定位不到的丢弃；没有文件时保留并标「模型建议（无原文）」
    const assumptions = await sub(ctx, 'quotes', () => d.assumptions.filter((a) => !doc.length || quoteFound(doc, a.quote)));
    const dropped = d.assumptions.length - assumptions.length;
    const risks = d.risks.map((r) => ({ ...r, ...riskScore(r.likelihood, r.impact, th), chk: verifyText(`${r.risk} ${r.response}`, f) }));
    const verification: FauVerificationItem[] = [...nar.verification, ...risks.map((r, i) => ({ id: `strategy:risk:${i + 1}`, ref: `risk:${i + 1}`, text: `${r.risk} ${r.response}`, status: r.chk.ok ? 'verified' as const : 'unverified' as const, missing: r.chk.missing.length ? r.chk.missing : undefined }))];
    const severe = devs.filter((x) => x.level === 'severe');
    const reminders: FauReminder[] = [
      ...severe.map((x) => ({ id: `strategy:severe:${x.e.indicator}`, source: 'escalation' as const, level: 'warn' as const, message: { key: i18nKey('{p0} 重度偏差 {p1}，纠偏方案须批准人确认'), params: { p0: x.e.indicator, p1: `${p2(x.deviation)}%` } } })),
      ...(dropped ? [{ id: 'strategy:dropped', source: 'engine' as const, level: 'warn' as const, message: { key: i18nKey('{n} 条战略假设的引用在原文里找不到，已丢弃'), params: { n: dropped } } }] : []),
    ];
    const res: FauFpaResult = {
      moduleId: 'strategy', period: fpaPeriod(ctx), narratives: nar.narratives, sources: sourcesOf(ctx),
      alerts: devs.filter((x) => x.level === 'moderate' || x.level === 'severe').map((x) => ({ id: `dev:${x.e.indicator}`, level: DEVIATION_LEVEL[x.level]!, message: { key: i18nKey('{p0} 偏差 {p1}'), params: { p0: x.e.indicator, p1: `${p2(x.deviation)}%` } } })),
      charts: [achievementChart(evals, 'objectives', i18nKey('战略目标达成率'))],
      tables: [
        {
          id: 'objectives', title: i18nKey('战略目标执行'),
          columns: [col('indicator', i18nKey('目标')), col('period', i18nKey('期间')), col('target', i18nKey('目标值'), 'num'), col('actual', i18nKey('实际值'), 'num'), col('achievement', i18nKey('达成率'), 'pct'), col('deviation', i18nKey('偏差'), 'pct'), col('level', i18nKey('预警'), 'level'), col('status', i18nKey('状态'), 'label'), col('source', i18nKey('来源'))],
          rows: devs.map((x) => ({ indicator: x.e.indicator, period: x.e.period, target: x.e.target, actual: x.e.actual, achievement: x.e.achievement, deviation: x.deviation, level: DEVIATION_LEVEL[x.level], status: DEVIATION_LABELS[x.level], source: sourceText(ds, x.e.rows) })),
        },
        { id: 'decomposition', title: i18nKey('目标分解'), columns: [col('objective', i18nKey('目标')), col('milestone', i18nKey('里程碑')), col('owner', i18nKey('责任人'))], rows: d.decomposition.map((x) => ({ ...x })) },
        {
          id: 'assumptions', title: i18nKey('关键假设台账'), columns: [col('assumption', i18nKey('假设')), col('indicator', i18nKey('追踪指标')), col('status', i18nKey('状态'), 'label'), col('quote', i18nKey('原文引用'))],
          rows: assumptions.map((a) => ({ assumption: a.assumption, indicator: a.indicator, status: ASSUMPTION_LABELS[a.status], quote: doc.length ? a.quote : tIn(ctx.locale, i18nKey('模型建议（无原文）')) })),
        },
        {
          id: 'risks', title: i18nKey('战略风险评估'), columns: [col('risk', i18nKey('风险描述')), col('likelihood', i18nKey('可能性'), 'num'), col('impact', i18nKey('影响程度'), 'num'), col('score', i18nKey('评分'), 'num'), col('level', i18nKey('级别'), 'level'), col('response', i18nKey('应对')), col('check', i18nKey('回核'), 'label')],
          rows: risks.map((r) => ({ risk: r.risk, likelihood: r.likelihood, impact: r.impact, score: r.score, level: RISK_LEVEL[r.level], response: r.response, check: verdict(r.chk.ok) })),
        },
      ],
      checks: [{ id: 'verified', ok: verification.every((v) => v.status === 'verified'), message: { key: i18nKey('说明里的数字全部回核通过') } }],
    };
    return {
      result: res, verification, reminders, model: out.model, approveRequired: severe.length > 0,
      summary: { key: i18nKey('{n} 个战略目标，重度偏差 {m} 个，风险 {k} 条'), params: { n: evals.length, m: severe.length, k: risks.length } },
    };
  },
  outputs: () => ({ title: i18nKey('战略规划与执行报告') }),
});
