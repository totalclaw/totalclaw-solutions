/**
 * A4 应付与三单匹配 runner：③ 校验 → ④ 三单匹配 / 付款计划 / 供应商复核（规则计算） → ⑤ 三单匹配与付款计划 xlsx + 复核意见 docx。
 * 付款计划只是草稿：不接银行、不付款（第 9.1 节）。
 */
import { i18nKey } from '@totalclaw/i18n';
import type { FauApResult, FauReminder, FauSubProgress, FauValidationReport } from '@totalclaw/ipc-contracts';
import type { AnalyzeResult, ModuleRunner, RunCtx } from '../../../runner';
import { writeApOutputs } from '../../../outputs/ap';
import { msg } from '../common';
import { IssueList, artifactOf, asOfOf, duplicateRows, outputCtxOf } from '../subledgerCommon';
import { apAnalysis, normName } from './engine';

const SUB_LABEL: Record<string, string> = { match: i18nKey('三单匹配'), review: i18nKey('供应商主数据复核'), plan: i18nKey('付款计划草稿') };
const SUBS: Record<string, string[]> = { standard: ['match', 'review', 'plan'], match: ['match'], schedule: ['review', 'plan'], supplier: ['review'] };

/** 往期已签核 A4 里三单不符（需说明 / 不付）的供应商，最近一期在前 */
function matchHistory(ctx: RunCtx): string[][] {
  return ctx.history()
    .sort((a, b) => (b.archivedAt || '').localeCompare(a.archivedAt || ''))
    .map((r) => ((r.result as FauApResult | undefined)?.match || []).filter((l) => l.grade === 'review' || l.grade === 'reject').map((l) => l.supplier));
}

export const apRunner: ModuleRunner = {
  subSteps: (modeId) => (SUBS[modeId] || SUBS.standard).map((id): FauSubProgress => ({ id, label: { key: SUB_LABEL[id] }, status: 'todo' })),

  async validate(ctx: RunCtx): Promise<FauValidationReport> {
    const steps = SUBS[ctx.run.modeId] || SUBS.standard;
    const v = new IssueList();
    const items = ctx.rows<'ap'>('ap');
    if (steps.includes('plan') || steps.includes('review')) {
      if (!items.length) v.add('block', 'ap_empty', i18nKey('应付明细没有数据行'));
      const dup = duplicateRows(items, (i) => (i.docNo ? `${normName(i.party)}|${i.docNo}` : ''));
      if (dup.length) v.add('warn', 'ap_duplicate', i18nKey('{n} 行同一供应商的发票号重复，可能重复登记或重复付款'), { n: dup.length }, dup);
      const noDate = items.filter((i) => !i.dueDate && !i.docDate);
      if (noDate.length) v.add('warn', 'ap_no_date', i18nKey('{n} 行没有到期日也没有开票日期，按截止日到期排入 P2'), { n: noDate.length }, noDate.map((i) => i.row));
      v.check('ap_rows', items.length > 0, 'block', msg(i18nKey('应付明细有数据')));
    }
    if (steps.includes('match')) {
      const po = ctx.rows<'po'>('po');
      const grn = ctx.rows<'grn'>('grn');
      const inv = ctx.rows<'invoice'>('invoices');
      if (!po.length || !inv.length) v.add('block', 'match_empty', i18nKey('三单匹配需要采购订单与发票（收货单可以为空，表示还没收货）'));
      const noPo = inv.filter((r) => !r.poNo);
      if (noPo.length) v.add('warn', 'inv_no_po', i18nKey('{n} 行发票没有填采购订单号，无法匹配'), { n: noPo.length }, noPo.map((r) => r.row));
      const noPrice = [...po, ...inv].filter((r) => r.unitPrice == null && r.amount == null);
      if (noPrice.length) v.add('block', 'no_price', i18nKey('{n} 行订单或发票既没有单价也没有金额'), { n: noPrice.length }, noPrice.map((r) => r.row));
      v.check('match_inputs', po.length > 0 && inv.length > 0, 'block', msg(i18nKey('采购订单与发票都有数据')));
      v.check('match_prices', !noPrice.length, 'block', msg(i18nKey('订单与发票都有单价或金额')));
    }
    if (steps.includes('plan') && !ctx.run.inputs.funds?.length) v.add('warn', 'no_funds', i18nKey('没有可用资金表：付款计划按资金充足排，不算资金缺口'));
    if (steps.includes('review') && !ctx.rows<'supplier'>('suppliers').length) v.add('warn', 'no_suppliers', i18nKey('没有供应商档案：收款账户、关联方、黑名单无法核对'));
    return v.report(ctx, ['ap', 'po', 'grn', 'invoices', 'suppliers', 'funds']);
  },

  async analyze(ctx: RunCtx): Promise<AnalyzeResult> {
    const steps = SUBS[ctx.run.modeId] || SUBS.standard;
    for (const id of steps) ctx.progress(id, 'running');
    const res = apAnalysis({
      asOf: asOfOf(ctx), items: ctx.rows<'ap'>('ap'), po: ctx.rows<'po'>('po'), grn: ctx.rows<'grn'>('grn'), invoices: ctx.rows<'invoice'>('invoices'),
      suppliers: ctx.rows<'supplier'>('suppliers'), funds: ctx.run.inputs.funds?.length ? ctx.rows<'funds'>('funds') : null,
      history: matchHistory(ctx), th: ctx.th('ap'), match: steps.includes('match'), plan: steps.includes('plan'), review: steps.includes('review'),
    });
    for (const id of steps) ctx.progress(id, 'done');
    const reminders: FauReminder[] = res.escalations.map((e, i) => ({ id: `esc:ap:${i}`, source: 'escalation', level: 'warn', message: e }));
    if (res.plan) reminders.push({ id: 'ap:plan_draft', source: 'engine', level: 'warn', message: { key: i18nKey('付款计划只是草稿：本方案不付款，由人按审批层级在网银或资金系统里操作') } });
    const counts = res.matchCounts;
    return {
      result: res, reminders, approveRequired: res.escalations.length > 0,
      summary: {
        key: i18nKey('三单 {a} 行（不付 {b}），计划付款 {c}，暂停供应商 {d} 家'),
        params: { a: res.match?.length ?? 0, b: counts?.reject ?? 0, c: ((res.plan?.scheduledTotal ?? 0) / 100).toFixed(2), d: res.suppliers.filter((s) => s.conclusion === 'hold').length },
      },
    };
  },

  async draft(ctx: RunCtx) {
    const out = writeApOutputs(outputCtxOf(ctx), ctx.run.result as FauApResult, { levels: ctx.run.requiredLevels });
    const artifacts = [artifactOf(ctx, 'xlsx', out.xlsxPath, i18nKey('三单匹配与付款计划草稿')), artifactOf(ctx, 'docx', out.docxPath, i18nKey('三单匹配结论与供应商复核意见'))];
    return { artifacts, summary: { key: i18nKey('已生成 {n} 个文件（草稿—待签核）'), params: { n: artifacts.length } } };
  },
};
