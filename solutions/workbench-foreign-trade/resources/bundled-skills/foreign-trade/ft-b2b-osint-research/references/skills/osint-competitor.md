# Skill: 竞争对手情报调查

> 适用：了解竞争对手真实动态，发现市场机会，制定竞争策略
> 核心哲学：不是"收集信息"，而是**发现别人看不见的脉弱**。

## PIR 清单

1. **真实市场地位**: 规模/份额与声称相符吗？
2. **战略方向**: 正在构建什么新能力？向哪里移动？
3. **弱点地图**: 客户在抱怨什么？哪里是可攻击点？
4. **供应链**: 他们从哪里拿货？你能拿到更好的条件吗？

## KIQ 定义（关键情报问题）

> 先写清楚要回答什么问题，再去采集数据。不带着问题去采集 = 信息垃圾。

调查开始前，基于用户目标生成 3-5 个 KIQ：

```
KIQ 模板：
1. [竞品名] 在过去 12 个月有哪些关键战略动作？（产品/渠道/融资/并购）
2. [竞品名] 的核心弱点是什么？是结构性的还是偶发的？
3. 客户在选择 [竞品名] vs 替代方案时最看重什么？
4. [竞品名] 的供应链结构对我们意味着什么机会？
5. 未来 6 个月 [竞品名] 最可能往哪个方向动？
```

完成调查后，每个 KIQ 必须有明确回答（或标注"数据不足，无法判断"）。

## KIT 追踪（关键情报主题）

> 把一次性调查升级为可持续监控的框架。

为每个竞品/行业设置 KIT 标签，后续可用于定期更新：

| KIT 标签 | 含义 | 典型信号源 |
|---------|------|-----------|
| `pricing_change` | 定价/促销变动 | 官网、Amazon、经销商报价 |
| `product_launch` | 新品/新功能发布 | 官网、PR、Amazon 新品 |
| `channel_expansion` | 渠道/区域扩张 | 招聘 JD、新闻、展会 |
| `partnership_ma` | 合作/并购/融资 | Crunchbase、新闻、SEC 8-K |
| `hiring_signal` | 招聘动态（战略信号） | LinkedIn Jobs、Indeed |
| `supply_chain` | 供应链变动 | ImportYeti、招聘 Sourcing |
| `reputation` | 声誉/评价变化 | Trustpilot、G2、Amazon |
| `regulatory` | 合规/认证/政策变化 | 政府公告、行业协会 |

**使用方式**：调查中发现的每条关键情报都标注对应 KIT 标签，方便后续按主题追踪变化。

## 竞品情报五步法

```
Step 1：竞品识别    → 谁是真正的竞争对手？
Step 2：多维数据采集 → 他们在哪些维度上暴露了什么？
Step 3：供应链溯源   → 他们从哪里拿货？
Step 4：弱点矩阵    → 哪些弱点是结构性的？
Step 5：机会矩阵    → 你的切入点在哪里？
```

## 数据采集清单

### 第一层：基础情报（必做）

- [ ] **官网深度分析** — 产品线 + 定价 + 目标客户 + 案例研究
- [ ] **技术栈** — `builtwith.com/[域名]` 或 web-check
  - ERP/CRM 信号（NetSuite/Salesforce = 正规运营）
  - Shopify/WooCommerce = DTC 模式
  - 分析工具（GA4/Amplitude/Mixpanel = 数据驱动团队）
- [ ] **招聘分析（战略信号）** — LinkedIn Jobs + Indeed
  - 大量招聘某类职位 = 该方向在加强
  - 招 Sourcing Manager = 正在换供应商
  - 招 QA/Quality = 产品质量出了问题
  - 停止招聘某类职位 = 在收缩或外包
- [ ] **客户评价挖掘（弱点）**
  - G2/Capterra（SaaS）、Trustpilot、Google Reviews、Amazon Reviews
  - 分析差评主题 → 持续 > 3月 = 结构性弱点 → 你的差异化机会

### 第 1.5 层：Amazon 实数据（卖家精灵 MCP — 必做）

> 用真实销量数据替代估算，这是竞品调查可信度的分水岭。

**品牌产品线扫描**：
- [ ] `competitor_lookup(brand="[品牌名]", marketplace="US")` → 全部产品 + 真实月销量/销售额/BSR/评分
  - 按 `total_amount` 降序 → 识别营收贡献 Top 5 产品
  - 按 `total_units_growth` 降序 → 识别增长最快的新品
  - 记录总 SKU 数、加总月销售额 → **年营收精算**（非估算）

**主力 ASIN 深度分析**（取 Top 3-5 ASIN）：
- [ ] `asin_prediction(asin, marketplace="US")` → 14 个月销量趋势（增长/平稳/衰退）
- [ ] `keepa_info(asin, marketplace="US")` → 价格历史 + BSR曲线 + 卖家数变化 + 评论增速
- [ ] `traffic_source(q="[ASIN]", marketplace="US")` → 流量结构（自然 vs 广告占比）
  - 广告占比 > 60% = 靠烧钱维持，一旦停投就掉排名
  - 自然占比 > 70% = 品牌力强，护城河深
- [ ] `traffic_keyword(asin="[ASIN]", marketplace="US")` → 核心流量关键词 + 自然排名 + 广告排名

**类目竞争格局**：
- [ ] `market_brand_concentration(nodeIdPath="[类目ID]", marketplace="US")` → 品牌集中度（精确 CR5/CR10）
- [ ] `market_seller_concentration(nodeIdPath="[类目ID]", marketplace="US")` → 卖家集中度
- [ ] `market_price_distribution(nodeIdPath="[类目ID]", marketplace="US")` → 价格带分布 + 各价格带销量占比
- [ ] `market_listing_trend_distribution(nodeIdPath="[类目ID]", marketplace="US")` → 新品存活率 + 上架时间分布

**需求趋势验证**：
- [ ] `keyword_research(keywords="[核心关键词]", marketplace="US")` → 月搜索量 + 购买率 + 供需比 + 增长率
- [ ] `google_trend(keyword="[品牌名]", marketplace="US")` → Google 搜索趋势

> **类目 ID 获取**：先用 `product_node` 查询产品类目节点路径，再传入 market_* 工具。

### 第二层：财务与业务动态

- [ ] **SEC 财报**（上市公司）— SEC EDGAR MCP
  - 10-K/10-Q：营收、利润、增长率
  - 8-K：重大事件（裁员、并购、管理层变动）
  - Form 4：内幕交易（高管抛售 = 看空信号）
- [ ] **融资信息**（私营公司）— Crunchbase / Tracxn / PitchBook
- [ ] **近 6 个月新闻/PR** — 产品发布、合作、扩张
- [ ] **社媒发帖频率** — 频率下降 = 内部有问题
- [ ] **Google Trends** — `"[竞品品牌]"` 搜索趋势，同比对比

### 第三层：供应链溯源

- [ ] **ImportYeti 搜索** — `importyeti.com/company/[公司名]`
  - 进口商（美国公司名）
  - 出口商（中国工厂名）
  - 品类 / HS 编码
  - 进口频次和数量趋势
- [ ] **供应商反查** — 用中国工厂名反查
  - 1688.com / 阿里巴巴（工厂背景）
  - 还给哪些品牌供货？
  - 工厂规模 vs 竞品订单量 → 他们是大客户还是小客户？
- [ ] **你能拿到比竞品更好的条件吗？**

### 第四层：决策人情报

- [ ] **Hunter 域名搜索** — `hunter_domain_search([域名])`
- [ ] **Apollo 关键人物** — `apollo_person_enrich([姓名], [公司])`
- [ ] **LinkedIn 员工动态** — 近3月是否有高管离职/入职

### 第五层：定价情报
> 加载 `skills/osint-pricing-anatomy.md` 执行价格瀑布分析

- [ ] 完整产品定价矩阵
- [ ] 对比自身定价，找到价值洼地
- [ ] 定价策略判断：低价铺量 / 品牌溢价 / 中间定位
- [ ] **价格瀑布** — 估算 FOB→到岸→DTC→分销→零售 全链路
- [ ] **倍率计算** — FOB→DTC倍率 + FOB→零售倍率 → 判断健康度
- [ ] **渠道定价** — MAP政策/Dealer体系/渠道冲突检查
- [ ] **人均产值** — 营收÷员工数 → 对照基准表判断效率

### 第六层：中国出海品牌运营拆解（目标为中国DTC品牌时必做）
> 加载 `skills/osint-dtc-china.md` 执行完整拆解

- [ ] **品牌进化阶段** — Stage 0-5 判断 + 下一阶段预测
- [ ] **运营模式七维度** — 供应链/渠道/产品/营销/组织/技术/关税
- [ ] **可复制性评估** — 哪些环节可直接复制、需改良、无法复制
- [ ] **中国DTC专用脉弱** — 8个中国品牌特有的交叉矛盾检测
- [ ] **标杆对照** — 与Anker/EcoFlow/DJI等标杆品牌对标定位

## PESTEL 竞争环境扫描（可选，多竞品对比时推荐）

> 理解竞品时不能只看他们自己，还要看外部环境怎么影响他们。

当调查涉及多个竞品或需要判断行业走向时，执行 PESTEL 快扫：

| 维度 | 关键问题 | 对竞品的影响 | 对你的机会 |
|------|---------|-------------|-----------|
| **P** 政治/关税 | 关税变化？贸易壁垒？地缘风险？ | [竞品受影响程度] | [你能利用吗？] |
| **E** 经济 | 目标市场经济周期？采购预算趋势？ | [竞品的成本压力] | [价格策略空间] |
| **S** 社会/消费 | 终端需求变化？可持续/ESG趋势？ | [竞品是否跟上趋势] | [差异化机会] |
| **T** 技术 | 技术颠覆？新材料/新工艺？AI影响？ | [竞品技术储备] | [技术差异化] |
| **E** 环境 | 环保法规？碳排放？回收要求？ | [竞品合规成本] | [绿色溢价空间] |
| **L** 法律 | 产品认证？知识产权？进口标准？ | [竞品认证覆盖] | [认证壁垒/优势] |

**使用场景**：当需要判断"竞品的弱点是偶发的还是结构性的"时，PESTEL 帮你看清外部力量是否在加剧或缓解该弱点。

> **⚠️ So What**: 此模块输出后必须追加 `<div class="so-what">` 块。

## 脉弱交叉分析（核心价值）

> 单一数据点没有意义，**跨维度矛盾点**才是真正的情报。

完成数据采集后，**必须**执行以下交叉分析：

| # | 组合 | 逻辑 | 机会信号 |
|---|------|------|---------|
| 1 | 招聘 JD × 进口记录 | 招 Sourcing + 进口量下降 | 🔥 正在换供应商，**最佳切入窗口** |
| 2 | 差评主题 × 技术栈 | 差评持续3月+ 且无技术解决能力 | 🔥 结构性弱点，你的差异化机会 |
| 3 | 员工流动 × 评分趋势 | 关键岗位连续换人 + 评分下滑 | 🔥 内部动荡，客户信任正在流失 |
| 4 | 进口频次 × BSR/销量 | 无进口记录 + BSR 暴跌 | 🔥 断货危机，抢他的下游客户 |
| 5 | 域名年龄 × 员工数 × SKU 数 | 域名<1年 + <5人 + 50+ SKU | ⚠️ 铺货型机会主义者，非真玩家 |
| 6 | Google Trends × 季节 | 搜索量即将上升 | 📈 提前备货锁定合作的时机 |
| 7 | 融资/8-K × 产品线变化 | 裁员+砍产品线 | 🔥 收缩信号，抢他放弃的市场 |
| 8 | 高管抛售 × 新闻 | Form 4 集中卖出 + 负面新闻 | ⚠️ 内部人看空，警惕或趁虚而入 |

## 弱点矩阵模板

| 弱点 | 证据来源 | 严重程度 | 是否结构性 | 持续时间 | 客户绑定度 | 我的切入 |
|------|---------|---------|-----------|---------|-----------|---------|
| *示例：安装说明不清晰* | *Trustpilot 差评 23%* | *中* | *✅ 是（无内容团队）* | *6月+* | *中（有替代方案）* | *提供安装视频方案* |

> **图表提示**: 竞品对比矩阵适合用雷达图叠加展示。每个竞品一条线，5-7个维度。
> 参考 `reports/osint/report-charts-guide.md` 雷达图模板。

> **⚠️ So What**: 此模块输出后必须追加 `<div class="so-what">` 块。

**客户绑定度评估**（竞品把客户锁多深？）：
- 🔴 **高绑定**: 长期合同 / 独家协议 / 定制模具 / ERP集成 → 短期难撬动，走长线
- 🟡 **中绑定**: 有合作但非排他 / 按订单合作 / 可多供应商 → 先做补充，再逐步替换
- 🟢 **低绑定**: 无固定供应商 / 正在换 / 新品类无合作 → 最佳切入窗口

判断标准：
- **结构性弱点** = 需要新增团队/能力才能解决，短期内不会消失
- **偶发性弱点** = 一次性事件（物流延迟、季节断货），可能自行修复

## BCG 市场地位矩阵

```
市场份额（高/低） × 类目增速（高/低）

⭐ 明星    高份额 + 高增速 → 正面竞争需差异化，或找细分切入
💰 现金牛  高份额 + 低增速 → 市场成熟，侧翼进攻找未满足需求
❓ 问题    低份额 + 高增速 → 新兴市场机会，快速跟进
🐕 瘦狗    低份额 + 低增速 → 回避，或超低成本清库存逻辑
```

> **图表提示**: 市场份额分布用水平柱状图，品牌集中度(CR3/CR5)用环形图。

数据来源：
- 市场份额代理指标 → 卖家精灵 BSR + 评价数量 + Amazon 排名
- 类目增速 → Google Trends + 卖家精灵关键词搜索量同比

## ACH 假设框架（竞争对手）

```
假设 A: 正在积极扩张，6个月内进入我们核心市场
假设 B: 维持现状，无重大战略变化
假设 C: 正在收缩或面临内部困境（机会窗口）
```

## 竞品报告输出模板

> **双模式自动切换**：调查 1 家竞品 → 维度 Tab 模式；调查 2+ 家 → 竞品 Tab（Battlecard）模式。
> **必读**：生成报告前先读取 `reports/osint/report-template.css`（CSS 权威源）和 `reports/osint/report-charts-guide.md`（图表+Tab 模板）。

### 模式判断逻辑

```
IF 竞品数量 == 1:
    → 维度 Tab 模式（6 个 tab 按分析维度切分）
ELIF 竞品数量 >= 2:
    → Battlecard 模式（总览对比 + 每家一个 tab）
```

### HTML 骨架：公共部分

所有竞品报告都包含以下公共元素：

```html
<!-- <head> 中引入 -->
<link rel="stylesheet" href="../report-template.css">
<script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js"></script>
<script src="../chart-templates.js"></script>
<script>
/* Tab 初始化 */
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
```

---

### 模式一：维度 Tab（单竞品深调）

6 个 tab 按分析维度切分，让长报告更好导航：

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

  <!-- Tab 1: 概览 -->
  <div class="bc-tab-panel bc-active" data-tab="tab-overview" data-print-title="概览">
    <!-- 基础信息卡片：官网/Amazon Store/建站时间/技术栈 -->
    <!-- 主力产品/价格区间/月销量 -->
    <!-- 卖家类型/员工规模/所在地 -->
    <!-- 风险评级（🔴🟡🟢） -->
    <!-- BCG 定位：[明星/现金牛/问题/瘦狗] — 理由 -->
  </div>

  <!-- Tab 2: 市场数据 -->
  <div class="bc-tab-panel" data-tab="tab-market" data-print-title="市场数据">
    <!-- 卖家精灵数据：品牌产品线扫描 + Top ASIN 深度 -->
    <!-- 价格分布图表（createBarChart / createGroupedBarChart） -->
    <!-- 需求趋势（createLineChart — BSR + 评价） -->
    <!-- 流量结构（createDoughnutChart — 自然 vs 广告） -->
    <!-- Google Trends 对比 -->
  </div>

  <!-- Tab 3: 供应链 -->
  <div class="bc-tab-panel" data-tab="tab-supply" data-print-title="供应链情报">
    <!-- ImportYeti 进口记录 -->
    <!-- 美国进口商 → 中国供应商反查 -->
    <!-- 进口频次趋势（createLineChart） -->
    <!-- 供应商还给谁供货？ -->
    <!-- 你能拿到更好的条件吗？ -->
  </div>

  <!-- Tab 4: 弱点矩阵 -->
  <div class="bc-tab-panel" data-tab="tab-weakness" data-print-title="弱点矩阵">
    <!-- 弱点表格 -->
    <!-- | 弱点 | 证据来源 | 严重程度 | 是否结构性 | 持续时间 | 客户绑定度 | 我的切入 | -->
    <!-- 差评主题分析：正向 Top 3 + 负向 Top 3 -->
    <!-- 客户绑定度评估（🔴高/🟡中/🟢低） -->
    <!-- 财务信号（营收/融资/内幕交易） -->
    <!-- ⚠️ So What 块 -->
  </div>

  <!-- Tab 5: 脉弱交叉 -->
  <div class="bc-tab-panel" data-tab="tab-pulse" data-print-title="脉弱交叉分析">
    <!-- 所有触发的交叉信号（8 组组合检测结果） -->
    <!-- ACH 假设框架（扩张/维持/收缩） -->
    <!-- PESTEL 环境扫描（如适用） -->
    <!-- ⚠️ So What 块 -->
  </div>

  <!-- Tab 6: 行动建议 -->
  <div class="bc-tab-panel" data-tab="tab-action" data-print-title="行动建议">
    <!-- 1. 立即行动 -->
    <!-- 2. 短期（1-3月） -->
    <!-- 3. 中期（3-6月） -->
    <!-- 战略深度入口（加载 strategic-growth-advisor） -->
  </div>
</div>
```

**各 tab 内容要求**：
- 每个 tab 内的图表用 `<div class="chart-wrap">` + `<div class="chart-title">洞察句</div>` 包裹
- 弱点矩阵和脉弱交叉 tab 结尾必须追加 `<div class="so-what">` 块
- 雷达图用于概览 tab 展示竞品多维度评分

---

### 模式二：Battlecard（多竞品对比）

总览对比 tab + 每个竞品一个独立深调 tab（最多 5 家）：

```html
<div class="bc-tabs">
  <div class="bc-tab-bar">
    <input type="radio" id="tab-overview" name="bc" class="bc-tab-input" checked>
    <label for="tab-overview" class="bc-tab-label">总览对比</label>
    <!-- 为每个竞品生成一个 tab，id 用 tab-comp1, tab-comp2... -->
    <input type="radio" id="tab-comp1" name="bc" class="bc-tab-input">
    <label for="tab-comp1" class="bc-tab-label">[竞品A品牌名]</label>
    <input type="radio" id="tab-comp2" name="bc" class="bc-tab-input">
    <label for="tab-comp2" class="bc-tab-label">[竞品B品牌名]</label>
    <!-- ... 最多 5 个竞品 tab -->
  </div>

  <!-- 总览对比 Tab：四大组件 -->
  <div class="bc-tab-panel bc-active" data-tab="tab-overview" data-print-title="总览对比">

    <!-- 组件 1: 雷达图叠加 — 所有竞品在同一张图 -->
    <div class="chart-wrap">
      <div class="chart-title">[洞察句：谁在哪个维度领先/落后]</div>
      <canvas id="radarOverview" style="max-height:300px"></canvas>
    </div>
    <!-- createRadarChart('radarOverview', [维度标签], [{label:'竞品A',data:[...]}, ...]) -->

    <!-- 组件 2: 核心指标对比表 -->
    <table class="bc-kpi-compare">
      <thead><tr><th>指标</th><th>竞品A</th><th>竞品B</th><!-- ... --></tr></thead>
      <tbody>
        <!-- 行：月销售额 / 平均售价 / 平均评分 / SKU数 / 员工数 -->
        <!-- 每行最优值加 class="bc-kpi-best" -->
      </tbody>
    </table>

    <!-- 组件 3: 弱点热力图 -->
    <table class="bc-heatmap">
      <thead><tr><th>弱点维度</th><th>竞品A</th><th>竞品B</th><!-- ... --></tr></thead>
      <tbody>
        <!-- 行：按场景选 5-8 个维度 -->
        <!-- 单元格用 bc-heat-high / bc-heat-mid / bc-heat-low / bc-heat-none -->
      </tbody>
    </table>

    <!-- 组件 4: BCG 四象限 — 气泡大小 = 月销额 -->
    <div class="chart-wrap">
      <div class="chart-title">[洞察句：谁是明星/现金牛/问题/瘦狗]</div>
      <canvas id="bcgQuadrant" style="max-height:300px"></canvas>
    </div>
    <!-- createBubbleChart('bcgQuadrant', [{label:'竞品A', x:份额, y:增速, r:月销额归一化}, ...],
         {xTitle:'市场份额', yTitle:'类目增速(%)', yAxisSuffix:'%'}) -->

    <!-- So What 块 -->
    <div class="so-what">
      <strong>⚠️ So What</strong>：[基于四组件的综合判断：谁最危险、谁有机可乘、整体竞争格局一句话总结]
    </div>
  </div>

  <!-- 各竞品独立 Tab：与单竞品模式同等深度 -->
  <div class="bc-tab-panel" data-tab="tab-comp1" data-print-title="[竞品A品牌名] 深度分析">
    <!-- 完整深调内容，结构同"单竞品维度 Tab"的所有内容，但不需要再套 bc-tabs -->
    <!-- 包含：基础信息 → 市场数据 → 供应链 → 弱点矩阵 → 脉弱交叉 → 行动建议 -->
    <!-- 用 <h3> 分节即可，不需要嵌套 tab -->
  </div>

  <div class="bc-tab-panel" data-tab="tab-comp2" data-print-title="[竞品B品牌名] 深度分析">
    <!-- 同上 -->
  </div>
</div>
```

**总览对比页四组件规则**：
1. **雷达图** — 维度选 5-7 个，所有竞品叠加显示，用 `createRadarChart()`
2. **KPI 对比表** — 每行最优值标 `bc-kpi-best`（注意：价格低不一定是"最优"，需按指标含义判断）
3. **弱点热力图** — 维度选择参考 `report-charts-guide.md` 第 8 节的场景建议表
4. **BCG 四象限** — 用 `createBubbleChart()`，x=市场份额代理指标，y=类目增速，r=月销额

---

### 战略深度分析（可选 — 两种模式通用）

> 如需更深度的战略分析，加载 `skills/strategic-growth-advisor/SKILL.md`，将竞品情报喂入：
> - **Porter 五力** — 评估该品类/市场的结构性吸引力
> - **Helmer 7 Powers** — 审计竞品和自身的护城河
> - **Hormozi 价值方程** — 基于差评痛点设计差异化 Offer
> - **Roger Martin** — Where to Play × How to Win 选择级联
> - **90天行动计划** — 基于竞品弱点的优先级行动
