/**
 * F6 证券研究、F8 财富管理的规则部分（纯函数）：实际 vs 一致预期、估计值变化、催化剂日历、选股筛选、竞争集中度、
 * 投资逻辑状态、融资动态汇总；财富：持仓配置与偏离、时间加权收益、配置方案的期望收益。
 * 叙述（研究报告、复盘话术、建议书）由 runner 交模型起草，数字回核，并带「非投资建议」声明。
 */
import { i18nKey } from '@totalclaw/i18n';
import { cn, cs, n, nOpt, rows, s } from './inputs';
import { sum } from './math';
import { L, col, info, k, met, msg, pctText, tbl, warn, type CapEngine } from './types';
import { today } from './deals';

const docOnly: CapEngine = { run: () => ({ metrics: [], tables: [], flags: [] }) };
const rel = (a: number, b: number) => (b ? (a - b) / Math.abs(b) : null);

const EARNINGS: CapEngine = {
  run(v) {
    const th = n(v, 'beatPct', 0.02);
    const xs = rows(v, 'actuals').map((r) => {
      const d = rel(cn(r, 'actual'), cn(r, 'consensus'));
      return { metric: cs(r, 'metric'), actual: cn(r, 'actual'), consensus: cn(r, 'consensus'), diff: cn(r, 'actual') - cn(r, 'consensus'), pct: d, verdict: d === null ? '' : k(d > th ? i18nKey('超预期') : d < -th ? i18nKey('不及预期') : i18nKey('符合预期')) };
    });
    return {
      metrics: [met('beats', i18nKey('超预期指标'), xs.filter((x) => x.pct !== null && x.pct > th).length, 'int'), met('misses', i18nKey('不及预期指标'), xs.filter((x) => x.pct !== null && x.pct < -th).length, 'int')],
      tables: [tbl('actuals', i18nKey('实际与一致预期'), [col('metric', i18nKey('指标'), 'text'), col('actual', i18nKey('实际'), 'num'), col('consensus', i18nKey('一致预期'), 'num'), col('diff', i18nKey('差额'), 'num'), col('pct', i18nKey('偏差'), 'pct'), col('verdict', i18nKey('判断'), 'text')], xs)],
      flags: [], numbers: xs.map((x) => x.diff),
    };
  },
};

const PREVIEW: CapEngine = {
  run(v) {
    const xs = rows(v, 'estimates').map((r) => ({ metric: cs(r, 'metric'), consensus: cn(r, 'consensus'), ours: cn(r, 'ours'), diff: cn(r, 'ours') - cn(r, 'consensus'), pct: rel(cn(r, 'ours'), cn(r, 'consensus')) }));
    return {
      metrics: [met('count', i18nKey('关注指标'), xs.length, 'int')],
      tables: [tbl('estimates', i18nKey('我们的估计与一致预期'), [col('metric', i18nKey('指标'), 'text'), col('consensus', i18nKey('一致预期'), 'num'), col('ours', i18nKey('我们的估计'), 'num'), col('diff', i18nKey('差额'), 'num'), col('pct', i18nKey('偏差'), 'pct')], xs)],
      flags: [], numbers: xs.map((x) => x.diff),
    };
  },
};

const MODEL_UPDATE: CapEngine = {
  run(v) {
    const th = n(v, 'materialPct', 0.05);
    const xs = rows(v, 'estimates').map((r) => ({ metric: cs(r, 'metric'), period: cs(r, 'period'), old: cn(r, 'old'), new: cn(r, 'new'), pct: rel(cn(r, 'new'), cn(r, 'old')) }))
      .map((x) => ({ ...x, material: x.pct !== null && Math.abs(x.pct) > th }));
    return {
      metrics: [met('material', i18nKey('重大变化'), xs.filter((x) => x.material).length, 'int', xs.some((x) => x.material) ? 'warn' : 'ok')],
      tables: [tbl('estimates', i18nKey('估计值变化'), [col('metric', i18nKey('指标'), 'text'), col('period', i18nKey('期间'), 'text'), col('old', i18nKey('原估计'), 'num'), col('new', i18nKey('新估计'), 'num'), col('pct', i18nKey('变化'), 'pct'), col('material', i18nKey('重大变化'), 'text')], xs.map((x) => ({ ...x, material: x.material ? 'TRUE' : '' })))],
      flags: xs.filter((x) => x.material).map((x) => warn(`mat_${x.metric}_${x.period}`, i18nKey('「{p0}」{p1} 估计变化 {p2}，超过重大变化判定线'), { p0: x.metric, p1: x.period, p2: pctText(x.pct) })),
      numbers: xs.map((x) => x.new - x.old),
    };
  },
};

const TYPE_LABEL: Record<string, string> = { earnings: i18nKey('财报'), conference: i18nKey('会议'), regulatory: i18nKey('监管'), product: i18nKey('产品'), other: i18nKey('其他') };
const CATALYSTS: CapEngine = {
  run(v) {
    const asOf = s(v, 'asOf') || today();
    const es = rows(v, 'events').map((r) => ({ date: cs(r, 'date'), company: cs(r, 'company'), event: cs(r, 'event'), type: TYPE_LABEL[cs(r, 'type')] ? k(TYPE_LABEL[cs(r, 'type')]) : cs(r, 'type') })).sort((a, b) => a.date.localeCompare(b.date));
    const days = (d: string) => Math.round((Date.parse(d) - Date.parse(asOf)) / 86_400_000);
    const next = es.filter((e) => days(e.date) >= 0 && days(e.date) <= 30);
    return {
      metrics: [met('total', i18nKey('事件数'), es.length, 'int'), met('next30', i18nKey('30 天内'), next.length, 'int'), met('asOf', i18nKey('统计日'), asOf, 'date')],
      tables: [tbl('events', i18nKey('催化剂日历'), [col('date', i18nKey('日期'), 'date'), col('days', i18nKey('距今天数'), 'int'), col('company', i18nKey('公司'), 'text'), col('event', i18nKey('事件'), 'text'), col('type', i18nKey('类型'), 'text')], es.map((e) => ({ ...e, days: days(e.date) })))],
      flags: [],
    };
  },
};

const SCREEN: CapEngine = {
  run(v) {
    const lim = { maxPe: nOpt(v, 'maxPe'), minGrowth: nOpt(v, 'minGrowth'), minRoe: nOpt(v, 'minRoe'), maxLeverage: nOpt(v, 'maxLeverage') };
    const num = (x: unknown) => (typeof x === 'number' ? x : null);
    const us = rows(v, 'universe').map((r) => {
      const pe = num(r.pe); const g = num(r.growth); const roe = num(r.roe); const lev = num(r.leverage);
      const ok = (lim.maxPe === null || (pe !== null && pe > 0 && pe <= lim.maxPe)) && (lim.minGrowth === null || (g !== null && g >= lim.minGrowth))
        && (lim.minRoe === null || (roe !== null && roe >= lim.minRoe)) && (lim.maxLeverage === null || (lev !== null && lev <= lim.maxLeverage));
      return { name: cs(r, 'name'), pe, growth: g, roe, leverage: lev, pass: ok ? 'TRUE' : 'FALSE' };
    }).sort((a, b) => Number(b.pass === 'TRUE') - Number(a.pass === 'TRUE'));
    return {
      metrics: [met('universe', i18nKey('股票池'), us.length, 'int'), met('passed', i18nKey('通过筛选'), us.filter((u) => u.pass === 'TRUE').length, 'int')],
      tables: [tbl('screen', i18nKey('筛选结果'), [col('name', i18nKey('股票'), 'text'), col('pe', i18nKey('市盈率'), 'x'), col('growth', i18nKey('收入增长率'), 'pct'), col('roe', i18nKey('净资产收益率'), 'pct'), col('leverage', i18nKey('净负债 / EBITDA'), 'x'), col('pass', i18nKey('结果'), 'text')], us)],
      flags: [],
    };
  },
};

const COMPETITIVE: CapEngine = {
  run(v) {
    const cs3 = rows(v, 'competitors').map((r) => ({ name: cs(r, 'name'), revenue: cn(r, 'revenue'), positioning: cs(r, 'positioning') }));
    const total = sum(cs3.map((c) => c.revenue));
    const shares = cs3.map((c) => ({ ...c, share: total ? c.revenue / total : 0 })).sort((a, b) => b.share - a.share);
    const hhi = sum(shares.map((c) => (c.share * 100) ** 2));
    const top3 = sum(shares.slice(0, 3).map((c) => c.share));
    return {
      metrics: [met('hhi', i18nKey('赫芬达尔指数 HHI'), hhi, 'num', hhi > 2500 ? 'warn' : 'ok'), met('top3', i18nKey('前三名集中度'), top3, 'pct')],
      tables: [tbl('shares', i18nKey('收入份额（样本内）'), [col('name', i18nKey('公司'), 'text'), col('revenue', i18nKey('收入'), 'money'), col('share', i18nKey('份额'), 'pct'), col('positioning', i18nKey('定位'), 'text')], shares)],
      flags: hhi > 2500 ? [info('concentrated', i18nKey('HHI 超过 2500：样本内市场高度集中'))] : [], numbers: [total],
    };
  },
};

const PILLAR: Record<string, string> = { intact: i18nKey('成立'), watch: i18nKey('观察'), broken: i18nKey('失效') };
const THESIS: CapEngine = {
  run(v) {
    const ps = rows(v, 'pillars').map((r) => ({ pillar: cs(r, 'pillar'), evidence: cs(r, 'evidence'), status: cs(r, 'status') }));
    const c = (k: string) => ps.filter((p) => p.status === k).length;
    return {
      metrics: [met('intact', i18nKey('成立'), c('intact'), 'int'), met('watch', i18nKey('观察'), c('watch'), 'int'), met('broken', i18nKey('失效'), c('broken'), 'int', c('broken') ? 'bad' : 'ok')],
      tables: [tbl('pillars', i18nKey('逻辑支柱'), [col('pillar', i18nKey('逻辑支柱'), 'text'), col('status', L.status, 'text'), col('evidence', i18nKey('证据'), 'text')], ps.map((p) => ({ ...p, status: PILLAR[p.status] ? k(PILLAR[p.status]) : p.status })))],
      flags: ps.filter((p) => p.status === 'broken').map((p) => warn(`broken_${p.pillar}`, i18nKey('逻辑支柱「{p0}」已失效，需要复盘投资逻辑'), { p0: p.pillar })),
    };
  },
};

const FUNDING: CapEngine = {
  run(v) {
    const rs = rows(v, 'rounds').map((r) => ({ company: cs(r, 'company'), date: cs(r, 'date'), amount: cn(r, 'amount'), stage: cs(r, 'stage'), investors: cs(r, 'investors') })).sort((a, b) => b.amount - a.amount);
    const stages = [...new Set(rs.map((r) => r.stage))].map((st) => ({ stage: st, count: rs.filter((r) => r.stage === st).length, amount: sum(rs.filter((r) => r.stage === st).map((r) => r.amount)) }));
    return {
      metrics: [met('rounds', i18nKey('融资轮数'), rs.length, 'int'), met('total', i18nKey('融资总额'), sum(rs.map((r) => r.amount)), 'money'), met('largest', i18nKey('最大单笔'), rs[0]?.amount ?? null, 'money')],
      tables: [tbl('stages', i18nKey('按轮次汇总'), [col('stage', i18nKey('轮次'), 'text'), col('count', i18nKey('轮数'), 'int'), col('amount', L.amount, 'money')], stages), tbl('rounds', i18nKey('融资事件'), [col('company', i18nKey('公司'), 'text'), col('date', i18nKey('日期'), 'date'), col('amount', L.amount, 'money'), col('stage', i18nKey('轮次'), 'text'), col('investors', i18nKey('投资方'), 'text')], rs)],
      flags: [], numbers: stages.map((x) => x.amount),
    };
  },
};

export const RESEARCH_ENGINES: Record<string, CapEngine> = {
  initiate: docOnly, earnings: EARNINGS, earnings_preview: PREVIEW, model_update: MODEL_UPDATE, morning_note: docOnly, catalysts: CATALYSTS,
  screen: SCREEN, sector: docOnly, competitive: COMPETITIVE, thesis: THESIS, tear_sheet: docOnly, funding_digest: FUNDING,
};

// ═══ F8 财富 ═══

export function holdingsSummary(hs: Array<{ asset: string; assetClass: string; value: number; target: number | null }>) {
  const total = sum(hs.map((h) => h.value));
  const classes = [...new Set(hs.map((h) => h.assetClass))].map((c) => {
    const items = hs.filter((h) => h.assetClass === c);
    const weight = total ? sum(items.map((h) => h.value)) / total : 0;
    const tgt = items.some((h) => h.target !== null) ? sum(items.map((h) => h.target || 0)) : null;
    return { assetClass: c, value: sum(items.map((h) => h.value)), weight, target: tgt, drift: tgt === null ? null : weight - tgt };
  });
  return { total, classes };
}
/** 时间加权收益：各期 (1 + r) 连乘 − 1 */
export const twr = (rs: number[]): number => rs.reduce((p, r) => p * (1 + r), 1) - 1;

const HOLD: CapEngine = {
  run(v) {
    const hs = rows(v, 'holdings').map((r) => ({ asset: cs(r, 'asset'), assetClass: cs(r, 'assetClass'), value: cn(r, 'value'), target: typeof r.target === 'number' ? r.target : null }));
    const { total, classes } = holdingsSummary(hs);
    const rs = rows(v, 'returns').map((r) => ({ period: cs(r, 'period'), ret: cn(r, 'ret') }));
    const t = rs.length ? twr(rs.map((r) => r.ret)) : null;
    const flags = classes.filter((c) => c.drift !== null && Math.abs(c.drift) > 0.05).map((c) => warn(`drift_${c.assetClass}`, i18nKey('「{p0}」实际权重偏离目标 {p1}，超过 5 个百分点'), { p0: c.assetClass, p1: pctText(c.drift) }));
    return {
      metrics: [met('total', i18nKey('组合市值'), total, 'money'), ...(t !== null ? [met('twr', i18nKey('区间时间加权收益'), t, 'pct')] : []), met('classes', i18nKey('资产类别数'), classes.length, 'int')],
      tables: [tbl('allocation', i18nKey('资产配置与偏离'), [col('assetClass', i18nKey('资产类别'), 'text'), col('value', i18nKey('市值'), 'money'), col('weight', i18nKey('实际权重'), 'pct'), col('target', i18nKey('目标权重'), 'pct'), col('drift', i18nKey('偏离'), 'pct')], classes),
        ...(rs.length ? [tbl('returns', i18nKey('分期收益率'), [col('period', i18nKey('期间'), 'text'), col('ret', i18nKey('收益率'), 'pct')], rs)] : [])],
      flags, numbers: classes.map((c) => c.value),
    };
  },
};

const PROPOSAL: CapEngine = {
  check(v) {
    const w = sum(rows(v, 'allocation').map((r) => cn(r, 'weight')));
    return Math.abs(w - 1) > 0.001 ? [msg(i18nKey('配置权重合计 {p0}，应为 100%'), { p0: pctText(w) })] : [];
  },
  run(v) {
    const amt = n(v, 'amount');
    const al = rows(v, 'allocation').map((r) => ({ assetClass: cs(r, 'assetClass'), weight: cn(r, 'weight'), expReturn: cn(r, 'expReturn'), amount: amt * cn(r, 'weight') }));
    const er = sum(al.map((a) => a.weight * a.expReturn));
    return {
      metrics: [met('amount', i18nKey('拟投资金额'), amt, 'money'), met('expReturn', i18nKey('组合预期收益率（未计相关性与费用）'), er, 'pct')],
      tables: [tbl('allocation', i18nKey('配置方案'), [col('assetClass', i18nKey('资产类别'), 'text'), col('weight', i18nKey('权重'), 'pct'), col('amount', L.amount, 'money'), col('expReturn', i18nKey('预期收益率'), 'pct')], al)],
      flags: [info('advisor', i18nKey('配置方案是给持牌顾问审阅的草稿，不是投资建议；是否适合客户由顾问按适当性要求判断'))],
      numbers: al.map((a) => a.amount),
    };
  },
};

export const WEALTH_ENGINES: Record<string, CapEngine> = { client_review: HOLD, client_report: HOLD, investment_proposal: PROPOSAL, meeting_prep: docOnly };
