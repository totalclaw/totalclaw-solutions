# 外贸业务智能体

- id：`workbench-foreign-trade`
- 分类：外贸
- 类型：workbench
- 入口路由：`/workbenches/foreign-trade`
- 依赖：`workbench-bid-writer`、`workbench-service-settlement`

多邮箱接管，覆盖平台运营、客户开发、询盘处理、客户背调、跟进、内容生产、网站社媒、报价、订单推进与数据整理十项日常工作。

同时接管多个业务邮箱，新询盘自动整理分类、可按规则自动回复；客户背调与潜客开发带来源可核对；产品素材（文案、图片、视频）一键生成，交给数字员工在平台发布；报价按规则计算、审批后发出；订单节点与单据一致性自动核对；日报周报定时推送。每个模块可单独指定使用的模型。

## 安装

```bash
npm run tcsol -- install workbench-foreign-trade
```

qiye-app 中按 id `workbench-foreign-trade` 或名称「外贸业务智能体」安装；已安装后随方案仓库发布自动升级，用户数据（`foreign-trade/`）不受影响。

## 宿主依赖

本方案代码引用了 18 个宿主模块、15 个 npm 包，明细见 `origin.json`。
