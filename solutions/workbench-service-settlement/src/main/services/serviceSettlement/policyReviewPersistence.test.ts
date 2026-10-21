import { it, expect, vi } from 'vitest';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
const fixture = vi.hoisted(() => ({ root: '' }));
vi.mock('../accountScope', () => ({ privateRoot: () => fixture.root, onAccountKeyChange: () => {} }));
import { ServiceSettlementStore } from './store';
import { beginPolicyReview, confirmPolicyReview, assertPolicyReviewComplete } from './policyReview';
it('真实结算 store 落盘/新实例加载保留核对状态与批次，确认同时保存规则', () => {
  fixture.root = mkdtempSync(join(tmpdir(), 'policy-review-store-'));
  try {
    const first = new ServiceSettlementStore();
    first.update(s => { beginPolicyReview(s.marketing); s.marketing.rulesPdfPaths = ['政策.pdf', '补充.pdf']; });
    const reopened = new ServiceSettlementStore();
    expect(reopened.get().marketing.rulesPdfPaths).toEqual(['政策.pdf', '补充.pdf']);
    expect(() => assertPolicyReviewComplete(reopened.get().marketing)).toThrow('尚未核对');
    reopened.update(s => { s.marketing.rules.managerMinRate = 0.88; confirmPolicyReview(s.marketing, 1); });
    const confirmed = new ServiceSettlementStore().get().marketing;
    expect(confirmed.rules.managerMinRate).toBe(0.88);
    expect(() => assertPolicyReviewComplete(confirmed)).not.toThrow();
  } finally { rmSync(fixture.root, { recursive: true, force: true }); }
});
