/**
 * 流水线共用的小工具：模型 JSON 解析、日期、句子切分、数字回核。全是纯函数。
 */
import { CN_COUNT_UNITS, CN_DIGIT, CN_DIGITS_ONLY_RE, CN_MAGNITUDE, CN_WAN, cnNumberWithUnitRe } from './matchWords';

/** 模型回的 JSON：去掉思考块 / 代码围栏，取第一个完整的 {...} 或 [...]；解析不了返回 null */
export function parseLlmJson<T = any>(raw: string | null | undefined): T | null {
  if (!raw) return null;
  let s = String(raw).replace(/<think>[\s\S]*?<\/think>/gi, '').trim();
  const fence = /```(?:json)?\s*([\s\S]*?)```/i.exec(s);
  if (fence) s = fence[1]!.trim();
  try { return JSON.parse(s) as T; } catch { /* 往下找 */ }
  for (const open of ['{', '[']) {
    const close = open === '{' ? '}' : ']';
    let start = s.indexOf(open);
    while (start >= 0) {
      let depth = 0;
      let inStr = false;
      let esc = false;
      for (let i = start; i < s.length; i++) {
        const c = s[i]!;
        if (inStr) {
          if (esc) esc = false;
          else if (c === '\\') esc = true;
          else if (c === '"') inStr = false;
          continue;
        }
        if (c === '"') inStr = true;
        else if (c === open) depth++;
        else if (c === close) {
          depth--;
          if (depth === 0) {
            try { return JSON.parse(s.slice(start, i + 1)) as T; } catch { break; }
          }
        }
      }
      start = s.indexOf(open, start + 1);
    }
  }
  return null;
}

// ─── 日期（'YYYY-MM-DD'，按日历算，不受时区影响）────────────────────────────

export function isDateStr(s: unknown): s is string {
  if (typeof s !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(s)) return false;
  const [y, m, d] = s.split('-').map(Number) as [number, number, number];
  const dt = new Date(Date.UTC(y, m - 1, d));
  return dt.getUTCFullYear() === y && dt.getUTCMonth() === m - 1 && dt.getUTCDate() === d;
}

export function addDays(date: string, n: number): string {
  const [y, m, d] = date.split('-').map(Number) as [number, number, number];
  const dt = new Date(Date.UTC(y, m - 1, d + n));
  return dt.toISOString().slice(0, 10);
}

export function daysBetween(a: string, b: string): number {
  const pa = a.split('-').map(Number) as [number, number, number];
  const pb = b.split('-').map(Number) as [number, number, number];
  return Math.round((Date.UTC(pb[0], pb[1] - 1, pb[2]) - Date.UTC(pa[0], pa[1] - 1, pa[2])) / 86400000);
}

/** 本地时区的日期串 */
export function localDateStr(ms: number): string {
  const d = new Date(ms);
  const p = (x: number) => String(x).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

/** 截止日当天结束（本地时区）的毫秒时间戳 */
export function endOfDayMs(date: string): number {
  const [y, m, d] = date.split('-').map(Number) as [number, number, number];
  return new Date(y, m - 1, d, 23, 59, 59, 999).getTime();
}

export function fmtClock(sec: number): string {
  const s = Math.max(0, Math.floor(sec));
  const p = (x: number) => String(x).padStart(2, '0');
  return `${p(Math.floor(s / 3600))}:${p(Math.floor((s % 3600) / 60))}:${p(s % 60)}`;
}

// ─── 句子 ──────────────────────────────────────────────────────────────────

/** 按中英文句末标点切句，保留句末标点 */
export function splitSentences(text: string): string[] {
  const out: string[] = [];
  const re = /[^。！？!?；;\n]+[。！？!?；;]*|[。！？!?；;]+/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text))) {
    const s = m[0].trim();
    if (s && !/^[。！？!?；;]+$/.test(s)) out.push(s);
  }
  return out;
}

export function truncate(s: string, n: number): string {
  const t = s.trim();
  return t.length > n ? `${t.slice(0, n)}…` : t;
}

// ─── 数字回核：叙述里的数字必须在给模型的材料里出现过 ─────────────────────────

/** 「三十五」「一百零二」「两千」→ 数字；认不了返回 null */
export function cnToInt(s: string): number | null {
  if (!s) return null;
  if (CN_DIGITS_ONLY_RE.test(s) && s.length > 1) {
    return Number(Array.from(s, c => CN_DIGIT[c]).join(''));
  }
  let total = 0;
  let section = 0;
  let num = 0;
  for (const c of s) {
    if (c in CN_DIGIT) num = CN_DIGIT[c]!;
    else if (c in CN_MAGNITUDE) { section += (num || 1) * CN_MAGNITUDE[c]!; num = 0; }
    else if (c === CN_WAN) { total += (section + num) * 10000; section = 0; num = 0; }
    else return null;
  }
  return total + section + num;
}

function normNum(s: string): string {
  const n = Number(s);
  if (!Number.isFinite(n)) return s;
  return String(Math.round(n * 100) / 100);
}

/** 文本里出现的数字（阿拉伯数字；中文数字只认「数 + 量词」，不认序数「第一」） */
export function numberTokens(text: string): string[] {
  const out: string[] = [];
  for (const m of text.matchAll(/\d+(?:\.\d+)?/g)) out.push(normNum(m[0]));
  for (const m of text.matchAll(cnNumberWithUnitRe(CN_COUNT_UNITS))) {
    const v = cnToInt(m[2]!);
    if (v !== null) out.push(String(v));
  }
  return out;
}

/**
 * 叙述回核：含有材料里没有的数字的句子整句删掉（「对不上的句子删掉」）。返回保留下来的文字和删了几句。
 */
export function guardNumbers(narrative: string, allowed: Set<string> | string): { text: string; dropped: number } {
  const set = typeof allowed === 'string' ? new Set(numberTokens(allowed)) : allowed;
  let dropped = 0;
  const kept: string[] = [];
  for (const line of narrative.split('\n')) {
    // 列表符号不算数字（「1. 」「- 」）
    const lead = /^\s*(?:[-*+]|\d{1,2}[.)、]|#{1,6})\s+/.exec(line)?.[0] || '';
    const sents = splitSentences(line.slice(lead.length));
    if (!sents.length) { kept.push(line); continue; }
    const ok = sents.filter(s => {
      const bad = numberTokens(s).some(n => !set.has(n));
      if (bad) dropped++;
      return !bad;
    });
    if (ok.length) kept.push(lead + joinSentences(ok));
  }
  return { text: kept.join('\n').replace(/\n{3,}/g, '\n\n').trim(), dropped };
}

export function joinSentences(sents: string[]): string {
  let out = '';
  for (const s of sents) {
    if (out && /[.!?;,]$/.test(out) && /^[A-Za-z0-9]/.test(s)) out += ' ';
    out += s;
  }
  return out;
}

export function shortId(prefix: string, n: number): string {
  return `${prefix}_${n}`;
}

export function randomId(prefix: string): string {
  return `${prefix}_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
}
