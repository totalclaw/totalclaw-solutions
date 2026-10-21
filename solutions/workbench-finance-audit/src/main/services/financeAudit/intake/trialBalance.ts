/** 科目余额表 → TbRow（合计行不算科目） */
import type { SheetTable } from '../../serviceSettlement/excel';
import type { TbRow } from '../types';
import { HEADER_OFFSET, get, splitAccount, toCents, toNum, type ParseResult } from './common';

export function parseTb(t: SheetTable, mp: Record<string, string>): ParseResult<'tb'> {
  const rows: TbRow[] = [];
  t.rows.forEach((r, i) => {
    const row = i + HEADER_OFFSET;
    const acct = splitAccount(get(r, mp, 'accountCode'), get(r, mp, 'accountName'));
    if (!acct.name) return;
    // 合计行不是科目
    if (/^(合计|总计|total|grand total|المجموع|الإجمالي)$/i.test(acct.name.replace(/\s+/g, ' ').trim())) return;
    const tb: TbRow = {
      row, accountCode: acct.code, accountName: acct.name, level: toNum(get(r, mp, 'level')),
      openingDr: toCents(get(r, mp, 'openingDebit')), openingCr: toCents(get(r, mp, 'openingCredit')),
      periodDr: toCents(get(r, mp, 'periodDebit')), periodCr: toCents(get(r, mp, 'periodCredit')),
      closingDr: toCents(get(r, mp, 'closingDebit')), closingCr: toCents(get(r, mp, 'closingCredit')),
    };
    rows.push(tb);
  });
  return { rows, issues: [] };
}
