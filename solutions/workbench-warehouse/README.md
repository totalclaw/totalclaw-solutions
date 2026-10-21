# 产销存协同工作台

- id：`workbench-warehouse`
- 分类：产销存
- 类型：workbench
- 入口路由：`/workbenches/warehouse`
- 依赖：`kit-automation-ops`

多源数据归一、销售与库存对账、采购到货、补货调拨和出入库执行。

把 ERP、电商后台与线下台账的多源数据归一后，自动完成销售与库存对账、采购到货核验、补货调拨建议与出入库执行单，差异项逐条留痕、全程可追溯。

## 安装

```bash
npm run tcsol -- install workbench-warehouse
```

qiye-app 中按 id `workbench-warehouse` 或名称「产销存协同工作台」安装；已安装后随方案仓库发布自动升级，用户数据（无本地数据目录）不受影响。

## 宿主依赖

本方案代码引用了 5 个宿主模块、9 个 npm 包，明细见 `origin.json`。
