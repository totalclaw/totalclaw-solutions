/**
 * B2 内部审计 runner（第 5.6 节）：
 *   年度计划：审计范围表 → 风险矩阵 → 纳入与排季、人天缺口（代码算）→ 模型写计划说明（只许引用给定数字，回核）；
 *   流程合规审计：制度 / 流程 / 证据 → 模型起草审计程序与发现（不给工具），发现必须引用原文，定位不到直接丢弃；
 *     严重程度由风险矩阵按模型给的可能性 × 影响算；
 *   整改跟踪：整改台账 + B1 / B5 转交事项 → 超期天数与升级档（提醒 / CFO / 审计委员会），超期进首页待办。
 * 报告草稿只有「发现与建议」，不出具审计意见。
 */
import { i18nKey } from '@totalclaw/i18n';
import type { FauAuditFinding, FauInternalAuditResult, FauReminder, FauValidationReport, FauVerificationItem } from '@totalclaw/ipc-contracts';
import type { AnalyzeResult, ModuleRunner, RunCtx } from '../../runner';
import { runSkill } from '../../skillRunner';
import { verifyNarrative } from '../../verify';
import { FIELDWORK_TASK, PLAN_TASK, fieldworkSchema, planSchema } from '../../prompts/internalAudit';
import { artifact, asOfOf, blockIssue, num, outputCtx, reminder, step, subSteps, warnIssue } from './common';
import { loadDocs, locate, untrusted } from './docs';
import { missingColumnsIssue, readDatasetTable } from './table';
import { buildPlan, parseFindings, parseUniverse, riskOf, severityOf, trackOverdue } from './internalAudit/plan';
import { handoffFindings } from './internalAudit/handoffs';
import { writeInternalAuditOutputs } from './internalAudit/output';

const SUB: Record<string, string> = {
  risk: i18nKey('风险矩阵'), schedule: i18nKey('排程与人天测算'), narrative: i18nKey('模型写计划说明并回核'),
  read: i18nKey('读取制度与证据'), draft: i18nKey('模型起草审计程序与发现'), verify: i18nKey('回原文核对'),
  collect: i18nKey('汇总台账与转交事项'), overdue: i18nKey('超期分级'),
};

export const internalAuditRunner: ModuleRunner = {
  subSteps(modeId) {
    return subSteps(modeId === 'plan' ? ['risk', 'schedule', 'narrative'] : modeId === 'fieldwork' ? ['read', 'draft', 'verify'] : ['collect', 'overdue'], SUB);
  },

  async validate(ctx) {
    const r: FauValidationReport = { checks: [], blockers: [], warnings: [] };
    const mode = ctx.run.modeId;
    if (mode === 'plan') {
      const meta = ctx.datasets('universe')[0];
      const p = meta ? readDatasetTable(meta, 'universe') : null;
      const iss = p && missingColumnsIssue(p, i18nKey('审计范围与风险评估表'));
      if (iss) { r.blockers.push(iss); return r; }
      if (p) {
        const { areas, bad } = parseUniverse(p);
        if (bad.length) r.warnings.push(warnIssue('bad_level', i18nKey('{n} 行可能性或影响认不出（应为高 / 中 / 低），已跳过'), { n: bad.length }, bad));
        if (!areas.length) r.blockers.push(blockIssue('universe_empty', i18nKey('审计范围表里没有可用的领域')));
      }
      return r;
    }
    if (mode === 'fieldwork') {
      const docs = await loadDocs(ctx.datasets('auditDocs'));
      if (!docs.some((d) => d.doc.text.trim())) r.blockers.push(blockIssue('docs_empty', i18nKey('上传的文件里没有可读的文字（扫描件未识别出文字），请换成文字版 PDF 或 Word')));
      return r;
    }
    const meta = ctx.datasets('findings')[0];
    const p = meta ? readDatasetTable(meta, 'findings') : null;
    const iss = p && missingColumnsIssue(p, i18nKey('发现整改台账'));
    if (iss) { r.blockers.push(iss); return r; }
    const fromHandoff = handoffFindings(ctx.store, ctx.company, ctx.project);
    if (!p && !fromHandoff.length) r.blockers.push(blockIssue('nothing_to_track', i18nKey('没有整改台账，也没有内控或舞弊模块转交过来的事项')));
    if (p) {
      const { noDue } = parseFindings(p);
      if (noDue.length) r.warnings.push(warnIssue('no_due', i18nKey('{n} 条发现没有整改期限，无法判断是否超期'), { n: noDue.length }, noDue));
    }
    return r;
  },

  async analyze(ctx): Promise<AnalyzeResult> {
    const th = ctx.th('internal-audit');
    const asOf = asOfOf(ctx);
    const mode = ctx.run.modeId;
    if (mode === 'plan') {
      const meta = ctx.datasets('universe')[0];
      const { areas } = parseUniverse(readDatasetTable(meta, 'universe'));
      ctx.progress('risk', 'done');
      const available = num(ctx.run.params.availableDays, th['plan.availableDays'] ?? 240);
      const plan = await step(ctx, 'schedule', () => buildPlan(areas, available, th));
      const docs = await loadDocs(ctx.datasets('planDocs'));
      const data = { availableDays: plan.availableDays, requiredDays: plan.requiredDays, gap: plan.gap, areas: plan.areas.map((a) => ({ name: a.name, risk: a.risk, mandatory: a.mandatory, days: a.days, included: a.included, quarter: a.quarter, lastAudited: a.lastAudited })) };
      const out = await step(ctx, 'narrative', () => runSkill(ctx.llm, {
        module: 'internal-audit', skills: [{ name: 'fa-annual-audit-planning' }], task: PLAN_TASK, data: { plan: data }, untrusted: untrusted(docs),
        outputLocale: ctx.locale, schema: planSchema, narratives: (o) => [o.narrative], userData: plan.areas.map((a) => a.name),
      }));
      const amounts = [plan.availableDays, plan.requiredDays, plan.gap, ...plan.areas.map((a) => a.days), plan.areas.filter((a) => a.included).reduce((s, a) => s + a.days, 0)];
      const check = verifyNarrative(out.data.narrative, { amounts });
      const verification: FauVerificationItem[] = [{ id: 'plan:narrative', ref: 'plan', text: out.data.narrative, status: check.ok ? 'verified' : 'unverified', missing: check.missing.length ? check.missing : undefined }];
      const reminders: FauReminder[] = plan.gap > 0 ? [reminder('ia:gap', 'engine', i18nKey('审计资源缺口 {n} 人天，须调整计划或补充资源'), { n: plan.gap })] : [];
      const result: FauInternalAuditResult = { mode: 'plan', asOf, plan: { ...plan, narrative: out.data.narrative, narrativeStatus: check.ok ? 'verified' : 'unverified' } };
      return { result, verification, reminders, model: out.model, summary: { key: i18nKey('纳入 {n} 个领域，需求 {m} 人天，可用 {a} 人天'), params: { n: plan.areas.filter((a) => a.included).length, m: plan.requiredDays, a: plan.availableDays } } };
    }
    if (mode === 'fieldwork') {
      const docs = await step(ctx, 'read', () => loadDocs(ctx.datasets('auditDocs')));
      const out = await step(ctx, 'draft', () => runSkill(ctx.llm, {
        module: 'internal-audit', skills: [{ name: 'fa-process-compliance-audit' }], task: FIELDWORK_TASK,
        data: { area: String(ctx.run.params.area || ''), region: ctx.profile.region, standard: ctx.profile.standard }, untrusted: untrusted(docs),
        outputLocale: ctx.locale, schema: fieldworkSchema, narratives: (o) => [...o.procedures.map((x) => x.procedure), ...o.findings.flatMap((f) => [f.title, f.condition, f.recommendation])],
      }));
      ctx.progress('verify', 'running');
      const findings: FauAuditFinding[] = [];
      let dropped = 0;
      for (const f of out.data.findings) {
        const loc = locate(docs, f.quote, f.docName);
        if (!loc.verified) { dropped += 1; continue; }
        findings.push({ ...f, docName: loc.docName, verified: true, severity: severityOf(riskOf(f.likelihood, f.impact)) });
      }
      ctx.progress('verify', 'done');
      const reminders: FauReminder[] = [];
      if (dropped) reminders.push(reminder('ia:dropped', 'engine', i18nKey('{n} 条发现在原文里找不到依据，已丢弃'), { n: dropped }));
      for (const f of findings.filter((x) => x.severity === 'major')) reminders.push(reminder(`ia:major:${f.id}`, 'escalation', i18nKey('{p0}：重大发现，须升级审计委员会'), { p0: f.id }));
      const result: FauInternalAuditResult = { mode: 'fieldwork', asOf, procedures: out.data.procedures, findings };
      return {
        result, reminders, approveRequired: findings.some((f) => f.severity === 'major'), model: out.model,
        summary: { key: i18nKey('审计程序 {n} 条，发现 {m} 条（丢弃 {d} 条无原文依据的）'), params: { n: out.data.procedures.length, m: findings.length, d: dropped } },
      };
    }
    const meta = ctx.datasets('findings')[0];
    const uploaded = meta ? parseFindings(readDatasetTable(meta, 'findings')).list : [];
    const all = [...uploaded, ...handoffFindings(ctx.store, ctx.company, ctx.project)];
    ctx.progress('collect', 'done');
    const tracked = await step(ctx, 'overdue', () => all.map((f) => trackOverdue(f, asOf, th)));
    const reminders: FauReminder[] = tracked.filter((f) => f.tier >= 2).map((f) => reminder(`ia:overdue:${f.id}`, 'escalation', f.tier === 3 ? i18nKey('{p0}：整改超期 {n} 天，升级审计委员会') : i18nKey('{p0}：整改超期 {n} 天，升级 CFO'), { p0: f.id, n: f.overdueDays }));
    const result: FauInternalAuditResult = { mode: 'tracking', asOf, tracked };
    return {
      result, reminders, approveRequired: tracked.some((f) => f.tier >= 2),
      summary: { key: i18nKey('台账 {n} 条，未关闭 {m} 条，超期 {o} 条'), params: { n: tracked.length, m: tracked.filter((f) => f.status !== 'closed').length, o: tracked.filter((f) => f.tier > 0).length } },
    };
  },

  async draft(ctx) {
    const res = ctx.run.result as FauInternalAuditResult;
    const artifacts = writeInternalAuditOutputs(outputCtx(ctx), res, ctx.run.requiredLevels).map((o) => artifact(ctx, o.kind, o.path, o.title));
    return { artifacts, summary: { key: i18nKey('已生成 {n} 个文件（草稿—待签核）'), params: { n: artifacts.length } } };
  },
};

/** 测试用：直接算超期（与 todo 共用口径） */
export { trackOverdue };
