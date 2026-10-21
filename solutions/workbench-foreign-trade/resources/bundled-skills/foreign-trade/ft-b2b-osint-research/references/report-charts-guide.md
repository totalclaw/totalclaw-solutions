# Chart.js Generation Guide for OSINT HTML Reports

This is a reference for generating inline Chart.js charts in single-file HTML reports. All charts render inside the existing `.chart-wrap` container from `report-template.css` and use CSS custom properties for theme compatibility. Copy-paste the patterns below, replacing placeholder data with real values.

## CDN

Include once in `<head>`:

```html
<script src="https://cdn.jsdelivr.net/npm/chart.js@4"></script>
```

## Theme-Aware Color Helper

Place once before any chart scripts:

```html
<script>
const CHART_COLORS = ['#2563eb','#f59e0b','#10b981','#ef4444','#8b5cf6','#ec4899','#06b6d4'];
function chartTextColor() {
  return getComputedStyle(document.documentElement).getPropertyValue('--text').trim() || '#1a1a1a';
}
function chartBorderColor() {
  return getComputedStyle(document.documentElement).getPropertyValue('--border').trim() || '#e5e7eb';
}
function chartFont() {
  return getComputedStyle(document.documentElement).getPropertyValue('--font-body').trim() || 'system-ui, sans-serif';
}
</script>
```

---

## 1. Radar Chart

**When to use:** Competitor strength comparison, Five Forces analysis, risk scoring (5-7 axes).

```html
<div class="chart-wrap">
  <div class="chart-title">竞品A在交付和创新维度显著落后，是切入突破口</div>
  <canvas id="radarCompetitor" style="max-height:300px"></canvas>
</div>
<script>
new Chart(document.getElementById('radarCompetitor'), {
  type: 'radar',
  data: {
    labels: ['价格竞争力', '产品质量', '交付速度', '技术创新', '售后服务', '品牌认知'],
    datasets: [
      {
        label: '我方',
        data: [85, 78, 92, 88, 75, 60],
        borderColor: CHART_COLORS[0],
        backgroundColor: CHART_COLORS[0] + '20',
        pointBackgroundColor: CHART_COLORS[0],
        borderWidth: 2
      },
      {
        label: '竞品A',
        data: [70, 82, 55, 45, 80, 90],
        borderColor: CHART_COLORS[1],
        backgroundColor: CHART_COLORS[1] + '20',
        pointBackgroundColor: CHART_COLORS[1],
        borderWidth: 2
      },
      {
        label: '竞品B',
        data: [60, 90, 70, 72, 85, 75],
        borderColor: CHART_COLORS[2],
        backgroundColor: CHART_COLORS[2] + '20',
        pointBackgroundColor: CHART_COLORS[2],
        borderWidth: 2
      }
    ]
  },
  options: {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      r: {
        beginAtZero: true,
        max: 100,
        ticks: { stepSize: 20, color: chartTextColor(), font: { family: chartFont() } },
        pointLabels: { color: chartTextColor(), font: { size: 12, family: chartFont() } },
        grid: { color: chartBorderColor() }
      }
    },
    plugins: {
      legend: { labels: { color: chartTextColor(), font: { family: chartFont() } } }
    }
  }
});
</script>
```

---

## 2. Waterfall Chart (Simulated Stacked Bar)

**When to use:** Profit decomposition, pricing anatomy, cost breakdown (Revenue -> COGS -> Gross Profit -> OpEx -> Net Profit).

```html
<div class="chart-wrap">
  <div class="chart-title">物流成本吞噬32%毛利，是利润结构最大瓶颈</div>
  <canvas id="waterfallProfit" style="max-height:300px"></canvas>
</div>
<script>
(() => {
  // Define waterfall data: [label, value, isTotal]
  const items = [
    ['营收',       100,  true],
    ['COGS',      -42,  false],
    ['毛利',       58,  true],
    ['物流',      -18,  false],
    ['营销',      -12,  false],
    ['管理',       -8,  false],
    ['净利润',     20,  true]
  ];

  const labels = items.map(d => d[0]);
  const spacer = [];   // transparent bottom
  const values = [];   // visible bar
  const colors = [];

  let running = 0;
  for (const [label, val, isTotal] of items) {
    if (isTotal) {
      spacer.push(0);
      values.push(val);
      colors.push(CHART_COLORS[0]);
      running = val;
    } else {
      // negative cost: spacer = running + val, bar = |val|
      spacer.push(running + val);
      values.push(Math.abs(val));
      colors.push('#ef4444');
      running += val;
    }
  }

  new Chart(document.getElementById('waterfallProfit'), {
    type: 'bar',
    data: {
      labels,
      datasets: [
        {
          label: '基线',
          data: spacer,
          backgroundColor: 'transparent',
          borderWidth: 0,
          stack: 'stack0'
        },
        {
          label: '金额',
          data: values,
          backgroundColor: colors,
          borderRadius: 4,
          stack: 'stack0'
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: {
          stacked: true,
          ticks: { color: chartTextColor(), font: { family: chartFont() } },
          grid: { display: false }
        },
        y: {
          stacked: true,
          ticks: { color: chartTextColor(), font: { family: chartFont() }, callback: v => v + '%' },
          grid: { color: chartBorderColor() }
        }
      },
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: ctx => ctx.datasetIndex === 1 ? ctx.raw + '%' : ''
          }
        }
      }
    }
  });
})();
</script>
```

---

## 3. Horizontal Bar Chart

**When to use:** Market share, brand concentration (CR5), ranked lists (top 10).

```html
<div class="chart-wrap">
  <div class="chart-title">前3品牌占据67%份额，市场高度集中</div>
  <canvas id="barShare" style="max-height:300px"></canvas>
</div>
<script>
new Chart(document.getElementById('barShare'), {
  type: 'bar',
  data: {
    labels: ['Brand A', 'Brand B', 'Brand C', 'Brand D', 'Brand E', 'Others'],
    datasets: [{
      label: '市场份额',
      data: [28, 22, 17, 12, 8, 13],
      backgroundColor: CHART_COLORS.slice(0, 6),
      borderRadius: 4
    }]
  },
  options: {
    indexAxis: 'y',
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        ticks: { color: chartTextColor(), font: { family: chartFont() }, callback: v => v + '%' },
        grid: { color: chartBorderColor() }
      },
      y: {
        ticks: { color: chartTextColor(), font: { family: chartFont() } },
        grid: { display: false }
      }
    },
    plugins: {
      legend: { display: false },
      tooltip: { callbacks: { label: ctx => ctx.raw + '%' } }
    }
  },
  plugins: [{
    id: 'barLabels',
    afterDatasetsDraw(chart) {
      const ctx = chart.ctx;
      chart.data.datasets[0].data.forEach((val, i) => {
        const meta = chart.getDatasetMeta(0).data[i];
        ctx.fillStyle = chartTextColor();
        ctx.font = '11px ' + chartFont();
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';
        ctx.fillText(val + '%', meta.x + 6, meta.y);
      });
    }
  }]
});
</script>
```

---

## 4. Line Chart

**When to use:** BSR trends, demand/pricing over time, monthly sales trajectory.

```html
<div class="chart-wrap">
  <div class="chart-title">BSR持续下降（排名提升），但评价增速放缓，警惕增长见顶</div>
  <canvas id="lineTrend" style="max-height:300px"></canvas>
</div>
<script>
new Chart(document.getElementById('lineTrend'), {
  type: 'line',
  data: {
    labels: ['2025-01','2025-02','2025-03','2025-04','2025-05','2025-06','2025-07','2025-08','2025-09','2025-10','2025-11','2025-12'],
    datasets: [
      {
        label: 'BSR排名',
        data: [4500, 4200, 3800, 3500, 3100, 2800, 2600, 2400, 2200, 2100, 2050, 2000],
        borderColor: CHART_COLORS[0],
        backgroundColor: CHART_COLORS[0] + '15',
        fill: true,
        tension: 0.3,
        pointRadius: 3,
        yAxisID: 'y'
      },
      {
        label: '月评价数',
        data: [45, 52, 68, 80, 95, 110, 118, 122, 125, 128, 130, 131],
        borderColor: CHART_COLORS[1],
        backgroundColor: CHART_COLORS[1] + '15',
        fill: false,
        tension: 0.3,
        pointRadius: 3,
        yAxisID: 'y1'
      }
    ]
  },
  options: {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: 'index', intersect: false },
    scales: {
      x: {
        ticks: { color: chartTextColor(), font: { family: chartFont() }, maxRotation: 45 },
        grid: { color: chartBorderColor() }
      },
      y: {
        position: 'left',
        reverse: true, // BSR: lower number = better rank
        ticks: { color: CHART_COLORS[0], font: { family: chartFont() } },
        grid: { color: chartBorderColor() },
        title: { display: true, text: 'BSR排名', color: CHART_COLORS[0], font: { family: chartFont() } }
      },
      y1: {
        position: 'right',
        ticks: { color: CHART_COLORS[1], font: { family: chartFont() } },
        grid: { display: false },
        title: { display: true, text: '月评价数', color: CHART_COLORS[1], font: { family: chartFont() } }
      }
    },
    plugins: {
      legend: { labels: { color: chartTextColor(), font: { family: chartFont() } } }
    }
  }
});
</script>
```

---

## 5. Doughnut Chart

**When to use:** Composition/distribution — seller country, seller type, traffic source breakdown.

```html
<div class="chart-wrap">
  <div class="chart-title">中国卖家占比超60%，价格战风险极高</div>
  <canvas id="doughnutSeller" style="max-height:300px"></canvas>
</div>
<script>
new Chart(document.getElementById('doughnutSeller'), {
  type: 'doughnut',
  data: {
    labels: ['中国', '美国', '英国', '德国', '日本', '其他'],
    datasets: [{
      data: [62, 15, 8, 5, 4, 6],
      backgroundColor: CHART_COLORS.slice(0, 6),
      borderWidth: 2,
      borderColor: getComputedStyle(document.documentElement).getPropertyValue('--bg-card').trim() || '#ffffff'
    }]
  },
  options: {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '55%',
    plugins: {
      legend: {
        position: 'right',
        labels: { color: chartTextColor(), font: { family: chartFont(), size: 12 }, padding: 12 }
      },
      tooltip: { callbacks: { label: ctx => ctx.label + ': ' + ctx.raw + '%' } }
    }
  },
  plugins: [{
    id: 'centerLabel',
    afterDraw(chart) {
      const { width, height, ctx } = chart;
      ctx.save();
      ctx.fillStyle = chartTextColor();
      ctx.font = 'bold 24px ' + chartFont();
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      const centerX = (chart.chartArea.left + chart.chartArea.right) / 2;
      const centerY = (chart.chartArea.top + chart.chartArea.bottom) / 2;
      ctx.fillText('62%', centerX, centerY - 8);
      ctx.font = '11px ' + chartFont();
      ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--text-muted').trim() || '#555';
      ctx.fillText('中国卖家', centerX, centerY + 14);
      ctx.restore();
    }
  }]
});
</script>
```

---

## 6. Bubble Chart

**When to use:** Opportunity matrix — market size vs growth vs competition intensity. Quadrant analysis.

```html
<div class="chart-wrap">
  <div class="chart-title">右上象限3个品类高增长+大市场，优先进入</div>
  <canvas id="bubbleOpportunity" style="max-height:300px"></canvas>
</div>
<script>
(() => {
  const opportunities = [
    { label: '便携太阳能板',   x: 120, y: 28, r: 18 },
    { label: '太阳能充电控制器', x: 85,  y: 15, r: 14 },
    { label: '房车太阳能套件',  x: 200, y: 35, r: 22 },
    { label: '折叠太阳能板',   x: 95,  y: 42, r: 20 },
    { label: '太阳能支架',     x: 150, y: 12, r: 10 },
    { label: '微型逆变器',     x: 180, y: 22, r: 16 }
  ];

  // Median lines
  const medX = opportunities.reduce((s, d) => s + d.x, 0) / opportunities.length;
  const medY = opportunities.reduce((s, d) => s + d.y, 0) / opportunities.length;

  new Chart(document.getElementById('bubbleOpportunity'), {
    type: 'bubble',
    data: {
      datasets: opportunities.map((d, i) => ({
        label: d.label,
        data: [{ x: d.x, y: d.y, r: d.r }],
        backgroundColor: CHART_COLORS[i % CHART_COLORS.length] + '80',
        borderColor: CHART_COLORS[i % CHART_COLORS.length],
        borderWidth: 2
      }))
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: {
          title: { display: true, text: '市场规模 ($M)', color: chartTextColor(), font: { family: chartFont() } },
          ticks: { color: chartTextColor(), font: { family: chartFont() } },
          grid: { color: chartBorderColor() }
        },
        y: {
          title: { display: true, text: '年增长率 (%)', color: chartTextColor(), font: { family: chartFont() } },
          ticks: { color: chartTextColor(), font: { family: chartFont() }, callback: v => v + '%' },
          grid: { color: chartBorderColor() }
        }
      },
      plugins: {
        legend: { labels: { color: chartTextColor(), font: { family: chartFont(), size: 11 } } },
        tooltip: {
          callbacks: {
            label: ctx => {
              const d = ctx.raw;
              return ctx.dataset.label + ': 市场$' + d.x + 'M, 增长' + d.y + '%, 机会分' + d.r;
            }
          }
        }
      }
    },
    plugins: [{
      id: 'quadrantLines',
      beforeDraw(chart) {
        const { ctx, chartArea: { left, right, top, bottom }, scales: { x, y } } = chart;
        const xPos = x.getPixelForValue(medX);
        const yPos = y.getPixelForValue(medY);
        ctx.save();
        ctx.strokeStyle = chartBorderColor();
        ctx.lineWidth = 1;
        ctx.setLineDash([6, 4]);
        ctx.beginPath(); ctx.moveTo(xPos, top); ctx.lineTo(xPos, bottom); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(left, yPos); ctx.lineTo(right, yPos); ctx.stroke();
        ctx.restore();
      }
    }]
  });
})();
</script>
```

---

## 7. Grouped Bar Chart

**When to use:** Before/after comparison, price distribution, rating distribution across segments.

```html
<div class="chart-wrap">
  <div class="chart-title">$30-50价格段竞争最激烈，$80+价格段供给不足但需求稳定</div>
  <canvas id="barGrouped" style="max-height:300px"></canvas>
</div>
<script>
new Chart(document.getElementById('barGrouped'), {
  type: 'bar',
  data: {
    labels: ['<$20', '$20-30', '$30-50', '$50-80', '$80-120', '>$120'],
    datasets: [
      {
        label: '产品数量',
        data: [45, 120, 280, 150, 55, 20],
        backgroundColor: CHART_COLORS[0],
        borderRadius: 4
      },
      {
        label: '平均月销量',
        data: [800, 1200, 950, 1100, 1400, 600],
        backgroundColor: CHART_COLORS[1],
        borderRadius: 4
      }
    ]
  },
  options: {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        ticks: { color: chartTextColor(), font: { family: chartFont() } },
        grid: { display: false }
      },
      y: {
        ticks: { color: chartTextColor(), font: { family: chartFont() } },
        grid: { color: chartBorderColor() }
      }
    },
    plugins: {
      legend: { labels: { color: chartTextColor(), font: { family: chartFont() } } }
    }
  }
});
</script>
```

---

## General Rules

### Chart Titles

Every chart MUST have an insight title — an action sentence that states the finding, not a topic label.

| Bad (topic label) | Good (insight sentence) |
|---|---|
| 卖家国家分布 | 中国卖家占比超60%，价格战风险极高 |
| 价格分布 | $30-50价格段竞争最激烈，$80+供给不足 |
| BSR趋势 | BSR持续下降但评价增速放缓，警惕增长见顶 |
| 市场份额 | 前3品牌占据67%份额，新进入者需差异化突围 |

### Container

Always use the `.chart-wrap` CSS class and `.chart-title` for the insight header:

```html
<div class="chart-wrap">
  <div class="chart-title">你的洞察句</div>
  <canvas id="uniqueId" style="max-height:300px"></canvas>
</div>
```

### Responsive Config

Every chart options object must include:

```js
responsive: true,
maintainAspectRatio: false
```

### Canvas Height

Inline charts: `max-height: 300px` via inline style on canvas. The `.chart-wrap` CSS already sets canvas `max-height: 400px` as an outer bound.

### Color Palette

Use `CHART_COLORS` array in order. 7 colors, cycling for datasets > 7:

| Index | Hex | Usage |
|-------|-----|-------|
| 0 | `#2563eb` | Primary / our brand |
| 1 | `#f59e0b` | Secondary / comparison |
| 2 | `#10b981` | Positive / growth |
| 3 | `#ef4444` | Negative / risk |
| 4 | `#8b5cf6` | Tertiary |
| 5 | `#ec4899` | Quaternary |
| 6 | `#06b6d4` | Quinary |

### Dark Theme Compatibility

All text colors, grid lines, and borders read from CSS custom properties at render time via the helper functions. This ensures charts look correct across all 16 themes in `report-template.css`.

Key properties used:
- `--text` for labels, ticks, legend text
- `--text-muted` for subtitles, secondary labels
- `--border` for grid lines
- `--bg-card` for doughnut border color (segment separation)
- `--font-body` for font family

### Print Safety

Chart.js renders to `<canvas>`, which prints natively without extra work. The CSS already includes print rules:

```css
@media print {
  .chart-wrap { break-inside: avoid; max-height: 320px; }
  .chart-wrap canvas { max-height: 280px; }
}
```

### Canvas ID Uniqueness

Every `<canvas>` must have a unique `id`. Use descriptive names: `radarCompetitor`, `waterfallProfit`, `doughnutTraffic`, etc. Never reuse IDs in the same report.

### Chinese Label Support

The `chartFont()` helper returns the theme's `--font-body`, which includes `PingFang SC` and `Microsoft YaHei` for Chinese rendering. No extra font config needed.

### Performance

- Keep datasets under 200 data points per chart
- Use IIFE `(() => { ... })()` wrappers for waterfall and bubble charts to avoid variable name collisions when multiple charts exist in one report
- Group small segments as "Other" in doughnut charts (max 6-7 segments)

---

## 使用 chart-templates.js（推荐方式）

引入后直接调用工厂函数，无需重写样板配置。所有颜色自动读取当前 CSS 主题变量，支持 report-template.css 中全部 16 个主题。

### 引入方式

```html
<!-- 在 <head> 中，Chart.js CDN 之后 -->
<script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js"></script>
<script src="../chart-templates.js"></script>
```

单文件报告（CSS 内联）时路径改为：

```html
<script src="chart-templates.js"></script>
```

---

### 函数签名速查

#### `createRadarChart(canvasId, labels, datasets, opts?)`

雷达图 — 竞品对比、Porter 五力、五维风险、Helmer 7 Powers

| 参数 | 类型 | 说明 |
| --- | --- | --- |
| canvasId | string | canvas 元素 ID |
| labels | string[] | 维度标签，推荐 5-8 个 |
| datasets | Array | `[{ label, data[], borderColor?, backgroundColor? }]` 颜色可省略 |
| opts | object | `{ max: 100, stepSize: 20 }` |

```html
<canvas id="radarCompetitor" style="max-height:300px"></canvas>
<script>
createRadarChart('radarCompetitor',
  ['价格竞争力', '产品质量', '交付速度', '技术创新', '售后服务'],
  [
    { label: '我方',  data: [85, 78, 92, 88, 75] },
    { label: '竞品A', data: [70, 82, 55, 45, 80] }
  ]
);
</script>
```

---

#### `createBarChart(canvasId, labels, datasets, opts?)`

条形图（水平/垂直，单/分组） — 市场份额、品牌 CR5、评分分布

| 参数 | 类型 | 说明 |
| --- | --- | --- |
| canvasId | string | canvas 元素 ID |
| labels | string[] | 分类标签 |
| datasets | Array | `[{ label, data[], backgroundColor? }]` |
| opts | object | `{ horizontal: true, suffix: '%', max: 100, showInlineLabels: true }` |

默认行为：labels ≥ 5 个时自动切换为水平条形图。

```html
<canvas id="barShare" style="max-height:300px"></canvas>
<script>
createBarChart('barShare',
  ['Brand A', 'Brand B', 'Brand C', 'Brand D', 'Others'],
  [{ label: '市场份额', data: [28, 22, 17, 12, 21] }],
  { suffix: '%' }
);
</script>
```

---

#### `createLineChart(canvasId, labels, datasets, opts?)`

折线图（单轴/双 Y 轴，填充面积） — BSR 趋势、Google Trends、月度销量

| 参数 | 类型 | 说明 |
| --- | --- | --- |
| canvasId | string | canvas 元素 ID |
| labels | string[] | 时间轴标签 |
| datasets | Array | `[{ label, data[], yAxisID?, fill?, borderDash? }]` |
| opts | object | `{ yReverse, yTitle, y1Title, ySuffix, y1Suffix }` |

双 Y 轴：dataset 加 `yAxisID: 'y1'` 即可自动激活右轴。

```html
<canvas id="lineTrend" style="max-height:300px"></canvas>
<script>
// 单轴
createLineChart('lineTrend',
  ['2025-01','2025-06','2025-12'],
  [{ label: '搜索热度', data: [26, 31, 45], fill: true }]
);

// 双轴（BSR + 月评价数）
createLineChart('lineBsr',
  ['2025-01','2025-06','2025-12'],
  [
    { label: 'BSR排名', data: [4500, 3100, 2000], yAxisID: 'y' },
    { label: '月评价数', data: [45, 95, 131], yAxisID: 'y1' }
  ],
  { yReverse: true, yTitle: 'BSR排名', y1Title: '月评价数' }
);
</script>
```

---

#### `createDoughnutChart(canvasId, labels, data, opts?)`

环形图（带中心标注） — 卖家国家分布、流量来源、价格段构成

| 参数 | 类型 | 说明 |
| --- | --- | --- |
| canvasId | string | canvas 元素 ID |
| labels | string[] | 分类标签（推荐 ≤ 7 个，小类合并为"其他"） |
| data | number[] | 各项百分比数值 |
| opts | object | `{ centerLabel: '62%', centerSub: '中国卖家', suffix: '%', cutout: '55%' }` |

```html
<canvas id="doughnutSeller" style="max-height:300px"></canvas>
<script>
createDoughnutChart('doughnutSeller',
  ['中国', '美国', '英国', '德国', '其他'],
  [62, 15, 8, 5, 10],
  { centerLabel: '62%', centerSub: '中国卖家' }
);
</script>
```

---

#### `createWaterfallChart(canvasId, items, opts?)`

瀑布图 — 利润结构分解、定价瀑布（Revenue → 成本 → 净利润）

| 参数 | 类型 | 说明 |
| --- | --- | --- |
| canvasId | string | canvas 元素 ID |
| items | Array | `[{ label, value, isTotal }]`，isTotal=true 为汇总项（蓝），false 为成本项（红） |
| opts | object | `{ suffix: '%' }` |

```html
<canvas id="waterfallProfit" style="max-height:300px"></canvas>
<script>
createWaterfallChart('waterfallProfit', [
  { label: '营收',   value: 100, isTotal: true  },
  { label: 'COGS',  value: -42, isTotal: false },
  { label: '毛利',  value:  58, isTotal: true  },
  { label: '物流',  value: -18, isTotal: false },
  { label: '营销',  value: -12, isTotal: false },
  { label: '净利润', value:  20, isTotal: true  }
], { suffix: '%' });
</script>
```

---

#### `createBubbleChart(canvasId, items, opts?)`

气泡图（带象限线） — 机会矩阵、增长路径四象限

| 参数 | 类型 | 说明 |
| --- | --- | --- |
| canvasId | string | canvas 元素 ID |
| items | Array | `[{ label, x, y, r }]`，r 为气泡半径（建议 8-25） |
| opts | object | `{ xTitle, yTitle, yAxisSuffix: '%', quadrantX: null, quadrantY: null }` |

象限分割线默认按所有点的 x/y 均值绘制，可用 `quadrantX`/`quadrantY` 指定固定值。

```html
<canvas id="bubbleOpportunity" style="max-height:300px"></canvas>
<script>
createBubbleChart('bubbleOpportunity', [
  { label: '便携太阳能板',  x: 120, y: 28, r: 18 },
  { label: '折叠太阳能板',  x: 95,  y: 42, r: 20 },
  { label: '房车太阳能套件', x: 200, y: 35, r: 22 }
], { xTitle: '市场规模 ($M)', yTitle: '年增长率 (%)', yAxisSuffix: '%' });
</script>
```

---

#### `createGroupedBarChart(canvasId, labels, datasets, opts?)`

分组条形图 — 价格段×需求对比、Before/After 指标

| 参数 | 类型 | 说明 |
| --- | --- | --- |
| canvasId | string | canvas 元素 ID |
| labels | string[] | X 轴分类 |
| datasets | Array | 多个 `{ label, data[] }`，自动按 CHART_COLORS 顺序配色 |
| opts | object | `{ suffix: '' }` |

```html
<canvas id="barGrouped" style="max-height:300px"></canvas>
<script>
createGroupedBarChart('barGrouped',
  ['<$20', '$20-30', '$30-50', '$50-80', '>$80'],
  [
    { label: '产品数量',  data: [45, 120, 280, 150, 55] },
    { label: '平均月销量', data: [800, 1200, 950, 1100, 1400] }
  ]
);
</script>
```

---

#### `createScoreBarChart(canvasId, labels, scores, opts?)`

评分条形图（带颜色阈值 + 行内标注） — 行动优先级、护城河强度

| 参数 | 类型 | 说明 |
| --- | --- | --- |
| canvasId | string | canvas 元素 ID |
| labels | string[] | Y 轴分类（水平） |
| scores | number[] | 评分数组 |
| opts | object | `{ max: 10, suffix: '/10', thresholds: { high: 8, mid: 6 }, inlineTexts: ['优先',...] }` |

颜色自动映射：score ≥ high → 绿色，≥ mid → 橙色，< mid → 红色。

```html
<canvas id="barPriority" style="max-height:300px"></canvas>
<script>
createScoreBarChart('barPriority',
  ['SKU健康度审计', 'BBB投诉响应', 'AI客服部署', 'SEO内容矩阵'],
  [9.2, 8.7, 7.5, 7.0],
  { max: 10, suffix: '/10', thresholds: { high: 8, mid: 6 } }
);
</script>
```

---

#### `rebuildChartsOnThemeChange(chartMap, renderFn)`

主题切换辅助 — 销毁全部图表实例后调用 renderFn 重建（用于依赖 CSS 变量颜色的报告）

```html
<script>
const charts = {};

function renderAll() {
  Object.values(charts).forEach(c => c && c.destroy());
  charts.market = createLineChart('marketChart', labels, datasets);
  charts.brand  = createBarChart('brandChart', labels, [{ label: '份额', data }]);
}

// 主题切换按钮点击时：
document.querySelectorAll('.theme-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.documentElement.className = btn.dataset.theme;
    rebuildChartsOnThemeChange(charts, renderAll);
  });
});

renderAll(); // 初始化
</script>
```

---

### 与手写代码的对比

| 图表类型 | 手写行数（约） | 工厂函数行数 | 节省 |
| --- | --- | --- | --- |
| 雷达图（2 数据集） | ~45 行 | ~8 行 | ~82% |
| 水平条形图（含行内标注） | ~50 行 | ~6 行 | ~88% |
| 折线图（双 Y 轴） | ~55 行 | ~9 行 | ~84% |
| 环形图（含中心标注） | ~50 行 | ~6 行 | ~88% |
| 瀑布图 | ~60 行 | ~12 行 | ~80% |
| 气泡图（含象限线） | ~65 行 | ~8 行 | ~88% |

一份含 4-5 个图表的典型报告，可节省约 **200-250 行** 重复样板代码。

---

## 8. Battlecard 弱点热力图（纯 HTML/CSS，无需 Chart.js）

**When to use:** 多竞品弱点对比、风险维度矩阵。用于 Battlecard 总览对比页。

```html
<table class="bc-heatmap">
  <thead>
    <tr>
      <th>弱点维度</th>
      <th>竞品A</th>
      <th>竞品B</th>
      <th>竞品C</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>产品质量</td>
      <td class="bc-heat-high">🔴 严重</td>
      <td class="bc-heat-low">🟢 良好</td>
      <td class="bc-heat-mid">🟡 一般</td>
    </tr>
    <tr>
      <td>交付速度</td>
      <td class="bc-heat-mid">🟡 一般</td>
      <td class="bc-heat-high">🔴 严重</td>
      <td class="bc-heat-low">🟢 良好</td>
    </tr>
    <tr>
      <td>售后服务</td>
      <td class="bc-heat-low">🟢 良好</td>
      <td class="bc-heat-mid">🟡 一般</td>
      <td class="bc-heat-high">🔴 严重</td>
    </tr>
    <tr>
      <td>供应链稳定性</td>
      <td class="bc-heat-none">— 数据不足</td>
      <td class="bc-heat-high">🔴 严重</td>
      <td class="bc-heat-mid">🟡 一般</td>
    </tr>
    <tr>
      <td>品牌认知</td>
      <td class="bc-heat-mid">🟡 一般</td>
      <td class="bc-heat-low">🟢 良好</td>
      <td class="bc-heat-low">🟢 良好</td>
    </tr>
  </tbody>
</table>
```

### 热力图 CSS 类速查

| CSS 类 | 含义 | 视觉效果 |
|--------|------|---------|
| `bc-heat-high` | 严重弱点 | 红色背景 + 🔴 |
| `bc-heat-mid` | 中等弱点 | 金色背景 + 🟡 |
| `bc-heat-low` | 良好/无弱点 | 绿色背景 + 🟢 |
| `bc-heat-none` | 数据不足 | 灰色文字 + — |

### 弱点维度建议（按场景选 5-8 个）

| 适用场景 | 推荐维度 |
|---------|---------|
| Amazon 卖家竞品 | 产品质量、评分趋势、价格竞争力、供应链稳定性、品牌认知、listing优化、广告依赖度 |
| B2B 供应商竞品 | 交付速度、产品质量、定价、技术能力、售后服务、合规认证、供应链透明度 |
| DTC 品牌竞品 | 产品创新、品牌力、渠道多元化、客户体验、供应链效率、营销投放、复购率 |

---

## 9. Battlecard 核心指标对比表

**When to use:** 多竞品 KPI 一览。用于 Battlecard 总览对比页。

```html
<table class="bc-kpi-compare">
  <thead>
    <tr>
      <th>指标</th>
      <th>竞品A</th>
      <th>竞品B</th>
      <th>竞品C</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>月销售额</td>
      <td class="bc-kpi-best">$128K</td>
      <td>$85K</td>
      <td>$42K</td>
    </tr>
    <tr>
      <td>平均售价</td>
      <td>$39.99</td>
      <td class="bc-kpi-best">$29.99</td>
      <td>$49.99</td>
    </tr>
    <tr>
      <td>平均评分</td>
      <td>4.2</td>
      <td>4.5</td>
      <td class="bc-kpi-best">4.7</td>
    </tr>
    <tr>
      <td>SKU 数</td>
      <td class="bc-kpi-best">45</td>
      <td>28</td>
      <td>12</td>
    </tr>
    <tr>
      <td>员工数</td>
      <td class="bc-kpi-best">~120</td>
      <td>~50</td>
      <td>~15</td>
    </tr>
  </tbody>
</table>
```

> **注意**：`bc-kpi-best` 标注每行的最优值（不一定是最大值——价格低可能更优，需根据指标含义判断）。

---

## 10. Battlecard Tab 结构模板

**When to use:** 竞品报告的 Tab 容器结构。配合 `bcTabsInit()` 脚本使用。

```html
<!-- Tab 初始化脚本（放在 <head> 或报告末尾） -->
<script>
function bcTabsInit() {
  document.querySelectorAll('.bc-tabs').forEach(container => {
    const inputs = container.querySelectorAll('.bc-tab-input');
    const panels = container.querySelectorAll('.bc-tab-panel');
    function activate() {
      const checkedId = container.querySelector('.bc-tab-input:checked')?.id;
      panels.forEach(p => p.classList.toggle('bc-active', p.dataset.tab === checkedId));
    }
    inputs.forEach(input => input.addEventListener('change', activate));
    activate();
  });
}
document.addEventListener('DOMContentLoaded', bcTabsInit);
</script>

<!-- 多竞品 Battlecard 模式 -->
<div class="bc-tabs">
  <div class="bc-tab-bar">
    <input type="radio" id="tab-overview" name="bc" class="bc-tab-input" checked>
    <label for="tab-overview" class="bc-tab-label">总览对比</label>

    <input type="radio" id="tab-comp1" name="bc" class="bc-tab-input">
    <label for="tab-comp1" class="bc-tab-label">竞品A</label>

    <input type="radio" id="tab-comp2" name="bc" class="bc-tab-input">
    <label for="tab-comp2" class="bc-tab-label">竞品B</label>
  </div>

  <div class="bc-tab-panel bc-active" data-tab="tab-overview" data-print-title="总览对比">
    <!-- 雷达图叠加 + KPI对比表 + 弱点热力图 + BCG四象限 -->
  </div>

  <div class="bc-tab-panel" data-tab="tab-comp1" data-print-title="竞品A 深度分析">
    <!-- 竞品A 完整深调内容 -->
  </div>

  <div class="bc-tab-panel" data-tab="tab-comp2" data-print-title="竞品B 深度分析">
    <!-- 竞品B 完整深调内容 -->
  </div>
</div>
```

### 单竞品维度 Tab 模式

```html
<div class="bc-tabs">
  <div class="bc-tab-bar">
    <input type="radio" id="tab-overview" name="bc" class="bc-tab-input" checked>
    <label for="tab-overview" class="bc-tab-label">概览</label>

    <input type="radio" id="tab-market" name="bc" class="bc-tab-input">
    <label for="tab-market" class="bc-tab-label">市场数据</label>

    <input type="radio" id="tab-supply" name="bc" class="bc-tab-input">
    <label for="tab-supply" class="bc-tab-label">供应链</label>

    <input type="radio" id="tab-weakness" name="bc" class="bc-tab-input">
    <label for="tab-weakness" class="bc-tab-label">弱点矩阵</label>

    <input type="radio" id="tab-pulse" name="bc" class="bc-tab-input">
    <label for="tab-pulse" class="bc-tab-label">脉弱交叉</label>

    <input type="radio" id="tab-action" name="bc" class="bc-tab-input">
    <label for="tab-action" class="bc-tab-label">行动建议</label>
  </div>

  <div class="bc-tab-panel bc-active" data-tab="tab-overview" data-print-title="概览">...</div>
  <div class="bc-tab-panel" data-tab="tab-market" data-print-title="市场数据">...</div>
  <div class="bc-tab-panel" data-tab="tab-supply" data-print-title="供应链情报">...</div>
  <div class="bc-tab-panel" data-tab="tab-weakness" data-print-title="弱点矩阵">...</div>
  <div class="bc-tab-panel" data-tab="tab-pulse" data-print-title="脉弱交叉分析">...</div>
  <div class="bc-tab-panel" data-tab="tab-action" data-print-title="行动建议">...</div>
</div>
```
