# AI 招投标决策数字员工

- id：`workbench-bid-decision`
- 分类：招投标
- 类型：workbench
- 入口路由：`/workbenches/bid-decision`
- 依赖：`kit-saudi-workbench`

多来源标书去重、Addendum 差异、硬性门槛与能力匹配，输出可拍板的 Bid/No-Bid 建议。

汇聚多来源标书并自动去重，比对 Addendum 版本差异，逐条核对硬性门槛与自身能力的匹配度，最终输出可直接拍板的 Bid / No-Bid 建议与风险清单。

## 安装

```bash
npm run tcsol -- install workbench-bid-decision
```

qiye-app 中按 id `workbench-bid-decision` 或名称「AI 招投标决策数字员工」安装；已安装后随方案仓库发布自动升级，用户数据（无本地数据目录）不受影响。

## 宿主依赖

本方案代码引用了 0 个宿主模块、0 个 npm 包，明细见 `origin.json`。
