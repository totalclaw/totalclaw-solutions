/**
 * 阈值的界面名称（三语，走词典）。JSON 里的 label 是原文说明（中文，界面标「以原文为准」）。
 */
import { i18nKey } from '@totalclaw/i18n';
import { FPA_THRESHOLD_LABELS } from './fpaLabels';
import { TAX_THRESHOLD_LABELS } from './taxLabels';
import { ACCOUNTING2_THRESHOLDS } from './accountingLabels';
import { AUDIT_THRESHOLD_LABELS } from '../engines/audit/thresholdLabels';
import { TREASURY_THRESHOLD_LABELS } from '../engines/treasury/thresholds';

export const THRESHOLD_LABELS: Record<string, string> = {
  'close.trial.ignoreMax': i18nKey('试算借贷差异：可忽略上限'),
  'close.trial.locateMax': i18nKey('试算借贷差异：定位来源上限'),
  'close.trial.stopMax': i18nKey('试算借贷差异：停止结账上限（超过则通知财务经理）'),
  'close.tie.tolerance': i18nKey('报表勾稽与期初衔接容差'),
  'close.checklist.maxFail': i18nKey('关账清单不通过项上限'),
  'close.checklist.maxWarn': i18nKey('关账清单提醒项上限'),
  'close.cross.amountTier1': i18nKey('跨期金额第 1 档上限'),
  'close.cross.amountTier2': i18nKey('跨期金额第 2 档上限（以上必须本期调整）'),
  'close.cross.amountTier3': i18nKey('跨期金额第 3 档上限（以上须批准人确认）'),
  'close.cross.dayTier1': i18nKey('跨期天数第 1 档上限（天）'),
  'close.cross.dayTier2': i18nKey('跨期天数第 2 档上限（天）'),
  'close.cross.dayTier3': i18nKey('跨期天数第 3 档上限（天）'),
  'close.flux.pct': i18nKey('波动说明百分比阈值'),
  'close.flux.floor': i18nKey('波动说明金额下限'),
  'close.flux.topN': i18nKey('每行交给模型的驱动分录条数'),
  'recon.bank.dateWindowDays': i18nKey('银企对账日期窗口（± 天）'),
  'recon.bank.maxGroup': i18nKey('一对多匹配最多笔数'),
  'recon.bank.amountTol': i18nKey('银企对账金额容差'),
  'recon.bank.smallItemMax': i18nKey('小额未达账项上限'),
  'recon.bank.unexplainedEscalate': i18nKey('差异查不明升级门槛'),
  'recon.bank.unknownDeductionEscalate': i18nKey('不明扣款升级门槛'),
  'recon.bank.bookOutAgingWorkdays': i18nKey('企业已付银行未付升级工作日数'),
  'recon.bank.sameDirectionMonths': i18nKey('连续同方向未达升级月数'),
  'recon.glsub.amountTol': i18nKey('总账与子账金额容差'),
  'recon.glsub.qtyTol': i18nKey('总账与子账数量容差'),
  'recon.glsub.majorDiff': i18nKey('重大差异门槛'),
  'recon.glsub.feeMaxDiff': i18nKey('按费用 / 计提成因假设的小额差异上限'),
  ...FPA_THRESHOLD_LABELS,
  // 批次 4：税务组
  ...TAX_THRESHOLD_LABELS,
  // 批次 2：A3–A8
  ...Object.fromEntries(Object.entries(ACCOUNTING2_THRESHOLDS).map(([k, v]) => [k, v.label])),
  ...AUDIT_THRESHOLD_LABELS,
  // 批次 7：F1 估值
  'valuation.dcf.terminalShareHigh': i18nKey('终值占企业价值黄旗线'),
  'valuation.dcf.terminalShareLow': i18nKey('终值占企业价值偏保守提示线'),
  // 批次 6：资金与金融风险
  ...TREASURY_THRESHOLD_LABELS,
};

/**
 * 比例类阈值（以小数存，界面按百分比显示与输入）：看原文说明——写了 %、「小数」、比例 / 占比 / 比率 / 各种「率」/ 权重的 0 ~ 2 之间的值。
 * 排除原文写明不是百分比的：流动 / 速动比率、倍数、0–1 相似度、「每年几个月」。只看键名会把系数（× 0.9）当百分比、把 LCR 100% 当 1。
 */
export function isPercentThreshold(key: string, value: number, label: string): boolean {
  if (isAmountThreshold(key) || !(value >= 0 && value <= 2)) return false;
  return /%|％|小数|百分比|百分点|比例|占比|比率|使用率|执行率|达成率|费率|税率|利率|收益率|折算率|损失率|权重/.test(label) && !/流动比率|速动比率|倍数|0–1|个月/.test(label);
}

/** 金额类阈值（以分存，界面按主单位显示） */
export function isAmountThreshold(key: string): boolean {
  if (ACCOUNTING2_THRESHOLDS[key]) return ACCOUNTING2_THRESHOLDS[key].amount;
  return /(Max|Tol|tolerance|Tier[123]$|floor|Escalate|Diff)$/.test(key) && !/dayTier|qtyTol|maxFail|maxWarn|maxGroup/.test(key);
}
