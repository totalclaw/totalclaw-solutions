/**
 * 校园知识库：文档分段 + 本地向量 + 关键词混合检索；FAQ 精确 / 近似命中。
 *
 * 向量用知识库同一套本地特征哈希（textAnalysis.localEmbed），不出网、不依赖向量服务；
 * 检索分 = 0.5 向量 + 0.5 关键词命中（campusScore），关键词兜住专名和编号。
 */
import type { CaFaq, CaHit } from '@totalclaw/ipc-contracts';
import {
  LOCAL_EMBEDDER_DIM, chunkText, contentTokens, cosine, keywordHitRatio, localEmbed,
} from '../knowledgeBase/textAnalysis';
import { queryTerms } from '../knowledgeBase/retrieval';
import type { DocIndex } from './store';

export function buildIndex(text: string): DocIndex {
  const chunks = chunkText(text, { size: 260, overlap: 40 }).map((c, i) => ({ i, text: c.text.trim() })).filter((c) => c.text);
  const vectors = chunks.map((c) => Buffer.from(localEmbed(c.text).buffer).toString('base64'));
  return { chunks, vectors, dim: LOCAL_EMBEDDER_DIM };
}

function decodeVector(b64: string): Float32Array {
  // 拷一份：小 Buffer 来自共享池，byteOffset 不一定是 4 的倍数，直接套 Float32Array 会抛 RangeError
  const bytes = new Uint8Array(Buffer.from(b64, 'base64'));
  return new Float32Array(bytes.buffer, 0, Math.floor(bytes.byteLength / 4));
}

/** 问法归一：去标点空白、全角转半角、小写 */
export function normQuestion(q: string): string {
  return String(q || '')
    .replace(/[！-～]/g, (c) => String.fromCharCode(c.charCodeAt(0) - 0xfee0))
    .toLowerCase()
    .replace(/[\s\p{P}\p{S}]+/gu, '')
    .replace(/(请问|你好|您好|老师|同学|想问一下|想问|问一下|吗|呢|呀|啊)/g, '');
}

function tokenSet(text: string): Set<string> {
  return new Set(contentTokens(text));
}

/** 两个问法的相似度：归一后相等 = 1；否则内容词的 Dice 系数 */
export function questionSimilarity(a: string, b: string): number {
  const na = normQuestion(a);
  const nb = normQuestion(b);
  if (!na || !nb) return 0;
  if (na === nb) return 1;
  const ta = tokenSet(a);
  const tb = tokenSet(b);
  if (!ta.size || !tb.size) return 0;
  let inter = 0;
  for (const t of ta) if (tb.has(t)) inter++;
  return (2 * inter) / (ta.size + tb.size);
}

/** FAQ 直接命中的门槛：问法几乎一样才不经模型直接给审定答案 */
export const FAQ_DIRECT = 0.82;

export function matchFaq(faqs: readonly CaFaq[], question: string): { faq: CaFaq; score: number } | null {
  let best: { faq: CaFaq; score: number } | null = null;
  for (const f of faqs) {
    for (const q of [f.question, ...f.similar]) {
      const s = questionSimilarity(question, q);
      if (!best || s > best.score) best = { faq: f, score: s };
    }
  }
  return best && best.score >= FAQ_DIRECT ? best : null;
}

export interface SearchSource {
  docs: Array<{ id: string; name: string; dept: string; index: DocIndex | null }>;
  faqs: readonly CaFaq[];
}

/**
 * 校园问答的混合分：关键词与向量各占一半。
 * 知识库默认的 0.65 向量权重在这里偏向短文本——「宿舍几点熄灯」会被只沾了「宿舍」的热水 FAQ 压过
 * 真正写着熄灯时间的段落（实测），学生的问题短、关键词就是意图，所以拉高关键词权重。
 */
export function campusScore(vectorSim: number, keywordRatio: number): number {
  return 0.5 * Math.max(0, vectorSim) + 0.5 * keywordRatio;
}

/**
 * 混合检索：文档片段 + FAQ（问法与答案合在一起当一段）。
 * 同一文档相邻片段重叠很多，同文档最多取 3 段，免得一份长文档把别的来源挤掉。
 */
export function search(src: SearchSource, query: string, topK = 6): CaHit[] {
  const terms = queryTerms(query);
  const qv = localEmbed(query);
  const hits: CaHit[] = [];
  for (const d of src.docs) {
    if (!d.index) continue;
    d.index.chunks.forEach((c, k) => {
      const kw = keywordHitRatio(terms, c.text);
      const vs = d.index!.vectors[k] ? cosine(qv, decodeVector(d.index!.vectors[k])) : 0;
      const score = campusScore(vs, kw);
      if (score > 0) hits.push({ kind: 'doc', id: d.id, title: d.name, dept: d.dept, text: c.text, score, chunk: c.i });
    });
  }
  for (const f of src.faqs) {
    const text = `${f.question}\n${f.answer}`;
    const kw = keywordHitRatio(terms, `${text}\n${f.similar.join('\n')}`);
    const vs = cosine(qv, localEmbed(`${f.question} ${f.similar.join(' ')}`));
    const score = campusScore(vs, kw);
    if (score > 0) hits.push({ kind: 'faq', id: f.id, title: f.question, dept: f.dept, text, score });
  }
  hits.sort((a, b) => b.score - a.score);
  const perDoc = new Map<string, number>();
  const out: CaHit[] = [];
  for (const h of hits) {
    const n = perDoc.get(h.id) || 0;
    if (n >= 3) continue;
    perDoc.set(h.id, n + 1);
    out.push(h);
    if (out.length >= topK) break;
  }
  return out;
}

/** 来源部门的可信度下限：低于它不按来源转（实测「校医院几点上班」最相关的是图书馆开放时间 FAQ，0.21） */
export const DEPT_GUESS_MIN = 0.25;
