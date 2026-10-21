# 客户背调报告模板

## 一、基本信息 (Basic Information)

| 项目 | 内容 |
|------|------|
| 客户姓名 (Name) | {name} |
| 邮箱地址 (Email) | {email} |
| 电话号码 (Phone) | {phone} |
| 所在地区 (Region) | {region} |
| 公司名称 (Company) | {company} |
| 兴趣产品 (Products) | {products} |
| 身份类型 (Identity Type) | {identity_type} |
| 背调日期 (Date) | {date} |
| 背调人员 (Agent) | {agent} |

---

## 二、验证结果 (Verification Results)

### 2.1 邮箱验证 (Email Verification)

| 检查项 | 结果 |
|--------|------|
| 格式验证 | {email_format_valid} |
| MX记录 | {email_mx_exists} |
| 邮箱类型 | {email_type} |
| 域名匹配公司 | {email_domain_matches} |

**验证方式**: 
- Python脚本: `python scripts/email_validator.py --email "{email}"`
- Agent能力: WebSearch/WebFetch

---

### 2.2 公司名称获取 (如客户未提供)

| 项目 | 内容 |
|------|------|
| 获取方式 | {company_source} |
| 推断公司名 | {inferred_company} |
| 置信度 | {company_confidence} |

---

### 2.3 公司验证 (Company Verification)

| 检查项 | 结果 |
|--------|------|
| 公司注册号 | {registration_number} |
| 公司状态 | {company_status} |
| 注册地址 | {registered_address} |
| 成立日期 | {incorporation_date} |
| 业务类型 | {business_type} |
| 数据来源 | {data_source} |

**验证方式**:
- Python脚本: `python scripts/company_lookup.py --country "{country}" --company "{company}"`
- Agent能力: WebFetch官方数据源

---

### 2.4 人员关联 (Personnel Association)

| 检查项 | 结果 |
|--------|------|
| 董事记录 | {director_match} |
| 任职状态 | {employment_status} |
| LinkedIn职务 | {linkedin_title} |

---

### 2.5 社交媒体验证 (Social Media)

| 平台 | 状态 | 链接/备注 |
|------|------|----------|
| LinkedIn | {linkedin_status} | {linkedin_link} |
| Facebook | {facebook_status} | {facebook_link} |
| Instagram | {instagram_status} | {instagram_link} |
| YouTube | {youtube_status} | {youtube_link} |

**搜索方式**: `python scripts/social_media_search.py --name "{name}" --company "{company}" --country "{country}"`

---

### 2.6 电商平台验证 (E-commerce)

| 平台 | 店铺名 | 评分 | 销售历史 |
|------|--------|------|----------|
| Amazon | {amazon_shop} | {amazon_rating} | {amazon_history} |
| eBay | {ebay_shop} | {ebay_rating} | {ebay_history} |
| Alibaba | {alibaba_shop} | {alibaba_cert} | {alibaba_years} |
| Etsy | {etsy_shop} | {etsy_rating} | - |

**搜索方式**: `python scripts/ecommerce_checker.py --company "{company}"`

---

### 2.7 海关贸易验证 (Trade Records)

| 检查项 | 结果 |
|--------|------|
| 进口记录 | {import_records} |
| 最近进口 | {last_import} |
| 进口品类 | {import_categories} |
| 主要供应商 | {suppliers} |
| 年进口量 | {annual_volume} |

**搜索方式**: `python scripts/trade_checker.py --company "{company}" --country "{country}"`

---

### 2.8 兴趣产品匹配 (Product Matching)

| 检查项 | 结果 |
|--------|------|
| 产品与身份匹配 | {product_identity_match} |
| 采购量合理性 | {quantity_reasonable} |
| 产品敏感度 | {product_sensitivity} |

---

## 三、风险评分 (Risk Assessment)

| 维度 | 得分 | 权重 | 加权分 |
|------|------|------|--------|
| 邮箱验证 | {email_score} | 15% | {email_weighted} |
| 公司状态 | {company_score} | 20% | {company_weighted} |
| 人员关联 | {personnel_score} | 20% | {personnel_weighted} |
| 数字资产 | {digital_score} | 15% | {digital_weighted} |
| 电商平台验证 | {ecommerce_score} | 15% | {ecommerce_weighted} |
| 海关贸易验证 | {trade_score} | 15% | {trade_weighted} |
| **总分** | - | - | **{total_score}** |

---

## 四、风险等级 (Risk Level)

**{risk_symbol} {risk_level}**: {risk_description}

| 等级 | 分数范围 | 说明 |
|------|----------|------|
| ✅ 可信 (Verified) | ≥80分 | 有直接匹配依据，低风险 |
| ⚠️ 需补充 (Needs Supplement) | 50-79分 | 部分信息缺失，需客户补充材料 |
| ❌ 高风险 (High Risk) | <50分 | 无匹配依据或存在矛盾，需警惕 |

---

## 五、客户身份推断 (Identity Inference)

| 项目 | 内容 |
|------|------|
| 推断身份类型 | {inferred_identity} |
| 推断依据 | {inference_basis} |
| 置信度 | {inference_confidence} |

---

## 六、验证建议 (Recommendation)

{recommendation}

---

## 七、附件 (Attachments)

- [ ] 公司注册信息截图
- [ ] 董事记录截图
- [ ] 网站截图
- [ ] 社交媒体截图
- [ ] 电商平台截图
- [ ] 海关记录截图（如有）

---

*报告生成时间: {generated_at}*
*背调框架版本: v1.1*
