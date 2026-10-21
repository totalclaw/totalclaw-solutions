/**
 * 审计组的表格读取：按文件导入的审计表格（控制清单、样本总体、整改台账、函证清单、付款登记、主数据、规则表、名单……）
 * 在第 ③ 步读原件副本、按三语表头识别列（columnKeywords.json，先精确后包含，与 intake/columns.ts 同一口径），
 * 认不出的必需列作为阻断项写明；取值词（高 / 中 / 低、是 / 否、频率……）也按三语词表认。
 *
 * 纯函数（读文件除外）。行号与数据接入一致：表头在第 1 行，第一条数据 = 第 2 行。
 */
import { basename } from 'node:path';
import { i18nKey } from '@totalclaw/i18n';
import type { FauDatasetMeta, FauIssue } from '@totalclaw/ipc-contracts';
import { readTable, type SheetTable } from '../../../serviceSettlement/excel';
import { HEADER_OFFSET, toCents, toIsoDate, toNum } from '../../intake/common';
import KW from './columnKeywords.json';
import { AUDIT_SLOT_TABLES } from '../../../../../shared/financeAudit/auditTables';

export type AuditTable = keyof typeof KW.tables;
export const TABLE_KEYWORDS = KW.tables as Record<AuditTable, Record<string, string[]>>;
const VALUES = KW.values as Record<string, string[]>;
export const NAV_FUND_ITEMS = KW.navFundItems as Record<string, string[]>;

/** 每张表的必需列 */
export const REQUIRED: Record<AuditTable, string[]> = {
  controls: ['controlId', 'description', 'frequency'],
  population: ['ref'],
  deficiencies: ['description'],
  universe: ['area', 'likelihood', 'impact'],
  findings: ['title', 'dueDate'],
  pbc: ['item'],
  confirmations: ['confId', 'party', 'bookAmount'],
  lpStatement: ['lpId', 'ending'],
  navLp: ['lpId', 'pct'],
  navFund: ['item', 'value'],
  payments: ['payee', 'amount'],
  vendors: ['vendorName'],
  employees: ['empName'],
  kycRules: ['ruleId', 'ruleText'],
  watchlist: ['wlName'],
};

const norm = (s: string) => String(s || '').replace(/\s+/g, '').toLowerCase();
const shortAscii = (s: string) => /^[A-Za-z/]{1,2}$/.test(s);

/** 列识别：角色 → 表头（认不到为 ''） */
export function detectColumns(headers: string[], table: AuditTable): Record<string, string> {
  const roles = TABLE_KEYWORDS[table];
  const used = new Set<string>();
  const out: Record<string, string> = Object.fromEntries(Object.keys(roles).map((r) => [r, '']));
  for (const [role, kws] of Object.entries(roles)) {
    for (const kw of kws) {
      const hit = headers.find((h) => !used.has(h) && norm(h) === norm(kw));
      if (hit) { out[role] = hit; used.add(hit); break; }
    }
  }
  for (const [role, kws] of Object.entries(roles)) {
    if (out[role]) continue;
    for (const kw of kws) {
      if (shortAscii(kw) || kw.length < 2) continue;
      const hit = headers.find((h) => !used.has(h) && norm(h).includes(norm(kw)));
      if (hit) { out[role] = hit; used.add(hit); break; }
    }
  }
  return out;
}

export interface ParsedTable {
  file: string;
  mapping: Record<string, string>;
  missing: string[];
  rows: Array<{ row: number; get: (role: string) => string }>;
}

/** 从一张已读进来的表取出角色列（测试直接喂 SheetTable） */
export function parseTable(t: Pick<SheetTable, 'headers' | 'rows' | 'fileName'>, table: AuditTable): ParsedTable {
  const mapping = detectColumns(t.headers, table);
  const missing = REQUIRED[table].filter((r) => !mapping[r]);
  const rows = t.rows
    .map((r, i) => ({ row: i + HEADER_OFFSET, get: (role: string) => (mapping[role] ? String(r[mapping[role]] ?? '').trim() : '') }))
    .filter((x) => Object.values(t.rows[x.row - HEADER_OFFSET]).some((v) => String(v ?? '').trim()));
  return { file: t.fileName, mapping, missing, rows };
}

/** 读一份文件型数据集（存进项目的原件副本） */
export function readDatasetTable(meta: Pick<FauDatasetMeta, 'storedPath' | 'fileName'>, table: AuditTable): ParsedTable {
  const t = readTable(meta.storedPath);
  return parseTable({ ...t, fileName: meta.fileName || basename(meta.storedPath) }, table);
}

/** 第 ③ 步：认不出必需列 → 阻断项 */
export function missingColumnsIssue(p: ParsedTable, slotLabel: string): FauIssue | null {
  if (!p.missing.length) return null;
  return {
    id: `cols:${p.file}`, level: 'block', code: 'columns_missing',
    message: { key: i18nKey('「{p0}」{p1} 认不出这些列：{p2}；表头可参考模板'), params: { p0: slotLabel, p1: p.file, p2: p.missing.join(', ') } },
  };
}

// ── 取值词 ──

/** 按三语取值词认枚举：先精确，再包含（长词优先）；认不出返回 null */
export function matchValue<T extends string>(raw: string, options: readonly T[]): T | null {
  const s = norm(raw);
  if (!s) return null;
  for (const o of options) if ((VALUES[o] || [o]).some((w) => norm(w) === s)) return o;
  const cands = options.flatMap((o) => (VALUES[o] || [o]).filter((w) => !shortAscii(w) && w.length >= 1).map((w) => ({ o, w: norm(w) })))
    .sort((a, b) => b.w.length - a.w.length);
  for (const c of cands) if (c.w && s.includes(c.w)) return c.o;
  return null;
}

export function yesNo(raw: string): boolean | null {
  const v = matchValue(raw, ['yes', 'no'] as const);
  return v === null ? null : v === 'yes';
}

/** 0.05 / 5% / 5 → 0.05（> 1 的当百分数） */
export function toRate(raw: string): number | null {
  const n = toNum(raw);
  if (n === null) return null;
  return /%/.test(raw) || n > 1 ? n / 100 : n;
}

export { toCents, toIsoDate, toNum };

/** 模块槽位 → 表格类型（下载模板、第 ③ 步识别列用；与界面共用 shared/financeAudit/auditTables.ts） */
export const SLOT_TABLE = AUDIT_SLOT_TABLES as unknown as Record<string, Record<string, AuditTable>>;

/** 模板表头：每个角色取中 / 英 / 阿关键字各一个（表头是数据，不是界面文案），导回来能自动认列 */
export function templateHeaders(table: AuditTable): string[] {
  return Object.values(TABLE_KEYWORDS[table]).map((kws) => {
    const zh = kws.find((k) => /\p{Script=Han}/u.test(k)) || '';
    const en = kws.find((k) => /^[A-Za-z]/.test(k)) || '';
    const ar = kws.find((k) => /\p{Script=Arabic}/u.test(k)) || '';
    return [zh, en, ar].filter(Boolean).join(' / ');
  });
}
