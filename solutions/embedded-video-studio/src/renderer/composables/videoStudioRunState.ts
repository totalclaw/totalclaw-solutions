/**
 * 短视频工作台「成片进度面板」的运行态 —— **模块级共享，跨组件实例存活**。
 *
 * 为什么不能留在 VideoStudioView 的 setup 里（2026-10-13）：
 * App.vue 的 router-view 按 route.fullPath 建 key，离开工作台组件就被销毁、回来是全新实例。
 * 直连成片（图片成片 / Seedance）是主进程在跑，渲染层只是订阅进度；组件一销毁，
 * 进度、节点、计时、失败原因全没了，回来看到的是「尚未启动」，再点开始又被主进程拒
 * 「已有一个成片任务在运行」。用户的感受就是「不知道生成不出来还是正在生成」。
 *
 * 放到模块作用域后：换页回来直接读到正在跑的真实进度；看门狗（useStepWatchdog）用
 * 这里的 startedAt / progressAt / waitExtendedAt 判「多久没进度」，重挂载也判得对。
 *
 * 另在 localStorage 落一个很小的「直连运行中」标记：进程重启 / 页面刷新后模块重新加载，
 * 标记还在就说明上一轮没有正常收尾 —— 标成「已中断」，给「重新生成」，绝不装作还在跑。
 */
import { ref, watch } from 'vue';
import { t as i18nT } from '../i18n';

export type VideoJobRunStatus = 'idle' | 'pending' | 'running' | 'waiting_human' | 'success' | 'failed' | 'cancelled';
export type VideoJobNodeState = 'pending' | 'running' | 'done' | 'failed';
export interface VideoJobProgressNode { id: string; phase: number; label: string }
/** 直连成片走的是哪条管线；空串 = 当前面板不归直连管（空闲 / 工作流） */
export type VideoJobRunMode = 'slideshow' | 'seedance' | '';

export const DIRECT_RUN_MARKER_KEY = 'totalclaw:video-studio-direct-run:v1';

export interface DirectRunMarker { startedAt: number; mode: VideoJobRunMode; project: string }

export const jobRunStatus = ref<VideoJobRunStatus>('idle');
export const jobNodeStates = ref<Record<string, VideoJobNodeState>>({});
export const jobProgressNodes = ref<VideoJobProgressNode[]>([]);
export const jobCurrentNodeName = ref('');
/** 本轮直连成片的真实开始时刻（毫秒）；0 = 没有 */
export const jobStartedAt = ref(0);
/** 预估总秒数（从 startedAt 起算）；0 = 没有预估，只走无进度上限 */
export const jobEstimateSec = ref(0);
/** 最近一次进度 / 心跳时刻；看门狗据此判「多久没进度」 */
export const jobProgressAt = ref(0);
/** 用户最近一次点「继续等待」的时刻（重新上弦） */
export const jobWaitExtendedAt = ref(0);
export const jobRunMode = ref<VideoJobRunMode>('');
/** 上一轮运行是上个进程 / 上次页面留下的，执行闭包已不在 —— 只能重新生成 */
export const jobInterrupted = ref(false);
/**
 * 用户点了「停止」/「重新生成」：Seedance 管线在真正 spawn 子进程前还有扫描、分镜两步
 * （取消通道对它们无效），靠这个旗子在步骤间自行退出。
 */
export const jobCancelRequested = ref(false);

/** 收到一次进度（任何来源）：记时刻，看门狗据此不再怀疑 */
export function markVideoJobProgress(at: number = Date.now()): void {
  jobProgressAt.value = at;
}

/**
 * 跑着的时候，节点名 / 节点状态有任何变化都算一次进度：
 * 两条管线里写 jobCurrentNodeName 的地方有十几处，集中在这里兜，不在每处手工打点。
 */
watch([jobCurrentNodeName, jobNodeStates], () => {
  if (jobRunStatus.value === 'running' && jobRunMode.value) markVideoJobProgress();
});

export function readDirectRunMarker(): DirectRunMarker | null {
  try {
    const raw = localStorage.getItem(DIRECT_RUN_MARKER_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return null;
    const mode = parsed.mode === 'seedance' || parsed.mode === 'slideshow' ? parsed.mode : '';
    return { startedAt: Number(parsed.startedAt) || 0, mode, project: String(parsed.project || '') };
  } catch {
    return null;
  }
}

export function writeDirectRunMarker(marker: DirectRunMarker): void {
  try { localStorage.setItem(DIRECT_RUN_MARKER_KEY, JSON.stringify(marker)); } catch { /* 存不下不阻断成片 */ }
}

export function clearDirectRunMarker(): void {
  try { localStorage.removeItem(DIRECT_RUN_MARKER_KEY); } catch { /* */ }
}

/**
 * 一条直连管线开跑：记真实开始时刻与管线，落「运行中」标记。
 * 节点表 / 节点状态由调用方按管线自己写（标签带 i18n，在视图里）。
 */
export function beginDirectRun(mode: Exclude<VideoJobRunMode, ''>, project: string): void {
  const now = Date.now();
  jobInterrupted.value = false;
  jobCancelRequested.value = false;
  jobRunMode.value = mode;
  jobStartedAt.value = now;
  jobEstimateSec.value = 0;
  jobProgressAt.value = now;
  jobWaitExtendedAt.value = 0;
  jobRunStatus.value = 'running';
  writeDirectRunMarker({ startedAt: now, mode, project });
}

/** 任何终态（成功 / 失败 / 取消）都要清掉「运行中」标记，否则下次打开会误报「已中断」 */
export function endDirectRun(): void {
  clearDirectRunMarker();
}

/** 用户已处理掉「已中断」（点了重新生成）：清标记与旗子 */
export function clearInterruptedDirectRun(): void {
  jobInterrupted.value = false;
  clearDirectRunMarker();
}

/**
 * 模块加载 / 视图挂载时：标记还在而本进程里并没有在跑 → 上一轮被进程重启或页面刷新打断。
 * 标成 failed + interrupted，视图据此给「上次运行已中断」告警卡与「重新生成」。
 * 幂等：已经标过、或本进程确实在跑，都不动。
 */
export function adoptInterruptedDirectRun(): boolean {
  if (jobInterrupted.value || jobRunStatus.value === 'running') return false;
  const marker = readDirectRunMarker();
  if (!marker) return false;
  jobInterrupted.value = true;
  jobRunMode.value = marker.mode;
  jobStartedAt.value = marker.startedAt;
  jobEstimateSec.value = 0;
  jobProgressAt.value = 0;
  jobWaitExtendedAt.value = 0;
  jobCancelRequested.value = false;
  jobRunStatus.value = 'failed';
  jobNodeStates.value = {};
  jobCurrentNodeName.value = i18nT('应用重启或页面刷新导致上次成片中断，请重新生成');
  return true;
}

/** 测试 / 开新一轮前归零（不碰 localStorage 标记：由 begin/end 自己管） */
export function resetVideoStudioRunState(): void {
  jobRunStatus.value = 'idle';
  jobNodeStates.value = {};
  jobProgressNodes.value = [];
  jobCurrentNodeName.value = '';
  jobStartedAt.value = 0;
  jobEstimateSec.value = 0;
  jobProgressAt.value = 0;
  jobWaitExtendedAt.value = 0;
  jobRunMode.value = '';
  jobInterrupted.value = false;
  jobCancelRequested.value = false;
}

// 新进程首次加载这份模块：上一轮的标记还在就是被打断了
adoptInterruptedDirectRun();
