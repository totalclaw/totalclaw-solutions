/**
 * A1 试算与勾稽：试算平衡（期初 / 本期 / 期末借贷）、资产负债平衡、净利润 ↔ 未分配利润变动、
 * 现金流量净额 ↔ 货币资金变动，另补期初期末衔接（上期期末 = 本期期初，逐科目）。
 *
 * 中国准则口径只读复用财务智能体 buildStatements（吃元为单位的行，这里做分 ↔ 元换算）；
 * IFRS 口径按公司档案的科目映射（cls）自己算。借贷差异分档见 thresholds/close.json（类型一）。
 */
import { i18nKey } from '@totalclaw/i18n';
import type { FauAccountMapEntry, FauDiffTier, FauTieCheck, FauTrialResult } from '@totalclaw/ipc-contracts';
import type { FaBalanceRow, FaJournalRow } from '@totalclaw/ipc-contracts';
import { buildStatements } from '../../../../financeAgent/statements';
import type { JournalRow, TbRow } from '../../../types';
import { KEYWORDS, accountNature, codeUnder, fmtYuan, hasAny, msg, signedBalance, topLevel } from '../common';

export interface TrialInput {
  tb: TbRow[];
  tbPrior: TbRow[] | null;
  /** 只放本期分录（期后分录留给跨期识别） */
  journal: JournalRow[];
  reportBasis: 'cn' | 'ifrs';
  accountMap: FauAccountMapEntry[];
  th: Record<string, number>;
}

export function diffTier(diff: number, th: Record<string, number>): FauDiffTier {
  const d = Math.abs(diff);
  if (d <= (th['trial.ignoreMax'] ?? 1)) return 'ignore';
  if (d <= (th['trial.locateMax'] ?? 10000)) return 'locate';
  if (d <= (th['trial.stopMax'] ?? 100000)) return 'stop';
  return 'stop_notify';
}

const TIER_MSG: Record<FauDiffTier, string> = {
  ignore: i18nKey('试算平衡'),
  locate: i18nKey('试算不平，差 {diff}：定位差异来源，通知总账会计排查'),
  stop: i18nKey('试算不平，差 {diff}：停止结账，逐笔排查'),
  stop_notify: i18nKey('试算不平，差 {diff}：停止结账，财务经理介入'),
};

function tie(id: FauTieCheck['id'], left: number, right: number, tol: number, okKey: string, badKey: string): FauTieCheck {
  const diff = left - right;
  const ok = Math.abs(diff) <= tol;
  return { id, ok, left, right, diff, message: msg(ok ? okKey : badKey, { left: fmtYuan(left), right: fmtYuan(right), diff: fmtYuan(diff) }) };
}

const toFaBalance = (r: TbRow): FaBalanceRow => ({
  code: r.accountCode, name: r.accountName,
  openingDebit: r.openingDr / 100, openingCredit: r.openingCr / 100, debit: r.periodDr / 100, credit: r.periodCr / 100,
  closingDebit: r.closingDr / 100, closingCredit: r.closingCr / 100,
});
const toFaJournal = (r: JournalRow): FaJournalRow => ({
  date: r.date, voucherNo: r.voucherNo, summary: r.summary, accountCode: r.accountCode, accountName: r.accountName,
  debit: r.debit / 100, credit: r.credit / 100, counterparty: r.counterparty || undefined,
});
const cents = (yuan: number | null | undefined) => Math.round((yuan || 0) * 100);

function cnTies(input: TrialInput, tol: number): FauTieCheck[] {
  const st = buildStatements(input.tb.map(toFaBalance), input.journal.map(toFaJournal));
  const line = (lines: typeof st.balanceSheet, key: string) => lines.find((l) => l.key === key);
  const assets = line(st.balanceSheet, 'totalAssets');
  const le = line(st.balanceSheet, 'totalLiabEquity');
  const np = line(st.income, 'netProfit');
  const retained = line(st.balanceSheet, 'retained');
  const cash = line(st.balanceSheet, 'cash');
  const cfNet = line(st.cashflow, 'netIncrease');
  const out: FauTieCheck[] = [
    tie('bs', cents(assets?.current), cents(le?.current), tol, i18nKey('资产总计 {left} = 负债和所有者权益总计 {right}'), i18nKey('资产总计 {left} ≠ 负债和所有者权益总计 {right}，差 {diff}')),
    tie('np_retained', cents(np?.current), cents((retained?.current || 0) - (retained?.prior || 0)), tol,
      i18nKey('净利润 {left} = 未分配利润本期增加 {right}'), i18nKey('净利润 {left} ≠ 未分配利润本期增加 {right}，差 {diff}：检查利润分配或结转')),
  ];
  if (input.journal.length) {
    out.push(tie('cashflow', cents(cfNet?.current), cents((cash?.current || 0) - (cash?.prior || 0)), tol,
      i18nKey('现金净增加额 {left} = 货币资金期末减期初 {right}'), i18nKey('现金净增加额 {left} ≠ 货币资金变动 {right}，差 {diff}：序时账与余额表的期间或范围不一致')));
  } else {
    out.push({ id: 'cashflow', ok: false, left: 0, right: cents((cash?.current || 0) - (cash?.prior || 0)), diff: 0, message: msg(i18nKey('没有本期序时账，现金流量勾稽无法执行')) });
  }
  return out;
}

function ifrsTies(input: TrialInput, top: TbRow[], tol: number): FauTieCheck[] {
  const cls = (r: TbRow) => accountNature(r.accountCode, r.accountName, 'ifrs', input.accountMap);
  const sumBy = (pred: (r: TbRow) => boolean, f: (r: TbRow) => number) => top.filter(pred).reduce((a, r) => a + f(r), 0);
  const closing = (r: TbRow) => signedBalance(cls(r), r.closingDr, r.closingCr);
  const opening = (r: TbRow) => signedBalance(cls(r), r.openingDr, r.openingCr);
  const isPl = (r: TbRow) => cls(r) === 'revenue' || cls(r) === 'expense';
  const assets = sumBy((r) => cls(r) === 'asset', closing);
  const liab = sumBy((r) => cls(r) === 'liability', closing);
  const equity = sumBy((r) => cls(r) === 'equity', closing);
  // 未结转损益：贷减借（收入为正、费用为负）
  const plOpen = sumBy(isPl, (r) => r.openingCr - r.openingDr);
  const plClose = sumBy(isPl, (r) => r.closingCr - r.closingDr);
  const netProfit = sumBy((r) => cls(r) === 'revenue', (r) => r.periodCr) - sumBy((r) => cls(r) === 'expense', (r) => r.periodDr);
  const isRetained = (r: TbRow) => {
    const m = input.accountMap.find((e) => e.code === r.accountCode);
    return m?.line === 'retained' || hasAny(r.accountName, KEYWORDS.retainedNames);
  };
  const retainedDelta = sumBy(isRetained, (r) => closing(r) - opening(r)) + (plClose - plOpen);
  const isCash = (r: TbRow) => {
    const m = input.accountMap.find((e) => e.code === r.accountCode);
    return m?.line === 'cash' || hasAny(r.accountName, KEYWORDS.cashNames);
  };
  const cashCodes = top.filter(isCash).map((r) => r.accountCode);
  const cashDelta = sumBy(isCash, (r) => closing(r) - opening(r));
  const journalCash = input.journal.filter((j) => cashCodes.some((c) => codeUnder(j.accountCode, c))).reduce((a, j) => a + j.debit - j.credit, 0);
  return [
    tie('bs', assets, liab + equity + plClose, tol, i18nKey('资产总计 {left} = 负债和所有者权益总计 {right}'), i18nKey('资产总计 {left} ≠ 负债和所有者权益总计 {right}，差 {diff}')),
    tie('np_retained', netProfit, retainedDelta, tol, i18nKey('净利润 {left} = 未分配利润本期增加 {right}'), i18nKey('净利润 {left} ≠ 未分配利润本期增加 {right}，差 {diff}：检查利润分配或结转')),
    tie('cashflow', journalCash, cashDelta, tol, i18nKey('现金净增加额 {left} = 货币资金期末减期初 {right}'), i18nKey('现金净增加额 {left} ≠ 货币资金变动 {right}，差 {diff}：序时账与余额表的期间或范围不一致')),
  ];
}

export function trialBalance(input: TrialInput): FauTrialResult {
  const th = input.th;
  const tol = th['tie.tolerance'] ?? 1;
  const top = topLevel(input.tb);
  const sum = (f: (r: TbRow) => number) => top.reduce((a, r) => a + f(r), 0);
  const totals = {
    openingDr: sum((r) => r.openingDr), openingCr: sum((r) => r.openingCr),
    periodDr: sum((r) => r.periodDr), periodCr: sum((r) => r.periodCr),
    closingDr: sum((r) => r.closingDr), closingCr: sum((r) => r.closingCr),
  };
  // 三组借贷里差得最大的那组决定分档
  const diffs = [totals.closingDr - totals.closingCr, totals.periodDr - totals.periodCr, totals.openingDr - totals.openingCr];
  const worst = diffs.reduce((a, d) => (Math.abs(d) > Math.abs(a) ? d : a), 0);
  const tier = diffTier(worst, th);
  const trial: FauTieCheck = {
    id: 'trial', ok: tier === 'ignore', left: totals.closingDr, right: totals.closingCr, diff: worst, tier,
    message: msg(TIER_MSG[tier], { diff: fmtYuan(worst), left: fmtYuan(totals.closingDr), right: fmtYuan(totals.closingCr) }),
  };

  const checks: FauTieCheck[] = [trial, ...(input.reportBasis === 'cn' ? cnTies(input, tol) : ifrsTies(input, top, tol))];

  if (input.tbPrior) {
    const prior = new Map(input.tbPrior.map((r) => [r.accountCode || r.accountName, r]));
    const details: NonNullable<FauTieCheck['details']> = [];
    for (const r of input.tb) {
      const p = prior.get(r.accountCode || r.accountName);
      const left = p ? p.closingDr - p.closingCr : 0;
      const right = r.openingDr - r.openingCr;
      if (Math.abs(left - right) > tol) details.push({ accountCode: r.accountCode, accountName: r.accountName, left, right, diff: left - right });
    }
    for (const p of input.tbPrior) {
      const key = p.accountCode || p.accountName;
      if (!input.tb.some((r) => (r.accountCode || r.accountName) === key) && Math.abs(p.closingDr - p.closingCr) > tol) {
        details.push({ accountCode: p.accountCode, accountName: p.accountName, left: p.closingDr - p.closingCr, right: 0, diff: p.closingDr - p.closingCr });
      }
    }
    checks.push({
      id: 'opening', ok: details.length === 0, left: 0, right: 0, diff: details.reduce((a, d) => a + d.diff, 0), details,
      message: details.length
        ? msg(i18nKey('{n} 个科目的本期期初与上期期末不一致'), { n: details.length })
        : msg(i18nKey('本期期初余额与上期期末余额逐科目一致')),
    });
  } else {
    checks.push({ id: 'opening', ok: false, left: 0, right: 0, diff: 0, message: msg(i18nKey('没有上期科目余额表，期初衔接无法核对')) });
  }
  return { totals, checks, balanced: tier === 'ignore' };
}
