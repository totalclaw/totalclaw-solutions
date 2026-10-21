/**
 * 服装实体店智能体 · 顾客手机端局域网服务（复用 lanServer 底座，和 AI 学习中心学生端同一套）。
 *
 * 鉴权两层：
 *   - 门店口令 storeKey：放在门店二维码里，换口令旧码即失效；用它换一个顾客会话；
 *   - 顾客会话 token：只看得到自己的照片、试穿图与试穿码，看不到别的顾客与后台数据。
 * 门店口令错误按 IP 限流（10 次/分钟锁 60 秒）。照片 base64 上传，请求体放大到 12MB。
 */
import { randomBytes } from 'node:crypto';
import { existsSync } from 'node:fs';
import { extname } from 'node:path';
import type { Logger } from '@totalclaw/logger';
import { t as i18nT } from '@totalclaw/i18n';
import type { ApMobileStatus } from '@totalclaw/ipc-contracts';
import { LanServer, RateBucket, lanIp, lanIpCandidates, type LanRoute } from '../lanServer';
import { APPAREL_MOBILE_PAGE_HTML } from './mobilePage';
import type { ApparelService } from './service';
import type { StoredCustomer } from './store';
import { publicStyleOptions } from './styleOptions';
import { codeValidToday, sortSizes, tryonsToday } from './logic';

const MIME: Record<string, string> = { '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png', '.webp': 'image/webp', '.heic': 'image/heic', '.bmp': 'image/bmp' };
const mimeOf = (p: string) => MIME[extname(p).toLowerCase()] || 'application/octet-stream';

export class ApparelMobileServer {
  private lan: LanServer<StoredCustomer>;
  private seen = new Map<string, number>();

  constructor(private svc: ApparelService, private logger?: Logger) {
    const keyFails = new RateBucket(10, 60_000);
    this.lan = new LanServer<StoredCustomer>({
      name: 'apparel-store-mobile',
      pageHtml: APPAREL_MOBILE_PAGE_HTML,
      logger,
      defaultPort: 8230,
      maxBodyBytes: 12 * 1024 * 1024,
      auth: (token) => {
        if (!token) return null;
        const c = svc.store.read().customers.find((x) => x.mobileToken === token && !x.purgedAt) || null;
        if (c) this.seen.set(c.id, Date.now());
        return c;
      },
      routes: this.routes(keyFails),
    });
  }

  status(): ApMobileStatus {
    const port = this.lan.port;
    const key = this.svc.store.read().storeKey;
    const cutoff = Date.now() - 10 * 60_000;
    return {
      running: this.lan.running,
      port,
      joinUrl: this.lan.running && port ? `http://${lanIp()}:${port}/?k=${encodeURIComponent(key)}` : null,
      candidates: this.lan.running && port ? lanIpCandidates().slice(1, 4).map((ip) => `http://${ip}:${port}/?k=${encodeURIComponent(key)}`) : [],
      activeSessions: [...this.seen.values()].filter((t) => t > cutoff).length,
    };
  }

  /** 店员在电脑上建档的顾客：给一个直达该顾客的手机链接（扫码即看、可保存） */
  customerLink(customerId: string): string {
    const port = this.lan.port;
    if (!this.lan.running || !port) throw new Error(i18nT('请先在「手机端」开启门店手机服务'));
    const token = this.svc.store.update((s) => {
      const c = s.customers.find((x) => x.id === customerId && !x.purgedAt);
      if (!c) throw new Error(i18nT('顾客不存在或已删除'));
      if (!c.mobileToken) c.mobileToken = randomBytes(18).toString('base64url');
      return c.mobileToken;
    });
    return `http://${lanIp()}:${port}/?k=${encodeURIComponent(this.svc.store.read().storeKey)}&s=${encodeURIComponent(token)}`;
  }

  async start(): Promise<ApMobileStatus> { await this.lan.start(); return this.status(); }
  async stop(): Promise<void> { await this.lan.stop(); }

  private routes(keyFails: RateBucket): LanRoute<StoredCustomer>[] {
    const svc = this.svc;
    const me = (c: StoredCustomer) => {
      const s = svc.store.read();
      const cur = s.customers.find((x) => x.id === c.id) || c;
      return {
        customer: {
          nickname: cur.nickname, hasPhoto: !!cur.photo, photoVersion: cur.photo ? cur.photo.slice(-18) : '',
          photoCheck: cur.photoCheck || null, heightCm: cur.heightCm || null, weightKg: cur.weightKg || null, hasBackground: !!cur.background,
        },
        usedToday: tryonsToday(s.tryons, cur.id),
        tryons: s.tryons.filter((t) => t.customerId === cur.id).map((t) => ({
          id: t.id, garmentId: t.garmentId, status: t.status, error: t.error || '', code: t.code, size: t.size || '', wantVisit: !!t.wantVisit, choice: t.choice,
          codeValid: codeValidToday(t),
        })),
      };
    };
    const fail = (c: { json: (code: number, data: unknown) => void }, e: any) => {
      if (e?.code === 'LIMIT') { c.json(429, { error: 'LIMIT' }); return; }
      if (e?.code === 'PHOTO_BAD' || e?.code === 'PHOTO_CHECKING') { c.json(400, { error: e.code }); return; }
      c.json(400, { error: String(e?.message || e).slice(0, 200) });
    };
    return [
      { method: 'GET', path: '/api/ping', auth: 'none', handler: (c) => c.json(200, { ok: true }) },
      {
        method: 'GET', path: '/api/info', auth: 'none',
        handler: (c) => { const s = svc.store.read().settings; c.json(200, { storeName: s.storeName, retentionDays: s.retentionDays }); },
      },
      {
        method: 'POST', path: '/api/session', auth: 'none',
        handler: async (c) => {
          if (keyFails.locked(c.clientIp)) { c.json(429, { error: 'TOO_MANY' }); return; }
          const body = await c.body();
          if (String(body?.k || '') !== svc.store.read().storeKey) {
            if (keyFails.fail(c.clientIp)) this.logger?.warn?.('apparel-store', 'store key brute-force locked', { ip: c.clientIp });
            c.json(403, { error: 'BAD_KEY' });
            return;
          }
          keyFails.pass(c.clientIp);
          if (body?.consent !== true) { c.json(400, { error: 'CONSENT_REQUIRED' }); return; }
          const token = randomBytes(18).toString('base64url');
          svc.createCustomer({ nickname: String(body?.nickname || ''), source: 'mobile', consent: true, mobileToken: token });
          c.json(200, { token });
        },
      },
      {
        method: 'GET', path: '/api/catalog', auth: 'bearer',
        handler: (c) => {
          const s = svc.store.read();
          const disabled = new Set(s.settings.disabledOptions);
          c.json(200, {
            storeName: s.settings.storeName,
            watermark: s.settings.watermark,
            dailyLimit: s.settings.mobileDailyLimit,
            garments: s.garments.filter((g) => g.onShelf && g.image).map((g) => ({
              id: g.id, name: g.name, price: g.price, category: g.category, audience: g.audience, sizes: sortSizes(Object.keys(g.stock)), recommended: g.recommended || null,
            })),
            options: publicStyleOptions().filter((o) => !disabled.has(o.id)),
            thumbs: Object.keys(svc.thumbs()),
          });
        },
      },
      { method: 'GET', path: '/api/me', auth: 'bearer', handler: (c) => c.json(200, me(c.principal!)) },
      {
        method: 'POST', path: '/api/profile', auth: 'bearer',
        handler: async (c) => {
          const body = await c.body();
          try { svc.updateCustomer(c.principal!.id, { heightCm: body?.heightCm ?? null, weightKg: body?.weightKg ?? null }); c.json(200, me(c.principal!)); } catch (e) { fail(c, e); }
        },
      },
      {
        method: 'POST', path: '/api/photo', auth: 'bearer',
        handler: async (c) => {
          let body: any;
          try { body = await c.body(); } catch { c.json(413, { error: 'TOO_LARGE' }); return; }
          try {
            svc.setImage(c.principal!.id, body?.kind === 'background' ? 'background' : 'photo', { dataUrl: String(body?.dataUrl || '') });
            c.json(200, me(c.principal!));
          } catch (e) { fail(c, e); }
        },
      },
      {
        method: 'POST', path: '/api/tryon', auth: 'bearer',
        handler: async (c) => {
          const body = await c.body();
          try {
            const choice = { ...(body?.choice || {}), customBackground: body?.choice?.customBackground ? 'yes' : undefined };
            svc.enqueue(c.principal!.id, Array.isArray(body?.garmentIds) ? body.garmentIds.map(String) : [], [choice], 'mobile');
            c.json(200, me(c.principal!));
          } catch (e) { fail(c, e); }
        },
      },
      {
        method: 'POST', path: '/api/want', auth: 'bearer',
        handler: async (c) => {
          const body = await c.body();
          try { svc.want(String(body?.tryonId || ''), c.principal!.id); c.json(200, me(c.principal!)); } catch (e) { fail(c, e); }
        },
      },
      {
        method: 'POST', path: '/api/delete-me', auth: 'bearer',
        handler: (c) => { svc.purgeCustomer(c.principal!.id); this.seen.delete(c.principal!.id); c.json(200, { ok: true }); },
      },
      {
        method: 'GET', path: '/img/me', auth: 'query',
        handler: (c) => { const cur = svc.store.read().customers.find((x) => x.id === c.principal!.id); c.serveFile(cur?.photo && existsSync(cur.photo) ? cur.photo : null, mimeOf(cur?.photo || '')); },
      },
      {
        method: 'GET', path: /^\/img\/o\/([\w-]+)$/, auth: 'query',
        handler: (c) => { const f = svc.thumbs()[c.params[0]]; c.serveFile(f || null, 'image/jpeg'); },
      },
      {
        // 试穿码二维码：店员可以用扫码枪直接扫顾客手机屏幕
        method: 'GET', path: /^\/img\/code\/([\w-]+)$/, auth: 'query',
        handler: async (c) => {
          const t = svc.store.read().tryons.find((x) => x.id === c.params[0] && x.customerId === c.principal!.id && x.wantVisit);
          if (!t) { c.json(404, { error: 'NOT_FOUND' }); return; }
          const QRCode = (await import('qrcode')).default;
          const png = await QRCode.toBuffer(t.code, { margin: 1, width: 240 });
          c.res.writeHead(200, { 'Content-Type': 'image/png', 'Cache-Control': 'no-store', 'Content-Length': String(png.length) });
          c.res.end(png);
        },
      },
      {
        method: 'GET', path: /^\/img\/g\/([\w-]+)$/, auth: 'query',
        handler: (c) => { const g = svc.store.garment(c.params[0]); c.serveFile(g?.onShelf && g.image && existsSync(g.image) ? g.image : null, mimeOf(g?.image || '')); },
      },
      {
        method: 'GET', path: /^\/img\/t\/([\w-]+)$/, auth: 'query',
        handler: (c) => {
          const t = svc.store.read().tryons.find((x) => x.id === c.params[0] && x.customerId === c.principal!.id);
          c.serveFile(t?.image && existsSync(t.image) ? t.image : null, mimeOf(t?.image || ''));
        },
      },
    ];
  }
}
