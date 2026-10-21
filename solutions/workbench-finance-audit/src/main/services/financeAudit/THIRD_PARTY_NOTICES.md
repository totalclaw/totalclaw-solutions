# 规则引擎的规则出处（财会审计）

本目录下的规则引擎（`engines/`）、校验与回核（`verify.ts`、`language.ts`）、技能调用约束（`skillRunner.ts`）是 TotalClaw 按下列公开项目的**判断规则与流程说明**自行编写的代码，**没有复制它们的源代码**。阈值放在 `thresholds/<模块>.json`，每条带 `source` 字段（文件 + 小节），公司档案可以覆盖。

技能正文的来源、许可证全文与逐个技能的改动说明见 `resources/bundled-skills/finance-audit/THIRD_PARTY_NOTICES.md` 与各技能目录下的 `LICENSE` / `NOTICE.md`。

## 来源项目

| 项目 | 提交 | 许可证 | 版权声明 |
|---|---|---|---|
| https://github.com/vivy-yi/finance-skills | `758577117bfe3ce5fb019027602f371b32e1ed15` | MIT | Copyright (c) 2026 vivy-yi |
| https://github.com/anthropics/financial-services | `574ed3624aebd0418c7e96cd101262f30210ab26` | Apache-2.0 | 仓库 LICENSE 为 Apache-2.0 标准文本，未附 NOTICE 文件 |

## 批次 1 引擎用到的规则

| 引擎 | 规则出处 |
|---|---|
| 关账清单（closeChecklist） | finance-skills `skills/month-end-close/skills/close-checklist-executor/SKILL.md`（15 项前置、能否开始结账的判定） |
| 试算与勾稽（trialBalance） | finance-skills `skills/month-end-close/skills/close-verification/SKILL.md`；`skills/month-end-close/references/判断框架.md` 类型一（借贷差异分档）、类型五（报表勾稽） |
| 跨期调整（crossPeriod） | finance-skills `skills/month-end-close/skills/cross-period-adjustment/SKILL.md`；`判断框架.md` 类型二（金额与天数分档、审批层级） |
| 计提表（accrualSchedule） | financial-services `plugins/vertical-plugins/fund-admin/skills/accrual-schedule/SKILL.md` |
| 滚动表（rollForward） | financial-services `plugins/vertical-plugins/fund-admin/skills/roll-forward/SKILL.md`（不许倒挤） |
| 波动说明（flux） | financial-services `plugins/vertical-plugins/fund-admin/skills/variance-commentary/SKILL.md`；finance-skills `判断框架.md`（必评科目与阈值） |
| 银企对账（bankRecon） | finance-skills `skills/month-end-close/skills/reconciliation-automation/SKILL.md`；`判断框架.md` 类型三（未达账项分档与升级条件） |
| 总账与子账对账（glSubledgerRecon） | financial-services `plugins/vertical-plugins/fund-admin/skills/gl-recon/SKILL.md`（六类差异、六种成因假设、容差） |
| 差异溯源（breakTrace） | financial-services `plugins/vertical-plugins/fund-admin/skills/break-trace/SKILL.md`（根因句式、责任方、预计消除日、动作） |
| 升级条件 | finance-skills `判断框架.md`「升级触发器」；`skills/month-end-close/CLAUDE.md`「升级矩阵」 |

## 批次 3 引擎用到的规则（审计组 B1–B6 与 P4）

| 引擎 | 规则出处 |
|---|---|
| 属性抽样样本量、测试结论（icfr/sampling、icfr/testing） | finance-skills `skills/internal-control/skills/control-testing/SKILL.md`（预期 / 可容忍偏差率、置信水平、偏差率判定）；样本量算法按公开的二项分布属性抽样口径自写，频率最小样本量表见 `docs/finance-audit-solution.md` 5.6 |
| 缺陷分级矩阵（icfr/deficiency） | finance-skills `skills/internal-control/skills/control-deficiency/SKILL.md` 第四步（财务影响 × 运营影响 × 补偿性控制） |
| 风险矩阵、整改超期分级（internalAudit/plan） | finance-skills `skills/internal-audit/references/判断框架.md`（风险矩阵、超期未整改处理）、`skills/internal-audit/skills/annual-audit-planning/SKILL.md` |
| 审计调整影响、PBC、函证状态与替代程序（extAudit/*） | finance-skills `skills/audit-support/skills/audit-adjustment-review/SKILL.md`、`audit-evidence-collection/SKILL.md`、`confirmation-management/SKILL.md`；`skills/audit-support/references/判断框架.md` 类型四、类型五 |
| 底稿质检（review/xlsAudit，B4 与 P4 共用） | financial-services `plugins/vertical-plugins/financial-analysis/skills/audit-xls/SKILL.md`（Step 2 公式级检查、Step 3 模型完整性） |
| LP 资本账户重算（review/navTieout） | financial-services `plugins/vertical-plugins/fund-admin/skills/nav-tieout/SKILL.md`（重算公式、容差 0.01、LP 合计 = 基金净值） |
| 舞弊数据分析（fraud/*） | finance-skills `skills/internal-audit/skills/fraud-investigation/SKILL.md`、`skills/internal-audit/CLAUDE.md`（舞弊红旗指标）；本福特 MAD 分档采用 Nigrini 公开口径；另只读复用财务智能体 `financeAgent/risk.ts` |
| 尽调抽取、规则网格与处置（kyc/*） | financial-services `plugins/vertical-plugins/operations/skills/kyc-doc-parse/SKILL.md`、`kyc-rules/SKILL.md`；`managed-agent-cookbooks/kyc-screener`（doc-reader / rules-engine / escalator 三层隔离，只参考思路） |
| 演示文稿质检与刷新（office/deck） | financial-services `plugins/vertical-plugins/financial-analysis/skills/ib-check-deck/SKILL.md`（`scripts/extract_numbers.py` 未执行、未迁代码，只参考思路）、`deck-refresh/SKILL.md` |

## 执行约束的思路出处

| 约束 | 思路出处 |
|---|---|
| 读不可信文件的调用不给工具、输出过 schema；算钱的是规则；写文件的是主进程 | financial-services `managed-agent-cookbooks/*/subagents/*.yaml` 与 `managed-agent-cookbooks/README.md` 的三层隔离（reader / 中间工作者 / writer） |
| 结构化输出校验 | financial-services `scripts/validate.py`（只参考思路，未执行、未迁代码） |
| 模块间转交只允许声明过的方向 | financial-services `scripts/orchestrate.py` 的 handoff 白名单（只参考思路） |
| 数字标来源、找不到来源标「未注明来源」 | financial-services 研究类技能的 `[UNSOURCED]` 约定 |

## 商标

文中出现的项目名与数据源名称只用于说明出处，属于事实描述，不代表任何背书。
