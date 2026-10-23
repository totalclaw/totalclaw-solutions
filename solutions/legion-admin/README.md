# 行政部（legion-admin）

AI 公司的一个部门（军团）。部门 = 一组 AI 员工 + 关联工作台 + 常用工作流，**和机器解耦**：可以装在任意一台机器上，一台机器可以装多个部门。
由「运营中心」（`workbench-legion-hq`）按任务判定要不要这个部门，再把活派给装了它的机器。

- 能干什么：邮件收件分拣与回复、会议纪要与待办、日程、采购比价与下单申请、公司资料归档、工商与政策申报准备。
- AI 员工（5）：`chief-of-staff`、`specialized-meeting-assistant`、`project-management-meeting-notes-specialist`、`support-executive-summary-generator`、`project-management-studio-operations`；负责人 `chief-of-staff`
- 关联工作台：暂无（法务 / 人事工作台见运营中心 TODO）
- 常用工作流：采购比价与下单申请（`workflows/procurement.json`，最终动作进老板待办：payment）

清单格式见 `tools/lib/legion.mjs`。本包只有清单与工作流，不含代码。
