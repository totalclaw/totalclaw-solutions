/**
 * 慈善活动内容工场 · 两个提示词（主进程与渲染层共用，纯函数，零依赖）。
 *
 *   内容提示词（第 1 步）决定「讲什么」：看图描述的侧重点、三语报告 / 海报文案、第 3 步默认旁白（报告摘要）。
 *   视频提示词（第 4 步）决定「怎么拍」：AI 镜头的图生视频 prompt、配乐 prompt、剪辑版的节奏与转场、片尾标语。
 *
 * 成片时两者合并成最终镜头提示词（mergeShotPrompt）：内容要点 + 视觉风格 + 固定约束，按短语去重、分段限长。
 * 两个都为空时，镜头 / 配乐 prompt、剪辑节奏、片尾都与没有提示词时完全一致。
 *
 * 默认提示词是**喂给模型的内容**，按内容语言（zh / en / ar）三语对照写死，不是界面文案，
 * 所以不走 i18nT（同 charityContent/reportText.ts，在 i18n-codemod 的豁免清单里）。
 */

export type CharityPromptLang = 'zh' | 'en' | 'ar';

/** 单个提示词的长度上限（IPC 校验、输入框 maxlength、存档同一个数） */
export const CHARITY_PROMPT_MAX = 8000;
/** 第 3 步文章转语音的朗读文本上限（每种语言） */
export const CHARITY_TEXT_MAX = 8000;
/**
 * 两个提示词合计超过这么长，拼镜头 / 配乐 prompt 前先用文本模型浓缩成要点（每次成片只浓缩一次并缓存）；
 * 报告 / 旁白仍整段带入。默认提示词远低于这个数，不触发浓缩。
 */
export const CONDENSE_OVER = 800;
/** fal 各模型提示词硬上限（MiniMax 图生视频 2000 字符；Stable Audio 取 500 保守值）：合并结果最后按它截断 */
export const FAL_PROMPT_LIMIT = { i2v: 2000, music: 500 } as const;

/** 内容提示词默认值：围绕慈善活动记录，突出主题与机构、规模与善款（只用档案数字）、现场亮点、影响与致谢 */
export const DEFAULT_CONTENT_PROMPT: Record<CharityPromptLang, string> = {
  zh: '围绕这次慈善活动做记录：突出活动主题与主办 / 合作机构；写清参与规模与善款（数字只用活动档案里的）；讲现场亮点与人物互动；落到社会影响与致谢。语气真诚、正式、有温度，面向公众与合作伙伴。',
  en: 'Document this charity event: highlight the event theme and the host / partner organizations; state the scale of participation and funds raised (use only the numbers in the event record); describe on-site highlights and human moments; close with the social impact and thanks. Tone: sincere, formal and warm, for the public and partners.',
  ar: 'وثّق هذه الفعالية الخيرية: أبرز موضوع الفعالية والجهات المنظِّمة والشريكة؛ اذكر حجم المشاركة والتبرعات (استخدم أرقام سجل الفعالية فقط)؛ صِف أبرز لحظات الفعالية والتفاعل بين الناس؛ واختم بالأثر المجتمعي والشكر. النبرة: صادقة ورسمية ودافئة، موجّهة للجمهور والشركاء.',
};

/** 视频提示词默认值：9:16 公益宣传片——暖亮色调、稳慢推拉横移、人物细节特写、舒缓到渐强、配乐不抢戏、片尾机构名 + 口号 */
export const DEFAULT_VIDEO_PROMPT: Record<CharityPromptLang, string> = {
  zh: '9:16 竖版公益宣传片风格：温暖明亮的色调；稳定缓慢的推拉与横移镜头；人物与现场细节特写；节奏舒缓，到结尾渐强；配乐温暖励志、不喧宾夺主；片尾出现机构名与活动口号。',
  en: '9:16 vertical charity promo style: warm, bright color tones; steady, slow push-in and lateral tracking shots; close-ups of people and on-site details; a gentle pace that builds toward the ending; warm, uplifting music that never overpowers the voice-over; end with the organization name and the event slogan.',
  ar: 'أسلوب فيديو خيري عمودي 9:16: ألوان دافئة ومشرقة؛ لقطات تقريب وتحريك جانبي ثابتة وبطيئة؛ لقطات قريبة للأشخاص وتفاصيل المكان؛ إيقاع هادئ يتصاعد نحو النهاية؛ موسيقى دافئة ملهمة لا تطغى على التعليق الصوتي؛ وفي الختام اسم الجهة وشعار الفعالية.',
};

/** 没有视频提示词时的镜头 prompt（与此前写死的一字不差） */
export const BASE_SHOT_PROMPT = 'gentle cinematic camera move, people at a community charity event, natural light, subtle motion, no text overlay';
/** 合并后始终追加的约束：图生视频不许自己往画面里写字 */
export const SHOT_CONSTRAINTS = 'natural motion, no text overlay, no subtitles';
/** 合并镜头 prompt 的目标长度（短而准；远低于 FAL_PROMPT_LIMIT.i2v） */
export const SHOT_PROMPT_MAX = 600;
const SHOT_CONTENT_MAX = 220;
const SHOT_STYLE_MAX = 280;
export const MUSIC_PROMPT_MAX = 320;

/** 规整输入：非字符串当空，去首尾空白，压连续空行，截到上限 */
export function cleanPrompt(v: unknown, max = CHARITY_PROMPT_MAX): string {
  if (typeof v !== 'string') return '';
  return v.replace(/\r\n?/g, '\n').replace(/\n{3,}/g, '\n\n').trim().slice(0, max);
}

/** 提示词切成短语：换行、分号、句末标点（中 / 英 / 阿）为界；逗号不切（「warm, bright tones」是一个意思） */
export function promptPhrases(text: string): string[] {
  return cleanPrompt(text)
    .split(/[\n;؛；。！？!?]+|\.(?=\s|$)/)
    .map((s) => s.replace(/^[\s,،，、:：\-*•·]+|[\s,،，、:：]+$/g, '').trim())
    .filter((s) => s.length > 1);
}

const normKey = (s: string): string => s.toLowerCase().replace(/[\s\p{P}\p{S}]+/gu, '');

/** 按短语去重：规整后相同，或一条被另一条完全包含（留长的那条，位置取先出现的） */
export function dedupePhrases(phrases: string[]): string[] {
  const kept: Array<{ text: string; key: string }> = [];
  for (const text of phrases) {
    const key = normKey(text);
    if (!key) continue;
    if (kept.some((k) => k.key.includes(key))) continue;
    const i = kept.findIndex((k) => key.includes(k.key));
    if (i >= 0) kept[i] = { text, key };
    else kept.push({ text, key });
  }
  // 替换后可能出现新的包含关系（长句吞掉了后面的短句）
  return kept.filter((k, i) => !kept.some((o, j) => j !== i && o.key !== k.key && o.key.includes(k.key))).map((k) => k.text);
}

/** 按短语装到上限：装不下的整条丢弃（不截半句）；第一条就超长才硬截 */
export function clampPhrases(phrases: string[], max: number, sep = '; '): string {
  let out = '';
  for (const p of phrases) {
    const next = out ? `${out}${sep}${p}` : p;
    if (next.length <= max) { out = next; continue; }
    if (!out) out = p.slice(0, max).trim();
    break;
  }
  return out;
}

/** 内容提示词里只关乎「怎么写」的短语（数字规则、语气、受众、字数）：镜头画面用不上 */
const WRITING_ONLY = /数字|金额|善款|字数|语气|口吻|面向|受众|number|figure|amount|donation|funds|raised|tone|audience|word|أرقام|رقم|تبرع|النبرة|موجه|الجمهور/i;
/** 视频提示词里交给配乐的短语 */
const MUSIC_RE = /配乐|音乐|music|soundtrack|song|موسيق|لحن/i;
/** 视频提示词里交给片尾的短语 */
const ENDING_RE = /片尾|结尾|收尾|口号|标语|slogan|tagline|ending|end card|end with|الختام|شعار|النهاية/i;
/** 「9:16 竖版公益宣传片风格：」这类总起头：画幅成片已固定，冒号后面的才是风格 */
const STYLE_HEADER_RE = /^(.{0,60}?)(?:\uff1a|:\s)\s*/;
const HEADER_WORDS = /9\s*:\s*16|竖版|风格|宣传片|vertical|style|promo|عمودي|أسلوب/i;
function stripStyleHeader(p: string): string {
  const m = p.match(STYLE_HEADER_RE);
  return m && HEADER_WORDS.test(m[1]) ? p.slice(m[0].length).trim() : p;
}

/** 两个提示词合计是否长到需要先浓缩再拼镜头 / 配乐 prompt */
export function needsCondense(contentPrompt: string, videoPrompt: string): boolean {
  return cleanPrompt(contentPrompt).length + cleanPrompt(videoPrompt).length > CONDENSE_OVER;
}

export interface MergedPrompts {
  /** 最终镜头提示词（AI 增强版每个镜头的图生视频 prompt） */
  shot: string;
  /** 配乐提示词（Stable Audio） */
  music: string;
  /** 进了镜头 prompt 的内容要点 / 视觉风格（界面展开「本次实际使用的提示词」时分开列） */
  contentPoints: string[];
  stylePoints: string[];
}

/**
 * 合并规则（内容决定讲什么 + 视频决定怎么拍）：
 *   ① 两个提示词各自切短语、去重；视频短语再和内容短语互相去重（同一意思只留一次）
 *   ② 内容短语去掉只关乎写作的（数字规则 / 语气 / 受众），留下主题、人物、现场这类画面要点，限 220 字
 *   ③ 视频短语去掉配乐（给配乐 prompt）、片尾（给片尾标语）、画幅（成片固定 9:16），留下视觉风格，限 280 字
 *   ④ 镜头 prompt = 「Subject: 要点. Visual style: 风格. 固定约束」，总长 ≤ 600；缺哪段省哪段，风格缺省用原默认镜头描述
 *   ⑤ 两个都空 → 与原默认镜头 prompt 完全一致
 */
export function mergeShotPrompt(contentPrompt: string, videoPrompt: string, mood = 'warm'): MergedPrompts {
  const content = dedupePhrases(promptPhrases(contentPrompt)).filter((p) => !WRITING_ONLY.test(p));
  const contentKeys = content.map(normKey);
  const video = dedupePhrases(promptPhrases(videoPrompt).map(stripStyleHeader).filter((p) => p.length > 1))
    .filter((p) => !contentKeys.some((k) => k.includes(normKey(p))));
  return composeMerged(content, video.filter((p) => !MUSIC_RE.test(p) && !ENDING_RE.test(p)), video.filter((p) => MUSIC_RE.test(p)), mood);
}

/**
 * 已分好类的要点 → 镜头 / 配乐 prompt（mergeShotPrompt 与「长提示词先浓缩」共用）：
 * 各段按短语去重、装到目标长度，最后再按 fal 模型硬上限截断。
 */
export function composeMerged(contentPts: string[], stylePts: string[], musicPts: string[], mood = 'warm'): MergedPrompts {
  const content = dedupePhrases(contentPts.map((p) => p.trim()).filter(Boolean));
  const contentKeys = content.map(normKey);
  const stylePoints = dedupePhrases(stylePts.map((p) => p.trim()).filter(Boolean)).filter((p) => !contentKeys.some((k) => k.includes(normKey(p))));
  const musicPoints = dedupePhrases(musicPts.map((p) => p.trim()).filter(Boolean));
  const subject = clampPhrases(content, SHOT_CONTENT_MAX);
  const style = clampPhrases(stylePoints, SHOT_STYLE_MAX);
  const shot = !subject && !style
    ? BASE_SHOT_PROMPT
    : [subject && `Subject: ${subject}.`, `Visual style: ${style || BASE_SHOT_PROMPT.replace(/, no text overlay$/, '')}.`, `${SHOT_CONSTRAINTS}.`].filter(Boolean).join(' ').slice(0, Math.min(SHOT_PROMPT_MAX, FAL_PROMPT_LIMIT.i2v));
  return {
    shot,
    music: musicPrompt(mood, musicPoints),
    contentPoints: subject ? content.slice(0, subject.split('; ').length) : [],
    stylePoints: style ? stylePoints.slice(0, style.split('; ').length) : [],
  };
}

/** 配乐 prompt：原默认描述 + 视频提示词里的配乐短语；没有配乐短语时与原默认一字不差 */
export function musicPrompt(mood: string, musicPoints: string[] = []): string {
  const base = `${mood || 'warm, hopeful'} cinematic background music for a charity event highlight video, soft piano and strings, no vocals`;
  const extra = clampPhrases(dedupePhrases(musicPoints), MUSIC_PROMPT_MAX - base.length - 16);
  return (extra ? `${base}. Style notes: ${extra}` : base).slice(0, FAL_PROMPT_LIMIT.music);
}

export type ClipPace = 'slow' | 'normal' | 'fast';
export type ClipTransition = 'cut' | 'fade';
export interface ClipStyle { pace: ClipPace; transition: ClipTransition }

const SLOW_RE = /缓慢|舒缓|慢|平稳|稳定|悠扬|slow|gentle|calm|steady|relaxed|بطيئ|هادئ|ثابت/i;
const FAST_RE = /快节奏|快切|快速|动感|激昂|紧凑|明快|fast|dynamic|energetic|upbeat|punchy|سريع|حيوي|نشيط/i;
const FADE_RE = /淡入|淡出|渐变|叠化|溶解|柔和转场|fade|dissolve|crossfade|تلاش|تدريجي/i;
const CUT_RE = /硬切|直切|快切|hard cut|jump cut|straight cut|قطع مباشر/i;

/**
 * 剪辑版的节奏与转场：从视频提示词里认关键词（中 / 英 / 阿）。
 * 转场没写明时跟节奏走：舒缓 → 淡入淡出，其余 → 直切。空提示词 = normal + cut（与此前一致）。
 */
export function clipStyleFromPrompt(videoPrompt: string): ClipStyle {
  const p = cleanPrompt(videoPrompt);
  if (!p) return { pace: 'normal', transition: 'cut' };
  const slow = SLOW_RE.test(p);
  const fast = FAST_RE.test(p);
  const pace: ClipPace = slow && !fast ? 'slow' : fast && !slow ? 'fast' : 'normal';
  const transition: ClipTransition = FADE_RE.test(p) ? 'fade' : CUT_RE.test(p) ? 'cut' : pace === 'slow' ? 'fade' : 'cut';
  return { pace, transition };
}

/** 片尾：明写了标语（「片尾口号：xxx」「slogan: xxx」「شعار: xxx」）就用它；只提到片尾 / 口号就用活动名；没提不加片尾 */
export function endSloganFromPrompt(videoPrompt: string): { wanted: boolean; text: string } {
  const p = cleanPrompt(videoPrompt);
  if (!p) return { wanted: false, text: '' };
  const m = p.match(/(?:片尾|结尾)(?:口号|标语|字幕)?\s*[:：]\s*([^\n;；。]+)|(?:slogan|tagline|ending line|end card)\s*[:：]\s*([^\n;]+)|(?:شعار(?:\s+الختام)?|الختام)\s*[:：]\s*([^\n؛;]+)/i);
  const text = (m?.[1] || m?.[2] || m?.[3] || '').trim().replace(/[.。]+$/, '').slice(0, 60);
  if (text) return { wanted: true, text };
  return { wanted: ENDING_RE.test(p), text: '' };
}

// ── 朗读文本转译（第 3 步：一份文稿配多语言的音） ──

/** 一次送给模型的字数上限。整篇一次性译容易被截断、也更容易跑偏，按整句切块分次译。 */
export const TRANSLATE_CHUNK_CHARS = 1200;

const TRANSLATE_LANG_NAME: Record<CharityPromptLang, string> = { zh: 'Simplified Chinese', en: 'English', ar: 'Modern Standard Arabic' };

/**
 * 转译提示词。要点：
 *   - 只翻译，不改写、不概括、不加话——这段文字接下来是要被读出来的，多一句都是播出事故；
 *   - 人名 / 机构名 / 数字 / 日期原样保留，数字尤其不能换算或改写；
 *   - 输出 JSON 单字段，免得模型在正文前后加「好的，这是译文」。
 */
export function translatePrompt(text: string, target: CharityPromptLang): string {
  return [
    `Translate the text below into ${TRANSLATE_LANG_NAME[target]}.`,
    'Rules: translate faithfully and completely; do not summarize, expand, explain or add any commentary.',
    'Keep personal names, organisation names, numbers, amounts and dates exactly as they are.',
    'Keep the original line breaks and paragraph structure.',
    'The result will be read aloud by a speech synthesiser, so output plain prose only — no markdown, no bullet markers, no quotes around the whole text.',
    'Reply with JSON only, exactly: {"text": "<translation>"}',
    '',
    'TEXT:',
    text,
  ].join('\n');
}
