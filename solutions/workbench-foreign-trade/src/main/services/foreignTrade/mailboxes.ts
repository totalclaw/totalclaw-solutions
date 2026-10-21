/**
 * 多邮箱接管：每个邮箱独立的 IMAP 收件（收件箱 + 已发送）与 SMTP 发件。
 *
 * 接管不改变邮箱本身：按 UID 增量收取，不打「已读」标记，业务员照常用自己的邮件客户端。
 * 已发送文件夹也收进来，这样在邮件客户端里手工回过的信，跟进模块也知道已经回过。
 * 首次接入只取最近 3 天、最多 50 封，避免把整个历史邮箱灌进来。
 */
import { createHash } from 'node:crypto';
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { t as i18nT } from '@totalclaw/i18n';
import type { FtAttachment, FtMailbox, FtMailboxPreset, FtMailboxTestResult, FtMessage } from '@totalclaw/ipc-contracts';
import { isAutomatedSender } from '../mailIntakeProc';

export const FIRST_SYNC_DAYS = 3;
export const MAX_PER_FOLDER = 50;
const ATTACHMENT_EXT_ALLOW = new Set(['.pdf', '.docx', '.doc', '.xlsx', '.xls', '.csv', '.png', '.jpg', '.jpeg', '.webp', '.txt']);
const MAX_ATTACHMENT_BYTES = 25 * 1024 * 1024;

export function mailboxPresets(): FtMailboxPreset[] {
  return [
    { id: 'exmail', label: i18nT('腾讯企业邮'), imapHost: 'imap.exmail.qq.com', imapPort: 993, smtpHost: 'smtp.exmail.qq.com', smtpPort: 465, note: i18nT('企业邮 → 设置 → 客户端专用密码') },
    { id: 'aliyun', label: i18nT('阿里企业邮'), imapHost: 'imap.qiye.aliyun.com', imapPort: 993, smtpHost: 'smtp.qiye.aliyun.com', smtpPort: 465, note: i18nT('需在企业邮后台开启 IMAP/SMTP') },
    { id: 'netease-qiye', label: i18nT('网易企业邮'), imapHost: 'imaphz.qiye.163.com', imapPort: 993, smtpHost: 'smtphz.qiye.163.com', smtpPort: 465 },
    { id: '163', label: i18nT('163 邮箱'), imapHost: 'imap.163.com', imapPort: 993, smtpHost: 'smtp.163.com', smtpPort: 465, note: i18nT('设置 → POP3/SMTP/IMAP → 开启并生成授权码') },
    { id: 'qq', label: i18nT('QQ 邮箱'), imapHost: 'imap.qq.com', imapPort: 993, smtpHost: 'smtp.qq.com', smtpPort: 465, note: i18nT('设置 → 账户 → 开启 IMAP 服务并生成授权码') },
    { id: 'gmail', label: 'Gmail', imapHost: 'imap.gmail.com', imapPort: 993, smtpHost: 'smtp.gmail.com', smtpPort: 465, note: i18nT('需开启两步验证并创建应用专用密码') },
    { id: 'outlook', label: 'Outlook / Microsoft 365', imapHost: 'outlook.office365.com', imapPort: 993, smtpHost: 'smtp.office365.com', smtpPort: 587 },
    { id: 'custom', label: i18nT('其他（手动填写）'), imapHost: '', imapPort: 993, smtpHost: '', smtpPort: 465 },
  ];
}

export interface FetchedMail {
  message: FtMessage;
  automated: boolean;
}

export interface FolderCursor { uidValidity: string; lastUid: number }

export interface PollOutcome {
  mails: FetchedMail[];
  cursors: Record<string, FolderCursor>;
}

/**
 * 邮件在本地的 id：同一邮箱 + Message-ID 固定。
 * 从工作台发出去的信（SMTP 回执里的 Message-ID）和之后从「已发送」收回来的是同一个 id，不会重复。
 */
export function messageKey(mailboxId: string, messageId: string | undefined, fallback: string): string {
  return createHash('sha1').update(`${mailboxId}|${messageId || fallback}`).digest('hex').slice(0, 20);
}

function msgId(mailboxId: string, folder: string, messageId: string | undefined, uid: number): string {
  return messageKey(mailboxId, messageId, `${folder}:${uid}`);
}

function addressesOf(field: any): string[] {
  const list = Array.isArray(field) ? field : field ? [field] : [];
  const out: string[] = [];
  for (const f of list) for (const v of f?.value || []) if (v?.address) out.push(String(v.address).toLowerCase());
  return out;
}

function safeName(raw: string): string {
  return String(raw || 'attachment').replace(/[\\/:*?"<>|]+/g, '_').slice(0, 120);
}

/** IMAP 连接参数；993 走 TLS，其余按 STARTTLS */
function imapOptions(mb: FtMailbox, password: string) {
  return {
    host: mb.imapHost,
    port: mb.imapPort,
    secure: mb.imapPort === 993,
    auth: { user: mb.address, pass: password },
    logger: false as const,
    tls: { rejectUnauthorized: false },
    socketTimeout: 60_000,
  };
}

/**
 * 收一个邮箱：收件箱 + 已发送。返回新邮件与新的游标，调用方负责落盘。
 * attachmentsDir 为空时不存附件（测连接用）。
 */
export async function pollMailbox(
  mb: FtMailbox, password: string, attachmentsDir: string | null, now = Date.now(),
): Promise<PollOutcome> {
  const { ImapFlow } = await import('imapflow');
  const { simpleParser } = await import('mailparser');
  const client: any = new ImapFlow(imapOptions(mb, password) as any);
  const mails: FetchedMail[] = [];
  const cursors: Record<string, FolderCursor> = { ...(mb.sync || {}) };
  await client.connect();
  try {
    const folders: Array<{ path: string; direction: 'in' | 'out' }> = [{ path: 'INBOX', direction: 'in' }];
    try {
      const list: any[] = await client.list();
      const sent = list.find((f) => f.specialUse === '\\Sent')
        || list.find((f) => /^(sent|sent items|sent messages|已发送|已发送邮件)$/i.test(String(f.name || '')));
      if (sent?.path) folders.push({ path: sent.path, direction: 'out' });
    } catch { /* 列文件夹失败：只收收件箱 */ }

    for (const folder of folders) {
      const lock = await client.getMailboxLock(folder.path);
      try {
        const uidValidity = String(client.mailbox?.uidValidity ?? '');
        const prev = cursors[folder.path];
        let uids: number[];
        if (prev && prev.uidValidity === uidValidity) {
          uids = (await client.search({ uid: `${prev.lastUid + 1}:*` }, { uid: true })) || [];
          uids = uids.filter((u) => u > prev.lastUid);
        } else {
          const since = new Date(now - FIRST_SYNC_DAYS * 86_400_000);
          uids = (await client.search({ since }, { uid: true })) || [];
        }
        uids.sort((a, b) => a - b);
        const batch = uids.slice(-MAX_PER_FOLDER);
        let lastUid = prev && prev.uidValidity === uidValidity ? prev.lastUid : 0;
        for (const uid of batch) {
          lastUid = Math.max(lastUid, uid);
          // source 走 BODY.PEEK：不会把邮件标成已读
          const fetched = await client.fetchOne(String(uid), { source: true }, { uid: true });
          if (!fetched?.source) continue;
          const parsed: any = await simpleParser(fetched.source);
          const from = addressesOf(parsed.from)[0] || '';
          const id = msgId(mb.id, folder.path, parsed.messageId, uid);
          const attachments: FtAttachment[] = [];
          if (attachmentsDir) {
            for (const a of (parsed.attachments || []).slice(0, 20)) {
              const name = safeName(a.filename || '');
              const dot = name.lastIndexOf('.');
              const ext = dot >= 0 ? name.slice(dot).toLowerCase() : '';
              const size = a.size ?? a.content?.length ?? 0;
              if (!ATTACHMENT_EXT_ALLOW.has(ext) || size > MAX_ATTACHMENT_BYTES) continue;
              const path = join(attachmentsDir, `${id}_${name}`);
              try { writeFileSync(path, a.content); attachments.push({ name, path, size }); } catch { /* 写盘失败跳过这个附件 */ }
            }
          }
          const html = typeof parsed.html === 'string' ? parsed.html : '';
          const body = String(parsed.text || html.replace(/<style[\s\S]*?<\/style>/gi, ' ').replace(/<[^>]+>/g, ' ') || '')
            .replace(/\n{3,}/g, '\n\n').trim();
          mails.push({
            automated: folder.direction === 'in' && isAutomatedSender(from, parsed.headers),
            message: {
              id,
              mailboxId: mb.id,
              direction: folder.direction,
              messageId: parsed.messageId || undefined,
              inReplyTo: parsed.inReplyTo || undefined,
              from,
              fromName: parsed.from?.value?.[0]?.name || undefined,
              to: [...addressesOf(parsed.to), ...addressesOf(parsed.cc)],
              subject: String(parsed.subject || ''),
              body,
              at: (parsed.date instanceof Date ? parsed.date : new Date()).toISOString(),
              attachments,
            },
          });
        }
        cursors[folder.path] = { uidValidity, lastUid: batch.length ? lastUid : (prev?.uidValidity === uidValidity ? prev.lastUid : lastUid) };
        // 首次同步一封都没有：记下当前最大 UID，下次从这之后收
        if (!batch.length && !(prev && prev.uidValidity === uidValidity)) {
          const status: any = await client.status(folder.path, { uidNext: true }).catch(() => null);
          if (status?.uidNext) cursors[folder.path] = { uidValidity, lastUid: Number(status.uidNext) - 1 };
        }
      } finally {
        lock.release();
      }
    }
  } finally {
    try { await client.logout(); } catch { /* 忽略 */ }
  }
  return { mails, cursors };
}

export interface SendInput {
  to: string[];
  cc?: string[];
  subject: string;
  body: string;
  attachments?: { filename: string; path: string }[];
  inReplyTo?: string;
  references?: string;
}

export async function sendFromMailbox(mb: FtMailbox, password: string, input: SendInput): Promise<{ messageId: string; accepted: string[]; rejected: string[] }> {
  if (!mb.smtpHost) throw new Error(i18nT('邮箱「{p0}」没有填发信服务器（SMTP）', { p0: mb.label || mb.address }));
  if (!password) throw new Error(i18nT('邮箱「{p0}」没有保存授权码，请重新填写', { p0: mb.label || mb.address }));
  const nodemailer = await import('nodemailer');
  const transport = nodemailer.createTransport({
    host: mb.smtpHost,
    port: mb.smtpPort,
    secure: mb.smtpPort === 465,
    auth: { user: mb.address, pass: password },
    tls: { rejectUnauthorized: false },
  });
  const from = mb.senderName ? `"${mb.senderName.replace(/"/g, '')}" <${mb.address}>` : mb.address;
  const info: any = await transport.sendMail({
    from,
    to: input.to.join(', '),
    cc: input.cc?.length ? input.cc.join(', ') : undefined,
    subject: input.subject,
    text: input.body,
    attachments: input.attachments,
    inReplyTo: input.inReplyTo,
    references: input.references || input.inReplyTo,
  });
  return {
    messageId: String(info?.messageId || ''),
    accepted: (info?.accepted || []).map(String),
    rejected: (info?.rejected || []).map(String),
  };
}

/** 分别测收信与发信，给出人话结论 */
export async function testMailbox(mb: FtMailbox, password: string): Promise<FtMailboxTestResult> {
  const result: FtMailboxTestResult = {
    imap: { ok: false, message: '' },
    smtp: { ok: false, message: '' },
  };
  if (!password) {
    const msg = i18nT('没有填授权码');
    return { imap: { ok: false, message: msg }, smtp: { ok: false, message: msg } };
  }
  if (!mb.imapHost) {
    result.imap = { ok: false, message: i18nT('没有填收信服务器（IMAP）') };
  } else {
    try {
      const { ImapFlow } = await import('imapflow');
      const client: any = new ImapFlow(imapOptions(mb, password) as any);
      await client.connect();
      const status: any = await client.status('INBOX', { messages: true }).catch(() => null);
      await client.logout().catch(() => undefined);
      result.imap = { ok: true, message: status?.messages != null ? i18nT('收件箱共 {p0} 封', { p0: status.messages }) : i18nT('连接成功') };
    } catch (error) {
      result.imap = { ok: false, message: humanizeMailError(error) };
    }
  }
  if (!mb.smtpHost) {
    result.smtp = { ok: false, message: i18nT('没有填发信服务器（SMTP）') };
  } else {
    try {
      const nodemailer = await import('nodemailer');
      const transport = nodemailer.createTransport({
        host: mb.smtpHost, port: mb.smtpPort, secure: mb.smtpPort === 465,
        auth: { user: mb.address, pass: password }, tls: { rejectUnauthorized: false },
      });
      await transport.verify();
      result.smtp = { ok: true, message: i18nT('连接成功') };
    } catch (error) {
      result.smtp = { ok: false, message: humanizeMailError(error) };
    }
  }
  return result;
}

export function humanizeMailError(error: unknown): string {
  const raw = (error as Error)?.message || String(error);
  if (/auth|login|credential|invalid|535|534/i.test(raw)) return i18nT('认证失败：多数邮箱要用「授权码 / 应用专用密码」，不是登录密码（{p0}）', { p0: raw.slice(0, 120) });
  if (/ENOTFOUND|EAI_AGAIN|getaddrinfo/i.test(raw)) return i18nT('找不到服务器地址，请检查服务器填写（{p0}）', { p0: raw.slice(0, 120) });
  if (/ETIMEDOUT|timeout|ECONNREFUSED|ECONNRESET/i.test(raw)) return i18nT('连不上服务器，请检查端口或本机网络（{p0}）', { p0: raw.slice(0, 120) });
  return raw.slice(0, 200);
}
