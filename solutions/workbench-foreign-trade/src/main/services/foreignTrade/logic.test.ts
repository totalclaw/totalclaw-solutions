/**
 * 外贸工作台的纯计算：报价、收件归并、跟进规则、单据核对、链接诊断、表格导入、报表。
 */
import { describe, expect, it, vi } from 'vitest';
import { mkdtempSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import type { FtMessage, FtProduct, FtQuoteLine, FtQuoteRules } from '@totalclaw/ipc-contracts';

vi.mock('../accountScope', () => ({ accountPath: (...p: string[]) => join(tmpdir(), 'ft-unused', ...p) }));

import {
  buildReportStats, calcQuote, compareOrderDocs, detectColumns, diagnoseListing, ingestMails, matchByRules, parseListingRows,
  parseProductRows, parseQuantity, quoteFoundIn, scanFollowups,
} from './logic';
import { emptyState, ForeignTradeStore, normalizeState } from './store';
import type { FetchedMail } from './mailboxes';

const RULES: FtQuoteRules = {
  baseCurrency: 'CNY', quoteCurrency: 'USD', manualRate: 7, rateSource: 'manual', packagingPct: 2, inlandFreight: 700,
  oceanFreightPerCbm: 40, insurancePct: 0.3, marginPct: 20, defaultIncoterm: 'FOB', validityDays: 15,
};
const FX = { rate: 7, source: 'test', asOf: '2026-09-22' };
const PRODUCTS: FtProduct[] = [
  { id: 'p1', model: 'LED-100', name: 'LED Panel Light', unitCost: 50, pcsPerCarton: 10, cartonCbm: 0.1 },
  { id: 'p2', model: 'LED-200', name: 'LED Bulb', unitCost: 10 },
];
const line = (over: Partial<FtQuoteLine>): FtQuoteLine => ({ requested: 'x', model: 'LED-100', name: 'LED Panel Light', quantity: 100, unitCost: 50, match: 'exact', productId: 'p1', ...over });

function mail(over: Partial<FtMessage> & { automated?: boolean }): FetchedMail {
  const { automated, ...m } = over;
  return {
    automated: !!automated,
    message: { id: `m${Math.random()}`, mailboxId: 'mb1', direction: 'in', from: 'buyer@acme.com', to: ['sales@me.com'], subject: 'Inquiry', body: 'Need 100 pcs', at: '2026-09-20T08:00:00.000Z', attachments: [], ...m },
  };
}

describe('报价计算', () => {
  it('FOB：货值 + 包装 + 国内运输，按毛利反推，再折成美元；每一行都有公式', () => {
    const r = calcQuote([line({})], RULES, 'FOB', FX, PRODUCTS);
    const byKey = Object.fromEntries(r.calc.map((c) => [c.key, c]));
    expect(byKey.goods.value).toBe(5000);
    expect(byKey.packaging.value).toBe(100);
    expect(byKey.inland.value).toBe(700);
    expect(byKey.cost.value).toBe(5800);
    expect(byKey.price_base.value).toBe(7250);          // 5800 / (1 - 20%)
    expect(byKey.price_quote.value).toBeCloseTo(1035.71, 2);
    expect(r.lines[0].unitPrice).toBe(10.36);
    expect(r.total).toBe(1036);                          // 100 × 10.36，报价单上的数对得上
    for (const c of r.calc) expect(c.formula).toBeTruthy();
    expect(byKey.freight).toBeUndefined();
  });

  it('CIF：按装箱数算立方数加海运费，再算保险；缺装箱数据给出提示', () => {
    const r = calcQuote([line({}), line({ productId: 'p2', model: 'LED-200', name: 'LED Bulb', quantity: 50, unitCost: 10 })], RULES, 'CIF', FX, PRODUCTS);
    const freight = r.calc.find((c) => c.key === 'freight')!;
    expect(freight.value).toBe(1 * 40 * 7);              // 10 箱 × 0.1 CBM × 40 USD × 7
    expect(r.calc.some((c) => c.key === 'insurance')).toBe(true);
    expect(r.warnings.some((w) => w.includes('装箱'))).toBe(true);
  });

  it('EXW 不含国内运输；没匹配上的产品、没成本的产品都要提示', () => {
    const r = calcQuote([line({ match: 'partial' }), line({ productId: undefined, model: '', unitCost: 0, match: 'none', requested: 'Solar lamp' })], RULES, 'EXW', FX, PRODUCTS);
    expect(r.calc.find((c) => c.key === 'inland')!.value).toBe(0);
    expect(r.warnings.filter((w) => w.includes('Solar lamp')).length).toBe(2);
  });

  it('毛利率不合法、汇率无效、没有明细：直接报错，不出一张错的报价单', () => {
    expect(() => calcQuote([line({})], { ...RULES, marginPct: 100 }, 'FOB', FX, PRODUCTS)).toThrow();
    expect(() => calcQuote([line({})], RULES, 'FOB', { ...FX, rate: 0 }, PRODUCTS)).toThrow();
    expect(() => calcQuote([], RULES, 'FOB', FX, PRODUCTS)).toThrow();
  });

  it('按规则匹配产品：型号命中 exact，名称命中 partial，都没有为 none；数量能读「2k」「1,500 pcs」', () => {
    const lines = matchByRules([
      { product: 'panel light', model: 'led-100', quantity: '1,500 pcs' },
      { product: 'LED Bulb', quantity: '2k' },
      { product: 'Solar lamp', quantity: '10' },
    ], PRODUCTS);
    expect(lines.map((l) => l.match)).toEqual(['exact', 'partial', 'none']);
    expect(lines.map((l) => l.quantity)).toEqual([1500, 2000, 10]);
    expect(parseQuantity('3万')).toBe(30000);
  });
});

describe('多邮箱收件 → 询盘', () => {
  it('新客户来信建询盘；同一邮箱同一客户的后续来信并进同一个询盘；重复邮件跳过', () => {
    const s = emptyState();
    const own = new Set(['sales@me.com']);
    const first = mail({ id: 'a' });
    const r1 = ingestMails(s, [first], own);
    expect(r1.created.length).toBe(1);
    const r2 = ingestMails(s, [first, mail({ id: 'b', at: '2026-09-21T08:00:00.000Z' })], own);
    expect(r2.created.length).toBe(0);
    expect(r2.updated.length).toBe(1);
    expect(s.inquiries[0].messageIds).toEqual(['a', 'b']);
    expect(s.messages.length).toBe(2);
  });

  it('同一客户发到不同邮箱：各自一个询盘（按邮箱分开跟）', () => {
    const s = emptyState();
    ingestMails(s, [mail({ id: 'a' }), mail({ id: 'b', mailboxId: 'mb2' })], new Set());
    expect(s.inquiries.map((q) => q.mailboxId).sort()).toEqual(['mb1', 'mb2']);
  });

  it('自动化邮件、我方邮箱之间的往来、已发送的信都不建询盘', () => {
    const s = emptyState();
    const r = ingestMails(s, [
      mail({ id: 'n', automated: true, from: 'noreply@alibaba.com' }),
      mail({ id: 'o', from: 'sales@me.com' }),
      mail({ id: 's', direction: 'out', from: 'sales@me.com', to: ['buyer@acme.com'] }),
    ], new Set(['sales@me.com']));
    expect(r.created).toEqual([]);
    expect(s.messages.length).toBe(3);
  });
});

describe('客户跟进', () => {
  const rules = { inquiryNoReplyHours: 24, quoteNoReplyDays: 3, silentDays: 30 };
  const now = Date.parse('2026-09-22T12:00:00.000Z');

  it('询盘超过 24 小时没回：列出；我方已从任意邮箱回过：不列', () => {
    const s = emptyState();
    ingestMails(s, [mail({ id: 'a', at: '2026-09-20T08:00:00.000Z' })], new Set());
    s.inquiries[0].status = 'extracted';
    expect(scanFollowups(s, rules, now).map((x) => x.reason)).toEqual(['inquiry_unanswered']);
    s.messages.push({ id: 'r', mailboxId: 'mb2', direction: 'out', from: 'me@x.com', to: ['buyer@acme.com'], subject: 'Re', body: '', at: '2026-09-20T09:00:00.000Z', attachments: [] });
    expect(scanFollowups(s, rules, now)).toEqual([]);
  });

  it('报价发出 3 天客户没回：列出；客户回过信：不列', () => {
    const s = emptyState();
    s.quotes.push({ id: 'q1', status: 'sent', sentAt: '2026-09-18T08:00:00.000Z', customerEmail: 'buyer@acme.com', customerName: 'Acme', mailboxId: 'mb1', incoterm: 'FOB', lines: [], calc: [], warnings: [], total: 100, currency: 'USD', fx: FX, createdAt: '2026-09-18T08:00:00.000Z' });
    expect(scanFollowups(s, rules, now).map((x) => x.reason)).toEqual(['quote_no_reply']);
    s.messages.push({ id: 'in', mailboxId: 'mb1', direction: 'in', from: 'buyer@acme.com', to: [], subject: 'ok', body: '', at: '2026-09-19T08:00:00.000Z', attachments: [] });
    expect(scanFollowups(s, rules, now)).toEqual([]);
  });

  it('30 天没有往来的询盘客户：沉默客户', () => {
    const s = emptyState();
    ingestMails(s, [mail({ id: 'a', at: '2026-08-01T08:00:00.000Z' })], new Set());
    s.inquiries[0].status = 'replied';
    expect(scanFollowups(s, rules, now).map((x) => x.reason)).toEqual(['silent']);
  });
});

describe('订单单据核对', () => {
  it('同一字段在两份以上单据里写法不同才算差异；数量、金额按数字比，品名不看顺序', () => {
    const r = compareOrderDocs([
      { id: '1', kind: 'PI', name: 'PI.pdf', path: '', fields: { order_no: 'TC-001', total_quantity: '1,000', total_amount: '5000.00', product_names: 'LED Panel, LED Bulb', consignee: 'ACME LLC' } },
      { id: '2', kind: 'CI', name: 'CI.pdf', path: '', fields: { order_no: 'TC-001', total_quantity: '1000', total_amount: '5,200', product_names: 'LED Bulb, LED Panel', consignee: 'Acme LLC' } },
      { id: '3', kind: 'PL', name: 'PL.pdf', path: '' },
    ]);
    expect(r.issues.map((i) => i.field)).toEqual(['total_amount']);
    expect(r.compared).toEqual(expect.arrayContaining(['order_no', 'total_quantity', 'product_names', 'consignee']));
  });
});

describe('平台链接诊断与表格导入', () => {
  it('标题太短、主关键词不在标题、图片少、点击率低都能诊断出来', () => {
    const issues = diagnoseListing({ id: 'l', title: 'Light', keywords: ['led panel'], images: 3, exposure: 1000, clicks: 5, issues: [], status: 'pending' });
    expect(issues.map((i) => i.rule)).toEqual(['title_short', 'kw_not_in_title', 'images', 'ctr']);
  });

  it('按表头认列：中英文表头都行；认不出关键列就报错', () => {
    const { products, columns } = parseProductRows([{ '型号': 'A1', '品名': 'Fan', '出厂价': '12.5', '装箱数': '20', '箱体积': '0.08' }]);
    expect(columns.unitCost).toBe('出厂价');
    expect(products[0]).toMatchObject({ model: 'A1', name: 'Fan', unitCost: 12.5, pcsPerCarton: 20, cartonCbm: 0.08 });
    expect(() => parseProductRows([{ foo: 'x' }])).toThrow();
    const { listings } = parseListingRows([{ Title: 'LED Panel Light 60x60 Ceiling Office Lighting Fixture 40W', Keywords: 'led panel, ceiling light', Impressions: '500', Clicks: '20' }]);
    expect(listings[0].keywords).toEqual(['led panel', 'ceiling light']);
    expect(detectColumns(['Unit Price', 'Model'], { unitCost: ['price'], model: ['model'] })).toEqual({ unitCost: 'Unit Price', model: 'Model' });
  });
});

describe('报表', () => {
  it('按区间统计询盘、回复时效、按邮箱分布，数字全部来自数据', () => {
    const s = emptyState();
    s.mailboxes.push({ id: 'mb1', label: 'Tom', address: 't@me.com', purposes: ['inquiry'], provider: 'custom', imapHost: '', imapPort: 993, smtpHost: '', smtpPort: 465, enabled: true, autoReply: false, hasPassword: true, status: 'ready', totalFetched: 0, createdAt: '' });
    ingestMails(s, [mail({ id: 'a', at: '2026-09-20T08:00:00.000Z' }), mail({ id: 'b', from: 'x@spam.com', at: '2026-09-20T09:00:00.000Z' })], new Set());
    s.inquiries[1].category = { productLine: '', completeness: 'poor', intent: 'low', spam: true, reason: '' };
    s.messages.push({ id: 'r', mailboxId: 'mb1', direction: 'out', from: 't@me.com', to: ['buyer@acme.com'], subject: 'Re', body: '', at: '2026-09-20T10:00:00.000Z', attachments: [] });
    const st = buildReportStats(s, '2026-09-20', '2026-09-20', Date.parse('2026-09-22T00:00:00Z'));
    expect(st.inquiries).toMatchObject({ total: 2, spam: 1, replied: 1, avgFirstReplyHours: 2, byMailbox: { Tom: 2 } });
    expect(st.mails).toEqual({ received: 2, sent: 1 });
  });

  it('依据句检查：去标点空格后在原文里找得到才算', () => {
    expect(quoteFoundIn('We need 1,000 pcs of LED panels.', 'need 2000 pcs')).toBe(false);
    expect(quoteFoundIn('We need 1,000 pcs of LED panels.', 'need 1000pcs')).toBe(true);   // 标点、空格不算差别
    expect(quoteFoundIn('We need 1,000 pcs of LED panels.', 'need 1,000 pcs')).toBe(true);
  });
});

describe('落盘', () => {
  it('授权码加密存在 secrets.json，快照里没有；换了密钥读不出时按「没配」处理', () => {
    const dir = mkdtempSync(join(tmpdir(), 'ft-store-'));
    const userData = mkdtempSync(join(tmpdir(), 'ft-ud-'));
    const store = new ForeignTradeStore(() => dir, () => userData);
    store.update((s) => { s.mailboxes.push({ id: 'mb1' } as any); });
    store.setPassword('mb1', 'auth-code-123');
    expect(store.getPassword('mb1')).toBe('auth-code-123');
    expect(readFileSync(join(dir, 'secrets.json'), 'utf-8')).not.toContain('auth-code-123');
    expect(readFileSync(join(dir, 'state.json'), 'utf-8')).not.toContain('auth-code-123');
    const other = new ForeignTradeStore(() => dir, () => mkdtempSync(join(tmpdir(), 'ft-ud2-')));
    expect(other.getPassword('mb1')).toBe('');
  });

  it('旧快照缺字段：补默认设置，邮箱补默认用途', () => {
    const s = normalizeState({ mailboxes: [{ id: 'm', address: 'a@b.com' }], settings: { quoteRules: { marginPct: 30 } } });
    expect(s.settings.quoteRules.marginPct).toBe(30);
    expect(s.settings.quoteRules.baseCurrency).toBe('CNY');
    expect(s.mailboxes[0].purposes).toEqual(['inquiry']);
    expect(s.leads).toEqual([]);
  });
});
