/**
 * 慈善活动内容工场 · 活动档案（纯函数，可单测）。
 *
 * 档案是整条链路唯一的「数字来源」：报告 / 海报 / 旁白里出现的人数、善款、日期都必须从这里取，
 * 模型只负责措辞。这里负责：视觉模型草案 JSON → 规范档案；用户手改合并；三语兜底。
 */
import type { CharityArchive, CharityLang, CharityTri } from '@totalclaw/ipc-contracts';

export const LANGS: CharityLang[] = ['zh', 'en', 'ar'];

export function tri(zh = '', en = '', ar = ''): CharityTri {
  return { zh, en, ar };
}

/** 任意值 → 三语对象：字符串视为三语同文；缺的语言用其它语言补，保证界面永不出现空白 */
export function toTri(value: unknown, fallback?: CharityTri): CharityTri {
  const out = tri();
  if (typeof value === 'string') {
    const v = value.trim();
    out.zh = out.en = out.ar = v;
  } else if (value && typeof value === 'object') {
    const rec = value as Record<string, unknown>;
    for (const lang of LANGS) {
      const v = rec[lang];
      if (typeof v === 'string') out[lang] = v.trim();
    }
  }
  for (const lang of LANGS) {
    if (!out[lang]) out[lang] = fallback?.[lang] || out.zh || out.en || out.ar || fallback?.zh || '';
  }
  return out;
}

export function isBlankTri(value: CharityTri | undefined): boolean {
  return !value || LANGS.every((l) => !value[l]);
}

/** 人数：接受 "约 120 人" / "120" / 120；抽不出数字 → null（界面显示「未填」，不猜） */
export function parseParticipants(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value) && value >= 0) return Math.round(value);
  if (typeof value !== 'string') return null;
  const m = value.replace(/[,，]/g, '').match(/(\d+(?:\.\d+)?)/);
  if (!m) return null;
  const n = Number(m[1]);
  return Number.isFinite(n) && n >= 0 ? Math.round(n) : null;
}

/** 日期：只认 YYYY-MM-DD / YYYY/MM/DD / YYYY年M月D日；认不出返回空串（不用今天冒充活动日） */
export function normalizeDate(value: unknown): string {
  if (typeof value !== 'string') return '';
  const s = value.trim();
  const m = s.match(/(\d{4})\s*[-/年.]\s*(\d{1,2})\s*[-/月.]\s*(\d{1,2})/);
  if (!m) return /^\d{4}-\d{2}-\d{2}$/.test(s) ? s : '';
  const y = Number(m[1]); const mo = Number(m[2]); const d = Number(m[3]);
  if (mo < 1 || mo > 12 || d < 1 || d > 31) return '';
  return `${y}-${String(mo).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
}

export function emptyArchive(source: CharityArchive['source'] = 'manual'): CharityArchive {
  return {
    orgName: tri(), eventName: tri(), date: '', location: tri(), participants: null,
    donation: '', organizer: tri(), summary: tri(), source,
  };
}

/** 任意来源（模型 JSON / 预置 JSON / 渲染层回传）→ 规范档案；字段缺失用 base 补 */
export function normalizeArchive(raw: unknown, base?: CharityArchive, source?: CharityArchive['source']): CharityArchive {
  const rec = (raw && typeof raw === 'object' ? raw : {}) as Record<string, unknown>;
  const b = base || emptyArchive(source || 'manual');
  const src = source || (typeof rec.source === 'string' && ['vlm', 'demo', 'manual'].includes(rec.source) ? rec.source as CharityArchive['source'] : b.source);
  const pick = (key: keyof CharityArchive): CharityTri => toTri(rec[key], b[key] as CharityTri);
  const eventName = pick('eventName');
  // 简介以活动本身为主语：去掉「图片展示了…」类开头；整句只剩看图口吻时回落活动名
  const summary = pick('summary');
  for (const lang of LANGS) if (summary[lang]) summary[lang] = stripImageLead(summary[lang], lang) || eventName[lang];
  const donation = typeof rec.donation === 'string' ? rec.donation.trim() : (typeof rec.donation === 'number' ? String(rec.donation) : b.donation);
  return {
    orgName: pick('orgName'),
    eventName,
    date: normalizeDate(rec.date) || b.date,
    location: pick('location'),
    participants: rec.participants === undefined ? b.participants : parseParticipants(rec.participants),
    donation,
    organizer: pick('organizer'),
    summary,
    source: src,
  };
}

/** 字符串结束引号之后应该出现什么：键后是冒号；值后是 , } ] 或文本结束（逗号后还得像下一个键 / 值） */
function isClosingQuote(s: string, from: number, isKey: boolean, container: '{' | '[' | undefined): boolean {
  const rest = s.slice(from);
  if (isKey) return /^\s*:/.test(rest);
  if (/^\s*(?:$|[}\]]|```)/.test(rest)) return true;
  return container === '['
    ? /^\s*,\s*(?:["{[\]]|-?\d|true\b|false\b|null\b)/.test(rest)
    : /^\s*,\s*["}]/.test(rest);
}

/**
 * 宽松修复模型写坏的 JSON：字符串里没转义的双引号（阿语 / 英文引用标题最常见）、字符串里的裸换行、
 * 对象 / 数组末尾多余的逗号。靠「结束引号后面该跟什么」判断一个引号是不是真的收尾。
 * 被截断（字符串或括号没收口）返回 null——不替模型补内容。
 */
export function repairJsonText(src: string): string | null {
  let out = '';
  const stack: Array<'{' | '['> = [];
  let expectKey = false;
  let i = 0;
  while (i < src.length) {
    const ch = src[i];
    if (ch === '"') {
      const container = stack[stack.length - 1];
      const isKey = container === '{' && expectKey;
      let buf = '"';
      let j = i + 1;
      let closed = false;
      while (j < src.length) {
        const c = src[j];
        if (c === '\\') { buf += c + (src[j + 1] ?? ''); j += 2; continue; }
        if (c === '"') {
          if (isClosingQuote(src, j + 1, isKey, container)) { buf += '"'; j += 1; closed = true; break; }
          buf += '\\"'; j += 1; continue;
        }
        buf += c === '\n' ? '\\n' : c === '\r' ? '\\r' : c === '\t' ? '\\t' : c;
        j += 1;
      }
      if (!closed) return null;
      out += buf; i = j;
      if (isKey) expectKey = false;
      continue;
    }
    if (ch === '{') { stack.push('{'); expectKey = true; }
    else if (ch === '[') { stack.push('['); expectKey = false; }
    else if (ch === '}' || ch === ']') { stack.pop(); out = out.replace(/,\s*$/, ''); }
    else if (ch === ',') expectKey = stack[stack.length - 1] === '{';
    else if (ch === ':') expectKey = false;
    out += ch; i += 1;
  }
  return stack.length ? null : out;
}

function jsonCandidates(text: string): string[] {
  const s = String(text || '');
  const closedFence = s.match(/```(?:json)?\s*([\s\S]*?)```/i)?.[1];
  const openFence = s.match(/```(?:json)?\s*([\s\S]*)$/i)?.[1];
  return [closedFence, openFence, s].filter((x): x is string => !!x);
}

/** 从模型回复里抠 JSON：去围栏 → 严格解析 → 宽松修复（未转义引号 / 裸换行 / 尾逗号）后再解析 */
export function extractJsonObject(text: string): Record<string, unknown> | null {
  const asObject = (raw: string | null): Record<string, unknown> | null => {
    if (!raw) return null;
    try {
      const obj = JSON.parse(raw);
      return obj && typeof obj === 'object' && !Array.isArray(obj) ? obj as Record<string, unknown> : null;
    } catch { return null; }
  };
  const candidates = jsonCandidates(text);
  for (const repair of [false, true]) {
    for (const c of candidates) {
      const start = c.indexOf('{');
      const end = c.lastIndexOf('}');
      if (start < 0 || end <= start) continue;
      const slice = c.slice(start, end + 1);
      const obj = asObject(repair ? repairJsonText(slice) : slice);
      if (obj) return obj;
    }
  }
  return null;
}

/**
 * 整体解析失败时按键抽取字符串字段（典型：输出被截断，最后一个字段没收口）。
 * 只收完整收尾的值；截断的那个字段不要，交调用方兜底。
 */
export function extractStringFields(text: string, keys: readonly string[]): Record<string, string> {
  const s = String(text || '');
  const out: Record<string, string> = {};
  for (const key of keys) {
    const m = new RegExp(`"${key}"\\s*:\\s*"`).exec(s);
    if (!m) continue;
    let j = m.index + m[0].length;
    let raw = '';
    let closed = false;
    while (j < s.length) {
      const c = s[j];
      if (c === '\\') { raw += c + (s[j + 1] ?? ''); j += 2; continue; }
      if (c === '"') {
        if (isClosingQuote(s, j + 1, false, '{')) { closed = true; break; }
        raw += '\\"'; j += 1; continue;
      }
      raw += c === '\n' ? '\\n' : c === '\r' ? '\\r' : c === '\t' ? '\\t' : c;
      j += 1;
    }
    if (!closed) continue;
    let value = '';
    try { value = JSON.parse(`"${raw}"`); } catch { value = raw.replace(/\\(["\\/])/g, '$1').replace(/\\n/g, '\n'); }
    value = value.trim();
    if (value) out[key] = value;
  }
  return out;
}

/** 看起来是没解析开的 JSON / 代码围栏：这种文本绝不能当描述给用户看 */
export function looksLikeRawJson(text: string): boolean {
  const s = String(text || '').trim();
  return /^[{[]/.test(s) || s.includes('```') || /"(?:zh|en|ar)"\s*:/.test(s);
}

/** 视觉模型爱用的看图开头（「图片展示了…」「The image shows…」「تُظهر الصورة…」）：简介要以活动本身为主语 */
const AR_MARKS = '[\\u064B-\\u0652\\u0640]*';
const arWord = (w: string): string => [...w].map((ch) => ch + AR_MARKS).join('');
const IMAGE_LEADS: Record<CharityLang, RegExp[]> = {
  zh: [
    /^(?:这|该|此)?(?:一)?(?:张|幅|组)?(?:图片|照片|图像|画面|宣传图|海报|图)(?:中|里|上)?(?:主要)?(?:展示|显示|呈现|描绘|记录|反映|展现)(?:了|的是|出|着)?/,
    /^(?:在)?(?:图中|图片中|照片中|画面中|画面里|图片里|照片里)(?:可以)?(?:看到|可见|显示|展示|是)(?:了)?/,
    /^(?:从|由)(?:图片|照片|画面|图中)(?:中)?(?:可以)?(?:看到|看出|可见)(?:了)?/,
  ],
  en: [
    /^(?:the|this)\s+(?:image|photo|photograph|picture|poster|graphic|scene|flyer)\s+(?:shows|depicts|displays|features|captures|presents|illustrates|portrays|highlights)(?:\s+|$)/i,
    /^(?:in|from)\s+(?:the|this)\s+(?:image|photo|photograph|picture|poster)\s*,?\s*(?:we\s+(?:can\s+)?see|you\s+can\s+see|there\s+(?:is|are))?\s*/i,
    /^(?:an?\s+)?(?:image|photo|photograph|picture)\s+(?:of|showing)(?:\s+|$)/i,
  ],
  ar: [
    new RegExp(`^(?:${['تظهر', 'يظهر', 'تعرض', 'توضح', 'تبين', 'تصور'].map(arWord).join('|')})\\s+(?:${arWord('هذه')}\\s+)?(?:${['الصورة', 'اللقطة', 'الملصق'].map(arWord).join('|')})\\s*`),
    new RegExp(`^(?:${arWord('يظهر')}|${arWord('نرى')})\\s+(?:${arWord('في')}\\s+)(?:${arWord('هذه')}\\s+)?${arWord('الصورة')}\\s*`),
    new RegExp(`^(?:${arWord('في')}|${arWord('من خلال')})\\s+(?:${arWord('هذه')}\\s+)?${arWord('الصورة')}\\s*[،,]?\\s*(?:(?:${['نرى', 'يظهر', 'تظهر'].map(arWord).join('|')})\\s*)?`),
    new RegExp(`^(?:${arWord('هذه')}\\s+)?${arWord('الصورة')}\\s+(?:${['تظهر', 'تعرض', 'توضح'].map(arWord).join('|')})\\s*`),
  ],
};

/** 去掉看图口吻的开头；去完为空返回空串（调用方回落活动名） */
export function stripImageLead(text: string, lang: CharityLang): string {
  const src = String(text || '').trim();
  for (const re of IMAGE_LEADS[lang]) {
    const m = re.exec(src);
    if (!m || !m[0]) continue;
    const s = src.slice(m[0].length).replace(/^[\s:：,，、。.،]+/, '');
    return lang === 'en' && s ? s.charAt(0).toUpperCase() + s.slice(1) : s;
  }
  return src;
}

/** 视觉模型草案提示词：要求严格 JSON、三语、不知道的留空（宁缺毋滥） */
export function archiveDraftPrompt(): string {
  return [
    '你是公益机构的活动档案员。下面是同一场慈善/公益活动的现场照片或宣传图。',
    '请根据画面里能看到的文字、标识、场景，起草一份活动档案。只写画面能证实的内容；',
    '看不出来的字段留空字符串，人数写 null，绝不编造数字。',
    '严格只输出一个 JSON 对象，不要任何解释，格式：',
    '{"orgName":{"zh":"","en":"","ar":""},"eventName":{"zh":"","en":"","ar":""},"date":"YYYY-MM-DD 或空",',
    '"location":{"zh":"","en":"","ar":""},"participants":null,"donation":"",',
    '"organizer":{"zh":"","en":"","ar":""},"summary":{"zh":"一句话活动简介","en":"one-sentence event summary","ar":"نبذة من جملة واحدة عن الفعالية"}}',
    '要求：三种语言各自地道（阿拉伯语用现代标准阿拉伯语）；机构名若画面是阿拉伯文，zh/en 给出通行译名。',
    'summary 写的是这场活动本身：以机构或活动为主语（如「某机构在某地举办某活动，……」），不是描述这张图；',
    '禁止以「图片展示了」「画面中」「The image shows」「In this photo」「تُظهر الصورة」之类的看图口吻开头。',
    '字符串里如需引用标题，用「」、“”或 «» 等引号，不要用未转义的英文双引号。',
  ].join('\n');
}

/** 档案事实清单（喂给写报告的模型，也用于校验模型没有改数） */
export function archiveFacts(a: CharityArchive, lang: CharityLang): string[] {
  const labels: Record<CharityLang, Record<string, string>> = {
    zh: { org: '机构', event: '活动', date: '日期', loc: '地点', n: '参与人数', money: '善款', host: '主办方', sum: '简介', none: '未披露' },
    en: { org: 'Organization', event: 'Event', date: 'Date', loc: 'Location', n: 'Participants', money: 'Funds raised', host: 'Organizer', sum: 'Summary', none: 'not disclosed' },
    ar: { org: 'الجهة', event: 'الفعالية', date: 'التاريخ', loc: 'المكان', n: 'عدد المشاركين', money: 'التبرعات', host: 'الجهة المنظمة', sum: 'نبذة', none: 'غير معلن' },
  };
  const L = labels[lang];
  return [
    `${L.org}: ${a.orgName[lang]}`,
    `${L.event}: ${a.eventName[lang]}`,
    `${L.date}: ${a.date || L.none}`,
    `${L.loc}: ${a.location[lang] || L.none}`,
    `${L.n}: ${a.participants == null ? L.none : String(a.participants)}`,
    `${L.money}: ${a.donation || L.none}`,
    `${L.host}: ${a.organizer[lang] || a.orgName[lang]}`,
    `${L.sum}: ${a.summary[lang]}`,
  ];
}

/** 档案里出现的数字集合（人数 / 善款 / 日期），用来核对报告没有凭空造数 */
export function archiveNumbers(a: CharityArchive): Set<string> {
  const out = new Set<string>();
  if (a.participants != null) out.add(String(a.participants));
  for (const m of (a.donation || '').matchAll(/\d[\d,]*(?:\.\d+)?/g)) out.add(m[0].replace(/,/g, ''));
  if (a.date) { const [y, mo, d] = a.date.split('-'); out.add(y); out.add(String(Number(mo))); out.add(String(Number(d))); out.add(mo); out.add(d); }
  return out;
}
