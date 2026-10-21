/**
 * F1 估值建模（纯函数）：DCF、LBO、三表联动、可比公司、多方法估值整合。
 * 口径取自 financial-services dcf-model / lbo-model / 3-statement-model / comps-analysis 与 finance-skills m-and-a 的技能说明：
 *   - DCF：FCFF = EBIT × (1 − 税率) + 折旧摊销 − 资本开支 − 营运资本增加；期中折现期 0.5、1.5…，终值按最后一期折现（期中时 N − 0.5）；
 *     终值占企业价值 > 75% 出黄旗、< 40% 提示偏保守；永续增长率必须小于 WACC。
 *   - LBO：利息按期初余额算（不做循环引用）；强制还本后的超额现金按扫款比例提前还优先债；IRR = MOIC^(1/N) − 1（无期间分红）。
 *   - 三表：现金是现金流量表的结果（不倒挤），资产 = 负债 + 权益逐年检查。
 */
import { i18nKey } from '@totalclaw/i18n';
import type { FauMsg } from '@totalclaw/ipc-contracts';
import { thresholdsFor } from '../../thresholds';
import { cn, cs, n, nOpt, rows, s, type CapIn } from './inputs';
import { grid5, mean, quantile, sum } from './math';
import { L, col, info, k, met, msg, numText, pctText, tbl, warn, type CapEngine, type CapOut } from './types';

/** 终值占比的两条线：thresholds/valuation.json 默认值，公司档案可覆盖（runner 经 v.th 传入） */
function tvLines(v: CapIn): { high: number; low: number } {
  const th = v.th ?? thresholdsFor('valuation');
  return { high: th['dcf.terminalShareHigh'], low: th['dcf.terminalShareLow'] };
}

// ── WACC ──
export interface WaccIn { riskFree: number; beta: number; erp: number; sizePremium: number; costDebt: number; taxRate: number; debtWeight: number }
export function waccOf(w: WaccIn): { ke: number; kdAfterTax: number; wacc: number } {
  const ke = w.riskFree + w.beta * w.erp + w.sizePremium;
  const kdAfterTax = w.costDebt * (1 - w.taxRate);
  return { ke, kdAfterTax, wacc: (1 - w.debtWeight) * ke + w.debtWeight * kdAfterTax };
}

// ── DCF ──
export interface DcfYear { year: string; revenue: number; ebit: number; da: number; capex: number; nwcChange: number }
export interface DcfIn extends WaccIn { method: 'gordon' | 'exit'; g: number; exitMultiple: number; midYear: boolean; netDebt: number; shares: number | null; forecast: DcfYear[] }
export interface DcfRow extends DcfYear { nopat: number; fcff: number; t: number; df: number; pv: number }
export interface DcfResult {
  ke: number; kdAfterTax: number; wacc: number; rows: DcfRow[]; sumPv: number; tv: number; tvPeriod: number; pvTv: number; ev: number; tvShare: number;
  equity: number; perShare: number | null; impliedExitMultiple: number | null; impliedGrowth: number | null;
  grid: { rowLabel: 'wacc'; colLabel: 'g' | 'multiple'; rows: number[]; cols: number[]; ev: (number | null)[][]; perShare: (number | null)[][] };
}

function tvOf(d: DcfIn, last: DcfRow, wacc: number, g: number, multiple: number): number | null {
  if (d.method === 'exit') return (last.ebit + last.da) * multiple;
  // 浮点误差：WACC 与 g 相差不到 1e-9 视为相等（终值无意义）
  return wacc - g > 1e-9 ? last.fcff * (1 + g) / (wacc - g) : null;
}

export function dcf(d: DcfIn): DcfResult {
  const { ke, kdAfterTax, wacc } = waccOf(d);
  const shift = d.midYear ? 0.5 : 0;
  const rows: DcfRow[] = d.forecast.map((y, i) => {
    const nopat = y.ebit * (1 - d.taxRate);
    const fcff = nopat + y.da - y.capex - y.nwcChange;
    const t = i + 1 - shift;
    const df = 1 / (1 + wacc) ** t;
    return { ...y, nopat, fcff, t, df, pv: fcff * df };
  });
  const last = rows[rows.length - 1];
  const tvPeriod = rows.length - shift;
  const evAt = (w: number, g: number, mult: number): number | null => {
    const tv = tvOf(d, last, w, g, mult);
    if (tv === null) return null;
    return sum(rows.map((r) => r.fcff / (1 + w) ** r.t)) + tv / (1 + w) ** tvPeriod;
  };
  const tv = tvOf(d, last, wacc, d.g, d.exitMultiple) ?? NaN;
  const pvTv = tv / (1 + wacc) ** tvPeriod;
  const sumPv = sum(rows.map((r) => r.pv));
  const ev = sumPv + pvTv;
  const equity = ev - d.netDebt;
  const lastEbitda = last.ebit + last.da;
  const waccs = grid5(wacc, 0.005);
  const cols = d.method === 'exit' ? grid5(d.exitMultiple, 1) : grid5(d.g, 0.005);
  const evGrid = waccs.map((w) => cols.map((c) => (d.method === 'exit' ? evAt(w, d.g, c) : evAt(w, c, d.exitMultiple))));
  return {
    ke, kdAfterTax, wacc, rows, sumPv, tv, tvPeriod, pvTv, ev, tvShare: pvTv / ev, equity,
    perShare: d.shares && d.shares > 0 ? equity / d.shares : null,
    impliedExitMultiple: d.method === 'gordon' && lastEbitda > 0 ? tv / lastEbitda : null,
    impliedGrowth: d.method === 'exit' && tv + last.fcff !== 0 ? (tv * wacc - last.fcff) / (tv + last.fcff) : null,
    grid: {
      rowLabel: 'wacc', colLabel: d.method === 'exit' ? 'multiple' : 'g', rows: waccs, cols, ev: evGrid,
      perShare: evGrid.map((r) => r.map((e) => (e === null || !d.shares ? null : (e - d.netDebt) / d.shares))),
    },
  };
}

export function dcfInput(v: CapIn): DcfIn {
  return {
    riskFree: n(v, 'riskFree'), beta: n(v, 'beta'), erp: n(v, 'erp'), sizePremium: n(v, 'sizePremium'), costDebt: n(v, 'costDebt'), taxRate: n(v, 'taxRate'),
    debtWeight: n(v, 'debtWeight'), method: s(v, 'terminalMethod') === 'exit' ? 'exit' : 'gordon', g: n(v, 'terminalGrowth'), exitMultiple: n(v, 'exitMultiple'),
    midYear: s(v, 'midYear', 'yes') !== 'no', netDebt: n(v, 'netDebt'), shares: nOpt(v, 'shares'),
    forecast: rows(v, 'forecast').map((r) => ({ year: cs(r, 'year'), revenue: cn(r, 'revenue'), ebit: cn(r, 'ebit'), da: cn(r, 'da'), capex: cn(r, 'capex'), nwcChange: cn(r, 'nwcChange') })),
  };
}

const DCF: CapEngine = {
  check(v) {
    const d = dcfInput(v);
    const out: FauMsg[] = [];
    const { wacc } = waccOf(d);
    if (d.method === 'gordon' && v.f.terminalGrowth === null) out.push(msg(i18nKey('永续增长法需要填永续增长率')));
    if (d.method === 'gordon' && d.g >= wacc - 1e-9) out.push(msg(i18nKey('永续增长率 {p0} 不小于 WACC {p1}，终值无意义'), { p0: pctText(d.g, 2), p1: pctText(wacc, 2) }));
    if (d.method === 'exit' && !(d.exitMultiple > 0)) out.push(msg(i18nKey('退出倍数法需要填退出倍数')));
    if (wacc <= 0) out.push(msg(i18nKey('WACC 必须大于 0')));
    return out;
  },
  run(v) {
    const d = dcfInput(v);
    const r = dcf(d);
    const { high: TV_HIGH, low: TV_LOW } = tvLines(v);
    const flags = [];
    if (r.tvShare > TV_HIGH) flags.push(warn('tv_high', i18nKey('终值占企业价值 {p0}，超过 {p1}：结论过度依赖终值假设'), { p0: pctText(r.tvShare), p1: pctText(TV_HIGH, 0) }));
    else if (r.tvShare < TV_LOW) flags.push(info('tv_low', i18nKey('终值占企业价值 {p0}，低于 {p1}：终值假设可能偏保守'), { p0: pctText(r.tvShare), p1: pctText(TV_LOW, 0) }));
    if (d.method === 'gordon' && d.g > d.riskFree) flags.push(warn('g_rf', i18nKey('永续增长率 {p0} 高于无风险利率 {p1}'), { p0: pctText(d.g, 2), p1: pctText(d.riskFree, 2) }));
    if (r.rows[r.rows.length - 1].fcff < 0) flags.push(warn('fcf_neg', i18nKey('预测期最后一年自由现金流为负，终值不可靠')));
    if (r.wacc < 0.04 || r.wacc > 0.2) flags.push(info('wacc_range', i18nKey('WACC {p0} 不在常见区间 4% ~ 20%，请复核参数'), { p0: pctText(r.wacc, 2) }));
    const gridCols = r.grid.cols.map((c, j) => col(`c${j}`, r.grid.colLabel === 'g' ? pctText(c, 2) : `${numText(c, 1)}x`, 'money'));
    return {
      detail: { ...r, tvHigh: TV_HIGH },
      metrics: [
        met('wacc', i18nKey('WACC'), r.wacc, 'pct'), met('ke', i18nKey('股权成本'), r.ke, 'pct'), met('sumPv', i18nKey('预测期现金流现值合计'), r.sumPv, 'money'),
        met('tv', i18nKey('终值'), r.tv, 'money'), met('pvTv', i18nKey('终值现值'), r.pvTv, 'money'), met('ev', i18nKey('企业价值'), r.ev, 'money'),
        met('tvShare', i18nKey('终值占企业价值'), r.tvShare, 'pct', r.tvShare > TV_HIGH ? 'warn' : 'ok'), met('equity', i18nKey('股权价值'), r.equity, 'money'),
        ...(r.perShare !== null ? [met('perShare', i18nKey('每股价值'), r.perShare, 'money')] : []),
        ...(r.impliedExitMultiple !== null ? [met('impliedMultiple', i18nKey('隐含退出倍数'), r.impliedExitMultiple, 'x')] : []),
        ...(r.impliedGrowth !== null ? [met('impliedGrowth', i18nKey('隐含永续增长率'), r.impliedGrowth, 'pct')] : []),
      ],
      tables: [
        tbl('fcff', i18nKey('自由现金流与折现'), [col('year', L.year, 'text'), col('revenue', i18nKey('收入'), 'money'), col('ebit', i18nKey('息税前利润 EBIT'), 'money'), col('nopat', i18nKey('税后经营利润'), 'money'), col('da', i18nKey('折旧摊销'), 'money'), col('capex', i18nKey('资本开支'), 'money'), col('nwcChange', i18nKey('营运资本增加'), 'money'), col('fcff', i18nKey('自由现金流'), 'money'), col('t', i18nKey('折现期'), 'num'), col('df', i18nKey('折现系数'), 'num'), col('pv', i18nKey('现值'), 'money')],
          r.rows.map((x) => ({ year: x.year, revenue: x.revenue, ebit: x.ebit, nopat: x.nopat, da: x.da, capex: x.capex, nwcChange: x.nwcChange, fcff: x.fcff, t: x.t, df: x.df, pv: x.pv }))),
        tbl('sensitivity', r.grid.colLabel === 'g' ? i18nKey('企业价值敏感性：WACC × 永续增长率') : i18nKey('企业价值敏感性：WACC × 退出倍数'), [col('wacc', i18nKey('WACC'), 'pct'), ...gridCols],
          r.grid.rows.map((w, i) => ({ wacc: w, ...Object.fromEntries(r.grid.ev[i].map((e, j) => [`c${j}`, e])) }))),
      ],
      flags,
      numbers: [...r.grid.ev.flat().filter((x): x is number => x !== null), ...r.rows.flatMap((x) => [x.fcff, x.pv, x.nopat])],
    };
  },
};

// ── LBO ──
export interface LboYear { year: string; ebitda: number; da: number; capex: number; nwcChange: number }
export interface LboIn { taxRate: number; entryEbitda: number; entryMultiple: number; feesPct: number; minCash: number; seniorX: number; seniorRate: number; seniorAmort: number; sweepPct: number; subX: number; subRate: number; exitMultiple: number; forecast: LboYear[] }
export interface LboRow extends LboYear {
  seniorOpen: number; subOpen: number; interest: number; ebit: number; ebt: number; tax: number; netIncome: number; cfads: number;
  mandatory: number; sweep: number; seniorClose: number; subClose: number; cashOpen: number; cashClose: number;
}
export interface LboResult {
  ev: number; fees: number; uses: number; senior: number; sub: number; equity: number; rows: LboRow[];
  exitEv: number; exitNetDebt: number; exitEquity: number; moic: number; irr: number | null;
  grid: { entry: number[]; exit: number[]; irr: (number | null)[][] };
}

export function lbo(d: LboIn): LboResult {
  const ev = d.entryEbitda * d.entryMultiple;
  const fees = ev * d.feesPct;
  const senior = d.entryEbitda * d.seniorX;
  const sub = d.entryEbitda * d.subX;
  const uses = ev + fees + d.minCash;
  const equity = uses - senior - sub;
  const rows: LboRow[] = [];
  let sOpen = senior;
  let cash = d.minCash;
  for (const y of d.forecast) {
    const interest = sOpen * d.seniorRate + sub * d.subRate;
    const ebit = y.ebitda - y.da;
    const ebt = ebit - interest;
    const tax = Math.max(0, ebt) * d.taxRate;
    const netIncome = ebt - tax;
    const cfads = netIncome + y.da - y.capex - y.nwcChange;
    const mandatory = Math.min(sOpen, senior * d.seniorAmort);
    const avail = Math.max(0, cash + cfads - mandatory - d.minCash);
    const sweep = Math.min(sOpen - mandatory, avail * d.sweepPct);
    const cashClose = cash + cfads - mandatory - sweep;
    rows.push({ ...y, seniorOpen: sOpen, subOpen: sub, interest, ebit, ebt, tax, netIncome, cfads, mandatory, sweep, seniorClose: sOpen - mandatory - sweep, subClose: sub, cashOpen: cash, cashClose });
    sOpen -= mandatory + sweep;
    cash = cashClose;
  }
  const last = rows[rows.length - 1];
  const exitEbitda = last.ebitda;
  const exitNetDebt = last.seniorClose + last.subClose - last.cashClose;
  const N = rows.length;
  const irrOf = (entryMult: number, exitMult: number): number | null => {
    const ev0 = d.entryEbitda * entryMult;
    const eq0 = ev0 * (1 + d.feesPct) + d.minCash - senior - sub;
    const eq1 = exitEbitda * exitMult - exitNetDebt;
    return eq0 > 0 && eq1 > 0 ? (eq1 / eq0) ** (1 / N) - 1 : null;
  };
  const exitEv = exitEbitda * d.exitMultiple;
  const exitEquity = exitEv - exitNetDebt;
  const entry = grid5(d.entryMultiple, 1);
  const exit = grid5(d.exitMultiple, 1);
  return {
    ev, fees, uses, senior, sub, equity, rows, exitEv, exitNetDebt, exitEquity,
    moic: exitEquity / equity, irr: irrOf(d.entryMultiple, d.exitMultiple),
    grid: { entry, exit, irr: entry.map((e) => exit.map((x) => irrOf(e, x))) },
  };
}

export function lboInput(v: CapIn): LboIn {
  return {
    taxRate: n(v, 'taxRate'), entryEbitda: n(v, 'entryEbitda'), entryMultiple: n(v, 'entryMultiple'), feesPct: n(v, 'feesPct'), minCash: n(v, 'minCash'),
    seniorX: n(v, 'seniorX'), seniorRate: n(v, 'seniorRate'), seniorAmort: n(v, 'seniorAmort'), sweepPct: n(v, 'sweepPct', 1), subX: n(v, 'subX'), subRate: n(v, 'subRate'),
    exitMultiple: n(v, 'exitMultiple'),
    forecast: rows(v, 'forecast').map((r) => ({ year: cs(r, 'year'), ebitda: cn(r, 'ebitda'), da: cn(r, 'da'), capex: cn(r, 'capex'), nwcChange: cn(r, 'nwcChange') })),
  };
}

const LBO: CapEngine = {
  check(v) {
    const d = lboInput(v);
    const eq = d.entryEbitda * d.entryMultiple * (1 + d.feesPct) + d.minCash - d.entryEbitda * (d.seniorX + d.subX);
    return eq > 0 ? [] : [msg(i18nKey('债务融资超过了收购总价，股权投入不为正'))];
  },
  run(v) {
    const r = lbo(lboInput(v));
    const flags = [];
    if (r.rows.some((x) => x.cashClose < 0)) flags.push(warn('cash_neg', i18nKey('某一年现金不足以支付强制还本，现金为负：需要追加融资或调整还本计划')));
    if (r.exitEquity <= 0) flags.push(warn('exit_neg', i18nKey('退出时股权价值不为正')));
    const lev = r.rows.map((x) => (x.seniorClose + x.subClose) / x.ebitda);
    return {
      detail: r,
      metrics: [
        met('ev', i18nKey('进入企业价值'), r.ev, 'money'), met('fees', i18nKey('交易费用'), r.fees, 'money'), met('senior', i18nKey('优先债'), r.senior, 'money'),
        met('sub', i18nKey('次级债'), r.sub, 'money'), met('equity', i18nKey('股权投入'), r.equity, 'money'), met('exitEv', i18nKey('退出企业价值'), r.exitEv, 'money'),
        met('exitNetDebt', i18nKey('退出时净债务'), r.exitNetDebt, 'money'), met('exitEquity', i18nKey('退出股权价值'), r.exitEquity, 'money'),
        met('moic', 'MOIC', r.moic, 'x'), met('irr', 'IRR', r.irr, 'pct'),
      ],
      tables: [
        tbl('schedule', i18nKey('债务偿还与现金扫款'), [col('year', L.year, 'text'), col('ebitda', 'EBITDA', 'money'), col('interest', i18nKey('利息'), 'money'), col('netIncome', i18nKey('净利润'), 'money'), col('cfads', i18nKey('可用于还债的现金'), 'money'), col('mandatory', i18nKey('强制还本'), 'money'), col('sweep', i18nKey('现金扫款'), 'money'), col('seniorClose', i18nKey('优先债期末'), 'money'), col('subClose', i18nKey('次级债期末'), 'money'), col('cashClose', i18nKey('期末现金'), 'money'), col('leverage', i18nKey('杠杆倍数'), 'x')],
          r.rows.map((x, i) => ({ year: x.year, ebitda: x.ebitda, interest: x.interest, netIncome: x.netIncome, cfads: x.cfads, mandatory: x.mandatory, sweep: x.sweep, seniorClose: x.seniorClose, subClose: x.subClose, cashClose: x.cashClose, leverage: lev[i] }))),
        tbl('sensitivity', i18nKey('IRR 敏感性：进入倍数 × 退出倍数'), [col('entry', i18nKey('进入倍数'), 'x'), ...r.grid.exit.map((x, j) => col(`c${j}`, `${numText(x, 1)}x`, 'pct'))],
          r.grid.entry.map((e, i) => ({ entry: e, ...Object.fromEntries(r.grid.irr[i].map((x, j) => [`c${j}`, x])) }))),
      ],
      flags,
      numbers: r.rows.flatMap((x) => [x.interest, x.netIncome, x.cfads, x.sweep, x.seniorClose]),
    };
  },
};

// ── 三表联动 ──
export interface TsIn {
  years: number; revenue0: number; growth: number; grossMargin: number; opexPct: number; daPct: number; capexPct: number; dso: number; dio: number; dpo: number;
  taxRate: number; interestRate: number; payout: number; cash0: number; ppe0: number; debt0: number; ar0: number; inv0: number; ap0: number; debtRepay: number;
}
export interface TsYear {
  year: number; revenue: number; cogs: number; gross: number; opex: number; ebitda: number; da: number; ebit: number; interest: number; ebt: number; tax: number; netIncome: number; dividends: number;
  ar: number; inv: number; ap: number; ppe: number; capex: number; debt: number; repay: number; equity: number; cfo: number; cfi: number; cff: number; cash: number; assets: number; liabEq: number; balanced: boolean;
}

export function threeStatement(d: TsIn): { years: TsYear[]; equity0: number } {
  const equity0 = d.cash0 + d.ar0 + d.inv0 + d.ppe0 - d.ap0 - d.debt0;
  const out: TsYear[] = [];
  let prev = { revenue: d.revenue0, ar: d.ar0, inv: d.inv0, ap: d.ap0, ppe: d.ppe0, debt: d.debt0, equity: equity0, cash: d.cash0 };
  for (let i = 1; i <= d.years; i += 1) {
    const revenue = prev.revenue * (1 + d.growth);
    const cogs = revenue * (1 - d.grossMargin);
    const gross = revenue - cogs;
    const opex = revenue * d.opexPct;
    const ebitda = gross - opex;
    const da = prev.ppe * d.daPct;
    const ebit = ebitda - da;
    const interest = prev.debt * d.interestRate;
    const ebt = ebit - interest;
    const tax = Math.max(0, ebt) * d.taxRate;
    const netIncome = ebt - tax;
    const dividends = Math.max(0, netIncome) * d.payout;
    const ar = revenue * d.dso / 365;
    const inv = cogs * d.dio / 365;
    const ap = cogs * d.dpo / 365;
    const capex = revenue * d.capexPct;
    const ppe = prev.ppe + capex - da;
    const repay = Math.min(prev.debt, d.debtRepay);
    const debt = prev.debt - repay;
    const equity = prev.equity + netIncome - dividends;
    const cfo = netIncome + da - (ar - prev.ar) - (inv - prev.inv) + (ap - prev.ap);
    const cfi = -capex;
    const cff = -repay - dividends;
    const cash = prev.cash + cfo + cfi + cff;
    const assets = cash + ar + inv + ppe;
    const liabEq = ap + debt + equity;
    out.push({ year: i, revenue, cogs, gross, opex, ebitda, da, ebit, interest, ebt, tax, netIncome, dividends, ar, inv, ap, ppe, capex, debt, repay, equity, cfo, cfi, cff, cash, assets, liabEq, balanced: Math.abs(assets - liabEq) < 1e-6 * Math.max(1, Math.abs(assets)) });
    prev = { revenue, ar, inv, ap, ppe, debt, equity, cash };
  }
  return { years: out, equity0 };
}

export function tsInput(v: CapIn): TsIn {
  const k = ['revenue0', 'growth', 'grossMargin', 'opexPct', 'daPct', 'capexPct', 'dso', 'dio', 'dpo', 'taxRate', 'interestRate', 'payout', 'cash0', 'ppe0', 'debt0', 'ar0', 'inv0', 'ap0', 'debtRepay'] as const;
  return { years: Math.max(1, Math.min(10, Math.round(n(v, 'years', 5)))), ...Object.fromEntries(k.map((x) => [x, n(v, x)])) } as TsIn;
}

const THREE: CapEngine = {
  run(v) {
    const { years: ys, equity0 } = threeStatement(tsInput(v));
    const flags = [];
    if (ys.some((y) => y.cash < 0)) flags.push(warn('cash_neg', i18nKey('预测期内现金为负：需要追加融资')));
    if (ys.some((y) => !y.balanced)) flags.push(warn('unbalanced', i18nKey('资产负债表不平：资产 ≠ 负债 + 权益')));
    if (equity0 < 0) flags.push(info('eq0_neg', i18nKey('基期净资产为负（按现金、应收、存货、固定资产减应付与借款推算）')));
    const yc = (key: keyof TsYear) => ys.map((y) => y[key] as number);
    const years = ys.map((y) => `Y${y.year}`);
    const rowsOf = (items: Array<[string, keyof TsYear]>) => items.map(([label, key]) => ({ item: k(label), ...Object.fromEntries(years.map((yy, i) => [yy, yc(key)[i]])) }));
    const cols = [col('item', L.item, 'text'), ...years.map((y) => col(y, y, 'money'))];
    const last = ys[ys.length - 1];
    return {
      detail: { years: ys, equity0 },
      metrics: [
        met('revenueN', i18nKey('末年收入'), last.revenue, 'money'), met('ebitdaN', i18nKey('末年 EBITDA'), last.ebitda, 'money'), met('netIncomeN', i18nKey('末年净利润'), last.netIncome, 'money'),
        met('cashN', i18nKey('末年现金'), last.cash, 'money', last.cash < 0 ? 'bad' : 'ok'), met('leverageN', i18nKey('末年借款 / EBITDA'), last.ebitda ? last.debt / last.ebitda : null, 'x'),
        met('coverageN', i18nKey('末年利息保障倍数'), last.interest ? last.ebitda / last.interest : null, 'x'),
        met('balanced', i18nKey('三表勾稽'), ys.every((y) => y.balanced) ? 'TRUE' : 'FALSE', 'text', ys.every((y) => y.balanced) ? 'ok' : 'bad'),
      ],
      tables: [
        tbl('is', i18nKey('利润表'), cols, rowsOf([[i18nKey('收入'), 'revenue'], [i18nKey('营业成本'), 'cogs'], [i18nKey('毛利'), 'gross'], [i18nKey('期间费用'), 'opex'], ['EBITDA', 'ebitda'], [i18nKey('折旧摊销'), 'da'], [i18nKey('息税前利润 EBIT'), 'ebit'], [i18nKey('利息'), 'interest'], [i18nKey('所得税'), 'tax'], [i18nKey('净利润'), 'netIncome']])),
        tbl('bs', i18nKey('资产负债表'), cols, rowsOf([[i18nKey('现金'), 'cash'], [i18nKey('应收账款'), 'ar'], [i18nKey('存货'), 'inv'], [i18nKey('固定资产净值'), 'ppe'], [i18nKey('资产合计'), 'assets'], [i18nKey('应付账款'), 'ap'], [i18nKey('借款'), 'debt'], [i18nKey('所有者权益'), 'equity'], [i18nKey('负债与权益合计'), 'liabEq']])),
        tbl('cf', i18nKey('现金流量表'), cols, rowsOf([[i18nKey('经营活动现金流'), 'cfo'], [i18nKey('投资活动现金流'), 'cfi'], [i18nKey('筹资活动现金流'), 'cff'], [i18nKey('期末现金'), 'cash']])),
      ],
      flags,
      numbers: ys.flatMap((y) => [y.revenue, y.cogs, y.gross, y.opex, y.ebitda, y.da, y.ebit, y.interest, y.tax, y.netIncome, y.cash, y.debt, y.equity, y.cfo, y.cfi, y.cff, y.ar, y.inv, y.ap, y.ppe, y.capex]),
    };
  },
};

// ── 可比公司 ──
export interface Peer { name: string; ev: number; marketCap: number | null; revenue: number | null; ebitda: number | null; netIncome: number | null }
export interface MultipleStats { n: number; min: number | null; q1: number | null; median: number | null; mean: number | null; q3: number | null; max: number | null }
export function statsOf(xs: number[]): MultipleStats {
  if (!xs.length) return { n: 0, min: null, q1: null, median: null, mean: null, q3: null, max: null };
  return { n: xs.length, min: Math.min(...xs), q1: quantile(xs, 0.25), median: quantile(xs, 0.5), mean: mean(xs), q3: quantile(xs, 0.75), max: Math.max(...xs) };
}
/** 分母不为正记 NM（不参与统计） */
export function peerMultiples(p: Peer): { evRevenue: number | null; evEbitda: number | null; pe: number | null } {
  const div = (a: number | null, b: number | null) => (a !== null && b !== null && b > 0 ? a / b : null);
  return { evRevenue: div(p.ev, p.revenue), evEbitda: div(p.ev, p.ebitda), pe: div(p.marketCap, p.netIncome) };
}

const COMPS: CapEngine = {
  run(v) {
    const peers: Peer[] = rows(v, 'peers').map((r) => ({ name: cs(r, 'name'), ev: cn(r, 'ev'), marketCap: typeof r.marketCap === 'number' ? r.marketCap : null, revenue: typeof r.revenue === 'number' ? r.revenue : null, ebitda: typeof r.ebitda === 'number' ? r.ebitda : null, netIncome: typeof r.netIncome === 'number' ? r.netIncome : null }));
    const mult = peers.map(peerMultiples);
    const st = {
      evRevenue: statsOf(mult.map((x) => x.evRevenue).filter((x): x is number => x !== null)),
      evEbitda: statsOf(mult.map((x) => x.evEbitda).filter((x): x is number => x !== null)),
      pe: statsOf(mult.map((x) => x.pe).filter((x): x is number => x !== null)),
    };
    const netDebt = n(v, 'targetNetDebt');
    const shares = nOpt(v, 'shares');
    const implied: Array<{ basis: string; low: number | null; mid: number | null; high: number | null }> = [];
    const ebitda = nOpt(v, 'targetEbitda');
    const revenue = nOpt(v, 'targetRevenue');
    const ni = nOpt(v, 'targetNetIncome');
    const eq = (evx: number | null) => (evx === null ? null : evx - netDebt);
    if (ebitda !== null && st.evEbitda.n) implied.push({ basis: 'EV/EBITDA', low: eq(st.evEbitda.q1! * ebitda), mid: eq(st.evEbitda.median! * ebitda), high: eq(st.evEbitda.q3! * ebitda) });
    if (revenue !== null && st.evRevenue.n) implied.push({ basis: 'EV/Revenue', low: eq(st.evRevenue.q1! * revenue), mid: eq(st.evRevenue.median! * revenue), high: eq(st.evRevenue.q3! * revenue) });
    if (ni !== null && ni > 0 && st.pe.n) implied.push({ basis: 'P/E', low: st.pe.q1! * ni, mid: st.pe.median! * ni, high: st.pe.q3! * ni });
    const flags = [];
    const nm = mult.filter((x) => x.evEbitda === null).length;
    if (nm) flags.push(info('nm', i18nKey('{n} 家可比公司 EBITDA 不为正，EV/EBITDA 记 NM、不参与统计'), { n: nm }));
    if (st.evEbitda.n < 3) flags.push(warn('few', i18nKey('有效的 EV/EBITDA 样本少于 3 家，区间不可靠')));
    const statRow = (label: string, x: MultipleStats) => ({ multiple: label, n: x.n, min: x.min, q1: x.q1, median: x.median, mean: x.mean, q3: x.q3, max: x.max });
    const mid = implied[0]?.mid ?? null;
    return {
      detail: { peers, mult, st, implied, netDebt, shares },
      metrics: [
        met('medianEvEbitda', i18nKey('EV/EBITDA 中位数'), st.evEbitda.median, 'x'),
        met('equityMid', i18nKey('隐含股权价值（中位数）'), mid, 'money'),
        ...(shares && mid !== null ? [met('perShareMid', i18nKey('隐含每股价值（中位数）'), mid / shares, 'money')] : []),
      ],
      tables: [
        tbl('peers', i18nKey('可比公司倍数'), [col('name', i18nKey('公司'), 'text'), col('ev', i18nKey('企业价值'), 'money'), col('evRevenue', 'EV/Revenue', 'x'), col('evEbitda', 'EV/EBITDA', 'x'), col('pe', 'P/E', 'x')],
          peers.map((p, i) => ({ name: p.name, ev: p.ev, evRevenue: mult[i].evRevenue ?? 'NM', evEbitda: mult[i].evEbitda ?? 'NM', pe: mult[i].pe ?? 'NM' }))),
        tbl('stats', i18nKey('倍数统计'), [col('multiple', i18nKey('倍数'), 'text'), col('n', i18nKey('样本数'), 'int'), col('min', i18nKey('最小值'), 'x'), col('q1', i18nKey('下四分位'), 'x'), col('median', i18nKey('中位数'), 'x'), col('mean', i18nKey('平均值'), 'x'), col('q3', i18nKey('上四分位'), 'x'), col('max', i18nKey('最大值'), 'x')],
          [statRow('EV/Revenue', st.evRevenue), statRow('EV/EBITDA', st.evEbitda), statRow('P/E', st.pe)]),
        tbl('implied', i18nKey('隐含股权价值区间'), [col('basis', i18nKey('倍数'), 'text'), col('low', L.low, 'money'), col('mid', L.mid, 'money'), col('high', L.high, 'money')], implied),
      ],
      flags,
      numbers: [...mult.flatMap((x) => [x.evRevenue, x.evEbitda, x.pe]).filter((x): x is number => x !== null), ...implied.flatMap((x) => [x.low, x.mid, x.high]).filter((x): x is number => x !== null)],
    };
  },
};

// ── 多方法估值整合（足球场图） ──
const INTEGRATION: CapEngine = {
  check(v) {
    const w = sum(rows(v, 'methods').map((r) => cn(r, 'weight')));
    return Math.abs(w - 1) > 0.001 ? [msg(i18nKey('各方法权重合计 {p0}，应为 100%'), { p0: pctText(w) })] : [];
  },
  run(v) {
    const ms = rows(v, 'methods').map((r) => ({ method: cs(r, 'method'), low: cn(r, 'low'), high: cn(r, 'high'), weight: cn(r, 'weight') }));
    const mids = ms.map((m) => (m.low + m.high) / 2);
    const weighted = sum(ms.map((m, i) => m.weight * mids[i]));
    const overlapLow = Math.max(...ms.map((m) => m.low));
    const overlapHigh = Math.min(...ms.map((m) => m.high));
    const flags = ms.some((m) => m.low > m.high) ? [warn('lowhigh', i18nKey('有方法的低值大于高值'))] : [];
    if (overlapLow > overlapHigh) flags.push(info('no_overlap', i18nKey('各方法区间没有共同重叠部分')));
    return {
      metrics: [met('weighted', i18nKey('加权估值'), weighted, 'money'), met('rangeLow', i18nKey('整体区间低值'), Math.min(...ms.map((m) => m.low)), 'money'), met('rangeHigh', i18nKey('整体区间高值'), Math.max(...ms.map((m) => m.high)), 'money'),
        ...(overlapLow <= overlapHigh ? [met('overlapLow', i18nKey('重叠区间低值'), overlapLow, 'money'), met('overlapHigh', i18nKey('重叠区间高值'), overlapHigh, 'money')] : [])],
      tables: [tbl('football', i18nKey('估值足球场图'), [col('method', i18nKey('方法'), 'text'), col('low', L.low, 'money'), col('mid', L.mid, 'money'), col('high', L.high, 'money'), col('weight', i18nKey('权重'), 'pct')], ms.map((m, i) => ({ method: m.method, low: m.low, mid: mids[i], high: m.high, weight: m.weight })))],
      flags, numbers: mids,
    };
  },
};

export const VALUATION_ENGINES: Record<string, CapEngine> = { dcf: DCF, lbo: LBO, three_statement: THREE, comps: COMPS, integration: INTEGRATION };
export type { CapOut };
