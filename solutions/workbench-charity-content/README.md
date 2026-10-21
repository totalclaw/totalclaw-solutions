# 慈善活动内容工场

- id：`workbench-charity-content`
- 分类：公益传播
- 类型：workbench
- 入口路由：`/workbenches/charity-content`
- 依赖：`workbench-service-settlement`

放进活动照片与视频：自动生成活动档案、中英阿三语报告 PDF 与海报、高保真语音、9:16 宣传短视频，一键完整流程。

视觉模型读图起草活动档案，逐图与视频抽帧生成画面描述，写成中文 / English / العربية 三语活动报告（阿语 RTL 排版）并输出 PDF 与 9:16 海报；报告摘要或任意文字可转成高保真语音；素材剪辑版或 AI 增强版竖版短视频自动配字幕、配音、配乐。

## 安装

```bash
npm run tcsol -- install workbench-charity-content
```

qiye-app 中按 id `workbench-charity-content` 或名称「慈善活动内容工场」安装；已安装后随方案仓库发布自动升级，用户数据（`charity-content/`）不受影响。

## 宿主依赖

本方案代码引用了 31 个宿主模块、12 个 npm 包，明细见 `origin.json`。
