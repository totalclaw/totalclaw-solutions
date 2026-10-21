/**
 * B4 报表与底稿复核 runner（第 5.6 节，规则型，不调模型）：
 *   报表勾稽与底稿质检：余额表 → 复用 A1 试算与勾稽引擎（四项勾稽 + 期初衔接）；底稿 xlsx（含 A1 转交过来的关账包）
 *     → audit-xls 规则（model 档）；交叉索引核对；有严重问题 / 勾稽不过 / 断链 → 建议暂扣；
 *   基金 LP 对账单复核：NAV 包重算每个 LP 的资本账户，逐行比对（容差 0.01）→ 每个 LP 放行 / 暂扣建议。
 */
import { existsSync } from 'node:fs';
import { basename, extname, join } from 'node:path';
import { i18nKey } from '@totalclaw/i18n';
import * as XLSX from 'xlsx';
import type { FauMsg, FauReminder, FauReviewResult, FauValidationReport, FauXlsFinding } from '@totalclaw/ipc-contracts';
import type { AnalyzeResult, ModuleRunner, RunCtx } from '../../runner';
import { trialBalance } from '../accounting/close/trial';
import { withDatasetIssues } from '../accounting/closeRunner';
import { artifact, blockIssue, msg, outputCtx, reminder, step, subSteps, warnIssue } from './common';
import { missingColumnsIssue, readDatasetTable } from './table';
import { auditWorkbook, readWorkbookForAudit } from './review/xlsAudit';
import { crossIndex, type PaperText } from './review/crossRef';
import { parseLpStatements, parseNavFund, parseNavLp, tieOut } from './review/navTieout';
import { writeReviewOutputs } from './review/output';

const SUB: Record<string, string> = {
  trialBalance: i18nKey('试算与勾稽'), xlsAudit: i18nKey('底稿质检'), crossIndex: i18nKey('交叉索引核对'), navTieout: i18nKey('LP 资本账户重算'),
};

/** 要质检的底稿：上传的 xlsx + A1 / 其它模块转交过来、已签核归档的 xlsx（归档副本） */
function papersOf(ctx: RunCtx): Array<{ name: string; path: string }> {
  const out = ctx.datasets('papers').filter((m) => /\.xls[xm]?$/i.test(m.fileName)).map((m) => ({ name: m.fileName, path: m.storedPath }));
  for (const h of ctx.store.handoffs(ctx.company.id, ctx.project.id).filter((x) => x.toModuleId === 'review')) {
    const src = ctx.store.findRun(ctx.company.id, h.fromRunId, ctx.project.id);
    if (!src || src.status !== 'archived') continue;
    const dir = ctx.store.archiveDir(ctx.company.id, ctx.project.id, src.id);
    for (const a of src.artifacts.filter((x) => x.kind === 'xlsx')) {
      const p = join(dir, basename(a.path));
      if (existsSync(p)) out.push({ name: basename(a.path), path: p });
    }
  }
  return out;
}

function cellTexts(wb: XLSX.WorkBook): string[] {
  const out: string[] = [];
  for (const n of wb.SheetNames) {
    for (const [k, c] of Object.entries(wb.Sheets[n])) if (!k.startsWith('!') && typeof (c as XLSX.CellObject).v === 'string') out.push(String((c as XLSX.CellObject).v));
  }
  return out;
}

export const reviewRunner: ModuleRunner = {
  subSteps(modeId) {
    return subSteps(modeId === 'fund' ? ['navTieout'] : ['trialBalance', 'xlsAudit', 'crossIndex'], SUB);
  },

  async validate(ctx) {
    const r: FauValidationReport = { checks: [], blockers: [], warnings: [] };
    if (ctx.run.modeId === 'fund') {
      const slots: Array<[string, Parameters<typeof readDatasetTable>[1], string]> = [['lpStatements', 'lpStatement', i18nKey('LP 对账单')], ['navLp', 'navLp', i18nKey('NAV 包：LP 资本账户')], ['navFund', 'navFund', i18nKey('NAV 包：基金损益')]];
      for (const [slot, table, label] of slots) {
        const meta = ctx.datasets(slot)[0];
        if (!meta) continue;
        const p = readDatasetTable(meta, table);
        const iss = missingColumnsIssue(p, label);
        if (iss) r.blockers.push(iss);
        else if (slot === 'navFund') {
          const { missing } = parseNavFund(p);
          if (missing.length) r.blockers.push(blockIssue('nav_fund_items', i18nKey('基金损益表缺少这些项目：{p0}'), { p0: missing.join(', ') }));
        }
      }
      return r;
    }
    const tb = ctx.rows<'tb'>('tb');
    if (!tb.length) r.blockers.push(blockIssue('tb_empty', i18nKey('科目余额表是空的')));
    for (const m of ctx.datasets('papers').filter((x) => !/\.xls[xm]?$/i.test(x.fileName))) {
      r.warnings.push(warnIssue(`not_xlsx:${m.id}`, i18nKey('{p0} 不是 Excel 文件，不做底稿质检'), { p0: m.fileName }));
    }
    return withDatasetIssues(r, ctx, ['tb', 'tbPrior', 'journal']);
  },

  async analyze(ctx): Promise<AnalyzeResult> {
    const th = ctx.th('review');
    const reasons: FauMsg[] = [];
    const reminders: FauReminder[] = [];
    if (ctx.run.modeId === 'fund') {
      const read = (slot: string, table: Parameters<typeof readDatasetTable>[1]) => readDatasetTable(ctx.datasets(slot)[0], table);
      const nav = await step(ctx, 'navTieout', () => {
        const { fund } = parseNavFund(read('navFund', 'navFund'));
        return { ...tieOut(parseLpStatements(read('lpStatements', 'lpStatement')), parseNavLp(read('navLp', 'navLp')), fund, th['nav.tolerance'] ?? 1), fundNav: fund.fundNav ?? 0 };
      });
      const held = nav.lps.filter((x) => x.decision === 'hold');
      if (held.length) reasons.push(msg(i18nKey('{n} 个 LP 对账单与重算不一致：{p0}'), { n: held.length, p0: held.map((x) => x.lpId).join(', ') }));
      if (!nav.navTies) reasons.push(msg(i18nKey('LP 期末资本合计与基金净值不一致')));
      for (const lp of held) reminders.push(reminder(`rv:lp:${lp.lpId}`, 'escalation', i18nKey('LP {p0} 的对账单建议暂扣'), { p0: lp.lpId }));
      const result: FauReviewResult = { mode: 'fund', nav, recommendation: reasons.length ? 'hold' : 'release', reasons };
      return { result, reminders, approveRequired: reasons.length > 0, summary: { key: i18nKey('LP {n} 个，放行 {m} 个、暂扣 {h} 个'), params: { n: nav.lps.length, m: nav.lps.length - held.length, h: held.length } } };
    }

    const journal = ctx.rows<'journal'>('journal');
    const tbPrior = ctx.run.inputs.tbPrior?.length ? ctx.rows<'tb'>('tbPrior') : null;
    const trial = await step(ctx, 'trialBalance', () => trialBalance({ tb: ctx.rows<'tb'>('tb'), tbPrior, journal, reportBasis: ctx.profile.reportBasis, accountMap: ctx.company.accountMap, th: ctx.th('close') }));
    // 缺数据无法执行的勾稽（没给序时账 / 上期余额表）不算不通过，只提醒
    const notRun = (id: string) => (id === 'cashflow' && !journal.length) || (id === 'opening' && !tbPrior);
    for (const c of trial.checks.filter((x) => !x.ok)) {
      if (notRun(c.id)) reminders.push(reminder(`rv:skip:${c.id}`, 'engine', c.message.key, c.message.params as Record<string, string | number>));
      else reasons.push(c.message);
    }
    const papers = papersOf(ctx);
    const xls: FauXlsFinding[] = [];
    const files: NonNullable<FauReviewResult['files']> = [];
    const texts: PaperText[] = [];
    await step(ctx, 'xlsAudit', () => {
      for (const p of papers) {
        const wb = readWorkbookForAudit(p.path);
        const r = auditWorkbook(wb, p.name, { scope: 'model', sumGapRows: th['xls.sumGapRows'] ?? 1 });
        xls.push(...r.findings);
        files.push({ file: p.name, sheets: r.sheets, formulas: r.formulas, findings: r.findings.length });
        texts.push({ file: p.name, sheets: wb.SheetNames, cells: cellTexts(wb) });
      }
    });
    const crit = xls.filter((f) => f.severity === 'critical');
    if (crit.length) reasons.push(msg(i18nKey('底稿有 {n} 处严重问题（错误值、断链、求和漏行或资产负债不平）'), { n: crit.length }));
    const projectFiles = ctx.store.listRuns(ctx.company.id, ctx.project.id).flatMap((r) => r.artifacts.map((a) => basename(a.path, extname(a.path))));
    const crossRefs = await step(ctx, 'crossIndex', () => crossIndex(texts, projectFiles));
    const broken = crossRefs.filter((x) => !x.found);
    if (broken.length) reasons.push(msg(i18nKey('{n} 个交叉索引找不到对应底稿'), { n: broken.length }));
    for (const c of crit.slice(0, 20)) reminders.push(reminder(`rv:xls:${c.id}`, 'escalation', i18nKey('{p0} {p1}!{p2}：严重问题'), { p0: c.file, p1: c.sheet, p2: c.cell }));
    const result: FauReviewResult = { mode: 'statements', trial, xls, files, crossRefs, recommendation: reasons.length ? 'hold' : 'release', reasons };
    return {
      result, reminders, approveRequired: reasons.length > 0,
      summary: { key: i18nKey('勾稽 {n} 项不通过，底稿问题 {m} 处（严重 {c}），断链 {b} 个'), params: { n: trial.checks.filter((x) => !x.ok && !notRun(x.id)).length, m: xls.length, c: crit.length, b: broken.length } },
    };
  },

  async draft(ctx) {
    const res = ctx.run.result as FauReviewResult;
    const artifacts = writeReviewOutputs(outputCtx(ctx), res, ctx.run.requiredLevels).map((o) => artifact(ctx, o.kind, o.path, o.title));
    return { artifacts, summary: { key: i18nKey('已生成 {n} 个文件（草稿—待签核）'), params: { n: artifacts.length } } };
  },
};
