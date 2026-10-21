/**
 * 对抗性回归：预置回退**绝不能覆盖用户真跑出来的成品**（2026-09-22 审查确认）。
 *
 * 现场机制：预置文件名与真跑输出**完全同名**（都是 `video-<lang>-ai.mp4`、
 * `report-<lang>.pdf`），而失败回退走 `copyPrebakedFiles(..., outDir)` 用 `basename`
 * 直接 `copyFileSync`。于是「一键流程第二次跑、出片那步失败」时，上一轮真实成片被
 * 沙特演示片原地覆盖，界面还按成功渲染 —— 用户会拿着别人机构的视频去发布。
 *
 * 这组用例把两条语义钉死：
 *   ① 回退（neverOverwrite）遇到已存在的真产物 → 不动它，演示片另存为「演示-」前缀；
 *   ② 用户主动「载入演示成品」（不传 neverOverwrite）→ 保持覆盖，那是用户要的。
 */
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, existsSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { copyPrebakedFiles } from './prebaked';

let root = '';
let preDir = '';
let outDir = '';

beforeEach(() => {
  root = mkdtempSync(join(tmpdir(), 'tc-prebaked-'));
  preDir = join(root, 'prebaked');
  outDir = join(root, 'out');
  mkdirSync(preDir, { recursive: true });
  mkdirSync(outDir, { recursive: true });
  // 预置演示片（沙特那份）
  writeFileSync(join(preDir, 'video-zh-ai.mp4'), 'DEMO-VIDEO');
});

afterEach(() => { rmSync(root, { recursive: true, force: true }); });

describe('预置回退不许覆盖真产物', () => {
  it('回退时真成片原封不动，演示片另存为「演示-」前缀', () => {
    const real = join(outDir, 'video-zh-ai.mp4');
    writeFileSync(real, 'USER-REAL-VIDEO');   // 上一轮真跑出来的成片

    const copied = copyPrebakedFiles(
      { zh: join(preDir, 'video-zh-ai.mp4') },
      outDir,
      undefined,
      { neverOverwrite: true },
    );

    // 真产物必须一个字节都没变
    expect(readFileSync(real, 'utf8')).toBe('USER-REAL-VIDEO');
    // 演示片落到另一个名字，且回执指向它（用户一眼能认出这是演示素材）
    expect(copied.zh).toBe(join(outDir, '演示-video-zh-ai.mp4'));
    expect(readFileSync(copied.zh!, 'utf8')).toBe('DEMO-VIDEO');
  });

  it('目标不存在时，回退仍用原名（不会平白多出「演示-」前缀）', () => {
    const copied = copyPrebakedFiles(
      { zh: join(preDir, 'video-zh-ai.mp4') },
      outDir,
      undefined,
      { neverOverwrite: true },
    );
    expect(copied.zh).toBe(join(outDir, 'video-zh-ai.mp4'));
    expect(existsSync(join(outDir, '演示-video-zh-ai.mp4'))).toBe(false);
  });

  it('用户主动载入演示成品（不传 neverOverwrite）时保持覆盖语义', () => {
    const dst = join(outDir, 'video-zh-ai.mp4');
    writeFileSync(dst, 'OLD');
    const copied = copyPrebakedFiles({ zh: join(preDir, 'video-zh-ai.mp4') }, outDir);
    expect(copied.zh).toBe(dst);
    expect(readFileSync(dst, 'utf8')).toBe('DEMO-VIDEO');
  });
});
