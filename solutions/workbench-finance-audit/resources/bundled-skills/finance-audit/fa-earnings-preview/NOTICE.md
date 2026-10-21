# 来源与改动说明

- 来源：
  - https://github.com/anthropics/financial-services，提交 574ed3624aebd0418c7e96cd101262f30210ab26，路径 `plugins/vertical-plugins/equity-research/skills/earnings-preview`
  - https://github.com/anthropics/financial-services，提交 574ed3624aebd0418c7e96cd101262f30210ab26，路径 `plugins/partner-built/spglobal/skills/earnings-preview-beta`
  - https://github.com/anthropics/financial-services，提交 574ed3624aebd0418c7e96cd101262f30210ab26，路径 `plugins/partner-built/spglobal/skills/earnings-preview-beta/report-template.md`
- 许可证：Apache-2.0（源仓库 LICENSE 为 Apache-2.0 标准文本，仓库未附 NOTICE 文件，未写单独的版权行）；Apache-2.0（Copyright 2026-present Kensho Technologies, LLC.）
- 改编方：TotalClaw，2026-10-19
- 改动：重命名为 `fa-earnings-preview`；改写 frontmatter；以「公司档案注入」替换原配置文件加载；移除特定产品名；补充「本地化与地区适配」「输出语言与地区」两节；合并 2 个来源技能（earnings-preview + earnings-preview-beta）：以第一个为骨架，其余作为补充章节；依赖付费数据源（FactSet、S&P Kensho）的取数改为三级降级（有授权连接器 / 上传或公开数据 / 手工录入），补「数据来源（三级降级）」小节
