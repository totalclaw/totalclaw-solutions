/**
 * A2 银企对账（reconciliation-automation + 判断框架类型三）。
 *
 * 四轮匹配：1 流水号 / 单号；2 金额 + 日期 ±N 天；3 金额唯一；4 一对多（窗口内最多 N 笔合计）。
 * 结果七类：已达 / 企业已付银行未付 / 企业已收银行未收 / 银行已付企业未付 / 银行已收企业未收 / 金额差异 / 无法匹配。
 * 调节表：账面余额 + 银行已收企业未收 − 银行已付企业未付 + 金额差异（按银行金额调到账面一侧）
 *       = 银行余额 + 企业已收银行未收 − 企业已付银行未付，两边相等才算调平。
 * 收为正、付为负；金额一律分。
 */
import { i18nKey } from '@totalclaw/i18n';
import type { FauBankAccountResult, FauBankClass, FauBankItem, FauMsg } from '@totalclaw/ipc-contracts';
import { FAU_BANK_CLASSES } from '@totalclaw/ipc-contracts';
import type { BankRow, JournalRow, TbRow } from '../../../types';
import { KEYWORDS, addMonths, codeUnder, daysBetween, fmtYuan, hasAny, msg, workdaysBetween } from '../common';

export type BankDirection = 'book_out_bank_not' | 'bank_out_book_not' | 'book_in_bank_not' | 'bank_in_book_not';

export interface BankReconInput {
  /** 已筛出银行存款科目的分录 */
  bookRows: JournalRow[];
  bankRows: BankRow[];
  tb: TbRow[] | null;
  accountPairs?: { bookAccount: string; bankAccount: string }[];
  periodEnd: string;
  /** 往期未达方向（读项目历史），判「连续 N 个月同方向未达」 */
  history?: { account: string; period: string; direction: BankDirection }[];
  th: Record<string, number>;
}

export function isBankAccount(code: string, name: string): boolean {
  return KEYWORDS.bankCodePrefixes.some((p) => codeUnder(code, p)) || hasAny(name, KEYWORDS.bankNames);
}

export interface BankPairing {
  pairs: { bookAccount: string; bankAccount: string }[];
  unpairedBook: string[];
  unpairedBank: string[];
}

/** 账面明细科目 ↔ 银行账号：先用人给的配对，再按账号后四位出现在科目名 / 编码里配，最后各剩一个就直接配 */
export function pairBankAccounts(bookRows: JournalRow[], bankRows: BankRow[], accountPairs: BankPairing['pairs'] = []): BankPairing {
  const books = new Map<string, string>();
  for (const r of bookRows) if (!books.has(r.accountCode)) books.set(r.accountCode, r.accountName);
  const banks = [...new Set(bankRows.map((r) => r.bankAccount))];
  const pairs: BankPairing['pairs'] = [];
  const usedBook = new Set<string>();
  const usedBank = new Set<string>();
  const take = (book: string, bank: string) => { pairs.push({ bookAccount: book, bankAccount: bank }); usedBook.add(book); usedBank.add(bank); };
  for (const p of accountPairs) if (books.has(p.bookAccount) && banks.includes(p.bankAccount)) take(p.bookAccount, p.bankAccount);
  for (const bank of banks) {
    if (usedBank.has(bank)) continue;
    const last4 = bank.replace(/\D/g, '').slice(-4);
    if (last4.length < 4) continue;
    const hits = [...books.entries()].filter(([code, name]) => !usedBook.has(code) && (`${code} ${name}`).includes(last4));
    if (hits.length === 1) take(hits[0][0], bank);
  }
  const restBook = [...books.keys()].filter((b) => !usedBook.has(b));
  const restBank = banks.filter((b) => !usedBank.has(b));
  if (restBook.length === 1 && restBank.length === 1) take(restBook[0], restBank[0]);
  return {
    pairs,
    unpairedBook: [...books.keys()].filter((b) => !usedBook.has(b)),
    unpairedBank: banks.filter((b) => !usedBank.has(b)),
  };
}

interface Side { row: number; date: string; amount: number; ref: string; counterparty: string; summary: string; used: boolean; bad: boolean }

function combos<T>(items: T[], k: number, start = 0, acc: T[] = [], out: T[][] = []): T[][] {
  if (acc.length === k) { out.push([...acc]); return out; }
  for (let i = start; i < items.length && out.length < 2000; i += 1) combos(items, k, i + 1, [...acc, items[i]], out);
  return out;
}

function bankCause(s: Side, side: 'bank' | 'book'): string {
  const text = `${s.summary} ${s.counterparty}`;
  if (side === 'book') return s.amount < 0 ? 'outstanding_payment' : 'in_transit';
  if (hasAny(text, KEYWORDS.bankCause.fee)) return 'fee';
  if (hasAny(text, KEYWORDS.bankCause.interest)) return 'interest';
  if (hasAny(text, KEYWORDS.bankCause.tax)) return 'tax';
  return s.amount < 0 ? 'unknown_deduction' : 'receipt';
}

function reconcileAccount(book: Side[], bank: Side[], input: BankReconInput, account: string, bookAccount: string, opening: { book: number | null; bank: number | null }, closing: { book: number | null; bank: number | null }): FauBankAccountResult {
  const th = input.th;
  const tol = th['bank.amountTol'] ?? 1;
  const window = th['bank.dateWindowDays'] ?? 3;
  const maxGroup = th['bank.maxGroup'] ?? 3;
  const items: FauBankItem[] = [];
  const near = (a: string, b: string) => Math.abs(daysBetween(a, b)) <= window;
  const same = (a: number, b: number) => Math.abs(a - b) <= tol;
  const push = (cls: FauBankClass, pass: FauBankItem['pass'], bk: Side[], bn: Side[]) => {
    bk.forEach((s) => { s.used = true; });
    bn.forEach((s) => { s.used = true; });
    const main = bn[0] || bk[0];
    items.push({
      id: `${account}-${items.length + 1}`, cls, pass, bookRows: bk.map((s) => s.row), bankRows: bn.map((s) => s.row),
      date: main.date, bookAmount: bk.reduce((a, s) => a + s.amount, 0), bankAmount: bn.reduce((a, s) => a + s.amount, 0),
      ref: bn.find((s) => s.ref)?.ref || '', counterparty: main.counterparty || bk[0]?.counterparty || '', summary: main.summary,
    });
  };
  const free = (arr: Side[]) => arr.filter((s) => !s.used && !s.bad);

  // 数据有问题的行（金额为 0、日期认不出、同一行既收又付）不参与匹配
  for (const s of [...book, ...bank].filter((x) => x.bad)) push('unmatched', undefined, book.includes(s) ? [s] : [], bank.includes(s) ? [s] : []);

  // 第 1 轮：流水号 / 单号
  for (const bn of free(bank)) {
    if (bn.ref.length < 3) continue;
    const bk = free(book).find((b) => b.summary.includes(bn.ref) || b.ref === bn.ref);
    if (!bk) continue;
    push(same(bk.amount, bn.amount) ? 'matched' : 'amount_diff', 1, [bk], [bn]);
  }
  // 第 2 轮：金额 + 日期窗口（取日期最近的）
  for (const bn of free(bank).sort((a, b) => a.date.localeCompare(b.date))) {
    const cands = free(book).filter((b) => same(b.amount, bn.amount) && near(b.date, bn.date))
      .sort((a, b) => Math.abs(daysBetween(a.date, bn.date)) - Math.abs(daysBetween(b.date, bn.date)));
    if (cands.length) push('matched', 2, [cands[0]], [bn]);
  }
  // 第 3 轮：金额唯一（两边各只有一笔这个金额，不看日期）
  for (const bn of free(bank)) {
    const bks = free(book).filter((b) => same(b.amount, bn.amount));
    const bns = free(bank).filter((b) => same(b.amount, bn.amount));
    if (bks.length === 1 && bns.length === 1) push('matched', 3, bks, [bn]);
  }
  // 第 4 轮：一对多（同方向、窗口内最多 maxGroup 笔合计）
  for (const [one, many, oneIsBank] of [[bank, book, true], [book, bank, false]] as const) {
    for (const s of free(one)) {
      const cands = free(many).filter((m) => Math.sign(m.amount) === Math.sign(s.amount) && near(m.date, s.date)).slice(0, 12);
      let hit: Side[] | null = null;
      for (let k = 2; k <= maxGroup && !hit; k += 1) {
        hit = combos(cands, k).find((c) => same(c.reduce((a, x) => a + x.amount, 0), s.amount)) || null;
      }
      if (hit) push('matched', 4, oneIsBank ? hit : [s], oneIsBank ? [s] : hit);
    }
  }
  // 剩下的按方向归类
  for (const s of free(book)) push(s.amount < 0 ? 'book_out_bank_not' : 'book_in_bank_not', undefined, [s], []);
  for (const s of free(bank)) push(s.amount < 0 ? 'bank_out_book_not' : 'bank_in_book_not', undefined, [], [s]);

  // 成因、账龄、升级条件
  const escalations: FauMsg[] = [];
  const unknownMax = th['bank.unknownDeductionEscalate'] ?? 100000;
  const unexplainedMax = th['bank.unexplainedEscalate'] ?? 500000;
  const agingMax = th['bank.bookOutAgingWorkdays'] ?? 10;
  for (const it of items) {
    if (it.cls === 'matched') continue;
    const side = it.bankRows.length && !it.bookRows.length ? 'bank' : 'book';
    const src = side === 'bank' ? bank.find((b) => b.row === it.bankRows[0])! : book.find((b) => b.row === it.bookRows[0])!;
    if (it.cls !== 'amount_diff' && it.cls !== 'unmatched') it.cause = bankCause(src, side);
    const amt = side === 'bank' ? it.bankAmount : it.bookAmount;
    if (it.cls === 'book_out_bank_not') {
      it.ageDays = workdaysBetween(it.date, input.periodEnd);
      if (it.ageDays > agingMax) it.escalate = msg(i18nKey('企业已付银行未付 {amount}（{date}）已超过 {n} 个工作日，联系付款银行查询'), { amount: fmtYuan(-amt), date: it.date, n: agingMax });
    }
    if (it.cause === 'unknown_deduction' && Math.abs(amt) > unknownMax) {
      it.escalate = msg(i18nKey('不明扣款 {amount}（{date}）超过 {max}，立即联系银行查明原因'), { amount: fmtYuan(Math.abs(amt)), date: it.date, max: fmtYuan(unknownMax) });
    } else if ((it.cause === 'unknown_deduction' || it.cls === 'amount_diff' || it.cls === 'unmatched')) {
      const diff = it.cls === 'amount_diff' ? it.bankAmount - it.bookAmount : amt;
      if (Math.abs(diff) > unexplainedMax) it.escalate = msg(i18nKey('差异 {amount}（{date}）超过 {max} 且原因不明，必须查明'), { amount: fmtYuan(Math.abs(diff)), date: it.date, max: fmtYuan(unexplainedMax) });
    }
    if (it.escalate) escalations.push(it.escalate);
  }

  // 连续 N 个月同方向未达
  const months = th['bank.sameDirectionMonths'] ?? 3;
  const period = input.periodEnd.slice(0, 7);
  const dirs = new Set(items.map((i) => i.cls).filter((c): c is BankDirection => c === 'book_out_bank_not' || c === 'bank_out_book_not' || c === 'book_in_bank_not' || c === 'bank_in_book_not'));
  for (const dir of dirs) {
    let streak = 1;
    for (let k = 1; k < months; k += 1) {
      const p = addMonths(period, -k);
      if ((input.history || []).some((h) => (h.account === account || h.account === bookAccount) && h.period === p && h.direction === dir)) streak += 1;
      else break;
    }
    if (streak >= months) escalations.push(msg(i18nKey('同一账户连续 {n} 个月存在同方向未达账项，财务经理介入排查'), { n: months }));
  }

  const counts = Object.fromEntries(FAU_BANK_CLASSES.map((c) => [c, items.filter((i) => i.cls === c).length])) as Record<FauBankClass, number>;
  const sumOf = (pred: (i: FauBankItem) => boolean, f: (i: FauBankItem) => number) => items.filter(pred).reduce((a, i) => a + f(i), 0);
  const bookOnly = (i: FauBankItem) => i.bookRows.length > 0 && i.bankRows.length === 0;
  const bankOnly = (i: FauBankItem) => i.bankRows.length > 0 && i.bookRows.length === 0;
  const bookMove = book.reduce((a, s) => a + s.amount, 0);
  const bankMove = bank.reduce((a, s) => a + s.amount, 0);
  // 期初：余额表 / 流水余额列；缺一边就假设两边一致（validate 会给提醒）
  const bankOpen = opening.bank ?? opening.book ?? 0;
  const bookOpen = opening.book ?? bankOpen;
  const bookBalance = closing.book ?? bookOpen + bookMove;
  const bankBalance = closing.bank ?? bankOpen + bankMove;
  const addBankInNotBook = sumOf((i) => bankOnly(i) && i.bankAmount > 0, (i) => i.bankAmount);
  const lessBankOutNotBook = -sumOf((i) => bankOnly(i) && i.bankAmount < 0, (i) => i.bankAmount);
  const amountDiffAdj = sumOf((i) => i.cls === 'amount_diff', (i) => i.bankAmount - i.bookAmount);
  const addBookInNotBank = sumOf((i) => bookOnly(i) && i.bookAmount > 0, (i) => i.bookAmount);
  const lessBookOutNotBank = -sumOf((i) => bookOnly(i) && i.bookAmount < 0, (i) => i.bookAmount);
  const adjustedBook = bookBalance + addBankInNotBook - lessBankOutNotBook + amountDiffAdj;
  const adjustedBank = bankBalance + addBookInNotBank - lessBookOutNotBank;
  return {
    account,
    items,
    counts,
    statement: {
      bookBalance, addBankInNotBook, lessBankOutNotBook, amountDiffAdj, adjustedBook,
      bankBalance, addBookInNotBank, lessBookOutNotBank, adjustedBank, balanced: Math.abs(adjustedBook - adjustedBank) <= tol,
    },
    escalations,
  };
}

function bankBalances(rows: BankRow[]): { opening: number | null; closing: number | null } {
  const sorted = [...rows].sort((a, b) => a.date.localeCompare(b.date) || a.row - b.row);
  const firstIdx = sorted.findIndex((r) => r.balance != null);
  if (firstIdx < 0) return { opening: null, closing: null };
  const before = sorted.slice(0, firstIdx + 1).reduce((a, r) => a + r.amountIn - r.amountOut, 0);
  const opening = sorted[firstIdx].balance! - before;
  let lastIdx = firstIdx;
  sorted.forEach((r, i) => { if (r.balance != null) lastIdx = i; });
  const after = sorted.slice(lastIdx + 1).reduce((a, r) => a + r.amountIn - r.amountOut, 0);
  return { opening, closing: sorted[lastIdx].balance! + after };
}

const validDate = (d: string) => /^\d{4}-\d{2}-\d{2}$/.test(d);

export function bankRecon(input: BankReconInput): FauBankAccountResult[] {
  const pairing = pairBankAccounts(input.bookRows, input.bankRows, input.accountPairs);
  return pairing.pairs.map(({ bookAccount, bankAccount }) => {
    const bookRows = input.bookRows.filter((r) => r.accountCode === bookAccount);
    const bankRows = input.bankRows.filter((r) => r.bankAccount === bankAccount);
    const book: Side[] = bookRows.map((r) => ({
      row: r.row, date: r.date, amount: r.debit - r.credit, ref: r.voucherNo, counterparty: r.counterparty, summary: r.summary,
      used: false, bad: !validDate(r.date) || r.debit - r.credit === 0,
    }));
    const bank: Side[] = bankRows.map((r) => ({
      row: r.row, date: r.date, amount: r.amountIn - r.amountOut, ref: r.ref, counterparty: r.counterparty, summary: r.summary,
      used: false, bad: !validDate(r.date) || (r.amountIn > 0 && r.amountOut > 0) || r.amountIn - r.amountOut === 0,
    }));
    const tbRow = input.tb?.find((r) => r.accountCode === bookAccount) || null;
    const bb = bankBalances(bankRows);
    return reconcileAccount(book, bank, input, bankAccount, bookAccount,
      { book: tbRow ? tbRow.openingDr - tbRow.openingCr : null, bank: bb.opening },
      { book: tbRow ? tbRow.closingDr - tbRow.closingCr : null, bank: bb.closing });
  });
}
