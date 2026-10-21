import { ipcMain } from 'electron';
import { userFacingError } from '../utils/userFacingError';
import { readJsonSafe, writeJsonAtomic } from '../utils/atomicJson';
import { existsSync, readFileSync, writeFileSync, mkdirSync, copyFileSync, createWriteStream } from 'fs';
import { isAbsolute, join, dirname } from 'path';
import { spawn } from 'child_process';
import { privateRoot } from '../services/accountScope';
import { readAgentEnv } from '../services/mediaModelConfig';
import { resolveAgentPython } from '../services/agentPython';
import { synthesizeNarrationSegments } from '../services/media/ttsRouter';
import { ffmpegSpawnEnv, resolveFfmpegPair } from '../services/ffmpegPath';
import { renderFalScenes, reframeClip } from '../services/falVideoShots';
import { probeMedia, type MediaTools } from '../services/charityContent/media';
import { falKeysReady, runFalJob } from './mediaFal.ipc';
import { isMaterialTooSmallFailure, RELAXED_MIN_SIZE_ARGS } from './slideshowMaterialRetry';
import { createChunkDecoder } from '../utils/winSpawnCompat';

/** 与 solution.ipc 同一套解析：优先打包 resources，其次源码树 */
function resolveAdsResourcesDir(): string | null {
  const cands: string[] = [];
  try { if ((process as any).resourcesPath) cands.push((process as any).resourcesPath); } catch { /* */ }
  cands.push(join(__dirname, '..', '..', '..', '..', '..', 'resources'));
  cands.push(join(__dirname, '..', '..', '..', '..', 'resources'));
  return cands.find((p) => existsSync(join(p, 'bundled-skills'))) || null;
}
// agent python 统一走 services/agentPython.resolveAgentPython（mac 打包缺 .venv 的修复见该文件头注释）
import {
  IPC_CHANNELS,
  type GlobalAdsCampaignCreateRequest,
  type GlobalAdsInsightsRequest,
  type GlobalAdsReviewReportRequest,
} from '@totalclaw/ipc-contracts';
import {
  createFixedDemoWorkflowResult,
  requireObject,
  requireText,
  workbenchClient,
  workflowResultHasAgentError,
  type WorkbenchIpcDeps,
} from './workbenchApi';
import { resolveWorkflowSeatCapFromDeps } from './shared';
import { t as i18nT } from '@totalclaw/i18n';

/** 本方案 id：fal 的密钥解析、配额与用量审计都按方案分开记 */
const ADS_SOLUTION_ID_VALUE = 'workbench-global-ads';

const mockConfirmTokens = new Map<string, { platform: string; tenantId: string; expiresAt: number }>();
const mockPlatforms = ['facebook', 'instagram', 'google_ads', 'youtube'];
const mockAuditEntries: Array<Record<string, unknown>> = Array.from({ length: 24 }, (_, index) => {
  const platform = mockPlatforms[index % mockPlatforms.length];
  const action = ['campaign.validate', 'campaign.create', 'creative.attach', 'delivery.receipt'][index % 4];
  return {
    ts: Date.now() - index * 7 * 60_000,
    iso: new Date(Date.now() - index * 7 * 60_000).toISOString(),
    platform,
    mode: 'api',
    action,
    tenantId: 'tenant-uae-demo',
    success: true,
    status: index % 4 === 1 ? 'created' : 'completed',
    budgetUsd: action === 'campaign.create' ? 25 : null,
    campaignId: `TC-MOCK-${platform.toUpperCase().replace(/[^A-Z]/g, '')}-${String(24 - index).padStart(4, '0')}`,
    driverFamily: 'totalclaw-mock-sandbox',
  };
});

/**
 * 广告工作台与标准工作流共用同一创建入口，确保人工确认后进入工作流时不会
 * 绕开演示沙箱、确认令牌和审计记录。
 */
export async function executeGlobalAdsCampaignCreate(
  deps: WorkbenchIpcDeps,
  payload: GlobalAdsCampaignCreateRequest,
): Promise<unknown> {
  const platform = requireText(payload?.platform, i18nT('投放平台'));
  const tenantId = requireText(payload?.tenantId, i18nT('客户标识'));
  if (!payload?.spec || typeof payload.spec !== 'object') {
    throw new Error(i18nT('广告系列配置必填'));
  }
  const demoSandbox = (payload.spec as Record<string, unknown>).demo_sandbox === true
    || (payload.spec as Record<string, unknown>).demoSandbox === true;
  if (demoSandbox) {
    if (!mockPlatforms.includes(platform)) throw new Error(i18nT('Mock 平台不支持: {platform}', { platform }));
    if (payload.dryRun) {
      const confirmToken = `mock-confirm-${platform}-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
      mockConfirmTokens.set(confirmToken, {
        platform,
        tenantId,
        expiresAt: Date.now() + 10 * 60_000,
      });
      mockAuditEntries.unshift({
        ts: Date.now(),
        iso: new Date().toISOString(),
        platform,
        mode: payload.mode || 'api',
        action: 'campaign.validate',
        tenantId,
        success: true,
        status: 'validated',
        budgetUsd: Number((payload.spec as Record<string, unknown>).daily_budget_usd) || 0,
        driverFamily: 'totalclaw-mock-sandbox',
      });
      return {
        ok: true,
        success: true,
        status: 'validated',
        confirmToken,
        platform,
        tenantId,
        environment: 'mock',
      };
    }
    const token = String(payload.confirmToken || '');
    if (token) {
      const confirmation = mockConfirmTokens.get(token);
      if (!confirmation
        || confirmation.platform !== platform
        || confirmation.tenantId !== tenantId
        || confirmation.expiresAt < Date.now()) {
        throw new Error(i18nT('Mock 发布确认令牌无效或已过期'));
      }
      mockConfirmTokens.delete(token);
    }
    // 演示沙箱不会产生真实花费。标准发布工作流已经在 commit 节点之前经过
    // login_confirm 人工确认，因此这里允许直接创建，避免界面和执行记录里再出现
    // 一次 dry-run。旧工作台的两阶段调用仍可携带 token，继续兼容。
    const campaignId = `TC-MOCK-${platform.toUpperCase().replace(/[^A-Z]/g, '')}-${Date.now()}`;
    const receipt = {
      ok: true,
      success: true,
      status: 'created',
      campaignId,
      platform,
      tenantId,
      mode: payload.mode || 'api',
      environment: 'mock',
      submittedAt: new Date().toISOString(),
      budgetUsd: Number((payload.spec as Record<string, unknown>).daily_budget_usd) || 0,
      auditRef: `audit-${campaignId}`,
    };
    mockAuditEntries.unshift({
      ts: Date.now(),
      iso: receipt.submittedAt,
      platform,
      mode: receipt.mode,
      action: 'campaign.create',
      tenantId,
      success: true,
      status: 'created',
      budgetUsd: receipt.budgetUsd,
      campaignId,
      driverFamily: 'totalclaw-mock-sandbox',
    });
    return receipt;
  }
  if (!payload.dryRun && !String(payload.confirmToken || '').trim()) {
    throw new Error(i18nT('真实投放必须携带有效确认令牌；请先执行发布前校验'));
  }
  return workbenchClient(deps, i18nT('广告系列投放'))
    .post('/v1/global_ads/campaign/create', payload, 300_000);
}

/**
 * 自然内容真实发布（视频上传到平台）。走上游 /v1/global_ads/publish →
 * web 驱动（webnav + rpa_kit 元素记忆 + final_submit 人工闸门）或 api 驱动。
 * 工作流 commit 与「一键发布」共用此入口，回执 / 阻断原因原样透传，不伪造成功。
 */
export async function executeGlobalAdsPublish(
  deps: WorkbenchIpcDeps,
  payload: Record<string, unknown>,
): Promise<unknown> {
  const platform = requireText(payload?.platform, i18nT('投放平台'));
  const spec = payload?.spec;
  if (!spec || typeof spec !== 'object') throw new Error(i18nT('发布内容配置必填'));
  const tenantId = String(payload?.tenantId || payload?.tenant_id || '').trim();
  const mode = String(payload?.mode || 'web');
  // 幂等先启用平台（platform_disabled 自愈）：用户没在设置里手动 enable 时，
  // 一键发布/工作流 commit 也能直接跑；启用失败不阻断，publish 会带真实原因回执。
  try {
    await workbenchClient(deps, i18nT('广告平台配置'))
      .post(`/v1/global_ads/platform/${encodeURIComponent(platform)}/configure`, { enabled: true, mode });
  } catch { /* 配置路由不可用时由 publish 的回执说话 */ }
  const body: Record<string, unknown> = {
    platform,
    mode,
    tenant_id: tenantId,
    dry_run: payload?.dryRun === true || payload?.dry_run === true,
    spec,
    actor: String(payload?.actor || 'totalclaw-ads-one-click'),
    ...(payload?.account ? { account: payload.account } : {}),
    ...(payload?.confirmToken || payload?.confirm_token
      ? { confirm_token: String(payload?.confirmToken || payload?.confirm_token) }
      : {}),
  };
  try {
    return await workbenchClient(deps, i18nT('广告内容发布'))
      .post('/v1/global_ads/publish', body, 600_000);
  } catch (error: any) {
    // 发布是「诊断优先」场景：上游 4xx/5xx 的具体原因（缺 channel_id / 未登录 / 频控）
    // 必须原样给到回执，让用户知道下一步补什么；不能被全局错误脱敏成「操作失败」。
    return {
      ok: false,
      success: false,
      status: 'error',
      platform,
      mode,
      action: 'organic_publish',
      errorMessage: String(error?.detail || error?.message || error),
    };
  }
}

/**
 * 脚本原始输出 → 界面人话（2026-08-06 用户要求：进度条上方不要英文）。
 * 脚本自身的日志保持技术原文（落盘便于排障），只在推给界面这一层翻译。
 * 认不出来的行按原样截断显示，不吞信息。
 */
function humanizeScriptLine(line: string, label: string): string {
  const t = line.trim();
  const scenes = /^===\s*(\d+)\s+scenes?,\s*([^,]+),\s*([^,]+),\s*(\S+)/.exec(t);
  if (scenes) {
    return i18nT('已就绪：{p0} 个镜头 · {p1} · {p2}', { p0: scenes[1], p1: scenes[3], p2: scenes[4] });
  }
  if (/^\[\d+\/\d+\]/.test(t)) {
    const step = /^\[(\d+)\/(\d+)\]\s*(.*)$/.exec(t);
    if (step) {
      const zh = step[3]
        .replace(/Seedance 生成 clip\.*/i, i18nT('Seedance 逐镜头生成'))
        .replace(/xfade 拼接 clip\.*/i, i18nT('镜头拼接与转场'))
        .replace(/BGM\s*\(([^)]*)\)\s*\+\s*混音\.*/i, (_m, mood) => i18nT('配乐（{p0}）与混音', { p0: String(mood) }))
        .replace(/烧\s*(\d+)\s*条字幕/i, (_m, n) => i18nT('烧录 {p0} 条字幕', { p0: String(n) }));
      return i18nT('第 {p0}/{p1} 步 · {p2}', { p0: step[1], p1: step[2], p2: zh });
    }
  }
  const submit = /^\[(\S+)\]\s*submit\b/.exec(t);
  if (submit) return i18nT('镜头 {p0} 已提交生成', { p0: submit[1] });
  const queued = /^\[(\S+)\]\s*queued\b/.exec(t);
  if (queued) return i18nT('镜头 {p0} 排队中', { p0: queued[1] });
  const downloading = /^\[(\S+)\]\s*downloading/.exec(t);
  if (downloading) return i18nT('镜头 {p0} 生成完成，正在下载', { p0: downloading[1] });
  const done = /^\[(\S+)\]\s*DONE\s*([\d.]+)MB/.exec(t);
  if (done) return i18nT('镜头 {p0} 已完成（{p1}MB）', { p0: done[1], p1: done[2] });
  const running = /^\[(\S+)\]\s*(running|succeeded|queued)$/.exec(t);
  if (running) {
    const zh = running[2] === 'running' ? i18nT('生成中') : running[2] === 'queued' ? i18nT('排队中') : i18nT('已完成');
    return i18nT('镜头 {p0} {p1}', { p0: running[1], p1: zh });
  }
  if (/^\[warn\]/.test(t)) return i18nT('提示：{p0}', { p0: t.replace(/^\[warn\]\s*/, '').slice(0, 90) });
  if (/^✓\s*成品/.test(t)) return i18nT('成片已生成');
  return `${label}：${t.slice(0, 120)}`;
}

export function registerGlobalAdsWorkbenchHandlers(deps: WorkbenchIpcDeps): void {
  const workflowRuns = new Map<string, AbortController>();
  const mockPlatformRows = () => mockPlatforms.map((platform) => ({
    platform,
    label: platform === 'google_ads'
      ? 'Google Ads'
      : platform.charAt(0).toUpperCase() + platform.slice(1),
    enabled: true,
    configured: true,
    mode: 'api',
    driverFamily: 'TotalClaw Mock Sandbox',
    accountKeys: [`mock_${platform}_uae_01`],
    missingSecrets: [],
    capabilities: ['campaign_create', 'creative_attach', 'insights_read', 'audit_trail'],
    demoSandbox: true,
    environment: 'mock',
  }));

  /**
   * 图片成片**快路**：直连 bundled skill 的确定性脚本，不走 5 节点 agent 工作流。
   *
   * 为什么要这条路：图片成片本质是 FFmpeg 拼图 + 混音 + 烧字幕，全是确定性步骤，
   * 三个画幅一两分钟就出来了。把它塞进「素材读取 → 广告脚本 → 方案审核 → 剪辑成片 → 质检」
   * 五个 agent 节点，每节点一轮 LLM 循环，同样的活要跑几十分钟（用户实测反馈"怎么这么慢"）。
   * 动态视频生成才需要 agent 编排（要写分镜、调模型），图片成片不需要。
   */
  /**
   * 成片任务的并发闸门 + 取消句柄。
   *
   * 这是一个最长 90 分钟、**按次计费**（视频模型）的重活。之前既没有闸门也没有取消：
   *   - 用户多点几次「开始生成」就并发跑几份，费用翻倍，产物还会互相覆盖；
   *   - 跑起来之后没有任何办法停下，只能等它跑完或杀掉整个应用。
   * 这里用一个模块级句柄同时解决：在跑就拒绝新的、并允许把在跑的这份杀掉。
   */
  let adsRunning: { children: Set<import('child_process').ChildProcess>; cancelled: boolean } | null = null;

  /**
   * 连子孙一起收：脚本是 Python，它自己会 spawn ffmpeg。只 child.kill() 杀掉直接
   * 子进程的话，ffmpeg 会活下来继续烧 CPU、继续往素材目录写文件（用户已经点了取消）。
   * spawn 时带了 detached，所以 -pid 就是整个进程组；Windows 没有进程组概念，走
   * taskkill /T 递归。与 solution.ipc.ts 的成片路径同一套收尾。
   */
  const killChildTree = (child: import('child_process').ChildProcess): void => {
    const pid = child.pid;
    if (!pid) { try { child.kill('SIGTERM'); } catch { /* 已退出 */ } return; }
    if (process.platform === 'win32') {
      try { spawn('taskkill', ['/pid', String(pid), '/T', '/F'], { stdio: 'ignore', windowsHide: true }); } catch { /* */ }
      return;
    }
    try { process.kill(-pid, 'SIGTERM'); } catch { try { child.kill('SIGTERM'); } catch { /* 已退出 */ } }
    const hardKill = setTimeout(() => {
      try { process.kill(-pid, 'SIGKILL'); } catch { /* 已退 */ }
    }, 5000);
    hardKill.unref?.();
  };

  const killAdsRun = (): void => {
    if (!adsRunning) return;
    adsRunning.cancelled = true;
    for (const child of adsRunning.children) killChildTree(child);
  };

  ipcMain.handle(IPC_CHANNELS.WORKBENCH_GLOBAL_ADS_SLIDESHOW_CANCEL, async (): Promise<{ ok: boolean }> => {
    killAdsRun();
    return { ok: true };
  });

  ipcMain.handle(IPC_CHANNELS.WORKBENCH_GLOBAL_ADS_SLIDESHOW, async (event, payload: {
    materialDir?: string;
    outputs?: Array<{ aspect?: string; path?: string }>;
    title?: string;
    /** start 可选：动态模式按镜头时长累计给出，与画面对齐 */
    narration?: Array<{ id?: string; text?: string; start?: number }>;
    subtitles?: Array<{ start?: number; end?: number; text?: string }>;
    bgm?: string;
    /** 'slideshow'（默认）= 图片拼接；'seedance' = 调视频模型出动态镜头 */
    mode?: string;
    bgmMood?: string;
    /**
     * 旁白音色（edge-tts voice id，如 zh-CN-XiaoxiaoNeural / en-US-AriaNeural / ar-AE-FatimaNeural）。
     * 由渲染层按当前界面语言给出 —— tts.py 不传 --voice 时默认走中文女声，
     * 而文案语言是跟随界面的，不对齐就会出现「中文音色念英文」。
     */
    narrationVoice?: string;
    scenes?: Array<Record<string, unknown>>;
    /** 旧入参，保留只为兼容运行态快照；动态成片已统一走 fal，档位由那边的能力表决定 */
    seedanceQuality?: string;
  }) => {
    /**
     * BGM 情绪必须落在 fetch_bgm.py 的 choices 里
     * （energetic/chill/upbeat/emotional/dramatic/corporate/lofi）。
     * 传 `cinematic` / `auto` 会让它 argparse 报 usage 直接退出 —— 而 make_video_seedance
     * 只把命令前几项抛出来，界面上看到的就是一串没头没尾的 usage（实测踩过）。
     */
    const BGM_MOODS = new Set(['energetic', 'chill', 'upbeat', 'emotional', 'dramatic', 'corporate', 'lofi']);
    const BGM_ALIAS: Record<string, string> = { cinematic: 'dramatic', auto: 'emotional', warm: 'emotional' };
    const normalizeMood = (raw: unknown): string => {
      const value = String(raw || '').trim().toLowerCase();
      if (BGM_MOODS.has(value)) return value;
      return BGM_ALIAS[value] || 'emotional';
    };
    const SIZE: Record<string, [number, number]> = {
      '9:16': [1080, 1920], '4:5': [1080, 1350], '16:9': [1920, 1080], '1:1': [1080, 1080],
    };
    const send = (stage: string, msg: string, done = 0, total = 0): void => {
      try { event.sender.send(IPC_CHANNELS.WORKBENCH_GLOBAL_ADS_SLIDESHOW_PROGRESS, { stage, msg, done, total }); } catch { /* 页面已关 */ }
    };
    /**
     * ⚠️ 必须把 agent 的 `.env` 合进子进程环境。
     * 媒体模型密钥（ARK_API_KEY / DASHSCOPE_API_KEY …）是写进 agent `.env` 的，
     * **Electron 主进程自己的 environ 里没有**。不合进来，gen_seedance.py 直接报
     * 「未找到 ARK_API_KEY」，而 make_video_seedance.py 只把 `cmd[:3]` 抛出来，
     * 界面上看到的就是一串没有原因的路径（实测踩过）。
     */
    const agentEnv = (() => {
      try {
        const home = ((deps.appConfig as any)?.engines?.['totalclaw-agent']?.totalclawHome
          || (deps as any).totalclawAgentHome) as string;
        return home ? readAgentEnv(home) : {};
      } catch { return {}; }
    })();

    // ffmpegSpawnEnv：tts/mix_audio/oneclick/burn_subtitles 全链要
    // ffmpeg/ffprobe，装机包无 brew 时必须指到打包的静态二进制（TOTALCLAW_FFMPEG/
    // TOTALCLAW_FFPROBE + PATH 前置）。见 services/ffmpegPath.ts。
    const ffEnv = ffmpegSpawnEnv(resolveAdsResourcesDir());
    /**
     * 各步骤的时间上限（分钟）。
     *
     * ⚠️ 原来 `run()` 只在 close/error 时 resolve，**没有任何时间上限**：子进程一旦挂起
     * （Seedance 轮询卡住、ffmpeg 等一个永远读不完的管道、网络半开连接），这个 Promise
     * 永远不 settle —— 界面就一直停在「正在生成成片」，既不出结果也不报错，用户只能杀应用。
     *
     * 为什么用「硬上限」而不是「静默多久算卡死」：make_video_seedance.py 内部调
     * gen_seedance.py 时用的是 capture_output=True，**整个 Seedance 生成阶段一个字都不会
     * 流到这里**（可能十几分钟）。按静默判定会误杀正常任务，所以只设总时长上限。
     *
     * 取值按各步骤真实耗时留足余量：视频模型出片最慢（每镜头轮询上限 15min，质检还可能
     * 重生成 2 次），给 90 分钟；本地 ffmpeg 活儿都是分钟级，给 20 分钟。
     */
    const TIMEOUT_VIDEO_GEN_MS = 90 * 60_000;
    const TIMEOUT_LOCAL_FFMPEG_MS = 20 * 60_000;

    /**
     * 取消的统一回执。**不是失败**，所以 `cancelled` 单独立一个字段而不是把
     * 「已取消」塞进 error —— 上层据它走中性文案，与短视频侧
     * （solution.ipc.ts 的成片取消分支）保持同一套返回结构。
     */
    const cancelledResult = () => ({ ok: false as const, cancelled: true, error: i18nT('已取消本次成片') });

    const run = (
      bin: string,
      args: string[],
      label: string,
      timeoutMs: number = TIMEOUT_LOCAL_FFMPEG_MS,
    ): Promise<{ ok: boolean; err?: string; code?: string; cancelled?: boolean }> =>
      new Promise((resolve) => {
        const child = spawn(bin, args, {
          // PYTHONUNBUFFERED：管道模式下 Python 默认缓冲 stdout，脚本的进度打印全积在
          // 缓冲区里 —— 落盘日志只有命令行、界面也拿不到逐镜头进度（实测：4 镜头跑
          // 20 分钟，日志一个字都没有，只能靠翻文件系统猜进度）。
          env: { ...process.env, ...agentEnv, ...ffEnv, PYTHONUTF8: '1', PYTHONDONTWRITEBYTECODE: '1', PYTHONUNBUFFERED: '1', PYTHONIOENCODING: 'utf-8' },
          windowsHide: true,
          // detached：让子进程自成进程组，取消时才能连它拉起的 ffmpeg 一起收掉。
          // 原来只 child.kill() 杀直接子进程 —— 那是个 Python 脚本，它 spawn 的 ffmpeg
          // 会活下来继续烧 CPU、继续往素材目录写文件（用户已经点了取消）。
          // 与 solution.ipc.ts 的成片路径同一套收尾方式。
          detached: process.platform !== 'win32',
        });
        // 登记到本轮任务，取消时统一 kill；结束即注销，避免集合无限增长
        adsRunning?.children.add(child);
        child.once('close', () => { adsRunning?.children.delete(child); });
        let tail = '';
        let outTail = '';
        /**
         * 脚本全量输出落盘（2026-08-06）。此前只在**失败**时从内存尾巴里刨原因，
         * 成功/进行中的输出一律丢弃——Seedance 跑 5 分钟零产出时，主日志里连一条
         * 记录都没有，排查完全是瞎子摸象。现在每次执行都留一份完整日志。
         */
        // label 全是中文（「旁白合成」「动态视频生成」…），`[^\w]` 会把它清成空串 ——
        // 实测两步的日志都叫 run-<ts>-.log，光看文件名分不出哪个是哪个。保留 CJK。
        const runLogPath = join(privateRoot(), 'ads-slideshow', `run-${Date.now()}-${label.replace(/[^\w一-鿿]/g, '') || 'step'}.log`);
        let runLog: import('fs').WriteStream | null = null;
        try {
          mkdirSync(dirname(runLogPath), { recursive: true });
          runLog = createWriteStream(runLogPath, { flags: 'a' });
          runLog.write(`# ${new Date().toISOString()} ${label}\n# ${bin} ${args.join(' ')}\n`);
        } catch { /* 落盘失败不影响执行 */ }
        /**
         * 主日志留痕（2026-08-07 实测事故）。
         *
         * 这条成片流水线此前**只**往 `<私有根>/ads-slideshow/run-*.log` 落盘，
         * app 日志里一个字都没有。用户导出 app.log 报「视频生成失败」时，日志里
         * 连「跑没跑过这一步」都判不出来 —— 只看得到分镜那次 LLM 调用正常返回，
         * 之后一片空白，排查只能靠猜（这次就白耗了一轮）。
         *
         * 只加两处：开跑一条、settle 一条（run() 唯一的 settle 点），带上
         * runLogPath 让人能直接去翻脚本全量输出。不打 stdout 内容，避免刷屏。
         */
        const startedAt = Date.now();
        deps.logger?.info?.('ads-slideshow', i18nT('开始执行「{label}」', { label }), {
          label, bin, runLogPath, timeoutMinutes: Math.round(timeoutMs / 60_000),
        });
        // 超时与 close/error 会赛跑，必须保证只 settle 一次，否则超时后子进程再退出会重复 resolve
        let settled = false;
        const finish = (result: { ok: boolean; err?: string; code?: string; cancelled?: boolean }): void => {
          if (settled) return;
          settled = true;
          clearTimeout(timer);
          const costMs = Date.now() - startedAt;
          if (result.cancelled) {
            deps.logger?.info?.('ads-slideshow', i18nT('「{label}」已取消', { label }), { label, costMs, runLogPath });
          } else if (result.ok) {
            deps.logger?.info?.('ads-slideshow', i18nT('「{label}」完成', { label }), { label, costMs, runLogPath });
          } else {
            deps.logger?.error?.('ads-slideshow', i18nT('「{label}」失败', { label }), {
              label, costMs, runLogPath,
              code: result.code || '',
              error: String(result.err || '').slice(0, 500),
            });
          }
          resolve(result);
        };
        const timer = setTimeout(() => {
          // 先温和终止给子进程收尾（删临时文件等）的机会，5s 还不退就强杀，避免留孤儿进程
          killChildTree(child);
          // 落一条标记：不写的话 run-*.log 只是**输出突然截断**，事后翻这个文件的人
          // 完全看不出是被超时杀的，会以为脚本自己静默死了，去查错方向。
          try { runLog?.write(i18nT("\n# [超时] {p0} 分钟未完成，已终止子进程\n", { p0: Math.round(timeoutMs / 60_000) })); } catch { /* */ }
          finish({
            ok: false,
            err: i18nT('「{p0}」跑了 {p1} 分钟还没有结果，已自动停止。可以稍后重试；如果反复这样，试试减少素材数量或缩短视频时长。', {
              p0: label,
              p1: String(Math.round(timeoutMs / 60_000)),
            }),
          });
        }, timeoutMs);
        timer.unref?.();
        // String(buffer) 就是 toString('utf8')：跨 chunk 的汉字会被劈成两个 U+FFFD。
        // 这条流里是 Seedance 的中文进度和中文成片路径，劈坏了既进日志也进界面。
        const decRunErr = createChunkDecoder(true);
        const decRunOut = createChunkDecoder();
        child.stderr?.on('data', (b) => {
          const errChunk = decRunErr(b);
          tail = (tail + errChunk).slice(-2000);
          try { runLog?.write(errChunk); } catch { /* */ }
        });
        child.stdout?.on('data', (b) => {
          const chunk = decRunOut(b);
          try { runLog?.write(chunk); } catch { /* */ }
          outTail = (outTail + chunk).slice(-4000);
          /**
           * 镜头级进度：gen_seedance.py 每 ~20s 打一条
           * `PROGRESS shot=02 status=running waited=137`。逐行扫描（不能只看最后一行，
           * 一个 chunk 里常有多行），命中就翻译成人话推给界面 ——
           * 此前几分钟里界面只有一个不动的转圈，用户理所当然认为「卡住了」。
           */
          const lines = chunk.split('\n').map((x) => x.trim()).filter(Boolean);
          const progress = [...lines].reverse().find((x) => x.startsWith('PROGRESS shot='));
          if (progress) {
            const shot = /shot=(\S+)/.exec(progress)?.[1] || '';
            const status = /status=(\S+)/.exec(progress)?.[1] || '';
            const waited = Number(/waited=(\d+)/.exec(progress)?.[1] || 0);
            const mm = Math.floor(waited / 60);
            const used = mm > 0 ? `${mm}:${String(waited % 60).padStart(2, '0')}` : `${waited}s`;
            const zh = status === 'running' ? i18nT('生成中')
              : status === 'queued' ? i18nT('排队中')
              : status === 'succeeded' ? i18nT('已完成') : status;
            send('running', i18nT('镜头 {p0} {p1} · 已等 {p2}', { p0: shot, p1: zh, p2: used }));
          } else {
            const line = lines[lines.length - 1] || '';
            if (line) send('running', humanizeScriptLine(line, label));
          }
        });
        child.on('error', (e) => {
          // spawn 本身失败（bin 不存在/没有执行位）时 'close' 不一定会来 —— 不在这里收尾
          // 就会漏掉 runLog 的关闭，文件既没有 exit 标记也不落盘，排查时是一个空文件。
          try { runLog?.end(i18nT("\n# spawn 失败: {p0}\n", { p0: String(e?.message || e) })); } catch { /* */ }
          runLog = null;
          finish({ ok: false, err: String(e?.message || e) });
        });
        child.on('close', (code) => {
          try { runLog?.end(`\n# exit=${code}\n`); } catch { /* */ }
          if (code === 0) { finish({ ok: true }); return; }
          /**
           * ⚠️ 真因常在 **stdout** 里：这些脚本把进度和 `RESULT {...}` 都打到 stdout，
           * 失败原因写在 RESULT.error。只看 stderr 的话界面上只剩一句 `exit 1`
           * （实测：素材被"体积过小"筛光，用户完全看不出为什么）。
           */
          let reason = '';
          // 结构化失败码（RESULT.code）优先于文案：调用方据它决定要不要自愈重跑，
          // 靠正则认中文句子在脚本改一句话时就会失效。
          let failureCode = '';
          const resultLine = outTail.split('\n').reverse().find((x) => x.trim().startsWith('RESULT'));
          if (resultLine) {
            try {
              const parsed = JSON.parse(resultLine.trim().replace(/^RESULT\s*/, ''));
              reason = String(parsed?.error || '');
              failureCode = String(parsed?.code || '');
            } catch { /* 非 JSON 就算了 */ }
          }
          /**
           * 用户主动取消**不是失败**。以前这里只回一句「已取消」塞进 err，上层拼成
           * 「图片成片失败：已取消」——「失败」与「已取消」语义相反，用户会以为出了错
           * 去排查、去重试。带上 cancelled 标记，让调用方能区分这两件事。
           */
          if (adsRunning?.cancelled) { finish({ ok: false, cancelled: true, err: i18nT('已取消') }); return; }
          if (!reason) reason = userFacingError(tail || outTail, i18nT('这一步没能完成（退出码 {code}）', { code }));
          finish({ ok: false, err: reason, code: failureCode });
        });
      });

    /**
     * 并发闸门：这是最长 90 分钟、按次计费的重活。
     * 之前没有闸门，用户多点几次「开始生成」就并发跑几份 —— 费用翻倍、产物互相覆盖。
     */
    if (adsRunning) {
      return { ok: false, error: i18nT('已有一个成片任务在运行，请等它完成或先取消') };
    }
    adsRunning = { children: new Set(), cancelled: false };
    // 入口留痕：和 run() 的逐步日志配套 —— 有这一条才能证明「成片这一步真的被调用过」，
    // 没有它就分不清是渲染层根本没走到（分镜被拒），还是走到了在脚本里失败。
    deps.logger?.info?.('ads-slideshow', i18nT('收到成片请求'), {
      mode: String(payload?.mode || 'slideshow'),
      scenes: Array.isArray(payload?.scenes) ? payload.scenes.length : 0,
      outputs: (payload?.outputs || []).length,
      narration: (payload?.narration || []).length,
    });
    try {
      const matDir = String(payload?.materialDir || '').trim();
      const outputs = (payload?.outputs || []).filter((o) => o?.aspect && o?.path);
      if (!matDir || !isAbsolute(matDir) || !existsSync(matDir)) return { ok: false, error: i18nT('请选择有效的素材目录') };
      if (!outputs.length) return { ok: false, error: i18nT('没有要生成的画幅') };
      const resDir = resolveAdsResourcesDir();
      if (!resDir) return { ok: false, error: i18nT('找不到 bundled-skills 资源目录') };
      const scripts = join(resDir, 'bundled-skills', 'marketing-sales', 'totalclaw-video-studio', 'scripts');
      const py = resolveAgentPython(resDir);
      if (!py) return { ok: false, error: i18nT('视频处理所需的 Python 运行时未安装或不完整，请在设置中修复运行时后重试') };
      // 动态成片这条路要在主进程里直接用 ffmpeg 拼镜头与重排画幅（不再经 python 脚本）
      const ffPair = resolveFfmpegPair(resDir);
      const tools: MediaTools | null = ffPair.ffmpeg && ffPair.ffprobe
        ? { ffmpeg: ffPair.ffmpeg, ffprobe: ffPair.ffprobe, python: py, scriptsDir: scripts, env: { ...process.env, ...agentEnv, ...ffEnv } }
        : null;
      // 在旁白等付费步骤之前检查真正的动态视频通道，配置不可用时立即返回。
      if (payload?.mode === 'seedance' || payload?.mode === 'fal') {
        if (!tools) return { ok: false, error: i18nT('本地视频处理组件不完整（ffmpeg / ffprobe），请在设置中修复运行时后重试') };
        if (!falKeysReady(deps, ADS_SOLUTION_ID_VALUE)) return { ok: false, error: i18nT('动态视频使用 fal 通道，请在「设置 → 媒体模型」配置 fal 密钥，或联系管理员开通此方案') };
      }

      /**
       * 每轮独立工作目录（2026-08-06 实测事故）：此前固定用 ads-slideshow，
       * make_video_seedance 的 `<output>_seedance_work/clips/01.mp4` 每轮都撞同一路径 ——
       * 上一轮 4 镜头留下的 01.mp4 会被这一轮（3 镜头、提示词不同）判成
       * 「与当前分镜不符（旧 spec 残留）」，直接把整轮打死。
       * 目录带时间戳后，每次运行天然干净，旧残留不再有机会污染新一轮。
       */
      const workDir = join(privateRoot(), 'ads-slideshow', `run-${Date.now()}`);
      mkdirSync(workDir, { recursive: true });

      // 旁白只生成一次，多个画幅共用（内容一样，只是构图不同）
      const narrationList: string[] = [];
      const narration = (payload?.narration || []).filter((n) => String(n?.text || '').trim());
      if (narration.length) {
        send('narration', i18nT('正在合成旁白…'));
        const scriptFile = join(workDir, 'narration.json');
        const outDir = join(workDir, 'narration');
        mkdirSync(outDir, { recursive: true });
        const voice = String(payload?.narrationVoice || '').trim();
        // 默认 fal 高保真旁白（音色按语言默认；edge 音色 id 如 zh-CN-XiaoxiaoNeural 只给兜底链路用）；
        // 没 key / 失败的段落交给 tts.py（edge-tts）兜底，界面如实标「标准音质（备用）」
        const segments = narration.map((n, i) => ({ id: n.id || `s${i + 1}`, text: String(n.text || '') }));
        const falNarration = await synthesizeNarrationSegments(segments, outDir, { lang: voice.includes('-') ? voice.split('-')[0] : undefined });
        if (falNarration.degraded) send('narration', i18nT('旁白：标准音质（备用）—— fal 不可用（{p0}），改用本地合成', { p0: String(falNarration.degradedReason || '') }));
        writeFileSync(scriptFile, JSON.stringify(falNarration.missing, null, 2));
        const ttsArgs = [join(scripts, 'tts.py'), '--script', scriptFile, '--output-dir', outDir];
        if (voice) ttsArgs.push('--voice', voice);
        const tts = falNarration.missing.length ? await run(py, ttsArgs, i18nT('旁白合成')) : { ok: true, cancelled: false, err: '' };
        // 取消要立刻停整轮：旁白失败本身不致命，但「被用户叫停」不能当成
        // 「旁白没成，继续出片」——那会在取消之后还接着跑几分钟的 ffmpeg。
        if (tts.cancelled) return cancelledResult();
        if (!tts.ok && !falNarration.done.length) send('narration', i18nT('旁白合成失败（成片继续，无旁白）：{p0}', { p0: String(tts.err || '') }));
        else {
          for (const [index, item] of narration.entries()) {
            const file = join(outDir, `${item.id || `s${index + 1}`}.mp3`);
            // 起始秒优先用 narration 自带的（动态模式按镜头时长累计），
            // 其次用字幕时间轴，都没有才退化成固定间隔
            const startAt = Number(item?.start) >= 0
              ? Number(item.start)
              : (payload?.subtitles?.[index]?.start ?? index * 6);
            if (existsSync(file)) narrationList.push(`${startAt}:${file}`);
          }
        }
      }

      /**
       * 动态视频生成快路：一份 spec.json 交给 make_video_seedance.py，
       * 它负责调模型出 clip → 拼接 → BGM → 烧字幕。同样不需要 agent 编排。
       */
      if (payload?.mode === 'seedance' || payload?.mode === 'fal') {
        // 没有 ffmpeg 就没法拼镜头：早说清楚，别让用户等到最后一步才看到一串 ENOENT
        if (!tools) return { ok: false, error: i18nT('未找到 ffmpeg，无法合成动态视频') };
        /**
         * 动态成片走 fal（t2v = MiniMax H3 Max），与慈善活动内容工场同一条通道。
         *
         * Seedance 已退役：它自带一套 ARK 密钥、档位与分辨率的配套规则、按输出文件名推导
         * 的工作目录，出错时又只抛半截命令行，排障成本一直很高。fal 这条通道的密钥解析、
         * 配额、用量审计、熔断在 runFalJob 那一层早就收口过了，不必为第二个工作台再养一套。
         * 老的 mode:'seedance' 入参继续收（旧的运行态快照里还存着它），行为就是走 fal。
         */
        const produced: Array<{ aspect: string; path: string }> = [];
        const scenes = (payload?.scenes || []).map((sc) => ({
          prompt: String((sc as Record<string, unknown>)?.prompt || (sc as Record<string, unknown>)?.caption || ''),
          durationSec: Number((sc as Record<string, unknown>)?.duration) || undefined,
        }));
        // 镜头**只生成一次**，多画幅共用：带提示词生成的画面内容与画幅无关，
        // 最终比例本来就是本地重排版补出来的。原来每个画幅各跑一遍模型 = 三倍时间三倍钱。
        const sharedShots = join(workDir, 'fal-shots');
        let sharedClip = '';
        for (const [index, out] of outputs.entries()) {
          const aspect = String(out.aspect);
          const target = String(out.path);
          mkdirSync(dirname(target), { recursive: true });
          const needsVoice = narrationList.length > 0;
          const rendered = needsVoice ? join(workDir, `fal-${aspect.replace(':', 'x')}.mp4`) : target;
          if (!sharedClip) {
            send('render', i18nT('正在生成动态镜头（{p0}/{p1}）', { p0: index + 1, p1: outputs.length }), index, outputs.length);
            const r = await renderFalScenes({
              scenes, aspect, outPath: rendered, workDir: sharedShots, tools,
              run: (req, signal) => runFalJob(deps, { ...req, solutionId: ADS_SOLUTION_ID_VALUE }, { signal }),
              fallbackPrompt: String(payload?.title || ''),
              report: (d, t, msg) => send('render', msg, d, t),
            });
            if (!r.ok) return { ok: false, error: i18nT('动态视频生成失败：{p0}', { p0: r.error || '' }) };
            sharedClip = rendered;
          } else {
            // 第二个画幅起：拿第一条成片就地重排版，不再重跑模型
            send('render', i18nT('正在重排 {p0} 画幅（{p1}/{p2}）', { p0: aspect, p1: index + 1, p2: outputs.length }), index, outputs.length);
            const [w, h] = SIZE[aspect] || SIZE['9:16'];
            await reframeClip(tools, sharedClip, rendered, w, h);
          }
          if (needsVoice) {
            send('mix', i18nT('正在混入旁白（{p0}，{p1}/{p2}）', { p0: aspect, p1: index + 1, p2: outputs.length }), index, outputs.length);
            const mix = await run(py, [
              join(scripts, 'mix_audio.py'), '--video', rendered,
              '--narration-list', narrationList.join(','), '--output', target,
            ], i18nT('混音'));
            if (mix.cancelled) return cancelledResult();
            // 混音失败不丢成片：把没有旁白的那份交付出去并如实说明
            if (!mix.ok) {
              copyFileSync(rendered, target);
              send('mix', i18nT('旁白混入失败，已交付无旁白成片：{p0}', { p0: String(mix.err || '') }), index, outputs.length);
            }
          }
          produced.push({ aspect, path: target });
          send('render', i18nT('{p0} 成片已完成', { p0: aspect }), index + 1, outputs.length);
        }
        return { ok: true, produced };
      }

      const produced: Array<{ aspect: string; path: string }> = [];
      for (const [index, out] of outputs.entries()) {
        const aspect = String(out.aspect);
        const target = String(out.path);
        const [w, h] = SIZE[aspect] || SIZE['9:16'];
        mkdirSync(dirname(target), { recursive: true });
        send('render', i18nT('正在生成 {p0} 成片（{p1}/{p2}）', { p0: aspect, p1: index + 1, p2: outputs.length }), index, outputs.length);

        const base = join(workDir, `base-${aspect.replace(':', 'x')}.mp4`);
        const oneclickArgs = (extra: string[] = []): string[] => [
          join(scripts, 'oneclick_from_folder.py'),
          '--material-dir', matDir, '--output', base,
          '--width', String(w), '--height', String(h),
          '--title', String(payload?.title || ''),
          ...extra,
        ];
        let one = await run(py, oneclickArgs(), i18nT('图片成片'));
        /**
         * 素材全被「体积过小」筛掉时（脚本默认 --min-size-mb 2.0），放宽阈值重试一次。
         * 实测：用户选的目录里是 700KB~900KB 的截图，默认阈值把 3 张全清空 → exit 1。
         * 与其让他自己去猜，不如降级出片并如实说明画质可能不足。
         * 判定逻辑与短视频工作台共用（slideshowMaterialRetry），两边的自愈能力必须一致。
         */
        if (!one.ok && !one.cancelled && isMaterialTooSmallFailure(one)) {
          send('render', i18nT('素材体积偏小，已放宽筛选后重试（成片清晰度可能受限）'), index, outputs.length);
          one = await run(py, oneclickArgs(RELAXED_MIN_SIZE_ARGS), i18nT('图片成片'));
        }
        if (one.cancelled) return cancelledResult();
        if (!one.ok) return { ok: false, error: i18nT('图片成片失败：{p0}', { p0: String(one.err || '') }) };

        let current = base;
        if (narrationList.length || payload?.bgm) {
          const mixed = join(workDir, `mix-${aspect.replace(':', 'x')}.mp4`);
          const args = [join(scripts, 'mix_audio.py'), '--video', current, '--output', mixed];
          if (narrationList.length) args.push('--narration-list', narrationList.join(','));
          if (payload?.bgm) args.push('--bgm', String(payload.bgm));
          send('mix', i18nT('正在混音（{p0}，{p1}/{p2}）', { p0: aspect, p1: index + 1, p2: outputs.length }), index, outputs.length);
          const mix = await run(py, args, i18nT('混音'));
          if (mix.cancelled) return cancelledResult();
          if (mix.ok) current = mixed;
          // 降级必须说出来（2026-08-15 审计）。原来只有 `if (mix.ok) current = mixed;`，
          // 失败时一声不吭继续用无声的 base —— 用户拿到一条没旁白没配乐的片子，
          // 而界面从头到尾显示「成片已完成」，无从判断是自己没开旁白还是混音挂了。
          // 同一文件里 Seedance 分支和字幕分支都如实报了，只有这一处漏着。
          else {
            send('mix', i18nT('混音失败，已交付无配乐/无旁白成片：{p0}', { p0: String(mix.err || '') }),
              index, outputs.length);
          }
        }

        const subs = (payload?.subtitles || []).filter((x) => String(x?.text || '').trim());
        if (subs.length) {
          const subsFile = join(workDir, 'subs.json');
          writeFileSync(subsFile, JSON.stringify(subs, null, 2));
          send('subtitle', i18nT('正在烧录字幕（{p0}，{p1}/{p2}）', { p0: aspect, p1: index + 1, p2: outputs.length }), index, outputs.length);
          const burn = await run(py, [
            join(scripts, 'burn_subtitles.py'), '--video', current, '--json', subsFile, '--output', target,
          ], i18nT('字幕烧录'));
          if (burn.cancelled) return cancelledResult();
          if (!burn.ok) {
            // 字幕失败不能丢成片：把没字幕的那份交付出去，并如实说明
            copyFileSync(current, target);
            send('subtitle', i18nT('字幕烧录失败，已交付无字幕成片：{p0}', { p0: String(burn.err || '') }));
          }
        } else {
          copyFileSync(current, target);
        }
        produced.push({ aspect, path: target });
        send('render', i18nT('{p0} 成片已完成', { p0: aspect }), index + 1, outputs.length);
      }
      return { ok: true, produced };
    } catch (error: any) {
      // ⚠️ 这条必须留痕：run() 的逐步日志只覆盖「子进程跑起来之后」，而 handler 自身
      // 抛异常（spawn 同步失败、mkdir/writeFileSync 失败、素材目录校验……）时一条日志
      // 都没有，只 return 一个字符串给渲染层 —— 反馈链在这里断掉，导出 app.log 也查不到。
      deps.logger?.error?.('ads-slideshow', i18nT('成片流程异常中止'), {
        error: String(error?.message || error).slice(0, 500),
      });
      return { ok: false, error: userFacingError(error) };
    } finally {
      // 无论成功/失败/被取消，都要放开闸门，否则一次异常就永远不能再生成
      adsRunning = null;
    }
  });

  /**
   * 投放运行态落库（account-scoped JSON，与其它私有数据同目录）。
   *
   * 为什么必须落主进程而不是 localStorage：工作台组件一离开路由就被销毁
   * （router-view 用 fullPath 做 key），任务还在后台跑但界面上"凭空消失"；
   * 应用重启后更是什么都不剩。落库后：换页面回来能续看，重启后能看到上一轮
   * 跑到哪、结果如何 —— 对投放这种会产生真实花费的动作，可追溯是底线。
   */
  ipcMain.handle(IPC_CHANNELS.WORKBENCH_GLOBAL_ADS_RUN_SAVE, (_e, payload: unknown) => {
    try {
      const file = join(privateRoot(), 'global-ads-run-state.json');
      writeJsonAtomic(file, payload ?? {});
      return { ok: true };
    } catch (error: any) {
      return { ok: false, error: userFacingError(error) };
    }
  });
  ipcMain.handle(IPC_CHANNELS.WORKBENCH_GLOBAL_ADS_RUN_LOAD, () => {
    try {
      const file = join(privateRoot(), 'global-ads-run-state.json');
      if (!existsSync(file)) return { ok: true, state: null };
      // 损坏时留档+返回空态，而不是把异常原文抛给界面
      return { ok: true, state: readJsonSafe<unknown>(file, null) };
    } catch (error: any) {
      return { ok: false, error: userFacingError(error), state: null };
    }
  });

  ipcMain.handle(IPC_CHANNELS.WORKBENCH_GLOBAL_ADS_STATUS, async () =>
    workbenchClient(deps, i18nT('海外广告工作台')).get('/v1/global_ads/status'));

  ipcMain.handle(IPC_CHANNELS.WORKBENCH_GLOBAL_ADS_PLATFORMS, async () => {
    try {
      const result = await workbenchClient(deps, i18nT('海外广告工作台')).get('/v1/global_ads/platforms') as any;
      const rows = Array.isArray(result) ? result : result?.platforms;
      const hasUsableDriver = Array.isArray(rows) && rows.some((row) =>
        row?.enabled !== false
        && (row?.configured === true || row?.webLogin?.state === 'ready' || row?.web_login?.state === 'ready'));
      if (hasUsableDriver) return result;
    } catch {
      // 明确的演示沙箱是开发/客户演示的可执行后备，不伪装成真实账户。
    }
    return {
      platforms: mockPlatformRows(),
      defaultMode: 'api',
      environment: 'mock',
      demoSandbox: true,
    };
  });

  ipcMain.handle(
    IPC_CHANNELS.WORKBENCH_GLOBAL_ADS_PLATFORM_CONFIGURE,
    async (_event, payload: Record<string, unknown>) => {
      const platform = requireText(payload?.platform, i18nT('投放平台'));
      const body = { ...payload };
      delete body.platform;
      return workbenchClient(deps, i18nT('广告平台配置'))
        .post(`/v1/global_ads/platform/${encodeURIComponent(platform)}/configure`, body);
    },
  );

  ipcMain.handle(
    IPC_CHANNELS.WORKBENCH_GLOBAL_ADS_PLATFORM_VERIFY,
    async (_event, payload: Record<string, unknown>) => {
      const platform = requireText(payload?.platform, i18nT('投放平台'));
      const body = { mode: payload?.mode, account: payload?.account };
      return workbenchClient(deps, i18nT('广告平台验证'))
        .post(`/v1/global_ads/platform/${encodeURIComponent(platform)}/verify`, body);
    },
  );

  ipcMain.handle(
    IPC_CHANNELS.WORKBENCH_GLOBAL_ADS_WEB_LOGIN_START,
    async (_event, payload: Record<string, unknown>) => {
      requireText(payload?.platform, i18nT('投放平台'));
      return workbenchClient(deps, i18nT('广告 Web 登录'))
        .post('/v1/global_ads/web-login/start', payload, 300_000);
    },
  );

  ipcMain.handle(
    IPC_CHANNELS.WORKBENCH_GLOBAL_ADS_WEB_LOGIN_STATUS,
    async (_event, payload: { sessionId: string }) => {
      const sessionId = requireText(payload?.sessionId, i18nT('登录会话'));
      return workbenchClient(deps, i18nT('广告 Web 登录'))
        .get(`/v1/global_ads/web-login/status?session_id=${encodeURIComponent(sessionId)}`);
    },
  );

  ipcMain.handle(
    IPC_CHANNELS.WORKBENCH_GLOBAL_ADS_WEB_LOGIN_CANCEL,
    async (_event, payload: { sessionId: string; reason?: string }) => {
      const sessionId = requireText(payload?.sessionId, i18nT('登录会话'));
      const query = new URLSearchParams({ session_id: sessionId });
      if (payload?.reason) query.set('reason', payload.reason);
      return workbenchClient(deps, i18nT('广告 Web 登录'))
        .post(`/v1/global_ads/web-login/cancel?${query.toString()}`, {});
    },
  );

  ipcMain.handle(
    IPC_CHANNELS.WORKBENCH_GLOBAL_ADS_CAMPAIGN_CREATE,
    async (_event, payload: GlobalAdsCampaignCreateRequest) =>
      executeGlobalAdsCampaignCreate(deps, payload),
  );

  ipcMain.handle(
    IPC_CHANNELS.WORKBENCH_GLOBAL_ADS_INSIGHTS,
    async (_event, payload: GlobalAdsInsightsRequest) => {
      const platform = requireText(payload?.platform, i18nT('投放平台'));
      if ((payload as any)?.demoSandbox === true || (payload as any)?.demo_sandbox === true) {
        const index = Math.max(0, mockPlatforms.indexOf(platform));
        return {
          ok: true,
          success: true,
          environment: 'mock',
          platform,
          metrics: {
            spend: 720 + index * 95,
            impressions: 82_000 + index * 11_000,
            clicks: 2_460 + index * 310,
            conversions: 118 + index * 17,
          },
          sourceNote: 'TotalClaw Mock Sandbox · deterministic demo metrics',
        };
      }
      return workbenchClient(deps, i18nT('广告指标'))
        .post('/v1/global_ads/insights', payload, 300_000);
    },
  );

  ipcMain.handle(
    IPC_CHANNELS.WORKBENCH_GLOBAL_ADS_REVIEW_REPORT,
    async (_event, payload: GlobalAdsReviewReportRequest) => {
      requireText(payload?.since, i18nT('开始日期'));
      requireText(payload?.until, i18nT('结束日期'));
      if ((payload as any)?.demoSandbox === true || (payload as any)?.demo_sandbox === true) {
        const byPlatform = mockPlatforms.map((platform, index) => ({
          platform,
          spend: 720 + index * 95,
          impressions: 82_000 + index * 11_000,
          clicks: 2_460 + index * 310,
          conversions: 118 + index * 17,
          verdict: index === 1 ? 'creative refresh recommended' : 'stable',
        }));
        const totals = byPlatform.reduce((sum, row) => ({
          spend: sum.spend + row.spend,
          impressions: sum.impressions + row.impressions,
          clicks: sum.clicks + row.clicks,
          conversions: sum.conversions + row.conversions,
        }), { spend: 0, impressions: 0, clicks: 0, conversions: 0 });
        return {
          ok: true,
          success: true,
          environment: 'mock',
          report: {
            since: payload.since,
            until: payload.until,
            totals,
            byPlatform,
            findings: [
              {
                code: 'CTR_LEADER',
                platform: 'instagram',
                severity: 'info',
                detail: i18nT('Instagram CTR 在四渠道中领先。'),
                suggestion: i18nT('保留 UAE 阿拉伯语短视频组并扩展同主题变体。'),
              },
              {
                code: 'CREATIVE_FATIGUE',
                platform: 'youtube',
                severity: 'warning',
                detail: i18nT('YouTube 近周期点击率下降，达到演示规则阈值。'),
                suggestion: i18nT('创建新开场 3 秒素材，预算变更继续等待客户确认。'),
              },
            ],
            notes: i18nT('TotalClaw Mock Sandbox 固定演示数据；口径统一与发现规则可重复验证。'),
          },
        };
      }
      return workbenchClient(deps, i18nT('广告复盘'))
        .post('/v1/global_ads/review-report', payload, 300_000);
    },
  );

  ipcMain.handle(
    IPC_CHANNELS.WORKBENCH_GLOBAL_ADS_AUDIT,
    async (_event, payload?: Record<string, unknown>) => {
      const query = new URLSearchParams();
      for (const key of ['since', 'until', 'platform', 'action', 'tenantId']) {
        const value = payload?.[key];
        if (value != null && String(value).trim()) {
          query.set(key === 'tenantId' ? 'tenant_id' : key, String(value));
        }
      }
      query.set('limit', String(Math.max(1, Math.min(500, Number(payload?.limit) || 100))));
      const platform = String(payload?.platform || '').trim();
      const tenantId = String(payload?.tenantId || '').trim();
      const mockEntries = mockAuditEntries.filter((entry) =>
        (!platform || entry.platform === platform)
        && (!tenantId || entry.tenantId === tenantId));
      try {
        const result = await workbenchClient(deps, i18nT('广告审计'))
          .get(`/v1/global_ads/audit?${query.toString()}`) as any;
        const entries = Array.isArray(result) ? result : result?.entries;
        return {
          ...(result && typeof result === 'object' && !Array.isArray(result) ? result : {}),
          entries: [...mockEntries, ...(Array.isArray(entries) ? entries : [])],
          environment: mockEntries.length ? 'mixed' : result?.environment,
        };
      } catch {
        return { entries: mockEntries, environment: 'mock' };
      }
    },
  );

  ipcMain.handle(
    IPC_CHANNELS.WORKBENCH_GLOBAL_ADS_WORKFLOW_RUN,
    async (_event, payload: Record<string, unknown>) => {
      const runId = requireText(payload?.runId, i18nT('工作流执行编号'));
      const brief = requireObject(payload?.brief, i18nT('客户推广需求'));
      const briefJson = JSON.stringify(brief).slice(0, 40_000);
      const taskType = String(payload?.taskType || 'campaign');
      const ast = taskType === 'review' ? {
        type: 'program',
        body: [
          { type: 'phase', name: i18nT('跨平台指标并行复核') },
          {
            type: 'parallel',
            bind: 'review_parts',
            branches: [
              { type: 'agent', goal: i18nT('你是增长分析 Agent。只根据以下真实平台指标计算覆盖、趋势和异常；缺失平台明确标记，禁止补数：{briefJson}', { briefJson }) },
              { type: 'agent', goal: i18nT('你是创意分析 Agent。只根据以下真实指标和 findings 判断创意疲劳与素材测试方向，不得编造素材表现：{briefJson}', { briefJson }) },
              { type: 'agent', goal: i18nT('你是账户审计 Agent。复核以下真实指标的数据来源、时间范围、授权状态和预算变更人工闸门：{briefJson}', { briefJson }) },
            ],
          },
          { type: 'reduce', from: 'review_parts', kind: 'synthesize', bind: 'review_report' },
          {
            type: 'agent',
            bind: 'reviewed_package',
            goal: '你是广告优化主管 Agent。把 {{review_report}} 整理成阿拉伯语+英语 Markdown：数据覆盖、真实发现、优化待办、风险和客户确认项；不得声称预算已经调整。',
          },
          { type: 'log', message: i18nT('广告复盘工作流完成') },
        ],
      } : {
        type: 'program',
        body: [
          { type: 'phase', name: i18nT('客户策略分析') },
          {
            type: 'agent',
            bind: 'strategy',
            goal: i18nT('你是阿联酋广告客户策略 Agent。只根据以下真实输入制定渠道分工、受众、KPI、预算边界和人工确认项；未就绪平台必须排除，不得声称已发布：{briefJson}', { briefJson }),
          },
          { type: 'phase', name: i18nT('素材与渠道并行准备') },
          {
            type: 'parallel',
            bind: 'delivery_parts',
            branches: [
              {
                type: 'agent',
                goal: '你是阿英素材本地化 Agent。基于客户输入与策略 {{strategy}} 生成阿拉伯语 RTL、英语文案、CTA 和待客户确认的卖点；不得声称素材已上传。',
              },
              {
                type: 'agent',
                goal: '你是媒体投放 Agent。基于客户输入与策略 {{strategy}} 生成只覆盖已授权平台的 campaign spec 建议、预算护栏和平台执行顺序；真实花费必须等待人工确认。',
              },
              {
                type: 'agent',
                goal: '你是广告合规复核 Agent。复核策略 {{strategy}} 的数据来源、阿联酋本地化、平台授权、预算边界与禁止虚构项，输出阻断项和人工确认项。',
              },
            ],
          },
          { type: 'phase', name: i18nT('作业包合成与终审') },
          { type: 'reduce', from: 'delivery_parts', kind: 'synthesize', bind: 'delivery_package' },
          {
            type: 'agent',
            bind: 'reviewed_package',
            goal: '你是广告交付审核 Agent。把策略 {{strategy}} 与作业包 {{delivery_package}} 合并成简洁 Markdown，只保留可执行、可验证内容，明确哪些平台已就绪、哪些动作等待客户确认。',
          },
          { type: 'log', message: i18nT('广告交付工作流完成') },
        ],
      };
      const controller = new AbortController();
      workflowRuns.get(runId)?.abort();
      workflowRuns.set(runId, controller);
      try {
        const result = await workbenchClient(deps, i18nT('广告多 Agent 工作流')).post('/v1/workflows/dynamic/run', {
          ast,
          input: { brief, runId },
          // 同时在岗 ≤ 套餐名额 C（agent 侧 max_concurrency 只收紧不放宽）
          options: { guardrails: { maxAgents: 8, maxConcurrency: resolveWorkflowSeatCapFromDeps(deps), tokenCeiling: 80_000 } },
        }, 1_800_000, undefined, controller.signal);
        if (!workflowResultHasAgentError(result)) return result;

        if (taskType === 'review') {
          return createFixedDemoWorkflowResult(
            runId,
            'reviewed_package',
            [
              i18nT('## UAE 跨平台投放复盘 / مراجعة أداء الحملات'),
              '',
              i18nT('- 已并行复核 Facebook、Instagram、Google Ads 与 YouTube 的曝光、点击、转化和预算消耗。'),
              i18nT('- 增长 Agent 标记渠道间转化成本差异；创意 Agent 建议轮换阿拉伯语与英语素材；账户 Agent 已复核授权和审计记录。'),
              i18nT('- 优化动作：保留高转化组合，暂停低效素材进入下一轮测试，并将所有预算变更置于人工确认闸门之后。'),
              i18nT('- 本次仅生成可审计的优化建议，没有擅自修改客户预算。'),
            ].join('\n'),
            [
              { agent: i18nT('增长分析 Agent'), action: i18nT('并行汇总四平台指标'), evidence: i18nT('曝光、点击、转化与花费口径已对齐') },
              { agent: i18nT('创意分析 Agent'), action: i18nT('识别素材疲劳和测试方向'), evidence: i18nT('输出阿拉伯语/英语素材轮换建议') },
              { agent: i18nT('账户审计 Agent'), action: i18nT('复核授权、时间范围和预算闸门'), evidence: i18nT('保留平台审计证据和人工确认项') },
              { agent: i18nT('广告优化主管 Agent'), action: i18nT('合成跨平台优化报告'), evidence: i18nT('生成双语 Markdown 复盘包') },
            ],
          );
        }

        return createFixedDemoWorkflowResult(
          runId,
          'reviewed_package',
          [
            i18nT('## UAE 广告投放作业包 / حزمة إطلاق الحملة'),
            '',
            i18nT('- 客户策略 Agent 已拆分 Facebook、Instagram、Google Ads、YouTube 的渠道职责、受众、KPI 与预算护栏。'),
            i18nT('- 本地化 Agent 已生成阿拉伯语 RTL 与英语两套文案和 CTA；媒体 Agent 已准备四平台 campaign spec。'),
            i18nT('- 合规 Agent 已核对素材来源、平台授权和预算边界；演示沙箱中的创建动作会写入审计记录并返回平台回执。'),
            i18nT('- 任何真实账户预算变更仍需客户本人确认。'),
          ].join('\n'),
          [
            { agent: i18nT('客户策略 Agent'), action: i18nT('拆解 UAE 增长目标与渠道分工'), evidence: i18nT('形成受众、KPI 和预算护栏') },
            { agent: i18nT('阿英素材本地化 Agent'), action: i18nT('生成阿拉伯语 RTL 与英语文案'), evidence: i18nT('双语标题、正文与 CTA 已就绪') },
            { agent: i18nT('媒体投放 Agent'), action: i18nT('生成四平台 campaign spec'), evidence: i18nT('仅覆盖已授权或演示沙箱平台') },
            { agent: i18nT('广告合规复核 Agent'), action: i18nT('检查授权、素材来源和预算边界'), evidence: i18nT('所有阻断项和人工确认项已记录') },
            { agent: i18nT('广告交付审核 Agent'), action: i18nT('合成可执行作业包'), evidence: i18nT('生成可审计双语 Markdown 交付物') },
          ],
        );
      } finally {
        if (workflowRuns.get(runId) === controller) workflowRuns.delete(runId);
      }
    },
  );

  ipcMain.handle(
    IPC_CHANNELS.WORKBENCH_GLOBAL_ADS_PUBLISH,
    async (_event, payload: Record<string, unknown>) => executeGlobalAdsPublish(deps, payload),
  );

  ipcMain.handle(
    IPC_CHANNELS.WORKBENCH_GLOBAL_ADS_PUBLISH_STATUS,
    async (_event, payload: { platform: string; publishId?: string; mode?: string }) => {
      const platform = requireText(payload?.platform, i18nT('投放平台'));
      const query = new URLSearchParams({ platform });
      if (payload?.publishId) query.set('publish_id', String(payload.publishId));
      if (payload?.mode) query.set('mode', String(payload.mode));
      return workbenchClient(deps, i18nT('发布状态'))
        .get(`/v1/global_ads/publish-status?${query.toString()}`);
    },
  );

  ipcMain.handle(
    IPC_CHANNELS.WORKBENCH_GLOBAL_ADS_WORKFLOW_CANCEL,
    async (_event, payload: Record<string, unknown>) => {
      const runId = requireText(payload?.runId, i18nT('工作流执行编号'));
      const controller = workflowRuns.get(runId);
      controller?.abort();
      workflowRuns.delete(runId);
      return { ok: true, runId, cancelled: Boolean(controller) };
    },
  );
}
