---
name: ft-prospect-master
description: "外贸技能目录·客户开发：列出该类全部外贸技能及用途，按任务挑选后再读具体技能。EN: foreign trade skills index, prospecting, lead generation, cold email"
version: 1.0.0
platforms: [linux, macos, windows]
metadata:
  totalclaw:
    tags: [foreign-trade, prospect, index]
    related_skills: [ft-conventions]
    priority: low
    module: prospect
    kind: index
---

# 外贸技能目录 · 客户开发

外贸技能库里归在「客户开发」的技能共 32 个。先按下表挑最贴近任务的一个，读它的 SKILL.md 再做；
几个都相关时先读描述最具体的那个。通用做法（工具替换、发信要人确认、数据落到工作区文件）见 `ft-conventions`。

| 技能 | 用途 |
|---|---|
| `ft-account-navigation` | 同一公司多联系人打法：公司与联系人档案字段、核实规则、先找谁、逐级推进与间隔、何时停止，先出样本给人确认。 |
| `ft-b2b-lead-research` | 外贸 B2B 线索挖掘全流程技能：证据驱动的公司与采购角色核实、决策人、海关信号、分语种模板草稿、确定性质检与审批 hash；分批交人确认，推断邮箱不发。 |
| `ft-bulk-customer-discovery` | 按「产品/料号+目标市场+客户类型」批量发现海外候选客户：公开检索建候选池，标来源状态、业务相关性与联系方式归属，可深度核验为标准开发名单并导出表格。 |
| `ft-business-email-extractor` | 从谷歌地图商家信息里提取已验证的企业邮箱，供开发信使用；需自备地图数据服务密钥。 |
| `ft-buyer-discovery-rules` | 买家发现两层筛选：卖家 / 工厂 / 平台页面排除正则（原样）+ 模型 0–10 买家意向分，换算 12 分制、标记与跟进优先级并导出中文线索表。 |
| `ft-buyer-market-intel` | 海外买家市场情报：母语搜索发现候选、抓官网提取联系方式、逐家交叉背调、确定性打分 A/B/C 分级，输出带自验的 Excel 线索报告。 |
| `ft-buyer-persona` | 买家画像与角色分层：按采购、技术、老板等决策角色定制价值主张、关注点与沟通策略，输出画像卡与话术要点。 |
| `ft-buying-signal-playbook` | 购买信号开发信手册：把招聘、融资、技术栈等信号写成首句，多信号的取舍顺序，没有信号时如何诚实开场。 |
| `ft-china-leads` | 国内企业线索挖掘：找货源厂家、挖竞品国内厂家、找国内客户，只走搜索引擎、展会名录、海关记录、招聘与招投标等免费公开渠道并人工核对。 |
| `ft-cold-email-frameworks` | 冷邮件写作规范：合规与送达底线、禁用套话和格式、三封序列结构、回复触发点、主题行与个性化写法。 |
| `ft-cold-email-local-business` | 用谷歌地图商家 CSV（评分、评论数、网站等）按信号分组，写个性化 AIDA 三封开发信草稿。 |
| `ft-cold-outreach` | 开发信、产品推广信与跟进信撰写：基于公司产品资料与目标市场情报生成个性化邮件，含主题行、钩子、行动号召与多轮跟进。 |
| `ft-customer-finder` | 傻瓜式客户开发向导：问清产品、目标国家、客户类型三件事后检索潜在买家并生成开发信草稿，适合第一次用的业务员。 |
| `ft-customer-finder-loop` | 多轮找客户循环：关键词生成 → 搜索 → 读页抽联系方式与 MX 检查 → 契合度评估 → 按关键词效果与三项停止条件收手；含 B2B 平台站内搜索表与海关数据取证规则。 |
| `ft-email-imitation` | 开发信仿写与再创作：拆解优秀邮件样本的结构、语气与钩子，套用到自家产品生成个性化开发信。 |
| `ft-exhibition` | 展会全流程管理：展前邀约、展位设计、展中记录与跟进、展后转化，含时间表与邀约信要点。 |
| `ft-foreign-trade-lead-agent` | 外贸主动获客：从需求描述、产品图片或客户表出发，按公开来源找海外进口商经销商，证据链与去重打分出线索表，并生成待人工审核的个性化开发信。 |
| `ft-google-maps-export` | 把谷歌地图商家数据导出成 CSV、JSON 或 HubSpot/Pipedrive/Salesforce 导入格式，可映射字段与过滤；需自备地图数据服务密钥。 |
| `ft-google-maps-leads` | 从谷歌地图生成合格 B2B 线索：先定 ICP，再抓取、打分筛选并导出外联名单；需自备地图数据服务密钥。 |
| `ft-google-maps-scraper-api` | 按关键词和地区抓取谷歌地图商家：名称、电话、邮箱、网站、评分与评论数；需自备地图数据服务密钥。 |
| `ft-google-maps-scraper-cli` | 用本地 Docker 抓取 Google 地图商家（名称、类目、评分、电话、官网、地址，可选抽邮箱）做客户开发名单；已关遥测、不自更新。 |
| `ft-icp-fit-scoring` | 客户画像契合度确定性打分（角色 40 / 联系质量 35 / 证据 25），列命中原因与缺失信号，A–D 分档；开发信只能引用已审批证据 ID。 |
| `ft-lead-generation` | 多渠道客户开发：地图、领英、Facebook 等渠道找客户，写开发信、回询盘、报价与谈判要点，覆盖从找客户到成交。 |
| `ft-lead-qualification` | 线索资格判定：BANT 初筛、1–10 分 ICP 打分与优先级分档、MEDDIC 复杂单、剔除信号与信息补全顺序。 |
| `ft-linkedin-outreach` | 领英触达手册：加好友备注、通过后的消息序列、预热互动、评论写法、频率上限与个性化素材（只出草稿由人发送）。 |
| `ft-local-business-finder` | 按类目和地点查本地商家，取电话、邮箱、网站、评分与营业时间；需自备地图数据服务密钥。 |
| `ft-prospecting-tactics` | 不靠付费数据库找客户：搜索语法、领英搜索、官网团队页与招聘页、邮箱格式推断与验证、触发事件和转介绍。 |
| `ft-sales-agent-prompts` | 整套销售代理提示词与开发流水线：找公司、读官网信号、找人打分、邮箱只验证一个、3 封开发序列、回复意图分类、退信即停。 |
| `ft-trade-crm-playbook` | 外贸小团队 CRM 作业手册：公开网页获客初筛打分、开发信与报价跟进提示词、收件箱回复、营销文案、公开链接安全检查与用量预算。 |
| `ft-trade-customer-development` | 外贸客户开发全流程编排：一句话需求拆成搜索、背调、评分、写信、入库、日志各步，逐步调用对应技能，结果分批交人确认后再外发。 |
| `ft-trade-customer-research` | 按用户真实业务资料规划客户研究：任务文件可续接、实际浏览器取证、按已证实 / 待核实 / 不匹配记录证据并去重建档，不造公司、不补造邮箱。 |
| `ft-trade-research-workspace` | 外贸助手工作区总纲：业务档案、决策记录、研究任务、客户库与证据、发送记录、跟进计划、抑制名单放哪里怎么续接；只用真实来源，外发一律工作台人工确认。 |
