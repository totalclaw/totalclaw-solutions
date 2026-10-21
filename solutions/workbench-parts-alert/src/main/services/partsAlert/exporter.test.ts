import { afterAll, describe, expect, it } from 'vitest';
import { existsSync, mkdirSync, mkdtempSync, rmSync, utimesSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { basename, join } from 'node:path';
import type { PaReview } from '@totalclaw/ipc-contracts';
import { listSheetNames, readTable } from '../serviceSettlement/excel';
import { buildDemoData } from './demoData';
import { exportPurchaseOrder, exportStatusPlan, freeFile } from './exporter';
import { buildReplenishLines, defaultExpectDate, defaultPlanText, diffNewAlerts, lineTotals, pendingCounts, planGroupOf, runCompute } from './plan';
import { datasetOfFileName, dueToday, pickNewestFiles } from './schedule';
import { PartsAlertStore, defaultKeywords, defaultRules, normalizeRules, normalizeSchedule } from './store';

const dir = mkdtempSync(join(tmpdir(), 'pa-export-'));
afterAll(() => { rmSync(dir, { recursive: true, force: true }); });

const ASOF = '2026-10-13';
const { results, summary } = runCompute(buildDemoData(ASOF), defaultRules(), ASOF);
const shortage = results.filter((r) => r.state === 'at_risk' || r.state === 'out_of_stock');

function confirmAll(): Record<string, PaReview> {
  return Object.fromEntries(shortage.map((r) => [r.partNo, { status: 'confirmed' as const }]));
}

describe('行动计划与补库清单', () => {
  it('分组：呆滞 / 冗余 / 有在途 / 无在途，健康的不进计划', () => {
    const groups = new Set(results.map((r) => planGroupOf(r)));
    expect(groups).toEqual(new Set(['stagnant', 'redundant', 'shortage_transit', 'shortage_none', null]));
    expect(results.filter((r) => r.state === 'healthy').every((r) => planGroupOf(r) === null)).toBe(true);
    const p = pendingCounts(results, {});
    expect(p.stagnant).toBe(8);
    expect(p.redundant).toBe(10);
    expect(p.shortage_transit + p.shortage_none).toBe(20);
    expect(defaultPlanText(shortage[0]).split('\n').length).toBe(shortage[0].actions.length);
  });

  it('没检验的、驳回的不进补库清单；确认后才进', () => {
    expect(buildReplenishLines(results, {}, {}, ASOF)).toEqual([]);
    const reviews = confirmAll();
    const all = buildReplenishLines(results, reviews, {}, ASOF);
    expect(all.length).toBe(shortage.filter((r) => r.suggestQty > 0).length);
    expect(all.length).toBeGreaterThan(5);
    const first = all[0].partNo;
    reviews[first] = { status: 'rejected' };
    expect(buildReplenishLines(results, reviews, {}, ASOF).some((l) => l.partNo === first)).toBe(false);
    expect(pendingCounts(results, reviews).shortage_none + pendingCounts(results, reviews).shortage_transit).toBe(0);
  });

  it('默认下单量 = 公式建议量，默认到货日 = 基准日 + 提前期；人改量后建议量不变、金额按新量算', () => {
    const reviews = confirmAll();
    const base = buildReplenishLines(results, reviews, {}, ASOF);
    const l = base.find((x) => x.unitPrice !== null)!;
    expect(l.qty).toBe(l.suggestQty);
    expect(l.expectDate).toBe(defaultExpectDate(ASOF, l.leadDays));
    expect(l.amount).toBeCloseTo(l.suggestQty * l.unitPrice!, 2);
    const edited = buildReplenishLines(results, reviews, { [l.partNo]: { qty: l.suggestQty + 40, supplier: '新供应商', expectDate: '2026-12-01' } }, ASOF).find((x) => x.partNo === l.partNo)!;
    expect(edited.suggestQty).toBe(l.suggestQty);
    expect(edited.qty).toBe(l.suggestQty + 40);
    expect(edited.amount).toBeCloseTo((l.suggestQty + 40) * l.unitPrice!, 2);
    expect(edited.supplier).toBe('新供应商');
    expect(edited.expectDate).toBe('2026-12-01');
    // 取消勾选的不计入合计
    const off = buildReplenishLines(results, reviews, { [l.partNo]: { selected: false } }, ASOF);
    expect(lineTotals(off).lines).toBe(base.length - 1);
    expect(lineTotals(off).qty).toBe(lineTotals(base).qty - l.qty);
  });

  it('相比上次新增的缺货', () => {
    expect(diffNewAlerts(null, [{ partNo: 'A', state: 'out_of_stock' }, { partNo: 'B', state: 'at_risk' }, { partNo: 'C', state: 'healthy' }])).toEqual({ newOut: ['A'], newRisk: ['B'] });
    const prev = [{ partNo: 'A', state: 'out_of_stock' as const }, { partNo: 'B', state: 'healthy' as const }, { partNo: 'C', state: 'at_risk' as const }];
    const cur = [{ partNo: 'A', state: 'out_of_stock' as const }, { partNo: 'B', state: 'at_risk' as const }, { partNo: 'C', state: 'out_of_stock' as const }, { partNo: 'D', state: 'at_risk' as const }];
    expect(diffNewAlerts(prev, cur)).toEqual({ newOut: ['C'], newRisk: ['B', 'D'] });
  });
});

describe('导出', () => {
  it('采购订单：订单行 + 运算依据两张表，只含勾选的行，人工调整写明', () => {
    const reviews = confirmAll();
    const base = buildReplenishLines(results, reviews, {}, ASOF);
    const lines = buildReplenishLines(results, reviews, { [base[0].partNo]: { qty: base[0].suggestQty + 10 }, [base[1].partNo]: { selected: false } }, ASOF);
    const file = exportPurchaseOrder(dir, lines, ASOF);
    expect(basename(file)).toContain('20261013');
    const sheets = listSheetNames(file);
    expect(sheets.length).toBe(2);
    const order = readTable(file, { sheetName: sheets[0] });
    expect(order.rows.length).toBe(lines.length - 1);
    expect(order.rows.some((r) => Object.values(r).includes(base[1].partNo))).toBe(false);
    const row0 = order.rows.find((r) => Object.values(r).includes(base[0].partNo))!;
    expect(Object.values(row0)).toContain(String(base[0].suggestQty + 10));
    expect(Object.values(row0)).toContain(String(base[0].suggestQty));
    expect(Object.values(row0).some((v) => v.includes(String(base[0].suggestQty)) && v.includes(String(base[0].suggestQty + 10)))).toBe(true);
    const basis = readTable(file, { sheetName: sheets[1] });
    expect(basis.rows.length).toBe(lines.length - 1);
    expect(Object.values(basis.rows[0]).some((v) => v.includes(lines[0].basis[0]))).toBe(true);
    // 同一天再导出一次不覆盖
    const again = exportPurchaseOrder(dir, lines, ASOF);
    expect(again).not.toBe(file);
    expect(existsSync(file) && existsSync(again)).toBe(true);
    expect(() => exportPurchaseOrder(dir, lines.map((l) => ({ ...l, selected: false })), ASOF)).toThrow();
  });

  it('库存状态与行动计划：全部配件、改过的计划文字和检验结果写进去', () => {
    const reviews = confirmAll();
    const target = shortage[0];
    reviews[target.partNo] = { status: 'confirmed', text: '改成空运加急', remark: '客户催' };
    const file = exportStatusPlan(dir, results, reviews, summary);
    const sheets = listSheetNames(file);
    expect(sheets.length).toBe(3);
    expect(readTable(file, { sheetName: sheets[0] }).rows.length).toBe(60);
    const plan = readTable(file, { sheetName: sheets[1] });
    expect(plan.rows.length).toBe(results.filter((r) => planGroupOf(r)).length);
    const row = plan.rows.find((r) => Object.values(r).includes(target.partNo))!;
    expect(Object.values(row)).toContain('改成空运加急');
    expect(Object.values(row)).toContain('客户催');
    const sum = readTable(file, { sheetName: sheets[2], headerRowIndex: 0 });
    expect(sum.rows.some((r) => Object.values(r).includes('60'))).toBe(true);
  });

  it('freeFile 给不重名的路径', () => {
    const a = freeFile(dir, 'x');
    writeFileSync(a, '');
    const b = freeFile(dir, 'x');
    expect(b).not.toBe(a);
    expect(basename(b)).toBe('x-2.xlsx');
  });
});

describe('定时取数', () => {
  const kw = defaultKeywords();
  it('按文件名关键字归类', () => {
    expect(datasetOfFileName('配件历史发货-按月.xlsx', kw)).toBe('monthly');
    expect(datasetOfFileName('配件历史发货-按年.xlsx', kw)).toBe('yearly');
    expect(datasetOfFileName('配件采购提前期.xlsx', kw)).toBe('leadTime');
    expect(datasetOfFileName('配件采购在途订单1013.csv', kw)).toBe('inTransit');
    expect(datasetOfFileName('配件实时库存.xlsx', kw)).toBe('stock');
    expect(datasetOfFileName('会议纪要.xlsx', kw)).toBeNull();
  });
  it('每类取最新的一份，临时文件和别的类型不算', () => {
    const f = join(dir, 'feed');
    const put = (name: string, at: number): void => { const p = join(f, name); writeFileSync(p, 'x'); utimesSync(p, at, at); };
    rmSync(f, { recursive: true, force: true });
    mkdirSync(f, { recursive: true });
    put('配件实时库存1012.xlsx', 1_800_000_000);
    put('配件实时库存1013.xlsx', 1_800_086_400);
    put('~$配件实时库存1014.xlsx', 1_800_172_800);
    put('配件实时库存.txt', 1_800_172_800);
    put('配件历史发货-按月.xlsx', 1_800_000_000);
    const found = pickNewestFiles(f, kw);
    expect(found.stock?.name).toBe('配件实时库存1013.xlsx');
    expect(found.monthly?.name).toBe('配件历史发货-按月.xlsx');
    expect(found.inTransit).toBeUndefined();
    expect(pickNewestFiles(join(dir, 'nope'), kw)).toEqual({});
  });
  it('到点判断：今天跑过就不再跑', () => {
    const at = new Date(2026, 9, 13, 8, 30);
    expect(dueToday('08:00', '', at)).toBe(true);
    expect(dueToday('09:00', '', at)).toBe(false);
    expect(dueToday('08:00', '2026-10-13', at)).toBe(false);
    expect(dueToday('08:00', '2026-10-12', at)).toBe(true);
    expect(dueToday('bad', '', at)).toBe(false);
  });
});

describe('落盘', () => {
  it('规则与定时设置收口', () => {
    expect(normalizeRules({ safetyDays: -3, reviewDays: 0, stagnantMonths: 18, scrapMonths: 6, defaultLeadDays: 'x' as any })).toMatchObject({ safetyDays: 0, reviewDays: 1, stagnantMonths: 18, scrapMonths: 18, defaultLeadDays: 30 });
    const s = normalizeSchedule({ time: '8:05', keywords: { stock: [' 库存 ', '', '库存'], monthly: [] } as any });
    expect(s.time).toBe('08:05');
    expect(s.keywords.stock).toEqual(['库存']);
    expect(s.keywords.monthly).toEqual(defaultKeywords().monthly);
    expect(normalizeSchedule({ time: '25:00' }).time).toBe('08:00');
  });
  it('写入后换一个实例能读回；目录变了缓存跟着换', () => {
    let root = join(dir, 'acc-a');
    const st = new PartsAlertStore(() => root);
    st.update((s) => { s.settings.rules.safetyDays = 21; });
    st.setData('stock', [{ partNo: 'A', qty: 3 }]);
    st.setResults('latest', results.slice(0, 2));
    const other = new PartsAlertStore(() => root);
    expect(other.read().settings.rules.safetyDays).toBe(21);
    expect(other.data().stock).toEqual([{ partNo: 'A', qty: 3 }]);
    expect(other.results('latest').length).toBe(2);
    root = join(dir, 'acc-b');
    expect(st.read().settings.rules.safetyDays).toBe(15);
    expect(st.data().stock).toEqual([]);
    expect(st.results('latest')).toEqual([]);
  });
});
