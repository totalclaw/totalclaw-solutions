/**
 * D9 战略规划的规则部分（纯函数）：
 *   执行偏差：目标达成率 − 1（复用 KPI 的方向与达成率口径），按 thresholds/strategy.json 分 正常 / 中度 / 重度；
 *   风险评分：可能性 × 影响（各 1–5，模型给枚举值），分高 / 中 / 低。
 */
import { i18nKey } from '@totalclaw/i18n';
import type { FauFpaLevel } from '@totalclaw/ipc-contracts';
import type { KpiEval } from './kpi';

export type DeviationLevel = 'on_track' | 'moderate' | 'severe' | 'no_target';
export const DEVIATION_LABELS: Record<DeviationLevel, string> = {
  on_track: i18nKey('正常推进'), moderate: i18nKey('中度偏差'), severe: i18nKey('重度偏差'), no_target: i18nKey('没有目标值'),
};
export const DEVIATION_LEVEL: Record<DeviationLevel, FauFpaLevel | null> = { on_track: 'green', moderate: 'yellow', severe: 'red', no_target: null };

export function deviationOf(e: Pick<KpiEval, 'achievement'>, th: Record<string, number>): { deviation: number | null; level: DeviationLevel } {
  if (e.achievement == null) return { deviation: null, level: 'no_target' };
  const d = e.achievement - 1;
  if (d >= -(th['deviation.moderatePct'] ?? 0.1)) return { deviation: d, level: 'on_track' };
  if (d >= -(th['deviation.severePct'] ?? 0.2)) return { deviation: d, level: 'moderate' };
  return { deviation: d, level: 'severe' };
}

export type RiskLevel = 'high' | 'medium' | 'low';
export const RISK_LEVEL: Record<RiskLevel, FauFpaLevel> = { high: 'red', medium: 'yellow', low: 'green' };

export function riskScore(likelihood: number, impact: number, th: Record<string, number>): { score: number; level: RiskLevel } {
  const l = Math.min(5, Math.max(1, Math.round(likelihood)));
  const i = Math.min(5, Math.max(1, Math.round(impact)));
  const score = l * i;
  return { score, level: score >= (th['risk.highScore'] ?? 15) ? 'high' : score >= (th['risk.mediumScore'] ?? 8) ? 'medium' : 'low' };
}
