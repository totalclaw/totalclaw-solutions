/**
 * 服务商结算工作台 · 渲染层共享：preload 访问器、步骤状态机、格式化、列角色文案。
 *
 * 四个模块组件都只依赖这里 + 三个小组件（StepCard / FileDropField / TableMapping），
 * 不互相 import，避免一个模块改坏另一个。
 */
import { reactive, ref, nextTick, type Ref } from 'vue';
import { t as i18nT } from '../../i18n';
import { toPlain } from '../../utils/ipcPlain';
import type { StepKind } from '../../composables/useStepWatchdog';

export type StepState = 'todo' | 'running' | 'done' | 'failed' | 'skipped';

export interface StepMeta {
  key: string;
  title: string;
  /** 一句话说明这步干什么（给不懂业务流程的人看） */
  hint?: string;
}

export interface StepRuntime {
  state: StepState;
  error?: string;
  /** 完成后的一句话结果（"12 家服务商，合计 3,450 元"） */
  summary?: string;
  startedAt?: number;
  finishedAt?: number;
  /**
   * 看门狗用（composables/useStepWatchdog）：
   * progressAt = 最近一次收到进度 / 心跳的时刻（有进度事件的宿主写它，没有就空着）；
   * kind / estimateSec = 步骤类型与预计秒数，决定「多久算超时」。都可省略。
   */
  progressAt?: number;
  kind?: StepKind;
  estimateSec?: number;
}

/**
 * 步骤状态机：每步独立状态；失败落在具体那一步；推进时自动滚到当前步骤（UX 硬规则一）。
 */
export function useSteps(metas: StepMeta[]) {
  const runtime = reactive<Record<string, StepRuntime>>(Object.fromEntries(metas.map((m) => [m.key, { state: 'todo' as StepState }])));
  const currentKey = ref(metas[0]?.key || '');

  function set(key: string, patch: Partial<StepRuntime>): void {
    const r = runtime[key];
    if (!r) return;
    Object.assign(r, patch);
  }
  function start(key: string): void {
    set(key, { state: 'running', error: undefined, startedAt: Date.now(), finishedAt: undefined });
    currentKey.value = key;
    void scrollToStep(key);
  }
  function done(key: string, summary?: string): void {
    set(key, { state: 'done', summary, error: undefined, finishedAt: Date.now() });
    const idx = metas.findIndex((m) => m.key === key);
    const next = metas[idx + 1];
    if (next) currentKey.value = next.key;
  }
  function fail(key: string, error: unknown): void {
    set(key, { state: 'failed', error: errorMessage(error), finishedAt: Date.now() });
    currentKey.value = key;
    void scrollToStep(key);
  }
  function reset(key: string): void {
    set(key, { state: 'todo', error: undefined, summary: undefined });
  }
  /** 后面步骤的结果依赖前面的，前面重跑后把后面全部打回待做 */
  function resetAfter(key: string): void {
    const idx = metas.findIndex((m) => m.key === key);
    metas.slice(idx + 1).forEach((m) => {
      if (runtime[m.key].state !== 'todo') reset(m.key);
    });
  }
  function indexOf(key: string): number {
    return metas.findIndex((m) => m.key === key);
  }
  function isRunning(): boolean {
    return metas.some((m) => runtime[m.key].state === 'running');
  }
  return { metas, runtime, currentKey, start, done, fail, reset, resetAfter, indexOf, isRunning, set };
}

export async function scrollToStep(key: string): Promise<void> {
  await nextTick();
  // 四个模块用 v-show 同时挂着，step key（如 rules）会重名：只滚当前可见的那张（display:none 的 offsetParent 为 null）
  const all = Array.from(document.querySelectorAll<HTMLElement>(`[data-step-key="${key}"]`));
  const el = all.find((n) => n.offsetParent !== null) || null;
  if (!el) return;
  try {
    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  } catch {
    el.scrollIntoView();
  }
}

/**
 * 出参一律先 toPlain：contextBridge 在 preload 的 plainClone 之前就会对参数做结构化克隆，
 * Vue 的 reactive Proxy（模块里的 tables / aux / incentive 全是）克隆不了，同步抛
 * "An object could not be cloned"。仓库已在 utils/ipcPlain.ts 记过四次同样的坑。
 */
let apiWrapped: any = null;
let apiWrappedSource: any = null;
export function api(): any {
  const raw = (window as any).electronAPI?.workbenches?.serviceSettlement;
  if (!raw) return raw;
  if (apiWrapped && apiWrappedSource === raw) return apiWrapped;
  // ⚠ 不能用 Proxy 套 contextBridge 对象：桥出来的属性是 non-configurable/non-writable，
  // Proxy 的 get 返回替换后的函数会触发不变量检查直接抛 TypeError（实测 "property 'stateGet' is a read-only…"）。
  // 改成一次性拷成普通对象再包。
  const wrapped: Record<string, unknown> = {};
  for (const key of Object.keys(raw)) {
    const v = raw[key];
    if (typeof v !== 'function' || key === 'onEvent') { wrapped[key] = v; continue; } // 监听器传回调，不能 JSON 往返
    wrapped[key] = (...args: unknown[]) => v(...args.map((a) => toPlain(a)));
  }
  apiWrapped = wrapped;
  apiWrappedSource = raw;
  return wrapped;
}

export function solutionApi(): any {
  return (window as any).electronAPI?.solution;
}

export function errorMessage(e: unknown): string {
  if (!e) return i18nT('未知错误');
  const raw = (e as Error)?.message || String(e);
  return raw.replace(/^Error invoking remote method '[^']+': /, '').replace(/^Error: /, '');
}

export function fmtMoney(n: unknown): string {
  const v = Number(n);
  if (!Number.isFinite(v)) return '-';
  return v.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function fmtPct(n: unknown, digits = 2): string {
  const v = Number(n);
  if (!Number.isFinite(v)) return '-';
  return `${(v * 100).toFixed(digits)}%`;
}

export function fmtDate(iso?: string): string {
  if (!iso) return '';
  const t = Date.parse(iso);
  if (!Number.isFinite(t)) return iso.slice(0, 10);
  const d = new Date(t);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function fmtDateTime(iso?: string): string {
  if (!iso) return '';
  const t = Date.parse(iso);
  if (!Number.isFinite(t)) return iso;
  const d = new Date(t);
  return `${fmtDate(iso)} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

export function currentPeriod(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

/** 列角色 → 给小白看的中文名 */
export const ROLE_LABELS: Record<string, string> = {
  provider: i18nT('服务商'),
  manager: i18nT('区域经理'),
  rating: i18nT('评价星级/结果'),
  badFlag: i18nT('是否差评'),
  satisfaction: i18nT('满意度'),
  evaluable: i18nT('是否可评价'),
  evaluableCount: i18nT('可评价单数'),
  rateY: i18nT('评价率'),
  badRateX: i18nT('差评率'),
  counted: i18nT('是否计取'),
  rated: i18nT('是否已评价'),
  sku: 'SKU',
  orderNo: i18nT('工单/订单号'),
  amount: i18nT('金额'),
  barcode: i18nT('条码'),
  channel: i18nT('渠道'),
  category: i18nT('品类'),
  task: i18nT('季度任务'),
  email: i18nT('邮箱'),
  wecom: i18nT('企微'),
  date: i18nT('日期'),
  quantity: i18nT('数量'),
  status: i18nT('状态'),
  name: i18nT('姓名'),
  idCard: i18nT('身份证号'),
  bankCard: i18nT('银行卡号'),
  bankName: i18nT('开户行'),
  phone: i18nT('手机号'),
};

export interface PickedTable {
  path: string;
  fileName: string;
  sheetName: string;
  sheetNames: string[];
  headers: string[];
  rowCount: number;
  preview: Record<string, string>[];
  mapping: Record<string, string>;
}

export async function inspectTable(path: string, roles: string[], sheetName?: string, preferSheet?: string[]): Promise<PickedTable> {
  const r = await api().inspectTable({ path, roles, sheetName, preferSheet });
  return r as PickedTable;
}

export async function pickFiles(kind: 'excel' | 'pdf' | 'invoice' | 'any' = 'excel', multi = true, title?: string): Promise<string[]> {
  const r = await api().pickFiles({ kind, multi, title });
  return Array.isArray(r?.paths) ? r.paths : [];
}

/**
 * 打开文件 / 在访达里显示。preload 的签名是 `openPath(path, { reveal })`（两个参数），
 * 之前这里传了一个 `{ path, reveal }` 对象 → 主进程拿到的 path 是对象，静默失败（2026-09-04 用户实测按钮没反应）。
 * 失败原因（文件不存在、被占用…）通过通知弹出来，别再静默。
 */
export function openPath(path: string, reveal = false): void {
  const s = solutionApi();
  if (!path) return;
  if (!s?.openPath) { notifyError(i18nT('当前环境不支持打开文件')); return; }
  try {
    Promise.resolve(s.openPath(path, { reveal }))
      .then((r: any) => { if (r && r.ok === false) notifyError(r.error || i18nT('打开失败：{p}', { p: path })); })
      .catch((e: unknown) => notifyError(errorMessage(e)));
  } catch (e) { notifyError(errorMessage(e)); }
}

function notifyError(message: string): void {
  // 懒加载，避免 shared.ts 在无 pinia 的单测环境里 import 期就碰 store
  import('../../stores/notification').then(({ useNotificationStore }) => useNotificationStore().error(message)).catch(() => { /* ignore */ });
}

/** 拖拽进来的 File → 本机路径（Electron 32+ 没有 file.path） */
export function droppedPaths(ev: DragEvent, accept: RegExp): string[] {
  const files = Array.from(ev.dataTransfer?.files || []);
  const getPath = (window as any).electronAPI?.getPathForFile as ((f: File) => string) | undefined;
  const out: string[] = [];
  for (const f of files) {
    const p = getPath ? getPath(f) : (f as any).path || '';
    if (p && accept.test(p)) out.push(p);
  }
  return out;
}

export const EXCEL_RE = /\.(xlsx|xls|xlsm|csv)$/i;
export const PDF_RE = /\.pdf$/i;
export const INVOICE_RE = /\.(pdf|ofd|jpe?g|png|xlsx|zip)$/i;

/** 打开内置浏览器（登录态按 contextId 记忆） */
export async function openEmbeddedBrowser(url: string, contextId: string): Promise<boolean> {
  const tabs = (window as any).electronAPI?.browserTabs;
  if (!tabs?.create) return false;
  const u = url.trim();
  if (!u) return false;
  const full = /^https?:\/\//i.test(u) ? u : `https://${u}`;
  // source 必须是 'agent'：只有它会按 contextId 复用已有 tab 并触发 focus-requested 让侧栏打开；
  // 'user' 建出来的 tab 在侧栏关着时不可见，用户以为没反应（与 WarehouseWorkbench 同做法）
  const tab = await tabs.create({ url: full, contextId, source: 'agent', activate: true });
  if (tab?.id && tabs.setAutomationPaused) { try { await tabs.setAutomationPaused(tab.id, true); } catch { /* 无自动化，忽略 */ } }
  try { await tabs.setVisible?.(true); } catch { /* ignore */ }
  return true;
}

/** 内置浏览器最近下载完成的表格文件（从费控 / 有赞 / CSS 导出来的） */
export async function recentBrowserDownloads(): Promise<{ path: string; filename: string; finishedAt?: number }[]> {
  const tabs = (window as any).electronAPI?.browserTabs;
  if (!tabs?.list) return [];
  try {
    const snap = await tabs.list();
    const downloads = Array.isArray(snap?.downloads) ? snap.downloads : [];
    return downloads
      .filter((d: any) => d.state === 'completed' && d.savePath && EXCEL_RE.test(d.savePath))
      .sort((a: any, b: any) => (b.finishedAt || 0) - (a.finishedAt || 0))
      .slice(0, 20)
      .map((d: any) => ({ path: d.savePath, filename: d.filename || d.savePath.split(/[\\/]/).pop(), finishedAt: d.finishedAt }));
  } catch {
    return [];
  }
}

export type AsyncRef<T> = Ref<T | null>;
