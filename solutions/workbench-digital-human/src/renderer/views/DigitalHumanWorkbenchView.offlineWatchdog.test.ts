// @vitest-environment happy-dom
/**
 * 数字人「口播成片」的看门狗护栏（2026-10-13：「等 10 分钟都没变化，不知道是生成不出来还是正在生成」）：
 * 硬上限到点按失败报 + 重新生成；停止等待是中性终态（不画对勾、没有成片）；查询回 ok=false 即失败；
 * 查询连续报错 → 可能已超时（无取消通道：继续等待 / 查看日志）；刷新 / 换页回来接着轮询上次的任务。真实挂载。
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';

const notify = vi.hoisted(() => ({ error: vi.fn(), warn: vi.fn(), success: vi.fn(), info: vi.fn() }));
vi.mock('../i18n', () => ({
  t: (s: string, p?: Record<string, unknown>) => (p ? s.replace(/\{(\w+)\}/g, (_m, k) => String(p[k] ?? `{${k}}`)) : s),
  i18nKey: (s: string) => s,
  i18n: { global: { locale: { value: 'zh-CN' } } },
}));
vi.mock('vue-i18n', () => ({ useI18n: () => ({ locale: { value: 'zh-CN' } }) }));
vi.mock('vue-router', () => ({ useRouter: () => ({ push: vi.fn(async () => undefined) }) }));
vi.mock('../stores/notification', () => ({ useNotificationStore: () => notify }));

import DigitalHuman from './DigitalHumanWorkbenchView.vue';

const t = (s: string, p?: Record<string, unknown>) => (p ? s.replace(/\{(\w+)\}/g, (_m, k) => String(p[k] ?? `{${k}}`)) : s);
const flushMany = async (rounds = 4) => { for (let i = 0; i < rounds; i += 1) await flushPromises(); };
const MIN = 60_000;
const TASK_KEY = 'totalclaw:digital-human-offline-task:v1';

function installApi(opts: { synthesize?: (...a: any[]) => Promise<any>; query?: (...a: any[]) => Promise<any> } = {}) {
  const digitalHuman = {
    status: vi.fn(async () => ({ ok: true, enabled: true, provider: 'aliyun_dvh' })),
    tracked: vi.fn(async () => ({ sessions: [] })),
    onEvent: vi.fn(() => () => {}),
    synthesize: vi.fn(opts.synthesize || (async () => ({ ok: true, taskId: 'task-1' }))),
    query: vi.fn(opts.query || (async () => ({ ok: true, status: 'running' }))),
  };
  (window as any).electronAPI = { digitalHuman };
  return digitalHuman;
}
async function mountView() {
  const wrapper = mount(DigitalHuman, { global: { mocks: { $t: t }, stubs: { PageBackButton: true, PyExtInstaller: true } } });
  await flushMany();
  const s = (wrapper.vm as any).$.setupState;
  s.activeTab = 'offline';
  s.offline.script = '大家好，欢迎收看。';
  await flushMany();
  return { wrapper, s };
}
const steps = (wrapper: ReturnType<typeof mount>) => wrapper.findAll('.dh-step');

describe('DigitalHumanWorkbenchView 口播成片看门狗', () => {
  beforeEach(() => { vi.clearAllMocks(); localStorage.clear(); vi.useFakeTimers({ shouldAdvanceTime: true }); });
  afterEach(() => { vi.useRealTimers(); });

  it('硬上限：云端一直说 running → 10 分钟到点标失败（不是「已完成」）、红卡带重新生成；重新生成再提交', async () => {
    const api = installApi();
    const { wrapper, s } = await mountView();
    void s.runOffline();
    await flushMany();
    expect(api.synthesize).toHaveBeenCalledTimes(1);
    expect(JSON.parse(localStorage.getItem(TASK_KEY) || 'null')?.taskId).toBe('task-1');

    await vi.advanceTimersByTimeAsync(5_000);
    expect(wrapper.get('[data-test="dh-elapsed"]').text()).toMatch(/已用 5 秒/);
    expect(steps(wrapper)[2].classes()).toContain('running');
    expect(api.query).toHaveBeenCalled();
    expect(wrapper.find('.sra').exists()).toBe(false);

    // 云端一直正常回应：比预计慢也只说慢，不怀疑
    await vi.advanceTimersByTimeAsync(4 * MIN);
    expect(wrapper.get('[data-test="dh-elapsed"]').text()).toContain('已超预计');
    expect(wrapper.find('.sra').exists()).toBe(false);

    await vi.advanceTimersByTimeAsync(6 * MIN + 3_000);
    await flushMany();
    expect(s.offline.running).toBe(false);
    expect(s.offline.videoUrl).toBe('');
    expect(s.offline.error).toContain('10 分钟');
    expect(steps(wrapper)[2].classes()).toContain('failed');
    expect(steps(wrapper)[2].classes()).not.toContain('done');
    const failed = wrapper.get('.sra.failed');
    expect(failed.text()).toContain('10 分钟');
    expect(failed.text()).toContain('重新生成');
    expect(localStorage.getItem(TASK_KEY)).toBeNull();

    await failed.findAll('button').find((b) => b.text().includes('重新生成'))!.trigger('click');
    await flushMany();
    expect(api.synthesize).toHaveBeenCalledTimes(2);
    expect(s.offline.running).toBe(true);
    expect(wrapper.find('.sra').exists()).toBe(false);
    wrapper.unmount();
  });

  it('停止等待：中性终态 —— 不画对勾、没有成片、没有告警卡，本地记录清掉', async () => {
    installApi();
    const { wrapper, s } = await mountView();
    void s.runOffline();
    await vi.advanceTimersByTimeAsync(3_000);
    s.offline.cancelled = true;
    await vi.advanceTimersByTimeAsync(3_000);
    await flushMany();
    expect(s.offline.running).toBe(false);
    expect(s.offline.videoUrl).toBe('');
    expect(s.offline.error).toBe('');
    expect(s.stepState(2)).toBe('stopped');
    expect(steps(wrapper)[2].classes()).toContain('stopped');
    expect(steps(wrapper)[2].classes()).not.toContain('done');
    expect(steps(wrapper)[2].text()).toContain('已停止等待');
    expect(wrapper.find('.sra').exists()).toBe(false);
    expect(localStorage.getItem(TASK_KEY)).toBeNull();
    wrapper.unmount();
  });

  it('查询回 ok=false：按失败报它的原因，不再显示「渲染中」', async () => {
    installApi({ query: async () => ({ ok: false, message: '任务不存在或已过期' }) });
    const { wrapper, s } = await mountView();
    void s.runOffline();
    await vi.advanceTimersByTimeAsync(3_000);
    await flushMany();
    expect(s.offline.running).toBe(false);
    expect(s.offline.error).toBe('任务不存在或已过期');
    expect(steps(wrapper)[2].classes()).toContain('failed');
    expect(wrapper.get('.sra.failed').text()).toContain('任务不存在或已过期');
    wrapper.unmount();
  });

  it('查询连续报错 3 分钟 → 可能已超时（只有 继续等待 / 查看日志）；查询恢复即不怀疑；最终拿到成片', async () => {
    let broken = true;
    installApi({ query: async () => { if (broken) throw new Error('网关 502'); return { ok: true, status: 'running' }; } });
    const { wrapper, s } = await mountView();
    void s.runOffline();
    await vi.advanceTimersByTimeAsync(3 * MIN - 3_000);
    expect(wrapper.find('.sra.suspect').exists()).toBe(false);
    await vi.advanceTimersByTimeAsync(5_000);
    const suspect = wrapper.get('.sra.suspect');
    expect(suspect.text()).toContain('可能已超时');
    expect(suspect.text()).toContain('最近一次查询失败');
    expect(suspect.text()).toContain('继续等待');
    expect(suspect.text()).toContain('查看日志');
    expect(suspect.text()).not.toContain('重新生成');
    expect(wrapper.get('[data-test="dh-elapsed"]').text()).toContain('可能已超时');
    expect(s.offline.running).toBe(true);

    broken = false;
    // 过了预计（3 分钟）又有成功查询：说「已超预计 · 云端仍有回应」，而不是怀疑
    await vi.advanceTimersByTimeAsync(10_000);
    expect(wrapper.find('.sra.suspect').exists()).toBe(false);
    expect(wrapper.get('[data-test="dh-elapsed"]').text()).toContain('云端仍有回应');

    (window as any).electronAPI.digitalHuman.query = vi.fn(async () => ({ ok: true, status: 'done', videoUrl: 'https://cdn/x.mp4' }));
    await vi.advanceTimersByTimeAsync(3_000);
    await flushMany();
    expect(s.offline.running).toBe(false);
    expect(s.offline.videoUrl).toBe('https://cdn/x.mp4');
    expect(steps(wrapper)[3].classes()).toContain('done');
    expect(wrapper.find('.sra').exists()).toBe(false);
    expect(localStorage.getItem(TASK_KEY)).toBeNull();
    wrapper.unmount();
  });

  it('换页回来：上次的任务在硬上限内 → 接着轮询那个 taskId、秒表从真实开始时刻走、文稿还原', async () => {
    const api = installApi();
    localStorage.setItem(TASK_KEY, JSON.stringify({
      taskId: 'task-old', startedAt: Date.now() - 90_000, scriptHash: 'x',
      form: { script: '上次的文稿', avatarId: 'CH_1', avatarType: '2d', aspectRatio: '16:9', subtitle: false },
    }));
    const wrapper = mount(DigitalHuman, { global: { mocks: { $t: t }, stubs: { PageBackButton: true, PyExtInstaller: true } } });
    await flushMany();
    const s = (wrapper.vm as any).$.setupState;
    expect(s.activeTab).toBe('offline');
    expect(s.offline.running).toBe(true);
    expect(s.offline.script).toBe('上次的文稿');
    expect(s.offline.aspectRatio).toBe('16:9');
    expect(api.synthesize).not.toHaveBeenCalled();
    await vi.advanceTimersByTimeAsync(3_000);
    expect(api.query).toHaveBeenCalledWith({ taskId: 'task-old' });
    expect(wrapper.get('[data-test="dh-elapsed"]').text()).toMatch(/已用 1 分 3[0-9] 秒/);
    wrapper.unmount();
  });

  it('换页回来：上次的任务已超过硬上限 → 「上次运行已中断」+ 重新生成（用还原的文稿再提交）', async () => {
    const api = installApi();
    localStorage.setItem(TASK_KEY, JSON.stringify({
      taskId: 'task-stale', startedAt: Date.now() - 11 * MIN, scriptHash: 'x',
      form: { script: '过期任务的文稿', avatarId: '', avatarType: '2d', aspectRatio: '9:16', subtitle: true },
    }));
    const wrapper = mount(DigitalHuman, { global: { mocks: { $t: t }, stubs: { PageBackButton: true, PyExtInstaller: true } } });
    await flushMany();
    const s = (wrapper.vm as any).$.setupState;
    expect(s.offline.running).toBe(false);
    expect(api.query).not.toHaveBeenCalled();
    expect(localStorage.getItem(TASK_KEY)).toBeNull();
    const alert = wrapper.get('.sra.interrupted');
    expect(alert.text()).toContain('上次运行已中断');
    expect(steps(wrapper)[2].classes()).toContain('failed');
    await alert.findAll('button').find((b) => b.text().includes('重新生成'))!.trigger('click');
    await flushMany();
    expect(api.synthesize).toHaveBeenCalledTimes(1);
    expect(api.synthesize.mock.calls[0][0].script).toBe('过期任务的文稿');
    expect(s.offline.running).toBe(true);
    wrapper.unmount();
  });
});
