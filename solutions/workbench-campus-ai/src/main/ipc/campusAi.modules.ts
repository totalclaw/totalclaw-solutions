/**
 * 高校一体化 AI 智能体 · 五大方向扩展模块的动作（AI 应用中心 / 教学 / 科研 / 校务治理）。
 * 由 campusAi.ipc.ts 合并进同一条动作通道。
 */
import { existsSync, writeFileSync } from 'node:fs';
import { basename, join } from 'node:path';
import {
  CA_QUESTION_TYPES,
  type CaCourse, type CaGrading, type CaGuide, type CaKeyItem, type CaOfficialDoc, type CaQuestion, type CaQuestionType, type CaScenarioInput, type CaState,
} from '@totalclaw/ipc-contracts';
import { t as i18nT } from '@totalclaw/i18n';
import { extractDocument } from '../services/documentExtractor';
import { readTable, safeFileName, writeWorkbook } from '../services/serviceSettlement/excel';
import type { CampusAiService } from '../services/campusAi/service';
import { newId, schoolLabel, type CampusAiStore } from '../services/campusAi/store';
import { listDomains } from '../services/campusAi/domains';
import { directionLabel, listScenarios, normalizeScenarioInput } from '../services/campusAi/scenarios';
import {
  answerLabel, buildQuizPrompt, buildShortPrompt, clampScore, newRow, parseAnswers, parseKey, parseQuiz, rowTotal, typeLabel,
} from '../services/campusAi/teaching';
import { buildGuidePrompt, GUIDE_SECTIONS, parseOutputs, researchStats, splitGuide, verifyGuide } from '../services/campusAi/research';
import { buildHotspotPrompt, cleanDocBody, docKindLabel, docUnverifiedNumbers, hotspotFacts, hotspotReport, hotspotTemplate } from '../services/campusAi/governance';
import { buildDocPrompt, buildOfficialDocx } from '../services/campusAi/govDocx';
import { numbersOutsideFacts } from '../services/campusAi/notice';
import { writeDemoCourse, writeDemoGuide, writeDemoOutputs } from '../services/campusAi/demoData';

export interface ModuleCtx {
  store: CampusAiStore;
  svc: CampusAiService;
  llm: (module: string, prompt: string, timeoutMs?: number) => Promise<{ text: string; model: string }>;
  llmJson: (module: string, prompt: string, timeoutMs?: number) => Promise<{ json: any; model: string }>;
  outputDir: (sub?: string) => string;
  pushState: () => void;
  progress: (message: string, extra?: Record<string, unknown>) => void;
}

const stamp = (): string => {
  const d = new Date();
  const p2 = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}${p2(d.getMonth() + 1)}${p2(d.getDate())}-${p2(d.getHours())}${p2(d.getMinutes())}`;
};

/** 状态里给渲染层的扩展部分 */
export function moduleState(ctx: ModuleCtx): Pick<CaState, 'scenarios' | 'domains' | 'courses' | 'gradings' | 'research' | 'officialDocs'> {
  const s = ctx.store.read();
  const outputs = ctx.store.outputs();
  return {
    scenarios: listScenarios(s.scenarios, ctx.store.auditList(5000)),
    domains: listDomains(),
    courses: s.courses,
    gradings: ctx.store.gradings().map((g) => ({
      id: g.id, title: g.title, courseId: g.courseId, createdAt: g.createdAt, gradedAt: g.gradedAt, exportedAt: g.exportedAt, exportPath: g.exportPath,
      students: g.rows.length, confirmed: g.rows.filter((r) => r.confirmed).length,
    })),
    research: { outputsFile: s.research.outputsFile, outputs: outputs.length, skipped: s.research.skipped, stats: outputs.length ? researchStats(outputs) : null, guides: s.research.guides },
    officialDocs: s.officialDocs,
  };
}

export function moduleActions(ctx: ModuleCtx): Record<string, (p: any) => unknown> {
  const { store, svc } = ctx;

  const course = (id: string): CaCourse => {
    const c = store.read().courses.find((x) => x.id === id);
    if (!c) throw new Error(i18nT('课程不存在或已删除'));
    return c;
  };
  const grading = (id: string): CaGrading => {
    const g = store.gradings().find((x) => x.id === id);
    if (!g) throw new Error(i18nT('批改任务不存在或已删除'));
    return g;
  };
  const saveGrading = (g: CaGrading): void => {
    store.setList('gradings', store.gradings().map((x) => (x.id === g.id ? g : x)));
  };

  /** 简答题：同一题所有学生作答编号后成批交给模型；调不通的留「待评」 */
  async function suggestShort(g: CaGrading): Promise<{ suggested: number; failed: number }> {
    let suggested = 0; let failed = 0;
    for (const k of g.key.filter((x) => x.type === 'short')) {
      const pending = g.rows.map((r, idx) => ({ r, idx, item: r.items.find((i) => i.no === k.no)! })).filter((x) => x.item && x.item.by !== 'teacher');
      for (let i = 0; i < pending.length; i += 20) {
        const batch = pending.slice(i, i + 20);
        ctx.progress(i18nT('第 {no} 题：正在批改 {a}/{b}', { no: k.no, a: Math.min(i + 20, pending.length), b: pending.length }), { scope: 'grade' });
        const blank = batch.filter((x) => !x.item.response.trim());
        for (const x of blank) Object.assign(x.item, { auto: 0, final: 0, reason: i18nT('未作答'), by: 'rule' });
        const ask = batch.filter((x) => x.item.response.trim());
        if (!ask.length) continue;
        try {
          const { json } = await ctx.llmJson('grade', buildShortPrompt(k, ask.map((x, j) => ({ i: j + 1, text: x.item.response.slice(0, 1200) })), k.stem), 150_000);
          const scores = Array.isArray(json?.scores) ? json.scores : [];
          ask.forEach((x, j) => {
            const hit = scores.find((s: any) => Number(s?.i) === j + 1);
            const sc = hit ? clampScore(hit.score, k.score) : null;
            if (sc === null) { failed++; Object.assign(x.item, { auto: null, final: null, reason: i18nT('模型没有给出分数，请教师评分'), by: 'pending' }); return; }
            suggested++;
            Object.assign(x.item, { auto: sc, final: sc, reason: String(hit.reason || '').slice(0, 200), by: 'model' });
          });
        } catch (e) {
          failed += ask.length;
          for (const x of ask) Object.assign(x.item, { reason: i18nT('模型调用失败：{p0}，请教师评分', { p0: String((e as Error)?.message || e).slice(0, 80) }), by: 'pending' });
        }
        for (const x of batch) { x.r.total = rowTotal(x.r.items); }
        saveGrading(g);
        ctx.pushState();
      }
    }
    ctx.progress('', { scope: 'grade' });
    return { suggested, failed };
  }

  return {
    // ── AI 应用中心 ──
    'apps.save': (p: { input: CaScenarioInput; builtin?: boolean }) => {
      const input = p?.input;
      if (p?.builtin && input?.id) {
        store.update((s) => { s.scenarios.overrides[input.id!] = { stage: input.stage, dept: String(input.dept || '').trim() || undefined, note: String(input.note || '').trim() || undefined }; });
      } else {
        const n = normalizeScenarioInput(input);
        store.update((s) => {
          const cur = n.id ? s.scenarios.custom.find((c) => c.id === n.id) : undefined;
          if (cur) Object.assign(cur, n);
          else s.scenarios.custom.push({ id: newId('cas'), direction: n.direction, name: n.name, desc: n.desc || '', dept: n.dept || '', stage: n.stage, note: n.note });
        });
      }
      svc.audit('apps', 'save', true);
      ctx.pushState();
      return true;
    },
    'apps.remove': (p: { id: string }) => {
      store.update((s) => { s.scenarios.custom = s.scenarios.custom.filter((c) => c.id !== p.id); });
      ctx.pushState();
      return true;
    },
    'apps.export': () => {
      const list = listScenarios(store.read().scenarios, store.auditList(5000));
      const stageLabel = (x: string) => ({ planned: i18nT('规划中'), building: i18nT('建设中'), live: i18nT('已上线') } as Record<string, string>)[x] || x;
      const file = join(ctx.outputDir(i18nT('AI应用中心')), i18nT('AI应用建设台账-{p0}.xlsx', { p0: stamp() }));
      writeWorkbook(file, [{
        name: i18nT('建设台账'),
        headers: [i18nT('方向'), i18nT('场景'), i18nT('说明'), i18nT('责任部门'), i18nT('阶段'), i18nT('近 30 天调用'), i18nT('备注')],
        rows: list.map((x) => [directionLabel(x.direction), x.name, x.desc, x.dept, stageLabel(x.stage), x.usage30d, x.note || '']),
      }]);
      return file;
    },

    // ── 教学：课程 ──
    'course.save': (p: { input: Partial<CaCourse> }) => {
      const name = String(p?.input?.name || '').trim().slice(0, 40);
      if (!name) throw new Error(i18nT('请填写课程名称'));
      const r = store.update((s) => {
        const cur = p.input.id ? s.courses.find((c) => c.id === p.input.id) : undefined;
        if (cur) { Object.assign(cur, { name, teacher: String(p.input.teacher || '').trim().slice(0, 30), publicTutor: !!p.input.publicTutor }); return cur; }
        const c: CaCourse = { id: newId('cac'), name, teacher: String(p.input.teacher || '').trim().slice(0, 30), publicTutor: !!p.input.publicTutor, createdAt: new Date().toISOString() };
        s.courses.push(c);
        return c;
      });
      ctx.pushState();
      return r;
    },
    'course.remove': (p: { id: string }) => {
      const ids = store.read().docs.filter((d) => d.courseId === p.id).map((d) => d.id);
      for (const id of ids) svc.removeDoc(id);
      store.update((s) => { s.courses = s.courses.filter((c) => c.id !== p.id); });
      store.setList('questions', store.questions().filter((q) => q.courseId !== p.id));
      ctx.pushState();
      return true;
    },
    'course.import': async (p: { courseId: string; paths: string[] }) => {
      course(p.courseId);
      const made = await svc.importDocs(p?.paths || [], '', i18nT('课程资料'), p.courseId);
      void svc.buildDocs(made.map((d) => d.id));
      return made;
    },
    'teach.demo': async () => {
      const dir = ctx.outputDir(join(i18nT('示例数据'), i18nT('教学')));
      const f = writeDemoCourse(dir);
      let c = store.read().courses.find((x) => x.name === f.courseName);
      if (!c) {
        c = { id: newId('cac'), name: f.courseName, teacher: f.teacher, publicTutor: true, createdAt: new Date().toISOString() };
        const made = c;
        store.update((s) => { s.courses.push(made); });
      }
      const made = await svc.importDocs(f.docs, '', i18nT('课程资料'), c.id);
      await svc.buildDocs(made.map((d) => d.id));
      return { dir, courseId: c.id, keyFile: f.keyFile, answersFile: f.answersFile };
    },
    'tutor.ask': (p: { courseId: string; question: string }) => svc.ask(p?.question || '', 'desk', undefined, p?.courseId),

    // ── 教学：出题 ──
    'quiz.generate': async (p: { courseId: string; counts: Partial<Record<CaQuestionType, number>>; focus?: string }) => {
      const c = course(p.courseId);
      const counts = Object.fromEntries(CA_QUESTION_TYPES.map((t) => [t, Math.min(20, Math.max(0, Math.round(Number(p?.counts?.[t]) || 0)))])) as Record<CaQuestionType, number>;
      if (!Object.values(counts).some((n) => n > 0)) throw new Error(i18nT('请至少选一种题型和题量'));
      const chunks = svc.courseChunks(c.id, String(p?.focus || ''), 8);
      const started = Date.now();
      const { json, model } = await ctx.llmJson('quiz', buildQuizPrompt(c.name, chunks, counts, String(p?.focus || '')), 240_000);
      const parsed = parseQuiz(json, chunks);
      const now = new Date().toISOString();
      const made: CaQuestion[] = parsed.questions.map((q) => ({ ...q, id: newId('caq'), courseId: c.id, reviewed: false, createdAt: now }));
      store.setList('questions', [...made, ...store.questions()]);
      svc.audit('teach', 'quiz', true, started, i18nT('{a} 道，丢弃 {b} 道', { a: made.length, b: parsed.dropped }));
      ctx.pushState();
      return { made: made.length, dropped: parsed.dropped, reasons: parsed.reasons, model };
    },
    'quiz.list': (p: { courseId: string }) => store.questions().filter((q) => q.courseId === p?.courseId),
    'quiz.update': (p: { id: string; patch: Partial<CaQuestion> }) => {
      const list = store.questions();
      const q = list.find((x) => x.id === p?.id);
      if (!q) throw new Error(i18nT('题目不存在或已删除'));
      const pt = p.patch || {};
      if (pt.stem !== undefined) q.stem = String(pt.stem).trim() || q.stem;
      if (pt.answer !== undefined) q.answer = String(pt.answer).trim() || q.answer;
      if (pt.explanation !== undefined) q.explanation = String(pt.explanation);
      if (pt.score !== undefined) q.score = Math.min(50, Math.max(1, Math.round(Number(pt.score) || q.score)));
      if (pt.reviewed !== undefined) q.reviewed = !!pt.reviewed;
      store.setList('questions', list);
      return q;
    },
    'quiz.remove': (p: { ids: string[] }) => {
      const ids = new Set(p?.ids || []);
      store.setList('questions', store.questions().filter((q) => !ids.has(q.id)));
      ctx.pushState();
      return true;
    },
    'quiz.export': (p: { courseId: string; ids?: string[] }) => {
      const c = course(p.courseId);
      const list = store.questions().filter((q) => q.courseId === c.id && (!p.ids?.length || p.ids.includes(q.id)));
      if (!list.length) throw new Error(i18nT('没有可导出的题目'));
      const file = join(ctx.outputDir(i18nT('题库')), safeFileName(i18nT('{p0}-试卷与答案-{p1}.xlsx', { p0: c.name, p1: stamp() })));
      const L = 'ABCDEFGH';
      writeWorkbook(file, [
        { name: i18nT('试卷'), headers: [i18nT('题号'), i18nT('题型'), i18nT('分值'), i18nT('题目'), i18nT('选项')], rows: list.map((q, i) => [i + 1, typeLabel(q.type), q.score, q.stem, q.options.map((o, j) => `${L[j]}. ${o}`).join('\n')]) },
        { name: i18nT('标准答案'), headers: [i18nT('题号'), i18nT('题型'), i18nT('标准答案'), i18nT('分值'), i18nT('评分要点'), i18nT('解析'), i18nT('出处'), i18nT('原文')], rows: list.map((q, i) => [i + 1, typeLabel(q.type), answerLabel(q.type, q.answer), q.score, q.points.join(i18nT('；')), q.explanation, q.sourceTitle, q.sourceQuote]) },
      ]);
      svc.audit('teach', 'quiz.export', true, undefined, String(list.length));
      return file;
    },

    // ── 教学：批改 ──
    'grade.create': (p: { title: string; courseId: string; keyPath?: string; questionIds?: string[] }) => {
      const c = course(p.courseId);
      let key: CaKeyItem[] = [];
      let problems: string[] = [];
      if (p.questionIds?.length) {
        const qs = store.questions().filter((q) => q.courseId === c.id && p.questionIds!.includes(q.id));
        key = qs.map((q, i) => ({ no: String(i + 1), stem: q.stem, type: q.type, answer: q.answer, score: q.score, points: q.points }));
      } else if (p.keyPath) {
        if (!existsSync(p.keyPath)) throw new Error(i18nT('文件不存在：{p0}', { p0: p.keyPath }));
        ({ items: key, problems } = parseKey(readTable(p.keyPath)));
      }
      if (!key.length) throw new Error(problems[0] || i18nT('标准答案是空的'));
      const g: CaGrading = { id: newId('cag'), title: String(p.title || '').trim() || i18nT('{p0} 作业', { p0: c.name }), courseId: c.id, key, keyFile: p.keyPath || '', answersFile: '', rows: [], createdAt: new Date().toISOString() };
      store.setList('gradings', [g, ...store.gradings()]);
      ctx.pushState();
      return { id: g.id, items: key.length, problems };
    },
    'grade.get': (p: { id: string }) => grading(p.id),
    'grade.answers': (p: { id: string; path: string }) => {
      const g = grading(p.id);
      if (!existsSync(p.path)) throw new Error(i18nT('文件不存在：{p0}', { p0: p.path }));
      const { sheets, problems } = parseAnswers(readTable(p.path), g.key);
      if (!sheets.length) throw new Error(problems[0] || i18nT('作答表是空的'));
      g.answersFile = p.path;
      g.rows = sheets.map((sh) => newRow(sh, g.key));
      g.gradedAt = new Date().toISOString();
      g.exportedAt = undefined;
      saveGrading(g);
      svc.audit('teach', 'grade.answers', true, undefined, String(sheets.length));
      ctx.pushState();
      return { students: sheets.length, problems };
    },
    'grade.suggest': async (p: { id: string }) => {
      const g = grading(p.id);
      if (!g.rows.length) throw new Error(i18nT('请先导入学生作答'));
      const started = Date.now();
      const r = await suggestShort(g);
      svc.audit('teach', 'grade.suggest', r.failed === 0, started, i18nT('建议 {a}，待评 {b}', { a: r.suggested, b: r.failed }));
      return r;
    },
    'grade.set': (p: { id: string; studentId: string; no: string; final: number | null }) => {
      const g = grading(p.id);
      const row = g.rows.find((r) => r.studentId === p.studentId);
      const item = row?.items.find((i) => i.no === p.no);
      if (!row || !item) throw new Error(i18nT('找不到这道题的作答'));
      item.final = p.final === null ? null : clampScore(p.final, item.max);
      item.by = 'teacher';
      row.total = rowTotal(row.items);
      saveGrading(g);
      ctx.pushState();
      return row;
    },
    'grade.confirm': (p: { id: string; studentIds?: string[] }) => {
      const g = grading(p.id);
      let n = 0;
      for (const r of g.rows) {
        if (p.studentIds?.length && !p.studentIds.includes(r.studentId)) continue;
        if (r.items.some((i) => i.final === null)) continue;
        r.confirmed = true; n++;
      }
      saveGrading(g);
      ctx.pushState();
      return n;
    },
    'grade.export': (p: { id: string }) => {
      const g = grading(p.id);
      const pending = g.rows.filter((r) => !r.confirmed).length;
      if (pending) throw new Error(i18nT('还有 {n} 名学生的成绩没确认', { n: pending }));
      const file = join(ctx.outputDir(i18nT('作业批改')), safeFileName(`${g.title}-${stamp()}.xlsx`));
      writeWorkbook(file, [
        { name: i18nT('成绩'), headers: [i18nT('学号'), i18nT('姓名'), ...g.key.map((k) => i18nT('第{p0}题', { p0: k.no })), i18nT('总分')], rows: g.rows.map((r) => [r.studentId, r.name, ...g.key.map((k) => r.items.find((i) => i.no === k.no)?.final ?? ''), r.total]) },
        { name: i18nT('评分说明'), headers: [i18nT('学号'), i18nT('题号'), i18nT('作答'), i18nT('得分'), i18nT('满分'), i18nT('评分方式'), i18nT('说明')], rows: g.rows.flatMap((r) => r.items.map((i) => [r.studentId, i.no, i.response, i.final ?? '', i.max, ({ rule: i18nT('按答案判分'), model: i18nT('模型建议、教师确认'), teacher: i18nT('教师评分'), pending: i18nT('待评') } as Record<string, string>)[i.by], i.reason])) },
      ]);
      g.exportedAt = new Date().toISOString();
      g.exportPath = file;
      saveGrading(g);
      svc.audit('teach', 'grade.export', true, undefined, String(g.rows.length));
      ctx.pushState();
      return file;
    },
    'grade.remove': (p: { id: string }) => { store.setList('gradings', store.gradings().filter((g) => g.id !== p.id)); ctx.pushState(); return true; },

    // ── 科研 ──
    'research.import': (p: { path: string }) => {
      if (!existsSync(p?.path)) throw new Error(i18nT('文件不存在：{p0}', { p0: p?.path || '' }));
      const r = parseOutputs(readTable(p.path));
      if (!r.rows.length) throw new Error(r.problems[0] || i18nT('成果表是空的'));
      store.setList('outputs', r.rows);
      store.update((s) => { s.research.outputsFile = p.path; s.research.skipped = r.skipped; });
      svc.audit('research', 'outputs.import', true, undefined, String(r.rows.length));
      ctx.pushState();
      return { count: r.rows.length, skipped: r.skipped, problems: r.problems };
    },
    'research.demo': () => {
      const dir = ctx.outputDir(join(i18nT('示例数据'), i18nT('科研')));
      const f = writeDemoOutputs(dir);
      const g = writeDemoGuide(dir);
      return { dir, outputs: f, guide: g };
    },
    'research.export': () => {
      const rows = store.outputs();
      if (!rows.length) throw new Error(i18nT('还没有导入成果表'));
      const st = researchStats(rows);
      const file = join(ctx.outputDir(i18nT('科研统计')), i18nT('科研成果统计-{p0}.xlsx', { p0: stamp() }));
      const g = (list: typeof st.byYear, name: string) => ({ name, headers: [name, i18nT('数量'), i18nT('经费')], rows: list.map((x) => [x.key, x.count, x.funding]) });
      writeWorkbook(file, [
        g(st.byYear, i18nT('年度')), g(st.byType, i18nT('类型')), g(st.byCollege, i18nT('学院')), g(st.byLevel, i18nT('级别')),
        { name: i18nT('学院×类型'), headers: [i18nT('学院'), ...st.matrix.cols], rows: st.matrix.rows.map((r, i) => [r, ...st.matrix.cells[i]]) },
        { name: i18nT('明细'), headers: [i18nT('成果名称'), i18nT('类型'), i18nT('学院'), i18nT('负责人'), i18nT('年份'), i18nT('级别'), i18nT('经费')], rows: rows.map((r) => [r.title, r.type, r.college, r.owner, r.year, r.level, r.funding]) },
      ]);
      svc.audit('research', 'outputs.export', true);
      return file;
    },
    'guide.analyze': async (p: { path: string }) => {
      if (!existsSync(p?.path)) throw new Error(i18nT('文件不存在：{p0}', { p0: p?.path || '' }));
      const started = Date.now();
      const ex = await extractDocument(p.path, basename(p.path));
      const text = String(ex.text || '').trim();
      if (!text) throw new Error(ex.warning || i18nT('没有读到文字'));
      const parts = splitGuide(text);
      const results: any[] = [];
      let model = '';
      for (let i = 0; i < parts.length; i++) {
        ctx.progress(i18nT('正在解读第 {a}/{b} 部分', { a: i + 1, b: parts.length }), { scope: 'guide' });
        const r = await ctx.llmJson('guide', buildGuidePrompt(parts[i], i, parts.length), 180_000);
        results.push(r.json); model = r.model;
      }
      ctx.progress('', { scope: 'guide' });
      const v = verifyGuide(results, text);
      const g: CaGuide = { id: newId('cag'), fileName: basename(p.path), path: p.path, at: new Date().toISOString(), title: v.title || basename(p.path), ...v.sections, dropped: v.dropped, model };
      store.update((s) => { s.research.guides = [g, ...s.research.guides].slice(0, 30); });
      svc.audit('research', 'guide', true, started, i18nT('{a} 条，丢弃 {b} 条', { a: GUIDE_SECTIONS.reduce((n, k) => n + v.sections[k].length, 0), b: v.dropped }));
      ctx.pushState();
      return g;
    },
    'guide.remove': (p: { id: string }) => { store.update((s) => { s.research.guides = s.research.guides.filter((g) => g.id !== p.id); }); ctx.pushState(); return true; },
    'guide.export': (p: { id: string }) => {
      const g = store.read().research.guides.find((x) => x.id === p.id);
      if (!g) throw new Error(i18nT('解读记录不存在'));
      const label = { deadlines: i18nT('截止时间'), eligibility: i18nT('申报条件'), materials: i18nT('材料清单'), funding: i18nT('资助额度'), contacts: i18nT('联系方式') };
      const file = join(ctx.outputDir(i18nT('申报指南解读')), safeFileName(`${g.title}-${stamp()}.xlsx`));
      writeWorkbook(file, [{ name: i18nT('要点'), headers: [i18nT('类别'), i18nT('要点'), i18nT('日期'), i18nT('原文')], rows: GUIDE_SECTIONS.flatMap((k) => g[k].map((it) => [label[k], it.text, it.date || '', it.quote])) }]);
      return file;
    },

    // ── 校务治理：公文 ──
    'doc.draft': async (p: { input: Partial<CaOfficialDoc> }) => {
      const i = p?.input || {};
      const kind = (['notice', 'request', 'report', 'letter', 'minutes'] as const).includes(i.kind as any) ? i.kind! : 'notice';
      const title = String(i.title || '').trim();
      const points = String(i.points || '').trim();
      if (!title) throw new Error(i18nT('请填写标题'));
      if (!points) throw new Error(i18nT('请填写要点：公文正文只按要点起草'));
      const issuer = String(i.issuer || '').trim() || schoolLabel(store.read().settings);
      const started = Date.now();
      const { text, model } = await ctx.llm('doc', buildDocPrompt({ kind, issuer, title, recipients: String(i.recipients || ''), points, school: schoolLabel(store.read().settings) }), 180_000);
      const body = cleanDocBody(String(text || '').replace(/\*\*/g, '').replace(/^#+\s*/gm, ''), title, String(i.recipients || ''), issuer);
      const now = new Date().toISOString();
      const doc: CaOfficialDoc = {
        id: i.id || newId('cao'), kind, issuer, docNo: String(i.docNo || '').trim(), title, recipients: String(i.recipients || '').trim(), points,
        attachments: String(i.attachments || '').trim(), date: String(i.date || now.slice(0, 10)), body, unverified: docUnverifiedNumbers(body, points, title),
        model, createdAt: now, updatedAt: now,
      };
      store.update((s) => { s.officialDocs = [doc, ...s.officialDocs.filter((d) => d.id !== doc.id)].slice(0, 100); });
      svc.audit('gov', 'doc.draft', true, started, docKindLabel(kind));
      ctx.pushState();
      return doc;
    },
    'doc.save': (p: { id: string; patch: Partial<CaOfficialDoc> }) => {
      const r = store.update((s) => {
        const d = s.officialDocs.find((x) => x.id === p?.id);
        if (!d) throw new Error(i18nT('公文不存在或已删除'));
        for (const k of ['issuer', 'docNo', 'title', 'recipients', 'attachments', 'date', 'body', 'points'] as const) if (p.patch?.[k] !== undefined) d[k] = String(p.patch[k]);
        d.unverified = docUnverifiedNumbers(d.body, d.points, d.title);
        d.updatedAt = new Date().toISOString();
        return d;
      });
      ctx.pushState();
      return r;
    },
    'doc.export': (p: { id: string }) => {
      const d = store.read().officialDocs.find((x) => x.id === p?.id);
      if (!d) throw new Error(i18nT('公文不存在或已删除'));
      const file = join(ctx.outputDir(i18nT('公文')), safeFileName(`${d.title}.docx`));
      writeFileSync(file, buildOfficialDocx(d));
      store.update((s) => { const x = s.officialDocs.find((y) => y.id === d.id); if (x) x.docxPath = file; });
      svc.audit('gov', 'doc.export', true);
      ctx.pushState();
      return file;
    },
    'doc.remove': (p: { id: string }) => { store.update((s) => { s.officialDocs = s.officialDocs.filter((d) => d.id !== p.id); }); ctx.pushState(); return true; },

    // ── 校务治理：诉求热点 ──
    'hotspot.report': async (p: { days?: number; useModel?: boolean }) => {
      const days = Math.min(365, Math.max(1, Math.round(Number(p?.days) || 7)));
      const to = new Date();
      const from = new Date(to.getTime() - days * 86_400_000);
      const started = Date.now();
      const r = hotspotReport(store.qa(), store.read().tickets, from, to);
      const facts = hotspotFacts(r);
      r.summary = hotspotTemplate(r);
      r.summaryBy = 'template';
      if (p?.useModel !== false && r.total > 0) {
        try {
          const { text } = await ctx.llm('hotspot', buildHotspotPrompt(facts, schoolLabel(store.read().settings)), 120_000);
          const t = String(text || '').trim();
          if (t && !numbersOutsideFacts(t, facts).length) { r.summary = t; r.summaryBy = 'model'; }
        } catch { /* 用规则版小结 */ }
      }
      svc.audit('gov', 'hotspot', true, started, i18nT('{n} 天', { n: days }));
      return r;
    },
    'hotspot.export': (p: { report: any }) => {
      const r = p?.report;
      if (!r) throw new Error(i18nT('请先生成报告'));
      const file = join(ctx.outputDir(i18nT('诉求热点')), i18nT('诉求热点周报-{p0}.xlsx', { p0: stamp() }));
      writeWorkbook(file, [
        { name: i18nT('小结'), headers: [i18nT('小结')], rows: String(r.summary || '').split('\n').map((x: string) => [x]) },
        { name: i18nT('领域分布'), headers: [i18nT('领域'), i18nT('本期'), i18nT('上期'), i18nT('无依据')], rows: (r.byDomain || []).map((d: any) => [d.name, d.count, d.prev, d.noEvidence]) },
        { name: i18nT('部门响应'), headers: [i18nT('部门'), i18nT('待答复'), i18nT('已答复'), i18nT('平均响应小时'), i18nT('超 48 小时未答复')], rows: (r.byDept || []).map((d: any) => [d.dept, d.open, d.answered, d.avgHours ?? '', d.overdue]) },
        { name: i18nT('知识缺口'), headers: [i18nT('问题'), i18nT('次数'), i18nT('领域')], rows: (r.gaps || []).map((g: any) => [g.question, g.count, g.domain]) },
        { name: i18nT('高频词'), headers: [i18nT('词'), i18nT('问题数')], rows: (r.keywords || []).map((k: any) => [k.term, k.count]) },
      ]);
      return file;
    },
  };
}
