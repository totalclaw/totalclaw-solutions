/**
 * A7 薪酬核算产出：
 *   薪资复核表 xlsx：封面与签核页 / 汇总 / 员工复核 / 个税复核（中国）或 GOSI 与期末服务金（沙特）/ 增减员 / 计提分录草稿 / 升级事项 / Checks；
 *   计提分录另出通用凭证导入格式草稿。姓名、部门是用户数据，原样保留。
 */
import { join } from 'node:path';
import { i18nKey } from '@totalclaw/i18n';
import type { FauPayrollResult } from '@totalclaw/ipc-contracts';
import { BASE_FLAG_LABEL, PAYROLL_REGIME_LABEL } from '../../../../shared/financeAudit/accountingLabels';
import { OUT, labeler, outputFileName } from './common';
import { addr, major, planSheetNames, writeWorkbookFile, type XCell } from './xlsx';
import { JE_COLUMNS, coverRows, type OutputCtx } from './close';
import { flagsText, jeBalanced, jeRowsOf, writeJeFile } from './subledger';

export function writePayrollOutputs(ctx: OutputCtx, res: FauPayrollResult, extra: { levels: string[] }): { xlsxPath: string; jePath: string | null } {
  const t = labeler(ctx.locale);
  const rtl = ctx.locale === 'ar';
  const banner = t(OUT.draft);
  const sa = res.regime === 'sa';
  const [nCover, nSum, nEmp, nTax, nChg, nJe, nEsc, nChecks] = planSheetNames([
    t(i18nKey('封面与签核页')), t(i18nKey('汇总')), t(i18nKey('员工复核')), sa ? t(i18nKey('GOSI 与期末服务金')) : t(i18nKey('个税复核')),
    t(i18nKey('增减员')), t(i18nKey('计提分录草稿')), t(i18nKey('升级事项')), 'Checks',
  ]);
  const R0 = 2;
  const empRows: XCell[][] = res.lines.map((l, i) => {
    const r = R0 + i;
    return [
      l.empId, l.name, l.dept, major(l.computedGross), major(l.gross), major(l.base), t(BASE_FLAG_LABEL[l.baseFlag]), major(l.personal), major(l.personalExpected),
      major(l.iitWithheld), major(l.iitExpected), major(l.net), { f: `ROUND(${addr(r, 4)}-IF(${addr(r, 7)}="",${addr(r, 8)},${addr(r, 7)})-IF(${addr(r, 9)}="",N(${addr(r, 10)}),${addr(r, 9)})-${addr(r, 15)},2)`, v: major(l.netExpected) ?? 0 },
      major(l.employer), flagsText(l.flags, t), major(l.gross - (l.personal ?? l.personalExpected ?? 0) - (l.iitWithheld ?? l.iitExpected ?? 0) - l.netExpected), l.row,
    ];
  });
  const taxRows: XCell[][] = sa
    ? res.lines.map((l) => [l.empId, l.name, major(l.base), major(l.personalExpected), major(l.personal), major(l.employer), l.eosb?.years ?? '', major(l.eosb?.wage), major(l.eosb?.liability), major(l.eosb?.booked), major(l.eosb?.diff), l.eosb?.formula || ''])
    : res.lines.map((l) => [l.empId, l.name, major(l.gross), major(l.personal ?? l.personalExpected), major(l.iitDetail?.taxableYtd), l.iitDetail?.rate ?? '', major(l.iitDetail?.quickDeduction), major(l.iitExpected), major(l.iitWithheld), l.iitWithheld == null || l.iitExpected == null ? '' : major(l.iitWithheld - l.iitExpected)]);
  const taxHeaders = sa
    ? [t(i18nKey('员工编号')), t(i18nKey('姓名')), t(i18nKey('GOSI 缴费工资')), t(i18nKey('GOSI 个人应扣')), t(i18nKey('GOSI 个人实扣')), t(i18nKey('单位负担')), t(i18nKey('服务年限')), t(i18nKey('期末服务金工资')), t(i18nKey('期末服务金（重算）')), t(i18nKey('期末服务金（账面）')), t(OUT.diff), t(i18nKey('算式'))]
    : [t(i18nKey('员工编号')), t(i18nKey('姓名')), t(i18nKey('本月应发')), t(i18nKey('本月个人社保公积金')), t(i18nKey('累计应纳税所得额')), t(i18nKey('税率')), t(i18nKey('速算扣除数')), t(i18nKey('本月应扣个税')), t(i18nKey('本月实扣个税')), t(OUT.diff)];
  const chgRows: XCell[][] = (res.changes || []).map((c) => [c.kind === 'hire' ? t(i18nKey('新增')) : t(i18nKey('减员')), c.empId, c.name, c.date, flagsText(c.flags, t)]);
  const tt = res.totals;
  const title = t(i18nKey('薪资复核表'));
  const xlsxPath = join(ctx.dir, outputFileName(ctx.moduleCode, title, ctx.period, 'xlsx', ctx.at));
  writeWorkbookFile(xlsxPath, [
    { name: nCover, banner, rows: [...coverRows(ctx, t, title, extra.levels), [], [t(i18nKey('口径')), t(PAYROLL_REGIME_LABEL[res.regime])], ...(sa ? [[t(i18nKey('沙特 GOSI 比例与期末服务金口径为草稿口径，待当地专业人员审核'))]] : [])] },
    {
      name: nSum, banner, headers: [t(i18nKey('项目')), t(i18nKey('金额'))],
      rows: [
        [t(i18nKey('人数')), tt.headcount], [t(i18nKey('应发合计')), major(tt.gross)], [t(sa ? i18nKey('GOSI 个人部分') : i18nKey('个人社保公积金')), major(tt.personal)],
        [t(i18nKey('个税')), major(tt.iit)], [t(i18nKey('实发合计')), major(tt.net)], [t(i18nKey('单位负担')), major(tt.employer)],
        ...(sa ? [[t(i18nKey('期末服务金本期计提')), major(tt.eosbAccrual)]] : []),
      ],
    },
    {
      name: nEmp, banner,
      headers: [t(i18nKey('员工编号')), t(i18nKey('姓名')), t(i18nKey('部门')), t(i18nKey('应发明细合计')), t(i18nKey('应发合计')), t(i18nKey('缴费基数')), t(i18nKey('基数核对')),
        t(i18nKey('个人扣款（实扣）')), t(i18nKey('个人扣款（应扣）')), t(i18nKey('个税实扣')), t(i18nKey('个税应扣')), t(i18nKey('实发合计')), t(i18nKey('实发（重算）')), t(i18nKey('单位负担')), t(i18nKey('提示')), t(i18nKey('其他扣款')), t(OUT.row)],
      rows: empRows,
    },
    { name: nTax, banner, headers: taxHeaders, rows: taxRows },
    { name: nChg, banner, headers: [t(i18nKey('类型')), t(i18nKey('员工编号')), t(i18nKey('姓名')), t(i18nKey('日期')), t(i18nKey('提示'))], rows: res.changes ? chgRows : [[t(i18nKey('没有提供上期工资表'))]] },
    { name: nJe, banner, headers: JE_COLUMNS.map((k) => t(k)), rows: jeRowsOf(res.je, t) },
    { name: nEsc, banner, headers: [t(i18nKey('升级事项'))], rows: res.escalations.map((e) => [t(e.key, e.params)]) },
    {
      name: nChecks, banner, headers: [t(OUT.check), t(OUT.result)],
      rows: [
        [t(i18nKey('计提分录借贷平衡')), jeBalanced(res.je)],
        [t(i18nKey('每人实发与重算一致')), res.lines.every((l) => !l.flags.some((f) => f.code === 'pay.net_mismatch'))],
      ],
    },
  ], { rtl });
  return { xlsxPath, jePath: writeJeFile(ctx, res.je) };
}
