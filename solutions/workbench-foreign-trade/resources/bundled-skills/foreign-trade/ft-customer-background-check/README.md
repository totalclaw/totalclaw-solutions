# 客户背调框架 (Customer Background Check Framework)

[English Version](#english-version) | [中文版本](#中文版本)

---

## 中文版本

### 项目简介

本项目是一套完整的客户背景调查框架，专为AI Agent设计，提供：

- ✅ **完整的验证流程**：从基础验证到综合评估的7个阶段
- ✅ **降级方案矩阵**：每个验证步骤都有主方案、降级方案和兜底方案
- ✅ **置信度量化**：基于数据源可靠性的科学评分体系
- ✅ **全球数据源覆盖**：覆盖30+国家/地区的官方数据源
- ✅ **海关数据支持**：独立的海关贸易验证维度（权重20%）
- ✅ **风控策略建议**：根据风险等级给出具体风控建议

### 快速开始

#### 作为AI Agent Skill使用

将此项目放入Agent的skills目录，Agent将自动识别：

```
skills/
└── customer-background-check/
    ├── SKILL.md              # 主入口文件
    ├── execution-guide.md    # 执行指南
    ├── risk-strategies.md    # 风控策略
    └── data-sources.md       # 数据源配置
```

#### 触发条件

- 用户提供客户信息（姓名、邮箱、电话、公司、国家）
- 用户要求"背调"、"背景调查"
- 用户提供批量客户Excel/CSV文件

#### 输入示例

```json
{
  "name": "John Smith",
  "email": "john@company.com",
  "phone": "+44 20 1234 5678",
  "company": "ABC Trading Ltd",
  "country": "UK",
  "products": ["Electronics", "Machinery"]
}
```

### 项目结构

```
customer-background-check-version1.2/
├── README.md                    # 项目说明（本文件）
├── SKILL.md                     # Agent技能主入口（中文）
├── SKILL_EN.md                  # Agent技能主入口（英文）
├── execution-guide.md           # 执行指南（中文）
├── execution-guide_EN.md        # 执行指南（英文）
├── risk-strategies.md           # 风控策略（中文）
├── risk-strategies_EN.md        # 风控策略（英文）
├── data-sources.md              # 数据源配置（中文）
├── data-sources_EN.md           # 数据源配置（英文）
├── templates/                   # 输出模板
│   └── report-template.md
├── scripts/                     # Python辅助脚本
│   ├── email_validator.py
│   ├── phone_validator.py
│   ├── company_lookup.py
│   ├── domain_checker.py
│   ├── social_media_search.py
│   ├── ecommerce_checker.py
│   ├── trade_checker.py
│   ├── risk_scorer.py
│   ├── report_generator.py
│   ├── batch_processor.py
│   └── config.py
├── data/                        # 数据文件
│   ├── country_registry.json
│   ├── personal_email_domains.txt
│   └── report_template.md
└── cases/                       # 示例案例
    └── 示例背调案例.md
```

### 权重体系

| 维度 | 权重 | 说明 |
|------|------|------|
| 基础验证 | 15% | 验证联系方式有效性 |
| 公司查询 | 20% | 确认公司存在性和状态 |
| 人员关联 | 20% | 验证客户与公司的关系 |
| 数字资产 | 15% | 验证公司在线存在 |
| 海关贸易 | 20% | 验证真实采购历史 ⭐ |
| 业务验证 | 10% | 评估业务合理性 |

### 风险等级

| 分数范围 | 风险等级 | 标识 |
|----------|----------|------|
| 80-100 | 低风险 | ✅ |
| 50-79 | 中风险 | ⚠️ |
| 20-49 | 无法核实 | ⚠️ |
| 0-19 | 高风险 | ❌ |

### 核心特性

#### 1. 降级方案矩阵

每个验证步骤都有完整的降级方案：

```
主方案 → 降级方案1 → 降级方案2 → 兜底方案
```

#### 2. 置信度计算

```
维度置信度 = 数据源可靠性系数 × 验证深度系数

数据源可靠性系数:
- 官方数据库直接访问: 1.0
- 官方数据库API: 0.9
- 第三方付费API: 0.8
- WebFetch成功: 0.7
- WebSearch: 0.6
```

#### 3. 海关数据特殊处理

- 无海关数据时，权重自动重新分配
- 有海关数据时，验证真实采购行为

### 数据源覆盖

| 地区 | 覆盖国家 |
|------|----------|
| 欧洲 | 英国、德国、法国、意大利、荷兰、西班牙、瑞典、瑞士 |
| 美洲 | 美国、加拿大、巴西、墨西哥 |
| 亚太 | 澳大利亚、新西兰、日本、韩国、新加坡、香港、印度 |
| 中东 | 阿联酋、沙特、以色列 |
| 非洲 | 南非、尼日利亚、埃及 |

### 使用Python脚本

```bash
# 安装依赖
pip install -r requirements.txt

# 单个客户验证
python scripts/batch_processor.py --input customer.json --output report.md

# 批量验证
python scripts/batch_processor.py --input customers.csv --output reports/
```

### 输出示例

```markdown
# 客户背调报告

## 基本信息
- 客户姓名: John Smith
- 公司: ABC Trading Ltd
- 国家: UK

## 评分概览
| 维度 | 得分 | 权重 | 加权得分 |
|------|------|------|----------|
| 基础验证 | 85/100 | 15% | 12.75 |
| 公司查询 | 90/100 | 20% | 18.00 |
| 人员关联 | 75/100 | 20% | 15.00 |
| 数字资产 | 80/100 | 15% | 12.00 |
| 海关贸易 | 70/100 | 20% | 14.00 |
| 业务验证 | 85/100 | 10% | 8.50 |

**综合评分**: 80.25/100
**风险等级**: ✅ 低风险

## 风控建议
- 付款方式: 标准T/T 30%预付
- 发货策略: 正常发货流程
```

---

## English Version

### Project Overview

This project is a complete customer background check framework designed for AI Agents, providing:

- ✅ **Complete Verification Workflow**: 7 phases from basic verification to final assessment
- ✅ **Fallback Strategy Matrix**: Primary, fallback, and last-resort options for each verification step
- ✅ **Quantified Confidence**: Scientific scoring system based on data source reliability
- ✅ **Global Data Source Coverage**: Official data sources covering 30+ countries/regions
- ✅ **Customs Data Support**: Independent customs trade verification dimension (20% weight)
- ✅ **Risk Control Recommendations**: Specific recommendations based on risk level

### Quick Start

#### Using as AI Agent Skill

Place this project in your Agent's skills directory:

```
skills/
└── customer-background-check/
    ├── SKILL_EN.md            # Main entry file
    ├── execution-guide_EN.md  # Execution guide
    ├── risk-strategies_EN.md  # Risk strategies
    └── data-sources_EN.md     # Data source config
```

#### Trigger Conditions

- User provides customer information (name, email, phone, company, country)
- User requests "background check" or "due diligence"
- User provides batch customer Excel/CSV file

#### Input Example

```json
{
  "name": "John Smith",
  "email": "john@company.com",
  "phone": "+44 20 1234 5678",
  "company": "ABC Trading Ltd",
  "country": "UK",
  "products": ["Electronics", "Machinery"]
}
```

### Project Structure

```
customer-background-check-version1.2/
├── README.md                    # Project README (this file)
├── SKILL.md                     # Agent skill main entry (Chinese)
├── SKILL_EN.md                  # Agent skill main entry (English)
├── execution-guide.md           # Execution guide (Chinese)
├── execution-guide_EN.md        # Execution guide (English)
├── risk-strategies.md           # Risk strategies (Chinese)
├── risk-strategies_EN.md        # Risk strategies (English)
├── data-sources.md              # Data sources (Chinese)
├── data-sources_EN.md           # Data sources (English)
├── templates/                   # Output templates
├── scripts/                     # Python helper scripts
├── data/                        # Data files
└── cases/                       # Example cases
```

### Weight System

| Dimension | Weight | Description |
|-----------|--------|-------------|
| Basic Verification | 15% | Verify contact information validity |
| Company Lookup | 20% | Confirm company existence and status |
| Personnel Association | 20% | Verify customer-company relationship |
| Digital Assets | 15% | Verify company online presence |
| Customs Trade | 20% | Verify real procurement history ⭐ |
| Business Verification | 10% | Assess business rationality |

### Risk Levels

| Score Range | Risk Level | Symbol |
|-------------|------------|--------|
| 80-100 | Low Risk | ✅ |
| 50-79 | Medium Risk | ⚠️ |
| 20-49 | Unverifiable | ⚠️ |
| 0-19 | High Risk | ❌ |

### Core Features

#### 1. Fallback Strategy Matrix

Each verification step has complete fallback options:

```
Primary → Fallback 1 → Fallback 2 → Last Resort
```

#### 2. Confidence Calculation

```
Dimension Confidence = Data Source Reliability × Verification Depth

Data Source Reliability:
- Official database direct access: 1.0
- Official database API: 0.9
- Third-party paid API: 0.8
- WebFetch success: 0.7
- WebSearch: 0.6
```

#### 3. Customs Data Special Handling

- When no customs data, weight auto-redistributed
- When customs data available, verify real procurement behavior

### Data Source Coverage

| Region | Countries Covered |
|--------|-------------------|
| Europe | UK, Germany, France, Italy, Netherlands, Spain, Sweden, Switzerland |
| Americas | USA, Canada, Brazil, Mexico |
| Asia-Pacific | Australia, New Zealand, Japan, South Korea, Singapore, Hong Kong, India |
| Middle East | UAE, Saudi Arabia, Israel |
| Africa | South Africa, Nigeria, Egypt |

### Using Python Scripts

```bash
# Install dependencies
pip install -r requirements.txt

# Single customer verification
python scripts/batch_processor.py --input customer.json --output report.md

# Batch verification
python scripts/batch_processor.py --input customers.csv --output reports/
```

---

## 版本信息 (Version Info)

- **版本 (Version)**: v1.2
- **更新日期 (Update Date)**: 2026-04-18

### 主要更新 (Major Updates)

1. 海关贸易验证独立为单独维度（权重20%）
2. 完整的降级方案矩阵
3. 全球主要市场数据源覆盖
4. 置信度量化评分体系
5. 中英文双语支持

---

## 许可证 (License)

MIT License

---

## 贡献 (Contributing)

欢迎提交Issue和Pull Request。

Welcome to submit Issues and Pull Requests.
