---
name: ft-order-master
description: "外贸技能目录·订单推进与单证：列出该类全部外贸技能及用途，按任务挑选后再读具体技能。EN: foreign trade skills index, order, proforma invoice, commercial invoice, packing list, customs"
version: 1.0.0
platforms: [linux, macos, windows]
metadata:
  totalclaw:
    tags: [foreign-trade, order, index]
    related_skills: [ft-conventions]
    priority: low
    module: order
    kind: index
---

# 外贸技能目录 · 订单推进与单证

外贸技能库里归在「订单推进与单证」的技能共 7 个。先按下表挑最贴近任务的一个，读它的 SKILL.md 再做；
几个都相关时先读描述最具体的那个。通用做法（工具替换、发信要人确认、数据落到工作区文件）见 `ft-conventions`。

| 技能 | 用途 |
|---|---|
| `ft-customs-declaration-tools` | 经关务后端连接器查报关单状态与详情、通关全流程、船舶船期与舱单、税则、两用物项，提交 AI 制单；需服务方提供后端地址、签名密钥与身份绑定。 |
| `ft-doc-generation` | 外贸单证生成：报价单、形式发票、合同、商业提案等 DOCX / XLSX / PPTX 文档的结构与排版规范，金额由规则或脚本算好再填。 |
| `ft-document` | 外贸单据分析：完整读取报价单、合同、PI、装箱单等单据，抽取价格、条款、规格，每个数字标注来源单元格或行号，不改精度不换算。 |
| `ft-trade-docs-init` | 外贸单据管线首次配置：对话收集出单公司、贸易条件、币种、装运港、付款条件、收款银行和首个客户，写入工作区配置文件。 |
| `ft-trade-docs-run` | 询价单 Excel 一键出报价单、PI、CI、装箱单，填价后回写重出；金额、装箱、生成前检查由附带 Python 包计算。 |
| `ft-trade-ops` | 外贸履约与售后沟通：催款、索赔、验厂、样品跟进、物流异常、售后维护、节日问候与满意度调查的邮件与处理要点。 |
| `ft-verify-trade-docs` | CI 与装箱单交叉核验：按序号或品名规格对齐，逐项比对数量、单价、净毛重、合计与金额大写，代码重算合计，输出 Markdown 差异报告。 |
