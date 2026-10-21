/** G4 财务分析与管理报告（10），批次 5：D1–D10 全部可用。 */
import { i18nKey } from '@totalclaw/i18n';
import type { FauModuleInput } from '@totalclaw/ipc-contracts';
import { PA, PR, PRA, type FauModuleSpec } from './types';

const TB: FauModuleInput = { id: 'tb', kind: 'tb', required: true, label: i18nKey('本期科目余额表'), help: i18nKey('含期初、本期发生、期末的借贷方余额；同一项目里月结关账已导入、已签核的余额表可以直接勾选，报告的数字就能回核到已签核的数据集') };
const TB_PRIOR: FauModuleInput = { id: 'tbPrior', kind: 'tb', required: false, label: i18nKey('比较期科目余额表'), help: i18nKey('上期或去年同期的余额表，用于对比分析；不提供时只出本期数') };
const BUDGET: FauModuleInput = { id: 'budget', kind: 'budget', required: false, label: i18nKey('预算表'), help: i18nKey('按科目的本期预算数（科目编码、科目名称、期间、预算金额）') };
const KPI: FauModuleInput = { id: 'kpi', kind: 'kpi', required: false, label: i18nKey('KPI 表'), help: i18nKey('每行一个指标一期：指标名称、期间、目标值、实际值、单位、指标方向（越高越好 / 越低越好）、责任人') };
const doc = (id: string, label: string, help: string): FauModuleInput => ({ id, kind: 'evidence', required: false, multi: true, label, help });

export const FPA_MODULES: FauModuleSpec[] = [
  {
    id: 'mgmt-report', code: 'D1', group: 'fpa', archetype: 'H', package: 'fpa', status: 'ready', batch: 5,
    name: i18nKey('管理报告'), summary: i18nKey('报表与指标由规则算，文字解读只许引用给定数字，指标预警分级'),
    modes: [
      { id: 'monthly', name: i18nKey('月度管理报告编制'), skills: ['fa-management-report-master', 'fa-financial-report-generation', 'fa-management-commentary-writing', 'fa-metric-alert-handling', 'fa-management-report-publishing'], engines: ['finMetrics', 'metricAlerts'] },
      { id: 'alert', name: i18nKey('报告预警处理'), skills: ['fa-management-report-master', 'fa-metric-alert-handling', 'fa-management-commentary-writing'], engines: ['finMetrics', 'metricAlerts'] },
    ],
    inputs: [TB, TB_PRIOR, BUDGET, KPI],
    outputs: ['docx', 'pdf'], signoff: { required: true, levels: PA }, regions: 'all', standards: ['CAS', 'ASBE', 'IFRS', 'IFRS_SME', 'SOCPA'],
    handoffTo: ['board'],
  },
  {
    id: 'kpi', code: 'D2', group: 'fpa', archetype: 'H', package: 'fpa', status: 'ready', batch: 5,
    name: i18nKey('KPI 管理'), summary: i18nKey('目标分解、达成率、预警分级、系统性与一次性根因'),
    modes: [
      { id: 'tracking', name: i18nKey('KPI 追踪与根因'), skills: ['fa-kpi-management-master', 'fa-kpi-data-tracking', 'fa-kpi-alert-handling', 'fa-kpi-root-cause-analysis'], engines: ['evalKpis'] },
      { id: 'target', name: i18nKey('目标分解与累计达成'), skills: ['fa-kpi-management-master', 'fa-kpi-target-setting'], engines: ['evalKpis'] },
    ],
    inputs: [{ ...KPI, required: true }],
    outputs: ['xlsx', 'docx'], signoff: { required: true, levels: PR }, regions: 'all',
  },
  {
    id: 'fin-analysis', code: 'D3', group: 'fpa', archetype: 'H', package: 'fpa', status: 'ready', batch: 5,
    name: i18nKey('财务分析'), summary: i18nKey('同比、环比、预算比，毛利与费用分析，KPI 仪表盘数据'),
    modes: [
      { id: 'yoy', name: i18nKey('同比分析'), skills: ['fa-financial-analysis-master', 'fa-profit-analysis', 'fa-kpi-dashboard'], engines: ['finMetrics', 'expenseRatios'] },
      { id: 'mom', name: i18nKey('与上期对比分析'), skills: ['fa-financial-analysis-master', 'fa-profit-analysis', 'fa-kpi-dashboard'], engines: ['finMetrics', 'expenseRatios'] },
      { id: 'budget', name: i18nKey('预算比分析'), skills: ['fa-financial-analysis-master', 'fa-budget-execution-analysis', 'fa-kpi-dashboard'], engines: ['finMetrics', 'budgetMetrics'] },
    ],
    inputs: [TB, { ...TB_PRIOR, requiredModes: ['yoy', 'mom'] }, { ...BUDGET, requiredModes: ['budget'] }],
    outputs: ['docx', 'xlsx'], signoff: { required: true, levels: PR }, regions: 'all', standards: ['CAS', 'ASBE', 'IFRS', 'IFRS_SME', 'SOCPA'],
    handoffTo: ['mgmt-report'],
  },
  {
    id: 'budget', code: 'D4', group: 'fpa', archetype: 'R', package: 'fpa', status: 'ready', batch: 5,
    name: i18nKey('预算管理'), summary: i18nKey('执行率监控、量差价差分解、预算调整申请审核要点'),
    modes: [
      { id: 'monitor', name: i18nKey('预算执行监控'), skills: ['fa-budget-management-master', 'fa-budget-execution-monitor'], engines: ['budgetExecution'] },
      { id: 'variance', name: i18nKey('预算差异分析'), skills: ['fa-budget-management-master', 'fa-budget-variance-analysis'], engines: ['budgetExecution', 'priceVolume'] },
      { id: 'adjustment', name: i18nKey('预算调整审核'), skills: ['fa-budget-management-master', 'fa-budget-adjustment-review', 'fa-annual-budget-planning'], engines: ['budgetExecution'] },
    ],
    inputs: [
      { ...BUDGET, required: true, help: i18nKey('按预算项目（科目名称）与月份的预算数；执行率按截至本月累计算，与财务智能体预算管控同一口径') },
      { id: 'journal', kind: 'journal', required: true, label: i18nKey('本年序时账'), help: i18nKey('本年截至本月的凭证明细，按科目名称包含预算项目名归集实际数') },
      { id: 'commitments', kind: 'budget', required: false, label: i18nKey('已承诺未发生（承诺额）'), help: i18nKey('已签合同、已下订单但还没入账的金额，格式同预算表') },
      { id: 'pv', kind: 'price_volume', required: false, requiredModes: ['variance'], modes: ['variance'], label: i18nKey('量价表'), help: i18nKey('每行一个项目：预算数量、预算单价、实际数量、实际单价，用于量差价差分解') },
    ],
    outputs: ['xlsx'], signoff: { required: true, levels: PRA }, regions: 'all',
    reuse: [{ workbench: 'workbench-finance-agent', route: '/workbenches/finance-agent', label: i18nKey('单笔支出预检去财务智能体') }],
  },
  {
    id: 'cost', code: 'D5', group: 'fpa', archetype: 'R', package: 'fpa', status: 'ready', batch: 5,
    name: i18nKey('成本控制'), summary: i18nKey('材料、人工、制造费用差异分解，费用率归因，成本中心绩效'),
    modes: [
      { id: 'standard', name: i18nKey('标准成本差异'), skills: ['fa-cost-control-master', 'fa-standard-cost-variance'], engines: ['priceVolume'] },
      { id: 'ratio', name: i18nKey('费用率归因'), skills: ['fa-cost-control-master', 'fa-expense-ratio-analysis'], engines: ['expenseRatios'] },
      { id: 'center', name: i18nKey('成本中心绩效'), skills: ['fa-cost-control-master', 'fa-cost-center-performance'], engines: ['costCenters'] },
    ],
    inputs: [
      { id: 'pv', kind: 'price_volume', required: true, modes: ['standard'], label: i18nKey('标准成本与实际耗用表'), help: i18nKey('每行一个产品的一个成本要素：成本要素（直接材料 / 直接人工 / 制造费用）、按实际产量折算的标准用量或工时、标准单价或费率、实际用量或工时、实际单价或费率') },
      { ...TB, modes: ['ratio'] },
      { ...TB_PRIOR, required: true, modes: ['ratio'] },
      { id: 'journal', kind: 'journal', required: true, modes: ['center'], label: i18nKey('本期序时账（带部门）'), help: i18nKey('费用凭证带「部门」或「成本中心」列；没有部门的共同费用按各中心直接费用比例分摊') },
    ],
    outputs: ['xlsx'], signoff: { required: true, levels: PR }, regions: 'all',
    reuse: [{ workbench: 'workbench-finance-agent', route: '/workbenches/finance-agent', label: i18nKey('产品成本核算去财务智能体') }],
  },
  {
    id: 'insight', code: 'D6', group: 'fpa', archetype: 'S', package: 'fpa', status: 'ready', batch: 5,
    name: i18nKey('商业洞察'), summary: i18nKey('趋势与季节性、洞察生成与验证分级、问卷访谈分析'),
    modes: [
      { id: 'trend', name: i18nKey('趋势洞察'), skills: ['fa-business-insight-master', 'fa-trend-analysis', 'fa-insight-generation', 'fa-insight-validation'], engines: ['seriesStats'] },
      { id: 'survey', name: i18nKey('问卷与访谈分析'), skills: ['fa-business-insight-master', 'fa-survey-analysis', 'fa-insight-validation'], engines: ['seriesStats'] },
    ],
    inputs: [
      { ...KPI, required: true, label: i18nKey('业务 / 财务指标时间序列'), help: i18nKey('同一指标多期数据（KPI 表格式）：指标名称、期间、实际值、单位；至少 3 期才判断趋势') },
      { ...doc('survey', i18nKey('问卷或访谈记录'), i18nKey('问卷结果导出、访谈纪要；作为不可信文件处理，洞察引用必须能在原文里找到')), requiredModes: ['survey'] },
    ],
    outputs: ['docx'], signoff: { required: true, levels: PR }, regions: 'all',
  },
  {
    id: 'board', code: 'D7', group: 'fpa', archetype: 'S', package: 'fpa', status: 'ready', batch: 5,
    name: i18nKey('董事会与审计委员会材料'), summary: i18nKey('材料包编排、审计委员会议程、决议跟踪台账、分发清单（不代发）'),
    modes: [
      { id: 'board', name: i18nKey('董事会材料包'), skills: ['fa-board-reporting-master', 'fa-board-deck-preparation', 'fa-board-meeting-management', 'fa-board-material-distribution'] },
      { id: 'audit_committee', name: i18nKey('审计委员会材料'), skills: ['fa-board-reporting-master', 'fa-audit-committee-support', 'fa-board-meeting-management'] },
      { id: 'resolutions', name: i18nKey('决议跟踪'), skills: ['fa-board-reporting-master', 'fa-board-meeting-management'] },
    ],
    inputs: [
      { ...TB, required: false, help: i18nKey('没有已签核的管理报告转交时，用本期科目余额表现算核心指标；有转交时可以不传') },
      KPI,
      doc('topics', i18nKey('议题与会议资料'), i18nKey('会议通知、议题清单、待审议事项说明；作为不可信文件处理')),
      doc('auditFindings', i18nKey('审计发现与整改报告'), i18nKey('内外部审计发现、整改跟踪；审计委员会关注事项必须引用其中原文')),
    ],
    outputs: ['pptx', 'docx'], signoff: { required: true, levels: PA }, regions: 'all',
  },
  {
    id: 'esg', code: 'D8', group: 'fpa', archetype: 'S', package: 'fpa', status: 'ready', batch: 5,
    name: i18nKey('ESG 报告'), summary: i18nKey('数据完整性核查、重大性矩阵、按所选框架起草报告'),
    modes: [
      { id: 'issb', name: i18nKey('ISSB（IFRS S1 / S2）') },
      { id: 'gri', name: i18nKey('GRI 标准') },
      { id: 'cn', name: i18nKey('沪深北交易所可持续发展报告指引') },
      { id: 'sa', name: i18nKey('沙特交易所 ESG 披露指引') },
    ].map((m) => ({ ...m, skills: ['fa-esg-reporting-master', 'fa-esg-data-integration', 'fa-esg-materiality-assessment', 'fa-esg-reporting', 'fa-esg-rating-tracking'], engines: ['esgCompleteness', 'esgQuality', 'materiality'] })),
    inputs: [
      { id: 'esg', kind: 'kpi', required: true, label: i18nKey('ESG 指标数据'), help: i18nKey('KPI 表格式：指标名称、类别（E / S / G）、期间（年度）、实际值、单位；温室气体排放、能源、用水、员工、安全、治理等') },
      doc('policies', i18nKey('制度与证据文件'), i18nKey('环境、社会、治理相关制度与证据；作为不可信文件处理')),
    ],
    outputs: ['xlsx', 'docx'], signoff: { required: true, levels: PRA }, regions: 'all',
  },
  {
    id: 'strategy', code: 'D9', group: 'fpa', archetype: 'S', package: 'fpa', status: 'ready', batch: 5,
    name: i18nKey('战略规划'), summary: i18nKey('目标分解、关键假设台账、战略风险评估、执行偏差追踪'),
    modes: [
      { id: 'planning', name: i18nKey('目标、假设与风险'), skills: ['fa-strategic-planning-master', 'fa-strategic-objective-setting', 'fa-strategic-assumption', 'fa-strategic-risk-assessment'], engines: ['evalKpis', 'riskScore'] },
      { id: 'tracking', name: i18nKey('战略执行追踪'), skills: ['fa-strategic-planning-master', 'fa-strategy-execution-tracking', 'fa-strategic-risk-assessment'], engines: ['evalKpis', 'deviationOf'] },
    ],
    inputs: [
      { id: 'objectives', kind: 'kpi', required: true, label: i18nKey('战略目标与实际'), help: i18nKey('KPI 表格式：战略目标（指标）、期间、目标值、实际值、单位') },
      doc('strategyDoc', i18nKey('战略规划文件'), i18nKey('战略规划正文；关键假设必须引用其中原文，定位不到的丢弃')),
    ],
    outputs: ['xlsx', 'docx'], signoff: { required: true, levels: PA }, regions: 'all',
  },
  {
    id: 'ir', code: 'D10', group: 'fpa', archetype: 'S', package: 'fpa', status: 'ready', batch: 5,
    name: i18nKey('投资者关系'), summary: i18nKey('业绩发布会材料与问答、路演材料、披露核对、投资者反馈汇总'),
    modes: [
      { id: 'earnings', name: i18nKey('业绩发布会'), skills: ['fa-investor-relations-master', 'fa-earnings-call-preparation', 'fa-ir-disclosure-management'], engines: ['finMetrics'] },
      { id: 'roadshow', name: i18nKey('路演材料'), skills: ['fa-investor-relations-master', 'fa-roadshow-material-preparation', 'fa-ir-disclosure-management'], engines: ['finMetrics'] },
      { id: 'feedback', name: i18nKey('投资者反馈汇总'), skills: ['fa-investor-relations-master', 'fa-investor-feedback-tracking'], engines: ['finMetrics'] },
    ],
    inputs: [
      TB, TB_PRIOR,
      doc('announcements', i18nKey('已发布的公告与财报'), i18nKey('已公开的业绩公告、财报；材料里出现的数字必须已公开（在结果或公告原文里）')),
      { ...doc('feedback', i18nKey('投资者反馈记录'), i18nKey('路演、业绩会、日常沟通的反馈纪要；反馈主题必须引用其中原文')), requiredModes: ['feedback'] },
    ],
    outputs: ['docx', 'pptx'], signoff: { required: true, levels: PA }, regions: 'all',
  },
];
