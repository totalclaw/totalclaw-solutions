# Skill: 卖家快速身份识别（Seller Quick ID）

> 由 `/osint [品牌名/ASIN] quick-id` 命令触发
> 核心哲学：商标是法律强制公开的，专利是发明人的名片，域名是品牌的门牌号——三条线交叉就能还原任何卖家的真实身份。
> 与 `osint-amazon-seller.md` 的区别：quick-id 是轻量快速版（2分钟，零手工），amazon-seller 是完整深度版（含 Playwright 抓取 + 供应链 + 规模评估）。

## 触发场景

### 主动触发
- 用户说"查下这个卖家背景" / "这个品牌什么来头" / "谁在卖这个"
- 用户给出品牌名或 ASIN 要求调查

### 直接触发
- `/osint [品牌名] quick-id`
- `/osint [ASIN] quick-id`

---

## 输入处理

| 输入类型 | 处理方式 |
|---------|---------|
| **品牌名** | 直接进入 Step 1 |
| **ASIN** | 先调 `asin_detail(asin, marketplace="US")` 提取品牌名 → 再进入 Step 1 |
| **卖家店铺名** | WebSearch "{店铺名} amazon brand" → 提取品牌名 → 进入 Step 1 |

---

## 执行流程（六步法）

> Step 1-5 尽可能**并行执行**，Step 6 按需。
> 总耗时目标：< 2 分钟。

### Step 1: 商标检索（USPTO — 法律强制公开）

**最可靠的一环。** 商标注册信息没有隐私保护，地址和姓名是法律要求公开的。

```
WebSearch: "{品牌名} trademark registration owner address"
```

从 Trademarkia / Justia 搜索结果中提取：
- [ ] **商标持有人**（Owner）— 个人名或公司名
- [ ] **持有人地址** — 精确到街道（最有价值的数据点）
- [ ] **注册号 / 序列号** — Registration Number / Serial Number
- [ ] **注册日期** — 判断品牌历史
- [ ] **商品类别** — Goods & Services 描述
- [ ] **商标状态** — Live / Dead / Cancelled
- [ ] **律师/代理人** — 有时暴露更多公司信息

**中国商标补充**（如果品牌有中国注册）：
```
WebSearch: "{品牌名} 商标注册 site:tianyancha.com OR site:qcc.com"
→ 中国商标注册人 vs 美国注册人是否一致
```

**红旗检测**：
- 🔴 商标状态 Dead/Cancelled — 品牌可能已放弃
- 🔴 商标持有人 ≠ Amazon 卖家 Business Name — 代运营/未授权
- 🟡 商标注册 < 1 年 — 新品牌，需谨慎
- 🟢 商标持有人 = 个人发明家 + 同一地址 — 创始人自营（MagVent 模式）

### Step 2: 专利检索（Google Patents）

**有专利 = 技术壁垒信号，发明人姓名 = 创始人确认。**

```
WebSearch: "{品牌名} patent inventor site:patents.google.com"
WebSearch: "{品牌名} patent US"
```

如果找到专利：
- [ ] **发明人姓名** — 与商标持有人交叉验证
- [ ] **专利号** — US + 国际
- [ ] **申请日 / 授权日** — 技术开发时间线
- [ ] **到期日** — 壁垒还能撑多久
- [ ] **权利要求摘要** — 保护范围有多宽
- [ ] **受让人（Assignee）** — 个人持有 vs 公司持有

**判断逻辑**：
| 专利情况 | 含义 |
|---------|------|
| 3+ 专利，同一发明人 | 技术型创始人，强壁垒 |
| 1 专利，即将到期 | 窗口期，可能被攻破 |
| 专利受让给公司 | 正规运营，有团队 |
| 无专利 | 无技术壁垒，可能是贸易型 |

### Step 3: 域名发现 + WHOIS + 建站历史

```
# 3a: 找域名
WebSearch: "{品牌名} official website"

# 3b: WHOIS 查注册人
Bash: whois {域名}
→ 提取 Registrant Name / Organization / Email
→ 隐私保护？跳过，商标那步已有人了

# 3c: 建站年份验证
WebFetch: https://archive.org/wayback/available?url={域名}
→ earliest capture date → 品牌实际运营起始时间
```

提取：
- [ ] **品牌域名** — 主域名
- [ ] **域名注册人** — 与商标持有人交叉验证（有就记录，隐私保护就标注"已保护"）
- [ ] **域名注册日** — 与商标日期交叉
- [ ] **建站时间** — Wayback Machine 最早快照日期
- [ ] **域名注册商** — GoDaddy / Namecheap 等

**交叉验证**：
- 商标注册人 = 域名注册人 = 同一人 → 🟢 高置信度
- 域名隐私保护但商标地址明确 → 🟢 仍可确认（商标是权威源）
- 域名注册早于商标 → 品牌先做网站后注册商标（正常）
- 域名注册晚于商标 3+ 年 → 🟡 可能换过域名或新建站

### Step 4: LinkedIn 公司画像

```
WebSearch: "{品牌名}" site:linkedin.com/company
WebSearch: "{商标持有人姓名}" "{品牌名}" site:linkedin.com/in
```

提取：
- [ ] **公司规模** — 员工数（2-10 / 11-50 / 51-200…）
- [ ] **行业** — Industry 分类
- [ ] **总部地址** — 与商标地址交叉验证
- [ ] **成立年份** — Founded
- [ ] **关键人物** — 创始人 / CEO / 运营负责人
- [ ] **人物 LinkedIn URL** — 后续深度调查用

### Step 5: Hunter.io 邮箱挖掘

> 前提：Step 3 已找到域名。无域名则跳过此步。

```
hunter_domain_search(domain="{品牌域名}")
→ 企业邮箱列表 + 职位 + LinkedIn URL
→ 邮箱格式 pattern（如 {first}@domain.com）
```

提取：
- [ ] **全部邮箱** — 记录所有找到的邮箱 + 职位
- [ ] **邮箱格式** — pattern，用于推算其他人邮箱
- [ ] **关键人物** — CEO / Owner / Founder
- [ ] **LinkedIn 交叉** — 与 Step 4 发现的人物匹配

**无邮箱时的降级方案**：
1. 用商标地址 + 姓名 → WebSearch 找其他联系方式
2. 官网 /contact 页面 → WebFetch 提取联系表单/邮箱
3. LinkedIn InMail 作为兜底渠道

### Step 6: 补充验证（按需执行）

> 以下平台不是每次都查，根据 Step 1-5 的发现按需补充。

#### 6a: ImportYeti — 供应链（仅进口商有数据）

```
WebSearch: "{Business Name}" site:importyeti.com
→ 进口频次 / 工厂名 / HS code / 进口路线
```
- 有数据 = 真实进口商，可判断供应链
- 无数据 = 国内制造商或中国直发（正常）

#### 6b: OpenCorporates — 公司注册验证

```
WebSearch: "{Business Name}" site:opencorporates.com
→ 注册州 / 注册号 / 状态 / 注册日期
```
- 覆盖 145 国，但美国小 LLC 覆盖率不稳定
- 找不到不代表公司不存在

#### 6c: BBB — 信用评级（消费品牌）

```
WebSearch: "{Business Name}" site:bbb.org
→ BBB评级 / 投诉数 / 解决率 / 经营年限
```
- 有 BBB = 正规消费品牌
- 无 BBB = 小公司/工业品/新品牌（正常）

#### 6d: 州务卿 — 美国公司注册（权威源）

```
WebSearch: "{Business Name}" secretary of state {州名}
→ 注册日期 / 注册人 / 经营状态 / 注册代理人
```
- 商标地址的州去查
- Active = 正常 / Dissolved = 🔴 已注销

#### 6e: 中国卖家专项

```
WebSearch: "{中文公司名}" site:tianyancha.com  → 法人/股东/注册资本
WebSearch: "{中文公司名}" site:qcc.com         → 同上
WebSearch: "{中文公司名}" site:1688.com        → 工厂信息/联系方式
WebSearch: "{品牌名}" site:alibaba.com         → B2B外贸联系
```

---

## 输出模板

```markdown
## 🔍 卖家身份卡 — {品牌名}

### 商标 & 知识产权

| 项目 | 信息 | 来源 |
|------|------|------|
| 商标持有人 | | Trademarkia/Justia |
| 注册地址 | | USPTO |
| 注册号 | | USPTO |
| 注册日期 | | USPTO |
| 商标状态 | Live ✅ / Dead 🔴 | USPTO |
| 专利数量 | X 项（到期日 YYYY） | Google Patents |
| 发明人 | | Google Patents |

### 品牌 & 线上存在

| 项目 | 信息 |
|------|------|
| 官网 | {域名} |
| 建站时间 | {Wayback年份} |
| 域名注册人 | {姓名} / 隐私保护 |
| LinkedIn | {员工数}, {行业} |
| 成立年份 | {年份} |

### 联系方式

| 姓名 | 职位 | 邮箱 | LinkedIn |
|------|------|------|----------|
| | | | |

### 快速判断

- 🟢/🟡/🔴 **身份一致性**: 商标人 vs 域名注册人 vs LinkedIn 创始人
- 🟢/🟡/🔴 **壁垒等级**: 有专利/有商标/无保护
- 🟢/🟡/🔴 **规模评估**: S0-S4 档位
- 🟢/🟡/🔴 **品牌真实性**: 自营/代运营/铺货

**一句话结论**: {品牌名} 是 [描述]，由 [人名] 在 [地点] 运营，[壁垒/风险判断]。
```

---

## 信息交叉验证矩阵

> 同一信息从多个来源出现 = 高置信度。

| 数据点 | 商标 | 专利 | WHOIS | LinkedIn | Hunter |
|--------|------|------|-------|----------|--------|
| **创始人姓名** | 持有人 | 发明人 | 注册人 | 创始人 | 邮箱前缀 |
| **公司名** | Owner | Assignee | Organization | Company | Domain |
| **地址** | 持有人地址 | — | 注册人地址 | HQ | — |
| **成立时间** | 注册日 | 申请日 | 域名注册日 | Founded | — |

- 3+ 来源一致 → 🟢 **确认**
- 2 来源一致 → 🟡 **高可能**
- 仅 1 来源 → ⚠️ **待验证**
- 来源矛盾 → 🔴 **红旗，需深挖**

---

## 配额消耗

| 工具 | 调用次数 | 成本 |
|------|---------|------|
| WebSearch | 5-8 次 | 免费 |
| WebFetch | 1-2 次 | 免费 |
| Bash (whois) | 1 次 | 免费 |
| Hunter.io | 1 次 | 免费（50次/月额度） |
| 卖家精灵 asin_detail | 0-1 次 | ASIN输入时才用 |
| **总计** | **8-12 次** | **接近零成本** |

---

## 与其他 Skill 的联动

| 当前 Skill | 触发 quick-id 的场景 | 传递数据 |
|-----------|---------------------|---------|
| `/blueocean` | 发现头部品牌时 | 品牌名 → quick-id → 壁垒判断纳入评分 |
| `/decision` | 维度2竞争环境分析时 | 品牌名 → quick-id → 专利到期日影响决策 |
| `/deepdive` | Phase 3 头部竞品拆解时 | Top 3 品牌 → 批量 quick-id |
| `/unique` | 发现独家产品时 | 品牌名 → quick-id → 验证是否真独家 |
| `/monitor` | 竞品出现异常变化时 | 品牌名 → quick-id → 查背景 |

---

## 使用示例

```
# 直接调用
/osint MagVent quick-id
/osint B0DRRYM7GL quick-id

# 在分析中触发
用户: 帮我分析 magnetic dryer vent 这个品类
Agent: [执行 /blueocean 分析中...]
Agent: 发现头部品牌 MagVent 占据 32% 市场份额，要不要查下这个卖家的背景？
用户: 查
Agent: [执行 quick-id → 输出身份卡]
```

---

*本技能使用公开数据（USPTO、Google Patents、LinkedIn、WHOIS），遵守相关法律。调查结果仅供商业决策参考。*
