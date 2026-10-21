# Skill: 社媒舆情检索（Social Pulse）

> 由 `/osint` 命令自动加载（类型：`social-pulse`）
> 也可被其他 skill 模块调用：在竞品/公司调查中追加用户真实声音
> 核心哲学：官网说的是他们想让你知道的，Reddit 说的才是真实的。

## 与其他 Skill 的区别

| 场景 | 用哪个 Skill |
|------|-------------|
| 调查某家公司全貌 | `osint-company.md` |
| 竞品分析 | `osint-competitor.md` |
| **某话题/品牌在社媒上怎么讨论的** | **本 skill** |

本 skill 适用于：
- "用户真实怎么评价 XX 产品/品牌？"
- "Reddit 上 XX 行业的主流抱怨是什么？"
- "YouTube 上 XX 话题的内容格局是怎样的？"
- 竞品调查的补充模块（用户声音维度）

---

## 工具优先级

| 平台 | 首选方式 | 备选 |
|------|---------|------|
| Reddit | `WebFetch` → `reddit.com/r/{sub}/search.json?q={关键词}&sort=top` | Firecrawl 抓帖子详情 |
| YouTube | `WebSearch` → 搜索结果页 + `WebFetch` 视频页评论 | Firecrawl |
| Twitter/X | **不在本 skill 范围内**，用 Grok 单独查 | — |

> Reddit `.json` 接口免费、无需登录、结构化数据，优先使用。
> Firecrawl 按 credits 计费，每次调查控制在 ≤10 credits。

---

## 执行流程（三步）

### Step 1：确认检索参数

```
目标关键词：[品牌名 / 产品类别 / 话题]
检索平台：Reddit ✓  YouTube ✓  Twitter/X ✗（用 Grok）
时间范围：[近 6 个月 / 近 1 年 / 不限]
检索目的：[了解用户抱怨 / 产品评价 / 行业讨论 / 竞品比较]
```

---

### Step 2：并行采集

**Reddit 采集（必做）**

```
# 全站搜索（按热度排序）
WebFetch: https://www.reddit.com/search.json?q={关键词}&sort=top&t=year&limit=25

# 相关 subreddit 定点搜索（根据话题选 2-3 个）
WebFetch: https://www.reddit.com/r/{subreddit}/search.json?q={关键词}&sort=top&restrict_sr=1&limit=25

# 常用 subreddit 速查（B2B/跨境/消费品方向）
- r/Entrepreneur / r/smallbusiness — 商业决策者视角
- r/ecommerce / r/FulfillmentByAmazon — 电商/亚马逊
- r/AskEngineers / r/DIY — 工具/五金/工业品
- r/homeautomation / r/smarthome — 智能家居
- r/BuyItForLife — 耐用品真实口碑
- r/churning / r/frugal — 价格敏感用户
- r/supplychain / r/logistics — B2B 供应链圈子
```

从返回的 JSON 中提取：
- 帖子标题、评论数、点赞率、发布时间
- 高赞评论的核心观点（取前 5 条）
- 帖子 URL（供后续深读）

**YouTube 采集（选做，有具体需求时）**

```
WebSearch: site:youtube.com "{关键词}" review OR comparison OR problems
```

提取：标题、频道名、大概发布时间、描述片段中的关键词
如需深读评论：WebFetch 视频页面，提取 comments section（Firecrawl 效果更好但耗 credits）

---

### Step 3：分析与输出

**分析维度**

```
1. 声量分布
   - Reddit：相关帖子数量、最活跃的 subreddit
   - YouTube：视频数量、主流内容类型（测评/教程/投诉）

2. 情绪分布
   - 正面：用户在夸什么？（具体功能/场景）
   - 负面：用户在骂什么？（反复出现的抱怨 = 结构性问题）
   - 中性：用户在问什么？（未被满足的需求）

3. 高价值原话（直接引用）
   - 选 3-5 条最有代表性的评论
   - 格式：「原话」— 来源/点赞数

4. 竞品对比信号（如有）
   - 用户主动比较的替代方案是什么？
   - 他们为什么选/不选目标品牌？

5. 脉弱信号
   - 有没有某类抱怨在过去 3 个月突然增多？（新出现的结构性问题）
   - 有没有某个竞品被反复提及为更好的替代？
```

**输出格式**

```markdown
## 社媒舆情：[目标关键词]
数据截止：[日期]  |  平台：Reddit [X条帖子] · YouTube [Y个视频]

### 用户声音摘要
**正面**：[2-3句话总结用户在夸什么]
**负面**：[2-3句话总结用户在抱怨什么]
**未满足需求**：[用户在问但没人回答的问题]

### 代表性原话
- 「[原话]」— r/[subreddit]，[赞数] upvotes
- 「[原话]」— YouTube 评论
- ...

### 竞品对比信号
[用户提到的替代品 + 原因]

### 脉弱信号
🔴 [如有结构性问题信号]
🟡 [如有值得关注的趋势]
```

---

## 被其他 Skill 调用的方式

在 `osint-company.md` 或 `osint-competitor.md` 执行到"用户声誉"维度时，可调用本 skill：

```
→ 触发条件：用户要求"了解真实口碑"或调查类型包含 B2C 产品/品牌
→ 输入：品牌名 + 产品类别
→ 输出：插入报告"用户声音"章节
→ Credits 预算：≤10（Reddit 为主，YouTube 按需）
```

---

## 数据局限说明（每次必须在报告中注明）

- Reddit 数据偏向英语母语用户，代表北美/英国视角，不代表全球
- YouTube 评论需人工抽样，自动化抓取受限
- Twitter/X 数据缺失，建议用 Grok 补充
- 数据截止日期以采集当天为准
