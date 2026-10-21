// @vitest-environment happy-dom
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
vi.mock('../../i18n', () => ({ t: (s: string) => s }));
import PyExtInstaller from './PyExtInstaller.vue';
const item = { id: 'sdk', label: 'SDK', group: 'digital-human', spec: 'sdk', installed: true };
const global = { mocks: { $t: (s: string) => s } };
beforeEach(() => { (window as any).electronAPI = {}; });
describe('扩展失败反馈', () => {
  it('缺失接口不伪装成空分组，刷新失败可重试', async () => {
    const w = mount(PyExtInstaller, { global }); await flushPromises();
    expect(w.text()).toContain('运行时扩展接口不可用');
    (window as any).electronAPI.pyExt = { list: vi.fn().mockResolvedValue({ items: [item] }) };
    await w.find('.pyext-refresh').trigger('click'); await flushPromises();
    expect(w.find('[role="alert"]').exists()).toBe(false); expect(w.text()).toContain('SDK'); w.unmount();
  });
  it.each([false, true])('卸载失败保留安装态，显示业务错误或异常（reject=%s）', async (reject) => {
    const remove = reject ? vi.fn().mockRejectedValue(new Error('denied')) : vi.fn().mockResolvedValue({ ok: false, error: 'denied' });
    (window as any).electronAPI.pyExt = { list: vi.fn().mockResolvedValue({ items: [item] }), remove };
    const w = mount(PyExtInstaller, { global }); await flushPromises();
    await w.find('.remove').trigger('click'); await flushPromises();
    expect(remove).toHaveBeenCalledWith('sdk'); expect(w.text()).toContain('denied'); expect(w.find('.pyext-badge.ok').exists()).toBe(true); w.unmount();
  });
});

/**
 * 按分组嵌进功能页时的显隐：分组真为 0 条 → 连折叠标题一起不渲染；加载完之前不渲染（不闪）；
 * 清单加载失败不算空（块留着给用户看错误、点刷新）；不带 group 的完整目录照常显示空态。
 */
describe('分组嵌入显隐', () => {
  const ocrOnlyOnWin = { ok: true, items: [item], pluginsDir: '/plugins' }; // 清单里只有别的分组，ocr 为 0 条
  const list = (r: unknown) => { (window as any).electronAPI.pyExt = { list: vi.fn().mockResolvedValue(r) }; };

  it('分组为空：整块（含 summary）不渲染，并 emit empty=true', async () => {
    list(ocrOnlyOnWin);
    const w = mount(PyExtInstaller, { global, props: { group: 'ocr', summary: '扫描文档识别组件（按需安装）' } }); await flushPromises();
    expect(w.find('details').exists()).toBe(false);
    expect(w.find('.pyext').exists()).toBe(false);
    expect(w.text()).toBe('');
    expect(w.emitted('empty')).toEqual([[true]]);
    w.unmount();
  });
  it('分组数组全空同样不渲染；有一条命中就渲染', async () => {
    list(ocrOnlyOnWin);
    const empty = mount(PyExtInstaller, { global, props: { group: ['ocr', 'nothing'] } }); await flushPromises();
    expect(empty.html()).not.toContain('pyext'); empty.unmount();
    const shown = mount(PyExtInstaller, { global, props: { group: ['ocr', 'digital-human'], summary: '安装所需组件' } }); await flushPromises();
    expect(shown.find('details.pyext-details').exists()).toBe(true);
    expect(shown.find('.pyext-summary-label').text()).toBe('安装所需组件');
    expect(shown.find('.pyext').text()).toContain('SDK');
    expect(shown.emitted('empty')).toEqual([[false]]);
    shown.unmount();
  });

  /**
   * 嵌入态不再重复「此功能需要的组件 / 可选依赖按需安装」：宿主已经说明了这块是什么。
   * 「刷新」留着 —— 有 summary 就挂在折叠标题行右侧且不连带折叠，没 summary 就单独一行。
   */
  it('带 summary 嵌入：无说明标题，「刷新」在标题行里且点击不触发折叠', async () => {
    list({ ok: true, items: [item] });
    const w = mount(PyExtInstaller, { global, props: { group: 'digital-human', summary: '安装所需组件' } }); await flushPromises();
    expect(w.find('.pyext-title').exists()).toBe(false);
    expect(w.find('.pyext-sub').exists()).toBe(false);
    expect(w.find('.pyext-head').exists()).toBe(false);
    expect(w.text()).not.toContain('此功能需要的组件');
    expect(w.text()).not.toContain('可选依赖按需安装');
    const refresh = w.find('summary .pyext-refresh');
    expect(refresh.exists()).toBe(true);
    const ev = new MouseEvent('click', { bubbles: true, cancelable: true });
    refresh.element.dispatchEvent(ev);
    expect(ev.defaultPrevented).toBe(true); // 不 prevent 的话 <summary> 会把这次点击当成展开/收起
    await flushPromises();
    expect((window as any).electronAPI.pyExt.list).toHaveBeenCalledTimes(2); // 挂载一次 + 刷新一次
    w.unmount();
  });
  it('只带 group 不带 summary 嵌入（数字人工作台）：无说明标题，只留一行「刷新」', async () => {
    list({ ok: true, items: [item] });
    const w = mount(PyExtInstaller, { global, props: { group: 'digital-human' } }); await flushPromises();
    expect(w.find('details').exists()).toBe(false);
    expect(w.find('.pyext-title').exists()).toBe(false);
    expect(w.find('.pyext-sub').exists()).toBe(false);
    expect(w.find('.pyext-head.bare .pyext-refresh').exists()).toBe(true);
    w.unmount();
  });
  it('清单还没回来之前不渲染（不先闪标题再消失）', async () => {
    (window as any).electronAPI.pyExt = { list: vi.fn(() => new Promise(() => { /* 永不 resolve */ })) };
    const w = mount(PyExtInstaller, { global, props: { group: 'ocr', summary: '扫描文档识别组件（按需安装）' } }); await flushPromises();
    expect(w.find('details').exists()).toBe(false);
    expect(w.text()).toBe('');
    expect(w.emitted('empty')).toBeUndefined();
    w.unmount();
  });
  it.each([
    ['主进程回 ok:false', { ok: false, items: [], message: '依赖安装器未就绪' }],
    ['接口缺失', undefined],
  ])('清单加载失败不算空（%s）：块留着显示错误和刷新，emit empty=false', async (_name, r) => {
    if (r) list(r); // undefined → 不挂 pyExt，走「运行时扩展接口不可用」
    const w = mount(PyExtInstaller, { global, props: { group: 'ocr', summary: '扫描文档识别组件（按需安装）' } }); await flushPromises();
    expect(w.find('details').exists()).toBe(true);
    expect(w.find('.pyext-summary-label').text()).toBe('扫描文档识别组件（按需安装）');
    expect(w.find('[role="alert"]').text()).toContain(r ? '依赖安装器未就绪' : '运行时扩展接口不可用');
    expect(w.find('.pyext-refresh').exists()).toBe(true);
    expect(w.emitted('empty')).toEqual([[false]]);
    // 修好后点刷新：分组真空 → 这时才藏
    list(ocrOnlyOnWin);
    await w.find('.pyext-refresh').trigger('click'); await flushPromises();
    expect(w.find('details').exists()).toBe(false);
    expect(w.emitted('empty')).toEqual([[false], [true]]);
    w.unmount();
  });
  it('不带 group 的完整目录：空清单照常显示空态，不藏', async () => {
    list({ ok: true, items: [] });
    const w = mount(PyExtInstaller, { global }); await flushPromises();
    expect(w.find('.pyext').exists()).toBe(true);
    expect(w.find('details').exists()).toBe(false); // 没传 summary 就不带折叠外壳
    expect(w.find('.pyext-title').text()).toBe('此功能需要的组件'); // 完整目录保留说明标题
    expect(w.find('.pyext-sub').exists()).toBe(true);
    expect(w.text()).toContain('当前分组无可选依赖');
    expect(w.emitted('empty')).toEqual([[true]]);
    w.unmount();
  });
  it('宿主的 class / style 落在折叠外壳上（卡片样式靠它）', async () => {
    list({ ok: true, items: [item] });
    const w = mount(PyExtInstaller, { global, props: { group: 'digital-human', summary: '安装所需组件' }, attrs: { class: 'sp-card tight', style: 'margin-top: 16px' } }); await flushPromises();
    const root = w.find('details');
    expect(root.classes()).toEqual(expect.arrayContaining(['sp-card', 'tight', 'pyext-details']));
    expect(root.attributes('style')).toContain('margin-top: 16px');
    w.unmount();
  });
});
