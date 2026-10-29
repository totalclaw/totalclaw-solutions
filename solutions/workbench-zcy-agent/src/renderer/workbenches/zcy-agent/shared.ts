/**
 * 「政采云」助手 · 渲染层共享：动作调用、全局状态、标签、交给数字员工与读回结果。
 * 各页签只依赖这里，互不 import。
 */
import { ref } from 'vue';
import type { ZcInquiryStatus, ZcOrderStatus, ZcProductStatus, ZcState } from '@totalclaw/ipc-contracts';
import { t as i18nT } from '../../i18n';
import { toPlain } from '../../utils/ipcPlain';

export { errorMessage, fmtDateTime, scrollToStep } from '../service-settlement/shared';
export type { StepMeta, StepRuntime } from '../service-settlement/shared';
export { handToDigitalEmployee } from '../biz-automation/shared';

export async function zc<T = any>(action: string, payload?: unknown): Promise<T> {
  const bridge = (window as any).electronAPI?.workbenches?.zcyAgent;
  if (!bridge?.invoke) throw new Error(i18nT('「政采云」助手接口不可用，请重启应用'));
  return bridge.invoke(action, toPlain(payload ?? {})) as Promise<T>;
}

export function onZcEvent(cb: (ev: { type: string; payload?: any }) => void): () => void {
  const bridge = (window as any).electronAPI?.workbenches?.zcyAgent;
  return bridge?.onEvent ? bridge.onEvent(cb) : () => {};
}

export const zcState = ref<ZcState | null>(null);

export async function refreshState(): Promise<ZcState> {
  const s = await zc<ZcState>('state.get');
  zcState.value = s;
  return s;
}

/**
 * 做任何网页上的事之前先打开政采云确认：登录着没有、是不是还在入驻。
 * 20 分钟内读过就不重复读；needFormal = 这件事要正式供应商才做得了（上架）。
 */
export async function ensureSite(needFormal = false): Promise<void> {
  let wb = zcState.value?.workbench || null;
  const fresh = !!wb && Date.now() - Date.parse(wb.readAt) < 20 * 60_000;
  if (!wb || !fresh || !wb.loggedIn) { wb = await zc('site.readWorkbench'); await refreshState(); }
  if (!wb?.loggedIn) throw new Error(i18nT('政采云还没有登录：请先到「账号与材料」登录，再回来操作'));
  if (needFormal && wb.temporary) throw new Error(i18nT('这个账号还是{p0}，进不了商品中心：请先在「账号与材料」里完成入驻', { p0: wb.identity || i18nT('临时供应商') }));
}

/** 数字员工在这段对话里的最后一条回复（读回订单 / 询价单用） */
export async function lastReply(conversationId: string): Promise<string> {
  const api = (window as any).electronAPI?.conversation;
  if (!api?.getTranscript) throw new Error(i18nT('当前版本读不到对话记录，请把数字员工的回复粘贴进来'));
  const rows = await api.getTranscript(conversationId);
  const list: any[] = Array.isArray(rows) ? rows : [];
  for (let i = list.length - 1; i >= 0; i -= 1) {
    const m = list[i] || {};
    if (m.role !== 'user' && String(m.content || '').trim()) return String(m.content);
  }
  throw new Error(i18nT('数字员工还没有回复，等它读完再点'));
}

export function productStatusLabel(s: ZcProductStatus): string {
  return { draft: i18nT('草稿'), confirmed: i18nT('已确认'), handed: i18nT('数字员工处理中'), submitted: i18nT('已提交审核'), listed: i18nT('已上架'), rejected: i18nT('被驳回'), delisted: i18nT('已下架') }[s];
}
export function inquiryStatusLabel(s: ZcInquiryStatus): string {
  return { new: i18nT('待算价'), priced: i18nT('已算价'), confirmed: i18nT('已确认'), handed: i18nT('数字员工处理中'), submitted: i18nT('已提交报价'), won: i18nT('已成交'), lost: i18nT('未成交'), skipped: i18nT('不参与') }[s];
}
export function orderStatusLabel(s: ZcOrderStatus): string {
  return { to_accept: i18nT('待接单'), to_ship: i18nT('待发货'), shipped: i18nT('已发货'), to_settle: i18nT('待结算'), to_invoice: i18nT('待开票'), done: i18nT('已完成'), closed: i18nT('已关闭') }[s];
}
export const money = (n: number): string => (Number(n) || 0).toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
export const pct = (r: number): string => `${Math.round(r * 10000) / 100}%`;

export function deadlineText(iso: string): string {
  if (!iso) return i18nT('未知');
  const d = new Date(iso);
  if (!Number.isFinite(d.getTime())) return i18nT('未知');
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`;
}

export function openPath(path: string, reveal = false): Promise<unknown> {
  return zc('path.open', { path, reveal });
}
