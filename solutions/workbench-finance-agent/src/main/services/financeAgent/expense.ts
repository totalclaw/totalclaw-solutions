/**
 * 费用报销智能体（纯函数）：报销单的票据逐张过规则 → 合规 / 驳回 / 待人工，并按部门归集。
 *
 * 规则（标准、额度、票据有效期、重复票、抬头、专票要求）全部可在设置里改；
 * 结论是预审意见，最终通过 / 驳回由财务点。
 */
import { t as i18nT } from '@totalclaw/i18n';
import type {
  FaCheck, FaDoc, FaExpenseClaim, FaExpenseItem, FaExpenseRules, FaLedger,
} from '@totalclaw/ipc-contracts';
import { CATEGORY_RULES, account, daysBetween, fmt, localDate, round2, sum } from './common';
import { findDuplicate } from './invoice';

export function defaultExpenseRules(): FaExpenseRules {
  const cap: Record<string, number> = {};
  // 单张上限的起步值：差旅 3000、招待 2000、办公 1000，其它不限；级别覆盖按需加
  const starts: Record<string, number> = { '560202': 3000, '560203': 2000, '560201': 1000 };
  for (const r of CATEGORY_RULES) cap[r.category] = starts[r.account] || 0;
  return {
    rules: CATEGORY_RULES.filter((r) => /^56/.test(r.account)).map((r) => ({
      category: r.category, perItemCap: cap[r.category], accountName: account(r.account).name,
    })),
    monthlyQuota: {},
    validityDays: 180,
    allowCrossYearUntilJan31: true,
    requireCompanyTitle: true,
  };
}

export interface ClaimContext {
  ledger: FaLedger;
  rules: FaExpenseRules;
  /** 本账套全部票据（查重用，包括别的报销单里的） */
  allDocs: FaDoc[];
  /** 本员工本月此前已通过的报销金额 */
  monthUsed: number;
  today?: string;
}

function itemChecks(doc: FaDoc, claim: Pick<FaExpenseClaim, 'level' | 'id'>, ctx: ClaimContext): FaCheck[] {
  const out: FaCheck[] = [];
  const add = (code: string, level: FaCheck['level'], message: string) => out.push({ code, level, message });
  const today = ctx.today || localDate();
  const rule = ctx.rules.rules.find((r) => r.category === doc.category);

  // 识别阶段的硬错误（金额对不上、税号错、未来日期）直接带过来
  for (const c of doc.checks) if (c.level === 'error' && c.code !== 'duplicate' && c.code !== 'title_wrong') add(c.code, 'error', c.message);

  const dup = findDuplicate(doc, ctx.allDocs.filter((d) => d.claimId !== claim.id || d.id !== doc.id));
  if (dup) {
    add('duplicate', 'error', dup.claimId
      ? i18nT('重复报销：这张票已在另一张报销单里（{p0}）', { p0: dup.fileName })
      : i18nT('重复报销：这张票已在「凭证处理」登记入账（{p0}）', { p0: dup.fileName }));
  }

  if (ctx.rules.requireCompanyTitle && (doc.kind === 'vat_special' || doc.kind === 'vat_normal')) {
    if (doc.direction !== 'in') add('title', 'error', i18nT('发票抬头不是本公司（购买方：{p0}）', { p0: doc.buyerName || i18nT('未识别') }));
  }

  if (doc.date) {
    const age = daysBetween(doc.date, today);
    const crossYearOk = ctx.rules.allowCrossYearUntilJan31 && Number(doc.date.slice(0, 4)) === Number(today.slice(0, 4)) - 1 && today.slice(5) <= '01-31';
    if (age > ctx.rules.validityDays && !crossYearOk) add('expired', 'error', i18nT('票据开具已 {n} 天，超过 {m} 天有效期', { n: age, m: ctx.rules.validityDays }));
    else if (doc.date.slice(0, 4) !== today.slice(0, 4) && !crossYearOk) add('cross_year', 'error', i18nT('跨年票据，超过次年 1 月 31 日报销期限'));
  } else add('no_date', 'warn', i18nT('没有读到开票日期，请人工确认有效期'));

  if (rule) {
    const cap = rule.capByLevel?.[claim.level] ?? rule.perItemCap;
    if (cap > 0 && doc.total > cap) add('over_cap', 'error', i18nT('{p0}单张 {a} 超过标准 {b}', { p0: doc.category, a: fmt(doc.total), b: fmt(cap) }));
    if (rule.requireSpecial && doc.kind !== 'vat_special') add('need_special', 'error', i18nT('{p0}要求取得增值税专用发票', { p0: doc.category }));
  } else {
    add('no_rule', 'warn', i18nT('类别「{p0}」没有报销标准，需人工判断', { p0: doc.category }));
  }
  if (doc.kind === 'receipt' || doc.kind === 'other') add('not_invoice', 'warn', i18nT('不是正式发票（收据 / 小票），按制度需人工判断能否入账'));
  if (!out.some((c) => c.level !== 'ok')) add('pass', 'ok', i18nT('符合规则'));
  return out;
}

/** 整张报销单预审 */
export function reviewClaim(claim: FaExpenseClaim, docs: FaDoc[], ctx: ClaimContext): FaExpenseClaim {
  const items: FaExpenseItem[] = claim.items.map((it) => {
    const doc = docs.find((d) => d.id === it.docId);
    if (!doc) return { ...it, checks: [{ code: 'missing', level: 'error', message: i18nT('票据文件已删除') }] };
    return { docId: doc.id, category: doc.category, amount: doc.total, date: doc.date, checks: itemChecks(doc, claim, ctx) };
  });
  const total = sum(items.map((i) => i.amount));
  const reasons: string[] = [];
  for (const it of items) {
    const doc = docs.find((d) => d.id === it.docId);
    for (const c of it.checks) if (c.level === 'error') reasons.push(`${doc?.fileName || it.docId}：${c.message}`);
  }
  const quota = ctx.rules.monthlyQuota[claim.level] || 0;
  if (quota > 0 && ctx.monthUsed + total > quota) {
    reasons.push(i18nT('本月额度 {a}，已报 {b}，本单 {c}，超出 {d}', { a: fmt(quota), b: fmt(ctx.monthUsed), c: fmt(total), d: fmt(round2(ctx.monthUsed + total - quota)) }));
  }
  const hasWarn = items.some((i) => i.checks.some((c) => c.level === 'warn'));
  const verdict: FaExpenseClaim['verdict'] = !items.length ? 'pending' : reasons.length ? 'reject' : hasWarn ? 'review' : 'pass';
  return { ...claim, items, total, verdict, rejectReasons: reasons };
}

/** 驳回 / 通过通知（固定模板，数字从结果注入） */
export function claimNotice(claim: FaExpenseClaim, ledgerName: string): string {
  if (claim.verdict === 'pass' || claim.decision === 'approved') {
    return i18nT('{p0}：你的报销单（{p1}，合计 {p2} 元，{n} 张票据）已通过预审，进入付款流程。', { p0: claim.employee, p1: claim.reason || i18nT('费用报销'), p2: fmt(claim.total), n: claim.items.length });
  }
  const lines = claim.rejectReasons.map((r, i) => `${i + 1}. ${r}`).join('\n');
  return i18nT('{p0}：你的报销单（{p1}，合计 {p2} 元）预审未通过，请按以下原因修改后重新提交：\n{p3}\n\n—— {p4} 财务', { p0: claim.employee, p1: claim.reason || i18nT('费用报销'), p2: fmt(claim.total), p3: lines || i18nT('需人工复核'), p4: ledgerName });
}

/** 按部门 × 类别归集（只算已通过的） */
export function deptSummary(claims: FaExpenseClaim[]): Array<{ dept: string; category: string; amount: number; count: number }> {
  const map = new Map<string, { dept: string; category: string; amount: number; count: number }>();
  for (const c of claims) {
    if (!(c.decision === 'approved' || (!c.decision && c.verdict === 'pass'))) continue;
    for (const it of c.items) {
      const k = `${c.dept}\u0000${it.category}`;
      const g = map.get(k) || { dept: c.dept || i18nT('未填部门'), category: it.category, amount: 0, count: 0 };
      g.amount = round2(g.amount + it.amount);
      g.count += 1;
      map.set(k, g);
    }
  }
  return [...map.values()].sort((a, b) => a.dept.localeCompare(b.dept) || b.amount - a.amount);
}
