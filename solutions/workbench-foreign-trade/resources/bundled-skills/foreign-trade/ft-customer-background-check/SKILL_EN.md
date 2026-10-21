# Customer Background Check Skill

<!--
This skill is designed for AI Agents to perform customer background checks with complete verification workflows, fallback strategies, and risk assessment.
-->

## Trigger Conditions

The Agent should invoke this skill when any of the following conditions are met:

- User provides customer information (name, email, phone, company, country, etc.)
- User explicitly requests "background check", "due diligence", or "背调"
- User provides batch customer Excel/CSV files for verification
- User inquires about customer credibility or risk assessment

## Input Format

### Single Customer

```json
{
  "name": "Customer Name",
  "email": "customer@email.com",
  "phone": "+1-234-567-8900 (with country code)",
  "company": "Company Name",
  "country": "Country Name",
  "products": ["Product 1", "Product 2"],
  "order_amount": "Intended order amount (optional)"
}
```

### Batch Customers

Excel/CSV file containing columns:
- name, email, phone, company, country, products, order_amount

---

## Weight System

| Dimension | Weight | Description |
|-----------|--------|-------------|
| Basic Verification | 15% | Verify contact information validity |
| Company Lookup | 20% | Confirm company existence and status |
| Personnel Association | 20% | Verify customer-company relationship |
| Digital Assets | 15% | Verify company online presence |
| Customs Trade | 20% | Verify real procurement history ⭐ |
| Business Verification | 10% | Assess business rationality |

---

## Execution Workflow

### Phase 0: Preprocessing

**Objective**: Standardize input information, infer missing fields

**Steps**:
1. Parse input information, extract key fields
2. Infer company name from email domain (if missing)
3. Infer country from phone code (if missing)
4. Determine customer type (purchaser/trader/individual)

**Output**:
```json
{
  "normalized_customer": {...},
  "inferred_fields": ["company", "country"],
  "customer_type": "purchaser"
}
```

---

### Phase 1: Basic Verification - Weight 15%

#### 1.1 Email Verification

| Level | Method | Confidence Coefficient |
|-------|--------|------------------------|
| **Primary** | Use `nslookup -type=MX {domain}` to verify MX record | 1.0 |
| **Fallback 1** | Use Python `dnspython` library | 0.8 |
| **Fallback 2** | Regex validation of email format | 0.5 |
| **Last Resort** | Mark "MX not verified", continue to next item | 0.0 |

**Verification Content**:
- MX record existence
- Email type determination (corporate/personal/temporary)
- Domain-company name match level

**Output Example**:
```
Email Verification Result:
- MX Record: ✅ Exists (Confidence: 1.0)
- Email Type: Corporate (company.com)
- Domain Match: ⚠️ Partial match
- Sub-item Score: 85/100
```

#### 1.2 Phone Verification

| Level | Method | Confidence Coefficient |
|-------|--------|------------------------|
| **Primary** | Use Python `phonenumbers` library | 1.0 |
| **Fallback 1** | Regex match for country format | 0.6 |
| **Fallback 2** | Only verify number length and code | 0.4 |
| **Last Resort** | Mark "format not verified" | 0.0 |

**Verification Content**:
- Phone format validity
- Code and claimed country match
- Number type (mobile/landline)

---

### Phase 2: Company Lookup - Weight 20%

#### 2.1 Company Registry Query

| Level | Method | Confidence Coefficient |
|-------|--------|------------------------|
| **Primary** | WebFetch official registry website | 1.0 |
| **Fallback 1** | WebSearch "company name + country + company register" | 0.6 |
| **Fallback 2** | Python script calling third-party API | 0.8 |
| **Last Resort** | Mark "pending manual verification", request registration number | 0.0 |

**Query Content**:
- Company registration status (Active/Dissolved/Liquidated)
- Registration date (determine company age)
- Registered address (compare with claimed address)
- Company type (Limited/LLC/Sole Trader, etc.)

**Country Data Source Mapping** (see `data-sources_EN.md`):
- UK: Companies House
- USA: Secretary of State (by state)
- Germany: Handelsregister
- France: societe.com
- ...more in data source configuration

#### 2.2 Company Status Verification

**Risk Signal Detection**:
| Status | Risk Level | Description |
|--------|------------|-------------|
| Active | ✅ Low | Company operating normally |
| Dissolved | ❌ High | Company deregistered |
| Liquidation | ❌ High | Company in liquidation |
| Dormant | ⚠️ Medium | Company dormant |

---

### Phase 3: Personnel Association - Weight 20%

#### 3.1 Director/Shareholder Query

| Level | Method | Confidence Coefficient |
|-------|--------|------------------------|
| **Primary** | WebFetch official director database | 1.0 |
| **Fallback 1** | WebSearch "name + director + company" | 0.5 |
| **Fallback 2** | LinkedIn search name + company position | 0.4 |
| **Last Resort** | Mark "pending customer proof", request proof of position | 0.0 |

**Verification Content**:
- Whether customer name appears in director/shareholder list
- Position status (active/resigned)
- Appointment date
- Associated companies (same director's other positions)

**Name Matching Rules**:
```
Matching Methods:
1. Exact match: "John Smith" = "John Smith"
2. Abbreviation match: "J. Smith" ≈ "John Smith"
3. Multilingual match: "张伟" ≈ "Zhang Wei" ≈ "W. Zhang"
4. Fuzzy match: Use text similarity algorithm (threshold 0.8)
```

---

### Phase 4: Digital Assets - Weight 15%

#### 4.1 Website Verification

| Level | Method | Confidence Coefficient |
|-------|--------|------------------------|
| **Primary** | WebFetch official website to get content | 1.0 |
| **Fallback 1** | WebSearch company domain | 0.5 |
| **Fallback 2** | DNS query for A record | 0.3 |
| **Last Resort** | Mark "no website" | 0.0 |

**Verification Content**:
- Website accessibility
- Website content relevance to company business
- Website existence time (via Wayback Machine)
- SSL certificate validity

#### 4.2 Social Media Verification

| Platform | Query Method | Verification Content |
|----------|--------------|----------------------|
| LinkedIn | WebFetch company page | Employee count, company intro, recent activity |
| Facebook | WebFetch company page | Followers, engagement, founding time |
| Instagram | WebFetch company page | Product showcase, activity level |

#### 4.3 E-commerce Platform Verification

Applicable for trader/retailer customers:
- Amazon store verification
- eBay store verification
- Alibaba store verification

---

### Phase 5: Customs Trade Verification - Weight 20% ⭐

> **Importance Note**: Customs data is a key indicator for verifying customer's real procurement capability, revealing actual import history, supplier relationships, and procurement scale.

#### 5.1 Import Records Query

| Level | Method | Confidence Coefficient |
|-------|--------|------------------------|
| **Primary** | ImportGenius/Panjiva search company name | 1.0 |
| **Fallback 1** | Tradesparq free customs data query | 0.7 |
| **Fallback 2** | WebSearch "company name + import + product" | 0.4 |
| **Last Resort** | Mark "no customs data" (doesn't affect other dimensions) | N/A |

**Query Content**:
- Import record count and time distribution
- Main import product categories (HS codes)
- Main supplier countries
- Annual import amount estimation

#### 5.2 Supplier Relationship Analysis

Extract from customs data:
- Existing supplier list
- Supplier countries
- Cooperation duration with each supplier
- Procurement frequency analysis

#### 5.3 Import Category Matching

Compare customer's interested products with import categories in customs records:
- Exact match: Imported same category products
- Related match: Imported related categories
- No match: No relevant import records

#### 5.4 Customs Data Special Handling

```
When customs data dimension result is "no data":
1. This dimension does not participate in score calculation
2. Weight redistributed to other dimensions:
   - Basic Verification: 15% → 18%
   - Company Lookup: 20% → 24%
   - Personnel Association: 20% → 24%
   - Digital Assets: 15% → 18%
   - Business Verification: 10% → 16%
   - Total: 100%

Note: No customs data ≠ risk, only indicates no import records
```

---

### Phase 6: Business Verification - Weight 10%

#### 6.1 Procurement Volume Rationality Analysis

**Verification Logic**:
```
if procurement/company_employees > industry_avg × 3:
    Mark "abnormal procurement volume"
elif procurement/company_employees > industry_avg × 2:
    Mark "high procurement volume"
else:
    Mark "reasonable procurement volume"
```

**Risk Signals**:
| Scenario | Risk Level | Description |
|----------|------------|-------------|
| New company (≤1 year) + large order | ❌ High | Possible shell company |
| Small company + extra large order | ⚠️ Medium | Need to verify payment capability |
| Established company + reasonable order | ✅ Low | Normal business need |

#### 6.2 Product Matching Analysis

Verify if customer's interested products match company business:
- Analyze company main business via website content
- Analyze import categories via customs data
- Calculate product matching score

#### 6.3 Risk Signal Detection

**Anomaly Pattern Detection**:
- [ ] Company age < 1 year
- [ ] Registered address is residential/virtual office
- [ ] No corporate email (using Gmail/Yahoo, etc.)
- [ ] Procurement volume doesn't match company scale
- [ ] Interested products not related to company business
- [ ] Refuses to provide company registration information

---

### Phase 7: Final Assessment

#### 7.1 Score Calculation

```
Total Score = Σ (Dimension Score × Dimension Weight)

Dimension Score = Σ (Sub-item Score × Confidence Coefficient) / Sub-item Count

Confidence Coefficient:
- Primary method success: 1.0
- Fallback 1 success: 0.8
- Fallback 2 success: 0.6
- Last resort: 0.3
- Complete failure: 0.0
```

#### 7.2 Risk Level Determination

| Score Range | Risk Level | Symbol |
|-------------|------------|--------|
| 80-100 | Low Risk | ✅ |
| 50-79 | Medium Risk | ⚠️ |
| 20-49 | Unverifiable | ⚠️ |
| 0-19 | High Risk | ❌ |

#### 7.3 Generate Risk Control Recommendations

Based on risk level, extract corresponding strategies from `risk-strategies_EN.md`:
- Payment method recommendations
- Shipping strategy recommendations
- Contract clause recommendations

---

## Output Format

### Background Check Report Structure

```markdown
# Customer Background Check Report

## Basic Information
- Customer Name: [Name]
- Company: [Company Name]
- Country: [Country]
- Contact: [Email] / [Phone]

## Score Overview

| Dimension | Score | Weight | Weighted Score | Method |
|-----------|-------|--------|----------------|--------|
| Basic Verification | XX/100 | 15% | XX | Primary |
| Company Lookup | XX/100 | 20% | XX | Fallback 1 |
| Personnel Association | XX/100 | 20% | XX | Primary |
| Digital Assets | XX/100 | 15% | XX | Primary |
| Customs Trade | XX/100 | 20% | XX | Fallback 2 |
| Business Verification | XX/100 | 10% | XX | Primary |

**Total Score**: XX/100
**Risk Level**: ✅ Low Risk / ⚠️ Medium Risk / ❌ High Risk

## Detailed Verification Results

### Phase 1: Basic Verification
[Details]

### Phase 2: Company Lookup
[Details]

### Phase 3: Personnel Association
[Details]

### Phase 4: Digital Assets
[Details]

### Phase 5: Customs Trade
[Details]

### Phase 6: Business Verification
[Details]

## Risk Control Recommendations
[Specific recommendations based on risk level]

## Items Pending Verification
[Items requiring manual verification or customer-provided proof]

---
Report Time: [Time]
Tool Version: v1.2
```

---

## Error Handling

### Common Errors and Handling Methods

| Error Type | Handling Method |
|------------|-----------------|
| WebFetch blocked | Automatically execute fallback method |
| WebSearch no results | Try different keyword combinations |
| Python script execution failure | Fall back to manual verification logic |
| Data source inaccessible | Mark "data source unavailable", use other sources |
| Insufficient information | Mark "pending verification", request supplementary materials |

### Fallback Flowchart

```
Verification Step Start
    ↓
Try Primary Method
    ↓
Success? ──Yes──→ Record Result (Confidence: High) → Next Phase
    │
    No
    ↓
Try Fallback 1
    ↓
Success? ──Yes──→ Record Result (Confidence: Medium) → Next Phase
    │
    No
    ↓
Try Fallback 2
    ↓
Success? ──Yes──→ Record Result (Confidence: Low) → Next Phase
    │
    No
    ↓
Execute Last Resort → Mark Dimension Status → Continue Next Phase
```

---

## Related Documents

| Document | Description |
|----------|-------------|
| `execution-guide_EN.md` | Detailed execution guide and fallback matrix |
| `risk-strategies_EN.md` | Risk control strategies and recommendations |
| `data-sources_EN.md` | Global data source configuration |
| `templates/report-template.md` | Background check report template |
| `cases/示例背调案例.md` | Real case reference |

---

## Version Info

- Version: v1.2
- Update Date: 2026-04-18
- Major Updates:
  - Customs Trade Verification as independent dimension (weight 20%)
  - Complete fallback strategy matrix
  - Global major market data source coverage
  - Quantified confidence scoring system
