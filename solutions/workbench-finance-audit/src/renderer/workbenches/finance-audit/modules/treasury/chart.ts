/**
 * 13 周现金预测折线图的 echarts 配置（纯函数，单测核对 RTL）：
 *   阿语界面：x 轴反向（第 1 周在右、时间从右往左走）、y 轴放到右边、图例从右排；
 *   数字一律西方阿拉伯数字（formatter 由调用方给，走 ar-u-nu-latn），负数余额照常画在 0 线下面。
 */
export interface CashChartInput {
  weeks: string[];
  series: { name: string; data: number[] }[];
  rtl: boolean;
  fmt: (v: number) => string;
  zeroLabel: string;
}

export function cashChartOption(i: CashChartInput) {
  return {
    grid: { top: 36, bottom: 28, containLabel: true },
    legend: { data: i.series.map((s) => s.name), top: 0, [i.rtl ? 'right' : 'left']: 0, align: i.rtl ? 'right' : 'left' },
    tooltip: { trigger: 'axis', valueFormatter: (v: number) => i.fmt(v) },
    xAxis: { type: 'category', data: i.weeks, inverse: i.rtl, boundaryGap: false },
    yAxis: { type: 'value', position: i.rtl ? 'right' : 'left', axisLabel: { formatter: (v: number) => i.fmt(v) } },
    series: i.series.map((s, k) => ({
      name: s.name, type: 'line', data: s.data, smooth: false, symbolSize: 5,
      // 基准情景画 0 线，缺口一眼看出来
      ...(k === 1 ? { markLine: { silent: true, symbol: 'none', data: [{ yAxis: 0, name: i.zeroLabel }] } } : {}),
    })),
  };
}
