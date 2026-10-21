/**
 * F7 固定收益与市场分析（LSEG 8 项分析的计算部分，纯函数；数据靠上传 / 公开 / 手工录入，有授权时可接 LSEG LFA）。
 *   - 债券：每百元面值价格、麦考利久期、修正久期、凸性、DV01；组合久期与平行冲击（全价重估）；
 *   - 国债期货基差：总基差 = 净价 − 期货价 × 转换因子；持有收益 = 票息收入 − 融资成本；隐含回购利率；最便宜可交割券 = 隐含回购利率最高；
 *   - 相对价值：相对基准曲线（线性插值）的利差（基点）与历史 Z 值；互换曲线：期限利差、蝴蝶价差、远期利率；
 *   - 外汇：利率平价远期、远期点、套息与套息 / 波动率；期权：Black–Scholes 隐含波动率与希腊值；
 *   - 宏观看板与个股快照：最新值、变动、Z 值、分位、区间收益、年化波动、最大回撤。
 * 只做分析，不下单、不给交易指令。
 */
import { i18nKey } from '@totalclaw/i18n';
import { cn, cs, n, nOpt, rows } from './inputs';
import { mean, normCdf, normPdf, stdev, sum } from './math';
import { L, col, info, met, pctText, tbl, warn, type CapEngine } from './types';

// ── 债券 ──
/** shortcut: 按整期近似（剩余期限 × 年付息次数取整），不处理应计利息与零头首期；要精确时改按现金流日期定价 */
export function bondMath(coupon: number, ytm: number, years: number, freq = 1) {
  const f = Math.max(1, Math.round(freq));
  const nPer = Math.max(1, Math.round(years * f));
  const y = ytm / f;
  const c = 100 * coupon / f;
  let price = 0; let macW = 0; let convW = 0;
  for (let k = 1; k <= nPer; k += 1) {
    const cf = c + (k === nPer ? 100 : 0);
    const pv = cf / (1 + y) ** k;
    price += pv;
    macW += (k / f) * pv;
    convW += (k * (k + 1)) / f ** 2 * pv / (1 + y) ** 2;
  }
  const mac = macW / price;
  const mod = mac / (1 + y);
  return { price, macaulay: mac, modified: mod, convexity: convW / price, dv01: mod * price * 0.0001 };
}

const FI_PORT: CapEngine = {
  run(v) {
    const shock = n(v, 'shockBp', 100) / 10_000;
    const hs = rows(v, 'holdings').map((r) => {
      const b = bondMath(cn(r, 'coupon'), cn(r, 'yield'), cn(r, 'maturity'), cn(r, 'freq', 1));
      const face = cn(r, 'face');
      const mv = face * b.price / 100;
      const up = face * bondMath(cn(r, 'coupon'), cn(r, 'yield') + shock, cn(r, 'maturity'), cn(r, 'freq', 1)).price / 100;
      const down = face * bondMath(cn(r, 'coupon'), cn(r, 'yield') - shock, cn(r, 'maturity'), cn(r, 'freq', 1)).price / 100;
      return { bond: cs(r, 'bond'), face, price: b.price, mv, macaulay: b.macaulay, modified: b.modified, convexity: b.convexity, dv01: b.dv01 * face / 100, up: up - mv, down: down - mv };
    });
    const mv = sum(hs.map((h) => h.mv));
    const dur = mv ? sum(hs.map((h) => h.modified * h.mv)) / mv : null;
    return {
      metrics: [met('mv', i18nKey('组合市值'), mv, 'money'), met('duration', i18nKey('组合修正久期'), dur, 'num'), met('dv01', 'DV01', sum(hs.map((h) => h.dv01)), 'money'),
        met('up', i18nKey('利率上行冲击损益'), sum(hs.map((h) => h.up)), 'money', 'warn'), met('down', i18nKey('利率下行冲击损益'), sum(hs.map((h) => h.down)), 'money')],
      tables: [tbl('holdings', i18nKey('持仓风险'), [col('bond', i18nKey('债券'), 'text'), col('price', i18nKey('价格（每百元）'), 'num'), col('mv', i18nKey('市值'), 'money'), col('modified', i18nKey('修正久期'), 'num'), col('convexity', i18nKey('凸性'), 'num'), col('dv01', 'DV01', 'money'), col('up', i18nKey('上行冲击'), 'money'), col('down', i18nKey('下行冲击'), 'money')], hs)],
      flags: [info('approx', i18nKey('价格按整期近似计算（不含应计利息），用于风险度量，不作为成交价格'))],
    };
  },
};

export function futuresBasis(F: number, repo: number, days: number, b: { clean: number; coupon: number; cf: number; accrued: number }) {
  const invoice = F * b.cf;
  const gross = b.clean - invoice;
  const couponIncome = 100 * b.coupon * days / 365;
  const dirty = b.clean + b.accrued;
  const financing = dirty * repo * days / 360;
  const carry = couponIncome - financing;
  // 买现券、交割：收发票价 + 交割日应计（= 当前应计 + 期间票息），付现券全价
  const impliedRepo = (invoice - b.clean + couponIncome) / dirty * 360 / days;
  return { invoice, gross, carry, net: gross - carry, impliedRepo };
}

const BASIS: CapEngine = {
  run(v) {
    const F = n(v, 'futuresPrice'); const repo = n(v, 'repoRate'); const days = n(v, 'days', 1);
    const bs = rows(v, 'basket').map((r) => ({ bond: cs(r, 'bond'), ...futuresBasis(F, repo, days, { clean: cn(r, 'cleanPrice'), coupon: cn(r, 'coupon'), cf: cn(r, 'cf'), accrued: cn(r, 'accrued') }) }))
      .sort((a, b) => b.impliedRepo - a.impliedRepo);
    const ctd = bs[0];
    return {
      metrics: [met('ctd', i18nKey('最便宜可交割券'), ctd?.bond ?? null, 'text'), met('ctdRepo', i18nKey('最高隐含回购利率'), ctd?.impliedRepo ?? null, 'pct'), met('ctdNet', i18nKey('最便宜券净基差'), ctd?.net ?? null, 'num')],
      tables: [tbl('basket', i18nKey('可交割券基差'), [col('bond', i18nKey('债券'), 'text'), col('invoice', i18nKey('发票价格'), 'num'), col('gross', i18nKey('总基差'), 'num'), col('carry', i18nKey('持有收益'), 'num'), col('net', i18nKey('净基差'), 'num'), col('impliedRepo', i18nKey('隐含回购利率'), 'pct')], bs)],
      flags: ctd && ctd.impliedRepo > repo ? [info('arb', i18nKey('最便宜券的隐含回购利率高于回购利率 {p0}'), { p0: pctText(repo, 2) })] : [],
    };
  },
};

/** 曲线线性插值（期限外取端点值） */
export function interp(curve: Array<{ t: number; y: number }>, t: number): number | null {
  const c = [...curve].sort((a, b) => a.t - b.t);
  if (!c.length) return null;
  if (t <= c[0].t) return c[0].y;
  if (t >= c[c.length - 1].t) return c[c.length - 1].y;
  const i = c.findIndex((p) => p.t >= t);
  const a = c[i - 1]; const b = c[i];
  return a.y + (b.y - a.y) * (t - a.t) / (b.t - a.t);
}

const BOND_RV: CapEngine = {
  run(v) {
    const curve = rows(v, 'curve').map((r) => ({ t: cn(r, 'tenor'), y: cn(r, 'yield') }));
    const bs = rows(v, 'bonds').map((r) => {
      const cy = interp(curve, cn(r, 'maturity'));
      const spread = cy === null ? null : (cn(r, 'yield') - cy) * 10_000;
      const avg = typeof r.avgSpread === 'number' ? r.avgSpread : null;
      const sd = typeof r.stdSpread === 'number' && r.stdSpread > 0 ? r.stdSpread : null;
      const z = spread !== null && avg !== null && sd !== null ? (spread - avg) / sd : null;
      return { bond: cs(r, 'bond'), maturity: cn(r, 'maturity'), yield: cn(r, 'yield'), curve: cy, spread, z, view: z === null ? '' : z > 1.5 ? 'cheap' : z < -1.5 ? 'rich' : 'fair' };
    });
    const label: Record<string, string> = { cheap: i18nKey('偏便宜'), rich: i18nKey('偏贵'), fair: i18nKey('合理') };
    return {
      metrics: [met('count', i18nKey('债券数'), bs.length, 'int'), met('cheap', i18nKey('偏便宜'), bs.filter((b) => b.view === 'cheap').length, 'int'), met('rich', i18nKey('偏贵'), bs.filter((b) => b.view === 'rich').length, 'int')],
      tables: [tbl('bonds', i18nKey('相对曲线利差'), [col('bond', i18nKey('债券'), 'text'), col('maturity', i18nKey('剩余期限（年）'), 'years'), col('yield', i18nKey('到期收益率'), 'pct'), col('curve', i18nKey('曲线收益率'), 'pct'), col('spread', i18nKey('利差（基点）'), 'bp'), col('z', i18nKey('Z 值'), 'num'), col('view', i18nKey('相对价值'), 'text')],
        bs.map((b) => ({ ...b, view: b.view ? { key: label[b.view] } : '' })))],
      flags: [],
    };
  },
};

const SWAP: CapEngine = {
  run(v) {
    const pts = rows(v, 'curve').map((r) => ({ t: cn(r, 'tenor'), y: cn(r, 'rate'), prior: typeof r.prior === 'number' ? r.prior : null })).sort((a, b) => a.t - b.t);
    const at = (t: number) => interp(pts, t);
    const bp = (x: number | null) => (x === null ? null : x * 10_000);
    const r2 = at(2); const r5 = at(5); const r10 = at(10); const r30 = at(30);
    const fwd = pts.slice(1).map((p, i) => {
      const a = pts[i];
      return { from: a.t, to: p.t, forward: ((1 + p.y) ** p.t / (1 + a.y) ** a.t) ** (1 / (p.t - a.t)) - 1 };
    });
    const maxT = pts[pts.length - 1]?.t ?? 0;
    return {
      metrics: [met('s2s10', i18nKey('2 年与 10 年利差（基点）'), r2 !== null && r10 !== null && maxT >= 10 ? bp(r10 - r2) : null, 'bp'),
        met('s5s30', i18nKey('5 年与 30 年利差（基点）'), r5 !== null && r30 !== null && maxT >= 30 ? bp(r30 - r5) : null, 'bp'),
        met('fly', i18nKey('2-5-10 蝴蝶价差（基点）'), r2 !== null && r5 !== null && r10 !== null && maxT >= 10 ? bp(2 * r5 - r2 - r10) : null, 'bp')],
      tables: [
        tbl('curve', i18nKey('曲线与变动'), [col('t', i18nKey('期限（年）'), 'years'), col('y', i18nKey('利率'), 'pct'), col('prior', i18nKey('一个月前利率'), 'pct'), col('chg', i18nKey('变动（基点）'), 'bp')], pts.map((p) => ({ t: p.t, y: p.y, prior: p.prior, chg: p.prior === null ? null : bp(p.y - p.prior) }))),
        tbl('forwards', i18nKey('远期利率'), [col('from', i18nKey('起点（年）'), 'years'), col('to', i18nKey('终点（年）'), 'years'), col('forward', i18nKey('远期利率'), 'pct')], fwd),
      ],
      flags: r2 !== null && r10 !== null && r10 < r2 ? [warn('inverted', i18nKey('2 年与 10 年利率倒挂'))] : [],
    };
  },
};

export function fxForward(spot: number, rb: number, rq: number, days: number) {
  const t = days / 365;
  const fwd = spot * (1 + rq * t) / (1 + rb * t);
  return { fwd, points: (fwd - spot) * 10_000, carry: rb - rq };
}
const FX_CARRY: CapEngine = {
  run(v) {
    const ps = rows(v, 'pairs').map((r) => {
      const f = fxForward(cn(r, 'spot'), cn(r, 'baseRate'), cn(r, 'quoteRate'), cn(r, 'days', 90));
      const vol = cn(r, 'vol');
      return { pair: cs(r, 'pair'), spot: cn(r, 'spot'), forward: f.fwd, points: f.points, carry: f.carry, ratio: vol > 0 ? f.carry / vol : null };
    }).sort((a, b) => (b.ratio ?? -Infinity) - (a.ratio ?? -Infinity));
    return {
      metrics: [met('count', i18nKey('货币对'), ps.length, 'int'), met('best', i18nKey('套息 / 波动率最高'), ps[0]?.pair ?? null, 'text')],
      tables: [tbl('pairs', i18nKey('利率平价远期与套息'), [col('pair', i18nKey('货币对'), 'text'), col('spot', i18nKey('即期汇率'), 'num'), col('forward', i18nKey('远期汇率'), 'num'), col('points', i18nKey('远期点'), 'num'), col('carry', i18nKey('持有基础货币的年化利差'), 'pct'), col('ratio', i18nKey('套息 / 波动率'), 'num')], ps)],
      flags: [info('carry_sign', i18nKey('利差为负表示持有计价货币一侧才有正套息'))],
    };
  },
};

// ── 期权 ──
export function bs(type: 'call' | 'put', S: number, K: number, T: number, r: number, vol: number) {
  const sq = vol * Math.sqrt(T);
  const d1 = (Math.log(S / K) + (r + vol * vol / 2) * T) / sq;
  const d2 = d1 - sq;
  const disc = Math.exp(-r * T);
  const price = type === 'call' ? S * normCdf(d1) - K * disc * normCdf(d2) : K * disc * normCdf(-d2) - S * normCdf(-d1);
  const delta = type === 'call' ? normCdf(d1) : normCdf(d1) - 1;
  const gamma = normPdf(d1) / (S * sq);
  const vega = S * normPdf(d1) * Math.sqrt(T) / 100;
  const theta = (-(S * normPdf(d1) * vol) / (2 * Math.sqrt(T)) - (type === 'call' ? 1 : -1) * r * K * disc * normCdf(type === 'call' ? d2 : -d2)) / 365;
  return { price, delta, gamma, vega, theta };
}
/** 隐含波动率：二分法（0.01% ~ 500%）；价格不在无套利区间内返回 null */
export function impliedVol(type: 'call' | 'put', S: number, K: number, T: number, r: number, price: number): number | null {
  let lo = 0.0001; let hi = 5;
  const f = (x: number) => bs(type, S, K, T, r, x).price - price;
  if (f(lo) > 0 || f(hi) < 0) return null;
  for (let i = 0; i < 200; i += 1) {
    const mid = (lo + hi) / 2;
    if (f(mid) > 0) hi = mid; else lo = mid;
    if (hi - lo < 1e-9) break;
  }
  return (lo + hi) / 2;
}

const OPT_VOL: CapEngine = {
  run(v) {
    const os = rows(v, 'options').map((r) => {
      const type = cs(r, 'type') === 'put' ? 'put' : 'call';
      const S = cn(r, 'spot'); const K = cn(r, 'strike'); const T = cn(r, 'years'); const rr = cn(r, 'rate');
      const iv = impliedVol(type, S, K, T, rr, cn(r, 'price'));
      const g = iv === null ? null : bs(type, S, K, T, rr, iv);
      return { label: cs(r, 'label'), type, strike: K, years: T, moneyness: S ? K / S : null, iv, delta: g?.delta ?? null, gamma: g?.gamma ?? null, vega: g?.vega ?? null, theta: g?.theta ?? null };
    });
    const bad = os.filter((o) => o.iv === null);
    const expiries = [...new Set(os.map((o) => o.years))].sort((a, b) => a - b);
    const term = expiries.map((t) => {
      const xs = os.filter((o) => o.years === t && o.iv !== null);
      const atm = [...xs].sort((a, b) => Math.abs((a.moneyness ?? 9) - 1) - Math.abs((b.moneyness ?? 9) - 1))[0];
      const ivs = xs.map((o) => o.iv as number);
      return { years: t, atmIv: atm?.iv ?? null, skew: ivs.length > 1 ? Math.max(...ivs) - Math.min(...ivs) : null };
    });
    return {
      metrics: [met('count', i18nKey('合约数'), os.length, 'int'), met('avgIv', i18nKey('平均隐含波动率'), mean(os.filter((o) => o.iv !== null).map((o) => o.iv as number)), 'pct')],
      tables: [
        tbl('options', i18nKey('隐含波动率与希腊值'), [col('label', i18nKey('合约'), 'text'), col('strike', i18nKey('行权价'), 'num'), col('years', i18nKey('剩余期限（年）'), 'years'), col('moneyness', i18nKey('行权价 / 标的价'), 'num'), col('iv', i18nKey('隐含波动率'), 'pct'), col('delta', 'Delta', 'num'), col('gamma', 'Gamma', 'num'), col('vega', i18nKey('Vega（每 1% 波动率）'), 'num'), col('theta', i18nKey('Theta（每天）'), 'num')], os.map(({ type: _type, ...o }) => o)),
        tbl('term', i18nKey('期限结构与偏斜'), [col('years', i18nKey('剩余期限（年）'), 'years'), col('atmIv', i18nKey('平值隐含波动率'), 'pct'), col('skew', i18nKey('同期限波动率极差'), 'pct')], term),
      ],
      flags: bad.map((o) => warn(`noiv_${o.label}`, i18nKey('合约「{p0}」的价格不在无套利区间内，算不出隐含波动率'), { p0: o.label })),
    };
  },
};

// ── 宏观看板与个股快照 ──
const MACRO: CapEngine = {
  run(v) {
    const obs = rows(v, 'series').map((r) => ({ series: cs(r, 'series'), date: cs(r, 'date'), value: cn(r, 'value') }));
    const names = [...new Set(obs.map((o) => o.series))];
    const out = names.map((nm) => {
      const xs = obs.filter((o) => o.series === nm).sort((a, b) => a.date.localeCompare(b.date));
      const last = xs[xs.length - 1];
      const prev = xs[xs.length - 2];
      const cutoff = Date.parse(last.date) - 30 * 86_400_000;
      const m1 = [...xs].reverse().find((o) => Date.parse(o.date) <= cutoff);
      const vals = xs.map((o) => o.value);
      const sd = stdev(vals);
      const avg = mean(vals);
      return { series: nm, date: last.date, value: last.value, chg: prev ? last.value - prev.value : null, chg1m: m1 ? last.value - m1.value : null, z: sd && avg !== null ? (last.value - avg) / sd : null, pctile: vals.filter((x) => x <= last.value).length / vals.length };
    });
    return {
      metrics: [met('series', i18nKey('序列数'), out.length, 'int'), met('obs', i18nKey('观测值'), obs.length, 'int')],
      tables: [tbl('monitor', i18nKey('最新值与变动'), [col('series', i18nKey('序列'), 'text'), col('date', i18nKey('日期'), 'date'), col('value', L.value, 'num'), col('chg', i18nKey('较上一期'), 'num'), col('chg1m', i18nKey('较一个月前'), 'num'), col('z', i18nKey('Z 值'), 'num'), col('pctile', i18nKey('历史分位'), 'pct')], out)],
      flags: out.filter((o) => o.z !== null && Math.abs(o.z) > 2).map((o) => info(`z_${o.series}`, i18nKey('「{p0}」偏离历史均值超过 2 个标准差'), { p0: o.series })),
    };
  },
};

export function priceStats(px: Array<{ date: string; close: number }>) {
  const xs = [...px].sort((a, b) => a.date.localeCompare(b.date));
  const last = xs[xs.length - 1];
  const back = (days: number) => {
    const cut = Date.parse(last.date) - days * 86_400_000;
    const p = [...xs].reverse().find((o) => Date.parse(o.date) <= cut);
    return p ? last.close / p.close - 1 : null;
  };
  const yearStart = xs.find((o) => o.date.slice(0, 4) === last.date.slice(0, 4));
  const rets = xs.slice(1).map((o, i) => Math.log(o.close / xs[i].close));
  let peak = -Infinity; let mdd = 0;
  for (const o of xs) { peak = Math.max(peak, o.close); mdd = Math.min(mdd, o.close / peak - 1); }
  const sd = stdev(rets);
  return { last: last.close, date: last.date, r1m: back(30), r3m: back(91), r1y: back(365), ytd: yearStart && yearStart !== last ? last.close / yearStart.close - 1 : null, vol: sd === null ? null : sd * Math.sqrt(252), mdd };
}
const EQUITY: CapEngine = {
  run(v) {
    const p = priceStats(rows(v, 'prices').map((r) => ({ date: cs(r, 'date'), close: cn(r, 'close') })));
    const tp = nOpt(v, 'targetPrice'); const eps = nOpt(v, 'eps');
    return {
      metrics: [met('last', i18nKey('最新收盘价'), p.last, 'num'), met('r1m', i18nKey('近一个月'), p.r1m, 'pct'), met('r3m', i18nKey('近三个月'), p.r3m, 'pct'), met('r1y', i18nKey('近一年'), p.r1y, 'pct'), met('ytd', i18nKey('年初至今'), p.ytd, 'pct'),
        met('vol', i18nKey('年化波动率'), p.vol, 'pct'), met('mdd', i18nKey('最大回撤'), p.mdd, 'pct'),
        ...(tp !== null ? [met('upside', i18nKey('距一致预期目标价'), tp / p.last - 1, 'pct')] : []), ...(eps ? [met('pe', i18nKey('市盈率'), p.last / eps, 'x')] : [])],
      tables: [], flags: [],
    };
  },
};

export const MARKETS_ENGINES: Record<string, CapEngine> = {
  bond_basis: BASIS, bond_rv: BOND_RV, fi_portfolio: FI_PORT, fx_carry: FX_CARRY, option_vol: OPT_VOL, swap_curve: SWAP, macro_rates: MACRO, equity_snapshot: EQUITY,
};
