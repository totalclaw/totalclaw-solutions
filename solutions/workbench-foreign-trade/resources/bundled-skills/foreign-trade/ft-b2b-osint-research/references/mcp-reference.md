# MCP 工具矩阵

> 此文件从 references/agent-definition.md 分离，按需查阅。上游的 MCP 配置文件未随技能复制，本产品中的工具对照见 SKILL.md「工具对照」。

| MCP 服务器 | 工具 | 用途 |
|-----------|------|------|
| **spiderfoot** | spiderfoot_scan | 全模块 OSINT 扫描（域名/IP/邮箱/用户名/人名，200+模块自动跑） |
| | spiderfoot_scan_quick | 仅被动模块快速扫描（不触碰目标） |
| | spiderfoot_results | 查询已完成扫描的详细结果 |
| **sales-intel** | hunter_domain_search | 按域名搜邮箱+职位+LinkedIn |
| | hunter_email_finder | 精确查找某人企业邮箱 |
| | hunter_email_verifier | 验证邮箱可送达性 |
| | hunter_account_info | 查看 API 用量 |
| **sec-edgar** | CIK/10-K/10-Q/8-K | 上市公司财报、重大事件、内幕交易 |
| **maigret** | maigret search | 400+平台用户名/邮箱搜索 |
| **social-analyzer** | social_search_username | 1000+平台用户名深度扫描，置信度 0-100 评分 |
| | social_search_multi_usernames | 多用户名变体同时扫描 |
| | **social_brand_audit** | 竞品品牌社媒运营审计（平台覆盖+粉丝+bio定位快照） |
| | **social_person_audit** | B2B决策人个人账号发现（姓名→用户名变体→活跃平台+outreach建议） |
| **playwright** | browser automation | 网页抓取、LinkedIn 搜索 |
| **trade-intel** | import_history_lookup | ImportYeti 进出口历史（美国海关 B/L 记录） |
| | procurement_intent_check | 采购意向信号检测（LinkedIn招聘+融资+展会+增长信号） |
| | payment_risk_score | 付款风险复合评分（公司年龄+规模+国家风险+诉讼+声誉） |
| | sanctions_check | 制裁名单自动命中检测（Trade.gov CSL） |
| **卖家精灵** | competitor_lookup | 竞品品牌产品线扫描（全部ASIN+BSR+价格+评价） |
| | asin_detail / asin_prediction | ASIN详情+月销量/月营收预测 |
| | keepa_info | Keepa历史价格+BSR长期趋势+库存状态 |
| | bsr_prediction | BSR趋势预测（上升=衰退，下降=增长） |
| | asin_coupon_trend | 优惠券/促销历史（清库存/冲排名信号） |
| | traffic_source / traffic_keyword | 流量来源构成+自然/广告关键词列表 |
| | traffic_listing / traffic_listing_stat | ASIN流量词统计+排名 |
| | keyword_research / keyword_miner | 关键词搜索量+竞争度+长尾挖掘 |
| | keyword_order | 关键词下自然排名产品列表 |
| | market_research / market_research_statistics | 市场容量+增长率+头部品牌 |
| | market_brand_concentration | 品牌集中度（CR3/CR5/HHI） |
| | market_seller_concentration | 卖家集中度+类型分布 |
| | market_price_distribution | 品类价格段分布 |
| | market_rating_distribution | 评分分布+各价格段质量 |
| | market_ratings_count_distribution | 评价数量分布（新品vs老品占比） |
| | market_listing_trend_distribution | 上架趋势（新品涌入速度） |
| | market_seller_country_distribution | 卖家国家分布（中国卖家占比） |
| | market_product_demand_trend | 品类需求趋势（季节性+增长） |
| | market_ebc_distribution | A+页面使用率（品牌化程度） |
| | google_trend | Google搜索趋势验证需求 |
| | product_node | Amazon品类节点树 |
| **web-check** | domain_tech_stack | 技术栈检测 |
| | domain_dns_security | 邮件安全配置（SPF/DKIM/DMARC） |
| | domain_whois | RDAP域名注册信息 |
| | domain_web_archive | Wayback Machine历史 |
| | domain_threat_check | 威胁检测 |
| **firecrawl-mcp** | firecrawl_scrape | 单页抓取（JS渲染+干净Markdown） |
| | firecrawl_search | 网页搜索+自动抓取结果 |
| | firecrawl_crawl | 异步整站采集（按链接深度） |
| | firecrawl_map | 站点URL全量发现 |
| | firecrawl_extract | 结构化数据提取 |
| | firecrawl_batch_scrape | 批量多URL抓取 |
| | firecrawl_deep_research | 自主多源深度研究 |
| **yfinance** | get_stock_info | 股价+市值+基本面指标 |
| | get_historical_stock_prices | 历史 OHLCV 价格数据 |
| | get_financial_statement | 利润表/资产负债表/现金流量表 |
| | get_holder_info | 机构持仓+大股东+内幕交易 |
| | get_recommendations | 分析师评级+升降级历史 |
| | get_yahoo_finance_news | 个股最新新闻 |
| | get_stock_actions | 分红+拆股历史 |
| | get_option_chain | 期权链数据 |

## Firecrawl 使用规则（免费版 500 credits）

**核心原则：WebFetch/WebSearch 为默认，Firecrawl 只用于它们做不到的场景。**

| 规则 | 说明 |
|------|------|
| 先 WebFetch 后 Firecrawl | 任何 URL 先尝试 WebFetch，失败才用 firecrawl_scrape |
| crawl 限制页数 | 单次 ≤ 20 页 |
| 禁止随意 deep_research | 仅用户明确要求时使用 |
| batch_scrape 先过滤 | 先用 firecrawl_map 筛选 |
| 每次调查预算 | ≤ 30 credits |
| 余量提醒 | 接近 400 credits 时告知用户 |
