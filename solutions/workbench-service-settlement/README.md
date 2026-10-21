# 服务商结算与激励核算

- id：`workbench-service-settlement`
- 分类：服务结算
- 类型：workbench
- 入口路由：`/workbenches/service-settlement`

京东/天猫好评激励核算、服务费用结案汇总与邮件下发、发票监听与付款跟踪、报废台账更新、服务营销激励季度结案（含个税申报表与结案报告）。

四大模块分步核算：好评激励自动算账并按月提醒付款；结案费用按服务商拆分邮件下发，发票回收自动归档、逾期自动催办；报废台账合并与条码匹配；营销激励逐步结案，含个税申报表与季度报告。

## 安装

```bash
npm run tcsol -- install workbench-service-settlement
```

qiye-app 中按 id `workbench-service-settlement` 或名称「服务商结算与激励核算」安装；已安装后随方案仓库发布自动升级，用户数据（`service-settlement.json`）不受影响。

## 宿主依赖

本方案代码引用了 19 个宿主模块、16 个 npm 包，明细见 `origin.json`。
