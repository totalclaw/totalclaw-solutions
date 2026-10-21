---
name: ft-quote-master
description: "外贸技能目录·报价与 HS 编码：列出该类全部外贸技能及用途，按任务挑选后再读具体技能。EN: foreign trade skills index, quotation, pricing, HS code, landed cost"
version: 1.0.0
platforms: [linux, macos, windows]
metadata:
  totalclaw:
    tags: [foreign-trade, quote, index]
    related_skills: [ft-conventions]
    priority: low
    module: quote
    kind: index
---

# 外贸技能目录 · 报价与 HS 编码

外贸技能库里归在「报价与 HS 编码」的技能共 5 个。先按下表挑最贴近任务的一个，读它的 SKILL.md 再做；
几个都相关时先读描述最具体的那个。通用做法（工具替换、发信要人确认、数据落到工作区文件）见 `ft-conventions`。

| 技能 | 用途 |
|---|---|
| `ft-hs-code-classify` | 美国 HTS 十位编码归类：按归类总规则逐级下钻 2→4→6→8→10 位，本地税则树查子目并校验编码，再复核一次，只给候选与理由由人确认。 |
| `ft-hs-code-lookup` | HS2022 六位编码候选检索：关键词查底表、列候选与理由，人工确认并记录后才能写进单据。 |
| `ft-rfq-to-quotation` | 英俄文询盘表转内部中文报价表：动态识别全部列、翻译列头与品名、按 DIN 查表补尺寸（查不到留空）、公式注入净化、黄色报价列。 |
| `ft-tariff-calculator-amazon` | 跨境关税与到岸成本计算：按贸易路线算进口关税、美国 301 附加税、增值税/GST 与到岸成本，附 HS 编码查询脚本。 |
| `ft-tech-drawing` | 工程图纸分析（实验性）：从 PDF 工程图纸提取尺寸、材料、公差等结构化信息，仅供初步参考，不能直接用于生产报价。 |
