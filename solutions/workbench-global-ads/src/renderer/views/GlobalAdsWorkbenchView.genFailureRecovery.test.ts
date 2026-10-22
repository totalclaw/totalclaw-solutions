// @vitest-environment happy-dom
/**
 * 第 5 步「一键执行投放」生成失败恢复护栏（2026-08-05 深度 review，真实挂载）：
 * 动态视频生成路径上有多个「进 try/finally 之前」的抛点（快路接口缺失 / 没有参考图 /
 * 模型没回分镜），而 adsGenActive 在 runAdsVideoGenerationInline 开头就被置 true。
 * 修前这些抛点不会收尾运行标志 —— 「一键执行投放」按钮永远停在「正在生成成片…」
 * 禁用态（adsGenActive 是模块级共享状态，换页回来也不会好）。
 * 修后：startInlineAdsPublish 的 catch 兜底收掉 adsGenActive；「没有参考图」抛点
 * 先把 ① 节点标 failed，面板如实显示「成片生成失败」。
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';

const holder = vi.hoisted(() => ({
  notif: {
    info: vi.fn(), success: vi.fn(), warn: vi.fn(), error: vi.fn(), fromException: vi.fn(),
  },
}));

vi.mock('vue-router', () => ({
  useRouter: () => ({ push: vi.fn() }),
}));
vi.mock('../stores/notification', () => ({
  useNotificationStore: () => holder.notif,
}));
vi.mock('../i18n', () => ({
  i18nKey: (s: string) => s,
  t: (s: string, _p?: any) => s,
  i18n: { global: { locale: { value: 'zh-CN' } } },
}));
vi.mock('../composables/useNativeBrowserModalLock', () => ({
  createNativeBrowserModalLock: () => ({ set: vi.fn(), release: vi.fn() }),
}));
vi.mock('../components/AutomationOpsConsole.vue', () => ({
  default: { name: 'AutomationOpsConsole', template: '<div class="aoc-stub" />' },
}));

import GlobalAdsWorkbenchView from './GlobalAdsWorkbenchView.vue';
import {
  adsPublishBusyId, adsPublishRuns, adsGenActive, adsGenNodes, adsGenMessage,
  adsGenPreviewPath, adsRunInterrupted, adsRunStartedAt,
} from '../composables/adsRunState';

const flush = () => new Promise((r) => setTimeout(r, 0));
const flushMany = async (rounds = 8) => { for (let i = 0; i < rounds; i += 1) await flush(); };

const VIDEO_PATH = '/tmp/mats/广告成片/uae-ad-20260805-9x16.mp4';

function installApi(overrides: Record<string, any> = {}) {
  (window as any).electronAPI = {
    mediaModel: {
      get: vi.fn(async () => ({
        kinds: [
          {
            kind: 'video', label: '视频生成', activeProvider: 'seedance',
            providers: [{ id: 'seedance', label: 'Seedance', configured: true, keys: [] }],
          },
          { kind: 'tts', label: 'TTS', activeProvider: null, providers: [] },
        ],
      })),
      save: vi.fn(async () => ({})),
    },
    workbenches: {
      globalAds: {
        status: vi.fn(async () => ({ regionAllowed: true })),
        platforms: vi.fn(async () => ([
          { platform: 'facebook', configured: true, enabled: true, mode: 'web', webLogin: { state: 'ready' } },
        ])),
        audit: vi.fn(async () => ({ entries: [] })),
        publish: vi.fn(async () => ({ success: true })),
      },
    },
    globalAdsRun: {
      save: vi.fn(async () => ({})),
      load: vi.fn(async () => ({ state: null })),
      onSlideshowProgress: vi.fn(() => () => {}),
      // 注意：默认**不带 slideshow** —— 模拟快路接口缺失的抛点
    },
    solution: {
      pickFolder: vi.fn(async () => ''),
      listMediaDir: vi.fn(async () => ({ ok: false })),
      inspectMedia: vi.fn(async () => ({ ok: true, path: VIDEO_PATH })),
      previewMedia: vi.fn(async () => ({ ok: false })),
    },
    listOpenclawCronJobs: vi.fn(async () => []),
    saveOpenclawCronJobs: vi.fn(async () => ({})),
    saveWorkflow: vi.fn(async () => ({})),
    runWorkflow: vi.fn(async () => ({})),
    llmOneshot: vi.fn(async () => ({ text: '' })),
    ...overrides,
  };
}

async function mountView() {
  const wrapper = mount(GlobalAdsWorkbenchView, {
    global: { mocks: { $t: (s: string, _p?: any) => s }, stubs: { Teleport: true } },
  });
  await flushMany();
  return wrapper;
}

/** 切到「动态视频生成」并点第 5 步执行按钮。 */
async function switchToDynamicAndRun(wrapper: any) {
  const modeButtons = wrapper.findAll('.ps-modes button');
  expect(modeButtons.length).toBe(2);
  await modeButtons[1].trigger('click');
  await flushMany(2);
  const runButton = wrapper.find('.run-button');
  expect(runButton.attributes('disabled')).toBeUndefined();
  await runButton.trigger('click');
  await flushMany();
  return runButton;
}

describe('GlobalAdsWorkbenchView 第 5 步生成失败后的恢复', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    // adsRunState 是模块级共享状态，测试之间必须手动清干净
    adsPublishBusyId.value = '';
    adsPublishRuns.value = [];
    adsGenActive.value = false;
    adsGenNodes.value = [];
    adsGenMessage.value = '';
    adsGenPreviewPath.value = '';
    adsRunInterrupted.value = false;
    adsRunStartedAt.value = 0;
    // 素材目录 + 已保存的分镜提示词：第 3 步就绪（动态模式）
    localStorage.setItem('totalclaw:global-ads-material-dir:v1', '/tmp/mats');
    localStorage.setItem('totalclaw:global-ads-prompt-scenes:v1', JSON.stringify([
      { id: '01', referenceImage: '/tmp/mats/a.jpg', duration: 5, prompt: 'slow push in', caption: 'hi' },
    ]));
    localStorage.setItem('totalclaw:global-ads-prompt-chosen:v1', '1');
  });

  it('快路接口缺失：抛错后按钮恢复可点，adsGenActive 不再永远卡 true', async () => {
    installApi(); // globalAdsRun 无 slideshow → runSeedanceFastPath 入口即抛
    const wrapper = await mountView();
    const runButton = await switchToDynamicAndRun(wrapper);

    expect(holder.notif.fromException).toHaveBeenCalledWith('生成广告成片失败', expect.anything());
    expect(adsGenActive.value).toBe(false);
    // 按钮必须恢复可点：修前 adsGenActive 卡 true，这里永远 disabled + 「正在生成成片…」
    expect(runButton.attributes('disabled')).toBeUndefined();
    expect(runButton.text()).not.toContain('正在生成成片…');
    wrapper.unmount();
  });

  it('没有参考图且素材目录读不到：开跑前预检就拦下，不摆节点、原地说原因，按钮同样恢复', async () => {
    // 本轮不选提示词（chosen=0），改用「已选历史成片」满足第 3 步。
    // 2026-10-13 起这种情况在**开跑前**就被预检拦下（listMediaDir ok:false → 目录读不到），
    // 不再先摆出 4 个节点、再在 ① 上失败：用户要的是「别开始」，不是「开始了再告诉我不行」。
    localStorage.setItem('totalclaw:global-ads-prompt-chosen:v1', '0');
    localStorage.setItem('totalclaw:global-ads-video-history:v1', JSON.stringify([
      { id: 'a1', projectName: 'UAE', path: VIDEO_PATH, createdAt: 1754300000000 },
    ]));
    installApi({
      globalAdsRun: {
        save: vi.fn(async () => ({})),
        load: vi.fn(async () => ({ state: null })),
        onSlideshowProgress: vi.fn(() => () => {}),
        slideshow: vi.fn(async () => ({ ok: true, produced: [] })),
      },
    });
    const wrapper = await mountView();
    // 选中历史成片（第三个动作按钮 = 选为发布视频）
    const actionButtons = wrapper.findAll('.ads-video-actions button');
    expect(actionButtons.length).toBeGreaterThanOrEqual(3);
    await actionButtons[2].trigger('click');
    await flushMany(2);

    const runButton = await switchToDynamicAndRun(wrapper);

    expect(adsGenActive.value).toBe(false);
    // 预检拦下 = 根本没开始：没有节点、没有「成片生成失败」面板
    expect(adsGenNodes.value).toEqual([]);
    expect(wrapper.find('.run-live').exists()).toBe(false);
    const blocked = wrapper.findAll('.run-blocked').map((el) => el.text()).join('\n');
    expect(blocked).toContain('素材文件夹读不到');
    expect(holder.notif.warn).toHaveBeenCalledTimes(1);
    // 预检没过不是「生成失败」，不弹红字
    expect(holder.notif.fromException).not.toHaveBeenCalled();
    // 「全部就绪」不许与阻断原因同屏
    expect(wrapper.text()).not.toContain('全部就绪，可一键执行。');
    expect(runButton.attributes('disabled')).toBeUndefined();
    wrapper.unmount();
  });
});
