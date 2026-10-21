# 流程时效监控智能体

- id：`workbench-flow-sla`
- 分类：流程管理
- 类型：workbench
- 入口路由：`/workbenches/flow-sla`
- 依赖：`workbench-charity-content`、`workbench-service-settlement`

导入 OA、费控、CSS 三个系统的流程报表，按时效规则算出每个流程和每位审核人是否超时，自动出时效看板、周报和月度分析报告，并跟进在途流程和改善建议。

六步向导：导入报表与花名册 → 标准化与规则核对 → 计算（端到端用时、个人审核用时、合规率、排名、在途逾期）→ 环比与异常流程的节点分析 → 超时原因收集与归类 → 生成周报邮件或月度分析报告。另有时效看板、在途跟进（内部流程 3 天、外部流程 7 天提醒一次）和改善建议台账（到期前 7 天提醒）。所有数字由规则计算，模型只归纳原因和写总结；邮件发送前由你确认。

## 安装

```bash
npm run tcsol -- install workbench-flow-sla
```

qiye-app 中按 id `workbench-flow-sla` 或名称「流程时效监控智能体」安装；已安装后随方案仓库发布自动升级，用户数据（`flow-sla/`）不受影响。

## 宿主依赖

本方案代码引用了 11 个宿主模块、11 个 npm 包，明细见 `origin.json`。
