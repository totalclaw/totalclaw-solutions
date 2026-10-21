/**
 * A1 计提表（accrual-schedule）：逐条政策算基数、本期应摊、已入账、本期计提，起草分录（不过账）。
 *
 *   fixed          每期金额
 *   straight_line  合同总额按起止期间月数平摊（向下取整到分，余数落最后一期）
 *   rate           基数科目本期发生额 × 费率（四舍五入到分）
 * 已入账 = 序时账里该费用科目本期借方、摘要含任一关键词（没写关键词就用政策名称）。
 * 本期计提 = max(应摊 − 已入账, 0)。分录借费用、贷负债，列与财务智能体「通用凭证导入格式」一致。
 */
import { i18nKey } from '@totalclaw/i18n';
import type { FauAccrualLine, FauJeLine } from '@totalclaw/ipc-contracts';
import type { AccrualPolicyRow, JournalRow, TbRow } from '../../../types';
import { accountNature, codeUnder, fmtYuan, hasAny, inPeriod, monthsBetween, msg, periodAmount, periodEnd, topLevel } from '../common';

export interface AccrualInput {
  period: string;
  journal: JournalRow[];
  tb: TbRow[];
  policies: AccrualPolicyRow[];
  th: Record<string, number>;
}

function baseAccountMovement(code: string, tb: TbRow[], journal: JournalRow[], period: string): number {
  const rows = topLevel(tb).filter((r) => codeUnder(r.accountCode, code) || codeUnder(code, r.accountCode));
  const exact = tb.find((r) => r.accountCode === code) || rows[0];
  if (exact) return periodAmount(accountNature(exact.accountCode, exact.accountName, 'cn'), exact);
  // 余额表里没有就回落序时账
  const lines = journal.filter((j) => inPeriod(j.date, period) && codeUnder(j.accountCode, code));
  if (!lines.length) return 0;
  const cls = accountNature(code, lines[0].accountName, 'cn');
  return lines.reduce((a, j) => a + (cls === 'revenue' ? j.credit - j.debit : j.debit - j.credit), 0);
}

export function accrualSchedule(input: AccrualInput): { lines: FauAccrualLine[]; je: FauJeLine[] } {
  const { period } = input;
  const lines: FauAccrualLine[] = [];
  const je: FauJeLine[] = [];
  let seq = 0;
  for (const p of input.policies) {
    let base = 0;
    let due = 0;
    let formula = '';
    let note: FauAccrualLine['note'];
    if (p.basis === 'fixed') {
      base = p.amount;
      due = p.amount;
      formula = fmtYuan(p.amount);
    } else if (p.basis === 'straight_line') {
      base = p.amount;
      const months = monthsBetween(p.startPeriod, p.endPeriod);
      if (months <= 0) {
        note = msg(i18nKey('起止期间不完整，无法平摊'));
      } else if (period < p.startPeriod || period > p.endPeriod) {
        note = msg(i18nKey('本期不在 {a} 至 {b} 的摊销期间内'), { a: p.startPeriod, b: p.endPeriod });
      } else {
        const each = Math.floor(p.amount / months);
        due = period === p.endPeriod ? p.amount - each * (months - 1) : each;
        formula = `${fmtYuan(p.amount)} / ${months} = ${fmtYuan(due)}`;
      }
    } else {
      base = baseAccountMovement(p.baseAccount, input.tb, input.journal, period);
      const rate = p.rate ?? 0;
      due = Math.round(base * rate);
      formula = `${fmtYuan(base)} × ${(rate * 100).toFixed(4).replace(/\.?0+$/, '')}% = ${fmtYuan(due)}`;
    }
    const words = p.keywords.length ? p.keywords : [p.description];
    const booked = input.journal
      .filter((j) => inPeriod(j.date, period) && codeUnder(j.accountCode, p.expenseAccount) && j.debit > 0 && hasAny(j.summary, words))
      .reduce((a, j) => a + j.debit - j.credit, 0);
    const accrual = Math.max(due - booked, 0);
    if (booked > due && due > 0) note = msg(i18nKey('已入账 {booked} 超过本期应摊 {due}，本期不再计提，请复核'), { booked: fmtYuan(booked), due: fmtYuan(due) });
    if (p.autoReverse && accrual > 0 && !note) note = msg(i18nKey('下期第一天自动冲回'));
    lines.push({
      policyId: p.id, description: p.description, expenseAccount: p.expenseAccount, liabilityAccount: p.liabilityAccount,
      basis: p.basis, base, due, booked, accrual, autoReverse: p.autoReverse, formula, note,
    });
    if (accrual > 0) {
      seq += 1;
      const voucherNo = `JT-${period}-${String(seq).padStart(2, '0')}`;
      const date = periodEnd(period);
      const summary = `${p.description} ${period}`;
      je.push(
        { date, voucherNo, lineNo: 1, summary, accountCode: p.expenseAccount, accountName: p.expenseAccountName, aux: '', debit: accrual, credit: 0, source: 'accrual' },
        { date, voucherNo, lineNo: 2, summary, accountCode: p.liabilityAccount, accountName: p.liabilityAccountName, aux: '', debit: 0, credit: accrual, source: 'accrual' },
      );
    }
  }
  return { lines, je };
}
