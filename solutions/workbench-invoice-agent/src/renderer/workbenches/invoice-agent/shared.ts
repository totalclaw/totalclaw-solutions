/**
 * 发票智能体 · 渲染层共享：动作调用、全局状态、标签。
 * 各页签只依赖这里，互不 import。
 */
import { ref } from 'vue';
import type { IvDraftStatus, IvState } from '@totalclaw/ipc-contracts';
import { t as i18nT } from '../../i18n';
import { toPlain } from '../../utils/ipcPlain';

export { errorMessage, fmtDateTime, fmtMoney, scrollToStep } from '../service-settlement/shared';
export type { StepMeta, StepRuntime } from '../service-settlement/shared';

export async function iv<T = any>(action: string, payload?: unknown): Promise<T> {
  const bridge = (window as any).electronAPI?.workbenches?.invoiceAgent;
  if (!bridge?.invoke) throw new Error(i18nT('发票智能体接口不可用，请重启应用'));
  return bridge.invoke(action, toPlain(payload ?? {})) as Promise<T>;
}

export function onIvEvent(cb: (ev: { type: string; payload?: any }) => void): () => void {
  const bridge = (window as any).electronAPI?.workbenches?.invoiceAgent;
  return bridge?.onEvent ? bridge.onEvent(cb) : () => {};
}

export const ivState = ref<IvState | null>(null);
/** 向导当前处理的批次 */
export const ivBatchId = ref('');

export async function refreshState(): Promise<IvState> {
  const s = await iv<IvState>('state.get');
  ivState.value = s;
  if (ivBatchId.value && !s.batches.some((b) => b.id === ivBatchId.value)) ivBatchId.value = '';
  return s;
}

export function fieldLabel(key: string): string {
  const m: Record<string, string> = {
    buyerName: i18nT('购买方名称'), buyerTaxNo: i18nT('购买方税号'), itemName: i18nT('项目名称'), amount: i18nT('金额'), qty: i18nT('数量'), price: i18nT('单价'),
    taxRate: i18nT('税率'), taxIncluded: i18nT('是否含税'), spec: i18nT('规格型号'), unit: i18nT('单位'), kind: i18nT('发票类型'), orderNo: i18nT('订单号'), remark: i18nT('备注'),
    buyerAddress: i18nT('购买方地址'), buyerPhone: i18nT('购买方电话'), buyerBank: i18nT('购买方开户银行'), buyerBankAccount: i18nT('购买方银行账号'), email: i18nT('邮箱'), mobile: i18nT('手机号'),
  };
  return m[key] || key;
}

export function statusLabel(s: IvDraftStatus): string {
  return { draft: i18nT('草稿'), confirmed: i18nT('已确认'), handed: i18nT('开具中'), issued: i18nT('已开具'), failed: i18nT('开具失败'), red: i18nT('已红冲') }[s];
}
export function statusClass(s: IvDraftStatus): string {
  return { draft: '', confirmed: 'brand', handed: 'warn', issued: 'ok', failed: 'bad', red: 'bad' }[s];
}
export const kindLabel = (k: 'special' | 'normal'): string => (k === 'special' ? i18nT('专用发票') : i18nT('普通发票'));
export const pct = (r: number): string => `${Math.round(r * 10000) / 100}%`;
export const money = (n: number): string => (Number(n) || 0).toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export function openPath(path: string, reveal = false): Promise<unknown> {
  return iv('path.open', { path, reveal });
}
