/**
 * B3 产出：PBC 进度与审计调整影响 xlsx；函证控制表 xlsx；每份函证一份询证函 docx（草稿，签核归档后由人点发送）；
 * 回函差异与替代程序 docx。不出具审计意见；询证函正文只请对方核对余额。
 */
import { join } from 'node:path';
import { i18nKey } from '@totalclaw/i18n';
import type { FauConfirmation, FauExtAuditResult } from '@totalclaw/ipc-contracts';
import { OUT, fmtAmount, labeler, outputFileName, type L } from '../../../outputs/common';
import { addr, major, planSheetNames, writeWorkbookFile, type XCell } from '../../../outputs/xlsx';
import { writeDocxFile } from '../../../outputs/docx';
import { coverRows, type OutputCtx } from '../../../outputs/close';
import { CONFIRM_STATUS_LABEL, CONFIRM_TYPE_LABEL, PBC_STATUS_LABEL } from '../../../../../../shared/financeAudit/auditLabels';

type Out = Array<{ kind: 'xlsx' | 'docx'; path: string; title: string; confId?: string }>;

/** 询证函正文（按输出语言）：发送时用同一套文案写邮件 */
export function letterText(t: L, c: FauConfirmation, company: string, asOf: string, locale: OutputCtx['locale']): { subject: string; body: string[] } {
  const amount = `${fmtAmount(c.bookAmount, locale)} ${c.currency}`;
  return {
    subject: t(i18nKey('询证函：{p0}（函证编号 {p1}）'), { p0: company, p1: c.id }),
    body: [
      t(i18nKey('致 {p0}：'), { p0: c.party }),
      t(i18nKey('本公司（{p0}）正在接受财务报表审计。按照审计要求，请贵方核对截至 {p1} 本公司在贵方的下列余额：'), { p0: company, p1: asOf }),
      `${t(CONFIRM_TYPE_LABEL[c.type])} · ${c.account || '-'} · ${amount}`,
      t(i18nKey('如余额相符，请在本函签章后回复；如不相符，请列明贵方记录的金额与差异原因。回复时请注明函证编号 {p0}。'), { p0: c.id }),
      t(i18nKey('本函仅用于审计核对，不作为付款或催收依据。'), {}),
    ],
  };
}

function controlRows(t: L, list: FauConfirmation[]): XCell[][] {
  const R0 = 2;
  return list.map((c, i) => [
    c.id, t(CONFIRM_TYPE_LABEL[c.type]), c.party, c.email, c.account, major(c.bookAmount), c.currency, c.sentAt?.slice(0, 10) || '',
    c.replyFile || '', major(c.replyAmount),
    c.replyAmount === null ? '' : { f: `ROUND(${addr(R0 + i, 5)}-${addr(R0 + i, 9)},2)`, v: major(c.diff) ?? 0 },
    t(CONFIRM_STATUS_LABEL[c.status]), c.ageDays ?? '', c.replyVerified === false ? t(OUT.unverified) : c.replyVerified ? t(OUT.verified) : '',
    c.alternative.map((a) => t(a)).join('; '),
  ]);
}

function controlHead(t: L): string[] {
  return [t(i18nKey('函证编号')), t(i18nKey('类型')), t(i18nKey('函证对象')), t(i18nKey('邮箱')), t(i18nKey('账号或往来')), t(i18nKey('账面金额')), t(i18nKey('币种')),
    t(i18nKey('发函日期')), t(i18nKey('回函文件')), t(i18nKey('回函金额')), t(OUT.diff), t(i18nKey('状态')), t(i18nKey('发函后天数')), t(i18nKey('回核')), t(i18nKey('替代程序'))];
}

export function writeExtAuditOutputs(ctx: OutputCtx, res: FauExtAuditResult, levels: string[], companyName: string): Out {
  const t = labeler(ctx.locale);
  const rtl = ctx.locale === 'ar';
  const banner = t(OUT.draft);
  const out: Out = [];

  if (res.mode === 'support') {
    const pbc = res.pbc || [];
    const adj = res.adjustments || [];
    const tot = res.adjustmentTotals || { profit: 0, assets: 0, liabilities: 0, equity: 0 };
    const [nCover, nPbc, nAdj, nSum, nChecks] = planSheetNames([t(i18nKey('封面与签核页')), t(i18nKey('PBC 进度')), t(i18nKey('审计调整')), t(i18nKey('调整影响汇总')), 'Checks']);
    const R0 = 2;
    const last = R0 + adj.length - 1;
    const sumF = (c: number, v: number): XCell => (adj.length ? { f: `SUM('${nAdj.replace(/'/g, "''")}'!${addr(R0, c)}:${addr(last, c)})`, v: major(v) ?? 0 } : major(v));
    const title = t(i18nKey('外审配合：资料清单与审计调整'));
    const path = join(ctx.dir, outputFileName(ctx.moduleCode, title, ctx.period, 'xlsx', ctx.at));
    const provided = pbc.filter((x) => x.status === 'provided').length;
    writeWorkbookFile(path, [
      { name: nCover, banner, rows: [...coverRows(ctx, t, title, levels), [], [t(i18nKey('截至日')), res.asOf], [t(i18nKey('重要性水平')), major(res.materiality)]] },
      { name: nPbc, banner, headers: [t(i18nKey('编号')), t(i18nKey('资料名称')), t(i18nKey('负责人')), t(i18nKey('截止日期')), t(i18nKey('状态')), t(i18nKey('底稿索引')), t(OUT.source)],
        rows: [...pbc.map((x) => [x.id, x.item, x.owner, x.dueDate, t(PBC_STATUS_LABEL[x.status]), x.ref, x.source === 'handoff' ? t(i18nKey('转交')) : t(i18nKey('上传'))] as XCell[]), [], [t(i18nKey('完成率')), pbc.length ? provided / pbc.length : '']] },
      { name: nAdj, banner, headers: [t(i18nKey('凭证号')), t(i18nKey('摘要')), t(i18nKey('分录行数')), t(i18nKey('借方合计')), t(i18nKey('贷方合计')), t(i18nKey('利润影响')), t(i18nKey('资产影响')), t(i18nKey('负债影响')), t(i18nKey('权益影响')), t(i18nKey('超过重要性水平')), t(i18nKey('借贷平衡'))],
        rows: adj.map((a) => [a.voucherNo, a.summary, a.lines, major(a.debit), major(a.credit), major(a.profitImpact), major(a.assetImpact), major(a.liabilityImpact), major(a.equityImpact), a.exceedsMateriality ? t(i18nKey('是')) : '', a.balanced]) },
      { name: nSum, banner, headers: [t(i18nKey('项目')), t(i18nKey('金额'))], rows: [
        [t(i18nKey('调整前利润')), major(res.profitBefore ?? null)],
        [t(i18nKey('调整对利润的影响')), sumF(5, tot.profit)],
        [t(i18nKey('调整后利润')), res.profitBefore == null ? '' : { f: `${addr(R0, 1)}+${addr(R0 + 1, 1)}`, v: major(res.profitBefore + tot.profit) ?? 0 }],
        [t(i18nKey('资产影响')), sumF(6, tot.assets)],
        [t(i18nKey('负债影响')), sumF(7, tot.liabilities)],
        [t(i18nKey('权益影响')), sumF(8, tot.equity)],
      ] },
      { name: nChecks, banner, headers: [t(OUT.check), t(OUT.result)], rows: [
        [t(i18nKey('每张调整凭证借贷平衡')), adj.every((a) => a.balanced)],
        [t(i18nKey('资料清单全部已提供')), pbc.every((x) => x.status === 'provided')],
      ] },
    ], { rtl });
    out.push({ kind: 'xlsx', path, title: i18nKey('外审配合：资料清单与审计调整') });
    return out;
  }

  const list = res.confirmations || [];
  const [nCover, nCtl, nChecks] = planSheetNames([t(i18nKey('封面与签核页')), t(i18nKey('函证控制表')), 'Checks']);
  const title = t(i18nKey('函证控制表'));
  const path = join(ctx.dir, outputFileName(ctx.moduleCode, title, ctx.period, 'xlsx', ctx.at));
  writeWorkbookFile(path, [
    { name: nCover, banner, rows: [...coverRows(ctx, t, title, levels), [], [t(i18nKey('截至日')), res.asOf], [t(i18nKey('回函率')), res.responseRate ?? ''], [t(i18nKey('函证只出草稿：签核归档后由人点「发送」并在确认框确认，才会交给邮件发送'))]] },
    { name: nCtl, banner, headers: controlHead(t), rows: controlRows(t, list) },
    { name: nChecks, banner, headers: [t(OUT.check), t(OUT.result)], rows: [
      [t(i18nKey('每份函证都有邮箱')), list.every((c) => !!c.email)],
      [t(i18nKey('回函金额全部回原文核实')), list.every((c) => c.replyVerified !== false)],
    ] },
  ], { rtl });
  out.push({ kind: 'xlsx', path, title: i18nKey('函证控制表') });

  if (res.mode === 'confirm_prepare') {
    for (const c of list) {
      const txt = letterText(t, c, companyName, res.asOf, ctx.locale);
      const lp = join(ctx.dir, 'letters', outputFileName(ctx.moduleCode, `${t(i18nKey('询证函'))}-${c.id}`, ctx.period, 'docx', ctx.at));
      writeDocxFile(lp, {
        title: t(i18nKey('询证函')), subtitle: `${c.id} · ${c.party}`, header: t(OUT.notOpinion), watermark: t(OUT.draft), rtl,
        sections: [{ heading: txt.subject, paragraphs: [...txt.body, '', `${companyName}`, t(i18nKey('（盖章）')), '', t(i18nKey('回复方确认：余额相符 / 不相符（请列明差异）')), t(i18nKey('（签章）'))] }],
      });
      out.push({ kind: 'docx', path: lp, title: i18nKey('询证函'), confId: c.id });
    }
    return out;
  }

  const issues = list.filter((c) => c.status === 'replied_diff' || c.status === 'no_reply');
  const dp = join(ctx.dir, outputFileName(ctx.moduleCode, t(i18nKey('回函差异与替代程序')), ctx.period, 'docx', ctx.at));
  writeDocxFile(dp, {
    title: t(i18nKey('回函差异与替代程序')), subtitle: `${ctx.companyName} · ${ctx.period}`, header: t(OUT.notOpinion), watermark: t(OUT.draft), rtl,
    sections: [
      { heading: t(i18nKey('汇总')), paragraphs: (['replied_match', 'replied_diff', 'sent', 'no_reply', 'draft'] as const).map((s) => `${t(CONFIRM_STATUS_LABEL[s])}: ${list.filter((c) => c.status === s).length}`) },
      {
        heading: t(i18nKey('差异与未回函')),
        paragraphs: issues.length ? undefined : [t(i18nKey('无'))],
        table: issues.length ? { headers: [t(i18nKey('函证编号')), t(i18nKey('函证对象')), t(i18nKey('账面金额')), t(i18nKey('回函金额')), t(OUT.diff), t(i18nKey('状态')), t(i18nKey('替代程序'))],
          rows: issues.map((c) => [c.id, c.party, fmtAmount(c.bookAmount, ctx.locale), fmtAmount(c.replyAmount, ctx.locale), fmtAmount(c.diff, ctx.locale), t(CONFIRM_STATUS_LABEL[c.status]), c.alternative.map((a) => t(a)).join('; ')]) } : undefined,
      },
      { heading: t(i18nKey('发现与建议')), paragraphs: [t(i18nKey('回函差异的调账与否由人判断；本文件只列差异与可执行的替代程序，不出具审计意见。'))] },
    ],
  });
  out.push({ kind: 'docx', path: dp, title: i18nKey('回函差异与替代程序') });
  return out;
}
