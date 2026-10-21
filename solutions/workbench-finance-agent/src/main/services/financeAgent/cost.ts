/**
 * 成本核算智能体（纯函数，制造业）：归集料工费 → 按分配标准分摊人工与制造费用 → 单品成本 →
 * 与上期比波动 → 按 BOM 单耗找异常损耗。
 *
 * 分摊按分计算，尾差放在最后一个产品上，保证分出去的合计等于归集总额。
 */
import { t as i18nT } from '@totalclaw/i18n';
import type {
  FaAllocBasis, FaCalcLine, FaCostMaterial, FaCostProduct, FaCostResultRow, FaCostRun, FaFinding,
} from '@totalclaw/ipc-contracts';
import { fmt, pct, round2, sum } from './common';

/** 按权重分摊，尾差给最后一个 */
export function allocate(total: number, weights: number[]): number[] {
  const w = sum(weights);
  if (!weights.length) return [];
  if (w <= 0) {
    const each = round2(total / weights.length);
    return weights.map((_, i) => (i === weights.length - 1 ? round2(total - each * (weights.length - 1)) : each));
  }
  const out = weights.map((x) => round2((total * x) / w));
  const diff = round2(total - sum(out));
  out[out.length - 1] = round2(out[out.length - 1] + diff);
  return out;
}

function basisLabel(b: FaAllocBasis): string {
  return { hours: i18nT('生产工时'), machine: i18nT('机器工时'), output: i18nT('产量'), material: i18nT('直接材料成本') }[b];
}

export interface CostInput {
  products: FaCostProduct[];
  materials: FaCostMaterial[];
  laborTotal: number;
  overheadItems: Array<{ item: string; amount: number }>;
  basis: FaAllocBasis;
  lossTolerance: number;
  prior?: FaCostRun | null;
}

export function computeCost(input: CostInput): Pick<FaCostRun, 'result' | 'losses' | 'calc'> {
  const { products } = input;
  const calc: FaCalcLine[] = [];
  const material = products.map((p) => sum(input.materials.filter((m) => m.product === p.name).map((m) => round2(m.qty * m.unitPrice))));
  const orphan = input.materials.filter((m) => !products.some((p) => p.name === m.product));

  const laborWeights = products.some((p) => p.hours > 0) ? products.map((p) => p.hours) : products.map((p) => p.output);
  const labor = allocate(input.laborTotal, laborWeights);
  const laborBase = sum(laborWeights);
  calc.push({
    label: i18nT('人工分配率'),
    formula: i18nT('直接人工 {a} ÷ {p0}合计 {b}', { a: fmt(input.laborTotal), p0: products.some((p) => p.hours > 0) ? basisLabel('hours') : basisLabel('output'), b: fmt(laborBase) }),
    value: laborBase ? round2((input.laborTotal / laborBase) * 10000) / 10000 : 0,
  });

  const overheadTotal = sum(input.overheadItems.map((o) => o.amount));
  const ohWeights = input.basis === 'hours' ? products.map((p) => p.hours)
    : input.basis === 'machine' ? products.map((p) => p.machineHours)
      : input.basis === 'material' ? material : products.map((p) => p.output);
  const overhead = allocate(overheadTotal, ohWeights);
  calc.push({ label: i18nT('制造费用合计'), formula: input.overheadItems.map((o) => `${o.item} ${fmt(o.amount)}`).join(' + ') || '0', value: overheadTotal });
  calc.push({
    label: i18nT('制造费用分配率'),
    formula: i18nT('{a} ÷ {p0}合计 {b}', { a: fmt(overheadTotal), p0: basisLabel(input.basis), b: fmt(sum(ohWeights)) }),
    value: sum(ohWeights) ? round2((overheadTotal / sum(ohWeights)) * 10000) / 10000 : 0,
  });

  const result: FaCostResultRow[] = products.map((p, i) => {
    const total = round2(material[i] + labor[i] + overhead[i]);
    const unitCost = p.output > 0 ? round2(total / p.output) : 0;
    const prev = input.prior?.result.find((r) => r.product === p.name);
    const priorUnitCost = prev ? prev.unitCost : null;
    return {
      product: p.name, output: p.output, material: material[i], labor: labor[i], overhead: overhead[i], total, unitCost,
      priorUnitCost, change: priorUnitCost ? round2(((unitCost - priorUnitCost) / priorUnitCost) * 10000) / 10000 : null,
    };
  });

  const losses: FaFinding[] = [];
  for (const m of input.materials) {
    const p = products.find((x) => x.name === m.product);
    if (!p || !m.stdPerUnit || !p.output) continue;
    const expected = round2(m.stdPerUnit * p.output);
    if (expected <= 0) continue;
    const over = round2(m.qty - expected);
    const rate = over / expected;
    if (rate > input.lossTolerance) {
      losses.push({
        code: 'loss', level: rate > input.lossTolerance * 3 ? 'high' : 'warn', refs: [m.product, m.material],
        title: i18nT('{p0} 的「{p1}」超耗 {r}', { p0: m.product, p1: m.material, r: pct(rate) }),
        detail: i18nT('标准用量 {a}（单耗 {s} × 产量 {o}），实际领用 {b}，多用 {c}，按单价折合 {d}', { a: fmt(expected), s: m.stdPerUnit, o: p.output, b: fmt(m.qty), c: fmt(over), d: fmt(round2(over * m.unitPrice)) }),
        suggestion: i18nT('核对领料单与退料、盘点差异；确属工艺损耗的更新 BOM 单耗，否则查明原因'),
      });
    }
  }
  for (const r of result) {
    if (r.change != null && Math.abs(r.change) >= 0.1) {
      losses.push({
        code: 'unit_cost_swing', level: Math.abs(r.change) >= 0.3 ? 'warn' : 'info', refs: [r.product],
        title: i18nT('{p0} 单位成本{p1} {r}', { p0: r.product, p1: r.change > 0 ? i18nT('上升') : i18nT('下降'), r: pct(Math.abs(r.change)) }),
        detail: i18nT('本期 {a}，上期 {b}', { a: fmt(r.unitCost), b: fmt(r.priorUnitCost || 0) }),
        suggestion: i18nT('拆开看料、工、费哪一块变了：材料价格、产量变化摊薄固定费用、工时效率'),
      });
    }
  }
  if (orphan.length) {
    losses.push({
      code: 'orphan_material', level: 'warn', refs: orphan.map((m) => m.product),
      title: i18nT('{n} 条领料记录的产品不在产量表里', { n: orphan.length }),
      detail: [...new Set(orphan.map((m) => m.product))].join(i18nT('、')),
      suggestion: i18nT('这部分材料没有计入任何产品成本，检查产品名称是否一致'),
    });
  }
  return { result, losses, calc };
}

export function costExportRows(run: Pick<FaCostRun, 'result'>): Record<string, string | number>[] {
  return run.result.map((r) => ({
    [i18nT('产品')]: r.product, [i18nT('完工数量')]: r.output, [i18nT('直接材料')]: r.material, [i18nT('直接人工')]: r.labor,
    [i18nT('制造费用')]: r.overhead, [i18nT('总成本')]: r.total, [i18nT('单位成本')]: r.unitCost,
    [i18nT('上期单位成本')]: r.priorUnitCost ?? '', [i18nT('变动')]: r.change != null ? pct(r.change) : '',
  }));
}
