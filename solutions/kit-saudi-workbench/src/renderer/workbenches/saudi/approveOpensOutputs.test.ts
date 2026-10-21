import { describe, expect, it } from 'vitest';
import { shouldOpenOutputsAfterDecision } from './approvalFlow';

/**
 * 批准之后必须自动弹出输出中心。
 *
 * 用户实证的 bug：三个模块审批通过后弹层不出来 —— `decide()` 只 reload + toast，
 * 只有「生成输出物」那条路径会弹。而批准的下一步动作**必然**是去看/发那几份文件，
 * 在此之前它们是不可发送的，所以这里是流程的交接点。
 */
describe('审批后是否自动弹输出中心', () => {
  it('批准且已有文件 → 弹', () => {
    expect(shouldOpenOutputsAfterDecision('approve', 4)).toBe(true);
  });

  it('修改后批准同样算通过', () => {
    expect(shouldOpenOutputsAfterDecision('approve_with_edits', 1)).toBe(true);
  });

  it('还没生成任何文件也要弹 —— 这正是最常见的一条路，挡住它就像功能坏了', () => {
    // 面板里有交付目录设置和「去输出物卡片点生成」的指引，恰是批准后的下一步
    expect(shouldOpenOutputsAfterDecision('approve', 0)).toBe(true);
    expect(shouldOpenOutputsAfterDecision('approve')).toBe(true);
  });

  it.each(['return', 'reject', 'reassign'])('%s 不是通过，不弹', (action) => {
    expect(shouldOpenOutputsAfterDecision(action, 4)).toBe(false);
  });
});
