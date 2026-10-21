/**
 * B3 外审配合与函证：调整影响（手算）、PBC 进度、函证归集与状态、回函率；
 * 发送守卫：没有人工确认（一次性令牌）就不会调用邮件发送；令牌只能用一次、过期作废、换运行作废。
 */
import { describe, expect, it, vi } from 'vitest';
import type { FauRun } from '@totalclaw/ipc-contracts';
import type { JournalRow } from '../../types';
import { thresholdsFor } from '../../thresholds';
import { adjustmentImpact, mergePbcHandoffs, parsePbc } from './extAudit/support';
import { amountInQuote, applyStatus, matchReply, parseConfirmations, responseRate } from './extAudit/confirm';
import { SEND_TOKEN_TTL_MS, SendGuard } from './extAudit/sendGuard';
import { sendConfirmed, type SendItem } from './extAudit/send';
import { tableOf } from './testTable';
import * as FX from '../../__fixtures__/audit/data';

const th = thresholdsFor('ext-audit');
const j = (voucherNo: string, accountCode: string, accountName: string, debit: number, credit: number, row: number): JournalRow => ({
  row, date: '2026-09-30', voucherNo, lineNo: 1, accountCode, accountName, summary: 'adj', debit, credit, currency: 'CNY', fxAmount: null, counterparty: '', dept: '', project: '', businessDate: '', source: '',
});

describe('B3 审计调整影响', () => {
  it('AJE-1 补提费用：利润 −1 万、负债 +1 万；AJE-2 补记收入：利润 +5 万、资产 +5 万；重要性 3 万只有 AJE-2 超过', () => {
    const rows = [j('AJE-1', '6602', '管理费用', 1_000_000, 0, 2), j('AJE-1', '2241', '其他应付款', 0, 1_000_000, 3), j('AJE-2', '1122', '应收账款', 5_000_000, 0, 4), j('AJE-2', '6001', '主营业务收入', 0, 5_000_000, 5)];
    const out = adjustmentImpact(rows, 'cn', [], 3_000_000);
    expect(out.map((a) => [a.voucherNo, a.profitImpact, a.assetImpact, a.liabilityImpact, a.balanced, a.exceedsMateriality])).toEqual([
      ['AJE-1', -1_000_000, 0, 1_000_000, true, false],
      ['AJE-2', 5_000_000, 5_000_000, 0, true, true],
    ]);
  });
});

describe('B3 PBC', () => {
  it('截至 2026-10-19：已提供 1、超期 1、待提供 1；A1 转交过来的关账包按索引号记为已提供', () => {
    const items = parsePbc(tableOf(FX.PBC_HEAD, FX.PBC, 'pbc'), FX.AS_OF);
    expect(items.map((x) => x.status)).toEqual(['provided', 'overdue', 'requested']);
    const merged = mergePbcHandoffs(items, [{ code: 'A1', files: ['A1-关账包.xlsx'] }, { code: 'B4', files: ['B4-复核意见表.xlsx'] }]);
    expect(merged.find((x) => x.id === 'PBC-03')?.status).toBe('provided');
    expect(merged.find((x) => x.ref === 'B4')).toMatchObject({ status: 'provided', source: 'handoff' });
  });
});

describe('B3 函证', () => {
  const { list, badEmail } = parseConfirmations(tableOf(FX.CONFIRM_HEAD, FX.CONFIRMS, 'confirmations'), 'CNY');
  it('解析：类型三语认、没邮箱的保留但标空', () => {
    expect(list.map((c) => `${c.id}:${c.type}:${c.bookAmount}:${c.email}`)).toEqual(['CF-001:bank:100000000:bank@example.com', 'CF-002:ar:50000000:ar@example.com', 'CF-003:ap:20000000:']);
    expect(badEmail).toEqual([]);
  });

  it('回函按函证编号归集（编号互为前缀时取最长）', () => {
    const extra = [...list, { ...list[0], id: 'CF-0010' }];
    expect(matchReply(extra, '回函-CF-0010.pdf', '')).toBe('CF-0010');
    expect(matchReply(list, 'scan.pdf', FX.REPLY_1)).toBe('CF-001');
    expect(matchReply(list, 'x.txt', 'no id here')).toBeNull();
  });

  it('确认金额必须在引用里（三语数字写法都认）', () => {
    expect(amountInQuote('1,000,000.00', '余额为 1,000,000.00 元，与贵公司记录相符')).toBe(true);
    expect(amountInQuote('480000', 'a balance of 480,000.00 due')).toBe(true);
    expect(amountInQuote('١٢٣٬٤٥٦٫٧٨', 'الرصيد 123,456.78 ريال')).toBe(true);
    expect(amountInQuote('999,999.00', '余额为 1,000,000.00 元')).toBe(false);
  });

  it('状态：相符 / 不符（差 2 万）/ 发函 4 天待回 / 发函 18 天未回函（带替代程序）/ 未发；回函率 2/4', () => {
    const four = [...list, { ...list[1], id: 'CF-004' }, { ...list[1], id: 'CF-005' }];
    const sent = [{ id: 'CF-001', at: '2026-10-01T09:00:00Z', ok: true }, { id: 'CF-002', at: '2026-10-01T09:00:00Z', ok: true }, { id: 'CF-003', at: '2026-10-15T09:00:00Z', ok: true }, { id: 'CF-004', at: '2026-10-01T09:00:00Z', ok: true }];
    const replies = [{ confId: 'CF-001', file: 'r1.txt', amount: 100_000_000, quote: 'q', verified: true }, { confId: 'CF-002', file: 'r2.txt', amount: 48_000_000, quote: 'q', verified: true }];
    const out = applyStatus(four, sent, replies, FX.AS_OF, th);
    expect(out.map((c) => `${c.id}:${c.status}:${c.diff ?? ''}:${c.ageDays ?? ''}`)).toEqual(['CF-001:replied_match:0:', 'CF-002:replied_diff:2000000:', 'CF-003:sent::4', 'CF-004:no_reply::18', 'CF-005:draft::']);
    expect(out[3].alternative.length).toBeGreaterThan(0);
    expect(responseRate(out)).toBe(0.5);
  });
});

describe('B3 函证发送守卫（只允许经人工确认的发送）', () => {
  const run = { id: 'run_cf', moduleId: 'ext-audit', modeId: 'confirm_prepare', status: 'archived' } as FauRun;
  const items: SendItem[] = [
    { id: 'CF-001', party: 'bank', email: 'bank@example.com', subject: 's', body: 'b', attachment: '/tmp/a.docx' },
    { id: 'CF-002', party: 'a', email: 'ar@example.com', subject: 's', body: 'b', attachment: '/tmp/b.docx' },
  ];
  it('没有令牌 / 随便编的令牌：拒绝，邮件发送没被调用', async () => {
    const guard = new SendGuard();
    const sender = vi.fn(async () => ({ ok: true }));
    await expect(sendConfirmed(guard, undefined, run, items, sender)).rejects.toMatchObject({ code: 'not_confirmed' });
    await expect(sendConfirmed(guard, 'deadbeef', run, items, sender)).rejects.toMatchObject({ code: 'not_confirmed' });
    expect(sender).not.toHaveBeenCalled();
  });

  it('确认后：只发预览时确认过的那几份；同一令牌第二次用被拒', async () => {
    const guard = new SendGuard();
    const sender = vi.fn(async () => ({ ok: true, via: 'self' as const }));
    const { token } = guard.issue(run.id, ['CF-001']);
    const recs = await sendConfirmed(guard, token, run, items, sender);
    expect(recs.map((r) => `${r.id}:${r.ok}`)).toEqual(['CF-001:true']);
    expect(sender).toHaveBeenCalledTimes(1);
    await expect(sendConfirmed(guard, token, run, items, sender)).rejects.toMatchObject({ code: 'not_confirmed' });
    expect(sender).toHaveBeenCalledTimes(1);
  });

  it('令牌过期、换了运行：拒绝', async () => {
    const guard = new SendGuard();
    const sender = vi.fn(async () => ({ ok: true }));
    const t0 = Date.now();
    const a = guard.issue(run.id, ['CF-001'], t0);
    await expect(sendConfirmed(guard, a.token, run, items, sender, t0 + SEND_TOKEN_TTL_MS + 1)).rejects.toMatchObject({ code: 'not_confirmed' });
    const b = guard.issue('another_run', ['CF-001']);
    await expect(sendConfirmed(guard, b.token, run, items, sender)).rejects.toMatchObject({ code: 'not_confirmed' });
    expect(sender).not.toHaveBeenCalled();
  });
});
