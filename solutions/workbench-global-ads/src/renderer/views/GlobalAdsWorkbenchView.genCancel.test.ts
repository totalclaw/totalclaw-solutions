// @vitest-environment happy-dom
/**
 * OPS-04 回归护栏（真实挂载）：用户主动取消成片，界面报的必须是「已取消」而不是「失败」。
 *
 * 修前：快路的取消只能把「已取消」塞进 error 字段，上层统一拼成
 * 「图片成片失败：已取消」——「失败」和「已取消」语义相反，用户会以为出了错，
 * 去排查、去重试。修后主进程带独立的 `cancelled` 标记，界面据此走中性收尾：
 * 节点停在「已取消」（不标红），提示是 info 而不是 fromException 的红字。
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

const cancelSlideshow = vi.fn(async () => ({ ok: true }));

function installApi(slideshow: (...args: any[]) => Promise<any>) {
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
      slideshow: vi.fn(slideshow),
      cancelSlideshow,
    },
    solution: {
      pickFolder: vi.fn(async () => ''),
      listMediaDir: vi.fn(async () => ({ ok: false })),
      inspectMedia: vi.fn(async () => ({ ok: true })),
      previewMedia: vi.fn(async () => ({ ok: false })),
    },
    listOpenclawCronJobs: vi.fn(async () => []),
    saveOpenclawCronJobs: vi.fn(async () => ({})),
    saveWorkflow: vi.fn(async () => ({})),
    runWorkflow: vi.fn(async () => ({})),
    llmOneshot: vi.fn(async () => ({ text: '' })),
  };
}

async function mountAndRunDynamic() {
  const wrapper = mount(GlobalAdsWorkbenchView, {
    global: { mocks: { $t: (s: string, _p?: any) => s }, stubs: { Teleport: true } },
  });
  await flushMany();
  const modeButtons = wrapper.findAll('.ps-modes button');
  await modeButtons[1].trigger('click');
  await flushMany(2);
  const runButton = wrapper.find('.run-button');
  await runButton.trigger('click');
  await flushMany();
  return { wrapper, runButton };
}

describe('GlobalAdsWorkbenchView 主动取消成片', () => {
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
    localStorage.setItem('totalclaw:global-ads-material-dir:v1', '/tmp/mats');
    localStorage.setItem('totalclaw:global-ads-prompt-scenes:v1', JSON.stringify([
      { id: '01', referenceImage: '/tmp/mats/a.jpg', duration: 5, prompt: 'slow push in', caption: 'hi' },
    ]));
    localStorage.setItem('totalclaw:global-ads-prompt-chosen:v1', '1');
  });

  it('主进程回 cancelled：节点标「已取消」而不是 failed，面板不说「失败」', async () => {
    installApi(async () => ({ ok: false, cancelled: true, error: '已取消' }));
    const { wrapper, runButton } = await mountAndRunDynamic();

    // 在跑的节点收成 cancelled；一个 failed 都不许有（那是「出错了」的语义）
    expect(adsGenNodes.value.some((n) => n.state === 'cancelled')).toBe(true);
    expect(adsGenNodes.value.some((n) => n.state === 'failed')).toBe(false);
    expect(wrapper.find('.run-live-head strong').text()).toContain('已取消本次成片');
    expect(wrapper.find('.run-live-head strong').text()).not.toContain('失败');

    // 取消是中性事件：走 info，绝不弹「生成广告成片失败」
    expect(holder.notif.info).toHaveBeenCalledWith('已取消本次成片');
    expect(holder.notif.fromException).not.toHaveBeenCalled();

    // 闸门必须释放，按钮立刻能再点
    expect(adsGenActive.value).toBe(false);
    expect(runButton.attributes('disabled')).toBeUndefined();
    wrapper.unmount();
  });

  it('真失败仍然是失败：不能因为加了取消分支把出错也说成「已取消」', async () => {
    installApi(async () => ({ ok: false, error: '动态视频生成失败：ARK_API_KEY 未配置' }));
    const { wrapper } = await mountAndRunDynamic();

    expect(adsGenNodes.value.some((n) => n.state === 'cancelled')).toBe(false);
    expect(holder.notif.fromException).toHaveBeenCalledWith('生成广告成片失败', expect.anything());
    expect(holder.notif.info).not.toHaveBeenCalledWith('已取消本次成片');
    wrapper.unmount();
  });

  it('取消按钮只在生成中出现，点它会真的调主进程的取消通道', async () => {
    // 让 slideshow 挂着不 resolve：这样能观察到「生成中」那一刻的界面
    let release: (v: any) => void = () => {};
    installApi(() => new Promise((r) => { release = r; }));
    const wrapper = mount(GlobalAdsWorkbenchView, {
      global: { mocks: { $t: (s: string, _p?: any) => s }, stubs: { Teleport: true } },
    });
    await flushMany();
    await wrapper.findAll('.ps-modes button')[1].trigger('click');
    await flushMany(2);
    await wrapper.find('.run-button').trigger('click');
    await flushMany();

    const cancelButton = wrapper.findAll('.run-live-head button')
      .find((b) => b.text().includes('取消生成'));
    expect(cancelButton).toBeTruthy();
    await cancelButton!.trigger('click');
    await flushMany(2);
    expect(cancelSlideshow).toHaveBeenCalledTimes(1);

    // 子进程真被杀之后主进程才回 cancelled —— 收尾走的仍是同一条路
    release({ ok: false, cancelled: true, error: '已取消' });
    await flushMany();
    expect(adsGenActive.value).toBe(false);
    expect(adsGenNodes.value.some((n) => n.state === 'cancelled')).toBe(true);
    wrapper.unmount();
  });
});
