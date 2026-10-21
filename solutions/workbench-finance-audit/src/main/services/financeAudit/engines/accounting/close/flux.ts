/**
 * A1 波动说明（variance-commentary）的计算部分：超阈值或必评科目（收入、人工成本、现金），
 * 算对上期、对预算的差异，并把本期分录按往来单位（无则摘要）聚合，取贡献最大的前 N 条作驱动线索。
 *
 * 阈值：|差异| ≥ max(百分比 × |比较值|, 金额下限)。说明文字由模型写，回核由 skillRunner 做（fluxFacts 给数字）。
 * 损益类取本期发生（收入取贷方、费用取借方，与 buildStatements 同口径），资产负债类取期末余额。
 */
import type { FauAccountMapEntry, FauFluxDriver, FauFluxLine } from '@totalclaw/ipc-contracts';
import type { BudgetRow, JournalRow, TbRow } from '../../../types';
import { KEYWORDS, accountNature, codeUnder, hasAny, inPeriod, periodAmount, signedBalance, topLevel, yuan } from '../common';

export interface FluxInput {
  tb: TbRow[];
  tbPrior: TbRow[] | null;
  budget: BudgetRow[] | null;
  journal: JournalRow[];
  reportBasis: 'cn' | 'ifrs';
  th: Record<string, number>;
  topN?: number;
  accountMap?: FauAccountMapEntry[];
  /** 只取这一期的分录；不给 = 全部 */
  period?: string;
}

function mustReview(code: string, name: string): boolean {
  const under = (prefixes: string[]) => prefixes.some((p) => codeUnder(code, p));
  return under(KEYWORDS.revenueCodePrefixes) || hasAny(name, KEYWORDS.revenueNames)
    || under(KEYWORDS.laborCodePrefixes) || hasAny(name, KEYWORDS.laborNames)
    || under(KEYWORDS.cashCodePrefixes) || hasAny(name, KEYWORDS.cashNames);
}

export function fluxLines(input: FluxInput): FauFluxLine[] {
  const pct = input.th['flux.pct'] ?? 0.05;
  const floor = input.th['flux.floor'] ?? 1000000;
  const topN = input.topN ?? input.th['flux.topN'] ?? 3;
  const map = input.accountMap || [];
  const prior = new Map((input.tbPrior || []).map((r) => [r.accountCode || r.accountName, r]));
  const journal = input.period ? input.journal.filter((j) => inPeriod(j.date, input.period!)) : input.journal;
  const out: FauFluxLine[] = [];
  for (const r of topLevel(input.tb)) {
    const cls = accountNature(r.accountCode, r.accountName, input.reportBasis, map);
    const current = periodAmount(cls, r);
    const p = prior.get(r.accountCode || r.accountName);
    const priorValue = p ? periodAmount(cls, p) : 0;
    const budgetRows = (input.budget || []).filter((b) => (b.accountCode && codeUnder(b.accountCode, r.accountCode)) || (!b.accountCode && b.accountName === r.accountName));
    const budget = budgetRows.length ? budgetRows.reduce((a, b) => a + b.amount, 0) : null;
    const diffPrior = current - priorValue;
    const diffBudget = budget == null ? null : current - budget;
    const over = (diff: number, base: number) => Math.abs(diff) >= Math.max(pct * Math.abs(base), floor);
    const overThreshold = over(diffPrior, priorValue) || (diffBudget != null && over(diffBudget, budget!));
    const must = mustReview(r.accountCode, r.accountName);
    if (!overThreshold && !must) continue;
    // 驱动线索：本期该科目的分录按往来单位（无则摘要）聚合
    const groups = new Map<string, FauFluxDriver>();
    for (const j of journal.filter((x) => codeUnder(x.accountCode, r.accountCode))) {
      const label = j.counterparty || j.summary || j.voucherNo;
      const g = groups.get(label) || { label, amount: 0, count: 0 };
      g.amount += signedBalance(cls, j.debit, j.credit);
      g.count += 1;
      groups.set(label, g);
    }
    const drivers = [...groups.values()].sort((a, b) => Math.abs(b.amount) - Math.abs(a.amount)).slice(0, topN);
    out.push({
      accountCode: r.accountCode, accountName: r.accountName, current, prior: priorValue, budget,
      diffPrior, diffPriorPct: priorValue ? diffPrior / Math.abs(priorValue) : null, diffBudget,
      reason: overThreshold ? 'threshold' : 'must_review', drivers, commentary: '', commentaryStatus: 'none',
    });
  }
  return out;
}

/** 给回核用的数字（元 / 百分数）：本期、上期、预算、差额、各驱动金额 */
export function fluxFacts(line: FauFluxLine): { amounts: number[]; percents: number[] } {
  const amounts = [line.current, line.prior, line.diffPrior, ...line.drivers.map((d) => d.amount)];
  const percents: number[] = [];
  if (line.budget != null) amounts.push(line.budget);
  if (line.diffBudget != null) amounts.push(line.diffBudget);
  if (line.diffPriorPct != null) percents.push(Math.round(line.diffPriorPct * 10000) / 100);
  if (line.diffBudget != null && line.budget) percents.push(Math.round((line.diffBudget / Math.abs(line.budget)) * 10000) / 100);
  return { amounts: amounts.map(yuan), percents };
}
