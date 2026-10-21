/** 税务组（批次 4）阈值的界面名称（三语，走词典）。JSON 里的 label 是原文说明（中文，界面标「以原文为准」）。 */
import { i18nKey } from '@totalclaw/i18n';

export const TAX_THRESHOLD_LABELS: Record<string, string> = {
  'tax.vatLineTol': i18nKey('逐行税额核对容差'),
  'tax.topSupplierShare': i18nKey('进项 TOP 3 供应商占比预警'),
  'tax.inputOverOutputMonthsWarn': i18nKey('进项连续大于销项：关注月数'),
  'tax.inputOverOutputMonthsHigh': i18nKey('进项连续大于销项：升级月数'),
  'regulatory.cn.txnAssetsPct': i18nKey('交易资产总额占总资产比例（披露）'),
  'regulatory.cn.txnNetAssetsPct': i18nKey('成交金额占净资产比例（披露）'),
  'regulatory.cn.txnNetAssets.floor': i18nKey('成交金额绝对额下限（披露）'),
  'regulatory.cn.txnProfitPct': i18nKey('交易利润占净利润比例（披露）'),
  'regulatory.cn.txnProfit.floor': i18nKey('交易利润绝对额下限（披露）'),
  'regulatory.cn.shareholderPct': i18nKey('提交股东大会的比例'),
  'regulatory.cn.shareholderNetAssets.floor': i18nKey('提交股东大会的成交金额下限'),
  'regulatory.cn.shareholderProfit.floor': i18nKey('提交股东大会的利润下限'),
  'regulatory.cn.rptNatural.floor': i18nKey('与关联自然人交易披露下限'),
  'regulatory.cn.rptLegal.floor': i18nKey('与关联法人交易披露下限'),
  'regulatory.cn.rptLegalPct': i18nKey('与关联法人交易占净资产比例（披露）'),
  'regulatory.cn.rptShareholder.floor': i18nKey('关联交易提交股东大会的金额下限'),
  'regulatory.cn.rptShareholderPct': i18nKey('关联交易提交股东大会的净资产比例'),
  'regulatory.intl.materialityPct': i18nKey('国际口径重要性比例（占净利润）'),
  'transfer-pricing.minComparables': i18nKey('可比公司最少家数'),
  'transfer-pricing.intlCbcr.floor': i18nKey('国际口径国别报告门槛'),
};
