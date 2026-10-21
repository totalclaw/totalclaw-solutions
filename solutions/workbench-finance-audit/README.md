# 财会审计解决方案

- id：`workbench-finance-audit`
- 分类：财会审计
- 类型：workbench
- 入口路由：`/workbenches/finance-audit`
- 依赖：`workbench-bid-writer`、`workbench-finance-agent`、`workbench-invoice-agent`、`workbench-service-settlement`

月结关账、对账、审计与内控、税务合规、管理报告、资金风险与投融资估值，48 个模块分步出底稿，人工签核后归档；中英阿三语，适配中国、国际、沙特与阿联酋准则税制。

上传序时账、科目余额表、银行流水、合同与发票，按模块分步完成校验、计算与分析，生成 Excel 底稿、调节表、差异说明、审计备忘录与管理层报告。金额与勾稽由规则计算，模型只做抽取和写说明，引用的数字逐条回原文核对。覆盖会计核算、审计与内控、税务合规（中国增值税与金税，沙特 ZATCA 增值税、电子发票、天课与预提税，阿联酋 FTA 增值税与企业所得税）、财务分析与管理报告、资金与金融风险、投融资与估值。所有产出均为草稿：不过账、不付款、不提交申报、不发送函证、不出具审计意见，经编制、复核、批准三级签核后归档。

## 安装

```bash
npm run tcsol -- install workbench-finance-audit
```

qiye-app 中按 id `workbench-finance-audit` 或名称「财会审计解决方案」安装；已安装后随方案仓库发布自动升级，用户数据（`finance-audit/`）不受影响。

## 宿主依赖

本方案代码引用了 27 个宿主模块、14 个 npm 包，明细见 `origin.json`。
