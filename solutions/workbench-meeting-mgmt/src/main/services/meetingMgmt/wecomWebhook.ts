/**
 * 会议智能管理 · 企业微信群机器人（群聊里的「消息推送」，旧版叫「群机器人」）。
 *
 * 没有企业微信自建应用（CorpID / Secret / 可信 IP 配不了）时的推送通道：把通知发进一个企微群，按人 @。
 *   - 只发 markdown（能 @人、能带链接）；同一批里同一事件同一对象的几条通知合成一条（例如「请 4 位发言人确认」）。
 *   - 每个机器人每分钟最多 20 条（官方限制）：本模块按机器人记最近 60 秒发了几条，满了就等。
 *   - 群里不能放个人专属链接（带令牌 = 谁点都能冒用身份），按钮用不带令牌的群链接 `<base>/g#/…`：
 *     手机上打开过自己专属链接的人能直接进，没打开过的页面会提示先打开一次。
 *   - @人：有手机号或可信的企微账号的人真 @（对方企微里有提醒）——这时发 text 消息，按 mentioned_mobile_list /
 *     mentioned_list @（只有 text 能按手机号 @，企微会把「@某人」接在消息末尾）；一个都 @ 不到时发 markdown，只写「@姓名」。
 *     企微账号可信 = 通讯录来自企微同步 / 导入的通讯录表格，或管理员手动填过；演示组织里的账号是编的，不能拿来 @。
 *
 * Webhook 地址里的 key 等于发消息的凭据：只存在本机（系统加密存储），不回显。
 */
import { t as i18nT } from '@totalclaw/i18n';

export const WEBHOOK_SEND_URL = 'https://qyapi.weixin.qq.com/cgi-bin/webhook/send';
const REQUEST_TIMEOUT_MS = 15_000;
/** markdown 内容上限 4096 字节、text 内容上限 2048 字节（UTF-8） */
export const WEBHOOK_MARKDOWN_MAX_BYTES = 4096;
export const WEBHOOK_TEXT_MAX_BYTES = 2048;
/** 每个机器人每分钟最多 20 条 */
export const WEBHOOK_PER_MINUTE = 20;

/**
 * 粘贴进来的地址 → 规范的发送地址；认不出返回 null。
 * 认：完整的 webhook 地址（可带别的参数），或只贴了 key。
 */
export function normalizeWebhookUrl(raw: string): string | null {
  const s = String(raw ?? '').trim();
  if (!s) return null;
  const keyRe = /^[A-Za-z0-9-]{16,64}$/;
  if (keyRe.test(s)) return `${WEBHOOK_SEND_URL}?key=${s}`;
  let u: URL;
  try { u = new URL(s); } catch { return null; }
  if (u.protocol !== 'https:' || u.hostname !== 'qyapi.weixin.qq.com' || !/^\/cgi-bin\/webhook\/send\/?$/.test(u.pathname)) return null;
  const key = u.searchParams.get('key') || '';
  return keyRe.test(key) ? `${WEBHOOK_SEND_URL}?key=${key}` : null;
}

/** 给管理员看的地址：只露 key 的前 4 位和后 4 位 */
export function maskWebhookUrl(url: string): string {
  const key = /[?&]key=([^&]+)/.exec(url)?.[1] || '';
  return key.length > 8 ? `…key=${key.slice(0, 4)}****${key.slice(-4)}` : '';
}

export function webhookErrorText(errcode: number, errmsg = ''): string {
  switch (errcode) {
    case 93000: return i18nT('群机器人地址无效：可能机器人已被移出群聊，或 key 已重置。请在群聊「消息推送」里重新复制地址');
    case 45009: return i18nT('群机器人发送太频繁：每个机器人每分钟最多 20 条，请稍后在推送失败记录里重发');
    case 93004: return i18nT('群机器人所在的群已解散或机器人被停用');
    case 93008: return i18nT('不在群里，不能发消息（机器人已被移出群聊）');
    case 40058: return i18nT('请求参数不合法：{p0}', { p0: errmsg || String(errcode) });
    case -1: return i18nT('企业微信系统繁忙，请稍后重试');
    default: return i18nT('企业微信返回错误 {p0}：{p1}', { p0: errcode, p1: errmsg || '-' });
  }
}

const utf8Bytes = (s: string): number => Buffer.byteLength(s, 'utf8');

/** 按 UTF-8 字节截断（不切断字符），超出时末尾加省略号 */
export function clipBytes(s: string, maxBytes: number): string {
  if (utf8Bytes(s) <= maxBytes) return s;
  const cps = Array.from(s);
  let out = '';
  for (const c of cps) {
    if (utf8Bytes(out + c) + 3 > maxBytes) break;
    out += c;
  }
  return `${out}…`;
}

/**
 * markdown 正文里会被当成格式的字符：标题 / 摘要来自会议内容，原样放进去会把格式打乱（或冒出一个 `<@某人>`）。
 * 企微的 markdown 不认反斜杠转义，换成全角的同形字符。
 */
const MD_LOOKALIKE: Record<string, string> = { '*': '＊', '`': '＇', '[': '［', ']': '］', '<': '＜', '>': '＞', '#': '＃' };
export function escapeMarkdown(s: string): string {
  return String(s ?? '').replace(/[*`[\]<>#]/g, (c) => MD_LOOKALIKE[c]!).replace(/\s*\r?\n+\s*/g, ' ').trim();
}

export interface GroupMessageInput {
  /** 事件名（「发言待确认」…） */
  label: string;
  title: string;
  summary?: string;
  /** 要 @ 的人：mobile 或 userId 有值就真 @（userId 必须是可信的企微账号），都没有只写姓名 */
  mentions: Array<{ name: string; userId?: string; mobile?: string }>;
  /** 群链接（不带令牌）；没有可用地址时为空，提示到电脑端处理 */
  url?: string;
  buttonText: string;
  /** 链接是公司内网地址：链接后面注明要连公司 Wi-Fi 才能打开 */
  lanOnly?: boolean;
}

/** 内网链接随消息一起发的提醒（群消息、企微卡片共用一句） */
export function lanLinkNote(): string {
  return i18nT('公司内网链接：手机连公司 Wi-Fi 才能打开，用 4G 打不开');
}

export type GroupMessage =
  | { msgtype: 'text'; content: string; userIds: string[]; mobiles: string[] }
  | { msgtype: 'markdown'; content: string };

/** 有人能真 @ → text（按手机号 / 账号 @，企微自动把「@某人」接在末尾）；一个都 @ 不到 → markdown */
export function buildGroupMessage(i: GroupMessageInput): GroupMessage {
  const real = i.mentions.filter((m) => m.mobile || m.userId);
  if (!real.length) return { msgtype: 'markdown', content: groupMessageMarkdown(i) };
  const plain = (s: string) => String(s ?? '').replace(/\s*\r?\n+\s*/g, ' ').trim();
  const rest = i.mentions.filter((m) => !m.mobile && !m.userId).map((m) => `@${plain(m.name)}`);
  const tail = [
    rest.length ? i18nT('请 {p0} 和下面被提醒的同事处理', { p0: rest.join(' ') }) : i18nT('请下面被提醒的同事处理'),
    i.url ? `${plain(i.buttonText)}：${i.url}` : i18nT('请在电脑端或手机页处理'),
    i.url && i.lanOnly ? `（${lanLinkNote()}）` : '',
  ].filter(Boolean).join('\n');
  const head = `【${plain(i.label)}】${plain(i.title)}`;
  const room = WEBHOOK_TEXT_MAX_BYTES - utf8Bytes(head) - utf8Bytes(tail) - 4;
  const summary = i.summary && room > 20 ? clipBytes(plain(i.summary), room) : '';
  return {
    msgtype: 'text',
    content: clipBytes([head, summary, tail].filter(Boolean).join('\n'), WEBHOOK_TEXT_MAX_BYTES),
    // 有手机号的按手机号 @（不怕账号填错），没有手机号才按账号
    mobiles: [...new Set(real.filter((m) => m.mobile).map((m) => m.mobile!))],
    userIds: [...new Set(real.filter((m) => !m.mobile && m.userId).map((m) => m.userId!))],
  };
}

/** 一条群消息的 markdown（≤ 4096 字节）；@ 只写姓名（markdown 不能按手机号 @） */
export function groupMessageMarkdown(i: GroupMessageInput): string {
  const who = i.mentions.map((m) => `@${escapeMarkdown(m.name)}`).join(' ');
  const head = `**【${escapeMarkdown(i.label)}】**${escapeMarkdown(i.title)}`;
  const tail = [
    who ? i18nT('请 {p0} 处理', { p0: who }) : '',
    i.url ? `[${escapeMarkdown(i.buttonText)}](${i.url})` : `<font color="comment">${i18nT('请在电脑端或手机页处理')}</font>`,
    i.url && i.lanOnly ? `<font color="comment">${lanLinkNote()}</font>` : '',
  ].filter(Boolean).join('\n');
  const room = WEBHOOK_MARKDOWN_MAX_BYTES - utf8Bytes(head) - utf8Bytes(tail) - 8;
  const summary = i.summary ? escapeMarkdown(i.summary) : '';
  const quote = summary && room > 20 ? `> ${clipBytes(summary, room)}` : '';
  // 引用块后面要空一行才结束，否则「请 … 处理」和按钮都会被算进引用里
  return clipBytes([head, quote ? `${quote}\n` : '', tail].filter(Boolean).join('\n'), WEBHOOK_MARKDOWN_MAX_BYTES);
}

/** 每个 key 最近 60 秒的发送时间（模块级：设置页测试、推送、重发共用一个额度） */
const sentAt = new Map<string, number[]>();

export function __resetWebhookRate(): void { sentAt.clear(); }

export interface WebhookSendResult { ok: boolean; error?: string; errcode?: number }

export class WecomWebhook {
  private readonly key: string;
  constructor(
    private readonly url: string,
    private readonly fetchImpl: typeof fetch = fetch,
    private readonly sleep: (ms: number) => Promise<void> = (ms) => new Promise((r) => setTimeout(r, ms)),
    private readonly now: () => number = () => Date.now(),
  ) {
    this.key = /[?&]key=([^&]+)/.exec(url)?.[1] || url;
  }

  /** 发之前占一个名额：最近 60 秒满 20 条就等到最早那条过期（最多等 60 秒） */
  private async takeSlot(): Promise<void> {
    for (let i = 0; i < 3; i++) {
      const t = this.now();
      const list = (sentAt.get(this.key) || []).filter((x) => t - x < 60_000);
      if (list.length < WEBHOOK_PER_MINUTE) { list.push(t); sentAt.set(this.key, list); return; }
      sentAt.set(this.key, list);
      await this.sleep(Math.max(200, 60_000 - (t - list[0]!) + 200));
    }
  }

  sendMarkdown(content: string): Promise<WebhookSendResult> {
    return this.post({ msgtype: 'markdown', markdown: { content: clipBytes(content, WEBHOOK_MARKDOWN_MAX_BYTES) } });
  }

  /** text 消息：按企微账号 / 手机号真 @ */
  sendText(content: string, mention: { userIds?: string[]; mobiles?: string[] } = {}): Promise<WebhookSendResult> {
    return this.post({
      msgtype: 'text',
      text: {
        content: clipBytes(content, WEBHOOK_TEXT_MAX_BYTES),
        ...(mention.userIds?.length ? { mentioned_list: mention.userIds } : {}),
        ...(mention.mobiles?.length ? { mentioned_mobile_list: mention.mobiles } : {}),
      },
    });
  }

  send(m: GroupMessage): Promise<WebhookSendResult> {
    return m.msgtype === 'text' ? this.sendText(m.content, { userIds: m.userIds, mobiles: m.mobiles }) : this.sendMarkdown(m.content);
  }

  private async post(body: unknown): Promise<WebhookSendResult> {
    await this.takeSlot();
    let res: Response;
    try {
      res = await this.fetchImpl(this.url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json; charset=utf-8' },
        body: JSON.stringify(body),
        signal: typeof AbortSignal !== 'undefined' && typeof AbortSignal.timeout === 'function' ? AbortSignal.timeout(REQUEST_TIMEOUT_MS) : undefined,
      });
    } catch (e) {
      const reason = (e as Error)?.name === 'TimeoutError' ? i18nT('请求超时') : String((e as Error)?.message || 'network');
      return { ok: false, error: i18nT('连不上企业微信（{p0}）：请检查本机网络，能否访问 qyapi.weixin.qq.com', { p0: reason }) };
    }
    if (!res.ok) return { ok: false, error: i18nT('企业微信接口返回 HTTP {p0}', { p0: res.status }) };
    let data: { errcode?: number; errmsg?: string };
    try { data = (await res.json()) as typeof data; } catch { return { ok: false, error: i18nT('企业微信返回的内容无法解析') }; }
    const code = Number(data?.errcode ?? 0);
    return code === 0 ? { ok: true } : { ok: false, errcode: code, error: webhookErrorText(code, String(data?.errmsg ?? '')) };
  }

  /** 设置页「测试发送」 */
  test(): Promise<WebhookSendResult> {
    return this.sendMarkdown(`**${i18nT('泰途会议智能管理')}**\n${i18nT('群机器人已连接：会议纪要确认、任务派发、进度提醒等通知会发到这个群里。')}`);
  }
}
