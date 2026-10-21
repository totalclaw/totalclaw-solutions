/**
 * 经营自动化智能体 · 纯规则（不碰文件、不调模型，全部可单测）。
 *
 *   - 经营指标口径：营业额、毛利、客单价、连带率、费用率、售罄率… 全部由这里算，模型只写解读；
 *   - 解读回核：解读里出现的数字必须能在指标里找到（允许四舍五入 / 万元 / 百分比写法），找不到的列出来标红；
 *   - 上下架规则：售罄 / 断码 / 过季 / 试穿多成交少；
 *   - 广告法禁用词自检；
 *   - 收银 / 费用表按关键字识别列。
 */
import type {
  ApGarment, ApStats, BaAvatarProject, BaExpenseRow, BaMetricRow, BaMetrics, BaPublishReceipt, BaPublishRun, BaRuleHit, BaSaleRow, BaSettings, BaVideoEvent, BaVideoProject, BaVideoStep,
} from '@totalclaw/ipc-contracts';
import { t as i18nT } from '@totalclaw/i18n';
import KW from './columnKeywords.json';
import BANNED from './bannedWords.json';

const round2 = (n: number): number => Math.round((Number(n) || 0) * 100) / 100;
const ratio = (a: number, b: number): number => (b > 0 ? Math.round((a / b) * 10000) / 10000 : 0);

// ── 列识别 ─────────────────────────────────────────

const KEYWORDS = KW as unknown as Record<string, string[]>;

export function detectColumns(headers: string[], roles: string[]): Record<string, string> {
  const norm = (s: string) => String(s || '').replace(/\s+/g, '').toLowerCase();
  const used = new Set<string>();
  const out: Record<string, string> = {};
  for (const role of roles) {
    let hit = '';
    for (const kw of KEYWORDS[role] || []) {
      hit = headers.find((h) => !used.has(h) && norm(h) === norm(kw)) || headers.find((h) => !used.has(h) && norm(h).includes(norm(kw))) || '';
      if (hit) break;
    }
    out[role] = hit;
    if (hit) used.add(hit);
  }
  return out;
}

export function toNumber(v: unknown): number {
  if (typeof v === 'number') return Number.isFinite(v) ? v : 0;
  let s = String(v ?? '').trim();
  if (!s) return 0;
  const neg = /^\(.*\)$/.test(s) || /^-/.test(s);
  s = s.replace(/[(),，¥￥$\s元件]/g, '').replace(/^-/, '');
  const n = Number(s);
  return Number.isFinite(n) ? (neg ? -n : n) : 0;
}

export function toDate(v: unknown): string {
  if (v == null || v === '') return '';
  if (typeof v === 'number' && v > 20000 && v < 80000) {
    const d = new Date(Math.round((v - 25569) * 86400 * 1000));
    return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}-${String(d.getUTCDate()).padStart(2, '0')}`;
  }
  if (v instanceof Date && !Number.isNaN(v.getTime())) return `${v.getFullYear()}-${String(v.getMonth() + 1).padStart(2, '0')}-${String(v.getDate()).padStart(2, '0')}`;
  const m = /(\d{4})\s*[-/.年]\s*(\d{1,2})\s*[-/.月]\s*(\d{1,2})/.exec(String(v));
  return m ? `${m[1]}-${m[2].padStart(2, '0')}-${m[3].padStart(2, '0')}` : '';
}

export interface ParsedRows<T> { rows: T[]; skipped: number; mapping: Record<string, string> }

export function parseSales(headers: string[], raw: Array<Record<string, unknown>>): ParsedRows<BaSaleRow> {
  const c = detectColumns(headers, ['date', 'orderNo', 'sku', 'name', 'category', 'qty', 'amount', 'cost', 'channel']);
  const missing = ['date', 'amount'].filter((r) => !c[r]);
  if (missing.length) throw new Error(i18nT('销售表里没找到这些列：{p0}。表头是：{p1}', { p0: missing.map((m) => (m === 'date' ? i18nT('日期') : i18nT('金额'))).join('、'), p1: headers.slice(0, 20).join(' / ') }));
  const rows: BaSaleRow[] = [];
  let skipped = 0;
  let lastDate = '';
  let lastOrder = '';
  raw.forEach((r, i) => {
    const date = toDate(r[c.date]) || lastDate;
    const amount = toNumber(r[c.amount]);
    if (!date || (!amount && !toNumber(c.qty ? r[c.qty] : 0))) { skipped++; return; }
    const orderNo = String((c.orderNo && r[c.orderNo]) || '').trim() || lastOrder || `row-${i + 1}`;
    lastDate = date;
    lastOrder = orderNo;
    const qtyRaw = c.qty ? toNumber(r[c.qty]) : 0;
    rows.push({
      date, orderNo,
      sku: String((c.sku && r[c.sku]) || '').trim(),
      name: String((c.name && r[c.name]) || '').trim(),
      category: String((c.category && r[c.category]) || '').trim(),
      qty: qtyRaw || (amount < 0 ? -1 : 1),
      amount: round2(amount),
      cost: c.cost && String(r[c.cost] ?? '').trim() !== '' ? round2(toNumber(r[c.cost])) : null,
      channel: String((c.channel && r[c.channel]) || '').trim() || i18nT('门店'),
    });
  });
  return { rows, skipped, mapping: Object.fromEntries(Object.entries(c).filter(([, v]) => v)) };
}

export function parseExpenses(headers: string[], raw: Array<Record<string, unknown>>): ParsedRows<BaExpenseRow> {
  const c = detectColumns(headers, ['date', 'item', 'expense']);
  const missing = ['date', 'expense'].filter((r) => !c[r]);
  if (missing.length) throw new Error(i18nT('费用表里没找到这些列：{p0}。表头是：{p1}', { p0: missing.map((m) => (m === 'date' ? i18nT('日期') : i18nT('金额'))).join('、'), p1: headers.slice(0, 20).join(' / ') }));
  const rows: BaExpenseRow[] = [];
  let skipped = 0;
  for (const r of raw) {
    // 月度费用表常写「2026-09」：按当月 1 日记
    const rawDate = r[c.date];
    const ym = /(\d{4})\s*[-/.年]\s*(\d{1,2})\s*月?\s*$/.exec(String(rawDate ?? '').trim());
    const date = toDate(rawDate) || (ym ? `${ym[1]}-${ym[2].padStart(2, '0')}-01` : '');
    const amount = toNumber(r[c.expense]);
    if (!date || !amount) { skipped++; continue; }
    rows.push({ date, item: String((c.item && r[c.item]) || '').trim() || i18nT('其他'), amount: round2(Math.abs(amount)) });
  }
  return { rows, skipped, mapping: Object.fromEntries(Object.entries(c).filter(([, v]) => v)) };
}

export interface InventoryRow { sku: string; name: string; size: string; stock: number }

/** 库存快照（收银 / 进销存导出的「货号 × 尺码 × 库存」表） */
export function parseInventory(headers: string[], raw: Array<Record<string, unknown>>): ParsedRows<InventoryRow> {
  const c = detectColumns(headers, ['sku', 'name', 'size', 'stock']);
  const missing: string[] = [];
  if (!c.sku && !c.name) missing.push(i18nT('货号或商品名称'));
  if (!c.stock) missing.push(i18nT('库存'));
  if (missing.length) throw new Error(i18nT('库存表里没找到这些列：{p0}。表头是：{p1}', { p0: missing.join('、'), p1: headers.slice(0, 20).join(' / ') }));
  const rows: InventoryRow[] = [];
  let skipped = 0;
  for (const r of raw) {
    const sku = String((c.sku && r[c.sku]) || '').trim();
    const name = String((c.name && r[c.name]) || '').trim();
    const stockRaw = String(r[c.stock] ?? '').trim();
    if ((!sku && !name) || stockRaw === '' || !Number.isFinite(toNumber(stockRaw))) { skipped++; continue; }
    rows.push({ sku, name, size: String((c.size && r[c.size]) || '').trim().toUpperCase() || 'F', stock: Math.max(0, Math.round(toNumber(stockRaw))) });
  }
  return { rows, skipped, mapping: Object.fromEntries(Object.entries(c).filter(([, v]) => v)) };
}

/** 库存快照 → 商品库各款的尺码库存（按货号优先、其次名称匹配；对不上的列出来） */
export function applyInventory(garments: ApGarment[], rows: InventoryRow[]): { updates: Array<{ id: string; stock: Record<string, number> }>; unmatched: string[] } {
  const acc = new Map<string, Record<string, number>>();
  const unmatched = new Set<string>();
  for (const r of rows) {
    const g = garments.find((x) => (r.sku && x.sku && x.sku === r.sku)) || garments.find((x) => r.name && x.name === r.name);
    if (!g) { unmatched.add(r.sku || r.name); continue; }
    const st = acc.get(g.id) || {};
    st[r.size] = (st[r.size] || 0) + r.stock;
    acc.set(g.id, st);
  }
  return { updates: [...acc].map(([id, stock]) => ({ id, stock })), unmatched: [...unmatched] };
}

// ── 指标 ─────────────────────────────────────────

export function shiftDate(day: string, deltaDays: number): string {
  const d = new Date(`${day}T00:00:00`);
  d.setDate(d.getDate() + deltaDays);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function daysBetween(from: string, to: string): number {
  return Math.round((Date.parse(`${to}T00:00:00`) - Date.parse(`${from}T00:00:00`)) / 86_400_000) + 1;
}

function group(rows: BaSaleRow[], key: (r: BaSaleRow) => string, total: number): BaMetricRow[] {
  const m = new Map<string, number>();
  for (const r of rows) { const k = key(r) || i18nT('未分类'); m.set(k, (m.get(k) || 0) + r.amount); }
  return [...m].map(([k, v]) => ({ key: k, label: k, value: round2(v), share: ratio(v, total) })).sort((a, b) => b.value - a.value);
}

function core(sales: BaSaleRow[], expenses: BaExpenseRow[], from: string, to: string) {
  const inRange = sales.filter((r) => r.date >= from && r.date <= to);
  const pos = inRange.filter((r) => r.amount > 0);
  const neg = inRange.filter((r) => r.amount < 0);
  const revenue = round2(pos.reduce((s, r) => s + r.amount, 0));
  const refunds = round2(-neg.reduce((s, r) => s + r.amount, 0));
  const netRevenue = round2(revenue - refunds);
  const withCost = inRange.filter((r) => r.cost != null);
  const cost = round2(withCost.reduce((s, r) => s + (r.amount < 0 ? -Math.abs(r.cost!) : r.cost!), 0));
  const coveredRevenue = round2(withCost.reduce((s, r) => s + r.amount, 0));
  const grossProfit = round2(coveredRevenue - cost);
  const orders = new Set(pos.map((r) => r.orderNo)).size;
  const units = pos.reduce((s, r) => s + Math.max(0, r.qty), 0) - neg.reduce((s, r) => s + Math.abs(r.qty), 0);
  const exp = round2(expenses.filter((e) => e.date >= from && e.date <= to).reduce((s, e) => s + e.amount, 0));
  return { inRange, revenue, refunds, netRevenue, cost, coveredRevenue, grossProfit, orders, units, exp };
}

/**
 * 经营指标（口径写在 docs/biz-automation-workbench.md「D」）。
 * 毛利只按带成本的销售算，costCoverage 标出覆盖比例，缺成本时界面提示而不是拿 0 当成本。
 */
export function computeMetrics(sales: BaSaleRow[], expenses: BaExpenseRow[], garments: ApGarment[], from: string, to: string): BaMetrics {
  const c = core(sales, expenses, from, to);
  const len = Math.max(1, daysBetween(from, to));
  const pf = shiftDate(from, -len);
  const pt = shiftDate(from, -1);
  const p = core(sales, expenses, pf, pt);
  const itemRows = group(c.inRange, (r) => r.name || r.sku, c.netRevenue).slice(0, 10);
  // 单件平均成本（按全部带成本的销售行估算），用于库存金额与款式毛利
  const unitCostOf = (match: (r: BaSaleRow) => boolean): number | null => {
    const rows = sales.filter((r) => match(r) && r.cost != null && r.qty > 0);
    const q = rows.reduce((s, r) => s + r.qty, 0);
    return q > 0 ? rows.reduce((s, r) => s + (r.cost as number), 0) / q : null;
  };
  const matchG = (g: ApGarment) => (r: BaSaleRow) => (!!g.sku && r.sku === g.sku) || (!!r.name && r.name === g.name);
  let inventoryValue: number | null = null;
  for (const g of garments) {
    const stock = Object.values(g.stock || {}).reduce((s, n) => s + (Number(n) || 0), 0);
    if (!stock) continue;
    const uc = unitCostOf(matchG(g));
    if (uc == null) continue;
    inventoryValue = (inventoryValue || 0) + stock * uc;
  }
  const dailyCost = c.cost / len;
  // 款式排行：销量、销售额、毛利（有成本才算）、售罄率（能对上商品库才算）
  const byItem = new Map<string, BaSaleRow[]>();
  for (const r of c.inRange) { const k = r.name || r.sku || i18nT('未命名'); byItem.set(k, [...(byItem.get(k) || []), r]); }
  const items = [...byItem].map(([k, rows]) => {
    const qty = rows.reduce((s, r) => s + r.qty, 0);
    const amount = round2(rows.reduce((s, r) => s + r.amount, 0));
    const withCost = rows.filter((r) => r.cost != null);
    const gp = withCost.length === rows.length ? round2(amount - withCost.reduce((s, r) => s + (r.amount < 0 ? -Math.abs(r.cost!) : r.cost!), 0)) : null;
    const g = garments.find((x) => x.name === k || (!!x.sku && rows.some((r) => r.sku === x.sku)));
    const stock = g ? Object.values(g.stock || {}).reduce((s, n) => s + (Number(n) || 0), 0) : null;
    return { key: k, label: k, qty, amount, grossProfit: gp, sellThrough: stock == null || qty <= 0 ? null : ratio(qty, qty + stock) };
  }).sort((a, b) => b.amount - a.amount);
  const daily: BaMetrics['daily'] = [];
  for (let i = 0; i < len && i < 400; i++) {
    const day = shiftDate(from, i);
    const rows = c.inRange.filter((r) => r.date === day);
    daily.push({ day, netRevenue: round2(rows.reduce((s, r) => s + r.amount, 0)), orders: new Set(rows.filter((r) => r.amount > 0).map((r) => r.orderNo)).size });
  }
  const slowMovers = garments.map((g) => {
    const stock = Object.values(g.stock || {}).reduce((s, n) => s + (Number(n) || 0), 0);
    const qty = c.inRange.filter(matchG(g)).reduce((s, r) => s + r.qty, 0);
    return { key: g.id, label: g.name, stock, qty };
  }).filter((x) => x.stock > 0 && x.qty <= 1).sort((a, b) => b.stock - a.stock).slice(0, 20);
  const allDays = sales.map((r) => r.date).sort();
  // 售罄率：商品库里能按货号 / 名称对上的款
  const sellThrough: BaMetricRow[] = [];
  for (const g of garments) {
    const sold = c.inRange.filter((r) => (g.sku && r.sku === g.sku) || (!!r.name && r.name === g.name)).reduce((s, r) => s + r.qty, 0);
    if (sold <= 0) continue;
    const stock = Object.values(g.stock || {}).reduce((s, n) => s + (Number(n) || 0), 0);
    sellThrough.push({ key: g.id, label: g.name, value: ratio(sold, sold + stock) });
  }
  sellThrough.sort((a, b) => b.value - a.value);
  return {
    from, to,
    revenue: c.revenue,
    refunds: c.refunds,
    netRevenue: c.netRevenue,
    cost: c.cost,
    costCoverage: ratio(c.coveredRevenue, c.netRevenue),
    grossProfit: c.grossProfit,
    grossMargin: ratio(c.grossProfit, c.coveredRevenue),
    orders: c.orders,
    units: c.units,
    avgOrderValue: c.orders ? round2(c.netRevenue / c.orders) : 0,
    unitsPerOrder: c.orders ? Math.round((c.units / c.orders) * 100) / 100 : 0,
    expenses: c.exp,
    netProfit: round2(c.grossProfit - c.exp),
    expenseRate: ratio(c.exp, c.netRevenue),
    byChannel: group(c.inRange, (r) => r.channel, c.netRevenue),
    byCategory: group(c.inRange, (r) => r.category, c.netRevenue),
    topItems: itemRows,
    sellThrough: sellThrough.slice(0, 10),
    prev: p.inRange.length ? { revenue: p.netRevenue, grossProfit: p.grossProfit, orders: p.orders, avgOrderValue: p.orders ? round2(p.netRevenue / p.orders) : 0 } : undefined,
    inventoryValue: inventoryValue == null ? null : round2(inventoryValue),
    turnoverDays: inventoryValue != null && dailyCost > 0 ? Math.round((inventoryValue / dailyCost) * 10) / 10 : null,
    items,
    daily,
    slowMovers,
    lastDataDay: allDays[allDays.length - 1] || '',
  };
}

/** 报表期：daily = 昨天；weekly = 上周一到周日；monthly = 上月 */
export function reportPeriod(kind: 'daily' | 'weekly' | 'monthly', now = new Date()): { from: string; to: string } {
  const fmt = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  if (kind === 'daily') { const y = new Date(today); y.setDate(y.getDate() - 1); return { from: fmt(y), to: fmt(y) }; }
  if (kind === 'weekly') {
    const dow = (today.getDay() + 6) % 7; // 周一 = 0
    const lastMon = new Date(today); lastMon.setDate(today.getDate() - dow - 7);
    const lastSun = new Date(lastMon); lastSun.setDate(lastMon.getDate() + 6);
    return { from: fmt(lastMon), to: fmt(lastSun) };
  }
  const first = new Date(today.getFullYear(), today.getMonth() - 1, 1);
  const last = new Date(today.getFullYear(), today.getMonth(), 0);
  return { from: fmt(first), to: fmt(last) };
}

/** 交给模型写解读的「事实清单」：只许引用这里的数字 */
export function metricsFacts(m: BaMetrics): string[] {
  const pct = (v: number) => `${(v * 100).toFixed(1)}%`;
  const out = [
    `period: ${m.from} ~ ${m.to}`,
    `netRevenue: ${m.netRevenue}`, `revenue: ${m.revenue}`, `refunds: ${m.refunds}`,
    `grossProfit: ${m.grossProfit}`, `grossMargin: ${pct(m.grossMargin)}`, `costCoverage: ${pct(m.costCoverage)}`,
    `orders: ${m.orders}`, `units: ${m.units}`, `avgOrderValue: ${m.avgOrderValue}`, `unitsPerOrder: ${m.unitsPerOrder}`,
    `expenses: ${m.expenses}`, `netProfit: ${m.netProfit}`, `expenseRate: ${pct(m.expenseRate)}`,
  ];
  if (m.prev) out.push(`prev.netRevenue: ${m.prev.revenue}`, `prev.grossProfit: ${m.prev.grossProfit}`, `prev.orders: ${m.prev.orders}`, `prev.avgOrderValue: ${m.prev.avgOrderValue}`);
  if (m.prev?.revenue) out.push(`netRevenueChange: ${pct((m.netRevenue - m.prev.revenue) / m.prev.revenue)}`);
  if (m.inventoryValue != null) out.push(`inventoryValue: ${m.inventoryValue}`);
  if (m.turnoverDays != null) out.push(`inventoryTurnoverDays: ${m.turnoverDays}`);
  m.items.slice(0, 5).forEach((r, i) => out.push(`item${i + 1} ${r.label}: qty ${r.qty}, amount ${r.amount}${r.grossProfit != null ? `, grossProfit ${r.grossProfit}` : ''}`));
  if (m.slowMovers.length) out.push(`slowMovers: ${m.slowMovers.slice(0, 5).map((x) => `${x.label}(stock ${x.stock}, sold ${x.qty})`).join('; ')}`);
  m.byChannel.slice(0, 5).forEach((r) => out.push(`channel ${r.label}: ${r.value} (${pct(r.share || 0)})`));
  m.byCategory.slice(0, 6).forEach((r) => out.push(`category ${r.label}: ${r.value} (${pct(r.share || 0)})`));
  m.topItems.slice(0, 5).forEach((r, i) => out.push(`top${i + 1} ${r.label}: ${r.value}`));
  m.sellThrough.slice(0, 5).forEach((r) => out.push(`sellThrough ${r.label}: ${pct(r.value)}`));
  return out;
}

/**
 * 解读回核：抽出文本里的数字（含 12.3%、1.2万、3,450 元），与事实清单里的数字比对（容许 0.5% 误差与四舍五入）。
 * 日期、时段、排名序号这类不算。返回找不到来源的数字原文。
 */
export function unverifiedNumbers(text: string, m: BaMetrics): string[] {
  const allowed: number[] = [];
  const pushAll = (v: number) => { if (Number.isFinite(v)) allowed.push(v, v * 100, Math.abs(v)); };
  for (const f of metricsFacts(m)) for (const n of f.match(/-?\d+(?:\.\d+)?/g) || []) pushAll(Number(n));
  if (m.prev?.revenue) pushAll(m.netRevenue - m.prev.revenue);
  if (m.prev) { pushAll(m.grossProfit - m.prev.grossProfit); pushAll(m.orders - m.prev.orders); }
  const out: string[] = [];
  const cleaned = String(text || '')
    .replace(/\d{4}[-/年.]\d{1,2}[-/月.]\d{1,2}日?/g, ' ')
    .replace(/\d{1,2}\s*[月]\s*\d{1,2}\s*[日号]?/g, ' ')
    .replace(/\d{1,2}:\d{2}/g, ' ');
  const re = /(-?\d[\d,]*(?:\.\d+)?)\s*(万|%|％)?/g;
  let mm: RegExpExecArray | null;
  while ((mm = re.exec(cleaned))) {
    const raw = mm[0].trim();
    let v = Number(mm[1].replace(/,/g, ''));
    if (!Number.isFinite(v)) continue;
    if (mm[2] === '万') v *= 10_000;
    // 小整数（第 1、Top 3、3 个品类）不算数据引用
    if (!mm[2] && Number.isInteger(v) && Math.abs(v) <= 10) continue;
    const ok = allowed.some((a) => {
      const tol = Math.max(0.051, Math.abs(a) * 0.005);
      if (Math.abs(a - v) <= tol) return true;
      return mm![2] === '万' && Math.abs(a - v) <= Math.max(500, Math.abs(a) * 0.01);
    });
    if (!ok && !out.includes(raw)) out.push(raw);
  }
  return out;
}

// ── 上下架规则 ─────────────────────────────────────

export function evaluateRules(garments: ApGarment[], settings: Pick<BaSettings, 'seasonMonths' | 'coreSizes'>, stats: ApStats | null, now = new Date()): BaRuleHit[] {
  const hits: BaRuleHit[] = [];
  const month = now.getMonth() + 1;
  const core = settings.coreSizes.map((s) => s.toUpperCase());
  for (const g of garments) {
    const sizes = Object.keys(g.stock || {});
    if (!sizes.length) continue;
    const total = sizes.reduce((s, k) => s + (Number(g.stock[k]) || 0), 0);
    if (total <= 0) {
      hits.push({ garmentId: g.id, rule: 'soldout', action: 'delist', options: ['delist', 'presale'], detail: i18nT('全部尺码库存为 0') });
      continue;
    }
    const brokenCore = core.filter((s) => s in g.stock && (Number(g.stock[s]) || 0) <= 0);
    if (brokenCore.length) hits.push({ garmentId: g.id, rule: 'broken_size', action: 'remind', options: ['remind', 'delist_color', 'badge_sale'], detail: i18nT('主力尺码缺货：{p0}', { p0: brokenCore.join('、') }) });
    const months = settings.seasonMonths[g.season];
    if (g.season && Array.isArray(months) && months.length && !months.includes(month)) {
      hits.push({ garmentId: g.id, rule: 'off_season', action: 'remind', options: ['remind', 'delist', 'clearance'], detail: i18nT('「{p0}」款，当前 {m} 月不在在售月份', { p0: g.season, m: month }) });
    }
    if (stats?.lagging.includes(g.id)) hits.push({ garmentId: g.id, rule: 'lagging', action: 'swap_image', options: ['swap_image', 'remind'], detail: i18nT('试穿多、成交少：建议换成试穿最多的造型图做主图') });
  }
  return hits;
}

export function defaultSeasonMonths(): Record<string, number[]> {
  return {
    [i18nT('春')]: [2, 3, 4, 5],
    [i18nT('夏')]: [5, 6, 7, 8, 9],
    [i18nT('秋')]: [8, 9, 10, 11],
    [i18nT('冬')]: [11, 12, 1, 2],
    [i18nT('四季')]: [],
  };
}

// ── 合规自检 ─────────────────────────────────────

const BANNED_WORDS = (BANNED as { words: string[]; patterns: string[] }).words;
const BANNED_PATTERNS = (BANNED as { words: string[]; patterns: string[] }).patterns.map((p) => new RegExp(p, 'g'));

export function bannedHits(text: string): string[] {
  const s = String(text || '');
  const out = new Set<string>();
  for (const w of BANNED_WORDS) if (s.includes(w)) out.add(w);
  for (const re of BANNED_PATTERNS) for (const m of s.match(re) || []) out.add(m);
  return [...out];
}

/** 讲稿里的【待补充】占位 */
export function placeholders(text: string): string[] {
  return [...String(text || '').matchAll(/【待补充[^】]*】/g)].map((m) => m[0]);
}

/** 文案里出现、但不在「允许的数字」里的价格 / 折扣（促销信息只许来自人填的 brief 与商品价格） */
export function strayPrices(text: string, allowedText: string, prices: number[]): string[] {
  const allowed = new Set<string>([...(allowedText.match(/\d+(?:\.\d+)?/g) || []), ...prices.map((p) => String(p)), ...prices.map((p) => String(Math.round(p)))]);
  const out: string[] = [];
  for (const m of String(text || '').matchAll(/(?:¥|￥)?(\d+(?:\.\d+)?)\s*(元|折|块|%|％)/g)) {
    if (!allowed.has(m[1]) && !out.includes(m[0])) out.push(m[0]);
  }
  for (const m of String(text || '').matchAll(/[¥￥](\d+(?:\.\d+)?)/g)) {
    if (!allowed.has(m[1]) && !out.includes(m[0])) out.push(m[0]);
  }
  return out;
}

export function clampTitle(s: string, max: number): string {
  const t = String(s || '').replace(/\s+/g, ' ').trim();
  return t.length > max ? t.slice(0, max) : t;
}

/** "HH:MM" 到点判定：当前时刻已过设定时间，且今天还没跑过 */
export function dueToday(time: string, lastRunDay: string | undefined, now = new Date()): boolean {
  const m = /^(\d{1,2}):(\d{2})$/.exec(String(time || ''));
  if (!m) return false;
  const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  if (lastRunDay === today) return false;
  return now.getHours() * 60 + now.getMinutes() >= Number(m[1]) * 60 + Number(m[2]);
}

/**
 * 启动时把上次没跑完的成片收成失败。
 *
 * 成片（短视频 ffmpeg / 数字人云端轮询）是主进程内存里的一次 await；应用崩溃 / 被杀 / 重启后
 * 磁盘上留着 status='rendering'，没有任何东西再把它改回来 —— 界面上这一步永远转圈、
 * 「开始成片」按钮永远禁用（2026-10-13 用户反馈「等 10 分钟都没变化」的一个来源）。
 * 从磁盘载入那一刻还在 rendering 的，一定是上一次进程留下的，统一标成失败并给出人话原因，
 * 让「重新成片」可点。返回改了几条，供调用方决定要不要落盘 / 记日志。
 */
export function resetStaleRendering(
  s: { videos: Array<Pick<BaVideoProject, 'status' | 'error' | 'updatedAt'>>; avatars: Array<Pick<BaAvatarProject, 'status' | 'error' | 'updatedAt'>> },
  reason: string,
  now = new Date(),
): number {
  let n = 0;
  const at = now.toISOString();
  for (const v of s.videos) {
    if (v.status !== 'rendering') continue;
    v.status = 'failed'; v.error = reason; v.updatedAt = at; n += 1;
  }
  for (const a of s.avatars) {
    if (a.status !== 'rendering') continue;
    a.status = 'failed'; a.error = reason; a.updatedAt = at; n += 1;
  }
  return n;
}

// ── 历史记录 ───────────────────────────────────────

/** 节点留痕最多保留多少条（单个视频项目） */
export const VIDEO_HISTORY_MAX = 120;

/** 追加一条节点留痕（按时间先后，超出上限丢最早的） */
export function appendVideoEvent(history: BaVideoEvent[] | undefined, step: BaVideoStep, text: string, ok = true, now = new Date()): BaVideoEvent[] {
  return [...(history || []), { at: now.toISOString(), step, text, ok }].slice(-VIDEO_HISTORY_MAX);
}

/**
 * 发布工作流结束后回写的结果 → 一条发布记录。
 *
 * 回执节点（workflow.ipc 的 receipt 阶段）区分 published / unconfirmed / failed，
 * 这里只认 published 为「发出去了」；unconfirmed 是提交了但没读到成功特征，要人工核对，不能算成已发布。
 * 工作流在回执节点之前失败 / 取消时没有回执，整条记为未发布。
 */
export function publishRunFromWorkflow(input: {
  kind: string; runId?: string; receipt?: unknown; platforms: string[]; videoFile?: string; at?: number | string;
}): BaPublishRun {
  const at = new Date(input.at ?? Date.now());
  const r = (input.receipt && typeof input.receipt === 'object' ? input.receipt : {}) as Record<string, any>;
  const receipts: BaPublishReceipt[] = (Array.isArray(r.receipts) ? r.receipts : []).map((x: any) => ({
    platform: String(x?.platform || ''),
    status: String(x?.status || ''),
    ...(x?.url || x?.postUrl || x?.link ? { url: String(x.url || x.postUrl || x.link) } : {}),
    ...(x?.error || x?.message ? { error: String(x.error || x.message) } : {}),
  })).filter((x: BaPublishReceipt) => x.platform);
  const outcome: BaPublishRun['outcome'] = input.kind === 'run:completed' ? 'completed' : input.kind === 'run:cancelled' ? 'cancelled' : 'failed';
  const pick = (st: string) => receipts.filter((x) => x.status === st).map((x) => x.platform);
  const published = outcome === 'completed' ? pick('published') : [];
  const unconfirmed = outcome === 'completed' ? pick('unconfirmed') : [];
  const reported = new Set(receipts.map((x) => x.platform));
  // 没给回执的平台（工作流中途失败 / 取消、回执缺项）一律算失败，不让它在列表里「消失」
  const failed = [...pick('failed'), ...input.platforms.filter((p) => !reported.has(p) || outcome !== 'completed')]
    .filter((p, i, a) => a.indexOf(p) === i && !published.includes(p) && !unconfirmed.includes(p));
  return {
    at: Number.isNaN(at.getTime()) ? new Date().toISOString() : at.toISOString(),
    ...(input.runId ? { runId: input.runId } : {}),
    outcome, published, unconfirmed, failed, receipts,
    ...(input.videoFile ? { videoFile: input.videoFile } : {}),
  };
}
