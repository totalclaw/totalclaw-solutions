import { describe, it, expect } from 'vitest';
import { beginPolicyReview, confirmPolicyReview, assertPolicyReviewComplete, type PolicyReviewState } from './policyReview';
describe('政策核对状态持久化', () => {
  it('重新打开或重启后不能绕过未核对状态，确认当前批次后才放行', () => {
    const state: PolicyReviewState = {};
    const revision = beginPolicyReview(state);
    const reopened = JSON.parse(JSON.stringify(state));
    expect(() => assertPolicyReviewComplete(reopened)).toThrow('尚未核对');
    confirmPolicyReview(reopened, revision);
    expect(() => assertPolicyReviewComplete(reopened)).not.toThrow();
  });
  it('更换文件或重新抽取后，旧窗口确认与无版本确认均不能解锁新批次', () => {
    const state: PolicyReviewState = {};
    const old = beginPolicyReview(state); beginPolicyReview(state);
    expect(() => confirmPolicyReview(state, old)).toThrow('批次已变化');
    expect(() => confirmPolicyReview(state, undefined)).toThrow('批次已变化');
    expect(() => assertPolicyReviewComplete(state)).toThrow('尚未核对');
    confirmPolicyReview(state, state.rulesReviewRevision);
    expect(() => assertPolicyReviewComplete(state)).not.toThrow();
  });
});
