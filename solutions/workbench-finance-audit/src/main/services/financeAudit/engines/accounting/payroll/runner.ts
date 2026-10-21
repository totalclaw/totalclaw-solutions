/**
 * A7 薪酬核算 runner：③ 校验 → ④ 按模式（中国 / 沙特 / 国际）复核应发、扣款、个税或 GOSI、期末服务金、增减员 → ⑤ 薪资复核表 xlsx + 计提分录导入草稿。
 * 沙特与期末服务金的比例是劳动法 / GOSI 参数，草稿口径，待当地专业人员审核（第 13.4 节）。
 */
import { i18nKey } from '@totalclaw/i18n';
import type { FauPayrollRegime, FauPayrollResult, FauReminder, FauSubProgress, FauValidationReport } from '@totalclaw/ipc-contracts';
import type { AnalyzeResult, ModuleRunner, RunCtx } from '../../../runner';
import { writePayrollOutputs } from '../../../outputs/payroll';
import { msg } from '../common';
import { periodOf } from '../closeRunner';
import { IssueList, artifactOf, duplicateRows, outputCtxOf } from '../subledgerCommon';
import { payrollReview } from './engine';

const SUB_LABEL: Record<string, string> = {
  gross: i18nKey('应发与实发勾稽'), social: i18nKey('社保公积金基数与扣款'), iit: i18nKey('个税累计预扣'), gosi: i18nKey('GOSI 缴费核对'),
  eosb: i18nKey('期末服务金'), changes: i18nKey('增减员'), je: i18nKey('计提分录草稿'),
};
const SUBS: Record<FauPayrollRegime, string[]> = { cn: ['gross', 'social', 'iit', 'changes', 'je'], sa: ['gross', 'gosi', 'eosb', 'changes', 'je'], intl: ['gross', 'social', 'changes', 'je'] };
const regimeOf = (modeId: string): FauPayrollRegime => (modeId === 'sa' || modeId === 'intl' ? modeId : 'cn');

export const payrollRunner: ModuleRunner = {
  subSteps: (modeId) => SUBS[regimeOf(modeId)].map((id): FauSubProgress => ({ id, label: { key: SUB_LABEL[id] }, status: 'todo' })),

  async validate(ctx: RunCtx): Promise<FauValidationReport> {
    const rows = ctx.rows<'payroll'>('payroll');
    const regime = regimeOf(ctx.run.modeId);
    const v = new IssueList();
    if (!rows.length) v.add('block', 'pay_empty', i18nKey('工资表没有数据行'));
    const dup = duplicateRows(rows, (r) => r.empId);
    if (dup.length) v.add('block', 'pay_duplicate', i18nKey('{n} 行员工编号重复'), { n: dup.length }, dup);
    if (regime === 'cn') {
      const noYtd = rows.filter((r) => !r.ytdIncome && monthNo(ctx) > 1 && !(r.hireDate && r.hireDate.slice(0, 7) === periodOf(ctx)));
      if (noYtd.length) v.add('warn', 'pay_no_ytd', i18nKey('{n} 人没有本年累计收入：累计预扣法按本月是全年第一笔收入计算，结果会偏小'), { n: noYtd.length }, noYtd.map((r) => r.row));
      if (!(ctx.th('payroll')['cn.baseLower'] || ctx.th('payroll')['cn.baseUpper'])) v.add('warn', 'pay_no_limits', i18nKey('没有设置社保缴费基数上下限：基数只核对扣款，不判是否超限（在首次配置的阈值里按当地设置）'));
      if (!ctx.th('payroll')['cn.erOther']) v.add('warn', 'pay_no_er_other', i18nKey('没有设置单位医疗、工伤、生育比例：单位负担只含养老、失业与公积金'));
    }
    if (regime === 'sa') {
      const noBasic = rows.filter((r) => r.basic == null);
      if (noBasic.length) v.add('warn', 'pay_no_basic', i18nKey('{n} 人没有基本工资列：GOSI 缴费工资与期末服务金按应发合计计算'), { n: noBasic.length }, noBasic.map((r) => r.row));
      const noStart = rows.filter((r) => !r.serviceStart && !r.hireDate);
      if (noStart.length) v.add('warn', 'pay_no_start', i18nKey('{n} 人没有服务起始日或入职日期：算不了期末服务金'), { n: noStart.length }, noStart.map((r) => r.row));
      v.add('warn', 'pay_sa_draft', i18nKey('沙特 GOSI 比例与期末服务金口径为草稿口径，待当地专业人员审核'));
    }
    if (regime === 'intl' && !(ctx.th('payroll')['intl.eeRate'] || ctx.th('payroll')['intl.erRate'])) v.add('warn', 'pay_no_rates', i18nKey('没有设置国际社保比例：只核对应发与实发勾稽'));
    v.check('pay_rows', rows.length > 0, 'block', msg(i18nKey('工资表有数据')));
    v.check('pay_unique', !dup.length, 'block', msg(i18nKey('员工编号不重复')));
    return v.report(ctx, ['payroll', 'payrollPrior']);
  },

  async analyze(ctx: RunCtx): Promise<AnalyzeResult> {
    const regime = regimeOf(ctx.run.modeId);
    const steps = SUBS[regime];
    for (const id of steps) ctx.progress(id, 'running');
    const res = payrollReview({
      regime, period: periodOf(ctx), rows: ctx.rows<'payroll'>('payroll'), prior: ctx.run.inputs.payrollPrior?.length ? ctx.rows<'payroll'>('payrollPrior') : null,
      cnCodes: ctx.profile.reportBasis === 'cn', th: ctx.th('payroll'),
    });
    for (const id of steps) ctx.progress(id, 'done');
    const reminders: FauReminder[] = res.escalations.map((e, i) => ({ id: `esc:pay:${i}`, source: 'escalation', level: 'warn', message: e }));
    const issues = res.lines.filter((l) => l.flags.some((f) => f.level !== 'info')).length;
    if (issues) reminders.push({ id: 'pay:issues', source: 'engine', level: 'warn', message: { key: i18nKey('{n} 人的薪资复核有差异，补发 / 退还须按审批权限处理'), params: { n: issues } } });
    return {
      result: res, reminders, approveRequired: res.escalations.length > 0,
      summary: { key: i18nKey('{n} 人，应发 {p0}，有差异 {m} 人'), params: { n: res.totals.headcount, p0: (res.totals.gross / 100).toFixed(2), m: issues } },
    };
  },

  async draft(ctx: RunCtx) {
    const out = writePayrollOutputs(outputCtxOf(ctx), ctx.run.result as FauPayrollResult, { levels: ctx.run.requiredLevels });
    const artifacts = [artifactOf(ctx, 'xlsx', out.xlsxPath, i18nKey('薪资复核表'))];
    if (out.jePath) artifacts.push(artifactOf(ctx, 'je_import_xlsx', out.jePath, i18nKey('凭证导入草稿')));
    return { artifacts, summary: { key: i18nKey('已生成 {n} 个文件（草稿—待签核）'), params: { n: artifacts.length } } };
  },
};

function monthNo(ctx: RunCtx): number {
  return Number(periodOf(ctx).slice(5, 7)) || 1;
}
