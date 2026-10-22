/**
 * 数字人 IPC（企业旗舰版）—— 离线合成 + 实时口播。
 *
 * 全部 handler 统一返回 `{ ok, ... }` 结构化结果，不把裸异常抛给渲染层
 * （渲染层拿到 `Error invoking remote method` 这种字符串是没法处理的）。
 *
 * **`DIGITAL_HUMAN_STOP_ALL` 不做门禁** —— 停会话是止损动作，见 ipc-map 里的说明。
 */
import { ipcMain } from 'electron';
import { IPC_CHANNELS } from '@totalclaw/ipc-contracts';
import { t as i18nT } from '@totalclaw/i18n';
import type { IpcDeps } from './shared';
import { validatePayload } from './shared';

type Result = { ok: boolean; message?: string; [k: string]: unknown };

export function registerDigitalHumanHandlers(deps: IpcDeps): () => void {
  const { logger } = deps;

  const proc = () => deps.digitalHumanProc ?? null;

  /** 统一包一层：服务没起来 / 上游报错都变成 { ok:false, message } */
  async function run(label: string, fn: (p: NonNullable<typeof deps.digitalHumanProc>) => Promise<any>): Promise<Result> {
    const p = proc();
    if (!p) return { ok: false, message: i18nT('数字人服务未就绪') };
    try {
      const res = await fn(p);
      // 上游自己回了 ok 字段就尊重它（合成失败时 ok=false 但有 error 文案）
      return typeof res?.ok === 'boolean' ? res : { ok: true, ...(res ?? {}) };
    } catch (error) {
      const message = (error as Error)?.message || String(error);
      logger.warn?.('digital-human', `${label} 失败`, { detail: message });
      return { ok: false, message };
    }
  }

  // ── 配置 ────────────────────────────────────────────────────────────────

  ipcMain.handle(IPC_CHANNELS.DIGITAL_HUMAN_STATUS, async () => run('status', (p) => p.getStatus()));

  ipcMain.handle(IPC_CHANNELS.DIGITAL_HUMAN_CONFIGURE, async (_e, payload: Record<string, unknown>) => {
    const res = await run('configure', (p) => p.configure(payload || {}));
    if (res.ok) {
      // 凭据本身不落日志：access_key_secret 一旦进日志就等于泄露
      logger.info?.('digital-human', '数字人配置已更新', {
        enabled: (payload as any)?.enabled,
        provider: (payload as any)?.provider,
        providers: Object.keys(((payload as any)?.providers as object) || {}),
      });
    }
    return res;
  });

  ipcMain.handle(IPC_CHANNELS.DIGITAL_HUMAN_USAGE, async () => run('usage', (p) => p.getUsage()));

  // ── 离线合成 ────────────────────────────────────────────────────────────

  ipcMain.handle(IPC_CHANNELS.DIGITAL_HUMAN_SYNTHESIZE, async (_e, payload: Record<string, unknown>) => {
    validatePayload(payload, 'DIGITAL_HUMAN_SYNTHESIZE', { script: 'string' });
    return run('synthesize', (p) => p.synthesize(payload));
  });

  ipcMain.handle(IPC_CHANNELS.DIGITAL_HUMAN_QUERY, async (_e, payload: { taskId?: string; provider?: string }) => {
    validatePayload(payload, 'DIGITAL_HUMAN_QUERY', { taskId: 'string' });
    return run('query', (p) => p.queryTask(payload.taskId!, payload.provider));
  });

  // ── 实时口播 ────────────────────────────────────────────────────────────

  ipcMain.handle(IPC_CHANNELS.DIGITAL_HUMAN_LIVE_START, async (_e, payload: Record<string, unknown>) => {
    const res = await run('live/start', (p) => p.liveStart(payload || {}));
    if (res.ok) logger.info?.('digital-human', '实时会话已起', { sessionId: res.sessionId, scene: (payload as any)?.scene });
    return res;
  });

  ipcMain.handle(IPC_CHANNELS.DIGITAL_HUMAN_LIVE_ENQUEUE, async (_e, payload: { sessionId?: string; text?: string; done?: boolean }) => {
    validatePayload(payload, 'DIGITAL_HUMAN_LIVE_ENQUEUE', { sessionId: 'string' });
    return run('live/enqueue', (p) => p.liveEnqueue(payload.sessionId!, String(payload.text ?? ''), payload.done));
  });

  ipcMain.handle(IPC_CHANNELS.DIGITAL_HUMAN_LIVE_INTERACTION, async (_e, payload: { sessionId?: string; text?: string }) => {
    validatePayload(payload, 'DIGITAL_HUMAN_LIVE_INTERACTION', { sessionId: 'string', text: 'string' });
    return run('live/interaction', (p) => p.liveInteraction(payload.sessionId!, payload.text!));
  });

  ipcMain.handle(IPC_CHANNELS.DIGITAL_HUMAN_LIVE_TAKEOVER, async (_e, payload: { sessionId?: string; text?: string }) => {
    validatePayload(payload, 'DIGITAL_HUMAN_LIVE_TAKEOVER', { sessionId: 'string', text: 'string' });
    // 接管记录是平台准入的证明材料，必须留痕
    const res = await run('live/takeover', (p) => p.liveTakeover(payload.sessionId!, payload.text!));
    if (res.ok) logger.info?.('digital-human', '真人接管', { sessionId: payload.sessionId });
    return res;
  });

  ipcMain.handle(IPC_CHANNELS.DIGITAL_HUMAN_LIVE_PAUSE, async (_e, payload: { sessionId?: string; resume?: boolean }) => {
    validatePayload(payload, 'DIGITAL_HUMAN_LIVE_PAUSE', { sessionId: 'string' });
    return run('live/pause', (p) => p.livePause(payload.sessionId!, payload.resume));
  });

  ipcMain.handle(IPC_CHANNELS.DIGITAL_HUMAN_LIVE_STATUS, async (_e, payload?: { sessionId?: string }) => {
    return run('live/status', (p) => p.liveStatus(payload?.sessionId));
  });

  ipcMain.handle(IPC_CHANNELS.DIGITAL_HUMAN_LIVE_STOP, async (_e, payload: { sessionId?: string; emergency?: boolean }) => {
    validatePayload(payload, 'DIGITAL_HUMAN_LIVE_STOP', { sessionId: 'string' });
    const res = await run('live/stop', (p) => p.stopSession(payload.sessionId!, !!payload.emergency));
    logger.info?.('digital-human', '实时会话已停', { sessionId: payload.sessionId, emergency: !!payload.emergency, ok: res.ok });
    return res;
  });

  // ── 逐句手推（简单话术场景）────────────────────────────────────────────

  ipcMain.handle(IPC_CHANNELS.DIGITAL_HUMAN_SESSION_START, async (_e, payload: Record<string, unknown>) =>
    run('session/start', (p) => p.sessionStart(payload || {})));

  ipcMain.handle(IPC_CHANNELS.DIGITAL_HUMAN_SESSION_SPEAK, async (_e, payload: { sessionId?: string; text?: string; stream?: Record<string, unknown> }) => {
    validatePayload(payload, 'DIGITAL_HUMAN_SESSION_SPEAK', { sessionId: 'string', text: 'string' });
    return run('session/speak', (p) => p.sessionSpeak(payload.sessionId!, payload.text!, payload.stream));
  });

  ipcMain.handle(IPC_CHANNELS.DIGITAL_HUMAN_SESSION_INTERRUPT, async (_e, payload: { sessionId?: string }) => {
    validatePayload(payload, 'DIGITAL_HUMAN_SESSION_INTERRUPT', { sessionId: 'string' });
    return run('session/interrupt', (p) => p.sessionInterrupt(payload.sessionId!));
  });

  ipcMain.handle(IPC_CHANNELS.DIGITAL_HUMAN_SESSION_STOP, async (_e, payload: { sessionId?: string }) => {
    validatePayload(payload, 'DIGITAL_HUMAN_SESSION_STOP', { sessionId: 'string' });
    return run('session/stop', (p) => p.stopSession(payload.sessionId!, false));
  });

  ipcMain.handle(IPC_CHANNELS.DIGITAL_HUMAN_SESSION_LIST, async () => run('session/list', (p) => p.listRemote()));

  // ── 会话对账与全停 ──────────────────────────────────────────────────────

  ipcMain.handle(IPC_CHANNELS.DIGITAL_HUMAN_TRACKED, async () => {
    const p = proc();
    return { ok: true, sessions: p?.listTracked() ?? [] };
  });

  ipcMain.handle(IPC_CHANNELS.DIGITAL_HUMAN_STOP_ALL, async (_e, payload?: { emergency?: boolean }) => {
    const p = proc();
    if (!p) return { ok: true, stopped: 0, failed: 0 };   // 没起来就没有会话要停
    const r = await p.stopAll(!!payload?.emergency);
    logger.info?.('digital-human', '一键全停', r);
    return { ok: true, ...r };
  });

  // 会话数 / 状态变化推给渲染层：「N 路会话进行中」必须一直看得见（计费提醒）
  const onSessions = (sessions: unknown) => {
    try { deps.getMainWindow()?.webContents.send(IPC_CHANNELS.DIGITAL_HUMAN_EVENT, { type: 'sessions', sessions }); } catch { /* */ }
  };
  const onStatus = (snapshot: unknown) => {
    try { deps.getMainWindow()?.webContents.send(IPC_CHANNELS.DIGITAL_HUMAN_EVENT, { type: 'status', snapshot }); } catch { /* */ }
  };
  const p = proc();
  p?.on('sessions', onSessions);
  p?.on('status', onStatus);
  // 卸载 / 停用：摘掉监听（服务进程归宿主管，不停它），否则重装后每个事件推两遍
  return () => {
    p?.off?.('sessions', onSessions);
    p?.off?.('status', onStatus);
  };
}
