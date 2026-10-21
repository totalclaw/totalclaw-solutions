/**
 * 外贸业务智能体工作台 · 渲染层共享：动作调用、全局状态、模块清单、格式化。
 *
 * 十个模块组件都只依赖这里（和结算工作台的 StepCard / StickyProgress），模块之间互不 import。
 * 状态只有一份（ftState），主进程推 state 事件时整体刷新。
 */
import { reactive, ref } from 'vue';
import type { FtGateResult, FtModelOption, FtModuleKey, FtSendKind, FtState } from '@totalclaw/ipc-contracts';
import { t as i18nT } from '../../i18n';
import { toPlain } from '../../utils/ipcPlain';

export { errorMessage, fmtDateTime, fmtDate, fmtMoney } from '../service-settlement/shared';
export { useSteps } from '../service-settlement/shared';
export type { StepMeta, StepRuntime } from '../service-settlement/shared';

/** 调主进程动作。入参先 toPlain：reactive Proxy 过不了 contextBridge */
export async function ft<T = any>(action: string, payload?: unknown): Promise<T> {
  const bridge = (window as any).electronAPI?.workbenches?.foreignTrade;
  if (!bridge?.invoke) throw new Error(i18nT('外贸工作台接口不可用，请重启应用'));
  return bridge.invoke(action, toPlain(payload ?? {})) as Promise<T>;
}

export function onFtEvent(cb: (ev: { type: string; payload?: any }) => void): () => void {
  const bridge = (window as any).electronAPI?.workbenches?.foreignTrade;
  return bridge?.onEvent ? bridge.onEvent(cb) : () => {};
}

export const ftState = ref<FtState | null>(null);
export const ftModels = reactive<{ options: FtModelOption[]; defaultLabel: string; loaded: boolean }>({ options: [], defaultLabel: '', loaded: false });
/** 主进程推来的长任务进度文字（按模块） */
export const ftProgress = reactive<Record<string, string>>({});

export async function refreshState(): Promise<FtState> {
  const s = await ft<FtState>('state.get');
  ftState.value = s;
  return s;
}

export async function loadModels(): Promise<void> {
  try {
    const r = await ft<{ options: FtModelOption[]; defaultLabel: string }>('models.list');
    ftModels.options = r.options;
    ftModels.defaultLabel = r.defaultLabel;
  } finally {
    ftModels.loaded = true;
  }
}

/** 下拉用：按通道分组（泰途统一通道排最前） */
export function modelGroups(): Array<{ group: string; options: FtModelOption[] }> {
  const out: Array<{ group: string; options: FtModelOption[] }> = [];
  for (const o of ftModels.options) {
    const g = o.group || o.provider;
    let bucket = out.find((x) => x.group === g);
    if (!bucket) { bucket = { group: g, options: [] }; out.push(bucket); }
    bucket.options.push(o);
  }
  return out;
}

export function modelLabel(value: string | undefined): string {
  if (!value) return ftModels.defaultLabel || i18nT('系统默认模型');
  return ftModels.options.find((o) => o.value === value)?.label || value;
}

export interface FtModuleMeta {
  key: FtModuleKey;
  icon: string;
  title: string;
  desc: string;
  /** 数字员工完成 / 业务人员负责（与方案表格一致） */
  agentDoes: string;
  humanDoes: string;
}

export function moduleMetas(): FtModuleMeta[] {
  return [
    { key: 'platform', icon: 'ri-store-2-line', title: i18nT('平台运营'), desc: i18nT('商品数据、链接优化、发布产品'), agentDoes: i18nT('基础数据整理、基础链接优化、内容更新、按素材在平台发布产品'), humanDoes: i18nT('平台策略、产品布局、重点产品调整、确认修改与发布') },
    { key: 'prospect', icon: 'ri-user-search-line', title: i18nT('客户开发'), desc: i18nT('潜客搜索、筛选、写开发信、发邮件'), agentDoes: i18nT('潜客搜索、公司信息收集、基础筛选、写开发信，确认后从接管的邮箱发出'), humanDoes: i18nT('目标客户选择、重点客户开发、首次触达策略') },
    { key: 'inquiry', icon: 'ri-mail-open-line', title: i18nT('新询盘处理'), desc: i18nT('多邮箱收件、提取、分类、回复邮件'), agentDoes: i18nT('询盘整理、信息提取、基础分类、回复草稿，可按规则自动回复'), humanDoes: i18nT('需求判断、客户价值判断、首次沟通') },
    { key: 'background', icon: 'ri-shield-user-line', title: i18nT('客户背调'), desc: i18nT('官网、社媒、公司信息整理'), agentDoes: i18nT('官网、社媒、主营、公司信息收集整理，每条附来源'), humanDoes: i18nT('判断客户真实实力、采购潜力、是否值得重点投入') },
    { key: 'followup', icon: 'ri-time-line', title: i18nT('客户跟进'), desc: i18nT('往来记录、到期提醒、写跟进邮件'), agentDoes: i18nT('历史记录整理、节点提醒、跟进任务整理'), humanDoes: i18nT('跟进策略、客户沟通、需求挖掘、沉默客户唤醒') },
    { key: 'content', icon: 'ri-quill-pen-line', title: i18nT('内容生产'), desc: i18nT('文案、产品说明、产品图片与视频'), agentDoes: i18nT('文案、软文、产品说明、产品图片与视频素材'), humanDoes: i18nT('内容方向、重点内容审核、最终发布') },
    { key: 'social', icon: 'ri-global-line', title: i18nT('网站/社媒'), desc: i18nT('内容排期、社媒发布、网站检查'), agentDoes: i18nT('基础内容更新、排期、数据整理、网站 SEO 检查'), humanDoes: i18nT('SEO 方向、社媒策略、客户互动、账号运营') },
    { key: 'quote', icon: 'ri-price-tag-3-line', title: i18nT('报价'), desc: i18nT('产品匹配、成本计算、报价单'), agentDoes: i18nT('资料整理、产品匹配、报价单初稿（按规则计算）'), humanDoes: i18nT('价格、付款条件、特殊报价、最终报价') },
    { key: 'order', icon: 'ri-ship-line', title: i18nT('订单推进'), desc: i18nT('节点提醒、单据归档与核对'), agentDoes: i18nT('文件整理、节点提醒、进度记录、单据一致性核对'), humanDoes: i18nT('客户协调、异常处理、交期、付款与项目推进') },
    { key: 'report', icon: 'ri-bar-chart-2-line', title: i18nT('数据整理'), desc: i18nT('汇总、报表、日报周报'), agentDoes: i18nT('数据收集、汇总、报表、日报和周报'), humanDoes: i18nT('数据解读后的经营决策') },
  ];
}

export function mailboxName(s: FtState | null, id: string | undefined): string {
  const mb = s?.mailboxes.find((m) => m.id === id);
  return mb ? (mb.label || mb.address) : '';
}

export function enabledMailboxes(s: FtState | null) {
  return (s?.mailboxes || []).filter((m) => m.enabled);
}

/** 发信前的确认：写清楚从哪个邮箱发给谁（对外发送一律人来按） */
export function confirmSend(from: string, to: string[], subject: string): boolean {
  return window.confirm(i18nT('确认发送？\n发件邮箱：{p0}\n收件人：{p1}\n标题：{p2}', { p0: from, p1: to.join(', '), p2: subject }));
}

export interface GateDraft {
  kind: Exclude<FtSendKind, 'auto_reply'>;
  mailboxId: string;
  to: string[];
  subject: string;
  body: string;
  refId?: string;
  item?: { key?: string; reason?: string; since?: string; refId?: string };
}

/**
 * 发送前检查（发信闸门）：主进程按规则逐条核对。被拦下返回 hash = null，界面用 result 列出原因；
 * 放行时弹确认框（列出提醒项），人确认后返回审批摘要——发送时带回去，内容改过主进程会拦。
 */
export async function checkBeforeSend(draft: GateDraft, from: string): Promise<{ result: FtGateResult; hash: string | null }> {
  const result = await ft<FtGateResult>('outgoing.check', draft);
  if (!result.ok) return { result, hash: null };
  const warns = result.issues.filter((i) => i.level === 'warn').map((i) => `· ${i.message}`);
  const text = i18nT('确认发送？\n发件邮箱：{p0}\n收件人：{p1}\n标题：{p2}', { p0: from, p1: draft.to.join(', '), p2: draft.subject })
    + `\n${i18nT('今天这个邮箱已发 {a} / {b} 封', { a: result.sentToday, b: result.dailyLimit })}`
    + (warns.length ? `\n\n${i18nT('请留意：')}\n${warns.join('\n')}` : '');
  return { result, hash: window.confirm(text) ? result.hash : null };
}

/** 订单 / 单据前的名单筛查提示：没筛过、过期或有疑似命中都要人确认一次才继续 */
export async function confirmScreening(name: string, action: string): Promise<boolean> {
  if (!name.trim()) return true;
  const r = await ft<{ result: { level: string; at: string; matches: { name: string; list: string; score: number }[] } | null; ageDays: number | null; stale: boolean; listsReady: boolean }>('screening.latest', { name });
  let msg = '';
  if (!r.result) msg = r.listsReady ? i18nT('「{p0}」还没有做过制裁 / 出口管制名单筛查。', { p0: name }) : i18nT('还没有下载制裁 / 出口管制名单，「{p0}」没法筛查。', { p0: name });
  else if (r.result.level !== 'clear') msg = i18nT('「{p0}」名单筛查有疑似命中：{p1}（{p2} 分）。', { p0: name, p1: `${r.result.matches[0]?.name} · ${r.result.matches[0]?.list}`, p2: r.result.matches[0]?.score ?? '' });
  else if (r.stale) msg = i18nT('「{p0}」上次筛查是 {n} 天前，名单可能已更新。', { p0: name, n: r.ageDays ?? '' });
  if (!msg) return true;
  return window.confirm(`${msg}\n${i18nT('可以先到「客户背调」里筛查。仍要继续{p0}吗？', { p0: action })}`);
}

export function splitEmails(raw: string): string[] {
  return String(raw || '').split(/[,，;；\s]+/).map((x) => x.trim()).filter(Boolean);
}

export function todayIso(offsetDays = 0): string {
  const d = new Date(Date.now() + offsetDays * 86_400_000);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function fileUrl(path: string): string {
  return `totalclaw-media://local/${encodeURIComponent(path)}`;
}
