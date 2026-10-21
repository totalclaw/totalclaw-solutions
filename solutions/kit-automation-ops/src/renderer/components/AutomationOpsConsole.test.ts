// @vitest-environment happy-dom
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { mount } from '@vue/test-utils';
vi.mock('../i18n', () => ({ t: (s: string) => s }));
vi.mock('../composables/useNativeBrowserModalLock', () => ({ createNativeBrowserModalLock: () => ({ set: vi.fn(), release: vi.fn() }) }));
import Console from './AutomationOpsConsole.vue';
function setup(execute?: any, beforeStart?: any) {
  const w = mount(Console, { props: { domain: 'warehouse', execute, beforeStart }, global: { mocks: { $t: (s: string) => s }, stubs: { HumanConfirmCard: true } } });
  return { w, s: (w.vm as any).$.setupState };
}
beforeEach(() => localStorage.clear());
describe('自动化执行真实性', () => {
  it('无执行器不可开始，不能定时器假跑成功', async () => {
    const { w, s } = setup(); expect(s.canStartCurrent).toBe(false); await s.start(); expect(s.runStatus).toBe('idle'); w.unmount();
  });
  it('缺失真实进度回执明确失败', async () => {
    const { w, s } = setup(vi.fn().mockResolvedValue(undefined)); await s.start(); expect(s.runStatus).toBe('failed'); expect(s.executionError).toContain('真实步骤'); w.unmount();
  });
  it('前置导航失败可见且允许重试', async () => {
    const { w, s } = setup(vi.fn(), vi.fn().mockRejectedValue(new Error('route failed'))); await s.start(); expect(s.executionError).toBe('route failed'); expect(s.starting).toBe(false); w.unmount();
  });
  it('取消失败不能声称安全接管，并保留重试取消能力', async () => {
    const cancel = vi.fn().mockRejectedValueOnce(new Error('offline')).mockResolvedValue(undefined);
    const { w, s } = setup(async (_id: string, _phase: string, _report: any, ctx: any) => { ctx.registerCancellation(cancel); return { progressManaged: true }; });
    await s.start(); await s.takeOver(); expect(s.runStatus).toBe('failed'); expect(s.executionError).toContain('offline');
    await s.takeOver(); expect(cancel).toHaveBeenCalledTimes(2); expect(s.runStatus).toBe('cancelled'); w.unmount();
  });
  it('退回不伪造已按意见重跑', async () => {
    const execute = vi.fn(async () => ({ progressManaged: true })); const { w, s } = setup(execute);
    await s.start(); s.runStatus = 'waiting'; await s.onApprovalDecision({ approved: false, reply: '改数量' });
    expect(execute).toHaveBeenCalledTimes(1); expect(s.runStatus).toBe('cancelled'); expect(s.executionNote).toContain('调整输入'); w.unmount();
  });
  it('退回等待异步取消回执，取消被拒绝不能显示已退回成功', async () => {
    let reject!: (error: Error) => void;
    const cancelled = new Promise<void>((_resolve, fail) => { reject = fail; });
    const { w, s } = setup(async (_id: string, _phase: string, _report: any, ctx: any) => {
      ctx.registerCancellation(() => cancelled); return { progressManaged: true };
    });
    await s.start(); s.runStatus = 'waiting';
    const pending = s.onApprovalDecision({ approved: false });
    expect(s.approvalBusy).toBe(true);
    expect(s.executionNote).not.toContain('已退回并停止');
    reject(new Error('停止被拒绝')); await pending;
    expect(s.runStatus).toBe('failed'); expect(s.executionError).toContain('停止被拒绝');
    expect(s.executionNote).not.toContain('已退回并停止'); expect(s.approvalBusy).toBe(false); w.unmount();
  });
  it('prepare 的取消回调在 commit 阶段仍有效', async () => {
    const cancel = vi.fn();
    const { w, s } = setup(async (_id: string, phase: string, _report: any, ctx: any) => {
      if (phase === 'prepare') ctx.registerCancellation(cancel);
      return { progressManaged: true };
    });
    await s.start(); s.runStatus = 'waiting'; await s.approve(); await s.takeOver();
    expect(cancel).toHaveBeenCalledTimes(1); w.unmount();
  });

  it('固定场景数值不冒充真实指标或步骤证据', async () => {
    const { w, s } = setup();
    expect(w.find('.metric-row').text()).not.toContain(s.current.metrics[0].value);
    expect(w.find('.result-list').text()).toContain('业务明细待确认');
    const step = s.current.steps[0]; expect(s.actionSummary(step, 0, 'done')).toContain('待确认');
    s.stepReceipts = { 0: { evidence: '真实回执 #42' } };
    // 当前 i18n stub 保留占位符，但必须走已有回执分支。
    expect(s.actionSummary(step, 0, 'done')).toContain('证据：'); w.unmount();
  });

});
