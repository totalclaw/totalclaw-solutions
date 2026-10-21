/**
 * 高校一体化 AI 智能体 · 渲染层共享：动作调用、全局状态、标签。各页签只依赖这里，互不 import。
 */
import { ref } from 'vue';
import type { CaAnswerKind, CaDocStatus, CaLevel, CaReviewStatus, CaState, CaStudentResult, CaTicketStatus } from '@totalclaw/ipc-contracts';
import { t as i18nT } from '../../i18n';
import { toPlain } from '../../utils/ipcPlain';

export { errorMessage, fmtDateTime, scrollToStep, droppedPaths, EXCEL_RE } from '../service-settlement/shared';
export type { StepMeta, StepRuntime } from '../service-settlement/shared';

export async function ca<T = any>(action: string, payload?: unknown): Promise<T> {
  const bridge = (window as any).electronAPI?.workbenches?.campusAi;
  if (!bridge?.invoke) throw new Error(i18nT('高校一体化AI智能体接口不可用，请重启应用'));
  return bridge.invoke(action, toPlain(payload ?? {})) as Promise<T>;
}

export function onCaEvent(cb: (ev: { type: string; payload?: any }) => void): () => void {
  const bridge = (window as any).electronAPI?.workbenches?.campusAi;
  return bridge?.onEvent ? bridge.onEvent(cb) : () => {};
}

export const caState = ref<CaState | null>(null);
/** 预警逐人结果（只在这次运算换了时重新取） */
export const caResults = ref<CaStudentResult[]>([]);
/** 主进程推来的进度（知识库构建、通知生成） */
export const caProgress = ref<{ message: string; scope?: string; done?: number; total?: number }>({ message: '' });
let resultsOf = '';

export async function refreshState(): Promise<CaState> {
  const s = await ca<CaState>('state.get');
  caState.value = s;
  const key = s.warn ? `${s.warn.id}:${s.warn.computedAt}` : '';
  if (key !== resultsOf || (key && !caResults.value.length)) {
    caResults.value = key ? await ca<CaStudentResult[]>('warn.results') : [];
    resultsOf = key;
  }
  return s;
}

export function openPath(path: string, reveal = false): Promise<unknown> {
  return ca('path.open', { path, reveal });
}

export const DOC_RE = /\.(pdf|docx?|txt|md|xlsx|xls|csv|pptx|html?)$/i;

// ── 标签 ──────────────────────────────────────────────────────────────────────

export function kindLabel(k: CaAnswerKind): string {
  return { faq: i18nT('FAQ 审定答案'), answer: i18nT('依据原文作答'), quote: i18nT('原文摘录'), no_evidence: i18nT('无依据·已转办'), sensitive: i18nT('敏感·已置顶转办') }[k];
}
export function kindClass(k: CaAnswerKind): string {
  return { faq: 'ok', answer: 'brand', quote: 'brand', no_evidence: 'warn', sensitive: 'bad' }[k];
}
export function docStatusLabel(s: CaDocStatus): string {
  return { pending: i18nT('待构建'), building: i18nT('构建中'), built: i18nT('已就绪'), failed: i18nT('失败') }[s];
}
export function docStatusClass(s: CaDocStatus): string {
  return { pending: '', building: 'brand', built: 'ok', failed: 'bad' }[s];
}
export function ticketStatusLabel(s: CaTicketStatus): string {
  return { open: i18nT('待答复'), answered: i18nT('已答复'), closed: i18nT('已关闭') }[s];
}
export function levelLabel(l: CaLevel): string {
  return { red: i18nT('红色预警'), orange: i18nT('橙色预警'), yellow: i18nT('黄色预警') }[l];
}
export function levelClass(l: CaLevel | null | undefined): string {
  return l === 'red' ? 'bad' : l === 'orange' ? 'warn' : l === 'yellow' ? 'brand' : '';
}
export function reviewLabel(s: CaReviewStatus): string {
  return { pending: i18nT('待复核'), confirmed: i18nT('已确认'), dismissed: i18nT('不预警') }[s];
}
export function datasetLabel(k: 'roster' | 'grades' | 'attendance'): string {
  return { roster: i18nT('学生名单'), grades: i18nT('课程成绩'), attendance: i18nT('考勤') }[k];
}
export function datasetHint(k: 'roster' | 'grades' | 'attendance'): string {
  return {
    roster: i18nT('学号、姓名必填；班级、学院、专业、辅导员、辅导员邮箱可选（发邮件要用辅导员邮箱）'),
    grades: i18nT('学号、课程、成绩必填；学分、学期可选。补考 / 重修多条取最好的一次'),
    attendance: i18nT('学号 + 缺勤次数（可带应到次数），或学号 + 每次的考勤状态；没有考勤也能算，只是缺勤率不作为门槛'),
  }[k];
}

export const pct = (r: number | null | undefined, digits = 1): string => (r === null || r === undefined ? '—' : `${(r * 100).toFixed(digits)}%`);
