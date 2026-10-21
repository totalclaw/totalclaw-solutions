/**
 * 模块四 · 「界面默认流程」对账（2026-09-03 审查 P0-1 ~ P0-4 / P1-5 / P2-9 的回归）。
 *
 * 与 marketingIncentive.rules.test.ts 的区别：那边**手工指列**已经 17/17 经理一致；这里完全按界面的默认路径走 ——
 *   列全部由 `detectColumns` 自动识别（主进程关键字表不认识的角色套渲染层 AUTO_PICK 同款正则）、
 *   有赞订单没有服务商列时回落「客户备注」、第 2 步用**默认规则**（门槛未启用）算达成率、
 *   第 3 步再套默认预设算激励、第 5 步延保、第 6 步最终核算 ——
 * 必须和客户「打印」sheet 的 17 位经理 ±1 元一致。审查发现的四个 P0 每一个都会让这条链路偏掉：
 *   P0-1 门槛正则按 enabled 传 → 26 家门槛误判清零；P0-2「订单创建季度」认不成日期列 → Q1 混进 Q2；
 *   P0-3「4月任务」抢了「二季度目标」→ 延保任务缩 1/3；P0-4 服务商列为空卡在第 1 步。
 * 真实文件不在时整组跳过。
 */
import { describe, it, expect } from 'vitest';
import { existsSync } from 'node:fs';
import { readTable, detectColumns, type SheetTable } from './excel';
import {
  computeAchievement, computeIncentives, sanitizeMarketingRules, quarterRange, providerKey, readProviderInfoTable,
  DEFAULT_MARKETING_RULES, DEFAULT_2026_RULES, type AchievementInput,
} from './marketingIncentive';
import DK from './dataKeywords.json';

const REAL = '/Users/macpro/Downloads/AI结算测试/服务营销/服务营销各项表格.xlsx';

// ── 渲染层 MarketingIncentiveModule.vue 的角色表 / AUTO_PICK / PREFER 镜像 ─────────────────────
// 渲染层代码在主进程单测里拿不到，这里照抄一份；改那边记得同步（E2E service-settlement-demo.spec.ts 走真界面兜底）。
const ORDER_ROLES = ['provider', 'amount', 'date', 'manager', 'product', 'status', 'orderNo'];
const PTASK_ROLES = ['provider', 'task', 'qualifierTask', 'annualTask', 'manager'];
const WTASK_ROLES = ['provider', 'task', 'manager'];
const MTASK_ROLES = ['manager', 'task'];
const CSS_ROLES = ['provider', 'providerAlt', 'amount', 'quantity', 'date', 'manager', 'status'];
const GRADE_ROLES = ['manager', 'grade'];
const INFO_ROLES = ['provider', 'introducedAt', 'manager', 'alias'];
const AUTO_PICK: Record<string, RegExp[]> = {
  product: [/^产品$/, /产品(名称|类型|品类)/],
  qualifierTask: [/止回阀.*(目标|任务)/, /(目标|任务).*止回阀/],
  annualTask: [/^\d{2,4}年.*(目标|任务)/, /年度.*(目标|任务)/],
  providerAlt: [/变更服务商/, /归属服务商/],
  grade: [/^等级$/, /绩效等级/, /等级/],
  introducedAt: [/引入时间/, /引入年份/, /引入日期/, /合作(开始|起始)?(时间|日期)/, /签约(时间|日期)/],
};
const PREFER: Record<string, RegExp[]> = { manager: [/^省区经理$/] };

/** = 主进程 inspect（detectColumns）+ 渲染层 autoPick */
function autoMap(table: SheetTable, roles: string[], prefer?: Record<string, RegExp[]>): Record<string, string> {
  const mapping = detectColumns(table.headers, roles);
  const norm = (h: string) => h.replace(/\s+/g, '');
  const taken = () => Object.values(mapping).filter(Boolean);
  for (const key of roles) {
    const preferRes = prefer?.[key];
    if (preferRes) {
      const hit = table.headers.find((h) => preferRes.some((re) => re.test(norm(h))));
      if (hit) { mapping[key] = hit; continue; }
    }
    if (mapping[key]) continue;
    for (const re of AUTO_PICK[key] || []) {
      const hit = table.headers.find((h) => re.test(norm(h)) && !taken().includes(h));
      if (hit) { mapping[key] = hit; break; }
    }
  }
  return mapping;
}
/** = 渲染层 fallbackOrderProvider（P0-4） */
function fallbackOrderProvider(table: SheetTable, mapping: Record<string, string>): void {
  if (!mapping.provider && table.headers.includes(DK.orderProviderFallbackColumn)) mapping.provider = DK.orderProviderFallbackColumn;
}
/** = serviceSettlement.ipc readProviderInfo（主进程直接调 readProviderInfoTable）/ readGrades */
function readProviderInfo(t: { table: SheetTable; mapping: Record<string, string> } | null) {
  return readProviderInfoTable(t?.table || { path: '', fileName: '', sheetName: '', headers: [], rows: [] }, t?.mapping || {});
}
function readGrades(t: { table: SheetTable; mapping: Record<string, string> } | null): Record<string, string> {
  const out: Record<string, string> = {};
  if (!t?.mapping.manager || !t.mapping.grade) return out;
  for (const row of t.table.rows) {
    const m = (row[t.mapping.manager] || '').trim();
    const g = (row[t.mapping.grade] || '').trim();
    if (m && g && /^[A-Za-z][A-Za-z+＋\s]{0,3}$/.test(g)) out[m] = g;
  }
  return out;
}

describe.skipIf(!existsSync(REAL))('模块四 · 界面默认流程（自动识别列 + 默认步骤顺序）对账客户「打印」表', () => {
  const sheet = (name: string) => readTable(REAL, { sheetName: name });
  const pick = (name: string, roles: string[], prefer?: Record<string, RegExp[]>) => {
    const table = sheet(name);
    return { table, mapping: autoMap(table, roles, prefer) };
  };
  const num = (v: string) => Number(String(v).replace(/[,，]/g, '')) || 0;
  const norm = (h: string) => h.replace(/\s+/g, '');
  const skipName = /^(合计|总计|小计)[:：]?$/;

  it('自动识别：订单表回落「客户备注」、季度/月份标签认成日期列、经理延保任务认「二季度目标」而不是「4月任务」', () => {
    const orders = pick('辅材订单明细', ORDER_ROLES);
    expect(orders.mapping.provider).toBe(''); // 主进程关键字表本就认不出 —— 靠渲染层回落
    fallbackOrderProvider(orders.table, orders.mapping);
    expect(orders.mapping).toMatchObject({ provider: '客户备注', amount: '商品实际成交金额', date: '订单创建季度', manager: '服务经理', product: '产品', orderNo: '订单号' });

    const pTasks = pick('服务商辅材任务', PTASK_ROLES);
    expect(pTasks.mapping.provider).toBe('服务商名称');
    expect(norm(pTasks.mapping.task)).toBe('Q2辅材提货目标');
    expect(norm(pTasks.mapping.qualifierTask)).toBe('Q2电动止回阀目标');
    expect(pick('区域经理辅材季度任务', MTASK_ROLES).mapping).toEqual({ manager: '服务经理', task: 'Q2提货任务' });
    expect(pick('服务经理绩效', GRADE_ROLES).mapping).toEqual({ manager: '区域经理（全）', grade: '等级' });
    // 「更名记录」列认成曾用名（服务商名称1 / 合作状态 那对是贴在旁边的终止名单，不能被当成服务商列）
    expect(pick('服务商最新信息', INFO_ROLES, PREFER).mapping).toEqual({ provider: '服务商名称', introducedAt: '引入时间', manager: '省区经理', alias: '更名记录' });

    expect(pick('延保订单明细', CSS_ROLES).mapping).toMatchObject({ provider: '一级服务商名', providerAlt: '变更服务商', amount: '实付金额', date: '月份', manager: '区域经理' });
    expect(pick('服务商季度延保任务', WTASK_ROLES).mapping).toMatchObject({ provider: '一级服务商名称', task: '延保二季度任务' });
    // P0-3：「4月任务」是月份专列，季度任务得是「二季度目标」
    expect(pick('区域经理延保季度任务', MTASK_ROLES).mapping).toEqual({ manager: '区域经理', task: '二季度目标' });
  });

  it('默认步骤顺序：默认规则算达成 → 套默认预设算激励 → 延保 → 最终核算，17 位经理与「打印」表 ±1 元一致', () => {
    const q = quarterRange(2026, 2);
    // 第 1 步
    const orders = pick('辅材订单明细', ORDER_ROLES);
    fallbackOrderProvider(orders.table, orders.mapping);
    // 第 2 步（规则还是默认示例规则：门槛未启用 —— 正则照样传，P0-1）
    const rulesDefault = sanitizeMarketingRules(DEFAULT_MARKETING_RULES);
    expect(rulesDefault.qualifier.enabled).toBe(false);
    const providerTasks = pick('服务商辅材任务', PTASK_ROLES);
    const managerTasks = pick('区域经理辅材季度任务', MTASK_ROLES);
    const gradeTable = pick('服务经理绩效', GRADE_ROLES);
    const providerInfo = pick('服务商最新信息', INFO_ROLES, PREFER);
    const info = readProviderInfo(providerInfo);
    // 服务商信息表「更名记录」→ 16 家曾用名（主进程 readProviderInfo 同源）
    expect(Object.keys(info.aliases).length).toBeGreaterThanOrEqual(30);
    expect(info.aliases['崇川区众川家用电器安装服务部']).toBe('南通浩纯技术服务有限公司');
    expect(info.aliases['周口富能信息科技有限公司']).toBe('周口市广汇商贸有限公司');
    const auxInput: AchievementInput = {
      orders: [orders], providerTasks, managerTasks, quarter: q, measure: 'amount',
      knownProviderManager: info.manager, qualifierPattern: rulesDefault.qualifier.productPattern || undefined, aliases: info.aliases,
    };
    const aux = computeAchievement(auxInput);
    // 「蚌埠商帮」（有赞客户备注）vs「蚌埠商邦」（任务表）一字之差：点名提示，不自动并
    expect(aux.warnings.find((w) => w.includes('只差一个字'))).toContain('蚌埠商帮贸易有限公司 ↔ 蚌埠商邦贸易有限公司');
    // P0-2：Q1 的 3,002 行被剔除，辅材实际 5,006,117（不是 9,268,972）
    expect(Math.abs(aux.totals.actual - 5006117.46)).toBeLessThan(1);
    expect(aux.warnings.some((w) => /3002 行/.test(w))).toBe(true);
    expect(aux.providers.filter((p) => (p.qualifierActual || 0) > 0).length).toBeGreaterThan(20); // 门槛实际已统计
    expect(aux.managers).toHaveLength(17);

    // 第 3 步：套预设（界面 loadRules → rulesPayload → sanitize，与直接 sanitize 预设等价）
    const rules = sanitizeMarketingRules(DEFAULT_2026_RULES);
    const initial = computeIncentives(aux, null, rules, { introducedAt: info.introducedAt, quarter: q });
    const cleared = initial.providers.filter((p) => p.qualifierMet === false);
    expect(cleared.length).toBeLessThan(10); // 修前 26 家被误判门槛未达成
    expect(initial.totals.auxInitial).toBeGreaterThan(150000); // 修前 80,900

    // 第 5 步：延保
    const cssOrders = pick('延保订单明细', CSS_ROLES);
    const warrantyTasks = pick('服务商季度延保任务', WTASK_ROLES);
    const warrantyManagerTasks = pick('区域经理延保季度任务', MTASK_ROLES);
    const warranty = computeAchievement({
      orders: [cssOrders], providerTasks: warrantyTasks, managerTasks: warrantyManagerTasks, quarter: q, measure: 'amount',
      knownProviderManager: { ...info.manager, ...aux.providerManager }, aliases: info.aliases,
    });
    // P2-9：延保任务表里任务 0、实际 0 的陈江玲 / 董煜明不入列
    expect(warranty.managers.map((m) => m.name)).not.toContain('陈江玲');
    expect(warranty.managers.map((m) => m.name)).not.toContain('董煜明');
    // 2026-09-08：CSS「一级服务商名」旧名 + 「变更服务商」现名（49 行 #N/A 经理）、延保任务表曾用名 —— 全部并到现名
    const wNames = warranty.providers.map((p) => p.name);
    for (const old of ['崇川区众川家用电器安装服务部', '深圳市众诚安装服务有限公司', '杭州粤华川工程科技有限公司', '周口富能信息科技有限公司', '大连中营华百商业发展有限公司', '盐城市亭湖区同春厨房设备经营部']) expect(wNames, old).not.toContain(old);
    const wBy = new Map(warranty.providers.map((p) => [providerKey(p.name), p]));
    expect(wBy.get(providerKey('南通浩纯技术服务有限公司'))).toMatchObject({ actual: 4421, task: 3177.72, manager: '李占祥' });
    expect(wBy.get(providerKey('深圳市广弘电器有限公司'))).toMatchObject({ actual: 15952, manager: '刘琼' });
    expect(wBy.get(providerKey('周口市广汇商贸有限公司'))).toMatchObject({ actual: 1502, task: 5234.13, manager: '欧阳飞' });
    expect(warranty.warnings.some((w) => w.includes('没有任务'))).toBe(false); // 修前 6 家「有订单无任务」全是曾用名
    expect(warranty.unattributed).toBeUndefined(); // #N/A 经理的 49 行全部经现名归到经理

    // 第 6 步：最终核算
    const inc = computeIncentives(aux, warranty, rules, { grades: readGrades(gradeTable), introducedAt: info.introducedAt, aliases: info.aliases, quarter: q });
    expect(inc.managers.map((m) => m.manager)).not.toContain('陈江玲');
    expect(inc.warnings.some((w) => w.includes('绩效等级'))).toBe(false);
    // 235 → 218：213 家客户表里的 + 蚌埠商帮（订单笔误）+ 由丰县维思特（延保任务表笔误）+ 焦作梦与翔 / 西藏圣鸿 / 河北阳强（只有延保任务 / 单，客户辅材表本就不列）
    expect(inc.providers).toHaveLength(218);
    expect(inc.providers.map((p) => p.provider)).not.toContain('安庆市住有商贸有限公司'); // 延保任务 0 / 单 0 的挂名行

    const print = sheet('打印');
    const col = (re: RegExp) => { const h = print.headers.find((x) => re.test(norm(x))); if (!h) throw new Error(`打印 缺列 ${re}`); return h; };
    const P = { name: col(/^服务经理$/), wTask: col(/延保目标/), accTotal: col(/准确激励合计/), advTotal: col(/预发激励合计/), half: col(/5折/), accAux: col(/准确辅材销售提成/) };
    const rows = print.rows.filter((r) => r[P.name].trim() && !skipName.test(r[P.name].trim()));
    expect(rows).toHaveLength(17);
    const lines: string[] = [];
    for (const r of rows) {
      const name = r[P.name].trim();
      const ours = inc.managers.find((m) => m.manager === name);
      expect(ours, name).toBeTruthy();
      const accTotal = num(r[P.accTotal]);
      lines.push(`${name.padEnd(6)} 客户 ${String(accTotal).padStart(9)}  我方 ${ours!.finalIncentive.toFixed(2).padStart(10)}  差 ${(ours!.finalIncentive - accTotal).toFixed(2).padStart(7)}  延保任务 ${ours!.warrantyTask} / ${num(r[P.wTask])}`);
      expect(Math.abs(ours!.warrantyTask - num(r[P.wTask])), `${name} 延保目标`).toBeLessThan(1); // P0-3
      expect(ours!.discount, `${name} 5折`).toBe(num(r[P.half]));
      expect(Math.abs(ours!.finalIncentive - accTotal), `${name} 准确合计`).toBeLessThan(1);
      expect(Math.abs(ours!.advanceTotal - num(r[P.advTotal])), `${name} 预发合计`).toBeLessThan(1);
      // P2-7：折后辅材提成 = 客户「准确辅材销售提成激励」列（客户该列手工取整到元：于宁 3900 vs 3900.30，允许 1 元内）
      expect(Math.abs(ours!.auxCommissionNet - num(r[P.accAux])), `${name} 折后辅材提成`).toBeLessThan(1);
    }
    // eslint-disable-next-line no-console
    console.log(`\n界面默认流程对账（客户「打印」sheet vs 我方）\n${lines.join('\n')}\n`);
    const by = Object.fromEntries(inc.managers.map((m) => [m.manager, m]));
    expect(by['罗小平'].finalIncentive).toBe(14685.18);
    expect(by['李利'].finalIncentive).toBe(15588.44);
    expect(Math.abs(by['刘琼'].finalIncentive - 14183.72)).toBeLessThan(1);
    // 服务商侧抽查（同手工指列的结果）
    const byKey = new Map(inc.providers.map((p) => [providerKey(p.provider), p]));
    expect(byKey.get(providerKey('哈尔滨市天泽元商贸有限公司'))).toMatchObject({ auxInitial: 1294.23, qualifierMet: true, rebateAmount: 1330 });
    // 并到现名后 南通浩纯 延保 139% → 10% 档（5%+5%），负责人激励按现名出（修前旧名单独一家按 8% 基础档、现名延保 0）
    expect(byKey.get(providerKey('南通浩纯技术服务有限公司'))).toMatchObject({ auxActual: 31974.9, warrantyActual: 4421, warrantyRate: 1.3912, warrantyIncentive: 221.05, leaderRatio: 0.05, leaderIncentive: 221.05 });

    // ── 逐家对账客户「服务商激励计算（准确）」sheet（客户只算提货激励 + 呆滞配件返利，不含延保）──
    const acc = sheet('服务商激励计算（准确）');
    const A = (re: RegExp) => { const h = acc.headers.find((x) => re.test(norm(x))); if (!h) throw new Error(`准确 缺列 ${re}`); return h; };
    const C = { name: A(/^服务商名称$/), task: A(/^Q2辅材提货目标$/), actual: A(/^Q2辅材提货金额$/), qTask: A(/^Q2电动止回阀提货目标$/), qActual: A(/^Q2电动止回阀实际提货$/), incentive: A(/^提货激励金额$/), years: A(/服务年限/), rebate: A(/呆滞配件权益金额/), note: A(/^提货激励说明$/) };
    const truth = acc.rows.filter((r) => r[C.name].trim() && !skipName.test(r[C.name].trim()));
    expect(truth).toHaveLength(213);
    /**
     * 已核到根因、不是我方算法问题的 8 家（2026-09-08 审查）：
     *  B 缺输入：杭州炅和 / 钦州佳源 / 响水小盛 中途退出无激励（终止名单不在我们拿到的任何表的正式列里）；蚌埠商邦 客户备注写成「商帮」
     *  C 客户算错：上海致睿 / 天津鸿圣辉 / 清远及时 说明写「未完成电动止回阀任务无激励」却付了 2890 / 172 / 1528；新疆金品 达成 200.8% 套了 120~150% 公式（6538，应 6961.52）
     */
    const knownIncentiveGap = new Set(['杭州市江干区炅和家电维修服务部', '钦州佳源电器设备有限公司', '响水县开发区小盛家电维修部', '蚌埠商邦贸易有限公司', '上海致睿燃气具安装维修有限公司', '天津鸿圣辉科技有限公司', '清远及时家居服务有限公司', '新疆金品贸易有限公司']);
    const numOrNull = (v: string) => { const s = String(v ?? '').trim(); if (!s || /^[/#]|未制定/.test(s)) return null; const n = Number(s.replace(/[,，]/g, '')); return Number.isFinite(n) ? n : null; };
    const gaps: string[] = [];
    let yearsChecked = 0;
    for (const r of truth) {
      const name = r[C.name].trim();
      const ours = byKey.get(providerKey(name));
      expect(ours, name).toBeTruthy();
      const p = ours!;
      const pushGap = (what: string, a: number | null, b: number) => gaps.push(`${name} ${what} 客户 ${a} 我方 ${b}`);
      // 任务 / 实际 / 门槛任务 / 门槛实际：除蚌埠商邦（订单在「商帮」名下）外逐家到分
      if (name !== '蚌埠商邦贸易有限公司') {
        const tv = numOrNull(r[C.task]); if (tv != null && Math.abs(tv - p.auxTask) > 0.01) pushGap('提货目标', tv, p.auxTask);
        const av = numOrNull(r[C.actual]); if (av != null && Math.abs(av - p.auxActual) > 0.01) pushGap('提货金额', av, p.auxActual);
        const qt = numOrNull(r[C.qTask]); if (qt != null && Math.abs(qt - p.qualifierTask) > 0.01) pushGap('止回阀目标', qt, p.qualifierTask);
        const qa = numOrNull(r[C.qActual]); if (qa != null && Math.abs(qa - p.qualifierActual) > 0.01) pushGap('止回阀实际', qa, p.qualifierActual);
      }
      // 提货激励：客户 ROUND(…,0) 取整，允许 0.5；呆滞返利客户不取整，允许 0.01
      const inc = numOrNull(r[C.incentive]);
      if (inc != null && !knownIncentiveGap.has(name) && Math.abs(inc - p.auxInitial) > 0.5) pushGap('提货激励', inc, p.auxInitial);
      const rb = numOrNull(r[C.rebate]);
      if (rb != null && name !== '蚌埠商邦贸易有限公司' && Math.abs(rb - p.rebateAmount) > 0.01) pushGap('呆滞返利', rb, p.rebateAmount);
      // 服务年限：有引入时间的家逐家一致（客户 DATEDIF(引入, DATE(2026,3,1))）；没有的都是中途退出、客户从另一份表 VLOOKUP 来的
      const yr = numOrNull(r[C.years]);
      if (yr != null && p.serviceYears != null) { yearsChecked += 1; if (yr !== p.serviceYears) pushGap('服务年限', yr, p.serviceYears); }
    }
    expect(gaps, gaps.join('\n')).toEqual([]);
    expect(yearsChecked).toBeGreaterThanOrEqual(180);
    // 8 家已知差异的当前值锁死（客户表数字见上）：修了别的东西把这些碰动了要重新解释
    expect(byKey.get(providerKey('新疆金品贸易有限公司'))).toMatchObject({ auxInitial: 6961.52, rebateAmount: 16746.4 });
    expect(byKey.get(providerKey('上海致睿燃气具安装维修有限公司'))).toMatchObject({ auxInitial: 0, auxBeforeQualifier: 2966.32, qualifierMet: false, serviceYears: 2 });
    expect(byKey.get(providerKey('蚌埠商邦贸易有限公司'))).toMatchObject({ auxActual: 0, auxTask: 4528 });
    expect(byKey.get(providerKey('蚌埠商帮贸易有限公司'))).toMatchObject({ auxActual: 9321.6, auxTask: 0, auxInitial: 279.65 });
    expect(byKey.get(providerKey('响水县开发区小盛家电维修部'))).toMatchObject({ auxInitial: 105.98, serviceYears: null });
  });
});
