/**
 * A4 应付与三单匹配产出：
 *   xlsx：封面与签核页 / 三单匹配 / 付款计划草稿 / 资金与缺口 / 供应商复核 / 升级事项 / Checks；
 *   docx：三单匹配结论与供应商复核意见（发现与建议，无意见段）。
 * 付款计划带「草稿，不付款」字样；Checks 断言可付 + 暂扣 = 发票金额、计划内 + 延后 + 暂扣 = 应付未清。
 */
import { join } from 'node:path';
import { i18nKey } from '@totalclaw/i18n';
import type { FauApResult } from '@totalclaw/ipc-contracts';
import { FAU_MATCH_GRADES, FAU_PAY_PRIORITIES } from '@totalclaw/ipc-contracts';
import {
  GAP_TIER_LABEL, MATCH_GRADE_LABEL, MATCH_QTY_LABEL, OVERDUE_LEVEL_LABEL, PAY_APPROVAL_LABEL, PRIORITY_LABEL, SUPPLIER_CONCLUSION_LABEL, TAX_CHECK_LABEL, flagKey,
} from '../../../../shared/financeAudit/accountingLabels';
import { OUT, fmtAmount, labeler, outputFileName } from './common';
import { addr, major, planSheetNames, writeWorkbookFile, type XCell } from './xlsx';
import { writeDocxFile, type DocSection } from './docx';
import { coverRows, type OutputCtx } from './close';
import { flagsText } from './subledger';

const price = (c: number | null) => (c == null ? null : Math.round(c * 100) / 10000);
const rate = (r: number | null) => (r == null ? '' : Math.round(r * 10000) / 10000);

export function writeApOutputs(ctx: OutputCtx, res: FauApResult, extra: { levels: string[] }): { xlsxPath: string; docxPath: string } {
  const t = labeler(ctx.locale);
  const rtl = ctx.locale === 'ar';
  const banner = t(OUT.draft);
  const [nCover, nMatch, nPlan, nFunds, nSup, nEsc, nChecks] = planSheetNames([
    t(i18nKey('封面与签核页')), t(i18nKey('三单匹配')), t(i18nKey('付款计划草稿')), t(i18nKey('资金与缺口')), t(i18nKey('供应商复核')), t(i18nKey('升级事项')), 'Checks',
  ]);
  const R0 = 2;
  const match = res.match || [];
  const matchRows: XCell[][] = match.map((l, i) => {
    const r = R0 + i;
    return [
      l.poNo, l.line, l.item, l.supplier, l.invoiceNos.join(', '), l.poQty, l.grnQty, l.invQty, price(l.poPrice), price(l.invPrice), rate(l.poTaxRate), rate(l.invTaxRate),
      major(l.poAmount), major(l.invAmount), major(l.priceDiff), rate(l.priceDiffRate), t(MATCH_QTY_LABEL[l.qty]), t(MATCH_GRADE_LABEL[l.price]), t(TAX_CHECK_LABEL[l.tax]),
      t(MATCH_GRADE_LABEL[l.grade]), major(l.payable), { f: `ROUND(${addr(r, 13)}-${addr(r, 20)},2)`, v: major(l.hold) ?? 0 }, flagsText(l.flags, t),
      l.poRows.join(','), l.grnRows.join(','), l.invRows.join(','),
    ];
  });
  const plan = res.plan;
  const planRows: XCell[][] = (plan?.lines || []).map((l) => [
    t(PRIORITY_LABEL[l.priority]), l.supplier, l.grade, l.docNo, l.poNo, l.dueDate, l.overdueDays, t(OVERDUE_LEVEL_LABEL[l.overdueLevel]), major(l.open), major(l.hold),
    l.holdReason ? t(flagKey(l.holdReason.code), l.holdReason.params) : '', l.scheduled ? t(i18nKey('本次计划')) : t(i18nKey('延后')), l.deferTo || '', t(PAY_APPROVAL_LABEL[l.approval]), l.row,
  ]);
  const fundsRows: XCell[][] = plan ? [
    [t(i18nKey('截止日')), plan.asOf],
    [t(i18nKey('可用资金')), plan.available == null ? t(i18nKey('未提供')) : major(plan.available)],
    [t(i18nKey('30 天内到期应付（含已逾期）')), major(plan.due30)],
    [t(i18nKey('资金缺口')), plan.gap == null ? '' : major(plan.gap)],
    [t(i18nKey('缺口分档')), plan.gapTier ? t(GAP_TIER_LABEL[plan.gapTier]) : ''],
    [t(i18nKey('本次计划付款')), major(plan.scheduledTotal)],
    [t(i18nKey('延后')), major(plan.deferredTotal)],
    [t(i18nKey('暂扣')), major(plan.heldTotal)],
    [],
    [t(i18nKey('优先级')), t(i18nKey('笔数')), t(i18nKey('金额'))],
    ...FAU_PAY_PRIORITIES.map((p) => [t(PRIORITY_LABEL[p]), plan.byPriority[p].count, major(plan.byPriority[p].amount)]),
    [],
    [t(i18nKey('供应商')), t(i18nKey('占应付总额'))],
    ...plan.concentration.slice(0, 10).map((c) => [c.supplier, Math.round(c.share * 10000) / 10000]),
  ] : [[t(i18nKey('本次没有做付款计划'))]];
  const supRows: XCell[][] = res.suppliers.map((s) => [s.supplier, major(s.open), t(SUPPLIER_CONCLUSION_LABEL[s.conclusion]), flagsText(s.flags, t)]);
  const planOpen = (plan?.lines || []).reduce((s, l) => s + l.open, 0);
  const checks: XCell[][] = [
    [t(i18nKey('三单匹配：可付 + 暂扣 = 发票金额')), match.every((l) => l.payable + l.hold === l.invAmount || (l.payable === 0 && l.hold === l.invAmount))],
  ];
  if (plan) checks.push([t(i18nKey('付款计划：计划内 + 延后 + 暂扣 = 应付未清')), plan.scheduledTotal + plan.deferredTotal + plan.heldTotal === planOpen]);
  if (plan?.available != null) checks.push([t(i18nKey('计划付款不超过可用资金')), plan.scheduledTotal <= Math.max(0, plan.available)]);
  const title = t(i18nKey('三单匹配与付款计划草稿'));
  const xlsxPath = join(ctx.dir, outputFileName(ctx.moduleCode, title, ctx.period, 'xlsx', ctx.at));
  writeWorkbookFile(xlsxPath, [
    { name: nCover, banner, rows: [...coverRows(ctx, t, title, extra.levels), [], [t(i18nKey('付款计划是草稿：本方案不付款，由人按审批层级操作。'))]] },
    {
      name: nMatch, banner,
      headers: [t(i18nKey('采购订单号')), t(i18nKey('订单行号')), t(i18nKey('物料 / 品名')), t(i18nKey('供应商')), t(i18nKey('发票号')), t(i18nKey('订单数量')), t(i18nKey('收货数量')), t(i18nKey('发票数量')),
        t(i18nKey('订单单价')), t(i18nKey('发票单价')), t(i18nKey('订单税率')), t(i18nKey('发票税率')), t(i18nKey('订单金额（按收货）')), t(i18nKey('发票金额')), t(i18nKey('单价差异')), t(i18nKey('差异率')),
        t(i18nKey('数量判定')), t(i18nKey('价格判定')), t(i18nKey('税率判定')), t(i18nKey('结论')), t(i18nKey('可付')), t(i18nKey('暂扣')), t(i18nKey('提示')), t(i18nKey('订单行号（原表）')), t(i18nKey('收货行号（原表）')), t(i18nKey('发票行号（原表）'))],
      rows: matchRows,
    },
    {
      name: nPlan, banner,
      headers: [t(i18nKey('优先级')), t(i18nKey('供应商')), t(i18nKey('等级')), t(i18nKey('发票号')), t(i18nKey('采购订单号')), t(i18nKey('到期日')), t(i18nKey('逾期天数')), t(i18nKey('逾期分级')),
        t(i18nKey('未付金额')), t(i18nKey('暂扣')), t(i18nKey('暂扣原因')), t(i18nKey('安排')), t(i18nKey('建议延至')), t(i18nKey('审批层级')), t(OUT.row)],
      rows: planRows,
    },
    { name: nFunds, banner, rows: fundsRows },
    { name: nSup, banner, headers: [t(i18nKey('供应商')), t(i18nKey('未付金额')), t(i18nKey('结论')), t(i18nKey('复核发现'))], rows: supRows },
    { name: nEsc, banner, headers: [t(i18nKey('升级事项'))], rows: res.escalations.map((e) => [t(e.key, e.params)]) },
    { name: nChecks, banner, headers: [t(OUT.check), t(OUT.result)], rows: checks },
  ], { rtl });

  const sections: DocSection[] = [];
  if (res.matchCounts) {
    sections.push({ heading: t(i18nKey('三单匹配结论')), paragraphs: FAU_MATCH_GRADES.map((g) => `${t(MATCH_GRADE_LABEL[g])}: ${res.matchCounts![g]}`) });
    const issues = match.filter((l) => l.grade === 'review' || l.grade === 'reject');
    if (issues.length) {
      sections.push({
        heading: t(i18nKey('需处理的三单差异')),
        table: { headers: [t(i18nKey('采购订单号')), t(i18nKey('供应商')), t(i18nKey('结论')), t(i18nKey('可付')), t(i18nKey('暂扣')), t(i18nKey('提示'))], rows: issues.map((l) => [l.poNo, l.supplier, t(MATCH_GRADE_LABEL[l.grade]), fmtAmount(l.payable, ctx.locale), fmtAmount(l.hold, ctx.locale), flagsText(l.flags, t)]) },
      });
    }
  }
  if (res.suppliers.length) {
    sections.push({
      heading: t(i18nKey('供应商复核意见')),
      table: { headers: [t(i18nKey('供应商')), t(i18nKey('结论')), t(i18nKey('复核发现'))], rows: res.suppliers.filter((s) => s.flags.length).map((s) => [s.supplier, t(SUPPLIER_CONCLUSION_LABEL[s.conclusion]), flagsText(s.flags, t)]) },
      paragraphs: res.suppliers.some((s) => s.flags.length) ? undefined : [t(i18nKey('无'))],
    });
  }
  if (plan) {
    sections.push({ heading: t(i18nKey('付款计划草稿')), paragraphs: [
      `${t(i18nKey('本次计划付款'))}: ${fmtAmount(plan.scheduledTotal, ctx.locale)}`,
      `${t(i18nKey('延后'))}: ${fmtAmount(plan.deferredTotal, ctx.locale)}`,
      `${t(i18nKey('暂扣'))}: ${fmtAmount(plan.heldTotal, ctx.locale)}`,
      plan.gapTier ? `${t(i18nKey('缺口分档'))}: ${t(GAP_TIER_LABEL[plan.gapTier])}` : '',
    ].filter(Boolean) });
  }
  sections.push({ heading: t(i18nKey('升级事项')), paragraphs: res.escalations.length ? res.escalations.map((e) => `• ${t(e.key, e.params)}`) : [t(i18nKey('无'))] });
  sections.push({ heading: t(i18nKey('发现与建议')), paragraphs: [t(i18nKey('账户变更、疑似个人账户、黑名单的供应商须取得加盖公章的书面变更申请并电话向原对接人核实后再付款；本文件不出具意见，也不付款。'))] });
  const dtitle = t(i18nKey('三单匹配结论与供应商复核意见'));
  const docxPath = join(ctx.dir, outputFileName(ctx.moduleCode, dtitle, ctx.period, 'docx', ctx.at));
  writeDocxFile(docxPath, { title: dtitle, subtitle: `${ctx.companyName} · ${res.asOf}`, meta: [[t(OUT.project), ctx.projectName]], header: t(OUT.notOpinion), watermark: t(OUT.draft), rtl, sections });
  return { xlsxPath, docxPath };
}
