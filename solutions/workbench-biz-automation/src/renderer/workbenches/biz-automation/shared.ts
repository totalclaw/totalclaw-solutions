/**
 * 经营自动化智能体 · 渲染层共享：动作调用、全局状态、模型清单、格式化、交给发布工作流 / 数字员工。
 * 各模块 tab 只依赖这里，互不 import。
 */
import { reactive, ref } from 'vue';
import type { ApGarment, BaModelOption, BaModuleKey, BaPublishPlatform, BaState, BaVideoType } from '@totalclaw/ipc-contracts';
import { t as i18nT } from '../../i18n';
import { toPlain } from '../../utils/ipcPlain';
import { FIXED_VIDEO_PUBLISH_WORKFLOW_ID, buildVideoPublishWorkflow, setWorkflowAutoRun } from '../../composables/workflowAutoRun';

export { errorMessage, fmtDateTime, fmtMoney, fmtPct, scrollToStep } from '../service-settlement/shared';
export type { StepMeta, StepRuntime } from '../service-settlement/shared';
export { fileUrl } from '../foreign-trade/shared';

export async function ba<T = any>(action: string, payload?: unknown): Promise<T> {
  const bridge = (window as any).electronAPI?.workbenches?.bizAutomation;
  if (!bridge?.invoke) throw new Error(i18nT('经营自动化智能体接口不可用，请重启应用'));
  return bridge.invoke(action, toPlain(payload ?? {})) as Promise<T>;
}

export function onBaEvent(cb: (ev: { type: string; payload?: any }) => void): () => void {
  const bridge = (window as any).electronAPI?.workbenches?.bizAutomation;
  return bridge?.onEvent ? bridge.onEvent(cb) : () => {};
}

export const baState = ref<BaState | null>(null);
export const baGarments = ref<ApGarment[]>([]);
export const baModels = reactive<{ options: BaModelOption[]; defaultLabel: string; loaded: boolean }>({ options: [], defaultLabel: '', loaded: false });
export const baProgress = reactive<Record<string, string>>({});

// ── 成片看门狗（composables/useStepWatchdog）要的两个时刻，都放模块级：换 tab / 重挂载回来不归零 ──
/** 本窗口里点「开始成片」的时刻（项目 id → ms） */
export const baRenderStartedAt = reactive<Record<string, number>>({});
/** 各模块最近一次收到主进程进度事件的时刻（模块 key → ms）；主进程进度按模块推，不带项目 id */
export const baProgressAt = reactive<Record<string, number>>({});
let trackedBridge: unknown = null;
let trackedOff: (() => void) | null = null;
/** 每个桥对象只订阅一次、随窗口活到底：VideoTab / AvatarTab 的 setup 里调一下即可 */
export function ensureBaProgressTracking(): void {
  const bridge = (window as any).electronAPI?.workbenches?.bizAutomation;
  if (!bridge?.onEvent || bridge === trackedBridge) return; // 桥还没好就下次再试；同一个桥不重复订阅
  trackedOff?.();
  trackedBridge = bridge;
  trackedOff = onBaEvent((ev) => {
    if (ev.type === 'progress' && ev.payload?.key) baProgressAt[String(ev.payload.key)] = Date.now();
  });
}
export function noteRenderStarted(id: string): void { baRenderStartedAt[id] = Date.now(); }
/**
 * 成片这一步的真实开始时刻：本窗口里记的优先；换页 / 刷新后拿主进程把状态改成 rendering
 * 那一刻的 updatedAt（patchVideo / patchAvatar 每次都盖 updatedAt，rendering 期间没有别的 patch）。
 */
export function renderStartedAt(p: { id: string; status: string; updatedAt?: string }): number | undefined {
  const local = baRenderStartedAt[p.id] || 0;
  // 主进程那边的 rendering 转换比本地记的晚（定时任务起的成片、或上一轮本地记录已过期）就以它为准
  const remote = p.status === 'rendering' && p.updatedAt ? Date.parse(p.updatedAt) : NaN;
  const best = Math.max(local, Number.isFinite(remote) ? remote : 0);
  return best > 0 ? best : undefined;
}

export async function refreshState(): Promise<BaState> {
  const [s, g] = await Promise.all([ba<BaState>('state.get'), ba<ApGarment[]>('garments.list')]);
  baState.value = s;
  baGarments.value = g;
  return s;
}

export async function loadModels(): Promise<void> {
  try {
    const r = await ba<{ options: BaModelOption[]; defaultLabel: string }>('models.list');
    baModels.options = r.options;
    baModels.defaultLabel = r.defaultLabel;
  } finally { baModels.loaded = true; }
}

export function modelGroups(): Array<{ group: string; options: BaModelOption[] }> {
  const out: Array<{ group: string; options: BaModelOption[] }> = [];
  for (const o of baModels.options) {
    const g = o.group || o.provider;
    let b = out.find((x) => x.group === g);
    if (!b) { b = { group: g, options: [] }; out.push(b); }
    b.options.push(o);
  }
  return out;
}

export function modelLabel(v?: string): string {
  if (!v) return baModels.defaultLabel || i18nT('系统默认模型');
  return baModels.options.find((o) => o.value === v)?.label || v;
}

export function platformLabel(p: BaPublishPlatform): string {
  return { douyin: i18nT('抖音'), kuaishou: i18nT('快手'), xiaohongshu: i18nT('小红书'), wxchannels: i18nT('视频号') }[p];
}

export function videoTypeLabel(t: BaVideoType): string {
  return { new_arrival: i18nT('新品上新'), multi_look: i18nT('一衣多搭'), store_tour: i18nT('门店探店'), promotion: i18nT('促销活动'), styling_tips: i18nT('穿搭教程') }[t];
}

export function moduleTitle(k: BaModuleKey): string {
  return { video: i18nT('短视频发布'), avatar: i18nT('数字人介绍'), listing: i18nT('商品上下架'), finance: i18nT('经营数据') }[k];
}

export function garmentName(id: string): string {
  return baGarments.value.find((g) => g.id === id)?.name || i18nT('已删除的商品');
}

export function openPath(path: string, reveal = false): Promise<unknown> {
  return ba('path.open', { path, reveal });
}

export async function pickFiles(kind: 'excel' | 'image', multi = false): Promise<string[]> {
  const r = await ba<string[]>('files.pick', { kind, multi });
  return Array.isArray(r) ? r : [];
}

/** 交给现成的「视频发布」固定流程（与短视频工作台同一条链路），返回后跳到工作流页 */
export async function startPublishWorkflow(input: { videoPath: string; projectName: string; platforms: string; topics: string; caption: string }, videoId?: string): Promise<void> {
  const api = (window as any).electronAPI;
  if (!api?.saveWorkflow || !api?.runWorkflow) throw new Error(i18nT('当前版本未开放工作流运行'));
  const full = { ...input, workflowSource: 'biz-automation', returnPath: '/workbenches/biz-automation', returnLabel: i18nT('返回经营自动化智能体') };
  await api.saveWorkflow(buildVideoPublishWorkflow(full));
  setWorkflowAutoRun(FIXED_VIDEO_PUBLISH_WORKFLOW_ID, full);
  if (videoId) {
    try { localStorage.setItem(PENDING_PUBLISH_KEY, JSON.stringify({ videoId, startedAt: Date.now() })); } catch { /* 本地存储不可用：发布照常，只是回执要手动标 */ }
  }
}

/**
 * 发布结果回写。
 *
 * 发布在工作流运行页里跑，运行页在 run:completed / failed / cancelled 时把结果写进
 * `totalclaw:publish-workflow-result:biz-automation`（只有 workflowId / runId / 回执变量，不知道是哪条视频）。
 * 所以发起时另记一条「哪条视频在发」，回到工作台时两者对上就交给主进程记账：
 * 视频状态改成已发布 / 退回已审核，回执与节点留痕进历史记录。
 */
const PENDING_PUBLISH_KEY = 'totalclaw:biz-automation:pending-publish:v1';
const PUBLISH_RESULT_KEY = 'totalclaw:publish-workflow-result:biz-automation';
export async function consumePublishResult(): Promise<boolean> {
  let pending: { videoId?: string; startedAt?: number } | null = null;
  let result: { runId?: string; kind?: string; finalVariables?: Record<string, unknown>; at?: number } | null = null;
  try {
    pending = JSON.parse(localStorage.getItem(PENDING_PUBLISH_KEY) || 'null');
    result = JSON.parse(localStorage.getItem(PUBLISH_RESULT_KEY) || 'null');
  } catch { return false; }
  if (!pending?.videoId || !result?.kind) return false;
  // 回执比这次发起还早 = 上一轮留下的，不能记到这条视频头上（允许 5 秒时钟误差）
  if (Number(result.at || 0) < Number(pending.startedAt || 0) - 5_000) return false;
  let receipt: unknown = null;
  try { receipt = JSON.parse(String(result.finalVariables?.node_receipt_result || 'null')); } catch { receipt = null; }
  await ba('video.publishResult', { id: pending.videoId, runId: result.runId, kind: result.kind, receipt, at: result.at });
  try { localStorage.removeItem(PENDING_PUBLISH_KEY); } catch { /* 忽略 */ }
  return true;
}

/** 交给数字员工（单聊通用助手）执行一段指令，返回会话 id */
export async function handToDigitalEmployee(title: string, text: string): Promise<string> {
  const api = (window as any).electronAPI;
  if (!api?.conversation?.create) throw new Error(i18nT('当前版本不支持交给数字员工'));
  const conv = await api.conversation.create({ kind: 'single', members: ['general_assistant'], title, initialMessage: text });
  void api.conversation.sendMessage(conv.id, text);
  return String(conv.id);
}
