// @vitest-environment happy-dom
/**
 * 第 5 步生成阶段「失败即终止 / 计时真实走 / 超时可判 / 可重新生成 / 开跑前预检」护栏
 * （2026-10-13 用户截图：图片成片报「素材目录里没找到图片」，② 却继续转圈、已用 0 秒、
 * 底下还写着「全部就绪，可一键执行。」）。真实挂载。
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { mount } from '@vue/test-utils';

const holder = vi.hoisted(() => ({
  notif: {
    info: vi.fn(), success: vi.fn(), warn: vi.fn(), error: vi.fn(), fromException: vi.fn(),
  },
  routerPush: vi.fn(async () => undefined),
}));

vi.mock('vue-router', () => ({
  useRouter: () => ({ push: holder.routerPush }),
}));
vi.mock('../stores/notification', () => ({
  useNotificationStore: () => holder.notif,
}));
vi.mock('../i18n', () => ({
  t: (s: string, p?: Record<string, unknown>) => (p
    ? s.replace(/\{(\w+)\}/g, (_m, k) => String(p[k] ?? `{${k}}`)) : s),
  i18n: { global: { locale: { value: 'zh-CN' } } },
}));
vi.mock('../composables/useNativeBrowserModalLock', () => ({
  createNativeBrowserModalLock: () => ({ set: vi.fn(), release: vi.fn() }),
}));
vi.mock('../components/AutomationOpsConsole.vue', () => ({
  default: { name: 'AutomationOpsConsole', template: '<div class="aoc-stub" />' },
}));

import GlobalAdsWorkbenchView from './GlobalAdsWorkbenchView.vue';
import { STALL_CAP_MS } from '../composables/useStepWatchdog';
import {
  adsPublishBusyId, adsPublishRuns, adsGenActive, adsGenNodes, adsGenMessage,
  adsGenPreviewPath, adsRunInterrupted, adsRunStartedAt, adsGenProgressAt, adsGenWaitExtendedAt,
} from '../composables/adsRunState';

const flush = () => new Promise((r) => setTimeout(r, 0));
const flushMany = async (rounds = 8) => { for (let i = 0; i < rounds; i += 1) await flush(); };

type Progress = (p: { stage?: string; msg?: string; done?: number; total?: number }) => void;

function installApi(opts: {
  slideshow: (...args: any[]) => Promise<any>;
  listMediaDir?: (...args: any[]) => Promise<any>;
  onProgress?: (fn: Progress) => void;
  cancelSlideshow?: () => Promise<any>;
}) {
  (window as any).electronAPI = {
    mediaModel: {
      get: vi.fn(async () => ({ kinds: [
        { kind: 'video', label: '视频生成', activeProvider: 'seedance', providers: [{ id: 'seedance', label: 'Seedance', configured: true, keys: [] }] },
        { kind: 'tts', label: 'TTS', activeProvider: null, providers: [] },
      ] })),
      save: vi.fn(async () => ({})),
    },
    workbenches: {
      globalAds: {
        status: vi.fn(async () => ({ regionAllowed: true })),
        platforms: vi.fn(async () => ([{ platform: 'facebook', configured: true, enabled: true, mode: 'web', webLogin: { state: 'ready' } }])),
        audit: vi.fn(async () => ({ entries: [] })),
        publish: vi.fn(async () => ({ success: true })),
      },
    },
    globalAdsRun: {
      save: vi.fn(async () => ({})),
      load: vi.fn(async () => ({ state: null })),
      onSlideshowProgress: vi.fn((fn: Progress) => { opts.onProgress?.(fn); return () => {}; }),
      slideshow: vi.fn(opts.slideshow),
      cancelSlideshow: vi.fn(opts.cancelSlideshow || (async () => ({ ok: true }))),
    },
    solution: {
      pickFolder: vi.fn(async () => ''),
      listMediaDir: vi.fn(opts.listMediaDir || (async () => ({ ok: true, dir: '/tmp/mats', files: [
        { name: 'a.jpg', path: '/tmp/mats/a.jpg', size: 1000, kind: 'image', type: 'image/jpeg' },
      ] }))),
      inspectMedia: vi.fn(async () => ({ ok: true })),
      previewMedia: vi.fn(async () => ({ ok: false })),
    },
    listOpenclawCronJobs: vi.fn(async () => []),
    saveOpenclawCronJobs: vi.fn(async () => ({})),
    saveWorkflow: vi.fn(async () => ({})),
    runWorkflow: vi.fn(async () => ({})),
    llmOneshot: vi.fn(async () => ({ text: '' })),
  };
  return (window as any).electronAPI;
}

async function mountView() {
  const wrapper = mount(GlobalAdsWorkbenchView, {
    global: { mocks: { $t: (s: string, _p?: any) => s }, stubs: { Teleport: true } },
  });
  await flushMany();
  return wrapper;
}

/** 图片成片模式（.ps-modes 第一个）+ 点第 5 步执行 */
async function runSlideshow(wrapper: any) {
  const modeButtons = wrapper.findAll('.ps-modes button');
  await modeButtons[0].trigger('click');
  await flushMany(2);
  const runButton = wrapper.find('.run-button');
  expect(runButton.attributes('disabled')).toBeUndefined();
  await runButton.trigger('click');
  await flushMany();
  return runButton;
}

describe('GlobalAdsWorkbenchView 第 5 步生成看门狗', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    adsPublishBusyId.value = '';
    adsPublishRuns.value = [];
    adsGenActive.value = false;
    adsGenNodes.value = [];
    adsGenMessage.value = '';
    adsGenPreviewPath.value = '';
    adsRunInterrupted.value = false;
    adsRunStartedAt.value = 0;
    adsGenProgressAt.value = 0;
    adsGenWaitExtendedAt.value = 0;
    localStorage.setItem('totalclaw:global-ads-material-dir:v1', '/tmp/mats');
    // 第 3 步就绪：选一条历史成片（slideshow 模式不看分镜）
    localStorage.setItem('totalclaw:global-ads-video-history:v1', JSON.stringify([
      { id: 'a1', projectName: 'UAE', path: '/tmp/mats/广告成片/old-9x16.mp4', createdAt: 1754300000000 },
    ]));
  });
  afterEach(() => { vi.useRealTimers(); });

  it('截图场景：脚本报「没找到图片」→ ② 收成 failed、spinner 停、告警卡带「重新生成」、「全部就绪」消失', async () => {
    installApi({ slideshow: async () => ({ ok: false, error: '图片成片失败：素材目录里没找到图片(jpg/png/webp/heic...)' }) });
    const wrapper = await mountView();
    await wrapper.findAll('.ads-video-actions button')[2].trigger('click');
    await flushMany(2);
    await runSlideshow(wrapper);

    expect(adsGenActive.value).toBe(false);
    const render = adsGenNodes.value.find((n) => n.id === 'render');
    expect(render?.state).toBe('failed');
    expect(adsGenNodes.value.some((n) => n.state === 'running')).toBe(false);
    expect(wrapper.find('.run-live-nodes li.running').exists()).toBe(false);
    expect(wrapper.find('.run-live-head strong').text()).toContain('成片生成失败');
    const alert = wrapper.find('.sra.failed');
    expect(alert.exists()).toBe(true);
    expect(alert.text()).toContain('素材目录里没找到图片');
    expect(alert.text()).toContain('重新生成');
    expect(alert.text()).toContain('查看日志');
    expect(wrapper.text()).not.toContain('全部就绪，可一键执行。');
    wrapper.unmount();
  });

  it('开跑前预检：素材文件夹里没有图片 → 不起任务、不摆节点，原地说明原因', async () => {
    const slideshow = vi.fn(async () => ({ ok: true, produced: [] }));
    installApi({
      slideshow,
      listMediaDir: async () => ({ ok: true, dir: '/tmp/mats', files: [
        { name: 'clip.mp4', path: '/tmp/mats/clip.mp4', size: 5000, kind: 'video', type: 'video/mp4' },
      ] }),
    });
    const wrapper = await mountView();
    await wrapper.findAll('.ads-video-actions button')[2].trigger('click');
    await flushMany(2);
    const runButton = await runSlideshow(wrapper);

    expect(slideshow).not.toHaveBeenCalled();
    expect(adsGenNodes.value).toEqual([]);
    expect(adsGenActive.value).toBe(false);
    const blocked = wrapper.findAll('.run-blocked').map((el) => el.text()).join('\n');
    expect(blocked).toContain('没有图片');
    expect(wrapper.text()).not.toContain('全部就绪，可一键执行。');
    expect(runButton.attributes('disabled')).toBeUndefined();
    wrapper.unmount();
  });

  it('计时从节点真实开始时刻走；跑过怀疑线且无进度 → 「可能已超时」卡，「继续等待」重新上弦，进度到达则不怀疑', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    let progress: Progress = () => {};
    let release: (v: any) => void = () => {};
    installApi({
      slideshow: () => new Promise((r) => { release = r; }),
      onProgress: (fn) => { progress = fn; },
    });
    const wrapper = await mountView();
    await wrapper.findAll('.ads-video-actions button')[2].trigger('click');
    await flushMany(2);
    await runSlideshow(wrapper);
    expect(adsGenActive.value).toBe(true);
    const render = adsGenNodes.value.find((n) => n.id === 'render')!;
    expect(render.state).toBe('running');
    expect(render.kind).toBe('image');
    // 预计按画幅数倍增（45s × 画幅数）；怀疑线 = min(无进度上限 5 分钟, max(预计×3, 预计+5min))
    const etaSec = render.etaSec!;
    expect(etaSec).toBeGreaterThanOrEqual(45);
    const lineSec = Math.min(STALL_CAP_MS.image / 1000, Math.max(etaSec * 3, etaSec + 300));

    // 秒表真的在走
    await vi.advanceTimersByTimeAsync(5_000);
    expect(wrapper.find('.run-live-nodes li.running .node-eta').text()).toMatch(/已用 5 秒/);
    expect(wrapper.find('.sra').exists()).toBe(false);

    // 到怀疑线前几秒还不怀疑；过了线且没有进度 → suspect（留 3 秒余量：假时钟下真实毫秒仍会漂）
    await vi.advanceTimersByTimeAsync((lineSec - 5) * 1000 - 3_000);
    expect(wrapper.find('.sra.suspect').exists()).toBe(false);
    await vi.advanceTimersByTimeAsync(4_000);
    const suspect = wrapper.find('.sra.suspect');
    expect(suspect.exists()).toBe(true);
    expect(suspect.text()).toContain('可能已超时');
    expect(suspect.text()).toContain('继续等待');
    expect(wrapper.find('.run-live-nodes li.running .node-eta').text()).toContain('可能已超时');
    expect(wrapper.text()).not.toContain('全部就绪，可一键执行。');

    // 继续等待：卡消失，再过一个窗口才会再来
    const keep = suspect.findAll('button').find((b) => b.text().includes('继续等待'))!;
    await keep.trigger('click');
    await flushMany(2);
    expect(wrapper.find('.sra.suspect').exists()).toBe(false);
    expect(adsGenWaitExtendedAt.value).toBeGreaterThan(0);
    await vi.advanceTimersByTimeAsync(lineSec * 1000 - 3_000);
    expect(wrapper.find('.sra.suspect').exists()).toBe(false);
    await vi.advanceTimersByTimeAsync(4_000);
    expect(wrapper.find('.sra.suspect').exists()).toBe(true);

    // 主进程推来进度 = 心跳：诚实地回到「仍在生成」，不再怀疑
    progress({ stage: 'render', msg: '正在生成 9:16 成片（1/1）' });
    await flushMany(2);
    expect(adsGenProgressAt.value).toBeGreaterThan(0);
    expect(wrapper.find('.sra.suspect').exists()).toBe(false);
    expect(wrapper.find('.run-live-nodes li.running .node-eta').text()).toContain('仍在生成');

    release({ ok: false, error: '最终还是失败了' });
    await flushMany();
    expect(adsGenActive.value).toBe(false);
    expect(wrapper.find('.sra.failed').exists()).toBe(true);
    wrapper.unmount();
  });

  it('「重新生成」在旧任务还在跑时先取消、等它退出，再起新一轮（不堆僵尸）', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    let release: (v: any) => void = () => {};
    const slideshow = vi.fn(() => new Promise((r) => { release = r; }));
    const cancelSlideshow = vi.fn(async () => { release({ ok: false, cancelled: true, error: '已取消' }); return { ok: true }; });
    installApi({ slideshow, cancelSlideshow });
    const wrapper = await mountView();
    await wrapper.findAll('.ads-video-actions button')[2].trigger('click');
    await flushMany(2);
    await runSlideshow(wrapper);
    expect(slideshow).toHaveBeenCalledTimes(1);

    // 图片成片无进度上限 5 分钟：一条进度都没有就判「可能已超时」
    await vi.advanceTimersByTimeAsync(STALL_CAP_MS.image + 1_000);
    const suspect = wrapper.find('.sra.suspect');
    expect(suspect.exists()).toBe(true);
    const retry = suspect.findAll('button').find((b) => b.text().includes('重新生成'))!;
    await retry.trigger('click');
    await vi.advanceTimersByTimeAsync(1_000);
    await flushMany(4);

    expect(cancelSlideshow).toHaveBeenCalledTimes(1);
    expect(slideshow).toHaveBeenCalledTimes(2);
    // 自己发起的取消是过程不是结果：不弹「已取消本次成片」
    expect(holder.notif.info).not.toHaveBeenCalledWith('已取消本次成片');
    expect(adsGenActive.value).toBe(true);
    expect(adsGenNodes.value.find((n) => n.id === 'render')?.state).toBe('running');
    release({ ok: false, error: '第二轮也失败' });
    await flushMany();
    expect(adsGenActive.value).toBe(false);
    wrapper.unmount();
  });

  it('应用重启后恢复：上一轮 busy 的快照 → 节点标 failed、告警卡是「上次运行已中断」并可重新生成', async () => {
    installApi({ slideshow: async () => ({ ok: true, produced: [] }) });
    (window as any).electronAPI.globalAdsRun.load = vi.fn(async () => ({ state: {
      startedAt: Date.now() - 60_000,
      busy: true,
      runs: [],
      genNodes: [
        { id: 'script', name: '① 生成旁白与字幕文案', state: 'done', etaSec: 25 },
        { id: 'render', name: '② 图片拼接成片', state: 'running', etaSec: 45, startedAt: Date.now() - 50_000, kind: 'image' },
      ],
      genMessage: '正在生成 9:16 成片（1/1）',
      genPreviewPath: '',
      genProgressAt: Date.now() - 40_000,
    } }));
    const wrapper = await mountView();
    expect(adsRunInterrupted.value).toBe(true);
    expect(adsGenActive.value).toBe(false);
    expect(adsGenNodes.value.find((n) => n.id === 'render')?.state).toBe('failed');
    expect(wrapper.find('.run-live-nodes li.running').exists()).toBe(false);
    const alert = wrapper.find('.sra.interrupted');
    expect(alert.exists()).toBe(true);
    expect(alert.text()).toContain('上次运行已中断');
    expect(alert.text()).toContain('重新生成');
    wrapper.unmount();
  });
});
