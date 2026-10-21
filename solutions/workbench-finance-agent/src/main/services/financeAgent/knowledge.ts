/**
 * 财务问答智能体 · 检索：内置财税知识库（taxKnowledge.json）+ 企业自己导入的财务制度。
 *
 * 纯本地检索（词重合 + 本地向量），不依赖外部服务；检索结果作为引用交给模型回答，
 * 模型被要求只依据引用作答、引用里没有就说没有。
 */
import type { FaCitation } from '@totalclaw/ipc-contracts';
import { chunkText, contentTokens, cosine, localEmbed } from '../knowledgeBase/textAnalysis';
import KB from './taxKnowledge.json';

export interface KnowledgeEntry { id: string; title: string; text: string; tags: string[]; basis: string; until: string }
export const BUILTIN: KnowledgeEntry[] = KB.entries as KnowledgeEntry[];

export interface PolicyChunk { docId: string; fileName: string; index: number; text: string }

function overlapScore(queryTokens: string[], text: string, tags: string[] = []): number {
  if (!queryTokens.length) return 0;
  const hay = text.toLowerCase();
  let s = 0;
  for (const t of queryTokens) {
    if (tags.some((g) => g.toLowerCase() === t)) s += 3;
    else if (tags.some((g) => g.toLowerCase().includes(t) || t.includes(g.toLowerCase()))) s += 2;
    if (hay.includes(t)) s += 1;
  }
  return s / queryTokens.length;
}

export function searchBuiltin(query: string, limit = 4): Array<KnowledgeEntry & { score: number }> {
  const q = contentTokens(query);
  return BUILTIN
    .map((e) => ({ ...e, score: overlapScore(q, `${e.title} ${e.text}`, e.tags) }))
    .filter((e) => e.score >= 0.5)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

export function chunkPolicy(docId: string, fileName: string, text: string): PolicyChunk[] {
  return chunkText(text, { size: 500, overlap: 60 }).map((c) => ({ docId, fileName, index: c.index, text: c.text.trim() })).filter((c) => c.text.length >= 10);
}

export function searchPolicies(query: string, chunks: PolicyChunk[], limit = 4): Array<PolicyChunk & { score: number }> {
  if (!chunks.length) return [];
  const q = contentTokens(query);
  const qv = localEmbed(query);
  return chunks
    .map((c) => ({ ...c, score: 0.6 * overlapScore(q, c.text) + 0.4 * cosine(qv, localEmbed(c.text)) * 2 }))
    .filter((c) => c.score >= 0.35)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

export function citationsFor(query: string, chunks: PolicyChunk[]): FaCitation[] {
  return [
    ...searchPolicies(query, chunks).map((c) => ({ source: 'policy' as const, title: c.fileName, excerpt: c.text.slice(0, 600), ref: `${c.docId}#${c.index}` })),
    ...searchBuiltin(query).map((e) => ({ source: 'builtin' as const, title: e.title, excerpt: e.text, ref: e.until ? `${e.basis}（${e.until}）` : e.basis })),
  ];
}
