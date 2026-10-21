/**
 * G5 资金与金融风险（E1–E7，批次 6）的枚举文案：主进程产出（tIn）与渲染层面板（$t）共用一份词典 key。
 */
import { i18nKey } from '@totalclaw/i18n';
import type {
  FauEclBucket, FauAuthAdvice, FauCashScenarioId, FauCovenantMetric, FauFlowCertainty, FauFxCertainty, FauFxKind,
  FauInvestType, FauLiquidityCategory, FauScfOption, FauTreasuryRag,
} from '@totalclaw/ipc-contracts';

export const RAG_LABEL: Record<FauTreasuryRag, string> = { ok: i18nKey('正常'), watch: i18nKey('关注'), breach: i18nKey('越线') };
export const RECON3_LABEL: Record<FauTreasuryRag, string> = { ok: i18nKey('三方一致'), watch: i18nKey('轻微差异'), breach: i18nKey('差异较大') };

export const SCENARIO_LABEL: Record<FauCashScenarioId | string, string> = {
  optimistic: i18nKey('乐观'), base: i18nKey('基准'), pessimistic: i18nKey('悲观'),
};
export const FLOW_CERTAINTY_LABEL: Record<FauFlowCertainty, string> = { committed: i18nKey('确定'), expected: i18nKey('预计'), possible: i18nKey('可能') };
export const FLOW_SOURCE_LABEL: Record<string, string> = { plan: i18nKey('资金计划'), ar: i18nKey('应收到期'), ap: i18nKey('应付到期') };
export const GAP_TIER_LABEL: Record<string, string> = { none: i18nKey('无缺口'), small: i18nKey('小额缺口'), large: i18nKey('大额缺口'), severe: i18nKey('超大额缺口') };

export const PAY_PRIORITY_HINT: Record<string, string> = {
  P0: i18nKey('立即支付，不可延后（工资社保、税款、到期贷款、判决）'),
  P1: i18nKey('优先支付（紧急供应商、租金水电等固定支出）'),
  P2: i18nKey('正常支付（按账期的常规付款）'),
  P3: i18nKey('可延后 1–2 周'),
  P4: i18nKey('战略延后，与对方协商'),
};
export const PAY_PLAN_LABEL: Record<string, string> = { schedule: i18nKey('排入计划'), defer: i18nKey('延后'), hold: i18nKey('暂停核实') };
export const PRIORITY_SOURCE_LABEL: Record<string, string> = { given: i18nKey('表内指定'), category: i18nKey('按类别'), default: i18nKey('默认') };

export const AUTH_ADVICE_LABEL: Record<FauAuthAdvice, string> = {
  proceed: i18nKey('建议放行（由有权人审批）'), request_docs: i18nKey('补充资料'), hold: i18nKey('暂缓'), reject_recommend: i18nKey('建议拒绝'),
};
export const BANK_TIER_LABEL: Record<string, string> = { core: i18nKey('核心合作银行'), key: i18nKey('重点维护银行'), general: i18nKey('一般关系银行') };
export const LIQ_CATEGORY_LABEL: Record<FauLiquidityCategory, string> = {
  hqla_l1: i18nKey('一级优质流动性资产'), hqla_l2a: i18nKey('二级 A 优质流动性资产'), hqla_l2b: i18nKey('二级 B 优质流动性资产'),
  outflow: i18nKey('30 天现金流出'), inflow: i18nKey('30 天现金流入'), asf: i18nKey('可用稳定资金'), rsf: i18nKey('所需稳定资金'),
};

export const FX_KIND_LABEL: Record<FauFxKind, string> = {
  receivable: i18nKey('外币应收'), payable: i18nKey('外币应付'), forecast_inflow: i18nKey('预测外币收入'), forecast_outflow: i18nKey('预测外币支出'),
  asset: i18nKey('外币资产'), liability: i18nKey('外币负债'), revenue: i18nKey('外币计价收入'), cost: i18nKey('外币计价成本'),
  hedge_sell: i18nKey('已卖出远期'), hedge_buy: i18nKey('已买入远期'),
};
export const FX_CERTAINTY_LABEL: Record<FauFxCertainty, string> = { firm: i18nKey('确定敞口'), highly_probable: i18nKey('很可能敞口'), possible: i18nKey('可能敞口') };
export const FX_SIDE_LABEL: Record<string, string> = { sell: i18nKey('卖出外币'), buy: i18nKey('买入外币') };

export const COVENANT_METRIC_LABEL: Record<FauCovenantMetric, string> = {
  debt_to_ebitda: i18nKey('有息负债 / EBITDA'), interest_cover: i18nKey('利息保障倍数'), current_ratio: i18nKey('流动比率'),
  debt_ratio: i18nKey('资产负债率'), dscr: i18nKey('偿债覆盖率'), net_worth: i18nKey('净资产'),
};
export const COVENANT_OP_LABEL: Record<string, string> = { le: '≤', ge: '≥' };
export const MATURITY_BUCKET_LABEL: Record<string, string> = {
  y1: i18nKey('1 年内'), y2: i18nKey('1–2 年'), y3: i18nKey('2–3 年'), y5: i18nKey('3–5 年'), y5plus: i18nKey('5 年以上'),
};
export const LOAN_INSTRUMENT_LABEL: Record<string, string> = { loan: i18nKey('银行贷款'), bond: i18nKey('债券'), lease: i18nKey('融资租赁'), other: i18nKey('其它') };

export const ECL_REASON_LABEL: Record<string, string> = {
  dpd90: i18nKey('逾期 90 天以上'), default_rating: i18nKey('评级为违约'), impaired: i18nKey('已发生信用减值'),
  dpd30: i18nKey('逾期 30 天以上'), downgrade: i18nKey('评级下调 2 级以上'), watchlist: i18nKey('进入关注名单'), ig_to_sub: i18nKey('投资级降为投机级'),
};
export const ECL_STAGE_LABEL: Record<number, string> = { 0: i18nKey('本期新增'), 1: i18nKey('第一阶段'), 2: i18nKey('第二阶段'), 3: i18nKey('第三阶段') };
export const AGING_BUCKET_LABEL: Record<FauEclBucket, string> = {
  current: i18nKey('未到期'), d30: i18nKey('逾期 1–30 天'), d60: i18nKey('逾期 31–60 天'), d90: i18nKey('逾期 61–90 天'),
  d180: i18nKey('逾期 91–180 天'), d365: i18nKey('逾期 181–365 天'), d365plus: i18nKey('逾期 365 天以上'),
};

export const INV_AGING_LABEL: Record<string, string> = { active: i18nKey('正常周转'), slow: i18nKey('呆滞'), obsolete: i18nKey('过时') };
export const SCF_LABEL: Record<FauScfOption['id'], string> = {
  reverse_factoring: i18nKey('反向保理（供应商融资）'), receivables_factoring: i18nKey('应收账款保理'),
  dynamic_discounting: i18nKey('动态折扣（提前付款换折扣）'), inventory_finance: i18nKey('存货融资'),
};

export const INVEST_TYPE_LABEL: Record<FauInvestType, string> = {
  deposit: i18nKey('存款'), money_fund: i18nKey('货币基金'), wmp: i18nKey('银行理财'), bond: i18nKey('债券'), equity: i18nKey('股票'), fund: i18nKey('基金'), other: i18nKey('其它'),
};
export const INVEST_BUCKET_LABEL: Record<string, string> = {
  d30: i18nKey('30 天内'), d90: i18nKey('31–90 天'), d180: i18nKey('91–180 天'), d365: i18nKey('181–365 天'), y1plus: i18nKey('1 年以上'), open: i18nKey('无固定期限'),
};

/** 模型说明段的主题 */
export const NARRATIVE_TOPIC_LABEL: Record<string, string> = {
  pool_structure: i18nKey('现金池结构'), pool_benefit: i18nKey('归集效益与风险'),
  hedge_strategy: i18nKey('对冲策略'), hedge_cost: i18nKey('工具与成本'),
  restructure_options: i18nKey('债务重组选项'), restructure_risks: i18nKey('风险与前提'),
  portfolio_review: i18nKey('组合复盘'), liquidity_view: i18nKey('流动性评估'),
};
