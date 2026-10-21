/** 批次 5（fpa）阈值的界面名称（三语，走词典）。 */
import { i18nKey } from '@totalclaw/i18n';

const ALERT_LABELS = (m: string): Record<string, string> => ({
  [`${m}.alert.debtRatioWarnRatio`]: i18nKey('资产负债率黄色预警线'),
  [`${m}.alert.debtRatioRedRatio`]: i18nKey('资产负债率红色升级线'),
  [`${m}.alert.currentRatioWarnRatio`]: i18nKey('流动比率黄色预警线'),
  [`${m}.alert.currentRatioRedRatio`]: i18nKey('流动比率红色升级线'),
  [`${m}.alert.grossMarginDropPts`]: i18nKey('毛利率下降预警（百分点）'),
  [`${m}.alert.revenueDropPct`]: i18nKey('收入比上期下降预警比例'),
  [`${m}.alert.revenueShortPct`]: i18nKey('收入低于预算升级比例'),
});

export const FPA_THRESHOLD_LABELS: Record<string, string> = {
  ...ALERT_LABELS('mgmt-report'),
  ...ALERT_LABELS('fin-analysis'),
  'kpi.level.greenMinRatio': i18nKey('KPI 绿灯达成率下限'),
  'kpi.level.yellowMinRatio': i18nKey('KPI 黄灯达成率下限'),
  'kpi.escalate.consecutiveMisses': i18nKey('KPI 连续未达标升级月数'),
  'budget.usage.warnRatio': i18nKey('预算执行率预警线'),
  'budget.band.lowRatio': i18nKey('执行率过低分档线'),
  'budget.band.slowRatio': i18nKey('执行率偏慢分档线'),
  'budget.band.nearRatio': i18nKey('执行率接近上限分档线'),
  'budget.overrun.tier1Pct': i18nKey('超预算第 1 档上限'),
  'budget.overrun.tier2Pct': i18nKey('超预算第 2 档上限'),
  'budget.overrun.tier3Pct': i18nKey('超预算第 3 档上限'),
  'budget.escalate.itemOverPct': i18nKey('单项超预算升级比例'),
  'budget.escalate.revenueShortPct': i18nKey('收入低于预算升级比例'),
  'budget.adjust.largePct': i18nKey('预算调整幅度过大比例'),
  'cost.variance.flagPct': i18nKey('成本差异重点说明比例'),
  'cost.ratio.riseFlagPts': i18nKey('费用率上升标注（百分点）'),
  'insight.trend.minPeriods': i18nKey('趋势判断最少期数'),
  'insight.anomaly.zScore': i18nKey('异常点标准差倍数'),
  'insight.season.minPeriods': i18nKey('季节性指数最少月数'),
  'esg.yoy.flagPct': i18nKey('ESG 指标同比变化核实比例'),
  'esg.materiality.minScore': i18nKey('重大议题评分门槛'),
  'strategy.deviation.moderatePct': i18nKey('战略目标中度偏差比例'),
  'strategy.deviation.severePct': i18nKey('战略目标重度偏差比例'),
  'strategy.risk.highScore': i18nKey('高风险评分下限'),
  'strategy.risk.mediumScore': i18nKey('中风险评分下限'),
};
