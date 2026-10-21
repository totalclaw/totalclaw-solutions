# 来源与改动说明

- 来源：
  - https://github.com/chefroger/smart-trade-ai，提交 70609a4231a1112fb34cafdf9c59d61106622518，路径 `skills/b2b-social-media/SKILL.md`
- 许可证：AGPL-3.0
- 改编方：TotalClaw，2026-10-19
- 改动：重命名为 `ft-social-media`；改写 frontmatter（中文名称与描述、模块、来源仓库与提交号）；正文前补「在本产品中使用」一节（工具替换、发信改为人工确认、数据落到工作区文件）；替换特定产品名；以上游正文为底稿改写（工具名、发送方式、路径）；去掉：上游宿主程序（trade/ 下的 CRM、命令行、网页界面）整体未复制，其中包括 30 天试用 + Ed25519 激活码校验（trade/license.py，过期即停用）、从作者仓库 git clone 覆盖安装的自更新（trade/post_install/update.py）与宿主运行时升级（trade/hermes_upgrade.py）、第三方网站注册探测（trade/email_intel.py 调 holehe）；上游正文写在宿主 frontmatter 的 when_to_use 与 injection_prompt 里，展开为正文，技能互相引用改成本产品名字；web_fetch 换成 web_extract，宿主专用工具换成内置浏览器与工作区文件，自动发信改为出草稿由人确认。references/qa_pairs.md（上游问答对）里出现的具体模型产品名改成中性说法。
