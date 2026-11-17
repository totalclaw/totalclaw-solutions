// @vitest-environment happy-dom
import { afterEach, describe, expect, it, vi } from 'vitest';
import { flushPromises, mount, type VueWrapper } from '@vue/test-utils';
import { createPinia } from 'pinia';
import { routeLocationKey, routerKey } from 'vue-router';
import MeetingMgmtWorkbenchView from '../../views/MeetingMgmtWorkbenchView.vue';
import { mmBoot, mmNav } from './shared';
import { operatorAdminId } from './meetingUi';

const $t = (s: string, args?: Record<string, unknown>) => s.replace(/\{(\w+)\}/g, (_, k) => String(args?.[k] ?? k));

function boot(personId: string, name: string, isAdmin: boolean, over: Record<string, unknown> = {}) {
  return {
    me: { person: { id: personId, name, deptId: 'd1' }, isAdmin, canCreateProject: isAdmin },
    org: { source: 'demo', deptCount: 6, peopleCount: 20 },
    settings: { adminIds: ['u1'], projectCreatorIds: [], confirmTimeoutHours: 24, dueRemindDays: 1, trackCycleDays: 7, reportCycleDays: 7, wecom: { corpId: '', agentId: '', hasSecret: false }, ai: { asr: 'local', voiceprintThreshold: 0.5 } },
    wecomConnected: true, mobile: { running: false }, badges: { home: 7, meetings: 2, tasks: 3 }, ...over,
  };
}
const home = (name: string, ownerName = '') => ({
  me: { person: { id: 'x', name, deptId: 'd1' }, isAdmin: false, canCreateProject: false }, greetingName: name,
  counts: { todos: 0, dueToday: 0, overdue: 0, unread: 0 }, todos: [], myTasksThisWeek: [], recentMeetings: [], notices: [],
  projects: ownerName ? [{ id: 'p1', name: 'A2', status: 'active', done: 0, total: 0, overdue: 0, ownerName }] : [],
});

let wrappers: VueWrapper[] = [];
function setup(handlers: Record<string, (p: any) => unknown>) {
  const calls: Array<[string, any]> = [];
  const invoke = vi.fn(async (action: string, payload: any) => {
    calls.push([action, payload]);
    const fn = handlers[action];
    if (!fn) throw new Error(`unexpected action ${action}`);
    return fn(payload);
  });
  (window as any).electronAPI = { workbenches: { meetingMgmt: { invoke, onEvent: () => () => {} } } };
  return calls;
}
function mountShell() {
  const w = mount(MeetingMgmtWorkbenchView, { global: { plugins: [createPinia()], mocks: { $t }, provide: { [routerKey as symbol]: { push: vi.fn(), back: vi.fn() }, [routeLocationKey as symbol]: { path: '/workbenches/meeting-mgmt', params: {}, query: {} } } } });
  wrappers.push(w);
  return w;
}
afterEach(() => {
  wrappers.forEach((w) => w.unmount());
  wrappers = [];
  delete (window as any).electronAPI;
  mmBoot.value = null;
  mmNav.value = { tab: 'home', seq: 0 };
  operatorAdminId.value = '';
  try { localStorage.clear(); } catch { /* 忽略 */ }
  vi.restoreAllMocks();
});

describe('会议智能管理外壳', () => {
  it('标题、企微状态、页签与红色角标；身份胶囊按首页上下文显示角色', async () => {
    setup({ boot: () => boot('u1', '林晓', true), 'home.get': () => home('林晓', '林晓') });
    const w = mountShell();
    await flushPromises();
    expect(w.text()).toContain('泰途会议智能管理');
    expect(w.find('[data-test="mm-wecom"]').text()).toBe('企微已连接');
    expect(w.find('[data-test="mm-tab-home"]').text()).toContain('7');
    expect(w.find('[data-test="mm-tab-meetings"]').text()).toContain('2');
    expect(w.find('[data-test="mm-tab-tasks"]').text()).toContain('3');
    expect(w.find('[data-test="mm-tab-settings"]').exists()).toBe(true);
    expect(w.find('[data-test="mm-identity"]').text()).toContain('项目负责人 · 林晓');
  });

  it('不是管理员：看不到系统设置，身份不能切', async () => {
    setup({ boot: () => boot('u2', '赵磊', false, { wecomConnected: false }), 'home.get': () => home('赵磊') });
    const w = mountShell();
    await flushPromises();
    expect(w.find('[data-test="mm-tab-settings"]').exists()).toBe(false);
    expect(w.find('[data-test="mm-wecom"]').text()).toBe('未连接企微');
    await w.find('[data-test="mm-identity"]').trigger('click');
    expect(w.find('[data-test="mm-identity-panel"]').exists()).toBe(false);
  });

  it('管理员切换身份：调 identity.set 后刷新 boot', async () => {
    let current = boot('u1', '林晓', true);
    const calls = setup({
      boot: () => current,
      'home.get': () => home(current.me.person.name),
      'people.list': () => ({ depts: [{ id: 'd1', name: '研发部', leaderIds: [] }], people: [{ id: 'u1', name: '林晓', deptId: 'd1' }, { id: 'u2', name: '赵磊', deptId: 'd1' }] }),
      'identity.set': (p: any) => { current = boot(p.personId, '赵磊', false); return current.me; },
    });
    const w = mountShell();
    await flushPromises();
    await w.find('[data-test="mm-identity"]').trigger('click');
    await flushPromises();
    await w.find('[data-test="mm-identity-u2"]').trigger('click');
    await flushPromises();
    expect(calls.find((c) => c[0] === 'identity.set')?.[1]).toEqual({ personId: 'u2' });
    expect(w.find('[data-test="mm-identity"]').text()).toContain('赵磊');
    expect(w.find('[data-test="mm-tab-settings"]').exists()).toBe(false);
  });

  it('还没有组织人员：管理员可以载入演示数据', async () => {
    let current = boot('u1', '林晓', true, { org: { source: 'none', deptCount: 0, peopleCount: 0 } });
    const calls = setup({ boot: () => current, 'home.get': () => home('林晓'), 'demo.load': () => { current = boot('u1', '林晓', true); return { ok: true }; } });
    const w = mountShell();
    await flushPromises();
    await w.find('[data-test="mm-demo-load"]').trigger('click');
    await flushPromises();
    expect(calls.map((c) => c[0])).toContain('demo.load');
    expect(w.find('[data-test="mm-no-org"]').exists()).toBe(false);
  });

  it('通讯录换了、当前身份不在里面：一进来就弹配置引导，第一屏是「你是哪一位」，选完就能用', async () => {
    let picked = '';
    const calls = setup({
      boot: () => (picked
        ? boot('ZhangSan', '张三', true, { org: { source: 'wecom', deptCount: 1, peopleCount: 7 }, canSwitchIdentity: true })
        : { ...boot('x', 'x', false, { org: { source: 'wecom', deptCount: 1, peopleCount: 7 }, canSwitchIdentity: true }), me: { person: null, isAdmin: false, canCreateProject: false } }),
      'setup.status': () => { if (!picked) throw new Error('当前身份无效，请先选择身份'); return null; },
      'people.list': () => ({ depts: [{ id: '1', name: '总部' }], people: [{ id: 'ZhangSan', name: '张三', deptId: '1' }] }),
      'identity.set': (p: any) => { picked = p.personId; return {}; },
      'home.get': () => home('张三'),
      'mobile.status': () => ({ running: false }),
    });
    const w = mountShell();
    await flushPromises();
    expect(w.find('[data-test="mm-setup"]').exists()).toBe(true);
    expect(w.find('[data-test="mm-setup-identity"]').text()).toContain('你是哪一位');
    await w.find('[data-test="mm-setup-me-ZhangSan"]').trigger('click');
    await flushPromises();
    expect(calls.some(([a, p]) => a === 'identity.set' && p.personId === 'ZhangSan')).toBe(true);
    expect(w.find('[data-test="mm-setup-identity"]').exists()).toBe(false);
  });

  it('boot 失败显示中文原因和重试', async () => {
    setup({ boot: () => { throw new Error("Error invoking remote method 'x': 数据目录不可写"); } });
    const w = mountShell();
    await flushPromises();
    expect(w.text()).toContain('数据目录不可写');
  });
});
