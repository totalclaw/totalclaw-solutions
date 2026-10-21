/**
 * 示例项目的数据表（一键体验）：每个已可用的业务模块一条，写明用哪个模式、第 ② 步每个槽位放哪份示例文件、运行参数。
 * 文件内容全部来自本目录的手算夹具（各批次单测、流程测试、E2E 共用同一份），所以示例项目的结果和单测断言的数字一致。
 * 同名文件在示例项目里只导入一次，多个模块共用同一个数据集。
 */
import type { FauInputKind } from '@totalclaw/ipc-contracts';
import * as CLOSE from './accounting/close';
import * as BANK from './accounting/bank';
import * as SUB from './accounting/subledgers';
import { bankXlsx, budgetXlsx, journalXlsx, policyXlsx, tbXlsx } from './accounting/toXlsx';
import * as AUD from './audit/data';
import * as TAX from './tax';
import * as F from './fpa/fpa';
import { deptJournalXlsx, kpiXlsx, pvXlsx } from './fpa/toXlsx';
import * as TR from './treasury';
import { fxRatesXlsx, openItemsXlsx, treasuryXlsx } from './treasury/toXlsx';
import { DCF_FX } from './capital/valuation';
import type { TreasuryKind } from '../engines/treasury/types';

export interface SampleFile { name: string; kind: FauInputKind; write: (path: string) => unknown }
export interface SampleRunSpec { moduleId: string; modeId: string; inputs: Record<string, SampleFile[]>; params?: Record<string, unknown> }

export const SAMPLE_PERIOD = '2026-09';
export const SAMPLE_SIGNERS = [
  { id: 'sg_sample_prep', name: '张会计', title: '总账会计', levels: ['prepare'] },
  { id: 'sg_sample_rev', name: '李主管', title: '财务主管', levels: ['review'] },
  { id: 'sg_sample_appr', name: '王经理', title: '财务经理', levels: ['approve'] },
] as const;

const y = (c: number | null | undefined) => (c == null ? '' : Math.round(c) / 100);
const file = (name: string, kind: FauInputKind, write: (path: string) => unknown): SampleFile => ({ name, kind, write });
const table = (name: string, kind: FauInputKind, t: SUB.RawTable) => file(name, kind, (p) => SUB.writeTable(p, t));
const sheet = (name: string, kind: FauInputKind, headers: string[], rows: (string | number)[][]) => file(name, kind, (p) => AUD.writeTable(p, headers, rows));
const doc = (name: string, text: string) => file(name, 'evidence', (p) => AUD.writeText(p, text));

// ── 会计核算 ──
const journal = file('序时账-2026-09.xlsx', 'journal', (p) => journalXlsx(p, CLOSE.journal));
const tb = file('科目余额表-2026-09.xlsx', 'tb', (p) => tbXlsx(p, CLOSE.tb));
const tbPrior = file('科目余额表-2026-08.xlsx', 'tb', (p) => tbXlsx(p, CLOSE.tbPrior));

// ── 资金与金融风险（批次 6 夹具） ──
const tr = (name: string, kind: TreasuryKind, rows: unknown[]) => file(name, kind, (p) => treasuryXlsx(p, kind, rows as Record<string, unknown>[]));
const openItems = (name: string, kind: 'ar' | 'ap', rows: typeof TR.agingAr) => file(name, kind, (p) => openItemsXlsx(p, rows));
const balances = tr('银行账户余额-2026-09-30.xlsx', 'bank_balance', TR.balances);
const facilities = tr('银行授信.xlsx', 'credit_facility', TR.facilities);
const finMetrics = tr('财务指标.xlsx', 'fin_metrics', TR.metrics);

/** 投融资与估值：没有文件，按录入定义（capital/specs.ts）手工录入；sample.actions 用 sanitizeInputs 规整 */
const M = (v: number | string) => ({ v, src: { kind: 'manual' } });
const cap = (fields: Record<string, number | string | null>, tables: Record<string, Array<Record<string, number | string>>> = {}) => ({
  cap: {
    fields: Object.fromEntries(Object.entries(fields).flatMap(([k, v]) => (v == null ? [] : [[k, M(v)]]))),
    tables: Object.fromEntries(Object.entries(tables).map(([k, rows]) => [k, rows.map((cells) => ({ cells, src: { kind: 'manual' } }))])),
  },
});

// ── 财务分析与管理报告（一套单独的管理口径数据） ──
const mTb = file('管理报告-科目余额表-2026-09.xlsx', 'tb', (p) => tbXlsx(p, F.tb));
const mTbPrior = file('管理报告-科目余额表-2026-08.xlsx', 'tb', (p) => tbXlsx(p, F.tbPrior));
const mBudget = file('预算-2026.xlsx', 'budget', (p) => budgetXlsx(p, F.budget));
const mKpi = file('KPI-2026-09.xlsx', 'kpi', (p) => kpiXlsx(p, F.kpis));

export const SAMPLE_RUNS: SampleRunSpec[] = [
  {
    moduleId: 'close', modeId: 'standard',
    inputs: {
      journal: [journal], tb: [tb], tbPrior: [tbPrior],
      budget: [file('月度预算-2026-09.xlsx', 'budget', (p) => budgetXlsx(p, CLOSE.budget))],
      accrualPolicy: [file('计提政策.xlsx', 'accrual_policy', (p) => policyXlsx(p, CLOSE.policies))],
    },
  },
  {
    moduleId: 'recon', modeId: 'bank',
    inputs: {
      bankJournal: [file('银行日记账-2026-09.xlsx', 'journal', (p) => journalXlsx(p, BANK.bookRows))],
      bank: [file('网银流水-2026-09.xlsx', 'bank', (p) => bankXlsx(p, BANK.bankRows))],
      bankTb: [file('银行存款余额表-2026-09.xlsx', 'tb', (p) => tbXlsx(p, BANK.tb))],
    },
  },
  { moduleId: 'ar', modeId: 'standard', inputs: { ar: [table('应收明细.xlsx', 'ar', SUB.AR)], receipts: [table('收款记录.xlsx', 'receipt', SUB.RECEIPTS)], customers: [table('客户档案.xlsx', 'customer', SUB.CUSTOMERS)] } },
  {
    moduleId: 'ap', modeId: 'standard',
    inputs: {
      ap: [table('应付明细.xlsx', 'ap', SUB.AP)], po: [table('采购订单.xlsx', 'po', SUB.PO)], grn: [table('收货单.xlsx', 'grn', SUB.GRN)],
      invoices: [table('采购发票.xlsx', 'invoice', SUB.INVOICES)], suppliers: [table('供应商档案.xlsx', 'supplier', SUB.SUPPLIERS)], funds: [table('可用资金.xlsx', 'funds', SUB.FUNDS)],
    },
  },
  { moduleId: 'expense', modeId: 'batch', inputs: { claims: [table('报销明细.xlsx', 'expense_claim', SUB.CLAIMS)] } },
  { moduleId: 'fixed-assets', modeId: 'standard', inputs: { register: [table('资产台账.xlsx', 'fa_register', SUB.FA_REGISTER)], movements: [table('资产增减单.xlsx', 'fa_movement', SUB.FA_MOVEMENTS)] } },
  { moduleId: 'payroll', modeId: 'cn', inputs: { payroll: [table('工资表-2026-09.xlsx', 'payroll', SUB.PAYROLL_CN)], payrollPrior: [table('工资表-2026-08.xlsx', 'payroll', SUB.PAYROLL_CN_PRIOR)] } },
  { moduleId: 'intercompany', modeId: 'standard', inputs: { ic: [table('内部往来.xlsx', 'intercompany', SUB.IC)], guarantees: [table('担保台账.xlsx', 'guarantee', SUB.GUARANTEES)] } },

  // ── 审计与内控 ──
  {
    moduleId: 'icfr', modeId: 'testing', params: { seed: AUD.SEED },
    inputs: { controls: [sheet('控制清单.xlsx', 'evidence', AUD.CONTROLS_HEAD, AUD.CONTROLS)], population: [sheet('控制执行总体.xlsx', 'evidence', AUD.POPULATION_HEAD, AUD.POPULATION)] },
  },
  { moduleId: 'internal-audit', modeId: 'plan', params: { availableDays: 40 }, inputs: { universe: [sheet('审计领域.xlsx', 'evidence', AUD.UNIVERSE_HEAD, AUD.UNIVERSE)] } },
  {
    moduleId: 'ext-audit', modeId: 'support', params: { materiality: 30000, asOf: AUD.AS_OF },
    inputs: { pbc: [sheet('PBC 资料清单.xlsx', 'evidence', AUD.PBC_HEAD, AUD.PBC)], adjustments: [sheet('审计调整分录.xlsx', 'journal', AUD.ADJ_HEAD, AUD.ADJUSTMENTS)] },
  },
  { moduleId: 'review', modeId: 'statements', inputs: { tb: [tb], tbPrior: [tbPrior], papers: [file('底稿-收入测试.xlsx', 'evidence', (p) => AUD.writePaper(p))] } },
  {
    moduleId: 'fraud', modeId: 'scan',
    inputs: {
      journal: [sheet('舞弊排查-序时账.xlsx', 'journal', AUD.FRAUD_JOURNAL_HEAD, AUD.fraudJournal())],
      payments: [sheet('付款记录.xlsx', 'evidence', AUD.PAYMENTS_HEAD, AUD.PAYMENTS)],
      vendors: [sheet('供应商主数据.xlsx', 'evidence', AUD.VENDORS_HEAD, AUD.VENDORS)],
      employees: [sheet('员工主数据.xlsx', 'evidence', AUD.EMPLOYEES_HEAD, AUD.EMPLOYEES)],
    },
  },
  {
    moduleId: 'kyc', modeId: 'screen', params: { asOf: AUD.AS_OF },
    inputs: {
      packet: [doc('license.txt', AUD.KYC_LICENSE), doc('ubo.txt', AUD.KYC_UBO), doc('address.txt', AUD.KYC_ADDRESS)],
      watchlist: [sheet('制裁与 PEP 名单.xlsx', 'evidence', AUD.WATCH_HEAD, AUD.WATCHLIST)],
    },
  },

  // ── 税务与合规（中国口径） ──
  {
    moduleId: 'tax', modeId: 'cn', params: { taxpayerType: 'general', cityTier: 'urban' },
    inputs: {
      vatLines: [sheet('增值税发票清单-2026-09.xlsx', 'vat_lines', ['方向', '开票日期', '发票号码', '对方名称', '对方税号', '不含税金额', '税额', '税率', '发票类型', '发票状态'],
        TAX.cnVatLines.map((l) => [l.direction === 'sales' ? '销项' : '进项', l.date, l.docNo, l.counterparty, l.counterpartyVatNo, y(l.net), y(l.vat), `${Math.round((l.rate || 0) * 100)}%`, l.invoiceType === 'vat_special' ? '专票' : '普票', l.status === 'abnormal' ? '失控' : '正常']))],
    },
  },
  {
    moduleId: 'regulatory', modeId: 'disclosure',
    params: { regime: 'cn_sse', auditedTotalAssets: y(TAX.DISCLOSURE_BASE.totalAssets), auditedNetAssets: y(TAX.DISCLOSURE_BASE.netAssets), auditedRevenue: y(TAX.DISCLOSURE_BASE.revenue), auditedNetProfit: y(TAX.DISCLOSURE_BASE.netProfit) },
    inputs: {
      events: [sheet('重大事项清单.xlsx', 'disclosure_events', ['日期', '事项类型', '事项说明', '对方', '成交金额', '关联方类型', '涉及资产总额'],
        TAX.events.map((e) => [e.date, ({ transaction: '交易', related_party: '关联交易', guarantee: '担保' } as Record<string, string>)[e.type] || '其他', e.description, e.counterparty, y(e.amount), e.rpKind === 'legal' ? '法人' : e.rpKind === 'natural' ? '自然人' : '', y(e.assetTotal)]))],
    },
  },
  {
    moduleId: 'transfer-pricing', modeId: 'local_file',
    params: { tpJurisdiction: 'CN', pli: 'ncp', testedRevenue: y(TAX.TP.tested.revenue), testedOperatingProfit: y(TAX.TP.tested.operatingProfit), testedTotalCost: y(TAX.TP.tested.totalCost), groupRevenue: 6_000_000_000 },
    inputs: {
      comparables: [sheet('可比公司.xlsx', 'tp_comparables', ['可比公司', '年度', '营业利润', '总成本'], TAX.comparables.map((c) => [c.name, c.year, y(c.operatingProfit), y(c.totalCost)]))],
      rpt: [sheet('关联交易.xlsx', 'rp_transactions', ['关联方', '所在国家', '交易类型', '交易金额', '定价方法'], TAX.rptRows.map((r) => [r.counterparty, r.jurisdiction, r.type === 'tangible' ? '有形资产' : '劳务', y(r.amount), r.method]))],
    },
  },

  // ── 财务分析与管理报告 ──
  { moduleId: 'mgmt-report', modeId: 'monthly', inputs: { tb: [mTb], tbPrior: [mTbPrior], budget: [mBudget], kpi: [mKpi] } },
  { moduleId: 'kpi', modeId: 'tracking', inputs: { kpi: [mKpi] } },
  { moduleId: 'fin-analysis', modeId: 'mom', inputs: { tb: [mTb], tbPrior: [mTbPrior], budget: [mBudget] } },
  {
    moduleId: 'budget', modeId: 'monitor',
    inputs: { budget: [mBudget], journal: [file('部门费用序时账-2026-09.xlsx', 'journal', (p) => deptJournalXlsx(p, F.journal))], commitments: [file('预算承诺额-2026-09.xlsx', 'budget', (p) => budgetXlsx(p, F.commitments))] },
  },
  { moduleId: 'cost', modeId: 'standard', inputs: { pv: [file('标准成本-产品A.xlsx', 'price_volume', (p) => pvXlsx(p, F.pvCost))] } },
  { moduleId: 'insight', modeId: 'survey', inputs: { kpi: [file('订单量.xlsx', 'kpi', (p) => kpiXlsx(p, F.series))], survey: [doc('客户访谈.txt', '访谈纪要：多位客户反映交付周期偏长，希望缩短到两周以内。\n')] } },
  {
    moduleId: 'board', modeId: 'board',
    inputs: {
      tb: [mTb],
      topics: [doc('议题清单.txt', '本次董事会议题：审议季度管理报告；听取审计委员会工作汇报。\n')],
      auditFindings: [doc('审计发现.txt', '审计发现一：应收账款账龄超过180天的余额为 52,000.00 元，建议评估坏账准备。\n审计发现二：费用报销审批流程执行到位。\n')],
    },
  },
  { moduleId: 'esg', modeId: 'issb', inputs: { esg: [file('ESG-2026.xlsx', 'kpi', (p) => kpiXlsx(p, F.esg))] } },
  {
    moduleId: 'strategy', modeId: 'tracking',
    inputs: { objectives: [file('战略目标-2026.xlsx', 'kpi', (p) => kpiXlsx(p, F.objectives))], strategyDoc: [doc('战略规划.txt', '战略规划（三年）\n关键假设：假设人民币汇率保持基本稳定；国内需求稳步增长。\n目标：海外收入占比达到 20%。\n')] },
  },
  { moduleId: 'ir', modeId: 'earnings', inputs: { tb: [mTb], tbPrior: [mTbPrior], announcements: [doc('业绩公告.txt', '本季度业绩公告：营业收入 500,000.00 元，净利润 41,250.00 元。\n')] } },

  // ── 资金与金融风险 ──
  {
    moduleId: 'cash', modeId: 'forecast',
    inputs: {
      balances: [balances], plan: [tr('资金计划-13 周.xlsx', 'cash_plan', TR.cashPlan)],
      ar: [openItems('应收到期明细.xlsx', 'ar', TR.forecastAr)], ap: [openItems('应付到期明细.xlsx', 'ap', TR.forecastAp)], facilities: [facilities],
    },
  },
  { moduleId: 'treasury', modeId: 'authorization', inputs: { requests: [tr('付款申请-待授权.xlsx', 'payment_request', TR.authRequests)], balances: [balances] } },
  { moduleId: 'fx', modeId: 'hedge', inputs: { fxExposure: [tr('外币敞口.xlsx', 'fx_exposure', TR.fxRows)], fxRates: [file('期末汇率.xlsx', 'fx_rates', (p) => fxRatesXlsx(p, TR.fxRates))] } },
  { moduleId: 'financing', modeId: 'covenant', inputs: { metrics: [finMetrics], covenants: [tr('借款契约.xlsx', 'covenant', TR.covenants)] } },
  { moduleId: 'ifrs9', modeId: 'general', inputs: { exposures: [tr('信用敞口.xlsx', 'credit_exposure', TR.exposures)] } },
  {
    moduleId: 'working-capital', modeId: 'ccc',
    inputs: { ar: [openItems('应收账龄-营运资本.xlsx', 'ar', TR.agingAr)], ap: [openItems('应付明细-营运资本.xlsx', 'ap', TR.wcAp)], inventory: [tr('存货明细.xlsx', 'inventory', TR.inventory)], metrics: [finMetrics] },
  },
  { moduleId: 'investments', modeId: 'portfolio', inputs: { investments: [tr('投资持仓.xlsx', 'investment', TR.investments)] } },

  // ── 投融资与估值（手工录入，数值取自各引擎单测的手算夹具） ──
  {
    moduleId: 'valuation', modeId: 'dcf', inputs: {},
    params: cap(
      { units: '百万', taxRate: DCF_FX.taxRate, riskFree: DCF_FX.riskFree, beta: DCF_FX.beta, erp: DCF_FX.erp, sizePremium: DCF_FX.sizePremium, costDebt: DCF_FX.costDebt, debtWeight: DCF_FX.debtWeight, terminalMethod: 'gordon', terminalGrowth: DCF_FX.g, midYear: 'no', netDebt: DCF_FX.netDebt, shares: DCF_FX.shares },
      { forecast: DCF_FX.forecast.map((y) => ({ ...y })) },
    ),
  },
  { moduleId: 'capex', modeId: 'npv_irr', inputs: {}, params: cap({ units: '万元', discountRate: 0.1, riskPremium: 0.02, investment: 1000 }, { cashflows: [1, 2, 3, 4].map((period) => ({ period, cashflow: 400 })) }) },
  { moduleId: 'ma', modeId: 'dd_checklist', inputs: {}, params: cap({ industry: 'manufacturing', dealType: 'buyout' }) },
  {
    moduleId: 'ib', modeId: 'merger_model', inputs: {},
    params: cap({ units: '百万', acqNetIncome: 100, acqShares: 100, acqPrice: 10, tgtNetIncome: 20, purchasePrice: 300, pctStock: 0.5, pctCash: 0.5, pctDebt: 0, costDebt: 0.06, cashYield: 0.02, taxRate: 0.25, synergies: 10, tgtNetAssets: 200, intangibles: 20 }),
  },
  { moduleId: 'pe', modeId: 'returns', inputs: {}, params: cap({ units: '百万', entryEbitda: 100, entryMultiple: 10, entryNetDebt: 400, exitEbitda: 150, exitMultiple: 11, exitNetDebt: 200, holdYears: 5 }) },
  { moduleId: 'research', modeId: 'earnings', inputs: {}, params: cap({ beatPct: 0.02 }, { actuals: [{ metric: '营业收入', actual: 103, consensus: 100 }, { metric: '毛利率', actual: 47.3, consensus: 46 }] }) },
  {
    moduleId: 'markets', modeId: 'fi_portfolio', inputs: {},
    params: cap({ shockBp: 100 }, { holdings: [{ bond: '国债 5 年', face: 1000, coupon: 0.05, yield: 0.05, maturity: 5, freq: 1 }, { bond: '政策性金融债 3 年', face: 500, coupon: 0.03, yield: 0.028, maturity: 3, freq: 1 }] }),
  },
  {
    moduleId: 'wealth', modeId: 'client_review', inputs: {},
    params: cap({ units: '万元' }, {
      holdings: [{ asset: '货币基金', assetClass: '现金类', value: 200, target: 0.2 }, { asset: '国债 ETF', assetClass: '固定收益', value: 450, target: 0.4 }, { asset: '沪深 300 指数基金', assetClass: '权益', value: 350, target: 0.4 }],
      returns: [{ period: '2026-07', ret: 0.004 }, { period: '2026-08', ret: -0.006 }, { period: '2026-09', ret: 0.011 }],
    }),
  },
];
