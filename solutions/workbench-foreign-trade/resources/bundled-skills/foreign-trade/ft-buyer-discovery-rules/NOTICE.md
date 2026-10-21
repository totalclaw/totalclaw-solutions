# 来源与改动说明

- 来源：
  - https://github.com/Tommy-old/b2b-buyer-discovery，提交 fb1261a7936c157b474011f717d3ac35be79f4b0，路径 `scripts/reformat_leads.py`
- 许可证：MIT（Copyright (c) 2025 Trade Hunting Skill Contributors）
- 改编方：TotalClaw，2026-10-19
- 改动：重命名为 `ft-buyer-discovery-rules`；改写 frontmatter（中文名称与描述、模块、来源仓库与提交号）；正文前补「在本产品中使用」一节（工具替换、发信改为人工确认、数据落到工作区文件）；替换特定产品名；正文按上游代码与文档重写为技能步骤（规则与阈值照上游源码）；selfbuilt 覆盖 scripts/reformat_leads.py：源 CSV / 目录与输出目录改为命令行参数（上游写死 ~/Desktop/矿机客户线索），修正空文件时返回值解包报错，其余未改；脚本里的开发信预览模板是上游作者自己的矿机现货生意（公司名、署名、库存型号），正文要求替换。规则与提示词取自 src/skills/ai/rules.ts、scorer.ts、email/composer.ts、workflows/hunting.ts、extractors/contact.ts、search/google.ts。
