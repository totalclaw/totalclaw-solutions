/**
 * F3 并购尽调、F4 投行、F5 PE 的规则引擎（纯函数）。叙述类模式（CIM、teaser、投委会备忘录……）没有引擎，
 * 由 runner 交模型按技能起草、数字回核。
 *   - 尽调清单：按行业与交易类型组合（private-equity dd-checklist）；
 *   - 财务尽调：盈利质量调整、营运资本正常化、净债务与类债务（finance-skills financial-due-diligence）；
 *   - 合并模型：增厚 / 摊薄、盈亏平衡协同、商誉（investment-banking merger-model）；
 *   - 回报：MOIC、IRR（或按日期 XIRR）、价值创造拆分（EBITDA 增长 + 倍数变化 + 去杠杆 = 股权增值）；
 *   - 分配瀑布：欧式整体基金口径：返还出资 → 优先回报 → GP 追补 → 按业绩报酬比例分成。
 */
import { i18nKey } from '@totalclaw/i18n';
import { cn, cs, n, nOpt, rows, s, type CapIn } from './inputs';
import { grid5, mean, stdev, sum, xirr } from './math';
import { L, col, info, k, met, msg, numText, pctText, tbl, warn, type CapEngine, type CapOut } from './types';

const docOnly: CapEngine = { run: () => ({ metrics: [], tables: [], flags: [] }) };

// ═══ F3 ═══

type Pri = 'high' | 'medium';
const BASE_ITEMS: Array<[string, string, string, Pri]> = [
  ['FIN-01', i18nKey('财务'), i18nKey('近三年经审计财务报表与审计报告'), 'high'],
  ['FIN-02', i18nKey('财务'), i18nKey('月度管理报表与预算执行'), 'high'],
  ['FIN-03', i18nKey('财务'), i18nKey('收入确认政策与前十大客户收入明细'), 'high'],
  ['FIN-04', i18nKey('财务'), i18nKey('营运资本明细：应收、存货、应付账龄'), 'high'],
  ['FIN-05', i18nKey('财务'), i18nKey('有息负债、担保与表外承诺清单'), 'high'],
  ['FIN-06', i18nKey('财务'), i18nKey('资本开支历史与计划'), 'medium'],
  ['TAX-01', i18nKey('税务'), i18nKey('各税种纳税申报表与税务检查记录'), 'high'],
  ['TAX-02', i18nKey('税务'), i18nKey('关联交易与转让定价文档'), 'medium'],
  ['LEG-01', i18nKey('法律'), i18nKey('公司章程、股权结构与历次增资记录'), 'high'],
  ['LEG-02', i18nKey('法律'), i18nKey('重大合同：客户、供应商、借款'), 'high'],
  ['LEG-03', i18nKey('法律'), i18nKey('未决诉讼、仲裁与行政处罚'), 'high'],
  ['LEG-04', i18nKey('法律'), i18nKey('知识产权清单与权属证明'), 'medium'],
  ['COM-01', i18nKey('商业'), i18nKey('市场规模、竞争格局与客户访谈'), 'medium'],
  ['HR-01', i18nKey('人力'), i18nKey('组织架构、核心员工合同与竞业限制'), 'medium'],
  ['HR-02', i18nKey('人力'), i18nKey('社保公积金缴纳与劳动争议'), 'medium'],
  ['IT-01', i18nKey('信息系统'), i18nKey('信息系统、数据安全与个人信息合规'), 'medium'],
  ['ESG-01', 'ESG', i18nKey('环保许可、安全生产与合规记录'), 'medium'],
];
const INDUSTRY_ITEMS: Record<string, Array<[string, string, string, Pri]>> = {
  saas: [['SAAS-01', i18nKey('行业'), i18nKey('ARR、续费率与客户队列数据'), 'high'], ['SAAS-02', i18nKey('行业'), i18nKey('云服务成本与毛利拆分'), 'medium']],
  manufacturing: [['MFG-01', i18nKey('行业'), i18nKey('产能利用率、设备清单与维护记录'), 'medium'], ['MFG-02', i18nKey('行业'), i18nKey('存货盘点与呆滞分析'), 'high']],
  consumer: [['CON-01', i18nKey('行业'), i18nKey('渠道结构与经销商返利政策'), 'high'], ['CON-02', i18nKey('行业'), i18nKey('门店与单品层面的盈利能力'), 'medium']],
  financial: [['FS-01', i18nKey('行业'), i18nKey('资本充足、监管牌照与合规检查'), 'high'], ['FS-02', i18nKey('行业'), i18nKey('资产质量与拨备'), 'high']],
  healthcare: [['HC-01', i18nKey('行业'), i18nKey('产品注册证、临床与质量体系'), 'high'], ['HC-02', i18nKey('行业'), i18nKey('医保与集采影响'), 'medium']],
};
const DEAL_ITEMS: Record<string, Array<[string, string, string, Pri]>> = {
  buyout: [['DEAL-01', i18nKey('交易'), i18nKey('融资可得性与贷款契约条款'), 'medium']],
  minority: [['DEAL-02', i18nKey('交易'), i18nKey('股东权利、优先权与退出条款'), 'high']],
  carve_out: [['DEAL-03', i18nKey('交易'), i18nKey('过渡期服务协议与独立运营成本'), 'high']],
  merger: [['DEAL-04', i18nKey('交易'), i18nKey('双方文化、系统与组织整合计划'), 'medium']],
};
const STATUS_LABEL: Record<string, string> = { received: i18nKey('已收到'), pending: i18nKey('待补'), issue: i18nKey('有问题') };
const PRI_LABEL: Record<Pri, string> = { high: i18nKey('高'), medium: i18nKey('中') };

export function ddChecklist(industry: string, dealType: string, status: Array<{ item: string; status: string; note: string }>) {
  const items = [...BASE_ITEMS, ...(INDUSTRY_ITEMS[industry] || []), ...(DEAL_ITEMS[dealType] || [])];
  const st = new Map(status.map((x) => [x.item.trim().toUpperCase(), x]));
  return items.map(([code, cat, item, pri]) => ({ code, cat, item, pri, status: st.get(code)?.status || 'pending', note: st.get(code)?.note || '' }));
}

const DD_CHECKLIST: CapEngine = {
  run(v) {
    const list = ddChecklist(s(v, 'industry', 'general'), s(v, 'dealType', 'buyout'), rows(v, 'status').map((r) => ({ item: cs(r, 'item'), status: cs(r, 'status'), note: cs(r, 'note') })));
    const cnt = (k: string) => list.filter((x) => x.status === k).length;
    const flags = list.filter((x) => x.status === 'issue').map((x) => warn(`issue_${x.code}`, i18nKey('红旗：{p0}「{p1}」有问题，需升级'), { p0: x.code, p1: x.item }));
    const highPending = list.filter((x) => x.status === 'pending' && x.pri === 'high').length;
    if (highPending) flags.push(info('high_pending', i18nKey('{n} 项高优先级资料待补'), { n: highPending }));
    return {
      metrics: [met('total', i18nKey('清单项数'), list.length, 'int'), met('received', i18nKey('已收到'), cnt('received'), 'int'), met('pending', i18nKey('待补'), cnt('pending'), 'int'), met('issue', i18nKey('有问题'), cnt('issue'), 'int', cnt('issue') ? 'bad' : 'ok')],
      tables: [tbl('checklist', i18nKey('尽调清单'), [col('code', i18nKey('编号'), 'text'), col('cat', i18nKey('类别'), 'text'), col('item', L.item, 'text'), col('pri', i18nKey('优先级'), 'text'), col('status', L.status, 'text'), col('note', L.note, 'text')],
        list.map((x) => ({ code: x.code, cat: k(x.cat), item: k(x.item), pri: k(PRI_LABEL[x.pri]), status: STATUS_LABEL[x.status] ? k(STATUS_LABEL[x.status]) : x.status, note: x.note })))],
      flags,
    };
  },
};

export function financialDd(v: CapIn) {
  const reported = n(v, 'reportedEbitda');
  const adj = rows(v, 'qoe').map((r) => ({ item: cs(r, 'item'), amount: cn(r, 'amount'), category: cs(r, 'category') || 'other' }));
  const adjusted = reported + sum(adj.map((a) => a.amount));
  const nwc = rows(v, 'nwc').map((r) => cn(r, 'nwc'));
  const avgNwc = mean(nwc.slice(-12));
  const peg = nOpt(v, 'pegNwc') ?? avgNwc;
  const closing = nOpt(v, 'closingNwc');
  const debtLike = sum(rows(v, 'debtLike').map((r) => cn(r, 'amount')));
  const netDebt = n(v, 'debt') - n(v, 'cash');
  return { reported, adj, adjusted, avgNwc, nwcSd: stdev(nwc.slice(-12)), peg, nwcAdj: closing !== null && peg !== null ? closing - peg : null, debtLike, netDebt, adjNetDebt: netDebt + debtLike };
}

const CAT_LABEL: Record<string, string> = { nonrecurring: i18nKey('非经常性'), owner: i18nKey('股东相关'), pro_forma: i18nKey('备考'), accounting: i18nKey('会计口径'), other: i18nKey('其他') };
const FIN_DD: CapEngine = {
  run(v) {
    const r = financialDd(v);
    const flags = [];
    const adjShare = r.reported ? Math.abs(r.adjusted - r.reported) / Math.abs(r.reported) : 0;
    if (adjShare > 0.2) flags.push(warn('qoe_big', i18nKey('盈利质量调整合计占报告 EBITDA {p0}，超过 20%'), { p0: pctText(adjShare) }));
    if (r.avgNwc && r.nwcSd !== null && r.nwcSd / Math.abs(r.avgNwc) > 0.25) flags.push(warn('nwc_vol', i18nKey('营运资本月度波动大（标准差超过平均值的 25%），目标营运资本要谨慎商定')));
    if (r.debtLike > 0) flags.push(info('debt_like', i18nKey('类债务项目合计 {p0}，交易价格里应作为债务扣减'), { p0: numText(r.debtLike) }));
    return {
      metrics: [met('reported', i18nKey('报告 EBITDA'), r.reported, 'money'), met('adjusted', i18nKey('调整后 EBITDA'), r.adjusted, 'money'), met('avgNwc', i18nKey('近 12 个月平均营运资本'), r.avgNwc, 'money'),
        met('peg', i18nKey('目标营运资本'), r.peg, 'money'), met('nwcAdj', i18nKey('营运资本价格调整'), r.nwcAdj, 'money'), met('netDebt', i18nKey('净债务'), r.netDebt, 'money'), met('adjNetDebt', i18nKey('含类债务的净债务'), r.adjNetDebt, 'money')],
      tables: [tbl('qoe', i18nKey('EBITDA 调整桥'), [col('item', L.item, 'text'), col('category', i18nKey('类别'), 'text'), col('amount', L.amount, 'money')],
        [{ item: k(i18nKey('报告 EBITDA')), category: '', amount: r.reported }, ...r.adj.map((a) => ({ item: a.item, category: CAT_LABEL[a.category] ? k(CAT_LABEL[a.category]) : a.category, amount: a.amount })), { item: k(i18nKey('调整后 EBITDA')), category: '', amount: r.adjusted }])],
      flags, numbers: [r.nwcSd ?? 0, Math.abs(r.adjusted - r.reported)],
    };
  },
};

const INTEGRATION: CapEngine = {
  run(v) {
    const sy = rows(v, 'synergies').map((r) => ({ item: cs(r, 'item'), type: cs(r, 'type') || 'cost', runRate: cn(r, 'runRate'), phase: cn(r, 'phaseY1', 0.5), oneOff: cn(r, 'oneOff') }));
    const run = sum(sy.map((x) => x.runRate));
    const y1 = sum(sy.map((x) => x.runRate * x.phase));
    const oneOff = sum(sy.map((x) => x.oneOff));
    return {
      metrics: [met('runRate', i18nKey('年化协同合计'), run, 'money'), met('cost', i18nKey('成本协同'), sum(sy.filter((x) => x.type === 'cost').map((x) => x.runRate)), 'money'), met('revenue', i18nKey('收入协同'), sum(sy.filter((x) => x.type === 'revenue').map((x) => x.runRate)), 'money'),
        met('y1', i18nKey('第一年实现'), y1, 'money'), met('oneOff', i18nKey('一次性整合成本'), oneOff, 'money'), met('payback', i18nKey('整合成本回收年数'), run > 0 ? oneOff / run : null, 'num')],
      tables: sy.length ? [tbl('synergies', i18nKey('协同效应'), [col('item', L.item, 'text'), col('runRate', i18nKey('年化金额'), 'money'), col('y1', i18nKey('第一年实现'), 'money'), col('oneOff', i18nKey('一次性成本'), 'money')], sy.map((x) => ({ item: x.item, runRate: x.runRate, y1: x.runRate * x.phase, oneOff: x.oneOff })))] : [],
      flags: sy.some((x) => x.type === 'revenue') ? [info('rev_syn', i18nKey('收入协同不确定性高于成本协同，估值里建议打折或单列'))] : [],
      numbers: sy.map((x) => x.runRate * x.phase),
    };
  },
};

export const MA_ENGINES: Record<string, CapEngine> = { dd_checklist: DD_CHECKLIST, financial_dd: FIN_DD, dd_prep: docOnly, integration: INTEGRATION };

// ═══ F4 ═══

export interface MergerIn { acqNetIncome: number; acqShares: number; acqPrice: number; tgtNetIncome: number; purchasePrice: number; pctStock: number; pctCash: number; pctDebt: number; costDebt: number; cashYield: number; taxRate: number; synergies: number; tgtNetAssets: number; intangibles: number }
export function merger(d: MergerIn) {
  const pf = (pctStock: number, pctCash: number, pctDebt: number, syn: number) => {
    const newShares = d.purchasePrice * pctStock / d.acqPrice;
    const ni = d.acqNetIncome + d.tgtNetIncome + syn * (1 - d.taxRate) - d.purchasePrice * pctCash * d.cashYield * (1 - d.taxRate) - d.purchasePrice * pctDebt * d.costDebt * (1 - d.taxRate);
    const shares = d.acqShares + newShares;
    return { newShares, ni, shares, eps: ni / shares };
  };
  const base = d.acqNetIncome / d.acqShares;
  const p = pf(d.pctStock, d.pctCash, d.pctDebt, d.synergies);
  // 盈亏平衡协同：备考 EPS = 收购方 EPS 所需的税前协同（不为负）
  const noSyn = pf(d.pctStock, d.pctCash, d.pctDebt, 0);
  const breakeven = Math.max(0, (base * noSyn.shares - noSyn.ni) / (1 - d.taxRate));
  const nonStock = d.pctCash + d.pctDebt;
  const mix = (ps: number) => (nonStock > 0 ? [ps, (1 - ps) * d.pctCash / nonStock, (1 - ps) * d.pctDebt / nonStock] : [ps, 1 - ps, 0]);
  const stocks = [0, 0.25, 0.5, 0.75, 1];
  const syns = [0, 0.5, 1, 1.5, 2].map((k) => k * (d.synergies || breakeven || 1));
  return {
    acqEps: base, ...p, accretion: p.eps / base - 1, breakeven,
    goodwill: d.purchasePrice - d.tgtNetAssets - d.intangibles,
    grid: { stocks, syns, acc: syns.map((sy) => stocks.map((ps) => { const [a, b, c] = mix(ps); return pf(a, b, c, sy).eps / base - 1; })) },
  };
}

const MERGER: CapEngine = {
  check(v) {
    const t = n(v, 'pctStock') + n(v, 'pctCash') + n(v, 'pctDebt');
    return Math.abs(t - 1) > 0.001 ? [msg(i18nKey('股票、现金、借款支付比例合计 {p0}，应为 100%'), { p0: pctText(t) })] : [];
  },
  run(v) {
    const d: MergerIn = Object.fromEntries(['acqNetIncome', 'acqShares', 'acqPrice', 'tgtNetIncome', 'purchasePrice', 'pctStock', 'pctCash', 'pctDebt', 'costDebt', 'cashYield', 'taxRate', 'synergies', 'tgtNetAssets', 'intangibles'].map((k) => [k, n(v, k)])) as unknown as MergerIn;
    const r = merger(d);
    const flags = [r.accretion < 0 ? warn('dilutive', i18nKey('交易摊薄每股收益 {p0}'), { p0: pctText(-r.accretion) }) : info('accretive', i18nKey('交易增厚每股收益 {p0}'), { p0: pctText(r.accretion) })];
    if (r.goodwill < 0) flags.push(warn('bargain', i18nKey('对价低于可辨认净资产公允价值：可能是廉价购买，需复核公允价值')));
    return {
      metrics: [met('acqEps', i18nKey('收购方 EPS'), r.acqEps, 'num'), met('pfEps', i18nKey('备考 EPS'), r.eps, 'num'), met('accretion', i18nKey('增厚 / 摊薄'), r.accretion, 'pct', r.accretion < 0 ? 'bad' : 'ok'),
        met('newShares', i18nKey('新发股数'), r.newShares, 'num'), met('breakeven', i18nKey('盈亏平衡税前协同'), r.breakeven, 'money'), met('goodwill', i18nKey('商誉'), r.goodwill, 'money')],
      tables: [tbl('sensitivity', i18nKey('增厚 / 摊薄敏感性：协同 × 股票支付比例'), [col('syn', i18nKey('税前协同'), 'money'), ...r.grid.stocks.map((x, j) => col(`c${j}`, `${Math.round(x * 100)}%`, 'pct'))],
        r.grid.syns.map((sy, i) => ({ syn: sy, ...Object.fromEntries(r.grid.acc[i].map((x, j) => [`c${j}`, x])) })))],
      flags, numbers: [r.ni, r.shares, ...r.grid.syns],
    };
  },
};

export function buyerScore(fit: number, capacity: number, likelihood: number): number {
  return 0.4 * fit + 0.3 * capacity + 0.3 * likelihood;
}
const BUYERS: CapEngine = {
  run(v) {
    const bs = rows(v, 'buyers').map((r) => ({ name: cs(r, 'name'), type: cs(r, 'type'), score: buyerScore(cn(r, 'fit'), cn(r, 'capacity'), cn(r, 'likelihood')), note: cs(r, 'note') })).sort((a, b) => b.score - a.score);
    const tier = (x: number) => (x >= 4 ? 'A' : x >= 3 ? 'B' : 'C');
    return {
      metrics: [met('count', i18nKey('买方数'), bs.length, 'int'), met('tierA', i18nKey('A 档买方'), bs.filter((b) => tier(b.score) === 'A').length, 'int'), met('strategic', i18nKey('战略买方'), bs.filter((b) => b.type === 'strategic').length, 'int')],
      tables: [tbl('buyers', i18nKey('买方排序'), [col('rank', L.rank, 'int'), col('name', i18nKey('买方'), 'text'), col('type', i18nKey('类型'), 'text'), col('score', L.score, 'num'), col('tier', i18nKey('档位'), 'text'), col('note', L.note, 'text')],
        bs.map((b, i) => ({ rank: i + 1, name: b.name, type: k(b.type === 'strategic' ? i18nKey('战略买方') : i18nKey('财务买方')), score: b.score, tier: tier(b.score), note: b.note })))],
      flags: [], numbers: bs.map((b) => b.score),
    };
  },
};

export function today(): string { return new Date().toISOString().slice(0, 10); }
const daysBetween = (a: string, b: string) => Math.round((Date.parse(b) - Date.parse(a)) / 86_400_000);
const TRACK_LABEL: Record<string, string> = { todo: i18nKey('未开始'), doing: i18nKey('进行中'), done: i18nKey('已完成') };
const TRACKER: CapEngine = {
  run(v) {
    const asOf = s(v, 'asOf') || today();
    const ms = rows(v, 'milestones').map((r) => ({ deal: cs(r, 'deal'), milestone: cs(r, 'milestone'), due: cs(r, 'due'), status: cs(r, 'status'), owner: cs(r, 'owner') })).sort((a, b) => a.due.localeCompare(b.due));
    const late = ms.filter((m) => m.status !== 'done' && daysBetween(asOf, m.due) < 0);
    const soon = ms.filter((m) => m.status !== 'done' && daysBetween(asOf, m.due) >= 0 && daysBetween(asOf, m.due) <= 7);
    return {
      metrics: [met('total', i18nKey('里程碑数'), ms.length, 'int'), met('late', i18nKey('已超期'), late.length, 'int', late.length ? 'bad' : 'ok'), met('soon', i18nKey('7 天内到期'), soon.length, 'int', soon.length ? 'warn' : 'ok'), met('asOf', i18nKey('统计日'), asOf, 'date')],
      tables: [tbl('milestones', i18nKey('里程碑'), [col('deal', i18nKey('项目'), 'text'), col('milestone', i18nKey('里程碑'), 'text'), col('due', i18nKey('截止日'), 'date'), col('days', i18nKey('距今天数'), 'int'), col('status', L.status, 'text'), col('owner', i18nKey('负责人'), 'text')],
        ms.map((m) => ({ deal: m.deal, milestone: m.milestone, due: m.due, days: daysBetween(asOf, m.due), status: TRACK_LABEL[m.status] ? k(TRACK_LABEL[m.status]) : m.status, owner: m.owner })))],
      flags: late.map((m) => warn(`late_${m.deal}_${m.milestone}`, i18nKey('「{p0}」的里程碑「{p1}」已超期 {n} 天'), { p0: m.deal, p1: m.milestone, n: -daysBetween(asOf, m.due) })),
    };
  },
};

export const IB_ENGINES: Record<string, CapEngine> = {
  merger_model: MERGER, buyer_list: BUYERS, deal_tracker: TRACKER,
  cim: docOnly, teaser: docOnly, one_pager: docOnly, process_letter: docOnly, datapack: docOnly, pitch: docOnly,
};

// ═══ F5 ═══

export interface ReturnsIn { entryEbitda: number; entryMultiple: number; entryNetDebt: number; exitEbitda: number; exitMultiple: number; exitNetDebt: number; holdYears: number; flows: Array<{ date: string; amount: number }> }
export function peReturns(d: ReturnsIn) {
  const eq0 = d.entryEbitda * d.entryMultiple - d.entryNetDebt;
  const eq1 = d.exitEbitda * d.exitMultiple - d.exitNetDebt;
  const irrOf = (em: number, xm: number) => {
    const a = d.entryEbitda * em - d.entryNetDebt;
    const b = d.exitEbitda * xm - d.exitNetDebt;
    return a > 0 && b > 0 ? (b / a) ** (1 / d.holdYears) - 1 : null;
  };
  const entry = grid5(d.entryMultiple, 1);
  const exit = grid5(d.exitMultiple, 1);
  return {
    eq0, eq1, moic: eq1 / eq0, irr: irrOf(d.entryMultiple, d.exitMultiple), xirr: d.flows.length >= 2 ? xirr(d.flows) : null,
    // 价值创造拆分：EBITDA 增长 × 进入倍数 + 倍数变化 × 退出 EBITDA + 去杠杆 = 股权增值
    attribution: { growth: (d.exitEbitda - d.entryEbitda) * d.entryMultiple, multiple: (d.exitMultiple - d.entryMultiple) * d.exitEbitda, delever: d.entryNetDebt - d.exitNetDebt },
    grid: { entry, exit, irr: entry.map((e) => exit.map((x) => irrOf(e, x))) },
  };
}


const RETURNS: CapEngine = {
  check(v) {
    return n(v, 'entryEbitda') * n(v, 'entryMultiple') - n(v, 'entryNetDebt') > 0 ? [] : [msg(i18nKey('进入时股权价值不为正'))];
  },
  run(v) {
    const d: ReturnsIn = { entryEbitda: n(v, 'entryEbitda'), entryMultiple: n(v, 'entryMultiple'), entryNetDebt: n(v, 'entryNetDebt'), exitEbitda: n(v, 'exitEbitda'), exitMultiple: n(v, 'exitMultiple'), exitNetDebt: n(v, 'exitNetDebt'), holdYears: n(v, 'holdYears', 1), flows: rows(v, 'cashflows').map((x) => ({ date: cs(x, 'date'), amount: cn(x, 'amount') })) };
    const r = peReturns(d);
    const a = r.attribution;
    const gain = a.growth + a.multiple + a.delever;
    const flags = gain > 0 && a.multiple / gain > 0.5 ? [warn('multiple_driven', i18nKey('一半以上的股权增值来自倍数扩张，回报依赖退出时的市场估值'))] : [];
    if (r.eq1 <= 0) flags.push(warn('exit_neg', i18nKey('退出时股权价值不为正')));
    return {
      metrics: [met('eq0', i18nKey('进入股权价值'), r.eq0, 'money'), met('eq1', i18nKey('退出股权价值'), r.eq1, 'money'), met('moic', 'MOIC', r.moic, 'x'), met('irr', 'IRR', r.irr, 'pct'), ...(r.xirr !== null ? [met('xirr', 'XIRR', r.xirr, 'pct')] : [])],
      tables: [
        tbl('attribution', i18nKey('价值创造拆分'), [col('item', L.item, 'text'), col('amount', L.amount, 'money')], [{ item: k(i18nKey('EBITDA 增长')), amount: a.growth }, { item: k(i18nKey('倍数变化')), amount: a.multiple }, { item: k(i18nKey('去杠杆')), amount: a.delever }, { item: k(i18nKey('股权增值合计')), amount: gain }]),
        tbl('sensitivity', i18nKey('IRR 敏感性：进入倍数 × 退出倍数'), [col('entry', i18nKey('进入倍数'), 'x'), ...r.grid.exit.map((x, j) => col(`c${j}`, `${numText(x, 1)}x`, 'pct'))], r.grid.entry.map((e, i) => ({ entry: e, ...Object.fromEntries(r.grid.irr[i].map((x, j) => [`c${j}`, x])) }))),
      ],
      flags, numbers: [a.growth, a.multiple, a.delever, gain, ...r.grid.irr.flat().filter((x): x is number => x !== null)],
    };
  },
};

export function unitEconomics(arpa: number, gm: number, churn: number, cac: number) {
  const ltv = arpa * gm / churn;
  return { ltv, ltvCac: cac > 0 ? ltv / cac : null, paybackMonths: arpa * gm > 0 ? cac / (arpa * gm) : null, lifetimeMonths: 1 / churn };
}
const UNIT_ECON: CapEngine = {
  run(v) {
    const u = unitEconomics(n(v, 'arpa'), n(v, 'grossMargin'), n(v, 'monthlyChurn'), n(v, 'cac'));
    const co = rows(v, 'cohorts').map((r) => ({ cohort: cs(r, 'cohort'), start: cn(r, 'startArr'), end: cn(r, 'arr12') }));
    const nrr = sum(co.map((c) => c.start)) > 0 ? sum(co.map((c) => c.end)) / sum(co.map((c) => c.start)) : null;
    const flags = [];
    if (u.ltvCac !== null && u.ltvCac < 3) flags.push(warn('ltv_cac', i18nKey('LTV/CAC 为 {p0}，低于常用的 3 倍'), { p0: numText(u.ltvCac, 1) }));
    if (u.paybackMonths !== null && u.paybackMonths > 18) flags.push(warn('payback', i18nKey('获客成本回本期 {p0} 个月，超过 18 个月'), { p0: numText(u.paybackMonths, 1) }));
    if (nrr !== null && nrr < 1) flags.push(info('nrr', i18nKey('净收入留存 {p0}，低于 100%'), { p0: pctText(nrr) }));
    return {
      metrics: [met('ltv', 'LTV', u.ltv, 'money'), met('ltvCac', 'LTV/CAC', u.ltvCac, 'x'), met('payback', i18nKey('CAC 回本期（月）'), u.paybackMonths, 'months'), met('lifetime', i18nKey('客户平均生命周期（月）'), u.lifetimeMonths, 'months'), ...(nrr !== null ? [met('nrr', i18nKey('净收入留存 NRR'), nrr, 'pct')] : [])],
      tables: co.length ? [tbl('cohorts', i18nKey('客户队列'), [col('cohort', i18nKey('队列'), 'text'), col('start', i18nKey('起始 ARR'), 'money'), col('end', i18nKey('12 个月后 ARR'), 'money'), col('nrr', 'NRR', 'pct')], co.map((c) => ({ cohort: c.cohort, start: c.start, end: c.end, nrr: c.start > 0 ? c.end / c.start : null })))] : [],
      flags,
    };
  },
};

/** 欧式整体基金瀑布：返还出资 → 优先回报（按年复利）→ GP 追补 → 剩余按 (1 − carry) : carry 分配 */
export function waterfall(contributed: number, proceeds: number, prefRate: number, years: number, catchUp: number, carry: number) {
  let rest = proceeds;
  const take = (x: number) => { const t = Math.max(0, Math.min(rest, x)); rest -= t; return t; };
  const roc = take(contributed);
  const pref = take(contributed * ((1 + prefRate) ** years - 1));
  // GP 在追补段拿 catchUp 的比例，直到 GP 累计 = carry × (优先回报 + 追补段总额)
  const cuTotal = catchUp > carry ? take(carry * pref / (catchUp - carry)) : 0;
  const cuGp = cuTotal * catchUp;
  const split = rest;
  rest = 0;
  const tiers = [
    { tier: 'roc', lp: roc, gp: 0 },
    { tier: 'pref', lp: pref, gp: 0 },
    { tier: 'catchup', lp: cuTotal - cuGp, gp: cuGp },
    { tier: 'split', lp: split * (1 - carry), gp: split * carry },
  ];
  const lp = sum(tiers.map((t) => t.lp));
  const gp = sum(tiers.map((t) => t.gp));
  return { tiers, lp, gp, gpShareOfProfit: proceeds > contributed ? gp / (proceeds - contributed) : null };
}
const TIER_LABEL: Record<string, string> = { roc: i18nKey('返还出资'), pref: i18nKey('优先回报'), catchup: i18nKey('GP 追补'), split: i18nKey('超额收益分成') };
const WATERFALL: CapEngine = {
  run(v) {
    const w = waterfall(n(v, 'contributed'), n(v, 'proceeds'), n(v, 'prefRate'), n(v, 'years'), n(v, 'catchUp'), n(v, 'carry'));
    const hs = rows(v, 'holdings').map((r) => ({ name: cs(r, 'name'), cost: cn(r, 'cost'), gp: cn(r, 'gpMark'), review: typeof r.reviewMark === 'number' ? r.reviewMark : null }));
    const flags = hs.filter((h) => h.review && Math.abs(h.gp - h.review) / Math.abs(h.review) > 0.1).map((h) => warn(`mark_${h.name}`, i18nKey('「{p0}」GP 估值与复核估值偏差 {p1}，超过 10%'), { p0: h.name, p1: pctText((h.gp - h.review!) / Math.abs(h.review!)) }));
    if (n(v, 'proceeds') < n(v, 'contributed')) flags.push(warn('loss', i18nKey('可分配金额低于实缴出资：没有业绩报酬')));
    return {
      metrics: [met('lp', i18nKey('LP 分配合计'), w.lp, 'money'), met('gp', i18nKey('GP 业绩报酬'), w.gp, 'money'), met('gpShare', i18nKey('GP 占超额收益'), w.gpShareOfProfit, 'pct'),
        ...(hs.length ? [met('navGp', i18nKey('GP 估值合计'), sum(hs.map((h) => h.gp)), 'money'), met('moicGp', i18nKey('按 GP 估值的 MOIC'), sum(hs.map((h) => h.cost)) ? sum(hs.map((h) => h.gp)) / sum(hs.map((h) => h.cost)) : null, 'x')] : [])],
      tables: [
        tbl('waterfall', i18nKey('分配瀑布'), [col('tier', i18nKey('层级'), 'text'), col('lp', 'LP', 'money'), col('gp', 'GP', 'money'), col('total', i18nKey('合计'), 'money')], w.tiers.map((t) => ({ tier: k(TIER_LABEL[t.tier]), lp: t.lp, gp: t.gp, total: t.lp + t.gp }))),
        ...(hs.length ? [tbl('marks', i18nKey('估值复核'), [col('name', i18nKey('组合公司'), 'text'), col('cost', i18nKey('投资成本'), 'money'), col('gp', i18nKey('GP 估值'), 'money'), col('review', i18nKey('复核估值'), 'money'), col('diff', i18nKey('偏差'), 'pct')], hs.map((h) => ({ name: h.name, cost: h.cost, gp: h.gp, review: h.review, diff: h.review ? (h.gp - h.review) / Math.abs(h.review) : null })))] : []),
      ],
      flags, numbers: w.tiers.flatMap((t) => [t.lp, t.gp, t.lp + t.gp]),
    };
  },
};

const PORTFOLIO: CapEngine = {
  run(v) {
    const th = n(v, 'threshold', 0.1);
    const ks = rows(v, 'kpis').map((r) => {
      const a = cn(r, 'actual');
      const b = cn(r, 'budget');
      return { company: cs(r, 'company'), metric: cs(r, 'metric'), actual: a, budget: b, diff: a - b, pct: b ? (a - b) / Math.abs(b) : null };
    });
    const off = ks.filter((k) => k.pct !== null && Math.abs(k.pct) > th);
    return {
      metrics: [met('count', i18nKey('指标数'), ks.length, 'int'), met('off', i18nKey('超出预警偏差'), off.length, 'int', off.length ? 'warn' : 'ok'), met('companies', i18nKey('公司数'), new Set(ks.map((k) => k.company)).size, 'int')],
      tables: [tbl('kpis', i18nKey('KPI 与预算差异'), [col('company', i18nKey('公司'), 'text'), col('metric', i18nKey('指标'), 'text'), col('actual', i18nKey('实际'), 'num'), col('budget', i18nKey('预算'), 'num'), col('diff', i18nKey('差额'), 'num'), col('pct', i18nKey('偏差'), 'pct')], ks)],
      flags: off.map((k) => warn(`off_${k.company}_${k.metric}`, i18nKey('「{p0}」的「{p1}」偏离预算 {p2}'), { p0: k.company, p1: k.metric, p2: pctText(k.pct) })),
      numbers: ks.flatMap((k) => [k.diff]),
    };
  },
};

const SCREENING: CapEngine = {
  run(v) {
    const cs2 = rows(v, 'criteria').map((r) => {
      const ok = cs(r, 'op') === 'lte' ? cn(r, 'actual') <= cn(r, 'threshold') : cn(r, 'actual') >= cn(r, 'threshold');
      return { criterion: cs(r, 'criterion'), op: cs(r, 'op') === 'lte' ? '≤' : '≥', threshold: cn(r, 'threshold'), actual: cn(r, 'actual'), ok };
    });
    const fails = cs2.filter((c) => !c.ok);
    return {
      metrics: [met('passed', i18nKey('满足的标准'), cs2.length - fails.length, 'int'), met('failed', i18nKey('不满足的标准'), fails.length, 'int', fails.length ? 'warn' : 'ok')],
      tables: [tbl('criteria', i18nKey('投资标准逐条检查'), [col('criterion', i18nKey('标准'), 'text'), col('op', i18nKey('比较'), 'text'), col('threshold', i18nKey('门槛'), 'num'), col('actual', i18nKey('实际值'), 'num'), col('ok', i18nKey('结果'), 'text')], cs2.map((c) => ({ ...c, ok: c.ok ? 'TRUE' : 'FALSE' })))],
      flags: fails.map((c) => warn(`fail_${c.criterion}`, i18nKey('不满足投资标准「{p0}」'), { p0: c.criterion })),
    };
  },
};

const VALUE_CREATION: CapEngine = {
  run(v) {
    const base = n(v, 'baseEbitda');
    const bs = rows(v, 'bridge').map((r) => ({ lever: cs(r, 'lever'), impact: cn(r, 'impact'), year: cs(r, 'year') }));
    const target = base + sum(bs.map((b) => b.impact));
    return {
      metrics: [met('base', i18nKey('基期 EBITDA'), base, 'money'), met('target', i18nKey('目标 EBITDA'), target, 'money'), met('uplift', i18nKey('EBITDA 提升幅度'), base ? target / base - 1 : null, 'pct')],
      tables: [tbl('bridge', i18nKey('EBITDA 桥'), [col('lever', i18nKey('举措'), 'text'), col('impact', i18nKey('EBITDA 影响'), 'money'), col('year', L.year, 'text')], [{ lever: k(i18nKey('基期 EBITDA')), impact: base, year: '' }, ...bs, { lever: k(i18nKey('目标 EBITDA')), impact: target, year: '' }])],
      flags: [], numbers: bs.map((b) => b.impact),
    };
  },
};

const SOURCING: CapEngine = {
  run(v) {
    const minR = n(v, 'minRevenue');
    const minG = n(v, 'minGrowth');
    const minM = n(v, 'minMargin');
    const ts = rows(v, 'targets').map((r) => ({ name: cs(r, 'name'), sector: cs(r, 'sector'), revenue: cn(r, 'revenue'), growth: cn(r, 'growth'), margin: cn(r, 'margin') }))
      .map((t) => ({ ...t, pass: t.revenue >= minR && t.growth >= minG && t.margin >= minM }))
      .sort((a, b) => Number(b.pass) - Number(a.pass) || b.growth - a.growth);
    return {
      metrics: [met('count', i18nKey('候选标的'), ts.length, 'int'), met('passed', i18nKey('符合投资标准'), ts.filter((t) => t.pass).length, 'int')],
      tables: [tbl('targets', i18nKey('标的筛选'), [col('name', i18nKey('标的'), 'text'), col('sector', i18nKey('行业'), 'text'), col('revenue', i18nKey('收入'), 'money'), col('growth', i18nKey('增长率'), 'pct'), col('margin', i18nKey('EBITDA 利润率'), 'pct'), col('pass', i18nKey('结果'), 'text')], ts.map((t) => ({ ...t, pass: t.pass ? 'TRUE' : 'FALSE' })))],
      flags: [],
    };
  },
};

export function aiPriority(value: number, feasibility: number, data: number): number {
  return 0.5 * value + 0.3 * feasibility + 0.2 * data;
}
const AI_READY: CapEngine = {
  run(v) {
    const us = rows(v, 'useCases').map((r) => ({ name: cs(r, 'name'), value: cn(r, 'value'), feasibility: cn(r, 'feasibility'), data: cn(r, 'data') }))
      .map((u) => ({ ...u, score: aiPriority(u.value, u.feasibility, u.data), quickWin: u.value >= 4 && u.feasibility >= 4 })).sort((a, b) => b.score - a.score);
    return {
      metrics: [met('count', i18nKey('AI 机会'), us.length, 'int'), met('quickWins', i18nKey('速赢项'), us.filter((u) => u.quickWin).length, 'int')],
      tables: [tbl('useCases', i18nKey('AI 机会排序'), [col('rank', L.rank, 'int'), col('name', i18nKey('机会'), 'text'), col('value', i18nKey('价值'), 'num'), col('feasibility', i18nKey('可行性'), 'num'), col('data', i18nKey('数据就绪度'), 'num'), col('score', L.score, 'num'), col('quickWin', i18nKey('速赢'), 'text')],
        us.map((u, i) => ({ rank: i + 1, ...u, quickWin: u.quickWin ? 'TRUE' : '' })))],
      flags: [], numbers: us.map((u) => u.score),
    };
  },
};

export const PE_ENGINES: Record<string, CapEngine> = {
  returns: RETURNS, unit_economics: UNIT_ECON, waterfall: WATERFALL, portfolio: PORTFOLIO, screening: SCREENING,
  ic_memo: docOnly, value_creation: VALUE_CREATION, sourcing: SOURCING, ai_readiness: AI_READY,
};
export type { CapOut };
