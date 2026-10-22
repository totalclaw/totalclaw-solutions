/**
 * 流程时效监控 —— 纯计算。
 *
 * 输入是标准化后的流程行（FlowRow）和节点行（NodeRow），外加规则表（defaultRules.json 的结构）。
 * 输出端到端用时与判定、个人审核用时与判定、合规率 / 平均用时 / 排名、在途与逾期标签、
 * 环比与异常流程类型、节点分析。所有数字都在这里算，报告和邮件只引用这里的结果。
 */

import { t as i18nT } from '@totalclaw/i18n';

export type SystemName = 'OA' | '费控' | 'CSS';
export type FlowStatus = 'done' | 'running' | 'terminated';

export interface FlowRow {
  system: SystemName;
  flowNo: string;
  /** 报表里的流程名 / 事务类型原文 */
  flowName: string;
  /** CSS 特殊费用核销的费用类型（返厂核销 / 不返厂核销 / 安装维修费用核销） */
  feeType?: string;
  title?: string;
  initiator: string;
  dept?: string;
  status: FlowStatus;
  startAt: number;
  endAt?: number;
  amount?: number;
  currentNode?: string;
  currentHandler?: string;
}

export interface NodeRow {
  system: SystemName;
  flowNo: string;
  flowName: string;
  feeType?: string;
  node: string;
  handler: string;
  startAt: number;
  endAt?: number;
}

export interface E2eRule {
  category: string;
  flowType: string;
  system: string;
  limitDays: number | null;
  variants?: Array<{ keyword: string; limitDays: number }>;
  fallback?: boolean;
}
export interface CssNodeRule { flowType: string; feeType: string; node: string; internal: boolean; limitWorkdays: number | null; note?: string }
export interface PersonalRule { identity: string; category: string; flowType: string; platform: string; amount: 'le10w' | 'gt10w' | 'any'; importance: string; limitDays: number | null }

export interface SlaRules {
  version: string;
  e2e: E2eRule[];
  cssNodes: CssNodeRule[];
  /** [流程名, 环节名称, 是否内部] */
  oaFkNodes: Array<[string, string, boolean]>;
  personal: PersonalRule[];
  managers: string[];
  amountThreshold: number;
  riskRatio: number;
  abnormal: { avgIncreaseDays: number; minComplianceRate: number };
  followUp: { internalDays: number; externalDays: number };
  improveRemindDays: number;
}

export interface CalcOptions {
  /** 运算时刻（毫秒），在途时长算到这一刻 */
  now: number;
  /** 统计周期 [periodStart, periodEnd) */
  periodStart: number;
  periodEnd: number;
  /** 法定节假日（工作日里放假的日期）YYYY-MM-DD */
  holidays?: string[];
  /** 调休上班的周末 YYYY-MM-DD */
  extraWorkdays?: string[];
  /** 本中心花名册姓名；给了就只对名单内的人做个人排名 */
  roster?: string[];
  /** 花名册里的部门，用于排名筛选 */
  rosterDept?: Record<string, string>;
  /** OA / 费控里没有登记内外部属性的节点怎么处理：exclude 不计入并列出；internal 按内部计 */
  unknownNodePolicy?: 'exclude' | 'internal';
}

export const DAY = 86_400_000;

function r2(n: number): number { return Math.round(n * 100) / 100; }
function rate(ok: number, total: number): number | null { return total > 0 ? Math.round((ok / total) * 10000) / 10000 : null; }

/** 名称归一：去空白、统一括号和连接号，方便跨系统对流程名 */
export function norm(s: unknown): string {
  return String(s ?? '')
    .replace(/\s+/g, '')
    .replace(/[（]/g, '(').replace(/[）]/g, ')')
    .replace(/[—–－_]/g, '-')
    .replace(/[，]/g, ',').replace(/[：]/g, ':')
    .toLowerCase();
}

const SUFFIX = /(申请报告|申请流程|报单|申请|报告|流程|单|表)$/;
function core(s: string): string {
  let out = norm(s);
  for (let i = 0; i < 2; i += 1) out = out.replace(SUFFIX, '');
  return out;
}

/** 两个流程名的相似分：3 完全相同，2 互相包含，1 去掉「申请 / 流程 / 单」等后缀后相同或包含，0 不相关 */
export function similar(a: string, b: string): number {
  const x = norm(a); const y = norm(b);
  if (!x || !y) return 0;
  if (x === y) return 3;
  if (x.includes(y) || y.includes(x)) return 2;
  const cx = core(a); const cy = core(b);
  if (cx.length >= 3 && cy.length >= 3 && (cx === cy || cx.includes(cy) || cy.includes(cx))) return 1;
  return 0;
}

function ruleNames(name: string): string[] {
  const parts = name.split('/').map((p) => p.trim()).filter(Boolean);
  return parts.length > 1 && parts.every((p) => p.length >= 6) ? [name, ...parts] : [name];
}

function systemMatches(ruleSystem: string, system: SystemName): boolean {
  return ruleSystem.split('/').map((p) => p.trim().toUpperCase()).includes(system.toUpperCase());
}

export interface ResolvedType { category: string; flowType: string; limitDays: number | null; matched: boolean }

/** 把报表里的流程名对到端到端规则表的细类；对不上的 OA / 费控流程归「常规流程」，CSS 归未识别 */
export function resolveFlowType(rules: SlaRules, flow: Pick<FlowRow, 'system' | 'flowName' | 'feeType' | 'title'>): ResolvedType {
  const composed = flow.feeType ? `${flow.flowName}-${flow.feeType}` : flow.flowName;
  let best: E2eRule | null = null;
  let bestScore = 0;
  for (const rule of rules.e2e) {
    if (rule.fallback || !systemMatches(rule.system, flow.system)) continue;
    let score = 0;
    for (const n of ruleNames(rule.flowType)) {
      score = Math.max(score, similar(n, composed), flow.feeType ? 0 : similar(n, flow.flowName));
    }
    // 带费用类型的规则（特殊费用核销-返厂核销）必须费用类型也对得上
    if (score > 0 && flow.feeType && !norm(rule.flowType).includes(norm(flow.feeType)) && norm(rule.flowType).includes(norm(flow.flowName))) score = 0;
    if (score > bestScore || (score === bestScore && score > 0 && best && rule.flowType.length > best.flowType.length)) {
      best = rule; bestScore = score;
    }
  }
  if (best) {
    let limit = best.limitDays;
    if (best.variants?.length) {
      // 流程名本身同时带「备用商」「服务商」，只能看标题；标题里同时出现或都没出现时取最宽的要求，避免误判超时
      const hits = best.variants.filter((v) => (flow.title ?? '').includes(v.keyword));
      limit = hits.length === 1 ? hits[0].limitDays : Math.max(...best.variants.map((v) => v.limitDays));
    }
    return { category: best.category, flowType: best.flowType, limitDays: limit, matched: true };
  }
  if (flow.system === 'CSS') return { category: '未识别', flowType: flow.flowName, limitDays: null, matched: false };
  const fb = rules.e2e.find((r) => r.fallback);
  return { category: fb?.category ?? '常规流程', flowType: flow.flowName, limitDays: null, matched: false };
}

// —— 工作日 ——

function dayKey(t: number): string {
  const d = new Date(t);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function isWorkday(t: number, holidays: Set<string>, extra: Set<string>): boolean {
  const key = dayKey(t);
  if (extra.has(key)) return true;
  if (holidays.has(key)) return false;
  const wd = new Date(t).getDay();
  return wd !== 0 && wd !== 6;
}

/** a 到 b 之间的工作日数（按 24 小时折算，可带小数），周末和节假日不计 */
export function workdaysBetween(a: number, b: number, holidays: Set<string>, extra: Set<string>): number {
  if (!(b > a)) return 0;
  let total = 0;
  const first = new Date(a); first.setHours(0, 0, 0, 0);
  for (let day = first.getTime(); day < b; ) {
    const next = new Date(day); next.setDate(next.getDate() + 1);
    const dayEnd = next.getTime();
    if (isWorkday(day, holidays, extra)) {
      const overlap = Math.min(b, dayEnd) - Math.max(a, day);
      if (overlap > 0) total += overlap / (dayEnd - day);
    }
    day = dayEnd;
  }
  return total;
}

// —— 节点属性 ——

interface NodeAttr { known: boolean; internal: boolean; limitWorkdays: number | null }

function buildNodeLookup(rules: SlaRules) {
  const oaFk = new Map<string, Map<string, boolean>>();
  for (const [flow, node, internal] of rules.oaFkNodes) {
    const k = norm(flow);
    const m = oaFk.get(k) ?? new Map<string, boolean>();
    m.set(norm(node), internal);
    oaFk.set(k, m);
  }
  const oaFkNames = [...new Set(rules.oaFkNodes.map((r) => r[0]))];
  const nameCache = new Map<string, string | null>();
  const resolveOaFkFlow = (flowName: string): string | null => {
    const k = norm(flowName);
    if (nameCache.has(k)) return nameCache.get(k)!;
    let hit: string | null = oaFk.has(k) ? k : null;
    if (!hit) {
      let bestScore = 0;
      for (const n of oaFkNames) {
        const sc = similar(n, flowName);
        if (sc > bestScore) { bestScore = sc; hit = norm(n); }
      }
    }
    nameCache.set(k, hit);
    return hit;
  };
  const css = (flowName: string, feeType: string | undefined, node: string): NodeAttr => {
    const cands = rules.cssNodes.filter((r) => similar(r.flowType, flowName) > 0
      && (!r.feeType || !feeType || norm(r.feeType) === norm(feeType) || norm(r.feeType).includes(norm(feeType)) || norm(feeType).includes(norm(r.feeType))));
    const n = norm(node);
    const hit = cands.find((r) => norm(r.node) === n) ?? cands.find((r) => norm(r.node).includes(n) || n.includes(norm(r.node)));
    return hit ? { known: true, internal: hit.internal, limitWorkdays: hit.limitWorkdays } : { known: false, internal: false, limitWorkdays: null };
  };
  const oaOrFk = (flowName: string, node: string): NodeAttr => {
    const fk = resolveOaFkFlow(flowName);
    const m = fk ? oaFk.get(fk) : undefined;
    const v = m?.get(norm(node));
    if (v !== undefined) return { known: true, internal: v, limitWorkdays: null };
    // 「起草节点」在所有流程里都是外部
    if (norm(node).includes('起草')) return { known: true, internal: false, limitWorkdays: null };
    return { known: false, internal: false, limitWorkdays: null };
  };
  return { css, oaOrFk };
}

// —— 结果结构 ——

export type RunningLabel = 'overdue' | 'risk' | 'normal' | 'no_limit';

export interface FlowResult {
  system: SystemName;
  flowNo: string;
  flowName: string;
  title: string;
  category: string;
  flowType: string;
  typeMatched: boolean;
  initiator: string;
  dept: string;
  status: FlowStatus;
  startAt: number;
  endAt: number | null;
  /** 端到端用时（天）。已办结为实际用时，在途为截至运算时刻的在途时长 */
  days: number;
  limitDays: number | null;
  /** 已办结：是否超时；无时效要求为 null */
  overtime: boolean | null;
  /** 在途标签 */
  runningLabel: RunningLabel | null;
  overdueDays: number;
  currentNode: string;
  currentHandler: string;
  /** 当前节点停留时长（天） */
  currentNodeDays: number | null;
  /** CSS 没有节点明细时，用结束减开始近似，标记出来 */
  approx: boolean;
  inPeriod: boolean;
}

export interface ReviewResult {
  system: SystemName;
  flowNo: string;
  flowName: string;
  flowType: string;
  category: string;
  node: string;
  handler: string;
  identity: '管理干部' | '非管理干部';
  dept: string;
  startAt: number;
  endAt: number;
  /** OA / 费控为自然日，CSS 为工作日 */
  days: number;
  unit: '天' | '工作日';
  limit: number;
  compliant: boolean;
}

export interface TypeStat {
  category: string;
  flowType: string;
  system: string;
  doneCount: number;
  avgDays: number | null;
  limitDays: number | null;
  judged: number;
  overtime: number;
  complianceRate: number | null;
  runningCount: number;
  runningOverdue: number;
  runningOverdueRate: number | null;
}

export interface PersonStat { name: string; identity: string; dept: string; count: number; compliant: number; rate: number | null; avgDays: number | null; rank: number }

export interface SlaResult {
  flows: FlowResult[];
  reviews: ReviewResult[];
  byType: TypeStat[];
  byCategory: TypeStat[];
  overall: { doneCount: number; avgDays: number | null; judged: number; overtime: number; complianceRate: number | null; runningCount: number; runningOverdue: number; runningRisk: number; reviewCount: number; reviewCompliant: number; reviewRate: number | null };
  reviewerRank: PersonStat[];
  initiatorRank: PersonStat[];
  runningByInitiator: Array<{ name: string; count: number; overdue: number; risk: number }>;
  /** 对不上规则表的流程名（按出现次数） */
  unmatchedTypes: Array<{ system: SystemName; flowName: string; count: number }>;
  /** 没有登记内外部属性的节点 */
  unknownNodes: Array<{ system: SystemName; flowName: string; node: string; count: number }>;
  /** 不在花名册里的审核人（没计入个人排名） */
  outOfRoster: string[];
}

export function computeSla(flows: FlowRow[], nodes: NodeRow[], rules: SlaRules, opt: CalcOptions): SlaResult {
  const holidays = new Set(opt.holidays ?? []);
  const extra = new Set(opt.extraWorkdays ?? []);
  const lookup = buildNodeLookup(rules);
  const policy = opt.unknownNodePolicy ?? 'exclude';
  const roster = opt.roster?.length ? new Set(opt.roster.map((n) => n.trim())) : null;
  const managers = new Set(rules.managers.map((n) => n.trim()));
  const deptOf = (name: string, fallback = ''): string => opt.rosterDept?.[name] ?? fallback;

  const nodesByFlow = new Map<string, NodeRow[]>();
  for (const n of nodes) {
    const k = `${n.system}|${n.flowNo}`;
    nodesByFlow.set(k, [...(nodesByFlow.get(k) ?? []), n]);
  }
  for (const list of nodesByFlow.values()) list.sort((a, b) => a.startAt - b.startAt);

  const unknownNodeCount = new Map<string, { system: SystemName; flowName: string; node: string; count: number }>();
  const noteUnknown = (system: SystemName, flowName: string, node: string) => {
    const k = `${system}|${norm(flowName)}|${norm(node)}`;
    const cur = unknownNodeCount.get(k) ?? { system, flowName, node, count: 0 };
    cur.count += 1; unknownNodeCount.set(k, cur);
  };
  const attrOf = (system: SystemName, flowName: string, feeType: string | undefined, node: string): NodeAttr => {
    const a = system === 'CSS' ? lookup.css(flowName, feeType, node) : lookup.oaOrFk(flowName, node);
    if (a.known) return a;
    return { known: false, internal: policy === 'internal', limitWorkdays: null };
  };

  // —— 端到端 ——
  const seen = new Set<string>();
  const flowResults: FlowResult[] = [];
  const typeOfFlow = new Map<string, ResolvedType>();
  const flowByKey = new Map<string, FlowRow>();
  const unmatched = new Map<string, { system: SystemName; flowName: string; count: number }>();

  for (const f of flows) {
    const key = `${f.system}|${f.flowNo}`;
    if (!f.flowNo || seen.has(key)) continue; // 单号去重
    seen.add(key);
    flowByKey.set(key, f);
    const type = resolveFlowType(rules, f);
    typeOfFlow.set(key, type);
    if (!type.matched) {
      const uk = `${f.system}|${norm(f.flowName)}`;
      const cur = unmatched.get(uk) ?? { system: f.system, flowName: f.flowName, count: 0 };
      cur.count += 1; unmatched.set(uk, cur);
    }
    if (f.status === 'terminated') continue;
    const list = nodesByFlow.get(key) ?? [];
    const endForCalc = f.status === 'done' ? (f.endAt ?? opt.now) : opt.now;
    let days: number;
    let approx = false;
    if (f.system === 'CSS') {
      if (!list.length) {
        days = (endForCalc - f.startAt) / DAY; approx = true;
      } else if (similar('退换货申请', f.flowName) >= 2) {
        // 退换货申请：只算末次审核
        const last = list[list.length - 1];
        days = ((last.endAt ?? endForCalc) - last.startAt) / DAY;
      } else {
        days = 0;
        for (const n of list) {
          const a = attrOf('CSS', f.flowName, f.feeType, n.node);
          if (!a.internal) continue;
          days += Math.max(0, ((n.endAt ?? endForCalc) - n.startAt)) / DAY;
        }
      }
    } else {
      days = (endForCalc - f.startAt) / DAY;
    }
    days = Math.max(0, days);

    const running = f.status === 'running';
    const cur = running ? [...list].reverse().find((n) => !n.endAt) : undefined;
    const currentNode = f.currentNode || cur?.node || '';
    const currentHandler = f.currentHandler || cur?.handler || '';
    const currentNodeDays = running && cur ? r2((opt.now - cur.startAt) / DAY) : null;

    let overtime: boolean | null = null;
    let runningLabel: RunningLabel | null = null;
    let overdueDays = 0;
    if (type.limitDays !== null) {
      if (running) {
        runningLabel = days > type.limitDays ? 'overdue' : days > type.limitDays * rules.riskRatio ? 'risk' : 'normal';
      } else {
        overtime = days > type.limitDays + 1e-9;
      }
      overdueDays = Math.max(0, r2(days - type.limitDays));
    } else if (running) {
      runningLabel = 'no_limit';
    }
    const inPeriod = f.status === 'done'
      ? (f.endAt ?? 0) >= opt.periodStart && (f.endAt ?? 0) < opt.periodEnd
      : true;
    flowResults.push({
      system: f.system, flowNo: f.flowNo, flowName: f.flowName, title: f.title ?? '',
      category: type.category, flowType: type.flowType, typeMatched: type.matched,
      initiator: f.initiator, dept: f.dept || deptOf(f.initiator),
      status: f.status, startAt: f.startAt, endAt: f.endAt ?? null,
      days: r2(days), limitDays: type.limitDays, overtime, runningLabel, overdueDays,
      currentNode, currentHandler, currentNodeDays, approx, inPeriod,
    });
  }

  // —— 个人审核 ——
  const reviews: ReviewResult[] = [];
  const outOfRoster = new Set<string>();
  for (const n of nodes) {
    if (!n.endAt || !n.handler?.trim()) continue;
    if (n.endAt < opt.periodStart || n.endAt >= opt.periodEnd) continue;
    const key = `${n.system}|${n.flowNo}`;
    const flow = flowByKey.get(key);
    const type = typeOfFlow.get(key) ?? resolveFlowType(rules, { system: n.system, flowName: n.flowName, feeType: n.feeType });
    const a = attrOf(n.system, n.flowName, n.feeType ?? flow?.feeType, n.node);
    if (!a.known) noteUnknown(n.system, n.flowName, n.node);
    if (!a.internal) continue;
    const handler = n.handler.trim();
    const identity: '管理干部' | '非管理干部' = managers.has(handler) ? '管理干部' : '非管理干部';
    let limit: number | null;
    let days: number;
    let unit: '天' | '工作日';
    if (n.system === 'CSS') {
      limit = a.limitWorkdays;
      days = workdaysBetween(n.startAt, n.endAt, holidays, extra);
      unit = '工作日';
    } else {
      limit = personalLimit(rules, identity, type, flow?.amount);
      days = (n.endAt - n.startAt) / DAY;
      unit = '天';
    }
    if (limit === null) continue; // 没有时效要求的节点不统计
    if (roster && !roster.has(handler)) { outOfRoster.add(handler); continue; }
    reviews.push({
      system: n.system, flowNo: n.flowNo, flowName: n.flowName, flowType: type.flowType, category: type.category,
      node: n.node, handler, identity, dept: deptOf(handler),
      startAt: n.startAt, endAt: n.endAt, days: r2(Math.max(0, days)), unit, limit,
      compliant: days <= limit + 1e-9,
    });
  }

  // —— 汇总 ——
  const done = flowResults.filter((f) => f.status === 'done' && f.inPeriod);
  const running = flowResults.filter((f) => f.status === 'running');
  const group = (keyOf: (f: FlowResult) => string, labelOf: (f: FlowResult) => Pick<TypeStat, 'category' | 'flowType' | 'system'>): TypeStat[] => {
    const m = new Map<string, { label: Pick<TypeStat, 'category' | 'flowType' | 'system'>; done: FlowResult[]; running: FlowResult[] }>();
    for (const f of [...done, ...running]) {
      const k = keyOf(f);
      const cur = m.get(k) ?? { label: labelOf(f), done: [], running: [] };
      (f.status === 'done' ? cur.done : cur.running).push(f);
      m.set(k, cur);
    }
    return [...m.values()].map(({ label, done: d, running: rn }) => {
      const judged = d.filter((f) => f.overtime !== null);
      const over = judged.filter((f) => f.overtime).length;
      const rj = rn.filter((f) => f.runningLabel !== 'no_limit');
      const ro = rn.filter((f) => f.runningLabel === 'overdue').length;
      const limits = [...new Set([...d, ...rn].map((f) => f.limitDays))];
      return {
        ...label,
        doneCount: d.length,
        avgDays: d.length ? r2(d.reduce((s, f) => s + f.days, 0) / d.length) : null,
        limitDays: limits.length === 1 ? limits[0] : null,
        judged: judged.length,
        overtime: over,
        complianceRate: rate(judged.length - over, judged.length),
        runningCount: rn.length,
        runningOverdue: ro,
        runningOverdueRate: rate(ro, rj.length),
      };
    });
  };
  const byType = group((f) => `${f.category}|${f.flowType}|${f.system}`, (f) => ({ category: f.category, flowType: f.flowType, system: f.system }))
    .sort((a, b) => a.category.localeCompare(b.category, 'zh') || b.doneCount - a.doneCount);
  const byCategory = group((f) => f.category, (f) => ({ category: f.category, flowType: '', system: '' }))
    .map((c) => {
      // 大类平均用时 = 各细类平均用时的平均值（看板指标口径）
      const subs = byType.filter((t) => t.category === c.category && t.avgDays !== null);
      return { ...c, avgDays: subs.length ? r2(subs.reduce((s, t) => s + (t.avgDays as number), 0) / subs.length) : null };
    })
    .sort((a, b) => a.category.localeCompare(b.category, 'zh'));

  const rankPeople = (rows: Array<{ name: string; identity: string; dept: string; ok: boolean; days: number }>): PersonStat[] => {
    const m = new Map<string, { identity: string; dept: string; count: number; ok: number; days: number }>();
    for (const r of rows) {
      const cur = m.get(r.name) ?? { identity: r.identity, dept: r.dept, count: 0, ok: 0, days: 0 };
      cur.count += 1; cur.ok += r.ok ? 1 : 0; cur.days += r.days;
      m.set(r.name, cur);
    }
    const list = [...m.entries()].map(([name, v]) => ({
      name, identity: v.identity, dept: v.dept, count: v.count, compliant: v.ok,
      rate: rate(v.ok, v.count), avgDays: v.count ? r2(v.days / v.count) : null, rank: 0,
    })).sort((a, b) => (b.rate ?? -1) - (a.rate ?? -1) || b.count - a.count || a.name.localeCompare(b.name, 'zh'));
    let lastRate: number | null = null; let lastRank = 0;
    list.forEach((p, i) => {
      if (p.rate !== lastRate) { lastRank = i + 1; lastRate = p.rate; }
      p.rank = lastRank;
    });
    return list;
  };
  const reviewerRank = rankPeople(reviews.map((r) => ({ name: r.handler, identity: r.identity, dept: r.dept, ok: r.compliant, days: r.days })));
  const initiatorRank = rankPeople(done.filter((f) => f.overtime !== null && f.initiator)
    .map((f) => ({ name: f.initiator, identity: managers.has(f.initiator) ? '管理干部' : '非管理干部', dept: f.dept, ok: !f.overtime, days: f.days })));

  const runInit = new Map<string, { count: number; overdue: number; risk: number }>();
  const unfilled = i18nT('（未填）');
  for (const f of running) {
    const cur = runInit.get(f.initiator || unfilled) ?? { count: 0, overdue: 0, risk: 0 };
    cur.count += 1; if (f.runningLabel === 'overdue') cur.overdue += 1; if (f.runningLabel === 'risk') cur.risk += 1;
    runInit.set(f.initiator || unfilled, cur);
  }

  const judgedAll = done.filter((f) => f.overtime !== null);
  const overAll = judgedAll.filter((f) => f.overtime).length;
  const okReviews = reviews.filter((r) => r.compliant).length;
  return {
    flows: flowResults,
    reviews,
    byType,
    byCategory,
    overall: {
      doneCount: done.length,
      avgDays: done.length ? r2(done.reduce((s, f) => s + f.days, 0) / done.length) : null,
      judged: judgedAll.length,
      overtime: overAll,
      complianceRate: rate(judgedAll.length - overAll, judgedAll.length),
      runningCount: running.length,
      runningOverdue: running.filter((f) => f.runningLabel === 'overdue').length,
      runningRisk: running.filter((f) => f.runningLabel === 'risk').length,
      reviewCount: reviews.length,
      reviewCompliant: okReviews,
      reviewRate: rate(okReviews, reviews.length),
    },
    reviewerRank,
    initiatorRank,
    runningByInitiator: [...runInit.entries()].map(([name, v]) => ({ name, ...v })).sort((a, b) => b.overdue - a.overdue || b.count - a.count),
    unmatchedTypes: [...unmatched.values()].sort((a, b) => b.count - a.count),
    unknownNodes: [...unknownNodeCount.values()].sort((a, b) => b.count - a.count),
    outOfRoster: [...outOfRoster].sort((a, b) => a.localeCompare(b, 'zh')),
  };
}

/** OA / 费控个人节点时效要求：管理干部按流程细类和金额，对不上的按常规流程；非管理干部统一要求 */
export function personalLimit(rules: SlaRules, identity: '管理干部' | '非管理干部', type: ResolvedType, amount?: number): number | null {
  const mine = rules.personal.filter((p) => p.identity === identity);
  if (identity === '非管理干部') {
    const hit = mine.find((p) => p.category === type.category) ?? mine[0];
    return hit?.limitDays ?? null;
  }
  const band: 'le10w' | 'gt10w' = (amount ?? 0) > rules.amountThreshold ? 'gt10w' : 'le10w';
  const cands = type.matched ? mine.filter((p) => norm(p.flowType) === norm(type.flowType) || similar(p.flowType, type.flowType) >= 2) : [];
  const hit = cands.find((p) => p.amount === band) ?? cands.find((p) => p.amount === 'any') ?? cands[0];
  if (hit) return hit.limitDays;
  return mine.find((p) => p.category === '常规流程')?.limitDays ?? null;
}

// —— 环比与异常 ——

export interface PeriodSnapshot {
  label: string;
  periodStart: number;
  periodEnd: number;
  overall: SlaResult['overall'];
  byType: Array<Pick<TypeStat, 'category' | 'flowType' | 'system' | 'doneCount' | 'avgDays' | 'complianceRate'>>;
}

export function toSnapshot(label: string, opt: Pick<CalcOptions, 'periodStart' | 'periodEnd'>, res: SlaResult): PeriodSnapshot {
  return {
    label, periodStart: opt.periodStart, periodEnd: opt.periodEnd, overall: res.overall,
    byType: res.byType.map((t) => ({ category: t.category, flowType: t.flowType, system: t.system, doneCount: t.doneCount, avgDays: t.avgDays, complianceRate: t.complianceRate })),
  };
}

export interface TypeCompare {
  category: string;
  flowType: string;
  system: string;
  doneCount: number;
  avgDays: number | null;
  prevAvgDays: number | null;
  avgDelta: number | null;
  complianceRate: number | null;
  prevComplianceRate: number | null;
  rateDelta: number | null;
  abnormal: boolean;
  reasons: string[];
}

/**
 * 与上一周期对比并标记异常流程类型：
 * 平均用时环比增加超过 avgIncreaseDays 天，或合规率低于 minComplianceRate。
 */
export function compareWithPrevious(cur: SlaResult, prev: PeriodSnapshot | null, rules: SlaRules): TypeCompare[] {
  const prevBy = new Map((prev?.byType ?? []).map((t) => [`${t.category}|${t.flowType}|${t.system}`, t]));
  return cur.byType.filter((t) => t.doneCount > 0).map((t) => {
    const p = prevBy.get(`${t.category}|${t.flowType}|${t.system}`);
    const avgDelta = t.avgDays !== null && p?.avgDays != null ? r2(t.avgDays - p.avgDays) : null;
    const rateDelta = t.complianceRate !== null && p?.complianceRate != null ? Math.round((t.complianceRate - p.complianceRate) * 10000) / 10000 : null;
    const reasons: string[] = [];
    if (avgDelta !== null && avgDelta > rules.abnormal.avgIncreaseDays) reasons.push(i18nT('平均用时环比增加 {delta} 天，超过 {limit} 天', { delta: avgDelta, limit: rules.abnormal.avgIncreaseDays }));
    if (t.complianceRate !== null && t.complianceRate < rules.abnormal.minComplianceRate) reasons.push(i18nT('合规率 {rate}%，低于 {min}%', { rate: (t.complianceRate * 100).toFixed(1), min: (rules.abnormal.minComplianceRate * 100).toFixed(0) }));
    return {
      category: t.category, flowType: t.flowType, system: t.system, doneCount: t.doneCount,
      avgDays: t.avgDays, prevAvgDays: p?.avgDays ?? null, avgDelta,
      complianceRate: t.complianceRate, prevComplianceRate: p?.complianceRate ?? null, rateDelta,
      abnormal: reasons.length > 0, reasons,
    };
  }).sort((a, b) => Number(b.abnormal) - Number(a.abnormal) || (a.complianceRate ?? 1) - (b.complianceRate ?? 1));
}

// —— 节点分析 ——

export interface NodeStat {
  node: string;
  internal: boolean | null;
  count: number;
  /** 节点耗时：结束 − 开始（天） */
  avgDays: number;
  maxDays: number;
  /** 等待时长：本节点开始 − 上一节点结束（天） */
  avgWaitDays: number;
  /** 占该流程类型节点总耗时的比例 */
  share: number;
  /** 在途流程停在这个节点的数量与平均停留时长 */
  stuckCount: number;
  avgStuckDays: number | null;
}

export interface NodeAnalysis { flowType: string; system: string; nodes: NodeStat[]; longestNode: string }

/** 对指定流程类型展开节点分析，定位耗时最长的节点 */
export function analyzeNodes(flowType: string, system: string, res: SlaResult, nodes: NodeRow[], rules: SlaRules, opt: CalcOptions): NodeAnalysis {
  const lookup = buildNodeLookup(rules);
  const flowsOfType = res.flows.filter((f) => f.flowType === flowType && f.system === system && (f.status === 'running' || f.inPeriod));
  const keys = new Set(flowsOfType.map((f) => `${f.system}|${f.flowNo}`));
  const byFlow = new Map<string, NodeRow[]>();
  for (const n of nodes) {
    const k = `${n.system}|${n.flowNo}`;
    if (!keys.has(k)) continue;
    byFlow.set(k, [...(byFlow.get(k) ?? []), n]);
  }
  const acc = new Map<string, { node: string; internal: boolean | null; durs: number[]; waits: number[]; stuck: number[] }>();
  for (const list of byFlow.values()) {
    list.sort((a, b) => a.startAt - b.startAt);
    list.forEach((n, i) => {
      const k = norm(n.node);
      const a = n.system === 'CSS' ? lookup.css(n.flowName, n.feeType, n.node) : lookup.oaOrFk(n.flowName, n.node);
      const cur = acc.get(k) ?? { node: n.node, internal: a.known ? a.internal : null, durs: [], waits: [], stuck: [] };
      if (n.endAt) cur.durs.push(Math.max(0, n.endAt - n.startAt) / DAY);
      else cur.stuck.push(Math.max(0, opt.now - n.startAt) / DAY);
      const prev = list[i - 1];
      if (prev?.endAt) cur.waits.push(Math.max(0, n.startAt - prev.endAt) / DAY);
      acc.set(k, cur);
    });
  }
  const total = [...acc.values()].reduce((s, v) => s + v.durs.reduce((a, b) => a + b, 0), 0);
  const stats: NodeStat[] = [...acc.values()].map((v) => {
    const sum = v.durs.reduce((a, b) => a + b, 0);
    return {
      node: v.node, internal: v.internal, count: v.durs.length,
      avgDays: v.durs.length ? r2(sum / v.durs.length) : 0,
      maxDays: v.durs.length ? r2(Math.max(...v.durs)) : 0,
      avgWaitDays: v.waits.length ? r2(v.waits.reduce((a, b) => a + b, 0) / v.waits.length) : 0,
      share: total > 0 ? Math.round((sum / total) * 10000) / 10000 : 0,
      stuckCount: v.stuck.length,
      avgStuckDays: v.stuck.length ? r2(v.stuck.reduce((a, b) => a + b, 0) / v.stuck.length) : null,
    };
  }).sort((a, b) => b.avgDays - a.avgDays);
  return { flowType, system, nodes: stats, longestNode: stats[0]?.node ?? '' };
}

// —— 在途跟进 ——

/** 异常在途流程的跟进频次：外部流转型按 externalDays，其余按 internalDays */
export function followUpIntervalDays(category: string, rules: SlaRules): number {
  return category.includes('外部') ? rules.followUp.externalDays : rules.followUp.internalDays;
}

/** 本年度发起、仍未办结且已超时的在途流程 */
export function yearOverdueRunning(res: SlaResult, now: number): FlowResult[] {
  const yearStart = new Date(new Date(now).getFullYear(), 0, 1).getTime();
  return res.flows
    .filter((f) => f.status === 'running' && f.runningLabel === 'overdue' && f.startAt >= yearStart)
    .sort((a, b) => b.overdueDays - a.overdueDays);
}
