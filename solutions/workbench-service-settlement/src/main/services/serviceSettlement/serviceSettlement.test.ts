/**
 * 服务商结算工作台 · 四个模块的确定性计算护栏。
 *
 * 这些数字全部来自需求文档《智能体8.21》里的政策规则表：
 *   X > 0.6% → 5 元；X ≤ 0.6% → 10 元；Y<50% 系数 1 / 50~60% 1.2 / ≥60% 1.5；
 *   售后满意 10 元/单；天猫好评 5 元/单。
 * 改规则默认值之前先看这里——业务同事拿这张表对账，错一分都是投诉。
 */
import { describe, it, expect } from 'vitest';
import { mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { detectColumns, toStars, toBool, readTable, writeWorkbook, toNumber } from './excel';
import { computeReviewIncentive, coefFor, baseAmountFor, DEFAULT_REVIEW_RULES, reviewResultToRows } from './reviewIncentive';
import { computeSettlementSummary, planProviderWorkbooks, evaluateTracking, renderInvoiceFileName, guessFeeSign, parseRecipients, formatRecipients, followUpDue, FOLLOW_UP_MAX_ROUNDS } from './settlementSummary';
import { parseLeaderInfoFromTable } from './marketingIncentive';
import { mergeTables, matchChannels, aggregateScrap } from './scrapLedger';
import {
  computeAchievement, computeIncentives, sanitizeMarketingRules, DEFAULT_MARKETING_RULES,
  validateIdCard, validateBankCard, parseLeaderInfoFromText, laborTax, fillTaxTemplate, quarterRange, secondNoticeDue,
} from './marketingIncentive';
import type { SheetTable } from './excel';

function table(fileName: string, headers: string[], rows: (string | number)[][]): SheetTable {
  return {
    path: `/tmp/${fileName}`, fileName, sheetName: 'Sheet1', headers,
    rows: rows.map((r) => Object.fromEntries(headers.map((h, i) => [h, String(r[i] ?? '')]))),
  };
}

describe('Excel 列识别与取值', () => {
  it('按关键字优先级识别服务商 / 星级 / 可评价列，且不重复占用', () => {
    const headers = ['工单号', '服务商名称', '是否可评价', '评价星级', '是否计取', 'SKU'];
    const m = detectColumns(headers, ['provider', 'rating', 'evaluable', 'counted', 'sku', 'orderNo']);
    expect(m).toEqual({ provider: '服务商名称', rating: '评价星级', evaluable: '是否可评价', counted: '是否计取', sku: 'SKU', orderNo: '工单号' });
  });
  it('星级解析容忍 五星 / ★ / 好评 / 百分制', () => {
    expect(toStars('五星')).toBe(5);
    expect(toStars('★★★★')).toBe(4);
    expect(toStars('好评')).toBe(5);
    expect(toStars('差评')).toBe(1);
    expect(toStars('100')).toBe(5);
    expect(toStars('未评价')).toBeNull();
    expect(toStars('')).toBeNull();
  });
  it('是否列解析', () => {
    expect(toBool('是')).toBe(true);
    expect(toBool('否')).toBe(false);
    expect(toBool('不计取')).toBe(false);
    expect(toBool('')).toBeUndefined();
  });
  it('金额解析去掉千分位和单位', () => {
    expect(toNumber('1,234.50 元')).toBe(1234.5);
    expect(toNumber('12%')).toBeCloseTo(0.12);
  });
  it('写出再读回：表头行自动识别，空行丢弃', () => {
    const dir = mkdtempSync(join(tmpdir(), 'ss-xlsx-'));
    const p = join(dir, 'a.xlsx');
    writeWorkbook(p, [{ name: '结果', headers: ['服务商', '金额'], rows: [['甲', 10], ['乙', 20.5]] }]);
    const t = readTable(p);
    expect(t.headers).toEqual(['服务商', '金额']);
    expect(t.rows).toEqual([{ 服务商: '甲', 金额: '10' }, { 服务商: '乙', 金额: '20.5' }]);
    rmSync(dir, { recursive: true, force: true });
  });
});

describe('模块一 · 好评激励', () => {
  it('规则表：差评率阈值 0.6%，系数 1 / 1.2 / 1.5', () => {
    expect(baseAmountFor(0.007, DEFAULT_REVIEW_RULES)).toBe(5);
    expect(baseAmountFor(0.006, DEFAULT_REVIEW_RULES)).toBe(10);
    expect(coefFor(0.49, DEFAULT_REVIEW_RULES)).toBe(1);
    expect(coefFor(0.5, DEFAULT_REVIEW_RULES)).toBe(1.2);
    expect(coefFor(0.6, DEFAULT_REVIEW_RULES)).toBe(1.5);
  });
  it('自营 + POP 合并算率，不计取 SKU 剔除，① ② ③ 相加', () => {
    const headers = ['服务商', '评价星级', '是否可评价', '是否计取'];
    const selfRun = table('京东自营.xlsx', headers, [
      ['甲', '5', '是', '是'], ['甲', '5', '是', '是'], ['甲', '', '是', '是'], ['甲', '1', '是', '是'],
      ['甲', '5', '是', '否'], // 不计取：既不进分母也不进好评
      ['甲', '', '否', '是'], // 不可评价
    ]);
    const pop = table('京东POP.xlsx', headers, [
      ['甲', '5', '是', '是'], ['甲', '', '是', '是'],
    ]);
    const afterSales = table('售后.xlsx', ['服务商', '满意度'], [['甲', '非常满意'], ['甲', '满意'], ['甲', '不满意']]);
    const tmall = table('天猫.xlsx', ['服务商', '评价'], [['甲', '好评'], ['甲', '中评']]);
    const r = computeReviewIncentive({
      jdInstall: [
        { table: selfRun, mapping: { provider: '服务商', rating: '评价星级', evaluable: '是否可评价', counted: '是否计取' } },
        { table: pop, mapping: { provider: '服务商', rating: '评价星级', evaluable: '是否可评价', counted: '是否计取' } },
      ],
      jdAfterSales: [{ table: afterSales, mapping: { provider: '服务商', satisfaction: '满意度' } }],
      tmall: [{ table: tmall, mapping: { provider: '服务商', rating: '评价' } }],
    });
    const p = r.providers[0];
    // 「不计取」的 SKU 按需求原文是「可评价但不计取数」：进可评价 / 已评价（X、Y 的分母），只是不拿激励。
    // 可评价（完工）= 自营 5 + POP 2 = 7；已评价 = 自营 4 + POP 1 = 5；
    // 评价率按客户口径（2026-09-09 黄丽清确认）= 完工中好评价量 ÷ 完工总单量，中好评价 = 非差评 = 5 − 1 = 4 → Y = 57.1% → 系数 1.2
    // （2026-09-07 客户对账实锤：京东表里差评行「是否好评激励」= /，若整行剔掉，差评率恒 0，27 家多算）
    expect(p.evaluableOrders).toBe(7);
    expect(p.ratedOrders).toBe(5);
    expect(p.midGoodOrders).toBe(4);
    expect(p.rateY).toBeCloseTo(0.5714, 3);
    expect(p.rateYSource).toBe('detail'); // 分母来自明细自带的「是否可评价」列，不是完工总单量表
    expect(p.completedKnown).toBe(true);
    // 差评 1 / 已评价 5 = 20% > 0.6% → 基础 5 元；好评 3 单（不计取那单不算好评）
    expect(p.badOrders).toBe(1);
    expect(p.baseAmount).toBe(5);
    expect(p.goodOrders).toBe(3);
    expect(p.installIncentive).toBe(3 * 5 * 1.2);
    expect(p.afterSalesSatisfied).toBe(2);
    expect(p.afterSalesIncentive).toBe(20);
    expect(p.tmallGood).toBe(1);
    expect(p.tmallIncentive).toBe(5);
    expect(p.total).toBe(18 + 20 + 5);
    expect(p.excludedOrders).toBe(1);
    const rows = reviewResultToRows(r);
    expect(rows[rows.length - 1][0]).toBe('合计');
  });
});

describe('模块二 · 结案汇总与拆分', () => {
  it('工单结算 + 激励 − 补扣 = 应付；按服务商拆成以服务商命名的文件、子表按费用项命名', () => {
    const wo = table('工单结算明细.xlsx', ['服务商', '工单号', '结算金额'], [['甲', 'A1', 100], ['乙', 'B1', 50], ['甲', 'A2', 30]]);
    const bonus = table('好评激励.xlsx', ['服务商', '金额'], [['甲', 20]]);
    const fine = table('质量补扣.xlsx', ['服务商', '金额'], [['甲', 15], ['乙', 5]]);
    const input = {
      period: '2026-08',
      workOrders: [{ table: wo, mapping: { provider: '服务商', amount: '结算金额' } }],
      feeItems: [
        { table: bonus, mapping: { provider: '服务商', amount: '金额' }, name: '好评激励', sign: 1 as const },
        { table: fine, mapping: { provider: '服务商', amount: '金额' }, name: '质量补扣', sign: guessFeeSign('质量补扣') },
      ],
    };
    const r = computeSettlementSummary(input);
    const jia = r.providers.find((p) => p.provider === '甲')!;
    expect(jia.workOrderAmount).toBe(130);
    expect(jia.items).toEqual({ 好评激励: 20, 质量补扣: -15 });
    expect(jia.netTotal).toBe(135);
    expect(r.totals.netTotal).toBe(135 + 45);
    const plans = planProviderWorkbooks(input, r);
    expect(new Set(plans.map((p) => p.fileName))).toEqual(new Set(['乙.xlsx', '甲.xlsx']));
    const jiaPlan = plans.find((p) => p.provider === '甲')!;
    expect(jiaPlan.sheets.map((s) => s.name)).toEqual(['工单结算明细', '好评激励', '质量补扣']);
    expect(jiaPlan.sheets[0].rows).toHaveLength(2);
    const yiPlan = plans.find((p) => p.provider === '乙')!;
    expect(yiPlan.sheets.map((s) => s.name)).toEqual(['工单结算明细', '质量补扣']);
  });
  it('付款跟踪：20 天未开票预警、发票到 3 天未核销提醒、核销结束即付款', () => {
    const now = Date.parse('2026-09-01T00:00:00Z');
    const d = (daysAgo: number) => new Date(now - daysAgo * 86400000).toISOString();
    expect(evaluateTracking({ period: '2026-08', provider: '甲', sentAt: d(21) }, now)).toMatchObject({ invoiceOverdue: true, stage: 'awaiting_invoice', readState: 'sent' });
    expect(evaluateTracking({ period: '2026-08', provider: '甲', sentAt: d(10) }, now).invoiceOverdue).toBe(false);
    expect(evaluateTracking({ period: '2026-08', provider: '甲', sentAt: d(10), invoiceReceivedAt: d(3) }, now)).toMatchObject({ writeoffReminderDue: true, stage: 'awaiting_writeoff' });
    expect(evaluateTracking({ period: '2026-08', provider: '甲', sentAt: d(10), invoiceReceivedAt: d(3), writeoffStartedAt: d(1) }, now)).toMatchObject({ writeoffReminderDue: false, stage: 'writeoff_in_progress' });
    expect(evaluateTracking({ period: '2026-08', provider: '甲', sentAt: d(10), readAt: d(9), invoiceReceivedAt: d(5), writeoffStartedAt: d(4), writeoffCompletedAt: d(1) }, now)).toMatchObject({ paid: true, stage: 'paid', readState: 'read' });
  });
  it('收件人：逗号 / 分号 / 换行隔开的多个邮箱都拆开，去重，格式不对的单独列出', () => {
    expect(parseRecipients('a@x.com, b@y.cn；c@z.com\n a@X.com')).toEqual({ valid: ['a@x.com', 'b@y.cn', 'c@z.com'], invalid: [] });
    expect(parseRecipients('a@x.com，财务 ,b@y')).toEqual({ valid: ['a@x.com'], invalid: ['财务', 'b@y'] });
    expect(parseRecipients('')).toEqual({ valid: [], invalid: [] });
    expect(formatRecipients(' a@x.com;b@y.cn ')).toBe('a@x.com, b@y.cn');
  });
  it('自动跟进：未读满 N 天重发、已读满 N 天催办，同一个 N；收到发票 / 付款 / 到轮数上限就停', () => {
    const now = Date.parse('2026-09-10T00:00:00Z');
    const d = (daysAgo: number) => new Date(now - daysAgo * 86400000).toISOString();
    const base = { period: '2026-08', provider: '甲' };
    expect(followUpDue({ ...base }, 3, now)).toBeNull();                                   // 没发过
    expect(followUpDue({ ...base, sentAt: d(2) }, 3, now)).toBeNull();                     // 未读但没满 3 天
    expect(followUpDue({ ...base, sentAt: d(3) }, 3, now)).toBe('resend');                 // 未读满 3 天
    expect(followUpDue({ ...base, sentAt: d(10), resentAt: d(1), resendCount: 1 }, 3, now)).toBeNull(); // 刚重发过，按重发时间重新计
    expect(followUpDue({ ...base, sentAt: d(10), resentAt: d(3), resendCount: 1 }, 3, now)).toBe('resend');
    expect(followUpDue({ ...base, sentAt: d(30), resentAt: d(5), resendCount: FOLLOW_UP_MAX_ROUNDS }, 3, now)).toBeNull(); // 到上限
    expect(followUpDue({ ...base, sentAt: d(10), readAt: d(2) }, 3, now)).toBeNull();      // 已读没满 3 天：不重发也不催
    expect(followUpDue({ ...base, sentAt: d(10), readAt: d(3) }, 3, now)).toBe('nudge');   // 已读满 3 天没发票
    expect(followUpDue({ ...base, sentAt: d(10), repliedAt: d(4) }, 3, now)).toBe('nudge'); // 回信也算已读
    expect(followUpDue({ ...base, sentAt: d(10), readAt: d(8), nudgedAt: d(1), nudgeCount: 1 }, 3, now)).toBeNull(); // 刚催过
    expect(followUpDue({ ...base, sentAt: d(10), readAt: d(8), nudgedAt: d(3), nudgeCount: 1 }, 3, now)).toBe('nudge');
    expect(followUpDue({ ...base, sentAt: d(10), readAt: d(8), nudgedAt: d(3), nudgeCount: FOLLOW_UP_MAX_ROUNDS }, 3, now)).toBeNull();
    expect(followUpDue({ ...base, sentAt: d(10), readAt: d(8), invoiceReceivedAt: d(1) }, 3, now)).toBeNull(); // 收到发票就停
    expect(followUpDue({ ...base, sentAt: d(10), writeoffCompletedAt: d(1) }, 3, now)).toBeNull();
    expect(followUpDue({ ...base, sentAt: d(6) }, 5, now)).toBe('resend');                 // N 可配
    expect(followUpDue({ ...base, sentAt: d(4) }, 5, now)).toBeNull();
  });
  it('发票重命名模板', () => {
    expect(renderInvoiceFileName('{服务商}_{结算期}_发票{序号}', { provider: '甲/乙', period: '2026-08', index: 3, date: '20260901', originalName: 'scan.PDF' }))
      .toBe('甲_乙_2026-08_发票03.pdf');
  });
});

describe('模块三 · 报废台账', () => {
  it('合并 → 条码匹配渠道 → 渠道+品类聚合', () => {
    const a = table('报废1.xlsx', ['条码', '品类', '报废金额'], [['A001', '冰箱', 100], ['A002', '洗衣机', 50]]);
    const b = table('报废2.xlsx', ['条码', '品类', '报废金额', '备注'], [['A003', '冰箱', 20, 'x'], ['ZZZ', '空调', 5, '']]);
    const merged = mergeTables([a, b]);
    expect(merged.headers).toEqual(['条码', '品类', '报废金额', '备注', '来源文件']);
    expect(merged.rows).toHaveLength(4);
    const lookup = table('渠道对照表.xlsx', ['条码', '渠道'], [['A001', '京东'], ['A002', '天猫'], ['A003', '京东'], ['A003', '重复']]);
    const matched = matchChannels({ merged, barcodeColumn: '条码', lookup, lookupBarcodeColumn: '条码', lookupChannelColumn: '渠道' });
    expect(matched.matched).toBe(3);
    expect(matched.unmatched).toBe(1);
    expect(matched.unmatchedBarcodes).toEqual(['ZZZ']);
    expect(matched.duplicateBarcodes).toEqual(['A003']);
    const agg = aggregateScrap(matched.rows, { channel: '渠道', category: '品类', amount: '报废金额' });
    expect(agg.rows.find((r) => r.channel === '京东' && r.category === '冰箱')).toMatchObject({ count: 2, amount: 120 });
    expect(agg.total.amount).toBe(175);
    expect(agg.blankChannelRows).toBe(1);
  });
});

describe('模块四 · 营销激励结案', () => {
  const orders = table('有赞订单.xlsx', ['服务商', '实付金额', '下单时间', '订单状态'], [
    ['甲', 6000, '2026-07-03', '已完成'], ['甲', 4000, '2026-08-01', '已完成'], ['甲', 999, '2026-06-30', '已完成'],
    ['乙', 3000, '2026-09-10', '已完成'], ['乙', 500, '2026-09-11', '已取消'],
  ]);
  const pTasks = table('服务商任务.xlsx', ['服务商', '区域经理', '季度任务'], [['甲', '张三', 10000], ['乙', '张三', 5000]]);
  const mTasks = table('经理任务.xlsx', ['区域经理', '季度任务'], [['张三', 15000]]);
  it('达成率按季度过滤、剔除取消单、经理按服务商归属汇总', () => {
    const r = computeAchievement({
      orders: [{ table: orders, mapping: { provider: '服务商', amount: '实付金额', date: '下单时间', status: '订单状态' } }],
      providerTasks: { table: pTasks, mapping: { provider: '服务商', task: '季度任务', manager: '区域经理' } },
      managerTasks: { table: mTasks, mapping: { manager: '区域经理', task: '季度任务' } },
      quarter: quarterRange(2026, 3),
      measure: 'amount',
    });
    expect(r.providers.find((p) => p.name === '甲')).toMatchObject({ actual: 10000, task: 10000, rate: 1, manager: '张三' });
    expect(r.providers.find((p) => p.name === '乙')).toMatchObject({ actual: 3000, task: 5000, rate: 0.6 });
    expect(r.managers[0]).toMatchObject({ name: '张三', actual: 13000, task: 15000 });
  });
  it('规则阶梯 → 初始激励 / 延保打折 / 负责人激励', () => {
    const aux = computeAchievement({
      orders: [{ table: orders, mapping: { provider: '服务商', amount: '实付金额', date: '下单时间', status: '订单状态' } }],
      providerTasks: { table: pTasks, mapping: { provider: '服务商', task: '季度任务', manager: '区域经理' } },
      managerTasks: { table: mTasks, mapping: { manager: '区域经理', task: '季度任务' } },
      quarter: quarterRange(2026, 3), measure: 'amount',
    });
    const css = table('CSS延保.xlsx', ['服务商', '数量'], [['甲', 3], ['甲', 2], ['乙', 1]]);
    const wTasks = table('延保任务.xlsx', ['服务商', '任务', '区域经理'], [['甲', 5, '张三'], ['乙', 5, '张三']]);
    const wmTasks = table('延保经理任务.xlsx', ['区域经理', '任务'], [['张三', 20]]);
    const warranty = computeAchievement({
      orders: [{ table: css, mapping: { provider: '服务商', quantity: '数量' } }],
      providerTasks: { table: wTasks, mapping: { provider: '服务商', task: '任务', manager: '区域经理' } },
      managerTasks: { table: wmTasks, mapping: { manager: '区域经理', task: '任务' } },
      measure: 'quantity', knownProviderManager: aux.providerManager,
    });
    const rules = sanitizeMarketingRules({ ...DEFAULT_MARKETING_RULES, warrantyMode: 'perOrder', warrantyPerOrder: 20, leaderShareRatio: 10, leaderShareBase: 'warranty' });
    expect(rules.leaderShareRatio).toBe(0.1);
    const inc = computeIncentives(aux, warranty, rules);
    const jia = inc.providers.find((p) => p.provider === '甲')!;
    expect(jia.auxInitial).toBe(10000 * 0.05); // 达成率 100% → 5%
    expect(jia.warrantyIncentive).toBe(2 * 20); // 两条延保订单
    expect(jia.leaderIncentive).toBe(4);
    const yi = inc.providers.find((p) => p.provider === '乙')!;
    expect(yi.auxInitial).toBe(0); // 60% < 80% → 0
    const zhang = inc.managers[0];
    expect(zhang.auxIncentive).toBe(13000 * 0.03); // 86.7% → 3%
    expect(zhang.warrantyRate).toBeCloseTo(6 / 20);
    expect(zhang.discount).toBe(0.8); // 延保达成率 30% < 80% → 八折
    expect(zhang.finalIncentive).toBe(312);
  });
  it('没给区域经理延保任务表：经理任务按辖区服务商任务之和计，不会因任务=0 而全员打折', () => {
    const aux = computeAchievement({
      orders: [{ table: orders, mapping: { provider: '服务商', amount: '实付金额', date: '下单时间', status: '订单状态' } }],
      providerTasks: { table: pTasks, mapping: { provider: '服务商', task: '季度任务', manager: '区域经理' } },
      managerTasks: { table: mTasks, mapping: { manager: '区域经理', task: '季度任务' } },
      quarter: quarterRange(2026, 3), measure: 'amount',
    });
    const css = table('CSS延保.xlsx', ['服务商', '数量'], [['甲', 5], ['乙', 4]]);
    const wTasks = table('延保任务.xlsx', ['服务商', '任务'], [['甲', 5], ['乙', 5]]);
    const warranty = computeAchievement({
      orders: [{ table: css, mapping: { provider: '服务商', quantity: '数量' } }],
      providerTasks: { table: wTasks, mapping: { provider: '服务商', task: '任务' } },
      measure: 'quantity', knownProviderManager: aux.providerManager,
    });
    // 张三辖区任务 = 5 + 5 = 10，实际 = 9 → 90% ≥ 80% 不打折
    expect(warranty.managers[0]).toMatchObject({ name: '张三', task: 10, actual: 9, rate: 0.9 });
    expect(warranty.warnings.some((w) => w.includes('辖区服务商任务之和'))).toBe(true);
    const inc = computeIncentives(aux, warranty, sanitizeMarketingRules(DEFAULT_MARKETING_RULES));
    expect(inc.managers[0].discount).toBe(1);
    // 延保任务完全缺失（既无经理表也无服务商延保任务）→ task=0 → 不打折而不是按 0% 打折
    const noTask = computeAchievement({
      orders: [{ table: css, mapping: { provider: '服务商', quantity: '数量' } }],
      measure: 'quantity', knownProviderManager: aux.providerManager,
    });
    expect(noTask.managers[0].task).toBe(0);
    expect(computeIncentives(aux, noTask, sanitizeMarketingRules(DEFAULT_MARKETING_RULES)).managers[0].discount).toBe(1);
  });
  it('负责人信息：身份证校验位 / 银行卡 Luhn / 正文抠字段', () => {
    expect(validateIdCard('11010519491231002X')).toBeNull();
    expect(validateIdCard('110105194912310021')).toMatch(/校验位/);
    expect(validateBankCard('6222021234567890123')).toMatch(/Luhn/);
    expect(validateBankCard('4111111111111111')).toBeNull();
    const info = parseLeaderInfoFromText('负责人：王小明\n身份证号：11010519491231002X\n银行卡号：4111 1111 1111 1111\n开户行：中国工商银行北京分行\n手机：13800138000');
    expect(info).toMatchObject({ name: '王小明', idCard: '11010519491231002X', bankCard: '4111111111111111', bankName: '中国工商银行北京分行', phone: '13800138000' });
  });
  it('劳务报酬预扣预缴 + 模板填充', () => {
    expect(laborTax(3000)).toMatchObject({ deduction: 800, taxable: 2200, rate: 0.2, tax: 440 });
    expect(laborTax(30000)).toMatchObject({ deduction: 6000, taxable: 24000, rate: 0.3, quickDeduction: 2000, tax: 5200 });
    const filled = fillTaxTemplate(['姓名', '证件号码', '收入额', '无关列'], [{ index: 1, provider: '甲', name: '王', idCard: 'X', income: 100, deduction: 100, taxable: 0, rate: 0.2, quickDeduction: 0, tax: 0, bankCard: '', bankName: '' }]);
    expect(filled).toEqual([['王', 'X', 100, '']]);
    expect(fillTaxTemplate(['姓名'], [])).toBeNull();
  });
  it('二次提醒：到期前 10 天且未退回才触发', () => {
    const now = Date.parse('2026-09-21T00:00:00Z');
    expect(secondNoticeDue({ provider: '甲', amount: 1, notifiedAt: '2026-09-01', dueDate: '2026-10-01' }, 10, now)).toBe(true);
    expect(secondNoticeDue({ provider: '甲', amount: 1, notifiedAt: '2026-09-01', dueDate: '2026-10-05' }, 10, now)).toBe(false);
    expect(secondNoticeDue({ provider: '甲', amount: 1, notifiedAt: '2026-09-01', dueDate: '2026-10-01', returned: true }, 10, now)).toBe(false);
  });
});

describe('审查回归（2026-08-23 独立审查实证的 bug）', () => {
  it('A · 「不满意」不是 5 星：安装评价结果列按文字判定时差评先于好评', () => {
    expect(toStars('不满意')).toBe(1);
    expect(toStars('非常满意')).toBe(5);
    expect(toStars('很差')).toBe(1);
    const jd = table('京东安装.xlsx', ['服务商', '评价结果'], [['甲', '不满意'], ['甲', '非常满意']]);
    const r = computeReviewIncentive({ jdInstall: [{ table: jd, mapping: { provider: '服务商', rating: '评价结果' } }], jdAfterSales: [], tmall: [] });
    const p = r.providers[0];
    expect(p.goodOrders).toBe(1);
    expect(p.badOrders).toBe(1);
    expect(p.badRateX).toBe(0.5);
    expect(p.baseAmount).toBe(5);
    // 2026-09-03 口径变更：明细每行都已评价 ⇒ 评价率未知 ⇒ 系数取最低档 1（此前误按 100% 给 1.5）
    expect(p.rateYKnown).toBe(false);
    expect(p.installIncentive).toBe(1 * 5 * 1);
  });
  it('B · 订单表经理列与任务表经理不一致时以任务表为准，同一单不双计', () => {
    const orders = table('订单.xlsx', ['服务商', '区域经理', '金额'], [['A', 'X', 100], ['', 'Z', 30]]);
    const tasks = table('任务.xlsx', ['服务商', '区域经理', '任务'], [['A', 'Y', 100]]);
    const r = computeAchievement({
      orders: [{ table: orders, mapping: { provider: '服务商', manager: '区域经理', amount: '金额' } }],
      providerTasks: { table: tasks, mapping: { provider: '服务商', manager: '区域经理', task: '任务' } },
      measure: 'amount',
    });
    const byName = Object.fromEntries(r.managers.map((m) => [m.name, m.actual]));
    expect(byName).toEqual({ Y: 100, Z: 30 }); // X 不再出现；无服务商的 30 元直接记到 Z
    expect(r.totals.actual).toBe(100);
  });
  it('C · 负责人表导入按原始行号取服务商列，空行被过滤后不错位', () => {
    const t = table('负责人.xlsx', ['服务商', '姓名', '身份证号', '银行卡号'], [['甲', '', '', ''], ['乙', '王小明', '11010519491231002X', '4111111111111111']]);
    const parsed = parseLeaderInfoFromTable(t);
    expect(parsed).toHaveLength(1);
    expect(parsed[0].rowIndex).toBe(1);
    expect(t.rows[parsed[0].rowIndex]['服务商']).toBe('乙');
  });
  it('#11 · 名字只差非法字符的服务商不会算出同一个附件文件名', () => {
    const wo = table('工单.xlsx', ['服务商', '结算金额'], [['A/B', 10], ['A_B', 20]]);
    const input = { period: '2026-08', workOrders: [{ table: wo, mapping: { provider: '服务商', amount: '结算金额' } }], feeItems: [] };
    const plans = planProviderWorkbooks(input, computeSettlementSummary(input));
    expect(new Set(plans.map((p) => p.fileName)).size).toBe(2);
  });
});

// ── 2026-08-31 真实数据灌入补的三处回归(是否差评布尔列 / 客户备注回落 / toBadFlag)──
import { toBadFlag } from './excel';

describe('badFlag 是否差评布尔列(京东安装真实导出无星级列)', () => {
  it('toBadFlag:否定形态先判,非差评不当差评', () => {
    expect(toBadFlag('差评')).toBe(true);
    expect(toBadFlag('非差评')).toBe(false);
    expect(toBadFlag('好评')).toBe(false);
    expect(toBadFlag('中评')).toBe(false);
    expect(toBadFlag('是')).toBe(true);
    expect(toBadFlag('否')).toBe(false);
    expect(toBadFlag('')).toBeUndefined();
    expect(toBadFlag('随便什么')).toBeUndefined();
  });
  it('computeReviewIncentive 用 badFlag 列计好评/差评', () => {
    const t = table('京东安装.xlsx', ['服务商', '是否差评'], [
      ['甲', '非差评'], ['甲', '非差评'], ['甲', '差评'], ['乙', '非差评'],
    ]);
    const r = computeReviewIncentive({ jdInstall: [{ table: t, mapping: { provider: '服务商', badFlag: '是否差评' } }], jdAfterSales: [], tmall: [] });
    const jia = r.providers.find((p) => p.provider === '甲')!;
    expect(jia.ratedOrders).toBe(3);
    expect(jia.goodOrders).toBe(2);
    expect(jia.badOrders).toBe(1);
    const yi = r.providers.find((p) => p.provider === '乙')!;
    expect(yi.goodOrders).toBe(1);
    expect(yi.badOrders).toBe(0);
  });
});

describe('营销订单表「客户备注」服务商回落(辅材真实导出无服务商列)', () => {
  it('无 provider 映射但有客户备注列 → 用它并给出提示', () => {
    const orders = table('辅材订单明细.xlsx', ['订单号', '客户备注', '商品实际成交金额'], [
      ['E1', '甲服务商', 100], ['E2', '甲服务商', 50], ['E3', '乙服务商', 30],
    ]);
    const r = computeAchievement({
      orders: [{ table: orders, mapping: { amount: '商品实际成交金额' } }],
      providerTasks: null, managerTasks: null,
      quarter: quarterRange(2026, 3), measure: 'amount',
    } as any);
    const jia = r.providers.find((p) => p.name === '甲服务商')!;
    expect(jia).toBeTruthy();
    expect(jia.actual).toBe(150);
    expect(r.warnings.some((w) => w.includes('客户备注'))).toBe(true);
  });
  it('显式指定 provider 列时不回落', () => {
    const orders = table('x.xlsx', ['服务商', '客户备注', '金额'], [['丙', '别的备注', 10]]);
    const r = computeAchievement({
      orders: [{ table: orders, mapping: { provider: '服务商', amount: '金额' } }],
      providerTasks: null, managerTasks: null, quarter: quarterRange(2026, 3), measure: 'amount',
    } as any);
    expect(r.providers.find((p) => p.name === '丙')).toBeTruthy();
    expect(r.warnings.some((w) => w.includes('客户备注'))).toBe(false);
  });
});
