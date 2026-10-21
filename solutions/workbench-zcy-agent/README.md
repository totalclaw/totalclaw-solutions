# 政采云智能体

- id：`workbench-zcy-agent`
- 分类：政府采购
- 类型：workbench
- 入口路由：`/workbenches/zcy-agent`
- 依赖：`workbench-biz-automation`、`workbench-foreign-trade`、`workbench-invoice-agent`、`workbench-service-settlement`

给它企业材料和政采云账号，在内置浏览器里代做供应商的日常工作：商品上架前的合规与比价检查、询价单读回与报价测算、订单接单发货预警、待开票订单转开票。

四个模块：① 账号与材料——密码加密存在本机、只由应用填进登录框，资质到期提醒；② 商品上架——按区划规则查标题、禁用词、图片规格、自营比价链接与售价，数字员工填写后停在「提交审核」前；③ 询价报价——读回待报价的询价单，按成本与毛利率用规则算报价，停在「提交报价」前；④ 订单履约——读回订单，接单与发货时限预警，待开票订单转入发票智能体。各省规则不同，阈值可改；验证码、CA、电子投标不在范围内。

## 安装

```bash
npm run tcsol -- install workbench-zcy-agent
```

qiye-app 中按 id `workbench-zcy-agent` 或名称「政采云智能体」安装；已安装后随方案仓库发布自动升级，用户数据（`zcy-agent/`）不受影响。

## 宿主依赖

本方案代码引用了 9 个宿主模块、6 个 npm 包，明细见 `origin.json`。
