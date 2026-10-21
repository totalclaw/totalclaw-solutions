# 来源与改动说明

- 来源：
  - https://github.com/yak33/customs-mcp-server，提交 a560403747ccb79e9bc2a9375d1692258a0c6cd5，路径 `docs/tool-reference.md`、`docs/identity-binding.md`
- 许可证：MIT（Copyright (c) 2025 ZHANGCHAO）
- 改编方：TotalClaw，2026-10-19
- 改动：重命名为 `ft-customs-declaration-tools`；改写 frontmatter（中文名称与描述、模块、来源仓库与提交号）；正文前补「在本产品中使用」一节（工具替换、发信改为人工确认、数据落到工作区文件）；替换特定产品名；正文按上游代码与文档重写为技能步骤（规则与阈值照上游源码）；连接器是到私有关务后端的 MD5 签名客户端，无公共后端；代码不复制，通过 npm 包运行；正文写明只用 stdio、AI 制单上传本机文件前须用户确认
