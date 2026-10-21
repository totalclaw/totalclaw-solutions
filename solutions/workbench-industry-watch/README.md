# 盘面情报台

- id：`workbench-industry-watch`
- 分类：24 小时情报
- 类型：workbench
- 入口路由：`/industry-watch`

加密与美股 7×24 情报流：gate.io 行情异动与多源新闻快讯同一条时间线，每条可回溯原文，随时 AI 研判。

市场不收盘，情报也不该等早报。gate.io 加密现货与美股 / 指数永续行情按确定性规则推导异动、触及高低点、极端资金费率、大额强平，新浪 7×24、财联社、华尔街见闻、CoinDesk、Cointelegraph 快讯并入同一条 24 小时时间线；按时间窗、类型、市场、自选筛选（美股带盘前 / 盘中 / 盘后 / 休市盘态），每条可打开原文核验，任何时刻一键 AI 研判当前窗口。

## 安装

```bash
npm run tcsol -- install workbench-industry-watch
```

qiye-app 中按 id `workbench-industry-watch` 或名称「盘面情报台」安装；已安装后随方案仓库发布自动升级，用户数据（无本地数据目录）不受影响。

## 宿主依赖

本方案代码引用了 4 个宿主模块、3 个 npm 包，明细见 `origin.json`。
