# 来源与改动说明

- 来源：
  - https://github.com/moov-io/watchman，提交 44ad7b13d148afbac8d92019ec6e42ecfbff4dfe，路径 `docs/using-watchman.md`、`docs/search.md`、`docs/api.yaml`、`docs/config.md`、`docs/network.md`、`docs/usage-docker.md`、`docs/cache-data-files.md`、`docs/ingest.md`、`docs/intro.md`、`docs/pipeline.md`、`docs/indexing.md`、`docs/methodology/index.md`、`docs/methodology/for-compliance.md`、`docs/methodology/pages/ofac-name-comparison.md`、`docs/algorithm-comparison.md`、`docs/algorithm-comparison.csv`、`docs/cross-script-matching.md`、`docs/opensanctions-pairs.md`、`docs/mcp.md`
- 许可证：Apache-2.0
- 改编方：TotalClaw，2026-10-19
- 改动：重命名为 `ft-sanctions-screening`；改写 frontmatter（中文名称与描述、模块、来源仓库与提交号）；正文前补「在本产品中使用」一节（工具替换、发信改为人工确认、数据落到工作区文件）；替换特定产品名；正文按上游代码与文档重写为技能步骤（规则与阈值照上游源码）；只收上游 docs 下与使用、算法、名单相关的 md（外加 api.yaml 接口定义与 algorithm-comparison.csv 小表），不复制 Go 源码、二进制或 PDF。正文的算法参数与名单地址读自 internal/stringscore/jaro_winkler.go、phonetics.go、pkg/search/similarity.go、algorithm.go、pkg/sources/*/download*.go、internal/download/download.go、configs/config.default.yml。上游文档有一处称 INCLUDED_LISTS 默认全部，代码实际为空即不加载，正文以代码为准。
