/**
 * 解决方案 · 服装实体店智能体（主进程）。docs/apparel-store-workbench.md
 *
 * 一条动作通道 WORKBENCH_AP_INVOKE，按 action 分发；状态变化经 WORKBENCH_AP_EVENT 推给渲染层。
 * 手机端局域网服务与电脑端共用同一个 ApparelService，顾客在手机上生成的图电脑上实时出现。
 *
 * 启动即：把上次没跑完的试穿重新排队、清掉过了保留期的顾客照片；之后每小时再清一次。
 */
import { app, dialog, ipcMain, shell, type BrowserWindow } from 'electron';
import { copyFileSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { extname, join } from 'node:path';
import { IPC_CHANNELS, type ApCustomer, type ApSettings, type ApState, type ApVisitStatus } from '@totalclaw/ipc-contracts';
import { t as i18nT } from '@totalclaw/i18n';
import type { WorkbenchIpcDeps } from './workbenchApi';
import { userFacingError } from '../utils/userFacingError';
import { onAppWillQuit } from '../util/quitRegistry';
import { ApparelStore, newStoreKey, type StoredCustomer } from '../services/apparelStore/store';
import { ApparelService } from '../services/apparelStore/service';
import { ApparelMobileServer } from '../services/apparelStore/mobileServer';
import { publicStyleOptions } from '../services/apparelStore/styleOptions';

const store = new ApparelStore();
let service: ApparelService | null = null;

/** 商品库给经营自动化智能体用 */
export function apparelService(): ApparelService | null { return service; }
export function apparelStoreInstance(): ApparelStore { return store; }

function publicCustomer(c: StoredCustomer): ApCustomer {
  const { mobileToken: _t, background: _b, ...rest } = c;
  return rest;
}

export function registerApparelStoreHandlers(deps: WorkbenchIpcDeps): void {
  const logger = deps.logger;
  const win = (): BrowserWindow | null => deps.getMainWindow?.() ?? null;
  const broadcast = (type: 'state' | 'progress', payload?: unknown): void => {
    try { win()?.webContents.send(IPC_CHANNELS.WORKBENCH_AP_EVENT, { type, payload }); } catch { /* 窗口已关 */ }
  };
  let stateTimer: ReturnType<typeof setTimeout> | null = null;
  const pushState = (): void => {
    if (stateTimer) return;
    stateTimer = setTimeout(() => { stateTimer = null; broadcast('state'); }, 150);
  };
  const svc = new ApparelService(deps, store, pushState, (message) => broadcast('progress', { message }));
  service = svc;
  const mobile = new ApparelMobileServer(svc, logger);

  /** 导出目录；create=false 只算路径（展示用），真正写文件时才建 */
  const outputDir = (create = true): string => {
    const s = store.read().settings;
    const root = s.outputDir && existsSync(s.outputDir) ? s.outputDir : join(app.getPath('documents'), 'TotalClaw', i18nT('服装实体店'));
    if (create) mkdirSync(root, { recursive: true });
    return root;
  };

  const publicState = (): ApState => {
    const s = store.read();
    return {
      settings: s.settings,
      garments: s.garments,
      customers: s.customers.map(publicCustomer),
      tryons: s.tryons,
      mobile: mobile.status(),
      imageReady: svc.imageReady(),
      thumbs: svc.thumbs(),
      outputDir: outputDir(false),
    };
  };

  // 启动：续跑队列 + 清过期照片；之后每小时清一次
  try { svc.resumeQueue(); svc.purgeExpired(); } catch (e) { logger?.warn?.('apparel-store', 'startup housekeeping failed', { error: (e as Error)?.message }); }
  const purgeTimer = setInterval(() => { try { svc.purgeExpired(); } catch { /* 下次再清 */ } }, 60 * 60_000);
  purgeTimer.unref?.();
  onAppWillQuit('apparel-store', () => { clearInterval(purgeTimer); void mobile.stop(); }, { once: true });

  const actions: Record<string, (p: any) => unknown> = {
    'state.get': () => publicState(),
    'stats.get': () => svc.stats(),
    'options.list': () => publicStyleOptions(),
    'options.thumbs': (p: { ids?: string[] }) => svc.generateThumbs(p?.ids),

    'files.pick': async (p: { multi?: boolean; title?: string }) => {
      const r = await dialog.showOpenDialog(win()!, {
        title: p?.title || i18nT('选择图片'),
        properties: p?.multi ? ['openFile', 'multiSelections'] : ['openFile'],
        filters: [{ name: 'Image', extensions: ['jpg', 'jpeg', 'png', 'webp', 'heic', 'bmp'] }],
      });
      return r.canceled ? [] : r.filePaths;
    },
    'path.open': async (p: { path: string; reveal?: boolean }) => {
      if (!p?.path || !existsSync(p.path)) throw new Error(i18nT('文件不存在'));
      if (p.reveal) { shell.showItemInFolder(p.path); return true; }
      const err = await shell.openPath(p.path);
      if (err) throw new Error(err);
      return true;
    },

    'garments.import': (p: { paths: string[] }) => svc.importGarments(p?.paths || []),
    'garment.save': (p: { input: any }) => svc.saveGarment(p?.input || {}),
    'garment.remove': (p: { id: string }) => { svc.removeGarment(p.id); return true; },
    'garment.tag': (p: { id: string }) => svc.tagGarment(p.id),

    'customer.create': (p: { nickname?: string; heightCm?: number; weightKg?: number; consent: boolean }) => publicCustomer(svc.createCustomer({ ...p, source: 'desk' })),
    'customer.update': (p: { id: string; patch: any }) => publicCustomer(svc.updateCustomer(p.id, p.patch || {})),
    'customer.image': (p: { id: string; path: string; kind?: 'photo' | 'background' }) => publicCustomer(svc.setImage(p.id, p.kind === 'background' ? 'background' : 'photo', { path: p.path })),
    'customer.hasBackground': (p: { id: string }) => !!store.read().customers.find((c) => c.id === p.id)?.background,
    'customer.analyze': (p: { id: string; audience?: string }) => svc.analyze(p.id, p.audience).then(publicCustomer),
    'customer.purge': (p: { id: string }) => { svc.purgeCustomer(p.id); return true; },

    'tryon.enqueue': (p: { customerId: string; garmentIds: string[]; choices: any[] }) => svc.enqueue(p.customerId, p.garmentIds, p.choices || [], 'desk'),
    'tryon.retry': (p: { id: string }) => { svc.retry(p.id); return true; },
    'tryon.want': (p: { id: string }) => svc.want(p.id),
    'tryon.byCode': (p: { code: string }) => svc.findByCode(p.code) || null,
    'tryon.visit': (p: { id: string; status: ApVisitStatus; size?: string; note?: string }) => svc.visit(p.id, p.status, p.size, p.note),
    'tryon.export': (p: { ids: string[] }) => {
      const s = store.read();
      const dir = join(outputDir(), i18nT('试穿图'));
      mkdirSync(dir, { recursive: true });
      const out: string[] = [];
      for (const id of p?.ids || []) {
        const t = s.tryons.find((x) => x.id === id);
        if (!t?.image || !existsSync(t.image)) continue;
        const g = s.garments.find((x) => x.id === t.garmentId);
        const dest = join(dir, `${(g?.name || 'tryon').replace(/[\\/:*?"<>|]/g, '_')}-${t.code}${extname(t.image) || '.png'}`);
        copyFileSync(t.image, dest);
        out.push(dest);
      }
      if (!out.length) throw new Error(i18nT('没有可导出的试穿图'));
      return out;
    },

    /** 渲染层画好水印（门店名 + 试穿码）的图，写到导出目录 */
    'tryon.exportData': (p: { items: Array<{ name: string; dataUrl: string }> }) => {
      const dir = join(outputDir(), i18nT('试穿图'));
      mkdirSync(dir, { recursive: true });
      const out: string[] = [];
      for (const it of p?.items || []) {
        const m = /^data:image\/(jpeg|png);base64,(.+)$/.exec(String(it.dataUrl || ''));
        if (!m) continue;
        const dest = join(dir, `${String(it.name || 'tryon').replace(/[\\/:*?"<>|]/g, '_').slice(0, 60)}.${m[1] === 'png' ? 'png' : 'jpg'}`);
        writeFileSync(dest, Buffer.from(m[2], 'base64'));
        out.push(dest);
      }
      if (!out.length) throw new Error(i18nT('没有可导出的试穿图'));
      return out;
    },

    'mobile.start': async () => { const r = await mobile.start(); pushState(); return r; },
    'mobile.stop': async () => { await mobile.stop(); pushState(); return mobile.status(); },
    'mobile.customerLink': (p: { id: string }) => mobile.customerLink(p.id),
    'mobile.rotateKey': () => { store.update((s) => { s.storeKey = newStoreKey(); }); pushState(); return mobile.status(); },

    'settings.patch': (p: { patch: Partial<ApSettings> }) => {
      const r = store.update((s) => {
        const patch = p?.patch || {};
        if (patch.storeName !== undefined) s.settings.storeName = String(patch.storeName).trim().slice(0, 30) || s.settings.storeName;
        if (patch.editModel) s.settings.editModel = patch.editModel;
        if (patch.retentionDays !== undefined) s.settings.retentionDays = Math.min(Math.max(Math.round(Number(patch.retentionDays) || 7), 1), 30);
        if (patch.mobileDailyLimit !== undefined) s.settings.mobileDailyLimit = Math.min(Math.max(Math.round(Number(patch.mobileDailyLimit) || 12), 1), 100);
        if (patch.watermark !== undefined) s.settings.watermark = !!patch.watermark;
        if (Array.isArray(patch.disabledOptions)) s.settings.disabledOptions = [...new Set(patch.disabledOptions.map(String))];
        if (patch.outputDir !== undefined) s.settings.outputDir = String(patch.outputDir || '');
        return s.settings;
      });
      pushState();
      return r;
    },
    'privacy.purgeAll': () => svc.purgeAll(),
    'privacy.purgeExpired': () => svc.purgeExpired(),
  };

  ipcMain.handle(IPC_CHANNELS.WORKBENCH_AP_INVOKE, async (_e, req: { action: string; payload?: unknown }) => {
    const fn = actions[String(req?.action || '')];
    if (!fn) throw new Error(i18nT('未知操作：{p0}', { p0: String(req?.action || '') }));
    try {
      return await fn(req.payload ?? {});
    } catch (error) {
      logger?.warn?.('apparel-store', `${req.action} failed`, { error: (error as Error)?.message });
      throw new Error(userFacingError(error));
    }
  });
}
