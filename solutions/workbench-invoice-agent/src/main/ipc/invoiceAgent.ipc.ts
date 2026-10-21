/**
 * 解决方案 · 发票智能体（主进程）。docs/invoice-agent-workbench.md
 *
 * 一条动作通道 WORKBENCH_IV_INVOKE，按 action 分发；状态变化经 WORKBENCH_IV_EVENT 推给渲染层。
 *
 *   导入：付款单 / 开票申请表（Excel、CSV）识别列 → 归一成开票行；付款回单（PDF、图片、文字）由模型抽取，
 *         抽出来的名称与金额逐条回原文核对，对不上的不收；
 *   校验：税号位数与校验位、名称与税号互相矛盾、与客户档案不一致、数量 × 单价 ≠ 金额、税率不合法、疑似重复开票；
 *   组票：按购买方 / 订单号 / 逐行合并，超单张限额或行数上限自动拆票，税额按分做整数运算；
 *   开具：① 系统浏览器打开电子税务局（内置浏览器会被税务局的反爬校验挡成空白页），应用走到「批量开票」页、
 *            在官方模板原文件上追加数据生成导入文件并放进「选择文件」；人核对后亲自点「批量开具」；
 *            再从「批量开票记录」按发票流水号读回号码。登录、扫脸一律由人完成，应用只读出「现在要你做什么」；
 *         ② 开票服务商接口（诺诺 · 诺税通 SaaS）：提交 → 查询 → 回填，数电账号的税局登录验证由人完成；
 *   台账：导入电子税务局导出的已开发票表自动回填号码，红冲指令，台账导出。
 */
import { app, dialog, ipcMain, safeStorage, shell, type BrowserWindow } from 'electron';
import { existsSync, mkdirSync, readFileSync } from 'node:fs';
import { basename, extname, join } from 'node:path';
import {
  IPC_CHANNELS, IV_FIELDS,
  type IvBatch, type IvBatchSummary, type IvEtaxState, type IvColumnGuess, type IvCustomer, type IvDraft, type IvDraftStatus, type IvGoods, type IvRow, type IvSettings, type IvState,
} from '@totalclaw/ipc-contracts';
import { t as i18nT } from '@totalclaw/i18n';
import type { WorkbenchIpcDeps } from './workbenchApi';
import { userFacingError } from '../utils/userFacingError';
import { createWorkbenchLlm } from '../services/workbenchLlm';
import { InvoiceAgentStore, newId } from '../services/invoiceAgent/store';
import {
  buildDrafts, cents, detectMapping, dupKey, etaxBatchProblems, etaxBatchSheets, fillFromCustomers, looksLikeOrg, matchIssued, missingRequired, normalizeName, normalizeTaxNo,
  parseIssuedTable, parseRows, round2, taxDiffProblems, taxNoProblem, validateRows, verifyExtracted, yuan,
} from '../services/invoiceAgent/logic';
import * as P from '../services/invoiceAgent/prompts';
import { BUNDLED_TEMPLATE_VERSION, writeEtaxImport } from '../services/invoiceAgent/template';
import { ETAX_CONTEXT, EtaxBrowser } from '../services/invoiceAgent/etaxBrowser';
import { etaxHomeUrl } from '../services/invoiceAgent/etaxPage';
import { NuonuoClient, NuonuoError, buildNuonuoOrder } from '../services/invoiceAgent/nuonuo';
import { listForegroundPages, openForegroundTab, withForegroundTarget } from '../services/foregroundBrowserCdp';
import { setForegroundLaunchProfile } from '../services/foregroundBrowserProc';
import { shellResourcesPath } from '../services/runtimeLocation';
import { listSheetNames, readTable, safeFileName, writeWorkbook } from '../services/serviceSettlement/excel';

const store = new InvoiceAgentStore();
let notify: (() => void) | null = null;

const statusLabel = (s: IvDraftStatus): string => ({ draft: i18nT('草稿'), confirmed: i18nT('已确认'), handed: i18nT('开具中'), issued: i18nT('已开具'), failed: i18nT('开具失败'), red: i18nT('已红冲') }[s]);

const needLabel = (n: IvEtaxState['need']): string => ({ '': '', login: i18nT('登录'), face: i18nT('扫脸认证（用电子税务局 APP 扫页面上的二维码）'), level: i18nT('点页面上的「开始认证」并完成实人认证'), ack: i18nT('点「我已知晓」'), session: i18nT('会话已失效，从门户重新进入发票业务') }[n]);

function requireFound<T>(v: T | undefined | null, what: string): T {
  if (v == null) throw new Error(i18nT('{p0}不存在或已删除', { p0: what }));
  return v;
}

function validateBatch(batchId: string): void {
  const s = store.read();
  store.updateRows((rows) => {
    const mine = rows.filter((r) => r.batchId === batchId);
    // 台账里已经开出去的行：用来提示重复开票
    const issuedRowIds = new Set(s.drafts.filter((d) => d.status === 'issued' && d.batchId !== batchId).flatMap((d) => d.lines.flatMap((l) => l.rowIds)));
    const issuedKeys = new Set(rows.filter((r) => issuedRowIds.has(r.id)).map(dupKey));
    validateRows(mine, { seller: s.settings.seller, customers: s.customers, issuedKeys });
  });
}

/** 别的工作台（政采云订单）把待开票的行转进来：建一批、校验，返回批次 id */
export function invoiceImportExternal(input: { name: string; source: IvBatch['source']; rows: Array<Partial<IvRow> & { buyerName: string; itemName: string; amount: number }> }): string {
  const s = store.read().settings;
  const batchId = newId('ivb');
  const rows: IvRow[] = input.rows.map((r, i) => {
    const taxNo = normalizeTaxNo(r.buyerTaxNo);
    return {
      id: newId('ivr'), batchId, file: input.name, sheet: '', rowNo: i + 1,
      buyerName: normalizeName(r.buyerName), buyerTaxNo: taxNo, buyerAddress: r.buyerAddress || '', buyerPhone: r.buyerPhone || '',
      buyerBank: r.buyerBank || '', buyerBankAccount: r.buyerBankAccount || '', email: r.email || '', mobile: r.mobile || '',
      itemName: String(r.itemName || '').trim(), spec: r.spec || '', unit: r.unit || '', qty: Number(r.qty) || 0, price: Number(r.price) || 0,
      amount: Number(r.amount) || 0, taxIncluded: r.taxIncluded ?? true, taxRate: r.taxRate ?? s.seller.defaultTaxRate,
      kind: r.kind || s.defaultKind, orderNo: r.orderNo || '', remark: r.remark || '', personal: !!r.personal && !taxNo, issues: [], skipped: false,
    };
  });
  if (!rows.length) throw new Error(i18nT('没有可转入的行'));
  fillFromCustomers(rows, store.read().customers);
  store.updateRows((all) => { all.push(...rows); });
  store.update((st) => {
    st.batches.unshift({ id: batchId, name: input.name, createdAt: new Date().toISOString(), files: [], rowCount: rows.length, mapping: {}, source: input.source });
    st.log.unshift({ at: new Date().toISOString(), text: i18nT('转入「{p0}」{p1} 行', { p0: input.name, p1: rows.length }), ok: true });
  });
  validateBatch(batchId);
  notify?.();
  return batchId;
}

export function registerInvoiceAgentHandlers(deps: WorkbenchIpcDeps): void {
  const logger = deps.logger;
  const win = (): BrowserWindow | null => deps.getMainWindow?.() ?? null;
  const pushState = (): void => { try { win()?.webContents.send(IPC_CHANNELS.WORKBENCH_IV_EVENT, { type: 'state' }); } catch { /* 窗口已关 */ } };
  notify = pushState;
  const log = (text: string, ok = true): void => { store.update((s) => { s.log.unshift({ at: new Date().toISOString(), text, ok }); }); };
  const now = (): string => new Date().toISOString();

  const { modelOptions, llmJson } = createWorkbenchLlm(deps, { logTag: 'invoice-agent', moduleModel: () => store.read().settings.model || '' });

  const outputDir = (sub?: string): string => {
    const s = store.read().settings;
    const root = s.outputDir && existsSync(s.outputDir) ? s.outputDir : join(app.getPath('documents'), 'TotalClaw', i18nT('发票智能体'));
    const dir = sub ? join(root, sub) : root;
    mkdirSync(dir, { recursive: true });
    return dir;
  };
  const publicState = (): IvState => {
    const s = store.read();
    return { settings: s.settings, batches: s.batches, drafts: s.drafts, customers: s.customers, goods: s.goods, log: s.log.slice(0, 80), secretStorage: canEncrypt() };
  };
  const canEncrypt = (): boolean => { try { return safeStorage.isEncryptionAvailable(); } catch { return false; } };
  const seal = (v: string): string => safeStorage.encryptString(v).toString('base64');
  const unseal = (c: string): string => { try { return c ? safeStorage.decryptString(Buffer.from(c, 'base64')) : ''; } catch { return ''; } };

  // ── 电子税务局（系统浏览器）──
  // 实测：登录页在非东八区时区的机器上抛「系统时间有误」，登录表单不渲染 → 这个浏览器固定用中国时区
  setForegroundLaunchProfile(ETAX_CONTEXT, { env: { TZ: 'Asia/Shanghai' } });
  const etax = new EtaxBrowser({
    cdpUrl: async () => {
      if (!deps.foregroundBrowser) throw new Error(i18nT('没有找到可用的系统浏览器：电子税务局不接受应用内置浏览器，请安装 Google Chrome 或 Microsoft Edge 后重试'));
      return deps.foregroundBrowser.ensureContext(ETAX_CONTEXT);
    },
    list: listForegroundPages, withTarget: withForegroundTarget, openTab: openForegroundTab,
  });
  const province = (): string => {
    const p = store.read().settings.seller.province;
    if (!p) throw new Error(i18nT('先在第 1 步填电子税务局省份（拼音，如 jilin）'));
    return p;
  };
  /** 读到额度就记下来（第 5 步的额度检查用），读到的企业和销售方对不上要明说 */
  const noteEtax = (st: IvEtaxState): IvEtaxState & { sellerMismatch: boolean } => {
    const seller = store.read().settings.seller;
    if (st.quota != null && st.quota !== seller.remainingQuota) { store.update((s) => { s.settings.seller.remainingQuota = st.quota as number; }); pushState(); }
    const mismatch = !!st.company && !!seller.name && normalizeName(st.company) !== normalizeName(seller.name);
    return { ...st, sellerMismatch: mismatch };
  };

  // ── 服务商接口 ──
  const nuonuo = (): NuonuoClient => {
    const s = store.read();
    const api = s.settings.api;
    const secret = unseal(s.secrets.apiSecret || '');
    if (!api.appKey || !secret) throw new Error(i18nT('先填服务商的 appKey 和 appSecret'));
    if (!api.sandbox && !s.settings.seller.taxNo) throw new Error(i18nT('先在第 1 步填销售方税号'));
    return new NuonuoClient(
      { appKey: api.appKey, appSecret: secret, sandbox: api.sandbox, taxNum: s.settings.seller.taxNo, fixedToken: unseal(s.secrets.apiToken || '') || undefined },
      {
        get: () => { const c = store.read().tokenCache; const token = c ? unseal(c.cipher) : ''; return c && token ? { token, expiresAt: c.expiresAt } : null; },
        set: (v) => { store.update((st) => { st.tokenCache = { cipher: seal(v.token), expiresAt: v.expiresAt }; }); },
      },
    );
  };
  /** 服务商报错翻成人话；登录失效、没权限单独标出来 */
  const apiError = (e: unknown): Error => {
    if (!(e instanceof NuonuoError)) return e as Error;
    if (e.needsLogin) return new Error(i18nT('数电账号在服务商那边的税局登录已失效，请先在下面做一次登录验证（短信或扫码）'));
    if (e.noPermission) return new Error(i18nT('这家企业还没有开通诺税通 SaaS 的接口开票权限（{p0}）', { p0: e.code }));
    return new Error(i18nT('服务商返回 {p0}：{p1}', { p0: e.code, p1: e.message || i18nT('没有说明') }));
  };

  const batchOf = (id: string): IvBatch => requireFound(store.read().batches.find((b) => b.id === id), i18nT('批次'));
  const draftOf = (id: string): IvDraft => requireFound(store.read().drafts.find((d) => d.id === id), i18nT('发票'));
  const rowsOf = (batchId: string): IvRow[] => store.rows().filter((r) => r.batchId === batchId);
  const summary = (batchId: string): IvBatchSummary => {
    const rs = rowsOf(batchId);
    const live = rs.filter((r) => !r.skipped);
    return {
      rows: rs.length, skipped: rs.length - live.length,
      errors: live.filter((r) => r.issues.some((i) => i.level === 'error')).length,
      warnings: live.filter((r) => !r.issues.some((i) => i.level === 'error') && r.issues.length > 0).length,
      buyers: new Set(live.map((r) => r.buyerTaxNo || r.buyerName)).size,
      total: yuan(live.reduce((n, r) => n + cents(r.amount), 0)),
    };
  };
  const stamp = (stamped = new Date()): string => `${stamped.getFullYear()}${String(stamped.getMonth() + 1).padStart(2, '0')}${String(stamped.getDate()).padStart(2, '0')}-${String(stamped.getHours()).padStart(2, '0')}${String(stamped.getMinutes()).padStart(2, '0')}`;

  function upsertCustomer(c: Partial<IvCustomer> & { name: string }): IvCustomer {
    const name = normalizeName(c.name);
    if (!name) throw new Error(i18nT('客户名称不能为空'));
    const taxNo = normalizeTaxNo(c.taxNo);
    if (taxNo && taxNoProblem(taxNo) === 'format') throw new Error(i18nT('税号 {p0} 位数或字符不对（应为 15 / 17 / 18 / 20 位数字和大写字母）', { p0: taxNo }));
    return store.update((s) => {
      let cur = s.customers.find((x) => (c.id ? x.id === c.id : normalizeName(x.name) === name));
      if (!cur) { cur = { id: newId('ivc'), name, taxNo: '', address: '', phone: '', bank: '', bankAccount: '', email: '', mobile: '', updatedAt: now() }; s.customers.unshift(cur); }
      const set = (k: 'address' | 'phone' | 'bank' | 'bankAccount' | 'email' | 'mobile') => { if (c[k] !== undefined) cur![k] = String(c[k] || '').trim(); };
      cur.name = name;
      if (c.taxNo !== undefined) cur.taxNo = taxNo;
      set('address'); set('phone'); set('bank'); set('bankAccount'); set('email'); set('mobile');
      cur.updatedAt = now();
      return cur;
    });
  }

  function upsertGoods(g: Partial<IvGoods> & { name: string }): IvGoods {
    const name = String(g.name || '').trim();
    if (!name) throw new Error(i18nT('项目名称不能为空'));
    const code = String(g.taxCode ?? '').replace(/\s/g, '');
    if (code && !/^\d{19}$/.test(code)) throw new Error(i18nT('税收分类编码应为 19 位数字：{p0}', { p0: code }));
    return store.update((s) => {
      let cur = s.goods.find((x) => (g.id ? x.id === g.id : x.name === name));
      if (!cur) { cur = { id: newId('ivg'), name, taxCode: '', shortName: '', spec: '', unit: '', taxRate: s.settings.seller.defaultTaxRate, confirmed: false, source: 'manual' }; s.goods.unshift(cur); }
      cur.name = name;
      if (g.taxCode !== undefined) cur.taxCode = code;
      if (g.shortName !== undefined) cur.shortName = String(g.shortName || '').replace(/\*/g, '').trim();
      if (g.spec !== undefined) cur.spec = String(g.spec || '');
      if (g.unit !== undefined) cur.unit = String(g.unit || '');
      if (g.taxRate !== undefined && Number.isFinite(Number(g.taxRate))) cur.taxRate = Number(g.taxRate);
      if (g.source) cur.source = g.source;
      cur.confirmed = g.confirmed !== undefined ? !!g.confirmed && !!cur.taxCode : cur.source === 'manual' && !!cur.taxCode;
      return cur;
    });
  }

  function commitRows(name: string, files: string[], rows: IvRow[], mapping: Record<string, string>, source: IvBatch['source'], batchId: string): { batchId: string; filled: number } {
    if (!rows.length) throw new Error(i18nT('没有读到可开票的行'));
    const filled = fillFromCustomers(rows, store.read().customers);
    store.updateRows((all) => { all.push(...rows); });
    store.update((s) => { s.batches.unshift({ id: batchId, name, createdAt: now(), files, rowCount: rows.length, mapping, source }); });
    validateBatch(batchId);
    log(i18nT('导入「{p0}」{p1} 行', { p0: name, p1: rows.length }));
    pushState();
    return { batchId, filled };
  }

  function setStatus(ids: string[], status: IvDraftStatus, extra: Partial<IvDraft> = {}): number {
    let n = 0;
    store.update((s) => {
      for (const d of s.drafts) {
        if (!ids.includes(d.id)) continue;
        if (status === 'confirmed' && d.issues.some((i) => i.level === 'error')) continue;
        d.status = status;
        Object.assign(d, extra);
        d.updatedAt = now();
        n += 1;
      }
    });
    // 开出去的购买方记进客户档案，下次只写名称也能补全
    if (status === 'issued') {
      for (const d of store.read().drafts.filter((x) => ids.includes(x.id) && !x.personal && x.buyerTaxNo)) {
        try { upsertCustomer({ name: d.buyerName, taxNo: d.buyerTaxNo, ...(d.buyerAddress ? { address: d.buyerAddress } : {}), ...(d.buyerPhone ? { phone: d.buyerPhone } : {}), ...(d.buyerBank ? { bank: d.buyerBank } : {}), ...(d.buyerBankAccount ? { bankAccount: d.buyerBankAccount } : {}), ...(d.email ? { email: d.email } : {}) }); } catch { /* 档案写不进不影响台账 */ }
      }
    }
    return n;
  }

  const actions: Record<string, (p: any) => unknown> = {
    'state.get': () => publicState(),
    'models.list': () => modelOptions(),
    'settings.patch': (p: { patch: Partial<IvSettings> }) => {
      const patch = p?.patch || {};
      store.update((s) => {
        if (patch.seller) {
          const se = { ...s.settings.seller, ...patch.seller };
          se.name = normalizeName(se.name); se.taxNo = normalizeTaxNo(se.taxNo);
          se.province = String(se.province || '').toLowerCase().replace(/[^a-z]/g, '');
          se.defaultTaxRate = Number(se.defaultTaxRate) || 0;
          se.perInvoiceLimit = Math.max(0, Number(se.perInvoiceLimit) || 0);
          se.remainingQuota = Math.max(0, Number(se.remainingQuota) || 0);
          s.settings.seller = se;
        }
        if (patch.channel === 'etax_batch' || patch.channel === 'api') s.settings.channel = patch.channel;
        if (patch.mergeMode === 'buyer' || patch.mergeMode === 'order' || patch.mergeMode === 'row') s.settings.mergeMode = patch.mergeMode;
        if (patch.defaultKind === 'special' || patch.defaultKind === 'normal') s.settings.defaultKind = patch.defaultKind;
        if (patch.amountTaxIncluded !== undefined) s.settings.amountTaxIncluded = !!patch.amountTaxIncluded;
        if (patch.maxLines !== undefined) s.settings.maxLines = Math.min(2000, Math.max(1, Math.round(Number(patch.maxLines) || 100)));
        if (patch.model !== undefined) s.settings.model = String(patch.model || '');
        if (patch.outputDir !== undefined) s.settings.outputDir = String(patch.outputDir || '');
        if (patch.officialTemplate !== undefined) s.settings.officialTemplate = String(patch.officialTemplate || '');
      });
      pushState();
      return store.read().settings;
    },
    'files.pick': async (p: { kind: 'excel' | 'slip' | 'invoice'; multi?: boolean }) => {
      const filters = p?.kind === 'excel' ? [{ name: 'Excel', extensions: ['xlsx', 'xls', 'csv'] }]
        : p?.kind === 'slip' ? [{ name: 'Slip', extensions: ['pdf', 'png', 'jpg', 'jpeg', 'txt', 'docx'] }]
          : [{ name: 'Invoice', extensions: ['pdf', 'ofd', 'xml'] }];
      const r = await dialog.showOpenDialog(win()!, { properties: p?.multi ? ['openFile', 'multiSelections'] : ['openFile'], filters });
      return r.canceled ? [] : r.filePaths;
    },
    'dirs.pick': async () => {
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
    'log.clear': () => { store.update((s) => { s.log = []; }); pushState(); return true; },

    // ── 导入 ──
    'import.preview': (p: { path: string; sheet?: string }): IvColumnGuess & { sheets: string[] } => {
      if (!p?.path || !existsSync(p.path)) throw new Error(i18nT('文件不存在'));
      const sheets = listSheetNames(p.path);
      const t = readTable(p.path, p.sheet ? { sheetName: p.sheet } : {});
      const mapping = detectMapping(t.headers);
      return { headers: t.headers, mapping, missing: missingRequired(mapping), sample: t.rows.slice(0, 5), sheet: t.sheetName, rowCount: t.rows.length, sheets };
    },
    'import.commit': (p: { name?: string; items: Array<{ path: string; sheet?: string; mapping: Record<string, string> }> }) => {
      const items = Array.isArray(p?.items) ? p.items : [];
      if (!items.length) throw new Error(i18nT('请先选择文件'));
      const s = store.read().settings;
      const batchId = newId('ivb');
      const rows: IvRow[] = [];
      for (const it of items) {
        const miss = missingRequired(it.mapping || {});
        if (miss.length) throw new Error(i18nT('{p0}：还有必填列没有对应上', { p0: basename(it.path) }));
        const t = readTable(it.path, it.sheet ? { sheetName: it.sheet } : {});
        const known = Object.fromEntries(Object.entries(it.mapping).filter(([k, h]) => IV_FIELDS.some((f) => f.key === k) && t.headers.includes(h)));
        rows.push(...parseRows(t, known, { defaultTaxRate: s.seller.defaultTaxRate, amountTaxIncluded: s.amountTaxIncluded, defaultKind: s.defaultKind }, { batchId, newId: () => newId('ivr') }));
      }
      const name = String(p.name || '').trim() || basename(items[0].path, extname(items[0].path));
      return commitRows(name, items.map((i) => i.path), rows, items[0].mapping, 'file', batchId);
    },
    /** 付款回单：读出文字 → 模型抽取 → 名称与金额回原文核对，对不上的不收 */
    'import.slips': async (p: { paths?: string[]; text?: string; name?: string }) => {
      const texts: Array<{ file: string; text: string }> = [];
      if (String(p?.text || '').trim()) texts.push({ file: i18nT('粘贴的文字'), text: String(p.text) });
      const unreadable: string[] = [];
      for (const path of p?.paths || []) {
        let text = '';
        try {
          if (/\.txt$/i.test(path)) text = readFileSync(path, 'utf-8');
          else { const { extractDocument } = await import('../services/documentExtractor'); text = (await extractDocument(path)).text || ''; }
        } catch { text = ''; }
        if (text.trim()) texts.push({ file: basename(path), text }); else unreadable.push(basename(path));
      }
      if (!texts.length) throw new Error(unreadable.length ? i18nT('这些文件读不出文字：{p0}。扫描件请先转成文字，或把内容粘贴进来', { p0: unreadable.join('、') }) : i18nT('请选择付款回单或粘贴文字'));
      const s = store.read().settings;
      const batchId = newId('ivb');
      const rows: IvRow[] = [];
      const rejected: string[] = [];
      for (const t of texts) {
        const { json } = await llmJson('slip', P.slipExtractPrompt(t.text), 120_000);
        const list: any[] = Array.isArray(json) ? json : Array.isArray(json?.items) ? json.items : [];
        const v = verifyExtracted(list, t.text);
        for (const r of v.rejected) rejected.push(`${t.file}：${String(r.item?.buyerName || '')} ${String(r.item?.amount ?? '')} — ${r.reason}`);
        v.ok.forEach((it: any, i) => {
          const taxNo = normalizeTaxNo(it.buyerTaxNo);
          const inText = taxNo && t.text.replace(/\s/g, '').toUpperCase().includes(taxNo);
          const name = normalizeName(it.buyerName);
          rows.push({
            id: newId('ivr'), batchId, file: t.file, sheet: '', rowNo: i + 1,
            buyerName: name, buyerTaxNo: inText ? taxNo : '', buyerAddress: '', buyerPhone: '', buyerBank: '', buyerBankAccount: '', email: '', mobile: '',
            itemName: String(it.itemName || '').trim(), spec: '', unit: '', qty: 0, price: 0, amount: round2(Number(String(it.amount).replace(/[,，]/g, '')) || 0),
            taxIncluded: true, taxRate: s.seller.defaultTaxRate, kind: s.defaultKind, orderNo: String(it.orderNo || '').trim(), remark: String(it.remark || '').trim(),
            personal: false, issues: [], skipped: false,
          });
        });
      }
      if (!rows.length) throw new Error(rejected.length ? i18nT('抽取出来的内容和原文对不上，没有收下任何一条：{p0}', { p0: rejected.slice(0, 3).join('；') }) : i18nT('没有从付款回单里读到付款方和金额'));
      for (const r of rows) r.personal = !r.buyerTaxNo && !looksLikeOrg(r.buyerName);
      const out = commitRows(String(p?.name || '').trim() || i18nT('付款回单 {p0}', { p0: stamp() }), p?.paths || [], rows, {}, 'slip', batchId);
      return { ...out, rejected, unreadable };
    },
    'batch.remove': (p: { id: string }) => {
      const busy = store.read().drafts.some((d) => d.batchId === p.id && (d.status === 'handed' || d.status === 'issued' || d.status === 'red'));
      if (busy) throw new Error(i18nT('这一批里有已交出去或已开具的发票，不能删除'));
      store.update((s) => { s.batches = s.batches.filter((b) => b.id !== p.id); s.drafts = s.drafts.filter((d) => d.batchId !== p.id); });
      store.updateRows((rows) => ({ replace: rows.filter((r) => r.batchId !== p.id) }));
      pushState();
      return true;
    },

    // ── 校验 ──
    'rows.list': (p: { batchId: string }) => { batchOf(p.batchId); return { rows: rowsOf(p.batchId), summary: summary(p.batchId) }; },
    'rows.update': (p: { id: string; patch: Partial<IvRow> }) => {
      const row = requireFound(store.rows().find((r) => r.id === p.id), i18nT('这一行'));
      const patch = p.patch || {};
      store.updateRows(() => {
        const str = (k: 'buyerName' | 'buyerTaxNo' | 'itemName' | 'spec' | 'unit' | 'orderNo' | 'remark' | 'email' | 'mobile' | 'buyerAddress' | 'buyerPhone' | 'buyerBank' | 'buyerBankAccount') => {
          if (patch[k] === undefined) return;
          const v = String(patch[k] ?? '').trim();
          row[k] = k === 'buyerName' ? normalizeName(v) : k === 'buyerTaxNo' ? normalizeTaxNo(v) : v;
        };
        (['buyerName', 'buyerTaxNo', 'itemName', 'spec', 'unit', 'orderNo', 'remark', 'email', 'mobile', 'buyerAddress', 'buyerPhone', 'buyerBank', 'buyerBankAccount'] as const).forEach(str);
        const num = (k: 'qty' | 'price' | 'amount' | 'taxRate') => { if (patch[k] !== undefined && Number.isFinite(Number(patch[k]))) row[k] = Number(patch[k]); };
        (['qty', 'price', 'amount', 'taxRate'] as const).forEach(num);
        if (patch.kind === 'special' || patch.kind === 'normal') row.kind = patch.kind;
        if (patch.taxIncluded !== undefined) row.taxIncluded = !!patch.taxIncluded;
        if (patch.personal !== undefined) row.personal = !!patch.personal && !row.buyerTaxNo;
        if (patch.skipped !== undefined) row.skipped = !!patch.skipped;
        if (row.buyerTaxNo) row.personal = false;
      });
      validateBatch(row.batchId);
      return { rows: rowsOf(row.batchId), summary: summary(row.batchId) };
    },
    'rows.skip': (p: { ids: string[]; skipped: boolean }) => {
      const ids = new Set(p.ids || []);
      let batchId = '';
      store.updateRows((rows) => { for (const r of rows) if (ids.has(r.id)) { r.skipped = !!p.skipped; batchId = r.batchId; } });
      if (batchId) validateBatch(batchId);
      return batchId ? { rows: rowsOf(batchId), summary: summary(batchId) } : null;
    },
    'rows.refill': (p: { batchId: string }) => {
      let n = 0;
      store.updateRows((rows) => { n = fillFromCustomers(rows.filter((r) => r.batchId === p.batchId), store.read().customers); });
      validateBatch(p.batchId);
      return { filled: n, rows: rowsOf(p.batchId), summary: summary(p.batchId) };
    },

    // ── 档案 ──
    'customers.upsert': (p: Partial<IvCustomer> & { name: string; batchId?: string }) => {
      const c = upsertCustomer(p);
      if (p.batchId) validateBatch(p.batchId);
      pushState();
      return c;
    },
    'customers.remove': (p: { id: string }) => { store.update((s) => { s.customers = s.customers.filter((c) => c.id !== p.id); }); pushState(); return true; },
    'customers.import': (p: { path: string }) => {
      const t = readTable(p.path);
      const m = detectMapping(t.headers);
      if (!m.buyerName) throw new Error(i18nT('这张表里找不到客户名称一列'));
      let n = 0;
      for (const r of t.rows) {
        const name = normalizeName(r[m.buyerName]);
        if (!name) continue;
        const g = (k: string) => (m[k] ? String(r[m[k]] || '').trim() : undefined);
        try { upsertCustomer({ name, taxNo: g('buyerTaxNo'), address: g('buyerAddress'), phone: g('buyerPhone'), bank: g('buyerBank'), bankAccount: g('buyerBankAccount'), email: g('email'), mobile: g('mobile') }); n += 1; } catch { /* 税号格式不对的跳过 */ }
      }
      pushState();
      return { imported: n, total: t.rows.length };
    },
    'goods.upsert': (p: Partial<IvGoods> & { name: string }) => { const g = upsertGoods({ ...p, source: 'manual', confirmed: true }); pushState(); return g; },
    'goods.confirm': (p: { id: string }) => {
      const g = requireFound(store.read().goods.find((x) => x.id === p.id), i18nT('商品'));
      if (!g.taxCode) throw new Error(i18nT('先填税收分类编码'));
      store.update(() => { g.confirmed = true; });
      pushState();
      return g;
    },
    'goods.remove': (p: { id: string }) => { store.update((s) => { s.goods = s.goods.filter((g) => g.id !== p.id); }); pushState(); return true; },
    /** 这一批里还没有编码的项目名称 */
    'goods.missing': (p: { batchId: string }) => {
      const have = new Map(store.read().goods.map((g) => [g.name, g]));
      const names = [...new Set(rowsOf(p.batchId).filter((r) => !r.skipped && r.itemName).map((r) => r.itemName.trim()))];
      return names.map((name) => ({ name, goods: have.get(name) || null }));
    },
    /** 模型建议税收分类编码：只进档案的「待确认」，人确认前不能开票 */
    'goods.suggest': async (p: { batchId: string }) => {
      const have = new Set(store.read().goods.filter((g) => g.taxCode).map((g) => g.name));
      const names = [...new Set(rowsOf(p.batchId).filter((r) => !r.skipped && r.itemName).map((r) => r.itemName.trim()))].filter((n) => !have.has(n));
      if (!names.length) return { suggested: 0, unsure: [] as string[] };
      const { json } = await llmJson('goods', P.taxCodePrompt(names), 120_000);
      const list: any[] = Array.isArray(json) ? json : [];
      let n = 0; const unsure: string[] = [];
      for (const name of names) {
        const hit = list.find((x) => String(x?.name || '').trim() === name);
        const code = String(hit?.taxCode || '').replace(/\D/g, '');
        if (code.length !== 19) { unsure.push(name); continue; }
        upsertGoods({ name, taxCode: code, shortName: String(hit?.shortName || ''), source: 'suggested', confirmed: false });
        n += 1;
      }
      pushState();
      return { suggested: n, unsure };
    },

    // ── 组票 ──
    'drafts.build': (p: { batchId: string }) => {
      batchOf(p.batchId);
      const s = store.read();
      if (s.drafts.some((d) => d.batchId === p.batchId && d.status !== 'draft' && d.status !== 'confirmed')) throw new Error(i18nT('这一批里已有交出去或已开具的发票，不能重新组票；要改请新建一批'));
      validateBatch(p.batchId);
      const drafts = buildDrafts(rowsOf(p.batchId), p.batchId, {
        mergeMode: s.settings.mergeMode, perInvoiceLimit: s.settings.seller.perInvoiceLimit, maxLines: s.settings.maxLines, goods: s.goods,
        taxCodeRequired: true, newId: () => newId('ivd'), now: now(), serialPrefix: stamp().replace('-', '').slice(2),
      });
      for (const d of drafts) for (const m of taxDiffProblems(d)) d.issues.push({ level: 'error', code: 'tax_diff', message: m });
      store.update((st) => { st.drafts = [...drafts, ...st.drafts.filter((d) => d.batchId !== p.batchId)]; });
      log(i18nT('「{p0}」组成 {p1} 张发票，价税合计 {p2} 元', { p0: batchOf(p.batchId).name, p1: drafts.length, p2: yuan(drafts.reduce((n, d) => n + cents(d.total), 0)).toFixed(2) }));
      pushState();
      return { count: drafts.length, summary: summary(p.batchId) };
    },
    'drafts.confirm': (p: { ids: string[]; confirmed?: boolean }) => {
      const ids = p.ids || [];
      const editable = store.read().drafts.filter((d) => ids.includes(d.id) && (d.status === 'draft' || d.status === 'confirmed')).map((d) => d.id);
      const n = setStatus(editable, p.confirmed === false ? 'draft' : 'confirmed');
      pushState();
      return { changed: n, blocked: editable.length - n };
    },
    'drafts.update': (p: { id: string; patch: { remark?: string; email?: string; mobile?: string } }) => {
      const d = draftOf(p.id);
      if (d.status !== 'draft' && d.status !== 'confirmed') throw new Error(i18nT('已交出去的发票不能再改'));
      store.update(() => {
        if (p.patch?.remark !== undefined) d.remark = String(p.patch.remark).slice(0, 200);
        if (p.patch?.email !== undefined) d.email = String(p.patch.email).trim();
        if (p.patch?.mobile !== undefined) d.mobile = String(p.patch.mobile).trim();
        d.updatedAt = now();
      });
      pushState();
      return d;
    },

    // ── 开具 · 电子税务局 ──
    /** 在官方模板原文件上追加数据，生成批量导入文件（只含已确认的） */
    'issue.exportBatch': (p: { batchId: string }) => {
      const b = batchOf(p.batchId);
      const s = store.read();
      const list = s.drafts.filter((d) => d.batchId === p.batchId && d.status === 'confirmed');
      if (!list.length) throw new Error(i18nT('没有已确认的发票：先在上一步确认'));
      const blocking = etaxBatchProblems(list).find((i) => i.level === 'error');
      if (blocking) throw new Error(blocking.message);
      const own = s.settings.officialTemplate && existsSync(s.settings.officialTemplate) ? s.settings.officialTemplate : '';
      const bundled = join(shellResourcesPath(), 'invoice-agent', `etax-batch-template-${BUNDLED_TEMPLATE_VERSION}.xlsx`);
      const tpl = own || (existsSync(bundled) ? bundled : '');
      const file = join(outputDir(i18nT('批量导入文件')), `${safeFileName(b.name)}-${stamp()}.xlsx`);
      const r = writeEtaxImport(file, etaxBatchSheets(list), tpl || undefined);
      const total = yuan(list.reduce((n, d) => n + cents(d.total), 0));
      log(i18nT('生成批量导入文件：{p0} 张，价税合计 {p1} 元', { p0: list.length, p1: total.toFixed(2) }));
      pushState();
      return {
        file, count: list.length, total, lines: list.reduce((n, d) => n + d.lines.length, 0), unplaced: r.unplaced, usedOfficial: r.usedOfficial, templateIgnored: !!tpl && !r.usedOfficial,
        templateVersion: r.templateVersion, ownTemplate: !!own, warnings: etaxBatchProblems(list).filter((i) => i.level !== 'error').map((i) => i.message), ids: list.map((d) => d.id),
      };
    },
    'etax.url': () => etaxHomeUrl(province()),
    'etax.open': async () => noteEtax(await etax.open(province())),
    'etax.state': async () => noteEtax(await etax.state()),
    /** 朝「批量开票」页走；要人登录 / 扫脸时停下并说明 */
    'etax.goto': async (p: { goal?: 'blue' | 'batch' }) => noteEtax(await etax.advance(p?.goal === 'blue' ? 'blue' : 'batch', province())),
    /** 把导入文件放进「选择文件」并读回预览；发票还没开，要人点「批量开具」 */
    'etax.attach': async (p: { file: string; ids: string[] }) => {
      if (!p?.file || !existsSync(p.file)) throw new Error(i18nT('导入文件不存在，请重新生成'));
      const st = noteEtax(await etax.advance('batch', province()));
      if (st.need) throw new Error(i18nT('电子税务局现在需要你先处理：{p0}', { p0: needLabel(st.need) }));
      if (st.kind !== 'batch') throw new Error(i18nT('没能走到批量开票页，请在浏览器里手动进入「蓝字发票开具 → 批量开票」后再试'));
      if (st.sellerMismatch) throw new Error(i18nT('电子税务局登录的是「{p0}」，和第 1 步的销售方「{p1}」不是同一家，已停下', { p0: st.company, p1: store.read().settings.seller.name }));
      let r: Awaited<ReturnType<EtaxBrowser['attach']>>;
      try { r = await etax.attach(p.file); } catch { throw new Error(i18nT('批量开票页已经不在了，请重新进入')); }
      if (!r.attached) throw new Error(i18nT('在批量开票页上没找到「选择文件」的上传框，页面可能改版了；请手动点「选择文件」选这个文件：{p0}', { p0: p.file }));
      const mine = store.read().drafts.filter((d) => (p.ids || []).includes(d.id));
      const bySerial = new Map(r.preview.map((x) => [x.serial, x]));
      const missing = mine.filter((d) => !bySerial.has(d.serial)).map((d) => d.serial);
      const diff = mine.filter((d) => bySerial.has(d.serial) && cents(bySerial.get(d.serial)!.total) !== cents(d.total)).map((d) => d.serial);
      if (r.preview.length) setStatus(mine.filter((d) => bySerial.has(d.serial)).map((d) => d.id), 'handed', { channel: 'etax_batch' });
      log(i18nT('导入文件已放进批量开票页：页面列出 {p0} 张', { p0: r.preview.length }), r.preview.length > 0 && !missing.length && !diff.length);
      pushState();
      return { previewCount: r.preview.length, expected: mine.length, missing, diff, messages: r.messages };
    },
    /** 读「批量开票记录」，按发票流水号回填 */
    'etax.records': async () => {
      let recs: Awaited<ReturnType<EtaxBrowser['records']>>;
      try { recs = await etax.records(); } catch { throw new Error(i18nT('要先停在电子税务局的批量开票页，才能读批量开票记录')); }
      try { await etax.backToBatchTab(); } catch { /* 切不回去不影响结果 */ }
      const open = store.read().drafts.filter((d) => !d.invoiceNo && (d.status === 'handed' || d.status === 'confirmed' || d.status === 'failed'));
      let issued = 0; let failed = 0;
      for (const rec of recs) {
        const d = open.find((x) => x.serial === rec.serial);
        if (!d) continue;
        if (rec.ok) { issued += setStatus([d.id], 'issued', { invoiceNo: rec.invoiceNo, issuedAt: rec.at.slice(0, 10) || now().slice(0, 10), failReason: '', channel: 'etax_batch' }); }
        else if (rec.result) { failed += setStatus([d.id], 'failed', { failReason: (rec.failReason || rec.result).slice(0, 200), channel: 'etax_batch' }); }
      }
      log(i18nT('读回批量开票记录：{p0} 条，回填已开具 {p1} 张，失败 {p2} 张', { p0: recs.length, p1: issued, p2: failed }), failed === 0);
      pushState();
      return { records: recs.length, issued, failed };
    },

    // ── 开具 · 服务商接口 ──
    'api.save': (p: { appKey?: string; appSecret?: string; token?: string; sandbox?: boolean; eleAccount?: string; clearToken?: boolean }) => {
      if ((p.appSecret || p.token) && !canEncrypt()) throw new Error(i18nT('这台电脑的系统钥匙串不可用，接口密钥没法安全保存'));
      store.update((s) => {
        if (p.appKey !== undefined) s.settings.api.appKey = String(p.appKey).trim();
        if (p.sandbox !== undefined) s.settings.api.sandbox = !!p.sandbox;
        if (p.eleAccount !== undefined) s.settings.api.eleAccount = String(p.eleAccount).trim();
        if (p.appSecret) { s.secrets.apiSecret = seal(String(p.appSecret).trim()); s.tokenCache = null; }
        if (p.token) s.secrets.apiToken = seal(String(p.token).trim());
        if (p.clearToken) delete s.secrets.apiToken;
      });
      pushState();
      return store.read().settings.api;
    },
    /** 提交这一批已确认的发票；逐张提交，订单号 = 草稿 id（服务商按它去重，重复提交会被拒） */
    'api.submit': async (p: { batchId: string }) => {
      const s = store.read();
      const list = s.drafts.filter((d) => d.batchId === p.batchId && d.status === 'confirmed');
      if (!list.length) throw new Error(i18nT('没有已确认的发票：先在上一步确认'));
      const client = nuonuo();
      let ok = 0; const errors: string[] = [];
      for (const d of list) {
        try {
          const serial = await client.requestBilling(buildNuonuoOrder(d, s.settings.seller, { sandbox: s.settings.api.sandbox, taxNum: s.settings.seller.taxNo }));
          setStatus([d.id], 'handed', { apiSerial: serial, channel: 'api', failReason: '' });
          ok += 1;
        } catch (e) {
          const err = apiError(e);
          // 登录失效、没权限、密钥不对：后面的也一定失败，立刻停
          if (e instanceof NuonuoError && (e.needsLogin || e.noPermission || /^(07|invalid)/.test(e.code))) { pushState(); throw err; }
          setStatus([d.id], 'failed', { failReason: err.message.slice(0, 200), channel: 'api' });
          errors.push(`${d.buyerName}：${err.message}`);
        }
      }
      log(i18nT('接口提交 {p0} 张，失败 {p1} 张', { p0: ok, p1: errors.length }), errors.length === 0);
      pushState();
      return { submitted: ok, errors };
    },
    /** 查询已提交发票的结果并回填 */
    'api.poll': async () => {
      const pending = store.read().drafts.filter((d) => d.status === 'handed' && d.apiSerial);
      if (!pending.length) return { checked: 0, issued: 0, failed: 0, pending: 0 };
      let results;
      try { results = await nuonuo().queryResults(pending.map((d) => d.apiSerial!)); } catch (e) { throw apiError(e); }
      let issued = 0; let failed = 0;
      for (const r of results) {
        const d = pending.find((x) => x.apiSerial === r.serialNo);
        if (!d) continue;
        if (r.state === 'done' && r.invoiceNo) issued += setStatus([d.id], 'issued', { invoiceNo: r.invoiceNo, issuedAt: (r.invoiceTime || now()).slice(0, 10), pdfUrl: r.pdfUrl, ofdUrl: r.ofdUrl, xmlUrl: r.xmlUrl, failReason: '' });
        else if (r.state === 'failed' || r.state === 'void') failed += setStatus([d.id], 'failed', { failReason: (r.failCause || r.statusMsg || r.status).slice(0, 200) });
      }
      if (issued || failed) log(i18nT('接口查询：已开具 {p0} 张，失败 {p1} 张', { p0: issued, p1: failed }), failed === 0);
      pushState();
      return { checked: results.length, issued, failed, pending: pending.length - issued - failed };
    },
    /** 数电账号在服务商那边的税局登录验证：发验证码 / 取二维码 */
    'api.login.send': async (p: { type: '1' | '2' | '3' }) => {
      const acc = store.read().settings.api.eleAccount;
      if (!acc) throw new Error(i18nT('先填数电账号（登录电子税务局用的手机号或身份证号）'));
      const client = nuonuo();
      try { await client.sendVerify(acc, p.type); } catch (e) {
        if (e instanceof NuonuoError && e.code === 'E6045') return { already: true, verifyStatus: '4', verifyData: '', failMsg: '' };
        throw apiError(e);
      }
      for (let i = 0; i < 8; i += 1) {
        await new Promise((r) => setTimeout(r, 1500));
        const d = await client.verifyData(acc, p.type).catch((e) => { throw apiError(e); });
        if (d.verifyStatus !== '0') return { already: false, ...d };
      }
      return { already: false, verifyStatus: '0', verifyData: '', failMsg: '' };
    },
    'api.login.submit': async (p: { type: '1' | '2' | '3'; smsCode?: string }) => {
      const acc = store.read().settings.api.eleAccount;
      const client = nuonuo();
      try {
        await client.verifySubmit(acc, p.type, p.smsCode);
        for (let i = 0; i < 10; i += 1) {
          await new Promise((r) => setTimeout(r, 1500));
          const st = await client.verifyStatus(acc, p.type);
          if (st.verifyStatus !== '3') { if (st.verifyStatus === '4') log(i18nT('服务商侧的税局登录验证成功')); return st; }
        }
        return { verifyStatus: '3', failMsg: '' };
      } catch (e) { throw apiError(e); }
    },

    'drafts.status': (p: { ids: string[]; status: IvDraftStatus; invoiceNo?: string; issuedAt?: string; failReason?: string }) => {
      const extra: Partial<IvDraft> = {};
      if (p.status === 'issued') {
        const no = String(p.invoiceNo || '').replace(/\s/g, '');
        if ((p.ids || []).length === 1 && no) {
          if (!/^\d{8,20}$/.test(no)) throw new Error(i18nT('发票号码应为 8 到 20 位数字'));
          if (store.read().drafts.some((d) => d.invoiceNo === no && d.id !== p.ids[0])) throw new Error(i18nT('发票号码 {p0} 已经登记在另一张发票上', { p0: no }));
          extra.invoiceNo = no;
        }
        extra.issuedAt = p.issuedAt || now().slice(0, 10);
        extra.failReason = '';
      }
      if (p.status === 'failed') extra.failReason = String(p.failReason || '').slice(0, 200);
      const n = setStatus(p.ids || [], p.status, extra);
      if (n) log(i18nT('{p0} 张发票标记为：{p1}', { p0: n, p1: statusLabel(p.status) }), p.status !== 'failed');
      pushState();
      return n;
    },

    // ── 台账 ──
    /** 导入电子税务局「全量发票查询」导出的表：购方 + 价税合计都相同才回填 */
    'ledger.importIssued': (p: { path: string }) => {
      const t = readTable(p.path);
      const records = parseIssuedTable(t);
      const r = matchIssued(store.read().drafts, records);
      for (const m of r.matched) setStatus([m.draftId], 'issued', { invoiceNo: m.invoiceNo, issuedAt: m.issuedAt.slice(0, 10) || now().slice(0, 10), failReason: '' });
      log(i18nT('回填发票号码 {p0} 张；{p1} 张对不上唯一的一条，需要手工填', { p0: r.matched.length, p1: r.ambiguous.length }), r.ambiguous.length === 0);
      pushState();
      return { matched: r.matched.length, ambiguous: r.ambiguous, unmatched: r.unmatched.length, records: records.length };
    },
    'ledger.attach': async (p: { id: string }) => {
      const d = draftOf(p.id);
      const r = await dialog.showOpenDialog(win()!, { properties: ['openFile'], filters: [{ name: 'Invoice', extensions: ['pdf', 'ofd', 'xml'] }] });
      if (r.canceled || !r.filePaths[0]) return null;
      store.update(() => { d.file = r.filePaths[0]; d.updatedAt = now(); });
      pushState();
      return d.file;
    },
    /** 红冲在电子税务局「红字发票开具」里由人发起；这里只记原因，红冲完成后人回来标记 */
    'ledger.redNote': (p: { id: string; reason: string }) => {
      const d = draftOf(p.id);
      if (d.status !== 'issued') throw new Error(i18nT('只有已开具的发票才能红冲'));
      store.update(() => { d.redReason = String(p.reason || '').slice(0, 100); d.updatedAt = now(); });
      pushState();
      return d;
    },
    'ledger.export': () => {
      const s = store.read();
      const list = s.drafts.filter((d) => d.status !== 'draft');
      if (!list.length) throw new Error(i18nT('台账还是空的'));
      const batchName = new Map(s.batches.map((b) => [b.id, b.name]));
      const file = join(outputDir(i18nT('发票台账')), `${i18nT('发票台账')}-${stamp()}.xlsx`);
      writeWorkbook(file, [
        {
          name: i18nT('发票台账'),
          headers: [i18nT('批次'), i18nT('状态'), i18nT('票种'), i18nT('购买方名称'), i18nT('购买方税号'), i18nT('不含税金额'), i18nT('税额'), i18nT('价税合计'), i18nT('发票号码'), i18nT('开票日期'), i18nT('订单号'), i18nT('备注'), i18nT('失败原因')],
          rows: list.map((d) => [batchName.get(d.batchId) || '', statusLabel(d.status), d.kind === 'special' ? i18nT('专用发票') : i18nT('普通发票'), d.buyerName, d.buyerTaxNo, d.amount, d.tax, d.total, d.invoiceNo || '', d.issuedAt || '', d.orderNos.join(i18nT('、')), d.remark, d.failReason || '']),
        },
        {
          name: i18nT('发票明细'),
          headers: [i18nT('购买方名称'), i18nT('发票号码'), i18nT('项目名称'), i18nT('税收分类编码'), i18nT('规格型号'), i18nT('单位'), i18nT('数量'), i18nT('不含税金额'), i18nT('税率'), i18nT('税额'), i18nT('价税合计')],
          rows: list.flatMap((d) => d.lines.map((l) => [d.buyerName, d.invoiceNo || '', l.itemName, l.taxCode, l.spec, l.unit, l.qty || '', l.amount, l.taxRate, l.tax, l.total])),
        },
      ]);
      return file;
    },
  };

  ipcMain.handle(IPC_CHANNELS.WORKBENCH_IV_INVOKE, async (_e, req: { action: string; payload?: unknown }) => {
    const fn = actions[String(req?.action || '')];
    if (!fn) throw new Error(i18nT('未知操作：{p0}', { p0: String(req?.action || '') }));
    try {
      return await fn(req.payload ?? {});
    } catch (error) {
      logger?.warn?.('invoice-agent', `${req.action} failed`, { error: (error as Error)?.message });
      throw new Error(userFacingError(error));
    }
  });
}
