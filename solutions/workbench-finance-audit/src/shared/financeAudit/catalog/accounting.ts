/** G1 会计核算（8）。批次 1：A1 月结关账、A2 对账中心；批次 2：A3–A8。 */
import { i18nKey } from '@totalclaw/i18n';
import { PR, PRA, type FauModuleSpec } from './types';

const CLOSE_SKILLS = [
  'fa-month-end-close-master', 'fa-close-checklist-executor', 'fa-close-verification', 'fa-cross-period-adjustment',
  'fa-accrual-schedule', 'fa-roll-forward', 'fa-variance-commentary',
];
const CLOSE_ENGINES = ['closeChecklist', 'trialBalance', 'crossPeriod', 'accrualSchedule', 'rollForward', 'flux'];

export const ACCOUNTING_MODULES: FauModuleSpec[] = [
  {
    id: 'close', code: 'A1', group: 'accounting', archetype: 'H', package: 'core', status: 'ready', batch: 1,
    name: i18nKey('月结关账'),
    summary: i18nKey('关账清单、试算与三表勾稽、跨期调整、计提表、滚动表、波动说明，出关账包与关账备忘录'),
    modes: [
      { id: 'standard', name: i18nKey('标准月结'), skills: CLOSE_SKILLS, engines: CLOSE_ENGINES },
      { id: 'expedite', name: i18nKey('加急关账'), skills: CLOSE_SKILLS, engines: CLOSE_ENGINES },
      { id: 'accrual_only', name: i18nKey('只做计提'), skills: ['fa-accrual-schedule'], engines: ['accrualSchedule'] },
      { id: 'flux_rewrite', name: i18nKey('补录后重写波动说明'), skills: ['fa-variance-commentary'], engines: ['flux'] },
    ],
    inputs: [
      { id: 'journal', kind: 'journal', required: true, label: i18nKey('本期序时账'), help: i18nKey('凭证明细：日期、凭证号、科目、摘要、借贷金额；有业务日期或发票日期列更好，用于跨期识别') },
      { id: 'tb', kind: 'tb', required: true, label: i18nKey('本期科目余额表'), help: i18nKey('含期初、本期发生、期末的借贷方余额') },
      { id: 'tbPrior', kind: 'tb', required: true, modes: ['standard', 'expedite', 'flux_rewrite'], label: i18nKey('上期科目余额表'), help: i18nKey('用于期初衔接与对上期的波动分析；也可以引用上一期项目里已归档的余额表') },
      { id: 'budget', kind: 'budget', required: false, modes: ['standard', 'expedite', 'flux_rewrite'], label: i18nKey('预算表'), help: i18nKey('按科目的本期预算数，用于对预算的波动分析') },
      { id: 'accrualPolicy', kind: 'accrual_policy', required: false, requiredModes: ['accrual_only'], modes: ['standard', 'expedite', 'accrual_only'], label: i18nKey('计提政策表'), help: i18nKey('每行一条计提政策：费用科目、负债科目、计算方式与金额；没有可下载模板填写') },
      { id: 'evidence', kind: 'evidence', required: false, multi: true, modes: ['standard', 'expedite', 'accrual_only'], label: i18nKey('计提支持文件'), help: i18nKey('合同、发票、对账单；作为不可信文件处理，只记录哈希随签核归档') },
      { id: 'fxRates', kind: 'fx_rates', required: false, modes: ['standard', 'expedite'], label: i18nKey('期末汇率表'), help: i18nKey('币种与期末汇率；有外币业务时用于关账清单的期末汇率检查') },
    ],
    outputs: ['xlsx', 'docx', 'je_import_xlsx'],
    signoff: { required: true, levels: PRA },
    regions: 'all',
    standards: ['CAS', 'ASBE', 'IFRS', 'IFRS_SME', 'SOCPA'],
    handoffTo: ['review', 'ext-audit', 'mgmt-report'],
    reuse: [{ workbench: 'workbench-finance-agent', route: '/workbenches/finance-agent', label: i18nKey('去财务智能体生成凭证') }],
  },
  {
    id: 'recon', code: 'A2', group: 'accounting', archetype: 'R', package: 'core', status: 'ready', batch: 1,
    name: i18nKey('对账中心'),
    summary: i18nKey('银企对账出银行余额调节表；总账与子账全外连接分六类差异，重大差异追溯根因'),
    modes: [
      { id: 'bank', name: i18nKey('银企对账'), skills: ['fa-reconciliation-automation'], engines: ['bankRecon'] },
      { id: 'glsub', name: i18nKey('总账与子账对账'), skills: ['fa-gl-recon', 'fa-break-trace'], engines: ['glSubledgerRecon', 'breakTrace'] },
      { id: 'retrace', name: i18nKey('重查单条差异'), skills: ['fa-break-trace'], engines: ['breakTrace'] },
    ],
    inputs: [
      { id: 'bankJournal', kind: 'journal', required: true, modes: ['bank'], label: i18nKey('序时账（银行存款科目）'), help: i18nKey('整本序时账即可，自动筛出银行存款科目的分录') },
      { id: 'bank', kind: 'bank', required: true, multi: true, modes: ['bank'], label: i18nKey('银行对账单'), help: i18nKey('企业网银导出的当月流水（xlsx / csv），可以一次放多个账户') },
      { id: 'bankTb', kind: 'tb', required: false, modes: ['bank'], label: i18nKey('科目余额表（可选）'), help: i18nKey('用于银行存款明细科目的期初 / 期末余额核对；不提供时假设期初两边一致并在签核时提醒') },
      { id: 'gl', kind: 'subledger', required: true, modes: ['glsub'], label: i18nKey('总账提取'), help: i18nKey('按对账键（单号 / 资产编号 / 往来单位）导出的总账明细') },
      { id: 'sub', kind: 'subledger', required: true, modes: ['glsub'], label: i18nKey('子账提取'), help: i18nKey('应收、应付、固定资产或存货子账明细，键列与总账一致') },
    ],
    outputs: ['xlsx', 'docx'],
    signoff: { required: true, levels: PR },
    regions: 'all',
    handoffTo: ['close'],
  },
  {
    id: 'ar', code: 'A3', group: 'accounting', archetype: 'R', package: 'core', status: 'ready', batch: 2,
    name: i18nKey('应收与账龄'), summary: i18nKey('账龄分层、坏账准备测算、TOP 风险客户、信用额度建议、分阶段催款函草稿（不发送）'),
    modes: [
      { id: 'standard', name: i18nKey('全面：账龄、坏账、催款与信用'), skills: ['fa-ar-master', 'fa-aging-analysis-ar', 'fa-collection-automation', 'fa-credit-assessment'], engines: ['arAging', 'badDebtProvision', 'dunningStages', 'creditAssessment'] },
      { id: 'aging', name: i18nKey('账龄与坏账准备'), skills: ['fa-ar-master', 'fa-aging-analysis-ar'], engines: ['arAging', 'badDebtProvision'] },
      { id: 'collection', name: i18nKey('催款函草稿'), skills: ['fa-collection-automation'], engines: ['arAging', 'dunningStages'] },
      { id: 'credit', name: i18nKey('信用评估'), skills: ['fa-credit-assessment'], engines: ['arAging', 'creditAssessment'] },
    ],
    inputs: [
      { id: 'ar', kind: 'ar', required: true, label: i18nKey('应收明细'), help: i18nKey('应收模块导出的未清发票：客户、发票号、开票日期、到期日（或账期）、金额与未清金额；含已结清的行更好，用于月均开票额') },
      { id: 'receipts', kind: 'receipt', required: false, modes: ['standard', 'credit'], label: i18nKey('收款记录'), help: i18nKey('近 12 个月的到账记录：客户、核销发票号、收款日期、金额，用于付款历史评级') },
      { id: 'customers', kind: 'customer', required: false, requiredModes: ['credit'], label: i18nKey('客户档案'), help: i18nKey('客户名称、信用等级、账期、信用额度、申请额度、资产负债率、经营现金流、风险信号（诉讼、被执行等）') },
    ],
    outputs: ['xlsx', 'docx'],
    signoff: { required: true, levels: PRA },
    regions: 'all',
    handoffTo: ['ifrs9', 'working-capital'],
  },
  {
    id: 'ap', code: 'A4', group: 'accounting', archetype: 'R', package: 'core', status: 'ready', batch: 2,
    name: i18nKey('应付与三单匹配'), summary: i18nKey('采购订单、收货、发票三单匹配，到期分析与付款优先级，付款计划草稿（不付款）'),
    modes: [
      { id: 'standard', name: i18nKey('全面：三单匹配、付款计划与供应商复核'), skills: ['fa-ap-master', 'fa-three-way-match', 'fa-payment-scheduling', 'fa-supplier-payment-review'], engines: ['threeWayMatch', 'supplierReview', 'paymentPlan'] },
      { id: 'match', name: i18nKey('只做三单匹配'), skills: ['fa-three-way-match'], engines: ['threeWayMatch'] },
      { id: 'schedule', name: i18nKey('付款计划'), skills: ['fa-payment-scheduling', 'fa-supplier-payment-review'], engines: ['supplierReview', 'paymentPlan'] },
      { id: 'supplier', name: i18nKey('供应商付款复核'), skills: ['fa-supplier-payment-review'], engines: ['supplierReview'] },
    ],
    inputs: [
      { id: 'ap', kind: 'ap', required: false, requiredModes: ['standard', 'schedule', 'supplier'], modes: ['standard', 'schedule', 'supplier'], label: i18nKey('应付明细'), help: i18nKey('应付模块导出的未付发票：供应商、发票号、采购订单号、开票日期、到期日（或账期）、金额与未付金额') },
      { id: 'po', kind: 'po', required: false, requiredModes: ['standard', 'match'], modes: ['standard', 'match'], label: i18nKey('采购订单'), help: i18nKey('采购订单行：订单号、行号、物料、数量、不含税单价或金额、税率') },
      { id: 'grn', kind: 'grn', required: false, modes: ['standard', 'match'], label: i18nKey('收货单'), help: i18nKey('收货 / 入库记录：订单号、行号、实收数量、收货日期；没有收货单表示还没收货，相应发票暂不付') },
      { id: 'invoices', kind: 'invoice', required: false, requiredModes: ['standard', 'match'], modes: ['standard', 'match'], label: i18nKey('采购发票'), help: i18nKey('发票行：发票号、对应订单号与行号、数量、不含税单价或金额、税率') },
      { id: 'suppliers', kind: 'supplier', required: false, requiredModes: ['supplier'], modes: ['standard', 'schedule', 'supplier'], label: i18nKey('供应商档案'), help: i18nKey('供应商名称、信用代码、等级（A–D）、账期、收款账号与账户名、原账号（如有变更）、是否关联方、是否黑名单') },
      { id: 'funds', kind: 'funds', required: false, modes: ['standard', 'schedule'], label: i18nKey('可用资金'), help: i18nKey('各账户余额、已排期付款、冻结金额；不提供时付款计划按资金充足排') },
    ],
    outputs: ['xlsx', 'docx'],
    signoff: { required: true, levels: PRA },
    regions: 'all',
    handoffTo: ['working-capital'],
  },
  {
    id: 'expense', code: 'A5', group: 'accounting', archetype: 'R', package: 'core', status: 'ready', batch: 2,
    name: i18nKey('费用报销稽核'), summary: i18nKey('批量事后稽核报销单与发票，识别高频、连号、拆单、周末、整数、同票多报'),
    modes: [
      { id: 'batch', name: i18nKey('批量稽核'), skills: ['fa-expense-review-master', 'fa-reimbursement-review', 'fa-invoice-verification', 'fa-policy-compliance-check', 'fa-dispute-identification', 'fa-three-way-match'], engines: ['reviewClaim', 'checkDoc', 'zatcaQr', 'anomalyScan'] },
      { id: 'anomaly', name: i18nKey('只扫描异常模式'), skills: ['fa-dispute-identification'], engines: ['anomalyScan'] },
    ],
    inputs: [
      { id: 'claims', kind: 'expense_claim', required: true, label: i18nKey('报销明细'), help: i18nKey('一行一张票：报销单号、报销人、部门、职级、费用类型、提交日期、发票类型 / 代码 / 号码 / 开票日期、销售方及税号、购买方及税号、金额、税额、价税合计；沙特电子发票附二维码内容（base64）') },
    ],
    outputs: ['xlsx', 'docx'],
    signoff: { required: true, levels: PR },
    regions: 'all',
    reuse: [{ workbench: 'workbench-finance-agent', route: '/workbenches/finance-agent', label: i18nKey('单笔报销去财务智能体审核') }],
  },
  {
    id: 'fixed-assets', code: 'A6', group: 'accounting', archetype: 'R', package: 'core', status: 'ready', batch: 2,
    name: i18nKey('固定资产'), summary: i18nKey('折旧重算与账面差异、购置资本化与处置损益审核、资产滚动表'),
    modes: [
      { id: 'standard', name: i18nKey('全面：折旧、滚动表、购置与处置'), skills: ['fa-fixed-assets-master', 'fa-depreciation-analysis', 'fa-asset-acquisition-review', 'fa-asset-disposal-review'], engines: ['depreciationRecompute', 'assetRollForward', 'acquisitionReview', 'disposalReview'] },
      { id: 'depreciation', name: i18nKey('只做折旧核对'), skills: ['fa-depreciation-analysis'], engines: ['depreciationRecompute', 'assetRollForward'] },
    ],
    inputs: [
      { id: 'register', kind: 'fa_register', required: true, label: i18nKey('资产台账'), help: i18nKey('资产卡片：编号、名称、类别、开始使用日期、原值、折旧方法、使用年限或月数、残值率、累计折旧、本期折旧、减值准备、状态、处置日期') },
      { id: 'movements', kind: 'fa_movement', required: false, modes: ['standard'], label: i18nKey('新增 / 处置单'), help: i18nKey('本期资产变动：类型（新增 / 出售 / 报废…）、资产编号、日期、原值、处置收入、处置费用') },
      { id: 'faTb', kind: 'tb', required: false, label: i18nKey('科目余额表（可选）'), help: i18nKey('用于把资产台账与总账固定资产、累计折旧科目期末余额核对') },
    ],
    outputs: ['xlsx', 'docx', 'je_import_xlsx'],
    signoff: { required: true, levels: PRA },
    regions: 'all',
    standards: ['CAS', 'ASBE', 'IFRS', 'IFRS_SME', 'SOCPA'],
  },
  {
    id: 'payroll', code: 'A7', group: 'accounting', archetype: 'R', package: 'core', status: 'ready', batch: 2,
    name: i18nKey('薪酬核算'), summary: i18nKey('应发与扣款、个税累计预扣、社保公积金基数核对；沙特 GOSI 与期末服务金'),
    modes: [
      { id: 'cn', name: i18nKey('中国：社保公积金与个税'), skills: ['fa-payroll-master', 'fa-payroll-calculation', 'fa-social-insurance-review', 'fa-tax-withholding-review'], engines: ['grossNet', 'socialInsurance', 'computeIit', 'headcount', 'payrollAccrual'] },
      { id: 'sa', name: i18nKey('沙特：GOSI 与期末服务金'), skills: ['fa-payroll-master', 'fa-payroll-calculation'], engines: ['grossNet', 'gosi', 'eosb', 'headcount', 'payrollAccrual'] },
      { id: 'intl', name: i18nKey('国际：参数化费率'), skills: ['fa-payroll-master', 'fa-payroll-calculation'], engines: ['grossNet', 'socialInsurance', 'headcount', 'payrollAccrual'] },
    ],
    inputs: [
      { id: 'payroll', kind: 'payroll', required: true, label: i18nKey('本期工资表'), help: i18nKey('一人一行：员工编号、姓名、部门、各应发明细与应发合计、个人社保公积金、个税、其他扣款、实发；中国另附缴费基数、专项附加扣除与本年累计数；沙特另附国籍、基本工资、住房补贴、服务起始日、期末服务金余额') },
      { id: 'payrollPrior', kind: 'payroll', required: false, label: i18nKey('上期工资表'), help: i18nKey('用于识别本期增减员') },
    ],
    outputs: ['xlsx', 'je_import_xlsx'],
    signoff: { required: true, levels: PRA },
    regions: 'all',
  },
  {
    id: 'intercompany', code: 'A8', group: 'accounting', archetype: 'R', package: 'core', status: 'ready', batch: 2,
    name: i18nKey('合并与内部往来'), summary: i18nKey('内部往来双边匹配、抵销分录草稿、担保余额检查，内部定价偏离转转让定价'),
    modes: [
      { id: 'standard', name: i18nKey('全面：对账、抵销、担保与定价'), skills: ['fa-intercompany-accounting-master', 'fa-intercompany-reconciliation', 'fa-intercompany-guarantee-review', 'fa-transfer-pricing-review'], engines: ['icMatch', 'icElimination', 'guaranteeCheck', 'tpDeviation'] },
      { id: 'recon', name: i18nKey('对账与抵销'), skills: ['fa-intercompany-reconciliation', 'fa-transfer-pricing-review'], engines: ['icMatch', 'icElimination', 'tpDeviation'] },
      { id: 'guarantee', name: i18nKey('担保检查'), skills: ['fa-intercompany-guarantee-review'], engines: ['guaranteeCheck'] },
    ],
    inputs: [
      { id: 'ic', kind: 'intercompany', required: false, requiredModes: ['standard', 'recon'], modes: ['standard', 'recon'], label: i18nKey('内部往来明细'), help: i18nKey('各主体对关联方的往来：本方公司、对方公司、往来类型或科目（应收 / 应付 / 内部销售 / 采购 / 借款 / 利息）、单据号、日期、本位币金额；有内部价与市场价的一并带上') },
      { id: 'guarantees', kind: 'guarantee', required: false, requiredModes: ['guarantee'], modes: ['standard', 'guarantee'], label: i18nKey('担保台账'), help: i18nKey('担保方、被担保方、担保金额、起止日、费率、状态、是否审批、担保方净资产') },
    ],
    outputs: ['xlsx', 'je_import_xlsx'],
    signoff: { required: true, levels: PRA },
    regions: 'all',
    standards: ['CAS', 'IFRS', 'SOCPA'],
    handoffTo: ['transfer-pricing'],
  },
];
