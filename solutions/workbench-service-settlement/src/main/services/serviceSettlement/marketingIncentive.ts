/**
 * 模块四 · 服务营销激励结案（纯计算）。
 *
 * 需求 11 步里可确定性计算的部分都在这里：
 *   2  辅材实际达成 / 达成率（服务商 & 区域经理；订单行有经理列时**按行归属**，经理为空回落服务商→经理映射）
 *   3  按【服务营销激励计算规则】算服务商辅材激励初始金额（边际阶梯 + 电动止回阀门槛 + 呆滞配件返利）
 *   5  延保达成率（区域经理 & 服务商；订单取自 CSS 系统导出，任务取外部表）
 *   6  延保达成率判定 → 区域经理辅材激励打折
 *   7  区域经理最终激励（基础激励 + 提成（预发按基础比例 / 准确按边际阶梯）× 绩效系数）
 *   8  服务商最终延保激励 + 负责人激励（按档位拆服务商比例 / 负责人比例）
 *   9  负责人信息校验（身份证 / 银行卡 / 手机号）
 *   10 个税申报表（劳务报酬预扣预缴口径，可套用户模板列）
 * 通知、收集、报告生成等带 IO 的在 ipc / store 里。
 *
 * 规则模型 v2（2026-09-03，按客户 2026 Q2 真实结案表对账后重做）：
 *   旧模型只会「达成率区间 × 整体比例」，客户政策是**目标倍数上的边际阶梯**（A×3% + (B−A)×4% + …），
 *   还有区域经理基础激励（每项 1000 封顶）、绩效系数、电动止回阀门槛、按服务年限的呆滞配件返利、
 *   延保按档位拆服务商/负责人比例。全部做成可编辑字段，旧 JSON 经 sanitizeMarketingRules 自动升级。
 */
import { detectColumn, toNumber, type SheetTable } from './excel';
import DK from './dataKeywords.json';
import type { MappedTable } from './reviewIncentive';
import { t as i18nT } from '@totalclaw/i18n';

// ── 规则 ──────────────────────────────────────────────────────────────────────

/** v1 阶梯（达成率区间 × 整体比例）。只为旧规则 JSON / 旧调用兼容保留，新代码用 IncentiveTier。 */
export interface RateTier {
  /** 达成率下限（含），小数 */
  minRate: number;
  /** 激励比例（占实际金额） */
  ratio: number;
  /** 固定金额（basis = fixed 时用） */
  fixed?: number;
}

export interface DiscountTier {
  /** 延保达成率低于这个值（不含）时打折 */
  belowRate: number;
  /** 折扣系数 0.8 = 八折 */
  discount: number;
}

export type TierBasis = 'whole' | 'marginal' | 'fixed';

/**
 * 通用激励档位。达成率 = 实际 A ÷ 目标 B。
 *  - whole    ：达成率落在 [fromRate, toRate) → 激励 = A × ratio × factor（区域经理 80%~100%：3%×A×0.8）
 *  - marginal ：目标倍数区间内的**增量** × ratio 累加（服务商：A×3% + (B−A)×4% + …；
 *               区域经理 ≥120%：3%×1.2B + (A−1.2B)×3.5%）
 *  - fixed    ：达成率落在区间 → 固定金额 fixed
 * 命中 whole / fixed 档时以它为准，不再累加 marginal 档 —— 两者叠加会把同一笔销售算两遍。
 */
export interface IncentiveTier {
  fromRate: number;
  /** 上限（不含）；null = 无上限 */
  toRate: number | null;
  ratio: number;
  /** 比例外乘的系数（默认 1），用来保留「3% × 0.8」这种写法方便对照原文 */
  factor?: number;
  basis: TierBasis;
  fixed?: number;
}

/** 服务商延保档位：按达成率下限命中，激励拆成服务商比例 + 负责人比例 */
export interface WarrantyTier {
  minRate: number;
  providerRatio: number;
  leaderRatio: number;
}

/** 呆滞配件返利：按服务年限下限命中 */
export interface RebateTier {
  minYears: number;
  ratio: number;
}

export interface ManagerBaseRule {
  /** 每项（辅材 / 延保）基础激励上限；0 = 不设基础激励 */
  perItemMax: number;
  /** 完成率 ≥ 此值才有基础激励；完成率 <100% 时 = perItemMax × 完成率 */
  minRate: number;
  /** 每人每季度上限；0 = 不封顶 */
  quarterMax: number;
  /** 基础激励是否也乘绩效系数 / 打折系数（客户实测：只乘提成，基础不乘） */
  applyCoefficient: boolean;
  applyDiscount: boolean;
}

export interface QualifierRule {
  enabled: boolean;
  /** 订单表「产品」列命中这个正则的行计入门槛实际（例：电动止回阀） */
  productPattern: string;
  label: string;
}

/**
 * 服务年限截止日：
 *  - quarterEnd     季度末（Q2 → 06-30）
 *  - quarterStart   季度开始前一日（Q2 → 03-31）
 *  - lastMonthStart 季度开始前一个月的 1 日（Q2 → 03-01）—— 客户「截止26年3月服务年限」列的真实公式是
 *                   `DATEDIF(引入日期, DATE(2026,3,1), "Y")`，按 03-31 算会把 3 月 2 日～31 日引入的服务商多算
 *                   一年（2026 Q2 对账实测 14 家年限差 1，跨 10 / 20 年档时返利比例就错了）
 */
export type RebateYearsAsOf = 'quarterStart' | 'quarterEnd' | 'lastMonthStart';

export interface RebateRule {
  enabled: boolean;
  tiers: RebateTier[];
  yearsAsOf: RebateYearsAsOf;
}

export interface MarketingRules {
  /** 规则来源说明（PDF 文件名 / 手工 / 预设），仅展示 */
  source?: string;
  version: 2;
  // ── 服务商辅材（提货激励）
  auxTiers: IncentiveTier[];
  /** 达成率低于此值无激励（默认 100%） */
  auxMinRate: number;
  /** 没有任务的服务商视同达成（客户表「未制定任务」也按基础比例给） */
  auxMissingTaskAsMet: boolean;
  qualifier: QualifierRule;
  rebate: RebateRule;
  // ── 区域经理
  managerTiers: IncentiveTier[];
  managerMinRate: number;
  managerBase: ManagerBaseRule;
  /** 预发提成按此基础比例（政策：季度按 3% 实发，其余年度多退少补）；0 = 预发即准确 */
  managerAdvanceRatio: number;
  /** 区域经理打折阶梯（按 belowRate 升序；命中最小的那档；只作用于辅材提成） */
  managerDiscountTiers: DiscountTier[];
  /** 绩效等级 → 系数 */
  performanceCoefficients: Record<string, number>;
  // ── 服务商延保
  warrantyMode: 'ratio' | 'perOrder';
  warrantyTiers: WarrantyTier[];
  warrantyPerOrder: number;
  /** 旧口径负责人激励 = 基数 × 比例（perOrder 模式或档位没写负责人比例时用） */
  leaderShareRatio: number;
  leaderShareBase: 'warranty' | 'aux' | 'both';
  /** 呆滞配件退回期限（天），到期前 returnRemindBeforeDays 天二次提醒 */
  returnDueDays: number;
  returnRemindBeforeDays: number;
  /** 延保达成率不足时是否同样打折服务商延保激励（需求只要求区域经理，默认否） */
  discountProviderWarranty?: boolean;
}

const wholeTiers = (steps: [number, number][]): IncentiveTier[] => steps.map(([fromRate, ratio], i) => ({
  fromRate, toRate: steps[i + 1] ? steps[i + 1][0] : null, ratio, basis: 'whole' as const,
}));

export const STANDARD_COEFFICIENTS: Record<string, number> = { S: 1.2, A: 1.1, 'B+': 1, B: 0.9, C: 0.8 };
export const STANDARD_REBATE_TIERS: RebateTier[] = [{ minYears: 20, ratio: 0.1 }, { minYears: 10, ratio: 0.08 }, { minYears: 0, ratio: 0.05 }];

/** 示例规则：沿用 2026-08 版口径（整体比例阶梯，不设基础激励 / 门槛 / 返利），旧数据算出来的数字不变 */
export const DEFAULT_MARKETING_RULES: MarketingRules = {
  source: i18nT('默认示例规则（请上传【服务营销激励计算规则】PDF 后以提取结果为准）'),
  version: 2,
  auxTiers: wholeTiers([[0, 0], [0.8, 0.03], [1, 0.05], [1.2, 0.08]]),
  auxMinRate: 0,
  auxMissingTaskAsMet: false,
  qualifier: { enabled: false, productPattern: DK.qualifierProduct, label: DK.qualifierProduct },
  rebate: { enabled: false, tiers: STANDARD_REBATE_TIERS, yearsAsOf: 'quarterEnd' },
  managerTiers: wholeTiers([[0, 0], [0.8, 0.03], [1, 0.05], [1.2, 0.08]]),
  managerMinRate: 0,
  managerBase: { perItemMax: 0, minRate: 0.8, quarterMax: 0, applyCoefficient: false, applyDiscount: false },
  managerAdvanceRatio: 0,
  managerDiscountTiers: [{ belowRate: 0.8, discount: 0.8 }],
  performanceCoefficients: { ...STANDARD_COEFFICIENTS },
  warrantyMode: 'perOrder',
  warrantyTiers: [{ minRate: 0, providerRatio: 0, leaderRatio: 0 }, { minRate: 1, providerRatio: 0.05, leaderRatio: 0 }],
  warrantyPerOrder: 20,
  leaderShareRatio: 0.1,
  leaderShareBase: 'both',
  returnDueDays: 30,
  returnRemindBeforeDays: 10,
  discountProviderWarranty: false,
};

/**
 * 2026 默认政策（档位取自交付字［2026］TZ-270 / TZ-271，扫描件 OCR 后人工核对）。
 *  区域经理：基础激励每项 min(1000, 1000×完成率)、季度 2000 封顶、≥80% 才有；提成 80~100%：3%×A×0.8；
 *           100~120%：3%×A；120~150%：3%×1.2B+(A−1.2B)×3.5%；≥150%：…+0.3B×3.5%+(A−1.5B)×4%；
 *           延保 <60% 辅材提成 5 折；最终 × 季度绩效系数（S1.2 / A1.1 / B+1 / B0.9 / C0.8）；季度按 3% 预发。
 *  服务商辅材：<100% 无；100%：B×3%；100~120%：A×3%+(B−A)×4%；120~150%：+0.2A×4%+(B−1.2A)×5%；
 *           >150%：+0.3A×5%+(B−1.5A)×6%（A=目标 B=实际）；电动止回阀有任务时须达成；呆滞配件返利按服务年限
 *           ≥20 年 10% / 10~20 年 8% / <10 年 5%，条件：实际提货 ≥ 任务目标（客户表按季度目标判）；
 *           服务年限截止「季度开始前一个月的 1 日」（客户公式 DATE(2026,3,1)，见 RebateYearsAsOf）。
 *  延保：工程师 25%（不在本模块）；服务商基础 8%（5%+3%，不限任务额）；100~120% 9%（5%+4%）；
 *        120~150% 10%（5%+5%）；≥150% 11%（6%+5%）—— OCR 表格错位，此处按「/、/、100~120、120~150、≥150」
 *        五个完成率格对应「25%、8%、9%、10%、11%」五个激励格读取，请对照原件核对。
 */
export const DEFAULT_2026_RULES: MarketingRules = {
  source: i18nT('2026 服务营销激励默认政策（TZ-270 / TZ-271）'),
  version: 2,
  auxTiers: [
    { fromRate: 0, toRate: 1, ratio: 0.03, basis: 'marginal' },
    { fromRate: 1, toRate: 1.2, ratio: 0.04, basis: 'marginal' },
    { fromRate: 1.2, toRate: 1.5, ratio: 0.05, basis: 'marginal' },
    { fromRate: 1.5, toRate: null, ratio: 0.06, basis: 'marginal' },
  ],
  auxMinRate: 1,
  auxMissingTaskAsMet: true,
  qualifier: { enabled: true, productPattern: DK.qualifierProduct, label: DK.qualifierProduct },
  rebate: { enabled: true, tiers: STANDARD_REBATE_TIERS, yearsAsOf: 'lastMonthStart' },
  managerTiers: [
    { fromRate: 0, toRate: 1.2, ratio: 0.03, basis: 'marginal' },
    { fromRate: 0.8, toRate: 1, ratio: 0.03, factor: 0.8, basis: 'whole' },
    { fromRate: 1.2, toRate: 1.5, ratio: 0.035, basis: 'marginal' },
    { fromRate: 1.5, toRate: null, ratio: 0.04, basis: 'marginal' },
  ],
  managerMinRate: 0.8,
  managerBase: { perItemMax: 1000, minRate: 0.8, quarterMax: 2000, applyCoefficient: false, applyDiscount: false },
  managerAdvanceRatio: 0.03,
  managerDiscountTiers: [{ belowRate: 0.6, discount: 0.5 }],
  performanceCoefficients: { ...STANDARD_COEFFICIENTS },
  warrantyMode: 'ratio',
  warrantyTiers: [
    { minRate: 0, providerRatio: 0.05, leaderRatio: 0.03 },
    { minRate: 1, providerRatio: 0.05, leaderRatio: 0.04 },
    { minRate: 1.2, providerRatio: 0.05, leaderRatio: 0.05 },
    { minRate: 1.5, providerRatio: 0.06, leaderRatio: 0.05 },
  ],
  warrantyPerOrder: 0,
  leaderShareRatio: 0,
  leaderShareBase: 'warranty',
  returnDueDays: 30,
  returnRemindBeforeDays: 10,
  discountProviderWarranty: false,
};

const round2 = (n: number): number => Math.round(n * 100) / 100;
const round4 = (n: number): number => Math.round(n * 10000) / 10000;

/** v1 兼容：按 minRate 命中最高档 */
export function tierFor(rate: number, tiers: RateTier[]): RateTier {
  const sorted = [...tiers].sort((a, b) => a.minRate - b.minRate);
  let hit: RateTier = sorted[0] || { minRate: 0, ratio: 0 };
  for (const t of sorted) if (rate >= t.minRate) hit = t;
  return hit;
}

export function discountFor(rate: number, tiers: DiscountTier[]): number {
  const sorted = [...tiers].sort((a, b) => a.belowRate - b.belowRate);
  for (const t of sorted) if (rate < t.belowRate) return t.discount;
  return 1;
}

export function warrantyTierFor(rate: number, tiers: WarrantyTier[]): WarrantyTier {
  const sorted = [...tiers].sort((a, b) => a.minRate - b.minRate);
  let hit: WarrantyTier = sorted[0] || { minRate: 0, providerRatio: 0, leaderRatio: 0 };
  for (const t of sorted) if (rate >= t.minRate) hit = t;
  return hit;
}

export function rebateRatioFor(years: number, tiers: RebateTier[]): number {
  const sorted = [...tiers].sort((a, b) => b.minYears - a.minYears);
  for (const t of sorted) if (years >= t.minYears) return t.ratio;
  return 0;
}

export interface TierEvaluation {
  amount: number;
  /** 计算用达成率（无任务视同达成时 = 1） */
  rate: number;
  /** 命中的整体 / 固定档（边际累加时为空） */
  hit?: IncentiveTier;
  /** 折算成占实际的比例，仅展示 */
  effectiveRatio: number;
  /** 无任务且不视同达成 / 未到门槛 → 原因 */
  reason?: 'no_task' | 'below_min';
}

/**
 * 按档位表算激励。actual = A，task = B。
 * 无任务：missingTaskAsMet 时把目标视同实际（达成率 100%，边际档从第一档起算），否则 0。
 */
export function evaluateTiers(actual: number, task: number, tiers: IncentiveTier[], opts: { minRate: number; missingTaskAsMet?: boolean }): TierEvaluation {
  let base = task;
  let rate = task > 0 ? actual / task : 0;
  if (!(task > 0)) {
    if (!opts.missingTaskAsMet || !(actual > 0)) return { amount: 0, rate: 0, effectiveRatio: 0, reason: 'no_task' };
    base = actual;
    rate = 1;
  }
  if (rate < opts.minRate) return { amount: 0, rate, effectiveRatio: 0, reason: 'below_min' };
  const sorted = [...tiers].sort((a, b) => a.fromRate - b.fromRate);
  const within = (t: IncentiveTier) => rate >= t.fromRate && (t.toRate == null || rate < t.toRate);
  const hit = sorted.find((t) => t.basis !== 'marginal' && within(t));
  if (hit) {
    const amount = round2(hit.basis === 'fixed' ? (hit.fixed ?? 0) : actual * hit.ratio * (hit.factor ?? 1));
    return { amount, rate, hit, effectiveRatio: actual > 0 ? round4(amount / actual) : 0 };
  }
  let sum = 0;
  for (const t of sorted) {
    if (t.basis !== 'marginal') continue;
    const lo = t.fromRate * base;
    const hi = t.toRate == null ? Number.POSITIVE_INFINITY : t.toRate * base;
    if (actual <= lo) continue;
    sum += (Math.min(actual, hi) - lo) * t.ratio * (t.factor ?? 1);
  }
  const amount = round2(sum);
  return { amount, rate, effectiveRatio: actual > 0 ? round4(amount / actual) : 0 };
}

/**
 * 区域经理基础激励：完成 ≥100% 给满，minRate~100% 按完成率折算，其余 0；无任务无法判定 → 0。
 * 用未取整的 actual/task 算（客户表 1000×0.997058 = 997.06；用四位小数的达成率会算成 997.10）。
 */
export function managerBaseFor(actual: number, task: number, rule: ManagerBaseRule): number {
  if (!(rule.perItemMax > 0) || !(task > 0)) return 0;
  const rate = actual / task;
  if (rate >= 1) return round2(rule.perItemMax);
  if (rate >= rule.minRate) return round2(rule.perItemMax * rate);
  return 0;
}

/** 区域经理预发提成：命中整体档按整体档，否则实际 × 基础比例（advanceRatio ≤ 0 时 = 准确值） */
export function managerAdvanceFor(actual: number, task: number, tiers: IncentiveTier[], minRate: number, advanceRatio: number): number {
  const accurate = evaluateTiers(actual, task, tiers, { minRate });
  if (!(advanceRatio > 0) || accurate.reason) return accurate.amount;
  if (accurate.hit) return accurate.amount;
  return round2(actual * advanceRatio);
}

/** 引入日期 → 截止 asOf 的整年数（按周年算，未满一年为 0）；解析不了返回 null */
export function serviceYearsAt(introducedAt: string, asOf: string): number | null {
  const intro = normalizeDate(introducedAt);
  const end = normalizeDate(asOf);
  if (!intro || !end) return null;
  const [iy, im, id] = intro.split('-').map(Number);
  const [ey, em, ed] = end.split('-').map(Number);
  let years = ey - iy;
  if (em < im || (em === im && ed < id)) years -= 1;
  return Math.max(0, years);
}

export function normalizeGrade(grade: string): string {
  return String(grade || '').replace(/\s+/g, '').toUpperCase().replace(/＋/g, '+');
}

/**
 * 缺省（undefined / null / ''）一律回落默认，不能当 0：`toNumber(undefined)` = 0 能过 `>= 0`，
 * 于是 `sanitizeMarketingRules({})` 曾把 returnDueDays 算成 1、warrantyPerOrder / leaderShareRatio /
 * managerBase.minRate 全成 0 —— PDF 抽取时模型少给一个字段，基础激励就发满不封顶、折扣缺失时辅材提成清零
 *（2026-09-03 审查 P1-6）。
 */
const num = (v: unknown, fallback: number): number => {
  if (v == null || v === '') return fallback;
  const n = toNumber(v);
  return Number.isFinite(n) && n >= 0 ? n : fallback;
};
const rateNum = (v: unknown, fallback: number): number => {
  let r = num(v, fallback);
  if (r > 10) r /= 100; // 80 → 0.8
  return r;
};
const ratioNum = (v: unknown, fallback: number): number => {
  let r = num(v, fallback);
  if (r > 1) r /= 100; // 5 → 0.05
  return r;
};

function sanitizeIncentiveTiers(v: unknown, fallback: IncentiveTier[], fixedMode = false): IncentiveTier[] {
  if (!Array.isArray(v) || !v.length) return fallback;
  const objs = v.map((t) => (t && typeof t === 'object' ? t : {}) as Record<string, unknown>);
  const isV1 = objs.every((o) => o.fromRate == null && o.basis == null && o.minRate != null);
  let out: IncentiveTier[];
  if (isV1) {
    const v1 = objs.map((o) => ({ minRate: rateNum(o.minRate, 0), ratio: ratioNum(o.ratio, 0), fixed: o.fixed != null ? num(o.fixed, 0) : undefined }))
      .filter((t) => t.minRate <= 10)
      .sort((a, b) => a.minRate - b.minRate);
    out = v1.map((t, i) => ({
      fromRate: t.minRate, toRate: v1[i + 1] ? v1[i + 1].minRate : null, ratio: t.ratio,
      basis: (fixedMode || (t.fixed != null && !t.ratio)) ? 'fixed' : 'whole', fixed: t.fixed,
    }));
  } else {
    out = objs.map((o) => {
      const basis: TierBasis = o.basis === 'marginal' || o.basis === 'fixed' ? o.basis : 'whole';
      const toRaw = o.toRate;
      const toRate = toRaw == null || toRaw === '' ? null : rateNum(toRaw, 0);
      const tier: IncentiveTier = { fromRate: rateNum(o.fromRate ?? o.minRate, 0), toRate: toRate != null && toRate > 0 ? toRate : null, ratio: ratioNum(o.ratio, 0), basis };
      const factor = o.factor == null ? 1 : num(o.factor, 1);
      if (factor !== 1) tier.factor = factor;
      if (o.fixed != null) tier.fixed = num(o.fixed, 0);
      return tier;
    }).filter((t) => t.fromRate <= 10 && (t.toRate == null || t.toRate > t.fromRate));
  }
  return out.length ? out.sort((a, b) => a.fromRate - b.fromRate) : fallback;
}

/** 界面 / LLM / 旧 store 给的规则对象做一遍安全收口；旧 v1 JSON（RateTier 阶梯、auxMode）自动升级成 v2 */
export function sanitizeMarketingRules(raw: unknown): MarketingRules {
  const r = (raw && typeof raw === 'object' ? raw : {}) as Record<string, unknown>;
  const D = DEFAULT_MARKETING_RULES;
  const obj = (v: unknown): Record<string, unknown> => (v && typeof v === 'object' ? v : {}) as Record<string, unknown>;
  const discounts = (v: unknown, fallback: DiscountTier[]): DiscountTier[] => {
    if (!Array.isArray(v)) return fallback;
    const out = v.map((t) => {
      const o = obj(t);
      const belowRate = rateNum(o.belowRate, 0.8);
      let discount = num(o.discount, 1);
      if (discount > 1) discount /= (discount > 10 ? 100 : 10); // 80 → 0.8, 8 → 0.8
      return { belowRate, discount };
    });
    return out.length ? out.sort((a, b) => a.belowRate - b.belowRate) : fallback;
  };
  const warrantyTiers = (v: unknown, fallback: WarrantyTier[]): WarrantyTier[] => {
    if (!Array.isArray(v) || !v.length) return fallback;
    const out = v.map((t) => {
      const o = obj(t);
      return { minRate: rateNum(o.minRate ?? o.fromRate, 0), providerRatio: ratioNum(o.providerRatio ?? o.ratio, 0), leaderRatio: ratioNum(o.leaderRatio, 0) };
    }).filter((t) => t.minRate <= 10);
    return out.length ? out.sort((a, b) => a.minRate - b.minRate) : fallback;
  };
  const rebateTiers = (v: unknown, fallback: RebateTier[]): RebateTier[] => {
    if (!Array.isArray(v) || !v.length) return fallback;
    const out = v.map((t) => { const o = obj(t); return { minYears: Math.max(0, Math.round(num(o.minYears, 0))), ratio: ratioNum(o.ratio, 0) }; });
    return out.sort((a, b) => b.minYears - a.minYears);
  };
  const coefficients = (v: unknown): Record<string, number> => {
    const o = obj(v);
    const out: Record<string, number> = {};
    for (const [k, val] of Object.entries(o)) {
      const g = normalizeGrade(k);
      const n = toNumber(val);
      if (g && Number.isFinite(n) && n > 0) out[g] = n > 5 ? n / 100 : n; // 120 → 1.2
    }
    return Object.keys(out).length ? out : { ...D.performanceCoefficients };
  };
  const auxTiers = sanitizeIncentiveTiers(r.auxTiers, D.auxTiers, r.auxMode === 'fixed');
  const managerRaw = r.managerTiers ?? r.managerAuxTiers;
  const managerTiers = managerRaw == null ? (r.auxTiers != null ? auxTiers : D.managerTiers) : sanitizeIncentiveTiers(managerRaw, auxTiers, r.auxMode === 'fixed');
  // 嵌套对象先铺默认再取：LLM / 旧 store 只给了 perItemMax 时其余字段（minRate / quarterMax）回落默认而不是 0
  const mb = { ...D.managerBase, ...obj(r.managerBase) } as Record<string, unknown>;
  const q = { ...D.qualifier, ...obj(r.qualifier) } as Record<string, unknown>;
  const rb = { ...D.rebate, ...obj(r.rebate) } as Record<string, unknown>;
  let productPattern = typeof q.productPattern === 'string' && q.productPattern.trim() ? q.productPattern.trim() : D.qualifier.productPattern;
  try { new RegExp(productPattern); } catch { productPattern = D.qualifier.productPattern; }
  let leaderShareRatio = num(r.leaderShareRatio, D.leaderShareRatio);
  if (leaderShareRatio > 1) leaderShareRatio /= 100;
  return {
    source: typeof r.source === 'string' ? r.source : D.source,
    version: 2,
    auxTiers,
    auxMinRate: rateNum(r.auxMinRate, D.auxMinRate),
    auxMissingTaskAsMet: Boolean(r.auxMissingTaskAsMet),
    qualifier: { enabled: Boolean(q.enabled), productPattern, label: typeof q.label === 'string' && q.label.trim() ? q.label.trim() : productPattern },
    rebate: { enabled: Boolean(rb.enabled), tiers: rebateTiers(rb.tiers, D.rebate.tiers), yearsAsOf: rb.yearsAsOf === 'quarterStart' || rb.yearsAsOf === 'lastMonthStart' ? rb.yearsAsOf : 'quarterEnd' },
    managerTiers,
    managerMinRate: rateNum(r.managerMinRate, D.managerMinRate),
    managerBase: {
      perItemMax: num(mb.perItemMax, D.managerBase.perItemMax),
      minRate: rateNum(mb.minRate, D.managerBase.minRate),
      quarterMax: num(mb.quarterMax, D.managerBase.quarterMax),
      applyCoefficient: Boolean(mb.applyCoefficient),
      applyDiscount: Boolean(mb.applyDiscount),
    },
    managerAdvanceRatio: ratioNum(r.managerAdvanceRatio, D.managerAdvanceRatio),
    managerDiscountTiers: discounts(r.managerDiscountTiers, D.managerDiscountTiers),
    performanceCoefficients: coefficients(r.performanceCoefficients),
    warrantyMode: r.warrantyMode === 'ratio' ? 'ratio' : 'perOrder',
    warrantyTiers: warrantyTiers(r.warrantyTiers, D.warrantyTiers),
    warrantyPerOrder: num(r.warrantyPerOrder, D.warrantyPerOrder),
    leaderShareRatio,
    leaderShareBase: r.leaderShareBase === 'warranty' || r.leaderShareBase === 'aux' ? r.leaderShareBase : 'both',
    returnDueDays: Math.max(1, Math.round(num(r.returnDueDays, D.returnDueDays))),
    returnRemindBeforeDays: Math.max(0, Math.round(num(r.returnRemindBeforeDays, D.returnRemindBeforeDays))),
    discountProviderWarranty: Boolean(r.discountProviderWarranty),
  };
}

const pctText = (n: number, digits = 1): string => `${(n * 100).toFixed(digits)}%`;

export function describeYearsAsOf(v: RebateYearsAsOf): string {
  if (v === 'quarterStart') return i18nT('季度开始前一日');
  if (v === 'lastMonthStart') return i18nT('季度开始前一个月的 1 日');
  return i18nT('季度末');
}

export function describeTier(t: IncentiveTier): string {
  const range = t.toRate == null ? i18nT('达成率 ≥ {a}', { a: pctText(t.fromRate, 0) }) : i18nT('达成率 {a} ~ {b}', { a: pctText(t.fromRate, 0), b: pctText(t.toRate, 0) });
  const factor = t.factor != null && t.factor !== 1 ? ` × ${t.factor}` : '';
  if (t.basis === 'fixed') return `${range} → ${i18nT('固定 {n} 元', { n: t.fixed ?? 0 })}`;
  if (t.basis === 'marginal') return `${range} → ${i18nT('该区间增量 × {r}{f}', { r: pctText(t.ratio, 2), f: factor })}`;
  return `${range} → ${i18nT('实际 × {r}{f}', { r: pctText(t.ratio, 2), f: factor })}`;
}

/** 「计算规则」sheet 用：把规则说成人话 */
export function describeRules(rules: MarketingRules): [string, string][] {
  const rows: [string, string][] = [[i18nT('规则来源'), rules.source || '']];
  rows.push([i18nT('服务商辅材激励'), i18nT('达成率 < {m} 无激励{x}', { m: pctText(rules.auxMinRate, 0), x: rules.auxMissingTaskAsMet ? i18nT('；无任务视同达成') : '' })]);
  for (const t of rules.auxTiers) rows.push([i18nT('服务商辅材档位'), describeTier(t)]);
  if (rules.qualifier.enabled) rows.push([i18nT('提货激励门槛'), i18nT('{l} 有任务时须达成，否则提货激励为 0', { l: rules.qualifier.label })]);
  if (rules.rebate.enabled) {
    rows.push([i18nT('呆滞配件返利'), i18nT('实际提货 ≥ 任务目标时按服务年限返利（截止{d}）：{t}', { d: describeYearsAsOf(rules.rebate.yearsAsOf), t: rules.rebate.tiers.map((x) => i18nT('≥{y} 年 {r}', { y: x.minYears, r: pctText(x.ratio, 0) })).join(' / ') })]);
  }
  rows.push([i18nT('区域经理提成'), i18nT('完成率 < {m} 无激励{a}', { m: pctText(rules.managerMinRate, 0), a: rules.managerAdvanceRatio > 0 ? i18nT('；预发按 {r} 基础比例', { r: pctText(rules.managerAdvanceRatio, 0) }) : '' })]);
  for (const t of rules.managerTiers) rows.push([i18nT('区域经理档位'), describeTier(t)]);
  if (rules.managerBase.perItemMax > 0) rows.push([i18nT('区域经理基础激励'), i18nT('每项最高 {n} 元（完成率 ≥ {m} 按完成率折算，≥100% 给满），每季度最高 {q} 元', { n: rules.managerBase.perItemMax, m: pctText(rules.managerBase.minRate, 0), q: rules.managerBase.quarterMax || '∞' })]);
  for (const t of rules.managerDiscountTiers) rows.push([i18nT('区域经理延保达成率 < {rate}', { rate: pctText(t.belowRate, 0) }), i18nT('辅材提成打 {d} 折', { d: (t.discount * 10).toFixed(1) })]);
  rows.push([i18nT('绩效系数'), Object.entries(rules.performanceCoefficients).map(([g, c]) => `${g}:${c}`).join('  ')]);
  rows.push([i18nT('延保激励方式'), rules.warrantyMode === 'perOrder' ? i18nT('每单 {n} 元', { n: rules.warrantyPerOrder }) : i18nT('延保实际 × 档位比例（服务商 / 负责人）')]);
  if (rules.warrantyMode === 'ratio') for (const t of rules.warrantyTiers) rows.push([i18nT('延保达成率 ≥ {rate}', { rate: pctText(t.minRate, 0) }), i18nT('服务商 {p} + 负责人 {l}', { p: pctText(t.providerRatio, 0), l: pctText(t.leaderRatio, 0) })]);
  if (rules.warrantyMode === 'perOrder' || !rules.warrantyTiers.some((t) => t.leaderRatio > 0)) {
    rows.push([i18nT('负责人激励'), i18nT('{base} × {ratio}', { base: rules.leaderShareBase === 'warranty' ? i18nT('延保激励') : rules.leaderShareBase === 'aux' ? i18nT('辅材激励') : i18nT('辅材+延保激励'), ratio: pctText(rules.leaderShareRatio, 2) })]);
  }
  rows.push([i18nT('呆滞配件退回期限'), i18nT('{n} 天，到期前 {m} 天二次提醒', { n: rules.returnDueDays, m: rules.returnRemindBeforeDays })]);
  return rows;
}

// ── 季度 ──────────────────────────────────────────────────────────────────────

export interface QuarterRange { label: string; start: string; end: string }

export function quarterRange(year: number, q: 1 | 2 | 3 | 4): QuarterRange {
  const startMonth = (q - 1) * 3 + 1;
  const endMonth = startMonth + 2;
  const lastDay = new Date(year, endMonth, 0).getDate();
  const mm = (m: number) => String(m).padStart(2, '0');
  return { label: `${year}Q${q}`, start: `${year}-${mm(startMonth)}-01`, end: `${year}-${mm(endMonth)}-${lastDay}` };
}

/** "2026-07-15" / "2026/7/15 10:00" / "20260715" / Excel 序列号 45083 → 'YYYY-MM-DD'，解析不了返回 '' */
export function normalizeDate(v: string): string {
  const s = String(v || '').trim();
  if (!s) return '';
  if (/^\d{5}$/.test(s)) {
    // xlsx 没按日期格式读出来时是 Excel 序列号（1900 起算）；2024-09 ≈ 45550
    const serial = Number(s);
    if (serial > 20000 && serial < 80000) {
      const d = new Date(Date.UTC(1899, 11, 30) + serial * 86400000);
      return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}-${String(d.getUTCDate()).padStart(2, '0')}`;
    }
    return '';
  }
  let m = s.match(/(\d{4})[-/.年](\d{1,2})[-/.月](\d{1,2})/);
  if (!m) m = s.match(/^(\d{4})(\d{2})(\d{2})/);
  if (!m) {
    const t = Date.parse(s);
    if (!Number.isFinite(t)) return '';
    const d = new Date(t);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }
  return `${m[1]}-${m[2].padStart(2, '0')}-${m[3].padStart(2, '0')}`;
}

const CN_QUARTER: Record<string, number> = { '一': 1, '二': 2, '三': 3, '四': 4 };

/**
 * 订单「日期 / 季度」列是否属于本季度。真实导出常见的不是日期而是标签：
 * 有赞「订单创建季度」= Q1 / 4月 / 5月 / 6月，CSS「月份」= 04 / 05 / 06 —— 这些以前解析不了
 * 就当「不过滤」全放进来，Q1 的 3000 行会混进 Q2。解析不了的值仍不过滤（导出时已按季度筛过）。
 */
export function periodMatches(value: string, range?: QuarterRange): boolean {
  if (!range) return true;
  const s = String(value || '').trim();
  if (!s) return true;
  const year = Number(range.start.slice(0, 4));
  const quarter = Math.floor((Number(range.start.slice(5, 7)) - 1) / 3) + 1;
  const qm = s.match(/Q\s*([1-4])(?!\d)/i) || s.match(/(?:第)?\s*([1-4一二三四])\s*季度?$/);
  if (qm) {
    const q = CN_QUARTER[qm[1]] ?? Number(qm[1]);
    const ym = s.match(/(20\d{2})/);
    if (ym && Number(ym[1]) !== year) return false;
    return q === quarter;
  }
  const mm = s.match(/^(?:(20\d{2})\s*[-/.年]\s*)?(\d{1,2})\s*月?$/);
  if (mm) {
    const month = Number(mm[2]);
    if (month < 1 || month > 12) return true;
    const y = mm[1] ? Number(mm[1]) : year;
    return y === year && Math.floor((month - 1) / 3) + 1 === quarter;
  }
  const d = normalizeDate(s);
  if (!d) return true;
  return d >= range.start && d <= range.end;
}

// ── 达成率 ─────────────────────────────────────────────────────────────────────

export interface AchievementRow {
  name: string;
  /** 服务商所属区域经理（经理行为空）；季度内换过经理的服务商取订单行里出现最多的那位 */
  manager?: string;
  actual: number;
  task: number;
  /** task = 0 时为 0 */
  rate: number;
  /** 订单 / 工单条数 */
  orders: number;
  /** 门槛品类（电动止回阀）实际 / 任务（只有服务商行、且指定了产品列 / 门槛任务列时才有） */
  qualifierActual?: number;
  qualifierTask?: number;
  /** 年度任务（呆滞配件返利门槛；任务表有年度列时） */
  annualTask?: number;
}

export interface AchievementResult {
  providers: AchievementRow[];
  managers: AchievementRow[];
  totals: { actual: number; task: number; rate: number; orders: number };
  warnings: string[];
  /** 服务商 → 区域经理 */
  providerManager: Record<string, string>;
  /** 有销售但任务表里没有的服务商 */
  providersWithoutTask: string[];
  /** 订单行有经理列但经理为空、服务商也查不到归属的金额（未计入任何经理） */
  unattributed?: { amount: number; rows: number };
}

export interface AchievementInput {
  /**
   * 订单表（有赞辅材订单 / CSS 延保订单）。
   * mapping: provider, amount | quantity, date?, manager?, status?, product?（门槛品类判定列）,
   *          providerAlt?（变更 / 归属服务商：**非空时它才是这一行的服务商身份**，provider 列只作回落）
   *
   * CSS 延保导出的「一级服务商名」是下单时的旧名，「变更服务商」才是现名（2026 Q2 实测 49 行 / 11,535 元：
   * 崇川区众川→南通浩纯、深圳众诚→深圳广弘、杭州粤华川→杭州粤华盛 …，这些行的区域经理列还是 #N/A）。
   * 以前只拿它找经理、身份仍按旧名 → 旧名成了一家「有订单无任务」的服务商按 8% 基础档算，现名那家延保实际 0；
   * 客户按现名算，档位（9% 而不是 8%）与负责人激励都对不上。
   */
  orders: MappedTable[];
  /**
   * 服务商曾用名 → 现名（服务商信息表「更名记录」列 / 通讯录别名）。两边任意写法，内部按 providerKey 归一后查；
   * 任务表 / 订单表里出现曾用名的行都并到现名（客户「准确」表列 3 记的就是这些曾用名）。
   */
  aliases?: Record<string, string>;
  /** 服务商任务表。mapping: provider, task, manager?, qualifierTask?, annualTask? */
  providerTasks?: MappedTable | null;
  /** 区域经理任务表。mapping: manager, task */
  managerTasks?: MappedTable | null;
  quarter?: QuarterRange;
  /** 实际值口径：金额 / 数量（数量无列时按行数计） */
  measure: 'amount' | 'quantity';
  /** 已知的服务商→经理（上一步算出来的 / 服务商信息表），延保步骤复用；优先级低于本表任务表与订单行 */
  knownProviderManager?: Record<string, string>;
  /** 已剔除的订单状态关键字（取消 / 退款 …） */
  excludeStatusPattern?: string;
  /** 门槛品类正则（如「电动止回阀」）；给了且订单表映射了 product 列才统计 qualifierActual */
  qualifierPattern?: string;
}

interface Acc { actual: number; orders: number }
/** 任务表 / 导出表尾部的「合计」行不是服务商也不是经理（客户真实任务表每张都带） */
const TOTAL_ROW = /^(合计|总计|小计|汇总)[:：]?$/;

/**
 * 跨表匹配用的服务商键：去空白、全角括号 / 标点转半角、去掉「(个体工商户)」这类组织形式后缀、大小写归一。
 * 客户真实表里同一家在有赞订单「客户备注」写「许昌市魏都区燎丰家电维修中心 」、任务表写
 * 「许昌市魏都区燎丰家电维修中心（个体工商户）」、还有「xx(个体工商户）」半全角混写 —— 逐字匹配会拆成
 * 两家（一家有销售没任务、一家有任务没销售 → 两边都 0 激励），2026 Q2 对账实测 11 家因此漏算。
 * 展示用任务表里的原名（正式名），任务表没有的用订单表原名。
 */
export function providerKey(name: string): string {
  return String(name || '')
    .replace(/\s+/g, '')
    .replace(/（/g, '(').replace(/）/g, ')').replace(/【/g, '[').replace(/】/g, ']')
    .replace(/，/g, ',').replace(/：/g, ':').replace(/－/g, '-')
    .replace(/\((个体工商户|个体户|个体)\)$/g, '')
    .toLowerCase();
}
const addTo = (map: Map<string, Acc>, key: string, value: number): void => {
  const acc = map.get(key) || { actual: 0, orders: 0 };
  acc.actual = round2(acc.actual + value);
  acc.orders += 1;
  map.set(key, acc);
};

/**
 * 别名解析器：曾用名 → { 现名键, 现名 }。链式（旧→中→新）最多跟 3 跳，自指 / 环忽略。
 * 键值两边都过 providerKey，所以「（个体工商户）」「半角括号」这类写法差异不影响命中。
 */
export function makeAliasResolver(aliases?: Record<string, string> | null): (name: string) => { key: string; name: string } {
  const byKey = new Map<string, string>();
  for (const [from, to] of Object.entries(aliases || {})) {
    const k = providerKey(from);
    const cur = String(to || '').trim();
    if (k && cur && providerKey(cur) !== k) byKey.set(k, cur);
  }
  return (name: string) => {
    let key = providerKey(name);
    let display = String(name || '').trim();
    for (let hop = 0; hop < 3; hop += 1) {
      const cur = byKey.get(key);
      if (!cur) break;
      const ck = providerKey(cur);
      if (!ck || ck === key) break;
      key = ck;
      display = cur;
    }
    return { key, name: display };
  };
}

/** 两个键是否只差一个字（增 / 删 / 换）—— 「蚌埠商邦 / 蚌埠商帮」「丰县维思特 / 由丰县维思特」这类录入笔误 */
export function withinOneEdit(a: string, b: string): boolean {
  if (a === b) return false;
  const la = a.length;
  const lb = b.length;
  if (Math.abs(la - lb) > 1) return false;
  let i = 0;
  let j = 0;
  let edits = 0;
  while (i < la && j < lb) {
    if (a[i] === b[j]) { i += 1; j += 1; continue; }
    edits += 1;
    if (edits > 1) return false;
    if (la > lb) i += 1;
    else if (lb > la) j += 1;
    else { i += 1; j += 1; }
  }
  return edits + (la - i) + (lb - j) <= 1;
}

export function computeAchievement(input: AchievementInput): AchievementResult {
  const warnings: string[] = [];
  const resolve = makeAliasResolver(input.aliases);
  const known: Record<string, string> = {};
  for (const [k, v] of Object.entries(input.knownProviderManager || {})) if (v) known[resolve(k).key] = v;
  /** 服务商键 → 展示名（任务表原名优先，其次订单表第一次出现的原名；曾用名一律换成现名） */
  const displayName = new Map<string, string>();
  const keyOf = (name: string, formal = false): string => {
    const c = resolve(name);
    if (c.key && (formal || !displayName.has(c.key))) displayName.set(c.key, c.name);
    return c.key;
  };
  const providerActual = new Map<string, Acc>();
  /** 没有经理列的订单表里的服务商金额：最后按服务商→经理映射汇总到经理 */
  const providerActualViaMap = new Map<string, Acc>();
  /** 有经理列的订单表：逐行归属，等任务表读完（任务表归属优先）再落经理 */
  const pending: { provider: string; providerAlt: string; manager: string; value: number }[] = [];
  const managerActualDirect = new Map<string, Acc>();
  const rowManagerVotes = new Map<string, Map<string, number>>();
  const providerQualifier = new Map<string, number>();
  const exclude = input.excludeStatusPattern ? new RegExp(input.excludeStatusPattern) : /取消|已退款|退款成功|关闭|作废|退货/;
  let qualifierRe: RegExp | null = null;
  if (input.qualifierPattern) { try { qualifierRe = new RegExp(input.qualifierPattern); } catch { warnings.push(i18nT('门槛品类正则不合法：{p}', { p: input.qualifierPattern })); } }

  for (const src of input.orders) {
    const m = { ...src.mapping };
    // 辅材订单真实导出没有「服务商」列，服务商名写在「客户备注」里（上游按买家手机号
    // 映射填入 —— 2026-08-31 灌真实数据实测）。没指定服务商列时自动回落它，并提示。
    if (!m.provider && src.table.headers.includes(DK.orderProviderFallbackColumn)) {
      m.provider = DK.orderProviderFallbackColumn;
      warnings.push(i18nT('{p0}：无服务商列，已回落用「客户备注」作服务商（该表备注列即服务商名，若不对请手动指认）', { p0: src.table.fileName }));
    }
    if (!m.provider && !m.manager) { warnings.push(i18nT('{p0}：未指定服务商列，已跳过', { p0: src.table.fileName })); continue; }
    if (input.measure === 'amount' && !m.amount) warnings.push(i18nT('{p0}：未指定金额列，实际达成按 0 计', { p0: src.table.fileName }));
    if (qualifierRe && !m.product) warnings.push(i18nT('{p0}：未指定产品列，门槛品类（{q}）实际按 0 计', { p0: src.table.fileName, q: input.qualifierPattern }));
    let skipped = 0;
    for (const row of src.table.rows) {
      if (m.date && !periodMatches(row[m.date], input.quarter)) { skipped += 1; continue; }
      if (m.status && exclude.test(row[m.status] || '')) { skipped += 1; continue; }
      const value = input.measure === 'amount'
        ? (m.amount ? toNumber(row[m.amount]) : 0)
        : (m.quantity ? toNumber(row[m.quantity]) || 1 : 1);
      const rawName = m.provider ? (row[m.provider] || '').trim() : '';
      const altName = m.providerAlt ? (row[m.providerAlt] || '').trim() : '';
      // 变更 / 归属服务商非空 → 它是这一行的身份；原服务商名只留作经理查找的回落键
      const pName = altName || rawName;
      const mg = m.manager ? (row[m.manager] || '').trim() : '';
      const pAlt = altName && rawName ? resolve(rawName).key : '';
      if (TOTAL_ROW.test(pName) || TOTAL_ROW.test(mg)) { skipped += 1; continue; }
      const p = keyOf(pName);
      if (p) {
        addTo(providerActual, p, value);
        if (qualifierRe && m.product && qualifierRe.test(row[m.product] || '')) providerQualifier.set(p, round2((providerQualifier.get(p) || 0) + value));
        if (mg) {
          const votes = rowManagerVotes.get(p) || new Map<string, number>();
          votes.set(mg, (votes.get(mg) || 0) + 1);
          rowManagerVotes.set(p, votes);
        }
        // 有经理列的表逐行归属（客户按月指派经理，同一服务商季度内可能换人）；没有经理列的表走映射
        if (m.manager) pending.push({ provider: p, providerAlt: pAlt, manager: mg, value });
        else addTo(providerActualViaMap, p, value);
      } else if (mg) {
        // 只有经理没有服务商的订单：直接记到经理名下
        addTo(managerActualDirect, mg, value);
      }
    }
    if (skipped) warnings.push(i18nT('{p0}：{skipped} 行不在季度范围内或状态为取消/退款，已剔除', { p0: src.table.fileName, skipped }));
  }

  // 任务
  const providerTask = new Map<string, number>();
  const providerQualifierTask = new Map<string, number>();
  const providerAnnualTask = new Map<string, number>();
  const taskManager: Record<string, string> = {};
  if (input.providerTasks) {
    const { table, mapping } = input.providerTasks;
    if (!mapping.provider || !mapping.task) warnings.push(i18nT('{p0}：任务表需要「服务商」和「任务」两列', { p0: table.fileName }));
    else {
      for (const row of table.rows) {
        const pName = (row[mapping.provider] || '').trim();
        if (!pName || TOTAL_ROW.test(pName)) continue;
        const p = keyOf(pName, true);
        providerTask.set(p, round2((providerTask.get(p) || 0) + toNumber(row[mapping.task])));
        if (mapping.qualifierTask) providerQualifierTask.set(p, round2((providerQualifierTask.get(p) || 0) + toNumber(row[mapping.qualifierTask])));
        if (mapping.annualTask) providerAnnualTask.set(p, round2((providerAnnualTask.get(p) || 0) + toNumber(row[mapping.annualTask])));
        const mg = mapping.manager ? (row[mapping.manager] || '').trim() : '';
        if (mg) taskManager[p] = mg;
      }
    }
  }
  const managerTask = new Map<string, number>();
  if (input.managerTasks) {
    const { table, mapping } = input.managerTasks;
    if (!mapping.manager || !mapping.task) warnings.push(i18nT('{p0}：任务表需要「区域经理」和「任务」两列', { p0: table.fileName }));
    else {
      for (const row of table.rows) {
        const mg = (row[mapping.manager] || '').trim();
        if (!mg || TOTAL_ROW.test(mg)) continue;
        managerTask.set(mg, round2((managerTask.get(mg) || 0) + toNumber(row[mapping.task])));
      }
    }
  }

  // 服务商 → 经理：任务表 > 订单行多数票 > 上一步 / 信息表已知
  const majority = (p: string): string => {
    const votes = rowManagerVotes.get(p);
    if (!votes) return '';
    return [...votes.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], 'zh-CN'))[0][0];
  };
  const providerManagerByKey: Record<string, string> = {};
  const providerKeys = new Set<string>([...providerActual.keys(), ...providerTask.keys()]);
  for (const p of providerKeys) {
    const mg = taskManager[p] || majority(p) || known[p] || '';
    if (mg) providerManagerByKey[p] = mg;
  }
  const lookupManager = (p: string): string => providerManagerByKey[p] || taskManager[p] || known[p] || '';

  // 逐行归属：任务表归属 > 订单行经理 > 服务商映射 > 变更/归属服务商映射
  let unattributedAmount = 0;
  let unattributedRows = 0;
  for (const row of pending) {
    const mg = taskManager[row.provider] || row.manager || lookupManager(row.provider) || (row.providerAlt ? lookupManager(row.providerAlt) : '');
    if (mg) addTo(managerActualDirect, mg, row.value);
    else { unattributedAmount = round2(unattributedAmount + row.value); unattributedRows += 1; }
  }
  if (unattributedRows) warnings.push(i18nT('{n} 行订单（{amt}）经理列为空且服务商查不到归属，未计入任何区域经理', { n: unattributedRows, amt: unattributedAmount }));
  const switched = [...rowManagerVotes.entries()].filter(([, v]) => v.size > 1).map(([p, v]) => `${displayName.get(p) || p}（${[...v.keys()].join('/')}）`);
  if (switched.length) warnings.push(i18nT('{n} 家服务商季度内订单归属多位经理，已按订单行逐行归属：{list}{more}', { n: switched.length, list: switched.slice(0, 5).join('、'), more: switched.length > 5 ? '…' : '' }));

  const providers: AchievementRow[] = [...providerKeys].map((key) => {
    const a = providerActual.get(key) || { actual: 0, orders: 0 };
    const task = providerTask.get(key) || 0;
    const row: AchievementRow = { name: displayName.get(key) || key, manager: providerManagerByKey[key] || '', actual: a.actual, task, rate: task > 0 ? round4(a.actual / task) : 0, orders: a.orders };
    if (qualifierRe || providerQualifierTask.size) {
      row.qualifierActual = providerQualifier.get(key) || 0;
      row.qualifierTask = providerQualifierTask.get(key) || 0;
    }
    if (providerAnnualTask.size) row.annualTask = providerAnnualTask.get(key) || 0;
    return row;
  }).sort((x, y) => y.actual - x.actual || x.name.localeCompare(y.name, 'zh-CN'));
  const providersWithoutTask = providers.filter((p) => p.actual > 0 && !providerTask.has(resolve(p.name).key)).map((p) => p.name);
  if (providersWithoutTask.length) warnings.push(i18nT('{p0} 家服务商有订单但任务表里没有任务：{p1}{p2}', { p0: providersWithoutTask.length, p1: providersWithoutTask.slice(0, 5).join('、'), p2: providersWithoutTask.length > 5 ? '…' : '' }));
  // 「有订单无任务」与「有任务无订单」的两家名字只差一个字，十有八九是同一家写错了字：客户有赞订单「客户备注」
  // 写「蚌埠商帮」、任务表写「蚌埠商邦」，两边各算成一家 → 一家 3% 基础档、一家 0%，客户按一家算出 392 + 466 元。
  // 不自动合并（可能真是两家），点名提示让用户去改别名 / 改表。
  const taskOnly = [...providerTask.keys()].filter((k) => !(providerActual.get(k)?.actual)).map((k) => ({ key: k, name: displayName.get(k) || k }));
  const suspects: string[] = [];
  for (const name of providersWithoutTask) {
    const k = resolve(name).key;
    if (k.length < 6) continue;
    const twin = taskOnly.find((t) => withinOneEdit(k, t.key));
    if (twin) suspects.push(`${name} ↔ ${twin.name}`);
  }
  if (suspects.length) warnings.push(i18nT('{n} 对服务商名字只差一个字（前者有订单无任务、后者有任务无订单），疑似同一家写错字，请核对后在服务商信息表「更名记录」或任务表里改成同名：{list}', { n: suspects.length, list: suspects.join('；') }));

  // 区域经理实际 = 逐行归属的订单 + 只有经理没有服务商的订单 + 无经理列的表按服务商映射汇总
  const managerActual = new Map<string, Acc>();
  for (const [k, v] of managerActualDirect) managerActual.set(k, { ...v });
  for (const [p, acc] of providerActualViaMap) {
    const mg = providerManagerByKey[p];
    if (!mg) continue;
    const cur = managerActual.get(mg) || { actual: 0, orders: 0 };
    cur.actual = round2(cur.actual + acc.actual);
    cur.orders += acc.orders;
    managerActual.set(mg, cur);
  }
  // 区域经理任务兜底：没给经理任务表（或表里漏了某位经理）时，按辖区服务商任务之和计——
  // 否则任务为 0 → 达成率恒 0% → 延保判定会把所有经理都打折，那是把数据缺失算成了业绩差。
  const derivedManagerTask = new Map<string, number>();
  for (const p of providers) {
    if (!p.manager || !p.task) continue;
    derivedManagerTask.set(p.manager, round2((derivedManagerTask.get(p.manager) || 0) + p.task));
  }
  const managerNames = new Set<string>([...managerActual.keys(), ...managerTask.keys()]);
  const derivedFor: string[] = [];
  const managers: AchievementRow[] = [...managerNames].map((name) => {
    const a = managerActual.get(name) || { actual: 0, orders: 0 };
    let task = managerTask.get(name) || 0;
    if (!task && derivedManagerTask.get(name)) { task = derivedManagerTask.get(name)!; derivedFor.push(name); }
    return { name, actual: a.actual, task, rate: task > 0 ? round4(a.actual / task) : 0, orders: a.orders };
  })
    // 任务表里挂名但任务 0、季度内一单没有的经理（客户延保任务表的陈江玲 / 董煜明，负责区域「/」）不入列：
    // 没有任何可算的数，进了列表只会在核算时触发「没有绩效等级」告警（2026-09-03 审查 P2-9）
    .filter((m) => m.actual > 0 || m.task > 0 || m.orders > 0)
    .sort((x, y) => y.actual - x.actual || x.name.localeCompare(y.name, 'zh-CN'));
  if (derivedFor.length) {
    warnings.push(input.managerTasks
      ? i18nT('区域经理任务表里没有 {names}，已按其辖区服务商任务之和计', { names: derivedFor.join('、') })
      : i18nT('未提供区域经理任务表，区域经理任务按辖区服务商任务之和计（{names}）', { names: derivedFor.join('、') }));
  }
  if (!managers.length && providers.length) warnings.push(i18nT('没有识别到区域经理：请在服务商任务表里提供「区域经理」列，或在订单表里指定经理列'));

  const totals = providers.reduce((t, p) => ({ actual: round2(t.actual + p.actual), task: round2(t.task + p.task), rate: 0, orders: t.orders + p.orders }), { actual: 0, task: 0, rate: 0, orders: 0 });
  totals.rate = totals.task > 0 ? round4(totals.actual / totals.task) : 0;
  const providerManager: Record<string, string> = {};
  for (const key of providerKeys) if (providerManagerByKey[key]) providerManager[displayName.get(key) || key] = providerManagerByKey[key];
  const result: AchievementResult = { providers, managers, totals, warnings, providerManager, providersWithoutTask };
  if (unattributedRows) result.unattributed = { amount: unattributedAmount, rows: unattributedRows };
  return result;
}

// ── 激励核算 ────────────────────────────────────────────────────────────────────

export interface ProviderIncentive {
  provider: string;
  manager: string;
  auxActual: number;
  auxTask: number;
  auxRate: number;
  /** 折算成占实际的比例（仅展示） */
  auxRatio: number;
  /** 第 3 步：服务商辅材激励初始金额（= 需退回呆滞配件等额）；门槛不达成时为 0 */
  auxInitial: number;
  /** 门槛判定前的提货激励（门槛不达成被清零时看这里） */
  auxBeforeQualifier: number;
  /** 无任务视同达成 / 未到门槛的原因 */
  auxNote?: string;
  /** 门槛品类：true 达成 / false 未达成 / null 不涉及（没任务或未启用） */
  qualifierMet: boolean | null;
  qualifierActual: number;
  qualifierTask: number;
  /** 呆滞配件返利 */
  serviceYears: number | null;
  rebateRatio: number;
  rebateAmount: number;
  /** 返利门槛口径：年度任务 / 季度任务（无年度列时）/ 无任务 */
  rebateBasis: 'annual' | 'quarterly' | 'none';
  rebateQualified: boolean;
  /** 提货激励 + 呆滞配件返利 */
  providerTotal: number;
  warrantyActual: number;
  warrantyTask: number;
  warrantyRate: number;
  warrantyRatio: number;
  warrantyDiscount: number;
  /** 第 8 步：服务商最终延保激励 */
  warrantyIncentive: number;
  leaderRatio: number;
  /** 第 8 步：负责人激励 */
  leaderIncentive: number;
}

export interface ManagerIncentive {
  manager: string;
  auxActual: number;
  auxTask: number;
  auxRate: number;
  auxRatio: number;
  /** 辅材提成（准确口径，打折 / 系数前）；= auxCommission，旧字段名保留 */
  auxIncentive: number;
  auxCommission: number;
  auxCommissionAdvance: number;
  /**
   * 折后辅材提成 = auxCommission × 折扣 × 绩效系数（预发同理）。客户「打印」表的「预发 / 准确辅材销售提成激励」
   * 就是这个口径，之前只出折扣 / 系数前的值，同名列对不上（2026-09-03 审查 P2-7）。
   */
  auxCommissionNet: number;
  auxCommissionAdvanceNet: number;
  auxBase: number;
  warrantyActual: number;
  warrantyTask: number;
  warrantyRate: number;
  warrantyBase: number;
  warrantyCommission: number;
  warrantyCommissionAdvance: number;
  /** 系数后延保提成 = warrantyCommission × 绩效系数（延保提成不打折；预发同理） */
  warrantyCommissionNet: number;
  warrantyCommissionAdvanceNet: number;
  /** 基础激励合计（季度封顶后） */
  baseTotal: number;
  grade: string;
  coefficient: number;
  /** 第 6 步：打折系数（只作用于辅材提成） */
  discount: number;
  /** 预发口径合计（基础 + 预发提成 × 折扣 × 系数） */
  advanceTotal: number;
  /** 第 7 步：区域经理最终激励（准确口径） */
  finalIncentive: number;
}

export interface IncentiveResult {
  providers: ProviderIncentive[];
  managers: ManagerIncentive[];
  totals: { auxInitial: number; rebateAmount: number; providerTotal: number; warrantyIncentive: number; leaderIncentive: number; managerFinal: number; managerAdvance: number };
  warnings: string[];
}

export interface IncentiveExtras {
  /** 区域经理 → 绩效等级（S / A / B+ / B / C） */
  grades?: Record<string, string>;
  /** 服务商 → 引入日期（任意可解析格式 / Excel 序列号） */
  introducedAt?: Record<string, string>;
  /** 服务商 → 已算好的服务年限（优先于 introducedAt） */
  serviceYears?: Record<string, number>;
  /** 算服务年限截止日用 */
  quarter?: QuarterRange;
  /** 曾用名 → 现名（同 AchievementInput.aliases）：辅材 / 延保 / 引入时间三边按现名对齐 */
  aliases?: Record<string, string>;
}

export function rebateAsOfDate(rules: Pick<MarketingRules, 'rebate'>, quarter?: QuarterRange): string {
  if (!quarter) return normalizeDate(new Date().toISOString().slice(0, 10));
  if (rules.rebate.yearsAsOf === 'quarterEnd') return quarter.end;
  const d = new Date(`${quarter.start}T00:00:00`);
  if (rules.rebate.yearsAsOf === 'lastMonthStart') d.setMonth(d.getMonth() - 1, 1);
  else d.setDate(d.getDate() - 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function computeIncentives(aux: AchievementResult, warranty: AchievementResult | null, rules: MarketingRules, extras: IncentiveExtras = {}): IncentiveResult {
  const warnings: string[] = [];
  const keyFor = (name: string): string => makeAliasResolver(extras.aliases)(name).key;
  const wp = new Map((warranty?.providers || []).map((r) => [keyFor(r.name), r]));
  const wm = new Map((warranty?.managers || []).map((r) => [r.name.replace(/\s+/g, ''), r]));
  const grades = new Map(Object.entries(extras.grades || {}).map(([k, v]) => [k.replace(/\s+/g, ''), normalizeGrade(v)]));
  const yearsByKey = new Map(Object.entries(extras.serviceYears || {}).map(([k, v]) => [keyFor(k), v]));
  const introByKey = new Map(Object.entries(extras.introducedAt || {}).map(([k, v]) => [keyFor(k), v]));
  const asOf = rebateAsOfDate(rules, extras.quarter);
  const tierLeader = rules.warrantyMode === 'ratio' && rules.warrantyTiers.some((t) => t.leaderRatio > 0);
  const missingYears: string[] = [];
  const quarterlyBasis: string[] = [];

  // 服务商：辅材表里的 + 只有延保的
  const providerRows: AchievementRow[] = [...aux.providers];
  for (const w of warranty?.providers || []) {
    // 延保任务表里挂名但任务 0、季度内一单没有的（客户表尾部「安庆市住有商贸」等 6 家）没有任何可核算的数，不入列（同经理 P2-9）
    if (!(w.actual > 0) && !(w.task > 0) && !(w.orders > 0)) continue;
    if (!providerRows.some((p) => keyFor(p.name) === keyFor(w.name))) providerRows.push({ name: w.name, manager: w.manager, actual: 0, task: 0, rate: 0, orders: 0 });
  }
  const providers: ProviderIncentive[] = providerRows.map((p) => {
    const ev = evaluateTiers(p.actual, p.task, rules.auxTiers, { minRate: rules.auxMinRate, missingTaskAsMet: rules.auxMissingTaskAsMet });
    const auxBeforeQualifier = ev.amount;
    let auxNote: string | undefined;
    if (ev.reason === 'no_task' && p.actual > 0) auxNote = i18nT('未制定任务，无激励');
    else if (!(p.task > 0) && p.actual > 0 && rules.auxMissingTaskAsMet) auxNote = i18nT('未制定任务，视同达成按基础档计');
    else if (ev.reason === 'below_min') auxNote = i18nT('达成率未到 {m}，无激励', { m: pctText(rules.auxMinRate, 0) });
    const qualifierTask = p.qualifierTask || 0;
    const qualifierActual = p.qualifierActual || 0;
    const qualifierMet: boolean | null = rules.qualifier.enabled && qualifierTask > 0 ? qualifierActual >= qualifierTask : null;
    const auxInitial = qualifierMet === false ? 0 : auxBeforeQualifier;
    if (qualifierMet === false && auxBeforeQualifier > 0) auxNote = i18nT('{l}未达成季度任务（{a} / {t}），提货激励不发', { l: rules.qualifier.label, a: qualifierActual, t: qualifierTask });

    // 呆滞配件返利
    let serviceYears: number | null = null;
    let rebateRatio = 0;
    let rebateAmount = 0;
    let rebateBasis: ProviderIncentive['rebateBasis'] = 'none';
    let rebateQualified = false;
    if (rules.rebate.enabled) {
      const basisTask = (p.annualTask || 0) > 0 ? p.annualTask! : p.task;
      rebateBasis = (p.annualTask || 0) > 0 ? 'annual' : p.task > 0 ? 'quarterly' : 'none';
      if (rebateBasis === 'quarterly') quarterlyBasis.push(p.name);
      rebateQualified = basisTask > 0 ? p.actual >= basisTask : (rules.auxMissingTaskAsMet && p.actual > 0);
      const key = keyFor(p.name);
      const years = yearsByKey.get(key);
      const intro = introByKey.get(key);
      serviceYears = Number.isFinite(years as number) ? Math.max(0, Math.floor(years as number)) : (intro ? serviceYearsAt(intro, asOf) : null);
      if (rebateQualified) {
        if (serviceYears == null) { if (p.actual > 0) missingYears.push(p.name); }
        else {
          rebateRatio = rebateRatioFor(serviceYears, rules.rebate.tiers);
          rebateAmount = round2(p.actual * rebateRatio);
        }
      }
    }

    // 延保
    const w = wp.get(keyFor(p.name));
    const warrantyActual = w?.actual ?? 0;
    const warrantyTask = w?.task ?? 0;
    const warrantyRate = w?.rate ?? 0;
    const wTier = warrantyTierFor(warrantyRate, rules.warrantyTiers);
    const warrantyRatio = rules.warrantyMode === 'perOrder' ? 0 : wTier.providerRatio;
    let warrantyIncentive = rules.warrantyMode === 'perOrder'
      ? round2((w?.orders ?? 0) * rules.warrantyPerOrder)
      : round2(warrantyActual * wTier.providerRatio);
    const warrantyDiscount = rules.discountProviderWarranty && w && w.task > 0 ? discountFor(warrantyRate, rules.managerDiscountTiers) : 1;
    warrantyIncentive = round2(warrantyIncentive * warrantyDiscount);
    let leaderRatio = 0;
    let leaderIncentive = 0;
    if (tierLeader) {
      leaderRatio = wTier.leaderRatio;
      leaderIncentive = round2(warrantyActual * leaderRatio * warrantyDiscount);
    } else {
      const base = rules.leaderShareBase === 'warranty' ? warrantyIncentive : rules.leaderShareBase === 'aux' ? auxInitial : auxInitial + warrantyIncentive;
      leaderRatio = rules.leaderShareRatio;
      leaderIncentive = round2(base * rules.leaderShareRatio);
    }
    return {
      provider: p.name, manager: p.manager || w?.manager || '',
      auxActual: p.actual, auxTask: p.task, auxRate: p.rate, auxRatio: ev.effectiveRatio, auxInitial, auxBeforeQualifier, auxNote,
      qualifierMet, qualifierActual, qualifierTask,
      serviceYears, rebateRatio, rebateAmount, rebateBasis, rebateQualified,
      providerTotal: round2(auxInitial + rebateAmount),
      warrantyActual, warrantyTask, warrantyRate, warrantyRatio, warrantyDiscount, warrantyIncentive,
      leaderRatio, leaderIncentive,
    };
  });
  if (missingYears.length) warnings.push(i18nT('{n} 家服务商符合呆滞配件返利条件但没有引入时间（服务年限未知，返利按 0 计）：{list}{more}', { n: missingYears.length, list: missingYears.slice(0, 5).join('、'), more: missingYears.length > 5 ? '…' : '' }));
  if (rules.rebate.enabled && quarterlyBasis.length) warnings.push(i18nT('呆滞配件返利门槛按季度任务判定（任务表没有年度任务列），共 {n} 家', { n: quarterlyBasis.length }));

  // 区域经理
  const managerRows: AchievementRow[] = [...aux.managers];
  for (const w of warranty?.managers || []) {
    // 只在延保表出现、且延保任务 0 / 实际 0 的经理没有任何可核算的数，不入列（P2-9）
    if (!(w.actual > 0) && !(w.task > 0) && !(w.orders > 0)) continue;
    if (!managerRows.some((m) => m.name.replace(/\s+/g, '') === w.name.replace(/\s+/g, ''))) managerRows.push({ name: w.name, actual: 0, task: 0, rate: 0, orders: 0 });
  }
  const missingGrade: string[] = [];
  const managers: ManagerIncentive[] = managerRows.map((m) => {
    const auxEv = evaluateTiers(m.actual, m.task, rules.managerTiers, { minRate: rules.managerMinRate });
    const w = wm.get(m.name.replace(/\s+/g, ''));
    const warrantyRate = w?.rate ?? 0;
    const warrantyTask = w?.task ?? 0;
    const warrantyActual = w?.actual ?? 0;
    const warEv = w ? evaluateTiers(warrantyActual, warrantyTask, rules.managerTiers, { minRate: rules.managerMinRate }) : { amount: 0, rate: 0, effectiveRatio: 0 };
    // 延保任务为 0（没有任务、无法判定）不打折：打折是对「没达标」的惩罚，不是对「没数据」的惩罚
    const discount = warranty && w && w.task > 0 ? discountFor(warrantyRate, rules.managerDiscountTiers) : 1;
    const grade = grades.get(m.name.replace(/\s+/g, '')) || '';
    let coefficient = 1;
    if (grade) {
      const c = rules.performanceCoefficients[grade];
      if (c == null) { missingGrade.push(`${m.name}（${grade}）`); } else coefficient = c;
    } else if (extras.grades && Object.keys(extras.grades).length) missingGrade.push(m.name);
    const auxBase = managerBaseFor(m.actual, m.task, rules.managerBase);
    const warrantyBase = w ? managerBaseFor(warrantyActual, warrantyTask, rules.managerBase) : 0;
    const baseRaw = auxBase + warrantyBase;
    const baseTotal = round2(rules.managerBase.quarterMax > 0 ? Math.min(rules.managerBase.quarterMax, baseRaw) : baseRaw);
    const auxCommission = auxEv.amount;
    const warrantyCommission = warEv.amount;
    const auxCommissionAdvance = managerAdvanceFor(m.actual, m.task, rules.managerTiers, rules.managerMinRate, rules.managerAdvanceRatio);
    const warrantyCommissionAdvance = w ? managerAdvanceFor(warrantyActual, warrantyTask, rules.managerTiers, rules.managerMinRate, rules.managerAdvanceRatio) : 0;
    const baseFactor = (rules.managerBase.applyCoefficient ? coefficient : 1) * (rules.managerBase.applyDiscount ? discount : 1);
    const finalIncentive = round2(baseTotal * baseFactor + (auxCommission * discount + warrantyCommission) * coefficient);
    const advanceTotal = round2(baseTotal * baseFactor + (auxCommissionAdvance * discount + warrantyCommissionAdvance) * coefficient);
    return {
      manager: m.name, auxActual: m.actual, auxTask: m.task, auxRate: m.rate, auxRatio: auxEv.effectiveRatio,
      auxIncentive: auxCommission, auxCommission, auxCommissionAdvance,
      auxCommissionNet: round2(auxCommission * discount * coefficient), auxCommissionAdvanceNet: round2(auxCommissionAdvance * discount * coefficient),
      auxBase,
      warrantyActual, warrantyTask, warrantyRate, warrantyBase, warrantyCommission, warrantyCommissionAdvance,
      warrantyCommissionNet: round2(warrantyCommission * coefficient), warrantyCommissionAdvanceNet: round2(warrantyCommissionAdvance * coefficient),
      baseTotal, grade, coefficient, discount, advanceTotal, finalIncentive,
    };
  });
  if (missingGrade.length) warnings.push(i18nT('{n} 位区域经理没有绩效等级或等级不在系数表里（系数按 1 计）：{list}{more}', { n: missingGrade.length, list: missingGrade.slice(0, 5).join('、'), more: missingGrade.length > 5 ? '…' : '' }));

  const sum = (xs: number[]) => round2(xs.reduce((s, x) => s + x, 0));
  const totals = {
    auxInitial: sum(providers.map((p) => p.auxInitial)),
    rebateAmount: sum(providers.map((p) => p.rebateAmount)),
    providerTotal: sum(providers.map((p) => p.providerTotal)),
    warrantyIncentive: sum(providers.map((p) => p.warrantyIncentive)),
    leaderIncentive: sum(providers.map((p) => p.leaderIncentive)),
    managerFinal: sum(managers.map((m) => m.finalIncentive)),
    managerAdvance: sum(managers.map((m) => m.advanceTotal)),
  };
  return { providers, managers, totals, warnings };
}

export const PROVIDER_INCENTIVE_HEADERS = [
  i18nT('服务商'), i18nT('区域经理'), i18nT('辅材实际(元)'), i18nT('辅材季度任务(元)'), i18nT('辅材达成率'), i18nT('辅材激励比例'), i18nT('辅材激励初始金额(元)'),
  i18nT('门槛品类实际'), i18nT('门槛品类任务'), i18nT('门槛是否符合'), i18nT('服务年限'), i18nT('呆滞配件返利比例'), i18nT('呆滞配件返利(元)'), i18nT('服务商合计(元)'), i18nT('说明'),
  i18nT('延保实际'), i18nT('延保任务'), i18nT('延保达成率'), i18nT('延保激励比例'), i18nT('延保激励折扣'), i18nT('服务商最终延保激励(元)'), i18nT('负责人比例'), i18nT('负责人激励金额(元)'),
];
/**
 * 区域经理表列序；与 managerIncentiveRows 一一对应（单测锁列数）。
 * 「(折扣/系数前)」是档位算出来的原始提成，「(折后)」= 原始 × 折扣 × 绩效系数、「(系数后)」= 原始 × 绩效系数 ——
 * 后者才是客户「打印」表「预发 / 准确辅材销售提成激励」「预发 / 准确延保销售提成激励」的口径。
 */
export const MANAGER_INCENTIVE_HEADERS = [
  i18nT('区域经理'), i18nT('辅材实际(元)'), i18nT('辅材季度任务(元)'), i18nT('辅材达成率'), i18nT('延保实际'), i18nT('延保任务'), i18nT('延保达成率'),
  i18nT('绩效等级'), i18nT('绩效系数'), i18nT('辅材基础激励(元)'), i18nT('延保基础激励(元)'), i18nT('打折系数'),
  i18nT('预发辅材提成(折扣/系数前)(元)'), i18nT('预发辅材提成(折后)(元)'), i18nT('预发延保提成(系数前)(元)'), i18nT('预发延保提成(系数后)(元)'), i18nT('预发激励合计(元)'),
  i18nT('准确辅材提成(折扣/系数前)(元)'), i18nT('准确辅材提成(折后)(元)'), i18nT('准确延保提成(系数前)(元)'), i18nT('准确延保提成(系数后)(元)'), i18nT('区域经理最终激励(元)'),
];
const pct = (n: number): string => `${(n * 100).toFixed(2)}%`;
const yesNo = (v: boolean | null): string => (v == null ? i18nT('不涉及') : v ? i18nT('是') : i18nT('否'));

export function providerIncentiveRows(r: IncentiveResult): (string | number)[][] {
  const rows = r.providers.map((p) => [
    p.provider, p.manager, p.auxActual, p.auxTask, pct(p.auxRate), pct(p.auxRatio), p.auxInitial,
    p.qualifierActual, p.qualifierTask, yesNo(p.qualifierMet), p.serviceYears ?? '', pct(p.rebateRatio), p.rebateAmount, p.providerTotal, p.auxNote || '',
    p.warrantyActual, p.warrantyTask, pct(p.warrantyRate), pct(p.warrantyRatio), p.warrantyDiscount, p.warrantyIncentive, pct(p.leaderRatio), p.leaderIncentive,
  ]);
  rows.push([i18nT('合计'), '', round2(r.providers.reduce((s, p) => s + p.auxActual, 0)), round2(r.providers.reduce((s, p) => s + p.auxTask, 0)), '', '', r.totals.auxInitial,
    '', '', '', '', '', r.totals.rebateAmount, r.totals.providerTotal, '',
    '', '', '', '', '', r.totals.warrantyIncentive, '', r.totals.leaderIncentive]);
  return rows;
}

export function managerIncentiveRows(r: IncentiveResult): (string | number)[][] {
  const rows = r.managers.map((m) => [
    m.manager, m.auxActual, m.auxTask, pct(m.auxRate), m.warrantyActual, m.warrantyTask, pct(m.warrantyRate),
    m.grade, m.coefficient, m.auxBase, m.warrantyBase, m.discount,
    m.auxCommissionAdvance, m.auxCommissionAdvanceNet, m.warrantyCommissionAdvance, m.warrantyCommissionAdvanceNet, m.advanceTotal,
    m.auxCommission, m.auxCommissionNet, m.warrantyCommission, m.warrantyCommissionNet, m.finalIncentive,
  ]);
  const sumOf = (pick: (m: ManagerIncentive) => number) => round2(r.managers.reduce((s, m) => s + pick(m), 0));
  rows.push([i18nT('合计'), sumOf((m) => m.auxActual), sumOf((m) => m.auxTask), '',
    sumOf((m) => m.warrantyActual), sumOf((m) => m.warrantyTask), '',
    '', '', sumOf((m) => m.auxBase), sumOf((m) => m.warrantyBase), '',
    '', sumOf((m) => m.auxCommissionAdvanceNet), '', sumOf((m) => m.warrantyCommissionAdvanceNet), r.totals.managerAdvance,
    '', sumOf((m) => m.auxCommissionNet), '', sumOf((m) => m.warrantyCommissionNet), r.totals.managerFinal]);
  return rows;
}

// ── 服务商信息表 ──────────────────────────────────────────────────────────────────

/**
 * 「更名记录 / 别名」格 → 曾用名列表。客户真实写法：「曾用名：桂林春天贸易有限公司」、
 * 「曾用名：①周口市川汇区迅达电器服务中心②周口富能信息科技有限公司」、「曾用名：石峰区恒鑫电器经营部，销售计划调整」
 * （尾巴是备注，切出来当别名也匹配不到任何表，无害）。前缀词放 dataKeywords.json（匹配数据用，不是文案）。
 */
export function parseAliasCell(v: unknown): string[] {
  const s = String(v ?? '').replace(/\r/g, '').trim();
  if (!s) return [];
  const prefixes = (DK.aliasPrefixes as string[]).map((p) => p.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
  const prefixRe = new RegExp(`^(?:${prefixes.join('|')})\\s*[:：]?\\s*`);
  return s
    .split(/[①②③④⑤⑥⑦⑧⑨⑩、;；,，/\n]|(?:^|\s)\d+[.、)）]\s*/)
    .map((part) => part.trim().replace(prefixRe, '').trim())
    .filter((part) => part.length >= 4 && /[一-龥A-Za-z]/.test(part));
}

export interface ProviderInfoData {
  /** 服务商 → 区域经理（归属兜底） */
  manager: Record<string, string>;
  /** 服务商 → 引入日期（呆滞配件返利年限） */
  introducedAt: Record<string, string>;
  /** 曾用名 → 现名 */
  aliases: Record<string, string>;
}

/** 服务商信息表（客户「服务商最新信息」）→ 归属 / 引入时间 / 曾用名。mapping: provider, manager?, introducedAt?, alias? */
export function readProviderInfoTable(table: SheetTable, mapping: Record<string, string>): ProviderInfoData {
  const out: ProviderInfoData = { manager: {}, introducedAt: {}, aliases: {} };
  if (!mapping.provider) return out;
  for (const row of table.rows) {
    const p = (row[mapping.provider] || '').trim();
    if (!p) continue;
    const mg = mapping.manager ? (row[mapping.manager] || '').trim() : '';
    if (mg) out.manager[p] = mg;
    const intro = mapping.introducedAt ? (row[mapping.introducedAt] || '').trim() : '';
    if (intro) out.introducedAt[p] = intro;
    if (mapping.alias) for (const old of parseAliasCell(row[mapping.alias])) if (providerKey(old) !== providerKey(p)) out.aliases[old] = p;
  }
  return out;
}

// ── 负责人信息 ───────────────────────────────────────────────────────────────────

export interface LeaderInfo {
  provider: string;
  name: string;
  idCard: string;
  bankCard: string;
  bankName: string;
  phone?: string;
  /** 来源：邮件 / 企微 / 手工 / 导入 */
  source?: string;
  receivedAt?: string;
  errors: string[];
}

const ID_WEIGHTS = [7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2];
const ID_CHECK = '10X98765432';

export function validateIdCard(id: string): string | null {
  const s = String(id || '').trim().toUpperCase();
  if (!s) return i18nT('身份证号为空');
  if (!/^\d{17}[\dX]$/.test(s)) return i18nT('身份证号应为 18 位（末位可为 X）');
  const y = Number(s.slice(6, 10));
  const m = Number(s.slice(10, 12));
  const d = Number(s.slice(12, 14));
  if (y < 1900 || y > new Date().getFullYear() || m < 1 || m > 12 || d < 1 || d > 31) return i18nT('身份证出生日期不合法');
  let sum = 0;
  for (let i = 0; i < 17; i += 1) sum += Number(s[i]) * ID_WEIGHTS[i];
  if (ID_CHECK[sum % 11] !== s[17]) return i18nT('身份证校验位不正确');
  return null;
}

export function validateBankCard(card: string): string | null {
  const s = String(card || '').replace(/\s+/g, '');
  if (!s) return i18nT('银行卡号为空');
  if (!/^\d{12,19}$/.test(s)) return i18nT('银行卡号应为 12–19 位数字');
  let sum = 0;
  let dbl = false;
  for (let i = s.length - 1; i >= 0; i -= 1) {
    let n = Number(s[i]);
    if (dbl) { n *= 2; if (n > 9) n -= 9; }
    sum += n;
    dbl = !dbl;
  }
  if (sum % 10 !== 0) return i18nT('银行卡号校验不通过（Luhn）');
  return null;
}

export function validatePhone(phone: string | undefined): string | null {
  const s = String(phone || '').replace(/\s+|-/g, '');
  if (!s) return null; // 选填
  if (!/^1[3-9]\d{9}$/.test(s)) return i18nT('手机号格式不正确');
  return null;
}

export function validateLeader(info: Omit<LeaderInfo, 'errors'>): string[] {
  const errors: string[] = [];
  if (!info.name || !/^[一-龥·]{2,12}$|^[A-Za-z .]{2,40}$/.test(info.name.trim())) errors.push(i18nT('姓名缺失或格式不对'));
  const id = validateIdCard(info.idCard);
  if (id) errors.push(id);
  const bank = validateBankCard(info.bankCard);
  if (bank) errors.push(bank);
  if (!info.bankName || info.bankName.trim().length < 2) errors.push(i18nT('开户行缺失'));
  const ph = validatePhone(info.phone);
  if (ph) errors.push(ph);
  return errors;
}

/** 从邮件 / 企微正文里抠负责人信息。抠不到的字段留空，交给校验报错。 */
export function parseLeaderInfoFromText(text: string): Omit<LeaderInfo, 'provider' | 'errors'> {
  const t = String(text || '').replace(/\r/g, '');
  // 标签用正则字面量：它们是匹配回传正文的词，不是界面文案，不能被 i18n 包裹翻译。
  // 按优先级逐条试（而不是一个大 alternation）：正则按「文本里最早出现的位置」命中，
  // "负责人信息如下\n姓名：李四" 会先撞上「负责人」把「信息如下」当成姓名——所以文字类字段
  // 必须带冒号且先试最精确的标签；数字类字段（身份证/卡号/手机）本身格式够硬，冒号可省。
  const pick = (res: RegExp[]): string => {
    for (const re of res) {
      const m = t.match(re);
      if (m && m[1]) return m[1].trim();
    }
    return '';
  };
  const idCard = pick([/(?:身份证号码|身份证号|身份证|证件号码|证件号)\s*[:：]?\s*(\d{17}[\dXx])/]) || (t.match(/\b\d{17}[\dXx]\b/) || [''])[0];
  let bankCard = pick([/(?:银行卡号|银行账号|收款账号|卡号|账号)\s*[:：]?\s*([\d ]{12,25})/]).replace(/\s+/g, '');
  if (!bankCard) {
    const cands = (t.match(/\b\d{12,19}\b/g) || []).filter((c) => c !== idCard.slice(0, c.length) && !validateBankCard(c));
    bankCard = cands[0] || '';
  }
  const name = pick([
    /(?:负责人姓名|姓名)\s*[:：]\s*([一-龥·]{2,12})/,
    /(?:收款人|户名)\s*[:：]\s*([一-龥·]{2,12})/,
    /(?:负责人)\s*[:：]\s*([一-龥·]{2,12})/,
  ]);
  // 开户行整段取到行尾（"中国工商银行北京分行"），懒匹配会在第一个"银行"就停
  const bankName = pick([/(?:开户行|开户银行|开户支行|银行名称)\s*[:：]\s*([一-龥（）()]{2,40})/])
    || (t.match(/([一-龥]{2,30}(?:支行|分行|银行|信用社|农商行|农信社))/) || ['', ''])[1];
  const phone = pick([/(?:手机号码|手机号|手机|联系电话|电话)\s*[:：]?\s*(1[3-9]\d{9})/]) || (t.match(/\b1[3-9]\d{9}\b/) || [''])[0];
  return { name, idCard: idCard.toUpperCase(), bankCard, bankName, phone };
}

/** 从回传的 Excel 里抠负责人信息（一行一人） */
export function parseLeaderInfoFromTable(table: SheetTable): (Omit<LeaderInfo, 'provider' | 'errors'> & { rowIndex: number })[] {
  const cols = {
    name: detectColumn(table.headers, 'name'),
    idCard: detectColumn(table.headers, 'idCard'),
    bankCard: detectColumn(table.headers, 'bankCard'),
    bankName: detectColumn(table.headers, 'bankName'),
    phone: detectColumn(table.headers, 'phone'),
  };
  if (!cols.idCard && !cols.bankCard) return [];
  // 带原始行号回去：过滤掉空行后下标会错位，调用方按 rowIndex 取该行的服务商列（曾把乙的卡号记到甲名下）
  return table.rows.map((r, rowIndex) => ({
    rowIndex,
    name: cols.name ? r[cols.name] : '',
    idCard: (cols.idCard ? r[cols.idCard] : '').toUpperCase(),
    bankCard: (cols.bankCard ? r[cols.bankCard] : '').replace(/\s+/g, ''),
    bankName: cols.bankName ? r[cols.bankName] : '',
    phone: cols.phone ? r[cols.phone] : '',
  })).filter((x) => x.idCard || x.bankCard);
}

// ── 个税申报表 ───────────────────────────────────────────────────────────────────

export interface TaxRow {
  index: number;
  provider: string;
  name: string;
  idCard: string;
  income: number;
  /** 减除费用（≤4000 减 800；>4000 减 20%） */
  deduction: number;
  taxable: number;
  rate: number;
  quickDeduction: number;
  tax: number;
  bankCard: string;
  bankName: string;
}

/** 劳务报酬所得预扣预缴（个人所得税法实施条例 / 国家税务总局公告 2018 年第 61 号） */
export function laborTax(income: number): Pick<TaxRow, 'deduction' | 'taxable' | 'rate' | 'quickDeduction' | 'tax'> {
  const deduction = income <= 4000 ? Math.min(800, income) : round2(income * 0.2);
  const taxable = Math.max(0, round2(income - deduction));
  let rate = 0.2;
  let quickDeduction = 0;
  if (taxable > 50000) { rate = 0.4; quickDeduction = 7000; } else if (taxable > 20000) { rate = 0.3; quickDeduction = 2000; }
  const tax = round2(Math.max(0, taxable * rate - quickDeduction));
  return { deduction, taxable, rate, quickDeduction, tax };
}

export function buildTaxRows(leaders: LeaderInfo[], incentiveByProvider: Record<string, number>): TaxRow[] {
  return leaders
    .filter((l) => !l.errors.length)
    .map((l, i) => {
      const income = round2(incentiveByProvider[l.provider] || 0);
      const t = laborTax(income);
      return { index: i + 1, provider: l.provider, name: l.name, idCard: l.idCard, income, ...t, bankCard: l.bankCard, bankName: l.bankName };
    });
}

export const DEFAULT_TAX_HEADERS = [
  i18nT('序号'), i18nT('姓名'), i18nT('证件类型'), i18nT('证件号码'), i18nT('所属服务商'), i18nT('所得项目'), i18nT('收入额(元)'), i18nT('减除费用(元)'), i18nT('应纳税所得额(元)'),
  i18nT('税率'), i18nT('速算扣除数'), i18nT('应扣缴税额(元)'), i18nT('税后金额(元)'), i18nT('银行卡号'), i18nT('开户行'),
];

export function taxRowsForExport(rows: TaxRow[]): (string | number)[][] {
  const out = rows.map((r) => [
    r.index, r.name, i18nT('居民身份证'), r.idCard, r.provider, i18nT('劳务报酬所得'), r.income, r.deduction, r.taxable,
    `${(r.rate * 100).toFixed(0)}%`, r.quickDeduction, r.tax, round2(r.income - r.tax), r.bankCard, r.bankName,
  ]);
  out.push([i18nT('合计'), '', '', '', '', '', round2(rows.reduce((s, r) => s + r.income, 0)), '', '', '', '', round2(rows.reduce((s, r) => s + r.tax, 0)), round2(rows.reduce((s, r) => s + r.income - r.tax, 0)), '', '']);
  return out;
}

/**
 * 套用户自己的申报模板：按模板表头逐列识别语义，识别到的列填值，其余列留空，表头原样保留。
 * 模板识别不到「证件号码 / 身份证」「收入 / 金额」两列之一时返回 null（交给调用方回落默认表）。
 */
export function fillTaxTemplate(templateHeaders: string[], rows: TaxRow[]): (string | number)[][] | null {
  const norm = (h: string) => h.replace(/\s+/g, '');
  const pickHeader = (patterns: RegExp[]): string => {
    for (const p of patterns) {
      const hit = templateHeaders.find((h) => p.test(norm(h)));
      if (hit) return hit;
    }
    return '';
  };
  const map = {
    index: pickHeader([/^序号$/, /序号/]),
    name: pickHeader([/^姓名$/, /姓名/, /纳税人姓名/]),
    idType: pickHeader([/证件类型/]),
    idCard: pickHeader([/证件号码/, /身份证号/, /证件号/, /身份证/]),
    income: pickHeader([/^收入额/, /收入/, /金额/, /劳务报酬/]),
    item: pickHeader([/所得项目/]),
    deduction: pickHeader([/减除费用/, /费用/]),
    taxable: pickHeader([/应纳税所得额/]),
    rate: pickHeader([/税率/]),
    quick: pickHeader([/速算扣除/]),
    tax: pickHeader([/应纳税额/, /应扣缴税额/, /税额/]),
    bankCard: pickHeader([/银行卡号/, /账号/, /卡号/]),
    bankName: pickHeader([/开户行/, /开户银行/, /银行/]),
    provider: pickHeader([/服务商/, /单位/, /公司/]),
  };
  if (!map.idCard || !map.income) return null;
  return rows.map((r) => templateHeaders.map((h) => {
    switch (h) {
      case map.index: return r.index;
      case map.name: return r.name;
      case map.idType: return i18nT('居民身份证');
      case map.idCard: return r.idCard;
      case map.income: return r.income;
      case map.item: return i18nT('劳务报酬所得');
      case map.deduction: return r.deduction;
      case map.taxable: return r.taxable;
      case map.rate: return `${(r.rate * 100).toFixed(0)}%`;
      case map.quick: return r.quickDeduction;
      case map.tax: return r.tax;
      case map.bankCard: return r.bankCard;
      case map.bankName: return r.bankName;
      case map.provider: return r.provider;
      default: return '';
    }
  }));
}

// ── 呆滞配件退回跟踪 ─────────────────────────────────────────────────────────────

export interface ReturnTrackingRecord {
  provider: string;
  /** 需退回等额呆滞配件金额（= 辅材激励初始金额） */
  amount: number;
  notifiedAt?: string;
  dueDate?: string;
  secondNoticeAt?: string;
  returned?: boolean;
  returnedAt?: string;
  /** 开票通知 / 负责人信息提报通知 */
  invoiceNoticeAt?: string;
  leaderInfoNoticeAt?: string;
  notifyError?: string;
}

export function secondNoticeDue(rec: ReturnTrackingRecord, remindBeforeDays: number, now = Date.now()): boolean {
  if (rec.returned || rec.secondNoticeAt || !rec.dueDate || !rec.notifiedAt) return false;
  const due = Date.parse(rec.dueDate);
  if (!Number.isFinite(due)) return false;
  return now >= due - remindBeforeDays * 24 * 3600 * 1000;
}

export function addDays(dateIso: string, days: number): string {
  const d = new Date(dateIso);
  d.setDate(d.getDate() + days);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}
