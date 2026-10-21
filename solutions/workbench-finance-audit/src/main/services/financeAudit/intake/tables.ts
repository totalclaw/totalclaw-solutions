/** 预算表、计提政策表、期末汇率表 → 行 */
import { i18nKey } from '@totalclaw/i18n';
import type { SheetTable } from '../../serviceSettlement/excel';
import type { AccrualBasis, AccrualPolicyRow, BudgetRow, FxRateRow } from '../types';
import { HEADER_OFFSET, get, issue, splitAccount, toCents, toIsoDate, toNum, toPeriod, type ParseResult } from './common';
import POLICY_WORDS from './policyWords.json';

export function parseBudget(t: SheetTable, mp: Record<string, string>, period: string): ParseResult<'budget'> {
  const rows: BudgetRow[] = [];
  t.rows.forEach((r, i) => {
    const acct = splitAccount(get(r, mp, 'accountCode'), get(r, mp, 'accountName'));
    if (!acct.name) return;
    rows.push({ row: i + HEADER_OFFSET, accountCode: acct.code, accountName: acct.name, period: toPeriod(get(r, mp, 'period')) || period, amount: toCents(get(r, mp, 'budgetAmount')) });
  });
  return { rows, issues: [] };
}

const BASIS_WORDS = POLICY_WORDS as unknown as Record<AccrualBasis | 'yes', string[]>;
function toBasis(v: string): AccrualBasis | null {
  const s = v.trim().toLowerCase();
  for (const b of ['fixed', 'straight_line', 'rate'] as AccrualBasis[]) {
    if (s === b || (BASIS_WORDS[b] || []).some((w) => s.includes(w.toLowerCase()))) return b;
  }
  return null;
}

export function parsePolicies(t: SheetTable, mp: Record<string, string>): ParseResult<'accrual_policy'> {
  const rows: AccrualPolicyRow[] = [];
  const badBasis: number[] = [];
  t.rows.forEach((r, i) => {
    const row = i + HEADER_OFFSET;
    const desc = get(r, mp, 'policyDesc');
    if (!desc) return;
    const basis = toBasis(get(r, mp, 'basis'));
    if (!basis) { badBasis.push(row); return; }
    const rateRaw = get(r, mp, 'rate');
    let rate = toNum(rateRaw);
    if (rate != null && /%/.test(rateRaw)) rate /= 100;
    rows.push({
      row, id: get(r, mp, 'policyId') || `P${rows.length + 1}`, description: desc,
      expenseAccount: get(r, mp, 'expenseAccount'), expenseAccountName: get(r, mp, 'expenseAccountName'),
      liabilityAccount: get(r, mp, 'liabilityAccount'), liabilityAccountName: get(r, mp, 'liabilityAccountName'),
      basis, amount: toCents(get(r, mp, 'policyAmount')), startPeriod: toPeriod(get(r, mp, 'startPeriod')), endPeriod: toPeriod(get(r, mp, 'endPeriod')),
      rate, baseAccount: get(r, mp, 'baseAccount'),
      keywords: get(r, mp, 'keywords').split(/[,，、;；/|]+/).map((s) => s.trim()).filter(Boolean),
      autoReverse: (BASIS_WORDS.yes || []).some((w) => get(r, mp, 'autoReverse').toLowerCase() === w.toLowerCase()),
    });
  });
  return { rows, issues: badBasis.length ? [issue('block', 'bad_basis', i18nKey('{n} 行计算方式认不出（应为固定金额 / 直线摊销 / 按比例）'), { n: badBasis.length }, badBasis)] : [] };
}

export function parseFx(t: SheetTable, mp: Record<string, string>): ParseResult<'fx_rates'> {
  const rows: FxRateRow[] = [];
  t.rows.forEach((r, i) => {
    const cur = get(r, mp, 'currency').toUpperCase();
    const rate = toNum(get(r, mp, 'rate'));
    if (!cur || rate == null) return;
    rows.push({ row: i + HEADER_OFFSET, currency: cur, rate, date: toIsoDate(get(r, mp, 'date')) });
  });
  return { rows, issues: [] };
}
