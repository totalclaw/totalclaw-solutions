/**
 * 流程时效监控智能体 · 渲染层共享：动作调用、全局状态、标签与格式。
 * 各页签只依赖这里，互不 import。
 */
import { ref } from 'vue';
import type { FsFlowResult, FsLedgerStatus, FsPeriod, FsPeriodKind, FsReasonCategory, FsSlot, FsState } from '@totalclaw/ipc-contracts';
import { t as i18nT } from '../../i18n';
import { toPlain } from '../../utils/ipcPlain';

export { errorMessage, fmtDateTime, scrollToStep, useSteps } from '../service-settlement/shared';
export type { StepMeta, StepRuntime } from '../service-settlement/shared';

export async function fs<T = any>(action: string, payload?: unknown): Promise<T> {
  const bridge = (window as any).electronAPI?.workbenches?.flowSla;
  if (!bridge?.invoke) throw new Error(i18nT('流程时效监控接口不可用，请重启应用'));
  return bridge.invoke(action, toPlain(payload ?? {})) as Promise<T>;
}

export function onFsEvent(cb: (ev: { type: string; payload?: any }) => void): () => void {
  const bridge = (window as any).electronAPI?.workbenches?.flowSla;
  return bridge?.onEvent ? bridge.onEvent(cb) : () => {};
}

export const fsState = ref<FsState | null>(null);

export async function refreshState(): Promise<FsState> {
  const s = await fs<FsState>('state.get');
  fsState.value = s;
  return s;
}

export function openPath(path: string, reveal = false): Promise<unknown> {
  return fs('path.open', { path, reveal });
}

export const fileName = (p: string): string => String(p || '').split(/[\\/]/).pop() || p;

// ── 格式 ─────────────────────────────────────────────

export const fmtRate = (r: number | null | undefined): string => (r == null ? '-' : `${(Math.round(r * 1000) / 10).toFixed(1)}%`);
export const fmtDays = (d: number | null | undefined): string => (d == null ? '-' : String(Math.round(d * 100) / 100));
export const fmtSigned = (n: number | null | undefined): string => (n == null ? '-' : `${n > 0 ? '+' : ''}${Math.round(n * 100) / 100}`);
/** 合规率的变化：换成百分点 */
export const fmtPoints = (n: number | null | undefined): string => (n == null ? '-' : `${n > 0 ? '+' : ''}${(Math.round(n * 1000) / 10).toFixed(1)}`);

const pad = (n: number): string => String(n).padStart(2, '0');
/** 毫秒 → <input type="date"> 用的 YYYY-MM-DD（本地时间） */
export function toDateInput(ms: number): string {
  const d = new Date(ms);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}
/** YYYY-MM-DD → 当天 0 点的毫秒（本地时间）；写得不对返回 NaN */
export function fromDateInput(s: string): number {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(s || ''));
  return m ? new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3])).getTime() : NaN;
}
export function fmtTime(ms: number | null | undefined): string {
  if (!ms) return '';
  const d = new Date(ms);
  return `${toDateInput(ms)} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

// ── 统计周期 ─────────────────────────────────────────

export interface PeriodForm { kind: FsPeriodKind; start: string; lastDay: string; asOf: string }

/** 周报默认上周一到周日，月报默认上个月；界面上填的是起止两天（都含） */
export function defaultPeriodForm(kind: FsPeriodKind, now = Date.now()): PeriodForm {
  const d = new Date(now); d.setHours(0, 0, 0, 0);
  if (kind === 'monthly') {
    const start = new Date(d.getFullYear(), d.getMonth() - 1, 1);
    const last = new Date(d.getFullYear(), d.getMonth(), 0);
    return { kind, start: toDateInput(start.getTime()), lastDay: toDateInput(last.getTime()), asOf: toDateInput(now) };
  }
  const back = (d.getDay() + 6) % 7;
  const start = new Date(d.getFullYear(), d.getMonth(), d.getDate() - back - 7);
  const last = new Date(d.getFullYear(), d.getMonth(), d.getDate() - back - 1);
  return { kind, start: toDateInput(start.getTime()), lastDay: toDateInput(last.getTime()), asOf: toDateInput(now) };
}

/** 表单 → 发给主进程的周期（结束为最后一天的次日 0 点；数据截至那天的最后一刻，不超过现在） */
export function periodFromForm(f: PeriodForm, now = Date.now()): FsPeriod {
  const start = fromDateInput(f.start);
  const last = fromDateInput(f.lastDay);
  if (!Number.isFinite(start) || !Number.isFinite(last)) throw new Error(i18nT('请填写统计周期的起止日期'));
  if (last < start) throw new Error(i18nT('统计周期的结束日期不能早于开始日期'));
  const endDate = new Date(last); endDate.setDate(endDate.getDate() + 1);
  const asOfDay = fromDateInput(f.asOf);
  const asOfEnd = Number.isFinite(asOfDay) ? asOfDay + 86_400_000 - 1000 : now;
  return { kind: f.kind, start, end: endDate.getTime(), asOf: Math.min(asOfEnd, now), label: '' };
}

export function formFromPeriod(p: FsPeriod): PeriodForm {
  const last = new Date(p.end); last.setDate(last.getDate() - 1);
  return { kind: p.kind, start: toDateInput(p.start), lastDay: toDateInput(last.getTime()), asOf: toDateInput(p.asOf) };
}

// ── 标签 ─────────────────────────────────────────────

export const kindLabel = (k: FsPeriodKind): string => (k === 'monthly' ? i18nT('月报') : i18nT('周报'));

export function roleLabel(key: string): string {
  const m: Record<string, string> = {
    flowNo: i18nT('单号'), flowName: i18nT('流程名称 / 事务类型'), feeType: i18nT('费用类型'), title: i18nT('标题'), initiator: i18nT('发起人'), dept: i18nT('部门'),
    status: i18nT('状态'), startAt: i18nT('流程开始时间'), endAt: i18nT('流程结束时间'), amount: i18nT('金额'), currentNode: i18nT('当前节点'), currentHandler: i18nT('当前处理人'),
    node: i18nT('节点 / 环节名称'), handler: i18nT('处理人 / 审核人'), nodeStart: i18nT('节点到达时间'), nodeEnd: i18nT('节点完成时间'),
    name: i18nT('姓名'), email: i18nT('邮箱'), identity: i18nT('身份'),
  };
  return m[key] || key;
}

const FLOW_ROLES = ['flowNo', 'flowName', 'feeType', 'title', 'initiator', 'dept', 'status', 'startAt', 'endAt', 'amount', 'currentNode', 'currentHandler'];
const NODE_ROLES = ['node', 'handler', 'nodeStart', 'nodeEnd'];

/**
 * 一张表要对哪些列、哪些必填。和主进程 ingest.ts 的 missingRoles 同一口径：
 * 有节点名称列和节点到达时间的表是节点级的，必填单号 / 节点 / 处理人 / 到达时间；
 * 没有单独的流程表时（或它放在流程表位置上）还必须有流程名称。
 */
export function roleDefs(slot: FsSlot, mapping: Record<string, string>, hasFlowTable: boolean): Array<{ key: string; label: string; required: boolean }> {
  if (slot === 'roster') return ['name', 'dept', 'email', 'identity'].map((key) => ({ key, label: roleLabel(key), required: key === 'name' }));
  const nodeLevel = slot === 'node' || (!!mapping.node && !!mapping.nodeStart);
  if (!nodeLevel) return [...FLOW_ROLES, ...NODE_ROLES].map((key) => ({ key, label: roleLabel(key), required: ['flowNo', 'flowName', 'startAt'].includes(key) }));
  const need = new Set(['flowNo', 'node', 'handler', 'nodeStart']);
  if (!hasFlowTable || slot === 'flow') need.add('flowName');
  return [...NODE_ROLES, ...FLOW_ROLES].map((key) => ({ key, label: roleLabel(key), required: need.has(key) }));
}

export function missingRoles(slot: FsSlot, mapping: Record<string, string>, hasFlowTable: boolean): string[] {
  return roleDefs(slot, mapping, hasFlowTable).filter((r) => r.required && !mapping[r.key]).map((r) => r.key);
}

export function reasonCategoryLabel(id: FsReasonCategory | ''): string {
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

export function flowStateLabel(f: Pick<FsFlowResult, 'status' | 'overtime' | 'runningLabel'>): string {
  if (f.status === 'done') return f.overtime === true ? i18nT('办结超时') : f.overtime === false ? i18nT('办结合规') : i18nT('办结（无时效要求）');
  if (f.runningLabel === 'overdue') return i18nT('在途已逾期');
  if (f.runningLabel === 'risk') return i18nT('较大逾期风险');
  if (f.runningLabel === 'no_limit') return i18nT('在途（无时效要求）');
  return i18nT('在途正常');
}
export function flowStateClass(f: Pick<FsFlowResult, 'status' | 'overtime' | 'runningLabel'>): string {
  if (f.overtime === true || f.runningLabel === 'overdue') return 'bad';
  if (f.runningLabel === 'risk') return 'warn';
  if (f.overtime === false) return 'ok';
  return '';
}

export function ledgerStatusLabel(s: FsLedgerStatus): string {
  return { doing: i18nT('进行中'), done: i18nT('已完成'), overdue: i18nT('逾期'), archived: i18nT('已归档') }[s];
}
export function ledgerStatusClass(s: FsLedgerStatus): string {
  return { doing: 'brand', done: 'ok', overdue: 'bad', archived: '' }[s];
}

/** 期限距今天几天（当天 0，过了为负）；没写期限返回 null */
export function daysLeft(deadline: string, now = Date.now()): number | null {
  const d = fromDateInput(deadline);
  if (!Number.isFinite(d)) return null;
  return Math.round((d - fromDateInput(toDateInput(now))) / 86_400_000);
}

/** 把一段收件人拆开数一数（逗号、分号、空白、换行都算分隔） */
export function countRecipients(raw: string): { ok: number; bad: string[] } {
  const parts = String(raw || '').split(/[,;，；\s]+/).map((s) => s.trim()).filter(Boolean);
  const bad = parts.filter((p) => !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(p));
  return { ok: new Set(parts.filter((p) => !bad.includes(p))).size, bad };
}
