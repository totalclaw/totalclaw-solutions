/**
 * 沙特首批三个数字员工（询价报价 / 招投标决策 / 客户问题与方案报告）共用的数据契约。
 *
 * 设计要点见 `0811/开发todo/02_页面展示形态.md`：
 *  - 所有金额/数量必须是 CalcLine，**不接受裸数字**——UI 上每个数字都要能点开公式；
 *  - 所有结论必须带 Anchor，点结论能跳回原文（PDF 页码 / Excel 单元格 / 网页快照）；
 *  - Proof Switch 靠 ChangeImpact 驱动：显式列出「重算了哪些卡、没动哪些卡」。
 */

/** 三个模块的稳定 id，与 registry.ts 的 solution id / 路由后缀对齐。 */
export type SaudiModuleId = 'rfq-quote' | 'bid-decision' | 'advisory-report';

/** 收件通道。webform 走「工单库读取」而非接消息，详见 01 号文档第 5 节。 */
/**
 * 收件通道。三个模块**各用各的**，不是四张卡到处摆（见 modules.ts 的 channels）：
 *   询价报价   邮件 + 上传件
 *   招投标     外部标讯快照 + 邮件 + 上传件（三来源去重是这个模块的第一幕）
 *   咨询报告   邮件 + 网页表单工单 + WhatsApp + 上传件（三通道主秀场）
 *
 * `websnapshot`（外部标讯快照）≠ `webform`（客户表单落业务库成工单），别混。
 */
export type IntakeChannel = 'email' | 'whatsapp' | 'webform' | 'websnapshot' | 'upload';

/** 通道连接状态四态。UI 上颜色：ready 绿 / not_configured 灰 / error 红 / degraded 黄。 */
export type ChannelState = 'ready' | 'not_configured' | 'error' | 'degraded';

export interface ChannelStatus {
  channel: IntakeChannel;
  state: ChannelState;
  /**
   * 一句话人话说明（已连接的邮箱地址 / 绑定的号 / 数据源与表名 / 失败原因）。
   * ⚠ 存的是 **i18n key，不是译文** —— 模板里 `$t(detail, detailParams)`。
   */
  detail: string;
  detailParams?: Record<string, string | number>;
  /** 上次成功收取时间，ISO8601；从未收过为空 */
  lastSyncAt?: string;
  /** 本轮新增条目数 */
  lastCount?: number;
  /** true = 模拟通道，UI 强制打紫色 Simulated chip */
  simulated?: boolean;
  /** 失败/未配置时的下一步动作（去哪配、装什么驱动）——不能只报错不给出路。同样是 i18n key */
  nextStep?: string;
  nextStepParams?: Record<string, string | number>;
  /** 后台是否在按间隔自动收（界面要说清「立即收取」只是手动补一次） */
  autoPoll?: { enabled: boolean; intervalSeconds: number };
}

/** 原文锚点——整套 UI 最关键的契约，没有它「点结论回原文」做不了。 */
export interface Anchor {
  docId: string;
  docName: string;
  type: 'pdf' | 'xlsx' | 'docx' | 'web';
  /** pdf 页码 */
  page?: number;
  /** pdf 精确框选，归一化 0-1 的 [x0,y0,x1,y1]；没有就退回关键词定位 */
  bbox?: [number, number, number, number];
  /** 没有 bbox 时用它在文本层里找行并高亮 */
  keyword?: string;
  /** xlsx 定位，如 "BOQ!C12" */
  cell?: string;
  /** web snapshot 链接与抓取时间 */
  url?: string;
  capturedAt?: string;
}

/** 抽取字段：值 + 置信度 + 锚点 + 人工编辑留痕。 */
export interface Field {
  key: string;
  label: string;
  value: string;
  unit?: string;
  confidence: number;
  anchors: Anchor[];
  editedBy?: string;
  editedAt?: string;
  originalValue?: string;
}

/** 证据：内部文件 / 产品库 / 历史 / 外部站点 / 快照。外部来源必须有 updatedAt。 */
export interface Evidence {
  id: string;
  kind: 'internal_doc' | 'product_db' | 'history' | 'external_site' | 'snapshot';
  title: string;
  excerpt: string;
  updatedAt: string;
  scope?: string;
  permission: 'public' | 'internal' | 'restricted';
  confidence: number;
  /** 冲突证据 id —— 冲突时两条并列展示，绝不静默取一条 */
  conflictsWith?: string[];
  anchor?: Anchor;
}

/**
 * 计算行 —— 所有金额/数量必须是这个形状。
 * `result` 由 `formula` + `inputs` 真算出来（见 calc.ts），不是模型给的数字。
 */
export interface CalcLine {
  key: string;
  label: string;
  /** 人类可读公式，如 "base_rate × distance_factor × volume_m3" */
  formula: string;
  inputs: Record<string, { value: number; note?: string }>;
  ruleVersion: string;
  result: number;
  currency?: 'SAR' | 'USD' | 'CNY';
  /** 取整规则说明，如 "ROUND_100" */
  rounding?: string;
  /** 小计/合计行加粗显示 */
  emphasis?: 'total' | 'floor' | 'none';
}

/** 判定五态，配色见 02 号文档第 6 节。 */
export type Verdict = 'ok' | 'partial' | 'deviate' | 'fail' | 'pending';

/** 变更影响 —— Proof Switch 的驱动数据。unaffected 必须显式列出。 */
export interface ChangeImpact {
  changeId: string;
  changedFields: { label: string; before: string; after: string }[];
  /** 要重算的卡片 id */
  affectedCards: string[];
  /** 明确列出不重算的卡片 id，界面据此保持静止 */
  unaffectedCards: string[];
  fromVersion: string;
  toVersion: string;
  computedAt: string;
  /** 数字层面的前后对照，右栏 Diff Tab 用 */
  diffLines: { label: string; before: string; after: string; changed: boolean }[];
}

/** 附件（与主进程 IntakeAttachmentDTO 对齐；relPath 用于读字节渲染原文）。 */
export interface IntakeAttachment {
  fileName: string;
  relPath: string;
  mime?: string;
  size?: number;
  sha256?: string;
  /** 'text' = 邮件/表单/聊天/网页快照等纯文本来件，右栏按文本预览 */
  kind: 'pdf' | 'xlsx' | 'docx' | 'image' | 'text' | 'other';
  pages?: number;
  sheets?: string[];
}

/** 收件条目。webform 通道额外带 ticket 块（工单身份）。 */
export interface IntakeItem {
  id: string;
  channel: IntakeChannel;
  simulated?: boolean;
  receivedAt: string;
  externalId?: string;
  from: { name: string; address: string; org?: string };
  subject: string;
  body: string;
  attachments: IntakeAttachment[];
  module: SaudiModuleId | 'unclassified';
  status: 'new' | 'merged' | 'assigned' | 'processing';
  deadline?: string;
  customer?: string;
  /** 已归入的合并组 */
  groupId?: string;
  /** 已建案则带案件 id —— 再次点击直接打开工作台而不是重复建案 */
  caseId?: string;
  /** 仅 webform：这条收件在业务库里的工单身份 */
  ticket?: {
    sourceName: string;
    table: string;
    ticketNo: string;
    pkValue: number | string;
    status: string;
    createdAt: string;
    updatedAt: string;
    fields: Record<string, string>;
    /** 取数 SQL 原样保留并在 UI 可见——客户问"数据从哪来"直接给他看 */
    query: string;
  };
  /**
   * 仅 websnapshot：外部来源出处。
   * 合规红线 —— 界面上必须显示链接 + 抓取时间 + `Snapshot` 标识，不得说成实时官方接口。
   */
  external?: {
    sourceName: string;
    sourceUrl: string;
    fetchedAt: string;
    scope?: string;
    snapshot: boolean;
  };
}

/** 多条来源被识别为同一任务后的分组。合并可撤销，来源标签永久保留。 */
export interface IntakeGroup {
  id: string;
  itemIds: string[];
  customer: string;
  subject: string;
  module: SaudiModuleId | 'unclassified';
  deadline?: string;
  /** 合并依据与得分，弹窗里逐条列出——客户问"凭什么算同一件事"时这就是答案 */
  reasons: { label: string; score: number }[];
  totalScore: number;
  merged: boolean;
}

/** 卡片形态。21 张卡收敛成 9 种渲染形态，由数据驱动，不写 21 个组件。 */
export type CardKind =
  | 'fields'      // 字段表（请求信息 / 招标信息）
  | 'gaps'        // 信息缺口 + 澄清问题
  | 'matrix'      // 判定矩阵（产品匹配 / 符合性 / 能力匹配 / 供应可得性）
  | 'bom'         // BOM 主选/备选
  | 'pricing'     // 成本与报价（每行 [ƒ]）
  | 'benchmark'   // 历史对比
  | 'kanban'      // 硬性门槛四栏看板
  | 'versionDiff' // Addendum 差异 + 受影响/未受影响模块
  | 'decision'    // Bid/No-Bid（结论块与评分块分离）
  | 'timeline'    // 多渠道合并时间线
  | 'evidenceList'// 内部检索 / 外部研究结果
  | 'report'      // 七段咨询报告 / 简短回复
  | 'outputs'     // 输出物生成
  | 'taskplan';   // 投标准备任务

export interface MatrixRow {
  requirement: string;
  requirementAnchor?: Anchor;
  proposed: string;
  specValue: string;
  verdict: Verdict;
  evidence?: string;
  alternate?: string;
  category?: string;
}

export interface BomRow {
  sku: string;
  description: string;
  qty: number;
  unit: string;
  unitCost: number;
  leadTime: string;
  stock: string;
  stockShort?: boolean;
}

export interface KanbanCard {
  title: string;
  note?: string;
  column: 'met' | 'closeable' | 'cannot' | 'review';
  /**
   * 落在「无法满足」栏但**可通过前提条件化解**（如"招标人接受以既往项目替代认定"）。
   * 需求 D2-17 第 1 条的原话是「存在无法**解决**的强制条件时不得建议参与」——
   * 可化解的算条件化前提（有条件参与），不可化解的才翻 No-Bid。
   * 人工改判进「无法满足」的一律按不可化解处理：人已经判定它不行了。
   */
  waivable?: boolean;
}

export interface ReportSection {
  id: string;
  title: string;
  body: string;
  /** 该段是否属于「监管基础事实」——Proof Switch 时必须逐字不变 */
  regulatory?: boolean;
}

/** 一张卡的完整数据。中栏按 module 的卡序渲染。 */
export interface CardData {
  id: string;
  title: string;
  kind: CardKind;
  confidence?: number;
  evidenceCount?: number;
  /** 卡头右侧的一句话摘要（如「1 项无法满足」「规则集 v1.3」） */
  badge?: string;
  badgeTone?: 'ok' | 'warn' | 'danger' | 'muted';
  fields?: Field[];
  gaps?: { label: string; note: string }[];
  questions?: string[];
  matrixColumns?: string[];
  matrixRows?: MatrixRow[];
  bomPrimary?: BomRow[];
  bomAlternate?: BomRow[];
  /** 当前选中的 BOM（受控：切换要让报价卡联动重算，所以状态放在父级） */
  bomVariant?: 'primary' | 'alternate';
  calcLines?: CalcLine[];
  priceRange?: { low: number; high: number };
  benchmark?: { name: string; scope: string; total: string; margin: string; result: string }[];
  benchmarkNote?: string;
  kanban?: KanbanCard[];
  versionDiff?: { field: string; before: string; after: string; delta: string }[];
  affectedCards?: string[];
  unaffectedCards?: string[];
  decision?: {
    recommendation: string;
    tone: 'ok' | 'warn' | 'danger';
    confidence: string;
    conditions: string[];
    hardBlock?: string;
    scores: { label: string; weight: number; score: number }[];
  };
  timeline?: { channel: IntakeChannel; at: string; summary: string; simulated?: boolean; ticketNo?: string }[];
  mergeReasons?: { label: string; score: number }[];
  evidences?: Evidence[];
  approvedSourceNote?: string;
  reportSections?: ReportSection[];
  /** 简短客户回复：按行存，每行是独立的可翻译单元（整段拼串进不了 i18n 词典） */
  replyLines?: string[];
  /**
   * 输出物行。注意 **version/draft/generated 描述的是"案件里真实那份文件"**，
   * 由 SaudiWorkbench.syncOutputsCard 按 activeCase.outputs 回填 ——
   * 卡片定义（demoData）只提供"计划要出哪几份"，不许自带完成态，
   * 否则界面会把计划显示成结果（用户实拍：卡上有 v1 草稿，输出中心却空着）。
   */
  outputs?: {
    name: string;
    kind: 'word' | 'excel' | 'pdf' | 'email';
    version: string;
    draft: boolean;
    /** 这份是否已经真的生成过（false = 还只是计划） */
    generated?: boolean;
  }[];
  taskplan?: { task: string; owner: string; due: string; dependsOn: string }[];
}

/** 六步闭环。每步独立状态，失败要落在具体那一步（UX 硬规则一）。 */
export interface WorkflowStep {
  id: string;
  label: string;
  status: 'done' | 'active' | 'todo' | 'failed';
  elapsed?: string;
  /** 失败时的真实原因，直接写进步骤标签，不许糊成"处理失败" */
  failReason?: string;
}

/** 模块定义：三个模块的差异全部收敛在这里。 */
export interface SaudiModuleDef {
  id: SaudiModuleId;
  /** 与 registry.ts 的 solution id 对齐 */
  solutionId: string;
  title: string;
  subtitle: string;
  /** 首页五步引导的步骤名 */
  guideSteps: string[];
  /**
   * 本模块第 1 步「接通道」要点亮哪几条通道 —— 按各自 Demo 的实际来源给，别全摆出来。
   * 依据：开发todo/03（模块一=邮件+附件）、04 的 M2-A1/M2-C1（模块二=网站快照+邮件+上传件）、
   * 05 的 B 节（模块三=邮件+表单工单+WhatsApp 三条同时点亮）。
   */
  channels: IntakeChannel[];
  /** 通道条下面那句解释，各模块口径不同（工单库那套只对咨询模块成立） */
  channelHint: string;
  /** 工作台左栏六步闭环 */
  workflowSteps: WorkflowStep[];
  /** 中栏卡片序列 */
  cardSequence: string[];
  /** Proof Switch 表单定义 */
  proofSwitch: {
    title: string;
    hint: string;
    controls: {
      key: string;
      label: string;
      kind: 'select' | 'upload';
      options?: { value: string; label: string }[];
      defaultValue?: string;
      changedValue?: string;
    }[];
  };
  /** 演示时长与脚本步骤数，写进页面帮助客户对齐节奏 */
  demoMinutes: number;
}

/** demo 的 mock/workbenches2-saudi.ts 从 types 取 ModuleState；真实定义在 demoData.ts，这里只做类型再导出 */
export type { ModuleState } from './demoData';
