# 客服部（legion-cs）

AI 公司的一个部门（军团）。部门 = 一组 AI 员工 + 关联工作台 + 常用工作流，**和机器解耦**：可以装在任意一台机器上，一台机器可以装多个部门。
由「运营中心」（`workbench-legion-hq`）按任务判定要不要这个部门，再把活派给装了它的机器。

- 能干什么：多渠道客户咨询答复（微信 / 企微 / 飞书 / 钉钉）、投诉与工单跟踪、售后退换、客户反馈归纳。
- AI 员工（4）：`support-support-responder`、`customer-success-manager`、`retail-customer-returns`、`product-feedback-synthesizer`；负责人 `support-support-responder`
- 关联工作台：`workbench-grounded-qa`
- 常用工作流：投诉处理（`workflows/complaint.json`）

清单格式见 `tools/lib/legion.mjs`。本包只有清单与工作流，不含代码。
