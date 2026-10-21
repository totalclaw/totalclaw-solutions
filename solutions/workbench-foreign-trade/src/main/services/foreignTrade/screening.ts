/**
 * 交易对手筛查：制裁 / 出口管制名单。
 *
 * 名单：官方免费公开数据，按需下载、本地缓存、记录版本与时间——
 *   美国综合筛查名单 CSL（data.trade.gov 批量文件，免 key，含 OFAC SDN、实体清单等 11 张美国名单）、
 *   联合国安理会综合名单（XML）、英国制裁名单（FCDO CSV）、欧盟金融制裁综合名单（FSF CSV）。
 * 下载失败时继续用上次的缓存，并把失败原因与缓存时间告诉用户；也可以手动导入从官网下载的文件。
 *
 * 匹配全部本地完成，算法借鉴：
 *   moov-io/watchman（Apache-2.0）internal/stringscore/jaro_winkler.go 的 BestPairsJaroWinkler / 短词合并、
 *     internal/prepare 的标点归一与英文公司后缀归一；Jaro-Winkler 本身按 xrash/smetrics（MIT）的定义逐字节实现；
 *   seelpeed-debug/export-controls-agent-mcp（MIT）src/lib/screening.js 的公司后缀剥离、缩写匹配、
 *     「常见行业词不算证据」与 85 / 70 两档（高度疑似 / 待查）；
 *   opensanctions/yente、Cheryl-Feng/export-screening 只借鉴了「给候选、不下结论」的结果形态。
 * 筛查只是辅助：没命中不等于放行（所有权、地址、音译都可能漏），结果页写明名单版本与时间，最终判断由人负责。
 */
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, renameSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { t as i18nT } from '@totalclaw/i18n';
import type { FtScreeningMatch, FtScreeningResult, FtScreeningSourceId, FtScreeningSourceStatus } from '@totalclaw/ipc-contracts';

// ─── 名称归一 ────────────────────────────────────────────────────────────

/** 去重音、小写、& 当 and、标点变空格、压空白（watchman LowerAndRemovePunctuation + seelpeed normalizeName） */
export function normalizeName(input: string): string {
  return String(input ?? '')
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/** 英文公司形式的全称统一成简写（watchman CanonicalizeEnglishLegalForms），L L C 这种被拆开的也拼回去 */
const LEGAL_PHRASES: Array<[string, string]> = [
  ['limited liability company', 'llc'], ['public limited company', 'plc'], ['incorporated', 'inc'],
  ['corporation', 'corp'], ['company', 'co'], ['limited', 'ltd'],
];
export function canonicalLegalForms(norm: string): string {
  let s = ` ${norm} `;
  for (const [from, to] of LEGAL_PHRASES) s = s.split(` ${from} `).join(` ${to} `);
  for (const short of ['llc', 'plc']) s = s.split(` ${short.split('').join(' ')} `).join(` ${short} `);
  return s.trim().replace(/\s+/g, ' ');
}

/** 公司形式与泛用词：只用来构造比较键，不拿来否决候选（seelpeed CORPORATE_SUFFIXES） */
const CORPORATE_SUFFIXES = new Set([
  'co', 'company', 'corp', 'corporation', 'inc', 'incorporated', 'ltd', 'limited', 'llc', 'lp', 'llp', 'plc', 'gmbh', 'mbh', 'ag',
  'sa', 'sas', 'sarl', 'srl', 'spa', 'bv', 'nv', 'oy', 'oyj', 'ab', 'as', 'asa', 'aps', 'kg', 'kgaa', 'pte', 'pty', 'kk', 'kabushiki',
  'kaisha', 'jsc', 'ojsc', 'cjsc', 'pjsc', 'ooo', 'oao', 'zao', 'holdings', 'holding', 'group', 'groupe', 'international', 'intl',
  'trading', 'technologies', 'technology', 'tech', 'industries', 'industry', 'enterprises', 'enterprise', 'sdn', 'bhd', 'pvt', 'ltda',
  'and', 'the', 'of', 'for', 'de', 'cv', 'fze', 'fzco', 'fzc', 'dmcc', 'llp',
]);
const STOPWORDS = new Set(['and', 'the', 'of', 'for', 'a', 'an']);

const tokensOf = (norm: string) => norm.split(' ').filter((t) => t && !STOPWORDS.has(t));
const significantOf = (norm: string) => tokensOf(norm).filter((t) => !CORPORATE_SUFFIXES.has(t) && t.length > 1);
/** 首字母缩写：公司形式词也算一个字母（SMIC = Semiconductor Manufacturing International Corporation） */
function acronymOf(norm: string): string {
  const t = tokensOf(norm.replace(/\bcorp\b/g, 'corporation'));
  return t.length >= 3 ? t.map((x) => x[0]).join('') : '';
}

// ─── Jaro-Winkler（按字节，与 Go 版 smetrics / watchman 数值一致）──────────

const enc = new TextEncoder();
const bytes = (s: string) => enc.encode(s);

export function jaro(a: string, b: string): number {
  const A = bytes(a);
  const B = bytes(b);
  if (!A.length && !B.length) return 1;
  if (!A.length || !B.length) return 0;
  const range = Math.max(0, Math.floor(Math.max(A.length, B.length) / 2) - 1);
  const ma = new Array<boolean>(A.length).fill(false);
  const mb = new Array<boolean>(B.length).fill(false);
  let matches = 0;
  for (let i = 0; i < A.length; i++) {
    const start = Math.max(0, i - range);
    const end = Math.min(B.length - 1, i + range);
    for (let j = start; j <= end; j++) {
      if (mb[j] || A[i] !== B[j]) continue;
      ma[i] = true;
      mb[j] = true;
      matches++;
      break;
    }
  }
  if (!matches) return 0;
  let unaligned = 0;
  let j = 0;
  for (let i = 0; i < A.length; i++) {
    if (!ma[i]) continue;
    while (!mb[j]) j++;
    if (A[i] !== B[j]) unaligned++;
    j++;
  }
  const transpositions = Math.floor(unaligned / 2);
  return (matches / A.length + matches / B.length + (matches - transpositions) / matches) / 3;
}

export function jaroWinkler(a: string, b: string, boostThreshold = 0.7, prefixSize = 4): number {
  const d = jaro(a, b);
  if (d < boostThreshold) return d;
  const A = bytes(a);
  const B = bytes(b);
  const n = Math.min(A.length, B.length, prefixSize);
  let prefix = 0;
  for (let i = 0; i < n && A[i] === B[i]; i++) prefix++;
  return d + 0.1 * prefix * (1 - d);
}

/** 首字母音类（watchman phonetics.go：只给发音同类开头的词配对） */
const SOUNDEX: Record<string, string> = {
  A: 'A', E: 'A', I: 'A', O: 'A', U: 'A', Y: 'A', B: 'B', F: 'B', P: 'B', V: 'B', C: 'C', G: 'C', J: 'C', K: 'C', Q: 'C', S: 'C',
  X: 'C', Z: 'C', D: 'D', T: 'D', L: 'L', M: 'M', N: 'M', R: 'R', H: 'H', W: 'H',
};
function phoneticClass(s: string): string {
  if (!s) return ' ';
  const first = [...s][0].toUpperCase();
  return SOUNDEX[first] ?? first;
}
const sameOnset = (a: string, b: string) => !!a && !!b && phoneticClass(a) === phoneticClass(b);
const scaling = (metric: number, weight: number) => 1 - (1 - metric) * weight;

function tokenSimilarity(a: string, b: string): number {
  let score = jaroWinkler(a, b);
  const la = bytes(a).length;
  const lb = bytes(b).length;
  const lenMetric = Math.min(la, lb) / Math.max(la, lb);
  if (lenMetric < 0.9) score *= scaling(lenMetric, 0.3);
  if (la && lb && !sameOnset(a, b)) score *= 0.9;
  return score;
}

/**
 * watchman BestPairsJaroWinkler：查询词与名单词两两打分，按分数从高到低一对一配对，
 * 按字节长度加权平均，再按名单名里没配上的比例打折（权重 0.15）。
 */
export function bestPairsJaroWinkler(search: string[], indexed: string[]): number {
  const len = (s: string) => bytes(s).length;
  const searchLen = search.reduce((n, s) => n + len(s), 0);
  const indexLen = indexed.reduce((n, s) => n + len(s), 0);
  const pairs: Array<{ score: number; si: number; ii: number }> = [];
  search.forEach((s, si) => indexed.forEach((x, ii) => { if (sameOnset(x, s)) pairs.push({ score: tokenSimilarity(x, s), si, ii }); }));
  pairs.sort((p, q) => q.score - p.score);
  const ms = new Array<boolean>(search.length).fill(false);
  const mi = new Array<boolean>(indexed.length).fill(false);
  let weighted = 0;
  let matchedIndexLen = 0;
  for (const p of pairs) {
    if (ms[p.si] || mi[p.ii]) continue;
    weighted += p.score * (len(search[p.si]) + len(indexed[p.ii]));
    ms[p.si] = true;
    mi[p.ii] = true;
    matchedIndexLen += len(indexed[p.ii]);
  }
  let avg = weighted / (searchLen + matchedIndexLen);
  if (!Number.isFinite(avg)) avg = 0;
  let fraction = indexed.reduce((n, s, i) => n + (mi[i] ? len(s) : 0), 0) / indexLen;
  if (!Number.isFinite(fraction)) fraction = 0;
  return avg * scaling(fraction, 0.15);
}

/** 短词与相邻词合并的变体（"JSC ARGUMENT" vs "JSCARGUMENT"），watchman GenerateWordCombinations */
export function wordCombinations(tokens: string[]): string[][] {
  if (tokens.length <= 1) return [tokens];
  const out = [tokens];
  const fwd: string[] = [];
  for (let i = 0; i < tokens.length; i++) {
    if (i < tokens.length - 1 && bytes(tokens[i]).length <= 3) { fwd.push(tokens[i] + tokens[i + 1]); i++; } else fwd.push(tokens[i]);
  }
  if (fwd.length < tokens.length) {
    out.push(fwd);
    const back: string[] = [];
    for (let i = 0; i < tokens.length; i++) {
      if (i > 0 && bytes(tokens[i]).length <= 3 && back.length) back[back.length - 1] += tokens[i];
      else back.push(tokens[i]);
    }
    if (back.length < tokens.length && back.join(' ') !== fwd.join(' ')) out.push(back);
  }
  return out;
}

export function bestPairCombination(search: string[], indexed: string[]): number {
  let best = 0;
  for (const s of wordCombinations(search)) for (const x of wordCombinations(indexed)) best = Math.max(best, bestPairsJaroWinkler(s, x));
  return best;
}

// ─── 名单索引与筛查 ──────────────────────────────────────────────────────

export interface ScreeningEntry {
  /** 来源 */
  s: FtScreeningSourceId;
  /** 名单（如 SDN / Entity List / UN DPRK） */
  l: string;
  /** 正式名称 */
  n: string;
  /** 别名 */
  a?: string[];
  t?: string;
  c?: string[];
  p?: string;
  r?: string;
}

interface IndexedName { e: number; name: string; alias: boolean; norm: string; tokens: string[]; sig: string[]; core: string; acr: string }

export interface ScreeningIndex {
  entries: ScreeningEntry[];
  names: IndexedName[];
  /** 每个词出现在多少个名字里：判断「常见行业词」 */
  df: Map<string, number>;
}

export function buildIndex(entries: ScreeningEntry[]): ScreeningIndex {
  const names: IndexedName[] = [];
  const df = new Map<string, number>();
  const push = (e: number, name: string, alias: boolean) => {
    const norm = canonicalLegalForms(normalizeName(name));
    if (!norm) return;
    const sig = significantOf(norm);
    const tokens = tokensOf(norm);
    names.push({ e, name, alias, norm, tokens, sig, core: (sig.length ? sig : tokens).join(' '), acr: acronymOf(norm) });
    for (const t of new Set(tokens)) df.set(t, (df.get(t) || 0) + 1);
  };
  entries.forEach((en, i) => { push(i, en.n, false); for (const a of en.a || []) if (a && a !== en.n) push(i, a, true); });
  return { entries, names, df };
}

export const HIGH_SCORE = 85;
export const REVIEW_SCORE = 70;
/** 只出现在不超过这么多名字里的词才算「能认出一家公司」（seelpeed RARE_TOKEN_MAX_DF） */
const RARE_DF = 4;

export function screenName(index: ScreeningIndex, query: string, opts: { country?: string; minScore?: number; max?: number } = {}): FtScreeningMatch[] {
  const minScore = opts.minScore ?? REVIEW_SCORE;
  const qnorm = canonicalLegalForms(normalizeName(query));
  if (!qnorm) return [];
  const qtokens = tokensOf(qnorm);
  const qsig = significantOf(qnorm);
  const qcore = (qsig.length ? qsig : qtokens).join(' ');
  const qacr = acronymOf(qnorm);
  const qs = qsig.length ? qsig : qtokens;
  const qcompact = qnorm.replace(/\s/g, '');
  // 先按「名单里每个不同的词」算一次和查询词的最高相似度（词表远小于名字数），再只对有希望的名字做整名比对
  const tokenBest = new Map<string, number>();
  const tokenScore = (t: string) => {
    let v = tokenBest.get(t);
    if (v === undefined) { v = Math.max(0, ...qs.map((q) => (sameOnset(q, t) ? tokenSimilarity(t, q) : 0))); tokenBest.set(t, v); }
    return v;
  };
  const best = new Map<number, { score: number; basis: string; matchedOn: string }>();
  const keep = (e: number, score: number, basis: string, matchedOn: string) => {
    const prev = best.get(e);
    if (score >= minScore && (!prev || score > prev.score)) best.set(e, { score, basis, matchedOn });
  };
  for (const rec of index.names) {
    if (rec.norm === qnorm) { keep(rec.e, 100, i18nT('名称完全一致'), rec.name); continue; }
    if (qcore.length >= 3 && rec.core === qcore) { keep(rec.e, 95, i18nT('去掉公司后缀后一致'), rec.name); continue; }
    if (rec.acr && qtokens.length === 1 && qcompact.length >= 3 && qcompact.length <= 8 && rec.acr === qcompact) { keep(rec.e, 78, i18nT('查询名是名单名称的首字母缩写'), rec.name); continue; }
    if (qacr && rec.tokens.length === 1 && rec.norm.length >= 3 && rec.norm.length <= 8 && qacr === rec.norm) { keep(rec.e, 78, i18nT('名单名称是查询名的首字母缩写'), rec.name); continue; }
    const rs = rec.sig.length ? rec.sig : rec.tokens;
    let strong = 0;
    let strongToken = '';
    for (const t of rs) { if (tokenScore(t) >= 0.9) { strong++; strongToken = t; } }
    if (!strong && !rs.some((t) => tokenScore(t) >= 0.8)) continue;
    const jw = (bestPairCombination(qs, rs) + bestPairCombination(rs, qs)) / 2;
    let score = Math.round(jw * 100);
    // 只靠一个常见行业词撑起来的相似不算证据（"Fictional Trading" 不该因为 trading 命中一堆公司）
    if (strong === 1 && Math.max(qs.length, rs.length) > 1 && (index.df.get(strongToken) ?? Infinity) > RARE_DF) score = Math.min(score, REVIEW_SCORE - 1);
    if (score >= minScore) keep(rec.e, score, i18nT('名称相似度 {p0}%', { p0: score }), rec.name);
  }
  const want = opts.country ? normalizeName(opts.country) : '';
  const out: FtScreeningMatch[] = [...best].map(([e, m]) => {
    const en = index.entries[e];
    let basis = m.basis;
    if (want && en.c?.length) {
      basis += en.c.some((c) => { const n = normalizeName(c); return n === want || want.startsWith(n) || n.startsWith(want); })
        ? i18nT('；名单登记的国家与填写的一致')
        : i18nT('；名单登记的国家与填写的不同（不能据此排除）');
    }
    return {
      score: m.score, level: m.score >= HIGH_SCORE ? 'high' : 'review', source: en.s, list: en.l, name: en.n, matchedOn: m.matchedOn,
      basis, type: en.t, countries: en.c, programs: en.p, ref: en.r,
    };
  });
  out.sort((a, b) => b.score - a.score || a.name.localeCompare(b.name));
  return out.slice(0, opts.max ?? 20);
}

// ─── 官方名单解析 ────────────────────────────────────────────────────────

/** 通用 CSV 解析（引号、转义引号、引号内换行；分隔符可选） */
export function parseCsv(text: string, delimiter = ','): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = '';
  let quoted = false;
  const s = text.charCodeAt(0) === 0xfeff ? text.slice(1) : text;
  for (let i = 0; i < s.length; i++) {
    const ch = s[i];
    if (quoted) {
      if (ch === '"') {
        if (s[i + 1] === '"') { cell += '"'; i++; } else quoted = false;
      } else cell += ch;
      continue;
    }
    if (ch === '"') quoted = true;
    else if (ch === delimiter) { row.push(cell); cell = ''; } else if (ch === '\n' || ch === '\r') {
      if (ch === '\r' && s[i + 1] === '\n') i++;
      row.push(cell);
      rows.push(row);
      row = [];
      cell = '';
    } else cell += ch;
  }
  if (cell || row.length) { row.push(cell); rows.push(row); }
  return rows;
}

const shortList = (source: string) => source.match(/\(([^)]+)\)/)?.[1] || source.split(' - ')[0] || source;
const splitAlt = (v: unknown): string[] => (Array.isArray(v) ? v.map(String) : String(v || '').split(/;\s*/)).map((x) => x.trim()).filter(Boolean);

/** 美国 CSL：consolidated.json（{ results: [...] }）或 consolidated.csv */
export function parseCsl(text: string): { entries: ScreeningEntry[]; version?: string } {
  const trimmed = text.trimStart().replace(/^﻿/, '');
  if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
    const raw = JSON.parse(trimmed);
    const rows: any[] = Array.isArray(raw) ? raw : raw.results || [];
    const dates: string[] = (raw.sources_used || raw.sources || []).map((x: any) => String(x?.source_last_updated || x?.last_updated || '')).filter(Boolean);
    return {
      version: dates.sort().pop(),
      entries: rows.filter((r) => r?.name).map((r) => ({
        s: 'us_csl' as const, l: `CSL · ${shortList(String(r.source || ''))}`, n: String(r.name), a: splitAlt(r.alt_names), t: r.type ? String(r.type) : undefined,
        c: [...new Set((r.addresses || []).map((a: any) => String(a?.country || '')).filter(Boolean))] as string[],
        p: Array.isArray(r.programs) ? r.programs.join(', ') : r.programs ? String(r.programs) : undefined, r: r.entity_number ? String(r.entity_number) : r.id ? String(r.id) : undefined,
      })),
    };
  }
  const rows = parseCsv(trimmed);
  const head = rows[0].map((h) => h.trim().toLowerCase());
  const col = (n: string) => head.indexOf(n);
  const [iName, iAlt, iSrc, iType, iAddr, iProg, iNum] = ['name', 'alt_names', 'source', 'type', 'addresses', 'programs', 'entity_number'].map(col);
  if (iName < 0) throw new Error(i18nT('不是 CSL 名单文件（没有 name 列）'));
  return {
    entries: rows.slice(1).filter((r) => r[iName]?.trim()).map((r) => ({
      s: 'us_csl' as const, l: `CSL · ${shortList(r[iSrc] || '')}`, n: r[iName].trim(), a: splitAlt(r[iAlt]), t: r[iType] || undefined,
      c: (r[iAddr] || '').split(';').map((a) => a.trim().split(',').pop()?.trim() || '').filter(Boolean), p: r[iProg] || undefined, r: r[iNum] || undefined,
    })),
  };
}

const xmlDecode = (s: string) => s.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&apos;/g, "'")
  .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(Number(d))).replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16))).replace(/&amp;/g, '&');
const tagValues = (block: string, tag: string) => [...block.matchAll(new RegExp(`<${tag}>([\\s\\S]*?)</${tag}>`, 'g'))].map((m) => xmlDecode(m[1].trim())).filter(Boolean);

/** 联合国安理会综合名单 consolidated.xml */
export function parseUnXml(text: string): { entries: ScreeningEntry[]; version?: string } {
  const version = text.match(/dateGenerated="([^"]+)"/)?.[1];
  const entries: ScreeningEntry[] = [];
  for (const [, kind, block] of text.matchAll(/<(INDIVIDUAL|ENTITY)>([\s\S]*?)<\/\1>/g)) {
    const isPerson = kind === 'INDIVIDUAL';
    const name = ['FIRST_NAME', 'SECOND_NAME', 'THIRD_NAME', 'FOURTH_NAME'].map((t) => tagValues(block, t)[0] || '').filter(Boolean).join(' ');
    if (!name) continue;
    const aliasBlocks = [...block.matchAll(new RegExp(`<${kind}_ALIAS>([\\s\\S]*?)</${kind}_ALIAS>`, 'g'))].map((m) => m[1]);
    const aliases = aliasBlocks.flatMap((b) => tagValues(b, 'ALIAS_NAME'));
    const countries = [...tagValues(block.match(/<NATIONALITY>([\s\S]*?)<\/NATIONALITY>/)?.[1] || '', 'VALUE'), ...tagValues(block, 'COUNTRY')];
    entries.push({ s: 'un', l: `UN · ${tagValues(block, 'UN_LIST_TYPE')[0] || ''}`.trim(), n: name, a: aliases, t: isPerson ? 'Individual' : 'Entity', c: [...new Set(countries)], p: tagValues(block, 'UN_LIST_TYPE')[0], r: tagValues(block, 'REFERENCE_NUMBER')[0] });
  }
  return { entries, version };
}

/** 英国制裁名单 UK-Sanctions-List.csv：首行是报告日期，第二行是表头；同一 Unique ID 的多行（主名 + 别名）合并 */
export function parseUkCsv(text: string): { entries: ScreeningEntry[]; version?: string } {
  const rows = parseCsv(text);
  const headAt = rows.findIndex((r) => r.some((c) => /^unique id$/i.test(c.trim())) || r.some((c) => /^name 6$/i.test(c.trim())));
  const version = headAt > 0 ? rows.slice(0, headAt).flat().join(' ').replace(/report date:?/i, '').trim() || undefined : undefined;
  const head = (headAt >= 0 ? rows[headAt] : []).map((h) => h.trim().toLowerCase());
  const find = (...names: string[]) => { for (const n of names) { const i = head.indexOf(n); if (i >= 0) return i; } return -1; };
  // 表头认不出就用 watchman 记录的列号（UKSL_* 常量）
  const iId = find('unique id') >= 0 ? find('unique id') : 1;
  const iNames = [find('name 6'), find('name 1'), find('name 2'), find('name 3'), find('name 4'), find('name 5')].map((x, k) => (x >= 0 ? x : [4, 5, 6, 7, 8, 9][k]));
  const iNameType = find('name type') >= 0 ? find('name type') : 10;
  const iRegime = find('regime name', 'regime') >= 0 ? find('regime name', 'regime') : 16;
  const iType = find('designation type', 'entity type', 'group type', 'individual, entity, ship') >= 0 ? find('designation type', 'entity type', 'group type', 'individual, entity, ship') : 17;
  const iCountry = find('address country', 'country') >= 0 ? find('address country', 'country') : 29;
  const byId = new Map<string, ScreeningEntry>();
  for (const r of rows.slice(headAt >= 0 ? headAt + 1 : 2)) {
    const id = (r[iId] || '').trim();
    if (!id) continue;
    const name = iNames.map((i) => (r[i] || '').trim()).filter(Boolean).join(' ');
    if (!name) continue;
    let e = byId.get(id);
    if (!e) { e = { s: 'uk', l: `UK · ${(r[iRegime] || '').trim()}`.trim(), n: name, a: [], t: (r[iType] || '').trim() || undefined, c: [], p: (r[iRegime] || '').trim() || undefined, r: id }; byId.set(id, e); } else if (/primary/i.test(r[iNameType] || '') && e.n !== name) { e.a!.push(e.n); e.n = name; } else if (e.n !== name && !e.a!.includes(name)) e.a!.push(name);
    const c = (r[iCountry] || '').trim();
    if (c && !e.c!.includes(c)) e.c!.push(c);
  }
  return { entries: [...byId.values()], version };
}

/** 欧盟金融制裁综合名单 csvFullSanctionsList_1_1（分号分隔）：同一 Entity_LogicalId 的多行合并 */
export function parseEuCsv(text: string): { entries: ScreeningEntry[]; version?: string } {
  const rows = parseCsv(text, ';');
  const head = rows[0].map((h) => h.trim().toLowerCase());
  const col = (n: string) => head.indexOf(n.toLowerCase());
  const iId = col('Entity_LogicalId');
  const iName = col('NameAlias_WholeName');
  if (iId < 0 || iName < 0) throw new Error(i18nT('不是欧盟金融制裁名单文件（缺 Entity_LogicalId / NameAlias_WholeName 列）'));
  const iType = col('Entity_SubjectType_ClassificationCode') >= 0 ? col('Entity_SubjectType_ClassificationCode') : col('Entity_SubjectType');
  const iProg = col('Entity_Regulation_Programme');
  const iCountry = col('Address_CountryDescription');
  const iRef = col('Entity_EU_ReferenceNumber');
  const iDate = col('fileGenerationDate');
  const byId = new Map<string, ScreeningEntry>();
  let version: string | undefined;
  for (const r of rows.slice(1)) {
    const id = (r[iId] || '').trim();
    const name = (r[iName] || '').trim();
    if (!version && iDate >= 0 && r[iDate]) version = r[iDate].trim();
    if (!id || !name) continue;
    let e = byId.get(id);
    if (!e) { e = { s: 'eu', l: `EU · ${(r[iProg] || '').trim()}`.trim(), n: name, a: [], t: (r[iType] || '').trim() || undefined, c: [], p: (r[iProg] || '').trim() || undefined, r: (r[iRef] || '').trim() || id }; byId.set(id, e); } else if (e.n !== name && !e.a!.includes(name)) e.a!.push(name);
    const c = iCountry >= 0 ? (r[iCountry] || '').trim() : '';
    if (c && !e.c!.includes(c)) e.c!.push(c);
  }
  return { entries: [...byId.values()], version };
}

// ─── 下载、缓存与筛查日志 ────────────────────────────────────────────────

export const SCREENING_SOURCES: Record<FtScreeningSourceId, { url: string; parse: (text: string) => { entries: ScreeningEntry[]; version?: string } }> = {
  us_csl: { url: 'https://data.trade.gov/downloadable_consolidated_screening_list/v1/consolidated.json', parse: parseCsl },
  un: { url: 'https://scsanctions.un.org/resources/xml/en/consolidated.xml', parse: parseUnXml },
  uk: { url: 'https://sanctionslist.fcdo.gov.uk/docs/UK-Sanctions-List.csv', parse: parseUkCsv },
  eu: { url: 'https://webgate.ec.europa.eu/fsd/fsf/public/files/csvFullSanctionsList_1_1/content?token=dG9rZW4tMjAxNw', parse: parseEuCsv },
};
export const SCREENING_IDS = Object.keys(SCREENING_SOURCES) as FtScreeningSourceId[];
/** 名单变得很快（美国实体清单常按周更新），超过这个天数就提示更新 */
export const SCREENING_STALE_DAYS = 7;

export function sourceLabel(id: FtScreeningSourceId): string {
  return {
    us_csl: i18nT('美国综合筛查名单（CSL，含 OFAC SDN、实体清单等）'),
    un: i18nT('联合国安理会综合制裁名单'),
    uk: i18nT('英国制裁名单（FCDO）'),
    eu: i18nT('欧盟金融制裁综合名单'),
  }[id];
}

type FetchLike = (url: string, init?: { signal?: AbortSignal; headers?: Record<string, string> }) => Promise<{ ok: boolean; status: number; text(): Promise<string>; headers: { get(name: string): string | null } }>;

interface CachedList { id: FtScreeningSourceId; version?: string; fetchedAt: string; count: number; entries: ScreeningEntry[] }

export class ScreeningLists {
  private index: ScreeningIndex | null = null;
  private indexKey = '';

  constructor(private readonly dirOf: () => string) {}

  private dir(): string {
    const d = this.dirOf();
    if (!existsSync(d)) mkdirSync(d, { recursive: true });
    return d;
  }

  private metaPath(): string { return join(this.dir(), 'meta.json'); }

  private readMeta(): Partial<Record<FtScreeningSourceId, FtScreeningSourceStatus>> {
    try { return JSON.parse(readFileSync(this.metaPath(), 'utf-8')) || {}; } catch { return {}; }
  }

  private writeJson(path: string, data: unknown): void {
    writeFileSync(`${path}.tmp`, JSON.stringify(data), 'utf-8');
    renameSync(`${path}.tmp`, path);
  }

  status(): FtScreeningSourceStatus[] {
    const meta = this.readMeta();
    return SCREENING_IDS.map((id) => ({ ...(meta[id] || {}), id, label: sourceLabel(id), url: SCREENING_SOURCES[id].url }));
  }

  private save(id: FtScreeningSourceId, text: string, lastModified?: string | null): FtScreeningSourceStatus {
    const { entries, version } = SCREENING_SOURCES[id].parse(text);
    if (!entries.length) throw new Error(i18nT('文件里没有读到任何名单条目'));
    const fetchedAt = new Date().toISOString();
    const v = version || lastModified || `sha256:${createHash('sha256').update(text).digest('hex').slice(0, 12)}`;
    this.writeJson(join(this.dir(), `${id}.json`), { id, version: v, fetchedAt, count: entries.length, entries } satisfies CachedList);
    const meta = this.readMeta();
    meta[id] = { id, label: sourceLabel(id), url: SCREENING_SOURCES[id].url, version: v, fetchedAt, count: entries.length };
    this.writeJson(this.metaPath(), meta);
    this.index = null;
    return this.status().find((s) => s.id === id)!;
  }

  private fail(id: FtScreeningSourceId, error: string): void {
    const meta = this.readMeta();
    meta[id] = { ...(meta[id] || { id, label: sourceLabel(id), url: SCREENING_SOURCES[id].url }), error, errorAt: new Date().toISOString() };
    this.writeJson(this.metaPath(), meta);
  }

  /** 逐个下载；失败的那个记下原因、继续用上次缓存，不影响其它名单 */
  async refresh(fetchImpl: FetchLike, ids: FtScreeningSourceId[] = SCREENING_IDS, onProgress?: (id: FtScreeningSourceId) => void): Promise<FtScreeningSourceStatus[]> {
    for (const id of ids) {
      onProgress?.(id);
      const ctrl = new AbortController();
      const timer = setTimeout(() => ctrl.abort(), 180_000);
      try {
        const res = await fetchImpl(SCREENING_SOURCES[id].url, { signal: ctrl.signal, headers: { 'User-Agent': 'TotalClaw-ForeignTrade/1.0 (+screening)' } });
        if (!res.ok) throw new Error(i18nT('服务器返回 {p0}', { p0: res.status }));
        this.save(id, await res.text(), res.headers.get('last-modified'));
      } catch (error) {
        const msg = (error as Error)?.name === 'AbortError' ? i18nT('下载超时') : (error as Error)?.message || String(error);
        this.fail(id, msg);
      } finally {
        clearTimeout(timer);
      }
    }
    return this.status();
  }

  /** 手动导入从官网下载的文件（网络不通时用） */
  importText(id: FtScreeningSourceId, text: string): FtScreeningSourceStatus {
    try {
      return this.save(id, text);
    } catch (error) {
      throw new Error(i18nT('导入失败：{p0}', { p0: (error as Error)?.message || String(error) }));
    }
  }

  private loadIndex(): { index: ScreeningIndex | null; lists: CachedList[] } {
    const lists: CachedList[] = [];
    for (const id of SCREENING_IDS) {
      const p = join(this.dir(), `${id}.json`);
      if (!existsSync(p)) continue;
      try { lists.push(JSON.parse(readFileSync(p, 'utf-8'))); } catch { /* 坏缓存当没有 */ }
    }
    const key = lists.map((l) => `${l.id}@${l.fetchedAt}`).join('|');
    if (!this.index || key !== this.indexKey) {
      this.index = lists.length ? buildIndex(lists.flatMap((l) => l.entries)) : null;
      this.indexKey = key;
    }
    return { index: this.index, lists };
  }

  screen(query: string, opts: { country?: string; context?: string; id: string; now?: string }): FtScreeningResult {
    const q = String(query || '').trim();
    if (!q) throw new Error(i18nT('请填写要筛查的公司或人名'));
    const { index, lists } = this.loadIndex();
    if (!index) throw new Error(i18nT('还没有下载任何名单。请先点「更新名单」，网络不通时可以从官网下载文件后导入'));
    const matches = screenName(index, q, { country: opts.country });
    return {
      id: opts.id,
      at: opts.now || new Date().toISOString(),
      query: q,
      country: opts.country,
      level: matches.some((m) => m.level === 'high') ? 'high' : matches.length ? 'review' : 'clear',
      matches,
      lists: lists.map((l) => ({ id: l.id, version: l.version, fetchedAt: l.fetchedAt, count: l.count })),
      missing: SCREENING_IDS.filter((id) => !lists.some((l) => l.id === id)),
      context: opts.context,
    };
  }
}
