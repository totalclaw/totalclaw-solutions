/**
 * A6 固定资产产出：
 *   xlsx：封面与签核页 / 折旧核对表 / 资产滚动表（公式联动）/ 处置审核 / 购置审核 / 分录草稿 / 与总账核对 / 升级事项 / Checks；
 *   docx：购置与处置审核意见；处置分录另出通用凭证导入格式草稿。
 */
import { join } from 'node:path';
import { i18nKey } from '@totalclaw/i18n';
import type { FauFaResult } from '@totalclaw/ipc-contracts';
import { DEP_METHOD_LABEL } from '../../../../shared/financeAudit/accountingLabels';
import { OUT, fmtAmount, labeler, outputFileName } from './common';
import { addr, major, planSheetNames, writeWorkbookFile, type XCell } from './xlsx';
import { writeDocxFile, type DocSection } from './docx';
import { JE_COLUMNS, coverRows, type OutputCtx } from './close';
import { flagsText, jeBalanced, jeRowsOf, writeJeFile } from './subledger';

export function writeFixedAssetOutputs(ctx: OutputCtx, res: FauFaResult, extra: { levels: string[] }): { xlsxPath: string; docxPath: string; jePath: string | null } {
  const t = labeler(ctx.locale);
  const rtl = ctx.locale === 'ar';
  const banner = t(OUT.draft);
  const [nCover, nDep, nRoll, nDisp, nAdd, nJe, nGl, nEsc, nChecks] = planSheetNames([
    t(i18nKey('封面与签核页')), t(i18nKey('折旧核对表')), t(i18nKey('资产滚动表')), t(i18nKey('处置审核')), t(i18nKey('购置审核')), t(i18nKey('分录草稿')),
    t(i18nKey('与总账核对')), t(i18nKey('升级事项')), 'Checks',
  ]);
  const R0 = 2;
  const depRows: XCell[][] = res.lines.map((l, i) => {
    const r = R0 + i;
    return [
      l.assetNo, l.name, l.category, l.acquireDate, t(DEP_METHOD_LABEL[l.method]), l.lifeMonths || '', major(l.cost), major(l.salvage), major(l.impairment),
      major(l.expectedPeriod), major(l.bookedPeriod), l.bookedPeriod == null ? '' : { f: `ROUND(${addr(r, 10)}-${addr(r, 9)},2)`, v: major(l.diffPeriod) ?? 0 },
      major(l.expectedAccum), major(l.bookedAccum), l.bookedAccum == null ? '' : { f: `ROUND(${addr(r, 13)}-${addr(r, 12)},2)`, v: major(l.diffAccum) ?? 0 },
      major(l.nbv), l.formula, flagsText(l.flags, t), l.row,
    ];
  });
  const rollRows: XCell[][] = res.roll.map((r, i) => {
    const x = R0 + i;
    return [
      r.category, major(r.openingCost), major(r.additions), major(r.disposals), { f: `ROUND(${addr(x, 1)}+${addr(x, 2)}-${addr(x, 3)},2)`, v: major(r.closingCost) ?? 0 },
      major(r.openingAccum), major(r.depreciation), major(r.disposalAccum), { f: `ROUND(${addr(x, 5)}+${addr(x, 6)}-${addr(x, 7)},2)`, v: major(r.closingAccum) ?? 0 },
      major(r.bookedClosingAccum), major(r.nbv),
    ];
  });
  const dispRows: XCell[][] = res.disposals.map((d, i) => {
    const x = R0 + i;
    return [
      d.assetNo, d.name, d.date, d.type, major(d.cost), major(d.accum), major(d.impairment), { f: `ROUND(${addr(x, 4)}-${addr(x, 5)}-${addr(x, 6)},2)`, v: major(d.nbv) ?? 0 },
      major(d.proceeds), major(d.costs), { f: `ROUND(${addr(x, 8)}-${addr(x, 9)},2)`, v: major(d.net) ?? 0 }, { f: `ROUND(${addr(x, 10)}-${addr(x, 7)},2)`, v: major(d.gainLoss) ?? 0 },
      flagsText(d.flags, t), d.row,
    ];
  });
  const addRows: XCell[][] = res.additions.map((a) => [a.assetNo, a.name, a.date, major(a.amount), a.flags.length ? flagsText(a.flags, t) : t(i18nKey('符合资本化条件')), a.row]);
  const glRows: XCell[][] = (res.glTie || []).map((g) => [g.item === 'cost' ? t(i18nKey('原值')) : t(i18nKey('累计折旧')), major(g.register), major(g.gl), major(g.diff)]);
  const rollOk = res.roll.every((r) => r.openingCost + r.additions - r.disposals === r.closingCost && r.openingAccum + r.depreciation - r.disposalAccum === r.closingAccum);
  const title = t(i18nKey('折旧核对表与资产滚动表'));
  const xlsxPath = join(ctx.dir, outputFileName(ctx.moduleCode, title, ctx.period, 'xlsx', ctx.at));
  writeWorkbookFile(xlsxPath, [
    { name: nCover, banner, rows: coverRows(ctx, t, title, extra.levels) },
    {
      name: nDep, banner,
      headers: [t(i18nKey('资产编号')), t(i18nKey('资产名称')), t(i18nKey('资产类别')), t(i18nKey('开始使用日期')), t(i18nKey('折旧方法')), t(i18nKey('使用月数')), t(i18nKey('原值')), t(i18nKey('净残值')), t(i18nKey('减值准备')),
        t(i18nKey('本期应提（重算）')), t(i18nKey('本期账面')), t(i18nKey('本期差异')), t(i18nKey('累计折旧（重算）')), t(i18nKey('累计折旧（账面）')), t(i18nKey('累计差异')), t(i18nKey('账面净值')), t(i18nKey('算式')), t(i18nKey('提示')), t(OUT.row)],
      rows: depRows,
    },
    {
      name: nRoll, banner,
      headers: [t(i18nKey('资产类别')), t(i18nKey('期初原值')), t(i18nKey('本期新增')), t(i18nKey('本期处置')), t(i18nKey('期末原值')), t(i18nKey('期初累计折旧')), t(i18nKey('本期折旧')), t(i18nKey('处置转出折旧')), t(i18nKey('期末累计折旧')), t(i18nKey('账面期末累计折旧')), t(i18nKey('期末净值'))],
      rows: rollRows,
    },
    {
      name: nDisp, banner,
      headers: [t(i18nKey('资产编号')), t(i18nKey('资产名称')), t(i18nKey('处置日期')), t(i18nKey('处置方式')), t(i18nKey('原值')), t(i18nKey('累计折旧')), t(i18nKey('减值准备')), t(i18nKey('账面净值')), t(i18nKey('处置收入')), t(i18nKey('处置费用')), t(i18nKey('净收入')), t(i18nKey('处置损益')), t(i18nKey('提示')), t(OUT.row)],
      rows: dispRows,
    },
    { name: nAdd, banner, headers: [t(i18nKey('资产编号')), t(i18nKey('资产名称')), t(i18nKey('日期')), t(i18nKey('金额')), t(i18nKey('审核要点')), t(OUT.row)], rows: addRows },
    { name: nJe, banner, headers: JE_COLUMNS.map((k) => t(k)), rows: jeRowsOf(res.je, t) },
    { name: nGl, banner, headers: [t(i18nKey('项目')), t(i18nKey('资产台账')), t(i18nKey('总账')), t(OUT.diff)], rows: glRows.length ? glRows : [[t(i18nKey('没有提供科目余额表'))]] },
    { name: nEsc, banner, headers: [t(i18nKey('升级事项'))], rows: res.escalations.map((e) => [t(e.key, e.params)]) },
    {
      name: nChecks, banner, headers: [t(OUT.check), t(OUT.result)],
      rows: [
        [t(i18nKey('资产滚动表期初 + 增加 − 减少 = 期末')), rollOk],
        [t(i18nKey('处置分录借贷平衡')), jeBalanced(res.je)],
        ...(res.glTie ? [[t(i18nKey('资产台账与总账一致')), res.glTie.every((g) => g.diff === 0)] as XCell[]] : []),
      ],
    },
  ], { rtl });
  const jePath = writeJeFile(ctx, res.je);

  const sections: DocSection[] = [
    {
      heading: t(i18nKey('折旧核对')),
      paragraphs: [t(i18nKey('共 {n} 项资产，折旧与账面差异超过容差的 {m} 项。'), { n: res.lines.length, m: res.lines.filter((l) => l.flags.some((f) => f.code === 'asset.dep_diff' || f.code === 'asset.accum_diff')).length })],
      table: { headers: [t(i18nKey('资产编号')), t(i18nKey('资产名称')), t(i18nKey('提示'))], rows: res.lines.filter((l) => l.flags.length).map((l) => [l.assetNo, l.name, flagsText(l.flags, t)]) },
    },
    {
      heading: t(i18nKey('购置审核')),
      paragraphs: res.additions.length ? undefined : [t(i18nKey('无'))],
      table: res.additions.length ? { headers: [t(i18nKey('资产编号')), t(i18nKey('金额')), t(i18nKey('审核要点'))], rows: res.additions.map((a) => [a.assetNo, fmtAmount(a.amount, ctx.locale), a.flags.length ? flagsText(a.flags, t) : t(i18nKey('符合资本化条件'))]) } : undefined,
    },
    {
      heading: t(i18nKey('处置审核')),
      paragraphs: res.disposals.length ? undefined : [t(i18nKey('无'))],
      table: res.disposals.length ? { headers: [t(i18nKey('资产编号')), t(i18nKey('账面净值')), t(i18nKey('净收入')), t(i18nKey('处置损益'))], rows: res.disposals.map((d) => [d.assetNo, fmtAmount(d.nbv, ctx.locale), fmtAmount(d.net, ctx.locale), fmtAmount(d.gainLoss, ctx.locale)]) } : undefined,
    },
    { heading: t(i18nKey('升级事项')), paragraphs: res.escalations.length ? res.escalations.map((e) => `• ${t(e.key, e.params)}`) : [t(i18nKey('无'))] },
    { heading: t(i18nKey('发现与建议')), paragraphs: [t(i18nKey('折旧差异与处置分录为草稿，调整须按审批权限签核后在总账系统中由人录入；本文件不出具意见，也不过账。'))] },
  ];
  const dtitle = t(i18nKey('购置与处置审核意见'));
  const docxPath = join(ctx.dir, outputFileName(ctx.moduleCode, dtitle, ctx.period, 'docx', ctx.at));
  writeDocxFile(docxPath, { title: dtitle, subtitle: `${ctx.companyName} · ${ctx.period}`, meta: [[t(OUT.project), ctx.projectName], [t(OUT.standard), t(ctx.standardLabel)]], header: t(OUT.notOpinion), watermark: t(OUT.draft), rtl, sections });
  return { xlsxPath, docxPath, jePath };
}
