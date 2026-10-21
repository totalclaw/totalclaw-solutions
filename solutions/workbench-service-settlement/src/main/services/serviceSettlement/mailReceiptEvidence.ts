import { simpleParser, type MailParserOptions } from 'mailparser';

/** IMAP SEARCH is a substring search; only exact parsed Message-IDs are evidence. */
export function receiptMessageIds(value: string | string[] | undefined): string[] {
  const raw = Array.isArray(value) ? value.join(' ') : value || '';
  // Tencent Exmail was observed prepending a 16-hex queue ID to our UUID Message-ID.
  // Preserve the complete UUID and domain: do not use substring/subject matching as evidence.
  return (raw.match(/<[^<>\s]+>/g) || []).map(id => id.replace(
    /^<[0-9a-f]{16}\+([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}@[^<>\s]+)>$/i, '<$1>',
  ));
}

/** A report is evidence only for its original message and its intended recipient. */
export async function mailReceiptEvidence(source: Buffer, sentIds: string[], recipients: string[]): Promise<'read' | 'replied' | null> {
  // keepDeliveryStatus is supported by installed mailparser 3.9; its DefinitelyTyped declaration lags.
  const options: MailParserOptions & { keepDeliveryStatus: boolean } = { keepDeliveryStatus: true, skipHtmlToText: true, skipTextToHtml: true };
  const mail = await simpleParser(source, options);
  const ids = new Set(sentIds.flatMap(receiptMessageIds));
  const addresses = new Set(recipients.map(a => a.trim().toLowerCase()));
  if (!ids.size || !addresses.size) return null;
  const matches = (value: string | string[] | undefined) => receiptMessageIds(value).some(id => ids.has(id));
  const contentType = mail.headers.get('content-type') as { value?: string } | undefined;
  if (contentType?.value === 'multipart/report') {
    for (const attachment of mail.attachments) {
      if (attachment.contentType !== 'message/disposition-notification') continue;
      const fields = new Map<string, string>();
      for (const line of attachment.content.toString('utf8').replace(/\r?\n[ \t]+/g, ' ').split(/\r?\n/)) {
        const colon = line.indexOf(':');
        if (colon > 0) fields.set(line.slice(0, colon).trim().toLowerCase(), line.slice(colon + 1).trim());
      }
      const recipient = (fields.get('final-recipient') || '').split(';').slice(1).join(';').trim().toLowerCase();
      const disposition = fields.get('disposition') || '';
      // delivered/processed/deleted/denied/error are not displayed receipts.
      if (matches(fields.get('original-message-id')) && addresses.has(recipient)
        && /;\s*displayed\s*$/i.test(disposition)) return 'read';
    }
    return null; // Includes delivery-status notifications (bounces).
  }
  if (!matches(mail.inReplyTo) && !matches(mail.references)) return null;
  if (!mail.from?.value.some(a => addresses.has((a.address || '').toLowerCase()))) return null;
  const auto = String(mail.headers.get('auto-submitted') || 'no').toLowerCase();
  if (auto !== 'no' || mail.headers.has('x-autoreply') || mail.headers.has('x-autorespond')) return null;
  // Non-standard receipts cannot establish either a human reply or a read.
  if (/^(已读|read:|已阅读|阅读回执|自动回复|automatic reply|out of office)/i.test(mail.subject || '')) return null;
  return 'replied';
}

/** Only an explicitly configured recipient mailbox can supply its own Seen flag. */
export function ownMailboxRead(message: { messageId?: string; to?: { address?: string }[] }, flags: Set<string> | undefined, sentIds: string[], recipients: string[], mailbox: string): boolean {
  const address = mailbox.trim().toLowerCase();
  if (!recipients.some(r => r.toLowerCase() === address) || !message.to?.some(r => r.address?.toLowerCase() === address)) return false;
  const ids = new Set(sentIds.flatMap(receiptMessageIds));
  return !!flags?.has('\\Seen') && receiptMessageIds(message.messageId).some(id => ids.has(id));
}
