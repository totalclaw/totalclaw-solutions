/** 数据集解析分发：按输入类型选解析器 */
import type { FauInputKind, FauInspectResult, FauIssue } from '@totalclaw/ipc-contracts';
import { listSheetNames, readTable, type SheetTable } from '../../serviceSettlement/excel';
import type { ParsedKind } from '../types';
import type { ParseResult } from './common';
import { parseJournal } from './journal';
import { parseTb } from './trialBalance';
import { parseBank } from './bankStatement';
import { parseSubledger } from './subledger';
import { parseBudget, parseFx, parsePolicies } from './tables';
import { parseKpi, parsePriceVolume } from './fpa';
import { isTaxKind, parseTaxDataset } from './tax';
import {
  parseClaims, parseFaMovements, parseFaRegister, parseFunds, parseGuarantees, parseIntercompany, parseOpenItems, parseParties, parsePayroll,
  parseProcure, parseReceipts,
} from './subledgers';
import { readStatementTable, statementFormat } from './statementFile';
import { detectRoles, missingRoles, rolesFor } from './columns';
import { isTreasuryKind, parseTreasuryTable } from './treasury';
import PROFILES from './erpProfiles.json';

export function parseDataset(
  kind: FauInputKind, table: SheetTable, mapping: Record<string, string>, opts: { period?: string; accountLabel?: string } = {},
): ParseResult<ParsedKind> {
  switch (kind) {
    case 'journal': return parseJournal(table, mapping);
    case 'tb': return parseTb(table, mapping);
    case 'bank': return parseBank(table, mapping, opts.accountLabel || table.fileName.replace(/\.[^.]+$/, ''));
    case 'subledger': return parseSubledger(table, mapping);
    case 'budget': return parseBudget(table, mapping, opts.period || '');
    case 'accrual_policy': return parsePolicies(table, mapping);
    case 'fx_rates': return parseFx(table, mapping);
    case 'kpi': return parseKpi(table, mapping, opts.period || '');
    case 'price_volume': return parsePriceVolume(table, mapping, opts.period || '');
    // 批次 2：A3–A8 子账类型
    case 'ar': case 'ap': return parseOpenItems(table, mapping);
    case 'receipt': return parseReceipts(table, mapping);
    case 'customer': case 'supplier': return parseParties(table, mapping);
    case 'po': return parseProcure(table, mapping, 'poNo');
    case 'grn': return parseProcure(table, mapping, 'grnNo');
    case 'invoice': return parseProcure(table, mapping, 'invoiceRef');
    case 'funds': return parseFunds(table, mapping);
    case 'expense_claim': return parseClaims(table, mapping);
    case 'fa_register': return parseFaRegister(table, mapping);
    case 'fa_movement': return parseFaMovements(table, mapping);
    case 'payroll': return parsePayroll(table, mapping);
    case 'intercompany': return parseIntercompany(table, mapping);
    case 'guarantee': return parseGuarantees(table, mapping);
    default:
      // 批次 4：税务组数据集
      if (isTaxKind(kind)) return parseTaxDataset(kind, table, mapping) as ParseResult<ParsedKind>;
      // 批次 6：资金与金融风险
      if (isTreasuryKind(kind)) return parseTreasuryTable(kind, table, mapping) as ParseResult<ParsedKind>;
      throw new Error(`unsupported kind ${kind}`);
  }
}

// ── 列识别预览 / 导入 ─────────────────────────────────────────────────────


interface ErpProfile { id: string; status: string; signatures: Record<string, string[]> }

/** 按表头特征认 ERP 导出格式；没有真实样例采集的 ERP 不给特征，一律落 generic（第 7.1 节） */
export function detectErpProfile(kind: FauInputKind, headers: string[]): string {
  const hs = new Set(headers.map((h) => h.replace(/\s+/g, '')));
  for (const p of (PROFILES as unknown as { profiles: ErpProfile[] }).profiles) {
    const sig = p.signatures?.[kind];
    if (sig?.length && sig.every((h) => hs.has(h.replace(/\s+/g, '')))) return p.id;
  }
  return 'generic';
}

/** 银行流水可以是 MT940 / CAMT.053 对账单（批次 2）：转成同形的表再走同一套列识别与解析 */
function tableOf(path: string, kind: FauInputKind, sheetName?: string): { table: SheetTable; statement: ReturnType<typeof readStatementTable> | null } {
  const fmt = kind === 'bank' ? statementFormat(path) : null;
  if (fmt) {
    const st = readStatementTable(path, fmt);
    return { table: st.table, statement: st };
  }
  return { table: readTable(path, { sheetName }), statement: null };
}

export function inspectFile(path: string, kind: FauInputKind, sheetName?: string, mapping?: Record<string, string> | null): FauInspectResult {
  const { table, statement } = tableOf(path, kind, sheetName);
  const roles = rolesFor(kind);
  const auto = detectRoles(table.headers, roles.map((r) => r.key));
  // 人改过的列优先，但只认表里真有的表头
  const merged: Record<string, string> = { ...auto };
  for (const [k, v] of Object.entries(mapping || {})) if (roles.some((r) => r.key === k)) merged[k] = v && table.headers.includes(v) ? v : '';
  return {
    path, fileName: table.fileName, kind, sheetName: table.sheetName, sheetNames: statement ? [table.sheetName] : listSheetNames(path),
    headers: table.headers, rowCount: table.rows.length, preview: table.rows.slice(0, 5), mapping: merged,
    roles: roles.map((r) => ({ key: r.key, label: r.label, required: r.required })),
    missing: missingRoles(kind, merged), erpProfile: detectErpProfile(kind, table.headers),
  };
}

export function readAndParse(
  path: string, kind: ParsedKind, sheetName: string | undefined, mapping: Record<string, string>, opts: { period?: string; accountLabel?: string } = {},
): { rows: unknown[]; issues: FauIssue[]; sheetName: string; fileName: string } {
  const { table, statement } = tableOf(path, kind, sheetName);
  const r = parseDataset(kind, table, mapping, opts);
  if (!statement) return { rows: r.rows as unknown[], issues: r.issues, sheetName: table.sheetName, fileName: table.fileName };
  // 对账单：行号换成文件里的位置（MT940 是 :61: 所在行，CAMT 是第 N 条 Ntry），再并上对账单本身的期末核对
  const rows = (r.rows as Array<{ row: number }>).map((x) => ({ ...x, row: statement.lines[x.row - 2] ?? x.row }));
  const remap = (iss: FauIssue): FauIssue => ({ ...iss, rows: iss.rows?.map((n) => statement.lines[n - 2] ?? n) });
  return { rows, issues: [...statement.issues, ...r.issues.map(remap)], sheetName: table.sheetName, fileName: table.fileName };
}
