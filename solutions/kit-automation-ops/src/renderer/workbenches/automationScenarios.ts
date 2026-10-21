export type AutomationDomain = 'warehouse' | 'healthcare' | 'global-ads';

export type AutomationStep = {
  label: string;
  detail: string;
  target: string;
  kind: 'read' | 'write' | 'analysis' | 'guard';
  evidence?: string;
  requiresApproval?: boolean;
};

export type AutomationAgent = {
  id: string;
  name: string;
  role: string;
  icon: string;
};

export type AutomationScenario = {
  id: string;
  title: string;
  subtitle: string;
  system: string;
  url: string;
  trigger: string;
  duration: string;
  impact: string;
  steps: AutomationStep[];
  metrics: Array<{ label: string; value: string; tone?: 'good' | 'warn' | 'danger' }>;
  rows: Array<{ title: string; meta: string; value: string; tone?: 'good' | 'warn' | 'danger' }>;
};

import { t as i18nT } from '../i18n';

const RAW_DOMAIN_AGENT_TEAMS: Record<AutomationDomain, AutomationAgent[]> = {
  warehouse: [
    { id: 'supply-planner', name: i18nT('产销计划 Agent'), role: i18nT('汇总需求、订单与补货信号'), icon: 'ri-line-chart-line' },
    { id: 'data-normalizer', name: i18nT('数据归一 Agent'), role: i18nT('解析多源字段与单位口径'), icon: 'ri-filter-3-line' },
    { id: 'inventory-controller', name: i18nT('库存控制 Agent'), role: i18nT('对账、盘点与异常定位'), icon: 'ri-archive-stack-line' },
    { id: 'fulfillment-operator', name: i18nT('出入库执行 Agent'), role: i18nT('操作 WMS / ERP 单据'), icon: 'ri-truck-line' },
    { id: 'evidence-auditor', name: i18nT('审计留痕 Agent'), role: i18nT('保存来源、审批与执行证据'), icon: 'ri-file-shield-2-line' },
  ],
  healthcare: [
    { id: 'patient-service', name: i18nT('患者服务 Agent'), role: i18nT('预约、咨询与服务提醒'), icon: 'ri-customer-service-2-line' },
    { id: 'privacy-guardian', name: i18nT('隐私保护 Agent'), role: i18nT('PHI 脱敏与数据边界'), icon: 'ri-shield-user-line' },
    { id: 'hospital-ops', name: i18nT('院内运营 Agent'), role: i18nT('排班、工单与资源协同'), icon: 'ri-hospital-line' },
    { id: 'quality-reviewer', name: i18nT('质量复核 Agent'), role: i18nT('规则检查与人工升级'), icon: 'ri-user-follow-line' },
  ],
  'global-ads': [
    { id: 'client-strategy', name: i18nT('客户策略 Agent'), role: i18nT('解析品牌目标与 UAE 市场'), icon: 'ri-focus-3-line' },
    { id: 'creative-localizer', name: i18nT('素材本地化 Agent'), role: i18nT('阿英双语素材与 RTL 适配'), icon: 'ri-palette-line' },
    { id: 'media-buyer', name: i18nT('媒体投放 Agent'), role: i18nT('Meta / Google 跨平台建投'), icon: 'ri-advertisement-line' },
    { id: 'growth-analyst', name: i18nT('增长分析 Agent'), role: i18nT('统一指标、归因与复盘'), icon: 'ri-bar-chart-box-line' },
    { id: 'account-optimizer', name: i18nT('账户优化 Agent'), role: i18nT('预算、受众与创意迭代'), icon: 'ri-settings-4-line' },
  ],
};

const RAW_AUTOMATION_SCENARIOS: Record<AutomationDomain, AutomationScenario[]> = {
  warehouse: [
    {
      id: 'three-way-reconcile',
      title: i18nT('WMS × ERP × 平台库存三方对账'),
      subtitle: i18nT('三类异构数据归一后由确定性引擎、产销计划和证据审计 Agent 接力处理'),
      system: i18nT('Odoo Inventory + 三方确定性对账引擎'),
      url: 'http://127.0.0.1:8069/odoo/inventory/receipts',
      trigger: i18nT('打开本地 Odoo，并载入 WMS、SAP ERP 与电商平台快照'),
      duration: i18nT('真实浏览器 + 确定性引擎 + 多 Agent'),
      impact: i18nT('5 项发现 · SAR 35,400'),
      steps: [
        { label: i18nT('读取三方库存快照'), detail: i18nT('产销计划 Agent 打开右侧本地 Odoo Inventory，并载入 WMS、SAP ERP 和电商平台记录'), target: i18nT('Odoo Inventory + 三方数据入口'), kind: 'read', evidence: i18nT('浏览器回执 + 4 + 4 + 3 条') },
        { label: i18nT('归一 SKU 与箱规'), detail: i18nT('数据归一 Agent 统一商品、仓库、CTN 箱规和 PCS 数量口径'), target: i18nT('字段映射器'), kind: 'analysis', evidence: 'CTN × 12 → PCS' },
        { label: i18nT('执行三方确定性比较'), detail: i18nT('库存控制 Agent 计算缺失、数量、单位、临期与金额影响'), target: i18nT('三方对账引擎'), kind: 'analysis', evidence: '5 findings' },
        { label: i18nT('生成产销处置与证据'), detail: i18nT('真实 Agent 基于来源锚点生成补货、调拨、拆单和临期处置建议'), target: i18nT('Agent + 证据链'), kind: 'analysis', evidence: 'SAR 35,400' },
        { label: i18nT('请求确认处置方案'), detail: i18nT('补货、调拨或拆单建议进入人工确认，不直接改写 ERP'), target: i18nT('人工闸门'), kind: 'guard', requiresApproval: true, evidence: i18nT('等待确认') },
        { label: i18nT('写入本次执行记录'), detail: i18nT('记录确认人、执行编号和结构化对账结论'), target: i18nT('审计记录'), kind: 'write', evidence: 'execution log' },
      ],
      metrics: [
        { label: i18nT('数据源'), value: '3' },
        { label: i18nT('发现'), value: '5', tone: 'warn' },
        { label: i18nT('影响'), value: 'SAR 35,400', tone: 'danger' },
      ],
      rows: [
        { title: i18nT('SKU-100 · 箱规与数量差异'), meta: i18nT('SAP 10 CTN × 12 = 120 PCS；WMS 100 PCS'), value: 'SAR 10,400', tone: 'danger' },
        { title: i18nT('SKU-200 · 平台记录缺失'), meta: i18nT('WMS / ERP 均为 40 PCS，Commerce 无记录'), value: i18nT('待核查'), tone: 'warn' },
        { title: i18nT('SKU-300 · 平台数量差异'), meta: i18nT('WMS / ERP 30 PCS；Commerce 25 PCS'), value: 'SAR 25,000', tone: 'danger' },
        { title: i18nT('SKU-400 · 临期风险'), meta: i18nT('WMS 批次将在 45 天内到期'), value: i18nT('优先出库'), tone: 'warn' },
      ],
    },
    {
      id: 'odoo-receipt',
      title: i18nT('Odoo 采购到货与入库协同'),
      subtitle: i18nT('读取本地持久化 Odoo 当前收货单，完成页面核验后才允许人工确认入库'),
      system: 'Odoo Inventory',
      url: 'http://127.0.0.1:8069/odoo/inventory/receipts',
      trigger: i18nT('操作员打开 Odoo 收货单'),
      duration: i18nT('本地 Odoo 实时操作'),
      impact: i18nT('仅在回读 Done 后标记完成'),
      steps: [
        { label: i18nT('打开 Inventory Receipts'), detail: i18nT('在内置浏览器进入本地持久化 Odoo'), target: 'Odoo', kind: 'read' },
        { label: i18nT('读取当前收货单'), detail: i18nT('回读页面地址、标题和当前单据内容'), target: 'Odoo', kind: 'read', evidence: i18nT('浏览器回执') },
        { label: i18nT('检查页面可操作性'), detail: i18nT('登录页、错误页或无 Validate 按钮都会立即停止'), target: i18nT('页面验证器'), kind: 'analysis', evidence: i18nT('DOM 校验') },
        { label: i18nT('请求验证入库'), detail: i18nT('状态变更动作必须由现场演示人员确认'), target: i18nT('人工闸门'), kind: 'guard', requiresApproval: true },
        { label: i18nT('点击 Validate'), detail: i18nT('对当前本地演示单据执行已确认操作'), target: 'Odoo', kind: 'write', evidence: i18nT('浏览器操作回执') },
        { label: i18nT('回读结果并留证'), detail: i18nT('只有页面明确显示 Done / 已完成才判定成功'), target: i18nT('审计记录'), kind: 'read', evidence: i18nT('状态回读') },
      ],
      metrics: [
        { label: i18nT('系统'), value: 'Local Odoo 18' },
        { label: i18nT('操作'), value: 'Validate' },
        { label: i18nT('判定'), value: i18nT('页面回读'), tone: 'warn' },
      ],
      rows: [
        { title: i18nT('当前本地演示单据'), meta: i18nT('单据号、产品和数量以右侧 Odoo 实际页面为准'), value: i18nT('待读取'), tone: 'warn' },
        { title: i18nT('状态变更'), meta: i18nT('未回读到 Done 时不会展示成功'), value: i18nT('人工确认'), tone: 'warn' },
      ],
    },
    {
      id: 'supply-gap',
      title: i18nT('产销缺口与补货协同'),
      subtitle: i18nT('汇总销售预测、在途采购与现有库存，形成补货和调拨待办'),
      system: 'Odoo Inventory + Supply Planning Runner',
      url: 'http://127.0.0.1:8069/odoo/inventory/receipts',
      trigger: i18nT('打开本地 Odoo，并读取每日销售预测与库存快照'),
      duration: i18nT('真实浏览器 + 5 个 Agent 接力'),
      impact: i18nT('3 个 SKU 需要人工确认'),
      steps: [
        { label: i18nT('汇总产销存数据'), detail: i18nT('打开右侧本地 Odoo Inventory，读取销售预测、已确认订单、库存和在途采购记录'), target: 'Odoo Inventory + OMS / WMS / ERP', kind: 'read', evidence: i18nT('浏览器回执 + 4 sources') },
        { label: i18nT('统一编码与单位'), detail: i18nT('把不同系统的 SKU、箱规、仓库和时间粒度归一'), target: i18nT('数据归一 Agent'), kind: 'analysis', evidence: 'InventoryRecord v1' },
        { label: i18nT('计算供需缺口'), detail: i18nT('按确定性规则计算可用量、在途量和安全库存差额'), target: 'Supply Rules', kind: 'analysis', evidence: '3 shortage SKUs' },
        { label: i18nT('生成补货与调拨待办'), detail: i18nT('只生成建议数量、来源和到期时间，不自动下采购单'), target: i18nT('任务中心'), kind: 'write', evidence: '3 actions' },
        { label: i18nT('计划员人工确认'), detail: i18nT('采购、调拨和拆单动作由计划员确认'), target: i18nT('人工闸门'), kind: 'guard', requiresApproval: true },
      ],
      metrics: [
        { label: i18nT('数据源'), value: '4' },
        { label: i18nT('缺口 SKU'), value: '3', tone: 'warn' },
        { label: i18nT('自动下单'), value: i18nT('关闭'), tone: 'good' },
      ],
      rows: [
        { title: 'SKU-002 · RUH-A', meta: i18nT('订单 18 · 可用 12 · 在途 0 · 安全库存 4'), value: i18nT('建议补 10'), tone: 'danger' },
        { title: 'SKU-003 · JED-B', meta: i18nT('订单 7 · 可用 8 · 在途 0 · 安全库存 3'), value: i18nT('建议调拨 2'), tone: 'warn' },
        { title: 'SKU-005 · DMM-C', meta: i18nT('预测需求 9 · 可用 6 · 在途 6'), value: i18nT('在途可覆盖'), tone: 'good' },
      ],
    },
  ],
  healthcare: [
    {
      id: 'outpatient-service',
      title: i18nT('门诊预约与服务协同'),
      subtitle: i18nT('多 Agent 完成预约意图识别、信息脱敏、科室服务匹配与人工确认'),
      system: 'OpenMRS Appointment Scheduling',
      url: 'http://127.0.0.1:8088/openmrs/appointmentschedulingui/appointmentRequests.page',
      trigger: i18nT('读取本地 OpenMRS 预约队列并载入 36 条演示请求'),
      duration: i18nT('真实 HIS + 4 个 Agent 接力'),
      impact: i18nT('8 项异常转人工服务台'),
      steps: [
        { label: i18nT('读取预约与咨询请求'), detail: i18nT('患者服务 Agent 登录本地 OpenMRS 并打开 Appointment Requests'), target: 'OpenMRS Appointment Requests', kind: 'read', evidence: i18nT('本地 HIS 队列 + 36 requests') },
        { label: i18nT('执行 PHI 脱敏'), detail: i18nT('隐私保护 Agent 在模型处理前替换姓名、手机号和证件号'), target: 'PHI Masker', kind: 'analysis', evidence: i18nT('真实接口响应') },
        { label: i18nT('识别服务意图'), detail: i18nT('院内运营 Agent 只识别预约、改期、报告领取、院内导航等非临床意图'), target: i18nT('全局模型'), kind: 'analysis', evidence: '6 service intents' },
        { label: i18nT('匹配预约服务资源'), detail: i18nT('结合 OpenMRS Daily Appointments 匹配可用窗口，不判断病情'), target: 'OpenMRS Daily Appointments', kind: 'analysis', evidence: i18nT('HIS 页面 + 28 auto-routed') },
        { label: i18nT('生成服务任务'), detail: i18nT('打开 OpenMRS Manage Appointments，把异常请求整理为人工待办'), target: 'OpenMRS Manage Appointments', kind: 'write', evidence: i18nT('HIS 页面 + 8 tasks') },
        { label: i18nT('服务主管确认'), detail: i18nT('由人工确认分派结果后写入复核队列'), target: i18nT('人工终审'), kind: 'guard', requiresApproval: true },
      ],
      metrics: [
        { label: i18nT('服务请求'), value: '36' },
        { label: i18nT('自动整理'), value: '28', tone: 'good' },
        { label: i18nT('人工协助'), value: '8', tone: 'warn' },
      ],
      rows: [
        { title: i18nT('REQ-029 · 预约改期'), meta: i18nT('东院区 · 需要无障碍协助 · 联系方式已脱敏'), value: i18nT('人工协助'), tone: 'warn' },
        { title: i18nT('REQ-031 · 报告领取'), meta: i18nT('缺少领取方式 · 只补充服务信息'), value: i18nT('待补资料'), tone: 'warn' },
        { title: i18nT('REQ-034 · 院内导航'), meta: i18nT('国际患者 · 需要双语路线说明'), value: i18nT('已生成'), tone: 'good' },
        { title: i18nT('服务边界'), meta: i18nT('不判断疾病、不推荐科室、不提供治疗意见'), value: i18nT('已强制'), tone: 'good' },
      ],
    },
    {
      id: 'hospital-operations',
      title: i18nT('OpenMRS HIS 患者服务协同'),
      subtitle: i18nT('Agent 登录本地开源 HIS，依次完成患者登记、检索、档案、就诊队列、预约与报表流程'),
      system: 'OpenMRS Reference Application',
      url: 'http://127.0.0.1:8088/openmrs/login.htm',
      trigger: i18nT('从本地持久化 OpenMRS 启动患者服务流程'),
      duration: i18nT('真实浏览器操作'),
      impact: i18nT('关键页面与操作回执可见'),
      steps: [
        { label: i18nT('登录 OpenMRS HIS'), detail: i18nT('患者服务 Agent 进入本地 OpenMRS Registration Desk'), target: 'OpenMRS Home', kind: 'read', evidence: i18nT('本地开源系统') },
        { label: i18nT('登记虚构患者'), detail: i18nT('先在 Register a patient 创建本次演示专用患者并读取新编号'), target: 'Patient Registration', kind: 'write', evidence: i18nT('同一浏览器会话') },
        { label: i18nT('搜索并打开新建档案'), detail: i18nT('立即按新生成的姓名或编号搜索，验证 MySQL 持久化并打开同一患者档案'), target: 'Patient Search / Record', kind: 'read', evidence: i18nT('登记 → 搜索 → 同一档案页') },
        { label: i18nT('读取活跃就诊队列'), detail: i18nT('院内运营 Agent 打开 Active Visits，读取当前就诊服务队列'), target: 'Active Visits', kind: 'analysis', evidence: i18nT('实时队列') },
        { label: i18nT('进入预约与运营报表'), detail: i18nT('依次进入 Reports 与 Appointment Scheduling，读取后续服务入口'), target: 'Reports / Appointments', kind: 'read', evidence: i18nT('右侧页面可见') },
        { label: i18nT('运营主管确认'), detail: i18nT('新建就诊、预约落单和登记状态变更前暂停，由人工确认'), target: i18nT('人工复核队列'), kind: 'guard', requiresApproval: true },
      ],
      metrics: [
        { label: i18nT('HIS 系统'), value: 'OpenMRS', tone: 'good' },
        { label: i18nT('操作方式'), value: i18nT('内置浏览器'), tone: 'good' },
        { label: i18nT('数据'), value: i18nT('本地持久化虚构数据') },
      ],
      rows: [
        { title: 'Find Patient Record', meta: i18nT('患者检索、登记档案与服务入口'), value: i18nT('执行后回读') },
        { title: 'Active Visits', meta: i18nT('当前就诊服务队列实时读取'), value: i18nT('执行后回读') },
        { title: 'Appointment Scheduling', meta: i18nT('预约、服务、时间与地点入口'), value: i18nT('人工确认') },
        { title: 'Reports', meta: i18nT('运营报表与数据回读'), value: i18nT('执行后回读') },
      ],
    },
    {
      id: 'service-followup',
      title: i18nT('出院服务与满意度回访'),
      subtitle: i18nT('仅处理服务提醒、交通住宿、材料领取与满意度反馈，不涉及诊疗内容'),
      system: 'OpenMRS Patient Service Operations',
      url: 'http://127.0.0.1:8088/openmrs/coreapps/activeVisits.page?app=coreapps.activeVisits',
      trigger: i18nT('读取本地 OpenMRS 就诊队列并载入 47 条演示回访任务'),
      duration: i18nT('真实 HIS + 4 个 Agent 接力'),
      impact: i18nT('6 项服务问题转人工'),
      steps: [
        { label: i18nT('读取服务回访清单'), detail: i18nT('患者服务 Agent 登录本地 OpenMRS 并读取 Active Visits 服务队列'), target: 'OpenMRS Active Visits', kind: 'read', evidence: i18nT('本地 HIS 队列 + 47 tasks') },
        { label: i18nT('执行 PHI 脱敏'), detail: i18nT('隐私保护 Agent 替换姓名和联系方式'), target: 'PHI Masker', kind: 'analysis', evidence: i18nT('真实接口响应') },
        { label: i18nT('生成服务提醒草稿'), detail: i18nT('生成材料领取、交通住宿和满意度回访问句，不包含医疗建议'), target: i18nT('全局模型'), kind: 'write', evidence: 'service-only draft' },
        { label: i18nT('分类服务反馈'), detail: i18nT('结合 OpenMRS Reports 按等待、环境和指引等非临床类别整理'), target: 'OpenMRS Reports', kind: 'analysis', evidence: i18nT('HIS 页面 + 5 categories') },
        { label: i18nT('创建人工跟进任务'), detail: i18nT('打开 OpenMRS 患者服务入口，6 项未解决问题进入人工队列'), target: 'OpenMRS Patient Search', kind: 'write', evidence: i18nT('HIS 页面 + 6 tasks') },
        { label: i18nT('服务主管确认'), detail: i18nT('由人工确认发送与后续责任人'), target: i18nT('人工终审'), kind: 'guard', requiresApproval: true },
      ],
      metrics: [
        { label: i18nT('回访任务'), value: '47' },
        { label: 'PHI', value: i18nT('已脱敏'), tone: 'good' },
        { label: i18nT('人工跟进'), value: '6', tone: 'warn' },
      ],
      rows: [
        { title: i18nT('P-2291 · 报告领取'), meta: i18nT('不清楚领取时间与入口'), value: i18nT('待解释'), tone: 'warn' },
        { title: i18nT('P-2287 · 院内指引'), meta: i18nT('反馈路线标识不清晰'), value: i18nT('运营改进'), tone: 'warn' },
        { title: i18nT('P-2304 · 服务评价'), meta: i18nT('等待时间较长，已形成服务工单'), value: i18nT('人工跟进'), tone: 'danger' },
        { title: i18nT('安全边界'), meta: 'No diagnosis · no prescription · no treatment advice', value: i18nT('强制'), tone: 'good' },
      ],
    },
  ],
  'global-ads': [
    {
      id: 'campaign-launch',
      title: i18nT('阿联酋产品推广作业包发布'),
      subtitle: i18nT('客户策略、素材本地化与媒体投放 Agent 接力准备并发布 UAE 推广活动'),
      system: 'Meta · Google Ads · YouTube Platform Drivers',
      url: 'workspace://global-ads/campaign/create',
      trigger: i18nT('客户已提交产品、增长目标与图片/视频素材'),
      duration: i18nT('约 90 秒'),
      impact: i18nT('Mock 平台发布回执全程可见'),
      steps: [
        { label: i18nT('解析客户推广需求'), detail: i18nT('读取品牌、产品、UAE 目标受众、增长 KPI 与客户上传素材'), target: i18nT('客户 Brief / 素材库'), kind: 'read', evidence: 'brief + asset' },
        { label: i18nT('生成 UAE 渠道策略'), detail: i18nT('组合 Facebook、Instagram、Google Ads 与 YouTube 的曝光和增长角色'), target: i18nT('客户策略 Agent'), kind: 'analysis', evidence: '4-channel plan' },
        { label: i18nT('完成阿英素材本地化'), detail: i18nT('保留客户素材，生成阿拉伯语标题、英文补充与 RTL 落地内容'), target: i18nT('素材本地化 Agent'), kind: 'write', evidence: 'uploaded asset + RTL' },
        { label: i18nT('校验 Mock 平台投放计划'), detail: i18nT('逐个平台校验测试账户、预算、受众和素材配置'), target: 'Platform Drivers', kind: 'analysis', evidence: 'driver validation' },
        { label: i18nT('提交 Mock 平台发布'), detail: i18nT('在同一次演示运行中向已启用测试平台创建广告系列'), target: 'Platform Drivers', kind: 'write', evidence: 'created / submitted' },
        { label: i18nT('读取发布回执并审计'), detail: i18nT('逐个平台回读系列编号、状态和审计流水'), target: 'Audit Trail', kind: 'read', evidence: 'platform response' },
      ],
      metrics: [
        { label: i18nT('目标市场'), value: 'UAE', tone: 'good' },
        { label: i18nT('语言'), value: 'Arabic · RTL', tone: 'good' },
        { label: i18nT('执行方式'), value: 'API / Web', tone: 'good' },
      ],
      rows: [
        { title: i18nT('客户上传广告素材'), meta: i18nT('图片 / 视频 · 文件名与类型全程留痕'), value: i18nT('投放前必选') },
        { title: i18nT('Mock 平台账户'), meta: i18nT('只对已启用并通过验证的 Meta / Google Ads / YouTube 测试账户执行'), value: i18nT('直接发布'), tone: 'good' },
        { title: i18nT('执行结果'), meta: i18nT('失败即停止并显示平台原始错误，不伪造成功'), value: i18nT('真实回执'), tone: 'good' },
      ],
    },
    {
      id: 'cross-platform-review',
      title: i18nT('跨平台投放复盘'),
      subtitle: i18nT('拉取四平台数据并生成可追溯优化动作'),
      system: 'Marketing Operations Runner',
      url: 'https://ads.google.com/aw/overview',
      trigger: i18nT('每周一 08:00'),
      duration: i18nT('72 秒'),
      impact: i18nT('授权后读取真实数据'),
      steps: [
        { label: i18nT('读取四平台指标'), detail: i18nT('Facebook、Instagram、Google Ads、YouTube'), target: 'Platform Connectors', kind: 'read' },
        { label: i18nT('统一指标口径'), detail: i18nT('归一花费、展示、点击、转化和时间粒度'), target: 'Metric Normalizer', kind: 'analysis' },
        { label: i18nT('执行确定性发现规则'), detail: i18nT('识别 CTR 领先与创意疲劳，不让模型编造结论'), target: 'Rules Engine', kind: 'analysis' },
        { label: i18nT('生成阿英双语复盘'), detail: i18nT('保留平台数据限制和 source notes'), target: 'Report Builder', kind: 'write' },
        { label: i18nT('创建优化待办'), detail: i18nT('预算调整仍需客户确认，不自动花钱'), target: 'Task Center', kind: 'guard', requiresApproval: true },
      ],
      metrics: [
        { label: i18nT('渠道'), value: '4' },
        { label: i18nT('数据源'), value: i18nT('官方账户'), tone: 'good' },
        { label: i18nT('未授权时'), value: i18nT('不造数'), tone: 'good' },
      ],
      rows: [
        { title: 'Facebook / Instagram', meta: i18nT('从 Meta Business 读取花费、触达、点击和转化'), value: i18nT('客户授权') },
        { title: 'Google Ads / YouTube', meta: i18nT('从 Google Ads 官方账户读取系列与视频广告数据'), value: i18nT('客户授权') },
        { title: i18nT('跨平台复盘'), meta: i18nT('只有取得官方指标后才生成优化结论'), value: i18nT('真实数据'), tone: 'good' },
      ],
    },
    {
      id: 'web-login',
      title: i18nT('Google Ads 托管登录'),
      subtitle: i18nT('弹出系统 Chrome 打开官方页面（Google 限制内嵌浏览器登录），由客户本人完成账号与 MFA'),
      system: 'Managed Browser Session',
      url: 'https://ads.google.com/',
      trigger: i18nT('客户请求接入 Google Ads'),
      duration: i18nT('人工登录一次'),
      impact: i18nT('密码不经过 TotalClaw'),
      steps: [
        { label: i18nT('打开官方登录入口'), detail: i18nT('在右侧内置浏览器打开 Google Ads 官方页面'), target: 'Browser Runtime', kind: 'write' },
        { label: i18nT('将登录交还客户'), detail: i18nT('密码和 MFA 只由客户本人在浏览器中输入'), target: 'Human Handback', kind: 'guard', requiresApproval: true },
        { label: i18nT('验证登录后页面'), detail: i18nT('只探测账户选择器和权限，不读取密码'), target: 'Google Ads', kind: 'read' },
        { label: i18nT('注册可用操作'), detail: i18nT('按页面能力开放读取、预览和受控写入'), target: 'RPA Registry', kind: 'analysis' },
        { label: i18nT('关闭人工接管'), detail: i18nT('会话进入 ready，后续动作全部留痕'), target: 'Browser Runtime', kind: 'write' },
      ],
      metrics: [
        { label: i18nT('会话'), value: i18nT('隔离') },
        { label: i18nT('密码存储'), value: i18nT('无'), tone: 'good' },
        { label: i18nT('状态'), value: i18nT('等待客户登录'), tone: 'warn' },
      ],
      rows: [
        { title: i18nT('Google Ads · 官方登录'), meta: i18nT('客户本人完成账号、密码与 MFA'), value: i18nT('右侧打开'), tone: 'good' },
        { title: i18nT('当前模式'), meta: i18nT('Web · 天粒度 · 无 breakdown'), value: i18nT('已说明'), tone: 'warn' },
      ],
    },
  ],
};

function localizeAgent(agent: AutomationAgent): AutomationAgent {
  return {
    ...agent,
    name: i18nT(agent.name),
    role: i18nT(agent.role),
  };
}

function localizeScenario(scenario: AutomationScenario): AutomationScenario {
  return {
    ...scenario,
    title: i18nT(scenario.title),
    subtitle: i18nT(scenario.subtitle),
    system: i18nT(scenario.system),
    trigger: i18nT(scenario.trigger),
    duration: i18nT(scenario.duration),
    impact: i18nT(scenario.impact),
    steps: scenario.steps.map((step) => ({
      ...step,
      label: i18nT(step.label),
      detail: i18nT(step.detail),
      target: i18nT(step.target),
      evidence: step.evidence ? i18nT(step.evidence) : undefined,
    })),
    metrics: scenario.metrics.map((metric) => ({
      ...metric,
      label: i18nT(metric.label),
      value: i18nT(metric.value),
    })),
    rows: scenario.rows.map((row) => ({
      ...row,
      title: i18nT(row.title),
      meta: i18nT(row.meta),
      value: i18nT(row.value),
    })),
  };
}

export const DOMAIN_AGENT_TEAMS: Record<AutomationDomain, AutomationAgent[]> =
  Object.fromEntries(
    Object.entries(RAW_DOMAIN_AGENT_TEAMS).map(([domain, agents]) => [
      domain,
      agents.map(localizeAgent),
    ]),
  ) as Record<AutomationDomain, AutomationAgent[]>;

export const AUTOMATION_SCENARIOS: Record<AutomationDomain, AutomationScenario[]> =
  Object.fromEntries(
    Object.entries(RAW_AUTOMATION_SCENARIOS).map(([domain, scenarios]) => [
      domain,
      scenarios.map(localizeScenario),
    ]),
  ) as Record<AutomationDomain, AutomationScenario[]>;
