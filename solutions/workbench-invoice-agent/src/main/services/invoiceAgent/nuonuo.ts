/**
 * 诺诺开放平台（诺税通 SaaS）开票接口客户端。
 *
 * 规格出处（逐字核对过）：
 *   - 官方 Java SDK com.nuonuo:open-sdk:1.0.6.1（Maven Central）的 NNOpenSDK / ModuleSign / ModuleAuth；
 *   - 官方文档站的接口定义：requestBillingNew(100607)、queryInvoiceResult(100188)、
 *     sendVerifyInfo(100739)、eleAccount(100740)、verifyCompleteInv(100742)、getVerifyStatus(100741)。
 * 签名用一组固定向量复算过（见 nuonuo.test.ts）。
 *
 * 这条通道不是「完全无人」：企业的数电账号要先在诺诺这边登录电子税务局（短信或税务 APP 扫码），
 * 登录失效（E6041）后要重新验证。这里把「需要登录」当成一等状态返回，由界面引导人完成。
 * 没有用真实的诺诺账号跑过：沙箱也需要企业自己申请的 appKey / appSecret。
 */
import { createHmac, randomBytes, randomInt } from 'node:crypto';
import type { IvDraft, IvSeller } from '@totalclaw/ipc-contracts';

export const NUONUO_PROD_URL = 'https://sdk.nuonuo.com/open/v1/services';
export const NUONUO_SANDBOX_URL = 'https://sandbox.nuonuocs.cn/open/v1/services';
export const NUONUO_TOKEN_URL = 'https://open.nuonuo.com/accessToken';
/** 官方文档：沙箱环境的销方税号与 userTax 都填这个 */
export const NUONUO_SANDBOX_TAXNUM = '339902999999789113';
const SDK_VER = '1.0.6.1';

export const NN_METHODS = {
  billing: 'nuonuo.OpeMplatform.requestBillingNew',
  /** 诺税通 SaaS 的查询；公开目录里只有下面那条同构接口，查不动时回落 */
  query: 'nuonuo.OpeMplatform.queryInvoiceResult',
  queryFallback: 'nuonuo.ElectronInvoice.queryInvoiceResult',
  sendVerify: 'nuonuo.OpeMplatform.sendVerifyInfo',
  verifyData: 'nuonuo.OpeMplatform.eleAccount',
  verifySubmit: 'nuonuo.OpeMplatform.verifyCompleteInv',
  verifyStatus: 'nuonuo.OpeMplatform.getVerifyStatus',
} as const;

/** ModuleSign.getSign：a=services&l=v1&p=open&k=appKey&i=senid&n=nonce&t=timestamp&f=body → HMAC-SHA1(appSecret) → Base64 */
export function nuonuoSign(p: { path: string; appSecret: string; appKey: string; senid: string; nonce: string; timestamp: string; body: string }): string {
  const seg = p.path.split('/');
  const str = `a=${seg[3]}&l=${seg[2]}&p=${seg[1]}&k=${p.appKey}&i=${p.senid}&n=${p.nonce}&t=${p.timestamp}&f=${p.body}`;
  return createHmac('sha1', p.appSecret).update(str, 'utf8').digest('base64');
}

export class NuonuoError extends Error {
  constructor(public readonly code: string, message: string, public readonly method = '') {
    super(message);
    this.name = 'NuonuoError';
  }
  /** 数电账号的税局登录失效：要人重新做短信 / 扫码验证 */
  get needsLogin(): boolean { return this.code === 'E6041'; }
  /** 企业没有开通诺税通 SaaS 的接口开票权限 */
  get noPermission(): boolean { return this.code === 'E9338'; }
}

export interface NuonuoConfig {
  appKey: string;
  appSecret: string;
  sandbox: boolean;
  /** 销方税号（沙箱固定用官方给的测试税号） */
  taxNum: string;
  /** 人工填的 accessToken（沙箱应用页面上给的那串）；有它就不去换 token */
  fixedToken?: string;
}

export interface NuonuoTokenCache {
  get: () => { token: string; expiresAt: number } | null;
  set: (v: { token: string; expiresAt: number }) => void;
}

type FetchLike = (url: string, init: { method: string; headers: Record<string, string>; body: string; signal?: AbortSignal }) => Promise<{ ok: boolean; status: number; text: () => Promise<string> }>;

const fmtTime = (d: Date): string => {
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`;
};
const num = (v: number, digits = 2): string => (Number(v) || 0).toFixed(digits);

/** 发票草稿 → requestBillingNew 的 order（金额三项都传，接口不再自己算） */
export function buildNuonuoOrder(d: IvDraft, seller: IvSeller, cfg: Pick<NuonuoConfig, 'sandbox' | 'taxNum'>, now = new Date()): Record<string, unknown> {
  const order: Record<string, unknown> = {
    buyerName: d.buyerName,
    salerTaxNum: cfg.sandbox ? NUONUO_SANDBOX_TAXNUM : cfg.taxNum,
    salerTel: seller.phone || '',
    salerAddress: seller.address || '',
    // 订单号每个企业唯一：重新提交同一张草稿会报 E9106，正好防重复开票
    orderNo: d.id,
    invoiceDate: fmtTime(now),
    invoiceType: '1',
    // pc 数电普票(电子)；bs 数电专票(电子)
    invoiceLine: d.kind === 'special' ? 'bs' : 'pc',
    // 默认不推送；有邮箱才推邮箱。不显式传的话接口默认推手机并要求手机号
    pushMode: d.email ? '0' : '-1',
    invoiceDetail: d.lines.map((l) => ({
      goodsName: l.itemName,
      ...(l.taxCode ? { goodsCode: l.taxCode } : {}),
      withTaxFlag: '1',
      ...(l.qty ? { num: String(l.qty), price: String(Number((l.total / l.qty).toFixed(8))) } : {}),
      ...(l.unit ? { unit: l.unit } : {}),
      ...(l.spec ? { specType: l.spec } : {}),
      taxRate: String(l.taxRate),
      tax: num(l.tax),
      taxExcludedAmount: num(l.amount),
      taxIncludedAmount: num(l.total),
      invoiceLineProperty: '0',
    })),
  };
  if (!d.personal && d.buyerTaxNo) order.buyerTaxNum = d.buyerTaxNo;
  if (d.buyerAddress) order.buyerAddress = d.buyerAddress;
  if (d.buyerPhone) order.buyerTel = d.buyerPhone;
  if (d.buyerBank || d.buyerBankAccount) order.buyerAccount = `${d.buyerBank} ${d.buyerBankAccount}`.trim();
  if (seller.bank || seller.bankAccount) order.salerAccount = `${seller.bank} ${seller.bankAccount}`.trim();
  if (d.email) order.email = d.email;
  if (d.remark) order.remark = d.remark.slice(0, 200);
  if (seller.drawer) order.clerk = seller.drawer;
  return order;
}

export interface NuonuoResult {
  serialNo: string;
  orderNo: string;
  /** done 开票完成；pending 开票中 / 签章中；failed 开票或签章失败；void 已作废 / 作废中 */
  state: 'done' | 'pending' | 'failed' | 'void';
  status: string;
  statusMsg: string;
  failCause: string;
  invoiceNo: string;
  invoiceTime: string;
  pdfUrl: string;
  ofdUrl: string;
  xmlUrl: string;
  total: number;
}

export function normalizeNuonuoResult(r: any): NuonuoResult {
  const status = String(r?.status ?? '');
  const state: NuonuoResult['state'] = status === '2' ? 'done' : status === '22' || status === '24' ? 'failed' : status === '3' || status === '31' ? 'void' : 'pending';
  // 文档里这个字段名少了一个 r，两种写法都认
  const no = String(r?.allElectronicInvoiceNumber || r?.allElectronicInvoiceNumbe || r?.invoiceNo || '').trim();
  const t = Number(r?.invoiceTime);
  return {
    serialNo: String(r?.serialNo || ''), orderNo: String(r?.orderNo || ''), state, status,
    statusMsg: String(r?.statusMsg || ''), failCause: String(r?.failCause || ''), invoiceNo: no,
    invoiceTime: Number.isFinite(t) && t > 0 ? new Date(t).toISOString() : String(r?.invoiceTime || ''),
    pdfUrl: String(r?.pdfUrl || ''), ofdUrl: String(r?.ofdUrl || ''), xmlUrl: String(r?.xmlUrl || ''),
    total: Number(r?.orderAmount) || 0,
  };
}

export class NuonuoClient {
  constructor(
    private readonly cfg: NuonuoConfig,
    private readonly cache: NuonuoTokenCache,
    private readonly fetchImpl: FetchLike = (url, init) => fetch(url, init as RequestInit) as unknown as ReturnType<FetchLike>,
    private readonly timeoutMs = 30_000,
  ) {}

  get url(): string { return this.cfg.sandbox ? NUONUO_SANDBOX_URL : NUONUO_PROD_URL; }
  get taxNum(): string { return this.cfg.sandbox ? NUONUO_SANDBOX_TAXNUM : this.cfg.taxNum; }

  private async post(url: string, headers: Record<string, string>, body: string): Promise<any> {
    const ctl = new AbortController();
    const timer = setTimeout(() => ctl.abort(), this.timeoutMs);
    try {
      const res = await this.fetchImpl(url, { method: 'POST', headers, body, signal: ctl.signal });
      const text = await res.text();
      let json: any;
      try { json = JSON.parse(text); } catch { throw new NuonuoError(`HTTP_${res.status}`, text.slice(0, 200) || `HTTP ${res.status}`); }
      return json;
    } catch (e: any) {
      if (e instanceof NuonuoError) throw e;
      throw new NuonuoError(e?.name === 'AbortError' ? 'TIMEOUT' : 'NETWORK', String(e?.message || e));
    } finally { clearTimeout(timer); }
  }

  /**
   * 自用型应用的 token：有效期 24 小时，没有刷新机制，且 30 天内只能取 50 次（超限 070306）。
   * 所以必须落盘缓存，过期前 10 分钟才重新取。
   */
  async token(): Promise<string> {
    if (this.cfg.fixedToken) return this.cfg.fixedToken;
    const c = this.cache.get();
    if (c && c.token && c.expiresAt - Date.now() > 10 * 60_000) return c.token;
    const body = new URLSearchParams({ client_id: this.cfg.appKey, client_secret: this.cfg.appSecret, grant_type: 'client_credentials' }).toString();
    const json = await this.post(NUONUO_TOKEN_URL, { 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8' }, body);
    const token = String(json?.access_token || '');
    if (!token) throw new NuonuoError(String(json?.error || json?.code || 'TOKEN'), String(json?.error_description || json?.describe || json?.msg || 'accessToken'));
    const ttl = Number(json?.expires_in) > 0 ? Number(json.expires_in) : 86400;
    this.cache.set({ token, expiresAt: Date.now() + ttl * 1000 });
    return token;
  }

  async call(method: string, content: unknown): Promise<any> {
    const body = JSON.stringify(content);
    const senid = randomBytes(16).toString('hex');
    const nonce = String(randomInt(10_000_000, 100_000_000));
    const timestamp = String(Math.floor(Date.now() / 1000));
    const u = new URL(this.url);
    const sign = nuonuoSign({ path: u.pathname, appSecret: this.cfg.appSecret, appKey: this.cfg.appKey, senid, nonce, timestamp, body });
    const full = `${this.url}?senid=${senid}&nonce=${nonce}&timestamp=${timestamp}&appkey=${encodeURIComponent(this.cfg.appKey)}`;
    const json = await this.post(full, {
      'Content-Type': 'application/json', 'X-Nuonuo-Sign': sign, accessToken: await this.token(), userTax: this.taxNum, method, sdkVer: SDK_VER,
    }, body);
    const code = String(json?.code ?? '');
    if (code !== 'E0000') throw new NuonuoError(code || 'UNKNOWN', String(json?.describe || json?.msg || json?.error_description || ''), method);
    return json;
  }

  /** 提交开票：返回发票流水号（异步，结果要另外查） */
  async requestBilling(order: Record<string, unknown>): Promise<string> {
    const json = await this.call(NN_METHODS.billing, { order });
    const serial = String(json?.result?.invoiceSerialNum || '');
    if (!serial) throw new NuonuoError('NO_SERIAL', String(json?.describe || ''), NN_METHODS.billing);
    return serial;
  }

  /** 查询开票结果（一次最多 50 个流水号） */
  async queryResults(serialNos: string[]): Promise<NuonuoResult[]> {
    const out: NuonuoResult[] = [];
    for (let i = 0; i < serialNos.length; i += 50) {
      const part = serialNos.slice(i, i + 50);
      let json: any;
      try { json = await this.call(NN_METHODS.query, { serialNos: part }); } catch (e) {
        if (e instanceof NuonuoError && (e.needsLogin || e.code === 'TIMEOUT' || e.code === 'NETWORK')) throw e;
        json = await this.call(NN_METHODS.queryFallback, { serialNos: part });
      }
      for (const r of Array.isArray(json?.result) ? json.result : []) out.push(normalizeNuonuoResult(r));
    }
    return out;
  }

  // ── 数电账号的税局登录（短信 / 扫码）──
  /** type：1 短信验证码；2 多源扫码；3 税务 APP 扫码 */
  async sendVerify(eleAccount: string, type: '1' | '2' | '3'): Promise<void> { await this.call(NN_METHODS.sendVerify, { eleAccount, type }); }
  /** verifyStatus：0 获取中；1 已拿到（verifyData = 收短信的手机号 / 二维码字符串）；2 获取失败；4 已验证成功 */
  async verifyData(eleAccount: string, type: '1' | '2' | '3'): Promise<{ verifyStatus: string; verifyData: string; failMsg: string }> {
    const r = (await this.call(NN_METHODS.verifyData, { eleAccount, type }))?.result || {};
    return { verifyStatus: String(r.verifyStatus ?? ''), verifyData: String(r.verifyData || ''), failMsg: String(r.failMsg || '') };
  }
  async verifySubmit(eleAccount: string, type: '1' | '2' | '3', smsCode?: string): Promise<void> {
    await this.call(NN_METHODS.verifySubmit, { eleAccount, type, ...(smsCode ? { smsCode } : {}) });
  }
  /** verifyStatus：3 验证中；4 成功；5 失败 */
  async verifyStatus(eleAccount: string, type: '1' | '2' | '3'): Promise<{ verifyStatus: string; failMsg: string }> {
    const r = (await this.call(NN_METHODS.verifyStatus, { eleAccount, type }))?.result || {};
    return { verifyStatus: String(r.verifyStatus ?? ''), failMsg: String(r.failMsg || '') };
  }
}
