/**
 * 科目映射（第 5.3 节第 2 步）：上传一份科目余额表，把科目映射到报表大类 / 行。
 *
 *   - 中国准则：科目编码前缀直接识别大类（企业会计准则 1 资产 / 2 负债 / 3 共同 / 4 权益 / 5 成本 / 6 损益；
 *     小企业会计准则 1 资产 / 2 负债 / 3 权益 / 4 成本 / 5 损益），报表行按一级科目名称取财务智能体 reportMap.json；
 *     全部科目都有编码时自动完成，不需要人确认。
 *   - IFRS 等其它科目表：按英文 / 阿语关键词给建议，标 needsReview，由人在界面里确认后才算完成。
 */
import type { FauAccountClass, FauAccountMapEntry, FauStandard } from '@totalclaw/ipc-contracts';
import REPORT_MAP from '../financeAgent/reportMap.json';
import { firstLevelName } from '../financeAgent/statements';
import { plNature } from '../financeAgent/common';
import IFRS_WORDS from './ifrsAccountWords.json';
import type { TbRow } from './types';

type MapEntry = { key: string; names: string[] };
const CN_LINES: Array<{ cls: FauAccountClass; entries: MapEntry[] }> = [
  { cls: 'asset', entries: REPORT_MAP.balanceSheet.assets as MapEntry[] },
  { cls: 'liability', entries: REPORT_MAP.balanceSheet.liabilities as MapEntry[] },
  { cls: 'equity', entries: REPORT_MAP.balanceSheet.equity as MapEntry[] },
];
const IS_LINES = REPORT_MAP.income as MapEntry[];

function cnLineByName(name: string): { cls: FauAccountClass; line: string } | null {
  const first = firstLevelName(name);
  for (const g of CN_LINES) {
    const hit = g.entries.find((e) => e.names.includes(first));
    if (hit) return { cls: g.cls, line: hit.key };
  }
  const is = IS_LINES.find((e) => e.names.includes(first));
  if (is) return { cls: plNature(first) === 'income' ? 'revenue' : 'expense', line: is.key };
  return null;
}

/** 编码前缀 → 大类（损益类再按名称分收入 / 费用） */
export function cnClassByCode(code: string, name: string, standard: FauStandard): FauAccountClass | '' {
  if (!/^\d{4,}/.test(code)) return '';
  const d = code[0];
  const pl = (): FauAccountClass => {
    const n = plNature(firstLevelName(name));
    if (n) return n === 'income' ? 'revenue' : 'expense';
    // 名称认不出时按编码段：企业准则 60–63 / 小企业 50–53 为收益类
    const two = Number(code.slice(0, 2));
    return (standard === 'ASBE' ? two <= 53 : two <= 63) ? 'revenue' : 'expense';
  };
  if (standard === 'ASBE') return ({ 1: 'asset', 2: 'liability', 3: 'equity', 4: 'asset', 5: pl() } as Record<string, FauAccountClass>)[d] || '';
  return ({ 1: 'asset', 2: 'liability', 3: 'common', 4: 'equity', 5: 'asset', 6: pl() } as Record<string, FauAccountClass>)[d] || '';
}

const WORDS = IFRS_WORDS as unknown as Record<string, { cls: FauAccountClass; words: string[] }>;
function ifrsGuess(name: string): { cls: FauAccountClass; line: string } | null {
  const n = name.toLowerCase();
  for (const [line, def] of Object.entries(WORDS)) {
    if (line.startsWith('_')) continue;
    if (def.words.some((w) => n.includes(w.toLowerCase()))) return { cls: def.cls, line };
  }
  return null;
}

export interface AccountMapResult {
  entries: FauAccountMapEntry[];
  /** 全部科目自动识别完成（中国科目表） */
  autoComplete: boolean;
  /** 需要人逐条确认（IFRS 等） */
  needsReview: boolean;
  unmapped: number;
}

/** 余额表里每个科目一条；人工确认过的（manual）保留，其余重新识别 */
export function mapAccounts(rows: TbRow[], standard: FauStandard, previous: FauAccountMapEntry[] = []): AccountMapResult {
  const prev = new Map(previous.filter((e) => e.source === 'manual').map((e) => [e.code || e.name, e]));
  const cn = standard === 'CAS' || standard === 'ASBE';
  const seen = new Set<string>();
  const entries: FauAccountMapEntry[] = [];
  for (const r of rows) {
    const id = r.accountCode || r.accountName;
    if (seen.has(id)) continue;
    seen.add(id);
    const manual = prev.get(id);
    if (manual) { entries.push(manual); continue; }
    if (cn) {
      const byName = cnLineByName(r.accountName);
      const cls = cnClassByCode(r.accountCode, r.accountName, standard) || byName?.cls || '';
      entries.push({ code: r.accountCode, name: r.accountName, cls, line: byName?.line || '', source: 'auto' });
    } else {
      const g = ifrsGuess(r.accountName);
      entries.push({ code: r.accountCode, name: r.accountName, cls: g?.cls || '', line: g?.line || '', source: 'auto' });
    }
  }
  const unmapped = entries.filter((e) => !e.cls).length;
  const allCoded = rows.length > 0 && rows.every((r) => /^\d{4,}/.test(r.accountCode));
  const autoComplete = cn && allCoded && unmapped === 0;
  return { entries, autoComplete, needsReview: !autoComplete, unmapped };
}
