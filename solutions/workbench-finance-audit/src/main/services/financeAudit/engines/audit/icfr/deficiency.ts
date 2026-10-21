/**
 * B1 缺陷分级矩阵（control-deficiency 第四步，纯函数）：财务影响（金额分档）× 运营影响 × 补偿性控制。
 *
 * 无补偿控制时的基础等级（源技能矩阵；源表空着的两格按就重不就轻补齐）：
 *              运营高        运营中        运营低
 *   金额高     重大缺陷      重要缺陷      重要缺陷
 *   金额中     重要缺陷      一般缺陷      一般缺陷
 *   金额低     一般缺陷      改进建议      改进建议
 * 补偿性控制「有效」降一级（最低到改进建议）；「部分有效 / 无」不降级。
 *
 * 等级名按《企业内部控制评价指引》：重大缺陷（≈ SOX material weakness）> 重要缺陷（significant deficiency）
 * > 一般缺陷（deficiency）> 改进建议（不构成缺陷）。
 */
import type { FauCompensating, FauDeficiencyGrade, FauImpactLevel } from '@totalclaw/ipc-contracts';

const ORDER: FauDeficiencyGrade[] = ['material_weakness', 'significant', 'deficiency', 'improvement'];

const BASE: Record<FauImpactLevel, Record<FauImpactLevel, FauDeficiencyGrade>> = {
  high: { high: 'material_weakness', medium: 'significant', low: 'significant' },
  medium: { high: 'significant', medium: 'deficiency', low: 'deficiency' },
  low: { high: 'deficiency', medium: 'improvement', low: 'improvement' },
};

/** 金额（分）→ 财务影响档：≥ 高下限为高，≥ 中下限为中，否则低 */
export function amountTier(amount: number, th: Record<string, number>): FauImpactLevel {
  const a = Math.abs(amount);
  if (a >= (th['deficiency.high.floor'] ?? 100_000_000)) return 'high';
  if (a >= (th['deficiency.medium.floor'] ?? 10_000_000)) return 'medium';
  return 'low';
}

export function gradeDeficiency(amount: FauImpactLevel, op: FauImpactLevel, comp: FauCompensating): FauDeficiencyGrade {
  const base = BASE[amount][op];
  if (comp !== 'effective') return base;
  return ORDER[Math.min(ORDER.indexOf(base) + 1, ORDER.length - 1)];
}

/** 重大 / 重要缺陷：升级，须批准人签核 */
export function isEscalated(g: FauDeficiencyGrade): boolean {
  return g === 'material_weakness' || g === 'significant';
}
