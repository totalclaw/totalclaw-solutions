/**
 * 「内置演示成片」拆除护栏（2026-08-06）。
 *
 * 病史：短视频工作台曾内置一条 42 秒演示片（assets/short-video-showcase.mp4）+
 * adoptExistingShowcaseVideo()，它把 `bundled-showcase://short-video` 写进持久化的
 * lastJob 并伪造出全套「已完成」节点状态。用户每次进页面都被告知
 * 「已复用完成渲染的 42 秒成片」——真实生成从没跑过，历史记录也跟着错乱。
 * 调用点注释掉并不够：常量、预览分支、写死文案、以及只核验 source==='direct' 的
 * 挂载恢复缺口都还在，旧 localStorage 一条记录就能让它整套复活。
 *
 * 用户明确要求：生成必须真跑，没有捷径。这里钉死拆除结果。
 */
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const SRC = readFileSync(join(__dirname, 'VideoStudioView.vue'), 'utf-8');
/** 剥掉注释：病史说明里会引用旧文案，不该被当成回潮。 */
const CODE = SRC.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');

describe('短视频工作台不得复用内置演示成片', () => {
  it('演示成片的机制符号一个都不许留', () => {
    for (const symbol of [
      'adoptExistingShowcaseVideo',
      'EXISTING_SHOWCASE_VIDEO',
      'SHOWCASE_PREVIEW_URL',
      'bundled-showcase://',
      'existingVideoMode',
      'short-video-showcase.mp4',
    ]) {
      expect(CODE, `演示成片机制回潮：${symbol}`).not.toContain(symbol);
    }
  });

  it('不许再有写死时长的「已复用成片」文案', () => {
    expect(CODE).not.toContain('已复用完成渲染');
    // 42 秒是那条演示片的时长，任何写死时长的成片文案都是复用捷径的痕迹
    expect(CODE).not.toMatch(/\d+\s*秒成片/);
  });

  it('挂载恢复必须对所有来源核验磁盘实存（不能只核 direct）', () => {
    const idx = SRC.indexOf('const verifiedRestore');
    expect(idx, '挂载恢复核验不见了').toBeGreaterThan(0);
    const block = SRC.slice(Math.max(0, idx - 400), idx + 200);
    // 对抗断言：一旦把核验缩回 source==='direct' 分支，旧数据/工作流来源的
    // 陈旧绑定又会绕开核验被当成「上次成片」显示。
    expect(block).not.toMatch(/if\s*\(\s*lastJob\.source\s*===\s*'direct'\s*&&\s*lastJob\.videoPath\s*\)/);
    expect(block).toContain('inspectVideoPath(pendingRestoreVideoPath)');
  });
  it('挂载时不许用旧发布回执点亮进度（表单还空着就显示已完成）', () => {
    const idx = CODE.indexOf('PUBLISH_RECEIPT_KEY');
    expect(idx).toBeGreaterThan(0);
    const block = CODE.slice(idx, idx + 700);
    // 对抗断言：读到上一轮回执就写 success / 点亮节点 = 残影复活
    expect(block).not.toMatch(/jobRunStatus\.value\s*=\s*'success'/);
    expect(block).not.toContain('platform_publish:');
  });

  it('持久化的成片绑定必须核验后才回填（不许同步渲染抢在核验之前）', () => {
    // 恢复时刻意不带 videoPath，等 inspectVideoPath 通过再写回
    expect(CODE).toContain('pendingRestoreVideoPath');
    const initIdx = CODE.indexOf('const lastJob = reactive<LastJob>');
    const initBlock = CODE.slice(initIdx, initIdx + 400);
    expect(initBlock, '恢复时必须清空 videoPath').toContain("videoPath: ''");
  });
  it('任何界面文案都不许写死成片时长（死数据）', () => {
    // 用户明确要求：不要死数据。42 秒是内置演示片的时长，写死它就意味着
    // 界面在描述一条并非本次产出的视频（预览弹窗曾长期这么写）。
    expect(CODE).not.toMatch(/\d+\s*秒(竖屏)?成片/);
    expect(CODE).not.toMatch(/已生成的\s*\d+\s*秒/);
  });
});
