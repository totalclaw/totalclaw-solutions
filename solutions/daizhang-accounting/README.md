# 小微企业代账账务处理

- id：`daizhang-accounting`
- 分类：财税财务
- 类型：pipeline（runner `agent-pipeline`）

面向财税代账公司，按代账行业 SOP 把最耗时的前置环节自动化：资料清单校验 → 单据识别清洗 → 票据合规审查 → 会计凭证生成 → 期末结转与报表 → 账务风险检测 → 纳税申报指引与交付。区分小规模/一般两套科目、分录符合《小企业会计准则》。点「启动」即跳工作流页，7 个环节逐节点真执行、逐个点亮。产出为草稿，须持证会计复核后入账。

## 安装

```bash
npm run tcsol -- install daizhang-accounting
```

运行记录保存在账号目录 `solution-runs.json`（按方案 id 分组），升级不影响。
