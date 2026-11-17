/**
 * 会议智能管理 · 企业微信「智能机器人」长连接（API 模式 → 长连接，凭据是 Bot ID + Secret）。
 *
 * 官方文档（developer.work.weixin.qq.com/document/path/101837 等）：
 *   - 连 wss://openws.work.weixin.qq.com，发 aibot_subscribe { bot_id, secret } 鉴权，之后每 30 秒 ping 一次；
 *   - 收：aibot_msg_callback（单聊 / 群里 @ 机器人的消息）、aibot_event_callback（进入会话等事件；
 *     disconnected_event = 同一个机器人在别处又连上了，这条连接会被断开）；
 *   - 发：aibot_send_msg { chatid, chat_type: 1 单聊 / 2 群聊, msgtype: markdown, markdown: { content } }，
 *     前提是这个会话里先有人给机器人发过消息；每个会话 30 条/分钟、1000 条/小时；
 *     回复用 aibot_respond_msg（headers.req_id 透传收到的那条）。
 *
 * 不需要公网地址、回调域名或企业可信 IP（出站长连接）。一个 Bot ID 同时只能有一条连接：
 * 应用的「消息平台」（gateway）也配了同一个机器人时会互相顶掉，所以会议通知建议单独建一个机器人。
 * 凭据只在主进程里用；socket 可注入（单测不连真企微）。
 */
import { randomBytes } from 'node:crypto';
import { t as i18nT } from '@totalclaw/i18n';

export const AIBOT_WS_URL = 'wss://openws.work.weixin.qq.com';
const HEARTBEAT_MS = 30_000;
const SEND_TIMEOUT_MS = 12_000;
const AUTH_TIMEOUT_MS = 15_000;
/** 每个会话每分钟最多 30 条（官方），留 2 条余量 */
const PER_CHAT_PER_MINUTE = 28;
/** markdown 内容上限 20480 字节 */
export const AIBOT_MARKDOWN_MAX_BYTES = 20_000;

export type AiBotState = 'off' | 'connecting' | 'online' | 'auth_failed' | 'kicked' | 'offline';

export interface AiBotInbound {
  kind: 'message' | 'event';
  chatType: 'single' | 'group';
  /** 群聊是群 chatid；单聊是对方的企微账号 */
  chatId: string;
  /** 发消息 / 触发事件的人（企微账号） */
  userId: string;
  /** 文字内容（@机器人 的部分已去掉）；非文字消息为空 */
  text: string;
  /** 收到这条的 req_id：回复时透传 */
  reqId: string;
  eventType?: string;
}

/** 最小 WebSocket 接口（ws 包的子集），便于单测替换 */
export interface WsLike {
  on(ev: 'open', cb: () => void): unknown;
  on(ev: 'message', cb: (data: unknown) => void): unknown;
  on(ev: 'close', cb: (code: number) => void): unknown;
  on(ev: 'error', cb: (e: Error) => void): unknown;
  send(data: string): void;
  close(): void;
  terminate?(): void;
  readyState: number;
}

export interface AiBotOptions {
  botId: string;
  secret: string;
  onInbound?: (m: AiBotInbound) => void;
  onState?: (s: AiBotState, error?: string) => void;
  createSocket?: (url: string) => WsLike;
  logger?: { info?: (msg: string, meta?: unknown) => void; warn?: (msg: string, meta?: unknown) => void };
  now?: () => number;
}

export interface AiBotSendResult { ok: boolean; error?: string; errcode?: number }

export function aibotErrorText(errcode: number, errmsg = ''): string {
  switch (errcode) {
    case 846609: return i18nT('机器人的连接已失效，正在重连，请稍后在推送失败记录里重发');
    case 45009:
    case 45033: return i18nT('发得太频繁：每个会话每分钟最多 30 条，请稍后在推送失败记录里重发');
    case -2: return i18nT('等企业微信回执超时，消息可能没发出去');
    default: return i18nT('企业微信返回错误 {p0}：{p1}', { p0: errcode, p1: errmsg || '-' });
  }
}

const utf8Bytes = (s: string): number => Buffer.byteLength(s, 'utf8');
function clip(s: string, max: number): string {
  if (utf8Bytes(s) <= max) return s;
  let out = '';
  for (const c of Array.from(s)) { if (utf8Bytes(out + c) + 3 > max) break; out += c; }
  return `${out}…`;
}

/** 消息里「@机器人」那段去掉，留下真正的文字 */
export function stripMention(text: string): string {
  return String(text ?? '').replace(/@\S+\s*/g, ' ').replace(/\s+/g, ' ').trim();
}

interface Pending { resolve: (r: AiBotSendResult) => void; timer: ReturnType<typeof setTimeout> }

export class WecomAiBot {
  private ws: WsLike | null = null;
  private stateValue: AiBotState = 'off';
  private errorValue = '';
  private stopped = true;
  private heartbeat: ReturnType<typeof setInterval> | null = null;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private authTimer: ReturnType<typeof setTimeout> | null = null;
  private attempts = 0;
  private authFailures = 0;
  private missedPong = 0;
  private readonly pending = new Map<string, Pending>();
  private readonly sentAt = new Map<string, number[]>();
  private readonly now: () => number;

  constructor(private readonly o: AiBotOptions) {
    this.now = o.now ?? (() => Date.now());
  }

  get state(): AiBotState { return this.stateValue; }
  get error(): string { return this.errorValue; }

  start(): void {
    if (!this.stopped) return;
    this.stopped = false;
    this.attempts = 0;
    this.authFailures = 0;
    this.connect();
  }

  stop(): void {
    this.stopped = true;
    this.clearTimers();
    this.failPending(i18nT('机器人连接已关闭'));
    const ws = this.ws;
    this.ws = null;
    try { ws?.close(); } catch { /* */ }
    this.setState('off');
  }

  private setState(s: AiBotState, error = ''): void {
    this.stateValue = s;
    this.errorValue = error;
    try { this.o.onState?.(s, error || undefined); } catch { /* 回调出错不影响连接 */ }
  }

  private clearTimers(): void {
    if (this.heartbeat) { clearInterval(this.heartbeat); this.heartbeat = null; }
    if (this.reconnectTimer) { clearTimeout(this.reconnectTimer); this.reconnectTimer = null; }
    if (this.authTimer) { clearTimeout(this.authTimer); this.authTimer = null; }
  }

  private failPending(error: string): void {
    for (const [id, p] of this.pending) { clearTimeout(p.timer); p.resolve({ ok: false, error }); this.pending.delete(id); }
  }

  private rid(prefix: string): string {
    return `${prefix}_${this.now()}_${randomBytes(4).toString('hex')}`;
  }

  private connect(): void {
    this.clearTimers();
    this.setState('connecting');
    let ws: WsLike;
    try {
      ws = this.o.createSocket ? this.o.createSocket(AIBOT_WS_URL) : defaultSocket(AIBOT_WS_URL);
    } catch (e) {
      this.scheduleReconnect(i18nT('连不上企业微信：{p0}', { p0: (e as Error)?.message || '-' }));
      return;
    }
    this.ws = ws;
    ws.on('open', () => {
      if (this.ws !== ws) return;
      this.rawSend({ cmd: 'aibot_subscribe', headers: { req_id: this.rid('aibot_subscribe') }, body: { bot_id: this.o.botId, secret: this.o.secret } });
      this.authTimer = setTimeout(() => { if (this.ws === ws && this.stateValue === 'connecting') this.dropAndRetry(i18nT('鉴权超时')); }, AUTH_TIMEOUT_MS);
    });
    ws.on('message', (data) => { if (this.ws === ws) this.handle(data); });
    ws.on('error', (e) => { this.o.logger?.warn?.('aibot socket error', { error: e?.message }); });
    ws.on('close', () => {
      if (this.ws !== ws) return;
      this.ws = null;
      this.failPending(i18nT('机器人连接断开了，消息可能没发出去'));
      if (this.stopped || this.stateValue === 'kicked' || this.stateValue === 'auth_failed') return;
      this.scheduleReconnect(i18nT('连接断开，正在重连'));
    });
  }

  private dropAndRetry(reason: string): void {
    const ws = this.ws;
    this.ws = null;
    try { ws?.terminate ? ws.terminate() : ws?.close(); } catch { /* */ }
    this.failPending(reason);
    this.scheduleReconnect(reason);
  }

  private scheduleReconnect(reason: string): void {
    if (this.stopped) return;
    this.clearTimers();
    this.setState('offline', reason);
    const delay = Math.min(30_000, 1000 * 2 ** Math.min(5, this.attempts++));
    this.reconnectTimer = setTimeout(() => this.connect(), delay);
  }

  private rawSend(frame: unknown): boolean {
    const ws = this.ws;
    if (!ws || ws.readyState !== 1) return false;
    try { ws.send(JSON.stringify(frame)); return true; } catch { return false; }
  }

  private handle(data: unknown): void {
    let f: any;
    try { f = JSON.parse(typeof data === 'string' ? data : Buffer.isBuffer(data) ? data.toString('utf8') : String(data)); } catch { return; }
    const reqId = String(f?.headers?.req_id || '');
    if (f.cmd === 'aibot_msg_callback' || f.cmd === 'aibot_event_callback') {
      const b = f.body || {};
      const eventType = f.cmd === 'aibot_event_callback' ? String(b.event?.eventtype || '') : undefined;
      if (eventType === 'disconnected_event') {
        // 同一个机器人在别处连上了：服务端会断开这条，重连也会被再顶掉，别抢
        this.clearTimers();
        this.failPending(i18nT('机器人在别处连上了'));
        const ws = this.ws;
        this.ws = null;
        try { ws?.close(); } catch { /* */ }
        this.setState('kicked', i18nT('这个机器人在别处也连上了（另一台电脑，或应用「消息平台」里配了同一个机器人）。同一个机器人只能有一条连接，会议通知请单独建一个机器人'));
        return;
      }
      const chatType: 'single' | 'group' = b.chattype === 'group' ? 'group' : 'single';
      const userId = String(b.from?.userid || '');
      const chatId = chatType === 'group' ? String(b.chatid || '') : userId;
      if (!chatId) return;
      const text = b.msgtype === 'text' ? stripMention(String(b.text?.content || '')) : '';
      try { this.o.onInbound?.({ kind: eventType === undefined ? 'message' : 'event', chatType, chatId, userId, text, reqId, ...(eventType ? { eventType } : {}) }); } catch (e) {
        this.o.logger?.warn?.('aibot inbound handler failed', { error: (e as Error)?.message });
      }
      return;
    }
    if (reqId.startsWith('aibot_subscribe')) {
      if (this.authTimer) { clearTimeout(this.authTimer); this.authTimer = null; }
      if (Number(f.errcode) !== 0) {
        this.authFailures += 1;
        const reason = i18nT('机器人鉴权失败：Bot ID 或 Secret 不对（{p0}）', { p0: f.errmsg || f.errcode });
        const ws = this.ws;
        this.ws = null;
        try { ws?.close(); } catch { /* */ }
        if (this.authFailures >= 3) { this.clearTimers(); this.setState('auth_failed', reason); return; }
        this.scheduleReconnect(reason);
        return;
      }
      this.attempts = 0;
      this.authFailures = 0;
      this.missedPong = 0;
      this.setState('online');
      this.heartbeat = setInterval(() => {
        if (this.missedPong >= 2) { this.dropAndRetry(i18nT('心跳没有回应，正在重连')); return; }
        this.missedPong += 1;
        this.rawSend({ cmd: 'ping', headers: { req_id: this.rid('ping') } });
      }, HEARTBEAT_MS);
      return;
    }
    if (reqId.startsWith('ping')) { this.missedPong = 0; return; }
    const p = this.pending.get(reqId);
    if (p) {
      clearTimeout(p.timer);
      this.pending.delete(reqId);
      const code = Number(f.errcode ?? 0);
      p.resolve(code === 0 ? { ok: true } : { ok: false, errcode: code, error: aibotErrorText(code, String(f.errmsg || '')) });
    }
  }

  /** 每个会话最近 60 秒的发送次数：满了就等（最多等一分钟） */
  private async slot(chatId: string): Promise<void> {
    for (let i = 0; i < 3; i++) {
      const t = this.now();
      const list = (this.sentAt.get(chatId) || []).filter((x) => t - x < 60_000);
      if (list.length < PER_CHAT_PER_MINUTE) { list.push(t); this.sentAt.set(chatId, list); return; }
      this.sentAt.set(chatId, list);
      await new Promise((r) => setTimeout(r, Math.max(200, 60_000 - (t - list[0]!) + 200)));
    }
  }

  private request(cmd: string, reqId: string, body: unknown): Promise<AiBotSendResult> {
    if (this.stateValue !== 'online') return Promise.resolve({ ok: false, error: this.offlineText() });
    return new Promise((resolve) => {
      const timer = setTimeout(() => { this.pending.delete(reqId); resolve({ ok: false, errcode: -2, error: aibotErrorText(-2) }); }, SEND_TIMEOUT_MS);
      this.pending.set(reqId, { resolve, timer });
      if (!this.rawSend({ cmd, headers: { req_id: reqId }, body })) {
        clearTimeout(timer);
        this.pending.delete(reqId);
        resolve({ ok: false, error: this.offlineText() });
      }
    });
  }

  private offlineText(): string {
    return this.stateValue === 'auth_failed' || this.stateValue === 'kicked'
      ? this.errorValue
      : i18nT('企微智能机器人没连上（{p0}），消息没发出去', { p0: this.errorValue || this.stateValue });
  }

  /** 主动推送：单聊 chatId = 对方企微账号；群聊 chatId = 群 chatid。前提是这个会话里先有人给机器人发过消息 */
  async send(chatId: string, chatType: 'single' | 'group', markdown: string): Promise<AiBotSendResult> {
    await this.slot(chatId);
    return this.request('aibot_send_msg', this.rid('aibot_send_msg'), {
      chatid: chatId, chat_type: chatType === 'group' ? 2 : 1, msgtype: 'markdown', markdown: { content: clip(markdown, AIBOT_MARKDOWN_MAX_BYTES) },
    });
  }

  /** 回复收到的那条消息（透传它的 req_id） */
  reply(reqId: string, markdown: string): Promise<AiBotSendResult> {
    return this.request('aibot_respond_msg', reqId, { msgtype: 'markdown', markdown: { content: clip(markdown, AIBOT_MARKDOWN_MAX_BYTES) } });
  }
}

function defaultSocket(url: string): WsLike {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const mod = require('ws') as { WebSocket?: unknown; default?: unknown };
  const Ctor = (mod.WebSocket || mod.default || mod) as new (u: string) => WsLike;
  return new Ctor(url);
}
