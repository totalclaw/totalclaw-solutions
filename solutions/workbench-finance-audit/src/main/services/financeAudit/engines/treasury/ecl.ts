/**
 * E5 预期信用损失（IFRS 9 / CAS 22，纯函数）：
 *   一般法：三阶段分类（逾期 30 / 90 天、评级下调 2 级、投资级降投机级、关注名单、已减值）→ ECL = EAD × PD × LGD × DF，
 *     一阶段 12 个月 PD、半年折现；二阶段存续期 PD、按剩余年数平均折现；三阶段 PD = 100%、不折现（LGD 已含回收现值）；
 *     三情景 PD 调整系数加权；阶段迁移矩阵（上期阶段来自表内列或上一期已归档运行）。
 *   简化法（应收）：按账龄分档 × 损失率 × 前瞻系数（Σ 权重 × PD 调整系数）的拨备矩阵，账龄表来自 A3 应收数据集。
 * 规则来源：finance-skills ifrs9-credit-risk（stage-classification / ecl-calculation / macro-forward-adjustment 与 ECL计算详解）。
 */
import type {
  FauEclBucket, FauEclLine, FauEclMatrixBucket, FauEclMigration, FauEclScenario, FauEclStage, FauEclStageSummary,
} from '@totalclaw/ipc-contracts';
import { FAU_ECL_BUCKETS } from '@totalclaw/ipc-contracts';
import type { CreditExposureRow, LossRateRow, MacroScenarioRow } from './types';
import type { OpenItemRow } from '../../subledgerTypes';
import { dueDateOf } from '../accounting/ar/engine';
import { daysBetween, sum } from './common';

type Th = Record<string, number>;

export const RATING_SCALE = ['AAA', 'AA', 'A', 'BBB', 'BB', 'B', 'CCC', 'CC', 'C', 'D'];
/** 内部评级 12 个月平均 PD（ECL计算详解 2.1） */
export const PD_BY_RATING = [0.0003, 0.0007, 0.002, 0.006, 0.02, 0.055, 0.14, 0.35, 0.75, 1];
const MOODYS: Record<string, string> = { AAA: 'AAA', AA: 'AA', A: 'A', BAA: 'BBB', BA: 'BB', B: 'B', CAA: 'CCC', CA: 'CC', C: 'C' };

/** 评级 → 档位下标（去掉 + / - 与穆迪的 1 / 2 / 3）；认不出返回 null */
export function ratingIndex(raw: string): number | null {
  const s = String(raw || '').trim().toUpperCase().replace(/[+\-\s]/g, '');
  if (!s) return null;
  if (RATING_SCALE.includes(s)) return RATING_SCALE.indexOf(s);
  const m = s.replace(/[123]$/, '');
  if (RATING_SCALE.includes(m)) return RATING_SCALE.indexOf(m);
  const moody = MOODYS[m];
  return moody ? RATING_SCALE.indexOf(moody) : null;
}

const IG_MAX = RATING_SCALE.indexOf('BBB');

export function classifyStage(e: CreditExposureRow, th: Th): { stage: FauEclStage; reasons: string[] } {
  const now = ratingIndex(e.ratingNow);
  const orig = ratingIndex(e.ratingOrig);
  const s3: string[] = [];
  if (e.dpd >= th['stage.dpdS3']) s3.push('dpd90');
  if (now === RATING_SCALE.length - 1) s3.push('default_rating');
  if (e.impaired) s3.push('impaired');
  if (s3.length) return { stage: 3, reasons: s3 };
  const s2: string[] = [];
  if (e.dpd >= th['stage.dpdS2']) s2.push('dpd30');
  if (now != null && orig != null && now - orig >= th['stage.downgradeNotches']) s2.push('downgrade');
  if (now != null && orig != null && orig <= IG_MAX && now > IG_MAX) s2.push('ig_to_sub');
  if (e.watchlist) s2.push('watchlist');
  return s2.length ? { stage: 2, reasons: s2 } : { stage: 1, reasons: [] };
}

/** 情景：上传了就用上传的，否则用阈值默认（乐观 25% × 0.75 / 基准 50% × 1 / 悲观 25% × 1.5） */
export function resolveScenarios(rows: MacroScenarioRow[], th: Th): FauEclScenario[] {
  if (rows.length) return rows.map((r) => ({ id: r.scenario, name: r.scenario, weight: r.weight, pdMultiplier: r.pdMultiplier }));
  return [
    { id: 'optimistic', name: 'optimistic', weight: th['scenario.optWeight'], pdMultiplier: th['scenario.optMult'] },
    { id: 'base', name: 'base', weight: th['scenario.baseWeight'], pdMultiplier: th['scenario.baseMult'] },
    { id: 'pessimistic', name: 'pessimistic', weight: th['scenario.pesWeight'], pdMultiplier: th['scenario.pesMult'] },
  ];
}

export const weightsOk = (s: FauEclScenario[]): boolean => Math.abs(sum(s.map((x) => x.weight)) - 1) < 1e-6;
export const forwardFactor = (s: FauEclScenario[]): number => sum(s.map((x) => x.weight * x.pdMultiplier));

/** 二阶段平均折现因子：Σ_{t=1..⌈T⌉} (1+EIR)^-t / ⌈T⌉ */
export function avgDf(eir: number, years: number): number {
  const n = Math.max(1, Math.ceil(years));
  let s = 0;
  for (let t = 1; t <= n; t += 1) s += (1 + eir) ** -t;
  return s / n;
}

export function eclGeneral(rows: CreditExposureRow[], scenarios: FauEclScenario[], th: Th, priorStages: Map<string, FauEclStage> = new Map()): {
  lines: FauEclLine[]; stages: FauEclStageSummary[]; migration: FauEclMigration[]; totalEad: number; totalEcl: number;
} {
  const lines: FauEclLine[] = rows.map((e, i) => {
    const id = e.id || `${e.counterparty}#${e.row}`;
    const { stage, reasons } = classifyStage(e, th);
    const ead = e.balance + Math.round(e.undrawn * (e.ccf ?? th['ecl.ccfDefault']));
    const lgd = e.lgd ?? th['ecl.lgdDefault'];
    const eir = e.eir ?? th['ecl.eirDefault'];
    const term = e.termYears ?? th['ecl.termDefault'];
    const ri = ratingIndex(e.ratingNow);
    const pd12 = e.pd12m ?? PD_BY_RATING[ri ?? IG_MAX];
    const pd = stage === 3 ? 1 : stage === 2 ? (e.pdLifetime ?? 1 - (1 - pd12) ** Math.max(1, term)) : pd12;
    const df = stage === 3 ? 1 : stage === 2 ? avgDf(eir, term) : (1 + eir) ** -0.5;
    const ecl: Record<string, number> = {};
    for (const s of scenarios) ecl[s.id] = Math.round(ead * (stage === 3 ? 1 : Math.min(1, pd * s.pdMultiplier)) * lgd * df);
    const weighted = Math.round(sum(scenarios.map((s) => s.weight * ecl[s.id])));
    const ps = e.priorStage && [1, 2, 3].includes(e.priorStage) ? e.priorStage as FauEclStage : priorStages.get(id) ?? null;
    return { id, row: e.row || i + 2, counterparty: e.counterparty, segment: e.segment, ead, stage, priorStage: ps, reasons, pd, lgd, df, ecl, weighted, coverage: ead ? weighted / ead : null };
  });
  const stages: FauEclStageSummary[] = ([1, 2, 3] as FauEclStage[]).map((stage) => {
    const ls = lines.filter((l) => l.stage === stage);
    const ead = sum(ls.map((l) => l.ead));
    const ecl = sum(ls.map((l) => l.weighted));
    return { stage, count: ls.length, ead, ecl, coverage: ead ? ecl / ead : null };
  });
  const mig = new Map<string, FauEclMigration>();
  for (const l of lines) {
    const from = (l.priorStage ?? 0) as FauEclMigration['from'];
    const k = `${from}>${l.stage}`;
    const m = mig.get(k) || { from, to: l.stage, count: 0, ead: 0 };
    m.count += 1;
    m.ead += l.ead;
    mig.set(k, m);
  }
  const migration = [...mig.values()].sort((a, b) => a.from - b.from || a.to - b.to);
  return { lines, stages, migration, totalEad: sum(lines.map((l) => l.ead)), totalEcl: sum(lines.map((l) => l.weighted)) };
}

export function agingBucket(dueOrDoc: string, asOf: string): FauEclBucket {
  if (!dueOrDoc) return 'current';
  const d = daysBetween(dueOrDoc, asOf);
  if (d <= 0) return 'current';
  if (d <= 30) return 'd30';
  if (d <= 60) return 'd60';
  if (d <= 90) return 'd90';
  if (d <= 180) return 'd180';
  if (d <= 365) return 'd365';
  return 'd365plus';
}

export function eclSimplified(ar: OpenItemRow[], asOf: string, uploaded: LossRateRow[], factor: number, th: Th): { matrix: FauEclMatrixBucket[]; totalEad: number; totalEcl: number } {
  const rateOf = (b: FauEclBucket) => uploaded.find((r) => r.bucket === b)?.rate ?? th[`matrix.${b}`];
  const matrix = FAU_ECL_BUCKETS.map((bucket) => {
    const rs = ar.filter((r) => r.open > 0 && agingBucket(dueDateOf(r, null), asOf) === bucket);
    const amount = sum(rs.map((r) => r.open));
    const rate = rateOf(bucket);
    return { bucket, amount, count: rs.length, rate, factor, ecl: Math.round(amount * Math.min(1, rate * factor)) };
  });
  return { matrix, totalEad: sum(matrix.map((m) => m.amount)), totalEcl: sum(matrix.map((m) => m.ecl)) };
}
