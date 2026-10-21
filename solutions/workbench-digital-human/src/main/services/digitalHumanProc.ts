/**
 * 数字人（企业旗舰版）—— 离线合成 + 实时口播。
 *
 * ## app 侧真正要负责的那件事：保证会话被停掉
 *
 * 实时数字人**按并发路数 / 在线时长计费，云厂商不会自动停机**。
 * agent 侧已经有三层保护（idle 回收、超龄回收、配额闸门），但那三层都是
 * 「兜底」——真正知道「用户已经不看了」的只有 app：窗口关了、应用退出了。
 * 所以这个 proc 的核心不是转发 HTTP，而是：
 *
 * 1. 记住**经由本应用起的每一路会话**；
 * 2. 退出前 `stopAll()` 把它们逐个停掉（fire-and-forget 不行，要 await）；
 * 3. UI 上随时能看到「N 路在跑」和一键全停。
 *
 * 忘了停的代价不是报错，是账单 —— 这种错误没有任何反馈信号，只能靠机制防。
 *
 * ## 离线与实时是两条路，别混
 *
 * 离线 `synthesize`/`query`：提交文稿 → 轮询任务 → 拿 mp4。今天就能跑通。
 * 实时 `live/*`：会话常驻，喂 LLM 增量文本。计费贵一个量级。
 *
 * 轮询任务状态时**不能只认 `status === 'done'`** —— 上游踩过这个坑：
 * 阿里返回的是数字枚举（"3"=成功），不映射的话端侧会永远轮询，哪怕视频早就好了。
 * agent 侧已经做了映射，我们这层再兜一次：拿到 `video_url` 就算完成。
 */
import { EventEmitter } from 'events';
import { t as i18nT } from '@totalclaw/i18n';

export interface DigitalHumanClient {
  get: (p: string) => Promise<any>;
  post: (p: string, body: any) => Promise<any>;
}

export interface DigitalHumanDeps {
  /** qiye-api 没起来时返回 null */
  getClient: () => DigitalHumanClient | null;
  logger?: { info?: (m: string, c?: unknown) => void; warn?: (m: string, c?: unknown) => void };
}

/** 经本应用起的一路实时会话 */
export interface TrackedSession {
  sessionId: string;
  /** live = 走 live/* 编排；session = 逐句手推 */
  kind: 'live' | 'session';
  provider?: string;
  scene?: string;
  startedAt: number;
  render?: Record<string, unknown>;
  aiDisclosure?: Record<string, unknown>;
}

/** 任务完成判定：拿到 video_url 就是好了 —— 别只认 status 字符串 */
export function isTaskFinished(res: { status?: unknown; videoUrl?: unknown; video_url?: unknown }): boolean {
  const url = String((res as any)?.videoUrl ?? (res as any)?.video_url ?? '').trim();
  if (url) return true;
  const s = String(res?.status ?? '').toLowerCase();
  return s === 'done' || s === 'success' || s === 'succeeded' || s === '3';
}

/** 任务失败判定（失败也要停轮询，否则一直转到超时） */
export function isTaskFailed(res: { status?: unknown; error?: unknown }): boolean {
  const s = String(res?.status ?? '').toLowerCase();
  return s === 'failed' || s === 'error' || s === '4' || s === '5' || s === '6';
}

export class DigitalHumanProc extends EventEmitter {
  private sessions = new Map<string, TrackedSession>();
  private statusTimer: ReturnType<typeof setInterval> | null = null;

  constructor(private readonly deps: DigitalHumanDeps) {
    super();
  }

  private client(): DigitalHumanClient {
    const c = this.deps.getClient();
    if (!c) throw new Error(i18nT('数字人服务未就绪'));
    return c;
  }

  // ---- 配置 ----------------------------------------------------------------

  async getStatus(): Promise<any> {
    return this.client().get('/v1/digital_human/status');
  }

  async configure(body: Record<string, unknown>): Promise<any> {
    return this.client().post('/v1/digital_human/configure', body);
  }

  async getUsage(): Promise<any> {
    return this.client().get('/v1/digital_human/usage');
  }

  // ---- 离线合成 ------------------------------------------------------------

  async synthesize(body: Record<string, unknown>): Promise<any> {
    // 缺 provider SDK 的自愈由 QiyeApiClient 全局钩子统一处理（装进 plugins 目录后免重启重试）。
    return this.client().post('/v1/digital_human/synthesize', body);
  }

  async queryTask(taskId: string, provider?: string): Promise<any> {
    return this.client().post('/v1/digital_human/query', { taskId, ...(provider ? { provider } : {}) });
  }

  // ---- 实时会话 ------------------------------------------------------------

  /**
   * 起一路实时会话。**起成功就登记** —— 登记失败等于这一路脱管，
   * 退出时不会被停掉，钱一直烧。
   */
  async liveStart(body: Record<string, unknown>): Promise<any> {
    const res = await this.client().post('/v1/digital_human/live/start', body);
    const sessionId = String(res?.sessionId ?? res?.session_id ?? '').trim();
    if (sessionId) this.track(sessionId, 'live', res, body);
    return res;
  }

  async sessionStart(body: Record<string, unknown>): Promise<any> {
    const res = await this.client().post('/v1/digital_human/session/start', body);
    const sessionId = String(res?.sessionId ?? res?.session_id ?? '').trim();
    if (sessionId) this.track(sessionId, 'session', res, body);
    return res;
  }

  private track(sessionId: string, kind: 'live' | 'session', res: any, body: Record<string, unknown>): void {
    this.sessions.set(sessionId, {
      sessionId,
      kind,
      provider: String(res?.provider ?? body?.provider ?? '') || undefined,
      scene: String(res?.scene ?? body?.scene ?? '') || undefined,
      startedAt: Date.now(),
      render: res?.render,
      aiDisclosure: res?.aiDisclosureSpec ?? res?.ai_disclosure_spec,
    });
    this.emit('sessions', this.listTracked());
    this.startStatusPolling();
    this.deps.logger?.info?.(i18nT('[dh] 实时会话已起'), { sessionId, kind });
  }

  /** 喂 LLM 增量文本。`localQueueDepth` 持续增长 = 喂得比播得快。 */
  async liveEnqueue(sessionId: string, text: string, done?: boolean): Promise<any> {
    return this.client().post('/v1/digital_human/live/enqueue', { sessionId, text, done: !!done });
  }

  async liveInteraction(sessionId: string, text: string): Promise<any> {
    return this.client().post('/v1/digital_human/live/interaction', { sessionId, text });
  }

  /** 真人接管 —— 不只是功能，是平台准入材料（接管记录要能导出作证明）。 */
  async liveTakeover(sessionId: string, text: string): Promise<any> {
    const res = await this.client().post('/v1/digital_human/live/takeover', { sessionId, text });
    this.deps.logger?.info?.(i18nT('[dh] 真人接管'), { sessionId, chars: text.length });
    return res;
  }

  async livePause(sessionId: string, resume?: boolean): Promise<any> {
    // 暂停期间 agent 仍在续期 —— **暂停不等于省钱，计费还在走**
    return this.client().post('/v1/digital_human/live/pause', { sessionId, ...(resume ? { resume: true } : {}) });
  }

  async liveStatus(sessionId?: string): Promise<any> {
    const q = sessionId ? `?session_id=${encodeURIComponent(sessionId)}` : '';
    return this.client().get(`/v1/digital_human/live/status${q}`);
  }

  /**
   * 停一路。`emergency` 走四段式急停（直播出事故用）。
   * **本地登记先删** —— 上游报错也要删，否则一路停不掉的会话会永远挂在列表里，
   * 每次退出都重试一遍、每次都失败。
   */
  async stopSession(sessionId: string, emergency = false): Promise<any> {
    const tracked = this.sessions.get(sessionId);
    const path = tracked?.kind === 'session'
      ? '/v1/digital_human/session/stop'
      : '/v1/digital_human/live/stop';
    try {
      const body = tracked?.kind === 'session' ? { sessionId } : { sessionId, emergency };
      const res = await this.client().post(path, body);
      return res;
    } finally {
      this.sessions.delete(sessionId);
      this.emit('sessions', this.listTracked());
      if (!this.sessions.size) this.stopStatusPolling();
    }
  }

  async sessionSpeak(sessionId: string, text: string, stream?: Record<string, unknown>): Promise<any> {
    return this.client().post('/v1/digital_human/session/speak', {
      sessionId, text, ...(stream ? { stream } : {}),
    });
  }

  async sessionInterrupt(sessionId: string): Promise<any> {
    return this.client().post('/v1/digital_human/session/interrupt', { sessionId });
  }

  /** 上游的在跑会话（含不是本应用起的那些），用于对账 */
  async listRemote(): Promise<any> {
    return this.client().get('/v1/digital_human/session/list');
  }

  listTracked(): TrackedSession[] {
    return [...this.sessions.values()];
  }

  /**
   * 全停。**退出前必须 await 它** —— fire-and-forget 会在进程被杀掉时丢掉请求，
   * 而丢掉的那一路就是持续计费的那一路。
   */
  async stopAll(emergency = false): Promise<{ stopped: number; failed: number }> {
    const ids = [...this.sessions.keys()];
    let stopped = 0;
    let failed = 0;
    for (const id of ids) {
      try { await this.stopSession(id, emergency); stopped++; } catch { failed++; }
    }
    if (ids.length) this.deps.logger?.info?.(i18nT('[dh] 退出前收尾'), { stopped, failed });
    return { stopped, failed };
  }

  /** 有会话在跑才轮询状态；停光了就停表 —— 没会话时每 5s 打一次接口是白耗 */
  private startStatusPolling(): void {
    if (this.statusTimer) return;
    this.statusTimer = setInterval(() => void this.pollStatus(), 5000);
    this.statusTimer.unref?.();
  }

  private stopStatusPolling(): void {
    if (!this.statusTimer) return;
    clearInterval(this.statusTimer);
    this.statusTimer = null;
  }

  private async pollStatus(): Promise<void> {
    if (!this.sessions.size) { this.stopStatusPolling(); return; }
    try {
      const snap = await this.liveStatus();
      this.emit('status', snap);
    } catch (error) {
      this.deps.logger?.warn?.(i18nT('[dh] 状态轮询失败'), { detail: (error as Error)?.message });
    }
  }

  async shutdown(): Promise<void> {
    this.stopStatusPolling();
    await this.stopAll(false);
  }
}
