/**
 * B5 舞弊数据分析规则（纯函数）。本方案新增 7 条：本福特（benford.ts）、重复付款、周末 / 节假日分录、期末大额手工调整、
 * 整数金额、供应商与员工银行账户相同、供应商与员工名称相似；另只读复用财务智能体 risk.ts 能用序时账 / 余额表跑的规则
 * （大额现金、费用暴涨、整千大额费用、周末招待、往来挂账、余额方向）——依赖发票与回单的规则在本模块不适用，如实列为「不适用」。
 * 每条命中都带证据行号与单号；金额最小货币单位整数。
 */
import type { FauFraudHit } from '@totalclaw/ipc-contracts';
import type { FaBalanceImport, FaFinding, FaJournalRow } from '@totalclaw/ipc-contracts';
import { abnormalExpenses, largeCash, staleBalances } from '../../../../financeAgent/risk';
import type { JournalRow, TbRow } from '../../../types';
import { daysBetween, periodEnd } from '../../accounting/common';
import { toCents, toIsoDate, type ParsedTable } from '../table';

export interface PaymentRow { row: number; payId: string; payee: string; invoiceNo: string; amount: number; date: string; bankAccount: string }
export interface PartyRow { row: number; id: string; name: string; bankAccount: string }

const MANUAL = /手工|手动|人工|manual|يدوي/i;
const normAccount = (s: string) => s.replace(/[^0-9A-Za-z]/g, '').toUpperCase();
const normName = (s: string) => s.normalize('NFKC').toLowerCase().replace(/[\s·.,，。()（）\-_'"]/g, '');
const amt = (r: JournalRow) => Math.max(r.debit, r.credit);

export function parsePayments(p: ParsedTable): PaymentRow[] {
  return p.rows.map((r) => ({ row: r.row, payId: r.get('payId'), payee: r.get('payee'), invoiceNo: r.get('invoiceNo').replace(/\s+/g, ''), amount: toCents(r.get('amount')), date: toIsoDate(r.get('payDate')), bankAccount: r.get('bankAccount') }))
    .filter((x) => x.payee && x.amount);
}

export function parseParties(p: ParsedTable, kind: 'vendors' | 'employees'): PartyRow[] {
  const idRole = kind === 'vendors' ? 'vendorId' : 'empId';
  const nameRole = kind === 'vendors' ? 'vendorName' : 'empName';
  return p.rows.map((r) => ({ row: r.row, id: r.get(idRole), name: r.get(nameRole), bankAccount: r.get('bankAccount') })).filter((x) => x.name);
}

function byVoucher(rows: JournalRow[]): Map<string, JournalRow[]> {
  const m = new Map<string, JournalRow[]>();
  for (const r of rows) m.set(r.voucherNo || `#${r.row}`, [...(m.get(r.voucherNo || `#${r.row}`) || []), r]);
  return m;
}

function hit(rule: string, level: FauFraudHit['level'], source: FauFraudHit['source'], rows: number[], refs: string[], amount: number, detail: string): FauFraudHit {
  return { id: `${rule}:${refs[0] || rows[0] || 0}`, rule, level, source, rows, refs: [...new Set(refs)].filter(Boolean), amount, detail };
}

/** 周末（及运行参数里给的节假日）记账的分录，按凭证合并 */
export function weekendEntries(journal: JournalRow[], th: Record<string, number>, holidays: string[] = []): FauFraudHit[] {
  const floor = th['weekend.amount.floor'] ?? 100_000;
  const hol = new Set(holidays);
  const out: FauFraudHit[] = [];
  for (const [v, rows] of byVoucher(journal)) {
    const d = rows[0].date;
    if (!d) continue;
    const wd = new Date(`${d}T00:00:00Z`).getUTCDay();
    if (!(wd === 0 || wd === 6 || hol.has(d))) continue;
    const total = rows.reduce((s, r) => s + r.debit, 0);
    if (total < floor) continue;
    out.push(hit('weekend_entry', 'warn', 'journal', rows.map((r) => r.row), [v], total, `${d} ${v} ${rows[0].summary}`));
  }
  return out;
}

/** 每个月最后 N 天的大额手工凭证（凭证来源写着手工，或没有来源信息） */
export function periodEndManual(journal: JournalRow[], th: Record<string, number>): FauFraudHit[] {
  const days = th['periodEnd.days'] ?? 3;
  const floor = th['periodEnd.amount.floor'] ?? 5_000_000;
  const out: FauFraudHit[] = [];
  for (const [v, rows] of byVoucher(journal)) {
    const d = rows[0].date;
    if (!/^\d{4}-\d{2}-\d{2}$/.test(d)) continue;
    const end = periodEnd(d.slice(0, 7));
    if (daysBetween(d, end) >= days) continue;
    const src = rows.map((r) => r.source).join(' ');
    if (src.trim() && !MANUAL.test(src)) continue;
    const total = rows.reduce((s, r) => s + r.debit, 0);
    if (total < floor) continue;
    out.push(hit('period_end_manual', 'high', 'journal', rows.map((r) => r.row), [v], total, `${d} ${v} ${rows[0].summary}`));
  }
  return out;
}

/** 整数金额：≥ 门槛且为 1000 元整数倍的分录行，至少 3 笔才报（与财务智能体同口径控噪） */
export function roundAmounts(journal: JournalRow[], th: Record<string, number>): FauFraudHit[] {
  const floor = th['round.amount.floor'] ?? 1_000_000;
  const rows = journal.filter((r) => amt(r) >= floor && amt(r) % 100_000 === 0);
  if (rows.length < 3) return [];
  return [hit('round_amount', 'info', 'journal', rows.map((r) => r.row), rows.map((r) => r.voucherNo), rows.reduce((s, r) => s + amt(r), 0), rows.slice(0, 10).map((r) => `${r.date} ${r.voucherNo} ${r.accountName}`).join('; '))];
}

/** 重复付款：同收款方同金额，同发票号（高）或日期在窗口内（警示） */
export function duplicatePayments(payments: PaymentRow[], th: Record<string, number>): FauFraudHit[] {
  const win = th['dup.windowDays'] ?? 30;
  const groups = new Map<string, PaymentRow[]>();
  for (const p of payments) {
    const k = `${normName(p.payee)}|${p.amount}`;
    groups.set(k, [...(groups.get(k) || []), p]);
  }
  const out: FauFraudHit[] = [];
  for (const list of groups.values()) {
    if (list.length < 2) continue;
    const sorted = [...list].sort((a, b) => a.date.localeCompare(b.date));
    const sameInv = sorted.filter((p) => p.invoiceNo && sorted.some((q) => q !== p && q.invoiceNo === p.invoiceNo));
    const close = sorted.filter((p, i) => sorted.some((q, j) => j !== i && p.date && q.date && Math.abs(daysBetween(p.date, q.date)) <= win));
    const dup = sameInv.length ? sameInv : close;
    if (dup.length < 2) continue;
    out.push(hit('duplicate_payment', sameInv.length ? 'high' : 'warn', 'payments', dup.map((p) => p.row), dup.map((p) => p.payId || p.invoiceNo), dup[0].amount * (dup.length - 1), `${dup[0].payee} · ${dup.map((p) => `${p.date} ${p.invoiceNo}`).join('; ')}`));
  }
  return out;
}

export function vendorEmployeeBank(vendors: PartyRow[], employees: PartyRow[]): FauFraudHit[] {
  const emp = new Map<string, PartyRow>();
  for (const e of employees) { const k = normAccount(e.bankAccount); if (k.length >= 6) emp.set(k, e); }
  return vendors.flatMap((v) => {
    const e = emp.get(normAccount(v.bankAccount));
    return e && normAccount(v.bankAccount).length >= 6 ? [hit('vendor_employee_bank', 'high', 'master', [v.row, e.row], [v.id || v.name, e.id || e.name], 0, `${v.name} ↔ ${e.name} · ${v.bankAccount}`)] : [];
  });
}

/** 名称相似：员工姓名出现在供应商名称里，或字符二元组相似度 ≥ 门槛 */
export function dice(a: string, b: string): number {
  const grams = (s: string) => { const out: string[] = []; for (let i = 0; i < s.length - 1; i += 1) out.push(s.slice(i, i + 2)); return out; };
  const x = grams(a);
  const y = grams(b);
  if (!x.length || !y.length) return a === b ? 1 : 0;
  const pool = [...y];
  let m = 0;
  for (const g of x) { const i = pool.indexOf(g); if (i >= 0) { m += 1; pool.splice(i, 1); } }
  return (2 * m) / (x.length + y.length);
}

export function relatedNames(vendors: PartyRow[], employees: PartyRow[], th: Record<string, number>): FauFraudHit[] {
  const t = th['name.similarity'] ?? 0.85;
  const out: FauFraudHit[] = [];
  for (const v of vendors) {
    const vn = normName(v.name);
    for (const e of employees) {
      const en = normName(e.name);
      if (en.length < 2) continue;
      if (vn.includes(en) || dice(vn, en) >= t) out.push(hit('related_name', 'warn', 'master', [v.row, e.row], [v.id || v.name, e.id || e.name], 0, `${v.name} ↔ ${e.name}`));
    }
  }
  return out;
}

// ── 只读复用财务智能体 risk.ts ──

const toFa = (r: JournalRow): FaJournalRow => ({ date: r.date, voucherNo: r.voucherNo, summary: r.summary, accountCode: r.accountCode, accountName: r.accountName, debit: r.debit / 100, credit: r.credit / 100, counterparty: r.counterparty || undefined, dept: r.dept || undefined });

/** 只取规则码与证据（单号 / 科目名），说明文字按本工作台的输出语言另写，不用 risk.ts 按界面语言拼的句子 */
function fromFinding(f: FaFinding, journal: JournalRow[]): FauFraudHit {
  const refs = f.refs || [];
  const rows = journal.filter((r) => refs.includes(r.voucherNo));
  const rule = f.code === 'round_amount' ? 'fa_round_amount' : f.code;
  return hit(rule, f.level, rows.length ? 'journal' : 'tb', rows.map((r) => r.row), refs, rows.reduce((s, r) => s + amt(r), 0), refs.slice(0, 10).join(', '));
}

export function riskTsHits(journal: JournalRow[], tb: TbRow[] | null, th: Record<string, number>): FauFraudHit[] {
  const fa = journal.map(toFa);
  const findings: FaFinding[] = [
    ...largeCash(fa, (th['cash.large.floor'] ?? 5_000_000) / 100),
    ...abnormalExpenses(fa, th['expense.spikeRatio'] ?? 2),
  ];
  if (tb?.length) {
    const balances: FaBalanceImport = { period: '', fileName: '', importedAt: '', rows: tb.map((r) => ({ code: r.accountCode, name: r.accountName, openingDebit: r.openingDr / 100, openingCredit: r.openingCr / 100, debit: r.periodDr / 100, credit: r.periodCr / 100, closingDebit: r.closingDr / 100, closingCredit: r.closingCr / 100 })) };
    findings.push(...staleBalances(balances, [], th['stale.days'] ?? 365));
  }
  return findings.map((f) => fromFinding(f, journal));
}

/** risk.ts 的 11 条规则里，本模块数据跑不了的（依赖发票 / 回单 / 申报 / 账龄运行） */
export const RISK_TS_NOT_APPLICABLE = ['consecutive', 'pay_person', 'bad_docs', 'low_burden', 'stale_aging'];
export const RISK_TS_RULES = ['large_cash', 'expense_spike', 'fa_round_amount', 'weekend_entertain', 'idle_other', 'wrong_side'];
export const NEW_RULES = ['benford', 'duplicate_payment', 'weekend_entry', 'period_end_manual', 'round_amount', 'vendor_employee_bank', 'related_name'];

