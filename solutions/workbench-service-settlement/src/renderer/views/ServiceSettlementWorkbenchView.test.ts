/**
 * 服务商结算工作台 · 结构护栏。
 *
 * 需求文档《智能体 8.21》把四个模块写成明确的步骤（4 / 5 / 4 / 11 步），
 * docs/solution-workbench-ux-guidelines.md 又要求「一定要分步骤」「进度条一定要在可视范围内」。
 * 这里钉住：每个模块的步骤数与需求一致、每步都有独立状态卡、进度条是 sticky 的。
 * 改步骤数之前先对照需求文档——少一步就是漏做需求，多一步就是自作主张。
 */
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const DIR = join(__dirname, '..', 'workbenches', 'service-settlement');
const read = (f: string) => readFileSync(join(DIR, f), 'utf-8');

const MODULES: { file: string; steps: number }[] = [
  // 5 步：f666b82c 按客户要求把「计算京东安装评价率」从「核算」里拆出来单独成步
  // （评价率 = 完工中好评价量 ÷ 完工总单量，分母来源要单独选），这张表当时漏了同步。
  { file: 'ReviewIncentiveModule.vue', steps: 5 },
  { file: 'SettlementModule.vue', steps: 5 },
  { file: 'ScrapLedgerModule.vue', steps: 4 },
  { file: 'MarketingIncentiveModule.vue', steps: 11 },
];

function stepMetaCount(src: string): number {
  const start = src.indexOf('useSteps([');
  const end = src.indexOf(']);', start);
  const block = src.slice(start, end);
  return (block.match(/\{\s*key:\s*'/g) || []).length;
}

describe('四个模块的步骤数与需求文档一致', () => {
  for (const m of MODULES) {
    it(`${m.file} 定义 ${m.steps} 步，且每步都有独立 StepCard`, () => {
      const src = read(m.file);
      expect(stepMetaCount(src), `${m.file} 的 useSteps 步骤数不对`).toBe(m.steps);
      const cards = (src.match(/<StepCard\b/g) || []).length;
      expect(cards, `${m.file} 的 StepCard 数量要等于步骤数`).toBe(m.steps);
      expect(src, `${m.file} 缺粘性进度条`).toContain('<StickyProgress');
    });
  }
});

describe('进度条一定在视口内（规则二）', () => {
  const src = read('StickyProgress.vue');
  it('StickyProgress 根节点 position: sticky 且贴顶', () => {
    const style = src.slice(src.indexOf('<style'));
    expect(style).toMatch(/\.ss-progress\s*\{[^}]*position:\s*sticky/);
    expect(style).toMatch(/\.ss-progress\s*\{[^}]*top:\s*0/);
  });
  it('步骤卡失败态把错误原因写在这一步上（规则一）', () => {
    const card = read('StepCard.vue');
    expect(card).toContain("runtime.state === 'failed' && runtime.error");
  });
});

describe('小白输入：文件一律拖拽 / 点选，不让人手填路径', () => {
  it('四个模块都用 FileDropField，没有裸的路径文本框', () => {
    for (const m of MODULES) {
      const src = read(m.file);
      expect(src, `${m.file} 应使用 FileDropField`).toContain('<FileDropField');
      expect(src, `${m.file} 不该让用户手填文件路径`).not.toMatch(/placeholder="[^"]*(路径|path)[^"]*"/i);
    }
  });
});

describe('视图壳', () => {
  const view = readFileSync(join(__dirname, 'ServiceSettlementWorkbenchView.vue'), 'utf-8');
  it('四个模块用 v-show 保活（切 tab 不丢已选文件与结果）', () => {
    expect((view.match(/v-show="activeModule === '/g) || []).length).toBe(4);
  });
  it('主进程事件监听接住退订并在卸载时调用', () => {
    expect(view).toMatch(/unsubEvent\s*=\s*a\.onEvent\(/);
    expect(view).toContain('onBeforeUnmount(() => { unsubEvent?.();');
  });
});

describe('第二轮审查回归（源码断言）', () => {
  it('结算模块：结算期变化要重建步骤态（watch(period)）', () => {
    const src = read('SettlementModule.vue');
    expect(src).toMatch(/watch\(period,/);
    expect(src).toContain('restoreFromRecords()');
  });
  it('报废模块：移除附件后合并/匹配结果作废', () => {
    const src = read('ScrapLedgerModule.vue');
    const at = src.indexOf('function removePath');
    expect(at).toBeGreaterThan(0);
    // 直接 resetAfter，或经 invalidate('source')（内部 steps.resetAfter(from)）作废，两种写法都算
    expect(src.slice(at, at + 400)).toMatch(/steps\.resetAfter\('source'\)|invalidate\('source'\)/);
    expect(src).toMatch(/function invalidate[\s\S]{0,300}steps\.resetAfter\(from\)/);
  });
  it('内置浏览器用 agent 来源打开（否则侧栏关着时 tab 不可见）', () => {
    const src = read('shared.ts');
    expect(src).toContain("source: 'agent'");
    expect(src).not.toContain("source: 'user'");
  });
  it('步骤滚动只找可见模块里的卡片（四模块 step key 会重名）', () => {
    const src = read('shared.ts');
    expect(src).toContain('offsetParent !== null');
  });
});
