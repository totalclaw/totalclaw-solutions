/**
 * 2026-09-03 用客户真实数据（品牌方）测出的口径问题 —— 回归用例（合成数据，永远跑）
 * + 真实数据对账（有 ~/Downloads/AI结算测试 时才跑）。
 */
import { describe, it, expect } from 'vitest';
import { existsSync, mkdtempSync, writeFileSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';
import * as XLSX from 'xlsx';
import { buildProviderAliasMap, detectColumn, detectColumns, listSheetNames, normalizeProviderName, providerSkeleton, readTable, toCounted } from './excel';
import { computeReviewIncentive, computeReviewRates, reviewRatesToRows } from './reviewIncentive';
import {
  computeSettlementSummary, guessFeeSign, isBogusProvider, planProviderWorkbooks, stripInternalColumns,
} from './settlementSummary';

const table = (fileName: string, headers: string[], rows: (string | number)[][]) => ({
  path: `/tmp/${fileName}`, fileName, sheetName: 'Sheet1', headers,
  rows: rows.map((r) => Object.fromEntries(headers.map((h, i) => [h, String(r[i] ?? '')]))),
});

describe('列识别优先级（真实结案表踩坑）', () => {
  it('服务商：一级优先于二级 / 编码', () => {
    expect(detectColumn(['自建单服务商', '一级服务商编号', '建单一级服务商全称', '激励金额'], 'provider')).toBe('建单一级服务商全称');
    expect(detectColumn(['服务商编码', '所属一级服务商', '二级服务商名称'], 'provider')).toBe('所属一级服务商');
    expect(detectColumn(['服务商名称', '一级服务商名称'], 'provider')).toBe('一级服务商名称');
    // 只有二级也得能选到
    expect(detectColumn(['二级服务商名称', '金额'], 'provider')).toBe('二级服务商名称');
  });
  it('金额：本次应结优先于原金额 / 基础金额', () => {
    expect(detectColumn(['原金额', '已补扣金额', '待补扣金额'], 'amount')).toBe('待补扣金额');
    expect(detectColumn(['基础补贴金额', '折扣', '本次应用\n补贴金额'], 'amount')).toBe('本次应用\n补贴金额');
    expect(detectColumn(['补贴包基础金额', '补贴系数', '总补贴金额'], 'amount')).toBe('总补贴金额');
    expect(detectColumn(['单价', '总金额'], 'amount')).toBe('总金额');
    expect(detectColumns(['服务商', '激励金额/元'], ['provider', 'amount']).amount).toBe('激励金额/元');
    // 达人样机核销表：「总金额」精确命中不能挤掉高优先级的「需申请核销金额」（实测少算 510 元）
    expect(detectColumn(['单价', '总金额', '需申请核销金额', '承担部门'], 'amount')).toBe('需申请核销金额');
    // 说明 / 备注类文本列不是金额；评价列不被「评价内容标签 / 评价月份」抢先（列序无关）
    expect(detectColumn(['激励金额说明', '费用'], 'amount')).toBe('费用');
    expect(detectColumn(['评价内容标签', '评价月份', '评价分数'], 'rating')).toBe('评价分数');
  });
  it('服务商名称归一：半角括号 / 空格不拆成两家', () => {
    expect(normalizeProviderName('南关区顺盈安装服务中心（个体工商户)')).toBe('南关区顺盈安装服务中心（个体工商户）');
    expect(normalizeProviderName(' 中山市巧帮手家电服务有限公司 ')).toBe('中山市巧帮手家电服务有限公司');
    expect(normalizeProviderName('甲 (乙)')).toBe('甲（乙）');
    const a = table('a.xlsx', ['服务商', '金额'], [['南关区顺盈安装服务中心（个体工商户)', 100]]);
    const b = table('b.xlsx', ['服务商', '金额'], [['南关区顺盈安装服务中心（个体工商户）', 50]]);
    const r = computeSettlementSummary({ period: '2026-07', workOrders: [], feeItems: [
      { table: a, mapping: { provider: '服务商', amount: '金额' }, name: 'A', sign: 1 },
      { table: b, mapping: { provider: '服务商', amount: '金额' }, name: 'B', sign: 1 },
    ] });
    expect(r.providers).toHaveLength(1);
    expect(r.providers[0].netTotal).toBe(150);
    // 拆分附件必须按归一名过滤：两张表的行都要进同一家的附件（审查实测 6 家丢 477 行、单文件时空工作簿抛错）
    const input = { period: '2026-07', workOrders: [], feeItems: [
      { table: a, mapping: { provider: '服务商', amount: '金额' }, name: 'A', sign: 1 as const },
      { table: b, mapping: { provider: '服务商', amount: '金额' }, name: 'B', sign: 1 as const },
    ] };
    const plans = planProviderWorkbooks(input, r);
    expect(plans).toHaveLength(1);
    expect(plans[0].sheets.map((s) => s.name)).toEqual(['A', 'B']);
    expect(plans[0].sheetRowCounts).toEqual({ A: 1, B: 1 });
    // 只有半角写法的单张表：附件不能是空工作簿
    const only = { period: '2026-07', workOrders: [], feeItems: [{ table: a, mapping: { provider: '服务商', amount: '金额' }, name: 'A', sign: 1 as const }] };
    const onlyPlans = planProviderWorkbooks(only, computeSettlementSummary(only));
    expect(onlyPlans).toHaveLength(1);
    expect(onlyPlans[0].sheets).toHaveLength(1);
  });
  it('服务商别名表：改过名的同一家并成一家（客户实报：宁波鄞州亿天 + 新河亿天 按一家付款）', () => {
    const aliases = { [normalizeProviderName('宁波市鄞州新河亿天电器维修服务部')]: normalizeProviderName('宁波市鄞州亿天电器维修服务部（个体工商户）') };
    const install = table('jd.xlsx', ['一级服务商名称', '是否差评'], [
      ['宁波市鄞州亿天电器维修服务部（个体工商户）', '非差评'], ['宁波市鄞州新河亿天电器维修服务部', '非差评'], ['宁波市鄞州新河亿天电器维修服务部', '非差评'],
    ]);
    const r = computeReviewIncentive({ jdInstall: [{ table: install, mapping: { provider: '一级服务商名称', badFlag: '是否差评' } }], jdAfterSales: [], tmall: [], aliases });
    expect(r.providers.map((p) => p.provider)).toEqual(['宁波市鄞州亿天电器维修服务部（个体工商户）']);
    expect(r.providers[0].goodOrders).toBe(3);
    const fee = table('fee.xlsx', ['服务商', '金额'], [['宁波市鄞州新河亿天电器维修服务部', 630], ['宁波市鄞州亿天电器维修服务部（个体工商户）', 165]]);
    const input = { period: '2026-07', workOrders: [], feeItems: [{ table: fee, mapping: { provider: '服务商', amount: '金额' }, name: 'A', sign: 1 as const }], aliases };
    const s = computeSettlementSummary(input);
    expect(s.providers).toHaveLength(1);
    expect(s.providers[0].netTotal).toBe(795);
    const plans = planProviderWorkbooks(input, s);
    expect(plans[0].sheetRowCounts).toEqual({ A: 2 }); // 附件里两行都在
  });
  it('可评价单数表里多出来的服务商不注入结果', () => {
    const install = table('jd.xlsx', ['一级服务商名称', '是否差评'], [['甲', '非差评'], ['甲', '非差评']]);
    const ev = table('ev.xlsx', ['服务商', '安装完工单量', '安装评价率'], [['甲', 10, ''], ['路人', 99, ''], ['丁', '', '60%']]);
    const r = computeReviewIncentive({ jdInstall: [{ table: install, mapping: { provider: '一级服务商名称', badFlag: '是否差评' } }], jdAfterSales: [], tmall: [], evaluableCounts: [{ table: ev, mapping: { provider: '服务商', evaluableCount: '安装完工单量', rateY: '安装评价率' } }] });
    expect(r.providers.map((p) => p.provider)).toEqual(['甲']);
    expect(r.totals.providerCount).toBe(1);
    expect(r.warnings.some((w) => w.includes('路人') || w.includes('不在评价明细'))).toBe(true);
  });
  it('是否好评激励 / 可评价单数 角色', () => {
    expect(detectColumn(['一级服务商名称', '是否差评', '是否好评激励'], 'counted')).toBe('是否好评激励');
    expect(detectColumn(['服务商', '安装完工单量', '基础金额'], 'evaluableCount')).toBe('安装完工单量');
  });
});

describe('toCounted：客户「是否好评激励」取值 好评激励 / /', () => {
  it('识别肯定/否定/占位', () => {
    expect(toCounted('好评激励')).toBe(true);
    expect(toCounted('/')).toBe(false);
    expect(toCounted('—')).toBe(false);
    expect(toCounted('非好评激励')).toBe(false);
    expect(toCounted('是')).toBe(true);
    expect(toCounted('否')).toBe(false);
    expect(toCounted('')).toBeUndefined();
  });
  it('好评激励核算：/ 行被剔除，天猫同样', () => {
    const install = table('jd.xlsx', ['一级服务商名称', '是否差评', '是否好评激励'], [
      ['甲', '非差评', '好评激励'], ['甲', '非差评', '/'], ['甲', '差评', '好评激励'], ['乙', '非差评', '好评激励'],
    ]);
    const tmall = table('tm.xlsx', ['所属一级服务商', '评价分数', '是否好评激励'], [['甲', '5', '好评激励'], ['甲', '5', '/']]);
    const r = computeReviewIncentive({ jdInstall: [{ table: install, mapping: { provider: '一级服务商名称', badFlag: '是否差评', counted: '是否好评激励' } }], jdAfterSales: [], tmall: [{ table: tmall, mapping: { provider: '所属一级服务商', rating: '评价分数', counted: '是否好评激励' } }] });
    const a = r.providers.find((p) => p.provider === '甲')!;
    expect(a.excludedOrders).toBe(1);
    expect(a.goodOrders).toBe(1);
    expect(a.badOrders).toBe(1);
    expect(a.tmallGood).toBe(1);
    expect(a.rateYKnown).toBe(false);
    expect(a.coef).toBe(1); // 评价率未知 → 最低档，而不是按 100% 给 1.5
    expect(r.warnings.some((w) => w.includes('算不出评价率'))).toBe(true);
  });
  it('可评价单数表：覆盖评价率 Y', () => {
    const install = table('jd.xlsx', ['一级服务商名称', '是否差评'], [['甲', '非差评'], ['甲', '非差评'], ['甲', '非差评'], ['乙', '非差评']]);
    const ev = table('ev.xlsx', ['服务商', '安装完工单量'], [['甲', 10]]);
    const r = computeReviewIncentive({ jdInstall: [{ table: install, mapping: { provider: '一级服务商名称', badFlag: '是否差评' } }], jdAfterSales: [], tmall: [], evaluableCounts: [{ table: ev, mapping: { provider: '服务商', evaluableCount: '安装完工单量' } }] });
    const a = r.providers.find((p) => p.provider === '甲')!;
    expect(a.evaluableOrders).toBe(10);
    expect(a.rateY).toBeCloseTo(0.3, 4);
    expect(a.coef).toBe(1); // <50% → 1
    expect(a.rateYKnown).toBe(true);
    expect(r.warnings.some((w) => w.includes('乙'))).toBe(true); // 乙不在表里
  });
  it('评价率口径（2026-09-09 客户确认）：Y = 中好评价（非差评）÷ 完工总单量；「中好评价量」列可覆盖分子；computeReviewRates 单独成块', () => {
    const install = table('jd.xlsx', ['一级服务商名称', '是否差评', '是否好评激励'], [
      ['甲', '非差评', '好评激励'], ['甲', '非差评', '/'], ['甲', '差评', '/'], ['甲', '非差评', '好评激励'],
      ['乙', '非差评', '好评激励'], ['丙', '非差评', '好评激励'],
    ]);
    // 甲：已评价 4、差评 1 → 中好评价 3；完工 6 → Y = 50% → 系数 1.2（若按已评价 4/6 = 66.7% 会错给 1.5）
    // 乙：CSS 直接给了「中好评价量」2、完工 5 → Y = 40%（分子不用明细的 1）
    const ev = table('css.xlsx', ['服务商', '京东安装完工总单量', '完工中好评价量'], [['甲', 6, ''], ['乙', 5, 2]]);
    const mapping = detectColumns(ev.headers, ['provider', 'evaluableCount', 'midGoodCount', 'rateY', 'badRateX']);
    expect(mapping).toMatchObject({ provider: '服务商', evaluableCount: '京东安装完工总单量', midGoodCount: '完工中好评价量' });
    const input = { jdInstall: [{ table: install, mapping: { provider: '一级服务商名称', badFlag: '是否差评', counted: '是否好评激励' } }], jdAfterSales: [], tmall: [], evaluableCounts: [{ table: ev, mapping }] };
    const r = computeReviewIncentive(input);
    const a = r.providers.find((p) => p.provider === '甲')!;
    expect(a).toMatchObject({ ratedOrders: 4, badOrders: 1, midGoodOrders: 3, goodOrders: 2, evaluableOrders: 6, rateY: 0.5, coef: 1.2, rateYSource: 'css', badRateXSource: 'detail' });
    const b = r.providers.find((p) => p.provider === '乙')!;
    expect(b).toMatchObject({ midGoodOrders: 2, evaluableOrders: 5, rateY: 0.4, coef: 1, rateYSource: 'css' });
    const c = r.providers.find((p) => p.provider === '丙')!;
    expect(c).toMatchObject({ rateYKnown: false, rateYSource: 'unknown', coef: 1 });
    // 单独成块：逐家分子分母 + 来源 + 汇总
    const rates = computeReviewRates(input);
    expect(rates.summary).toEqual({ providerCount: 3, withRate: 2, unknown: 1, fromCss: 2, fromReport: 0 });
    expect(rates.providers.find((p) => p.provider === '甲')).toMatchObject({ completedOrders: 6, ratedOrders: 4, midGoodOrders: 3, badOrders: 1, rateY: 0.5, rateYSource: 'css' });
    expect(rates.providers.find((p) => p.provider === '丙')).toMatchObject({ completedOrders: null, rateY: null, rateYSource: 'unknown' });
    const rows = reviewRatesToRows(rates);
    expect(rows.find((x) => x[0] === '甲')).toEqual(['甲', 6, 4, 3, '50.00%', '完工总单量表算出', 1, '25.00%', '评价明细算出']);
    expect(rows.find((x) => x[0] === '丙')?.slice(1, 6)).toEqual(['—', 1, 1, '—', '无分母，未知（系数按最低档）']);
  });
  it('平台评价率 / 差评率报表直接覆盖 Y 与 X', () => {
    const install = table('jd.xlsx', ['一级服务商名称', '是否差评'], [['甲', '非差评'], ['甲', '非差评'], ['乙', '非差评']]);
    const rep = table('rate.xlsx', ['服务商', '安装评价率', '安装差评率'], [['甲', '65%', '0.8%'], ['乙', '0.55', '0.001']]);
    const r = computeReviewIncentive({ jdInstall: [{ table: install, mapping: { provider: '一级服务商名称', badFlag: '是否差评' } }], jdAfterSales: [], tmall: [], evaluableCounts: [{ table: rep, mapping: { provider: '服务商', rateY: '安装评价率', badRateX: '安装差评率' } }] });
    const a = r.providers.find((p) => p.provider === '甲')!;
    const b = r.providers.find((p) => p.provider === '乙')!;
    expect(a.rateY).toBeCloseTo(0.65, 4); expect(a.coef).toBe(1.5); expect(a.baseAmount).toBe(5); expect(a.installIncentive).toBe(2 * 5 * 1.5);
    expect(b.rateY).toBeCloseTo(0.55, 4); expect(b.coef).toBe(1.2); expect(b.baseAmount).toBe(10);
  });
});

describe('结案汇总：正负号 / 占位服务商 / 不外发列', () => {
  it('guessFeeSign 认客户命名', () => {
    expect(guessFeeSign('已录补扣-26年6月各区域旧机回收激励金额')).toBe(1);
    expect(guessFeeSign('已录补扣-2026年6月工单补贴')).toBe(1);
    expect(guessFeeSign('2026年7月补扣')).toBe(-1);
    expect(guessFeeSign('考核扣款')).toBe(-1);
  });
  it('isBogusProvider', () => {
    for (const s of ['', '\\', '/', '-', '合计', '小计', '12345', 'N/A']) expect(isBogusProvider(s)).toBe(true);
    for (const s of ['重庆适时电器售后服务有限公司', '（番南区）广州林博电器有限公司']) expect(isBogusProvider(s)).toBe(false);
  });
  it('汇总剔除占位行并告警；拆分文件不带不外发列', () => {
    const fee = table('已录补扣-旧机回收激励.xlsx', ['建单一级服务商全称', '激励金额', '服务商类型-不外发', '文件名'], [
      ['甲', 10, '专业服务商', 'x'], ['\\', 99, '', 'x'], ['合计', 109, '', ''],
    ]);
    const input = { period: '2026-07', workOrders: [], feeItems: [{ table: fee, mapping: { provider: '建单一级服务商全称', amount: '激励金额' }, name: '旧机回收激励', sign: 1 as const }] };
    const res = computeSettlementSummary(input);
    expect(res.providers.map((p) => p.provider)).toEqual(['甲']);
    expect(res.totals.incentiveTotal).toBe(10);
    expect(res.warnings.some((w) => w.includes('占位'))).toBe(true);
    const plans = planProviderWorkbooks(input, res);
    expect(plans).toHaveLength(1);
    expect(plans[0].sheets[0].headers).toEqual(['建单一级服务商全称', '激励金额', '文件名']);
    expect(stripInternalColumns(fee).headers).not.toContain('服务商类型-不外发');
  });
});

describe('服务商名称变体自动归并（2026-09-07 客户对账：总表按全称合并）', () => {
  it('骨架：去括号 / 去市 / 剥法律形态与业态词', () => {
    expect(providerSkeleton('甘肃海象商贸有限公司')).toBe('甘肃海象');
    expect(providerSkeleton('甘肃海象')).toBe('甘肃海象');
    expect(providerSkeleton('大同市开发区美和乐电器经销部')).toBe(providerSkeleton('大同开发区美和乐电器经销部'));
    expect(providerSkeleton('惠州市惠阳区淡水金粤新电器服务商')).toBe(providerSkeleton('惠州市惠阳区淡水金粤新电器服务部'));
    expect(providerSkeleton('黄山高新区鑫禾源电器商行（个体工商户）')).toBe(providerSkeleton('黄山高新区鑫禾源电器商行'));
    expect(providerSkeleton('黄山高新区鑫禾源电器商行(个体工商户)')).toBe(providerSkeleton('黄山高新区鑫禾源电器商行'));
    // 真不是一家的不能相等
    expect(providerSkeleton('宁波市鄞州新河亿天电器维修服务部')).not.toBe(providerSkeleton('宁波市鄞州亿天电器维修服务部（个体工商户）'));
    expect(providerSkeleton('大同市雄进商贸有限公司')).not.toBe(providerSkeleton('大同市开发区美和乐电器经销部'));
  });
  it('明细名归到通讯录规范名：骨架相等或唯一前缀；多家命中不并；手工别名优先', () => {
    const directory = ['甘肃海象商贸有限公司', '大同市开发区美和乐电器经销部', '惠州市惠阳区淡水金粤新电器服务部', '黄山高新区鑫禾源电器商行（个体工商户）', '宁波市鄞州亿天电器维修服务部（个体工商户）', '北京海淀甲电器服务部', '北京海淀乙电器服务部'];
    const observed = ['甘肃海象', '大同开发区美和乐电器经销部', '惠州市惠阳区淡水金粤新电器服务商', '黄山高新区鑫禾源电器商行', '宁波市鄞州新河亿天电器维修服务部', '北京海淀', '甘肃海象商贸有限公司', '南宁市经开区乐师傅家电维修服务部'];
    const { map, merges } = buildProviderAliasMap({ directory, observed, aliases: { '宁波市鄞州新河亿天电器维修服务部': '宁波市鄞州亿天电器维修服务部（个体工商户）' } });
    expect(map['甘肃海象']).toBe('甘肃海象商贸有限公司');
    expect(map['大同开发区美和乐电器经销部']).toBe('大同市开发区美和乐电器经销部');
    expect(map['惠州市惠阳区淡水金粤新电器服务商']).toBe('惠州市惠阳区淡水金粤新电器服务部');
    expect(map['黄山高新区鑫禾源电器商行']).toBe('黄山高新区鑫禾源电器商行（个体工商户）');
    // 手工别名保留且不算自动归并
    expect(map['宁波市鄞州新河亿天电器维修服务部']).toBe('宁波市鄞州亿天电器维修服务部（个体工商户）');
    expect(merges.some((m) => m.from.includes('新河'))).toBe(false);
    // 「北京海淀」同时是甲、乙两家的前缀 → 不并；通讯录里没有的南宁乐师傅原样保留；规范名本身不进别名表
    expect(map['北京海淀']).toBeUndefined();
    expect(map['南宁市经开区乐师傅家电维修服务部']).toBeUndefined();
    expect(map['甘肃海象商贸有限公司']).toBeUndefined();
    expect(merges).toHaveLength(4);
  });
  it('通讯录为空：本次出现的写法之间互相归并，规范名取最长；链条压平', () => {
    const { map, merges } = buildProviderAliasMap({ observed: ['甘肃海象', '甘肃海象商贸', '甘肃海象商贸有限公司', '南关区顺盈安装服务中心'] });
    expect(map['甘肃海象']).toBe('甘肃海象商贸有限公司');
    expect(map['甘肃海象商贸']).toBe('甘肃海象商贸有限公司');
    expect(map['南关区顺盈安装服务中心']).toBeUndefined();
    expect(merges.every((m) => m.to === '甘肃海象商贸有限公司')).toBe(true);
    // 别名表喂给汇总：三种写法一行
    const a = table('a.xlsx', ['服务商', '金额'], [['甘肃海象', 100], ['甘肃海象商贸', 20], ['甘肃海象商贸有限公司', 80]]);
    const r = computeSettlementSummary({ period: '2026-07', workOrders: [], feeItems: [{ table: a, mapping: { provider: '服务商', amount: '金额' }, name: 'A', sign: 1 }], aliases: map });
    expect(r.providers).toHaveLength(1);
    expect(r.providers[0]).toMatchObject({ provider: '甘肃海象商贸有限公司', netTotal: 200 });
  });
});

const DATA = '/Users/macpro/Downloads/AI结算测试';
describe.skipIf(!existsSync(DATA))('真实数据对账（品牌方 2026-07）', () => {
  it('结案：明细里的名称变体并到客户名单的全称后，与总表逐家一致（达人样机 / 咨询 / 旧机回收）', () => {
    const dir = join(DATA, '服务费结案/补扣费用');
    const directory = readTable(join(DATA, '电商好评/好评明细.xlsx'), { sheetName: 'Sheet1' }).rows.map((r) => r['服务商名称']).filter(Boolean);
    expect(directory.length).toBeGreaterThan(200);
    const specs = [
      { file: '已录补扣-7月达人样机费用核销登记表-要发蒋维匹重.xlsx', summaries: ['2026年7月达人样机费用'] },
      { file: '已录补扣-【2026】咨询及客诉特殊处理方案登记表7月.xlsx', summaries: ['【BG-169】2026年7月咨询及客诉特殊处理方案'] },
      { file: '已录补扣-26年6月各区域旧机回收激励金额.xlsx', summaries: ['2026年6月旧机回收激励'] },
    ];
    const master = readTable(join(dir, '2026年7月补扣.xlsx'), { sheetName: '2026年7月补扣' });
    const feeItems = specs.map((s) => {
      const names = listSheetNames(join(dir, s.file));
      const t = readTable(join(dir, s.file), { sheetName: names.length > 1 ? names.find((n) => n.includes('外发')) : undefined });
      return { table: t, mapping: detectColumns(t.headers, ['provider', 'amount']), name: s.file, sign: 1 as const };
    });
    const observed = feeItems.flatMap((f) => f.table.rows.map((r) => r[f.mapping.provider]));
    // 宁波新河亿天 → 亿天 是客户按一家付款的商业决定，只能手工别名
    const { map, merges } = buildProviderAliasMap({ directory, observed, aliases: { '宁波市鄞州新河亿天电器维修服务部': '宁波市鄞州亿天电器维修服务部（个体工商户）' } });
    const pairs = Object.fromEntries(merges.map((m) => [m.from, m.to]));
    expect(pairs).toMatchObject({
      '甘肃海象': '甘肃海象商贸有限公司',
      '大同开发区美和乐电器经销部': '大同市开发区美和乐电器经销部',
      '惠州市惠阳区淡水金粤新电器服务商': '惠州市惠阳区淡水金粤新电器服务部',
      '黄山高新区鑫禾源电器商行': '黄山高新区鑫禾源电器商行（个体工商户）',
    });
    // 自动归并只允许这几对 + 通讯录半角 / 全角同名：不能把不相干的两家并了
    for (const m of merges) expect(providerSkeleton(m.from).length, `${m.from} → ${m.to}`).toBeGreaterThanOrEqual(4);
    const res = computeSettlementSummary({ period: '2026-07', workOrders: [], feeItems, aliases: map });
    const ours = new Map(res.providers.map((p) => [p.provider, p.netTotal]));
    const truth = new Map<string, number>();
    const wanted = new Set(specs.flatMap((s) => s.summaries));
    for (const row of master.rows) if (wanted.has((row['摘要'] || '').trim())) { const p = normalizeProviderName(row['服务商']); truth.set(p, (truth.get(p) || 0) + (Number(row['待补扣金额']) || 0)); }
    for (const [p, v] of truth) {
      // 客户总表写了全称但客户名单里没有的（南宁乐师傅）：我们只能按明细的写法出，允许差一个括号后缀
      const mine = ours.get(p) ?? ours.get(p.replace(/（[^（）]*）$/, ''));
      expect(mine, p).toBeDefined();
      expect(Math.abs(mine! - v), p).toBeLessThan(0.005);
    }
    expect(ours.size).toBe(truth.size);
  });
  it('好评：客户 2026-09-09 补的《按CSS补充可匹配到工程师的明细》「服务商版」当评价率报表 → 164 家逐家一致、合计 185,807', () => {
    const p = join(DATA, '电商好评/好评激励-按CSS补充明细.xlsx');
    if (!existsSync(p)) return;
    const install = readTable(p, { sheetName: '京东安装评价明细' });
    const after = readTable(p, { sheetName: '京东售后满意明细' });
    const tmall = readTable(p, { sheetName: '天猫安装评价明细' });
    const report = readTable(p, { sheetName: '好评激励（服务商版）' });
    const me = detectColumns(report.headers, ['provider', 'evaluableCount', 'midGoodCount', 'rateY', 'badRateX']);
    expect(me).toMatchObject({ provider: '服务商名称', rateY: '京东安装评价率', badRateX: '京东安装差评率' });
    const input = {
      jdInstall: [{ table: install, mapping: detectColumns(install.headers, ['provider', 'badFlag', 'counted']) }],
      jdAfterSales: [{ table: after, mapping: detectColumns(after.headers, ['provider', 'satisfaction']) }],
      tmall: [{ table: tmall, mapping: detectColumns(tmall.headers, ['provider', 'rating', 'counted']) }],
      evaluableCounts: [{ table: report, mapping: me }],
    };
    const r = computeReviewIncentive(input);
    const truth = new Map(report.rows.filter((x) => /^\d+$/.test(String(x['序号']))).map((x) => [normalizeProviderName(x['服务商名称']), Number(x['总金额'])]));
    expect(truth.size).toBe(164);
    let exact = 0;
    for (const x of r.providers) if (truth.has(x.provider) && Math.abs(truth.get(x.provider)! - x.total) < 0.005) exact += 1;
    expect(exact).toBe(164);
    expect(r.totals.total).toBe(185807);
    // 单独成块的评价率：164 家全部来自平台报表
    const rates = computeReviewRates(input);
    expect(rates.summary).toMatchObject({ providerCount: 164, fromReport: 164, unknown: 0 });
    // 客户 5 星好评量 = 我方有效好评（164/164），中好评价 = 非差评 ≥ 有效好评
    for (const x of r.providers) expect(x.midGoodOrders).toBeGreaterThanOrEqual(x.goodOrders);
  });
  it('好评：/ 行被剔除，售后 576 单、天猫 929 单', () => {
    const p = join(DATA, '电商好评/好评明细.xlsx');
    const install = readTable(p, { sheetName: '京东安装评价明细' });
    const after = readTable(p, { sheetName: '京东售后满意明细' });
    const tmall = readTable(p, { sheetName: '天猫安装评价明细' });
    const mi = detectColumns(install.headers, ['provider', 'badFlag', 'counted']);
    const ma = detectColumns(after.headers, ['provider', 'satisfaction']);
    const mt = detectColumns(tmall.headers, ['provider', 'rating', 'counted']);
    expect(mi.provider).toBe('一级服务商名称');
    expect(ma.provider).toBe('所属一级服务商');
    expect(mt.provider).toBe('所属一级服务商');
    expect(mi.counted).toBe('是否好评激励');
    const r = computeReviewIncentive({ jdInstall: [{ table: install, mapping: mi }], jdAfterSales: [{ table: after, mapping: ma }], tmall: [{ table: tmall, mapping: mt }] });
    const excluded = r.providers.reduce((s, x) => s + x.excludedOrders, 0);
    expect(excluded).toBe(123);
    expect(r.totals.afterSalesIncentive).toBe(5760);
    expect(r.totals.tmallIncentive).toBe(929 * 5);
    expect(r.warnings.some((w) => w.includes('算不出评价率'))).toBe(true);
    // 客户 7 月补扣总表里「2026年7月好评激励」163 家真值：评价率未知按最低档时应有 ≥110 家逐家一致
    // （其余家是客户按平台评价率/差评率报表给了 1.2/1.5 系数或 5 元基础——需要那份报表才能全对）
    const master = readTable(join(DATA, '服务费结案/补扣费用/2026年7月补扣.xlsx'), { sheetName: '2026年7月补扣' });
    const truth = new Map<string, number>();
    for (const row of master.rows) if ((row['摘要'] || '').trim() === '2026年7月好评激励') truth.set((row['服务商'] || '').trim(), Number(row['待补扣金额']) || 0);
    expect(truth.size).toBeGreaterThan(150);
    let exact = 0;
    for (const p of r.providers) if (truth.has(p.provider) && Math.abs(truth.get(p.provider)! - p.total) < 0.01) exact += 1;
    expect(exact).toBeGreaterThanOrEqual(110);
  });
  it('结案：一级服务商口径、不外发列剔除', () => {
    const dir = join(DATA, '服务费结案/补扣费用');
    const t = readTable(join(dir, '已录补扣-26年6月各区域旧机回收激励金额.xlsx'), { sheetName: '6.1-6.30旧机回收源数据（现场建单）-外发' });
    const det = detectColumns(t.headers, ['provider', 'amount']);
    expect(det.provider).toBe('建单一级服务商全称');
    expect(det.amount).toBe('激励金额');
    const t2 = readTable(join(dir, '2026年7月补扣.xlsx'), { sheetName: '2026年7月补扣' });
    expect(detectColumns(t2.headers, ['provider', 'amount']).amount).toBe('待补扣金额');
    const input = { period: '2026-07', workOrders: [], feeItems: [{ table: t, mapping: det, name: '旧机回收激励', sign: 1 as const }] };
    const res = computeSettlementSummary(input);
    expect(res.providers.some((p) => p.provider === '\\')).toBe(false);
    const plans = planProviderWorkbooks(input, res);
    expect(plans.every((pl) => pl.sheets.every((s) => !s.headers.some((h) => /不外发/.test(h))))).toBe(true);
    // 真实：一级服务商数量应远小于 511（二级口径）
    expect(res.providers.length).toBeLessThan(300);
  });
});

describe('xlsx 合成读取冒烟', () => {
  it('readTable 能读本测试写出的文件', () => {
    const dir = mkdtempSync(join(tmpdir(), 'ss-fix-'));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet([['服务商', '金额'], ['甲', 1]]), 'S');
    const p = join(dir, 'a.xlsx');
    writeFileSync(p, XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' }));
    expect(readTable(p).rows).toHaveLength(1);
  });
});
