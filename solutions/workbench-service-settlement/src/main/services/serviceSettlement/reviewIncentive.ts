/**
 * 模块一 · 服务电商好评激励核算（京东安装 + 京东售后 + 天猫好评）。
 *
 * 政策规则（需求文档原文）：
 *   - 京东安装：用户五星好评获激励；安装差评率 X、安装评价率 Y 取自营与 POP 合并计算，
 *     部分 SKU 可评价但不计取数，以京东导出数据为准。
 *       X > 0.6%  → 基础激励 5 元；X ≤ 0.6% → 10 元
 *       Y < 50% → 系数 1；50% ≤ Y < 60% → 1.2；Y ≥ 60% → 1.5
 *     ① 京东安装好评激励 = 有效好评单数 × 基础激励金额 × 评价率激励系数
 *   - 京东售后：维修工单「非常满意 / 满意」每单 10 元  → ② = (非常满意 + 满意) × 10
 *   - 天猫：好评每单 5 元                                → ③ = 天猫好评单数 × 5
 *   本项总激励 = ① + ② + ③
 *
 * 这里是纯计算，不碰文件系统；输入是 excel.ts 读出来的表 + 用户确认过的列映射。
 */
import { canonicalProvider, toBadFlag, toBool, toCounted, toNumber, toStars, type SheetTable } from './excel';
import { t as i18nT } from '@totalclaw/i18n';

export interface CoefTier {
  /** 评价率下限（含），小数：0.5 = 50% */
  minRate: number;
  coef: number;
}

export interface ReviewIncentiveRules {
  /** 差评率阈值，小数：0.006 = 0.6% */
  badRateThreshold: number;
  /** X > 阈值 时的基础激励 */
  baseAmountAboveThreshold: number;
  /** X ≤ 阈值 时的基础激励 */
  baseAmountWithinThreshold: number;
  /** 评价率系数阶梯（按 minRate 升序） */
  coefTiers: CoefTier[];
  /** 售后「非常满意/满意」每单激励 */
  afterSalesPerOrder: number;
  /** 天猫好评每单激励 */
  tmallPerOrder: number;
  /** 几星算有效好评（默认 5） */
  goodStarsMin: number;
  /** 几星及以下算差评（默认 1：京东口径 1 星=差评、2–3 星=中评、4–5 星=好评；天猫口径可在界面改成 2） */
  badStarsMax: number;
  /** 差评率分母：'rated' = 已评价单数；'evaluable' = 可评价单数 */
  badRateDenominator: 'rated' | 'evaluable';
}

export const DEFAULT_REVIEW_RULES: ReviewIncentiveRules = {
  badRateThreshold: 0.006,
  baseAmountAboveThreshold: 5,
  baseAmountWithinThreshold: 10,
  coefTiers: [
    { minRate: 0, coef: 1 },
    { minRate: 0.5, coef: 1.2 },
    { minRate: 0.6, coef: 1.5 },
  ],
  afterSalesPerOrder: 10,
  tmallPerOrder: 5,
  goodStarsMin: 5,
  badStarsMax: 1,
  badRateDenominator: 'rated',
};

/** 一份导出表 + 它的列映射。同类表可以多份（京东自营 + POP） */
export interface MappedTable {
  table: SheetTable;
  /** 角色 → 列名；'' 表示该角色没有对应列 */
  mapping: Record<string, string>;
}

export interface ReviewIncentiveInput {
  jdInstall: MappedTable[];
  jdAfterSales: MappedTable[];
  tmall: MappedTable[];
  /** 服务商别名 → 主体名（归一名），来自通讯录「别名」列；改过名的同一家并成一家算 */
  aliases?: Record<string, string> | null;
  /**
   * 可评价单数表（可选）：mapping provider + evaluableCount。京东安装评价明细导出只含**已评价**工单
   * （2026-09-03 客户数据 18113 行评价时间全有值），没有它评价率 Y 恒 100%、系数全给最高档。
   * 给了就按这张表的可评价单数算 Y（同一服务商多行累加）。
   */
  evaluableCounts?: MappedTable[];
  rules?: Partial<ReviewIncentiveRules>;
}

export interface ProviderReviewResult {
  provider: string;
  /** 京东安装 */
  evaluableOrders: number;
  ratedOrders: number;
  goodOrders: number;
  badOrders: number;
  /** 不计取的行数（仅提示用） */
  excludedOrders: number;
  rateY: number;
  /**
   * 评价率是否可知：京东导出只含已评价工单时算不出 Y（不是 100%），此时 false、系数取最低档，
   * 结果表里显示「—」。给了可评价单数表或评价率列则为 true。
   */
  rateYKnown: boolean;
  /**
   * 中好评价量（= 非差评的已评价单，客户口径「中好评价 = 非差评」，2026-09-09 黄丽清确认）：
   * 评价率 Y = 中好评价量 / 完工总单量。与「有效好评」的差别是含「是否好评激励 = /」的非差评单。
   */
  midGoodOrders: number;
  /** Y 的来源：css = 完工总单量表算的；detail = 评价明细自带「是否可评价」列算的；report = 平台评价率列直接给的；unknown = 没有分母 */
  rateYSource: 'css' | 'detail' | 'report' | 'unknown';
  /** 完工总单量是否真的知道（完工表给了数，或明细自带可评价列）；false 时 evaluableOrders 只是 = 已评价数 */
  completedKnown: boolean;
  /** X 的来源：detail = 从评价明细算（差评 / 已评价）；report = 平台差评率列直接给的 */
  badRateXSource: 'detail' | 'report';
  badRateX: number;
  baseAmount: number;
  coef: number;
  installIncentive: number;
  /** 京东售后 */
  afterSalesSatisfied: number;
  afterSalesIncentive: number;
  /** 天猫 */
  tmallGood: number;
  tmallIncentive: number;
  total: number;
}

export interface ReviewIncentiveResult {
  rules: ReviewIncentiveRules;
  providers: ProviderReviewResult[];
  totals: {
    providerCount: number;
    installIncentive: number;
    afterSalesIncentive: number;
    tmallIncentive: number;
    total: number;
    evaluableOrders: number;
    ratedOrders: number;
    goodOrders: number;
    badOrders: number;
  };
  /** 解析时的提示（没找到服务商列、未识别评价等），界面按警告展示 */
  warnings: string[];
}

export function mergeRules(partial?: Partial<ReviewIncentiveRules>): ReviewIncentiveRules {
  const rules = { ...DEFAULT_REVIEW_RULES, ...(partial || {}) };
  rules.coefTiers = [...(rules.coefTiers || DEFAULT_REVIEW_RULES.coefTiers)]
    .filter((t) => Number.isFinite(t.minRate) && Number.isFinite(t.coef))
    .sort((a, b) => a.minRate - b.minRate);
  if (!rules.coefTiers.length) rules.coefTiers = [...DEFAULT_REVIEW_RULES.coefTiers];
  return rules;
}

export function baseAmountFor(badRateX: number, rules: ReviewIncentiveRules): number {
  return badRateX > rules.badRateThreshold ? rules.baseAmountAboveThreshold : rules.baseAmountWithinThreshold;
}

export function coefFor(rateY: number, rules: ReviewIncentiveRules): number {
  let coef = rules.coefTiers[0]?.coef ?? 1;
  for (const tier of rules.coefTiers) {
    if (rateY >= tier.minRate) coef = tier.coef;
  }
  return coef;
}

const round2 = (n: number): number => Math.round(n * 100) / 100;

function providerName(row: Record<string, string>, col: string, aliases?: Record<string, string> | null): string {
  return canonicalProvider(row[col], aliases);
}

interface InstallAcc {
  evaluable: number; rated: number; good: number; bad: number; excluded: number;
}

export function computeReviewIncentive(input: ReviewIncentiveInput): ReviewIncentiveResult {
  const rules = mergeRules(input.rules);
  const warnings: string[] = [];
  const install = new Map<string, InstallAcc>();
  const afterSales = new Map<string, number>();
  const tmall = new Map<string, number>();
  const ensureInstall = (p: string): InstallAcc => {
    let acc = install.get(p);
    if (!acc) { acc = { evaluable: 0, rated: 0, good: 0, bad: 0, excluded: 0 }; install.set(p, acc); }
    return acc;
  };
  const touch = (p: string): void => {
    ensureInstall(p);
    if (!afterSales.has(p)) afterSales.set(p, 0);
    if (!tmall.has(p)) tmall.set(p, 0);
  };

  // ── 京东安装 ──
  for (const src of input.jdInstall) {
    const m = src.mapping;
    if (!m.provider) { warnings.push(i18nT('{p0}：未指定服务商列，已跳过', { p0: src.table.fileName })); continue; }
    if (!m.rating && !m.rated && !m.badFlag) warnings.push(i18nT('{p0}：未指定评价星级列，无法判断好评/差评', { p0: src.table.fileName }));
    let unnamed = 0;
    for (const row of src.table.rows) {
      const p = providerName(row, m.provider, input.aliases);
      if (!p) { unnamed += 1; continue; }
      touch(p);
      const acc = ensureInstall(p);
      // 「是否好评激励」= / 的行（差评单、不计取的 SKU）：**不拿激励，但仍是已评价工单** ——
      // 差评率 X、评价率 Y 的分子分母都要算上它。之前这里直接 continue，把 61 条差评全部丢掉，
      // 所有服务商 X 恒为 0 → 一律按 10 元基础，客户按 5 元的 27 家全部多算（2026-09-07 客户对账实报）。
      const counted = m.counted ? toCounted(row[m.counted]) : undefined;
      const notCounted = counted === false;
      if (notCounted) acc.excluded += 1;
      const evaluable = m.evaluable ? toBool(row[m.evaluable]) : undefined;
      if (evaluable === false) continue;
      acc.evaluable += 1;
      const stars = m.rating ? toStars(row[m.rating]) : null;
      // 「是否差评」布尔列（京东安装真实导出无星级列，只有 差评/非差评 —— 2026-08-31
      // 灌真实数据补的 schema 缺口）：有它时每行即一条已评价记录，差评/好评按它判。
      const badFlag = m.badFlag ? toBadFlag(row[m.badFlag]) : undefined;
      let rated: boolean;
      if (m.rated) {
        const flag = toBool(row[m.rated]);
        rated = flag === undefined ? (stars != null || badFlag !== undefined) : flag;
      } else {
        rated = stars != null || badFlag !== undefined;
      }
      if (!rated) continue;
      acc.rated += 1;
      if (badFlag !== undefined) {
        if (badFlag) acc.bad += 1; else if (!notCounted) acc.good += 1;
      } else {
        if (stars != null && stars >= rules.goodStarsMin && !notCounted) acc.good += 1;
        if (stars != null && stars <= rules.badStarsMax) acc.bad += 1;
      }
    }
    if (unnamed) warnings.push(i18nT('{p0}：{unnamed} 行服务商为空，已忽略', { p0: src.table.fileName, unnamed }));
  }

  // ── 京东售后 ──
  for (const src of input.jdAfterSales) {
    const m = src.mapping;
    if (!m.provider) { warnings.push(i18nT('{p0}：未指定服务商列，已跳过', { p0: src.table.fileName })); continue; }
    const col = m.satisfaction || m.rating;
    if (!col) { warnings.push(i18nT('{p0}：未指定满意度列，已跳过', { p0: src.table.fileName })); continue; }
    for (const row of src.table.rows) {
      const p = providerName(row, m.provider, input.aliases);
      if (!p) continue;
      touch(p);
      const v = String(row[col] || '');
      const satisfied = /非常满意|满意/.test(v) && !/不满意|不满/.test(v)
        ? true
        : (toStars(v) ?? 0) >= 4 && !/不满/.test(v);
      if (satisfied) afterSales.set(p, (afterSales.get(p) || 0) + 1);
    }
  }

  // ── 天猫 ──
  for (const src of input.tmall) {
    const m = src.mapping;
    if (!m.provider) { warnings.push(i18nT('{p0}：未指定服务商列，已跳过', { p0: src.table.fileName })); continue; }
    const col = m.rating || m.satisfaction;
    if (!col) { warnings.push(i18nT('{p0}：未指定评价列，已跳过', { p0: src.table.fileName })); continue; }
    for (const row of src.table.rows) {
      const p = providerName(row, m.provider, input.aliases);
      if (!p) continue;
      touch(p);
      const v = String(row[col] || '');
      // 天猫导出也有「是否好评激励」列（好评激励 / /）：标了不计的行不算好评单
      if (m.counted && toCounted(row[m.counted]) === false) continue;
      const good = /好评/.test(v) && !/中评|差评/.test(v) ? true : (toStars(v) ?? 0) >= rules.goodStarsMin;
      if (good) tmall.set(p, (tmall.get(p) || 0) + 1);
    }
  }

  // ── 可评价单数 / 评价率 / 差评率 表（可选）──
  // 京东安装评价明细导出只含已评价工单，从它算不出评价率 Y；客户实际按平台的「评价率 / 差评率」报表
  // 定系数与基础金额（2026-09-03 对客户 7 月好评激励真值：系数按 1 时 110/170 家逐家一致，其余家都是
  // 平台评价率≥50% 拿到 1.2/1.5 或差评率>0.6% 拿到 5 元）。所以：
  //   · 有表：可评价单数 → Y=已评/可评；评价率列 / 差评率列 → 直接覆盖 Y / X
  //   · 没表且每行都已评价：Y 视为未知，系数取最低档（不是按 100% 给最高档），结果表 Y 显示「—」
  const evalKnown = new Set<string>();
  const yOverride = new Map<string, number>();
  const xOverride = new Map<string, number>();
  const pctToRate = (v: unknown): number | undefined => {
    const s = String(v ?? '').trim();
    if (!s) return undefined;
    const n = toNumber(s);
    if (!Number.isFinite(n)) return undefined;
    if (/%/.test(s)) return n; // toNumber 已把 "65%" 化成 0.65
    return n > 1 ? n / 100 : n; // 裸写 65 当百分数，0.65 当小数
  };
  // 明细自带「是否可评价」列 → 分母来自明细本身（来源标 detail，与完工表区分）
  const evalFromDetail = new Set<string>();
  for (const src of input.jdInstall) if (src.mapping.evaluable) for (const row of src.table.rows) { const p = providerName(row, src.mapping.provider, input.aliases); if (p) { evalKnown.add(p); evalFromDetail.add(p); } }
  // 「中好评价量」列（CSS 侧统计的完工中好评价量）：给了就当 Y 的分子，没给用明细的 非差评 数
  const midGoodOverride = new Map<string, number>();
  const countsApplied = new Set<string>();
  if (input.evaluableCounts?.length) {
    const counts = new Map<string, number>();
    for (const src of input.evaluableCounts) {
      const m = src.mapping;
      const col = m.evaluableCount || m.quantity;
      if (!m.provider || !(col || m.rateY || m.badRateX)) { warnings.push(i18nT('{p0}：需要「服务商」加「完工总单量 / 可评价单数」或「评价率 / 差评率」列，已忽略', { p0: src.table.fileName })); continue; }
      for (const row of src.table.rows) {
        const p = providerName(row, m.provider, input.aliases);
        // 平台报表 / CSS 汇总表尾部的「总计」行服务商写 / 或 合计：不是服务商，别当「不在明细中的一家」告警
        if (!p || isPlaceholderProvider(p)) continue;
        if (col) counts.set(p, (counts.get(p) || 0) + toNumber(row[col]));
        if (m.midGoodCount) { const n = toNumber(row[m.midGoodCount]); if (n > 0) midGoodOverride.set(p, (midGoodOverride.get(p) || 0) + n); }
        if (m.rateY) { const y = pctToRate(row[m.rateY]); if (y !== undefined) yOverride.set(p, y); }
        if (m.badRateX) { const x = pctToRate(row[m.badRateX]); if (x !== undefined) xOverride.set(p, x); }
      }
    }
    // 只作用于评价明细里出现过的服务商：可评价表（如全量完工单量表）里多出来的家不能被注入结果表当成 0 元服务商
    let applied = 0;
    const extra = new Set<string>();
    for (const [p, n] of counts) {
      if (n <= 0) continue;
      if (!install.has(p)) { extra.add(p); continue; }
      ensureInstall(p).evaluable = n;
      evalKnown.add(p);
      countsApplied.add(p);
      applied += 1;
    }
    for (const p of [...yOverride.keys(), ...xOverride.keys()]) {
      if (!install.has(p)) { extra.add(p); yOverride.delete(p); xOverride.delete(p); continue; }
      if (yOverride.has(p)) evalKnown.add(p);
    }
    if (extra.size) warnings.push(i18nT('完工总单量 / 评价率表里有 {n} 家不在评价明细中，已忽略：{names}', { n: extra.size, names: [...extra].slice(0, 5).join('、') + (extra.size > 5 ? '…' : '') }));
    const missing = [...install.keys()].filter((p) => !evalKnown.has(p) && (install.get(p)?.rated || 0) > 0);
    if (missing.length) warnings.push(i18nT('{n} 家服务商在完工总单量 / 评价率表里没有记录，评价率按未知处理（系数最低档）：{names}', { n: missing.length, names: missing.slice(0, 5).join('、') + (missing.length > 5 ? '…' : '') }));
    if (applied && yOverride.size) warnings.push(i18nT('评价率：{a} 家按完工总单量算（中好评价 ÷ 完工总单量），{b} 家直接用平台报表的评价率列', { a: [...countsApplied].filter((p) => !yOverride.has(p)).length, b: yOverride.size }));
    else if (applied) warnings.push(i18nT('已按完工总单量算出 {n} 家服务商的评价率（中好评价 ÷ 完工总单量）', { n: applied }));
    else if (yOverride.size) warnings.push(i18nT('已直接采用平台报表的评价率列：{n} 家', { n: yOverride.size }));
    if (xOverride.size) warnings.push(i18nT('已按差评率列覆盖 {n} 家服务商的安装差评率', { n: xOverride.size }));
  } else {
    const allRated = [...install.values()].filter((a) => a.rated > 0).every((a) => a.rated === a.evaluable);
    if (install.size && allRated && !evalKnown.size) {
      warnings.push(i18nT('评价明细里每一行都是已评价工单，算不出评价率 Y：系数按最低档计、结果表 Y 显示「—」。要按真实评价率计算，请在「计算京东安装评价率」一步放 CSS 完工总单量表或平台「评价率 / 差评率」报表'));
    }
  }
  const providers: ProviderReviewResult[] = [];
  for (const [provider, acc] of install) {
    const known = evalKnown.has(provider) || yOverride.has(provider) || acc.rated < acc.evaluable;
    // 客户口径（2026-09-09 确认）：评价率 = 完工中好评价量 / 完工总单量，中好评价 = 非差评。
    // 分子默认取明细里 已评价 − 差评（CSS 给了「中好评价量」列就用它），分母 = 完工总单量 / 可评价单数；
    // 平台报表直接给了评价率列则整个覆盖。
    const midGood = midGoodOverride.has(provider) ? midGoodOverride.get(provider)! : Math.max(0, acc.rated - acc.bad);
    const rateY = yOverride.has(provider) ? yOverride.get(provider)! : (known && acc.evaluable > 0 ? midGood / acc.evaluable : 0);
    const rateYSource: ProviderReviewResult['rateYSource'] = yOverride.has(provider) ? 'report' : (!known ? 'unknown' : (countsApplied.has(provider) ? 'css' : 'detail'));
    const completedKnown = countsApplied.has(provider) || evalFromDetail.has(provider);
    const denom = rules.badRateDenominator === 'evaluable' ? acc.evaluable : acc.rated;
    const badRateX = xOverride.has(provider) ? xOverride.get(provider)! : (denom > 0 ? acc.bad / denom : 0);
    const badRateXSource: ProviderReviewResult['badRateXSource'] = xOverride.has(provider) ? 'report' : 'detail';
    const baseAmount = baseAmountFor(badRateX, rules);
    const coef = coefFor(rateY, rules);
    const installIncentive = round2(acc.good * baseAmount * coef);
    const afterSalesSatisfied = afterSales.get(provider) || 0;
    const afterSalesIncentive = round2(afterSalesSatisfied * rules.afterSalesPerOrder);
    const tmallGood = tmall.get(provider) || 0;
    const tmallIncentive = round2(tmallGood * rules.tmallPerOrder);
    providers.push({
      provider,
      evaluableOrders: acc.evaluable,
      ratedOrders: acc.rated,
      goodOrders: acc.good,
      badOrders: acc.bad,
      excludedOrders: acc.excluded,
      // 保留 6 位小数（0.0001%）：readTable 已把单元格按 6 位截过一次，这里再按 4 位四舍五入会双重舍入
      //（2026-09-09 实测客户 X=0.0027495 显示 0.27%，我们截成 0.00275 → 0.28%），金额不受影响但对账时刺眼
      rateY: Math.round(rateY * 1e6) / 1e6,
      rateYKnown: known,
      midGoodOrders: midGood,
      rateYSource,
      completedKnown,
      badRateXSource,
      badRateX: Math.round(badRateX * 1e6) / 1e6,
      baseAmount,
      coef,
      installIncentive,
      afterSalesSatisfied,
      afterSalesIncentive,
      tmallGood,
      tmallIncentive,
      total: round2(installIncentive + afterSalesIncentive + tmallIncentive),
    });
  }
  providers.sort((a, b) => b.total - a.total || a.provider.localeCompare(b.provider, 'zh-CN'));

  const totals = providers.reduce((t, p) => ({
    providerCount: t.providerCount + 1,
    installIncentive: round2(t.installIncentive + p.installIncentive),
    afterSalesIncentive: round2(t.afterSalesIncentive + p.afterSalesIncentive),
    tmallIncentive: round2(t.tmallIncentive + p.tmallIncentive),
    total: round2(t.total + p.total),
    evaluableOrders: t.evaluableOrders + p.evaluableOrders,
    ratedOrders: t.ratedOrders + p.ratedOrders,
    goodOrders: t.goodOrders + p.goodOrders,
    badOrders: t.badOrders + p.badOrders,
  }), {
    providerCount: 0, installIncentive: 0, afterSalesIncentive: 0, tmallIncentive: 0, total: 0,
    evaluableOrders: 0, ratedOrders: 0, goodOrders: 0, badOrders: 0,
  });

  if (!providers.length) warnings.push(i18nT('没有解析出任何服务商，请检查文件和列映射'));
  return { rules, providers, totals, warnings };
}

/** 结果表的列（导出 Excel 与界面表格共用，顺序即导出顺序） */
export const REVIEW_RESULT_COLUMNS: { key: keyof ProviderReviewResult; label: string; kind?: 'pct' | 'money' | 'int' }[] = [
  { key: 'provider', label: i18nT('服务商') },
  { key: 'evaluableOrders', label: i18nT('京东安装完工总单量'), kind: 'int' },
  { key: 'ratedOrders', label: i18nT('已评价单数'), kind: 'int' },
  { key: 'rateY', label: i18nT('安装评价率(Y)'), kind: 'pct' },
  { key: 'badOrders', label: i18nT('差评单数'), kind: 'int' },
  { key: 'badRateX', label: i18nT('安装差评率(X)'), kind: 'pct' },
  { key: 'goodOrders', label: i18nT('有效好评单数'), kind: 'int' },
  { key: 'baseAmount', label: i18nT('基础激励金额(元)'), kind: 'money' },
  { key: 'coef', label: i18nT('评价率激励系数') },
  { key: 'installIncentive', label: i18nT('①京东安装好评激励(元)'), kind: 'money' },
  { key: 'afterSalesSatisfied', label: i18nT('售后非常满意+满意单数'), kind: 'int' },
  { key: 'afterSalesIncentive', label: i18nT('②京东售后好评激励(元)'), kind: 'money' },
  { key: 'tmallGood', label: i18nT('天猫好评单数'), kind: 'int' },
  { key: 'tmallIncentive', label: i18nT('③天猫好评激励(元)'), kind: 'money' },
  { key: 'total', label: i18nT('本项总激励(元)'), kind: 'money' },
];

export function reviewResultToRows(result: ReviewIncentiveResult): (string | number)[][] {
  const rows = result.providers.map((p) => REVIEW_RESULT_COLUMNS.map((c) => {
    const v = p[c.key];
    // 评价率未知时「可评价单数」只是 = 已评价数，和界面一样显示「—」，别让 Excel 与屏幕对不上
    if ((c.key === 'rateY' || c.key === 'evaluableOrders') && !p.rateYKnown) return '—';
    if (c.kind === 'pct') return `${(Number(v) * 100).toFixed(2)}%`;
    return v as string | number;
  }));
  rows.push(REVIEW_RESULT_COLUMNS.map((c) => {
    switch (c.key) {
      case 'provider': return i18nT('合计');
      case 'evaluableOrders': return result.totals.evaluableOrders;
      case 'ratedOrders': return result.totals.ratedOrders;
      case 'goodOrders': return result.totals.goodOrders;
      case 'badOrders': return result.totals.badOrders;
      case 'installIncentive': return result.totals.installIncentive;
      case 'afterSalesIncentive': return result.totals.afterSalesIncentive;
      case 'tmallIncentive': return result.totals.tmallIncentive;
      case 'total': return result.totals.total;
      default: return '';
    }
  }));
  return rows;
}

/**
 * 「京东安装评价率」单独一块（2026-09-09 客户要求先把评价率算出来、单独成块）：
 * 每家列出 完工总单量 / 已评价 / 中好评价（非差评）/ 评价率 Y / 差评 / 差评率 X 与各自来源。
 * 结果表另出一页「评价率」；界面在导入明细之后、确认规则之前单独一步展示。
 */
export interface ProviderRateRow {
  provider: string;
  /** 完工总单量（CSS）；没给为 null */
  completedOrders: number | null;
  ratedOrders: number;
  midGoodOrders: number;
  badOrders: number;
  rateY: number | null;
  rateYSource: ProviderReviewResult['rateYSource'];
  badRateX: number;
  badRateXSource: ProviderReviewResult['badRateXSource'];
}
export interface ReviewRatesResult {
  providers: ProviderRateRow[];
  /** 有分母（css）或平台直接给了评价率（report）的家数 / 没有分母的家数 */
  summary: { providerCount: number; withRate: number; unknown: number; fromCss: number; fromReport: number };
  warnings: string[];
}

export function computeReviewRates(input: ReviewIncentiveInput): ReviewRatesResult {
  const r = computeReviewIncentive({ ...input, jdAfterSales: [], tmall: [] });
  const providers: ProviderRateRow[] = r.providers.map((p) => ({
    provider: p.provider,
    completedOrders: p.completedKnown ? p.evaluableOrders : null,
    ratedOrders: p.ratedOrders,
    midGoodOrders: p.midGoodOrders,
    badOrders: p.badOrders,
    rateY: p.rateYKnown ? p.rateY : null,
    rateYSource: p.rateYSource,
    badRateX: p.badRateX,
    badRateXSource: p.badRateXSource,
  })).sort((a, b) => (b.rateY ?? -1) - (a.rateY ?? -1) || a.provider.localeCompare(b.provider, 'zh-CN'));
  // detail（明细自带可评价列）与 css 一样是「按分母算出来的」，汇总里并入 fromCss
  const fromCss = providers.filter((p) => p.rateYSource === 'css' || p.rateYSource === 'detail').length;
  const fromReport = providers.filter((p) => p.rateYSource === 'report').length;
  return {
    providers,
    summary: { providerCount: providers.length, withRate: fromCss + fromReport, unknown: providers.length - fromCss - fromReport, fromCss, fromReport },
    warnings: r.warnings.filter((w) => !/售后|天猫/.test(w)),
  };
}

export const REVIEW_RATE_COLUMNS: { key: keyof ProviderRateRow; label: string }[] = [
  { key: 'provider', label: i18nT('服务商') },
  { key: 'completedOrders', label: i18nT('京东安装完工总单量') },
  { key: 'ratedOrders', label: i18nT('已评价单数') },
  { key: 'midGoodOrders', label: i18nT('完工中好评价量（非差评）') },
  { key: 'rateY', label: i18nT('京东安装评价率 Y') },
  { key: 'rateYSource', label: i18nT('评价率来源') },
  { key: 'badOrders', label: i18nT('差评单数') },
  { key: 'badRateX', label: i18nT('京东安装差评率 X') },
  { key: 'badRateXSource', label: i18nT('差评率来源') },
];

export function rateSourceLabel(v: ProviderRateRow['rateYSource'] | ProviderRateRow['badRateXSource']): string {
  switch (v) {
    case 'css': return i18nT('完工总单量表算出');
    case 'report': return i18nT('平台报表直接给的');
    case 'detail': return i18nT('评价明细算出');
    default: return i18nT('无分母，未知（系数按最低档）');
  }
}

/** 平台报表 / 汇总表尾部的「总计」占位：服务商写成 / \ — 合计 总计 小计 或纯数字 */
function isPlaceholderProvider(name: string): boolean {
  const s = String(name || '').trim();
  return !s || /^[\/\\—–\-]+$/.test(s) || /^(合计|总计|小计|汇总)/.test(s) || /^\d+(\.\d+)?$/.test(s);
}

export function reviewRatesToRows(rates: ReviewRatesResult): (string | number)[][] {
  return rates.providers.map((p) => REVIEW_RATE_COLUMNS.map((c) => {
    const v = p[c.key];
    if (c.key === 'rateY') return v == null ? '—' : `${(Number(v) * 100).toFixed(2)}%`;
    if (c.key === 'badRateX') return `${(Number(v) * 100).toFixed(2)}%`;
    if (c.key === 'completedOrders') return v == null ? '—' : (v as number);
    if (c.key === 'rateYSource' || c.key === 'badRateXSource') return rateSourceLabel(v as ProviderRateRow['rateYSource']);
    return v as string | number;
  }));
}

/** 把用户改过的数值安全地收成规则（界面里填的都是字符串） */
export function sanitizeRules(raw: unknown): Partial<ReviewIncentiveRules> {
  const r = (raw && typeof raw === 'object' ? raw : {}) as Record<string, unknown>;
  const num = (v: unknown, fallback: number): number => {
    const n = toNumber(v);
    return Number.isFinite(n) && n >= 0 ? n : fallback;
  };
  const out: Partial<ReviewIncentiveRules> = {};
  if (r.badRateThreshold != null) out.badRateThreshold = num(r.badRateThreshold, DEFAULT_REVIEW_RULES.badRateThreshold);
  if (r.baseAmountAboveThreshold != null) out.baseAmountAboveThreshold = num(r.baseAmountAboveThreshold, DEFAULT_REVIEW_RULES.baseAmountAboveThreshold);
  if (r.baseAmountWithinThreshold != null) out.baseAmountWithinThreshold = num(r.baseAmountWithinThreshold, DEFAULT_REVIEW_RULES.baseAmountWithinThreshold);
  if (r.afterSalesPerOrder != null) out.afterSalesPerOrder = num(r.afterSalesPerOrder, DEFAULT_REVIEW_RULES.afterSalesPerOrder);
  if (r.tmallPerOrder != null) out.tmallPerOrder = num(r.tmallPerOrder, DEFAULT_REVIEW_RULES.tmallPerOrder);
  if (r.goodStarsMin != null) out.goodStarsMin = Math.min(5, Math.max(1, Math.round(num(r.goodStarsMin, 5))));
  if (r.badStarsMax != null) out.badStarsMax = Math.min(5, Math.max(1, Math.round(num(r.badStarsMax, 1))));
  if (r.badRateDenominator === 'rated' || r.badRateDenominator === 'evaluable') out.badRateDenominator = r.badRateDenominator;
  if (Array.isArray(r.coefTiers)) {
    out.coefTiers = (r.coefTiers as unknown[])
      .map((t) => {
        const o = (t && typeof t === 'object' ? t : {}) as Record<string, unknown>;
        return { minRate: num(o.minRate, 0), coef: num(o.coef, 1) };
      })
      .filter((t) => t.minRate <= 1);
  }
  return out;
}
