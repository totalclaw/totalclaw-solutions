/**
 * C2 监管报送与信息披露 runner（S 型，规则先判）：
 *   ③ 校验 → ④ 披露比例的分母（参数优先，其次科目余额表）→ 阈值判断（代码）→ 报送数据核查 → 达到标准的事项交模型写披露草稿并回核
 *   （草稿里的金额、比例、日期必须在该事项的数据里，回核不过重写一次，仍不过标「未核实」）→ ⑤ 披露底稿与披露草稿。
 * 只出草稿，不对外发布。
 */
import { i18nKey, tIn } from '@totalclaw/i18n';
import type {
  FauArtifact, FauDisclosureLevel, FauDisclosureRegime, FauIssue, FauRegulatoryResult, FauReminder, FauSubProgress, FauValidationReport, FauVerificationItem,
} from '@totalclaw/ipc-contracts';
import { STANDARD_LABELS, regionProfile } from '../../../../../shared/financeAudit/regions';
import type { AnalyzeResult, ModuleRunner, RunCtx } from '../../runner';
import { runSkill } from '../../skillRunner';
import { verifyNarrative } from '../../verify';
import { sha256File } from '../../signoff';
import { newId, nowIso } from '../../store';
import { writeRegulatoryOutputs } from '../../outputs/tax';
import { DISCLOSURE_TASK, disclosureSchema } from '../../prompts/regulatory';
import { withDatasetIssues } from '../accounting/closeRunner';
import { RuleBook, allRules, classifyTb, isTaxExpenseLine, paramCents, plNotClosed, profitBeforeTax, taxPeriod, type TaxPeriod } from './common';
import { disclosureItems, reportingChecks, type DisclosureBase } from './disclosure';

const SUB: Record<string, string> = {
  base: i18nKey('披露比例的分母'), thresholds: i18nKey('阈值判断'), check: i18nKey('报送数据核查'), draft: i18nKey('模型写披露草稿并回核'),
};

export function regimeOf(ctx: Pick<RunCtx, 'run' | 'company'>): FauDisclosureRegime {
  const r = String(ctx.run.params.regime || '');
  if (r === 'cn_sse' || r === 'sa_cma' || r === 'intl') return r;
  return ctx.company.region === 'CN' ? 'cn_sse' : ctx.company.region === 'SA' ? 'sa_cma' : 'intl';
}

/** 分母：手工填的（最近一期经审计数）优先，其次余额表 */
export function disclosureBase(ctx: RunCtx): DisclosureBase & { source: 'params' | 'tb' } {
  const pr = ctx.run.params as Record<string, unknown>;
  const given = { totalAssets: paramCents(pr.auditedTotalAssets), netAssets: paramCents(pr.auditedNetAssets), revenue: paramCents(pr.auditedRevenue), netProfit: paramCents(pr.auditedNetProfit) };
  if (Object.values(given).some((v) => v) || !ctx.run.inputs.tb?.length) return { ...given, source: 'params' };
  const rows = classifyTb(ctx.rows<'tb'>('tb'), ctx.company, ctx.profile.standard);
  const pl = profitBeforeTax(rows);
  const tax = rows.filter((r) => r.cls === 'expense' && isTaxExpenseLine(r)).reduce((s, r) => s + r.periodDr - r.periodCr, 0);
  const net = pl.profit - tax;
  return {
    totalAssets: rows.filter((r) => r.cls === 'asset').reduce((s, r) => s + r.closingDr - r.closingCr, 0),
    netAssets: rows.filter((r) => r.cls === 'equity').reduce((s, r) => s + r.closingCr - r.closingDr, 0) + (plNotClosed(rows) ? net : 0),
    revenue: pl.revenue, netProfit: net, source: 'tb',
  };
}

function periodOrNull(ctx: RunCtx): TaxPeriod | null {
  try { return taxPeriod(String(ctx.run.params.period || ctx.project.period || ''), ctx.company.fiscalYearStartMonth); } catch { return null; }
}

const COUNT_LEVELS: FauDisclosureLevel[] = ['shareholder', 'disclose', 'notes', 'none'];

export const regulatoryRunner: ModuleRunner = {
  subSteps(): FauSubProgress[] {
    return ['base', 'thresholds', 'check', 'draft'].map((id) => ({ id, label: { key: SUB[id] }, status: 'todo' }));
  },

  async validate(ctx: RunCtx): Promise<FauValidationReport> {
    const blockers: FauIssue[] = [];
    const warnings: FauIssue[] = [];
    const events = ctx.rows<'disclosure_events'>('events');
    if (!events.length) blockers.push({ id: 'reg:empty', level: 'block', code: 'empty', message: { key: i18nKey('事项清单是空的') } });
    const base = disclosureBase(ctx);
    if (!base.netAssets && !base.totalAssets && !base.revenue && !base.netProfit) {
      blockers.push({ id: 'reg:base', level: 'block', code: 'base', message: { key: i18nKey('缺披露比例的分母：请上传最近一期经审计的科目余额表，或在参数里填写总资产、净资产、营业收入、净利润') } });
    }
    const noDate = events.filter((e) => !e.date).map((e) => e.row);
    if (noDate.length) warnings.push({ id: 'reg:no_date', level: 'warn', code: 'no_date', message: { key: i18nKey('{n} 个事项没有日期'), params: { n: noDate.length } }, rows: noDate });
    return withDatasetIssues({ checks: [], blockers, warnings }, ctx, ['events', 'tb']);
  },

  async analyze(ctx: RunCtx): Promise<AnalyzeResult> {
    const regime = regimeOf(ctx);
    const period = periodOrNull(ctx);
    ctx.progress('base', 'running');
    const base = disclosureBase(ctx);
    ctx.progress('base', 'done');
    const jur = regime === 'sa_cma' ? 'SA' : regime === 'cn_sse' ? 'CN' : 'XX';
    const rules = new RuleBook(allRules(), period?.to || nowIso().slice(0, 10), jur);
    const events = ctx.rows<'disclosure_events'>('events');
    const items = disclosureItems(events, regime, base, ctx.th('regulatory'), regime === 'sa_cma' ? rules : null);
    ctx.progress('thresholds', 'done');
    const dataChecks = reportingChecks(events, period, base);
    ctx.progress('check', 'done');

    const flagged = items.filter((i) => i.level === 'disclose' || i.level === 'shareholder');
    const verification: FauVerificationItem[] = [];
    let model: string | undefined;
    if (flagged.length) {
      ctx.progress('draft', 'running');
      const y = (c: number) => Math.round(c) / 100;
      const data = (list: typeof flagged) => ({
        regime,
        items: list.map((i) => ({
          id: i.id, date: i.date, type: i.type, description: i.description, counterparty: i.counterparty, amount: y(i.amount),
          decision: tIn(ctx.locale, i.level === 'shareholder' ? i18nKey('提交股东大会并披露') : i18nKey('及时披露')),
          tests: i.tests.filter((x) => x.hit).map((x) => ({ test: tIn(ctx.locale, x.label.key), ratioPercent: x.ratio == null ? null : Math.round(x.ratio * 10000) / 100, thresholdPercent: Math.round(x.threshold * 10000) / 100 })),
        })),
      });
      const call = (list: typeof flagged, extra = '') => runSkill(ctx.llm, {
        module: 'regulatory', skills: [{ name: 'fa-disclosure-management' }], task: DISCLOSURE_TASK + extra, data: data(list),
        outputLocale: ctx.locale, schema: disclosureSchema, narratives: (o) => o.drafts.map((d) => d.text),
        userData: list.flatMap((i) => [i.description, i.counterparty]).filter(Boolean),
      });
      const facts = (i: (typeof flagged)[number]) => ({
        amounts: [y(i.amount), ...i.tests.map((x) => (x.absMin != null ? y(x.absMin) : NaN))],
        percents: i.tests.flatMap((x) => [x.ratio == null ? NaN : x.ratio * 100, x.threshold * 100]),
        dates: [i.date].filter(Boolean),
      });
      const first = await call(flagged);
      model = first.model;
      const byId = new Map(first.data.drafts.map((d) => [d.id, d.text]));
      const failing: string[] = [];
      for (const i of flagged) {
        const text = byId.get(i.id) || '';
        const v = verifyNarrative(text, facts(i));
        i.draft = text;
        i.draftStatus = text && v.ok ? 'verified' : 'unverified';
        i.missing = v.missing;
        if (!text || !v.ok) failing.push(i.id);
      }
      if (failing.length) {
        const retry = flagged.filter((i) => failing.includes(i.id));
        try {
          const second = await call(retry, `\nYour previous drafts cited numbers or dates that are not in the item: ${retry.map((i) => `${i.id}: ${(i.missing || ['missing draft']).join(', ')}`).join('; ')}. Use only the given amount, ratios and date.`);
          model = second.model || model;
          for (const d of second.data.drafts) {
            const i = retry.find((x) => x.id === d.id);
            if (!i) continue;
            const v = verifyNarrative(d.text, facts(i));
            if (v.ok) { i.draft = d.text; i.draftStatus = 'verified'; i.missing = []; }
          }
        } catch { /* 重写失败：保留第一次的草稿（未核实） */ }
      }
      for (const i of flagged) verification.push({ id: `draft:${i.id}`, ref: `disclosure:${i.row}`, text: i.draft || '', status: i.draftStatus === 'verified' ? 'verified' : 'unverified', missing: i.missing });
      ctx.progress('draft', 'done');
    } else ctx.progress('draft', 'skipped');

    const counts = Object.fromEntries(COUNT_LEVELS.map((l) => [l, items.filter((i) => i.level === l).length])) as Record<FauDisclosureLevel, number>;
    const draftBasis = (regime === 'sa_cma' && regionProfile('SA').draftBasis) || rules.draft();
    const result: FauRegulatoryResult = { regime, base, items, counts, dataChecks, rules: rules.uses(), draftBasis };
    const reminders: FauReminder[] = [];
    if (draftBasis) reminders.push({ id: 'reg:draft_basis', source: 'engine', level: 'warn', message: { key: i18nKey('草稿口径，需当地专业人士复核：用到的地区规则尚未经当地专业人员审核') } });
    for (const i of items.filter((x) => x.level === 'shareholder')) reminders.push({ id: `reg:sh:${i.row}`, source: 'escalation', level: 'warn', message: { key: i18nKey('第 {n} 行事项达到提交股东大会的标准'), params: { n: i.row } } });
    return {
      result, verification, reminders, approveRequired: true, model,
      summary: { key: i18nKey('{n} 个事项：须披露 {m} 个（其中提交股东大会 {k} 个）'), params: { n: items.length, m: flagged.length, k: counts.shareholder } },
    };
  },

  async draft(ctx: RunCtx) {
    const run = ctx.run;
    const res = run.result as FauRegulatoryResult;
    const mode = ctx.def.modes.find((m) => m.id === run.modeId);
    const octx = {
      locale: ctx.locale, dir: ctx.outputDir(), companyName: ctx.company.name, projectName: ctx.project.name, period: ctx.project.period,
      moduleCode: ctx.def.code, moduleName: ctx.def.name, modeName: mode?.name || run.modeId, standardLabel: STANDARD_LABELS[ctx.profile.standard], model: run.model,
    };
    const out = writeRegulatoryOutputs(octx, res, { levels: run.requiredLevels });
    const art = (kind: FauArtifact['kind'], path: string, title: string): FauArtifact => ({ id: newId('art'), kind, path, sha256: sha256File(path) || '', title: { key: title }, locale: ctx.locale, createdAt: nowIso() });
    const artifacts = [art('xlsx', out.workPath, i18nKey('信息披露底稿')), art('docx', out.draftPath, i18nKey('披露草稿'))];
    return { artifacts, summary: { key: i18nKey('已生成 {n} 个文件（草稿—待签核）'), params: { n: artifacts.length } } };
  },
};
