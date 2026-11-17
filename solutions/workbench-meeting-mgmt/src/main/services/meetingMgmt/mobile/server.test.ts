/**
 * 会议智能管理 · 手机页服务：真起一个 server 打真请求。
 * 钉住：页面路由与令牌校验（?t= / Bearer，失效页 401）、invoke 转发与动作白名单、上传落盘与大小上限、
 * 上传路径只认本人刚传的文件、声纹录音用完即删、试听片段（dataUrl / Range / 路径兜底）、停服务放端口。
 */
import { describe, it, expect, afterEach, beforeEach, vi } from 'vitest';
import { existsSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, utimesSync, writeFileSync } from 'node:fs';
import { request } from 'node:http';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

vi.mock('../../../util/quitRegistry', () => ({ onAppWillQuit: () => {} }));

import {
  MM_MOBILE_ACTIONS, buildMobileUrl, buildVoiceprintUrl, decodeClip, isInside, isLanOnlyUrl, mobileHashFor, safeUploadName,
  startMeetingMobileServer, sweepUploads, type MeetingMobileServerHandle,
} from './server';

/** 每个用例一个互不重叠的端口段（LanServer 会往后探 20 个端口），避开 lanServer.test 的 8390 起 */
let portCursor = 9140;
const nextPort = () => { const p = portCursor; portCursor += 40; return p; };

const TOKENS: Record<string, string> = { good: 'p1', other: 'p2' };

let root = '';
let uploadDir = '';
let dataDir = '';
let handle: MeetingMobileServerHandle | null = null;
let dispatch: ReturnType<typeof vi.fn>;

beforeEach(() => {
  root = mkdtempSync(join(tmpdir(), 'mm-mobile-'));
  uploadDir = join(root, 'uploads');
  dataDir = join(root, 'data');
  mkdirSync(dataDir, { recursive: true });
  dispatch = vi.fn(async (_p: string, action: string) => ({ echo: action }));
});
afterEach(async () => {
  if (handle) { await handle.stop(); handle = null; }
  rmSync(root, { recursive: true, force: true });
});

async function boot(extra: Partial<Parameters<typeof startMeetingMobileServer>[0]> = {}) {
  handle = await startMeetingMobileServer({
    port: nextPort(),
    dataDir,
    uploadDir,
    dispatch: (p, a, pl) => dispatch(p, a, pl),
    personByToken: (t) => TOKENS[t] || null,
    ...extra,
  });
  return `http://127.0.0.1:${handle.port}`;
}

async function invoke(base: string, body: unknown, token: string | null = 'good', viaQuery = false) {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token && !viaQuery) headers.Authorization = `Bearer ${token}`;
  const r = await fetch(`${base}/api/invoke${token && viaQuery ? `?t=${token}` : ''}`, { method: 'POST', headers, body: JSON.stringify(body) });
  return { status: r.status, json: await r.json() as any };
}

async function upload(base: string, content: Buffer | string, name = 'a.m4a', token = 'good') {
  const r = await fetch(`${base}/api/upload?name=${encodeURIComponent(name)}`, {
    method: 'POST', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/octet-stream' }, body: content as BodyInit,
  });
  return { status: r.status, json: await r.json() as any };
}

function listUploads(): string[] {
  if (!existsSync(uploadDir)) return [];
  return readdirSync(uploadDir).flatMap((d) => readdirSync(join(uploadDir, d)).map((f) => join(uploadDir, d, f)));
}

/** 原生 http 发分块上传（不带 Content-Length），用来测流式超限 */
function chunkedUpload(port: number, chunks: Buffer[]): Promise<{ status?: number; error?: string }> {
  return new Promise((resolveP) => {
    const req = request({
      host: '127.0.0.1', port, method: 'POST', path: '/api/upload?name=big.wav',
      headers: { Authorization: 'Bearer good', 'Transfer-Encoding': 'chunked' },
    }, (res) => {
      res.resume();
      res.on('end', () => resolveP({ status: res.statusCode }));
    });
    req.on('error', (e: any) => resolveP({ error: String(e?.code || e) }));
    let i = 0;
    const pump = () => {
      if (i >= chunks.length) { req.end(); return; }
      req.write(chunks[i++], () => setTimeout(pump, 20));
    };
    pump();
  });
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

describe('页面路由与令牌', () => {
  it('/m、/v 无令牌或令牌无效回 401 失效页；有效令牌回页面（带 CSP、不缓存令牌页）', async () => {
    const base = await boot();
    for (const path of ['/m', '/v', '/m?t=bad', '/v?t=bad']) {
      const r = await fetch(base + path);
      expect(r.status, path).toBe(401);
      expect(await r.text()).toContain('链接已失效，请在企微里重新打开');
    }
    const m = await fetch(`${base}/m?t=good`);
    expect(m.status).toBe(200);
    expect(m.headers.get('content-security-policy')).toContain("connect-src 'self'");
    expect(m.headers.get('referrer-policy')).toBe('no-referrer');
    const html = await m.text();
    expect(html).toContain('<div id="app"></div>');
    expect(html).toContain('window.__mmApp');
    const v = await fetch(`${base}/v?t=good`);
    expect(v.status).toBe(200);
    expect(await v.text()).toContain('window.__mmVoice');
  });

  it('群链接 /g 不校验令牌：页面用本机记着的令牌跳到 /m（?p=v 跳 /v），没有就提示先打开专属链接；令牌无效的失效页顺手忘掉记着的令牌', async () => {
    const base = await boot();
    const g = await fetch(`${base}/g`);
    expect(g.status).toBe(200);
    const html = await g.text();
    expect(html).toContain("localStorage.getItem(\"mm.token\")");
    expect(html).toContain("location.replace(p+'?t='+encodeURIComponent(t)+location.hash)");
    expect(html).toContain('这是发在群里的链接，需要先认出你是谁。');
    expect((await fetch(`${base}/g?p=v`)).status).toBe(200);
    const bad = await fetch(`${base}/m?t=bad`);
    expect(await bad.text()).toContain('localStorage.removeItem("mm.token")');
  });

  it('/ 直接给手机页（令牌由页面自己带上去校验）；ETag 命中回 304', async () => {
    const base = await boot();
    const r = await fetch(`${base}/`);
    expect(r.status).toBe(200);
    expect(await r.text()).toContain('window.__mmApp');
    const first = await fetch(`${base}/m?t=good`);
    const etag = first.headers.get('etag')!;
    await first.text();
    const again = await fetch(`${base}/m?t=good`, { headers: { 'If-None-Match': etag } });
    expect(again.status).toBe(304);
  });

  it('令牌放 Authorization 头也认', async () => {
    const base = await boot();
    const r = await fetch(`${base}/m`, { headers: { Authorization: 'Bearer good' } });
    expect(r.status).toBe(200);
  });

  it('同一 IP 连续猜错令牌 30 次后锁定（429）', async () => {
    const base = await boot();
    for (let i = 0; i < 30; i++) await invoke(base, { action: 'boot' }, `wrong-${i}`);
    const r = await invoke(base, { action: 'boot' }, 'good');
    expect(r.status).toBe(429);
    expect(r.json.error).toBe('TOO_MANY');
  });
});

describe('/api/invoke 转发', () => {
  it('无令牌 401，不调 dispatch', async () => {
    const base = await boot();
    const r = await invoke(base, { action: 'home.get' }, null);
    expect(r.status).toBe(401);
    expect(r.json).toEqual({ ok: false, error: 'UNAUTHORIZED' });
    expect(dispatch).not.toHaveBeenCalled();
  });

  it('Bearer / ?t= 两种令牌都转发成 dispatch(人员, 动作, 载荷)，结果包成 { ok, data }', async () => {
    const base = await boot();
    dispatch.mockResolvedValueOnce({ counts: { todos: 3 } });
    const a = await invoke(base, { action: 'home.get', payload: { x: 1 } });
    expect(a).toEqual({ status: 200, json: { ok: true, data: { counts: { todos: 3 } } } });
    expect(dispatch).toHaveBeenLastCalledWith('p1', 'home.get', { x: 1 });
    const b = await invoke(base, { action: 'task.get', payload: { id: 't1' } }, 'other', true);
    expect(b.status).toBe(200);
    expect(dispatch).toHaveBeenLastCalledWith('p2', 'task.get', { id: 't1' });
  });

  it('dispatch 抛的中文错误原样回给页面（400）', async () => {
    const base = await boot();
    dispatch.mockRejectedValueOnce(new Error('该成员还有未完成事项'));
    const r = await invoke(base, { action: 'project.members', payload: { id: 'x', memberIds: [] } });
    expect(r).toEqual({ status: 400, json: { ok: false, error: '该成员还有未完成事项' } });
  });

  it('白名单外的动作 403（切 PC 身份 / 弹 PC 文件框 / 拿别人的链接 / 设置），不调 dispatch', async () => {
    const base = await boot();
    for (const action of ['identity.set', 'meeting.pickFiles', 'mobile.link', 'mobile.stop', 'settings.save', 'wecom.save', 'demo.clear', 'org.sync', 'voiceprint.send']) {
      expect(MM_MOBILE_ACTIONS.has(action)).toBe(false);
      const r = await invoke(base, { action, payload: {} });
      expect(r.status, action).toBe(403);
      expect(r.json.error).toBe('FORBIDDEN_ACTION');
    }
    expect(dispatch).not.toHaveBeenCalled();
    const bad = await invoke(base, { payload: {} });
    expect(bad.status).toBe(400);
  });

  it('meeting.upload 只认本人刚传上来的文件：别人的、数据目录外的、穿越路径一律 400 BAD_PATH', async () => {
    const base = await boot();
    const mine = (await upload(base, 'audio-bytes', 'rec.m4a', 'good')).json.data.path as string;
    const others = (await upload(base, 'xx', 'x.m4a', 'other')).json.data.path as string;
    const outside = join(root, 'secret.txt');
    writeFileSync(outside, 'secret');
    for (const paths of [[outside], [others], [`${mine}/../../../secret.txt`], [], ['relative.m4a']]) {
      const r = await invoke(base, { action: 'meeting.upload', payload: { id: 'm1', paths } });
      expect(r.status, JSON.stringify(paths)).toBe(400);
      expect(r.json.error).toBe('BAD_PATH');
    }
    expect(dispatch).not.toHaveBeenCalled();
    const ok = await invoke(base, { action: 'meeting.upload', payload: { id: 'm1', paths: [mine] } });
    expect(ok.status).toBe(200);
    expect(dispatch).toHaveBeenCalledWith('p1', 'meeting.upload', { id: 'm1', paths: [mine] });
  });

  it('voiceprint.enroll 以令牌本人为准、强制 consent 原样带过去，录音用完即删（成败都删）', async () => {
    const base = await boot();
    const p1 = (await upload(base, 'voice', 'v.webm')).json.data.path as string;
    const r = await invoke(base, { action: 'voiceprint.enroll', payload: { personId: 'someone-else', path: p1, consent: true } });
    expect(r.status).toBe(200);
    expect(dispatch).toHaveBeenLastCalledWith('p1', 'voiceprint.enroll', { personId: 'p1', path: p1, consent: true });
    expect(existsSync(p1)).toBe(false);

    const p2 = (await upload(base, 'voice2', 'v.webm')).json.data.path as string;
    dispatch.mockRejectedValueOnce(new Error('录音时长不够 10 秒，请重录'));
    const bad = await invoke(base, { action: 'voiceprint.enroll', payload: { personId: 'p1', path: p2, consent: true } });
    expect(bad).toEqual({ status: 400, json: { ok: false, error: '录音时长不够 10 秒，请重录' } });
    expect(existsSync(p2)).toBe(false);
  });

  it('voiceprint.delete 只能撤回本人的', async () => {
    const base = await boot();
    await invoke(base, { action: 'voiceprint.delete', payload: { personId: 'p9' } });
    expect(dispatch).toHaveBeenLastCalledWith('p1', 'voiceprint.delete', { personId: 'p1' });
  });
});

describe('/api/upload', () => {
  it('写进 uploadDir 的本人子目录，内容一致，文件名清洗', async () => {
    const base = await boot();
    const body = Buffer.from('RIFF....WAVEfmt fake audio');
    const r = await upload(base, body, '../../etc/会议录音 1.wav');
    expect(r.status).toBe(200);
    expect(r.json.ok).toBe(true);
    const p = r.json.data.path as string;
    expect(isInside(uploadDir, p)).toBe(true);
    expect(r.json.data.name).toBe('会议录音 1.wav');
    expect(r.json.data.size).toBe(body.length);
    expect(readFileSync(p).equals(body)).toBe(true);
  });

  it('无令牌 401、空文件 400，都不留文件', async () => {
    const base = await boot();
    const r = await fetch(`${base}/api/upload?name=a.wav`, { method: 'POST', body: 'abc' });
    expect(r.status).toBe(401);
    const e = await upload(base, Buffer.alloc(0));
    expect(e.status).toBe(400);
    expect(e.json.error).toBe('EMPTY');
    expect(listUploads()).toEqual([]);
  });

  it('Content-Length 超上限直接 413（不落盘）', async () => {
    const base = await boot({ maxUploadBytes: 1000 });
    const r = await upload(base, Buffer.alloc(1500, 1));
    expect(r.status).toBe(413);
    expect(r.json).toMatchObject({ ok: false, error: 'TOO_LARGE', max: 1000 });
    expect(listUploads()).toEqual([]);
  });

  it('分块上传（无 Content-Length）写着写着超限：断开并删掉半截文件', async () => {
    await boot({ maxUploadBytes: 1000 });
    const res = await chunkedUpload(handle!.port, [Buffer.alloc(600, 1), Buffer.alloc(600, 2), Buffer.alloc(600, 3)]);
    // 服务端回 413 并关连接；客户端可能先拿到 413，也可能写的时候被对端重置
    if (res.status !== undefined) expect(res.status).toBe(413);
    else expect(res.error).toMatch(/ECONNRESET|EPIPE|socket hang up/i);
    await sleep(50);
    expect(listUploads()).toEqual([]);
  });

  it('/api/meta 报上传上限（页面用它提前拦大文件）', async () => {
    const base = await boot({ maxUploadBytes: 12345 });
    const r = await fetch(`${base}/api/meta`);
    expect(await r.json()).toEqual({ maxUploadBytes: 12345, httpsBase: '' });
  });

  it('/api/meta 带上 https 外网地址（设置里的卡片地址）；http 地址不给（给了也录不了音）', async () => {
    let pub = 'https://taituai.com/mm/';
    const base = await boot({ publicBase: () => pub });
    expect((await (await fetch(`${base}/api/meta`)).json()).httpsBase).toBe('https://taituai.com/mm');
    pub = 'http://192.168.1.5:8280';
    expect((await (await fetch(`${base}/api/meta`)).json()).httpsBase).toBe('');
  });
});

describe('/api/clip 试听片段', () => {
  const wav = Buffer.from('RIFF0000WAVEfmt-clip-bytes-0123456789');
  it('dispatch 给 dataUrl → 音频流，支持 Range（iOS 播放器先发 bytes=0-1）', async () => {
    const base = await boot();
    dispatch.mockResolvedValue({ dataUrl: `data:audio/wav;base64,${wav.toString('base64')}` });
    const r = await fetch(`${base}/api/clip?meetingId=m1&label=S1&t=good`);
    expect(r.status).toBe(200);
    expect(r.headers.get('content-type')).toBe('audio/wav');
    expect(Buffer.from(await r.arrayBuffer()).equals(wav)).toBe(true);
    expect(dispatch).toHaveBeenCalledWith('p1', 'meeting.speaker.clip', { id: 'm1', label: 'S1' });
    const part = await fetch(`${base}/api/clip?meetingId=m1&label=S1&t=good`, { headers: { Range: 'bytes=0-3' } });
    expect(part.status).toBe(206);
    expect(part.headers.get('content-range')).toBe(`bytes 0-3/${wav.length}`);
    expect(Buffer.from(await part.arrayBuffer()).toString()).toBe('RIFF');
    // 60 秒内同一片段走缓存，不反复导出
    expect(dispatch).toHaveBeenCalledTimes(1);
  });

  it('没权限 / 没片段 / 缺参数 / 无令牌', async () => {
    const base = await boot();
    dispatch.mockRejectedValueOnce(new Error('只有主持人可以试听'));
    const a = await fetch(`${base}/api/clip?meetingId=m1&label=S1&t=good`);
    expect(a.status).toBe(400);
    expect((await a.json() as any).error).toBe('只有主持人可以试听');
    dispatch.mockResolvedValueOnce(null);
    expect((await fetch(`${base}/api/clip?meetingId=m1&label=S2&t=good`)).status).toBe(404);
    expect((await fetch(`${base}/api/clip?label=S1&t=good`)).status).toBe(400);
    expect((await fetch(`${base}/api/clip?meetingId=m1&label=S1`)).status).toBe(401);
  });

  it('dispatch 给文件路径：只服务数据目录里的文件', async () => {
    const base = await boot();
    const inData = join(dataDir, 'files', 'm1', 'clip-S1.wav');
    mkdirSync(join(dataDir, 'files', 'm1'), { recursive: true });
    writeFileSync(inData, wav);
    dispatch.mockResolvedValueOnce({ path: inData });
    const ok = await fetch(`${base}/api/clip?meetingId=m1&label=S1&t=good`);
    expect(ok.status).toBe(200);
    expect(ok.headers.get('content-type')).toBe('audio/wav');
    await ok.arrayBuffer();
    const outside = join(root, 'other.wav');
    writeFileSync(outside, wav);
    dispatch.mockResolvedValueOnce({ path: outside });
    expect((await fetch(`${base}/api/clip?meetingId=m1&label=S9&t=good`)).status).toBe(404);
  });
});

describe('启动 / 停止', () => {
  it('返回局域网地址与端口；stop 后端口放掉，同端口能再起；stop 可重复调用', async () => {
    const port = nextPort();
    const a = await startMeetingMobileServer({ port, dataDir, uploadDir, dispatch: async () => null, personByToken: () => null });
    expect(a.port).toBe(port);
    expect(a.url).toMatch(new RegExp(`^http://[\\d.]+:${port}$`));
    await a.stop();
    await a.stop();
    const b = await startMeetingMobileServer({ port, dataDir, uploadDir, dispatch: async () => null, personByToken: () => null });
    expect(b.port).toBe(port);
    await b.stop();
  });
});

describe('工具函数', () => {
  it('mobileHashFor：每种 MmLink 对应手机页路由', () => {
    expect(mobileHashFor({ kind: 'meeting', id: 'm1' })).toBe('#/meeting/m1');
    expect(mobileHashFor({ kind: 'meeting', id: 'm1', anchor: 'seg 3' })).toBe('#/meeting/m1?anchor=seg%203');
    expect(mobileHashFor({ kind: 'meeting_plan', id: 'm1' })).toBe('#/plan/m1');
    expect(mobileHashFor({ kind: 'task', id: 't1' })).toBe('#/task/t1');
    expect(mobileHashFor({ kind: 'project', id: 'p1' })).toBe('#/project/p1');
    expect(mobileHashFor({ kind: 'project_summary', id: 'p1' })).toBe('#/summary/p1');
    expect(mobileHashFor({ kind: 'report', id: 'p1', anchor: 'r1' })).toBe('#/report/p1/r1');
    expect(mobileHashFor(null)).toBe('#/home');
    expect(buildMobileUrl('http://10.0.0.2:8280/', 'a b', { kind: 'task', id: 't1' })).toBe('http://10.0.0.2:8280/m?t=a%20b#/task/t1');
    expect(buildVoiceprintUrl('http://10.0.0.2:8280', 'tok')).toBe('http://10.0.0.2:8280/v?t=tok');
  });

  it('safeUploadName：去路径、去控制字符、限长保扩展名', () => {
    expect(safeUploadName('../../a/b/c.mp3')).toBe('c.mp3');
    expect(safeUploadName('C:\\Users\\x\\录音.m4a')).toBe('录音.m4a');
    expect(safeUploadName('a\nb?.wav')).toBe('a_b_.wav');
    expect(safeUploadName('')).toBe('upload.bin');
    expect(safeUploadName('...')).toBe('upload.bin');
    const long = safeUploadName(`${'x'.repeat(200)}.flac`);
    expect(long.length).toBe(80);
    expect(long.endsWith('.flac')).toBe(true);
  });

  it('sweepUploads：只删本服务命名的过期文件，别的文件不碰', () => {
    const dir = join(uploadDir, 'p-0123456789ab');
    mkdirSync(dir, { recursive: true });
    const old = join(dir, '20260101-101010-abcdef-old.wav');
    const fresh = join(dir, '20260101-101010-abcdef-new.wav');
    const foreign = join(dir, 'keep-me.wav');
    const foreignDir = join(uploadDir, 'files');
    mkdirSync(foreignDir, { recursive: true });
    const foreignOld = join(foreignDir, '20260101-101010-abcdef-x.wav');
    for (const f of [old, fresh, foreign, foreignOld]) writeFileSync(f, 'x');
    const past = (Date.now() - 48 * 3600_000) / 1000;
    for (const f of [old, foreign, foreignOld]) utimesSync(f, past, past);
    expect(sweepUploads(uploadDir)).toBe(1);
    expect(existsSync(old)).toBe(false);
    expect(existsSync(fresh)).toBe(true);
    expect(existsSync(foreign)).toBe(true);
    expect(existsSync(foreignOld)).toBe(true);
  });

  it('decodeClip / isInside', () => {
    expect(decodeClip({ dataUrl: 'data:audio/wav;base64,QUJD' })).toEqual({ buf: Buffer.from('ABC'), mime: 'audio/wav' });
    expect(decodeClip('data:audio/mpeg;base64,QUJD')?.mime).toBe('audio/mpeg');
    expect(decodeClip({ clipPath: '/x/y.wav' })).toEqual({ path: '/x/y.wav' });
    expect(decodeClip({})).toBeNull();
    expect(decodeClip(null)).toBeNull();
    expect(isInside('/a/b', '/a/b/c')).toBe(true);
    expect(isInside('/a/b', '/a/b')).toBe(false);
    expect(isInside('/a/b', '/a/bc')).toBe(false);
    expect(isInside('/a/b', '/a/b/../c')).toBe(false);
  });
});

describe('isLanOnlyUrl：链接是不是只有公司内网能打开', () => {
  it('私有 IP / 本机 / 局域网域名 / 单段主机名算内网；公网 IP 和域名不算', () => {
    for (const u of ['http://192.168.1.5:8280', 'http://10.0.3.7:8280/g', 'http://172.20.1.2:8280', 'http://172.31.255.1', 'http://169.254.10.1',
      'http://100.101.1.2:8280', 'http://127.0.0.1:8280', 'http://localhost:8280', 'http://macpro.local:8280', 'http://meeting:8280', 'http://[fd12::1]:8280', 'http://[fe80::1]:8280']) {
      expect(isLanOnlyUrl(u), u).toBe(true);
    }
    for (const u of ['https://meet.example.com', 'http://39.103.124.158:8280', 'http://172.32.0.1', 'http://172.15.0.1', 'http://100.128.0.1', 'https://[2408:8000::1]', 'not a url', '']) {
      expect(isLanOnlyUrl(u), u).toBe(false);
    }
  });
});
