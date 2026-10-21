// @vitest-environment happy-dom
/**
 * 慈善活动内容工场 · 长步骤看门狗护栏（2026-10-13「视频超时就有提示（报错 / 重新生成），不然等 10 分钟都没变化」）：
 *   · 步骤卡 / 流程条的已耗时从 startedAt 算（重挂载不归零）；
 *   · 跑过预计或无进度上限 → 「可能已超时」卡：继续等待 / 重新生成 / 查看日志；进度事件续命；
 *   · 失败红卡的「重新生成」调宿主给的那一步重跑函数；可能已超时时点重新生成先 cancel 再 retry；
 *   · 状态机：start() 返回 gen，上一轮迟到的 fail / done 不能盖掉新一轮。
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { nextTick, reactive } from 'vue';

vi.mock('vue-router', () => ({ useRouter: () => ({ push: vi.fn(async () => undefined) }) }));

import CcStep from './CcStep.vue';
import CcProgress from './CcProgress.vue';
import { STEP_WATCHDOG, stepMetas, useSteps, type StepRuntime } from './shared';

const g = { global: { mocks: { $t: (s: string, p?: Record<string, unknown>) => (p ? s.replace(/\{(\w+)\}/g, (_, k) => String(p[k] ?? '')) : s) } } };
const MIN = 60_000;

function mountStep(runtime: StepRuntime, extra: Record<string, unknown> = {}) {
  return mount(CcStep, { props: { stepKey: 'video', index: 3, title: '宣传短视频', hint: 'h', icon: 'ri-film-line', runtime, ...extra }, ...g });
}

describe('CcStep 看门狗', () => {
  beforeEach(() => { vi.useFakeTimers(); vi.setSystemTime(new Date(2_000_000_000_000)); });
  afterEach(() => { vi.useRealTimers(); });

  it('已耗时从 startedAt 算（挂载时就是 1 分 5 秒，不从 0 起）；比预计慢明说', async () => {
    const runtime = reactive<StepRuntime>({ state: 'running', startedAt: Date.now() - 65_000, estimateSec: 60, kind: 'video' });
    const w = mountStep(runtime);
    await nextTick();
    expect(w.find('.cc-step__state').text()).toContain('1 分 5 秒');
    expect(w.find('.cc-step__state').text()).toContain('比预计慢');
    expect(w.find('.sra').exists()).toBe(false);
    vi.advanceTimersByTime(3_000);
    await nextTick();
    expect(w.find('.cc-step__state').text()).toContain('1 分 8 秒');
    w.unmount();
  });

  it('视频 10 分钟没有进度 → 「可能已超时」卡；进度事件（progressAt）还在到就不判；继续等待重新上弦', async () => {
    const runtime = reactive<StepRuntime>({ state: 'running', startedAt: Date.now(), kind: 'video', estimateSec: 300 });
    const w = mountStep(runtime, { retry: vi.fn(), cancel: vi.fn() });
    // 前 9 分钟每分钟来一条进度：不判
    for (let i = 0; i < 9; i += 1) {
      vi.advanceTimersByTime(MIN);
      runtime.progressAt = Date.now();
      await nextTick();
      expect(w.find('.sra.suspect').exists()).toBe(false);
    }
    // 之后 10 分钟没进度 → 判
    vi.advanceTimersByTime(10 * MIN + 1_000);
    await nextTick();
    const alert = w.find('.sra.suspect');
    expect(alert.exists()).toBe(true);
    expect(alert.text()).toContain('可能已超时');
    expect(alert.text()).toContain('继续等待');
    expect(alert.text()).toContain('重新生成');
    expect(alert.text()).toContain('查看日志');
    expect(w.find('.cc-step__state').text()).toContain('可能已超时');
    expect(w.classes()).toContain('is-suspect');
    await alert.findAll('button').find((b) => b.text().includes('继续等待'))!.trigger('click');
    await nextTick();
    expect(w.find('.sra.suspect').exists()).toBe(false);
    w.unmount();
  });

  it('失败红卡：原因 + 「重新生成」调宿主那一步的重跑函数；没给 retry 就只有查看日志', async () => {
    const retry = vi.fn(async () => undefined);
    const w = mountStep(reactive<StepRuntime>({ state: 'failed', error: 'ffmpeg 不在' }), { retry });
    await nextTick();
    const failed = w.find('.sra.failed');
    expect(failed.exists()).toBe(true);
    expect(failed.text()).toContain('ffmpeg 不在');
    expect(w.find('.cc-spin').exists()).toBe(false);
    await failed.findAll('button').find((b) => b.text().includes('重新生成'))!.trigger('click');
    expect(retry).toHaveBeenCalledTimes(1);
    w.unmount();

    const w2 = mountStep(reactive<StepRuntime>({ state: 'failed', error: 'x' }));
    expect(w2.find('.sra.failed').text()).not.toContain('重新生成');
    expect(w2.find('.sra.failed').text()).toContain('查看日志');
    w2.unmount();
  });

  it('可能已超时时点「重新生成」：先 cancel（宿主的 cancelRun）再 retry，顺序不能反', async () => {
    const calls: string[] = [];
    const runtime = reactive<StepRuntime>({ state: 'running', startedAt: Date.now(), kind: 'video' });
    const w = mountStep(runtime, {
      retry: async () => { calls.push('retry'); },
      cancel: async () => { calls.push('cancel'); },
    });
    vi.advanceTimersByTime(10 * MIN + 1_000);
    await nextTick();
    await w.find('.sra.suspect').findAll('button').find((b) => b.text().includes('重新生成'))!.trigger('click');
    await nextTick();
    expect(calls).toEqual(['cancel', 'retry']);
    w.unmount();
  });
});

describe('CcProgress 已耗时', () => {
  beforeEach(() => { vi.useFakeTimers(); vi.setSystemTime(new Date(2_000_000_000_000)); });
  afterEach(() => { vi.useRealTimers(); });

  it('从正在跑那一步的 startedAt 算（重挂载不归零）；可能已超时时换文案、步骤副标题同步', async () => {
    const metas = stepMetas();
    const runtime: any = reactive({
      material: { state: 'done' }, report: { state: 'done' }, speech: { state: 'done' },
      video: { state: 'running', startedAt: Date.now() - 90_000, kind: 'video', estimateSec: 300 }, publish: { state: 'todo' },
    });
    const w = mount(CcProgress, { props: { metas, runtime, currentKey: 'video', live: null }, ...g });
    await nextTick();
    expect(w.find('.live').text()).toContain('1 分 30 秒');
    vi.advanceTimersByTime(10 * MIN);
    await nextTick();
    expect(w.find('.live').text()).toContain('可能已超时');
    expect(w.findAll('.wsb-step')[3].text()).toContain('可能已超时');
    // 停止按钮照旧
    await w.findAll('button').find((b) => b.text().includes('停止'))!.trigger('click');
    expect(w.emitted('cancel')).toHaveLength(1);
    w.unmount();
  });
});

describe('步骤状态机 · 看门狗字段与 gen 守卫', () => {
  it('start() 按步骤类型填 kind / estimateSec、清 progressAt；heartbeat() 只打在正在跑的那一步', () => {
    const s = useSteps(stepMetas());
    s.start('video');
    expect(s.runtime.video.kind).toBe(STEP_WATCHDOG.video.kind);
    expect(s.runtime.video.estimateSec).toBe(300);
    expect(s.runtime.video.startedAt).toBeGreaterThan(0);
    s.heartbeat(123_456);
    expect(s.runtime.video.progressAt).toBe(123_456);
    expect(s.runtime.report.progressAt).toBeUndefined();
    s.done('video');
    s.start('video');
    expect(s.runtime.video.progressAt).toBeUndefined();
  });

  it('上一轮迟到的 fail / done 不能盖掉新一轮：带 gen 的收尾只认当前这轮', () => {
    const s = useSteps(stepMetas());
    const gen1 = s.start('video');
    // 用户点了停止 + 重新生成：新一轮开始
    s.fail('video', new Error('已停止'));
    const gen2 = s.start('video');
    expect(gen2).toBe(gen1 + 1);
    expect(s.runtime.video.state).toBe('running');
    // 旧一轮的 await 这时才以「已取消」收尾
    s.fail('video', new Error('已取消'), gen1);
    expect(s.runtime.video.state).toBe('running');
    s.done('video', '旧的', gen1);
    expect(s.runtime.video.state).toBe('running');
    // 新一轮自己的收尾正常生效
    s.done('video', '3 个语言版本成片完成', gen2);
    expect(s.runtime.video.state).toBe('done');
    expect(s.runtime.video.summary).toBe('3 个语言版本成片完成');
    // 不带 gen 的调用（停止按钮）照旧立即生效
    s.start('video');
    s.fail('video', new Error('已停止'));
    expect(s.runtime.video.error).toBe('已停止');
  });
});
