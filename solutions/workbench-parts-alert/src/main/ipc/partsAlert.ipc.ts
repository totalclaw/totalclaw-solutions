/**
 * 解决方案 · 配件预警与补库智能体（主进程）。docs/parts-alert-workbench.md
 *
 * 一条动作通道 WORKBENCH_PA_INVOKE，按 action 分发；状态变化经 WORKBENCH_PA_EVENT 推给渲染层。
 *
 *   投喂：历史发货（按月 / 按年）、采购提前期、采购在途、实时库存五份表，按表头关键字认列，认不准的由人改；
 *   运算：库存状态、断货日、补库量全部由 services/partsAlert/calc.ts 的公式算出，每条结果带算式依据；
 *   检验：行动计划逐条由人确认 / 改文字 / 驳回，缺货两组没检验完不能进补库清单；
 *   补库：只收「缺货计划已确认且建议量大于 0」的配件，人可以改量，公式建议量原样保留；
 *   转单：人点「生成采购订单」才写文件，文件交给采购系统录入，应用不向任何系统提交；
 *   定时：到点读数据文件夹里各类最新的一份表重新运算，推送相比上次新增的缺货预警，可发邮件。
 */
import { app, dialog, ipcMain, Notification, shell, type BrowserWindow } from 'electron';
import { existsSync, mkdirSync } from 'node:fs';
import { basename, join } from 'node:path';
import {
  IPC_CHANNELS, PA_BLOCKING_GROUPS, PA_DATASETS,
  type PaDatasetKey, type PaDatasetMeta, type PaExported, type PaHistoryEntry, type PaPartResult, type PaPlanGroup, type PaReplenishEdit,
  type PaReview, type PaReviewStatus, type PaRules, type PaSchedule, type PaSummary, type PaWorkbenchState,
} from '@totalclaw/ipc-contracts';
import { t as i18nT } from '@totalclaw/i18n';
import type { WorkbenchIpcDeps } from './workbenchApi';
import { userFacingError } from '../utils/userFacingError';
import { openPathGuarded } from '../utils/openPathGuarded';
import { onAppWillQuit } from '../util/quitRegistry';
import { parseDay } from '../services/partsAlert/calc';
import { inspectTable, parseDataset, periodRange, readDataTable, type DatasetRows } from '../services/partsAlert/ingest';
import { writeDemoFiles } from '../services/partsAlert/demoData';
import { exportPurchaseOrder, exportStatusPlan } from '../services/partsAlert/exporter';
import { buildReplenishLines, diffNewAlerts, lineTotals, pendingCounts, planGroupOf, runCompute } from '../services/partsAlert/plan';
import { dueToday, localDay, pickNewestFiles } from '../services/partsAlert/schedule';
import {
  PartsAlertStore, defaultKeywords, defaultRules, emptyData, newId, normalizeRules, normalizeSchedule,
} from '../services/partsAlert/store';
import { documentsFolderName } from '../services/brandPaths';

const store = new PartsAlertStore();

const datasetLabel = (k: PaDatasetKey): string => ({
  monthly: i18nT('历史发货（按月）'), yearly: i18nT('历史发货（按年）'), leadTime: i18nT('采购提前期'), inTransit: i18nT('采购在途'), stock: i18nT('实时库存'),
}[k]);

/** 读一份表并转成数据行。必填列没认全时 loaded = false、rows 为空，不抛错（界面要让人改列对应）。 */
export function loadDatasetFile<K extends PaDatasetKey>(
  dataset: K,
  path: string,
  opts: { sheet?: string; mapping?: Record<string, string> | null } = {},
): { meta: PaDatasetMeta; rows: DatasetRows[K] } {
  if (!path || !existsSync(path)) throw new Error(i18nT('文件不存在：{p0}', { p0: path || '' }));
  const { table, sheetNames } = readDataTable(path, opts.sheet);
  const ins = inspectTable(table, dataset, opts.mapping);
  const range = periodRange(ins.periods.map((p) => p.period));
  const meta: PaDatasetMeta = {
    path, fileName: basename(path), sheetName: table.sheetName, sheetNames, headers: table.headers, rowCount: table.rows.length,
    preview: table.rows.slice(0, 5), mapping: ins.mapping, layout: ins.layout, periodColumns: ins.periods.length, periodFrom: range.from, periodTo: range.to,
    missing: ins.missing, loaded: false, count: 0, skippedCount: 0, skipped: [], notes: [], loadedAt: '',
  };
  if (ins.missing.length) return { meta, rows: [] as unknown as DatasetRows[K] };
  const parsed = parseDataset(table, dataset, ins);
  if (ins.layout === 'long' && (dataset === 'monthly' || dataset === 'yearly')) {
    const r = periodRange((parsed.rows as Array<{ month?: string; year?: number }>).map((x) => String(x.month ?? x.year ?? '')));
    meta.periodFrom = r.from; meta.periodTo = r.to;
  }
  Object.assign(meta, { loaded: true, count: parsed.rows.length, skippedCount: parsed.skippedCount, skipped: parsed.skipped, notes: parsed.notes, loadedAt: new Date().toISOString() });
  return { meta, rows: parsed.rows as DatasetRows[K] };
}

export function registerPartsAlertHandlers(deps: WorkbenchIpcDeps): () => void {
  const logger = deps.logger;
  const win = (): BrowserWindow | null => deps.getMainWindow?.() ?? null;
  const send = (event: { type: string; payload?: unknown }): void => { try { win()?.webContents.send(IPC_CHANNELS.WORKBENCH_PA_EVENT, event); } catch { /* 窗口已关 */ } };
  const pushState = (): void => send({ type: 'state' });
  const now = (): string => new Date().toISOString();

  const outputDir = (sub?: string): string => {
    const s = store.read().settings;
    const root = s.outputDir && existsSync(s.outputDir) ? s.outputDir : join(app.getPath('documents'), documentsFolderName(), i18nT('配件预警与补库'));
    const dir = sub ? join(root, sub) : root;
    mkdirSync(dir, { recursive: true });
    return dir;
  };

  const sendMail = async (input: { to: string[]; subject: string; body: string; attachments?: { filename: string; path: string }[] }): Promise<{ ok: boolean; message?: string }> => {
    const { sendCaseMail } = await import('../services/caseMailSender');
    const relay = deps.serviceAuth
      ? { send: (i: Parameters<NonNullable<typeof deps.serviceAuth>['relaySendMail']>[0]) => deps.serviceAuth!.relaySendMail(i) }
      : null;
    return sendCaseMail((deps.readEmailCredentials?.() ?? {}) as any, input, relay) as Promise<{ ok: boolean; message?: string }>;
  };

  const publicState = (): PaWorkbenchState => {
    const s = store.read();
    const usable = !!s.run && !s.run.stale;
    const results = s.run ? store.results('result') : [];
    return {
      settings: s.settings,
      outputDir: outputDir(),
      defaults: { rules: defaultRules(), keywords: defaultKeywords() },
      datasets: s.datasets,
      run: s.run,
      pending: s.run ? pendingCounts(results, s.run.reviews) : { stagnant: 0, redundant: 0, shortage_transit: 0, shortage_none: 0 },
      lines: usable ? buildReplenishLines(results, s.run!.reviews, s.run!.edits, s.run!.asOf) : [],
      history: s.history,
      scheduleStatus: s.scheduleStatus,
      latest: s.latest,
    };
  };

  /** 规则或数据改了：当前这次运算的结果不能再往下用 */
  const markStale = (reason: string): void => {
    store.update((s) => { if (s.run && !s.run.stale) { s.run.stale = true; s.run.staleReason = reason; s.run.replenishConfirmedAt = ''; } });
  };

  /** 检验、补库、导出都要求有一次没过期的运算 */
  const liveRun = () => {
    const run = store.read().run;
    if (!run) throw new Error(i18nT('还没有运算结果，请先完成第 2 步'));
    if (run.stale) throw new Error(i18nT('{p0}，请回到第 2 步重新运算', { p0: run.staleReason || i18nT('规则或数据已经改过') }));
    return run;
  };

  function importDataset(dataset: PaDatasetKey, path: string, sheet?: string, mapping?: Record<string, string> | null): PaDatasetMeta {
    if (!PA_DATASETS.includes(dataset)) throw new Error(i18nT('未知的数据类型：{p0}', { p0: String(dataset) }));
    const { meta, rows } = loadDatasetFile(dataset, path, { sheet, mapping });
    store.setData(dataset, rows as any);
    store.update((s) => { s.datasets[dataset] = meta; });
    markStale(i18nT('{p0}数据已重新投喂', { p0: datasetLabel(dataset) }));
    return meta;
  }

  function historyEntry(source: 'manual' | 'schedule', id: string, results: PaPartResult[], summary: PaSummary, files: string[], note: string): PaHistoryEntry {
    const prev = store.read().latest ? store.results('latest') : null;
    const diff = diffNewAlerts(prev, results);
    return {
      id, at: now(), asOf: summary.asOf, source, total: summary.total, byState: summary.byState,
      replenishParts: summary.replenishParts, replenishQty: summary.replenishQty, replenishAmount: summary.replenishAmount,
      newOut: diff.newOut, newRisk: diff.newRisk, files, note,
    };
  }

  // ── 定时运算 ──────────────────────────────────────────────────────────────

  let scheduleBusy = false;
  async function runScheduled(): Promise<{ ok: boolean; message: string }> {
    if (scheduleBusy) return { ok: false, message: i18nT('上一次定时运算还没跑完') };
    scheduleBusy = true;
    const usedFiles: string[] = [];
    try {
      const st = store.read();
      const sc = st.settings.schedule;
      if (!sc.folder) throw new Error(i18nT('还没有设置数据文件夹'));
      if (!existsSync(sc.folder)) throw new Error(i18nT('数据文件夹不存在：{p0}', { p0: sc.folder }));
      const found = pickNewestFiles(sc.folder, sc.keywords);
      const lacking = (['monthly', 'stock'] as PaDatasetKey[]).filter((k) => !found[k]);
      if (lacking.length) {
        throw new Error(i18nT('数据文件夹里没有找到：{p0}。文件名里要带对应的关键字（{p1}）', {
          p0: lacking.map(datasetLabel).join('、'), p1: lacking.map((k) => sc.keywords[k].join(' / ')).join('；'),
        }));
      }
      const data = emptyData();
      const warnings: string[] = [];
      for (const key of PA_DATASETS) {
        const f = found[key];
        if (!f) {
          if (key === 'leadTime') warnings.push(i18nT('没有找到采购提前期文件，全部按默认 {n} 天', { n: st.settings.rules.defaultLeadDays }));
          if (key === 'inTransit') warnings.push(i18nT('没有找到采购在途文件，按没有在途计算'));
          continue;
        }
        usedFiles.push(f.name);
        // 向导里人工改过的列对应，表头对得上就沿用
        const saved = st.datasets[key]?.mapping;
        const headers = readDataTable(f.path).table.headers;
        const savedFits = !!saved && Object.values(saved).some(Boolean) && Object.values(saved).every((c) => !c || headers.includes(c));
        let loaded = loadDatasetFile(key, f.path, { mapping: savedFits ? saved : null });
        if (!loaded.meta.loaded && savedFits) loaded = loadDatasetFile(key, f.path);
        if (!loaded.meta.loaded) {
          const msg = i18nT('「{p0}」里必填的列没有认出来，请在「运算」页签用这份文件投喂一次并对应好列', { p0: f.name });
          if (key === 'monthly' || key === 'stock') throw new Error(msg);
          warnings.push(msg);
          continue;
        }
        (data as any)[key] = loaded.rows;
        if (loaded.meta.skippedCount) warnings.push(i18nT('「{p0}」跳过 {n} 行', { p0: f.name, n: loaded.meta.skippedCount }));
      }
      const asOf = localDay();
      const { results, summary } = runCompute(data, st.settings.rules, asOf);
      if (!results.length) throw new Error(i18nT('文件里没有读到任何配件'));
      const id = newId('par');
      const entry = historyEntry('schedule', id, results, summary, [], warnings.join(i18nT('；')));
      const planFile = exportStatusPlan(outputDir(i18nT('定时运算')), results, {}, summary);
      entry.files = [planFile];
      store.setResults('latest', results);
      const title = i18nT('配件预警 · {p0}', { p0: asOf });
      const body = i18nT('已缺货 {a} 个（新增 {b}），将缺货 {c} 个（新增 {d}），呆滞 {e} 个，冗余 {f} 个；建议补库 {g} 个配件', {
        a: summary.byState.out_of_stock, b: entry.newOut.length, c: summary.byState.at_risk, d: entry.newRisk.length,
        e: summary.byState.stagnant, f: summary.byState.redundant, g: summary.replenishParts,
      });
      let message = body;
      if (warnings.length) message += `\n${warnings.join('\n')}`;
      if (sc.emailEnabled) {
        const to = sc.emailTo.split(/[,;，；\s]+/).map((x) => x.trim()).filter(Boolean);
        if (!to.length) {
          message += `\n${i18nT('邮件没有发出：没有填收件人')}`;
        } else {
          const nameOf = new Map(results.map((r) => [r.partNo, r.partName]));
          const list = (nos: string[]): string => (nos.length ? nos.slice(0, 30).map((n) => `  ${n} ${nameOf.get(n) || ''}`).join('\n') + (nos.length > 30 ? `\n  ${i18nT('…… 共 {n} 个，完整清单见附件', { n: nos.length })}` : '') : `  ${i18nT('无')}`);
          const mailBody = [body, '', i18nT('新增已缺货：'), list(entry.newOut), '', i18nT('新增将缺货：'), list(entry.newRisk), '', ...warnings, '', i18nT('以上数字由公式计算，详见附件里的算式依据。补库需人工确认后再下采购订单。')].join('\n');
          let mail: { ok: boolean; message?: string };
          try { mail = await sendMail({ to, subject: title, body: mailBody, attachments: [{ filename: basename(planFile), path: planFile }] }); } catch (e) { mail = { ok: false, message: userFacingError(e) }; }
          message += mail.ok ? `\n${i18nT('邮件已发给 {p0}', { p0: to.join('、') })}` : `\n${i18nT('邮件没有发出：{p0}', { p0: mail.message || i18nT('没有说明') })}`;
        }
      }
      store.update((s) => {
        s.history.unshift(entry);
        s.latest = { at: entry.at, asOf, source: 'schedule', summary };
        s.scheduleStatus = { ...s.scheduleStatus, lastRunAt: entry.at, lastOk: true, lastMessage: message, lastFiles: usedFiles };
      });
      if (sc.notify) { try { new Notification({ title, body }).show(); } catch { /* 系统通知不可用 */ } }
      send({ type: 'schedule', payload: { ok: true, message: body } });
      return { ok: true, message };
    } catch (e) {
      const message = userFacingError(e);
      logger?.warn?.('parts-alert', 'scheduled run failed', { error: (e as Error)?.message });
      store.update((s) => { s.scheduleStatus = { ...s.scheduleStatus, lastRunAt: now(), lastOk: false, lastMessage: message, lastFiles: usedFiles }; });
      if (store.read().settings.schedule.notify) { try { new Notification({ title: i18nT('配件预警 · 定时运算没有完成'), body: message }).show(); } catch { /* 系统通知不可用 */ } }
      send({ type: 'schedule', payload: { ok: false, message } });
      return { ok: false, message };
    } finally {
      scheduleBusy = false;
      pushState();
    }
  }

  const tick = async (): Promise<void> => {
    try {
      const s = store.read();
      const sc = s.settings.schedule;
      if (!sc.enabled || !dueToday(sc.time, s.scheduleStatus.lastRunDay)) return;
      // 先记下今天跑过：失败也不每分钟重试，错误留在页面上等人处理
      store.update((x) => { x.scheduleStatus.lastRunDay = localDay(); });
      await runScheduled();
    } catch (e) {
      logger?.warn?.('parts-alert', 'schedule tick failed', { error: (e as Error)?.message });
    }
  };
  const timer = setInterval(() => { void tick(); }, 60_000);
  timer.unref?.();
  const stopBackground = () => { clearInterval(timer); };
  onAppWillQuit('parts-alert', stopBackground, { once: true });

  // ── 动作表 ────────────────────────────────────────────────────────────────

  const actions: Record<string, (p: any) => unknown> = {
    'state.get': () => publicState(),
    'results.get': (p: { which?: 'result' | 'latest' }): PaPartResult[] => {
      const which = p?.which === 'latest' ? 'latest' : 'result';
      if (which === 'result' && !store.read().run) return [];
      if (which === 'latest' && !store.read().latest) return [];
      return store.results(which);
    },

    'files.pick': async (p: { multi?: boolean }) => {
      const r = await dialog.showOpenDialog(win()!, { properties: p?.multi ? ['openFile', 'multiSelections'] : ['openFile'], filters: [{ name: 'Excel', extensions: ['xlsx', 'xls', 'xlsm', 'csv'] }] });
      return r.canceled ? [] : r.filePaths;
    },
    'dirs.pick': async () => {
      const r = await dialog.showOpenDialog(win()!, { properties: ['openDirectory', 'createDirectory'] });
      return r.canceled ? '' : r.filePaths[0] || '';
    },
    'path.open': async (p: { path: string; reveal?: boolean }) => {
      if (!p?.path || !existsSync(p.path)) throw new Error(i18nT('文件不存在'));
      if (p.reveal) { shell.showItemInFolder(p.path); return true; }
      const err = await openPathGuarded(p.path);
      if (err) throw new Error(err);
      return true;
    },
    'settings.outputDir': (p: { dir: string }) => {
      const dir = String(p?.dir || '');
      if (dir && !existsSync(dir)) throw new Error(i18nT('文件夹不存在：{p0}', { p0: dir }));
      store.update((s) => { s.settings.outputDir = dir; });
      pushState();
      return outputDir();
    },

    // ── 第 1 步：投喂 ──
    'data.import': (p: { dataset: PaDatasetKey; path: string; sheet?: string; mapping?: Record<string, string> | null }) => {
      const meta = importDataset(p.dataset, p.path, p.sheet, p.mapping);
      pushState();
      return meta;
    },
    'data.clear': (p: { dataset: PaDatasetKey }) => {
      if (!PA_DATASETS.includes(p?.dataset)) throw new Error(i18nT('未知的数据类型：{p0}', { p0: String(p?.dataset) }));
      store.setData(p.dataset, [] as any);
      store.update((s) => { s.datasets[p.dataset] = null; });
      markStale(i18nT('{p0}数据已移除', { p0: datasetLabel(p.dataset) }));
      pushState();
      return true;
    },
    'data.demo': () => {
      const dir = outputDir(i18nT('示例数据'));
      const files = writeDemoFiles(dir, localDay());
      for (const k of PA_DATASETS) importDataset(k, files[k]);
      pushState();
      return { dir, files };
    },

    // ── 规则 ──
    'rules.save': (p: { rules: Partial<PaRules> }) => {
      const next = normalizeRules({ ...store.read().settings.rules, ...(p?.rules || {}) });
      const changed = JSON.stringify(next) !== JSON.stringify(store.read().settings.rules);
      store.update((s) => { s.settings.rules = next; });
      if (changed && JSON.stringify(store.read().run?.rules) !== JSON.stringify(next)) markStale(i18nT('运算规则已经改过'));
      pushState();
      return next;
    },
    'rules.reset': () => actions['rules.save']({ rules: defaultRules() }),

    // ── 第 2 步：运算 ──
    'compute.run': (p: { asOf?: string }) => {
      const s = store.read();
      const asOf = String(p?.asOf || localDay());
      if (!Number.isFinite(parseDay(asOf))) throw new Error(i18nT('基准日格式不对：{p0}', { p0: asOf }));
      const lacking = (['monthly', 'stock'] as PaDatasetKey[]).filter((k) => !s.datasets[k]?.loaded);
      if (lacking.length) throw new Error(i18nT('还没有投喂：{p0}', { p0: lacking.map(datasetLabel).join('、') }));
      const { results, summary } = runCompute(store.data(), s.settings.rules, asOf);
      if (!results.length) throw new Error(i18nT('投喂的数据里没有读到任何配件'));
      const id = newId('par');
      const entry = historyEntry('manual', id, results, summary, [], '');
      store.setResults('result', results);
      store.setResults('latest', results);
      store.update((st) => {
        st.run = { id, asOf, computedAt: entry.at, rules: { ...st.settings.rules }, summary, stale: false, staleReason: '', reviews: {}, edits: {}, replenishConfirmedAt: '', exported: null };
        st.history.unshift(entry);
        st.latest = { at: entry.at, asOf, source: 'manual', summary };
      });
      pushState();
      return summary;
    },

    // ── 第 3 步：检验行动计划 ──
    'review.set': (p: { items: Array<{ partNo: string; status?: PaReviewStatus; text?: string; remark?: string }> }) => {
      liveRun();
      const byNo = new Map(store.results('result').map((r) => [r.partNo, r]));
      const items = Array.isArray(p?.items) ? p.items : [];
      store.update((s) => {
        for (const it of items) {
          const r = byNo.get(String(it.partNo));
          if (!r || !planGroupOf(r)) continue;
          const cur: PaReview = s.run!.reviews[r.partNo] || { status: 'pending' };
          if (it.status === 'pending' || it.status === 'confirmed' || it.status === 'rejected') cur.status = it.status;
          if (it.text !== undefined) cur.text = String(it.text || '').slice(0, 2000);
          if (it.remark !== undefined) cur.remark = String(it.remark || '').slice(0, 500);
          cur.at = now();
          s.run!.reviews[r.partNo] = cur;
        }
        s.run!.replenishConfirmedAt = '';
      });
      pushState();
      return true;
    },
    'review.bulk': (p: { group: PaPlanGroup; status: PaReviewStatus; onlyPending?: boolean }) => {
      liveRun();
      if (p?.status !== 'pending' && p?.status !== 'confirmed' && p?.status !== 'rejected') throw new Error(i18nT('未知的检验结果'));
      let n = 0;
      const results = store.results('result');
      store.update((s) => {
        for (const r of results) {
          if (planGroupOf(r) !== p.group) continue;
          const cur: PaReview = s.run!.reviews[r.partNo] || { status: 'pending' };
          if (p.onlyPending !== false && cur.status !== 'pending') continue;
          cur.status = p.status; cur.at = now();
          s.run!.reviews[r.partNo] = cur;
          n += 1;
        }
        s.run!.replenishConfirmedAt = '';
      });
      pushState();
      return n;
    },

    // ── 第 4 步：补库清单 ──
    'replenish.set': (p: { items: Array<{ partNo: string } & PaReplenishEdit> }) => {
      const run = liveRun();
      const allowed = new Set(buildReplenishLines(store.results('result'), run.reviews, run.edits, run.asOf).map((l) => l.partNo));
      const items = Array.isArray(p?.items) ? p.items : [];
      for (const it of items) {
        if (!allowed.has(String(it.partNo))) throw new Error(i18nT('配件 {p0} 不在补库清单里', { p0: String(it.partNo) }));
        if (it.qty !== undefined && !(Number.isInteger(Number(it.qty)) && Number(it.qty) > 0)) throw new Error(i18nT('配件 {p0} 的下单数量要是大于 0 的整数', { p0: it.partNo }));
        if (it.expectDate !== undefined && it.expectDate !== '' && !Number.isFinite(parseDay(it.expectDate))) throw new Error(i18nT('配件 {p0} 的期望到货日格式不对', { p0: it.partNo }));
        if (it.unitPrice !== undefined && it.unitPrice !== null && !(Number(it.unitPrice) >= 0)) throw new Error(i18nT('配件 {p0} 的单价不能是负数', { p0: it.partNo }));
      }
      store.update((s) => {
        for (const it of items) {
          const cur: PaReplenishEdit = s.run!.edits[it.partNo] || {};
          if (it.selected !== undefined) cur.selected = !!it.selected;
          if (it.qty !== undefined) cur.qty = Number(it.qty);
          if (it.supplier !== undefined) cur.supplier = String(it.supplier || '').trim().slice(0, 120);
          if (it.expectDate !== undefined) { if (it.expectDate) cur.expectDate = it.expectDate; else delete cur.expectDate; }
          if (it.unitPrice !== undefined) cur.unitPrice = it.unitPrice === null ? null : Number(it.unitPrice);
          s.run!.edits[it.partNo] = cur;
        }
        s.run!.replenishConfirmedAt = '';
      });
      pushState();
      return true;
    },
    'replenish.confirm': () => {
      const run = liveRun();
      const results = store.results('result');
      const pending = pendingCounts(results, run.reviews);
      const left = PA_BLOCKING_GROUPS.reduce((a, g) => a + pending[g], 0);
      if (left) throw new Error(i18nT('还有 {n} 个缺货配件的行动计划没有检验，请先完成第 3 步', { n: left }));
      const totals = lineTotals(buildReplenishLines(results, run.reviews, run.edits, run.asOf));
      if (!totals.lines) throw new Error(i18nT('补库清单里没有勾选任何配件'));
      store.update((s) => { s.run!.replenishConfirmedAt = now(); });
      pushState();
      return totals;
    },

    // ── 第 5 步：转采购订单（人点了才写文件；不向任何系统提交）──
    'order.export': (): PaExported => {
      const run = liveRun();
      if (!run.replenishConfirmedAt) throw new Error(i18nT('补库清单还没有确认，请先完成第 4 步'));
      const results = store.results('result');
      const lines = buildReplenishLines(results, run.reviews, run.edits, run.asOf);
      const totals = lineTotals(lines);
      const dir = outputDir();
      const orderFile = exportPurchaseOrder(dir, lines, run.asOf);
      const planFile = exportStatusPlan(dir, results, run.reviews, run.summary);
      const exported: PaExported = { at: now(), orderFile, planFile, lines: totals.lines, qty: totals.qty, amount: totals.amount };
      store.update((s) => {
        s.run!.exported = exported;
        const h = s.history.find((x) => x.id === run.id);
        if (h) { h.files = [orderFile, planFile]; h.note = i18nT('已生成采购订单：{a} 行，数量 {b}', { a: totals.lines, b: totals.qty }); }
      });
      pushState();
      return exported;
    },
    'plan.export': () => {
      const run = liveRun();
      const file = exportStatusPlan(outputDir(), store.results('result'), run.reviews, run.summary);
      store.update((s) => { const h = s.history.find((x) => x.id === run.id); if (h && !h.files.includes(file)) h.files = [...h.files, file]; });
      pushState();
      return file;
    },

    // ── 定时运算 ──
    'schedule.save': (p: { schedule: Partial<PaSchedule> }) => {
      const next = normalizeSchedule({ ...store.read().settings.schedule, ...(p?.schedule || {}) });
      if (next.enabled && !next.folder) throw new Error(i18nT('开启定时运算前先选数据文件夹'));
      if (next.folder && !existsSync(next.folder)) throw new Error(i18nT('数据文件夹不存在：{p0}', { p0: next.folder }));
      if (next.emailEnabled && !next.emailTo) throw new Error(i18nT('开启邮件通知前先填收件人'));
      store.update((s) => {
        // 改了时间：今天还没到新时间的话允许再跑一次
        if (s.settings.schedule.time !== next.time) s.scheduleStatus.lastRunDay = '';
        s.settings.schedule = next;
      });
      pushState();
      return next;
    },
    'schedule.preview': () => {
      const sc = store.read().settings.schedule;
      if (!sc.folder || !existsSync(sc.folder)) return {};
      const found = pickNewestFiles(sc.folder, sc.keywords);
      return Object.fromEntries(Object.entries(found).map(([k, f]) => [k, f!.name]));
    },
    'schedule.runNow': () => runScheduled(),

    'history.clear': () => { store.update((s) => { s.history = []; }); pushState(); return true; },
  };

  ipcMain.handle(IPC_CHANNELS.WORKBENCH_PA_INVOKE, async (_e, req: { action: string; payload?: unknown }) => {
    const fn = actions[String(req?.action || '')];
    if (!fn) throw new Error(i18nT('未知操作：{p0}', { p0: String(req?.action || '') }));
    try {
      return await fn(req.payload ?? {});
    } catch (error) {
      logger?.warn?.('parts-alert', `${req.action} failed`, { error: (error as Error)?.message });
      throw new Error(userFacingError(error));
    }
  });
  // 卸载 / 停用时由方案入口 deactivate 调用（宿主只撤 IPC 通道，后台任务要自己停）
  return stopBackground;
}
