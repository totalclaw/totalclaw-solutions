# OSINT 报告 HTML 输出规范

> **用途**: Step 6 报告生成时加载本文件，确保所有 OSINT 报告视觉和结构统一。
> **触发**: 被 `/osint` 主流程的 Step 6 自动引用，不单独调用。

---

## 1. 文件规范

```
文件名: docs/osint-{english-name}-{YYYY-MM-DD}.html
语言:   zh-CN
格式:   自包含 HTML（CSS 内联，唯一外部依赖: Chart.js CDN）
编码:   UTF-8
```

**命名示例**:
- `docs/osint-riley-goodside-thought-leader-2026-04-01.html`
- `docs/osint-vasco-aires-arvow-2026-03-28.html`
- `docs/osint-solaredge-company-2026-04-02.html`

---

## 2. HTML 骨架

```html
<!DOCTYPE html>
<html lang="zh-CN" class="theme-steel">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>{目标名} — {报告类型}</title>
<script src="https://cdn.jsdelivr.net/npm/chart.js@4"></script>
<style>
  /* ── 完整 CSS 内联（见第3节） ── */
</style>
</head>
<body>
  <!-- HEADER -->
  <!-- CONTAINER > SECTIONS -->
  <!-- THEME SWITCHER -->
  <!-- FOOTER -->
</body>
</html>
```

---

## 3. CSS 主题系统（16主题，必须全部内联）

### 默认主题变量（:root = Ghost）

```css
:root {
  --bg: #f8f9fa; --bg-card: #ffffff; --text: #1a1a1a; --text-muted: #555555;
  --navy: #0f2540; --navy-mid: #1e3a5f; --blue: #0a66c2; --blue-light: #3b82f6;
  --green: #059669; --green-light: #10b981; --gold: #d97706; --gold-light: #fbbf24;
  --red: #dc2626; --orange: #ea580c; --yellow: #ca8a04; --border: #e5e7eb;
  --shadow: 0 2px 16px rgba(15,37,64,0.05);
  --header-from: #0a1929; --header-to: #1a3050; --header-glow: rgba(37,99,235,0.15);
  --accent: #0a66c2; --accent-hover: #084d94;
  --th-bg: #0f2540; --th-text: #fbbf24; --tr-hover: #eff6ff; --tr-stripe: #f8fafc;
  --card-header-from: #0f2540; --card-header-to: #1e3a5f;
  --risk-label-color: #fbbf24;
  --risk-low-from: #064e3b; --risk-low-to: #065f46; --risk-low-border: rgba(16,185,129,0.25); --risk-low-text: #6ee7b7;
  --risk-mid-from: #451a03; --risk-mid-to: #7c2d12; --risk-mid-border: rgba(251,191,36,0.25); --risk-mid-text: #fcd34d;
  --risk-high-from: #450a0a; --risk-high-to: #7f1d1d; --risk-high-border: rgba(239,68,68,0.25); --risk-high-text: #fca5a5;
  --font-body: -apple-system, 'PingFang SC', 'Microsoft YaHei', system-ui, sans-serif;
  --font-heading: -apple-system, 'PingFang SC', 'Microsoft YaHei', system-ui, sans-serif;
  --font-mono: ui-monospace, 'SF Mono', monospace;
}
```

### 必须包含的主题类（最少4个核心主题）

| 类名 | 风格 | 默认用于 |
|------|------|---------|
| `.theme-ghost` | 幽灵白（浅色专业） | company, supplier |
| `.theme-steel` | 深海蓝（深色专业） | competitor, industry |
| `.theme-void` | 极黑（深色高对比） | amazon-seller, person |
| `.theme-matrix` | 极客终端（绿底黑背景） | thought-leader, research |

> 可选扩展: amber, rose, arctic, lavender, copper, forest, slate, coral, midnight, sunset, ocean, neon
> 根据报告主题选择默认主题，但 **必须包含主题切换器** 让读者自选。

---

## 4. 组件库（按需使用）

### 4.1 Header（每份报告必须）

```html
<div class="header">
  <div class="risk-badge-wrap">
    <span class="badge badge-type">{报告类型}</span>
    <span class="badge badge-sg">{标签1}</span>
    <span class="badge badge-sg">{标签2}</span>
  </div>
  <h1>{目标名} <em>{副标识}</em></h1>
  <p class="header-sub">{一句话定位}</p>
  <div class="header-meta">
    <span>调查日期: {DATE}</span>
    <span>类型: {调查类型}</span>
    <span>风险评级: {🔴🟡🟢} {评级文字}</span>
    <span>数据截止: {DATE}</span>
  </div>
</div>
```

### 4.2 Section 结构

```html
<div class="section">
  <div class="section-title">
    <span class="sec-num">{N}</span>
    <h2>{章节标题}</h2>
  </div>
  <!-- cards, tables, insights... -->
</div>
```

### 4.3 Card（主要内容容器）

```html
<div class="card">
  <div class="card-header">{卡片标题}</div>
  <div class="card-body">
    <!-- 内容 -->
  </div>
</div>
```

### 4.4 信号标注（三种语义）

```html
<!-- 洞察/发现 -->
<div class="insight">
  <div class="insight-label">关键发现</div>
  <p>{内容}</p>
</div>

<!-- 警告/风险 -->
<div class="warning">
  <div class="warn-label">风险信号</div>
  <p>{内容}</p>
</div>

<!-- 正面/机会 -->
<div class="positive">
  <div class="pos-label">机会信号</div>
  <p>{内容}</p>
</div>
```

### 4.5 SO_WHAT 块（脉弱解读，OSINT 核心价值）

```html
<div class="so-what">
  <strong>{事实}</strong> → <em>{对你意味着什么}</em>
</div>
```

### 4.6 KPI 网格

```html
<div class="kpi-grid">
  <div class="kpi-card">
    <div class="kpi-value">{数值}</div>
    <div class="kpi-label">{指标名}</div>
  </div>
  <!-- 重复 -->
</div>
```

### 4.7 Timeline

```html
<div class="timeline">
  <div class="timeline-item">
    <div class="timeline-dot"></div>
    <div class="timeline-date">{日期}</div>
    <div class="timeline-text">{事件}</div>
  </div>
</div>
```

### 4.8 数据表

```html
<table class="tbl">
  <thead><tr><th>维度</th><th>数据</th><th>置信度</th></tr></thead>
  <tbody>
    <tr><td>{}</td><td>{}</td><td><span class="conf conf-a">A</span></td></tr>
  </tbody>
</table>
```

### 4.8b 证据置信度分级（A/B/C/D — 每个数据点必须标注）

> **核心原则**：情报的价值不只在内容，更在可信度。单一来源的数据和多源验证的数据对决策的价值天差地别。

```html
<!-- 四个等级的 badge，内联使用 -->
<span class="conf conf-a">A</span>  <!-- 一手官方来源 -->
<span class="conf conf-b">B</span>  <!-- 多源交叉验证 -->
<span class="conf conf-c">C</span>  <!-- 单一来源，未验证 -->
<span class="conf conf-d">D</span>  <!-- 推断/间接信号 -->
```

**CSS 样式（加入内联 CSS）**：

```css
.conf {
  display: inline-block; font-size: 11px; font-weight: 700;
  padding: 1px 6px; border-radius: 2px; font-family: var(--font-mono);
  vertical-align: middle; margin-left: 4px;
}
.conf-a { background: #064e3b; color: #6ee7b7; border: 1px solid #10b981; }
.conf-b { background: #1e3a5f; color: #93c5fd; border: 1px solid #3b82f6; }
.conf-c { background: #451a03; color: #fcd34d; border: 1px solid #d97706; }
.conf-d { background: #3b0764; color: #e9d5ff; border: 1px solid #9333ea; }
```

**等级定义**：

| 等级 | 含义 | 典型来源 | 决策建议 |
|------|------|----------|----------|

| **A** — 一手官方 | 直接来自官方/法定机构，不可篡改 | SEC 财报、Companies House、OFAC 名单、官网声明、政府公告 | 直接引用，无需核实 |
| **B** — 交叉验证 | 2 个以上独立来源一致 | LinkedIn + Hunter.io 双验 / Trustpilot + BBB 双印证 / 两个行业媒体均报道 | 可信，建议报告中注明来源数量 |
| **C** — 单一来源 | 仅有一个来源，尚未被独立验证 | 仅 LinkedIn / 仅公司官网 / 仅一篇媒体报道 | 使用时需注明"未经独立验证"，重要决策需补充核实 |
| **D** — 推断 | 从间接信号、行为模式、环境推导 | 招聘 JD 推断战略意图 / BSR 趋势推断供货能力 / 员工流动推断内部问题 | 明确标注为推断，不能作为直接证据 |

**使用规则**：
- 报告中每一个关键数据点（营收、员工数、市场份额等）旁边必须跟置信度 badge
- 表格的"置信度"列统一用 badge，正文中数据后缀 badge
- C/D 级数据必须在 `<div class="warning">` 里额外说明不确定性
- 一份高质量报告的 A+B 级数据应占 ≥ 60%

### 4.9 可折叠章节（长报告用）

```html
<details class="section-collapsible" open>
  <summary>
    <span class="sec-num">{N}</span>
    <h2>{章节标题}</h2>
    <span class="section-preview">{预览文字}</span>
  </summary>
  <div class="section-body">
    <!-- 内容 -->
  </div>
</details>
```

### 4.10 Chart.js 图表

```html
<div class="chart-wrap">
  <div class="chart-title">{图表标题}</div>
  <canvas id="{唯一ID}"></canvas>
</div>
<script>
new Chart(document.getElementById('{唯一ID}'), {
  type: 'bar', // bar | doughnut | radar | line
  data: { /* ... */ },
  options: {
    plugins: { legend: { labels: { color: getComputedStyle(document.documentElement).getPropertyValue('--text').trim() } } },
    scales: { x: { ticks: { color: 'var(--text-muted)' } }, y: { ticks: { color: 'var(--text-muted)' } } }
  }
});
</script>
```

> 图表颜色必须用 CSS 变量，确保随主题切换。

### 4.11 主题切换器（每份报告必须）

```html
<div class="theme-switcher" id="themeSwitcher">
  <button class="theme-toggle" onclick="document.getElementById('themeSwitcher').classList.toggle('collapsed')">🎨</button>
  <div class="theme-list">
    <button class="theme-btn" onclick="setTheme('ghost')"><span class="theme-dot" style="background:#f8f9fa"></span>Ghost</button>
    <button class="theme-btn" onclick="setTheme('steel')"><span class="theme-dot" style="background:#0c1421"></span>Steel</button>
    <button class="theme-btn" onclick="setTheme('void')"><span class="theme-dot" style="background:#0a0a0a"></span>Void</button>
    <button class="theme-btn" onclick="setTheme('matrix')"><span class="theme-dot" style="background:#000000"></span>Matrix</button>
    <!-- 更多主题按钮... -->
  </div>
</div>
<script>
function setTheme(t) {
  document.documentElement.className = 'theme-' + t;
  document.querySelectorAll('.theme-btn').forEach(b => b.classList.remove('active'));
  event.target.closest('.theme-btn').classList.add('active');
  localStorage.setItem('osint-theme', t);
}
// 恢复上次选择的主题
const saved = localStorage.getItem('osint-theme');
if (saved) document.documentElement.className = 'theme-' + saved;
</script>
```

---

## 5. Footer（每份报告必须）

```html
<div class="footer">
  本报告仅供委托方内部参考，数据截止 {DATE}，不构成投资或法律建议。<br>
  <strong>{YOUR_WEBSITE}</strong> · {YOUR_SLOGAN}
</div>
```

---

## 6. 禁止事项

- ❌ 不加 `<details class="methodology">` 研究方法论章节
- ❌ 不加 Sources/信息来源章节（合规声明在 footer 已覆盖）
- ❌ 不加公司署名
- ❌ 不显示内部变量（HAS_AMAZON / HAS_DTC 等）
- ❌ 不用外部 CSS 文件（`report-template.css` 已废弃）
- ❌ 不用教育/教程语气
- ❌ 不加 AI 味套话（"在当今数字化时代"、"综上所述"）

---

## 7. 必须事项

- ✅ 每个竞品/公司表格必须包含网址（优先官方域名）
- ✅ 风险评级 🔴🟡🟢 必须出现在 header 和报告正文
- ✅ 脉弱分析用 `so-what` 块呈现（事实→含义）
- ✅ 可信度标注（✅ 多源验证 / ⚠️ 单源 / ❌ 无法验证）
- ✅ 所有 CSS 内联，自包含 HTML
- ✅ 主题切换器固定右下角
- ✅ 打印友好（`@media print` 隐藏切换器）
- ✅ 完成后打印完整文件路径

---

## 8. 语气标准

**你是情报分析师，不是老师，不是营销人。**

| 该做 | 不该做 |
|------|--------|
| "数据显示 MRR 口径不一致（$50K vs $70K）" | "值得注意的是，该公司的收入数据存在一些差异" |
| "LinkedIn 宣称 $5M ARR，实际约 $840K — 6倍差距" | "我们发现他们的目标与实际业绩之间存在一定gap" |
| "AppSumo 2.33/5 评分，6条评论 — 样本不足以下结论" | "在用户评价方面，该产品获得了较低的评分" |
| "❌ 中文生态零存在 = 搬运套利窗口" | "在中国市场方面，目前还有较大的发展空间" |
