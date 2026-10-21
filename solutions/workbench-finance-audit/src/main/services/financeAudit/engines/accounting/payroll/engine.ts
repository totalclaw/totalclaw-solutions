/**
 * A7 薪酬核算（payroll-master + payroll-calculation + social-insurance-review + tax-withholding-review）。纯函数，金额一律分。
 *
 * 中国：应发 = 各明细项之和；个人社保公积金 = 基数（按上下限截取）× 个人比例；个税按累计预扣法，**直接调用财务智能体
 *       tax.ts::computeIit**（与它同一口径）；实发 = 应发 − 个人社保公积金 − 个税 − 其他扣款；单位负担按单位比例。
 * 沙特：GOSI 缴费工资 = 基本工资 + 住房补贴，按上下限截取；沙特籍员工扣年金 + SANED，单位另交年金 + SANED + 职业危害，
 *       非沙特籍只由单位交职业危害；不征个税。期末服务金（《沙特劳动法》第 84 条）：前 5 年每年半个月工资，之后每年一个月，
 *       不满一年按比例；工资取基本工资 + 住房补贴（没有明细时取应发）。比例与上下限在 thresholds/payroll.json，草稿口径待当地审核。
 * 国际：员工 / 单位社保比例参数化，个税只核实发勾稽。
 * 计提分录草稿：工资、单位负担、代扣款、期末服务金，借贷逐张平衡；只出草稿，不过账。
 */
import { i18nKey } from '@totalclaw/i18n';
import type { FauEosb, FauFlag, FauHeadcountChange, FauJeLine, FauMsg, FauPayrollLine, FauPayrollRegime, FauPayrollResult } from '@totalclaw/ipc-contracts';
import { computeIit } from '../../../../financeAgent/tax';
import type { PayrollRow } from '../../../subledgerTypes';
import { daysBetween, fmtYuan, msg, periodEnd } from '../common';

export interface PayrollInput {
  regime: FauPayrollRegime;
  period: string;
  rows: PayrollRow[];
  prior: PayrollRow[] | null;
  /** 中国准则出科目编码 */
  cnCodes: boolean;
  th: Record<string, number>;
}

const yuan = (c: number) => Math.round(c) / 100;
const cents = (y: number) => Math.round(y * 100);
const clamp = (v: number, lo: number, hi: number) => Math.min(hi > 0 ? hi : v, Math.max(lo > 0 ? lo : v, v));

/** 本年第几个月：表里给了就用；本年入职从入职月算起；否则按期间月份 */
export function monthIndexOf(r: PayrollRow, period: string): number {
  if (r.monthIndex && r.monthIndex > 0) return Math.round(r.monthIndex);
  const [y, m] = period.split('-').map(Number);
  if (r.hireDate && Number(r.hireDate.slice(0, 4)) === y) return Math.max(1, m - Number(r.hireDate.slice(5, 7)) + 1);
  return m;
}

/** 期末服务金（第 84 条）：wage × (min(年, 5) × 0.5 + max(年 − 5, 0) × 1) */
export function eosbLiability(wage: number, years: number, th: Record<string, number>): number {
  const first = th['sa.eosbFirstYears'] ?? 5;
  return Math.round(wage * (Math.min(years, first) * (th['sa.eosbFirstRate'] ?? 0.5) + Math.max(years - first, 0) * (th['sa.eosbLaterRate'] ?? 1)));
}

export function serviceYears(start: string, asOf: string): number {
  return Math.max(0, daysBetween(start, asOf)) / 365;
}

function lineCn(r: PayrollRow, period: string, th: Record<string, number>): FauPayrollLine {
  const tol = th['cn.amtTol'] ?? 100;
  const flags: FauFlag[] = [];
  if (r.components != null && Math.abs(r.components - r.gross) > tol) flags.push({ code: 'pay.gross_mismatch', level: 'warn', params: { p0: fmtYuan(r.components), p1: fmtYuan(r.gross) } });
  if (r.socialBase == null) flags.push({ code: 'pay.no_base', level: 'info' });
  const rawBase = r.socialBase ?? r.gross;
  const lo = th['cn.baseLower'] ?? 0;
  const hi = th['cn.baseUpper'] ?? 0;
  let baseFlag: FauPayrollLine['baseFlag'] = lo || hi ? 'ok' : 'unchecked';
  if (lo && rawBase < lo) { baseFlag = 'below'; flags.push({ code: 'pay.base_below', level: 'warn', params: { p0: fmtYuan(rawBase) } }); }
  if (hi && rawBase > hi) { baseFlag = 'above'; flags.push({ code: 'pay.base_above', level: 'warn', params: { p0: fmtYuan(rawBase) } }); }
  const base = clamp(rawBase, lo, hi);
  const fundBase = clamp(r.fundBase ?? rawBase, lo, hi);
  const fundRate = th['cn.fundRate'] ?? 0.07;
  const personalExpected = Math.round(base * (th['cn.pension'] ?? 0.08)) + Math.round(base * (th['cn.medical'] ?? 0.02)) + Math.round(base * (th['cn.unemployment'] ?? 0.005)) + Math.round(fundBase * fundRate);
  const personal = r.socialPersonal == null && r.fundPersonal == null ? null : (r.socialPersonal ?? 0) + (r.fundPersonal ?? 0);
  if (personal != null && Math.abs(personal - personalExpected) > tol) flags.push({ code: 'pay.personal_mismatch', level: 'warn', params: { p0: fmtYuan(personal), p1: fmtYuan(personalExpected) } });
  const iit = computeIit({
    name: r.name, salary: yuan(r.gross), insurance: yuan(personal ?? personalExpected), special: yuan(r.special),
    ytdSalary: yuan(r.ytdIncome), ytdInsurance: yuan(r.ytdInsurance), ytdSpecial: yuan(r.ytdSpecial), ytdTaxPaid: yuan(r.ytdTaxPaid), monthIndex: monthIndexOf(r, period),
  });
  const iitExpected = cents(iit.taxThisMonth ?? 0);
  if (r.iitWithheld != null && Math.abs(r.iitWithheld - iitExpected) > tol) {
    const esc = Math.abs(r.iitWithheld - iitExpected) > (th['cn.iitEscalate'] ?? 10_000);
    flags.push({ code: 'pay.iit_mismatch', level: esc ? 'block' : 'warn', params: { p0: fmtYuan(r.iitWithheld), p1: fmtYuan(iitExpected) } });
  }
  const employer = r.employerBooked ?? (Math.round(base * ((th['cn.erPension'] ?? 0.16) + (th['cn.erUnemployment'] ?? 0.005) + (th['cn.erOther'] ?? 0))) + Math.round(fundBase * fundRate));
  const netExpected = r.gross - (personal ?? personalExpected) - (r.iitWithheld ?? iitExpected) - r.otherDeductions;
  if (r.net != null && Math.abs(r.net - netExpected) > tol) flags.push({ code: 'pay.net_mismatch', level: 'warn', params: { p0: fmtYuan(r.net), p1: fmtYuan(netExpected) } });
  return {
    row: r.row, empId: r.empId, name: r.name, dept: r.dept, gross: r.gross, computedGross: r.components, personal, personalExpected, employer, base: r.socialBase, baseFlag,
    iitWithheld: r.iitWithheld, iitExpected, iitDetail: { taxableYtd: cents(iit.taxableYtd ?? 0), rate: iit.rate ?? 0, quickDeduction: cents(iit.quickDeduction ?? 0) },
    net: r.net, netExpected, flags,
  };
}

function lineSa(r: PayrollRow, asOf: string, th: Record<string, number>): FauPayrollLine & { eosbAccrual: number } {
  const tol = th['sa.amtTol'] ?? 100;
  const flags: FauFlag[] = [];
  if (r.components != null && Math.abs(r.components - r.gross) > tol) flags.push({ code: 'pay.gross_mismatch', level: 'warn', params: { p0: fmtYuan(r.components), p1: fmtYuan(r.gross) } });
  const raw = r.basic != null ? r.basic + (r.housing ?? 0) : r.gross;
  const lo = th['sa.baseMin'] ?? 0;
  const hi = th['sa.baseMax'] ?? 0;
  let baseFlag: FauPayrollLine['baseFlag'] = 'ok';
  if (lo && raw < lo) baseFlag = 'below';
  if (hi && raw > hi) baseFlag = 'above';
  const base = clamp(raw, lo, hi);
  if (r.saudi == null) flags.push({ code: 'pay.no_nationality', level: 'warn' });
  const saudi = r.saudi ?? true;
  const personalExpected = saudi ? Math.round(base * (th['sa.annuityEe'] ?? 0.09)) + Math.round(base * (th['sa.sanedEe'] ?? 0.0075)) : 0;
  const personal = r.socialPersonal;
  if (personal != null && Math.abs(personal - personalExpected) > tol) flags.push({ code: 'pay.gosi_mismatch', level: 'warn', params: { p0: fmtYuan(personal), p1: fmtYuan(personalExpected) } });
  const hazard = Math.round(base * (th['sa.hazardEr'] ?? 0.02));
  const employer = r.employerBooked ?? (saudi ? Math.round(base * (th['sa.annuityEr'] ?? 0.09)) + Math.round(base * (th['sa.sanedEr'] ?? 0.0075)) + hazard : hazard);
  // 期末服务金
  let eosb: FauEosb | undefined;
  let eosbAccrual = 0;
  const start = r.serviceStart || r.hireDate;
  if (!r.serviceStart && r.hireDate) flags.push({ code: 'pay.no_service_start', level: 'info' });
  if (start) {
    const wage = r.basic != null ? r.basic + (r.housing ?? 0) : r.gross;
    const years = serviceYears(start, asOf);
    const liability = eosbLiability(wage, years, th);
    const prev = eosbLiability(wage, serviceYears(start, `${asOf.slice(0, 7)}-01`) - 1 / 365, th);
    const diff = r.eosbBooked == null ? null : r.eosbBooked - liability;
    if (diff != null && Math.abs(diff) > tol) flags.push({ code: 'pay.eosb_mismatch', level: 'warn', params: { p0: fmtYuan(r.eosbBooked!), p1: fmtYuan(liability) } });
    const firstYears = th['sa.eosbFirstYears'] ?? 5;
    eosb = {
      years: Math.round(years * 100) / 100, wage, liability, booked: r.eosbBooked, diff,
      formula: `${fmtYuan(wage)} × (${Math.min(years, firstYears).toFixed(2)} × ${th['sa.eosbFirstRate'] ?? 0.5} + ${Math.max(years - firstYears, 0).toFixed(2)} × ${th['sa.eosbLaterRate'] ?? 1})`,
    };
    // 计提：有账面余额就补到重算数（true-up），没有就按本月新增
    eosbAccrual = r.eosbBooked != null ? liability - r.eosbBooked : liability - prev;
  }
  const netExpected = r.gross - (personal ?? personalExpected) - (r.iitWithheld ?? 0) - r.otherDeductions;
  if (r.net != null && Math.abs(r.net - netExpected) > tol) flags.push({ code: 'pay.net_mismatch', level: 'warn', params: { p0: fmtYuan(r.net), p1: fmtYuan(netExpected) } });
  return {
    row: r.row, empId: r.empId, name: r.name, dept: r.dept, gross: r.gross, computedGross: r.components, personal, personalExpected, employer, base: raw, baseFlag,
    iitWithheld: r.iitWithheld, iitExpected: null, net: r.net, netExpected, eosb, flags, eosbAccrual,
  };
}

function lineIntl(r: PayrollRow, th: Record<string, number>): FauPayrollLine {
  const tol = th['intl.amtTol'] ?? 100;
  const flags: FauFlag[] = [];
  if (r.components != null && Math.abs(r.components - r.gross) > tol) flags.push({ code: 'pay.gross_mismatch', level: 'warn', params: { p0: fmtYuan(r.components), p1: fmtYuan(r.gross) } });
  const personalExpected = Math.round(r.gross * (th['intl.eeRate'] ?? 0));
  const personal = r.socialPersonal;
  if (personal != null && Math.abs(personal - personalExpected) > tol) flags.push({ code: 'pay.personal_mismatch', level: 'warn', params: { p0: fmtYuan(personal), p1: fmtYuan(personalExpected) } });
  const employer = r.employerBooked ?? Math.round(r.gross * (th['intl.erRate'] ?? 0));
  const netExpected = r.gross - (personal ?? personalExpected) - (r.iitWithheld ?? 0) - r.otherDeductions;
  if (r.net != null && Math.abs(r.net - netExpected) > tol) flags.push({ code: 'pay.net_mismatch', level: 'warn', params: { p0: fmtYuan(r.net), p1: fmtYuan(netExpected) } });
  return {
    row: r.row, empId: r.empId, name: r.name, dept: r.dept, gross: r.gross, computedGross: r.components, personal, personalExpected, employer, base: null, baseFlag: 'unchecked',
    iitWithheld: r.iitWithheld, iitExpected: null, net: r.net, netExpected, flags,
  };
}

const EXPENSE_BY_DEPT: { re: RegExp; code: string; name: string }[] = [
  { re: /生产|车间|制造|production|factory|plant|الإنتاج|المصنع/i, code: '5101', name: i18nKey('制造费用') },
  { re: /销售|市场|sales|marketing|المبيعات|التسويق/i, code: '6601', name: i18nKey('销售费用') },
];
const ADMIN = { code: '6602', name: i18nKey('管理费用') };

export function payrollEntries(regime: FauPayrollRegime, period: string, lines: FauPayrollLine[], eosbAccrual: number, cnCodes: boolean): FauJeLine[] {
  const date = periodEnd(period);
  const voucherNo = `PR-${period.replace('-', '')}`;
  const out: FauJeLine[] = [];
  const add = (code: string, name: string, debit: number, credit: number, summary: string, aux = '') => {
    if (!debit && !credit) return;
    out.push({ date, voucherNo, lineNo: out.length + 1, summary, accountCode: cnCodes ? code : '', accountName: name, aux, debit, credit, source: 'payroll_accrual', nameIsKey: true });
  };
  const sum = (f: (l: FauPayrollLine) => number) => lines.reduce((s, l) => s + f(l), 0);
  const gross = sum((l) => l.gross);
  const employer = sum((l) => l.employer);
  const personal = sum((l) => l.personal ?? l.personalExpected ?? 0);
  const iit = sum((l) => l.iitWithheld ?? l.iitExpected ?? 0);
  const s = `${period} ${regime.toUpperCase()}`;
  // 工资按部门归到费用科目（生产 → 制造费用，销售 → 销售费用，其余 → 管理费用）
  const groups = new Map<string, { code: string; name: string; gross: number; employer: number }>();
  for (const l of lines) {
    const acct = regime === 'cn' ? (EXPENSE_BY_DEPT.find((e) => e.re.test(l.dept)) || ADMIN) : { code: '', name: i18nKey('薪酬费用') };
    const g = groups.get(acct.name) || { ...acct, gross: 0, employer: 0 };
    g.gross += l.gross;
    g.employer += l.employer;
    groups.set(acct.name, g);
  }
  for (const g of groups.values()) add(g.code, g.name, g.gross, 0, s);
  add('2211', i18nKey('应付职工薪酬'), 0, gross, s);
  for (const g of groups.values()) add(g.code, g.name, g.employer, 0, s);
  add('2211', regime === 'sa' ? i18nKey('应付 GOSI') : i18nKey('应付职工薪酬'), 0, employer, s);
  add('2211', i18nKey('应付职工薪酬'), personal + iit, 0, s);
  add('2241', regime === 'sa' ? i18nKey('应付 GOSI') : i18nKey('其他应付款'), 0, personal, s);
  add('2221', i18nKey('应交税费'), 0, iit, s);
  if (regime === 'sa' && eosbAccrual) {
    if (eosbAccrual > 0) { add('', i18nKey('期末服务金费用'), eosbAccrual, 0, s); add('', i18nKey('期末服务金准备'), 0, eosbAccrual, s); }
    else { add('', i18nKey('期末服务金准备'), -eosbAccrual, 0, s); add('', i18nKey('期末服务金费用'), 0, -eosbAccrual, s); }
  }
  return out;
}

export function payrollReview(input: PayrollInput): FauPayrollResult {
  const { regime, period, th } = input;
  const asOf = periodEnd(period);
  let eosbAccrual = 0;
  const lines: FauPayrollLine[] = input.rows.map((r) => {
    if (regime === 'sa') {
      const l = lineSa(r, asOf, th);
      eosbAccrual += l.eosbAccrual;
      const { eosbAccrual: _e, ...rest } = l;
      return rest;
    }
    return regime === 'cn' ? lineCn(r, period, th) : lineIntl(r, th);
  });
  const escalations: FauMsg[] = [];
  const pStart = `${period}-01`;
  for (const r of input.rows.filter((x) => x.leaveDate && x.leaveDate < pStart)) {
    const l = lines.find((x) => x.row === r.row)!;
    l.flags.push({ code: 'pay.leaver_paid', level: 'block', params: { p0: r.leaveDate } });
    escalations.push(msg(i18nKey('{p0} 已于 {p1} 离职，仍在本期工资表'), { p0: r.name || r.empId, p1: r.leaveDate }));
  }
  let changes: FauHeadcountChange[] | null = null;
  if (input.prior) {
    const prior = new Map(input.prior.map((r) => [r.empId, r]));
    const cur = new Map(input.rows.map((r) => [r.empId, r]));
    changes = [
      ...input.rows.filter((r) => !prior.has(r.empId)).map((r): FauHeadcountChange => ({
        empId: r.empId, name: r.name, kind: 'hire', date: r.hireDate,
        flags: [{ code: 'pay.new_hire', level: 'info' as const }, ...(regime === 'cn' && !r.socialBase ? [{ code: 'pay.hire_no_base', level: 'warn' as const }] : [])],
      })),
      ...input.prior.filter((r) => !cur.has(r.empId)).map((r): FauHeadcountChange => ({ empId: r.empId, name: r.name, kind: 'leave', date: r.leaveDate, flags: [{ code: 'pay.leaver', level: 'info' }] })),
    ];
  }
  for (const l of lines.filter((x) => x.flags.some((f) => f.code === 'pay.iit_mismatch' && f.level === 'block'))) {
    escalations.push(msg(i18nKey('{p0} 个税实扣与累计预扣法相差超过升级门槛'), { p0: l.name || l.empId }));
  }
  const sum = (f: (l: FauPayrollLine) => number) => lines.reduce((s, l) => s + f(l), 0);
  return {
    regime, period, lines,
    totals: {
      headcount: lines.length, gross: sum((l) => l.gross), personal: sum((l) => l.personal ?? l.personalExpected ?? 0),
      iit: sum((l) => l.iitWithheld ?? l.iitExpected ?? 0), net: sum((l) => l.net ?? l.netExpected), employer: sum((l) => l.employer), eosbAccrual,
    },
    changes, je: payrollEntries(regime, period, lines, eosbAccrual, input.cnCodes && regime === 'cn'), escalations,
  };
}
