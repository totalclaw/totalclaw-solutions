/**
 * S1 指挥大屏服务：主控在方案里点「启动 Web」后，在局域网起一个网页服务，会场任意电脑 / 电视 / 平板浏览器
 * 输入地址（或扫码）即可打开，不用装客户端。主控本机全屏打开的也是同一个页面。
 *
 *   GET  /                 大屏页面
 *   GET  /remote           手机竖屏简版（下令 + 待确认）
 *   GET  /api/state        快照
 *   GET  /api/events       SSE：先推一次快照，之后每条事件推 ev、状态变化节流推 state；15 秒心跳
 *   POST /api/command      下令 {text}
 *   POST /api/confirm      老板确认 / 驳回 {taskId, approve, comment}
 *   POST /api/company      改公司信息（大屏上点公司名）
 *
 * 鉴权：启动时生成随机口令，所有路径都要带（?t= 或请求头 X-Screen-Token）——只看大屏也要，避免同网段陌生人看到。
 * 端口默认 8240，被占顺延（最多 20 个）；绑定 0.0.0.0。只在用户点「启动」后监听，关闭 / 停用方案时 stop()。
 */
const http = require('node:http');
const os = require('node:os');
const { randomBytes, timingSafeEqual } = require('node:crypto');
const { readFileSync } = require('node:fs');

const DEFAULT_PORT = 8240;
const MAX_BODY = 16 * 1024;
const HEARTBEAT_MS = 15_000;
const STATE_THROTTLE_MS = 250;

function lanAddresses() {
  const out = [];
  for (const [name, list] of Object.entries(os.networkInterfaces())) {
    for (const a of list || []) {
      if (a.family !== 'IPv4' && a.family !== 4) continue;
      if (a.internal) continue;
      if (/^169\.254\./.test(a.address)) continue;
      out.push({ name, address: a.address });
    }
  }
  // 常见内网段在前（192.168 > 10 > 172）
  const rank = (ip) => (ip.startsWith('192.168.') ? 0 : ip.startsWith('10.') ? 1 : ip.startsWith('172.') ? 2 : 3);
  return out.sort((a, b) => rank(a.address) - rank(b.address));
}

function safeEqual(a, b) {
  const x = Buffer.from(String(a || ''));
  const y = Buffer.from(String(b || ''));
  return x.length === y.length && timingSafeEqual(x, y);
}

class ScreenServer {
  /**
   * @param {object} o
   * @param {() => object} o.getState              快照
   * @param {import('./bus.cjs').LegionBus} o.bus
   * @param {(body:object) => object} o.onCommand
   * @param {(body:object) => object} o.onConfirm
   * @param {(body:object) => object} o.onCompany
   * @param {() => {page:string, remote:string}} o.pages   页面 HTML
   */
  constructor(o) {
    Object.assign(this, o);
    this.server = null;
    this.port = null;
    this.token = null;
    this.clients = new Set();
    this.stateTimer = null;
    this.heartbeat = null;
    this.onBusEvent = (ev) => this.broadcast(ev);
  }

  status() {
    const running = !!this.server && this.server.listening;
    const addrs = running ? lanAddresses() : [];
    const url = (host, path = '/') => `http://${host}:${this.port}${path}?t=${this.token}`;
    return {
      running,
      port: running ? this.port : null,
      token: running ? this.token : null,
      viewers: this.clients.size,
      localUrl: running ? url('127.0.0.1') : null,
      urls: addrs.map((a) => ({ name: a.name, address: a.address, url: url(a.address), remote: url(a.address, '/remote') })),
    };
  }

  async start({ port = DEFAULT_PORT, host = '0.0.0.0' } = {}) {
    if (this.server && this.server.listening) return this.status();
    this.token = this.token || randomBytes(12).toString('hex');
    let lastErr;
    for (let p = port; p < port + 20; p++) {
      try {
        await this.listen(p, host);
        this.port = p;
        this.bus.on('event', this.onBusEvent);
        this.heartbeat = setInterval(() => this.writeAll(': ping\n\n'), HEARTBEAT_MS);
        if (this.heartbeat.unref) this.heartbeat.unref();
        return this.status();
      } catch (e) {
        lastErr = e;
        if (e.code !== 'EADDRINUSE' && e.code !== 'EACCES') break;
      }
    }
    throw new Error(`大屏服务启动失败：${lastErr ? lastErr.message : '没有可用端口'}`);
  }

  listen(port, host) {
    return new Promise((resolve, reject) => {
      const server = http.createServer((req, res) => this.handle(req, res));
      server.keepAliveTimeout = 5000;
      const onErr = (e) => {
        server.close();
        reject(e);
      };
      server.once('error', onErr);
      server.listen(port, host, () => {
        server.off('error', onErr);
        this.server = server;
        resolve();
      });
    });
  }

  async stop() {
    this.bus.off('event', this.onBusEvent);
    if (this.heartbeat) clearInterval(this.heartbeat);
    if (this.stateTimer) clearTimeout(this.stateTimer);
    this.heartbeat = null;
    this.stateTimer = null;
    for (const c of this.clients) {
      try {
        c.end();
      } catch {
        /* */
      }
    }
    this.clients.clear();
    const s = this.server;
    this.server = null;
    if (s) await new Promise((r) => s.close(() => r()));
    return this.status();
  }

  /** 换口令：已打开的页面全部断开，需用新地址重开 */
  rotateToken() {
    this.token = randomBytes(12).toString('hex');
    for (const c of this.clients) {
      try {
        c.end();
      } catch {
        /* */
      }
    }
    this.clients.clear();
    return this.status();
  }

  authorized(req, url) {
    const t = url.searchParams.get('t') || req.headers['x-screen-token'];
    return !!this.token && safeEqual(t, this.token);
  }

  send(res, code, body, type = 'application/json; charset=utf-8') {
    const data = typeof body === 'string' ? body : JSON.stringify(body);
    res.writeHead(code, {
      'Content-Type': type,
      'Cache-Control': 'no-store',
      'X-Content-Type-Options': 'nosniff',
      'Referrer-Policy': 'no-referrer',
      ...(type.startsWith('text/html') ? { 'Content-Security-Policy': "default-src 'none'; script-src 'unsafe-inline'; style-src 'unsafe-inline'; img-src data:; connect-src 'self'" } : {}),
    });
    res.end(data);
  }

  readBody(req) {
    return new Promise((resolve, reject) => {
      let size = 0;
      const chunks = [];
      req.on('data', (c) => {
        size += c.length;
        if (size > MAX_BODY) {
          reject(Object.assign(new Error('请求太大'), { status: 413 }));
          req.destroy();
          return;
        }
        chunks.push(c);
      });
      req.on('end', () => {
        try {
          resolve(chunks.length ? JSON.parse(Buffer.concat(chunks).toString('utf8')) : {});
        } catch {
          reject(Object.assign(new Error('请求不是 JSON'), { status: 400 }));
        }
      });
      req.on('error', reject);
    });
  }

  async handle(req, res) {
    let url;
    try {
      url = new URL(req.url, 'http://x');
    } catch {
      return this.send(res, 400, { error: 'bad url' });
    }
    if (!this.authorized(req, url)) {
      if (url.pathname === '/' || url.pathname === '/remote') {
        return this.send(res, 401, '<!doctype html><meta charset="utf-8"><title>需要访问口令</title><body style="background:#050B1C;color:#94A3B8;font-family:sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;margin:0"><p>需要访问口令：请在主控「AI 公司运营中心 → 指挥大屏」复制带口令的完整地址。</p>', 'text/html; charset=utf-8');
      }
      return this.send(res, 401, { error: 'UNAUTHORIZED' });
    }
    try {
      if (req.method === 'GET' && url.pathname === '/') return this.send(res, 200, this.pages().page, 'text/html; charset=utf-8');
      if (req.method === 'GET' && url.pathname === '/remote') return this.send(res, 200, this.pages().remote, 'text/html; charset=utf-8');
      if (req.method === 'GET' && url.pathname === '/api/state') return this.send(res, 200, this.getState());
      if (req.method === 'GET' && url.pathname === '/api/coverage') return this.send(res, 200, this.getCoverage ? this.getCoverage() : { items: [] });
      if (req.method === 'GET' && url.pathname === '/api/events') return this.openStream(req, res);
      if (req.method === 'POST' && url.pathname === '/api/command') return this.send(res, 200, await this.onCommand(await this.readBody(req)));
      if (req.method === 'POST' && url.pathname === '/api/confirm') return this.send(res, 200, await this.onConfirm(await this.readBody(req)));
      if (req.method === 'POST' && url.pathname === '/api/company') return this.send(res, 200, await this.onCompany(await this.readBody(req)));
      return this.send(res, 404, { error: 'NOT_FOUND' });
    } catch (e) {
      return this.send(res, e.status || 400, { error: String(e.message || e) });
    }
  }

  openStream(req, res) {
    res.writeHead(200, {
      'Content-Type': 'text/event-stream; charset=utf-8',
      'Cache-Control': 'no-store',
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no',
    });
    res.write('retry: 2000\n\n');
    res.write(`event: state\ndata: ${JSON.stringify(this.getState())}\n\n`);
    this.clients.add(res);
    const drop = () => this.clients.delete(res);
    req.on('close', drop);
    res.on('error', drop);
  }

  writeAll(chunk) {
    for (const c of this.clients) {
      try {
        c.write(chunk);
      } catch {
        this.clients.delete(c);
      }
    }
  }

  broadcast(ev) {
    if (!this.clients.size) return;
    this.writeAll(`event: ev\ndata: ${JSON.stringify(ev)}\n\n`);
    if (this.stateTimer) return;
    this.stateTimer = setTimeout(() => {
      this.stateTimer = null;
      this.writeAll(`event: state\ndata: ${JSON.stringify(this.getState())}\n\n`);
    }, STATE_THROTTLE_MS);
  }
}

/** 读页面文件（每次请求读一次：开发时改页面刷新即生效，文件很小） */
function filePages(pagePath, remotePath) {
  return () => ({ page: readFileSync(pagePath, 'utf8'), remote: readFileSync(remotePath, 'utf8') });
}

module.exports = { ScreenServer, lanAddresses, filePages, DEFAULT_PORT };
