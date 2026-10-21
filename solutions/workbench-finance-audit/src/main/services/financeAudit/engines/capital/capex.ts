/**
 * F2 资本配置与项目投资（纯函数）：NPV / IRR / 回收期 / 盈利指数与敏感性、实物期权（CRR 二叉树）、WACC 与 ROIC、多情景加权。
 * 判断口径取自 finance-skills project-valuation / capital-allocation 的判断框架：
 *   IRR 门槛 = WACC + 项目特定风险溢价；NPV > 0 且 IRR > 门槛 → 可行；IRR 在门槛附近 → 临界；否则不可行（除非有战略价值）。
 *   升级：IRR < 门槛、NPV < 0、悲观情景 NPV < 0 → 必须批准人签（F2 本身就要批准级）。
 */
import { i18nKey } from '@totalclaw/i18n';
import { cn, cs, n, rows, s, type CapIn } from './inputs';
import { grid5, irr, npv, sum } from './math';
import { waccOf } from './valuation';
import { col, info, met, msg, pctText, tbl, warn, type CapEngine } from './types';

/** IRR 落在门槛 ±0.5% 内算「临界」 */
const NEAR = 0.005;

export interface NpvIn { rate: number; premium: number; investment: number; flows: Array<{ period: number; cashflow: number }> }
export interface NpvResult { npv: number; irr: number | null; hurdle: number; payback: number | null; discountedPayback: number | null; pi: number | null; verdict: 'go' | 'marginal' | 'reject'; grid: { rates: number[]; scales: number[]; npv: number[][] } }

/** 累计现金流转正的期次（期内线性插值）；不转正返回 null */
export function paybackOf(cfs: number[], times: number[]): number | null {
  let cum = 0;
  for (let i = 0; i < cfs.length; i += 1) {
    const prev = cum;
    cum += cfs[i];
    if (i > 0 && prev < 0 && cum >= 0) return times[i - 1] + (times[i] - times[i - 1]) * (-prev / cfs[i]);
  }
  return null;
}

export function npvIrr(d: NpvIn): NpvResult {
  const flows = [...d.flows].sort((a, b) => a.period - b.period);
  const cfs = [-d.investment, ...flows.map((f) => f.cashflow)];
  const times = [0, ...flows.map((f) => f.period)];
  const v = npv(d.rate, cfs, times);
  const r = irr(cfs, times);
  const hurdle = d.rate + d.premium;
  const pvIn = v + d.investment;
  const verdict = v > 0 && r !== null && r > hurdle + NEAR ? 'go' : v >= 0 && r !== null && r >= hurdle - NEAR ? 'marginal' : 'reject';
  const rates = grid5(d.rate, 0.01);
  const scales = [0.8, 0.9, 1, 1.1, 1.2];
  return {
    npv: v, irr: r, hurdle, payback: paybackOf(cfs, times), discountedPayback: paybackOf(cfs.map((c, i) => c / (1 + d.rate) ** times[i]), times),
    pi: d.investment > 0 ? pvIn / d.investment : null, verdict,
    grid: { rates, scales, npv: rates.map((rt) => scales.map((sc) => npv(rt, [-d.investment, ...flows.map((f) => f.cashflow * sc)], times))) },
  };
}

const VERDICT = { go: i18nKey('NPV 为正且 IRR 高于门槛：项目可行（待批准人决定）'), marginal: i18nKey('IRR 在门槛附近：临界项目，需结合战略价值判断'), reject: i18nKey('NPV 为负或 IRR 低于门槛：按财务口径不可行（除非有战略价值）') };

const NPV_IRR: CapEngine = {
  run(v) {
    const d: NpvIn = { rate: n(v, 'discountRate'), premium: n(v, 'riskPremium'), investment: n(v, 'investment'), flows: rows(v, 'cashflows').map((r) => ({ period: cn(r, 'period'), cashflow: cn(r, 'cashflow') })) };
    const r = npvIrr(d);
    const flags = [r.verdict === 'go' ? info('verdict', VERDICT.go) : warn('verdict', VERDICT[r.verdict])];
    if (r.irr === null) flags.push(warn('irr_none', i18nKey('现金流没有正负变号，算不出 IRR')));
    if (r.grid.npv[2][0] < 0) flags.push(warn('pess', i18nKey('现金流打八折时 NPV 为负：悲观情景下项目摧毁价值')));
    return {
      metrics: [met('npv', 'NPV', r.npv, 'money', r.npv >= 0 ? 'ok' : 'bad'), met('irr', 'IRR', r.irr, 'pct'), met('hurdle', i18nKey('IRR 门槛'), r.hurdle, 'pct'),
        met('payback', i18nKey('回收期（期）'), r.payback, 'num'), met('dpayback', i18nKey('折现回收期（期）'), r.discountedPayback, 'num'), met('pi', i18nKey('盈利指数'), r.pi, 'num')],
      tables: [tbl('sensitivity', i18nKey('NPV 敏感性：折现率 × 现金流倍数'), [col('rate', i18nKey('折现率'), 'pct'), ...r.grid.scales.map((x, j) => col(`c${j}`, `${Math.round(x * 100)}%`, 'money'))],
        r.grid.rates.map((rt, i) => ({ rate: rt, ...Object.fromEntries(r.grid.npv[i].map((x, j) => [`c${j}`, x])) })))],
      flags, numbers: r.grid.npv.flat(),
    };
  },
};

// ── 实物期权：CRR 二叉树（美式） ──
export interface OptIn { type: 'defer' | 'expand' | 'abandon'; pv: number; cost: number; vol: number; r: number; years: number; steps: number; expandFactor: number; expandCost: number; salvage: number }
export interface OptResult { staticNpv: number; optionValue: number; expandedNpv: number; u: number; d: number; p: number }

/** 二叉树上的美式期权；payoff 给出某节点的立即行权价值 */
export function binomial(S: number, vol: number, r: number, T: number, steps: number, payoff: (s: number) => number): { value: number; u: number; d: number; p: number } {
  const dt = T / steps;
  const u = Math.exp(vol * Math.sqrt(dt));
  const d = 1 / u;
  const p = (Math.exp(r * dt) - d) / (u - d);
  const disc = Math.exp(-r * dt);
  let vals = Array.from({ length: steps + 1 }, (_, j) => payoff(S * u ** j * d ** (steps - j)));
  for (let i = steps - 1; i >= 0; i -= 1) {
    vals = Array.from({ length: i + 1 }, (_, j) => Math.max(disc * (p * vals[j + 1] + (1 - p) * vals[j]), payoff(S * u ** j * d ** (i - j))));
  }
  return { value: vals[0], u, d, p };
}

export function realOption(o: OptIn): OptResult {
  const staticNpv = o.pv - o.cost;
  if (o.type === 'defer') {
    const b = binomial(o.pv, o.vol, o.r, o.years, o.steps, (x) => Math.max(0, x - o.cost));
    return { staticNpv, optionValue: b.value - Math.max(0, staticNpv), expandedNpv: b.value, u: b.u, d: b.d, p: b.p };
  }
  const b = o.type === 'expand'
    ? binomial(o.pv, o.vol, o.r, o.years, o.steps, (x) => Math.max(0, o.expandFactor * x - o.expandCost))
    : binomial(o.pv, o.vol, o.r, o.years, o.steps, (x) => Math.max(0, o.salvage - x));
  return { staticNpv, optionValue: b.value, expandedNpv: staticNpv + b.value, u: b.u, d: b.d, p: b.p };
}

export const optInput = (v: CapIn): OptIn => ({
  type: (['defer', 'expand', 'abandon'].includes(s(v, 'optionType')) ? s(v, 'optionType') : 'defer') as OptIn['type'],
  pv: n(v, 'pv'), cost: n(v, 'cost'), vol: n(v, 'vol'), r: n(v, 'riskFree'), years: n(v, 'years'), steps: Math.max(1, Math.round(n(v, 'steps', 50))),
  expandFactor: n(v, 'expandFactor'), expandCost: n(v, 'expandCost'), salvage: n(v, 'salvage'),
});

const REAL_OPTIONS: CapEngine = {
  check(v) {
    const o = optInput(v);
    const dt = o.years / o.steps;
    const u = Math.exp(o.vol * Math.sqrt(dt));
    const p = (Math.exp(o.r * dt) - 1 / u) / (u - 1 / u);
    return p > 0 && p < 1 ? [] : [msg(i18nKey('参数让风险中性概率落在 0 ~ 1 之外，请加大步数或检查波动率与利率'))];
  },
  run(v) {
    const o = optInput(v);
    const r = realOption(o);
    const flags = r.staticNpv < 0 && r.expandedNpv > 0 ? [info('flip', i18nKey('静态 NPV 为负、计入期权价值后为正：项目的价值主要来自灵活性'))] : [];
    return {
      metrics: [met('staticNpv', i18nKey('静态 NPV'), r.staticNpv, 'money'), met('optionValue', i18nKey('期权价值'), r.optionValue, 'money'), met('expandedNpv', i18nKey('含期权的扩展 NPV'), r.expandedNpv, 'money'),
        met('u', i18nKey('上行系数'), r.u, 'num'), met('d', i18nKey('下行系数'), r.d, 'num'), met('p', i18nKey('风险中性概率'), r.p, 'num')],
      tables: [], flags,
    };
  },
};

// ── WACC 与 ROIC ──
const WACC_ROIC: CapEngine = {
  run(v) {
    const E = n(v, 'equityValue');
    const D = n(v, 'debtValue');
    const t = n(v, 'taxRate');
    const w = waccOf({ riskFree: n(v, 'riskFree'), beta: n(v, 'beta'), erp: n(v, 'erp'), sizePremium: 0, costDebt: n(v, 'costDebt'), taxRate: t, debtWeight: E + D > 0 ? D / (E + D) : 0 });
    const roicOf = (ebit: number, ic: number) => (ic > 0 ? ebit * (1 - t) / ic : null);
    const roic = roicOf(n(v, 'ebit'), n(v, 'investedCapital'));
    const spread = roic === null ? null : roic - w.wacc;
    const eva = spread === null ? null : spread * n(v, 'investedCapital');
    const units = rows(v, 'units').map((r) => {
      const ro = roicOf(cn(r, 'ebit'), cn(r, 'investedCapital'));
      return { name: cs(r, 'name'), roic: ro, spread: ro === null ? null : ro - w.wacc, eva: ro === null ? null : (ro - w.wacc) * cn(r, 'investedCapital') };
    }).sort((a, b) => (b.spread ?? -Infinity) - (a.spread ?? -Infinity));
    const flags = spread !== null && spread < 0 ? [warn('destroy', i18nKey('ROIC 低于 WACC {p0}：在摧毁价值'), { p0: pctText(-spread) })] : [];
    for (const u of units.filter((x) => (x.spread ?? 0) < 0)) flags.push(warn(`unit_${u.name}`, i18nKey('业务单元「{p0}」ROIC 低于 WACC'), { p0: u.name }));
    return {
      metrics: [met('ke', i18nKey('股权成本'), w.ke, 'pct'), met('kd', i18nKey('税后债务成本'), w.kdAfterTax, 'pct'), met('wacc', i18nKey('WACC'), w.wacc, 'pct'),
        met('roic', 'ROIC', roic, 'pct'), met('spread', i18nKey('ROIC − WACC'), spread, 'pct', spread !== null && spread < 0 ? 'bad' : 'ok'), met('eva', i18nKey('经济增加值 EVA'), eva, 'money')],
      tables: units.length ? [tbl('units', i18nKey('业务单元价值创造'), [col('name', i18nKey('业务单元'), 'text'), col('roic', 'ROIC', 'pct'), col('spread', i18nKey('ROIC − WACC'), 'pct'), col('eva', i18nKey('经济增加值 EVA'), 'money')], units)] : [],
      flags,
    };
  },
};

// ── 多情景 ──
const SCENARIO: CapEngine = {
  check(v) {
    const p = sum(rows(v, 'scenarios').map((r) => cn(r, 'probability')));
    return Math.abs(p - 1) > 0.001 ? [msg(i18nKey('情景概率合计 {p0}，应为 100%'), { p0: pctText(p) })] : [];
  },
  run(v) {
    const sc = rows(v, 'scenarios').map((r) => ({ name: cs(r, 'name'), p: cn(r, 'probability'), npv: cn(r, 'npv') }));
    const ev = sum(sc.map((x) => x.p * x.npv));
    const sd = Math.sqrt(sum(sc.map((x) => x.p * (x.npv - ev) ** 2)));
    const pLoss = sum(sc.filter((x) => x.npv < 0).map((x) => x.p));
    const flags = pLoss > 0 ? [warn('loss', i18nKey('有 {p0} 的概率 NPV 为负'), { p0: pctText(pLoss) })] : [];
    return {
      metrics: [met('expected', i18nKey('期望 NPV'), ev, 'money'), met('sd', i18nKey('NPV 标准差'), sd, 'money'), met('pLoss', i18nKey('亏损概率'), pLoss, 'pct'),
        met('min', i18nKey('最差情景 NPV'), Math.min(...sc.map((x) => x.npv)), 'money'), met('max', i18nKey('最好情景 NPV'), Math.max(...sc.map((x) => x.npv)), 'money')],
      tables: [tbl('scenarios', i18nKey('情景加权'), [col('name', i18nKey('情景'), 'text'), col('p', i18nKey('概率'), 'pct'), col('npv', i18nKey('净现值'), 'money'), col('weighted', i18nKey('加权值'), 'money')], sc.map((x) => ({ name: x.name, p: x.p, npv: x.npv, weighted: x.p * x.npv })))],
      flags, numbers: sc.map((x) => x.p * x.npv),
    };
  },
};

export const CAPEX_ENGINES: Record<string, CapEngine> = { npv_irr: NPV_IRR, real_options: REAL_OPTIONS, wacc_roic: WACC_ROIC, scenario: SCENARIO };
