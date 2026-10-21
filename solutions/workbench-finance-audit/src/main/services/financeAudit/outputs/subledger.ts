/**
 * 批次 2（A3–A8）产出共用：问题标记转文字、分录草稿（系统生成的标准科目名按输出语言翻译，用户科目名原样）、
 * 通用凭证导入格式文件（第一行表头、状态列逐行「草稿」，与 A1 关账包的导入文件同一套列）。
 */
import { join } from 'node:path';
import { i18nKey } from '@totalclaw/i18n';
import type { FauFlag, FauJeLine } from '@totalclaw/ipc-contracts';
import { flagKey } from '../../../../shared/financeAudit/accountingLabels';
import { OUT, labeler, outputFileName, type L } from './common';
import { major, writeWorkbookFile, type XCell } from './xlsx';
import { JE_COLUMNS, type OutputCtx } from './close';

export const flagsText = (flags: FauFlag[], t: L): string => flags.map((f) => t(flagKey(f.code), f.params)).join('; ');

export function jeRowsOf(lines: FauJeLine[], t: L): XCell[][] {
  return lines.map((l) => [l.date, l.voucherNo, l.lineNo, l.summary, l.accountCode, l.nameIsKey ? t(l.accountName) : l.accountName, l.aux, major(l.debit) || null, major(l.credit) || null, t(i18nKey('草稿'))]);
}

export function writeJeFile(ctx: OutputCtx, je: FauJeLine[]): string | null {
  if (!je.length) return null;
  const t = labeler(ctx.locale);
  const path = join(ctx.dir, outputFileName(ctx.moduleCode, t(i18nKey('凭证导入草稿')), ctx.period, 'xlsx', ctx.at));
  writeWorkbookFile(path, [
    { name: t(i18nKey('分录草稿')), headers: JE_COLUMNS.map((k) => t(k)), rows: jeRowsOf(je, t) },
    { name: t(i18nKey('说明')), rows: [[t(OUT.draft)], [t(OUT.boundary)]] },
  ], { rtl: ctx.locale === 'ar' });
  return path;
}

/** 分录借贷合计（Checks 用） */
export function jeBalanced(je: FauJeLine[]): boolean {
  const byVoucher = new Map<string, number>();
  for (const l of je) byVoucher.set(l.voucherNo, (byVoucher.get(l.voucherNo) || 0) + l.debit - l.credit);
  return [...byVoucher.values()].every((d) => d === 0);
}
