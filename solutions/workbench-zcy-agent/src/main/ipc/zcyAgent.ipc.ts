/**
 * 解决方案 · 「政采云」助手（主进程）。docs/zcy-agent-workbench.md
 *
 * 一条动作通道 WORKBENCH_ZC_INVOKE，按 action 分发；状态变化经 WORKBENCH_ZC_EVENT 推给渲染层。
 *
 *   账号：密码只存系统钥匙串加密后的密文；登录时由应用在内置浏览器里把账号密码填进政采云的登录框
 *         （只在 zcygov.cn 域名下填），验证码 / 滑块 / 短信由人完成 —— 密码不进任何模型对话；
 *   上架：商品表 → 区划规则检查（标题、禁用词、图片、比价链接、售价不高于自营基准）→ 人确认
 *         → 数字员工填写，停在「提交审核」前；
 *   询价：数字员工只读回待报价的询价单 → 人填成本 → 规则算报价 → 人确认 → 数字员工填写，停在「提交报价」前；
 *   订单：数字员工只读回订单（或导入订单表）→ 接单 / 发货时限预警 → 接单、回填物流停在确认前
 *         → 待开票订单转入智能发票助手。
 */
import { dialog, ipcMain, nativeImage, Notification, safeStorage, shell, type BrowserWindow } from 'electron';
import { existsSync, statSync } from 'node:fs';
import {
  IPC_CHANNELS,
  type ZcCompany, type ZcImageInfo, type ZcInquiry, type ZcInquiryItem, type ZcInquiryStatus, type ZcLogEntry, type ZcOrder, type ZcOrderStatus,
  type ZcPriceRef, type ZcProduct, type ZcProductStatus, type ZcRegionRule, type ZcSettings, type ZcState,
} from '@totalclaw/ipc-contracts';
import { t as i18nT } from '@totalclaw/i18n';
import type { WorkbenchIpcDeps } from './workbenchApi';
import { userFacingError } from '../utils/userFacingError';
import { onAppWillQuit } from '../util/quitRegistry';
import { createWorkbenchLlm } from '../services/workbenchLlm';
import { ZcyAgentStore, ZCY_HOME_URL, ZCY_JILIN_PORTAL, ZCY_LOGIN_URL, newId } from '../services/zcyAgent/store';
import {
  buildAlerts, checkProduct, composeTitle, normalizeInquiries, normalizeOrders, parseAgentJson, parseOrdersTable, parseProductsTable, parseTime,
  priceInquiry, refPlatform, strayNumbers, toNum, type InquirySeed, type OrderSeed,
} from '../services/zcyAgent/logic';
import * as P from '../services/zcyAgent/prompts';
import { readTable } from '../services/serviceSettlement/excel';
import { invoiceImportExternal } from './invoiceAgent.ipc';
import { isZcyHost, loginFillScript } from '../services/zcyAgent/login';
import { ONBOARD_FIELDS, ONBOARD_MANUAL, WORKBENCH_SCRIPT, ZCY_ONBOARD_LIST_URL, ZCY_WORKBENCH_URL, isOnboardFormUrl, onboardFillScript, parseFillResult, parseWorkbench } from '../services/zcyAgent/zcyPage';

const store = new ZcyAgentStore();
const BROWSER_CONTEXT = 'zcy-agent';

function requireFound<T>(v: T | undefined | null, what: string): T {
  if (v == null) throw new Error(i18nT('{p0}不存在或已删除', { p0: what }));
  return v;
}

export function registerZcyAgentHandlers(deps: WorkbenchIpcDeps): () => void {
  const logger = deps.logger;
  const win = (): BrowserWindow | null => deps.getMainWindow?.() ?? null;
  const pushState = (): void => { try { win()?.webContents.send(IPC_CHANNELS.WORKBENCH_ZC_EVENT, { type: 'state' }); } catch { /* 窗口已关 */ } };
  const now = (): string => new Date().toISOString();
  const log = (module: ZcLogEntry['module'], text: string, ok = true): void => { store.update((s) => { s.log.unshift({ at: now(), module, text, ok }); }); };
  const { modelOptions, llm } = createWorkbenchLlm(deps, { logTag: 'zcy-agent', moduleModel: () => store.read().settings.model || '' });

  const canEncrypt = (): boolean => { try { return safeStorage.isEncryptionAvailable(); } catch { return false; } };
  const rule = (): ZcRegionRule => { const s = store.read().settings; return s.regions.find((r) => r.id === s.regionId) || s.regions[0]; };
  const publicState = (): ZcState => {
    const s = store.read();
    return {
      settings: s.settings, products: s.products, inquiries: s.inquiries, orders: s.orders, log: s.log.slice(0, 80), secretStorage: canEncrypt(), workbench: s.workbench,
      alerts: buildAlerts({ orders: s.orders, inquiries: s.inquiries, products: s.products, company: s.settings.company, rule: rule(), now: Date.now() }),
    };
  };
  const productOf = (id: string): ZcProduct => requireFound(store.read().products.find((p) => p.id === id), i18nT('商品'));
  const inquiryOf = (id: string): ZcInquiry => requireFound(store.read().inquiries.find((q) => q.id === id), i18nT('询价单'));
  const orderOf = (id: string): ZcOrder => requireFound(store.read().orders.find((o) => o.id === id), i18nT('订单'));

  const imageInfo = (path: string): ZcImageInfo => {
    let width = 0; let height = 0; let kb = 0;
    try { kb = Math.ceil(statSync(path).size / 1024); const sz = nativeImage.createFromPath(path).getSize(); width = sz.width; height = sz.height; } catch { /* 读不出就留 0，检查里会提示 */ }
    return { path, width, height, kb };
  };
  /** 重新检查一个商品；确认过的商品又查出错误就退回草稿 */
  const recheck = (p: ZcProduct): void => {
    if (!p.title) p.title = composeTitle(p, rule().titleOrder);
    p.issues = checkProduct(p, rule());
    if (p.status === 'confirmed' && p.issues.some((i) => i.level === 'error')) p.status = 'draft';
  };
  const recheckAll = (): void => { store.update((s) => { for (const p of s.products) if (p.status === 'draft' || p.status === 'confirmed' || p.status === 'rejected') recheck(p); }); };

  function mergeOrders(seeds: OrderSeed[]): { added: number; updated: number } {
    let added = 0; let updated = 0;
    store.update((s) => {
      for (const x of seeds) {
        const cur = s.orders.find((o) => o.orderNo === x.orderNo);
        if (!cur) { s.orders.unshift({ id: newId('zco'), ...x, note: '', updatedAt: now() }); added += 1; continue; }
        // 平台读回来的状态为准；本机填的物流、税号在平台没给时保留
        cur.status = x.status;
        if (x.buyer) cur.buyer = x.buyer;
        if (x.buyerTaxNo) cur.buyerTaxNo = x.buyerTaxNo;
        if (x.amount) cur.amount = x.amount;
        if (x.createdAt) cur.createdAt = x.createdAt;
        if (x.items) cur.items = x.items;
        if (x.logisticsCompany) cur.logisticsCompany = x.logisticsCompany;
        if (x.logisticsNo) cur.logisticsNo = x.logisticsNo;
        cur.updatedAt = now();
        updated += 1;
      }
    });
    return { added, updated };
  }

  function mergeInquiries(seeds: InquirySeed[]): { added: number; updated: number } {
    let added = 0; let updated = 0;
    const margin = store.read().settings.defaultMargin;
    store.update((s) => {
      for (const x of seeds) {
        const cur = s.inquiries.find((q) => (x.no ? q.no === x.no : q.title === x.title));
        if (!cur) {
          s.inquiries.unshift({ id: newId('zcq'), ...x, items: x.items.map((it) => ({ ...it, cost: 0, quote: 0 })), margin, total: 0, status: 'new', issues: [], note: '', updatedAt: now() });
          added += 1; continue;
        }
        if (x.deadline) cur.deadline = x.deadline;
        if (x.budget) cur.budget = x.budget;
        if (x.url) cur.url = x.url;
        // 还没开始算价的才用新读回的明细覆盖；已经填了成本的不动
        if (cur.status === 'new' && x.items.length) cur.items = x.items.map((it) => ({ ...it, cost: cur.items.find((o) => o.name === it.name)?.cost || 0, quote: 0 }));
        cur.updatedAt = now();
        updated += 1;
      }
    });
    return { added, updated };
  }

  // 巡检提醒：到点只发通知，不自动操作网页
  const timer = setInterval(() => {
    try {
      const s = store.read();
      if (!s.settings.patrolTimes.length) return;
      const d = new Date();
      const hm = `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
      const day = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      if (!s.settings.patrolTimes.includes(hm) || s.lastPatrol[hm] === day) return;
      store.update((st) => { st.lastPatrol[hm] = day; });
      const alerts = publicState().alerts;
      if (Notification.isSupported()) {
        new Notification({ title: i18nT('政采云巡检时间到了'), body: alerts.length ? i18nT('有 {p0} 条待处理提醒，打开「政采云」助手读回最新订单与询价单', { p0: alerts.length }) : i18nT('打开「政采云」助手读回最新订单与询价单') }).show();
      }
      try { win()?.webContents.send(IPC_CHANNELS.WORKBENCH_ZC_EVENT, { type: 'patrol-due' }); } catch { /* 窗口已关 */ }
    } catch (e) { logger?.warn?.('zcy-agent', 'patrol tick failed', { error: (e as Error)?.message }); }
  }, 60_000);
  const stopBackground = () => clearInterval(timer);
  onAppWillQuit('zcy-agent', stopBackground, { once: true });

  const actions: Record<string, (p: any) => unknown> = {
    'state.get': () => publicState(),
    'models.list': () => modelOptions(),
    'settings.patch': (p: { patch: Partial<ZcSettings> }) => {
      const patch = p?.patch || {};
      store.update((s) => {
        if (patch.company) {
          const c = { ...s.settings.company, ...patch.company } as ZcCompany;
          c.qualifications = s.settings.company.qualifications;
          c.creditCode = String(c.creditCode || '').replace(/\s/g, '').toUpperCase();
          for (const k of ['englishName', 'shortName', 'postcode', 'email', 'contactMobile', 'totalAssets', 'employees', 'income', 'intro', 'registerOrg', 'registerCapital', 'scope', 'onjobCount', 'socialPayCount'] as const) c[k] = String(c[k] ?? '').trim();
          s.settings.company = c;
        }
        if (Array.isArray(patch.regions) && patch.regions.length) {
          s.settings.regions = patch.regions.map((r) => ({
            ...r,
            imageMinSide: Math.max(0, Math.round(toNum(r.imageMinSide))), imageMin: Math.max(0, Math.round(toNum(r.imageMin))), imageMaxKb: Math.max(1, Math.round(toNum(r.imageMaxKb))),
            priceRule: r.priceRule === 'min' ? 'min' : 'avg', priceTolerance: Math.min(1, Math.max(0, toNum(r.priceTolerance))), refMin: Math.max(0, Math.round(toNum(r.refMin))),
            acceptHours: Math.max(1, toNum(r.acceptHours)), titleMax: Math.max(10, Math.round(toNum(r.titleMax))),
            titleOrder: r.titleOrder === 'name_first' ? 'name_first' : 'brand_first', reviewDays: Math.max(0, Math.round(toNum(r.reviewDays))),
            bannedWords: (Array.isArray(r.bannedWords) ? r.bannedWords : []).map((w) => String(w).trim()).filter(Boolean),
          }));
        }
        if (patch.regionId && s.settings.regions.some((r) => r.id === patch.regionId)) s.settings.regionId = patch.regionId;
        if (patch.defaultMargin !== undefined) s.settings.defaultMargin = Math.min(5, Math.max(0, toNum(patch.defaultMargin)));
        if (patch.invoiceTaxRate !== undefined) s.settings.invoiceTaxRate = Math.min(1, Math.max(0, toNum(patch.invoiceTaxRate)));
        if (patch.model !== undefined) s.settings.model = String(patch.model || '');
        if (Array.isArray(patch.patrolTimes)) s.settings.patrolTimes = [...new Set(patch.patrolTimes.map((t) => String(t).trim()).filter((t) => /^([01]\d|2[0-3]):[0-5]\d$/.test(t)))].sort();
      });
      recheckAll();
      pushState();
      return publicState().settings;
    },
    'files.pick': async (p: { kind: 'excel' | 'image' | 'any'; multi?: boolean }) => {
      const filters = p?.kind === 'excel' ? [{ name: 'Excel', extensions: ['xlsx', 'xls', 'csv'] }] : p?.kind === 'image' ? [{ name: 'Image', extensions: ['jpg', 'jpeg', 'png'] }] : [];
      const r = await dialog.showOpenDialog(win()!, { properties: p?.multi ? ['openFile', 'multiSelections'] : ['openFile'], filters });
      return r.canceled ? [] : r.filePaths;
    },
    'path.open': async (p: { path: string; reveal?: boolean }) => {
      if (!p?.path || !existsSync(p.path)) throw new Error(i18nT('文件不存在'));
      if (p.reveal) { shell.showItemInFolder(p.path); return true; }
      const err = await shell.openPath(p.path);
      if (err) throw new Error(err);
      return true;
    },
    'log.clear': () => { store.update((s) => { s.log = []; }); pushState(); return true; },

    // ── 账号与材料 ──
    'account.save': (p: { username?: string; password?: string; loginUrl?: string; homeUrl?: string }) => {
      for (const u of [p.loginUrl, p.homeUrl]) if (u && !isZcyHost(u)) throw new Error(i18nT('地址必须是 https 的政采云域名（zcygov.cn）：{p0}', { p0: u }));
      if (p.password && !canEncrypt()) throw new Error(i18nT('这台电脑的系统钥匙串不可用，密码没法安全保存；登录时请自己在登录框里输入'));
      store.update((s) => {
        if (p.username !== undefined) s.settings.account.username = String(p.username).trim();
        if (p.loginUrl !== undefined) s.settings.account.loginUrl = p.loginUrl || ZCY_LOGIN_URL;
        if (p.homeUrl !== undefined) s.settings.account.homeUrl = p.homeUrl || ZCY_HOME_URL;
        if (p.password) s.passwordCipher = safeStorage.encryptString(String(p.password)).toString('base64');
      });
      if (p.password) log('account', i18nT('已保存政采云账号密码（加密存在本机）'));
      pushState();
      return publicState().settings.account;
    },
    'account.clearPassword': () => { store.update((s) => { s.passwordCipher = ''; }); log('account', i18nT('已删除保存的密码')); pushState(); return true; },
    /** 打开登录页并填好账号密码；验证码 / 滑块 / 点登录由人完成 */
    'account.login': async () => {
      const tabs = deps.embeddedBrowserTabs;
      if (!tabs) throw new Error(i18nT('内置浏览器不可用'));
      const s = store.read();
      const url = s.settings.account.loginUrl || ZCY_LOGIN_URL;
      if (!isZcyHost(url)) throw new Error(i18nT('登录地址不是政采云域名，已拦下'));
      const tab = await tabs.create({ url, contextId: BROWSER_CONTEXT, source: 'agent', activate: true });
      try { tabs.setAutomationPaused(tab.id, true); } catch { /* 没有自动化在跑 */ }
      try { tabs.setVisible(true); } catch { /* 忽略 */ }
      let password = '';
      if (s.passwordCipher && canEncrypt()) { try { password = safeStorage.decryptString(Buffer.from(s.passwordCipher, 'base64')); } catch { password = ''; } }
      if (!s.settings.account.username || !password) return { opened: true, filled: false, reason: 'no-credential' };
      let result = 'no-form';
      for (let i = 0; i < 20 && result !== 'filled'; i += 1) {
        await new Promise((r) => setTimeout(r, 750));
        // 每次都重新核对域名：页面被重定向到别处就不填
        if (!isZcyHost(tabs.currentUrlOf(tab.id))) { result = 'off-site'; continue; }
        try { result = String(await tabs.evalInTab(tab.id, loginFillScript(s.settings.account.username, password))); } catch { result = 'no-form'; }
      }
      password = '';
      if (result === 'filled') { store.update((st) => { st.settings.account.lastFillAt = now(); }); log('account', i18nT('已在登录页填好账号密码，等你过验证码并点登录')); pushState(); }
      return { opened: true, filled: result === 'filled', reason: result };
    },
    // ── 打开政采云、读工作台、入驻 ──
    /** 在内置浏览器里打开政采云的某个页面（都要求是政采云域名） */
    'site.open': async (p: { target: 'workbench' | 'onboard' | 'home' | 'portal' }) => {
      const tabs = deps.embeddedBrowserTabs;
      if (!tabs) throw new Error(i18nT('内置浏览器不可用'));
      const acc = store.read().settings.account;
      const url = p?.target === 'onboard' ? ZCY_ONBOARD_LIST_URL : p?.target === 'home' ? (acc.homeUrl || ZCY_HOME_URL) : p?.target === 'portal' ? ZCY_JILIN_PORTAL : ZCY_WORKBENCH_URL;
      const tab = await tabs.create({ url, contextId: BROWSER_CONTEXT, source: 'agent', activate: true });
      try { tabs.setAutomationPaused(tab.id, true); } catch { /* 没有自动化在跑 */ }
      try { tabs.setVisible(true); } catch { /* 忽略 */ }
      return { url };
    },
    /** 打开供应商工作台并读回：登录了没有、入驻到哪一步、各项待办计数。只读，不点任何东西。 */
    'site.readWorkbench': async () => {
      const tabs = deps.embeddedBrowserTabs;
      if (!tabs) throw new Error(i18nT('内置浏览器不可用'));
      const tab = await tabs.create({ url: ZCY_WORKBENCH_URL, contextId: BROWSER_CONTEXT, source: 'agent', activate: true });
      try { tabs.setAutomationPaused(tab.id, true); } catch { /* 没有自动化在跑 */ }
      try { tabs.setVisible(true); } catch { /* 忽略 */ }
      let read = parseWorkbench(null);
      for (let i = 0; i < 16; i += 1) {
        await new Promise((r) => setTimeout(r, 1000));
        if (!isZcyHost(tabs.currentUrlOf(tab.id))) continue;
        try { read = parseWorkbench(await tabs.evalInTab(tab.id, WORKBENCH_SCRIPT)); } catch { continue; }
        // 被打回登录页，或者工作台的计数卡已经渲染出来，就不用再等
        if (!read.loggedIn || (read.onWorkbench && read.todos.length)) break;
      }
      const wb = { readAt: now(), loggedIn: read.loggedIn && read.onWorkbench, region: read.region, identity: read.identity, temporary: read.temporary, todos: read.todos };
      store.update((s) => { s.workbench = wb; });
      log('account', wb.loggedIn ? i18nT('读回政采云工作台：{p0}{p1}', { p0: wb.region || '', p1: wb.identity ? ` · ${wb.identity}` : '' }) : i18nT('政采云还没登录'), wb.loggedIn);
      pushState();
      return wb;
    },
    /** 入驻要准备的东西：能自动填的文本项里还缺哪些、要人在页面上处理的有哪些 */
    'onboard.checklist': () => {
      const c = store.read().settings.company as unknown as Record<string, unknown>;
      return {
        ready: ONBOARD_FIELDS.filter((f) => String(c[f.key] ?? '').trim()).map((f) => f.label),
        missing: ONBOARD_FIELDS.filter((f) => !String(c[f.key] ?? '').trim()).map((f) => f.label),
        manual: ONBOARD_MANUAL,
      };
    },
    /** 把企业资料填进入驻填报页的文本框（要先停在那个页面上）；不点保存草稿，也不点提交入驻申请 */
    'onboard.fill': async (p: { overwrite?: boolean }) => {
      const tabs = deps.embeddedBrowserTabs;
      if (!tabs) throw new Error(i18nT('内置浏览器不可用'));
      const tabId = tabs.tabIdForAgentContext(BROWSER_CONTEXT);
      const url = tabId ? tabs.currentUrlOf(tabId) : '';
      if (!tabId || !isOnboardFormUrl(url)) throw new Error(i18nT('内置浏览器现在不在入驻填报页：先点「打开入驻页面」，在列表里点「继续入驻」进到填资料的页面，再回来点填写'));
      const r = parseFillResult(await tabs.evalInTab(tabId, onboardFillScript(store.read().settings.company, !!p?.overwrite)));
      if (r.error) throw new Error(i18nT('内置浏览器现在不在入驻填报页：先点「打开入驻页面」，在列表里点「继续入驻」进到填资料的页面，再回来点填写'));
      log('account', i18nT('入驻资料：填了 {p0} 项，{p1} 项页面上已有不同的值没有动', { p0: r.filled.length, p1: r.kept.length }));
      pushState();
      return { ...r, manual: ONBOARD_MANUAL };
    },

    'qual.save': (p: { id?: string; name: string; file?: string; expireAt?: string; note?: string }) => {
      const name = String(p?.name || '').trim();
      if (!name) throw new Error(i18nT('请填资质名称'));
      const expireAt = String(p.expireAt || '').trim();
      if (expireAt && !/^\d{4}-\d{2}-\d{2}$/.test(expireAt)) throw new Error(i18nT('到期日格式应为 2026-12-31'));
      store.update((s) => {
        const list = s.settings.company.qualifications;
        const cur = p.id ? list.find((q) => q.id === p.id) : undefined;
        if (cur) Object.assign(cur, { name, expireAt, note: String(p.note || ''), ...(p.file !== undefined ? { file: p.file } : {}) });
        else list.push({ id: newId('zcf'), name, file: String(p.file || ''), expireAt, note: String(p.note || '') });
      });
      pushState();
      return true;
    },
    'qual.remove': (p: { id: string }) => { store.update((s) => { s.settings.company.qualifications = s.settings.company.qualifications.filter((q) => q.id !== p.id); }); pushState(); return true; },

    // ── 商品上架 ──
    'products.import': (p: { path: string }) => {
      const seeds = parseProductsTable(readTable(p.path));
      if (!seeds.length) throw new Error(i18nT('这张表里没有读到商品'));
      store.update((s) => {
        for (const x of seeds) {
          const { imagePaths, ...rest } = x;
          const prod: ZcProduct = { id: newId('zcp'), ...rest, title: '', images: imagePaths.filter((f) => existsSync(f)).map(imageInfo), status: 'draft', issues: [], updatedAt: now() };
          recheck(prod);
          s.products.unshift(prod);
        }
      });
      log('listing', i18nT('导入 {p0} 个商品', { p0: seeds.length }));
      pushState();
      return { imported: seeds.length };
    },
    'product.save': (p: { id?: string; patch: Partial<ZcProduct> }) => {
      const patch = p?.patch || {};
      const out = store.update((s) => {
        let cur = p.id ? s.products.find((x) => x.id === p.id) : undefined;
        if (p.id && !cur) throw new Error(i18nT('{p0}不存在或已删除', { p0: i18nT('商品') }));
        if (cur && !['draft', 'confirmed', 'rejected'].includes(cur.status)) throw new Error(i18nT('已交给数字员工的商品不能再改；要改先标记为被驳回'));
        if (!cur) { cur = { id: newId('zcp'), name: '', brand: '', model: '', category: '', title: '', price: 0, stock: 0, unit: '', params: '', detail: '', images: [], refs: [], status: 'draft', issues: [], updatedAt: now() }; s.products.unshift(cur); }
        const str = (k: 'name' | 'brand' | 'model' | 'category' | 'title' | 'unit' | 'params' | 'detail') => { if (patch[k] !== undefined) cur![k] = String(patch[k] ?? '').trim(); };
        (['name', 'brand', 'model', 'category', 'title', 'unit', 'params', 'detail'] as const).forEach(str);
        if (patch.price !== undefined) cur.price = Math.max(0, toNum(patch.price));
        if (patch.stock !== undefined) cur.stock = Math.max(0, Math.round(toNum(patch.stock)));
        if (Array.isArray(patch.refs)) cur.refs = patch.refs.filter((r) => r?.url).map((r): ZcPriceRef => ({ url: String(r.url).trim(), platform: refPlatform(String(r.url)), price: Math.max(0, toNum(r.price)) }));
        if (Array.isArray(patch.images)) cur.images = patch.images.map((im) => imageInfo(String(im?.path || im)));
        if (cur.status === 'rejected') cur.status = 'draft';
        cur.updatedAt = now();
        recheck(cur);
        return cur;
      });
      pushState();
      return out;
    },
    'product.addImages': async (p: { id: string }) => {
      const prod = productOf(p.id);
      const r = await dialog.showOpenDialog(win()!, { properties: ['openFile', 'multiSelections'], filters: [{ name: 'Image', extensions: ['jpg', 'jpeg', 'png'] }] });
      if (r.canceled) return prod;
      store.update(() => { prod.images = [...prod.images, ...r.filePaths.filter((f) => !prod.images.some((i) => i.path === f)).map(imageInfo)]; prod.updatedAt = now(); recheck(prod); });
      pushState();
      return prod;
    },
    'product.remove': (p: { id: string }) => { store.update((s) => { s.products = s.products.filter((x) => x.id !== p.id); }); pushState(); return true; },
    'products.recheck': () => { recheckAll(); pushState(); return true; },
    /** 模型按参数写详情：只许用给定参数，写出来的数字回参数核对 */
    'product.describe': async (p: { id: string }) => {
      const prod = productOf(p.id);
      if (!prod.params.trim()) throw new Error(i18nT('先填参数：详情只能从参数里写，没有参数就没有可写的'));
      const { text } = await llm('listing', P.describePrompt(prod), 90_000);
      const detail = text.trim().replace(/^["'「]|["'」]$/g, '').slice(0, 500);
      const stray = strayNumbers(detail, `${prod.params}\n${prod.name}\n${prod.model}\n${prod.brand}`);
      if (stray.length) throw new Error(i18nT('模型写的详情里出现了参数里没有的数字（{p0}），没有采用；请重试或自己写', { p0: stray.join('、') }));
      store.update(() => { prod.detail = detail; prod.updatedAt = now(); recheck(prod); });
      pushState();
      return prod;
    },
    'product.confirm': (p: { ids: string[]; confirmed?: boolean }) => {
      let n = 0; let blocked = 0;
      store.update((s) => {
        for (const x of s.products) {
          if (!(p.ids || []).includes(x.id) || (x.status !== 'draft' && x.status !== 'confirmed')) continue;
          if (p.confirmed === false) { x.status = 'draft'; n += 1; continue; }
          recheck(x);
          if (x.issues.some((i) => i.level === 'error')) { blocked += 1; continue; }
          x.status = 'confirmed'; n += 1;
        }
      });
      pushState();
      return { changed: n, blocked };
    },
    'product.instruction': (p: { id: string }) => {
      const prod = productOf(p.id);
      if (prod.status !== 'confirmed') throw new Error(i18nT('先确认这个商品'));
      return P.listingInstruction(prod, rule(), store.read().settings.account);
    },
    'product.status': (p: { id: string; status: ZcProductStatus; conversationId?: string; productUrl?: string; rejectReason?: string }) => {
      const prod = productOf(p.id);
      store.update(() => {
        prod.status = p.status;
        if (p.conversationId) prod.conversationId = p.conversationId;
        if (p.productUrl !== undefined) prod.productUrl = String(p.productUrl).trim();
        if (p.status === 'rejected') prod.rejectReason = String(p.rejectReason || '').slice(0, 200);
        prod.updatedAt = now();
      });
      log('listing', i18nT('「{p0}」：{p1}', { p0: prod.title || prod.name, p1: productStatusLabel(p.status) }), p.status !== 'rejected');
      pushState();
      return prod;
    },

    // ── 询价报价 ──
    'inquiry.patrolInstruction': () => P.inquiriesPatrolInstruction(store.read().settings.account),
    'inquiry.importReply': (p: { text: string }) => {
      const r = normalizeInquiries(parseAgentJson(p.text));
      const m = mergeInquiries(r.inquiries);
      log('quote', i18nT('读回询价单：新增 {p0} 张，更新 {p1} 张', { p0: m.added, p1: m.updated }));
      pushState();
      return { ...m, dropped: r.dropped };
    },
    'inquiry.save': (p: { id?: string; patch: Partial<ZcInquiry> }) => {
      const patch = p?.patch || {};
      const out = store.update((s) => {
        let cur = p.id ? s.inquiries.find((q) => q.id === p.id) : undefined;
        if (p.id && !cur) throw new Error(i18nT('{p0}不存在或已删除', { p0: i18nT('询价单') }));
        if (cur && !['new', 'priced', 'confirmed'].includes(cur.status)) throw new Error(i18nT('已交出去的询价单不能再改'));
        if (!cur) { cur = { id: newId('zcq'), no: '', title: '', buyer: '', deadline: '', budget: 0, items: [], margin: s.settings.defaultMargin, total: 0, status: 'new', issues: [], url: '', note: '', updatedAt: now() }; s.inquiries.unshift(cur); }
        if (patch.no !== undefined) cur.no = String(patch.no).trim();
        if (patch.title !== undefined) cur.title = String(patch.title).trim();
        if (patch.buyer !== undefined) cur.buyer = String(patch.buyer).trim();
        if (patch.note !== undefined) cur.note = String(patch.note).slice(0, 300);
        if (patch.url !== undefined) cur.url = /^https?:\/\//.test(String(patch.url)) ? String(patch.url).trim() : '';
        if (patch.deadline !== undefined) cur.deadline = parseTime(patch.deadline) || (Number.isFinite(Date.parse(String(patch.deadline))) ? new Date(String(patch.deadline)).toISOString() : '');
        if (patch.budget !== undefined) cur.budget = Math.max(0, toNum(patch.budget));
        if (patch.margin !== undefined) cur.margin = Math.min(5, Math.max(0, toNum(patch.margin)));
        if (Array.isArray(patch.items)) {
          cur.items = patch.items.filter((it) => String(it?.name || '').trim()).map((it): ZcInquiryItem => ({
            name: String(it.name).trim(), spec: String(it.spec || '').trim(), qty: Math.max(0, toNum(it.qty)), unit: String(it.unit || '').trim(),
            ceiling: Math.max(0, toNum(it.ceiling)), cost: Math.max(0, toNum(it.cost)), quote: 0,
          }));
        }
        // 改了任何一项，之前算的报价作废，回到待算价
        cur.status = 'new'; cur.total = 0; cur.issues = [];
        for (const it of cur.items) it.quote = 0;
        cur.updatedAt = now();
        return cur;
      });
      pushState();
      return out;
    },
    'inquiry.price': (p: { id: string }) => {
      const q = inquiryOf(p.id);
      if (!['new', 'priced', 'confirmed'].includes(q.status)) throw new Error(i18nT('已交出去的询价单不能再改'));
      if (!q.items.length) throw new Error(i18nT('这张询价单还没有明细'));
      const r = priceInquiry(q);
      store.update(() => { q.items = r.items; q.total = r.total; q.issues = r.issues; q.status = 'priced'; q.updatedAt = now(); });
      pushState();
      return q;
    },
    'inquiry.status': (p: { id: string; status: ZcInquiryStatus; conversationId?: string }) => {
      const q = inquiryOf(p.id);
      if (p.status === 'confirmed') {
        if (q.status !== 'priced') throw new Error(i18nT('先算报价'));
        if (q.issues.some((i) => i.level === 'error')) throw new Error(i18nT('这张询价单的报价还有问题，不能确认：{p0}', { p0: q.issues.find((i) => i.level === 'error')!.message }));
      }
      store.update(() => { q.status = p.status; if (p.conversationId) q.conversationId = p.conversationId; q.updatedAt = now(); });
      log('quote', i18nT('「{p0}」：{p1}', { p0: q.title || q.no, p1: inquiryStatusLabel(p.status) }), p.status !== 'lost');
      pushState();
      return q;
    },
    'inquiry.instruction': (p: { id: string }) => {
      const q = inquiryOf(p.id);
      if (q.status !== 'confirmed') throw new Error(i18nT('先确认报价'));
      return P.quoteInstruction(q, store.read().settings.account);
    },
    'inquiry.remove': (p: { id: string }) => { store.update((s) => { s.inquiries = s.inquiries.filter((q) => q.id !== p.id); }); pushState(); return true; },

    // ── 订单履约 ──
    'orders.patrolInstruction': () => P.ordersPatrolInstruction(store.read().settings.account),
    'orders.importReply': (p: { text: string }) => {
      const r = normalizeOrders(parseAgentJson(p.text));
      const m = mergeOrders(r.orders);
      log('orders', i18nT('读回订单：新增 {p0} 张，更新 {p1} 张', { p0: m.added, p1: m.updated }));
      pushState();
      return { ...m, dropped: r.dropped };
    },
    'orders.importFile': (p: { path: string }) => {
      const r = parseOrdersTable(readTable(p.path));
      const m = mergeOrders(r.orders);
      log('orders', i18nT('导入订单表：新增 {p0} 张，更新 {p1} 张', { p0: m.added, p1: m.updated }));
      pushState();
      return { ...m, dropped: r.dropped };
    },
    'order.update': (p: { id: string; patch: Partial<ZcOrder> }) => {
      const o = orderOf(p.id);
      const patch = p.patch || {};
      store.update(() => {
        if (patch.logisticsCompany !== undefined) o.logisticsCompany = String(patch.logisticsCompany).trim();
        if (patch.logisticsNo !== undefined) o.logisticsNo = String(patch.logisticsNo).replace(/\s/g, '');
        if (patch.buyerTaxNo !== undefined) o.buyerTaxNo = String(patch.buyerTaxNo).replace(/\s/g, '').toUpperCase();
        if (patch.note !== undefined) o.note = String(patch.note).slice(0, 200);
        if (patch.status) o.status = patch.status as ZcOrderStatus;
        if (patch.conversationId) o.conversationId = patch.conversationId;
        o.updatedAt = now();
      });
      pushState();
      return o;
    },
    'order.acceptInstruction': (p: { id: string }) => {
      const o = orderOf(p.id);
      if (o.status !== 'to_accept') throw new Error(i18nT('这张订单不在待接单状态'));
      return P.acceptOrderInstruction(o, store.read().settings.account);
    },
    'order.shipInstruction': (p: { id: string }) => {
      const o = orderOf(p.id);
      if (o.status !== 'to_ship') throw new Error(i18nT('这张订单不在待发货状态'));
      if (!o.logisticsCompany || !o.logisticsNo) throw new Error(i18nT('先填物流公司和物流单号'));
      return P.shipOrderInstruction(o, store.read().settings.account);
    },
    'order.remove': (p: { id: string }) => { store.update((s) => { s.orders = s.orders.filter((o) => o.id !== p.id); }); pushState(); return true; },
    /** 待开票订单转入智能发票助手：建一批开票行，金额按含税，项目名称要在智能发票助手里改成规范的开票项目 */
    'orders.toInvoice': (p: { ids: string[] }) => {
      const s = store.read();
      const list = s.orders.filter((o) => (p.ids || []).includes(o.id) && !o.invoiceBatchId);
      if (!list.length) throw new Error(i18nT('没有可转入的订单（已转过的不会重复转）'));
      const bad = list.find((o) => !(o.amount > 0) || !o.buyer);
      if (bad) throw new Error(i18nT('订单 {p0} 缺采购单位或金额，不能转开票', { p0: bad.orderNo }));
      const stamp = new Date().toISOString().slice(0, 10);
      const batchId = invoiceImportExternal({
        name: i18nT('政采云订单 {p0}', { p0: stamp }), source: 'zcy',
        rows: list.map((o) => ({ buyerName: o.buyer, buyerTaxNo: o.buyerTaxNo, itemName: o.items, amount: o.amount, taxIncluded: true, taxRate: s.settings.invoiceTaxRate, orderNo: o.orderNo, kind: 'normal' as const, remark: i18nT('政采云订单 {p0}', { p0: o.orderNo }) })),
      });
      store.update(() => { for (const o of list) { o.invoiceBatchId = batchId; o.updatedAt = now(); } });
      log('orders', i18nT('{p0} 张订单已转入智能发票助手', { p0: list.length }));
      pushState();
      return { batchId, count: list.length };
    },
  };

  ipcMain.handle(IPC_CHANNELS.WORKBENCH_ZC_INVOKE, async (_e, req: { action: string; payload?: unknown }) => {
    const fn = actions[String(req?.action || '')];
    if (!fn) throw new Error(i18nT('未知操作：{p0}', { p0: String(req?.action || '') }));
    try {
      return await fn(req.payload ?? {});
    } catch (error) {
      logger?.warn?.('zcy-agent', `${req.action} failed`, { error: (error as Error)?.message });
      throw new Error(userFacingError(error));
    }
  });
  // 卸载 / 停用时由方案入口 deactivate 调用（宿主只撤 IPC 通道，后台任务要自己停）
  return stopBackground;
}

const productStatusLabel = (s: ZcProductStatus): string => ({ draft: i18nT('草稿'), confirmed: i18nT('已确认'), handed: i18nT('数字员工处理中'), submitted: i18nT('已提交审核'), listed: i18nT('已上架'), rejected: i18nT('被驳回'), delisted: i18nT('已下架') }[s]);
const inquiryStatusLabel = (s: ZcInquiryStatus): string => ({ new: i18nT('待算价'), priced: i18nT('已算价'), confirmed: i18nT('已确认'), handed: i18nT('数字员工处理中'), submitted: i18nT('已提交报价'), won: i18nT('已成交'), lost: i18nT('未成交'), skipped: i18nT('不参与') }[s]);
