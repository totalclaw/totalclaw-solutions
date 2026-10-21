/**
 * 流程时效监控 · 超时原因：找责任人、出收集邮件、回填、归类。
 *
 * 归类只落在固定的七类里。没有模型时按关键字归类（关键字在 columnKeywords.json）；
 * 用模型时，类别不在名单里的不收，模型写的话里出现输入里没有的数字就整句丢掉。
 */
import { t as i18nT } from '@totalclaw/i18n';
import { FS_REASON_CATEGORIES, type FsCase, type FsOwnerMail, type FsPeriod, type FsReasonCategory } from '@totalclaw/ipc-contracts';
import type { OutSheet } from '../serviceSettlement/excel';
import type { FlowResult, SlaResult } from './calc';
import type { RosterRow } from './ingest';
import KW from './columnKeywords.json';

const REASON_KW = KW.reasonKeywords as Record<string, string[]>;

export function categoryLabel(id: FsReasonCategory | ''): string {
  switch (id) {
    case 'materials': return i18nT('资料不全退回');
    case 'absence': return i18nT('审批人出差/休假');
    case 'cross_dept': return i18nT('跨部门沟通等待');
    case 'external': return i18nT('外部单位未反馈');
    case 'system': return i18nT('系统/操作问题');
    case 'design': return i18nT('流程设计环节过多');
    case 'other': return i18nT('其他');
    default: return i18nT('未归类');
  }
}

/** 每一类的通用根因说明（没有模型，或模型的说法没通过核对时用） */
export function defaultRootCause(id: FsReasonCategory): string {
  switch (id) {
    case 'materials': return i18nT('发起时资料不完整或填写有误，被退回补充后重新流转，同一节点重复占用时间。根因在发起环节缺少提交前的资料清单和自查。');
    case 'absence': return i18nT('审批人出差、休假或开会期间没有指定代理人，待办一直停在本人名下。根因在审批授权和代理机制没有落实。');
    case 'cross_dept': return i18nT('需要其他部门确认或会签，来回沟通等待时间长。根因在跨部门节点没有约定答复时限和对接人。');
    case 'external': return i18nT('等待服务商、供应商或客户反馈、盖章、寄回资料，时间不受内部控制。根因在外部节点缺少催办节奏和超期升级办法。');
    case 'system': return i18nT('系统故障、待办提醒没收到或操作不熟练导致停留。根因在待办提醒和操作指引不到位。');
    case 'design': return i18nT('审批层级或节点偏多，存在重复审批。根因在流程本身，需要评估能否合并或减少节点。');
    default: return i18nT('原因比较分散，没有形成集中的问题，需要逐单跟进。');
  }
}

/** 按关键字归类：命中词最多的那一类；一个都没命中归「其他」 */
export function classifyByRule(reason: string): FsReasonCategory {
  const s = String(reason || '').replace(/\s+/g, '');
  let best: FsReasonCategory = 'other';
  let score = 0;
  for (const id of FS_REASON_CATEGORIES) {
    const hits = (REASON_KW[id] || []).filter((w) => s.includes(w)).length;
    if (hits > score) { score = hits; best = id; }
  }
  return best;
}

export const caseKey = (system: string, flowNo: string): string => `${system}|${flowNo}`;

/**
 * 需要收集原因的流程：本期办结且超时的 + 在途已逾期的。
 * 责任人：在途的找当前处理人；已办结的找超时最多的那次审核的审核人，没有超时审核就找发起人。
 * 之前填过的原因、归类、发信时间按单号保留。
 */
export function buildCases(res: SlaResult, roster: RosterRow[], previous: FsCase[] = []): FsCase[] {
  const emailOf = new Map(roster.map((r) => [r.name, r.email]));
  const prev = new Map(previous.map((c) => [c.key, c]));
  const worstReview = new Map<string, { handler: string; over: number }>();
  for (const r of res.reviews) {
    if (r.compliant) continue;
    const k = caseKey(r.system, r.flowNo);
    const over = r.days - r.limit;
    const cur = worstReview.get(k);
    if (!cur || over > cur.over) worstReview.set(k, { handler: r.handler, over });
  }
  const make = (f: FlowResult, kind: FsCase['kind']): FsCase => {
    const key = caseKey(f.system, f.flowNo);
    let owner = ''; let ownerRole: FsCase['ownerRole'] = 'initiator';
    if (kind === 'running' && f.currentHandler) { owner = f.currentHandler; ownerRole = 'handler'; }
    else if (kind === 'overtime' && worstReview.get(key)) { owner = worstReview.get(key)!.handler; ownerRole = 'reviewer'; }
    else { owner = f.initiator; ownerRole = 'initiator'; }
    const old = prev.get(key);
    return {
      key, system: f.system, flowNo: f.flowNo, flowName: f.flowName, title: f.title, flowType: f.flowType, category: f.category, kind,
      days: f.days, limitDays: f.limitDays, overdueDays: f.overdueDays, currentNode: f.currentNode, initiator: f.initiator,
      owner, ownerEmail: emailOf.get(owner) || '', ownerRole,
      reason: old?.reason || '', categoryId: old?.categoryId || '', classifiedBy: old?.classifiedBy || '', mailedAt: old?.mailedAt || '',
    };
  };
  const overtime = res.flows.filter((f) => f.status === 'done' && f.inPeriod && f.overtime === true).map((f) => make(f, 'overtime'));
  const running = res.flows.filter((f) => f.status === 'running' && f.runningLabel === 'overdue').map((f) => make(f, 'running'));
  return [...running, ...overtime].sort((a, b) => a.owner.localeCompare(b.owner, 'zh') || b.overdueDays - a.overdueDays);
}

const kindLabel = (k: FsCase['kind']): string => (k === 'running' ? i18nT('在途已逾期') : i18nT('已办结超时'));

/** 每位责任人一封邮件：列出名下的流程，请对方回复原因 */
export function ownerMails(cases: FsCase[], period: FsPeriod, sender: string): FsOwnerMail[] {
  const groups = new Map<string, FsCase[]>();
  for (const c of cases) groups.set(c.owner, [...(groups.get(c.owner) ?? []), c]);
  return [...groups.entries()].map(([owner, list]) => {
    const lines = list.map((c, i) => i18nT('{n}. [{sys}] {no} {name}{title}：{kind}，已用 {days} 天，时效要求 {limit} 天，超出 {over} 天{node}', {
      n: i + 1, sys: c.system, no: c.flowNo, name: c.flowName, title: c.title ? `（${c.title}）` : '', kind: kindLabel(c.kind),
      days: c.days, limit: c.limitDays ?? '-', over: c.overdueDays, node: c.currentNode ? i18nT('，当前停在「{p0}」', { p0: c.currentNode }) : '',
    }));
    const body = [
      i18nT('{p0}，你好：', { p0: owner || i18nT('同事') }),
      '',
      i18nT('流程时效通报（{p0}）里，下面 {p1} 个流程超出了时效要求，请逐条回复超时原因和预计办结时间：', { p0: period.label, p1: list.length }),
      '',
      ...lines,
      '',
      i18nT('可以直接回复这封邮件，或在附件表格的「超时原因」一列填好后发回。'),
      ...(sender ? ['', sender] : []),
    ].join('\n');
    return { owner, email: list[0].ownerEmail, count: list.length, subject: i18nT('【流程时效】请反馈 {p0} 个超时流程的原因（{p1}）', { p0: list.length, p1: period.label }), body, mailedAt: list.every((c) => c.mailedAt) ? list[0].mailedAt : '' };
  }).sort((a, b) => b.count - a.count || a.owner.localeCompare(b.owner, 'zh'));
}

/** 原因收集表：发给责任人填，也用来整表导回 */
export function reasonSheetHeaders(): string[] {
  return [i18nT('系统'), i18nT('单号'), i18nT('流程名称'), i18nT('标题'), i18nT('类型'), i18nT('已用时（天）'), i18nT('时效要求（天）'), i18nT('超出（天）'), i18nT('当前节点'), i18nT('责任人'), i18nT('超时原因')];
}
export function reasonSheet(cases: FsCase[]): OutSheet {
  return {
    name: i18nT('超时原因收集'),
    headers: reasonSheetHeaders(),
    rows: cases.map((c) => [c.system, c.flowNo, c.flowName, c.title, kindLabel(c.kind), c.days, c.limitDays ?? '', c.overdueDays, c.currentNode, c.owner, c.reason]),
  };
}

/** 从填回来的表里读原因：按「系统 + 单号」对；只有单号且唯一时也算对上 */
export function readReasonRows(headers: string[], rows: Record<string, string>[], cases: FsCase[]): { filled: Array<{ key: string; reason: string }>; unmatched: number; noColumn: boolean } {
  const std = reasonSheetHeaders();
  const pick = (label: string, kws: string[]): string => headers.find((h) => h.trim() === label) || headers.find((h) => kws.some((w) => h.replace(/\s+/g, '').includes(w))) || '';
  const noCol = pick(std[1], (KW.flow as Record<string, string[]>).flowNo);
  const reasonCol = pick(std[10], KW.reasonColumn as string[]);
  const sysCol = pick(std[0], KW.systemColumn as string[]);
  if (!noCol || !reasonCol) return { filled: [], unmatched: 0, noColumn: true };
  const byNo = new Map<string, FsCase[]>();
  for (const c of cases) byNo.set(c.flowNo, [...(byNo.get(c.flowNo) ?? []), c]);
  const filled: Array<{ key: string; reason: string }> = [];
  let unmatched = 0;
  for (const r of rows) {
    const reason = String(r[reasonCol] || '').trim();
    const no = String(r[noCol] || '').trim();
    if (!reason || !no) continue;
    const cands = byNo.get(no) ?? [];
    const sys = sysCol ? String(r[sysCol] || '').trim() : '';
    const hit = cands.find((c) => c.system === sys) ?? (cands.length === 1 ? cands[0] : undefined);
    if (hit) filled.push({ key: hit.key, reason: reason.slice(0, 500) }); else unmatched += 1;
  }
  return { filled, unmatched, noColumn: false };
}

// ── 模型输出的核对 ─────────────────────────────────────

/** 文本里的数字（去掉千分位、百分号，按数值归一） */
export function numbersIn(s: string): string[] {
  return (String(s || '').replace(/(\d),(?=\d{3})/g, '$1').match(/\d+(?:\.\d+)?/g) || []).map((x) => String(Number(x)));
}

/**
 * 模型写的话逐句核对：句子里的每个数字都必须在给它的材料里出现过，否则整句丢掉。
 * 句首的列表序号（1. / 2、）不算数字。
 */
export function guardNumbers(modelText: string, source: string): { text: string; dropped: number } {
  const allowed = new Set(numbersIn(source));
  const lines = String(modelText || '').split(/\n/);
  let dropped = 0;
  const out: string[] = [];
  for (const line of lines) {
    const marker = /^\s*(?:\d+[.、)）]|[-*•])\s*/.exec(line)?.[0] ?? '';
    const body = line.slice(marker.length);
    const kept = (body.match(/[^。！？!?；;]+[。！？!?；;]?/g) || []).filter((sentence) => {
      const ok = numbersIn(sentence).every((n) => allowed.has(n));
      if (!ok) dropped += 1;
      return ok;
    });
    if (kept.join('').trim()) out.push(`${marker}${kept.join('')}`.trimEnd());
    else if (!body.trim() && out.length && out[out.length - 1] !== '') out.push('');
  }
  return { text: out.join('\n').trim(), dropped };
}

export interface ModelClassifyOutcome {
  categories: Record<string, FsReasonCategory>;
  rootCauses: Partial<Record<FsReasonCategory, string>>;
  rejected: number;
}

/** 收模型的归类结果：类别必须在名单里，单号必须是给它的那些；根因说明过数字核对 */
export function acceptModelClassification(json: any, cases: FsCase[]): ModelClassifyOutcome {
  const valid = new Set<string>(FS_REASON_CATEGORIES);
  const keys = new Set(cases.filter((c) => c.reason.trim()).map((c) => c.key));
  const source = cases.map((c) => `${c.reason} ${c.days} ${c.limitDays ?? ''} ${c.overdueDays}`).join('\n');
  const categories: Record<string, FsReasonCategory> = {};
  let rejected = 0;
  const items: any[] = Array.isArray(json?.items) ? json.items : Array.isArray(json) ? json : [];
  for (const it of items) {
    const key = String(it?.key || '');
    const cat = String(it?.category || '');
    if (keys.has(key) && valid.has(cat)) categories[key] = cat as FsReasonCategory; else rejected += 1;
  }
  const rootCauses: Partial<Record<FsReasonCategory, string>> = {};
  const rc = json?.rootCauses && typeof json.rootCauses === 'object' ? json.rootCauses : {};
  for (const [cat, raw] of Object.entries(rc)) {
    if (!valid.has(cat) || typeof raw !== 'string') { rejected += 1; continue; }
    const g = guardNumbers(raw.slice(0, 400), source);
    if (g.text) rootCauses[cat as FsReasonCategory] = g.text; else rejected += 1;
  }
  return { categories, rootCauses, rejected };
}

/** 各类原因的数量（只数填了原因的） */
export function categoryCounts(cases: FsCase[]): Array<{ id: FsReasonCategory; count: number }> {
  return FS_REASON_CATEGORIES.map((id) => ({ id, count: cases.filter((c) => c.reason.trim() && c.categoryId === id).length }))
    .filter((x) => x.count > 0).sort((a, b) => b.count - a.count);
}
