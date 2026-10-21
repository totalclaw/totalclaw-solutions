/**
 * E1 现金管理 / E2 资金头寸（纯函数）：
 *   cashPosition   资金日报：网银 / 账面 / 资金系统三方核对、可用余额、安全线；
 *   cashForecast   13 周现金预测：资金计划 + 应收应付到期，乐观 / 基准 / 悲观三情景（确定流量不调整），缺口与集中度；
 *   paymentPlan    付款计划草稿：P0–P4 分级排程，红线（个人账户、收款账户变更）暂停核实。**只出计划，不付款。**
 * 规则来源：finance-skills cash-management（cash-position-monitoring / cash-flow-forecasting / payment-scheduling-cm 与判断框架）。
 */
import { i18nKey } from '@totalclaw/i18n';
import type {
  FauCashAccountCheck, FauCashForecast, FauCashPosition, FauCashScenarioId, FauFlowCertainty, FauForecastLine, FauForecastScenario,
  FauMsg, FauPayPriority, FauPaymentLine, FauPaymentPlan,
} from '@totalclaw/ipc-contracts';
import { FAU_PAY_PRIORITIES } from '@totalclaw/ipc-contracts';
import type { BankBalanceRow, CashPlanRow, CreditFacilityRow, PaymentRequestRow } from './types';
import type { OpenItemRow } from '../../subledgerTypes';
import { dueDateOf } from '../accounting/ar/engine';
import { addDays, daysBetween, sum } from './common';
import KW from './keywords.json';

type Th = Record<string, number>;

const isLocal = (cur: string, local: string) => !cur || cur === local;

export function cashPosition(rows: BankBalanceRow[], local: string, asOfFallback: string, th: Th): FauCashPosition {
  const accounts: FauCashAccountCheck[] = rows.map((r) => {
    const vals = [r.bankBalance, r.bookBalance, r.systemBalance].filter((v): v is number => v != null);
    const maxDiff = vals.length ? Math.max(...vals) - Math.min(...vals) : 0;
    const status = vals.length < 2 ? 'watch' : maxDiff === 0 ? 'ok' : maxDiff < th['daily.minorDiffMax'] ? 'watch' : 'breach';
    const available = r.bankBalance - r.restricted;
    return {
      row: r.row, account: r.account, bank: r.bank, entity: r.entity, currency: r.currency || local,
      bankBalance: r.bankBalance, bookBalance: r.bookBalance, systemBalance: r.systemBalance, sources: vals.length, maxDiff, status,
      restricted: r.restricted, available, safetyLine: r.safetyLine, belowSafety: r.safetyLine != null && available < r.safetyLine,
    };
  });
  const loc = accounts.filter((a) => isLocal(a.currency, local));
  const dates = rows.map((r) => r.date).filter(Boolean).sort();
  return {
    asOf: dates[dates.length - 1] || asOfFallback,
    accounts,
    totals: {
      bank: sum(loc.map((a) => a.bankBalance)),
      book: sum(loc.map((a) => a.bookBalance ?? a.bankBalance)),
      system: sum(loc.map((a) => a.systemBalance ?? a.bankBalance)),
      available: sum(loc.map((a) => a.available)),
    },
    foreignAccounts: accounts.length - loc.length,
  };
}

/** 资金日报的升级 / 提醒：差异超门槛、低于安全线 */
export function positionEscalations(p: FauCashPosition, th: Th): FauMsg[] {
  const out: FauMsg[] = [];
  for (const a of p.accounts) {
    if (a.sources >= 2 && a.maxDiff > th['daily.diffEscalate']) out.push({ key: i18nKey('账户 {p0} 三方余额差异 {p1}，超过升级门槛'), params: { p0: a.account, p1: (a.maxDiff / 100).toFixed(2) } });
    if (a.belowSafety) out.push({ key: i18nKey('账户 {p0} 可用余额低于安全线'), params: { p0: a.account } });
  }
  return out;
}

const SCEN: FauCashScenarioId[] = ['optimistic', 'base', 'pessimistic'];

export function cashForecast(inp: {
  opening: number; asOf: string; plan: CashPlanRow[]; ar: OpenItemRow[]; ap: OpenItemRow[]; facilities: CreditFacilityRow[] | null; th: Th;
}): FauCashForecast {
  const { th } = inp;
  const W = Math.max(1, Math.round(th['forecast.weeks'] || 13));
  const start = addDays(inp.asOf, 1);
  const weekOf = (date: string): number | null => {
    if (!date) return 0;
    const d = daysBetween(start, date);
    if (d < 0) return 0; // 已逾期：放进第 1 周
    const w = Math.floor(d / 7);
    return w < W ? w : null;
  };
  const lines = new Map<string, FauForecastLine & { dir: 'in' | 'out' }>();
  const byParty = new Map<string, number>();
  let beyond = 0;
  const add = (source: FauForecastLine['source'], category: string, certainty: FauFlowCertainty, dir: 'in' | 'out', date: string, amount: number, party: string) => {
    if (!amount) return;
    const w = weekOf(date);
    if (w === null) { beyond += 1; return; }
    const id = `${source}:${category}:${certainty}:${dir}`;
    const l = lines.get(id) || { id, category, source, certainty, dir, weeks: Array(W).fill(0), total: 0 };
    const signed = dir === 'in' ? amount : -amount;
    l.weeks[w] += signed;
    l.total += signed;
    lines.set(id, l);
    if (dir === 'in' && party) byParty.set(party, (byParty.get(party) || 0) + amount);
  };
  for (const r of inp.plan) {
    add('plan', r.category, r.certainty, 'in', r.date, r.inflow, r.counterparty);
    add('plan', r.category, r.certainty, 'out', r.date, r.outflow, r.counterparty);
  }
  for (const r of inp.ar) {
    const due = dueDateOf(r, null);
    add('ar', '', due && due < start ? 'possible' : 'expected', 'in', due, r.open, r.party);
  }
  for (const r of inp.ap) {
    const due = dueDateOf(r, null);
    add('ap', '', due && due < start ? 'committed' : 'expected', 'out', due, r.open, r.party);
  }
  const all = [...lines.values()];
  const factors: Record<FauCashScenarioId, [number, number]> = {
    optimistic: [th['forecast.optInFactor'], th['forecast.optOutFactor']],
    base: [1, 1],
    pessimistic: [th['forecast.pesInFactor'], th['forecast.pesOutFactor']],
  };
  const scenarios: FauForecastScenario[] = SCEN.map((id) => {
    const [fi, fo] = factors[id];
    let bal = inp.opening;
    const weeks = Array.from({ length: W }, (_, w) => {
      const part = (dir: 'in' | 'out', f: number) => {
        const fixed = sum(all.filter((l) => l.dir === dir && l.certainty === 'committed').map((l) => Math.abs(l.weeks[w])));
        const soft = sum(all.filter((l) => l.dir === dir && l.certainty !== 'committed').map((l) => Math.abs(l.weeks[w])));
        return fixed + Math.round(soft * f);
      };
      const inflow = part('in', fi);
      const outflow = part('out', fo);
      const opening = bal;
      bal = opening + inflow - outflow;
      const s = addDays(start, w * 7);
      return { week: w + 1, start: s, end: addDays(s, 6), opening, inflow, outflow, net: inflow - outflow, closing: bal };
    });
    const minBalance = Math.min(inp.opening, ...weeks.map((x) => x.closing));
    const first = weeks.find((x) => x.closing < 0);
    return {
      id, inFactor: fi, outFactor: fo, weeks,
      totalIn: sum(weeks.map((x) => x.inflow)), totalOut: sum(weeks.map((x) => x.outflow)), endBalance: bal,
      minBalance, firstGapWeek: first ? first.week : null, maxGap: Math.max(0, -minBalance),
    };
  });
  const base = scenarios[1];
  const gap = base.maxGap;
  const gapTier = gap <= 0 ? 'none' : gap < th['forecast.gapSmallMax'] ? 'small' : gap <= th['forecast.gapLargeMax'] ? 'large' : 'severe';
  const totalIn = sum([...byParty.values()]);
  const concentration = [...byParty.entries()].sort((a, b) => b[1] - a[1]).slice(0, 10).map(([counterparty, amount]) => {
    const share = totalIn ? amount / totalIn : 0;
    return { counterparty, amount, share, status: (share > th['forecast.concentrationBreach'] ? 'breach' : share >= th['forecast.concentrationWatch'] ? 'watch' : 'ok') as FauCashForecast['concentration'][number]['status'] };
  });
  const facilityAvailable = inp.facilities
    ? sum(inp.facilities.filter((f) => !f.expiry || f.expiry >= start).map((f) => Math.max(0, f.limit - f.used)))
    : null;
  return {
    start, opening: inp.opening, lines: all.map(({ dir: _d, ...l }) => l), scenarios, gapTier, concentration, facilityAvailable,
    financingNeed: Math.max(0, scenarios[2].maxGap - (facilityAvailable || 0)), beyond,
  };
}

export function forecastEscalations(f: FauCashForecast, th: Th): FauMsg[] {
  const out: FauMsg[] = [];
  const [, base, pes] = f.scenarios;
  if (pes.maxGap > th['forecast.pessimisticGapEscalate']) out.push({ key: i18nKey('悲观情景最大资金缺口 {p0}，超过升级门槛'), params: { p0: (pes.maxGap / 100).toFixed(2) } });
  if (base.maxGap > th['forecast.baseGapEscalate'] && base.maxGap > (f.facilityAvailable || 0)) {
    out.push({ key: i18nKey('基准情景第 {n} 周出现资金缺口 {p0}，可用授信不足以覆盖'), params: { n: base.firstGapWeek || 0, p0: (base.maxGap / 100).toFixed(2) } });
  }
  for (const c of f.concentration.filter((x) => x.status === 'breach')) out.push({ key: i18nKey('单一付款方 {p0} 占预测收款 {p1}%，资金来源过于集中'), params: { p0: c.counterparty, p1: (c.share * 100).toFixed(1) } });
  return out;
}

const PRIORITY_WORDS = (KW as unknown as { payPriority: Record<string, string[]> }).payPriority;

export function classifyPayment(r: Pick<PaymentRequestRow, 'priority' | 'category'>): { priority: FauPayPriority; source: FauPaymentLine['prioritySource'] } {
  if (r.priority) return { priority: r.priority, source: 'given' };
  const c = String(r.category || '').toLowerCase();
  for (const p of ['P0', 'P1', 'P3', 'P4'] as FauPayPriority[]) {
    if (c && PRIORITY_WORDS[p].some((w) => c.includes(w.toLowerCase()))) return { priority: p, source: 'category' };
  }
  return { priority: 'P2', source: 'default' };
}

/** 付款计划草稿：可用资金内按 P0 → P4、到期日先后排入；P0 不可延后（超出部分记缺口）；红线暂停核实不排入 */
export function paymentPlan(reqs: PaymentRequestRow[], available: number, asOf: string): FauPaymentPlan {
  const lines: FauPaymentLine[] = reqs.map((r, i) => {
    const { priority, source } = classifyPayment(r);
    const flags: FauMsg[] = [];
    let plan: FauPaymentLine['plan'] = 'schedule';
    if (r.personalAccount) { plan = 'hold'; flags.push({ key: i18nKey('收款方为个人账户：不得排入，升级财务经理') }); }
    if (r.accountChanged) { plan = 'hold'; flags.push({ key: i18nKey('收款账户变更：暂停，联系原对接人核实后再排') }); }
    if (r.dueDate && r.dueDate < asOf) flags.push({ key: i18nKey('已逾期 {n} 天'), params: { n: daysBetween(r.dueDate, asOf) } });
    return { id: r.id || `R${i + 1}`, row: r.row, payee: r.payee, amount: r.amount, dueDate: r.dueDate, category: r.category, priority, prioritySource: source, plan, cumulative: 0, flags };
  });
  const rank = (p: FauPayPriority) => FAU_PAY_PRIORITIES.indexOf(p);
  const order = lines.filter((l) => l.plan !== 'hold').sort((a, b) => rank(a.priority) - rank(b.priority) || (a.dueDate || '9999').localeCompare(b.dueDate || '9999') || a.row - b.row);
  // 严格按优先级：一旦有一笔非 P0 放不下，排在它后面的非 P0 一律延后（不拿小额低优先级去填空）
  let cum = 0;
  let blocked = false;
  for (const l of order) {
    if (l.priority === 'P0' || (!blocked && cum + l.amount <= available)) { cum += l.amount; l.plan = 'schedule'; } else { blocked = true; l.plan = 'defer'; }
    l.cumulative = cum;
  }
  const byPriority = Object.fromEntries(FAU_PAY_PRIORITIES.map((p) => [p, { count: 0, amount: 0 }])) as FauPaymentPlan['byPriority'];
  for (const l of lines) { byPriority[l.priority].count += 1; byPriority[l.priority].amount += l.amount; }
  const amt = (p: FauPaymentLine['plan']) => sum(lines.filter((l) => l.plan === p).map((l) => l.amount));
  const scheduled = amt('schedule');
  return {
    available, total: sum(lines.map((l) => l.amount)), byPriority, scheduled, deferred: amt('defer'), held: amt('hold'),
    gap: Math.max(0, scheduled - available),
    lines: [...order, ...lines.filter((l) => l.plan === 'hold')],
  };
}
