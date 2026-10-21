/**
 * 按钮行不许顶破卡片（2026-08-06 用户第 N 次反馈「这怎么还超出？」）。
 *
 * 复发原因固定：动作行是 flex 但没写 flex-wrap，行内按钮又统一 `flex: 0 0 auto`
 * ——两者叠加后容器的 min-content 宽度 = 所有按钮宽度之和，永远压不下去，
 * 面板一窄就横向溢出。发布按钮还会在运行时换成更长的阶段文案（「正在生成
 * 发布文案… 1:05」），把这个临界点进一步提前。
 *
 * 所以约束两条：动作行必须能换行；发布按钮的文字必须能省略。
 */
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const SRC = readFileSync(join(__dirname, 'VideoStudioView.vue'), 'utf-8');
const STYLE = SRC.slice(SRC.indexOf('<style'));

/** 取某个类选择器的规则体（单行 CSS 写法，本文件通用）。 */
function ruleOf(selector: string): string {
  const idx = STYLE.indexOf(`\n${selector} {`);
  expect(idx, `找不到样式规则 ${selector}`).toBeGreaterThan(0);
  const start = idx + selector.length + 3;
  return STYLE.slice(start, STYLE.indexOf('}', start));
}

/** 横向排按钮、且会被窄面板挤到的行。新增动作行请一并登记。 */
const ACTION_ROWS = ['.submit-bar', '.submit-actions', '.publish-confirm-actions', '.preview-actions'];

describe('动作行溢出护栏', () => {
  for (const selector of ACTION_ROWS) {
    it(`${selector} 必须允许换行`, () => {
      const rule = ruleOf(selector);
      expect(rule, `${selector} 不是 flex 行，护栏名单该更新了`).toContain('display: flex');
      expect(rule, `${selector} 缺 flex-wrap，窄面板下按钮会溢出卡片`).toMatch(/flex-wrap:\s*wrap/);
    });
  }

  it('阶段计时器必须在卸载时清理（否则写已销毁组件的 ref）', () => {
    const idx = SRC.indexOf('onBeforeUnmount(');
    expect(idx, '找不到 onBeforeUnmount').toBeGreaterThan(0);
    const block = SRC.slice(idx, SRC.indexOf('});', idx));
    expect(block, 'onBeforeUnmount 未清 publishStageTimer').toContain('publishStageTimer');
  });

  it('发布按钮的阶段文案必须可省略（运行时会变长）', () => {
    const rule = ruleOf('.publish-video-button > span');
    expect(rule, '缺省略号处理').toContain('text-overflow: ellipsis');
    expect(rule, '缺宽度上限').toMatch(/max-width:/);
    // 省略只在文字被单独包一层时才生效，模板里必须真的包了
    const tpl = SRC.slice(0, SRC.indexOf('<style'));
    const labels = tpl.match(/<span>\{\{ publishing && publishStageText/g) || [];
    expect(labels.length, '发布按钮文案未包 <span>，max-width 不会生效').toBeGreaterThanOrEqual(3);
  });
});
