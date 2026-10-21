/**
 * 配件预警与补库 · 渲染层共享：动作调用、全局状态、标签、步骤状态推导、表格筛选排序。
 * 各页签只依赖这里，互不 import。
 */
import { ref } from 'vue';
import {
  PA_BLOCKING_GROUPS, PA_STATES,
  type PaDatasetKey, type PaPartResult, type PaPartState, type PaPlanGroup, type PaReview, type PaWorkbenchState,
} from '@totalclaw/ipc-contracts';
import { t as i18nT } from '../../i18n';
import { toPlain } from '../../utils/ipcPlain';
import type { StepRuntime } from '../service-settlement/shared';

export { errorMessage, fmtDateTime, fmtMoney, scrollToStep, droppedPaths, EXCEL_RE } from '../service-settlement/shared';
export type { StepMeta, StepRuntime, PickedTable } from '../service-settlement/shared';

export async function pa<T = any>(action: string, payload?: unknown): Promise<T> {
  const bridge = (window as any).electronAPI?.workbenches?.partsAlert;
  if (!bridge?.invoke) throw new Error(i18nT('配件预警与补库接口不可用，请重启应用'));
  return bridge.invoke(action, toPlain(payload ?? {})) as Promise<T>;
}

export function onPaEvent(cb: (ev: { type: string; payload?: any }) => void): () => void {
  const bridge = (window as any).electronAPI?.workbenches?.partsAlert;
  return bridge?.onEvent ? bridge.onEvent(cb) : () => {};
}

export const paState = ref<PaWorkbenchState | null>(null);
/** 向导里当前这次运算的逐配件结果 */
export const paResults = ref<PaPartResult[]>([]);
/** 最近一次运算（手动或定时）的逐配件结果，预警看板用 */
export const paLatest = ref<PaPartResult[]>([]);
let resultsOf = '';
let latestOf = '';

/** 刷新状态；逐配件结果只在运算换了一次时才重新取 */
export async function refreshState(): Promise<PaWorkbenchState> {
  const s = await pa<PaWorkbenchState>('state.get');
  paState.value = s;
  const runKey = s.run ? s.run.id : '';
  if (runKey !== resultsOf || (runKey && !paResults.value.length)) { paResults.value = runKey ? await pa<PaPartResult[]>('results.get', { which: 'result' }) : []; resultsOf = runKey; }
  const latestKey = s.latest ? s.latest.at : '';
  if (latestKey !== latestOf || (latestKey && !paLatest.value.length)) { paLatest.value = latestKey ? await pa<PaPartResult[]>('results.get', { which: 'latest' }) : []; latestOf = latestKey; }
  return s;
}

export function openPath(path: string, reveal = false): Promise<unknown> {
  return pa('path.open', { path, reveal });
}

// ── 标签 ──────────────────────────────────────────────────────────────────────

export function stateLabel(s: PaPartState): string {
  return { stagnant: i18nT('库存呆滞'), redundant: i18nT('库存冗余'), healthy: i18nT('库存健康'), at_risk: i18nT('库存将缺货'), out_of_stock: i18nT('库存已缺货') }[s];
}
export function stateClass(s: PaPartState): string {
  return { stagnant: 'mute', redundant: 'brand', healthy: 'ok', at_risk: 'warn', out_of_stock: 'bad' }[s];
}
/** 图表里五种状态的固定颜色（与界面上的状态标签同一套语义色） */
export const STATE_COLORS: Record<PaPartState, string> = { out_of_stock: '#e5484d', at_risk: '#f59e0b', stagnant: '#8b8d98', redundant: '#3b82f6', healthy: '#22c55e' };

export function groupLabel(g: PaPlanGroup): string {
  return {
    stagnant: i18nT('呆滞库存处理建议'), redundant: i18nT('冗余库存处理建议'),
    shortage_transit: i18nT('有采购在途的管控举措'), shortage_none: i18nT('无采购在途的管控举措'),
  }[g];
}
export function groupHint(g: PaPlanGroup): string {
  return {
    stagnant: i18nT('有库存但长期没有发货：停止采购、调拨消化，超期的做报废评估'),
    redundant: i18nT('库存够用的时间超过上限：暂停补货，在途的协商延期'),
    shortage_transit: i18nT('缺货或即将缺货，已经下了采购单：盯到货、催交、调拨应急，在途不够的追加'),
    shortage_none: i18nT('缺货或即将缺货，还没有下采购单：按最迟下单日补库，到货前调拨或用替代件'),
  }[g];
}
export function datasetLabel(k: PaDatasetKey): string {
  return { monthly: i18nT('历史发货（按月）'), yearly: i18nT('历史发货（按年）'), leadTime: i18nT('采购提前期'), inTransit: i18nT('采购在途'), stock: i18nT('实时库存') }[k];
}
export function datasetHint(k: PaDatasetKey): string {
  return {
    monthly: i18nT('近 3 年每个月的发货数量。一行一条（配件、月份、数量）或一列一个月份的横表都可以'),
    yearly: i18nT('近 5 年每年的发货数量，用来看年度趋势；没有可以不传'),
    leadTime: i18nT('近 1 年平均采购天数，可带最小起订量、单价、供应商；没有的配件按默认天数'),
    inTransit: i18nT('已下单未到货的采购订单：在途数量、预计到货日期'),
    stock: i18nT('各仓库现在的库存数量；同一配件多个仓库会相加'),
  }[k];
}
export function roleLabel(key: string): string {
  const m: Record<string, string> = {
    partNo: i18nT('配件编码'), partName: i18nT('配件名称'), month: i18nT('月份'), year: i18nT('年份'), shipQty: i18nT('发货数量'),
    leadDays: i18nT('采购提前期（天）'), moq: i18nT('最小起订量'), unitPrice: i18nT('单价'), supplier: i18nT('供应商'),
    transitQty: i18nT('在途数量'), eta: i18nT('预计到货日期'), orderNo: i18nT('采购订单号'), stockQty: i18nT('库存数量'), warehouse: i18nT('仓库'),
  };
  return m[key] || key;
}
export function reviewLabel(st: PaReview['status'] | undefined): string {
  return st === 'confirmed' ? i18nT('已确认') : st === 'rejected' ? i18nT('已驳回') : i18nT('待检验');
}
export const num = (n: unknown, digits = 0): string => {
  const v = Number(n);
  return Number.isFinite(v) ? v.toLocaleString('zh-CN', { minimumFractionDigits: 0, maximumFractionDigits: digits }) : '—';
};
export function todayStr(now = new Date()): string {
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}

// ── 行动计划分组（与主进程 plan.ts 同一条规则） ──────────────────────────────

export function planGroupOf(r: Pick<PaPartResult, 'state' | 'hasInTransit'>): PaPlanGroup | null {
  if (r.state === 'stagnant') return 'stagnant';
  if (r.state === 'redundant') return 'redundant';
  if (r.state === 'at_risk' || r.state === 'out_of_stock') return r.hasInTransit ? 'shortage_transit' : 'shortage_none';
  return null;
}
export function defaultPlanText(r: Pick<PaPartResult, 'actions'>): string {
  return r.actions.map((a, i) => `${i + 1}. ${a.text}`).join('\n');
}

// ── 结果表：筛选、排序 ───────────────────────────────────────────────────────

export type SortKey = 'state' | 'partNo' | 'stockQty' | 'inTransitQty' | 'earliestEta' | 'dailyDemand' | 'coverDays' | 'stockoutDate' | 'leadDays' | 'suggestQty';
export interface ResultQuery { states: PaPartState[]; keyword: string; sort: SortKey; desc: boolean }

/** 空值永远排在最后，不管升序降序 */
function cmp(a: unknown, b: unknown, desc: boolean): number {
  const ea = a === null || a === undefined || a === '';
  const eb = b === null || b === undefined || b === '';
  if (ea || eb) return ea === eb ? 0 : ea ? 1 : -1;
  const v = typeof a === 'number' && typeof b === 'number' ? a - b : String(a).localeCompare(String(b));
  return desc ? -v : v;
}

export function filterSortResults(rows: PaPartResult[], q: ResultQuery): PaPartResult[] {
  const kw = q.keyword.trim().toLowerCase();
  const order = new Map(PA_STATES.map((s, i) => [s, i]));
  const out = rows.filter((r) => (!q.states.length || q.states.includes(r.state))
    && (!kw || r.partNo.toLowerCase().includes(kw) || r.partName.toLowerCase().includes(kw) || r.supplier.toLowerCase().includes(kw)));
  return out.sort((a, b) => {
    const v = q.sort === 'state' ? cmp(order.get(a.state), order.get(b.state), q.desc) : cmp(a[q.sort], b[q.sort], q.desc);
    return v || a.partNo.localeCompare(b.partNo);
  });
}

// ── 向导步骤状态 ─────────────────────────────────────────────────────────────

export const STEP_KEYS = ['pa-feed', 'pa-compute', 'pa-plan', 'pa-replenish', 'pa-order'] as const;
export type StepKey = typeof STEP_KEYS[number];

export function blockingPending(s: PaWorkbenchState): number {
  return PA_BLOCKING_GROUPS.reduce((a, g) => a + (s.pending[g] || 0), 0);
}

/**
 * 每一步的状态都从主进程的真实状态推出来（重开应用能接着做）；
 * 正在跑的那步是「进行中」，出错的那步是「失败」并带上原因。
 */
export function deriveSteps(s: PaWorkbenchState | null, busy: string, errors: Record<string, string>): Record<StepKey, StepRuntime> {
  const live = !!s?.run && !s.run.stale;
  const fed = !!s?.datasets.monthly?.loaded && !!s?.datasets.stock?.loaded;
  const fedCount = s ? (Object.values(s.datasets).filter((d) => d?.loaded).length) : 0;
  const reviewed = live && blockingPending(s!) === 0;
  const selected = s ? s.lines.filter((l) => l.selected) : [];
  const confirmed = live && reviewed && !!s!.run!.replenishConfirmedAt;
  const ex = s?.run?.exported;
  const exported = confirmed && !!ex && ex.at >= s!.run!.replenishConfirmedAt;
  const base: Record<StepKey, StepRuntime> = {
    'pa-feed': fed ? { state: 'done', summary: i18nT('已投喂 {n} 份数据', { n: fedCount }) } : { state: 'todo' },
    'pa-compute': live ? { state: 'done', summary: i18nT('基准日 {p0}，共 {n} 个配件', { p0: s!.run!.asOf, n: s!.run!.summary.total }) } : { state: 'todo' },
    'pa-plan': reviewed ? { state: 'done', summary: i18nT('缺货管控计划已全部检验') } : { state: 'todo' },
    'pa-replenish': confirmed ? { state: 'done', summary: i18nT('已确认 {n} 行补库', { n: selected.length }) } : { state: 'todo' },
    'pa-order': exported ? { state: 'done', summary: i18nT('采购订单已生成：{n} 行', { n: ex!.lines }) } : { state: 'todo' },
  };
  for (const k of STEP_KEYS) {
    if (busy === k) base[k] = { state: 'running' };
    else if (errors[k]) base[k] = { state: 'failed', error: errors[k] };
  }
  return base;
}

/** 当前该做哪一步：第一个没完成的 */
export function currentStep(rt: Record<StepKey, StepRuntime>): StepKey {
  return STEP_KEYS.find((k) => rt[k].state !== 'done') || 'pa-order';
}
