# 财务部（legion-finance）

AI 公司的一个部门（军团）。部门 = 一组 AI 员工 + 关联工作台 + 常用工作流，**和机器解耦**：可以装在任意一台机器上，一台机器可以装多个部门。
由「运营中心」（`workbench-legion-hq`）按任务判定要不要这个部门，再把活派给装了它的机器。

- 能干什么：记账与报表、经营分析、定价与成本测算、开票、报销结算核销、预算现金流、工资与税务测算、审计内控。
- AI 员工（11）：`chief-financial-officer`、`finance-financial-analyst`、`finance-fpa-analyst`、`finance-bookkeeper-controller`、`finance-gl-accountant`、`finance-tax-specialist-cn`、`finance-invoice-manager`、`finance-ar-ap-specialist`、`finance-payroll-accountant`、`finance-internal-auditor`、`finance-treasury-manager`；负责人 `finance-financial-analyst`
- 关联工作台：`workbench-finance-agent`、`workbench-invoice-agent`、`workbench-finance-audit`、`workbench-service-settlement`
- 常用工作流：定价测算（`workflows/pricing.json`）；月底结账（`workflows/month-close.json`，最终动作进老板待办：payment）

清单格式见 `tools/lib/legion.mjs`。本包只有清单与工作流，不含代码。
