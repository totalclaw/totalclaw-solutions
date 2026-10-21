/**
 * 导出表的脏数据边角：标题行 / 合并单元格空行 / 括号负数 / 各种日期写法 / 百分比单元格。
 * 这些是业务同事从京东、天猫、费控系统里导出来时**真实会出现**的样子，解析层必须吃得下。
 */
import { describe, it, expect } from 'vitest';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import * as XLSX from 'xlsx';
import { readTable, detectHeaderRow, toNumber, toStars, detectColumns } from './excel';
import { normalizeDate, quarterRange } from './marketingIncentive';
import { computeReviewIncentive } from './reviewIncentive';

describe('表头识别', () => {
  it('前面有标题行 / 空行 / 说明行时，仍能找到真正的表头行', () => {
    const aoa = [
      ['2026年8月 服务商结算明细', null, null],
      [null, null, null],
      ['导出时间：2026-09-01', null, null],
      ['服务商', '工单号', '结算金额'],
      ['甲', 'A1', 100],
    ];
    expect(detectHeaderRow(aoa)).toBe(3);
  });
  it('从真实 xlsx 读：标题行在上、数字列保留数值、日期列转成 YYYY-MM-DD', () => {
    const dir = mkdtempSync(join(tmpdir(), 'ss-edge-'));
    const p = join(dir, 'x.xlsx');
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet([
      ['结算明细（自营）'],
      [],
      ['服务商', '结算金额', '完成时间'],
      ['甲', 1234.5, new Date(2026, 7, 15)],
      ['乙', '2,000', '2026/8/16'],
    ], { cellDates: true });
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
    XLSX.writeFile(wb, p, { cellDates: true });
    const t = readTable(p);
    expect(t.headers).toEqual(['服务商', '结算金额', '完成时间']);
    expect(t.rows).toHaveLength(2);
    expect(toNumber(t.rows[0]['结算金额'])).toBe(1234.5);
    expect(toNumber(t.rows[1]['结算金额'])).toBe(2000);
    expect(t.rows[0]['完成时间']).toBe('2026-08-15');
    expect(normalizeDate(t.rows[1]['完成时间'])).toBe('2026-08-16');
    rmSync(dir, { recursive: true, force: true });
  });
});

describe('取值解析', () => {
  it('金额：千分位、单位、负号、全角', () => {
    expect(toNumber('-15')).toBe(-15);
    expect(toNumber('¥1,000.50')).toBe(1000.5);
    expect(toNumber('３００')).toBe(0); // 全角数字不认（不猜，宁可 0 让人看到）
    expect(toNumber('abc')).toBe(0);
  });
  it('日期：中文年月日 / 斜杠 / 紧凑 8 位 / 带时间', () => {
    expect(normalizeDate('2026年9月1日')).toBe('2026-09-01');
    expect(normalizeDate('2026/9/1 10:00')).toBe('2026-09-01');
    expect(normalizeDate('20260901')).toBe('2026-09-01');
    expect(normalizeDate('2026-09-01T10:00:00Z')).toBe('2026-09-01');
    expect(normalizeDate('')).toBe('');
  });
  it('季度范围：Q1~Q4 起止日与闰年 2 月', () => {
    expect(quarterRange(2026, 1)).toEqual({ label: '2026Q1', start: '2026-01-01', end: '2026-03-31' });
    expect(quarterRange(2028, 1).end).toBe('2028-03-31');
    expect(quarterRange(2026, 4)).toEqual({ label: '2026Q4', start: '2026-10-01', end: '2026-12-31' });
  });
  it('星级：2 星在京东口径下是中评，不是差评；天猫口径改 badStarsMax=2 才算', () => {
    expect(toStars('2')).toBe(2);
    const jd = { path: '', fileName: 'jd.xlsx', sheetName: 'S', headers: ['服务商', '评价星级'], rows: [{ 服务商: '甲', 评价星级: '2' }, { 服务商: '甲', 评价星级: '5' }] };
    const r1 = computeReviewIncentive({ jdInstall: [{ table: jd, mapping: { provider: '服务商', rating: '评价星级' } }], jdAfterSales: [], tmall: [] });
    expect(r1.providers[0].badOrders).toBe(0);
    const r2 = computeReviewIncentive({ jdInstall: [{ table: jd, mapping: { provider: '服务商', rating: '评价星级' } }], jdAfterSales: [], tmall: [], rules: { badStarsMax: 2 } });
    expect(r2.providers[0].badOrders).toBe(1);
  });
  it('列识别不会把「服务商」误配给「服务商编码」之外更合适的列', () => {
    const m = detectColumns(['服务商编码', '服务商名称', '结算金额(元)'], ['provider', 'amount']);
    expect(m.provider).toBe('服务商名称');
    expect(m.amount).toBe('结算金额(元)');
  });
});
