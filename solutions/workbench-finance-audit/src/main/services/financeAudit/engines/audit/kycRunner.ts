/**
 * B6 客商尽调与反洗钱 runner（第 5.6 节，对应 kyc-screener 的三层隔离）：
 *   资料抽取（doc-reader）：资料包文字放进 <untrusted_document>，模型不给任何工具、输出过 schema，每个值回原文核对，定位不到丢弃；
 *   规则与名单（rules-engine）：内置规则 K1–K9 + 企业规则表逐条结论（引用规则号）；上传名单按规范化姓名与相似度匹配；
 *   处置建议（escalator）：clear / request-docs / escalate-EDD / decline-recommend 之一，**从不批准**，由合规官签核决定。
 */
import { i18nKey } from '@totalclaw/i18n';
import type { FauKycHit, FauKycResult, FauReminder, FauValidationReport, FauVerificationItem } from '@totalclaw/ipc-contracts';
import type { AnalyzeResult, ModuleRunner } from '../../runner';
import { runSkill } from '../../skillRunner';
import { KYC_TASK, kycSchema } from '../../prompts/kyc';
import { artifact, asOfOf, blockIssue, outputCtx, reminder, step, subSteps, warnIssue } from './common';
import { loadDocs, untrusted } from './docs';
import { missingColumnsIssue, readDatasetTable } from './table';
import { verifyKyc } from './kyc/extract';
import { parseRules, screen } from './kyc/rules';
import { parseWatchlist, screenNames } from './kyc/names';
import { writeKycOutputs } from './kyc/output';

const SUB: Record<string, string> = {
  docParse: i18nKey('资料抽取并回原文核对'), rulesGrid: i18nKey('规则逐条结论'), watchlist: i18nKey('名单匹配'), disposition: i18nKey('处置建议'),
};

export const kycRunner: ModuleRunner = {
  subSteps() {
    return subSteps(['docParse', 'watchlist', 'rulesGrid', 'disposition'], SUB);
  },

  async validate(ctx) {
    const r: FauValidationReport = { checks: [], blockers: [], warnings: [] };
    const docs = await loadDocs(ctx.datasets('packet'));
    for (const d of docs.filter((x) => !x.doc.text.trim())) r.warnings.push(warnIssue(`empty:${d.name}`, i18nKey('{p0} 读不出文字（扫描件识别率不足时请改传文字版 PDF）'), { p0: d.name }));
    if (!docs.some((d) => d.doc.text.trim())) r.blockers.push(blockIssue('packet_empty', i18nKey('资料包里没有可读的文字')));
    for (const [slot, table, label] of [['rules', 'kycRules', i18nKey('企业规则表')], ['watchlist', 'watchlist', i18nKey('名单')]] as const) {
      const meta = ctx.datasets(slot)[0];
      const iss = meta && missingColumnsIssue(readDatasetTable(meta, table), label);
      if (iss) r.blockers.push(iss);
    }
    if (!ctx.datasets('watchlist').length) r.warnings.push(warnIssue('no_watchlist', i18nKey('没有上传名单，名单匹配不执行（不代表没有命中）')));
    return r;
  },

  async analyze(ctx): Promise<AnalyzeResult> {
    const th = ctx.th('kyc');
    const docs = await loadDocs(ctx.datasets('packet'));
    const out = await step(ctx, 'docParse', () => runSkill(ctx.llm, {
      module: 'kyc', skills: [{ name: 'fa-kyc-doc-parse' }], task: KYC_TASK, data: { files: docs.map((d) => d.name) },
      untrusted: untrusted(docs), outputLocale: ctx.locale, schema: kycSchema, narratives: () => [],
    }));
    const record = verifyKyc(out.data, docs);
    const wlMeta = ctx.datasets('watchlist')[0];
    const hits: FauKycHit[] = await step(ctx, 'watchlist', () => (wlMeta ? screenNames([
      { name: record.legalName?.value || '', role: 'applicant' },
      ...record.beneficialOwners.map((b) => ({ name: b.name.value, role: 'ubo' as const })),
      ...record.controllers.map((c) => ({ name: c.name.value, role: 'controller' as const })),
    ], parseWatchlist(readDatasetTable(wlMeta, 'watchlist')), th) : []));
    const rulesMeta = ctx.datasets('rules')[0];
    const s = await step(ctx, 'rulesGrid', () => screen({ record, hits, rules: rulesMeta ? parseRules(readDatasetTable(rulesMeta, 'kycRules')) : null, asOf: asOfOf(ctx), th }));
    ctx.progress('disposition', 'done');
    const result: FauKycResult = { record, rating: s.rating, factors: s.factors, outcomes: s.outcomes, hits, missingDocs: s.missingDocs, disposition: s.disposition, reasons: s.reasons };
    const verification: FauVerificationItem[] = record.dropped.map((k) => ({ id: `kyc:${k}`, ref: k, text: k, status: 'unverified' }));
    const reminders: FauReminder[] = [reminder('kyc:decision', 'engine', i18nKey('处置建议不是批准；是否建立业务关系由合规官决定'), {}, true)];
    if (s.disposition === 'escalate-EDD' || s.disposition === 'decline-recommend') reminders.push(reminder('kyc:escalate', 'escalation', s.disposition === 'decline-recommend' ? i18nKey('建议拒绝：须合规官批准处置') : i18nKey('须升级强化尽调：须合规官批准处置')));
    return {
      result, verification, reminders, model: out.model, approveRequired: true,
      summary: { key: i18nKey('规则触发 {n} 条，名单命中 {m} 条'), params: { n: s.outcomes.filter((o) => o.outcome === 'fail').length, m: hits.length } },
    };
  },

  async draft(ctx) {
    const res = ctx.run.result as FauKycResult;
    const artifacts = writeKycOutputs(outputCtx(ctx), res, ctx.run.requiredLevels).map((o) => artifact(ctx, o.kind, o.path, o.title));
    return { artifacts, summary: { key: i18nKey('已生成 {n} 个文件（草稿—待签核）'), params: { n: artifacts.length } } };
  },
};
