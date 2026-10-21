// @vitest-environment happy-dom
/** 古兰经教师端进度条已耗时：从正在跑那一步的 startedAt 算（切学生端再切回不归零）；4 分钟没进度标「可能已超时」。 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { nextTick, reactive } from 'vue';

vi.mock('../../i18n', () => ({
  t: (s: string, p?: Record<string, unknown>) => (p ? s.replace(/\{(\w+)\}/g, (_m, k) => String(p[k] ?? `{${k}}`)) : s),
}));

import QtProgress from './QtProgress.vue';

const t = (s: string, p?: Record<string, unknown>) => (p ? s.replace(/\{(\w+)\}/g, (_m, k) => String(p[k] ?? `{${k}}`)) : s);
const MIN = 60_000;

describe('QtProgress 已耗时', () => {
  beforeEach(() => { vi.useFakeTimers(); vi.setSystemTime(new Date(2_000_000_000_000)); });
  afterEach(() => { vi.useRealTimers(); });

  it('从 startedAt 算；无进度 4 分钟 → 可能已超时；liveMsg 变化是心跳', async () => {
    const metas = [{ key: 'parse', title: 'A', hint: '', icon: 'x' }, { key: 'quiz', title: 'B', hint: '', icon: 'x' }] as any;
    const runtime = reactive<Record<string, any>>({ parse: { state: 'done' }, quiz: { state: 'running', startedAt: Date.now() - 2 * MIN } });
    const w = mount(QtProgress, { props: { metas, runtime, currentKey: 'quiz', liveMsg: '' }, global: { mocks: { $t: t } } });
    await nextTick();
    expect(w.find('.live').text()).toContain('2 分 0 秒');
    vi.advanceTimersByTime(4 * MIN);
    await nextTick();
    expect(w.find('.live').text()).toContain('可能已超时');
    await w.setProps({ liveMsg: '出题 2/5' });
    await nextTick();
    expect(w.find('.live').text()).toContain('出题 2/5');
    expect(w.find('.live').text()).not.toContain('可能已超时');
    runtime.quiz = { state: 'done' };
    await nextTick();
    expect(w.find('.live.ok').text()).toContain('全部完成');
    w.unmount();
  });
});
