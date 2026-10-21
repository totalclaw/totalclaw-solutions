# 来源与改动说明

- 来源：
  - https://github.com/Kandid-ai/AgentSDR，提交 bdbf5efd2017347181f5bf549b54d89c1ae6e5f5，路径 `docs/responsible-use.md`、`scripts/examples/sender-knowledge.example.md`
- 许可证：MIT（Copyright (c) 2026 Kandid）
- 改编方：TotalClaw，2026-10-19
- 改动：重命名为 `ft-reply-triage-unsubscribe`；改写 frontmatter（中文名称与描述、模块、来源仓库与提交号）；正文前补「在本产品中使用」一节（工具替换、发信改为人工确认、数据落到工作区文件）；替换特定产品名；正文按上游代码与文档重写为技能步骤（规则与阈值照上游源码）；分类体系取自 src/lib/crm/defaults.ts，提示与输出校验取自 src/lib/crm/ai/classify.ts，套用规则取自 src/lib/crm/stateMachine.ts，退订令牌取自 src/lib/outreach/unsubscribeToken.ts 与 gmail.ts；硬编码退订 / 投诉短语表取自 ethanplusai_harvey 的 harvey/agents/handler.py（MIT，NOTICE 需列出）。代码依赖 Next.js / drizzle / OpenRouter，未复制。
