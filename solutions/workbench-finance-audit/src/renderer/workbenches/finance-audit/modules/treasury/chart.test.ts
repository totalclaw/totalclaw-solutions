/** 现金预测图在阿语界面里的坐标轴与图例方向（第 16.3 节批次 6 i18n 重点） */
import { describe, expect, it } from 'vitest';
import { cashChartOption } from './chart';

const base = { weeks: ['W1', 'W2'], series: [{ name: 'a', data: [1, -2] }, { name: 'b', data: [3, 4] }], fmt: (v: number) => String(v), zeroLabel: '0' };

describe('现金预测图 RTL', () => {
  it('阿语：x 轴反向、y 轴在右、图例从右排', () => {
    const o = cashChartOption({ ...base, rtl: true });
    expect(o.xAxis.inverse).toBe(true);
    expect(o.yAxis.position).toBe('right');
    expect(o.legend).toMatchObject({ right: 0, align: 'right' });
  });
  it('中英文：常规方向；基准情景画 0 线', () => {
    const o = cashChartOption({ ...base, rtl: false });
    expect([o.xAxis.inverse, o.yAxis.position, o.legend.align]).toEqual([false, 'left', 'left']);
    expect((o.series[1] as { markLine?: unknown }).markLine).toBeTruthy();
    expect(o.yAxis.axisLabel.formatter(-1234)).toBe('-1234');
  });
});
