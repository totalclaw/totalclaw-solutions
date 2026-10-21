/**
 * A1 滚动表（roll-forward）：期初 + 增加 + 计提 − 冲回 − 付款 ± 重分类 ± 折算 + 其他 = 计算值；
 * 计算值与余额表期末的差额列为「未解释差异」，**不倒挤**（源技能原文：surface it, don't plug it）。
 *
 * 每条本期分录按「余额增加为正」取数，再按摘要关键词 / 对方科目归类：
 *   折算 / 重分类 / 冲回 / 计提关键词优先；减少且对方是现金或带付款关键词 → 付款；
 *   其余增加 → 增加；其余减少 → 其他（归不了类的不硬塞）。
 */
import type { FauAccountMapEntry, FauRollForwardRow } from '@totalclaw/ipc-contracts';
import type { JournalRow, TbRow } from '../../../types';
import { KEYWORDS, accountNature, codeUnder, hasAny, inPeriod, signedBalance, topLevel } from '../common';

export interface RollForwardInput {
  period: string;
  journal: JournalRow[];
  tb: TbRow[];
  /** 科目编码；空 = 自动选资产负债类、本期有发生额的顶层科目 */
  accounts: string[];
  th: Record<string, number>;
  reportBasis?: 'cn' | 'ifrs';
  accountMap?: FauAccountMapEntry[];
}

const isCashLine = (j: JournalRow) => KEYWORDS.cashCodePrefixes.some((c) => codeUnder(j.accountCode, c)) || hasAny(j.accountName, KEYWORDS.cashNames);

export function rollForward(input: RollForwardInput): FauRollForwardRow[] {
  const basis = input.reportBasis || 'cn';
  const map = input.accountMap || [];
  const top = topLevel(input.tb);
  const targets = input.accounts.length
    ? input.accounts.map((c) => input.tb.find((r) => r.accountCode === c)).filter((r): r is TbRow => !!r)
    : top.filter((r) => {
      const cls = accountNature(r.accountCode, r.accountName, basis, map);
      return (cls === 'asset' || cls === 'liability') && (r.periodDr || r.periodCr);
    });
  const journal = input.journal.filter((j) => inPeriod(j.date, input.period));
  const vouchers = new Map<string, JournalRow[]>();
  for (const j of journal) {
    const k = `${j.date}|${j.voucherNo}`;
    const g = vouchers.get(k) || [];
    g.push(j);
    vouchers.set(k, g);
  }
  const rf = KEYWORDS.rollForward;
  return targets.map((acct) => {
    let cls = accountNature(acct.accountCode, acct.accountName, basis, map);
    // 备抵科目（累计折旧、坏账准备）按贷方余额看：余额为正，计提为增加
    if (cls === 'asset' && acct.openingCr + acct.closingCr > acct.openingDr + acct.closingDr) cls = 'liability';
    const opening = signedBalance(cls, acct.openingDr, acct.openingCr);
    const closing = signedBalance(cls, acct.closingDr, acct.closingCr);
    const row: FauRollForwardRow = {
      accountCode: acct.accountCode, accountName: acct.accountName, opening,
      additions: 0, accruals: 0, reversals: 0, payments: 0, reclass: 0, fx: 0, other: 0, computed: 0, closing, unexplained: 0,
    };
    for (const j of journal.filter((x) => codeUnder(x.accountCode, acct.accountCode))) {
      const s = signedBalance(cls, j.debit, j.credit);
      const others = (vouchers.get(`${j.date}|${j.voucherNo}`) || []).filter((x) => x !== j && !codeUnder(x.accountCode, acct.accountCode));
      if (hasAny(j.summary, rf.fx)) row.fx += s;
      else if (hasAny(j.summary, rf.reclass)) row.reclass += s;
      else if (hasAny(j.summary, rf.reversal)) row.reversals -= s;
      else if (s > 0 && hasAny(j.summary, rf.accrual)) row.accruals += s;
      else if (s < 0 && (others.some(isCashLine) || hasAny(j.summary, rf.payment))) row.payments -= s;
      else if (s > 0) row.additions += s;
      else row.other += s;
    }
    row.computed = opening + row.additions + row.accruals - row.reversals - row.payments + row.reclass + row.fx + row.other;
    row.unexplained = closing - row.computed;
    return row;
  });
}
