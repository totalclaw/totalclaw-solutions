/**
 * G2 审计与内控（6），批次 3：B1 内控与 SOX、B2 内部审计、B3 外审配合与函证、B4 报表与底稿复核、B5 舞弊排查、B6 客商尽调。
 *
 * 结构化的审计表格（控制清单、样本总体、整改台账、函证清单、付款登记、主数据、规则表、名单）按文件导入（kind: evidence），
 * 第 ③ 步由 engines/audit/table.ts 按三语表头识别列，认不出的必需列作为阻断项写明。
 */
import { i18nKey } from '@totalclaw/i18n';
import { PA, PR, PRA, type FauModuleSpec } from './types';

const IC_MASTER = 'fa-internal-control-master';
const IA_MASTER = 'fa-internal-audit-master';
const AS_MASTER = 'fa-audit-support-master';

export const AUDIT_MODULES: FauModuleSpec[] = [
  {
    id: 'icfr', code: 'B1', group: 'audit', archetype: 'H', package: 'audit', status: 'ready', batch: 3,
    name: i18nKey('内控与 SOX 测试'), summary: i18nKey('风险控制矩阵、审批矩阵、属性抽样测试（固定种子可复现）、缺陷分级与整改计划'),
    modes: [
      { id: 'design', name: i18nKey('新建内控流程（起草 RCM）'), skills: [IC_MASTER, 'fa-sox-control-design', 'fa-approval-matrix'], engines: ['rcmDraft'] },
      { id: 'testing', name: i18nKey('控制测试'), skills: [IC_MASTER, 'fa-control-testing', 'fa-control-deficiency'], engines: ['sampleSize', 'sampling', 'testEvaluation', 'deficiencyMatrix'] },
      { id: 'deficiency', name: i18nKey('缺陷评估与整改'), skills: [IC_MASTER, 'fa-control-deficiency'], engines: ['deficiencyMatrix'] },
    ],
    inputs: [
      { id: 'processDocs', kind: 'evidence', required: false, requiredModes: ['design'], modes: ['design'], multi: true, label: i18nKey('流程文档与制度'), help: i18nKey('采购、销售、费用等业务流程说明、内控制度、权限手册（PDF / Word / Excel），按不可信文件处理，只用来起草草稿') },
      { id: 'controls', kind: 'evidence', required: false, requiredModes: ['testing'], modes: ['testing'], label: i18nKey('控制清单'), help: i18nKey('每行一个控制：控制编号、流程、风险、控制描述、频率（年 / 季 / 月 / 周 / 日 / 多次）、是否关键控制、预期与可容忍偏差率（可选）；可下载模板填写') },
      { id: 'population', kind: 'evidence', required: false, requiredModes: ['testing'], modes: ['testing'], label: i18nKey('样本总体'), help: i18nKey('测试期间内的全部交易或控制执行记录：单号、日期、金额，可带控制编号列按控制拆分；没有控制编号列时整表作为每个关键控制的总体') },
      { id: 'deficiencies', kind: 'evidence', required: false, requiredModes: ['deficiency'], modes: ['deficiency'], label: i18nKey('缺陷清单'), help: i18nKey('每行一个缺陷：编号、控制编号、描述、涉及金额、运营影响（高 / 中 / 低）、补偿性控制（有效 / 部分有效 / 无）、整改负责人与期限') },
    ],
    outputs: ['xlsx', 'docx'],
    signoff: { required: true, levels: PRA },
    regions: 'all',
    handoffTo: ['internal-audit'],
  },
  {
    id: 'internal-audit', code: 'B2', group: 'audit', archetype: 'S', package: 'audit', status: 'ready', batch: 3,
    name: i18nKey('内部审计'), summary: i18nKey('风险导向年度计划、业务循环穿行与测试、审计报告草稿、发现整改台账与超期升级'),
    modes: [
      { id: 'plan', name: i18nKey('年度审计计划'), skills: [IA_MASTER, 'fa-annual-audit-planning'], engines: ['riskMatrix', 'resourcePlan', 'planNarrative'] },
      { id: 'fieldwork', name: i18nKey('流程合规审计'), skills: [IA_MASTER, 'fa-process-compliance-audit'], engines: ['auditProgram', 'findingVerify'] },
      { id: 'tracking', name: i18nKey('整改跟踪'), skills: [IA_MASTER, 'fa-audit-finding-tracking'], engines: ['findingTracking'] },
    ],
    inputs: [
      { id: 'universe', kind: 'evidence', required: false, requiredModes: ['plan'], modes: ['plan'], label: i18nKey('审计范围与风险评估表'), help: i18nKey('每行一个可审计领域：领域名称、可能性（高 / 中 / 低）、影响（高 / 中 / 低）、是否必审、上次审计日期、预计人天（可选）') },
      { id: 'planDocs', kind: 'evidence', required: false, modes: ['plan'], multi: true, label: i18nKey('上年发现、组织架构与制度'), help: i18nKey('上年度审计报告、组织架构图、重要制度；按不可信文件处理，只用来写计划说明') },
      { id: 'auditDocs', kind: 'evidence', required: false, requiredModes: ['fieldwork'], modes: ['fieldwork'], multi: true, label: i18nKey('制度、流程与审计证据'), help: i18nKey('被审流程的制度、流程文件与抽查的证据；每条发现必须引用原文，定位不到的发现直接丢弃') },
      { id: 'findings', kind: 'evidence', required: false, modes: ['tracking'], label: i18nKey('发现整改台账'), help: i18nKey('每行一条发现：编号、标题、严重程度（重大 / 中度 / 轻度）、整改负责人、整改期限、状态、完成日期；也可以只用内控与舞弊模块转交过来的事项') },
    ],
    outputs: ['xlsx', 'docx'],
    signoff: { required: true, levels: PRA },
    regions: 'all',
  },
  {
    id: 'ext-audit', code: 'B3', group: 'audit', archetype: 'H', package: 'audit', status: 'ready', batch: 3,
    name: i18nKey('外审配合与函证'), summary: i18nKey('PBC 进度、审计调整影响分析、函证控制表：函证文本由人点发送，回函自动归集'),
    modes: [
      { id: 'support', name: i18nKey('资料清单与审计调整'), skills: [AS_MASTER, 'fa-audit-evidence-collection', 'fa-audit-adjustment-review'], engines: ['pbcProgress', 'adjustmentImpact'] },
      { id: 'confirm_prepare', name: i18nKey('函证准备（生成函证草稿）'), skills: [AS_MASTER, 'fa-confirmation-management'], engines: ['confirmLetters'] },
      { id: 'confirm_replies', name: i18nKey('回函核对'), skills: [AS_MASTER, 'fa-confirmation-management'], engines: ['replyMatch', 'replyExtract'] },
    ],
    inputs: [
      { id: 'pbc', kind: 'evidence', required: false, modes: ['support'], label: i18nKey('审计资料清单（PBC）'), help: i18nKey('审计师给的资料清单：编号、资料名称、负责人、截止日期、状态；已签核归档并转交过来的底稿会自动记为已提供') },
      { id: 'adjustments', kind: 'journal', required: false, modes: ['support'], label: i18nKey('审计调整分录'), help: i18nKey('审计师提出的调整分录，格式同序时账：凭证号、科目、借贷金额、摘要') },
      { id: 'adjTb', kind: 'tb', required: false, modes: ['support'], label: i18nKey('科目余额表（调整前）'), help: i18nKey('用于计算调整前后的报表影响；不提供时只按调整分录本身计算') },
      { id: 'confirmList', kind: 'evidence', required: false, requiredModes: ['confirm_prepare'], modes: ['confirm_prepare', 'confirm_replies'], label: i18nKey('函证清单'), help: i18nKey('每行一份函证：函证编号、类型（银行 / 应收 / 应付 / 其他）、对象名称、邮箱、账号或往来、账面金额、币种；回函核对时不提供则沿用本项目最近一次签核归档的函证准备') },
      { id: 'replies', kind: 'evidence', required: false, requiredModes: ['confirm_replies'], modes: ['confirm_replies'], multi: true, label: i18nKey('回函'), help: i18nKey('收到的回函（PDF / 图片 / Word / Excel），文件名或正文里带函证编号即可自动归到对应函证；按不可信文件处理') },
    ],
    outputs: ['xlsx', 'docx'],
    signoff: { required: true, levels: PR },
    regions: 'all',
  },
  {
    id: 'review', code: 'B4', group: 'audit', archetype: 'R', package: 'audit', status: 'ready', batch: 3,
    name: i18nKey('报表与底稿复核'), summary: i18nKey('报表勾稽、底稿质检、交叉索引核对、基金 LP 资本账户独立重算'),
    modes: [
      { id: 'statements', name: i18nKey('报表勾稽与底稿质检'), skills: ['fa-close-verification', 'fa-audit-xls'], engines: ['trialBalance', 'xlsAudit', 'crossIndex'] },
      { id: 'fund', name: i18nKey('基金 LP 对账单复核'), skills: ['fa-nav-tieout'], engines: ['navTieout'] },
    ],
    inputs: [
      { id: 'tb', kind: 'tb', required: false, requiredModes: ['statements'], modes: ['statements'], label: i18nKey('本期科目余额表'), help: i18nKey('报表所依据的科目余额表；用于试算平衡、资产负债平衡、净利润与未分配利润、现金勾稽') },
      { id: 'tbPrior', kind: 'tb', required: false, modes: ['statements'], label: i18nKey('上期科目余额表'), help: i18nKey('用于期初衔接核对') },
      { id: 'journal', kind: 'journal', required: false, modes: ['statements'], label: i18nKey('本期序时账（可选）'), help: i18nKey('用于现金流量勾稽；不提供时这一项标「无法执行」，不算不通过') },
      { id: 'papers', kind: 'evidence', required: false, modes: ['statements'], multi: true, label: i18nKey('底稿与报表文件'), help: i18nKey('要质检的底稿 xlsx（错误值、公式里的硬编码、公式不一致、求和漏行、跨表断链、隐藏行与隐藏表）；转交过来的关账包会自动纳入') },
      { id: 'lpStatements', kind: 'evidence', required: false, requiredModes: ['fund'], modes: ['fund'], label: i18nKey('LP 对账单'), help: i18nKey('待发出的 LP 对账单汇总表：LP 编号、期初资本、本期出资、本期分配、分摊损益、附带权益、期末资本（被测对象）') },
      { id: 'navLp', kind: 'evidence', required: false, requiredModes: ['fund'], modes: ['fund'], label: i18nKey('NAV 包：LP 资本账户'), help: i18nKey('NAV 包里的 LP 明细：LP 编号、持有比例、期初资本、本期出资、本期分配、附带权益（真实来源）') },
      { id: 'navFund', kind: 'evidence', required: false, requiredModes: ['fund'], modes: ['fund'], label: i18nKey('NAV 包：基金损益'), help: i18nKey('基金层面的项目与金额两列：已实现损益、未实现损益、管理费、基金费用、基金净值') },
    ],
    outputs: ['xlsx', 'docx'],
    signoff: { required: true, levels: PRA },
    regions: 'all',
    handoffTo: ['ext-audit'],
  },
  {
    id: 'fraud', code: 'B5', group: 'audit', archetype: 'H', package: 'audit', status: 'ready', batch: 3,
    name: i18nKey('舞弊排查'), summary: i18nKey('本福特检验、重复付款、周末与期末大额手工调整、供应商与员工账户碰撞，调查计划草稿'),
    modes: [
      { id: 'scan', name: i18nKey('数据分析筛查与调查计划'), skills: ['fa-fraud-investigation'], engines: ['riskRules', 'benford', 'duplicatePayment', 'weekendEntry', 'periodEndManual', 'roundAmount', 'vendorEmployeeBank', 'relatedName', 'investigationPlan'] },
    ],
    inputs: [
      { id: 'journal', kind: 'journal', required: true, label: i18nKey('序时账'), help: i18nKey('检查期间的全部凭证明细；有凭证来源列（手工 / 系统）时能识别期末大额手工调整') },
      { id: 'payments', kind: 'evidence', required: false, label: i18nKey('付款登记'), help: i18nKey('付款明细：付款单号、收款方、发票号、金额、付款日期、收款账号；用于重复付款检查') },
      { id: 'vendors', kind: 'evidence', required: false, label: i18nKey('供应商主数据'), help: i18nKey('供应商编号、名称、银行账号；用于与员工账户碰撞和关联方名称相似检查') },
      { id: 'employees', kind: 'evidence', required: false, label: i18nKey('员工主数据'), help: i18nKey('员工编号、姓名、银行账号（可脱敏到能比对的程度）') },
      { id: 'fraudTb', kind: 'tb', required: false, label: i18nKey('科目余额表（可选）'), help: i18nKey('用于往来挂账与余额方向异常检查') },
      { id: 'leads', kind: 'evidence', required: false, multi: true, label: i18nKey('线索与举报材料'), help: i18nKey('举报信、访谈记录等；按不可信文件处理，只用来写调查计划') },
    ],
    outputs: ['xlsx', 'docx'],
    signoff: { required: true, levels: PRA },
    regions: 'all',
    handoffTo: ['internal-audit'],
  },
  {
    id: 'kyc', code: 'B6', group: 'audit', archetype: 'H', package: 'audit', status: 'ready', batch: 3,
    name: i18nKey('客商尽调与反洗钱'), summary: i18nKey('资料抽取、规则逐条结论、名单匹配与处置建议（从不批准），合规官决定'),
    modes: [
      { id: 'screen', name: i18nKey('客商尽调筛查'), skills: ['fa-kyc-doc-parse', 'fa-kyc-rules'], engines: ['docParse', 'rulesGrid', 'watchlist', 'disposition'] },
    ],
    inputs: [
      { id: 'packet', kind: 'evidence', required: true, multi: true, label: i18nKey('客户 / 供应商资料包'), help: i18nKey('营业执照、身份证件、股权结构与受益所有人声明、地址证明、资金来源说明等（支持中文、英文、阿语）；按不可信文件处理，抽取时不给模型任何工具') },
      { id: 'rules', kind: 'evidence', required: false, label: i18nKey('企业规则表'), help: i18nKey('本企业的尽调规则：规则编号、规则说明、字段、条件、值、结果（升级 / 补件 / 拒绝 / 计分）；不提供时用内置规则') },
      { id: 'watchlist', kind: 'evidence', required: false, label: i18nKey('名单'), help: i18nKey('制裁、政要等名单（上传）：名称、别名、名单名称；按规范化姓名与相似度匹配') },
    ],
    outputs: ['xlsx'],
    signoff: { required: true, levels: PA },
    regions: 'all',
  },
];
