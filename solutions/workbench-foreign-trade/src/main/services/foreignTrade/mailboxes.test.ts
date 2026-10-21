/**
 * 多邮箱收件：用假的 IMAP 客户端跑真实的解析流程（mailparser 是真的）。
 * 钉住三件事：首次只按日期取、之后按 UID 增量取；收件箱 + 已发送都收；从不改邮件的已读状态。
 */
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { mkdtempSync, existsSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import type { FtMailbox } from '@totalclaw/ipc-contracts';

const calls: Array<{ op: string; arg?: unknown }> = [];
const folders: Record<string, { uidValidity: string; mails: Record<number, string> }> = {};

vi.mock('imapflow', () => ({
  ImapFlow: class {
    mailbox: any = null;
    async connect() { calls.push({ op: 'connect' }); }
    async logout() { calls.push({ op: 'logout' }); }
    async list() { return [{ path: 'INBOX', name: 'INBOX' }, { path: 'Sent Messages', name: 'Sent Messages', specialUse: '\\Sent' }]; }
    async getMailboxLock(path: string) {
      this.mailbox = { path, uidValidity: folders[path].uidValidity };
      return { release: () => {} };
    }
    async search(q: any) {
      calls.push({ op: 'search', arg: q });
      const uids = Object.keys(folders[this.mailbox.path].mails).map(Number);
      if (q.uid) { const from = Number(String(q.uid).split(':')[0]); return uids.filter((u) => u >= from); }
      return uids;
    }
    async fetchOne(uid: string) { return { source: Buffer.from(folders[this.mailbox.path].mails[Number(uid)]) }; }
    async status() { return { uidNext: 1 }; }
    async messageFlagsAdd() { calls.push({ op: 'flags' }); }
  },
}));

import { pollMailbox, messageKey } from './mailboxes';

function raw(opts: { from: string; to: string; subject: string; id: string; body: string; attach?: boolean; noreply?: boolean }): string {
  const lines = [
    `From: ${opts.from}`, `To: ${opts.to}`, `Subject: ${opts.subject}`, `Message-ID: <${opts.id}@test>`,
    'Date: Mon, 21 Sep 2026 08:00:00 +0000', 'MIME-Version: 1.0',
  ];
  if (opts.noreply) lines.push('Auto-Submitted: auto-generated');
  if (!opts.attach) return [...lines, 'Content-Type: text/plain; charset=utf-8', '', opts.body].join('\r\n');
  return [...lines,
    'Content-Type: multipart/mixed; boundary="b"', '', '--b', 'Content-Type: text/plain; charset=utf-8', '', opts.body,
    '--b', 'Content-Type: text/csv; name="list.csv"', 'Content-Disposition: attachment; filename="list.csv"', '', 'model,qty\nA1,100',
    '--b', 'Content-Type: application/x-msdownload; name="virus.exe"', 'Content-Disposition: attachment; filename="virus.exe"', '', 'MZ', '--b--'].join('\r\n');
}

const MB: FtMailbox = {
  id: 'mb1', label: 'Tom', address: 'tom@me.com', purposes: ['inquiry'], provider: 'custom', imapHost: 'imap.x', imapPort: 993,
  smtpHost: 'smtp.x', smtpPort: 465, enabled: true, autoReply: false, hasPassword: true, status: 'unknown', totalFetched: 0, createdAt: '',
};

beforeEach(() => {
  calls.length = 0;
  folders.INBOX = { uidValidity: '7', mails: {
    3: raw({ from: 'Buyer <buyer@acme.com>', to: 'tom@me.com', subject: 'RFQ LED', id: 'a', body: 'Need 1000 pcs', attach: true }),
    4: raw({ from: 'noreply@platform.com', to: 'tom@me.com', subject: 'Notice', id: 'n', body: 'hi', noreply: true }),
  } };
  folders['Sent Messages'] = { uidValidity: '9', mails: { 10: raw({ from: 'tom@me.com', to: 'buyer@acme.com', subject: 'Re: RFQ LED', id: 's', body: 'Thanks' }) } };
});

describe('pollMailbox', () => {
  it('首次：按日期取收件箱与已发送；附件只存白名单类型；自动化邮件打标；不改已读状态', async () => {
    const dir = mkdtempSync(join(tmpdir(), 'ft-att-'));
    const r = await pollMailbox(MB, 'pw', dir, Date.parse('2026-09-22T00:00:00Z'));
    expect(calls.filter((c) => c.op === 'search').every((c) => (c.arg as any).since instanceof Date)).toBe(true);
    expect(calls.some((c) => c.op === 'flags')).toBe(false);
    const byId = Object.fromEntries(r.mails.map((m) => [m.message.subject, m]));
    expect(byId['RFQ LED'].message.direction).toBe('in');
    expect(byId['RFQ LED'].message.from).toBe('buyer@acme.com');
    expect(byId['RFQ LED'].message.attachments.map((a) => a.name)).toEqual(['list.csv']);
    expect(existsSync(byId['RFQ LED'].message.attachments[0].path)).toBe(true);
    expect(readFileSync(byId['RFQ LED'].message.attachments[0].path, 'utf-8')).toContain('A1,100');
    expect(byId.Notice.automated).toBe(true);
    expect(byId['Re: RFQ LED'].message.direction).toBe('out');
    expect(byId['Re: RFQ LED'].automated).toBe(false);
    expect(r.cursors).toEqual({ INBOX: { uidValidity: '7', lastUid: 4 }, 'Sent Messages': { uidValidity: '9', lastUid: 10 } });
    // 本地 id 与发信时用的同一个算法：发出去的信再从「已发送」收回来不会重复
    expect(byId['Re: RFQ LED'].message.id).toBe(messageKey('mb1', '<s@test>', 'x'));
  });

  it('之后：按 UID 从游标往后取，已收过的不再取；UIDVALIDITY 变了按首次处理', async () => {
    folders.INBOX.mails[5] = raw({ from: 'buyer@acme.com', to: 'tom@me.com', subject: 'More', id: 'c', body: 'Also 200' });
    const r = await pollMailbox({ ...MB, sync: { INBOX: { uidValidity: '7', lastUid: 4 }, 'Sent Messages': { uidValidity: '9', lastUid: 10 } } }, 'pw', null);
    expect(r.mails.map((m) => m.message.subject)).toEqual(['More']);
    expect(calls.find((c) => c.op === 'search')!.arg).toEqual({ uid: '5:*' });
    const again = await pollMailbox({ ...MB, sync: { INBOX: { uidValidity: 'changed', lastUid: 4 } } }, 'pw', null, Date.parse('2026-09-22T00:00:00Z'));
    expect(again.mails.length).toBe(4);
  });
});
