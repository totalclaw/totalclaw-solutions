/**
 * 解决方案 · 高校一体化 AI 智能体（主进程）。docs/campus-ai-workbench.md
 *
 * 一条动作通道 WORKBENCH_CA_INVOKE，按 action 分发；状态变化经 WORKBENCH_CA_EVENT 推给渲染层。
 *
 *   知识库：文档按部门 / 类别导入 → 本机分段建索引；FAQ 手工维护或 Excel 批量导入；检索自测；
 *   问答：FAQ 命中直接给审定答案；检索证据够才让模型依据原文作答；没依据转部门，不编；
 *   手机端：校园口令 + 匿名会话，学生扫码提问、看自己问题的部门答复；
 *   学业预警：名单 / 成绩 / 考勤 → 规则算三级预警 → 辅导员复核 → 匿名事实写谈话提纲与通知 → 导出 / 人工确认后发邮件；
 *   运维：模型服务状态、调用审计、问答记录按保留天数清理。
 */
import { app, dialog, ipcMain, shell, type BrowserWindow } from 'electron';
import { copyFileSync, existsSync, mkdirSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { basename, extname, join } from 'node:path';
import {
  CA_DATASETS, CA_LEVELS,
  type CaDatasetKey, type CaDatasetMeta, type CaLevel, type CaReviewStatus, type CaSettings, type CaState, type CaStudentResult, type CaWarnRules,
} from '@totalclaw/ipc-contracts';
import { IPC_CHANNELS } from '@totalclaw/ipc-contracts';
import { t as i18nT } from '@totalclaw/i18n';
import type { WorkbenchIpcDeps } from './workbenchApi';
import { userFacingError } from '../utils/userFacingError';
import { onAppWillQuit } from '../util/quitRegistry';
import { createWorkbenchLlm } from '../services/workbenchLlm';
import { safeFileName, writeWorkbook } from '../services/serviceSettlement/excel';
import { CampusAiService, KB_EXTS, publicQa } from '../services/campusAi/service';
import { CampusMobileServer } from '../services/campusAi/mobileServer';
import { CampusAiStore, defaultWarnRules, newCampusKey, newId, normalizeProfile, normalizeSettings, normalizeWarnRules, schoolLabel } from '../services/campusAi/store';
import { computeWarnings, detectMapping, missingRoles, parseAttendance, parseGrades, parseRoster, pctText, readSheet, roleLabel } from '../services/campusAi/warning';
import { draftNotice, fillName, levelLabel } from '../services/campusAi/notice';
import { writeDemoKb, writeDemoStudents } from '../services/campusAi/demoData';
import { moduleActions, moduleState, type ModuleCtx } from './campusAi.modules';
import { documentsFolderName } from '../services/brandPaths';

const store = new CampusAiStore();

export function registerCampusAiHandlers(deps: WorkbenchIpcDeps): () => void {
  const logger = deps.logger;
  const win = (): BrowserWindow | null => deps.getMainWindow?.() ?? null;
  const send = (type: 'state' | 'progress', payload?: unknown): void => {
    try { win()?.webContents.send(IPC_CHANNELS.WORKBENCH_CA_EVENT, { type, payload }); } catch { /* 窗口已关 */ }
  };
  let stateTimer: ReturnType<typeof setTimeout> | null = null;
  const pushState = (): void => {
    if (stateTimer) return;
    stateTimer = setTimeout(() => { stateTimer = null; send('state'); }, 120);
  };
  const progress = (message: string, extra?: Record<string, unknown>): void => send('progress', { message, ...extra });

  const wbLlm = createWorkbenchLlm(deps, { logTag: 'campus-ai', moduleModel: () => '' });
  const svc = new CampusAiService(store, (prompt) => wbLlm.llm('qa', prompt, 90_000), pushState, (m) => progress(m, { scope: 'kb' }));
  const mobile = new CampusMobileServer(svc, logger);

  const outputDir = (sub?: string): string => {
    const s = store.read().settings;
    const root = s.outputDir && existsSync(s.outputDir) ? s.outputDir : join(app.getPath('documents'), documentsFolderName(), i18nT('高校一体化AI智能体'));
    const dir = sub ? join(root, sub) : root;
    mkdirSync(dir, { recursive: true });
    return dir;
  };

  const results = (): CaStudentResult[] => store.results();

  const mctx: ModuleCtx = {
    store, svc,
    llm: (module, prompt, timeoutMs) => wbLlm.llm(module, prompt, timeoutMs),
    llmJson: (module, prompt, timeoutMs) => wbLlm.llmJson(module, prompt, timeoutMs),
    outputDir: (sub) => outputDir(sub),
    pushState: () => pushState(),
    progress: (m, extra) => progress(m, extra),
  };

  const LOGO_MIME: Record<string, string> = { '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.svg': 'image/svg+xml', '.gif': 'image/gif' };
  let logoCache = { path: '', url: '' };
  const logoDataUrl = (path: string): string => {
    if (!path || !existsSync(path)) return '';
    if (logoCache.path === path) return logoCache.url;
    const mime = LOGO_MIME[extname(path).toLowerCase()];
    if (!mime || statSync(path).size > 3 * 1024 * 1024) return '';
    logoCache = { path, url: `data:${mime};base64,${readFileSync(path).toString('base64')}` };
    return logoCache.url;
  };
  const pendingReviews = (): number => {
    const w = store.read().warn;
    if (!w || w.stale) return 0;
    return results().filter((r) => r.level && (w.reviews[r.studentId]?.status || 'pending') === 'pending').length;
  };

  const publicState = (): CaState => {
    const s = store.read();
    let model = '';
    try { model = wbLlm.defaultModel(); } catch { model = ''; }
    return {
      settings: s.settings,
      defaults: { warnRules: defaultWarnRules() },
      docs: s.docs,
      faqs: s.faqs,
      tickets: s.tickets,
      datasets: s.datasets,
      warn: s.warn,
      mobile: mobile.status(),
      stats: svc.stats(pendingReviews()),
      outputDir: outputDir(),
      model,
      logo: logoDataUrl(s.settings.profile.logoPath),
      ...moduleState(mctx),
    };
  };

  // 启动：清过期问答；之后每 6 小时清一次
  try { svc.purgeExpired(); } catch (e) { logger?.warn?.('campus-ai', 'purge failed', { error: (e as Error)?.message }); }
  const purgeTimer = setInterval(() => { try { svc.purgeExpired(); } catch { /* 下次再清 */ } }, 6 * 60 * 60_000);
  purgeTimer.unref?.();
  const stopBackground = () => { clearInterval(purgeTimer); void mobile.stop(); };
  onAppWillQuit('campus-ai', stopBackground, { once: true });

  // ── 学业预警 ──────────────────────────────────────────────────────────

  const markStale = (reason: string): void => {
    store.update((s) => { if (s.warn && !s.warn.stale) { s.warn.stale = true; s.warn.staleReason = reason; } });
  };

  const liveWarn = () => {
    const w = store.read().warn;
    if (!w) throw new Error(i18nT('还没有预警结果，请先完成第 2 步'));
    if (w.stale) throw new Error(i18nT('{p0}，请回到第 2 步重新计算', { p0: w.staleReason || i18nT('数据或规则已经改过') }));
    return w;
  };

  function importDataset(dataset: CaDatasetKey, path: string, sheet?: string, mapping?: Record<string, string> | null): CaDatasetMeta {
    if (!CA_DATASETS.includes(dataset)) throw new Error(i18nT('未知数据类型'));
    if (!path || !existsSync(path)) throw new Error(i18nT('文件不存在：{p0}', { p0: path || '' }));
    const { table, sheetNames } = readSheet(path, sheet);
    const map = detectMapping(table.headers, dataset, mapping);
    const missing = missingRoles(dataset, map);
    const meta: CaDatasetMeta = {
      path, fileName: basename(path), sheetName: table.sheetName, sheetNames, headers: table.headers, rowCount: table.rows.length,
      preview: table.rows.slice(0, 5), mapping: map, missing, loaded: false, count: 0, skippedCount: 0, skipped: [], notes: [], loadedAt: '',
    };
    if (!missing.length) {
      const parsed = dataset === 'roster' ? parseRoster(table, map) : dataset === 'grades' ? parseGrades(table, map) : parseAttendance(table, map);
      store.setData(dataset, parsed.rows as any);
      Object.assign(meta, { loaded: true, count: parsed.rows.length, skippedCount: parsed.skippedCount, skipped: parsed.skipped, notes: parsed.notes, loadedAt: new Date().toISOString() });
    }
    store.update((s) => { s.datasets[dataset] = meta; });
    markStale(i18nT('数据已经更新'));
    svc.audit('warning', 'data.import', meta.loaded, undefined, `${dataset} ${meta.count}`);
    pushState();
    return meta;
  }

  function compute(): CaState['warn'] {
    const started = Date.now();
    const s = store.read();
    if (!s.datasets.roster?.loaded && !s.datasets.grades?.loaded) throw new Error(i18nT('请先导入学生名单和成绩表'));
    if (!s.datasets.grades?.loaded) throw new Error(i18nT('请先导入成绩表'));
    const { results: list, summary } = computeWarnings(store.data(), s.settings.warnRules);
    const prev = s.warn;
    const oldLevel = new Map(store.results().map((x) => [x.studentId, x.level]));
    store.setResults(list);
    const r = store.update((st) => {
      // 重算时保留已做的复核，但只保留「计算级别没变」的人；级别变了的打回待复核。通知一律重写
      const reviews: NonNullable<typeof st.warn>['reviews'] = {};
      for (const x of list) {
        const old = prev?.reviews[x.studentId];
        if (old && x.level && oldLevel.get(x.studentId) === x.level) reviews[x.studentId] = old;
      }
      st.warn = { id: newId('caw'), computedAt: new Date().toISOString(), rules: st.settings.warnRules, summary, reviews, notices: {}, stale: false };
      return st.warn;
    });
    svc.audit('warning', 'compute', true, started, i18nT('预警 {a} / {b} 人', { a: summary.warned, b: summary.students }));
    pushState();
    return r;
  }

  function review(ids: string[], status: CaReviewStatus, level?: CaLevel | null, note?: string): void {
    liveWarn();
    const valid = new Set(results().filter((x) => x.level).map((x) => x.studentId));
    store.update((s) => {
      for (const id of ids || []) {
        if (!valid.has(id)) continue;
        const cur = s.warn!.reviews[id] || { status: 'pending' as CaReviewStatus };
        cur.status = status;
        if (level !== undefined) cur.level = level && CA_LEVELS.includes(level) ? level : undefined;
        if (note !== undefined) cur.note = String(note).slice(0, 300);
        cur.at = new Date().toISOString();
        s.warn!.reviews[id] = cur;
        // 复核改了，旧通知作废
        delete s.warn!.notices[id];
      }
    });
    pushState();
  }

  const effectiveLevel = (x: CaStudentResult): CaLevel | null => {
    const r = store.read().warn?.reviews[x.studentId];
    return (r?.level || x.level) ?? null;
  };

  async function writeNotices(ids: string[] | undefined, useModel: boolean): Promise<{ done: number; byModel: number }> {
    const w = liveWarn();
    const confirmed = results().filter((x) => x.level && w.reviews[x.studentId]?.status === 'confirmed' && (!ids?.length || ids.includes(x.studentId)));
    if (!confirmed.length) throw new Error(i18nT('还没有已确认的预警学生：请先在第 3 步复核'));
    const school = schoolLabel(store.read().settings);
    const llmJson = useModel ? (p: string) => wbLlm.llmJson('notice', p, 120_000) : null;
    let done = 0; let byModel = 0;
    const started = Date.now();
    for (const x of confirmed) {
      progress(i18nT('正在写第 {a}/{b} 份', { a: done + 1, b: confirmed.length }), { scope: 'notice', done, total: confirmed.length });
      const n = await draftNotice(x, effectiveLevel(x)!, school, llmJson);
      if (n.by === 'model') byModel++;
      store.update((s) => { if (s.warn && !s.warn.stale) s.warn.notices[x.studentId] = n; });
      done++;
      pushState();
    }
    progress('', { scope: 'notice', done, total: confirmed.length });
    svc.audit('warning', 'notices', true, started, i18nT('{a} 份，模型 {b} 份', { a: done, b: byModel }));
    return { done, byModel };
  }

  const warnRows = (list: CaStudentResult[]) => {
    const w = store.read().warn!;
    return list.map((x) => {
      const r = w.reviews[x.studentId];
      const n = w.notices[x.studentId];
      const lv = effectiveLevel(x);
      return [
        x.studentId, x.name, x.className, x.college, x.major, x.counselor,
        x.level ? levelLabel(x.level) : '', lv ? levelLabel(lv) : '',
        r?.status === 'confirmed' ? i18nT('已确认') : r?.status === 'dismissed' ? i18nT('不预警') : i18nT('待复核'),
        x.failCourses, x.failCredits, x.failed.map((f) => `${f.course} ${f.score}`).join(i18nT('、')),
        x.absent, x.totalSessions || '', x.absenceRate === null ? '' : pctText(x.absenceRate),
        x.basis.join(i18nT('；')), r?.note || '', n ? n.outline : '', n ? fillName(n.notice, x.name) : '',
      ];
    });
  };
  const WARN_HEADERS = () => [
    i18nT('学号'), i18nT('姓名'), i18nT('班级'), i18nT('学院'), i18nT('专业'), i18nT('辅导员'),
    i18nT('计算级别'), i18nT('复核级别'), i18nT('复核状态'), i18nT('不及格门数'), i18nT('不及格学分'), i18nT('不及格课程'),
    i18nT('缺勤次数'), i18nT('应到次数'), i18nT('缺勤率'), i18nT('预警依据'), i18nT('辅导员备注'), i18nT('谈话提纲'), i18nT('学生通知'),
  ];

  function exportWarn(): { dir: string; file: string; notices: number } {
    const w = liveWarn();
    if (pendingReviews()) throw new Error(i18nT('还有 {n} 名学生没有复核，复核完才能导出', { n: pendingReviews() }));
    // 本地时间（toISOString 是 UTC，凌晨导出的文件夹会落到前一天）
    const d = new Date();
    const p2 = (n: number) => String(n).padStart(2, '0');
    const stamp = `${d.getFullYear()}${p2(d.getMonth() + 1)}${p2(d.getDate())}-${p2(d.getHours())}${p2(d.getMinutes())}`;
    const dir = outputDir(join(i18nT('学业预警'), stamp));
    const warned = results().filter((x) => x.level);
    const file = join(dir, i18nT('学业预警名单.xlsx'));
    writeWorkbook(file, [{ name: i18nT('预警名单'), headers: WARN_HEADERS(), rows: warnRows(warned) }]);
    let notices = 0;
    const ndir = join(dir, i18nT('学生通知'));
    for (const x of warned) {
      const n = w.notices[x.studentId];
      if (!n || w.reviews[x.studentId]?.status !== 'confirmed') continue;
      mkdirSync(ndir, { recursive: true });
      writeFileSync(join(ndir, safeFileName(`${x.className}-${x.studentId}-${x.name}.txt`)), `${fillName(n.notice, x.name)}\n`, 'utf-8');
      notices++;
    }
    store.update((s) => { if (s.warn) { s.warn.exportedAt = new Date().toISOString(); s.warn.exportDir = dir; } });
    svc.audit('warning', 'export', true, undefined, i18nT('{a} 人，通知 {b} 份', { a: warned.length, b: notices }));
    pushState();
    return { dir, file, notices };
  }

  /** 按辅导员分组：每位辅导员一封，附自己学生的名单 */
  function mailPlan(): Array<{ counselor: string; to: string; students: number; ids: string[] }> {
    const w = liveWarn();
    const groups = new Map<string, { counselor: string; to: string; ids: string[] }>();
    for (const x of results()) {
      if (!x.level || w.reviews[x.studentId]?.status !== 'confirmed') continue;
      const key = x.counselorEmail || `__${x.counselor}`;
      const g = groups.get(key) || { counselor: x.counselor || i18nT('未填辅导员'), to: x.counselorEmail, ids: [] };
      g.ids.push(x.studentId);
      groups.set(key, g);
    }
    return [...groups.values()].map((g) => ({ ...g, students: g.ids.length }));
  }

  const sendMail = async (input: { to: string[]; subject: string; body: string; attachments?: { filename: string; path: string }[] }): Promise<{ ok: boolean; message?: string }> => {
    const { sendCaseMail } = await import('../services/caseMailSender');
    const relay = deps.serviceAuth
      ? { send: (i: Parameters<NonNullable<typeof deps.serviceAuth>['relaySendMail']>[0]) => deps.serviceAuth!.relaySendMail(i) }
      : null;
    return sendCaseMail((deps.readEmailCredentials?.() ?? {}) as any, input, relay) as Promise<{ ok: boolean; message?: string }>;
  };

  async function mailSend(confirm: boolean): Promise<Array<{ counselor: string; to: string; ok: boolean; message?: string }>> {
    if (!confirm) throw new Error(i18nT('发送前请先确认收件人与内容'));
    const plan = mailPlan().filter((g) => g.to);
    if (!plan.length) throw new Error(i18nT('名单里没有辅导员邮箱，无法发送'));
    const dir = outputDir(join(i18nT('学业预警'), i18nT('邮件附件')));
    const school = schoolLabel(store.read().settings);
    const all = results();
    const out: Array<{ counselor: string; to: string; ok: boolean; message?: string }> = [];
    for (const g of plan) {
      const list = all.filter((x) => g.ids.includes(x.studentId));
      const file = join(dir, safeFileName(i18nT('学业预警-{p0}.xlsx', { p0: g.counselor })));
      writeWorkbook(file, [{ name: i18nT('预警名单'), headers: WARN_HEADERS(), rows: warnRows(list) }]);
      const byLv = CA_LEVELS.map((lv) => i18nT('{a} {b} 人', { a: levelLabel(lv), b: list.filter((x) => effectiveLevel(x) === lv).length })).join(i18nT('，'));
      const r = await sendMail({
        to: [g.to],
        subject: i18nT('【{p0}】学业预警名单（{n} 人）', { p0: school, n: list.length }),
        body: [
          i18nT('{p0}老师：', { p0: g.counselor }),
          i18nT('本次学业预警您负责的学生共 {n} 人：{p0}。名单、预警依据、谈话提纲与学生通知草稿见附件。', { n: list.length, p0: byLv }),
          i18nT('请在一周内与学生面谈并制定学业改进计划。'),
        ].join('\n\n'),
        attachments: [{ filename: basename(file), path: file }],
      });
      out.push({ counselor: g.counselor, to: g.to, ok: !!r.ok, message: r.message });
    }
    svc.audit('warning', 'mail', out.every((x) => x.ok), undefined, i18nT('{a} 封，成功 {b}', { a: out.length, b: out.filter((x) => x.ok).length }));
    return out;
  }

  // ── 动作表 ────────────────────────────────────────────────────────────

  const actions: Record<string, (p: any) => unknown> = {
    ...moduleActions(mctx),
    'state.get': () => publicState(),
    'audit.list': (p: { limit?: number }) => store.auditList(Math.min(Math.max(Number(p?.limit) || 200, 1), 1000)),
    'qa.list': (p: { kind?: string; limit?: number }) => store.qa().filter((r) => !p?.kind || r.kind === p.kind).slice(0, Math.min(Math.max(Number(p?.limit) || 200, 1), 1000)).map(publicQa),

    'files.pick': async (p: { kind?: 'doc' | 'excel' | 'image'; multi?: boolean; title?: string }) => {
      const exts = p?.kind === 'excel' ? ['xlsx', 'xls', 'csv'] : p?.kind === 'image' ? ['png', 'jpg', 'jpeg', 'webp', 'svg'] : KB_EXTS.map((e) => e.slice(1));
      const r = await dialog.showOpenDialog(win()!, {
        title: p?.title || i18nT('选择文件'),
        properties: p?.multi ? ['openFile', 'multiSelections'] : ['openFile'],
        filters: [{ name: p?.kind === 'excel' ? 'Excel' : i18nT('文档'), extensions: exts }],
      });
      return r.canceled ? [] : r.filePaths;
    },
    'folder.pick': async () => {
      const r = await dialog.showOpenDialog(win()!, { properties: ['openDirectory', 'createDirectory'] });
      return r.canceled ? '' : r.filePaths[0] || '';
    },
    'path.open': async (p: { path: string; reveal?: boolean }) => {
      if (!p?.path || !existsSync(p.path)) throw new Error(i18nT('文件不存在'));
      if (p.reveal) { shell.showItemInFolder(p.path); return true; }
      const err = await shell.openPath(p.path);
      if (err) throw new Error(err);
      return true;
    },

    // 知识库
    'kb.import': async (p: { paths: string[]; dept?: string; category?: string }) => {
      const made = await svc.importDocs(p?.paths || [], String(p?.dept || ''), String(p?.category || ''));
      void svc.buildDocs(made.map((d) => d.id));
      return made;
    },
    'kb.build': (p: { ids?: string[] }) => svc.buildDocs(p?.ids),
    'kb.update': (p: { id: string; dept?: string; category?: string }) => svc.updateDoc(p.id, p),
    'kb.remove': (p: { id: string }) => { svc.removeDoc(p.id); return true; },
    'kb.search': (p: { query: string }) => svc.search(p?.query || ''),
    'kb.demo': async () => {
      const dir = outputDir(join(i18nT('示例数据'), i18nT('知识库')));
      const files = writeDemoKb(dir);
      const ids: string[] = [];
      for (const d of files.docs) ids.push(...(await svc.importDocs([d.path], d.dept, d.category)).map((x) => x.id));
      const faq = svc.importFaqs(files.faqFile);
      await svc.buildDocs(ids);
      return { dir, docs: ids.length, faqs: faq.added + faq.updated };
    },
    'faq.save': (p: { input: any }) => svc.saveFaq(p?.input || {}),
    'faq.remove': (p: { id: string }) => { svc.removeFaq(p.id); return true; },
    'faq.import': (p: { path: string }) => svc.importFaqs(p.path),
    'faq.export': () => svc.exportFaqs(outputDir()),

    // 问答 / 转办
    'qa.ask': (p: { question: string }) => svc.ask(p?.question || '', 'desk'),
    'qa.feedback': (p: { qaId: string; value: 'up' | 'down' | null }) => { svc.feedback(p.qaId, p.value); return true; },
    'ticket.answer': (p: { id: string; answer: string; toFaq?: boolean; faqQuestion?: string }) => svc.answerTicket(p.id, p.answer, { toFaq: p.toFaq, faqQuestion: p.faqQuestion }),
    'ticket.update': (p: { id: string; dept?: string; status?: 'open' | 'answered' | 'closed'; note?: string }) => svc.updateTicket(p.id, p),

    // 手机端
    'mobile.start': async () => { const r = await mobile.start(); svc.audit('mobile', 'start', true); pushState(); return r; },
    'mobile.stop': async () => { await mobile.stop(); svc.audit('mobile', 'stop', true); pushState(); return mobile.status(); },
    'mobile.rotateKey': () => { mobile.rotateKey(newCampusKey()); svc.audit('mobile', 'rotateKey', true); pushState(); return mobile.status(); },

    // 学业预警
    'warn.import': (p: { dataset: CaDatasetKey; path: string; sheet?: string; mapping?: Record<string, string> | null }) => importDataset(p.dataset, p.path, p.sheet, p.mapping),
    'warn.clear': (p: { dataset: CaDatasetKey }) => {
      if (!CA_DATASETS.includes(p?.dataset)) throw new Error(i18nT('未知数据类型'));
      store.setData(p.dataset, []);
      store.update((s) => { s.datasets[p.dataset] = null; });
      markStale(i18nT('数据已经更新'));
      pushState();
      return true;
    },
    'warn.demo': () => {
      const files = writeDemoStudents(outputDir(join(i18nT('示例数据'), i18nT('学业预警'))));
      importDataset('roster', files.roster);
      importDataset('grades', files.grades);
      importDataset('attendance', files.attendance);
      return { dir: outputDir(join(i18nT('示例数据'), i18nT('学业预警'))), students: files.students };
    },
    'warn.roles': () => Object.fromEntries(['studentId', 'name', 'className', 'college', 'major', 'counselor', 'counselorEmail', 'course', 'score', 'credit', 'term', 'status', 'absent', 'total'].map((r) => [r, roleLabel(r)])),
    'warn.compute': () => compute(),
    'warn.results': () => results(),
    'warn.review': (p: { ids: string[]; status: CaReviewStatus; level?: CaLevel | null; note?: string }) => { review(p.ids, p.status, p.level, p.note); return true; },
    'warn.notices': (p: { ids?: string[]; useModel?: boolean }) => writeNotices(p?.ids, p?.useModel !== false),
    'warn.export': () => exportWarn(),
    'warn.mailPlan': () => mailPlan(),
    'warn.mailSend': (p: { confirm?: boolean }) => mailSend(!!p?.confirm),
    'warn.rules': (p: { rules: Partial<CaWarnRules> }) => {
      const rules = normalizeWarnRules({ ...store.read().settings.warnRules, ...(p?.rules || {}) });
      store.update((s) => { s.settings.warnRules = rules; });
      markStale(i18nT('预警规则已经改过'));
      pushState();
      return rules;
    },

    // 学校档案
    'brand.logo': (p: { path: string }) => {
      const src = String(p?.path || '');
      const ext = extname(src).toLowerCase();
      if (!src || !existsSync(src)) throw new Error(i18nT('文件不存在：{p0}', { p0: src }));
      if (!LOGO_MIME[ext]) throw new Error(i18nT('校徽请用 PNG、JPG、WebP 或 SVG 图片'));
      if (statSync(src).size > 3 * 1024 * 1024) throw new Error(i18nT('校徽图片不能超过 3MB'));
      const dest = join(store.dir('brand'), `logo-${Date.now()}${ext}`);
      copyFileSync(src, dest);
      const old = store.read().settings.profile.logoPath;
      store.update((s) => { s.settings.profile.logoPath = dest; });
      if (old && old !== dest && old.startsWith(store.dir('brand'))) rmSync(old, { force: true });
      svc.audit('ops', 'brand.logo', true);
      pushState();
      return true;
    },
    'brand.logoClear': () => {
      const old = store.read().settings.profile.logoPath;
      store.update((s) => { s.settings.profile.logoPath = ''; });
      if (old && old.startsWith(store.dir('brand'))) rmSync(old, { force: true });
      pushState();
      return true;
    },

    // 设置 / 运维
    'settings.patch': (p: { patch: Partial<CaSettings> }) => {
      const r = store.update((s) => {
        const { warnRules: _w, profile, ...rest } = p?.patch || {};
        // 校徽只能走 brand.logo（拷进账号目录），设置里传来的 logoPath 一律不认
        const nextProfile = profile ? normalizeProfile({ ...s.settings.profile, ...profile, logoPath: s.settings.profile.logoPath }) : s.settings.profile;
        s.settings = normalizeSettings({ ...s.settings, ...rest, profile: nextProfile });
        return s.settings;
      });
      svc.audit('ops', 'settings', true);
      pushState();
      return r;
    },
    'model.test': async () => {
      const started = Date.now();
      try {
        const r = await wbLlm.llm('ops', i18nT('请只回复两个字：正常'), 60_000);
        svc.audit('ops', 'model.test', true, started);
        return { ok: true, model: r.model || wbLlm.defaultModel(), ms: Date.now() - started, reply: r.text.slice(0, 40) };
      } catch (e) {
        svc.audit('ops', 'model.test', false, started, (e as Error)?.message);
        return { ok: false, model: wbLlm.defaultModel(), ms: Date.now() - started, error: userFacingError(e) };
      }
    },
    'privacy.purgeExpired': () => svc.purgeExpired(),
    'privacy.purgeQa': () => {
      const n = store.updateQa((list) => { const k = list.length; list.splice(0); return k; });
      svc.audit('ops', 'qa.purgeAll', true, undefined, String(n));
      pushState();
      return n;
    },
  };

  ipcMain.handle(IPC_CHANNELS.WORKBENCH_CA_INVOKE, async (_e, req: { action: string; payload?: unknown }) => {
    const fn = actions[String(req?.action || '')];
    if (!fn) throw new Error(i18nT('未知操作：{p0}', { p0: String(req?.action || '') }));
    try {
      return await fn(req.payload ?? {});
    } catch (error) {
      logger?.warn?.('campus-ai', `${req.action} failed`, { error: (error as Error)?.message });
      throw new Error(userFacingError(error));
    }
  });
  // 卸载 / 停用时由方案入口 deactivate 调用（宿主只撤 IPC 通道，后台任务要自己停）
  return stopBackground;
}
