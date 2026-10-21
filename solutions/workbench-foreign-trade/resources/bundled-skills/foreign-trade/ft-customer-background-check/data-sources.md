# 数据源配置 (Data Sources Configuration)

本文档列出客户背调所需的所有数据源，按地区和类型组织，供Agent查询时参考。

---

## 一、海关贸易数据源 ⭐

> **重要性**：海关数据是验证客户真实采购能力的关键数据源，权重占20%。

### 主要海关数据平台

| 平台 | 网址 | 覆盖地区 | 数据类型 | 费用 | 特点 |
|------|------|----------|----------|------|------|
| ImportGenius | importgenius.com | 全球 | 进口商、供应商、HS编码 | 付费 | 数据全面，更新及时 |
| Panjiva | panjiva.com | 美国为主 | 美国进口提单数据 | 付费 | 供应链情报详细 |
| Tradesparq | tradesparq.com | 全球 | 海关数据+B2B匹配 | 免费/付费 | 有免费额度 |
| Datamyne | datamyne.com | 亚洲 | 亚洲贸易数据 | 付费 | 亚洲数据权威 |
| Seair Exim Solutions | seair.co.in | 印度进出口 | 印度贸易数据 | 付费 | 印度市场专项 |
| Export Genius | exportgenius.in | 全球 | 进出口数据 | 付费 | 性价比较高 |

### 海关数据查询内容

从海关数据可获取：
- **进口记录**：进口商名称、进口日期、进口量
- **供应商信息**：出口商名称、出口国家
- **产品信息**：HS编码、产品描述、数量、金额
- **运输信息**：运输方式、港口、船名

### 使用建议

| 客户类型 | 推荐平台 | 查询策略 |
|----------|----------|----------|
| 美国进口商 | Panjiva, ImportGenius | 优先查询美国提单数据 |
| 欧洲进口商 | ImportGenius | 欧洲海关数据覆盖 |
| 亚洲进口商 | Datamyne, ImportGenius | 亚洲数据源优先 |
| 全球贸易商 | ImportGenius, Tradesparq | 多平台交叉验证 |

---

## 二、欧洲市场数据源

### 英国 (UK)

| 数据源 | 网址 | 可查内容 | 费用 |
|--------|------|----------|------|
| Companies House | find-and-update.company-information.service.gov.uk | 公司注册、董事、年报、股东 | 免费 |
| Companies House API | developer.company-information.service.gov.uk | API接口查询 | 免费 |
| 192.com | 192.com | 人员搜索、地址验证 | 付费 |
| D&B UK | dnb.com/uk | 信用评级 | 付费 |

**查询示例**：
```
Companies House查询:
1. 访问: https://find-and-update.company-information.service.gov.uk/
2. 搜索公司名或公司号
3. 获取信息:
   - Company status (Active/Dissolved)
   - Incorporation date
   - Registered office address
   - Directors list
   - Accounts filing history
```

### 德国 (Germany)

| 数据源 | 网址 | 可查内容 | 费用 |
|--------|------|----------|------|
| Handelsregister | unternehmensregister.de | 公司注册、年报 | 部分免费 |
| Bundesanzeiger | bundesanzeiger.de | 公告、年报 | 免费 |
| North Data | northdata.de | 公司信息聚合 | 免费/付费 |

### 法国 (France)

| 数据源 | 网址 | 可查内容 | 费用 |
|--------|------|----------|------|
| societe.com | societe.com | 公司信息、财务、董事 | 免费/付费 |
| Infogreffe | infogreffe.fr | 商业法院注册 | 付费 |
| Pappers | pappers.fr | 公司信息聚合 | 免费/付费 |

### 意大利 (Italy)

| 数据源 | 网址 | 可查内容 | 费用 |
|--------|------|----------|------|
| Registro Imprese | registroimprese.it | 公司注册 | 付费 |
| InfoCamere | infocamere.it | 商会信息 | 付费 |

### 荷兰 (Netherlands)

| 数据源 | 网址 | 可查内容 | 费用 |
|--------|------|----------|------|
| KvK (Kamer van Koophandel) | kvk.nl | 公司注册、董事 | 免费/付费 |
| Open KvK | openkvk.nl | 免费API | 免费 |

### 西班牙 (Spain)

| 数据源 | 网址 | 可查内容 | 费用 |
|--------|------|----------|------|
| Registro Mercantil | rmc.es | 公司注册 | 付费 |
| AXesor | axesor.es | 商业信息 | 付费 |

### 瑞典 (Sweden)

| 数据源 | 网址 | 可查内容 | 费用 |
|--------|------|----------|------|
| Bolagsverket | bolagsverket.se | 公司注册 | 免费/付费 |
| Allabolag | allabolag.se | 公司信息聚合 | 免费/付费 |

### 瑞士 (Switzerland)

| 数据源 | 网址 | 可查内容 | 费用 |
|--------|------|----------|------|
| Zefix | zefix.admin.ch | 公司注册 | 免费 |
| Swiss Commercial Register | zefix.admin.ch | 商业登记 | 免费 |

---

## 三、美洲市场数据源

### 美国 (USA)

| 数据源 | 网址 | 可查内容 | 费用 |
|--------|------|----------|------|
| Secretary of State | 各州官网 | 公司注册 | 各州不同 |
| BBB (Better Business Bureau) | bbb.org | 商业信誉、投诉 | 免费 |
| D&B (Dun & Bradstreet) | dnb.com | 信用评级、公司信息 | 付费 |
| Experian Business | experian.com/business | 商业信用报告 | 付费 |
| OpenCorporates | opencorporates.com | 全球公司数据库 | 免费/付费 |

**美国各州Secretary of State查询**：

| 州 | 网址 |
|----|------|
| California | businesssearch.sos.ca.gov |
| Delaware | icis.corp.delaware.gov |
| New York | apps.dos.ny.gov/publicSearch |
| Texas | myfloridalegal.com |
| Florida | sunbiz.org |

### 加拿大 (Canada)

| 数据源 | 网址 | 可查内容 | 费用 |
|--------|------|----------|------|
| Corporations Canada | ic.gc.ca/app/scr/cc | 联邦公司注册 | 免费 |
| Ontario | ontario.ca/page/search-business-names-incorporated-businesses | 安省公司 | 免费 |
| British Columbia | corporateonline.gov.bc.ca | BC省公司 | 免费 |

### 巴西 (Brazil)

| 数据源 | 网址 | 可查内容 | 费用 |
|--------|------|----------|------|
| Receita Federal | receita.economia.gov.br | CNPJ税务登记 | 免费 |
| JusBrasil | jusbrasil.com.br | 法律信息 | 免费/付费 |

### 墨西哥 (Mexico)

| 数据源 | 网址 | 可查内容 | 费用 |
|--------|------|----------|------|
| SAT (Servicio de Administración Tributaria) | sat.gob.mx | RFC税务登记 | 免费 |
| SIEM | siem.gob.mx | 商业信息 | 免费 |

---

## 四、亚太市场数据源

### 澳大利亚 (Australia)

| 数据源 | 网址 | 可查内容 | 费用 |
|--------|------|----------|------|
| ASIC | asic.gov.au | 公司注册、董事 | 免费/付费 |
| ASIC Connect | connectonline.asic.gov.au | 在线查询 | 免费 |
| ABN Lookup | abr.business.gov.au | ABN查询 | 免费 |

### 新西兰 (New Zealand)

| 数据源 | 网址 | 可查内容 | 费用 |
|--------|------|----------|------|
| Companies Register | companies-register.companiesoffice.govt.nz | 公司注册、董事 | 免费 |
| New Zealand Business Number | nzbn.govt.nz | NZBN查询 | 免费 |

### 日本 (Japan)

| 数据源 | 网址 | 可查内容 | 费用 |
|--------|------|----------|------|
| 法务省 (Ministry of Justice) | moj.go.jp | 商业登记 | 付费 |
| Goo-net | corporate.goo-net.jp | 公司信息 | 免费/付费 |
| TSJ (Tokyo Shoko Research) | tsr.co.jp | 商业信息 | 付费 |

### 韩国 (South Korea)

| 数据源 | 网址 | 可查内容 | 费用 |
|--------|------|----------|------|
| 国税厅 (NTS) | nts.go.kr | 税务登记 | 免费 |
| KISLINE | kisline.com | 商业信息 | 付费 |

### 新加坡 (Singapore)

| 数据源 | 网址 | 可查内容 | 费用 |
|--------|------|----------|------|
| ACRA | acra.gov.sg | 公司注册 | 付费 |
| BizFile+ | bizfile.gov.sg | 在线查询 | 付费 |

### 香港 (Hong Kong)

| 数据源 | 网址 | 可查内容 | 费用 |
|--------|------|----------|------|
| 公司注册处 (Companies Registry) | cr.gov.hk | 公司注册 | 付费 |
| ICris | icris.cr.gov.hk | 在线查询 | 付费 |

### 印度 (India)

| 数据源 | 网址 | 可查内容 | 费用 |
|--------|------|----------|------|
| MCA (Ministry of Corporate Affairs) | mca.gov.in | 公司注册 | 免费/付费 |
| ZaubaCorp | zaubacorp.com | 公司信息聚合 | 免费/付费 |

---

## 五、中东市场数据源

### 阿联酋 (UAE)

| 数据源 | 网址 | 可查内容 | 费用 |
|--------|------|----------|------|
| DIFC | difc.ae | 迪拜金融中心公司 | 免费/付费 |
| DMCC | dmcc.ae | 迪拜多种商品中心 | 免费/付费 |
| ADGM | adgm.gov.ae | 阿布扎比全球市场 | 免费/付费 |

### 沙特阿拉伯 (Saudi Arabia)

| 数据源 | 网址 | 可查内容 | 费用 |
|--------|------|----------|------|
| MCI (Ministry of Commerce) | mci.gov.sa | 商业注册 | 免费/付费 |
| CR (Commercial Registration) | cr.mci.gov.sa | 在线查询 | 免费/付费 |

### 以色列 (Israel)

| 数据源 | 网址 | 可查内容 | 费用 |
|--------|------|----------|------|
| Registrar of Companies | justice.gov.il | 公司注册 | 免费 |

---

## 六、非洲市场数据源

### 南非 (South Africa)

| 数据源 | 网址 | 可查内容 | 费用 |
|--------|------|----------|------|
| CIPC | cipc.co.za | 公司注册 | 免费/付费 |
| Companies and Intellectual Property Commission | cipc.co.za | 在线查询 | 免费/付费 |

### 尼日利亚 (Nigeria)

| 数据源 | 网址 | 可查内容 | 费用 |
|--------|------|----------|------|
| CAC (Corporate Affairs Commission) | cac.gov.ng | 公司注册 | 付费 |

### 埃及 (Egypt)

| 数据源 | 网址 | 可查内容 | 费用 |
|--------|------|----------|------|
| GAFI (General Authority for Investment) | gafi.gov.eg | 投资局注册 | 免费/付费 |

---

## 七、第三方增强数据源

### 信用评级机构

| 机构 | 网址 | 服务内容 | 覆盖地区 |
|------|------|----------|----------|
| Dun & Bradstreet | dnb.com | 信用评级、付款历史、财务压力指数 | 全球 |
| Experian Business | experian.com/business | 商业信用报告 | 美洲、欧洲 |
| Equifax Business | equifax.com/business | 商业信用报告 | 美洲 |
| Creditsafe | creditsafe.com | 信用报告 | 欧洲、北美 |

### 诉讼记录查询

| 来源 | 网址 | 说明 |
|------|------|------|
| 各国法院数据库 | 各国不同 | 查询诉讼、破产记录 |
| Google News | news.google.com | 搜索负面新闻 |
| LinkedIn | linkedin.com | 验证人员身份 |

### 网站验证工具

| 工具 | 网址 | 用途 |
|------|------|------|
| Wayback Machine | web.archive.org | 查看网站历史 |
| Whois | whois.com | 域名注册信息 |
| SSL Labs | ssllabs.com | SSL证书验证 |

---

## 八、数据源选择策略

### 按客户国家选择

```
数据源选择流程:
1. 识别客户国家
2. 查询对应国家数据源
3. 如官方数据源不可用，使用第三方数据源
4. 如第三方数据源不可用，使用WebSearch
```

### 按验证维度选择

| 验证维度 | 首选数据源 | 备选数据源 |
|----------|------------|------------|
| 公司注册 | 官方注册机构 | OpenCorporates, D&B |
| 董事信息 | 官方董事数据库 | LinkedIn, WebSearch |
| 信用评级 | D&B, Experian | 当地信用机构 |
| 进口记录 | ImportGenius, Panjiva | Tradesparq |
| 网站验证 | WebFetch | Wayback Machine |

### 数据源优先级

```
优先级排序:
1. 官方政府数据库 (置信度: 1.0)
2. 官方API接口 (置信度: 0.9)
3. 第三方付费数据源 (置信度: 0.8)
4. WebFetch直接访问 (置信度: 0.7)
5. WebSearch搜索结果 (置信度: 0.6)
6. 推断/猜测 (置信度: 0.3)
```

---

## 九、数据源配置文件

### 配置文件格式 (JSON)

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

## 版本信息

- 版本: v1.2
- 更新日期: 2026-04-18
- 覆盖国家: 30+
- 数据源数量: 50+
