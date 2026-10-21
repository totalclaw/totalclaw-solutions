// @vitest-environment happy-dom
/** 规则、定时运算、预警看板三个页签：能挂载、按钮发出的动作和参数正确、错误如实显示。 */
import { afterEach, describe, expect, it, vi } from 'vitest';
import { flushPromises, mount } from '@vue/test-utils';
import { createPinia } from 'pinia';
import type { PaWorkbenchState } from '@totalclaw/ipc-contracts';
import RulesTab from './RulesTab.vue';
import ScheduleTab from './ScheduleTab.vue';
import BoardTab from './BoardTab.vue';
import { paLatest, paState } from './shared';
import { buildDemoData } from '../../../main/services/partsAlert/demoData';
import { runCompute } from '../../../main/services/partsAlert/plan';
import { DEFAULT_PARAMS } from '../../../main/services/partsAlert/calc';
import KW from '../../../main/services/partsAlert/columnKeywords.json';

// 图表库在测试环境里没有画布，换成占位
vi.mock('vue-echarts', () => ({ default: { name: 'VChart', props: ['option'], template: '<div class="chart-stub"></div>' } }));

const $t = (s: string, args?: any) => s.replace(/\{(\w+)\}/g, (_, k) => String(args?.[k] ?? k));
const ASOF = '2026-10-13';
const computed = runCompute(buildDemoData(ASOF), { ...DEFAULT_PARAMS }, ASOF);

function baseState(p: Partial<PaWorkbenchState> = {}): PaWorkbenchState {
  return {
    settings: { rules: { ...DEFAULT_PARAMS }, outputDir: '', schedule: { enabled: false, time: '08:00', folder: '', keywords: JSON.parse(JSON.stringify(KW.fileKeywords)), notify: true, emailEnabled: false, emailTo: '' } },
    outputDir: '/out', defaults: { rules: { ...DEFAULT_PARAMS }, keywords: JSON.parse(JSON.stringify(KW.fileKeywords)) },
    datasets: { monthly: null, yearly: null, leadTime: null, inTransit: null, stock: null }, run: null,
    pending: { stagnant: 0, redundant: 0, shortage_transit: 0, shortage_none: 0 }, lines: [], history: [],
    scheduleStatus: { lastRunDay: '', lastRunAt: '', lastOk: false, lastMessage: '', lastFiles: [] }, latest: null, ...p,
  };
}

function bridge(handlers: Record<string, (p: any) => any> = {}) {
  const calls: Array<{ action: string; payload: any }> = [];
  const invoke = vi.fn(async (action: string, payload: any) => {
    calls.push({ action, payload });
    if (handlers[action]) return handlers[action](payload);
    if (action === 'state.get') return JSON.parse(JSON.stringify(paState.value));
    if (action === 'results.get') return [];
    return {};
  });
  (window as any).electronAPI = { workbenches: { partsAlert: { invoke, onEvent: () => () => {} } } };
  return calls;
}
const mountIt = (c: any) => mount(c, { global: { plugins: [createPinia()], mocks: { $t } } });

describe('规则 / 定时运算 / 预警看板', () => {
  const ws: any[] = [];
  afterEach(() => { ws.splice(0).forEach((w) => w.unmount()); delete (window as any).electronAPI; paState.value = null; paLatest.value = []; });

  it('规则：没改不能保存；乱填被拦住不发请求；合法的发给主进程；恢复默认', async () => {
    paState.value = baseState({ settings: { ...baseState().settings, rules: { ...DEFAULT_PARAMS, safetyDays: 20 } } });
    const calls = bridge({ 'rules.save': (p) => { paState.value = baseState({ settings: { ...baseState().settings, rules: p.rules } }); return p.rules; } });
    const w = mountIt(RulesTab); ws.push(w);
    expect((w.find('[data-test="pa-rule-safetyDays"]').element as HTMLInputElement).value).toBe('20');
    expect(w.text()).toContain('默认 15');
    expect(w.find('[data-test="pa-rules-save"]').attributes('disabled')).toBeDefined();
    await w.find('[data-test="pa-rule-stagnantMonths"]').setValue('30');
    await w.find('[data-test="pa-rules-save"]').trigger('click'); await flushPromises();
    expect(calls.some((c) => c.action === 'rules.save')).toBe(false);
    expect(w.text()).toContain('报废评估月数不能小于呆滞月数');
    await w.find('[data-test="pa-rule-stagnantMonths"]').setValue('18');
    await w.find('[data-test="pa-rules-save"]').trigger('click'); await flushPromises();
    expect(calls.find((c) => c.action === 'rules.save')!.payload.rules).toMatchObject({ safetyDays: 20, stagnantMonths: 18, seasonal: true });
    expect(w.text()).toContain('规则已保存');
    await w.find('[data-test="pa-rules-reset"]').trigger('click'); await flushPromises();
    expect(calls.some((c) => c.action === 'rules.reset')).toBe(true);
  });

  it('定时运算：字样按逗号拆开保存；保存失败显示原因；立即运行的失败原因如实显示', async () => {
    paState.value = baseState();
    let fail = '开启定时运算前先选数据文件夹';
    const calls = bridge({
      'schedule.save': (p) => { if (fail) throw new Error(fail); paState.value = baseState({ settings: { ...baseState().settings, schedule: p.schedule } }); return p.schedule; },
      'schedule.runNow': () => ({ ok: false, message: '数据文件夹里没有找到：实时库存' }),
      'schedule.preview': () => ({ stock: '配件实时库存.xlsx' }),
    });
    const w = mountIt(ScheduleTab); ws.push(w);
    await flushPromises();
    await w.find('[data-test="pa-sched-enabled"]').setValue(true);
    await w.find('[data-test="pa-sched-save"]').trigger('click'); await flushPromises();
    expect(w.find('[data-test="pa-sched-error"]').text()).toBe(fail);
    fail = '';
    await w.find('[data-test="pa-sched-folder"]').setValue('/data/feed');
    await w.find('[data-test="pa-sched-kw-stock"]').setValue('库存, 结存；现存量');
    await w.find('[data-test="pa-sched-run"]').trigger('click'); await flushPromises();
    const saved = calls.filter((c) => c.action === 'schedule.save').pop()!.payload.schedule;
    expect(saved).toMatchObject({ enabled: true, folder: '/data/feed', time: '08:00' });
    expect(saved.keywords.stock).toEqual(['库存', '结存', '现存量']);
    expect(saved.keywords.monthly).toEqual(KW.fileKeywords.monthly);
    expect(calls.some((c) => c.action === 'schedule.runNow')).toBe(true);
    expect(w.find('[data-test="pa-sched-error"]').text()).toBe('数据文件夹里没有找到：实时库存');
    expect(w.text()).toContain('配件实时库存.xlsx');
  });

  it('定时运算：上一次的结果（成功或失败）原样显示', async () => {
    paState.value = baseState({ scheduleStatus: { lastRunDay: ASOF, lastRunAt: '2026-10-13T00:00:00Z', lastOk: false, lastMessage: '「库存.xlsx」里必填的列没有认出来', lastFiles: ['库存.xlsx'] } });
    bridge();
    const w = mountIt(ScheduleTab); ws.push(w);
    await flushPromises();
    const last = w.find('[data-test="pa-sched-last"]');
    expect(last.classes()).toContain('danger');
    expect(last.text()).toContain('没有完成');
    expect(last.text()).toContain('必填的列没有认出来');
  });

  it('看板：没有运算过给空状态；有结果时列出最紧急的缺货和呆滞库存', async () => {
    paState.value = baseState();
    bridge();
    const empty = mountIt(BoardTab); ws.push(empty);
    expect(empty.find('.ss-empty').exists()).toBe(true);
    expect(empty.find('.chart-stub').exists()).toBe(false);

    const entry = (id: string, source: 'manual' | 'schedule'): any => ({ id, at: '2026-10-13T01:00:00Z', asOf: ASOF, source, total: 60, byState: computed.summary.byState, replenishParts: 1, replenishQty: 1, replenishAmount: 1, newOut: ['X'], newRisk: [], files: [], note: '' });
    paState.value = baseState({ latest: { at: '2026-10-13T01:00:00Z', asOf: ASOF, source: 'schedule', summary: computed.summary }, history: [entry('b', 'schedule'), entry('a', 'manual')] });
    paLatest.value = computed.results;
    const w = mountIt(BoardTab); ws.push(w);
    expect(w.findAll('.chart-stub').length).toBe(2);
    const tables = w.findAll('table');
    const shortageRows = tables[0].findAll('tbody tr');
    expect(shortageRows.length).toBe(12);
    // 已缺货的排在将缺货前面
    const states = shortageRows.map((r) => r.text().includes('库存已缺货'));
    expect(states.indexOf(false)).toBe(8);
    expect(states.slice(8).every((x) => !x)).toBe(true);
    expect(tables[1].findAll('tbody tr').length).toBe(8);
    expect(tables[2].findAll('tbody tr').length).toBe(2);
    expect(w.text()).toContain('新增已缺货 1 个');
  });
});
