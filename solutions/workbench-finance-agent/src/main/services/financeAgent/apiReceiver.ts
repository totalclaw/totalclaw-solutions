/**
 * 数据对接 · 本机 API 接收：外部系统（ERP、费控、自建脚本）把数据 POST 进来。
 *
 *   POST http://127.0.0.1:<port>/finance/import
 *   Authorization: Bearer <token>
 *   { "ledger": "账套名或 id（可省，默认当前账套）", "kind": "journal" | "balances" | "budget", "period": "2026-09", "rows": [...] }
 *
 * 只监听 127.0.0.1，必须带令牌；默认关闭，在「设置」里打开。收到的数据只进本工作台的分析库，
 * 不回写任何正式账套。
 */
import { createServer, type Server } from 'node:http';
import { timingSafeEqual } from 'node:crypto';

export interface ApiImportRequest { ledger?: string; kind: string; period?: string; year?: number; rows: unknown[] }
export type ApiImportHandler = (req: ApiImportRequest) => Promise<{ ok: true; count: number; ledger: string }>;

const MAX_BODY = 20 * 1024 * 1024;

export class FinanceApiReceiver {
  private server: Server | null = null;
  private error = '';
  private port = 0;

  constructor(private readonly handler: ApiImportHandler) {}

  status(): { running: boolean; url?: string; error?: string } {
    return this.server ? { running: true, url: `http://127.0.0.1:${this.port}/finance/import` } : { running: false, error: this.error || undefined };
  }

  async start(port: number, token: string): Promise<void> {
    await this.stop();
    this.error = '';
    const expected = Buffer.from(`Bearer ${token}`);
    const server = createServer((req, res) => {
      const reply = (code: number, body: unknown) => {
        res.writeHead(code, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify(body));
      };
      if (req.method !== 'POST' || !/^\/finance\/import\/?$/.test(req.url || '')) return reply(404, { ok: false, error: 'not_found' });
      const auth = Buffer.from(String(req.headers.authorization || ''));
      if (auth.length !== expected.length || !timingSafeEqual(auth, expected)) return reply(401, { ok: false, error: 'unauthorized' });
      let size = 0;
      const chunks: Buffer[] = [];
      req.on('data', (c: Buffer) => {
        size += c.length;
        if (size > MAX_BODY) { reply(413, { ok: false, error: 'too_large' }); req.destroy(); return; }
        chunks.push(c);
      });
      req.on('end', () => {
        if (size > MAX_BODY) return;
        let body: ApiImportRequest;
        try { body = JSON.parse(Buffer.concat(chunks).toString('utf-8')); } catch { return reply(400, { ok: false, error: 'invalid_json' }); }
        if (!body || !Array.isArray(body.rows) || !body.kind) return reply(400, { ok: false, error: 'kind_and_rows_required' });
        this.handler(body).then((r) => reply(200, r)).catch((e) => reply(422, { ok: false, error: (e as Error)?.message || 'import_failed' }));
      });
    });
    await new Promise<void>((resolve, reject) => {
      server.once('error', (e) => { this.error = (e as Error).message; reject(e); });
      server.listen(port, '127.0.0.1', () => resolve());
    });
    this.server = server;
    this.port = port;
  }

  async stop(): Promise<void> {
    const s = this.server;
    this.server = null;
    if (s) await new Promise<void>((r) => s.close(() => r()));
  }
}
