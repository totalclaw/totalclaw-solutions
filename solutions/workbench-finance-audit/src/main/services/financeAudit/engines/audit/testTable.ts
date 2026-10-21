/** 测试用：表头 + 行 → parseTable 的输入（不落盘） */
import type { AuditTable } from './table';
import { parseTable } from './table';

export function tableOf(headers: string[], rows: (string | number)[][], table: AuditTable, fileName = 't.xlsx') {
  return parseTable({ headers, rows: rows.map((r) => Object.fromEntries(headers.map((h, i) => [h, String(r[i] ?? '')]))), fileName }, table);
}
