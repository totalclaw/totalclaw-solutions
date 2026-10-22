# 运营部（legion-ops）

AI 公司的一个部门（军团）。部门 = 一组 AI 员工 + 关联工作台 + 常用工作流，**和机器解耦**：可以装在任意一台机器上，一台机器可以装多个部门。
由「AI 公司运营中心」（`workbench-legion-hq`）按任务判定要不要这个部门，再把活派给装了它的机器。

- 能干什么：市场营销与内容、短视频与广告投放、项目推进、流程时效、库存与供应链、门店与电商日常。
- AI 员工（9）：`chief-operating-officer`、`chief-marketing-officer`、`project-manager-senior`、`project-management-project-shepherd`、`support-supply-chain-strategist`、`marketing-social-media-strategist`、`marketing-xiaohongshu-operator`、`marketing-douyin-strategist`、`support-analytics-reporter`；负责人 `chief-operating-officer`
- 关联工作台：`workbench-flow-sla`、`workbench-parts-alert`、`workbench-biz-automation`、`workbench-global-ads`、`embedded-video-studio`
- 常用工作流：新品推广方案（`workflows/launch-campaign.json`，最终动作进老板待办：publish）

清单格式见 `tools/lib/legion.mjs`。本包只有清单与工作流，不含代码。
