# Skill: 亚马逊卖家背景调查（Amazon Seller Intelligence）

> 由 `/osint [ASIN/品牌名/卖家名] amazon-seller` 命令触发
> 核心哲学：亚马逊把卖家藏在黑箱里，但每个卖家都在公开数据中留下了完整的痕迹。

## 为什么需要亚马逊卖家背调

```
痛点：
- Amazon 故意阻断卖家与外部的直接联系
- 消费者只能通过Amazon站内消息联系卖家
- 卖家电话/邮箱被Amazon隐藏
- 但供应商/服务商/合作方需要直接触达品牌方决策人

机会：
- Amazon 要求卖家公开 "Detailed Seller Information"（法律实体+地址）
- 品牌名 → 域名 → WHOIS → 联系方式
- 公司名 → 注册信息 → 法人/股东
- 域名 → Hunter.io → 全部企业邮箱
- 一条完整的情报链可以还原任何Amazon卖家的真实身份

适用场景：
- 供应商想为Amazon卖家供货
- 物流服务商想拿到品牌方合同
- 竞品分析（了解对手的真实规模和背景）
- 投资人尽调（验证品牌方的真实性）
```

---

## 调查流程（五步法）

### Step 1: Amazon 卖家信息提取

> 从Amazon页面获取所有公开信息。

#### 1.1 产品页信息

从产品listing页面提取：
- [ ] **"Ships from"** — 发货方（Amazon / 卖家自发）
- [ ] **"Sold by"** — 卖家店铺名（点击进入店铺页面）
- [ ] **Brand Name** — 品牌名（listing标题下方或Brand字段）
- [ ] **ASIN** — 产品唯一标识（URL中或产品详情中）
- [ ] **价格/评价数/BSR** — 销量估算基础数据

#### 1.2 卖家详情页（About Seller）

点击 "Sold by [卖家名]" → 卖家页面 → "Detailed Seller Information"：
- [ ] **Business Name** — 法律实体名（最关键数据点）
- [ ] **Business Address** — 注册地址（含国家）
- [ ] **Country** — 国家/地区

```
示例：
Business Name: Modern Connections LLC
Business Address:
14041 Hyatt Rd, Apt 3320
JACKSONVILLE, FL 32218-2281, US
```

#### 1.3 卖家店铺页

- [ ] **店铺名** — 可能与Business Name不同
- [ ] **产品数量** — 总SKU数（判断规模）
- [ ] **品类分布** — 主营什么品类
- [ ] **店铺评分** — 整体满意度
- [ ] **经营时长** — "Selling on Amazon since [年份]"

#### 采集方法

```
方法1: Playwright MCP（推荐）
- 用Playwright打开Amazon产品页
- 自动提取"Sold by"和品牌名
- 点击进入卖家详情页提取Business Name/Address

方法2: WebFetch（备选）
- WebFetch Amazon产品页 → 提取卖家信息
- 注意: Amazon可能返回429/封锁，需换User-Agent

方法3: 手动输入（兜底）
- 用户直接提供Business Name和Brand Name
- 跳过Step 1直接进入Step 2
```

---

### Step 2: 公司注册核实

> 验证Business Name是否真实注册，获取法人/股东信息。

#### 2.1 美国公司

| 来源 | 方法 | 获取数据 |
|------|------|---------|
| **OpenCorporates** | WebSearch `"[Business Name]" site:opencorporates.com` | 注册州、注册号、状态、法人 |
| **州务卿网站** | WebSearch `"[Business Name]" secretary of state [州名]` | 注册日期、注册人、年报状态 |
| **BBB** | WebFetch `bbb.org` 搜索 | 评级、投诉、经营年限 |

**常见美国Amazon卖家注册州**：
- Delaware（低税，隐私保护）
- Wyoming（零州税，匿名LLC）
- Florida（适合电商）
- California（实际运营地）
- Nevada（零州税）

#### 2.2 中国公司

| 来源 | 方法 | 获取数据 |
|------|------|---------|
| **天眼查** | WebSearch `"[公司名]" site:tianyancha.com` | 法人、股东、注册资本、关联公司 |
| **企查查** | WebSearch `"[公司名]" site:qcc.com` | 同上 |
| **1688/阿里巴巴** | WebSearch `"[公司名]" site:1688.com OR alibaba.com` | 工厂信息、产品、联系方式 |

#### 2.3 英国/欧洲公司

| 来源 | 方法 | 获取数据 |
|------|------|---------|
| **Companies House** | WebFetch `find-and-update.company-information.service.gov.uk` | 注册信息、董事、年报 |
| **OpenCorporates** | WebSearch | 覆盖145个国家 |

#### 采集清单

- [ ] **公司注册验证** — Business Name是否在对应州/国注册
- [ ] **注册日期** — 与Amazon经营时长是否匹配
- [ ] **注册人/法人** — 记录姓名（后续用于人物搜索）
- [ ] **关联公司** — 是否有其他实体（贸易公司/工厂/品牌公司分离）
- [ ] **经营状态** — Active / Dissolved / Suspended
  - 🔴 红旗：Dissolved/Suspended + 仍在Amazon卖货

---

### Step 3: 品牌→域名→联系方式

> 通过品牌名找到官网域名，再通过域名找到联系方式。

#### 3.1 品牌域名发现

```
搜索策略（按优先级）：

1. Google 直搜品牌名
   WebSearch: "[品牌名]" official website
   → 通常第一个非Amazon结果就是官网

2. Amazon listing 中的品牌链接
   有些listing有 "Visit the [品牌] Store" 链接
   品牌详情页可能有官网链接

3. 品牌名+常见后缀猜测
   [品牌名].com / [品牌名].co / [品牌名].shop
   WebFetch 验证是否存在

4. USPTO 商标搜索
   WebSearch: "[品牌名]" site:tsdr.uspto.gov OR site:tmsearch.uspto.gov
   商标注册人信息中通常包含公司名和地址
```

#### 3.2 域名 WHOIS

- [ ] **WHOIS查询** — WebFetch `https://who.is/whois/[域名]`
  - 注册人姓名/组织
  - 注册人邮箱（可能被隐私保护）
  - 注册日期
  - 注册商
  - 🔴 红旗：域名注册 < 6个月 + 大量SKU

#### 3.3 官网联系信息提取

- [ ] **联系页面** — WebFetch `[域名]/contact` 或 `/contact-us`
  - 电话号码
  - 邮箱地址
  - 联系表单
  - 实际办公地址（可能与Amazon注册地址不同）
- [ ] **关于页面** — WebFetch `[域名]/about` 或 `/about-us`
  - 创始人/团队信息
  - 公司故事/背景
- [ ] **页脚信息** — 官网底部通常有地址/电话/邮箱
- [ ] **隐私政策/条款** — 通常包含法律实体名和地址

#### 3.4 商标搜索（USPTO）

- [ ] **USPTO 搜索** — WebSearch `"[品牌名]" USPTO trademark`
  - 商标持有人（Owner）
  - 注册日期
  - 商标类别
  - 律师/代理人信息
  - 持有人地址

---

### Step 4: 决策人情报（复用现有 MCP）

> 使用 Hunter.io + Apollo.io 获取精确联系人。

#### 4.1 Hunter.io 域名搜索

```
hunter_domain_search([域名])
→ 全部可用邮箱 + 职位 + LinkedIn
→ 邮箱格式 pattern（如 {first}.{last}@域名）

hunter_domain_search([域名], department="executive")
→ 管理层邮箱

hunter_domain_search([域名], department="sales")
→ 销售/采购决策人
```

- [ ] **全部邮箱** — 记录所有找到的邮箱+职位
- [ ] **邮箱格式** — 记录pattern，用于推算其他人邮箱
- [ ] **关键人物** — 筛选 CEO/Owner/Founder/Purchasing/Operations

#### 4.2 Apollo.io 人物画像

```
apollo_person_enrich([姓名], [公司名])
→ 履历 + 所在地 + 验证邮箱 + LinkedIn
```

- [ ] **创始人/法人画像** — 从Step 2获取的法人姓名
- [ ] **LinkedIn 验证** — 确认此人确实在该公司

#### 4.3 LinkedIn 搜索

- [ ] **公司页面** — WebSearch `"[公司名]" site:linkedin.com/company`
  - 员工数
  - 行业
  - 总部位置
- [ ] **关键人物** — WebSearch `"[品牌名]" OR "[公司名]" site:linkedin.com/in`

#### 4.4 Maigret 用户名搜索（可选）

```
如果找到创始人/关键人物的用户名：
maigret search [用户名]
→ 400+平台搜索
→ 可能发现社媒、论坛、其他业务
```

---

### Step 5: 供应链 & 规模评估

> 判断这个卖家的真实规模和合作价值。

#### 5.1 ImportYeti 供应链

- [ ] **进口记录** — WebSearch `"[Business Name]" site:importyeti.com`
  - 进口商（美国实体）
  - 出口商（中国/海外工厂）
  - 品类 / HS编码
  - 进口频次
- [ ] **供应商反查** — 用工厂名反查还给谁供货

#### 5.2 Amazon 销量实数据（卖家精灵 MCP — 必做）

> 以下工具替代 BSR 粗估，直接获取销量和流量实数据。

**5.2a 卖家产品线全景扫描**
```
competitor_lookup(sellerName="[卖家店铺名]", market="US")
→ 该卖家全部产品列表、各产品BSR、价格、评价数
→ 一次调用替代逐个ASIN手动查看
```

**5.2b 主力产品销量精算**
```
对 competitor_lookup 返回的 Top 5 ASIN 逐个查询：

asin_prediction(asin="B0XXXXXX", market="US")
→ 月销量、月营收、BSR趋势、价格历史
→ 直接替代"BSR < 5000 ≈ 日销2-20件"的粗估

keepa_info(asin="B0XXXXXX", market="US")
→ 历史价格+BSR长期趋势 → 判断产品生命周期阶段
```

**5.2c 流量结构分析（判断获客能力）**
```
traffic_listing_stat(asin="B0XXXXXX", market="US")
→ 该ASIN的总流量词数、自然词数、广告词数
→ 广告词占比高=烧钱获客，自然词多=品牌护城河

keyword_order(keyword="[品类主词]", market="US")
→ 该关键词下的自然排名前列产品
→ 判断卖家在核心词上的竞争力
```

**5.2d 促销与优惠券历史**
```
asin_coupon_trend(asin="B0XXXXXX", market="US")
→ 历史优惠券/促销频率
→ 持续大额优惠券=利润承压/清库存信号
```

- [ ] **产品线全景** — competitor_lookup 获取全部SKU
- [ ] **主力ASIN销量** — asin_prediction × Top 5
- [ ] **流量结构** — traffic_listing_stat 判断获客模式
- [ ] **月/年营收** — 各ASIN月营收加总 × 12

**实数据 vs 旧估算对比**：
| 旧方法 | 卖家精灵替代 |
|--------|------------|
| BSR粗估日销量 | `asin_prediction` 精确月销量 |
| 评价数×15-30倍 | `asin_prediction` 直接月营收 |
| 手动逐ASIN查看 | `competitor_lookup` 一次全拿 |
| 猜测广告投入 | `traffic_listing_stat` 广告词占比 |

#### 5.3 规模档位判断

| 档位 | 估算年营收 | 判断信号 | 合作建议 |
|------|-----------|---------|---------|
| **S0** | <$50万 | SKU<10, 评价<100, 无官网 | 风险高，小单试合作 |
| **S1** | $50万-$500万 | SKU 10-50, 有基础官网 | 常规合作，注重ROI |
| **S2** | $500万-$2000万 | SKU 50+, Shopify官网, 有品牌 | 重点客户 |
| **S3** | $2000万-$1亿 | 多渠道, 线下分销, 品牌知名 | 战略客户，长期框架 |
| **S4+** | >$1亿 | 全渠道, 上百SKU, 全球运营 | 参考osint-company.md完整调查 |

---

## 国家特殊处理

### 美国卖家

```
Amazon Seller Info → Business Name → 州务卿 → 域名 → Hunter.io
• 大多数是LLC或Corp
• Delaware/Wyoming注册很常见（隐私保护）
• 实际运营地可能与注册地不同
• 查看BBB核实信用
```

### 中国卖家

```
Amazon Seller Info → 中文公司名 → 天眼查 → 1688 → 工厂联系方式
• Business Name可能是中文或英文名
• 深圳/广州/义乌是跨境电商聚集地
• 1688上搜同款可能直接找到工厂
• 品牌域名WHOIS通常没有隐私保护 → 可获取注册人邮箱
• WeChat搜索公司名可能找到公众号/联系方式
```

### 英国/欧洲卖家

```
Amazon Seller Info → Business Name → Companies House → 域名 → Hunter.io
• Companies House数据完全公开（董事姓名、地址、年报）
• VAT号码可用于交叉验证
```

### 印度/东南亚卖家

```
Amazon Seller Info → Business Name → OpenCorporates → 域名 → 社媒
• 印度: MCA (Ministry of Corporate Affairs) 数据公开
• 注意: 很多小卖家可能没有官网
• LinkedIn是找印度卖家联系人最有效的平台
```

---

## 红旗清单

### 高风险信号

🔴 立即标注：
- Business Name与Brand Name完全无关（可能是代运营/第三方卖家，非品牌方）
- 注册地址是虚拟办公室/公寓（如"Apt"/"Suite"在住宅区）
- 域名注册 < 6个月但SKU > 50（铺货型卖家）
- 无任何第三方信息（Google搜索零结果）
- 多个不相关品牌从同一Business Name出售（贸易公司/铺货模式）
- 公司注册状态 Dissolved/Suspended

### 需注意信号

🟡 补充核实：
- Business Name是个人名而非公司名
- 注册在Delaware/Wyoming（隐私州，信息少）
- 卖家店铺评分 < 90%
- Amazon经营时间 < 1年
- 无官网或官网极简陋

### 正面信号

🟢 合作信心高：
- Business Name = Brand Owner（品牌方自营）
- 有完整官网 + Shopify/独立站
- USPTO有注册商标
- Hunter.io找到多个企业邮箱（有团队）
- ImportYeti有进口记录（真实进口商）
- BBB有评级（正规经营）

---

## 输出模板

```markdown
# Amazon 卖家背景调查报告

> **调查日期**: YYYY-MM-DD | **类型**: Amazon卖家背调 | **风险评级**: 🟢/🟡/🔴

## 1. 卖家基础信息

| 字段 | 内容 | 来源 |
|------|------|------|
| Amazon店铺名 | | Amazon |
| Business Name | | Amazon Seller Info |
| 注册地址 | | Amazon Seller Info |
| 国家 | | Amazon Seller Info |
| 品牌名 | | Amazon Listing |
| ASIN(主力) | | Amazon |
| 经营时长 | | Amazon |
| 店铺评分 | | Amazon |
| SKU数量 | | Amazon Store |

## 2. 公司注册核实

| 字段 | 内容 | 来源 | 评级 |
|------|------|------|------|
| 注册州/国 | | OpenCorporates/州务卿 | |
| 注册日期 | | | |
| 注册人/法人 | | | |
| 经营状态 | | | |
| 关联公司 | | | |

## 3. 品牌 & 域名情报

| 字段 | 内容 | 来源 |
|------|------|------|
| 品牌域名 | | Google/Amazon |
| 域名注册时间 | | WHOIS |
| 域名注册人 | | WHOIS |
| 官网联系邮箱 | | 官网 |
| 官网联系电话 | | 官网 |
| USPTO商标 | | USPTO |
| 商标持有人 | | USPTO |

## 4. 决策人情报

> 邮箱格式: `{pattern}@[域名]`

| 姓名 | 职位 | 邮箱 | LinkedIn | 来源 | 置信度 |
|------|------|------|----------|------|--------|

### 推荐接触人
| 优先级 | 联系人 | 职位 | 联系方式 | 话术方向 |
|--------|--------|------|----------|----------|

## 5. 供应链 & 规模评估

| 指标 | 数值 | 方法 |
|------|------|------|
| 主力产品BSR | | Amazon |
| 估算月销量 | | BSR/评价推算 |
| 估算年营收 | | 月销×SKU×12 |
| 规模档位 | S0-S4 | 综合判断 |
| 供应商 | | ImportYeti |

## 6. 风险评估

| 信号 | 内容 | 评级 |
|------|------|------|
| 🟢/🟡/🔴 | [具体发现] | |

**总体风险**: 🟢/🟡/🔴
**合作建议**: [1-2句话]

## 7. 接触策略

### 推荐路径
1. [最佳联系方式和话术]
2. [备选方案]
3. [注意事项]

## 附录：数据来源
| 来源 | URL | 采集时间 |
|------|-----|---------|
```

---

## 批量调查模式（v3.0 预留）

```python
# 未来自动化: 输入一组ASIN，批量输出卖家画像
asins = ["B0DRRYM7GL", "B013TINE4S", "B0CYZZZ3LY"]

for asin in asins:
    seller_info = scrape_amazon_seller(asin)  # Playwright/Scraper
    company = lookup_company(seller_info.business_name)  # OpenCorporates
    domain = find_brand_domain(seller_info.brand_name)  # Google
    contacts = hunter_search(domain)  # Hunter.io
    supply_chain = importyeti_search(seller_info.business_name)  # ImportYeti

    report = generate_report(seller_info, company, domain, contacts, supply_chain)
    save_report(f"reports/osint/{date}_{seller_info.brand}_amazon-seller.md")
```

---

*本技能使用公开数据，遵守Amazon TOS和相关法律。调查结果仅供商业决策参考。*
