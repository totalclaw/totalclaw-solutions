/**
 * 数据包：把原本写死在代码里的产品目录、成本规则表、历史报价变成**可配置**的一份数据。
 *
 * 需求 D1-01~06 / D2-01~08 要的就是这个：演示前要能按客户情况改产品、改费率、改毛利，
 * 而不是让人改源码重新打包。三条硬要求：
 *   1. **规则改动必须带版本号** —— 报价卡每个 [ƒ] 弹层都显示"按规则 vX.Y 算"，
 *      改完不 bump 版本，事后对账根本分不清这个数字是按哪版算的；
 *   2. **改动写审计** —— 谁在什么时候把毛利从 18% 改成 16%，必须查得到；
 *   3. **一键恢复出厂** —— 演示前一晚被改乱了要能立刻还原。
 */
import { EventEmitter } from 'events';
import { existsSync, mkdirSync, readFileSync, renameSync, writeFileSync } from 'fs';
import { join } from 'path';
import { t as i18nT } from '@totalclaw/i18n';
import type { IntakeLogger } from './intakeService';

export interface SaudiRuleSet {
  /** 国际物流费率（占设备采购额） */
  internationalLogisticsRate: number;
  /** 本地物流基准费率（SAR / m³） */
  localLogisticsBaseRate: number;
  /** 交付地点 → 距离系数 */
  distanceFactor: Record<string, number>;
  /** 交付地点 → 现场服务系数 */
  onSiteFactor: Record<string, number>;
  /** 安装调试单价（SAR / 台） */
  installUnitCost: number;
  /** 维保准备金年费率 */
  warrantyRatePerYear: number;
  /** 风险准备金费率 */
  riskRate: number;
  /** 目标毛利率 */
  targetMargin: number;
  /** 建议报价区间在底价上的上浮下限 / 上限 */
  suggestedRange: { low: number; high: number };
  /** 金额取整位（100 = 百位） */
  round: number;
}

export interface SaudiProductRow {
  sku: string;
  description: string;
  unitCost: number;
  unit: string;
  leadTime: string;
  stock: string;
  stockShort?: boolean;
  /** 可替代型号的 SKU（供应卡的"建议替代"用） */
  alternateSku?: string;
}

/**
 * Bid/No-Bid 决策权重（需求 D2-17）。
 * 顺序即优先级：**硬性门槛永远排在评分之前**，这里只配"评分那一层"的权重。
 * 权重和不强制等于 100 —— 客户按自己口径调，界面显示实际合计让人自己判断。
 */
export interface SaudiDecisionWeight {
  key: string;
  label: string;
  weight: number;
}

export interface SaudiBenchmarkRow {
  name: string;
  scope: string;
  total: string;
  margin: string;
  result: string;
}

export interface SaudiDataPack {
  /** 规则版本号：任何一次保存都会 bump，报价卡与审计都引用它 */
  version: string;
  updatedAt: string;
  updatedBy?: string;
  rules: SaudiRuleSet;
  products: SaudiProductRow[];
  benchmarks: SaudiBenchmarkRow[];
  /** 决策评分权重表（招投标模块用） */
  decisionWeights: SaudiDecisionWeight[];
}

/** 出厂默认值 —— 与 renderer/workbenches/saudi/calc.ts 的基线一致。 */
export const DEFAULT_DATA_PACK: SaudiDataPack = {
  version: 'v1.3',
  updatedAt: '',
  rules: {
    internationalLogisticsRate: 0.0717,
    localLogisticsBaseRate: 120,
    distanceFactor: { jeddah: 1.0, tabuk: 2.35, dammam: 1.35, riyadh: 1.6 },
    onSiteFactor: { jeddah: 1.0, tabuk: 1.28, dammam: 1.1, riyadh: 1.15 },
    installUnitCost: 1250,
    warrantyRatePerYear: 0.0259,
    riskRate: 0.0325,
    targetMargin: 0.18,
    suggestedRange: { low: 0.12, high: 0.215 },
    round: 100,
  },
  products: [
    { sku: 'IPC-4K-BLT-30', description: i18nT('室外筒机 4K / 30m 红外 / IP67'), unitCost: 7450, unit: i18nT('台'), leadTime: i18nT('2 周'), stock: i18nT('充足') },
    { sku: 'IPC-4K-BLT-50', description: i18nT('室外筒机 4K / 50m 红外 / IP67（红外加强）'), unitCost: 8090, unit: i18nT('台'), leadTime: i18nT('3 周'), stock: i18nT('充足') },
    { sku: 'SW-POE-24-370', description: i18nT('24 口 PoE 交换机 370W'), unitCost: 9800, unit: i18nT('台'), leadTime: i18nT('4 周'), stock: i18nT('不足（现货 2）'), stockShort: true, alternateSku: 'SW-POE-24-400A' },
    { sku: 'SW-POE-24-400A', description: i18nT('24 口 PoE 交换机 400W（替代型号，现货）'), unitCost: 10650, unit: i18nT('台'), leadTime: i18nT('1 周'), stock: i18nT('充足') },
    { sku: 'SW-POE-48-740', description: i18nT('48 口 PoE 交换机 740W'), unitCost: 16400, unit: i18nT('台'), leadTime: i18nT('5 周'), stock: i18nT('不足（现货 6）'), stockShort: true },
    { sku: 'NVR-64CH-R5', description: i18nT('64 路 NVR / RAID5'), unitCost: 21500, unit: i18nT('台'), leadTime: i18nT('3 周'), stock: i18nT('充足') },
    { sku: 'NVR-128CH-R6', description: i18nT('128 路 NVR / RAID6'), unitCost: 38900, unit: i18nT('台'), leadTime: i18nT('4 周'), stock: i18nT('充足') },
    { sku: 'HDD-8T-SURV', description: i18nT('8TB 监控级硬盘'), unitCost: 1180, unit: i18nT('块'), leadTime: i18nT('1 周'), stock: i18nT('充足') },
    { sku: 'HDD-16T-SURV', description: i18nT('16TB 监控级硬盘'), unitCost: 2260, unit: i18nT('块'), leadTime: i18nT('2 周'), stock: i18nT('充足') },
    { sku: 'ACC-MNT-OUT', description: i18nT('室外支架与防水盒套件'), unitCost: 320, unit: i18nT('套'), leadTime: i18nT('1 周'), stock: i18nT('充足') },
    { sku: 'FBR-SM-12C', description: i18nT('12 芯单模光缆（含熔接）'), unitCost: 12, unit: i18nT('米'), leadTime: i18nT('3 周'), stock: i18nT('充足') },
  ],
  benchmarks: [
    { name: i18nT('历史 A · 利雅得园区'), scope: i18nT('48 台摄像机 + 4 交换机'), total: 'SAR 742,000', margin: '16.5%', result: i18nT('中标') },
    { name: i18nT('历史 B · 达曼仓储'), scope: i18nT('36 台摄像机'), total: 'SAR 515,000', margin: '19.2%', result: i18nT('未中标') },
    { name: i18nT('历史 C · 吉达港区'), scope: i18nT('72 台摄像机 + 光纤'), total: 'SAR 1,084,000', margin: '17.8%', result: i18nT('中标') },
  ],
  // 需求 D2-17 的原始权重表
  decisionWeights: [
    { key: 'qualification', label: i18nT('资质'), weight: 20 },
    { key: 'technical', label: i18nT('技术 / 产品'), weight: 25 },
    { key: 'delivery', label: i18nT('交付'), weight: 15 },
    { key: 'profit', label: i18nT('利润'), weight: 15 },
    { key: 'history', label: i18nT('历史 / 客户'), weight: 10 },
    { key: 'supply', label: i18nT('外协 / 供应'), weight: 10 },
    { key: 'risk', label: i18nT('综合风险'), weight: 5 },
  ],
};

/** `v1.3` → `v1.4`；解析不出来就退回 v1.1，绝不让版本号停在原地。 */
export function bumpVersion(current: string): string {
  const match = String(current || '').match(/^v?(\d+)\.(\d+)$/);
  if (!match) return 'v1.1';
  return `v${match[1]}.${Number(match[2]) + 1}`;
}

/** 与默认值深合并：老存档缺字段时补齐，不会因为加了新规则项就读不出来。 */
export function mergeWithDefaults(raw: any): SaudiDataPack {
  const rules = { ...DEFAULT_DATA_PACK.rules, ...(raw?.rules || {}) };
  rules.distanceFactor = { ...DEFAULT_DATA_PACK.rules.distanceFactor, ...(raw?.rules?.distanceFactor || {}) };
  rules.onSiteFactor = { ...DEFAULT_DATA_PACK.rules.onSiteFactor, ...(raw?.rules?.onSiteFactor || {}) };
  rules.suggestedRange = { ...DEFAULT_DATA_PACK.rules.suggestedRange, ...(raw?.rules?.suggestedRange || {}) };
  return {
    version: String(raw?.version || DEFAULT_DATA_PACK.version),
    updatedAt: String(raw?.updatedAt || ''),
    updatedBy: raw?.updatedBy ? String(raw.updatedBy) : undefined,
    rules,
    // 默认目录也要走一遍归一化：否则默认项缺 stockShort 键、保存时被补成 false，
    // JSON 一比就"变了" → 第一次保存必然白 bump 一次版本、审计里多一条假改动。
    products: Array.isArray(raw?.products) && raw.products.length
      ? raw.products.map(normalizeProduct)
      : DEFAULT_DATA_PACK.products.map(normalizeProduct),
    benchmarks: Array.isArray(raw?.benchmarks) && raw.benchmarks.length
      ? raw.benchmarks.map((b: any) => ({
          name: String(b?.name ?? ''), scope: String(b?.scope ?? ''),
          total: String(b?.total ?? ''), margin: String(b?.margin ?? ''), result: String(b?.result ?? ''),
        }))
      : DEFAULT_DATA_PACK.benchmarks.map((b) => ({ ...b })),
    decisionWeights: Array.isArray(raw?.decisionWeights) && raw.decisionWeights.length
      ? raw.decisionWeights.map((w: any) => ({
          key: String(w?.key ?? '').trim(),
          label: String(w?.label ?? '').trim(),
          weight: Number.isFinite(Number(w?.weight)) ? Number(w.weight) : 0,
        })).filter((w: SaudiDecisionWeight) => w.key)
      : DEFAULT_DATA_PACK.decisionWeights.map((w) => ({ ...w })),
  };
}

function normalizeProduct(raw: any): SaudiProductRow {
  const unitCost = Number(raw?.unitCost);
  return {
    sku: String(raw?.sku ?? '').trim(),
    description: String(raw?.description ?? '').trim(),
    unitCost: Number.isFinite(unitCost) ? unitCost : 0,
    unit: String(raw?.unit ?? i18nT('台')).trim() || i18nT('台'),
    leadTime: String(raw?.leadTime ?? '').trim(),
    stock: String(raw?.stock ?? '').trim(),
    stockShort: !!raw?.stockShort,
    alternateSku: raw?.alternateSku ? String(raw.alternateSku).trim() : undefined,
  };
}

/**
 * 从 Excel/CSV 的二维网格导入产品目录。
 *
 * 认表头而不是认列序 —— 客户的产品表列顺序千奇百怪，按位置读必错。
 * 表头认不出来时返回明确错误，不去猜（猜错会把单价读成交期，报价直接失真）。
 */
export function productsFromGrid(grid: string[][]): { products: SaudiProductRow[]; error?: string } {
  if (!grid?.length) return { products: [], error: i18nT('表格是空的') };
  const headerRow = grid.findIndex((row) => row.some((cell) => /sku|型号|物料/i.test(String(cell || ''))));
  if (headerRow < 0) {
    return { products: [], error: i18nT('没找到表头：至少要有一列叫 SKU / 型号 / 物料编码') };
  }
  const header = grid[headerRow].map((c) => String(c || '').trim().toLowerCase());
  const col = (...names: string[]) => header.findIndex((h) => names.some((n) => h.includes(n)));
  const idx = {
    sku: col('sku', i18nT('型号'), i18nT('物料')),
    description: col(i18nT('描述'), i18nT('名称'), 'desc', 'name'),
    unitCost: col(i18nT('单价'), i18nT('采购价'), 'cost', 'price'),
    unit: col(i18nT('单位'), 'unit'),
    leadTime: col(i18nT('交期'), 'lead'),
    stock: col(i18nT('库存'), 'stock'),
  };
  if (idx.sku < 0 || idx.unitCost < 0) {
    return { products: [], error: i18nT('表头缺少 SKU 或单价列，无法导入') };
  }

  const products: SaudiProductRow[] = [];
  for (const row of grid.slice(headerRow + 1)) {
    const sku = String(row[idx.sku] ?? '').trim();
    if (!sku) continue;
    const rawCost = String(row[idx.unitCost] ?? '').replace(/[^\d.]/g, '');
    const stock = idx.stock >= 0 ? String(row[idx.stock] ?? '').trim() : '';
    products.push(normalizeProduct({
      sku,
      description: idx.description >= 0 ? row[idx.description] : '',
      unitCost: Number(rawCost),
      unit: idx.unit >= 0 ? row[idx.unit] : i18nT('台'),
      leadTime: idx.leadTime >= 0 ? row[idx.leadTime] : '',
      stock,
      // 库存列里出现"不足/缺货/0"就标缺货，供应卡据此触发替代建议
      stockShort: /不足|缺货|short|^0$/i.test(stock),
    }));
  }
  if (!products.length) return { products: [], error: i18nT('表头认出来了，但没有任何有效数据行') };
  return { products };
}

export interface SaudiDataPackOptions {
  totalclawHome: string;
  logger?: IntakeLogger;
}

export class SaudiDataPackStore extends EventEmitter {
  private readonly filePath: string;
  private readonly logger?: IntakeLogger;
  private pack: SaudiDataPack;

  constructor(options: SaudiDataPackOptions) {
    super();
    const dir = join(options.totalclawHome, 'saudi');
    if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
    this.filePath = join(dir, 'data-pack.json');
    this.logger = options.logger;
    this.pack = this.load();
  }

  private load(): SaudiDataPack {
    if (!existsSync(this.filePath)) return mergeWithDefaults(null);
    try {
      return mergeWithDefaults(JSON.parse(readFileSync(this.filePath, 'utf-8')));
    } catch (error) {
      this.logger?.warn(i18nT('[数据包] 存档损坏，已回落出厂默认'), { detail: (error as Error)?.message });
      return mergeWithDefaults(null);
    }
  }

  get(): SaudiDataPack {
    return JSON.parse(JSON.stringify(this.pack));
  }

  /**
   * 保存。**规则或产品有实质变化时才 bump 版本**——纯粹重开弹层点保存不该把版本号刷高，
   * 否则版本号很快变得毫无意义，审计里也全是噪音。
   */
  save(next: Partial<SaudiDataPack>, actor?: string): { pack: SaudiDataPack; changed: boolean; changes: string[] } {
    const merged = mergeWithDefaults({ ...this.pack, ...next });
    const changes = diffPack(this.pack, merged);
    if (!changes.length) return { pack: this.get(), changed: false, changes: [] };

    merged.version = bumpVersion(this.pack.version);
    merged.updatedAt = new Date().toISOString();
    merged.updatedBy = actor || this.pack.updatedBy;
    this.pack = merged;
    this.persist();
    this.emit('changed', { version: merged.version, changes });
    return { pack: this.get(), changed: true, changes };
  }

  /** 恢复出厂：演示前一晚被改乱了要能立刻还原。 */
  reset(actor?: string): SaudiDataPack {
    const previous = this.pack.version;
    this.pack = mergeWithDefaults(null);
    this.pack.version = bumpVersion(previous);
    this.pack.updatedAt = new Date().toISOString();
    this.pack.updatedBy = actor;
    this.persist();
    this.emit('changed', { version: this.pack.version, changes: [i18nT('恢复出厂数据包')] });
    return this.get();
  }

  private persist(): void {
    try {
      writeFileSync(`${this.filePath}.part`, JSON.stringify(this.pack, null, 2), 'utf-8');
      renameSync(`${this.filePath}.part`, this.filePath);
    } catch (error) {
      this.logger?.error(i18nT('[数据包] 写入失败'), { detail: (error as Error)?.message });
    }
  }
}

/** 逐项比较，产出人类可读的改动清单（直接进审计）。 */
export function diffPack(before: SaudiDataPack, after: SaudiDataPack): string[] {
  const out: string[] = [];
  const ruleLabels: Record<keyof SaudiRuleSet, string> = {
    internationalLogisticsRate: i18nT('国际物流费率'),
    localLogisticsBaseRate: i18nT('本地物流基准费率'),
    distanceFactor: i18nT('距离系数'),
    onSiteFactor: i18nT('现场服务系数'),
    installUnitCost: i18nT('安装调试单价'),
    warrantyRatePerYear: i18nT('维保年费率'),
    riskRate: i18nT('风险准备金费率'),
    targetMargin: i18nT('目标毛利率'),
    suggestedRange: i18nT('建议报价区间'),
    round: i18nT('金额取整位'),
  };
  for (const key of Object.keys(ruleLabels) as (keyof SaudiRuleSet)[]) {
    const a = JSON.stringify(before.rules[key]);
    const b = JSON.stringify(after.rules[key]);
    if (a !== b) out.push(`${ruleLabels[key]}：${a} → ${b}`);
  }
  if (JSON.stringify(before.products) !== JSON.stringify(after.products)) {
    out.push(i18nT('产品目录：{p0} 条 → {p1} 条', { p0: before.products.length, p1: after.products.length }));
  }
  if (JSON.stringify(before.benchmarks) !== JSON.stringify(after.benchmarks)) {
    out.push(i18nT('历史报价：{p0} 条 → {p1} 条', { p0: before.benchmarks.length, p1: after.benchmarks.length }));
  }
  // 权重逐项比：改了哪一档、从几分改到几分，审计里要看得出来
  for (const weight of after.decisionWeights) {
    const previous = before.decisionWeights.find((w) => w.key === weight.key);
    if (!previous) { out.push(i18nT('决策权重新增：{p0} {p1}', { p0: weight.label, p1: weight.weight })); continue; }
    if (previous.weight !== weight.weight) {
      out.push(`${i18nT('决策权重')} · ${weight.label}：${previous.weight} → ${weight.weight}`);
    }
  }
  for (const previous of before.decisionWeights) {
    if (!after.decisionWeights.some((w) => w.key === previous.key)) {
      out.push(i18nT('决策权重移除：{p0}', { p0: previous.label }));
    }
  }
  return out;
}
