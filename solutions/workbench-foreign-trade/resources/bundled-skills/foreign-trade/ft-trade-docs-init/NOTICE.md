# 来源与改动说明

- 来源：
  - https://github.com/Dangooy/trade-pipeline-skill，提交 afcbda5dec97c2a6e9ab692b2add5021cd748040，路径 （见改动说明）
- 许可证：MIT（Copyright (c) 2026 Yang Haoping）
- 改编方：TotalClaw，2026-10-19
- 改动：重命名为 `ft-trade-docs-init`；改写 frontmatter（中文名称与描述、模块、来源仓库与提交号）；正文前补「在本产品中使用」一节（工具替换、发信改为人工确认、数据落到工作区文件）；替换特定产品名；正文按上游代码与文档重写为技能步骤（规则与阈值照上游源码）；上游技能目录 .claude/skills/trade-pipeline-init（只有 SKILL.md，故不设 from）。不带代码副本：配置写到 <工作区>/trade-docs/config.yaml，试跑引用 ft-trade-docs-run 技能目录里的脚本（二选一取「引用」，避免两份代码分叉）。上游命令行向导 python -m trade_pipeline init 靠终端键盘输入，正文改为对话收集
