/**
 * A1 月结关账产出（第 5.5 节第 ⑤ 步）：
 *   关账包 xlsx 10 个 sheet：封面与签核页 / 关账清单 / 试算与勾稽 / 跨期调整 / 计提表 / 分录草稿 / 滚动表 / 波动说明 / 未结事项 / Checks；
 *   关账备忘录 docx：本期关键事项、阻断项处理、未结事项、发现与建议（无意见段）；
 *   分录草稿另出一份通用凭证导入格式 xlsx（列与财务智能体 voucherExportRows 一致）。
 * 文案全部按输出语言（tIn），用户数据（科目名、往来单位、摘要）原样保留。
 */
import { join } from 'node:path';
import { i18nKey } from '@totalclaw/i18n';
import type { FauCheckMark, FauCloseResult, FauJeLine, FauLocale, FauReminder } from '@totalclaw/ipc-contracts';
import { OUT, fmtAmount, labeler, outputFileName, type L } from './common';
import { addr, major, planSheetNames, ref, writeWorkbookFile, type XCell, type XSheet } from './xlsx';
import { writeDocxFile, type DocSection } from './docx';

export interface OutputCtx {
  locale: FauLocale;
  dir: string;
  companyName: string;
  projectName: string;
  period: string;
  moduleCode: string;
  moduleName: string;
  modeName: string;
  standardLabel: string;
  model?: string;
  at?: Date;
}

export function coverRows(ctx: OutputCtx, t: L, title: string, levels: string[]): XCell[][] {
  return [
    [title],
    [t(OUT.company), ctx.companyName],
    [t(OUT.project), ctx.projectName],
    [t(OUT.period), ctx.period],
    [t(OUT.module), `${ctx.moduleCode} ${t(ctx.moduleName)}`],
    [t(OUT.mode), t(ctx.modeName)],
    [t(OUT.standard), t(ctx.standardLabel)],
    [t(OUT.preparedAt), (ctx.at || new Date()).toISOString()],
    [t(OUT.model), ctx.model || ''],
    [],
    [t(OUT.boundary)],
    [],
    [t(OUT.signLevel), t(OUT.signer), t(OUT.signTitle), t(OUT.signAt), t(OUT.signComment), t(OUT.signature)],
    ...levels.map((l) => [t(l === 'prepare' ? OUT.prepare : l === 'review' ? OUT.review : OUT.approve), '', '', '', '', '']),
  ];
}

const MARK_LABEL: Record<FauCheckMark, string> = {
  ok: i18nKey('通过'), warn: i18nKey('提醒'), fail: i18nKey('不通过'), pending: i18nKey('待评'),
};

/** 通用凭证导入格式的列（与财务智能体 voucher.ts::voucherExportRows 同一组 key） */
export const JE_COLUMNS = [
  i18nKey('日期'), i18nKey('凭证字号'), i18nKey('分录序号'), i18nKey('摘要'), i18nKey('科目编码'), i18nKey('科目名称'),
  i18nKey('辅助核算'), i18nKey('借方金额'), i18nKey('贷方金额'), i18nKey('状态'),
];

export function jeRows(lines: FauJeLine[], t: L): XCell[][] {
  return lines.map((l) => [l.date, l.voucherNo, l.lineNo, l.summary, l.accountCode, l.accountName, l.aux, major(l.debit) || null, major(l.credit) || null, t(i18nKey('草稿'))]);
}

export interface CloseOutputs { packagePath: string; memoPath: string; jePath: string | null; sheetNames: string[] }

export function writeCloseOutputs(ctx: OutputCtx, res: FauCloseResult, extra: { reminders: FauReminder[]; levels: string[] }): CloseOutputs {
  const t = labeler(ctx.locale);
  const rtl = ctx.locale === 'ar';
  const banner = t(OUT.draft);
  const names = planSheetNames([
    t(i18nKey('封面与签核页')), t(i18nKey('关账清单')), t(i18nKey('试算与勾稽')), t(i18nKey('跨期调整')), t(i18nKey('计提表')),
    t(i18nKey('分录草稿')), t(i18nKey('滚动表')), t(i18nKey('波动说明')), t(i18nKey('未结事项')), 'Checks',
  ]);
  const [nCover, nList, nTrial, nCross, nAccr, nJe, nRoll, nFlux, nOpen, nChecks] = names;
  // 数据行从第 3 行开始（第 1 行草稿警示、第 2 行表头）→ 0-based 行号 2
  const R0 = 2;
  const checks: XCell[][] = [];

  // 2 关账清单
  const cl = res.checklist;
  const listRows: XCell[][] = (cl?.items || []).map((it, i) => [i + 1, t(it.label.key, it.label.params), it.auto ? t(i18nKey('自动')) : t(i18nKey('人工')), t(MARK_LABEL[it.mark]), it.evidence || (it.note ? t(it.note.key, it.note.params) : ''), it.critical ? t(i18nKey('关键项')) : '']);
  if (cl) {
    listRows.push([]);
    listRows.push([t(i18nKey('可以开始结账')), cl.canStart ? t(i18nKey('是')) : t(i18nKey('否'))]);
    for (const r of cl.reasons) listRows.push(['', t(r.key, r.params)]);
    checks.push([t(i18nKey('关账清单：可以开始结账')), cl.canStart]);
  }

  // 3 试算与勾稽
  const tr = res.trial;
  const trialRows: XCell[][] = [];
  if (tr) {
    const tt = tr.totals;
    const lines: Array<[string, number, number]> = [
      [t(i18nKey('期初余额')), tt.openingDr, tt.openingCr],
      [t(i18nKey('本期发生额')), tt.periodDr, tt.periodCr],
      [t(i18nKey('期末余额')), tt.closingDr, tt.closingCr],
    ];
    lines.forEach(([label, dr, cr], i) => {
      const r = R0 + i;
      trialRows.push([label, major(dr), major(cr), { f: `ROUND(${addr(r, 1)}-${addr(r, 2)},2)`, v: major(dr - cr) ?? 0 }, { f: `ABS(${addr(r, 3)})<0.01`, v: Math.abs(dr - cr) < 1 }]);
    });
    checks.push([t(i18nKey('试算平衡（期末借方 = 期末贷方）')), { f: `${ref(nTrial, R0 + 2, 4)}`, v: Math.abs(tt.closingDr - tt.closingCr) < 1 }]);
    trialRows.push([]);
    trialRows.push([t(OUT.check), t(OUT.left), t(OUT.right), t(OUT.diff), t(OUT.result), t(i18nKey('说明'))]);
    const startTie = R0 + lines.length + 2;
    tr.checks.forEach((c, i) => {
      const r = startTie + i;
      trialRows.push([t(TIE_LABEL[c.id] || c.id), major(c.left), major(c.right), { f: `ROUND(${addr(r, 1)}-${addr(r, 2)},2)`, v: major(c.left - c.right) ?? 0 }, { f: `ABS(${addr(r, 3)})<0.01`, v: c.ok }, t(c.message.key, c.message.params)]);
      checks.push([t(TIE_LABEL[c.id] || c.id), { f: ref(nTrial, r, 4), v: c.ok }]);
    });
    const det = tr.checks.flatMap((c) => (c.details || []).map((d) => ({ c, d })));
    if (det.length) {
      trialRows.push([]);
      trialRows.push([t(i18nKey('差异科目')), t(i18nKey('科目编码')), t(OUT.left), t(OUT.right), t(OUT.diff)]);
      for (const { c, d } of det) trialRows.push([`${t(TIE_LABEL[c.id] || c.id)} · ${d.accountName}`, d.accountCode, major(d.left), major(d.right), major(d.diff)]);
    }
  }

  // 4 跨期调整
  const crossRows: XCell[][] = (res.crossPeriod || []).map((x) => [
    x.voucherNo, x.date, x.businessDate, `${x.accountCode} ${x.accountName}`.trim(), x.summary, major(x.amount),
    t(CROSS_LABEL[x.type]), x.days, x.amountTier, x.dayTier, t(APPROVAL_LABEL[x.approval]), x.adjustThisPeriod ? t(i18nKey('是')) : t(i18nKey('否')), t(x.advice.key, x.advice.params), x.row,
  ]);

  // 5 计提表（本期计提 = MAX(应摊 − 已入账, 0)，公式联动）
  const accrRows: XCell[][] = (res.accruals || []).map((a, i) => {
    const r = R0 + i;
    return [a.policyId, a.description, a.expenseAccount, a.liabilityAccount, t(BASIS_LABEL[a.basis]), major(a.base), major(a.due), major(a.booked),
      { f: `MAX(ROUND(${addr(r, 6)}-${addr(r, 7)},2),0)`, v: major(a.accrual) ?? 0 }, a.autoReverse ? t(i18nKey('是')) : t(i18nKey('否')), a.formula];
  });

  // 6 分录草稿（借贷合计 + 平衡检查）
  const je = res.jeDraft || [];
  const jeData = jeRows(je, t);
  if (je.length) {
    const last = R0 + je.length - 1;
    const sumDr = je.reduce((s, l) => s + l.debit, 0);
    const sumCr = je.reduce((s, l) => s + l.credit, 0);
    jeData.push(['', '', '', t(i18nKey('合计')), '', '', '', { f: `SUM(${addr(R0, 7)}:${addr(last, 7)})`, v: major(sumDr) ?? 0 }, { f: `SUM(${addr(R0, 8)}:${addr(last, 8)})`, v: major(sumCr) ?? 0 }, '']);
    checks.push([t(i18nKey('分录草稿借贷平衡')), { f: `ROUND(${ref(nJe, last + 1, 7)}-${ref(nJe, last + 1, 8)},2)=0`, v: sumDr === sumCr }]);
  }

  // 7 滚动表：计算期末 = 期初 + 各活动；未解释差异 = 余额表期末 − 计算期末（不倒挤）
  const rollRows: XCell[][] = (res.rollForward || []).map((x, i) => {
    const r = R0 + i;
    return [x.accountCode, x.accountName, major(x.opening), major(x.additions), major(x.accruals), major(x.reversals), major(x.payments), major(x.reclass), major(x.fx), major(x.other),
      // 计算期末 = 期初 + 增加 + 计提 − 冲回 − 付款 + 重分类 + 折算 + 其他（冲回、付款以正数列示）
      { f: `ROUND(C${r + 1}+D${r + 1}+E${r + 1}-F${r + 1}-G${r + 1}+H${r + 1}+I${r + 1}+J${r + 1},2)`, v: major(x.computed) ?? 0 },
      major(x.closing), { f: `ROUND(${addr(r, 11)}-${addr(r, 10)},2)`, v: major(x.unexplained) ?? 0 }];
  });
  if (res.rollForward?.length) {
    const unexplained = res.rollForward.filter((x) => x.unexplained !== 0).length;
    checks.push([t(i18nKey('滚动表无未解释差异')), unexplained === 0]);
  }

  // 8 波动说明
  const fluxRows: XCell[][] = (res.flux || []).map((x, i) => {
    const r = R0 + i;
    return [x.accountCode, x.accountName, major(x.current), major(x.prior), { f: `ROUND(${addr(r, 2)}-${addr(r, 3)},2)`, v: major(x.diffPrior) ?? 0 },
      x.diffPriorPct == null ? '' : { f: `IF(${addr(r, 3)}=0,"",${addr(r, 4)}/ABS(${addr(r, 3)}))`, v: x.diffPriorPct }, major(x.budget), major(x.diffBudget),
      t(x.reason === 'must_review' ? i18nKey('必评科目') : i18nKey('超阈值')),
      x.drivers.map((d) => `${d.label} ${fmtAmount(d.amount, ctx.locale)}`).join('; '),
      x.commentary, t(COMMENT_STATUS[x.commentaryStatus])];
  });
  if (res.flux?.length) checks.push([t(i18nKey('波动说明全部回核通过')), res.flux.every((x) => x.commentaryStatus !== 'unverified')]);

  // 9 未结事项（A2 转交）
  const openRows: XCell[][] = res.openItems.map((o) => [o.fromModuleId, o.fromRunId, o.description, major(o.amount), o.owner || '']);

  const sheets: XSheet[] = [
    { name: nCover, banner, rows: coverRows(ctx, t, t(i18nKey('关账包')), extra.levels) },
    { name: nList, banner, headers: [t(i18nKey('序号')), t(OUT.check), t(i18nKey('判断方式')), t(OUT.result), t(i18nKey('证据 / 说明')), t(i18nKey('关键项'))], rows: listRows },
    { name: nTrial, banner, headers: [t(i18nKey('项目')), t(i18nKey('借方')), t(i18nKey('贷方')), t(OUT.diff), t(OUT.result)], rows: trialRows },
    { name: nCross, banner, headers: [t(i18nKey('凭证号')), t(i18nKey('记账日期')), t(i18nKey('业务日期')), t(i18nKey('科目')), t(i18nKey('摘要')), t(i18nKey('金额')), t(i18nKey('类型')), t(i18nKey('天数')), t(i18nKey('金额档')), t(i18nKey('天数档')), t(i18nKey('审批层级')), t(i18nKey('本期调整')), t(i18nKey('建议')), t(OUT.row)], rows: crossRows },
    { name: nAccr, banner, headers: [t(i18nKey('政策编号')), t(i18nKey('计提项目')), t(i18nKey('费用科目')), t(i18nKey('负债科目')), t(i18nKey('计算方式')), t(i18nKey('基数')), t(i18nKey('本期应摊')), t(i18nKey('已入账')), t(i18nKey('本期计提')), t(i18nKey('自动冲回')), t(i18nKey('算式'))], rows: accrRows },
    { name: nJe, banner, headers: JE_COLUMNS.map((k) => t(k)), rows: jeData },
    { name: nRoll, banner, headers: [t(i18nKey('科目编码')), t(i18nKey('科目名称')), t(i18nKey('期初')), t(i18nKey('增加')), t(i18nKey('计提')), t(i18nKey('冲回')), t(i18nKey('付款')), t(i18nKey('重分类')), t(i18nKey('折算')), t(i18nKey('其他')), t(i18nKey('计算期末')), t(i18nKey('余额表期末')), t(i18nKey('未解释差异'))], rows: rollRows },
    { name: nFlux, banner, headers: [t(i18nKey('科目编码')), t(i18nKey('科目名称')), t(i18nKey('本期')), t(i18nKey('上期')), t(i18nKey('对上期差额')), t(i18nKey('对上期差额 %')), t(i18nKey('预算')), t(i18nKey('对预算差额')), t(i18nKey('原因')), t(i18nKey('主要驱动')), t(i18nKey('说明')), t(i18nKey('回核'))], rows: fluxRows },
    { name: nOpen, banner, headers: [t(i18nKey('来源模块')), t(i18nKey('来源运行')), t(i18nKey('说明')), t(i18nKey('金额')), t(i18nKey('责任人'))], rows: openRows },
    { name: nChecks, banner, headers: [t(OUT.check), t(OUT.result)], rows: checks },
  ];
  const title = t(i18nKey('关账包'));
  const packagePath = join(ctx.dir, outputFileName(ctx.moduleCode, title, ctx.period, 'xlsx', ctx.at));
  const sheetNames = writeWorkbookFile(packagePath, sheets, { rtl });

  let jePath: string | null = null;
  if (je.length) {
    jePath = join(ctx.dir, outputFileName(ctx.moduleCode, t(i18nKey('凭证导入草稿')), ctx.period, 'xlsx', ctx.at));
    // 导入文件第一行必须是表头（ERP 按列映射导入），草稿说明放第二张表，状态列逐行写「草稿」
    writeWorkbookFile(jePath, [
      { name: t(i18nKey('分录草稿')), headers: JE_COLUMNS.map((k) => t(k)), rows: jeRows(je, t) },
      { name: t(i18nKey('说明')), rows: [[t(OUT.draft)], [t(OUT.boundary)]] },
    ], { rtl });
  }

  const memoPath = join(ctx.dir, outputFileName(ctx.moduleCode, t(i18nKey('关账备忘录')), ctx.period, 'docx', ctx.at));
  writeDocxFile(memoPath, {
    title: t(i18nKey('关账备忘录')), subtitle: `${ctx.companyName} · ${ctx.period}`,
    meta: [[t(OUT.project), ctx.projectName], [t(OUT.standard), t(ctx.standardLabel)], [t(OUT.preparedAt), (ctx.at || new Date()).toISOString().slice(0, 10)]],
    header: t(OUT.notOpinion), watermark: t(OUT.draft), rtl, sections: memoSections(res, extra.reminders, ctx.locale, t),
  });
  return { packagePath, memoPath, jePath, sheetNames };
}

function memoSections(res: FauCloseResult, reminders: FauReminder[], locale: FauLocale, t: L): DocSection[] {
  const key: string[] = [];
  if (res.trial) key.push(t(res.trial.balanced ? i18nKey('试算平衡，三表勾稽与期初衔接检查见关账包「试算与勾稽」。') : i18nKey('试算不平或勾稽未通过，详见关账包「试算与勾稽」，需批准人签核。')));
  const cross = res.crossPeriod || [];
  if (cross.length) key.push(t(i18nKey('识别跨期分录 {n} 笔，其中须本期调整 {m} 笔。'), { n: cross.length, m: cross.filter((c) => c.adjustThisPeriod).length }));
  const accr = (res.accruals || []).reduce((s, a) => s + a.accrual, 0);
  if (res.accruals?.length) key.push(t(i18nKey('本期计提合计 {p0}，分录草稿 {n} 行，未过账。'), { p0: fmtAmount(accr, locale), n: res.jeDraft?.length || 0 }));
  const unexplained = (res.rollForward || []).filter((r) => r.unexplained !== 0);
  if (unexplained.length) key.push(t(i18nKey('滚动表有 {n} 个科目存在未解释差异，已列出，未倒挤。'), { n: unexplained.length }));
  if (res.flux?.length) key.push(t(i18nKey('波动说明 {n} 行，其中未核实 {m} 行。'), { n: res.flux.length, m: res.flux.filter((f) => f.commentaryStatus === 'unverified').length }));
  const sections: DocSection[] = [
    { heading: t(i18nKey('本期关键事项')), paragraphs: key.length ? key : [t(i18nKey('无'))] },
    { heading: t(i18nKey('阻断项与提醒项处理')), paragraphs: reminders.length ? reminders.map((r) => `• ${t(r.message.key, r.message.params)}`) : [t(i18nKey('无'))] },
    {
      heading: t(i18nKey('未结事项')),
      paragraphs: res.openItems.length ? undefined : [t(i18nKey('无'))],
      table: res.openItems.length ? { headers: [t(i18nKey('说明')), t(i18nKey('金额')), t(i18nKey('责任人'))], rows: res.openItems.map((o) => [o.description, fmtAmount(o.amount, locale), o.owner || '']) } : undefined,
    },
  ];
  const fluxDone = (res.flux || []).filter((f) => f.commentary);
  if (fluxDone.length) {
    sections.push({
      heading: t(i18nKey('波动说明')),
      table: { headers: [t(i18nKey('科目名称')), t(i18nKey('对上期差额')), t(i18nKey('说明')), t(i18nKey('回核'))], rows: fluxDone.map((f) => [f.accountName, fmtAmount(f.diffPrior, locale), f.commentary, t(COMMENT_STATUS[f.commentaryStatus])]) },
    });
  }
  sections.push({ heading: t(i18nKey('发现与建议')), paragraphs: [t(i18nKey('以上为编制人整理的发现与建议，供复核与批准；分录只出草稿，过账由财务主管在系统外完成。'))] });
  return sections;
}

export const TIE_LABEL: Record<string, string> = {
  trial: i18nKey('试算平衡'),
  bs: i18nKey('资产 = 负债 + 所有者权益'),
  np_retained: i18nKey('净利润 = 未分配利润本期增加'),
  cashflow: i18nKey('现金流量净额 = 货币资金变动'),
  opening: i18nKey('期初 = 上期期末'),
  movement: i18nKey('序时账发生额 = 余额表本期发生'),
};

const CROSS_LABEL: Record<string, string> = { omitted: i18nKey('漏做'), early: i18nKey('提前'), late: i18nKey('延迟') };
const APPROVAL_LABEL: Record<string, string> = { preparer: i18nKey('编制人'), reviewer: i18nKey('复核人'), approver: i18nKey('批准人') };
const BASIS_LABEL: Record<string, string> = { fixed: i18nKey('固定金额'), straight_line: i18nKey('直线摊销'), rate: i18nKey('按比例') };
const COMMENT_STATUS: Record<string, string> = { none: i18nKey('未写说明'), verified: i18nKey('已核实'), unverified: i18nKey('未核实'), unknown: i18nKey('原因不明，待主管确认') };
