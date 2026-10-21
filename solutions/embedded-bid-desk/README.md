# 项目工作台

- id：`embedded-bid-desk`
- 分类：内置
- 类型：workbench
- 入口路由：`/bid-desk`

从 RFQ/BOQ 到审批文件的可追溯业务闭环

从 RFQ / BOQ 导入到技术澄清、成本核算与审批文件产出的完整项目闭环，每个环节的输入输出都可追溯，适合工程项目投标团队日常协作。

## 安装

```bash
npm run tcsol -- install embedded-bid-desk
```

qiye-app 中按 id `embedded-bid-desk` 或名称「项目工作台」安装；已安装后随方案仓库发布自动升级，用户数据（`bid-desk.json`、`bid-desk-demo/`）不受影响。

## 宿主依赖

本方案代码引用了 11 个宿主模块、11 个 npm 包，明细见 `origin.json`。
