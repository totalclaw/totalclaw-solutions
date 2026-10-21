import { describe, expect, it } from 'vitest';
import type { IvDraft, IvSeller } from '@totalclaw/ipc-contracts';
import { NN_METHODS, NUONUO_SANDBOX_TAXNUM, NUONUO_SANDBOX_URL, NUONUO_TOKEN_URL, NuonuoClient, NuonuoError, buildNuonuoOrder, normalizeNuonuoResult, nuonuoSign } from './nuonuo';

const seller: IvSeller = { name: '销方公司', taxNo: '91350100MA00000000', address: '福州市某路 1 号', phone: '0591-1', bank: '工行', bankAccount: '6222', drawer: '李四', taxpayerType: 'general', defaultTaxRate: 0.13, province: 'jilin', perInvoiceLimit: 0, remainingQuota: 0 };
const draft = (over: Partial<IvDraft> = {}): IvDraft => ({
  id: 'ivd_abc', batchId: 'b', serial: '0001', kind: 'normal', buyerName: '甲公司', buyerTaxNo: '91350100M000100Y43', buyerAddress: '', buyerPhone: '', buyerBank: '', buyerBankAccount: '',
  email: '', mobile: '', personal: false, amount: 150, tax: 19.5, total: 169.5, remark: '订单号：A1', orderNos: ['A1'], status: 'confirmed', issues: [], updatedAt: '',
  lines: [{ itemName: '键盘', taxCode: '1090511010000000000', shortName: '', spec: 'K1', unit: '个', qty: 3, price: 50, amount: 150, tax: 19.5, total: 169.5, taxRate: 0.13, rowIds: [] }], ...over,
});

/** 假服务端：按官方 SDK 的算法验签，验不过就拒 */
function fakeServer(handlers: Record<string, (content: any) => any>, secret = 'sec') {
  const calls: Array<{ url: string; method: string; headers: Record<string, string>; body: string }> = [];
  let tokenHits = 0;
  const fetchImpl = async (url: string, init: any) => {
    calls.push({ url, method: init.headers.method || '', headers: init.headers, body: init.body });
    const reply = (o: unknown) => ({ ok: true, status: 200, text: async () => JSON.stringify(o) });
    if (url === NUONUO_TOKEN_URL) {
      tokenHits += 1;
      const p = new URLSearchParams(init.body);
      if (p.get('client_secret') !== secret || p.get('grant_type') !== 'client_credentials') return reply({ error: 'invalid_client', error_description: 'bad secret' });
      return reply({ access_token: `tok${tokenHits}`, expires_in: '86400' });
    }
    const u = new URL(url);
    const q = u.searchParams;
    const expect = nuonuoSign({ path: u.pathname, appSecret: secret, appKey: q.get('appkey')!, senid: q.get('senid')!, nonce: q.get('nonce')!, timestamp: q.get('timestamp')!, body: init.body });
    if (init.headers['X-Nuonuo-Sign'] !== expect) return reply({ code: 'E9999', describe: 'sign error' });
    if (!init.headers.accessToken) return reply({ code: '070301', describe: 'no token' });
    const h = handlers[init.headers.method];
    return reply(h ? h(JSON.parse(init.body)) : { code: 'E9500', describe: 'no such method' });
  };
  return { fetchImpl, calls, tokenHits: () => tokenHits };
}
function client(handlers: Record<string, (c: any) => any>, cfg: Partial<ConstructorParameters<typeof NuonuoClient>[0]> = {}) {
  const srv = fakeServer(handlers);
  let cached: { token: string; expiresAt: number } | null = null;
  const c = new NuonuoClient({ appKey: 'app', appSecret: 'sec', sandbox: false, taxNum: seller.taxNo, ...cfg }, { get: () => cached, set: (v) => { cached = v; } }, srv.fetchImpl as any);
  return { c, srv, setCache: (v: typeof cached) => { cached = v; } };
}

describe('诺诺接口', () => {
  it('签名与官方 SDK 算法一致（固定向量）', () => {
    expect(nuonuoSign({ path: '/open/v1/services', appSecret: 'secret', appKey: 'app', senid: 'a'.repeat(32), nonce: '12345678', timestamp: '1700000000', body: '{"name":"中文"}' }))
      .toBe('4BzcKzrcoqxPis0W/W3X2ae0uIo=');
  });

  it('草稿 → order：金额三项都传、数电票种、默认不推送', () => {
    const o: any = buildNuonuoOrder(draft(), seller, { sandbox: false, taxNum: seller.taxNo }, new Date(2026, 9, 10, 9, 5, 3));
    expect(o).toMatchObject({ buyerName: '甲公司', buyerTaxNum: '91350100M000100Y43', salerTaxNum: seller.taxNo, orderNo: 'ivd_abc', invoiceDate: '2026-10-10 09:05:03', invoiceType: '1', invoiceLine: 'pc', pushMode: '-1', clerk: '李四', remark: '订单号：A1', salerAccount: '工行 6222' });
    expect(o.email).toBeUndefined();
    expect(o.invoiceDetail).toEqual([{ goodsName: '键盘', goodsCode: '1090511010000000000', withTaxFlag: '1', num: '3', price: '56.5', unit: '个', specType: 'K1', taxRate: '0.13', tax: '19.50', taxExcludedAmount: '150.00', taxIncludedAmount: '169.50', invoiceLineProperty: '0' }]);
  });
  it('专票用 bs；自然人不带税号；有邮箱才推送；沙箱用官方测试税号；没数量就不传单价', () => {
    expect((buildNuonuoOrder(draft({ kind: 'special' }), seller, { sandbox: false, taxNum: 'X' }) as any).invoiceLine).toBe('bs');
    const p: any = buildNuonuoOrder(draft({ personal: true, buyerTaxNo: '', email: 'a@b.cn', lines: [{ ...draft().lines[0], qty: 0, price: 0 }] }), seller, { sandbox: true, taxNum: 'X' });
    expect(p.buyerTaxNum).toBeUndefined();
    expect(p).toMatchObject({ pushMode: '0', email: 'a@b.cn', salerTaxNum: NUONUO_SANDBOX_TAXNUM });
    expect(p.invoiceDetail[0].num).toBeUndefined();
    expect(p.invoiceDetail[0].price).toBeUndefined();
  });

  it('提交开票：验签通过、请求头齐全、拿到流水号；token 只取一次并缓存', async () => {
    const { c, srv } = client({ [NN_METHODS.billing]: (b) => ({ code: 'E0000', describe: '开票提交成功', result: { invoiceSerialNum: `S-${b.order.orderNo}` } }) });
    expect(await c.requestBilling(buildNuonuoOrder(draft(), seller, { sandbox: false, taxNum: seller.taxNo }))).toBe('S-ivd_abc');
    expect(await c.requestBilling(buildNuonuoOrder(draft({ id: 'ivd_2' }), seller, { sandbox: false, taxNum: seller.taxNo }))).toBe('S-ivd_2');
    expect(srv.tokenHits()).toBe(1);
    const call = srv.calls.find((x) => x.method === NN_METHODS.billing)!;
    expect(call.url.startsWith('https://sdk.nuonuo.com/open/v1/services?senid=')).toBe(true);
    expect(call.headers).toMatchObject({ 'Content-Type': 'application/json', accessToken: 'tok1', userTax: seller.taxNo, method: NN_METHODS.billing, sdkVer: '1.0.6.1' });
    const q = new URL(call.url).searchParams;
    expect(q.get('senid')).toMatch(/^[0-9a-f]{32}$/);
    expect(q.get('nonce')).toMatch(/^\d{8}$/);
    expect(q.get('timestamp')).toMatch(/^\d{10}$/);
  });

  it('token 快过期才重新取；沙箱走沙箱地址与测试税号；填了固定 token 就不去换', async () => {
    const h = { [NN_METHODS.billing]: () => ({ code: 'E0000', result: { invoiceSerialNum: '1' } }) };
    const a = client(h);
    a.setCache({ token: 'old', expiresAt: Date.now() + 5 * 60_000 });
    await a.c.requestBilling({});
    expect(a.srv.tokenHits()).toBe(1);
    const b = client(h, { sandbox: true, fixedToken: 'fixed' });
    await b.c.requestBilling({});
    expect(b.srv.tokenHits()).toBe(0);
    expect(b.srv.calls[0].url.startsWith(NUONUO_SANDBOX_URL)).toBe(true);
    expect(b.srv.calls[0].headers).toMatchObject({ accessToken: 'fixed', userTax: NUONUO_SANDBOX_TAXNUM });
  });

  it('错误码原样带出来：登录失效、没权限、密钥不对', async () => {
    const { c } = client({ [NN_METHODS.billing]: () => ({ code: 'E6041', describe: '登录信息已失效，请重新验证登录' }) });
    const e = await c.requestBilling({}).catch((x) => x);
    expect(e).toBeInstanceOf(NuonuoError);
    expect(e.needsLogin).toBe(true);
    const e2 = await client({ [NN_METHODS.billing]: () => ({ code: 'E9338', describe: '该企业无权限调用API开票' }) }).c.requestBilling({}).catch((x) => x);
    expect(e2.noPermission).toBe(true);
    const e3 = await client({}, { appSecret: 'wrong' }).c.requestBilling({}).catch((x) => x);
    expect(e3).toBeInstanceOf(NuonuoError);
    expect(e3.code).toBe('invalid_client');
  });

  it('查询结果：状态归一、号码字段两种写法都认、查不动时回落到公开的同构接口', async () => {
    const rows = [
      { serialNo: 's1', orderNo: 'o1', status: '2', allElectronicInvoiceNumbe: '26222000000000000001', invoiceTime: 1791600000000, pdfUrl: 'https://x/p.pdf', ofdUrl: 'https://x/o.ofd', orderAmount: '169.50' },
      { serialNo: 's2', status: '20' }, { serialNo: 's3', status: '22', failCause: '额度不足' }, { serialNo: 's4', status: 2, invoiceNo: '26222000000000000004' }, { serialNo: 's5', status: '3' },
    ];
    const { c, srv } = client({ [NN_METHODS.queryFallback]: (b) => ({ code: 'E0000', result: rows.filter((r) => b.serialNos.includes(r.serialNo)) }) });
    const out = await c.queryResults(['s1', 's2', 's3', 's4', 's5']);
    expect(out.map((r) => r.state)).toEqual(['done', 'pending', 'failed', 'done', 'void']);
    expect(out[0]).toMatchObject({ invoiceNo: '26222000000000000001', pdfUrl: 'https://x/p.pdf', total: 169.5 });
    expect(out[0].invoiceTime).toBe(new Date(1791600000000).toISOString());
    expect(out[3].invoiceNo).toBe('26222000000000000004');
    expect(out[2].failCause).toBe('额度不足');
    expect(srv.calls.map((x) => x.method).filter(Boolean)).toEqual([NN_METHODS.query, NN_METHODS.queryFallback]);
    expect(normalizeNuonuoResult({ status: '21' }).state).toBe('pending');
  });

  it('一次最多查 50 个流水号', async () => {
    const sizes: number[] = [];
    const { c } = client({ [NN_METHODS.query]: (b) => { sizes.push(b.serialNos.length); return { code: 'E0000', result: [] }; } });
    await c.queryResults(Array.from({ length: 120 }, (_, i) => `s${i}`));
    expect(sizes).toEqual([50, 50, 20]);
  });

  it('税局登录四步', async () => {
    const seen: string[] = [];
    const { c } = client({
      [NN_METHODS.sendVerify]: (b) => { seen.push(`send:${b.eleAccount}:${b.type}`); return { code: 'E0000' }; },
      [NN_METHODS.verifyData]: () => ({ code: 'E0000', result: { verifyStatus: 1, verifyData: '138****0000' } }),
      [NN_METHODS.verifySubmit]: (b) => { seen.push(`submit:${b.smsCode}`); return { code: 'E0000' }; },
      [NN_METHODS.verifyStatus]: () => ({ code: 'E0000', result: { verifyStatus: '4' } }),
    });
    await c.sendVerify('13800000000', '1');
    expect(await c.verifyData('13800000000', '1')).toEqual({ verifyStatus: '1', verifyData: '138****0000', failMsg: '' });
    await c.verifySubmit('13800000000', '1', '123456');
    expect((await c.verifyStatus('13800000000', '1')).verifyStatus).toBe('4');
    expect(seen).toEqual(['send:13800000000:1', 'submit:123456']);
  });
});
