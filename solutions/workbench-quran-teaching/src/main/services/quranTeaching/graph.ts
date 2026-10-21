/**
 * 理解图 / 知识结构（说明书第十节 / 能力③）。
 * 节点：章 → 教学单元 → 概念 → 经文；批准资料与题目挂在概念/单元上；学生掌握率按题目记录聚合到概念与单元。
 * 不是装饰性思维导图：点任一节点即可拿到关联章/节、资料、题目与 5 名学生掌握情况（渲染层用 refs/mastery 直接取）。
 * 优素福章不把 111 节全画：只画事件（单元）层，经文节点按单元折叠成「节范围」。
 */
import type { QuranAnswerRecord, QuranGraph, QuranGraphEdge, QuranGraphNode, QuranLang, QuranPaper, QuranParseResult, QuranStudent, QuranVerse } from '@totalclaw/ipc-contracts';
import { isCorrect } from './quiz';
import { rangeLabel } from './textUtils';


export function buildGraph(parse: QuranParseResult, verses: QuranVerse[], chapterName: string, lang: QuranLang, papers: QuranPaper[], records: QuranAnswerRecord[], students: QuranStudent[]): QuranGraph {
  const nodes: QuranGraphNode[] = [];
  const edges: QuranGraphEdge[] = [];
  const chapterId = `ch-${parse.chapter}`;
  nodes.push({ id: chapterId, kind: 'chapter', label: chapterName, sub: `${parse.chapter} · ${rangeLabel(parse.from, parse.to)}`, refs: verses.map((v) => v.ref), level: 0 });

  // 掌握率：按概念 / 单元聚合各学生的正确率
  const questions = papers.flatMap((p) => p.questions);
  const qById = new Map(questions.map((q) => [q.id, q]));
  const masteryFor = (match: (q: typeof questions[number]) => boolean): Record<string, number> | undefined => {
    const out: Record<string, number> = {};
    let any = false;
    for (const s of students) {
      let c = 0; let t = 0;
      for (const r of records) {
        if (r.studentId !== s.id) continue;
        const q = qById.get(r.questionId);
        if (!q || !match(q)) continue;
        t += 1; if (isCorrect(q, r.answer)) c += 1;
      }
      if (t) { out[s.id] = Math.round((c / t) * 100) / 100; any = true; }
    }
    return any ? out : undefined;
  };

  const collapse = parse.verseCount > 40;
  for (const u of parse.units) {
    const uid = `unit-${u.id}`;
    nodes.push({ id: uid, kind: 'unit', label: u.title[lang], sub: `${rangeLabel(u.from, u.to)}${u.repeated ? ` · ×${u.repeated.count}` : ''}`, refs: u.verseRefs, level: 1, mastery: masteryFor((q) => q.materialIds.includes(u.id) || q.sourceRefs.some((r) => u.verseRefs.includes(r))) });
    edges.push({ id: `e-${chapterId}-${uid}`, source: chapterId, target: uid, kind: 'contains' });
    for (const cid of u.conceptIds) {
      const c = parse.concepts.find((x) => x.id === cid);
      if (!c) continue;
      const nid = `concept-${c.id}`;
      if (!nodes.some((n) => n.id === nid)) {
        nodes.push({ id: nid, kind: 'concept', label: c.label[lang], refs: c.verseRefs, level: 2, mastery: masteryFor((q) => q.conceptId === c.id) });
      }
      edges.push({ id: `e-${uid}-${nid}`, source: uid, target: nid, kind: 'explains' });
      if (!collapse) {
        for (const ref of c.verseRefs) {
          const vid = `verse-${ref}`;
          if (!nodes.some((n) => n.id === vid)) {
            const v = verses.find((x) => x.ref === ref);
            if (v) nodes.push({ id: vid, kind: 'verse', label: v.arabic, sub: ref, refs: [ref], level: 3 });
          }
          edges.push({ id: `e-${nid}-${vid}`, source: nid, target: vid, kind: 'covers' });
        }
      }
    }
    if (collapse) {
      const vid = `verse-${u.chapter}:${u.from}-${u.to}`;
      nodes.push({ id: vid, kind: 'verse', label: `${u.chapter}:${rangeLabel(u.from, u.to)}`, sub: `${u.verseRefs.length}`, refs: u.verseRefs, level: 3 });
      edges.push({ id: `e-${uid}-${vid}`, source: uid, target: vid, kind: 'covers' });
    } else {
      // 没挂概念的经文直接挂单元
      for (const ref of u.verseRefs) {
        const vid = `verse-${ref}`;
        if (nodes.some((n) => n.id === vid)) continue;
        const v = verses.find((x) => x.ref === ref);
        if (v) { nodes.push({ id: vid, kind: 'verse', label: v.arabic, sub: ref, refs: [ref], level: 3 }); edges.push({ id: `e-${uid}-${vid}`, source: uid, target: vid, kind: 'covers' }); }
      }
    }
  }
  // 题目节点：按概念聚合（一个概念一个题目簇），避免图上题目过多
  for (const c of parse.concepts) {
    const qs = questions.filter((q) => q.conceptId === c.id);
    if (!qs.length) continue;
    const qid = `questions-${c.id}`;
    nodes.push({ id: qid, kind: 'question', label: `${qs.length}`, sub: qs.map((q) => q.id).join(','), refs: Array.from(new Set(qs.flatMap((q) => q.sourceRefs))), level: 3 });
    edges.push({ id: `e-${qid}`, source: `concept-${c.id}`, target: qid, kind: 'tests' });
  }
  // 批准资料节点（主题）
  nodes.push({ id: `material-${parse.chapter}`, kind: 'material', label: `${parse.materialIds.length}`, refs: [], level: 1 });
  edges.push({ id: `e-material-${parse.chapter}`, source: chapterId, target: `material-${parse.chapter}`, kind: 'explains' });
  return { chapter: parse.chapter, from: parse.from, to: parse.to, nodes, edges, builtAt: Date.now() };
}
