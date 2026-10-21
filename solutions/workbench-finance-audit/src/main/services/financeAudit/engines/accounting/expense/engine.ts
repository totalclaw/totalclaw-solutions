/**
 * A5 费用报销稽核（批量 / 事后，reimbursement-review + invoice-verification + policy-compliance-check + dispute-identification）。
 *
 * 单票与整单的预审**只读复用**财务智能体的规则：invoice.ts::checkDoc（金额勾稽、税号校验位、抬头、重复票、日期）
 * 与 expense.ts::reviewClaim（有效期、跨年、报销标准、专票要求、同票多报）；它们的结论只取 code（文案按本方案输出语言另出）。
 * 在它之上补：超标率分档（≤5% 轻微 / 5–20% 加签 / > 20% 驳回，替代它「超标即驳回」）、提交时限、ZATCA 二维码核对、
 * 跨单据的异常模式（高频、拆单、供应商集中、跨期、周末、整数、连号、同票多报）。
 * 结论：有阻断 → 驳回；只有提醒 → 需补正；涉及阻断级异常模式或二维码不符 / 超大额 → 升级。金额一律分。
 */
import { i18nKey } from '@totalclaw/i18n';
import type {
  FaDoc, FaDocKind, FaExpenseClaim, FaLedger,
  FauAnomaly, FauClaimVerdict, FauExpenseClaimResult, FauExpenseLine, FauExpenseResult, FauFlag, FauMsg,
} from '@totalclaw/ipc-contracts';
import { FAU_CLAIM_VERDICTS } from '@totalclaw/ipc-contracts';
import { checkDoc, directionOf } from '../../../../financeAgent/invoice';
import { defaultExpenseRules, reviewClaim } from '../../../../financeAgent/expense';
import type { ExpenseClaimRow } from '../../../subledgerTypes';
import { addDays, daysBetween, fmtYuan, msg } from '../common';
import WORDS from '../../../intake/subledgerKeywords.json';
import { checkZatcaQr } from './zatca';

export interface ExpenseInput {
  asOf: string;
  lines: ExpenseClaimRow[];
  company: { name: string; taxId: string };
  th: Record<string, number>;
  /** 只做异常模式（不逐单预审） */
  anomalyOnly: boolean;
}

const W = WORDS as unknown as { categoryAliases: Record<string, string[]>; invoiceKinds: Record<string, string[]> };
const yuan = (c: number) => Math.round(c) / 100;
const norm = (s: string) => String(s || '').replace(/\s+/g, '').toLowerCase();

/** 费用类别 → 财务智能体的类别名（它的报销标准按类别名取） */
export function canonicalCategory(c: string): string {
  const s = norm(c);
  if (!s) return '';
  for (const [cat, words] of Object.entries(W.categoryAliases)) {
    if (norm(cat) === s || words.some((w) => s.includes(norm(w)))) return cat;
  }
  return c;
}

export function invoiceKindOf(text: string, hasNo: boolean): FaDocKind {
  const s = norm(text);
  for (const [kind, words] of Object.entries(W.invoiceKinds)) if (words.some((w) => s.includes(norm(w)))) return kind as FaDocKind;
  return hasNo ? 'vat_normal' : 'other';
}

/** 财务智能体结论码里，被本方案换掉或不用的（normal_no_deduct 是记账口径提示，不是报销单的问题） */
const SKIP_CODES = new Set(['pass', 'sum_ok', 'over_cap', 'normal_no_deduct']);

export function expenseReview(input: ExpenseInput): FauExpenseResult {
  const { th, asOf } = input;
  const ledger = { id: 'fau', name: input.company.name, taxId: input.company.taxId, taxpayerType: 'general', cityTier: 'urban', industry: '', smallLowProfit: false, notes: '', createdAt: '' } as FaLedger;
  const rules = defaultExpenseRules();
  const docs: FaDoc[] = input.lines.map((r) => {
    const kind = invoiceKindOf(r.invoiceKind, !!r.invoiceNo);
    const d: FaDoc = {
      id: `r${r.row}`, fileName: `#${r.row}`, path: '', kind, direction: 'unknown', invoiceCode: r.invoiceCode || undefined, invoiceNo: r.invoiceNo || undefined,
      date: r.invoiceDate || undefined, sellerName: r.sellerName || undefined, sellerTaxId: r.sellerTaxId || undefined, buyerName: r.buyerName || undefined,
      buyerTaxId: r.buyerTaxId || undefined, amount: yuan(r.amount), tax: yuan(r.tax), total: yuan(r.total), taxRate: r.taxRate, items: [],
      category: canonicalCategory(r.category), fieldSource: {}, checks: [], text: '', status: 'recognized', claimId: r.claimNo, createdAt: '',
    };
    d.direction = directionOf(d, ledger);
    return d;
  });
  for (const d of docs) d.checks = checkDoc(d, ledger, docs.filter((o) => o.id !== d.id), asOf);

  const byClaim = new Map<string, ExpenseClaimRow[]>();
  for (const r of input.lines) byClaim.set(r.claimNo, [...(byClaim.get(r.claimNo) || []), r]);
  const flagsByRow = new Map<number, FauFlag[]>();
  const push = (row: number, f: FauFlag) => {
    const list = flagsByRow.get(row) || [];
    if (!list.some((x) => x.code === f.code)) list.push(f);
    flagsByRow.set(row, list);
  };
  if (!input.anomalyOnly) {
    for (const [claimNo, rows] of byClaim) {
      const claim: FaExpenseClaim = {
        id: claimNo, employee: rows[0].employee, dept: rows[0].dept, level: rows[0].level, reason: '', total: 0, verdict: 'pending', rejectReasons: [], createdAt: '',
        items: rows.map((r) => ({ docId: `r${r.row}`, category: canonicalCategory(r.category), amount: yuan(r.total), checks: [] })),
      };
      const reviewed = reviewClaim(claim, docs, { ledger, rules, allDocs: docs, monthUsed: 0, today: asOf });
      for (const it of reviewed.items) {
        const row = Number(it.docId.slice(1));
        const doc = docs.find((d) => d.id === it.docId)!;
        for (const c of [...doc.checks, ...it.checks]) {
          if (c.level === 'ok' || SKIP_CODES.has(c.code)) continue;
          const params: Record<string, string | number> = {};
          if (c.code === 'expired' && doc.date) { params.n = daysBetween(doc.date, asOf); params.m = rules.validityDays; }
          push(row, { code: c.code in CODE_KNOWN ? `inv.${c.code}` : 'inv.other', level: c.level === 'error' ? 'block' : 'warn', params: c.code in CODE_KNOWN ? params : { p0: c.code } });
        }
      }
    }
    for (const r of input.lines) {
      // 超标率分档（policy-compliance-check）
      const cat = canonicalCategory(r.category);
      const rule = rules.rules.find((x) => x.category === cat);
      const capYuan = rule ? (rule.capByLevel?.[r.level] ?? rule.perItemCap) : 0;
      const cap = Math.round(capYuan * 100);
      if (cap > 0 && r.total > cap) {
        const over = (r.total - cap) / cap;
        const code = over <= (th['over.minorPct'] ?? 0.05) ? 'exp.over_minor' : over <= (th['over.reviewPct'] ?? 0.2) ? 'exp.over_review' : 'exp.over_reject';
        push(r.row, { code, level: code === 'exp.over_reject' ? 'block' : 'warn', params: { p0: `${(over * 100).toFixed(1)}%`, p1: fmtYuan(cap) } });
      }
      // 提交时限（必检项六）
      if (r.submitDate && r.invoiceDate) {
        const days = daysBetween(r.invoiceDate, r.submitDate);
        if (days > (th['period.rejectDays'] ?? 90)) push(r.row, { code: 'exp.late_reject', level: 'block', params: { n: days } });
        else if (days > (th['period.okDays'] ?? 30)) push(r.row, { code: 'exp.late_warn', level: 'warn', params: { n: days } });
      }
      if (r.total > (th['escalate.single'] ?? 10_000_000)) push(r.row, { code: 'exp.escalate_single', level: 'warn' });
    }
  }
  const lines: FauExpenseLine[] = input.lines.map((r) => {
    const line: FauExpenseLine = {
      row: r.row, claimNo: r.claimNo, employee: r.employee, dept: r.dept, category: r.category, invoiceNo: r.invoiceNo, invoiceDate: r.invoiceDate,
      submitDate: r.submitDate, seller: r.sellerName, total: r.total, tax: r.tax, flags: flagsByRow.get(r.row) || [],
    };
    if (r.qr) {
      line.qr = checkZatcaQr(r.qr, { sellerName: r.sellerName, sellerTaxId: r.sellerTaxId, invoiceDate: r.invoiceDate, total: r.total, tax: r.tax }, th['qr.tol'] ?? 1);
      if (!line.qr.ok) line.flags.push(line.qr.problems.includes('decode')
        ? { code: 'exp.qr_invalid', level: 'block' }
        : { code: 'exp.qr_mismatch', level: 'block', params: { p0: line.qr.problems.join(', ') } });
    }
    return line;
  });

  const anomalies = scanAnomalies(input.lines, lines, th);
  const anomalyRows = new Set(anomalies.filter((a) => a.level === 'block').flatMap((a) => a.rows));
  const claims: FauExpenseClaimResult[] = [...byClaim.entries()].map(([claimNo, rows]) => {
    const ls = lines.filter((l) => l.claimNo === claimNo);
    const flags = ls.flatMap((l) => l.flags);
    const escalate = flags.some((f) => f.code === 'exp.qr_mismatch' || f.code === 'exp.qr_invalid' || f.code === 'exp.escalate_single') || rows.some((r) => anomalyRows.has(r.row));
    const verdict: FauClaimVerdict = escalate ? 'escalate' : flags.some((f) => f.level === 'block') ? 'reject' : flags.some((f) => f.level === 'warn') ? 'review' : 'pass';
    return { claimNo, employee: rows[0].employee, dept: rows[0].dept, total: rows.reduce((s, r) => s + r.total, 0), verdict, rows: rows.map((r) => r.row), reasons: flags };
  });
  const counts = Object.fromEntries(FAU_CLAIM_VERDICTS.map((v) => [v, claims.filter((c) => c.verdict === v).length])) as Record<FauClaimVerdict, number>;
  const escalations: FauMsg[] = [];
  for (const a of anomalies.filter((x) => x.level === 'block')) escalations.push(msg(ANOMALY_ESC[a.code] || i18nKey('异常模式：{p1}，{n} 笔'), { p1: a.subject, n: a.count }));
  for (const l of lines.filter((x) => x.qr && !x.qr.ok)) escalations.push(msg(i18nKey('第 {n} 行 ZATCA 二维码与票面不一致，疑似假票或录入错误'), { n: l.row }));
  for (const l of lines.filter((x) => x.flags.some((f) => f.code === 'exp.escalate_single'))) escalations.push(msg(i18nKey('第 {n} 行单笔报销 {p0} 超过升级门槛'), { n: l.row, p0: fmtYuan(l.total) }));
  return {
    asOf, lines, claims, anomalies, counts,
    totals: { amount: lines.reduce((s, l) => s + l.total, 0), flagged: lines.filter((l) => l.flags.length).reduce((s, l) => s + l.total, 0) },
    escalations,
  };
}

/** 财务智能体的结论码（有对应的本方案词条） */
const CODE_KNOWN: Record<string, true> = Object.fromEntries([
  'duplicate', 'title', 'title_wrong', 'title_unknown', 'expired', 'cross_year', 'no_date', 'need_special', 'no_rule', 'not_invoice', 'sum_mismatch', 'rate_mismatch',
  'items_mismatch', 'uscc_invalid', 'future_date', 'old_date', 'red_letter', 'no_number', 'no_total', 'normal_no_deduct', 'missing',
].map((c) => [c, true]));

/** 阻断级异常模式的升级消息（整句是词典 key，主体与笔数插值） */
const ANOMALY_ESC: Partial<Record<FauAnomaly['code'], string>> = {
  high_frequency: i18nKey('高频异常员工：{p1}，本月 {n} 笔有问题，列入关注名单'),
  split: i18nKey('疑似拆单规避审批：{p1}，{n} 笔'),
  supplier_concentration: i18nKey('供应商集中：{p1}，30 天内 {n} 笔，须查白名单'),
  duplicate: i18nKey('同票多报：发票 {p1} 出现 {n} 次'),
};

const monthOf = (r: ExpenseClaimRow) => (r.submitDate || r.invoiceDate || r.expenseDate).slice(0, 7);
const dayOf = (r: ExpenseClaimRow) => r.invoiceDate || r.expenseDate || r.submitDate;

/** 跨单据二次扫描（dispute-identification 六个模式 + 第 5.6 节要求的周末 / 整数 / 连号 / 同票多报） */
export function scanAnomalies(rows: ExpenseClaimRow[], lines: FauExpenseLine[], th: Record<string, number>): FauAnomaly[] {
  const out: FauAnomaly[] = [];
  const add = (code: FauAnomaly['code'], level: FauAnomaly['level'], subject: string, rs: ExpenseClaimRow[]) =>
    out.push({ code, level, subject, rows: rs.map((r) => r.row), amount: rs.reduce((s, r) => s + r.total, 0), count: rs.length });
  const group = <K>(key: (r: ExpenseClaimRow) => K) => {
    const m = new Map<K, ExpenseClaimRow[]>();
    for (const r of rows) { const k = key(r); if (k) m.set(k, [...(m.get(k) || []), r]); }
    return m;
  };
  const flagsOf = (r: ExpenseClaimRow) => lines.find((l) => l.row === r.row)?.flags.filter((f) => f.level !== 'info') || [];

  // ① 高频异常员工：同一员工同一自然月，某一类异常 ≥ 2 次，或合计 ≥ 3 次
  for (const [k, rs] of group((r) => `${r.employee}|${monthOf(r)}`)) {
    const flagged = rs.filter((r) => flagsOf(r).length);
    const byCode = new Map<string, number>();
    for (const r of flagged) for (const f of flagsOf(r)) byCode.set(f.code, (byCode.get(f.code) || 0) + 1);
    if ([...byCode.values()].some((n) => n >= (th['hf.single'] ?? 2)) || flagged.length >= (th['hf.total'] ?? 3)) add('high_frequency', 'block', k.split('|')[0], flagged);
  }
  // ② 拆单 / 临界规避：同一员工同一供应商 30 天内 ≥ 3 笔且每笔低于审批阈值；或同一员工 30 天内 ≥ 2 笔贴近审批边界
  const win = th['split.windowDays'] ?? 30;
  const under = th['split.under'] ?? 500_000;
  const band = th['split.boundaryBand'] ?? 0.02;
  const bounds = [under, under * 2];
  const windowed = (rs: ExpenseClaimRow[], need: number): ExpenseClaimRow[] => {
    const s = [...rs].filter((r) => dayOf(r)).sort((a, b) => dayOf(a).localeCompare(dayOf(b)));
    for (let i = 0; i < s.length; i += 1) {
      const end = addDays(dayOf(s[i]), win);
      const w = s.filter((r) => dayOf(r) >= dayOf(s[i]) && dayOf(r) <= end);
      if (w.length >= need) return w;
    }
    return [];
  };
  for (const [k, rs] of group((r) => (r.sellerName ? `${r.employee}|${norm(r.sellerName)}` : ''))) {
    const w = windowed(rs.filter((r) => r.total < under), th['split.count'] ?? 3);
    if (w.length) add('split', 'block', `${k.split('|')[0]} · ${w[0].sellerName}`, w);
  }
  for (const [emp, rs] of group((r) => r.employee)) {
    const near = rs.filter((r) => bounds.some((b) => r.total < b && r.total >= b * (1 - band)));
    const w = windowed(near, 2);
    if (w.length) add('split', 'warn', emp, w);
  }
  // ③ 供应商集中：同一供应商（所有员工）30 天内 ≥ 5 笔且合计 ≥ 门槛
  for (const [, rs] of group((r) => norm(r.sellerName))) {
    const w = windowed(rs, th['supplier.count'] ?? 5);
    if (w.length && w.reduce((s, r) => s + r.total, 0) >= (th['supplier.amount'] ?? 20_000_000)) add('supplier_concentration', 'block', w[0].sellerName, w);
  }
  // ⑥ 跨期规律：同一员工提交距费用发生 ≥ 60 天的 ≥ 3 次
  for (const [emp, rs] of group((r) => r.employee)) {
    const late = rs.filter((r) => r.submitDate && (r.expenseDate || r.invoiceDate) && daysBetween(r.expenseDate || r.invoiceDate, r.submitDate) >= (th['cross.days'] ?? 60));
    if (late.length >= (th['cross.count'] ?? 3)) add('cross_period', 'warn', emp, late);
  }
  // 周末票据（源未给规则：只列出供抽查，不阻断）
  for (const [emp, rs] of group((r) => r.employee)) {
    const wk = rs.filter((r) => dayOf(r) && [0, 6].includes(new Date(`${dayOf(r)}T00:00:00Z`).getUTCDay()));
    if (wk.length) add('weekend', 'warn', emp, wk);
  }
  // 整数金额（源未给规则：≥ 起点且是单位的整数倍）
  const unit = th['round.unit'] ?? 10_000;
  for (const [emp, rs] of group((r) => r.employee)) {
    const rd = rs.filter((r) => r.total >= (th['round.min'] ?? 100_000) && r.total % unit === 0);
    if (rd.length) add('round_amount', 'warn', emp, rd);
  }
  // 发票连号：同一开票方的数字发票号相邻（差 1）
  for (const [, rs] of group((r) => norm(r.sellerName))) {
    // 同长度的数字串按字典序就是数值序；只比最后 9 位（前缀相同），跨 9 位进位的极少数情况不认
    const numbered = rs.filter((r) => /^\d{6,20}$/.test(r.invoiceNo)).sort((a, b) => a.invoiceNo.length - b.invoiceNo.length || a.invoiceNo.localeCompare(b.invoiceNo));
    const next = (a: string, b: string) => a.length === b.length && a.slice(0, -9) === b.slice(0, -9) && Number(b.slice(-9)) - Number(a.slice(-9)) === 1;
    const hit = new Set<ExpenseClaimRow>();
    for (let i = 1; i < numbered.length; i += 1) {
      if (next(numbered[i - 1].invoiceNo, numbered[i].invoiceNo)) { hit.add(numbered[i - 1]); hit.add(numbered[i]); }
    }
    if (hit.size) add('sequential', 'warn', rs[0].sellerName, [...hit]);
  }
  // 同票多报：同一发票号（含代码）出现在多行
  for (const [no, rs] of group((r) => (r.invoiceNo ? `${r.invoiceCode}|${r.invoiceNo}` : ''))) {
    if (rs.length > 1) add('duplicate', 'block', no.split('|')[1], rs);
  }
  return out;
}
