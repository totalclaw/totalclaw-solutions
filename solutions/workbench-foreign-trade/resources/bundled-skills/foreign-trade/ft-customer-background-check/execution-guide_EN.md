# Execution Guide

This document provides detailed execution specifications, fallback strategy matrices, and confidence calculation methods for Agents performing customer background checks.

---

## I. Core Principles

**Every weighted verification dimension must have complete verification steps and fallback strategies.**

### Fallback Strategy Principles

1. **Never Block**: Any verification failure should not prevent the overall process from continuing
2. **Record Status**: The execution method and result of each step must be recorded
3. **Quantify Confidence**: Reflect data reliability through confidence coefficients
4. **Traceable**: Every judgment has clear evidence and sources

---

## II. Fallback Strategy Matrix

### Phase 1: Basic Verification - Weight 15%

#### 1.1 Email MX Verification

| Level | Method | Confidence | Failure Condition |
|-------|--------|------------|-------------------|
| **Primary** | `nslookup -type=MX {domain}` | 1.0 | Command execution fails/no return |
| **Fallback 1** | Python `dnspython` library | 0.8 | Library not installed/network error |
| **Fallback 2** | Regex validate email format | 0.5 | Format mismatch |
| **Last Resort** | Mark "MX not verified" | 0.0 | - |

**Command Example**:
```bash
# Primary method
nslookup -type=MX company.com

# Expected output contains:
# company.com MX preference = 10, mail exchanger = mail.company.com
```

**Logic**:
```
if MX record exists:
    confidence = 1.0
    check if domain is in personal email list
    if in personal email list:
        email_type = "Personal Email"
    else:
        email_type = "Corporate Email"
        check domain-company name match
else:
    execute fallback method
```

#### 1.2 Email Type Determination

| Email Type | Criteria | Example |
|------------|----------|---------|
| Corporate | Domain matches company website, not in personal list | name@company.com |
| Personal | Domain in personal email list | name@gmail.com |
| Temporary | Domain in temporary email list | name@tempmail.com |
| Pending | Cannot determine clearly | name@unknown-domain.com |

**Personal Email Domain List** (see `data/personal_email_domains.txt`):
- gmail.com, yahoo.com, hotmail.com, outlook.com, live.com
- aol.com, icloud.com, mail.com, yandex.com, qq.com, 163.com, 126.com

#### 1.3 Phone Format Verification

| Level | Method | Confidence | Failure Condition |
|-------|--------|------------|-------------------|
| **Primary** | Python `phonenumbers` library | 1.0 | Library not installed/parsing fails |
| **Fallback 1** | Regex match country format | 0.6 | Format mismatch |
| **Fallback 2** | Only verify number length and code | 0.4 | Abnormal length |
| **Last Resort** | Mark "format not verified" | 0.0 | - |

**Code Example**:
```python
import phonenumbers

# Parse phone number
phone = "+44 20 7946 0958"
parsed = phonenumbers.parse(phone, None)

# Validate
is_valid = phonenumbers.is_valid_number(parsed)
# Get country
region = phonenumbers.region_code_for_number(parsed)  # GB
```

#### 1.4 Phone Country Matching

| Match Result | Description | Risk Signal |
|--------------|-------------|-------------|
| Exact Match | Area code matches claimed country | None |
| Mismatch | Area code doesn't match claimed country | ⚠️ Needs verification |
| Undetermined | Cannot parse area code | Pending |

---

### Phase 2: Company Lookup - Weight 20%

#### 2.1 Company Registry Query

| Level | Method | Confidence | Failure Condition |
|-------|--------|------------|-------------------|
| **Primary** | WebFetch official registry | 1.0 | Website blocked/inaccessible |
| **Fallback 1** | WebSearch | 0.6 | No search results |
| **Fallback 2** | Python script API call | 0.8 | API unavailable |
| **Last Resort** | Mark "pending manual verification" | 0.0 | - |

**Country-Data Source Mapping**:

| Country | Official Source | Query URL Format |
|---------|-----------------|------------------|
| UK | Companies House | `https://find-and-update.company-information.service.gov.uk/company/{company_number}` |
| USA | Secretary of State | Varies by state, e.g., CA: `https://businesssearch.sos.ca.gov/` |
| Germany | Handelsregister | `https://www.unternehmensregister.de/` |
| France | societe.com | `https://www.societe.com/` |
| Australia | ASIC | `https://connectonline.asic.gov.au/` |

**WebFetch Example**:
```
Steps:
1. Identify customer country
2. Query data-sources_EN.md for corresponding official source
3. Try WebFetch access
4. Extract company information from page

Example query (UK):
WebFetch URL: https://find-and-update.company-information.service.gov.uk/company/12345678
Extract info:
- Company name
- Company status (Active/Dissolved)
- Registered address
- Incorporation date
- Director list
```

#### 2.2 Company Status Verification

| Status | Risk Level | Description |
|--------|------------|-------------|
| Active | ✅ Low | Company operating normally |
| Dissolved | ❌ High | Company deregistered, cannot cooperate |
| Liquidation | ❌ High | Company in liquidation |
| Dormant | ⚠️ Medium | Company dormant, no business activity |
| In Administration | ❌ High | Company under administration |

#### 2.3 Registered Address Comparison

**Comparison Logic**:
```
Address Match = Text Similarity(Claimed Address, Registered Address)

if match > 0.8:
    result = "Address matches"
elif match > 0.5:
    result = "Address partially matches"
else:
    result = "Address mismatch" ⚠️ Risk signal
```

**Risky Address Types**:
- Residential address (need to determine if home office)
- Virtual office (Regus, WeWork, etc.)
- Registered agent address
- PO Box address

---

### Phase 3: Personnel Association - Weight 20%

#### 3.1 Director Record Query

| Level | Method | Confidence | Failure Condition |
|-------|--------|------------|-------------------|
| **Primary** | WebFetch official director database | 1.0 | No director database/website blocked |
| **Fallback 1** | WebSearch | 0.5 | No search results |
| **Fallback 2** | LinkedIn search | 0.4 | No matching results |
| **Last Resort** | Mark "pending customer proof" | 0.0 | - |

**Countries with Official Director Database**:
- UK: Companies House (free and public)
- Australia: ASIC
- New Zealand: Companies Office
- Hong Kong: Companies Registry
- Singapore: ACRA

#### 3.2 Name Matching Rules

```
Matching Algorithm:
1. Normalization:
   - Convert to lowercase
   - Remove punctuation
   - Expand abbreviations (J. → John)

2. Matching Methods:
   a. Exact match: "john smith" = "john smith" (score=100)
   b. Contains match: "john smith" contains "john" (score=80)
   c. Initial match: "j smith" matches "john smith" (score=70)
   d. Fuzzy match: Edit distance/cosine similarity (score=similarity×100)

3. Multilingual Handling:
   - Chinese name: 张伟
   - Pinyin: Zhang Wei / W. Zhang
   - English name: David Zhang
   Use pinyin conversion library for matching
```

#### 3.3 Position Status Confirmation

| Status | Description | Determination |
|--------|-------------|---------------|
| Active | Currently serving as director | Database status is Active |
| Resigned | Previously served as director | Database has historical record, status is Resigned |
| Unknown | Cannot confirm | Database has no status field |

---

### Phase 4: Digital Assets - Weight 15%

#### 4.1 Company Website Verification

| Level | Method | Confidence | Failure Condition |
|-------|--------|------------|-------------------|
| **Primary** | WebFetch official website | 1.0 | Website doesn't exist/inaccessible |
| **Fallback 1** | WebSearch domain | 0.5 | No search results |
| **Fallback 2** | DNS query A record | 0.3 | No DNS record |
| **Last Resort** | Mark "no website" | 0.0 | - |

**DNS Query Commands**:
```bash
# Query A record
nslookup company.com

# Query domain registration info
whois company.com
```

**Website Verification Content**:
- Website accessibility
- Website content relevance to company business
- Company name appears on website
- SSL certificate validity
- Website history (via Wayback Machine)

#### 4.2 Social Media Verification

| Platform | Query Method | Key Verification Points |
|----------|--------------|-------------------------|
| LinkedIn | WebFetch company page | Employee count, company size, industry |
| Facebook | WebFetch company page | Followers, creation time, engagement |
| Instagram | WebFetch company page | Product showcase, activity level |

**Logic**:
```
LinkedIn Verification:
- Search: "{Company Name} LinkedIn"
- Verify: Company name match + reasonable employee count
- Risk signals: No company page / employee count doesn't match claimed size

Social Media Presence Score:
- 3 platforms: Full score
- 2 platforms: 80%
- 1 platform: 60%
- None: 40% or mark "no social media presence"
```

#### 4.3 E-commerce Platform Verification

**Applicable Scenarios**: Customer is a trader/retailer

| Platform | Query Method | Verification Content |
|----------|--------------|----------------------|
| Amazon | Search store name | Store rating, product count, store age |
| eBay | Search store name | Seller rating, transaction history |
| Alibaba | Search company name | Store tenure, response rate |

---

### Phase 5: Customs Trade Verification - Weight 20% ⭐

#### 5.1 Import Records Query

| Level | Method | Confidence | Failure Condition |
|-------|--------|------------|-------------------|
| **Primary** | ImportGenius/Panjiva search | 1.0 | Requires paid account/no records |
| **Fallback 1** | Tradesparq query | 0.7 | No records |
| **Fallback 2** | WebSearch | 0.4 | No search results |
| **Last Resort** | Mark "no customs data" | N/A | - |

**Customs Data Platform Features**:

| Platform | Cost | Coverage | Data Type |
|----------|------|----------|-----------|
| ImportGenius | Paid | Global | Importers, suppliers, HS codes |
| Panjiva | Paid | US-focused | US import bill of lading data |
| Tradesparq | Free/Paid | Global | Customs data + B2B |
| Datamyne | Paid | Asia | Asian trade data |

**Query Example**:
```
Steps:
1. Search company name (exact or fuzzy match)
2. Filter by country/region
3. Extract info:
   - Import record count
   - Main import products (HS codes)
   - Main supplier countries
   - Import frequency

Output:
{
  "total_imports": 156,
  "date_range": "2022-01 to 2025-03",
  "top_products": ["Electronics", "Machinery"],
  "top_supplier_countries": ["China", "Vietnam"],
  "estimated_annual_value": "$500K-$1M"
}
```

#### 5.2 Customs Data Special Handling

```
When customs data dimension result is "no data":

Logic:
if company_business_type == "Importer" and no customs data:
    # May be new importer or data not covered
    Mark = "No customs record (pending business type confirmation)"
    Confidence impact = Moderate

elif company_business_type == "Retailer/Service Provider":
    # These companies typically have no import records
    Mark = "Non-importer, no customs data expected"
    Confidence impact = None

Weight redistribution:
In either case, when customs data is "no data":
- This dimension weight is redistributed to other 5 dimensions
- Does not affect other dimension scores
```

#### 5.3 Import Category Matching

```
Matching Process:
1. Get customer's interested products list
2. Get HS codes/product descriptions from customs records
3. Calculate match rate

Match Rate = Matched Products / Total Interested Products

Match Results:
- Exact match (>80%): Customer has imported similar products
- Partial match (50-80%): Customer has imported related products
- Low match (<50%): Customer has not imported similar products ⚠️
- No data: Cannot determine
```

---

### Phase 6: Business Verification - Weight 10%

#### 6.1 Procurement Volume Rationality

**Reference Standards**:

| Company Type | Annual Procurement/Employee | Reasonable Range |
|--------------|----------------------------|------------------|
| Small Retailer | $10K-$50K | Employees <20 |
| Medium Retailer | $50K-$200K | Employees 20-100 |
| Large Retailer | $200K+ | Employees >100 |
| Trader | $100K-$500K | Depends on business scale |

**Anomaly Judgment**:
```
Anomaly Factor = Actual Procurement / Company Scale Baseline Procurement

if Anomaly Factor > 3:
    Risk = "Abnormally high procurement" ❌
elif Anomaly Factor > 2:
    Risk = "High procurement" ⚠️
else:
    Risk = "Reasonable procurement" ✅
```

#### 6.2 Product Matching

```
Product Matching Calculation:
1. Get company business type (via website/LinkedIn)
2. Get customer's interested products
3. Determine match level

Business-Product Matching Examples:
| Company Business | Interested Products | Match |
|------------------|---------------------|-------|
| Electronics Retailer | Phone Accessories | ✅ High |
| Clothing Retailer | Phone Accessories | ❌ Low |
| General Trader | Various Products | ⚠️ Medium |
```

#### 6.3 Risk Signal Detection Checklist

```
Risk Signal Detection (each signal +10 risk points):

□ Company age < 1 year
□ Registered address is residential/virtual office
□ No corporate email
□ Phone code doesn't match claimed country
□ Company status not Active
□ Customer name not in director list
□ No company website
□ Procurement doesn't match company scale
□ Interested products not related to company business
□ Refuses to provide company registration info

Risk Level:
- 0-1 signals: Low risk
- 2-3 signals: Medium risk
- 4+ signals: High risk
```

---

## III. Confidence Calculation

### 3.1 Data Source Reliability Coefficient

| Data Source Type | Coefficient | Description |
|------------------|-------------|-------------|
| Official database direct access | 1.0 | Companies House and other official bodies |
| Official database API call | 0.9 | Official data via API |
| Third-party paid API | 0.8 | D&B, Experian, etc. |
| WebFetch success | 0.7 | Direct webpage access |
| WebSearch with results | 0.6 | Via search engine |
| WebSearch imprecise results | 0.4 | Search results not precise |
| Inference/Guess | 0.3 | Based on logical inference |
| Cannot verify | 0.0 | Verification failed |

### 3.2 Verification Depth Coefficient

| Verification Depth | Coefficient | Description |
|--------------------|-------------|-------------|
| Complete verification | 1.0 | All sub-items verified successfully |
| Partial verification | 0.7 | Some sub-items verified successfully |
| Existence only | 0.5 | Only confirmed existence, no details |

### 3.3 Comprehensive Confidence Calculation

```
Dimension Confidence = Data Source Reliability Coefficient × Verification Depth Coefficient

Dimension Score = Σ (Sub-item Score × Sub-item Confidence) / Sub-item Count

Total Score = Σ (Dimension Score × Dimension Weight)
```

**Calculation Example**:
```
Company Lookup Dimension (Weight 20%):

Sub-item 1: Company Registry Query
- Primary success, data source = Official database
- Sub-item score: 100
- Confidence: 1.0 × 1.0 = 1.0
- Weighted score: 100 × 1.0 = 100

Sub-item 2: Company Status Verification
- Primary success, data source = Official database
- Sub-item score: 100 (Active)
- Confidence: 1.0 × 1.0 = 1.0
- Weighted score: 100 × 1.0 = 100

Sub-item 3: Registered Address Comparison
- Fallback 1 success, data source = WebSearch
- Sub-item score: 80 (partial match)
- Confidence: 0.6 × 0.7 = 0.42
- Weighted score: 80 × 0.42 = 33.6

Dimension Score = (100 + 100 + 33.6) / 3 = 77.9
Dimension Weighted Score = 77.9 × 20% = 15.58
```

---

## IV. Common Error Handling

### 4.1 WebFetch Blocked

**Symptom**: Security block or CAPTCHA when accessing website

**Handling Process**:
```
1. Detect block type:
   - Security verification (Cloudflare, etc.)
   - Geographic restriction
   - Login required

2. Execute fallback:
   - Fallback to WebSearch
   - Try other data sources

3. Record status:
   - Mark "Primary failed: website blocked"
   - Record fallback execution
```

### 4.2 WebSearch No Results

**Handling Strategy**:
```
1. Try different keyword combinations:
   - Full company name
   - Company abbreviation
   - Company name + product
   - Company name + country

2. If still no results:
   - Mark "search no results"
   - Use lower level fallback

3. Determine impact on overall assessment:
   - Key dimension no data → High impact
   - Non-key dimension no data → Low impact
```

### 4.3 Python Script Execution Failure

**Handling Process**:
```
1. Check error type:
   - Library not installed → Use pip install
   - Network error → Fallback to other methods
   - Data format error → Modify parsing logic

2. If cannot fix:
   - Record error details
   - Execute last resort
   - Mark "pending manual verification"
```

---

## V. Execution Log Specification

Each verification should record the following:

```
{
  "timestamp": "2026-04-18T10:30:00Z",
  "phase": "Phase 2: Company Lookup",
  "sub_item": "Company Registry Query",
  "method_used": "Primary",
  "method_detail": "WebFetch Companies House",
  "success": true,
  "confidence": 1.0,
  "result_summary": "Company found, status Active",
  "fallback_triggered": false,
  "error_message": null
}
```

---

## VI. Version Info

- Version: v1.2
- Update Date: 2026-04-18
