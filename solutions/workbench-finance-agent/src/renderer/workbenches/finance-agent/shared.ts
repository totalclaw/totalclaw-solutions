/**
 * 财务智能体工作台 · 渲染层共享：动作调用、全局状态、十个智能体清单、格式化、文件选择。
 *
 * 各智能体 tab 只依赖这里（和结算工作台的 StepCard / StickyProgress），tab 之间互不 import。
 * 状态只有一份（faState，当前账套），主进程推 state 事件时整体刷新。
 */
import { reactive, ref } from 'vue';
import type { FaModelOption, FaModuleKey, FaPackage, FaState } from '@totalclaw/ipc-contracts';
import { FA_PACKAGE_MODULES } from '@totalclaw/ipc-contracts';
import { t as i18nT } from '../../i18n';
import { toPlain } from '../../utils/ipcPlain';

export { errorMessage, fmtDateTime, fmtDate, fmtMoney, fmtPct, droppedPaths } from '../service-settlement/shared';
export { scrollToStep } from '../service-settlement/shared';
export type { StepMeta, StepRuntime } from '../service-settlement/shared';

/** 调主进程动作。入参先 toPlain：reactive Proxy 过不了 contextBridge */
export async function fa<T = any>(action: string, payload?: unknown): Promise<T> {
  const bridge = (window as any).electronAPI?.workbenches?.financeAgent;
  if (!bridge?.invoke) throw new Error(i18nT('财务智能体接口不可用，请重启应用'));
  return bridge.invoke(action, toPlain(payload ?? {})) as Promise<T>;
}

export function onFaEvent(cb: (ev: { type: string; payload?: any }) => void): () => void {
  const bridge = (window as any).electronAPI?.workbenches?.financeAgent;
  return bridge?.onEvent ? bridge.onEvent(cb) : () => {};
}

export const faState = ref<FaState | null>(null);
export const faModels = reactive<{ options: FaModelOption[]; defaultLabel: string; loaded: boolean }>({ options: [], defaultLabel: '', loaded: false });
/** 主进程推来的长任务进度文字（按模块） */
export const faProgress = reactive<Record<string, string>>({});

export async function refreshState(): Promise<FaState> {
  const s = await fa<FaState>('state.get');
  faState.value = s;
  return s;
}

export async function loadModels(): Promise<void> {
  try {
    const r = await fa<{ options: FaModelOption[]; defaultLabel: string }>('models.list');
    faModels.options = r.options;
    faModels.defaultLabel = r.defaultLabel;
  } finally {
    faModels.loaded = true;
  }
}

export function modelGroups(): Array<{ group: string; options: FaModelOption[] }> {
  const out: Array<{ group: string; options: FaModelOption[] }> = [];
  for (const o of faModels.options) {
    const g = o.group || o.provider;
    let bucket = out.find((x) => x.group === g);
    if (!bucket) { bucket = { group: g, options: [] }; out.push(bucket); }
    bucket.options.push(o);
  }
  return out;
}

export function modelLabel(value: string | undefined): string {
  if (!value) return faModels.defaultLabel || i18nT('系统默认模型');
  return faModels.options.find((o) => o.value === value)?.label || value;
}

export interface FaModuleMeta {
  key: FaModuleKey;
  icon: string;
  title: string;
  /** tab 上的一句话 */
  desc: string;
  /** 能力（方案原文） */
  ability: string;
  /** 输出物 / 适用场景 */
  output: string;
}

export function moduleMetas(): FaModuleMeta[] {
  return [
    { key: 'voucher', icon: 'ri-file-list-3-line', title: i18nT('凭证处理'), desc: i18nT('票据识别、会计分录、凭证草稿'), ability: i18nT('接收发票、回单图片 / OCR 识别，自动提取金额、税号、往来单位；自动生成会计分录，输出记账凭证草稿；识别普票 / 专票，区分进项销项；自动归类费用（差旅费、办公费）'), output: i18nT('凭证草稿、识别校验报告、异常票据标记') },
    { key: 'tax', icon: 'ri-government-line', title: i18nT('税务申报'), desc: i18nT('税额计算、账税核对、申报草稿'), ability: i18nT('读取账面数据，自动计算增值税、附加税、企业所得税、个税；核对账税差异；生成申报表草稿；风险预检（税负异常、进项抵扣异常预警）；生成申报备注'), output: i18nT('只做数据整理、草稿生成、风险自查，不对接电子税务局自动提交') },
    { key: 'filing', icon: 'ri-upload-cloud-2-line', title: i18nT('申报上报'), desc: i18nT('打开电子税务局、代填申报表、登记回执'), ability: i18nT('电子税务局不对企业开放申报接口，登录须本人扫码或 CA：由你登录后，数字员工在内置浏览器按申报草稿代填各税种申报表，停在「提交」前由你核对并亲自提交；回来登记申报回执与缴款，提示本期申报期限'), output: i18nT('代填好的申报表（待你提交）、申报台账、申报回执归档') },
    { key: 'expense', icon: 'ri-receipt-line', title: i18nT('费用报销'), desc: i18nT('报销预审、重复票、部门归集'), ability: i18nT('员工上传报销单据，自动校验报销规则（标准、额度、票据有效期）；识别重复发票；判断是否合规，驳回不合规单据；自动归集费用部门'), output: i18nT('企业内部报销预审，减少财务人工初审工作量') },
    { key: 'reconcile', icon: 'ri-scales-3-line', title: i18nT('往来对账'), desc: i18nT('逐笔比对、对账函、账龄'), ability: i18nT('读取应收 / 应付台账，和客户、供应商对账单比对；自动标记差额；生成对账函、催款函；账龄自动分析，逾期款项预警'), output: i18nT('差异明细、对账函、催款函、账龄表、逾期预警') },
    { key: 'statements', icon: 'ri-file-chart-line', title: i18nT('财务报表'), desc: i18nT('三大报表、勾稽校验、经营分析'), ability: i18nT('基于凭证数据，自动生成资产负债表、利润表、现金流量表；报表勾稽关系校验；生成经营简要分析（营收、毛利、费用波动说明）'), output: i18nT('三大报表 Excel、勾稽校验结果、经营简要分析') },
    { key: 'risk', icon: 'ri-shield-check-line', title: i18nT('风险巡检'), desc: i18nT('全量扫描、风险报告、整改建议'), ability: i18nT('全量扫描账套，识别风险点：发票连号、大额现金、异常费用、税负偏低、往来长期挂账'), output: i18nT('财税风险报告，附带整改建议') },
    { key: 'budget', icon: 'ri-pie-chart-2-line', title: i18nT('预算管控'), desc: i18nT('预算消耗、超支预警、差异解读'), ability: i18nT('录入预算额度，实时跟踪各部门预算消耗；支出超预算预警；预算执行分析，月度预算差异解读'), output: i18nT('预算执行表、超预算预警、月度差异解读') },
    { key: 'cost', icon: 'ri-tools-line', title: i18nT('成本核算'), desc: i18nT('料工费归集分摊、单品成本'), ability: i18nT('归集料工费，自动分摊制造费用；计算单品成本；成本波动分析，识别异常损耗'), output: i18nT('制造业适用：成本计算单、分配过程、异常损耗提示') },
    { key: 'contract', icon: 'ri-file-shield-2-line', title: i18nT('合同审核'), desc: i18nT('涉税条款、风险条款、印花税'), ability: i18nT('上传采购 / 销售合同，识别涉税条款（开票时间、税率、付款节点）；识别财税风险条款，提示涉税隐患'), output: i18nT('涉税条款清单、风险提示与修改建议、印花税测算') },
    { key: 'qa', icon: 'ri-question-answer-line', title: i18nT('财税问答'), desc: i18nT('政策库、企业制度、自动答疑'), ability: i18nT('内置税法、会计准则库；员工 / 客户提问财税问题（开票、个税、小规模优惠），自动答疑；可对接企业内部财务制度'), output: i18nT('带依据的回答，记住同一账套的问答上下文') },
  ];
}

export function packageLabel(p: FaPackage): string {
  return { all: i18nT('全部智能体'), micro: i18nT('小微企业基础包'), agency: i18nT('代账公司专业包'), manufacturing: i18nT('制造企业高级包') }[p];
}

export function packageModules(p: FaPackage): FaModuleKey[] {
  return p === 'all' ? moduleMetas().map((m) => m.key) : FA_PACKAGE_MODULES[p];
}

export async function pickFiles(kind: 'invoice' | 'excel' | 'contract' | 'policy', multi = true): Promise<string[]> {
  const r = await fa<string[]>('files.pick', { kind, multi });
  return Array.isArray(r) ? r : [];
}

export function openPath(path: string, reveal = false): Promise<unknown> {
  return fa('path.open', { path, reveal });
}

export function currentMonth(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

export function prevMonth(): string {
  const d = new Date();
  d.setDate(1);
  d.setMonth(d.getMonth() - 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

export function levelLabel(level: string): string {
  return ({ high: i18nT('高'), warn: i18nT('中'), info: i18nT('低'), error: i18nT('错误'), ok: i18nT('通过') } as Record<string, string>)[level] || level;
}

export function levelChip(level: string): string {
  return level === 'high' || level === 'error' ? 'bad' : level === 'warn' ? 'warn' : level === 'ok' ? 'ok' : '';
}

export const INVOICE_RE = /\.(pdf|ofd|xml|jpe?g|png|heic|webp)$/i;
export const EXCEL_RE = /\.(xlsx|xls|csv)$/i;
export const CONTRACT_RE = /\.(pdf|docx?|txt|jpe?g|png)$/i;
export const POLICY_RE = /\.(pdf|docx?|txt|md|xlsx)$/i;
