# 智慧医院运营工作台

- id：`workbench-healthcare`
- 分类：智慧医院
- 类型：workbench
- 入口路由：`/workbenches/healthcare`
- 依赖：`kit-automation-ops`

患者服务、院内工单、隐私保护、服务质量与人工复核，不涉及诊断治疗。

覆盖患者服务应答、院内工单流转与服务质量复核的运营中枢：敏感信息自动脱敏、关键环节强制人工复核，只做运营支撑，不涉及任何诊断与治疗建议。

## 安装

```bash
npm run tcsol -- install workbench-healthcare
```

qiye-app 中按 id `workbench-healthcare` 或名称「智慧医院运营工作台」安装；已安装后随方案仓库发布自动升级，用户数据（无本地数据目录）不受影响。

## 宿主依赖

本方案代码引用了 8 个宿主模块、7 个 npm 包，明细见 `origin.json`。
