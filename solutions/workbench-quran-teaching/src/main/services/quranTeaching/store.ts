/**
 * 古兰经智能教学演示 · 状态与编排（主进程）。
 *
 * 持久化：<dataDir>/quran-teaching/state.json（简化数据库，字段按说明书 21 节留扩展余地）。
 * L1 经文不落 state：每次启动从语料目录重新导入并校验（校验值不过 = 不进系统）。
 * 所有外部能力（LLM / 离屏渲染 / TTS / ffmpeg / fal）经 deps 注入，单测可全部换成假实现。
 */
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { quarantineCorruptFile, writeJsonAtomic } from '../../utils/atomicJson';
import type {
  QuranAnalysis, QuranAnswerRecord, QuranApprovedMaterial, QuranDashboard, QuranGraph, QuranGroupIssue, QuranLang, QuranLessonPlan, QuranLevel, QuranMediaCard,
  QuranPaper, QuranParseResult, QuranPlanRequest, QuranQuestion, QuranReinforcement, QuranSpeechRequest, QuranSpeechResult, QuranStatusResponse, QuranStudent, QuranVerse, QuranVideoSample, QuranVideoScript,
 QuranReviewPatch, QuranIntakeItem,} from '@totalclaw/ipc-contracts';
import { approvedMaterials, approvedVersion } from './approved';
import { type LoadedCorpus, chapterName, emptyCorpus, loadCorpus, locateCorpusDir, versesInRange } from './corpus';
import { buildGraph } from './graph';
import { type CardKind, CARD_H, CARD_W, applyScriptPolish, backgroundPrompt, buildCardHtml, buildSceneHtml, buildVideoScript, cardTextLayer, scriptPolishPrompt } from './media';
import { parseRange, searchVerses } from './parse';
import { normalizeArabic, rangeLabel } from './textUtils';
import { matchTokens } from '../../../shared/matchTokens';
import { applyEnrichment, buildPlanSkeleton, enrichPrompt } from './planner';
import { type PaperSpec, type QuizContext, defaultMix, generateQuestions, isCorrect, paperSignature, paperTitle, questionFace, questionIdentity, buildVariants, questionsForStudent } from './quiz';
import { reinforcementExplanation, reviewCards, specForIssue } from './reinforce';
import { newSeed } from './rng';
import { DIMENSIONS, analyzeGroup, analyzePaper, analyzeStudent, compareRetest, covers, demoStudents, simulateAnswers } from './students';

export interface StoreDeps {
  dataDir: string;
  bundledCorpusDir: string;
  /** 随包短视频样例目录（说明书 §13.2 允许成片预置）；缺省表示这次没带样例 */
  bundledVideoDir?: string;
  /** 纯文本 LLM；未配置时抛错（调用方按可选能力处理） */
  llm?: (prompt: string, timeoutMs: number) => Promise<string>;
  llmReady?: () => boolean;
  renderImage?: (html: string, outPath: string, width: number, height: number) => Promise<void>;
  /** 文本 → 音频文件（fal MiniMax speech-02-hd 优先，本地兜底并标注）；返回 null 表示两者都不可用 */
  tts?: (text: string, lang: QuranLang, outBase: string) => Promise<{ path: string; engine: 'fal' | 'local'; model: string } | null>;
  ffmpeg?: string | null;
  /** fal 文生图 → data URL；未配置返回 null */
  falBackground?: (prompt: string) => Promise<string | null>;
  falReady?: () => boolean;
  /** 本地文件 → 渲染层可用 URL */
  fileUrl?: (path: string) => string;
  /** 内置经文字体：离屏渲染内嵌的 @font-face CSS（base64），与渲染层用的 URL */
  fontFaceCss?: string;
  fontUrls?: { quran: string; text: string };
  progress?: (jobId: string, stage: string, msg: string, done: number, total: number) => void;
  logger?: { info?: (m: string, ctx?: Record<string, unknown>) => void; warn?: (m: string, ctx?: Record<string, unknown>) => void };
  now?: () => number;
}

interface PersistedState {
  corpusDir: string;
  corpusSource: 'bundled' | 'directory' | '';
  plans: QuranLessonPlan[];
  papers: QuranPaper[];
  records: QuranAnswerRecord[];
  reinforcements: QuranReinforcement[];
  cards: QuranMediaCard[];
  scripts: QuranVideoScript[];
  videos: QuranVideoSample[];
  /** 教师粘贴/上传的待审核资料（不进锁定层也不进批准层，AI 用不了） */
  intake?: QuranIntakeItem[];
  questionEdits: Record<string, Partial<QuranQuestion>>;
}

const emptyState = (): PersistedState => ({ corpusDir: '', corpusSource: '', plans: [], papers: [], records: [], reinforcements: [], cards: [], scripts: [], videos: [], questionEdits: {} });

export class QuranTeachingStore {
  private corpus: LoadedCorpus = emptyCorpus();
  private state: PersistedState = emptyState();
  private parseCache = new Map<string, QuranParseResult>();
  private readonly materials: QuranApprovedMaterial[] = approvedMaterials();
  private readonly students: QuranStudent[] = demoStudents();

  constructor(private readonly deps: StoreDeps) {
    mkdirSync(this.dir(), { recursive: true });
    this.load();
    // 启动即尝试内置语料（校验失败只记 problems，不抛）
    const dir = this.state.corpusDir && existsSync(this.state.corpusDir) ? this.state.corpusDir : deps.bundledCorpusDir;
    this.importCorpus(dir, dir === deps.bundledCorpusDir ? 'bundled' : 'directory');
    this.adoptBundledVideos();
  }

  // ── 持久化 ──
  private dir(): string { return join(this.deps.dataDir, 'quran-teaching'); }
  private file(): string { return join(this.dir(), 'state.json'); }
  private load(): void {
    try {
      if (existsSync(this.file())) this.state = { ...emptyState(), ...JSON.parse(readFileSync(this.file(), 'utf8')) };
    } catch (e: any) {
      // 坏文件必须留档再降级：静默换空状态 = 老师的全部试卷与成绩凭空消失且无从追查。
      const kept = quarantineCorruptFile(this.file(), String(e?.message || e));
      this.deps.logger?.warn?.('quran-teaching: state 读取失败，已隔离损坏文件并用空状态启动', {
        err: String(e?.message || e), quarantined: kept || '(隔离失败)',
      });
    }
    this.dropStaleLanguageContent();
  }
  /**
   * 旧版本生成的英文 / 阿语试卷与强化里夹着中文（当时来源名只有中文、概念名取中文原卷的），存档里一直留着，
   * 切到该语言时会被当成「已有本语言版本」直接显示。模板生成的英文 / 阿语内容本不该含汉字：
   * 这类存档丢掉（连同其答题记录），切语言时按原参数重新生成。教师在题目上的编辑存在 questionEdits，不在检查范围。
   */
  private dropStaleLanguageContent(): void {
    const papers = this.state.papers.filter((p) => !(p.lang !== 'zh' && hasHanText(p)));
    const reinforcements = this.state.reinforcements.filter((r) => !(r.practice.lang !== 'zh' && hasHanText(r)));
    if (papers.length === this.state.papers.length && reinforcements.length === this.state.reinforcements.length) return;
    const kept = new Set(papers.map((p) => p.id));
    this.deps.logger?.info?.('quran-teaching: 丢弃含中文的旧英文 / 阿语生成内容', { papers: this.state.papers.length - papers.length, reinforcements: this.state.reinforcements.length - reinforcements.length });
    this.state.papers = papers;
    this.state.reinforcements = reinforcements;
    this.state.records = this.state.records.filter((r) => kept.has(r.paperId));
    this.save();
  }
  /**
   * ⚠️ 必须原子写。原实现是 `writeFileSync(file, JSON.stringify(state))` 直接覆盖 ——
   * 写盘途中断电 / 被强杀就留下一个**截断的 state.json**，而 load() 的 catch 只 warn
   * 一句就换成空状态：**语料目录、全部试卷、全部答题记录、教学计划、卡片一起归零，
   * 而且不报错**。学生交卷阶段每答一题写一次整份 state，这个窗口一点都不小。
   * 同仓库 utils/atomicJson 的 writeJsonAtomic 是 tmp + fsync + 带退避重试的 rename，
   * eduHubStore 早就在用，这边补上。
   */
  private save(): void {
    try { writeJsonAtomic(this.file(), this.state); } catch (e: any) { this.deps.logger?.warn?.('quran-teaching: state 写入失败', { err: String(e?.message || e) }); }
  }
  private now(): number { return this.deps.now ? this.deps.now() : Date.now(); }

  // ── L1 语料 ──
  importCorpus(dir: string, source: 'bundled' | 'directory'): LoadedCorpus['status'] {
    const located = locateCorpusDir(dir);
    const loaded = loadCorpus(located, source);
    if (loaded.status.allVerified) {
      this.corpus = loaded;
      this.state.corpusDir = located; this.state.corpusSource = source;
      this.parseCache.clear();
      this.save();
      this.deps.logger?.info?.('quran-teaching: 语料导入并校验通过', { dir: located, verses: loaded.verses.length });
    } else {
      this.deps.logger?.warn?.('quran-teaching: 语料校验失败，拒绝导入', { dir: located, problems: loaded.status.problems });
      if (!this.corpus.status.imported) this.corpus = { ...emptyCorpus(), status: loaded.status };
      return loaded.status;
    }
    return this.corpus.status;
  }

  corpusStatus(): LoadedCorpus['status'] { return this.corpus.status; }
  requireCorpus(): void { if (!this.corpus.status.imported) throw new Error('CORPUS_NOT_IMPORTED'); }

  verses(chapter: number, from?: number, to?: number): QuranVerse[] { return versesInRange(this.corpus, chapter, from, to); }
  search(query: string, chapter?: number): Array<{ verse: QuranVerse; hits: number }> {
    const pool = chapter ? this.corpus.byChapter.get(chapter) || [] : this.corpus.verses;
    return searchVerses(pool, query);
  }
  chapterLabel(chapter: number, lang: QuranLang): string { return chapterName(this.corpus, chapter, lang); }

  // ── L2 ──
  materialsFor(chapter: number, from?: number, to?: number): QuranApprovedMaterial[] {
    return this.materials.filter((m) => m.chapter === chapter && (!from || !to || m.kind === 'glossary' || m.kind === 'theme' || ((m.from ?? 1) <= to && (m.to ?? 9999) >= from)));
  }
  private approvedIds(): Set<string> { return new Set(this.materials.map((m) => m.id)); }
  private approvedCountFor(conceptId: string): number {
    const c = this.materials.find((m) => m.id === conceptId);
    if (!c) return 0;
    return this.materials.filter((m) => m.chapter === c.chapter && (m.kind === 'concept' || m.kind === 'unit' || m.kind === 'note') && (m.from ?? 1) <= (c.to ?? 9999) && (m.to ?? 9999) >= (c.from ?? 1)).length;
  }
  private approvedText(chapter: number, from: number, to: number, lang: QuranLang): string {
    return this.materialsFor(chapter, from, to).filter((m) => m.kind !== 'glossary').map((m) => `[${m.id}] ${m.title[lang]}${m.body ? `: ${m.body[lang]}` : ''}`).join('\n');
  }

  // ── 解析 ──
  private normalizeRange(chapter: number, from?: number, to?: number): { from: number; to: number } {
    const all = this.corpus.byChapter.get(chapter) || [];
    if (!all.length) throw new Error(`CHAPTER_NOT_FOUND:${chapter}`);
    const lo = Math.max(1, Math.min(all.length, from || 1));
    const hi = Math.max(lo, Math.min(all.length, to || all.length));
    return { from: lo, to: hi };
  }
  parse(chapter: number, from?: number, to?: number): QuranParseResult {
    this.requireCorpus();
    const r = this.normalizeRange(chapter, from, to);
    const key = `${chapter}:${r.from}-${r.to}`;
    const cached = this.parseCache.get(key);
    if (cached) return cached;
    const result = parseRange(chapter, this.verses(chapter, r.from, r.to), this.materials);
    this.parseCache.set(key, result);
    return result;
  }

  // ── 教学计划 ──
  async generatePlan(req: QuranPlanRequest): Promise<QuranLessonPlan> {
    this.requireCorpus();
    const r = this.normalizeRange(req.chapter, req.from, req.to);
    const request: QuranPlanRequest = { ...req, from: r.from, to: r.to, sessionsPerWeek: clamp(req.sessionsPerWeek, 1, 7), sessionMinutes: clamp(req.sessionMinutes, 15, 180), weeks: clamp(req.weeks, 1, 16) };
    const parse = this.parse(request.chapter, request.from, request.to);
    let plan = buildPlanSkeleton(`plan-${this.now().toString(36)}`, request, parse, this.chapterLabel(request.chapter, request.lang));
    if (this.deps.llm && this.deps.llmReady?.()) {
      try {
        const raw = await this.deps.llm(enrichPrompt(plan, this.approvedText(request.chapter, request.from, request.to, request.lang)), 60_000);
        plan = applyEnrichment(plan, raw);
      } catch (e: any) { this.deps.logger?.warn?.('quran-teaching: 计划润色失败，用模板骨架', { err: String(e?.message || e) }); }
    }
    plan.createdAt = this.now();
    this.state.plans.unshift(plan);
    this.state.plans = this.state.plans.slice(0, 30);
    this.save();
    return plan;
  }
  /** 已生成的课程（教师端下发课程时从这里挑） */
  listPlans(): QuranLessonPlan[] { return this.state.plans; }
  findPlan(id: string): QuranLessonPlan | null { return this.state.plans.find((p) => p.id === id) || null; }
  savePlan(id: string, patch: Partial<Pick<QuranLessonPlan, 'adaptation' | 'objectives' | 'overview' | 'sessions' | 'reviewStatus'>>): QuranLessonPlan {
    const plan = this.state.plans.find((p) => p.id === id);
    if (!plan) throw new Error('PLAN_NOT_FOUND');
    if (patch.adaptation !== undefined) plan.adaptation = String(patch.adaptation).slice(0, 2000);
    if (patch.overview !== undefined) plan.overview = String(patch.overview).slice(0, 2000);
    if (Array.isArray(patch.objectives)) plan.objectives = patch.objectives.map(String).slice(0, 8);
    if (Array.isArray(patch.sessions)) plan.sessions = patch.sessions;
    plan.reviewStatus = patch.reviewStatus || 'edited';
    this.save();
    return plan;
  }

  // ── 理解图 ──
  graph(chapter: number, from: number | undefined, to: number | undefined, lang: QuranLang): QuranGraph {
    const parse = this.parse(chapter, from, to);
    const papers = this.state.papers.filter((p) => p.chapter === chapter);
    const ids = new Set(papers.map((p) => p.id));
    return buildGraph(parse, this.verses(chapter, parse.from, parse.to), this.chapterLabel(chapter, lang), lang, papers.map((p) => this.materializePaper(p)), this.state.records.filter((r) => ids.has(r.paperId)), this.students);
  }

  // ── 出题 ──
  private quizContext(chapter: number, from: number, to: number, lang: QuranLang): QuizContext {
    return { lang, chapterName: this.chapterLabel(chapter, lang), verses: this.verses(chapter, from, to), chapterVerses: this.corpus.byChapter.get(chapter) || [], parse: this.parse(chapter, from, to), glossarySource: this.materials.find((m) => m.kind === 'glossary')?.source[lang] || '' };
  }
  /** 教师编辑过的题目覆盖在原题上（编辑不改 id，来源字段保留） */
  private materializePaper(p: QuranPaper): QuranPaper {
    const edits = this.state.questionEdits;
    if (!Object.keys(edits).length) return p;
    return { ...p, questions: p.questions.map((q) => (edits[q.id] ? { ...q, ...edits[q.id] } : q)) };
  }
  generatePaper(opts: { chapter: number; from?: number; to?: number; lang: QuranLang; level?: QuranLevel; count?: number; kind?: QuranPaper['kind']; spec?: PaperSpec; audience?: PaperSpec['audience']; targetKey?: string; title?: string }): { paper: QuranPaper; rejected: number } {
    this.requireCorpus();
    const r = this.normalizeRange(opts.chapter, opts.from, opts.to);
    const lang = opts.lang;
    const ctx = this.quizContext(opts.chapter, r.from, r.to, lang);
    const seed = newSeed('p');
    // 出题取向跟着走：强化 / 复测复用原卷的 spec，取向必须一起传下去，
    // 否则「新入门者卷」的复测会冒出原文填空，诊断口径就断了
    const spec: PaperSpec = opts.spec
      ? { ...opts.spec, audience: opts.spec.audience ?? opts.audience }
      : { count: clamp(opts.count || 10, 3, 30), mix: defaultMix(opts.level || 'beginner'), audience: opts.audience };
    const { questions, rejected } = generateQuestions(ctx, seed, spec, this.approvedIds());
    if (!questions.length) throw new Error('NO_QUESTIONS');
    const kind = opts.kind || 'practice';
    const version = this.state.papers.filter((p) => p.chapter === opts.chapter && p.from === r.from && p.to === r.to && p.kind === kind).length + 1;
    const paper: QuranPaper = {
      id: `paper-${seed}`, kind, chapter: opts.chapter, from: r.from, to: r.to, version, seed, lang, questions,
      title: opts.title || paperTitle(kind, lang, { chapter: ctx.chapterName, range: rangeLabel(r.from, r.to), v: version, target: opts.targetKey || '' }),
      signature: paperSignature(questions), targetKey: opts.targetKey, createdAt: this.now(),
    };
    this.state.papers.unshift(paper);
    this.state.papers = this.state.papers.slice(0, 60);
    this.save();
    return { paper, rejected };
  }
  papers(): QuranPaper[] { return this.state.papers.map((p) => this.materializePaper(p)); }
  paper(id: string): QuranPaper {
    const p = this.state.papers.find((x) => x.id === id);
    if (!p) throw new Error('PAPER_NOT_FOUND');
    return this.materializePaper(p);
  }
  updateQuestion(paperId: string, questionId: string, patch: { stem?: string; options?: string[]; explanation?: string; reviewStatus?: 'draft' | 'confirmed'; remove?: boolean }): QuranPaper {
    const p = this.state.papers.find((x) => x.id === paperId);
    if (!p) throw new Error('PAPER_NOT_FOUND');
    if (patch.remove) {
      p.questions = p.questions.filter((q) => q.id !== questionId);
      this.state.records = this.state.records.filter((r) => r.questionId !== questionId);
    } else {
      const q = p.questions.find((x) => x.id === questionId);
      if (!q) throw new Error('QUESTION_NOT_FOUND');
      const e = this.state.questionEdits[questionId] || {};
      if (patch.stem !== undefined) e.stem = String(patch.stem).slice(0, 1000);
      if (patch.explanation !== undefined) e.explanation = String(patch.explanation).slice(0, 1000);
      if (patch.reviewStatus) e.reviewStatus = patch.reviewStatus;
      // 选项文本不允许改动（选项 = 锁定经文 / 批准释义）；只允许改题干与解析
      this.state.questionEdits[questionId] = e;
    }
    p.signature = paperSignature(this.materializePaper(p).questions);
    this.save();
    return this.materializePaper(p);
  }
  regenerateQuestion(paperId: string, questionId: string): QuranPaper {
    const p = this.state.papers.find((x) => x.id === paperId);
    if (!p) throw new Error('PAPER_NOT_FOUND');
    const idx = p.questions.findIndex((q) => q.id === questionId);
    if (idx < 0) throw new Error('QUESTION_NOT_FOUND');
    const old = p.questions[idx];
    const ctx = this.quizContext(p.chapter, p.from, p.to, p.lang);
    const seed = newSeed('rq');
    const { questions } = generateQuestions(ctx, seed, { count: 1, mix: { 1: old.difficulty === 1 ? 1 : 0, 2: old.difficulty === 2 ? 1 : 0, 3: old.difficulty === 3 ? 1 : 0 }, types: [old.type], focus: old.conceptId ? { conceptId: old.conceptId } : undefined }, this.approvedIds());
    if (!questions.length) throw new Error('NO_QUESTIONS');
    const fresh = { ...questions[0], id: `${questionId}-r${this.now().toString(36).slice(-4)}` };
    p.questions.splice(idx, 1, fresh);
    this.state.records = this.state.records.filter((r) => r.questionId !== questionId);
    delete this.state.questionEdits[questionId];
    p.signature = paperSignature(p.questions);
    this.save();
    return this.materializePaper(p);
  }

  // ── 学生与分析 ──
  listStudents(): QuranStudent[] { return this.students; }
  simulate(paperId: string, seed?: string): QuranAnswerRecord[] {
    const paper = this.paper(paperId);
    const s = seed || `sim-${paperId}`;
    /**
     * ⚠️ 只清**模拟**产生的记录（origin='preset'），真人经局域网交上来的
     * （origin='edited'）一律保留 —— 原实现是 `filter(r => r.paperId !== paperId)`，
     * 把这张卷的记录整片删掉。教师点一下第 6 步「5 名学生作答」，或切内容语言时
     * 自动触发，学生真交的卷子就没了，且不可恢复（2026-09-22 审查确认）。
     */
    const realCount = this.state.records.filter((r) => r.paperId === paperId && r.origin === 'edited').length;
    if (realCount > 0) {
      this.deps.logger?.info?.('quran-teaching: 模拟作答保留真人记录', { paperId, kept: realCount });
    }
    this.state.records = this.state.records.filter((r) => r.paperId !== paperId || r.origin === 'edited');
    // 说明书 11.2：5 名学生的试卷不得全部完全相同 —— 分发前先给每人生成自己那一版
    // （题序 + 选项顺序各不相同，题面不动）。变体存回试卷，学生端与判分都按各自那份来。
    /**
     * 已经发过题的学生，其变体必须原样保留 —— 覆盖掉就等于把他看到的卷子换了，
     * 而他的作答下标是按旧顺序填的（同上：选项错位导致整片判错）。
     * 只给还没有变体的学生补建。
     */
    const existing = new Set((paper.variants || []).map((v) => v.studentId));
    const missing = this.students.map((st) => st.id).filter((id) => !existing.has(id));
    if (missing.length) paper.variants = [...(paper.variants || []), ...buildVariants(paper, missing, s)];
    const out = this.students.flatMap((st) => simulateAnswers(st, { ...paper, questions: questionsForStudent(paper, st.id) }, s, { origin: 'preset' }));
    this.state.records.push(...out);
    this.save();
    return out;
  }
  /**
   * 取某生这份卷子的题目视图；**没有变体就当场固化一份再返回**。
   *
   * ⚠️ 这是「选项选错」那个 bug 的根治点（2026-09-22 用户反馈 + 审查确认）。
   * 原来变体只在 `simulate()` 里才建，而学生是通过 `/api/paper` 先拿题的：
   *   学生拿题时没有变体 → 看到的是**原卷顺序**，作答下标按原卷；
   *   教师随后点「5 名学生作答」或切内容语言 → simulate 建出变体；
   *   判分时 setAnswer 走 questionsForStudent → 拿到的是**变体顺序**，
   *   选项被重排、正确答案下标做过逆映射 → 学生的单选整片判错。
   * 发题那一刻就把变体钉死，学生看到的与判分用的从此是同一份，
   * 后续 simulate 也不再改动已有变体（见 simulate 里的保留逻辑）。
   */
  questionsForStudentPinned(paperId: string, studentId: string): QuranQuestion[] {
    const paper = this.paper(paperId);
    const has = paper.variants?.some((v) => v.studentId === studentId);
    if (!has) {
      const fresh = buildVariants(paper, [studentId], `serve-${studentId}`);
      paper.variants = [...(paper.variants || []), ...fresh];
      this.save();
      this.deps.logger?.info?.('quran-teaching: 发题时固化学生卷版本', { paperId, studentId });
    }
    return questionsForStudent(paper, studentId);
  }

  records(paperId: string): QuranAnswerRecord[] { return this.state.records.filter((r) => r.paperId === paperId); }
  /**
   * `opts.defer`：**批量写入时必须传 true**，由调用方在循环结束后统一 `flush()`。
   * 原来每题都 `save()`，而 save 写的是**整份 state**（含全部试卷、视频、卡片、脚本）。
   * 一个班 30 人 × 每人 M 题 = N×M 次全量同步 `writeFileSync` 全在主进程跑，
   * 事件循环被卡死：教师端 UI 冻结、其它学生的请求排队，看起来就像「服务挂了」
   * （2026-09-22 审查确认）。
   */
  setAnswer(paperId: string, studentId: string, questionId: string, answer: number | number[] | null, opts: { defer?: boolean } = {}): QuranAnswerRecord {
    const paper = this.paper(paperId);
    if (!this.students.some((s) => s.id === studentId)) throw new Error('STUDENT_NOT_FOUND');
    // 判分必须用**这名学生那一版**的题目：选项顺序不同，正确答案下标也不同
    const q = questionsForStudent(paper, studentId).find((x) => x.id === questionId);
    if (!q) throw new Error('QUESTION_NOT_FOUND');
    let rec = this.state.records.find((r) => r.paperId === paperId && r.studentId === studentId && r.questionId === questionId);
    if (!rec) {
      rec = { id: `r-${paperId}-${studentId}-${questionId}-1`, studentId, paperId, questionId, chapter: paper.chapter, answer: null, correct: false, attempt: 1, answeredAt: this.now(), origin: 'edited' };
      this.state.records.push(rec);
    }
    rec.answer = answer; rec.correct = isCorrect(q, answer); rec.origin = 'edited'; rec.answeredAt = this.now();
    if (!opts.defer) this.save();
    return rec;
  }

  /** 批量 setAnswer(defer) 之后由调用方显式落盘一次。 */
  flush(): void { this.save(); }
  /**
   * AI 教学解释按「试卷 + 语言 + 当前答题结果」缓存：切内容语言时已有该语言的解释直接用，
   * 没有才调模型；改了任何一个答案，结果签名变了，旧解释自然失效。只放内存（主进程常驻，界面切语言重载也还在）。
   *
   * 教师点「重新生成」时传 force=true 绕开缓存（验收 14 要求关键 AI 输出可重新生成；
   * 签名没变就一直回旧文案，等于这个按钮是假的）。
   */
  private readonly commentaryCache = new Map<string, string>();
  private commentaryKey(paperId: string, lang: QuranLang): string {
    const sig = this.records(paperId).map((r) => `${r.studentId}:${r.questionId}:${r.correct ? 1 : 0}`).sort().join(',');
    return `${paperId}|${lang}|${sig}`;
  }
  /** 题目里存的概念名是出卷时的语言：按分析语言换成批准资料里该语言的概念名（中文原卷在英文界面做强化时不冒中文） */
  private localizePaper(p: QuranPaper, lang: QuranLang): QuranPaper {
    if (p.lang === lang) return p;
    return { ...p, questions: p.questions.map((q) => (q.conceptId ? { ...q, conceptLabel: this.conceptTitle(q.conceptId, lang) || q.conceptLabel } : q)) };
  }
  analyze(paperId: string, lang: QuranLang): QuranAnalysis {
    const paper = this.localizePaper(this.paper(paperId), lang);
    const a = analyzePaper(paper, this.students, this.records(paperId), lang, (id) => this.approvedCountFor(id));
    const cached = this.commentaryCache.get(this.commentaryKey(paperId, lang));
    if (cached) a.commentary = cached;
    return a;
  }
  async analyzeWithCommentary(paperId: string, lang: QuranLang, force = false): Promise<QuranAnalysis> {
    if (force) this.commentaryCache.delete(this.commentaryKey(paperId, lang));
    const a = this.analyze(paperId, lang);
    if (a.commentary && !force) return a;
    if (this.deps.llm && this.deps.llmReady?.() && a.group.issues.length) {
      try {
        const langName = lang === 'ar' ? 'Arabic' : lang === 'en' ? 'English' : 'Chinese';
        const prompt = [
          `You are a teaching assistant. Write 3-5 sentences in ${langName} for the teacher, explaining what these 5 students have NOT learned and what to teach next. Use only the statistics below; do not add religious interpretation; refer to verses only by chapter:verse.`,
          `GROUP ISSUES: ${JSON.stringify(a.group.issues.slice(0, 6).map((i) => ({ label: i.label, kind: i.kind, wrong: `${i.wrongCount}/${i.studentCount}`, verdict: i.verdict, classification: i.classification, refs: i.refs.slice(0, 4) })))}`,
          `STUDENTS: ${JSON.stringify(a.students.map((s) => ({ id: s.studentId, total: s.total.pct, dims: Object.fromEntries(DIMENSIONS.map((d) => [d, s.dimensions[d].pct])) })))}`,
        ].join('\n');
        a.commentary = (await this.deps.llm(prompt, 45_000)).trim().slice(0, 1200);
        if (a.commentary) this.commentaryCache.set(this.commentaryKey(paperId, lang), a.commentary);
      } catch (e: any) { this.deps.logger?.warn?.('quran-teaching: 分析解释生成失败', { err: String(e?.message || e) }); }
    }
    return a;
  }

  // ── 强化与复测 ──
  reinforce(paperId: string, issueKey: string, lang: QuranLang): QuranReinforcement {
    const base = this.paper(paperId);
    const analysis = this.analyze(paperId, lang);
    const issue: QuranGroupIssue | undefined = analysis.group.issues.find((i) => i.key === issueKey);
    if (!issue) throw new Error('ISSUE_NOT_FOUND');
    const parse = this.parse(base.chapter, base.from, base.to);
    const verses = this.verses(base.chapter, base.from, base.to);
    const label = issue.label;
    // 强化练习与复测卷都不出与原卷完全相同的题（题面 = 题干 + 选项，不重复），复测也不重复练习；
    // 优先换一道真正不同的题，范围太小时用同一知识点的变体（换题型 / 措辞 / 选项组合）补足，见 generateQuestions
    const ids = (p: QuranPaper): string[] => p.questions.map(questionIdentity);
    const faces = (p: QuranPaper): string[] => p.questions.map(questionFace);
    const practice = this.generatePaper({ chapter: base.chapter, from: base.from, to: base.to, lang, kind: 'reinforce', spec: { ...specForIssue(issue, 4), exclude: ids(base), excludeFaces: faces(base) }, targetKey: issueKey, title: paperTitle('reinforce', lang, { target: label }) }).paper;
    // 复测卷必须真的考到目标知识点，否则前后对比的「答错人数 after」没法算、界面只能显示「—」。
    // specForIssue 已经把出题聚焦到该知识点上，但题源有限时仍可能落空：这里出完就校验，
    // 落空了放宽排重再出一次（宁可与练习题面重复，也不要给一个算不出对比的复测卷）。
    const retestSpec = specForIssue(issue, 5);
    let retest = this.generatePaper({ chapter: base.chapter, from: base.from, to: base.to, lang, kind: 'retest', spec: { ...retestSpec, exclude: [...ids(base), ...ids(practice)], excludeFaces: [...faces(base), ...faces(practice)] }, targetKey: issueKey, title: paperTitle('retest', lang, { target: label }) }).paper;
    if (!covers(retest, issueKey)) {
      // 换个种子再出一次：generateQuestions 末尾有「保证至少一道命中焦点」的兜底，
      // 多试一轮通常就能覆盖上。**排重范围不放宽** —— 复测卷不得与原卷 / 练习卷同题是既有验收
      // 要求（quranTeaching.acceptance.test.ts），不能为了凑覆盖率破掉它。
      for (let i = 0; i < 3 && !covers(retest, issueKey); i += 1) {
        retest = this.generatePaper({ chapter: base.chapter, from: base.from, to: base.to, lang, kind: 'retest', spec: { ...retestSpec, exclude: [...ids(base), ...ids(practice)], excludeFaces: [...faces(base), ...faces(practice)] }, targetKey: issueKey, title: paperTitle('retest', lang, { target: label }) }).paper;
      }
      if (!covers(retest, issueKey)) this.deps.logger?.warn?.('quran-teaching: 复测卷覆盖不到目标知识点，前后对比按共同考到的知识点口径给出', { issueKey });
    }
    const r: QuranReinforcement = {
      id: `rf-${this.now().toString(36)}`, basePaperId: paperId, targetKey: issueKey, targetLabel: label, classification: issue.classification,
      explanation: reinforcementExplanation(issue, lang, parse, this.materials),
      cards: reviewCards(issue, lang, parse, verses, this.materials),
      practice, retest,
      before: { group: analysis.group, students: analysis.students, targetWrong: issue.wrongCount },
      aiGenerated: true, generator: 'template', createdAt: this.now(),
    };
    this.state.reinforcements.unshift(r);
    this.state.reinforcements = this.state.reinforcements.slice(0, 20);
    this.save();
    return r;
  }
  /**
   * 教师审核 AI 产物（验收 14：关键 AI 输出要有接受 / 编辑 / 重新生成）。
   *
   * 「重新生成」各自已有入口（脚本走 makeVideoScript、强化走 reinforce），这里补的是
   * 另外两件：**接受**（标为已确认）与**编辑**（改正文 / 改复习卡）。
   * 教师改过之后仍是 AI 生成物 —— aiGenerated 不动，§6 第三层的标记不能因为人改过就抹掉；
   * 改的是内容与审核态，来源属性照旧。
   */
  review(patch: QuranReviewPatch): { script?: QuranVideoScript; reinforcement?: QuranReinforcement } {
    if (patch.target === 'script') {
      const sc = this.state.scripts.find((x) => x.id === patch.id);
      if (!sc) throw new Error('SCRIPT_NOT_FOUND');
      if (typeof patch.text === 'string' && patch.text.trim()) sc.objective = patch.text.trim().slice(0, 2000);
      if (patch.accept !== undefined) sc.reviewStatus = patch.accept ? 'confirmed' : 'draft';
      this.save();
      return { script: sc };
    }
    if (patch.target === 'card') {
      const before = this.state.cards.length;
      // 只从清单里摘掉，不删磁盘文件：教师可能还在别处引用，误删不可逆
      this.state.cards = this.state.cards.filter((c) => c.id !== patch.id);
      if (this.state.cards.length === before) throw new Error('CARD_NOT_FOUND');
      this.save();
      return {};
    }
    const rf = this.state.reinforcements.find((x) => x.id === patch.id);
    if (!rf) throw new Error('REINFORCEMENT_NOT_FOUND');
    if (typeof patch.text === 'string' && patch.text.trim()) rf.explanation = patch.text.trim().slice(0, 4000);
    for (const c of patch.cards || []) {
      const card = rf.cards[c.index];
      if (!card) continue;
      if (typeof c.title === 'string' && c.title.trim()) card.title = c.title.trim().slice(0, 200);
      if (typeof c.body === 'string' && c.body.trim()) card.body = c.body.trim().slice(0, 2000);
    }
    if (patch.accept !== undefined) rf.reviewStatus = patch.accept ? 'confirmed' : 'draft';
    this.save();
    return { reinforcement: rf };
  }

  /**
   * 收下教师粘贴的文本 / 文件（§8「上传文本或文件入口」，说明书列为可简化）。
   *
   * 关键是**它进不了锁定层、也进不了批准层**：只作为「待审核资料」存着，AI 不会拿它解释或出题
   * （approvedIds 里没有它）。之前这个入口只是界面上的一个 textarea，粘完什么也不发、
   * 什么也不存，刷新即没 —— 那就成了纯摆设。现在真落库，界面能列出已收条目。
   */
  intake(text: string, note?: string): QuranIntakeItem[] {
    const body = String(text || '').trim();
    if (!body) return this.state.intake || [];
    if (!this.state.intake) this.state.intake = [];
    this.state.intake.unshift({
      id: `intake-${this.now().toString(36)}`,
      chars: body.length,
      preview: body.slice(0, 120),
      note: note || '',
      reviewStatus: 'pending',
      createdAt: this.now(),
    });
    this.state.intake = this.state.intake.slice(0, 20);
    this.save();
    return this.state.intake;
  }
  intakeItems(): QuranIntakeItem[] { return this.state.intake || []; }

  reinforcements(): QuranReinforcement[] { return this.state.reinforcements; }
  /** 复测：学生完成强化后再答（模拟时给弱项学生加成，体现「强化后」变化）；也可由界面逐题改答案后再调 analyze */
  retest(reinforcementId: string, lang: QuranLang): QuranReinforcement {
    const r = this.state.reinforcements.find((x) => x.id === reinforcementId);
    if (!r) throw new Error('REINFORCEMENT_NOT_FOUND');
    const seed = `retest-${r.id}`;
    this.state.records = this.state.records.filter((x) => x.paperId !== r.retest.id && x.paperId !== r.practice.id);
    for (const st of this.students) {
      const wasWeak = r.before.group.issues.find((i) => i.key === r.targetKey)?.wrongStudents.includes(st.id);
      this.state.records.push(...simulateAnswers(st, this.materializePaper(r.practice), `${seed}-practice`, { origin: 'retest', boost: wasWeak ? 0.25 : 0.05 }));
      this.state.records.push(...simulateAnswers(st, this.materializePaper(r.retest), seed, { origin: 'retest', boost: wasWeak ? 0.4 : 0.08, attempt: 2 }));
    }
    const after = analyzePaper(this.materializePaper(r.retest), this.students, this.records(r.retest.id), lang, (id) => this.approvedCountFor(id));
    const issue = after.group.issues.find((i) => i.key === r.targetKey);
    r.after = { group: after.group, students: after.students, targetWrong: issue?.wrongCount || 0 };
    r.compare = this.retestCompare(r, lang);
    this.save();
    return r;
  }
  /** 前后对比：原卷与复测卷共同考到的知识点，同一口径（见 compareRetest）。原卷已被清掉时不给对比 */
  private retestCompare(r: QuranReinforcement, lang: QuranLang): QuranReinforcement['compare'] {
    const base = this.state.papers.find((p) => p.id === r.basePaperId);
    if (!base) return undefined;
    return compareRetest(this.materializePaper(base), this.materializePaper(r.retest), this.students, [...this.records(base.id), ...this.records(r.retest.id)], lang, (id) => this.approvedCountFor(id), r.targetKey);
  }
  /** 复测答案被手改后重算 after（验收 09 同样适用于复测） */
  recomputeAfter(reinforcementId: string, lang: QuranLang): QuranReinforcement {
    const r = this.state.reinforcements.find((x) => x.id === reinforcementId);
    if (!r) throw new Error('REINFORCEMENT_NOT_FOUND');
    if (!r.after) return r;
    const after = analyzePaper(this.materializePaper(r.retest), this.students, this.records(r.retest.id), lang, (id) => this.approvedCountFor(id));
    r.after = { group: after.group, students: after.students, targetWrong: after.group.issues.find((i) => i.key === r.targetKey)?.wrongCount || 0 };
    r.compare = this.retestCompare(r, lang);
    this.save();
    return r;
  }

  // ── 多媒体 ──
  async makeCard(opts: { kind: CardKind; chapter: number; from?: number; to?: number; lang: QuranLang; useFal?: boolean; focusRefs?: string[]; jobId?: string }): Promise<QuranMediaCard> {
    this.requireCorpus();
    if (!this.deps.renderImage) throw new Error('RENDER_UNAVAILABLE');
    const r = this.normalizeRange(opts.chapter, opts.from, opts.to);
    const parse = this.parse(opts.chapter, r.from, r.to);
    const verses = this.verses(opts.chapter, r.from, r.to);
    const jobId = opts.jobId || `card-${this.now().toString(36)}`;
    let background: string | undefined;
    let bg: QuranMediaCard['background'] = 'template';
    if (opts.useFal && this.deps.falBackground && this.deps.falReady?.()) {
      this.deps.progress?.(jobId, 'fal', 'fal', 0, 2);
      try { const b = await this.deps.falBackground(backgroundPrompt(opts.kind)); if (b) { background = b; bg = 'fal'; } } catch (e: any) { this.deps.logger?.warn?.('quran-teaching: fal 背景失败，用模板背景', { err: String(e?.message || e) }); }
    }
    this.deps.progress?.(jobId, 'render', 'render', 1, 2);
    const input = { kind: opts.kind, lang: opts.lang, chapterName: this.chapterLabel(opts.chapter, opts.lang), parse, verses, corpusVersion: this.corpus.status.version, backgroundDataUrl: background, focusRefs: opts.focusRefs };
    const dir = join(this.dir(), 'media'); mkdirSync(dir, { recursive: true });
    const path = join(dir, `${jobId}-${opts.kind}.png`);
    await this.deps.renderImage(buildCardHtml(input, this.deps.fontFaceCss), path, CARD_W, CARD_H);
    const card: QuranMediaCard = { id: jobId, kind: opts.kind, title: `${input.chapterName} ${rangeLabel(r.from, r.to)}`, path, url: this.deps.fileUrl ? this.deps.fileUrl(path) : path, verseRefs: verses.map((v) => v.ref), textLayer: cardTextLayer(input), background: bg, lang: opts.lang, createdAt: this.now() };
    this.state.cards.unshift(card); this.state.cards = this.state.cards.slice(0, 40); this.save();
    this.deps.progress?.(jobId, 'done', 'done', 2, 2);
    return card;
  }
  async makeVideoScript(opts: { chapter: number; from?: number; to?: number; lang: QuranLang; polish?: boolean }): Promise<QuranVideoScript> {
    this.requireCorpus();
    const r = this.normalizeRange(opts.chapter, opts.from, opts.to);
    const parse = this.parse(opts.chapter, r.from, r.to);
    let script = buildVideoScript(`vs-${this.now().toString(36)}`, opts.lang, this.chapterLabel(opts.chapter, opts.lang), parse, this.verses(opts.chapter, r.from, r.to));
    if (opts.polish !== false && this.deps.llm && this.deps.llmReady?.()) {
      try { script = applyScriptPolish(script, await this.deps.llm(scriptPolishPrompt(script, this.approvedText(opts.chapter, r.from, r.to, opts.lang)), 60_000)); } catch (e: any) { this.deps.logger?.warn?.('quran-teaching: 脚本润色失败，用模板', { err: String(e?.message || e) }); }
    }
    this.state.scripts.unshift(script); this.state.scripts = this.state.scripts.slice(0, 20); this.save();
    return script;
  }
  async makeVideoSample(scriptId: string, jobId?: string): Promise<QuranVideoSample> {
    const script = this.state.scripts.find((s) => s.id === scriptId);
    if (!script) throw new Error('SCRIPT_NOT_FOUND');
    if (!this.deps.renderImage) throw new Error('RENDER_UNAVAILABLE');
    if (!this.deps.ffmpeg) throw new Error('FFMPEG_UNAVAILABLE');
    const id = jobId || `vid-${this.now().toString(36)}`;
    const work = join(this.dir(), 'media', id); mkdirSync(work, { recursive: true });
    const chapterName = this.chapterLabel(script.chapter, script.lang);
    const segs: string[] = [];
    let voiceEngine: 'fal' | 'local' | 'none' = 'none';
    for (const [i, sc] of script.scenes.entries()) {
      this.deps.progress?.(id, 'frame', `${i + 1}/${script.scenes.length}`, i, script.scenes.length + 1);
      const png = join(work, `scene-${i + 1}.png`);
      await this.deps.renderImage(buildSceneHtml(sc, script.lang, chapterName, i, script.scenes.length, this.deps.fontFaceCss), png, 1280, 720);
      let wav: string | null = null;
      if (this.deps.tts) {
        try {
          const r = await this.deps.tts(sc.narration, script.lang, join(work, `scene-${i + 1}`));
          if (r) { wav = r.path; voiceEngine = voiceEngine === 'fal' || r.engine === 'fal' ? 'fal' : 'local'; }
        } catch (e: any) { this.deps.logger?.warn?.('quran-teaching: TTS 失败，该镜头静音', { err: String(e?.message || e) }); }
      }
      const seg = join(work, `seg-${i + 1}.mp4`);
      const dur = Math.max(3, sc.durationSec);
      const args = wav
        ? ['-y', '-loop', '1', '-i', png, '-i', wav, '-c:v', 'libx264', '-tune', 'stillimage', '-pix_fmt', 'yuv420p', '-r', '25', '-c:a', 'aac', '-b:a', '128k', '-shortest', '-t', String(dur + 4), '-vf', 'scale=1280:720', seg]
        : ['-y', '-loop', '1', '-i', png, '-f', 'lavfi', '-i', 'anullsrc=r=44100:cl=stereo', '-c:v', 'libx264', '-tune', 'stillimage', '-pix_fmt', 'yuv420p', '-r', '25', '-c:a', 'aac', '-t', String(dur), '-vf', 'scale=1280:720', seg];
      await runFfmpeg(this.deps.ffmpeg, args);
      segs.push(seg);
    }
    this.deps.progress?.(id, 'concat', 'concat', script.scenes.length, script.scenes.length + 1);
    const list = join(work, 'concat.txt');
    writeFileSync(list, segs.map((s) => `file '${s.replace(/'/g, "'\\''")}'`).join('\n'));
    const out = join(this.dir(), 'media', `${id}.mp4`);
    await runFfmpeg(this.deps.ffmpeg, ['-y', '-f', 'concat', '-safe', '0', '-i', list, '-c', 'copy', out]);
    const sample: QuranVideoSample = { id, scriptId, path: out, url: this.deps.fileUrl ? this.deps.fileUrl(out) : out, durationSec: script.totalSec, source: 'generated', createdAt: this.now(), voiceEngine };
    this.state.videos.unshift(sample); this.state.videos = this.state.videos.slice(0, 10); this.save();
    this.deps.progress?.(id, 'done', 'done', script.scenes.length + 1, script.scenes.length + 1);
    return sample;
  }
  /**
   * 语音合成：kind=verse 只朗读锁定语料原文（逐字拼接，不改写）；kind=teaching 朗读解释文本。
   * 引擎优先级由 deps.tts 决定（fal MiniMax speech-02-hd → 本地兜底），结果带 engine / fallback 标注。
   */
  async makeSpeech(req: QuranSpeechRequest): Promise<QuranSpeechResult> {
    this.requireCorpus();
    if (!this.deps.tts) throw new Error('TTS_UNAVAILABLE');
    const r = this.normalizeRange(req.chapter, req.from, req.to);
    const verses = this.verses(req.chapter, r.from, r.to);
    let text: string;
    let refs: string[] = [];
    let lang = req.lang;
    if (req.kind === 'verse') {
      const picked = verses.slice(0, 12); // 诵读示例最多 12 节，避免超长合成
      text = picked.map((v) => v.arabic).join('\n');
      refs = picked.map((v) => v.ref);
      lang = 'ar';
    } else {
      text = String(req.text || '').trim().slice(0, 2000);
      if (!text) throw new Error('TEXT_REQUIRED');
    }
    const id = `spk-${this.now().toString(36)}`;
    const dir = join(this.dir(), 'media'); mkdirSync(dir, { recursive: true });
    const out = await this.deps.tts(text, lang, join(dir, id));
    if (!out) throw new Error('TTS_UNAVAILABLE');
    return { id, kind: req.kind, path: out.path, url: this.deps.fileUrl ? this.deps.fileUrl(out.path) : out.path, engine: out.engine, model: out.model, fallback: out.engine !== 'fal', text, verseRefs: refs, createdAt: this.now() };
  }
  /**
   * 把随包的短视频样例登记进来（说明书 §13.2 / 验收 12：成片允许预置，但必须**有**）。
   *
   * 幂等：按路径去重，重启不会越登越多。样例由 scripts/build-quran-demo-video.mjs 走真链生成
   * （真语料 → 真脚本分镜 → Chromium 渲染真文字帧 → ffmpeg 合成），不是随手找的片子。
   * 没带样例、或文件被删了，就当没有——界面据此决定说不说「有预置样例」，不空口承诺。
   */
  private adoptBundledVideos(): void {
    const dir = this.deps.bundledVideoDir;
    if (!dir || !existsSync(dir)) return;
    let changed = false;
    for (const name of readdirSync(dir)) {
      if (!name.toLowerCase().endsWith('.mp4')) continue;
      const path = join(dir, name);
      if (this.state.videos.some((v) => v.path === path)) continue;
      let note = '';
      let durationSec = 0;
      try {
        const meta = JSON.parse(readFileSync(path.replace(/\.mp4$/i, '.json'), 'utf8'));
        note = String(meta?.note || '');
        durationSec = Number(meta?.durationSec) || 0;
      } catch { /* 没有元信息文件也能用 */ }
      this.state.videos.push({
        id: `vid-bundled-${name.replace(/[^a-z0-9]+/gi, '-').toLowerCase()}`,
        path, url: this.deps.fileUrl ? this.deps.fileUrl(path) : path,
        durationSec, source: 'prebaked', createdAt: this.now(), note,
      });
      changed = true;
    }
    if (changed) this.save();
  }

  registerPrebakedVideo(path: string, note?: string): QuranVideoSample {
    const sample: QuranVideoSample = { id: `vid-pre-${this.now().toString(36)}`, path, url: this.deps.fileUrl ? this.deps.fileUrl(path) : path, durationSec: 0, source: 'prebaked', createdAt: this.now(), note };
    this.state.videos.unshift(sample); this.save();
    return sample;
  }

  // ── 学生端受限问答 ──
  /**
   * 只依据批准资料回答：先按语言分词（中文 Intl.Segmenter / 阿文按词去变音符 / 英文按词），
   * 命中批准资料（主题 / 单元 / 概念 / 词表）或经文才作答；命不中或 LLM 判定不足 → 明确提示需要更多批准资料。
   */
  async studentAsk(question: string, chapter: number, from: number | undefined, to: number | undefined, lang: QuranLang): Promise<{ answer: string; sources: Array<{ id: string; title: string }>; insufficient: boolean }> {
    this.requireCorpus();
    const r = this.normalizeRange(chapter, from, to);
    const terms = queryTerms(question, lang);
    if (!terms.length) return { answer: '', sources: [], insufficient: true };
    const mats = this.materialsFor(chapter, r.from, r.to).filter((m) => m.kind !== 'glossary');
    const hits = mats.filter((m) => terms.some((t) => textHasTerm(`${m.title[lang]} ${m.body?.[lang] || ''} ${m.title.ar} ${m.body?.ar || ''}`, t))).slice(0, 4);
    const glossHits = this.materialsFor(chapter).filter((m) => m.kind === 'glossary' && terms.some((t) => textHasTerm(`${m.word || ''} ${m.title[lang]}`, t))).slice(0, 4);
    const verseHits = terms.some((t) => /[\u0600-\u06FF]/.test(t)) ? searchVerses(this.verses(chapter, r.from, r.to), terms.filter((t) => /[\u0600-\u06FF]/.test(t)).join(' '), 3) : [];
    const sources = [
      ...hits.map((m) => ({ id: m.id, title: m.title[lang] })),
      ...glossHits.map((m) => ({ id: m.id, title: `${m.word} — ${m.title[lang]}` })),
      ...verseHits.map((h) => ({ id: `L1:${h.verse.ref}`, title: h.verse.ref })),
    ];
    // 「够不够回答」只看这里：检索到批准资料就一定给出回答（资料原文兜底），检索不到才说超出范围 ——
    // 不能一边列出相关来源、一边说超出范围（英文界面模型对「patience 是什么意思」回 INSUFFICIENT 就是这样）
    if (!hits.length && !glossHits.length) return { answer: '', sources: [], insufficient: true };
    const snippets = [
      ...hits.map((m) => `[${m.id}] ${m.title[lang]}${m.body ? `: ${m.body[lang]}` : ''}`),
      ...glossHits.map((m) => `[${m.id}] ${m.word}: ${m.title[lang]}`),
      ...verseHits.map((h) => `[L1 ${h.verse.ref}] ${h.verse.arabic}`),
    ].join('\n');
    const plain = [
      ...hits.map((m) => `• ${m.title[lang]}${m.body ? ` — ${m.body[lang]}` : ''}`),
      ...glossHits.map((m) => `• ${m.word} — ${m.title[lang]}`),
      ...verseHits.map((h) => `• ${h.verse.ref} ${h.verse.arabic}`),
    ].join('\n');
    if (this.deps.llm && this.deps.llmReady?.()) {
      try {
        const langName = lang === 'ar' ? 'Arabic' : lang === 'en' ? 'English' : 'Chinese';
        const raw = await this.deps.llm(`Answer the student's question in ${langName} using ONLY the approved materials below. They were retrieved for this question: if they are related, answer with what they say (a basic word meaning or the concept they name is enough), even if only partially. Reply exactly INSUFFICIENT only when none of them is related. Do not add interpretation beyond them; never paraphrase Quranic text, refer to verses as chapter:verse. Keep it under 120 words.\nQUESTION: ${question}\nAPPROVED MATERIALS:\n${snippets}`, 45_000);
        if (raw.trim() && !/^\s*INSUFFICIENT/i.test(raw)) return { answer: raw.trim().slice(0, 1500), sources, insufficient: false };
      } catch (e: any) { this.deps.logger?.warn?.('quran-teaching: 受限问答 LLM 失败，直接返回资料片段', { err: String(e?.message || e) }); }
    }
    return { answer: plain, sources, insufficient: false };
  }

  // ── 看板 ──
  /** 强化目标的标签按看板语言重算（存档里的 targetLabel 是生成时的语言）；原卷不在了就返回空，调用方回落存档值 */
  private issueLabel(paperId: string, issueKey: string, lang: QuranLang): string {
    const concept = this.conceptTitle(issueKey, lang);
    if (concept) return concept;
    try { return this.analyze(paperId, lang).group.issues.find((i) => i.key === issueKey)?.label || ''; } catch { return ''; }
  }
  /** 概念类薄弱点的标签取批准资料里该语言的概念名（题目里存的 conceptLabel 是出卷时的语言） */
  private conceptTitle(id: string, lang: QuranLang): string {
    return this.materials.find((m) => m.kind === 'concept' && m.id === id)?.title[lang] || '';
  }
  dashboard(lang: QuranLang): QuranDashboard {
    const papers = this.papers();
    const students = this.students.map((s) => {
      const analyses = papers.filter((p) => this.state.records.some((r) => r.paperId === p.id && r.studentId === s.id)).map((p) => analyzeStudent(s.id, p, this.state.records, lang));
      const avg = analyses.length ? Math.round(analyses.reduce((a, x) => a + x.total.pct, 0) / analyses.length) : 0;
      const dimAvg = DIMENSIONS.map((d) => { const xs = analyses.map((a) => a.dimensions[d]).filter((x) => x.total); return { d, pct: xs.length ? xs.reduce((a, x) => a + x.pct, 0) / xs.length : -1 }; }).filter((x) => x.pct >= 0);
      const strongest = dimAvg.length ? dimAvg.reduce((a, b) => (b.pct > a.pct ? b : a)).d : '';
      const weakest = dimAvg.length ? dimAvg.reduce((a, b) => (b.pct < a.pct ? b : a)).d : '';
      return { studentId: s.id, name: s.name, avg, strongest, weakest, papers: analyses.length } as QuranDashboard['students'][number];
    });
    // 「最近一套」优先取看板语言的试卷；概念类标签按看板语言重取，别的语言出的卷也不冒原语言文字
    const isSet = (p: QuranPaper): boolean => p.kind === 'practice' || p.kind === 'exam';
    const latest = papers.find((p) => isSet(p) && p.lang === lang) || papers.find(isSet);
    const commonIssues = latest
      ? analyzeGroup(latest, this.students, this.state.records, lang, (id) => this.approvedCountFor(id)).issues
        .filter((i) => i.verdict !== 'individual').slice(0, 6)
        .map((i) => (i.kind === 'concept' ? { ...i, label: this.conceptTitle(i.key, lang) || i.label } : i))
      : [];
    const questions = papers.reduce((a, p) => a + p.questions.length, 0);
    return {
      corpus: { chapters: this.corpus.status.chapters.length, verses: this.corpus.status.totalVerses, verified: this.corpus.status.allVerified },
      plans: this.state.plans.length, papers: papers.length, questions,
      verifiedQuestions: papers.reduce((a, p) => a + p.questions.filter((q) => q.verified).length, 0),
      students, commonIssues,
      improvement: this.state.reinforcements.map((r) => ({ reinforcementId: r.id, targetLabel: this.issueLabel(r.basePaperId, r.targetKey, lang) || r.targetLabel, before: r.compare?.target.before ?? r.before.targetWrong, after: r.compare ? r.compare.target.after : r.after ? r.after.targetWrong : null })),
      media: { cards: this.state.cards.length, videos: this.state.videos.length },
    };
  }

  status(): QuranStatusResponse {
    return {
      corpus: this.corpus.status, llmReady: !!this.deps.llmReady?.(), ffmpegReady: !!this.deps.ffmpeg, falReady: !!this.deps.falReady?.(),
      students: this.students, plans: this.state.plans, papers: this.papers(), reinforcements: this.state.reinforcements, cards: this.state.cards, scripts: this.state.scripts, videos: this.state.videos,
      fonts: this.deps.fontUrls,
    };
  }
  approvedVersion(): string { return approvedVersion(); }
  reset(): void {
    const keep = { corpusDir: this.state.corpusDir, corpusSource: this.state.corpusSource };
    this.state = { ...emptyState(), ...keep };
    this.commentaryCache.clear();
    this.save();
  }
}

function clamp(n: number, lo: number, hi: number): number { return Math.max(lo, Math.min(hi, Number(n) || lo)); }

/** 生成内容里有没有汉字（id / 路径 / 签名等机器字段与三语对象的 zh 格不看） */
function hasHanText(value: unknown): boolean {
  if (typeof value === 'string') return /[\u3400-\u9fff]/.test(value);
  if (Array.isArray(value)) return value.some(hasHanText);
  if (value && typeof value === 'object') {
    const o = value as Record<string, unknown>;
    const tri = 'zh' in o && 'en' in o && 'ar' in o;
    return Object.entries(o).some(([k, v]) => !['id', 'path', 'url', 'signature', 'sha256'].includes(k) && !(tri && k === 'zh') && hasHanText(v));
  }
  return false;
}

// 中文停用词：用来从提问里剔除虚词再检索经文，是**匹配用词表**不是展示文案，翻译即失效。
const ZH_STOP = new Set(matchTokens(['什么', '这一', '一章', '这章', '这节', '这个', '那个', '怎么', '为什么', '为何', '哪一', '哪个', '请问', '意思', '是不是', '有没有', '可以', '应该', '如何', '里面', '其中', '本章', '经文', '这里', '一节', '这些', '那些']));
const EN_STOP = new Set(['what', 'which', 'does', 'this', 'that', 'these', 'those', 'the', 'and', 'for', 'with', 'about', 'mean', 'means', 'meaning', 'verse', 'verses', 'chapter', 'surah', 'sura', 'how', 'why', 'are', 'is', 'in', 'of', 'to', 'do', 'it', 'here', 'there', 'please', 'tell', 'explain', 'can', 'you', 'say', 'says', 'said', 'word', 'words']);
/** 英文词干：去掉常见词尾，让 patience / patient / patiently 互相命中（检索是子串包含，词干留 ≥4 个字母） */
function englishStem(w: string): string {
  for (const suf of ['ently', 'antly', 'ness', 'ence', 'ance', 'ment', 'ing', 'ent', 'ant', 'ly', 'ed', 'es', 's']) {
    if (w.endsWith(suf) && w.length - suf.length >= 4) return w.slice(0, -suf.length);
  }
  return w;
}

/** 提问分词：中文用 Intl.Segmenter（无则退双字）；阿文按词并去变音符；英文按词。 */
export function queryTerms(question: string, lang: QuranLang): string[] {
  const q = String(question || '').trim();
  const out = new Set<string>();
  for (const w of q.split(/\s+/)) if (/[\u0600-\u06FF]/.test(w)) { const n = normalizeArabic(w); if (n.length >= 2) out.add(n); }
  const zh = q.replace(/[^\u4e00-\u9fff]+/g, ' ').trim();
  if (zh) {
    let segs: string[] = [];
    try {
      const Seg = (Intl as any).Segmenter;
      if (Seg) segs = Array.from(new Seg('zh', { granularity: 'word' }).segment(zh) as Iterable<{ segment: string; isWordLike?: boolean }>).filter((x) => x.isWordLike).map((x) => x.segment);
    } catch { segs = []; }
    if (!segs.length) for (const piece of zh.split(' ')) for (let i = 0; i + 2 <= piece.length; i += 1) segs.push(piece.slice(i, i + 2));
    for (const t of segs) if (t.length >= 2 && !ZH_STOP.has(t)) out.add(t);
    // 单字实词（如「善」「信」）双字组合已覆盖；这里补长度 1 的词只在整句很短时
    if (!out.size && zh.length <= 3) out.add(zh);
  }
  if (lang === 'en' || /[A-Za-z]{3,}/.test(q)) for (const w of q.toLowerCase().split(/[^a-z]+/)) if (w.length >= 3 && !EN_STOP.has(w)) out.add(englishStem(w));
  return Array.from(out);
}

/** 文本是否含检索词：阿文两边都归一化后按词比；中英文小写包含。 */
export function textHasTerm(text: string, term: string): boolean {
  if (/[\u0600-\u06FF]/.test(term)) {
    const words = text.split(/\s+/).map(normalizeArabic).filter(Boolean);
    return words.some((w) => w === term || (term.length >= 3 && w.includes(term)));
  }
  return text.toLowerCase().includes(term.toLowerCase());
}

async function runFfmpeg(bin: string, args: string[]): Promise<void> {
  const { execFile } = await import('node:child_process');
  await new Promise<void>((resolve, reject) => {
    execFile(bin, args, { timeout: 180_000, maxBuffer: 16 * 1024 * 1024 }, (err, _out, stderr) => {
      if (err) reject(new Error(`ffmpeg: ${String(stderr || err.message).slice(-400)}`)); else resolve();
    });
  });
}
