/**
 * 学生手机端局域网服务（复用 lanServer 底座）。
 *
 * 鉴权两层：校园口令（在二维码里，换口令旧码失效）→ 换一个匿名会话令牌；
 * 会话只能提问、看自己问过的问题和部门答复，看不到别人的记录与后台数据。
 * 口令错误按 IP 限流（10 次锁 60 秒）；每个会话每天提问次数有上限。
 */
import { randomBytes } from 'node:crypto';
import { existsSync } from 'node:fs';
import { extname } from 'node:path';
import type { Logger } from '@totalclaw/logger';
import type { CaMobileStatus } from '@totalclaw/ipc-contracts';
import { LanServer, RateBucket, lanIp, type LanRoute } from '../lanServer';
import { CAMPUS_MOBILE_PAGE_HTML } from './mobilePage';
import type { CampusAiService } from './service';
import { newId, type CaMobileSession } from './store';

const today = (): string => new Date().toISOString().slice(0, 10);

export class CampusMobileServer {
  private lan: LanServer<CaMobileSession>;

  constructor(private svc: CampusAiService, private logger?: Logger) {
    const keyFails = new RateBucket(10, 60_000);
    this.lan = new LanServer<CaMobileSession>({
      name: 'campus-ai-mobile',
      pageHtml: CAMPUS_MOBILE_PAGE_HTML,
      logger,
      defaultPort: 8250,
      auth: (token) => (token ? svc.store.read().sessions.find((x) => x.token === token) || null : null),
      routes: this.routes(keyFails),
    });
  }

  status(): CaMobileStatus {
    const port = this.lan.port;
    const key = this.svc.store.read().campusKey;
    const url = this.lan.url;
    return { running: this.lan.running, port, url, joinUrl: url ? `${url}/?k=${encodeURIComponent(key)}` : null };
  }

  async start(): Promise<CaMobileStatus> { await this.lan.start(); return this.status(); }
  async stop(): Promise<void> { await this.lan.stop(); }

  private routes(keyFails: RateBucket): LanRoute<CaMobileSession>[] {
    const svc = this.svc;
    return [
      { method: 'GET', path: '/api/ping', auth: 'none', handler: (c) => c.json(200, { ok: true }) },
      {
        // 校徽是学校公开信息，扫码页面头显示用
        method: 'GET', path: '/logo', auth: 'none',
        handler: (c) => {
          const p = svc.store.read().settings.profile.logoPath;
          const mime = ({ '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.svg': 'image/svg+xml', '.gif': 'image/gif' } as Record<string, string>)[extname(p).toLowerCase()];
          c.serveFile(p && mime && existsSync(p) ? p : null, mime || 'application/octet-stream');
        },
      },
      {
        method: 'GET', path: '/api/info', auth: 'none',
        handler: (c) => {
          const s = svc.store.read();
          const examples = s.faqs.slice().sort((a, b) => b.hits - a.hits).slice(0, 4).map((f) => f.question);
          const pr = s.settings.profile;
          const courses = s.courses.filter((x) => x.publicTutor && s.docs.some((d) => d.courseId === x.id && d.status === 'built')).map((x) => ({ id: x.id, name: x.name }));
          c.json(200, { schoolName: s.settings.schoolName, englishName: pr.englishName, motto: pr.motto, hasLogo: !!pr.logoPath && existsSync(pr.logoPath), retentionDays: s.settings.retentionDays, examples, courses });
        },
      },
      {
        method: 'POST', path: '/api/session', auth: 'none',
        handler: async (c) => {
          if (keyFails.locked(c.clientIp)) { c.json(429, { error: 'TOO_MANY' }); return; }
          const body = await c.body();
          if (String(body?.k || '') !== svc.store.read().campusKey) {
            if (keyFails.fail(c.clientIp)) this.logger?.warn?.('campus-ai', 'campus key brute-force locked', { ip: c.clientIp });
            c.json(403, { error: 'BAD_KEY' });
            return;
          }
          keyFails.pass(c.clientIp);
          const sess: CaMobileSession = { id: newId('cas'), token: randomBytes(18).toString('base64url'), createdAt: new Date().toISOString(), day: today(), count: 0 };
          svc.store.update((s) => { s.sessions.push(sess); });
          c.json(200, { token: sess.token });
        },
      },
      { method: 'GET', path: '/api/me', auth: 'bearer', handler: (c) => c.json(200, { ok: true }) },
      {
        method: 'POST', path: '/api/ask', auth: 'bearer',
        handler: async (c) => {
          const me = c.principal!;
          const body = await c.body();
          const limit = svc.store.read().settings.mobileDailyLimit;
          const allowed = svc.store.update((s) => {
            const x = s.sessions.find((y) => y.id === me.id);
            if (!x) return false;
            if (x.day !== today()) { x.day = today(); x.count = 0; }
            if (x.count >= limit) return false;
            x.count++;
            return true;
          });
          if (!allowed) { c.json(429, { error: 'LIMIT' }); return; }
          try {
            const courseId = String(body?.courseId || '');
            // 只认开放了手机助教的课程
            const open = courseId && svc.store.read().courses.some((x) => x.id === courseId && x.publicTutor);
            const r = await svc.ask(String(body?.question || ''), 'mobile', me.id, open ? courseId : undefined);
            c.json(200, r);
          } catch (e) {
            c.json(400, { error: String((e as Error)?.message || e).slice(0, 200) });
          }
        },
      },
      { method: 'GET', path: '/api/mine', auth: 'bearer', handler: (c) => c.json(200, { items: svc.mine(c.principal!.id) }) },
      {
        method: 'POST', path: '/api/feedback', auth: 'bearer',
        handler: async (c) => {
          const body = await c.body();
          const v = body?.value === 'up' || body?.value === 'down' ? body.value : null;
          try { svc.feedback(String(body?.qaId || ''), v, c.principal!.id); c.json(200, { ok: true }); } catch { c.json(404, { error: 'NOT_FOUND' }); }
        },
      },
    ];
  }

  /** 换口令：旧二维码和旧会话一起作废 */
  rotateKey(newKey: string): void {
    this.svc.store.update((s) => { s.campusKey = newKey; s.sessions = []; });
  }

  get ip(): string { return lanIp(); }
}
