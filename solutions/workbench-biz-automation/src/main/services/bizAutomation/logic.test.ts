import { describe, expect, it } from 'vitest';
import type { ApGarment, BaSaleRow } from '@totalclaw/ipc-contracts';
import {
  appendVideoEvent, applyInventory, bannedHits, computeMetrics, parseInventory, dueToday, evaluateRules, parseExpenses, parseSales, placeholders, publishRunFromWorkflow, reportPeriod, resetStaleRendering, strayPrices, unverifiedNumbers, VIDEO_HISTORY_MAX,
} from './logic';

function g(id: string, p: Partial<ApGarment> = {}): ApGarment {
  return { id, name: id, sku: id.toUpperCase(), price: 199, category: '连衣裙', color: '', style: '', fabric: '', season: '夏', audience: 'women', stock: { S: 1, M: 2, L: 1 }, image: '', tags: [], sellingPoints: '', onShelf: true, createdAt: '2026-09-01T00:00:00Z', ...p };
}
const sale = (p: Partial<BaSaleRow>): BaSaleRow => ({ date: '2026-09-29', orderNo: 'o1', sku: '', name: '', category: '上衣', qty: 1, amount: 100, cost: 40, channel: '门店', ...p });

describe('收银表解析', () => {
  it('识别常见表头，只写首行日期 / 单号的明细沿用上一行', () => {
    const r = parseSales(['销售日期', '小票号', '商品名称', '数量', '实收金额', '成本金额'], [
      { 销售日期: '2026/9/29', 小票号: 'A1', 商品名称: '白T', 数量: 2, 实收金额: '¥200', 成本金额: 80 },
      { 销售日期: '', 小票号: '', 商品名称: '牛仔裤', 数量: 1, 实收金额: 299, 成本金额: '' },
      { 销售日期: '合计', 小票号: '', 商品名称: '', 数量: '', 实收金额: '' },
    ]);
    expect(r.rows).toHaveLength(2);
    expect(r.rows[1]).toMatchObject({ date: '2026-09-29', orderNo: 'A1', amount: 299, cost: null });
    expect(r.skipped).toBe(1);
  });
  it('缺必需列直接报出来', () => { expect(() => parseSales(['商品', '数量'], [])).toThrow(/日期/); });
  it('月度费用表按当月 1 日记', () => {
    const r = parseExpenses(['月份', '费用项目', '金额'], [{ 月份: '2026年9月', 费用项目: '房租', 金额: 8000 }]);
    expect(r.rows[0]).toEqual({ date: '2026-09-01', item: '房租', amount: 8000 });
  });
});

describe('经营指标', () => {
  const rows = [
    sale({ orderNo: 'o1', amount: 300, cost: 120, qty: 2, name: 'a', sku: 'A' }),
    sale({ orderNo: 'o1', amount: 100, cost: null, qty: 1, category: '裤装' }),
    sale({ orderNo: 'o2', amount: 200, cost: 80, channel: '抖音' }),
    sale({ orderNo: 'o3', amount: -100, cost: 40, qty: -1 }),
    sale({ date: '2026-09-28', orderNo: 'p1', amount: 250, cost: 100 }),
  ];
  const m = computeMetrics(rows, [{ date: '2026-09-29', item: '房租', amount: 50 }], [g('a')], '2026-09-29', '2026-09-29');
  it('营业额、退货、客单价、连带率', () => {
    expect(m.revenue).toBe(600);
    expect(m.refunds).toBe(100);
    expect(m.netRevenue).toBe(500);
    expect(m.orders).toBe(2);
    expect(m.avgOrderValue).toBe(250);
    expect(m.units).toBe(3);
    expect(m.unitsPerOrder).toBe(1.5);
  });
  it('毛利只按有成本的销售算，并标出覆盖比例', () => {
    expect(m.cost).toBe(160);
    expect(m.grossProfit).toBe(240);
    expect(m.costCoverage).toBe(0.8);
    expect(m.netProfit).toBe(190);
  });
  it('库存周转天数、款式排行、每日趋势、数据最后日期', () => {
    // a 款：库存 4 件，单件成本 = 120/2 = 60 → 库存成本 240；日均销售成本 160 → 1.5 天
    expect(m.inventoryValue).toBe(240);
    expect(m.turnoverDays).toBe(1.5);
    expect(m.items.find((x) => x.key === 'a')).toMatchObject({ qty: 2, amount: 300, grossProfit: 180 });
    expect(m.daily).toEqual([{ day: '2026-09-29', netRevenue: 500, orders: 2 }]);
    expect(m.lastDataDay).toBe('2026-09-29');
  });
  it('环比、渠道、售罄率', () => {
    expect(m.prev).toEqual({ revenue: 250, grossProfit: 150, orders: 1, avgOrderValue: 250 });
    expect(m.byChannel.map((x) => x.key)).toEqual(['门店', '抖音']);
    expect(m.sellThrough[0]).toMatchObject({ key: 'a', value: 0.3333 });
  });
  it('解读里编造的数字会被标出来，指标里有的放行', () => {
    const bad = unverifiedNumbers('昨日净营业额 500 元，毛利率 60.0%，订单 2 单；预计本月可达 3.2万 元。', m);
    expect(bad).toEqual(['3.2万']);
    expect(unverifiedNumbers('2026-09-29 营业额 500，较前一日增加 250', m)).toEqual([]);
  });
});

describe('库存快照', () => {
  it('按货号优先、名称其次同步尺码库存，对不上的列出来', () => {
    const inv = parseInventory(['商品货号', '商品名称', '尺码', '可用库存'], [
      { 商品货号: 'A', 商品名称: 'x', 尺码: 'm', 可用库存: 3 },
      { 商品货号: 'A', 商品名称: 'x', 尺码: 'L', 可用库存: '0' },
      { 商品货号: '', 商品名称: 'b', 尺码: 'S', 可用库存: 2 },
      { 商品货号: 'Z', 商品名称: '不存在', 尺码: 'S', 可用库存: 1 },
      { 商品货号: 'A', 商品名称: 'x', 尺码: 'S', 可用库存: '' },
    ]);
    expect(inv.skipped).toBe(1);
    const r = applyInventory([g('a'), g('b', { sku: '' })], inv.rows);
    expect(r.updates).toEqual([{ id: 'a', stock: { M: 3, L: 0 } }, { id: 'b', stock: { S: 2 } }]);
    expect(r.unmatched).toEqual(['Z']);
  });
});

describe('上下架规则', () => {
  const settings = { seasonMonths: { 夏: [5, 6, 7, 8, 9], 冬: [11, 12, 1, 2] }, coreSizes: ['M', 'L'] };
  it('售罄下架、断码提醒、过季提醒、试穿多成交少换图', () => {
    const hits = evaluateRules([
      g('sold', { stock: { S: 0, M: 0 } }),
      g('broken', { stock: { S: 3, M: 0, L: 2 } }),
      g('winter', { season: '冬' }),
      g('lag'),
    ], settings, { lagging: ['lag'] } as any, new Date('2026-09-30T10:00:00'));
    expect(hits.map((h) => `${h.garmentId}:${h.rule}`)).toEqual(['sold:soldout', 'broken:broken_size', 'winter:off_season', 'lag:lagging']);
  });
});

describe('合规与定时', () => {
  it('广告法极限词', () => {
    expect(bannedHits('全网最低价，销量冠军，最近上新')).toEqual(expect.arrayContaining(['销量冠军', '最低']));
    expect(bannedHits('最近上新')).toEqual([]);
  });
  it('待补充占位与来路不明的价格', () => {
    expect(placeholders('成立于【待补充：成立年份】，位于【待补充】')).toHaveLength(2);
    expect(strayPrices('原价 299 元，今日 5 折，到手 ¥149', '全场 5 折', [299])).toEqual(['¥149']);
  });
  it('报表期', () => {
    expect(reportPeriod('daily', new Date('2026-09-30T08:00:00'))).toEqual({ from: '2026-09-29', to: '2026-09-29' });
    expect(reportPeriod('weekly', new Date('2026-09-30T08:00:00'))).toEqual({ from: '2026-09-21', to: '2026-09-27' });
    expect(reportPeriod('monthly', new Date('2026-09-30T08:00:00'))).toEqual({ from: '2026-08-01', to: '2026-08-31' });
  });
  it('到点判定：过了时间且今天没跑过', () => {
    const now = new Date('2026-09-30T08:40:00');
    expect(dueToday('08:30', undefined, now)).toBe(true);
    expect(dueToday('08:30', '2026-09-30', now)).toBe(false);
    expect(dueToday('09:00', undefined, now)).toBe(false);
  });
});

describe('启动时收掉上次没跑完的成片', () => {
  it('rendering → failed 并写人话原因；其它状态（含 publishing）原样不动；返回改动条数', () => {
    const s = {
      videos: [
        { status: 'rendering', error: undefined, updatedAt: '2026-10-13T00:00:00.000Z' },
        { status: 'publishing', error: undefined },
        { status: 'rendered', error: undefined },
      ],
      avatars: [
        { status: 'rendering', error: '旧错误' },
        { status: 'draft', error: undefined },
      ],
    } as any;
    const n = resetStaleRendering(s, '应用重启导致上次成片中断，请重新成片', new Date('2026-10-13T08:00:00.000Z'));
    expect(n).toBe(2);
    expect(s.videos[0]).toMatchObject({ status: 'failed', error: '应用重启导致上次成片中断，请重新成片', updatedAt: '2026-10-13T08:00:00.000Z' });
    expect(s.videos[1]).toMatchObject({ status: 'publishing' });
    expect(s.videos[2]).toMatchObject({ status: 'rendered' });
    expect(s.avatars[0]).toMatchObject({ status: 'failed', error: '应用重启导致上次成片中断，请重新成片' });
    expect(s.avatars[1]).toMatchObject({ status: 'draft' });
    expect(resetStaleRendering(s, 'x')).toBe(0);
  });
});

describe('视频历史记录', () => {
  it('节点留痕按时间先后追加，超出上限丢最早的', () => {
    let h = appendVideoEvent(undefined, 'create', '创建', true, new Date('2026-10-21T01:00:00Z'));
    h = appendVideoEvent(h, 'render', '成片失败', false, new Date('2026-10-21T02:00:00Z'));
    expect(h.map((e) => [e.step, e.ok])).toEqual([['create', true], ['render', false]]);
    for (let i = 0; i < VIDEO_HISTORY_MAX + 5; i++) h = appendVideoEvent(h, 'edit', `改 ${i}`);
    expect(h).toHaveLength(VIDEO_HISTORY_MAX);
    expect(h[h.length - 1].text).toBe(`改 ${VIDEO_HISTORY_MAX + 4}`);
  });

  it('发布回执只认 published 为发成功；unconfirmed 单列；缺回执的平台算失败', () => {
    const r = publishRunFromWorkflow({
      kind: 'run:completed', runId: 'r1', platforms: ['douyin', 'xiaohongshu', 'kuaishou'], videoFile: '/v.mp4', at: Date.parse('2026-10-21T03:00:00Z'),
      receipt: { receipts: [{ platform: 'douyin', status: 'published', url: 'https://x/1' }, { platform: 'xiaohongshu', status: 'unconfirmed', error: '二次确认' }] },
    });
    expect(r.outcome).toBe('completed');
    expect(r.published).toEqual(['douyin']);
    expect(r.unconfirmed).toEqual(['xiaohongshu']);
    expect(r.failed).toEqual(['kuaishou']);
    expect(r.receipts[0].url).toBe('https://x/1');
    expect(r.at).toBe('2026-10-21T03:00:00.000Z');
  });

  it('工作流失败 / 取消：即便有回执也不算发布成功', () => {
    const r = publishRunFromWorkflow({ kind: 'run:failed', platforms: ['douyin'], receipt: { receipts: [{ platform: 'douyin', status: 'published' }] } });
    expect(r.outcome).toBe('failed');
    expect(r.published).toEqual([]);
    expect(r.failed).toEqual(['douyin']);
    expect(publishRunFromWorkflow({ kind: 'run:cancelled', platforms: ['douyin'], receipt: null }).outcome).toBe('cancelled');
  });
});
