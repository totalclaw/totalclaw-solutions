/**
 * 底稿 xlsx（第 10 节）：基于 SheetJS（社区版，无单元格样式）。
 *
 *   - 第一行为草稿警示（输出语言）；
 *   - 需要联动的单元格写公式（{ f, v }，v 是预先算好的值，打开即显示）；
 *   - Checks 页逐条 TRUE / FALSE；
 *   - 阿语输出 Workbook.Views[0].RTL = true（写出 sheetView rightToLeft="1"）；
 *   - 社区版不支持配色，改为「输入」「计算」分 sheet。
 * 金额一律以主单位数值写入（分 / 100），单元格保持数值类型。
 */
import * as XLSX from 'xlsx';
import { mkdirSync } from 'node:fs';
import { dirname } from 'node:path';

export interface FormulaCell { f: string; v?: number | string | boolean }
export type XCell = string | number | boolean | null | undefined | FormulaCell;

export interface XSheet {
  name: string;
  /** 草稿警示行（写在第 1 行），不传则不写 */
  banner?: string;
  /** 表头（写在 banner 下一行） */
  headers?: string[];
  rows: XCell[][];
  cols?: number[];
}

export function isFormula(c: XCell): c is FormulaCell {
  return !!c && typeof c === 'object' && typeof (c as FormulaCell).f === 'string';
}

/** Excel sheet 名不能含 : \ / ? * [ ] 且 ≤ 31 字符 */
export function sheetName(name: string, used: Set<string>): string {
  let n = String(name || 'Sheet').replace(/[:\\/?*[\]]/g, '_').trim().slice(0, 31) || 'Sheet';
  let i = 2;
  while (used.has(n)) { const s = `(${i})`; n = `${n.slice(0, 31 - s.length)}${s}`; i += 1; }
  used.add(n);
  return n;
}

/** 预先定好表名（公式里要引用，必须与写出的名字一致） */
export function planSheetNames(names: string[]): string[] {
  const used = new Set<string>();
  return names.map((n) => sheetName(n, used));
}

/** 0-based 行列 → A1 */
export function addr(r: number, c: number): string {
  return XLSX.utils.encode_cell({ r, c });
}

/** 引用另一张表的单元格（带引号，支持中文 / 阿语表名） */
export function ref(sheet: string, r: number, c: number): string {
  return `'${sheet.replace(/'/g, "''")}'!${addr(r, c)}`;
}

export function toSheet(s: XSheet): XLSX.WorkSheet {
  const aoa: XCell[][] = [];
  if (s.banner) aoa.push([s.banner]);
  if (s.headers) aoa.push(s.headers);
  aoa.push(...s.rows);
  const ws: XLSX.WorkSheet = {};
  let maxC = 0;
  aoa.forEach((row, r) => {
    row.forEach((cell, c) => {
      if (cell === null || cell === undefined || cell === '') return;
      maxC = Math.max(maxC, c);
      const a = addr(r, c);
      if (isFormula(cell)) {
        const v = cell.v;
        ws[a] = typeof v === 'boolean' ? { t: 'b', v, f: cell.f } : typeof v === 'string' ? { t: 's', v, f: cell.f } : { t: 'n', v: typeof v === 'number' ? v : 0, f: cell.f };
      } else if (typeof cell === 'number') {
        ws[a] = { t: 'n', v: cell };
      } else if (typeof cell === 'boolean') {
        ws[a] = { t: 'b', v: cell };
      } else {
        ws[a] = { t: 's', v: String(cell) };
      }
    });
  });
  ws['!ref'] = XLSX.utils.encode_range({ s: { r: 0, c: 0 }, e: { r: Math.max(aoa.length - 1, 0), c: maxC } });
  const widths = s.cols || Array.from({ length: maxC + 1 }, (_, c) => {
    let w = 8;
    for (const row of aoa.slice(s.banner ? 1 : 0, 200)) {
      const cell = row[c];
      const text = isFormula(cell) ? String(cell.v ?? '') : String(cell ?? '');
      w = Math.max(w, text.replace(/[^\x00-\xff]/g, 'xx').length + 2);
    }
    return Math.min(w, 60);
  });
  ws['!cols'] = widths.map((wch) => ({ wch }));
  return ws;
}

export function writeWorkbookFile(path: string, sheets: XSheet[], opts: { rtl?: boolean } = {}): string[] {
  const wb = XLSX.utils.book_new();
  const used = new Set<string>();
  const names: string[] = [];
  for (const s of sheets) {
    const n = sheetName(s.name, used);
    names.push(n);
    XLSX.utils.book_append_sheet(wb, toSheet(s), n);
  }
  if (opts.rtl) wb.Workbook = { ...(wb.Workbook || {}), Views: [{ RTL: true }] };
  mkdirSync(dirname(path), { recursive: true });
  XLSX.writeFile(wb, path, { bookType: 'xlsx', compression: true });
  return names;
}

/** 分 → 主单位数值（两位小数） */
export function major(cents: number | null | undefined): number | null {
  if (cents === null || cents === undefined || !Number.isFinite(cents)) return null;
  return Math.round(cents) / 100;
}
