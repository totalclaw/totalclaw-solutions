# 财务智能体

- id：`workbench-finance-agent`
- 分类：财务
- 类型：workbench
- 入口路由：`/workbenches/finance-agent`
- 依赖：`workbench-foreign-trade`、`workbench-service-settlement`

凭证、税务申报、费用报销、往来对账、财务报表、风险巡检、预算、成本、合同审核、财税问答十个智能体，多账套持续跟进。

帮财务做重复、核对、信息提取和预审分析：票据识别生成凭证草稿，税额按规则计算并出申报表草稿与风险预检，报销单按制度预审，往来逐笔对账并出对账函、催款函，报表自动勾稽，全量巡检财税风险，预算与成本自动核算，合同涉税条款审核，财税问题按内置政策库与企业制度作答。不提交申报、不电子签名、不改正式账套，结果由财务人员复核确认。

## 安装

```bash
npm run tcsol -- install workbench-finance-agent
```

qiye-app 中按 id `workbench-finance-agent` 或名称「财务智能体」安装；已安装后随方案仓库发布自动升级，用户数据（`finance-agent/`）不受影响。

## 宿主依赖

本方案代码引用了 13 个宿主模块、7 个 npm 包，明细见 `origin.json`。
