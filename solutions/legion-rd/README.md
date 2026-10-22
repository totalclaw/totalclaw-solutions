# 产品研发部（legion-rd）

AI 公司的一个部门（军团）。部门 = 一组 AI 员工 + 关联工作台 + 常用工作流，**和机器解耦**：可以装在任意一台机器上，一台机器可以装多个部门。
由「AI 公司运营中心」（`workbench-legion-hq`）按任务判定要不要这个部门，再把活派给装了它的机器。

- 能干什么：需求分析、产品文档、技术方案、内部小工具与页面开发、测试用例与验收。
- AI 员工（10）：`product-manager`、`product-trend-researcher`、`chief-technology-officer`、`engineering-software-architect`、`engineering-senior-developer`、`engineering-frontend-developer`、`engineering-backend-architect`、`engineering-code-reviewer`、`testing-api-tester`、`testing-reality-checker`；负责人 `product-manager`
- 关联工作台：`rd-workflow`
- 常用工作流：需求到技术方案（`workflows/prd-and-design.json`）

清单格式见 `tools/lib/legion.mjs`。本包只有清单与工作流，不含代码。
