/**
 * 配件预警与补库 —— 示例数据。
 *
 * 一键生成 60 个配件的五份表（历史发货按月〔横表，36 个月〕、按年、采购提前期、采购在途、实时库存），
 * 覆盖五种库存状态、有 / 无采购在途两类缺货、提前期缺失、最小起订量、季节性配件、多仓库、没有库存记录的配件。
 * 数据相对基准日生成，哪天点都能看到同样的状态分布。配件名、表头、文件名在 demoParts.json 里。
 */
import { mkdirSync } from 'node:fs';
import { join } from 'node:path';
import type { PaDatasetKey } from '@totalclaw/ipc-contracts';
import { fmtDay, forecastDailyDemand, parseDay, type InTransitRow, type MonthlyShipment, type StockRow, type YearlyShipment } from './calc';
import type { DatasetRows, LeadTimeRowX } from './ingest';
import { writeWorkbook } from '../serviceSettlement/excel';
import D from './demoParts.json';

const DAY = 86_400_000;
const HISTORY_MONTHS = 36;

type Kind = 'healthy' | 'risk_none' | 'risk_late' | 'risk_follow' | 'risk_no_eta' | 'out_none' | 'out_transit' | 'stagnant' | 'redundant';

interface Spec {
  kind: Kind;
  /** 月均发货 */
  demand: number;
  /** 库存够用多少天（呆滞件是绝对数量） */
  cover: number;
  /** 采购提前期；null = 提前期表里没有这个配件 */
  lead: number | null;
  moq?: number;
  seasonal?: boolean;
  /** 呆滞件：距今多少个月没有发货；0 = 从来没有发过 */
  idleMonths?: number;
  /** 在途：数量够用多少天、几天后到货（null = 没有预计到货日期） */
  transit?: Array<{ days: number; etaIn: number | null }>;
  /** 库存表里没有这个配件 */
  noStockRow?: boolean;
  twoWarehouses?: boolean;
}

/** 60 个配件的剧本，顺序对应 demoParts.json 的 names */
function specs(): Spec[] {
  const out: Spec[] = [];
  const add = (n: number, make: (i: number) => Spec): void => { for (let i = 0; i < n; i += 1) out.push(make(i)); };
  add(22, (i) => ({
    kind: 'healthy', demand: 120 + i * 35, cover: 70 + (i % 5) * 20, lead: i % 8 === 7 ? null : 15 + (i % 5) * 5,
    seasonal: i % 6 === 2, twoWarehouses: i % 4 === 0, transit: i % 5 === 1 ? [{ days: 30, etaIn: 20 }] : undefined,
  }));
  add(6, (i) => ({ kind: 'risk_none', demand: 200 + i * 60, cover: 10 + i * 5, lead: i === 5 ? null : 30 + (i % 3) * 5, moq: i < 2 ? (i === 0 ? 50 : 100) : undefined, seasonal: i === 3 }));
  add(3, (i) => ({ kind: 'risk_late', demand: 260 + i * 40, cover: 12 + i * 2, lead: 30, transit: [{ days: 20, etaIn: 28 + i * 4 }] }));
  add(2, (i) => ({ kind: 'risk_follow', demand: 300 + i * 90, cover: 8, lead: 30, moq: i === 1 ? 200 : undefined, transit: [{ days: 15, etaIn: 5 }] }));
  add(1, () => ({ kind: 'risk_no_eta', demand: 180, cover: 10, lead: 25, transit: [{ days: 25, etaIn: null }] }));
  add(4, (i) => ({ kind: 'out_none', demand: 90 + i * 70, cover: 0, lead: 20 + i * 5, noStockRow: i === 3, moq: i === 1 ? 30 : undefined }));
  add(4, (i) => ({ kind: 'out_transit', demand: 150 + i * 50, cover: 0, lead: 30, transit: i === 2 ? [{ days: 20, etaIn: 6 }, { days: 30, etaIn: 26 }] : [{ days: 25 + i * 5, etaIn: 4 + i * 5 }] }));
  add(8, (i) => ({
    kind: 'stagnant', demand: 60 + i * 15, cover: 80 + i * 45, lead: 30, idleMonths: [13, 15, 18, 20, 26, 30, 0, 14][i],
    transit: i === 7 ? [{ days: 40, etaIn: 18 }] : undefined,
  }));
  add(10, (i) => ({ kind: 'redundant', demand: 80 + i * 25, cover: 200 + i * 35, lead: 20 + (i % 4) * 5, transit: i % 4 === 1 ? [{ days: 30, etaIn: 15 }] : undefined, twoWarehouses: i % 5 === 0 }));
  return out;
}

function rng(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const monthIdx = (day: string): number => { const [y, m] = day.split('-').map(Number); return y * 12 + (m - 1); };
const monthStr = (i: number): string => `${Math.floor(i / 12)}-${String((i % 12) + 1).padStart(2, '0')}`;
/** 采暖 / 热水类配件：冬季多、夏季少 */
const seasonFactor = (calendarMonth: number): number => ([10, 11, 12, 1].includes(calendarMonth) ? 1.7 : [5, 6, 7, 8].includes(calendarMonth) ? 0.5 : 1);

export interface DemoData extends DatasetRows { names: Map<string, string> }

export function buildDemoData(asOf: string): DemoData {
  if (!Number.isFinite(parseDay(asOf))) throw new Error(`bad asOf: ${asOf}`);
  const base = monthIdx(asOf);
  const asOfT = parseDay(asOf);
  const rand = rng(20261013);
  const monthly: MonthlyShipment[] = [];
  const yearly: YearlyShipment[] = [];
  const leadTime: LeadTimeRowX[] = [];
  const inTransit: InTransitRow[] = [];
  const stock: StockRow[] = [];
  const names = new Map<string, string>();
  let po = 1;

  specs().forEach((s, i) => {
    const partNo = `${D.codePrefix}${String(i + 1).padStart(4, '0')}`;
    const partName = D.names[i] || partNo;
    names.set(partNo, partName);
    const supplier = D.suppliers[i % D.suppliers.length];
    const price = Math.round((6 + rand() * 180) * 10) / 10;

    // 历史发货：36 个月；呆滞件在 idleMonths 之前才有发货，idleMonths = 0 的从来没有发过
    const byMonth = new Map<number, number>();
    for (let k = HISTORY_MONTHS; k >= 1; k -= 1) {
      const mi = base - k;
      let qty = 0;
      if (s.kind !== 'stagnant') {
        qty = Math.round(s.demand * (0.9 + rand() * 0.2) * (s.seasonal ? seasonFactor((mi % 12) + 1) : 1));
      } else if (s.idleMonths && k >= s.idleMonths) {
        qty = Math.round(s.demand * (0.5 + rand() * 0.5) * Math.min(1, (k - s.idleMonths + 1) / 6));
      }
      byMonth.set(mi, qty);
      if (s.kind !== 'stagnant' || s.idleMonths) monthly.push({ partNo, partName, month: monthStr(mi), qty });
    }
    // 按年：近 5 个完整年。有月度数据的年份直接加总，更早的按月均估一个整年
    const asOfYear = Math.floor(base / 12);
    for (let y = asOfYear - 5; y <= asOfYear - 1; y += 1) {
      let sum = 0;
      let covered = 0;
      for (let m = 0; m < 12; m += 1) { const v = byMonth.get(y * 12 + m); if (v !== undefined) { sum += v; covered += 1; } }
      if (s.kind === 'stagnant' && !s.idleMonths) continue;
      const qty = covered === 12 ? sum : Math.round(s.demand * 12 * (0.75 + rand() * 0.2));
      yearly.push({ partNo, partName, year: y, qty });
    }

    if (s.lead !== null) leadTime.push({ partNo, days: s.lead, ...(s.moq ? { moq: s.moq } : {}), unitPrice: price, supplier });

    // 库存按「预测日均 × 够用天数」定，状态不受随机波动影响
    const daily = forecastDailyDemand(byMonth, base, true).daily;
    const qty = s.kind === 'stagnant' ? s.cover : Math.round(daily * s.cover);
    if (!s.noStockRow) {
      if (s.twoWarehouses && qty > 1) {
        const first = Math.round(qty * 0.65);
        stock.push({ partNo, partName, warehouse: D.warehouses[0], qty: first, unitPrice: price });
        stock.push({ partNo, partName, warehouse: D.warehouses[1], qty: qty - first, unitPrice: price });
      } else {
        stock.push({ partNo, partName, warehouse: D.warehouses[i % D.warehouses.length], qty, unitPrice: price });
      }
    }
    for (const t of s.transit || []) {
      const tq = Math.max(10, Math.round((s.kind === 'stagnant' ? s.demand / 30 : daily) * t.days));
      inTransit.push({
        partNo, orderNo: `${D.orderPrefix}${asOf.slice(0, 4)}${String(po).padStart(5, '0')}`, qty: tq, supplier,
        ...(t.etaIn !== null ? { eta: fmtDay(asOfT + t.etaIn * DAY) } : {}),
      });
      po += 1;
    }
  });
  return { monthly, yearly, leadTime, inTransit, stock, names };
}

/** 把示例数据写成五份 xlsx，返回各自的路径 */
export function writeDemoFiles(dir: string, asOf: string): Record<PaDatasetKey, string> {
  mkdirSync(dir, { recursive: true });
  const d = buildDemoData(asOf);
  const base = monthIdx(asOf);
  const months = Array.from({ length: HISTORY_MONTHS }, (_, k) => monthStr(base - HISTORY_MONTHS + k));
  const paths = Object.fromEntries((Object.keys(D.files) as PaDatasetKey[]).map((k) => [k, join(dir, D.files[k])])) as Record<PaDatasetKey, string>;
  const name = (no: string): string => d.names.get(no) || '';

  const wide = new Map<string, Map<string, number>>();
  for (const r of d.monthly) { const m = wide.get(r.partNo) ?? new Map<string, number>(); m.set(r.month, r.qty); wide.set(r.partNo, m); }
  writeWorkbook(paths.monthly, [{
    name: D.sheets.monthly,
    headers: [...D.headers.monthly, ...months],
    rows: [...wide.entries()].map(([no, m]) => [no, name(no), ...months.map((mo) => m.get(mo) ?? 0)]),
  }]);
  writeWorkbook(paths.yearly, [{ name: D.sheets.yearly, headers: D.headers.yearly, rows: d.yearly.map((r) => [r.partNo, name(r.partNo), r.year, r.qty]) }]);
  writeWorkbook(paths.leadTime, [{ name: D.sheets.leadTime, headers: D.headers.leadTime, rows: d.leadTime.map((r) => [r.partNo, name(r.partNo), r.supplier || '', r.days, r.moq ?? '', r.unitPrice ?? '']) }]);
  writeWorkbook(paths.inTransit, [{ name: D.sheets.inTransit, headers: D.headers.inTransit, rows: d.inTransit.map((r) => [r.orderNo || '', r.partNo, name(r.partNo), r.supplier || '', r.qty, r.eta || '']) }]);
  writeWorkbook(paths.stock, [{ name: D.sheets.stock, headers: D.headers.stock, rows: d.stock.map((r) => [r.partNo, name(r.partNo), r.warehouse || '', r.qty, r.unitPrice ?? '']) }]);
  return paths;
}
