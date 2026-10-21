/**
 * D7 董事会与审计委员会材料（技能型）：
 *   数据：优先取「管理报告 → 董事会」转交来的已签核运行（第 4.3 节），没有转交时用本次上传的科目余额表现算；
 *   编排（代码）：议程、核心指标、审计委员会关注事项、提请审议事项、决议跟踪台账（读上一期项目里已归档的决议）、分发清单；
 *   起草（模型）：议程标题、业绩亮点、关注事项（必须引用上传原文，定位不到的丢弃）、决议草案、下一步；
 *   产出：三语 pptx（模板替换，阿语模板段落 RTL）+ docx。**分发清单只列出，不代发**（第 9.1 节）。
 */
import { i18nKey, tIn } from '@totalclaw/i18n';
import type { FauFpaResult, FauFpaTable, FauReminder, FauRun, FauVerificationItem } from '@totalclaw/ipc-contracts';
import type { RunCtx } from '../../runner';
import { BOARD_TASK, boardSchema, REF_JUDGEMENT } from '../../prompts/fpa';
import { fmtAmount, fmtPct } from '../../outputs/common';
import { fpaRunner, sub } from './base';
import { evalKpis } from './kpi';
import { kpiTable } from './indicators';
import type { MetricKey } from './metrics';
import { col, docsOf, facts, fpaPeriod, narrate, quoteFound, sourcesOf, toNarratives, type Facts } from './kit';
import { handoffsInto, tbBlock } from './reports';

export const BOARD_STATEMENT = i18nKey('材料分发由董秘或指定人员人工完成，本工作台不代发');
const KIND_LABELS: Record<string, string> = { report: i18nKey('汇报'), resolution: i18nKey('审议'), discussion: i18nKey('讨论事项') };

/** 已归档的管理报告（转交给董事会的那一次，取最近一次） */
function signedReport(ctx: RunCtx): FauRun | null {
  const ids = handoffsInto(ctx).filter((h) => h.moduleId === 'mgmt-report').map((h) => h.runId);
  const runs = ids.map((id) => ctx.store.findRun(ctx.company.id, id, ctx.project.id)).filter((r): r is FauRun => !!r && r.status === 'archived');
  return runs.sort((a, b) => (a.archivedAt || '').localeCompare(b.archivedAt || '')).pop() || null;
}

/** 上一期项目链里已归档的董事会运行中的决议（跟踪台账） */
function priorResolutions(ctx: RunCtx): Array<{ title: string; from: string }> {
  return ctx.history().flatMap((r) => {
    const t = (r.result as FauFpaResult | undefined)?.tables.find((x) => x.id === 'resolutions');
    const period = ctx.store.getProject(ctx.company.id, r.projectId)?.period || '';
    return (t?.rows || []).map((row) => ({ title: String(row.title || ''), from: period }));
  }).filter((x) => x.title);
}

function tableFacts(tables: FauFpaTable[]): Facts {
  const cents: number[] = [];
  const ratios: number[] = [];
  const plain: number[] = [];
  for (const t of tables) for (const r of t.rows) for (const c of t.columns) {
    const v = r[c.key];
    if (typeof v !== 'number') continue;
    if (c.kind === 'amount') cents.push(v); else if (c.kind === 'pct') ratios.push(v); else if (c.kind === 'num') plain.push(v);
  }
  return facts({ cents, ratios, plain });
}

export const boardRunner = fpaRunner({
  subs: () => ['compute', 'narrate', 'quotes'],
  validate(ctx, report) {
    if (!signedReport(ctx) && !ctx.run.inputs.tb?.length) {
      report.blockers.push({ id: 'need_report', level: 'block', code: 'need_report', message: { key: i18nKey('需要已签核的管理报告（在管理报告第 7 步转交给董事会）或本期科目余额表') } });
    }
  },
  async analyze(ctx) {
    const period = fpaPeriod(ctx);
    const src = signedReport(ctx);
    const base = await sub(ctx, 'compute', () => {
      if (src) {
        const r = src.result as FauFpaResult;
        return { tables: r.tables.filter((t) => ['metrics', 'ratios', 'kpi'].includes(t.id)), alerts: r.alerts, narratives: r.narratives.filter((n) => n.status === 'verified') };
      }
      const keys: MetricKey[] = ['revenue', 'grossProfit', 'opex', 'netProfit', 'cash', 'totalAssets', 'totalLiabilities', 'equity'];
      const b = tbBlock(ctx, keys, 'mgmt-report');
      const kpis = ctx.run.inputs.kpi?.length ? evalKpis(ctx.rows<'kpi'>('kpi'), ctx.th('kpi'), period) : [];
      return { tables: [...b.tables.filter((t) => t.id !== 'solvency'), ...(kpis.length ? [kpiTable(kpis, ctx.datasets('kpi').map((d) => d.label).join(', '))] : [])], alerts: b.alerts, narratives: [] };
    });
    const docs = [...await docsOf(ctx, 'topics'), ...await docsOf(ctx, 'auditFindings')];
    const f = (() => { const a = tableFacts(base.tables); const b = facts({ docs }); return { amounts: [...a.amounts, ...b.amounts], percents: [...a.percents, ...b.percents] }; })();
    const metrics = base.tables.find((t) => t.id === 'metrics');
    const prior = priorResolutions(ctx);
    const out = await sub(ctx, 'narrate', () => narrate(ctx, {
      module: 'board', skills: [{ name: 'fa-board-reporting-master', references: [REF_JUDGEMENT] }, { name: ctx.run.modeId === 'audit_committee' ? 'fa-audit-committee-support' : 'fa-board-deck-preparation' }, { name: 'fa-board-meeting-management' }],
      task: BOARD_TASK,
      data: {
        meeting: ctx.run.modeId, period,
        metrics: (metrics?.rows || []).map((r) => ({ label: tIn(ctx.locale, String(r.metric)), current: typeof r.current === 'number' ? r.current / 100 : null, prior: typeof r.prior === 'number' ? r.prior / 100 : null, changePct: typeof r.diffPriorPct === 'number' ? Math.round(r.diffPriorPct * 10000) / 100 : null })),
        alerts: base.alerts.map((a) => ({ level: a.level, text: tIn(ctx.locale, a.message.key, a.message.params) })),
        reportSections: base.narratives.map((n) => ({ heading: tIn(ctx.locale, n.heading), text: n.text })),
        priorResolutions: prior.map((p) => ({ title: p.title, from: p.from })),
      },
      untrusted: docs.map((d) => ({ name: d.name, text: d.text })),
      schema: boardSchema, texts: (o) => [...o.highlights, ...o.resolutions.map((r) => r.text), ...o.nextSteps, ...o.acMatters.map((m) => m.matter)], facts: f,
    }));
    const d = out.data;
    const ac = await sub(ctx, 'quotes', () => d.acMatters.filter((m) => quoteFound(docs, m.quote)));
    const dropped = d.acMatters.length - ac.length;
    const nar = toNarratives([
      { id: 'highlights', heading: i18nKey('业绩亮点'), text: d.highlights.join(' ') },
      { id: 'next', heading: i18nKey('下一步'), text: d.nextSteps.join(' ') },
      ...d.resolutions.map((r, i) => ({ id: `res${i + 1}`, heading: i18nKey('决议草案'), text: `${r.title}: ${r.text}` })),
    ], f, 'board');
    const acVer: FauVerificationItem[] = toNarratives(ac.map((m, i) => ({ id: `ac${i + 1}`, heading: i18nKey('审计委员会关注事项'), text: m.matter })), f, 'board').verification;
    const audience = ctx.run.modeId === 'audit_committee' ? i18nKey('审计委员会委员') : i18nKey('董事会全体董事');
    const tables: FauFpaTable[] = [
      ...base.tables,
      { id: 'agenda', title: i18nKey('会议议程'), columns: [col('no', i18nKey('序号'), 'num'), col('title', i18nKey('议题')), col('kind', i18nKey('议题类型'), 'label'), col('presenter', i18nKey('汇报人'))], rows: d.agenda.map((a, i) => ({ no: i + 1, title: a.title, kind: KIND_LABELS[a.kind], presenter: a.presenter })) },
      { id: 'acMatters', title: i18nKey('审计委员会关注事项'), columns: [col('no', i18nKey('序号'), 'num'), col('matter', i18nKey('事项')), col('quote', i18nKey('原文引用'))], rows: ac.map((m, i) => ({ no: i + 1, matter: m.matter, quote: m.quote })) },
      { id: 'resolutions', title: i18nKey('提请审议事项'), columns: [col('no', i18nKey('序号'), 'num'), col('title', i18nKey('议题')), col('text', i18nKey('决议草案')), col('status', i18nKey('状态'), 'label')], rows: d.resolutions.map((r, i) => ({ no: i + 1, title: r.title, text: r.text, status: i18nKey('待董事会审议') })) },
      { id: 'tracking', title: i18nKey('决议跟踪台账'), columns: [col('title', i18nKey('决议')), col('from', i18nKey('来源期间')), col('status', i18nKey('状态'), 'label')], rows: prior.map((p) => ({ title: p.title, from: p.from, status: i18nKey('待跟踪') })) },
      {
        id: 'distribution', title: i18nKey('分发清单（不代发）'), columns: [col('material', i18nKey('会议材料'), 'label'), col('audience', i18nKey('接收方'), 'label'), col('channel', i18nKey('方式'), 'label'), col('status', i18nKey('状态'), 'label')],
        rows: [i18nKey('董事会演示材料'), i18nKey('议程与决议草案')].map((m) => ({ material: m, audience, channel: i18nKey('由董秘人工分发并登记签收'), status: i18nKey('未发送（由人发送）') })),
      },
    ];
    const verification = [...nar.verification, ...acVer];
    const res: FauFpaResult = {
      moduleId: 'board', period, tables, narratives: nar.narratives, charts: [], alerts: base.alerts, sources: sourcesOf(ctx),
      handoffFrom: src ? [{ runId: src.id, moduleId: 'mgmt-report' }] : undefined,
      checks: [
        { id: 'signed_report', ok: !!src, message: { key: i18nKey('核心指标取自已签核的管理报告') } },
        { id: 'verified', ok: verification.every((v) => v.status === 'verified'), message: { key: i18nKey('说明里的数字全部回核通过') } },
      ],
    };
    const reminders: FauReminder[] = [
      ...(src ? [] : [{ id: 'board:no_report', source: 'engine' as const, level: 'warn' as const, message: { key: i18nKey('没有已签核的管理报告转交，核心指标按本次上传的科目余额表现算') } }]),
      ...(dropped ? [{ id: 'board:dropped', source: 'engine' as const, level: 'warn' as const, message: { key: i18nKey('{n} 条审计委员会关注事项的引用在原文里找不到，已丢弃'), params: { n: dropped } } }] : []),
    ];
    return { result: res, verification, reminders, model: out.model, summary: { key: i18nKey('议程 {n} 项，提请审议 {m} 项'), params: { n: d.agenda.length, m: d.resolutions.length } } };
  },
  outputs(ctx, res) {
    const t = (k: string, p?: Record<string, string | number>) => tIn(ctx.locale, k, p);
    const rows = (id: string) => res.tables.find((x) => x.id === id)?.rows || [];
    const nar = (id: string) => res.narratives.find((n) => n.id === id)?.text || '';
    const metric = (r: Record<string, unknown>) => {
      const cur = typeof r.current === 'number' ? fmtAmount(r.current, ctx.locale) : '';
      const ch = typeof r.diffPriorPct === 'number' ? ` (${fmtPct(r.diffPriorPct, ctx.locale)})` : '';
      return `${t(String(r.metric))}: ${cur}${ch}`;
    };
    const mode = ctx.def.modes.find((m) => m.id === ctx.run.modeId);
    return {
      title: i18nKey('董事会会议材料'), deckTitle: i18nKey('董事会演示材料'), statements: [BOARD_STATEMENT],
      deck: {
        cover: { title: t(i18nKey('董事会与审计委员会材料')), subtitle: t(mode?.name || ''), company: ctx.company.name, period: res.period, draft: t(i18nKey('草稿—待签核')), boundary: t(BOARD_STATEMENT) },
        footer: `${t(i18nKey('草稿—待签核'))} · ${t(i18nKey('草稿，非审计 / 鉴证意见'))}`,
        slides: [
          { title: t(i18nKey('会议议程')), bullets: rows('agenda').map((r) => `${r.no}. ${r.title}`) },
          { title: t(i18nKey('核心财务指标')), bullets: rows('metrics').slice(0, 6).map(metric) },
          { title: t(i18nKey('业绩亮点')), bullets: [nar('highlights')] },
          { title: t(i18nKey('预警')), bullets: res.alerts.slice(0, 6).map((a) => t(a.message.key, a.message.params)) },
          { title: t(i18nKey('审计委员会关注事项')), bullets: rows('acMatters').map((r) => String(r.matter)) },
          { title: t(i18nKey('提请审议事项')), bullets: rows('resolutions').map((r) => `${r.no}. ${r.title}`) },
          { title: t(i18nKey('下一步')), bullets: [nar('next'), t(BOARD_STATEMENT)] },
        ],
      },
    };
  },
});
