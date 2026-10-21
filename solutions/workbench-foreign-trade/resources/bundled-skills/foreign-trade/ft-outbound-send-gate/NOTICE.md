# 来源与改动说明

- 来源：
  - https://github.com/ethanplusai/harvey，提交 e5fdffd5601f36cb34394f66b89541293ad75689，路径 `harvey/gate.py`
  - https://github.com/xiongQvQ/-b2b-lead-hunter-skill，提交 ac27d0ec6627366337423bfcb1ba86c5be5a95a5，路径 `templates/suppression-list.example.csv`
- 许可证：MIT（Copyright (c) 2026 Ethan Rogers）；MIT（Copyright (c) 2026 xiongbojian）
- 改编方：TotalClaw，2026-10-19
- 改动：重命名为 `ft-outbound-send-gate`；改写 frontmatter（中文名称与描述、模块、来源仓库与提交号）；正文前补「在本产品中使用」一节（工具替换、发信改为人工确认、数据落到工作区文件）；替换特定产品名；正文按上游代码与文档重写为技能步骤（规则与阈值照上游源码）；scripts/gate.py 用 selfbuilt 副本覆盖：上游 gate.py 原文不动，文件末尾追加命令行入口与三项检查（退订句、抑制名单、审批 hash，规则取自 xiongQvQ_-b2b-lead-hunter-skill 的 scripts/evaluate_outreach_drafts.py 与 scripts/send_smtp.py），只用标准库，带 --self-test。正文规则另取自 harvey 的 agents/handler.py、agents/sender.py、integrations/email_finder.py，以及 Xuxchloris_Alex 的 integrations/hermes/outreach.py（均依赖各自框架，未复制）。三个来源均 MIT，抑制名单样例 CSV 跨仓库 include 自 xiongQvQ_-b2b-lead-hunter-skill；Xuxchloris_Alex 只借鉴规则、未复制文件。
