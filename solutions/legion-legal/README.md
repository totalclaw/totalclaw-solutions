# 法务部（legion-legal）

AI 公司的一个部门（军团）。部门 = 一组 AI 员工 + 关联工作台 + 常用工作流，**和机器解耦**：可以装在任意一台机器上，一台机器可以装多个部门。
由「AI 公司运营中心」（`workbench-legion-hq`）按任务判定要不要这个部门，再把活派给装了它的机器。

- 能干什么：合同审查与修订、合规检查、法律文书与制度起草、知识产权与劳动纠纷咨询。
- AI 员工（5）：`legal-contract-reviewer`、`legal-policy-writer`、`support-legal-compliance-checker`、`legal-trade-compliance-specialist`、`legal-document-review`；负责人 `legal-contract-reviewer`
- 关联工作台：`workbench-legal-agent`
- 常用工作流：合同审查（`workflows/contract-review.json`，最终动作进老板待办：contract）

清单格式见 `tools/lib/legion.mjs`。本包只有清单与工作流，不含代码。
