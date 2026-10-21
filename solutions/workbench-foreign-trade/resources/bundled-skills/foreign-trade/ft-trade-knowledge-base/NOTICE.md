# 来源与改动说明

- 来源：
  - https://github.com/chefroger/smart-trade-ai，提交 70609a4231a1112fb34cafdf9c59d61106622518，路径 `.trade-template`、`TRADE-GUIDE.md`、`docs/linkedin-guide.md`、`领英获客.pdf`、`static/trade-customer-template.csv`、`skills/STANDARDS.md`、`smart-trade-ai-manual/说明书.md`
- 许可证：AGPL-3.0
- 改编方：TotalClaw，2026-10-19
- 改动：重命名为 `ft-trade-knowledge-base`；改写 frontmatter（中文名称与描述、模块、来源仓库与提交号）；正文前补「在本产品中使用」一节（工具替换、发信改为人工确认、数据落到工作区文件）；替换特定产品名；正文按上游代码与文档重写为技能步骤（规则与阈值照上游源码）；去掉：上游宿主程序（trade/ 下的 CRM、命令行、网页界面）整体未复制，其中包括 30 天试用 + Ed25519 激活码校验（trade/license.py，过期即停用）、从作者仓库 git clone 覆盖安装的自更新（trade/post_install/update.py）与宿主运行时升级（trade/hermes_upgrade.py）、第三方网站注册探测（trade/email_intel.py 调 holehe）；模板目录 .trade-template 改名 templates/trade-template；trade-guide.md、skill-standards.md、说明书.md 用 selfbuilt 副本（去掉宿主运行时名、上游项目名与仓库地址，说明书里的截图引用改成文字说明），说明书原文的 images/ 截图不收；导入去重规则取自 trade/customer.py 第 427–495 行。
