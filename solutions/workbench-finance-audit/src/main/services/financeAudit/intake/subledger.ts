/** 总账 / 子账提取 → LedgerExtractRow（键去空格转大写） */
import { i18nKey } from '@totalclaw/i18n';
import type { SheetTable } from '../../serviceSettlement/excel';
import type { LedgerExtractRow } from '../types';
import { HEADER_OFFSET, get, issue, toCents, toIsoDate, toNum, type ParseResult } from './common';

export function parseSubledger(t: SheetTable, mp: Record<string, string>): ParseResult<'subledger'> {
  const rows: LedgerExtractRow[] = [];
  const noKey: number[] = [];
  t.rows.forEach((r, i) => {
    const row = i + HEADER_OFFSET;
    // 键统一：去空格、转大写（第 5.5 节 A2 第 ③ 步）
    const key = get(r, mp, 'key').replace(/\s+/g, '').toUpperCase();
    if (!key) { if (Object.values(r).some((v) => String(v).trim())) noKey.push(row); return; }
    rows.push({
      row, key, date: toIsoDate(get(r, mp, 'date')), amount: toCents(get(r, mp, 'localAmount')),
      quantity: mp.quantity ? toNum(get(r, mp, 'quantity')) : null,
      fxAmount: mp.fxAmount ? toCents(get(r, mp, 'fxAmount')) : null,
      currency: get(r, mp, 'currency'), docNo: get(r, mp, 'docNo'), desc: get(r, mp, 'summary'),
    });
  });
  return { rows, issues: noKey.length ? [issue('warn', 'rows_skipped', i18nKey('{n} 行没有对账键，已跳过'), { n: noKey.length }, noKey)] : [] };
}
