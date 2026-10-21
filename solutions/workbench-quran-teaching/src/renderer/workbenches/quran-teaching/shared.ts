/**
 * 古兰经智能教学演示 · 渲染层共享：preload 访问器（toPlain 防 Proxy 克隆错）、九步状态机、内容语言、全局演示状态。
 */
import { computed, effectScope, nextTick, reactive, ref, watch } from 'vue';
import type {
  QuranAnalysis, QuranAnswerRecord, QuranCorpusStatus, QuranDimension, QuranGraph, QuranLang, QuranLessonPlan, QuranMediaCard, QuranPaper, QuranParseResult,
  QuranQuestion, QuranReinforcement, QuranStatusResponse, QuranStudent, QuranVerse, QuranVideoSample, QuranVideoScript,
} from '@totalclaw/ipc-contracts';
import { t as i18nT, i18n, i18nKey, contentLangLabel, uiContentLang } from '../../i18n';
import { containsHanText } from '@totalclaw/i18n';
import { toPlain } from '../../utils/ipcPlain';

export type Lang = QuranLang;
export const LANGS: Lang[] = ['zh', 'en', 'ar'];
/** 语言名按界面语言显示（切界面语言会整页重载，模块级常量即可） */
export const LANG_LABEL: Record<Lang, string> = { zh: contentLangLabel('zh'), en: contentLangLabel('en'), ar: contentLangLabel('ar') };
export const LANG_DIR: Record<Lang, 'ltr' | 'rtl'> = { zh: 'ltr', en: 'ltr', ar: 'rtl' };

export type StepKey = 'corpus' | 'parse' | 'plan' | 'graph' | 'quiz' | 'students' | 'analysis' | 'reinforce' | 'media';
export type StepState = 'todo' | 'running' | 'done' | 'failed';
export interface StepMeta { key: StepKey; title: string; hint: string; icon: string }
export interface StepRuntime { state: StepState; error?: string; summary?: string; startedAt?: number; finishedAt?: number }


/**
 * 说明书第十九章给定的三个现场演示场景。演示就按这三条线走，不临时拼页面。
 *
 * 每张卡片把「选哪一章、哪段节范围、课程参数怎么填」一次配好，点一下直接进入该场景 ——
 * 现场讲解的人不用记「103 章要填 1–3 节、45 分钟、2 次/周」这些参数。
 *
 * autoRun 是该场景**自动跑到哪一步**为止：
 *   103 短章要的是完整闭环，所以一路跑到分析；
 *   49 / 12 两章重点是「拆结构 + 从任意节范围出题」，跑到出题即可，
 *   剩下的让演示人现场点，好证明不是录像。
 */
export interface DemoScenario {
  key: 'short' | 'structure' | 'longform';
  chapter: number;
  from: number;
  to: number;
  title: string;
  subtitle: string;
  points: string[];
  icon: string;
  plan: { level: 'beginner' | 'intermediate' | 'advanced'; sessionsPerWeek: number; sessionMinutes: number; weeks: number };
  quizCount: number;
  /** 自动跑到这一步为止（含） */
  autoRun: StepKey;
  /**
   * 进场就随机指定一段连续节范围（§19.3 场景三原文：现场只需随机指定一个连续节范围）。
   * 不这么做的话卡片给的是整章 1–111，演示人还得再点一次「快捷范围 → 随机连续」，
   * 而「随机」正是这个场景要证明的东西 —— 系统不是只对写死的几节有效。
   */
  randomRange?: boolean;
}

export function demoScenarios(): DemoScenario[] {
  return [
    {
      key: 'short', chapter: 103, from: 1, to: 3, icon: 'ri-flashlight-line',
      title: i18nT('场景一 · 短章完整闭环'),
      subtitle: i18nT('第 103 章时光章 · 3 节 · 45 分钟单课'),
      points: [
        i18nT('自动生成教学目标与 45 分钟课程结构'),
        i18nT('生成理解图'),
        i18nT('连出两套不同的 10 题练习'),
        i18nT('5 名学生得到不同结果 → 个人与共同薄弱点'),
        i18nT('生成强化教学并复测，对比前后'),
      ],
      plan: { level: 'beginner', sessionsPerWeek: 2, sessionMinutes: 45, weeks: 1 },
      quizCount: 10, autoRun: 'analysis',
    },
    {
      key: 'structure', chapter: 49, from: 1, to: 18, icon: 'ri-layout-grid-line',
      title: i18nT('场景二 · 中级内容结构'),
      subtitle: i18nT('第 49 章寝室章 · 18 节'),
      points: [
        i18nT('重点不是逐节展示，而是把 18 节拆成多个教学主题与单元'),
        i18nT('形成课程结构'),
        i18nT('可从任意指定节范围出题'),
      ],
      plan: { level: 'intermediate', sessionsPerWeek: 2, sessionMinutes: 45, weeks: 3 },
      quizCount: 10, autoRun: 'quiz',
    },
    {
      key: 'longform', chapter: 12, from: 1, to: 111, icon: 'ri-book-read-line',
      title: i18nT('场景三 · 长文本压力证明'),
      subtitle: i18nT('第 12 章优素福章 · 111 节全部导入'),
      points: [
        i18nT('111 节完整导入且可检索'),
        i18nT('现场随机指定一段连续节范围'),
        i18nT('展示内容检索、教学单元、事件与人物结构'),
        i18nT('跨节出题，证明不是只对三五节写死'),
      ],
      plan: { level: 'advanced', sessionsPerWeek: 2, sessionMinutes: 60, weeks: 6 },
      quizCount: 10, autoRun: 'quiz', randomRange: true,
    },
  ];
}

/** 抽查语料（说明书第十九章末）：演示人可临时选这两章的任一段，验证系统并非只认三个场景。 */
export const SPOT_CHECK_CHAPTERS = [55, 67];

export function stepMetas(): StepMeta[] {
  return [
    { key: 'corpus', title: i18nT('选择经文'), hint: i18nT('从固定语料包选章或节范围，逐文件核对校验值，原文冻结'), icon: 'ri-book-open-line' },
    { key: 'parse', title: i18nT('识别结构'), hint: i18nT('章 / 节 / 词汇 / 概念 / 教学单元 / 重复结构，全部可追溯'), icon: 'ri-node-tree' },
    { key: 'plan', title: i18nT('提纲与课程'), hint: i18nT('按学生水平、课次、时长、周期生成课程计划与单课计划'), icon: 'ri-calendar-schedule-line' },
    { key: 'graph', title: i18nT('理解图'), hint: i18nT('章 → 单元 → 概念 → 经文；点节点看资料、题目与 5 名学生掌握'), icon: 'ri-mind-map' },
    { key: 'quiz', title: i18nT('动态出题'), hint: i18nT('基于锁定经文与批准资料生成不同版本试卷，每题可查来源'), icon: 'ri-file-list-3-line' },
    { key: 'students', title: i18nT('5 名学生'), hint: i18nT('载入预置答题数据，任意改一个答案即重算'), icon: 'ri-group-line' },
    { key: 'analysis', title: i18nT('薄弱点分析'), hint: i18nT('个人五维成绩 + 群体共同问题（人数 / 比例 / 判定）'), icon: 'ri-bar-chart-grouped-line' },
    { key: 'reinforce', title: i18nT('强化与复测'), hint: i18nT('解释 + 复习卡 + 针对性练习 + 复测，展示前后变化'), icon: 'ri-refresh-line' },
    { key: 'media', title: i18nT('图片与视频'), hint: i18nT('知识卡片（经文为文字层）、诵读示例、视频脚本分镜与成片样例'), icon: 'ri-movie-2-line' },
  ];
}

export function useSteps(metas: StepMeta[]) {
  const runtime = reactive<Record<StepKey, StepRuntime>>(Object.fromEntries(metas.map((m) => [m.key, { state: 'todo' }])) as Record<StepKey, StepRuntime>);
  const currentKey = ref<StepKey>(metas[0].key);
  function start(key: StepKey): void {
    Object.assign(runtime[key], { state: 'running', error: undefined, summary: undefined, startedAt: Date.now(), finishedAt: undefined });
    currentKey.value = key;
    void scrollToStep(key);
  }
  /**
   * 标记这一步完成。**不自动跳下一步** —— 演示时一步跑完，讲解的人往往还要就着结果讲几句，
   * 页面自己切走会把话打断，也让人怀疑刚才那步到底出了什么。下一步什么时候进，由人点。
   */
  function done(key: StepKey, summary?: string): void {
    Object.assign(runtime[key], { state: 'done', summary, error: undefined, finishedAt: Date.now() });
  }
  function fail(key: StepKey, error: unknown): void {
    Object.assign(runtime[key], { state: 'failed', error: errorMessage(error), finishedAt: Date.now() });
    currentKey.value = key;
    void scrollToStep(key);
  }
  function reset(key: StepKey): void { Object.assign(runtime[key], { state: 'todo', error: undefined, summary: undefined }); }
  function resetAfter(key: StepKey): void {
    const idx = metas.findIndex((m) => m.key === key);
    metas.slice(idx + 1).forEach((m) => { if (runtime[m.key].state !== 'todo') reset(m.key); });
  }
  function isRunning(): boolean { return metas.some((m) => runtime[m.key].state === 'running'); }
  return { metas, runtime, currentKey, start, done, fail, reset, resetAfter, isRunning };
}
export type TeacherSteps = ReturnType<typeof useSteps>;

// ── 教师端九步状态：模块级单例 + 本机存档 ──
// 切到学生端 / 管理层时 TeacherFlow 会被卸载重建，步骤状态放在组件里就会归零（内容还在、进度全变「待做」）；
// 放到这里跨组件保留，并写进 localStorage，刷新页面后接着显示。数据本身在主进程存档里，这里只存步骤状态与当前范围。

export const TEACHER_STEPS_STORAGE_KEY = 'qt-teacher-steps-v1';
interface StepsSnapshot {
  v: 1;
  currentKey: StepKey;
  runtime: Partial<Record<StepKey, StepRuntime>>;
  selection?: Selection;
  activePaperId?: string;
  /**
   * 写这份快照时的界面语言。步骤摘要（「优素福章 1–111 · 111 节已载入」这种）是**跑的时候**
   * 按当时语言拼好的成品文本，不是 key + 参数，换语言没法就地重翻。所以记下语言戳：
   * 还原时语言不一致就丢掉摘要与错误文本、只保留步骤状态 —— 宁可少一行说明，
   * 也不要在英文 / 阿语界面上留一句中文。
   */
  lang?: Lang;
}
function readStepsSnapshot(): StepsSnapshot | null {
  try {
    const raw = localStorage.getItem(TEACHER_STEPS_STORAGE_KEY);
    const s = raw ? JSON.parse(raw) : null;
    return s && s.v === 1 && s.runtime ? s : null;
  } catch { return null; }
}
function validSelection(s: unknown): s is Selection {
  const x = s as Selection | undefined;
  return !!x && [x.chapter, x.from, x.to].every((n) => Number.isInteger(n) && n > 0) && x.from <= x.to;
}

let teacher: TeacherSteps | null = null;
export function teacherSteps(): TeacherSteps {
  if (teacher) return teacher;
  const s = useSteps(stepMetas());
  const snap = readStepsSnapshot();
  if (snap) {
    for (const m of s.metas) {
      const r = snap.runtime[m.key];
      // 刷新前还在跑的步骤已经断了，回到待做
      if (!r || r.state === 'running' || !['todo', 'done', 'failed'].includes(r.state)) continue;
      // 摘要/错误是当初那种语言的成品文本：语言变了就不还原，免得英文界面上挂着中文
      const sameLang = (snap.lang || 'zh') === state.lang;
      Object.assign(s.runtime[m.key], {
        state: r.state,
        summary: sameLang ? r.summary : undefined,
        error: sameLang ? r.error : undefined,
        startedAt: r.startedAt, finishedAt: r.finishedAt,
      });
    }
    if (s.metas.some((m) => m.key === snap.currentKey)) s.currentKey.value = snap.currentKey;
  }
  // 独立作用域：第一次在 TeacherFlow 的 setup 里创建，不能随那个组件实例卸载而停掉
  effectScope(true).run(() => watch([() => s.runtime, s.currentKey, () => state.selection, () => state.activePaperId], () => {
    const out: StepsSnapshot = { v: 1, currentKey: s.currentKey.value, runtime: JSON.parse(JSON.stringify(s.runtime)), selection: { ...state.selection }, activePaperId: state.activePaperId, lang: state.lang };
    try { localStorage.setItem(TEACHER_STEPS_STORAGE_KEY, JSON.stringify(out)); } catch { /* 存不了就只在本次会话内保留 */ }
  }, { deep: true }));
  teacher = s;
  return s;
}
/** 清空演示数据：九步全部回到待做 */
export function resetTeacherSteps(): void {
  const s = teacherSteps();
  for (const m of s.metas) s.reset(m.key);
  s.currentKey.value = s.metas[0].key;
}

/**
 * 刷新后按步骤状态把确定性内容取回来（结构识别 / 理解图 / 5 名学生答题与分析，都是按存档现算、不走模型），
 * 再把「标着完成但数据已经不在」的步骤（清空过演示数据、存档被删）放回待做。页面进入时在 syncContentLang 之前调用。
 */
export async function restoreTeacherContent(): Promise<void> {
  const s = teacherSteps();
  const st = state.status;
  if (!st) return;
  const sel = state.selection;
  const done = (k: StepKey): boolean => s.runtime[k].state === 'done';
  const isSet = (p: QuranPaper): boolean => p.kind === 'practice' || p.kind === 'exam';
  // 「教师已载入本课」看持久化的东西：步骤状态，或存档里已经有这个范围的提纲 / 试卷（学生端据此显示单元与词汇）
  const loaded = s.runtime.parse.state !== 'todo' || st.plans.some((p) => sameRange(p.request, sel)) || st.papers.some((p) => isSet(p) && sameRange(p, sel));
  if (state.corpus?.allVerified) {
    // 各块互不牵连：哪块取不回来，就按下面的检查把那一步放回待做
    try { if (loaded && !state.parse) state.parse = await api().parse({ chapter: sel.chapter, from: sel.from, to: sel.to }); } catch { /* 见下 */ }
    try { if (done('graph') && !state.graph && state.parse) state.graph = await api().graph({ chapter: sel.chapter, from: sel.from, to: sel.to, lang: state.lang }); } catch { /* 见下 */ }
    const paper = state.papers.find((p) => p.id === state.activePaperId);
    try {
      if ((done('students') || done('analysis')) && paper && !state.records.length) {
        const r = await api().analyze({ paperId: paper.id, lang: state.lang });
        state.records = r.records; state.analysis = r.analysis;
      }
    } catch { /* 见下 */ }
  }
  const has: Record<StepKey, boolean> = {
    corpus: !!state.corpus?.allVerified,
    parse: !!state.parse,
    plan: st.plans.some((p) => sameRange(p.request, sel)),
    graph: !!state.graph,
    quiz: st.papers.some((p) => isSet(p) && sameRange(p, sel)),
    students: state.records.length > 0,
    analysis: !!state.analysis,
    reinforce: st.reinforcements.length > 0,
    media: st.cards.length + st.scripts.length + st.videos.length > 0,
  };
  for (const m of s.metas) if (s.runtime[m.key].state === 'done' && !has[m.key]) s.reset(m.key);
}

export async function scrollToStep(key: string): Promise<void> {
  await nextTick();
  const el = document.querySelector<HTMLElement>(`[data-qt-step="${key}"]`);
  if (!el) return;
  try { el.scrollIntoView({ behavior: prefersReducedMotion() ? 'auto' : 'smooth', block: 'start' }); } catch { el.scrollIntoView(); }
}

export function prefersReducedMotion(): boolean {
  try { return window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch { return false; }
}

let wrapped: any = null;
let wrappedSource: any = null;
/** 桥对象拷成普通对象再包 toPlain（不能用 Proxy 套 contextBridge 对象） */
export function api(): any {
  const raw = (window as any).electronAPI?.workbenches?.quranTeaching;
  if (!raw) return raw;
  if (wrapped && wrappedSource === raw) return wrapped;
  const w: Record<string, unknown> = {};
  for (const key of Object.keys(raw)) {
    const v = raw[key];
    if (typeof v !== 'function' || key === 'onEvent') { w[key] = v; continue; }
    w[key] = (...args: unknown[]) => v(...args.map((a) => toPlain(a)));
  }
  wrapped = w; wrappedSource = raw;
  return w;
}

export function errorMessage(e: unknown): string {
  if (!e) return i18nT('未知错误');
  const raw = (e as Error)?.message || String(e);
  const cleaned = raw.replace(/^Error invoking remote method '[^']+': /, '').replace(/^Error: /, '');
  const map: Record<string, string> = {
    CORPUS_NOT_IMPORTED: i18nT('语料包尚未导入或校验未通过'),
    NO_QUESTIONS: i18nT('该范围生成不出可校验的题目，请扩大节范围'),
    RENDER_UNAVAILABLE: i18nT('离屏渲染不可用'),
    // 不写死「可展示预置样例」：随包样例可能没带或被删，界面按 state.videos 里实际有没有来说话
    FFMPEG_UNAVAILABLE: i18nT('本机没有 ffmpeg，无法现场合成；脚本与分镜照常生成，成片请看下方随包样例'),
    TTS_UNAVAILABLE: i18nT('fal 与本地语音引擎都不可用'),
    ISSUE_NOT_FOUND: i18nT('该薄弱点已不存在（数据已变化），请重新分析'),
  };
  return map[cleaned] || cleaned;
}

// ── 演示全局状态（教师端 / 学生端 / 管理层共享同一份） ──

export interface Selection { chapter: number; from: number; to: number }

/** 上次的范围与当前试卷（刷新后接着用；步骤状态见 teacherSteps） */
const lastSession = readStepsSnapshot();

export const state = reactive({
  ready: false,
  status: null as QuranStatusResponse | null,
  corpus: null as QuranCorpusStatus | null,
  students: [] as QuranStudent[],
  /** 生成内容的语言：默认跟界面语言（英文界面就出英文提纲 / 试卷 / 分析），顶栏可另选 */
  lang: uiContentLang() as Lang,
  selection: (validSelection(lastSession?.selection) ? { ...lastSession!.selection } : { chapter: 103, from: 1, to: 3 }) as Selection,
  verses: [] as QuranVerse[],
  parse: null as QuranParseResult | null,
  plan: null as QuranLessonPlan | null,
  graph: null as QuranGraph | null,
  papers: [] as QuranPaper[],
  activePaperId: lastSession?.activePaperId || '',
  records: [] as QuranAnswerRecord[],
  analysis: null as QuranAnalysis | null,
  reinforcement: null as QuranReinforcement | null,
  cards: [] as QuranMediaCard[],
  scripts: [] as QuranVideoScript[],
  videos: [] as QuranVideoSample[],
});

/** 切内容语言时后台补生成的各块（显示加载态用） */
export const langBusy = reactive({ plan: false, graph: false, analysis: false, commentary: false, reinforce: false, script: false });
/** 教师端第 9 步当前展示的视频脚本（按内容语言取） */
export const currentScript = ref<QuranVideoScript | null>(null);

let syncToken = 0;
/** 年级默认值是词典里的词：旧计划里存的是某种语言的默认值时换成当前界面语言的写法；教师自填的原样保留 */
export const DEFAULT_GRADE_KEY = i18nKey('大学一年级');
/** 早先词典里默认年级的译法（存档里的旧计划还带着它们），同样认作默认值 */
const LEGACY_GRADE_VARIANTS = ['freshman year', 'السنة الأولى'];
const gradeIn = (locale: 'en-US' | 'ar'): string => (i18n.global.getLocaleMessage(locale) as Record<string, string>)[DEFAULT_GRADE_KEY] || DEFAULT_GRADE_KEY;
function isDefaultGrade(grade: string): boolean {
  const g = grade.trim().toLowerCase();
  return [DEFAULT_GRADE_KEY, gradeIn('en-US'), gradeIn('ar'), ...LEGACY_GRADE_VARIANTS].some((v) => v.toLowerCase() === g);
}
/** 表单里显示的年级：默认值按界面语言写；教师自填的原样保留 */
export function localizedGrade(grade: string): string {
  return isDefaultGrade(grade) ? i18nT(DEFAULT_GRADE_KEY) : grade;
}
/** 传给生成的年级：默认值换成内容语言的写法（阿语提纲里不夹中文 / 英文年级）；教师自填的原样保留 */
export function contentGrade(grade: string, lang: Lang): string {
  if (!isDefaultGrade(grade)) return grade;
  return lang === 'en' ? gradeIn('en-US') : lang === 'ar' ? gradeIn('ar') : DEFAULT_GRADE_KEY;
}
const sameRange = (a: { chapter: number; from: number; to: number }, b: Selection): boolean => a.chapter === b.chapter && a.from === b.from && a.to === b.to;

/**
 * 内容语言切换（顶栏切换，或切了界面语言后重新进页）：
 * 各块先找存档里同范围、同语言的那一份，有就直接用；只有别的语言版本时按原参数重新生成
 * （提纲 / 脚本 / AI 教学解释走模型，按语言分别存档或缓存，下次切回来直接用），生成期间对应块显示加载态。
 * 连续切换时只认最后一次，前面没跑完的结果不落到界面上。
 */
export async function syncContentLang(): Promise<void> {
  const token = ++syncToken;
  const stale = (): boolean => token !== syncToken;
  const lang = state.lang;
  const sel: Selection = { ...state.selection };
  const before = {
    plan: state.plan,
    rf: state.reinforcement,
    script: currentScript.value,
    graph: !!state.graph,
    analysis: !!state.analysis,
    commentary: !!state.analysis?.commentary,
    records: state.records.length > 0,
    paper: state.papers.find((p) => p.id === state.activePaperId) || null,
  };
  await refreshStatus();
  if (stale()) return;
  const st = state.status;
  if (!st) return;
  const isSet = (p: QuranPaper): boolean => p.kind === 'practice' || p.kind === 'exam';

  // ── 先把各块换成本语言的存档（有就直接用） ──
  const rangePlans = st.plans.filter((p) => sameRange(p.request, sel));
  const planHit = rangePlans.find((p) => p.request.lang === lang);
  const planBase = rangePlans[0] || (before.plan && sameRange(before.plan.request, sel) ? before.plan : null);
  // 没有本范围的计划时沿用该语言最近一份（与原先「显示最近计划」一致）
  state.plan = planHit || st.plans.find((p) => p.request.lang === lang) || null;

  const rangeSets = st.papers.filter((p) => isSet(p) && sameRange(p, sel));
  const paperHit = rangeSets.find((p) => p.lang === lang) || null;
  const paperBase = (before.paper && isSet(before.paper) && sameRange(before.paper, sel) ? before.paper : null) || rangeSets[0] || null;
  const active = st.papers.find((p) => p.id === state.activePaperId);
  if (!active || active.lang !== lang) state.activePaperId = paperHit?.id || '';
  if (!state.activePaperId) { state.records = []; state.analysis = null; }

  const rfBase = before.rf || st.reinforcements[0] || null;
  if (!state.reinforcement || state.reinforcement.practice.lang !== lang) {
    state.reinforcement = (rfBase && st.reinforcements.find((r) => r.practice.lang === lang && r.basePaperId === rfBase.basePaperId && r.targetKey === rfBase.targetKey))
      || st.reinforcements.find((r) => r.practice.lang === lang) || null;
  }

  const scriptHit = st.scripts.find((x) => x.lang === lang && sameRange(x, sel)) || st.scripts.find((x) => x.lang === lang && x.chapter === sel.chapter) || null;
  const scriptBase = before.script || st.scripts.find((x) => sameRange(x, sel)) || null;
  currentScript.value = scriptHit;

  // ── 确定性内容（理解图 / 分析）直接按新语言重取 ──
  if (before.graph && state.parse) {
    langBusy.graph = true;
    try { const g = await api().graph({ chapter: sel.chapter, from: sel.from, to: sel.to, lang }); if (!stale()) state.graph = g; } catch { if (!stale()) state.graph = null; } finally { langBusy.graph = false; }
    if (stale()) return;
  } else state.graph = null;

  // ── 没有本语言版本的才生成 ──
  if (!planHit && planBase) {
    langBusy.plan = true;
    try { const p = await api().planGenerate({ ...planBase.request, grade: contentGrade(planBase.request.grade, lang), lang }); if (!stale()) state.plan = p; } catch { /* 留空，教师可手动生成 */ } finally { langBusy.plan = false; }
    if (stale()) return;
  }
  if (!paperHit && paperBase) {
    // 试卷是模板出题（不走模型）：按原卷的题数 / 类型出一套本语言的；原卷已经有人作答过就同样载入 5 名学生
    langBusy.analysis = true;
    try {
      const r = await api().paperGenerate({ chapter: sel.chapter, from: sel.from, to: sel.to, lang, level: planBase?.request.level || 'beginner', count: paperBase.questions.length, kind: paperBase.kind });
      if (stale()) return;
      state.activePaperId = r.paper.id;
      if (before.records || before.analysis) {
        state.records = await api().simulate({ paperId: r.paper.id });
        if (stale()) return;
      }
    } catch { /* 该范围出不了题：留空，第 5 步可手动再试 */ } finally { langBusy.analysis = false; }
    if (stale()) return;
  }
  if (state.activePaperId && (before.analysis || before.records || state.records.length)) {
    langBusy.analysis = true;
    try { const r = await api().analyze({ paperId: state.activePaperId, lang }); if (!stale()) { state.records = r.records; state.analysis = r.analysis; } } catch { /* 保留旧状态 */ } finally { langBusy.analysis = false; }
    if (stale()) return;
  }
  if (before.commentary && state.activePaperId && state.analysis && !state.analysis.commentary) {
    langBusy.commentary = true;
    try { const r = await api().analyze({ paperId: state.activePaperId, lang, commentary: true }); if (!stale()) { state.records = r.records; state.analysis = r.analysis; } } catch { /* 解释可手动重试 */ } finally { langBusy.commentary = false; }
    if (stale()) return;
  }
  if (!state.reinforcement && rfBase) {
    langBusy.reinforce = true;
    try {
      let rf: QuranReinforcement = await api().reinforce({ paperId: rfBase.basePaperId, issueKey: rfBase.targetKey, lang });
      if (rfBase.after && !stale()) rf = (await api().retest({ reinforcementId: rf.id, lang })).reinforcement;
      if (!stale()) state.reinforcement = rf;
    } catch { /* 原卷或薄弱点已不存在：留空 */ } finally { langBusy.reinforce = false; }
    if (stale()) return;
  }
  if (!scriptHit && scriptBase && sameRange(scriptBase, sel)) {
    langBusy.script = true;
    try { const x = await api().videoScript({ chapter: sel.chapter, from: sel.from, to: sel.to, lang }); if (!stale()) currentScript.value = x; } catch { /* 留空，教师可手动生成 */ } finally { langBusy.script = false; }
    if (stale()) return;
  }
  await refreshStatus();
}

export const activePaper = computed(() => state.papers.find((p) => p.id === state.activePaperId) || null);
/** 节范围：单节「3」，范围「1–3」（en dash）；带章号「103:1」「103:1–3」。与主进程 textUtils.rangeLabel 同一写法 */
export function verseRange(from: number, to: number, chapter?: number): string {
  const r = from === to ? `${from}` : `${from}–${to}`;
  return chapter === undefined ? r : `${chapter}:${r}`;
}
export const rangeLabel = (s: Selection): string => verseRange(s.from, s.to);
/** 拼进译文里的节号 / 范围：前后加 LRI…PDI 隔离，阿语句子里不会被排成「3–103:1」（模板里直接用 <bdi dir="ltr">） */
export const ltr = (s: string): string => `\u2066${s}\u2069`;
/** 题目来源这类数据里的节号（旧数据是「103:1-3」「103:1-1」）按显示写法输出 */
export function refLabel(ref: string): string {
  const m = /^(\d+):(\d+)[-–](\d+)$/.exec(ref);
  return m ? verseRange(Number(m[2]), Number(m[3]), Number(m[1])) : ref;
}
/** 时刻按界面语言显示（中文 24 小时制，不出 AM/PM） */
export function uiTime(ts: number | string | Date = Date.now()): string {
  const locale = i18n.global.locale.value;
  return new Date(ts).toLocaleTimeString(locale, locale === 'en-US' ? undefined : { hour12: false });
}

export function chapterName(chapter: number, lang: Lang = state.lang): string {
  const c = state.corpus?.chapters.find((x) => x.chapter === chapter);
  if (!c) return `${chapter}`;
  return lang === 'ar' ? c.nameAr : lang === 'en' ? c.nameEn : c.nameZh;
}

export async function refreshStatus(): Promise<void> {
  const s: QuranStatusResponse = await api().status();
  state.status = s; state.corpus = s.corpus; state.students = s.students;
  state.papers = s.papers; state.cards = s.cards; state.scripts = s.scripts; state.videos = s.videos;
  // 存档里各语言的计划 / 强化都在：只取当前内容语言那一份（没有就空着，由教师端按需重新生成）
  if (!state.plan || state.plan.request.lang !== state.lang) state.plan = s.plans.find((p) => p.request.lang === state.lang) || null;
  if (!state.reinforcement || state.reinforcement.practice.lang !== state.lang) state.reinforcement = s.reinforcements.find((r) => r.practice.lang === state.lang) || null;
  installFonts(s.fonts);
  state.ready = true;
}

/** 内置经文字体（Amiri Quran / Amiri，OFL）：经 totalclaw-media:// 注入 @font-face，只装一次 */
let fontsInstalled = false;
export function installFonts(fonts?: { quran: string; text: string }): void {
  if (fontsInstalled || !fonts?.quran) return;
  try {
    const style = document.createElement('style');
    style.setAttribute('data-qt-fonts', '1');
    style.textContent = `@font-face{font-family:"Amiri Quran";src:url("${fonts.quran}") format("truetype");font-display:swap}@font-face{font-family:"Amiri";src:url("${fonts.text}") format("truetype");font-display:swap}`;
    document.head.appendChild(style);
    fontsInstalled = true;
  } catch { /* 字体缺失时回落系统阿文字体 */ }
}

/** 学生头像上的短代号：中文用「甲乙丙」，英 / 阿用名字里的字母（Student A → A，الطالب أ → أ） */
export function studentBadge(s: QuranStudent, lang: Lang = state.lang): string {
  if (lang === 'zh') return s.code;
  return s.name[lang]?.trim().split(/\s+/).pop() || s.code;
}

/** 卡片是哪种语言生成的：新数据带 lang；旧数据按标题文字推断 */
export function cardLang(c: QuranMediaCard): Lang {
  if (c.lang) return c.lang;
  return /[\u0600-\u06ff]/.test(c.title) ? 'ar' : containsHanText(c.title) ? 'zh' : 'en';
}

/** 主进程进度事件的阶段名 → 界面文案 */
export function stageLabel(stage: string): string {
  const m: Record<string, string> = { fal: i18nT('生成背景'), render: i18nT('渲染卡片'), frame: i18nT('渲染分镜'), concat: i18nT('合成视频') };
  return m[stage] || stage;
}

export function studentName(id: string, lang: Lang = state.lang): string {
  const s = state.students.find((x) => x.id === id);
  return s ? s.name[lang] : id;
}

export const DIM_ORDER: QuranDimension[] = ['memory', 'order', 'vocabulary', 'comprehension', 'concept'];
export function dimLabel(d: QuranDimension): string {
  const m: Record<QuranDimension, string> = { memory: i18nT('记忆与识别'), order: i18nT('顺序'), vocabulary: i18nT('词汇'), comprehension: i18nT('理解'), concept: i18nT('概念掌握') };
  return m[d];
}
export function typeLabel(t: QuranQuestion['type']): string {
  const m: Record<QuranQuestion['type'], string> = { mcq: i18nT('选择题'), fill: i18nT('填空'), order: i18nT('顺序排列'), match: i18nT('匹配'), concept: i18nT('概念关系') };
  return m[t];
}
export function difficultyLabel(d: 1 | 2 | 3): string {
  return d === 1 ? i18nT('一级 · 记忆与识别') : d === 2 ? i18nT('二级 · 理解') : i18nT('三级 · 综合理解');
}
export function verdictLabel(v: 'common' | 'hint' | 'individual'): string {
  return v === 'common' ? i18nT('群体共同薄弱点') : v === 'hint' ? i18nT('提示增加复习') : i18nT('个人问题');
}
export function classLabel(c: string): string {
  const m: Record<string, string> = { memory: i18nT('记忆问题'), vocabulary: i18nT('词汇问题'), concept: i18nT('概念理解问题'), order: i18nT('顺序问题'), question_type: i18nT('题型问题'), coverage_gap: i18nT('教学材料覆盖不足') };
  return m[c] || c;
}
export function kindLabel(k: string): string {
  const m: Record<string, string> = { vocab: i18nT('词汇卡'), concept_map: i18nT('概念图'), timeline: i18nT('事件时间线'), review: i18nT('复习卡'), structure: i18nT('章节结构图') };
  return m[k] || k;
}
export function tierLabel(t: 1 | 2 | 3): string {
  return t === 1 ? i18nT('一级 · 基础') : t === 2 ? i18nT('二级 · 中级') : i18nT('三级 · 高级');
}

export function pctClass(p: number): string { return p >= 80 ? 'ok' : p >= 60 ? 'mid' : 'bad'; }

export { openPath } from '../service-settlement/shared';
