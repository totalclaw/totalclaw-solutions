/**
 * 六步闭环的状态。
 *
 * 这套推导误导过用户两次，两次都是**把"在等你操作"显示成了"系统正在跑"**：
 *   · 案件已批准、还没点过生成文件 → 「建议」一直转圈（审批的就是这份建议，它早完成了）；
 *   · 批准之后 → 「交付」一直转圈（看起来像在自动发件，其实什么都没做）。
 * 所以这里每条都在钉「谁该转圈」：active 只留给系统真在做的那一步。
 */
import { describe, it, expect } from 'vitest';
import { computeWorkflowStates, isApprovedStatus, reachedApproval } from './workflowStepState';

const S = { RECEIVE: 0, UNDERSTAND: 1, RETRIEVE: 2, ADVISE: 3, APPROVE: 4, DELIVER: 5 } as const;

describe('六步状态推导', () => {
  it('没有案件：六步全是未开始，一个转圈的都没有', () => {
    const st = computeWorkflowStates({ hasCase: false, outputCount: 0, hasImpact: false });
    expect(st).toEqual(['todo', 'todo', 'todo', 'todo', 'todo', 'todo']);
  });

  it('刚建案：前三步完成，建议在跑，审批/交付未开始', () => {
    const st = computeWorkflowStates({ hasCase: true, status: 'analyzed', outputCount: 0, hasImpact: false });
    expect(st.slice(0, 3)).toEqual(['done', 'done', 'done']);
    expect(st[S.ADVISE]).toBe('active');
    expect(st[S.APPROVE]).toBe('todo');
    expect(st[S.DELIVER]).toBe('todo');
  });

  it('已提交审批：建议算完成（审批的就是它），审批在进行', () => {
    const st = computeWorkflowStates({ hasCase: true, status: 'pending_approval', outputCount: 0, hasImpact: false });
    expect(st[S.ADVISE]).toBe('done');
    expect(st[S.APPROVE]).toBe('active');
  });

  it('已批准但一个文件都没生成 —— 用户实拍的那一幕：建议不许转圈', () => {
    const st = computeWorkflowStates({ hasCase: true, status: 'approved', outputCount: 0, hasImpact: false });
    expect(st[S.ADVISE]).toBe('done');
    expect(st[S.APPROVE]).toBe('done');
    // 交付是「等你去生成 + 发送」，不是进行中
    expect(st[S.DELIVER]).toBe('todo');
    expect(st).not.toContain('active');
  });

  it('修改后批准 与 批准 同等对待', () => {
    const a = computeWorkflowStates({ hasCase: true, status: 'approved_with_edits', outputCount: 2, hasImpact: false });
    expect(a[S.APPROVE]).toBe('done');
    expect(a[S.DELIVER]).toBe('todo');
  });

  it('已交付：最后一步才是 done', () => {
    const st = computeWorkflowStates({ hasCase: true, status: 'delivered', outputCount: 3, hasImpact: false });
    expect(st[S.DELIVER]).toBe('done');
  });

  it('退回 / 拒绝：审批标失败，建议仍算完成（它确实交出去过）', () => {
    for (const status of ['returned', 'rejected'] as const) {
      const st = computeWorkflowStates({ hasCase: true, status, outputCount: 0, hasImpact: false });
      expect(st[S.APPROVE]).toBe('failed');
      expect(st[S.ADVISE]).toBe('done');
      expect(st[S.DELIVER]).toBe('todo');
    }
  });

  it('生成过文件 或 重算过 也算建议完成（没进审批也一样）', () => {
    expect(computeWorkflowStates({ hasCase: true, status: 'drafted', outputCount: 1, hasImpact: false })[S.ADVISE]).toBe('done');
    expect(computeWorkflowStates({ hasCase: true, status: 'analyzed', outputCount: 0, hasImpact: true })[S.ADVISE]).toBe('done');
  });

  it('谓词：已批准 / 进过审批的判定', () => {
    expect(isApprovedStatus('approved')).toBe(true);
    expect(isApprovedStatus('delivered')).toBe(true);
    expect(isApprovedStatus('pending_approval')).toBe(false);
    expect(reachedApproval('pending_approval')).toBe(true);
    expect(reachedApproval('rejected')).toBe(true);
    expect(reachedApproval('analyzed')).toBe(false);
  });
});
