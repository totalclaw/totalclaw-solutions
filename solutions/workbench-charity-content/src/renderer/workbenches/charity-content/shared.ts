/**
 * 慈善活动内容工场 · 渲染层共享：preload 访问器（toPlain 防 Proxy 克隆错）、步骤状态机、语言、一键流程决策。
 */
import { reactive, ref, nextTick, watch, type Ref } from 'vue';
import type {
  CharityArchive, CharityLang, CharityProgressEvent, CharityReport, CharityTri, CharityTtsItem, CharityVideoItem, CharityVideoMode, CharityVideoPhase, CharityVoiceGender,
} from '@totalclaw/ipc-contracts';
import { t as i18nT, contentLangLabel, uiContentLang } from '../../i18n';
import { CHARITY_PROMPT_MAX, DEFAULT_CONTENT_PROMPT, DEFAULT_VIDEO_PROMPT } from '../../../shared/charityPrompts';
import { toPlain } from '../../utils/ipcPlain';
import type { StepKind } from '../../composables/useStepWatchdog';

export type Lang = CharityLang;
export const LANGS: Lang[] = ['zh', 'en', 'ar'];
/** 语言名按界面语言显示（切界面语言会整页重载，模块级常量即可） */
export const LANG_LABEL: Record<Lang, string> = { zh: contentLangLabel('zh'), en: contentLangLabel('en'), ar: contentLangLabel('ar') };
export const LANG_DIR: Record<Lang, 'ltr' | 'rtl'> = { zh: 'ltr', en: 'ltr', ar: 'rtl' };

export type StepKey = 'material' | 'report' | 'speech' | 'video' | 'publish';
export type StepState = 'todo' | 'running' | 'done' | 'failed';
export interface StepMeta { key: StepKey; title: string; hint: string; icon: string }
export interface StepRuntime {
  state: StepState;
  error?: string;
  summary?: string;
  startedAt?: number;
  finishedAt?: number;
  /**
   * 看门狗用（composables/useStepWatchdog）：progressAt = 最近一次收到主进程进度事件的时刻；
   * kind / estimateSec = 步骤类型与预计秒数（start() 按 STEP_WATCHDOG 自动填），决定「多久算超时」。
   */
  progressAt?: number;
  kind?: StepKind;
  estimateSec?: number;
  /**
   * 本步第几轮运行。「可能已超时 → 重新生成」会先取消旧任务再起新一轮：旧任务那个还挂着的
   * await 之后会以「已取消」收尾，不能让它把新一轮盖成失败。done / fail 传了 gen 就只认当前这轮。
   */
  gen?: number;
}

/** 各步骤的看门狗参数：预计秒数按实测标定（报告 ≈ 2 分钟、配音 ≈ 1 分钟、成片 ≈ 5 分钟），不是拍脑袋 */
export const STEP_WATCHDOG: Record<StepKey, { kind: StepKind; estimateSec?: number }> = {
  material: { kind: 'scan' },
  report: { kind: 'llm', estimateSec: 120 },
  speech: { kind: 'tts', estimateSec: 60 },
  video: { kind: 'video', estimateSec: 300 },
  publish: { kind: 'publish' },
};

/**
 * 两条互不依赖的制作线（需求原文的第 1 条与第 2 条）：
 *   event   活动记录与宣传材料：现场照片/视频 → 自动整理 → 报告 PDF + 海报 → 宣传短视频
 *   article 文章转语音：文字稿（粘贴 / PDF / 报告摘要）→ 三语配音 → 宣传短视频（AI 生成画面）
 *
 * 之所以拆开：机构只想给一篇项目说明配个音出条视频时，不该被迫先传一堆现场素材、先出报告。
 * 两条线最后都落到「宣传短视频」，但喂给出片引擎的东西不同 —— event 喂素材 + 报告，
 * article 没有现场素材，画面走 AI 生成。
 */
export type LineKey = 'event' | 'article';
export interface LineMeta { key: LineKey; title: string; hint: string; icon: string }

export function lineMetas(): LineMeta[] {
  return [
    { key: 'event', title: i18nT('活动记录与宣传材料'), hint: i18nT('上传现场照片与视频，自动整理成报告、海报与宣传短视频'), icon: 'ri-camera-3-line' },
    { key: 'article', title: i18nT('文章转语音'), hint: i18nT('文章 / 活动介绍 / 项目说明转三语配音，再出一条宣传短视频'), icon: 'ri-mic-2-line' },
  ];
}

/**
 * 步骤描述**必须在函数里现算**，不能提成模块级常量：
 * i18nT() 在模块加载那一刻就把当时语言的文案定死了，之后切界面语言不会重算，
 * 英文 / 阿语界面上会挂着中文（solutionsI18n 守卫就是抓这个的）。
 */
function stepLibrary(): Record<StepKey, Omit<StepMeta, 'key'>> {
  return {
    material: { title: i18nT('上传素材'), hint: i18nT('拖入照片 / 视频 / PDF，视觉模型自动起草活动档案'), icon: 'ri-image-add-line' },
    report: { title: i18nT('整理与报告'), hint: i18nT('逐图与视频抽帧描述 → 三语报告 PDF + 9:16 海报'), icon: 'ri-file-text-line' },
    speech: { title: i18nT('文章转语音'), hint: i18nT('粘贴文字 / 导入 PDF / 取报告摘要 → 中英阿三语高保真配音'), icon: 'ri-mic-line' },
    video: { title: i18nT('宣传短视频'), hint: i18nT('9:16 竖版：字幕 + 配音 + 配乐，一键成片'), icon: 'ri-film-line' },
    publish: { title: i18nT('多平台发布'), hint: i18nT('选平台与文案 → 内置浏览器登录 → 分平台上传，登录确认后自动发布'), icon: 'ri-send-plane-line' },
  };
}

/**
 * 某条线上的步骤顺序。两条线各自完整、互不干扰。
 *
 * event 保留「一站式」全链（需求第 4 条）：素材 → 报告 → 配音 → 成片，中间产物层层往下传。
 * article 只有两步：机构想给一篇项目说明配个音出条视频时，不该被迫先传一堆现场照片、先出报告
 * —— 这正是两条线要隔离的理由。它的画面没有现场素材可用，走 AI 生成。
 */
export function stepMetas(line: LineKey = 'event'): StepMeta[] {
  const keys: StepKey[] = line === 'article'
    ? ['speech', 'video', 'publish']
    : ['material', 'report', 'speech', 'video', 'publish'];
  const lib = stepLibrary();
  return keys.map((key) => ({ key, ...lib[key] }));
}

export function useSteps(metas: StepMeta[]) {
  const runtime = reactive<Record<StepKey, StepRuntime>>(Object.fromEntries(metas.map((m) => [m.key, { state: 'todo' }])) as Record<StepKey, StepRuntime>);
  const currentKey = ref<StepKey>(metas[0].key);
  /** 开始一轮；返回本轮的 gen，done / fail 带上它就不会被上一轮迟到的结果盖掉 */
  function start(key: StepKey): number {
    const gen = (runtime[key].gen || 0) + 1;
    Object.assign(runtime[key], {
      state: 'running', error: undefined, summary: undefined, startedAt: Date.now(), finishedAt: undefined, progressAt: undefined, gen,
      kind: STEP_WATCHDOG[key]?.kind, estimateSec: STEP_WATCHDOG[key]?.estimateSec,
    });
    currentKey.value = key;
    void scrollToStep(key);
    return gen;
  }
  /** 传了 gen 且已不是当前这轮（用户已「重新生成」）→ 这是上一轮迟到的收尾，忽略 */
  function stale(key: StepKey, gen?: number): boolean {
    return typeof gen === 'number' && (runtime[key].gen || 0) !== gen;
  }
  function done(key: StepKey, summary?: string, gen?: number): void {
    if (stale(key, gen)) return;
    Object.assign(runtime[key], { state: 'done', summary, error: undefined, finishedAt: Date.now() });
    const idx = metas.findIndex((m) => m.key === key);
    if (metas[idx + 1]) currentKey.value = metas[idx + 1].key;
  }
  function fail(key: StepKey, error: unknown, gen?: number): void {
    if (stale(key, gen)) return;
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
  /** 主进程推来一条进度 = 正在跑的那一步有心跳（看门狗据此不判超时） */
  function heartbeat(at = Date.now()): void {
    for (const m of metas) if (runtime[m.key].state === 'running') runtime[m.key].progressAt = at;
  }
  return { metas, runtime, currentKey, start, done, fail, reset, resetAfter, isRunning, heartbeat };
}

export async function scrollToStep(key: string): Promise<void> {
  await nextTick();
  const el = document.querySelector<HTMLElement>(`[data-cc-step="${key}"]`);
  if (!el) return;
  try { el.scrollIntoView({ behavior: prefersReducedMotion() ? 'auto' : 'smooth', block: 'start' }); } catch { el.scrollIntoView(); }
}

export function prefersReducedMotion(): boolean {
  try { return window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch { return false; }
}

/** 桥对象拷成普通对象再包 toPlain（不能用 Proxy 套 contextBridge 对象：属性 non-configurable 会抛 TypeError） */
let wrapped: any = null;
let wrappedSource: any = null;
export function api(): any {
  const raw = (window as any).electronAPI?.workbenches?.charityContent;
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

export function solutionApi(): any { return (window as any).electronAPI?.solution; }

export function errorMessage(e: unknown): string {
  if (!e) return i18nT('未知错误');
  const raw = (e as Error)?.message || String(e);
  return raw.replace(/^Error invoking remote method '[^']+': /, '').replace(/^Error: /, '');
}

export { openPath } from '../service-settlement/shared';

export async function saveAs(path: string, suggestedName?: string): Promise<boolean> {
  const r = await api()?.saveAs({ path, suggestedName });
  if (r && r.ok === false && !r.cancelled) throw new Error(r.error || i18nT('保存失败'));
  return !!r?.ok;
}

/** 拖拽进来的 File → 本机路径（Electron 32+ 没有 file.path） */
export function droppedPaths(ev: DragEvent): string[] {
  const files = Array.from(ev.dataTransfer?.files || []);
  const getPath = (window as any).electronAPI?.getPathForFile as ((f: File) => string) | undefined;
  return files.map((f) => (getPath ? getPath(f) : (f as any).path || '')).filter(Boolean);
}

/** 插进翻译句子里的路径 / 数字：用 Unicode 方向隔离符（等同 <bdi dir="ltr">）包住，阿语 RTL 句子里不被打乱、也不影响周围文字 */
export function ltrIsolate(s: string): string {
  return s ? `\u2066${s}\u2069` : s;
}

export function fmtSize(n: number): string {
  if (!n) return '';
  if (n < 1024 * 1024) return `${Math.round(n / 1024)} KB`;
  return `${(n / 1024 / 1024).toFixed(1)} MB`;
}
export function fmtDur(sec?: number): string {
  if (!sec) return '';
  const s = Math.round(sec);
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}
export function fmtRunTime(runId: string): string {
  const m = runId.match(/^(\d{4})(\d{2})(\d{2})-(\d{2})(\d{2})(\d{2})$/);
  if (!m) return runId;
  return `${m[1]}-${m[2]}-${m[3]} ${m[4]}:${m[5]}`;
}

export function emptyTri(): CharityTri { return { zh: '', en: '', ar: '' }; }

export function blankArchive(): CharityArchive {
  return { orgName: emptyTri(), eventName: emptyTri(), date: '', location: emptyTri(), participants: null, donation: '', organizer: emptyTri(), summary: emptyTri(), source: 'manual' };
}

/** 档案是否够用（机构名 + 活动名至少中文有值） */
export function archiveReady(a: CharityArchive | null): boolean {
  return !!a && !!(a.orgName.zh || a.orgName.en) && !!(a.eventName.zh || a.eventName.en);
}

export function summaryTextOf(report: CharityReport | null): Partial<CharityTri> {
  if (!report) return {};
  return { zh: report.zh.summary, en: report.en.summary, ar: report.ar.summary };
}

export type SpeechItems = Partial<Record<Lang, CharityTtsItem>>;
export type VideoItems = Partial<Record<Lang, CharityVideoItem>>;

/** 一键流程的每步结果如何被采纳：真跑成功优先；带 fallback 标记的也算成功（界面不区分），只记 console */
export function acceptStepResult<T extends { ok: boolean; error?: string; fallback?: boolean }>(step: string, r: T | null | undefined): T {
  if (!r || !r.ok) throw new Error(r?.error || i18nT('{step} 失败', { step }));
  if (r.fallback) console.info(`[charity-content] ${step}: prebaked fallback used`);
  return r;
}

export type VoiceGender = CharityVoiceGender;
export type VoiceOption = { id: string; label: string };
/**
 * fal MiniMax speech-02-hd 系统音色（均经 fal 实测存在），三语 × 女声 / 男声各列几款，每组第一项即该组默认。
 * 阿语女声 Calm_Woman 是通用音色，主进程自动带 language_boost=Arabic；阿语男声 Arabic_FriendlyGuy 是原生阿语音色（用户试听选定）。
 *
 * 写成函数而不是模块级常量：常量里的 i18nT() 在模块加载那一刻就求值了，之后切界面语言
 * 这些音色名会一直停在最初那一种（本仓库踩过一次，见 solutionsI18n 守卫）。
 */
export function HD_VOICES(): Record<Lang, Record<VoiceGender, VoiceOption[]>> {
  return {
  zh: {
    female: [
      { id: 'Wise_Woman', label: i18nT('知性女声 · Wise Woman') },
      { id: 'Calm_Woman', label: i18nT('沉静女声 · Calm Woman') },
    ],
    male: [
      { id: 'Chinese (Mandarin)_Reliable_Executive', label: i18nT('稳重男声 · Reliable Executive') },
      { id: 'Elegant_Man', label: i18nT('儒雅男声 · Elegant Man') },
      { id: 'Deep_Voice_Man', label: i18nT('低沉男声 · Deep Voice Man') },
    ],
  },
  en: {
    female: [
      { id: 'Calm_Woman', label: 'Calm Woman' },
      { id: 'Wise_Woman', label: 'Wise Woman' },
      { id: 'Friendly_Person', label: 'Friendly Person' },
    ],
    male: [
      { id: 'English_Trustworth_Man', label: 'Trustworthy Man' },
      { id: 'Patient_Man', label: 'Patient Man' },
    ],
  },
  ar: {
    female: [
      { id: 'Calm_Woman', label: 'صوت أنثوي رزين · Calm Woman' },
      { id: 'Wise_Woman', label: 'صوت أنثوي هادئ · Wise Woman' },
    ],
    male: [
      { id: 'Arabic_FriendlyGuy', label: 'صوت رجالي ودود · Arabic Friendly Guy' },
      { id: 'Deep_Voice_Man', label: 'صوت رجالي عميق · Deep Voice Man' },
    ],
  },
  };
}

/** 某一性别下三语的默认音色（每组第一项） */
export function defaultVoices(gender: VoiceGender): Record<Lang, string> {
  const v = HD_VOICES();
  return { zh: v.zh[gender][0].id, en: v.en[gender][0].id, ar: v.ar[gender][0].id };
}
/** 备用（fal 不可用时）：edge-tts 音色，界面不再作为并列选项，只在回落结果里显示名字 */
export const EDGE_VOICES: Record<Lang, Array<{ id: string; label: string }>> = {
  zh: [{ id: 'zh-CN-XiaoxiaoNeural', label: i18nT('晓晓（女）') }],
  en: [{ id: 'en-US-AriaNeural', label: 'Aria (F)' }],
  ar: [{ id: 'ar-AE-FatimaNeural', label: 'فاطمة (الإمارات)' }],
};

/** 第 4 步阶段计划（与主进程 pipeline 的 AI_PLAN / CLIP_PLAN 一致；收到第一条进度事件后以事件里的 plan 为准） */
export const VIDEO_PLAN: Record<CharityVideoMode, CharityVideoPhase[]> = {
  ai: ['upload', 'shots', 'edit', 'music', 'compose'],
  clip: ['edit', 'music', 'compose'],
};
export function videoPhaseLabel(p: CharityVideoPhase, langCount = 3): string {
  switch (p) {
    case 'upload': return i18nT('上传素材');
    case 'shots': return i18nT('动态镜头');
    case 'edit': return i18nT('剪辑串联');
    case 'music': return i18nT('配乐');
    default: return langCount === 3 ? i18nT('三语合成') : i18nT('多语合成');
  }
}

/**
 * 按真实阶段折算进度：已走完的阶段数 + 当前阶段内的计数（镜头 i/N、合成 k/3），除以阶段总数。
 * 事件不带阶段（前三步）时返回 null，调用方按 done/total 算。
 */
export function phaseFraction(ev: CharityProgressEvent | null | undefined): number | null {
  if (!ev?.plan?.length || !ev.phase) return null;
  const i = ev.plan.indexOf(ev.phase);
  if (i < 0) return null;
  const inner = ev.total > 0 ? Math.min(1, Math.max(0, ev.done / ev.total)) : 0;
  return Math.min(1, (i + inner) / ev.plan.length);
}

// ── 两个提示词：按界面语言预填默认（实际内容，不是占位），本会话内刷新不丢（sessionStorage），可一键恢复默认 ──

export const PROMPT_STORAGE_KEY = { content: 'charity-content.contentPrompt', video: 'charity-content.videoPrompt' } as const;
export type PromptKind = keyof typeof PROMPT_STORAGE_KEY;

/** 默认提示词（跟界面语言走：中文界面预填中文那份，英 / 阿界面预填对应语言） */
export function defaultPrompt(kind: PromptKind, lang: Lang = uiContentLang()): string {
  return (kind === 'content' ? DEFAULT_CONTENT_PROMPT : DEFAULT_VIDEO_PROMPT)[lang];
}

function sessionStore(): Storage | null {
  try { return typeof sessionStorage === 'undefined' ? null : sessionStorage; } catch { return null; }
}

/** 本会话持久化的提示词：有存的就用存的（包括用户清空后的空串），没存过就用默认 */
export function usePersistedPrompt(kind: PromptKind, def = defaultPrompt(kind)): { value: Ref<string>; defaultValue: string; reset: () => void } {
  const key = PROMPT_STORAGE_KEY[kind];
  let initial = def;
  try { const v = sessionStore()?.getItem(key); if (v !== null && v !== undefined) initial = v.slice(0, CHARITY_PROMPT_MAX); } catch { /* 读不到按默认 */ }
  const value = ref(initial);
  watch(value, (v) => { try { sessionStore()?.setItem(key, v); } catch { /* 存不了只是刷新后回到默认 */ } });
  return { value, defaultValue: def, reset: () => { value.value = def; } };
}

/**
 * 判断一段文字是哪种语言（中 / 英 / 阿）。阿拉伯字母与汉字各数一遍，谁多算谁，都没有按英文。
 * 与主进程 detectCharityLang 是同一套判据 —— 两边判得不一样，界面说「要转译」而后端说
 * 「同语言原样返回」就对不上了。
 */
export function detectLang(text: string): Lang {
  const ar = (text.match(/[؀-ۿ]/g) || []).length;
  const zh = (text.match(/\p{Script=Han}/gu) || []).length;
  return ar > 0 && ar >= zh ? 'ar' : zh > 0 ? 'zh' : 'en';
}
