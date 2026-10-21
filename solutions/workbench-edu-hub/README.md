# AI 学习中心（文档生成教案）

- id：`workbench-edu-hub`
- 分类：教育
- 类型：workbench
- 入口路由：`/workbenches/edu-hub`
- 依赖：`workbench-digital-human`、`workbench-quran-teaching`

导入教材一键生成教案、学生要点与小测；启动校内服务，学生扫码用浏览器学习，进展实时回看。

上传 Word 或 PDF 教材，AI 自动拆分课时并生成教案、学生要点与随堂小测，支持中、英、阿三语切换；一键启动校内服务后，学生扫码即可在浏览器里学习，教师端实时回看每个学生的进展与答题情况。

## 安装

```bash
npm run tcsol -- install workbench-edu-hub
```

qiye-app 中按 id `workbench-edu-hub` 或名称「AI 学习中心（文档生成教案）」安装；已安装后随方案仓库发布自动升级，用户数据（`edu-hub/`）不受影响。

## 宿主依赖

本方案代码引用了 15 个宿主模块、16 个 npm 包，明细见 `origin.json`。
