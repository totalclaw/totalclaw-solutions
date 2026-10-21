# 来源与改动说明

- 来源：
  - https://github.com/datasets/harmonized-system，提交 b1be3f2531a85fb0ea17147b19c41d3641912e43，路径 `data/harmonized-system.csv`、`data/sections.csv`、`datapackage.json`、`scripts/convert.py`
- 许可证：来源仓库未附许可证（https://github.com/datasets/harmonized-system；ODC-PDDL-1.0（datapackage.json 声明，仓库无 LICENSE 文件））
- 改编方：TotalClaw，2026-10-19
- 改动：重命名为 `ft-hs-code-lookup`；改写 frontmatter（中文名称与描述、模块、来源仓库与提交号）；正文前补「在本产品中使用」一节（工具替换、发信改为人工确认、数据落到工作区文件）；替换特定产品名；正文按上游代码与文档重写为技能步骤（规则与阈值照上游源码）；上游仓库没有 LICENSE 文件；datapackage.json 声明数据许可 ODC-PDDL-1.0，数据来源 UN Comtrade。harmonized-system.csv 约 850KB（6940 行）。WCO 对 HS 条文主张版权，商用随包分发需法务确认。
