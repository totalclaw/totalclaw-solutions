/**
 * 规则与公式引擎（渲染侧演示实现）。
 *
 * 硬约束（需求 P0-16 + 02 号文档第 4.2 节）：
 *   报价卡里**没有任何一个数字是模型直接给的**——每一行都由这里的公式按规则表算出来，
 *   UI 上点 [ƒ] 就能看到「输入 × 公式 = 结果」和规则版本。
 *
 * 后续接主进程真规则表时，只需把 RULE_SET 换成 IPC 拉取的配置，CalcLine 形状不变。
 */
import type { BomRow, CalcLine } from './types';
import { t as i18nT } from '../../i18n';

/** 出厂规则版本。运行时以数据包（主进程 saudiDataPack）下发的 version 为准。 */
export const RULE_VERSION = 'v1.3';

/**
 * 出厂规则表。**运行时不要直接读它** —— 报价一律走 `computePricing(input, rules)`，
 * rules 由数据包给（用户在「数据包」里改完毛利/费率，报价与 [ƒ] 弹层要立刻按新值算）。
 * 这份只作为数据包缺失时的兜底基线。
 */
export const RULE_SET = {
  version: RULE_VERSION,
  /** 国际物流费率：按设备采购额百分比 */
  internationalLogisticsRate: 0.0717,
  /** 本地物流基准费率（SAR / m³） */
  localLogisticsBaseRate: 120,
  /** 各交付地点的距离系数 —— 吉达是基准 1.00，塔布克远且路况差 */
  distanceFactor: { jeddah: 1.0, tabuk: 2.35 } as Record<string, number>,
  /** 现场服务系数（安装调试按地点上浮） */
  onSiteFactor: { jeddah: 1.0, tabuk: 1.28 } as Record<string, number>,
  /** 安装调试单价（SAR / 台设备） */
  installUnitCost: 1250,
  /** 维保准备金：设备额 × 年费率 × 年数 */
  warrantyRatePerYear: 0.0259,
  /** 风险准备金费率（占成本合计） */
  riskRate: 0.0325,
  /** 目标毛利率 */
  targetMargin: 0.18,
  /** 建议报价区间：在底价上浮下限/上限 */
  suggestedRange: { low: 0.12, high: 0.215 },
  /** 金额取整：百位 */
  round: 100,
};

export type RuleSet = typeof RULE_SET;

export function round100(n: number, round = RULE_SET.round): number {
  const step = round > 0 ? round : 1;
  return Math.round(n / step) * step;
}

export function money(n: number, currency = 'SAR'): string {
  return `${currency} ${Math.round(n).toLocaleString('en-US')}`;
}

export function bomTotal(rows: BomRow[]): number {
  return rows.reduce((sum, row) => sum + row.qty * row.unitCost, 0);
}

/** BOM 体积估算：演示用固定折算（每台设备 0.045 m³ + 每 10 台一个包装位）。 */
export function bomVolume(rows: BomRow[]): number {
  const units = rows.reduce((sum, row) => sum + row.qty, 0);
  return Math.round((units * 0.045 + units / 10) * 10) / 10;
}

export interface PricingInput {
  bom: BomRow[];
  /** 交付地点 key，对应 RULE_SET.distanceFactor */
  location: string;
  locationLabel: string;
  /** 保修年数 */
  warrantyYears: number;
  /** 外协成本（由供应/外协卡写回，0 表示无外协） */
  subcontractCost: number;
  /** 项目管理成本，招投标模块用；询价模块传 0 */
  projectManagementCost?: number;
}

export interface PricingResult {
  lines: CalcLine[];
  totalCost: number;
  floorPrice: number;
  range: { low: number; high: number };
}

/**
 * 报价计算：从 BOM 一路算到建议区间，每一步落成 CalcLine（含 inputs 与公式文本）。
 * 改地点 / 改保修年限只影响其中几行——这正是 Proof Switch 要演给客户看的东西。
 */
export function computePricing(input: PricingInput, rules: Partial<RuleSet> = {}): PricingResult {
  const currency = 'SAR' as const;
  // 数据包给什么就按什么算；没给的项回落出厂基线（老存档缺字段也不会 NaN）
  const R: RuleSet = {
    ...RULE_SET,
    ...rules,
    distanceFactor: { ...RULE_SET.distanceFactor, ...(rules.distanceFactor || {}) },
    onSiteFactor: { ...RULE_SET.onSiteFactor, ...(rules.onSiteFactor || {}) },
    suggestedRange: { ...RULE_SET.suggestedRange, ...(rules.suggestedRange || {}) },
  };
  const ruleVersion = R.version || RULE_VERSION;
  const roundBy = (n: number) => round100(n, R.round);
  const equipment = bomTotal(input.bom);
  const volume = bomVolume(input.bom);
  const units = input.bom.reduce((sum, row) => sum + row.qty, 0);
  const distance = R.distanceFactor[input.location] ?? 1;
  const onSite = R.onSiteFactor[input.location] ?? 1;

  const intlLogistics = roundBy(equipment * R.internationalLogisticsRate);
  const localLogistics = roundBy(R.localLogisticsBaseRate * distance * volume);
  const install = roundBy(R.installUnitCost * units * onSite);
  const warranty = roundBy(equipment * R.warrantyRatePerYear * input.warrantyYears);
  const pm = input.projectManagementCost ?? 0;

  const subtotal = equipment + intlLogistics + localLogistics + install + input.subcontractCost + warranty + pm;
  const risk = roundBy(subtotal * R.riskRate);
  const totalCost = subtotal + risk;
  const margin = roundBy(totalCost * R.targetMargin);
  const floorPrice = totalCost + margin;

  const lines: CalcLine[] = [
    {
      key: 'equipment',
      label: i18nT('设备采购'),
      formula: i18nT('Σ(数量 × 单价)'),
      inputs: {
        SKU数: { value: input.bom.length, note: i18nT('来自 BOM') },
        设备台数: { value: units },
      },
      ruleVersion: ruleVersion,
      result: equipment,
      currency,
    },
    {
      key: 'intl_logistics',
      label: i18nT('国际物流'),
      formula: i18nT('设备采购 × 国际物流费率'),
      inputs: {
        设备采购: { value: equipment },
        国际物流费率: { value: R.internationalLogisticsRate, note: i18nT('规则 {ruleVersion}', { ruleVersion }) },
      },
      ruleVersion: ruleVersion,
      result: intlLogistics,
      currency,
      rounding: `ROUND_${R.round}`,
    },
    {
      key: 'local_logistics',
      label: i18nT('本地物流 — {p0}', { p0: input.locationLabel }),
      formula: i18nT('基准费率 × 距离系数 × 体积(m³)'),
      inputs: {
        基准费率: { value: R.localLogisticsBaseRate, note: i18nT('规则 {ruleVersion}', { ruleVersion }) },
        距离系数: { value: distance, note: input.locationLabel },
        '体积(m³)': { value: volume, note: i18nT('来自 BOM') },
      },
      ruleVersion: ruleVersion,
      result: localLogistics,
      currency,
      rounding: `ROUND_${R.round}`,
    },
    {
      key: 'install',
      label: i18nT('安装调试'),
      formula: i18nT('安装单价 × 设备台数 × 现场服务系数'),
      inputs: {
        安装单价: { value: R.installUnitCost, note: i18nT('规则 {ruleVersion}', { ruleVersion }) },
        设备台数: { value: units },
        现场服务系数: { value: onSite, note: input.locationLabel },
      },
      ruleVersion: ruleVersion,
      result: install,
      currency,
      rounding: `ROUND_${R.round}`,
    },
  ];

  if (input.subcontractCost > 0) {
    lines.push({
      key: 'subcontract',
      label: i18nT('外协项'),
      formula: i18nT('外协计划合计（由外协卡写回）'),
      inputs: { 外协项合计: { value: input.subcontractCost, note: i18nT('来自外协计划卡') } },
      ruleVersion: ruleVersion,
      result: input.subcontractCost,
      currency,
    });
  }

  if (pm > 0) {
    lines.push({
      key: 'pm',
      label: i18nT('项目管理'),
      formula: i18nT('项目管理人月 × 人月单价'),
      inputs: { 项目管理合计: { value: pm, note: i18nT('来自能力匹配卡') } },
      ruleVersion: ruleVersion,
      result: pm,
      currency,
    });
  }

  lines.push(
    {
      key: 'warranty',
      label: i18nT('维保准备金（{p0} 年）', { p0: input.warrantyYears }),
      formula: i18nT('设备采购 × 年费率 × 保修年数'),
      inputs: {
        设备采购: { value: equipment },
        年费率: { value: R.warrantyRatePerYear, note: i18nT('规则 {ruleVersion}', { ruleVersion }) },
        保修年数: { value: input.warrantyYears, note: i18nT('来自请求信息卡') },
      },
      ruleVersion: ruleVersion,
      result: warranty,
      currency,
      rounding: `ROUND_${R.round}`,
    },
    {
      key: 'risk',
      label: i18nT('风险准备金'),
      formula: i18nT('（以上各项合计）× 风险费率'),
      inputs: {
        各项合计: { value: subtotal },
        风险费率: { value: R.riskRate, note: i18nT('规则 {ruleVersion}', { ruleVersion }) },
      },
      ruleVersion: ruleVersion,
      result: risk,
      currency,
      rounding: `ROUND_${R.round}`,
    },
    {
      key: 'total_cost',
      label: i18nT('成本合计'),
      formula: i18nT('以上各项相加'),
      inputs: { 各项合计: { value: subtotal }, 风险准备金: { value: risk } },
      ruleVersion: ruleVersion,
      result: totalCost,
      currency,
      emphasis: 'total',
    },
    {
      key: 'margin',
      label: i18nT('目标毛利 {p0}%', { p0: (R.targetMargin * 100).toFixed(0) }),
      formula: i18nT('成本合计 × 目标毛利率'),
      inputs: {
        成本合计: { value: totalCost },
        目标毛利率: { value: R.targetMargin, note: i18nT('规则 {ruleVersion}', { ruleVersion }) },
      },
      ruleVersion: ruleVersion,
      result: margin,
      currency,
      rounding: `ROUND_${R.round}`,
    },
    {
      key: 'floor_price',
      label: i18nT('底价'),
      formula: i18nT('成本合计 + 目标毛利'),
      inputs: { 成本合计: { value: totalCost }, 目标毛利: { value: margin } },
      ruleVersion: ruleVersion,
      result: floorPrice,
      currency,
      emphasis: 'floor',
    },
  );

  return {
    lines,
    totalCost,
    floorPrice,
    range: {
      low: roundBy(floorPrice * (1 + R.suggestedRange.low)),
      high: roundBy(floorPrice * (1 + R.suggestedRange.high)),
    },
  };
}
