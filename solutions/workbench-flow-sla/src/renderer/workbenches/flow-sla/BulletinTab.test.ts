// @vitest-environment happy-dom
import { afterEach, describe, expect, it, vi } from 'vitest';
import { flushPromises, mount, type VueWrapper } from '@vue/test-utils';
import { createPinia } from 'pinia';
import { routerKey } from 'vue-router';
import BulletinTab from './BulletinTab.vue';
import LedgerTab from './LedgerTab.vue';
import TrackTab from './TrackTab.vue';
import { fsState } from './shared';

const $t = (s: string, args?: Record<string, unknown>) => s.replace(/\{(\w+)\}/g, (_, k) => String(args?.[k] ?? k));
const overall = { doneCount: 42, avgDays: 6.3, judged: 40, overtime: 4, complianceRate: 0.9, runningCount: 18, runningOverdue: 5, runningRisk: 2, reviewCount: 120, reviewCompliant: 108, reviewRate: 0.9 };
const period = { kind: 'weekly', start: new Date(2026, 9, 5).getTime(), end: new Date(2026, 9, 12).getTime(), asOf: new Date(2026, 9, 13).getTime(), label: '2026-10-05 ~ 2026-10-11' };
const ingest = { systems: [{ system: 'OA', flows: 101, nodes: 400, done: 60, running: 39, terminated: 2, derived: false }], roster: 29, rosterWithEmail: 29, skipped: [], warnings: [], files: [], at: '' };
const flow = { system: 'OA', flowNo: 'OA001', flowName: '退款申请流程', title: '退款', category: '内部驱动型', flowType: '退款申请流程', typeMatched: true, initiator: '张三', dept: '甲部', status: 'done', startAt: 1, endAt: 2, days: 12, limitDays: 7, overtime: true, runningLabel: null, overdueDays: 5, currentNode: '', currentHandler: '', currentNodeDays: null, approx: false, inPeriod: true };
const calcView = { period, snapshotId: 'weekly-x', overall, byCategory: [{ category: '内部驱动型', flowType: '', system: '', doneCount: 42, avgDays: 6.3, limitDays: null, judged: 40, overtime: 4, complianceRate: 0.9, runningCount: 18, runningOverdue: 5, runningOverdueRate: 0.28 }], byType: [], reviewerRank: [], initiatorRank: [], runningByInitiator: [], overtime: [flow], runningAbnormal: [], approxCount: 0, noLimitCount: 0, tracking: { added: 5, closed: 0 } };
const checkView = () => ({
  counts: ingest.systems, rosterCount: 29, outOfRoster: ['外部审核员'],
  unmatched: [{ system: 'CSS', flowName: '配件索赔登记', count: 4, regular: false }],
  unknownNodes: [{ system: 'OA', flowName: '退款申请流程', node: '数据复核岗', count: 3 }],
  ruleTypes: [{ system: 'CSS', category: '内部驱动型', flowType: '质量报告单' }, { system: 'OA', category: '内部驱动型', flowType: '退款申请流程' }],
  aliases: [], decisions: [],
});
const emptyState = (session: Record<string, unknown> = {}) => ({
  settings: { outputDir: '', weeklyRecipients: 'boss@example.com', monthlyRecipients: '', holidays: [], extraWorkdays: [] }, outputDir: '/out',
  session: { period: null, ingest: null, snapshotId: '', prevSnapshotId: '', cases: [], rootCauses: {}, summary: '', suggestions: [], summaryBy: '', reportFiles: [], sentAt: '', ledgerWritten: false, ...session },
  snapshots: [], tracking: [], ledger: [], reminders: [], mail: { address: 'me@example.com', smtpConfigured: true, officialRelay: false },
  rules: { version: 'v', custom: false, counts: { e2e: 35, cssNodes: 76, oaFkNodes: 669, personal: 31, managers: 11 } },
  thresholds: { amountThreshold: 100000, riskRatio: 0.8, avgIncreaseDays: 3, minComplianceRate: 0.95, internalDays: 3, externalDays: 7, improveRemindDays: 7 }, hasData: false,
});

type Handlers = Record<string, (p: any) => unknown>;
let wrappers: VueWrapper[] = [];
function setup(handlers: Handlers, state = emptyState()) {
  const calls: Array<[string, any]> = [];
  let current: any = state;
  const all: Handlers = { 'state.get': () => current, ...handlers };
  const invoke = vi.fn(async (action: string, payload: any) => {
    calls.push([action, payload]);
    const fn = all[action];
    if (!fn) throw new Error(`unexpected action ${action}`);
    return fn(payload);
  });
  (window as any).electronAPI = { workbenches: { flowSla: { invoke, onEvent: () => () => {} } } };
  fsState.value = state as any;
  return { calls, invoke, setState: (s: any) => { current = s; }, names: () => calls.map((c) => c[0]) };
}
function mountTab(component: any = BulletinTab) {
  const w = mount(component, { global: { plugins: [createPinia()], mocks: { $t }, provide: { [routerKey as symbol]: { push: vi.fn() } } } });
  wrappers.push(w);
  return w;
}
const stateOf = (w: VueWrapper, key: string) => w.find(`[data-step-key="${key}"] .ss-step__state`).text();
afterEach(() => { wrappers.forEach((w) => w.unmount()); wrappers = []; delete (window as any).electronAPI; fsState.value = null; vi.restoreAllMocks(); });

describe('通报向导', () => {
  it('六步各有自己的状态，步骤键不重名', () => {
    setup({});
    const w = mountTab();
    const keys = w.findAll('[data-step-key]').map((x) => x.attributes('data-step-key'));
    expect(keys).toEqual(['fs-import', 'fs-check', 'fs-calc', 'fs-compare', 'fs-reason', 'fs-report']);
    expect(new Set(keys).size).toBe(6);
    expect(keys.map((k) => stateOf(w, k!))).toEqual(Array(6).fill('待执行'));
    expect(w.find('[data-test="fs-import-commit"]').attributes('disabled')).toBeDefined();
    expect(w.text()).toContain('至少放一个系统的报表');
  });

  it('生成示例数据 → 第 1 步完成并带出核对内容；给节点定性后重新核对', async () => {
    const api = setup({
      'demo.generate': () => ({ summary: ingest, period, dir: '/out/示例数据' }),
      'check.run': checkView,
      'node.decide': () => true,
      'alias.set': () => true,
    });
    const w = mountTab();
    await w.find('[data-test="fs-demo"]').trigger('click'); await flushPromises();
    const sent = api.calls.find((c) => c[0] === 'demo.generate')![1];
    expect(sent.period.kind).toBe('weekly');
    expect(sent.period.end - sent.period.start).toBe(7 * 86_400_000);
    expect(stateOf(w, 'fs-import')).toBe('完成');
    expect(w.find('[data-step-key="fs-import"]').text()).toContain('OA 101 个流程');
    expect(w.text()).toContain('/out/示例数据');
    expect(api.names()).toContain('check.run');
    const check = w.find('[data-step-key="fs-check"]');
    expect(check.text()).toContain('配件索赔登记');
    expect(check.text()).toContain('数据复核岗');
    expect(check.text()).toContain('外部审核员');

    await w.find('[data-test="fs-node-in"]').trigger('click'); await flushPromises();
    expect(api.calls.find((c) => c[0] === 'node.decide')![1]).toEqual({ system: 'OA', flowName: '退款申请流程', node: '数据复核岗', internal: true });
    expect(api.names().filter((n) => n === 'check.run')).toHaveLength(2);

    const select = w.find('[data-test="fs-alias-配件索赔登记"]');
    // CSS 的流程只能对到 CSS 的规则细类，也不能确认为常规流程
    expect(select.findAll('option').map((o) => o.text())).toEqual(['— 选择规则细类 —', '内部驱动型 · 质量报告单']);
    await select.setValue('质量报告单'); await flushPromises();
    expect(api.calls.find((c) => c[0] === 'alias.set')![1]).toEqual({ system: 'CSS', flowName: '配件索赔登记', target: '质量报告单' });
  });

  it('计算：数字原样显示；失败落在第 3 步并写出真实原因，前面的步骤不受影响', async () => {
    let fail = true;
    const api = setup({
      'demo.generate': () => ({ summary: ingest, period, dir: '/out' }),
      'check.run': checkView,
      'calc.run': () => { if (fail) throw new Error('统计周期不存在或已删除'); return calcView; },
      'cases.get': () => ({ cases: [], mails: [] }),
    });
    const w = mountTab();
    await w.find('[data-test="fs-demo"]').trigger('click'); await flushPromises();
    await w.find('[data-test="fs-calc-run"]').trigger('click'); await flushPromises();
    expect(stateOf(w, 'fs-calc')).toBe('失败');
    expect(w.find('[data-step-key="fs-calc"] .sra').text()).toContain('统计周期不存在或已删除');
    expect(stateOf(w, 'fs-import')).toBe('完成');
    expect(stateOf(w, 'fs-check')).toBe('完成');
    expect(stateOf(w, 'fs-compare')).toBe('待执行');

    fail = false;
    await w.find('[data-test="fs-calc-run"]').trigger('click'); await flushPromises();
    expect(stateOf(w, 'fs-calc')).toBe('完成');
    const kpis = w.find('[data-test="fs-kpis"]').text();
    for (const s of ['42', '6.3', '90.0%', '18', '5', '2', '超时 4 / 参与判定 40', '合规 108 / 审核 120 次']) expect(kpis).toContain(s);
    expect(w.find('[data-step-key="fs-calc"]').text()).toContain('OA001');
    expect(w.find('[data-step-key="fs-calc"]').text()).toContain('新增 5 条');
    expect(api.names()).toContain('cases.get');
    expect(w.find('[data-step-key="fs-reason"]').text()).toContain('不需要收集原因');
  });

  it('通报：没填对收件人不能发；确认后才调用发送', async () => {
    const report = { kind: 'weekly', subject: '周通报', text: '正文', html: '<!doctype html><p>x</p>', files: [{ name: 'a.xlsx', path: '/out/a.xlsx' }] };
    const api = setup({
      'check.run': checkView, 'calc.view': () => calcView, 'cases.get': () => ({ cases: [], mails: [] }),
      'summary.save': () => ({}), 'report.build': () => report,
      'report.send': () => ({ via: 'self', notice: '', recipients: 1, ledgerAdded: 0 }),
    }, { ...emptyState({ period, ingest, snapshotId: 'weekly-x' }), hasData: true } as any);
    const w = mountTab(); await flushPromises();
    // 接上了上次的进度
    expect(['fs-import', 'fs-check', 'fs-calc'].map((k) => stateOf(w, k))).toEqual(['完成', '完成', '完成']);
    await w.find('[data-test="fs-report-build"]').trigger('click'); await flushPromises();
    expect(w.find('[data-test="fs-preview"]').attributes('sandbox')).toBe('');
    expect((w.find('[data-test="fs-recipients"]').element as HTMLTextAreaElement).value).toBe('boss@example.com');
    const send = w.find('[data-test="fs-report-send"]');
    await w.find('[data-test="fs-recipients"]').setValue('不是邮箱');
    expect(send.attributes('disabled')).toBeDefined();
    await w.find('[data-test="fs-recipients"]').setValue('boss@example.com');
    expect(send.attributes('disabled')).toBeUndefined();

    const confirm = vi.spyOn(window, 'confirm').mockReturnValue(false);
    await send.trigger('click'); await flushPromises();
    expect(api.names()).not.toContain('report.send');
    confirm.mockReturnValue(true);
    await send.trigger('click'); await flushPromises();
    expect(api.calls.find((c) => c[0] === 'report.send')![1]).toEqual({ to: 'boss@example.com', subject: '周通报', text: '正文' });
    expect(stateOf(w, 'fs-report')).toBe('完成');
  });
});

describe('改善台账', () => {
  it('登记一条：必填事项，保存后收起表单', async () => {
    const api = setup({ 'ledger.save': () => ({}) });
    const w = mountTab(LedgerTab);
    expect(w.text()).toContain('台账还是空的');
    await w.find('[data-test="fs-ledger-add"]').trigger('click');
    expect(w.find('[data-test="fs-ledger-save"]').attributes('disabled')).toBeDefined();
    await w.find('[data-test="fs-ledger-item"]').setValue('整理资料清单');
    await w.find('[data-test="fs-ledger-owner"]').setValue('张三');
    await w.find('[data-test="fs-ledger-deadline"]').setValue('2026-11-30');
    await w.find('form').trigger('submit'); await flushPromises();
    expect(api.calls.find((c) => c[0] === 'ledger.save')![1]).toEqual({ item: { item: '整理资料清单', dept: '', owner: '张三', requirement: '', deadline: '2026-11-30', acceptance: '' } });
    expect(w.find('form').exists()).toBe(false);
  });
  it('逾期的排最前并标升级督办；完成后才能归档', async () => {
    const item = (p: Record<string, unknown>) => ({ id: 'x', item: '事项', dept: '甲部', owner: '张三', requirement: '', deadline: '2020-01-01', acceptance: '', status: 'doing', escalated: false, source: '', progress: [], createdAt: '', updatedAt: '', remindedFor: '', escalatedFor: '', ...p });
    const api = setup({ 'ledger.save': () => ({}) }, { ...emptyState(), ledger: [item({ id: 'a', item: '已完成的', status: 'done' }), item({ id: 'b', item: '逾期的', status: 'overdue', escalated: true })] } as any);
    const w = mountTab(LedgerTab);
    const rows = w.findAll('[data-test="fs-ledger-row"]');
    expect(rows.map((r) => r.find('strong').text())).toEqual(['逾期的', '已完成的']);
    expect(rows[0].text()).toContain('升级督办');
    expect(rows[0].find('[data-test="fs-ledger-archive"]').exists()).toBe(false);
    expect(w.find('[data-test="fs-ledger-count-overdue"]').text()).toBe('1');
    await rows[1].find('[data-test="fs-ledger-archive"]').trigger('click'); await flushPromises();
    expect(api.calls.find((c) => c[0] === 'ledger.save')![1]).toEqual({ item: { id: 'a', item: '已完成的', status: 'archived' } });
  });
});

describe('在途跟进', () => {
  it('到了跟进日的标出来；记进展调用主进程并清空输入', async () => {
    const t = (p: Record<string, unknown>) => ({ key: 'OA|A1', system: 'OA', flowNo: 'A1', flowName: '退款申请流程', title: '', flowType: '退款申请流程', category: '内部驱动型', initiator: '张三', handler: '王五', handlerEmail: '', currentNode: '出纳付款', startAt: 1, days: 40, limitDays: 7, overdueDays: 33, currentNodeDays: 20, intervalDays: 3, firstSeenAt: '2026-10-01T00:00:00.000Z', lastFollowAt: '', nextFollowAt: '2020-01-01T00:00:00.000Z', notifiedFor: '', notes: [], closedAt: '', closeReason: '', ...p });
    const api = setup({ 'track.note': () => true }, { ...emptyState(), tracking: [t({}), t({ key: 'OA|A2', flowNo: 'A2', nextFollowAt: '2999-01-01T00:00:00.000Z', intervalDays: 7 }), t({ key: 'OA|A3', flowNo: 'A3', closedAt: '2026-10-10T00:00:00.000Z' })] } as any);
    const w = mountTab(TrackTab);
    expect(w.find('[data-test="fs-track-open"]').text()).toBe('2');
    expect(w.find('[data-test="fs-track-due"]').text()).toBe('1');
    expect(w.find('[data-test="fs-track-A1"]').text()).toContain('该跟进了');
    expect(w.find('[data-test="fs-track-A2"]').text()).toContain('外部流转 · 每 7 天');
    expect(w.find('[data-test="fs-track-A3"]').exists()).toBe(false);
    await w.find('[data-test="fs-note-A1"]').setValue('已电话催办，周五前付款');
    await w.find('[data-test="fs-note-save-A1"]').trigger('click'); await flushPromises();
    expect(api.calls.find((c) => c[0] === 'track.note')![1]).toEqual({ key: 'OA|A1', text: '已电话催办，周五前付款' });
    expect((w.find('[data-test="fs-note-A1"]').element as HTMLInputElement).value).toBe('');
    await w.find('[data-test="fs-track-view-closed"]').trigger('click');
    expect(w.find('[data-test="fs-track-A3"]').exists()).toBe(true);
  });
});
