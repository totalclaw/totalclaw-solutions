/**
 * B3 外审配合（纯函数）：PBC 资料清单进度、审计调整对报表的影响。
 *
 * 调整影响（audit-adjustment-review）：按科目性质汇总每张调整凭证——资产 = 借 − 贷，负债 / 权益 = 贷 − 借，
 * 利润影响 = 收入（贷 − 借）− 费用（借 − 贷）；超过重要性水平的标出，利润影响合计超过升级门槛须 CFO 审批。
 */
import type { FauAccountMapEntry, FauAdjustment, FauPbcItem } from '@totalclaw/ipc-contracts';
import type { JournalRow, TbRow } from '../../../types';
import { accountNature, periodAmount, topLevel } from '../../accounting/common';
import { matchValue, toIsoDate, type ParsedTable } from '../table';

export function parsePbc(p: ParsedTable, asOf: string): FauPbcItem[] {
  return p.rows.filter((r) => r.get('item')).map((r, i) => {
    const provided = matchValue(r.get('status'), ['provided'] as const) === 'provided';
    const dueDate = toIsoDate(r.get('dueDate'));
    return {
      id: r.get('pbcId') || `PBC-${String(i + 1).padStart(3, '0')}`, item: r.get('item'), owner: r.get('owner'), dueDate,
      status: provided ? 'provided' : dueDate && dueDate < asOf ? 'overdue' : 'requested', ref: r.get('ref'), source: 'upload', row: r.row,
    };
  });
}

/** 转交过来的已签核底稿：按模块编号与清单里的索引号对上即记为已提供，对不上的另列为已提供条目 */
export function mergePbcHandoffs(items: FauPbcItem[], handed: Array<{ code: string; files: string[] }>): FauPbcItem[] {
  const out = items.map((x) => ({ ...x }));
  for (const h of handed) {
    const hit = out.filter((x) => x.ref && x.ref.toUpperCase().startsWith(h.code.toUpperCase()));
    if (hit.length) for (const x of hit) x.status = 'provided';
    else out.push({ id: `${h.code}-HO`, item: h.files.join(', '), owner: '', dueDate: '', status: 'provided', ref: h.code, source: 'handoff' });
  }
  return out;
}

export function adjustmentImpact(rows: JournalRow[], basis: 'cn' | 'ifrs', accountMap: FauAccountMapEntry[], materiality: number): FauAdjustment[] {
  const byVoucher = new Map<string, JournalRow[]>();
  for (const r of rows) {
    const k = r.voucherNo || `#${r.row}`;
    byVoucher.set(k, [...(byVoucher.get(k) || []), r]);
  }
  return [...byVoucher.entries()].map(([voucherNo, lines]) => {
    let asset = 0; let liab = 0; let equity = 0; let profit = 0; let dr = 0; let cr = 0;
    for (const l of lines) {
      dr += l.debit; cr += l.credit;
      const n = accountNature(l.accountCode, l.accountName, basis, accountMap);
      if (n === 'asset' || n === 'common' || n === '') asset += l.debit - l.credit;
      else if (n === 'liability') liab += l.credit - l.debit;
      else if (n === 'equity') equity += l.credit - l.debit;
      else if (n === 'revenue') profit += l.credit - l.debit;
      else if (n === 'expense') profit -= l.debit - l.credit;
    }
    return {
      voucherNo, summary: lines.find((l) => l.summary)?.summary || '', lines: lines.length, debit: dr, credit: cr, balanced: dr === cr,
      profitImpact: profit, assetImpact: asset, liabilityImpact: liab, equityImpact: equity,
      exceedsMateriality: materiality > 0 && Math.abs(profit) >= materiality,
    };
  });
}

/** 调整前利润（余额表本期：收入 − 费用，只算顶层科目） */
export function profitBefore(tb: TbRow[], basis: 'cn' | 'ifrs', accountMap: FauAccountMapEntry[]): number {
  let p = 0;
  for (const r of topLevel(tb)) {
    const n = accountNature(r.accountCode, r.accountName, basis, accountMap);
    if (n === 'revenue') p += periodAmount(n, r);
    else if (n === 'expense') p -= periodAmount(n, r);
  }
  return p;
}
