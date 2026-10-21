# 学术写作智能体

- id：`workbench-academic-writer`
- 分类：学术科研
- 类型：workbench
- 入口路由：`/workbenches/academic-writer`
- 依赖：`workbench-foreign-trade`、`workbench-service-settlement`

内置 PubMed、Europe PMC、arXiv、Crossref、OpenAlex 检索与知网、万方等学术网站，抓取文献、精读、拟提纲、分节成稿，接人机双写编辑器一起改论文。

选题 → 一键检索多个学术库并去重合并，或在内置浏览器打开知网 / 万方 / Google Scholar 抓取当前文献；精读每篇的问题、方法、发现与局限（依据句回摘要核对）；按文献库拟提纲、分节写初稿，引用只许用库里的文献；送进人机双写编辑器由你改；按 GB/T 7714、APA、IEEE 生成参考文献并查验引用；导出 Word / Markdown / BibTeX，可选本机 WPS、Pages 等打开。

## 安装

```bash
npm run tcsol -- install workbench-academic-writer
```

qiye-app 中按 id `workbench-academic-writer` 或名称「学术写作智能体」安装；已安装后随方案仓库发布自动升级，用户数据（`academic-writer/`）不受影响。

## 宿主依赖

本方案代码引用了 11 个宿主模块、5 个 npm 包，明细见 `origin.json`。
