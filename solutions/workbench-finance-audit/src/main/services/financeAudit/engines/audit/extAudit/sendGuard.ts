/**
 * B3 函证发送的人工确认节点（受保护的例外，第 9.1 节）：
 *   本工作台默认不对外发送任何东西；函证只有在「最后一级签核归档 → 人点『发送』看到预览 → 在确认框里再点确认」
 *   之后才交给邮件发送。主进程在预览时签发一次性令牌（绑定运行与函证编号、5 分钟有效、只能用一次），
 *   发送时先核销令牌再发——没有令牌、过期、重复使用、换了运行，一律拒绝，邮件发送函数不会被调用。
 */
import { randomBytes } from 'node:crypto';

export const SEND_TOKEN_TTL_MS = 5 * 60_000;

interface Ticket { runId: string; ids: string[]; expiresAt: number }

export class SendGuard {
  private tickets = new Map<string, Ticket>();

  issue(runId: string, ids: string[], now = Date.now()): { token: string; expiresAt: number } {
    for (const [k, v] of this.tickets) if (v.expiresAt <= now) this.tickets.delete(k);
    const token = randomBytes(24).toString('hex');
    const expiresAt = now + SEND_TOKEN_TTL_MS;
    this.tickets.set(token, { runId, ids: [...ids], expiresAt });
    return { token, expiresAt };
  }

  /** 核销：成功返回预览时确认过的函证编号；任何不对都返回 null（调用方据此拒绝发送） */
  consume(token: unknown, runId: string, now = Date.now()): string[] | null {
    if (typeof token !== 'string' || !token) return null;
    const t = this.tickets.get(token);
    if (!t) return null;
    this.tickets.delete(token);
    if (t.expiresAt <= now || t.runId !== runId) return null;
    return t.ids;
  }
}
