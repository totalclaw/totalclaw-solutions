import { t as i18nT } from '@totalclaw/i18n';
/**
 * 配件预警与补库 —— 纯计算。
 *
 * 四类输入：历史发货（按月 / 按年）、采购提前期、采购在途、实时库存。
 * 输出：每个配件的库存状态（呆滞 / 冗余 / 健康 / 将缺货 / 已缺货）、行动计划、补库清单。
 *
 * 所有数量、日期都由这里的公式算出，模型不参与；每个结论都带算式依据（basis），
 * 界面和导出文件原样展示，方便人工检验。
 */

export type PartState = 'stagnant' | 'redundant' | 'healthy' | 'at_risk' | 'out_of_stock';

export interface MonthlyShipment { partNo: string; partName?: string; month: string; qty: number }
export interface YearlyShipment { partNo: string; partName?: string; year: number; qty: number }
export interface LeadTimeRow { partNo: string; days: number; moq?: number; unitPrice?: number }
export interface InTransitRow { partNo: string; orderNo?: string; qty: number; eta?: string; supplier?: string }
export interface StockRow { partNo: string; partName?: string; qty: number; warehouse?: string; unitPrice?: number }

export interface PartsAlertParams {
  /** 运算基准日 YYYY-MM-DD */
  asOf: string;
  /** 安全库存天数 */
  safetyDays: number;
  /** 补货周期（两次下单之间的天数） */
  reviewDays: number;
  /** 库存可用月数超过它算冗余 */
  redundantMonths: number;
  /** 连续多少个月没有发货算呆滞 */
  stagnantMonths: number;
  /** 呆滞后超过多少个月没有发货，建议做报废评估 */
  scrapMonths: number;
  /** 提前期表里没有该配件时用的默认天数 */
  defaultLeadDays: number;
  /** 是否按去年同期做季节修正 */
  seasonal: boolean;
}

export const DEFAULT_PARAMS: Omit<PartsAlertParams, 'asOf'> = {
  safetyDays: 15,
  reviewDays: 30,
  redundantMonths: 6,
  stagnantMonths: 12,
  scrapMonths: 24,
  defaultLeadDays: 30,
  seasonal: true,
};

export interface PartsAlertInput {
  monthly: MonthlyShipment[];
  yearly: YearlyShipment[];
  leadTimes: LeadTimeRow[];
  inTransit: InTransitRow[];
  stock: StockRow[];
}

export type ActionKind =
  | 'stop_purchase' | 'cancel_in_transit' | 'transfer_out' | 'scrap_review' | 'pause_replenish' | 'defer_in_transit'
  | 'expedite' | 'transfer_in' | 'place_order' | 'substitute' | 'backorder_notice' | 'top_up_order';

export interface PartAction { kind: ActionKind; text: string }

export interface PartResult {
  partNo: string;
  partName: string;
  state: PartState;
  stockQty: number;
  inTransitQty: number;
  /** 最早一笔在途的预计回货日；没有在途为空 */
  earliestEta: string;
  leadDays: number;
  leadDaysDefaulted: boolean;
  /** 预测日均需求 */
  dailyDemand: number;
  /** 预测月均需求（日均 × 30） */
  monthlyDemand: number;
  /** 现有库存可用天数；无需求为 null */
  coverDays: number | null;
  /** 最近一次有发货的月份 YYYY-MM；从未发货为空 */
  lastShipMonth: string;
  monthsSinceLastShip: number | null;
  /** 按现有库存 + 在途到货推算的断货日；推算期内不断货为空 */
  stockoutDate: string;
  /** 最迟下单日 = 断货日 − 提前期；已过期则为基准日 */
  latestOrderDate: string;
  /** 年度发货趋势：最近一个完整年相对前一年的变化比例；数据不足为 null */
  yearlyTrend: number | null;
  /** 有采购在途 / 无采购在途（只对将缺货、已缺货有意义） */
  hasInTransit: boolean;
  actions: PartAction[];
  /** 建议补库量；不需要补库为 0 */
  suggestQty: number;
  /** 建议补库金额（有单价时） */
  suggestAmount: number | null;
  /** 算式依据，逐条可读 */
  basis: string[];
}

export interface PartsAlertSummary {
  asOf: string;
  total: number;
  byState: Record<PartState, number>;
  replenishParts: number;
  replenishQty: number;
  replenishAmount: number;
  /** 输入里出现、但没有库存记录的配件号（按库存 0 处理） */
  partsWithoutStockRow: string[];
  /** 提前期表里没有、用了默认天数的配件号 */
  partsWithDefaultLead: string[];
}

export interface PartsAlertOutput { results: PartResult[]; summary: PartsAlertSummary }

const DAY = 86_400_000;
const DAYS_PER_MONTH = 30;

export function parseDay(s: string): number {
  const m = /^(\d{4})-(\d{1,2})-(\d{1,2})/.exec(String(s || '').trim());
  if (!m) return NaN;
  return Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
}

export function fmtDay(t: number): string {
  if (!Number.isFinite(t)) return '';
  const d = new Date(t);
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}-${String(d.getUTCDate()).padStart(2, '0')}`;
}

/** YYYY-MM → 自 0 年起的月序号，方便做月份加减 */
function monthIndex(month: string): number {
  const m = /^(\d{4})-(\d{1,2})/.exec(String(month || '').trim());
  return m ? Number(m[1]) * 12 + (Number(m[2]) - 1) : NaN;
}

function monthOfIndex(i: number): string {
  return `${Math.floor(i / 12)}-${String((i % 12) + 1).padStart(2, '0')}`;
}

function round(n: number, digits = 2): number {
  const k = 10 ** digits;
  return Math.round(n * k) / k;
}

function avg(xs: number[]): number {
  return xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : 0;
}

/**
 * 预测日均需求。
 * 基准 = 近 3 个月均值 × 0.5 + 近 6 个月均值 × 0.3 + 近 12 个月均值 × 0.2（只用基准日所在月之前的完整月份）。
 * 季节修正 = 去年同月与下月的均值 ÷ 去年全年月均，限制在 0.5～2 之间；数据不足 24 个月不修正。
 */
export function forecastDailyDemand(
  byMonth: Map<number, number>,
  asOfMonthIdx: number,
  seasonal: boolean,
): { daily: number; base: number; seasonFactor: number; basis: string } {
  const last = (n: number): number[] => {
    const out: number[] = [];
    for (let i = 1; i <= n; i += 1) out.push(byMonth.get(asOfMonthIdx - i) ?? 0);
    return out;
  };
  const a3 = avg(last(3));
  const a6 = avg(last(6));
  const a12 = avg(last(12));
  const base = a3 * 0.5 + a6 * 0.3 + a12 * 0.2;
  let seasonFactor = 1;
  const months = [...byMonth.keys()];
  const earliest = months.length ? Math.min(...months) : NaN;
  if (seasonal && Number.isFinite(earliest) && asOfMonthIdx - earliest >= 24 && a12 > 0) {
    const lastYearSame = byMonth.get(asOfMonthIdx - 12) ?? 0;
    const lastYearNext = byMonth.get(asOfMonthIdx - 11) ?? 0;
    const prevYearAvg = avg(Array.from({ length: 12 }, (_, i) => byMonth.get(asOfMonthIdx - 13 - i + 1) ?? 0));
    if (prevYearAvg > 0) seasonFactor = Math.min(2, Math.max(0.5, ((lastYearSame + lastYearNext) / 2) / prevYearAvg));
  }
  const monthly = base * seasonFactor;
  const daily = monthly / DAYS_PER_MONTH;
  const basis = i18nT('月均需求 = (近3月均 {p0} × 0.5 + 近6月均 {p1} × 0.3 + 近12月均 {p2} × 0.2)', { p0: round(a3), p1: round(a6), p2: round(a12) })
    + i18nT('{p0} = {p1}；日均 = {p2}', { p0: seasonFactor !== 1 ? ` × 季节系数 ${round(seasonFactor)}` : '', p1: round(monthly), p2: round(daily, 3) });
  return { daily, base, seasonFactor, basis };
}

/**
 * 推算断货日：库存按日均需求消耗，在途到货日加回数量。
 * 没有预计回货时间的在途按「基准日 + 提前期」到货。推算到 horizonDays 为止，期内不断货返回 NaN。
 */
export function projectStockout(
  stockQty: number,
  dailyDemand: number,
  arrivals: Array<{ day: number; qty: number }>,
  asOf: number,
  horizonDays: number,
): number {
  if (dailyDemand <= 0) return NaN;
  const sorted = [...arrivals].filter((a) => a.qty > 0).sort((a, b) => a.day - b.day);
  let level = stockQty;
  // 基准日当天及之前就该到的在途，视为随时可到
  let idx = 0;
  while (idx < sorted.length && sorted[idx].day <= asOf) { level += sorted[idx].qty; idx += 1; }
  if (level <= 0) return asOf;
  let cursor = asOf;
  while (cursor - asOf <= horizonDays * DAY) {
    const nextArrival = idx < sorted.length ? sorted[idx].day : Infinity;
    const daysToEmpty = level / dailyDemand;
    const emptyAt = cursor + Math.ceil(daysToEmpty) * DAY;
    if (emptyAt <= nextArrival) {
      return emptyAt - asOf <= horizonDays * DAY ? emptyAt : NaN;
    }
    level -= ((nextArrival - cursor) / DAY) * dailyDemand;
    level += sorted[idx].qty;
    cursor = nextArrival;
    idx += 1;
  }
  return NaN;
}

function normNo(s: unknown): string {
  return String(s ?? '').trim();
}

export function computePartsAlert(input: PartsAlertInput, params: PartsAlertParams): PartsAlertOutput {
  const asOf = parseDay(params.asOf);
  if (!Number.isFinite(asOf)) throw new Error(i18nT('运算基准日格式不对：{p0}', { p0: params.asOf }));
  const asOfMonthIdx = monthIndex(params.asOf);

  const names = new Map<string, string>();
  const monthlyBy = new Map<string, Map<number, number>>();
  for (const r of input.monthly) {
    const no = normNo(r.partNo);
    const mi = monthIndex(r.month);
    if (!no || !Number.isFinite(mi)) continue;
    if (r.partName && !names.has(no)) names.set(no, r.partName);
    const m = monthlyBy.get(no) ?? new Map<number, number>();
    m.set(mi, (m.get(mi) ?? 0) + (Number(r.qty) || 0));
    monthlyBy.set(no, m);
  }
  const yearlyBy = new Map<string, Map<number, number>>();
  for (const r of input.yearly) {
    const no = normNo(r.partNo);
    if (!no || !Number.isFinite(Number(r.year))) continue;
    if (r.partName && !names.has(no)) names.set(no, r.partName);
    const m = yearlyBy.get(no) ?? new Map<number, number>();
    m.set(Number(r.year), (m.get(Number(r.year)) ?? 0) + (Number(r.qty) || 0));
    yearlyBy.set(no, m);
  }
  const leadBy = new Map<string, LeadTimeRow>();
  for (const r of input.leadTimes) { const no = normNo(r.partNo); if (no) leadBy.set(no, r); }
  const transitBy = new Map<string, InTransitRow[]>();
  for (const r of input.inTransit) {
    const no = normNo(r.partNo);
    if (!no || !(Number(r.qty) > 0)) continue;
    transitBy.set(no, [...(transitBy.get(no) ?? []), r]);
  }
  const stockBy = new Map<string, { qty: number; unitPrice?: number }>();
  for (const r of input.stock) {
    const no = normNo(r.partNo);
    if (!no) continue;
    if (r.partName && !names.has(no)) names.set(no, r.partName);
    const cur = stockBy.get(no) ?? { qty: 0 };
    stockBy.set(no, { qty: cur.qty + (Number(r.qty) || 0), unitPrice: r.unitPrice ?? cur.unitPrice });
  }

  const allParts = new Set<string>([...stockBy.keys(), ...monthlyBy.keys(), ...transitBy.keys()]);
  const partsWithoutStockRow: string[] = [];
  const partsWithDefaultLead: string[] = [];
  const results: PartResult[] = [];

  for (const partNo of [...allParts].sort()) {
    const basis: string[] = [];
    const stockRow = stockBy.get(partNo);
    if (!stockRow) partsWithoutStockRow.push(partNo);
    const stockQty = stockRow?.qty ?? 0;
    const lead = leadBy.get(partNo);
    const leadDaysDefaulted = !(lead && Number(lead.days) > 0);
    const leadDays = leadDaysDefaulted ? params.defaultLeadDays : Number(lead!.days);
    if (leadDaysDefaulted) partsWithDefaultLead.push(partNo);
    const unitPrice = stockRow?.unitPrice ?? lead?.unitPrice;

    const byMonth = monthlyBy.get(partNo) ?? new Map<number, number>();
    const fc = forecastDailyDemand(byMonth, asOfMonthIdx, params.seasonal);
    const dailyDemand = fc.daily;
    basis.push(fc.basis);

    // 最近一次发货
    const shippedMonths = [...byMonth.entries()].filter(([mi, q]) => q > 0 && mi <= asOfMonthIdx).map(([mi]) => mi);
    const lastIdx = shippedMonths.length ? Math.max(...shippedMonths) : NaN;
    const lastShipMonth = Number.isFinite(lastIdx) ? monthOfIndex(lastIdx) : '';
    const monthsSinceLastShip = Number.isFinite(lastIdx) ? asOfMonthIdx - lastIdx : null;

    // 年度趋势
    const byYear = yearlyBy.get(partNo);
    let yearlyTrend: number | null = null;
    if (byYear) {
      const asOfYear = Math.floor(asOfMonthIdx / 12);
      const y1 = byYear.get(asOfYear - 1);
      const y2 = byYear.get(asOfYear - 2);
      if (y1 !== undefined && y2 !== undefined && y2 > 0) yearlyTrend = round(y1 / y2 - 1, 4);
    }

    const transits = transitBy.get(partNo) ?? [];
    const inTransitQty = transits.reduce((a, r) => a + Number(r.qty), 0);
    const arrivals = transits.map((r) => {
      const eta = r.eta ? parseDay(r.eta) : NaN;
      // 没有预计回货时间的在途：按「基准日 + 提前期」推算，并在举措里标明是推算
      return { day: Number.isFinite(eta) ? eta : asOf + leadDays * DAY, qty: Number(r.qty), assumed: !Number.isFinite(eta) };
    });
    const etaDays = arrivals.map((a) => a.day);
    const earliestEta = etaDays.length ? fmtDay(Math.min(...etaDays)) : '';
    const earliestAssumed = arrivals.length > 0 && [...arrivals].sort((a, b) => a.day - b.day)[0].assumed;
    const etaNote = earliestAssumed ? i18nT('（订单没有预计回货时间，按提前期推算）') : '';
    const hasInTransit = inTransitQty > 0;

    const coverDays = dailyDemand > 0 ? stockQty / dailyDemand : null;
    const riskWindow = leadDays + params.safetyDays;
    const horizon = Math.max(riskWindow, params.redundantMonths * DAYS_PER_MONTH) + 365;
    const stockoutAt = projectStockout(stockQty, dailyDemand, arrivals, asOf, horizon);
    const stockoutDate = Number.isFinite(stockoutAt) ? fmtDay(stockoutAt) : '';
    const latestOrderAt = Number.isFinite(stockoutAt) ? Math.max(asOf, stockoutAt - leadDays * DAY) : NaN;

    // —— 状态判定 ——
    const noRecentShip = monthsSinceLastShip === null || monthsSinceLastShip >= params.stagnantMonths;
    let state: PartState;
    if (stockQty <= 0 && dailyDemand > 0) {
      state = 'out_of_stock';
      basis.push(i18nT('现有库存 {stockQty}，日均需求 {p0} > 0 → 已缺货', { stockQty, p0: round(dailyDemand, 3) }));
    } else if (stockQty > 0 && (noRecentShip || dailyDemand <= 0)) {
      state = 'stagnant';
      basis.push(monthsSinceLastShip === null
        ? i18nT('有库存 {stockQty}，近 3 年没有发货记录 → 呆滞', { stockQty })
        : i18nT('有库存 {stockQty}，最近一次发货在 {lastShipMonth}，已 {monthsSinceLastShip} 个月没有发货（阈值 {p0} 个月）→ 呆滞', { stockQty, lastShipMonth, monthsSinceLastShip, p0: params.stagnantMonths }));
    } else if (dailyDemand > 0 && Number.isFinite(stockoutAt) && stockoutAt - asOf <= riskWindow * DAY) {
      state = 'at_risk';
      basis.push(i18nT('按现有库存和在途到货推算，{stockoutDate} 断货，距今 {p0} 天，', { stockoutDate, p0: Math.round((stockoutAt - asOf) / DAY) })
        + i18nT('不超过 提前期 {leadDays} 天 + 安全天数 {p0} 天 = {riskWindow} 天 → 将缺货', { leadDays, p0: params.safetyDays, riskWindow }));
    } else if (coverDays !== null && coverDays > params.redundantMonths * DAYS_PER_MONTH) {
      state = 'redundant';
      basis.push(i18nT('库存可用 {p0} 天，超过 {p1} 个月（{p2} 天）→ 冗余', { p0: Math.round(coverDays), p1: params.redundantMonths, p2: params.redundantMonths * DAYS_PER_MONTH }));
    } else {
      state = 'healthy';
      basis.push(coverDays === null
        ? i18nT('没有库存也没有需求 → 不需要处理')
        : coverDays < riskWindow && hasInTransit
          // 靠在途才健康的：光看库存是不够的，要把在途写进依据
          ? i18nT('现有库存只够 {p0} 天，但在途 {p1} 会在断货前到货，推算{p2}，超出风险窗口 {riskWindow} 天 → 健康', {
            p0: Math.round(coverDays), p1: inTransitQty, riskWindow,
            p2: stockoutDate ? i18nT('到 {p0} 才断货', { p0: stockoutDate }) : i18nT('期内不会断货'),
          })
          : i18nT('库存可用 {p0} 天，在 {riskWindow} 天到 {p1} 天之间 → 健康', { p0: Math.round(coverDays), riskWindow, p1: params.redundantMonths * DAYS_PER_MONTH }));
    if (yearlyTrend !== null) {
      basis.push(i18nT('年度趋势：上一年发货量比前一年{p0} {p1}%（仅供参考，不进入预测）', { p0: yearlyTrend >= 0 ? i18nT('增加') : i18nT('减少'), p1: Math.abs(Math.round(yearlyTrend * 1000) / 10) }));
    }
    }

    // —— 补库量 ——
    let suggestQty = 0;
    if (state === 'at_risk' || state === 'out_of_stock') {
      const target = dailyDemand * (leadDays + params.reviewDays + params.safetyDays);
      const raw = Math.ceil(target - Math.max(0, stockQty) - inTransitQty);
      suggestQty = Math.max(0, raw);
      const moq = Number(lead?.moq) > 0 ? Number(lead!.moq) : 0;
      if (suggestQty > 0 && moq > 0) suggestQty = Math.ceil(suggestQty / moq) * moq;
      basis.push(i18nT('目标库存 = 日均 {p0} × (提前期 {leadDays} + 补货周期 {p1} + 安全天数 {p2}) = {p3}；', { p0: round(dailyDemand, 3), leadDays, p1: params.reviewDays, p2: params.safetyDays, p3: Math.ceil(target) })
        + i18nT('建议补库 = 目标 {p0} − 库存 {p1} − 在途 {inTransitQty} = {p2}', { p0: Math.ceil(target), p1: Math.max(0, stockQty), inTransitQty, p2: Math.max(0, raw) })
        + `${moq > 0 && suggestQty !== Math.max(0, raw) ? i18nT('，按最小起订量 {moq} 取整为 {suggestQty}', { moq, suggestQty }) : ''}`);
    }
    const suggestAmount = suggestQty > 0 && Number(unitPrice) > 0 ? round(suggestQty * Number(unitPrice)) : null;

    // —— 行动计划 ——
    const actions: PartAction[] = [];
    if (state === 'stagnant') {
      actions.push({ kind: 'stop_purchase', text: i18nT('停止采购，从补货计划中移出') });
      if (hasInTransit) actions.push({ kind: 'cancel_in_transit', text: i18nT('还有在途 {inTransitQty}，与供应商协商取消或延期', { inTransitQty }) });
      actions.push({ kind: 'transfer_out', text: i18nT('向仍有需求的仓库或网点调拨消化') });
      if (monthsSinceLastShip === null || monthsSinceLastShip >= params.scrapMonths) {
        actions.push({ kind: 'scrap_review', text: i18nT('已超过 {p0} 个月没有发货，提交报废评估', { p0: params.scrapMonths }) });
      }
    } else if (state === 'redundant') {
      const excess = Math.floor(stockQty - dailyDemand * params.redundantMonths * DAYS_PER_MONTH);
      actions.push({ kind: 'pause_replenish', text: i18nT('暂停补货；超出 {p0} 个月用量的部分约 {excess}', { p0: params.redundantMonths, excess }) });
      if (hasInTransit) actions.push({ kind: 'defer_in_transit', text: i18nT('还有在途 {inTransitQty}，与供应商协商延期交货', { inTransitQty }) });
    } else if (state === 'at_risk' || state === 'out_of_stock') {
      if (hasInTransit) {
        const firstEta = Math.min(...etaDays);
        const gapDays = Number.isFinite(stockoutAt) ? Math.round((firstEta - stockoutAt) / DAY) : 0;
        if (state === 'out_of_stock' || gapDays > 0) {
          actions.push({ kind: 'expedite', text: i18nT('在途最早 {earliestEta} 到货{etaNote}，{p0}，催交并要求加急或分批先发', { earliestEta, etaNote, p0: state === 'out_of_stock' ? i18nT('目前已断货') : i18nT('比断货日晚 {p0} 天', { p0: gapDays }) }) });
          actions.push({ kind: 'transfer_in', text: i18nT('到货前从其他仓库调拨应急') });
        } else {
          actions.push({ kind: 'expedite', text: i18nT('在途最早 {earliestEta} 到货{etaNote}，跟进确保按期到货', { earliestEta, etaNote }) });
        }
        if (suggestQty > 0) actions.push({ kind: 'top_up_order', text: i18nT('在途量不够覆盖，追加补库 {suggestQty}', { suggestQty }) });
      } else {
        actions.push({ kind: 'place_order', text: i18nT('没有采购在途，{p0}下单补库 {suggestQty}', { p0: Number.isFinite(latestOrderAt) && latestOrderAt > asOf ? `最迟 ${fmtDay(latestOrderAt)} 前` : '立即', suggestQty }) });
        actions.push({ kind: 'transfer_in', text: i18nT('到货前从其他仓库调拨，或启用替代件') });
      }
      if (state === 'out_of_stock') actions.push({ kind: 'backorder_notice', text: i18nT('通知服务网点该配件缺货及预计到货时间，登记欠件工单') });
    }

    if (state === 'healthy' && dailyDemand <= 0 && hasInTransit) {
      basis.push(i18nT('这个配件没有需求，却还有在途 {p0}', { p0: inTransitQty }));
      actions.push({ kind: 'cancel_in_transit', text: i18nT('没有需求却还有在途 {p0}，与供应商核对是否取消', { p0: inTransitQty }) });
    }

    results.push({
      partNo,
      partName: names.get(partNo) ?? '',
      state,
      stockQty,
      inTransitQty,
      earliestEta,
      leadDays,
      leadDaysDefaulted,
      dailyDemand: round(dailyDemand, 3),
      monthlyDemand: round(dailyDemand * DAYS_PER_MONTH),
      coverDays: coverDays === null ? null : round(coverDays, 1),
      lastShipMonth,
      monthsSinceLastShip,
      stockoutDate,
      latestOrderDate: Number.isFinite(latestOrderAt) ? fmtDay(latestOrderAt) : '',
      yearlyTrend,
      hasInTransit,
      actions,
      suggestQty,
      suggestAmount,
      basis,
    });
  }

  const byState: Record<PartState, number> = { stagnant: 0, redundant: 0, healthy: 0, at_risk: 0, out_of_stock: 0 };
  for (const r of results) byState[r.state] += 1;
  const repl = results.filter((r) => r.suggestQty > 0);
  return {
    results,
    summary: {
      asOf: params.asOf,
      total: results.length,
      byState,
      replenishParts: repl.length,
      replenishQty: repl.reduce((a, r) => a + r.suggestQty, 0),
      replenishAmount: round(repl.reduce((a, r) => a + (r.suggestAmount ?? 0), 0)),
      partsWithoutStockRow,
      partsWithDefaultLead,
    },
  };
}

/** 状态排序：越紧急越靠前 */
export const STATE_ORDER: PartState[] = ['out_of_stock', 'at_risk', 'stagnant', 'redundant', 'healthy'];
