# 来源与改动说明

- 来源：
  - https://github.com/Focus-AI-Center/Mentarc-EvoAgent，提交 761376039f10c62bd0253da35dc4d06e0bff63f8，路径 `configs/prompts`、`configs/agents/session-reviewer.md`、`configs/skills/skill-creator/SKILL.md`、`configs/skills/skill-creator/references/skill-creator-original.md`、`NOTICE`
- 许可证：Apache-2.0（Copyright 2026 Focus Technology Co., Ltd.）
- 改编方：TotalClaw，2026-10-19
- 改动：重命名为 `ft-skill-distill`；改写 frontmatter（中文名称与描述、模块、来源仓库与提交号）；正文前补「在本产品中使用」一节（工具替换、发信改为人工确认、数据落到工作区文件）；替换特定产品名；正文按上游代码与文档重写为技能步骤（规则与阈值照上游源码）；configs/prompts 整目录（SKILL_EXTRACT/SKILL_MATCH/SESSION_UPDATE/SOUL/USER/MEMORY 及 4 个 MEMORY_*）进 references/prompts/；Apache-2.0 要求随附 NOTICE，故另收 references/upstream-NOTICE.txt。未复制任何代码（matcher/agent 逻辑与行号写进正文）。参考文件 SOUL.md、NOTICE 内含上游产品名，正文无。
