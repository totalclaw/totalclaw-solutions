/**
 * G6 投融资与估值（8，扩展包，默认折叠、展开即可用，不单独授权），批次 7。
 *
 * 依赖付费数据源（LSEG、S&P、Bloomberg、Capital IQ、Wind……）的模块全部保留，改成「上传数据 / 公开数据 / 手工录入」
 * 降级运行；connectors 里列出可选的授权连接器（connectorCatalog 里默认关闭、标「需授权」）。
 * 每个模式对应源项目的一条斜杠命令（quickActions.id = 模式 id）；录入定义见 ../capital/specs.ts。
 */
import { i18nKey } from '@totalclaw/i18n';
import type { FauModuleInput } from '@totalclaw/ipc-contracts';
import { CAP_SPECS } from '../capital/specs';
import { PA, PR, PRA, type FauModuleSpec } from './types';

type Mode = { id: string; name: string; skills: string[]; command?: string };
const m = (id: string, name: string, skills: string[], command?: string): Mode => ({ id, name, skills, command });

/** 上传资料（不可信文件，抽取时不给工具）+ 数据文件（终端导出 / 公开下载的表格，导入到第 ② 步的录入表） */
function inputsOf(moduleId: string): FauModuleInput[] {
  const specs = Object.entries(CAP_SPECS[moduleId] || {});
  return [
    {
      id: 'docs', kind: 'evidence', required: false, multi: true,
      modes: specs.filter(([, s]) => s.docs !== 'none').map(([k]) => k), requiredModes: specs.filter(([, s]) => s.docs === 'required').map(([k]) => k),
      label: i18nKey('资料文件'), help: i18nKey('年报、招股书、CIM、电话会全文、客户资料等（PDF / Word / Excel）；内容按不可信数据处理，模型引用的事实逐条回原文定位'),
    },
    {
      id: 'dataFiles', kind: 'evidence', required: false, multi: true,
      label: i18nKey('数据文件（表格）'), help: i18nKey('终端导出或公开来源下载的 xlsx / csv；上传后在下方录入表里点「从文件导入」，每行记下文件与行号作为来源'),
    },
  ];
}

function modes(list: Mode[]): Pick<FauModuleSpec, 'modes' | 'quickActions'> {
  return {
    modes: list.map(({ id, name, skills }) => ({ id, name, skills, engines: [id] })),
    quickActions: list.filter((x) => x.command).map((x) => ({ id: x.id, name: x.name, skill: x.skills[0], command: x.command })),
  };
}

const ALL_STANDARDS: FauModuleSpec['standards'] = ['CAS', 'IFRS', 'SOCPA'];

export const CAPITAL_MODULES: FauModuleSpec[] = [
  {
    id: 'valuation', code: 'F1', group: 'capital', archetype: 'H', package: 'capital', status: 'ready', batch: 7,
    name: i18nKey('估值建模'), summary: i18nKey('DCF、LBO、三表、可比公司，公式联动的 Excel 模型并自检，估值备忘录'),
    ...modes([
      m('dcf', i18nKey('DCF 现金流折现'), ['fa-dcf-model', 'fa-wacc-calculation'], '/dcf'),
      m('lbo', i18nKey('LBO 杠杆收购'), ['fa-lbo-model'], '/lbo'),
      m('three_statement', i18nKey('三表联动模型'), ['fa-3-statement-model'], '/3-statement-model'),
      m('comps', i18nKey('可比公司'), ['fa-comps-analysis'], '/comps'),
      m('integration', i18nKey('多方法估值整合'), ['fa-valuation-integration', 'fa-m-and-a-master']),
    ]),
    inputs: inputsOf('valuation'), outputs: ['xlsx', 'docx'], signoff: { required: true, levels: PR }, regions: 'all', standards: ALL_STANDARDS,
    connectors: ['sp-global', 'daloopa', 'factset', 'morningstar'], handoffTo: ['ib', 'pe', 'capex'],
  },
  {
    id: 'capex', code: 'F2', group: 'capital', archetype: 'R', package: 'capital', status: 'ready', batch: 7,
    name: i18nKey('资本配置与项目投资'), summary: i18nKey('NPV / IRR、敏感性、实物期权、ROIC 与 WACC 对比、情景分析'),
    ...modes([
      m('npv_irr', i18nKey('NPV / IRR 与投资决策'), ['fa-npv-irr-calculation', 'fa-project-valuation-master', 'fa-investment-decision-report', 'fa-investment-evaluation', 'fa-comparable-company-internal']),
      m('real_options', i18nKey('实物期权'), ['fa-real-options-analysis']),
      m('wacc_roic', i18nKey('WACC 与 ROIC 价值创造'), ['fa-wacc-calculation', 'fa-roic-vs-wacc-comparison', 'fa-capital-allocation-master']),
      m('scenario', i18nKey('多情景分析'), ['fa-scenario-analysis']),
    ]),
    inputs: inputsOf('capex'), outputs: ['xlsx', 'docx'], signoff: { required: true, levels: PA }, regions: 'all',
  },
  {
    id: 'ma', code: 'F3', group: 'capital', archetype: 'S', package: 'capital', status: 'ready', batch: 7,
    name: i18nKey('并购与财务尽调'), summary: i18nKey('尽调清单、财务尽调发现、整合路线图'),
    ...modes([
      m('dd_checklist', i18nKey('尽调清单'), ['fa-dd-checklist'], '/dd-checklist'),
      m('financial_dd', i18nKey('财务尽调'), ['fa-financial-due-diligence', 'fa-m-and-a-master']),
      m('dd_prep', i18nKey('尽调访谈准备'), ['fa-dd-meeting-prep'], '/dd-prep'),
      m('integration', i18nKey('整合路线图'), ['fa-integration-roadmap']),
    ]),
    inputs: inputsOf('ma'), outputs: ['docx', 'xlsx'], signoff: { required: true, levels: PRA }, regions: 'all', connectors: ['egnyte', 'box', 'sharepoint'],
  },
  {
    id: 'ib', code: 'F4', group: 'capital', archetype: 'S', package: 'capital', status: 'ready', batch: 7,
    name: i18nKey('投行交易材料'), summary: i18nKey('CIM、teaser、一页纸、买方名单、程序函、数据包、增厚摊薄、提案材料'),
    ...modes([
      m('merger_model', i18nKey('增厚摊薄与购买价格分摊'), ['fa-merger-model'], '/merger-model'),
      m('buyer_list', i18nKey('买方名单'), ['fa-buyer-list'], '/buyer-list'),
      m('deal_tracker', i18nKey('交易跟踪'), ['fa-deal-tracker'], '/deal-tracker'),
      m('cim', i18nKey('保密信息备忘录 CIM'), ['fa-cim-builder'], '/cim'),
      m('teaser', i18nKey('匿名推介 teaser'), ['fa-teaser'], '/teaser'),
      m('one_pager', i18nKey('一页公司简介'), ['fa-strip-profile'], '/one-pager'),
      m('process_letter', i18nKey('程序函'), ['fa-process-letter'], '/process-letter'),
      m('datapack', i18nKey('交易数据包'), ['fa-datapack-builder']),
      m('pitch', i18nKey('提案材料'), ['fa-pitch-deck']),
    ]),
    inputs: inputsOf('ib'), outputs: ['docx', 'xlsx'], signoff: { required: true, levels: PR }, regions: 'all', connectors: ['sp-global', 'pitchbook', 'factset', 'daloopa'],
  },
  {
    id: 'pe', code: 'F5', group: 'capital', archetype: 'H', package: 'capital', status: 'ready', batch: 7,
    name: i18nKey('私募股权与投后'), summary: i18nKey('初筛备忘录、单位经济、回报敏感性、投委会备忘录、投后 KPI、估值复核与分配瀑布'),
    ...modes([
      m('returns', i18nKey('回报分析 IRR / MOIC'), ['fa-returns-analysis'], '/returns'),
      m('unit_economics', i18nKey('单位经济'), ['fa-unit-economics'], '/unit-economics'),
      m('waterfall', i18nKey('估值复核与分配瀑布'), ['fa-returns-analysis']),
      m('portfolio', i18nKey('投后 KPI 监控'), ['fa-portfolio-monitoring'], '/portfolio'),
      m('screening', i18nKey('交易初筛'), ['fa-deal-screening'], '/screen-deal'),
      m('ic_memo', i18nKey('投委会备忘录'), ['fa-ic-memo'], '/ic-memo'),
      m('value_creation', i18nKey('价值创造计划'), ['fa-value-creation-plan'], '/value-creation'),
      m('sourcing', i18nKey('项目寻源'), ['fa-deal-sourcing'], '/source'),
      m('ai_readiness', i18nKey('AI 就绪度'), ['fa-ai-readiness'], '/ai-readiness'),
    ]),
    inputs: inputsOf('pe'), outputs: ['docx', 'xlsx'], signoff: { required: true, levels: PRA }, regions: 'all', connectors: ['pitchbook', 'chronograph', 'sp-global'],
  },
  {
    id: 'research', code: 'F6', group: 'capital', archetype: 'S', package: 'capital', status: 'ready', batch: 7,
    name: i18nKey('证券研究'), summary: i18nKey('首次覆盖、财报点评与前瞻、晨会纪要、催化剂日历、行业报告；仅供内部研究，非投资建议'),
    ...modes([
      m('initiate', i18nKey('首次覆盖'), ['fa-initiating-coverage'], '/initiate'),
      m('earnings', i18nKey('财报点评'), ['fa-earnings-analysis'], '/earnings'),
      m('earnings_preview', i18nKey('财报前瞻'), ['fa-earnings-preview'], '/earnings-preview'),
      m('model_update', i18nKey('模型更新'), ['fa-model-update'], '/model-update'),
      m('morning_note', i18nKey('晨会纪要'), ['fa-morning-note'], '/morning-note'),
      m('catalysts', i18nKey('催化剂日历'), ['fa-catalyst-calendar'], '/catalysts'),
      m('screen', i18nKey('选股扫描'), ['fa-idea-generation'], '/screen'),
      m('sector', i18nKey('行业全景'), ['fa-sector-overview'], '/sector'),
      m('competitive', i18nKey('竞争格局'), ['fa-competitive-analysis'], '/competitive-analysis'),
      m('thesis', i18nKey('投资逻辑跟踪'), ['fa-thesis-tracker'], '/thesis'),
      m('tear_sheet', i18nKey('公司一页纸'), ['fa-tear-sheet']),
      m('funding_digest', i18nKey('融资动态'), ['fa-funding-digest']),
    ]),
    inputs: inputsOf('research'), outputs: ['docx', 'xlsx'], signoff: { required: true, levels: PR }, regions: 'all',
    connectors: ['factset', 'sp-global', 'daloopa', 'aiera', 'mtnewswire', 'morningstar', 'moodys'],
  },
  {
    id: 'markets', code: 'F7', group: 'capital', archetype: 'H', package: 'capital', status: 'ready', batch: 7,
    name: i18nKey('固定收益与市场分析'), summary: i18nKey('债券相对价值、期货基差、组合久期、互换曲线、外汇套息、期权波动率、宏观利率看板'),
    ...modes([
      m('bond_basis', i18nKey('国债期货基差'), ['fa-bond-futures-basis'], '/analyze-bond-basis'),
      m('bond_rv', i18nKey('债券相对价值'), ['fa-bond-relative-value'], '/analyze-bond-rv'),
      m('fi_portfolio', i18nKey('债券组合久期与压力'), ['fa-fixed-income-portfolio'], '/review-fi-portfolio'),
      m('fx_carry', i18nKey('外汇套息'), ['fa-fx-carry-trade'], '/analyze-fx-carry'),
      m('option_vol', i18nKey('期权波动率'), ['fa-option-vol-analysis'], '/analyze-option-vol'),
      m('swap_curve', i18nKey('互换曲线'), ['fa-swap-curve-strategy'], '/analyze-swap-curve'),
      m('macro_rates', i18nKey('宏观与利率看板'), ['fa-macro-rates-monitor'], '/macro-rates'),
      m('equity_snapshot', i18nKey('个股快照'), ['fa-equity-research'], '/research-equity'),
    ]),
    inputs: inputsOf('markets'), outputs: ['xlsx'], signoff: { required: true, levels: PR }, regions: 'all', connectors: ['lseg', 'moodys'],
  },
  {
    id: 'wealth', code: 'F8', group: 'capital', archetype: 'S', package: 'capital', status: 'ready', batch: 7,
    name: i18nKey('财富管理客户服务'), summary: i18nKey('复盘会准备、客户业绩报告、投资建议书草稿；只给顾问，不发客户'),
    ...modes([
      m('client_review', i18nKey('客户复盘会准备'), ['fa-client-review']),
      m('client_report', i18nKey('客户业绩报告'), ['fa-client-report']),
      m('investment_proposal', i18nKey('投资建议书草稿'), ['fa-investment-proposal']),
      m('meeting_prep', i18nKey('会前简报包'), ['fa-client-review', 'fa-client-report']),
    ]),
    inputs: inputsOf('wealth'), outputs: ['docx', 'xlsx'], signoff: { required: true, levels: PR }, regions: 'all', connectors: ['morningstar'],
  },
];
