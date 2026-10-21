/**
 * 阿拉伯文文本工具：分词与归一化。
 *
 * 分词只用于**索引与出题材料**（词汇表、填空、排序），从不回写经文；
 * 输出给学生看的经文永远取自 L1 原文字段（含全部符号）。
 */

/** 奥斯曼体停顿符 / 小记号 / 变音符（不含拉长符与上标 alif，它们单独处理） */
const DIACRITICS = /[\u0610-\u061A\u064B-\u065F\u06D6-\u06DC\u06DF-\u06E8\u06EA-\u06ED\u08D3-\u08FF]/g;
/** 独立的停顿符号 token（ۖ ۚ ۗ ۘ ۙ ۛ ۜ 等） */
const PAUSE_TOKEN = /^[\u06D6-\u06DC\u06DE-\u06E0\u06E5\u06E6\u06E9\s]+$/;

/**
 * 去符号后的骨架形：用于词汇匹配、去重、与批准词表对照。
 * 奥斯曼体特有写法统一到现代拼写骨架：上标 alif → ا；拉长符+高位 hamza → ء；
 * 独立 hamza 后接 alif（ءا）→ ا；各 hamza 座椅（ؤ ئ）→ ء；ٱ أ إ آ → ا；ى → ي。
 */
export function normalizeArabic(word: string): string {
  return word
    .replace(/\u0640\u0654/g, '\u0621') // ـٔ → ء
    .replace(/[\u0627\u0648\u0649\u064A]\u0654/g, '\u0621') // 座椅 + 高位 hamza → ء
    .replace(/\u0649\u0670/g, '\u0649') // ىٰ → ى（尾部 alif maqsura 上的上标 alif）
    .replace(/\u0670/g, '\u0627') // ٰ → ا
    .replace(/\u0640/g, '')
    .replace(DIACRITICS, '')
    .replace(/\u0671/g, '\u0627') // ٱ → ا
    .replace(/[\u0622\u0623\u0625]/g, '\u0627') // آ أ إ → ا
    .replace(/[\u0624\u0626]/g, '\u0621') // ؤ ئ → ء
    .replace(/\u0621\u0627/g, '\u0627') // ءا → ا
    .replace(/\u0649/g, '\u064A') // ى → ي
    .replace(/[^\u0621-\u064A]/g, '')
    .trim();
}

export interface Token { raw: string; norm: string; index: number }

/** 把一节经文拆成词（保留原字形 raw，附归一化 norm）。 */
export function tokenizeVerse(arabic: string): Token[] {
  const out: Token[] = [];
  let index = 0;
  for (const piece of arabic.split(/\s+/)) {
    if (!piece || PAUSE_TOKEN.test(piece)) continue;
    const norm = normalizeArabic(piece);
    if (!norm) continue;
    out.push({ raw: piece, norm, index });
    index += 1;
  }
  return out;
}

export function wordsOf(arabic: string): string[] {
  return tokenizeVerse(arabic).map((t) => t.raw);
}

/** 高频功能词（归一化形）：出词汇题时跳过，避免「和 / 在 / 从」这类词占满词表。 */
export const STOP_WORDS = new Set([
  'و', 'في', 'من', 'ما', 'لا', 'الا', 'ان', 'انا', 'هو', 'هي', 'هم', 'على', 'الى', 'عن', 'به', 'بها', 'له', 'لها', 'لهم', 'كل', 'او', 'اذا', 'قل', 'قال', 'قالوا', 'ثم', 'بل', 'قد', 'لم', 'لن', 'ذلك', 'هذا', 'هذه', 'الذي', 'الذين', 'التي', 'مع', 'بين', 'حتى', 'لو', 'ام', 'اي', 'كان', 'كانوا', 'انت', 'انتم', 'نحن', 'كنتم', 'فيها', 'فيه', 'منها', 'منه', 'عليهم', 'عليكم', 'لكم', 'بما', 'فان', 'وان', 'وما', 'ولا', 'الا',
]);

/**
 * 节范围的显示写法：单节只写一个数（「3」「103:1」），范围用连接号 en dash（「1–3」「103:1–3」）。
 * 只用于展示文字；题目来源 / 单元 id 等数据键另有格式，不走这里。
 */
export function rangeLabel(from: number, to: number, chapter?: number): string {
  const r = from === to ? `${from}` : `${from}–${to}`;
  return chapter === undefined ? r : `${chapter}:${r}`;
}
