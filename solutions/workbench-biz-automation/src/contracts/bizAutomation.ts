/**
 * 解决方案 · 经营自动化智能体 —— 契约类型（docs/biz-automation-workbench.md）。
 *
 * 四个模块，商品库与服装实体店智能体共用（ApGarment）：
 *   A 短视频生成并发布自媒体：商品图 / 试穿图 → 脚本 → 配音字幕成片 → 审核 → 抖音 / 快手 / 小红书 / 视频号；
 *   B 数字人出镜介绍企业：知识库事实 → 讲稿（缺的写【待补充】）→ 数字人口播成片（带 AI 生成标识）→ 进入 A 的发布；
 *   C 商品图文自动上下架：按渠道生成标题卖点详情 → 人确认 → 数字员工在网店后台上架；售罄 / 断码 / 过季 / 试穿多成交少按规则下架或提醒；
 *   D 经营数据调取与统计：导入收银 / 费用数据 → 固定口径算指标 → 模型只写解读（数字回原数据核对）→ 日报定时推送。
 *
 * 三条红线：钱和数字不交给模型算；发布、上架、改价默认停在提交前由人确认；财务数据只读。
 */

export type BaModuleKey = 'video' | 'avatar' | 'listing' | 'finance';
export const BA_MODULE_KEYS: BaModuleKey[] = ['video', 'avatar', 'listing', 'finance'];

// ── A 短视频 ─────────────────────────────────────

export type BaVideoType = 'new_arrival' | 'multi_look' | 'store_tour' | 'promotion' | 'styling_tips';
export type BaPublishPlatform = 'douyin' | 'kuaishou' | 'xiaohongshu' | 'wxchannels';
export const BA_PUBLISH_PLATFORMS: BaPublishPlatform[] = ['douyin', 'kuaishou', 'xiaohongshu', 'wxchannels'];

export interface BaScene {
  /** 这一镜用的图（本机路径） */
  image: string;
  /** 口播 / 字幕 */
  line: string;
}

export interface BaPlatformCopy {
  title: string;
  caption: string;
  topics: string[];
}

/** ⑦ 复盘：某个平台上这条视频的数据（人工填，或数字员工从创作者后台读回来） */
export interface BaVideoStats {
  plays: number;
  likes: number;
  comments: number;
  shares: number;
  /** 从哪来：manual 手填 / employee 数字员工回读 */
  source: 'manual' | 'employee';
  at: string;
}

export interface BaVideoProject {
  id: string;
  type: BaVideoType;
  name: string;
  garmentIds: string[];
  /** 活动信息 / 主题（促销价、活动时间、场合等，由人填，脚本只许引用这里的数字） */
  brief: string;
  materials: string[];
  scenes: BaScene[];
  copies: Partial<Record<BaPublishPlatform, BaPlatformCopy>>;
  platforms: BaPublishPlatform[];
  narration: boolean;
  voiceGender: 'female' | 'male';
  /** 成片（本机路径） */
  video?: string;
  durationSec?: number;
  voiceQuality?: 'hd' | 'standard';
  status: 'draft' | 'scripted' | 'rendering' | 'rendered' | 'approved' | 'publishing' | 'published' | 'failed';
  error?: string;
  /** 禁用词 / 数字核对提示 */
  warnings: string[];
  model?: string;
  approvedAt?: string;
  /** 定时发布时间（ISO）；到点后提醒并在工作台打开时自动发起发布 */
  publishAt?: string;
  /** 已到定时发布时间、还没发起 */
  publishDue?: boolean;
  publishedAt?: string;
  publishRunNote?: string;
  stats?: Partial<Record<BaPublishPlatform, BaVideoStats>>;
  /** 节点留痕：每个节点完成 / 失败各记一条（按时间先后，最多留 120 条），历史记录页逐条展示 */
  history?: BaVideoEvent[];
  /** 每次发布工作流的结果（含各平台回执），新的在后 */
  publishRuns?: BaPublishRun[];
  createdAt: string;
  updatedAt?: string;
}

export type BaVideoStep = 'create' | 'material' | 'script' | 'edit' | 'render' | 'approve' | 'schedule' | 'publish' | 'stats';

export interface BaVideoEvent { at: string; step: BaVideoStep; text: string; ok: boolean }

export interface BaPublishReceipt {
  /** 平台 id（douyin / kuaishou / xiaohongshu / wxchannels） */
  platform: string;
  /** published = 平台确认已发布；unconfirmed = 提交了但没读到成功特征，要人工核对；failed = 失败 */
  status: string;
  url?: string;
  error?: string;
}

export interface BaPublishRun {
  at: string;
  /** 工作流运行 id；同一 runId 只记一次 */
  runId?: string;
  outcome: 'completed' | 'failed' | 'cancelled';
  published: string[];
  unconfirmed: string[];
  failed: string[];
  receipts: BaPublishReceipt[];
  /** 本次发出去的成片（之后重新成片也能看到当时发的是哪一版） */
  videoFile?: string;
  note?: string;
}

// ── B 数字人 ─────────────────────────────────────

export type BaAvatarTopic = 'company_intro' | 'brand_story' | 'store_opening' | 'service_intro' | 'recruiting' | 'holiday';

export interface BaFactUsed { label: string; value: string }

export interface BaAvatarProject {
  id: string;
  topic: BaAvatarTopic;
  name: string;
  /** 讲稿；【待补充】占位要人补上才能成片 */
  script: string;
  facts: BaFactUsed[];
  durationHint: number;
  avatarId: string;
  voiceId: string;
  aspectRatio: '9:16' | '16:9';
  /** 真人形象定制分身时的授权说明（可空 = 用内置形象） */
  likenessConsent: string;
  taskId?: string;
  video?: string;
  status: 'draft' | 'scripted' | 'rendering' | 'rendered' | 'failed';
  error?: string;
  warnings: string[];
  model?: string;
  createdAt: string;
  updatedAt?: string;
}

// ── C 上下架 ─────────────────────────────────────

export interface BaChannel {
  id: string;
  name: string;
  /** 商家后台地址（数字员工在内置浏览器里打开） */
  url: string;
  /** 主图比例 */
  aspect: '1:1' | '3:4';
  titleMax: number;
  enabled: boolean;
  /** 允许数字员工直接点提交（全自动）；默认关，打开要确认，每次执行记为「自动执行」 */
  autoSubmit?: boolean;
}

export type BaListingStatus = 'draft' | 'confirmed' | 'handed' | 'listed' | 'delisted';

export interface BaListing {
  id: string;
  garmentId: string;
  channelId: string;
  title: string;
  sellingPoints: string[];
  detail: string;
  keywords: string[];
  /** 主图等（本机路径） */
  images: string[];
  price: number;
  status: BaListingStatus;
  warnings: string[];
  conversationId?: string;
  productUrl?: string;
  model?: string;
  createdAt: string;
  updatedAt?: string;
}

export type BaRuleKind = 'soldout' | 'broken_size' | 'off_season' | 'lagging';

/** 规则命中后的处理方式（默认动作之外的可选动作） */
export type BaRuleAction = 'delist' | 'presale' | 'delist_color' | 'badge_sale' | 'clearance' | 'swap_image' | 'remind';

export interface BaRuleHit {
  garmentId: string;
  rule: BaRuleKind;
  detail: string;
  /** 默认动作 */
  action: 'delist' | 'remind' | 'swap_image';
  /** 可选动作 */
  options: BaRuleAction[];
}

// ── D 经营数据 ─────────────────────────────────────

export interface BaSaleRow {
  date: string;
  orderNo: string;
  sku: string;
  name: string;
  category: string;
  qty: number;
  amount: number;
  cost: number | null;
  channel: string;
}

export interface BaExpenseRow {
  date: string;
  item: string;
  amount: number;
}

export interface BaImport {
  id: string;
  kind: 'sales' | 'expense' | 'inventory';
  /** manual 手动导入 / folder 共享文件夹自动取数 */
  source?: 'manual' | 'folder';
  file: string;
  rows: number;
  skipped: number;
  /** 识别到的列：角色 → 原表头 */
  mapping: Record<string, string>;
  from: string;
  to: string;
  importedAt: string;
}

export interface BaMetricRow { key: string; label: string; value: number; share?: number }

export interface BaMetrics {
  from: string;
  to: string;
  revenue: number;
  refunds: number;
  netRevenue: number;
  /** 有成本的销售额对应的成本；缺成本时毛利按有成本的部分算 */
  cost: number;
  costCoverage: number;
  grossProfit: number;
  grossMargin: number;
  orders: number;
  units: number;
  avgOrderValue: number;
  unitsPerOrder: number;
  expenses: number;
  netProfit: number;
  expenseRate: number;
  byChannel: BaMetricRow[];
  byCategory: BaMetricRow[];
  topItems: BaMetricRow[];
  /** 商品库里有库存的款：售罄率 = 销量 /（销量 + 当前库存） */
  sellThrough: BaMetricRow[];
  /** 与上一个同长度区间对比 */
  prev?: { revenue: number; grossProfit: number; orders: number; avgOrderValue: number };
  /** 库存周转天数 = 库存成本 ÷ 日均销售成本（库存成本按商品库当前库存 × 该款平均单件成本估算）；算不出为 null */
  inventoryValue: number | null;
  turnoverDays: number | null;
  /** 款式排行：销量、销售额、毛利、售罄率 */
  items: Array<{ key: string; label: string; qty: number; amount: number; grossProfit: number | null; sellThrough: number | null }>;
  /** 每日趋势 */
  daily: Array<{ day: string; netRevenue: number; orders: number }>;
  /** 滞销：有库存、本期没卖或只卖了 1 件的款 */
  slowMovers: Array<{ key: string; label: string; stock: number; qty: number }>;
  /** 最后一条销售数据的日期（判断数据有没有更新） */
  lastDataDay: string;
}

export interface BaReport {
  id: string;
  kind: 'daily' | 'weekly' | 'monthly' | 'custom';
  metrics: BaMetrics;
  commentary: string;
  /** 解读里出现、但在指标里找不到的数字 */
  unverified: string[];
  model?: string;
  pushed?: Array<{ channel: string; ok: boolean; error?: string }>;
  exportPath?: string;
  pdfPath?: string;
  /** 数据没有覆盖到报表期末（取数没更新）：写明，不拿旧数据冒充 */
  staleNote?: string;
  createdAt: string;
}

export interface BaQa { q: string; a: string; model?: string; at: string }

// ── 设置与状态 ─────────────────────────────────────

/** 节日 / 纪念日：提前几天生成数字人讲稿草稿 */
export interface BaCalendarDay { date: string; name: string; topic: 'holiday' | 'store_opening' }

export interface BaSchedule {
  dailyReport: { enabled: boolean; time: string; push: boolean };
  inventoryPatrol: { enabled: boolean; time: string };
  weeklyVideo: { enabled: boolean; weekday: number; time: string };
  monthlyReport: { enabled: boolean; day: number; time: string; push: boolean };
  /** 新品入库联动：新入库的款自动生成上架草稿 + 新品上新视频脚本（都等人审核） */
  newArrival: { enabled: boolean };
  /** 按日历生成数字人节日 / 周年讲稿草稿 */
  calendar: { enabled: boolean; leadDays: number; days: BaCalendarDay[] };
  /** 共享文件夹取数（在日报之前执行） */
  folderImport: { enabled: boolean; time: string };
}

export interface BaDataFolders { sales: string; expense: string; inventory: string }

export interface BaSettings {
  brandName: string;
  /** 共享文件夹取数：收银 / 费用 / 库存导出文件放进来，定时取最新一份 */
  dataFolders: BaDataFolders;
  /** 数字人片尾：门店地址、营业时间 */
  storeAddress: string;
  openingHours: string;
  moduleModels: Partial<Record<BaModuleKey, string>>;
  channels: BaChannel[];
  /** 过季判定：季节 → 在售月份 */
  seasonMonths: Record<string, number[]>;
  /** 断码判定的主力尺码 */
  coreSizes: string[];
  /** 售罄时自动把门店试穿手机端下架（只动本机，不动网店） */
  autoDelistLocal: boolean;
  schedule: BaSchedule;
  outputDir: string;
}

export interface BaLogEntry { at: string; module: BaModuleKey | 'schedule'; text: string; ok: boolean }

export interface BaState {
  settings: BaSettings;
  videos: BaVideoProject[];
  avatars: BaAvatarProject[];
  listings: BaListing[];
  ruleHits: BaRuleHit[];
  imports: BaImport[];
  salesRows: number;
  expenseRows: number;
  reports: BaReport[];
  qa: BaQa[];
  log: BaLogEntry[];
  /** 能力就绪情况（不发请求） */
  ready: { ffmpeg: boolean; image: boolean; digitalHuman: boolean; knowledge: boolean; push: boolean };
  outputDir: string;
}

export interface BaModelOption { value: string; label: string; provider: string; group?: string }
