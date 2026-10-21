/**
 * 流程时效监控 · 通报内容：周报邮件、月度分析报告（网页，转 PDF）、明细表、规则写的总结与改善建议。
 *
 * 这里只排版，不算数：所有数字都取自 calc.ts 的结果（环比差值是两个已算出的数相减）。
 * 报告里的图是代码画的内联 SVG（转 PDF 的窗口不执行脚本）。
 */
import { t as i18nT } from '@totalclaw/i18n';
import type { FsCase, FsOverallDelta, FsPeriod, FsReasonCategory, FsSuggestion, FsThresholds } from '@totalclaw/ipc-contracts';
import type { OutSheet } from '../serviceSettlement/excel';
import type { FlowResult, NodeAnalysis, PeriodSnapshot, PersonStat, ReviewResult, SlaResult, TypeCompare, TypeStat } from './calc';
import { categoryCounts, categoryLabel, defaultRootCause, guardNumbers } from './reasons';
import { ymd } from './ingest';

export interface ReportContext {
  period: FsPeriod;
  result: SlaResult;
  previous: PeriodSnapshot | null;
  delta: FsOverallDelta;
  compare: TypeCompare[];
  abnormal: Array<TypeCompare & { analysis: NodeAnalysis }>;
  yearOverdue: FlowResult[];
  cases: FsCase[];
  rootCauses: Partial<Record<FsReasonCategory, string>>;
  summary: string;
  suggestions: FsSuggestion[];
  thresholds: FsThresholds;
  /** 历史趋势（同类周期，按时间从早到晚，含本期） */
  trend: Array<{ label: string; complianceRate: number | null; avgDays: number | null }>;
  generatedAt: number;
}

// ── 格式 ─────────────────────────────────────────────

export const fmtRate = (r: number | null | undefined): string => (r == null ? '-' : `${(Math.round(r * 1000) / 10).toFixed(1)}%`);
export const fmtDays = (d: number | null | undefined): string => (d == null ? '-' : String(Math.round(d * 100) / 100));
const signed = (n: number | null, unit = ''): string => (n == null ? '-' : `${n > 0 ? '+' : ''}${Math.round(n * 100) / 100}${unit}`);
const signedRate = (n: number | null): string => (n == null ? '-' : `${n > 0 ? '+' : ''}${(Math.round(n * 1000) / 10).toFixed(1)}`);
const esc = (s: unknown): string => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const kindName = (p: FsPeriod): string => (p.kind === 'monthly' ? i18nT('月度') : i18nT('周度'));
const yesNo = (b: boolean | null): string => (b == null ? '-' : b ? i18nT('是') : i18nT('否'));
const runLabel = (f: FlowResult): string => (f.runningLabel === 'overdue' ? i18nT('已逾期') : f.runningLabel === 'risk' ? i18nT('较大逾期风险') : f.runningLabel === 'no_limit' ? i18nT('无时效要求') : i18nT('正常'));

/** 两个已算出的数相减，只做差，不重新统计 */
export function overallDelta(cur: SlaResult['overall'], prev: SlaResult['overall'] | null | undefined): FsOverallDelta {
  const d = (a: number | null, b: number | null | undefined, digits: number): number | null => {
    if (a == null || b == null) return null;
    const f = 10 ** digits;
    return Math.round((a - b) * f) / f;
  };
  return {
    doneCount: d(cur.doneCount, prev?.doneCount, 0), avgDays: d(cur.avgDays, prev?.avgDays, 2), complianceRate: d(cur.complianceRate, prev?.complianceRate, 4),
    runningCount: d(cur.runningCount, prev?.runningCount, 0), runningOverdue: d(cur.runningOverdue, prev?.runningOverdue, 0), reviewRate: d(cur.reviewRate, prev?.reviewRate, 4),
  };
}

function mostCommon(list: string[]): string {
  const m = new Map<string, number>();
  for (const x of list) if (x) m.set(x, (m.get(x) ?? 0) + 1);
  return [...m.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? '';
}

/** 排名里的后几名：只看审核次数达到 minCount 的人，避免只审过一两次的人垫底 */
export function bottomReviewers(rank: PersonStat[], n: number, minCount = 3): PersonStat[] {
  const pool = rank.filter((p) => p.count >= minCount && p.rate !== null && p.rate < 1);
  return [...pool].sort((a, b) => (a.rate as number) - (b.rate as number) || b.count - a.count).slice(0, n);
}

// ── 规则写的总结与建议 ─────────────────────────────────

/** 给模型的材料，也是规则版总结的素材：每一行都是已经算好的事实 */
export function buildFacts(ctx: ReportContext): string[] {
  const o = ctx.result.overall;
  const facts: string[] = [];
  facts.push(i18nT('统计周期 {p0}：办结 {p1} 单，平均用时 {p2} 天，流程时效合规率 {p3}（参与判定 {p4} 单，超时 {p5} 单）。', { p0: ctx.period.label, p1: o.doneCount, p2: fmtDays(o.avgDays), p3: fmtRate(o.complianceRate), p4: o.judged, p5: o.overtime }));
  facts.push(i18nT('在途 {p0} 单，其中已逾期 {p1} 单、较大逾期风险 {p2} 单。', { p0: o.runningCount, p1: o.runningOverdue, p2: o.runningRisk }));
  facts.push(i18nT('个人审核 {p0} 次，合规 {p1} 次，个人审核合规率 {p2}。', { p0: o.reviewCount, p1: o.reviewCompliant, p2: fmtRate(o.reviewRate) }));
  if (ctx.previous) {
    facts.push(i18nT('与上一周期（{p0}）相比：合规率 {p1} 个百分点，平均用时 {p2} 天，办结量 {p3} 单，在途逾期 {p4} 单。', {
      p0: ctx.previous.label, p1: signedRate(ctx.delta.complianceRate), p2: signed(ctx.delta.avgDays), p3: signed(ctx.delta.doneCount), p4: signed(ctx.delta.runningOverdue),
    }));
  } else {
    facts.push(i18nT('没有上一周期的数据，本期不做环比。'));
  }
  const worse = ctx.compare.filter((t) => (t.avgDelta ?? 0) > 0 || (t.rateDelta ?? 0) < 0).length;
  facts.push(i18nT('异常判定标准：平均用时环比增加超过 {p0} 天，或时效合规率低于 {p1}。本期异常流程类型 {p2} 个，用时或合规率比上一周期变差的流程类型 {p3} 个。', { p0: ctx.thresholds.avgIncreaseDays, p1: fmtRate(ctx.thresholds.minComplianceRate), p2: ctx.abnormal.length, p3: worse }));
  for (const c of ctx.result.byCategory) {
    facts.push(i18nT('{p0}：办结 {p1} 单，平均用时 {p2} 天，合规率 {p3}，在途 {p4} 单（逾期 {p5} 单）。', { p0: c.category, p1: c.doneCount, p2: fmtDays(c.avgDays), p3: fmtRate(c.complianceRate), p4: c.runningCount, p5: c.runningOverdue }));
  }
  for (const a of ctx.abnormal.slice(0, 8)) {
    const top = a.analysis.nodes[0];
    facts.push(i18nT('异常流程类型「{p0}」（{p1}）：办结 {p2} 单，平均用时 {p3} 天，合规率 {p4}；{p5}', { p0: a.flowType, p1: a.system, p2: a.doneCount, p3: fmtDays(a.avgDays), p4: fmtRate(a.complianceRate), p5: a.reasons.join('；') })
      + (top ? i18nT('；耗时最长的节点是「{p0}」，平均 {p1} 天，占该类节点总耗时的 {p2}。', { p0: top.node, p1: fmtDays(top.avgDays), p2: fmtRate(top.share) }) : ''));
  }
  const bottom = bottomReviewers(ctx.result.reviewerRank, 3);
  if (bottom.length) facts.push(i18nT('个人审核合规率靠后：{p0}。', { p0: bottom.map((p) => i18nT('{p0}（{p1}，审核 {p2} 次，合规率 {p3}）', { p0: p.name, p1: p.dept || p.identity, p2: p.count, p3: fmtRate(p.rate) })).join('、') }));
  if (ctx.period.kind === 'monthly') {
    facts.push(i18nT('本年度发起、仍未办结且已超时的在途流程 {p0} 单。', { p0: ctx.yearOverdue.length }));
    for (const f of ctx.yearOverdue.slice(0, 5)) {
      facts.push(i18nT('在途超时：[{p0}] {p1} {p2}，在途 {p3} 天，超时 {p4} 天，当前节点「{p5}」，当前处理人 {p6}。', { p0: f.system, p1: f.flowNo, p2: f.flowType, p3: fmtDays(f.days), p4: fmtDays(f.overdueDays), p5: f.currentNode || '-', p6: f.currentHandler || '-' }));
    }
  }
  const cats = categoryCounts(ctx.cases);
  const collected = ctx.cases.filter((c) => c.reason.trim()).length;
  facts.push(i18nT('需要说明原因的流程 {p0} 单，已收到原因 {p1} 单。', { p0: ctx.cases.length, p1: collected }));
  if (cats.length) facts.push(i18nT('超时原因分布：{p0}。', { p0: cats.map((c) => i18nT('{p0} {p1} 单', { p0: categoryLabel(c.id), p1: c.count })).join('、') }));
  return facts;
}

/** 没有模型时的总结：整体表现 / 异常趋势 / 重点问题 / 责任维度，全部用已算出的数写 */
export function ruleSummary(ctx: ReportContext): string {
  const o = ctx.result.overall;
  const th = ctx.thresholds;
  const parts: string[] = [];
  const target = fmtRate(th.minComplianceRate);
  parts.push(i18nT('【整体表现】{p0}办结流程 {p1} 单，平均用时 {p2} 天，流程时效合规率 {p3}，{p4}目标线 {p5}；个人审核合规率 {p6}。在途流程 {p7} 单，已逾期 {p8} 单，较大逾期风险 {p9} 单。', {
    p0: ctx.period.label, p1: o.doneCount, p2: fmtDays(o.avgDays), p3: fmtRate(o.complianceRate),
    p4: o.complianceRate == null ? '' : o.complianceRate >= th.minComplianceRate ? i18nT('达到') : i18nT('低于'), p5: target,
    p6: fmtRate(o.reviewRate), p7: o.runningCount, p8: o.runningOverdue, p9: o.runningRisk,
  }));
  if (ctx.previous) {
    const worse = ctx.compare.filter((t) => (t.avgDelta ?? 0) > 0 || (t.rateDelta ?? 0) < 0).length;
    parts.push(i18nT('【异常趋势】与 {p0} 相比，合规率变化 {p1} 个百分点，平均用时变化 {p2} 天，在途逾期变化 {p3} 单。{p4} 个流程类型的用时或合规率变差，其中 {p5} 个被判为异常流程类型。', {
      p0: ctx.previous.label, p1: signedRate(ctx.delta.complianceRate), p2: signed(ctx.delta.avgDays), p3: signed(ctx.delta.runningOverdue), p4: worse, p5: ctx.abnormal.length,
    }));
  } else {
    parts.push(i18nT('【异常趋势】没有上一周期的数据，本期不做环比；按合规率低于 {p0} 的标准，有 {p1} 个流程类型被判为异常。', { p0: target, p1: ctx.abnormal.length }));
  }
  if (ctx.abnormal.length) {
    const lines = ctx.abnormal.slice(0, 5).map((a) => {
      const top = a.analysis.nodes[0];
      return i18nT('「{p0}」（{p1}）{p2}', { p0: a.flowType, p1: a.system, p2: a.reasons.join('；') }) + (top ? i18nT('，耗时最长的节点是「{p0}」（平均 {p1} 天）', { p0: top.node, p1: fmtDays(top.avgDays) }) : '');
    });
    parts.push(i18nT('【重点问题】{p0}。', { p0: lines.join('；') }));
  } else {
    parts.push(i18nT('【重点问题】本期没有流程类型被判为异常。'));
  }
  const cats = categoryCounts(ctx.cases);
  const bottom = bottomReviewers(ctx.result.reviewerRank, 3);
  const resp: string[] = [];
  if (cats.length) resp.push(i18nT('已收集的超时原因里，{p0}', { p0: cats.map((c) => i18nT('{p0} {p1} 单', { p0: categoryLabel(c.id), p1: c.count })).join('、') }));
  if (bottom.length) resp.push(i18nT('个人审核合规率靠后的是 {p0}', { p0: bottom.map((p) => `${p.name}（${fmtRate(p.rate)}）`).join('、') }));
  if (ctx.period.kind === 'monthly' && ctx.yearOverdue.length) resp.push(i18nT('本年度仍有 {p0} 单在途流程已超时未办结', { p0: ctx.yearOverdue.length }));
  parts.push(resp.length ? i18nT('【责任维度】{p0}。', { p0: resp.join('；') }) : i18nT('【责任维度】本期没有需要点名的责任问题。'));
  return parts.join('\n\n');
}

/** 没有模型时的改善建议：按原因类别和异常流程类型各出几条，责任部门 / 责任人取出现最多的 */
export function ruleSuggestions(ctx: ReportContext): FsSuggestion[] {
  const deadline = ymd(ctx.period.end + 30 * 86_400_000);
  const out: FsSuggestion[] = [];
  const deptOf = new Map(ctx.result.flows.map((f) => [`${f.system}|${f.flowNo}`, f.dept]));
  for (const c of categoryCounts(ctx.cases).slice(0, 3)) {
    const mine = ctx.cases.filter((x) => x.categoryId === c.id && x.reason.trim());
    const requirement: Record<FsReasonCategory, string> = {
      materials: i18nT('整理本类流程的提交资料清单，发起前自查；退回一次以上的单据由部门负责人复核后再提交'),
      absence: i18nT('审批人出差、休假前在系统里设置代理人；部门内明确每个审批节点的备岗人'),
      cross_dept: i18nT('与相关部门约定会签、确认类节点的答复时限和对接人，超过时限由部门负责人协调'),
      external: i18nT('对外部单位反馈类节点建立催办节奏，超过约定天数升级到区域经理跟进'),
      system: i18nT('核对待办提醒是否开启，整理常见操作问题说明；系统故障当天报给系统顾问'),
      design: i18nT('梳理审批节点，评估可以合并或取消的环节，形成流程优化申请'),
      other: i18nT('逐单复盘原因，形成可执行的改进动作'),
    };
    out.push({
      item: i18nT('减少「{p0}」造成的超时（本期 {p1} 单）', { p0: categoryLabel(c.id), p1: c.count }),
      dept: mostCommon(mine.map((x) => deptOf.get(x.key) || '')), owner: mostCommon(mine.map((x) => x.owner)),
      requirement: requirement[c.id], deadline,
      acceptance: i18nT('下一个统计周期里，这一类原因造成的超时流程数量下降'),
    });
  }
  for (const a of ctx.abnormal.slice(0, 3)) {
    const flows = ctx.result.flows.filter((f) => f.flowType === a.flowType && f.system === a.system);
    const top = a.analysis.nodes[0];
    out.push({
      item: i18nT('「{p0}」时效达标（{p1}）', { p0: a.flowType, p1: a.reasons.join('；') }),
      dept: mostCommon(flows.map((f) => f.dept)), owner: mostCommon(flows.filter((f) => f.overtime || f.runningLabel === 'overdue').map((f) => f.currentHandler || f.initiator)),
      requirement: top ? i18nT('重点压缩「{p0}」节点的停留时间（当前平均 {p1} 天），与业务确认停留原因并给出处理办法', { p0: top.node, p1: fmtDays(top.avgDays) }) : i18nT('复盘本类流程的超时单据，确认原因并给出处理办法'),
      deadline, acceptance: i18nT('该流程类型的时效合规率不低于 {p0}', { p0: fmtRate(ctx.thresholds.minComplianceRate) }),
    });
  }
  return out;
}

/** 收模型写的总结与建议：过数字核对；总结被核掉大半就退回规则版 */
export function acceptModelSummary(json: any, ctx: ReportContext): { summary: string; suggestions: FsSuggestion[]; usedModel: boolean; dropped: number } {
  const source = buildFacts(ctx).join('\n');
  const raw = typeof json?.summary === 'string' ? json.summary : Array.isArray(json?.summary) ? json.summary.join('\n\n') : '';
  const g = guardNumbers(raw.slice(0, 4000), source);
  let dropped = g.dropped;
  const suggestions: FsSuggestion[] = [];
  for (const s of Array.isArray(json?.suggestions) ? json.suggestions.slice(0, 8) : []) {
    const item = guardNumbers(String(s?.item || '').slice(0, 200), source);
    const requirement = guardNumbers(String(s?.requirement || '').slice(0, 300), source);
    const acceptance = guardNumbers(String(s?.acceptance || '').slice(0, 200), source);
    dropped += item.dropped + requirement.dropped + acceptance.dropped;
    if (!item.text || !requirement.text) continue;
    const deadline = /^\d{4}-\d{2}-\d{2}$/.test(String(s?.deadline || '')) ? String(s.deadline) : ymd(ctx.period.end + 30 * 86_400_000);
    suggestions.push({ item: item.text, dept: String(s?.dept || '').slice(0, 40), owner: String(s?.owner || '').slice(0, 40), requirement: requirement.text, deadline, acceptance: acceptance.text });
  }
  const ok = g.text.length >= 40;
  return { summary: ok ? g.text : ruleSummary(ctx), suggestions: suggestions.length ? suggestions : ruleSuggestions(ctx), usedModel: ok, dropped };
}

// ── 内联 SVG 图 ───────────────────────────────────────

export interface BarItem { label: string; value: number | null; text: string; warn?: boolean }

/** 横向条形图 */
export function svgBars(items: BarItem[], opts: { max?: number; width?: number; mark?: { value: number; label: string } } = {}): string {
  const width = opts.width ?? 660;
  const rowH = 24; const left = 210; const right = 70;
  const max = opts.max ?? Math.max(1e-9, ...items.map((i) => i.value ?? 0));
  const inner = width - left - right;
  const h = items.length * rowH + 18;
  const rows = items.map((it, i) => {
    const w = it.value == null ? 0 : Math.max(0, Math.min(1, it.value / max)) * inner;
    const y = i * rowH + 4;
    const label = it.label.length > 16 ? `${it.label.slice(0, 15)}…` : it.label;
    return `<text x="${left - 8}" y="${y + 13}" text-anchor="end" font-size="11" fill="#333">${esc(label)}</text>`
      + `<rect x="${left}" y="${y}" width="${inner}" height="16" rx="3" fill="#f1f3f7"/>`
      + `<rect x="${left}" y="${y}" width="${w.toFixed(1)}" height="16" rx="3" fill="${it.warn ? '#e5484d' : '#3b6cf6'}"/>`
      + `<text x="${left + inner + 6}" y="${y + 13}" font-size="11" fill="#333">${esc(it.text)}</text>`;
  }).join('');
  let mark = '';
  if (opts.mark && opts.mark.value <= max) {
    const x = left + (opts.mark.value / max) * inner;
    mark = `<line x1="${x.toFixed(1)}" y1="0" x2="${x.toFixed(1)}" y2="${h - 14}" stroke="#f59e0b" stroke-dasharray="4 3"/><text x="${x.toFixed(1)}" y="${h - 2}" text-anchor="middle" font-size="10" fill="#b45309">${esc(opts.mark.label)}</text>`;
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${h}" viewBox="0 0 ${width} ${h}">${rows}${mark}</svg>`;
}

/** 折线图（一条线） */
export function svgLine(points: Array<{ label: string; value: number | null; text: string }>, opts: { width?: number; height?: number; color?: string; min?: number; max?: number } = {}): string {
  const width = opts.width ?? 660; const height = opts.height ?? 170;
  const padL = 36; const padR = 36; const padT = 22; const padB = 30;
  const vals = points.map((p) => p.value).filter((v): v is number => v != null);
  if (!vals.length) return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="40"></svg>`;
  let lo = opts.min ?? Math.min(...vals); let hi = opts.max ?? Math.max(...vals);
  if (hi - lo < 1e-9) { hi += 1; lo = Math.max(0, lo - 1); }
  const x = (i: number): number => padL + (points.length === 1 ? (width - padL - padR) / 2 : (i / (points.length - 1)) * (width - padL - padR));
  const y = (v: number): number => padT + (1 - (v - lo) / (hi - lo)) * (height - padT - padB);
  const color = opts.color ?? '#3b6cf6';
  const path = points.map((p, i) => (p.value == null ? '' : `${x(i).toFixed(1)},${y(p.value).toFixed(1)}`)).filter(Boolean).join(' ');
  const dots = points.map((p, i) => (p.value == null ? '' : `<circle cx="${x(i).toFixed(1)}" cy="${y(p.value).toFixed(1)}" r="3" fill="${color}"/><text x="${x(i).toFixed(1)}" y="${(y(p.value) - 7).toFixed(1)}" text-anchor="middle" font-size="10" fill="#333">${esc(p.text)}</text>`)).join('');
  const step = Math.max(1, Math.ceil(points.length / 8));
  const labels = points.map((p, i) => (i % step === 0 || i === points.length - 1 ? `<text x="${x(i).toFixed(1)}" y="${height - 8}" text-anchor="middle" font-size="10" fill="#666">${esc(p.label.length > 12 ? p.label.slice(-10) : p.label)}</text>` : '')).join('');
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}"><line x1="${padL}" y1="${height - padB}" x2="${width - padR}" y2="${height - padB}" stroke="#d5d9e2"/><polyline fill="none" stroke="${color}" stroke-width="2" points="${path}"/>${dots}${labels}</svg>`;
}

// ── 网页片段 ─────────────────────────────────────────

const CSS = `
*{box-sizing:border-box}body{font-family:-apple-system,"PingFang SC","Microsoft YaHei","Noto Sans CJK SC",sans-serif;color:#1f2430;margin:0;padding:28px 32px;font-size:12.5px;line-height:1.65;background:#fff}
h1{font-size:21px;margin:0 0 4px}h2{font-size:15px;margin:22px 0 8px;padding-left:8px;border-left:4px solid #3b6cf6}h3{font-size:13px;margin:14px 0 6px}
.sub{color:#667085;margin:0 0 14px}.kpis{display:flex;flex-wrap:wrap;gap:8px;margin:10px 0}
.kpi{flex:1 1 120px;border:1px solid #e3e6ee;border-radius:8px;padding:8px 10px}.kpi small{display:block;color:#667085;font-size:11px}.kpi b{font-size:18px}.kpi i{font-style:normal;font-size:11px;color:#667085;margin-left:4px}
table{border-collapse:collapse;width:100%;margin:6px 0 10px;font-size:11.5px}th,td{border:1px solid #e3e6ee;padding:4px 6px;text-align:left;vertical-align:top}th{background:#f5f7fb;font-weight:600}
td.n,th.n{text-align:right;white-space:nowrap}tr.bad td{background:#fff3f3}.tag{display:inline-block;padding:0 6px;border-radius:9px;font-size:10.5px;background:#fde8e8;color:#b42318}.ok{color:#087443}.bad{color:#b42318}
p{margin:6px 0}.note{color:#667085;font-size:11px}.pre{white-space:pre-wrap}section{page-break-inside:auto}tr{page-break-inside:avoid}h2,h3{page-break-after:avoid}
@page{size:A4;margin:14mm 12mm}`;

function table(headers: Array<string | { t: string; n?: boolean }>, rows: Array<{ cells: unknown[]; bad?: boolean }>, empty: string): string {
  const hs = headers.map((h) => (typeof h === 'string' ? { t: h, n: false } : h));
  if (!rows.length) return `<p class="note">${esc(empty)}</p>`;
  return `<table><thead><tr>${hs.map((h) => `<th${h.n ? ' class="n"' : ''}>${esc(h.t)}</th>`).join('')}</tr></thead><tbody>${rows.map((r) => `<tr${r.bad ? ' class="bad"' : ''}>${r.cells.map((c, i) => `<td${hs[i]?.n ? ' class="n"' : ''}>${esc(c)}</td>`).join('')}</tr>`).join('')}</tbody></table>`;
}
const N = (t: string): { t: string; n: boolean } => ({ t, n: true });

function kpis(ctx: ReportContext): string {
  const o = ctx.result.overall; const d = ctx.delta;
  const card = (label: string, value: string, delta?: string): string => `<div class="kpi"><small>${esc(label)}</small><b>${esc(value)}</b>${delta && delta !== '-' ? `<i>${esc(i18nT('环比 {p0}', { p0: delta }))}</i>` : ''}</div>`;
  return `<div class="kpis">${[
    card(i18nT('办结数'), String(o.doneCount), signed(d.doneCount)),
    card(i18nT('平均用时（天）'), fmtDays(o.avgDays), signed(d.avgDays)),
    card(i18nT('流程时效合规率'), fmtRate(o.complianceRate), d.complianceRate == null ? '-' : i18nT('{p0} 个百分点', { p0: signedRate(d.complianceRate) })),
    card(i18nT('在途数'), String(o.runningCount), signed(d.runningCount)),
    card(i18nT('已逾期'), String(o.runningOverdue), signed(d.runningOverdue)),
    card(i18nT('较大逾期风险'), String(o.runningRisk)),
    card(i18nT('个人审核合规率'), fmtRate(o.reviewRate), d.reviewRate == null ? '-' : i18nT('{p0} 个百分点', { p0: signedRate(d.reviewRate) })),
  ].join('')}</div>`;
}

function typeTable(list: TypeStat[], withType: boolean, min: number): string {
  return table(
    [i18nT('大类'), ...(withType ? [i18nT('流程细类'), i18nT('系统')] : []), N(i18nT('办结')), N(i18nT('平均用时（天）')), N(i18nT('时效要求（天）')), N(i18nT('超时')), N(i18nT('合规率')), N(i18nT('在途')), N(i18nT('在途逾期')), N(i18nT('在途超时占比'))],
    list.map((t) => ({ bad: t.complianceRate !== null && t.complianceRate < min, cells: [t.category, ...(withType ? [t.flowType, t.system] : []), t.doneCount, fmtDays(t.avgDays), t.limitDays ?? '-', t.overtime, fmtRate(t.complianceRate), t.runningCount, t.runningOverdue, fmtRate(t.runningOverdueRate)] })),
    i18nT('没有数据'),
  );
}

function compareTable(list: TypeCompare[]): string {
  return table(
    [i18nT('流程细类'), i18nT('系统'), N(i18nT('办结')), N(i18nT('平均用时（天）')), N(i18nT('上期')), N(i18nT('变化')), N(i18nT('合规率')), N(i18nT('上期')), N(i18nT('变化（百分点）')), i18nT('异常原因')],
    list.map((t) => ({ bad: t.abnormal, cells: [t.flowType, t.system, t.doneCount, fmtDays(t.avgDays), fmtDays(t.prevAvgDays), signed(t.avgDelta), fmtRate(t.complianceRate), fmtRate(t.prevComplianceRate), signedRate(t.rateDelta), t.reasons.join(i18nT('；'))] })),
    i18nT('没有数据'),
  );
}

function rankTable(list: PersonStat[], countLabel: string): string {
  return table(
    [N(i18nT('排名')), i18nT('姓名'), i18nT('部门'), i18nT('身份'), N(countLabel), N(i18nT('合规')), N(i18nT('合规率')), N(i18nT('平均用时'))],
    list.map((p) => ({ cells: [p.rank, p.name, p.dept, p.identity, p.count, p.compliant, fmtRate(p.rate), fmtDays(p.avgDays)] })),
    i18nT('没有数据'),
  );
}

function runningTable(list: FlowResult[], reasonOf: Map<string, FsCase>): string {
  return table(
    [i18nT('系统'), i18nT('单号'), i18nT('流程细类'), i18nT('发起人'), N(i18nT('在途（天）')), N(i18nT('时效要求')), N(i18nT('超时（天）')), i18nT('当前节点'), i18nT('当前处理人'), N(i18nT('节点停留（天）')), i18nT('原因')],
    list.map((f) => {
      const c = reasonOf.get(`${f.system}|${f.flowNo}`);
      return { cells: [f.system, f.flowNo, f.flowType, f.initiator, fmtDays(f.days), f.limitDays ?? '-', fmtDays(f.overdueDays), f.currentNode, f.currentHandler, fmtDays(f.currentNodeDays), c?.reason ? `${c.categoryId ? `[${categoryLabel(c.categoryId)}] ` : ''}${c.reason}` : ''] };
    }),
    i18nT('没有在途超时的流程'),
  );
}

function nodeTable(a: NodeAnalysis): string {
  return table(
    [i18nT('节点'), i18nT('内外部'), N(i18nT('处理次数')), N(i18nT('平均耗时（天）')), N(i18nT('最长（天）')), N(i18nT('平均等待（天）')), N(i18nT('耗时占比')), N(i18nT('在途停留数')), N(i18nT('平均停留（天）'))],
    a.nodes.map((n) => ({ bad: n.node === a.longestNode, cells: [n.node, n.internal == null ? i18nT('未登记') : n.internal ? i18nT('内部') : i18nT('外部'), n.count, fmtDays(n.avgDays), fmtDays(n.maxDays), fmtDays(n.avgWaitDays), fmtRate(n.share), n.stuckCount, fmtDays(n.avgStuckDays)] })),
    i18nT('这一类流程没有节点明细'),
  );
}

function reasonsBlock(ctx: ReportContext): string {
  const cats = categoryCounts(ctx.cases);
  if (!cats.length) return `<p class="note">${esc(i18nT('还没有收集到超时原因'))}</p>`;
  return table(
    [i18nT('原因类别'), N(i18nT('数量')), i18nT('根因说明')],
    cats.map((c) => ({ cells: [categoryLabel(c.id), c.count, ctx.rootCauses[c.id] || defaultRootCause(c.id)] })),
    '',
  );
}

function suggestionTable(list: FsSuggestion[]): string {
  return table(
    [i18nT('建议事项'), i18nT('责任部门'), i18nT('责任人'), i18nT('执行要求'), i18nT('执行期限'), i18nT('验收要求')],
    list.map((s) => ({ cells: [s.item, s.dept, s.owner, s.requirement, s.deadline, s.acceptance] })),
    i18nT('本期没有改善建议'),
  );
}

const page = (title: string, body: string): string => `<!doctype html><html><head><meta charset="utf-8"><title>${esc(title)}</title><style>${CSS}</style></head><body>${body}</body></html>`;

// ── 周报 ─────────────────────────────────────────────

export function reportSubject(ctx: ReportContext): string {
  return ctx.period.kind === 'monthly'
    ? i18nT('线上流程时效达成情况月度通报（{p0}）', { p0: ctx.period.label })
    : i18nT('线上流程时效达成情况周通报（{p0}）', { p0: ctx.period.label });
}

/** 周报：邮件正文（纯文本）+ 网页版（预览用，也作为附件） */
export function weeklyMail(ctx: ReportContext): { subject: string; text: string; html: string } {
  const subject = reportSubject(ctx);
  const o = ctx.result.overall;
  const reasonOf = new Map(ctx.cases.map((c) => [c.key, c]));
  const overdue = ctx.result.flows.filter((f) => f.status === 'running' && f.runningLabel === 'overdue').sort((a, b) => b.overdueDays - a.overdueDays);
  const top = ctx.result.reviewerRank.filter((p) => p.count >= 3).slice(0, 5);
  const bottom = bottomReviewers(ctx.result.reviewerRank, 5);
  const text = [
    i18nT('各位好：'),
    '',
    i18nT('{p0} 线上流程时效达成情况如下，明细见附件。', { p0: ctx.period.label }),
    '',
    i18nT('一、关键数字'),
    i18nT('办结 {p0} 单，平均用时 {p1} 天，流程时效合规率 {p2}；个人审核合规率 {p3}。', { p0: o.doneCount, p1: fmtDays(o.avgDays), p2: fmtRate(o.complianceRate), p3: fmtRate(o.reviewRate) }),
    i18nT('在途 {p0} 单，已逾期 {p1} 单，较大逾期风险 {p2} 单。', { p0: o.runningCount, p1: o.runningOverdue, p2: o.runningRisk }),
    '',
    i18nT('二、环比变化'),
    ctx.previous
      ? i18nT('与 {p0} 相比：合规率 {p1} 个百分点，平均用时 {p2} 天，办结量 {p3} 单，在途逾期 {p4} 单。', { p0: ctx.previous.label, p1: signedRate(ctx.delta.complianceRate), p2: signed(ctx.delta.avgDays), p3: signed(ctx.delta.doneCount), p4: signed(ctx.delta.runningOverdue) })
      : i18nT('没有上一周期的数据，本期不做环比。'),
    '',
    i18nT('三、异常流程类型（{p0} 个）', { p0: ctx.abnormal.length }),
    ...(ctx.abnormal.length ? ctx.abnormal.map((a, i) => `${i + 1}. ${a.flowType}（${a.system}）：${a.reasons.join(i18nT('；'))}`) : [i18nT('无')]),
    '',
    i18nT('四、在途已逾期（{p0} 单，按超时天数列前 10）', { p0: overdue.length }),
    ...(overdue.length ? overdue.slice(0, 10).map((f, i) => i18nT('{n}. [{sys}] {no} {type}：在途 {days} 天，超时 {over} 天，当前「{node}」{handler}', { n: i + 1, sys: f.system, no: f.flowNo, type: f.flowType, days: fmtDays(f.days), over: fmtDays(f.overdueDays), node: f.currentNode || '-', handler: f.currentHandler })) : [i18nT('无')]),
    ...(ctx.summary.trim() ? ['', i18nT('五、小结'), ctx.summary.trim()] : []),
  ].join('\n');

  const body = [
    `<h1>${esc(subject)}</h1><p class="sub">${esc(i18nT('统计周期 {p0} · 数据截至 {p1}', { p0: ctx.period.label, p1: ymd(ctx.period.asOf) }))}</p>`,
    `<h2>${esc(i18nT('关键数字'))}</h2>${kpis(ctx)}`,
    `<h2>${esc(i18nT('按大类'))}</h2>${typeTable(ctx.result.byCategory, false, ctx.thresholds.minComplianceRate)}`,
    `<h2>${esc(i18nT('环比变化'))}</h2><p>${esc(ctx.previous ? i18nT('对比周期：{p0}', { p0: ctx.previous.label }) : i18nT('没有上一周期的数据，本期不做环比。'))}</p>${compareTable(ctx.compare)}`,
    `<h2>${esc(i18nT('异常流程类型'))}</h2>${table([i18nT('流程细类'), i18nT('系统'), i18nT('异常原因'), i18nT('耗时最长的节点')], ctx.abnormal.map((a) => ({ bad: true, cells: [a.flowType, a.system, a.reasons.join(i18nT('；')), a.analysis.longestNode ? `${a.analysis.longestNode}（${fmtDays(a.analysis.nodes[0]?.avgDays)}）` : '-'] })), i18nT('本期没有异常流程类型'))}`,
    `<h2>${esc(i18nT('个人审核合规率'))}</h2><h3>${esc(i18nT('靠前'))}</h3>${rankTable(top, i18nT('审核次数'))}<h3>${esc(i18nT('靠后'))}</h3>${rankTable(bottom, i18nT('审核次数'))}<p class="note">${esc(i18nT('只列审核次数不少于 3 次的人；完整排名见附件。'))}</p>`,
    `<h2>${esc(i18nT('在途已逾期'))}</h2>${runningTable(overdue.slice(0, 30), reasonOf)}`,
    `<h2>${esc(i18nT('超时原因'))}</h2>${reasonsBlock(ctx)}`,
    ctx.summary.trim() ? `<h2>${esc(i18nT('小结'))}</h2><p class="pre">${esc(ctx.summary.trim())}</p>` : '',
  ].join('');
  return { subject, text, html: page(subject, body) };
}

// ── 月报 ─────────────────────────────────────────────

export function monthlyMailText(ctx: ReportContext): string {
  const o = ctx.result.overall;
  return [
    i18nT('各位好：'),
    '',
    i18nT('{p0} 线上流程时效达成情况月度分析报告见附件（PDF 报告和明细表）。', { p0: ctx.period.label }),
    '',
    i18nT('本月办结 {p0} 单，平均用时 {p1} 天，流程时效合规率 {p2}，个人审核合规率 {p3}；在途 {p4} 单，已逾期 {p5} 单。', { p0: o.doneCount, p1: fmtDays(o.avgDays), p2: fmtRate(o.complianceRate), p3: fmtRate(o.reviewRate), p4: o.runningCount, p5: o.runningOverdue }),
    i18nT('异常流程类型 {p0} 个，本年度在途超时未办结 {p1} 单，改善建议 {p2} 条。', { p0: ctx.abnormal.length, p1: ctx.yearOverdue.length, p2: ctx.suggestions.length }),
    '',
    i18nT('请各部门对照报告里的异常流程和改善建议安排整改，改善建议已记入改善台账，到期前会与责任人确认。'),
  ].join('\n');
}

/** 月度分析报告（转 PDF）：看板数字、图、排名、异常流程、节点分析、在途超时清单、总结、改善建议 */
export function monthlyReportHtml(ctx: ReportContext): string {
  const title = i18nT('线上流程时效月度分析报告（{p0}）', { p0: ctx.period.label });
  const reasonOf = new Map(ctx.cases.map((c) => [c.key, c]));
  const th = ctx.thresholds;
  const catBars = svgBars(ctx.result.byCategory.map((c) => ({ label: c.category, value: c.complianceRate, text: fmtRate(c.complianceRate), warn: c.complianceRate !== null && c.complianceRate < th.minComplianceRate })), { max: 1, mark: { value: th.minComplianceRate, label: fmtRate(th.minComplianceRate) } });
  const typed = ctx.result.byType.filter((t) => t.doneCount > 0 && t.avgDays !== null).sort((a, b) => (b.avgDays as number) - (a.avgDays as number)).slice(0, 14);
  const typeBars = svgBars(typed.map((t) => ({ label: t.flowType, value: t.avgDays, text: i18nT('{p0} 天', { p0: fmtDays(t.avgDays) }), warn: t.limitDays !== null && (t.avgDays as number) > t.limitDays })));
  const rateLine = svgLine(ctx.trend.map((p) => ({ label: p.label, value: p.complianceRate, text: fmtRate(p.complianceRate) })), { min: Math.min(0.5, ...ctx.trend.map((p) => p.complianceRate ?? 1)), max: 1 });
  const dayLine = svgLine(ctx.trend.map((p) => ({ label: p.label, value: p.avgDays, text: fmtDays(p.avgDays) })), { color: '#f59e0b', min: 0 });
  const body = [
    `<h1>${esc(title)}</h1><p class="sub">${esc(i18nT('统计周期 {p0} · 数据截至 {p1} · 生成于 {p2}', { p0: ctx.period.label, p1: ymd(ctx.period.asOf), p2: ymd(ctx.generatedAt) }))}</p>`,
    `<h2>${esc(i18nT('一、整体数据'))}</h2>${kpis(ctx)}<p class="note">${esc(ctx.previous ? i18nT('环比对象：{p0}', { p0: ctx.previous.label }) : i18nT('没有上一周期的数据，本期不做环比。'))}</p>`,
    `<h3>${esc(i18nT('各大类合规率'))}</h3>${catBars}${typeTable(ctx.result.byCategory, false, ctx.thresholds.minComplianceRate)}`,
    `<h3>${esc(i18nT('合规率与平均用时趋势'))}</h3>${ctx.trend.length > 1 ? `${rateLine}${dayLine}` : `<p class="note">${esc(i18nT('保存两个以上周期后显示趋势。'))}</p>`}`,
    `<h2>${esc(i18nT('二、各类流程平均用时与合规率'))}</h2>${typeBars}${typeTable(ctx.result.byType.filter((t) => t.doneCount > 0 || t.runningCount > 0), true, th.minComplianceRate)}`,
    `<h2>${esc(i18nT('三、环比与异常流程类型'))}</h2><p>${esc(i18nT('判定标准：平均用时环比增加超过 {p0} 天，或时效合规率低于 {p1}。', { p0: th.avgIncreaseDays, p1: fmtRate(th.minComplianceRate) }))}</p>${compareTable(ctx.compare)}`,
    `<h2>${esc(i18nT('四、异常流程的节点分析'))}</h2>${ctx.abnormal.length ? ctx.abnormal.map((a) => `<h3>${esc(`${a.flowType}（${a.system}）`)} <span class="tag">${esc(a.reasons.join(i18nT('；')))}</span></h3><p>${esc(a.analysis.longestNode ? i18nT('耗时最长的节点：{p0}', { p0: a.analysis.longestNode }) : i18nT('没有节点明细，无法定位'))}</p>${nodeTable(a.analysis)}`).join('') : `<p class="note">${esc(i18nT('本期没有异常流程类型'))}</p>`}`,
    `<h2>${esc(i18nT('五、个人审核合规率排名'))}</h2>${rankTable(ctx.result.reviewerRank, i18nT('审核次数'))}`,
    `<h2>${esc(i18nT('六、发起人合规率排名'))}</h2>${rankTable(ctx.result.initiatorRank, i18nT('办结数'))}`,
    `<h2>${esc(i18nT('七、本年度超时未办结在途流程'))}</h2>${runningTable(ctx.yearOverdue, reasonOf)}`,
    `<h2>${esc(i18nT('八、超时原因分析'))}</h2>${reasonsBlock(ctx)}`,
    `<h2>${esc(i18nT('九、月度总结'))}</h2><p class="pre">${esc(ctx.summary.trim() || ruleSummary(ctx))}</p>`,
    `<h2>${esc(i18nT('十、改善建议'))}</h2>${suggestionTable(ctx.suggestions)}`,
  ].join('');
  return page(title, body);
}

// ── 明细表 ───────────────────────────────────────────

const dt = (t: number | null): Date | '' => (t ? new Date(t) : '');

export function flowSheet(name: string, flows: FlowResult[]): OutSheet {
  return {
    name,
    headers: [i18nT('系统'), i18nT('单号'), i18nT('流程名称'), i18nT('标题'), i18nT('大类'), i18nT('流程细类'), i18nT('发起人'), i18nT('部门'), i18nT('状态'), i18nT('开始时间'), i18nT('结束时间'), i18nT('用时（天）'), i18nT('时效要求（天）'), i18nT('是否超时'), i18nT('在途标签'), i18nT('超出（天）'), i18nT('当前节点'), i18nT('当前处理人'), i18nT('节点停留（天）'), i18nT('备注')],
    rows: flows.map((f) => [f.system, f.flowNo, f.flowName, f.title, f.category, f.flowType, f.initiator, f.dept, f.status === 'done' ? i18nT('已办结') : i18nT('在途'), dt(f.startAt), dt(f.endAt), f.days, f.limitDays ?? '', f.status === 'done' ? yesNo(f.overtime) : '', f.status === 'running' ? runLabel(f) : '', f.overdueDays || '', f.currentNode, f.currentHandler, f.currentNodeDays ?? '', f.approx ? i18nT('没有节点明细，按结束减开始估算') : '']),
  };
}

export function typeSheet(name: string, list: TypeStat[]): OutSheet {
  return {
    name,
    headers: [i18nT('大类'), i18nT('流程细类'), i18nT('系统'), i18nT('办结'), i18nT('平均用时（天）'), i18nT('时效要求（天）'), i18nT('参与判定'), i18nT('超时'), i18nT('合规率'), i18nT('在途'), i18nT('在途逾期'), i18nT('在途超时占比')],
    rows: list.map((t) => [t.category, t.flowType, t.system, t.doneCount, t.avgDays ?? '', t.limitDays ?? '', t.judged, t.overtime, fmtRate(t.complianceRate), t.runningCount, t.runningOverdue, fmtRate(t.runningOverdueRate)]),
  };
}

export function rankSheet(name: string, list: PersonStat[], countLabel: string): OutSheet {
  return {
    name,
    headers: [i18nT('排名'), i18nT('姓名'), i18nT('部门'), i18nT('身份'), countLabel, i18nT('合规'), i18nT('合规率'), i18nT('平均用时')],
    rows: list.map((p) => [p.rank, p.name, p.dept, p.identity, p.count, p.compliant, fmtRate(p.rate), p.avgDays ?? '']),
  };
}

export function reviewSheet(name: string, list: ReviewResult[]): OutSheet {
  return {
    name,
    headers: [i18nT('系统'), i18nT('单号'), i18nT('流程细类'), i18nT('节点'), i18nT('审核人'), i18nT('身份'), i18nT('部门'), i18nT('到达时间'), i18nT('完成时间'), i18nT('用时'), i18nT('单位'), i18nT('时效要求'), i18nT('是否合规')],
    rows: list.map((r) => [r.system, r.flowNo, r.flowType, r.node, r.handler, r.identity, r.dept, dt(r.startAt), dt(r.endAt), r.days, r.unit, r.limit, yesNo(r.compliant)]),
  };
}

/** 通报附件的明细工作簿 */
export function detailSheets(ctx: ReportContext): OutSheet[] {
  const res = ctx.result; const o = res.overall;
  const sheets: OutSheet[] = [
    {
      name: i18nT('汇总'),
      headers: [i18nT('指标'), i18nT('本期'), i18nT('环比')],
      rows: [
        [i18nT('统计周期'), ctx.period.label, ctx.previous?.label ?? ''],
        [i18nT('办结数'), o.doneCount, ctx.delta.doneCount ?? ''],
        [i18nT('平均用时（天）'), o.avgDays ?? '', ctx.delta.avgDays ?? ''],
        [i18nT('流程时效合规率'), fmtRate(o.complianceRate), ctx.delta.complianceRate == null ? '' : i18nT('{p0} 个百分点', { p0: signedRate(ctx.delta.complianceRate) })],
        [i18nT('在途数'), o.runningCount, ctx.delta.runningCount ?? ''],
        [i18nT('已逾期'), o.runningOverdue, ctx.delta.runningOverdue ?? ''],
        [i18nT('较大逾期风险'), o.runningRisk, ''],
        [i18nT('个人审核次数'), o.reviewCount, ''],
        [i18nT('个人审核合规率'), fmtRate(o.reviewRate), ctx.delta.reviewRate == null ? '' : i18nT('{p0} 个百分点', { p0: signedRate(ctx.delta.reviewRate) })],
      ],
    },
    typeSheet(i18nT('按大类'), res.byCategory),
    typeSheet(i18nT('按细类'), res.byType),
    {
      name: i18nT('环比'),
      headers: [i18nT('大类'), i18nT('流程细类'), i18nT('系统'), i18nT('办结'), i18nT('平均用时（天）'), i18nT('上期平均用时'), i18nT('用时变化'), i18nT('合规率'), i18nT('上期合规率'), i18nT('合规率变化（百分点）'), i18nT('是否异常'), i18nT('异常原因')],
      rows: ctx.compare.map((t) => [t.category, t.flowType, t.system, t.doneCount, t.avgDays ?? '', t.prevAvgDays ?? '', t.avgDelta ?? '', fmtRate(t.complianceRate), fmtRate(t.prevComplianceRate), t.rateDelta == null ? '' : signedRate(t.rateDelta), yesNo(t.abnormal), t.reasons.join(i18nT('；'))]),
    },
    {
      name: i18nT('异常节点'),
      headers: [i18nT('流程细类'), i18nT('系统'), i18nT('节点'), i18nT('内外部'), i18nT('处理次数'), i18nT('平均耗时（天）'), i18nT('最长（天）'), i18nT('平均等待（天）'), i18nT('耗时占比'), i18nT('在途停留数'), i18nT('平均停留（天）'), i18nT('是否最长节点')],
      rows: ctx.abnormal.flatMap((a) => a.analysis.nodes.map((n) => [a.flowType, a.system, n.node, n.internal == null ? i18nT('未登记') : n.internal ? i18nT('内部') : i18nT('外部'), n.count, n.avgDays, n.maxDays, n.avgWaitDays, fmtRate(n.share), n.stuckCount, n.avgStuckDays ?? '', yesNo(n.node === a.analysis.longestNode)])),
    },
    rankSheet(i18nT('审核人排名'), res.reviewerRank, i18nT('审核次数')),
    rankSheet(i18nT('发起人排名'), res.initiatorRank, i18nT('办结数')),
    flowSheet(i18nT('超时流程'), res.flows.filter((f) => f.status === 'done' && f.inPeriod && f.overtime === true)),
    flowSheet(i18nT('在途流程'), res.flows.filter((f) => f.status === 'running').sort((a, b) => b.overdueDays - a.overdueDays)),
    {
      name: i18nT('超时原因'),
      headers: [i18nT('系统'), i18nT('单号'), i18nT('流程细类'), i18nT('类型'), i18nT('超出（天）'), i18nT('责任人'), i18nT('超时原因'), i18nT('原因类别')],
      rows: ctx.cases.map((c) => [c.system, c.flowNo, c.flowType, c.kind === 'running' ? i18nT('在途已逾期') : i18nT('已办结超时'), c.overdueDays, c.owner, c.reason, c.reason.trim() && c.categoryId ? categoryLabel(c.categoryId) : '']),
    },
  ];
  if (ctx.period.kind === 'monthly') {
    sheets.push(flowSheet(i18nT('本年在途超时'), ctx.yearOverdue));
    sheets.push({
      name: i18nT('改善建议'),
      headers: [i18nT('建议事项'), i18nT('责任部门'), i18nT('责任人'), i18nT('执行要求'), i18nT('执行期限'), i18nT('验收要求')],
      rows: ctx.suggestions.map((s) => [s.item, s.dept, s.owner, s.requirement, s.deadline, s.acceptance]),
    });
  }
  sheets.push(reviewSheet(i18nT('个人审核明细'), res.reviews));
  sheets.push(flowSheet(i18nT('办结明细'), res.flows.filter((f) => f.status === 'done' && f.inPeriod)));
  return sheets;
}
