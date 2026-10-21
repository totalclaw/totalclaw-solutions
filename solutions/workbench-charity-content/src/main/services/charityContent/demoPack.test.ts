/**
 * 演示数据包（CDN 按需下载）。
 *
 * 这条链最容易出事的是「看起来有、其实是坏的」：断网断在一半留下一个大小对但内容截断的
 * 文件，而状态查询是按大小判定的 —— 那种文件最难查。所以逐条钉住：先写 .part 再改名、
 * 校验不过就丢弃、已有的不重下。
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { c as createTar } from 'tar';

const H = vi.hoisted(() => ({ account: '' }));
vi.mock('../accountScope', () => ({ accountPath: (name: string) => join(H.account, name) }));

import { demoPackStatus, ensureDemoPack, demoPackDir, readDemoPackManifest, prebakedRoot } from './demoPack';

const sha = (b: Buffer | string): string => createHash('sha256').update(b).digest('hex');
let res = '';
const dirs: string[] = [];

/** 造一份随包清单（文件本体不在包里，正是这个特性要测） */
function seedManifest(files: Array<{ name: string; body: string }>, baseUrl = 'https://cdn.example/charity/v1'): void {
  const dir = join(res, 'bundled-solutions', 'charity-content');
  mkdirSync(dir, { recursive: true });
  const entries = files.map((f) => ({ name: f.name, bytes: Buffer.byteLength(f.body), sha256: sha(f.body) }));
  writeFileSync(join(dir, 'charity-demo-pack.json'), JSON.stringify({
    version: 'v1', baseUrl, totalBytes: entries.reduce((a, e) => a + e.bytes, 0), files: entries,
  }));
}

beforeEach(() => {
  res = mkdtempSync(join(tmpdir(), 'cdp-res-'));
  H.account = mkdtempSync(join(tmpdir(), 'cdp-acc-'));
  dirs.push(res, H.account);
  delete process.env.TOTALCLAW_CHARITY_DEMO_BASE_URL;
});
afterEach(() => { vi.unstubAllGlobals(); while (dirs.length) rmSync(dirs.pop()!, { recursive: true, force: true }); });

function stubFetch(bodies: Record<string, string>, onHit?: (url: string) => void) {
  vi.stubGlobal('fetch', vi.fn(async (url: string) => {
    onHit?.(String(url));
    const name = decodeURIComponent(String(url).split('/').pop() || '');
    if (!(name in bodies)) return { ok: false, status: 404, body: null } as any;
    return { ok: true, status: 200, body: new Blob([bodies[name]]).stream() } as any;
  }));
}

describe('清单与状态', () => {
  it('没有清单时状态是空的，不假装就绪', () => {
    const st = demoPackStatus(res);
    expect(st.ready).toBe(false);
    expect(st.totalFiles).toBe(0);
    expect(readDemoPackManifest(res)).toBeNull();
  });
  it('有清单、文件还没下：ready=false 且说得出缺几个、总共多大', () => {
    seedManifest([{ name: 'a.json', body: '{"a":1}' }, { name: 'b.mp3', body: 'xxxx' }]);
    const st = demoPackStatus(res);
    expect(st.ready).toBe(false);
    expect(st.missing).toBe(2);
    expect(st.totalFiles).toBe(2);
    expect(st.totalBytes).toBe(11);
    expect(st.baseUrl).toBe('https://cdn.example/charity/v1');
  });
  it('环境变量能覆盖 CDN 地址（现场换镜像不必重新打包）', () => {
    seedManifest([{ name: 'a.json', body: '{}' }], 'https://cdn.example/x');
    process.env.TOTALCLAW_CHARITY_DEMO_BASE_URL = 'http://192.168.1.9:8080/demo';
    expect(demoPackStatus(res).baseUrl).toBe('http://192.168.1.9:8080/demo');
  });
});

describe('下载', () => {
  it('把文件下到账号私有目录并逐个校验；状态转为就绪', async () => {
    seedManifest([{ name: 'report.json', body: '{"zh":1}' }, { name: 'speech-zh.mp3', body: 'MP3DATA' }]);
    stubFetch({ 'report.json': '{"zh":1}', 'speech-zh.mp3': 'MP3DATA' });
    const st = await ensureDemoPack(res);
    expect(st.ready).toBe(true);
    expect(st.missing).toBe(0);
    const dir = demoPackDir('v1');
    expect(existsSync(join(dir, 'report.json'))).toBe(true);
    // 不留半截文件
    expect(readdirSync(dir).some((f) => f.endsWith('.part'))).toBe(false);
  });

  it('已经下过的不重下（换台机器最怕每次进来都再拉一百兆）', async () => {
    seedManifest([{ name: 'a.txt', body: 'AAA' }, { name: 'b.txt', body: 'BBB' }]);
    const hits: string[] = [];
    stubFetch({ 'a.txt': 'AAA', 'b.txt': 'BBB' }, (u) => hits.push(u));
    await ensureDemoPack(res);
    expect(hits).toHaveLength(2);
    hits.length = 0;
    await ensureDemoPack(res);
    expect(hits).toHaveLength(0); // 第二次一个请求都不发
  });

  it('内容被改过（sha256 对不上）就丢弃并报错，绝不把坏文件留在盘上冒充就绪', async () => {
    seedManifest([{ name: 'a.txt', body: 'GOOD' }]);
    stubFetch({ 'a.txt': 'EVIL' }); // 字节数相同、内容不同 —— 只比大小的话会被放过去
    await expect(ensureDemoPack(res)).rejects.toThrow();
    const dir = demoPackDir('v1');
    expect(existsSync(join(dir, 'a.txt'))).toBe(false);
    expect(demoPackStatus(res).ready).toBe(false);
  });

  it('清单里没写地址就用内置的 CDN（随包发的那份清单 baseUrl 就是空的）', async () => {
    // 打包脚本产出的清单里 baseUrl 留空，地址写在 demoPack.ts 的 DEFAULT_BASE_URL 里 ——
    // 这一条钉的就是这个兜底：清单空着不等于「没配」，否则发出去的包一进来就说地址没配。
    // （原来这里测的是「没配地址时不空跑」；内置地址填上之后那个状态在正式包里不可能出现，
    //   代码里的那条报错仍然留着，是给把常量清空的将来版本兜底的。）
    seedManifest([{ name: 'a.txt', body: 'A' }], '');
    const st = demoPackStatus(res);
    expect(st.baseUrl).toMatch(/^https:\/\//);
    expect(st.baseUrl).not.toMatch(/\/$/);          // 末尾斜杠要去掉，否则拼出 //a.txt
    // 环境变量仍然优先（现场换镜像不必重新打包）
    process.env.TOTALCLAW_CHARITY_DEMO_BASE_URL = 'http://10.0.0.2:9000/demo';
    expect(demoPackStatus(res).baseUrl).toBe('http://10.0.0.2:9000/demo');
  });

  it('下到一半失败：已下好的保留，重试只补没下的那个', async () => {
    seedManifest([{ name: 'a.txt', body: 'A' }, { name: 'b.txt', body: 'B' }]);
    stubFetch({ 'a.txt': 'A' }); // b 拿不到 → 404
    await expect(ensureDemoPack(res)).rejects.toThrow();
    expect(existsSync(join(demoPackDir('v1'), 'a.txt'))).toBe(true);
    const hits: string[] = [];
    stubFetch({ 'a.txt': 'A', 'b.txt': 'B' }, (u) => hits.push(u));
    const st = await ensureDemoPack(res);
    expect(st.ready).toBe(true);
    expect(hits).toHaveLength(1); // 只补 b
    expect(hits[0]).toContain('b.txt');
  });
});

describe('整包下载（CDN 上放的就是一个 tar.gz）', () => {
  /** 现打一个 tar.gz，内容与清单一致 —— 与打包脚本一样是 `tar -C files .` 的平铺形状 */
  async function seedArchive(files: Array<{ name: string; body: string }>): Promise<ArrayBuffer> {
    const src = mkdtempSync(join(tmpdir(), 'cdp-src-'));
    dirs.push(src);
    for (const f of files) writeFileSync(join(src, f.name), f.body);
    const out = join(src, 'pack.tar.gz');
    await createTar({ gzip: true, file: out, cwd: src }, files.map((f) => f.name));
    // 切成独立的 ArrayBuffer 再交给 Blob：Node 的 Buffer 视图在 TS 里不是合法的 BlobPart
    const buf = readFileSync(out);
    return buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength) as ArrayBuffer;
  }

  it('缺得多时走整包：一次请求换回全部文件，并逐个校验 sha256', async () => {
    const files = [
      { name: 'report.json', body: '{"zh":1}' },
      { name: 'speech-zh.mp3', body: 'MP3DATA' },
      { name: 'poster-zh.jpg', body: 'JPEGDATA' },
      { name: 'video-ai-zh.mp4', body: 'MP4DATA' },
    ];
    seedManifest(files);
    const gz = await seedArchive(files);
    const hits: string[] = [];
    vi.stubGlobal('fetch', vi.fn(async (url: string) => {
      hits.push(String(url));
      if (!/\.tar\.gz$/.test(String(url))) return { ok: false, status: 404, body: null } as any;
      return { ok: true, status: 200, body: new Blob([gz]).stream() } as any;
    }));

    const st = await ensureDemoPack(res);
    expect(st.ready).toBe(true);
    expect(hits).toHaveLength(1);                       // 24 个文件 → 1 次请求
    expect(hits[0]).toContain('charity-demo-pack-v1.tar.gz');
    const dir = demoPackDir('v1');
    for (const f of files) expect(existsSync(join(dir, f.name))).toBe(true);
    // 不留压缩包、不留 staging
    expect(readdirSync(dir).some((f) => f.endsWith('.part') || f === '.staging')).toBe(false);
  });

  it('整包里的文件被换过（sha256 对不上）就整体失败，绝不把坏文件铺进正式目录', async () => {
    const declared = [
      { name: 'a.txt', body: 'GOOD' }, { name: 'b.txt', body: 'GOOD' },
      { name: 'c.txt', body: 'GOOD' }, { name: 'd.txt', body: 'GOOD' },
    ];
    seedManifest(declared);
    // 字节数一样、内容不同 —— 只比大小的话会被放过去
    const gz = await seedArchive(declared.map((f, i) => (i === 2 ? { ...f, body: 'EVIL' } : f)));
    vi.stubGlobal('fetch', vi.fn(async (url: string) => (/\.tar\.gz$/.test(String(url))
      ? { ok: true, status: 200, body: new Blob([gz]).stream() } as any
      : { ok: false, status: 404, body: null } as any)));

    await expect(ensureDemoPack(res)).rejects.toThrow();
    const dir = demoPackDir('v1');
    expect(existsSync(join(dir, 'c.txt'))).toBe(false);
    expect(demoPackStatus(res).ready).toBe(false);
  });

  it('CDN 上只摊平放了单文件（没有整包）时，退回逐文件照样能下完', async () => {
    const files = [
      { name: 'a.txt', body: 'A' }, { name: 'b.txt', body: 'B' },
      { name: 'c.txt', body: 'C' }, { name: 'd.txt', body: 'D' },
    ];
    seedManifest(files);
    const bodies = Object.fromEntries(files.map((f) => [f.name, f.body]));
    const hits: string[] = [];
    vi.stubGlobal('fetch', vi.fn(async (url: string) => {
      hits.push(String(url));
      const name = decodeURIComponent(String(url).split('/').pop() || '');
      if (!(name in bodies)) return { ok: false, status: 404, body: null } as any;  // 整包 404
      return { ok: true, status: 200, body: new Blob([bodies[name]]).stream() } as any;
    }));
    const st = await ensureDemoPack(res);
    expect(st.ready).toBe(true);
    expect(hits[0]).toContain('.tar.gz');   // 先试整包
    expect(hits).toHaveLength(5);           // 整包扑空 + 4 个单文件
  });

  it('只缺一两个时不去拉整包（为了补一个几 KB 的文件重下一百兆不值当）', async () => {
    const files = [
      { name: 'a.txt', body: 'A' }, { name: 'b.txt', body: 'B' },
      { name: 'c.txt', body: 'C' }, { name: 'd.txt', body: 'D' },
    ];
    seedManifest(files);
    const dir = demoPackDir('v1');
    mkdirSync(dir, { recursive: true });
    for (const f of files.slice(0, 3)) writeFileSync(join(dir, f.name), f.body);
    const hits: string[] = [];
    stubFetch({ 'd.txt': 'D' }, (u) => hits.push(u));
    const st = await ensureDemoPack(res);
    expect(st.ready).toBe(true);
    expect(hits).toHaveLength(1);
    expect(hits[0]).toContain('d.txt');
    expect(hits.some((u) => u.includes('.tar.gz'))).toBe(false);
  });
});

describe('成品根目录选择', () => {
  it('下载过就用下载的那份；没有才退回随包目录（开发机与老安装包照常能用）', async () => {
    const bundled = join(res, 'bundled-solutions', 'charity-content');
    seedManifest([{ name: 'report.json', body: '{"x":1}' }]);
    expect(prebakedRoot(res, bundled)).toBe(bundled); // 还没下
    stubFetch({ 'report.json': '{"x":1}' });
    await ensureDemoPack(res);
    expect(prebakedRoot(res, bundled)).toBe(demoPackDir('v1'));
  });
});
