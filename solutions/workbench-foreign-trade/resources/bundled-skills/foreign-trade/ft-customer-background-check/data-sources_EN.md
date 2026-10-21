# Data Sources Configuration

This document lists all data sources required for customer background checks, organized by region and type, for Agent reference during queries.

---

## I. Customs Trade Data Sources ⭐

> **Importance**: Customs data is a key data source for verifying customer's real procurement capability, accounting for 20% weight.

### Major Customs Data Platforms

| Platform | URL | Coverage | Data Type | Cost | Features |
|----------|-----|----------|-----------|------|----------|
| ImportGenius | importgenius.com | Global | Importers, suppliers, HS codes | Paid | Comprehensive data, timely updates |
| Panjiva | panjiva.com | US-focused | US import bill of lading data | Paid | Detailed supply chain intelligence |
| Tradesparq | tradesparq.com | Global | Customs data + B2B matching | Free/Paid | Has free quota |
| Datamyne | datamyne.com | Asia | Asian trade data | Paid | Authoritative Asian data |
| Seair Exim Solutions | seair.co.in | India import/export | India trade data | Paid | India market specific |
| Export Genius | exportgenius.in | Global | Import/export data | Paid | Good value |

### Customs Data Query Content

From customs data you can obtain:
- **Import Records**: Importer name, import date, import volume
- **Supplier Information**: Exporter name, export country
- **Product Information**: HS code, product description, quantity, value
- **Shipping Information**: Shipping method, port, vessel name

### Usage Recommendations

| Customer Type | Recommended Platform | Query Strategy |
|---------------|---------------------|----------------|
| US Importer | Panjiva, ImportGenius | Prioritize US bill of lading data |
| European Importer | ImportGenius | European customs data coverage |
| Asian Importer | Datamyne, ImportGenius | Asian data sources first |
| Global Trader | ImportGenius, Tradesparq | Cross-verification across platforms |

---

## II. European Market Data Sources

### United Kingdom (UK)

| Source | URL | Content Available | Cost |
|--------|-----|-------------------|------|
| Companies House | find-and-update.company-information.service.gov.uk | Company registration, directors, annual returns, shareholders | Free |
| Companies House API | developer.company-information.service.gov.uk | API access | Free |
| 192.com | 192.com | People search, address verification | Paid |
| D&B UK | dnb.com/uk | Credit ratings | Paid |

**Query Example**:
```
Companies House Query:
1. Visit: https://find-and-update.company-information.service.gov.uk/
2. Search company name or number
3. Obtain info:
   - Company status (Active/Dissolved)
   - Incorporation date
   - Registered office address
   - Directors list
   - Accounts filing history
```

### Germany

| Source | URL | Content Available | Cost |
|--------|-----|-------------------|------|
| Handelsregister | unternehmensregister.de | Company registration, annual reports | Partially Free |
| Bundesanzeiger | bundesanzeiger.de | Announcements, annual reports | Free |
| North Data | northdata.de | Aggregated company info | Free/Paid |

### France

| Source | URL | Content Available | Cost |
|--------|-----|-------------------|------|
| societe.com | societe.com | Company info, financials, directors | Free/Paid |
| Infogreffe | infogreffe.fr | Commercial court registration | Paid |
| Pappers | pappers.fr | Aggregated company info | Free/Paid |

### Italy

| Source | URL | Content Available | Cost |
|--------|-----|-------------------|------|
| Registro Imprese | registroimprese.it | Company registration | Paid |
| InfoCamere | infocamere.it | Chamber of commerce info | Paid |

### Netherlands

| Source | URL | Content Available | Cost |
|--------|-----|-------------------|------|
| KvK (Kamer van Koophandel) | kvk.nl | Company registration, directors | Free/Paid |
| Open KvK | openkvk.nl | Free API | Free |

### Spain

| Source | URL | Content Available | Cost |
|--------|-----|-------------------|------|
| Registro Mercantil | rmc.es | Company registration | Paid |
| AXesor | axesor.es | Business information | Paid |

### Sweden

| Source | URL | Content Available | Cost |
|--------|-----|-------------------|------|
| Bolagsverket | bolagsverket.se | Company registration | Free/Paid |
| Allabolag | allabolag.se | Aggregated company info | Free/Paid |

### Switzerland

| Source | URL | Content Available | Cost |
|--------|-----|-------------------|------|
| Zefix | zefix.admin.ch | Company registration | Free |
| Swiss Commercial Register | zefix.admin.ch | Commercial register | Free |

---

## III. Americas Market Data Sources

### United States (USA)

| Source | URL | Content Available | Cost |
|--------|-----|-------------------|------|
| Secretary of State | State-specific sites | Company registration | Varies by state |
| BBB (Better Business Bureau) | bbb.org | Business reputation, complaints | Free |
| D&B (Dun & Bradstreet) | dnb.com | Credit ratings, company info | Paid |
| Experian Business | experian.com/business | Business credit reports | Paid |
| OpenCorporates | opencorporates.com | Global company database | Free/Paid |

**US Secretary of State by State**:

| State | URL |
|-------|-----|
| California | businesssearch.sos.ca.gov |
| Delaware | icis.corp.delaware.gov |
| New York | apps.dos.ny.gov/publicSearch |
| Texas | myfloridalegal.com |
| Florida | sunbiz.org |

### Canada

| Source | URL | Content Available | Cost |
|--------|-----|-------------------|------|
| Corporations Canada | ic.gc.ca/app/scr/cc | Federal company registration | Free |
| Ontario | ontario.ca/page/search-business-names-incorporated-businesses | Ontario companies | Free |
| British Columbia | corporateonline.gov.bc.ca | BC companies | Free |

### Brazil

| Source | URL | Content Available | Cost |
|--------|-----|-------------------|------|
| Receita Federal | receita.economia.gov.br | CNPJ tax registration | Free |
| JusBrasil | jusbrasil.com.br | Legal information | Free/Paid |

### Mexico

| Source | URL | Content Available | Cost |
|--------|-----|-------------------|------|
| SAT (Servicio de Administración Tributaria) | sat.gob.mx | RFC tax registration | Free |
| SIEM | siem.gob.mx | Business information | Free |

---

## IV. Asia-Pacific Market Data Sources

### Australia

| Source | URL | Content Available | Cost |
|--------|-----|-------------------|------|
| ASIC | asic.gov.au | Company registration, directors | Free/Paid |
| ASIC Connect | connectonline.asic.gov.au | Online search | Free |
| ABN Lookup | abr.business.gov.au | ABN lookup | Free |

### New Zealand

| Source | URL | Content Available | Cost |
|--------|-----|-------------------|------|
| Companies Register | companies-register.companiesoffice.govt.nz | Company registration, directors | Free |
| New Zealand Business Number | nzbn.govt.nz | NZBN lookup | Free |

### Japan

| Source | URL | Content Available | Cost |
|--------|-----|-------------------|------|
| Ministry of Justice | moj.go.jp | Commercial registration | Paid |
| Goo-net | corporate.goo-net.jp | Company information | Free/Paid |
| TSJ (Tokyo Shoko Research) | tsr.co.jp | Business information | Paid |

### South Korea

| Source | URL | Content Available | Cost |
|--------|-----|-------------------|------|
| NTS (National Tax Service) | nts.go.kr | Tax registration | Free |
| KISLINE | kisline.com | Business information | Paid |

### Singapore

| Source | URL | Content Available | Cost |
|--------|-----|-------------------|------|
| ACRA | acra.gov.sg | Company registration | Paid |
| BizFile+ | bizfile.gov.sg | Online search | Paid |

### Hong Kong

| Source | URL | Content Available | Cost |
|--------|-----|-------------------|------|
| Companies Registry | cr.gov.hk | Company registration | Paid |
| ICris | icris.cr.gov.hk | Online search | Paid |

### India

| Source | URL | Content Available | Cost |
|--------|-----|-------------------|------|
| MCA (Ministry of Corporate Affairs) | mca.gov.in | Company registration | Free/Paid |
| ZaubaCorp | zaubacorp.com | Aggregated company info | Free/Paid |

---

## V. Middle East Market Data Sources

### United Arab Emirates (UAE)

| Source | URL | Content Available | Cost |
|--------|-----|-------------------|------|
| DIFC | difc.ae | Dubai financial center companies | Free/Paid |
| DMCC | dmcc.ae | Dubai Multi Commodities Centre | Free/Paid |
| ADGM | adgm.gov.ae | Abu Dhabi Global Market | Free/Paid |

### Saudi Arabia

| Source | URL | Content Available | Cost |
|--------|-----|-------------------|------|
| MCI (Ministry of Commerce) | mci.gov.sa | Commercial registration | Free/Paid |
| CR (Commercial Registration) | cr.mci.gov.sa | Online search | Free/Paid |

### Israel

| Source | URL | Content Available | Cost |
|--------|-----|-------------------|------|
| Registrar of Companies | justice.gov.il | Company registration | Free |

---

## VI. Africa Market Data Sources

### South Africa

| Source | URL | Content Available | Cost |
|--------|-----|-------------------|------|
| CIPC | cipc.co.za | Company registration | Free/Paid |
| Companies and Intellectual Property Commission | cipc.co.za | Online search | Free/Paid |

### Nigeria

| Source | URL | Content Available | Cost |
|--------|-----|-------------------|------|
| CAC (Corporate Affairs Commission) | cac.gov.ng | Company registration | Paid |

### Egypt

| Source | URL | Content Available | Cost |
|--------|-----|-------------------|------|
| GAFI (General Authority for Investment) | gafi.gov.eg | Investment authority registration | Free/Paid |

---

## VII. Third-Party Enhanced Data Sources

### Credit Rating Agencies

| Agency | URL | Services | Coverage |
|--------|-----|----------|----------|
| Dun & Bradstreet | dnb.com | Credit ratings, payment history, financial stress index | Global |
| Experian Business | experian.com/business | Business credit reports | Americas, Europe |
| Equifax Business | equifax.com/business | Business credit reports | Americas |
| Creditsafe | creditsafe.com | Credit reports | Europe, North America |

### Litigation Record Search

| Source | URL | Description |
|--------|-----|-------------|
| Court databases | Varies by country | Search lawsuits, bankruptcy records |
| Google News | news.google.com | Search negative news |
| LinkedIn | linkedin.com | Verify personnel identity |

### Website Verification Tools

| Tool | URL | Purpose |
|------|-----|---------|
| Wayback Machine | web.archive.org | View website history |
| Whois | whois.com | Domain registration info |
| SSL Labs | ssllabs.com | SSL certificate verification |

---

## VIII. Data Source Selection Strategy

### Selection by Customer Country

```
Data Source Selection Process:
1. Identify customer country
2. Query corresponding country data source
3. If official source unavailable, use third-party source
4. If third-party unavailable, use WebSearch
```

### Selection by Verification Dimension

| Verification Dimension | Primary Source | Secondary Source |
|------------------------|----------------|------------------|
| Company Registration | Official registry | OpenCorporates, D&B |
| Director Information | Official director database | LinkedIn, WebSearch |
| Credit Rating | D&B, Experian | Local credit agencies |
| Import Records | ImportGenius, Panjiva | Tradesparq |
| Website Verification | WebFetch | Wayback Machine |

### Data Source Priority

```
Priority Ranking:
1. Official government database (Confidence: 1.0)
2. Official API interface (Confidence: 0.9)
3. Third-party paid sources (Confidence: 0.8)
4. WebFetch direct access (Confidence: 0.7)
5. WebSearch results (Confidence: 0.6)
6. Inference/Guess (Confidence: 0.3)
```

---

## IX. Data Source Configuration File

### Configuration File Format (JSON)

```json
{
  "country_registry": {
    "UK": {
      "name": "Companies House",
      "url": "https://find-and-update.company-information.service.gov.uk/",
      "search_url": "https://find-and-update.company-information.service.gov.uk/company/{company_number}",
      "free": true,
      "has_directors": true,
      "confidence": 1.0
    },
    "US": {
      "name": "Secretary of State",
      "url": "varies by state",
      "free": "varies",
      "has_directors": true,
      "confidence": 0.9
    }
  },
  "customs_data": {
    "importgenius": {
      "url": "https://www.importgenius.com",
      "paid": true,
      "coverage": "global",
      "confidence": 1.0
    },
    "tradesparq": {
      "url": "https://www.tradesparq.com",
      "paid": false,
      "coverage": "global",
      "confidence": 0.7
    }
  }
}
```

---

## Version Info

- Version: v1.2
- Update Date: 2026-04-18
- Countries Covered: 30+
- Data Sources: 50+
