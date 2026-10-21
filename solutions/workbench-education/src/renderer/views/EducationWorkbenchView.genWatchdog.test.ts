// @vitest-environment happy-dom
/**
 * 教育工作台三条生成（示范音频 / 教案 / 配图）的看门狗护栏：真实已用时长、跑过怀疑线出「可能已超时」
 * （没有取消通道 → 只给 继续等待 / 查看日志）、失败出红卡 + 重新生成（同一函数再跑，序号守卫）。真实挂载。
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';

vi.mock('../i18n', () => ({
  t: (s: string, p?: Record<string, unknown>) => (p ? s.replace(/\{(\w+)\}/g, (_m, k) => String(p[k] ?? `{${k}}`)) : s),
  i18nKey: (s: string) => s,
  i18n: { global: { locale: { value: 'zh-CN' } } },
}));
vi.mock('vue-i18n', () => ({ useI18n: () => ({ locale: { value: 'zh-CN' } }) }));
vi.mock('vue-router', () => ({ useRouter: () => ({ push: vi.fn(async () => undefined) }) }));

import EducationWorkbenchView from './EducationWorkbenchView.vue';
import { STALL_CAP_MS } from '../composables/useStepWatchdog';

const t = (s: string, p?: Record<string, unknown>) => (p ? s.replace(/\{(\w+)\}/g, (_m, k) => String(p[k] ?? `{${k}}`)) : s);
const flushMany = async (rounds = 4) => { for (let i = 0; i < rounds; i += 1) await flushPromises(); };

function installApi(qiye: Record<string, unknown>) {
  (window as any).electronAPI = {
    workbenches: { education: { status: vi.fn(async () => ({ capabilities: {} })), prepareLesson: vi.fn() } },
    qiyeApi: { speechTts: vi.fn(), imageGenerate: vi.fn(), ...qiye },
    mediaModel: { get: vi.fn(async () => ({ kinds: [] })) },
    modelsList: vi.fn(async () => ({})),
  };
  return (window as any).electronAPI;
}

async function mountView() {
  const wrapper = mount(EducationWorkbenchView, {
    global: { mocks: { $t: t }, stubs: { PageBackButton: true } },
  });
  await flushMany();
  // 练习面板默认在「识别」子模式；示范音频在「合成」子模式
  (wrapper.vm as any).$.setupState.speechMode = 'tts';
  await flushMany();
  return wrapper;
}

function ttsButton(wrapper: ReturnType<typeof mount>) {
  return wrapper.findAll('button').find((b) => b.text().includes('生成示范音频') || b.text().includes('正在合成'))!;
}

describe('EducationWorkbenchView 生成看门狗', () => {
  beforeEach(() => { vi.useFakeTimers({ shouldAdvanceTime: true }); });
  afterEach(() => { vi.useRealTimers(); });

  it('示范音频：秒表真实走；过无进度上限 → 可能已超时（只有 继续等待 / 查看日志）；继续等待重新上弦', async () => {
    const api = installApi({ speechTts: vi.fn(() => new Promise(() => {})) });
    const wrapper = await mountView();
    await ttsButton(wrapper).trigger('click');
    await flushMany();
    expect(api.qiyeApi.speechTts).toHaveBeenCalledTimes(1);

    await vi.advanceTimersByTimeAsync(3_000);
    expect(wrapper.get('[data-test="tts-elapsed"]').text()).toMatch(/已用 3 秒/);
    expect(wrapper.find('.sra').exists()).toBe(false);

    await vi.advanceTimersByTimeAsync(STALL_CAP_MS.tts - 3_000 - 3_000);
    expect(wrapper.find('.sra.suspect').exists()).toBe(false);
    await vi.advanceTimersByTimeAsync(4_000);
    const suspect = wrapper.get('.sra.suspect');
    expect(suspect.text()).toContain('可能已超时');
    expect(suspect.text()).toContain('服务端最长等待 5 分钟');
    expect(suspect.text()).toContain('继续等待');
    expect(suspect.text()).toContain('查看日志');
    expect(suspect.text()).not.toContain('重新生成');

    await suspect.findAll('button').find((b) => b.text().includes('继续等待'))!.trigger('click');
    await flushMany();
    expect(wrapper.find('.sra.suspect').exists()).toBe(false);
    await vi.advanceTimersByTimeAsync(STALL_CAP_MS.tts - 3_000);
    expect(wrapper.find('.sra.suspect').exists()).toBe(false);
    await vi.advanceTimersByTimeAsync(4_000);
    expect(wrapper.find('.sra.suspect').exists()).toBe(true);
    wrapper.unmount();
  });

  it('示范音频失败：红卡带原因与重新生成，spinner 停；点重新生成再调一次', async () => {
    const speechTts = vi.fn()
      .mockRejectedValueOnce(new Error('语音服务 elevenlabs 不可用'))
      .mockResolvedValueOnce({ mimeType: 'audio/mpeg', audioBase64: 'AAAA', format: 'mp3', bytes: 3 });
    installApi({ speechTts });
    const wrapper = await mountView();
    await ttsButton(wrapper).trigger('click');
    await flushMany();

    const failed = wrapper.get('.sra.failed');
    expect(failed.text()).toContain('这一步失败了');
    expect(failed.text()).toContain('elevenlabs');
    expect(failed.text()).toContain('重新生成');
    expect(ttsButton(wrapper).find('.spin').exists()).toBe(false);
    expect(wrapper.find('[data-test="tts-elapsed"]').exists()).toBe(false);

    await failed.findAll('button').find((b) => b.text().includes('重新生成'))!.trigger('click');
    await flushMany();
    expect(speechTts).toHaveBeenCalledTimes(2);
    expect(wrapper.find('.sra.failed').exists()).toBe(false);
    expect(wrapper.find('audio').exists()).toBe(true);
    wrapper.unmount();
  });

  it('教案：过模型无进度上限 → 可能已超时（30 分钟说明）；失败红卡可重新生成', async () => {
    const api = installApi({});
    const prepareLesson = api.workbenches.education.prepareLesson as ReturnType<typeof vi.fn>;
    prepareLesson.mockImplementationOnce(() => new Promise(() => {}));
    const wrapper = await mountView();
    const s = (wrapper.vm as any).$.setupState;
    s.activeTab = 'lesson';
    s.lessonForm.topic = '分数加减';
    s.lessonForm.grade = '小学';
    await flushMany();
    void s.prepareLesson();
    await flushMany();
    expect(prepareLesson).toHaveBeenCalledTimes(1);

    await vi.advanceTimersByTimeAsync(STALL_CAP_MS.llm + 1_000);
    const suspect = wrapper.get('.sra.suspect');
    expect(suspect.text()).toContain('服务端最长等待 30 分钟');
    expect(suspect.text()).not.toContain('重新生成');
    expect(wrapper.get('[data-test="lesson-elapsed"]').text()).toContain('已用');
    wrapper.unmount();

    // 失败路径：新实例，拒绝 → 红卡 → 重新生成再调
    prepareLesson.mockRejectedValueOnce(new Error('备课工作流超时'));
    prepareLesson.mockResolvedValueOnce({ plan: 'ok' });
    const w2 = await mountView();
    const s2 = (w2.vm as any).$.setupState;
    s2.activeTab = 'lesson';
    s2.lessonForm.topic = '分数加减';
    s2.lessonForm.grade = '小学';
    await flushMany();
    await s2.prepareLesson();
    await flushMany();
    const failed = w2.get('.sra.failed');
    expect(failed.text()).toContain('备课工作流超时');
    await failed.findAll('button').find((b) => b.text().includes('重新生成'))!.trigger('click');
    await flushMany();
    expect(prepareLesson).toHaveBeenCalledTimes(3);
    expect(w2.find('.sra.failed').exists()).toBe(false);
    w2.unmount();
  });
});
