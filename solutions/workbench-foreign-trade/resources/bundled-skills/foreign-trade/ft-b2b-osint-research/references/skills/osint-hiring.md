# Skill: 招聘情报分析（Hiring Intelligence）

> 由 `/osint` 命令在 company/competitor 类型调查中加载
> 核心哲学：大公司花百万验证的方向，你用1人效跟进就行。
> 他们招10个人做的事，你1个人用AI做到同等产出。

## 为什么招聘数据是最强的市场信号

```
招聘 = 用真金白银下注
- 招聘一个人 = $80-150K/年 的成本承诺
- 一家公司不会为不确定的方向大量招人
- 新开的岗位类型 = 他们刚发现的市场机会
- 急招/批量招 = 需求已经超过现有产能

你的信息套利：
- 他们做 $10亿 要 800人 → 人均产值 $125万
- 你做 $1000万 只要 1人 + AI → 人均产值 $1000万
- 你只需要知道「方向」，执行靠效率碾压
```

---

## 数据采集方法

### 方法1：快速搜索法（5分钟，当前可用）

#### Step 1: 多平台岗位数汇总

| 平台 | 搜索方式 | 获取数据 |
|------|---------|---------|
| LinkedIn | WebSearch `"[公司名]" site:linkedin.com/jobs` | 总岗位数、分类 |
| Indeed | WebFetch `indeed.com/cmp/[公司名]/jobs` | 岗位列表、薪资 |
| Glassdoor | WebSearch `"[公司名]" site:glassdoor.com jobs` | 岗位数、面试评分 |
| ZipRecruiter | WebSearch `"[公司名]" site:ziprecruiter.com` | 岗位数 |
| 公司ATS页 | WebSearch `"[公司名]" careers OR jobs site:greenhouse.io OR lever.co OR isolvedhire.com` | 完整列表 |

#### Step 2: 部门分布（ZoomInfo 快速法）

```
WebSearch: "[公司名]" site:zoominfo.com employee department
→ 获取员工部门分布（Sales/Engineering/Marketing/Operations/etc）
```

#### Step 3: 岗位逐条分类

将所有找到的岗位按以下维度分类：

| 维度 | 分类 | 市场信号 |
|------|------|---------|
| **部门** | Sales / Engineering / Marketing / Operations / CS / HR / Finance | 哪个部门在扩张 |
| **层级** | C-level / VP / Director / Manager / IC | 新设高管 = 战略级投入 |
| **地区** | 美国/中国/欧洲/新兴市场 | 哪里是增长重心 |
| **类型** | 全职/兼职/合同 | 合同工多 = 试探性投入 |
| **新旧** | 首次出现的岗位类型 vs 常规补员 | 新岗位 = 新方向 |

### 方法2：JobSpy 自动化（v3.0 Python CLI 集成）

```python
# pip install python-jobspy
from jobspy import scrape_jobs

jobs = scrape_jobs(
    site_name=["indeed", "linkedin", "glassdoor", "google", "zip_recruiter"],
    search_term="",           # 留空搜全部
    company_name="Renogy",    # 精确公司名
    location="",              # 留空搜全球
    results_wanted=100,
    hours_old=720,            # 过去30天
    country_indeed='USA'
)

# 输出分析
print(f"总岗位数: {len(jobs)}")
print(jobs.groupby('company').size())         # 按公司
print(jobs['title'].value_counts().head(20))  # 按岗位标题
print(jobs['location'].value_counts())         # 按地区

# 保存 CSV 供人工分析
jobs.to_csv("renogy_hiring.csv", index=False)
```

**JobSpy 优势**：
- 一次抓取多平台，去重合并
- 输出结构化 DataFrame
- 可定时运行做历史对比
- Indeed 无速率限制，数据最全

### 方法3：历史对比法（高级）

```
当前岗位快照 → 存入 SQLite
每月重新抓取 → 对比增减
→ 自动生成「招聘趋势报告」

信号：
- 本月新增 20 个岗位 vs 上月 5 个 → 📈 急速扩张
- 某类岗位从 0 → 5 → 15 → 战略级押注
- 某类岗位从 10 → 3 → 0 → 收缩/外包信号
```

---

## 分析框架

### 一、岗位战略信号解读矩阵

| 招聘岗位类型 | 数量 | 紧急度 | 对你意味着 | 行动 |
|------------|------|--------|-----------|------|
| **Sourcing Manager / Procurement** | 多个 | 急 | 🔥 正在换供应商 | **立即接触，最佳窗口** |
| **Sales Manager [新区域]** | 新开 | — | 📈 开拓新市场 | 跟进该市场，他们验证了需求 |
| **Quality Engineer / QA** | 多个 | 急 | ⚠️ 产品质量出了问题 | 用"质量保障"做差异化切入 |
| **Customer Service / Support** | 批量 | 急 | 🔥 售后崩了 | 你可以提供更好的客服方案 |
| **Product Manager [新品类]** | 新开 | — | 📈 进入新品类 | 这个品类即将有大玩家入场 |
| **Software / App Engineer** | 多个 | — | 🔄 数字化转型 | SaaS/App 可能是新利润线 |
| **Content / Marketing** | 多个 | — | 📈 品牌投入加大 | 他们开始做品牌了 |
| **Warehouse / Logistics** | 多个 | 急 | 📦 销量暴增 | 供应链需求增大 |
| **HR Recruiter** | 新开 | — | 📈 要大规模招人 | 公司进入快速扩张期 |
| **Finance / Accounting** | 多个 | — | 💰 可能准备上市/融资 | 财务规范化信号 |
| **Data Analyst / BI** | 新开 | — | 🧠 开始数据驱动 | 公司在升级管理模式 |

### 二、部门增长解读

```
部门增长率 = (当前招聘数 / 部门现有员工数) × 100%

解读：
- > 30% → 🔥 战略级扩张（这个方向公司在 all-in）
- 15-30% → 📈 稳步增长（已验证，正在放大）
- 5-15% → 正常补员
- < 5% → 稳定/优化
- 负增长（裁员/停招）→ ⚠️ 收缩信号
```

### 三、人效对比分析

> 核心问题：他们用多少人做到这个规模？你需要几个人？

```
竞品人效基准:
公司营收 / 员工数 = 人均产值
你的目标: 用 AI + 自动化 达到 5-10x 人效

示例:
Renogy: $200M / 800人 = $250K/人
你的目标: $10M / 1人 = $10M/人 (40x 人效)

关键问题:
- 他们800人里，哪些岗位可以被 AI 替代？
- Sales (37人) → 你用 AI 开发信 + CRM 自动化 = 1人
- Marketing (24人) → 你用 AI 内容 + 自动投放 = 1人
- CS (大量招聘) → 你用 AI 客服 + 知识库 = 0.5人
- Engineering (25人) → 你做贸易不需要 = 0人
- Operations (17人) → 你用 3PL + ERP = 1人
→ 你可能只需要 3-5人 做他们 100人的活
```

### 四、市场机会提取

从招聘数据倒推市场机会：

```
Step 1: 他们在招什么新岗位？（首次出现的title）
  → 新岗位 = 新业务方向 = 你的机会信号

Step 2: 他们在哪个区域急招？
  → 新区域 = 他们验证了该市场的需求

Step 3: 哪些岗位数量暴增？
  → 暴增 = 现有产能不足 = 市场需求 > 供给

Step 4: 他们停止招什么了？
  → 停招 = 要么做完了，要么放弃了
  → 如果放弃了 → 抢他放弃的市场
```

---

## 输出模板

```markdown
### 招聘情报分析

#### 岗位概览
| 平台 | 岗位数 | 更新 |
|------|--------|------|
| LinkedIn | XX | X个新增 |
| Indeed | XX | — |
| Glassdoor | XX | — |
| 官方ATS | XX | — |

#### 部门分布 & 增长信号
| 部门 | 现有员工 | 在招岗位 | 增长率 | 信号 |
|------|---------|---------|--------|------|
| Sales | XX | XX | XX% | [解读] |
| Engineering | XX | XX | XX% | [解读] |
| Marketing | XX | XX | XX% | [解读] |
| Operations | XX | XX | XX% | [解读] |
| CS/Support | XX | XX | XX% | [解读] |

#### 战略级信号
| # | 信号类型 | 岗位 | 地区 | 解读 | 你的行动 |
|---|---------|------|------|------|---------|
| 1 | 🔥 新市场 | Sales Manager Africa | 南非 | 进入非洲市场 | 跟进非洲渠道 |
| 2 | ⚠️ 质量问题 | QA Engineer x3 | Ontario | 产品质量承压 | 强调质量保障 |

#### 人效对标
| 公司 | 营收 | 员工 | 人均产值 | 你用AI需要几人 |
|------|------|------|---------|--------------|
| [目标] | $XXM | XXX | $XXXK | X人 |

#### 市场机会（从招聘倒推）
1. [方向1]: 他们在大量招XX，说明XX市场需求旺盛
2. [方向2]: 他们在XX区域开新岗，说明XX市场刚打开
3. [方向3]: 他们的XX岗位急招，说明现有供给不足
```

---

## 监控建议（v3.0 自动化）

```python
# 每月快照对比
# 存入 data/hiring_snapshots/[公司名]_YYYY-MM.csv
# 自动生成月度变化报告

# APScheduler 定时任务
@scheduler.scheduled_job('cron', month='*', day='1')
def monthly_hiring_snapshot():
    companies = ["Renogy", "EcoFlow", "Bluetti", "Jackery"]
    for company in companies:
        jobs = scrape_jobs(company_name=company, ...)
        save_snapshot(company, jobs)
        diff = compare_with_last_month(company)
        if diff.significant:
            send_telegram_alert(diff)
```

---

## 与你的策略结合

> 你的核心逻辑：用他们的方向，你的效率

### 1人公司的信息套利模型

```
┌────────────────────────────────────────┐
│ 大公司信号      →  你的行动             │
├────────────────────────────────────────┤
│ 招Sales Manager-非洲                   │
│   → 他们花$150K/年验证非洲市场           │
│   → 你用$0上架非洲独立站               │
│                                        │
│ 招5个CS客服                            │
│   → 他们售后扛不住了                    │
│   → 你用AI客服+人工兜底提供更好体验       │
│                                        │
│ 招Product Manager-储能                  │
│   → 储能品类要发力了                    │
│   → 你提前布局储能渠道和供应商            │
│                                        │
│ 招Sourcing Manager                     │
│   → 他们在换供应商                      │
│   → 你去联系他们的现有供应商接单          │
└────────────────────────────────────────┘
```

### 关键效率杠杆

| 他们的岗位 | 他们的人数 | 你的替代方案 | 你的人数 |
|-----------|----------|------------|---------|
| Sales | 37 | AI开发信 + CRM自动化 + LinkedIn自动化 | 1 |
| Marketing | 24 | AI内容生成 + 自动投放 + SEO | 0.5 |
| CS/Support | 10+ | AI客服(大模型) + 知识库 + Telegram | 0.5 |
| Operations | 17 | 3PL外包 + ERP(ERPNext) + 自动化 | 1 |
| Product/R&D | 25 | 不需要(你做贸易不做研发) | 0 |
| Finance | 10 | AI记账 + 外包会计 | 0 |
| HR | 7 | 不需要(1人公司) | 0 |
| **合计** | **130+** | | **3** |
| **人效倍数** | $1.5M/人 | | **$3.3M/人 (2.2x)** |
