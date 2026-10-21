# AI 研发流水线

- id：`dev-pipeline`
- 分类：产品研发
- 类型：pipeline（runner `agent-pipeline`）

输入一句产品需求，一支 AI 研发团队在工作流画布上自动接力跑完整条研发流程：产品经理写 PRD → 开发工程师出技术设计 → 代码评审员审查+单测 → 测试工程师出测试用例 → 运维工程师出部署运维方案，最后 CTO 汇总评估。点「启动」即跳工作流页，逐节点真执行、逐个点亮。

## 安装

```bash
npm run tcsol -- install dev-pipeline
```

运行记录保存在账号目录 `solution-runs.json`（按方案 id 分组），升级不影响。
