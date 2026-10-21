/**
 * 学术写作智能体 · 渲染层共享：动作调用、全局状态、环节清单、学术网站入口、内置浏览器。
 */
import { reactive, ref } from 'vue';
import type { AwProject, AwSource, AwState } from '@totalclaw/ipc-contracts';
import { t as i18nT } from '../../i18n';
import { toPlain } from '../../utils/ipcPlain';

export { errorMessage, fmtDateTime, fmtDate, scrollToStep } from '../service-settlement/shared';
export type { StepMeta, StepRuntime } from '../service-settlement/shared';

export async function aw<T = any>(action: string, payload?: unknown): Promise<T> {
  const bridge = (window as any).electronAPI?.workbenches?.academicWriter;
  if (!bridge?.invoke) throw new Error(i18nT('学术写作接口不可用，请重启应用'));
  return bridge.invoke(action, toPlain(payload ?? {})) as Promise<T>;
}

export function onAwEvent(cb: (ev: { type: string; payload?: any }) => void): () => void {
  const bridge = (window as any).electronAPI?.workbenches?.academicWriter;
  return bridge?.onEvent ? bridge.onEvent(cb) : () => {};
}

export const awState = ref<AwState | null>(null);
export const awProgress = reactive<Record<string, string>>({});

export function currentProject(): AwProject | null {
  const s = awState.value;
  return s ? s.projects.find((p) => p.id === s.activeProjectId) || s.projects[0] || null : null;
}

export async function refreshState(): Promise<AwState> {
  const s = await aw<AwState>('state.get');
  awState.value = s;
  return s;
}

export function sourceLabel(s: AwSource): string {
  return { pubmed: 'PubMed', europepmc: 'Europe PMC', arxiv: 'arXiv', crossref: 'Crossref', openalex: 'OpenAlex', web: i18nT('网页抓取') }[s];
}

export function paperTypeLabel(t: string): string {
  return ({ review: i18nT('综述'), research: i18nT('研究论文'), thesis: i18nT('学位论文'), proposal: i18nT('开题报告') } as Record<string, string>)[t] || t;
}

export function styleLabel(s: string): string {
  return ({ gbt7714: 'GB/T 7714-2015', apa: 'APA 7', ieee: 'IEEE' } as Record<string, string>)[s] || s;
}

/** 学术网站入口：{q} 换成检索词（没有检索词就开首页） */
export function academicSites(): Array<{ id: string; name: string; home: string; search?: string; note?: string }> {
  return [
    { id: 'pubmed', name: 'PubMed', home: 'https://pubmed.ncbi.nlm.nih.gov/', search: 'https://pubmed.ncbi.nlm.nih.gov/?term={q}' },
    { id: 'scholar', name: 'Google Scholar', home: 'https://scholar.google.com/', search: 'https://scholar.google.com/scholar?q={q}', note: i18nT('需要能访问 Google') },
    { id: 'cnki', name: i18nT('中国知网'), home: 'https://www.cnki.net/', search: 'https://kns.cnki.net/kns8s/defaultresult/index?kw={q}', note: i18nT('全文下载需机构或个人账号') },
    { id: 'wanfang', name: i18nT('万方数据'), home: 'https://www.wanfangdata.com.cn/', search: 'https://s.wanfangdata.com.cn/paper?q={q}' },
    { id: 'cqvip', name: i18nT('维普'), home: 'https://www.cqvip.com/' },
    { id: 'baidu', name: i18nT('百度学术'), home: 'https://xueshu.baidu.com/', search: 'https://xueshu.baidu.com/s?wd={q}' },
    { id: 'arxiv', name: 'arXiv', home: 'https://arxiv.org/', search: 'https://arxiv.org/search/?query={q}&searchtype=all' },
    { id: 'europepmc', name: 'Europe PMC', home: 'https://europepmc.org/', search: 'https://europepmc.org/search?query={q}' },
    { id: 's2', name: 'Semantic Scholar', home: 'https://www.semanticscholar.org/', search: 'https://www.semanticscholar.org/search?q={q}' },
    { id: 'wos', name: 'Web of Science', home: 'https://www.webofscience.com/', note: i18nT('需机构订阅') },
    { id: 'sd', name: 'ScienceDirect', home: 'https://www.sciencedirect.com/', search: 'https://www.sciencedirect.com/search?qs={q}' },
    { id: 'ieee', name: 'IEEE Xplore', home: 'https://ieeexplore.ieee.org/', search: 'https://ieeexplore.ieee.org/search/searchresult.jsp?queryText={q}' },
    { id: 'springer', name: 'SpringerLink', home: 'https://link.springer.com/', search: 'https://link.springer.com/search?query={q}' },
  ];
}

/** 学术网站用同一个内置浏览器上下文（主进程抓取读这个 tab）；机构账号登录一次，所有论文共用 */
export const ACADEMIC_CONTEXT = 'academic-writer';

/**
 * 在内置浏览器打开。不暂停自动化：「抓取当前页面」只读正文，由用户主动点，
 * 暂停反而会让后续读取被「让位」状态卡住。
 */
export async function openInBrowser(url: string): Promise<boolean> {
  const tabs = (window as any).electronAPI?.browserTabs;
  if (!tabs?.create) return false;
  const full = /^https?:\/\//i.test(url) ? url : `https://${url}`;
  const tab = await tabs.create({ url: full, contextId: ACADEMIC_CONTEXT, source: 'agent', activate: true });
  if (tab?.id && tabs.navigate) { try { await tabs.navigate(tab.id, full); } catch { /* 新建时已经打开 */ } }
  try { await tabs.setVisible?.(true); } catch { /* ignore */ }
  return true;
}

export function paperCite(p: { authors: string[]; year: string; journal: string }): string {
  const who = p.authors.length ? `${p.authors[0]}${p.authors.length > 1 ? i18nT(' 等') : ''}` : '';
  return [who, p.journal, p.year].filter(Boolean).join(' · ');
}

/**
 * 送进人机双写编辑器（旗舰版能力）：打开内置共写编辑器，把全文作为新文档载入。
 * 引用保留文献库编号 [n]，作者在编辑器里改完点「从双写编辑器取回」，导出时再按格式重排。
 */
export async function sendToCowrite(title: string, text: string): Promise<void> {
  const cw = (window as any).electronAPI?.cowrite;
  if (!cw?.open || !cw?.apply) throw new Error(i18nT('当前版本没有人机双写编辑器'));
  const opened = await cw.open({ mode: 'local' });
  if (opened && opened.ok === false) throw new Error(i18nT('人机双写编辑器没有打开'));
  const r = await cw.apply({ mode: 'local', applyMode: 'loadDoc', title, text });
  if (r && r.ok === false) throw new Error(i18nT('没能把文稿载入人机双写编辑器'));
}

export async function readCowrite(): Promise<string> {
  const cw = (window as any).electronAPI?.cowrite;
  if (!cw?.get) throw new Error(i18nT('当前版本没有人机双写编辑器'));
  const doc = await cw.get({ mode: 'local' });
  return String(doc?.text || '');
}
