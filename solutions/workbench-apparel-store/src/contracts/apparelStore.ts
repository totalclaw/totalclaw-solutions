/**
 * 解决方案 · 服装实体店智能体 —— 契约类型（docs/apparel-store-workbench.md）。
 *
 * 主线是「AI 一键换装」固定工作流：选衣服 → 顾客照片（电脑上传或手机扫码上传，须勾选授权）
 * → AI 形象分析（可选）→ 选背景 / 姿势 / 发型 → AI 合成 → 手机、电脑同时查看，生成试穿码
 * → 到店凭码试实物（店员提前备码）→ 试穿数据看板。
 *
 * 手机端是店里电脑起的局域网网页（和 AI 学习中心学生端同一套底座），顾客连店内 Wi-Fi 扫门店码即可用，
 * 照片与试穿图都只存在店里这台电脑上；合成时照片会发给云端图像模型，授权页写明。
 *
 * 商品库（ApGarment）由服装实体店智能体与经营自动化智能体共用。
 */

export type ApStyleKind = 'background' | 'pose' | 'hair';
/** 适用人群：女装 / 男装 / 童装 */
export type ApAudience = 'women' | 'men' | 'kids';

/** 选项下的细分场景（「咖啡馆」下的「窗边暖光座位」「吧台手冲区」…） */
export interface ApStyleVariant {
  id: string;
  label: string;
}

export interface ApStyleOption {
  id: string;
  kind: ApStyleKind;
  /** 分组（都市休闲 / 自然户外 / 站姿 / 长发 …） */
  group: string;
  label: string;
  /** 一句话说明（方案原文括号里的内容） */
  detail: string;
  variants: ApStyleVariant[];
  audience: ApAudience[];
  /** 自定义背景：要上传一张背景照片 */
  needsUpload?: boolean;
}

export interface ApStyleChoice {
  backgroundId: string;
  backgroundVariant?: string;
  poseId: string;
  poseVariant?: string;
  hairId: string;
  hairVariant?: string;
  /** 自定义背景照片（本机路径） */
  customBackground?: string;
}

export interface ApGarment {
  id: string;
  name: string;
  sku: string;
  price: number;
  /** 品类：连衣裙 / 衬衫 / 外套 … */
  category: string;
  color: string;
  style: string;
  fabric: string;
  /** 季节：春 / 夏 / 秋 / 冬 / 四季 */
  season: string;
  audience: ApAudience;
  /** 在售尺码 → 库存件数 */
  stock: Record<string, number>;
  /** 白底 / 平铺商品图（本机路径） */
  image: string;
  tags: string[];
  /** 卖点（上架文案、视频脚本用） */
  sellingPoints: string;
  /** 这件衣服的推荐造型（商家后台「模板推荐」） */
  recommended?: ApStyleChoice;
  /** 门店试穿手机端是否上架 */
  onShelf: boolean;
  /** AI 打标签用的模型；手工录入为空 */
  taggedBy?: string;
  createdAt: string;
  updatedAt?: string;
}

export type ApGarmentInput = Partial<Omit<ApGarment, 'id' | 'createdAt'>> & { id?: string };

export type ApBodyShape = 'pear' | 'apple' | 'hourglass' | 'rectangle' | 'inverted_triangle' | 'unknown';

export interface ApSuggestion extends ApStyleChoice {
  reason: string;
}

export interface ApPhotoCheck {
  ok: boolean;
  /** 不合格原因（多人 / 半身 / 过暗 …） */
  issues: string[];
}

export interface ApCustomerProfile {
  bodyShape: ApBodyShape;
  skinTone: string;
  faceShape: string;
  notes: string;
  suggestions: ApSuggestion[];
  model: string;
  at: string;
}

export interface ApCustomer {
  id: string;
  nickname: string;
  /** 身高 / 体重：尺码助手用，顾客自愿填 */
  heightCm?: number;
  weightKg?: number;
  source: 'desk' | 'mobile';
  /** 顾客照片（本机路径）；清除后为空 */
  photo: string;
  photoCheck?: ApPhotoCheck;
  /** 授权时间：没有授权不许上传照片 */
  consentAt: string;
  profile?: ApCustomerProfile;
  createdAt: string;
  lastSeenAt?: string;
  /** 照片与试穿图已按保留期或顾客要求清除 */
  purgedAt?: string;
}

export type ApTryonStatus = 'queued' | 'running' | 'done' | 'failed';
export type ApVisitStatus = 'prepared' | 'tried' | 'purchased' | 'left';

export interface ApVisit {
  status: ApVisitStatus;
  size?: string;
  note?: string;
  at: string;
}

export interface ApTryon {
  id: string;
  customerId: string;
  garmentId: string;
  choice: ApStyleChoice;
  status: ApTryonStatus;
  /** 合成结果（本机路径） */
  image?: string;
  error?: string;
  model?: string;
  source: 'desk' | 'mobile';
  /** 试穿码：到店凭码试实物 */
  code: string;
  /** 尺码助手推荐的尺码 */
  size?: string;
  /** 顾客点了「想试实物」 */
  wantVisit?: boolean;
  wantAt?: string;
  visit?: ApVisit;
  createdAt: string;
  startedAt?: string;
  finishedAt?: string;
}

export interface ApSettings {
  storeName: string;
  /** 换装用的 fal 改图模型 */
  editModel: string;
  /** 顾客照片与试穿图保留天数，到期自动清除 */
  retentionDays: number;
  /** 手机端每位顾客每天最多生成几张 */
  mobileDailyLimit: number;
  /** 试穿图右下角叠加门店名与试穿码 */
  watermark: boolean;
  /** 手机端不显示的造型选项 */
  disabledOptions: string[];
  outputDir: string;
}

export interface ApMobileStatus {
  running: boolean;
  /** 顾客扫的门店码地址（带门店口令） */
  joinUrl: string | null;
  port: number | null;
  /** 连不上时可换的本机地址 */
  candidates: string[];
  /** 最近 10 分钟有请求的手机数 */
  activeSessions: number;
}

export interface ApState {
  settings: ApSettings;
  garments: ApGarment[];
  customers: ApCustomer[];
  tryons: ApTryon[];
  mobile: ApMobileStatus;
  /** 有没有可用的图像服务密钥（不发请求） */
  imageReady: boolean;
  /** 造型示意图：选项 id → 本机路径 */
  thumbs: Record<string, string>;
  outputDir: string;
}

export interface ApCountStat { id: string; count: number }

export interface ApGarmentStat {
  garmentId: string;
  name: string;
  tryons: number;
  done: number;
  wantVisit: number;
  tried: number;
  purchased: number;
}

export interface ApStats {
  tryons: number;
  done: number;
  failed: number;
  customers: number;
  /** 手机发起 / 全部 */
  mobileShare: number;
  wantVisit: number;
  tried: number;
  purchased: number;
  /** 想试实物 / 生成成功 */
  wantRate: number;
  /** 已试穿 / 想试实物 */
  visitRate: number;
  /** 成交 / 已试穿 */
  closeRate: number;
  garments: ApGarmentStat[];
  /** 高试穿低成交款（试穿量前 30% 且成交率后 30%） */
  lagging: string[];
  combos: Array<{ backgroundId: string; poseId: string; hairId: string; count: number }>;
  backgrounds: ApCountStat[];
  poses: ApCountStat[];
  hairs: ApCountStat[];
  byDay: Array<{ day: string; tryons: number; purchased: number }>;
}

/** 换装可选的改图模型（fal edit 能力下的多图参考模型） */
export const AP_EDIT_MODELS = ['fal-ai/nano-banana/edit', 'fal-ai/bytedance/seedream/v4/edit'] as const;
