// @vitest-environment happy-dom
import { afterEach, describe, expect, it, vi } from 'vitest';
import { flushPromises, mount, type VueWrapper } from '@vue/test-utils';
import { createPinia } from 'pinia';
import type { MmHomeView, MmMeeting, MmTodo } from '../../../shared/meetingMgmt/types';
import HomeTab from './HomeTab.vue';
import MeetingDetail from './MeetingDetail.vue';
import MeetingsTab from './MeetingsTab.vue';
import MobileAccessCard from './MobileAccessCard.vue';
import PushFailedList from './PushFailedList.vue';
import { mmBoot, mmNav, mmSettingsSection } from './shared';
import { clearPeopleCache, type MmMeetingDetail } from './meetingUi';

const $t = (s: string, args?: Record<string, unknown>) => s.replace(/\{(\w+)\}/g, (_, k) => String(args?.[k] ?? k));

type Handlers = Record<string, (p: any) => unknown>;
let wrappers: VueWrapper[] = [];
function setup(handlers: Handlers) {
  const calls: Array<[string, any]> = [];
  const invoke = vi.fn(async (action: string, payload: any) => {
    calls.push([action, payload]);
    const fn = handlers[action] ?? (action === 'mobile.status' ? () => ({ running: false }) : undefined);
    if (!fn) throw new Error(`unexpected action ${action}`);
    return fn(payload);
  });
  (window as any).electronAPI = { workbenches: { meetingMgmt: { invoke, onEvent: () => () => {} } } };
  return { calls, names: () => calls.map((c) => c[0]) };
}
/** 统一选人框（PersonSearchSelect）：聚焦打开下拉（Teleport 在 body 里），列出选项名 / 点选一项 */
async function openPicker(w: VueWrapper, dt: string): Promise<string[]> {
  await w.find(`[data-test="${dt}"]`).trigger('focus');
  await flushPromises();
  return [...document.body.querySelectorAll(`[data-test^="${dt}-opt-"] .mm-pss-pop__name`)].map((e) => e.textContent || '');
}
async function pickIn(w: VueWrapper, dt: string, value: string): Promise<void> {
  if (!document.body.querySelector(`[data-test="${dt}-list"]`)) await openPicker(w, dt);
  (document.body.querySelector(`[data-test="${dt}-opt-${value}"]`) as HTMLElement).click();
  await flushPromises();
}
function mountIt(component: any, props: Record<string, unknown> = {}) {
  const w = mount(component, { props, global: { plugins: [createPinia()], mocks: { $t } } });
  wrappers.push(w);
  return w;
}
function bootAs(personId: string, name: string, isAdmin = false) {
  mmBoot.value = {
    me: { person: { id: personId, name, deptId: 'd1' }, isAdmin, canCreateProject: isAdmin },
    org: { source: 'demo', deptCount: 6, peopleCount: 20 },
    settings: { adminIds: isAdmin ? [personId] : ['admin'], projectCreatorIds: [], confirmTimeoutHours: 24, dueRemindDays: 1, trackCycleDays: 7, reportCycleDays: 7, wecom: { corpId: '', agentId: '', hasSecret: false }, ai: { asr: 'local', voiceprintThreshold: 0.5 } },
    wecomConnected: true, mobile: { running: false }, badges: { home: 7, meetings: 2, tasks: 3 },
  };
}
afterEach(() => {
  wrappers.forEach((w) => w.unmount());
  wrappers = [];
  delete (window as any).electronAPI;
  mmBoot.value = null;
  mmNav.value = { tab: 'home', seq: 0 };
  vi.restoreAllMocks();
});

const todo = (id: string, type: MmTodo['type'], urgency: MmTodo['urgency'], group: MmTodo['group'] = 'meeting'): MmTodo => ({
  id, type, title: `T-${id}`, subtitle: `sub-${id}`, urgency, hint: urgency === 'urgent' ? '已等待 1 天' : undefined, link: { kind: group === 'task' ? 'task' : 'meeting', id: `obj-${id}` }, at: 1, group,
});
function homeView(over: Partial<MmHomeView> = {}): MmHomeView {
  return {
    me: { person: { id: 'u1', name: '林晓', deptId: 'd1' }, isAdmin: true, canCreateProject: true }, greetingName: '林晓',
    counts: { todos: 4, dueToday: 1, overdue: 1, unread: 1 },
    todos: [todo('a', 'arbitrate', 'urgent', 'task'), todo('b', 'confirm_speech', 'today'), todo('c', 'review_minutes', 'today'), todo('d', 'accept_task', 'week', 'task')],
    myTasksThisWeek: [], projects: [], recentMeetings: [],
    notices: [{ id: 'n1', at: Date.now() - 600_000, to: 'u1', type: 'arbitration_result', title: '裁决结果', summary: '按异议调整', link: { kind: 'task', id: 'tk1' }, read: false }],
    ...over,
  };
}

describe('首页 · 手机端卡片', () => {
  it('管理员：开启服务 → 显示局域网地址和本人专属链接二维码；停止后二维码消失', async () => {
    bootAs('u1', '林晓', true);
    let running = false;
    const env = setup({
      'mobile.status': () => (running ? { running, url: 'http://192.168.1.10:8280' } : { running }),
      'mobile.start': () => { running = true; return { running, url: 'http://192.168.1.10:8280' }; },
      'mobile.stop': () => { running = false; return { running }; },
      'mobile.link': (p) => { expect(p).toEqual({}); return { url: 'http://192.168.1.10:8280/m?t=tok#/home' }; },
    });
    const w = mountIt(MobileAccessCard);
    await flushPromises();
    expect(w.find('[data-test="mm-mobile-state"]').text()).toBe('未开启');
    expect(w.find('[data-test="mm-mobile-qr"]').exists()).toBe(false);
    await w.find('[data-test="mm-mobile-start"]').trigger('click');
    await flushPromises();
    await vi.waitFor(() => expect(w.find('[data-test="mm-mobile-qr"]').exists()).toBe(true));
    expect(w.find('[data-test="mm-mobile-url"]').text()).toBe('http://192.168.1.10:8280');
    expect(w.find('[data-test="mm-mobile-qr"]').attributes('src')).toMatch(/^data:image\/png;base64,/);
    expect(w.text()).toContain('这是 林晓 的专属链接');
    await w.find('[data-test="mm-mobile-stop"]').trigger('click');
    await flushPromises();
    expect(w.find('[data-test="mm-mobile-qr"]').exists()).toBe(false);
    expect(env.names()).toEqual(['mobile.status', 'mobile.start', 'mobile.link', 'mobile.stop']);
  });

  it('普通成员：没有开关按钮；服务开着时照样能扫自己的二维码', async () => {
    bootAs('u2', '周婷');
    setup({ 'mobile.status': () => ({ running: false }) });
    const w = mountIt(MobileAccessCard);
    await flushPromises();
    expect(w.find('[data-test="mm-mobile-start"]').exists()).toBe(false);
    expect(w.text()).toContain('请管理员在首页开启');
    bootAs('u2', '周婷');
    mmBoot.value!.mobile = { running: true, url: 'http://10.0.0.2:8280' };
    setup({ 'mobile.status': () => ({ running: true, url: 'http://10.0.0.2:8280' }), 'mobile.link': () => ({ url: 'http://10.0.0.2:8280/m?t=x' }) });
    const w2 = mountIt(MobileAccessCard);
    await flushPromises();
    await vi.waitFor(() => expect(w2.find('[data-test="mm-mobile-qr"]').exists()).toBe(true));
    expect(w2.find('[data-test="mm-mobile-stop"]').exists()).toBe(false);
  });

  it('首页横条模式（compact）：紧凑展示地址/操作按钮，点二维码可放大预览并支持关闭', async () => {
    bootAs('u1', '林晓', true);
    mmBoot.value!.mobile = { running: true, url: 'http://192.168.1.10:8280' };
    setup({
      'mobile.status': () => ({ running: true, url: 'http://192.168.1.10:8280', publicBase: 'https://example.com/mm' }),
      'mobile.link': () => ({ url: 'http://192.168.1.10:8280/m?t=tok#/home' }),
    });
    const w = mountIt(MobileAccessCard, { compact: true });
    await flushPromises();
    await vi.waitFor(() => expect(w.find('[data-test="mm-mobile-qr"]').exists()).toBe(true));
    expect(w.find('[data-test="mm-mobile"]').classes()).toContain('mm-mob--compact');
    expect(w.find('[data-test="mm-mobile-url"]').text()).toBe('http://192.168.1.10:8280');
    expect(w.find('[data-test="mm-mobile-public"]').text()).toContain('https://example.com/mm');
    await w.find('.mm-mob__qr-btn').trigger('click');
    expect(document.body.querySelector('.mm-mob-modal')).not.toBeNull();
    (document.body.querySelector('.mm-mob-modal__close') as HTMLElement).click();
    await flushPromises();
    expect(document.body.querySelector('.mm-mob-modal')).toBeNull();
  });
});

describe('企微推送失败', () => {
  it('首页给管理员提示，点「查看并重发」跳到设置 · 消息推送；普通成员看不到', async () => {
    bootAs('u1', '林晓', true);
    mmBoot.value!.pushFailed = 3;
    setup({ 'home.get': () => homeView() });
    const w = mountIt(HomeTab);
    await flushPromises();
    const note = w.find('[data-test="mm-home-push-failed"]');
    expect(note.text()).toContain('有 3 条企微通知没发出去');
    await note.find('button').trigger('click');
    expect(mmNav.value.tab).toBe('settings');
    expect(mmSettingsSection.value).toBe('wecom');
    mmSettingsSection.value = '';
    bootAs('u2', '周婷');
    mmBoot.value!.pushFailed = 3;
    const w2 = mountIt(HomeTab);
    await flushPromises();
    expect(w2.find('[data-test="mm-home-push-failed"]').exists()).toBe(false);
  });

  it('失败记录列表：单条重发、全部重发，显示结果并刷新', async () => {
    bootAs('u1', '林晓', true);
    let left = [{ id: 'n1', at: 0, to: 'u2', toName: '周婷', type: 'task_done', title: '任务完成：A', error: '没有可用的卡片跳转地址' }, { id: 'n2', at: 0, to: 'u3', toName: '赵磊', type: 'task_done', title: '任务完成：B', error: '接收人不在企微应用可见范围内' }];
    const h = setup({
      'notice.push.failed': () => ({ total: left.length, items: left }),
      'notice.push.retry': (p) => { if (p.ids) { left = left.filter((x) => !p.ids.includes(x.id)); return { sent: 1, failed: 0 }; } return { sent: 0, failed: left.length }; },
      'boot': () => mmBoot.value,
    });
    const w = mountIt(PushFailedList);
    await flushPromises();
    expect(w.findAll('tbody tr')).toHaveLength(2);
    await w.find('[data-test="mm-push-retry-n1"]').trigger('click');
    await flushPromises();
    expect(h.calls.find((c) => c[0] === 'notice.push.retry')?.[1]).toEqual({ ids: ['n1'] });
    expect(w.find('[data-test="mm-push-result"]').text()).toContain('重发成功 1 条，仍失败 0 条');
    expect(w.findAll('tbody tr')).toHaveLength(1);
    await w.find('[data-test="mm-push-retry-all"]').trigger('click');
    await flushPromises();
    expect(h.calls.filter((c) => c[0] === 'notice.push.retry').at(-1)?.[1]).toEqual({ all: true });
    expect(w.find('[data-test="mm-push-result"]').classes()).toContain('danger');
  });
});

describe('首页', () => {
  it('问候卡、计数、待办按紧急 / 今天 / 本周分组，本周默认收起', async () => {
    bootAs('u1', '林晓', true);
    setup({ 'home.get': () => homeView() });
    const w = mountIt(HomeTab);
    await flushPromises();
    expect(w.text()).toContain('林晓');
    expect(w.find('[data-test="mm-home-brief"]').text()).toBe('今天有 1 件紧急、2 件需在今天完成的事项');
    expect(w.find('[data-test="mm-todo-a"]').classes()).toContain('urgent');
    expect(w.find('[data-test="mm-todo-b"]').exists()).toBe(true);
    expect(w.find('[data-test="mm-todo-d"]').exists()).toBe(false);
    await w.find('[data-test="mm-week-toggle"]').trigger('click');
    expect(w.find('[data-test="mm-todo-d"]').exists()).toBe(true);
    await w.find('[data-test="mm-todo-filter-task"]').trigger('click');
    expect(w.find('[data-test="mm-todo-b"]').exists()).toBe(false);
    expect(w.find('[data-test="mm-todo-a"]').exists()).toBe(true);
  });

  it('点待办直接去处理：页签跳到对象所在页', async () => {
    bootAs('u1', '林晓', true);
    setup({ 'home.get': () => homeView() });
    const w = mountIt(HomeTab);
    await flushPromises();
    await w.find('[data-test="mm-todo-b"] button').trigger('click');
    expect(mmNav.value.tab).toBe('meetings');
    expect(mmNav.value.link).toEqual({ kind: 'meeting', id: 'obj-b' });
  });

  it('区块没内容收成一行提示', async () => {
    bootAs('u1', '林晓', true);
    setup({ 'home.get': () => homeView({ todos: [], notices: [], counts: { todos: 0, dueToday: 0, overdue: 0, unread: 0 } }) });
    const w = mountIt(HomeTab);
    await flushPromises();
    expect(w.find('[data-test="mm-home-todos"]').text()).toContain('暂无待办');
    expect(w.find('[data-test="mm-home-mytasks"]').text()).toContain('没有即将到期或逾期的任务');
    expect(w.find('[data-test="mm-home-notices"]').text()).toContain('暂无通知');
    expect(w.find('[data-test="mm-home-projects"]').text()).toContain('还没有参与的项目');
    expect(w.find('[data-test="mm-home-meetings"]').text()).toContain('还没有参加过会议');
    expect(w.find('[data-test="mm-home-brief"]').text()).toBe('今天没有紧急或需要今天完成的事项');
  });

  it('点通知先标已读再跳转', async () => {
    bootAs('u1', '林晓', true);
    const h = setup({ 'home.get': () => homeView(), 'notice.read': () => ({ ok: true }) });
    const w = mountIt(HomeTab);
    await flushPromises();
    await w.find('[data-test="mm-notice-n1"]').trigger('click');
    await flushPromises();
    expect(h.calls.find((c) => c[0] === 'notice.read')?.[1]).toEqual({ ids: ['n1'] });
    expect(mmNav.value.tab).toBe('tasks');
  });

  it('上报身份胶囊角色', async () => {
    bootAs('u1', '林晓', true);
    setup({ 'home.get': () => homeView({ projects: [{ id: 'p1', name: 'A2', status: 'active', done: 1, total: 3, overdue: 0, ownerName: '林晓' }] }) });
    const w = mountIt(HomeTab);
    await flushPromises();
    expect(w.emitted('role')?.at(-1)).toEqual(['项目负责人']);
  });
});

function meeting(over: Partial<MmMeeting> = {}): MmMeeting {
  return {
    id: 'm1', projectId: 'p1', title: '数字化工厂周例会', time: new Date(2026, 10, 9, 14).getTime(), source: 'zoom', hostId: 'u1', attendeeIds: ['u1', 'u2'],
    createdBy: 'u1', createdAt: 0, status: 'pending_review', files: [{ id: 'f', name: 'a.m4a', kind: 'audio', size: 1, path: '/x', uploadedAt: 0 }],
    speakers: [{ label: 'S1', personId: 'u1' }, { label: 'S2', personId: 'u2' }],
    segments: [{ id: 'a', start: 0, end: 3, speakerLabel: 'S1', text: '先上质量追溯' }, { id: 'b', start: 4, end: 8, speakerLabel: 'S2', text: '接口文档本周五前给到' }],
    topics: [{ id: 't1', title: 'MES 二期上线范围', segmentIds: ['a', 'b'] }],
    decisions: [{ id: 'x1', text: '质量追溯二期上线', segmentIds: ['a'] }], summaryLines: [],
    confirmations: [{ personId: 'u1', status: 'confirmed' }, { personId: 'u2', status: 'confirmed' }], taskIds: [], durationSec: 52 * 60, ...over,
  };
}
function detailOf(m: MmMeeting, my: Partial<MmMeetingDetail['my']> = {}): MmMeetingDetail {
  return {
    meeting: m, projectName: '数字化工厂一期', projectStatus: 'active',
    names: { u1: { name: '李娜', deptName: '运营中心' }, u2: { name: '赵磊', deptName: '研发部' } },
    my: { isHost: false, isSpeaker: false, isPlanOwner: false, myLabels: [], ...my },
    confirm: { done: m.confirmations.filter((c) => c.status === 'confirmed').length, total: m.confirmations.length }, tasks: [],
  };
}

describe('会议详情', () => {
  it('主持人终审：横幅「等你终审」+ 审核通过；进度条停在终审；悬停段落可退回', async () => {
    bootAs('u1', '李娜');
    let current = detailOf(meeting(), { isHost: true, isSpeaker: true, myLabels: ['S1'] });
    const h = setup({ 'meeting.get': () => current, 'meeting.review.approve': () => { current = detailOf(meeting({ status: 'finalized' }), { isHost: true }); return { ok: true }; } });
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    const w = mountIt(MeetingDetail, { meetingId: 'm1' });
    await flushPromises();
    expect(w.find('[data-test="mm-meeting-banner"]').text()).toContain('2 位发言人已全部确认，等你终审');
    expect(w.find('[data-test="mm-step-review"]').classes()).toContain('cur');
    expect(w.find('[data-test="mm-step-confirm"]').classes()).toContain('done');
    expect(w.find('[data-test="mm-seg-return-b"]').exists()).toBe(true);
    expect(w.find('[data-test="mm-seg-modify-a"]').exists()).toBe(true);
    expect(w.emitted('role')?.at(-1)).toEqual(['主持人']);
    await w.find('[data-test="mm-action-approve"]').trigger('click');
    await flushPromises();
    expect(h.names()).toContain('meeting.review.approve');
    expect(w.find('[data-test="mm-action-generate"]').exists()).toBe(true);
    expect(w.find('[data-test="mm-action-none"]').exists()).toBe(true);
  });

  it('别处改了这场会议（手机上确认发言）：详情自动刷新，确认进度跟着变；别的会议的变更不刷', async () => {
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });
    try {
      bootAs('u1', '李娜');
      const base = meeting({ status: 'pending_confirm', confirmations: [{ personId: 'u1', status: 'confirmed' }, { personId: 'u2', status: 'pending' }] });
      let current = detailOf(base, { isHost: true, isSpeaker: true, myLabels: ['S1'] });
      const h = setup({ 'meeting.get': () => current });
      let emitEv: (ev: any) => void = () => {};
      (window as any).electronAPI.workbenches.meetingMgmt.onEvent = (cb: (ev: any) => void) => { emitEv = cb; return () => {}; };
      const w = mountIt(MeetingDetail, { meetingId: 'm1' });
      await flushPromises();
      expect(w.find('[data-test="mm-meeting-banner"]').text()).toContain('其他发言人确认中（1/2）');
      const gets = () => h.names().filter((x) => x === 'meeting.get').length;
      const before = gets();
      emitEv({ type: 'changed', scope: 'meeting', id: 'other' });
      await vi.advanceTimersByTimeAsync(400);
      expect(gets()).toBe(before);
      current = detailOf(meeting({ status: 'pending_review', confirmations: [{ personId: 'u1', status: 'confirmed' }, { personId: 'u2', status: 'confirmed', confirmedAt: 1 }] }), { isHost: true, isSpeaker: true, myLabels: ['S1'] });
      emitEv({ type: 'changed', scope: 'meeting', id: 'm1' });
      emitEv({ type: 'changed', scope: 'meeting', id: 'm1' });
      await vi.advanceTimersByTimeAsync(400);
      await flushPromises();
      expect(gets()).toBe(before + 1); // 连着两个事件合成一次
      expect(w.find('[data-test="mm-meeting-banner"]').text()).toContain('2 位发言人已全部确认，等你终审');
    } finally { vi.useRealTimers(); }
  });

  it('主持人逐段改发言人：改给另一位发言人 / 改给本场没出现的员工；更正发言人面板默认收起', async () => {
    bootAs('u1', '李娜');
    clearPeopleCache();
    const m = meeting({ status: 'pending_confirm', confirmations: [{ personId: 'u1', status: 'confirmed' }, { personId: 'u2', status: 'pending' }] });
    const h = setup({
      'meeting.get': () => detailOf(m, { isHost: true, isSpeaker: true, myLabels: ['S1'] }),
      'people.list': () => ({ depts: [{ id: 'd1', name: '运营中心', leaderIds: [] }], people: [{ id: 'u1', name: '李娜', deptId: 'd1' }, { id: 'u2', name: '赵磊', deptId: 'd1' }, { id: 'u3', name: '孙浩', deptId: 'd1' }] }),
      'meeting.segment.speaker': () => ({ ok: true }),
    });
    const w = mountIt(MeetingDetail, { meetingId: 'm1' });
    await flushPromises();
    // 更正面板在，但默认收起
    expect(w.find('[data-test="mm-speaker-assign"]').text()).toContain('更正发言人');
    expect(w.find('[data-test="mm-speaker-S1"]').exists()).toBe(false);
    await w.find('[data-test="mm-speaker-toggle"]').trigger('click');
    expect(w.find('[data-test="mm-speaker-S1"]').exists()).toBe(true);
    // 段 a 改给 S2
    await w.find('[data-test="mm-seg-move-a"]').trigger('click');
    await flushPromises();
    expect(await openPicker(w, 'mm-seg-speaker-pick-a')).toEqual(['李娜（S1）', '赵磊（S2）', '孙浩']);
    expect(w.find('[data-test="mm-seg-speaker-save-a"]').attributes('disabled')).toBeDefined(); // 没改不让存
    await pickIn(w, 'mm-seg-speaker-pick-a', 'label:S2');
    await w.find('[data-test="mm-seg-speaker-save-a"]').trigger('click');
    await flushPromises();
    expect(h.calls.find((c) => c[0] === 'meeting.segment.speaker')?.[1]).toEqual({ id: 'm1', segmentId: 'a', label: 'S2' });
    // 段 b 改给孙浩（本场没有他的标签）
    await w.find('[data-test="mm-seg-move-b"]').trigger('click');
    await flushPromises();
    await pickIn(w, 'mm-seg-speaker-pick-b', 'u3');
    await w.find('[data-test="mm-seg-speaker-save-b"]').trigger('click');
    await flushPromises();
    expect(h.calls.filter((c) => c[0] === 'meeting.segment.speaker').at(-1)?.[1]).toEqual({ id: 'm1', segmentId: 'b', personId: 'u3' });
  });

  it('待确认：主持人能补全任意段的文字；发言人确认过也能补全本人的段、不能改别人的', async () => {
    bootAs('u1', '李娜');
    const m = meeting({ status: 'pending_confirm', confirmations: [{ personId: 'u1', status: 'confirmed' }, { personId: 'u2', status: 'pending' }] });
    const h = setup({ 'meeting.get': () => detailOf(m, { isHost: true, isSpeaker: true, myLabels: ['S1'] }), 'meeting.segment.edit': () => ({ ok: true }) });
    const w = mountIt(MeetingDetail, { meetingId: 'm1' });
    await flushPromises();
    expect(w.find('[data-test="mm-seg-modify-a"]').exists()).toBe(true);
    expect(w.find('[data-test="mm-seg-modify-b"]').exists()).toBe(true); // 别人的段（主持人）
    await w.find('[data-test="mm-seg-modify-b"]').trigger('click');
    await flushPromises();
    await w.find('textarea').setValue('主持人补全的一句话');
    const save = w.findAll('button').find((x) => x.text() === '保存')!;
    await save.trigger('click');
    await flushPromises();
    expect(h.calls.find((c) => c[0] === 'meeting.segment.edit')?.[1]).toEqual({ id: 'm1', segmentId: 'b', text: '主持人补全的一句话' });
    w.unmount();
    // 非主持人、已确认：本人段还能改，别人的不行
    bootAs('u1', '李娜');
    setup({ 'meeting.get': () => detailOf(m, { isHost: false, isSpeaker: true, myLabels: ['S1'] }) });
    const w2 = mountIt(MeetingDetail, { meetingId: 'm1' });
    await flushPromises();
    expect(w2.find('[data-test="mm-seg-modify-a"]').exists()).toBe(true);
    expect(w2.find('[data-test="mm-seg-modify-b"]').exists()).toBe(false);
  });

  it('主持人定稿前改决议和摘要；AI 重新整理先确认；非主持人和定稿后没有入口', async () => {
    bootAs('u1', '李娜');
    const m = meeting({ summaryLines: ['S2 本周五前给接口文档'] });
    const h = setup({ 'meeting.get': () => detailOf(m, { isHost: true }), 'meeting.minutes.save': () => ({ ok: true }), 'meeting.minutes.reorganize': () => ({ note: '' }) });
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(false);
    const w = mountIt(MeetingDetail, { meetingId: 'm1' });
    await flushPromises();
    expect(w.find('[data-test="mm-decisions"]').text()).toContain('纪要摘要（草稿）');
    await w.find('[data-test="mm-minutes-edit"]').trigger('click');
    await w.find('[data-test="mm-decision-input-0"]').setValue('质量追溯二期 12 月上线');
    await w.find('[data-test="mm-decision-add"]').trigger('click');
    await w.find('[data-test="mm-decision-input-1"]').setValue('赵磊本周五前给接口文档');
    await w.find('[data-test="mm-summary-input-0"]').setValue('赵磊本周五前给接口文档');
    await w.find('[data-test="mm-minutes-save"]').trigger('click');
    await flushPromises();
    expect(h.calls.find((c) => c[0] === 'meeting.minutes.save')?.[1]).toEqual({
      id: 'm1', decisions: [{ id: 'x1', text: '质量追溯二期 12 月上线' }, { text: '赵磊本周五前给接口文档' }], summaryLines: ['赵磊本周五前给接口文档'],
    });
    await w.find('[data-test="mm-minutes-reorganize"]').trigger('click');
    expect(confirmSpy).toHaveBeenCalled();
    expect(h.names()).not.toContain('meeting.minutes.reorganize'); // 没确认就不跑
    confirmSpy.mockReturnValue(true);
    await w.find('[data-test="mm-minutes-reorganize"]').trigger('click');
    await flushPromises();
    expect(h.names()).toContain('meeting.minutes.reorganize');

    bootAs('u2', '赵磊');
    setup({ 'meeting.get': () => detailOf(m, { isSpeaker: true, myLabels: ['S2'] }) });
    const w2 = mountIt(MeetingDetail, { meetingId: 'm1' });
    await flushPromises();
    expect(w2.find('[data-test="mm-minutes-edit"]').exists()).toBe(false);
    expect(w2.find('[data-test="mm-decisions"]').text()).not.toContain('纪要摘要');
  });

  it('定稿后：主持人仍能修正段落文字和决议（不能 AI 重新整理、不能改发言人）；每段能播放原声；非主持人只能听', async () => {
    bootAs('u1', '李娜');
    const fin = meeting({ status: 'finalized' });
    const h = setup({
      'meeting.get': () => detailOf(fin, { isHost: true, isSpeaker: true, myLabels: ['S1'] }),
      'meeting.segment.audio': () => ({ dataUrl: 'data:audio/wav;base64,UklGRg==' }),
      'meeting.segment.edit': () => fin,
    });
    const play = vi.fn(async () => {});
    vi.spyOn(window, 'Audio').mockImplementation(() => ({ play, pause: vi.fn(), src: '', onended: null }) as any);
    const w = mountIt(MeetingDetail, { meetingId: 'm1' });
    await flushPromises();
    expect(w.find('[data-test="mm-minutes"]').text()).toContain('纪要已定稿；发现错字可悬停段落修改');
    expect(w.find('[data-test="mm-seg-move-b"]').exists()).toBe(false);
    await w.find('[data-test="mm-seg-play-b"]').trigger('click');
    await flushPromises();
    expect(h.calls.find((c) => c[0] === 'meeting.segment.audio')?.[1]).toEqual({ id: 'm1', segmentId: 'b' });
    expect(play).toHaveBeenCalled();
    expect(w.find('[data-test="mm-seg-play-b"]').classes()).toContain('on');
    await w.find('[data-test="mm-seg-modify-b"]').trigger('click');
    await w.find('[data-test="mm-seg-edit-b"]').setValue('接口文档本周四前给到');
    await w.find('[data-test="mm-seg-save-b"]').trigger('click');
    await flushPromises();
    expect(h.calls.find((c) => c[0] === 'meeting.segment.edit')?.[1]).toEqual({ id: 'm1', segmentId: 'b', text: '接口文档本周四前给到' });
    expect(w.find('[data-test="mm-minutes-edit"]').exists()).toBe(true);
    expect(w.find('[data-test="mm-minutes-reorganize"]').exists()).toBe(false);

    bootAs('u2', '赵磊');
    setup({ 'meeting.get': () => detailOf(fin, { isSpeaker: true, myLabels: ['S2'] }) });
    const w2 = mountIt(MeetingDetail, { meetingId: 'm1' });
    await flushPromises();
    expect(w2.find('[data-test="mm-seg-play-b"]').exists()).toBe(true);
    expect(w2.find('[data-test="mm-seg-modify-b"]').exists()).toBe(false);
    expect(w2.find('[data-test="mm-minutes-edit"]').exists()).toBe(false);
  });

  it('不是主持人：终审阶段只看不改', async () => {
    bootAs('u2', '赵磊');
    setup({ 'meeting.get': () => detailOf(meeting(), { isSpeaker: true, myLabels: ['S2'] }) });
    const w = mountIt(MeetingDetail, { meetingId: 'm1' });
    await flushPromises();
    expect(w.find('[data-test="mm-action-approve"]').exists()).toBe(false);
    expect(w.find('[data-test="mm-seg-return-a"]').exists()).toBe(false);
    expect(w.find('[data-test="mm-seg-modify-b"]').exists()).toBe(false);
    expect(w.find('[data-test="mm-meeting-banner"]').text()).toContain('等待主持人 李娜 终审');
  });

  it('发言人待确认：只能改本人段，确认调 meeting.confirm', async () => {
    bootAs('u2', '赵磊');
    const m = meeting({ status: 'pending_confirm', confirmations: [{ personId: 'u1', status: 'confirmed' }, { personId: 'u2', status: 'pending' }] });
    const h = setup({ 'meeting.get': () => detailOf(m, { isSpeaker: true, myLabels: ['S2'] }), 'meeting.confirm': () => ({ ok: true }), 'meeting.segment.edit': () => ({ ok: true }) });
    const w = mountIt(MeetingDetail, { meetingId: 'm1' });
    await flushPromises();
    expect(w.find('[data-test="mm-meeting-status"]').text()).toBe('待确认 1/2');
    expect(w.find('[data-test="mm-seg-modify-b"]').exists()).toBe(true);
    expect(w.find('[data-test="mm-seg-modify-a"]').exists()).toBe(false);
    await w.find('[data-test="mm-seg-modify-b"]').trigger('click');
    await w.find('[data-test="mm-seg-edit-b"]').setValue('接口文档下周一前给到');
    await w.find('[data-test="mm-seg-save-b"]').trigger('click');
    await flushPromises();
    expect(h.calls.find((c) => c[0] === 'meeting.segment.edit')?.[1]).toEqual({ id: 'm1', segmentId: 'b', text: '接口文档下周一前给到' });
    await w.find('[data-test="mm-action-confirm"]').trigger('click');
    await flushPromises();
    expect(h.calls.find((c) => c[0] === 'meeting.confirm')?.[1]).toEqual({ id: 'm1' });
  });

  it('待上传：主持人看到上传区，点选择文件走 meeting.pickFiles', async () => {
    bootAs('u1', '李娜');
    const m = meeting({ status: 'pending_upload', files: [], segments: [], topics: [], decisions: [], confirmations: [] });
    const h = setup({ 'meeting.get': () => detailOf(m, { isHost: true }), 'meeting.pickFiles': () => null });
    const w = mountIt(MeetingDetail, { meetingId: 'm1' });
    await flushPromises();
    expect(w.find('[data-test="mm-upload-panel"]').exists()).toBe(true);
    expect(w.find('[data-test="mm-step-upload"]').classes()).toContain('cur');
    await w.find('[data-test="mm-pick-files"]').trigger('click');
    await flushPromises();
    expect(h.calls.find((c) => c[0] === 'meeting.pickFiles')?.[1]).toEqual({ id: 'm1' });
  });

  it('处理失败：进度条标红，主持人可重试', async () => {
    bootAs('u1', '李娜');
    const m = meeting({ status: 'failed', segments: [], topics: [], process: { stage: 'transcribe', progress: 30, error: '录音里没有检测到人声', log: [] } });
    const h = setup({ 'meeting.get': () => detailOf(m, { isHost: true }), 'meeting.retry': () => ({ ok: true }) });
    const w = mountIt(MeetingDetail, { meetingId: 'm1' });
    await flushPromises();
    expect(w.find('[data-test="mm-step-process"]').classes()).toContain('bad');
    expect(w.find('[data-test="mm-process-failed"]').text()).toContain('录音里没有检测到人声');
    await w.find('[data-test="mm-retry"]').trigger('click');
    await flushPromises();
    expect(h.names()).toContain('meeting.retry');
  });

  it('调用失败显示中文原因', async () => {
    bootAs('u1', '李娜');
    setup({ 'meeting.get': () => detailOf(meeting(), { isHost: true }), 'meeting.review.approve': () => { throw new Error("Error invoking remote method 'x': Error: 还有发言人没确认"); } });
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    const w = mountIt(MeetingDetail, { meetingId: 'm1' });
    await flushPromises();
    await w.find('[data-test="mm-action-approve"]').trigger('click');
    await flushPromises();
    expect(w.text()).toContain('还有发言人没确认');
  });
});

describe('会议列表', () => {
  it('四个筛选各拉一次算计数；「需要我处理」分组；默认选中第一条需要我处理的', async () => {
    bootAs('u1', '李娜');
    const cards = [
      { id: 'm2', title: '华东扩产专题会', projectName: '华东', time: 0, status: 'processing', needsMe: false },
      { id: 'm1', title: '数字化工厂周例会', projectName: '数字化工厂一期', time: 0, status: 'pending_review', needsMe: true },
    ];
    const h = setup({
      'meeting.list': (p: any) => (p.filter === 'todo' ? cards.filter((c) => c.needsMe) : p.filter === 'processing' ? [cards[0]] : p.filter === 'final' ? [] : cards),
      'meeting.get': () => detailOf(meeting(), { isHost: true }),
    });
    const w = mountIt(MeetingsTab);
    await flushPromises();
    expect(h.calls.filter((c) => c[0] === 'meeting.list').map((c) => c[1].filter).sort()).toEqual(['all', 'final', 'processing', 'todo']);
    expect(w.find('[data-test="mm-meeting-filter-todo"]').text()).toContain('1');
    expect(w.find('[data-test="mm-meeting-filter-final"]').text()).toContain('0');
    expect(w.find('[data-test="mm-meeting-m1"]').classes()).toContain('on');
    expect(w.find('[data-test="mm-meeting-detail"]').exists()).toBe(true);
    await w.find('[data-test="mm-meeting-filter-processing"]').trigger('click');
    expect(w.find('[data-test="mm-meeting-m1"]').exists()).toBe(false);
    expect(w.find('[data-test="mm-meeting-m2"]').exists()).toBe(true);
  });

  it('列表删除按钮：无权限隐藏；取消不删；确认后调 meeting.delete 并切换到剩余会议', async () => {
    bootAs('u1', '李娜', true);
    let cards = [
      { id: 'm1', title: '数字化工厂周例会', projectName: '数字化工厂一期', time: 0, status: 'dispatched', needsMe: true, canDelete: true, taskCount: 2 },
      { id: 'm2', title: '华东扩产专题会', projectName: '华东', time: 0, status: 'processing', needsMe: false, canDelete: false },
    ];
    const h = setup({
      'meeting.list': (p: any) => (p.filter === 'todo' ? cards.filter((c) => c.needsMe) : p.filter === 'processing' ? cards.filter((c) => c.status === 'processing') : p.filter === 'final' ? cards.filter((c) => c.status === 'dispatched') : cards),
      'meeting.get': (p: any) => detailOf(meeting({ id: p.id, title: p.id === 'm2' ? '华东扩产专题会' : '数字化工厂周例会' }), { isHost: true }),
      'meeting.delete': (p: any) => { cards = cards.filter((c) => c.id !== p.id); return { ok: true, id: p.id, deletedTasks: 2 }; },
      'boot': () => mmBoot.value,
    });
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValueOnce(false).mockReturnValueOnce(true);
    const w = mountIt(MeetingsTab);
    await flushPromises();
    expect(w.find('[data-test="mm-meeting-delete-m1"]').exists()).toBe(true);
    expect(w.find('[data-test="mm-meeting-delete-m2"]').exists()).toBe(false);
    // 取消确认：不发请求
    await w.find('[data-test="mm-meeting-delete-m1"]').trigger('click');
    await flushPromises();
    expect(confirmSpy).toHaveBeenCalledWith(expect.stringContaining('2 项任务'));
    expect(h.names()).not.toContain('meeting.delete');
    // 确认删除：调 meeting.delete，列表刷新且选中切到 m2
    await w.find('[data-test="mm-meeting-delete-m1"]').trigger('click');
    await flushPromises();
    expect(h.calls.find((c) => c[0] === 'meeting.delete')?.[1]).toEqual({ id: 'm1' });
    expect(w.find('[data-test="mm-meeting-m1"]').exists()).toBe(false);
    expect(w.find('[data-test="mm-meeting-m2"]').classes()).toContain('on');
  });
});
