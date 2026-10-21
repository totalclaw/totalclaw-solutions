# 来源与改动说明

- 来源：
  - https://github.com/gosom/google-maps-scraper，提交 d0b51bcf3cd56d9a3f71e049cb6e226554e24162，路径 `skills/google-maps-scraper`
- 许可证：MIT（Copyright (c) 2023 Georgios Komninos）
- 改编方：TotalClaw，2026-10-19
- 改动：重命名为 `ft-google-maps-scraper-cli`；改写 frontmatter（中文名称与描述、模块、来源仓库与提交号）；正文前补「在本产品中使用」一节（工具替换、发信改为人工确认、数据落到工作区文件）；替换特定产品名；以上游正文为底稿改写（工具名、发送方式、路径）；去掉：自更新脚本 ensure-latest.sh（每次运行 npx --yes skills update 自我更新）及其测试 helpers_test.sh；代理赞助商推荐脚本、referral 链接清单与「给项目点 star」提示；run-local.sh 每次运行拉取 latest 镜像的行为；selfbuilt 覆盖 scripts/run-local.sh（固定 -e DISABLE_TELEMETRY=1、默认复用本机镜像且 --pull 才更新、GMAPS_IMAGE 可固定版本）以及 references/local-execution.md、advanced-coverage.md、proxy-setup.md、recovery.md（去掉赞助商内容，/tmp 改为工作区 gmaps/）。上游没有关闭遥测的命令行参数，只有环境变量 DISABLE_TELEMETRY=1
