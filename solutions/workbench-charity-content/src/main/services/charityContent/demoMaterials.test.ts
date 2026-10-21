/**
 * 演示素材随包分发 + 复制到用户目录（别人电脑上也能「载入演示素材」）：
 *   - 壳资源根：打包态 = process.resourcesPath（不是 CDN 运行时目录），开发态 = 仓库 resources/
 *   - 仓库里真的带了演示素材（3 图 + 3 视频 + 1 PDF，不含古兰经语料包与 docx）
 *   - 复制幂等：再来一次不重复复制；半截 / 被改坏的重新复制；用户自己放的文件不动；安装目录只读不写
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';

vi.mock('electron', () => ({ app: { isPackaged: false, getPath: () => tmpdir() } }));

import { shellResourcesPath, runtimeResourcesPath, setRuntimeResourcesPath } from '../runtimeLocation';
import {
  DEMO_MATERIALS_REL, demoMaterialsSourceDir, demoMaterialsTargetDir, prepareDemoMaterials,
} from './demoMaterials';

const REPO_RESOURCES = resolve(__dirname, '..', '..', '..', '..', '..', '..', 'resources');

describe('壳资源根（bundled-solutions / quran-demo-* 所在）', () => {
  afterEach(() => setRuntimeResourcesPath(undefined as unknown as string));

  it('打包态用安装包 resources，即使 CDN 运行时已就位（那里只有 vendor/）', () => {
    setRuntimeResourcesPath('/runtime/cdn/1.2.3/resources');
    expect(shellResourcesPath({ isPackaged: true, resourcesPath: '/Applications/TotalClaw.app/Contents/Resources' }))
      .toBe('/Applications/TotalClaw.app/Contents/Resources');
    expect(runtimeResourcesPath()).toBe('/runtime/cdn/1.2.3/resources');
  });

  it('开发态用仓库 resources/', () => {
    expect(shellResourcesPath({ isPackaged: false, devRoot: REPO_RESOURCES })).toBe(REPO_RESOURCES);
    // 缺省：dist/main 往上四级（esbuild 产物位置）
    expect(shellResourcesPath({ isPackaged: false }).endsWith('resources')).toBe(true);
  });

  it('仓库里带了演示素材：3 张照片 + 3 段视频 + 1 份 PDF，没有语料包 / docx；electron-builder 会随包带上', () => {
    const dir = demoMaterialsSourceDir(REPO_RESOURCES);
    const files = readdirSync(dir).filter((n) => !n.startsWith('.'));
    const ext = (re: RegExp) => files.filter((n) => re.test(n)).length;
    expect(ext(/\.jpe?g$/i)).toBe(3);
    expect(ext(/\.pdf$/i)).toBe(1);
    // 演示素材里的 3 段视频 2026-09-21 起不进 Git（见 .gitignore），只在出包机本地：
    // 新 clone 上是 0 段，出包机上是 3 段 —— 两种都合法，但不能是别的数
    const videos = ext(/\.mp4$/i);
    expect([0, 3]).toContain(videos);
    expect(files).toHaveLength(4 + videos);
    expect(files.some((n) => /docx$|zip$|语料/.test(n))).toBe(false);
    const builder = readFileSync(resolve(REPO_RESOURCES, '..', 'apps', 'desktop-shell', 'electron-builder.yml'), 'utf8');
    for (const d of ['bundled-solutions', 'quran-demo-corpus', 'quran-demo-fonts']) {
      expect(builder).toContain(`from: ../../resources/${d}\n    to: ${d}\n`);
    }
    expect(DEMO_MATERIALS_REL.split(/[\\/]/)[0]).toBe('bundled-solutions');
  });
});

describe('prepareDemoMaterials', () => {
  let root: string;
  let src: string;
  let docs: string;
  beforeEach(() => {
    root = mkdtempSync(join(tmpdir(), 'cc-demo-'));
    src = join(root, 'install', 'demo-materials');
    docs = join(root, 'Documents');
    mkdirSync(src, { recursive: true });
    writeFileSync(join(src, 'a.jpg'), 'photo');
    writeFileSync(join(src, 'b.mp4'), 'video-bytes');
    writeFileSync(join(src, '指南.pdf'), 'pdf');
    writeFileSync(join(src, '.DS_Store'), 'junk');
    writeFileSync(join(src, 'notes.docx'), 'not a material');
  });
  afterEach(() => rmSync(root, { recursive: true, force: true }));

  it('复制到 <文稿>/TotalClaw/慈善演示素材/，只带素材类文件', () => {
    const dest = demoMaterialsTargetDir(docs);
    expect(dest).toBe(join(docs, 'TotalClaw', '慈善演示素材'));
    const r = prepareDemoMaterials(src, dest);
    expect(r.dir).toBe(dest);
    expect(r.copied.sort()).toEqual(['a.jpg', 'b.mp4', '指南.pdf']);
    expect(readdirSync(dest).sort()).toEqual(['a.jpg', 'b.mp4', '指南.pdf']);
    expect(readFileSync(join(dest, 'b.mp4'), 'utf8')).toBe('video-bytes');
  });

  it('幂等：第二次全部跳过；被改坏（大小不同）的重新复制；用户自己的文件与产物目录不动', () => {
    const dest = demoMaterialsTargetDir(docs);
    prepareDemoMaterials(src, dest);
    writeFileSync(join(dest, 'b.mp4'), 'half');
    writeFileSync(join(dest, 'mine.jpg'), 'user file');
    mkdirSync(join(dest, '输出', '20260918-100000'), { recursive: true });
    const r = prepareDemoMaterials(src, dest);
    expect(r.copied).toEqual(['b.mp4']);
    expect(r.skipped.sort()).toEqual(['a.jpg', '指南.pdf']);
    expect(readFileSync(join(dest, 'b.mp4'), 'utf8')).toBe('video-bytes');
    expect(readFileSync(join(dest, 'mine.jpg'), 'utf8')).toBe('user file');
    expect(existsSync(join(dest, '输出', '20260918-100000'))).toBe(true);
    expect(readdirSync(dest).some((n) => n.endsWith('.part'))).toBe(false);
    // 安装目录没被写
    expect(readdirSync(src).sort()).toEqual(['.DS_Store', 'a.jpg', 'b.mp4', 'notes.docx', '指南.pdf']);
  });

  it('安装包里缺素材：给可读错误，不建空目录', () => {
    const dest = join(docs, 'x');
    expect(() => prepareDemoMaterials(join(root, 'missing'), dest)).toThrow(/演示素材/);
    expect(existsSync(dest)).toBe(false);
  });
});
