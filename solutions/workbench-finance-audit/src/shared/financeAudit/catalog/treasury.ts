/**
 * G5 资金与金融风险（7），批次 6：E1–E7 全部可用。
 * 硬边界：付款只出计划草稿与授权建议（不付款、不审批付款）；外汇只出敞口、策略与询价单草稿（不下单、不成交）。
 */
import { i18nKey } from '@totalclaw/i18n';
import type { FauModuleInput } from '@totalclaw/ipc-contracts';
import { PA, PR, PRA, type FauModuleSpec } from './types';

const IN = {
  balances: { kind: 'bank_balance', label: i18nKey('账户余额表'), help: i18nKey('每个银行账户一行：账号、开户银行、币种、网银余额、账面余额、资金系统余额，可选受限金额、安全线与存款利率；网银余额取企业网银的日终余额') },
  plan: { kind: 'cash_plan', label: i18nKey('资金计划表'), help: i18nKey('未来 13 周已知的收付：日期、类别、往来单位、流入、流出、确定性（确定 / 预计 / 可能）；工资、税款、到期贷款写「确定」') },
  ar: { kind: 'ar', label: i18nKey('应收明细（未清）'), help: i18nKey('客户、单据号、单据日期、到期日、未清金额；同一项目里应收与账龄模块已导入的应收明细可以直接选用') },
  ap: { kind: 'ap', label: i18nKey('应付明细（未清）'), help: i18nKey('供应商、单据号、单据日期、到期日、未清金额') },
  facilities: { kind: 'credit_facility', label: i18nKey('银行授信台账'), help: i18nKey('银行、授信额度、已用额度、利率、到期日，可选响应速度 / 产品创新 / 合作意愿评分（1–10 分）') },
  metrics: { kind: 'fin_metrics', label: i18nKey('财务指标表'), help: i18nKey('每个期间一行，实际数和预测数都可以（预测期标「是」）：营业收入、营业成本、EBITDA、利息支出、有息负债、流动资产、流动负债、存货、资产负债总额、净资产、还本付息') },
} as const;

const slot = (id: keyof typeof IN, o: Partial<FauModuleInput> = {}): FauModuleInput => ({ id, ...IN[id], required: false, ...o }) as FauModuleInput;

export const TREASURY_MODULES: FauModuleSpec[] = [
  {
    id: 'cash', code: 'E1', group: 'treasury', archetype: 'R', package: 'treasury', status: 'ready', batch: 6, outputs: ['xlsx'],
    name: i18nKey('现金管理'), summary: i18nKey('三方余额核对、13 周现金预测（三情景）、付款计划编排（不付款）'),
    modes: [
      { id: 'daily', name: i18nKey('资金日报'), skills: ['fa-cash-management-master', 'fa-cash-position-monitoring'], engines: ['cashPosition'] },
      { id: 'forecast', name: i18nKey('13 周现金预测'), skills: ['fa-cash-management-master', 'fa-cash-flow-forecasting'], engines: ['cashPosition', 'cashForecast'] },
      { id: 'payment', name: i18nKey('付款计划草稿'), skills: ['fa-cash-management-master', 'fa-payment-scheduling'], engines: ['paymentPlan'] },
    ],
    inputs: [
      slot('balances', { required: true }),
      slot('plan', { modes: ['forecast'], requiredModes: ['forecast'] }),
      slot('ar', { modes: ['forecast'] }),
      slot('ap', { modes: ['forecast'] }),
      slot('facilities', { modes: ['forecast'] }),
      { id: 'requests', kind: 'payment_request', required: false, modes: ['payment'], requiredModes: ['payment'], label: i18nKey('付款申请清单'), help: i18nKey('申请单号、收款方、付款金额、到期日、付款类别（工资 / 税款 / 租金 / 货款…），可选优先级 P0–P4、收款账户是否变更、是否个人账户') },
    ],
    signoff: { required: true, levels: PRA },
    regions: 'all',
  },
  {
    id: 'treasury', code: 'E2', group: 'treasury', archetype: 'H', package: 'treasury', status: 'ready', batch: 6, outputs: ['xlsx', 'docx'],
    name: i18nKey('司库'), summary: i18nKey('资金日报、多期预测、大额付款授权复核（只出建议）、现金池、银行关系、LCR 测算'),
    modes: [
      { id: 'position', name: i18nKey('资金日报与预测'), skills: ['fa-treasury-management-master', 'fa-daily-cash-position', 'fa-fund-forecast'], engines: ['cashPosition', 'cashForecast'] },
      { id: 'authorization', name: i18nKey('付款授权复核'), skills: ['fa-treasury-management-master', 'fa-payment-authorization-review'], engines: ['authorizationReview'] },
      { id: 'cash_pool', name: i18nKey('现金池方案'), skills: ['fa-treasury-advanced-master', 'fa-cash-pool-configuration'], engines: ['cashPool'] },
      { id: 'bank_relationship', name: i18nKey('银行关系评分'), skills: ['fa-treasury-advanced-master', 'fa-bank-relationship'], engines: ['bankScores'] },
      { id: 'liquidity', name: i18nKey('LCR 与 NSFR'), skills: ['fa-treasury-advanced-master', 'fa-lcr-assessment'], engines: ['lcr'] },
    ],
    inputs: [
      slot('balances', { modes: ['position', 'authorization', 'cash_pool', 'bank_relationship'], requiredModes: ['position', 'cash_pool'] }),
      slot('plan', { modes: ['position'], requiredModes: ['position'] }),
      slot('ar', { modes: ['position'] }),
      slot('ap', { modes: ['position'] }),
      slot('facilities', { modes: ['position', 'bank_relationship'], requiredModes: ['bank_relationship'] }),
      { id: 'requests', kind: 'payment_request', required: false, modes: ['authorization'], requiredModes: ['authorization'], label: i18nKey('付款申请清单'), help: i18nKey('申请单号、收款方、付款金额、付款账户，以及合同金额、累计已付、发票金额、审批权限、是否新供应商、收款账户是否变更、是否个人账户') },
      { id: 'liquidityItems', kind: 'liquidity_items', required: false, modes: ['liquidity'], requiredModes: ['liquidity'], label: i18nKey('流动性项目表'), help: i18nKey('每行一个项目：名称、类别（一级 / 二级 A / 二级 B 优质流动性资产、30 天流出、30 天流入、可用稳定资金、所需稳定资金）、金额，可选折算率或流失率') },
    ],
    signoff: { required: true, levels: PA },
    regions: 'all',
  },
  {
    id: 'fx', code: 'E3', group: 'treasury', archetype: 'H', package: 'treasury', status: 'ready', batch: 6, outputs: ['xlsx', 'docx'],
    name: i18nKey('外汇风险'), summary: i18nKey('交易、会计、经济敞口，对冲比例方案，只到询价单草稿'),
    modes: [
      { id: 'exposure', name: i18nKey('敞口与敏感性'), skills: ['fa-fx-risk-master', 'fa-fx-exposure-calculation'], engines: ['fxExposure'] },
      { id: 'hedge', name: i18nKey('对冲方案与询价单草稿'), skills: ['fa-fx-risk-master', 'fa-fx-exposure-calculation', 'fa-fx-forecast-analysis', 'fa-fx-hedging-strategy'], engines: ['fxExposure', 'hedgePlan'] },
    ],
    inputs: [
      { id: 'fxExposure', kind: 'fx_exposure', required: true, label: i18nKey('外币敞口明细'), help: i18nKey('币种、类型（外币应收 / 应付、预测收入 / 支出、外币资产 / 负债、计价收入 / 成本、已卖出 / 已买入远期）、外币金额、确定性（确定 / 很可能 / 可能）、日期') },
      { id: 'fxRates', kind: 'fx_rates', required: true, label: i18nKey('期末汇率表'), help: i18nKey('币种与汇率（1 单位外币折合多少本位币），可用央行中间价或银行公布价') },
    ],
    signoff: { required: true, levels: PA },
    regions: 'all',
    standards: ['CAS', 'IFRS'],
  },
  {
    id: 'financing', code: 'E4', group: 'treasury', archetype: 'H', package: 'treasury', status: 'ready', batch: 6, outputs: ['xlsx', 'docx'],
    name: i18nKey('融资结构'), summary: i18nKey('融资成本与 WACC、契约条款监控与预测、债务重组方案'),
    modes: [
      { id: 'cost', name: i18nKey('融资成本与 WACC'), skills: ['fa-financing-structure-master', 'fa-financing-cost'], engines: ['financingCost'] },
      { id: 'covenant', name: i18nKey('契约监控'), skills: ['fa-financing-structure-master', 'fa-covenant-compliance-monitoring'], engines: ['covenantChecks'] },
      { id: 'restructure', name: i18nKey('债务重组方案'), skills: ['fa-financing-structure-master', 'fa-debt-restructuring', 'fa-bank-relationship'], engines: ['financingCost', 'covenantChecks'] },
    ],
    inputs: [
      { id: 'loans', kind: 'loan', required: false, modes: ['cost', 'restructure'], requiredModes: ['cost', 'restructure'], label: i18nKey('借款台账'), help: i18nKey('合同编号、贷款人、融资类型、本金余额、利率、费率、起始日、到期日、还款方式') },
      slot('metrics', { requiredModes: ['covenant', 'restructure'] }),
      { id: 'covenants', kind: 'covenant', required: false, modes: ['covenant', 'restructure'], requiredModes: ['covenant'], label: i18nKey('借款契约条款'), help: i18nKey('贷款人、条款、指标（杠杆率 / 利息保障倍数 / 流动比率 / 资产负债率 / 偿债覆盖率 / 净资产）、比较方向（≤ / ≥）、限值') },
    ],
    signoff: { required: true, levels: PA },
    regions: 'all',
  },
  {
    id: 'ifrs9', code: 'E5', group: 'treasury', archetype: 'R', package: 'treasury', status: 'ready', batch: 6, outputs: ['xlsx', 'docx'],
    name: i18nKey('预期信用损失（IFRS 9 / CAS 22）'), summary: i18nKey('三阶段分类、违约概率 × 违约损失率 × 违约敞口、三情景加权、应收简化法拨备矩阵、披露表'),
    modes: [
      { id: 'general', name: i18nKey('一般法（三阶段）'), skills: ['fa-ifrs9-credit-risk-master', 'fa-stage-classification', 'fa-ecl-calculation', 'fa-macro-forward-adjustment', 'fa-ecl-disclosure'], engines: ['stageClassification', 'eclGeneral'] },
      { id: 'simplified', name: i18nKey('简化法（应收拨备矩阵）'), skills: ['fa-ifrs9-credit-risk-master', 'fa-ecl-calculation', 'fa-macro-forward-adjustment', 'fa-ecl-disclosure'], engines: ['eclSimplified'] },
    ],
    inputs: [
      { id: 'exposures', kind: 'credit_exposure', required: false, modes: ['general'], requiredModes: ['general'], label: i18nKey('信用敞口明细'), help: i18nKey('敞口编号、交易对手、账面余额、未提用额度、初始评级与当前评级、逾期天数、是否关注名单 / 已减值，可选 PD、LGD、实际利率、剩余期限、上期阶段') },
      { id: 'ar', kind: 'ar', required: false, modes: ['simplified'], requiredModes: ['simplified'], label: i18nKey('应收账龄明细'), help: i18nKey('直接选用应收与账龄模块已导入的应收明细，或上传：客户、单据日期、到期日、未清金额') },
      { id: 'scenarios', kind: 'macro_scenario', required: false, label: i18nKey('宏观情景表'), help: i18nKey('乐观 / 基准 / 悲观三行：权重（合计 100%）与 PD 调整系数；不上传按 25% / 50% / 25% 与 0.75 / 1 / 1.5') },
      { id: 'lossRates', kind: 'loss_rates', required: false, modes: ['simplified'], label: i18nKey('账龄损失率表'), help: i18nKey('账龄区间与历史损失率；不上传用默认损失率并提醒校准') },
    ],
    signoff: { required: true, levels: PRA },
    regions: 'all',
    standards: ['CAS', 'IFRS'],
  },
  {
    id: 'working-capital', code: 'E6', group: 'treasury', archetype: 'R', package: 'treasury', status: 'ready', batch: 6, outputs: ['xlsx', 'docx'],
    name: i18nKey('营运资本'), summary: i18nKey('周转天数与现金转换周期、存货优化、应付策略、供应链金融选项'),
    modes: [
      { id: 'ccc', name: i18nKey('周转天数与现金转换周期'), skills: ['fa-working-capital-master', 'fa-cash-conversion-cycle'], engines: ['cccMetrics', 'inventoryAbc'] },
      { id: 'inventory', name: i18nKey('存货优化'), skills: ['fa-working-capital-master', 'fa-inventory-optimization'], engines: ['inventoryAbc'] },
      { id: 'payables', name: i18nKey('应付策略与供应链金融'), skills: ['fa-working-capital-master', 'fa-payables-strategy', 'fa-supply-chain-finance'], engines: ['supplierTerms', 'scfOptions'] },
    ],
    inputs: [
      slot('ar', { modes: ['ccc', 'payables'], requiredModes: ['ccc'] }),
      slot('ap', { modes: ['ccc', 'payables'], requiredModes: ['ccc', 'payables'] }),
      { id: 'inventory', kind: 'inventory', required: false, requiredModes: ['inventory'], label: i18nKey('存货明细'), help: i18nKey('物料编码、名称、库存金额、年耗用金额、最后出入库日期') },
      { id: 'metrics', kind: 'fin_metrics', required: false, modes: ['ccc', 'payables'], requiredModes: ['ccc', 'payables'], label: i18nKey('财务指标表'), help: i18nKey('本期营业收入与营业成本（每个期间一行），可选期间天数') },
    ],
    signoff: { required: true, levels: PR },
    regions: 'all',
  },
  {
    id: 'investments', code: 'E7', group: 'treasury', archetype: 'H', package: 'treasury', status: 'ready', batch: 6, outputs: ['xlsx', 'docx'],
    name: i18nKey('投融资管理'), summary: i18nKey('投资盘点与浮盈亏、融资余额与授信使用、流动性指标'),
    modes: [
      { id: 'portfolio', name: i18nKey('投资盘点与复盘'), skills: ['fa-investment-management-master', 'fa-investment-portfolio-review', 'fa-investment-compliance-check'], engines: ['portfolio'] },
      { id: 'liquidity', name: i18nKey('流动性评估'), skills: ['fa-investment-management-master', 'fa-liquidity-assessment'], engines: ['liquidity'] },
    ],
    inputs: [
      { id: 'investments', kind: 'investment', required: false, requiredModes: ['portfolio'], label: i18nKey('投资台账'), help: i18nKey('产品代码、产品名称、投资类型、发行人、投资成本、市值、风险等级（R1–R5）、到期日、是否在批准清单内、收益率、变现天数') },
      slot('balances', { modes: ['liquidity'], requiredModes: ['liquidity'] }),
      { id: 'loans', kind: 'loan', required: false, modes: ['liquidity'], label: i18nKey('借款台账'), help: i18nKey('合同编号、贷款人、融资类型、本金余额、利率、费率、起始日、到期日、还款方式') },
      slot('facilities', { modes: ['liquidity'] }),
      slot('metrics', { modes: ['liquidity'], requiredModes: ['liquidity'] }),
    ],
    signoff: { required: true, levels: PR },
    regions: 'all',
  },
];
