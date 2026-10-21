# 研发工作流

- id：`rd-workflow`
- 分类：研发
- 类型：workbench
- 入口路由：`/workbenches/rd-workflow`
- 依赖：`workbench-service-settlement`

客户需求 → AI 产品经理(选项式头脑风暴) → AI 开发(工作区写代码) → 代码评审 → 测试 → 运维，逐节点真执行、实时看状态与文件改动、缺料随时暂停补充。

把一句客户需求变成可交付的项目：AI 产品经理先做选项式头脑风暴与需求澄清，随后 AI 开发在真实工作区写代码，代码评审与测试逐节点把关，全程可暂停补料、实时查看节点状态与文件改动。

## 安装

```bash
npm run tcsol -- install rd-workflow
```

qiye-app 中按 id `rd-workflow` 或名称「研发工作流」安装；已安装后随方案仓库发布自动升级，用户数据（无本地数据目录）不受影响。

## 宿主依赖

本方案代码引用了 6 个宿主模块、8 个 npm 包，明细见 `origin.json`。
