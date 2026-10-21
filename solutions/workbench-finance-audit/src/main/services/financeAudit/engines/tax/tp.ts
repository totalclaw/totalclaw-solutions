/**
 * 转让定价（纯函数）：利润水平指标、四分位区间、受测方落点与调整额、关联交易汇总、三层文档（主体 / 本地 / 国别报告）要求。
 *
 *   完全成本加成率（ncp）= 营业利润 / 总成本；营业利润率（om）= 营业利润 / 营业收入；
 *   四分位按 Excel QUARTILE.INC 口径（位置 (n − 1) × p 线性插值），产出 xlsx 里用同一个函数写公式，打开即可复核；
 *   受测方低于下四分位：按中位值调整（中国规定原则上不低于中位值；其它地区同样以中位值为默认调整点，待当地复核）。
 * 文档门槛只来自规则表（cn.tp_* / sa.tp_* / ae.tp_*）；国际口径按参数。
 */
import { i18nKey } from '@totalclaw/i18n';
import type { FauRegion, FauRptType, FauTaxFinding, FauTpComparable, FauTpDoc, FauTpPli, FauTpRange } from '@totalclaw/ipc-contracts';
import type { ComparableRow, RptRow } from '../../intake/tax';
import type { RuleBook } from './common';

/** QUARTILE.INC：sorted 已升序，p ∈ [0, 1] */
export function quartileInc(sorted: number[], p: number): number {
  if (!sorted.length) return NaN;
  const pos = (sorted.length - 1) * p;
  const lo = Math.floor(pos);
  const hi = Math.min(lo + 1, sorted.length - 1);
  return sorted[lo] + (pos - lo) * (sorted[hi] - sorted[lo]);
}

export function pliOf(c: { revenue: number | null; operatingProfit: number | null; totalCost: number | null; pli?: number | null }, kind: FauTpPli): number | null {
  if (c.pli != null && Number.isFinite(c.pli)) return c.pli;
  if (c.operatingProfit == null) return null;
  const denom = kind === 'ncp' ? c.totalCost : c.revenue;
  return denom ? c.operatingProfit / denom : null;
}

export function tpRange(rows: ComparableRow[], kind: FauTpPli): { comparables: FauTpComparable[]; range: FauTpRange | null } {
  const comparables: FauTpComparable[] = rows.map((r) => {
    const pli = pliOf(r, kind);
    return { row: r.row, name: r.name, year: r.year, pli, included: pli != null, reason: pli == null ? { key: i18nKey('缺营业利润或分母，无法计算') } : undefined };
  });
  const vals = comparables.filter((c) => c.included).map((c) => c.pli as number).sort((a, b) => a - b);
  if (!vals.length) return { comparables, range: null };
  return {
    comparables,
    range: { n: vals.length, min: vals[0], q1: quartileInc(vals, 0.25), median: quartileInc(vals, 0.5), q3: quartileInc(vals, 0.75), max: vals[vals.length - 1] },
  };
}

export function tpPosition(pli: number | null, range: FauTpRange | null): 'below' | 'within' | 'above' | 'na' {
  if (pli == null || !range) return 'na';
  // 浮点比较留一点余量（四分位插值）
  if (pli < range.q1 - 1e-12) return 'below';
  if (pli > range.q3 + 1e-12) return 'above';
  return 'within';
}

/** 低于下四分位：调到中位值需要增加的营业利润（最小货币单位） */
export function tpAdjustment(tested: { revenue: number; operatingProfit: number; totalCost: number }, kind: FauTpPli, range: FauTpRange | null, position: string): { toPli: number; amount: number } | null {
  if (!range || position !== 'below') return null;
  const base = kind === 'ncp' ? tested.totalCost : tested.revenue;
  return { toPli: range.median, amount: Math.round(range.median * base - tested.operatingProfit) };
}

export const RPT_TYPES: FauRptType[] = ['tangible', 'intangible_transfer', 'intangible_license', 'service', 'financing', 'financial_asset', 'other'];

export function rptSummary(rows: RptRow[]): { rpt: { type: FauRptType; amount: number; count: number; rows: number[] }[]; total: number } {
  const rpt = RPT_TYPES.map((type) => {
    const rs = rows.filter((r) => (r.type || 'other') === type);
    return { type, amount: rs.reduce((s, r) => s + Math.abs(r.amount), 0), count: rs.length, rows: rs.map((r) => r.row) };
  }).filter((g) => g.count > 0);
  return { rpt, total: rpt.reduce((s, g) => s + g.amount, 0) };
}

export interface TpDocInput {
  jurisdiction: FauRegion;
  rpt: { type: FauRptType; amount: number }[];
  rptTotal: number;
  /** 本主体营业收入（阿联酋门槛用） */
  entityRevenue: number;
  /** 集团合并收入 */
  groupRevenue: number;
  /** 集团已准备主体文档（中国：满足即须准备） */
  groupHasMasterFile: boolean;
  prepared: { disclosure: boolean; master: boolean; local: boolean; cbcr: boolean };
  /** 国际口径国别报告门槛（参数） */
  intlCbcrThreshold: number;
  rules: RuleBook;
}

const amt = (rules: RuleBook, id: string) => Math.round(rules.num(id) * 100);
const fmt = (c: number) => (Math.round(c) / 100).toLocaleString('en-US');

/** 三层文档是否须准备，以及原因（引用规则 id） */
export function tpDocRequirements(i: TpDocInput): FauTpDoc[] {
  const by = (t: FauRptType) => i.rpt.filter((r) => r.type === t).reduce((s, r) => s + r.amount, 0);
  const docs: FauTpDoc[] = [];
  const doc = (id: FauTpDoc['id'], required: boolean, key: string, params: Record<string, string | number>, ruleIds: string[]) =>
    docs.push({ id, required, reason: { key, params }, prepared: i.prepared[id], ruleIds });
  if (i.jurisdiction === 'CN') {
    const mf = amt(i.rules, 'cn.tp_mf_rpt_threshold');
    doc('master', i.rptTotal > mf || i.groupHasMasterFile, i18nKey('年度关联交易总额 {a}，门槛 {b}；集团已准备主体文档：{c}'), { a: fmt(i.rptTotal), b: fmt(mf), c: i.groupHasMasterFile ? '✓' : '✗' }, ['cn.tp_mf_rpt_threshold']);
    const tests: Array<[number, string]> = [
      [by('tangible'), 'cn.tp_lf_tangible_threshold'], [by('financial_asset'), 'cn.tp_lf_financial_threshold'], [by('intangible_transfer'), 'cn.tp_lf_intangible_threshold'],
      [by('service') + by('intangible_license') + by('financing') + by('other'), 'cn.tp_lf_other_threshold'],
    ];
    const hit = tests.filter(([v, id]) => v > amt(i.rules, id));
    doc('local', hit.length > 0, i18nKey('超过门槛的类别 {n} 个（有形资产所有权、金融资产、无形资产所有权转让、其他关联交易合计）'), { n: hit.length }, tests.map(([, id]) => id));
    const cb = amt(i.rules, 'cn.tp_cbcr_threshold');
    doc('cbcr', i.groupRevenue > cb, i18nKey('集团合并收入 {a}，门槛 {b}（由最终控股企业提交）'), { a: fmt(i.groupRevenue), b: fmt(cb) }, ['cn.tp_cbcr_threshold']);
  } else if (i.jurisdiction === 'SA') {
    const ds = amt(i.rules, 'sa.tp_disclosure_threshold');
    const ml = amt(i.rules, 'sa.tp_mf_lf_threshold');
    const cb = amt(i.rules, 'sa.tp_cbcr_threshold');
    doc('disclosure', i.rptTotal > ds, i18nKey('关联交易总额 {a}，门槛 {b}'), { a: fmt(i.rptTotal), b: fmt(ds) }, ['sa.tp_disclosure_threshold']);
    doc('master', i.rptTotal > ml, i18nKey('关联交易总额 {a}，门槛 {b}'), { a: fmt(i.rptTotal), b: fmt(ml) }, ['sa.tp_mf_lf_threshold']);
    doc('local', i.rptTotal > ml, i18nKey('关联交易总额 {a}，门槛 {b}'), { a: fmt(i.rptTotal), b: fmt(ml) }, ['sa.tp_mf_lf_threshold']);
    doc('cbcr', i.groupRevenue >= cb, i18nKey('集团合并收入 {a}，门槛 {b}'), { a: fmt(i.groupRevenue), b: fmt(cb) }, ['sa.tp_cbcr_threshold']);
  } else if (i.jurisdiction === 'AE') {
    const er = amt(i.rules, 'ae.tp_mf_lf_revenue_threshold');
    const gr = amt(i.rules, 'ae.tp_mf_lf_group_threshold');
    const cb = amt(i.rules, 'ae.tp_cbcr_threshold');
    const ml = i.entityRevenue >= er || i.groupRevenue >= gr;
    const p = { a: fmt(i.entityRevenue), b: fmt(er), c: fmt(i.groupRevenue), d: fmt(gr) };
    doc('master', ml, i18nKey('本主体收入 {a}（门槛 {b}）或集团合并收入 {c}（门槛 {d}）'), p, ['ae.tp_mf_lf_revenue_threshold', 'ae.tp_mf_lf_group_threshold']);
    doc('local', ml, i18nKey('本主体收入 {a}（门槛 {b}）或集团合并收入 {c}（门槛 {d}）'), p, ['ae.tp_mf_lf_revenue_threshold', 'ae.tp_mf_lf_group_threshold']);
    doc('cbcr', i.groupRevenue >= cb, i18nKey('集团合并收入 {a}，门槛 {b}'), { a: fmt(i.groupRevenue), b: fmt(cb) }, ['ae.tp_cbcr_threshold']);
  } else {
    doc('master', false, i18nKey('国际口径：主体文档与本地文档的门槛按当地规定，请向当地顾问确认'), {}, []);
    doc('local', false, i18nKey('国际口径：主体文档与本地文档的门槛按当地规定，请向当地顾问确认'), {}, []);
    doc('cbcr', i.groupRevenue >= i.intlCbcrThreshold, i18nKey('集团合并收入 {a}，门槛 {b}'), { a: fmt(i.groupRevenue), b: fmt(i.intlCbcrThreshold) }, []);
  }
  return docs;
}

export function tpFindings(i: { range: FauTpRange | null; position: string; minComparables: number; docs: FauTpDoc[]; rpt: { type: FauRptType; amount: number }[]; crossBorderIntangible: boolean }): FauTaxFinding[] {
  const out: FauTaxFinding[] = [];
  if (!i.range) out.push({ id: 'tp_no_comparables', level: 'high', title: { key: i18nKey('没有可用的可比公司数据') }, suggestion: { key: i18nKey('补充可比公司财务数据，或说明改用其它转让定价方法的理由') } });
  else if (i.range.n < i.minComparables) out.push({ id: 'tp_few_comparables', level: 'warn', title: { key: i18nKey('可比公司数量不足') }, detail: { key: i18nKey('只有 {n} 家，少于 {m} 家'), params: { n: i.range.n, m: i.minComparables } } });
  if (i.position === 'below') out.push({ id: 'tp_below', level: 'high', title: { key: i18nKey('受测方利润水平低于可比区间下四分位') }, suggestion: { key: i18nKey('存在转让定价调整风险：按中位值测算调整额，复核功能风险分析与可比性') } });
  if (i.position === 'above') out.push({ id: 'tp_above', level: 'info', title: { key: i18nKey('受测方利润水平高于可比区间上四分位') }, suggestion: { key: i18nKey('关注对方管辖区的调整风险与双重征税') } });
  for (const d of i.docs) if (d.required && !d.prepared) out.push({ id: `tp_gap_${d.id}`, level: 'high', title: { key: i18nKey('须准备但尚未准备的文档') }, detail: { key: DOC_LABEL[d.id] } });
  if (i.crossBorderIntangible) out.push({ id: 'tp_intangible', level: 'warn', title: { key: i18nKey('涉及跨境无形资产交易') }, suggestion: { key: i18nKey('补充 DEMPE 功能分析与收益归属说明') } });
  return out;
}

export const DOC_LABEL: Record<FauTpDoc['id'], string> = {
  disclosure: i18nKey('关联交易披露表'),
  master: i18nKey('主体文档'),
  local: i18nKey('本地文档'),
  cbcr: i18nKey('国别报告'),
};
