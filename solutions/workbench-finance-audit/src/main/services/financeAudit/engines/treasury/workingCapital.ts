/**
 * E6 营运资本（纯函数，自建：finance-skills README 声明了 working-capital 场景但仓库没有文件）：
 *   cccMetrics      DSO / DIO / DPO 与现金转换周期，每改善 1 天释放的现金；
 *   inventoryAbc    ABC 分类（按年耗用金额累计占比，跨过 80% 的那一项仍算 A）与呆滞 / 过时识别；
 *   supplierTerms   应付按供应商：余额占比、平均账期、近期到期；
 *   scfOptions      供应链金融选项的现金效应与年化成本测算（反向保理、应收保理、动态折扣、存货融资）。
 * 口径写在 scripts/finance-audit-selfbuilt/fa-*（working-capital 的 Master 与四个原子技能）。
 */
import type { FauCccResult, FauInventoryClass, FauInventoryResult, FauScfOption, FauSupplierTerm } from '@totalclaw/ipc-contracts';
import type { FinMetricsRow, InventoryRow } from './types';
import type { OpenItemRow } from '../../subledgerTypes';
import { addDays, daysBetween, ratio, sum } from './common';

type Th = Record<string, number>;

export function cccMetrics(inp: { ar: OpenItemRow[]; ap: OpenItemRow[]; inventory: InventoryRow[]; metrics: FinMetricsRow | null; days: number; asOf: string }): FauCccResult {
  const revenue = inp.metrics?.revenue ?? 0;
  const cogs = inp.metrics?.cogs ?? 0;
  const days = inp.metrics?.days || inp.days;
  const ar = sum(inp.ar.map((r) => r.open));
  const ap = sum(inp.ap.map((r) => r.open));
  const inventory = inp.inventory.length ? sum(inp.inventory.map((r) => r.amount)) : (inp.metrics?.inventory ?? 0);
  const per = (bal: number, base: number) => { const r = ratio(bal, base); return r == null ? null : r * days; };
  const dso = per(ar, revenue);
  const dio = per(inventory, cogs);
  const dpo = per(ap, cogs);
  return {
    days, revenue, cogs, ar, inventory, ap, dso, dio, dpo,
    ccc: dso == null || dio == null || dpo == null ? null : dso + dio - dpo,
    perDay: { dso: days ? Math.round(revenue / days) : 0, dio: days ? Math.round(cogs / days) : 0, dpo: days ? Math.round(cogs / days) : 0 },
    overdueAr: sum(inp.ar.filter((r) => r.dueDate && r.dueDate < inp.asOf).map((r) => r.open)),
  };
}

export function inventoryAbc(rows: InventoryRow[], asOf: string, th: Th): FauInventoryResult {
  const withUsage = rows.map((r) => ({ r, usage: r.usage ?? r.amount }));
  const total = sum(withUsage.map((x) => x.usage));
  let cum = 0;
  const items = [...withUsage].sort((a, b) => b.usage - a.usage || a.r.row - b.r.row).map(({ r, usage }) => {
    const before = total ? cum / total : 0;
    cum += usage;
    const cls: FauInventoryClass = before < th['abc.aShare'] ? 'A' : before < th['abc.bShare'] ? 'B' : 'C';
    const idleDays = r.lastMoveDate ? daysBetween(r.lastMoveDate, asOf) : null;
    const aging: FauInventoryResult['items'][number]['aging'] = idleDays == null ? 'active' : idleDays > th['inv.obsoleteDays'] ? 'obsolete' : idleDays > th['inv.slowDays'] ? 'slow' : 'active';
    return { row: r.row, sku: r.sku, name: r.name, amount: r.amount, usage, cls, idleDays, aging };
  });
  const byClass = Object.fromEntries((['A', 'B', 'C'] as FauInventoryClass[]).map((c) => {
    const xs = items.filter((i) => i.cls === c);
    return [c, { count: xs.length, amount: sum(xs.map((x) => x.amount)), usage: sum(xs.map((x) => x.usage)) }];
  })) as FauInventoryResult['byClass'];
  const slow = sum(items.filter((i) => i.aging === 'slow').map((i) => i.amount));
  const obsolete = sum(items.filter((i) => i.aging === 'obsolete').map((i) => i.amount));
  return { items, byClass, slow, obsolete, release: slow + obsolete };
}

export function supplierTerms(ap: OpenItemRow[], asOf: string, th: Th): FauSupplierTerm[] {
  const total = sum(ap.map((r) => r.open));
  const soon = addDays(asOf, th['supplier.dueSoonDays']);
  const names = [...new Set(ap.map((r) => r.party))];
  return names.map((supplier) => {
    const rs = ap.filter((r) => r.party === supplier);
    const open = sum(rs.map((r) => r.open));
    const terms = rs.filter((r) => r.docDate && r.dueDate).map((r) => daysBetween(r.docDate, r.dueDate));
    const share = total ? open / total : 0;
    return {
      supplier, open, share, avgTermDays: terms.length ? sum(terms) / terms.length : null,
      dueIn30: sum(rs.filter((r) => r.dueDate && r.dueDate >= asOf && r.dueDate <= soon).map((r) => r.open)),
      status: (share >= th['supplier.shareWatch'] ? 'watch' : 'ok') as FauSupplierTerm['status'],
    };
  }).sort((a, b) => b.open - a.open);
}

export function scfOptions(inp: { ar: OpenItemRow[]; ap: OpenItemRow[]; inventory: number; cogs: number; days: number; asOf: string; th: Th }): FauScfOption[] {
  const { th } = inp;
  const arOpen = sum(inp.ar.map((r) => r.open));
  const apOpen = sum(inp.ap.map((r) => r.open));
  const soon = addDays(inp.asOf, th['supplier.dueSoonDays']);
  const apSoon = sum(inp.ap.filter((r) => r.dueDate && r.dueDate >= inp.asOf && r.dueDate <= soon).map((r) => r.open));
  const fin = (x: number) => Math.round(x * th['scf.financingRate']);
  const extension = inp.days ? Math.round((inp.cogs / inp.days) * th['scf.extensionDays']) : 0;
  const factoring = Math.round(arOpen * th['scf.advanceRate']);
  const invFin = Math.round(inp.inventory * th['scf.inventoryAdvanceRate']);
  return [
    { id: 'reverse_factoring', base: apOpen, cashEffect: extension, annualCost: fin(extension) },
    { id: 'receivables_factoring', base: arOpen, cashEffect: factoring, annualCost: fin(factoring) },
    // 动态折扣：提前付出现金换折扣，现金效应为负、成本为负（即节约）
    { id: 'dynamic_discounting', base: apSoon, cashEffect: -apSoon, annualCost: -Math.round(apSoon * th['scf.discountPct']) },
    { id: 'inventory_finance', base: inp.inventory, cashEffect: invFin, annualCost: fin(invFin) },
  ];
}
