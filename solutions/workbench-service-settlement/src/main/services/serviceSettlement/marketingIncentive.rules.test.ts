/**
 * 营销激励规则模型 v2（2026-09-03）：边际阶梯 / 区域经理基础激励与绩效系数 / 电动止回阀门槛 /
 * 呆滞配件返利 / 延保按档位拆服务商与负责人，以及按订单行归属经理、季度标签过滤。
 *
 * 数字全部来自 2026 默认政策（TZ-270 / TZ-271）与客户 2026 Q2 真实结案表：
 *   区域经理「打印」sheet：罗小平 辅材 760,287.76 / 690,521 → 基础 1000，提成 3%×A=22,808.63 ×0.5（延保 29.75%）×1.2（S）= 13,685.18
 *   服务商「激励计算（准确）」：哈尔滨天泽元 26,600 / 8,156 → 244.68+65.25+122.34+861.96 = 1,294.23；呆滞返利 2 年 5% = 1,330
 * 最后一组用真实工作簿逐人对账，文件不在时跳过。
 */
import { describe, it, expect } from 'vitest';
import { existsSync } from 'node:fs';
import { readTable, type SheetTable } from './excel';
import {
  computeAchievement, computeIncentives, sanitizeMarketingRules, evaluateTiers, managerBaseFor, managerAdvanceFor, serviceYearsAt, periodMatches, normalizeDate,
  describeRules, quarterRange, providerKey, managerIncentiveRows, DEFAULT_MARKETING_RULES, DEFAULT_2026_RULES, MANAGER_INCENTIVE_HEADERS,
  parseAliasCell, readProviderInfoTable, makeAliasResolver, withinOneEdit, rebateAsOfDate,
  type AchievementResult, type AchievementRow,
} from './marketingIncentive';

function table(fileName: string, headers: string[], rows: (string | number)[][]): SheetTable {
  return {
    path: `/tmp/${fileName}`, fileName, sheetName: 'Sheet1', headers,
    rows: rows.map((r) => Object.fromEntries(headers.map((h, i) => [h, String(r[i] ?? '')]))),
  };
}

/** 按表头名取区域经理表某列（列序变了测试不用跟着改下标） */
const row = (r: (string | number)[], header: string) => r[MANAGER_INCENTIVE_HEADERS.indexOf(header)];

function achievement(providers: Partial<AchievementRow>[], managers: Partial<AchievementRow>[]): AchievementResult {
  const fill = (r: Partial<AchievementRow>): AchievementRow => {
    const actual = r.actual ?? 0;
    const task = r.task ?? 0;
    return { name: r.name!, manager: r.manager, actual, task, rate: task > 0 ? Math.round((actual / task) * 10000) / 10000 : 0, orders: r.orders ?? 1, qualifierActual: r.qualifierActual, qualifierTask: r.qualifierTask, annualTask: r.annualTask };
  };
  return { providers: providers.map(fill), managers: managers.map(fill), totals: { actual: 0, task: 0, rate: 0, orders: 0 }, warnings: [], providerManager: {}, providersWithoutTask: [] };
}

describe('规则模型 v2 · sanitize 兼容与预设', () => {
  it('旧 v1 JSON（minRate 阶梯 + auxMode）自动升级：整体档 + toRate 链，经理档默认同服务商档', () => {
    const r = sanitizeMarketingRules({
      auxMode: 'ratio',
      auxTiers: [{ minRate: 0, ratio: 0 }, { minRate: 80, ratio: 3 }, { minRate: 100, ratio: 5 }],
      warrantyMode: 'ratio', warrantyTiers: [{ minRate: 0, ratio: 0 }, { minRate: 1, ratio: 0.05 }],
      managerDiscountTiers: [{ belowRate: 80, discount: 8 }], leaderShareRatio: 10, leaderShareBase: 'warranty', returnDueDays: 30,
    });
    expect(r.version).toBe(2);
    expect(r.auxTiers).toEqual([
      { fromRate: 0, toRate: 0.8, ratio: 0, basis: 'whole', fixed: undefined },
      { fromRate: 0.8, toRate: 1, ratio: 0.03, basis: 'whole', fixed: undefined },
      { fromRate: 1, toRate: null, ratio: 0.05, basis: 'whole', fixed: undefined },
    ]);
    expect(r.managerTiers).toEqual(r.auxTiers);
    expect(r.warrantyTiers).toEqual([{ minRate: 0, providerRatio: 0, leaderRatio: 0 }, { minRate: 1, providerRatio: 0.05, leaderRatio: 0 }]);
    expect(r.managerDiscountTiers).toEqual([{ belowRate: 0.8, discount: 0.8 }]);
    expect(r.leaderShareRatio).toBe(0.1);
    expect(r.managerBase.perItemMax).toBe(0);
    expect(r.qualifier.enabled).toBe(false);
    expect(r.rebate.enabled).toBe(false);
  });
  it('v1 fixed 模式 → fixed 档', () => {
    const r = sanitizeMarketingRules({ auxMode: 'fixed', auxTiers: [{ minRate: 0, ratio: 0, fixed: 0 }, { minRate: 1, ratio: 0, fixed: 500 }] });
    expect(r.auxTiers[1]).toMatchObject({ fromRate: 1, toRate: null, basis: 'fixed', fixed: 500 });
    expect(evaluateTiers(12000, 10000, r.auxTiers, { minRate: 0 }).amount).toBe(500);
  });
  it('默认预设 sanitize 幂等；百分数写法（120 / 3.5）自动归一', () => {
    expect(sanitizeMarketingRules(DEFAULT_2026_RULES)).toEqual(DEFAULT_2026_RULES);
    expect(sanitizeMarketingRules(JSON.parse(JSON.stringify(DEFAULT_2026_RULES)))).toEqual(DEFAULT_2026_RULES);
    const r = sanitizeMarketingRules({ auxTiers: [{ fromRate: 100, toRate: 120, ratio: 4, basis: 'marginal' }, { fromRate: 120, toRate: '', ratio: 5, basis: 'marginal' }], performanceCoefficients: { s: 120, 'B +': 1 }, rebate: { enabled: true, tiers: [{ minYears: 10, ratio: 8 }] }, qualifier: { enabled: true, productPattern: '[' } });
    expect(r.auxTiers).toEqual([{ fromRate: 1, toRate: 1.2, ratio: 0.04, basis: 'marginal' }, { fromRate: 1.2, toRate: null, ratio: 0.05, basis: 'marginal' }]);
    expect(r.performanceCoefficients).toEqual({ S: 1.2, 'B+': 1 });
    expect(r.rebate.tiers).toEqual([{ minYears: 10, ratio: 0.08 }]);
    expect(r.qualifier.productPattern).toBe('电动止回阀'); // 非法正则回落默认
    expect(describeRules(DEFAULT_2026_RULES).some(([k]) => k === '规则来源')).toBe(true);
  });
  it('缺省字段回落默认而不是 0：sanitize({}) = DEFAULT；只给 managerBase.perItemMax 其余字段回落（P1-6）', () => {
    // 修前：toNumber(undefined)=0 过 >=0 → returnDueDays 1、warrantyPerOrder 0、leaderShareRatio 0、managerBase.minRate 0
    expect(sanitizeMarketingRules({})).toEqual(DEFAULT_MARKETING_RULES);
    expect(sanitizeMarketingRules(undefined)).toEqual(DEFAULT_MARKETING_RULES);
    const partial = sanitizeMarketingRules({ managerBase: { perItemMax: 1000 } });
    expect(partial.managerBase).toEqual({ ...DEFAULT_MARKETING_RULES.managerBase, perItemMax: 1000 });
    expect(partial.returnDueDays).toBe(30);
    expect(partial.warrantyPerOrder).toBe(20);
    expect(partial.leaderShareRatio).toBe(0.1);
    // LLM 少给 qualifier / rebate 子字段同样回落
    expect(sanitizeMarketingRules({ qualifier: { enabled: true } }).qualifier).toEqual({ ...DEFAULT_MARKETING_RULES.qualifier, enabled: true });
    expect(sanitizeMarketingRules({ rebate: { enabled: true } }).rebate).toEqual({ ...DEFAULT_MARKETING_RULES.rebate, enabled: true });
    // 空串同样视为缺省；显式 0 仍是 0
    expect(sanitizeMarketingRules({ warrantyPerOrder: '', leaderShareRatio: 0 })).toMatchObject({ warrantyPerOrder: 20, leaderShareRatio: 0 });
  });
});

describe('规则模型 v2 · 档位计算', () => {
  it('区域经理四段：80~100% 整体 3%×0.8；100~120% 3%；120~150% 边际 3.5%；≥150% 边际 4%；<80% 无', () => {
    const t = DEFAULT_2026_RULES.managerTiers;
    const o = { minRate: DEFAULT_2026_RULES.managerMinRate };
    expect(evaluateTiers(90000, 100000, t, o).amount).toBe(2160);
    expect(evaluateTiers(110000, 100000, t, o).amount).toBe(3300);
    expect(evaluateTiers(130000, 100000, t, o).amount).toBe(3950); // 3%×120000 + 10000×3.5%
    expect(evaluateTiers(160000, 100000, t, o).amount).toBe(5050); // 3600 + 30000×3.5% + 10000×4%
    expect(evaluateTiers(70000, 100000, t, o)).toMatchObject({ amount: 0, reason: 'below_min' });
    expect(managerAdvanceFor(90000, 100000, t, 0.8, 0.03)).toBe(2160);
    expect(managerAdvanceFor(160000, 100000, t, 0.8, 0.03)).toBe(4800); // 预发按 3% 基础比例
  });
  it('服务商四段（A=目标 B=实际）：100% B×3%；100~120% +（B−A）×4%；120~150% +0.2A×4%+（B−1.2A）×5%；>150% +…×6%', () => {
    const t = DEFAULT_2026_RULES.auxTiers;
    const o = { minRate: 1, missingTaskAsMet: true };
    expect(evaluateTiers(26600, 8156, t, o).amount).toBe(1294.23); // 哈尔滨天泽元（客户表 1294）
    expect(evaluateTiers(112588.4, 38750, t, o).amount).toBe(5321.55); // 天津维安通达（客户表 5322）
    expect(evaluateTiers(11000, 10000, t, o).amount).toBe(340); // 300 + 1000×4%
    expect(evaluateTiers(9000, 10000, t, o)).toMatchObject({ amount: 0, reason: 'below_min' });
    expect(evaluateTiers(1552.4, 0, t, o).amount).toBe(46.57); // 未制定任务视同达成（客户表 47）
    expect(evaluateTiers(1552.4, 0, t, { minRate: 1 })).toMatchObject({ amount: 0, reason: 'no_task' });
  });
  it('基础激励 / 服务年限 / 季度标签', () => {
    const b = DEFAULT_2026_RULES.managerBase;
    expect(managerBaseFor(760287.76, 690521, b)).toBe(1000);
    expect(managerBaseFor(447785.02, 449106, b)).toBe(997.06); // 未取整的完成率
    expect(managerBaseFor(79, 100, b)).toBe(0);
    expect(managerBaseFor(150, 0, b)).toBe(0);
    expect(normalizeDate('45083')).toBe('2023-06-06');
    expect(serviceYearsAt('45083', '2026-03-31')).toBe(2);
    expect(serviceYearsAt('2005-05-01', '2026-03-31')).toBe(20);
    expect(serviceYearsAt('2026-01-14', '2026-03-31')).toBe(0);
    expect(serviceYearsAt('', '2026-03-31')).toBeNull();
    const q2 = quarterRange(2026, 2);
    expect(periodMatches('Q1', q2)).toBe(false);
    expect(periodMatches('4月', q2)).toBe(true);
    expect(periodMatches('6月', q2)).toBe(true);
    expect(periodMatches('7月', q2)).toBe(false);
    expect(periodMatches('04', q2)).toBe(true);
    expect(periodMatches('2026Q2', q2)).toBe(true);
    expect(periodMatches('2025Q2', q2)).toBe(false);
    expect(periodMatches('第二季度', q2)).toBe(true);
    expect(periodMatches('2026-05-10', q2)).toBe(true);
    expect(periodMatches('2025-05-10', q2)).toBe(false);
    expect(periodMatches('随便', q2)).toBe(true);
  });
});

describe('达成率 · 按订单行归属经理', () => {
  it('有经理列逐行归属；经理为空回落服务商映射 → 变更服务商映射 → 已知映射；都没有计未归属', () => {
    const orders = table('延保.xlsx', ['一级服务商', '变更服务商', '区域经理', '实付金额', '月份'], [
      ['甲', '', '王', 100, '04'], ['甲', '', '王', 50, '05'], ['甲', '', '于', 30, '04'], ['甲', '', '', 20, '06'],
      ['乙', '甲', '', 40, '05'], ['丙', '', '', 60, '05'], ['丁', '', '', 7, '05'], ['甲', '', '王', 999, '03'],
    ]);
    const r = computeAchievement({
      orders: [{ table: orders, mapping: { provider: '一级服务商', providerAlt: '变更服务商', manager: '区域经理', amount: '实付金额', date: '月份' } }],
      quarter: quarterRange(2026, 2), measure: 'amount', knownProviderManager: { 丙: '李' },
    });
    const byName = Object.fromEntries(r.managers.map((m) => [m.name, m.actual]));
    expect(byName).toEqual({ 王: 100 + 50 + 20 + 40, 于: 30, 李: 60 });
    // 「乙 → 变更服务商 甲」那一行的身份是甲（CSS 导出「一级服务商名」是旧名、「变更服务商」是现名），乙不再单独成一家
    expect(r.providers.find((p) => p.name === '甲')).toMatchObject({ actual: 240, manager: '王' });
    expect(r.providers.some((p) => p.name === '乙')).toBe(false);
    expect(r.unattributed).toEqual({ amount: 7, rows: 1 });
    expect(r.warnings.some((w) => w.includes('多位经理'))).toBe(true);
  });
  it('服务商名跨表归一：尾空格 / 全半角括号 / 「(个体工商户)」后缀差异视为同一家，展示用任务表原名', () => {
    expect(providerKey('许昌市魏都区燎丰家电维修中心 ')).toBe(providerKey('许昌市魏都区燎丰家电维修中心（个体工商户）'));
    expect(providerKey('常德武陵区谆谆家电维修服务部(个体工商户）')).toBe(providerKey('常德武陵区谆谆家电维修服务部（个体工商户）'));
    expect(providerKey('甲公司')).not.toBe(providerKey('乙公司'));
    const orders = table('辅材.xlsx', ['客户备注', '商品实际成交金额'], [['许昌市魏都区燎丰家电维修中心 ', 120], ['许昌市魏都区燎丰家电维修中心 ', 30]]);
    const tasks = table('任务.xlsx', ['服务商名称', '目标', '区域经理'], [['许昌市魏都区燎丰家电维修中心（个体工商户）', 100, '欧阳飞']]);
    const r = computeAchievement({ orders: [{ table: orders, mapping: { provider: '客户备注', amount: '商品实际成交金额' } }], providerTasks: { table: tasks, mapping: { provider: '服务商名称', task: '目标', manager: '区域经理' } }, measure: 'amount' });
    expect(r.providers).toHaveLength(1);
    expect(r.providers[0]).toMatchObject({ name: '许昌市魏都区燎丰家电维修中心（个体工商户）', actual: 150, task: 100, rate: 1.5, manager: '欧阳飞' });
    expect(r.providerManager).toEqual({ '许昌市魏都区燎丰家电维修中心（个体工商户）': '欧阳飞' });
    expect(r.managers[0]).toMatchObject({ name: '欧阳飞', actual: 150 });
    // 延保 / 信息表也按同一键对上
    const warranty = computeAchievement({ orders: [{ table: table('延保.xlsx', ['服务商', '金额'], [['许昌市魏都区燎丰家电维修中心(个体工商户)', 50]]), mapping: { provider: '服务商', amount: '金额' } }], measure: 'amount', knownProviderManager: r.providerManager });
    const inc = computeIncentives(r, warranty, DEFAULT_2026_RULES, { introducedAt: { '许昌市魏都区燎丰家电维修中心 ': '2013-03-01' }, quarter: quarterRange(2026, 2) });
    expect(inc.providers).toHaveLength(1);
    expect(inc.providers[0]).toMatchObject({ warrantyActual: 50, serviceYears: 13, rebateRatio: 0.08 });
  });
  it('任务表归属仍优先于订单行经理（旧回归 B 不变）；门槛品类按产品列累计；合计行不当服务商', () => {
    const orders = table('辅材.xlsx', ['客户备注', '商品实际成交金额', '产品', '服务经理', '订单创建季度'], [
      ['A', 100, '', 'X', '4月'], ['A', 60, '电动止回阀', 'X', '5月'], ['A', 5, '防烟止回阀', 'X', '6月'], ['A', 999, '电动止回阀', 'X', 'Q1'],
    ]);
    const tasks = table('任务.xlsx', ['服务商名称', 'Q2辅材提货\n目标', 'Q2电动止回阀\n目标', '区域经理'], [['A', 150, 50, 'Y'], ['合计', 150, 50, '']]);
    const r = computeAchievement({
      orders: [{ table: orders, mapping: { provider: '客户备注', amount: '商品实际成交金额', product: '产品', manager: '服务经理', date: '订单创建季度' } }],
      providerTasks: { table: tasks, mapping: { provider: '服务商名称', task: 'Q2辅材提货\n目标', qualifierTask: 'Q2电动止回阀\n目标', manager: '区域经理' } },
      quarter: quarterRange(2026, 2), measure: 'amount', qualifierPattern: '电动止回阀',
    });
    expect(r.providers.map((p) => p.name)).toEqual(['A']);
    expect(r.providers[0]).toMatchObject({ actual: 165, task: 150, qualifierActual: 60, qualifierTask: 50, manager: 'Y' });
    expect(Object.fromEntries(r.managers.map((m) => [m.name, m.actual]))).toEqual({ Y: 165 });
  });
});

describe('激励核算 · 2026 默认预设', () => {
  const rules = DEFAULT_2026_RULES;
  const q = quarterRange(2026, 2);
  it('区域经理：罗小平 / 李利 / 刘琼（客户「打印」表手算）', () => {
    const aux = achievement([], [
      { name: '罗小平', actual: 760287.76, task: 690521 },
      { name: '李利', actual: 348512.7, task: 287196 },
      { name: '刘琼', actual: 447785.02, task: 449106 },
    ]);
    const warranty = achievement([], [
      { name: '罗小平', actual: 17205, task: 57824 },
      { name: '李利', actual: 57034, task: 29852 },
      { name: '刘琼', actual: 87065, task: 51016 },
    ]);
    const r = computeIncentives(aux, warranty, rules, { grades: { 罗小平: 'S', 李利: 'A', 刘琼: 'B' }, quarter: q });
    const luo = r.managers.find((m) => m.manager === '罗小平')!;
    expect(luo).toMatchObject({ auxBase: 1000, warrantyBase: 0, auxCommission: 22808.63, warrantyCommission: 0, discount: 0.5, grade: 'S', coefficient: 1.2 });
    expect(luo.finalIncentive).toBe(14685.18); // 客户 14685
    expect(luo.advanceTotal).toBe(14685.18);
    const li = r.managers.find((m) => m.manager === '李利')!;
    expect(li).toMatchObject({ auxBase: 1000, warrantyBase: 1000, baseTotal: 2000, discount: 1, coefficient: 1.1 });
    expect(li.auxCommission).toBe(10474.77); // 3%×1.2B + (A−1.2B)×3.5%
    expect(li.warrantyCommission).toBe(1878.36); // ≥150%
    expect(li.finalIncentive).toBe(15588.44); // 客户 15588
    expect(li.advanceTotal).toBe(15383.04); // 客户 15383（预发按 3%）
    const liu = r.managers.find((m) => m.manager === '刘琼')!;
    expect(liu).toMatchObject({ auxBase: 997.06, warrantyBase: 1000, coefficient: 0.9 });
    expect(liu.auxCommission).toBe(10746.84); // 99.7% → 3%×A×0.8
    expect(liu.finalIncentive).toBe(14183.71); // 客户 14184
    expect(r.totals.managerFinal).toBe(14685.18 + 15588.44 + 14183.71);
  });
  it('区域经理表：折后辅材提成 = 提成 × 折扣 × 系数、系数后延保提成 = 提成 × 系数；表头与行列数一致（P2-7）', () => {
    const aux = achievement([], [{ name: '罗小平', actual: 760287.76, task: 690521 }]);
    const warranty = achievement([], [{ name: '罗小平', actual: 17205, task: 57824 }]);
    const r = computeIncentives(aux, warranty, rules, { grades: { 罗小平: 'S' }, quarter: q });
    const luo = r.managers[0];
    expect(luo).toMatchObject({ auxCommission: 22808.63, discount: 0.5, coefficient: 1.2, auxCommissionNet: 13685.18, auxCommissionAdvanceNet: 13685.18, warrantyCommissionNet: 0 });
    const rows = managerIncentiveRows(r);
    expect(rows).toHaveLength(2);
    for (const row of rows) expect(row).toHaveLength(MANAGER_INCENTIVE_HEADERS.length);
    expect(row(rows[0], '准确辅材提成(折后)(元)')).toBe(13685.18);
    expect(row(rows[0], '准确辅材提成(折扣/系数前)(元)')).toBe(22808.63);
    expect(row(rows[1], '准确辅材提成(折后)(元)')).toBe(13685.18); // 合计行
    expect(row(rows[0], '区域经理最终激励(元)')).toBe(14685.18);
  });
  it('区域经理：只在延保表出现且任务 0 / 实际 0 的经理不入列、不触发缺等级告警（P2-9）', () => {
    const aux = achievement([], [{ name: '甲', actual: 200, task: 100 }]);
    const warranty = achievement([], [{ name: '甲', actual: 65, task: 100 }, { name: '陈江玲', actual: 0, task: 0, orders: 0 }, { name: '乙', actual: 0, task: 500, orders: 0 }]);
    const r = computeIncentives(aux, warranty, rules, { grades: { 甲: 'A', 乙: 'B' } });
    expect(r.managers.map((m) => m.manager)).toEqual(['甲', '乙']); // 乙有任务没实际 → 仍入列（是没达标，不是没数据）
    expect(r.warnings.some((w) => w.includes('绩效等级'))).toBe(false);
    // 达成率一侧同样不入列：任务表挂名但任务 0 且季度内无单
    const wOrders = table('延保.xlsx', ['一级服务商', '实付金额', '区域经理'], [['甲商', 100, '甲']]);
    const wmTasks = table('经理任务.xlsx', ['区域经理', '二季度目标', '4月任务'], [['甲', 300, 100], ['陈江玲', 0, 0]]);
    const ach = computeAchievement({ orders: [{ table: wOrders, mapping: { provider: '一级服务商', amount: '实付金额', manager: '区域经理' } }], managerTasks: { table: wmTasks, mapping: { manager: '区域经理', task: '二季度目标' } }, measure: 'amount' });
    expect(ach.managers.map((m) => m.name)).toEqual(['甲']);
  });
  it('区域经理：基础激励季度 2000 封顶、无等级系数 1 并告警、延保 ≥60% 不打折', () => {
    const aux = achievement([], [{ name: '甲', actual: 200, task: 100 }]);
    const warranty = achievement([], [{ name: '甲', actual: 65, task: 100 }]);
    const r = computeIncentives(aux, warranty, { ...rules, managerBase: { ...rules.managerBase, quarterMax: 1500 } }, { grades: { 乙: 'A' } });
    expect(r.managers[0]).toMatchObject({ auxBase: 1000, warrantyBase: 0, baseTotal: 1000, discount: 1, coefficient: 1, grade: '' });
    expect(r.warnings.some((w) => w.includes('绩效等级'))).toBe(true);
    const r2 = computeIncentives(achievement([], [{ name: '甲', actual: 120, task: 100 }]), achievement([], [{ name: '甲', actual: 100, task: 100 }]), { ...rules, managerBase: { ...rules.managerBase, quarterMax: 1500 } });
    expect(r2.managers[0].baseTotal).toBe(1500);
  });
  it('服务商：边际提货激励 + 电动止回阀门槛 + 呆滞配件返利（按引入时间算年限，默认预设截止季度开始前一个月的 1 日）', () => {
    const aux = achievement([
      { name: '哈尔滨', actual: 26600, task: 8156, qualifierActual: 4500, qualifierTask: 1781.25 },
      { name: '上海致睿', actual: 78653.3, task: 47375, qualifierActual: 0, qualifierTask: 5156.25 },
      { name: '南昌', actual: 13475.6, task: 14959, qualifierActual: 0, qualifierTask: 1093.75 },
      { name: '宁夏', actual: 1552.4, task: 0 },
      { name: '常德', actual: 44752, task: 30019, annualTask: 120075 },
      { name: '无年限', actual: 5000, task: 4000 },
    ], []);
    const r = computeIncentives(aux, null, rules, { introducedAt: { 哈尔滨: '45083', 上海致睿: '2024-03-15', 南昌: '2022-01-01', 宁夏: '2024-05-01', 常德: '2005-05-01' }, quarter: q });
    const by = Object.fromEntries(r.providers.map((p) => [p.provider, p]));
    expect(by['哈尔滨']).toMatchObject({ auxInitial: 1294.23, qualifierMet: true, serviceYears: 2, rebateRatio: 0.05, rebateAmount: 1330, rebateBasis: 'quarterly', providerTotal: 2624.23 });
    // 1421.25 + 0.2A×4% 379 + 0.3A×5% 710.63 + (B−1.5A)×6% 455.45 = 2966.32（客户表写 2890 = 误套 120~150% 公式，且该行本就「无激励」）
    // 2024-03-15 引入：客户公式 DATEDIF(引入, DATE(2026,3,1)) = 1 年（按 03-31 截止会算成 2 年）
    expect(by['上海致睿']).toMatchObject({ auxInitial: 0, auxBeforeQualifier: 2966.32, qualifierMet: false, serviceYears: 1, rebateRatio: 0.05, rebateAmount: 3932.67 });
    expect(by['上海致睿'].auxNote).toContain('电动止回阀');
    expect(by['南昌']).toMatchObject({ auxInitial: 0, qualifierMet: false, rebateQualified: false, rebateAmount: 0 });
    expect(by['宁夏']).toMatchObject({ auxInitial: 46.57, qualifierMet: null, rebateAmount: 77.62, rebateBasis: 'none' });
    expect(by['常德']).toMatchObject({ rebateBasis: 'annual', rebateQualified: false, rebateAmount: 0 }); // 44752 < 年度 120075
    expect(by['无年限']).toMatchObject({ rebateQualified: true, serviceYears: null, rebateAmount: 0 });
    expect(r.warnings.some((w) => w.includes('引入时间'))).toBe(true);
    expect(r.totals.rebateAmount).toBe(1330 + 3932.67 + 77.62);
  });
  it('服务商延保：按档位拆服务商 / 负责人比例；只有延保的服务商也出现', () => {
    const aux = achievement([{ name: '甲', actual: 0, task: 0 }], []);
    const warranty = achievement([{ name: '甲', actual: 10000, task: 8000 }, { name: '乙', actual: 2000, task: 4000 }, { name: '丙', actual: 9000, task: 5000 }], []);
    const r = computeIncentives(aux, warranty, rules);
    const by = Object.fromEntries(r.providers.map((p) => [p.provider, p]));
    expect(by['甲']).toMatchObject({ warrantyRate: 1.25, warrantyRatio: 0.05, warrantyIncentive: 500, leaderRatio: 0.05, leaderIncentive: 500 });
    expect(by['乙']).toMatchObject({ warrantyRatio: 0.05, warrantyIncentive: 100, leaderRatio: 0.03, leaderIncentive: 60 }); // 基础档不限任务额
    expect(by['丙']).toMatchObject({ warrantyRatio: 0.06, warrantyIncentive: 540, leaderRatio: 0.05, leaderIncentive: 450 });
  });
  it('默认规则（旧口径）下负责人激励仍 = 基数 × 比例', () => {
    const aux = achievement([{ name: '甲', actual: 10000, task: 10000 }], []);
    const warranty = achievement([{ name: '甲', actual: 5, task: 5, orders: 5 }], []);
    const r = computeIncentives(aux, warranty, sanitizeMarketingRules({ ...DEFAULT_MARKETING_RULES, leaderShareBase: 'both', leaderShareRatio: 0.1 }));
    expect(r.providers[0]).toMatchObject({ auxInitial: 500, warrantyIncentive: 100, leaderIncentive: 60 });
  });
});

/**
 * 2026-09-08 逐家对账客户「服务商激励计算（准确）」表后补的回归（235 家 vs 客户 213 家的根因）：
 *   ① CSS 延保导出「一级服务商名」是旧名、「变更服务商」是现名（49 行 / 11,535 元，区域经理列 #N/A）——身份要按现名；
 *   ② 服务商信息表「更名记录」= 曾用名 → 现名（16 家），延保任务表 / CSS 里用的都是曾用名；
 *   ③ 服务年限截止日客户用 DATE(2026,3,1)，不是 03-31（14 家差 1 年）；
 *   ④ 延保任务表里任务 0 / 单 0 的挂名行不入列；
 *   ⑤ 「蚌埠商帮 / 蚌埠商邦」一字之差要点名提示。
 */
describe('曾用名 / 变更服务商 / 年限截止 / 空延保行（2026 Q2 对账根因）', () => {
  it('parseAliasCell：客户「更名记录」三种写法', () => {
    expect(parseAliasCell('曾用名：桂林春天贸易有限公司')).toEqual(['桂林春天贸易有限公司']);
    expect(parseAliasCell('曾用名：①周口市川汇区迅达电器服务中心②周口富能信息科技有限公司')).toEqual(['周口市川汇区迅达电器服务中心', '周口富能信息科技有限公司']);
    expect(parseAliasCell('曾用名：石峰区恒鑫电器经营部，销售计划调整')).toContain('石峰区恒鑫电器经营部');
    expect(parseAliasCell('宁波市鄞州新河亿天电器维修服务部')).toEqual(['宁波市鄞州新河亿天电器维修服务部']);
    expect(parseAliasCell('')).toEqual([]);
    expect(parseAliasCell('/')).toEqual([]);
  });
  it('readProviderInfoTable：曾用名 → 现名；自指不进表；resolver 链式跟到底', () => {
    const info = table('信息.xlsx', ['服务商名称', '省区经理', '引入时间', '更名记录'], [
      ['南通浩纯技术服务有限公司', '李占祥', '2022-05-01', '曾用名：崇川区众川家用电器安装服务部'],
      ['周口市广汇商贸有限公司', '欧阳飞', '2001-01-01', '曾用名：①周口市川汇区迅达电器服务中心②周口富能信息科技有限公司'],
      ['甲公司', '王', '', '曾用名：甲公司'],
    ]);
    const d = readProviderInfoTable(info, { provider: '服务商名称', manager: '省区经理', introducedAt: '引入时间', alias: '更名记录' });
    expect(d.manager).toEqual({ 南通浩纯技术服务有限公司: '李占祥', 周口市广汇商贸有限公司: '欧阳飞', 甲公司: '王' });
    expect(d.introducedAt).toEqual({ 南通浩纯技术服务有限公司: '2022-05-01', 周口市广汇商贸有限公司: '2001-01-01' });
    expect(d.aliases).toEqual({ 崇川区众川家用电器安装服务部: '南通浩纯技术服务有限公司', 周口市川汇区迅达电器服务中心: '周口市广汇商贸有限公司', 周口富能信息科技有限公司: '周口市广汇商贸有限公司' });
    const resolve = makeAliasResolver({ ...d.aliases, 旧甲: '中甲', 中甲: '新甲' });
    expect(resolve('崇川区众川家用电器安装服务部（个体工商户）')).toEqual({ key: providerKey('南通浩纯技术服务有限公司'), name: '南通浩纯技术服务有限公司' });
    expect(resolve('旧甲')).toEqual({ key: providerKey('新甲'), name: '新甲' });
    expect(resolve('乙')).toEqual({ key: providerKey('乙'), name: '乙' });
  });
  it('达成率：延保任务表写现名、CSS 订单写曾用名 → 并成一家按现名展示；变更服务商列非空时身份就是它', () => {
    const tasks = table('延保任务.xlsx', ['一级服务商名称', '延保二季度任务'], [['南通浩纯技术服务有限公司', 3177.717], ['周口富能信息科技有限公司', 5234.133]]);
    const orders = table('CSS.xlsx', ['一级服务商名', '变更服务商', '实付金额', '区域经理', '月份'], [
      ['崇川区众川家用电器安装服务部', '南通浩纯技术服务有限公司', 278, '', '05'], // 客户导出这类行经理列是 #N/A（读进来是空）
      ['崇川区众川家用电器安装服务部', '崇川区众川家用电器安装服务部', 128, '', '04'], // 变更列还是旧名 → 靠更名记录并入
      ['南通浩纯技术服务有限公司', '南通浩纯技术服务有限公司', 198, '李占祥', '06'],
      ['周口富能信息科技有限公司', '周口富能信息科技有限公司', 1502, '欧阳飞', '06'],
      ['深圳市众诚安装服务有限公司', '深圳市广弘电器有限公司', 1700, '', '05'], // 更名记录里没有，只有变更服务商列指向现名
      ['深圳市广弘电器有限公司', '深圳市广弘电器有限公司', 500, '刘琼', '05'],
    ]);
    const aliases = { 崇川区众川家用电器安装服务部: '南通浩纯技术服务有限公司', 周口富能信息科技有限公司: '周口市广汇商贸有限公司' };
    const r = computeAchievement({
      orders: [{ table: orders, mapping: { provider: '一级服务商名', providerAlt: '变更服务商', amount: '实付金额', manager: '区域经理', date: '月份' } }],
      providerTasks: { table: tasks, mapping: { provider: '一级服务商名称', task: '延保二季度任务' } },
      quarter: quarterRange(2026, 2), measure: 'amount', aliases,
    });
    const by = Object.fromEntries(r.providers.map((p) => [p.name, p]));
    expect(Object.keys(by).sort()).toEqual(['南通浩纯技术服务有限公司', '周口市广汇商贸有限公司', '深圳市广弘电器有限公司']);
    expect(by['南通浩纯技术服务有限公司']).toMatchObject({ actual: 604, task: 3177.72, orders: 3, manager: '李占祥' });
    expect(by['周口市广汇商贸有限公司']).toMatchObject({ actual: 1502, task: 5234.13, manager: '欧阳飞' });
    expect(by['深圳市广弘电器有限公司']).toMatchObject({ actual: 2200, manager: '刘琼' });
    expect(Object.fromEntries(r.managers.map((m) => [m.name, m.actual]))).toEqual({ 李占祥: 604, 欧阳飞: 1502, 刘琼: 2200 });
    expect(r.providersWithoutTask).toEqual(['深圳市广弘电器有限公司']);
    expect(r.unattributed).toBeUndefined();
  });
  it('核算：辅材按现名、延保按曾用名的同一家对得上；延保任务 0 / 单 0 的挂名行不入列', () => {
    const aux = achievement([{ name: '南通浩纯技术服务有限公司', manager: '李占祥', actual: 31974.9, task: 31880 }], []);
    const warranty = achievement([
      { name: '崇川区众川家用电器安装服务部', manager: '李占祥', actual: 3331, task: 3177.72, orders: 15 },
      { name: '安庆市住有商贸有限公司', actual: 0, task: 0, orders: 0 },
      { name: '河北阳强科技有限公司', actual: 0, task: 32.27, orders: 0 },
    ], []);
    const rules = sanitizeMarketingRules(DEFAULT_2026_RULES);
    const r = computeIncentives(aux, warranty, rules, { aliases: { 崇川区众川家用电器安装服务部: '南通浩纯技术服务有限公司' }, introducedAt: { 南通浩纯技术服务有限公司: '2022-05-01' }, quarter: quarterRange(2026, 2) });
    expect(r.providers.map((p) => p.provider)).toEqual(['南通浩纯技术服务有限公司', '河北阳强科技有限公司']);
    // 并到现名后达成 104.8% → 9% 档（服务商 5% + 负责人 4%）；不并时旧名单独一家按 8% 基础档、现名延保 0
    expect(r.providers[0]).toMatchObject({ warrantyActual: 3331, warrantyTask: 3177.72, warrantyIncentive: 166.55, leaderRatio: 0.04, leaderIncentive: 133.24, serviceYears: 3 });
    // 不给别名：旧名单独成一家、现名那家延保 0 —— 客户看到的就是「南通浩纯延保对不上」
    const noAlias = computeIncentives(aux, warranty, rules, { quarter: quarterRange(2026, 2) });
    expect(noAlias.providers.map((p) => p.provider)).toEqual(['南通浩纯技术服务有限公司', '崇川区众川家用电器安装服务部', '河北阳强科技有限公司']);
    expect(noAlias.providers[0]).toMatchObject({ warrantyActual: 0, warrantyIncentive: 0, leaderIncentive: 0 });
  });
  it('一字之差的「有订单无任务 ↔ 有任务无订单」点名提示，不自动合并', () => {
    expect(withinOneEdit('蚌埠商帮贸易有限公司', '蚌埠商邦贸易有限公司')).toBe(true);
    expect(withinOneEdit('由丰县维思特电器店', '丰县维思特电器店')).toBe(true);
    expect(withinOneEdit('甲公司', '甲公司')).toBe(false);
    expect(withinOneEdit('淮安星驰达商贸有限公司', '淮安星稳达商贸有限公司')).toBe(true); // 客户确实是两家（合并考核）—— 所以只提示不合并
    expect(withinOneEdit('南通浩纯技术服务有限公司', '崇川区众川家用电器安装服务部')).toBe(false);
    const orders = table('辅材.xlsx', ['客户备注', '商品实际成交金额'], [['蚌埠商帮贸易有限公司', 9321.6], ['深圳市广弘电器有限公司', 100]]);
    const tasks = table('任务.xlsx', ['服务商名称', 'Q2辅材提货目标'], [['蚌埠商邦贸易有限公司', 4528], ['深圳市广弘电器有限公司', 50], ['海口龙华湘宁家电维修部', 17566]]);
    const r = computeAchievement({ orders: [{ table: orders, mapping: { provider: '客户备注', amount: '商品实际成交金额' } }], providerTasks: { table: tasks, mapping: { provider: '服务商名称', task: 'Q2辅材提货目标' } }, measure: 'amount' });
    expect(r.providers.map((p) => p.name)).toContain('蚌埠商帮贸易有限公司');
    expect(r.providers.map((p) => p.name)).toContain('蚌埠商邦贸易有限公司');
    const hint = r.warnings.find((w) => w.includes('只差一个字'));
    expect(hint).toBeTruthy();
    expect(hint).toContain('蚌埠商帮贸易有限公司 ↔ 蚌埠商邦贸易有限公司');
    expect(hint).not.toContain('海口');
  });
  it('服务年限截止日：默认预设 = 季度开始前一个月的 1 日（客户 DATE(2026,3,1)）；sanitize 保留三种取值', () => {
    const q2 = quarterRange(2026, 2);
    expect(rebateAsOfDate({ rebate: { enabled: true, tiers: [], yearsAsOf: 'lastMonthStart' } }, q2)).toBe('2026-03-01');
    expect(rebateAsOfDate({ rebate: { enabled: true, tiers: [], yearsAsOf: 'lastMonthStart' } }, quarterRange(2026, 1))).toBe('2025-12-01');
    expect(rebateAsOfDate({ rebate: { enabled: true, tiers: [], yearsAsOf: 'quarterStart' } }, q2)).toBe('2026-03-31');
    expect(rebateAsOfDate({ rebate: { enabled: true, tiers: [], yearsAsOf: 'quarterEnd' } }, q2)).toBe('2026-06-30');
    expect(sanitizeMarketingRules(DEFAULT_2026_RULES).rebate.yearsAsOf).toBe('lastMonthStart');
    expect(sanitizeMarketingRules({ rebate: { yearsAsOf: 'quarterStart' } }).rebate.yearsAsOf).toBe('quarterStart');
    expect(sanitizeMarketingRules({ rebate: { yearsAsOf: 'whatever' } }).rebate.yearsAsOf).toBe('quarterEnd');
    // 客户表实测：2023-03-30 引入的锡林浩特庆达「截止26年3月服务年限」= 2；2016-03-15 引入按 03-01 是 9 年 5%，按 03-31 会成 10 年 8%
    const aux = achievement([{ name: '锡林浩特', actual: 2000, task: 1427 }, { name: '十年边界', actual: 10000, task: 8000 }], []);
    const r = computeIncentives(aux, null, sanitizeMarketingRules(DEFAULT_2026_RULES), { introducedAt: { 锡林浩特: '2023-03-30', 十年边界: '2016-03-15' }, quarter: q2 });
    expect(r.providers.find((p) => p.provider === '锡林浩特')).toMatchObject({ serviceYears: 2, rebateRatio: 0.05 });
    expect(r.providers.find((p) => p.provider === '十年边界')).toMatchObject({ serviceYears: 9, rebateRatio: 0.05, rebateAmount: 500 });
    expect(describeRules(sanitizeMarketingRules(DEFAULT_2026_RULES)).some(([, v]) => v.includes('季度开始前一个月的 1 日'))).toBe(true);
  });
});

const REAL = '/Users/macpro/Downloads/AI结算测试/服务营销/服务营销各项表格.xlsx';

describe.skipIf(!existsSync(REAL))('真实数据对账 · 客户 2026 Q2《服务营销各项表格》', () => {
  const sheet = (name: string) => readTable(REAL, { sheetName: name });
  const col = (t: SheetTable, re: RegExp): string => {
    const hit = t.headers.find((h) => re.test(h.replace(/\s/g, '')));
    if (!hit) throw new Error(`${t.sheetName} 缺列 ${re}`);
    return hit;
  };
  const skipName = /^(合计|总计|小计)[:：]?$/;
  const num = (v: string) => Number(String(v).replace(/[,，]/g, '')) || 0;

  it('区域经理：目标 / 辅材实际到元一致；延保实际除客户手工调整外一致；三位手算经理结构一致', () => {
    const q = quarterRange(2026, 2);
    const orders = sheet('辅材订单明细');
    const pTasks = sheet('服务商辅材任务');
    const mTasks = sheet('区域经理辅材季度任务');
    const info = sheet('服务商最新信息');
    const infoProvider = col(info, /^服务商名称$/);
    const infoManager = col(info, /^省区经理$/);
    const infoIntro = col(info, /引入时间/);
    const infoMap: Record<string, string> = {};
    const introducedAt: Record<string, string> = {};
    for (const r of info.rows) {
      const p = r[infoProvider].trim();
      if (!p) continue;
      if (r[infoManager].trim()) infoMap[p] = r[infoManager].trim();
      if (r[infoIntro].trim()) introducedAt[p] = r[infoIntro].trim();
    }
    const aux = computeAchievement({
      orders: [{ table: orders, mapping: { provider: '客户备注', amount: '商品实际成交金额', date: '订单创建季度', manager: '服务经理', product: '产品' } }],
      providerTasks: { table: pTasks, mapping: { provider: col(pTasks, /服务商名称/), task: col(pTasks, /辅材提货目标/), qualifierTask: col(pTasks, /电动止回阀目标/) } },
      managerTasks: { table: mTasks, mapping: { manager: '服务经理', task: col(mTasks, /提货任务/) } },
      quarter: q, measure: 'amount', qualifierPattern: '电动止回阀', knownProviderManager: infoMap,
    });
    const wOrders = sheet('延保订单明细');
    const wTasks = sheet('服务商季度延保任务');
    const wmTasks = sheet('区域经理延保季度任务');
    const warranty = computeAchievement({
      orders: [{ table: wOrders, mapping: { provider: '一级服务商名', providerAlt: '变更服务商', amount: '实付金额', date: '月份', manager: '区域经理' } }],
      providerTasks: { table: wTasks, mapping: { provider: col(wTasks, /一级服务商名称/), task: col(wTasks, /延保二季度任务/) } },
      managerTasks: { table: wmTasks, mapping: { manager: '区域经理', task: col(wmTasks, /二季度目标/) } },
      quarter: q, measure: 'amount', knownProviderManager: { ...infoMap, ...aux.providerManager },
    });
    const gradeTable = sheet('服务经理绩效');
    const grades: Record<string, string> = {};
    for (const r of gradeTable.rows) {
      const m = r[col(gradeTable, /区域经理/)]?.trim();
      const g = r[col(gradeTable, /^等级$/)]?.trim();
      if (m && g && /^[SABC+]+$/i.test(g)) grades[m] = g;
    }
    const inc = computeIncentives(aux, warranty, DEFAULT_2026_RULES, { grades, introducedAt, quarter: q });

    // 客户「打印」表 = 区域经理准确金额测算
    const print = sheet('打印');
    const P = {
      name: col(print, /^服务经理$/), auxTask: col(print, /辅材提货目标/), auxActual: col(print, /辅材提货金额/), wTask: col(print, /延保目标/), wActual: col(print, /延保实际金额/),
      grade: col(print, /绩效等级/), coef: col(print, /绩效系数/), auxBase: col(print, /辅材销售基础激励/), wBase: col(print, /延保销售基础激励/), half: col(print, /5折/),
      advAux: col(print, /预发辅材销售提成/), advW: col(print, /预发延保销售提成/), advTotal: col(print, /预发激励合计/), accAux: col(print, /准确辅材销售提成/), accW: col(print, /准确延保销售提成/), accTotal: col(print, /准确激励合计/),
    };
    const rows = print.rows.filter((r) => r[P.name].trim() && !skipName.test(r[P.name].trim()));
    expect(rows).toHaveLength(17);
    const lines: string[] = [];
    const pad = (s: string | number, n: number) => String(s).padStart(n);
    lines.push(['经理'.padEnd(6), pad('客户辅材实际', 14), pad('我方', 12), pad('客户延保实际', 12), pad('我方', 10), pad('客户准确合计', 12), pad('我方准确', 10), pad('差', 8), pad('客户预发', 10), pad('我方预发', 10), pad('差', 8)].join(' '));
    const knownWarrantyResidual: Record<string, number> = { 王哲: 376, 于宁: -376 }; // 客户对秦皇岛赛焱等换经理服务商的 4 月单手工改派，行数据无从复现
    for (const r of rows) {
      const name = r[P.name].trim();
      const ours = inc.managers.find((m) => m.manager === name)!;
      expect(ours, name).toBeTruthy();
      const auxTask = num(r[P.auxTask]);
      const auxActual = num(r[P.auxActual]);
      const wActual = num(r[P.wActual]);
      const accTotal = num(r[P.accTotal]);
      const advTotal = num(r[P.advTotal]);
      lines.push([name.padEnd(6), pad(auxActual.toFixed(2), 14), pad(ours.auxActual.toFixed(2), 12), pad(wActual, 12), pad(ours.warrantyActual, 10), pad(accTotal, 12), pad(ours.finalIncentive.toFixed(2), 10), pad((ours.finalIncentive - accTotal).toFixed(2), 8), pad(advTotal, 10), pad(ours.advanceTotal.toFixed(2), 10), pad((ours.advanceTotal - advTotal).toFixed(2), 8)].join(' '));
      expect(Math.abs(ours.auxTask - auxTask), `${name} 辅材目标`).toBeLessThan(0.5);
      expect(Math.abs(ours.auxActual - auxActual), `${name} 辅材实际`).toBeLessThan(0.5);
      expect(Math.abs(ours.warrantyTask - num(r[P.wTask])), `${name} 延保目标`).toBeLessThan(1);
      expect(ours.warrantyActual - wActual, `${name} 延保实际`).toBe(knownWarrantyResidual[name] ?? 0);
      expect(ours.grade, `${name} 等级`).toBe(r[P.grade].trim().toUpperCase());
      expect(ours.coefficient, `${name} 系数`).toBe(num(r[P.coef]));
      expect(Math.abs(ours.auxBase - num(r[P.auxBase])), `${name} 辅材基础`).toBeLessThan(0.01);
      expect(Math.abs(ours.warrantyBase - num(r[P.wBase])), `${name} 延保基础`).toBeLessThan(0.01);
      expect(ours.discount, `${name} 5折`).toBe(num(r[P.half]));
      // 客户预发 / 准确提成都是未取整的中间列，合计再四舍五入到元；我方保留两位小数 → 允许 1 元以内的取整差
      expect(Math.abs(ours.auxCommissionAdvance * ours.discount * ours.coefficient - num(r[P.advAux])), `${name} 预发辅材提成`).toBeLessThan(0.02);
      expect(Math.abs(ours.warrantyCommissionAdvance * ours.coefficient - num(r[P.advW])), `${name} 预发延保提成`).toBeLessThan(0.02);
      expect(Math.abs(ours.finalIncentive - accTotal), `${name} 准确合计`).toBeLessThan(1);
      expect(Math.abs(ours.advanceTotal - advTotal), `${name} 预发合计`).toBeLessThan(1);
    }
    // eslint-disable-next-line no-console
    console.log(`\n区域经理对账（客户「打印」sheet vs 我方）\n${lines.join('\n')}\n`);
    // 三位手算经理的结构
    const luo = inc.managers.find((m) => m.manager === '罗小平')!;
    expect(luo).toMatchObject({ auxBase: 1000, warrantyBase: 0, auxCommission: 22808.63, discount: 0.5, coefficient: 1.2, finalIncentive: 14685.18 });
    const li = inc.managers.find((m) => m.manager === '李利')!;
    expect(li).toMatchObject({ auxBase: 1000, warrantyBase: 1000, auxCommission: 10474.77, warrantyCommission: 1878.36, coefficient: 1.1, finalIncentive: 15588.44 });
    const liu = inc.managers.find((m) => m.manager === '刘琼')!;
    expect(liu).toMatchObject({ auxBase: 997.06, warrantyBase: 1000, auxCommission: 10746.84, coefficient: 0.9 });
    expect(Math.abs(liu.finalIncentive - 14184)).toBeLessThan(0.5); // 真实延保任务 51015.61（合成用例用 51016）

    // 服务商侧：对「服务商激励计算（准确）」抽查 + 全量统计
    const acc = sheet('服务商激励计算（准确）');
    const A = { name: col(acc, /^服务商名称$/), note: acc.headers[2], inc: col(acc, /提货激励金额/), rebate: col(acc, /呆滞配件权益金额/), years: col(acc, /服务年限/), ok: col(acc, /提货是否符合/), zok: col(acc, /电动止回阀是否符合/) };
    const byKey = new Map(inc.providers.map((p) => [providerKey(p.provider), p]));
    const byName = new Proxy({} as Record<string, (typeof inc.providers)[number] | undefined>, { get: (_t, name: string) => byKey.get(providerKey(name)) });
    let compared = 0; let incMatch = 0; let rebateMatch = 0; let yearsMatch = 0; let qualifierMatch = 0;
    const mismatches: string[] = [];
    for (const r of acc.rows) {
      const name = r[A.name].trim();
      if (!name || r[A.note].trim()) continue; // 已终止合作 / 合并考核：客户手工处理，不对账
      const ours = byName[name];
      if (!ours) continue;
      compared += 1;
      const sheetInc = num(r[A.inc]);
      const sheetRebate = num(r[A.rebate]);
      const sheetYears = r[A.years].trim();
      // 客户表电动止回阀不达标时前后不一致：3 行「提货激励金额」仍留数、说明写「无激励」，1 行（海口龙华）真清零
      // → 门槛前 / 门槛后任一口径对得上都算一致
      const incOk = Math.abs(ours.auxInitial - sheetInc) < 1 || (ours.qualifierMet === false && Math.abs(ours.auxBeforeQualifier - sheetInc) < 1);
      if (incOk) incMatch += 1; else mismatches.push(`${name} 提货激励 客户 ${sheetInc} 我方 ${ours.auxInitial}（门槛前 ${ours.auxBeforeQualifier}）`);
      if (Math.abs(ours.rebateAmount - sheetRebate) < 1) rebateMatch += 1; else mismatches.push(`${name} 呆滞返利 客户 ${sheetRebate} 我方 ${ours.rebateAmount}（年限 ${ours.serviceYears}）`);
      if (sheetYears === '/' || sheetYears === '' || ours.serviceYears === Number(sheetYears)) yearsMatch += 1;
      const sheetZ = r[A.zok].trim();
      const oursZ = ours.qualifierMet == null ? '不涉及' : ours.qualifierMet ? '是' : '否';
      if (sheetZ === oursZ || (sheetZ === '' && oursZ === '不涉及')) qualifierMatch += 1; else mismatches.push(`${name} 电动止回阀 客户「${sheetZ}」我方「${oursZ}」`);
    }
    // eslint-disable-next-line no-console
    console.log(`服务商对账：可比 ${compared} 家；提货激励一致 ${incMatch}，呆滞返利一致 ${rebateMatch}，服务年限一致 ${yearsMatch}，电动止回阀判定一致 ${qualifierMatch}\n${mismatches.slice(0, 20).join('\n')}`);
    expect(compared).toBeGreaterThan(150);
    expect(incMatch / compared).toBeGreaterThan(0.95);
    expect(rebateMatch / compared).toBeGreaterThan(0.9);
    expect(byName['哈尔滨市天泽元商贸有限公司']).toMatchObject({ auxInitial: 1294.23, qualifierMet: true, serviceYears: 2, rebateAmount: 1330 });
    expect(byName['上海致睿燃气具安装维修有限公司']).toMatchObject({ auxInitial: 0, qualifierMet: false, auxBeforeQualifier: 2966.32 });
  });
});
