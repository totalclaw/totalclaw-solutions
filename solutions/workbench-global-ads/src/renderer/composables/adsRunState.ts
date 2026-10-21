/**
 * 广告投放「生成 + 发布」的运行态 —— **模块级共享，跨组件实例存活**。
 *
 * 为什么不能放在 GlobalAdsWorkbenchView 的 setup 里：
 * App.vue 的 router-view 用 `:key="route.fullPath"`，离开工作台组件就被销毁、
 * 回来是**全新实例**。而第 5 步的执行是就地跑的（发布循环在渲染层、生成走
 * runWorkflow），任务本身还在后台继续，可界面上的进度、节点、回执全没了 ——
 * 用户看到的是"任务凭空消失"（实测反馈：极其严重）。
 *
 * 放在模块作用域后：组件卸载不影响这份状态，重新挂载直接读回正在跑的进度。
 * 再落一份到主进程（account-scoped JSON）：应用重启后仍能看到上一次跑到哪、结果是什么
 * （重启会杀掉渲染层的执行循环，所以恢复出来的 running 一律标记为「已中断」）。
 */
import { ref } from 'vue';
import { t as i18nT } from '../i18n';
import type { OverseasPlatformId, OverseasPublishRun, OverseasPublishStep, OverseasPublishStepState } from './overseasPublish';
import type { StepKind } from './useStepWatchdog';

// 步骤 / 运行态的基础形状与真实发布驱动（composables/overseasPublish.ts）共用一套，
// 这里只加广告工作台特有的 aspect 字段（画幅标注），不重新定义一遍容易漂移的字段列表。
export type PublishStepState = OverseasPublishStepState;
export type PublishStep = OverseasPublishStep;
export interface PublishRun extends OverseasPublishRun {
  platformId: OverseasPlatformId;
  aspect: string;
}
export interface GenNode {
  id: string;
  name: string;
  /**
   * `cancelled` 与 `failed` 必须是两个状态。用户自己叫停不是出错——混在一起
   * 会让人以为程序挂了，去排查、去重试（实测反馈：取消后界面报「图片成片失败：已取消」）。
   */
  state: 'pending' | 'running' | 'done' | 'failed' | 'cancelled';
  /** 预估耗时（秒）；按实测标定，界面据此显示「预计 X」 */
  etaSec?: number;
  /** 进入 running 的时刻，用来算「已用 X」 */
  startedAt?: number;
  /** 步骤类型：看门狗据此取「多久没进度算卡住」的上限（视频 10 分钟…） */
  kind?: StepKind;
}

/**
 * 落库走主进程（account-scoped JSON），不是 localStorage：
 * 投放会产生真实花费，"发过什么、跑到哪一步、结果如何"必须可追溯，
 * 不能被清缓存抹掉，也要能被其它视图 / 审计读取。
 */
function runStoreApi(): any {
  return (window as any).electronAPI?.globalAdsRun || null;
}

/** 正在发布的成片 id（空串=没有在跑） */
export const adsPublishBusyId = ref('');
export const adsPublishRuns = ref<PublishRun[]>([]);
export const adsGenActive = ref(false);
export const adsGenNodes = ref<GenNode[]>([]);
export const adsGenMessage = ref('');
export const adsGenPreviewPath = ref('');
/** 本轮开始时间；恢复出来的历史运行据此显示「上次运行」 */
export const adsRunStartedAt = ref(0);
/** 恢复出来的运行是上个进程留下的，执行循环已随进程结束 —— 界面据此标注，不冒充在跑 */
export const adsRunInterrupted = ref(false);
/**
 * 看门狗用的两个时刻（模块级：换页回来仍能正确判「多久没进度」）。
 * genProgressAt = 最近一次主进程推进度的时刻；genWaitExtendedAt = 用户最近一次点「继续等待」。
 */
export const adsGenProgressAt = ref(0);
export const adsGenWaitExtendedAt = ref(0);

/**
 * 生成真的失败了：把还在转圈的节点收成 failed。
 * 没有这一步，面板会同时显示「失败原因」和一个永远在转的 spinner（实测截图就是这样），
 * 用户分不清是「还在生成」还是「已经挂了」。pending 的保持 pending（它们根本没开始）。
 */
export function failAdsGenRunningNodes(): void {
  adsGenNodes.value = adsGenNodes.value.map((node) => (node.state === 'running'
    ? { ...node, state: 'failed' as const } : node));
}

export function persistAdsRunState(): void {
  const api = runStoreApi();
  if (!api?.save) return;
  /**
   * fire-and-forget，且**同步异常也要吞掉**。
   * `save` 走 IPC，参数要能结构化克隆；万一某个字段带了不可克隆的东西
   * （Proxy / 函数 / DOM 引用），会在 `.catch()` 挂上之前就**同步抛出**，
   * 异常一路逃到调用方，表现为界面只剩一句「An object could not be cloned.」
   * 而任务其实还在跑（实测踩过）。落库失败不该影响出片与发布。
   */
  try {
    void api.save({
      startedAt: adsRunStartedAt.value,
      busy: !!adsPublishBusyId.value || adsGenActive.value,
      // JSON 化一层，剥掉 Vue 的响应式 Proxy —— 直接把 ref 的 .value 交给 IPC，
      // 结构化克隆遇到 Proxy 会抛「An object could not be cloned.」
      runs: JSON.parse(JSON.stringify(adsPublishRuns.value)),
      genNodes: JSON.parse(JSON.stringify(adsGenNodes.value)),
      genMessage: adsGenMessage.value,
      genPreviewPath: adsGenPreviewPath.value,
      genProgressAt: adsGenProgressAt.value,
      savedAt: Date.now(),
    }).catch(() => undefined);
  } catch {
    /* 存不下就算了，绝不阻断正在跑的任务 */
  }
}

/**
 * 恢复上一次的运行快照（只用于展示，不复活执行循环）。
 * 模块级状态还在（同一进程内换页面回来）就直接用那份，别被落库的旧快照盖掉。
 */
export async function restoreAdsRunState(): Promise<void> {
  /**
   * ⚠️ 模块级状态在**同一进程内**是不会被路由切换清掉的（这正是"任务不消失"的实现方式）。
   * 但上一轮**圆满结束**的面板不该跟着用户到处走：换个菜单回来还挂着「本次投放已结束」，
   * 还会和「请先上传素材」的阻断提示同屏（实测反馈）。这里先把这种"没有复用价值"的
   * 完成态清掉，只有失败/中断才留着给「重试」用。
   */
  const busy = !!adsPublishBusyId.value || adsGenActive.value;
  const hasState = adsPublishRuns.value.length > 0 || adsGenNodes.value.length > 0;
  if (hasState && !busy) {
    const stuck = adsPublishRuns.value.some((run) => run.state === 'failed' || run.state === 'running' || run.state === 'pending')
      || adsGenNodes.value.some((node) => node.state === 'failed' || node.state === 'running');
    if (!stuck) resetAdsRunState();
    else return;
  }
  if (adsPublishRuns.value.length || adsGenNodes.value.length) return;
  const api = runStoreApi();
  if (!api?.load) return;
  try {
    const result = await api.load();
    const snap = result?.state;
    if (!snap || typeof snap !== 'object') return;
    /**
     * **只恢复"没跑完/跑失败"的运行**。
     *
     * 全部成功的那一轮没有恢复价值：用户下次进来是要发新的一批，
     * 却看到上次的完成面板挂在那儿（还可能和"素材未选"的阻断提示同屏出现，自相矛盾）。
     * 保留失败/中断态是为了让「重试」按钮有意义 —— 这是这块状态唯一的复用场景。
     */
    const rawRuns: any[] = Array.isArray(snap.runs) ? snap.runs : [];
    const rawNodes: any[] = Array.isArray(snap.genNodes) ? snap.genNodes : [];
    const unfinished = !!snap.busy
      || rawRuns.some((run) => run?.state === 'failed' || run?.state === 'running' || run?.state === 'pending')
      || rawNodes.some((node) => node?.state === 'failed' || node?.state === 'running');
    if (!unfinished) {
      // 上一轮圆满结束 —— 清掉落库，别让它在下次进来时诈尸
      try { void api.save?.({ startedAt: 0, busy: false, runs: [], genNodes: [], genMessage: '', genPreviewPath: '', savedAt: Date.now() }).catch(() => undefined); } catch { /* */ }
      return;
    }
    adsRunStartedAt.value = Number(snap.startedAt) || 0;
    adsGenMessage.value = String(snap.genMessage || '');
    adsGenPreviewPath.value = String(snap.genPreviewPath || '');
    adsGenProgressAt.value = Number(snap.genProgressAt) || 0;
    adsGenWaitExtendedAt.value = 0;
    /**
     * ⚠️ 落库数据必须**清洗后**再进状态。
     * 快照可能是旧版本写的、也可能被外部写坏（实测：调试时灌进过没有 `steps` 字段的记录）。
     * 一旦 `run.steps` 为 undefined，`adsPublishProgress` 里的 `run.steps.length` 就抛，
     * 而它用在渲染函数里 —— 整个组件的 render/update 被打断，表现为
     * 「按钮点不动、勾选无反应、列表不显示、配置显示未配置」一片失灵（一个错拖垮全页）。
     */
    const sanitizeStep = (step: any): PublishStep | null => (step && typeof step.key === 'string'
      ? { key: String(step.key), label: String(step.label || step.key), state: (step.state || 'pending') as PublishStepState }
      : null);
    const sanitizeRun = (run: any): PublishRun | null => (run && typeof run.platformId === 'string'
      ? {
        // 落库数据清洗后仍只是「大致是个字符串」，不是编译期能保证的 OverseasPlatformId 字面量；
        // 真正的合法性校验交给消费方按 platformId 查平台定义时做（查不到就当无效平台处理）。
        platformId: String(run.platformId) as OverseasPlatformId,
        platform: String(run.platform || run.platformId),
        icon: String(run.icon || ''),
        color: String(run.color || ''),
        file: String(run.file || ''),
        filePath: run.filePath ? String(run.filePath) : undefined,
        aspect: String(run.aspect || ''),
        steps: (Array.isArray(run.steps) ? run.steps : []).map(sanitizeStep).filter(Boolean) as PublishStep[],
        state: (['pending', 'running', 'done', 'failed'].includes(run.state) ? run.state : 'pending') as PublishRun['state'],
        status: String(run.status || ''),
        detail: String(run.detail || ''),
      }
      : null);
    adsGenNodes.value = (Array.isArray(snap.genNodes) ? snap.genNodes : [])
      .filter((node: any) => node && typeof node.id === 'string')
      .map((node: any) => ({
        id: String(node.id),
        name: String(node.name || node.id),
        state: (['pending', 'running', 'done', 'failed', 'cancelled'].includes(node.state) ? node.state : 'pending') as GenNode['state'],
        etaSec: Number(node.etaSec) > 0 ? Number(node.etaSec) : undefined,
        startedAt: Number(node.startedAt) > 0 ? Number(node.startedAt) : undefined,
        kind: typeof node.kind === 'string' ? node.kind as StepKind : undefined,
      }));
    adsPublishRuns.value = (Array.isArray(snap.runs) ? snap.runs : []).map(sanitizeRun).filter(Boolean) as PublishRun[];
    // 进程已经换了一个，上次那条执行循环不可能还活着：把没跑完的标成中断，
    // 绝不留一个永远转圈的"运行中"骗用户。
    if (snap.busy) {
      adsRunInterrupted.value = true;
      adsGenActive.value = false;
      adsGenNodes.value = adsGenNodes.value.map((node) => (node.state === 'running' || node.state === 'pending'
        ? { ...node, state: 'failed' as const } : node));
      adsPublishRuns.value = adsPublishRuns.value.map((run) => (run.state === 'running' || run.state === 'pending'
        ? {
          ...run,
          state: 'failed' as const,
          status: run.status === 'running' || !run.status ? 'interrupted' : run.status,
          detail: run.detail || i18nT('应用退出导致本次执行中断，未能确认平台状态；请到平台核对后重跑。'),
          steps: run.steps.map((step) => (step.state === 'running' || step.state === 'pending'
            ? { ...step, state: 'failed' as const } : step)),
        }
        : run));
    }
  } catch { /* 快照坏了就当没有 */ }
}

/** 开新一轮前清干净，避免上一轮的中断态残留在界面上。 */
export function resetAdsRunState(): void {
  adsRunInterrupted.value = false;
  adsRunStartedAt.value = Date.now();
  adsPublishRuns.value = [];
  adsGenNodes.value = [];
  adsGenMessage.value = '';
  adsGenPreviewPath.value = '';
  adsGenProgressAt.value = 0;
  adsGenWaitExtendedAt.value = 0;
}
