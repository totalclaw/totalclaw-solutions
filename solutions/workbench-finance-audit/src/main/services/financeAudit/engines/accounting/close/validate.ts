/**
 * A1 第 ③ 步校验（第 5.5 节）：
 *   阻断：余额表为空、本期没有分录、序时账借贷不平（逐凭证 / 全表）、IFRS 口径下有科目没映射；
 *   提醒：余额表期初 ≠ 上期期末（逐科目）、序时账发生额 ≠ 余额表本期发生（逐科目，滚动表会列未解释差异）、
 *         中国口径下认不出报表行的科目、期外分录（只给跨期识别用，不参与勾稽）。
 */
import { i18nKey } from '@totalclaw/i18n';
import type { FauAccountMapEntry, FauIssue, FauValidationReport } from '@totalclaw/ipc-contracts';
import type { JournalRow, TbRow } from '../../../types';
import { accountNature, codeUnder, fmtYuan, inPeriod, msg, topLevel } from '../common';

export interface CloseValidationInput {
  period: string;
  journal: JournalRow[];
  tb: TbRow[];
  tbPrior: TbRow[] | null;
  accountMap: FauAccountMapEntry[];
  reportBasis: 'cn' | 'ifrs';
  th: Record<string, number>;
}

export function closeValidation(input: CloseValidationInput): FauValidationReport {
  const tol = input.th['tie.tolerance'] ?? 1;
  const blockers: FauIssue[] = [];
  const warnings: FauIssue[] = [];
  const add = (level: 'block' | 'warn', code: string, message: FauIssue['message'], rows?: number[]) =>
    (level === 'block' ? blockers : warnings).push({ id: `${code}-${(level === 'block' ? blockers : warnings).length + 1}`, level, code, message, rows: rows?.slice(0, 50) });

  if (!input.tb.length) add('block', 'tb_empty', msg(i18nKey('本期科目余额表没有数据行')));
  const inP = input.journal.filter((j) => inPeriod(j.date, input.period));
  if (!inP.length) add('block', 'journal_empty', msg(i18nKey('序时账里没有 {period} 的分录'), { period: input.period }));
  const outside = input.journal.filter((j) => !inPeriod(j.date, input.period));
  if (outside.length) add('warn', 'journal_outside', msg(i18nKey('{n} 行分录不在 {period}，只用于跨期识别，不参与勾稽'), { n: outside.length, period: input.period }), outside.map((j) => j.row));

  // 借贷平衡：逐凭证 + 全表
  const vouchers = new Map<string, JournalRow[]>();
  for (const j of input.journal) {
    const k = `${j.date}|${j.voucherNo}`;
    const g = vouchers.get(k) || [];
    g.push(j);
    vouchers.set(k, g);
  }
  for (const lines of vouchers.values()) {
    const d = lines.reduce((a, l) => a + l.debit - l.credit, 0);
    if (Math.abs(d) > tol) {
      add('block', 'voucher_unbalanced', msg(i18nKey('凭证 {no}（{date}）借贷不平，差 {diff}'), { no: lines[0].voucherNo || '-', date: lines[0].date, diff: fmtYuan(d) }), lines.map((l) => l.row));
    }
  }
  const total = inP.reduce((a, l) => a + l.debit - l.credit, 0);
  if (Math.abs(total) > tol) add('block', 'journal_unbalanced', msg(i18nKey('本期序时账借方合计与贷方合计不等，差 {diff}'), { diff: fmtYuan(total) }));

  // 期初衔接
  if (input.tbPrior) {
    const prior = new Map(input.tbPrior.map((r) => [r.accountCode || r.accountName, r]));
    const bad = input.tb.filter((r) => {
      const p = prior.get(r.accountCode || r.accountName);
      return Math.abs((p ? p.closingDr - p.closingCr : 0) - (r.openingDr - r.openingCr)) > tol;
    });
    for (const r of bad) {
      const p = prior.get(r.accountCode || r.accountName);
      add('warn', 'opening_mismatch', msg(i18nKey('{code} {name}：本期期初 {a} ≠ 上期期末 {b}'), {
        code: r.accountCode, name: r.accountName, a: fmtYuan(r.openingDr - r.openingCr), b: fmtYuan(p ? p.closingDr - p.closingCr : 0),
      }), [r.row]);
    }
  } else {
    add('warn', 'no_prior_tb', msg(i18nKey('没有上期科目余额表，期初衔接与对上期波动无法核对')));
  }

  // 序时账发生额 = 余额表本期发生（逐科目，只比明细到最末级的科目，避免父子重复）
  const leafCodes = input.tb.filter((r) => r.accountCode && !input.tb.some((x) => x !== r && x.accountCode !== r.accountCode && codeUnder(x.accountCode, r.accountCode)));
  for (const r of leafCodes) {
    const lines = inP.filter((j) => codeUnder(j.accountCode, r.accountCode));
    const dr = lines.reduce((a, l) => a + l.debit, 0);
    const cr = lines.reduce((a, l) => a + l.credit, 0);
    if (Math.abs(dr - r.periodDr) > tol || Math.abs(cr - r.periodCr) > tol) {
      add('warn', 'movement_mismatch', msg(i18nKey('{code} {name}：序时账发生额 借 {a} 贷 {b}，余额表本期 借 {c} 贷 {d}'), {
        code: r.accountCode, name: r.accountName, a: fmtYuan(dr), b: fmtYuan(cr), c: fmtYuan(r.periodDr), d: fmtYuan(r.periodCr),
      }), [r.row]);
    }
  }
  // 序时账里有、余额表里没有的科目
  const unknownJournal = inP.filter((j) => j.accountCode && !input.tb.some((r) => r.accountCode && (codeUnder(j.accountCode, r.accountCode) || codeUnder(r.accountCode, j.accountCode))));
  if (unknownJournal.length) {
    add('warn', 'journal_account_missing', msg(i18nKey('{n} 行分录的科目在余额表里找不到'), { n: unknownJournal.length }), unknownJournal.map((j) => j.row));
  }

  // 科目映射到报表行
  const unmapped = topLevel(input.tb).filter((r) => !accountNature(r.accountCode, r.accountName, input.reportBasis, input.accountMap));
  const ifrsMissing = input.reportBasis === 'ifrs'
    ? topLevel(input.tb).filter((r) => !input.accountMap.some((e) => e.cls && (e.code === r.accountCode || (!!e.code && codeUnder(r.accountCode, e.code)))))
    : [];
  if (ifrsMissing.length) {
    add('block', 'unmapped', msg(i18nKey('{n} 个科目还没映射到报表行：{list}。请在首次配置的科目映射里确认'), { n: ifrsMissing.length, list: ifrsMissing.slice(0, 8).map((r) => `${r.accountCode} ${r.accountName}`).join(', ') }), ifrsMissing.map((r) => r.row));
  } else if (unmapped.length) {
    add('warn', 'unmapped', msg(i18nKey('{n} 个科目认不出报表行，已按余额方向归入其他：{list}'), { n: unmapped.length, list: unmapped.slice(0, 8).map((r) => `${r.accountCode} ${r.accountName}`).join(', ') }), unmapped.map((r) => r.row));
  }

  const checks: FauValidationReport['checks'] = [
    { id: 'journal_balanced', ok: !blockers.some((b) => b.code === 'voucher_unbalanced' || b.code === 'journal_unbalanced'), level: 'block', message: msg(i18nKey('序时账借贷平衡（逐凭证 + 全表）')) },
    { id: 'opening', ok: !warnings.some((w) => w.code === 'opening_mismatch' || w.code === 'no_prior_tb'), level: 'warn', message: msg(i18nKey('余额表期初 = 上期期末')) },
    { id: 'movement', ok: !warnings.some((w) => w.code === 'movement_mismatch'), level: 'warn', message: msg(i18nKey('序时账发生额 = 余额表本期发生')) },
    { id: 'mapping', ok: !blockers.some((b) => b.code === 'unmapped') && !warnings.some((w) => w.code === 'unmapped'), level: input.reportBasis === 'ifrs' ? 'block' : 'warn', message: msg(i18nKey('科目全部映射到报表行')) },
    { id: 'coverage', ok: inP.length > 0, level: 'block', message: msg(i18nKey('期间覆盖：序时账包含本期分录')) },
  ];
  return { checks, blockers, warnings };
}
