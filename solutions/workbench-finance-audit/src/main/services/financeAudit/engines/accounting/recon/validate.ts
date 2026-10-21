/**
 * A2 第 ③ 步校验（第 5.5 节）。
 *   银企对账：日期已统一为 ISO、金额已转为分、收付方向单一、账面科目与银行账号配得上、期初余额两边核对；
 *   总账 ↔ 子账：对账键非空、键已统一（大写去空白）、比较列两边都有、金额已转分。
 * 阻断项停在这一步；提醒项进签核必看清单。
 */
import { i18nKey } from '@totalclaw/i18n';
import type { FauIssue, FauValidationReport } from '@totalclaw/ipc-contracts';
import type { BankRow, JournalRow, LedgerExtractRow, TbRow } from '../../../types';
import { fmtYuan, msg } from '../common';
import { pairBankAccounts } from './bank';

export type ReconValidationInput =
  | { mode: 'bank'; bookRows: JournalRow[]; bankRows: BankRow[]; tb: TbRow[] | null; accountPairs?: { bookAccount: string; bankAccount: string }[]; th: Record<string, number> }
  | { mode: 'glsub'; gl: LedgerExtractRow[]; sub: LedgerExtractRow[]; th: Record<string, number> };

const validDate = (d: string) => /^\d{4}-\d{2}-\d{2}$/.test(d);

export function reconValidation(input: ReconValidationInput): FauValidationReport {
  const blockers: FauIssue[] = [];
  const warnings: FauIssue[] = [];
  const add = (level: 'block' | 'warn', code: string, message: FauIssue['message'], rows?: number[]) => {
    const list = level === 'block' ? blockers : warnings;
    list.push({ id: `${code}-${list.length + 1}`, level, code, message, rows: rows?.slice(0, 50) });
  };

  if (input.mode === 'bank') {
    if (!input.bookRows.length) add('block', 'book_empty', msg(i18nKey('序时账里没有银行存款科目的分录')));
    if (!input.bankRows.length) add('block', 'bank_empty', msg(i18nKey('银行对账单没有数据行')));
    const badBookDate = input.bookRows.filter((r) => !validDate(r.date));
    const badBankDate = input.bankRows.filter((r) => !validDate(r.date));
    if (badBookDate.length) add('block', 'book_date', msg(i18nKey('序时账有 {n} 行日期认不出'), { n: badBookDate.length }), badBookDate.map((r) => r.row));
    if (badBankDate.length) add('block', 'bank_date', msg(i18nKey('银行对账单有 {n} 行日期认不出'), { n: badBankDate.length }), badBankDate.map((r) => r.row));
    const both = input.bankRows.filter((r) => r.amountIn > 0 && r.amountOut > 0);
    if (both.length) add('warn', 'bank_direction', msg(i18nKey('银行对账单有 {n} 行同时填了收入和支出，按无法匹配处理'), { n: both.length }), both.map((r) => r.row));
    const zero = [...input.bookRows.filter((r) => r.debit === r.credit), ...input.bankRows.filter((r) => r.amountIn === r.amountOut)];
    if (zero.length) add('warn', 'zero_amount', msg(i18nKey('{n} 行金额为 0 或收付相抵，按无法匹配处理'), { n: zero.length }), zero.map((r) => r.row));
    const pairing = pairBankAccounts(input.bookRows, input.bankRows, input.accountPairs);
    if (pairing.unpairedBook.length || pairing.unpairedBank.length) {
      add('block', 'unpaired', msg(i18nKey('账面科目与银行账号没配上：科目 {book}；账号 {bank}。请在参数里指定配对'), {
        book: pairing.unpairedBook.join(', ') || '-', bank: pairing.unpairedBank.join(', ') || '-',
      }));
    }
    if (!input.tb) {
      add('warn', 'no_tb', msg(i18nKey('没有提供科目余额表，按期初两边一致处理；期初若有未达账项请补余额表')));
    } else {
      for (const p of pairing.pairs) {
        const tbRow = input.tb.find((r) => r.accountCode === p.bookAccount);
        const rows = input.bankRows.filter((r) => r.bankAccount === p.bankAccount).sort((a, b) => a.date.localeCompare(b.date) || a.row - b.row);
        const first = rows.find((r) => r.balance != null);
        if (!tbRow) { add('warn', 'tb_missing_account', msg(i18nKey('余额表里没有科目 {code}，期初按银行一侧处理'), { code: p.bookAccount })); continue; }
        if (!first) continue;
        const bankOpen = first.balance! - rows.slice(0, rows.indexOf(first) + 1).reduce((a, r) => a + r.amountIn - r.amountOut, 0);
        const bookOpen = tbRow.openingDr - tbRow.openingCr;
        if (Math.abs(bankOpen - bookOpen) > (input.th['bank.amountTol'] ?? 1)) {
          add('warn', 'opening_mismatch', msg(i18nKey('{account} 期初余额两边不一致：账面 {a}，银行 {b}，差额通常是上期未达账项'), { account: p.bankAccount, a: fmtYuan(bookOpen), b: fmtYuan(bankOpen) }));
        }
      }
    }
  } else {
    if (!input.gl.length) add('block', 'gl_empty', msg(i18nKey('总账提取没有数据行')));
    if (!input.sub.length) add('block', 'sub_empty', msg(i18nKey('子账提取没有数据行')));
    const noKey = [...input.gl, ...input.sub].filter((r) => !String(r.key || '').trim());
    if (noKey.length) add('block', 'key_empty', msg(i18nKey('{n} 行没有对账键'), { n: noKey.length }), noKey.map((r) => r.row));
    const odd = [...input.gl, ...input.sub].filter((r) => r.key && r.key !== r.key.replace(/\s+/g, '').toUpperCase());
    if (odd.length) add('warn', 'key_normalized', msg(i18nKey('{n} 行对账键含空格或小写，已统一为大写去空白后匹配'), { n: odd.length }), odd.map((r) => r.row));
    const hasQty = (rows: LedgerExtractRow[]) => rows.some((r) => r.quantity != null);
    if (hasQty(input.gl) !== hasQty(input.sub)) add('warn', 'qty_one_side', msg(i18nKey('只有一边有数量列，数量不参与比较')));
    const hasFx = (rows: LedgerExtractRow[]) => rows.some((r) => r.fxAmount != null);
    if (hasFx(input.gl) !== hasFx(input.sub)) add('warn', 'fx_one_side', msg(i18nKey('只有一边有外币金额列，汇率成因无法判断')));
    const badDate = [...input.gl, ...input.sub].filter((r) => r.date && !validDate(r.date));
    if (badDate.length) add('warn', 'date', msg(i18nKey('{n} 行日期认不出，时间差异不判'), { n: badDate.length }), badDate.map((r) => r.row));
  }

  const checks: FauValidationReport['checks'] = input.mode === 'bank'
    ? [
      { id: 'dates', ok: !blockers.some((b) => b.code === 'book_date' || b.code === 'bank_date'), level: 'block', message: msg(i18nKey('日期统一为 ISO')) },
      { id: 'amounts', ok: !warnings.some((w) => w.code === 'zero_amount'), level: 'warn', message: msg(i18nKey('金额转为最小货币单位整数')) },
      { id: 'direction', ok: !warnings.some((w) => w.code === 'bank_direction'), level: 'warn', message: msg(i18nKey('收付方向统一')) },
      { id: 'pairing', ok: !blockers.some((b) => b.code === 'unpaired'), level: 'block', message: msg(i18nKey('账面科目与银行账号一一对应')) },
      { id: 'opening', ok: !warnings.some((w) => w.code === 'opening_mismatch' || w.code === 'no_tb'), level: 'warn', message: msg(i18nKey('期初余额两边核对')) },
    ]
    : [
      { id: 'key', ok: !blockers.some((b) => b.code === 'key_empty'), level: 'block', message: msg(i18nKey('对账键齐全')) },
      { id: 'columns', ok: !warnings.some((w) => w.code === 'qty_one_side' || w.code === 'fx_one_side'), level: 'warn', message: msg(i18nKey('比较列两边都有')) },
      { id: 'types', ok: !warnings.some((w) => w.code === 'date'), level: 'warn', message: msg(i18nKey('类型统一：日期 ISO、金额两位、标识去空格转大写')) },
    ];
  return { checks, blockers, warnings };
}
