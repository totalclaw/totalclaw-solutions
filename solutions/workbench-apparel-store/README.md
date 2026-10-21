# 服装实体店智能体

- id：`workbench-apparel-store`
- 分类：服装零售
- 类型：workbench
- 入口路由：`/workbenches/apparel-store`
- 依赖：`workbench-bid-writer`、`workbench-foreign-trade`、`workbench-service-settlement`

AI 一键换装：顾客手机扫码或店员电脑上传照片，自选背景、姿势、发型生成试穿图，手机电脑同时查看；试穿码到店核销，试穿数据看板指导主推款。

七步固定流程：选衣服（AI 自动打标签）→ 顾客照片与授权 → AI 形象分析推荐造型 → 选背景（30 项）/ 姿势（20 项）/ 发型（25 项）及细分场景 → AI 合成试穿图 → 手机与电脑同时查看、带门店名与试穿码保存 → 到店凭码试实物（尺码助手提前备货）。门店手机端是店内 Wi-Fi 下的网页，不需要小程序与试衣镜；照片只存在门店电脑，到期自动删除，顾客可随时一键删除。

## 安装

```bash
npm run tcsol -- install workbench-apparel-store
```

qiye-app 中按 id `workbench-apparel-store` 或名称「服装实体店智能体」安装；已安装后随方案仓库发布自动升级，用户数据（`apparel-store/`）不受影响。

## 宿主依赖

本方案代码引用了 11 个宿主模块、8 个 npm 包，明细见 `origin.json`。
