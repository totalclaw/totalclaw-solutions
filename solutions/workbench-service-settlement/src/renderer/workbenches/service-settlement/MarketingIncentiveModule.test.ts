// @vitest-environment happy-dom
import { it, expect, vi } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import { createPinia } from 'pinia';
import Component from './MarketingIncentiveModule.vue';
it('抽取草稿不自动覆盖规则，核对后才应用且标注保留设置', async () => {
  const extract = vi.fn(async () => ({ reviewRevision: 1, draft: { managerMinRate: 0.88, performanceCoefficients: { 优秀: 1.1, 合格: 0 } }, extracted: ['managerMinRate', 'performanceCoefficients'], missing: ['auxTiers'], evidence: [{ field: 'managerMinRate', file: 1, page: 1, quote: '区域经理最低完成率88%后才能获得奖励。' }], source: '经理政策.pdf', error: '' }));
  (window as any).electronAPI = { workbenches: { serviceSettlement: { statePatch: vi.fn(async () => ({ ok: true })), marketingRulesFromPdf: extract } } };
  const w = mount(Component, { props: { state: { marketing: { rulesPdfPaths: ['/经理政策.pdf', '/补充.pdf'], rules: { source: '原有设置' } } } }, global: { plugins: [createPinia()], mocks: { $t: (s: string, args?: any) => s.replace(/\{(\w+)\}/g, (_, k) => String(args?.[k] ?? k)) } } });
  const button = (text: string) => w.findAll('button').find(b => b.text().includes(text))!;
  await button('读取全部 PDF').trigger('click'); await flushPromises();
  expect(extract).toHaveBeenCalledWith({ paths: ['/经理政策.pdf', '/补充.pdf'] });
  expect(w.text()).toContain('待核对草稿（尚未应用）');
  expect(w.text()).toContain('规则（来源：原有设置）');
  expect(w.text()).toContain('区域经理最低完成率88%');
  await button('已核对，仅应用').trigger('click'); await flushPromises();
  expect(w.text()).not.toContain('待核对草稿（尚未应用）');
  expect(w.text()).toContain('原有设置；已核对补充：经理政策.pdf');
  expect((w.vm as any).rulesPayload().performanceCoefficients).toEqual({ 优秀: 1.1, 合格: 0 });
  w.unmount();
});
it('抽取失败后，必须明确确认手工核对才能解除阻止计算状态', async () => {
  (window as any).electronAPI = { workbenches: { serviceSettlement: { statePatch: vi.fn(async () => ({ ok: true })), marketingRulesFromPdf: vi.fn(async () => ({ reviewRevision: 1, error: '扫描表格无法确认' })) } } };
  const w = mount(Component, { props: { state: { marketing: { rulesPdfPaths: ['/政策.pdf'], rules: { source: '旧设置' } } } }, global: { plugins: [createPinia()], mocks: { $t: (s: string, args?: any) => s.replace(/\{(\w+)\}/g, (_, k) => String(args?.[k] ?? k)) } } });
  const button = (text: string) => w.findAll('button').find(b => b.text().includes(text))!;
  await button('读取全部 PDF').trigger('click'); await flushPromises();
  expect(w.find('.ss-error-banner').exists()).toBe(true);
  expect((w.vm as any).rulesPayload().source).toBe('旧设置');
  await button('已对照原件核对下方全部规则').trigger('click'); await flushPromises();
  expect(w.find('.ss-error-banner').exists()).toBe(false);
  expect((w.vm as any).rulesPayload().source).toBe('手工核对：政策.pdf');
  w.unmount();
});
it('重新打开未核对工作台仍阻止计算；确认保存失败不能解锁', async () => {
  const compute = vi.fn();
  const save = vi.fn(async () => { throw new Error('政策批次已变化'); });
  (window as any).electronAPI = { workbenches: { serviceSettlement: { marketingCompute: compute, statePatch: save } } };
  const w = mount(Component, { props: { state: { marketing: { rulesReviewPending: true, rulesReviewRevision: 7, rulesPdfPaths: ['/政策.pdf'], rules: { source: '旧设置' } } } }, global: { plugins: [createPinia()], mocks: { $t: (s: string, args?: any) => s.replace(/\{(\w+)\}/g, (_, k) => String(args?.[k] ?? k)) } } });
  await (w.vm as any).computeInitial();
  expect(compute).not.toHaveBeenCalled();
  expect(w.text()).toContain('重新打开工作台不会解除');
  await (w.vm as any).confirmManualRules(); await flushPromises();
  expect(save).toHaveBeenCalledWith({ marketing: expect.objectContaining({ rulesReviewed: true, reviewedRevision: 7 }) });
  await (w.vm as any).computeInitial();
  expect(compute).not.toHaveBeenCalled();
  expect((w.vm as any).rulesPayload().source).toBe('旧设置');
  w.unmount();
});

it('绩效系数被清空时必须报错阻断，绝不悄悄当成 0（那会让该等级经理激励全部归零）', async () => {
  (window as any).electronAPI = { workbenches: { serviceSettlement: { statePatch: vi.fn(async () => ({ ok: true })) } } };
  const w = mount(Component, { props: { state: { marketing: { rules: { source: '原有设置' } } } }, global: { plugins: [createPinia()], mocks: { $t: (s: string, args?: any) => s.replace(/\{(\w+)\}/g, (_, k) => String(args?.[k] ?? k)) } } });
  const vm = w.vm as any;
  // 数字 0 是合法的（该等级就是不发奖金），必须照常通过。
  vm.rules.coefficients = [{ grade: 'A', value: 1.2 }, { grade: 'B', value: 0 }];
  expect(vm.rulesPayload().performanceCoefficients).toEqual({ A: 1.2, B: 0 });
  // 输入框被清空时 v-model.number 给的是空串 —— 这是「没填」，不是 0。
  vm.rules.coefficients = [{ grade: 'A', value: 1.2 }, { grade: 'B', value: '' }];
  expect(() => vm.rulesPayload()).toThrow(/绩效系数.*B.*没有填数值/);
  // 非数字与负数同样挡住。
  vm.rules.coefficients = [{ grade: 'B', value: 'abc' }];
  expect(() => vm.rulesPayload()).toThrow(/不是有效数字/);
  vm.rules.coefficients = [{ grade: 'B', value: -1 }];
  expect(() => vm.rulesPayload()).toThrow(/不能是负数/);
  w.unmount();
});
