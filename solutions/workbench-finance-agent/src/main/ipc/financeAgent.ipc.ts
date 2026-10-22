/**
 * 解决方案 · 财务智能体工作台（主进程）。
 *
 * 一条动作通道 WORKBENCH_FA_INVOKE，按 action 分发到十个智能体 + 账套 / 数据对接 / 设置；
 * 状态变化经 WORKBENCH_FA_EVENT 推给渲染层。
 *
 * 合规边界（产品介绍里也这么写）：
 *   - 不提交纳税申报、不做电子签名、不改正式账套：凭证只导出成导入文件，申报表只出草稿；
 *   - 钱全部由 services/financeAgent 下的纯函数算，模型只抽字段、写文字，
 *     抽出来的值必须能在原文里找到，写出来的文字只许引用规则算好的数字；
 *   - 每个智能体用设置里明确指定的模型，结果上记下是哪个模型。
 */
import { app, dialog, ipcMain, shell, type BrowserWindow } from 'electron';
import { copyFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { basename, extname, join } from 'node:path';
import { randomBytes } from 'node:crypto';
import {
  IPC_CHANNELS,
  type FaAgingRun, type FaAllocBasis, type FaBudgetAnalysis, type FaBudgetLine, type FaContractReview, type FaCostMaterial,
  type FaCostProduct, type FaCostRun, type FaDoc, type FaExpenseClaim, type FaIitRow, type FaLedger, type FaLedgerInput,
  type FaModuleKey, type FaQaMessage, type FaReconcileRun, type FaRiskRun, type FaSettings, type FaState, type FaStatementRun,
  type FaTaxInputs, type FaTaxRun, type FaFiling, type FaFilingItem, type FaVoucher, type FaVoucherLine, type FaJournalRow,
} from '@totalclaw/ipc-contracts';
import { t as i18nT } from '@totalclaw/i18n';
import type { WorkbenchIpcDeps } from './workbenchApi';
import { userFacingError } from '../utils/userFacingError';
import { onAppWillQuit } from '../util/quitRegistry';
import { createWorkbenchLlm } from '../services/workbenchLlm';
import { FinanceAgentStore, newLedger } from '../services/financeAgent/store';
import {
  amountFoundIn, normalizePdfText, categoryNames, foundIn, localDate, newId, normDate, periodOf, round2, sum, fmt, pct, ACCOUNTS,
} from '../services/financeAgent/common';
import { checkDoc, classifyDoc, directionOf, docStatus, LLM_FILLABLE, parseInvoiceText } from '../services/financeAgent/invoice';
import { buildVoucher, isBalanced, journalToBalances, nextVoucherNo, normalizeLines, voucherExportRows, vouchersToJournal } from '../services/financeAgent/voucher';
import { computeTax, deriveTaxInputs, inPeriod, taxDraftRows, taxFindings } from '../services/financeAgent/tax';
import { claimNotice, deptSummary, reviewClaim } from '../services/financeAgent/expense';
import { buildAging, dunningLetter, matchRows, recSummary, reconcileLetter } from '../services/financeAgent/reconcile';
import { analysisFacts, buildStatements } from '../services/financeAgent/statements';
import { riskReportMarkdown, scanRisks } from '../services/financeAgent/risk';
import { actualsFromClaims, actualsFromJournal, analyzeBudget, budgetFacts, precheckSpend } from '../services/financeAgent/budget';
import { computeCost, costExportRows } from '../services/financeAgent/cost';
import {
  detectContractType, extractContractAmount, ruleFindings, stampDuty, typeLabel, verifyClauses, verifyLlmRisks,
} from '../services/financeAgent/contract';
import { chunkPolicy, citationsFor } from '../services/financeAgent/knowledge';
import {
  loadTable, parseAgingRows, parseBalances, parseBudget, parseCostMaterials, parseCostProducts, parseJournal, parsePayroll, parseRecRows,
} from '../services/financeAgent/tables';
import { FinanceApiReceiver, type ApiImportRequest } from '../services/financeAgent/apiReceiver';
import * as P from '../services/financeAgent/prompts';
import {
  buildFilingItems, checklistItems, portalUrl, provinces, taxLabel, upcomingDeadlines,
} from '../services/financeAgent/filing';
import { documentsFolderName } from '../services/brandPaths';

const store = new FinanceAgentStore();

const IMAGE_RE = /\.(jpe?g|png|heic|webp|bmp|tiff?)$/i;
const DOC_FILTERS: Record<string, { name: string; extensions: string[] }[]> = {
  invoice: [{ name: 'Invoice', extensions: ['pdf', 'ofd', 'xml', 'jpg', 'jpeg', 'png', 'heic', 'webp'] }],
  excel: [{ name: 'Excel', extensions: ['xlsx', 'xls', 'csv'] }],
  contract: [{ name: 'Contract', extensions: ['pdf', 'docx', 'doc', 'txt', 'jpg', 'jpeg', 'png'] }],
  policy: [{ name: 'Document', extensions: ['pdf', 'docx', 'doc', 'txt', 'md', 'xlsx'] }],
};

function requireFound<T>(value: T | undefined | null, what: string): T {
  if (value == null) throw new Error(i18nT('{p0}不存在或已删除', { p0: what }));
  return value;
}

function safeName(s: string): string {
  return String(s || '').replace(/[\\/:*?"<>|\r\n]/g, '_').trim().slice(0, 80) || 'file';
}

/** 任意文档 → 文本（PDF 文字层；扫描 PDF 与图片走本机 OCR；OFD / XML 读结构化内容） */
async function extractText(path: string): Promise<{ text: string; ocr: boolean; warning?: string }> {
  const r = await extractTextRaw(path);
  // PDF 文字层常见康熙部首兼容字符（⼦ ⽤ ⽇），规则和引用核对都按归一后的文字做
  return { ...r, text: normalizePdfText(r.text) };
}

async function extractTextRaw(path: string): Promise<{ text: string; ocr: boolean; warning?: string }> {
  const ext = extname(path).toLowerCase();
  if (IMAGE_RE.test(path)) {
    const { ocrAvailable, ocrImageFiles } = await import('../services/pdfOcr');
    if (!ocrAvailable()) return { text: '', ocr: false, warning: i18nT('本机不支持图片识别，请上传 PDF 电子发票，或识别后手工补全字段') };
    const m = await ocrImageFiles([path]);
    return { text: m.get(path) || '', ocr: true, warning: m.get(path) ? undefined : i18nT('图片里没有识别出文字') };
  }
  if (ext === '.ofd') {
    const AdmZip = (await import('adm-zip')).default;
    const zip = new AdmZip(path);
    const entries = zip.getEntries().filter((e) => /Pages\/Page_\d+\/Content\.xml$/i.test(e.entryName) || /original_invoice\.xml$/i.test(e.entryName));
    const text = entries.map((e) => [...e.getData().toString('utf-8').matchAll(/<ofd:TextCode[^>]*>([^<]*)<\/ofd:TextCode>|<(\w+)>([^<]{1,200})<\/\2>/g)]
      .map((m) => (m[1] != null ? m[1] : `${m[2]}: ${m[3]}`)).join('\n')).join('\n');
    return { text, ocr: false, warning: text ? undefined : i18nT('OFD 文件里没有读到文字') };
  }
  if (ext === '.xml') {
    const raw = readFileSync(path, 'utf-8');
    const text = [...raw.matchAll(/<(\w+)>([^<]{1,300})<\/\1>/g)].map((m) => `${m[1]}: ${m[2].trim()}`).join('\n');
    return { text, ocr: false };
  }
  const { extractDocument, mergeOcrPages } = await import('../services/documentExtractor');
  let doc = await extractDocument(path, basename(path));
  let ocr = false;
  if (doc.kind === 'pdf' && (doc as any).scannedPages?.length) {
    const { ocrAvailable, ocrPdfPages } = await import('../services/pdfOcr');
    if (ocrAvailable()) {
      const pages = await ocrPdfPages(path, (doc as any).scannedPages.slice(0, 20));
      if (pages.size) { doc = mergeOcrPages(doc, [...pages].map(([page, text]) => ({ page, text }))); ocr = true; }
    }
  }
  return { text: doc.text || '', ocr, warning: doc.warning };
}

export function registerFinanceAgentHandlers(deps: WorkbenchIpcDeps): void {
  const logger = deps.logger;
  const win = (): BrowserWindow | null => deps.getMainWindow?.() ?? null;
  const broadcast = (type: 'state' | 'progress', payload?: unknown): void => {
    try { win()?.webContents.send(IPC_CHANNELS.WORKBENCH_FA_EVENT, { type, payload }); } catch { /* 窗口已关 */ }
  };
  const progress = (key: string, message: string): void => broadcast('progress', { key, message });
  const pushState = (): void => broadcast('state');

  const settings = (): FaSettings => store.root().settings;
  const ledger = (): FaLedger => store.activeLedger();

  const outputRoot = (): string => {
    const s = settings();
    const root = s.outputDir && existsSync(s.outputDir) ? s.outputDir : join(app.getPath('documents'), documentsFolderName(), i18nT('财务智能体'));
    mkdirSync(root, { recursive: true });
    return root;
  };
  /** 结果文件：<输出目录>/<账套>/<模块>/ */
  const outDir = (module: string): string => {
    const d = join(outputRoot(), safeName(ledger().name), module);
    mkdirSync(d, { recursive: true });
    return d;
  };
  const stamp = (): string => {
    const d = new Date();
    return `${localDate(d).replace(/-/g, '')}-${String(d.getHours()).padStart(2, '0')}${String(d.getMinutes()).padStart(2, '0')}${String(d.getSeconds()).padStart(2, '0')}`;
  };

  const api = new FinanceApiReceiver(async (req) => apiImport(req));

  const publicState = (): FaState => {
    const r = store.root();
    return { ledgers: r.ledgers, activeLedgerId: r.activeLedgerId, settings: r.settings, data: store.data(), outputDir: outputRoot(), apiStatus: api.status(), categories: categoryNames() };
  };

  // ─── 模型 ───────────────────────────────────────────────────────────────

  const models = createWorkbenchLlm(deps, {
    logTag: 'finance-agent',
    moduleModel: (module) => settings().moduleModels[module as FaModuleKey] || '',
  });
  const llm = (module: FaModuleKey, prompt: string, timeoutMs?: number) => models.llm(module, prompt, timeoutMs);
  const llmJson = (module: FaModuleKey, prompt: string, timeoutMs?: number) => models.llmJson(module, prompt, timeoutMs);

  // ─── 统一数据口径：分析用的序时账 = 导入的序时账 + 本工作台审核过的凭证 ───────

  const journal = (): FaJournalRow[] => {
    const d = store.data();
    return [...(d.journal?.rows || []), ...vouchersToJournal(d.vouchers)];
  };
  const latestBalances = () => store.data().balances[0] || null;

  // ─── 票据识别（凭证 / 报销共用） ────────────────────────────────────────

  async function recognize(path: string, opts: { claimId?: string; progressKey: string }): Promise<FaDoc> {
    const l = ledger();
    const id = newId('doc');
    const dest = join(store.filesDir(), `${id}${extname(path).toLowerCase()}`);
    copyFileSync(path, dest);
    progress(opts.progressKey, i18nT('正在识别：{p0}', { p0: basename(path) }));
    const ex = await extractText(dest);
    const parsed = parseInvoiceText(ex.text);
    const fieldSource: FaDoc['fieldSource'] = {};
    const doc: FaDoc = {
      id, fileName: basename(path), path: dest, kind: parsed.kind, direction: 'unknown',
      invoiceCode: parsed.invoiceCode, invoiceNo: parsed.invoiceNo, date: parsed.date || undefined,
      sellerName: parsed.sellerName, sellerTaxId: parsed.sellerTaxId, buyerName: parsed.buyerName, buyerTaxId: parsed.buyerTaxId,
      amount: parsed.amount ?? 0, tax: parsed.tax ?? 0, total: parsed.total ?? 0, taxRate: parsed.taxRate ?? null, items: parsed.items,
      payer: parsed.payer, payee: parsed.payee, purpose: parsed.purpose, category: '', fieldSource, checks: [],
      text: ex.text.slice(0, 8000), ocr: ex.ocr, status: 'recognized', claimId: opts.claimId, createdAt: new Date().toISOString(),
    };
    for (const f of LLM_FILLABLE) if ((doc as any)[f] != null && (doc as any)[f] !== '' && (doc as any)[f] !== 0) fieldSource[f] = 'rule';

    // 规则没读全的关键字段交给模型补；补的值必须能在原文里找到
    const key = doc.kind === 'bank_receipt' ? ['total', 'date', 'payer', 'payee'] : ['invoiceNo', 'date', 'sellerName', 'total', 'amount'];
    const missing = LLM_FILLABLE.filter((f) => !fieldSource[f]);
    let llmCategory = '';
    if (ex.text.trim() && key.some((f) => !fieldSource[f])) {
      progress(opts.progressKey, i18nT('规则没读全，交给模型补字段：{p0}', { p0: doc.fileName }));
      try {
        const r = await llmJson('voucher', P.invoiceFillPrompt(ex.text, [...missing], categoryNames()), 120_000);
        doc.model = r.model;
        const fields = r.json?.fields || {};
        for (const f of missing) {
          const v = fields[f];
          if (v == null || v === '') continue;
          if (['amount', 'tax', 'total'].includes(f)) {
            const n = Number(String(v).replace(/[,¥￥\s]/g, ''));
            if (Number.isFinite(n) && amountFoundIn(ex.text, n)) { (doc as any)[f] = round2(n); fieldSource[f] = 'model'; }
          } else if (f === 'taxRate') {
            const n = Number(v);
            if (Number.isFinite(n) && n >= 0 && n < 1 && ex.text.includes(`${Math.round(n * 100)}%`)) { doc.taxRate = n; fieldSource[f] = 'model'; }
          } else if (f === 'date') {
            const d = normDate(v);
            // 原文的日期写法五花八门（2026年9月10日 / 2026-09-10 / 20260910）：比数字串
            const digits = ex.text.replace(/\D+/g, '');
            const [y, m, dd] = d ? d.split('-') : [];
            if (d && [`${y}${m}${dd}`, `${y}${Number(m)}${Number(dd)}`].some((x) => digits.includes(x))) { doc.date = d; fieldSource[f] = 'model'; }
          } else if (foundIn(ex.text, String(v))) { (doc as any)[f] = String(v).trim(); fieldSource[f] = 'model'; }
        }
        if (typeof r.json?.category === 'string' && categoryNames().includes(r.json.category)) llmCategory = r.json.category;
      } catch (error) {
        logger?.warn?.('finance-agent', 'invoice llm fill failed', { error: (error as Error)?.message });
        doc.checks.push({ code: 'llm_failed', level: 'warn', message: i18nT('模型补字段失败：{p0}', { p0: (error as Error)?.message || '' }) });
      }
      if (!doc.amount && doc.total && doc.tax != null) doc.amount = round2(doc.total - doc.tax);
      if (!doc.total && doc.amount) doc.total = round2(doc.amount + doc.tax);
    }
    doc.direction = directionOf(doc, l);
    const ruleCat = classifyDoc(doc, ex.text);
    doc.category = ruleCat === categoryNames().at(-1) && llmCategory ? llmCategory : ruleCat;
    const others = store.data().docs;
    doc.checks = [...doc.checks, ...(ex.warning ? [{ code: 'extract', level: 'warn' as const, message: ex.warning }] : []), ...checkDoc(doc, l, others)];
    if (ex.ocr) doc.checks.push({ code: 'ocr', level: 'warn', message: i18nT('文字由本机 OCR 识别，数字请对照原件核对') });
    doc.status = docStatus(doc.checks);
    return doc;
  }

  function recheck(doc: FaDoc): FaDoc {
    const l = ledger();
    doc.direction = directionOf(doc, l);
    const others = store.data().docs.filter((d) => d.id !== doc.id);
    doc.checks = checkDoc(doc, l, others);
    if (doc.status !== 'confirmed') doc.status = docStatus(doc.checks);
    return doc;
  }

  // ─── 导出 ───────────────────────────────────────────────────────────────

  async function writeXlsx(module: string, name: string, sheets: Array<{ name: string; rows: Record<string, unknown>[] }>): Promise<string> {
    const { writeWorkbook } = await import('../services/serviceSettlement/excel');
    const path = join(outDir(module), `${safeName(name)}-${stamp()}.xlsx`);
    writeWorkbook(path, sheets.map((s) => {
      const headers = [...new Set(s.rows.flatMap((r) => Object.keys(r)))];
      return { name: s.name, headers: headers.length ? headers : [i18nT('无数据')], rows: s.rows.map((r) => headers.map((h) => r[h] as any)) };
    }));
    return path;
  }
  function writeMd(module: string, name: string, body: string): string {
    const path = join(outDir(module), `${safeName(name)}-${stamp()}.md`);
    writeFileSync(path, body, 'utf-8');
    return path;
  }
  const findingRows = (list: { level: string; title: string; detail: string; suggestion: string }[]) => list.map((f) => ({
    [i18nT('级别')]: f.level === 'high' ? i18nT('高') : f.level === 'warn' ? i18nT('中') : i18nT('低'),
    [i18nT('问题')]: f.title, [i18nT('明细')]: f.detail, [i18nT('建议')]: f.suggestion,
  }));
  const reportLinesRows = (lines: { label: string; current: number; prior: number | null; indent?: number }[], cur: string, pri: string) => lines.map((l) => ({
    [i18nT('项目')]: `${'　'.repeat(l.indent || 0)}${l.label}`, [cur]: l.current, [pri]: l.prior ?? '',
  }));

  // ─── 数据对接：API 收数 ─────────────────────────────────────────────────

  async function apiImport(req: ApiImportRequest): Promise<{ ok: true; count: number; ledger: string }> {
    const r = store.root();
    const target = req.ledger ? r.ledgers.find((l) => l.id === req.ledger || l.name === req.ledger) : store.activeLedger();
    if (!target) throw new Error(i18nT('找不到账套「{p0}」', { p0: String(req.ledger) }));
    const rows = req.rows.filter((x) => x && typeof x === 'object') as Record<string, unknown>[];
    const headers = [...new Set(rows.flatMap((x) => Object.keys(x)))];
    const table = { path: '', fileName: 'API', sheetName: 'API', headers, rows: rows.map((x) => Object.fromEntries(headers.map((h) => [h, x[h] == null ? '' : String(x[h])]))) };
    let count = 0;
    if (req.kind === 'journal') {
      const parsed = parseJournal(table);
      store.update((d) => {
        const prev = d.journal?.rows || [];
        d.journal = { fileName: 'API', importedAt: new Date().toISOString(), source: 'api', rows: [...prev, ...parsed] };
      }, target.id);
      count = parsed.length;
    } else if (req.kind === 'balances') {
      const parsed = parseBalances(table);
      const period = String(req.period || periodOf(localDate()));
      store.update((d) => { d.balances = [{ period, fileName: 'API', importedAt: new Date().toISOString(), rows: parsed }, ...d.balances.filter((b) => b.period !== period)].slice(0, 24); }, target.id);
      count = parsed.length;
    } else if (req.kind === 'budget') {
      const parsed = parseBudget(table);
      store.update((d) => { d.budget = { year: Number(req.year) || new Date().getFullYear(), lines: parsed }; }, target.id);
      count = parsed.length;
    } else {
      throw new Error(i18nT('kind 只支持 journal / balances / budget'));
    }
    logger?.info?.('finance-agent', 'api import', { kind: req.kind, count, ledger: target.name });
    pushState();
    return { ok: true, count, ledger: target.name };
  }

  async function applyApiSetting(): Promise<void> {
    const a = settings().apiReceiver;
    if (!a.enabled) { await api.stop(); return; }
    if (!a.token) store.updateRoot((r) => { r.settings.apiReceiver.token = randomBytes(18).toString('hex'); });
    try { await api.start(settings().apiReceiver.port, settings().apiReceiver.token); } catch (error) {
      logger?.warn?.('finance-agent', 'api receiver start failed', { error: (error as Error)?.message });
    }
  }

  // ─── 动作 ───────────────────────────────────────────────────────────────

  const actions: Record<string, (p: any) => unknown> = {
    'state.get': () => publicState(),
    'models.list': () => models.modelOptions(),

    'settings.patch': async (p: { patch: Partial<FaSettings> }) => {
      const out = store.updateRoot((r) => {
        for (const [k, v] of Object.entries(p?.patch || {})) {
          const cur = (r.settings as any)[k];
          (r.settings as any)[k] = cur && typeof cur === 'object' && !Array.isArray(cur) && v && typeof v === 'object' && !Array.isArray(v) ? { ...cur, ...v } : v;
        }
        return r.settings;
      });
      if (p?.patch?.apiReceiver) await applyApiSetting();
      pushState();
      return out;
    },
    'api.regenerateToken': async () => {
      store.updateRoot((r) => { r.settings.apiReceiver.token = randomBytes(18).toString('hex'); });
      await applyApiSetting();
      pushState();
      return settings().apiReceiver.token;
    },
    'outputDir.pick': async () => {
      const r = await dialog.showOpenDialog(win()!, { properties: ['openDirectory', 'createDirectory'] });
      if (r.canceled || !r.filePaths[0]) return null;
      store.updateRoot((st) => { st.settings.outputDir = r.filePaths[0]; });
      pushState();
      return r.filePaths[0];
    },
    'files.pick': async (p: { kind?: string; multi?: boolean }) => {
      const r = await dialog.showOpenDialog(win()!, { properties: p?.multi ? ['openFile', 'multiSelections'] : ['openFile'], filters: DOC_FILTERS[p?.kind || ''] });
      return r.canceled ? [] : r.filePaths;
    },
    'path.open': async (p: { path: string; reveal?: boolean }) => {
      if (!p?.path || !existsSync(p.path)) throw new Error(i18nT('文件不存在'));
      if (p.reveal) { shell.showItemInFolder(p.path); return true; }
      const err = await shell.openPath(p.path);
      if (err) throw new Error(err);
      return true;
    },

    // 账套（代账公司一个客户一个账套；账套记忆 = notes）
    'ledger.save': (p: { input: FaLedgerInput }) => {
      const input = p?.input;
      if (!input?.name?.trim()) throw new Error(i18nT('请填写账套名称（公司名）'));
      const out = store.updateRoot((r) => {
        const cur = input.id ? r.ledgers.find((l) => l.id === input.id) : undefined;
        if (cur) { Object.assign(cur, newLedger({ ...cur, ...input, name: input.name, id: cur.id, createdAt: cur.createdAt })); return cur; }
        const l = newLedger({ ...input, name: input.name });
        r.ledgers.push(l);
        r.activeLedgerId = l.id;
        return l;
      });
      // 抬头变了：重新判断票据方向
      store.update((d) => { d.docs.forEach(recheck); });
      pushState();
      return out;
    },
    'ledger.switch': (p: { id: string }) => {
      store.updateRoot((r) => { requireFound(r.ledgers.find((l) => l.id === p.id), i18nT('账套')); r.activeLedgerId = p.id; });
      pushState();
      return publicState();
    },
    'ledger.remove': (p: { id: string }) => {
      const r = store.root();
      if (r.ledgers.length <= 1) throw new Error(i18nT('至少保留一个账套'));
      store.updateRoot((st) => {
        st.ledgers = st.ledgers.filter((l) => l.id !== p.id);
        if (st.activeLedgerId === p.id) st.activeLedgerId = st.ledgers[0].id;
      });
      store.removeLedger(p.id);
      pushState();
      return true;
    },
    'ledger.remember': (p: { text: string }) => {
      const text = String(p?.text || '').trim();
      if (!text) return ledger();
      const out = store.updateRoot((r) => {
        const l = r.ledgers.find((x) => x.id === r.activeLedgerId)!;
        l.notes = `${l.notes ? `${l.notes}\n` : ''}[${localDate()}] ${text}`.slice(-6000);
        return l;
      });
      pushState();
      return out;
    },

    // 数据对接：账套导出的序时账 / 科目余额表
    'data.importJournal': (p: { path: string; append?: boolean }) => {
      const rows = parseJournal(loadTable(p.path));
      if (!rows.length) throw new Error(i18nT('序时账里没有读到有效分录（需要日期、科目、借方、贷方列）'));
      store.update((d) => {
        d.journal = { fileName: basename(p.path), importedAt: new Date().toISOString(), source: 'excel', rows: p.append && d.journal ? [...d.journal.rows, ...rows] : rows };
      });
      pushState();
      const debit = sum(rows.map((r) => r.debit));
      const credit = sum(rows.map((r) => r.credit));
      return { count: rows.length, debit, credit, balanced: Math.abs(debit - credit) < 0.01, from: rows.map((r) => r.date).filter(Boolean).sort()[0], to: rows.map((r) => r.date).filter(Boolean).sort().at(-1) };
    },
    'data.importBalances': (p: { path: string; period: string }) => {
      const rows = parseBalances(loadTable(p.path));
      if (!rows.length) throw new Error(i18nT('科目余额表里没有读到数据'));
      const period = /^\d{4}-\d{2}$/.test(p.period) ? p.period : periodOf(localDate());
      store.update((d) => { d.balances = [{ period, fileName: basename(p.path), importedAt: new Date().toISOString(), rows }, ...d.balances.filter((b) => b.period !== period)].slice(0, 24); });
      pushState();
      return { count: rows.length, period };
    },
    'data.clear': (p: { kind: 'journal' | 'balances'; period?: string }) => {
      store.update((d) => {
        if (p.kind === 'journal') d.journal = null;
        else d.balances = p.period ? d.balances.filter((b) => b.period !== p.period) : [];
      });
      pushState();
      return true;
    },

    // ① 凭证处理
    'doc.import': async (p: { paths: string[] }) => {
      const out: FaDoc[] = [];
      for (const path of p?.paths || []) {
        try {
          const doc = await recognize(path, { progressKey: 'voucher' });
          store.update((d) => { d.docs.unshift(doc); });
          out.push(doc);
          pushState();
        } catch (error) {
          logger?.warn?.('finance-agent', 'recognize failed', { path, error: (error as Error)?.message });
          progress('voucher', i18nT('{p0} 识别失败：{p1}', { p0: basename(path), p1: (error as Error)?.message || '' }));
        }
      }
      progress('voucher', '');
      return { count: out.length, flagged: out.filter((d) => d.status === 'flagged').length };
    },
    'doc.update': (p: { id: string; patch: Partial<FaDoc> }) => {
      const out = store.update((d) => {
        const doc = requireFound(d.docs.find((x) => x.id === p.id), i18nT('票据'));
        const allowed = ['kind', 'direction', 'invoiceCode', 'invoiceNo', 'date', 'sellerName', 'sellerTaxId', 'buyerName', 'buyerTaxId', 'amount', 'tax', 'total', 'taxRate', 'payer', 'payee', 'purpose', 'category', 'status'];
        for (const [k, v] of Object.entries(p.patch || {})) {
          if (!allowed.includes(k)) continue;
          (doc as any)[k] = ['amount', 'tax', 'total'].includes(k) ? round2(Number(v) || 0) : v;
          if (k !== 'status' && k !== 'category') doc.fieldSource[k] = 'manual';
        }
        const manualDirection = p.patch && 'direction' in p.patch;
        const keepDir = doc.direction;
        recheck(doc);
        if (manualDirection) doc.direction = keepDir;
        if (p.patch?.status === 'confirmed') doc.status = 'confirmed';
        return doc;
      });
      pushState();
      return out;
    },
    'doc.remove': (p: { id: string }) => {
      store.update((d) => {
        d.docs = d.docs.filter((x) => x.id !== p.id);
        d.vouchers = d.vouchers.filter((v) => !(v.status === 'draft' && v.sourceDocIds.includes(p.id)));
      });
      pushState();
      return true;
    },
    'voucher.generate': (p: { docIds?: string[]; includeFlagged?: boolean }) => {
      const l = ledger();
      const res = store.update((d) => {
        let created = 0;
        const skipped: string[] = [];
        const targets = d.docs.filter((x) => !x.claimId && !x.voucherId && (!p?.docIds?.length || p.docIds.includes(x.id)));
        for (const doc of targets) {
          if (doc.status === 'flagged' && !p?.includeFlagged) { skipped.push(i18nT('{p0}：有异常未处理', { p0: doc.fileName })); continue; }
          const v = buildVoucher(doc, l, d.vouchers);
          if (!v) { skipped.push(i18nT('{p0}：判断不出是进项还是销项，请先确认抬头', { p0: doc.fileName })); continue; }
          d.vouchers.push(v);
          doc.voucherId = v.id;
          created += 1;
        }
        return { created, skipped };
      });
      pushState();
      return res;
    },
    'voucher.create': (p: { date: string; lines: Partial<FaVoucherLine>[] }) => {
      const lines = normalizeLines(p.lines || []);
      if (lines.length < 2 || !isBalanced(lines)) throw new Error(i18nT('分录至少两行，且借贷必须相等'));
      const date = normDate(p.date) || localDate();
      const out = store.update((d) => {
        const v: FaVoucher = { id: newId('vch'), no: nextVoucherNo(d.vouchers, periodOf(date)), date, period: periodOf(date), lines, sourceDocIds: [], status: 'draft', basis: i18nT('手工录入'), origin: 'manual', createdAt: new Date().toISOString() };
        d.vouchers.push(v);
        return v;
      });
      pushState();
      return out;
    },
    'voucher.update': (p: { id: string; date?: string; lines: Partial<FaVoucherLine>[] }) => {
      const lines = normalizeLines(p.lines || []);
      if (lines.length < 2 || !isBalanced(lines)) throw new Error(i18nT('借方合计 {a} ≠ 贷方合计 {b}，改完要借贷平衡', { a: fmt(sum(lines.map((l) => l.debit))), b: fmt(sum(lines.map((l) => l.credit))) }));
      const out = store.update((d) => {
        const v = requireFound(d.vouchers.find((x) => x.id === p.id), i18nT('凭证'));
        v.lines = lines;
        if (p.date && normDate(p.date)) { v.date = normDate(p.date); v.period = periodOf(v.date); }
        v.status = 'draft';
        return v;
      });
      pushState();
      return out;
    },
    'voucher.review': (p: { ids: string[]; undo?: boolean }) => {
      const res = store.update((d) => {
        let n = 0;
        for (const v of d.vouchers) {
          if (!p.ids.includes(v.id)) continue;
          if (p.undo) { v.status = 'draft'; v.reviewedAt = undefined; n += 1; continue; }
          if (!isBalanced(v.lines)) continue;
          v.status = 'reviewed';
          v.reviewedAt = new Date().toISOString();
          n += 1;
          for (const id of v.sourceDocIds) { const doc = d.docs.find((x) => x.id === id); if (doc) doc.status = 'confirmed'; }
        }
        return n;
      });
      pushState();
      return res;
    },
    'voucher.remove': (p: { id: string }) => {
      store.update((d) => {
        d.vouchers = d.vouchers.filter((v) => v.id !== p.id);
        d.docs.forEach((x) => { if (x.voucherId === p.id) x.voucherId = undefined; });
      });
      pushState();
      return true;
    },
    'voucher.export': async (p: { period?: string; onlyReviewed?: boolean }) => {
      const d = store.data();
      const list = d.vouchers.filter((v) => (!p?.period || v.period === p.period) && (!p?.onlyReviewed || v.status === 'reviewed')).sort((a, b) => a.date.localeCompare(b.date) || a.no.localeCompare(b.no));
      const docs = d.docs.filter((x) => !x.claimId && (!p?.period || periodOf(x.date || '') === p.period));
      const docRows = docs.map((x) => ({
        [i18nT('文件')]: x.fileName, [i18nT('类型')]: x.kind, [i18nT('方向')]: x.direction === 'in' ? i18nT('进项') : x.direction === 'out' ? i18nT('销项') : '-',
        [i18nT('号码')]: x.invoiceNo || '', [i18nT('日期')]: x.date || '', [i18nT('销售方')]: x.sellerName || x.payee || '', [i18nT('购买方')]: x.buyerName || x.payer || '',
        [i18nT('金额')]: x.amount, [i18nT('税额')]: x.tax, [i18nT('价税合计')]: x.total, [i18nT('类别')]: x.category,
        [i18nT('校验')]: x.checks.filter((c) => c.level !== 'ok').map((c) => c.message).join(i18nT('；')) || i18nT('通过'),
      }));
      const path = await writeXlsx('voucher', i18nT('凭证草稿{p0}', { p0: p?.period ? `-${p.period}` : '' }), [
        { name: i18nT('凭证导入'), rows: voucherExportRows(list) },
        { name: i18nT('识别校验报告'), rows: docRows },
        { name: i18nT('异常票据'), rows: docRows.filter((_, i) => docs[i].status === 'flagged') },
      ]);
      return { path, vouchers: list.length };
    },
    'accounts.list': () => ACCOUNTS,

    // ② 税务申报
    'tax.derive': (p: { period: string }) => deriveTaxInputs(store.data().docs, journal(), p.period, ledger()),
    'tax.importPayroll': (p: { path: string; monthIndex: number }) => parsePayroll(loadTable(p.path), Math.max(1, Number(p.monthIndex) || 1)),
    'tax.compute': (p: { period: string; inputs: FaTaxInputs; iitRows: FaIitRow[] }) => {
      const l = ledger();
      const s = settings().tax;
      const result = computeTax(p.inputs, l, s, p.iitRows || []);
      const findings = taxFindings(p.inputs, result, l, s, store.data().docs, p.period);
      const run: FaTaxRun = { id: newId('tax'), period: p.period, inputs: p.inputs, iitRows: p.iitRows || [], result, findings, createdAt: new Date().toISOString() };
      store.update((d) => { d.taxRuns = [run, ...d.taxRuns.filter((x) => x.period !== p.period)].slice(0, 36); });
      pushState();
      return run;
    },
    'tax.note': async (p: { id: string }) => {
      const run = requireFound(store.data().taxRuns.find((x) => x.id === p.id), i18nT('申报草稿'));
      const facts = [...run.result.vat, ...run.result.surcharges, ...run.result.cit].map((l) => `${l.label}：${l.formula} = ${typeof l.value === 'number' && l.value < 1 && l.value > 0 ? pct(l.value) : fmt(l.value)}`).join('\n')
        + `\n${i18nT('个税代扣合计')}：${fmt(run.result.iitTotal)}（${run.result.iit.length}）` + (run.result.burdenRate != null ? `\n${i18nT('增值税税负率')}：${pct(run.result.burdenRate)}` : '');
      const findings = run.findings.map((f) => `- ${f.title}：${f.detail}`).join('\n');
      const r = await llm('tax', P.taxNotePrompt(ledger().name, run.period, facts, findings));
      const out = store.update((d) => { const t = d.taxRuns.find((x) => x.id === p.id)!; t.note = r.text.trim(); t.model = r.model; return t; });
      pushState();
      return out;
    },
    'tax.export': async (p: { id: string }) => {
      const run = requireFound(store.data().taxRuns.find((x) => x.id === p.id), i18nT('申报草稿'));
      const iit = run.result.iit.map((r) => ({
        [i18nT('姓名')]: r.name, [i18nT('本月收入')]: r.salary, [i18nT('累计应纳税所得额')]: r.taxableYtd ?? '', [i18nT('税率')]: r.rate != null ? pct(r.rate, 0) : '',
        [i18nT('速算扣除数')]: r.quickDeduction ?? '', [i18nT('累计已预扣')]: r.ytdTaxPaid, [i18nT('本月应预扣')]: r.taxThisMonth ?? '',
      }));
      const path = await writeXlsx('tax', i18nT('申报表草稿-{p0}', { p0: run.period }), [
        { name: i18nT('申报表草稿'), rows: taxDraftRows(run.period, ledger(), run.result) },
        { name: i18nT('个税明细'), rows: iit },
        { name: i18nT('风险预检'), rows: findingRows(run.findings) },
      ]);
      if (run.note) writeMd('tax', i18nT('申报备注-{p0}', { p0: run.period }), run.note);
      store.update((d) => { const t = d.taxRuns.find((x) => x.id === p.id); if (t) t.exportPath = path; });
      pushState();
      return { path };
    },
    'tax.remove': (p: { id: string }) => { store.update((d) => { d.taxRuns = d.taxRuns.filter((x) => x.id !== p.id); }); pushState(); return true; },

    // ②b 申报上报：人登录电子税务局 → 数字员工按草稿代填、停在提交前 → 人点提交 → 登记回执与缴款
    'filing.meta': () => ({
      checklist: checklistItems(),
      provinces: provinces(),
      portal: portalUrl(settings().taxPortal),
      deadlines: upcomingDeadlines(ledger(), store.data().filings).map((d) => ({ ...d, label: taxLabel(d.tax) })),
    }),
    'filing.create': (p: { taxRunId: string; statementId?: string }) => {
      const d = store.data();
      const run = requireFound(d.taxRuns.find((x) => x.id === p.taxRunId), i18nT('申报草稿'));
      const stmt = p.statementId ? d.statements.find((x) => x.id === p.statementId) || null : null;
      const existing = d.filings.find((f) => f.taxRunId === run.id);
      if (existing) return existing;
      const f: FaFiling = { id: newId('fil'), period: run.period, taxRunId: run.id, statementId: stmt?.id, items: buildFilingItems(run, stmt), checklist: {}, createdAt: new Date().toISOString() };
      store.update((dd) => { dd.filings.unshift(f); dd.filings.splice(60); });
      pushState();
      return f;
    },
    'filing.check': (p: { id: string; key: string; value: boolean }) => {
      const out = store.update((d) => { const f = requireFound(d.filings.find((x) => x.id === p.id), i18nT('申报记录')); f.checklist[p.key] = !!p.value; return f; });
      pushState();
      return out;
    },
    'filing.instruction': (p: { id: string }) => {
      const d = store.data();
      const f = requireFound(d.filings.find((x) => x.id === p.id), i18nT('申报记录'));
      const missing = checklistItems().filter((c) => !f.checklist[c.key]);
      if (missing.length) throw new Error(i18nT('申报前核对清单还有 {n} 项没勾：{p0}', { n: missing.length, p0: missing.map((c) => c.label).join(i18nT('；')) }));
      const run = requireFound(d.taxRuns.find((x) => x.id === f.taxRunId), i18nT('申报草稿'));
      const l = ledger();
      const lines = (arr: { label: string; formula: string; value: number }[]) => arr.map((x) => `${x.label}：${x.value < 1 && x.value > 0 ? pct(x.value) : fmt(x.value)}（${x.formula}）`);
      const sections: Array<{ title: string; lines: string[] }> = [];
      for (const it of f.items) {
        if (it.tax === 'vat') sections.push({ title: taxLabel('vat'), lines: [...lines(run.result.vat), ...run.inputs.salesByRate.map((g) => i18nT('{r} 税率：销售额 {a}，税额 {b}', { r: pct(g.rate, 0), a: fmt(g.amount), b: fmt(g.tax) }))] });
        if (it.tax === 'surcharge') sections.push({ title: taxLabel('surcharge'), lines: lines(run.result.surcharges) });
        if (it.tax === 'cit') sections.push({ title: taxLabel('cit'), lines: lines(run.result.cit) });
        if (it.tax === 'iit') sections.push({ title: taxLabel('iit'), lines: run.result.iit.map((r) => i18nT('{p0}：本月收入 {a}，累计应纳税所得额 {b}，本月应预扣 {c}', { p0: r.name, a: fmt(r.salary), b: fmt(r.taxableYtd || 0), c: fmt(r.taxThisMonth || 0) })) });
        if (it.tax === 'statements') {
          const st = d.statements.find((x) => x.id === f.statementId);
          if (st) sections.push({ title: taxLabel('statements'), lines: [...st.balanceSheet, ...st.income].filter((x) => x.bold || x.current).map((x) => `${x.label}：${fmt(x.current)}${x.prior != null ? `（${i18nT('上期 / 期初')} ${fmt(x.prior)}）` : ''}`) });
        }
      }
      return P.filingInstruction({
        ledger: l.name, taxId: l.taxId || i18nT('（账套未填税号）'), taxpayer: l.taxpayerType === 'general' ? i18nT('一般纳税人') : i18nT('小规模纳税人'),
        period: f.period, portal: portalUrl(settings().taxPortal), sections,
      });
    },
    'filing.handed': (p: { id: string; conversationId?: string }) => {
      const out = store.update((d) => {
        const f = requireFound(d.filings.find((x) => x.id === p.id), i18nT('申报记录'));
        f.conversationId = p.conversationId;
        f.handedAt = new Date().toISOString();
        f.items.forEach((i) => { if (i.status === 'pending') i.status = 'handed'; });
        return f;
      });
      pushState();
      return out;
    },
    'filing.updateItem': (p: { id: string; tax: string; patch: Partial<FaFilingItem> }) => {
      const out = store.update((d) => {
        const f = requireFound(d.filings.find((x) => x.id === p.id), i18nT('申报记录'));
        const it = requireFound(f.items.find((x) => x.tax === p.tax), i18nT('申报事项'));
        const patch = p.patch || {};
        if (patch.status) it.status = patch.status;
        if (patch.receiptNo !== undefined) it.receiptNo = String(patch.receiptNo || '').trim() || undefined;
        if (patch.note !== undefined) it.note = String(patch.note || '').slice(0, 500) || undefined;
        if (patch.paidAmount !== undefined) it.paidAmount = round2(Number(patch.paidAmount) || 0);
        if (it.status === 'filed' && !it.filedAt) it.filedAt = new Date().toISOString();
        if (it.status === 'paid') { it.filedAt ||= new Date().toISOString(); it.paidAt ||= new Date().toISOString(); if (it.paidAmount == null) it.paidAmount = it.amount; }
        return f;
      });
      pushState();
      return out;
    },
    'filing.attachReceipt': (p: { id: string; tax: string; path: string }) => {
      const dest = join(store.filesDir(), `receipt-${p.id}-${p.tax}${extname(p.path).toLowerCase()}`);
      copyFileSync(p.path, dest);
      const out = store.update((d) => {
        const f = requireFound(d.filings.find((x) => x.id === p.id), i18nT('申报记录'));
        const it = requireFound(f.items.find((x) => x.tax === p.tax), i18nT('申报事项'));
        it.receiptPath = dest;
        if (it.status === 'pending' || it.status === 'handed') { it.status = 'filed'; it.filedAt = new Date().toISOString(); }
        return f;
      });
      pushState();
      return out;
    },
    'filing.remove': (p: { id: string }) => { store.update((d) => { d.filings = d.filings.filter((x) => x.id !== p.id); }); pushState(); return true; },
    'filing.export': async () => {
      const d = store.data();
      const stat = { pending: i18nT('待申报'), handed: i18nT('已交给数字员工代填'), filed: i18nT('已申报'), paid: i18nT('已缴款') };
      const rows = d.filings.flatMap((f) => f.items.map((i) => ({
        [i18nT('所属期')]: f.period, [i18nT('税种')]: taxLabel(i.tax), [i18nT('应纳税额')]: i.amount, [i18nT('状态')]: stat[i.status],
        [i18nT('回执号')]: i.receiptNo || '', [i18nT('申报时间')]: i.filedAt?.slice(0, 16).replace('T', ' ') || '',
        [i18nT('缴款金额')]: i.paidAmount ?? '', [i18nT('缴款时间')]: i.paidAt?.slice(0, 16).replace('T', ' ') || '', [i18nT('备注')]: i.note || '',
      })));
      return { path: await writeXlsx('filing', i18nT('申报台账'), [{ name: i18nT('申报台账'), rows }]) };
    },

    // ③ 费用报销
    'claim.create': (p: { employee: string; dept: string; level?: string; reason?: string }) => {
      if (!p?.employee?.trim()) throw new Error(i18nT('请填写报销人'));
      const claim: FaExpenseClaim = { id: newId('clm'), employee: p.employee.trim(), dept: String(p.dept || '').trim(), level: String(p.level || '').trim(), reason: String(p.reason || '').trim(), items: [], total: 0, verdict: 'pending', rejectReasons: [], createdAt: new Date().toISOString() };
      store.update((d) => { d.claims.unshift(claim); });
      pushState();
      return claim;
    },
    'claim.addDocs': async (p: { id: string; paths: string[] }) => {
      requireFound(store.data().claims.find((c) => c.id === p.id), i18nT('报销单'));
      for (const path of p.paths || []) {
        try {
          const doc = await recognize(path, { claimId: p.id, progressKey: 'expense' });
          store.update((d) => {
            d.docs.unshift(doc);
            const c = d.claims.find((x) => x.id === p.id);
            c?.items.push({ docId: doc.id, category: doc.category, amount: doc.total, date: doc.date, checks: [] });
          });
        } catch (error) {
          progress('expense', i18nT('{p0} 识别失败：{p1}', { p0: basename(path), p1: (error as Error)?.message || '' }));
        }
      }
      progress('expense', '');
      return reviewOne(p.id);
    },
    'claim.review': (p: { id: string }) => reviewOne(p.id),
    'claim.setCategory': (p: { id: string; docId: string; category: string }) => {
      store.update((d) => { const doc = d.docs.find((x) => x.id === p.docId); if (doc) doc.category = p.category; });
      return reviewOne(p.id);
    },
    'claim.removeDoc': (p: { id: string; docId: string }) => {
      store.update((d) => {
        d.docs = d.docs.filter((x) => x.id !== p.docId);
        const c = d.claims.find((x) => x.id === p.id);
        if (c) c.items = c.items.filter((i) => i.docId !== p.docId);
      });
      return reviewOne(p.id);
    },
    'claim.decide': (p: { id: string; decision: 'approved' | 'rejected' }) => {
      const out = store.update((d) => {
        const c = requireFound(d.claims.find((x) => x.id === p.id), i18nT('报销单'));
        c.decision = p.decision;
        c.decidedAt = new Date().toISOString();
        c.notice = claimNotice(p.decision === 'rejected' && !c.rejectReasons.length ? { ...c, verdict: 'reject', rejectReasons: [i18nT('财务复核未通过')] } : c, ledger().name);
        return c;
      });
      pushState();
      return out;
    },
    'claim.remove': (p: { id: string }) => {
      store.update((d) => { d.claims = d.claims.filter((c) => c.id !== p.id); d.docs = d.docs.filter((x) => x.claimId !== p.id); });
      pushState();
      return true;
    },
    'claim.summary': () => deptSummary(store.data().claims),
    'claim.export': async () => {
      const d = store.data();
      const rows = d.claims.flatMap((c) => c.items.map((i) => {
        const doc = d.docs.find((x) => x.id === i.docId);
        return {
          [i18nT('报销人')]: c.employee, [i18nT('部门')]: c.dept, [i18nT('事由')]: c.reason, [i18nT('票据')]: doc?.fileName || '', [i18nT('类别')]: i.category,
          [i18nT('日期')]: i.date || '', [i18nT('金额')]: i.amount,
          [i18nT('预审')]: { pass: i18nT('通过'), reject: i18nT('驳回'), review: i18nT('待人工'), pending: i18nT('未审') }[c.verdict],
          [i18nT('财务结论')]: c.decision === 'approved' ? i18nT('已通过') : c.decision === 'rejected' ? i18nT('已驳回') : '',
          [i18nT('问题')]: i.checks.filter((x) => x.level !== 'ok').map((x) => x.message).join(i18nT('；')),
        };
      }));
      const summary = deptSummary(d.claims).map((g) => ({ [i18nT('部门')]: g.dept, [i18nT('类别')]: g.category, [i18nT('张数')]: g.count, [i18nT('金额')]: g.amount }));
      return { path: await writeXlsx('expense', i18nT('报销预审'), [{ name: i18nT('报销明细'), rows }, { name: i18nT('部门归集'), rows: summary }]) };
    },
    'claim.polishNotice': async (p: { id: string }) => {
      const c = requireFound(store.data().claims.find((x) => x.id === p.id), i18nT('报销单'));
      const base = c.notice || claimNotice(c, ledger().name);
      const r = await llm('expense', P.expenseNoticePrompt(base));
      // 改写后数字不许变：原通知里的每个金额都要还在
      const nums = base.match(/\d[\d,]*\.\d{2}/g) || [];
      const text = nums.every((n) => r.text.includes(n)) ? r.text.trim() : base;
      const out = store.update((d) => { const t = d.claims.find((x) => x.id === p.id)!; t.notice = text; return t; });
      pushState();
      return out;
    },

    // ④ 往来对账
    'rec.run': (p: { side: 'ar' | 'ap'; oursPath: string; theirsPath: string; asOf?: string; counterparty?: string }) => {
      const ours = parseRecRows(loadTable(p.oursPath), p.side, 'ours');
      const theirs = parseRecRows(loadTable(p.theirsPath), p.side, 'theirs');
      const matches = matchRows(ours.rows, theirs.rows);
      const s = recSummary(matches);
      const asOf = normDate(p.asOf) || localDate();
      const run: FaReconcileRun = {
        id: newId('rec'), side: p.side, counterparty: String(p.counterparty || ours.counterparty || theirs.counterparty || ''), asOf,
        oursFile: basename(p.oursPath), theirsFile: basename(p.theirsPath), matches, balanceOurs: s.balanceOurs, balanceTheirs: s.balanceTheirs, createdAt: new Date().toISOString(),
      };
      run.letter = reconcileLetter(run, ledger().name);
      store.update((d) => { d.reconciles.unshift(run); d.reconciles.splice(30); });
      pushState();
      return run;
    },
    'rec.export': async (p: { id: string }) => {
      const run = requireFound(store.data().reconciles.find((x) => x.id === p.id), i18nT('对账记录'));
      const statusLabel = { matched: i18nT('一致'), amount_diff: i18nT('金额不符'), only_ours: i18nT('我方有对方无'), only_theirs: i18nT('对方有我方无') };
      const rows = run.matches.map((m) => ({
        [i18nT('状态')]: statusLabel[m.status], [i18nT('我方日期')]: m.ours?.date || '', [i18nT('我方单号')]: m.ours?.ref || '', [i18nT('我方金额')]: m.ours?.amount ?? '',
        [i18nT('对方日期')]: m.theirs?.date || '', [i18nT('对方单号')]: m.theirs?.ref || '', [i18nT('对方金额')]: m.theirs?.amount ?? '', [i18nT('差额')]: m.diff, [i18nT('说明')]: m.note || '',
      }));
      const path = await writeXlsx('reconcile', i18nT('对账-{p0}', { p0: run.counterparty || run.id }), [{ name: i18nT('逐笔比对'), rows }]);
      if (run.letter) writeMd('reconcile', i18nT('对账函-{p0}', { p0: run.counterparty || run.id }), run.letter);
      store.update((d) => { const t = d.reconciles.find((x) => x.id === p.id); if (t) t.exportPath = path; });
      pushState();
      return { path };
    },
    'rec.remove': (p: { id: string }) => { store.update((d) => { d.reconciles = d.reconciles.filter((x) => x.id !== p.id); }); pushState(); return true; },
    'aging.run': (p: { side: 'ar' | 'ap'; path: string; asOf?: string; termsDays?: number }) => {
      const asOf = normDate(p.asOf) || localDate();
      const rows = parseAgingRows(loadTable(p.path), Math.max(0, Number(p.termsDays) || 30));
      if (!rows.length) throw new Error(i18nT('台账里没有读到未结款项'));
      const a = buildAging(rows, asOf, p.side, settings().risk.staleDays);
      const run: FaAgingRun = { id: newId('age'), side: p.side, asOf, fileName: basename(p.path), ...a, createdAt: new Date().toISOString() };
      store.update((d) => { d.agings.unshift(run); d.agings.splice(20); });
      pushState();
      return run;
    },
    'aging.dunning': (p: { id: string; counterparty: string }) => {
      const run = requireFound(store.data().agings.find((x) => x.id === p.id), i18nT('账龄分析'));
      return dunningLetter(p.counterparty, run.rows, run.asOf, ledger().name);
    },
    'aging.export': async (p: { id: string }) => {
      const run = requireFound(store.data().agings.find((x) => x.id === p.id), i18nT('账龄分析'));
      const rows = run.rows.map((r) => ({
        [i18nT('往来单位')]: r.counterparty, [i18nT('单号')]: r.docNo, [i18nT('日期')]: r.date, [i18nT('到期日')]: r.dueDate, [i18nT('金额')]: r.amount,
        [i18nT('已结')]: r.paid, [i18nT('未结')]: r.outstanding, [i18nT('账龄（天）')]: r.ageDays, [i18nT('逾期（天）')]: r.overdueDays, [i18nT('账龄段')]: r.bucket,
      }));
      return { path: await writeXlsx('reconcile', i18nT('账龄分析-{p0}', { p0: run.asOf }), [
        { name: i18nT('明细'), rows },
        { name: i18nT('账龄汇总'), rows: run.buckets.map((b) => ({ [i18nT('账龄段')]: b.bucket, [i18nT('笔数')]: b.count, [i18nT('金额')]: b.amount })) },
        { name: i18nT('逾期预警'), rows: findingRows(run.warnings) },
      ]) };
    },
    'aging.remove': (p: { id: string }) => { store.update((d) => { d.agings = d.agings.filter((x) => x.id !== p.id); }); pushState(); return true; },

    // ⑤ 财务报表
    'stmt.build': (p: { period: string; source: 'balances' | 'vouchers' }) => {
      const d = store.data();
      let rows;
      let jr: FaJournalRow[];
      if (p.source === 'balances') {
        const b = requireFound(d.balances.find((x) => x.period === p.period) || null, i18nT('{p0} 的科目余额表', { p0: p.period }));
        rows = b.rows;
        jr = journal().filter((r) => periodOf(r.date) === p.period);
      } else {
        jr = journal().filter((r) => periodOf(r.date) === p.period);
        if (!jr.length) throw new Error(i18nT('{p0} 没有已审核的凭证或导入的序时账', { p0: p.period }));
        rows = journalToBalances(jr);
      }
      const prior = d.statements.find((s) => s.period < p.period);
      const out = buildStatements(rows, jr, prior?.income);
      if (p.source === 'vouchers') out.checks.push({ code: 'no_opening', level: 'warn', message: i18nT('按凭证生成时没有期初余额：资产负债表只反映本期发生，建议导入账套的科目余额表') });
      const run: FaStatementRun = { id: newId('stm'), period: p.period, source: p.source, ...out, createdAt: new Date().toISOString() };
      store.update((dd) => { dd.statements = [run, ...dd.statements.filter((s) => !(s.period === p.period && s.source === p.source))].sort((a, b) => b.period.localeCompare(a.period)).slice(0, 36); });
      pushState();
      return run;
    },
    'stmt.analyze': async (p: { id: string }) => {
      const run = requireFound(store.data().statements.find((x) => x.id === p.id), i18nT('报表'));
      const facts = analysisFacts(run.income, run.balanceSheet);
      const lines = [
        ...run.income.map((l) => `${l.label}：${i18nT('本期')} ${fmt(l.current)}${l.prior != null ? `，${i18nT('上期')} ${fmt(l.prior)}` : ''}`),
        facts.grossMargin != null ? `${i18nT('毛利率')}：${pct(facts.grossMargin)}` : '',
        ...run.balanceSheet.filter((l) => ['cash', 'ar', 'inventory', 'totalAssets', 'totalLiab', 'totalEquity'].includes(l.key)).map((l) => `${l.label}：${i18nT('期末')} ${fmt(l.current)}，${i18nT('期初')} ${fmt(l.prior || 0)}`),
      ].filter(Boolean).join('\n');
      const r = await llm('statements', P.statementAnalysisPrompt(ledger().name, run.period, lines, ledger().notes));
      const out = store.update((d) => { const t = d.statements.find((x) => x.id === p.id)!; t.analysis = r.text.trim(); t.model = r.model; return t; });
      pushState();
      return out;
    },
    'stmt.export': async (p: { id: string }) => {
      const run = requireFound(store.data().statements.find((x) => x.id === p.id), i18nT('报表'));
      const path = await writeXlsx('statements', i18nT('财务报表-{p0}', { p0: run.period }), [
        { name: i18nT('资产负债表'), rows: reportLinesRows(run.balanceSheet, i18nT('期末余额'), i18nT('期初余额')) },
        { name: i18nT('利润表'), rows: reportLinesRows(run.income, i18nT('本期金额'), i18nT('上期金额')) },
        { name: i18nT('现金流量表'), rows: reportLinesRows(run.cashflow, i18nT('本期金额'), i18nT('上期金额')) },
        { name: i18nT('勾稽校验'), rows: run.checks.map((c) => ({ [i18nT('结果')]: c.level === 'ok' ? '✓' : c.level === 'error' ? '✗' : '!', [i18nT('说明')]: c.message })) },
      ]);
      if (run.analysis) writeMd('statements', i18nT('经营简要分析-{p0}', { p0: run.period }), `# ${ledger().name} ${run.period} ${i18nT('经营简要分析')}\n\n${run.analysis}\n`);
      store.update((d) => { const t = d.statements.find((x) => x.id === p.id); if (t) t.exportPath = path; });
      pushState();
      return { path };
    },
    'stmt.remove': (p: { id: string }) => { store.update((d) => { d.statements = d.statements.filter((x) => x.id !== p.id); }); pushState(); return true; },

    // ⑥ 财税风险巡检
    'risk.scan': () => {
      const d = store.data();
      const jr = journal();
      const findings = scanRisks({ docs: d.docs, journal: jr, balances: latestBalances(), agings: d.agings, taxRuns: d.taxRuns, thresholds: settings().risk });
      const run: FaRiskRun = { id: newId('rsk'), findings, scanned: { docs: d.docs.length, vouchers: d.vouchers.length, journal: jr.length, aging: d.agings.length }, createdAt: new Date().toISOString() };
      store.update((dd) => { dd.risks.unshift(run); dd.risks.splice(20); });
      pushState();
      return run;
    },
    'risk.summary': async (p: { id: string }) => {
      const run = requireFound(store.data().risks.find((x) => x.id === p.id), i18nT('巡检记录'));
      if (!run.findings.length) throw new Error(i18nT('没有风险点，不需要写总结'));
      const r = await llm('risk', P.riskSummaryPrompt(ledger().name, run.findings.map((f) => `[${f.level}] ${f.title}\n${f.detail}`).join('\n\n')));
      const out = store.update((d) => { const t = d.risks.find((x) => x.id === p.id)!; t.summary = r.text.trim(); t.model = r.model; return t; });
      pushState();
      return out;
    },
    'risk.export': (p: { id: string }) => {
      const run = requireFound(store.data().risks.find((x) => x.id === p.id), i18nT('巡检记录'));
      const path = writeMd('risk', i18nT('财税风险报告'), riskReportMarkdown(ledger().name, run.findings, run.summary, run.scanned, run.createdAt));
      store.update((d) => { const t = d.risks.find((x) => x.id === p.id); if (t) t.reportPath = path; });
      pushState();
      return { path };
    },
    'risk.remove': (p: { id: string }) => { store.update((d) => { d.risks = d.risks.filter((x) => x.id !== p.id); }); pushState(); return true; },

    // ⑦ 预算管控
    'budget.import': (p: { path: string; year: number }) => {
      const lines = parseBudget(loadTable(p.path));
      if (!lines.length) throw new Error(i18nT('预算表里没有读到数据'));
      store.update((d) => { d.budget = { year: Number(p.year) || new Date().getFullYear(), lines }; });
      pushState();
      return { count: lines.length };
    },
    'budget.save': (p: { year: number; lines: FaBudgetLine[] }) => {
      const lines = (p.lines || []).filter((l) => l.category?.trim()).map((l) => ({ dept: String(l.dept || '').trim(), category: l.category.trim(), months: Array.from({ length: 12 }, (_, i) => round2(Number(l.months?.[i]) || 0)) }));
      store.update((d) => { d.budget = { year: Number(p.year) || new Date().getFullYear(), lines }; });
      pushState();
      return { count: lines.length };
    },
    'budget.analyze': (p: { month: number }) => {
      const d = store.data();
      const month = Math.min(12, Math.max(1, Number(p.month) || new Date().getMonth() + 1));
      const jr = journal();
      const actuals = jr.length ? actualsFromJournal(jr, d.budget.year) : actualsFromClaims(d.claims, d.budget.year);
      const run: FaBudgetAnalysis = { id: newId('bdg'), year: d.budget.year, month, rows: analyzeBudget(d.budget.lines, actuals, month), createdAt: new Date().toISOString() };
      store.update((dd) => { dd.budgetAnalyses = [run, ...dd.budgetAnalyses.filter((x) => !(x.year === run.year && x.month === month))].slice(0, 24); });
      pushState();
      return { ...run, source: jr.length ? 'journal' : 'claims' };
    },
    'budget.commentary': async (p: { id: string }) => {
      const run = requireFound(store.data().budgetAnalyses.find((x) => x.id === p.id), i18nT('预算分析'));
      const r = await llm('budget', P.budgetCommentaryPrompt(ledger().name, budgetFacts(run.rows, run.month)));
      const out = store.update((d) => { const t = d.budgetAnalyses.find((x) => x.id === p.id)!; t.commentary = r.text.trim(); t.model = r.model; return t; });
      pushState();
      return out;
    },
    'budget.precheck': (p: { dept: string; category: string; amount: number }) => {
      const d = store.data();
      const jr = journal();
      const actuals = jr.length ? actualsFromJournal(jr, d.budget.year) : actualsFromClaims(d.claims, d.budget.year);
      return precheckSpend(d.budget.lines, actuals, p.dept, p.category, Number(p.amount) || 0, new Date().getMonth() + 1);
    },
    'budget.export': async (p: { id: string }) => {
      const run = requireFound(store.data().budgetAnalyses.find((x) => x.id === p.id), i18nT('预算分析'));
      const rows = run.rows.map((r) => ({
        [i18nT('部门')]: r.dept, [i18nT('类别')]: r.category, [i18nT('累计预算')]: r.budget, [i18nT('累计实际')]: r.actual, [i18nT('执行率')]: pct(r.usage),
        [i18nT('本月预算')]: r.monthBudget, [i18nT('本月实际')]: r.monthActual, [i18nT('本月差异')]: round2(r.monthActual - r.monthBudget),
        [i18nT('状态')]: r.level === 'over' ? i18nT('超预算') : r.level === 'warn' ? i18nT('接近上限') : i18nT('正常'),
      }));
      const path = await writeXlsx('budget', i18nT('预算执行-{y}年{m}月', { y: run.year, m: run.month }), [{ name: i18nT('预算执行'), rows }]);
      if (run.commentary) writeMd('budget', i18nT('预算差异解读-{y}年{m}月', { y: run.year, m: run.month }), run.commentary);
      store.update((d) => { const t = d.budgetAnalyses.find((x) => x.id === p.id); if (t) t.exportPath = path; });
      pushState();
      return { path };
    },

    // ⑧ 成本核算
    'cost.importProducts': (p: { path: string }) => parseCostProducts(loadTable(p.path)),
    'cost.importMaterials': (p: { path: string }) => parseCostMaterials(loadTable(p.path)),
    'cost.compute': (p: { period: string; basis: FaAllocBasis; laborTotal: number; overheadItems: Array<{ item: string; amount: number }>; products: FaCostProduct[]; materials: FaCostMaterial[]; lossTolerance: number }) => {
      if (!p.products?.length) throw new Error(i18nT('请先导入或填写产品产量'));
      const d = store.data();
      const prior = d.costRuns.find((r) => r.period < p.period) || null;
      const input = { products: p.products, materials: p.materials || [], laborTotal: Number(p.laborTotal) || 0, overheadItems: (p.overheadItems || []).filter((o) => o.item && Number(o.amount)), basis: p.basis || 'hours', lossTolerance: Number(p.lossTolerance) || 0.05, prior };
      const r = computeCost(input);
      const run: FaCostRun = { id: newId('cst'), period: p.period, basis: input.basis, laborTotal: input.laborTotal, overheadItems: input.overheadItems, products: input.products, materials: input.materials, lossTolerance: input.lossTolerance, ...r, createdAt: new Date().toISOString() };
      store.update((dd) => { dd.costRuns = [run, ...dd.costRuns.filter((x) => x.period !== p.period)].sort((a, b) => b.period.localeCompare(a.period)).slice(0, 36); });
      pushState();
      return run;
    },
    'cost.commentary': async (p: { id: string }) => {
      const run = requireFound(store.data().costRuns.find((x) => x.id === p.id), i18nT('成本核算'));
      const facts = [
        ...run.result.map((r) => i18nT('{p0}：产量 {o}，材料 {a}，人工 {b}，制造费用 {c}，总成本 {d}，单位成本 {e}{p1}', { p0: r.product, o: r.output, a: fmt(r.material), b: fmt(r.labor), c: fmt(r.overhead), d: fmt(r.total), e: fmt(r.unitCost), p1: r.priorUnitCost != null ? i18nT('（上期 {p0}）', { p0: fmt(r.priorUnitCost) }) : '' })),
        ...run.losses.map((f) => `${f.title}：${f.detail}`),
      ].join('\n');
      const r = await llm('cost', P.costCommentaryPrompt(ledger().name, facts));
      const out = store.update((d) => { const t = d.costRuns.find((x) => x.id === p.id)!; t.commentary = r.text.trim(); t.model = r.model; return t; });
      pushState();
      return out;
    },
    'cost.export': async (p: { id: string }) => {
      const run = requireFound(store.data().costRuns.find((x) => x.id === p.id), i18nT('成本核算'));
      const path = await writeXlsx('cost', i18nT('成本计算单-{p0}', { p0: run.period }), [
        { name: i18nT('成本计算单'), rows: costExportRows(run) },
        { name: i18nT('分配过程'), rows: run.calc.map((c) => ({ [i18nT('项目')]: c.label, [i18nT('计算')]: c.formula, [i18nT('结果')]: c.value })) },
        { name: i18nT('异常与波动'), rows: findingRows(run.losses) },
      ]);
      if (run.commentary) writeMd('cost', i18nT('成本分析-{p0}', { p0: run.period }), run.commentary);
      store.update((d) => { const t = d.costRuns.find((x) => x.id === p.id); if (t) t.exportPath = path; });
      pushState();
      return { path };
    },
    'cost.remove': (p: { id: string }) => { store.update((d) => { d.costRuns = d.costRuns.filter((x) => x.id !== p.id); }); pushState(); return true; },

    // ⑨ 合同财税审核
    'contract.review': async (p: { path: string; useModel?: boolean }) => {
      const id = newId('ctr');
      const dest = join(store.filesDir(), `${id}${extname(p.path).toLowerCase()}`);
      copyFileSync(p.path, dest);
      progress('contract', i18nT('正在读取合同：{p0}', { p0: basename(p.path) }));
      const ex = await extractText(dest);
      if (ex.text.trim().length < 30) throw new Error(ex.warning || i18nT('合同里没有读到文字'));
      const type = detectContractType(ex.text);
      const amt = extractContractAmount(ex.text);
      const findings = ruleFindings(ex.text);
      const review: FaContractReview = {
        id, fileName: basename(p.path), path: dest, contractType: type ? typeLabel(type.type) : i18nT('未识别'), amount: amt.total,
        clauses: [], findings, stampDuty: stampDuty(type, amt.total, amt.exclTax), textLength: ex.text.length, createdAt: new Date().toISOString(),
      };
      if (amt.quote) review.clauses.push({ type: i18nT('价款'), quote: amt.quote, value: amt.total != null ? fmt(amt.total) : '', verified: true });
      if (p.useModel !== false) {
        progress('contract', i18nT('模型正在逐条读涉税条款…'));
        try {
          const r = await llmJson('contract', P.contractPrompt(ex.text), 240_000);
          review.model = r.model;
          review.clauses.push(...verifyClauses(r.json?.clauses, ex.text));
          review.findings.push(...verifyLlmRisks(r.json?.risks, ex.text, review.findings));
        } catch (error) {
          review.findings.push({ code: 'llm_failed', level: 'info', title: i18nT('模型审核没有完成'), detail: (error as Error)?.message || '', suggestion: i18nT('上面是固定规则的结果；可以换个模型重试') });
        }
      }
      const order = { high: 0, warn: 1, info: 2 } as const;
      review.findings.sort((a, b) => order[a.level] - order[b.level]);
      store.update((d) => { d.contracts.unshift(review); d.contracts.splice(50); });
      progress('contract', '');
      pushState();
      return review;
    },
    'contract.export': (p: { id: string }) => {
      const c = requireFound(store.data().contracts.find((x) => x.id === p.id), i18nT('合同审核'));
      const lv = { high: i18nT('高'), warn: i18nT('中'), info: i18nT('低') } as const;
      const md = [
        `# ${i18nT('合同财税审核意见：{p0}', { p0: c.fileName })}`, '',
        i18nT('合同类型：{p0}　合同金额：{p1}', { p0: c.contractType, p1: c.amount != null ? fmt(c.amount) : i18nT('未识别') }), '',
        `> ${i18nT('本意见由财务智能体生成，仅供参考，需财务 / 法务人员复核确认。')}`, '',
        `## ${i18nT('涉税条款')}`, '',
        ...c.clauses.map((x) => `- **${x.type}**：${x.value}${x.quote ? `　「${x.quote}」` : ''}${x.verified ? '' : `（${i18nT('未在原文核实')}）`}`), '',
        `## ${i18nT('风险提示')}`, '',
        ...c.findings.flatMap((f, i) => [`### ${i + 1}. [${lv[f.level]}] ${f.title}`, '', f.detail, '', `**${i18nT('建议')}**：${f.suggestion}`, '']),
        ...(c.stampDuty ? [`## ${i18nT('印花税测算')}`, '', ...c.stampDuty.map((l) => `- ${l.label}：${l.formula}${l.value > 1 ? ` = ${fmt(l.value)}` : ''}`), ''] : []),
      ].join('\n');
      const path = writeMd('contract', i18nT('合同审核-{p0}', { p0: c.fileName.replace(/\.[^.]+$/, '') }), md);
      store.update((d) => { const t = d.contracts.find((x) => x.id === p.id); if (t) t.exportPath = path; });
      pushState();
      return { path };
    },
    'contract.remove': (p: { id: string }) => { store.update((d) => { d.contracts = d.contracts.filter((x) => x.id !== p.id); }); pushState(); return true; },

    // ⑩ 财务问答
    'qa.ask': async (p: { question: string }) => {
      const q = String(p?.question || '').trim();
      if (!q) throw new Error(i18nT('请输入问题'));
      const now = new Date().toISOString();
      const userMsg: FaQaMessage = { id: newId('qa'), role: 'user', text: q, at: now };
      const history = store.data().qa.map((m) => ({ role: m.role, text: m.text }));
      store.update((d) => { d.qa.push(userMsg); });
      pushState();
      const citations = citationsFor(q, store.policies());
      const l = ledger();
      const r = await llm('qa', P.qaPrompt(q, citations, history, { name: l.name, taxpayer: l.taxpayerType === 'general' ? i18nT('一般纳税人') : i18nT('小规模纳税人'), notes: l.notes }));
      const answer: FaQaMessage = { id: newId('qa'), role: 'assistant', text: r.text.trim(), citations, model: r.model, at: new Date().toISOString() };
      store.update((d) => { d.qa.push(answer); });
      pushState();
      return answer;
    },
    'qa.clear': () => { store.update((d) => { d.qa = []; }); pushState(); return true; },
    'policy.import': async (p: { paths: string[] }) => {
      let total = 0;
      for (const path of p.paths || []) {
        progress('qa', i18nT('正在读取制度：{p0}', { p0: basename(path) }));
        const ex = await extractText(path);
        if (!ex.text.trim()) continue;
        const id = newId('pol');
        const chunks = chunkPolicy(id, basename(path), ex.text);
        store.savePolicies([...store.policies(), ...chunks]);
        store.update((d) => { d.policies.push({ id, fileName: basename(path), chunks: chunks.length, importedAt: new Date().toISOString() }); });
        total += chunks.length;
      }
      progress('qa', '');
      pushState();
      return { chunks: total };
    },
    'policy.remove': (p: { id: string }) => {
      store.savePolicies(store.policies().filter((c) => c.docId !== p.id));
      store.update((d) => { d.policies = d.policies.filter((x) => x.id !== p.id); });
      pushState();
      return true;
    },

    /** 总览：各智能体的数据概况（方案说明页、tab 角标用） */
    'overview': () => {
      const d = store.data();
      const today = localDate();
      return {
        docs: d.docs.length, flaggedDocs: d.docs.filter((x) => x.status === 'flagged').length,
        draftVouchers: d.vouchers.filter((v) => v.status === 'draft').length, reviewedVouchers: d.vouchers.filter((v) => v.status === 'reviewed').length,
        journalRows: d.journal?.rows.length || 0, balances: d.balances.map((b) => b.period),
        pendingClaims: d.claims.filter((c) => !c.decision).length,
        overdue: d.agings[0]?.byCounterparty.filter((x) => x.overdue > 0).length || 0,
        risks: d.risks[0]?.findings.filter((f) => f.level === 'high').length || 0,
        overBudget: d.budgetAnalyses[0]?.rows.filter((r) => r.level === 'over').length || 0,
        thisMonthTax: d.taxRuns.find((t) => inPeriod(today, t.period))?.id || null,
      };
    },
  };

  function reviewOne(claimId: string): FaExpenseClaim {
    const d = store.data();
    const claim = requireFound(d.claims.find((c) => c.id === claimId), i18nT('报销单'));
    const month = localDate().slice(0, 7);
    const monthUsed = sum(d.claims.filter((c) => c.id !== claim.id && c.employee === claim.employee && c.createdAt.startsWith(month) && (c.decision === 'approved' || (!c.decision && c.verdict === 'pass'))).map((c) => c.total));
    const reviewed = reviewClaim(claim, d.docs.filter((x) => x.claimId === claim.id), { ledger: ledger(), rules: settings().expense, allDocs: d.docs, monthUsed });
    reviewed.notice = claimNotice(reviewed, ledger().name);
    const out = store.update((dd) => { const i = dd.claims.findIndex((c) => c.id === claimId); dd.claims[i] = reviewed; return reviewed; });
    pushState();
    return out;
  }

  ipcMain.handle(IPC_CHANNELS.WORKBENCH_FA_INVOKE, async (_e, req: { action: string; payload?: unknown }) => {
    const fn = actions[String(req?.action || '')];
    if (!fn) throw new Error(i18nT('未知操作：{p0}', { p0: String(req?.action || '') }));
    try {
      return await fn(req.payload ?? {});
    } catch (error) {
      logger?.warn?.('finance-agent', `${req.action} failed`, { error: (error as Error)?.message });
      throw new Error(userFacingError(error));
    }
  });

  // 上次打开过 API 接收的，启动时恢复
  const apiTimer = setTimeout(() => { void applyApiSetting().then(pushState).catch(() => {}); }, 3_000);
  (apiTimer as any).unref?.();
  onAppWillQuit('finance-agent', () => { clearTimeout(apiTimer); void api.stop(); }, { once: true });
}
