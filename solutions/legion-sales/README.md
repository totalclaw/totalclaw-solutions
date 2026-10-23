# 销售部（legion-sales）

AI 公司的一个部门（军团）。部门 = 一组 AI 员工 + 关联工作台 + 常用工作流，**和机器解耦**：可以装在任意一台机器上，一台机器可以装多个部门。
由「运营中心」（`workbench-legion-hq`）按任务判定要不要这个部门，再把活派给装了它的机器。

- 能干什么：询价报价、投标决策与标书、政府采购、外贸开发信、客户方案与跟进。
- AI 员工（7）：`sales-proposal-strategist`、`sales-deal-strategist`、`sales-account-strategist`、`sales-pipeline-analyst`、`sales-engineer`、`sales-outbound-strategist`、`sales-foreign-trade-rep`；负责人 `sales-proposal-strategist`
- 关联工作台：`workbench-rfq-quote`、`workbench-bid-decision`、`workbench-bid-writer`、`workbench-foreign-trade`、`workbench-zcy-agent`
- 常用工作流：报价单（`workflows/quote.json`，最终动作进老板待办：discount）

清单格式见 `tools/lib/legion.mjs`。本包只有清单与工作流，不含代码。
