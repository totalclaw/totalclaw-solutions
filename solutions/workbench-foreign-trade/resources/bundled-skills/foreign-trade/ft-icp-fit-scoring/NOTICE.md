# 来源与改动说明

- 来源：
  - https://github.com/EricHong123/B-agent，提交 4e449f26c944fabed0d112cb54b057e9b5e48121，路径 `plans/foreign-trade-agent-api-blueprint.md`
- 许可证：MIT（Copyright (c) 2026 EricHong123）
- 改编方：TotalClaw，2026-10-19
- 改动：重命名为 `ft-icp-fit-scoring`；改写 frontmatter（中文名称与描述、模块、来源仓库与提交号）；正文前补「在本产品中使用」一节（工具替换、发信改为人工确认、数据落到工作区文件）；替换特定产品名；正文按上游代码与文档重写为技能步骤（规则与阈值照上游源码）；去掉：未收录 backend/app/skills/skill_social_scraper.py：数据服务未配置时默认走 mock 分支，生成假账号、假邮箱 contact@<关键词>_user_<n>.com 和假 WhatsApp 号码；正文明确规定不许用假数据兜底。；scripts/icp_score.py 为 selfbuilt 新文件：prospecting_scoring.py 中 _calculate / _target_match / _score_response 的标准库移植，数字分支一致，带 --self-test；agent_research.py 的证据与草稿闸门、agent_runtime/prompts.py 的提示词写入正文。
