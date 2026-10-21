/**
 * A8 合并与内部往来产出：内部往来对账表 xlsx（封面与签核页 / 对账汇总 / 差异明细 / 抵销分录草稿 / 担保检查 / 内部定价偏离 / 升级事项 / Checks），
 * 抵销分录另出通用凭证导入格式草稿。Checks 断言抵销分录借贷平衡、每组本方 − 对方 = 差额。
 */
import { join } from 'node:path';
import { i18nKey } from '@totalclaw/i18n';
import type { FauIcResult } from '@totalclaw/ipc-contracts';
import { IC_CLASS_LABEL, IC_PAIR_LABEL } from '../../../../shared/financeAudit/accountingLabels';
import { CAUSE_LABEL } from './recon';
import { OUT, labeler, outputFileName } from './common';
import { addr, major, planSheetNames, writeWorkbookFile, type XCell } from './xlsx';
import { JE_COLUMNS, coverRows, type OutputCtx } from './close';
import { flagsText, jeBalanced, jeRowsOf, writeJeFile } from './subledger';

export function writeIntercompanyOutputs(ctx: OutputCtx, res: FauIcResult, extra: { levels: string[] }): { xlsxPath: string; jePath: string | null } {
  const t = labeler(ctx.locale);
  const rtl = ctx.locale === 'ar';
  const banner = t(OUT.draft);
  const [nCover, nPairs, nBreaks, nJe, nGua, nTp, nEsc, nChecks] = planSheetNames([
    t(i18nKey('封面与签核页')), t(i18nKey('对账汇总')), t(i18nKey('差异明细')), t(i18nKey('抵销分录草稿')), t(i18nKey('担保检查')), t(i18nKey('内部定价偏离')), t(i18nKey('升级事项')), 'Checks',
  ]);
  const R0 = 2;
  const pairRows: XCell[][] = res.pairs.map((p, i) => {
    const r = R0 + i;
    return [t(IC_PAIR_LABEL[p.pair]), p.entity, p.counterparty, major(p.own), major(p.other), { f: `ROUND(${addr(r, 3)}-${addr(r, 4)},2)`, v: major(p.diff) ?? 0 }, p.matched, p.breaks, major(p.eliminated)];
  });
  const breakRows: XCell[][] = res.breaks.map((b) => [
    t(IC_PAIR_LABEL[b.pair]), b.entity, b.counterparty, b.key, t(IC_CLASS_LABEL[b.cls]), major(b.own), major(b.other), major(b.diff),
    b.causes.map((c) => t(CAUSE_LABEL[c] || c)).join('; '), b.ownRows.join(','), b.otherRows.join(','),
  ]);
  const guaRows: XCell[][] = (res.guarantees || []).map((g) => [g.guarantor, g.beneficiary, major(g.amount), g.endDate, g.status, major(g.netAssets), g.ratio == null ? '' : Math.round(g.ratio * 10000) / 10000, flagsText(g.flags, t), g.row]);
  const tpRows: XCell[][] = (res.pricing || []).map((p) => [p.entity, p.counterparty, p.type, major(p.amount), p.internalPrice, p.marketPrice, Math.round(p.deviation * 10000) / 10000, p.flagged ? t(i18nKey('偏离，转转让定价')) : t(i18nKey('在范围内')), p.row]);
  const title = t(i18nKey('内部往来对账表与抵销分录草稿'));
  const xlsxPath = join(ctx.dir, outputFileName(ctx.moduleCode, title, ctx.period, 'xlsx', ctx.at));
  writeWorkbookFile(xlsxPath, [
    { name: nCover, banner, rows: [...coverRows(ctx, t, title, extra.levels), [], [t(i18nKey('抵销分录不含存货中的未实现内部利润，需按毛利率与期末结存另行计算'))]] },
    {
      name: nPairs, banner,
      headers: [t(i18nKey('配对类别')), t(i18nKey('本方公司')), t(i18nKey('对方公司')), t(i18nKey('本方金额')), t(i18nKey('对方金额')), t(OUT.diff), t(i18nKey('相符')), t(i18nKey('差异')), t(i18nKey('抵销金额'))],
      rows: pairRows,
    },
    {
      name: nBreaks, banner,
      headers: [t(i18nKey('配对类别')), t(i18nKey('本方公司')), t(i18nKey('对方公司')), t(i18nKey('对账键')), t(i18nKey('分类')), t(i18nKey('本方金额')), t(i18nKey('对方金额')), t(OUT.diff), t(i18nKey('可能成因')), t(i18nKey('本方行号')), t(i18nKey('对方行号'))],
      rows: breakRows,
    },
    { name: nJe, banner, headers: JE_COLUMNS.map((k) => t(k)), rows: jeRowsOf(res.je, t) },
    {
      name: nGua, banner,
      headers: [t(i18nKey('担保方')), t(i18nKey('被担保方')), t(i18nKey('担保金额')), t(i18nKey('到期日')), t(i18nKey('状态')), t(i18nKey('担保方净资产')), t(i18nKey('担保余额 / 净资产')), t(i18nKey('提示')), t(OUT.row)],
      rows: res.guarantees ? guaRows : [[t(i18nKey('没有提供担保台账'))]],
    },
    {
      name: nTp, banner,
      headers: [t(i18nKey('本方公司')), t(i18nKey('对方公司')), t(i18nKey('往来类型 / 科目')), t(i18nKey('金额')), t(i18nKey('内部价格')), t(i18nKey('市场价格')), t(i18nKey('偏离率')), t(i18nKey('结论')), t(OUT.row)],
      rows: res.pricing ? tpRows : [[t(i18nKey('没有内部价格与市场价格'))]],
    },
    { name: nEsc, banner, headers: [t(i18nKey('升级事项'))], rows: res.escalations.map((e) => [t(e.key, e.params)]) },
    {
      name: nChecks, banner, headers: [t(OUT.check), t(OUT.result)],
      rows: [
        [t(i18nKey('抵销分录借贷平衡')), res.balanced && jeBalanced(res.je)],
        [t(i18nKey('每组本方 − 对方 = 差额')), res.pairs.every((p) => p.own - p.other === p.diff)],
      ],
    },
  ], { rtl });
  return { xlsxPath, jePath: writeJeFile(ctx, res.je) };
}
