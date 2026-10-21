/**
 * 财务报表智能体（纯函数）：科目余额 → 资产负债表、利润表；序时账 → 现金流量表（直接法）；勾稽校验。
 *
 * 取数按一级科目**名称**归类（小企业会计准则与企业会计准则编码不同，名称是共同口径）。
 * 余额表里父子科目同时出现时只取一级，避免重复计数。认不出的科目不静默丢掉：列进校验结果。
 */
import { t as i18nT } from '@totalclaw/i18n';
import type { FaBalanceRow, FaCheck, FaJournalRow, FaReportLine } from '@totalclaw/ipc-contracts';
import { fmt, plNature, round2, sum } from './common';
import MAP from './reportMap.json';

type MapEntry = { key: string; names: string[]; sign?: number };
const BS_ASSET = MAP.balanceSheet.assets as MapEntry[];
const BS_LIAB = MAP.balanceSheet.liabilities as MapEntry[];
const BS_EQUITY = MAP.balanceSheet.equity as MapEntry[];
const IS_MAP = MAP.income as MapEntry[];
const CF_MAP = MAP.cashflow as Record<string, string[]>;
const CASH_NAMES: string[] = MAP.cashNames;

export function firstLevelName(name: string): string {
  return String(name || '').split(/[-_/\\—]/)[0].trim();
}

/** 只留一级科目：有编码时去掉被别的编码作前缀的行；没编码时只留能认出名字的一级科目 */
export function topLevelRows(rows: FaBalanceRow[]): FaBalanceRow[] {
  const withCode = rows.filter((r) => /^\d{4,}$/.test(r.code));
  if (withCode.length >= rows.length * 0.8) {
    const codes = withCode.map((r) => r.code);
    return withCode.filter((r) => !codes.some((c) => c !== r.code && r.code.startsWith(c)));
  }
  const known = new Set([...BS_ASSET, ...BS_LIAB, ...BS_EQUITY, ...IS_MAP].flatMap((e) => e.names));
  // 没编码时靠名字：只认得出的一级科目（子科目名单独出现时分不清归属，宁缺不重复计数）
  return rows.filter((r) => known.has(r.name.trim()));
}

const net = (debit: number, credit: number) => round2(debit - credit);

function label(key: string): string {
  const L: Record<string, string> = {
    cash: i18nT('货币资金'), shortInvest: i18nT('短期投资'), notesRecv: i18nT('应收票据'), ar: i18nT('应收账款'), prepay: i18nT('预付账款'),
    otherRecv: i18nT('其他应收款'), inventory: i18nT('存货'), otherCurrent: i18nT('其他流动资产'), currentAssets: i18nT('流动资产合计'),
    longInvest: i18nT('长期投资'), fixed: i18nT('固定资产净值'), cip: i18nT('在建工程'), intangible: i18nT('无形资产净值'),
    ltPrepaid: i18nT('长期待摊费用'), otherNonCurrent: i18nT('其他非流动资产'), nonCurrentAssets: i18nT('非流动资产合计'), totalAssets: i18nT('资产总计'),
    shortLoan: i18nT('短期借款'), notesPay: i18nT('应付票据'), ap: i18nT('应付账款'), advance: i18nT('预收账款'), payroll: i18nT('应付职工薪酬'),
    taxes: i18nT('应交税费'), interestPay: i18nT('应付利息'), profitPay: i18nT('应付利润'), otherPay: i18nT('其他应付款'),
    otherCurrentLiab: i18nT('其他流动负债'), currentLiab: i18nT('流动负债合计'), longLoan: i18nT('长期借款'), longPay: i18nT('长期应付款'),
    nonCurrentLiab: i18nT('非流动负债合计'), totalLiab: i18nT('负债合计'), paidIn: i18nT('实收资本'), capitalReserve: i18nT('资本公积'),
    surplus: i18nT('盈余公积'), retained: i18nT('未分配利润'), totalEquity: i18nT('所有者权益合计'), totalLiabEquity: i18nT('负债和所有者权益总计'),
    revenue: i18nT('营业收入'), cost: i18nT('营业成本'), taxSurcharge: i18nT('税金及附加'), selling: i18nT('销售费用'), admin: i18nT('管理费用'),
    rd: i18nT('研发费用'), finance: i18nT('财务费用'), investIncome: i18nT('投资收益'), operatingProfit: i18nT('营业利润'),
    nonOpIncome: i18nT('营业外收入'), nonOpExpense: i18nT('营业外支出'), totalProfit: i18nT('利润总额'), incomeTax: i18nT('所得税费用'), netProfit: i18nT('净利润'),
  };
  return L[key] || key;
}

export interface StatementOutput {
  balanceSheet: FaReportLine[];
  income: FaReportLine[];
  cashflow: FaReportLine[];
  checks: FaCheck[];
}

/**
 * @param rows 本期科目余额表（含期初、本期发生、期末）
 * @param journal 本期序时账（算现金流量表；没有就只给净增加额）
 * @param priorIncome 上期利润表（比较列，可选）
 */
export function buildStatements(rows: FaBalanceRow[], journal: FaJournalRow[], priorIncome?: FaReportLine[]): StatementOutput {
  const top = topLevelRows(rows);
  const checks: FaCheck[] = [];
  const used = new Set<FaBalanceRow>();
  const pick = (names: string[]) => top.filter((r) => names.includes(firstLevelName(r.name)));

  const bsLine = (e: MapEntry, assetSide: boolean): FaReportLine => {
    const hit = pick(e.names);
    hit.forEach((r) => used.add(r));
    const s = e.sign ?? 1;
    const cur = sum(hit.map((r) => (assetSide ? net(r.closingDebit, r.closingCredit) : net(r.closingCredit, r.closingDebit)) * s));
    const pri = sum(hit.map((r) => (assetSide ? net(r.openingDebit, r.openingCredit) : net(r.openingCredit, r.openingDebit)) * s));
    return { key: e.key, label: label(e.key), current: cur, prior: pri, indent: 1, source: hit.map((r) => r.name).join(i18nT('、')) || undefined };
  };

  // 损益类科目余额（期末没结转时）并进未分配利润，保证表平
  const plRows = top.filter((r) => plNature(r.name));
  plRows.forEach((r) => used.add(r));
  const plResidual = sum(plRows.map((r) => net(r.closingCredit, r.closingDebit)));
  const plResidualOpen = sum(plRows.map((r) => net(r.openingCredit, r.openingDebit)));

  const assets = BS_ASSET.map((e) => bsLine(e, true));
  const liabs = BS_LIAB.map((e) => bsLine(e, false));
  const equity = BS_EQUITY.map((e) => bsLine(e, false));
  const retained = equity.find((l) => l.key === 'retained');
  if (retained && (plResidual || plResidualOpen)) {
    retained.current = round2(retained.current + plResidual);
    retained.prior = round2((retained.prior || 0) + plResidualOpen);
    checks.push({ code: 'pl_unclosed', level: 'warn', message: i18nT('损益类科目期末还有余额 {p0}（未结转），已并入未分配利润', { p0: fmt(plResidual) }) });
  }

  // 认不出的资产负债类科目：按余额方向放进「其他」，并提示
  const unknown = top.filter((r) => !used.has(r) && (r.closingDebit || r.closingCredit || r.openingDebit || r.openingCredit));
  const otherA = assets.find((l) => l.key === 'otherCurrent')!;
  const otherL = liabs.find((l) => l.key === 'otherCurrentLiab')!;
  for (const r of unknown) {
    const n = net(r.closingDebit, r.closingCredit);
    const o = net(r.openingDebit, r.openingCredit);
    if (n >= 0) { otherA.current = round2(otherA.current + n); otherA.prior = round2((otherA.prior || 0) + o); } else { otherL.current = round2(otherL.current - n); otherL.prior = round2((otherL.prior || 0) - o); }
  }
  if (unknown.length) checks.push({ code: 'unmapped', level: 'warn', message: i18nT('{n} 个科目没能归类，已按余额方向计入其他流动资产 / 负债：{p0}', { n: unknown.length, p0: unknown.slice(0, 10).map((r) => r.name).join(i18nT('、')) }) });

  const total = (key: string, lines: FaReportLine[], bold = true): FaReportLine => ({
    key, label: label(key), current: sum(lines.map((l) => l.current)), prior: sum(lines.map((l) => l.prior || 0)), bold,
  });
  const currentKeys = new Set(['cash', 'shortInvest', 'notesRecv', 'ar', 'prepay', 'otherRecv', 'inventory', 'otherCurrent']);
  const curA = assets.filter((l) => currentKeys.has(l.key));
  const nonA = assets.filter((l) => !currentKeys.has(l.key));
  const currentLiabKeys = new Set(['shortLoan', 'notesPay', 'ap', 'advance', 'payroll', 'taxes', 'interestPay', 'profitPay', 'otherPay', 'otherCurrentLiab']);
  const curL = liabs.filter((l) => currentLiabKeys.has(l.key));
  const nonL = liabs.filter((l) => !currentLiabKeys.has(l.key));
  const tCurA = total('currentAssets', curA);
  const tNonA = total('nonCurrentAssets', nonA);
  const tAssets = total('totalAssets', [tCurA, tNonA]);
  const tCurL = total('currentLiab', curL);
  const tNonL = total('nonCurrentLiab', nonL);
  const tLiab = total('totalLiab', [tCurL, tNonL]);
  const tEq = total('totalEquity', equity);
  const tLE = total('totalLiabEquity', [tLiab, tEq]);
  const balanceSheet = [...curA, tCurA, ...nonA, tNonA, tAssets, ...curL, tCurL, ...nonL, tNonL, tLiab, ...equity, tEq, tLE];

  const gapNow = round2(tAssets.current - tLE.current);
  const gapOpen = round2((tAssets.prior || 0) - (tLE.prior || 0));
  checks.unshift(Math.abs(gapNow) < 0.01
    ? { code: 'bs_balanced', level: 'ok', message: i18nT('资产总计 = 负债和所有者权益总计（{p0}）', { p0: fmt(tAssets.current) }) }
    : { code: 'bs_unbalanced', level: 'error', message: i18nT('资产总计 {a} ≠ 负债和所有者权益总计 {b}，差 {c}', { a: fmt(tAssets.current), b: fmt(tLE.current), c: fmt(gapNow) }) });
  if (Math.abs(gapOpen) >= 0.01) checks.push({ code: 'bs_open_unbalanced', level: 'warn', message: i18nT('期初不平，差 {p0}：检查余额表的期初数', { p0: fmt(gapOpen) }) });

  const trialD = sum(top.map((r) => r.closingDebit));
  const trialC = sum(top.map((r) => r.closingCredit));
  checks.push(Math.abs(trialD - trialC) < 0.01
    ? { code: 'trial_ok', level: 'ok', message: i18nT('试算平衡：期末借方 = 期末贷方（{p0}）', { p0: fmt(trialD) }) }
    : { code: 'trial_bad', level: 'error', message: i18nT('试算不平：期末借方 {a}，期末贷方 {b}', { a: fmt(trialD), b: fmt(trialC) }) });

  // ─── 利润表：收入类取贷方发生额，成本费用类取借方发生额（结转分录在另一边，不影响） ───
  const movement = (e: MapEntry): number => {
    const hit = pick(e.names);
    const income = e.names.some((n) => plNature(n) === 'income');
    return sum(hit.map((r) => (income ? r.credit : r.debit)));
  };
  const priorOf = (key: string) => priorIncome?.find((l) => l.key === key)?.current ?? null;
  const is: Record<string, number> = Object.fromEntries(IS_MAP.map((e) => [e.key, movement(e)]));
  const opProfit = round2(is.revenue - is.cost - is.taxSurcharge - is.selling - is.admin - is.rd - is.finance + is.investIncome);
  const totalProfit = round2(opProfit + is.nonOpIncome - is.nonOpExpense);
  const netProfit = round2(totalProfit - is.incomeTax);
  const il = (key: string, value: number, bold = false, indent = 1): FaReportLine => ({ key, label: label(key), current: value, prior: priorOf(key), bold, indent });
  const income: FaReportLine[] = [
    il('revenue', is.revenue, true, 0), il('cost', is.cost), il('taxSurcharge', is.taxSurcharge), il('selling', is.selling), il('admin', is.admin),
    il('rd', is.rd), il('finance', is.finance), il('investIncome', is.investIncome), il('operatingProfit', opProfit, true, 0),
    il('nonOpIncome', is.nonOpIncome), il('nonOpExpense', is.nonOpExpense), il('totalProfit', totalProfit, true, 0),
    il('incomeTax', is.incomeTax), il('netProfit', netProfit, true, 0),
  ];

  // 净利润 ↔ 未分配利润变动（有利润分配时会有差，给提示不判错）
  if (retained) {
    const delta = round2(retained.current - (retained.prior || 0));
    checks.push(Math.abs(delta - netProfit) < 0.01
      ? { code: 'np_retained', level: 'ok', message: i18nT('净利润 {p0} = 未分配利润本期增加', { p0: fmt(netProfit) }) }
      : { code: 'np_retained_gap', level: 'warn', message: i18nT('净利润 {a}，未分配利润本期增加 {b}，差 {c}：若本期有利润分配或以前年度损益调整属正常，否则检查结转', { a: fmt(netProfit), b: fmt(delta), c: fmt(round2(delta - netProfit)) }) });
  }

  // ─── 现金流量表 ───
  const cashLine = balanceSheet.find((l) => l.key === 'cash')!;
  const cashDelta = round2(cashLine.current - (cashLine.prior || 0));
  const cashflow = buildCashflow(journal, cashLine.prior || 0);
  const cfNet = cashflow.find((l) => l.key === 'netIncrease');
  if (!journal.length) {
    checks.push({ code: 'cf_no_journal', level: 'warn', message: i18nT('没有序时账，现金流量表只能给出净增加额；导入序时账后可分项列示') });
  } else if (cfNet) {
    checks.push(Math.abs(cfNet.current - cashDelta) < 0.01
      ? { code: 'cf_ok', level: 'ok', message: i18nT('现金净增加额 {p0} = 货币资金期末 − 期初', { p0: fmt(cashDelta) }) }
      : { code: 'cf_gap', level: 'error', message: i18nT('现金流量表净增加额 {a} ≠ 货币资金变动 {b}：序时账与余额表的期间或范围不一致', { a: fmt(cfNet.current), b: fmt(cashDelta) }) });
  }
  if (!journal.length) {
    cashflow.splice(0, cashflow.length,
      { key: 'netIncrease', label: i18nT('现金及现金等价物净增加额'), current: cashDelta, prior: null, bold: true },
      { key: 'opening', label: i18nT('期初现金余额'), current: cashLine.prior || 0, prior: null },
      { key: 'closing', label: i18nT('期末现金余额'), current: cashLine.current, prior: null, bold: true });
  }
  return { balanceSheet, income, cashflow, checks };
}

/** 对方科目类别 + 现金流向 → 报表栏次（流入为正、流出为负地累加） */
function cashflowKey(kind: string, inflow: boolean): string {
  if (kind === 'invest') return inflow ? 'investIn' : 'investOut';
  if (kind === 'finance') return inflow ? 'financeIn' : 'financeOut';
  // 随货款一起收的销项税也算「销售商品收到的现金」
  if (inflow) return kind === 'opSales' || kind === 'opTaxes' ? 'opSales' : 'opOtherIn';
  // 流出：采购 / 职工 / 税费各归各栏；销售退款、其它一律进「支付其他」
  return kind === 'opPurchase' || kind === 'opPayroll' || kind === 'opTaxes' ? kind : 'opOtherOut';
}

/** 直接法：每张凭证的现金净流入按对方科目归类（多个对方科目按金额比例分摊） */
export function buildCashflow(journal: FaJournalRow[], openingCash: number): FaReportLine[] {
  const isCash = (n: string) => CASH_NAMES.includes(firstLevelName(n));
  const classify = (name: string): string => {
    const f = firstLevelName(name);
    for (const [key, names] of Object.entries(CF_MAP)) if (names.includes(f)) return key;
    return 'opOtherIn';
  };
  const buckets: Record<string, number> = {};
  const groups = new Map<string, FaJournalRow[]>();
  for (const r of journal) {
    const k = `${r.date}|${r.voucherNo}`;
    const g = groups.get(k) || [];
    g.push(r);
    groups.set(k, g);
  }
  for (const lines of groups.values()) {
    const cashNet = sum(lines.filter((l) => isCash(l.accountName)).map((l) => l.debit - l.credit));
    if (Math.abs(cashNet) < 0.005) continue;
    const others = lines.filter((l) => !isCash(l.accountName));
    const weight = sum(others.map((l) => Math.abs(l.debit - l.credit)));
    if (!others.length || weight === 0) continue;
    for (const l of others) {
      const share = round2((cashNet * Math.abs(l.debit - l.credit)) / weight);
      buckets[cashflowKey(classify(l.accountName), share >= 0)] = round2((buckets[cashflowKey(classify(l.accountName), share >= 0)] || 0) + share);
    }
  }
  const v = (k: string) => buckets[k] || 0;
  const L = (key: string, text: string, value: number, bold = false, indent = 1): FaReportLine => ({ key, label: text, current: round2(value), prior: null, bold, indent });
  const opIn = round2(v('opSales') + v('opOtherIn'));
  const opOut = round2(v('opPurchase') + v('opPayroll') + v('opTaxes') + v('opOtherOut'));
  const opNet = round2(opIn + opOut);
  const invNet = round2(v('investIn') + v('investOut'));
  const finNet = round2(v('financeIn') + v('financeOut'));
  const netInc = round2(opNet + invNet + finNet);
  return [
    L('opSales', i18nT('销售商品、提供劳务收到的现金'), v('opSales')),
    L('opOtherIn', i18nT('收到其他与经营活动有关的现金'), v('opOtherIn')),
    L('opPurchase', i18nT('购买商品、接受劳务支付的现金'), -v('opPurchase')),
    L('opPayroll', i18nT('支付给职工以及为职工支付的现金'), -v('opPayroll')),
    L('opTaxes', i18nT('支付的各项税费'), -v('opTaxes')),
    L('opOtherOut', i18nT('支付其他与经营活动有关的现金'), -v('opOtherOut')),
    L('opNet', i18nT('经营活动产生的现金流量净额'), opNet, true, 0),
    L('investIn', i18nT('投资活动现金流入'), v('investIn')),
    L('investOut', i18nT('投资活动现金流出'), -v('investOut')),
    L('investNet', i18nT('投资活动产生的现金流量净额'), invNet, true, 0),
    L('financeIn', i18nT('筹资活动现金流入'), v('financeIn')),
    L('financeOut', i18nT('筹资活动现金流出'), -v('financeOut')),
    L('financeNet', i18nT('筹资活动产生的现金流量净额'), finNet, true, 0),
    L('netIncrease', i18nT('现金及现金等价物净增加额'), netInc, true, 0),
    L('opening', i18nT('期初现金余额'), openingCash, false, 0),
    L('closing', i18nT('期末现金余额'), round2(openingCash + netInc), true, 0),
  ];
}

/** 经营简要分析的数字底稿（给模型写文字用；模型不许改数字） */
export function analysisFacts(income: FaReportLine[], balanceSheet: FaReportLine[]): Record<string, number | null> {
  const g = (lines: FaReportLine[], k: string) => lines.find((l) => l.key === k);
  const rev = g(income, 'revenue');
  const cost = g(income, 'cost');
  const gross = rev && cost ? round2(rev.current - cost.current) : null;
  const grossPrior = rev?.prior != null && cost?.prior != null ? round2(rev.prior - cost.prior) : null;
  const expenses = ['selling', 'admin', 'finance', 'rd'].map((k) => g(income, k));
  return {
    revenue: rev?.current ?? null,
    revenuePrior: rev?.prior ?? null,
    grossProfit: gross,
    grossMargin: gross != null && rev?.current ? round2((gross / rev.current) * 10000) / 10000 : null,
    grossProfitPrior: grossPrior,
    expenses: sum(expenses.map((l) => l?.current || 0)),
    expensesPrior: expenses.every((l) => l?.prior != null) ? sum(expenses.map((l) => l!.prior || 0)) : null,
    netProfit: g(income, 'netProfit')?.current ?? null,
    netProfitPrior: g(income, 'netProfit')?.prior ?? null,
    cash: g(balanceSheet, 'cash')?.current ?? null,
    ar: g(balanceSheet, 'ar')?.current ?? null,
    totalAssets: g(balanceSheet, 'totalAssets')?.current ?? null,
    totalLiab: g(balanceSheet, 'totalLiab')?.current ?? null,
  };
}
