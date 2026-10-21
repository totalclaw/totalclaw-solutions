/**
 * 财务智能体 · 表格导入（数据对接）：账套导出的序时账、科目余额表，往来台账 / 对账单，
 * 工资表，预算表，成本表 → 结构化行。列按关键字识别（columnKeywords.json），识别不到的必需列直接报出来。
 */
import { t as i18nT } from '@totalclaw/i18n';
import type {
  FaBalanceRow, FaBudgetLine, FaCostMaterial, FaCostProduct, FaIitRow, FaJournalRow, FaRecRow,
} from '@totalclaw/ipc-contracts';
import { readTable, type SheetTable } from '../serviceSettlement/excel';
import { normDate, round2, toAmount } from './common';
import KW from './columnKeywords.json';

const KEYWORDS = KW as unknown as Record<string, string[]>;

export function detectCols(headers: string[], roles: string[]): Record<string, string> {
  const norm = (s: string) => s.replace(/\s+/g, '').toLowerCase();
  const used = new Set<string>();
  const out: Record<string, string> = {};
  for (const role of roles) {
    let hit = '';
    for (const kw of KEYWORDS[role] || []) {
      hit = headers.find((h) => !used.has(h) && norm(h) === norm(kw))
        || headers.find((h) => !used.has(h) && norm(h).includes(norm(kw))) || '';
      if (hit) break;
    }
    out[role] = hit;
    if (hit) used.add(hit);
  }
  return out;
}

function requireCols(cols: Record<string, string>, roles: string[], labels: Record<string, string>, table: SheetTable): void {
  const missing = roles.filter((r) => !cols[r]);
  if (missing.length) {
    throw new Error(i18nT('「{p0}」里没找到这些列：{p1}。表头是：{p2}', {
      p0: table.fileName, p1: missing.map((m) => labels[m] || m).join('、'), p2: table.headers.slice(0, 20).join(' / '),
    }));
  }
}

const LABELS = (): Record<string, string> => ({
  date: i18nT('日期'), accountName: i18nT('科目名称'), accountCode: i18nT('科目编码'), debit: i18nT('借方'), credit: i18nT('贷方'),
  amount: i18nT('金额'), counterparty: i18nT('往来单位'), name: i18nT('姓名'), salary: i18nT('应发工资'),
  product: i18nT('产品'), output: i18nT('完工数量'), material: i18nT('材料'), qty: i18nT('数量'), unitPrice: i18nT('单价'),
  category: i18nT('类别'), dept: i18nT('部门'),
});

export function loadTable(path: string): SheetTable {
  const t = readTable(path);
  if (!t.rows.length) throw new Error(i18nT('「{p0}」里没有数据行', { p0: t.fileName }));
  return t;
}

/** 序时账（凭证明细）。科目名称里「1002 银行存款」这种编码+名称写在一起的也能拆开。 */
export function parseJournal(table: SheetTable): FaJournalRow[] {
  const c = detectCols(table.headers, ['date', 'voucherNo', 'accountCode', 'accountName', 'summary', 'debit', 'credit', 'counterparty', 'dept']);
  requireCols(c, ['date', 'accountName', 'debit', 'credit'], LABELS(), table);
  let lastDate = '';
  let lastNo = '';
  const out: FaJournalRow[] = [];
  for (const r of table.rows) {
    const rawName = String(r[c.accountName] || '').trim();
    const m = rawName.match(/^(\d{4,})\s*[-_ ]?\s*(.+)$/);
    const code = String((c.accountCode && r[c.accountCode]) || m?.[1] || '').trim();
    const name = (m ? m[2] : rawName).replace(/_/g, '-');
    const debit = toAmount(r[c.debit]);
    const credit = toAmount(r[c.credit]);
    if (!name || (!debit && !credit)) continue;
    // 凭证只在第一行写日期 / 凭证号的导出格式：沿用上一行
    const date = normDate(r[c.date]) || lastDate;
    const no = String((c.voucherNo && r[c.voucherNo]) || '').trim() || lastNo;
    lastDate = date;
    lastNo = no;
    out.push({
      date, voucherNo: no, summary: String((c.summary && r[c.summary]) || ''), accountCode: code, accountName: name,
      debit: round2(debit), credit: round2(credit),
      counterparty: String((c.counterparty && r[c.counterparty]) || '') || undefined,
      dept: String((c.dept && r[c.dept]) || '') || undefined,
    });
  }
  return out;
}

/** 科目余额表。只有「期初余额 / 期末余额」一列时按科目性质放借贷方。 */
export function parseBalances(table: SheetTable): FaBalanceRow[] {
  const c = detectCols(table.headers, ['accountCode', 'accountName', 'openingDebit', 'openingCredit', 'closingDebit', 'closingCredit', 'debit', 'credit']);
  requireCols(c, ['accountName'], LABELS(), table);
  if (!c.closingDebit && !c.closingCredit) throw new Error(i18nT('「{p0}」里没找到期末余额列（期末借方 / 期末贷方）', { p0: table.fileName }));
  const out: FaBalanceRow[] = [];
  for (const r of table.rows) {
    const rawName = String(r[c.accountName] || '').trim();
    const m = rawName.match(/^(\d{4,})\s*[-_ ]?\s*(.+)$/);
    const code = String((c.accountCode && r[c.accountCode]) || m?.[1] || '').trim();
    const name = (m ? m[2] : rawName).trim();
    if (!name || /合计|总计/.test(name)) continue;
    const row: FaBalanceRow = {
      code, name,
      openingDebit: toAmount(c.openingDebit && r[c.openingDebit]), openingCredit: toAmount(c.openingCredit && r[c.openingCredit]),
      debit: toAmount(c.debit && r[c.debit]), credit: toAmount(c.credit && r[c.credit]),
      closingDebit: toAmount(c.closingDebit && r[c.closingDebit]), closingCredit: toAmount(c.closingCredit && r[c.closingCredit]),
    };
    if (Object.values(row).some((v) => typeof v === 'number' && v !== 0)) out.push(row);
  }
  return out;
}

/**
 * 往来明细 / 对账单 → 统一方向的行。
 * 应收（ar）：对方欠我们为正 = 借方（我方账）/ 对方账里的贷方（对方应付）；应付（ap）反过来。
 * 只有一列「金额」时按原符号。
 */
export function parseRecRows(table: SheetTable, side: 'ar' | 'ap', perspective: 'ours' | 'theirs'): { rows: FaRecRow[]; counterparty: string } {
  const c = detectCols(table.headers, ['date', 'ref', 'summary', 'debit', 'credit', 'amount', 'counterparty']);
  requireCols(c, ['date'], LABELS(), table);
  if (!c.amount && !(c.debit || c.credit)) throw new Error(i18nT('「{p0}」里没找到金额列（借方 / 贷方 或 金额）', { p0: table.fileName }));
  // 我方应收：借方增加；对方视角（对方应付）：贷方增加
  const positiveIsDebit = (side === 'ar') === (perspective === 'ours');
  const rows: FaRecRow[] = [];
  const names = new Map<string, number>();
  for (const r of table.rows) {
    const date = normDate(r[c.date]);
    const summary = String((c.summary && r[c.summary]) || '');
    if (!date && /合计|余额|期初|本月合计|累计/.test(summary)) continue;
    let amount = 0;
    if (c.debit || c.credit) {
      const d = toAmount(c.debit && r[c.debit]);
      const cr = toAmount(c.credit && r[c.credit]);
      amount = positiveIsDebit ? d - cr : cr - d;
    } else amount = toAmount(r[c.amount]);
    if (!date || !amount) continue;
    const cp = String((c.counterparty && r[c.counterparty]) || '').trim();
    if (cp) names.set(cp, (names.get(cp) || 0) + 1);
    rows.push({ date, ref: String((c.ref && r[c.ref]) || '').trim(), summary, amount: round2(amount) });
  }
  const counterparty = [...names.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] || '';
  return { rows, counterparty };
}

export interface AgingInputRow { counterparty: string; docNo: string; date: string; dueDate: string; amount: number; paid: number }

export function parseAgingRows(table: SheetTable, defaultTermsDays: number): AgingInputRow[] {
  const c = detectCols(table.headers, ['counterparty', 'ref', 'date', 'dueDate', 'terms', 'amount', 'paid', 'balance']);
  requireCols(c, ['counterparty', 'date'], LABELS(), table);
  if (!c.amount && !c.balance) throw new Error(i18nT('「{p0}」里没找到金额或余额列', { p0: table.fileName }));
  const out: AgingInputRow[] = [];
  for (const r of table.rows) {
    const date = normDate(r[c.date]);
    const cp = String(r[c.counterparty] || '').trim();
    if (!date || !cp || /合计/.test(cp)) continue;
    const amount = toAmount(c.amount ? r[c.amount] : r[c.balance]);
    const paid = c.amount && c.paid ? toAmount(r[c.paid]) : c.amount && c.balance ? round2(amount - toAmount(r[c.balance])) : 0;
    const terms = c.terms ? Number(String(r[c.terms]).replace(/\D/g, '')) || defaultTermsDays : defaultTermsDays;
    const due = normDate(c.dueDate && r[c.dueDate]);
    const dueDate = due || new Date(Date.parse(`${date}T00:00:00`) + terms * 86_400_000).toISOString().slice(0, 10);
    if (!amount) continue;
    out.push({ counterparty: cp, docNo: String((c.ref && r[c.ref]) || ''), date, dueDate, amount: round2(amount), paid: round2(paid) });
  }
  return out;
}

export function parsePayroll(table: SheetTable, monthIndex: number): FaIitRow[] {
  // 累计列先认：否则「累计专项附加扣除」会被「专项附加」抢走
  const c = detectCols(table.headers, ['ytdSalary', 'ytdInsurance', 'ytdSpecial', 'ytdTaxPaid', 'monthIndex', 'name', 'idNo', 'salary', 'insurance', 'special']);
  requireCols(c, ['name', 'salary'], LABELS(), table);
  return table.rows
    .filter((r) => String(r[c.name] || '').trim() && !/合计/.test(String(r[c.name])))
    .map((r) => ({
      name: String(r[c.name]).trim(),
      idNo: c.idNo ? String(r[c.idNo] || '').trim() || undefined : undefined,
      salary: toAmount(r[c.salary]),
      insurance: toAmount(c.insurance && r[c.insurance]),
      special: toAmount(c.special && r[c.special]),
      ytdSalary: toAmount(c.ytdSalary && r[c.ytdSalary]),
      ytdInsurance: toAmount(c.ytdInsurance && r[c.ytdInsurance]),
      ytdSpecial: toAmount(c.ytdSpecial && r[c.ytdSpecial]),
      ytdTaxPaid: toAmount(c.ytdTaxPaid && r[c.ytdTaxPaid]),
      monthIndex: (c.monthIndex && Number(r[c.monthIndex])) || monthIndex,
    }));
}

/** 预算表：部门 + 类别 + 1~12 月（或只有全年一列，平均分到 12 个月） */
export function parseBudget(table: SheetTable): FaBudgetLine[] {
  const c = detectCols(table.headers, ['dept', 'category']);
  requireCols(c, ['category'], LABELS(), table);
  const monthCols: Array<[number, string]> = [];
  for (const h of table.headers) {
    const m = h.replace(/\s+/g, '').match(/^(\d{1,2})月|^(?:M|m)(\d{1,2})$|-(\d{2})$/);
    const n = Number(m?.[1] || m?.[2] || m?.[3]);
    if (n >= 1 && n <= 12) monthCols.push([n, h]);
  }
  const annual = table.headers.find((h) => /全年|年度|合计|预算金额|预算/.test(h) && !monthCols.some(([, x]) => x === h));
  if (!monthCols.length && !annual) throw new Error(i18nT('预算表里没找到月份列（1月…12月）或全年预算列'));
  const out: FaBudgetLine[] = [];
  for (const r of table.rows) {
    const category = String(r[c.category] || '').trim();
    if (!category || /合计/.test(category)) continue;
    const months = Array(12).fill(0) as number[];
    if (monthCols.length) for (const [n, h] of monthCols) months[n - 1] = toAmount(r[h]);
    else {
      const total = toAmount(r[annual!]);
      const each = round2(total / 12);
      for (let i = 0; i < 12; i++) months[i] = i === 11 ? round2(total - each * 11) : each;
    }
    out.push({ dept: String((c.dept && r[c.dept]) || '').trim() || i18nT('全公司'), category, months });
  }
  return out;
}

export function parseCostProducts(table: SheetTable): FaCostProduct[] {
  const c = detectCols(table.headers, ['product', 'output', 'machineHours', 'hours']);
  requireCols(c, ['product', 'output'], LABELS(), table);
  return table.rows.filter((r) => String(r[c.product] || '').trim() && !/合计/.test(String(r[c.product]))).map((r) => ({
    name: String(r[c.product]).trim(), output: toAmount(r[c.output]),
    hours: toAmount(c.hours && r[c.hours]), machineHours: toAmount(c.machineHours && r[c.machineHours]),
  }));
}

export function parseCostMaterials(table: SheetTable): FaCostMaterial[] {
  const c = detectCols(table.headers, ['product', 'material', 'qty', 'unitPrice', 'amount', 'stdPerUnit']);
  requireCols(c, ['product', 'material'], LABELS(), table);
  if (!c.qty && !c.amount) throw new Error(i18nT('材料表里没找到数量或金额列'));
  return table.rows.filter((r) => String(r[c.product] || '').trim() && String(r[c.material] || '').trim()).map((r) => {
    const qty = toAmount(c.qty && r[c.qty]);
    const price = c.unitPrice ? toAmount(r[c.unitPrice]) : qty ? round2(toAmount(r[c.amount]) / qty) : toAmount(r[c.amount]);
    return {
      product: String(r[c.product]).trim(), material: String(r[c.material]).trim(), qty: qty || 1, unitPrice: price,
      stdPerUnit: c.stdPerUnit ? toAmount(r[c.stdPerUnit]) || undefined : undefined,
    };
  });
}
