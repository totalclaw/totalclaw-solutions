# 来源与改动说明

- 来源：
  - https://github.com/ATH-MaaS/Marco-DeepResearch，提交 2be90e40519f67916b4d7a621491e04efac0b6de，路径 `Marco-DeepResearch-Family/HSCodeComp/code/custom_hts_tools.py`、`Marco-DeepResearch-Family/HSCodeComp/code/eval.py`、`Marco-DeepResearch-Family/HSCodeComp/code/prompts/hscode_system.md`、`Marco-DeepResearch-Family/HSCodeComp/code/prompts/hscode_reflect.md`、`Marco-DeepResearch-Family/HSCodeComp/code/prompts/gri_rules.md`、`Marco-DeepResearch-Family/HSCodeComp/code/data/hts_tree.json`、`Marco-DeepResearch-Family/HSCodeComp/code/data/hts_2025_revision_15.json`、`Marco-DeepResearch-Family/HSCodeComp/data/test_data.jsonl`
- 许可证：Apache-2.0（另附 NOTICE；评测集同为 Apache-2.0，税则数据为美国政府公开数据）（Copyright (C) 2026 AIDC-AI）
- 改编方：TotalClaw，2026-10-19
- 改动：重命名为 `ft-hs-code-classify`；改写 frontmatter（中文名称与描述、模块、来源仓库与提交号）；正文前补「在本产品中使用」一节（工具替换、发信改为人工确认、数据落到工作区文件）；替换特定产品名；正文按上游代码与文档重写为技能步骤（规则与阈值照上游源码）；去掉：上游智能体运行框架、批量推理与反思脚本（run.py、batch_test.py、batch_reflect.py、agent_factory.py、config.yaml、run*.sh）未复制：它们依赖上游智能体框架与付费搜索、模型密钥；仓库里的 .env 不复制；scripts/hts_tools.py 用 selfbuilt 副本：三个查询函数原样，数据改读 gzip，原「注册到上游框架工具表」一段换成命令行入口。三个数据文件按 gzip 压缩随包（内容未改）：税则树与 USITC HTS 2025 Rev.15 原始条目为美国政府公开数据，评测集 632 条为上游 Apache-2.0 发布。正文的流程、规则与 46.8% / 95% 结论取自上游提示词与 README。
