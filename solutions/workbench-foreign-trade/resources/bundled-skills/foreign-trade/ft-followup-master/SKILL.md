---
name: ft-followup-master
description: "外贸技能目录·客户跟进：列出该类全部外贸技能及用途，按任务挑选后再读具体技能。EN: foreign trade skills index, follow-up, outreach sequence, unsubscribe"
version: 1.0.0
platforms: [linux, macos, windows]
metadata:
  totalclaw:
    tags: [foreign-trade, followup, index]
    related_skills: [ft-conventions]
    priority: low
    module: followup
    kind: index
---

# 外贸技能目录 · 客户跟进

外贸技能库里归在「客户跟进」的技能共 8 个。先按下表挑最贴近任务的一个，读它的 SKILL.md 再做；
几个都相关时先读描述最具体的那个。通用做法（工具替换、发信要人确认、数据落到工作区文件）见 `ft-conventions`。

| 技能 | 用途 |
|---|---|
| `ft-customer-mgmt` | 客户档案与分级管理：A / B / C 分级规则、客户详情与资料库关联、CSV 批量导入去重，档案落在工作区文件。 |
| `ft-daily-followup-review` | 定时跟进巡检：读跟进计划与真实邮件线程，已回复、退订、自动回复的停催，到期项出跟进草稿过发信闸门，每次最多 20 项，巡检本身不发送。 |
| `ft-objection-handling` | 回复中的异议处理：LAARC 框架、预算/权限/需求/时机四类话术、先辨真假异议，以及退订与投诉的硬底线。 |
| `ft-outbound-send-gate` | 发信前确定性闸门：收件人可信度、未替换变量、禁用词、链接数、退订句、抑制名单、审批 hash、每日额度、退信熔断，开发信、跟进与回复发送前逐项检查。 |
| `ft-sales-methodology` | 销售方法论：找客户到约会议的循环、多渠道触达节奏、回复转会议流程、语气校准、任务优先级、指标与合规底线。 |
| `ft-sales-pipeline` | 销售管线策略：客户旅程五阶段动作映射、30 天跟进时间表、KPI 追踪与客户状态分层优化。 |
| `ft-smtp-email` | 开发信、报价邮件发出前的预览与草稿交付：逐封预览收件人与正文、SPF / DKIM / DMARC 送达检查、SMTP 报错码解读，发送一律在外贸工作台由人确认。 |
| `ft-trade-follow-up` | 依据客户证据写开发与跟进草稿，按授权范围、抑制名单和额度检查后由人确认发送；结果不确定不重发，已回复或退订即停，跟进计划不可复活。 |
