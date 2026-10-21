/**
 * C3 转让定价 runner（H 型：R 算底稿，S 写叙述）：
 *   ③ 校验 → ④ 受测方指标（参数优先，其次科目余额表）→ 可比公司指标与四分位 → 落点与调整额 → 关联交易汇总与三层文档要求
 *   → 模型写本地文档叙述并回核（金额、百分比必须在给定数据里，回核不过重写一次，仍不过标「未核实」）→ ⑤ 底稿与本地文档草稿。
 */
import { i18nKey } from '@totalclaw/i18n';
import type { FauArtifact, FauIssue, FauRegion, FauReminder, FauSubProgress, FauTpNarrative, FauTpPli, FauTpResult, FauValidationReport, FauVerificationItem } from '@totalclaw/ipc-contracts';
import { STANDARD_LABELS, regionProfile } from '../../../../../shared/financeAudit/regions';
import type { AnalyzeResult, ModuleRunner, RunCtx } from '../../runner';
import { runSkill } from '../../skillRunner';
import { verifyNarrative } from '../../verify';
import { sha256File } from '../../signoff';
import { newId, nowIso } from '../../store';
import { writeTpOutputs } from '../../outputs/tax';
import { TP_SECTIONS, TP_TASK, tpSchema } from '../../prompts/tp';
import { withDatasetIssues } from '../accounting/closeRunner';
import { RuleBook, allRules, classifyTb, isTaxExpenseLine, paramCents, taxPeriod } from './common';
import { rptSummary, tpAdjustment, tpDocRequirements, tpFindings, tpPosition, tpRange } from './tp';

const SUB: Record<string, string> = {
  tpPli: i18nKey('受测方与可比公司利润水平指标'), tpQuartiles: i18nKey('四分位区间与落点'), tpDocRequirement: i18nKey('三层文档要求'), tpNarrative: i18nKey('模型写本地文档叙述并回核'),
};
const HEADING: Record<string, string> = {
  overview: i18nKey('关联交易概况'), method: i18nKey('转让定价方法选择'), comparability: i18nKey('可比性分析'), conclusion: i18nKey('结论'),
};
const POS_SUMMARY: Record<string, string> = {
  below: i18nKey('可比公司 {n} 家，受测方低于下四分位'), within: i18nKey('可比公司 {n} 家，受测方在四分位区间内'),
  above: i18nKey('可比公司 {n} 家，受测方高于上四分位'), na: i18nKey('可比公司 {n} 家，受测方落点无法判断'),
};
/** 营业利润不含：所得税 / 天课、财务费用、投资收益、营业外收支 */
const NON_OPERATING = new Set(['financeCost', 'finance', 'investIncome', 'nonOpIncome', 'nonOpExpense']);

export function tpJurisdiction(ctx: Pick<RunCtx, 'run' | 'company'>): FauRegion {
  const j = String(ctx.run.params.tpJurisdiction || '');
  return (['CN', 'SA', 'AE', 'INTL'].includes(j) ? j : ctx.company.region) as FauRegion;
}

export function testedParty(ctx: RunCtx): FauTpResult['tested'] & { source: 'params' | 'tb' } {
  const pr = ctx.run.params as Record<string, unknown>;
  const given = { revenue: paramCents(pr.testedRevenue), operatingProfit: paramCents(pr.testedOperatingProfit), totalCost: paramCents(pr.testedTotalCost) };
  if (given.revenue || given.totalCost || !ctx.run.inputs.tb?.length) {
    const totalCost = given.totalCost || (given.revenue ? given.revenue - given.operatingProfit : 0);
    return { ...given, totalCost, pli: null, source: 'params' };
  }
  const rows = classifyTb(ctx.rows<'tb'>('tb'), ctx.company, ctx.profile.standard);
  let revenue = 0;
  let cost = 0;
  for (const r of rows) {
    if (NON_OPERATING.has(r.line) || isTaxExpenseLine(r)) continue;
    if (r.cls === 'revenue') revenue += r.periodCr - r.periodDr;
    else if (r.cls === 'expense') cost += r.periodDr - r.periodCr;
  }
  return { revenue, totalCost: cost, operatingProfit: revenue - cost, pli: null, source: 'tb' };
}

export const tpRunner: ModuleRunner = {
  subSteps(modeId: string): FauSubProgress[] {
    const ids = modeId === 'benchmark' ? ['tpPli', 'tpQuartiles'] : ['tpPli', 'tpQuartiles', 'tpDocRequirement', 'tpNarrative'];
    return ids.map((id) => ({ id, label: { key: SUB[id] }, status: 'todo' }));
  },

  async validate(ctx: RunCtx): Promise<FauValidationReport> {
    const blockers: FauIssue[] = [];
    const warnings: FauIssue[] = [];
    const comps = ctx.rows<'tp_comparables'>('comparables');
    const noPli = comps.filter((c) => c.pli == null && (c.operatingProfit == null || (c.totalCost == null && c.revenue == null))).map((c) => c.row);
    if (comps.length && noPli.length === comps.length) blockers.push({ id: 'tp:no_pli', level: 'block', code: 'no_pli', message: { key: i18nKey('可比公司都缺营业利润或分母，算不出利润水平指标') }, rows: noPli });
    else if (noPli.length) warnings.push({ id: 'tp:some_no_pli', level: 'warn', code: 'some_no_pli', message: { key: i18nKey('{n} 家可比公司缺数据，不参与计算'), params: { n: noPli.length } }, rows: noPli });
    const t = testedParty(ctx);
    if (!t.revenue && !t.totalCost) blockers.push({ id: 'tp:tested', level: 'block', code: 'tested', message: { key: i18nKey('缺受测方财务数据：请上传受测方科目余额表，或在参数里填写营业收入、营业利润与总成本') } });
    const j = tpJurisdiction(ctx);
    if (!ctx.company.regions.includes(j) && j !== 'INTL') warnings.push({ id: 'tp:region', level: 'warn', code: 'region', message: { key: i18nKey('转让定价按「{p0}」口径判断，但公司档案没有选这个地区'), params: { p0: regionProfile(j).name } } });
    return withDatasetIssues({ checks: [], blockers, warnings }, ctx, ['rpt', 'comparables', 'tb']);
  },

  async analyze(ctx: RunCtx): Promise<AnalyzeResult> {
    const pr = ctx.run.params as Record<string, unknown>;
    const j = tpJurisdiction(ctx);
    const kind: FauTpPli = pr.pli === 'om' ? 'om' : 'ncp';
    let asOf = nowIso().slice(0, 10);
    try { asOf = taxPeriod(String(pr.period || ctx.project.period || ''), ctx.company.fiscalYearStartMonth).to; } catch { /* 用今天 */ }
    const rules = new RuleBook(allRules(), asOf, j === 'INTL' ? 'XX' : j);
    ctx.progress('tpPli', 'running');
    const t = testedParty(ctx);
    const tested = { ...t, pli: kind === 'ncp' ? (t.totalCost ? t.operatingProfit / t.totalCost : null) : (t.revenue ? t.operatingProfit / t.revenue : null) };
    const { comparables, range } = tpRange(ctx.rows<'tp_comparables'>('comparables'), kind);
    ctx.progress('tpPli', 'done');
    const position = tpPosition(tested.pli, range);
    const adjustment = tpAdjustment(tested, kind, range, position);
    ctx.progress('tpQuartiles', 'done');
    const rptRows = ctx.rows<'rp_transactions'>('rpt');
    const { rpt, total: rptTotal } = rptSummary(rptRows);
    const docs = ctx.run.modeId === 'benchmark' ? [] : tpDocRequirements({
      jurisdiction: j, rpt, rptTotal, entityRevenue: tested.revenue, groupRevenue: paramCents(pr.groupRevenue), groupHasMasterFile: pr.groupHasMasterFile === true,
      prepared: { disclosure: pr.hasDisclosure === true, master: pr.hasMasterFile === true, local: pr.hasLocalFile === true, cbcr: pr.hasCbcr === true },
      intlCbcrThreshold: paramCents(pr.intlCbcrThreshold) || ctx.th('transfer-pricing')['intlCbcr.floor'], rules,
    });
    if (ctx.run.modeId !== 'benchmark') ctx.progress('tpDocRequirement', 'done');
    const crossBorderIntangible = rptRows.some((r) => (r.type === 'intangible_transfer' || r.type === 'intangible_license') && r.jurisdiction && r.jurisdiction.toUpperCase() !== j);
    const findings = tpFindings({ range, position, minComparables: ctx.th('transfer-pricing').minComparables, docs, rpt, crossBorderIntangible });

    const narrative: FauTpNarrative[] = [];
    const verification: FauVerificationItem[] = [];
    let model: string | undefined;
    if (ctx.run.modeId !== 'benchmark') {
      ctx.progress('tpNarrative', 'running');
      const y = (c: number) => Math.round(c) / 100;
      const pc = (v: number | null) => (v == null ? null : Math.round(v * 10000) / 100);
      const data = {
        jurisdiction: j, pli: kind === 'ncp' ? 'net cost plus (operating profit / total costs)' : 'operating margin (operating profit / revenue)',
        relatedPartyTransactions: rpt.map((g) => ({ type: g.type, count: g.count, amount: y(g.amount) })), relatedPartyTotal: y(rptTotal),
        testedParty: { revenue: y(tested.revenue), operatingProfit: y(tested.operatingProfit), totalCost: y(tested.totalCost), pliPercent: pc(tested.pli) },
        range: range ? { n: range.n, minPercent: pc(range.min), q1Percent: pc(range.q1), medianPercent: pc(range.median), q3Percent: pc(range.q3), maxPercent: pc(range.max) } : null,
        position, adjustmentToMedian: adjustment ? y(adjustment.amount) : null,
      };
      const facts = {
        amounts: [y(rptTotal), ...rpt.map((g) => y(g.amount)), y(tested.revenue), y(tested.operatingProfit), y(tested.totalCost), ...(adjustment ? [y(adjustment.amount)] : [])],
        percents: [tested.pli, range?.min, range?.q1, range?.median, range?.q3, range?.max].filter((v): v is number => v != null).map((v) => v * 100),
      };
      const call = (extra = '') => runSkill(ctx.llm, {
        module: 'transfer-pricing', skills: [{ name: 'fa-transfer-pricing-documentation-master' }, { name: 'fa-comparable-analysis-tp' }], task: TP_TASK + extra, data,
        outputLocale: ctx.locale, schema: tpSchema, narratives: (o) => o.sections.map((s) => s.text),
        userData: [...comparables.map((c) => c.name), ...rptRows.map((r) => r.counterparty)].filter(Boolean),
      });
      const first = await call();
      model = first.model;
      let sections = first.data.sections;
      const check = (list: typeof sections) => TP_SECTIONS.map((id) => {
        const text = list.find((s) => s.id === id)?.text || '';
        const v = verifyNarrative(text, facts);
        return { id, text, ok: !!text && v.ok, missing: v.missing };
      });
      let checked = check(sections);
      const bad = checked.filter((c) => !c.ok);
      if (bad.length) {
        try {
          const second = await call(`\nYour previous sections cited numbers that are not in data: ${bad.map((b) => `${b.id}: ${b.missing.join(', ') || 'missing section'}`).join('; ')}. Use only the numbers in data.`);
          model = second.model || model;
          const again = check(second.data.sections);
          checked = checked.map((c) => (c.ok ? c : again.find((a) => a.id === c.id && a.ok) || c));
          sections = second.data.sections;
        } catch { /* 重写失败：保留第一次（未核实） */ }
      }
      for (const c of checked) {
        narrative.push({ id: c.id, heading: { key: HEADING[c.id] }, text: c.text, status: c.ok ? 'verified' : 'unverified', missing: c.missing });
        verification.push({ id: `tp:${c.id}`, ref: `tp:${c.id}`, text: c.text, status: c.ok ? 'verified' : 'unverified', missing: c.missing });
      }
      ctx.progress('tpNarrative', 'done');
    }

    const draftBasis = regionProfile(j).draftBasis || rules.draft();
    const result: FauTpResult = { jurisdiction: j, pli: kind, tested, comparables, range, position, adjustment, rpt, rptTotal, docs, findings, narrative, rules: rules.uses(), draftBasis };
    const reminders: FauReminder[] = [];
    if (draftBasis) reminders.push({ id: 'tp:draft_basis', source: 'engine', level: 'warn', message: { key: i18nKey('草稿口径，需当地专业人士复核：用到的地区规则尚未经当地专业人员审核') } });
    findings.filter((f) => f.level === 'high').forEach((f) => reminders.push({ id: `tp:${f.id}`, source: 'escalation', level: 'warn', message: f.title }));
    return {
      result, verification, reminders, approveRequired: true, model,
      summary: { key: POS_SUMMARY[position], params: { n: range?.n || 0 } },
    };
  },

  async draft(ctx: RunCtx) {
    const run = ctx.run;
    const res = run.result as FauTpResult;
    const mode = ctx.def.modes.find((m) => m.id === run.modeId);
    const octx = {
      locale: ctx.locale, dir: ctx.outputDir(), companyName: ctx.company.name, projectName: ctx.project.name, period: ctx.project.period,
      moduleCode: ctx.def.code, moduleName: ctx.def.name, modeName: mode?.name || run.modeId, standardLabel: STANDARD_LABELS[ctx.profile.standard], model: run.model,
    };
    const out = writeTpOutputs(octx, res, { levels: run.requiredLevels });
    const art = (kind: FauArtifact['kind'], path: string, title: string): FauArtifact => ({ id: newId('art'), kind, path, sha256: sha256File(path) || '', title: { key: title }, locale: ctx.locale, createdAt: nowIso() });
    const artifacts = [art('xlsx', out.workPath, i18nKey('转让定价底稿')), art('docx', out.docPath, i18nKey('本地文档草稿'))];
    return { artifacts, summary: { key: i18nKey('已生成 {n} 个文件（草稿—待签核）'), params: { n: artifacts.length } } };
  },
};
