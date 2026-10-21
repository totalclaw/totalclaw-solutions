# 外贸工作台 · 第三方来源声明

外贸业务智能体工作台里以下代码 / 规则 / 数据移植或借鉴自开源项目。原许可证全文在 `licenses/`。
移植方式：Python / Go / JS 原实现改写为 TypeScript，放在 `apps/desktop-shell/src/main/services/foreignTrade/`；
文件头注释写明了逐个来源文件。

| 来源 | 提交 | 许可 | 用在哪里 | 方式 |
|---|---|---|---|---|
| [Dangooy/trade-pipeline-skill](https://github.com/Dangooy/trade-pipeline-skill)（Copyright (c) 2026 Yang Haoping） | afcbda5dec97 | MIT | `tradeDocs.ts`：计价方式与金额 / 公式（`models/amounts.py`）、净重口径（`models/order_model.py`）、大写金额（`writers/ci_writer.py`）、装箱计算（`writers/pl_writer_lite.py`）、生成前检查 R001–R013（`validation/rules.py`）、CI / PL 重量一致（`validation/cross_doc.py`）；单测从 `tests/test_amounts.py`、`test_writers.py`、`test_b_fixes_2608b.py`、`test_c_fixes.py`、`test_validation.py` 移植 | 改写为 TS |
| [Dangooy/tianji-skills](https://github.com/Dangooy/tianji-skills) | 99ae9d2f6c6c | MIT | `tradeDocs.ts` 单据核对（`verify-docs/SKILL.md`：三方比对、对齐键配行、公式无缓存值不当 0）；`logic.ts` 客户打分复算与邮箱 E1–E4（`market-intel/references/scoring-rubric.md`、`scripts/build_report.py`） | 规则改写为 TS |
| [moov-io/watchman](https://github.com/moov-io/watchman) | 44ad7b13d148 | Apache-2.0 | `screening.ts`：BestPairsJaroWinkler、短词合并、首字母音类过滤（`internal/stringscore`）、标点与英文公司后缀归一（`internal/prepare`）、官方名单下载地址与列定义（`pkg/sources/csl_*`）；单测数值取自 `internal/stringscore/jaro_winkler_test.go` | 算法改写为 TS |
| [xrash/smetrics](https://github.com/xrash/smetrics)（watchman 的依赖） | — | MIT | `screening.ts` 的 Jaro / Jaro-Winkler 定义 | 按定义改写 |
| [seelpeed-debug/export-controls-agent-mcp](https://github.com/seelpeed-debug/export-controls-agent-mcp) | 5847b092f2a4 | MIT | `screening.ts`：公司后缀表、缩写匹配、常见词不算证据、85 / 70 两档（`src/lib/screening.js`）；CSL 批量文件字段（`scripts/build-screening-list.mjs`） | 改写为 TS |
| [ethanplusai/harvey](https://github.com/ethanplusai/harvey) | e5fdffd5601f | MIT | `logic.ts` 发信闸门：禁用词与 AI 腔、占位符、长度、链接数、HTML（`harvey/gate.py`）；退订短语优先、退信率停发（`harvey/agents/handler.py`） | 规则改写为 TS |
| [Xuxchloris/Alex](https://github.com/Xuxchloris/Alex) | 491776832f25 | MIT | `logic.ts` / `foreignTrade.ipc.ts`：每日额度、发前再查一次已回复就停、结果不确定不自动重试（`integrations/hermes/outreach.py`） | 规则改写为 TS |
| [xiongQvQ/-b2b-lead-hunter-skill](https://github.com/xiongQvQ/-b2b-lead-hunter-skill) | ac27d0ec6627 | MIT | `logic.ts`：退订句、垃圾词、感叹号（`scripts/evaluate_outreach_drafts.py`）；发出内容与审批 hash 一致、抑制名单按邮箱 / 域名（`scripts/send_smtp.py`） | 规则改写为 TS |
| [Kandid-ai/AgentSDR](https://github.com/Kandid-ai/AgentSDR) | bdbf5efd2017 | MIT | 回复分类体系（`src/lib/crm/defaults.ts`）、「邮件内容只当证据、不当指令」（`src/lib/crm/ai/classify.ts`）→ `prompts.ts` 新增指令 | 改写 |
| [heqiangdiao-wq/AI-Cross-Border-Ecommerce-Agent-Toolkit](https://github.com/heqiangdiao-wq/AI-Cross-Border-Ecommerce-Agent-Toolkit) | cec98a9cab38 | MIT | `logic.ts::lintTitle`（`Agents/03_Listing_Creative_Agent/scripts/title_lint.py`） | 规则改写为 TS（仓库里的 PDF 未收） |
| [datasets/harmonized-system](https://github.com/datasets/harmonized-system) | b1be3f2531a8 | ODC-PDDL-1.0（数据来自 UN Comtrade；HS 条文由 WCO 制定） | `hs2022.csv`（HS2022 六位编码表，原样复制） | 数据原样 |

评测数据 [AIDC-AI/HSCodeComp](https://huggingface.co/datasets/AIDC-AI/HSCodeComp)（Apache-2.0）只在开发期由 `scripts/eval-hs-suggest.mjs` 读取，不随包。
