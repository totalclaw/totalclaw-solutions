import { describe, expect, it } from 'vitest';
import type { PaPartResult, PaWorkbenchState } from '@totalclaw/ipc-contracts';
import { blockingPending, currentStep, defaultPlanText, deriveSteps, filterSortResults, planGroupOf, STEP_KEYS } from './shared';
import { planGroupOf as mainPlanGroupOf, defaultPlanText as mainDefaultPlanText } from '../../../main/services/partsAlert/plan';

function part(p: Partial<PaPartResult>): PaPartResult {
  return {
    partNo: 'A', partName: '', state: 'healthy', stockQty: 0, inTransitQty: 0, earliestEta: '', leadDays: 30, leadDaysDefaulted: false, dailyDemand: 1, monthlyDemand: 30,
    coverDays: null, lastShipMonth: '', monthsSinceLastShip: null, stockoutDate: '', latestOrderDate: '', yearlyTrend: null, hasInTransit: false, actions: [], suggestQty: 0,
    suggestAmount: null, basis: [], supplier: '', unitPrice: null, ...p,
  };
}

const ROWS = [
  part({ partNo: 'P1', partName: '点火针', state: 'healthy', stockQty: 300, coverDays: 90 }),
  part({ partNo: 'P2', partName: '热电偶', state: 'out_of_stock', stockQty: 0, coverDays: 0, stockoutDate: '2026-10-13', supplier: '甲厂' }),
  part({ partNo: 'P3', partName: '电磁阀', state: 'at_risk', stockQty: 40, coverDays: 12, stockoutDate: '2026-10-25', hasInTransit: true }),
  part({ partNo: 'P4', partName: '旋钮', state: 'stagnant', stockQty: 900 }),
  part({ partNo: 'P5', partName: '炉头', state: 'redundant', stockQty: 5000, coverDays: 400 }),
];

describe('结果表筛选与排序', () => {
  const q = { states: [], keyword: '', sort: 'state' as const, desc: false };
  it('默认按紧急程度：已缺货 → 将缺货 → 呆滞 → 冗余 → 健康', () => {
    expect(filterSortResults(ROWS, q).map((r) => r.partNo)).toEqual(['P2', 'P3', 'P4', 'P5', 'P1']);
  });
  it('按状态、按关键字（编码 / 名称 / 供应商）筛选', () => {
    expect(filterSortResults(ROWS, { ...q, states: ['at_risk', 'out_of_stock'] }).map((r) => r.partNo)).toEqual(['P2', 'P3']);
    expect(filterSortResults(ROWS, { ...q, keyword: '旋钮' }).map((r) => r.partNo)).toEqual(['P4']);
    expect(filterSortResults(ROWS, { ...q, keyword: 'p5' }).map((r) => r.partNo)).toEqual(['P5']);
    expect(filterSortResults(ROWS, { ...q, keyword: '甲厂' }).map((r) => r.partNo)).toEqual(['P2']);
  });
  it('数字列按数值排，空值不管升降序都排最后；不改原数组', () => {
    const before = ROWS.map((r) => r.partNo);
    expect(filterSortResults(ROWS, { ...q, sort: 'stockQty', desc: true }).map((r) => r.partNo)).toEqual(['P5', 'P4', 'P1', 'P3', 'P2']);
    expect(filterSortResults(ROWS, { ...q, sort: 'coverDays' }).map((r) => r.partNo)).toEqual(['P2', 'P3', 'P1', 'P5', 'P4']);
    expect(filterSortResults(ROWS, { ...q, sort: 'coverDays', desc: true }).map((r) => r.partNo)).toEqual(['P5', 'P1', 'P3', 'P2', 'P4']);
    expect(filterSortResults(ROWS, { ...q, sort: 'stockoutDate' }).map((r) => r.partNo).slice(0, 2)).toEqual(['P2', 'P3']);
    expect(ROWS.map((r) => r.partNo)).toEqual(before);
  });
});

describe('行动计划分组与主进程一致', () => {
  it('五种状态 × 有无在途', () => {
    for (const r of ROWS) {
      expect(planGroupOf(r)).toBe(mainPlanGroupOf(r));
      expect(planGroupOf({ ...r, hasInTransit: !r.hasInTransit })).toBe(mainPlanGroupOf({ ...r, hasInTransit: !r.hasInTransit }));
    }
    const withActions = part({ actions: [{ kind: 'expedite', text: '催交' }, { kind: 'transfer_in', text: '调拨' }] });
    expect(defaultPlanText(withActions)).toBe(mainDefaultPlanText(withActions));
    expect(defaultPlanText(withActions)).toBe('1. 催交\n2. 调拨');
  });
});

function ws(p: Partial<PaWorkbenchState>): PaWorkbenchState {
  return {
    settings: {} as any, outputDir: '', defaults: {} as any,
    datasets: { monthly: null, yearly: null, leadTime: null, inTransit: null, stock: null },
    run: null, pending: { stagnant: 0, redundant: 0, shortage_transit: 0, shortage_none: 0 }, lines: [], history: [],
    scheduleStatus: { lastRunDay: '', lastRunAt: '', lastOk: false, lastMessage: '', lastFiles: [] }, latest: null, ...p,
  };
}
const loaded = { loaded: true } as any;
const run = (p: any = {}): any => ({ id: 'r1', asOf: '2026-10-13', computedAt: '2026-10-13T01:00:00Z', summary: { total: 5 }, stale: false, staleReason: '', reviews: {}, edits: {}, replenishConfirmedAt: '', exported: null, ...p });

describe('向导步骤状态', () => {
  it('从零开始：全部待执行，当前在第 1 步', () => {
    const rt = deriveSteps(ws({}), '', {});
    expect(STEP_KEYS.map((k) => rt[k].state)).toEqual(['todo', 'todo', 'todo', 'todo', 'todo']);
    expect(currentStep(rt)).toBe('pa-feed');
    expect(deriveSteps(null, '', {})['pa-feed'].state).toBe('todo');
  });
  it('必须的两份数据到齐第 1 步才算完成', () => {
    expect(deriveSteps(ws({ datasets: { monthly: loaded, yearly: null, leadTime: null, inTransit: null, stock: null } }), '', {})['pa-feed'].state).toBe('todo');
    const rt = deriveSteps(ws({ datasets: { monthly: loaded, yearly: null, leadTime: null, inTransit: null, stock: loaded } }), '', {});
    expect(rt['pa-feed'].state).toBe('done');
    expect(currentStep(rt)).toBe('pa-compute');
  });
  it('逐步推进：运算 → 检验完 → 确认清单 → 生成订单', () => {
    const fed = { monthly: loaded, yearly: null, leadTime: null, inTransit: null, stock: loaded };
    const pendingLeft = { stagnant: 3, redundant: 2, shortage_transit: 1, shortage_none: 4 };
    const pendingDone = { stagnant: 3, redundant: 2, shortage_transit: 0, shortage_none: 0 };
    let s = ws({ datasets: fed, run: run(), pending: pendingLeft });
    expect(blockingPending(s)).toBe(5);
    expect(currentStep(deriveSteps(s, '', {}))).toBe('pa-plan');
    // 呆滞、冗余没检验不挡后面
    s = ws({ datasets: fed, run: run(), pending: pendingDone });
    expect(currentStep(deriveSteps(s, '', {}))).toBe('pa-replenish');
    s = ws({ datasets: fed, run: run({ replenishConfirmedAt: '2026-10-13T02:00:00Z' }), pending: pendingDone });
    expect(currentStep(deriveSteps(s, '', {}))).toBe('pa-order');
    s = ws({ datasets: fed, run: run({ replenishConfirmedAt: '2026-10-13T02:00:00Z', exported: { at: '2026-10-13T03:00:00Z', lines: 7 } }), pending: pendingDone });
    expect(STEP_KEYS.map((k) => deriveSteps(s, '', {})[k].state)).toEqual(['done', 'done', 'done', 'done', 'done']);
    // 导出之后又改了清单并重新确认：订单要重新生成
    s = ws({ datasets: fed, run: run({ replenishConfirmedAt: '2026-10-13T04:00:00Z', exported: { at: '2026-10-13T03:00:00Z', lines: 7 } }), pending: pendingDone });
    expect(deriveSteps(s, '', {})['pa-order'].state).toBe('todo');
  });
  it('结果过期：第 2 步及之后全部打回待执行', () => {
    const s = ws({ datasets: { monthly: loaded, yearly: null, leadTime: null, inTransit: null, stock: loaded }, run: run({ stale: true, replenishConfirmedAt: 'x', exported: { at: 'y', lines: 1 } }) });
    expect(STEP_KEYS.map((k) => deriveSteps(s, '', {})[k].state)).toEqual(['done', 'todo', 'todo', 'todo', 'todo']);
  });
  it('进行中与失败落在具体那一步，失败带原因', () => {
    const rt = deriveSteps(ws({}), 'pa-compute', { 'pa-feed': '文件不存在' });
    expect(rt['pa-compute'].state).toBe('running');
    expect(rt['pa-feed']).toEqual({ state: 'failed', error: '文件不存在' });
    expect(rt['pa-plan'].state).toBe('todo');
  });
});
