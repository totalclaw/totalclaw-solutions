/**
 * 批次 2（A3–A8）子账类型的解析：表 → 标准数据集行。金额转分、日期转 ISO、比例认「%」，
 * 认不出的行带行号报出来（日期 / 金额认不出是阻断项，空行跳过是提醒项）。
 */
import { i18nKey } from '@totalclaw/i18n';
import type { FauIssue } from '@totalclaw/ipc-contracts';
import type { SheetTable } from '../../serviceSettlement/excel';
import type {
  ExpenseClaimRow, FaMovementRow, FaRegisterRow, FundsRow, GuaranteeRow, IcRow, OpenItemRow, PartyRow, PayrollRow, ProcureRow, ReceiptRow,
} from '../subledgerTypes';
import type { DatasetRowsByKind } from '../types';
import { HEADER_OFFSET, get, issue, toCents, toIsoDate, toNum, type ParseResult } from './common';
import WORDS from './subledgerKeywords.json';

type Mp = Record<string, string>;
type Row = Record<string, string>;
const W = WORDS as unknown as Record<string, string[]>;

const has = (mp: Mp, role: string) => !!mp[role];
const cents = (r: Row, mp: Mp, role: string): number | null => (has(mp, role) && get(r, mp, role) !== '' ? toCents(get(r, mp, role)) : null);
/** 比例：「13%」「0.13」「13」都认成 0.13（> 1 的当百分数） */
export function toRatio(v: string): number | null {
  const n = toNum(v);
  if (n == null) return null;
  return /%/.test(v) || Math.abs(n) > 1 ? n / 100 : n;
}
const ratio = (r: Row, mp: Mp, role: string) => (has(mp, role) ? toRatio(get(r, mp, role)) : null);
const num = (r: Row, mp: Mp, role: string) => (has(mp, role) ? toNum(get(r, mp, role)) : null);
export function yes(v: string): boolean {
  const s = String(v || '').trim().toLowerCase();
  return !!s && (W.yesWords || []).some((w) => s === w.toLowerCase());
}
const flag = (r: Row, mp: Mp, role: string): boolean | null => (has(mp, role) && get(r, mp, role) !== '' ? yes(get(r, mp, role)) : null);
const blank = (r: Row) => !Object.values(r).some((v) => String(v).trim());

/** 公共收尾：认不出的日期是阻断项、整行没有关键值的跳过（skipKey 是带 {n} 的词典 key） */
function finish<K extends keyof DatasetRowsByKind>(rows: DatasetRowsByKind[K], badDate: number[], skipped: number[], skipKey: string): ParseResult<K> {
  const issues: FauIssue[] = [];
  if (skipped.length) issues.push(issue('warn', 'rows_skipped', skipKey, { n: skipped.length }, skipped));
  if (badDate.length) issues.push(issue('block', 'bad_date', i18nKey('{n} 行日期认不出'), { n: badDate.length }, [...new Set(badDate)]));
  return { rows, issues };
}

function date(r: Row, mp: Mp, role: string, rowNo: number, bad: number[]): string {
  const raw = get(r, mp, role);
  const d = toIsoDate(raw);
  if (raw && !d) bad.push(rowNo);
  return d;
}

export function parseOpenItems(t: SheetTable, mp: Mp): ParseResult<'ar'> {
  const rows: OpenItemRow[] = [];
  const bad: number[] = [];
  const skipped: number[] = [];
  t.rows.forEach((r, i) => {
    const row = i + HEADER_OFFSET;
    const party = get(r, mp, 'party');
    const amount = cents(r, mp, 'itemAmount');
    const openRaw = cents(r, mp, 'openAmount');
    if (!party || (amount == null && openRaw == null)) { if (!blank(r)) skipped.push(row); return; }
    const settled = cents(r, mp, 'settled') ?? 0;
    const amt = amount ?? openRaw ?? 0;
    rows.push({
      row, party, docNo: get(r, mp, 'invoiceRef'), poNo: get(r, mp, 'poNo'),
      docDate: date(r, mp, 'docDate', row, bad), dueDate: date(r, mp, 'dueDate', row, bad), termDays: num(r, mp, 'termDays'),
      amount: amt, open: openRaw ?? amt - settled, currency: get(r, mp, 'currency').toUpperCase(), disputed: !!flag(r, mp, 'disputed'),
    });
  });
  return finish<'ar'>(rows, bad, skipped, i18nKey('{n} 行没有往来单位或金额，已跳过'));
}

export function parseReceipts(t: SheetTable, mp: Mp): ParseResult<'receipt'> {
  const rows: ReceiptRow[] = [];
  const bad: number[] = [];
  const skipped: number[] = [];
  t.rows.forEach((r, i) => {
    const row = i + HEADER_OFFSET;
    const party = get(r, mp, 'party');
    const amount = cents(r, mp, 'receiptAmount');
    if (!party || !amount) { if (!blank(r)) skipped.push(row); return; }
    rows.push({ row, party, docNo: get(r, mp, 'invoiceRef'), date: date(r, mp, 'receiptDate', row, bad), amount });
  });
  return finish<'receipt'>(rows, bad, skipped, i18nKey('{n} 行没有客户或收款金额，已跳过'));
}

export function parseParties(t: SheetTable, mp: Mp): ParseResult<'customer'> {
  const rows: PartyRow[] = [];
  t.rows.forEach((r, i) => {
    const name = get(r, mp, 'partyName');
    if (!name) return;
    const cf = num(r, mp, 'cashFlow');
    rows.push({
      row: i + HEADER_OFFSET, name, regNo: get(r, mp, 'regNo').replace(/\s+/g, '').toUpperCase(), grade: get(r, mp, 'grade').toUpperCase().slice(0, 2),
      termDays: num(r, mp, 'termDays'), creditLimit: cents(r, mp, 'creditLimit'), requestedLimit: cents(r, mp, 'requestedLimit'),
      debtRatio: ratio(r, mp, 'debtRatio'), cashFlowPositive: cf == null ? null : cf >= 0, riskFlags: get(r, mp, 'riskFlags'),
      bankAccount: get(r, mp, 'payeeAccount').replace(/\s+/g, ''), bankName: get(r, mp, 'payeeBank'), accountName: get(r, mp, 'payeeName'),
      prevBankAccount: get(r, mp, 'prevAccount').replace(/\s+/g, ''), relatedParty: !!flag(r, mp, 'relatedParty'), blacklisted: !!flag(r, mp, 'blacklisted'),
    });
  });
  return { rows, issues: [] };
}

/** 订单 / 收货 / 发票：docRole 是本单单号的列（订单就是 poNo） */
export function parseProcure(t: SheetTable, mp: Mp, docRole: 'poNo' | 'grnNo' | 'invoiceRef'): ParseResult<'po'> {
  const rows: ProcureRow[] = [];
  const bad: number[] = [];
  const skipped: number[] = [];
  t.rows.forEach((r, i) => {
    const row = i + HEADER_OFFSET;
    const qty = num(r, mp, 'quantity');
    const docNo = get(r, mp, docRole) || get(r, mp, 'poNo');
    if (!docNo || qty == null) { if (!blank(r)) skipped.push(row); return; }
    const unit = has(mp, 'unitPrice') && get(r, mp, 'unitPrice') !== '' ? (toNum(get(r, mp, 'unitPrice')) ?? 0) * 100 : null;
    rows.push({
      row, docNo, poNo: get(r, mp, 'poNo'), line: get(r, mp, 'poLine'), item: get(r, mp, 'item'), supplier: get(r, mp, 'party'), qty,
      unitPrice: unit, amount: cents(r, mp, 'netAmount'), taxRate: ratio(r, mp, 'taxRate'), date: date(r, mp, 'docDate', row, bad),
    });
  });
  return finish<'po'>(rows, bad, skipped, i18nKey('{n} 行没有单号或数量，已跳过'));
}

export function parseFunds(t: SheetTable, mp: Mp): ParseResult<'funds'> {
  const rows: FundsRow[] = [];
  t.rows.forEach((r, i) => {
    const bal = cents(r, mp, 'fundBalance');
    if (bal == null) return;
    rows.push({ row: i + HEADER_OFFSET, account: get(r, mp, 'fundAccount'), balance: bal, scheduled: cents(r, mp, 'scheduled') ?? 0, frozen: cents(r, mp, 'frozen') ?? 0 });
  });
  return { rows, issues: [] };
}

export function parseClaims(t: SheetTable, mp: Mp): ParseResult<'expense_claim'> {
  const rows: ExpenseClaimRow[] = [];
  const bad: number[] = [];
  const skipped: number[] = [];
  let lastClaim = '';
  t.rows.forEach((r, i) => {
    const row = i + HEADER_OFFSET;
    const employee = get(r, mp, 'employee');
    const total = cents(r, mp, 'totalAmount');
    if (!employee || total == null) { if (!blank(r)) skipped.push(row); return; }
    const tax = cents(r, mp, 'taxAmount') ?? 0;
    // 报销单号只写在首行的导出：沿用上一行
    const claimNo = get(r, mp, 'claimNo') || lastClaim || `${employee}-${row}`;
    lastClaim = get(r, mp, 'claimNo') || lastClaim;
    rows.push({
      row, claimNo, employee, dept: get(r, mp, 'dept'), level: get(r, mp, 'empLevel'), category: get(r, mp, 'category'),
      submitDate: date(r, mp, 'submitDate', row, bad), expenseDate: date(r, mp, 'expenseDate', row, bad),
      invoiceKind: get(r, mp, 'invoiceKind'), invoiceCode: get(r, mp, 'invoiceCode'), invoiceNo: get(r, mp, 'invoiceRef'), invoiceDate: date(r, mp, 'docDate', row, bad),
      sellerName: get(r, mp, 'sellerName'), sellerTaxId: get(r, mp, 'sellerTaxId').replace(/\s+/g, '').toUpperCase(),
      buyerName: get(r, mp, 'buyerName'), buyerTaxId: get(r, mp, 'buyerTaxId').replace(/\s+/g, '').toUpperCase(),
      amount: cents(r, mp, 'netAmount') ?? total - tax, tax, total, taxRate: ratio(r, mp, 'taxRate'), qr: get(r, mp, 'qr').replace(/\s+/g, ''),
    });
  });
  return finish<'expense_claim'>(rows, bad, skipped, i18nKey('{n} 行没有报销人或金额，已跳过'));
}

export function parseFaRegister(t: SheetTable, mp: Mp): ParseResult<'fa_register'> {
  const rows: FaRegisterRow[] = [];
  const bad: number[] = [];
  const skipped: number[] = [];
  t.rows.forEach((r, i) => {
    const row = i + HEADER_OFFSET;
    const assetNo = get(r, mp, 'assetNo');
    const cost = cents(r, mp, 'cost');
    if (!assetNo || cost == null) { if (!blank(r)) skipped.push(row); return; }
    const years = num(r, mp, 'lifeYears');
    const months = num(r, mp, 'lifeMonths');
    const acquireDate = date(r, mp, 'acquireDate', row, bad);
    if (!acquireDate) bad.push(row);
    rows.push({
      row, assetNo, name: get(r, mp, 'assetName'), category: get(r, mp, 'assetCategory'), acquireDate, cost,
      method: get(r, mp, 'depMethod'), lifeMonths: months ?? (years != null ? Math.round(years * 12) : null),
      salvageRate: ratio(r, mp, 'salvageRate'), salvage: cents(r, mp, 'salvage'), bookedAccum: cents(r, mp, 'bookedAccum'), bookedPeriod: cents(r, mp, 'bookedPeriod'),
      impairment: cents(r, mp, 'impairment') ?? 0, totalUnits: num(r, mp, 'totalUnits'), periodUnits: num(r, mp, 'periodUnits'), unitsToDate: num(r, mp, 'unitsToDate'),
      dept: get(r, mp, 'dept'), status: get(r, mp, 'assetStatus'), disposalDate: date(r, mp, 'disposalDate', row, bad),
    });
  });
  return finish<'fa_register'>(rows, bad, skipped, i18nKey('{n} 行没有资产编号或原值，已跳过'));
}

export function parseFaMovements(t: SheetTable, mp: Mp): ParseResult<'fa_movement'> {
  const rows: FaMovementRow[] = [];
  const bad: number[] = [];
  const skipped: number[] = [];
  t.rows.forEach((r, i) => {
    const row = i + HEADER_OFFSET;
    const typeText = get(r, mp, 'movementType');
    const assetNo = get(r, mp, 'assetNo');
    if (!typeText || !assetNo) { if (!blank(r)) skipped.push(row); return; }
    const disposal = (W.disposalWords || []).some((w) => typeText.toLowerCase().includes(w.toLowerCase()));
    rows.push({
      row, type: disposal ? 'disposal' : 'addition', typeText, assetNo, name: get(r, mp, 'assetName'), date: date(r, mp, 'docDate', row, bad),
      amount: cents(r, mp, 'cost') ?? 0, proceeds: cents(r, mp, 'proceeds') ?? 0, costs: cents(r, mp, 'disposalCosts') ?? 0,
    });
  });
  return finish<'fa_movement'>(rows, bad, skipped, i18nKey('{n} 行没有变动类型或资产编号，已跳过'));
}

const PAY_COMPONENTS = ['payBase', 'payPosition', 'payBonus', 'payOvertime', 'payAllowance', 'payHousing', 'payOther'];

export function parsePayroll(t: SheetTable, mp: Mp): ParseResult<'payroll'> {
  const rows: PayrollRow[] = [];
  const bad: number[] = [];
  const skipped: number[] = [];
  const comps = PAY_COMPONENTS.filter((c) => has(mp, c));
  t.rows.forEach((r, i) => {
    const row = i + HEADER_OFFSET;
    const empId = get(r, mp, 'empId');
    const name = get(r, mp, 'empName');
    const gross = cents(r, mp, 'gross');
    if ((!empId && !name) || gross == null) { if (!blank(r)) skipped.push(row); return; }
    const nat = get(r, mp, 'nationality');
    rows.push({
      row, empId: empId || name, name, dept: get(r, mp, 'dept'),
      components: comps.length ? comps.reduce((s, c) => s + (cents(r, mp, c) ?? 0), 0) : null,
      gross, socialPersonal: cents(r, mp, 'socialPersonal'), fundPersonal: cents(r, mp, 'fundPersonal'), iitWithheld: cents(r, mp, 'iitWithheld'),
      otherDeductions: cents(r, mp, 'otherDeductions') ?? 0, net: cents(r, mp, 'netPay'), socialBase: cents(r, mp, 'socialBase'), fundBase: cents(r, mp, 'fundBase'),
      special: cents(r, mp, 'special') ?? 0, ytdIncome: cents(r, mp, 'ytdIncome') ?? 0, ytdInsurance: cents(r, mp, 'ytdInsurance') ?? 0,
      ytdSpecial: cents(r, mp, 'ytdSpecial') ?? 0, ytdTaxPaid: cents(r, mp, 'ytdTaxPaid') ?? 0, monthIndex: num(r, mp, 'monthIndex'),
      employerBooked: cents(r, mp, 'employerBooked'), hireDate: date(r, mp, 'hireDate', row, bad), leaveDate: date(r, mp, 'leaveDate', row, bad),
      saudi: nat ? (W.saudiWords || []).some((w) => nat.toLowerCase() === w.toLowerCase()) || yes(nat) : null,
      basic: cents(r, mp, 'payBase'), housing: cents(r, mp, 'payHousing'), serviceStart: date(r, mp, 'serviceStart', row, bad), eosbBooked: cents(r, mp, 'eosbBooked'),
    });
  });
  return finish<'payroll'>(rows, bad, skipped, i18nKey('{n} 行没有员工或应发合计，已跳过'));
}

export function parseIntercompany(t: SheetTable, mp: Mp): ParseResult<'intercompany'> {
  const rows: IcRow[] = [];
  const bad: number[] = [];
  const skipped: number[] = [];
  t.rows.forEach((r, i) => {
    const row = i + HEADER_OFFSET;
    const entity = get(r, mp, 'entity');
    const counterparty = get(r, mp, 'icCounterparty');
    const amount = cents(r, mp, 'localAmount');
    if (!entity || !counterparty || amount == null) { if (!blank(r)) skipped.push(row); return; }
    const price = (role: string) => (has(mp, role) && get(r, mp, role) !== '' ? toNum(get(r, mp, role)) : null);
    rows.push({
      row, entity, counterparty, type: get(r, mp, 'icType'), docNo: get(r, mp, 'docNo').replace(/\s+/g, '').toUpperCase(), date: date(r, mp, 'docDate', row, bad),
      amount, fxAmount: cents(r, mp, 'fxAmount'), currency: get(r, mp, 'currency').toUpperCase(),
      internalPrice: price('internalPrice'), marketPrice: price('marketPrice'),
    });
  });
  return finish<'intercompany'>(rows, bad, skipped, i18nKey('{n} 行没有公司、对方公司或金额，已跳过'));
}

export function parseGuarantees(t: SheetTable, mp: Mp): ParseResult<'guarantee'> {
  const rows: GuaranteeRow[] = [];
  const bad: number[] = [];
  const skipped: number[] = [];
  t.rows.forEach((r, i) => {
    const row = i + HEADER_OFFSET;
    const guarantor = get(r, mp, 'guarantor');
    const beneficiary = get(r, mp, 'beneficiary');
    const amount = cents(r, mp, 'guaranteeAmount');
    if (!guarantor || !beneficiary || amount == null) { if (!blank(r)) skipped.push(row); return; }
    rows.push({
      row, guarantor, beneficiary, beneficiaryType: get(r, mp, 'beneficiaryType'), amount,
      startDate: date(r, mp, 'startDate', row, bad), endDate: date(r, mp, 'endDate', row, bad), feeRate: ratio(r, mp, 'feeRate'),
      status: get(r, mp, 'status'), approved: flag(r, mp, 'approved'), netAssets: cents(r, mp, 'netAssets'),
    });
  });
  return finish<'guarantee'>(rows, bad, skipped, i18nKey('{n} 行没有担保方、被担保方或金额，已跳过'));
}

/** 是否「有效 / 在保」：没填状态按有效 */
export function isActiveStatus(s: string): boolean {
  return !s.trim() || (W.activeWords || []).some((w) => s.toLowerCase().includes(w.toLowerCase()));
}

export type SubledgerParser = (t: SheetTable, mp: Mp) => ParseResult<keyof DatasetRowsByKind>;
