// @vitest-environment happy-dom
/**
 * 运算向导：五步都在页面上且各有独立状态；失败落在出错的那一步并显示真实原因；
 * 缺货计划没检验完时补库清单不能确认；传给主进程的参数是普通对象。
 * 假桥用主进程的真实计算与清单逻辑搭，状态和真实的一样。
 */
import { afterEach, describe, expect, it, vi } from 'vitest';
import { flushPromises, mount } from '@vue/test-utils';
import { createPinia } from 'pinia';
import { isReactive } from 'vue';
import type { PaPartResult, PaReview, PaWorkbenchState } from '@totalclaw/ipc-contracts';
import RunTab from './RunTab.vue';
import { paResults, paState, refreshState } from './shared';
import { buildDemoData } from '../../../main/services/partsAlert/demoData';
import { buildReplenishLines, pendingCounts, runCompute } from '../../../main/services/partsAlert/plan';
import { DEFAULT_PARAMS } from '../../../main/services/partsAlert/calc';

const ASOF = '2026-10-13';
const $t = (s: string, args?: any) => s.replace(/\{(\w+)\}/g, (_, k) => String(args?.[k] ?? k));

function fakeBridge(opts: { fed?: boolean; computed?: boolean; failCompute?: string } = {}) {
  const meta = (name: string) => ({ path: `/d/${name}`, fileName: name, sheetName: 's', sheetNames: ['s'], headers: ['配件编码'], rowCount: 60, preview: [], mapping: { partNo: '配件编码' }, layout: 'long', periodColumns: 0, periodFrom: '', periodTo: '', missing: [], loaded: true, count: 60, skippedCount: 0, skipped: [], notes: [], loadedAt: 'x' });
  const st = {
    datasets: { monthly: null, yearly: null, leadTime: null, inTransit: null, stock: null } as Record<string, any>,
    results: [] as PaPartResult[], run: null as any, n: 0,
  };
  const feed = () => { for (const k of Object.keys(st.datasets)) st.datasets[k] = meta(`${k}.xlsx`); };
  const compute = () => {
    const out = runCompute(buildDemoData(ASOF), { ...DEFAULT_PARAMS }, ASOF);
    st.results = out.results;
    st.n += 1;
    st.run = { id: `run${st.n}`, asOf: ASOF, computedAt: '2026-10-13T01:00:00Z', rules: { ...DEFAULT_PARAMS }, summary: out.summary, stale: false, staleReason: '', reviews: {} as Record<string, PaReview>, edits: {}, replenishConfirmedAt: '', exported: null };
  };
  if (opts.fed || opts.computed) feed();
  if (opts.computed) compute();
  const calls: Array<{ action: string; payload: any }> = [];
  const state = (): PaWorkbenchState => ({
    settings: { rules: { ...DEFAULT_PARAMS }, outputDir: '', schedule: {} as any }, outputDir: '/out', defaults: { rules: { ...DEFAULT_PARAMS }, keywords: {} as any },
    datasets: st.datasets as any, run: st.run,
    pending: st.run ? pendingCounts(st.results, st.run.reviews) : { stagnant: 0, redundant: 0, shortage_transit: 0, shortage_none: 0 },
    lines: st.run ? buildReplenishLines(st.results, st.run.reviews, st.run.edits, ASOF) : [],
    history: [], scheduleStatus: { lastRunDay: '', lastRunAt: '', lastOk: false, lastMessage: '', lastFiles: [] }, latest: null,
  });
  const invoke = vi.fn(async (action: string, payload: any) => {
    calls.push({ action, payload });
    if (action === 'state.get') return JSON.parse(JSON.stringify(state()));
    if (action === 'results.get') return JSON.parse(JSON.stringify(payload.which === 'latest' ? [] : st.results));
    if (action === 'data.demo') { feed(); return { dir: '/out/示例数据', files: {} }; }
    if (action === 'compute.run') { if (opts.failCompute) throw new Error(`Error invoking remote method 'x': Error: ${opts.failCompute}`); compute(); return st.run.summary; }
    if (action === 'review.set') { for (const it of payload.items) st.run.reviews[it.partNo] = { ...(st.run.reviews[it.partNo] || { status: 'pending' }), ...it }; st.run.replenishConfirmedAt = ''; return true; }
    if (action === 'review.bulk') { for (const r of st.results) { const sh = r.state === 'at_risk' || r.state === 'out_of_stock'; const g = sh ? (r.hasInTransit ? 'shortage_transit' : 'shortage_none') : r.state; if (g === payload.group && !st.run.reviews[r.partNo]) st.run.reviews[r.partNo] = { status: payload.status }; } return 1; }
    if (action === 'replenish.set') { for (const it of payload.items) st.run.edits[it.partNo] = { ...(st.run.edits[it.partNo] || {}), ...it }; st.run.replenishConfirmedAt = ''; return true; }
    if (action === 'replenish.confirm') { st.run.replenishConfirmedAt = '2026-10-13T02:00:00Z'; return {}; }
    if (action === 'order.export') { st.run.exported = { at: '2026-10-13T03:00:00Z', orderFile: '/out/采购订单_20261013.xlsx', planFile: '/out/库存状态与行动计划_20261013.xlsx', lines: 3, qty: 10, amount: 0 }; return st.run.exported; }
    return true;
  });
  (window as any).electronAPI = { workbenches: { partsAlert: { invoke, onEvent: () => () => {} } } };
  return { invoke, calls, st };
}

async function mountTab() {
  paState.value = null; paResults.value = [];
  await refreshState();
  const w = mount(RunTab, { attachTo: document.body, global: { plugins: [createPinia()], mocks: { $t } } });
  await flushPromises();
  return w;
}
const stepState = (w: any, key: string): string => w.find(`[data-step-key="${key}"] .ss-step__state`).text();

describe('运算向导', () => {
  const wrappers: any[] = [];
  afterEach(() => { wrappers.splice(0).forEach((w) => w.unmount()); delete (window as any).electronAPI; });

  it('五步都在页面上，各有编号和状态；没投喂时不能运算', async () => {
    fakeBridge();
    const w = await mountTab(); wrappers.push(w);
    const cards = w.findAll('[data-step-key]');
    expect(cards.map((c) => c.attributes('data-step-key'))).toEqual(['pa-feed', 'pa-compute', 'pa-plan', 'pa-replenish', 'pa-order']);
    cards.forEach((c, i) => expect(c.text()).toContain(`第 ${i + 1} 步`));
    expect(cards.map((c) => c.find('.ss-step__state').text())).toEqual(['待执行', '待执行', '待执行', '待执行', '待执行']);
    expect(w.find('[data-test="pa-compute-run"]').attributes('disabled')).toBeDefined();
    expect(w.find('[data-test="pa-order-export"]').attributes('disabled')).toBeDefined();
    expect(w.findAll('[data-test^="pa-slot-"]').length).toBe(5);
  });

  it('生成示例数据 → 第 1 步完成；运算 → 第 2 步完成并显示五种状态的数量', async () => {
    const b = fakeBridge();
    const w = await mountTab(); wrappers.push(w);
    await w.find('[data-test="pa-demo"]').trigger('click'); await flushPromises();
    expect(stepState(w, 'pa-feed')).toBe('完成');
    await w.find('[data-test="pa-compute-run"]').trigger('click'); await flushPromises();
    expect(b.calls.find((c) => c.action === 'compute.run')!.payload.asOf).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(stepState(w, 'pa-compute')).toBe('完成');
    expect(w.find('[data-test="pa-state-out_of_stock"] strong').text()).toBe('8');
    expect(w.find('[data-test="pa-state-at_risk"] strong').text()).toBe('12');
    expect(w.find('[data-test="pa-state-healthy"] strong').text()).toBe('22');
    expect(w.find('[data-test="pa-result-table"]').findAll('tbody tr').length).toBe(50);
  });

  it('运算失败：只有第 2 步标失败并写出真实原因', async () => {
    fakeBridge({ fed: true, failCompute: '投喂的数据里没有读到任何配件' });
    const w = await mountTab(); wrappers.push(w);
    await w.find('[data-test="pa-compute-run"]').trigger('click'); await flushPromises();
    expect(stepState(w, 'pa-compute')).toBe('失败');
    expect(w.find('[data-step-key="pa-compute"] .sra').text()).toContain('投喂的数据里没有读到任何配件');
    expect(stepState(w, 'pa-feed')).toBe('完成');
    expect(stepState(w, 'pa-plan')).toBe('待执行');
  });

  it('算式依据可以逐行展开', async () => {
    const b = fakeBridge({ computed: true });
    const w = await mountTab(); wrappers.push(w);
    const first = b.st.results.find((r) => r.state === 'out_of_stock')!;
    expect(w.text()).not.toContain(first.basis[0]);
    await w.find(`[data-test="pa-basis-${first.partNo}"]`).trigger('click');
    expect(w.text()).toContain(first.basis[0]);
  });

  it('缺货计划没检验完：提示还剩多少个，补库清单不能确认；检验完才放行，生成订单要先确认清单', async () => {
    const b = fakeBridge({ computed: true });
    const w = await mountTab(); wrappers.push(w);
    expect(w.find('[data-test="pa-plan-left"]').text()).toContain('20');
    expect(w.find('[data-test="pa-lines-empty"]').exists()).toBe(true);
    // 四组都在：呆滞处理建议、有在途、无在途
    for (const g of ['shortage_none', 'shortage_transit', 'stagnant', 'redundant']) expect(w.find(`[data-test="pa-group-${g}"]`).exists()).toBe(true);
    expect(w.find('[data-test="pa-group-shortage_transit"]').text()).toContain('有采购在途的管控举措');
    expect(w.find('[data-test="pa-group-shortage_none"]').text()).toContain('无采购在途的管控举措');
    expect(w.find('[data-test="pa-group-stagnant"]').text()).toContain('呆滞库存处理建议');

    const one = b.st.results.find((r) => r.state === 'at_risk' && !r.hasInTransit && r.suggestQty > 0)!;
    await w.find(`[data-test="pa-confirm-${one.partNo}"]`).trigger('click'); await flushPromises();
    const call = b.calls.find((c) => c.action === 'review.set')!;
    expect(call.payload).toEqual({ items: [{ partNo: one.partNo, status: 'confirmed' }] });
    expect(isReactive(call.payload) || isReactive(call.payload.items)).toBe(false);
    expect(w.find('[data-test="pa-plan-left"]').text()).toContain('19');
    expect(w.find('[data-test="pa-lines"]').exists()).toBe(true);
    expect(w.find('[data-test="pa-lines-confirm"]').attributes('disabled')).toBeDefined();

    await w.find('[data-test="pa-bulk-shortage_none"]').trigger('click'); await flushPromises();
    await w.find('[data-test="pa-bulk-shortage_transit"]').trigger('click'); await flushPromises();
    expect(w.find('[data-test="pa-plan-left"]').exists()).toBe(false);
    expect(stepState(w, 'pa-plan')).toBe('完成');
    expect(w.find('[data-test="pa-order-export"]').attributes('disabled')).toBeDefined();

    // 改下单量：公式建议量保留，并排显示
    const line = paState.value!.lines[0];
    const typeQty = async (v: string): Promise<void> => { const el = w.find(`[data-test="pa-line-qty-${line.partNo}"]`); (el.element as HTMLInputElement).value = v; await el.trigger('change'); await flushPromises(); };
    await typeQty(String(line.suggestQty + 30));
    expect(b.calls.filter((c) => c.action === 'replenish.set').pop()!.payload).toEqual({ items: [{ partNo: line.partNo, qty: line.suggestQty + 30 }] });
    expect(w.find('[data-test="pa-lines"]').text()).toContain(`建议 ${line.suggestQty.toLocaleString('zh-CN')}，改为 ${(line.suggestQty + 30).toLocaleString('zh-CN')}`);
    // 乱填的数量不发给主进程，这一步标失败
    const n = b.calls.length;
    await typeQty('0');
    expect(b.calls.slice(n).map((c) => c.action)).toEqual([]);
    expect(b.calls.filter((c) => c.action === 'replenish.set').length).toBe(1);
    expect(stepState(w, 'pa-replenish')).toBe('失败');

    await w.find('[data-test="pa-lines-confirm"]').trigger('click'); await flushPromises();
    expect(stepState(w, 'pa-replenish')).toBe('完成');
    expect(b.calls.some((c) => c.action === 'order.export')).toBe(false);
    await w.find('[data-test="pa-order-export"]').trigger('click'); await flushPromises();
    expect(stepState(w, 'pa-order')).toBe('完成');
    expect(w.text()).toContain('/out/采购订单_20261013.xlsx');
    expect(w.find('[data-step-key="pa-order"]').text()).toContain('应用不会向任何系统提交订单');
  });
});
