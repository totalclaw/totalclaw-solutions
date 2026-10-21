/**
 * B3 函证发送（人工确认节点之后才执行）：预览 → 一次性令牌 → 核销令牌 → 逐份交给邮件发送。
 *
 * 只发**已签核归档**的函证准备，附件取归档区里签核时的副本，且哈希必须与签核记录一致（发出去的就是签过的那份）；
 * 没邮箱 / 已发过 / 归档副本缺失或被改，一律拦下并写明原因。邮件发送函数由调用方注入（audit.actions 里接邮件通道），
 * 本文件不直接接触邮件通道。
 */
import { existsSync } from 'node:fs';
import { basename, join } from 'node:path';
import { i18nKey, tIn } from '@totalclaw/i18n';
import type { FauConfirmSendPreview, FauExtAuditResult, FauMsg, FauRun, FauSignoffRecord } from '@totalclaw/ipc-contracts';
import { activeRecords, sha256File } from '../../../signoff';
import { labeler } from '../../../outputs/common';
import { letterText } from './output';
import type { SentRecord } from './confirm';
import { SendGuard } from './sendGuard';

export interface SendItem { id: string; party: string; email: string; subject: string; body: string; attachment: string }

/** 可发的函证（只看归档副本 + 签核哈希），以及被拦下的原因 */
export function sendableItems(run: FauRun, records: FauSignoffRecord[], archiveDir: string, sent: SentRecord[], companyName: string, ids?: string[]): { items: SendItem[]; blocked: FauMsg[] } {
  const blocked: FauMsg[] = [];
  if (run.moduleId !== 'ext-audit' || run.modeId !== 'confirm_prepare') return { items: [], blocked: [{ key: i18nKey('只有「函证准备」的运行可以发送函证') }] };
  if (run.status !== 'archived') return { items: [], blocked: [{ key: i18nKey('函证须各级签核完成并归档后才能发送') }] };
  const res = run.result as FauExtAuditResult;
  const lastApproved = activeRecords(run.id, records).filter((r) => r.decision === 'approve').pop();
  const signed = new Map((lastApproved?.artifacts || []).map((a) => [basename(a.path), a.sha256]));
  const t = labeler(run.outputLocale);
  const items: SendItem[] = [];
  for (const c of (res.confirmations || []).filter((x) => !ids?.length || ids.includes(x.id))) {
    if (!c.email) { blocked.push({ key: i18nKey('{p0}：没有邮箱，请打印寄送'), params: { p0: c.id } }); continue; }
    if (sent.some((s) => s.id === c.id && s.ok)) { blocked.push({ key: i18nKey('{p0}：已经发送过'), params: { p0: c.id } }); continue; }
    const file = c.letterPath ? join(archiveDir, basename(c.letterPath)) : '';
    if (!file || !existsSync(file) || !signed.has(basename(file)) || sha256File(file) !== signed.get(basename(file))) {
      blocked.push({ key: i18nKey('{p0}：归档的询证函缺失或与签核时不一致，不能发送'), params: { p0: c.id } });
      continue;
    }
    const txt = letterText(t, c, companyName, res.asOf, run.outputLocale);
    items.push({ id: c.id, party: c.party, email: c.email, subject: txt.subject, body: [...txt.body, '', tIn(run.outputLocale, i18nKey('询证函见附件。'))].join('\n'), attachment: file });
  }
  return { items, blocked };
}

export function previewOf(guard: SendGuard, run: FauRun, items: SendItem[], blocked: FauMsg[], via: FauConfirmSendPreview['via']): FauConfirmSendPreview {
  const { token, expiresAt } = guard.issue(run.id, items.map((i) => i.id));
  return { token, expiresAt: new Date(expiresAt).toISOString(), via, blocked, items: items.map((i) => ({ id: i.id, party: i.party, email: i.email, subject: i.subject, attachment: basename(i.attachment) })) };
}

export type Sender = (item: SendItem) => Promise<{ ok: boolean; message?: string; via?: 'self' | 'official' }>;

/**
 * 发送：先核销令牌（人在确认框里点过确认才有），核销不过直接拒绝、sender 不会被调用；
 * 只发预览时确认过的那几份。
 */
export async function sendConfirmed(guard: SendGuard, token: unknown, run: FauRun, items: SendItem[], sender: Sender, now = Date.now()): Promise<SentRecord[]> {
  const ids = guard.consume(token, run.id, now);
  if (!ids) throw Object.assign(new Error('send-not-confirmed'), { code: 'not_confirmed' });
  const out: SentRecord[] = [];
  for (const it of items.filter((x) => ids.includes(x.id))) {
    const r = await sender(it).catch((e) => ({ ok: false, message: String((e as Error)?.message || e) }));
    out.push({ id: it.id, at: new Date(now).toISOString(), ok: !!r.ok, via: (r as { via?: 'self' | 'official' }).via, message: r.message });
  }
  return out;
}
