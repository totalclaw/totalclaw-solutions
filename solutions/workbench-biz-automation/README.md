# 经营自动化智能体

- id：`workbench-biz-automation`
- 分类：经营自动化
- 类型：workbench
- 入口路由：`/workbenches/biz-automation`
- 依赖：`workbench-apparel-store`、`workbench-charity-content`、`workbench-digital-human`、`workbench-foreign-trade`、`workbench-service-settlement`

短视频生成并发抖音、快手、小红书、视频号；数字人出镜介绍企业；商品图文自动上下架；收银与财务数据自动取数、统计并推送经营日报。

四个模块：① 从商品库与试穿图一键生成新品上新、一衣多搭、促销等短视频，审核后发布到国内四个平台；② 从知识库取公司资料写讲稿，数字人口播成片并加 AI 生成标识；③ 按平台生成商品主图与标题详情，交给数字员工在网店后台上架，售罄、断码、过季按规则下架或提醒；④ 导入收银、费用数据，按固定口径算营业额、毛利、客单价、连带率、售罄率，模型只写解读，日报定时推送。发布、上架默认停在提交前由人确认，财务数据只读。

## 安装

```bash
npm run tcsol -- install workbench-biz-automation
```

qiye-app 中按 id `workbench-biz-automation` 或名称「经营自动化智能体」安装；已安装后随方案仓库发布自动升级，用户数据（`biz-automation/`）不受影响。

## 宿主依赖

本方案代码引用了 21 个宿主模块、7 个 npm 包，明细见 `origin.json`。
