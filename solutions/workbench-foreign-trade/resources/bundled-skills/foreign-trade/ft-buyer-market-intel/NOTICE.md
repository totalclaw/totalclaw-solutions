# 来源与改动说明

- 来源：
  - https://github.com/Dangooy/tianji-skills，提交 99ae9d2f6c6c6d41ec92a637d6298aa56d01fa91，路径 `market-intel`
- 许可证：MIT（Copyright (c) 2026 Ethan）
- 改编方：TotalClaw，2026-10-19
- 改动：重命名为 `ft-buyer-market-intel`；改写 frontmatter（中文名称与描述、模块、来源仓库与提交号）；正文前补「在本产品中使用」一节（工具替换、发信改为人工确认、数据落到工作区文件）；替换特定产品名；以上游正文为底稿改写（工具名、发送方式、路径）；去掉：firecrawl CLI 调用（search / scrape / agent / --status 余额检查）；firecrawl → web_search / web_extract / 内置浏览器；预算门保留，改为 MAX_EXTRACT_PAGES（按抓取页数计）。selfbuilt 覆盖两个文件：scripts/build_report.py 元数据行改名「网页抓取消耗（页）」并读 cost.extract_pages（兼容旧键 firecrawl_credits）；config/company-profile.template.md 预算键改名、画像位置改为工作区 market-intel/company-profile.md。references/ 与 assets/ 原样，其中的 firecrawl / WebSearch 字样由正文给出对照。上游 README.md（宿主安装说明）未复制
