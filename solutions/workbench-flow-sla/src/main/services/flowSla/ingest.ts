/**
 * 流程时效监控 · 报表读入与标准化。
 *
 * 三个系统导出的报表列名各不相同，这里做四件事：
 *   1. 读表（保留时分秒：日期格按 Excel 序列号读，不走只留日期的文本化）；
 *   2. 按 columnKeywords.json 的关键字认列，认不准的由界面改选；
 *   3. 归一成 calc.ts 的 FlowRow / NodeRow（状态、时间、金额、人员）；
 *      一行一个节点、流程字段重复的表，按单号归并出流程；
 *   4. 说清楚哪些行没收、为什么。
 * 表头与状态的匹配词全部在 columnKeywords.json，不写在代码里。
 */
import { basename } from 'node:path';
import { t as i18nT } from '@totalclaw/i18n';
import type { FsIngestSummary, FsPeriod, FsPeriodKind, FsSkip, FsSlot, FsSystem, FsTablePreview, FsTableSpec, FsThresholds } from '@totalclaw/ipc-contracts';
import { openSpreadsheetFile, readWorksheetData } from '../spreadsheetRead';
import { detectHeaderRow, toNumber } from '../serviceSettlement/excel';
import { DAY, norm, similar, type FlowRow, type FlowStatus, type NodeRow, type SlaRules } from './calc';
import KW from './columnKeywords.json';

export const FLOW_ROLES = ['flowNo', 'flowName', 'feeType', 'title', 'initiator', 'dept', 'status', 'startAt', 'endAt', 'amount', 'currentNode', 'currentHandler'];
export const NODE_ROLES = ['node', 'handler', 'nodeStart', 'nodeEnd'];
export const ROSTER_ROLES = ['name', 'dept', 'email', 'identity'];

const FLOW_KW = KW.flow as Record<string, string[]>;
const NODE_KW = KW.node as Record<string, string[]>;
const ROSTER_KW = KW.roster as Record<string, string[]>;

export interface RosterRow { name: string; dept: string; email: string; identity: string }

// ── 读表 ─────────────────────────────────────────────

export interface RawTable {
  path: string;
  fileName: string;
  sheetName: string;
  sheetNames: string[];
  headers: string[];
  rows: unknown[][];
  /** 每行在文件里的行号（从 1 数） */
  rowNumbers: number[];
  headerRow: number;
}

function text(v: unknown): string {
  if (v == null) return '';
  if (typeof v === 'number') return Number.isInteger(v) ? String(v) : String(Number(v.toFixed(8)));
  if (v instanceof Date) return formatTime(v.getTime());
  return String(v).trim();
}

export function readRawTable(path: string, sheet?: string): RawTable {
  const wb = openSpreadsheetFile(path, { cellDates: false, raw: false });
  const names = wb.SheetNames || [];
  if (!names.length) throw new Error(i18nT('文件没有任何工作表：{p0}', { p0: basename(path) }));
  const sheetName = (sheet && names.includes(sheet) ? sheet : '') || names.find((n) => wb.Sheets[n]?.['!ref']) || names[0];
  const data = readWorksheetData(wb.Sheets[sheetName], { raw: true, defval: null });
  const aoa = data.rows;
  if (!aoa.length) return { path, fileName: basename(path), sheetName, sheetNames: names, headers: [], rows: [], rowNumbers: [], headerRow: 0 };
  const headerIdx = detectHeaderRow(aoa);
  const seen = new Map<string, number>();
  const headers = (aoa[headerIdx] || []).map((h, i) => {
    let name = text(h) || i18nT('列{p0}', { p0: i + 1 });
    const count = seen.get(name) || 0;
    seen.set(name, count + 1);
    if (count > 0) name = `${name}(${count + 1})`;
    return name;
  });
  const rows: unknown[][] = [];
  const rowNumbers: number[] = [];
  for (let r = headerIdx + 1; r < aoa.length; r += 1) {
    const line = aoa[r] || [];
    if (!line.some((c) => text(c) !== '')) continue;
    rows.push(line);
    rowNumbers.push(data.rowNumbers[r] ?? r + 1);
  }
  return { path, fileName: basename(path), sheetName, sheetNames: names, headers, rows, rowNumbers, headerRow: data.rowNumbers[headerIdx] ?? headerIdx + 1 };
}

// ── 认列 ─────────────────────────────────────────────

const normHeader = (s: string): string => String(s || '').replace(/[\s　]+/g, '').replace(/[（(].*?[）)]$/, '').toLowerCase();

function detectIn(headers: string[], order: Array<[string, string[]]>): Record<string, string> {
  const used = new Set<string>();
  const out: Record<string, string> = {};
  const hs = headers.map((h) => ({ raw: h, n: normHeader(h) })).filter((h) => h.n);
  // 两轮：先整格相等，再包含；关键字按优先级排
  for (const pass of ['exact', 'include'] as const) {
    for (const [role, kws] of order) {
      if (out[role]) continue;
      for (const kw of kws) {
        const k = normHeader(kw);
        const hit = hs.find((h) => !used.has(h.raw) && (pass === 'exact' ? h.n === k : h.n.includes(k)));
        if (hit) { out[role] = hit.raw; used.add(hit.raw); break; }
      }
    }
  }
  return out;
}

/** 这张表是不是一行一个节点（有节点 / 环节名称列） */
export function hasNodeColumn(headers: string[]): boolean {
  return !!detectIn(headers, [['node', NODE_KW.node]]).node;
}

/**
 * 认列。节点级的表里「开始时间 / 结束时间」是节点的时间，所以只要表里有节点名称列，
 * 就先认节点列、再认流程列；纯流程表反过来。
 */
export function detectMapping(headers: string[], slot: FsSlot): Record<string, string> {
  if (slot === 'roster') return detectIn(headers, ROSTER_ROLES.map((r) => [r, ROSTER_KW[r] || []]));
  const flow: Array<[string, string[]]> = FLOW_ROLES.map((r) => [r, FLOW_KW[r] || []]);
  const node: Array<[string, string[]]> = NODE_ROLES.map((r) => [r, NODE_KW[r] || []]);
  // 「当前节点 / 当前处理人」要排在「节点 / 处理人」前面，否则会被包含匹配抢走
  const current = flow.filter(([r]) => r === 'currentNode' || r === 'currentHandler');
  const rest = flow.filter(([r]) => r !== 'currentNode' && r !== 'currentHandler');
  const probe = detectIn(headers, [...current, ...node]);
  if (slot === 'node' || probe.node) return detectIn(headers, [...current, ...node, ...rest]);
  return detectIn(headers, [...rest, ...current]);
}

export function isNodeLevel(mapping: Record<string, string>): boolean {
  return !!mapping.node && !!mapping.nodeStart;
}

/** 必填列里还缺哪些。节点级的表在没有单独流程表时，流程名称也必须有 */
export function missingRoles(slot: FsSlot, mapping: Record<string, string>, opts: { hasFlowTable?: boolean } = {}): string[] {
  if (slot === 'roster') return ['name'].filter((r) => !mapping[r]);
  if (slot === 'flow' && !isNodeLevel(mapping)) return ['flowNo', 'flowName', 'startAt'].filter((r) => !mapping[r]);
  const need = ['flowNo', 'node', 'handler', 'nodeStart'];
  if (!opts.hasFlowTable || slot === 'flow') need.push('flowName');
  return need.filter((r) => !mapping[r]);
}

export function previewTable(path: string, slot: FsSlot, sheet?: string): FsTablePreview {
  const t = readRawTable(path, sheet);
  const mapping = detectMapping(t.headers, slot);
  return {
    path, fileName: t.fileName, sheetName: t.sheetName, sheetNames: t.sheetNames, headers: t.headers, rowCount: t.rows.length,
    preview: t.rows.slice(0, 5).map((line) => Object.fromEntries(t.headers.map((h, i) => [h, previewCell(line[i], h, mapping)]))),
    mapping, headerRow: t.headerRow, combined: slot !== 'roster' && isNodeLevel(mapping) && !!mapping.flowName,
  };
}

const TIME_ROLES = new Set(['startAt', 'endAt', 'nodeStart', 'nodeEnd']);
function previewCell(v: unknown, header: string, mapping: Record<string, string>): string {
  const isTime = Object.entries(mapping).some(([role, h]) => h === header && TIME_ROLES.has(role));
  if (isTime && typeof v === 'number') { const t = parseDate(v); return t == null ? text(v) : formatTime(t); }
  return text(v);
}

// ── 时间 ─────────────────────────────────────────────

const pad = (n: number): string => String(n).padStart(2, '0');
export function formatTime(t: number): string {
  const d = new Date(t);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}
export function ymd(t: number): string {
  const d = new Date(t);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function local(y: number, mo: number, d: number, h = 0, mi = 0, s = 0): number | null {
  if (y < 100) y += 2000;
  if (y < 1990 || y > 2100 || mo < 1 || mo > 12 || d < 1 || d > 31 || h > 24 || mi > 59 || s > 59) return null;
  const t = new Date(y, mo - 1, d, h, mi, s).getTime();
  return Number.isFinite(t) ? t : null;
}

/** Excel 序列号（1900 日期系统）→ 本地时间毫秒，取整到秒 */
function fromSerial(n: number): number | null {
  if (!(n > 20000 && n < 80000)) return null;
  const ms = Math.round(n * 86400) * 1000;
  const u = new Date(Date.UTC(1899, 11, 30) + ms);
  return local(u.getUTCFullYear(), u.getUTCMonth() + 1, u.getUTCDate(), u.getUTCHours(), u.getUTCMinutes(), u.getUTCSeconds());
}

/**
 * 把单元格读成本地时间毫秒。认得：Excel 序列号、2026/10/1 9:05、2026-10-01 09:05:00、
 * 2026年10月1日 9时5分、2026.10.1、20261001、10/1/2026、带「上午 / 下午」的 12 小时制、毫秒 / 秒时间戳。
 */
export function parseDate(v: unknown): number | null {
  if (v == null || v === '') return null;
  if (v instanceof Date) return Number.isFinite(v.getTime()) ? v.getTime() : null;
  if (typeof v === 'number') {
    if (v > 1e11) return Math.round(v);
    if (v > 1e9) return Math.round(v * 1000);
    return fromSerial(v);
  }
  let s = String(v).trim();
  if (!s || /^[-/—–\\]+$/.test(s)) return null;
  if (/^\d+(\.\d+)?$/.test(s)) {
    if (/^\d{8}$/.test(s)) return local(Number(s.slice(0, 4)), Number(s.slice(4, 6)), Number(s.slice(6, 8)));
    if (/^\d{14}$/.test(s)) return local(Number(s.slice(0, 4)), Number(s.slice(4, 6)), Number(s.slice(6, 8)), Number(s.slice(8, 10)), Number(s.slice(10, 12)), Number(s.slice(12, 14)));
    return parseDate(Number(s));
  }
  const pm = /下午|晚上|pm/i.test(s);
  const am = /上午|凌晨|早上|am/i.test(s);
  s = s.replace(/上午|下午|凌晨|早上|晚上|am|pm/gi, ' ').replace(/[年月]/g, '-').replace(/日/g, ' ').replace(/[时分]/g, ':').replace(/秒/g, '').replace(/T/i, ' ').replace(/\s+/g, ' ').replace(/:\s*$/, '').trim();
  const clock = (h?: string, mi?: string, sec?: string): [number, number, number] => {
    let hh = Number(h ?? 0);
    if (pm && hh < 12) hh += 12;
    if (am && hh === 12) hh = 0;
    return [hh, Number(mi ?? 0), Math.floor(Number(sec ?? 0))];
  };
  let m = /^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})(?:\s+(\d{1,2}):(\d{1,2})(?::(\d{1,2}(?:\.\d+)?))?)?$/.exec(s);
  if (m) return local(Number(m[1]), Number(m[2]), Number(m[3]), ...clock(m[4], m[5], m[6]));
  m = /^(\d{1,2})\/(\d{1,2})\/(\d{2,4})(?:\s+(\d{1,2}):(\d{1,2})(?::(\d{1,2}(?:\.\d+)?))?)?$/.exec(s);
  if (m) return local(Number(m[3]), Number(m[1]), Number(m[2]), ...clock(m[4], m[5], m[6]));
  return null;
}

// ── 状态 ─────────────────────────────────────────────

const STATUS_KW = KW.status as Record<FlowStatus, string[]>;

function matchStatus(raw: string): FlowStatus | null {
  const s = raw.replace(/\s+/g, '');
  if (!s) return null;
  const exact = (['terminated', 'done', 'running'] as FlowStatus[]).find((k) => STATUS_KW[k].includes(s));
  if (exact) return exact;
  // 包含匹配时「未结束」要先于「结束」
  return (['terminated', 'running', 'done'] as FlowStatus[]).find((k) => STATUS_KW[k].some((w) => s.includes(w))) ?? null;
}

/**
 * 状态口径（时效看板指标）：OA 看审批状态，CSS 看状态，费控看当前处理人（结束 / 终止，其余为在途）。
 * 状态列认不出来时按有没有结束时间判断，并标记 guessed。
 */
export function resolveStatus(system: FsSystem, statusText: string, handlerText: string, hasEnd: boolean): { status: FlowStatus; guessed: boolean } {
  const byStatus = matchStatus(statusText);
  if (byStatus) return { status: byStatus, guessed: false };
  if ((KW.statusByHandler as string[]).includes(system)) {
    const byHandler = matchStatus(handlerText);
    if (byHandler === 'done' || byHandler === 'terminated') return { status: byHandler, guessed: false };
    if (handlerText.trim()) return { status: 'running', guessed: false };
  }
  return { status: hasEnd ? 'done' : 'running', guessed: !!statusText.trim() };
}

// ── 归一 ─────────────────────────────────────────────

class Skips {
  private readonly map = new Map<string, FsSkip>();
  add(file: string, reason: string, row: number): void {
    const k = `${file}|${reason}`;
    const cur = this.map.get(k) ?? { file, reason, count: 0, rows: [] };
    cur.count += 1;
    if (cur.rows.length < 10) cur.rows.push(row);
    this.map.set(k, cur);
  }
  list(): FsSkip[] { return [...this.map.values()]; }
}

type Getter = (line: unknown[], role: string) => unknown;
function getter(t: RawTable, mapping: Record<string, string>): Getter {
  const idx: Record<string, number> = {};
  for (const [role, h] of Object.entries(mapping)) { const i = t.headers.indexOf(h); if (i >= 0) idx[role] = i; }
  return (line, role) => (idx[role] === undefined ? null : line[idx[role]]);
}

function amountOf(v: unknown): number | undefined {
  const s = text(v);
  if (!s) return undefined;
  const wan = /万/.test(s);
  const n = toNumber(s.replace(/万/g, ''));
  return Number.isFinite(n) ? (wan ? n * 10000 : n) : undefined;
}

function parseFlows(t: RawTable, mapping: Record<string, string>, system: FsSystem, skips: Skips, warn: (m: string) => void): FlowRow[] {
  const get = getter(t, mapping);
  const out: FlowRow[] = [];
  const seen = new Set<string>();
  let guessed = 0;
  t.rows.forEach((line, i) => {
    const rowNo = t.rowNumbers[i];
    const flowNo = text(get(line, 'flowNo'));
    const flowName = text(get(line, 'flowName'));
    if (!flowNo) { skips.add(t.fileName, i18nT('没有单号'), rowNo); return; }
    if (!flowName) { skips.add(t.fileName, i18nT('没有流程名称'), rowNo); return; }
    if (seen.has(flowNo)) { skips.add(t.fileName, i18nT('单号重复，只留第一行'), rowNo); return; }
    const startAt = parseDate(get(line, 'startAt'));
    if (startAt == null) { skips.add(t.fileName, i18nT('开始时间读不出来'), rowNo); return; }
    const endRaw = get(line, 'endAt');
    const endAt = parseDate(endRaw) ?? undefined;
    const handlerText = text(get(line, 'currentHandler'));
    const st = resolveStatus(system, text(get(line, 'status')), handlerText, endAt !== undefined);
    if (st.guessed) guessed += 1;
    if (st.status === 'done' && endAt === undefined) { skips.add(t.fileName, i18nT('已办结但结束时间读不出来'), rowNo); return; }
    if (endAt !== undefined && endAt < startAt) { skips.add(t.fileName, i18nT('结束时间早于开始时间'), rowNo); return; }
    seen.add(flowNo);
    const handlerIsStatus = matchStatus(handlerText) !== null && (KW.statusByHandler as string[]).includes(system);
    out.push({
      system, flowNo, flowName, feeType: text(get(line, 'feeType')) || undefined, title: text(get(line, 'title')) || undefined,
      initiator: text(get(line, 'initiator')), dept: text(get(line, 'dept')) || undefined, status: st.status, startAt,
      endAt: st.status === 'running' ? undefined : endAt, amount: amountOf(get(line, 'amount')),
      currentNode: st.status === 'running' ? text(get(line, 'currentNode')) || undefined : undefined,
      currentHandler: st.status === 'running' && !handlerIsStatus ? handlerText || undefined : undefined,
    });
  });
  if (guessed) warn(i18nT('{p0}：{p1} 行的状态没有认出来，按有没有结束时间判断是否办结', { p0: t.fileName, p1: guessed }));
  return out;
}

interface NodeParse { nodes: NodeRow[]; derived: FlowRow[] }

function parseNodes(t: RawTable, mapping: Record<string, string>, system: FsSystem, skips: Skips, warn: (m: string) => void, derive: boolean): NodeParse {
  const get = getter(t, mapping);
  const nodes: NodeRow[] = [];
  const groups = new Map<string, { lines: unknown[][]; rowNo: number; nodes: NodeRow[] }>();
  let badEnd = 0;
  t.rows.forEach((line, i) => {
    const rowNo = t.rowNumbers[i];
    const flowNo = text(get(line, 'flowNo'));
    if (!flowNo) { skips.add(t.fileName, i18nT('没有单号'), rowNo); return; }
    const g = groups.get(flowNo) ?? { lines: [], rowNo, nodes: [] };
    g.lines.push(line);
    groups.set(flowNo, g);
    const node = text(get(line, 'node'));
    if (!node) { skips.add(t.fileName, i18nT('没有节点名称'), rowNo); return; }
    const startAt = parseDate(get(line, 'nodeStart'));
    if (startAt == null) { skips.add(t.fileName, i18nT('节点开始时间读不出来'), rowNo); return; }
    const endRaw = get(line, 'nodeEnd');
    const endAt = parseDate(endRaw) ?? undefined;
    if (endAt === undefined && text(endRaw) && !/^[-/—–\\]+$/.test(text(endRaw))) badEnd += 1;
    if (endAt !== undefined && endAt < startAt) { skips.add(t.fileName, i18nT('节点结束时间早于开始时间'), rowNo); return; }
    const row: NodeRow = { system, flowNo, flowName: text(get(line, 'flowName')), feeType: text(get(line, 'feeType')) || undefined, node, handler: text(get(line, 'handler')), startAt, endAt };
    nodes.push(row);
    g.nodes.push(row);
  });
  if (badEnd) warn(i18nT('{p0}：{p1} 行的节点结束时间读不出来，按还没处理完计', { p0: t.fileName, p1: badEnd }));
  const derived: FlowRow[] = [];
  if (derive) {
    let guessed = 0;
    for (const [flowNo, g] of groups) {
      const first = (role: string): string => { for (const l of g.lines) { const s = text(get(l, role)); if (s) return s; } return ''; };
      const last = (role: string): string => { for (let k = g.lines.length - 1; k >= 0; k -= 1) { const s = text(get(g.lines[k], role)); if (s) return s; } return ''; };
      const flowName = first('flowName');
      if (!flowName) { skips.add(t.fileName, i18nT('没有流程名称'), g.rowNo); continue; }
      const sorted = [...g.nodes].sort((a, b) => a.startAt - b.startAt);
      let startAt: number | null = null;
      for (const l of g.lines) { startAt = parseDate(get(l, 'startAt')); if (startAt != null) break; }
      if (startAt == null) startAt = sorted[0]?.startAt ?? null;
      if (startAt == null) { skips.add(t.fileName, i18nT('开始时间读不出来'), g.rowNo); continue; }
      let endAt: number | undefined;
      for (const l of g.lines) { endAt = parseDate(get(l, 'endAt')) ?? undefined; if (endAt !== undefined) break; }
      const allEnded = sorted.length > 0 && sorted.every((n) => n.endAt !== undefined);
      if (endAt === undefined && allEnded) endAt = Math.max(...sorted.map((n) => n.endAt as number));
      const handlerText = last('currentHandler');
      const st = resolveStatus(system, last('status'), handlerText, allEnded && endAt !== undefined);
      if (st.guessed) guessed += 1;
      if (st.status === 'done' && endAt === undefined) { skips.add(t.fileName, i18nT('已办结但结束时间读不出来'), g.rowNo); continue; }
      const open = [...sorted].reverse().find((n) => n.endAt === undefined);
      const opener = sorted.find((n) => /发起|起草|提交|开始/.test(n.node) && n.handler);
      derived.push({
        system, flowNo, flowName, feeType: first('feeType') || undefined, title: first('title') || undefined,
        initiator: first('initiator') || opener?.handler || '', dept: first('dept') || undefined, status: st.status, startAt,
        endAt: st.status === 'running' ? undefined : endAt, amount: amountOf(first('amount')),
        currentNode: st.status === 'running' ? last('currentNode') || open?.node || undefined : undefined,
        currentHandler: st.status === 'running' ? (matchStatus(handlerText) ? '' : handlerText) || open?.handler || undefined : undefined,
      });
    }
    if (guessed) warn(i18nT('{p0}：{p1} 个流程的状态没有认出来，按节点是否全部处理完判断是否办结', { p0: t.fileName, p1: guessed }));
  }
  return { nodes, derived };
}

function parseRoster(t: RawTable, mapping: Record<string, string>, skips: Skips): RosterRow[] {
  const get = getter(t, mapping);
  const seen = new Set<string>();
  const out: RosterRow[] = [];
  t.rows.forEach((line, i) => {
    const name = text(get(line, 'name'));
    if (!name) { skips.add(t.fileName, i18nT('没有姓名'), t.rowNumbers[i]); return; }
    if (seen.has(name)) { skips.add(t.fileName, i18nT('姓名重复，只留第一行'), t.rowNumbers[i]); return; }
    seen.add(name);
    const email = text(get(line, 'email'));
    out.push({ name, dept: text(get(line, 'dept')), email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? email : '', identity: text(get(line, 'identity')) });
  });
  return out;
}

export interface IngestInput {
  systems: Partial<Record<FsSystem, { flow?: FsTableSpec; node?: FsTableSpec }>>;
  roster?: FsTableSpec;
}
export interface IngestResult { flows: FlowRow[]; nodes: NodeRow[]; roster: RosterRow[]; summary: FsIngestSummary }

export function ingestAll(input: IngestInput, nowIso = new Date().toISOString()): IngestResult {
  const skips = new Skips();
  const warnings: string[] = [];
  const warn = (m: string): void => { warnings.push(m); };
  const flows: FlowRow[] = [];
  const nodes: NodeRow[] = [];
  const files: string[] = [];
  const systems: FsIngestSummary['systems'] = [];

  for (const [system, spec] of Object.entries(input.systems) as Array<[FsSystem, { flow?: FsTableSpec; node?: FsTableSpec }]>) {
    if (!spec?.flow && !spec?.node) continue;
    let sysFlows: FlowRow[] = [];
    const sysNodes: NodeRow[] = [];
    let derived = false;
    if (spec.flow) {
      const t = readRawTable(spec.flow.path, spec.flow.sheet);
      files.push(spec.flow.path);
      const miss = missingRoles('flow', spec.flow.mapping);
      if (miss.length) throw new Error(i18nT('{p0}：还有必填列没有对应上', { p0: t.fileName }));
      if (isNodeLevel(spec.flow.mapping)) {
        const r = parseNodes(t, spec.flow.mapping, system, skips, warn, true);
        sysNodes.push(...r.nodes); sysFlows = r.derived; derived = true;
      } else {
        sysFlows = parseFlows(t, spec.flow.mapping, system, skips, warn);
      }
    }
    if (spec.node) {
      const t = readRawTable(spec.node.path, spec.node.sheet);
      files.push(spec.node.path);
      const miss = missingRoles('node', spec.node.mapping, { hasFlowTable: !!spec.flow });
      if (miss.length) throw new Error(i18nT('{p0}：还有必填列没有对应上', { p0: t.fileName }));
      const r = parseNodes(t, spec.node.mapping, system, skips, warn, !spec.flow);
      sysNodes.push(...r.nodes);
      if (!spec.flow) { sysFlows = r.derived; derived = true; }
    }
    // 节点表没写流程名的，从流程表按单号补；补不上的不收
    const byNo = new Map(sysFlows.map((f) => [f.flowNo, f]));
    let orphan = 0;
    const kept = sysNodes.filter((n) => {
      const f = byNo.get(n.flowNo);
      if (!n.flowName && f) { n.flowName = f.flowName; }
      if (!n.feeType && f?.feeType) n.feeType = f.feeType;
      if (!n.flowName) { orphan += 1; return false; }
      return true;
    });
    if (orphan) warn(i18nT('{p0} 有 {p1} 行节点记录在流程表里找不到单号、自己也没有流程名称，没有收', { p0: system, p1: orphan }));
    flows.push(...sysFlows);
    nodes.push(...kept);
    systems.push({
      system, flows: sysFlows.length, nodes: kept.length, derived,
      done: sysFlows.filter((f) => f.status === 'done').length,
      running: sysFlows.filter((f) => f.status === 'running').length,
      terminated: sysFlows.filter((f) => f.status === 'terminated').length,
    });
  }
  let roster: RosterRow[] = [];
  if (input.roster) {
    const t = readRawTable(input.roster.path, input.roster.sheet);
    files.push(input.roster.path);
    if (missingRoles('roster', input.roster.mapping).length) throw new Error(i18nT('{p0}：还有必填列没有对应上', { p0: t.fileName }));
    roster = parseRoster(t, input.roster.mapping, skips);
  }
  if (!flows.length) throw new Error(i18nT('没有读到任何流程，请检查选择的文件和列对应'));
  return {
    flows, nodes, roster,
    summary: { systems, roster: roster.length, rosterWithEmail: roster.filter((r) => r.email).length, skipped: skips.list(), warnings, files, at: nowIso },
  };
}

// ── 规则生效前的调整 ───────────────────────────────────

/** 「这个流程名就是常规流程」的标记：不再出现在待核对名单里 */
export const REGULAR = '__regular__';
export const aliasKey = (system: string, flowName: string): string => `${system}|${norm(flowName)}`;

export interface NodeDecision { system: FsSystem; flowName: string; node: string; internal: boolean }

/** 把人工对过的流程名换成规则表里的细类名；返回换名前的名字，方便结果里还显示原名 */
export function applyAliases(flows: FlowRow[], aliases: Record<string, string>): { flows: FlowRow[]; original: Map<string, string> } {
  const original = new Map<string, string>();
  const out = flows.map((f) => {
    const target = aliases[aliasKey(f.system, f.flowName)];
    if (!target || target === REGULAR) return f;
    original.set(`${f.system}|${f.flowNo}`, f.flowName);
    return { ...f, flowName: target, feeType: undefined };
  });
  return { flows: out, original };
}

export function thresholdsOf(rules: SlaRules): FsThresholds {
  return {
    amountThreshold: rules.amountThreshold, riskRatio: rules.riskRatio,
    avgIncreaseDays: rules.abnormal.avgIncreaseDays, minComplianceRate: rules.abnormal.minComplianceRate,
    internalDays: rules.followUp.internalDays, externalDays: rules.followUp.externalDays, improveRemindDays: rules.improveRemindDays,
  };
}

export function sanitizeThresholds(p: Partial<FsThresholds>, base: FsThresholds): FsThresholds {
  const num = (v: unknown, fallback: number, min: number, max: number): number => {
    const n = Number(v);
    return v !== undefined && v !== null && v !== '' && Number.isFinite(n) && n >= min && n <= max ? n : fallback;
  };
  return {
    amountThreshold: num(p.amountThreshold, base.amountThreshold, 0, 1e12),
    riskRatio: num(p.riskRatio, base.riskRatio, 0.01, 1),
    avgIncreaseDays: num(p.avgIncreaseDays, base.avgIncreaseDays, 0, 365),
    minComplianceRate: num(p.minComplianceRate, base.minComplianceRate, 0, 1),
    internalDays: num(p.internalDays, base.internalDays, 1, 90),
    externalDays: num(p.externalDays, base.externalDays, 1, 90),
    improveRemindDays: num(p.improveRemindDays, base.improveRemindDays, 0, 90),
  };
}

/** 规则表 + 阈值 + 人工定过内外部的节点 + 花名册里标了管理干部的人 */
export function effectiveRules(base: SlaRules, o: { thresholds?: Partial<FsThresholds>; decisions?: NodeDecision[]; roster?: RosterRow[] } = {}): SlaRules {
  const th = sanitizeThresholds(o.thresholds ?? {}, thresholdsOf(base));
  const rules: SlaRules = {
    ...base,
    cssNodes: [...base.cssNodes], oaFkNodes: [...base.oaFkNodes], managers: [...base.managers],
    amountThreshold: th.amountThreshold, riskRatio: th.riskRatio,
    abnormal: { avgIncreaseDays: th.avgIncreaseDays, minComplianceRate: th.minComplianceRate },
    followUp: { internalDays: th.internalDays, externalDays: th.externalDays },
    improveRemindDays: th.improveRemindDays,
  };
  // calc 对 OA / 费控流程名先找完全相同、再找最相近的那一个：人工定的节点要挂到同一个名字下，否则会把原有节点挤掉
  const names = [...new Set(base.oaFkNodes.map((r) => r[0]))];
  const targetName = (flowName: string): string => {
    const k = norm(flowName);
    const exact = names.find((n) => norm(n) === k);
    if (exact) return exact;
    let best = ''; let score = 0;
    for (const n of names) { const sc = similar(n, flowName); if (sc > score) { score = sc; best = n; } }
    return best || flowName;
  };
  for (const d of o.decisions ?? []) {
    if (d.system === 'CSS') rules.cssNodes.push({ flowType: d.flowName, feeType: '', node: d.node, internal: d.internal, limitWorkdays: null, note: '' });
    else rules.oaFkNodes.push([targetName(d.flowName), d.node, d.internal]);
  }
  const mgrKw = KW.managerIdentity as string[];
  const nonKw = KW.nonManagerIdentity as string[];
  const set = new Set(rules.managers.map((n) => n.trim()));
  for (const r of o.roster ?? []) {
    const id = r.identity.replace(/\s+/g, '');
    if (!id) continue;
    if (nonKw.some((w) => id.includes(w))) set.delete(r.name);
    else if (mgrKw.some((w) => id.includes(w))) set.add(r.name);
  }
  rules.managers = [...set];
  return rules;
}

// ── 统计周期 ─────────────────────────────────────────

function dayStart(t: number): Date { const d = new Date(t); d.setHours(0, 0, 0, 0); return d; }

/** 周报默认上周一到周日，月报默认上个月 */
export function defaultPeriod(kind: FsPeriodKind, now: number): FsPeriod {
  if (kind === 'monthly') {
    const d = dayStart(now);
    const end = new Date(d.getFullYear(), d.getMonth(), 1).getTime();
    const start = new Date(d.getFullYear(), d.getMonth() - 1, 1).getTime();
    return makePeriod(kind, start, end, now);
  }
  const d = dayStart(now);
  const back = (d.getDay() + 6) % 7; // 距本周一的天数
  const thisMonday = new Date(d.getFullYear(), d.getMonth(), d.getDate() - back);
  const lastMonday = new Date(thisMonday.getFullYear(), thisMonday.getMonth(), thisMonday.getDate() - 7);
  return makePeriod(kind, lastMonday.getTime(), thisMonday.getTime(), now);
}

export function makePeriod(kind: FsPeriodKind, start: number, end: number, asOf: number): FsPeriod {
  const s = dayStart(start).getTime();
  let e = dayStart(end).getTime();
  if (!(e > s)) e = s + DAY;
  const lastDay = new Date(e); lastDay.setDate(lastDay.getDate() - 1);
  const d = new Date(s);
  const wholeMonth = d.getDate() === 1 && new Date(d.getFullYear(), d.getMonth() + 1, 1).getTime() === e;
  const label = kind === 'monthly' && wholeMonth ? `${d.getFullYear()}-${pad(d.getMonth() + 1)}` : `${ymd(s)} ~ ${ymd(lastDay.getTime())}`;
  return { kind, start: s, end: e, asOf: Math.max(asOf, s), label };
}
