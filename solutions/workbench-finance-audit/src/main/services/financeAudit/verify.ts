/**
 * 回核（第 6.4 节第 4 条，对应源项目的 critic）：模型写的叙述里出现的数字、单号、日期，
 * 必须能在给定数据里找到；找不到的整句标「未核实」，事实类条目直接丢弃。
 *
 * 纯函数。三语都要认：阿拉伯-印度数字（٠–٩）、阿语小数点 ٫ 与千分位 ٬、中文「万 / 亿」。
 */

const DIGIT_MAP: Record<string, string> = {};
'٠١٢٣٤٥٦٧٨٩'.split('').forEach((d, i) => { DIGIT_MAP[d] = String(i); });
'۰۱۲۳۴۵۶۷۸۹'.split('').forEach((d, i) => { DIGIT_MAP[d] = String(i); });

/** 阿拉伯-印度 / 波斯数字 → 0-9，阿语小数点 / 千分位 → . , */
export function normalizeDigits(text: string): string {
  return String(text || '')
    .replace(/[٠-٩۰-۹]/g, (d) => DIGIT_MAP[d] || d)
    .replace(/٫/g, '.')
    .replace(/[٬，]/g, ',')
    .replace(/[％\u066a]/g, '%')
    .replace(/[−–]/g, '-');
}

/** 日期写法（YYYY-MM-DD / YYYY年M月D日 / YYYY-MM / M月）先摘掉，免得被当金额 */
const DATE_PATTERNS = [
  /\b\d{4}[-/.]\d{1,2}[-/.]\d{1,2}\b/g,
  /\d{4}\s*年\s*\d{1,2}\s*月(?:\s*\d{1,2}\s*日)?/g,
  /\b\d{4}[-/.]\d{1,2}\b/g,
  /\d{1,2}\s*月\s*\d{1,2}\s*日/g,
  /\d{1,2}\s*月(?:份)?/g,
  /\b(?:FY|Q)\d{1,4}\b/gi,
];

export function extractDates(text: string): string[] {
  const t = normalizeDigits(text);
  const out = new Set<string>();
  for (const m of t.matchAll(/\b(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})\b/g)) out.add(`${m[1]}-${m[2].padStart(2, '0')}-${m[3].padStart(2, '0')}`);
  for (const m of t.matchAll(/(\d{4})\s*年\s*(\d{1,2})\s*月\s*(\d{1,2})\s*日/g)) out.add(`${m[1]}-${m[2].padStart(2, '0')}-${m[3].padStart(2, '0')}`);
  return [...out];
}

export interface ExtractedNumber {
  raw: string;
  /** 绝对值（已乘单位） */
  value: number;
  /** 按书写精度允许的误差 */
  tolerance: number;
  percent: boolean;
}

const UNIT: Record<string, number> = {
  万: 1e4, 亿: 1e8, k: 1e3, K: 1e3, thousand: 1e3, m: 1e6, M: 1e6, mn: 1e6, million: 1e6, bn: 1e9, billion: 1e9,
  ألف: 1e3, مليون: 1e6, مليار: 1e9,
};

export function extractNumbers(text: string): ExtractedNumber[] {
  let t = normalizeDigits(text);
  for (const re of DATE_PATTERNS) t = t.replace(re, ' ');
  const out: ExtractedNumber[] = [];
  const re = /(\d{1,3}(?:,\d{3})+|\d+)(?:\.(\d+))?\s*(%|万|亿|million|thousand|billion|mn|bn|ألف|مليون|مليار|[kKmM](?![a-zA-Z]))?/g;
  for (const m of t.matchAll(re)) {
    const intPart = m[1].replace(/,/g, '');
    const dec = m[2] || '';
    const unit = m[3] || '';
    const base = Number(`${intPart}${dec ? `.${dec}` : ''}`);
    if (!Number.isFinite(base)) continue;
    const percent = unit === '%';
    const mult = percent ? 1 : (UNIT[unit] || 1);
    // shortcut: 不带小数、不带单位的 100 以下整数视为笔数 / 天数 / 月份，不回核；要更严时改成按允许集合逐个核
    if (!percent && mult === 1 && !dec && base < 100) continue;
    const tolerance = 0.5 * 10 ** -dec.length * mult;
    out.push({ raw: m[0].trim(), value: Math.abs(base * mult), tolerance: Math.max(tolerance, percent ? 0 : 0.005), percent });
  }
  return out;
}

export interface NumberCheck {
  ok: boolean;
  /** 在给定数据里找不到的数字（原文写法） */
  missing: string[];
}

/**
 * @param amounts 允许引用的金额（主单位，如 12345.67；正负不论）
 * @param percents 允许引用的百分比（12.5 表示 12.5%）
 */
export function verifyNumbers(text: string, amounts: number[], percents: number[] = []): NumberCheck {
  const missing: string[] = [];
  const absAmounts = amounts.filter((n) => Number.isFinite(n)).map((n) => Math.abs(n));
  const absPct = percents.filter((n) => Number.isFinite(n)).map((n) => Math.abs(n));
  for (const n of extractNumbers(text)) {
    const pool = n.percent ? absPct : absAmounts;
    const hit = pool.some((a) => Math.abs(a - n.value) <= n.tolerance + 1e-9);
    if (!hit) missing.push(n.raw);
  }
  return { ok: missing.length === 0, missing };
}

/** 像单号的记号：含 3 位以上数字，可带字母前缀与连字符（INV-2026-0912、记-0031、PZ0031） */
export function extractRefs(text: string): string[] {
  const t = normalizeDigits(text);
  const out = new Set<string>();
  for (const m of t.matchAll(/(?:[A-Za-z\u4e00-\u9fff]{1,6}[-_#/]?)?\d{3,}(?:[-_/]\d+)*/g)) {
    const tok = m[0];
    if (/^\d{4}[-/]\d{1,2}([-/]\d{1,2})?$/.test(tok)) continue; // 日期
    if (/^\d+$/.test(tok)) continue; // 纯数字按金额核
    out.add(tok);
  }
  return [...out];
}

/**
 * 回核一段叙述：数字、单号、日期都要在数据里。
 * refs 比较时忽略大小写与前缀里的中文（「单号 INV-1」≈「INV-1」）。
 */
export function verifyNarrative(
  text: string,
  facts: { amounts: number[]; percents?: number[]; refs?: string[]; dates?: string[] },
): NumberCheck {
  const refs = extractRefs(text);
  // 单号里的数字（INV-1234、TX0915001）不当金额核
  let numericText = normalizeDigits(text);
  for (const r of refs) numericText = numericText.split(r).join(' ');
  const nums = verifyNumbers(numericText, facts.amounts, facts.percents || []);
  const missing = [...nums.missing];
  if (facts.refs) {
    const norm = (s: string) => s.replace(/[\u4e00-\u9fff]/g, '').replace(/^[-_#/]+/, '').toUpperCase();
    const known = new Set(facts.refs.map(norm));
    for (const r of refs) if (!known.has(norm(r)) && ![...known].some((k) => k && norm(r).includes(k))) missing.push(r);
  }
  if (facts.dates) {
    const known = new Set(facts.dates);
    for (const d of extractDates(text)) if (!known.has(d)) missing.push(d);
  }
  return { ok: missing.length === 0, missing };
}
