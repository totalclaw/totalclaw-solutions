/**
 * 外贸工作台十个模块 → 外贸技能库的相关技能与外贸专家角色（只做登记与引用，不碰业务逻辑）。
 *
 * 技能在 resources/bundled-skills/foreign-trade/（scripts/import-foreign-trade-skills.mjs 生成，同步到技能库 foreign-trade 分类）；
 * 角色在 roles/bundled/。模块头的「相关技能」从这里取：点一个技能就和该模块的外贸专家开一个单聊，草稿里写明用哪个技能。
 * 每个模块第一项是该类的目录技能（ft-<类>-master）。守卫测试核对这里的名字在技能目录 / 角色目录里真实存在。
 */
import type { FtModuleKey } from '@totalclaw/ipc-contracts';

export const FT_MODULE_SKILLS: Record<FtModuleKey, readonly string[]> = {
  platform: ['ft-platform-master', 'ft-platform', 'ft-ecom-listing-creative', 'ft-ecommerce-master', 'ft-amazon-sp-listing-troubleshooter'],
  prospect: ['ft-prospect-master', 'ft-buyer-market-intel', 'ft-icp-fit-scoring', 'ft-cold-email-frameworks', 'ft-outbound-send-gate', 'ft-google-maps-leads'],
  inquiry: ['ft-inquiry-master', 'ft-reply-triage-unsubscribe', 'ft-objection-handling', 'ft-inquiry-training'],
  background: ['ft-background-master', 'ft-sanctions-screening', 'ft-export-control-check', 'ft-trade-osint-redflag-scoring', 'ft-customer-background-research'],
  followup: ['ft-followup-master', 'ft-trade-follow-up', 'ft-daily-followup-review', 'ft-outbound-send-gate'],
  content: ['ft-content-master', 'ft-product-description', 'ft-short-video', 'ft-ecom-product-image'],
  social: ['ft-social-master', 'ft-social-media', 'ft-seo-aeo', 'ft-b2b-website-builder'],
  quote: ['ft-quote-master', 'ft-rfq-to-quotation', 'ft-hs-code-lookup', 'ft-hs-code-classify', 'ft-tariff-calculator-amazon'],
  order: ['ft-order-master', 'ft-trade-docs-run', 'ft-verify-trade-docs', 'ft-customs-declaration-tools'],
  report: ['ft-report-master', 'ft-comtrade-market-data', 'ft-market-analysis', 'ft-inquiry-meeting'],
};

/** 各模块交给哪位外贸专家（roles/bundled 下的角色 id = 文件名） */
export const FT_MODULE_ROLE: Record<FtModuleKey, string> = {
  platform: 'sales-cross-border-ecommerce-operator',
  prospect: 'sales-foreign-trade-rep',
  inquiry: 'sales-foreign-trade-rep',
  background: 'legal-trade-compliance-specialist',
  followup: 'sales-foreign-trade-rep',
  content: 'sales-cross-border-ecommerce-operator',
  social: 'sales-cross-border-ecommerce-operator',
  quote: 'sales-foreign-trade-rep',
  order: 'supply-chain-trade-documentation-specialist',
  report: 'sales-foreign-trade-rep',
};
