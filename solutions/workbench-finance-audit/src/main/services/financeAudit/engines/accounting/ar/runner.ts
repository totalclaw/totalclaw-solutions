/**
 * A3 应收与账龄 runner：③ 校验 → ④ 账龄 / 坏账准备 / 催款阶段 / 信用评估（全部规则计算，不调模型） → ⑤ 账龄表 xlsx + 催款函与信用评估 docx。
 * 催款函只生成草稿文件，不发送（第 9.1 节）。
 */
import { i18nKey } from '@totalclaw/i18n';
import type { FauArResult, FauReminder, FauSubProgress, FauValidationReport } from '@totalclaw/ipc-contracts';
import type { AnalyzeResult, ModuleRunner, RunCtx } from '../../../runner';
import { writeArOutputs } from '../../../outputs/ar';
import { msg } from '../common';
import { IssueList, artifactOf, asOfOf, duplicateRows, outputCtxOf } from '../subledgerCommon';
import { arAging, dueDateOf } from './engine';

const SUB_LABEL: Record<string, string> = {
  aging: i18nKey('账龄分层'), provision: i18nKey('坏账准备测算'), collection: i18nKey('催款阶段与函件草稿'), credit: i18nKey('信用评估'),
};
const SUBS: Record<string, string[]> = {
  standard: ['aging', 'provision', 'collection', 'credit'], aging: ['aging', 'provision'], collection: ['aging', 'collection'], credit: ['aging', 'credit'],
};

/** 上一期项目链里最近一次已签核 A3 的逾期率 */
function priorOverdueRate(ctx: RunCtx): number | null {
  const prev = ctx.history().sort((a, b) => (b.archivedAt || '').localeCompare(a.archivedAt || ''))[0];
  const res = prev?.result as FauArResult | undefined;
  return res ? res.overdueRate : null;
}

export const arRunner: ModuleRunner = {
  subSteps: (modeId) => (SUBS[modeId] || SUBS.standard).map((id): FauSubProgress => ({ id, label: { key: SUB_LABEL[id] }, status: 'todo' })),

  async validate(ctx: RunCtx): Promise<FauValidationReport> {
    const items = ctx.rows<'ar'>('ar');
    const customers = ctx.rows<'customer'>('customers');
    const v = new IssueList();
    if (!items.length) v.add('block', 'ar_empty', i18nKey('应收明细没有数据行'));
    const noDate = items.filter((i) => !dueDateOf(i, null) && !i.docDate);
    if (noDate.length) v.add('block', 'ar_no_date', i18nKey('{n} 行没有到期日也没有开票日期，算不出账龄'), { n: noDate.length }, noDate.map((i) => i.row));
    const dup = duplicateRows(items, (i) => (i.docNo ? `${i.party}|${i.docNo}` : ''));
    if (dup.length) v.add('warn', 'ar_duplicate', i18nKey('{n} 行同一客户的发票号重复，可能重复导入'), { n: dup.length }, dup);
    const neg = items.filter((i) => i.open < 0);
    if (neg.length) v.add('warn', 'ar_negative', i18nKey('{n} 行未清金额为负（预收或多收），不参与账龄与坏账准备'), { n: neg.length }, neg.map((i) => i.row));
    const cur = items.filter((i) => i.currency && i.currency !== ctx.company.currency);
    if (cur.length) v.add('warn', 'ar_currency', i18nKey('{n} 行币种不是本位币 {p0}，按表里金额计算，请确认已折算'), { n: cur.length, p0: ctx.company.currency }, cur.map((i) => i.row));
    if (!customers.length) v.add('warn', 'ar_no_master', i18nKey('没有客户档案：到期日只能用明细里的到期日或账期，信用评估没有额度与财务指标'));
    const asOf = asOfOf(ctx);
    const future = items.filter((i) => i.docDate && i.docDate > asOf);
    if (future.length) v.add('warn', 'ar_future', i18nKey('{n} 行开票日期晚于截止日 {p0}'), { n: future.length, p0: asOf }, future.map((i) => i.row));
    v.check('ar_rows', items.length > 0, 'block', msg(i18nKey('应收明细有数据')));
    v.check('ar_dates', !noDate.length, 'block', msg(i18nKey('每行都能算出到期日')));
    v.check('ar_unique', !dup.length, 'warn', msg(i18nKey('发票号不重复')));
    return v.report(ctx, ['ar', 'receipts', 'customers']);
  },

  async analyze(ctx: RunCtx): Promise<AnalyzeResult> {
    const mode = ctx.run.modeId;
    const ids = SUBS[mode] || SUBS.standard;
    for (const id of ids) ctx.progress(id, 'running');
    const res = arAging({
      asOf: asOfOf(ctx), items: ctx.rows<'ar'>('ar'), receipts: ctx.rows<'receipt'>('receipts'), customers: ctx.rows<'customer'>('customers'),
      priorOverdueRate: priorOverdueRate(ctx), th: ctx.th('ar'), credit: ids.includes('credit'),
    });
    if (!ids.includes('collection')) res.letters = [];
    for (const id of ids) ctx.progress(id, 'done');
    const reminders: FauReminder[] = res.escalations.map((e, i) => ({ id: `esc:ar:${i}`, source: 'escalation', level: 'warn', message: e }));
    if (res.letters.length) reminders.push({ id: 'ar:letters', source: 'engine', level: 'warn', message: { key: i18nKey('催款函 {n} 份只是草稿，不会自动发送；由人确认后自行发出'), params: { n: res.letters.length } } });
    return {
      result: res, reminders, approveRequired: res.escalations.length > 0,
      summary: { key: i18nKey('应收 {n} 笔，逾期率 {p0}，坏账准备 {p1}'), params: { n: res.items.length, p0: `${(res.overdueRate * 100).toFixed(1)}%`, p1: (res.provision / 100).toFixed(2) } },
    };
  },

  async draft(ctx: RunCtx) {
    const out = writeArOutputs(outputCtxOf(ctx), ctx.run.result as FauArResult, { levels: ctx.run.requiredLevels });
    const artifacts = [artifactOf(ctx, 'xlsx', out.xlsxPath, i18nKey('账龄表与坏账准备测算'))];
    if (out.docxPath) artifacts.push(artifactOf(ctx, 'docx', out.docxPath, i18nKey('催款函与信用评估草稿')));
    return { artifacts, summary: { key: i18nKey('已生成 {n} 个文件（草稿—待签核）'), params: { n: artifacts.length } } };
  },
};
