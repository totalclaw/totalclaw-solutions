// @vitest-environment happy-dom
/**
 * AI 学习中心（文档生成教案）的看门狗护栏：生成中的教案 / 数字人讲解显示真实已用时长；很久没收到
 * 主进程事件 → 「可能已超时」（没有取消通道：只给 继续等待 / 查看日志）；事件到达即不怀疑。真实挂载。
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import type { EduHubEvent } from '@totalclaw/ipc-contracts';

vi.mock('../i18n', () => ({
  t: (s: string, p?: Record<string, unknown>) => (p ? s.replace(/\{(\w+)\}/g, (_m, k) => String(p[k] ?? `{${k}}`)) : s),
  i18nKey: (s: string) => s,
  i18n: { global: { locale: { value: 'zh-CN' } } },
}));
vi.mock('vue-router', () => ({
  useRoute: () => ({ query: {} }),
  useRouter: () => ({ push: vi.fn(async () => undefined), replace: vi.fn(async () => undefined) }),
}));
vi.mock('../composables/useDialog', () => ({ useDialog: () => ({ confirm: vi.fn(async () => true), prompt: vi.fn() }) }));
vi.mock('../workbenches/solutionAccess', () => ({ isSolutionEnabled: vi.fn(async () => false) }));
vi.mock('../workbenches/quran-teaching/QuranPlatform.vue', () => ({ default: { name: 'QuranPlatform', template: '<div />' } }));
vi.mock('qrcode', () => ({ default: { toDataURL: vi.fn(async () => 'data:image/png;base64,AA') } }));

import EduHubWorkbenchView from './EduHubWorkbenchView.vue';
import { STALL_CAP_MS } from '../composables/useStepWatchdog';

const t = (s: string, p?: Record<string, unknown>) => (p ? s.replace(/\{(\w+)\}/g, (_m, k) => String(p[k] ?? `{${k}}`)) : s);
const flushMany = async (rounds = 4) => { for (let i = 0; i < rounds; i += 1) await flushPromises(); };
const MIN = 60_000;

const material = { id: 'm1', name: '教材.pdf', ext: '.pdf', pages: 3, chars: 1200, status: 'ready', importedAt: 1 };
const lessonBase = { id: 'l1', materialId: 'm1', materialName: '教材.pdf', plan: null, studentDigest: [], quiz: [] };

let emitEvent: (e: EduHubEvent) => void = () => {};
function installApi(lessons: any[]) {
  const status = { running: true, url: 'http://127.0.0.1:1/x', port: 1, classCode: 'ABCD', onlineStudents: 0, totalStudents: 0 };
  const eduHub = {
    status: vi.fn(async () => status),
    materials: vi.fn(async () => [material]),
    lessons: vi.fn(async () => lessons),
    progress: vi.fn(async () => []),
    questions: vi.fn(async () => []),
    start: vi.fn(async () => status),
    onEvent: vi.fn((cb: (e: EduHubEvent) => void) => { emitEvent = cb; return () => {}; }),
  };
  (window as any).electronAPI = { workbenches: { eduHub } };
  return eduHub;
}
async function mountView() {
  const wrapper = mount(EduHubWorkbenchView, { global: { mocks: { $t: t }, stubs: { PageBackButton: true } } });
  await flushMany();
  (wrapper.vm as any).$.setupState.step = 2;
  await flushMany();
  return wrapper;
}

describe('EduHubWorkbenchView 生成看门狗', () => {
  beforeEach(() => { vi.useFakeTimers({ shouldAdvanceTime: true }); });
  afterEach(() => { vi.useRealTimers(); });

  it('教案生成中：胶囊带真实已用时长；9 分钟没收到事件 → 可能已超时（无重新生成）；事件到达即不怀疑', async () => {
    installApi([{ ...lessonBase, status: 'generating' }]);
    const wrapper = await mountView();
    const chip = wrapper.get('[data-test="eh-gen-chip"]');
    expect(chip.text()).toContain('AI 生成中…');
    await vi.advanceTimersByTimeAsync(4_000);
    expect(wrapper.get('[data-test="eh-gen-chip"]').text()).toMatch(/已用 4 秒/);
    expect(wrapper.find('.sra').exists()).toBe(false);

    // 预计 4 分钟 + 5 分钟宽限 = 9 分钟（模型单次调用上限 5 分钟，默认 4 分钟无进度上限会误判）
    await vi.advanceTimersByTimeAsync(9 * MIN - 4_000 - 3_000);
    expect(wrapper.find('.sra.suspect').exists()).toBe(false);
    await vi.advanceTimersByTimeAsync(4_000);
    const suspect = wrapper.get('.sra.suspect');
    expect(suspect.text()).toContain('教案生成可能已超时');
    expect(suspect.text()).toContain('继续等待');
    expect(suspect.text()).toContain('查看日志');
    expect(suspect.text()).not.toContain('重新生成');

    // 继续等待：卡消失
    await suspect.findAll('button').find((b) => b.text().includes('继续等待'))!.trigger('click');
    await flushMany();
    expect(wrapper.find('.sra.suspect').exists()).toBe(false);

    // 主进程推来 llm 阶段事件 = 心跳：再过很久也只是慢，不怀疑
    await vi.advanceTimersByTimeAsync(9 * MIN + 2_000);
    expect(wrapper.find('.sra.suspect').exists()).toBe(true);
    emitEvent({ kind: 'lesson', id: 'l1', phase: 'llm', lesson: { ...lessonBase, status: 'generating' } as any });
    await flushMany();
    expect(wrapper.find('.sra.suspect').exists()).toBe(false);

    // 生成完成：胶囊与卡都没了
    emitEvent({ kind: 'lesson', id: 'l1', phase: 'draft', lesson: { ...lessonBase, status: 'draft', plan: { title: '分数' } } as any });
    await flushMany();
    expect(wrapper.find('[data-test="eh-gen-chip"]').exists()).toBe(false);
    expect(wrapper.find('.sra').exists()).toBe(false);
    wrapper.unmount();
  });

  it('数字人讲解生成中：已用时长胶囊；按视频无进度上限（10 分钟）判可能已超时', async () => {
    installApi([{ ...lessonBase, status: 'draft', plan: { title: '分数' }, sections: [{ title: '一' }], avatarStatus: 'generating' }]);
    const wrapper = await mountView();
    await vi.advanceTimersByTimeAsync(2_000);
    expect(wrapper.get('[data-test="eh-avatar-chip"]').text()).toMatch(/已用 2 秒/);
    await vi.advanceTimersByTimeAsync(STALL_CAP_MS.video - 2_000 - 3_000);
    expect(wrapper.find('.sra.suspect').exists()).toBe(false);
    await vi.advanceTimersByTimeAsync(4_000);
    expect(wrapper.get('.sra.suspect').text()).toContain('数字人讲解可能已超时');
    emitEvent({ kind: 'lesson', id: 'l1', phase: 'avatar', lesson: { ...lessonBase, status: 'draft', plan: { title: '分数' }, sections: [{ title: '一' }], avatarStatus: 'ready' } as any });
    await flushMany();
    expect(wrapper.find('.sra').exists()).toBe(false);
    expect(wrapper.find('[data-test="eh-avatar-chip"]').exists()).toBe(false);
    wrapper.unmount();
  });
});
