/**
 * A1 月结关账 runner（第 5.5 节）：③ 校验 → ④ 六个引擎（子进度）+ 模型写波动说明并回核 → ⑤ 关账包 / 备忘录 / 分录导入草稿。
 * 金额全部由引擎（纯函数）算；模型只写「为什么」，说明里的数字回核不过重写一次，仍不过标「未核实」。
 */
import { i18nKey, tIn } from '@totalclaw/i18n';
import type {
  FauArtifact, FauCloseResult, FauFluxLine, FauReminder, FauSubProgress, FauValidationReport, FauVerificationItem,
} from '@totalclaw/ipc-contracts';
import { STANDARD_LABELS } from '../../../../../shared/financeAudit/regions';
import type { AnalyzeResult, ModuleRunner, RunCtx } from '../../runner';
import { runSkill } from '../../skillRunner';
import { verifyNumbers } from '../../verify';
import { sha256File } from '../../signoff';
import { newId, nowIso } from '../../store';
import { writeCloseOutputs } from '../../outputs/close';
import { FLUX_TASK, fluxSchema } from '../../prompts/close';
import type { AccrualPolicyRow, BudgetRow, FxRateRow, JournalRow, ManualChecklist, TbRow } from '../../types';
import { inPeriod } from './common';
import { closeChecklist } from './close/checklist';
import { trialBalance } from './close/trial';
import { crossPeriod } from './close/crossPeriod';
import { accrualSchedule } from './close/accrual';
import { rollForward } from './close/rollForward';
import { fluxFacts, fluxLines } from './close/flux';
import { closeValidation } from './close/validate';

const ENGINE_LABEL: Record<string, string> = {
  closeChecklist: i18nKey('关账清单'),
  trialBalance: i18nKey('试算与勾稽'),
  crossPeriod: i18nKey('跨期调整'),
  accrualSchedule: i18nKey('计提表'),
  rollForward: i18nKey('滚动表'),
  flux: i18nKey('波动说明'),
  commentary: i18nKey('模型写波动说明并回核'),
};

/** 期间：月结项目用项目期间，否则取运行参数 */
export function periodOf(ctx: Pick<RunCtx, 'project' | 'run'>): string {
  if (/^\d{4}-\d{2}$/.test(ctx.project.period)) return ctx.project.period;
  const p = String(ctx.run.params.period || '');
  return /^\d{4}-\d{2}$/.test(p) ? p : ctx.project.period;
}

function enginesOf(ctx: Pick<RunCtx, 'def' | 'run'>): string[] {
  return ctx.def.modes.find((m) => m.id === ctx.run.modeId)?.engines || [];
}

/** 合并数据集解析时记下的问题（带行号）到第 ③ 步报告 */
export function withDatasetIssues(report: FauValidationReport, ctx: RunCtx, slots: string[]): FauValidationReport {
  const out: FauValidationReport = { checks: [...report.checks], blockers: [...report.blockers], warnings: [...report.warnings] };
  for (const s of slots) {
    for (const m of ctx.datasets(s)) {
      for (const iss of m.issues) (iss.level === 'block' ? out.blockers : out.warnings).push({ ...iss, message: { ...iss.message, params: { ...(iss.message.params || {}), file: m.fileName } } });
    }
  }
  return out;
}

export async function writeFluxCommentary(ctx: RunCtx, lines: FauFluxLine[]): Promise<{ lines: FauFluxLine[]; verification: FauVerificationItem[]; model?: string }> {
  if (!lines.length) return { lines, verification: [] };
  const unknownPhrase = tIn(ctx.locale, i18nKey('原因不明，待主管确认'));
  const y = (c: number | null) => (c == null ? null : Math.round(c) / 100);
  const toData = (ls: FauFluxLine[]) => ({
    unknownPhrase,
    lines: ls.map((l) => ({
      accountCode: l.accountCode, accountName: l.accountName, current: y(l.current), prior: y(l.prior), diffPrior: y(l.diffPrior),
      diffPriorPct: l.diffPriorPct == null ? null : Math.round(l.diffPriorPct * 10000) / 100, budget: y(l.budget), diffBudget: y(l.diffBudget),
      drivers: l.drivers.map((d) => ({ label: d.label, amount: y(d.amount), count: d.count })),
    })),
  });
  const userData = lines.flatMap((l) => [l.accountName, ...l.drivers.map((d) => d.label)]);
  const call = (ls: FauFluxLine[], extra = '') => runSkill(ctx.llm, {
    module: 'close', skills: [{ name: 'fa-variance-commentary' }], task: FLUX_TASK + extra, data: toData(ls),
    outputLocale: ctx.locale, schema: fluxSchema, narratives: (o) => o.lines.filter((x) => !x.unknown).map((x) => x.commentary), userData,
  });
  const first = await call(lines);
  let model = first.model;
  const byCode = new Map(first.data.lines.map((x) => [x.accountCode, x]));
  const result = lines.map((l) => ({ ...l }));
  const failing: Array<{ line: FauFluxLine; missing: string[] }> = [];
  for (const l of result) {
    const got = byCode.get(l.accountCode);
    if (!got) { l.commentary = unknownPhrase; l.commentaryStatus = 'unknown'; continue; }
    if (got.unknown) { l.commentary = unknownPhrase; l.commentaryStatus = 'unknown'; continue; }
    const f = fluxFacts(l);
    const chk = verifyNumbers(got.commentary, f.amounts, f.percents);
    l.commentary = got.commentary;
    l.commentaryStatus = chk.ok ? 'verified' : 'unverified';
    if (!chk.ok) failing.push({ line: l, missing: chk.missing });
  }
  // 说明里的数字找不到：带着问题重写一次，仍不行就标「未核实」
  if (failing.length) {
    const feedback = `\nThese numbers are NOT in the given data and must not be used: ${failing.map((x) => `${x.line.accountCode}: ${x.missing.join(', ')}`).join('; ')}. Rewrite only these lines.`;
    try {
      const second = await call(failing.map((x) => x.line), feedback);
      model = second.model || model;
      for (const x of second.data.lines) {
        const l = result.find((r) => r.accountCode === x.accountCode && r.commentaryStatus === 'unverified');
        if (!l) continue;
        if (x.unknown) { l.commentary = unknownPhrase; l.commentaryStatus = 'unknown'; continue; }
        const f = fluxFacts(l);
        if (verifyNumbers(x.commentary, f.amounts, f.percents).ok) { l.commentary = x.commentary; l.commentaryStatus = 'verified'; }
      }
    } catch { /* 重写失败：保留第一次的文字，标未核实 */ }
  }
  const verification: FauVerificationItem[] = result.filter((l) => l.commentary && l.commentaryStatus !== 'unknown').map((l) => {
    const f = fluxFacts(l);
    const chk = verifyNumbers(l.commentary, f.amounts, f.percents);
    return { id: `flux:${l.accountCode}`, ref: `flux:${l.accountCode}`, text: l.commentary, status: chk.ok ? 'verified' : 'unverified', missing: chk.missing.length ? chk.missing : undefined };
  });
  return { lines: result, verification, model };
}

export const closeRunner: ModuleRunner = {
  subSteps(modeId: string): FauSubProgress[] {
    const engines = ({ standard: 1, expedite: 1 } as Record<string, number>)[modeId]
      ? ['trialBalance', 'accrualSchedule', 'closeChecklist', 'crossPeriod', 'rollForward', 'flux', 'commentary']
      : modeId === 'accrual_only' ? ['accrualSchedule'] : ['flux', 'commentary'];
    return engines.map((id) => ({ id, label: { key: ENGINE_LABEL[id] }, status: 'todo' }));
  },

  async validate(ctx: RunCtx): Promise<FauValidationReport> {
    const report = closeValidation({
      period: periodOf(ctx), journal: ctx.rows<'journal'>('journal'), tb: ctx.rows<'tb'>('tb'),
      tbPrior: ctx.run.inputs.tbPrior?.length ? ctx.rows<'tb'>('tbPrior') : null,
      accountMap: ctx.company.accountMap, reportBasis: ctx.profile.reportBasis, th: ctx.th('close'),
    });
    return withDatasetIssues(report, ctx, ['journal', 'tb', 'tbPrior', 'budget', 'accrualPolicy', 'fxRates']);
  },

  async analyze(ctx: RunCtx): Promise<AnalyzeResult> {
    const period = periodOf(ctx);
    const engines = enginesOf(ctx);
    const th = ctx.th('close');
    const basis = ctx.profile.reportBasis;
    const map = ctx.company.accountMap;
    const journalAll: JournalRow[] = ctx.rows<'journal'>('journal');
    const journal = journalAll.filter((j) => inPeriod(j.date, period));
    const tb: TbRow[] = ctx.rows<'tb'>('tb');
    const tbPrior: TbRow[] | null = ctx.run.inputs.tbPrior?.length ? ctx.rows<'tb'>('tbPrior') : null;
    const budget: BudgetRow[] | null = ctx.run.inputs.budget?.length ? ctx.rows<'budget'>('budget') : null;
    const policies: AccrualPolicyRow[] = ctx.rows<'accrual_policy'>('accrualPolicy');
    const fxRates: FxRateRow[] = ctx.rows<'fx_rates'>('fxRates');
    const res: FauCloseResult = { period, engines, openItems: ctx.openItems() };
    const reminders: FauReminder[] = [];
    let approveRequired = false;
    let model: string | undefined;
    const step = async <T>(id: string, fn: () => T | Promise<T>): Promise<T> => {
      ctx.progress(id, 'running');
      try {
        const v = await fn();
        ctx.progress(id, 'done');
        return v;
      } catch (e) {
        ctx.progress(id, 'failed');
        throw e;
      }
    };

    if (engines.includes('trialBalance')) {
      res.trial = await step('trialBalance', () => trialBalance({ tb, tbPrior, journal, reportBasis: basis, accountMap: map, th }));
      for (const c of res.trial.checks.filter((x) => !x.ok)) {
        reminders.push({ id: `tie:${c.id}`, source: 'escalation', level: 'warn', message: c.message });
        if (c.tier !== 'ignore' && c.tier !== 'locate') approveRequired = true;
      }
      if (!res.trial.balanced) approveRequired = true;
    }
    if (engines.includes('accrualSchedule')) {
      const out = await step('accrualSchedule', () => accrualSchedule({ period, journal, tb, policies, th }));
      res.accruals = out.lines;
      res.jeDraft = out.je;
    }
    if (engines.includes('closeChecklist')) {
      const bankReconDone = ctx.store.listRuns(ctx.company.id, ctx.project.id, 'recon')
        .some((r) => r.modeId === 'bank' && ['ready', 'signing', 'archived'].includes(r.status));
      res.checklist = await step('closeChecklist', () => closeChecklist({
        period, journal, tb, trialBalanced: res.trial ? res.trial.balanced : null, bankReconDone,
        accrualRan: !!res.accruals, fxRates, hasForeignCurrency: journalAll.some((j) => j.currency && j.currency !== ctx.company.currency),
        manual: (ctx.run.params.manualChecklist || {}) as ManualChecklist,
      }, th));
      if (!res.checklist.canStart) reminders.push({ id: 'checklist:cannot_start', source: 'engine', level: 'warn', message: { key: i18nKey('关账清单判定暂不能开始结账：{p0}'), params: { p0: String(res.checklist.reasons.length) } } });
    }
    if (engines.includes('crossPeriod')) {
      res.crossPeriod = await step('crossPeriod', () => crossPeriod({ period, journal: journalAll, th, reportBasis: basis, accountMap: map }));
      for (const x of res.crossPeriod.filter((c) => c.approval === 'approver')) {
        approveRequired = true;
        reminders.push({ id: `cp:${x.id}`, source: 'escalation', level: 'warn', approverOnly: true, message: { key: i18nKey('跨期调整 {p0}（凭证 {p1}）须批准人逐条确认'), params: { p0: (x.amount / 100).toFixed(2), p1: x.voucherNo } } });
      }
    }
    if (engines.includes('rollForward')) {
      const accounts = Array.isArray(ctx.run.params.rollAccounts) ? (ctx.run.params.rollAccounts as unknown[]).map(String) : [];
      res.rollForward = await step('rollForward', () => rollForward({ period, journal, tb, accounts, th, reportBasis: basis, accountMap: map }));
      for (const r of res.rollForward.filter((x) => x.unexplained !== 0)) {
        reminders.push({ id: `rf:${r.accountCode}`, source: 'engine', level: 'warn', message: { key: i18nKey('滚动表 {p0} 有未解释差异 {p1}，未倒挤'), params: { p0: `${r.accountCode} ${r.accountName}`, p1: (r.unexplained / 100).toFixed(2) } } });
      }
    }
    let verification: FauVerificationItem[] = [];
    if (engines.includes('flux')) {
      const lines = await step('flux', () => fluxLines({ tb, tbPrior, budget, journal, reportBasis: basis, th, accountMap: map, period }));
      const out = await step('commentary', () => writeFluxCommentary(ctx, lines));
      res.flux = out.lines;
      verification = out.verification;
      model = out.model;
    }
    const cp = res.crossPeriod?.length || 0;
    return {
      result: res, verification, reminders, approveRequired, model,
      summary: {
        key: i18nKey('试算{p0}，跨期 {a} 笔，计提 {b} 条，波动说明 {c} 行'),
        params: { p0: res.trial ? (res.trial.balanced ? '✓' : '✗') : '-', a: cp, b: res.accruals?.length || 0, c: res.flux?.length || 0 },
      },
    };
  },

  async draft(ctx: RunCtx) {
    const run = ctx.run;
    const res = run.result as FauCloseResult;
    const mode = ctx.def.modes.find((m) => m.id === run.modeId);
    const out = writeCloseOutputs({
      locale: ctx.locale, dir: ctx.outputDir(), companyName: ctx.company.name, projectName: ctx.project.name, period: res.period,
      moduleCode: ctx.def.code, moduleName: ctx.def.name, modeName: mode?.name || run.modeId, standardLabel: STANDARD_LABELS[ctx.profile.standard], model: run.model,
    }, res, { reminders: run.reminders, levels: run.requiredLevels });
    const art = (kind: FauArtifact['kind'], path: string, title: string): FauArtifact => ({ id: newId('art'), kind, path, sha256: sha256File(path) || '', title: { key: title }, locale: ctx.locale, createdAt: nowIso() });
    const artifacts = [art('xlsx', out.packagePath, i18nKey('关账包')), art('docx', out.memoPath, i18nKey('关账备忘录'))];
    if (out.jePath) artifacts.push(art('je_import_xlsx', out.jePath, i18nKey('凭证导入草稿')));
    return { artifacts, summary: { key: i18nKey('已生成 {n} 个文件（草稿—待签核）'), params: { n: artifacts.length } } };
  },
};
