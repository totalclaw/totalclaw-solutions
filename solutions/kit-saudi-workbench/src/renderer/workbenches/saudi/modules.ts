/**
 * 三个模块的定义：差异全部收敛在这一份表里。
 * 页面外壳（SaudiWorkbench.vue）读这里决定标题、五步引导、六步闭环、卡片序列与 Proof Switch 表单。
 */
import type { SaudiModuleDef, SaudiModuleId } from './types';
import { t as i18nT } from '../../i18n';

const COMMON_WORKFLOW = [
  { id: 'receive', label: i18nT('接收'), status: 'done' as const, elapsed: '2s' },
  { id: 'understand', label: i18nT('理解'), status: 'done' as const, elapsed: '12s' },
  { id: 'retrieve', label: i18nT('检索'), status: 'done' as const, elapsed: '9s' },
  { id: 'recommend', label: i18nT('建议'), status: 'active' as const },
  { id: 'approve', label: i18nT('审批'), status: 'todo' as const },
  { id: 'deliver', label: i18nT('交付'), status: 'todo' as const },
];

export const SAUDI_MODULES: Record<SaudiModuleId, SaudiModuleDef> = {
  'rfq-quote': {
    id: 'rfq-quote',
    solutionId: 'workbench-rfq-quote',
    title: i18nT('AI 询价与报价数字员工'),
    subtitle: i18nT('从询价收件、产品匹配、供应与外协，到可见公式的报价与审批文件，全程留痕。'),
    guideSteps: [i18nT('接通道'), i18nT('收件'), i18nT('解析确认'), i18nT('匹配与报价'), i18nT('审批交付')],
    // Demo 1 的案例就是「客户发一封带技术要求 PDF + 数量表 Excel 的询价邮件」，
    // 没有 WhatsApp、没有工单库（开发todo/03 A 节）。
    channels: ['email', 'upload'],
    channelHint: i18nT('询价通常是一封带附件的邮件：正文给需求，PDF 给技术要求，Excel 给数量表。三件会自动归到同一个任务，抽取出的字段都能点回原文位置。'),
    workflowSteps: COMMON_WORKFLOW.map((s) => ({ ...s })),
    cardSequence: ['request', 'gap', 'match', 'bom', 'supply', 'pricing', 'benchmark', 'output'],
    proofSwitch: {
      title: i18nT('模拟变更 · 交付条件调整'),
      hint: i18nT('现场改交付地点与保修年限，只重算受影响的成本项；产品技术匹配结果不重做。'),
      controls: [
        {
          key: 'location',
          label: i18nT('交付地点'),
          kind: 'select',
          options: [
            { value: 'jeddah', label: i18nT('吉达 Jeddah') },
            { value: 'tabuk', label: i18nT('塔布克 Tabuk') },
          ],
          defaultValue: 'jeddah',
          changedValue: 'tabuk',
        },
        {
          key: 'warranty',
          label: i18nT('保修年限'),
          kind: 'select',
          options: [
            { value: '2', label: i18nT('2 年') },
            { value: '3', label: i18nT('3 年') },
          ],
          defaultValue: '2',
          changedValue: '3',
        },
      ],
    },
    demoMinutes: 7,
  },

  'bid-decision': {
    id: 'bid-decision',
    solutionId: 'workbench-bid-decision',
    title: i18nT('AI 招投标决策数字员工'),
    subtitle: i18nT('多来源标书去重、Addendum 差异、硬性门槛与能力匹配，输出可拍板的 Bid/No-Bid 建议。'),
    guideSteps: [i18nT('接通道'), i18nT('发现与去重'), i18nT('解析与门槛'), i18nT('方案与价格'), i18nT('决策与交付')],
    // M2-A1 / M2-C1：招标公告来自**网站快照**、RFP 来自邮件、BOQ/Addendum 是上传件，
    // 三种来源要被认成同一个项目 —— 这是本模块的第一幕，所以三条都得点亮。
    channels: ['websnapshot', 'email', 'upload'],
    channelHint: i18nT('同一个项目会从三个地方来：公告在招标网站上（我们抓快照，界面永远显示链接与抓取时间）、RFP 走邮件、BOQ 与 Addendum 靠上传。系统把它们认成同一项目并给出合并依据，合并要人点头，来源标签永久保留。'),
    workflowSteps: COMMON_WORKFLOW.map((s) => ({ ...s })),
    cardSequence: [
      'tender', 'version', 'gate', 'capability', 'compliance',
      'bom', 'subcontract', 'pricing', 'benchmark', 'decision', 'taskplan',
      // 输出物：需求 2.5 的「必须输出」要落成文件才算交付完（原来这条链走到 Bid/No-Bid 就断了）
      'output',
    ],
    proofSwitch: {
      title: i18nT('模拟变更 · 上传 Addendum 01'),
      hint: i18nT('数量 120→150 台、交付 120→90 天、截止延后 5 天；硬性门槛与符合性矩阵不受影响。'),
      controls: [
        {
          key: 'addendum',
          label: i18nT('Addendum 文件'),
          kind: 'upload',
          defaultValue: i18nT('未上传'),
          changedValue: 'Addendum_01.pdf',
        },
      ],
    },
    demoMinutes: 9,
  },

  'advisory-report': {
    id: 'advisory-report',
    solutionId: 'workbench-advisory-report',
    title: i18nT('AI 客户问题与方案报告数字员工'),
    subtitle: i18nT('邮件、网页表单工单与 WhatsApp 三渠道统一收件，检索获准来源后产出简短回复与七段咨询报告。'),
    guideSteps: [i18nT('接通道'), i18nT('三渠道收件与合并'), i18nT('问题理解与缺口'), i18nT('检索与研究'), i18nT('双输出与人审')],
    // 三通道收件的主秀场（开发todo/05 B 节）：只有这个模块要把邮件 / 表单工单 / WhatsApp
    // 三条同时点亮，再当场合并成一个任务。
    channels: ['email', 'webform', 'whatsapp', 'upload'],
    channelHint: i18nT('同一个客户可能同时发邮件、填网页表单、又用 WhatsApp 追问。网页表单不是"等一条消息"：它落进业务库成为工单，系统按游标增量查询并可按工单号回查完整记录。三条消息会被识别为同一任务并给出合并依据。'),
    workflowSteps: COMMON_WORKFLOW.map((s) => ({ ...s })),
    // 末尾的 output：需求 3.3 第 7 步「形成双输出」要真的落成文件
    cardSequence: ['request', 'merge', 'gap', 'internal', 'external', 'reply', 'report', 'output'],
    proofSwitch: {
      title: i18nT('模拟变更 · 目标客户切换'),
      hint: i18nT('家庭消费者 → 办公室与商业客户：商业段落全变，监管基础事实逐字不变。'),
      controls: [
        {
          key: 'segment',
          label: i18nT('目标客户'),
          kind: 'select',
          options: [
            { value: 'household', label: i18nT('家庭消费者') },
            { value: 'commercial', label: i18nT('办公室与商业客户') },
          ],
          defaultValue: 'household',
          changedValue: 'commercial',
        },
      ],
    },
    demoMinutes: 7,
  },
};

export function moduleById(id: SaudiModuleId): SaudiModuleDef {
  return SAUDI_MODULES[id];
}

/** 卡片 id → 中文标题（卡头显示，也用于 Proof Switch 影响面 chip）。 */
export const CARD_TITLES: Record<string, string> = {
  request: i18nT('请求信息卡'),
  gap: i18nT('信息缺口与澄清问题'),
  match: i18nT('产品匹配与技术偏离'),
  bom: i18nT('BOM 主选 / 备选'),
  supply: i18nT('供应可得性与外协'),
  pricing: i18nT('成本与报价'),
  benchmark: i18nT('历史对比'),
  output: i18nT('输出物'),
  tender: i18nT('招标信息卡'),
  version: i18nT('Addendum 差异'),
  gate: i18nT('硬性门槛'),
  capability: i18nT('能力匹配'),
  compliance: i18nT('技术 / 商务符合性矩阵'),
  subcontract: i18nT('外协计划'),
  decision: i18nT('Bid / No-Bid 建议'),
  taskplan: i18nT('投标准备任务'),
  merge: i18nT('多渠道合并'),
  internal: i18nT('内部检索结果'),
  external: i18nT('外部研究结果'),
  reply: i18nT('简短客户回复'),
  report: i18nT('七段咨询报告'),
};
