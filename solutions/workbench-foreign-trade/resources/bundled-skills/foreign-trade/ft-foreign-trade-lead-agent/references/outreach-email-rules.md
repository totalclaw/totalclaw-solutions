# Outreach Email Rules

Generate personalized English cold emails for human review.

## Inputs

Use:

- customer table
- company website/source facts
- customer analysis
- user's product description
- product image analysis if provided
- factory/product facts provided by the user

## Do

- Write one different email per customer.
- Personalize by business type, product category, country, and verified source facts.
- Keep it short: 80-160 words.
- Use simple business English.
- Offer catalog, quote, samples, OEM/private label, packaging, or product range only if relevant.
- Include unsubscribe copy.

## Do Not

- Do not invent certifications, capacity, prices, customers, factories, or case studies.
- Do not claim a relationship.
- Do not say the customer is looking for suppliers unless the source says so.
- Do not auto-send.

## Greeting Rules

- Real name exists: `Hi {FirstName},`
- Role email: `Hi Purchasing Team,`
- General email: `Hi Team,`
- No email but WhatsApp: do not write an email; output WhatsApp touch suggestion.

## Output Table

| 序号 | 公司名称 | 联系人 | 邮箱 | 邮件主题 | 邮件正文 | 个性化依据 | 风险提示 | 推荐发送时间 | 状态 |
|---:|---|---|---|---|---|---|---|---|---|

## Batch Size

- Up to 20 contacts: generate all drafts in one table.
- 21-100 contacts: split into batches of 20.
- More than 100 contacts: ask whether to continue after the first 100.

## Personalization Angles

| Customer Type | Angle |
|---|---|
| Importer | stable supply, export documents, container/bulk capability |
| Wholesaler | wholesale pricing, MOQ, packaging, product range |
| Distributor | category fit, regional supply, OEM/private label |
| Retailer | retail packaging, trial order, shelf-ready styles |
| E-commerce seller | fast sampling, variants, packaging, marketplace-friendly specs |
| Hotel/Hospitality supplier | durability, replenishment, bulk supply |
| Promotional gift company | logo customization, packaging, sample turnaround |

## Subject Line Patterns

- `{Product} supply options for {Company}`
- `OEM {Product} options for your {Category} range`
- `Quick question about your {Category} sourcing`
- `{Product} catalog and sample options`

## Follow-up Email

If the user asks for follow-up:

- Mention the previous email lightly.
- Add one new value point.
- Ask a low-friction question.
- Do not pressure.
