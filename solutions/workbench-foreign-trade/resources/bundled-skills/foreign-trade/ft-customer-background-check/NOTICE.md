# 来源与改动说明

- 来源：
  - https://github.com/kakacells/Customer_background_check_version1.2，提交 5ccfd7ee3a92a07d928a4a0eb64ee951a699d2eb，路径 `.`
- 许可证：来源仓库未附许可证（https://github.com/kakacells/Customer_background_check_version1.2；none（仓库无 LICENSE 文件，README 末尾一行写 MIT License））
- 改编方：TotalClaw，2026-10-19
- 改动：重命名为 `ft-customer-background-check`；改写 frontmatter（中文名称与描述、模块、来源仓库与提交号）；正文前补「在本产品中使用」一节（工具替换、发信改为人工确认、数据落到工作区文件）；替换特定产品名；以上游正文为底稿改写（工具名、发送方式、路径）；上游无 LICENSE 文件，README 末尾一行写 MIT License。正文以中文 SKILL.md 为底稿：WebFetch / WebSearch / LinkedIn 换成 web_extract / web_search / 内置浏览器；海关付费库改为用户有账号时内置浏览器登录查看；新增「附带脚本」一节（用法、可选依赖、密钥、脚本与正文权重/阈值差异、batch 只初筛）；修正相关文档表里不存在的 templates/report-template.md → data/report_template.md。SKILL_EN.md、execution-guide*.md、risk-strategies*.md、data-sources*.md 留在根目录（互相用根目录相对路径引用）。密钥：COMPANIES_HOUSE_API_KEY（英国，可选，用户自备免费申请）；法国 recherche-entreprises 接口免密钥；ImportGenius / Panjiva 为付费订阅，脚本只生成链接
