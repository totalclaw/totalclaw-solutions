/**
 * G6 面板共用：按单位格式化数值（一律西方阿拉伯数字，模板里经 FauNum 包 <bdi dir="ltr">）、来源标注、单元格文案。
 */
import type { FauCapCell, FauCapSource, FauCapUnit } from '@totalclaw/ipc-contracts';
import { sourceTag } from '../../../../../shared/financeAudit/capital/specs';
import { t as i18nT } from '../../../../i18n';
import { msg, numberLocale } from '../../shared';

const NUMERIC: FauCapUnit[] = ['money', 'pct', 'x', 'num', 'int', 'years', 'months', 'bp'];
export const isNumeric = (u: FauCapUnit): boolean => NUMERIC.includes(u);

export function fmtCap(v: FauCapCell | undefined, unit: FauCapUnit): string {
  if (v === null || v === undefined || v === '') return '-';
  if (typeof v === 'object') return msg(v);
  if (typeof v !== 'number') return unit === 'text' || unit === 'select' || unit === 'date' ? v : i18nT(v);
  if (!Number.isFinite(v)) return '-';
  const nf = (o: Intl.NumberFormatOptions) => new Intl.NumberFormat(numberLocale(), o).format(v);
  switch (unit) {
    case 'pct': return new Intl.NumberFormat(numberLocale(), { style: 'percent', minimumFractionDigits: 1, maximumFractionDigits: 2 }).format(v);
    case 'money': return nf({ minimumFractionDigits: 2, maximumFractionDigits: 2 });
    case 'x': return `${nf({ minimumFractionDigits: 1, maximumFractionDigits: 2 })}x`;
    case 'bp': return `${nf({ maximumFractionDigits: 1 })} bp`;
    case 'int': return nf({ maximumFractionDigits: 0 });
    default: return nf({ maximumFractionDigits: 4 });
  }
}

export function srcText(src: FauCapSource | undefined): string {
  return msg(sourceTag(src));
}

/** 录入框里显示的值：比例显示为百分数 */
export function toInput(v: number | string | null | undefined, unit: FauCapUnit): string {
  if (v === null || v === undefined) return '';
  if (typeof v === 'number' && unit === 'pct') return String(Math.round(v * 1e8) / 1e6);
  return String(v);
}

/** 录入框 → 存的值：比例按百分数除 100；数字规整阿语数字与千分位 */
export function fromInput(raw: string, unit: FauCapUnit): number | string | null {
  const s = raw.trim();
  if (!s) return null;
  if (!isNumeric(unit)) return s;
  const n = Number(s.replace(/[٠-٩]/g, (d) => String('٠١٢٣٤٥٦٧٨٩'.indexOf(d))).replace(/[,\s%]/g, '').replace('٫', '.'));
  if (!Number.isFinite(n)) return null;
  return unit === 'pct' ? n / 100 : n;
}
