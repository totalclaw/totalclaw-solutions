/**
 * 批次 5（fpa，D1–D10）新增的标准数据集行（第 7.1 节）。和 types.ts 同一套约定：
 * row 是原表行号（表头下第一行 = 2），所有结果都能追溯回「数据集 + 行号」。
 */

/** KPI / 指标表（D2 KPI、D6 洞察的时间序列、D8 ESG 数据、D9 战略目标共用）。数值按原单位存（不是分）。 */
export interface KpiRow {
  row: number;
  indicator: string;
  /** 类别：业务线 / 部门；ESG 用 E / S / G */
  category: string;
  /** YYYY-MM / YYYY / YYYY-Qn */
  period: string;
  target: number | null;
  actual: number | null;
  unit: string;
  /** higher：越高越好；lower：越低越好（周转天数、成本率、排放量） */
  direction: 'higher' | 'lower';
  owner: string;
}

/** 成本要素：直接材料 / 直接人工 / 制造费用 / 其它（预算量价表） */
export type PvElement = 'material' | 'labor' | 'overhead' | 'other';

/** 量价表（D4 预算量差价差、D5 标准成本差异）。数量按原单位，单价按主单位（元，可带小数），差异算出来再换成分。 */
export interface PvRow {
  row: number;
  item: string;
  element: PvElement;
  costCenter: string;
  period: string;
  /** 标准 / 预算数量（按实际产量折算后的标准用量或工时） */
  stdQty: number;
  stdPrice: number;
  actualQty: number;
  actualPrice: number;
}
