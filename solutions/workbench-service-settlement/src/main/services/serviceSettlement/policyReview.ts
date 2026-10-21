import { t as i18nT } from '@totalclaw/i18n';
/** 持久化规则核对状态；不能只依赖某个窗口的按钮禁用。 */
export interface PolicyReviewState { rulesReviewPending?: boolean; rulesReviewRevision?: number }
export function beginPolicyReview(state: PolicyReviewState): number {
  state.rulesReviewPending = true;
  state.rulesReviewRevision = (state.rulesReviewRevision || 0) + 1;
  return state.rulesReviewRevision;
}
export function confirmPolicyReview(state: PolicyReviewState, revision: unknown): void {
  if (revision !== (state.rulesReviewRevision || 0)) throw new Error(i18nT('政策文件或抽取批次已变化，请重新核对当前规则'));
  state.rulesReviewPending = false;
}
export function assertPolicyReviewComplete(state: PolicyReviewState): void {
  if (state.rulesReviewPending) throw new Error(i18nT('当前政策尚未核对，不能计算。请应用已核对草稿、确认手工规则或选择预设。'));
}
