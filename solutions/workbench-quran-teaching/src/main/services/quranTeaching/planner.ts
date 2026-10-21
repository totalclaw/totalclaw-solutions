/**
 * 教学提纲 / 课程安排 / 单课计划（说明书第九节 / 能力②）。
 *
 * 骨架由程序按「教学单元 × 每周课次 × 单课时长 × 周期」确定性排出（每课环节时间分配之和 = 单课时长），
 * LLM 只负责在骨架上润色目标与适配说明（可选，失败即回落模板）。结果标 aiGenerated，
 * 教师可 接受 / 编辑 / 重新生成（reviewStatus）。
 */
import type { QuranLang, QuranLessonPlan, QuranParseResult, QuranPlanRequest, QuranSessionPlan, QuranUnit } from '@totalclaw/ipc-contracts';
import templates from './planTemplates.json';
import { fill } from './quiz';
import { rangeLabel } from './textUtils';

type Tri3 = [string, string, string];
const T = templates as unknown as { level: Record<string, Tri3>; adaptation: Tri3; overview: Tri3; objectives: Tri3[]; segments: Record<string, Tri3>; activity: Record<string, Tri3>; reviewGoal: Tri3; testGoal: Tri3; finalReviewGoal: Tri3; finalTestGoal: Tri3; sessionTitle: Tri3; finalTitle: Tri3 };


/** 把单元分配到课次：单元数 ≤ 课数则每课一单元，多出的课给长单元再拆；单元数 > 课数则相邻单元合并 */
export function allocateUnits(units: QuranUnit[], teachSessions: number): Array<{ units: QuranUnit[]; from: number; to: number }> {
  if (!units.length || teachSessions <= 0) return [];
  if (units.length === teachSessions) return units.map((u) => ({ units: [u], from: u.from, to: u.to }));
  if (units.length < teachSessions) {
    // 按节数把最长单元拆开，直到课数够
    const pieces: Array<{ units: QuranUnit[]; from: number; to: number }> = units.map((u) => ({ units: [u], from: u.from, to: u.to }));
    while (pieces.length < teachSessions) {
      let idx = 0;
      for (let i = 1; i < pieces.length; i += 1) if (pieces[i].to - pieces[i].from > pieces[idx].to - pieces[idx].from) idx = i;
      const p = pieces[idx];
      if (p.to - p.from < 1) break;
      const mid = Math.floor((p.from + p.to) / 2);
      pieces.splice(idx, 1, { units: p.units, from: p.from, to: mid }, { units: p.units, from: mid + 1, to: p.to });
    }
    return pieces;
  }
  // 合并：按节数贪心均分，保证每个剩余课次至少还剩一个单元
  const totalVerses = units.reduce((a, u) => a + (u.to - u.from + 1), 0);
  const target = totalVerses / teachSessions;
  const out: Array<{ units: QuranUnit[]; from: number; to: number }> = [];
  let cur: QuranUnit[] = []; let acc = 0;
  for (const [i, u] of units.entries()) {
    cur.push(u); acc += u.to - u.from + 1;
    const unitsLeft = units.length - i - 1;
    const sessionsLeft = teachSessions - out.length - 1; // 本课之外还需排的课数
    const mustClose = unitsLeft <= sessionsLeft;
    if (out.length < teachSessions - 1 && (acc >= target || mustClose)) {
      out.push({ units: cur, from: cur[0].from, to: cur[cur.length - 1].to }); cur = []; acc = 0;
    }
  }
  if (cur.length) out.push({ units: cur, from: cur[0].from, to: cur[cur.length - 1].to });
  return out;
}

export function segmentPlan(minutes: number, lang: QuranLang, vars: Record<string, string | number>, final = false): QuranSessionPlan['segments'] {
  const keys = final ? ['review', 'test', 'feedback'] : ['warmup', 'recite', 'vocab', 'meaning', 'map', 'practice', 'wrap'];
  const weights = final ? [0.35, 0.45, 0.2] : [0.1, 0.22, 0.18, 0.2, 0.1, 0.13, 0.07];
  const mins = weights.map((w) => Math.max(2, Math.round(minutes * w)));
  const diff = minutes - mins.reduce((a, b) => a + b, 0);
  mins[final ? 1 : 3] += diff; // 余数进主环节，保证和 = 单课时长
  return keys.map((k, i) => ({ name: fill(T.segments[k], lang, {}), minutes: mins[i], activity: fill(T.activity[k], lang, vars) }));
}

export function buildPlanSkeleton(id: string, req: QuranPlanRequest, parse: QuranParseResult, chapterName: string): QuranLessonPlan {
  const lang = req.lang;
  const sessionsTotal = Math.max(2, req.sessionsPerWeek * req.weeks);
  const teach = sessionsTotal - 1;
  const alloc = allocateUnits(parse.units, teach);
  const range = rangeLabel(req.from, req.to);
  const sessions: QuranSessionPlan[] = alloc.map((a, i) => {
    const refs = `${req.chapter}:${rangeLabel(a.from, a.to)}`;
    const words = a.units.flatMap((u) => u.vocabulary).slice(0, 6);
    const vars = { refs, words: words.join('، ') || '—', theme: a.units.map((u) => u.theme[lang]).join(' / '), range };
    const title = a.units.length === 1 ? a.units[0].title[lang] : a.units.map((u) => u.title[lang]).join(' + ');
    return {
      index: i + 1, week: Math.floor(i / req.sessionsPerWeek) + 1, unitId: a.units[0].id,
      title: fill(T.sessionTitle, lang, { n: i + 1, title }),
      from: a.from, to: a.to,
      objectives: [
        fill(T.objectives[0], lang, { chapter: chapterName, range: rangeLabel(a.from, a.to) }),
        fill(T.objectives[1], lang, { vocab: words.length }),
        fill(T.objectives[2], lang, {}),
      ],
      segments: segmentPlan(req.sessionMinutes, lang, vars),
      vocabulary: words,
      reviewGoal: fill(T.reviewGoal, lang, { n: Math.max(3, words.length) }),
      testGoal: fill(T.testGoal, lang, {}),
      sourceRefs: parse.units.filter((u) => a.units.includes(u)).flatMap((u) => u.verseRefs).filter((r) => { const v = Number(r.split(':')[1]); return v >= a.from && v <= a.to; }),
    };
  });
  const finalIndex = sessions.length + 1;
  sessions.push({
    index: finalIndex, week: Math.floor((finalIndex - 1) / req.sessionsPerWeek) + 1, unitId: '',
    title: fill(T.finalTitle, lang, { n: finalIndex }), from: req.from, to: req.to,
    objectives: [fill(T.objectives[2], lang, {}), fill(T.objectives[3], lang, {})],
    segments: segmentPlan(req.sessionMinutes, lang, { range: `${chapterName} ${range}` }, true),
    vocabulary: parse.vocabulary.filter((w) => w.meaning).slice(0, 8).map((w) => w.word),
    reviewGoal: fill(T.finalReviewGoal, lang, {}), testGoal: fill(T.finalTestGoal, lang, {}),
    sourceRefs: parse.units.flatMap((u) => u.verseRefs),
  });
  const vars = {
    grade: req.grade, level: fill(T.level[req.level], lang, {}), chapter: chapterName, range, verses: parse.verseCount, units: parse.units.length,
    spw: req.sessionsPerWeek, mins: req.sessionMinutes, weeks: req.weeks, sessions: sessions.length, teach, perSession: Math.max(1, Math.round(parse.verseCount / Math.max(1, teach))),
  };
  return {
    id, request: req, aiGenerated: true, generator: 'template', reviewStatus: 'draft',
    adaptation: fill(T.adaptation, lang, vars),
    objectives: T.objectives.map((o) => fill(o, lang, { chapter: chapterName, range, vocab: parse.vocabulary.filter((w) => w.meaning).length })),
    difficultyLabel: fill(T.level[req.level], lang, {}),
    overview: fill(T.overview, lang, vars),
    sessions, materialIds: parse.materialIds, createdAt: Date.now(),
  };
}

/** LLM 润色提示：只允许在给定骨架与批准资料范围内改写目标/适配说明，返回 JSON。 */
export function enrichPrompt(plan: QuranLessonPlan, approvedText: string): string {
  const langName = plan.request.lang === 'ar' ? 'Arabic' : plan.request.lang === 'en' ? 'English' : 'Chinese';
  return [
    `You are refining a lesson plan for a Quran teaching demo. Respond ONLY with JSON: {"adaptation": string, "objectives": string[4], "sessions": [{"index": number, "objectives": string[3]}]}.`,
    `Language of all text: ${langName}. Do not quote or alter Quranic text. Base every statement only on the APPROVED MATERIALS below; do not add religious interpretation beyond them.`,
    `Student: ${plan.request.grade}, level ${plan.request.level}, ${plan.request.sessionsPerWeek} sessions/week, ${plan.request.sessionMinutes} min, ${plan.request.weeks} weeks. Goals: ${plan.request.goals || '-'}.`,
    `SKELETON: ${JSON.stringify({ adaptation: plan.adaptation, objectives: plan.objectives, sessions: plan.sessions.map((s) => ({ index: s.index, title: s.title, range: `${s.from}-${s.to}`, objectives: s.objectives })) })}`,
    `APPROVED MATERIALS: ${approvedText.slice(0, 6000)}`,
  ].join('\n');
}

export function applyEnrichment(plan: QuranLessonPlan, raw: string): QuranLessonPlan {
  const m = raw.match(/\{[\s\S]*\}/);
  if (!m) return plan;
  let parsed: any;
  try { parsed = JSON.parse(m[0]); } catch { return plan; }
  const out: QuranLessonPlan = { ...plan, generator: 'llm' };
  if (typeof parsed.adaptation === 'string' && parsed.adaptation.trim()) out.adaptation = parsed.adaptation.trim().slice(0, 800);
  if (Array.isArray(parsed.objectives) && parsed.objectives.length) out.objectives = parsed.objectives.filter((x: unknown) => typeof x === 'string').slice(0, 5);
  if (Array.isArray(parsed.sessions)) {
    out.sessions = plan.sessions.map((s) => {
      const p = parsed.sessions.find((x: any) => Number(x?.index) === s.index);
      return p && Array.isArray(p.objectives) && p.objectives.length ? { ...s, objectives: p.objectives.filter((x: unknown) => typeof x === 'string').slice(0, 4) } : s;
    });
  }
  return out;
}
