/**
 * B3 外审配合与函证 runner（第 5.6 节）：
 *   资料清单与审计调整：PBC 清单（+ A1 / B4 转交过来的已签核底稿）→ 进度与超期；调整分录 → 对利润 / 资产 / 负债 / 权益的影响，
 *     超过重要性水平标出，利润影响合计超过门槛须 CFO 审批；
 *   函证准备：函证清单 → 函证控制表 + 每份一份询证函 docx（草稿）。**不发送**：签核归档后由人点「发送」、在确认框再确认
 *     （audit.actions 的 ext-audit.confirm.prepareSend / send，一次性令牌），才交给邮件发送；
 *   回函核对：回函按函证编号归集 → 模型只抽确认金额与原文引用（不给工具）→ 代码核对引用在原文、金额在引用里 →
 *     差异、未回函（超 N 天）、回函率、替代程序。
 */
import { i18nKey } from '@totalclaw/i18n';
import type { FauConfirmation, FauExtAuditResult, FauReminder, FauRun, FauValidationReport, FauVerificationItem } from '@totalclaw/ipc-contracts';
import type { AnalyzeResult, ModuleRunner, RunCtx } from '../../runner';
import { runSkill } from '../../skillRunner';
import { REPLY_TASK, replySchema } from '../../prompts/extAudit';
import { moduleById } from '../../../../../shared/financeAudit/catalog';
import { basename } from 'node:path';
import { withDatasetIssues } from '../accounting/closeRunner';
import { artifact, asOfOf, blockIssue, num, outputCtx, reminder, step, subSteps, warnIssue } from './common';
import { loadDocs, locate, untrusted } from './docs';
import { missingColumnsIssue, readDatasetTable, toCents } from './table';
import { adjustmentImpact, mergePbcHandoffs, parsePbc, profitBefore } from './extAudit/support';
import { amountInQuote, applyStatus, matchReply, parseConfirmations, responseRate, type ReplyFact } from './extAudit/confirm';
import { readSent } from './extAudit/sentLog';
import { writeExtAuditOutputs } from './extAudit/output';

const SUB: Record<string, string> = {
  pbc: i18nKey('资料清单进度'), adjust: i18nKey('审计调整影响'),
  list: i18nKey('读取函证清单'), letters: i18nKey('生成询证函草稿'),
  match: i18nKey('回函归集'), extract: i18nKey('模型抽取确认金额并回核'), status: i18nKey('差异与回函率'),
};

/** 本项目最近一次签核归档的函证准备 */
export function latestPrepared(ctx: Pick<RunCtx, 'store' | 'company' | 'project'>): FauRun | null {
  return ctx.store.listRuns(ctx.company.id, ctx.project.id, 'ext-audit').find((r) => r.modeId === 'confirm_prepare' && r.status === 'archived' && r.result) || null;
}

function confirmationsOf(ctx: RunCtx): { list: FauConfirmation[]; source: FauRun | null } {
  const meta = ctx.datasets('confirmList')[0];
  if (meta) return { list: parseConfirmations(readDatasetTable(meta, 'confirmations'), ctx.company.currency).list, source: null };
  const src = latestPrepared(ctx);
  return { list: ((src?.result as FauExtAuditResult | undefined)?.confirmations || []).map((c) => ({ ...c })), source: src };
}

/** 转交给外审的已签核底稿（A1 关账包、B4 复核） */
function handedOff(ctx: RunCtx): Array<{ code: string; files: string[] }> {
  return ctx.store.handoffs(ctx.company.id, ctx.project.id).filter((h) => h.toModuleId === 'ext-audit').flatMap((h) => {
    const src = ctx.store.findRun(ctx.company.id, h.fromRunId, ctx.project.id);
    if (!src || src.status !== 'archived') return [];
    return [{ code: moduleById(src.moduleId)?.code || src.moduleId, files: src.artifacts.map((a) => basename(a.path)) }];
  });
}

export const extAuditRunner: ModuleRunner = {
  subSteps(modeId) {
    return subSteps(modeId === 'support' ? ['pbc', 'adjust'] : modeId === 'confirm_prepare' ? ['list', 'letters'] : ['match', 'extract', 'status'], SUB);
  },

  async validate(ctx) {
    const r: FauValidationReport = { checks: [], blockers: [], warnings: [] };
    const mode = ctx.run.modeId;
    if (mode === 'support') {
      const meta = ctx.datasets('pbc')[0];
      const p = meta ? readDatasetTable(meta, 'pbc') : null;
      const iss = p && missingColumnsIssue(p, i18nKey('审计资料清单（PBC）'));
      if (iss) r.blockers.push(iss);
      const adj = ctx.rows<'journal'>('adjustments');
      if (!p && !adj.length && !handedOff(ctx).length) r.blockers.push(blockIssue('nothing', i18nKey('请至少提供资料清单、审计调整分录，或先把已签核底稿转交过来')));
      const unbalanced = [...new Set(adj.map((x) => x.voucherNo))].filter((v) => {
        const ls = adj.filter((x) => x.voucherNo === v);
        return ls.reduce((s, x) => s + x.debit, 0) !== ls.reduce((s, x) => s + x.credit, 0);
      });
      if (unbalanced.length) r.warnings.push(warnIssue('adj_unbalanced', i18nKey('{n} 张调整凭证借贷不平：{p0}'), { n: unbalanced.length, p0: unbalanced.slice(0, 10).join(', ') }));
      if (!(num(ctx.run.params.materiality, 0) > 0)) r.warnings.push(warnIssue('no_materiality', i18nKey('没有填写重要性水平，调整不判断是否重大')));
      return withDatasetIssues(r, ctx, ['adjustments', 'adjTb']);
    }
    const meta = ctx.datasets('confirmList')[0];
    if (meta) {
      const p = readDatasetTable(meta, 'confirmations');
      const iss = missingColumnsIssue(p, i18nKey('函证清单'));
      if (iss) { r.blockers.push(iss); return r; }
      const { list, badEmail, dupIds } = parseConfirmations(p, ctx.company.currency);
      if (!list.length) r.blockers.push(blockIssue('empty', i18nKey('函证清单是空的')));
      if (dupIds.length) r.blockers.push(blockIssue('dup_ids', i18nKey('函证编号重复：{p0}'), { p0: dupIds.join(', ') }));
      if (badEmail.length) r.warnings.push(warnIssue('bad_email', i18nKey('{n} 行邮箱格式不对，这些函证只能线下寄送'), { n: badEmail.length }, badEmail));
      const noEmail = list.filter((c) => !c.email).length;
      if (noEmail && mode === 'confirm_prepare') r.warnings.push(warnIssue('no_email', i18nKey('{n} 份函证没有邮箱，签核后只能打印寄送'), { n: noEmail }));
    } else if (mode === 'confirm_replies' && !latestPrepared(ctx)) {
      r.blockers.push(blockIssue('no_prepared', i18nKey('没有函证清单，本项目也没有签核归档的函证准备')));
    }
    if (mode === 'confirm_replies') {
      const docs = await loadDocs(ctx.datasets('replies'));
      if (!docs.some((d) => d.doc.text.trim())) r.blockers.push(blockIssue('replies_empty', i18nKey('回函里没有可读的文字（扫描件未识别出文字），请换成文字版或清晰的图片')));
    }
    return r;
  },

  async analyze(ctx): Promise<AnalyzeResult> {
    const th = ctx.th('ext-audit');
    const asOf = asOfOf(ctx);
    const materiality = Math.round(num(ctx.run.params.materiality, 0) * 100);
    const mode = ctx.run.modeId;
    const reminders: FauReminder[] = [];
    if (mode === 'support') {
      const meta = ctx.datasets('pbc')[0];
      const pbc = await step(ctx, 'pbc', () => mergePbcHandoffs(meta ? parsePbc(readDatasetTable(meta, 'pbc'), asOf) : [], handedOff(ctx)));
      const adjRows = ctx.rows<'journal'>('adjustments');
      const adjustments = await step(ctx, 'adjust', () => adjustmentImpact(adjRows, ctx.profile.reportBasis, ctx.company.accountMap, materiality));
      const totals = adjustments.reduce((s, a) => ({ profit: s.profit + a.profitImpact, assets: s.assets + a.assetImpact, liabilities: s.liabilities + a.liabilityImpact, equity: s.equity + a.equityImpact }), { profit: 0, assets: 0, liabilities: 0, equity: 0 });
      const tb = ctx.rows<'tb'>('adjTb');
      const overdue = pbc.filter((x) => x.status === 'overdue');
      if (overdue.length) reminders.push(reminder('ea:pbc_overdue', 'engine', i18nKey('{n} 项审计资料已过截止日未提供'), { n: overdue.length }));
      for (const a of adjustments.filter((x) => x.exceedsMateriality)) reminders.push(reminder(`ea:mat:${a.voucherNo}`, 'escalation', i18nKey('调整 {p0} 对利润的影响超过重要性水平'), { p0: a.voucherNo }));
      const escalate = Math.abs(totals.profit) > (th['adjust.profitEscalate'] ?? 10_000_000);
      if (escalate) reminders.push(reminder('ea:profit', 'escalation', i18nKey('审计调整合计影响利润超过升级门槛，须 CFO 审批'), {}, true));
      const result: FauExtAuditResult = { mode: 'support', asOf, materiality, pbc, adjustments, adjustmentTotals: totals, profitBefore: tb.length ? profitBefore(tb, ctx.profile.reportBasis, ctx.company.accountMap) : null };
      return { result, reminders, approveRequired: escalate || adjustments.some((a) => a.exceedsMateriality), summary: { key: i18nKey('资料 {n} 项（已提供 {m}），调整凭证 {a} 张'), params: { n: pbc.length, m: pbc.filter((x) => x.status === 'provided').length, a: adjustments.length } } };
    }
    if (mode === 'confirm_prepare') {
      const { list } = await step(ctx, 'list', () => confirmationsOf(ctx));
      ctx.progress('letters', 'done');
      const result: FauExtAuditResult = { mode: 'confirm_prepare', asOf, materiality, confirmations: list, responseRate: null };
      reminders.push(reminder('ea:not_sent', 'engine', i18nKey('函证只生成草稿，不会自动发送；签核归档后由人点「发送」并在确认框确认')));
      return { result, reminders, summary: { key: i18nKey('函证 {n} 份，询证函草稿已就绪'), params: { n: list.length } } };
    }

    const { list, source } = confirmationsOf(ctx);
    const docs = await step(ctx, 'match', () => loadDocs(ctx.datasets('replies')));
    const assigned = docs.map((d) => ({ d, confId: matchReply(list, d.name, d.doc.text) }));
    const unmatched = assigned.filter((x) => !x.confId).map((x) => x.d.name);
    const usable = assigned.filter((x) => x.confId);
    const facts: ReplyFact[] = [];
    let model: string | undefined;
    if (usable.length) {
      const out = await step(ctx, 'extract', () => runSkill(ctx.llm, {
        module: 'ext-audit', skills: [{ name: 'fa-confirmation-management' }], task: REPLY_TASK,
        data: { confirmations: list.filter((c) => usable.some((u) => u.confId === c.id)).map((c) => ({ id: c.id, party: c.party, type: c.type, bookAmount: c.bookAmount / 100, currency: c.currency })), files: usable.map((u) => ({ file: u.d.name, confId: u.confId })) },
        untrusted: untrusted(usable.map((u) => u.d)), outputLocale: ctx.locale, schema: replySchema, narratives: () => [],
      }));
      model = out.model;
      for (const u of usable) {
        const rep = out.data.replies.find((x) => x.file === u.d.name) || out.data.replies.find((x) => x.confId.toUpperCase() === u.confId);
        const loc = rep ? locate([u.d], rep.quote) : { verified: false };
        const verified = !!rep && loc.verified && amountInQuote(rep.confirmedAmount, rep.quote);
        facts.push({ confId: u.confId!, file: u.d.name, amount: verified ? toCents(rep!.confirmedAmount) : null, quote: rep?.quote || '', verified });
      }
    } else ctx.progress('extract', 'skipped');
    const sent = source ? readSent(ctx.store, ctx.company.id, ctx.project.id, source.id) : [];
    const confirmations = await step(ctx, 'status', () => applyStatus(list, sent, facts, asOf, th));
    const rate = responseRate(confirmations);
    const verification: FauVerificationItem[] = facts.map((f) => ({ id: `reply:${f.confId}`, ref: `reply:${f.confId}`, text: `${f.confId} · ${f.file} · ${f.quote}`.slice(0, 300), status: f.verified ? 'verified' : 'unverified' }));
    if (unmatched.length) reminders.push(reminder('ea:unmatched', 'engine', i18nKey('{n} 份回函认不出函证编号：{p0}'), { n: unmatched.length, p0: unmatched.slice(0, 5).join(', ') }));
    const bigDiff = confirmations.filter((c) => c.diff !== null && Math.abs(c.diff) > (th['confirm.diffEscalate'] ?? 10_000_000));
    for (const c of bigDiff) reminders.push(reminder(`ea:diff:${c.id}`, 'escalation', i18nKey('函证 {p0} 回函差异超过升级门槛'), { p0: c.id }));
    if (rate !== null && rate < (th['confirm.minResponseRate'] ?? 0.8)) reminders.push(reminder('ea:rate', 'escalation', i18nKey('回函率低于最低要求，须审计合伙人关注')));
    const result: FauExtAuditResult = { mode: 'confirm_replies', asOf, materiality, confirmations, responseRate: rate, sourceRunId: source?.id };
    return {
      result, verification, reminders, model, approveRequired: bigDiff.length > 0,
      summary: { key: i18nKey('回函 {n} 份，相符 {m} 份，不符 {d} 份，未回函 {o} 份'), params: { n: facts.length, m: confirmations.filter((c) => c.status === 'replied_match').length, d: confirmations.filter((c) => c.status === 'replied_diff').length, o: confirmations.filter((c) => c.status === 'no_reply').length } },
    };
  },

  async draft(ctx) {
    const res = ctx.run.result as FauExtAuditResult;
    const outs = writeExtAuditOutputs(outputCtx(ctx), res, ctx.run.requiredLevels, ctx.company.name);
    // 询证函路径记回函证，签核归档后发送时取归档副本
    if (res.confirmations) {
      const byConf = new Map(outs.filter((o) => o.confId).map((o) => [o.confId!, o.path]));
      const run = ctx.run;
      run.result = { ...res, confirmations: res.confirmations.map((c) => ({ ...c, letterPath: byConf.get(c.id) || c.letterPath })) };
      ctx.store.saveRun(run);
    }
    const artifacts = outs.map((o) => artifact(ctx, o.kind, o.path, o.title));
    return { artifacts, summary: { key: i18nKey('已生成 {n} 个文件（草稿—待签核）'), params: { n: artifacts.length } } };
  },
};
