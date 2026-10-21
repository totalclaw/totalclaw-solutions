import { describe, expect, it } from 'vitest';
import { mailReceiptEvidence } from './mailReceiptEvidence';
const id = '<settlement-123@example.com>';
const recipient = 'supplier@example.com';
const check = (raw: string) => mailReceiptEvidence(Buffer.from(raw.replace(/\n/g, '\r\n')), [id], [recipient]);
function report(type = 'message/disposition-notification', disposition = 'displayed', original = id, to = recipient) {
  return `From: ${recipient}\nMIME-Version: 1.0\nContent-Type: multipart/report; report-type=disposition-notification; boundary="boundary"\nSubject: receipt\n\n--boundary\nContent-Type: text/plain\n\nReport\n--boundary\nContent-Type: ${type}\n\nFinal-Recipient: rfc822; ${to}\nOriginal-Message-ID: ${original}\nDisposition: manual-action/MDN-sent-manually; ${disposition}\n\n--boundary--\n`;
}
function reply(headers = '', from = recipient, ref = id, subject = 'Re: settlement') {
  return `From: ${from}\nIn-Reply-To: ${ref}\nSubject: ${subject}\n${headers}\n\nThank you`;
}
describe('mail receipt evidence', () => {
  it('recognizes an MDN with Original-Message-ID only in its MIME body', async () => {
    expect(await check(report())).toBe('read');
  });
  it.each(['deleted', 'denied', 'processed', 'displayed/error'])('does not infer read from %s', async disposition => {
    expect(await check(report(undefined, disposition))).toBeNull();
  });
  it('does not treat delivery reports as read', async () => {
    expect(await check(report('message/delivery-status'))).toBeNull();
  });
  it('requires the exact original ID and intended recipient', async () => {
    expect(await check(report(undefined, undefined, '<other@example.com>'))).toBeNull();
    expect(await check(report(undefined, undefined, undefined, 'other@example.com'))).toBeNull();
    expect(await check(reply('', recipient, '<prefix-settlement-123@example.com>'))).toBeNull();
  });
  it('accepts a correlated recipient reply, including References', async () => {
    expect(await check(reply())).toBe('replied');
    expect(await check(reply().replace('In-Reply-To:', 'References:'))).toBe('replied');
  });
  it('rejects another sender, automatic replies and subject-only read claims', async () => {
    expect(await check(reply('', 'stranger@example.com'))).toBeNull();
    expect(await check(reply('Auto-Submitted: auto-replied'))).toBeNull();
    expect(await check(reply('', recipient, id, 'Read: settlement'))).toBeNull();
  });
});

import { ownMailboxRead, receiptMessageIds } from './mailReceiptEvidence';
describe('owned recipient mailbox flags', () => {
  const original = '<9f8707a9-8e35-4737-ef07-4296ddff1b73@totalclaw.cn>';
  const delivered = '<0279E8D8A53A2C21+9f8707a9-8e35-4737-ef07-4296ddff1b73@totalclaw.cn>';
  const envelope = { messageId: delivered, to: [{ address: recipient }] };
  it('recognizes the exact UUID and domain after the observed Exmail queue prefix', () => {
    expect(receiptMessageIds(delivered)).toEqual([original]);
    expect(ownMailboxRead(envelope, new Set(['\\Seen']), [original], [recipient], recipient)).toBe(true);
  });
  it('does not infer another recipient reading from the sender mailbox or an unseen copy', () => {
    expect(ownMailboxRead(envelope, new Set(['\\Seen']), [original], [recipient], 'sender@example.com')).toBe(false);
    expect(ownMailboxRead(envelope, new Set(), [original], [recipient], recipient)).toBe(false);
    expect(ownMailboxRead(envelope, new Set(['\\Seen']), [original.replace('totalclaw.cn', 'other.cn')], [recipient], recipient)).toBe(false);
    expect(ownMailboxRead({ ...envelope, to: [{ address: 'other@example.com' }] }, new Set(['\\Seen']), [original], [recipient], recipient)).toBe(false);
  });
});
