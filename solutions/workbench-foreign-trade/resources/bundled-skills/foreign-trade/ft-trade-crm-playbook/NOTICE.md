# 来源与改动说明

- 来源：
  - https://github.com/feifei9126/tradepilot，提交 56d275eafe555a3e3f6aabd5546f931559af1ae0，路径 `src/lib/ai/email-prompts.ts`、`src/lib/firecrawl/security.ts`、`docs/prospecting.md`、`docs/ai-marketing.md`、`docs/messaging-channels.md`、`docs/firecrawl-product-media.md`、`docs/livekit-agents.md`、`ARCHITECTURE.md`
- 许可证：AGPL-3.0（LICENSE 正文含占位符）
- 改编方：TotalClaw，2026-10-19
- 改动：重命名为 `ft-trade-crm-playbook`；改写 frontmatter（中文名称与描述、模块、来源仓库与提交号）；正文前补「在本产品中使用」一节（工具替换、发信改为人工确认、数据落到工作区文件）；替换特定产品名；正文按上游代码与文档重写为技能步骤（规则与阈值照上游源码）；去掉：上游是多租户 Next.js 网页应用（数据库、付费抓取、语音客服、消息渠道接入），应用代码与部署脚本（install.sh、start.sh、Dockerfile、workers/）未复制；让模型直接算报价单价与总价的做法（src/app/api/ai/quote/route.ts）不采用；获客打分、去重、转客户、发信合规、收件同步、链接安全与用量预算的规则按源码重写为技能步骤（文件与行号写在正文各节「来源」）；提示词原文与业务文档放在 references/。上游 LICENSE 正文含未替换的占位符，按原样保留。
