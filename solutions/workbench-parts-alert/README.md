# 配件预警与补库智能体

- id：`workbench-parts-alert`
- 分类：配件管理
- 类型：workbench
- 入口路由：`/workbenches/parts-alert`
- 依赖：`workbench-service-settlement`

投喂配件历史发货、采购提前期、采购在途和实时库存四类数据，算出每个配件是呆滞、冗余、健康、将缺货还是已缺货，给出处理建议和补库清单，人工检验后转采购订单，并可定时循环运算预警。

五步向导：投喂四类数据 → 运算库存状态 → 检验行动计划（呆滞处理建议、有采购在途和无采购在途两类缺货管控举措）→ 确认补库清单 → 导出采购订单。库存状态、断货日和补库量都由公式算出并附算式，阈值可在规则里调整；补库清单经你确认后才生成采购订单。定时运算会读取指定文件夹里的最新数据并推送预警。

## 安装

```bash
npm run tcsol -- install workbench-parts-alert
```

qiye-app 中按 id `workbench-parts-alert` 或名称「配件预警与补库智能体」安装；已安装后随方案仓库发布自动升级，用户数据（`parts-alert/`）不受影响。

## 宿主依赖

本方案代码引用了 9 个宿主模块、9 个 npm 包，明细见 `origin.json`。
