/**
 * B5 舞弊排查 runner（第 5.6 节）：
 *   规则（代码算）：本福特、重复付款、周末 / 节假日分录、期末大额手工调整、整数金额、供应商与员工账户相同、名称相似，
 *     加上只读复用的财务智能体 risk.ts 规则；每条命中带证据行号与单号；
 *   调查计划（模型写，不给工具）：每一步引用的单号必须在命中里，摘要数字回核；不下舞弊成立的结论。
 * 立项须批准人签核（PRA）；有高风险命中时进升级事项。
 */
import { i18nKey } from '@totalclaw/i18n';
import type { FauFraudHit, FauFraudResult, FauFraudPlanStep, FauReminder, FauValidationReport, FauVerificationItem } from '@totalclaw/ipc-contracts';
import type { AnalyzeResult, ModuleRunner, RunCtx } from '../../runner';
import { runSkill } from '../../skillRunner';
import { verifyNarrative } from '../../verify';
import { PLAN_TASK, fraudPlanSchema } from '../../prompts/fraud';
import { withDatasetIssues } from '../accounting/closeRunner';
import { artifact, outputCtx, reminder, step, subSteps, warnIssue } from './common';
import { loadDocs, untrusted } from './docs';
import { missingColumnsIssue, readDatasetTable } from './table';
import { benford } from './fraud/benford';
import {
  NEW_RULES, RISK_TS_NOT_APPLICABLE, RISK_TS_RULES, duplicatePayments, parseParties, parsePayments, periodEndManual, relatedNames, riskTsHits,
  roundAmounts, vendorEmployeeBank, weekendEntries,
} from './fraud/rules';
import { writeFraudOutputs } from './fraud/output';

const SUB: Record<string, string> = {
  rules: i18nKey('数据分析规则'), benford: i18nKey('本福特检验'), plan: i18nKey('模型起草调查计划并回核'),
};

const TABLES: Array<[string, Parameters<typeof readDatasetTable>[1], string]> = [
  ['payments', 'payments', i18nKey('付款登记')], ['vendors', 'vendors', i18nKey('供应商主数据')], ['employees', 'employees', i18nKey('员工主数据')],
];

function tableOf(ctx: RunCtx, slot: string, table: Parameters<typeof readDatasetTable>[1]) {
  const meta = ctx.datasets(slot)[0];
  return meta ? readDatasetTable(meta, table) : null;
}

/** 纯计算部分（测试直接调） */
export function fraudScan(input: {
  journal: Parameters<typeof weekendEntries>[0]; tb: Parameters<typeof riskTsHits>[1];
  payments: ReturnType<typeof parsePayments>; vendors: ReturnType<typeof parseParties>; employees: ReturnType<typeof parseParties>;
  holidays: string[]; th: Record<string, number>;
}): { hits: FauFraudHit[]; benford: FauFraudResult['benford']; coverage: FauFraudResult['coverage'] } {
  const th = input.th;
  const ben = benford(input.journal.map((r) => Math.max(r.debit, r.credit)), th);
  const hits: FauFraudHit[] = [
    ...duplicatePayments(input.payments, th),
    ...weekendEntries(input.journal, th, input.holidays),
    ...periodEndManual(input.journal, th),
    ...roundAmounts(input.journal, th),
    ...vendorEmployeeBank(input.vendors, input.employees),
    ...relatedNames(input.vendors, input.employees, th),
    ...riskTsHits(input.journal, input.tb, th),
  ];
  if (ben.conformity === 'nonconformity' || ben.conformity === 'marginal') {
    hits.unshift({ id: 'benford', rule: 'benford', level: ben.conformity === 'nonconformity' ? 'high' : 'warn', source: 'journal', rows: [], refs: [], amount: 0, detail: `digits ${ben.spikes.join(',') || '-'} · MAD ${ben.mad.toFixed(4)} · χ² ${ben.chi2.toFixed(2)} · n ${ben.n}` });
  }
  const has = { payments: input.payments.length > 0, master: input.vendors.length > 0 && input.employees.length > 0, tb: !!input.tb?.length };
  const applicable: Record<string, boolean> = { duplicate_payment: has.payments, vendor_employee_bank: has.master, related_name: has.master, idle_other: has.tb, wrong_side: has.tb };
  const coverage: FauFraudResult['coverage'] = [
    ...[...NEW_RULES, ...RISK_TS_RULES].map((rule) => ({ rule, status: (applicable[rule] ?? true) ? 'ran' as const : 'not_applicable' as const, hits: hits.filter((h) => h.rule === rule).length })),
    ...RISK_TS_NOT_APPLICABLE.map((rule) => ({ rule, status: 'not_applicable' as const, hits: 0 })),
  ];
  const order = { high: 0, warn: 1, info: 2 } as const;
  return { hits: hits.sort((a, b) => order[a.level] - order[b.level]), benford: ben, coverage };
}

export const fraudRunner: ModuleRunner = {
  subSteps() {
    return subSteps(['rules', 'benford', 'plan'], SUB);
  },

  async validate(ctx) {
    const r: FauValidationReport = { checks: [], blockers: [], warnings: [] };
    for (const [slot, table, label] of TABLES) {
      const p = tableOf(ctx, slot, table);
      const iss = p && missingColumnsIssue(p, label);
      if (iss) r.blockers.push(iss);
    }
    const journal = ctx.rows<'journal'>('journal');
    if (!journal.some((x) => x.source)) r.warnings.push(warnIssue('no_source', i18nKey('序时账没有凭证来源列，期末大额调整无法区分手工与系统凭证，按全部凭证检查')));
    if (!ctx.datasets('payments').length) r.warnings.push(warnIssue('no_payments', i18nKey('没有付款登记，重复付款检查不执行')));
    if (!ctx.datasets('vendors').length || !ctx.datasets('employees').length) r.warnings.push(warnIssue('no_master', i18nKey('供应商或员工主数据缺一份，账户碰撞与名称相似检查不执行')));
    return withDatasetIssues(r, ctx, ['journal', 'fraudTb']);
  },

  async analyze(ctx): Promise<AnalyzeResult> {
    const th = ctx.th('fraud');
    const journal = ctx.rows<'journal'>('journal');
    const pay = tableOf(ctx, 'payments', 'payments');
    const ven = tableOf(ctx, 'vendors', 'vendors');
    const emp = tableOf(ctx, 'employees', 'employees');
    const holidays = Array.isArray(ctx.run.params.holidays) ? (ctx.run.params.holidays as unknown[]).map(String).filter((d) => /^\d{4}-\d{2}-\d{2}$/.test(d)) : [];
    const scan = await step(ctx, 'rules', () => fraudScan({
      journal, tb: ctx.run.inputs.fraudTb?.length ? ctx.rows<'tb'>('fraudTb') : null,
      payments: pay ? parsePayments(pay) : [], vendors: ven ? parseParties(ven, 'vendors') : [], employees: emp ? parseParties(emp, 'employees') : [], holidays, th,
    }));
    ctx.progress('benford', 'done');
    const leads = await loadDocs(ctx.datasets('leads'));
    let plan: FauFraudPlanStep[] = [];
    let summary = '';
    let summaryStatus: FauFraudResult['summaryStatus'] = 'none';
    let model: string | undefined;
    const verification: FauVerificationItem[] = [];
    if (scan.hits.length || leads.length) {
      const out = await step(ctx, 'plan', () => runSkill(ctx.llm, {
        module: 'fraud', skills: [{ name: 'fa-fraud-investigation' }], task: PLAN_TASK,
        data: { hits: scan.hits.slice(0, 80).map((h) => ({ rule: h.rule, level: h.level, refs: h.refs.slice(0, 10), amount: h.amount / 100, detail: h.detail.slice(0, 200) })), benford: { n: scan.benford.n, conformity: scan.benford.conformity, mad: Number(scan.benford.mad.toFixed(4)), spikes: scan.benford.spikes } },
        untrusted: untrusted(leads), outputLocale: ctx.locale, schema: fraudPlanSchema,
        narratives: (o) => [...o.plan.map((s) => s.procedure), o.summary].filter(Boolean),
        userData: scan.hits.flatMap((h) => h.refs),
      }));
      model = out.model;
      const known = new Set(scan.hits.flatMap((h) => h.refs.map((r) => r.toUpperCase())));
      plan = out.data.plan.map((s) => ({ ...s, verified: s.refs.every((r) => known.has(r.toUpperCase())) }));
      summary = out.data.summary;
      const check = verifyNarrative(summary, { amounts: [...scan.hits.map((h) => h.amount / 100), scan.benford.n, Number(scan.benford.mad.toFixed(4)), Number(scan.benford.chi2.toFixed(2))], refs: [...known] });
      summaryStatus = check.ok ? 'verified' : 'unverified';
      verification.push({ id: 'fraud:summary', ref: 'summary', text: summary, status: check.ok ? 'verified' : 'unverified', missing: check.missing.length ? check.missing : undefined });
      for (const s of plan.filter((x) => !x.verified)) verification.push({ id: `fraud:plan:${s.id}`, ref: `plan:${s.id}`, text: `${s.id} ${s.procedure}`, status: 'unverified', missing: s.refs.filter((r) => !known.has(r.toUpperCase())) });
    } else ctx.progress('plan', 'skipped');
    const reminders: FauReminder[] = scan.hits.filter((h) => h.level === 'high').slice(0, 30).map((h) => reminder(`fraud:${h.id}`, 'escalation', i18nKey('高风险异常：{p0}'), { p0: h.refs.slice(0, 3).join(', ') || h.rule }));
    reminders.push(reminder('fraud:approve', 'engine', i18nKey('调查立项须批准人签核；异常只代表需要核实，不等于舞弊'), {}, true));
    const result: FauFraudResult = { ...scan, plan, summary, summaryStatus };
    return {
      result, verification, reminders, model, approveRequired: true,
      summary: { key: i18nKey('异常 {n} 条（高风险 {h} 条），调查步骤 {s} 步'), params: { n: scan.hits.length, h: scan.hits.filter((x) => x.level === 'high').length, s: plan.length } },
    };
  },

  async draft(ctx) {
    const res = ctx.run.result as FauFraudResult;
    const artifacts = writeFraudOutputs(outputCtx(ctx), res, ctx.run.requiredLevels).map((o) => artifact(ctx, o.kind, o.path, o.title));
    return { artifacts, summary: { key: i18nKey('已生成 {n} 个文件（草稿—待签核）'), params: { n: artifacts.length } } };
  },
};
