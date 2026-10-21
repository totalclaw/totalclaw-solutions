import { describe, expect, it } from 'vitest';
import type { ZcCompany, ZcInquiry, ZcOrder, ZcProduct } from '@totalclaw/ipc-contracts';
import {
  buildAlerts, checkProduct, composeTitle, defaultRegions, normalizeInquiries, normalizeOrders, parseAgentJson, parseOrdersTable, parseProductsTable, parseTime,
  priceBaseline, priceInquiry, refPlatform, strayNumbers,
} from './logic';

const regions = defaultRegions();
const general = regions.find((r) => r.id === 'general')!;
const zhejiang = regions.find((r) => r.id === 'zhejiang')!;
const yunnan = regions.find((r) => r.id === 'yunnan')!;

const product = (over: Partial<ZcProduct> = {}): ZcProduct => ({
  id: 'p1', name: '激光打印机', brand: '得力', model: 'P2500', category: '打印设备', title: '得力 激光打印机 P2500', price: 899, stock: 20, unit: '台',
  params: '打印速度：25页/分钟\n幅面：A4', detail: '', images: [{ path: '/a/1.jpg', width: 1000, height: 1000, kb: 300 }],
  refs: [{ platform: 'jd', url: 'https://item.jd.com/1.html', price: 949 }], status: 'draft', issues: [], updatedAt: '', ...over,
});
const codes = (p: ZcProduct, rule = general) => checkProduct(p, rule).map((i) => `${i.level}:${i.code}`);
const company = (q: ZcCompany['qualifications'] = []): ZcCompany => ({ name: '', creditCode: '', legalPerson: '', contact: '', phone: '', address: '', bank: '', bankAccount: '', qualifications: q } as unknown as ZcCompany);

describe('商品检查', () => {
  it('合规的商品没有错误', () => {
    expect(codes(product()).filter((c) => c.startsWith('error'))).toEqual([]);
  });
  it('标题拼法不重复品牌型号', () => {
    expect(composeTitle({ brand: '得力', name: '激光打印机', model: 'P2500' })).toBe('得力 激光打印机 P2500');
    expect(composeTitle({ brand: '得力', name: '得力激光打印机P2500', model: 'P2500' })).toBe('得力激光打印机P2500');
    // 吉林指南：商品-品牌-型号
    expect(composeTitle({ brand: '得力', name: '激光打印机', model: 'P2500' }, 'name_first')).toBe('激光打印机 得力 P2500');
    expect(regions[0].id).toBe('jilin');
    expect(regions[0]).toMatchObject({ titleOrder: 'name_first', imageMin: 1, imageMaxKb: 3072, imageMinSide: 800, reviewDays: 3 });
    expect(codes(product({ detail: '有助减脂' }), regions[0])).toContain('error:banned_words');
  });
  it('比价链接只认三家站点', () => {
    expect(refPlatform('https://item.jd.com/100.html')).toBe('jd');
    expect(refPlatform('detail.tmall.com/item.htm?id=1')).toBe('tmall');
    expect(refPlatform('https://product.suning.com/1.html')).toBe('suning');
    expect(refPlatform('https://jd.com.evil.cn/1')).toBe('other');
    expect(refPlatform('https://www.pinduoduo.com/1')).toBe('other');
  });
  it('基准价：均值取最低 3 个，向下取到分', () => {
    const refs = [1000, 900, 950, 800].map((price, i) => ({ platform: 'jd' as const, url: `https://item.jd.com/${i}.html`, price }));
    expect(priceBaseline(refs, { priceRule: 'avg' })).toEqual({ baseline: 883.33, count: 4 });
    expect(priceBaseline(refs, { priceRule: 'min' }).baseline).toBe(800);
    expect(priceBaseline([{ platform: 'other', url: 'x', price: 1 }], { priceRule: 'avg' }).baseline).toBe(0);
  });
  it('售价高于基准：从严口径直接拦；浙江 10% 内只提醒，超过才拦', () => {
    expect(codes(product({ price: 950 }))).toContain('error:price_over');
    expect(codes(product({ price: 949 }))).not.toContain('error:price_over');
    expect(codes(product({ price: 1000 }), zhejiang)).toContain('warning:price_above_base');
    expect(codes(product({ price: 1043.9 }), zhejiang)).toContain('warning:price_above_base');
    expect(codes(product({ price: 1044 }), zhejiang)).toContain('error:price_over');
  });
  it('没有自营链接、链接没填价、非自营链接', () => {
    expect(codes(product({ refs: [] }))).toContain('error:ref_missing');
    expect(codes(product({ refs: [{ platform: 'jd', url: 'https://item.jd.com/1.html', price: 0 }] }))).toContain('error:ref_price_missing');
    const c = codes(product({ refs: [{ platform: 'other', url: 'https://x.cn/1', price: 10 }] }));
    expect(c).toEqual(expect.arrayContaining(['warning:ref_not_selfrun', 'error:ref_missing']));
  });
  it('禁用词、联系方式、图片规格', () => {
    expect(codes(product({ title: '得力 激光打印机 P2500 全网最低' }))).toContain('error:banned_words');
    expect(codes(product({ detail: '消防专用' }))).toContain('error:banned_words');
    expect(codes(product({ detail: '咨询加微信：abc12345' }))).toContain('error:contact_info');
    expect(codes(product({ images: [{ path: '/a/1.jpg', width: 799, height: 1200, kb: 100 }] }))).toContain('error:image_small');
    expect(codes(product({ images: [{ path: '/a/1.webp', width: 900, height: 900, kb: 100 }] }))).toContain('error:image_type');
    expect(codes(product(), yunnan)).toContain('error:image_few');
    expect(codes(product({ images: [{ path: '/a/1.jpg', width: 900, height: 900, kb: 2000 }, { path: '/a/2.jpg', width: 900, height: 900, kb: 10 }] }), yunnan)).toContain('error:image_big');
  });
  it('详情里出现参数里没有的数字会被标出来', () => {
    expect(strayNumbers('打印速度 25 页，支持 A4，保修 36 个月', '打印速度：25页/分钟\n幅面：A4')).toEqual(['36']);
    expect(strayNumbers('打印速度 25 页', '打印速度：25页/分钟')).toEqual([]);
  });
});

describe('询价报价', () => {
  const inq = (items: ZcInquiry['items'], over: Partial<ZcInquiry> = {}) => ({ items, margin: 0.08, budget: 0, ...over });
  const item = (over: Partial<ZcInquiry['items'][number]> = {}) => ({ name: 'A4 纸', spec: '', qty: 10, unit: '箱', ceiling: 0, cost: 100, quote: 0, ...over });
  it('成本 ×（1 + 毛利率），进到分', () => {
    const r = priceInquiry(inq([item(), item({ name: '硒鼓', cost: 33.33, qty: 3 })]));
    expect(r.items.map((i) => i.quote)).toEqual([108, 36]);
    expect(r.total).toBe(1188);
    expect(r.issues).toEqual([]);
  });
  it('超限价压到限价并提醒；限价低于成本、超预算、没填成本都是错误', () => {
    const capped = priceInquiry(inq([item({ ceiling: 105 })]));
    expect(capped.items[0].quote).toBe(105);
    expect(capped.issues.map((i) => `${i.level}:${i.code}`)).toEqual(['warning:capped']);
    expect(priceInquiry(inq([item({ ceiling: 90 })])).issues.map((i) => i.code)).toContain('ceiling_below_cost');
    expect(priceInquiry(inq([item()], { budget: 1000 })).issues.map((i) => i.code)).toContain('over_budget');
    const missing = priceInquiry(inq([item({ cost: 0 })]));
    expect(missing.issues.map((i) => i.code)).toContain('cost_missing');
    expect(missing.items[0].quote).toBe(0);
  });
});

describe('读回结果解析', () => {
  it('从回复里取 json 代码块；没有清单会明说', () => {
    expect(parseAgentJson('读完了：\n```json\n[{"orderNo":"1"}]\n```\n以上。')).toEqual([{ orderNo: '1' }]);
    expect(parseAgentJson('结果 [{"orderNo":"2"}] 完')).toEqual([{ orderNo: '2' }]);
    expect(parseAgentJson('```json\n{"orders":[]}\n```')).toEqual([]);
    expect(() => parseAgentJson('需要登录，请先处理验证码')).toThrow();
  });
  it('订单：状态原文归一，没单号或认不出状态的不收', () => {
    const r = normalizeOrders([
      { orderNo: 'ZC 001', buyer: '某某小学', amount: '1,200.50', createdAt: '2026-10-09 14:30', status: '待接单', items: 'A4纸×10' },
      { orderNo: 'ZC002', status: '已发货', amount: 5 },
      { orderNo: '', status: '待发货' },
      { orderNo: 'ZC003', status: '处理中' },
    ]);
    expect(r.dropped).toBe(2);
    expect(r.orders.map((o) => [o.orderNo, o.status, o.amount])).toEqual([['ZC001', 'to_accept', 1200.5], ['ZC002', 'shipped', 5]]);
    expect(new Date(r.orders[0].createdAt).getHours()).toBe(14);
  });
  it('询价单与时间', () => {
    const r = normalizeInquiries([{ no: 'XJ1', title: '办公用品', deadline: '2026年10月12日 17:00', budget: '5000', items: [{ name: '纸', qty: '10', ceiling: 0 }, { name: '' }] }, {}]);
    expect(r.dropped).toBe(1);
    expect(r.inquiries[0].items).toHaveLength(1);
    expect(new Date(r.inquiries[0].deadline).getDate()).toBe(12);
    expect(parseTime('乱写')).toBe('');
  });
  it('订单表与商品表导入', () => {
    const o = parseOrdersTable({ headers: ['订单编号', '采购单位', '订单金额', '订单状态', '下单时间'], rows: [{ 订单编号: 'A1', 采购单位: '某局', 订单金额: '99', 订单状态: '待开票', 下单时间: '2026/10/1' }] });
    expect(o.orders[0]).toMatchObject({ orderNo: 'A1', buyer: '某局', amount: 99, status: 'to_invoice' });
    expect(() => parseOrdersTable({ headers: ['订单编号'], rows: [] })).toThrow();
    const p = parseProductsTable({ headers: ['商品名称', '品牌', '型号', '类目', '售价', '库存', '京东链接', '电商价', '参数'], rows: [{ 商品名称: '打印机', 品牌: '得力', 型号: 'P1', 类目: '打印设备', 售价: '899', 库存: '5', 京东链接: 'https://item.jd.com/1.html', 电商价: '949', 参数: '幅面：A4；速度：25' }] });
    expect(p[0]).toMatchObject({ name: '打印机', price: 899, stock: 5, params: '幅面：A4\n速度：25' });
    expect(p[0].refs).toEqual([{ platform: 'jd', url: 'https://item.jd.com/1.html', price: 949 }]);
  });
});

describe('预警', () => {
  const now = Date.parse('2026-10-10T10:00:00+08:00');
  const order = (over: Partial<ZcOrder>): ZcOrder => ({ id: 'o', orderNo: 'N', buyer: '', buyerTaxNo: '', amount: 1, createdAt: '', status: 'to_accept', items: '', logisticsCompany: '', logisticsNo: '', note: '', updatedAt: '', ...over });
  const ago = (h: number) => new Date(now - h * 3600_000).toISOString();
  it('接单时限、询价截止、资质到期、在售超价', () => {
    const alerts = buildAlerts({
      now, rule: general,
      orders: [order({ id: 'o1', createdAt: ago(25) }), order({ id: 'o2', createdAt: ago(2) }), order({ id: 'o3', createdAt: ago(13) }), order({ id: 'o4', status: 'to_ship', createdAt: ago(50) }), order({ id: 'o5', status: 'done', createdAt: ago(500) })],
      inquiries: [
        { id: 'q1', no: '1', title: 'a', buyer: '', deadline: new Date(now + 5 * 3600_000).toISOString(), budget: 0, items: [], margin: 0, total: 0, status: 'new', issues: [], url: '', note: '', updatedAt: '' },
        { id: 'q2', no: '2', title: 'b', buyer: '', deadline: new Date(now + 5 * 3600_000).toISOString(), budget: 0, items: [], margin: 0, total: 0, status: 'submitted', issues: [], url: '', note: '', updatedAt: '' },
      ],
      products: [product({ id: 'p9', status: 'listed', price: 2000 }), product({ id: 'p8', status: 'draft', price: 2000 })],
      company: company([{ id: 'f1', name: '营业执照', file: '', expireAt: '2026-10-01', note: '' }, { id: 'f2', name: '授权书', file: '', expireAt: '2026-10-25', note: '' }, { id: 'f3', name: '长期', file: '', expireAt: '', note: '' }]),
    });
    const by = (id: string) => alerts.filter((a) => a.refId === id).map((a) => `${a.level}:${a.kind}`);
    expect(by('o1')).toEqual(['error:order_accept']);
    expect(by('o2')).toEqual(['warning:order_accept']);
    expect(by('o3')).toEqual(['error:order_accept']);
    expect(by('o4')).toEqual(['warning:order_ship']);
    expect(by('o5')).toEqual([]);
    expect(by('q1')).toEqual(['error:inquiry_deadline']);
    expect(by('q2')).toEqual([]);
    expect(by('f1')).toEqual(['error:qualification']);
    expect(by('f2')).toEqual(['warning:qualification']);
    expect(by('f3')).toEqual([]);
    expect(by('p9')).toEqual(['error:price']);
    expect(by('p8')).toEqual([]);
    expect(alerts[0].level).toBe('error');
  });
});
