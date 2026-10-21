/**
 * 「再次发布」护栏（2026-08-06 用户反馈）。
 *
 * 两条产品约定：
 *  ① 发布完成后按钮不许永久锁死 —— 补发平台、上一轮部分平台失败重试都是正常需求；
 *  ② 再次发布要回填上一次的入参（平台/话题/文案）。否则同一条成片会因为重新调 LLM
 *     生成出第二版文案，两次发出去的内容不一致，用户还得重填话题。
 */
import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const SRC = readFileSync(join(__dirname, 'VideoStudioView.vue'), 'utf-8');
/** 剥注释：说明文字里会引用旧文案，不该被当成回潮。 */
const CODE = SRC.replace(/<!--[\s\S]*?-->/g, '').replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');

describe('再次发布', () => {
  it('发布完成后按钮不许被禁用（此前锁成「已完成发布」再也发不了）', () => {
    expect(CODE, '按钮仍以 publishDone 禁用').not.toMatch(/:disabled="publishing \|\| publishDone"/);
    expect(CODE, '缺少「再次发布」入口').toContain('再次发布');
  });

  it('openPublishConfirm 入口不许再用 publishDone 拦截', () => {
    const idx = CODE.indexOf('async function openPublishConfirm');
    expect(idx).toBeGreaterThan(0);
    const head = CODE.slice(idx, idx + 400);
    expect(head).not.toMatch(/if\s*\([^)]*publishDone\.value\s*\)\s*return/);
  });

  it('必须持久化上一次发布入参，并在同片同平台时复用', () => {
    expect(CODE, '未持久化发布入参').toContain('LAST_PUBLISH_INPUT_KEY');
    expect(CODE, '未读回上一次入参').toContain('loadLastPublishInput()');
    // 复用条件必须同时校验成片与平台集合，避免换了片子还套旧文案
    const idx = CODE.indexOf('const reusable');
    expect(idx).toBeGreaterThan(0);
    const block = CODE.slice(Math.max(0, idx - 600), idx + 200);
    expect(block, '未校验成片是否同一条').toContain('previous.videoPath === lastJob.videoPath');
    expect(block, '未校验平台集合一致').toContain('platformIds.length');
    // 复用时不得重新生成文案
    const capIdx = CODE.indexOf('const caption = reusable');
    expect(capIdx, '文案未走复用分支').toBeGreaterThan(0);
  });
});

describe('人工确认卡「取消」', () => {
  it('每个使用 HumanConfirmCard 的地方都必须接 @dismiss（否则点了没反应）', () => {
    const roots = ['views', 'components'];
    const files: string[] = [];
    const walk = (dir: string) => {
      for (const entry of readdirSync(dir, { withFileTypes: true })) {
        const full = join(dir, entry.name);
        if (entry.isDirectory()) walk(full);
        else if (entry.name.endsWith('.vue')) files.push(full);
      }
    };
    for (const r of roots) walk(join(__dirname, '..', r));
    const offenders: string[] = [];
    for (const f of files) {
      const body = readFileSync(f, 'utf-8');
      const tagRe = /<HumanConfirmCard[\s\n>]/g;
      let hit: RegExpExecArray | null;
      while ((hit = tagRe.exec(body)) !== null) {
        const idx = hit.index;
        // 标签末尾要找「行首缩进 + />」，直接 indexOf('/>') 会命中属性值里的斜杠
        const rest = body.slice(idx);
        const m = /\n\s*\/>/.exec(rest);
        const tag = rest.slice(0, m ? m.index + m[0].length : 900);
        if (!tag.includes('@dismiss')) offenders.push(f.split('/src/renderer/')[1] || f);
      }
    }
    expect(offenders, `这些地方的确认卡没接 @dismiss，点「取消」不会有反应：${offenders.join(', ')}`).toEqual([]);
  });
});
