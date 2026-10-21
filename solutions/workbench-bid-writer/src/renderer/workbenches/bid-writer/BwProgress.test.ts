// @vitest-environment happy-dom
/** 标书进度条已耗时：从正在跑那一步的 startedAt 算（重挂载不归零）；4 分钟没进度标「可能已超时」；进度事件续命。 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { nextTick, reactive } from 'vue';

vi.mock('../../i18n', () => ({
  t: (s: string, p?: Record<string, unknown>) => (p ? s.replace(/\{(\w+)\}/g, (_m, k) => String(p[k] ?? `{${k}}`)) : s),
}));

import BwProgress from './BwProgress.vue';

const t = (s: string, p?: Record<string, unknown>) => (p ? s.replace(/\{(\w+)\}/g, (_m, k) => String(p[k] ?? `{${k}}`)) : s);
const MIN = 60_000;

describe('BwProgress 已耗时', () => {
  beforeEach(() => { vi.useFakeTimers(); vi.setSystemTime(new Date(2_000_000_000_000)); });
  afterEach(() => { vi.useRealTimers(); });

  it('从 startedAt 算；无进度 4 分钟 → 可能已超时；来一条进度就不再判', async () => {
    const metas = [{ key: 'project', title: 'A' }, { key: 'compose', title: 'B' }] as any;
    const runtime = reactive<Record<string, any>>({ project: { state: 'done' }, compose: { state: 'running', startedAt: Date.now() - 90_000 } });
    const w = mount(BwProgress, { props: { metas, runtime, currentKey: 'compose', live: null }, global: { mocks: { $t: t } } });
    await nextTick();
    expect(w.find('.bw-progress__live').text()).toContain('1 分 30 秒');
    expect(w.find('.bw-progress__live').text()).not.toContain('可能已超时');
    vi.advanceTimersByTime(4 * MIN);
    await nextTick();
    expect(w.find('.bw-progress__live').text()).toContain('可能已超时');
    expect(w.findAll('.wsb-step')[1].text()).toContain('可能已超时');
    await w.setProps({ live: { message: '正在写第 3 章', done: 3, total: 8 } });
    await nextTick();
    expect(w.find('.bw-progress__live').text()).toContain('正在写第 3 章');
    expect(w.find('.bw-progress__live').text()).not.toContain('可能已超时');
    runtime.compose = { state: 'failed', error: 'x' };
    await nextTick();
    expect(w.find('.bw-progress__live.bad').text()).toContain('第 2 步失败');
    w.unmount();
  });
});
