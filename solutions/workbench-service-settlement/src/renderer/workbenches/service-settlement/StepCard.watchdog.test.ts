// @vitest-environment happy-dom
/**
 * 共享步骤卡（StepCard，~40 个工作台 tab 共用）的看门狗护栏：
 * 进行中显示真实已用时长、跑过怀疑线出「可能已超时」卡、失败出红卡 + 重新生成（宿主给了 retry 才有）。
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { nextTick, reactive } from 'vue';

vi.mock('vue-router', () => ({ useRouter: () => ({ push: vi.fn(async () => undefined) }) }));
vi.mock('../../i18n', () => ({
  t: (s: string, p?: Record<string, unknown>) => (p ? s.replace(/\{(\w+)\}/g, (_m, k) => String(p[k] ?? `{${k}}`)) : s),
}));

import StepCard from './StepCard.vue';
import StickyProgress from './StickyProgress.vue';
import type { StepRuntime } from './shared';

const MIN = 60_000;
const t = (s: string, p?: Record<string, unknown>) => (p ? s.replace(/\{(\w+)\}/g, (_m, k) => String(p[k] ?? `{${k}}`)) : s);

function mountCard(runtime: StepRuntime, extra: Record<string, unknown> = {}) {
  return mount(StepCard, {
    props: { stepKey: 'k', index: 0, title: '成片', runtime, ...extra },
    global: { mocks: { $t: t } },
  });
}

describe('StepCard 看门狗', () => {
  beforeEach(() => { vi.useFakeTimers(); vi.setSystemTime(new Date(2_000_000_000_000)); });
  afterEach(() => { vi.useRealTimers(); });

  it('进行中：状态胶囊从 startedAt 起显示真实已用时长；跑过预计说「比预计慢」', async () => {
    const runtime = reactive<StepRuntime>({ state: 'running', startedAt: Date.now() - 65_000, estimateSec: 60, kind: 'video' });
    const w = mountCard(runtime);
    await nextTick();
    expect(w.find('.ss-step__state').text()).toContain('1 分 5 秒');
    expect(w.find('.ss-step__state').text()).toContain('比预计慢');
    expect(w.find('.sra').exists()).toBe(false);
    vi.advanceTimersByTime(3_000);
    await nextTick();
    expect(w.find('.ss-step__state').text()).toContain('1 分 8 秒');
    w.unmount();
  });

  it('跑过 max(预计×3, 预计+5min) 且无进度 → 「可能已超时」卡：继续等待可重新上弦；宿主没给 retry 就没有重新生成按钮', async () => {
    const runtime = reactive<StepRuntime>({ state: 'running', startedAt: Date.now(), estimateSec: 60, kind: 'video' });
    const w = mountCard(runtime);
    vi.advanceTimersByTime(6 * MIN);
    await nextTick();
    const alert = w.find('.sra.suspect');
    expect(alert.exists()).toBe(true);
    expect(alert.text()).toContain('可能已超时');
    expect(alert.text()).toContain('继续等待');
    expect(alert.text()).toContain('查看日志');
    expect(alert.text()).not.toContain('重新生成');
    expect(w.find('.ss-step__state').text()).toContain('可能已超时');

    await alert.findAll('button').find((b) => b.text().includes('继续等待'))!.trigger('click');
    await nextTick();
    expect(w.find('.sra.suspect').exists()).toBe(false);
    vi.advanceTimersByTime(6 * MIN);
    await nextTick();
    expect(w.find('.sra.suspect').exists()).toBe(true);
    w.unmount();
  });

  it('有进度事件（runtime.progressAt 在更新）就不判超时；进度断了才判', async () => {
    const runtime = reactive<StepRuntime>({ state: 'running', startedAt: Date.now(), estimateSec: 30, kind: 'image' });
    const w = mountCard(runtime);
    for (let i = 0; i < 10; i += 1) {
      vi.advanceTimersByTime(MIN);
      runtime.progressAt = Date.now();
      await nextTick();
      expect(w.find('.sra.suspect').exists()).toBe(false);
    }
    vi.advanceTimersByTime(5 * MIN + 1_000);
    await nextTick();
    expect(w.find('.sra.suspect').exists()).toBe(true);
    w.unmount();
  });

  it('失败：红卡写原因，宿主给了 retry 才有「重新生成」；可能已超时时点重新生成先 cancel 再 retry', async () => {
    const runtime = reactive<StepRuntime>({ state: 'failed', error: '素材目录里没找到图片' });
    const retry = vi.fn(async () => undefined);
    const w = mountCard(runtime, { retry });
    await nextTick();
    const failed = w.find('.sra.failed');
    expect(failed.exists()).toBe(true);
    expect(failed.text()).toContain('素材目录里没找到图片');
    await failed.findAll('button').find((b) => b.text().includes('重新生成'))!.trigger('click');
    expect(retry).toHaveBeenCalledTimes(1);
    w.unmount();

    const calls: string[] = [];
    const runtime2 = reactive<StepRuntime>({ state: 'running', startedAt: Date.now(), kind: 'video' });
    const w2 = mountCard(runtime2, {
      retry: async () => { calls.push('retry'); },
      cancel: async () => { calls.push('cancel'); },
    });
    vi.advanceTimersByTime(10 * MIN + 1_000);
    await nextTick();
    const suspect = w2.find('.sra.suspect');
    expect(suspect.exists()).toBe(true);
    await suspect.findAll('button').find((b) => b.text().includes('重新生成'))!.trigger('click');
    await nextTick();
    expect(calls).toEqual(['cancel', 'retry']);
    w2.unmount();
  });

  it('终态后表停：running → done 不再显示时长；失败态没有 spinner', async () => {
    const runtime = reactive<StepRuntime>({ state: 'running', startedAt: Date.now() });
    const w = mountCard(runtime);
    vi.advanceTimersByTime(10_000);
    await nextTick();
    expect(w.find('.ss-step__state').text()).toContain('10 秒');
    runtime.state = 'done';
    runtime.summary = '完成了';
    await nextTick();
    expect(w.find('.ss-step__state').text()).toBe('完成');
    expect(w.find('.spin').exists()).toBe(false);
    runtime.state = 'failed';
    runtime.error = '坏了';
    await nextTick();
    expect(w.find('.spin').exists()).toBe(false);
    expect(w.find('.sra.failed').exists()).toBe(true);
    w.unmount();
  });
});

describe('StickyProgress 已耗时', () => {
  beforeEach(() => { vi.useFakeTimers(); vi.setSystemTime(new Date(2_000_000_000_000)); });
  afterEach(() => { vi.useRealTimers(); });

  it('从正在跑那一步的 startedAt 算（重挂载不归零）；可能已超时时换文案', async () => {
    const metas = [{ key: 'a', title: 'A' }, { key: 'b', title: 'B' }];
    const runtime = reactive<Record<string, StepRuntime>>({
      a: { state: 'done' },
      b: { state: 'running', startedAt: Date.now() - 90_000, kind: 'llm', estimateSec: 20 },
    });
    const w = mount(StickyProgress, {
      props: { title: 'T', metas, runtime, currentKey: 'b' },
      global: { mocks: { $t: t }, stubs: { WorkbenchStepBar: true } },
    });
    await nextTick();
    expect(w.find('.ss-progress__live').text()).toContain('1 分 30 秒');
    vi.advanceTimersByTime(4 * MIN);
    await nextTick();
    expect(w.find('.ss-progress__live').text()).toContain('可能已超时');
    runtime.b = { state: 'failed', error: 'x' };
    await nextTick();
    expect(w.find('.ss-progress__live.bad').text()).toContain('第 2 步失败');
    w.unmount();
  });
});
