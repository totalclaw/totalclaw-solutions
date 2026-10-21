/**
 * 预算管控智能体（纯函数）：预算额度 × 实际发生 → 各部门消耗、超预算预警、月度差异。
 *
 * 实际数优先取序时账（含本工作台审核过的凭证）；账套里还没有序时账时退回用已通过的报销单。
 * 预算类别与科目的对应：类别名出现在科目名里即算（「差旅费」对上「管理费用-差旅费」）。
 */
import { t as i18nT } from '@totalclaw/i18n';
import type { FaBudgetLine, FaBudgetRow, FaExpenseClaim, FaJournalRow } from '@totalclaw/ipc-contracts';
import { fmt, pct, plNature, round2, sum } from './common';

export const WARN_USAGE = 0.8;

interface Actual { dept: string; category: string; month: number; amount: number }

function matchesCategory(accountName: string, category: string): boolean {
  const a = String(accountName || '').replace(/\s+/g, '');
  const c = String(category || '').replace(/\s+/g, '');
  return !!c && (a === c || a.endsWith(`-${c}`) || a.includes(c));
}

export function actualsFromJournal(rows: FaJournalRow[], year: number): Actual[] {
  return rows
    .filter((r) => r.date.startsWith(String(year)) && plNature(r.accountName) === 'expense')
    .map((r) => ({ dept: r.dept || '', category: r.accountName, month: Number(r.date.slice(5, 7)), amount: round2(r.debit - r.credit) }));
}

export function actualsFromClaims(claims: FaExpenseClaim[], year: number): Actual[] {
  return claims
    .filter((c) => c.decision === 'approved' || (!c.decision && c.verdict === 'pass'))
    .flatMap((c) => c.items.filter((i) => (i.date || c.createdAt).startsWith(String(year))).map((i) => ({
      dept: c.dept, category: i.category, month: Number((i.date || c.createdAt).slice(5, 7)), amount: i.amount,
    })));
}

export function analyzeBudget(lines: FaBudgetLine[], actuals: Actual[], month: number): FaBudgetRow[] {
  return lines.map((l) => {
    const whole = !l.dept || /^(全公司|公司|合计)$/.test(l.dept);
    const hits = actuals.filter((a) => matchesCategory(a.category, l.category) && (whole || a.dept === l.dept));
    const ytdBudget = sum(l.months.slice(0, month));
    const actual = sum(hits.filter((a) => a.month <= month).map((a) => a.amount));
    const monthBudget = l.months[month - 1] || 0;
    const monthActual = sum(hits.filter((a) => a.month === month).map((a) => a.amount));
    const usage = ytdBudget > 0 ? round2((actual / ytdBudget) * 10000) / 10000 : actual > 0 ? 1 : 0;
    const level: FaBudgetRow['level'] = usage >= 1 ? 'over' : usage >= WARN_USAGE ? 'warn' : 'ok';
    return { dept: l.dept, category: l.category, budget: ytdBudget, actual, usage, monthBudget, monthActual, level };
  }).sort((a, b) => b.usage - a.usage);
}

/** 预算差异的数字底稿（模型写解读用） */
export function budgetFacts(rows: FaBudgetRow[], month: number): string {
  const over = rows.filter((r) => r.level === 'over');
  const warn = rows.filter((r) => r.level === 'warn');
  const totalB = sum(rows.map((r) => r.budget));
  const totalA = sum(rows.map((r) => r.actual));
  const lines = [
    i18nT('截至 {m} 月：预算 {a}，实际 {b}，执行率 {c}', { m: month, a: fmt(totalB), b: fmt(totalA), c: totalB ? pct(totalA / totalB) : '-' }),
    ...rows.slice(0, 20).map((r) => i18nT('{p0}/{p1}：累计预算 {a}，实际 {b}（{c}）；{m} 月预算 {d}，实际 {e}', {
      p0: r.dept, p1: r.category, a: fmt(r.budget), b: fmt(r.actual), c: pct(r.usage), m: month, d: fmt(r.monthBudget), e: fmt(r.monthActual),
    })),
  ];
  if (over.length) lines.push(i18nT('超预算：{p0}', { p0: over.map((r) => `${r.dept}/${r.category}`).join('、') }));
  if (warn.length) lines.push(i18nT('接近上限（≥80%）：{p0}', { p0: warn.map((r) => `${r.dept}/${r.category}`).join('、') }));
  return lines.join('\n');
}

/** 某笔支出发生前的预检：会不会超预算 */
export function precheckSpend(lines: FaBudgetLine[], actuals: Actual[], dept: string, category: string, amount: number, month: number): { ok: boolean; remaining: number | null; message: string } {
  const row = analyzeBudget(lines.filter((l) => matchesCategory(category, l.category) && (!l.dept || l.dept === dept || /^(全公司|公司)$/.test(l.dept))), actuals, month)[0];
  if (!row) return { ok: true, remaining: null, message: i18nT('这个类别没有编预算') };
  const remaining = round2(row.budget - row.actual);
  return remaining >= amount
    ? { ok: true, remaining, message: i18nT('预算余额 {a}，本次 {b} 后剩 {c}', { a: fmt(remaining), b: fmt(amount), c: fmt(round2(remaining - amount)) }) }
    : { ok: false, remaining, message: i18nT('超预算：余额 {a}，本次 {b}，超出 {c}', { a: fmt(remaining), b: fmt(amount), c: fmt(round2(amount - remaining)) }) };
}
