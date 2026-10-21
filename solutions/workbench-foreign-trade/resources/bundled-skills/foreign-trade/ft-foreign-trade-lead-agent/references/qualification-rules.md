# Lead Qualification Rules

## Formal Lead Minimum

A formal lead must have:

- company name
- public source URL
- business relevance to the user's product
- public contact evidence: email, WhatsApp, phone, or contact form
- source credibility
- no obvious duplicate
- match score >= 60

## Strict Lead Mode

If the user says "必须有关键决策人邮箱和 WhatsApp", "缺一个不要", "严格筛选", or similar:

A formal lead must have:

- purchasing/decision-maker/person email or role-email prefix such as:
  - purchasing
  - procurement
  - sourcing
  - buyer
  - import
  - category
- WhatsApp number
- source URL proving the company/contact evidence

If one is missing, classify as `待验证候选` or `不达标跳过`.

## Contact Priority

- P0: Purchasing Manager, Procurement Manager, Sourcing Manager, Import Manager, Category Manager, Buyer, purchasing/procurement/sourcing role email
- P1: Owner, Founder, CEO, President, Managing Director, General Manager
- P2: Operations Manager, Business Development Manager, Sales Manager, Office Manager
- P3: general info/sales/contact/office email, contact form

## Deduplication

Deduplicate by:

- normalized website domain
- normalized company name
- exact email
- WhatsApp
- phone
- contact page URL

## Evidence Grading

| Grade | Meaning | Use |
|---|---|---|
| A | Official website or official contact page proves company and contact | Formal lead eligible |
| B | B2B/exhibition/association page proves company and contact | Formal lead eligible if contact and fit are strong |
| C | Public company social page proves existence but not contact | Candidate unless other source confirms contact |
| D | Search snippet or weak directory only | Do not use as formal lead |

## Output Status

| Status | Meaning |
|---|---|
| 正式线索 | Passed formal rules |
| 待验证候选 | Real source exists but missing strict contact or fit evidence |
| 不达标跳过 | Missing source, contact, buyer fit, or score |
| 重复已跳过 | Duplicated by domain/company/email/WhatsApp/phone |

## Scoring

- Product relevance: 30
- Customer type fit: 20
- Market/country fit: 15
- Contact completeness: 20
- Source credibility: 15

Return concise scoring explanations based on evidence.
