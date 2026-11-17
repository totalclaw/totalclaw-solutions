// @vitest-environment happy-dom
/**
 * 任务 / 项目 / 系统设置三页：按契约（docs/meeting-mgmt-workbench.md 3.2）打桩主进程，核对界面发出的动作与载荷、
 * 按 can 显示按钮、首页链接打开详情、错误显示。
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { flushPromises, mount, type VueWrapper } from '@vue/test-utils';
import { createPinia } from 'pinia';
import type { MmTaskView } from '../../../shared/meetingMgmt/types';
import { MM_DEFAULT_SETTINGS } from '../../../shared/meetingMgmt/types';

vi.mock('../../composables/useDialog', () => ({
  useDialog: () => ({ confirm: vi.fn(async () => true), prompt: vi.fn(async () => '并入其它任务') }),
}));

import TasksTab from './TasksTab.vue';
import ProjectsTab from './ProjectsTab.vue';
import SettingsTab from './SettingsTab.vue';
import ProjectMembersDialog from './ProjectMembersDialog.vue';
import { mmBoot, mmNav, mmRole } from './shared';

const $t = (s: string, args?: Record<string, unknown>) => s.replace(/\{(\w+)\}/g, (_, k) => String(args?.[k] ?? k));

function task(p: Partial<MmTaskView> & { id: string }): MmTaskView {
  return {
    projectId: 'p1', meetingId: 'm1', planItemId: 'i1', deptId: 'd1', assigneeId: 'u1', ownerId: 'u2',
    title: p.id, standard: '到货 200 套', due: '2026-12-15', status: 'in_progress', percent: 30, createdAt: 1,
    objectionHistory: [], progressLog: [], events: [], reminders: {},
    overdue: false, overdueDays: 0, projectName: 'A2 量产导入项目', meetingTitle: 'A2 第 3 次周例会', deptName: '采购部', assigneeName: '周婷', ownerName: '刘洋',
    ...p,
  } as MmTaskView;
}

const chip = task({
  id: 't1', title: '主控芯片到货跟踪',
  objection: { id: 'o1', kind: 'change', target: 'time', reason: '供应商最早 12-18 到货', suggestion: '建议截止调整', suggestedDue: '2026-12-20', raisedBy: 'u1', raisedAt: 10, prevStatus: 'in_progress', stage: 'arbitration', review: { by: 'u2', at: 20, decision: 'reject', note: '先用试产库存' } },
  events: [
    { at: 10, by: 'u1', action: 'objection_raised', note: '时间节点' },
    { at: 20, by: 'u2', action: 'review_reject' },
    { at: 30, by: 'u1', action: 'escalated' },
  ],
});
const jig = task({ id: 't2', title: '夹具工装到位', status: 'to_accept', percent: 0, assigneeName: '吴刚', deptName: '生产部' });
const guide = task({ id: 't3', title: '同步更新作业指导书', overdue: true, overdueDays: 2, percent: 80 });
const done = task({ id: 't4', title: '已完成的一项', status: 'done', percent: 100 });

type Handlers = Record<string, (p: any) => unknown>;
let wrappers: VueWrapper[] = [];
let calls: Array<[string, any]> = [];

function install(handlers: Handlers) {
  calls = [];
  const invoke = vi.fn(async (action: string, payload: any) => {
    calls.push([action, payload]);
    const fn = handlers[action];
    if (!fn) throw new Error(`unexpected action ${action}`);
    return fn(payload);
  });
  (window as any).electronAPI = {
    workbenches: { meetingMgmt: { invoke, onEvent: () => () => {} } },
    getPathForFile: () => '/Users/me/录音/林晓.m4a',
    writeClipboardText: async () => ({ ok: true }),
  };
  return invoke;
}
const sent = (action: string) => calls.filter((c) => c[0] === action).map((c) => c[1]);

function mountIt(component: any, props: Record<string, unknown> = {}) {
  const w = mount(component, { props, attachTo: document.body, global: { plugins: [createPinia()], mocks: { $t }, stubs: { teleport: true } } });
  wrappers.push(w);
  return w;
}

beforeEach(() => {
  mmBoot.value = {
    me: { person: { id: 'u9', name: '林晓', deptId: 'd0' }, isAdmin: true, canCreateProject: true },
    org: { source: 'demo', deptCount: 6, peopleCount: 20 },
    settings: { ...MM_DEFAULT_SETTINGS, adminIds: ['u9'] },
    wecomConnected: false,
    mobile: { running: false },
    badges: { home: 0, meetings: 0, tasks: 0 },
  };
  mmNav.value = { tab: 'tasks', seq: 0 };
});
afterEach(() => {
  wrappers.forEach((w) => w.unmount());
  wrappers = [];
});

const taskHandlers = (can: Record<string, boolean> = {}): Handlers => ({
  'task.list': () => [chip, jig, guide, done],
  'project.list': () => [{ id: 'p1', name: 'A2 量产导入项目', status: 'active', ownerName: '陈立峰', done: 16, total: 18, overdue: 1, rate: 89 }],
  'home.get': () => ({ todos: [{ id: 'td1', type: 'confirm_plan', title: 'A2 量产导入第 4 次周例会', subtitle: 'AI 已拆出 4 项任务', urgency: 'week', link: { kind: 'meeting_plan', id: 'm4' }, at: 1, group: 'meeting' }] }),
  'task.get': ({ id }) => ({ task: [chip, jig, guide, done].find((t) => t.id === id), names: { u1: { name: '周婷' }, u2: '刘洋' }, project: { id: 'p1', name: 'A2', status: 'active', ownerId: 'u9' }, can }),
  'task.objection.arbitrate': () => ({}),
  'task.progress': () => ({}),
  'task.accept': () => ({}),
});

describe('任务页签', () => {
  it('方案待确认横幅 + 分组表；「去确认方案」跳到会议方案', async () => {
    install(taskHandlers());
    const w = mountIt(TasksTab);
    await flushPromises();
    const banner = w.find('[data-test="mm-plan-banner"]');
    expect(banner.text()).toContain('1 份执行方案待你确认');
    expect(banner.text()).toContain('A2 量产导入第 4 次周例会 · AI 已拆出 4 项任务');
    expect(sent('task.list')[0]).toMatchObject({ view: 'all' });
    expect(w.text()).toContain('需要处理 · 2');
    expect(w.text()).toContain('进行中 · 1');
    expect(w.text()).toContain('已完成 · 1');
    // 已完成默认收起
    expect(w.find('[data-test="mm-task-row-t4"]').exists()).toBe(false);
    expect(w.find('[data-test="mm-task-row-t3"]').text()).toContain('逾期 2 天');
    expect(w.find('[data-test="mm-task-row-t1"]').text()).toContain('待裁决');
    await w.find('[data-test="mm-plan-banner-go"]').trigger('click');
    expect(mmNav.value).toMatchObject({ tab: 'meetings', link: { kind: 'meeting_plan', id: 'm4' } });
  });

  it('切到「我接收的」按 received 重新拉列表；三个视图和手机端同名同序', async () => {
    install(taskHandlers());
    const w = mountIt(TasksTab);
    await flushPromises();
    await w.find('[data-test="mm-tasks-view-received"]').trigger('click');
    await flushPromises();
    expect(sent('task.list').at(-1)).toMatchObject({ view: 'received' });
    expect(['received', 'assigned', 'all'].map((k) => w.find(`[data-test="mm-tasks-view-${k}"]`).text())).toEqual(['我接收的', '我分派的', '全部任务']);
  });

  it('项目负责人裁决：按异议调整，截止按建议预填，只提交改了的字段', async () => {
    install(taskHandlers({ arbitrate: true }));
    const w = mountIt(TasksTab);
    await flushPromises();
    await w.find('[data-test="mm-task-row-t1"]').trigger('click');
    await flushPromises();
    const drawer = w.find('[data-test="mm-task-detail"]');
    expect(drawer.find('[data-test="mm-task-status"]').text()).toBe('异议处理中 · 待裁决');
    expect(drawer.text()).toContain('（处理期间照常计时）');
    // 默认落在「异议与变更」：双方意见、变更记录
    expect(drawer.find('[data-test="mm-ob-raiser"]').text()).toContain('周婷');
    expect(drawer.find('[data-test="mm-ob-owner"]').text()).toContain('已驳回');
    expect(drawer.find('[data-test="mm-ob-log"]').text()).toContain('不接受驳回，提交裁决');
    await drawer.find('[data-test="mm-ob-adjust"]').trigger('click');
    expect((drawer.find('[data-test="mm-ob-due"]').element as HTMLInputElement).value).toBe('2026-12-20');
    await drawer.find('[data-test="mm-ob-submit"]').trigger('click');
    await flushPromises();
    expect(sent('task.objection.arbitrate')[0]).toEqual({ id: 't1', decision: 'adjust', note: '', changes: { due: '2026-12-20' } });
    // 顶部身份胶囊：打开时是「项目负责人」，关掉恢复默认
    expect(mmRole.value).toBe('项目负责人');
    expect(w.emitted('role')?.at(-1)).toEqual(['项目负责人']);
    await w.find('[data-test="mm-task-detail-close"]').trigger('click');
    await flushPromises();
    expect(mmRole.value).toBe('');
  });

  it('没有裁决权限时不出裁决按钮，只提示在等谁', async () => {
    install(taskHandlers({}));
    const w = mountIt(TasksTab);
    await flushPromises();
    await w.find('[data-test="mm-task-row-t1"]').trigger('click');
    await flushPromises();
    expect(w.find('[data-test="mm-ob-arbitrate"]').exists()).toBe(false);
    expect(w.text()).toContain('已提交裁决，等待项目负责人裁决');
  });

  it('更多：删除该任务 → 裁决 adjust + cancel', async () => {
    install(taskHandlers({ arbitrate: true }));
    const w = mountIt(TasksTab);
    await flushPromises();
    await w.find('[data-test="mm-task-row-t1"]').trigger('click');
    await flushPromises();
    await w.find('[data-test="mm-ob-delete-arbitrate"]').trigger('click');
    await flushPromises();
    expect(sent('task.objection.arbitrate')[0]).toEqual({ id: 't1', decision: 'adjust', note: '并入其它任务', changes: { cancel: true } });
  });

  it('部门负责人：更新进度（百分比 + 状态 + 说明）', async () => {
    install(taskHandlers({ progress: true, complete: true, change: true }));
    const w = mountIt(TasksTab);
    await flushPromises();
    await w.find('[data-test="mm-task-row-t3"]').trigger('click');
    await flushPromises();
    expect(w.find('[data-test="mm-task-accept"]').exists()).toBe(false);
    expect(w.find('[data-test="mm-task-change"]').exists()).toBe(true);
    await w.find('[data-test="mm-task-progress"]').trigger('click');
    await w.find('[data-test="mm-progress-percent"]').setValue('90');
    await w.find('[data-test="mm-progress-note"]').setValue('图纸已发');
    await w.find('[data-test="mm-progress-submit"]').trigger('click');
    await flushPromises();
    expect(sent('task.progress')[0]).toEqual({ id: 't3', percent: 90, note: '图纸已发', status: 'in_progress' });
  });

  it('首页待办点进来：打开对应任务', async () => {
    install(taskHandlers({ accept: true, object: true }));
    mmNav.value = { tab: 'tasks', link: { kind: 'task', id: 't2' }, seq: 3 };
    const w = mountIt(TasksTab);
    await flushPromises();
    expect(sent('task.get')[0]).toEqual({ id: 't2' });
    expect(w.find('[data-test="mm-task-accept"]').exists()).toBe(true);
    await w.find('[data-test="mm-task-accept"]').trigger('click');
    await flushPromises();
    expect(sent('task.accept')[0]).toEqual({ id: 't2' });
    expect(mmRole.value).toBe('部门负责人');
  });
});

const projectGet = (status: 'active' | 'closing' = 'active') => ({
  project: { id: 'p1', name: 'A2 量产导入项目', desc: '', ownerId: 'u9', memberIds: ['u9', 'u1'], status, createdAt: new Date(2026, 10, 10).getTime(), createdBy: 'u5', weeklyReports: [] },
  ownerName: '陈立峰',
  members: [{ id: 'u5', name: '陈立峰', deptId: 'd0' }, { id: 'u1', name: '周婷', deptId: 'd1' }],
  meetings: [{ id: 'm1', title: '第 3 次周例会', projectName: 'A2', time: 1, status: 'dispatched', needsMe: false }],
  tasks: [guide, chip],
  stats: { meetings: 4, done: 16, total: 18, overdue: 1, objections: 1, weekRate: 62 },
  deptProgress: [{ deptId: 'd1', name: '研发部', done: 4, total: 5 }],
  decisions: [{ text: '全尺寸检验作为首批量产放行条件', at: 1, meetingTitle: '第 3 次周例会' }],
  closeBlockers: [{ kind: 'task', id: 't3', title: '同步更新作业指导书', reason: '工艺部 郑凯' }, { kind: 'objection', id: 't1', title: '主控芯片到货跟踪', reason: '待你裁决' }],
  can: { editMembers: true, close: true, reviewSummary: true, createMeeting: true },
});

describe('项目页签', () => {
  it('列表计数、默认选中第一个、5 个统计、结项前需处理', async () => {
    install({
      'project.list': () => [
        { id: 'p1', name: 'A2 量产导入项目', status: 'active', ownerName: '陈立峰', done: 16, total: 18, overdue: 1, rate: 89 },
        { id: 'p2', name: '数字化工厂一期', status: 'active', ownerName: '陈立峰', done: 5, total: 7, overdue: 0, rate: 72 },
        { id: 'p3', name: '老项目', status: 'archived', ownerName: '吴刚', done: 3, total: 3, overdue: 0, rate: 100 },
      ],
      'project.get': () => projectGet(),
    });
    const w = mountIt(ProjectsTab);
    await flushPromises();
    expect(w.find('[data-test="mm-projects-filter-active"]').text()).toContain('2');
    expect(w.find('[data-test="mm-projects-filter-archived"]').text()).toContain('1');
    expect(w.find('[data-test="mm-project-card-p1"]').classes()).toContain('on');
    expect(w.find('[data-test="mm-project-card-p1"]').text()).toContain('逾期 1');
    expect(w.find('[data-test="mm-project-card-p1"]').text()).toContain('89%');
    expect(w.find('[data-test="mm-project-new"]').exists()).toBe(true);
    expect(mmRole.value).toBe('项目负责人');
    const stats = w.find('[data-test="mm-project-stats"]').text();
    expect(stats).toContain('4 场');
    expect(stats).toContain('16 / 18');
    expect(stats).toContain('62%');
    const blockers = w.find('[data-test="mm-close-blockers"]');
    expect(blockers.text()).toContain('结项前需处理 · 2 项');
    expect(blockers.text()).toContain('逾期');
    expect(w.find('[data-test="mm-blocker-t1"]').text()).toContain('去裁决');
    await w.find('[data-test="mm-blocker-t1"]').trigger('click');
    expect(mmNav.value).toMatchObject({ tab: 'tasks', link: { kind: 'task', id: 't1' } });
  });

  it('发起结项不通过：列出未完成事项', async () => {
    install({
      'project.list': () => [{ id: 'p1', name: 'A2 量产导入项目', status: 'active', ownerName: '陈立峰', done: 16, total: 18, overdue: 1, rate: 89 }],
      'project.get': () => projectGet(),
      'project.close': () => ({ ok: false, items: [{ kind: 'task', id: 't3', title: '同步更新作业指导书', reason: '进行中' }] }),
    });
    const w = mountIt(ProjectsTab);
    await flushPromises();
    await w.find('[data-test="mm-project-close"]').trigger('click');
    await flushPromises();
    expect(sent('project.close')[0]).toEqual({ id: 'p1' });
    expect(w.find('[data-test="mm-close-fail"]').text()).toContain('结项检查未通过，还有 1 项未完成');
    expect(w.find('[data-test="mm-close-fail"]').text()).toContain('同步更新作业指导书');
  });

  it('首页「总结报告待审核」点进来：切到结项中筛选并打开总结报告页签', async () => {
    install({
      'project.list': () => [
        { id: 'p1', name: 'A2', status: 'active', ownerName: '陈立峰', done: 1, total: 2, overdue: 0, rate: 50 },
        { id: 'p2', name: '华东生产基地扩产', status: 'closing', ownerName: '吴刚', done: 2, total: 2, overdue: 0, rate: 100 },
      ],
      'project.get': ({ id }) => ({
        ...projectGet('closing'),
        project: { ...projectGet('closing').project, id, summary: { id: 's1', kind: 'summary', generatedAt: 1, markdown: '# 项目总结\n\n按期完成。', stats: { total: 2, done: 2, cancelled: 0, overdue: 0, onTime: 2, late: 0, completionRate: 100 } } },
      }),
    });
    mmNav.value = { tab: 'projects', link: { kind: 'project_summary', id: 'p2' }, seq: 7 };
    const w = mountIt(ProjectsTab);
    await flushPromises();
    expect(w.find('[data-test="mm-projects-filter-closing"]').classes()).toContain('on');
    expect(sent('project.get').at(-1)).toEqual({ id: 'p2' });
    expect(w.find('[data-test="mm-project-summary"]').exists()).toBe(true);
    expect(w.find('[data-test="mm-report-view"]').html()).toContain('<h1');
    expect(w.find('[data-test="mm-summary-approve"]').exists()).toBe(true);
  });

  it('编辑成员：主进程拒绝时显示原因', async () => {
    install({
      'people.list': () => ({ depts: [{ id: 'd1', name: '采购部', leaderIds: ['u1'] }], people: [{ id: 'u5', name: '陈立峰', deptId: 'd1' }, { id: 'u1', name: '周婷', deptId: 'd1' }] }),
      'project.members': () => { throw new Error("Error invoking remote method 'x': Error: 该成员还有未完成事项"); },
    });
    const w = mountIt(ProjectMembersDialog, { open: true, projectId: 'p1', ownerId: 'u5', memberIds: ['u5', 'u1'] });
    await flushPromises();
    await w.find('[data-test="mm-pp-u1"]').trigger('click');
    await w.find('[data-test="mm-pm-save"]').trigger('click');
    await flushPromises();
    expect(sent('project.members')[0]).toEqual({ id: 'p1', memberIds: ['u5'] });
    expect(w.find('[data-test="mm-pm-error"]').text()).toBe('该成员还有未完成事项');
  });
});

describe('系统设置页签', () => {
  const settingsHandlers = (): Handlers => ({
    'settings.get': () => ({ ...MM_DEFAULT_SETTINGS, adminIds: ['u9'] }),
    'people.list': () => ({ depts: [{ id: 'd1', name: '研发部', leaderIds: ['u3'] }], people: [{ id: 'u3', name: '赵磊', deptId: 'd1' }, { id: 'u4', name: '钱程', deptId: 'd1' }] }),
    boot: () => mmBoot.value,
    'voiceprint.list': () => [
      { person: { id: 'u3', name: '赵磊', deptId: 'd1' }, deptName: '研发部', status: 'collected', consentAt: new Date(2026, 10, 10, 9, 42, 26).getTime(), enrolledAt: new Date(2026, 10, 10, 9, 42).getTime() },
      { person: { id: 'u4', name: '钱程', deptId: 'd1' }, deptName: '研发部', status: 'missing' },
    ],
    'voiceprint.enroll': () => ({}),
    'settings.save': ({ patch }) => ({ ...MM_DEFAULT_SETTINGS, adminIds: ['u9'], ...patch }),
  });

  it('非管理员看不到设置', async () => {
    install(settingsHandlers());
    mmBoot.value!.me.isAdmin = false;
    const w = mountIt(SettingsTab);
    await flushPromises();
    expect(w.find('[data-test="mm-settings-denied"]').exists()).toBe(true);
    expect(calls).toHaveLength(0);
  });

  it('声纹库：覆盖率、授权时间带秒；导入录音代为采集要勾同意', async () => {
    install(settingsHandlers());
    const w = mountIt(SettingsTab);
    await flushPromises();
    expect(w.find('[data-test="mm-vp-coverage"]').text()).toContain('覆盖率 50% · 还有 1 人未采集');
    expect(w.find('[data-test="mm-vp-row-u3"]').text()).toContain('2026-11-10 09:42:26');
    await w.find('[data-test="mm-vp-filter-missing"]').trigger('click');
    expect(w.find('[data-test="mm-vp-row-u3"]').exists()).toBe(false);
    await w.find('[data-test="mm-vp-import"]').trigger('click');
    await w.find('[data-test="mm-pp-u4"]').trigger('click');
    const input = w.find('[data-test="mm-vp-file"]');
    Object.defineProperty(input.element, 'files', { value: [new File(['x'], '林晓.m4a')] });
    await input.trigger('change');
    expect(w.find('[data-test="mm-vp-import-submit"]').attributes('disabled')).toBeDefined();
    await w.find('[data-test="mm-vp-consent"]').setValue(true);
    await w.find('[data-test="mm-vp-import-submit"]').trigger('click');
    await flushPromises();
    expect(sent('voiceprint.enroll')[0]).toEqual({ personId: 'u4', path: '/Users/me/录音/林晓.m4a', consent: true });
  });

  it('声纹库：会议补充只有本人能开关（先确认），别人的只显示状态；旧模型声纹提示重录', async () => {
    const h = settingsHandlers();
    let learn = false;
    install({
      ...h,
      'voiceprint.list': () => [
        { person: { id: 'u9', name: '林晓', deptId: 'd0' }, deptName: '总经办', status: 'collected', consentAt: 1, enrolledAt: 2, autoLearn: learn, extraCount: learn ? 2 : 0 },
        { person: { id: 'u3', name: '赵磊', deptId: 'd1' }, deptName: '研发部', status: 'collected', consentAt: 1, enrolledAt: 3, autoLearn: true, extraCount: 3, needsUpdate: true },
        { person: { id: 'u4', name: '钱程', deptId: 'd1' }, deptName: '研发部', status: 'missing' },
      ],
      'voiceprint.autoLearn.set': ({ enabled }: any) => { learn = !!enabled; return { autoLearn: learn }; },
    } as any);
    const w = mountIt(SettingsTab);
    await flushPromises();
    // 别人：只显示状态，没有开关；旧模型提示重录 + 复制重录链接
    expect(w.find('[data-test="mm-vp-learn-u3"]').text()).toContain('会议补充 3 条');
    expect(w.find('[data-test="mm-vp-old-u3"]').exists()).toBe(true);
    expect(w.find('[data-test="mm-vp-row-u3"]').text()).toContain('复制重录链接');
    expect(w.findAll('[data-test="mm-vp-learn-toggle"]').length).toBe(1);
    expect(w.find('[data-test="mm-vp-row-u9"] [data-test="mm-vp-learn-toggle"]').text()).toBe('开启会议补充');
    await w.find('[data-test="mm-vp-learn-toggle"]').trigger('click');
    await flushPromises();
    expect(sent('voiceprint.autoLearn.set')[0]).toEqual({ enabled: true });
    expect(w.find('[data-test="mm-vp-learn-u9"]').text()).toContain('会议补充 2 条');
    expect(w.find('[data-test="mm-vp-learn-toggle"]').text()).toBe('关闭会议补充');
  });

  it('参数设置：只把四个周期作为 patch 保存', async () => {
    install(settingsHandlers());
    const w = mountIt(SettingsTab);
    await flushPromises();
    await w.find('[data-test="mm-settings-menu-params"]').trigger('click');
    await w.find('[data-test="mm-param-confirmTimeoutHours"]').setValue('12');
    await w.find('[data-test="mm-params-save"]').trigger('click');
    await flushPromises();
    expect(sent('settings.save')[0]).toEqual({ patch: { confirmTimeoutHours: 12, dueRemindDays: 1, trackCycleDays: 7, reportCycleDays: 7 } });
  });
});
