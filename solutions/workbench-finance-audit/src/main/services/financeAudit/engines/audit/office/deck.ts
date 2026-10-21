/**
 * P4 演示文稿质检与刷新（ib-check-deck / deck-refresh 的规则部分，纯函数；入参是 pptxEditor.readPptx 的结果）。
 *
 * 质检：同一指标（收入、EBITDA、净利润、毛利率、倍数、市场份额……）同一期间在不同页数值不一致 → 严重；
 *   单位写法混用（$M 与 $MM、1,000 与 1K）与日期格式混用 → 次要；口语、缩写、感叹号、占位符（TBD / XX / 待定）→ 重要；
 *   有数字却没有来源说明的页 → 重要。只读，不改文件。
 * 刷新：按「旧值 → 新值」映射找出所有写法（$485M / $485.0 million / 485MM），换成新值并保留原写法的单位与小数位；
 *   映射里没有、但和被改数字同页的百分比（增长率、份额）只提示、不改。先出计划，人确认后另存一份新文件，原文件不动。
 * shortcut: 只处理文本框里的文字（readPptx 的范围），表格与图表数据不在内；需要时接 pptxEditor 的表格支持再扩。
 */
import type { FauDeckChange, FauQcFinding } from '@totalclaw/ipc-contracts';
import type { PptDoc, PptPatch } from '../../../../pptxEditor';

const SCALE: Record<string, number> = {
  k: 1e3, thousand: 1e3, m: 1e6, mm: 1e6, mn: 1e6, million: 1e6, b: 1e9, bn: 1e9, billion: 1e9, '万': 1e4, '亿': 1e8, '千': 1e3,
  'ألف': 1e3, 'مليون': 1e6, 'مليار': 1e9,
};
/** 带单位的数字：可选货币符号、数字（千分位 / 小数）、可选单位 */
const NUM = /(?<![\w.])([$€£¥]|SAR|USD|RMB|CNY)?\s?(\d{1,3}(?:,\d{3})+|\d+)(?:\.(\d+))?\s?(%|x(?![a-zA-Z])|倍|MM|mm|bn|mn|million|billion|thousand|万|亿|千|مليون|مليار|ألف|[KkMmBb](?![a-zA-Z]))?/g;

export interface NumToken { text: string; start: number; value: number; unit: string; decimals: number; percent: boolean; multiple: boolean; currency: string }

export function tokens(text: string): NumToken[] {
  const out: NumToken[] = [];
  for (const m of text.matchAll(NUM)) {
    const unitRaw = m[4] || '';
    const unit = unitRaw.toLowerCase();
    const base = Number(`${m[2].replace(/,/g, '')}${m[3] ? `.${m[3]}` : ''}`);
    if (!Number.isFinite(base)) continue;
    // 年份、页码这类不带单位的四位以内整数不当指标数字
    if (!unitRaw && !m[1] && !m[3] && !m[2].includes(',') && base < 10000) continue;
    out.push({
      text: m[0], start: m.index ?? 0, value: base * (SCALE[unit] || 1), unit: unitRaw, decimals: (m[3] || '').length,
      percent: unit === '%', multiple: unit === 'x' || unit === '倍', currency: m[1] || '',
    });
  }
  return out;
}

const METRICS: Array<[string, RegExp]> = [
  ['revenue', /营业收入|营收|收入|revenue|sales|turnover|الإيرادات|المبيعات/i],
  ['ebitda', /ebitda/i],
  ['net_income', /净利润|net income|net profit|صافي الربح/i],
  ['margin', /毛利率|利润率|margin|هامش/i],
  ['multiple', /倍数|ev\/ebitda|multiple|p\/e|مضاعف/i],
  ['share', /市场份额|市占率|market share|الحصة السوقية/i],
];
const PERIOD = /(FY|LTM|NTM|Q[1-4])\s?'?\d{2,4}|\d{4}\s?(?:年|财年)|\d{4}\s?Q[1-4]/i;

interface Para { slide: number; sp: number; p: number; text: string }
function paragraphs(doc: PptDoc): Para[] {
  const out: Para[] = [];
  for (const s of doc.slides) {
    for (const sh of s.shapes) {
      const byP = new Map<number, string>();
      for (const r of sh.runs) byP.set(r.p, (byP.get(r.p) || '') + r.text);
      for (const [p, text] of byP) if (text.trim()) out.push({ slide: s.index, sp: sh.sp, p, text });
    }
  }
  return out;
}

const CASUAL = /\b(pretty good|a lot of|lots of|kind of|sort of|awesome|super|huge|basically|stuff)\b|超级|非常非常|特别特别/i;
const CONTRACTION = /\b(don't|can't|won't|isn't|aren't|it's|we're|they're|we've|didn't|doesn't)\b/i;
const PLACEHOLDER = /\b(TBD|TBC|TODO|XXX?|lorem ipsum)\b|\[\s*\]|待定|待补|待填|سيتم التحديد/i;
const SOURCE = /source|来源|资料来源|数据来源|المصدر/i;

export function checkDeck(doc: PptDoc, file: string): FauQcFinding[] {
  const out: FauQcFinding[] = [];
  const paras = paragraphs(doc);
  const add = (location: string, rule: string, severity: FauQcFinding['severity'], detail: string) => out.push({ id: `${location}:${rule}:${out.length}`, location, rule, severity, detail });
  // 1 同一指标同一期间的数值一致
  const seen = new Map<string, Array<{ slide: number; value: number; text: string }>>();
  for (const p of paras) {
    const metric = METRICS.find(([, re]) => re.test(p.text))?.[0];
    if (!metric) continue;
    const period = (p.text.match(PERIOD)?.[0] || '').replace(/\s+/g, '').toUpperCase();
    const toks = tokens(p.text).filter((t) => (metric === 'margin' || metric === 'share' ? t.percent : metric === 'multiple' ? t.multiple : !t.percent && !t.multiple));
    if (!toks.length) continue;
    const k = `${metric}|${period}`;
    seen.set(k, [...(seen.get(k) || []), { slide: p.slide, value: toks[0].value, text: toks[0].text }]);
  }
  for (const [k, list] of seen) {
    const values = [...new Set(list.map((x) => Math.round(x.value * 1000) / 1000))];
    if (values.length > 1 && new Set(list.map((x) => x.slide)).size > 1) {
      add(list.map((x) => `#${x.slide}`).join(' '), 'number_mismatch', 'critical', `${k.split('|')[0]} ${k.split('|')[1]}: ${list.map((x) => `#${x.slide} ${x.text}`).join(' / ')}`);
    }
  }
  // 2 单位与日期写法混用
  const all = paras.map((p) => p.text).join('\n');
  if (/\$\s?\d[\d,.]*\s?M(?![Mm])\b/.test(all) && /\$\s?\d[\d,.]*\s?MM\b/.test(all)) add(file, 'unit_style', 'minor', '$M / $MM');
  if (/\d{1,3}(,\d{3})+(?!\d)/.test(all) && /\d+(\.\d+)?\s?K\b/.test(all)) add(file, 'unit_style', 'minor', '1,000 / 1K');
  if (/\b\d{4}-\d{2}-\d{2}\b/.test(all) && /\b\d{1,2}\/\d{1,2}\/\d{2,4}\b/.test(all)) add(file, 'date_format', 'minor', 'YYYY-MM-DD / MM/DD/YYYY');
  // 3 措辞与占位符
  for (const p of paras) {
    const loc = `#${p.slide}`;
    if (PLACEHOLDER.test(p.text)) add(loc, 'placeholder', 'important', p.text.slice(0, 120));
    if (CASUAL.test(p.text)) add(loc, 'casual_language', 'important', p.text.slice(0, 120));
    if (CONTRACTION.test(p.text)) add(loc, 'contraction', 'minor', p.text.slice(0, 120));
    if (/[!！]/.test(p.text)) add(loc, 'exclamation', 'minor', p.text.slice(0, 120));
  }
  // 4 有数字没来源
  for (const s of doc.slides) {
    const text = s.shapes.flatMap((sh) => sh.runs.map((r) => r.text)).join(' ');
    if (tokens(text).length >= 3 && !SOURCE.test(text)) add(`#${s.index}`, 'missing_source', 'important', '');
  }
  return out;
}

// ── 刷新 ──

export interface RefreshMapping { from: string; to: string }

function parseOne(s: string): NumToken | null {
  return tokens(s)[0] || null;
}

/** 按原写法的单位与小数位写新值：$485.0 million → $512.0 million */
export function restyle(tok: NumToken, newValue: number): string {
  const scale = SCALE[tok.unit.toLowerCase()] || 1;
  const mant = newValue / scale;
  const usesComma = /\d,\d{3}/.test(tok.text);
  const num = usesComma
    ? mant.toLocaleString('en-US', { minimumFractionDigits: tok.decimals, maximumFractionDigits: tok.decimals })
    : mant.toFixed(tok.decimals);
  const m = tok.text.match(/^([$€£¥]|SAR|USD|RMB|CNY)?(\s?)[\d,.]+(\s?)(.*)$/);
  return m ? `${m[1] || ''}${m[2]}${num}${m[3]}${m[4]}` : num;
}

export function planRefresh(doc: PptDoc, mapping: RefreshMapping[]): { changes: FauDeckChange[]; flagged: { slide: number; text: string }[]; patches: PptPatch[] } {
  const maps = mapping.map((m) => ({ ...m, a: parseOne(m.from), b: parseOne(m.to) })).filter((m) => m.a && m.b) as Array<RefreshMapping & { a: NumToken; b: NumToken }>;
  const changes: FauDeckChange[] = [];
  const patches: PptPatch[] = [];
  const changedSlides = new Set<number>();
  for (const s of doc.slides) {
    for (const sh of s.shapes) {
      for (const r of sh.runs) {
        let text = r.text;
        let shift = 0;
        for (const tok of tokens(r.text)) {
          const hit = maps.find((m) => m.a.percent === tok.percent && m.a.multiple === tok.multiple && Math.abs(m.a.value - tok.value) <= Math.abs(m.a.value) * 1e-9 + 1e-9);
          if (!hit) continue;
          const repl = restyle(tok, hit.b.value);
          const at = tok.start + shift;
          text = text.slice(0, at) + repl + text.slice(at + tok.text.length);
          shift += repl.length - tok.text.length;
          changes.push({ slide: s.index, sp: r.sp, p: r.p, r: r.r, before: tok.text, after: repl, from: hit.from, to: hit.to });
          changedSlides.add(s.index);
        }
        if (text !== r.text) patches.push({ slide: s.index, sp: r.sp, p: r.p, r: r.r, text });
      }
    }
  }
  // 同页上的百分比（增长率、份额）可能是派生数字：只提示，不改
  const flagged: { slide: number; text: string }[] = [];
  for (const s of doc.slides.filter((x) => changedSlides.has(x.index))) {
    for (const p of paragraphs({ ...doc, slides: [s] })) {
      if (tokens(p.text).some((t) => t.percent && !maps.some((m) => m.a.percent && Math.abs(m.a.value - t.value) < 1e-9))) flagged.push({ slide: s.index, text: p.text.slice(0, 160) });
    }
  }
  return { changes, flagged, patches };
}
