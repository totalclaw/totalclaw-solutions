# Step 5: 全球化数字推广战略

> 输入：Step 1-4 全部分析结果 + 渠道检测结果
> 目标：输出可执行的多平台推广方案，包含渠道选择、SEO、内容、广告、CRM
> 根据渠道检测结果智能调整：纯B2B / B2B+Amazon / B2B+DTC / 全渠道

---

## 5.1 多平台 B2B 渠道选择

### 渠道评估矩阵

| 平台 | 适用产品 | 年投入 | ROI 周期 | 询盘质量 | 优先级 | 条件 |
|------|---------|--------|---------|---------|-------|------|
| **Alibaba.com** | 所有 B2B | ¥3-10万 | 3-6月 | 中 | P0 必做 | — |
| **Made-in-China** | 工业/机械 | ¥2-5万 | 3-6月 | 中 | P1 推荐 | 产品适配 |
| **GlobalSources** | 电子/消费品 | ¥3-8万 | 6-12月 | 中高 | P2 | 产品适配 |
| **ThomasNet** | 北美工业 | $5-15K | 6-12月 | 高 | P1 | 目标北美 |
| **独立站** | 所有 | $3-10K建站 | 6-18月 | 高 | P0 必做 | — |
| **Amazon** | B2C/小B | 因品而异 | 3-6月 | 中 | 条件性 | HAS_AMAZON=true |
| **Google Ads** | 有独立站后 | $1-5K/月 | 即时 | 高 | P1 | 独立站就绪 |
| **LinkedIn Ads** | 高端/定制 | $500-2K/月 | 3-6月 | 高 | P2 | B2B决策人 |
| **Facebook/Meta** | 部分B2B | $500-1K/月 | 1-3月 | 中低 | P3 | 东南亚/南亚 |

### 按渠道检测结果的推荐组合

**纯B2B（工业设备/机械）**:
```
核心: Alibaba + 独立站 + Google Ads
扩展: Made-in-China + ThomasNet(北美) + LinkedIn
展会: 2-3个/年
```

**B2B + Amazon**:
```
核心: Alibaba + Amazon + 独立站
扩展: Google Ads + Made-in-China
参考: 加载 `ft-b2b-osint-research` 技能的 `references/skills/osint-competitor.md` 的 Amazon 运营层
```

**B2B + DTC**:
```
核心: 独立站(Shopify) + Google Ads + Alibaba
扩展: Facebook Ads + 内容营销 + LinkedIn
参考: 加载 `ft-b2b-osint-research` 技能的 `references/skills/osint-pricing-anatomy.md` 的 DTC 定价层
```

**全渠道**:
```
核心: Alibaba + Amazon + 独立站 + Google Ads
扩展: 全部平台按优先级依次开通
注意: 需要更大团队和预算支撑
```

---

## 5.2 独立站战略

### 建站方案选择

| 方案 | 适用场景 | 成本 | 维护 | SEO 友好度 |
|------|---------|------|------|-----------|
| **WordPress + Elementor** | B2B 工业品（推荐） | $2-5K | 中 | ⭐⭐⭐⭐⭐ |
| **Shopify** | B2B+DTC 混合 | $30-300/月 | 低 | ⭐⭐⭐⭐ |
| **自定义开发** | 大型企业 | $10-50K | 高 | ⭐⭐⭐⭐⭐ |

### 网站结构（B2B工业品标准）

```
首页
├── 产品中心 (Products)
│   ├── 产品类别A
│   │   ├── 产品详情页（含参数/视频/下载）
│   │   └── ...
│   ├── 产品类别B
│   └── ...
├── 解决方案 (Solutions / Applications)
│   ├── 行业应用A
│   └── 行业应用B
├── 案例 (Case Studies)
│   ├── 客户案例1（含照片/视频/数据）
│   └── ...
├── 关于我们 (About Us)
│   ├── 公司介绍 + 工厂视频
│   ├── 认证与荣誉
│   └── 团队
├── 资源 (Resources / Blog)
│   ├── 技术文章
│   ├── 产品对比指南
│   ├── FAQ
│   └── 下载中心（手册/参数表）
├── 联系我们 (Contact)
│   ├── 询盘表单（核心转化点）
│   ├── WhatsApp 快捷按钮
│   └── 全球办事处/代理商地图
└── 多语言切换 (EN/ES/AR/RU/PT)
```

### 核心转化优化

```
关键转化点:
1. 每个产品页底部 → 询盘表单 / WhatsApp 按钮
2. 悬浮 CTA（Get Quote / WhatsApp Chat）
3. 弹窗（停留 30s / 滚动 50% 触发）
4. 案例页 → "我也想要这样的方案" CTA
5. 博客文章底部 → 相关产品推荐 + 询盘

表单字段（B2B最佳实践）:
- 姓名（必填）
- 公司名（必填）
- 邮箱（必填）
- 国家（必填，下拉）
- 产品兴趣（必填，多选）
- 留言（选填）
- WhatsApp号码（选填）
```

---

## 5.3 SEO 策略

### 关键词分层

```
Layer 1 — 核心产品词（高竞争，长期目标）
  例: tube mill machine, pipe making machine
  策略: 产品页 + 权威内容 + 外链建设
  目标: 12-18个月进 Top 10

Layer 2 — 长尾应用词（中竞争，中期目标）
  例: stainless steel tube mill, ERW pipe mill line
  策略: 专题页面 + 技术文章
  目标: 6-12个月进 Top 10

Layer 3 — 买家意图词（低-中竞争，速赢）
  例: tube mill machine price, tube mill manufacturer China
  策略: 博客文章 + FAQ页面 + Google Ads 同时投放
  目标: 3-6个月进 Top 20

Layer 4 — 地域词（低竞争，快速上位）
  例: tube mill supplier for India, pipe making machine Nigeria
  策略: 针对每个目标国家做落地页
  目标: 1-3个月进 Top 10
```

### 内容日历（月度）

| 周 | 内容类型 | 标题模板 | 目标关键词层 | 字数 |
|----|---------|---------|------------|------|
| W1 | 技术文章 | "How to Choose the Right [产品] for [应用]" | Layer 2 | 2000+ |
| W2 | 对比指南 | "[产品A] vs [产品B]: Complete Comparison" | Layer 2 | 2500+ |
| W3 | 案例研究 | "How [客户] Improved [指标] with Our [产品]" | Layer 1+3 | 1500+ |
| W4 | FAQ/指南 | "[产品] Buying Guide: Price, Specs & Tips" | Layer 3 | 2000+ |

### 技术 SEO 清单

```
□ Schema 标记
  - Organization（公司信息）
  - Product（每个产品页）
  - FAQ（问答页面）
  - BreadcrumbList（面包屑导航）

□ 多语言 SEO (hreflang)
  - 英语（默认）
  - 西班牙语（南美市场）
  - 阿拉伯语（中东市场）
  - 俄语（独联体市场）
  - 葡萄牙语（巴西市场）
  优先级根据 Step 4 区域推荐排列

□ 页面性能
  - LCP < 2.5s
  - CLS < 0.1
  - FID < 100ms
  - 图片 WebP 格式 + lazy loading

□ 索引优化
  - XML Sitemap
  - robots.txt
  - 内链结构（产品→案例→博客 交叉链接）
  - 404 页面引导
```

---

## 5.4 付费广告策略

### Google Ads（B2B核心渠道）

```
Campaign 1: 品牌搜索
  关键词: [品牌名] + 产品
  预算: $300-500/月
  目标: 品牌词保护
  预期 CPC: $0.5-1.5

Campaign 2: 产品搜索（高意向）
  关键词: [产品] manufacturer/supplier/price/buy
  预算: $1,500-3,000/月
  目标: 直接询盘
  预期 CPC: $2-8（工业品关键词）
  预期转化率: 2-5%

Campaign 3: 竞品搜索
  关键词: [竞品品牌名] + alternative/vs/compare
  预算: $500-1,000/月
  目标: 竞品流量截取
  预期 CPC: $1-5

Campaign 4: 再营销
  受众: 网站访问者（未转化）
  预算: $300-500/月
  目标: 二次触达
  预期 CPC: $0.3-1.0
```

### LinkedIn Ads（高端B2B）

```
适用: 高客单价设备 / 定制化方案 / 目标欧美决策人

Campaign: 精准触达
  定向: 职位 = Procurement/Engineering/Plant Manager
       行业 = Manufacturing/Automotive/Construction
       国家 = [Step 4 推荐区域]
  格式: Sponsored Content + InMail
  预算: $1,000-2,000/月
  预期: CPL $50-150（B2B工业品正常范围）
```

### 按阶段的广告预算建议

| 阶段 | 月预算 | 渠道分配 | 目标 |
|------|--------|---------|------|
| Phase 0 (0-3月) | $1,000-2,000 | Google 70% + LinkedIn 30% | 测试关键词+获取首批询盘 |
| Phase 1 (3-6月) | $2,000-4,000 | Google 60% + LinkedIn 20% + 再营销 20% | 稳定询盘流 |
| Phase 2 (6-12月) | $4,000-8,000 | Google 50% + LinkedIn 15% + 再营销 15% + 其他 20% | 规模化 |
| Phase 3 (12-24月) | $8,000-15,000 | 多渠道均衡 | 品牌+询盘双增长 |

---

## 5.5 内容营销与社交

### 内容类型优先级（B2B工业品）

| 优先级 | 内容类型 | 平台 | 制作成本 | 转化效果 |
|--------|---------|------|---------|---------|
| P0 | 产品视频（工厂+运行演示） | YouTube + 网站 | 中 | ⭐⭐⭐⭐⭐ |
| P0 | 客户案例（视频+图文） | 网站 + LinkedIn | 中 | ⭐⭐⭐⭐⭐ |
| P1 | 技术博客文章 | 网站 + Google | 低 | ⭐⭐⭐⭐ |
| P1 | LinkedIn 行业洞察 | LinkedIn | 低 | ⭐⭐⭐⭐ |
| P2 | 产品对比表/白皮书 | 网站（下载门控） | 中 | ⭐⭐⭐ |
| P2 | 工厂直播/虚拟参观 | YouTube/Alibaba | 中 | ⭐⭐⭐ |
| P3 | 行业报告/数据分析 | 网站+LinkedIn | 高 | ⭐⭐⭐ |

### 社交平台策略

| 平台 | 适用 | 内容类型 | 发布频率 | 目标 |
|------|------|---------|---------|------|
| **LinkedIn** | B2B 决策人触达 | 行业洞察/案例/产品 | 3-5次/周 | 品牌+询盘 |
| **YouTube** | 产品展示+SEO | 产品视频/教程/案例 | 2-4次/月 | SEO+信任 |
| **WhatsApp Business** | 客户沟通 | 1对1跟进+群组 | 实时 | 转化+维护 |
| **Facebook** | 东南亚/南亚市场 | 产品图/视频/活动 | 3-5次/周 | 品牌+询盘 |
| **Instagram** | 品牌视觉 | 工厂/产品/团队图 | 2-3次/周 | 品牌建设 |

---

## 5.6 客户开发与 CRM 体系

### 询盘响应流程

```
询盘进入（Alibaba/独立站/Google Ads/展会）
    ↓
自动分级（30秒内）
    ├── A级（大客户/急需/高意向）→ 2小时内响应 → 电话/视频跟进
    ├── B级（中等/在比较）→ 24小时内响应 → 邮件+WhatsApp
    └── C级（初步了解/学生/同行）→ 48小时内响应 → 模板回复
    ↓
报价 → 样品 → 技术确认 → 验厂（视频/实地）→ 签单
```

### CRM 工具推荐

| 工具 | 费用 | 适用阶段 | 核心功能 |
|------|------|---------|---------|
| **HubSpot Free** | $0 | Phase 0-1 | 联系人管理+邮件跟踪+基础分析 |
| **Zoho CRM** | $14/人/月 | Phase 1-2 | 完整CRM+自动化+多渠道 |
| **Salesforce** | $25/人/月起 | Phase 3+ | 企业级+深度定制+AI |

### 客户生命周期管理

```
                  新询盘
                    ↓
         ┌── 首次响应 (< 24h) ──┐
         │                      │
    有效询盘                  无效过滤
         │
    报价跟进 ←── 7-Touch Cadence
         │
    样品/技术确认
         │
    签单成交
         │
    ┌────┴────┐
  首单交付    持续跟进
    │          (未成交)
  客户满意度调查
    │
  复购/转介绍 ← 季度维护

7-Touch Cadence（参考 `ft-b2b-osint-research` 技能的 `references/skills/osint-sales-playbook.md`）:
Day 1: 邮件（专业报价+公司介绍）
Day 3: WhatsApp（跟进+产品视频）
Day 7: 邮件（案例分享+差异化亮点）
Day 14: LinkedIn（加连接+行业洞察分享）
Day 21: 邮件（限时优惠/样品邀请）
Day 30: WhatsApp（最终跟进）
Day 45: 邮件（长期培育：行业报告/新品通知）
```

---

## 5.7 展会策略

### 核心展会选择框架

```
选择标准:
1. 与产品类型直接相关
2. 目标区域的买家集中
3. 投入产出比合理（展位+差旅 < 预期签单额的 10%）

搜索方法:
web_search: "[产品关键词]" trade show exhibition 2026 2027
web_search: "[行业]" fair expo [目标国家/区域]
```

### 展会类型优先级

| 类型 | 例子 | 投入 | ROI | 优先级 |
|------|------|------|-----|-------|
| **Canton Fair（广交会）** | 广州，每年2期 | ¥5-15万/期 | 高 | P0 |
| **行业垂直展** | 各行业专业展 | ¥10-30万/次 | 高 | P1 |
| **目标国本地展** | 各国本地工业展 | ¥15-40万/次 | 中高 | P2 |
| **线上展会** | Alibaba线上展/行业虚拟展 | ¥1-3万 | 中 | P1 |

---

## 5.8 预算总览

### 年度数字营销预算规划

| 项目 | Phase 0-1 (年) | Phase 2 (年) | Phase 3 (年) |
|------|---------------|-------------|-------------|
| Alibaba 会员+P4P | ¥5-10万 | ¥8-15万 | ¥10-20万 |
| 独立站（建站+维护） | ¥3-5万 | ¥2-3万 | ¥2-3万 |
| Google Ads | ¥8-15万 | ¥20-40万 | ¥40-80万 |
| LinkedIn Ads | ¥3-5万 | ¥5-10万 | ¥10-15万 |
| 内容制作 | ¥2-3万 | ¥3-5万 | ¥5-10万 |
| SEO 优化 | ¥2-3万 | ¥3-5万 | ¥5-8万 |
| 展会 | ¥5-15万 | ¥15-30万 | ¥20-50万 |
| CRM 工具 | ¥0-1万 | ¥1-3万 | ¥3-5万 |
| **合计** | **¥28-57万** | **¥57-111万** | **¥95-191万** |
| **占目标营收比** | 28-57% | 11-22% | 10-19% |

> Phase 0-1 的营销占比高是正常的（投入期）。
> Phase 3 目标是控制在营收的 10-15%。

---

## 5.9 条件性加载

### 如 HAS_AMAZON = true

补充 Amazon 运营策略：
```
□ Amazon 选品策略（基于 Step 2 的 Amazon 竞品分析）
□ Listing 优化（参考 `ft-b2b-osint-research` 技能的 `references/skills/osint-competitor.md` 的 LQS 评分标准）
□ PPC 广告策略
□ FBA vs FBM 选择
□ 品牌注册（Brand Registry）
□ 预算: 另算，参考 `ft-b2b-osint-research` 技能的 `references/skills/osint-pricing-anatomy.md` 的渠道利润分析
```

### 如 HAS_DTC = true

补充独立站 DTC 策略：
```
□ Shopify vs WordPress 选择
□ DTC 定价策略（参考 `ft-b2b-osint-research` 技能的 `references/skills/osint-pricing-anatomy.md` 倍率模型）
□ Facebook/Google Shopping 广告
□ 邮件营销自动化（Klaviyo/Mailchimp）
□ 转化率优化（CRO）
□ 参考 `ft-b2b-osint-research` 技能的 `references/skills/osint-dtc-china.md` 的品牌进化阶段模型
```

---

*Step 5 完成后 → 执行 SKILL.md 中的脉弱交叉分析 → 生成最终报告。*
