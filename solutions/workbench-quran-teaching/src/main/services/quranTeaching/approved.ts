/**
 * L2 · 批准教学资料（演示集）。
 *
 * 说明书第六节：AI 只能基于**已批准**的材料做解释；每条资料记录来源与审核状态。
 * 数据本体在 approvedMaterials.json（内容数据，不进 UI 词典）：词汇释义（基础词义）、
 * 章节主题、教学单元 / 事件结构 / 概念。词条 `word` 是归一化骨架形（textUtils.normalizeArabic），
 * 导入后与 L1 逐词匹配；匹配不到的词条不会进入任何题目 —— 出题材料永远以 L1 实际出现的词为准。
 *
 * 不含教法裁决、不含派别解释；释义为通行的基础词义，供教师课堂讲解词汇使用。
 * 正式项目由指定内容审核人替换 / 扩充本集并冻结版本。
 */
import type { QuranApprovedMaterial, QuranTri } from '@totalclaw/ipc-contracts';
import data from './approvedMaterials.json';

type Tri3 = [string, string, string];
interface GlossarySeed { chapter: number; word: string; zh: string; en: string; ar: string }
export interface UnitSeed { id: string; chapter: number; from: number; to: number; title: Tri3; theme: Tri3; persons: Tri3[]; concepts: Tri3[] }
interface ThemeSeed { chapter: number; title: Tri3; body: Tri3 }

const t = (v: Tri3): QuranTri => ({ zh: v[0], en: v[1], ar: v[2] });

function idFor(kind: string, chapter: number, extra: string): string {
  return `m-${kind}-${chapter}-${extra}`.replace(/[^\w\-؀-ۿ]/g, '');
}

const seeds = data as unknown as { version: string; sourceGlossary: Tri3; sourceStructure: Tri3; reviewer: Tri3; glossary: GlossarySeed[]; themes: ThemeSeed[]; units: Array<Omit<UnitSeed, 'id'>> };

let cache: QuranApprovedMaterial[] | null = null;

/** 演示批准资料全集（只读） */
export function approvedMaterials(): QuranApprovedMaterial[] {
  if (cache) return cache;
  const out: QuranApprovedMaterial[] = [];
  for (const g of seeds.glossary) {
    out.push({ id: idFor('g', g.chapter, g.word), kind: 'glossary', chapter: g.chapter, word: g.word, title: { zh: g.zh, en: g.en, ar: g.ar }, source: t(seeds.sourceGlossary), reviewStatus: 'approved', reviewedBy: t(seeds.reviewer) });
  }
  for (const th of seeds.themes) {
    out.push({ id: idFor('t', th.chapter, 'theme'), kind: 'theme', chapter: th.chapter, title: t(th.title), body: t(th.body), source: t(seeds.sourceStructure), reviewStatus: 'approved', reviewedBy: t(seeds.reviewer) });
  }
  for (const u of unitSeeds()) {
    out.push({ id: u.id, kind: 'unit', chapter: u.chapter, from: u.from, to: u.to, title: t(u.title), body: t(u.theme), source: t(seeds.sourceStructure), reviewStatus: 'approved', reviewedBy: t(seeds.reviewer) });
    u.concepts.forEach((c, i) => {
      out.push({ id: `${u.id}-c${i + 1}`, kind: 'concept', chapter: u.chapter, from: u.from, to: u.to, title: t(c), source: t(seeds.sourceStructure), reviewStatus: 'approved', reviewedBy: t(seeds.reviewer) });
    });
  }
  cache = out;
  return out;
}

export function unitSeeds(): UnitSeed[] {
  return seeds.units.map((u) => ({ ...u, id: idFor('u', u.chapter, `${u.from}-${u.to}`) }));
}

export function approvedVersion(): string { return seeds.version; }

export function themeFor(chapter: number): QuranApprovedMaterial | undefined {
  return approvedMaterials().find((m) => m.kind === 'theme' && m.chapter === chapter);
}
