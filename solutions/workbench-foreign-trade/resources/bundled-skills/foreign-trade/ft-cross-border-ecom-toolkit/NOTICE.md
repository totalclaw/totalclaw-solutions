# 来源与改动说明

- 来源：
  - https://github.com/heqiangdiao-wq/AI-Cross-Border-Ecommerce-Agent-Toolkit，提交 cec98a9cab382d28dfe5b4ed0de444f33c455cb5，路径 `docs/00_Architecture_SOP_to_Agent.md`、`docs/01_Prompt_Design_Guide.md`、`docs/02_Platform_Output_Spec.md`、`docs/03_Compliance_Guard.md`、`docs/04_Result_Checklist.md`、`docs/05_SOP_Gap_Register.md`、`Templates`、`Examples`
- 许可证：MIT（Copyright (c) 2026 AI Cross Border Ecommerce Agent Toolkit Contributors）
- 改编方：TotalClaw，2026-10-19
- 改动：重命名为 `ft-cross-border-ecom-toolkit`；改写 frontmatter（中文名称与描述、模块、来源仓库与提交号）；正文前补「在本产品中使用」一节（工具替换、发信改为人工确认、数据落到工作区文件）；替换特定产品名；正文按上游代码与文档重写为技能步骤（规则与阈值照上游源码）；根 SKILL.md 的路由表从 Agents/0X_*/SKILL.md 相对链接改为 ft-ecom-* 技能名；docs/ → references/，Templates/ → templates/，Examples/ → examples/（上游 Examples 下只有 md，无 csv）。docs/电商运营SOP总框架.pdf（31MB）未复制，PDF 由主控处理；正文已链接主控放好的 references/电商运营SOP总框架.md；另把上游根文件「定价模型未含巴西税费」一句改成与 02/06 子技能一致的 --tax 说明（上游根文件过时）
