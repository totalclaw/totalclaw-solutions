/**
 * 工作流引擎占位符（${projectName} / ${requirement} / ${node_pm_result} …）在三种界面语言下都要原样留在提示词里：
 * 译文经 vue-i18n 编译时 {xxx} 会被当成命名参数，没传值就被吃成空（英文 / 阿语下曾变成「$/$/」）。
 */
import { describe, expect, it, vi } from 'vitest';

describe('研发工作流提示词：引擎占位符不被翻译吃掉', () => {
  it.each(['zh-CN', 'en-US', 'ar'])('%s', async (loc) => {
    vi.resetModules();
    const { i18n } = await import('../i18n');
    (i18n.global.locale as any).value = loc;
    const { buildRdWorkflow } = await import('./rdWorkflow');
    const wf = buildRdWorkflow();
    const text = JSON.stringify(wf.nodes.map((n: any) => n.config));
    for (const v of ['${projectName}', '${requirement}', '${outputDir}', '${node_pm_result}']) expect(text).toContain(v);
    expect(text).not.toMatch(/\$\/\$\//);
  });
});
