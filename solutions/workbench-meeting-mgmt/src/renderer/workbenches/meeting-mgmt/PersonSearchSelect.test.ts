// @vitest-environment happy-dom
/**
 * 统一选人框：按姓名 / 拼音（全拼、首字母）/ 部门搜索，键盘 ↑↓ 回车 Esc，v-model，
 * 只列 / 不列、置顶一组（带备注）、非员工选项、清除、禁用；下拉层在 body 里不被父容器裁掉。
 */
import { afterEach, describe, expect, it, vi } from 'vitest';
import { flushPromises, mount, type VueWrapper } from '@vue/test-utils';
import { defineComponent, h, ref } from 'vue';
import PersonSearchSelect from './PersonSearchSelect.vue';
import { clearPeopleCache, type MmPeople } from './meetingUi';

const $t = (s: string, args?: Record<string, unknown>) => s.replace(/\{(\w+)\}/g, (_, k) => String(args?.[k] ?? k));

const PEOPLE: MmPeople = {
  depts: [{ id: 'd1', name: '研发部', leaderIds: [] }, { id: 'd2', name: '采购部', leaderIds: [] }],
  people: [
    { id: 'u1', name: '张三', deptId: 'd1', title: '总监' },
    { id: 'u2', name: '李四', deptId: 'd1' },
    { id: 'u3', name: '王小明', deptId: 'd2' },
    { id: 'u4', name: '赵离职', deptId: 'd2', left: true },
  ],
};

let wrappers: VueWrapper[] = [];
afterEach(() => {
  wrappers.forEach((w) => w.unmount());
  wrappers = [];
  document.body.innerHTML = '';
  delete (window as any).electronAPI;
  clearPeopleCache();
});

/** 包一层父组件，测 v-model 真的回写 */
function mountPicker(props: Record<string, unknown> = {}, initial = '') {
  const value = ref(initial);
  const changes: string[] = [];
  const Host = defineComponent({
    setup: () => () => h(PersonSearchSelect as any, {
      modelValue: value.value, people: PEOPLE, dataTest: 'pk', ...props,
      'onUpdate:modelValue': (v: string) => { value.value = v; },
      onChange: (v: string) => changes.push(v),
    }),
  });
  const w = mount(Host, { global: { mocks: { $t } }, attachTo: document.body });
  wrappers.push(w);
  return { w, value, changes };
}
const input = (w: VueWrapper) => w.find('[data-test="pk"]');
const names = () => [...document.body.querySelectorAll('[data-test^="pk-opt-"] .mm-pss-pop__name')].map((e) => e.textContent);
const groups = () => [...document.body.querySelectorAll('.mm-pss-pop__group')].map((e) => e.textContent);
async function open(w: VueWrapper) { await input(w).trigger('focus'); await flushPromises(); }
async function type(w: VueWrapper, q: string) { await input(w).setValue(q); await flushPromises(); }

describe('PersonSearchSelect', () => {
  it('聚焦打开：按部门分组列在职人员（离职的不列），下拉层挂在 body 上', async () => {
    const { w } = mountPicker();
    expect(document.body.querySelector('[data-test="pk-list"]')).toBeNull();
    await open(w);
    const list = document.body.querySelector('[data-test="pk-list"]') as HTMLElement;
    expect(list.parentElement).toBe(document.body);
    expect(list.style.position).toBe('fixed');
    expect(groups()).toEqual(['研发部', '采购部']);
    expect(names()).toEqual(['张三', '李四', '王小明']);
    expect(document.body.querySelector('[data-test="pk-opt-u1"]')!.textContent).toContain('研发部 · 总监');
  });

  it('按姓名、部门、职务搜索；多个词同时满足', async () => {
    const { w } = mountPicker();
    await open(w);
    await type(w, '小明');
    expect(names()).toEqual(['王小明']);
    await type(w, '采购');
    expect(names()).toEqual(['王小明']);
    await type(w, '总监');
    expect(names()).toEqual(['张三']);
    await type(w, '研发 李');
    expect(names()).toEqual(['李四']);
    await type(w, '不存在');
    expect(names()).toEqual([]);
    expect(document.body.querySelector('.mm-pss-pop__empty')!.textContent).toContain('没有找到「不存在」');
  });

  it('按拼音搜索：全拼和首字母都行（拼音库按需加载）', async () => {
    const { w } = mountPicker();
    await open(w);
    await vi.waitFor(async () => { await type(w, 'wxm'); expect(names()).toEqual(['王小明']); });
    await type(w, 'zhangsan');
    expect(names()).toEqual(['张三']);
    await type(w, 'ls');
    expect(names()).toEqual(['李四']);
  });

  it('点选回写 v-model 并关掉；选中后框里显示名字和部门', async () => {
    const { w, value, changes } = mountPicker();
    await open(w);
    (document.body.querySelector('[data-test="pk-opt-u3"]') as HTMLElement).click();
    await flushPromises();
    expect(value.value).toBe('u3');
    expect(changes).toEqual(['u3']);
    expect(document.body.querySelector('[data-test="pk-list"]')).toBeNull();
    expect(w.find('[data-test="pk-value"]').text()).toContain('王小明');
    expect(w.find('[data-test="pk-value"]').text()).toContain('采购部');
  });

  it('键盘：↓↑ 移动、回车选中、Esc 关掉不改值；打开时停在当前选中的人', async () => {
    const { w, value } = mountPicker({}, 'u2');
    await open(w);
    expect(document.body.querySelector('.mm-pss-pop__opt.active')!.textContent).toContain('李四');
    await input(w).trigger('keydown', { key: 'ArrowDown' });
    expect(document.body.querySelector('.mm-pss-pop__opt.active')!.textContent).toContain('王小明');
    await input(w).trigger('keydown', { key: 'ArrowUp' });
    await input(w).trigger('keydown', { key: 'ArrowUp' });
    expect(document.body.querySelector('.mm-pss-pop__opt.active')!.textContent).toContain('张三');
    await input(w).trigger('keydown', { key: 'Escape' });
    expect(document.body.querySelector('[data-test="pk-list"]')).toBeNull();
    expect(value.value).toBe('u2');
    await input(w).trigger('keydown', { key: 'ArrowDown' }); // 关着时 ↓ 打开
    await flushPromises();
    await type(w, '张');
    await input(w).trigger('keydown', { key: 'Enter' });
    await flushPromises();
    expect(value.value).toBe('u1');
  });

  it('只列 / 不列；置顶一组（名单里没有的人用 names 兜底）带灰字备注', async () => {
    const a = mountPicker({ only: ['u1', 'u3'] });
    await open(a.w);
    expect(names()).toEqual(['张三', '王小明']);
    a.w.unmount(); document.body.innerHTML = '';
    const b = mountPicker({ exclude: ['u1'], pinned: ['u3', 'gone'], pinnedLabel: '本场参会人', names: { gone: { name: '外部顾问', deptName: '合作方' } }, hint: (id: string) => (id === 'u3' ? '（已指认给 S2）' : '') });
    await open(b.w);
    expect(groups()).toEqual(['本场参会人', '研发部']);
    expect(names()).toEqual(['王小明', '外部顾问', '李四']);
    expect(document.body.querySelector('[data-test="pk-opt-u3"] em')!.textContent).toBe('（已指认给 S2）');
    expect(document.body.querySelector('[data-test="pk-opt-gone"]')!.textContent).toContain('合作方');
  });

  it('非员工选项（发言人标签）排最前，值原样回写', async () => {
    const { w, value } = mountPicker({ extras: [{ value: 'label:S2', label: '赵磊（S2）', sub: '运营中心' }], extrasLabel: '本场发言人' }, 'label:S2');
    expect(w.find('[data-test="pk-value"]').text()).toContain('赵磊（S2）');
    await open(w);
    expect(groups()[0]).toBe('本场发言人');
    (document.body.querySelector('[data-test="pk-opt-u2"]') as HTMLElement).click();
    await flushPromises();
    expect(value.value).toBe('u2');
  });

  it('可清除；禁用时点不开', async () => {
    const a = mountPicker({ clearable: true }, 'u1');
    await a.w.find('[data-test="pk-clear"]').trigger('click');
    expect(a.value.value).toBe('');
    a.w.unmount(); document.body.innerHTML = '';
    const b = mountPicker({ disabled: true }, 'u1');
    expect(input(b.w).attributes('disabled')).toBeDefined();
    await b.w.find('.mm-pss').trigger('mousedown');
    await flushPromises();
    expect(document.body.querySelector('[data-test="pk-list"]')).toBeNull();
  });

  it('没传 people：用 people.list 的缓存；已选的人一挂上就显示名字', async () => {
    const invoke = vi.fn(async (action: string) => (action === 'people.list' ? PEOPLE : null));
    (window as any).electronAPI = { workbenches: { meetingMgmt: { invoke, onEvent: () => () => {} } } };
    const { w } = mountPicker({ people: undefined }, 'u2');
    await flushPromises();
    expect(w.find('[data-test="pk-value"]').text()).toContain('李四');
    await open(w);
    expect(names()).toEqual(['张三', '李四', '王小明']);
    expect(invoke.mock.calls.filter((c) => c[0] === 'people.list').length).toBe(1);
  });
});
