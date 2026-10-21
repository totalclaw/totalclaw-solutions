/**
 * 地区档案（第 13.4 节）。税率、期限这类会变的值只放在 RegionRule（processLibrary/seeds/region-rules.json），
 * 这里只登记规则 id；带地区的规则未经当地专业人员审核前一律标「草稿口径」。
 *
 * 四个档案全部开放（阿语地区为沙特 + 阿联酋，2026-10-19 用户拍板）：
 *   沙特 sa.*：ZATCA 增值税与电子发票、天课、外资部分所得税、预提税、转让定价；
 *   阿联酋 ae.*：FTA 增值税 5%、企业所得税 9%（375,000 迪拉姆以内按 0%）、小企业减免、转让定价。
 * 沙特、阿联酋的规则在当地专业人员审核（RegionRule.review）之前一律是「草稿口径，需当地专业人士复核」。
 */
import { i18nKey } from '@totalclaw/i18n';
import type { FauCompany, FauRegion, FauRegionProfile, FauStandard } from '@totalclaw/ipc-contracts';

export const FAU_REGION_PROFILES: FauRegionProfile[] = [
  {
    id: 'CN', name: i18nKey('中国'), available: true,
    standards: ['CAS', 'ASBE'], defaultStandard: 'CAS', currency: 'CNY', hijri: false,
    frameworks: [i18nKey('企业内部控制基本规范及配套指引'), i18nKey('中国内部审计准则')],
    taxRegimes: [i18nKey('增值税与金税 / 数电票'), i18nKey('企业所得税'), i18nKey('个人所得税与社保')],
    // 中国税率口径沿用财务智能体 tax.ts，本方案不另存一份
    ruleIds: [], draftBasis: false,
  },
  {
    id: 'INTL', name: i18nKey('国际'), available: true,
    standards: ['IFRS', 'IFRS_SME'], defaultStandard: 'IFRS', currency: 'USD', hijri: false,
    frameworks: ['SOX 404', 'COSO', i18nKey('IIA 国际内部审计标准')],
    taxRegimes: [i18nKey('参数化增值税 / 商品服务税'), i18nKey('参数化所得税（IAS 12）')],
    ruleIds: [], draftBasis: false,
  },
  {
    id: 'SA', name: i18nKey('沙特'), available: true,
    standards: ['SOCPA', 'SOCPA_SME'], defaultStandard: 'SOCPA', currency: 'SAR', hijri: true,
    frameworks: [i18nKey('沙特 CMA 公司治理规则'), i18nKey('IIA 国际内部审计标准')],
    taxRegimes: [i18nKey('ZATCA 增值税与电子发票'), i18nKey('天课'), i18nKey('外资部分所得税与预提税')],
    ruleIds: [
      'sa.vat_standard_rate', 'sa.vat_filing_frequency', 'sa.vat_return_due', 'sa.vat_correction_threshold',
      'sa.einvoice_required_fields', 'sa.einvoice_phase2_start',
      'sa.zakat_rate', 'sa.zakat_hijri_year_days', 'sa.zakat_return_due', 'sa.cit_rate_nonsaudi', 'sa.wht_return_due',
    ],
    draftBasis: true,
  },
  {
    id: 'AE', name: i18nKey('阿联酋'), available: true,
    standards: ['IFRS', 'IFRS_SME'], defaultStandard: 'IFRS', currency: 'AED', hijri: false,
    frameworks: [i18nKey('IIA 国际内部审计标准')],
    taxRegimes: [i18nKey('FTA 增值税'), i18nKey('企业所得税（阿联酋）')],
    // 税率只放规则表（region-rules.json）：增值税 5%、企业所得税 9% 与 375,000 迪拉姆免征额、小企业减免收入上限
    ruleIds: [
      'ae.vat_standard_rate', 'ae.vat_return_due', 'ae.vat_correction_threshold', 'ae.tax_invoice_required_fields',
      'ae.cit_rate', 'ae.cit_zero_threshold', 'ae.cit_small_business_revenue_cap', 'ae.cit_return_due',
    ],
    draftBasis: true,
  },
];

export const STANDARD_LABELS: Record<FauStandard, string> = {
  CAS: i18nKey('企业会计准则'),
  ASBE: i18nKey('小企业会计准则'),
  IFRS: 'IFRS',
  IFRS_SME: i18nKey('中小主体 IFRS'),
  SOCPA: i18nKey('经 SOCPA 认可的 IFRS'),
  SOCPA_SME: i18nKey('经 SOCPA 认可的中小主体 IFRS'),
};

export function regionProfile(id: FauRegion): FauRegionProfile {
  return FAU_REGION_PROFILES.find((p) => p.id === id) || FAU_REGION_PROFILES[0];
}

/** 报表行映射口径：中国准则按一级科目名称（复用财务智能体 reportMap.json），其余按 IFRS 行 */
export type FauReportBasis = 'cn' | 'ifrs';

export interface FauResolvedProfile {
  region: FauRegion;
  standard: FauStandard;
  reportBasis: FauReportBasis;
  currency: string;
  hijri: boolean;
  draftBasis: boolean;
  ruleIds: string[];
}

/** 运行时按公司档案给出准则、报表映射与规则 id，注入引擎与提示词（运行记录写下 ruleIds） */
export function resolveProfile(company: Pick<FauCompany, 'region' | 'standard' | 'currency'>): FauResolvedProfile {
  const p = regionProfile(company.region);
  const standard = p.standards.includes(company.standard) ? company.standard : p.defaultStandard;
  return {
    region: p.id,
    standard,
    reportBasis: standard === 'CAS' || standard === 'ASBE' ? 'cn' : 'ifrs',
    currency: company.currency || p.currency,
    hijri: p.hijri,
    draftBasis: p.draftBasis,
    ruleIds: p.ruleIds,
  };
}
