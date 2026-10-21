# 来源与改动说明

- 来源：
  - https://github.com/anthropics/financial-services，提交 574ed3624aebd0418c7e96cd101262f30210ab26，路径 `plugins/vertical-plugins/financial-analysis/skills/dcf-model`
  - https://github.com/vivy-yi/finance-skills，提交 758577117bfe3ce5fb019027602f371b32e1ed15，路径 `finance-skills/skills/m-and-a/skills/dcf-modeling`
  - https://github.com/anthropics/financial-services，提交 574ed3624aebd0418c7e96cd101262f30210ab26，路径 `plugins/vertical-plugins/financial-analysis/skills/dcf-model/TROUBLESHOOTING.md`
- 许可证：Apache-2.0（源仓库 LICENSE 为 Apache-2.0 标准文本，仓库未附 NOTICE 文件，未写单独的版权行）；MIT（Copyright (c) 2026 vivy-yi）
- 改编方：TotalClaw，2026-10-19
- 改动：重命名为 `fa-dcf-model`；改写 frontmatter；以「公司档案注入」替换原配置文件加载；移除特定产品名；补充「本地化与地区适配」「输出语言与地区」两节；合并 2 个来源技能（dcf-model + dcf-modeling）：以第一个为骨架，其余作为补充章节；依赖付费数据源（CapIQ、Daloopa、FactSet、S&P Kensho）的取数改为三级降级（有授权连接器 / 上传或公开数据 / 手工录入），补「数据来源（三级降级）」小节
