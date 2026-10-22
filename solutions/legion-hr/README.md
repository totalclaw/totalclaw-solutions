# 人事部（legion-hr）

AI 公司的一个部门（军团）。部门 = 一组 AI 员工 + 关联工作台 + 常用工作流，**和机器解耦**：可以装在任意一台机器上，一台机器可以装多个部门。
由「AI 公司运营中心」（`workbench-legion-hq`）按任务判定要不要这个部门，再把活派给装了它的机器。

- 能干什么：招聘（JD、简历筛选、面试题与评分卡）、入离职、绩效、考勤与培训资料。
- AI 员工（4）：`hr-recruiter`、`hr-performance-reviewer`、`support-recruitment-specialist`、`hr-onboarding`；负责人 `hr-recruiter`
- 关联工作台：暂无（法务 / 人事工作台见运营中心 TODO）
- 常用工作流：招聘一个岗位（`workflows/hiring.json`，最终动作进老板待办：hire）

清单格式见 `tools/lib/legion.mjs`。本包只有清单与工作流，不含代码。
