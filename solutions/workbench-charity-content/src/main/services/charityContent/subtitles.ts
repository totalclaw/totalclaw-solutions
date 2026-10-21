/**
 * 慈善活动内容工场 · 短视频时间轴与字幕（纯函数，可单测）。
 *
 * 字幕走 libass（ffmpeg `ass=` 滤镜）：阿拉伯语需要 fribidi/harfbuzz 整形，libass 自带；
 * 字体通过 fontsdir 指向我们准备好的字体文件，不依赖系统 fontconfig（mac 上实测不指 fontsdir 全是豆腐块）。
 */
import type { CharityLang } from '@totalclaw/ipc-contracts';

export interface TimelineSegment {
  /** 素材路径 */
  src: string;
  kind: 'image' | 'video';
  /** 该段在成片里的时长（秒） */
  durationSec: number;
  /** 视频素材的入点（秒） */
  offsetSec?: number;
}

/** 无旁白时的成片时长；有旁白时成片 = 旁白总长 + 片尾留白（见 videoDurationFor） */
export const VIDEO_MIN_SEC = 30;
/** 旁白句间停顿：真实写进拼接后的音频里，字幕时间轴按它累计 */
export const NARRATION_PAUSE_SEC = 0.25;
/** 旁白结束后的片尾留白（收尾淡出 1.2s 落在留白里，不吃掉最后一句） */
export const NARRATION_TAIL_SEC = 1.5;

/** 片尾卡（机构名 + 标语）停留时长；要片尾时片尾留白放长到能放下它 */
export const END_CARD_SEC = 3;

/** 某一语言成片时长：有旁白 = 旁白 + 片尾留白（不设上限，绝不截话）；没有 = VIDEO_MIN_SEC */
export function videoDurationFor(narrationSec: number, tailSec = NARRATION_TAIL_SEC): number {
  return narrationSec > 0 ? round2(narrationSec + tailSec) : VIDEO_MIN_SEC;
}

/**
 * 按目标总长排时间轴，平均分给每段（视频权重 1.4）；视频素材从 1s 处切入（避开首帧黑场），不超过它自己的长度。
 * 素材不够铺满（全是 5 秒 AI 镜头、旁白又长）时从头循环素材补齐——成片必须不短于旁白。
 */
export function planTimeline(
  items: Array<{ path: string; kind: 'image' | 'video'; durationSec?: number }>,
  targetSec: number = VIDEO_MIN_SEC,
): { segments: TimelineSegment[]; totalSec: number } {
  const usable = items.filter((i) => i.kind === 'image' || i.kind === 'video');
  if (!usable.length || targetSec <= 0) return { segments: [], totalSec: 0 };
  const target = targetSec;
  // 先让视频段稍长于图片段（动态画面更耐看）：视频权重 1.4，图片 1
  const weights = usable.map((i) => (i.kind === 'video' ? 1.4 : 1));
  const wSum = weights.reduce((a, b) => a + b, 0);
  let segments = usable.map((i, idx) => {
    let d = (target * weights[idx]) / wSum;
    let offset = 0;
    if (i.kind === 'video' && i.durationSec) {
      offset = i.durationSec > d + 1.5 ? 1 : 0;
      d = Math.min(d, Math.max(1, i.durationSec - offset));
    }
    return { src: i.path, kind: i.kind, durationSec: round2(d), offsetSec: offset } as TimelineSegment;
  });
  // 视频段被自身长度截短后把差额补给图片段，保证总长不塌
  const got = segments.reduce((a, s) => a + s.durationSec, 0);
  const deficit = target - got;
  const images = segments.filter((s) => s.kind === 'image');
  if (deficit > 0.05 && images.length) {
    const add = deficit / images.length;
    segments = segments.map((s) => (s.kind === 'image' ? { ...s, durationSec: round2(s.durationSec + add) } : s));
  }
  // 没有图片段（AI 增强版：镜头全成功时全是视频，且 AI 镜头只有 5 秒）还不够长：差额先分给还有余量的长视频素材
  for (let pass = 0; pass < 4; pass += 1) {
    const left = target - segments.reduce((a, s) => a + s.durationSec, 0);
    if (left <= 0.05) break;
    const room = segments.map((s, idx) => (s.kind === 'video' && usable[idx].durationSec ? Math.max(0, usable[idx].durationSec! - (s.offsetSec || 0) - s.durationSec) : 0));
    const open = room.filter((r) => r > 0.05).length;
    if (!open) break;
    const share = left / open;
    segments = segments.map((s, idx) => (room[idx] > 0.05 ? { ...s, durationSec: round2(s.durationSec + Math.min(share, room[idx])) } : s));
  }
  // 仍不够：从头循环素材（每段用满它自己的长度）；最后不足 1 秒的零头并进上一段（转码时定格补齐）
  for (let k = 0; k < 200; k += 1) {
    const left = round2(target - segments.reduce((a, s) => a + s.durationSec, 0));
    if (left <= 0.05) break;
    if (left < 1 && segments.length) {
      const last = segments[segments.length - 1];
      segments[segments.length - 1] = { ...last, durationSec: round2(last.durationSec + left) };
      break;
    }
    const it = usable[k % usable.length];
    const avail = it.kind === 'video' && it.durationSec ? Math.max(1, it.durationSec) : left;
    segments.push({ src: it.path, kind: it.kind, durationSec: round2(Math.min(left, avail)), offsetSec: 0 });
  }
  const totalSec = round2(segments.reduce((a, s) => a + s.durationSec, 0));
  return { segments, totalSec };
}

function round2(n: number): number { return Math.round(n * 100) / 100; }
function round3(n: number): number { return Math.round(n * 1000) / 1000; }
function floor2(n: number): number { return Math.floor(n * 100 + 1e-6) / 100; }

export interface CaptionCue { start: number; end: number; text: string }

/** 无旁白时：把 N 句字幕均匀铺在成片上；首句从 0.6s 起，句间留 0.3s 呼吸 */
export function planCaptions(captions: string[], totalSec: number): CaptionCue[] {
  const lines = captions.map((c) => c.trim()).filter(Boolean);
  if (!lines.length || totalSec <= 0) return [];
  const usable = Math.max(1, totalSec - 1.2);
  const each = usable / lines.length;
  return lines.map((text, i) => {
    const start = round2(0.6 + i * each);
    const end = round2(Math.min(totalSec - 0.2, start + each - 0.3));
    return { start, end: Math.max(start + 0.8, end), text };
  });
}

// ── 旁白字幕：字幕 = 旁白原文逐句，时间 = 逐句真实语音时长累计 ──

/** 句末标点。中文：。！？；（半角 ! ? ; 也认，中文不空格所以直接切）；英文：. ! ? ;；阿语：. ؟ ! ؛（半角 ? ; 也认） */
const SENTENCE_ENDERS: Record<CharityLang, RegExp> = {
  zh: /[\u3002\uff01\uff1f\uff1b!?;]/,
  en: /[.!?;]/,
  ar: /[.!?;\u061f\u061b]/,
};
/** 句末标点后面紧跟的右引号 / 右括号，跟着上一句走 */
const CLOSERS = /["'\u201d\u2019\u300d\u300f\uff09)\u3011\]]/;
/** 英文缩写后的句点不算句末 */
const EN_ABBR = /\b(?:Mr|Mrs|Ms|Dr|Prof|St|Sr|Jr|No|vs|etc|e\.g|i\.e)\.$/i;

/**
 * 旁白文本按句切分（每句 = 一次语音合成 = 一条字幕）。换行也算句界。
 * 半角 `.` `!` `?` `;` 在英 / 阿文里后面必须是空白或行尾才切（1.5、2026.08.15、网址不切）；
 * 没有字母数字的碎片（如列表序号「1.」「—」）并进下一句。
 */
export function splitSentences(text: string, lang: CharityLang): string[] {
  const enders = SENTENCE_ENDERS[lang];
  const raw: string[] = [];
  for (const line of String(text || '').split(/\r?\n+/)) {
    const chars = [...line];
    let buf = '';
    for (let i = 0; i < chars.length; i += 1) {
      buf += chars[i];
      if (!enders.test(chars[i])) continue;
      while (i + 1 < chars.length && (enders.test(chars[i + 1]) || CLOSERS.test(chars[i + 1]))) { i += 1; buf += chars[i]; }
      const ascii = chars[i].charCodeAt(0) < 128;
      if (lang !== 'zh' && ascii) {
        const next = chars[i + 1];
        if (next !== undefined && !/\s/.test(next)) continue;
        if (lang === 'en' && EN_ABBR.test(buf.trim())) continue;
      }
      raw.push(buf);
      buf = '';
    }
    raw.push(buf);
  }
  const out: string[] = [];
  let carry = '';
  for (const piece of raw.map((s) => s.trim()).filter(Boolean)) {
    if (!/[\p{L}\p{N}]/u.test(piece) || /^\p{N}{1,3}[.)]$/u.test(piece)) { carry = carry ? `${carry} ${piece}` : piece; continue; }
    out.push(carry ? `${carry}${lang === 'zh' ? '' : ' '}${piece}` : piece);
    carry = '';
  }
  if (carry) { if (out.length) out[out.length - 1] += `${lang === 'zh' ? '' : ' '}${carry}`; else out.push(carry); }
  return out;
}

/**
 * 逐句真实时长 → 字幕时间轴：第 i 句从「前面各句时长 + 句间停顿」处开始，持续它自己的语音时长。
 * 与拼接旁白用的是同一组时长、同一个停顿，所以字幕与声音逐句对齐；totalSec = 拼接后旁白总长。
 */
export function narrationTimeline(units: Array<{ text: string; durationSec: number }>, pauseSec = NARRATION_PAUSE_SEC): { cues: CaptionCue[]; totalSec: number } {
  const cues: CaptionCue[] = [];
  let t = 0;
  units.forEach((u, i) => {
    if (i) t += pauseSec;
    const start = t;
    t += Math.max(0, u.durationSec);
    // 结束时间向下取到 1/100 秒：字幕绝不晚于这句话结束
    cues.push({ start: round2(start), end: Math.max(round2(start) + 0.01, floor2(t)), text: u.text.trim() });
  });
  return { cues, totalSec: round3(t) };
}

/**
 * 字幕排版（1080 宽竖版）：每行字数上限按各语言字号下的实际字宽定，左右各留 6% 安全边距；一条字幕最多 2 行。
 * libass 不会在没有空格的中文里换行（实测整行出画），所以换行一律由我们预先切好（wrapCaption），不靠 libass。
 */
export const CAPTION_LINE_CHARS: Record<CharityLang, number> = { zh: 16, en: 32, ar: 30 };
/**
 * 字幕字号（占画面高的比例）：与每行字数一起定。实测 libass + Arial Unicode MS 粗体：
 * 中文 69px ≈ 48px/字 → 16 字 ≈ 770px；英文 63px ≈ 23px/字符 → 32 字符 ≈ 740px；阿语 71px ≈ 23px/字符 → 30 字符 ≈ 700px，
 * 都在 1080 − 2×6% 边距 − 底框内衬 ≈ 930px 的安全宽度里，个别行因不拆词多出几个字也放得下。
 */
export const CAPTION_FONT_RATIO: Record<CharityLang, number> = { zh: 0.036, en: 0.033, ar: 0.037 };
/** 一条字幕最多多少字（2 行）；超过的句子拆成相继几条 */
export const CAPTION_MAX_CHARS: Record<CharityLang, number> = {
  zh: CAPTION_LINE_CHARS.zh * 2, en: CAPTION_LINE_CHARS.en * 2, ar: CAPTION_LINE_CHARS.ar * 2,
};
/** 句内可断处：，、：；, ; : ، ؛ */
const CLAUSE_MARKS = /[\uff0c\u3001\uff1a\uff1b,;:\u060c\u061b]/;

/** 句内按标点切成分句（标点留在前一段；英 / 阿文要求标点后是空白，千分位「85,000」不算），再依次装进不超过 max 的组 */
function packClauses(t: string, lang: CharityLang, max: number): string[] {
  const clauseCut = (i: number): boolean => CLAUSE_MARKS.test(t[i - 1]) && (lang === 'zh' ? !/[\p{P}]/u.test(t[i]) : /\s/.test(t[i]));
  const clauses: string[] = [];
  let from = 0;
  for (let i = 1; i < t.length; i += 1) if (clauseCut(i)) { clauses.push(t.slice(from, i)); from = i; }
  clauses.push(t.slice(from));
  const sep = lang === 'zh' ? '' : ' ';
  const out: string[] = [];
  let cur = '';
  for (const raw of clauses) {
    const c = raw.trim();
    if (!c) continue;
    const joined = cur ? `${cur}${sep}${c}` : c;
    if (joined.length <= max || !cur) { cur = joined; continue; }
    out.push(cur);
    cur = c;
  }
  if (cur) out.push(cur);
  return out;
}

/**
 * 旁白的合成单元：按句切；一屏放不下的长句再在句内标点处拆成几组（各自合成、各自一条字幕），
 * 这样每条字幕的起止都是真实语音时长，不靠字数估算（日期、数字读出来比字面长得多）。
 */
export function narrationUnits(text: string, lang: CharityLang, max = CAPTION_MAX_CHARS[lang]): string[] {
  return splitSentences(text, lang).flatMap((s) => (s.length <= max ? [s] : packClauses(s, lang, max)));
}

/**
 * 一条字幕上屏：句内标点分组后仍超长（整段没有逗号）的，按英 / 阿文空格、中文字间均分成几屏
 * （不拆英文单词与数字）；时间在它自己的真实语音区间里按字数比例分。
 */
export function splitForDisplay(text: string, lang: CharityLang, max = CAPTION_MAX_CHARS[lang]): string[] {
  const t = text.trim();
  if (!t) return [];
  if (t.length <= max) return [t];
  return packClauses(t, lang, max).flatMap((g) => (g.length <= max ? [g] : evenSplit(g, lang, max)));
}

/**
 * 均分成 ceil(长/上限) 段，断点取离均分点最近的合法位置：英 / 阿文在空格，中文在字间
 * （不拆英文单词与数字、标点不落到行首；均分点 ±3 字内有句内标点就优先在标点后断）。
 */
function evenSplit(t: string, lang: CharityLang, max: number): string[] {
  const k = Math.ceil(t.length / max);
  // 中文：只在词边界断（Intl.Segmenter 分词，「协会」「沙特阿拉伯」不会被拆到两行）；行首不放标点；英文单词与数字不拆
  const zhChar = (i: number): boolean => !/[\p{P}]/u.test(t[i]) && !(/[A-Za-z0-9]/.test(t[i - 1]) && /[A-Za-z0-9.,]/.test(t[i]));
  const words = lang === 'zh' ? zhWordBoundaries(t) : null;
  const ok = (i: number): boolean => (lang === 'zh'
    ? zhChar(i) && (!words || words.has(i))
    : /\s/.test(t[i - 1]) && !/\s/.test(t[i]));
  const cuts: number[] = [];
  let prev = 0;
  for (let j = 1; j < k; j += 1) {
    const target = Math.round((t.length * j) / k);
    let best = -1;
    // 这一段不超上限、剩下的还装得下（能满足就不接受超长的断点）
    const fits = (i: number): boolean => i - prev <= max && t.length - i <= max * (k - j);
    const pick = (range: number, cond: (i: number) => boolean): void => {
      for (let d = 0; d <= range && best < 0; d += 1) {
        for (const i of [target - d, target + d]) if (i > prev + 1 && i < t.length - 1 && ok(i) && cond(i)) { best = i; break; }
      }
    };
    // 优先在句内标点后断；中文人名 / 译名的间隔号「·」后也算好断点（「穆罕默德·本·阿卜杜勒阿齐兹」按名字段断）
    pick(4, (i) => fits(i) && (CLAUSE_MARKS.test(t[i - 1] === ' ' ? t[i - 2] : t[i - 1]) || (lang === 'zh' && /[\u00b7\u30fb]/.test(t[i - 1]))));
    pick(t.length, fits);
    pick(t.length, () => true);
    // 极端情况（整段是一个超长词 / 分词不可用）：退回任意非标点字间
    if (best < 0 && lang === 'zh') for (let d = 0; d <= t.length && best < 0; d += 1) for (const i of [target - d, target + d]) if (i > prev + 1 && i < t.length - 1 && zhChar(i)) { best = i; break; }
    if (best < 0) break;
    cuts.push(best);
    prev = best;
  }
  const out: string[] = [];
  let from = 0;
  for (const c of [...cuts, t.length]) { const p = t.slice(from, c).trim(); if (p) out.push(p); from = c; }
  return out;
}

/** 中文分词后的词边界位置（字符下标）；运行环境没有 Intl.Segmenter 时返回 null（退回按字断） */
function zhWordBoundaries(t: string): Set<number> | null {
  try {
    const Seg = (Intl as unknown as { Segmenter?: new (l: string, o: { granularity: 'word' }) => { segment: (s: string) => Iterable<{ index: number }> } }).Segmenter;
    if (!Seg) return null;
    const segs = [...new Seg('zh', { granularity: 'word' }).segment(t)] as Array<{ index: number; segment?: string }>;
    const single = (k: number): boolean => { const x = segs[k]?.segment || ''; return x.length === 1 && /\p{Script=Han}/u.test(x); };
    const out = new Set<number>();
    // 连续的单字段多半是词典外的译名 / 专名（「阿|卜|杜|勒|阿|齐|兹」「谢|赫」）：连在一起当一个词，不在其中断
    segs.forEach((seg, k) => { if (!(k > 0 && single(k - 1) && single(k))) out.add(seg.index); });
    return out;
  } catch { return null; }
}

/** 一条字幕切成行（\n 分隔）：不超过每行字数就一行，否则均分成最少的行数（通常 2 行） */
export function wrapCaption(text: string, lang: CharityLang, perLine = CAPTION_LINE_CHARS[lang]): string {
  const t = text.trim().replace(/\s*\n\s*/g, ' ');
  if (t.length <= perLine) return t;
  return evenSplit(t, lang, perLine).join('\n');
}

/** 旁白字幕上屏：每句一条；超长句在它自己的真实语音区间里按字数比例拆成几屏（整句起止不变） */
export function displayCues(cues: CaptionCue[], lang: CharityLang): CaptionCue[] {
  const out: CaptionCue[] = [];
  for (const c of cues) {
    const parts = splitForDisplay(c.text, lang);
    if (parts.length <= 1) { out.push(c); continue; }
    const w = parts.map((p) => p.replace(/\s+/g, '').length || 1);
    const sum = w.reduce((a, b) => a + b, 0);
    let t = c.start;
    parts.forEach((text, i) => {
      const end = i === parts.length - 1 ? c.end : round2(t + ((c.end - c.start) * w[i]) / sum);
      out.push({ start: round2(t), end, text });
      t = end;
    });
  }
  return out;
}

/** 旁白音频旁的时间轴文件：speech-zh.mp3 → speech-zh.cues.json */
export function narrationTrackPath(audioPath: string): string {
  return audioPath.replace(/\.[^./\\]+$/, '') + '.cues.json';
}

export interface NarrationTrack { version: 1; lang: CharityLang; pauseSec: number; durationSec: number; cues: CaptionCue[] }

export function parseNarrationTrack(json: string): NarrationTrack | null {
  try {
    const j = JSON.parse(json);
    if (!j || j.version !== 1 || !Array.isArray(j.cues)) return null;
    const cues: CaptionCue[] = j.cues
      .filter((c: any) => c && typeof c.text === 'string' && c.text.trim() && Number.isFinite(c.start) && Number.isFinite(c.end) && c.end > c.start)
      .map((c: any) => ({ start: Number(c.start), end: Number(c.end), text: String(c.text) }));
    if (!cues.length) return null;
    return { version: 1, lang: j.lang, pauseSec: Number(j.pauseSec) || 0, durationSec: Number(j.durationSec) || 0, cues };
  } catch { return null; }
}

/** SRT 时间：00:01:05,500 */
export function srtTime(sec: number): string {
  const ms = Math.max(0, Math.round(sec * 1000));
  const p = (n: number, w = 2): string => String(n).padStart(w, '0');
  return `${p(Math.floor(ms / 3_600_000))}:${p(Math.floor(ms / 60_000) % 60)}:${p(Math.floor(ms / 1000) % 60)},${p(ms % 1000, 3)}`;
}

export function buildSrt(cues: CaptionCue[]): string {
  return cues.map((c, i) => `${i + 1}\n${srtTime(c.start)} --> ${srtTime(c.end)}\n${c.text.replace(/\r?\n/g, ' ')}\n`).join('\n');
}

export function assTime(sec: number): string {
  const cs = Math.max(0, Math.round(sec * 100));
  const h = Math.floor(cs / 360_000);
  const m = Math.floor(cs / 6000) % 60;
  const rest = (cs % 6000) / 100;
  return `${h}:${String(m).padStart(2, '0')}:${rest.toFixed(2).padStart(5, '0')}`;
}

export function assEscape(text: string): string {
  return text.replace(/\\/g, '\\\\').replace(/\{/g, '(').replace(/\}/g, ')').replace(/\r?\n/g, '\\N');
}

export interface AssOptions {
  width: number;
  height: number;
  fontName: string;
  /** 顶部常驻的标题（机构名 / 活动名），空则不加。与底部旁白字幕是两个样式、两层，互不混排 */
  title?: string;
  /** 成片时长：标题从头挂到尾；缺省为最后一条字幕结束后 1 秒 */
  durationSec?: number;
  /** 片尾卡：画面正中机构名 + 标语（视频提示词要求片尾时才有），第 2 层 */
  endCard?: { start: number; end: number; title: string; line: string };
}

/** 生成 ASS：底部旁白字幕（半透明底条，第 0 层，预先换行、最多 2 行、左右 6% 安全边距），顶部小标题（第 1 层）；阿语字体走同一 fontsdir */
export function buildAss(cues: CaptionCue[], lang: CharityLang, opts: AssOptions): string {
  const fontSize = Math.round(opts.height * CAPTION_FONT_RATIO[lang]);
  const titleSize = Math.round(opts.height * 0.024);
  const marginV = Math.round(opts.height * 0.12);
  const marginH = Math.round(opts.width * 0.06);
  const head = [
    '[Script Info]',
    'ScriptType: v4.00+',
    `PlayResX: ${opts.width}`,
    `PlayResY: ${opts.height}`,
    'WrapStyle: 0',
    'ScaledBorderAndShadow: yes',
    '',
    '[V4+ Styles]',
    'Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding',
    // BorderStyle=3：半透明深色底框——素材本身常是带字的海报，纯描边字幕会和底图文字打架
    `Style: Cap,${opts.fontName},${fontSize},&H00FFFFFF,&H000000FF,&H00102030,&H70102030,1,0,0,0,100,100,0,0,3,10,0,2,${marginH},${marginH},${marginV},1`,
    `Style: Title,${opts.fontName},${titleSize},&H00FFFFFF,&H000000FF,&H00102030,&H60102030,1,0,0,0,100,100,0,0,1,2,0,8,${marginH},${marginH},${Math.round(opts.height * 0.06)},1`,
    `Style: End,${opts.fontName},${Math.round(opts.height * 0.042)},&H00FFFFFF,&H000000FF,&H00102030,&H80102030,1,0,0,0,100,100,0,0,3,18,0,5,${marginH},${marginH},0,1`,
    '',
    '[Events]',
    'Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text',
  ];
  const events: string[] = [];
  const last = cues.length ? cues[cues.length - 1].end : 0;
  const titleEnd = opts.durationSec && opts.durationSec > 0 ? opts.durationSec : last > 0 ? last + 1 : 0;
  if (opts.title && titleEnd > 0) {
    events.push(`Dialogue: 1,${assTime(0)},${assTime(titleEnd)},Title,,0,0,0,,${assEscape(opts.title)}`);
  }
  if (opts.endCard && opts.endCard.end > opts.endCard.start) {
    const e = opts.endCard;
    const lines = [e.title, e.line].filter((x, i, a) => x && a.indexOf(x) === i).map((x) => wrapCaption(x, lang));
    if (lines.length) events.push(`Dialogue: 2,${assTime(e.start)},${assTime(e.end)},End,,0,0,0,,{\\fad(400,0)}${assEscape(lines.join('\n'))}`);
  }
  for (const c of cues) {
    // \fad 淡入淡出 240ms：字幕切换不生硬
    events.push(`Dialogue: 0,${assTime(c.start)},${assTime(c.end)},Cap,,0,0,0,,{\\fad(240,240)}${assEscape(wrapCaption(c.text, lang))}`);
  }
  return [...head, ...events, ''].join('\n');
}
