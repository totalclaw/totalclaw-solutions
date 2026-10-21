# 来源与改动说明

- 来源：
  - https://github.com/anthropics/financial-services，提交 574ed3624aebd0418c7e96cd101262f30210ab26，路径 `plugins/vertical-plugins/equity-research/skills/initiating-coverage`
  - https://github.com/anthropics/financial-services，提交 574ed3624aebd0418c7e96cd101262f30210ab26，路径 `plugins/vertical-plugins/equity-research/skills/initiating-coverage/references/valuation-methodologies.md`
  - https://github.com/anthropics/financial-services，提交 574ed3624aebd0418c7e96cd101262f30210ab26，路径 `plugins/vertical-plugins/equity-research/skills/initiating-coverage/references/task1-company-research.md`
  - https://github.com/anthropics/financial-services，提交 574ed3624aebd0418c7e96cd101262f30210ab26，路径 `plugins/vertical-plugins/equity-research/skills/initiating-coverage/references/task2-financial-modeling.md`
  - https://github.com/anthropics/financial-services，提交 574ed3624aebd0418c7e96cd101262f30210ab26，路径 `plugins/vertical-plugins/equity-research/skills/initiating-coverage/references/task3-valuation.md`
  - https://github.com/anthropics/financial-services，提交 574ed3624aebd0418c7e96cd101262f30210ab26，路径 `plugins/vertical-plugins/equity-research/skills/initiating-coverage/references/task4-chart-generation.md`
  - https://github.com/anthropics/financial-services，提交 574ed3624aebd0418c7e96cd101262f30210ab26，路径 `plugins/vertical-plugins/equity-research/skills/initiating-coverage/references/task5-report-assembly.md`
  - https://github.com/anthropics/financial-services，提交 574ed3624aebd0418c7e96cd101262f30210ab26，路径 `plugins/vertical-plugins/equity-research/skills/initiating-coverage/assets/quality-checklist.md`
  - https://github.com/anthropics/financial-services，提交 574ed3624aebd0418c7e96cd101262f30210ab26，路径 `plugins/vertical-plugins/equity-research/skills/initiating-coverage/assets/report-template.md`
- 许可证：Apache-2.0（源仓库 LICENSE 为 Apache-2.0 标准文本，仓库未附 NOTICE 文件，未写单独的版权行）
- 改编方：TotalClaw，2026-10-19
- 改动：重命名为 `fa-initiating-coverage`；改写 frontmatter；以「公司档案注入」替换原配置文件加载；移除特定产品名；补充「本地化与地区适配」「输出语言与地区」两节；正文原样保留（源语言）；依赖付费数据源（FactSet、CapIQ、S&P Kensho）的取数改为三级降级（有授权连接器 / 上传或公开数据 / 手工录入），补「数据来源（三级降级）」小节
