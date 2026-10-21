/**
 * 外贸工作台 · 主进程动作通道：发信闸门接在每条发送路径上（人工发送四条 + 自动回复）、名单筛查、HS 确认进单据、PI / CI / 装箱单生成与交叉校验。
 * electron、账号目录、收发信、模型、PDF 渲染换成替身（发信是桩，不连任何真实邮箱）；闸门、落盘、Excel 读写、名单匹配都是真的。
 */
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import * as XLSX from 'xlsx';

const h = vi.hoisted(() => ({
  root: '',
  handler: null as null | ((e: unknown, req: { action: string; payload?: unknown }) => Promise<any>),
  sent: [] as any[],
  inbox: [] as any[],
  llm: null as null | ((module: string, prompt: string) => any),
}));

vi.mock('electron', () => ({
  app: { getPath: (k: string) => join(h.root, k), isPackaged: false },
  dialog: { showOpenDialog: vi.fn(async () => ({ canceled: true, filePaths: [] })) },
  ipcMain: { handle: (_c: string, fn: any) => { h.handler = fn; } },
  net: { fetch: vi.fn(async () => { throw new Error('offline in test'); }) },
  shell: { openPath: vi.fn(async () => '') },
  BrowserWindow: class {},
}));
vi.mock('../services/accountScope', async (orig) => ({ ...(await orig<typeof import('../services/accountScope')>()), accountPath: (...sub: string[]) => join(h.root, 'account', ...sub) }));
// 本机加密密钥的位置原本 require('electron') 现取，测试里指到临时目录
vi.mock('../services/foreignTrade/store', async (orig) => {
  const m = await orig<typeof import('../services/foreignTrade/store')>();
  class TestStore extends m.ForeignTradeStore { constructor() { super(undefined, () => join(h.root, 'userData')); } }
  return { ...m, ForeignTradeStore: TestStore };
});
vi.mock('../services/runtimeLocation', () => ({ shellResourcesPath: () => resolve(__dirname, '../../../../../resources') }));
vi.mock('../util/quitRegistry', () => ({ onAppWillQuit: () => undefined }));
vi.mock('../services/bidWriter/docx', () => ({ writePdfFromHtml: vi.fn(async (out: string, html: string) => { writeFileSync(out, `%PDF-fake ${html.length}`); }) }));
vi.mock('../services/foreignTrade/mailboxes', async (orig) => ({
  ...(await orig<typeof import('../services/foreignTrade/mailboxes')>()),
  pollMailbox: vi.fn(async () => ({ mails: h.inbox.splice(0), cursors: {} })),
  sendFromMailbox: vi.fn(async (_mb: unknown, _pw: string, input: any) => { h.sent.push(input); return { messageId: `<m${h.sent.length}@test>`, accepted: input.to, rejected: [] }; }),
}));
vi.mock('../services/workbenchLlm', () => ({
  createWorkbenchLlm: () => ({
    modelOptions: async () => [],
    llm: async () => ({ text: '', model: 'test' }),
    llmJson: async (module: string, prompt: string) => { if (!h.llm) throw new Error('模型通道没有配置'); return { json: h.llm(module, prompt), model: 'test' }; },
  }),
}));

import type { FtGateResult, FtInquiry, FtOrder, FtProduct, FtScreeningResult, FtState } from '@totalclaw/ipc-contracts';
import { registerForeignTradeHandlers } from './foreignTrade.ipc';

const call = async <R = any>(action: string, payload?: unknown): Promise<R> => h.handler!(null, { action, payload });
const state = () => call<FtState>('state.get');
const OPT_OUT = 'If this is not relevant to you, just reply "unsubscribe" and we will not email you again.';
const letter = (extra = '') => `Hi Anna,\n\nWe make stainless hinges for cabinet makers in the EU; our lead time is 25 days.\nWould a sample set be useful for your spring range?${extra}\n\nBest regards,\nLi Wei\n\n${OPT_OUT}`;

let mailboxId = '';

beforeAll(async () => {
  h.root = mkdtempSync(join(tmpdir(), 'ft-ipc-'));
  registerForeignTradeHandlers({ logger: { info: vi.fn(), warn: vi.fn() }, getMainWindow: () => null } as any);
  const mb = await call('mailbox.save', { input: { address: 'sales@maker.test', label: 'Sales', imapHost: 'imap.maker.test', imapPort: 993, smtpHost: 'smtp.maker.test', smtpPort: 465, password: 'x', purposes: ['outreach'] } });
  mailboxId = mb.id;
});
afterAll(() => rmSync(h.root, { recursive: true, force: true }));

describe('发信闸门接在发送路径上', () => {
  const draft = (body = letter(), to = ['anna@buyer.test']) => ({ kind: 'followup' as const, mailboxId, to, subject: 'Hinge samples for spring', body });

  it('没经过检查和确认的发送一律拦下，并记进发送账本', async () => {
    await expect(call('followup.send', { ...draft(), item: { key: 'k1', reason: 'silent', since: '2026-01-01' } })).rejects.toThrow(/没有经过发送前检查与确认/);
    expect(h.sent).toHaveLength(0);
    expect((await state()).sendLog[0]).toMatchObject({ status: 'blocked', kind: 'followup' });
  });

  it('未替换的变量：检查不放行', async () => {
    const r = await call<FtGateResult>('outgoing.check', draft(letter('\nAs {{company}} grows')));
    expect(r.ok).toBe(false);
    expect(r.issues.find((i) => i.rule === 'placeholder')?.message).toContain('{{company}}');
  });

  it('确认后原样发出；确认之后改过内容就拦', async () => {
    const ok = await call<FtGateResult>('outgoing.check', draft());
    expect(ok.ok).toBe(true);
    await expect(call('followup.send', { ...draft(letter(' Changed.')), approvedHash: ok.hash })).rejects.toThrow(/确认之后被改过/);
    await call('followup.send', { ...draft(), approvedHash: ok.hash });
    expect(h.sent).toHaveLength(1);
    expect((await state()).sendLog[0]).toMatchObject({ status: 'sent', hash: ok.hash });
  });

  it('每邮箱每日额度用完就拦', async () => {
    await call('settings.patch', { patch: { sendRules: { ...(await state()).settings.sendRules, dailyLimit: 1 } } });
    const r = await call<FtGateResult>('outgoing.check', draft(letter(), ['ben@other.test']));
    expect(r).toMatchObject({ ok: false, sentToday: 1, dailyLimit: 1 });
    expect(r.issues.map((i) => i.rule)).toContain('daily_limit');
    await call('settings.patch', { patch: { sendRules: { ...(await state()).settings.sendRules, dailyLimit: 40 } } });
  });

  it('抑制名单：加入要写原因；名单里的域名任何发送都拦', async () => {
    await expect(call('suppression.add', { value: 'blocked.test', reason: '' })).rejects.toThrow(/写原因/);
    await call('suppression.add', { value: 'blocked.test', reason: '客户电话里要求不再联系' });
    const r = await call<FtGateResult>('outgoing.check', { ...draft(letter(), ['buyer@blocked.test']), kind: 'quote' });
    expect(r.ok).toBe(false);
    expect(r.issues.find((i) => i.rule === 'suppressed')?.message).toContain('客户电话里要求不再联系');
  });

  it('自动回复：草稿过不了闸门就不发，拦截原因记在询盘上；来信要求退订自动进抑制名单', { timeout: 15_000 }, async () => {
    const s = await state();
    await call('mailbox.save', { input: { ...s.mailboxes[0], password: undefined, autoReply: true } });
    h.llm = (_m, prompt) => (prompt.includes('"customer_name"')
      ? { customer_name: 'Omar', company: 'Gulf Trading', country: 'AE', fields: [], items: [{ product: 'hinge', quantity: '500' }], category: { product_line: 'hinge', completeness: 'partial', intent: 'high', spam: false, reason: '', reply_type: 'quote_request' }, questions: [] }
      : { subject: 'Re: hinge inquiry', body: 'Dear [Customer Name],\nThank you for your inquiry. As an AI, I will reply soon.' });
    const at = new Date().toISOString();
    h.inbox.push(
      { automated: false, message: { id: 'in1', mailboxId, direction: 'in', messageId: '<q1@gulf.test>', from: 'omar@gulf.test', fromName: 'Omar', to: ['sales@maker.test'], subject: 'Hinge inquiry', body: 'Need 500 hinges CIF Jebel Ali', at, attachments: [] } },
      { automated: false, message: { id: 'in2', mailboxId, direction: 'in', messageId: '<u1@x.test>', from: 'stop@x.test', to: ['sales@maker.test'], subject: 'Re: hinges', body: 'Please remove me from your list.\n\nOn Mon, Li Wei wrote:\n> reply "unsubscribe"', at, attachments: [] } },
    );
    await call('mailbox.poll', { id: mailboxId });
    let q: FtInquiry | undefined;
    await vi.waitFor(async () => {
      q = (await state()).inquiries.find((x) => x.customerEmail === 'omar@gulf.test');
      expect(q?.autoReply, q?.error).toBeTruthy();
    }, { timeout: 10_000 });
    expect(q!.autoReply, JSON.stringify(q!.autoReply)).toMatchObject({ sent: false, blocked: expect.any(Array) });
    expect(q!.autoReply!.blocked!.map((i) => i.rule).sort()).toEqual(['ai_tell', 'placeholder']);
    expect(q!.category?.replyType).toBe('quote_request');
    expect(h.sent.some((m) => m.to.includes('omar@gulf.test'))).toBe(false);
    expect((await state()).suppressions.find((x) => x.email === 'stop@x.test')).toMatchObject({ source: 'unsubscribe' });
  });
});

describe('名单筛查、HS 确认与单据生成', () => {
  it('导入本地名单文件后筛查命中，建单前能查到最近一次筛查', async () => {
    const p = join(__dirname, '../services/foreignTrade/__fixtures__/csl-sample.csv');
    const st = await call('screening.import', { id: 'us_csl', path: p });
    expect(st.count).toBeGreaterThan(10);
    const r = await call<FtScreeningResult>('screening.run', { name: 'Aerocaribbean Airlines', context: 'manual' });
    expect(r.level).toBe('high');
    expect((await call('screening.latest', { name: 'AEROCARIBBEAN AIRLINES' })).result.id).toBe(r.id);
    expect((await state()).screenings[0].id).toBe(r.id);
  });

  it('HS 编码：本地检索给候选，人工确认后才进单据；PI / CI / 装箱单生成并通过交叉校验', async () => {
    // product.import 走打包后的 require 读 Excel，vitest 里换成直接保存同样的产品
    await call('product.save', { product: { id: '', model: 'HG-35', name: 'Stainless steel hinge', spec: 'hinges of base metal for furniture', unitCost: 6.5, pcsPerCarton: 100, cartonCbm: 0.03, unitNetKg: 0.12 } });
    const prod = (await state()).products.find((x) => x.model === 'HG-35') as FtProduct;
    const withHs = await call<FtProduct>('hs.suggest', { productId: prod.id, rerank: false });
    expect(withHs.hsSuggestions!.map((c) => c.code)).toContain('830210');
    await expect(call('hs.confirm', { productId: prod.id, code: '990000' })).rejects.toThrow(/HS2022/);

    const order = await call<FtOrder>('order.create', { orderNo: 'SO-1', customerName: 'Gulf Trading LLC', currency: 'USD' });
    let o = await call<FtOrder>('docs.prepare', { orderId: order.id });
    const input = { ...o.tradeDocs!.input, seller: { name: 'Maker Co., Ltd.', address: 'Ningbo' }, bank: { name: 'Bank of Ningbo', accountNo: '123', swift: 'BKNBCN2N' }, portOfDestination: 'Jebel Ali', certificates: 'CO',
      lines: [{ no: 1, productId: prod.id, model: 'HG-35', description: 'Stainless steel hinge', hsCode: '830210', quantity: 1000, unit: 'PCS', unitPrice: '1.235', unitNetKg: 0.12, pcsPerCarton: 100, cartonCbm: 0.03 }] };
    o = await call<FtOrder>('docs.save', { orderId: order.id, input });
    expect(o.tradeDocs!.input.lines[0]).toMatchObject({ unitPrice: 1.235, hsConfirmed: false });
    await expect(call('docs.generate', { orderId: order.id })).rejects.toThrow(/HS 编码还没有人工确认/);

    await call('hs.confirm', { productId: prod.id, code: '8302.10' });
    o = await call<FtOrder>('docs.generate', { orderId: order.id });
    expect(o.tradeDocs!.generated!.totals).toMatchObject({ amount: 1235, cartons: 10, netWeightKg: 120 });
    expect(o.tradeDocs!.generated!.totals.amountInWords).toBe('USD ONE THOUSAND TWO HUNDRED THIRTY-FIVE ONLY');
    expect(o.tradeDocs!.validation!.filter((f) => f.level === 'error')).toEqual([]);

    const ci = o.tradeDocs!.generated!.files.find((f) => f.kind === 'CI')!;
    const sheet = XLSX.read(readFileSync(ci.xlsx), { cellFormula: true }).Sheets.CI;
    const cells = Object.values(sheet).filter((c: any) => c && typeof c === 'object' && 'v' in c) as any[];
    expect(cells.some((c) => c.v === '830210')).toBe(true);
    expect(cells.some((c) => /^ROUND\(E\d+\*H\d+,2\)$/.test(c.f || ''))).toBe(true);

    const checked = await call<FtOrder>('order.check', { id: order.id });
    expect(checked.check!.issues).toEqual([]);
    expect(checked.check!.findings!.filter((f) => f.level === 'error')).toEqual([]);
  });
});
