/**
 * 会议智能管理 · 手机页服务（企微卡片 / 群链接点开的 H5 + 声纹采集页），复用 lanServer 底座。
 *
 * 鉴权：每人一个令牌（A 模块发放，存在 state 里，可重置），URL 带 `?t=` 或请求头 `Authorization: Bearer`，
 * 等同企微免登。令牌 → 人员 id 由调用方的 personByToken 决定；无效令牌：页面回 401「链接已失效」，接口回 401 JSON。
 * 无效令牌按 IP 限流（30 次 / 分钟锁 60 秒）。
 *
 * 路由：
 *   GET  /、/index.html        手机页（LanServer 直出；令牌由页面自己带上去校验）
 *   GET  /m                     手机页（服务端先校验令牌，无效直接回 401 失效页）
 *   GET  /v                     声纹采集页（同上）
 *   GET  /g                     群链接入口（不带令牌；本机记着令牌就跳到 /m 或 ?p=v 跳 /v，没有就提示先打开一次专属链接）
 *   GET  /api/ping、/api/meta   探活 / 上传上限（公开）
 *   POST /api/invoke            {action, payload} → dispatch(personId, action, payload) → { ok, data } / { ok:false, error }
 *   POST /api/upload            原始文件流（?name= 文件名）落到 uploadDir/<人员目录>/，默认上限 2GB → { ok, data:{ path, name, size } }
 *   GET  /api/clip              ?meetingId&label：发言人试听片段（dispatch 'meeting.speaker.clip' → dataUrl，支持 Range）
 *
 * 手机端安全边界（主进程里 A 还会做按角色的权限校验，这里是第一道）：
 *   - 只放行手机端用得到的动作（MM_MOBILE_ACTIONS）：切 PC 身份、弹 PC 文件框、企微 / 系统设置、开关手机服务、
 *     取别人的专属链接、演示数据这些一律 403；
 *   - meeting.upload / voiceprint.enroll 的路径只认「本人刚通过 /api/upload 传上来的文件」，不能借手机让主进程去读本机任意文件；
 *   - voiceprint.enroll / voiceprint.delete 一律以令牌本人为准（不能替别人采 / 删声纹）；
 *   - 声纹录音提取完特征即删（不论成败）；会议上传的临时文件由 A 拷进数据目录，这里 24 小时后清理。
 */
import { createHash, randomBytes } from 'node:crypto';
import { createWriteStream, existsSync, mkdirSync, readdirSync, statSync, unlinkSync } from 'node:fs';
import type { IncomingMessage, ServerResponse } from 'node:http';
import { basename, extname, isAbsolute, join, relative, resolve } from 'node:path';
import { gzipSync } from 'node:zlib';
import type { MmLink } from '../../../../shared/meetingMgmt/types';
import { LanServer, RateBucket, type LanCtx, type LanRoute } from '../../lanServer';
import { MEETING_GROUP_ENTRY_HTML, MEETING_MOBILE_APP_HTML, MEETING_MOBILE_EXPIRED_CLEAR_HTML, MEETING_MOBILE_EXPIRED_HTML, MEETING_VOICE_PAGE_HTML } from './pages';

export const MM_MOBILE_DEFAULT_PORT = 8280;
export const MM_MOBILE_MAX_UPLOAD_BYTES = 2 * 1024 * 1024 * 1024;
/** /api/invoke 的 JSON 体上限：纪要逐段改、总结报告整篇保存都走它 */
const JSON_BODY_LIMIT = 2 * 1024 * 1024;
const UPLOAD_TTL_MS = 24 * 3600_000;
const SWEEP_INTERVAL_MS = 3600_000;
const CLIP_CACHE_TTL_MS = 60_000;
const CLIP_CACHE_MAX = 16;
const UPLOAD_DIR_RE = /^p-[0-9a-f]{12}$/;
const UPLOAD_FILE_RE = /^\d{8}-\d{6}-[0-9a-f]{6}-/;

/**
 * 手机端放行的动作（文档 3.2）。不在这里的一律 403：
 * identity.set（切 PC 当前身份）、meeting.pickFiles（在电脑上弹选择框）、org.sync、settings.save、wecom.*、
 * voiceprint.link / voiceprint.send（群发）、mobile.*（mobile.link 能拿到别人的专属链接）、demo.*。
 */
export const MM_MOBILE_ACTIONS: ReadonlySet<string> = new Set([
  'boot', 'people.list', 'home.get', 'notice.list', 'notice.read',
  'project.list', 'project.get', 'project.create', 'project.members', 'project.close',
  'project.summary.regenerate', 'project.summary.save', 'project.summary.approve', 'project.report.generate',
  'meeting.list', 'meeting.get', 'meeting.create', 'meeting.upload', 'meeting.retry',
  'meeting.speaker.assign', 'meeting.speaker.clip', 'meeting.segment.audio', 'meeting.segment.edit', 'meeting.segment.speaker', 'meeting.confirm',
  'meeting.review.return', 'meeting.review.approve', 'meeting.decide',
  'meeting.plan.owner', 'meeting.plan.save', 'meeting.plan.confirm',
  'task.list', 'task.get', 'task.accept', 'task.progress', 'task.complete',
  'task.objection.raise', 'task.objection.review', 'task.objection.reply', 'task.objection.arbitrate',
  'voiceprint.list', 'voiceprint.enroll', 'voiceprint.autoLearn.set', 'voiceprint.delete',
]);

export interface MeetingMobileServerOptions {
  /** 端口从这里开始顺序探测（默认 8280） */
  port?: number;
  /** 外网 https 地址（设置里的卡片地址）：内网 http 页面录不了音时，引导到这个地址的同一页 */
  publicBase?: () => string | undefined;
  /** 工作台数据目录：dispatch 返回片段文件路径时，只服务这个目录里的文件 */
  dataDir: string;
  dispatch: (personId: string, action: string, payload: unknown) => Promise<unknown>;
  /** 令牌 → 人员 id；null = 无效 */
  personByToken: (token: string) => string | null;
  /** 手机上传文件的落盘目录（只放本服务写的临时文件；按人分子目录，24 小时后清理） */
  uploadDir: string;
  /** 单个上传文件上限，默认 2GB */
  maxUploadBytes?: number;
  log?: (msg: string, meta?: unknown) => void;
}

export interface MeetingMobileServerHandle {
  /** 局域网基础地址 http://<内网IP>:<端口>（不带路径） */
  url: string;
  port: number;
  stop: () => Promise<void>;
}

// ─── 链接（给 A / notifier 拼企微卡片地址用）────────────────────────────

/** MmLink → 手机页 hash 路由；与页面脚本（appScript.ts 的 linkHash）一一对应 */
export function mobileHashFor(link?: MmLink | null): string {
  if (!link) return '#/home';
  const id = encodeURIComponent(link.id || '');
  switch (link.kind) {
    case 'meeting': return `#/meeting/${id}${link.anchor ? `?anchor=${encodeURIComponent(link.anchor)}` : ''}`;
    case 'meeting_plan': return `#/plan/${id}`;
    case 'task': return `#/task/${id}`;
    case 'project': return `#/project/${id}`;
    case 'project_summary': return `#/summary/${id}`;
    // 报告链接：id = 项目 id，anchor = 报告 id
    case 'report': return `#/report/${id}${link.anchor ? `/${encodeURIComponent(link.anchor)}` : ''}`;
    default: return '#/home';
  }
}

/**
 * 这个地址是不是只有内网能打开：私有 IPv4（10 / 172.16–31 / 192.168 / 169.254 / 100.64–127 运营商级 NAT）、
 * 本机、.local / .lan 之类的局域网域名、IPv6 内网段、单段主机名。手机页服务默认给的就是这种地址，
 * 手机得连公司 Wi-Fi（和这台电脑同一个网络）才能打开，用 4G 或在公司外面打不开。
 */
export function isLanOnlyUrl(url: string): boolean {
  let host = '';
  try { host = new URL(url).hostname.toLowerCase().replace(/^\[|\]$/g, ''); } catch { return false; }
  if (!host) return false;
  if (host === 'localhost' || /\.(local|lan|home|internal|intranet|corp|home\.arpa)$/.test(host)) return true;
  const v4 = /^(\d{1,3})\.(\d{1,3})\.\d{1,3}\.\d{1,3}$/.exec(host);
  if (v4) {
    const a = Number(v4[1]); const b = Number(v4[2]);
    return a === 10 || a === 127 || (a === 172 && b >= 16 && b <= 31) || (a === 192 && b === 168) || (a === 169 && b === 254) || (a === 100 && b >= 64 && b <= 127);
  }
  if (host.includes(':')) return host === '::1' || /^f[cd]/.test(host) || /^fe[89ab]/.test(host);
  return !host.includes('.');
}

/** 发在群里的链接（不带令牌）：`<base>/g#/...`，声纹采集页 `<base>/g?p=v` */
export function buildGroupUrl(baseUrl: string, link?: MmLink | null, page?: 'voiceprint'): string {
  const base = baseUrl.replace(/\/+$/, '');
  return page === 'voiceprint' ? `${base}/g?p=v` : `${base}/g${mobileHashFor(link)}`;
}

/** 某人的手机页链接：`<base>/m?t=<令牌>#/...` */
export function buildMobileUrl(baseUrl: string, token: string, link?: MmLink | null): string {
  return `${baseUrl.replace(/\/+$/, '')}/m?t=${encodeURIComponent(token)}${mobileHashFor(link)}`;
}

/** 某人的声纹采集链接：`<base>/v?t=<令牌>` */
export function buildVoiceprintUrl(baseUrl: string, token: string): string {
  return `${baseUrl.replace(/\/+$/, '')}/v?t=${encodeURIComponent(token)}`;
}

// ─── 小工具 ───────────────────────────────────────────────────────────

/** p 是否在 root 里面（不含 root 本身；防 ../ 穿越） */
export function isInside(root: string, p: string): boolean {
  const rel = relative(resolve(root), resolve(p));
  return !!rel && !rel.startsWith('..') && !isAbsolute(rel);
}

/** 上传文件名清洗：只留文件名本身，去掉路径与控制字符，限长 80（保留扩展名） */
export function safeUploadName(raw: string): string {
  let n = basename(String(raw || '').replace(/\\/g, '/'));
  n = Array.from(n).map((ch) => {
    const code = ch.charCodeAt(0);
    return code < 32 || code === 127 || '<>:"/\\|?*'.includes(ch) ? '_' : ch;
  }).join('').replace(/\s+/g, ' ').trim().replace(/^\.+/, '');
  if (!n) n = 'upload.bin';
  if (n.length > 80) {
    const ext = extname(n).slice(0, 12);
    n = n.slice(0, 80 - ext.length) + ext;
  }
  return n;
}

function personKey(personId: string): string {
  return `p-${createHash('sha1').update(String(personId)).digest('hex').slice(0, 12)}`;
}

function stamp(d: Date): string {
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}-${p(d.getHours())}${p(d.getMinutes())}${p(d.getSeconds())}`;
}

function safeUnlink(p: string): void {
  try { unlinkSync(p); } catch { /* 已经不在了 */ }
}

/** 清理 uploadDir 里本服务写的、超过 ttl 的临时文件（只认自己的目录 / 文件命名，别的文件一概不碰） */
export function sweepUploads(root: string, now = Date.now(), ttlMs = UPLOAD_TTL_MS): number {
  let removed = 0;
  let dirs: string[] = [];
  try { dirs = readdirSync(root); } catch { return 0; }
  for (const d of dirs) {
    if (!UPLOAD_DIR_RE.test(d)) continue;
    const dir = join(root, d);
    let files: string[] = [];
    try { files = readdirSync(dir); } catch { continue; }
    for (const f of files) {
      if (!UPLOAD_FILE_RE.test(f)) continue;
      const p = join(dir, f);
      try {
        const st = statSync(p);
        if (st.isFile() && now - st.mtimeMs > ttlMs) { unlinkSync(p); removed++; }
      } catch { /* 并发删除 / 权限：跳过 */ }
    }
  }
  return removed;
}

function tokenOf(req: IncomingMessage): string {
  const h = String(req.headers.authorization || '');
  if (h.startsWith('Bearer ')) return h.slice(7).trim();
  try { return new URL(req.url || '/', 'http://x').searchParams.get('t') || ''; } catch { return ''; }
}

function queryOf(req: IncomingMessage): URLSearchParams {
  try { return new URL(req.url || '/', 'http://x').searchParams; } catch { return new URLSearchParams(); }
}

function errMsg(e: unknown): string {
  const m = e instanceof Error ? e.message : String(e ?? '');
  return (m || 'INTERNAL').slice(0, 500);
}

function sendJson(res: ServerResponse, code: number, data: unknown, close = false): void {
  if (res.headersSent) { try { res.end(); } catch { /* */ } return; }
  const body = JSON.stringify(data);
  res.writeHead(code, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
    'X-Content-Type-Options': 'nosniff',
    ...(close ? { Connection: 'close' } : {}),
  });
  res.end(body);
}

/**
 * 回完错误后，请求体还没收完的（大文件被拒）：先丢弃剩余数据，响应发完 1 秒后断开连接，
 * 别让一个被拒的 2GB 上传把连接一直占着。
 */
function closeSoon(req: IncomingMessage, res: ServerResponse): void {
  if (req.complete) return;
  try { req.resume(); } catch { /* */ }
  const kill = () => { const t = setTimeout(() => { try { req.socket?.destroy(); } catch { /* */ } }, 1000); t.unref?.(); };
  if (res.writableFinished) kill(); else res.once('finish', kill);
}

const CSP = [
  "default-src 'self'", "script-src 'unsafe-inline'", "style-src 'unsafe-inline'",
  "img-src 'self' data: blob:", "media-src 'self' blob: data:", "connect-src 'self'",
  "base-uri 'none'", "form-action 'none'", "frame-ancestors 'none'",
].join('; ');

interface PreparedPage { html: string; gz: Buffer; etag: string }
function prepare(html: string): PreparedPage {
  return { html, gz: gzipSync(Buffer.from(html, 'utf-8')), etag: `"${createHash('sha1').update(html).digest('hex').slice(0, 16)}"` };
}

function sendPage(req: IncomingMessage, res: ServerResponse, page: PreparedPage, status = 200): void {
  const headers: Record<string, string> = {
    'Content-Type': 'text/html; charset=utf-8',
    'Cache-Control': status === 200 ? 'no-cache' : 'no-store',
    'X-Content-Type-Options': 'nosniff',
    'Referrer-Policy': 'no-referrer',
    'Content-Security-Policy': CSP,
    Vary: 'Accept-Encoding',
  };
  if (status === 200) {
    headers.ETag = page.etag;
    if (req.headers['if-none-match'] === page.etag) { res.writeHead(304, { ETag: page.etag }); res.end(); return; }
  }
  const gz = String(req.headers['accept-encoding'] || '').includes('gzip');
  if (gz) headers['Content-Encoding'] = 'gzip';
  res.writeHead(status, headers);
  res.end(gz ? page.gz : page.html);
}

interface DecodedClip { buf?: Buffer; mime?: string; path?: string }
/** dispatch('meeting.speaker.clip') 的返回 → 音频：{ dataUrl } 优先，也认 { path } / { clipPath } / 直接给 data URL 字符串 */
export function decodeClip(r: unknown): DecodedClip | null {
  const fromDataUrl = (s: string): DecodedClip | null => {
    if (!s.startsWith('data:')) return null;
    const comma = s.indexOf(',');
    if (comma < 0) return null;
    const meta = s.slice(5, comma);
    const body = s.slice(comma + 1);
    const isB64 = /;base64$/i.test(meta) || /;base64;/i.test(meta);
    const mime = meta.split(';')[0] || 'audio/wav';
    const buf = isB64 ? Buffer.from(body, 'base64') : Buffer.from(decodeURIComponent(body), 'utf-8');
    return buf.length ? { buf, mime } : null;
  };
  if (typeof r === 'string') return fromDataUrl(r);
  if (!r || typeof r !== 'object') return null;
  const o = r as Record<string, unknown>;
  if (typeof o.dataUrl === 'string' && o.dataUrl) return fromDataUrl(o.dataUrl);
  const p = typeof o.path === 'string' ? o.path : typeof o.clipPath === 'string' ? o.clipPath : '';
  return p ? { path: p } : null;
}

function sendBuffer(req: IncomingMessage, res: ServerResponse, buf: Buffer, mime: string): void {
  const total = buf.length;
  const range = req.headers.range;
  const m = range ? /bytes=(\d*)-(\d*)/.exec(range) : null;
  const base = { 'Content-Type': mime, 'Accept-Ranges': 'bytes', 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' };
  if (m && (m[1] || m[2])) {
    let start: number;
    let end: number;
    if (!m[1]) { start = Math.max(0, total - parseInt(m[2], 10)); end = total - 1; } // 后缀范围 bytes=-N
    else { start = parseInt(m[1], 10); end = m[2] ? parseInt(m[2], 10) : total - 1; }
    if (!Number.isFinite(end) || end >= total) end = total - 1;
    if (!Number.isFinite(start) || start < 0 || start > end) { res.writeHead(416, { 'Content-Range': `bytes */${total}` }); res.end(); return; }
    res.writeHead(206, { ...base, 'Content-Range': `bytes ${start}-${end}/${total}`, 'Content-Length': String(end - start + 1) });
    res.end(buf.subarray(start, end + 1));
    return;
  }
  res.writeHead(200, { ...base, 'Content-Length': String(total) });
  res.end(buf);
}

const AUDIO_MIME: Record<string, string> = {
  '.wav': 'audio/wav', '.mp3': 'audio/mpeg', '.m4a': 'audio/mp4', '.aac': 'audio/aac', '.ogg': 'audio/ogg', '.opus': 'audio/ogg', '.webm': 'audio/webm', '.flac': 'audio/flac',
};

// ─── 服务 ─────────────────────────────────────────────────────────────

export async function startMeetingMobileServer(o: MeetingMobileServerOptions): Promise<MeetingMobileServerHandle> {
  const maxUpload = o.maxUploadBytes && o.maxUploadBytes > 0 ? o.maxUploadBytes : MM_MOBILE_MAX_UPLOAD_BYTES;
  const uploadRoot = resolve(o.uploadDir);
  const dataRoot = resolve(o.dataDir);
  const badTokens = new RateBucket(30, 60_000);
  const appPage = prepare(MEETING_MOBILE_APP_HTML);
  const voicePage = prepare(MEETING_VOICE_PAGE_HTML);
  const expiredPage = prepare(MEETING_MOBILE_EXPIRED_HTML);
  const expiredClearPage = prepare(MEETING_MOBILE_EXPIRED_CLEAR_HTML);
  const groupPage = prepare(MEETING_GROUP_ENTRY_HTML);
  const clipCache = new Map<string, { at: number; buf: Buffer; mime: string }>();
  const log = (msg: string, meta?: unknown) => { try { o.log?.(msg, meta); } catch { /* 日志失败不影响请求 */ } };

  const personDir = (personId: string) => join(uploadRoot, personKey(personId));
  /** 只认本人通过 /api/upload 传上来、还在的文件 */
  const ownsUpload = (personId: string, p: unknown): p is string => {
    if (typeof p !== 'string' || !p) return false;
    const abs = resolve(p);
    if (!isInside(personDir(personId), abs) || !UPLOAD_FILE_RE.test(basename(abs))) return false;
    try { return statSync(abs).isFile(); } catch { return false; }
  };

  /** 令牌 → 人员；失败已回 401 / 429（页面路由回失效页） */
  const authPerson = (c: LanCtx<string>, page?: PreparedPage): string | null => {
    if (badTokens.locked(c.clientIp)) {
      if (page) sendPage(c.req, c.res, expiredPage, 429);
      else sendJson(c.res, 429, { ok: false, error: 'TOO_MANY' }, true);
      return null;
    }
    const token = tokenOf(c.req);
    let personId: string | null = null;
    if (token) {
      try { personId = o.personByToken(token) || null; } catch (e) { log('personByToken failed', { err: errMsg(e) }); personId = null; }
    }
    if (!personId) {
      if (token && badTokens.fail(c.clientIp)) log('mobile token brute-force locked', { ip: c.clientIp });
      if (page) sendPage(c.req, c.res, expiredClearPage, 401);
      else sendJson(c.res, 401, { ok: false, error: 'UNAUTHORIZED' }, !c.req.complete);
      return null;
    }
    badTokens.pass(c.clientIp);
    return personId;
  };

  const pageRoute = (path: RegExp, page: PreparedPage): LanRoute<string> => ({
    method: 'GET', path, auth: 'none',
    handler: (c) => { if (authPerson(c, page)) sendPage(c.req, c.res, page); },
  });

  const handleInvoke = async (c: LanCtx<string>): Promise<void> => {
    const personId = authPerson(c);
    if (!personId) { closeSoon(c.req, c.res); return; }
    let body: any;
    try { body = await c.body(); } catch { sendJson(c.res, 413, { ok: false, error: 'TOO_LARGE', max: JSON_BODY_LIMIT }, true); closeSoon(c.req, c.res); return; }
    const action = typeof body?.action === 'string' ? body.action : '';
    if (!action) { sendJson(c.res, 400, { ok: false, error: 'BAD_REQUEST' }); return; }
    if (!MM_MOBILE_ACTIONS.has(action)) { sendJson(c.res, 403, { ok: false, error: 'FORBIDDEN_ACTION' }); return; }
    let payload: any = body.payload && typeof body.payload === 'object' && !Array.isArray(body.payload) ? body.payload : {};
    let cleanup: string | null = null;
    if (action === 'meeting.upload') {
      const paths: unknown[] = Array.isArray(payload.paths) ? payload.paths : [];
      if (!paths.length || !paths.every((p) => ownsUpload(personId, p))) { sendJson(c.res, 400, { ok: false, error: 'BAD_PATH' }); return; }
      payload = { ...payload, paths: paths.map((p) => resolve(p as string)) };
    } else if (action === 'voiceprint.enroll') {
      if (!ownsUpload(personId, payload.path)) { sendJson(c.res, 400, { ok: false, error: 'BAD_PATH' }); return; }
      cleanup = resolve(payload.path);
      payload = { ...payload, personId, path: cleanup };
    } else if (action === 'voiceprint.delete') {
      payload = { ...payload, personId };
    }
    try {
      const data = await o.dispatch(personId, action, payload);
      sendJson(c.res, 200, { ok: true, data: data === undefined ? null : data });
    } catch (e) {
      const msg = errMsg(e);
      log('mobile invoke failed', { action, personId, err: msg });
      sendJson(c.res, 400, { ok: false, error: msg });
    } finally {
      // 声纹录音只用来提特征：不论成败都删掉，不在服务器上留原始录音
      if (cleanup) safeUnlink(cleanup);
    }
  };

  const handleUpload = async (c: LanCtx<string>): Promise<void> => {
    const personId = authPerson(c);
    if (!personId) { closeSoon(c.req, c.res); return; }
    const declared = Number(c.req.headers['content-length']);
    if (Number.isFinite(declared) && declared > maxUpload) {
      sendJson(c.res, 413, { ok: false, error: 'TOO_LARGE', max: maxUpload }, true);
      closeSoon(c.req, c.res);
      return;
    }
    const q = queryOf(c.req);
    let headerName = '';
    try { headerName = decodeURIComponent(String(c.req.headers['x-file-name'] || '')); } catch { headerName = ''; }
    const name = safeUploadName(q.get('name') || headerName);
    const dir = personDir(personId);
    try { mkdirSync(dir, { recursive: true }); } catch (e) {
      log('mobile upload mkdir failed', { err: errMsg(e) });
      sendJson(c.res, 500, { ok: false, error: 'WRITE_FAILED' }, true);
      closeSoon(c.req, c.res);
      return;
    }
    const file = join(dir, `${stamp(new Date())}-${randomBytes(3).toString('hex')}-${name}`);
    await new Promise<void>((done) => {
      const ws = createWriteStream(file, { flags: 'wx' });
      let size = 0;
      let settled = false;
      const fail = (code: number, error: string, extra?: Record<string, unknown>) => {
        if (settled) return;
        settled = true;
        c.req.unpipe(ws);
        ws.destroy();
        ws.once('close', () => safeUnlink(file));
        safeUnlink(file);
        sendJson(c.res, code, { ok: false, error, ...(extra || {}) }, true);
        closeSoon(c.req, c.res);
        done();
      };
      c.req.on('data', (chunk: Buffer) => {
        size += chunk.length;
        if (size > maxUpload) fail(413, 'TOO_LARGE', { max: maxUpload });
      });
      c.req.on('error', () => fail(400, 'ABORTED'));
      c.req.on('close', () => { if (!c.req.complete) fail(400, 'ABORTED'); });
      ws.on('error', (e) => { log('mobile upload write failed', { err: errMsg(e) }); fail(500, 'WRITE_FAILED'); });
      ws.on('finish', () => {
        if (settled) return;
        settled = true;
        if (size === 0) {
          safeUnlink(file);
          sendJson(c.res, 400, { ok: false, error: 'EMPTY' });
        } else {
          log('mobile upload ok', { personId, name, size });
          sendJson(c.res, 200, { ok: true, data: { path: file, name, size } });
        }
        done();
      });
      c.req.pipe(ws);
    });
  };

  const handleClip = async (c: LanCtx<string>): Promise<void> => {
    const personId = authPerson(c);
    if (!personId) return;
    const q = queryOf(c.req);
    const meetingId = q.get('meetingId') || q.get('id') || '';
    const label = q.get('label') || '';
    if (!meetingId || !label) { sendJson(c.res, 400, { ok: false, error: 'BAD_REQUEST' }); return; }
    const key = `${personId}\n${meetingId}\n${label}`;
    const now = Date.now();
    const hit = clipCache.get(key);
    if (hit && now - hit.at < CLIP_CACHE_TTL_MS) { sendBuffer(c.req, c.res, hit.buf, hit.mime); return; }
    let clip: DecodedClip | null;
    try {
      clip = decodeClip(await o.dispatch(personId, 'meeting.speaker.clip', { id: meetingId, label }));
    } catch (e) {
      sendJson(c.res, 400, { ok: false, error: errMsg(e) });
      return;
    }
    if (!clip) { sendJson(c.res, 404, { ok: false, error: 'NOT_FOUND' }); return; }
    if (clip.path) {
      const abs = resolve(clip.path);
      c.serveFile(isInside(dataRoot, abs) && existsSync(abs) ? abs : null, AUDIO_MIME[extname(abs).toLowerCase()] || 'application/octet-stream');
      return;
    }
    const buf = clip.buf as Buffer;
    const mime = clip.mime || 'audio/wav';
    clipCache.set(key, { at: now, buf, mime });
    while (clipCache.size > CLIP_CACHE_MAX) clipCache.delete(clipCache.keys().next().value as string);
    sendBuffer(c.req, c.res, buf, mime);
  };

  const routes: LanRoute<string>[] = [
    pageRoute(/^\/m\/?$/, appPage),
    pageRoute(/^\/v\/?$/, voicePage),
    // 群链接入口：不带令牌、不校验，页面用本机记着的令牌跳到 /m 或 /v
    { method: 'GET', path: /^\/g\/?$/, auth: 'none', handler: (c) => sendPage(c.req, c.res, groupPage) },
    { method: 'GET', path: '/api/ping', auth: 'none', handler: (c) => c.json(200, { ok: true }) },
    { method: 'GET', path: '/api/meta', auth: 'none', handler: (c) => {
      let httpsBase = '';
      try { const b = String(o.publicBase?.() || '').trim().replace(/\/+$/, ''); if (/^https:\/\//i.test(b)) httpsBase = b; } catch { /* 取不到就不给 */ }
      return c.json(200, { maxUploadBytes: maxUpload, httpsBase });
    } },
    { method: 'POST', path: '/api/invoke', auth: 'none', handler: handleInvoke },
    { method: 'POST', path: '/api/upload', auth: 'none', handler: handleUpload },
    { method: 'GET', path: '/api/clip', auth: 'none', handler: handleClip },
  ];

  const lan = new LanServer<string>({
    name: 'meeting-mgmt-mobile',
    pageHtml: MEETING_MOBILE_APP_HTML,
    routes,
    auth: () => null, // 所有路由自己鉴权（令牌既可能在 ?t= 也可能在 Authorization 头）
    defaultPort: o.port ?? MM_MOBILE_DEFAULT_PORT,
    maxBodyBytes: JSON_BODY_LIMIT,
  });

  try { mkdirSync(uploadRoot, { recursive: true }); } catch { /* 首次上传时再建 */ }
  const swept = sweepUploads(uploadRoot);
  if (swept) log('mobile upload sweep', { removed: swept });
  const timer = setInterval(() => { sweepUploads(uploadRoot); }, SWEEP_INTERVAL_MS);
  timer.unref?.();

  let port: number;
  try {
    port = await lan.start();
  } catch (e) {
    clearInterval(timer);
    throw e;
  }
  const url = lan.url || `http://127.0.0.1:${port}`;
  log('mobile server started', { url });
  let stopped = false;
  return {
    url,
    port,
    stop: async () => {
      if (stopped) return;
      stopped = true;
      clearInterval(timer);
      clipCache.clear();
      await lan.stop();
      log('mobile server stopped', { port });
    },
  };
}
