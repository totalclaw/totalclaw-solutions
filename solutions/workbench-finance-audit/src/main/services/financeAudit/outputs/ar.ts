/**
 * A3 应收与账龄产出：
 *   账龄表 xlsx：封面与签核页 / 账龄分布（坏账准备测算）/ 客户账龄 / 应收明细 / TOP 风险客户 / 信用评估 / 升级事项 / Checks；
 *   催款函与信用评估 docx：按阶段的催款函草稿（不发送）+ 信用评估结论。
 * 合计行写公式，Checks 断言账龄分层合计 = 未清合计、坏账准备 = 明细合计。
 */
import { join } from 'node:path';
import { i18nKey } from '@totalclaw/i18n';
import type { FauArResult } from '@totalclaw/ipc-contracts';
import { FAU_AGING_BUCKETS } from '@totalclaw/ipc-contracts';
import {
  AGING_BUCKET_LABEL, BAD_DEBT_PROBABILITY, CREDIT_APPROVAL_LABEL, PAY_HISTORY_LABEL, RISK_LABEL, STAGE_LABEL,
} from '../../../../shared/financeAudit/accountingLabels';
import { OUT, fmtAmount, labeler, outputFileName } from './common';
import { flagsText } from './subledger';
import { addr, major, planSheetNames, ref, writeWorkbookFile, type XCell } from './xlsx';
import { writeDocxFile, type DocSection } from './docx';
import { coverRows, type OutputCtx } from './close';

const LETTER: Record<number, string> = {
  1: i18nKey('感谢贵司一直以来的合作。截至 {d}，贵司以下款项已到期，合计 {a}，请安排付款；如已付款请忽略本函，并告知付款日期以便核对。'),
  2: i18nKey('截至 {d}，贵司以下款项已逾期，合计 {a}。请在收到本函后尽快付款，或告知付款计划与日期；如对金额有异议，请与我司财务联系对账。'),
  3: i18nKey('截至 {d}，贵司以下款项逾期已超过 60 天，合计 {a}。请在约定期限内付清，并书面确认付款日期；如对金额有异议，请提供对账资料。'),
  4: i18nKey('截至 {d}，贵司以下款项逾期已超过 90 天，合计 {a}。款项付清前我司将暂停新订单与发货，请立即安排付款。'),
  5: i18nKey('内部评估（不作为对外函件）：截至 {d}，该客户逾期超过 180 天，合计 {a}。建议法务评估诉讼可行性，或按审批权限准备坏账核销材料。'),
};

export function writeArOutputs(ctx: OutputCtx, res: FauArResult, extra: { levels: string[] }): { xlsxPath: string; docxPath: string | null } {
  const t = labeler(ctx.locale);
  const rtl = ctx.locale === 'ar';
  const banner = t(OUT.draft);
  const [nCover, nBuckets, nCust, nItems, nTop, nCredit, nEsc, nChecks] = planSheetNames([
    t(i18nKey('封面与签核页')), t(i18nKey('账龄分布与坏账准备')), t(i18nKey('客户账龄')), t(i18nKey('应收明细')), t(i18nKey('TOP 风险客户')),
    t(i18nKey('信用评估')), t(i18nKey('升级事项')), 'Checks',
  ]);
  const R0 = 2;
  const nB = FAU_AGING_BUCKETS.length;
  const bucketRows: XCell[][] = res.buckets.map((b, i) => [
    t(AGING_BUCKET_LABEL[b.bucket]), major(b.amount), { f: `IF(${addr(R0 + nB, 1)}=0,0,ROUND(${addr(R0 + i, 1)}/${addr(R0 + nB, 1)},4))`, v: Math.round(b.share * 10000) / 10000 },
    b.count, BAD_DEBT_PROBABILITY[b.bucket], b.provisionRate, major(b.provision),
  ]);
  bucketRows.push([t(i18nKey('合计')), { f: `SUM(${addr(R0, 1)}:${addr(R0 + nB - 1, 1)})`, v: major(res.total) ?? 0 }, 1,
    { f: `SUM(${addr(R0, 3)}:${addr(R0 + nB - 1, 3)})`, v: res.items.length }, '', '', { f: `SUM(${addr(R0, 6)}:${addr(R0 + nB - 1, 6)})`, v: major(res.provision) ?? 0 }]);

  const itemRows: XCell[][] = res.items.map((i) => [
    i.row, i.customer, i.docNo, i.docDate, i.dueDate, major(i.amount), major(i.open), i.overdueDays, t(AGING_BUCKET_LABEL[i.bucket]), i.provisionRate, major(i.provision), i.disputed ? t(i18nKey('是')) : '',
  ]);
  const nI = itemRows.length;
  const custRows: XCell[][] = res.customers.map((c) => [
    c.customer, major(c.open), major(c.overdue), ...FAU_AGING_BUCKETS.map((b) => major(c.byBucket[b])), c.maxOverdueDays, major(c.provision),
    t(RISK_LABEL[c.risk]), t(STAGE_LABEL[c.stage]), major(c.creditLimit), c.utilization == null ? '' : Math.round(c.utilization * 10000) / 10000, flagsText(c.flags, t),
  ]);
  const topRows: XCell[][] = res.top.map((name, i) => {
    const c = res.customers.find((x) => x.customer === name)!;
    return [i + 1, name, major(c.overdue), c.maxOverdueDays, t(RISK_LABEL[c.risk]), t(STAGE_LABEL[c.stage])];
  });
  const creditRows: XCell[][] = res.credit.map((c) => [
    c.customer, t(PAY_HISTORY_LABEL[c.history]), c.lateCount, c.maxLateDays, c.onTimeRate == null ? '' : Math.round(c.onTimeRate * 10000) / 10000,
    c.debtRatio ?? '', c.cashFlowPositive == null ? '' : c.cashFlowPositive ? t(i18nKey('为正')) : t(i18nKey('为负')), c.highRisk.join('; '),
    c.grade, c.termDays, major(c.currentLimit), major(c.requestedLimit), major(c.avgMonthlyBilling), major(c.suggestedLimit), t(CREDIT_APPROVAL_LABEL[c.approval]), flagsText(c.reasons, t),
  ]);
  const title = t(i18nKey('账龄表与坏账准备测算'));
  const xlsxPath = join(ctx.dir, outputFileName(ctx.moduleCode, title, ctx.period, 'xlsx', ctx.at));
  writeWorkbookFile(xlsxPath, [
    { name: nCover, banner, rows: [...coverRows(ctx, t, title, extra.levels), [], [t(i18nKey('截止日')), res.asOf], [t(i18nKey('逾期率')), Math.round(res.overdueRate * 10000) / 10000]] },
    { name: nBuckets, banner, headers: [t(i18nKey('账龄分层')), t(i18nKey('未清金额')), t(i18nKey('占比')), t(i18nKey('笔数')), t(i18nKey('坏账概率')), t(i18nKey('计提比例')), t(i18nKey('坏账准备'))], rows: bucketRows },
    {
      name: nCust, banner,
      headers: [t(i18nKey('客户')), t(i18nKey('未清合计')), t(i18nKey('逾期金额')), ...FAU_AGING_BUCKETS.map((b) => t(AGING_BUCKET_LABEL[b])), t(i18nKey('最长逾期天数')), t(i18nKey('坏账准备')), t(i18nKey('风险')), t(i18nKey('催款阶段')), t(i18nKey('信用额度')), t(i18nKey('额度使用率')), t(i18nKey('提示'))],
      rows: custRows,
    },
    {
      name: nItems, banner,
      headers: [t(OUT.row), t(i18nKey('客户')), t(i18nKey('发票号')), t(i18nKey('开票日期')), t(i18nKey('到期日')), t(i18nKey('金额')), t(i18nKey('未清金额')), t(i18nKey('逾期天数')), t(i18nKey('账龄分层')), t(i18nKey('计提比例')), t(i18nKey('坏账准备')), t(i18nKey('争议'))],
      rows: [...itemRows, [t(i18nKey('合计')), '', '', '', '', '', nI ? { f: `SUM(${addr(R0, 6)}:${addr(R0 + nI - 1, 6)})`, v: major(res.total) ?? 0 } : 0, '', '', '', nI ? { f: `SUM(${addr(R0, 10)}:${addr(R0 + nI - 1, 10)})`, v: major(res.provision) ?? 0 } : 0, '']],
    },
    { name: nTop, banner, headers: ['#', t(i18nKey('客户')), t(i18nKey('逾期金额')), t(i18nKey('最长逾期天数')), t(i18nKey('风险')), t(i18nKey('催款阶段'))], rows: topRows },
    {
      name: nCredit, banner,
      headers: [t(i18nKey('客户')), t(i18nKey('付款历史')), t(i18nKey('逾期次数')), t(i18nKey('最长逾期天数')), t(i18nKey('按时付款率')), t(i18nKey('资产负债率')), t(i18nKey('经营现金流')), t(i18nKey('风险信号')), t(i18nKey('建议等级')), t(i18nKey('建议账期（天）')), t(i18nKey('现有额度')), t(i18nKey('申请额度')), t(i18nKey('月均开票额')), t(i18nKey('建议额度')), t(i18nKey('审批层级')), t(i18nKey('依据'))],
      rows: creditRows,
    },
    { name: nEsc, banner, headers: [t(i18nKey('升级事项'))], rows: res.escalations.map((e) => [t(e.key, e.params)]) },
    {
      name: nChecks, banner, headers: [t(OUT.check), t(OUT.result)],
      rows: [
        [t(i18nKey('账龄分层合计 = 明细未清合计')), { f: `ROUND(${ref(nBuckets, R0 + nB, 1)}-${ref(nItems, R0 + nI, 6)},2)=0`, v: res.buckets.reduce((s, b) => s + b.amount, 0) === res.total }],
        [t(i18nKey('坏账准备 = 明细合计')), { f: `ROUND(${ref(nBuckets, R0 + nB, 6)}-${ref(nItems, R0 + nI, 10)},2)=0`, v: res.buckets.reduce((s, b) => s + b.provision, 0) === res.provision }],
      ],
    },
  ], { rtl });

  if (!res.letters.length && !res.credit.length) return { xlsxPath, docxPath: null };
  const sections: DocSection[] = [];
  if (res.letters.length) {
    sections.push({ heading: t(i18nKey('催款函草稿')), paragraphs: [t(i18nKey('以下函件均为草稿：经财务复核后由人发出，系统不发送。'))] });
    for (const l of res.letters) {
      sections.push({
        heading: `${l.customer} · ${t(STAGE_LABEL[l.stage])}`,
        paragraphs: [`${l.customer}:`, t(LETTER[l.stage], { d: res.asOf, a: fmtAmount(l.overdue, ctx.locale) }), `${ctx.companyName} · ${res.asOf}`],
        table: { headers: [t(i18nKey('发票号')), t(i18nKey('到期日')), t(i18nKey('未清金额')), t(i18nKey('逾期天数'))], rows: l.items.map((i) => [i.docNo || '-', i.dueDate, fmtAmount(i.open, ctx.locale), i.overdueDays]) },
      });
    }
  }
  if (res.credit.length) {
    sections.push({
      heading: t(i18nKey('信用评估')),
      table: {
        headers: [t(i18nKey('客户')), t(i18nKey('付款历史')), t(i18nKey('建议等级')), t(i18nKey('建议账期（天）')), t(i18nKey('建议额度')), t(i18nKey('审批层级')), t(i18nKey('依据'))],
        rows: res.credit.map((c) => [c.customer, t(PAY_HISTORY_LABEL[c.history]), c.grade, c.termDays, fmtAmount(c.suggestedLimit, ctx.locale), t(CREDIT_APPROVAL_LABEL[c.approval]), flagsText(c.reasons, t)]),
      },
    });
  }
  sections.push({ heading: t(i18nKey('发现与建议')), paragraphs: [t(i18nKey('坏账准备与信用额度为测算草稿，入账与授信须按审批权限签核；本文件不出具意见。'))] });
  const dtitle = t(i18nKey('催款函与信用评估草稿'));
  const docxPath = join(ctx.dir, outputFileName(ctx.moduleCode, dtitle, ctx.period, 'docx', ctx.at));
  writeDocxFile(docxPath, {
    title: dtitle, subtitle: `${ctx.companyName} · ${res.asOf}`,
    meta: [[t(OUT.project), ctx.projectName], [t(i18nKey('截止日')), res.asOf]],
    header: t(OUT.notOpinion), watermark: t(OUT.draft), rtl, sections,
  });
  return { xlsxPath, docxPath };
}
