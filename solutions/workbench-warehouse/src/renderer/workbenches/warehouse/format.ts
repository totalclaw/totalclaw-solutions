/**
 * 仓储对账工作台 —— 展示层的纯格式化函数。
 *
 * 对账结果里的数字 / 字段值来自本地对账与 ERP 返回，形态不可信（字符串数字、null、
 * 嵌套对象、NaN、循环引用）。界面只允许出现三种东西：格式化后的数字、原样字符串、`—`。
 * 抽出来是为了能直接拿边界输入测，而不用挂起整个视图。
 */

/** 空值占位：null / undefined / 空串统一显示成这个。 */
export const EMPTY_PLACEHOLDER = '—';

/** JSON 美化输出；循环引用 / BigInt 等 stringify 失败时退回 String()。 */
export function formatJson(value: unknown): string {
  try {
    const text = JSON.stringify(value, null, 2);
    // JSON.stringify(undefined) / (function) 返回 undefined，而不是抛错
    return text === undefined ? String(value) : text;
  } catch {
    return String(value);
  }
}

/** 标量展示：空值 → 占位符；对象 → JSON；其它 → String()。 */
export function scalar(value: unknown): string {
  if (value === null || value === undefined || value === '') return EMPTY_PLACEHOLDER;
  if (typeof value === 'object') return formatJson(value);
  return String(value);
}

/**
 * 数字展示：能解析成有限数就按 locale 分组（`1,234.5` / `١٬٢٣٤٫٥`），否则占位符。
 * 注意 `Number('')`、`Number(null)`、`Number([])` 都是 0 —— 这些不是数字，先按 scalar 的空值规则拦掉，
 * 免得对账表里空单元格显示成 `0` 误导用户。
 */
export function formatNumber(value: unknown, locale: string = 'zh-CN'): string {
  if (value === null || value === undefined || value === '' || typeof value === 'boolean') return EMPTY_PLACEHOLDER;
  if (typeof value === 'object' || typeof value === 'symbol' || typeof value === 'function') return EMPTY_PLACEHOLDER;
  if (typeof value === 'string' && value.trim() === '') return EMPTY_PLACEHOLDER;
  const number = typeof value === 'bigint' ? Number(value) : Number(value);
  if (!Number.isFinite(number)) return EMPTY_PLACEHOLDER;
  try {
    return new Intl.NumberFormat(locale || 'zh-CN').format(number);
  } catch {
    // 非法 locale 标签（如 'zz-INVALID-!!'）会让 Intl 抛 RangeError；退回默认 locale 而不是把页面炸掉
    return new Intl.NumberFormat('zh-CN').format(number);
  }
}
