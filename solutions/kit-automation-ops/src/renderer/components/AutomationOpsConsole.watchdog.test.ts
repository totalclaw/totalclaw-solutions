// @vitest-environment happy-dom
/**
 * 场景执行台（医疗 / 仓储等 AutomationOpsConsole）的看门狗：执行中很久没有步骤回执 → 「可能已超时」；
 * 继续等待重新上弦；「停止并重新开始」先取消再起新一轮；有回执就不怀疑。
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { nextTick } from 'vue';
import { STALL_CAP_MS } from '../composables/useStepWatchdog';

vi.mock('vue-router', () => ({ useRouter: () => ({ push: vi.fn(async () => undefined) }) }));
vi.mock('../i18n', () => ({ t: (s: string, p?: Record<string, unknown>) => (p ? s.replace(/\{(\w+)\}/g, (_m, k) => String(p[k] ?? `{${k}}`)) : s) }));
vi.mock('../composables/useNativeBrowserModalLock', () => ({ createNativeBrowserModalLock: () => ({ set: vi.fn(), release: vi.fn() }) }));
import Console from './AutomationOpsConsole.vue';

function setup(execute: any) {
  const w = mount(Console, {
    props: { domain: 'warehouse', execute },
    global: { mocks: { $t: (s: string, p?: Record<string, unknown>) => (p ? s.replace(/\{(\w+)\}/g, (_m, k) => String(p[k] ?? '')) : s) }, stubs: { HumanConfirmCard: true } },
  });
  return { w, s: (w.vm as any).$.setupState };
}

describe('AutomationOpsConsole 看门狗', () => {
  beforeEach(() => { localStorage.clear(); vi.useFakeTimers(); vi.setSystemTime(new Date(2_000_000_000_000)); });
  afterEach(() => { vi.useRealTimers(); });

  it('执行中无回执超过上限 → 可能已超时；继续等待重新上弦；停止并重新开始 = 取消 + 再起', async () => {
    const cancel = vi.fn(async () => undefined);
    let reportStep: ((i: number, note?: string) => void) | null = null;
    const execute = vi.fn(async (_id: string, _phase: string, report: any, ctx: any) => {
      ctx.registerCancellation(cancel);
      reportStep = report;
      report(0, '开始');
      // 永远不结束：模拟执行器卡住
      await new Promise(() => undefined);
    });
    const { w, s } = setup(execute);
    void s.start();
    // start() 里先 await beforeStart / 取消旧运行再置 running：多刷几轮微任务
    await vi.advanceTimersByTimeAsync(0);
    await vi.advanceTimersByTimeAsync(0);
    await nextTick();
    expect(s.runStatus).toBe('running');
    expect(w.find('.sra.suspect').exists()).toBe(false);

    vi.advanceTimersByTime(STALL_CAP_MS.publish - 1_000);
    await nextTick();
    expect(w.find('.sra.suspect').exists()).toBe(false);
    expect(w.find('.run-elapsed').text()).toContain('已运行');
    vi.advanceTimersByTime(2_000);
    await nextTick();
    const alert = w.find('.sra.suspect');
    expect(alert.exists()).toBe(true);
    expect(alert.text()).toContain('可能已超时');

    // 一条步骤回执 = 心跳：卡消失
    reportStep!(1, '下一步');
    await nextTick();
    expect(w.find('.sra.suspect').exists()).toBe(false);
    vi.advanceTimersByTime(STALL_CAP_MS.publish + 1_000);
    await nextTick();
    expect(w.find('.sra.suspect').exists()).toBe(true);

    await w.find('.sra.suspect').findAll('button').find((b) => b.text().includes('继续等待'))!.trigger('click');
    await nextTick();
    expect(w.find('.sra.suspect').exists()).toBe(false);
    vi.advanceTimersByTime(STALL_CAP_MS.publish + 1_000);
    await nextTick();
    expect(w.find('.sra.suspect').exists()).toBe(true);

    await w.find('.sra.suspect').findAll('button').find((b) => b.text().includes('停止并重新开始'))!.trigger('click');
    for (let i = 0; i < 6; i += 1) await vi.advanceTimersByTimeAsync(0);
    await nextTick();
    expect(cancel).toHaveBeenCalledTimes(1);
    expect(execute).toHaveBeenCalledTimes(2);
    expect(s.runStatus).toBe('running');
    w.unmount();
  });

  it('等待人工确认不算卡住', async () => {
    const execute = vi.fn(async (_id: string, _phase: string, report: any, ctx: any) => {
      ctx.registerCancellation(async () => undefined);
      report(0);
      return { progressManaged: true };
    });
    const { w, s } = setup(execute);
    await s.start();
    s.runStatus = 'waiting';
    await nextTick();
    vi.advanceTimersByTime(STALL_CAP_MS.publish * 3);
    await nextTick();
    expect(w.find('.sra.suspect').exists()).toBe(false);
    w.unmount();
  });
});
