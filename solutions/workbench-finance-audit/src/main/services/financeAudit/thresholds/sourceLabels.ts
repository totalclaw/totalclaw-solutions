/**
 * 阈值出处 → 界面上可读的「依据」名（三语，走词典）。
 * thresholds/*.json 的 source.file 记的是上游开源项目里的文件路径（许可证与回溯用），界面一律不显示路径，
 * 只显示这里的名字 + 章节原文。新增阈值文件时在这里补一行；ipc/financeAudit/financeAudit.sample.flow.test.ts 守着「每个出处都有名字」。
 */
import { i18nKey } from '@totalclaw/i18n';

const FS = 'finance-skills/skills/';
const FSV = 'financial-services/plugins/vertical-plugins/';

export const SOURCE_LABELS: Record<string, string> = {
  // 月结关账
  [`${FS}month-end-close/references/判断框架.md`]: i18nKey('月结关账判断框架'),
  [`${FS}month-end-close/skills/close-checklist-executor/SKILL.md`]: i18nKey('关账清单执行规范'),
  [`${FS}month-end-close/skills/close-verification/SKILL.md`]: i18nKey('关账勾稽核对规范'),
  [`${FS}month-end-close/skills/cross-period-adjustment/SKILL.md`]: i18nKey('跨期调整规范'),
  [`${FS}month-end-close/skills/reconciliation-automation/SKILL.md`]: i18nKey('自动对账规范'),
  [`${FSV}fund-admin/skills/variance-commentary/SKILL.md`]: i18nKey('波动说明撰写规范'),
  [`${FSV}fund-admin/skills/gl-recon/SKILL.md`]: i18nKey('总账与子账对账规范'),
  [`${FSV}fund-admin/skills/nav-tieout/SKILL.md`]: i18nKey('基金净值勾稽规范'),
  // 应收 / 应付 / 费用
  [`${FS}accounts-receivable/CLAUDE.md`]: i18nKey('应收管理场景约定'),
  [`${FS}accounts-receivable/references/判断框架.md`]: i18nKey('应收管理判断框架'),
  [`${FS}accounts-receivable/references/数据源清单.md`]: i18nKey('应收管理数据源清单'),
  [`${FS}accounts-receivable/skills/aging-analysis-ar/SKILL.md`]: i18nKey('应收账龄分析规范'),
  [`${FS}accounts-receivable/skills/credit-assessment/SKILL.md`]: i18nKey('客户信用评估规范'),
  [`${FS}accounts-payable/CLAUDE.md`]: i18nKey('应付管理场景约定'),
  [`${FS}accounts-payable/references/判断框架.md`]: i18nKey('应付管理判断框架'),
  [`${FS}accounts-payable/references/数据源清单.md`]: i18nKey('应付管理数据源清单'),
  [`${FS}accounts-payable/skills/payment-scheduling/SKILL.md`]: i18nKey('付款排期规范'),
  [`${FS}accounts-payable/skills/supplier-payment-review/SKILL.md`]: i18nKey('供应商付款复核规范'),
  [`${FS}accounts-payable/skills/triple-match-automation-ap/SKILL.md`]: i18nKey('三单匹配规范'),
  [`${FS}cash-management/skills/payment-scheduling-cm/SKILL.md`]: i18nKey('资金付款排期规范'),
  [`${FS}expense-review/references/判断框架.md`]: i18nKey('费用报销判断框架'),
  [`${FS}expense-review/skills/dispute-identification/SKILL.md`]: i18nKey('报销异常识别规范'),
  [`${FS}expense-review/skills/policy-compliance-check/SKILL.md`]: i18nKey('报销制度合规检查规范'),
  [`${FS}expense-review/skills/reimbursement-review/SKILL.md`]: i18nKey('报销审核规范'),
  // 固定资产 / 薪酬 / 内部往来
  [`${FS}fixed-assets/CLAUDE.md`]: i18nKey('固定资产场景约定'),
  [`${FS}fixed-assets/references/数据源清单.md`]: i18nKey('固定资产数据源清单'),
  [`${FS}payroll-accounting/CLAUDE.md`]: i18nKey('薪酬核算场景约定'),
  [`${FS}payroll-accounting/references/数据源清单.md`]: i18nKey('薪酬核算数据源清单'),
  [`${FS}payroll-accounting/skills/social-insurance-review/SKILL.md`]: i18nKey('社保公积金复核规范'),
  [`${FS}intercompany-accounting/references/判断框架.md`]: i18nKey('内部往来判断框架'),
  [`${FS}intercompany-accounting/references/数据源清单.md`]: i18nKey('内部往来数据源清单'),
  [`${FS}intercompany-accounting/skills/intercompany-guarantee-review/SKILL.md`]: i18nKey('内部担保复核规范'),
  // 审计与内控
  [`${FS}internal-control/skills/control-deficiency/SKILL.md`]: i18nKey('控制缺陷评价规范'),
  [`${FS}internal-control/skills/control-testing/SKILL.md`]: i18nKey('控制测试规范'),
  [`${FS}internal-audit/CLAUDE.md`]: i18nKey('内部审计场景约定'),
  [`${FS}internal-audit/references/判断框架.md`]: i18nKey('内部审计判断框架'),
  [`${FS}internal-audit/skills/annual-audit-planning/SKILL.md`]: i18nKey('年度审计计划规范'),
  [`${FS}audit-support/references/判断框架.md`]: i18nKey('外审配合判断框架'),
  [`${FS}audit-support/skills/audit-adjustment-review/SKILL.md`]: i18nKey('审计调整复核规范'),
  [`${FS}audit-support/skills/confirmation-management/SKILL.md`]: i18nKey('函证管理规范'),
  [`${FSV}financial-analysis/skills/audit-xls/SKILL.md`]: i18nKey('表格与模型审计规范'),
  [`${FSV}operations/skills/kyc-doc-parse/SKILL.md`]: i18nKey('客商资料解析规范'),
  [`${FSV}operations/skills/kyc-rules/SKILL.md`]: i18nKey('客商尽调规则'),
  // 税务与合规
  [`${FS}tax-filing/references/判断框架.md`]: i18nKey('纳税申报判断框架'),
  [`${FS}transfer-pricing-documentation/references/判断框架.md`]: i18nKey('转让定价文档判断框架'),
  // 财务分析与管理报告
  [`${FS}budget-management/references/判断框架.md`]: i18nKey('预算管理判断框架'),
  [`${FS}financial-analysis/references/判断框架.md`]: i18nKey('财务分析判断框架'),
  [`${FS}cost-control/references/判断框架.md`]: i18nKey('成本控制判断框架'),
  [`${FS}kpi-management/references/判断框架.md`]: i18nKey('KPI 管理判断框架'),
  [`${FS}business-insight/skills/trend-analysis/SKILL.md`]: i18nKey('趋势分析规范'),
  [`${FS}esg-reporting/references/判断框架.md`]: i18nKey('ESG 报告判断框架'),
  [`${FS}esg-reporting/skills/esg-materiality-assessment/SKILL.md`]: i18nKey('ESG 重大性评估规范'),
  [`${FS}strategic-planning/references/判断框架.md`]: i18nKey('战略规划判断框架'),
  [`${FS}strategic-planning/skills/strategic-risk-assessment/SKILL.md`]: i18nKey('战略风险评估规范'),
  // 资金与金融风险
  [`${FS}cash-management/references/判断框架.md`]: i18nKey('现金管理判断框架'),
  [`${FS}cash-management/skills/cash-flow-forecasting/SKILL.md`]: i18nKey('现金流预测规范'),
  [`${FS}cash-management/skills/cash-position-monitoring/SKILL.md`]: i18nKey('资金头寸监控规范'),
  [`${FS}treasury-management/references/判断框架.md`]: i18nKey('司库管理判断框架'),
  [`${FS}treasury-management/skills/payment-authorization-review/SKILL.md`]: i18nKey('付款授权审核规范'),
  [`${FS}treasury-advanced/references/判断框架.md`]: i18nKey('司库进阶判断框架'),
  [`${FS}treasury-advanced/skills/bank-relationship-assessment/SKILL.md`]: i18nKey('银行关系评估规范'),
  [`${FS}treasury-advanced/skills/cash-pool-configuration/SKILL.md`]: i18nKey('现金池配置规范'),
  [`${FS}treasury-advanced/skills/lcr-assessment/SKILL.md`]: i18nKey('流动性覆盖率评估规范'),
  [`${FS}fx-risk/references/判断框架.md`]: i18nKey('外汇风险判断框架'),
  [`${FS}fx-risk/skills/fx-exposure-calculation/SKILL.md`]: i18nKey('外汇敞口计算规范'),
  [`${FS}fx-risk/skills/fx-hedging-strategy/SKILL.md`]: i18nKey('外汇套期策略规范'),
  [`${FS}financing-structure/skills/covenant-compliance-monitoring/SKILL.md`]: i18nKey('借款契约合规监控规范'),
  [`${FS}financing-structure/skills/financing-cost-calculation/SKILL.md`]: i18nKey('融资成本测算规范'),
  [`${FS}ifrs9-credit-risk/references/判断框架.md`]: i18nKey('预期信用损失判断框架'),
  [`${FS}ifrs9-credit-risk/references/ECL计算详解.md`]: i18nKey('预期信用损失计算详解'),
  [`${FS}investment-management/references/判断框架.md`]: i18nKey('投资管理判断框架'),
  [`${FS}investment-management/skills/liquidity-assessment/SKILL.md`]: i18nKey('流动性评估规范'),
  'scripts/finance-audit-selfbuilt/fa-inventory-optimization/SKILL.md': i18nKey('库存优化规范（本方案自建）'),
  'scripts/finance-audit-selfbuilt/fa-payables-strategy/SKILL.md': i18nKey('应付策略规范（本方案自建）'),
  'scripts/finance-audit-selfbuilt/fa-supply-chain-finance/SKILL.md': i18nKey('供应链金融规范（本方案自建）'),
  'Basel III LCR（BCBS 238）': i18nKey('巴塞尔协议 III 流动性覆盖率（BCBS 238）'),
  'Basel III NSFR（BCBS 295）': i18nKey('巴塞尔协议 III 净稳定资金比例（BCBS 295）'),
  // 投融资与估值
  [`${FSV}financial-analysis/skills/dcf-model/SKILL.md`]: i18nKey('DCF 估值建模规范'),
  // 不是上游项目的出处：法规、公开规则、本方案取值、财务智能体同口径
  'docs/finance-audit-solution.md': i18nKey('本方案默认取值'),
  'apps/desktop-shell/src/main/services/financeAgent/budget.ts': i18nKey('财务智能体预算规则（同口径）'),
  'apps/desktop-shell/src/main/services/financeAgent/risk.ts': i18nKey('财务智能体风险巡检规则（同口径）'),
  'GOSI 公开缴费规则（非源项目）': i18nKey('沙特 GOSI 公开缴费规则'),
  '《沙特劳动法》第 84 条（非源项目，草稿口径）': i18nKey('《沙特劳动法》第 84 条（草稿口径）'),
  '上海证券交易所股票上市规则（2024 年 4 月修订）': i18nKey('上海证券交易所股票上市规则（2024 年 4 月修订）'),
  'OECD/G20 BEPS Action 13 Final Report': i18nKey('OECD/G20 BEPS 第 13 项行动计划最终报告'),
};

/** 没登记的出处不回落成路径：宁可只显示章节 */
export function thresholdBasis(file: string): string {
  return SOURCE_LABELS[file] || '';
}
