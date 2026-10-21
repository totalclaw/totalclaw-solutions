/**
 * A5 费用报销稽核 runner：③ 校验 → ④ 逐单预审（复用财务智能体规则）+ ZATCA 二维码 + 异常模式扫描 → ⑤ 稽核报告 xlsx + docx。
 * 单笔报销的实时审核在财务智能体「费用报销」里做（模块定义的 reuse 跳转），这里是批量事后稽核。
 */
import { i18nKey } from '@totalclaw/i18n';
import type { FauExpenseResult, FauReminder, FauSubProgress, FauValidationReport } from '@totalclaw/ipc-contracts';
import type { AnalyzeResult, ModuleRunner, RunCtx } from '../../../runner';
import { writeExpenseOutputs } from '../../../outputs/expense';
import { msg } from '../common';
import { IssueList, artifactOf, asOfOf, outputCtxOf } from '../subledgerCommon';
import { expenseReview } from './engine';

const SUB_LABEL: Record<string, string> = { review: i18nKey('逐单预审'), qr: i18nKey('ZATCA 二维码核对'), anomaly: i18nKey('异常模式扫描') };
const SUBS: Record<string, string[]> = { batch: ['review', 'qr', 'anomaly'], anomaly: ['anomaly'] };

export const expenseRunner: ModuleRunner = {
  subSteps: (modeId) => (SUBS[modeId] || SUBS.batch).map((id): FauSubProgress => ({ id, label: { key: SUB_LABEL[id] }, status: 'todo' })),

  async validate(ctx: RunCtx): Promise<FauValidationReport> {
    const rows = ctx.rows<'expense_claim'>('claims');
    const v = new IssueList();
    if (!rows.length) v.add('block', 'claims_empty', i18nKey('报销明细没有数据行'));
    const noInv = rows.filter((r) => !r.invoiceNo);
    if (noInv.length) v.add('warn', 'no_invoice_no', i18nKey('{n} 行没有发票号码：无法查重与核对连号'), { n: noInv.length }, noInv.map((r) => r.row));
    const noDate = rows.filter((r) => !r.invoiceDate && !r.expenseDate);
    if (noDate.length) v.add('warn', 'no_dates', i18nKey('{n} 行没有开票日期或费用发生日期：有效期与跨期无法判断'), { n: noDate.length }, noDate.map((r) => r.row));
    const sumBad = rows.filter((r) => r.amount + r.tax !== r.total && r.tax !== 0);
    if (sumBad.length) v.add('warn', 'sum_bad', i18nKey('{n} 行不含税金额 + 税额 ≠ 价税合计'), { n: sumBad.length }, sumBad.map((r) => r.row));
    v.check('claims_rows', rows.length > 0, 'block', msg(i18nKey('报销明细有数据')));
    v.check('claims_invoice', !noInv.length, 'warn', msg(i18nKey('每行都有发票号码')));
    return v.report(ctx, ['claims']);
  },

  async analyze(ctx: RunCtx): Promise<AnalyzeResult> {
    const steps = SUBS[ctx.run.modeId] || SUBS.batch;
    for (const id of steps) ctx.progress(id, 'running');
    const res = expenseReview({
      asOf: asOfOf(ctx), lines: ctx.rows<'expense_claim'>('claims'), company: { name: ctx.company.name, taxId: ctx.company.vatNo || ctx.company.regNo },
      th: ctx.th('expense'), anomalyOnly: ctx.run.modeId === 'anomaly',
    });
    for (const id of steps) ctx.progress(id, 'done');
    const reminders: FauReminder[] = res.escalations.map((e, i) => ({ id: `esc:exp:${i}`, source: 'escalation', level: 'warn', message: e }));
    return {
      result: res, reminders, approveRequired: res.escalations.length > 0,
      summary: { key: i18nKey('{n} 张报销单：通过 {a}，需补正 {b}，驳回 {c}，升级 {d}；异常模式 {e} 条'), params: { n: res.claims.length, a: res.counts.pass, b: res.counts.review, c: res.counts.reject, d: res.counts.escalate, e: res.anomalies.length } },
    };
  },

  async draft(ctx: RunCtx) {
    const out = writeExpenseOutputs(outputCtxOf(ctx), ctx.run.result as FauExpenseResult, { levels: ctx.run.requiredLevels });
    const artifacts = [artifactOf(ctx, 'xlsx', out.xlsxPath, i18nKey('费用报销稽核报告')), artifactOf(ctx, 'docx', out.docxPath, i18nKey('稽核报告与异常清单'))];
    return { artifacts, summary: { key: i18nKey('已生成 {n} 个文件（草稿—待签核）'), params: { n: artifacts.length } } };
  },
};
