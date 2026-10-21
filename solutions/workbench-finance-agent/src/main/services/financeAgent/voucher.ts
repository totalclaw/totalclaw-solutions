/**
 * 凭证草稿（纯函数）：票据 → 会计分录。
 *
 * 分录规则是固定的（见每个分支的注释），模型不参与借贷与金额；
 * 模型最多在关键词归不了类时帮忙选一个费用类别，科目仍由类别表决定。
 * 出来的只是草稿：状态 draft，人审核后才是 reviewed；导出成通用凭证导入格式，
 * 由财务导入自己的正式账套 —— 本工作台不改正式账套。
 */
import { t as i18nT } from '@totalclaw/i18n';
import type { FaBalanceRow, FaDoc, FaJournalRow, FaLedger, FaVoucher, FaVoucherLine } from '@totalclaw/ipc-contracts';
import { account, accountForCategory, ACCOUNTS, newId, periodOf, round2, sum } from './common';

const A = {
  cash: '1001', bank: '1002', ar: '1122', ap: '2202', otherPay: '2241',
  inputVat: '22210101', outputVat: '22210102', vat: '222101', revenue: '5001',
} as const;

function line(code: string, summary: string, debit: number, credit: number, aux?: string): FaVoucherLine {
  const a = account(code);
  return { summary, accountCode: a.code, accountName: a.name, debit: round2(debit), credit: round2(credit), aux: aux || undefined };
}

export interface VoucherDraft {
  lines: FaVoucherLine[];
  basis: string;
}

/** 单张票据 → 分录。回单不知道对应哪笔往来时挂应收 / 应付，由人审核时改。 */
export function draftForDoc(doc: FaDoc, ledger: FaLedger): VoucherDraft | null {
  const general = ledger.taxpayerType === 'general';
  const counter = doc.direction === 'out' ? (doc.buyerName || '') : (doc.sellerName || '');
  const expense = accountForCategory(doc.category);

  if (doc.kind === 'bank_receipt') {
    if (!doc.total) return null;
    if (doc.direction === 'in') {
      // 本公司付款：借 应付账款（对方）贷 银行存款
      const s = i18nT('付 {p0} {p1}', { p0: doc.payee || '', p1: doc.purpose || '' }).trim();
      return { basis: i18nT('银行付款回单：借应付账款、贷银行存款'), lines: [line(A.ap, s, doc.total, 0, doc.payee), line(A.bank, s, 0, doc.total)] };
    }
    if (doc.direction === 'out') {
      const s = i18nT('收 {p0} {p1}', { p0: doc.payer || '', p1: doc.purpose || '' }).trim();
      return { basis: i18nT('银行收款回单：借银行存款、贷应收账款'), lines: [line(A.bank, s, doc.total, 0), line(A.ar, s, 0, doc.total, doc.payer)] };
    }
    return null;
  }

  if (doc.direction === 'out') {
    // 销项：借 应收账款 价税合计；贷 主营业务收入 不含税；贷 应交税费 税额
    const s = i18nT('销售给 {p0}', { p0: counter });
    const lines = [line(A.ar, s, doc.total, 0, counter), line(A.revenue, s, 0, doc.amount)];
    if (doc.tax) lines.push(line(general ? A.outputVat : A.vat, s, 0, doc.tax));
    return { basis: general ? i18nT('销项发票（一般纳税人）：借应收、贷收入与销项税额') : i18nT('销项发票（小规模）：借应收、贷收入与应交增值税'), lines };
  }

  if (doc.direction === 'in') {
    const s = i18nT('{p0} {p1}', { p0: doc.category, p1: counter }).trim();
    const credit = expense.code === '1601' || expense.code === '1403' || expense.code === '1405' ? A.ap : A.otherPay;
    // 专票 / 旅客运输客票（一般纳税人）进项可抵扣：税额单列；普票、收据、小规模全额进成本费用
    const deductible = general && (doc.kind === 'vat_special' || doc.kind === 'e_ticket') && doc.tax > 0;
    const lines = deductible
      ? [line(expense.code, s, doc.amount, 0), line(A.inputVat, s, doc.tax, 0), line(credit, s, 0, doc.total, counter)]
      : [line(expense.code, s, doc.total, 0), line(credit, s, 0, doc.total, counter)];
    return {
      basis: deductible
        ? i18nT('可抵扣进项：借{p0}（不含税）+ 进项税额，贷{p1}', { p0: expense.name, p1: account(credit).name })
        : i18nT('不可抵扣：借{p0}（价税合计），贷{p1}', { p0: expense.name, p1: account(credit).name }),
      lines,
    };
  }
  return null;
}

export function isBalanced(lines: FaVoucherLine[]): boolean {
  return Math.abs(sum(lines.map((l) => l.debit)) - sum(lines.map((l) => l.credit))) < 0.005;
}

export function nextVoucherNo(existing: FaVoucher[], period: string): string {
  const n = existing.filter((v) => v.period === period).reduce((m, v) => Math.max(m, Number(v.no.replace(/\D/g, '')) || 0), 0);
  return `${i18nT('记')}-${String(n + 1).padStart(4, '0')}`;
}

export function buildVoucher(doc: FaDoc, ledger: FaLedger, existing: FaVoucher[], now = new Date().toISOString()): FaVoucher | null {
  const draft = draftForDoc(doc, ledger);
  if (!draft) return null;
  const date = doc.date || now.slice(0, 10);
  const period = periodOf(date);
  return {
    id: newId('vch'), no: nextVoucherNo(existing, period), date, period, lines: draft.lines, sourceDocIds: [doc.id],
    status: 'draft', basis: draft.basis, origin: 'doc', createdAt: now,
  };
}

/** 人改过的分录：补科目名、取整 */
export function normalizeLines(lines: Partial<FaVoucherLine>[]): FaVoucherLine[] {
  return lines
    .map((l) => {
      const a = ACCOUNTS.find((x) => x.code === String(l.accountCode || '').trim());
      return {
        summary: String(l.summary || '').trim(),
        accountCode: a?.code || String(l.accountCode || '').trim(),
        accountName: a?.name || String(l.accountName || '').trim(),
        debit: round2(Number(l.debit) || 0),
        credit: round2(Number(l.credit) || 0),
        aux: l.aux ? String(l.aux) : undefined,
      };
    })
    .filter((l) => l.accountCode && (l.debit || l.credit));
}

/** 通用凭证导入格式（金蝶 / 用友都能按列映射导入） */
export function voucherExportRows(vouchers: FaVoucher[]): Record<string, string | number>[] {
  const rows: Record<string, string | number>[] = [];
  for (const v of vouchers) {
    v.lines.forEach((l, i) => rows.push({
      [i18nT('日期')]: v.date,
      [i18nT('凭证字号')]: v.no,
      [i18nT('分录序号')]: i + 1,
      [i18nT('摘要')]: l.summary,
      [i18nT('科目编码')]: l.accountCode,
      [i18nT('科目名称')]: l.accountName,
      [i18nT('辅助核算')]: l.aux || '',
      [i18nT('借方金额')]: l.debit || '',
      [i18nT('贷方金额')]: l.credit || '',
      [i18nT('状态')]: v.status === 'reviewed' ? i18nT('已审核') : i18nT('草稿'),
    }));
  }
  return rows;
}

/** 已审核凭证 → 序时账行（报表、风险、预算共用同一口径） */
export function vouchersToJournal(vouchers: FaVoucher[]): FaJournalRow[] {
  return vouchers.filter((v) => v.status === 'reviewed').flatMap((v) => v.lines.map((l) => ({
    date: v.date, voucherNo: v.no, summary: l.summary, accountCode: l.accountCode, accountName: l.accountName,
    debit: l.debit, credit: l.credit, counterparty: l.aux,
  })));
}

/** 序时账 → 科目发生额（没有期初数据，期初为 0） */
export function journalToBalances(rows: FaJournalRow[]): FaBalanceRow[] {
  const map = new Map<string, FaBalanceRow>();
  for (const r of rows) {
    const code = r.accountCode;
    const cur = map.get(code) || { code, name: r.accountName, openingDebit: 0, openingCredit: 0, debit: 0, credit: 0, closingDebit: 0, closingCredit: 0 };
    cur.debit = round2(cur.debit + r.debit);
    cur.credit = round2(cur.credit + r.credit);
    map.set(code, cur);
  }
  for (const r of map.values()) {
    const net = round2(r.debit - r.credit);
    r.closingDebit = net > 0 ? net : 0;
    r.closingCredit = net < 0 ? -net : 0;
  }
  return [...map.values()].sort((a, b) => a.code.localeCompare(b.code));
}
