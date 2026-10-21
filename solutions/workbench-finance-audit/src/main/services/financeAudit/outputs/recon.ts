/**
 * A2 对账中心产出（第 5.5 节）：
 *   银企对账：每个账户一份银行余额调节表 xlsx（封面 / 调节表 / 未达账项明细 / 已达账项 / 升级事项 / Checks），
 *     调整后两边余额用公式联动，Checks 断言相等；
 *   总账 ↔ 子账：差异报告 xlsx（封面 / 汇总 / 差异明细 / Checks）+ 例外报告 docx（重大差异与根因追溯）。
 */
import { join } from 'node:path';
import { i18nKey } from '@totalclaw/i18n';
import type { FauBankAccountResult, FauBankClass, FauGlSubClass, FauGlSubResult, FauReminder } from '@totalclaw/ipc-contracts';
import { FAU_BANK_CLASSES, FAU_GLSUB_CLASSES } from '@totalclaw/ipc-contracts';
import { OUT, fmtAmount, labeler, outputFileName } from './common';
import { addr, major, planSheetNames, ref, writeWorkbookFile, type XCell } from './xlsx';
import { writeDocxFile } from './docx';
import { coverRows, type OutputCtx } from './close';

export const BANK_CLASS_LABEL: Record<FauBankClass, string> = {
  matched: i18nKey('已达'),
  book_out_bank_not: i18nKey('企业已付银行未付'),
  book_in_bank_not: i18nKey('企业已收银行未收'),
  bank_out_book_not: i18nKey('银行已付企业未付'),
  bank_in_book_not: i18nKey('银行已收企业未收'),
  amount_diff: i18nKey('金额差异'),
  unmatched: i18nKey('无法匹配'),
};

export const GLSUB_CLASS_LABEL: Record<FauGlSubClass, string> = {
  matched: i18nKey('相符'),
  amount: i18nKey('金额差异'),
  quantity: i18nKey('数量差异'),
  timing: i18nKey('时间差异'),
  gl_only: i18nKey('仅总账有'),
  sub_only: i18nKey('仅子账有'),
};

export const CAUSE_LABEL: Record<string, string> = {
  timing: i18nKey('时间性差异'),
  fx: i18nKey('汇率'),
  mapping: i18nKey('映射'),
  duplicate_or_missing: i18nKey('重复或漏记'),
  fee_or_accrual: i18nKey('费用 / 计提'),
  data_quality: i18nKey('数据质量'),
  fee: i18nKey('银行手续费'),
  interest: i18nKey('利息'),
  unknown_deduction: i18nKey('不明扣款'),
};

export const ACTION_LABEL: Record<string, string> = {
  adjust_gl: i18nKey('调整总账'),
  adjust_subledger: i18nKey('调整子账'),
  wait_timing: i18nKey('等待自然消除'),
  investigate: i18nKey('进一步调查'),
  remap: i18nKey('修正映射'),
  escalate: i18nKey('上报'),
};

export function writeBankOutputs(ctx: OutputCtx, accounts: FauBankAccountResult[], extra: { levels: string[] }): string[] {
  const t = labeler(ctx.locale);
  const rtl = ctx.locale === 'ar';
  const banner = t(OUT.draft);
  const paths: string[] = [];
  for (const acc of accounts) {
    const [nCover, nStmt, nOpen, nMatched, nEsc, nChecks] = planSheetNames([
      t(i18nKey('封面与签核页')), t(i18nKey('银行余额调节表')), t(i18nKey('未达账项明细')), t(i18nKey('已达账项')), t(i18nKey('升级事项')), 'Checks',
    ]);
    const s = acc.statement;
    const R0 = 2;
    const stmt: XCell[][] = [
      [t(i18nKey('企业账面余额')), major(s.bookBalance)],
      [t(i18nKey('加：银行已收企业未收')), major(s.addBankInNotBook)],
      [t(i18nKey('减：银行已付企业未付')), major(s.lessBankOutNotBook)],
      [t(i18nKey('加减：金额差异调整')), major(s.amountDiffAdj)],
      [t(i18nKey('调整后企业余额')), { f: `ROUND(${addr(R0, 1)}+${addr(R0 + 1, 1)}-${addr(R0 + 2, 1)}+${addr(R0 + 3, 1)},2)`, v: major(s.adjustedBook) ?? 0 }],
      [],
      [t(i18nKey('银行对账单余额')), major(s.bankBalance)],
      [t(i18nKey('加：企业已收银行未收')), major(s.addBookInNotBank)],
      [t(i18nKey('减：企业已付银行未付')), major(s.lessBookOutNotBank)],
      [t(i18nKey('调整后银行余额')), { f: `ROUND(${addr(R0 + 6, 1)}+${addr(R0 + 7, 1)}-${addr(R0 + 8, 1)},2)`, v: major(s.adjustedBank) ?? 0 }],
      [],
      [t(i18nKey('两边调整后余额相等')), { f: `ROUND(${addr(R0 + 4, 1)}-${addr(R0 + 9, 1)},2)=0`, v: s.balanced }],
    ];
    const itemRow = (it: FauBankAccountResult['items'][number]): XCell[] => [
      t(BANK_CLASS_LABEL[it.cls]), it.date, it.ref, it.counterparty, it.summary, major(it.bookAmount), major(it.bankAmount),
      it.cause ? t(CAUSE_LABEL[it.cause] || it.cause) : '', it.ageDays ?? '', it.bookRows.join(','), it.bankRows.join(','), it.pass ?? '',
      it.escalate ? t(it.escalate.key, it.escalate.params) : '',
    ];
    const headers = [t(i18nKey('分类')), t(i18nKey('日期')), t(i18nKey('流水号 / 单号')), t(i18nKey('对方')), t(i18nKey('摘要')), t(i18nKey('账面金额')), t(i18nKey('银行金额')), t(i18nKey('原因')), t(i18nKey('账龄（天）')), t(i18nKey('序时账行号')), t(i18nKey('流水行号')), t(i18nKey('匹配轮次')), t(i18nKey('升级'))];
    const open = acc.items.filter((i) => i.cls !== 'matched');
    const matched = acc.items.filter((i) => i.cls === 'matched');
    const counts: XCell[][] = FAU_BANK_CLASSES.map((c) => [t(BANK_CLASS_LABEL[c]), acc.counts[c] || 0]);
    const title = t(i18nKey('银行余额调节表'));
    const path = join(ctx.dir, outputFileName(ctx.moduleCode, `${title}-${acc.account}`, ctx.period, 'xlsx', ctx.at));
    writeWorkbookFile(path, [
      { name: nCover, banner, rows: [...coverRows(ctx, t, `${title} · ${acc.account}`, extra.levels), [], [t(i18nKey('分类计数'))], ...counts] },
      { name: nStmt, banner, headers: [t(i18nKey('项目')), t(i18nKey('金额'))], rows: stmt },
      { name: nOpen, banner, headers, rows: open.map(itemRow) },
      { name: nMatched, banner, headers, rows: matched.map(itemRow) },
      { name: nEsc, banner, headers: [t(i18nKey('升级事项'))], rows: acc.escalations.map((e) => [t(e.key, e.params)]) },
      { name: nChecks, banner, headers: [t(OUT.check), t(OUT.result)], rows: [[t(i18nKey('两边调整后余额相等')), { f: ref(nStmt, R0 + 11, 1), v: s.balanced }]] },
    ], { rtl });
    paths.push(path);
  }
  return paths;
}

export function writeGlSubOutputs(ctx: OutputCtx, res: FauGlSubResult, extra: { levels: string[]; reminders: FauReminder[] }): { reportPath: string; exceptionPath: string } {
  const t = labeler(ctx.locale);
  const rtl = ctx.locale === 'ar';
  const banner = t(OUT.draft);
  const [nCover, nSum, nDetail, nChecks] = planSheetNames([t(i18nKey('封面与签核页')), t(i18nKey('汇总')), t(i18nKey('差异明细')), 'Checks']);
  const R0 = 2;
  const detail: XCell[][] = res.breaks.map((b, i) => {
    const r = R0 + i;
    return [b.key, t(GLSUB_CLASS_LABEL[b.cls]), major(b.glAmount), major(b.subAmount), { f: `ROUND(${addr(r, 2)}-${addr(r, 3)},2)`, v: major(b.diff) ?? 0 },
      b.glQty ?? '', b.subQty ?? '', major(b.glFx), major(b.subFx), b.glDate, b.subDate, b.causes.map((c) => t(CAUSE_LABEL[c] || c)).join('; '),
      b.major ? t(i18nKey('是')) : '', b.trace?.rootCause || '', b.trace?.owner || '', b.trace?.expectedClearDate || '',
      b.trace ? t(ACTION_LABEL[b.trace.action] || b.trace.action) : '', b.trace ? t(b.trace.status === 'verified' ? OUT.verified : b.trace.status === 'rejected' ? i18nKey('已打回') : OUT.unverified) : '',
      b.glRows.join(','), b.subRows.join(',')];
  });
  const summary: XCell[][] = [
    ...FAU_GLSUB_CLASSES.map((c) => [t(GLSUB_CLASS_LABEL[c]), res.counts[c] || 0]),
    [],
    [t(i18nKey('相符率')), res.matchRate],
    [t(i18nKey('总账合计')), major(res.totals.gl)],
    [t(i18nKey('子账合计')), major(res.totals.sub)],
    [t(OUT.diff), { f: `ROUND(${addr(R0 + 8, 1)}-${addr(R0 + 9, 1)},2)`, v: major(res.totals.gl - res.totals.sub) ?? 0 }],
  ];
  const title = t(i18nKey('总账与子账差异报告'));
  const reportPath = join(ctx.dir, outputFileName(ctx.moduleCode, title, ctx.period, 'xlsx', ctx.at));
  writeWorkbookFile(reportPath, [
    { name: nCover, banner, rows: coverRows(ctx, t, title, extra.levels) },
    { name: nSum, banner, headers: [t(i18nKey('分类')), t(i18nKey('数量 / 金额'))], rows: summary },
    {
      name: nDetail, banner,
      headers: [t(i18nKey('对账键')), t(i18nKey('分类')), t(i18nKey('总账金额')), t(i18nKey('子账金额')), t(OUT.diff), t(i18nKey('总账数量')), t(i18nKey('子账数量')), t(i18nKey('总账外币')), t(i18nKey('子账外币')), t(i18nKey('总账日期')), t(i18nKey('子账日期')), t(i18nKey('可能成因')), t(i18nKey('重大')), t(i18nKey('根因')), t(i18nKey('责任方')), t(i18nKey('预计消除日')), t(i18nKey('动作')), t(i18nKey('回核')), t(i18nKey('总账行号')), t(i18nKey('子账行号'))],
      rows: detail,
    },
    { name: nChecks, banner, headers: [t(OUT.check), t(OUT.result)], rows: [[t(i18nKey('差异明细合计与两边总额一致')), res.breaks.reduce((s, b) => s + b.diff, 0) === res.totals.gl - res.totals.sub]] },
  ], { rtl });

  const majors = res.breaks.filter((b) => b.major);
  const exceptionPath = join(ctx.dir, outputFileName(ctx.moduleCode, t(i18nKey('例外报告')), ctx.period, 'docx', ctx.at));
  writeDocxFile(exceptionPath, {
    title: t(i18nKey('例外报告')), subtitle: `${ctx.companyName} · ${ctx.period}`,
    meta: [[t(OUT.project), ctx.projectName], [t(i18nKey('相符率')), `${(res.matchRate * 100).toFixed(1)}%`]],
    header: t(OUT.notOpinion), watermark: t(OUT.draft), rtl,
    sections: [
      { heading: t(i18nKey('汇总')), paragraphs: FAU_GLSUB_CLASSES.map((c) => `${t(GLSUB_CLASS_LABEL[c])}: ${res.counts[c] || 0}`) },
      {
        heading: t(i18nKey('重大差异与根因追溯')),
        paragraphs: majors.length ? undefined : [t(i18nKey('无'))],
        table: majors.length ? {
          headers: [t(i18nKey('对账键')), t(i18nKey('分类')), t(OUT.diff), t(i18nKey('根因')), t(i18nKey('责任方')), t(i18nKey('预计消除日')), t(i18nKey('回核'))],
          rows: majors.map((b) => [b.key, t(GLSUB_CLASS_LABEL[b.cls]), fmtAmount(b.diff, ctx.locale), b.trace?.rootCause || '', b.trace?.owner || '', b.trace?.expectedClearDate || '',
            b.trace ? t(b.trace.status === 'verified' ? OUT.verified : b.trace.status === 'rejected' ? i18nKey('已打回') : OUT.unverified) : '']),
        } : undefined,
      },
      { heading: t(i18nKey('升级事项')), paragraphs: res.escalations.length ? res.escalations.map((e) => `• ${t(e.key, e.params)}`) : [t(i18nKey('无'))] },
      { heading: t(i18nKey('发现与建议')), paragraphs: [t(i18nKey('调整分录在系统外由人审批；本报告只做诊断，不出具意见。'))] },
    ],
  });
  return { reportPath, exceptionPath };
}
