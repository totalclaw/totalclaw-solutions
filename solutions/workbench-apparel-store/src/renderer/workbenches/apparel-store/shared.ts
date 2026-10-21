/**
 * 服装实体店智能体 · 渲染层共享：动作调用、全局状态、选项库、格式化。
 * 各 tab 只依赖这里（和结算工作台的 StepCard / StickyProgress），tab 之间互不 import。
 */
import { reactive, ref } from 'vue';
import type { ApAudience, ApState, ApStats, ApStyleChoice, ApStyleKind, ApStyleOption, ApTryonStatus, ApVisitStatus } from '@totalclaw/ipc-contracts';
import { t as i18nT } from '../../i18n';
import { toPlain } from '../../utils/ipcPlain';

export { errorMessage, fmtDateTime, fmtPct, scrollToStep, droppedPaths } from '../service-settlement/shared';

export const IMAGE_RE = /\.(jpe?g|png|webp|heic|bmp)$/i;
export type { StepMeta, StepRuntime } from '../service-settlement/shared';
export { fileUrl } from '../foreign-trade/shared';

export async function ap<T = any>(action: string, payload?: unknown): Promise<T> {
  const bridge = (window as any).electronAPI?.workbenches?.apparelStore;
  if (!bridge?.invoke) throw new Error(i18nT('服装实体店智能体接口不可用，请重启应用'));
  return bridge.invoke(action, toPlain(payload ?? {})) as Promise<T>;
}

export function onApEvent(cb: (ev: { type: string; payload?: any }) => void): () => void {
  const bridge = (window as any).electronAPI?.workbenches?.apparelStore;
  return bridge?.onEvent ? bridge.onEvent(cb) : () => {};
}

export const apState = ref<ApState | null>(null);
export const apOptions = ref<ApStyleOption[]>([]);
export const apStats = ref<ApStats | null>(null);
export const apProgress = reactive<{ message: string }>({ message: '' });

/**
 * 试穿队列的「心跳」：最近一次收到主进程 progress / state 事件的时刻（模块级，换 tab 回来不丢）。
 * 主进程按全局队列推事件、不带顾客 id —— 队列有动静（某张完成 / 失败 / 开始）就说明它没死，
 * 看门狗据此不判「可能已超时」。
 */
export const apQueueProgressAt = ref(0);
let trackedBridge: unknown = null;
let trackedOff: (() => void) | null = null;
/** 每个桥对象只订阅一次、随窗口活到底：TryonFlow 的 setup 里调一下即可 */
export function ensureApProgressTracking(): void {
  const bridge = (window as any).electronAPI?.workbenches?.apparelStore;
  if (!bridge?.onEvent || bridge === trackedBridge) return;
  trackedOff?.();
  trackedBridge = bridge;
  trackedOff = onApEvent((ev) => {
    if (ev.type === 'progress' || ev.type === 'state') apQueueProgressAt.value = Date.now();
  });
}

/** 这批待生成试穿里最早的入队 / 开始时刻（ms）：第 ⑤ 步的真实开始时刻，刷新 / 换页回来照样从它算 */
export function earliestPendingAt(tryons: Array<{ status: string; createdAt?: string; startedAt?: string }>): number | undefined {
  let best = Number.POSITIVE_INFINITY;
  for (const t of tryons) {
    if (t.status !== 'queued' && t.status !== 'running') continue;
    const at = Date.parse((t.status === 'running' && t.startedAt) || t.createdAt || '');
    if (Number.isFinite(at) && at < best) best = at;
  }
  return Number.isFinite(best) ? best : undefined;
}

export async function refreshState(): Promise<ApState> {
  const s = await ap<ApState>('state.get');
  apState.value = s;
  return s;
}

export async function loadOptions(): Promise<void> {
  apOptions.value = await ap<ApStyleOption[]>('options.list');
}

export async function refreshStats(): Promise<void> {
  apStats.value = await ap<ApStats>('stats.get');
}

export function optionById(id: string | undefined): ApStyleOption | undefined {
  return apOptions.value.find((o) => o.id === id);
}

export function optionsOf(kind: ApStyleKind, audience?: ApAudience | null): ApStyleOption[] {
  return apOptions.value.filter((o) => o.kind === kind && (!audience || o.audience.includes(audience)));
}

/** 「咖啡馆 · 窗边暖光座位」 */
export function choicePart(id: string | undefined, variant?: string): string {
  const o = optionById(id);
  if (!o) return '';
  const v = o.variants.find((x) => x.id === variant);
  return v ? `${o.label} · ${v.label}` : o.label;
}

export function choiceLabel(c: ApStyleChoice): string {
  return [choicePart(c.backgroundId, c.backgroundVariant), choicePart(c.poseId, c.poseVariant), choicePart(c.hairId, c.hairVariant)].filter(Boolean).join(' / ');
}

export function kindLabel(k: ApStyleKind): string {
  return { background: i18nT('背景'), pose: i18nT('姿势'), hair: i18nT('发型') }[k];
}

export function audienceLabel(a: ApAudience): string {
  return { women: i18nT('女装'), men: i18nT('男装'), kids: i18nT('童装') }[a];
}

export function bodyShapeLabel(s: string): string {
  return ({ pear: i18nT('梨形'), apple: i18nT('苹果形'), hourglass: i18nT('沙漏形'), rectangle: i18nT('直筒形'), inverted_triangle: i18nT('倒三角形') } as Record<string, string>)[s] || i18nT('未判断');
}

export function statusLabel(s: ApTryonStatus): string {
  return { queued: i18nT('排队中'), running: i18nT('生成中'), done: i18nT('已完成'), failed: i18nT('失败') }[s];
}

export function visitLabel(s: ApVisitStatus): string {
  return { prepared: i18nT('已备货'), tried: i18nT('已试穿'), purchased: i18nT('已成交'), left: i18nT('未成交') }[s];
}

export function modelLabel(m: string): string {
  return ({ 'fal-ai/nano-banana/edit': 'Nano Banana Edit', 'fal-ai/bytedance/seedream/v4/edit': 'Seedream 4 Edit' } as Record<string, string>)[m] || m;
}

export async function pickImages(multi = true, title?: string): Promise<string[]> {
  const r = await ap<string[]>('files.pick', { multi, title });
  return Array.isArray(r) ? r : [];
}

export function openPath(path: string, reveal = false): Promise<unknown> {
  return ap('path.open', { path, reveal });
}

export function stockTotal(stock: Record<string, number>): number {
  return Object.values(stock || {}).reduce((s, n) => s + (Number(n) || 0), 0);
}

/** 带门店名与试穿码的水印图（画在 canvas 上导出 dataURL，给「复制 / 另存」用） */
export async function watermarked(src: string, text: string): Promise<string> {
  // 不能用 <img src="totalclaw-media://…"> 直接画：该协议对页面是跨源，画进去 canvas 即被污染，
  // toDataURL 抛「Tainted canvases may not be exported」（导出全部试穿图 / 复制带水印都会炸）。
  // 先 fetch 拿字节再从 Blob 解码，位图不带来源，canvas 保持可导出。
  const res = await fetch(src);
  if (!res.ok) throw new Error(i18nT('读取试穿图失败（{status}）', { status: String(res.status) }));
  const img = await createImageBitmap(await res.blob());
  const cv = document.createElement('canvas');
  cv.width = img.width;
  cv.height = img.height;
  const g = cv.getContext('2d')!;
  g.drawImage(img, 0, 0);
  img.close();
  const fs = Math.max(14, Math.round(cv.width / 32));
  g.font = `700 ${fs}px -apple-system, "PingFang SC", sans-serif`;
  const w = g.measureText(text).width + fs * 1.2;
  const h = fs * 1.9;
  const x = cv.width - w - fs * 0.8;
  const y = cv.height - h - fs * 0.8;
  g.fillStyle = 'rgba(0,0,0,.45)';
  g.beginPath();
  (g as any).roundRect ? (g as any).roundRect(x, y, w, h, h / 2) : g.rect(x, y, w, h);
  g.fill();
  g.fillStyle = '#fff';
  g.textBaseline = 'middle';
  g.fillText(text, x + fs * 0.6, y + h / 2);
  return cv.toDataURL('image/jpeg', 0.92);
}
