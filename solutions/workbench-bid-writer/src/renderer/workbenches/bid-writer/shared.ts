/**
 * 标书制作智能体 · 渲染层共享：preload 访问器、六步状态机、项目读写、格式化。
 *
 * 状态放在模块级单例里（进入页面 load 一次，改动防抖落盘），六个步骤组件都从这里拿，
 * 不互相 import —— 改一个步骤不会牵动另一个。
 */
import { computed, nextTick, reactive, ref } from 'vue';
import type {
  BidWriterCompanyField, BidWriterComplianceItem, BidWriterEvent, BidWriterProject,
  BidWriterRequirement, BidWriterSection, BidWriterState,
} from '@totalclaw/ipc-contracts';
import { t as i18nT } from '../../i18n';
import { useNotificationStore } from '../../stores/notification';
import { toPlain } from '../../utils/ipcPlain';

export type StepKey = 'project' | 'notice' | 'template' | 'company' | 'compose' | 'review';
export type StepState = 'todo' | 'running' | 'done' | 'failed';
export interface StepMeta { key: StepKey; title: string; hint: string; icon: string }
/** startedAt = 这一步真实开始时刻（进度条的已耗时从它算，换 tab / 重挂载不归零）；不持久化，恢复时 running 本就回到 todo */
export interface StepRuntime { state: StepState; error?: string; summary?: string; startedAt?: number }

export function stepMetas(): StepMeta[] {
  return [
    { key: 'project', title: i18nT('项目与投标目标'), hint: i18nT('项目名称、投标人、你想靠什么赢下这一标'), icon: 'ri-flag-line' },
    { key: 'notice', title: i18nT('招标公告'), hint: i18nT('填目标投标网站地址自动抓取，或上传招标文件；抽成逐条要求'), icon: 'ri-global-line' },
    { key: 'template', title: i18nT('标书模板'), hint: i18nT('上传模板解析章节；不上传就从知识库里找，或用内置标准大纲'), icon: 'ri-file-copy-2-line' },
    { key: 'company', title: i18nT('公司资料与资格自检'), hint: i18nT('从知识库取公司信息，逐条核对资格门槛'), icon: 'ri-building-2-line' },
    { key: 'compose', title: i18nT('逐章成文'), hint: i18nT('按大纲一章一章写，每章可单独重写与编辑'), icon: 'ri-quill-pen-line' },
    { key: 'review', title: i18nT('自检与导出'), hint: i18nT('废标风险自检；通过后导出 Word / PDF 正式件'), icon: 'ri-shield-check-line' },
  ];
}

/** 桥对象拷成普通对象再包 toPlain（不能用 Proxy 套 contextBridge 对象：属性 non-configurable 会抛 TypeError） */
let wrapped: any = null;
let wrappedSource: any = null;
export function api(): any {
  const raw = (window as any).electronAPI?.workbenches?.bidWriter;
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
  return String((e as Error)?.message || e)
    .replace(/^Error invoking remote method '[^']+': /, '')
    .replace(/^Error: /, '');
}

export function newProject(name: string, bidder: string): BidWriterProject {
  const now = Date.now();
  return {
    id: `bid_${now.toString(36)}_${Math.random().toString(36).slice(2, 6)}`,
    name: name || i18nT('未命名投标项目'),
    createdAt: now,
    updatedAt: now,
    lang: 'zh-CN',
    goal: '',
    strategies: [],
    bidder,
    siteUrl: '',
    notice: { requirements: [] },
    template: null,
    sections: [],
    company: [],
    qualifications: [],
    compliance: [],
    exports: [],
    stepState: {},
  };
}

// ─── 模块级单例状态 ──────────────────────────────────────────────────

const metas = stepMetas();
const runtime = reactive<Record<StepKey, StepRuntime>>(
  Object.fromEntries(metas.map((m) => [m.key, { state: 'todo' as StepState }])) as Record<StepKey, StepRuntime>,
);
const currentKey = ref<StepKey>('project');
const state = ref<BidWriterState>({ version: 1, projects: [], currentId: '' });
const llmReady = ref(false);
const defaultBidder = ref('');
const docRoot = ref('');
const defaultDocRoot = ref('');
const knowledge = ref<{ docCount: number; builtCount: number; factCount: number; companyName?: string; nearestName?: { label: string; value: string } }>(
  { docCount: 0, builtCount: 0, factCount: 0 },
);
const loaded = ref(false);
const live = ref<{ message: string; done: number; total: number } | null>(null);

let saveTimer: number | null = null;

export function useBidWriter() {
  const project = computed<BidWriterProject | null>(
    () => state.value.projects.find((p) => p.id === state.value.currentId) || null,
  );

  function stepSet(key: StepKey, patch: Partial<StepRuntime>): void {
    Object.assign(runtime[key], patch);
  }
  function start(key: StepKey): void {
    stepSet(key, { state: 'running', error: undefined, startedAt: Date.now() });
    currentKey.value = key;
    void scrollToStep(key);
  }
  function done(key: StepKey, summary?: string): void {
    stepSet(key, { state: 'done', summary, error: undefined });
    const idx = metas.findIndex((m) => m.key === key);
    if (metas[idx + 1]) currentKey.value = metas[idx + 1].key;
    persistStepState();
  }
  function fail(key: StepKey, error: unknown): void {
    stepSet(key, { state: 'failed', error: errorMessage(error) });
    currentKey.value = key;
    void scrollToStep(key);
    persistStepState();
  }
  function reset(key: StepKey): void { stepSet(key, { state: 'todo', error: undefined, summary: undefined }); }
  /** 前面重跑了，后面的结论就不再可信 —— 全部打回待做 */
  function resetAfter(key: StepKey): void {
    const idx = metas.findIndex((m) => m.key === key);
    metas.slice(idx + 1).forEach((m) => { if (runtime[m.key].state !== 'todo') reset(m.key); });
  }
  function isRunning(): boolean { return metas.some((m) => runtime[m.key].state === 'running'); }

  /** 步骤状态跟着项目走：切项目要能看到上次做到哪 */
  function persistStepState(): void {
    const p = project.value;
    if (!p) return;
    p.stepState = Object.fromEntries(metas.map((m) => [m.key, { ...runtime[m.key] }]));
    save();
  }
  function restoreStepState(): void {
    const p = project.value;
    for (const m of metas) {
      const saved = p?.stepState?.[m.key];
      Object.assign(runtime[m.key], saved
        ? { state: saved.state === 'running' ? 'todo' : saved.state, summary: saved.summary, error: saved.error, startedAt: undefined }
        : { state: 'todo', summary: undefined, error: undefined, startedAt: undefined });
    }
    currentKey.value = (metas.find((m) => runtime[m.key].state !== 'done')?.key) || 'review';
  }

  async function load(): Promise<void> {
    const bridge = api();
    if (!bridge?.stateGet) throw new Error(i18nT('当前环境不支持标书工作台'));
    const r = await bridge.stateGet();
    state.value = r?.state?.projects ? r.state : { version: 1, projects: [], currentId: '' };
    llmReady.value = Boolean(r?.llmReady);
    defaultBidder.value = String(r?.defaultBidder || '');
    docRoot.value = String(r?.docRoot || '');
    defaultDocRoot.value = String(r?.defaultDocRoot || '');
    knowledge.value = r?.knowledge || { docCount: 0, builtCount: 0, factCount: 0 };
    if (!state.value.projects.length) {
      const p = newProject(i18nT('未命名投标项目'), defaultBidder.value);
      state.value.projects.push(p);
      state.value.currentId = p.id;
    } else if (!state.value.projects.some((p) => p.id === state.value.currentId)) {
      state.value.currentId = state.value.projects[0].id;
    }
    // 老项目建的时候知识库可能还没导资料：投标人为空就现在补上，别让用户对着
    // 「从知识库自动带出」的占位符发呆（用户实测反馈）
    const current = state.value.projects.find((p) => p.id === state.value.currentId);
    if (current && !String(current.bidder || '').trim() && defaultBidder.value) {
      current.bidder = defaultBidder.value;
      save();
    }
    loaded.value = true;
    restoreStepState();
  }

  /** 重新问一次知识库（用户刚去导完资料回来点「从知识库带出」） */
  async function refreshKnowledge(): Promise<{ companyName: string; docCount: number; builtCount: number; factCount: number }> {
    const bridge = api();
    const r = await bridge.stateGet();
    defaultBidder.value = String(r?.defaultBidder || '');
    knowledge.value = r?.knowledge || { docCount: 0, builtCount: 0, factCount: 0 };
    docRoot.value = String(r?.docRoot || docRoot.value);
    defaultDocRoot.value = String(r?.defaultDocRoot || defaultDocRoot.value);
    return { companyName: defaultBidder.value, ...knowledge.value };
  }

  /** 换标书存放位置：只影响以后导出的文件 */
  async function pickDocRoot(): Promise<{ ok: boolean; error?: string }> {
    const bridge = api();
    const r = await bridge.pickRoot();
    if (r?.docRoot) docRoot.value = String(r.docRoot);
    if (r?.defaultDocRoot) defaultDocRoot.value = String(r.defaultDocRoot);
    return { ok: Boolean(r?.ok), error: r?.error };
  }

  async function resetDocRoot(): Promise<void> {
    const bridge = api();
    const r = await bridge.setRoot({ path: '' });
    if (r?.docRoot) docRoot.value = String(r.docRoot);
  }

  /** 防抖落盘：正文编辑时每敲一个字就写盘没必要 */
  function save(): void {
    const p = project.value;
    if (p) p.updatedAt = Date.now();
    if (saveTimer) window.clearTimeout(saveTimer);
    saveTimer = window.setTimeout(() => {
      saveTimer = null;
      void saveNow().catch((error) => useNotificationStore().error(errorMessage(error)));
    }, 600);
  }

  async function saveNow(): Promise<void> {
    if (saveTimer) { window.clearTimeout(saveTimer); saveTimer = null; }
    const bridge = api();
    if (!bridge?.stateSave) throw new Error(i18nT('标书保存接口不可用'));
    const result = await bridge.stateSave({ state: state.value });
    if (!result?.ok) throw new Error(result?.error || i18nT('标书保存失败'));
  }

  function createProject(name: string): void {
    const p = newProject(name, defaultBidder.value);
    state.value.projects.unshift(p);
    state.value.currentId = p.id;
    restoreStepState();
    save();
  }
  function switchProject(id: string): void {
    state.value.currentId = id;
    restoreStepState();
    save();
  }
  function removeProject(id: string): void {
    state.value.projects = state.value.projects.filter((p) => p.id !== id);
    if (!state.value.projects.length) createProject(i18nT('未命名投标项目'));
    else if (state.value.currentId === id) switchProject(state.value.projects[0].id);
    save();
  }

  return {
    metas, runtime, currentKey, state, project, llmReady, defaultBidder, loaded, live,
    docRoot, defaultDocRoot, knowledge,
    start, done, fail, reset, resetAfter, isRunning, persistStepState, restoreStepState,
    load, save, saveNow, createProject, switchProject, removeProject,
    refreshKnowledge, pickDocRoot, resetDocRoot,
  };
}

export async function scrollToStep(key: string): Promise<void> {
  await nextTick();
  const el = document.querySelector<HTMLElement>(`[data-bw-step="${key}"]`);
  if (!el) return;
  try { el.scrollIntoView({ behavior: 'smooth', block: 'start' }); } catch { el.scrollIntoView(); }
}

/** 主进程推来的真实进度（抓取 / 抽取 / 成文 / 导出） */
export function bindEvents(onEvent: (e: BidWriterEvent) => void): () => void {
  const bridge = api();
  if (!bridge?.onEvent) return () => { /* 无桥 */ };
  return bridge.onEvent(onEvent) || (() => { /* 取消订阅由 preload 返回 */ });
}

// ─── 展示辅助 ────────────────────────────────────────────────────────

export function requirementKindLabel(kind: string): string {
  switch (kind) {
    case 'qualification': return i18nT('资格要求');
    case 'scoring': return i18nT('评分办法');
    case 'deliverable': return i18nT('必交材料');
    case 'technical': return i18nT('技术需求');
    case 'commercial': return i18nT('商务条款');
    case 'format': return i18nT('格式要求');
    default: return kind;
  }
}

export function verdictLabel(v: string): string {
  switch (v) {
    case 'met': return i18nT('满足');
    case 'unmet': return i18nT('不满足');
    default: return i18nT('待确认');
  }
}

export function levelLabel(level: BidWriterComplianceItem['level']): string {
  switch (level) {
    case 'blocker': return i18nT('阻断');
    case 'warning': return i18nT('提醒');
    default: return i18nT('通过');
  }
}

export function sectionStateLabel(s: BidWriterSection['state']): string {
  switch (s) {
    case 'running': return i18nT('生成中');
    case 'done': return i18nT('已完成');
    case 'failed': return i18nT('失败');
    default: return i18nT('待生成');
  }
}

export function fmtDateTime(ms?: number): string {
  if (!ms) return '';
  const d = new Date(ms);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

/** 投标目标的常用侧重（多选，直接进写作提示词） */
export function strategyOptions(): Array<{ key: string; label: string }> {
  return [
    { key: 'price', label: i18nT('价格有竞争力') },
    { key: 'tech', label: i18nT('技术方案领先') },
    { key: 'delivery', label: i18nT('工期与交付保障') },
    { key: 'service', label: i18nT('服务响应与售后') },
    { key: 'record', label: i18nT('同类项目业绩') },
    { key: 'compliance', label: i18nT('资质与合规齐全') },
    { key: 'local', label: i18nT('本地化与属地服务') },
  ];
}

/** 打开内置浏览器（登录态按 contextId 记忆，抓取时复用同一分区） */
export async function openEmbeddedBrowser(url: string, contextId: string): Promise<boolean> {
  const tabs = (window as any).electronAPI?.browserTabs;
  if (!tabs?.create) return false;
  const u = String(url || '').trim();
  if (!u) return false;
  const full = /^https?:\/\//i.test(u) ? u : `https://${u}`;
  // source 必须是 'agent'：只有它会按 contextId 复用已有 tab 并触发 focus-requested 让侧栏打开
  const tab = await tabs.create({ url: full, contextId, source: 'agent', activate: true });
  if (tab?.id && tabs.setAutomationPaused) { try { await tabs.setAutomationPaused(tab.id, true); } catch { /* 无自动化，忽略 */ } }
  try { await tabs.setVisible?.(true); } catch { /* 忽略 */ }
  return true;
}

export { openPath } from '../service-settlement/shared';

export type { BidWriterCompanyField, BidWriterProject, BidWriterRequirement, BidWriterSection };
