/**
 * HS 编码候选检索（本地关键词，不联网、不调模型）。
 *
 * 底表是 datasets/harmonized-system 的 HS2022 六位编码表（ODC-PDDL-1.0，数据来自 UN Comtrade），
 * 随包放在 resources/foreign-trade/hs2022.csv。流程：本地检索出 Top-N → 模型重排并写理由 → 人工确认；
 * 业界最好的智能体十位编码准确率也不到一半（AIDC-AI/HSCodeComp），所以这里只给候选，不替人定。
 *
 * 本文件刻意不依赖 electron / i18n：开发期评测脚本 scripts/eval-hs-suggest.mjs 直接复用同一份检索。
 */
import type { FtHsCandidate } from '@totalclaw/ipc-contracts';

export interface HsRow { section: string; code: string; description: string; parent: string; level: number }

export interface HsTable {
  rows: HsRow[];
  byCode: Map<string, HsRow>;
  docs: Array<{ row: HsRow; own: Set<string>; heading: Set<string>; chapter: Set<string> }>;
  idf: Map<string, number>;
}

function splitCsvLine(line: string): string[] {
  const out: string[] = [];
  let cell = '';
  let q = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (q) { if (ch === '"') { if (line[i + 1] === '"') { cell += '"'; i++; } else q = false; } else cell += ch; } else if (ch === '"') q = true;
    else if (ch === ',') { out.push(cell); cell = ''; } else cell += ch;
  }
  out.push(cell);
  return out;
}

export function parseHsCsv(text: string): HsRow[] {
  const lines = text.replace(/^﻿/, '').split(/\r?\n/).filter(Boolean);
  const head = splitCsvLine(lines[0]).map((h) => h.trim().toLowerCase());
  const at = (n: string) => head.indexOf(n);
  return lines.slice(1).map(splitCsvLine).map((c) => ({
    section: c[at('section')] || '', code: (c[at('hscode')] || '').trim(), description: (c[at('description')] || '').trim(),
    parent: (c[at('parent')] || '').trim(), level: Number(c[at('level')]) || 0,
  })).filter((r) => /^\d{2,6}$/.test(r.code));
}

const STOP = new Set(['of', 'and', 'the', 'or', 'for', 'other', 'others', 'with', 'not', 'nes', 'than', 'whether', 'in', 'on', 'to', 'by',
  'a', 'an', 'its', 'their', 'thereof', 'parts', 'but', 'excluding', 'including', 'n', 'e', 's', 'whose', 'which', 'be', 'are', 'is', 'as', 'at',
  'from', 'more', 'less', 'used', 'type', 'kind', 'kinds', 'any', 'such', 'similar', 'heading']);

/** 小写、按非字母切、去停用词、粗略词干（复数 → 单数） */
export function hsTokens(text: string): string[] {
  return String(text || '').toLowerCase().split(/[^a-z0-9]+/).filter((w) => w.length > 1 && !STOP.has(w) && !/^\d+$/.test(w)).map((w) => {
    if (w.length > 4 && w.endsWith('ies')) return `${w.slice(0, -3)}y`;
    if (w.length > 4 && /(ches|shes|sses|xes)$/.test(w)) return w.slice(0, -2);
    if (w.length > 3 && w.endsWith('s') && !w.endsWith('ss')) return w.slice(0, -1);
    return w;
  });
}

export function buildHsTable(rows: HsRow[]): HsTable {
  const byCode = new Map(rows.map((r) => [r.code, r]));
  const six = rows.filter((r) => r.code.length === 6);
  const docs = six.map((row) => ({
    row,
    own: new Set(hsTokens(row.description)),
    heading: new Set(hsTokens(byCode.get(row.code.slice(0, 4))?.description || '')),
    chapter: new Set(hsTokens(byCode.get(row.code.slice(0, 2))?.description || '')),
  }));
  const df = new Map<string, number>();
  for (const d of docs) for (const t of new Set([...d.own, ...d.heading])) df.set(t, (df.get(t) || 0) + 1);
  const idf = new Map<string, number>();
  for (const [t, n] of df) idf.set(t, Math.log(1 + docs.length / n));
  return { rows, byCode, docs, idf };
}

/**
 * 关键词检索：查询词在子目自己的描述里命中权重 1，在所属品目（4 位）里 0.6，在章（2 位）里 0.3，按 IDF 加权；
 * 分数归一到 0～1（查询词全部在子目描述里命中 = 1）。
 */
export function hsSearch(table: HsTable, query: string, topN = 20): FtHsCandidate[] {
  const q = [...new Set(hsTokens(query))];
  if (!q.length) return [];
  const maxIdf = Math.log(1 + table.docs.length);
  const weightOf = (t: string) => table.idf.get(t) ?? maxIdf;
  const total = q.reduce((s, t) => s + weightOf(t), 0);
  const scored: FtHsCandidate[] = [];
  for (const d of table.docs) {
    let s = 0;
    for (const t of q) {
      const w = weightOf(t);
      if (d.own.has(t)) s += w;
      else if (d.heading.has(t)) s += 0.6 * w;
      else if (d.chapter.has(t)) s += 0.3 * w;
    }
    if (s > 0) scored.push({ code: d.row.code, description: hsPath(table, d.row.code), score: Math.round((s / total) * 1000) / 1000 });
  }
  scored.sort((a, b) => b.score - a.score || a.code.localeCompare(b.code));
  return scored.slice(0, topN);
}

/** 「章 › 品目 › 子目」的完整描述，给人和模型看 */
export function hsPath(table: HsTable, code: string): string {
  const six = table.byCode.get(code.slice(0, 6));
  const heading = table.byCode.get(code.slice(0, 4));
  const chapter = table.byCode.get(code.slice(0, 2));
  return [chapter?.description, heading?.description, six?.description].filter(Boolean).join(' › ');
}

/** 人工填的编码：6～10 位数字，前 6 位必须是 HS2022 里真实存在的子目 */
export function validateHsCode(table: HsTable, raw: string): { ok: true; code: string; description: string } | { ok: false; reason: 'format' | 'unknown' } {
  const code = String(raw || '').replace(/[\s.]/g, '');
  if (!/^\d{6,10}$/.test(code)) return { ok: false, reason: 'format' };
  if (!table.byCode.has(code.slice(0, 6))) return { ok: false, reason: 'unknown' };
  return { ok: true, code, description: hsPath(table, code) };
}
