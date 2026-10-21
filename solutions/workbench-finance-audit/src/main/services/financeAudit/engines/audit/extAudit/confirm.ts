/**
 * B3 函证（纯函数）：函证清单解析、回函归集到函证、差异与状态、回函率、替代程序。
 *
 * 状态：没发过 → 草稿未发；发了没回、发函后不足 N 天 → 已发函待回；超过 N 天 → 未回函（进待办）；
 * 回函金额回原文核实且与账面差额在容差内 → 回函相符，否则回函不符（未核实的金额也按不符，须人工看）。
 */
import type { FauConfirmation, FauConfirmType } from '@totalclaw/ipc-contracts';
import { ALTERNATIVE_PROCEDURES } from '../../../../../../shared/financeAudit/auditLabels';
import { normalizeDigits } from '../../../verify';
import { daysBetween } from '../../accounting/common';
import { matchValue, toCents, type ParsedTable } from '../table';

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function parseConfirmations(p: ParsedTable, currency: string): { list: FauConfirmation[]; badEmail: number[]; dupIds: string[] } {
  const list: FauConfirmation[] = [];
  const badEmail: number[] = [];
  for (const r of p.rows) {
    const id = r.get('confId').replace(/\s+/g, '').toUpperCase();
    if (!id) continue;
    const email = r.get('email');
    if (email && !EMAIL.test(email)) badEmail.push(r.row);
    list.push({
      id, type: matchValue(r.get('confType'), ['bank', 'ar', 'ap'] as const) || 'other', party: r.get('party'), email: EMAIL.test(email) ? email : '',
      account: r.get('account'), bookAmount: toCents(r.get('bookAmount')), currency: r.get('currency').toUpperCase() || currency,
      replyAmount: null, status: 'draft', diff: null, ageDays: null, alternative: [], row: r.row,
    });
  }
  const seen = new Set<string>();
  const dupIds = list.map((c) => c.id).filter((id) => (seen.has(id) ? true : (seen.add(id), false)));
  return { list, badEmail, dupIds };
}

/** 回函文件归到哪份函证：文件名或正文里出现函证编号（整词、忽略大小写） */
export function matchReply(confirmations: FauConfirmation[], fileName: string, text: string): string | null {
  const hay = `${fileName}\n${text}`.toUpperCase();
  const hits = confirmations.filter((c) => new RegExp(`(^|[^A-Z0-9])${c.id.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&')}([^A-Z0-9]|$)`).test(hay));
  // 编号互为前缀（CF-1 / CF-10）时取最长的
  return hits.sort((a, b) => b.id.length - a.id.length)[0]?.id || null;
}

/** 模型给的确认金额是否真在引用原文里（数字写法归一后比较） */
export function amountInQuote(amountText: string, quote: string): boolean {
  const n = (s: string) => normalizeDigits(s).replace(/[,\s]/g, '');
  const a = n(amountText).replace(/^0+(?=\d)/, '');
  if (!a || !/\d/.test(a)) return false;
  const q = n(quote);
  return q.includes(a) || (/\.\d*$/.test(a) && q.includes(a.replace(/\.?0+$/, '')));
}

export interface SentRecord { id: string; at: string; ok: boolean; via?: 'self' | 'official'; message?: string }
export interface ReplyFact { confId: string; file: string; amount: number | null; quote: string; verified: boolean }

export function applyStatus(list: FauConfirmation[], sent: SentRecord[], replies: ReplyFact[], asOf: string, th: Record<string, number>): FauConfirmation[] {
  const tol = th['confirm.matchTol'] ?? 1;
  const overdue = th['confirm.overdueDays'] ?? 10;
  return list.map((c) => {
    const s = [...sent].reverse().find((x) => x.id === c.id && x.ok);
    const rep = replies.find((r) => r.confId === c.id);
    const base: FauConfirmation = { ...c, sentAt: s?.at || c.sentAt, sentVia: s?.via || c.sentVia, replyAmount: null, diff: null, ageDays: null, alternative: [] };
    if (rep) {
      const diff = rep.verified && rep.amount !== null ? c.bookAmount - rep.amount : null;
      const match = diff !== null && Math.abs(diff) <= tol;
      return {
        ...base, replyFile: rep.file, replyAmount: rep.verified ? rep.amount : null, replyQuote: rep.quote, replyVerified: rep.verified,
        status: match ? 'replied_match' : 'replied_diff', diff, alternative: match ? [] : ALTERNATIVE_PROCEDURES[c.type],
      };
    }
    if (!base.sentAt) return { ...base, status: 'draft' };
    const age = Math.max(0, daysBetween(base.sentAt.slice(0, 10), asOf));
    return age >= overdue
      ? { ...base, status: 'no_reply', ageDays: age, alternative: ALTERNATIVE_PROCEDURES[c.type as FauConfirmType] }
      : { ...base, status: 'sent', ageDays: age };
  });
}

/** 回函率 = 已回函 / 已发函；一份都没发返回 null */
export function responseRate(list: FauConfirmation[]): number | null {
  const sent = list.filter((c) => c.status !== 'draft');
  if (!sent.length) return null;
  return sent.filter((c) => c.status === 'replied_match' || c.status === 'replied_diff').length / sent.length;
}
