/** 夹具表 → 标准数据集行：走真实的列识别与解析（单测用；E2E 不引这个文件） */
import type { FauInputKind } from '@totalclaw/ipc-contracts';
import { detectRoles, rolesFor } from '../../intake/columns';
import { parseDataset } from '../../intake';
import { PERIOD, type RawTable } from './subledgers';

/** 表 → 标准数据集行（走真实的列识别与解析） */
export function parse<K extends FauInputKind>(kind: K, t: RawTable): { rows: any[]; issues: any[]; mapping: Record<string, string> } {
  const table = { path: '', fileName: 'fixture.xlsx', sheetName: 'S', headers: t.headers, rows: t.rows.map((r) => Object.fromEntries(t.headers.map((h, i) => [h, r[i] === undefined || r[i] === null ? '' : String(r[i])]))) };
  const mapping = detectRoles(t.headers, rolesFor(kind).map((r) => r.key));
  const res = parseDataset(kind, table, mapping, { period: PERIOD });
  return { rows: res.rows as any[], issues: res.issues, mapping };
}

