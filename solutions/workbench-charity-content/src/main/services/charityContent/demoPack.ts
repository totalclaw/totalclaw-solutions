/**
 * 慈善活动内容工场 · 演示数据包（CDN 按需下载）。
 *
 * 这套预置成品（三语报告 PDF / 海报 / 语音 / 两版短视频）有一百多兆。塞进安装包等于
 * 让每个用户为了演示素材多下一百兆，塞进仓库更是刚清过一次历史又长回来。
 * 所以放 CDN：仓库与安装包里只留一份带 sha256 的清单，第一次用演示功能时下载一次，
 * 之后本地复用。**换机器照样带着** —— 它本来就不在机器上，在 CDN 上。
 *
 * 落地目录是账号私有的（accountPath）：不同账号不共用，切账号也不会看到别人那份。
 * 逐文件校验 sha256，坏一个只补一个，不整包重下。
 */
import { createHash } from 'crypto';
import { createWriteStream, existsSync, mkdirSync, readdirSync, readFileSync, renameSync, rmSync, statSync } from 'fs';
import { join } from 'path';
import { x as extractTar } from 'tar';
import { Readable, Transform } from 'stream';
import { pipeline } from 'stream/promises';
import { t as i18nT } from '@totalclaw/i18n';
import { accountPath } from '../accountScope';

export interface DemoPackFile { name: string; bytes: number; sha256: string }
export interface DemoPackManifest {
  version: string;
  generatedAt?: string;
  baseUrl?: string;
  totalBytes: number;
  files: DemoPackFile[];
  /** 整包文件名；缺省按 `charity-demo-pack-<version>.tar.gz` 推（打包脚本就是这么命名的） */
  archiveName?: string;
}

export interface DemoPackStatus {
  version: string;
  /** 全部文件都在且校验通过 */
  ready: boolean;
  /** 还缺的文件数 */
  missing: number;
  totalFiles: number;
  totalBytes: number;
  /** 已经落地的字节数（用于显示「已下载 x / y」） */
  localBytes: number;
  dir: string;
  /** 没配 CDN 地址时为空 —— 界面据此提示「演示包地址未配置」而不是干转 */
  baseUrl: string;
}

/**
 * CDN 上这一版演示包的目录地址。
 *
 * 上传后把地址填在这里；也可以用环境变量 TOTALCLAW_CHARITY_DEMO_BASE_URL 覆盖
 * （现场换 CDN、或临时指到内网镜像时不必重新打包）。
 * 留空表示还没上传：界面会明说「演示包地址未配置」，而不是让用户对着进度条干等。
 */
const DEFAULT_BASE_URL = 'https://cdn.taituai.com/demo/charity-demo-pack-2026-09-20';

/** 清单随包分发（几 KB），文件本体才在 CDN 上 */
export const DEMO_PACK_MANIFEST_REL = join('bundled-solutions', 'charity-content', 'charity-demo-pack.json');

export function readDemoPackManifest(resourcesDir: string): DemoPackManifest | null {
  try {
    const p = join(resourcesDir, DEMO_PACK_MANIFEST_REL);
    if (!existsSync(p)) return null;
    const m = JSON.parse(readFileSync(p, 'utf8')) as DemoPackManifest;
    if (!m?.version || !Array.isArray(m.files) || !m.files.length) return null;
    return m;
  } catch { return null; }
}

export function demoPackBaseUrl(manifest: DemoPackManifest | null): string {
  const env = String(process.env.TOTALCLAW_CHARITY_DEMO_BASE_URL || '').trim();
  return (env || manifest?.baseUrl || DEFAULT_BASE_URL).replace(/\/+$/, '');
}

/**
 * 这一版演示包在本机的落点（按版本分目录：换版本不覆盖旧的，回退也方便）。
 *
 * 取不到账号目录时返回空串而不是抛 —— 预置成品的**读取**路径不该因为账号作用域没就绪
 * 就整个挂掉（纯函数单测、或者还没登录时都会走到这里）。真要下载时另有明确报错。
 */
export function demoPackDir(version: string): string {
  try { return join(accountPath('charity-content'), 'demo-pack', version); }
  catch { return ''; }
}

function fileOk(path: string, f: DemoPackFile): boolean {
  try {
    if (!existsSync(path) || statSync(path).size !== f.bytes) return false;
    return createHash('sha256').update(readFileSync(path)).digest('hex') === f.sha256;
  } catch { return false; }
}

export function demoPackStatus(resourcesDir: string): DemoPackStatus {
  const m = readDemoPackManifest(resourcesDir);
  if (!m) {
    return { version: '', ready: false, missing: 0, totalFiles: 0, totalBytes: 0, localBytes: 0, dir: '', baseUrl: '' };
  }
  const dir = demoPackDir(m.version);
  if (!dir) {
    return { version: m.version, ready: false, missing: m.files.length, totalFiles: m.files.length,
      totalBytes: m.totalBytes, localBytes: 0, dir: '', baseUrl: demoPackBaseUrl(m) };
  }
  let missing = 0;
  let localBytes = 0;
  for (const f of m.files) {
    // 只比大小不做全量哈希：状态查询在界面上是高频的，几十个文件每次都哈希一遍会卡住渲染。
    // 真正的 sha256 校验在下载落地时做（见 fetchOne），那一刻才是数据可能出问题的时候。
    const p = join(dir, f.name);
    try {
      if (existsSync(p) && statSync(p).size === f.bytes) { localBytes += f.bytes; continue; }
    } catch { /* 读不到就算缺 */ }
    missing += 1;
  }
  return {
    version: m.version, ready: missing === 0, missing, totalFiles: m.files.length,
    totalBytes: m.totalBytes, localBytes, dir, baseUrl: demoPackBaseUrl(m),
  };
}

export interface DemoPackProgress { done: number; total: number; bytes: number; totalBytes: number; name: string }

async function fetchOne(url: string, dst: string, f: DemoPackFile, signal?: AbortSignal): Promise<void> {
  const res = await fetch(url, { signal });
  if (!res.ok || !res.body) throw new Error(i18nT('下载失败（HTTP {code}）：{name}', { code: String(res.status), name: f.name }));
  // 先写 .part 再改名：中途断网 / 退出应用不会留下一个「大小对但内容截断」的文件，
  // 那种文件最难查 —— 状态查询按大小判定会认为它已就绪。
  const part = `${dst}.part`;
  mkdirSync(join(dst, '..'), { recursive: true });
  await pipeline(Readable.fromWeb(res.body as any), createWriteStream(part));
  if (!fileOk(part, f)) {
    rmSync(part, { force: true });
    throw new Error(i18nT('校验不通过，已丢弃：{name}', { name: f.name }));
  }
  renameSync(part, dst);
}

/** CDN 上整包的文件名（打包脚本按这个命名，清单里也可以显式写） */
export function demoPackArchiveName(m: DemoPackManifest): string {
  return m.archiveName || `charity-demo-pack-${m.version}.tar.gz`;
}

/**
 * 整包下载并铺开。
 *
 * CDN 上放的是一个 tar.gz（24 个文件一个个传太折腾，实际也是这么上传的），
 * 所以**优先走整包**：一次请求换 24 次请求，断点重来也只重来一次。
 * 解出来之后仍然逐文件比 sha256 —— 整包本身没有独立校验值，但每个文件都有，
 * 逐文件核对比校验整包更严（少一个、串一个都逃不掉）。
 *
 * 解到 staging 再一个个搬进去：解压解到一半断电，不会在正式目录里留下半拉文件。
 */
async function fetchArchive(
  base: string, m: DemoPackManifest, dir: string,
  opts: { onProgress?: (p: DemoPackProgress) => void; signal?: AbortSignal },
): Promise<void> {
  const name = demoPackArchiveName(m);
  const url = `${base}/${encodeURIComponent(name)}`;
  const res = await fetch(url, { signal: opts.signal });
  if (!res.ok || !res.body) throw new Error(i18nT('下载失败（HTTP {code}）：{name}', { code: String(res.status), name }));

  const staging = join(dir, '.staging');
  rmSync(staging, { recursive: true, force: true });
  mkdirSync(staging, { recursive: true });
  const part = join(dir, `${name}.part`);
  let got = 0;
  const meter = new Transform({
    transform(chunk: Buffer, _enc, cb) {
      got += chunk.length;
      // 整包阶段没有「第几个文件」可报，用字节数推进度条；done 仍按解出来的算
      opts.onProgress?.({ done: 0, total: m.files.length, bytes: got, totalBytes: m.totalBytes, name });
      cb(null, chunk);
    },
  });
  try {
    await pipeline(Readable.fromWeb(res.body as any), meter, createWriteStream(part));
    if (opts.signal?.aborted) throw new Error(i18nT('已取消'));
    // strict + 不保留路径：这是我们自己打的包，出现绝对路径/跳出目录的条目就是出事了
    await extractTar({ file: part, cwd: staging, strict: true, preservePaths: false, preserveOwner: false });

    // 打包时是 `tar -C files .`，解出来直接在 staging 根下；万一哪天改成带一层目录，
    // 这里也认得出来（只认「根下只有一个目录」这种明确情形，不去瞎猜）
    let root = staging;
    if (!existsSync(join(staging, m.files[0].name))) {
      const entries = readdirSync(staging, { withFileTypes: true }).filter((d) => !d.name.startsWith('.'));
      if (entries.length === 1 && entries[0].isDirectory()) root = join(staging, entries[0].name);
    }

    let done = 0;
    let bytes = 0;
    for (const f of m.files) {
      if (opts.signal?.aborted) throw new Error(i18nT('已取消'));
      const src = join(root, f.name);
      if (!fileOk(src, f)) throw new Error(i18nT('校验不通过，已丢弃：{name}', { name: f.name }));
      mkdirSync(join(dir, f.name, '..'), { recursive: true });
      rmSync(join(dir, f.name), { force: true });
      renameSync(src, join(dir, f.name));
      done += 1;
      bytes += f.bytes;
      opts.onProgress?.({ done, total: m.files.length, bytes, totalBytes: m.totalBytes, name: f.name });
    }
  } finally {
    rmSync(part, { force: true });
    rmSync(staging, { recursive: true, force: true });
  }
}

/**
 * 确保演示包就绪：优先整包下载，整包拿不到再退回逐文件。
 * 已经在本地且大小对得上的直接跳过 —— 不重下、不重算哈希。
 */
export async function ensureDemoPack(
  resourcesDir: string,
  opts: { onProgress?: (p: DemoPackProgress) => void; signal?: AbortSignal } = {},
): Promise<DemoPackStatus> {
  const m = readDemoPackManifest(resourcesDir);
  if (!m) throw new Error(i18nT('安装包里没有演示数据清单，请重新安装应用'));
  const base = demoPackBaseUrl(m);
  if (!base) throw new Error(i18nT('演示包地址未配置，请联系管理员配置 CDN 地址'));
  const dir = demoPackDir(m.version);
  if (!dir) throw new Error(i18nT('账号目录尚未就绪，请先登录后再下载演示数据'));
  mkdirSync(dir, { recursive: true });

  const need = m.files.filter((f) => {
    const p = join(dir, f.name);
    try { return !(existsSync(p) && statSync(p).size === f.bytes); } catch { return true; }
  });
  let done = m.files.length - need.length;
  let bytes = m.files.reduce((a, f) => a + f.bytes, 0) - need.reduce((a, f) => a + f.bytes, 0);
  opts.onProgress?.({ done, total: m.files.length, bytes, totalBytes: m.totalBytes, name: '' });

  if (!need.length) return demoPackStatus(resourcesDir);

  /**
   * 缺得多就整包拉（一次请求顶 24 次）；只缺一两个才值得逐文件补。
   * 整包失败不直接判死：CDN 上可能只摊平放了单文件（早期那版就是），退回逐文件再试一遍。
   */
  if (need.length > 2) {
    try {
      await fetchArchive(base, m, dir, opts);
      return demoPackStatus(resourcesDir);
    } catch (e) {
      if (opts.signal?.aborted) throw e;
      // 整包没有就走单文件；两条都不通时，把单文件那条的原因报出去（更贴近用户能做什么）
    }
  }

  for (const f of need) {
    if (opts.signal?.aborted) throw new Error(i18nT('已取消'));
    opts.onProgress?.({ done, total: m.files.length, bytes, totalBytes: m.totalBytes, name: f.name });
    await fetchOne(`${base}/${encodeURIComponent(f.name)}`, join(dir, f.name), f, opts.signal);
    done += 1;
    bytes += f.bytes;
    opts.onProgress?.({ done, total: m.files.length, bytes, totalBytes: m.totalBytes, name: f.name });
  }
  return demoPackStatus(resourcesDir);
}

/**
 * 演示成品的实际根目录：下载到本地的那一份优先，没有再退回随包目录。
 *
 * 退回随包是给两种情况留的：开发机上文件还在仓库里；以及老版本安装包里本来就带着。
 * 两边文件名一致，loadPrebaked 拿到哪个都一样用。
 */
export function prebakedRoot(resourcesDir: string, bundledRoot: string): string {
  const m = readDemoPackManifest(resourcesDir);
  try {
    if (m) {
      const dir = demoPackDir(m.version);
      if (dir && existsSync(join(dir, 'report.json'))) return dir;
    }
  } catch { /* 账号目录不可用：退回随包目录，读取路径不该因此挂掉 */ }
  return bundledRoot;
}
