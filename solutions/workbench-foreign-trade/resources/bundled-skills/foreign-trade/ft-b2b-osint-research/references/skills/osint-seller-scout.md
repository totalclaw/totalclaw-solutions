# Skill: Amazon 卖家发现 & 批量背调（Personal SmartScout）

> 由 `/osint [品类关键词/ASIN/品牌名] seller-scout` 命令触发
> 核心哲学：SmartScout 卖 $500/月，你用卖家精灵 + Hunter.io + ImportYeti + 天眼查做到同等效果，$83/月。
> 定位：**批量发现 → 快速筛选 → 深度调查 → 个性化接触**的四层漏斗。

## 服务类型（调查开始前必须确认）

调查启动时询问用户：
> "你为卖家提供什么服务？(1) 物流/仓储/FBA Prep  (2) 供货/产品采购  (3) 两者都有  (4) 其他（请描述）"

服务类型决定：**评分权重 / ImportYeti 分析角度 / Pitch 话术模板**

| 服务类型 | 核心筛选维度 | ImportYeti 关注点 | Pitch 核心卖点 |
|---------|------------|-----------------|--------------|
| **logistics** (物流/仓储) | FBA运量、发货频次、SKU体积重量 | 进口频次+货量+路线+当前3PL | 降本X%/时效快Y天/FBA合规 |
| **supply** (供货/采购) | 品类匹配、当前供应商质量、产品痛点 | 当前工厂+HS code+采购价参考 | 更优品质/更低FOB/更快交期 |
| **both** | 综合评分 | 全维度 | 一站式供应链方案 |

## 与 amazon-seller 的区别

| 维度 | amazon-seller | seller-scout |
|------|--------------|-------------|
| 输入 | 单个 ASIN/品牌名 | 品类关键词/多个ASIN/卖家列表 |
| 目的 | 单个卖家深度背调 | 批量发现+筛选+批量背调+生成接触策略 |
| 产出 | 1份详细报告 | 卖家清单（含评分排序）+ Top N 详细报告 + Pitch模板 |
| 适用 | 已知目标验证 | 开发新客户/竞品扫描/服务商获客 |

---

## 三层漏斗流程

```
Layer 1: 发现（Discovery）
  品类关键词 → 卖家精灵 market_research → 头部品牌/卖家列表
  或 ASIN列表 → competitor_lookup → 卖家店铺扫描
  目标：从品类中挖出 30-100 个活跃卖家
  ↓ 筛选
Layer 2: 快筛（Qualification）
  每个卖家 → Amazon 卖家详情页 → Business Name + 地址 + 国家
  → 5 维快速评分 → 淘汰不合格 → 保留 Top 10-20
  ↓ 精选
Layer 3: 深调（Deep Investigation）
  Top 5-10 → 完整背调（复用 osint-amazon-seller.md 流程）
  → 公司注册 + 域名 + 联系方式 + 供应链 + 决策人
  → 输出带评分的卖家清单 + 接触策略
```

---

## Layer 1: 发现（Discovery）

> 目标：从一个品类/关键词出发，找到所有值得关注的卖家。

### 1.1 品类入口：卖家精灵 MCP

```
输入方式 A: 品类关键词
market_research(keyword="portable power station", market="US")
→ 品类总体数据：月搜索量、品牌数、产品数、均价、增长率

market_brand_concentration(keyword="portable power station", market="US")
→ 头部品牌列表 + 市场份额（CR3/CR5）
→ 直接获得品类 Top 品牌名单

market_seller_concentration(keyword="portable power station", market="US")
→ 头部卖家列表 + 卖家类型分布
→ 区分品牌自营 vs 第三方卖家 vs 亚马逊自营

market_seller_country_distribution(keyword="portable power station", market="US")
→ 卖家国家分布（中国卖家占比）
→ 判断品类的中国卖家密度
```

```
输入方式 B: 已知品牌/卖家名
competitor_lookup(sellerName="[卖家店铺名]", market="US")
→ 该卖家全部产品列表、各产品BSR、价格、评价数
→ 了解卖家的产品线规模和品类分布

competitor_lookup(brandName="[品牌名]", market="US")
→ 该品牌全部产品，可能涉及多个卖家账号
```

```
输入方式 C: ASIN 反查
asin_detail(asin="B0XXXXXX", market="US")
→ 获取该ASIN的品牌名、卖家名
→ 再用 competitor_lookup 展开卖家全部产品

keyword_order(keyword="[品类主词]", market="US")
→ 该关键词自然排名 Top 产品列表
→ 提取每个产品的品牌名/卖家名 → 构建卖家清单
```

### 1.2 构建卖家初始清单

从 Layer 1 采集结果中提取所有不重复的卖家/品牌，整理为：

```
初始卖家清单（目标 30-100 个）：
| # | 品牌名 | 卖家店铺名 | 主力ASIN | 价格带 | 预估月销 | 来源 |
|---|--------|----------|---------|--------|---------|------|
| 1 | EcoFlow | EcoFlow Direct | B0XXXXX | $200-2000 | — | brand_concentration |
| 2 | Jackery | Jackery Inc | B0XXXXX | $100-1500 | — | brand_concentration |
| ... |
```

---

## Layer 1.5: ImportYeti 供应链预扫（必做）

> 在快筛之前批量扫描 ImportYeti，获取每个卖家的真实进口数据。
> 这一步是本 skill 的核心差异化——SmartScout 没有供应链数据。

### 1.5.1 批量 ImportYeti 扫描

对 Layer 1 初始清单中的每个 Business Name 执行：

```
WebSearch: "[Business Name]" site:importyeti.com

提取：
- 是否有进口记录（有=真实进口商，无=可能中国直发/代发）
- 进口频次（月均几次 shipment）
- 年度估算货量（TEU/CBM/件数）
- 主要出口商（中国工厂名）
- HS code（产品类型确认）
- 进口路线（港口→港口）
```

### 1.5.2 按服务类型提取关键指标

**物流服务 (logistics)**：
```
关注字段：
- 进口频次 → 高频(月4+次)=大客户，低频(季度1次)=小客户
- 货量 → 估算月均 CBM/TEU → 对应仓储需求
- 当前路线 → 从哪个港到哪个港 → 你能覆盖吗？
- 发货方式 → FBA入仓还是自有仓 → 需要什么服务？

高价值信号：
✅ 月4+次进口 + 多个HS code = 高运量多品类（大客户）
✅ 进口量持续增长 = 业务扩张（需要更多仓储/物流）
✅ 路线分散（多港口） = 当前物流方案可能不优化
⚠️ 无进口记录 = 可能用中国直发/第三方代发（物流需求小）
```

**供货服务 (supply)**：
```
关注字段：
- 当前供应商（工厂名） → 你认识这个厂吗？你的厂更好吗？
- HS code → 确认品类是否匹配你的产品线
- 采购频次 → 稳定采购=长期合作意向
- 供应商数量 → 单一供应商=有换厂风险，多供应商=可以切入

高价值信号：
✅ 单一供应商 + 高采购量 = 供应链风险高（你的切入点）
✅ 供应商在你的工厂同区域 = 地理优势
✅ HS code 匹配你的产品 = 品类精准
✅ 最近换过供应商 = 正在找新货源（最佳窗口）
⚠️ 无进口记录 = 可能是工贸一体/自有工厂（不需要供货）
```

### 1.5.3 ImportYeti 快速评分（附加到卖家清单）

| 指标 | 物流权重 | 供货权重 | 评分标准 |
|------|---------|---------|---------|
| 有进口记录 | 必要条件 | 加分项 | 有=+3, 无=淘汰(物流)/0(供货) |
| 进口频次 | 高 | 中 | 月4+=5, 月1-3=3, 季度=1 |
| 供应商集中度 | 低 | 高 | 单一=5(供货)/2(物流), 多个=3/3 |
| 货量增长趋势 | 高 | 中 | 增长=5, 稳定=3, 下降=1 |

---

## Layer 2: 快筛（Qualification）

> 目标：结合 Amazon 数据 + ImportYeti 数据，用最少时间淘汰不合格卖家。

### 2.1 每个卖家执行快速数据采集

对初始清单中每个卖家，执行以下**轻量**采集（每个卖家 < 2分钟）：

**Step A: Amazon 卖家详情页**
```
WebFetch: amazon.com/sp?seller=[sellerID]
或 WebSearch: "[品牌名]" site:amazon.com "Detailed Seller Information"

提取：
- Business Name（法律实体名）
- Business Address（注册地址）
- Country（国家）
- "Selling on Amazon since"（经营年限）
```

**Step B: 卖家精灵快速数据**
```
asin_prediction(asin="[主力ASIN]", market="US")
→ 月销量、月营收 → 判断规模

traffic_listing_stat(asin="[主力ASIN]", market="US")
→ 流量词数 → 判断运营能力
```

**Step C: 品牌域名快速发现**
```
WebSearch: "[品牌名]" official website
→ 有无官网 → 判断是否正规品牌

如有官网 → 记录域名，后续 Layer 3 用
```

### 2.2 七维快速评分（含服务类型权重）

对每个卖家按 7 个维度打分（每项 1-5 分）：

| 维度 | 1分 | 3分 | 5分 | 物流权重 | 供货权重 |
|------|-----|-----|-----|---------|---------|
| **规模** | 月营收 <$10K | $10K-$100K | >$100K | 20% | 15% |
| **品牌化** | 无官网，店铺名随机 | 有基础官网 | 完整DTC官网+社媒 | 10% | 15% |
| **运营力** | <50个流量词 | 50-500 | >500 | 10% | 15% |
| **合规性** | 无Business Name | 正常LLC | 有商标+正规公司 | 10% | 10% |
| **接触性** | 无公开联系方式 | 有官网但无邮箱 | 官网+邮箱+LinkedIn | 15% | 15% |
| **进口量** | 无记录/极低 | 中等频次 | 月4+次高频 | **25%** | 10% |
| **供应链匹配** | HS code不匹配 | 部分匹配 | 精准匹配+单一供应商 | 10% | **20%** |

**加权评分** = 各维度分数 x 对应权重，总分 1.0-5.0

**淘汰线**：
- 加权总分 < 2.5 → 直接淘汰
- 物流模式：无进口记录 → 直接淘汰（无物流需求）
- 供货模式：工贸一体（自有工厂）→ 降级但不淘汰（可能需要辅料/配件）

### 2.3 输出筛选后清单

```
筛选后卖家清单（Top 10-20）：
| 排名 | 品牌 | Business Name | 国家 | 月营收 | 评分 | 进口频次 | 当前供应商 | 官网 | 接触建议 |
|------|------|--------------|------|--------|------|---------|----------|------|---------|
| 1 | BrandA | XX LLC | US | $150K | 4.2 | 月6次 | 深圳XX工厂 | brandA.com | 优先-物流+供货 |
| 2 | BrandB | XX公司 | CN | $80K | 3.8 | 无(自有) | — | brandB.com | 仅供货-配件 |
| ... |
```

---

## Layer 3: 深调（Deep Investigation）

> 对 Top 5-10 卖家执行完整背调，复用 osint-amazon-seller.md 的五步流程。

### 3.1 中国卖家专项流程

> 中国卖家占 Amazon 第三方卖家的 40-50%，需要专门的调查路径。

**Step 1: 天眼查/企查查（公司注册核实）**
```
WebSearch: "[Business Name 中文公司名]" site:tianyancha.com
WebSearch: "[Business Name 中文公司名]" site:qcc.com

提取：
- 法定代表人（后续用于商标+域名反查）
- 注册资本 → 判断公司规模
- 成立日期 → 与Amazon经营年限交叉验证
- 股东结构 → 实际控制人
- 关联公司 → 是否有工厂实体/多个贸易公司
- 经营范围 → 是否匹配Amazon品类
- 社保人数 → 真实员工规模（比LinkedIn准）
```

**Step 2: 商标反查**
```
中国商标（CNIPA）：
WebSearch: "[品牌名]" site:sbj.cnipa.gov.cn OR "[品牌名]" 商标注册
→ 商标注册人 = 真实品牌所有者（可能与Amazon卖家不同）
→ 注册人地址 → 交叉验证天眼查

美国商标（USPTO）：
WebSearch: "[品牌名]" site:tsdr.uspto.gov OR "[品牌名]" USPTO trademark
→ 商标持有人（Owner）
→ 美国代理律师/代理地址
→ 注册日期 + 类别

关键发现：
- 商标持有人 ≠ Amazon卖家Business Name → 代运营/授权经销商
- 商标持有人 = 天眼查法人 → 品牌自营（最佳接触目标）
```

**Step 3: 域名→官网→联系方式**
```
域名发现：
WebSearch: "[品牌名]" official site OR "[品牌名].com"
WebSearch: "[品牌名]" site:shopify.com OR "[品牌名]" powered by shopify

WHOIS 查询：
WebFetch: https://who.is/whois/[域名]
→ 注册人（可能有隐私保护）
→ 注册日期 → 与公司成立日期交叉验证
→ 注册人邮箱（中国域名通常无隐私保护）

官网信息提取：
WebFetch: [域名]/contact OR /about OR /pages/about-us
→ 联系邮箱（通常是 info@/support@/sales@）
→ 联系电话
→ 地址（可能与Amazon不同 → 交叉验证）
→ 团队页面 → 关键人物姓名
```

**Step 4: 1688/阿里巴巴（工厂源头）**
```
WebSearch: "[中文公司名]" site:1688.com
WebSearch: "[品牌名]" site:alibaba.com

如果找到 1688 店铺：
→ 该卖家是工贸一体（自有工厂+自营Amazon）
→ 1688 页面有联系电话/旺旺 → 直接联系通道
→ 1688 产品价格 = FOB 出厂价参考

如果 1688 没有但 alibaba.com 有：
→ 该卖家同时做 B2B 外贸 → 有专门的外贸团队
→ alibaba 店铺有询盘入口
```

### 3.2 美国卖家专项流程

```
Step 1: 州务卿/OpenCorporates
WebSearch: "[Business Name]" site:opencorporates.com
WebSearch: "[Business Name]" secretary of state [州名]
→ 注册日期、注册人、经营状态

Step 2: BBB 核实
WebSearch: "[Business Name]" site:bbb.org
→ BBB评级、投诉数、经营年限

Step 3: Hunter.io 域名搜索
hunter_domain_search(domain="[品牌域名]")
→ 全部企业邮箱 + 职位 + LinkedIn
→ 邮箱格式 pattern

Step 4: LinkedIn 搜索
WebSearch: "[公司名]" site:linkedin.com/company
→ 员工数、关键人物
WebSearch: "[品牌名]" OR "[公司名]" site:linkedin.com/in founder OR owner OR CEO
→ 创始人/决策人 LinkedIn
```

### 3.3 供应链 + ImportYeti

```
WebSearch: "[Business Name]" site:importyeti.com
→ 进口记录：频次、工厂、品类
→ 判断真实进口量（与 asin_prediction 月销量交叉验证）

如果是中国卖家直发（无进口记录）：
→ 可能从中国仓直发 / 海外仓
→ 在 1688 反查工厂
```

---

## Layer 4: 个性化接触策略（Pitch Generation）

> 每个深调完成的卖家都输出一份可直接使用的接触方案。

### 4.1 接触渠道优先级

| 渠道 | 优先级 | 适用场景 | 工具 |
|------|--------|---------|------|
| **企业邮箱** | 最高 | 有官网域名 → Hunter.io 找到 | hunter_domain_search |
| **1688/阿里巴巴询盘** | 高（中国卖家） | 有 1688 店铺 | WebSearch site:1688.com |
| **LinkedIn InMail** | 高（美国卖家） | 找到决策人 LinkedIn | WebSearch site:linkedin.com |
| **官网联系表单** | 中 | 有官网但无邮箱 | WebFetch /contact |
| **天眼查电话** | 中（中国卖家） | 天眼查有法人电话 | WebSearch site:tianyancha.com |
| **Amazon 站内消息** | 最低（兜底） | 以上都找不到 | Amazon buyer message |

### 4.2 Pitch 模板（按服务类型）

**物流/仓储服务 Pitch**：
```
Subject: [品牌名] — 降低 FBA 头程成本 [X]% 的方案

Hi [决策人名],

我注意到 [品牌名] 在 [品类] 品类表现很强（[月营收/BSR数据]）。
根据公开的进口数据，贵司目前 [月X次从XX港进口]，
以这个运量，我们可以帮您：

- 头程运费降低 [X]%（我们在 [路线] 有固定舱位）
- FBA 入仓时效从 [当前天数] → [你能做到的天数]
- [其他具体优势，基于 ImportYeti 数据定制]

我们已为 [同品类其他客户] 提供类似服务。
方便这周简短聊 15 分钟？

[你的名字]
```

**供货/采购服务 Pitch**：
```
Subject: [品牌名] — [产品名] 更优供货方案

Hi [决策人名],

[品牌名] 的 [产品名] 在 Amazon 上评分很高（[评分/评价数]），
但我注意到用户反馈中有 [具体差评痛点，来自 osint-profitability 差评分析]。

我们工厂在 [地区]，专注 [品类]，可以：
- [针对差评痛点的具体改进]
- FOB 价格 [比当前供应商竞争力描述]
- 交期 [X] 天（含打样）

附上我们同类产品的规格书和报价，供参考。

[你的名字]
```

**组合服务 Pitch（物流+供货）**：
```
Subject: [品牌名] — 一站式供应链优化（生产→物流→FBA）

Hi [决策人名],

关注 [品牌名] 在 [品类] 的增长（[数据]）。
作为 [品类] 的一站式供应链服务商，我们可以帮您：

1. 产品端：[具体优势，基于供应链分析]
2. 物流端：[具体优势，基于 ImportYeti 数据]
3. 合规端：[如有关税/认证相关优势]

当前为 [X] 家同类 Amazon 品牌提供服务。
可以先发一份免费供应链诊断报告给您参考？

[你的名字]
```

### 4.3 Pitch 个性化规则

每封邮件必须包含**至少 2 个具体数据点**，让对方感觉"你真了解我的业务"：

| 数据点来源 | 示例 | 效果 |
|-----------|------|------|
| asin_prediction 月销量 | "贵司 [产品] 月销 [X] 件" | 展示你做了功课 |
| ImportYeti 进口频次 | "目前月均 [X] 次从 [港口] 进口" | 证明你了解他的供应链 |
| 差评痛点 | "用户反馈 [具体问题] 占差评的 [X]%" | 直击痛点 |
| 品类趋势 | "该品类月搜索量增长 [X]%" | 展示市场机会 |
| 竞品对比 | "[竞品] 已在用 [你的方案]" | 制造紧迫感 |

---

## 输出格式

### 格式 A: 卖家发现清单（主输出）

```markdown
# [品类名] Amazon 卖家发现报告

> 调查日期: YYYY-MM-DD | 品类: [关键词] | 市场: US | 服务类型: [logistics/supply/both]
> 发现卖家: XX 个 | 筛选通过: XX 个 | 深度调查: XX 个

## 品类概览（卖家精灵数据）

| 指标 | 数值 |
|------|------|
| 月搜索量 | XXX |
| 品牌数 | XX |
| 平均价格 | $XX |
| 中国卖家占比 | XX% |
| CR3 集中度 | XX% |

## 卖家清单（按评分排序）

| 排名 | 品牌 | Business Name | 国家 | 月营收 | 评分 | 进口频次 | 当前供应商 | 官网 | 接触渠道 |
|------|------|--------------|------|--------|------|---------|----------|------|---------|
| 1 | XX | XX LLC | US | $XXK | 4.2 | 月6次 | XX工厂 | xx.com | 邮箱已获取 |
| 2 | XX | XX有限公司 | CN | $XXK | 3.8 | 无(自有) | — | xx.com | 1688询盘 |
| ... |

## Top 5 深度调查 + 接触方案

### 1. [品牌A]
- **公司**: XX LLC, Delaware
- **规模**: 月营收 $XXK, XX 个SKU
- **决策人**: [姓名], [职位], [邮箱]
- **供应链**: [工厂名], 月[X]次进口, HS code [XXXX]
- **风险**: 🟢 低风险
- **服务匹配度**: ⭐⭐⭐⭐⭐ [具体原因]

**接触方案**:
- 渠道: [邮箱/LinkedIn/1688]
- 时机: [为什么现在是好时机，基于数据]
- Pitch: [个性化邮件草稿，含2+数据点]

### 2. [品牌B]
...
```

### 格式 B: 单个卖家详细报告

对需要深度调查的个别卖家，直接复用 `osint-amazon-seller.md` 的完整输出模板。

---

## 红旗清单（快筛阶段使用）

### 直接淘汰
- Business Name 是个人名 + 家庭地址 + SKU < 5 → 个人小卖家
- 多品类无关联产品（如同时卖宠物用品和汽车配件）→ 铺货型
- 店铺评分 < 80% → 运营能力差
- Amazon 经营 < 6 个月 + 无官网 → 太新，不稳定

### 需注意但不淘汰
- Business Name ≠ Brand Name → 可能是代运营，需确认
- 注册在 Wyoming/Delaware → 隐私州，信息少但不一定有问题
- 只有 1-2 个 SKU 但月销量很大 → 爆品型卖家，可能是好目标
- 中国公司注册资本 < 100万 → 小微企业，但不代表 Amazon 做得不好

---

## 批量效率优化

### 并行采集策略（Token 优化版）

```
Layer 1 的卖家精灵调用可以并行：
- market_brand_concentration 和 market_seller_concentration 并行
- 多个 competitor_lookup 可以并行（不同卖家）

Layer 1.5 + Layer 2 合并为统一快筛（减少 subagent 数量）：
- 每个 subagent 负责 8-10 个卖家，一次性完成：
  ① ImportYeti 供应链预扫 + ② Amazon 数据采集 + ③ 快速评分
- subagent 总数控制在 3-5 个（不超过 5 个）
- 每个 subagent 的 prompt 只传必要指令，不传完整的 references/agent-definition.md 与记忆文件
- 汇总后统一排名

Layer 3 的深调按优先级串行：
- 从评分最高的开始
- 每完成一个立即输出，用户可以随时叫停
```

### 查询额度管理

```
卖家精灵: 10000次/月

每次 seller-scout 调查预估消耗：
- Layer 1: 4-6 次（market_research + concentration × 3-4）
- Layer 2: 每个卖家 2 次（asin_prediction + traffic_listing_stat）
  → 30 个卖家 = 60 次
- Layer 3: 每个卖家 3-5 次（prediction + keepa + traffic_keyword）
  → 10 个卖家 = 30-50 次

总计: ~70-120 次/品类
→ 10000次/月 可支持 ~80 个品类扫描
```

---

## 与其他 Skill 的联动

| 发现结果 | 后续 Skill | 用途 |
|---------|-----------|------|
| 找到优质卖家 | `osint-amazon-seller.md` | 单个卖家完整深度背调 |
| 发现中国DTC品牌 | `osint-dtc-china.md` | 运营模式拆解 |
| 需要开发客户 | `osint-sales-playbook.md` | 生成销售作战手册 |
| 品类值得进入 | `osint-competitor.md` | 竞品情报完整分析 |
| 品类战略判断 | `osint-industry.md` | 行业快扫 |

---

## 使用示例

```
/osint "portable power station" seller-scout
→ 系统会先问服务类型 → 选 logistics → 按运量优先筛选 → 输出含物流 Pitch 的卖家清单

/osint "solar panel 200w" seller-scout
→ 选 supply → 按供应商匹配度优先 → 输出含供货 Pitch 的卖家清单

/osint "B0DRRYM7GL,B013TINE4S,B0CYZZZ3LY" seller-scout
→ 从 3 个 ASIN 出发，反查卖家，展开同品类扫描

/osint "Renogy,EcoFlow,Jackery,Bluetti" seller-scout
→ 从已知品牌列表出发，扫描各品牌产品线+发现同品类其他卖家
```

---

*本技能使用公开数据，遵守 Amazon TOS 和相关法律。调查结果仅供商业决策参考。*
