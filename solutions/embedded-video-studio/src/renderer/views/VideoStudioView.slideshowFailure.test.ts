// @vitest-environment happy-dom
/**
 * 图片成片直连路径失败态回归护栏（2026-08-05 深度 review，真实挂载）：
 * runSlideshowDirect 开跑时把进度面板写成 running（scan/stage/render 三步），
 * 但 videoGenerate 失败只把异常抛给 startProduction 弹 toast——面板没人收尾，
 * 永远停在「视频制作进行中」转圈。修后失败路径必须把面板置为 is-failed，
 * 并把真实失败原因写进当前步骤文案。
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';

const holder = vi.hoisted(() => ({
  notif: {
    info: vi.fn(), success: vi.fn(), warn: vi.fn(), error: vi.fn(), fromException: vi.fn(),
    actionable: vi.fn(),
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
  localizeWorkflowText: (s: string) => s,
  // humanize.ts（humanizeChatError 兜底链）读 i18n.global.locale —— 补齐避免 mock 缺口
  i18n: { global: { locale: { value: 'zh-CN' } } },
}));
vi.mock('../composables/useLocale', () => ({
  currentLocale: () => 'zh-CN',
}));
vi.mock('../composables/useNativeBrowserModalLock', () => ({
  createNativeBrowserModalLock: () => ({ set: vi.fn(), release: vi.fn() }),
}));
vi.mock('../components/workflow/HumanConfirmCard.vue', () => ({
  default: { name: 'HumanConfirmCard', template: '<div class="hcc-stub" />' },
}));

import VideoStudioView from './VideoStudioView.vue';
import { resetVideoStudioRunState } from '../composables/videoStudioRunState';

const flush = () => new Promise((r) => setTimeout(r, 0));

function installApi(videoGenerate: (...args: any[]) => Promise<any>) {
  (window as any).electronAPI = {
    mediaModel: { get: vi.fn(async () => ({ kinds: [] })) },
    listWorkspaceTree: vi.fn(async () => []),
    onTaskRunEvent: vi.fn(() => () => {}),
    solution: {
      videoGenerate: vi.fn(videoGenerate),
      onVideoProgress: vi.fn(() => () => {}),
      inspectMedia: vi.fn(async () => ({ ok: false })),
      previewMedia: vi.fn(async () => ({ ok: false })),
    },
  };
  return (window as any).electronAPI;
}

async function mountAndStartSlideshow() {
  const wrapper = mount(VideoStudioView, {
    global: {
      mocks: { $t: (s: string, _p?: any) => s },
      stubs: { Teleport: true },
    },
  });
  await flush();
  // 默认草稿：brief 非空 + 四平台全选 + productionMode=slideshow；只差素材目录
  await wrapper.find('.folder-picker input').setValue('/tmp/materials');
  await wrapper.find('.start-button').trigger('click');
  await flush();
  await wrapper.find('.preview-confirm').trigger('click');
  // videoGenerate 的拒绝要多轮微任务才冒到 catch
  await flush();
  await flush();
  await flush();
  return wrapper;
}

describe('VideoStudioView 图片成片直连失败态', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    // 进度面板运行态是模块级的（跨实例存活），用例之间必须归零
    resetVideoStudioRunState();
  });

  it('配置状态以实际 fal 通道为准，预览显示按秒费用；只有泰途 Key 时不能误判视频已就绪', async () => {
    const api = installApi(async () => ({ ok: true }));
    api.mediaModel.get = vi.fn(async () => ({ kinds: [{ kind: 'video', activeProvider: 'totalclaw', providers: [{ id: 'totalclaw', configured: true }] }] }));
    const caps = {
      capabilities: [{ id: 't2v', defaultModel: 'minimax/h3-max/text-to-video', models: [{ id: 'minimax/h3-max/text-to-video', label: 'MiniMax', estUsd: 0.065, per: 'second' }] }],
      keys: { primary: false, backup: false, source: 'local' },
    };
    api.mediaFal = { capabilities: vi.fn(async () => structuredClone(caps)) };
    const wrapper = mount(VideoStudioView, { global: { mocks: { $t: (s: string) => s }, stubs: { Teleport: true } } });
    await flush();
    expect(api.mediaFal.capabilities).toHaveBeenCalledWith({ solutionId: 'workbench-global-ads' });
    expect(wrapper.findAll('.production-grid button')[1].attributes('disabled')).toBeDefined();
    caps.keys.primary = true;
    await wrapper.find('.refresh-models').trigger('click');
    await flush();
    expect(wrapper.findAll('.production-grid button')[1].attributes('disabled')).toBeUndefined();
    await wrapper.find('.folder-picker input').setValue('/tmp/materials');
    await wrapper.findAll('.production-grid button')[1].trigger('click');
    await wrapper.find('.start-button').trigger('click');
    await flush();
    expect(wrapper.find('.preview-dialog').text()).toContain('视频生成费用预估');
    expect(wrapper.find('.preview-dialog').text()).toContain('按秒计费');
    wrapper.unmount();
  });

  it('videoGenerate 失败：进度面板置为 is-failed，失败原因写进当前步骤，不再永远转圈', async () => {
    installApi(async () => { throw new Error('FFmpeg 崩了'); });
    const wrapper = await mountAndStartSlideshow();

    const panel = wrapper.find('.job-progress-panel');
    expect(panel.classes()).toContain('is-failed');
    expect(panel.classes()).not.toContain('is-running');
    expect(panel.text()).toContain('FFmpeg 崩了');
    // 失败也要把错误如实告诉用户（startProduction 的 toast 路径不因收尾而丢失）
    expect(holder.notif.fromException).toHaveBeenCalled();
    wrapper.unmount();
  });

  it('videoGenerate 返回 ok:false 同样收尾为失败态', async () => {
    installApi(async () => ({ ok: false, error: '素材目录为空' }));
    const wrapper = await mountAndStartSlideshow();

    const panel = wrapper.find('.job-progress-panel');
    expect(panel.classes()).toContain('is-failed');
    expect(panel.text()).toContain('素材目录为空');
    wrapper.unmount();
  });

  it('配置类失败（No LLM provider configured）→ 真因 + 「去配置」actionable，不吞成泛化文案', async () => {
    installApi(async () => {
      throw new Error('No LLM provider configured: model, base_url or api_key missing.');
    });
    const wrapper = await mountAndStartSlideshow();

    // 分类为配置错误：走 actionable（带「去配置」引导），不再走 fromException 的泛化 humanize
    expect(holder.notif.actionable).toHaveBeenCalledTimes(1);
    const [type, message, action] = holder.notif.actionable.mock.calls[0];
    expect(type).toBe('warn');
    expect(String(message)).toContain('创建视频制作任务失败');
    expect(String(message)).not.toContain('操作失败，请稍后重试');
    expect(action.label).toBe('去配置');
    expect(holder.notif.fromException).not.toHaveBeenCalled();
    // 进度面板仍如实收尾为失败态
    expect(wrapper.find('.job-progress-panel').classes()).toContain('is-failed');
    wrapper.unmount();
  });

  it('成功路径不受收尾逻辑影响：面板到 is-success', async () => {
    installApi(async () => ({ ok: true, videoPath: '/tmp/materials/final.mp4' }));
    (window as any).electronAPI.solution.inspectMedia = vi.fn(async () => ({ ok: true, path: '/tmp/materials/final.mp4' }));
    (window as any).electronAPI.solution.previewMedia = vi.fn(async () => ({ ok: true, srcUrl: 'blob:x', path: '/tmp/materials/final.mp4' }));
    const wrapper = await mountAndStartSlideshow();

    expect(wrapper.find('.job-progress-panel').classes()).toContain('is-success');
    expect(holder.notif.success).toHaveBeenCalled();
    wrapper.unmount();
  });

  it('F2：默认草稿（配音开 + 配乐 cinematic）下 videoGenerate 必须收到 narration + bgmMood（此前被整个丢掉 → 成片无音频流）', async () => {
    const api = installApi(async () => ({ ok: true, videoPath: '/tmp/materials/final.mp4' }));
    api.solution.inspectMedia = vi.fn(async () => ({ ok: true, path: '/tmp/materials/final.mp4' }));
    api.solution.previewMedia = vi.fn(async () => ({ ok: true, srcUrl: 'blob:x', path: '/tmp/materials/final.mp4' }));
    const wrapper = await mountAndStartSlideshow();

    expect(api.solution.videoGenerate).toHaveBeenCalledTimes(1);
    const req = api.solution.videoGenerate.mock.calls[0][0];
    expect(req.bgmMood).toBe('cinematic');
    // 本 harness 没装 llmOneshot → 旁白文案走 brief 回落，绝不许静默丢配音
    expect(Array.isArray(req.narration)).toBe(true);
    expect(req.narration.length).toBeGreaterThan(0);
    expect(String(req.narration[0].text)).not.toBe('');
    wrapper.unmount();
  });
});

describe('F6 陈旧成片绑定（对抗）', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    // 进度面板运行态是模块级的（跨实例存活），用例之间必须归零
    resetVideoStudioRunState();
  });

  const STALE = '/tmp/materials/.totalclaw-video-studio/video_OLD/final.mp4';

  it('旧任务目录里躺着一条真实存在的 final.mp4 + 本次生成失败 → 必须如实报失败，绝不把旧片顶上当结果', async () => {
    // 上一轮成功留下的持久化绑定 + 历史记录（文件在磁盘上仍真实存在 → inspectMedia 恒 ok）
    localStorage.setItem('totalclaw:video-studio-last-job:v2', JSON.stringify({
      conversationId: '', projectName: '旧项目', source: 'direct', videoPath: STALE,
    }));
    localStorage.setItem('totalclaw:video-studio-direct-history:v1', JSON.stringify([
      { videoPath: STALE, projectName: '旧项目', createdAt: Date.now() - 86400_000 },
    ]));
    const api = installApi(async () => { throw new Error('Seedance 生成失败'); });
    api.solution.inspectMedia = vi.fn(async (p: string) => (p === STALE ? { ok: true, path: STALE, mtimeMs: 1 } : { ok: false }));
    api.solution.previewMedia = vi.fn(async () => ({ ok: true, srcUrl: 'blob:stale', path: STALE }));
    const wrapper = await mountAndStartSlideshow();

    // 本次运行如实失败
    expect(wrapper.find('.job-progress-panel').classes()).toContain('is-failed');
    // 对抗核心：结果绑定必须被清空——修复前这里仍是 STALE，预览/发布入口继续指向旧片
    const persisted = JSON.parse(localStorage.getItem('totalclaw:video-studio-last-job:v2') || '{}');
    expect(persisted.videoPath).toBe('');
    expect(persisted.expectedVideoPath).toBeUndefined();
    wrapper.unmount();
  });

  it('持久化绑定是内置演示 URI（bundled-showcase://）→ 进页面必须放手，不许把 42 秒演示片复活成「上次成片」', async () => {
    localStorage.setItem('totalclaw:video-studio-last-job:v2', JSON.stringify({
      conversationId: '', projectName: '演示', source: 'direct', videoPath: 'bundled-showcase://short-video',
    }));
    installApi(async () => ({ ok: true, videoPath: '/x.mp4' }));
    const wrapper = mount(VideoStudioView, {
      global: { mocks: { $t: (s: string, _p?: any) => s }, stubs: { Teleport: true } },
    });
    await flush();
    await flush();

    // 修复前：面板被写成「成片已完成，可预览并进入发布」（is-success），预览打开就是内置 42 秒演示片
    expect(wrapper.find('.job-progress-panel').classes()).not.toContain('is-success');
    const persisted = JSON.parse(localStorage.getItem('totalclaw:video-studio-last-job:v2') || '{}');
    expect(persisted.videoPath).toBe('');
    expect(persisted.source).toBe('none');
    wrapper.unmount();
  });

  it('持久化绑定指向已不存在的文件 → 同样放手（换机/清目录后不许演「成片已完成」）', async () => {
    localStorage.setItem('totalclaw:video-studio-last-job:v2', JSON.stringify({
      conversationId: '', projectName: '旧项目', source: 'direct', videoPath: '/gone/final.mp4',
    }));
    installApi(async () => ({ ok: true, videoPath: '/x.mp4' })); // inspectMedia 默认 ok:false
    const wrapper = mount(VideoStudioView, {
      global: { mocks: { $t: (s: string, _p?: any) => s }, stubs: { Teleport: true } },
    });
    await flush();
    await flush();

    expect(wrapper.find('.job-progress-panel').classes()).not.toContain('is-success');
    expect(JSON.parse(localStorage.getItem('totalclaw:video-studio-last-job:v2') || '{}').videoPath).toBe('');
    wrapper.unmount();
  });
});
