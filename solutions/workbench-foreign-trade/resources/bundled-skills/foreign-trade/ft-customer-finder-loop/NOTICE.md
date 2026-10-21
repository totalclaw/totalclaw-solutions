# 来源与改动说明

- 来源：
  - https://github.com/xiongQvQ/AI_Find_Customer，提交 9b2fde8f719623c627516da2663707a893ee6805，路径 `backend/docs/email-template-outreach.md`
- 许可证：MIT（Copyright (c) 2026 AI Hunter）
- 改编方：TotalClaw，2026-10-19
- 改动：重命名为 `ft-customer-finder-loop`；改写 frontmatter（中文名称与描述、模块、来源仓库与提交号）；正文前补「在本产品中使用」一节（工具替换、发信改为人工确认、数据落到工作区文件）；替换特定产品名；正文按上游代码与文档重写为技能步骤（规则与阈值照上游源码）；LangGraph / FastAPI / Serper / Jina 代码未复制，流程、阈值与提示词写入正文（graph/builder.py、graph/evaluate.py、agents/*.py、tools/platform_registry.py、tools/customs_router.py、tools/email_verifier.py、tools/email_finder.py、emailing/policy.py）。正文指出并修正上游缺陷：emailing/policy.py 把带 (inferred) 的推断邮箱去掉标记后列为发送目标，且把仅过 MX 检查的地址标成 verified。
