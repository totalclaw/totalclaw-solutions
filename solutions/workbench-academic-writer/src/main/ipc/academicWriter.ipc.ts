/**
 * 解决方案 · 学术写作智能体（主进程）。
 *
 * 一条动作通道 WORKBENCH_AW_INVOKE，按 action 分发；状态变化经 WORKBENCH_AW_EVENT 推给渲染层。
 *
 * 学术诚信的几道闸：
 *   - 文献只来自学术库公开接口或作者在内置浏览器里打开的真实页面，模型不产生文献条目；
 *   - 网页抓取的题录、精读的依据句，都要能在原文里找到，找不到的丢掉 / 标未核实；
 *   - 成稿里的引用编号必须在文献库里，库外编号（模型编的）标出来，导出时显示为 [?n]；
 *   - 成稿送进人机双写编辑器由作者改，导出只用作者改过的版本。
 */
import { app, dialog, ipcMain, shell, type BrowserWindow } from 'electron';
import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import {
  AW_API_SOURCES, IPC_CHANNELS,
  type AwModuleKey, type AwOutlineSection, type AwPaper, type AwProject, type AwSection, type AwSettings, type AwSource, type AwState,
} from '@totalclaw/ipc-contracts';
import { t as i18nT } from '@totalclaw/i18n';
import type { WorkbenchIpcDeps } from './workbenchApi';
import { userFacingError } from '../utils/userFacingError';
import { openPathGuarded } from '../utils/openPathGuarded';
import { createWorkbenchLlm } from '../services/workbenchLlm';
import { AcademicWriterStore, newId, newProject, type AwStored } from '../services/academicWriter/store';
import { doiExists, mergePapers, normDoi, normTitle, searchSource, sourceLabel, stripTags } from '../services/academicWriter/sources';
import { extractCites, renderManuscript, toBibtex, wordCount } from '../services/academicWriter/citations';
import { appsForFile, openWithApp, type OpenWithApp } from '../services/openWithApps';
import * as P from '../services/academicWriter/prompts';
import { documentsFolderName } from '../services/brandPaths';

const store = new AcademicWriterStore();
/** 学术网站在内置浏览器里的登录上下文：学校 / 机构账号登录一次，所有论文项目共用 */
export const ACADEMIC_BROWSER_CONTEXT = 'academic-writer';

function norm(s: string): string {
  return String(s || '').toLowerCase().replace(/[\s\p{P}\p{S}]+/gu, '');
}
function foundIn(corpus: string, quote: string | undefined): boolean {
  const q = norm(quote || '');
  return q.length >= 4 && norm(corpus).includes(q);
}
function safeName(s: string): string {
  return String(s || '').replace(/[\\/:*?"<>|\r\n]/g, '_').trim().slice(0, 60) || 'paper';
}

export function registerAcademicWriterHandlers(deps: WorkbenchIpcDeps): void {
  const logger = deps.logger;
  const win = (): BrowserWindow | null => deps.getMainWindow?.() ?? null;
  const broadcast = (type: 'state' | 'progress', payload?: unknown): void => {
    try { win()?.webContents.send(IPC_CHANNELS.WORKBENCH_AW_EVENT, { type, payload }); } catch { /* 窗口已关 */ }
  };
  const progress = (key: string, message: string): void => broadcast('progress', { key, message });
  const pushState = (): void => broadcast('state');

  const outputRoot = (): string => {
    const s = store.read().settings;
    const root = s.outputDir && existsSync(s.outputDir) ? s.outputDir : join(app.getPath('documents'), documentsFolderName(), i18nT('学术写作'));
    mkdirSync(root, { recursive: true });
    return root;
  };
  const publicState = (): AwState => ({ ...store.read(), outputDir: outputRoot() });

  // 学术写作智能体不让用户选模型（2026-09-23 用户：默认走系统的就好），一律用系统默认模型
  const models = createWorkbenchLlm(deps, { logTag: 'academic-writer', moduleModel: () => '' });
  const llmJson = (m: AwModuleKey, prompt: string, timeoutMs?: number) => models.llmJson(m, prompt, timeoutMs);
  const llm = (m: AwModuleKey, prompt: string, timeoutMs?: number) => models.llm(m, prompt, timeoutMs);

  const project = (): AwProject => store.project();
  const mutateProject = <T>(fn: (p: AwProject, s: AwStored) => T): T => store.update((s) => fn(store.project(s), s));
  const need = <T>(v: T | undefined | null, what: string): T => {
    if (v == null) throw new Error(i18nT('{p0}不存在或已删除', { p0: what }));
    return v;
  };

  /** 草稿全文：作者在双写编辑器改过的优先，否则把各节拼起来 */
  const draftText = (p: AwProject): string => p.manuscript?.trim()
    ? p.manuscript
    : [`# ${p.title}`, ...p.sections.filter((x) => x.text.trim()).map((x) => `## ${x.heading}\n\n${x.text.trim()}`)].join('\n\n');

  /** 成稿（导出与预览同一份）：引用按格式重排 + 参考文献表 */
  const renderedBody = (pr: AwProject): string => {
    const r = renderManuscript(draftText(pr), pr.library, pr.style);
    const refTitle = pr.language === 'en' ? 'References' : i18nT('参考文献');
    return `${r.text.trim()}\n\n## ${refTitle}\n\n${r.references.join('\n\n')}\n`;
  };

  // 「Open in」：只允许打开本工作台导出的文件，应用只能是刚列出来的那几个
  const listedApps = new Map<string, OpenWithApp[]>();
  const isOwnExport = (path: string) => store.read().projects.some((p) => p.exports.some((e) => e.path === path));

  const actions: Record<string, (p: any) => unknown> = {
    'state.get': () => publicState(),
    'settings.patch': (p: { patch: Partial<AwSettings> }) => {
      const out = store.update((s) => {
        for (const [k, v] of Object.entries(p?.patch || {})) {
          const cur = (s.settings as any)[k];
          (s.settings as any)[k] = cur && typeof cur === 'object' && !Array.isArray(cur) && v && typeof v === 'object' && !Array.isArray(v) ? { ...cur, ...v } : v;
        }
        return s.settings;
      });
      pushState();
      return out;
    },
    'outputDir.pick': async () => {
      const r = await dialog.showOpenDialog(win()!, { properties: ['openDirectory', 'createDirectory'] });
      if (r.canceled || !r.filePaths[0]) return null;
      store.update((s) => { s.settings.outputDir = r.filePaths[0]; });
      pushState();
      return r.filePaths[0];
    },
    'path.open': async (p: { path: string; reveal?: boolean }) => {
      if (!p?.path || !existsSync(p.path)) throw new Error(i18nT('文件不存在'));
      if (p.reveal) { shell.showItemInFolder(p.path); return true; }
      const err = await openPathGuarded(p.path);
      if (err) throw new Error(err);
      return true;
    },
    'openIn.apps': async (p: { path: string }) => {
      if (!isOwnExport(p?.path) || !existsSync(p.path)) throw new Error(i18nT('文件不存在'));
      const apps = await appsForFile(p.path);
      listedApps.set(p.path, apps);
      return apps;
    },
    'openIn.open': async (p: { path: string; appPath: string }) => {
      if (!isOwnExport(p?.path) || !existsSync(p.path)) throw new Error(i18nT('文件不存在'));
      if (!(listedApps.get(p.path) || []).some((a) => a.path === p.appPath)) throw new Error(i18nT('请从列表里选择应用'));
      await openWithApp(p.path, p.appPath);
      return true;
    },
    'openIn.choose': async (p: { path: string }) => {
      if (!isOwnExport(p?.path) || !existsSync(p.path)) throw new Error(i18nT('文件不存在'));
      const r = await dialog.showOpenDialog(win()!, { title: i18nT('选择打开文档的应用'), properties: ['openFile'], ...(process.platform === 'win32' ? { filters: [{ name: i18nT('应用程序'), extensions: ['exe'] }] } : { defaultPath: '/Applications' }) });
      if (r.canceled || !r.filePaths[0]) return false;
      await openWithApp(p.path, r.filePaths[0]);
      return true;
    },

    // 论文项目
    'project.create': (p: { input: Partial<AwProject> }) => {
      const pr = newProject(p?.input || {});
      store.update((s) => { s.projects.unshift(pr); s.activeProjectId = pr.id; });
      pushState();
      return pr;
    },
    'project.switch': (p: { id: string }) => { store.update((s) => { need(s.projects.find((x) => x.id === p.id), i18nT('论文项目')); s.activeProjectId = p.id; }); pushState(); return true; },
    'project.update': (p: { patch: Partial<Pick<AwProject, 'title' | 'field' | 'language' | 'style' | 'paperType' | 'requirements'>> }) => {
      const out = mutateProject((pr) => {
        for (const k of ['title', 'field', 'language', 'style', 'paperType', 'requirements'] as const) if (p?.patch?.[k] !== undefined) (pr as any)[k] = p.patch[k];
        return pr;
      });
      pushState();
      return out;
    },
    'project.remove': (p: { id: string }) => {
      store.update((s) => {
        s.projects = s.projects.filter((x) => x.id !== p.id);
        if (!s.projects.length) s.projects.push(newProject());
        if (!s.projects.some((x) => x.id === s.activeProjectId)) s.activeProjectId = s.projects[0].id;
      });
      pushState();
      return true;
    },

    // ① 检索
    'query.suggest': async (p: { topic?: string }) => {
      const pr = project();
      const { json, model } = await llmJson('search', P.queryPrompt(String(p?.topic || pr.title), pr.field));
      return {
        model,
        queries: (Array.isArray(json?.queries) ? json.queries : []).map((q: any) => ({ query: String(q?.query || '').trim(), purpose: String(q?.purpose || '') })).filter((q: any) => q.query).slice(0, 6),
        zhKeywords: (Array.isArray(json?.zhKeywords) ? json.zhKeywords : []).map(String).filter(Boolean).slice(0, 8),
      };
    },
    'search.run': async (p: { query: string; sources?: AwSource[]; yearFrom?: number; limit?: number }) => {
      const query = String(p?.query || '').trim();
      if (!query) throw new Error(i18nT('请输入检索词'));
      const sources = (p.sources?.length ? p.sources : store.read().settings.defaultSources).filter((x): x is Exclude<AwSource, 'web'> => (AW_API_SOURCES as string[]).includes(x));
      const email = store.read().settings.contactEmail;
      const errors: Array<{ source: AwSource; message: string }> = [];
      progress('search', i18nT('正在检索：{p0}', { p0: sources.map(sourceLabel).join(' / ') }));
      const lists = await Promise.all(sources.map(async (src) => {
        try { return await searchSource(src, query, { limit: Number(p.limit) || 15, yearFrom: p.yearFrom || undefined, email }); } catch (error) {
          errors.push({ source: src, message: (error as Error)?.message || String(error) });
          return [];
        }
      }));
      const results = mergePapers(lists);
      const run = { id: newId('srch'), query, sources, yearFrom: p.yearFrom || undefined, results, errors, at: new Date().toISOString() };
      mutateProject((pr) => { pr.lastSearch = run; });
      progress('search', '');
      pushState();
      return run;
    },

    // ② 文献库
    'library.add': (p: { ids: string[] }) => {
      const added = mutateProject((pr) => {
        let n = 0;
        for (const id of p?.ids || []) {
          const paper = pr.lastSearch?.results.find((x) => x.id === id);
          if (!paper) continue;
          const dup = pr.library.find((x) => (paper.doi && x.doi === paper.doi) || normTitle(x.title) === normTitle(paper.title));
          if (dup) continue;
          pr.library.push({ ...paper, addedAt: new Date().toISOString() });
          n += 1;
        }
        return n;
      });
      pushState();
      return { added };
    },
    'library.remove': (p: { id: string }) => {
      mutateProject((pr) => {
        const idx = pr.library.findIndex((x) => x.id === p.id);
        if (idx < 0) return;
        pr.library.splice(idx, 1);
        // 引用写的是库编号：删掉一条，后面的编号整体前移，草稿里的 [n] 同步改，免得指错文献；各节 badRefs 重算
        const shift = (t: string) => t.replace(/\[(\d+(?:\s*[-–—,，、]\s*\d+)*)\]/g, (_m, g: string) => `[${g.replace(/\d+/g, (d) => {
          const n = Number(d);
          // 指向被删文献的改成 0：不在库编号范围内，查验会把它列为库外引用、导出显示 [?0]，不会悄悄消失
          return n === idx + 1 ? '0' : n > idx + 1 ? String(n - 1) : d;
        })}]`);
        pr.sections.forEach((s) => { s.text = shift(s.text); s.badRefs = extractCites(s.text, pr.library.length).bad.map(String); });
        if (pr.manuscript) pr.manuscript = shift(pr.manuscript);
        pr.outline.forEach((o) => { o.cites = o.cites.filter((c) => c !== p.id); });
      });
      pushState();
      return true;
    },
    'library.note': (p: { id: string; note: string }) => { mutateProject((pr) => { const x = pr.library.find((y) => y.id === p.id); if (x) x.note = String(p.note || '').slice(0, 2000); }); pushState(); return true; },
    'library.checkDoi': async () => {
      const pr = project();
      const email = store.read().settings.contactEmail;
      const results: Record<string, 'ok' | 'missing'> = {};
      for (const x of pr.library.filter((y) => y.doi)) {
        progress('library', i18nT('查验 DOI：{p0}', { p0: x.doi! }));
        try { results[x.id] = (await doiExists(x.doi!, email)) ? 'ok' : 'missing'; } catch { /* 网络失败不算查不到 */ }
      }
      mutateProject((p2) => { p2.library.forEach((x) => { if (results[x.id]) x.doiCheck = results[x.id]; }); });
      progress('library', '');
      pushState();
      return results;
    },
    /** 抓取内置浏览器当前页面：作者在知网 / 万方 / 期刊官网打开了一篇文献详情页 */
    'web.capture': async () => {
      const tabs: any = (deps as any).embeddedBrowserTabs;
      if (!tabs?.tabIdForAgentContext) throw new Error(i18nT('内置浏览器不可用'));
      const tabId = tabs.tabIdForAgentContext(ACADEMIC_BROWSER_CONTEXT);
      if (!tabId) throw new Error(i18nT('还没有在内置浏览器里打开学术网站：先点上面的网站入口，打开一篇文献的详情页'));
      // 只读页面文字（应用自有固定脚本）。不走 Agent 的 snapshot：用户刚在页面上点过，
      // 自动操作处于「让位」状态，snapshot 会干等 25 秒；这里是用户主动点「抓取」，读一次正文即可。
      const page: any = await tabs.evalInTab(tabId, `(() => ({ url: location.href, title: document.title, text: (document.body && document.body.innerText || '').slice(0, 20000) }))()`);
      const url = String(page?.url || '');
      const body = `${String(page?.title || '')}\n${String(page?.text || '')}`.trim();
      if (body.length < 50) throw new Error(i18nT('没有读到页面内容：请先在内置浏览器里打开一篇文献的详情页'));
      const { json, model } = await llmJson('search', P.webExtractPrompt(url, body));
      if (json?.notArticle) throw new Error(i18nT('当前页面像是检索结果列表：请点进一篇文献的详情页再抓取'));
      const title = String(json?.title || '').trim();
      if (!title || !foundIn(body, title)) throw new Error(i18nT('没能从页面里确认文献标题，请换到文献详情页再试'));
      const keep = (v: unknown) => { const s = String(v ?? '').trim(); return s && foundIn(body, s) ? s : ''; };
      const paper: AwPaper = {
        id: newId('web'), source: 'web', sourceId: url || title, title,
        authors: (Array.isArray(json?.authors) ? json.authors : []).map((a: unknown) => keep(a)).filter(Boolean).slice(0, 30),
        journal: keep(json?.journal), year: /^\d{4}$/.test(String(json?.year)) && body.includes(String(json.year)) ? String(json.year) : '',
        volume: keep(json?.volume) || undefined, issue: keep(json?.issue) || undefined, pages: keep(json?.pages) || undefined,
        doi: json?.doi && body.toLowerCase().includes(normDoi(json.doi)) ? normDoi(json.doi) : undefined,
        url, abstract: stripTags(keep(json?.abstract)), foundIn: ['web'], addedAt: new Date().toISOString(),
      };
      const added = mutateProject((pr) => {
        if (pr.library.some((x) => (paper.doi && x.doi === paper.doi) || normTitle(x.title) === normTitle(paper.title))) return false;
        pr.library.push(paper);
        return true;
      });
      logger?.info?.('academic-writer', 'web capture', { url, model, added });
      pushState();
      return { paper, added, model };
    },

    // ③ 精读
    'read.run': async (p: { ids?: string[] }) => {
      const pr = project();
      const targets = pr.library.filter((x) => (p?.ids?.length ? p.ids.includes(x.id) : !x.summary));
      let done = 0;
      const failed: string[] = [];
      for (const paper of targets) {
        const text = [paper.title, paper.abstract].filter(Boolean).join('\n\n');
        if (!paper.abstract) { failed.push(i18nT('{p0}：没有摘要可读', { p0: paper.title.slice(0, 40) })); continue; }
        progress('read', i18nT('精读 {a}/{b}：{p0}', { a: done + 1, b: targets.length, p0: paper.title.slice(0, 50) }));
        try {
          const { json, model } = await llmJson('read', P.readPrompt(pr, paper, text));
          const quotes = (Array.isArray(json?.quotes) ? json.quotes : []).slice(0, 8).map((q: any) => ({
            field: String(q?.field || ''), text: String(json?.[q?.field] || ''), quote: String(q?.quote || '').slice(0, 500), verified: foundIn(text, q?.quote),
          })).filter((q: any) => q.quote);
          mutateProject((p2) => {
            const x = p2.library.find((y) => y.id === paper.id);
            if (x) x.summary = { question: String(json?.question || ''), method: String(json?.method || ''), findings: String(json?.findings || ''), limitations: String(json?.limitations || ''), quotes, model, at: new Date().toISOString() };
          });
          done += 1;
          pushState();
        } catch (error) {
          failed.push(i18nT('{p0}：{p1}', { p0: paper.title.slice(0, 40), p1: (error as Error)?.message || '' }));
        }
      }
      progress('read', '');
      return { done, failed };
    },

    // ④ 提纲
    'outline.generate': async () => {
      const pr = project();
      if (pr.library.length < 3) throw new Error(i18nT('文献库至少要有 3 篇文献再拟提纲'));
      const { json, model } = await llmJson('outline', P.outlinePrompt(pr), 240_000);
      const outline: AwOutlineSection[] = (Array.isArray(json?.sections) ? json.sections : []).slice(0, 15).map((s: any) => ({
        id: newId('sec'), heading: String(s?.heading || '').trim(), points: (Array.isArray(s?.points) ? s.points : []).map(String).filter(Boolean).slice(0, 8),
        cites: (Array.isArray(s?.cites) ? s.cites : []).map(Number).filter((n: number) => n >= 1 && n <= pr.library.length).map((n: number) => pr.library[n - 1].id),
      })).filter((s: AwOutlineSection) => s.heading);
      if (!outline.length) throw new Error(i18nT('模型没有给出提纲，请重试或换一个模型'));
      mutateProject((p2) => { p2.outline = outline; p2.outlineModel = model; });
      pushState();
      return { outline, model };
    },
    'outline.save': (p: { outline: AwOutlineSection[] }) => {
      mutateProject((pr) => {
        pr.outline = (p?.outline || []).map((s) => ({ id: s.id || newId('sec'), heading: String(s.heading || '').trim(), points: (s.points || []).map(String).filter(Boolean), cites: (s.cites || []).filter((c) => pr.library.some((x) => x.id === c)) })).filter((s) => s.heading);
      });
      pushState();
      return true;
    },

    // ⑤ 写作
    'write.section': async (p: { outlineId: string }) => {
      const pr = project();
      const sec = need(pr.outline.find((x) => x.id === p.outlineId), i18nT('提纲小节'));
      progress('write', i18nT('正在写：{p0}', { p0: sec.heading }));
      const r = await llm('write', P.sectionPrompt(pr, sec.heading, sec.points, sec.cites, pr.outline.map((x) => x.heading)), 300_000);
      const text = r.text.trim().replace(/^#+\s*.*\n+/, '');
      const bad = extractCites(text, pr.library.length).bad.map(String);
      const out = mutateProject((p2) => {
        const next: AwSection = { id: sec.id, heading: sec.heading, text, model: r.model, badRefs: bad, at: new Date().toISOString() };
        const i = p2.sections.findIndex((x) => x.id === sec.id);
        if (i >= 0) p2.sections[i] = next; else p2.sections.push(next);
        // 按提纲顺序排
        p2.sections.sort((a, b) => p2.outline.findIndex((o) => o.id === a.id) - p2.outline.findIndex((o) => o.id === b.id));
        return next;
      });
      progress('write', '');
      pushState();
      return out;
    },
    'sections.save': (p: { id: string; text: string }) => {
      const out = mutateProject((pr) => {
        const s = need(pr.sections.find((x) => x.id === p.id), i18nT('小节'));
        s.text = String(p.text || '');
        s.badRefs = extractCites(s.text, pr.library.length).bad.map(String);
        return s;
      });
      pushState();
      return out;
    },
    /** 送进人机双写编辑器的全文：引用保留文献库编号，导出时再按格式重排 */
    'manuscript.compose': () => draftText(project()),
    /** 预览用：和导出文件同一份成稿（引用已按格式重排、带参考文献表） */
    'manuscript.rendered': () => renderedBody(project()),
    'manuscript.save': (p: { text: string }) => {
      const text = String(p?.text || '');
      if (!text.trim()) throw new Error(i18nT('双写编辑器里没有内容'));
      mutateProject((pr) => { pr.manuscript = text; pr.manuscriptAt = new Date().toISOString(); });
      pushState();
      return { words: wordCount(text) };
    },
    'manuscript.reset': () => { mutateProject((pr) => { pr.manuscript = undefined; pr.manuscriptAt = undefined; }); pushState(); return true; },

    // ⑥ 查验与导出
    'check.run': () => {
      const pr = project();
      const text = draftText(pr);
      const { order, bad } = extractCites(text, pr.library.length);
      const check = {
        cited: order.map((n) => pr.library[n - 1].id),
        uncited: pr.library.filter((_, i) => !order.includes(i + 1)).map((x) => x.id),
        badRefs: bad.map(String),
        doiMissing: pr.library.filter((x) => x.doiCheck === 'missing').map((x) => x.id),
        wordCount: wordCount(text),
        at: new Date().toISOString(),
      };
      mutateProject((p2) => { p2.check = check; });
      pushState();
      return check;
    },
    'references.preview': () => {
      const pr = project();
      return renderManuscript(draftText(pr), pr.library, pr.style).references;
    },
    'export': async (p: { format: 'docx' | 'md' | 'bib' }) => {
      const pr = project();
      const dir = join(outputRoot(), safeName(pr.title));
      mkdirSync(dir, { recursive: true });
      const stamp = new Date().toISOString().slice(0, 16).replace(/[-:T]/g, '');
      let path: string;
      if (p.format === 'bib') {
        path = join(dir, `${safeName(pr.title)}-${stamp}.bib`);
        writeFileSync(path, pr.library.map(toBibtex).join('\n\n'), 'utf-8');
      } else {
        const body = renderedBody(pr);
        if (p.format === 'md') {
          path = join(dir, `${safeName(pr.title)}-${stamp}.md`);
          writeFileSync(path, body, 'utf-8');
        } else {
          const { buildDocx } = await import('../services/cowriteEditor');
          path = join(dir, `${safeName(pr.title)}-${stamp}.docx`);
          const plain = body.replace(/^# .*\n+/, '').replace(/^#{1,6}\s*/gm, '').replace(/\*\*(.+?)\*\*/g, '$1');
          writeFileSync(path, buildDocx(pr.title, plain));
        }
      }
      mutateProject((p2) => { p2.exports.unshift({ path, kind: p.format, at: new Date().toISOString() }); p2.exports.splice(20); });
      pushState();
      return { path };
    },
  };

  ipcMain.handle(IPC_CHANNELS.WORKBENCH_AW_INVOKE, async (_e, req: { action: string; payload?: unknown }) => {
    const fn = actions[String(req?.action || '')];
    if (!fn) throw new Error(i18nT('未知操作：{p0}', { p0: String(req?.action || '') }));
    try {
      return await fn(req.payload ?? {});
    } catch (error) {
      logger?.warn?.('academic-writer', `${req.action} failed`, { error: (error as Error)?.message });
      throw new Error(userFacingError(error));
    }
  });
}
