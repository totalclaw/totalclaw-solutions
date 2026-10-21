/**
 * A3 应收与账龄（aging-analysis-ar + collection-automation + credit-assessment + 判断框架类型五）。纯函数，金额一律分。
 *
 *   账龄：逾期天数 = 截止日 − 到期日（到期日 = 表里的到期日，没有就开票日 + 账期）；宽限期内不算逾期；
 *         分层 未逾期 / 1–30 / 31–60 / 61–90 / 91–180 / 181–365 / 1 年以上；
 *   坏账准备：按账龄法比例（0 / 10% / 30% / 50% / 100%），金额 = 未清 × 比例（四舍五入到分），汇总等于明细之和；
 *   催款阶段：按客户最长逾期天数落 1–5 阶段，只生成函件草稿（不发送）；
 *   信用评估：付款历史（逾期次数 / 最长逾期）定基础等级，资产负债率 > 70% 或经营现金流为负降一档，登记了高风险信号直接 D；
 *             建议额度 = 近 N 个月月均开票额 × 建议账期月数（源未给公式，按账期内的应收余额估算），不超过申请额度。
 */
import { i18nKey } from '@totalclaw/i18n';
import type {
  FauAgingBucket, FauArBucketLine, FauArCustomer, FauArItem, FauArResult, FauCreditAssessment, FauCreditGrade, FauDunningLetter,
  FauDunningStage, FauFlag, FauMsg, FauPayHistory, FauRiskLevel,
} from '@totalclaw/ipc-contracts';
import { FAU_AGING_BUCKETS } from '@totalclaw/ipc-contracts';
import type { OpenItemRow, PartyRow, ReceiptRow } from '../../../subledgerTypes';
import { addDays, addMonths, daysBetween, fmtYuan, msg } from '../common';

export interface ArInput {
  asOf: string;
  items: OpenItemRow[];
  receipts: ReceiptRow[];
  customers: PartyRow[];
  /** 上一期已签核的逾期率（读项目链历史） */
  priorOverdueRate: number | null;
  th: Record<string, number>;
  /** 是否做信用评估（信用模式或全面模式） */
  credit: boolean;
}

const normName = (s: string) => String(s || '').replace(/\s+/g, '').toLowerCase();

export function bucketOf(overdueDays: number): FauAgingBucket {
  if (overdueDays <= 0) return 'current';
  if (overdueDays <= 30) return 'd1_30';
  if (overdueDays <= 60) return 'd31_60';
  if (overdueDays <= 90) return 'd61_90';
  if (overdueDays <= 180) return 'd91_180';
  if (overdueDays <= 365) return 'd181_365';
  return 'over365';
}

export function provisionRateOf(bucket: FauAgingBucket, th: Record<string, number>): number {
  switch (bucket) {
    case 'current': return 0;
    case 'd1_30': return th['provision.d1_30'] ?? 0;
    case 'd31_60': case 'd61_90': return th['provision.d31_90'] ?? 0.1;
    case 'd91_180': return th['provision.d91_180'] ?? 0.3;
    case 'd181_365': return th['provision.d181_365'] ?? 0.5;
    default: return th['provision.over365'] ?? 1;
  }
}

export function stageOf(maxOverdueDays: number): FauDunningStage {
  if (maxOverdueDays <= 0) return 0;
  if (maxOverdueDays <= 30) return 1;
  if (maxOverdueDays <= 60) return 2;
  if (maxOverdueDays <= 90) return 3;
  if (maxOverdueDays <= 180) return 4;
  return 5;
}

/** 到期日：表里有用表里的；否则开票日 + 账期（明细账期优先，其次客户档案账期） */
export function dueDateOf(it: OpenItemRow, termDays: number | null): string {
  if (it.dueDate) return it.dueDate;
  const term = it.termDays ?? termDays;
  return it.docDate ? addDays(it.docDate, term ?? 0) : '';
}

export function overdueDaysOf(due: string, asOf: string, grace: number): number {
  if (!due) return 0;
  const d = daysBetween(due, asOf);
  return d > grace ? d : 0;
}

function emptyBuckets(): Record<FauAgingBucket, number> {
  return Object.fromEntries(FAU_AGING_BUCKETS.map((b) => [b, 0])) as Record<FauAgingBucket, number>;
}

export function arAging(input: ArInput): FauArResult {
  const { th, asOf } = input;
  const grace = th['grace.days'] ?? 3;
  const master = new Map(input.customers.map((c) => [normName(c.name), c]));
  const items: FauArItem[] = input.items
    .filter((r) => r.open !== 0)
    .map((r) => {
      const due = dueDateOf(r, master.get(normName(r.party))?.termDays ?? null);
      const overdueDays = r.open > 0 ? overdueDaysOf(due, asOf, grace) : 0;
      const bucket = bucketOf(overdueDays);
      const provisionRate = r.open > 0 ? provisionRateOf(bucket, th) : 0;
      return {
        row: r.row, customer: r.party, docNo: r.docNo, docDate: r.docDate, dueDate: due, amount: r.amount, open: r.open,
        overdueDays, bucket, provisionRate, provision: Math.round(r.open * provisionRate), disputed: r.disputed,
      };
    })
    .sort((a, b) => b.overdueDays - a.overdueDays || b.open - a.open);

  const total = items.reduce((s, i) => s + i.open, 0);
  const overdue = items.filter((i) => i.overdueDays > 0).reduce((s, i) => s + i.open, 0);
  const buckets: FauArBucketLine[] = FAU_AGING_BUCKETS.map((b) => {
    const list = items.filter((i) => i.bucket === b);
    const amount = list.reduce((s, i) => s + i.open, 0);
    return {
      bucket: b, amount, count: list.length, share: total ? amount / total : 0,
      provisionRate: provisionRateOf(b, th), provision: list.reduce((s, i) => s + i.provision, 0),
    };
  });

  const mediumDays = th['risk.mediumDays'] ?? 30;
  const highDays = th['risk.highDays'] ?? 90;
  const utilWarn = th['credit.utilizationWarn'] ?? 0.8;
  const byName = new Map<string, FauArItem[]>();
  for (const i of items) byName.set(i.customer, [...(byName.get(i.customer) || []), i]);
  const customers: FauArCustomer[] = [...byName.entries()].map(([customer, list]) => {
    const byBucket = emptyBuckets();
    for (const i of list) byBucket[i.bucket] += i.open;
    const open = list.reduce((s, i) => s + i.open, 0);
    const od = list.filter((i) => i.overdueDays > 0).reduce((s, i) => s + i.open, 0);
    const maxOverdueDays = Math.max(0, ...list.map((i) => i.overdueDays));
    const m = master.get(normName(customer));
    const flags: FauFlag[] = [];
    const limit = m?.creditLimit ?? null;
    const utilization = limit ? open / limit : null;
    if (utilization != null && utilization > utilWarn) flags.push({ code: 'ar.utilization', level: utilization > 1 ? 'block' : 'warn', params: { p0: `${(utilization * 100).toFixed(1)}%` } });
    if (m?.riskFlags) flags.push({ code: 'ar.risk_signal', level: 'block', params: { p0: m.riskFlags } });
    if (list.some((i) => i.disputed)) flags.push({ code: 'ar.disputed', level: 'warn' });
    const risk: FauRiskLevel = maxOverdueDays > highDays || m?.riskFlags ? 'high' : maxOverdueDays > mediumDays ? 'medium' : 'low';
    return {
      customer, open, overdue: od, maxOverdueDays, byBucket, provision: list.reduce((s, i) => s + i.provision, 0),
      risk, stage: stageOf(maxOverdueDays), creditLimit: limit, utilization, flags,
    };
  }).sort((a, b) => b.overdue - a.overdue || b.open - a.open);
  const topN = th['top.n'] ?? 5;
  const top = customers.filter((c) => c.overdue > 0).slice(0, topN).map((c) => c.customer);

  const letters: FauDunningLetter[] = customers.filter((c) => c.stage > 0).map((c) => ({
    customer: c.customer, stage: c.stage, overdue: c.overdue,
    items: (byName.get(c.customer) || []).filter((i) => i.overdueDays > 0).map((i) => ({ docNo: i.docNo, dueDate: i.dueDate, open: i.open, overdueDays: i.overdueDays })),
  }));

  const provision = items.reduce((s, i) => s + i.provision, 0);
  const overdueRate = total ? overdue / total : 0;
  const escalations: FauMsg[] = [];
  const single = th['esc.singleCustomerOverdue'] ?? 100_000_000;
  for (const c of customers) {
    if (c.overdue > single) escalations.push(msg(i18nKey('客户 {p0} 逾期 {p1}，超过升级门槛'), { p0: c.customer, p1: fmtYuan(c.overdue) }));
    if (c.maxOverdueDays > highDays) escalations.push(msg(i18nKey('客户 {p0} 最长逾期 {n} 天（超过 {m} 天），须制定专门催款计划'), { p0: c.customer, n: c.maxOverdueDays, m: highDays }));
    if (c.flags.some((f) => f.code === 'ar.risk_signal')) escalations.push(msg(i18nKey('客户 {p0} 登记了高风险信号，须评估停止发货与坏账风险'), { p0: c.customer }));
  }
  if (provision > (th['esc.newProvision'] ?? 50_000_000)) escalations.push(msg(i18nKey('坏账准备测算 {p0}，超过升级门槛'), { p0: fmtYuan(provision) }));
  if (input.priorOverdueRate != null && overdueRate - input.priorOverdueRate > (th['esc.overdueRateRise'] ?? 0.1)) {
    escalations.push(msg(i18nKey('逾期率由上期 {p0} 升到 {p1}'), { p0: `${(input.priorOverdueRate * 100).toFixed(1)}%`, p1: `${(overdueRate * 100).toFixed(1)}%` }));
  }

  const credit = input.credit ? creditAssessment(input, items) : [];
  for (const c of credit.filter((x) => x.grade === 'D')) escalations.push(msg(i18nKey('客户 {p0} 信用评估为 D 级，不建议授予信用'), { p0: c.customer }));

  return { asOf, total, overdue, overdueRate, priorOverdueRate: input.priorOverdueRate, buckets, items, customers, top, provision, letters, credit, escalations };
}

const GRADES: FauCreditGrade[] = ['A', 'B', 'C', 'D'];

/** 付款历史：收款记录按发票号对上明细的到期日算迟付天数；没有收款记录时只看当前逾期 */
function paymentHistory(customer: string, input: ArInput, items: FauArItem[]): { history: FauPayHistory; late: number; maxLate: number; onTime: number | null } {
  const { th } = input;
  const grace = th['grace.days'] ?? 3;
  const termDays = input.customers.find((c) => normName(c.name) === normName(customer))?.termDays ?? null;
  const dueByDoc = new Map(input.items.filter((i) => normName(i.party) === normName(customer) && i.docNo).map((i) => [i.docNo, dueDateOf(i, termDays)]));
  const recs = input.receipts.filter((r) => normName(r.party) === normName(customer) && r.docNo && dueByDoc.get(r.docNo));
  const lateDays = recs.map((r) => overdueDaysOf(dueByDoc.get(r.docNo)!, r.date, grace));
  const currentOverdue = items.filter((i) => normName(i.customer) === normName(customer) && i.overdueDays > 0);
  const late = lateDays.filter((d) => d > 0).length + currentOverdue.length;
  const maxLate = Math.max(0, ...lateDays, ...currentOverdue.map((i) => i.overdueDays));
  const onTime = recs.length ? lateDays.filter((d) => d === 0).length / recs.length : null;
  if (!recs.length && !items.some((i) => normName(i.customer) === normName(customer))) return { history: 'unknown', late, maxLate, onTime };
  let history: FauPayHistory;
  if (currentOverdue.some((i) => i.overdueDays > (th['credit.badDays'] ?? 90))) history = 'bad';
  else if (late === 0) history = 'excellent';
  else if (late <= (th['credit.historyGoodMax'] ?? 2)) history = 'good';
  else if (late <= (th['credit.historyFairMax'] ?? 5)) history = 'fair';
  else history = 'poor';
  return { history, late, maxLate, onTime };
}

export function creditAssessment(input: ArInput, items: FauArItem[]): FauCreditAssessment[] {
  const { th, asOf } = input;
  const names = new Map<string, string>();
  for (const c of input.customers) names.set(normName(c.name), c.name);
  for (const i of input.items) if (!names.has(normName(i.party))) names.set(normName(i.party), i.party);
  const months = Math.max(1, th['credit.months'] ?? 12);
  const from = `${addMonths(asOf.slice(0, 7), -(months - 1))}-01`;
  const l1 = th['credit.approvalL1'] ?? 10_000_000;
  const l2 = th['credit.approvalL2'] ?? 50_000_000;
  return [...names.entries()].map(([key, customer]) => {
    const m = input.customers.find((c) => normName(c.name) === key);
    const h = paymentHistory(customer, input, items);
    const reasons: FauFlag[] = [];
    let idx = h.history === 'excellent' || h.history === 'unknown' ? 0 : h.history === 'good' ? 1 : h.history === 'fair' ? 2 : 3;
    if (h.history === 'unknown') reasons.push({ code: 'credit.no_history', level: 'info' });
    if (h.late) reasons.push({ code: 'credit.late', level: 'warn', params: { n: h.late, m: h.maxLate } });
    if (m?.debtRatio != null && m.debtRatio > (th['credit.debtRatioHigh'] ?? 0.7)) { idx += 1; reasons.push({ code: 'credit.high_debt', level: 'warn', params: { p0: `${(m.debtRatio * 100).toFixed(1)}%` } }); }
    if (m?.cashFlowPositive === false) { idx += 1; reasons.push({ code: 'credit.negative_cf', level: 'warn' }); }
    const highRisk = m?.riskFlags ? [m.riskFlags] : [];
    if (highRisk.length) { idx = 3; reasons.push({ code: 'credit.high_risk', level: 'block', params: { p0: m!.riskFlags } }); }
    const grade = GRADES[Math.min(3, idx)];
    const termDays = th[`credit.term${grade}`] ?? 0;
    // 近 N 个月按开票日的开票额（明细里有就算，含已结清的行）
    const billed = input.items.filter((i) => normName(i.party) === key && i.docDate >= from && i.docDate <= asOf).reduce((s, i) => s + Math.max(0, i.amount), 0);
    const avgMonthlyBilling = Math.round(billed / months);
    let suggested = Math.round(avgMonthlyBilling * (termDays / 30));
    const requested = m?.requestedLimit ?? null;
    if (requested != null && suggested > requested) suggested = requested;
    if (grade === 'D') suggested = 0;
    const approval = suggested <= l1 ? 'ar_supervisor' : suggested <= l2 ? 'credit_manager' : 'cfo';
    const current = m?.creditLimit ?? null;
    const open = items.filter((i) => normName(i.customer) === key).reduce((s, i) => s + i.open, 0);
    if (current != null && open > current) {
      const over = current ? (open - current) / current : 1;
      reasons.push({ code: over <= (th['credit.overLimitTol'] ?? 0.1) ? 'credit.over_limit_minor' : 'credit.over_limit', level: 'warn', params: { p0: `${(over * 100).toFixed(1)}%` } });
    }
    return {
      customer, history: h.history, lateCount: h.late, maxLateDays: h.maxLate, onTimeRate: h.onTime,
      debtRatio: m?.debtRatio ?? null, cashFlowPositive: m?.cashFlowPositive ?? null, highRisk, grade, termDays,
      currentLimit: current, requestedLimit: requested, avgMonthlyBilling, suggestedLimit: suggested, approval, reasons,
    };
  });
}
