/**
 * G3 税务与合规（3），批次 4：C1 纳税申报准备（中国 / 沙特 / 阿联酋 / 国际）、C2 监管与披露、C3 转让定价。
 * 只出申报草稿，不提交申报：中国代填跳转财务智能体「申报上报」，沙特 / 阿联酋由人在 ZATCA / FTA 平台提交。
 */
import { i18nKey } from '@totalclaw/i18n';
import { PRA, type FauModuleSpec } from './types';

const CN_SKILLS = ['fa-tax-filing-master', 'fa-vat-declaration-prep', 'fa-it-declaration-prep', 'fa-tax-risk-assessment', 'fa-cn-golden-tax'];

export const TAX_MODULES: FauModuleSpec[] = [
  {
    id: 'tax', code: 'C1', group: 'tax', archetype: 'R', package: 'tax', status: 'ready', batch: 4,
    name: i18nKey('纳税申报准备'),
    summary: i18nKey('中国增值税、附加、所得税、个税申报底稿与风险；沙特增值税、天课、外资所得税与预提税；阿联酋增值税与企业所得税；国际参数化。只出草稿，申报由人提交'),
    modes: [
      { id: 'cn', name: i18nKey('中国：增值税、附加、所得税、个税'), skills: CN_SKILLS, engines: ['cnComputeTax', 'cnTaxFindings', 'goldenTaxCheck', 'filingCalendar'] },
      { id: 'sa_vat', name: i18nKey('沙特：增值税申报底稿'), skills: ['fa-sa-vat-return', 'fa-sa-einvoice'], engines: ['vatReturn', 'filingCalendar'] },
      { id: 'sa_zakat', name: i18nKey('沙特：天课与外资部分所得税'), skills: ['fa-sa-zakat'], engines: ['zakatBase', 'nonSaudiCit', 'filingCalendar'] },
      { id: 'sa_wht', name: i18nKey('沙特：预提税'), skills: ['fa-sa-zakat'], engines: ['withholdingTax', 'filingCalendar'] },
      { id: 'ae_vat', name: i18nKey('阿联酋：增值税申报底稿（VAT 201）'), skills: ['fa-ae-vat-return'], engines: ['vatReturn', 'filingCalendar'] },
      { id: 'ae_cit', name: i18nKey('阿联酋：企业所得税'), skills: ['fa-ae-corporate-tax'], engines: ['aeCorporateTax', 'filingCalendar'] },
      { id: 'intl', name: i18nKey('国际：参数化增值税与所得税（IAS 12）'), skills: ['fa-tax-filing-master', 'fa-it-declaration-prep'], engines: ['vatReturn', 'currentTax', 'deferredTax'] },
    ],
    inputs: [
      { id: 'vatLines', kind: 'vat_lines', required: true, modes: ['cn', 'sa_vat', 'ae_vat', 'intl'], requiredModes: ['cn', 'sa_vat', 'ae_vat'], label: i18nKey('销项与进项明细'), help: i18nKey('每行一张发票或一条明细：方向（销项 / 进项）、日期、发票号、对方名称与税号、不含税金额、税额、税率、类别（标准 / 零税率 / 免税 / 反向征收 / 出口 / 进口）；可下载模板填写') },
      { id: 'journal', kind: 'journal', required: false, modes: ['cn'], label: i18nKey('本年累计序时账'), help: i18nKey('用于取账面收入、本年累计利润总额，与申报数核对账税差异；与财务智能体同一口径') },
      { id: 'iit', kind: 'iit_rows', required: false, modes: ['cn'], label: i18nKey('工资个税明细'), help: i18nKey('每人一行：本月应发、三险一金、专项附加扣除，以及本年此前累计的收入、扣除、已预扣税额和月数；按累计预扣法计算') },
      { id: 'tb', kind: 'tb', required: false, modes: ['sa_zakat', 'ae_cit', 'intl'], requiredModes: ['sa_zakat', 'ae_cit'], label: i18nKey('年末科目余额表'), help: i18nKey('含期末余额与本年发生额；天课基数的加减项、会计利润都从这里逐行取数，每一项都能追溯到行号') },
      { id: 'wht', kind: 'wht_payments', required: true, modes: ['sa_wht'], label: i18nKey('向非居民付款明细'), help: i18nKey('每笔付款一行：日期、收款方、国家、付款类型（管理费 / 特许权使用费 / 租金 / 技术服务 / 股息 / 利息 …）、金额') },
      { id: 'tempDiffs', kind: 'temp_diffs', required: false, modes: ['intl'], label: i18nKey('暂时性差异明细'), help: i18nKey('每项资产或负债一行：账面价值与计税基础，用于计算递延所得税资产 / 负债（IAS 12）') },
    ],
    outputs: ['xlsx', 'docx'],
    signoff: { required: true, levels: PRA },
    regions: 'all',
    reuse: [
      { workbench: 'workbench-finance-agent', route: '/workbenches/finance-agent', label: i18nKey('中国申报代填去财务智能体') },
      { workbench: 'workbench-invoice-agent', route: '/workbenches/invoice-agent', label: i18nKey('开票去发票智能体') },
    ],
  },
  {
    id: 'regulatory', code: 'C2', group: 'tax', archetype: 'S', package: 'tax', status: 'ready', batch: 4,
    name: i18nKey('监管报送与信息披露'),
    summary: i18nKey('应披露事项识别与阈值判断、报送数据核查、披露草稿'),
    modes: [
      { id: 'disclosure', name: i18nKey('披露识别与草稿'), skills: ['fa-compliance-reporting-master', 'fa-disclosure-management', 'fa-regulatory-reporting'], engines: ['disclosureThresholds', 'reportingDataCheck', 'disclosureDraft'] },
    ],
    inputs: [
      { id: 'events', kind: 'disclosure_events', required: true, label: i18nKey('重大事项与交易清单'), help: i18nKey('每个事项一行：日期、类型（交易 / 关联交易 / 担保 / 诉讼 / 减值 / 其他）、说明、对方、金额；关联交易注明关联自然人或关联法人') },
      { id: 'tb', kind: 'tb', required: false, label: i18nKey('最近一期经审计的科目余额表'), help: i18nKey('用于取总资产、净资产、营业收入、净利润作为披露比例的分母；不提供时在参数里手工填写') },
    ],
    outputs: ['xlsx', 'docx'],
    signoff: { required: true, levels: PRA },
    regions: 'all',
  },
  {
    id: 'transfer-pricing', code: 'C3', group: 'tax', archetype: 'H', package: 'tax', status: 'ready', batch: 4,
    name: i18nKey('转让定价'),
    summary: i18nKey('利润水平指标与四分位区间、主体与本地文档草稿、三层文档完整性'),
    modes: [
      { id: 'local_file', name: i18nKey('同期资料与可比分析'), skills: ['fa-transfer-pricing-documentation-master', 'fa-comparable-analysis-tp', 'fa-master-document-preparation', 'fa-beps-compliance'], engines: ['tpPli', 'tpQuartiles', 'tpDocRequirement', 'tpNarrative'] },
      { id: 'benchmark', name: i18nKey('只做可比分析（四分位）'), skills: ['fa-comparable-analysis-tp'], engines: ['tpPli', 'tpQuartiles'] },
    ],
    inputs: [
      { id: 'rpt', kind: 'rp_transactions', required: true, modes: ['local_file'], label: i18nKey('关联交易明细'), help: i18nKey('每笔或每类关联交易一行：关联方、所在国家、交易类型（有形资产 / 无形资产转让 / 无形资产许可 / 劳务 / 融资 / 金融资产 / 其他）、金额、定价方法') },
      { id: 'comparables', kind: 'tp_comparables', required: true, label: i18nKey('可比公司财务数据'), help: i18nKey('每家可比公司一行：名称、年度，以及营业收入、营业利润、总成本（或直接给利润水平指标）；数据库导出后上传') },
      { id: 'tb', kind: 'tb', required: false, label: i18nKey('受测方科目余额表'), help: i18nKey('用于计算受测方的营业收入、总成本、营业利润；不提供时在参数里手工填写') },
    ],
    outputs: ['xlsx', 'docx'],
    signoff: { required: true, levels: PRA },
    regions: 'all',
  },
];
