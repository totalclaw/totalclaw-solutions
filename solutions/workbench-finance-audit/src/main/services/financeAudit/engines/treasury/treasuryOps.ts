/**
 * E2 司库（纯函数）：
 *   authorizationReview  大额 / 异常付款授权复核：只给建议（建议放行由有权人审批 / 补充资料 / 暂缓 / 建议拒绝），**从不批准、不付款**；
 *   cashPool             现金池方案：子账户留足安全线后上划、不足的下拨，测算归集后的利息增益；
 *   bankScores           银行关系评分：业务量、利率、响应、创新、合作五维加权，授信使用率与到期提醒；
 *   lcr                  LCR / NSFR：巴塞尔 III 口径（二级资产折算与 15% / 40% 上限、流入封顶 75%）。
 * 规则来源：finance-skills treasury-management / treasury-advanced 与判断框架；LCR 公式见 BCBS 238 附件 1、NSFR 见 BCBS 295。
 */
import { i18nKey } from '@totalclaw/i18n';
import type {
  FauAuthAdvice, FauAuthCheck, FauAuthReview, FauBankScore, FauCashPool, FauLcrLine, FauLcrResult, FauLiquidityCategory, FauMsg, FauPoolAccount,
} from '@totalclaw/ipc-contracts';
import type { BankBalanceRow, CreditFacilityRow, LiquidityItemRow, PaymentRequestRow } from './types';
import { daysBetween, ratio, sum } from './common';

type Th = Record<string, number>;
const yuan = (c: number) => (c / 100).toFixed(2);

export function authorizationReview(reqs: PaymentRequestRow[], balances: BankBalanceRow[], th: Th): FauAuthReview[] {
  return reqs.map((r, i) => {
    const checks: FauAuthCheck[] = [];
    const c = (id: string, ok: boolean, level: 'warn' | 'block', message: FauMsg) => checks.push({ id, ok, level, message });
    if (r.personalAccount) c('personal', false, 'block', { key: i18nKey('收款方为个人账户：公司资金不得转至个人账户') });
    if (r.accountChanged) c('account_changed', false, 'block', { key: i18nKey('收款账户已变更：冻结该笔，联系供应商原对接人核实') });
    if (r.approvalLimit != null) c('approval_limit', r.amount <= r.approvalLimit, 'block', r.amount <= r.approvalLimit ? { key: i18nKey('在审批权限内') } : { key: i18nKey('超出审批权限 {p0}'), params: { p0: yuan(r.approvalLimit) } });
    if (r.contractAmount != null) {
      const paid = (r.paidToDate || 0) + r.amount;
      c('contract', paid <= r.contractAmount, 'warn', paid <= r.contractAmount
        ? { key: i18nKey('累计付款 {p0} 未超过合同金额 {p1}'), params: { p0: yuan(paid), p1: yuan(r.contractAmount) } }
        : { key: i18nKey('累计付款 {p0} 超过合同金额 {p1}'), params: { p0: yuan(paid), p1: yuan(r.contractAmount) } });
    } else {
      c('contract', false, 'warn', { key: i18nKey('没有合同金额，无法核对合同覆盖') });
    }
    if (r.invoiceAmount != null) {
      const ok = Math.abs(r.invoiceAmount - r.amount) <= th['auth.invoiceTol'];
      c('invoice', ok, 'warn', ok ? { key: i18nKey('发票金额与付款金额一致') } : { key: i18nKey('发票金额 {p0} 与付款金额不一致'), params: { p0: yuan(r.invoiceAmount) } });
    } else if (r.contractAmount) {
      const pre = r.amount / r.contractAmount;
      if (pre > th['auth.prepayRatioWarn']) c('prepay', false, 'warn', { key: i18nKey('无发票预付 {p0}% 超过提醒线，需说明'), params: { p0: (pre * 100).toFixed(1) } });
    }
    if (r.newSupplier) c('new_supplier', false, 'warn', { key: i18nKey('新供应商首单：核实资质与收款账户') });
    const acct = balances.find((b) => b.account && b.account === r.payFrom);
    const balanceAfter = acct ? acct.bankBalance - acct.restricted - r.amount : null;
    if (balanceAfter != null && balanceAfter < 0) c('balance', false, 'block', { key: i18nKey('付款账户可用余额不足') });
    else if (balanceAfter != null && acct?.safetyLine != null && balanceAfter < acct.safetyLine) c('balance', false, 'warn', { key: i18nKey('付款后余额低于安全线') });
    const failed = checks.filter((x) => !x.ok);
    const advice: FauAuthAdvice = r.personalAccount ? 'reject_recommend'
      : failed.some((x) => x.level === 'block') ? 'hold'
        : failed.length ? 'request_docs' : 'proceed';
    return { id: r.id || `R${i + 1}`, row: r.row, payee: r.payee, amount: r.amount, advice, large: r.amount >= th['auth.largeEscalate'], balanceAfter, checks };
  });
}

export function cashPool(rows: BankBalanceRow[], local: string, th: Th): FauCashPool {
  const excluded: FauCashPool['excluded'] = [];
  const eligible = rows.filter((r) => {
    const ok = !r.currency || r.currency === local;
    if (!ok) excluded.push({ account: r.account, reason: { key: i18nKey('币种 {p0} 与本位币不同，不入本位币资金池'), params: { p0: r.currency } } });
    return ok;
  });
  const header = [...eligible].sort((a, b) => b.bankBalance - a.bankBalance)[0];
  const accounts: FauPoolAccount[] = eligible.filter((r) => r !== header).map((r) => {
    const target = Math.max(0, r.safetyLine ?? 0);
    return { row: r.row, account: r.account, entity: r.entity, bank: r.bank, balance: r.bankBalance, restricted: r.restricted, target, sweep: r.bankBalance - r.restricted - target, rate: r.depositRate ?? th['pool.demandRate'] };
  });
  const sweepUp = sum(accounts.filter((a) => a.sweep > 0).map((a) => a.sweep));
  const sweepDown = sum(accounts.filter((a) => a.sweep < 0).map((a) => -a.sweep));
  const investRate = th['pool.investRate'];
  return {
    header: header?.account || '', currency: local, accounts, sweepUp, sweepDown,
    pooled: (header ? header.bankBalance - header.restricted : 0) + sweepUp - sweepDown,
    interestGain: Math.round(sum(accounts.filter((a) => a.sweep > 0).map((a) => a.sweep * Math.max(0, investRate - a.rate)))),
    investRate, excluded,
  };
}

const MISSING_SCORE: Record<'response' | 'innovation' | 'cooperation', string> = {
  response: i18nKey('没有响应速度评分，按 5 分计'), innovation: i18nKey('没有产品创新评分，按 5 分计'), cooperation: i18nKey('没有合作意愿评分，按 5 分计'),
};

const clampScore = (v: number | null): number | null => (v == null || !Number.isFinite(v) ? null : Math.min(10, Math.max(1, v)));

export function bankScores(fac: CreditFacilityRow[], balances: BankBalanceRow[], asOf: string, th: Th): FauBankScore[] {
  const names = [...new Set(fac.map((f) => f.bank.trim()).filter(Boolean))];
  const raw = names.map((bank) => {
    const fs = fac.filter((f) => f.bank.trim() === bank);
    const limit = sum(fs.map((f) => f.limit));
    const used = sum(fs.map((f) => f.used));
    const rated = fs.filter((f) => f.rate != null && f.limit > 0);
    const rate = rated.length ? sum(rated.map((f) => f.rate! * f.limit)) / sum(rated.map((f) => f.limit)) : null;
    const deposits = sum(balances.filter((b) => b.bank.trim() === bank).map((b) => b.bankBalance));
    const expiry = fs.map((f) => f.expiry).filter(Boolean).sort()[0] || '';
    const avg = (k: 'response' | 'innovation' | 'cooperation') => { const xs = fs.map((f) => clampScore(f[k])).filter((x): x is number => x != null); return xs.length ? sum(xs) / xs.length : null; };
    return { bank, limit, used, rate, deposits, expiry, response: avg('response'), innovation: avg('innovation'), cooperation: avg('cooperation') };
  });
  const volume = raw.map((r) => r.used + r.deposits);
  const totalVol = sum(volume);
  const maxShare = Math.max(0, ...volume.map((v) => (totalVol ? v / totalVol : 0)));
  const rates = raw.map((r) => r.rate).filter((x): x is number => x != null && x > 0);
  const minRate = rates.length ? Math.min(...rates) : null;
  const w = { volume: th['bank.weightVolume'], rate: th['bank.weightRate'], response: th['bank.weightResponse'], innovation: th['bank.weightInnovation'], cooperation: th['bank.weightCooperation'] };
  const wSum = sum(Object.values(w)) || 1;
  return raw.map((r, i): FauBankScore => {
    const flags: FauMsg[] = [];
    const share = totalVol ? volume[i] / totalVol : 0;
    const sv = maxShare ? (10 * share) / maxShare : 0;
    let sr = 5;
    if (r.rate != null && r.rate > 0 && minRate) sr = (10 * minRate) / r.rate; else flags.push({ key: i18nKey('没有利率，利率维度按 5 分计') });
    const subj = (k: 'response' | 'innovation' | 'cooperation') => { if (r[k] == null) { flags.push({ key: MISSING_SCORE[k] }); return 5; } return r[k]!; };
    const scores = { volume: sv, rate: sr, response: subj('response'), innovation: subj('innovation'), cooperation: subj('cooperation') };
    const total = (scores.volume * w.volume + scores.rate * w.rate + scores.response * w.response + scores.innovation * w.innovation + scores.cooperation * w.cooperation) / wSum;
    const utilization = ratio(r.used, r.limit);
    if (utilization != null && utilization >= th['bank.utilBreach']) flags.push({ key: i18nKey('授信使用率 {p0}% 已越线'), params: { p0: (utilization * 100).toFixed(1) } });
    else if (utilization != null && utilization >= th['bank.utilWatch']) flags.push({ key: i18nKey('授信使用率 {p0}% 需关注'), params: { p0: (utilization * 100).toFixed(1) } });
    const expiringSoon = !!r.expiry && daysBetween(asOf, r.expiry) <= th['bank.renewalDays'];
    if (expiringSoon) flags.push({ key: i18nKey('授信 {p0} 到期，应启动续期'), params: { p0: r.expiry } });
    return {
      bank: r.bank, limit: r.limit, used: r.used, utilization, rate: r.rate, deposits: r.deposits, volumeShare: share, scores, total,
      tier: total >= th['bank.coreMin'] ? 'core' : total >= th['bank.keyMin'] ? 'key' : 'general', expiry: r.expiry, expiringSoon, flags,
    };
  }).sort((a, b) => b.total - a.total);
}

export function lcr(items: LiquidityItemRow[], th: Th): FauLcrResult {
  const def: Record<FauLiquidityCategory, number> = {
    hqla_l1: 1, hqla_l2a: th['lcr.l2aFactor'], hqla_l2b: th['lcr.l2bFactor'], outflow: th['lcr.outflowDefault'], inflow: th['lcr.inflowDefault'], asf: 1, rsf: 1,
  };
  const lines: FauLcrLine[] = items.map((r) => {
    const factor = r.factor ?? def[r.category];
    return { row: r.row, item: r.item, category: r.category, amount: r.amount, factor, weighted: Math.round(r.amount * factor) };
  });
  const tot = (c: FauLiquidityCategory) => sum(lines.filter((l) => l.category === c).map((l) => l.weighted));
  const l1 = tot('hqla_l1');
  const l2a = tot('hqla_l2a');
  const l2b = tot('hqla_l2b');
  // BCBS 238 附件 1：二级 B 不超过 HQLA 的 15%、二级合计不超过 40%
  const adj15 = Math.round(Math.max(l2b - (15 / 85) * (l1 + l2a), l2b - (15 / 60) * l1, 0));
  const adj40 = Math.round(Math.max(l2a + l2b - adj15 - (2 / 3) * l1, 0));
  const hqla = l1 + l2a + l2b - adj15 - adj40;
  const outflows = tot('outflow');
  const inflows = tot('inflow');
  const inflowsCapped = Math.min(inflows, Math.round(outflows * th['lcr.inflowCap']));
  const netOutflows = outflows - inflowsCapped;
  const lcrV = netOutflows > 0 ? hqla / netOutflows : null;
  const asf = tot('asf');
  const rsf = tot('rsf');
  const nsfr = rsf > 0 ? asf / rsf : null;
  return {
    lines, hqla: { l1, l2a, l2b, adj15, adj40, total: hqla }, outflows, inflows, inflowsCapped, netOutflows,
    lcr: lcrV, lcrStatus: lcrV == null ? 'ok' : lcrV < th['lcr.min'] ? 'breach' : lcrV < th['lcr.target'] ? 'watch' : 'ok',
    asf, rsf, nsfr, nsfrStatus: nsfr == null ? 'ok' : nsfr < th['nsfr.min'] ? 'breach' : 'ok',
  };
}
