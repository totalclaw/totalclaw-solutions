/**
 * 财会审计 · 渲染层共享：桥访问、事件、主进程步骤态 → StepCard 运行态、文案与数字格式。
 *
 * 出参一律先 toPlain：reactive Proxy 过不了 contextBridge（服务商结算的教训，见 utils/ipcPlain.ts）；
 * 也不能拿 Proxy 去套桥对象（属性 non-configurable，get 返回替换函数即抛 TypeError），所以这里直接调 invoke。
 */
import { i18nKey, t as i18nT } from '../../i18n';
import { toPlain } from '../../utils/ipcPlain';
import { currentLocale } from '../../composables/useLocale';
import type { FauEvent, FauMsg, FauSignLevel, FauStepKey, FauStepState } from '@totalclaw/ipc-contracts';
import type { StepMeta, StepRuntime } from '../service-settlement/shared';
import { errorMessage } from '../service-settlement/shared';

export { errorMessage };

export function api(): { invoke: (action: string, payload?: unknown) => Promise<any>; onEvent?: (cb: (ev: FauEvent) => void) => () => void } | null {
  return (window as any).electronAPI?.workbenches?.financeAudit || null;
}

export async function fau<T = any>(action: string, payload?: unknown): Promise<T> {
  const a = api();
  if (!a?.invoke) throw new Error(i18nT('当前环境不支持财会审计工作台'));
  return a.invoke(action, toPlain(payload ?? {}));
}

export function onFauEvent(cb: (ev: FauEvent) => void): () => void {
  return api()?.onEvent?.(cb) ?? (() => {});
}

export function msg(m: FauMsg | null | undefined): string {
  return m ? i18nT(m.key, m.params) : '';
}

export const STEP_ORDER: FauStepKey[] = ['setup', 'upload', 'validate', 'analyze', 'draft', 'signoff', 'archive'];

export function stepMetas(): StepMeta[] {
  return [
    { key: 'setup', title: i18nT('选择项目与模式'), hint: i18nT('期间、主体、场景模式与本次输出语言') },
    { key: 'upload', title: i18nT('上传数据'), hint: i18nT('按模块列出必需与可选的数据，自动识别列后由你确认') },
    { key: 'validate', title: i18nT('校验'), hint: i18nT('借贷平衡、期间覆盖、科目映射等检查，分阻断项与提醒项') },
    { key: 'analyze', title: i18nT('分析与计算'), hint: i18nT('规则引擎算数，模型只写说明，引用的数字逐条回原文核对') },
    { key: 'draft', title: i18nT('生成底稿'), hint: i18nT('预览关键数字与检查项，生成带「草稿—待签核」水印的文件') },
    { key: 'signoff', title: i18nT('人工签核'), hint: i18nT('编制 → 复核 → 批准，提醒项逐条确认已知悉') },
    { key: 'archive', title: i18nT('归档与转交'), hint: i18nT('签核后复制文件、签核页与哈希清单到项目归档区') },
  ];
}

/** 主进程步骤态 → StepCard / StickyProgress 的运行态（看门狗字段原样透传） */
export function stepRuntimeOf(s: FauStepState | undefined): StepRuntime {
  if (!s) return { state: 'todo' };
  const base = { startedAt: s.startedAt, finishedAt: s.finishedAt, progressAt: s.progressAt, kind: s.kind, estimateSec: s.estimateSec };
  switch (s.status) {
    case 'running': return { ...base, state: 'running' };
    case 'done': return { ...base, state: 'done', summary: msg(s.summary) || undefined };
    case 'failed':
    case 'blocked': return { ...base, state: 'failed', error: msg(s.error) || i18nT('失败') };
    case 'interrupted': return { ...base, state: 'failed', error: i18nT('已中断：应用重启前这一步还在运行，请重新运行') };
    default: return { ...base, state: 'todo', summary: msg(s.summary) || undefined };
  }
}

export const LEVEL_LABEL: Record<FauSignLevel, string> = { prepare: i18nKey('编制'), review: i18nKey('复核'), approve: i18nKey('批准') };

export function numberLocale(): string {
  const l = currentLocale();
  return l === 'ar' ? 'ar-u-nu-latn' : l;
}

/** 分 → 主单位（两位小数，西方阿拉伯数字） */
export function fmtCents(cents: number | null | undefined): string {
  if (cents === null || cents === undefined || !Number.isFinite(cents)) return '-';
  return new Intl.NumberFormat(numberLocale(), { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(cents / 100);
}

/** 小数比例 → 百分比（0.12 → 12.0%） */
export function fmtRatio(v: number | null | undefined): string {
  if (v === null || v === undefined || !Number.isFinite(v)) return '-';
  return new Intl.NumberFormat(numberLocale(), { style: 'percent', maximumFractionDigits: 1 }).format(v);
}

export function fmtTime(iso?: string): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`;
}

/** 上个月 YYYY-MM（新建第一个月结项目的默认期间） */
export function lastMonth(now = new Date()): string {
  const d = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

/** 输出语言名：各用本语言写（「中文」是词典里约定保留中文的 key），显示时过 $t */
export const LOCALE_LABEL: Record<string, string> = { 'zh-CN': i18nKey('中文'), 'en-US': 'English', ar: 'العربية' };

/** 按公司 ERP 类型给「怎么导出这份数据」的简短指引（批次 1：序时账 / 余额表 / 银行流水 / 子账） */
export function exportGuide(kind: string, erp: string): string {
  const G: Record<string, Record<string, string>> = {
    journal: {
      yonyou: i18nKey('用友：总账 → 凭证 → 凭证查询，按月份筛选后引出为 Excel'),
      kingdee: i18nKey('金蝶：总账 → 凭证查询，选会计期间后引出'),
      sap: i18nKey('SAP：FBL3N / FAGLL03 按过账期间导出总账行项目'),
      oracle: i18nKey('Oracle：General Ledger → Journals → Export 按期间导出'),
      chanjet: i18nKey('畅捷通 T+：总账 → 凭证查询 → 导出'),
      other: i18nKey('从财务软件导出本期全部凭证明细（日期、凭证号、科目、摘要、借贷金额）'),
    },
    tb: {
      yonyou: i18nKey('用友：总账 → 账表 → 科目余额表，含期初、本期发生、期末，引出为 Excel'),
      kingdee: i18nKey('金蝶：总账 → 科目余额表，勾选显示期初与本期发生后引出'),
      sap: i18nKey('SAP：F.01 / FAGLB03 导出科目余额（期初、借贷发生、期末）'),
      oracle: i18nKey('Oracle：Trial Balance 报表按期间导出'),
      chanjet: i18nKey('畅捷通 T+：总账 → 科目余额表 → 导出'),
      other: i18nKey('导出科目余额表：科目编码、科目名称、期初 / 本期 / 期末借贷方'),
    },
    bank: { other: i18nKey('企业网银 → 账户明细查询，选本月后导出 Excel 或 CSV；多个账户可以分别导出') },
    subledger: { other: i18nKey('应收、应付、固定资产或存货模块导出明细，带上与总账一致的键列（单号、资产编号或往来单位）') },
  };
  const g = G[kind];
  if (!g) return '';
  return i18nT(g[erp] || g.other || '');
}

/** 输出物类型的显示名（文件格式名，不翻译） */
export const OUTPUT_LABEL: Record<string, string> = { xlsx: 'Excel', docx: 'Word', pdf: 'PDF', pptx: 'PowerPoint', md: 'Markdown', je_import_xlsx: 'Excel (JE)' };

/** 来源能力按类别计数（界面只给类别与数量，不显示上游仓库路径） */
const PROV_KIND: Record<string, string> = {
  skill: i18nKey('技能'), 'm365-skill': i18nKey('技能'),
  knowledge: i18nKey('知识与规则文档'), reference: i18nKey('知识与规则文档'), convention: i18nKey('知识与规则文档'), 'scenario-config': i18nKey('知识与规则文档'), scenario: i18nKey('知识与规则文档'),
  command: i18nKey('快捷命令'), 'm365-command': i18nKey('快捷命令'),
  agent: i18nKey('智能体与子代理'), subagent: i18nKey('智能体与子代理'),
  connector: i18nKey('数据连接器'), 'mcp-endpoint': i18nKey('数据连接器'), 'cookbook-service': i18nKey('数据连接器'),
};
export function provenanceText(items: { type: string }[], sep: string): string {
  const counts = new Map<string, number>();
  for (const it of items) {
    const k = PROV_KIND[it.type] || i18nKey('工程组件');
    counts.set(k, (counts.get(k) || 0) + 1);
  }
  return [...counts].map(([k, n]) => `${i18nT(k)} ${n}`).join(sep);
}

/** 阈值（thresholds.get 的一行）：金额存分、比例存小数；界面金额按元、比例按百分比显示与输入 */
export interface ThresholdItem {
  key: string; module: string; value: number; override: number | null; label: string; original: string;
  /** 可读的依据名（词典 key）与章节原文；不含任何上游仓库路径 */
  basis: string; section: string;
  amount: boolean; percent: boolean; version: string;
}

const round6 = (v: number) => Number(v.toFixed(6));
/** 存储值 → 输入框里的数（金额：元；比例：百分数） */
export function thresholdInput(it: ThresholdItem, v: number): number {
  return it.amount ? round6(v / 100) : it.percent ? round6(v * 100) : v;
}
/** 输入框 → 存储值；非法输入返回 null */
export function thresholdStore(it: ThresholdItem, raw: string): number | null {
  const n = Number(raw);
  if (raw.trim() === '' || !Number.isFinite(n) || n < 0) return null;
  return it.amount ? Math.round(n * 100) : it.percent ? round6(n / 100) : n;
}
/** 显示文本（不带单位）：金额两位小数带千分位，比例最多两位小数 */
export function thresholdText(it: ThresholdItem, v: number): string {
  if (it.amount) return fmtCents(v);
  return new Intl.NumberFormat(numberLocale(), { maximumFractionDigits: it.percent ? 2 : 4 }).format(thresholdInput(it, v));
}
/** 单位：金额按公司本位币（人民币显示「元」），比例 % */
export function thresholdUnit(it: ThresholdItem, currency: string): string {
  if (it.percent) return '%';
  if (!it.amount) return '';
  return !currency || currency === 'CNY' ? i18nT('元') : currency;
}
/** 「依据：月结关账判断框架 · 类型一：试算表不平衡」 */
export function thresholdBasisText(it: ThresholdItem): string {
  const name = it.basis ? i18nT('依据：{p0}', { p0: i18nT(it.basis) }) : '';
  return [name, it.section].filter(Boolean).join(' · ');
}
