/**
 * 受控问答（grounded QA）—— 检索与边界判定（纯逻辑，可单测）。
 *
 * 平台能力，不绑任何行业：任何员工配上 `role.grounding` 就从「按人设自由发挥」
 * 变成「只依据已审批资料作答，并给出可核对的来源」。宗教、医疗、法务、合规
 * 这类场景都靠它。
 *
 * ## 为什么边界必须是代码而不是提示词
 *
 * 这是宗教内容。用户一定会问到超出资料范围的问题：具体教法裁决、争议议题、
 * 针对个人处境的宗教建议。入门材料里没有这些，模型却完全有能力"推断"出一个
 * 听起来很像那么回事的答案 —— 那是最危险的失败模式，比拒答难看得多。
 *
 * 提示词里写"不确定就拒答"是**建议**，模型可以不听。所以这里把边界做成硬约束：
 * 命中禁区词表直接拒答，不进模型；检索证据不足直接拒答，不进模型。
 * 只有"问题在范围内 + 确实检索到原文"两个条件同时成立，才允许生成回答。
 */

import { t as i18nT, i18nKey } from '@totalclaw/i18n';
import stopwords from './groundedQaStopwords.json';
import { matchTokens, matchLiteral } from '../../shared/matchTokens';

/** 一页原文。page 是**原始页码**（1 起），引用要给用户看的就是它。 */
export interface GroundedPage {
  docId: string;
  docTitle: string;
  page: number;
  text: string;
}

export interface GroundedHit {
  docId: string;
  docTitle: string;
  page: number;
  /** 命中的原文片段（界面悬停展示） */
  snippet: string;
  /** 给模型读的原文（比 snippet 长得多，答案那段要在里面） */
  context: string;
  score: number;
  /** 问的内容里有多少比例在这页出现。低覆盖 = 只是蹭到几个高频词，不是真相关。 */
  coverage: number;
}

export type RefusalReason =
  | 'out_of_scope'      // 问题类型超出助手职责（教法裁决 / 争议 / 个人宗教建议）
  | 'no_evidence'       // 范围内但资料里查不到
  | 'restricted';       // 权限不足

export interface GroundedDecision {
  allowed: boolean;
  reason?: RefusalReason;
  hits: GroundedHit[];
  /** 给用户看的拒答说明：**词典 key**，由调用方按提问语言翻译（tIn），不按界面语言腌死在这里 */
  message?: string;
}

/**
 * 禁区：这些问题**无论资料里有没有**都不许由助手作答。
 *
 * 判据写死在代码里而不是配置，理由同 free-alias 的上游顺序：配置会被人改错，
 * 而这条错了的后果是给出未经授权的宗教裁决。要放宽必须走代码评审。
 */
export const RELIGIOUS_FORBIDDEN_PATTERNS: readonly RegExp[] = [
  // 教法裁决：能不能 / 允不允许 / 算不算罪 —— 这是教法学者的事
  /(教法|法特瓦|fatwa|裁决|判例)/i,
  /(哈拉目|哈俩目|haram|halal|清真不清真)/i,
  /(算不算|是不是|可不可以|能不能|允许吗|违法吗|有罪吗).{0,12}(罪|禁|허|haram|违)/i,
  // 争议与派别之争
  /(逊尼|什叶|苏菲|瓦哈比|萨拉菲|派别之争|教派冲突)/i,
  // 政治与极端内容
  /(圣战|jihad|极端|恐怖|政权|选举|政治立场)/i,
  // 针对个人处境的宗教建议（婚姻 继承 财产 医疗）
  /(离婚|休妻|继承|遗产|分家产|堕胎|安乐死).{0,20}(怎么办|该不该|可以吗|如何处理)/i,
];

/**
 * 命中禁区 → 直接拒答，不进模型。
 * patterns 由角色的 grounding.forbiddenPatterns 提供；不传则用宗教场景默认表。
 */
export function isForbidden(question: string, patterns?: readonly RegExp[]): boolean {
  const q = String(question || '');
  return (patterns ?? RELIGIOUS_FORBIDDEN_PATTERNS).some((re) => re.test(q));
}

/** 把角色配置里的字符串正则编译成 RegExp；非法条目跳过而不是让整个助手崩掉。 */
export function compilePatterns(raw?: readonly string[]): RegExp[] | undefined {
  if (!raw?.length) return undefined;
  const out: RegExp[] = [];
  for (const r of raw) {
    try { out.push(new RegExp(r, 'i')); } catch { /* 配错一条不该让助手整个不可用 */ }
  }
  return out.length ? out : undefined;
}

/**
 * 解析文本清洗。pypdf 抽画册类 PDF 的两个典型毛病：
 * - 粗体描边被抽成叠字：「相相信信有有后后世世吗吗？？」—— 连续 3 对以上的「每字重复一次」才收，
 *   「谢谢」「天天」这种正常叠词不会连着出现三对；只认中文字与标点（英文 bookkeeper 也有三对叠字母）；
 * - 中文字/标点之间被插入空格和换行：「穆斯林 ？」「女性的人\n道权利」。
 */
export function cleanPageText(text: string): string {
  const CJK = '[\\u4e00-\\u9fff\\u3400-\\u4dbf\\u3000-\\u303f\\uff00-\\uffef]';
  return String(text || '')
    .replace(new RegExp(`((${CJK})\\2){3,}`, 'g'), (m) => m.replace(/(.)\1/g, '$1'))
    .replace(new RegExp(`(${CJK})[ \\t\\r\\n]+(?=${CJK})`, 'g'), '$1')
    .replace(/[ \t]{2,}/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

/**
 * 合并 pypdf 与 OCR 的逐页结果：OCR 不比 pypdf 短太多就用 OCR（它按渲染结果识别，
 * 转曲正文、叠字都没有）；OCR 明显更短说明识别漏了（比如整页小字），留 pypdf。
 */
export function mergeParsedPages(
  parsed: readonly { n: number; text: string }[],
  ocr: ReadonlyMap<number, string>,
): { n: number; text: string }[] {
  return parsed.map((p) => {
    const base = cleanPageText(p.text);
    const o = ocr.get(p.n);
    const alt = o ? cleanPageText(o) : '';
    return { n: p.n, text: alt.length >= base.length * 0.7 ? alt || base : base };
  });
}

/** 中文按字切、英文按词切；两者都要，材料本身就是中英混排。 */
export function tokenize(text: string): string[] {
  const s = String(text || '').toLowerCase();
  const han = s.match(HAN_RE) || [];
  const lat = s.match(/[a-z]{2,}/g) || [];
  // 中文再补二元组，单字噪声太大
  const bi: string[] = [];
  for (let i = 0; i + 1 < han.length; i++) bi.push(han[i] + han[i + 1]);
  return [...bi, ...lat];
}

const HAN_RE = /[一-鿿㐀-䶿]/g;
const HAN_RUN_RE = /[一-鿿㐀-䶿]+/g;

/** 功能词表放 JSON：它是匹配数据不是展示文案，也方便不改代码调词 */
const ZH_STOP = [...stopwords.zh].sort((a, b) => b.length - a.length);
const EN_STOP = new Set(stopwords.en);

/**
 * 英文极简词干：performed / rewards / proving 这类词形变化不该让同一个词对不上。
 * 两侧（资料与问题）用同一个函数，砍得粗糙也没关系，只要一致。
 */
function stem(w: string): string {
  let x = w;
  if (x.length > 5 && x.endsWith('ing')) x = x.slice(0, -3);
  else if (x.length > 5 && x.endsWith('en')) x = x.slice(0, -2);
  else if (x.length > 4 && (x.endsWith('ed') || x.endsWith('es'))) x = x.slice(0, -2);
  else if (x.length > 3 && x.endsWith('s') && !x.endsWith('ss')) x = x.slice(0, -1);
  return x.length > 4 && x.endsWith('e') ? x.slice(0, -1) : x;
}

/**
 * 问句拆成「问的内容」：剥掉疑问词/功能词后剩下的中文片段 + 英文实词。
 *
 * 【为什么要剥】旧实现整句切二元组：「什么是天课」切出「什么/么是/是天/天课」，
 * 真正有信息量的只有「天课」一个，另外三个要么是满资料都有的虚词（把排序带偏到随便哪页），
 * 要么是资料里根本不存在的拼接词（把覆盖率拉低）—— 结果「什么是天课」「如何做小净」这种
 * 资料正面讲过的问题反而被拒答。片段之间不跨界切二元组，也是为了不再造出「是天」「何做」。
 */
export function parseQuery(question: string): { segs: string[]; words: string[] } {
  // 括号里的注释不算「问的内容」：模型改写常写成「穆斯林相信后世（来世）吗」「小净（wudu，礼拜前的净礼）」，
  // 注释里的同义词资料不一定用，按概念判会把本来能答的问题否掉；同义词另走关键词补召回
  let s = String(question || '').toLowerCase().replace(/[（(][^（）()]*[)）]/g, ' ');
  for (const w of ZH_STOP) s = s.split(w).join(' ');
  const segs = s.match(HAN_RUN_RE) || [];
  const words = (s.match(/[a-z]{2,}/g) || []).filter((w) => !EN_STOP.has(w)).map(stem);
  return { segs, words };
}

function queryTokens(q: { segs: string[]; words: string[] }): string[] {
  const out: string[] = [];
  for (const seg of q.segs) for (let i = 0; i + 1 < seg.length; i++) out.push(seg.slice(i, i + 2));
  return [...new Set([...out, ...q.words])];
}

interface PageIndex { tf: Map<string, number>; len: number; toc: boolean }
const pageIndexCache = new WeakMap<GroundedPage, PageIndex>();

/**
 * 目录/课时表页：点线引导符（……、....）占比高。这类页把全书术语都列了一遍，
 * 按词匹配永远排前面，但里面没有答案 —— 实测模型拿到目录页只能回 NO_ANSWER。
 */
function looksLikeToc(text: string): boolean {
  const dots = (text.match(/[…\.·．]/g) || []).length;
  return dots / Math.max(1, text.length) > 0.12;
}

function indexPage(p: GroundedPage): PageIndex {
  let idx = pageIndexCache.get(p);
  if (idx) return idx;
  const tf = new Map<string, number>();
  const toks = tokenize(p.text).map((t) => (/^[a-z]/.test(t) ? stem(t) : t));
  for (const t of toks) tf.set(t, (tf.get(t) || 0) + 1);
  idx = { tf, len: toks.length, toc: looksLikeToc(p.text) };
  pageIndexCache.set(p, idx);
  return idx;
}

interface Ranked { page: GroundedPage; idx: PageIndex; score: number }

/**
 * 排序用 BM25：稀有词（天课、小净）权重高、满资料都有的词（穆斯林、安拉）权重低，
 * 词频饱和 + 按页长软归一。旧的「重合词数 / sqrt(页长)」对长页惩罚过重，
 * 讲天课的正文页恰好是长页，排不过只提了一句的短页。
 */
function rank(pages: readonly GroundedPage[], tokens: string[]): Ranked[] {
  if (!tokens.length || !pages.length) return [];
  const idxs = pages.map(indexPage);
  const n = pages.length;
  const avg = idxs.reduce((a, x) => a + x.len, 0) / n || 1;
  const idf = new Map<string, number>();
  for (const t of tokens) {
    const df = idxs.reduce((a, x) => a + (x.tf.has(t) ? 1 : 0), 0);
    if (df) idf.set(t, Math.log(1 + (n - df + 0.5) / (df + 0.5)));
  }
  const k1 = 1.2, b = 0.75;
  return idxs.map((idx, i) => {
    let score = 0;
    for (const [t, w] of idf) {
      const f = idx.tf.get(t);
      if (f) score += w * (f * (k1 + 1)) / (f + k1 * (1 - b + b * idx.len / avg));
    }
    return { page: pages[i], idx, score: idx.toc ? score * 0.3 : score };
  }).filter((r) => r.score > 0).sort((a, b) => b.score - a.score);
}

/**
 * 证据判定：问的每个概念都得在检索到的原文里出现。
 *
 * - coverage：问题内容字（剥掉功能词后的汉字）+ 英文实词里，被原文覆盖的比例；
 * - gap：最长一段连续没被覆盖的汉字（英文按实词算）。「伊斯兰的量子力学解释」里「量子力学」整段查无此词 → 4，
 *   说明问的是资料里没有的东西，哪怕「伊斯兰」到处都是也不能答。单个字没覆盖（「如何做小净」的「做」）
 *   通常是动词或虚词，不算。
 * 覆盖看的是**所有给模型的页的并集**：一个问题的两个概念分在两页上是正常的。
 */
export function assessEvidence(question: string, pages: readonly GroundedPage[]): { coverage: number; gap: number } {
  const q = parseQuery(question);
  const toks = new Set<string>();
  let raw = '';
  for (const p of pages) {
    for (const t of indexPage(p).tf.keys()) toks.add(t);
    raw += p.text;
  }
  let units = 0, covered = 0, gap = 0;
  for (const seg of q.segs) {
    let run = 0;
    for (let i = 0; i < seg.length; i++) {
      const ok = seg.length === 1
        ? raw.includes(seg)
        : toks.has(seg.slice(i, i + 2)) || (i > 0 && toks.has(seg.slice(i - 1, i + 1)));
      units++;
      if (ok) { covered++; run = 0; } else { run++; gap = Math.max(gap, run); }
    }
  }
  // 英文实词没被覆盖：纯英文问题里 ≥4 个字母的算一个资料之外的概念（python / cryptocurrency / engine），
  // 与中文「连续两字查无此词」同等对待；fix / car 这类短词多是泛词，只计入覆盖率。
  // 中文问题里夹的英文（改写常给「什么是天课（Zakat）？」）只计入覆盖率：中文资料本来就不写英文译名，
  // 实测按概念否决会把英文界面的建议问题「What is zakat?」整个判成无依据
  const pureLatin = q.segs.length === 0;
  for (const w of q.words) {
    units++;
    if (toks.has(w)) covered++;
    else if (pureLatin && w.length >= 4) gap = Math.max(gap, MAX_UNKNOWN_RUN);
  }
  return { coverage: units ? covered / units : 0, gap };
}

/**
 * 检索：BM25 排序取前 topK 页。**刻意不用向量** —— 资料只有一两百页，
 * 关键词足够；引入嵌入模型意味着多一次网络调用和一个可能挂掉的依赖，
 * 演示场景下稳定性比召回率更重要。
 */
export function search(pages: readonly GroundedPage[], question: string, topK = TOP_K): GroundedHit[] {
  return rank(pages, queryTokens(parseQuery(question))).slice(0, topK).map((r) => toHit(r, question));
}

/** 给模型的页数。回答末行会报出实际用了哪几页，没用上的不会列进来源。 */
export const TOP_K = 6;
/** 多路检索合并后最多给模型的页数：问题问得宽时（「新穆斯林要学什么」）答案散在好几页 */
export const MAX_CONTEXT_PAGES = 8;
/** 给模型的原文长度（每页）：只给 220 字片段时，模型常常看不到答案那一段，只能回 NO_ANSWER */
const CONTEXT_CHARS = 1800;

function toHit(r: Ranked, question: string): GroundedHit {
  return {
    docId: r.page.docId, docTitle: r.page.docTitle, page: r.page.page,
    snippet: pickSnippet(r.page.text, question),
    context: pickSnippet(r.page.text, question, CONTEXT_CHARS),
    score: Number(r.score.toFixed(3)),
    coverage: Number(assessEvidence(question, [r.page]).coverage.toFixed(3)),
  };
}

/**
 * 多路检索结果融合（RRF：每路按名次给 1/(60+名次) 分再相加）。
 *
 * 【为什么不按 BM25 原始分合并】不同查询的分数不可比：8 个关键词拼成的查询天然比
 * 「如何做小净」分高，按原始分合并等于只剩关键词那一路。实测结果是大纲页、课时表页
 * （把「小净」「洗小净」「大净」都列了一遍）霸榜，真正写步骤的那页挤不进给模型的页里。
 * 按名次融合后，几路都排得靠前的页胜出。
 */
export function fuseHits(lists: readonly (readonly GroundedHit[])[], limit = MAX_CONTEXT_PAGES): GroundedHit[] {
  const acc = new Map<string, { hit: GroundedHit; rrf: number }>();
  for (const list of lists) {
    list.forEach((h, rank) => {
      const key = `${h.docId}#${h.page}`;
      const cur = acc.get(key);
      const rrf = 1 / (60 + rank);
      if (cur) { cur.rrf += rrf; if (h.score > cur.hit.score) cur.hit = h; }
      else acc.set(key, { hit: h, rrf });
    });
  }
  return [...acc.values()].sort((a, b) => b.rrf - a.rrf).slice(0, limit).map((x) => x.hit);
}

/**
 * 相邻页补全：排在前面的页，把它的下一页也带上（同一份资料、下一页仍覆盖问的内容时）。
 *
 * 【为什么】书里一节常常是「本课要求/目录式小结」在前、正文在后一页。实测「如何做小净」
 * 排第一的是第 13 页（本课要求：统计整个小净的步骤……），真正写步骤的第 14 页被大纲页挤出去，
 * 模型读完只能回 NO_ANSWER。把下一页一起给，正文就跟着进来了。
 */
export function withNextPages(
  hits: readonly GroundedHit[],
  pages: readonly GroundedPage[],
  question: string,
  opts: { head?: number; limit?: number } = {},
): GroundedHit[] {
  const { head = 3, limit = MAX_CONTEXT_PAGES + 2 } = opts;
  const out = [...hits];
  const has = new Set(out.map((h) => `${h.docId}#${h.page}`));
  for (const h of hits.slice(0, head)) {
    if (out.length >= limit) break;
    const next = pages.find((p) => p.docId === h.docId && p.page === h.page + 1);
    if (!next || has.has(`${next.docId}#${next.page}`)) continue;
    if (assessEvidence(question, [next]).coverage === 0) continue;
    has.add(`${next.docId}#${next.page}`);
    out.splice(out.indexOf(h) + 1, 0, { ...toHit({ page: next, idx: indexPage(next), score: 0 }, question), score: h.score });
  }
  return out.slice(0, limit);
}

/** 从整页里截出最相关的一段，回答里原样引用。 */
export function pickSnippet(text: string, question: string, width = 220): string {
  const qt = queryTokens(parseQuery(question));
  const body = String(text || '').replace(/\s+/g, ' ').trim();
  if (!body || body.length <= width) return body;
  let best = 0, bestScore = -1;
  for (let i = 0; i < body.length; i += 60) {
    const win = body.slice(i, i + width).toLowerCase();
    const sc = qt.reduce((n, t) => n + (win.includes(t) ? 1 : 0), 0);
    if (sc > bestScore) { bestScore = sc; best = i; }
  }
  // 窗口往前让出一点，别从答案那句的半截开始
  const start = Math.max(0, Math.min(best - Math.floor(width / 6), body.length - width));
  return body.slice(start, start + width).trim();
}

/**
 * 证据下限，三个都要过：
 * - 分数下限只挡「完全没匹配上」，真正的判据是下面两条（BM25 分数随资料规模变，不适合当主判据）；
 * - 覆盖率：问的内容里至少这么多被原文覆盖；
 * - 最长未覆盖段：连续这么多个汉字资料里都没有 → 问的是资料之外的概念。
 */
export const MIN_EVIDENCE_SCORE = 0.3;
export const MIN_EVIDENCE_COVERAGE = 0.6;
export const MAX_UNKNOWN_RUN = 2;

/** 「资料中无依据」的拒答话术（词典 key）。检索不过、模型判 NO_ANSWER 两处共用。 */
export const NO_EVIDENCE_MESSAGE = i18nKey('已审批资料中没有足够依据回答这个问题。本助手不会在没有原文支撑的情况下作答，已将该问题标记为待确认并提交内容负责人。');

/**
 * 决定这个问题能不能答。顺序即优先级：权限 > 禁区 > 证据。
 */
export function decide(
  pages: readonly GroundedPage[],
  question: string,
  opts: {
    canRead: boolean;
    /** 角色自带的禁区表（已编译）。不传用宗教场景默认表。 */
    forbidden?: readonly RegExp[];
    /** 角色自定义的拒答话术，覆盖默认文案。 */
    refusalMessage?: string;
    /** 角色自定义的证据下限。 */
    minScore?: number;
  } = { canRead: true },
): GroundedDecision {
  if (!opts.canRead) {
    return { allowed: false, reason: 'restricted', hits: [],
      message: i18nKey('你的账号没有这份资料的访问权限。请联系管理员开通后再提问。') };
  }
  if (isForbidden(question, opts.forbidden)) {
    return { allowed: false, reason: 'out_of_scope', hits: [],
      message: opts.refusalMessage || i18nKey('这个问题超出本助手的职责范围。本助手只依据已审批资料作答，请联系本机构的内容负责人。') };
  }
  const ranked = rank(pages, queryTokens(parseQuery(question))).slice(0, TOP_K);
  const hits = ranked.map((r) => toHit(r, question));
  const ev = assessEvidence(question, ranked.map((r) => r.page));
  const top = hits[0];
  if (!top || top.score < (opts.minScore ?? MIN_EVIDENCE_SCORE)
    || ev.coverage < MIN_EVIDENCE_COVERAGE || ev.gap >= MAX_UNKNOWN_RUN) {
    return { allowed: false, reason: 'no_evidence', hits,
      message: NO_EVIDENCE_MESSAGE };
  }
  return { allowed: true, hits };
}

export type AnswerLang = 'zh' | 'en' | 'ar';

/** 多轮对话里的一轮。answer 为空表示那一轮被拒答。 */
export interface GroundedTurn {
  question: string;
  answer?: string;
}

/**
 * 识别提问语言，回答跟着它走（不跟界面语言）。
 *
 * 按字符计数而不是看有没有：中文问题里夹一个 dawah、英文问题里夹一个阿语术语都很常见，
 * 「出现过就算」会把整句判错。汉字一个字顶一个词，按 ×2 计，才能和按字母计的拉丁文比。
 * 平手时 阿语 > 中文 > 英文：夹杂的一方通常是术语，主语言更可能是非拉丁那个。
 * 一个可识别字符都没有（纯数字/标点）→ null，由调用方沿用上一轮的语言。
 */
export function detectLang(text: string): AnswerLang | null {
  const s = String(text || '');
  const ar = (s.match(/[\u0600-\u06ff\u0750-\u077f\u08a0-\u08ff\ufb50-\ufdff\ufe70-\ufeff]/g) || []).length;
  const zh = (s.match(/[\u4e00-\u9fff\u3400-\u4dbf]/g) || []).length * 2;
  const en = (s.match(/[a-z]/gi) || []).length;
  const top = Math.max(ar, zh, en);
  if (!top) return null;
  return ar === top ? 'ar' : zh === top ? 'zh' : 'en';
}

/** 模型判定资料答不了时的整行输出；主进程据此转成「资料中无依据」拒答，不把模型的解释展示出去 */
export const NO_ANSWER = 'NO_ANSWER';
/** 模型在末行报出实际用到的资料编号：`SOURCES: 1,3` */
export const SOURCES_TAG = 'SOURCES:';

/**
 * 解析模型回答：拆出正文与实际用到的资料（下标从 0 起）。
 *
 * - 输出 NO_ANSWER → noAnswer，调用方按「资料中无依据」拒答；
 * - 没报 SOURCES / 报的编号全都越界 → used 为全部命中，宁可多列来源也不能一条都不给；
 * - 模型不听话仍写了 Markdown 加粗/标题，这里剥掉符号（纯文本展示时 ** 会原样露出来）。
 */
export function parseAnswer(raw: string, hitCount: number): { noAnswer: boolean; text: string; used: number[] } {
  const all = Array.from({ length: hitCount }, (_, i) => i);
  let body = String(raw || '').trim();
  let used = all;
  const m = body.match(/^\s*SOURCES\s*[:：]\s*([\d,，、\s]*)\s*$/im);
  if (m) {
    const picked = [...new Set((m[1].match(/\d+/g) || []).map((n) => Number(n) - 1))]
      .filter((i) => i >= 0 && i < hitCount)
      .sort((a, b) => a - b);
    if (picked.length) used = picked;
    body = body.replace(m[0], '');
  }
  body = body
    .replace(/\*\*(.+?)\*\*/g, '$1')
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
  if (!body || new RegExp(`^${NO_ANSWER}[.。]?$`, 'i').test(body)) return { noAnswer: true, text: '', used: [] };
  return { noAnswer: false, text: body, used };
}

/** 历史只留最近几轮、回答截断：够模型理解「它」「那」指什么就行，不能把旧原文再塞回去当依据。 */
export const MAX_HISTORY_TURNS = 4;
const MAX_HISTORY_ANSWER_CHARS = 400;

function formatHistory(history: readonly GroundedTurn[]): string {
  return history.slice(-MAX_HISTORY_TURNS).map((h) => {
    const a = (h.answer || '').replace(/\s+/g, ' ').trim();
    return [
      i18nT('用户：{q}', { q: h.question }),
      a ? i18nT('助手：{a}', { a: a.length > MAX_HISTORY_ANSWER_CHARS ? `${a.slice(0, MAX_HISTORY_ANSWER_CHARS)}…` : a })
        : i18nT('助手：（已拒答）'),
    ].join('\n');
  }).join('\n\n');
}

/**
 * 检索改写：把追问补全成独立问题，并同时给出中文版和英文版。
 *
 * 【为什么需要】检索是按词重合打分的，有两类问题它天然接不住：
 *   ① 追问 ——「那具体怎么做？」里没有一个实词，必须结合上一轮才知道在问小净还是礼拜；
 *   ② 跨语言 —— 资料是中文 + 英文，阿语提问与任何一页都没有词重合，英文问中文资料也一样。
 * 改写只产出**检索用的问题**，不产出答案；边界照旧由代码判：改写结果同样要过禁区表和证据下限。
 */
export function buildRewritePrompt(question: string, history: readonly GroundedTurn[]): string {
  return [
    i18nT('你是检索改写器，只负责改写问题，不回答问题。'),
    i18nT('结合对话历史，把「最新问题」补全成一个不依赖上下文就能看懂的独立问题；指代词（它、那、这个）要换成具体所指。'),
    i18nT('不要添加最新问题里没有问到的主题，不要回答。'),
    i18nT('再给出 3 到 8 个检索关键词：资料里可能用到的同义词、相关术语与宗教专名的常见译法，中英文都要。'),
    i18nT('关键词只围绕最新问题，不要带上历史里其他问题的主题。'),
    // JSON 示例不进词典：花括号会被界面侧的消息编译器当成插值语法
    i18nT('只输出一行 JSON，zh 为中文版独立问题，en 为英文版独立问题，keywords 为关键词数组，格式如下：'),
    '{"zh":"...","en":"...","keywords":["...","..."]}',
    '',
    i18nT('=== 对话历史 ==='),
    history.length ? formatHistory(history) : i18nT('（无）'),
    '',
    i18nT('=== 最新问题 ==='),
    question,
  ].join('\n');
}

/** 解析改写结果。模型常在 JSON 外包 ```、前后加说明，取第一个 {…} 解析；解析不出返回空。 */
export function parseRewrite(raw: string): { queries: string[]; keywords: string[] } {
  const empty = { queries: [], keywords: [] };
  const m = String(raw || '').match(/\{[\s\S]*\}/);
  if (!m) return empty;
  try {
    const o = JSON.parse(m[0]);
    const str = (v: unknown) => (typeof v === 'string' ? v.trim() : '');
    const queries = [o?.zh, o?.en].map(str).filter((v) => v.length > 0 && v.length <= 300);
    const keywords = (Array.isArray(o?.keywords) ? o.keywords : [])
      .map(str).filter((v: string) => v.length > 0 && v.length <= 40).slice(0, 8);
    return { queries, keywords };
  } catch {
    return empty;
  }
}

/**
 * 从**当前资料**里挑几个一定答得上的示例问题。
 *
 * 【为什么不写死】示例问题写死在界面上，换一批资料就全变成拒答 —— 用户点的第一下就翻车。
 * 这里改成从资料本身长出来：先按「多页出现、又不是满篇都有」挑出术语（典型的主题词），
 * 再套成问句，最后**用真实检索判定过一遍**，只留能答的。答不上的一律不展示。
 *
 * 判定用的是与正式提问同一条 decide()，所以「示例问题一定能答」不是靠人工维护，是算出来的。
 */
export function suggestQuestions(pages: readonly GroundedPage[], limit = 4): string[] {
  if (!pages.length) return [];
  // 只从最多这么多页里挑主题：几百页的书全量算词频又慢又没必要。
  // 均匀抽样而不是取前 N 页，避免只挑到目录和前言。
  const SAMPLE_PAGES = 200;
  const step = Math.max(1, Math.floor(pages.length / SAMPLE_PAGES));
  const sample = pages.filter((_, i) => i % step === 0).slice(0, SAMPLE_PAGES);
  const total = sample.length;
  // 页数很少时（几页的小资料）不能要求「至少出现在两页」——那样一个候选都剩不下
  const minDf = total <= 5 ? 1 : Math.max(2, Math.floor(total * 0.03));
  const maxDf = total <= 5 ? total : total * 0.5;

  const zhTerms = mineChineseTerms(sample, minDf, maxDf);
  const enTerms = mineLatinTerms(sample, minDf, maxDf);
  // 资料是哪种文字，就用哪种文字提问 —— 中文资料配英文问句，检索直接落空
  const ordered = zhTerms.length >= enTerms.length
    ? [...zhTerms, ...enTerms]
    : [...enTerms, ...zhTerms];

  const out: string[] = [];
  const used: string[] = [];
  for (const term of ordered) {
    if (out.length >= limit) break;
    // 同一主题只出一题：「天课」和「天课制度」不必都问
    if (used.some((u) => u.includes(term) || term.includes(u))) continue;
    const q = /[\u4e00-\u9fff]/.test(term) ? i18nT('什么是{term}？', { term }) : `What is ${term}?`;
    if (!decide(pages, q, { canRead: true }).allowed) continue;
    used.push(term);
    out.push(q);
  }
  return out;
}

/**
 * 挑一个**肯定答不上**的问题，用来演示边界。
 *
 * 不能随手写死一句：万一资料里正好有，点下去就答出来了，边界演示当场翻车。
 * 所以给一组与任何机构资料都八竿子打不着的候选，逐个过真实检索判定，
 * 取第一个被判「资料中无依据」的；全都意外命中就返回 null（宁可不展示）。
 */
export function pickOutOfScopeQuestion(pages: readonly GroundedPage[], lang: AnswerLang = 'zh'): string | null {
  const zh = matchTokens(['今天的股市行情怎么样？', '明天本地天气如何？', '最近的机票价格是多少？']);
  const en = ['What is today\'s stock market price?', 'What is tomorrow\'s local weather?', 'What is the current airfare?'];
  const ar = ['ما هو سعر سوق الأسهم اليوم؟', 'كيف سيكون طقس اليوم؟', 'كم سعر تذاكر الطيران حاليًا؟'];
  const byLang = lang === 'en' ? [...en, ...zh] : lang === 'ar' ? [...ar, ...en] : [...zh, ...en];
  for (const q of byLang) {
    const d = decide(pages, q, { canRead: true });
    if (!d.allowed && d.reason === 'no_evidence') return q;
  }
  return null;
}

/**
 * 用资料里的**英文术语**出题。英文/阿语界面下要用它：
 * 界面是英文却弹出一串中文示例问题，客户会以为产品没做本地化。
 */
export function suggestLatinQuestions(pages: readonly GroundedPage[], limit = 4): string[] {
  if (!pages.length) return [];
  const SAMPLE_PAGES = 200;
  const step = Math.max(1, Math.floor(pages.length / SAMPLE_PAGES));
  const sample = pages.filter((_, i) => i % step === 0).slice(0, SAMPLE_PAGES);
  const total = sample.length;
  const minDf = total <= 5 ? 1 : Math.max(2, Math.floor(total * 0.03));
  const maxDf = total <= 5 ? total : total * 0.5;
  const out: string[] = [];
  const used: string[] = [];
  for (const term of mineLatinTerms(sample, minDf, maxDf)) {
    if (out.length >= limit) break;
    if (used.some((u) => u.includes(term) || term.includes(u))) continue;
    const q = `What is ${term}?`;
    if (!decide(pages, q, { canRead: true }).allowed) continue;
    used.push(term);
    out.push(q);
  }
  return out;
}

/** 中文术语：2~10 字的重复串，去掉碎片与虚词头尾，按「常见 × 长度」排序。 */
function mineChineseTerms(sample: readonly GroundedPage[], minDf: number, maxDf: number): string[] {
  const MIN_LEN = 2, MAX_LEN = 12;
  // 按长度分桶存词频：判断「是不是碎片」时只需要看长一位的那一桶，
  // 不分桶就要拿每个词和全表比，97 页的资料实测要 7 秒。
  const byLen: Map<string, number>[] = Array.from({ length: MAX_LEN + 2 }, () => new Map());
  for (const p of sample) {
    const seen = new Set<string>();
    for (const run of p.text.match(/[\u4e00-\u9fff]{2,24}/g) || []) {
      for (let len = MIN_LEN; len <= MAX_LEN; len++) {
        for (let i = 0; i + len <= run.length; i++) {
          const term = run.slice(i, i + len);
          if (seen.has(term)) continue;
          seen.add(term);
          const m = byLen[len];
          m.set(term, (m.get(term) ?? 0) + 1);
        }
      }
    }
  }

  /** 往左右各扩一个字后出现次数几乎不掉 → 它只是更长那个词的一截（「斯敏」总跟着「威斯敏斯德」）。 */
  const isFragment = (term: string, df: number): boolean => {
    const longer = byLen[term.length + 1];
    if (!longer) return false;
    for (const [other, odf] of longer) {
      if (odf >= df * 0.8 && other.includes(term)) return true;
    }
    return false;
  };

  const out: [string, number][] = [];
  for (let len = MIN_LEN; len <= MAX_LEN; len++) {
    for (const [term, df] of byLen[len]) {
      if (df < minDf || df > maxDf) continue;
      if (STOP_TERMS.has(term)) continue;
      if (EDGE_CHARS.has(term[0]) || EDGE_CHARS.has(term[term.length - 1])) continue;
      if (isFragment(term, df)) continue;
      out.push([term, df]);
    }
  }
  // 长词优先：同样常见时「先知穆罕默德」比「先知」更像一个能问的主题
  return out.sort((a, b) => (b[1] * b[0].length) - (a[1] * a[0].length)).map(([t]) => t);
}

/** 英文术语：优先专有名词（连续大写开头的词组），退而求其次用高频实词。 */
function mineLatinTerms(sample: readonly GroundedPage[], minDf: number, maxDf: number): string[] {
  const df = new Map<string, number>();
  for (const p of sample) {
    const seen = new Set<string>();
    for (const m of p.text.match(/\b[A-Z][a-z]{2,}(?:\s+[A-Z][a-z]{2,}){0,3}\b/g) || []) {
      const term = m.trim();
      if (seen.has(term) || LATIN_STOP.has(term.toLowerCase())) continue;
      seen.add(term);
      df.set(term, (df.get(term) ?? 0) + 1);
    }
  }
  return [...df.entries()]
    .filter(([, n]) => n >= minDf && n <= maxDf)
    .sort((a, b) => (b[1] * b[0].length) - (a[1] * a[0].length))
    .map(([t]) => t);
}

/** 英文里挑不出信息量的开头词（句首大写造成的假专有名词）。 */
const LATIN_STOP = new Set([
  'the', 'this', 'that', 'these', 'those', 'there', 'then', 'when', 'what', 'which', 'and', 'but', 'for',
  'you', 'your', 'our', 'their', 'his', 'her', 'its', 'not', 'all', 'any', 'one', 'two', 'first', 'second',
  'chapter', 'page', 'section', 'note', 'notes', 'topic', 'answer', 'question', 'discussion',
]);

/** 词首/词尾出现这些字，基本可以断定是从长句里截出来的碎片，不是术语。 */
const EDGE_CHARS = new Set(matchLiteral('的了是在和与及或对都还该地得着过就也很把被让使从向到于其之而且则所以因为如果这那有无不没要会能可與於這為過來後們個').split(''));

/** 造示例问题时要跳过的词：问出来没有信息量，或本来就是虚词。 */
const STOP_TERMS = new Set(matchTokens([
  '我们', '你们', '他们', '可以', '不能', '什么', '这个', '那个', '因为', '所以', '但是', '如果',
  '就是', '没有', '一个', '一些', '进行', '通过', '以及', '其中', '这些', '那些', '自己', '出现',
  '内容', '相关', '有关', '方面', '情况', '时候', '问题', '需要', '应该', '必须', '不是', '而且',
  '一切', '这样', '那样', '什么样', '怎么样', '这里', '那里', '现在', '以后', '之后', '之前', '同时',
  '回答', '经文', '问答', '答案', '例子', '部分', '下面', '上面', '如下', '以下', '其他', '各种',
  // 繁体：资料里混排繁体时会挑出「他們」「這樣」这类
  '他們', '我們', '你們', '這樣', '那樣', '這裡', '那裡', '經文', '問答', '內容', '時候', '問題', '應該', '個人',
]));

/**
 * 拼给模型的提示词。**只给检索到的原文**，不给它自由发挥的余地。
 *
 * 输出只要「答案 + 来源」（用户原话）：不要开场白、不要「资料里没提到 X」这类说明。
 * 来源不让模型写进正文（「资料 3，第 22 页」对读者没意义），而是让它在末行报出用到的
 * 资料编号，由 parseAnswer 换成真实的文件名和页码交给界面展示。
 *
 * 多轮时带上对话历史，但明确它只用来理解指代：每一轮能引用的**只有本轮检索到的原文**。
 * 这也是为什么不走引擎原生会话 —— 原生会话会把前几轮的原文和回答都留在上下文里，
 * 模型就能拿旧内容作答，本轮的证据下限形同虚设。
 */
export function buildPrompt(
  question: string,
  hits: readonly GroundedHit[],
  lang: AnswerLang,
  history: readonly GroundedTurn[] = [],
  standaloneQuestion?: string,
): string {
  // 提示词是发给模型的指令，**按回答语言走**，不跟界面语言 —— 英文演示时
  // 界面是英文，但如果客户用阿语提问，指令也得让模型说阿语。
  const langLine = lang === 'ar'
    ? i18nT('请用阿拉伯语回答。')
    : lang === 'en' ? i18nT('请用英语回答。') : i18nT('请用中文回答。');
  const refs = hits.map((h, i) =>
    i18nT('【资料 {n}】《{title}》第 {page} 页', { n: String(i + 1), title: h.docTitle, page: String(h.page) })
    + '\n' + (h.context || h.snippet)).join('\n\n');
  const historyBlock = history.length
    ? [
      i18nT('=== 对话历史（仅用于理解指代，不能作为回答依据） ==='), formatHistory(history), '',
      // 实测：不加这句，模型会把上一轮的问题连同本轮一起再答一遍
      i18nT('只回答「用户问题」这一个问题；历史里问过、答过的内容不要重复。'), '',
    ]
    : [];
  const standalone = standaloneQuestion && standaloneQuestion !== question
    ? ['', i18nT('（结合上下文，这个问题的完整意思是：{q}）', { q: standaloneQuestion })]
    : [];
  return [
    i18nT('你是一名机构宣教知识助手。你只能依据下面给出的资料原文回答，不得补充资料之外的任何内容，不得给出教法裁决，不得推测。'),
    i18nT('直接给出答案：不要开场白，不要复述问题，不要写「根据资料」之类的话。'),
    i18nT('把资料里与问题相关的要点答全，分散在几份资料里的也要合在一起答，不要只挑一两条。'),
    i18nT('只写资料能回答的内容；不要说明资料缺少什么、没有提到什么，正文里也不要标注资料编号或页码（来源由界面单独展示）。'),
    i18nT('用纯文本输出，不要使用 Markdown 符号（如 **、#）；需要分点时用「1. 2. 3.」。'),
    i18nT('资料只能回答问题的一部分时，就回答这一部分，不要因为不完整而放弃作答。'),
    `${i18nT('只有资料与问题完全无关时，才只输出：')}${NO_ANSWER}`,
    `${i18nT('最后单独一行写出实际用到的资料编号，格式：')}${SOURCES_TAG} 1,3`,
    langLine,
    '',
    ...historyBlock,
    i18nT('=== 可用资料（全部内容） ==='),
    refs,
    '',
    i18nT('=== 用户问题 ==='),
    question,
    ...standalone,
  ].join('\n');
}
