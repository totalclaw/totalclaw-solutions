/**
 * A5 费用报销稽核产出：
 *   xlsx：封面与签核页 / 逐单结论 / 逐张票据检查 / 异常模式 / ZATCA 二维码 / 升级事项 / Checks；
 *   docx：稽核报告与异常清单（发现与建议）。
 */
import { join } from 'node:path';
import { i18nKey } from '@totalclaw/i18n';
import type { FauExpenseResult } from '@totalclaw/ipc-contracts';
import { FAU_CLAIM_VERDICTS } from '@totalclaw/ipc-contracts';
import { ANOMALY_LABEL, CLAIM_VERDICT_LABEL, QR_PROBLEM_LABEL } from '../../../../shared/financeAudit/accountingLabels';
import { OUT, fmtAmount, labeler, outputFileName } from './common';
import { major, planSheetNames, writeWorkbookFile, type XCell } from './xlsx';
import { writeDocxFile, type DocSection } from './docx';
import { coverRows, type OutputCtx } from './close';
import { flagsText } from './subledger';

export function writeExpenseOutputs(ctx: OutputCtx, res: FauExpenseResult, extra: { levels: string[] }): { xlsxPath: string; docxPath: string } {
  const t = labeler(ctx.locale);
  const rtl = ctx.locale === 'ar';
  const banner = t(OUT.draft);
  const [nCover, nClaims, nLines, nAnom, nQr, nEsc, nChecks] = planSheetNames([
    t(i18nKey('封面与签核页')), t(i18nKey('逐单结论')), t(i18nKey('逐张票据检查')), t(i18nKey('异常模式')), t(i18nKey('ZATCA 二维码')), t(i18nKey('升级事项')), 'Checks',
  ]);
  const qrLines = res.lines.filter((l) => l.qr);
  const title = t(i18nKey('费用报销稽核报告'));
  const xlsxPath = join(ctx.dir, outputFileName(ctx.moduleCode, title, ctx.period, 'xlsx', ctx.at));
  writeWorkbookFile(xlsxPath, [
    {
      name: nCover, banner,
      rows: [...coverRows(ctx, t, title, extra.levels), [], [t(i18nKey('截止日')), res.asOf], ...FAU_CLAIM_VERDICTS.map((v) => [t(CLAIM_VERDICT_LABEL[v]), res.counts[v]]),
        [t(i18nKey('报销合计')), major(res.totals.amount)], [t(i18nKey('有问题的金额')), major(res.totals.flagged)]],
    },
    {
      name: nClaims, banner, headers: [t(i18nKey('报销单号')), t(i18nKey('报销人')), t(i18nKey('部门')), t(i18nKey('金额')), t(i18nKey('结论')), t(i18nKey('原因')), t(OUT.row)],
      rows: res.claims.map((c) => [c.claimNo, c.employee, c.dept, major(c.total), t(CLAIM_VERDICT_LABEL[c.verdict]), flagsText(c.reasons, t), c.rows.join(',')]),
    },
    {
      name: nLines, banner,
      headers: [t(OUT.row), t(i18nKey('报销单号')), t(i18nKey('报销人')), t(i18nKey('费用类型')), t(i18nKey('发票号')), t(i18nKey('开票日期')), t(i18nKey('提交日期')), t(i18nKey('销售方')), t(i18nKey('价税合计')), t(i18nKey('税额')), t(i18nKey('检查结果'))],
      rows: res.lines.map((l) => [l.row, l.claimNo, l.employee, l.category, l.invoiceNo, l.invoiceDate, l.submitDate, l.seller, major(l.total), major(l.tax), l.flags.length ? flagsText(l.flags, t) : t(i18nKey('符合规则'))]),
    },
    {
      name: nAnom, banner, headers: [t(i18nKey('异常模式')), t(i18nKey('级别')), t(i18nKey('对象')), t(i18nKey('笔数')), t(i18nKey('金额')), t(OUT.row)],
      rows: res.anomalies.map((a) => [t(ANOMALY_LABEL[a.code]), a.level === 'block' ? t(i18nKey('须升级')) : t(i18nKey('须抽查')), a.subject, a.count, major(a.amount), a.rows.join(',')]),
    },
    {
      name: nQr, banner,
      headers: [t(OUT.row), t(i18nKey('阶段')), t(i18nKey('卖方名称')), t(i18nKey('增值税号')), t(i18nKey('开票时间')), t(i18nKey('含税总额')), t(i18nKey('增值税额')), t(i18nKey('结果'))],
      rows: qrLines.map((l) => [l.row, l.qr!.phase, l.qr!.sellerName, l.qr!.vatNo, l.qr!.timestamp, major(l.qr!.total), major(l.qr!.vat),
        l.qr!.ok ? t(i18nKey('与票面一致')) : l.qr!.problems.map((p) => t(QR_PROBLEM_LABEL[p] || p)).join('; ')]),
    },
    { name: nEsc, banner, headers: [t(i18nKey('升级事项'))], rows: res.escalations.map((e) => [t(e.key, e.params)]) },
    {
      name: nChecks, banner, headers: [t(OUT.check), t(OUT.result)],
      rows: [
        [t(i18nKey('逐单结论笔数 = 报销单数')), FAU_CLAIM_VERDICTS.reduce((s, v) => s + res.counts[v], 0) === res.claims.length],
        [t(i18nKey('逐单金额合计 = 票据合计')), res.claims.reduce((s, c) => s + c.total, 0) === res.totals.amount] as XCell[],
      ],
    },
  ], { rtl });

  const sections: DocSection[] = [
    { heading: t(i18nKey('稽核结论')), paragraphs: FAU_CLAIM_VERDICTS.map((v) => `${t(CLAIM_VERDICT_LABEL[v])}: ${res.counts[v]}`) },
    {
      heading: t(i18nKey('异常清单')),
      paragraphs: res.anomalies.length ? undefined : [t(i18nKey('无'))],
      table: res.anomalies.length ? { headers: [t(i18nKey('异常模式')), t(i18nKey('对象')), t(i18nKey('笔数')), t(i18nKey('金额'))], rows: res.anomalies.map((a) => [t(ANOMALY_LABEL[a.code]), a.subject, a.count, fmtAmount(a.amount, ctx.locale)]) } : undefined,
    },
    {
      heading: t(i18nKey('驳回与升级的报销单')),
      paragraphs: res.claims.some((c) => c.verdict === 'reject' || c.verdict === 'escalate') ? undefined : [t(i18nKey('无'))],
      table: res.claims.some((c) => c.verdict === 'reject' || c.verdict === 'escalate') ? {
        headers: [t(i18nKey('报销单号')), t(i18nKey('报销人')), t(i18nKey('金额')), t(i18nKey('结论')), t(i18nKey('原因'))],
        rows: res.claims.filter((c) => c.verdict === 'reject' || c.verdict === 'escalate').map((c) => [c.claimNo, c.employee, fmtAmount(c.total, ctx.locale), t(CLAIM_VERDICT_LABEL[c.verdict]), flagsText(c.reasons, t)]),
      } : undefined,
    },
    { heading: t(i18nKey('升级事项')), paragraphs: res.escalations.length ? res.escalations.map((e) => `• ${t(e.key, e.params)}`) : [t(i18nKey('无'))] },
    { heading: t(i18nKey('发现与建议')), paragraphs: [t(i18nKey('稽核结论是预审意见：通过、驳回由财务按制度确认；电子发票的真伪以税务平台或 ZATCA 平台查验为准。本文件不出具意见。'))] },
  ];
  const dtitle = t(i18nKey('稽核报告与异常清单'));
  const docxPath = join(ctx.dir, outputFileName(ctx.moduleCode, dtitle, ctx.period, 'docx', ctx.at));
  writeDocxFile(docxPath, { title: dtitle, subtitle: `${ctx.companyName} · ${res.asOf}`, meta: [[t(OUT.project), ctx.projectName]], header: t(OUT.notOpinion), watermark: t(OUT.draft), rtl, sections });
  return { xlsxPath, docxPath };
}
