# 来源与改动说明

- 来源：
  - https://github.com/opensanctions/yente，提交 9a2bb5e8c4a9cabb06203ae82d4a1776b303fd80，路径 `docs/index.md`、`docs/deploy/index.md`、`docs/deploy/firewall.md`、`docs/deploy/monitoring.md`、`docs/deploy/scaling.md`、`docs/deploy/upgrading.md`、`docs/delivery.md`、`docs/datasets.md`、`docs/reindex.md`、`docs/settings.md`、`docs/opensearch.md`、`docs/troubleshooting.md`、`docker-compose.yml`、`examples/match_api.py`
- 许可证：MIT（代码；OpenSanctions 数据为 CC-BY-NC-4.0）（Copyright (c) 2022-2025 OpenSanctions Datenbanken GmbH）
- 改编方：TotalClaw，2026-10-19
- 改动：重命名为 `ft-entity-matching-api`；改写 frontmatter（中文名称与描述、模块、来源仓库与提交号）；正文前补「在本产品中使用」一节（工具替换、发信改为人工确认、数据落到工作区文件）；替换特定产品名；正文按上游代码与文档重写为技能步骤（规则与阈值照上游源码）；代码 MIT，数据 CC-BY-NC 4.0（商用需向数据方购买授权）。只收 docs 下 md、docker-compose.yml 与托管接口调用示例 examples/match_api.py（从环境变量读 key，无其它副作用）。评分算法实现在依赖 nomenklatura 4.17.0 中、不在本仓库，正文只写路由、默认阈值与候选数（yente/routers/match.py、util.py、settings.py、scoring.py）。
