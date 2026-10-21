# 发票智能体

- id：`workbench-invoice-agent`
- 分类：财税
- 类型：workbench
- 入口路由：`/workbenches/invoice-agent`
- 依赖：`workbench-service-settlement`

拿着付款单或一张开票申请表（很多行、很多家购买方）批量开票：自动识别列、逐行校验税号与金额、按规则组票拆票算税，生成电子税务局批量导入文件或由数字员工逐张填写，台账自动回填发票号码。

七步向导：销售方与通道 → 导入付款单或表格（付款回单由模型读出后回原文核对）→ 逐行校验（税号校验位、同名不同税号、数量 × 单价 ≠ 金额、疑似重复开票）→ 税收分类编码 → 组票拆票并确认 → 开具 → 回填号码。金额与税额按分做整数运算，模型不算钱；登录、扫脸、验证码由你本人完成，系统与数字员工都停在「发票开具」按钮前。

## 安装

```bash
npm run tcsol -- install workbench-invoice-agent
```

qiye-app 中按 id `workbench-invoice-agent` 或名称「发票智能体」安装；已安装后随方案仓库发布自动升级，用户数据（`invoice-agent/`）不受影响。

## 宿主依赖

本方案代码引用了 12 个宿主模块、8 个 npm 包，明细见 `origin.json`。
