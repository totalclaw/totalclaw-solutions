/**
 * A1 跨期调整（cross-period-adjustment）：用业务日期识别跨期。
 *
 * 业务日期依次取序时账的业务 / 发票日期列，其次是摘要里的日期（YYYY-MM-DD、YYYY年M月D日、M月）。
 * 以本期为视角（序时账可以带期后几天的分录）：
 *   late    本期过账、业务在上期（延迟入账 / 上期漏做）
 *   early   本期过账、业务在下期（提前确认）
 *   omitted 期后过账、业务在本期（本期漏做）
 * 一张凭证算一条（金额 = 凭证借方合计）。只看涉及损益科目的凭证：付上月工资这类只动往来与现金的
 * 分录不影响收入费用的归属期，不算跨期。金额 / 天数分档与审批层级见 thresholds/close.json。
 */
import { i18nKey } from '@totalclaw/i18n';
import type { FauAccountMapEntry, FauApprovalLevel, FauCrossPeriodItem, FauCrossPeriodType } from '@totalclaw/ipc-contracts';
import type { JournalRow } from '../../../types';
import { accountNature, daysBetween, inPeriod, msg, periodEnd, periodStart } from '../common';

export interface CrossPeriodInput {
  period: string;
  journal: JournalRow[];
  th: Record<string, number>;
  reportBasis?: 'cn' | 'ifrs';
  accountMap?: FauAccountMapEntry[];
}

const pad = (n: number | string) => String(n).padStart(2, '0');

/** 摘要里的日期：认到具体日期给 date；只有月份时 date 为空、给 month（上期按月末、下期按月初算天数） */
export function summaryDate(summary: string, postingDate: string): { date: string; month: string } | null {
  const s = String(summary || '');
  let m = s.match(/(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})/) || s.match(/(\d{4})\s*年\s*(\d{1,2})\s*月\s*(\d{1,2})\s*日/);
  if (m) return { date: `${m[1]}-${pad(m[2])}-${pad(m[3])}`, month: '' };
  m = s.match(/(\d{4})\s*年\s*(\d{1,2})\s*月/);
  if (m) return { date: '', month: `${m[1]}-${pad(m[2])}` };
  m = s.match(/(?:^|[^\d])(\d{1,2})\s*月/);
  if (m && postingDate) {
    const mm = Number(m[1]);
    if (mm < 1 || mm > 12) return null;
    const py = Number(postingDate.slice(0, 4));
    const pm = Number(postingDate.slice(5, 7));
    // 1 月过账写「12 月」是上一年；12 月过账写「1 月」是下一年
    const year = mm - pm > 6 ? py - 1 : pm - mm > 6 ? py + 1 : py;
    return { date: '', month: `${year}-${pad(mm)}` };
  }
  return null;
}

function tier(v: number, t1: number, t2: number, t3: number): 1 | 2 | 3 | 4 {
  return v <= t1 ? 1 : v <= t2 ? 2 : v <= t3 ? 3 : 4;
}

export function crossPeriod(input: CrossPeriodInput): FauCrossPeriodItem[] {
  const { period, th } = input;
  const end = periodEnd(period);
  const groups = new Map<string, JournalRow[]>();
  for (const r of input.journal) {
    const k = r.voucherNo ? `${r.date}|${r.voucherNo}` : `row|${r.row}`;
    const g = groups.get(k) || [];
    g.push(r);
    groups.set(k, g);
  }
  const out: FauCrossPeriodItem[] = [];
  for (const lines of groups.values()) {
    const date = lines[0].date;
    if (!date) continue;
    const touchesPl = lines.some((l) => {
      const cls = accountNature(l.accountCode, l.accountName, input.reportBasis || 'cn', input.accountMap || []);
      return cls === 'revenue' || cls === 'expense';
    });
    if (!touchesPl) continue;
    // 业务日期：先找业务日期列，再找摘要
    let bizDate = lines.find((l) => l.businessDate)?.businessDate || '';
    let bizMonth = bizDate ? bizDate.slice(0, 7) : '';
    if (!bizDate) {
      for (const l of lines) {
        const sd = summaryDate(l.summary, date);
        if (sd) { bizDate = sd.date; bizMonth = sd.date ? sd.date.slice(0, 7) : sd.month; break; }
      }
    }
    if (!bizMonth) continue;
    const postedIn = inPeriod(date, period);
    let type: FauCrossPeriodType | null = null;
    if (postedIn && bizMonth < period) type = 'late';
    else if (postedIn && bizMonth > period) type = 'early';
    else if (date > end && bizMonth === period) type = 'omitted';
    if (!type) continue;
    // 只有月份时：上期按月末、下期按月初、本期按月末（omitted 的保守估计）
    const effBiz = bizDate || (type === 'early' ? periodStart(bizMonth) : periodEnd(bizMonth));
    const days = Math.abs(daysBetween(effBiz, date));
    const main = lines.reduce((a, l) => (l.debit > a.debit ? l : a), lines[0]);
    const amount = lines.reduce((a, l) => a + l.debit, 0);
    const amountTier = tier(amount, th['cross.amountTier1'] ?? 10000, th['cross.amountTier2'] ?? 500000, th['cross.amountTier3'] ?? 5000000);
    const dayTier = tier(days, th['cross.dayTier1'] ?? 5, th['cross.dayTier2'] ?? 30, th['cross.dayTier3'] ?? 90);
    const adjustThisPeriod = amountTier >= 3 || dayTier >= 3;
    const approval: FauApprovalLevel = amountTier === 4 || dayTier === 4 ? 'approver' : amountTier === 3 ? 'reviewer' : 'preparer';
    const advice = approval === 'approver'
      ? msg(i18nKey('必须本期调整，须财务经理确认，并在结账报告中单独披露'))
      : adjustThisPeriod
        ? msg(i18nKey('必须本期调整，由财务主管审批'))
        : amountTier === 1 && dayTier === 1
          ? msg(i18nKey('记录差异，可本期末调整或下期入账'))
          : msg(i18nKey('建议本期调整'));
    out.push({
      id: `cp-${main.row}`,
      row: main.row,
      voucherNo: main.voucherNo,
      date,
      businessDate: effBiz,
      accountCode: main.accountCode,
      accountName: main.accountName,
      summary: main.summary,
      amount,
      type,
      days,
      amountTier,
      dayTier,
      approval,
      adjustThisPeriod,
      advice,
    });
  }
  return out.sort((a, b) => b.amount - a.amount);
}
