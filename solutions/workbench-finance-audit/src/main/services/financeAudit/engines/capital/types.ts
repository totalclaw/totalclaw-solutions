/** G6 引擎的统一输出：指标、结果表、提醒；numbers 是叙述回核时额外允许引用的数字 */
import { i18nKey } from '@totalclaw/i18n';
import type { FauCapColumn, FauCapFlag, FauCapMetric, FauCapTable, FauCapUnit, FauMsg } from '@totalclaw/ipc-contracts';
import type { CapIn } from './inputs';

export interface CapOut {
  metrics: FauCapMetric[];
  tables: FauCapTable[];
  flags: FauCapFlag[];
  numbers?: number[];
  /** 引擎内部明细（F1 公式联动模型的写出要用） */
  detail?: unknown;
}

export interface CapEngine {
  /** 引擎特有的阻断检查（如永续增长率必须小于 WACC）；返回阻断原因 */
  check?(v: CapIn): FauMsg[];
  run(v: CapIn): CapOut;
}

export const met = (id: string, label: string, value: number | string | null, unit: FauCapUnit, flag?: FauCapMetric['flag']): FauCapMetric => ({ id, label, value: typeof value === 'number' && !Number.isFinite(value) ? null : value, unit, flag });
export const col = (key: string, label: string, unit: FauCapUnit): FauCapColumn => ({ key, label, unit });
export const tbl = (id: string, title: string, columns: FauCapColumn[], rows: FauCapTable['rows']): FauCapTable => ({ id, title, columns, rows });
export const warn = (id: string, key: string, params?: Record<string, string | number>): FauCapFlag => ({ id, level: 'warn', message: { key, params } });
export const info = (id: string, key: string, params?: Record<string, string | number>): FauCapFlag => ({ id, level: 'info', message: { key, params } });
export const msg = (key: string, params?: Record<string, string | number>): FauMsg => ({ key, params });
/** 表格里的固定文案单元格（词典 key，展示端翻译） */
export const k = (key: string): FauMsg => ({ key });

/** 百分比文本（提醒文案的参数用，西方阿拉伯数字） */
export const pctText = (x: number | null | undefined, digits = 1): string => (x === null || x === undefined || !Number.isFinite(x) ? '-' : `${(x * 100).toFixed(digits)}%`);
export const numText = (x: number | null | undefined, digits = 2): string => (x === null || x === undefined || !Number.isFinite(x) ? '-' : x.toFixed(digits));

export const L = {
  year: i18nKey('年度'), name: i18nKey('名称'), value: i18nKey('数值'), low: i18nKey('低值'), high: i18nKey('高值'), mid: i18nKey('中值'),
  item: i18nKey('项目'), amount: i18nKey('金额'), status: i18nKey('状态'), note: i18nKey('备注'), rank: i18nKey('排名'), score: i18nKey('得分'),
};
