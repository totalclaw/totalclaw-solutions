/**
 * 往来对账智能体（纯函数）：我方台账 ↔ 对方对账单逐笔比对、标差额；账龄分析与逾期预警。
 *
 * 匹配顺序：① 单号相同 ② 金额相同且日期相差 ≤ 7 天（取最近的）。
 * 单号相同但金额不同 → 金额差异；剩下的分别是「我方有对方无 / 对方有我方无」。
 */
import { t as i18nT } from '@totalclaw/i18n';
import type { FaAgingRow, FaAgingRun, FaFinding, FaRecMatch, FaRecRow } from '@totalclaw/ipc-contracts';
import { daysBetween, fmt, round2, sum } from './common';
import type { AgingInputRow } from './tables';

const DATE_WINDOW = 7;

function normRef(s: string): string {
  return String(s || '').replace(/[\s\-_/#:：]/g, '').toUpperCase();
}

export function matchRows(ours: FaRecRow[], theirs: FaRecRow[]): FaRecMatch[] {
  const out: FaRecMatch[] = [];
  const left = new Set(theirs.map((_, i) => i));
  const pending: FaRecRow[] = [];

  for (const o of ours) {
    const ref = normRef(o.ref);
    const idx = ref ? [...left].find((i) => normRef(theirs[i].ref) === ref) : undefined;
    if (idx == null) { pending.push(o); continue; }
    left.delete(idx);
    const t = theirs[idx];
    const diff = round2(o.amount - t.amount);
    out.push({ ours: o, theirs: t, status: Math.abs(diff) < 0.005 ? 'matched' : 'amount_diff', diff, note: Math.abs(diff) < 0.005 ? i18nT('单号一致') : i18nT('单号一致，金额差 {p0}', { p0: fmt(diff) }) });
  }
  for (const o of pending) {
    let best: number | undefined;
    let bestGap = Infinity;
    for (const i of left) {
      const t = theirs[i];
      if (Math.abs(t.amount - o.amount) >= 0.005) continue;
      const gap = Math.abs(daysBetween(o.date, t.date));
      if (gap <= DATE_WINDOW && gap < bestGap) { best = i; bestGap = gap; }
    }
    if (best == null) { out.push({ ours: o, status: 'only_ours', diff: o.amount, note: i18nT('对方账上没有这笔') }); continue; }
    left.delete(best);
    out.push({ ours: o, theirs: theirs[best], status: 'matched', diff: 0, note: bestGap ? i18nT('金额一致，日期差 {n} 天', { n: bestGap }) : i18nT('金额、日期一致') });
  }
  for (const i of left) out.push({ theirs: theirs[i], status: 'only_theirs', diff: round2(-theirs[i].amount), note: i18nT('我方账上没有这笔') });
  const order = { amount_diff: 0, only_ours: 1, only_theirs: 2, matched: 3 } as const;
  return out.sort((a, b) => order[a.status] - order[b.status] || ((a.ours || a.theirs)!.date).localeCompare((b.ours || b.theirs)!.date));
}

export function recSummary(matches: FaRecMatch[]): { balanceOurs: number; balanceTheirs: number; diffs: number; gap: number } {
  const balanceOurs = sum(matches.filter((m) => m.ours).map((m) => m.ours!.amount));
  const balanceTheirs = sum(matches.filter((m) => m.theirs).map((m) => m.theirs!.amount));
  return { balanceOurs, balanceTheirs, diffs: matches.filter((m) => m.status !== 'matched').length, gap: round2(balanceOurs - balanceTheirs) };
}

// ─── 账龄 ────────────────────────────────────────────────────────────────

export const AGING_BUCKETS = (): Array<{ max: number; label: string }> => [
  { max: 30, label: i18nT('30 天以内') },
  { max: 90, label: i18nT('31–90 天') },
  { max: 180, label: i18nT('91–180 天') },
  { max: 365, label: i18nT('181–365 天') },
  { max: Infinity, label: i18nT('1 年以上') },
];

export function buildAging(rows: AgingInputRow[], asOf: string, side: 'ar' | 'ap', staleDays: number): Pick<FaAgingRun, 'rows' | 'buckets' | 'byCounterparty' | 'warnings'> {
  const buckets = AGING_BUCKETS();
  const out: FaAgingRow[] = rows
    .map((r) => {
      const outstanding = round2(r.amount - r.paid);
      const ageDays = Math.max(0, daysBetween(r.date, asOf));
      const overdueDays = Math.max(0, daysBetween(r.dueDate, asOf));
      return { ...r, outstanding, ageDays, overdueDays, bucket: buckets.find((b) => ageDays <= b.max)!.label };
    })
    .filter((r) => Math.abs(r.outstanding) >= 0.005);

  const bucketSum = buckets.map((b) => {
    const list = out.filter((r) => r.bucket === b.label);
    return { bucket: b.label, amount: sum(list.map((r) => r.outstanding)), count: list.length };
  });
  const byCp = new Map<string, { counterparty: string; outstanding: number; overdue: number; maxOverdueDays: number }>();
  for (const r of out) {
    const g = byCp.get(r.counterparty) || { counterparty: r.counterparty, outstanding: 0, overdue: 0, maxOverdueDays: 0 };
    g.outstanding = round2(g.outstanding + r.outstanding);
    if (r.overdueDays > 0) g.overdue = round2(g.overdue + r.outstanding);
    g.maxOverdueDays = Math.max(g.maxOverdueDays, r.overdueDays);
    byCp.set(r.counterparty, g);
  }
  const byCounterparty = [...byCp.values()].sort((a, b) => b.overdue - a.overdue || b.outstanding - a.outstanding);

  const warnings: FaFinding[] = [];
  const who = side === 'ar' ? i18nT('客户') : i18nT('供应商');
  for (const g of byCounterparty) {
    if (g.overdue <= 0) continue;
    const level: FaFinding['level'] = g.maxOverdueDays > 90 ? 'high' : g.maxOverdueDays > 30 ? 'warn' : 'info';
    warnings.push({
      code: 'overdue', level, refs: [g.counterparty],
      title: side === 'ar' ? i18nT('{p0} 逾期未回款 {a}', { p0: g.counterparty, a: fmt(g.overdue) }) : i18nT('应付 {p0} 已逾期 {a}', { p0: g.counterparty, a: fmt(g.overdue) }),
      detail: i18nT('{p0}「{p1}」未结 {a}，其中逾期 {b}，最长逾期 {n} 天', { p0: who, p1: g.counterparty, a: fmt(g.outstanding), b: fmt(g.overdue), n: g.maxOverdueDays }),
      suggestion: side === 'ar'
        ? (g.maxOverdueDays > 90 ? i18nT('发催款函并电话跟进；超过 180 天考虑律师函与坏账准备') : i18nT('发对账函确认余额，提醒付款'))
        : i18nT('确认付款计划，避免影响供货与信用'),
    });
  }
  const stale = out.filter((r) => r.ageDays > staleDays);
  if (stale.length) {
    warnings.push({
      code: 'stale', level: 'warn', refs: [...new Set(stale.map((r) => r.counterparty))],
      title: i18nT('{n} 笔往来挂账超过 {d} 天', { n: stale.length, d: staleDays }),
      detail: i18nT('合计 {a}，涉及 {m} 家', { a: fmt(sum(stale.map((r) => r.outstanding))), m: new Set(stale.map((r) => r.counterparty)).size }),
      suggestion: i18nT('长期挂账可能被认定为隐匿收入或虚列成本；逐笔查明原因，能核销的核销，确实无法收回的按规定做损失'),
    });
  }
  return { rows: out.sort((a, b) => b.overdueDays - a.overdueDays), buckets: bucketSum, byCounterparty, warnings };
}

// ─── 对账函 / 催款函（固定模板，数字全部来自比对结果） ───────────────────

export function reconcileLetter(run: { side: 'ar' | 'ap'; counterparty: string; asOf: string; matches: FaRecMatch[]; balanceOurs: number; balanceTheirs: number }, ledgerName: string): string {
  const diffs = run.matches.filter((m) => m.status !== 'matched');
  const dir = run.side === 'ar' ? i18nT('贵司尚欠我司') : i18nT('我司尚欠贵司');
  const lines = [
    i18nT('往来款项对账函'),
    '',
    i18nT('{p0}：', { p0: run.counterparty || i18nT('贵司') }),
    '',
    i18nT('为核对双方往来账目，截至 {d}，我司账面记录{p0}款项余额为人民币 {a} 元；根据贵司提供的对账单，贵司账面记录余额为 {b} 元，差额 {c} 元。', { d: run.asOf, p0: dir, a: fmt(run.balanceOurs), b: fmt(run.balanceTheirs), c: fmt(round2(run.balanceOurs - run.balanceTheirs)) }),
    '',
  ];
  if (diffs.length) {
    lines.push(i18nT('差异明细如下，请协助核对：'));
    diffs.forEach((m, i) => {
      const r = m.ours || m.theirs!;
      const who = m.status === 'only_ours' ? i18nT('我方有、贵方无') : m.status === 'only_theirs' ? i18nT('贵方有、我方无') : i18nT('双方金额不一致');
      lines.push(`${i + 1}. ${r.date} ${r.ref || ''} ${r.summary || ''}　${who}　${i18nT('我方 {a} / 贵方 {b}', { a: m.ours ? fmt(m.ours.amount) : '-', b: m.theirs ? fmt(m.theirs.amount) : '-' })}`);
    });
    lines.push('');
  } else {
    lines.push(i18nT('经逐笔核对，双方记录一致。'), '');
  }
  lines.push(
    i18nT('如核对无误，请在下方「信息证明无误」处签章；如有不符，请在「信息不符」处列明贵司记录的金额与明细。本函仅用于核对账目，不作为催款依据。'),
    '',
    i18nT('信息证明无误　　　　（签章）　　　　年　月　日'),
    i18nT('信息不符，请列明不符项目及具体内容：'),
    '',
    `${ledgerName}`,
    i18nT('{p0}（此函为草稿，经财务复核并由有权人签章后发出）', { p0: run.asOf }),
  );
  return lines.join('\n');
}

export function dunningLetter(counterparty: string, rows: FaAgingRow[], asOf: string, ledgerName: string): string {
  const overdue = rows.filter((r) => r.counterparty === counterparty && r.overdueDays > 0);
  const total = sum(overdue.map((r) => r.outstanding));
  return [
    i18nT('付款提醒函'),
    '',
    i18nT('{p0}：', { p0: counterparty }),
    '',
    i18nT('感谢贵司一直以来的合作。经核对，截至 {d}，贵司以下款项已超过约定付款期限，逾期金额合计人民币 {a} 元：', { d: asOf, a: fmt(total) }),
    '',
    ...overdue.map((r, i) => i18nT('{n}. 单据 {p0}，日期 {p1}，到期日 {p2}，未付 {a} 元，已逾期 {m} 天', { n: i + 1, p0: r.docNo || '-', p1: r.date, p2: r.dueDate, a: fmt(r.outstanding), m: r.overdueDays })),
    '',
    i18nT('请贵司在收到本函后尽快安排付款；如已付款请忽略本函，并告知付款日期与凭证以便核对。如对金额有异议，请与我司财务联系对账。'),
    '',
    ledgerName,
    i18nT('{p0}（此函为草稿，经财务复核后发出）', { p0: asOf }),
  ].join('\n');
}
