/**
 * B3 外审配合与函证：交给模型的任务指令（模型可见文本；本目录在 i18n codemod 里整目录豁免）。
 * 回函只做抽取：每份回函写出确认的金额与原文引用，代码核对引用在原文里、金额在引用里；不判断是否需要调账。
 */
import { z } from 'zod';

export const REPLY_TASK = [
  'Read each confirmation reply (skill fa-confirmation-management) and extract what the replying party confirmed. Extraction only.',
  'data.confirmations lists the confirmations (id, party, type, book amount) that the replies belong to; each untrusted document name tells you which file is which.',
  'For each reply return: file (the document name), confId (one of data.confirmations ids), confirmedAmount (the amount the party states, digits as written, e.g. "1,234,567.89"),',
  'currency, agrees (true if the party says the balance agrees), exceptions (one short sentence, empty if none),',
  'quote = the sentence copied verbatim from the reply that contains confirmedAmount.',
  'If a reply does not state an amount, set confirmedAmount to "" and quote to "". Never guess.',
  'Return {"replies":[{"file":"...","confId":"...","confirmedAmount":"...","currency":"...","agrees":true,"exceptions":"","quote":"..."}]}.',
].join('\n');

export const replySchema = z.object({
  replies: z.array(z.object({
    file: z.string().max(200),
    confId: z.string().max(40),
    confirmedAmount: z.string().max(40),
    currency: z.string().max(10),
    agrees: z.boolean(),
    exceptions: z.string().max(400),
    quote: z.string().max(600),
  })).max(500),
});
