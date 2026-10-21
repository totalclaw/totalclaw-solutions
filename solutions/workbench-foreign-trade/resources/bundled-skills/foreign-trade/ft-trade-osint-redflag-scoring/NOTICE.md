# 来源与改动说明

- 来源：
  - https://github.com/chefroger/smart-trade-ai，提交 70609a4231a1112fb34cafdf9c59d61106622518，路径 `trade/__init__.py`、`trade/console.py`、`trade/osint`
- 许可证：AGPL-3.0
- 改编方：TotalClaw，2026-10-19
- 改动：重命名为 `ft-trade-osint-redflag-scoring`；改写 frontmatter（中文名称与描述、模块、来源仓库与提交号）；正文前补「在本产品中使用」一节（工具替换、发信改为人工确认、数据落到工作区文件）；替换特定产品名；正文按上游代码与文档重写为技能步骤（规则与阈值照上游源码）；去掉：邮箱在 120+ 第三方网站的注册探测层（原调 trade/email_intel.py → holehe）：本副本固定返回「未执行」并在报告里披露；激活锁 trade/license.py 不在这条管线里、未复制；scripts/trade/osint 为上游纯标准库管线，selfbuilt 覆盖 orchestrator.py（去掉注册探测）、scoring.py（缺层披露文案）、cli.py / linkedin_verify.py（去掉宿主名）、whois.py（修两处上游缺陷：无时区日期与当前时间相减抛错导致域龄恒为空；.com/.net 注册局 WHOIS 主机名改为 IANA 登记的 whois.verisign-grs.com），新增入口 scripts/osint_check.py。制裁名单缓存默认写 ~/.trade/cache/sanctions，可用环境变量 TRADE_HOME 改到工作区。
