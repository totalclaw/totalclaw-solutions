/**
 * fpa 夹具 → xlsx（测试与 E2E 共用）：表头用 intake/fpaColumnKeywords.json 认得出的表头（默认中文，可选英文 / 阿语），
 * 行顺序与夹具 row 一致（表头下第一行 = 2）。
 */
import * as XLSX from 'xlsx';
import { mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import type { KpiRow, PvRow } from '../../fpaTypes';
import type { JournalRow } from '../../types';

function write(path: string, headers: string[], rows: (string | number)[][]): string {
  mkdirSync(dirname(path), { recursive: true });
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet([headers, ...rows]), 'Sheet1');
  XLSX.writeFile(wb, path);
  return path;
}

const KPI_HEADERS = {
  zh: ['指标名称', '类别', '期间', '目标值', '实际值', '单位', '指标方向', '责任人'],
  en: ['Indicator', 'Category', 'Period', 'Target', 'Actual', 'Unit', 'Direction', 'Owner'],
  ar: ['اسم المؤشر', 'الفئة', 'الفترة', 'القيمة المستهدفة', 'القيمة الفعلية', 'الوحدة', 'الاتجاه', 'المسؤول'],
};
const DIR = { zh: ['越高越好', '越低越好'], en: ['higher', 'lower'], ar: ['الأعلى أفضل', 'الأقل أفضل'] };

export function kpiXlsx(path: string, rows: KpiRow[], lang: 'zh' | 'en' | 'ar' = 'zh'): string {
  return write(path, KPI_HEADERS[lang], rows.map((r) => [r.indicator, r.category, r.period, r.target ?? '', r.actual ?? '', r.unit, DIR[lang][r.direction === 'lower' ? 1 : 0], r.owner]));
}

const EL = { material: '直接材料', labor: '直接人工', overhead: '制造费用', other: '其他' };
export function pvXlsx(path: string, rows: PvRow[]): string {
  return write(path, ['成本项目', '成本要素', '成本中心', '期间', '标准用量', '标准单价', '实际用量', '实际单价'],
    rows.map((r) => [r.item, EL[r.element], r.costCenter, r.period, r.stdQty, r.stdPrice, r.actualQty, r.actualPrice]));
}

/** 带部门列的序时账（D5 成本中心用） */
export function deptJournalXlsx(path: string, rows: JournalRow[]): string {
  return write(path, ['记账日期', '凭证号', '科目编码', '科目名称', '摘要', '借方金额', '贷方金额', '部门'],
    rows.map((r) => [r.date, r.voucherNo, r.accountCode, r.accountName, r.summary, r.debit ? r.debit / 100 : '', r.credit ? r.credit / 100 : '', r.dept]));
}
