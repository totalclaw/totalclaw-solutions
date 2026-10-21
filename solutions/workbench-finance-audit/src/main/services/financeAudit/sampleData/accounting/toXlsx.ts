/**
 * 夹具 → xlsx（测试与 E2E 共用）：表头用 intake/columnKeywords.json 里能认的中文表头，金额写主单位（元），
 * 行顺序与夹具 row 一致（表头下第一行 = 2），导回来的行号与夹具对得上。
 */
import * as XLSX from 'xlsx';
import { mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import type { AccrualPolicyRow, BankRow, BudgetRow, JournalRow, LedgerExtractRow, TbRow } from '../../types';

const yuan = (c: number | null | undefined) => (c == null ? '' : Math.round(c) / 100);

function write(path: string, headers: string[], rows: (string | number)[][]): string {
  mkdirSync(dirname(path), { recursive: true });
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet([headers, ...rows]), 'Sheet1');
  XLSX.writeFile(wb, path);
  return path;
}

export function journalXlsx(path: string, rows: JournalRow[]): string {
  return write(path, ['记账日期', '业务日期', '凭证号', '科目编码', '科目名称', '摘要', '借方金额', '贷方金额', '币种', '往来单位'],
    rows.map((r) => [r.date, r.businessDate, r.voucherNo, r.accountCode, r.accountName, r.summary, yuan(r.debit) || '', yuan(r.credit) || '', r.currency, r.counterparty]));
}

export function tbXlsx(path: string, rows: TbRow[]): string {
  return write(path, ['科目编码', '科目名称', '期初借方', '期初贷方', '本期借方', '本期贷方', '期末借方', '期末贷方'],
    rows.map((r) => [r.accountCode, r.accountName, yuan(r.openingDr), yuan(r.openingCr), yuan(r.periodDr), yuan(r.periodCr), yuan(r.closingDr), yuan(r.closingCr)]));
}

export function bankXlsx(path: string, rows: BankRow[]): string {
  return write(path, ['账号', '交易日期', '交易流水号', '对方户名', '收入金额', '支出金额', '余额', '摘要'],
    rows.map((r) => [r.bankAccount, r.date, r.ref, r.counterparty, yuan(r.amountIn) || '', yuan(r.amountOut) || '', yuan(r.balance), r.summary]));
}

export function subledgerXlsx(path: string, rows: LedgerExtractRow[]): string {
  return write(path, ['对账键', '日期', '本位币金额', '数量', '原币金额', '币种', '单据号', '摘要'],
    rows.map((r) => [r.key, r.date, yuan(r.amount), r.quantity ?? '', yuan(r.fxAmount), r.currency, r.docNo, r.desc]));
}

export function budgetXlsx(path: string, rows: BudgetRow[]): string {
  return write(path, ['科目编码', '科目名称', '期间', '预算金额'], rows.map((r) => [r.accountCode, r.accountName, r.period, yuan(r.amount)]));
}

export function policyXlsx(path: string, rows: AccrualPolicyRow[]): string {
  return write(path, ['政策编号', '计提项目', '费用科目', '费用科目名称', '负债科目', '负债科目名称', '计算方式', '金额', '起始期间', '结束期间', '费率', '基数科目', '已入账关键词', '自动冲回'],
    rows.map((r) => [r.id, r.description, r.expenseAccount, r.expenseAccountName, r.liabilityAccount, r.liabilityAccountName, r.basis, yuan(r.amount), r.startPeriod, r.endPeriod, r.rate ?? '', r.baseAccount, r.keywords.join(','), r.autoReverse ? '是' : '否']));
}
