import { afterAll, describe, expect, it } from 'vitest';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { writeWorkbook } from '../serviceSettlement/excel';
import { inspectTable, monthOfHeader, parseCsv, parseDataset, parseDate, parseMonth, parseNum, readDataTable, yearOfHeader } from './ingest';
import { buildDemoData, writeDemoFiles } from './demoData';
import { runCompute } from './plan';
import { defaultRules } from './store';
import type { PaDatasetKey } from '@totalclaw/ipc-contracts';

const dir = mkdtempSync(join(tmpdir(), 'pa-ingest-'));
afterAll(() => { rmSync(dir, { recursive: true, force: true }); });

function load(key: PaDatasetKey, file: string, mapping?: Record<string, string>) {
  const { table } = readDataTable(file);
  const ins = inspectTable(table, key, mapping);
  return { table, ins, out: ins.missing.length ? null : parseDataset(table, key, ins) };
}

describe('取值', () => {
  it('数字：千分位、单位、空、乱写', () => {
    expect(parseNum('1,234.5')).toBe(1234.5);
    expect(parseNum('30 天')).toBe(30);
    expect(parseNum('')).toBeNull();
    expect(Number.isNaN(parseNum('待定'))).toBe(true);
    expect(parseNum('-5')).toBe(-5);
  });
  it('月份的几种写法', () => {
    for (const s of ['2026-01', '2026/1', '2026年1月', '202601', '2026-01-15', '20260115', '2026.01']) expect(parseMonth(s)).toBe('2026-01');
    expect(parseMonth('2026-13')).toBe('');
    expect(parseMonth('一月')).toBe('');
  });
  it('日期的几种写法，不存在的日期不认', () => {
    for (const s of ['2026-11-05', '2026/11/5', '2026年11月5日', '20261105']) expect(parseDate(s)).toBe('2026-11-05');
    expect(parseDate('2026-02-30')).toBe('');
    expect(parseDate('下周')).toBe('');
  });
  it('横表列头：月份与年份', () => {
    expect(monthOfHeader('2026-01')).toBe('2026-01');
    expect(monthOfHeader('2026年1月')).toBe('2026-01');
    expect(monthOfHeader('202601')).toBe('2026-01');
    expect(monthOfHeader('2026年1月发货数量')).toBe('2026-01');
    expect(monthOfHeader('2026-01-01')).toBe('2026-01');
    expect(monthOfHeader('配件编码')).toBe('');
    expect(monthOfHeader('合计')).toBe('');
    expect(yearOfHeader('2024年')).toBe('2024');
    expect(yearOfHeader('2024年度发货')).toBe('2024');
    expect(yearOfHeader('202401')).toBe('');
  });
});

describe('历史发货（按月）', () => {
  it('一行一条：认列、月份归一、坏行带原因跳过', () => {
    const file = join(dir, 'monthly-long.xlsx');
    writeWorkbook(file, [{
      name: 's', headers: ['物料编码', '物料名称', '月份', '出库数量'],
      rows: [
        ['A001', '点火针', '2026-08', 120],
        ['A001', '点火针', '2026年9月', '1,300'],
        ['A002', '热电偶', '202609', 40],
        ['', '没编码', '2026-09', 5],
        ['A003', '电磁阀', '九月', 5],
        ['A003', '电磁阀', '2026-09', '待定'],
        ['A003', '电磁阀', '2026-09', -3],
        ['合计', '', '', 1465],
      ],
    }]);
    const { ins, out } = load('monthly', file);
    expect(ins.layout).toBe('long');
    expect(ins.mapping).toMatchObject({ partNo: '物料编码', partName: '物料名称', month: '月份', shipQty: '出库数量' });
    expect(out!.rows).toEqual([
      { partNo: 'A001', partName: '点火针', month: '2026-08', qty: 120 },
      { partNo: 'A001', partName: '点火针', month: '2026-09', qty: 1300 },
      { partNo: 'A002', partName: '热电偶', month: '2026-09', qty: 40 },
    ]);
    expect(out!.skippedCount).toBe(5);
    expect(out!.skipped.map((s) => s.row)).toEqual([4, 5, 6, 7, 8]);
    expect(out!.skipped.every((s) => s.reason.length > 0)).toBe(true);
  });

  it('横表：一列一个月份，拆成一行一条；空格不算、合计列不算', () => {
    const file = join(dir, 'monthly-wide.xlsx');
    writeWorkbook(file, [{
      name: 's', headers: ['配件编码', '配件名称', '2026-07', '2026年8月', '202609', '合计'],
      rows: [
        ['A001', '点火针', 100, 110, 120, 330],
        ['A002', '热电偶', '', 20, 'x', 20],
        ['总计', '', 100, 130, 120, 350],
      ],
    }]);
    const { ins, out } = load('monthly', file);
    expect(ins.layout).toBe('wide');
    expect(ins.periods.map((p) => p.period)).toEqual(['2026-07', '2026-08', '2026-09']);
    expect(ins.missing).toEqual([]);
    expect(out!.rows).toEqual([
      { partNo: 'A001', partName: '点火针', month: '2026-07', qty: 100 },
      { partNo: 'A001', partName: '点火针', month: '2026-08', qty: 110 },
      { partNo: 'A001', partName: '点火针', month: '2026-09', qty: 120 },
      { partNo: 'A002', partName: '热电偶', month: '2026-08', qty: 20 },
    ]);
    // A002 有一格不是数字；总计行整行跳过
    expect(out!.skippedCount).toBe(2);
  });

  it('CSV 也能读；列认不出来时 missing 给出角色，改了对应关系就能读', () => {
    const file = join(dir, 'monthly.csv');
    writeFileSync(file, '﻿货号,期,出货\nA001,2026-09,15\nA002,2026-09,7\n', 'utf-8');
    const first = load('monthly', file);
    expect(first.ins.missing.length).toBeGreaterThan(0);
    expect(first.out).toBeNull();
    const fixed = load('monthly', file, { partNo: '货号', month: '期', shipQty: '出货', partName: '' });
    expect(fixed.ins.missing).toEqual([]);
    expect(fixed.out!.rows).toEqual([{ partNo: 'A001', month: '2026-09', qty: 15 }, { partNo: 'A002', month: '2026-09', qty: 7 }]);
  });

  it('CSV：标题行、带引号带逗号的单元格、GBK 编码、日期原文不被改写', () => {
    expect(parseCsv('a,"b,1","c ""x"""\r\n1,2,3\n')).toEqual([['a', 'b,1', 'c "x"'], ['1', '2', '3']]);
    expect(parseCsv('a;b\n1;2')).toEqual([['a', 'b'], ['1', '2']]);
    const file = join(dir, 'transit-title.csv');
    writeFileSync(file, '配件采购在途明细,,,\n配件编码,供应商,在途数量,预计到货日期\nA001,"甲厂,一分厂","1,200",2026-11-05\n', 'utf-8');
    expect(load('inTransit', file).out!.rows).toEqual([{ partNo: 'A001', qty: 1200, eta: '2026-11-05', supplier: '甲厂,一分厂' }]);
    // GBK 字节：配件编码,库存数量
    const f2 = join(dir, 'stock-gbk.csv');
    writeFileSync(f2, Buffer.concat([Buffer.from('c5e4bcfeb1e0c2eb2cbfe2b4e6cafdc1bf', 'hex'), Buffer.from('\nA001,12\n')]));
    expect(load('stock', f2).out!.rows).toEqual([{ partNo: 'A001', qty: 12 }]);
  });
});

describe('其它四份表', () => {
  it('按年：一行一条与横表', () => {
    const long = join(dir, 'yearly-long.xlsx');
    writeWorkbook(long, [{ name: 's', headers: ['配件编码', '年份', '发货数量'], rows: [['A001', 2024, 1000], ['A001', '2025年', 1200], ['A001', '前年', 5]] }]);
    const a = load('yearly', long);
    expect(a.out!.rows).toEqual([{ partNo: 'A001', year: 2024, qty: 1000 }, { partNo: 'A001', year: 2025, qty: 1200 }]);
    expect(a.out!.skippedCount).toBe(1);
    const wide = join(dir, 'yearly-wide.xlsx');
    writeWorkbook(wide, [{ name: 's', headers: ['配件编码', '配件名称', '2023年', '2024年', '2025年'], rows: [['A001', '点火针', 900, 1000, 1200]] }]);
    const b = load('yearly', wide);
    expect(b.ins.layout).toBe('wide');
    expect(b.out!.rows.map((r: any) => [r.year, r.qty])).toEqual([[2023, 900], [2024, 1000], [2025, 1200]]);
  });

  it('采购提前期：表头上面有标题行也能认；天数不对的跳过，重复配件有提示', () => {
    const file = join(dir, 'lead.xlsx');
    writeWorkbook(file, [{
      name: 's', headers: ['配件采购提前期统计表（近 1 年）'],
      rows: [
        ['配件编码', '配件名称', '供应商', '平均采购天数', '最小起订量', '采购单价'],
        ['A001', '点火针', '甲厂', 25, 50, 3.2],
        ['A002', '热电偶', '乙厂', '30天', '', ''],
        ['A003', '电磁阀', '乙厂', 0, 10, 8],
        ['A004', '旋钮', '丙厂', '', 10, 8],
        ['A001', '点火针', '甲厂', 28, 50, 3.2],
      ],
    }]);
    const { ins, out } = load('leadTime', file);
    expect(ins.mapping).toMatchObject({ partNo: '配件编码', leadDays: '平均采购天数', moq: '最小起订量', unitPrice: '采购单价', supplier: '供应商' });
    expect(out!.rows).toEqual([
      { partNo: 'A001', days: 25, moq: 50, unitPrice: 3.2, supplier: '甲厂' },
      { partNo: 'A002', days: 30, supplier: '乙厂' },
      { partNo: 'A001', days: 28, moq: 50, unitPrice: 3.2, supplier: '甲厂' },
    ]);
    expect(out!.skippedCount).toBe(2);
    expect(out!.notes.length).toBe(1);
  });

  it('采购在途：订单号列不会被当成配件编码；没有到货日期的照收并提示', () => {
    const file = join(dir, 'transit.xlsx');
    writeWorkbook(file, [{
      name: 's', headers: ['采购订单号', '物料编码', '供应商名称', '未到货数量', '预计回货时间'],
      rows: [
        ['PO001', 'A001', '甲厂', 500, '2026/11/5'],
        ['PO002', 'A002', '乙厂', 200, ''],
        ['PO003', 'A003', '乙厂', 0, '2026-11-20'],
        ['PO004', 'A004', '丙厂', 80, new Date(2026, 10, 18)],
      ],
    }]);
    const { ins, out } = load('inTransit', file);
    expect(ins.mapping).toMatchObject({ partNo: '物料编码', transitQty: '未到货数量', eta: '预计回货时间', orderNo: '采购订单号', supplier: '供应商名称' });
    expect(out!.rows).toEqual([
      { partNo: 'A001', qty: 500, eta: '2026-11-05', orderNo: 'PO001', supplier: '甲厂' },
      { partNo: 'A002', qty: 200, orderNo: 'PO002', supplier: '乙厂' },
      { partNo: 'A004', qty: 80, eta: '2026-11-18', orderNo: 'PO004', supplier: '丙厂' },
    ]);
    expect(out!.skippedCount).toBe(1);
    expect(out!.notes.length).toBe(1);
  });

  it('实时库存：多仓库逐行保留，负库存照收并提示', () => {
    const file = join(dir, 'stock.xlsx');
    writeWorkbook(file, [{
      name: 's', headers: ['配件编码', '配件名称', '仓库', '库存数量', '单价'],
      rows: [['A001', '点火针', '总仓', 300, 3.2], ['A001', '点火针', '华南仓', 120, 3.2], ['A002', '热电偶', '总仓', -4, ''], ['A003', '电磁阀', '总仓', '盘点中', 8]],
    }]);
    const { out } = load('stock', file);
    expect(out!.rows).toEqual([
      { partNo: 'A001', qty: 300, partName: '点火针', warehouse: '总仓', unitPrice: 3.2 },
      { partNo: 'A001', qty: 120, partName: '点火针', warehouse: '华南仓', unitPrice: 3.2 },
      { partNo: 'A002', qty: -4, partName: '热电偶', warehouse: '总仓' },
    ]);
    expect(out!.skippedCount).toBe(1);
    expect(out!.notes.length).toBe(1);
  });
});

describe('示例数据', () => {
  const ASOF = '2026-10-13';
  it('写成文件再读回来，运算结果覆盖五种状态和各类情形', () => {
    const files = writeDemoFiles(join(dir, 'demo'), ASOF);
    const data: any = {};
    for (const k of Object.keys(files) as PaDatasetKey[]) {
      const r = load(k, files[k]);
      expect(r.ins.missing, k).toEqual([]);
      expect(r.out!.skippedCount, k).toBe(0);
      data[k] = r.out!.rows;
    }
    expect(load('monthly', files.monthly).ins.layout).toBe('wide');
    const { results, summary } = runCompute(data, defaultRules(), ASOF);
    expect(summary.total).toBe(60);
    expect(summary.byState).toEqual({ healthy: 22, at_risk: 12, out_of_stock: 8, stagnant: 8, redundant: 10 });
    const shortage = results.filter((r) => r.state === 'at_risk' || r.state === 'out_of_stock');
    expect(shortage.some((r) => r.hasInTransit)).toBe(true);
    expect(shortage.some((r) => !r.hasInTransit)).toBe(true);
    expect(summary.partsWithDefaultLead.length).toBeGreaterThan(0);
    expect(summary.partsWithoutStockRow.length).toBe(1);
    expect(results.some((r) => r.actions.some((a) => a.kind === 'scrap_review'))).toBe(true);
    expect(results.some((r) => r.basis.some((b) => b.includes('最小起订量')))).toBe(true);
    expect(results.some((r) => r.basis.some((b) => b.includes('季节系数')))).toBe(true);
    expect(results.filter((r) => r.suggestQty > 0).every((r) => r.supplier !== '' || r.leadDaysDefaulted)).toBe(true);
    expect(results.filter((r) => r.state !== 'out_of_stock' || r.stockQty > 0).every((r) => r.unitPrice !== null)).toBe(true);
  });

  it('读回来的数据与内存里生成的一致', () => {
    const mem = buildDemoData(ASOF);
    const a = runCompute(mem, defaultRules(), ASOF).summary.byState;
    const files = writeDemoFiles(join(dir, 'demo2'), ASOF);
    const data: any = {};
    for (const k of Object.keys(files) as PaDatasetKey[]) data[k] = load(k, files[k]).out!.rows;
    expect(runCompute(data, defaultRules(), ASOF).summary.byState).toEqual(a);
  });

  it('换一个基准日，状态分布不变', () => {
    expect(runCompute(buildDemoData('2027-03-02'), defaultRules(), '2027-03-02').summary.byState).toEqual({ healthy: 22, at_risk: 12, out_of_stock: 8, stagnant: 8, redundant: 10 });
  });
});
