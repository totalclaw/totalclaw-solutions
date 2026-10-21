/**
 * A4 应付与三单匹配（triple-match-automation-ap + payment-scheduling + supplier-payment-review + 判断框架）。纯函数，金额一律分。
 *
 * 三单匹配（按订单号 + 行号，没有行号用物料，再没有按订单汇总）：X 订单数量、Y 收货数量、Z 发票数量；
 *   数量：Z=Y=X 完全匹配；Z=Y<X 部分交货；Z<Y 发票少于收货；Z>Y 发票多于收货（多出的不付）；Y=0 未收货（不付）；
 *   单价：差异 = (发票单价 − 订单单价) × 可结算数量 min(Y, Z)；|差异| ≤ max(订单金额 × 1%, 100 元) 容差内，差异率 ≤ 5% 需说明，> 5% 不付；
 *   税率：发票低于订单不付，高于订单需说明；
 *   可付 = 可结算数量 × 两边较低的单价（整行被判「不付」时为 0），其余暂扣。
 * 付款计划（源项目三处排序有冲突，按 payment-scheduling 的版本）：P0 已逾期 → P1 A 级战略供应商 → P2 7 天内到期（金额大的先）
 *   → P3 8–30 天到期（到期近的先）→ P4 30 天后（不排）；资金不够时按顺序排到用完为止，其余延后。只出计划草稿，不付款。
 * 供应商复核：收款账户变更、疑似个人账户、关联方、黑名单、信用代码校验位、档案缺失、同日多笔贴近审批限额（分拆嫌疑）。
 */
import { i18nKey } from '@totalclaw/i18n';
import type {
  FauApResult, FauFlag, FauGapTier, FauMatchGrade, FauMatchLine, FauMatchQty, FauMsg, FauOverdueLevel, FauPayApproval, FauPayLine, FauPayPlan,
  FauPayPriority, FauSupplierReview,
} from '@totalclaw/ipc-contracts';
import { FAU_MATCH_GRADES, FAU_PAY_PRIORITIES } from '@totalclaw/ipc-contracts';
import { checkCreditCode, looksLikeOrg } from '../../../../invoiceAgent/logic';
import type { FundsRow, OpenItemRow, PartyRow, ProcureRow } from '../../../subledgerTypes';
import { addDays, daysBetween, fmtYuan, msg } from '../common';
import { dueDateOf } from '../ar/engine';

export interface ApInput {
  asOf: string;
  items: OpenItemRow[];
  po: ProcureRow[];
  grn: ProcureRow[];
  invoices: ProcureRow[];
  suppliers: PartyRow[];
  funds: FundsRow[] | null;
  /** 往期（项目链里已签核的 A4）三单不符的供应商，最近的在前 */
  history: string[][];
  th: Record<string, number>;
  match: boolean;
  plan: boolean;
  review: boolean;
}

export const normName = (s: string) => String(s || '').replace(/[\s()（）]/g, '').toLowerCase();
const normKey = (s: string) => String(s || '').replace(/\s+/g, '').toUpperCase();
const GRADE_RANK: Record<FauMatchGrade, number> = { match: 0, within_tol: 1, review: 2, reject: 3 };
const worst = (...gs: FauMatchGrade[]): FauMatchGrade => gs.reduce((a, b) => (GRADE_RANK[b] > GRADE_RANK[a] ? b : a), 'match');

interface Agg { qty: number; value: number; rows: number[]; docs: string[]; item: string; supplier: string; tax: number | null; line: string; poNo: string }

/** 一张单的金额（不含税）：有金额用金额，否则单价 × 数量 */
const valueOf = (r: ProcureRow) => r.amount ?? (r.unitPrice != null ? r.unitPrice * r.qty : 0);

function aggregate(rows: ProcureRow[], keyOf: (r: ProcureRow) => string): Map<string, Agg> {
  const m = new Map<string, Agg>();
  for (const r of rows) {
    const k = keyOf(r);
    const a = m.get(k) || { qty: 0, value: 0, rows: [], docs: [], item: r.item, supplier: r.supplier, tax: r.taxRate, line: r.line, poNo: normKey(r.poNo || r.docNo) };
    a.qty += r.qty;
    a.value += valueOf(r);
    a.rows.push(r.row);
    if (r.docNo && !a.docs.includes(r.docNo)) a.docs.push(r.docNo);
    if (a.tax == null) a.tax = r.taxRate;
    if (!a.supplier) a.supplier = r.supplier;
    m.set(k, a);
  }
  return m;
}

export function threeWayMatch(po: ProcureRow[], grn: ProcureRow[], inv: ProcureRow[], th: Record<string, number>): { lines: FauMatchLine[]; orphanInvoices: ProcureRow[] } {
  const pctTol = th['match.pctTol'] ?? 0.01;
  const amtTol = th['match.amtTol'] ?? 10000;
  const rejectPct = th['match.rejectPct'] ?? 0.05;
  const poOf = (r: ProcureRow) => normKey(r.poNo || r.docNo);
  // 每个订单号选匹配粒度：三张单都有行号 → 按行；都有物料 → 按物料；否则按订单汇总
  const level = new Map<string, 'line' | 'item' | 'po'>();
  for (const no of new Set(po.map(poOf))) {
    const all = [...po, ...grn, ...inv].filter((r) => poOf(r) === no);
    level.set(no, all.every((r) => r.line) ? 'line' : all.every((r) => r.item) ? 'item' : 'po');
  }
  const keyOf = (r: ProcureRow) => {
    const no = poOf(r);
    const lv = level.get(no) || 'po';
    return `${no}#${lv === 'line' ? normKey(r.line) : lv === 'item' ? normKey(r.item) : ''}`;
  };
  const poAgg = aggregate(po, keyOf);
  const grnAgg = aggregate(grn, keyOf);
  const invAgg = aggregate(inv.filter((r) => level.has(poOf(r))), keyOf);
  const orphanInvoices = inv.filter((r) => !level.has(poOf(r)));
  const lines: FauMatchLine[] = [];
  for (const [key, p] of poAgg) {
    const g = grnAgg.get(key);
    const v = invAgg.get(key);
    if (!v) continue; // 未开票的不在应付里
    const X = p.qty;
    const Y = g?.qty ?? 0;
    const Z = v.qty;
    const poPrice = X ? p.value / X : 0;
    const invPrice = Z ? v.value / Z : null;
    const settle = Math.min(Y, Z);
    const flags: FauFlag[] = [];
    let qty: FauMatchQty;
    let qtyGrade: FauMatchGrade;
    if (Y === 0) { qty = 'not_received'; qtyGrade = 'reject'; flags.push({ code: 'match.not_received', level: 'block' }); }
    else if (Z > Y) { qty = 'over_invoiced'; qtyGrade = 'review'; flags.push({ code: 'match.over_invoiced', level: 'warn', params: { n: Z - Y } }); }
    else if (Z < Y) { qty = 'invoice_short'; qtyGrade = 'review'; flags.push({ code: 'match.invoice_short', level: 'warn' }); }
    else if (Y < X) { qty = 'partial'; qtyGrade = 'match'; flags.push({ code: 'match.partial', level: 'info' }); }
    else { qty = 'full'; qtyGrade = 'match'; }
    if (Y > X) flags.push({ code: 'match.over_received', level: 'warn' });
    const unitDiff = invPrice == null ? 0 : invPrice - poPrice;
    const priceDiff = Math.round(unitDiff * settle);
    const priceDiffRate = poPrice ? unitDiff / poPrice : null;
    const tol = Math.max(Math.round(poPrice * settle * pctTol), amtTol);
    let price: FauMatchGrade = 'match';
    if (Math.abs(unitDiff) > 1e-9) {
      price = Math.abs(priceDiff) <= tol ? 'within_tol' : priceDiffRate != null && Math.abs(priceDiffRate) <= rejectPct ? 'review' : 'reject';
      if (price !== 'within_tol') flags.push({ code: 'match.price', level: price === 'reject' ? 'block' : 'warn', params: { p0: `${((priceDiffRate ?? 0) * 100).toFixed(2)}%` } });
    }
    let tax: FauMatchLine['tax'] = 'unknown';
    let taxGrade: FauMatchGrade = 'match';
    if (p.tax != null && v.tax != null) {
      const pct = (x: number) => `${Math.round(x * 10000) / 100}%`;
      if (Math.abs(v.tax - p.tax) < 1e-9) tax = 'ok';
      else if (v.tax < p.tax) { tax = 'lower'; taxGrade = 'reject'; flags.push({ code: 'match.tax_lower', level: 'block', params: { p0: pct(v.tax), p1: pct(p.tax) } }); }
      else { tax = 'higher'; taxGrade = 'review'; flags.push({ code: 'match.tax_higher', level: 'warn', params: { p0: pct(v.tax), p1: pct(p.tax) } }); }
    }
    const grade = worst(qtyGrade, price, taxGrade);
    const invAmount = Math.round(v.value);
    const payable = grade === 'reject' || invPrice == null ? 0 : Math.round(settle * Math.min(poPrice, invPrice));
    lines.push({
      key, poNo: p.poNo, line: p.line, item: p.item || v.item, supplier: p.supplier || v.supplier, poQty: X, grnQty: Y, invQty: Z,
      poPrice, invPrice, poTaxRate: p.tax, invTaxRate: v.tax, poAmount: Math.round(poPrice * Y), invAmount, priceDiff, priceDiffRate,
      qty, price, tax, grade, payable, hold: Math.max(0, invAmount - payable), invoiceNos: v.docs, poRows: p.rows, grnRows: g?.rows ?? [], invRows: v.rows, flags,
    });
  }
  return { lines, orphanInvoices };
}

function approvalOf(amount: number, th: Record<string, number>): FauPayApproval {
  if (amount <= (th['plan.approvalL1'] ?? 5_000_000)) return 'l1';
  if (amount <= (th['plan.approvalL2'] ?? 20_000_000)) return 'l2';
  if (amount <= (th['plan.approvalL3'] ?? 50_000_000)) return 'l3';
  return 'l4';
}

function overdueLevelOf(days: number, th: Record<string, number>): FauOverdueLevel {
  if (days <= 0) return 'none';
  if (days <= (th['overdue.normalMax'] ?? 7)) return 'normal';
  if (days <= (th['overdue.attentionMax'] ?? 30)) return 'attention';
  if (days <= (th['overdue.warningMax'] ?? 60)) return 'warning';
  return 'high';
}

export function paymentPlan(input: ApInput, holds: Map<string, { amount: number; flag: FauFlag }>): FauPayPlan {
  const { th, asOf } = input;
  const soon = th['plan.dueSoonDays'] ?? 7;
  const horizon = th['plan.horizonDays'] ?? 30;
  const master = new Map(input.suppliers.map((s) => [normName(s.name), s]));
  const lines: FauPayLine[] = input.items.filter((i) => i.open > 0).map((i) => {
    const m = master.get(normName(i.party));
    const due = dueDateOf(i, m?.termDays ?? null) || asOf;
    const toDue = daysBetween(asOf, due);
    const overdueDays = Math.max(0, -toDue);
    const grade = (m?.grade || '').toUpperCase().slice(0, 1);
    const priority: FauPayPriority = overdueDays > 0 ? 'P0' : grade === 'A' ? 'P1' : toDue <= soon ? 'P2' : toDue <= horizon ? 'P3' : 'P4';
    const h = holds.get(`${normName(i.party)}|*`) || holds.get(`${normName(i.party)}|${normKey(i.docNo)}`);
    const hold = h ? Math.min(i.open, h.amount) : 0;
    return {
      row: i.row, supplier: i.party, docNo: i.docNo, poNo: i.poNo, dueDate: due, open: i.open, overdueDays, grade, priority,
      scheduled: false, hold, holdReason: h && hold ? h.flag : undefined, approval: approvalOf(i.open, th), overdueLevel: overdueLevelOf(overdueDays, th),
    };
  });
  const order: Record<FauPayPriority, (a: FauPayLine, b: FauPayLine) => number> = {
    P0: (a, b) => b.overdueDays - a.overdueDays || b.open - a.open,
    P1: (a, b) => a.dueDate.localeCompare(b.dueDate),
    P2: (a, b) => b.open - a.open,
    P3: (a, b) => a.dueDate.localeCompare(b.dueDate),
    P4: (a, b) => a.dueDate.localeCompare(b.dueDate),
  };
  const sorted = FAU_PAY_PRIORITIES.flatMap((p) => lines.filter((l) => l.priority === p).sort(order[p]));
  const available = input.funds ? input.funds.reduce((s, f) => s + f.balance - f.scheduled - f.frozen, 0) : null;
  let remaining = available ?? Number.POSITIVE_INFINITY;
  for (const l of sorted) {
    const payable = l.open - l.hold;
    if (l.priority === 'P4' || payable <= 0) { l.deferTo = l.priority === 'P4' ? l.dueDate : undefined; continue; }
    if (payable <= remaining) { l.scheduled = true; remaining -= payable; } else l.deferTo = l.dueDate > asOf ? l.dueDate : addDays(asOf, soon);
  }
  const due30 = lines.filter((l) => daysBetween(asOf, l.dueDate) <= horizon).reduce((s, l) => s + l.open, 0);
  const gap = available == null ? null : due30 - available;
  let gapTier: FauGapTier | null = null;
  if (gap != null) gapTier = gap <= 0 ? 'none' : gap < (th['gap.smallMax'] ?? 50_000_000) ? 'small' : gap <= (th['gap.mediumMax'] ?? 200_000_000) ? 'medium' : 'large';
  const total = lines.reduce((s, l) => s + l.open, 0);
  const bySupplier = new Map<string, number>();
  for (const l of lines) bySupplier.set(l.supplier, (bySupplier.get(l.supplier) || 0) + l.open);
  const concentration = [...bySupplier.entries()].map(([supplier, amt]) => ({ supplier, share: total ? amt / total : 0 })).sort((a, b) => b.share - a.share);
  const byPriority = Object.fromEntries(FAU_PAY_PRIORITIES.map((p) => {
    const ls = lines.filter((l) => l.priority === p);
    return [p, { count: ls.length, amount: ls.reduce((s, l) => s + l.open, 0) }];
  })) as FauPayPlan['byPriority'];
  return {
    asOf, available, due30, gap, gapTier, lines: sorted,
    scheduledTotal: sorted.filter((l) => l.scheduled).reduce((s, l) => s + l.open - l.hold, 0),
    deferredTotal: sorted.filter((l) => !l.scheduled).reduce((s, l) => s + l.open - l.hold, 0),
    heldTotal: sorted.reduce((s, l) => s + l.hold, 0),
    byPriority, concentration,
  };
}

export function supplierReview(input: ApInput, concentration: { supplier: string; share: number }[]): FauSupplierReview[] {
  const { th } = input;
  const band = th['split.band'] ?? 0.02;
  const limits = [th['plan.approvalL1'] ?? 5_000_000, th['plan.approvalL2'] ?? 20_000_000, th['plan.approvalL3'] ?? 50_000_000];
  const nearLimit = (a: number) => limits.some((l) => a < l && a >= l * (1 - band));
  const master = new Map(input.suppliers.map((s) => [normName(s.name), s]));
  const names = new Map<string, string>();
  for (const i of input.items) names.set(normName(i.party), i.party);
  for (const v of input.invoices) if (v.supplier && !names.has(normName(v.supplier))) names.set(normName(v.supplier), v.supplier);
  const maxShare = th['concentration.max'] ?? 0.3;
  return [...names.entries()].map(([key, supplier]) => {
    const m = master.get(key);
    const flags: FauFlag[] = [];
    if (!m) flags.push({ code: 'sup.not_in_master', level: 'warn' });
    else {
      if (m.prevBankAccount && m.bankAccount && m.prevBankAccount !== m.bankAccount) flags.push({ code: 'sup.account_changed', level: 'block', params: { p0: m.prevBankAccount, p1: m.bankAccount } });
      if (m.accountName && normName(m.accountName) !== normName(m.name) && !looksLikeOrg(m.accountName)) flags.push({ code: 'sup.personal_account', level: 'block', params: { p0: m.accountName } });
      if (m.blacklisted) flags.push({ code: 'sup.blacklist', level: 'block' });
      if (m.relatedParty) flags.push({ code: 'sup.related_party', level: 'warn' });
      if (/^[0-9A-Z]{18}$/.test(m.regNo) && !checkCreditCode(m.regNo)) flags.push({ code: 'sup.credit_code', level: 'warn', params: { p0: m.regNo } });
    }
    const mine = input.items.filter((i) => normName(i.party) === key);
    const byDay = new Map<string, number>();
    for (const i of mine) if (i.docDate && nearLimit(i.amount)) byDay.set(i.docDate, (byDay.get(i.docDate) || 0) + 1);
    for (const [d, n] of byDay) if (n >= 2) flags.push({ code: 'sup.split', level: 'warn', params: { n, p0: d } });
    const share = concentration.find((c) => normName(c.supplier) === key)?.share ?? 0;
    if (share > maxShare) flags.push({ code: 'sup.concentration', level: 'warn', params: { p0: `${(share * 100).toFixed(1)}%` } });
    const conclusion: FauSupplierReview['conclusion'] = flags.some((f) => f.level === 'block') ? 'hold' : flags.some((f) => f.level === 'warn') ? 'conditional' : 'approve';
    return { supplier, open: mine.reduce((s, i) => s + Math.max(0, i.open), 0), flags, conclusion };
  });
}

export function apAnalysis(input: ApInput): FauApResult {
  const { th } = input;
  const escalations: FauMsg[] = [];
  let match: FauMatchLine[] | null = null;
  let matchCounts: FauApResult['matchCounts'] = null;
  const holds = new Map<string, { amount: number; flag: FauFlag }>();
  if (input.match) {
    const r = threeWayMatch(input.po, input.grn, input.invoices, th);
    match = r.lines;
    matchCounts = Object.fromEntries(FAU_MATCH_GRADES.map((g) => [g, match!.filter((l) => l.grade === g).length])) as Record<FauMatchGrade, number>;
    // 应付明细是含税金额：暂扣按发票税率折成含税（三单里的金额都是不含税）
    // shortcut: 一行三单对应多张发票时，整行暂扣挂到每张发票（各自以未付金额为上限），逐票分摊等拿到真实样例再细化
    for (const l of match) {
      if (!l.hold) continue;
      const gross = Math.round(l.hold * (1 + (l.invTaxRate ?? 0)));
      for (const no of l.invoiceNos) {
        const k = `${normName(l.supplier)}|${normKey(no)}`;
        const cur = holds.get(k);
        holds.set(k, { amount: (cur?.amount ?? 0) + gross, flag: { code: 'plan.hold_match', level: 'warn' } });
      }
    }
    const esc = th['match.escalateDiff'] ?? 1_000_000;
    for (const l of match) {
      if (Math.abs(l.priceDiff) > esc) escalations.push(msg(i18nKey('订单 {p0} 三单金额差异 {p1}，超过升级门槛'), { p0: l.poNo, p1: fmtYuan(l.priceDiff) }));
      if (l.tax === 'lower') escalations.push(msg(i18nKey('订单 {p0} 发票税率低于订单税率'), { p0: l.poNo }));
      if (l.qty === 'over_invoiced') escalations.push(msg(i18nKey('订单 {p0} 发票数量多于收货数量'), { p0: l.poNo }));
    }
    for (const v of r.orphanInvoices) escalations.push(msg(i18nKey('发票 {p0} 没有对应的采购订单'), { p0: v.docNo }));
    // 同一供应商连续 N 次三单不符（本期 + 往期项目链里已签核的运行）
    const need = th['match.consecutive'] ?? 3;
    const bad = new Set(match.filter((l) => GRADE_RANK[l.grade] >= GRADE_RANK.review).map((l) => normName(l.supplier)));
    for (const s of bad) {
      let n = 1;
      for (const prev of input.history) { if (prev.some((x) => normName(x) === s)) n += 1; else break; }
      if (n >= need) escalations.push(msg(i18nKey('供应商 {p0} 连续 {n} 期三单不符'), { p0: match.find((l) => normName(l.supplier) === s)!.supplier, n }));
    }
  }
  let suppliers: FauSupplierReview[] = [];
  let plan: FauPayPlan | null = null;
  if (input.review || input.plan) {
    // 先排一遍算集中度，供应商复核用；复核要暂停的再挂到付款计划上
    const pre = paymentPlan(input, holds);
    if (input.review) {
      suppliers = supplierReview(input, pre.concentration);
      for (const s of suppliers.filter((x) => x.conclusion === 'hold')) {
        holds.set(`${normName(s.supplier)}|*`, { amount: Number.MAX_SAFE_INTEGER, flag: { code: 'plan.hold_supplier', level: 'block' } });
        escalations.push(msg(i18nKey('供应商 {p0} 复核未通过（{n} 项），暂停付款并书面核实'), { p0: s.supplier, n: s.flags.filter((f) => f.level === 'block').length }));
      }
    }
    if (input.plan) {
      plan = paymentPlan(input, holds);
      const late = new Map<string, number>();
      for (const l of plan.lines.filter((x) => x.overdueLevel === 'warning' || x.overdueLevel === 'high')) late.set(l.supplier, (late.get(l.supplier) || 0) + 1);
      for (const [s, n] of late) escalations.push(msg(i18nKey('供应商 {p0} 有 {n} 笔逾期超过 30 天'), { p0: s, n }));
      if (plan.gapTier === 'large') escalations.push(msg(i18nKey('30 天内资金缺口 {p0}，须升级财务总监'), { p0: fmtYuan(plan.gap || 0) }));
    }
  }
  return { asOf: input.asOf, match, matchCounts, plan, suppliers, escalations };
}
