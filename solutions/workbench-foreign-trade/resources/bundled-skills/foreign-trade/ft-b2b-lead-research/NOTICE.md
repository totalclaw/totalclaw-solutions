# 来源与改动说明

- 来源：
  - https://github.com/xiongQvQ/-b2b-lead-hunter-skill，提交 ac27d0ec6627366337423bfcb1ba86c5be5a95a5，路径 `.`、`CLAUDE.md`
- 许可证：MIT（Copyright (c) 2026 xiongbojian）
- 改编方：TotalClaw，2026-10-19
- 改动：重命名为 `ft-b2b-lead-research`；改写 frontmatter（中文名称与描述、模块、来源仓库与提交号）；正文前补「在本产品中使用」一节（工具替换、发信改为人工确认、数据落到工作区文件）；替换特定产品名；以上游正文为底稿改写（工具名、发送方式、路径）；去掉：SKILL.md 第 24–34 行「连续循环、不暂停、发完一批立刻继续挖」的偏好，以及第 137–143 行「群发后立即找决策人、立即发、立即开下一轮」，改为每批结果交人确认；send_smtp.py 的真实发送（--send-approved）不再使用，发送改为外贸工作台人工确认，脚本保留只用于 --print-approval-hashes / --dry-run 核对；README 中的微信打赏 / 赞赏二维码（assets/images）不收录。；正文以上游 SKILL.md 为底稿（保留英文），工具换成 web_search / web_extract / 内置浏览器 / 地图连接器；infer_email.py、linkedin_dm_search.py 保留，正文写明推断邮箱只标待验证、领英由用户在内置浏览器登录后人工操作与发消息。CLAUDE.md 改名 references/agent-notes.md，selfbuilt 副本去掉了平台说明和产品名。LICENSE 由导入脚本生成故排除。references/ 与 scripts/ 原文仍有约 31 处 Hermes 字样（如 outreach-parameter-guide.md 的 hermes-skills 路径），正文给了替换表。
