# 知识问答助手

- id：`workbench-grounded-qa`
- 分类：知识服务
- 类型：workbench
- 入口路由：`/workbenches/grounded-qa`
- 依赖：`workbench-edu-hub`

只依据已审批的宣教资料回答，每条结论标注来源页码，教法裁决与超纲问题自动拒答并转人工。

导入机构已审批的宣教资料建成知识库，助手只依据其中原文作答并标注来源文件与页码，可点击核对；涉及教法裁决、派别争议或个人宗教处境的问题直接拒答，转交具备资质的学者或内容负责人；资料未覆盖时明确说明依据不足，绝不编造；支持中英阿三语，全过程留痕可审计。

## 安装

```bash
npm run tcsol -- install workbench-grounded-qa
```

qiye-app 中按 id `workbench-grounded-qa` 或名称「知识问答助手」安装；已安装后随方案仓库发布自动升级，用户数据（`grounded-qa/`）不受影响。

## 宿主依赖

本方案代码引用了 7 个宿主模块、6 个 npm 包，明细见 `origin.json`。
