/**
 * L1 · 锁定经文源数据：从《标准经文测试语料包 V1.0》导入。
 *
 * 规则（说明书第五、六节 + 语料包使用说明）：
 *   - 只导入、只读、只引用；本模块没有任何写回经文的路径。
 *   - 逐文件 SHA-256 与「语料清单与校验值.csv」核对，任一不符即整包拒绝导入。
 *   - 章号 / 节号 / 阿拉伯文为权威标识；中文名只做识别。
 *   - JSON 与逐章 TXT 交叉核对（节数、编号、原文逐字相等），防止两份文件被分别改动。
 */
import { createHash } from 'node:crypto';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import type { QuranChapterInfo, QuranCorpusStatus, QuranVerse } from '@totalclaw/ipc-contracts';
import { t as i18nT } from '@totalclaw/i18n';
import format from './corpusFormat.json';

/** 语料包文件名与表头（数据格式约定，随语料包 V1.0 固定；不是界面文案） */
const F = format as { manifestFile: string; jsonFile: string; legacyManifestFile: string; legacyJsonFile: string; columns: Record<string, string>; jsonKeys: Record<string, string>; tierPrefix: Record<string, string> };

export const CORPUS_VERSION = 'V1.0';
// 随包语料用纯 ASCII 文件名（2026-09-29）：原名带阿拉伯文，其中「الإخلاص」的 إ 有两种 Unicode 写法，
// mac 上 Finder 从 DMG 拖进「应用程序」时把文件名改成另一种写法，签名封条对不上 → 整个 App 报「已损坏」。
// 用户自己导入的官方原版语料包仍是中文文件名，所以两种都认；逐章文件名由清单给出，不受影响。
export const MANIFEST_FILE = F.manifestFile;
export const JSON_FILE = F.jsonFile;
const manifestName = (dir: string) => [F.manifestFile, F.legacyManifestFile].find((n) => existsSync(join(dir, n)));
const jsonName = (dir: string) => [F.jsonFile, F.legacyJsonFile].find((n) => existsSync(join(dir, n)));

export interface LoadedCorpus {
  status: QuranCorpusStatus;
  verses: QuranVerse[];
  byChapter: Map<number, QuranVerse[]>;
}

const CHAPTER_EN: Record<number, string> = {
  1: 'Al-Fatihah', 103: 'Al-Asr', 108: 'Al-Kawthar', 112: 'Al-Ikhlas', 113: 'Al-Falaq', 114: 'An-Nas',
  49: 'Al-Hujurat', 67: 'Al-Mulk', 55: 'Ar-Rahman', 12: 'Yusuf',
};

function stripBom(s: string): string {
  return s.charCodeAt(0) === 0xfeff ? s.slice(1) : s;
}

function parseCsvLine(line: string): string[] {
  // 清单没有带引号的逗号字段；简单切分足够，但仍去掉两端引号防御
  return line.split(',').map((c) => c.trim().replace(/^"|"$/g, ''));
}

export function sha256File(path: string): string {
  return createHash('sha256').update(readFileSync(path)).digest('hex');
}

/** 解析清单：章号 / 中文名 / 阿文名 / 节数 / 文件名 / SHA-256 / 层级 */
export function readManifest(dir: string): Array<{ chapter: number; nameZh: string; nameAr: string; verseCount: number; file: string; sha256: string; tier: 1 | 2 | 3 }> {
  const raw = stripBom(readFileSync(join(dir, manifestName(dir) || MANIFEST_FILE), 'utf8')).replace(/\r/g, '');
  const lines = raw.split('\n').filter((l) => l.trim());
  const header = parseCsvLine(lines[0]);
  const idx = (name: string): number => header.findIndex((h) => h === name);
  const iTier = idx(F.columns.tier); const iCh = idx(F.columns.chapter); const iZh = idx(F.columns.nameZh); const iAr = idx(F.columns.nameAr);
  const iN = idx(F.columns.verseCount); const iFile = idx(F.columns.file); const iSha = idx(F.columns.sha);
  if ([iTier, iCh, iZh, iAr, iN, iFile, iSha].some((i) => i < 0)) throw new Error(i18nT('清单表头不完整：{p0}', { p0: header.join(',') }));
  return lines.slice(1).map((l) => {
    const c = parseCsvLine(l);
    const tierText = c[iTier] || '';
    const tier: 1 | 2 | 3 = tierText.startsWith(F.tierPrefix['1']) ? 1 : tierText.startsWith(F.tierPrefix['2']) ? 2 : 3;
    return { chapter: Number(c[iCh]), nameZh: c[iZh], nameAr: c[iAr], verseCount: Number(c[iN]), file: c[iFile], sha256: c[iSha].toLowerCase(), tier };
  });
}

/** 逐章 TXT：只取 `章:节<TAB>原文` 行，其余说明行跳过 */
export function readChapterTxt(path: string): Array<{ ref: string; arabic: string }> {
  const raw = stripBom(readFileSync(path, 'utf8')).replace(/\r/g, '');
  const out: Array<{ ref: string; arabic: string }> = [];
  for (const line of raw.split('\n')) {
    const m = /^(\d+:\d+)\t(.+)$/.exec(line);
    if (m) out.push({ ref: m[1], arabic: m[2] });
  }
  return out;
}

/**
 * 导入并校验。返回值里 status.allVerified=false 时 verses 为空 —— 校验失败绝不带着「可能被改过」的经文进系统。
 */
export function loadCorpus(dir: string, source: 'bundled' | 'directory'): LoadedCorpus {
  const problems: string[] = [];
  const chapters: QuranChapterInfo[] = [];
  const verses: QuranVerse[] = [];
  const byChapter = new Map<number, QuranVerse[]>();

  if (!manifestName(dir)) {
    problems.push(i18nT('缺少清单文件 {p0}', { p0: MANIFEST_FILE }));
    return { status: emptyStatus(source, dir, problems), verses, byChapter };
  }
  let manifest: ReturnType<typeof readManifest>;
  try { manifest = readManifest(dir); } catch (e: any) {
    problems.push(String(e?.message || e));
    return { status: emptyStatus(source, dir, problems), verses, byChapter };
  }

  let json: Array<Record<string, unknown>> = [];
  const jsonFile = jsonName(dir);
  const jsonPath = join(dir, jsonFile || JSON_FILE);
  if (jsonFile) {
    try { json = JSON.parse(stripBom(readFileSync(jsonPath, 'utf8'))); } catch (e: any) { problems.push(i18nT('接口文件解析失败：{p0}', { p0: String(e?.message || e) })); }
  } else {
    problems.push(i18nT('缺少接口文件 {p0}', { p0: JSON_FILE }));
  }

  for (const m of manifest) {
    const path = join(dir, m.file);
    let verified = false;
    if (!existsSync(path)) {
      problems.push(i18nT('缺少逐章文件 {p0}', { p0: m.file }));
    } else {
      const actual = sha256File(path);
      verified = actual === m.sha256;
      if (!verified) problems.push(i18nT('{p0} 校验值不符（清单 {p1}… / 实际 {p2}…）', { p0: m.file, p1: m.sha256.slice(0, 12), p2: actual.slice(0, 12) }));
    }
    chapters.push({ chapter: m.chapter, nameZh: m.nameZh, nameAr: m.nameAr, nameEn: CHAPTER_EN[m.chapter] || `Surah ${m.chapter}`, verseCount: m.verseCount, tier: m.tier, file: m.file, sha256: m.sha256, verified });
    if (!verified) continue;

    const txt = readChapterTxt(path);
    if (txt.length !== m.verseCount) problems.push(i18nT('{p0} 节数 {p1} ≠ 清单 {p2}', { p0: m.file, p1: txt.length, p2: m.verseCount }));
    const jsonRows = json.filter((r) => Number(r[F.jsonKeys.chapter]) === m.chapter);
    if (json.length && jsonRows.length !== txt.length) problems.push(i18nT('第 {p0} 章：接口文件 {p1} 节 ≠ 逐章文件 {p2} 节', { p0: m.chapter, p1: jsonRows.length, p2: txt.length }));
    const list: QuranVerse[] = [];
    txt.forEach((row, i) => {
      const [c, v] = row.ref.split(':').map(Number);
      if (c !== m.chapter) problems.push(i18nT('{p0} 内出现他章编号 {p1}', { p0: m.file, p1: row.ref }));
      if (v !== i + 1) problems.push(i18nT('{p0} 节号不连续：期望 {p1} 得到 {p2}', { p0: m.file, p1: i + 1, p2: row.ref }));
      const j = jsonRows[i];
      if (j && (String(j[F.jsonKeys.ref]) !== row.ref || String(j[F.jsonKeys.arabic]) !== row.arabic)) problems.push(i18nT('{p0} 接口文件与逐章文件原文不一致', { p0: row.ref }));
      // 随包语料是交付前已由内容审核人确认并冻结的；从目录导入的是新的一份，
      // 在审核人确认前只能是「待审核」——这正是说明书 21.1 要三态的意义。
      // 两种状态下 AI 都不得改写经文，状态只决定「能不能再换一份语料」。
      list.push({ chapter: c, verse: v, ref: row.ref, arabic: row.arabic, sourceVersion: CORPUS_VERSION, reviewStatus: source === 'bundled' ? 'frozen' : 'pending', checksum: m.sha256 });
    });
    byChapter.set(m.chapter, list);
    verses.push(...list);
  }

  const allVerified = problems.length === 0 && chapters.length > 0 && chapters.every((c) => c.verified);
  if (!allVerified) { verses.length = 0; byChapter.clear(); }
  return {
    status: {
      imported: allVerified,
      source,
      sourceDir: dir,
      version: CORPUS_VERSION,
      totalVerses: verses.length,
      chapters: chapters.sort((a, b) => a.tier - b.tier || a.chapter - b.chapter),
      allVerified,
      verifiedAt: allVerified ? Date.now() : undefined,
      problems,
    },
    verses,
    byChapter,
  };
}

function emptyStatus(source: 'bundled' | 'directory' | '', dir: string, problems: string[]): QuranCorpusStatus {
  return { imported: false, source, sourceDir: dir, version: CORPUS_VERSION, totalVerses: 0, chapters: [], allVerified: false, problems };
}

export function emptyCorpus(): LoadedCorpus {
  return { status: emptyStatus('', '', []), verses: [], byChapter: new Map() };
}

/** 用户选目录导入时：目录里可能是解压后的子文件夹，向下找一层清单文件 */
export function locateCorpusDir(dir: string): string {
  if (manifestName(dir)) return dir;
  try {
    for (const name of readdirSync(dir)) {
      const sub = join(dir, name);
      if (manifestName(sub)) return sub;
    }
  } catch { /* 读不了就按原目录处理 */ }
  return dir;
}

export function versesInRange(corpus: LoadedCorpus, chapter: number, from?: number, to?: number): QuranVerse[] {
  const list = corpus.byChapter.get(chapter) || [];
  const lo = Math.max(1, from || 1);
  const hi = Math.min(list.length, to || list.length);
  return list.filter((v) => v.verse >= lo && v.verse <= hi);
}

export function chapterName(corpus: LoadedCorpus, chapter: number, lang: 'zh' | 'en' | 'ar'): string {
  const info = corpus.status.chapters.find((c) => c.chapter === chapter);
  if (!info) return `${chapter}`;
  return lang === 'ar' ? info.nameAr : lang === 'en' ? info.nameEn : info.nameZh;
}
