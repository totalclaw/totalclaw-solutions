---
name: ft-background-master
description: "外贸技能目录·客户背调与合规筛查：列出该类全部外贸技能及用途，按任务挑选后再读具体技能。EN: foreign trade skills index, due diligence, sanctions screening, export control"
version: 1.0.0
platforms: [linux, macos, windows]
metadata:
  totalclaw:
    tags: [foreign-trade, background, index]
    related_skills: [ft-conventions]
    priority: low
    module: background
    kind: index
---

# 外贸技能目录 · 客户背调与合规筛查

外贸技能库里归在「客户背调与合规筛查」的技能共 15 个。先按下表挑最贴近任务的一个，读它的 SKILL.md 再做；
几个都相关时先读描述最具体的那个。通用做法（工具替换、发信要人确认、数据落到工作区文件）见 `ft-conventions`。

| 技能 | 用途 |
|---|---|
| `ft-b2b-osint-research` | B2B 公开信息背调：公司/供应商/竞品/亚马逊卖家/行业调查，信源分级、竞争假说、跨维度矛盾分析，出带风险评级的报告。 |
| `ft-competitor-analysis-local` | 用谷歌地图导出的 CSV 分析本地竞争对手：评分、评论量、线上存在与定位，找市场空白（不调接口）。 |
| `ft-customer-background-check` | 客户背调：邮箱 MX、电话区号、公司注册、董事关联、网站社媒、海关记录、业务合理性七阶段验证，每步有降级方案与置信度，加权评分出风险等级与风控建议。 |
| `ft-customer-background-research` | 单一客户背调：围绕一个公司、品牌、域名、邮箱或地址查主体与关联方、业务信号、公开联系入口和疑似进出口记录，出六张表背调报告，不猜邮箱不推断采购意向。 |
| `ft-customer-intel` | 单一客户深度画像：基于公开或用户提供的业务信息分析决策链、采购偏好、合作历史与沟通策略，输出谈判可用的客户卡。 |
| `ft-email-intel` | 邮箱背景调查：企业 / 个人邮箱判别、域名 MX 与域龄、公开足迹检索与真实性评估，结论照抄检查输出。 |
| `ft-entity-matching-api` | 按例匹配制裁、PEP与执法数据集：用托管接口（用户自备key）或自建服务（需ElasticSearch；数据CC-BY-NC，商用须购授权）对人或公司打分并给特征解释，结论由人复核。 |
| `ft-export-control-check` | 经连接器做出口管制核查：EAR 管辖、CCL 条目检索、国家图表许可证、许可例外、744 最终用途、离线 CSL 名单、中国商务部公告状态；只列待核查问题不下结论。 |
| `ft-export-screening-batch` | 用自备的免费 trade.gov key 把 Excel 名单逐行送美国综合筛查清单（CSL）搜索接口，批量导出命中结果表；新客户建档、建单前初筛时用。 |
| `ft-google-maps-reviews-scraper` | 分析谷歌地图评分与评论 CSV：情感、趋势、竞品评论对比与口碑洞察（不调接口）。 |
| `ft-linkedin-research` | 通过领英连接器查人、公司、职位与动态，做买家背调和找决策人；仅在用户明确要求查领英时用，可能违反领英协议致封号。 |
| `ft-osint` | 客户背景调查：WHOIS、邮箱、制裁名单、网站技术栈、领英与风险评分六层核查，每层标查到 / 查过没有 / 没查。 |
| `ft-sanctions-screening` | 交易对手制裁与出口管制名单筛查：本机跑开源筛查服务（只绑127.0.0.1），对OFAC、美国CSL、欧盟、英国、联合国、FinCEN 311官方名单做多字段模糊匹配，出候选与分数供人工复核。 |
| `ft-trade-compliance` | 外贸合规与规范校验：文化禁忌、缩写解释、国际贸易术语、翻译二审、投标招标与跨境电商上架规范检查。 |
| `ft-trade-osint-redflag-scoring` | 客户背调红旗打分：邮箱、域名、制裁名单、网站技术栈、领英五层检查，按固定扣分表算 0–100 分与低中高风险，附可运行脚本。 |
