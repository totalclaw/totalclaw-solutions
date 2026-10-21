/**
 * 流程时效监控 · 在途跟进与改善台账的后台提醒。
 *
 * 每 10 分钟一轮（启动 30 秒后跑第一轮）：
 *   1. 在途跟进：到了跟进日（内部流程 3 天 / 外部流程 7 天一次）的异常在途流程，汇总成一条提醒；
 *   2. 改善台账：执行期限前 N 天提醒与责任人确认执行情况；过了期限标记逾期并升级督办。
 * 同一次到期只提醒一次（记在条目上）。出口由外面注入：界面事件 + 系统通知。
 * 时钟可注入，测试用固定时间。
 */
import { t as i18nT } from '@totalclaw/i18n';
import type { FsLedgerItem, FsLedgerStatus, FsReminder, FsSystem, FsTrackItem } from '@totalclaw/ipc-contracts';
import { DAY, followUpIntervalDays, type FlowStatus, type SlaResult, type SlaRules } from './calc';
import type { RosterRow } from './ingest';
import { newId, type FlowSlaStore } from './store';

const TICK_MS = 10 * 60 * 1000;
const FIRST_TICK_MS = 30 * 1000;
const MAX_CLOSED = 200;

const iso = (ms: number): string => new Date(ms).toISOString();
const pad = (n: number): string => String(n).padStart(2, '0');
export function localDay(ms: number): string {
  const d = new Date(ms);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}
function dayMs(day: string): number {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(day);
  return m ? new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3])).getTime() : NaN;
}
/** 期限距今天还有几天（当天为 0，已过为负）；期限写得不对返回 null */
export function daysUntil(deadline: string, nowMs: number): number | null {
  const d = dayMs(deadline);
  if (!Number.isFinite(d)) return null;
  return Math.round((d - dayMs(localDay(nowMs))) / DAY);
}

export const nextFollowAt = (nowMs: number, intervalDays: number): string => iso(nowMs + Math.max(1, intervalDays) * DAY);

// ── 在途跟进 ─────────────────────────────────────────

export interface SyncInput {
  result: SlaResult;
  /** 本次导入里每个流程的状态（含已终止的，计算结果里不带终止流程） */
  statusByKey: Map<string, FlowStatus>;
  roster: RosterRow[];
  rules: SlaRules;
  nowMs: number;
}

/**
 * 用最新一次计算结果更新跟进名单：
 *   在途且已逾期的进名单（已在名单里的更新用时、当前节点和处理人，跟进节奏不变）；
 *   名单里的流程在这次导入里已经办结 / 终止，或按当前规则不再逾期，就闭环；
 *   这次导入里没有出现的流程原样保留。
 */
export function syncTracking(existing: FsTrackItem[], input: SyncInput): { items: FsTrackItem[]; added: number; closed: number } {
  const { result, statusByKey, roster, rules, nowMs } = input;
  const emailOf = new Map(roster.map((r) => [r.name, r.email]));
  const flowByKey = new Map(result.flows.map((f) => [`${f.system}|${f.flowNo}`, f]));
  const now = iso(nowMs);
  let added = 0; let closed = 0;
  const out: FsTrackItem[] = [];
  const openKeys = new Set<string>();
  for (const item of existing) {
    if (item.closedAt) { out.push(item); continue; }
    const f = flowByKey.get(item.key);
    const status = statusByKey.get(item.key);
    const close = (reason: string): void => {
      closed += 1;
      out.push({ ...item, closedAt: now, closeReason: reason, notes: [...item.notes, { at: now, text: reason, kind: 'system' }] });
    };
    if (status === 'done') { close(i18nT('最新导入的报表显示流程已办结')); continue; }
    if (status === 'terminated') { close(i18nT('最新导入的报表显示流程已终止')); continue; }
    if (f && f.status === 'running' && f.runningLabel !== 'overdue') { close(i18nT('按当前时效规则不再逾期')); continue; }
    openKeys.add(item.key);
    if (!f) { out.push(item); continue; }
    const handler = f.currentHandler || item.handler;
    out.push({
      ...item, flowName: f.flowName, title: f.title, flowType: f.flowType, category: f.category, initiator: f.initiator,
      handler, handlerEmail: emailOf.get(handler) || (handler === item.handler ? item.handlerEmail : ''), currentNode: f.currentNode || item.currentNode,
      days: f.days, limitDays: f.limitDays, overdueDays: f.overdueDays, currentNodeDays: f.currentNodeDays,
      intervalDays: followUpIntervalDays(f.category, rules),
    });
  }
  for (const f of result.flows) {
    if (f.status !== 'running' || f.runningLabel !== 'overdue') continue;
    const key = `${f.system}|${f.flowNo}`;
    if (openKeys.has(key)) continue;
    const interval = followUpIntervalDays(f.category, rules);
    const handler = f.currentHandler || f.initiator;
    added += 1;
    out.unshift({
      key, system: f.system as FsSystem, flowNo: f.flowNo, flowName: f.flowName, title: f.title, flowType: f.flowType, category: f.category,
      initiator: f.initiator, handler, handlerEmail: emailOf.get(handler) || '', currentNode: f.currentNode, startAt: f.startAt,
      days: f.days, limitDays: f.limitDays, overdueDays: f.overdueDays, currentNodeDays: f.currentNodeDays, intervalDays: interval,
      firstSeenAt: now, lastFollowAt: '', nextFollowAt: nextFollowAt(nowMs, interval), notifiedFor: '',
      notes: [{ at: now, text: i18nT('进入跟进名单：在途 {p0} 天，超出时效要求 {p1} 天', { p0: f.days, p1: f.overdueDays }), kind: 'system' }],
      closedAt: '', closeReason: '',
    });
  }
  // 同一个流程重新进名单后，旧的闭环记录不再保留；闭环记录只留最近的一批
  const open = out.filter((x) => !x.closedAt);
  const reopened = new Set(open.map((x) => x.key));
  const closedItems = out.filter((x) => x.closedAt && !reopened.has(x.key)).sort((a, b) => b.closedAt.localeCompare(a.closedAt)).slice(0, MAX_CLOSED);
  open.sort((a, b) => a.nextFollowAt.localeCompare(b.nextFollowAt) || b.overdueDays - a.overdueDays);
  return { items: [...open, ...closedItems], added, closed };
}

/** 到了跟进日、这一次到期还没提醒过的条目 */
export function dueFollowUps(tracking: FsTrackItem[], nowMs: number): FsTrackItem[] {
  const now = iso(nowMs);
  return tracking.filter((t) => !t.closedAt && t.nextFollowAt && t.nextFollowAt <= now && t.notifiedFor !== t.nextFollowAt);
}

// ── 改善台账 ─────────────────────────────────────────

/** 状态以期限为准自动换算：进行中过了期限就是逾期；已完成 / 已归档不动 */
export function ledgerStatus(item: Pick<FsLedgerItem, 'status' | 'deadline'>, nowMs: number): FsLedgerStatus {
  if (item.status === 'done' || item.status === 'archived') return item.status;
  const left = daysUntil(item.deadline, nowMs);
  return left !== null && left < 0 ? 'overdue' : 'doing';
}

export interface LedgerActions { remind: FsLedgerItem[]; escalate: FsLedgerItem[] }

/** 这一轮要提醒的台账事项：到期前 remindDays 天内（含当天）提醒一次；逾期后升级督办一次 */
export function ledgerActions(ledger: FsLedgerItem[], nowMs: number, remindDays: number): LedgerActions {
  const remind: FsLedgerItem[] = []; const escalate: FsLedgerItem[] = [];
  for (const it of ledger) {
    if (it.status === 'done' || it.status === 'archived') continue;
    const left = daysUntil(it.deadline, nowMs);
    if (left === null) continue;
    if (left < 0) { if (it.escalatedFor !== it.deadline) escalate.push(it); }
    else if (left <= remindDays && it.remindedFor !== it.deadline) remind.push(it);
  }
  return { remind, escalate };
}

// ── 守护 ─────────────────────────────────────────────

export interface ProcDeps {
  store: FlowSlaStore;
  /** 到期前几天提醒（规则页可改） */
  remindDays: () => number;
  /** 推给渲染进程 */
  broadcast: (event: { type: string; payload?: unknown }) => void;
  /** 系统通知 */
  notify?: (title: string, body: string) => void;
  logger?: { info?: (m: string, c?: unknown) => void; warn?: (m: string, c?: unknown) => void };
  now?: () => number;
}

export class FlowSlaProc {
  private timer: NodeJS.Timeout | null = null;
  private firstTimer: NodeJS.Timeout | null = null;
  private ticking = false;

  constructor(private readonly deps: ProcDeps) {}

  private nowMs(): number { return this.deps.now?.() ?? Date.now(); }

  start(): void {
    if (this.timer) return;
    this.firstTimer = setTimeout(() => { void this.tick(); }, FIRST_TICK_MS);
    if (typeof this.firstTimer.unref === 'function') this.firstTimer.unref();
    this.timer = setInterval(() => { void this.tick(); }, TICK_MS);
    if (typeof this.timer.unref === 'function') this.timer.unref();
  }

  stop(): void {
    if (this.firstTimer) clearTimeout(this.firstTimer);
    if (this.timer) clearInterval(this.timer);
    this.firstTimer = null;
    this.timer = null;
  }

  /** 一轮提醒；返回这一轮发出的提醒。两段互不影响 */
  async tick(): Promise<FsReminder[]> {
    if (this.ticking) return [];
    this.ticking = true;
    const fired: FsReminder[] = [];
    try {
      try { fired.push(...this.runFollowUps()); } catch (e) { this.deps.logger?.warn?.('follow-up reminders failed', { error: (e as Error)?.message }); }
      try { fired.push(...this.runLedger()); } catch (e) { this.deps.logger?.warn?.('ledger reminders failed', { error: (e as Error)?.message }); }
      if (fired.length) this.deps.broadcast({ type: 'state' });
    } finally {
      this.ticking = false;
    }
    return fired;
  }

  private fire(type: FsReminder['type'], title: string, body: string): FsReminder {
    const ev: FsReminder = { id: newId('fsr'), at: iso(this.nowMs()), type, title, body };
    this.deps.store.update((s) => { s.reminders.unshift(ev); });
    this.deps.broadcast({ type: 'reminder', payload: ev });
    try { this.deps.notify?.(title, body); } catch { /* 系统通知不可用不影响 */ }
    this.deps.logger?.info?.('reminder fired', { type, title });
    return ev;
  }

  private runFollowUps(): FsReminder[] {
    const now = this.nowMs();
    const due = dueFollowUps(this.deps.store.read().tracking, now);
    if (!due.length) return [];
    const keys = new Set(due.map((d) => d.key));
    this.deps.store.update((s) => { for (const t of s.tracking) if (keys.has(t.key) && !t.closedAt) t.notifiedFor = t.nextFollowAt; });
    const lines = due.slice(0, 5).map((t) => i18nT('[{p0}] {p1} {p2}：超时 {p3} 天，处理人 {p4}', { p0: t.system, p1: t.flowNo, p2: t.flowType, p3: t.overdueDays, p4: t.handler || '-' }));
    const more = due.length > 5 ? [i18nT('…… 另有 {p0} 条', { p0: due.length - 5 })] : [];
    return [this.fire('follow_up', i18nT('有 {p0} 条在途流程到了跟进时间', { p0: due.length }), [...lines, ...more].join('\n'))];
  }

  private runLedger(): FsReminder[] {
    const now = this.nowMs();
    const store = this.deps.store;
    const remindDays = Math.max(0, Number(this.deps.remindDays()) || 0);
    // 先把状态按期限换算好
    const stale = store.read().ledger.some((it) => ledgerStatus(it, now) !== it.status || (ledgerStatus(it, now) === 'overdue' && !it.escalated));
    if (stale) store.update((s) => { for (const it of s.ledger) { it.status = ledgerStatus(it, now); if (it.status === 'overdue') it.escalated = true; } });
    const { remind, escalate } = ledgerActions(store.read().ledger, now, remindDays);
    const out: FsReminder[] = [];
    for (const it of remind) {
      const left = daysUntil(it.deadline, now) ?? 0;
      store.update((s) => { const cur = s.ledger.find((x) => x.id === it.id); if (cur) cur.remindedFor = cur.deadline; });
      out.push(this.fire('ledger_due', i18nT('改善事项还有 {p0} 天到期，请与责任人确认执行情况', { p0: left }), i18nT('{p0}（{p1} {p2}），执行期限 {p3}。验收要求：{p4}', { p0: it.item, p1: it.dept || '-', p2: it.owner || '-', p3: it.deadline, p4: it.acceptance || '-' })));
    }
    for (const it of escalate) {
      const over = -(daysUntil(it.deadline, now) ?? 0);
      store.update((s) => { const cur = s.ledger.find((x) => x.id === it.id); if (cur) { cur.escalatedFor = cur.deadline; cur.escalated = true; cur.status = 'overdue'; } });
      out.push(this.fire('ledger_overdue', i18nT('改善事项已逾期 {p0} 天，需要升级督办', { p0: over }), i18nT('{p0}（{p1} {p2}），执行期限 {p3}', { p0: it.item, p1: it.dept || '-', p2: it.owner || '-', p3: it.deadline })));
    }
    return out;
  }
}
