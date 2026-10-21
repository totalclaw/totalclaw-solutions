// @vitest-environment happy-dom
/**
 * 短视频工作台「失败即终止 / 计时真实走 / 超时可判 / 可重新生成 / 开跑前预检 / 重启后判中断」
 * 护栏（2026-10-13 用户原话：「视频超时就有提示（报错/重新生成），不然等 10 分钟都没变化，
 * 不知道是生成不出来还是正在生成」）。真实挂载，假时钟推进看门狗。
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { mount } from '@vue/test-utils';

const holder = vi.hoisted(() => ({
  notif: {
    info: vi.fn(), success: vi.fn(), warn: vi.fn(), error: vi.fn(), fromException: vi.fn(),
    actionable: vi.fn(),
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
  localizeWorkflowText: (s: string) => s,
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
import { STALL_CAP_MS } from '../composables/useStepWatchdog';
import {
  DIRECT_RUN_MARKER_KEY,
  jobInterrupted,
  jobProgressAt,
  jobRunMode,
  jobRunStatus,
  jobStartedAt,
  jobWaitExtendedAt,
  resetVideoStudioRunState,
} from '../composables/videoStudioRunState';

const flush = () => new Promise((r) => setTimeout(r, 0));
const flushMany = async (rounds = 6) => { for (let i = 0; i < rounds; i += 1) await flush(); };

type Progress = (p: { stage?: string; msg?: string }) => void;

function installApi(opts: {
  videoGenerate: (...args: any[]) => Promise<any>;
  listMediaDir?: ((...args: any[]) => Promise<any>) | null;
  onProgress?: (fn: Progress) => void;
  cancelVideo?: () => Promise<any>;
}) {
  const solution: Record<string, any> = {
    videoGenerate: vi.fn(opts.videoGenerate),
    onVideoProgress: vi.fn((fn: Progress) => { opts.onProgress?.(fn); return () => {}; }),
    cancelVideo: vi.fn(opts.cancelVideo || (async () => ({ ok: true }))),
    inspectMedia: vi.fn(async () => ({ ok: false })),
    previewMedia: vi.fn(async () => ({ ok: false })),
  };
  // 默认给一个含图片的素材目录；传 null = 老版本 preload 没有扫描通道
  if (opts.listMediaDir !== null) {
    solution.listMediaDir = vi.fn(opts.listMediaDir || (async () => ({ ok: true, dir: '/tmp/materials', files: [
      { name: 'a.jpg', path: '/tmp/materials/a.jpg', size: 1000, kind: 'image', type: 'image/jpeg' },
    ] })));
  }
  (window as any).electronAPI = {
    mediaModel: { get: vi.fn(async () => ({ kinds: [] })) },
    listWorkspaceTree: vi.fn(async () => []),
    onTaskRunEvent: vi.fn(() => () => {}),
    globalAdsRun: { cancelSlideshow: vi.fn(async () => ({ ok: true })) },
    solution,
  };
  return (window as any).electronAPI;
}

async function mountView() {
  const wrapper = mount(VideoStudioView, {
    global: { mocks: { $t: (s: string, _p?: any) => s }, stubs: { Teleport: true } },
  });
  await flushMany();
  return wrapper;
}

/** 默认草稿是图片成片；只差素材目录。开跑后多等几轮微任务让 videoGenerate 的结果冒上来 */
async function startSlideshow(wrapper: any) {
  await wrapper.find('.folder-picker input').setValue('/tmp/materials');
  await wrapper.find('.start-button').trigger('click');
  await flush();
  await wrapper.find('.preview-confirm').trigger('click');
  await flushMany();
}

describe('VideoStudioView 直连成片看门狗', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    resetVideoStudioRunState();
  });
  afterEach(() => { vi.useRealTimers(); });

  it('(a) 图片成片失败 → 红色告警卡带真实原因与「重新生成」，面板里不再有转圈；重新生成再次调 videoGenerate', async () => {
    const api = installApi({ videoGenerate: async () => ({ ok: false, error: '图片成片失败：素材目录里没找到图片' }) });
    const wrapper = await mountView();
    await startSlideshow(wrapper);

    expect(jobRunStatus.value).toBe('failed');
    const panel = wrapper.find('.job-progress-panel');
    expect(panel.classes()).toContain('is-failed');
    expect(panel.find('.spin').exists()).toBe(false);
    const alert = panel.find('.sra.failed');
    expect(alert.exists()).toBe(true);
    expect(alert.text()).toContain('素材目录里没找到图片');
    expect(alert.text()).toContain('重新生成');
    expect(alert.text()).toContain('查看日志');
    // 失败就是终态：没有「已用 / 预计」这种还在跑的文案，也没有「停止」
    expect(panel.find('.job-progress-time').exists()).toBe(false);
    expect(panel.find('.job-stop-btn').exists()).toBe(false);
    // 终态清掉「运行中」标记（否则下次打开误报已中断）
    expect(localStorage.getItem(DIRECT_RUN_MARKER_KEY)).toBeNull();

    const retry = alert.findAll('button').find((b) => b.text().includes('重新生成'))!;
    await retry.trigger('click');
    await flushMany(10);
    expect(api.solution.videoGenerate).toHaveBeenCalledTimes(2);
    wrapper.unmount();
  });

  it('(b) 计时从真实开始时刻走；10 分钟没进度 → 「可能已超时」；继续等待重新上弦；进度到达即不怀疑；重新生成先取消旧任务', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    let progress: Progress = () => {};
    let release: (v: any) => void = () => {};
    const videoGenerate = vi.fn(() => new Promise((r) => { release = r; }));
    const cancelVideo = vi.fn(async () => { release({ ok: false, cancelled: true, error: '已取消' }); return { ok: true }; });
    const api = installApi({ videoGenerate, onProgress: (fn) => { progress = fn; }, cancelVideo });
    const wrapper = await mountView();
    await startSlideshow(wrapper);

    expect(jobRunStatus.value).toBe('running');
    expect(jobRunMode.value).toBe('slideshow');
    expect(jobStartedAt.value).toBeGreaterThan(0);
    const panel = wrapper.find('.job-progress-panel');
    expect(panel.classes()).toContain('is-running');
    expect(panel.find('.job-stop-btn').exists()).toBe(true);
    // 标记落盘：进程重启后据此判中断
    expect(JSON.parse(localStorage.getItem(DIRECT_RUN_MARKER_KEY) || '{}').mode).toBe('slideshow');

    // 秒表真的在走（从管线开始时刻算）
    await vi.advanceTimersByTimeAsync(5_000);
    expect(panel.find('.job-progress-time').text()).toMatch(/已用 [5-7]s/);
    expect(panel.find('.sra').exists()).toBe(false);

    // 视频类无进度上限 10 分钟：线前不怀疑，过线且没有进度 → suspect（留 3 秒余量）
    await vi.advanceTimersByTimeAsync(STALL_CAP_MS.video - 5_000 - 3_000);
    expect(panel.find('.sra.suspect').exists()).toBe(false);
    await vi.advanceTimersByTimeAsync(4_000);
    const suspect = panel.find('.sra.suspect');
    expect(suspect.exists()).toBe(true);
    expect(suspect.text()).toContain('可能已超时');
    expect(suspect.text()).toContain('继续等待');
    expect(suspect.text()).toContain('重新生成');
    expect(panel.find('.job-progress-time').text()).toContain('可能已超时');
    // 还在跑：spinner 仍在（没死，只是可疑）
    expect(panel.find('.job-progress-icon .spin').exists()).toBe(true);

    // 继续等待：卡消失，再过一个窗口才会再来
    const keep = suspect.findAll('button').find((b) => b.text().includes('继续等待'))!;
    await keep.trigger('click');
    await flushMany(2);
    expect(panel.find('.sra.suspect').exists()).toBe(false);
    expect(jobWaitExtendedAt.value).toBeGreaterThan(0);
    await vi.advanceTimersByTimeAsync(STALL_CAP_MS.video - 3_000);
    expect(panel.find('.sra.suspect').exists()).toBe(false);
    await vi.advanceTimersByTimeAsync(4_000);
    expect(panel.find('.sra.suspect').exists()).toBe(true);

    // 主进程推来进度 = 心跳：诚实地回到「仍在生成」，不再怀疑
    const before = jobProgressAt.value;
    progress({ stage: 'render', msg: '正在合成成片' });
    await flushMany(2);
    expect(jobProgressAt.value).toBeGreaterThan(before);
    expect(panel.find('.sra.suspect').exists()).toBe(false);
    expect(panel.text()).toContain('正在合成成片');

    // 再晾 10 分钟没进度 → 又可疑；「重新生成」先取消旧任务，等它退出再起新一轮
    await vi.advanceTimersByTimeAsync(STALL_CAP_MS.video + 1_000);
    const again = panel.find('.sra.suspect');
    expect(again.exists()).toBe(true);
    const retry = again.findAll('button').find((b) => b.text().includes('重新生成'))!;
    await retry.trigger('click');
    await vi.advanceTimersByTimeAsync(1_000);
    await flushMany(6);
    expect(cancelVideo).toHaveBeenCalledTimes(1);
    expect(videoGenerate).toHaveBeenCalledTimes(2);
    expect(api.solution.cancelVideo.mock.invocationCallOrder[0])
      .toBeLessThan(videoGenerate.mock.invocationCallOrder[1]);
    // 自己发起的取消是过程不是结果：新一轮已经在跑，面板不是「已取消」
    expect(jobRunStatus.value).toBe('running');
    expect(panel.find('.sra').exists()).toBe(false);

    release({ ok: false, error: '第二轮也失败' });
    await flushMany();
    expect(jobRunStatus.value).toBe('failed');
    expect(panel.find('.sra.failed').exists()).toBe(true);
    wrapper.unmount();
  });

  it('(c) 开跑前预检：素材文件夹里只有视频没有图片 → 不调 videoGenerate，原地 warn 说明原因', async () => {
    const api = installApi({
      videoGenerate: async () => ({ ok: true, videoPath: '/tmp/materials/final.mp4' }),
      listMediaDir: async () => ({ ok: true, dir: '/tmp/materials', files: [
        { name: 'clip.mp4', path: '/tmp/materials/clip.mp4', size: 5000, kind: 'video', type: 'video/mp4' },
      ] }),
    });
    const wrapper = await mountView();
    await startSlideshow(wrapper);

    expect(api.solution.listMediaDir).toHaveBeenCalledWith('/tmp/materials');
    expect(api.solution.videoGenerate).not.toHaveBeenCalled();
    expect(holder.notif.warn).toHaveBeenCalledTimes(1);
    expect(String(holder.notif.warn.mock.calls[0][0])).toContain('没有图片');
    expect(String(holder.notif.warn.mock.calls[0][0])).toContain('/tmp/materials');
    // 没起任务：面板还是空闲，没有节点在转
    expect(jobRunStatus.value).toBe('idle');
    expect(wrapper.find('.job-progress-panel').classes()).toContain('is-idle');
    expect(localStorage.getItem(DIRECT_RUN_MARKER_KEY)).toBeNull();
    wrapper.unmount();
  });

  it('(c′) 老版本 preload 没有 listMediaDir：预检跳过，照常起任务', async () => {
    const api = installApi({ videoGenerate: async () => ({ ok: false, error: '脚本自己报' }), listMediaDir: null });
    const wrapper = await mountView();
    await startSlideshow(wrapper);
    expect(api.solution.videoGenerate).toHaveBeenCalledTimes(1);
    wrapper.unmount();
  });

  it('(d) 上个进程留下的「运行中」标记 → 挂载即「上次运行已中断」告警卡 + 重新生成，不转圈，挂载时的清理分支不许抹掉它', async () => {
    localStorage.setItem(DIRECT_RUN_MARKER_KEY, JSON.stringify({ startedAt: Date.now() - 120_000, mode: 'seedance', project: '旧项目' }));
    localStorage.setItem('totalclaw:video-studio-last-job:v2', JSON.stringify({
      conversationId: '', projectName: '旧项目', source: 'direct', videoPath: '',
    }));
    const api = installApi({ videoGenerate: async () => ({ ok: true, videoPath: '/x.mp4' }) });
    const wrapper = await mountView();
    await flushMany(6);

    expect(jobInterrupted.value).toBe(true);
    expect(jobRunStatus.value).toBe('failed');
    expect(jobRunMode.value).toBe('seedance');
    const panel = wrapper.find('.job-progress-panel');
    expect(panel.classes()).toContain('is-failed');
    expect(panel.find('.spin').exists()).toBe(false);
    expect(panel.text()).toContain('上次成片已中断');
    const alert = panel.find('.sra.interrupted');
    expect(alert.exists()).toBe(true);
    expect(alert.text()).toContain('上次运行已中断');
    expect(alert.text()).toContain('重新生成');
    expect(panel.find('.sra.suspect').exists()).toBe(false);

    // 重新生成：主进程可能还在跑上一轮（只是页面刷新了）→ 先清场（两条取消通道都调），
    // 清掉标记与中断态，再起新一轮
    await wrapper.find('.folder-picker input').setValue('/tmp/materials');
    const retry = alert.findAll('button').find((b) => b.text().includes('重新生成'))!;
    await retry.trigger('click');
    await new Promise((r) => setTimeout(r, 1_200));
    await flushMany(8);
    expect(api.solution.cancelVideo).toHaveBeenCalledTimes(1);
    expect(api.globalAdsRun.cancelSlideshow).toHaveBeenCalledTimes(1);
    expect(jobInterrupted.value).toBe(false);
    expect(api.solution.videoGenerate).toHaveBeenCalledTimes(1);
    expect(panel.find('.sra.interrupted').exists()).toBe(false);
    wrapper.unmount();
  });

  it('(e) 换页回来：新实例读到模块级的「正在跑」，不被挂载时的清理归零；跑完后新实例认领成片', async () => {
    let release: (v: any) => void = () => {};
    const api = installApi({ videoGenerate: () => new Promise((r) => { release = r; }) });
    api.solution.inspectMedia = vi.fn(async (p: string) => (p === '/tmp/materials/final.mp4' ? { ok: true, path: p } : { ok: false }));
    api.solution.previewMedia = vi.fn(async () => ({ ok: true, srcUrl: 'blob:x', path: '/tmp/materials/final.mp4' }));
    const first = await mountView();
    await startSlideshow(first);
    expect(jobRunStatus.value).toBe('running');
    // 离开页面：组件销毁，主进程的任务还在跑
    first.unmount();

    const second = await mountView();
    await flushMany(6);
    expect(jobRunStatus.value).toBe('running');
    const panel = second.find('.job-progress-panel');
    expect(panel.classes()).toContain('is-running');
    expect(panel.find('.job-stop-btn').exists()).toBe(true);
    // 再点开始会被拦：已有一个在跑
    await second.find('.start-button').trigger('click');
    await flush();
    await second.find('.preview-confirm').trigger('click');
    await flushMany();
    expect(api.solution.videoGenerate).toHaveBeenCalledTimes(1);
    expect(holder.notif.warn).toHaveBeenCalledWith(expect.stringContaining('已有制作正在进行'));

    // 老实例的闭包跑完：模块态翻 success，新实例从 localStorage 认领成片并打开预览
    release({ ok: true, videoPath: '/tmp/materials/final.mp4' });
    await flushMany(10);
    expect(jobRunStatus.value).toBe('success');
    expect(panel.classes()).toContain('is-success');
    expect(api.solution.previewMedia).toHaveBeenCalledWith('/tmp/materials/final.mp4');
    expect(second.find('.job-progress-time').exists()).toBe(false);
    second.unmount();
  });

  it('(f) 「停止」调图片成片的取消通道，面板翻「已取消」而不是红色失败', async () => {
    let release: (v: any) => void = () => {};
    const api = installApi({
      videoGenerate: () => new Promise((r) => { release = r; }),
      cancelVideo: async () => { release({ ok: false, cancelled: true }); return { ok: true }; },
    });
    const wrapper = await mountView();
    await startSlideshow(wrapper);
    const panel = wrapper.find('.job-progress-panel');
    await panel.find('.job-stop-btn').trigger('click');
    await flushMany(6);
    expect(api.solution.cancelVideo).toHaveBeenCalledTimes(1);
    expect(api.globalAdsRun.cancelSlideshow).not.toHaveBeenCalled();
    expect(jobRunStatus.value).toBe('cancelled');
    expect(panel.classes()).toContain('is-cancelled');
    expect(panel.find('.sra').exists()).toBe(false);
    expect(panel.find('.spin').exists()).toBe(false);
    expect(localStorage.getItem(DIRECT_RUN_MARKER_KEY)).toBeNull();
    wrapper.unmount();
  });
});
