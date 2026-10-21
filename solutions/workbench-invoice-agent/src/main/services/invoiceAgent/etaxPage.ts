/**
 * 电子税务局页面：地址、在页面里执行的只读脚本、读回内容的解析（纯函数，可单测）。
 *
 * 结构来自 2026-10-10 在吉林电子税务局的实地查看（登录后、过了扫脸，只读，没有开任何发票）：
 *   门户首页   https://etax.<省>.chinatax.gov.cn:8443/           登录后是 /loginb/，「热门服务」里有「发票业务」
 *   发票业务   https://dppt.<省>.chinatax.gov.cn:8443/invoice-business   必须从门户点进来（新标签页），直接输地址会报会话失效
 *   蓝字发票开具 …/blue-invoice-makeout                           入口卡片 .invoice-entrance-choose：立即开票 / 发票草稿 / 扫码开票 / 复制开票 / 批量开票
 *   批量开票   …/blue-invoice-makeout/invoice-batch              页签「批量开票」「批量开票记录」；.t-upload 里有 input[type=file]
 * 进「蓝字发票开具」「批量开票」前各有一次实人认证（扫脸），只能由人完成。
 * 这些页面合成的 el.click() 不起作用，要用可信鼠标事件。
 */

/** i18n-ignore: 电子税务局页面上的原文，拿去匹配别人的页面 */
export const ETAX_TEXT = {
  invoiceBusiness: '发票业务', blueInvoice: '蓝字发票开具', batch: '批量开票', batchRecords: '批量开票记录',
  faceTitle: '扫脸认证', facePassed: '扫脸认证通过', faceAck: '我已知晓，继续开票', levelTip: '当前认证等级无法访问该功能',
  sessionLost: '会话已失效', login: '登录', success: '成功',
  quota: /可用发票额度[^\n]*\n\s*([\d,]+(?:\.\d+)?)\s*元/, totalQuota: /发票总额度[：:]\s*([\d,]+(?:\.\d+)?)\s*元/,
  templateVersion: /当前导入模板已更新至\s*(V\d+)\s*版/,
};

export function etaxHomeUrl(province: string): string {
  const p = String(province || '').trim().toLowerCase().replace(/[^a-z]/g, '');
  if (!p) throw new Error('province');
  return `https://etax.${p}.chinatax.gov.cn:8443/`;
}

/** 只认税务系统自己的域名：文件只往这些页面里放 */
export function isChinataxHost(url: string): boolean {
  try { const u = new URL(url); return u.protocol === 'https:' && (u.hostname === 'chinatax.gov.cn' || u.hostname.endsWith('.chinatax.gov.cn')); } catch { return false; }
}

export type EtaxPageKind = 'portal' | 'portal_login' | 'login' | 'invoice_business' | 'blue' | 'batch' | 'makeout' | 'other';

export function etaxPageKind(url: string): EtaxPageKind {
  let u: URL;
  try { u = new URL(url); } catch { return 'other'; }
  if (!isChinataxHost(url)) return 'other';
  if (u.hostname.startsWith('tpass.')) return 'login';
  if (u.hostname.startsWith('etax.')) return u.pathname.startsWith('/loginb') ? 'portal_login' : u.pathname === '/' ? 'portal' : 'other';
  if (u.hostname.startsWith('dppt.')) {
    if (u.pathname.endsWith('/invoice-batch')) return 'batch';
    if (u.pathname.endsWith('/invoice-makeout')) return 'makeout';
    if (u.pathname.startsWith('/blue-invoice-makeout')) return 'blue';
    if (u.pathname.startsWith('/invoice-business')) return 'invoice_business';
  }
  return 'other';
}

/** 页面快照脚本：可见文本、可见弹窗文本、表格（表头 + 行）——只读 */
export const SNAPSHOT_SCRIPT = `(() => {
  const vis = (el) => { const r = el.getBoundingClientRect(); return r.width > 0 && r.height > 0; };
  const clean = (s) => String(s || '').replace(/\\u00a0/g, ' ').trim();
  const dialogs = Array.from(document.querySelectorAll('[class*=dialog]')).filter(vis).map((d) => clean(d.innerText)).filter(Boolean);
  const tables = Array.from(document.querySelectorAll('table')).filter(vis).map((t) => ({
    head: Array.from(t.querySelectorAll('thead th')).map((th) => clean(th.innerText)),
    rows: Array.from(t.querySelectorAll('tbody tr')).map((tr) => Array.from(tr.querySelectorAll('td')).map((td) => clean(td.innerText))).filter((r) => r.length > 1),
  }));
  return JSON.stringify({ url: location.href, title: document.title, text: clean(document.body ? document.body.innerText : '').slice(0, 6000), dialogs: Array.from(new Set(dialogs)).slice(0, 4), tables, hasFileInput: !!document.querySelector('.t-upload input[type=file], input[type=file]') });
})()`;

/** 定位脚本：按文字找一个可见元素的中心点（给可信点击用）。scope 限定在某类容器里找，避免点到同名的别处。 */
export function locateScript(text: string, scope = ''): string {
  return `(() => {
  const want = ${JSON.stringify(text)};
  const scope = ${JSON.stringify(scope)};
  const vis = (el) => { const r = el.getBoundingClientRect(); return r.width > 0 && r.height > 0; };
  const norm = (el) => String(el.innerText || '').split(/\\s+/).join(' ').trim();
  const pool = (scope ? Array.from(document.querySelectorAll(scope)) : Array.from(document.querySelectorAll('body *'))).filter(vis);
  const hits = pool.filter((e) => norm(e) === want).sort((a, b) => a.querySelectorAll('*').length - b.querySelectorAll('*').length);
  const hit = hits[0];
  if (!hit) return '';
  hit.scrollIntoView({ block: 'center' });
  const r = hit.getBoundingClientRect();
  return JSON.stringify({ x: Math.round(r.x + r.width / 2), y: Math.round(r.y + r.height / 2) });
})()`;
}

export interface EtaxSnapshot {
  url: string; title: string; text: string; dialogs: string[]; hasFileInput: boolean;
  tables: Array<{ head: string[]; rows: string[][] }>;
}

export function parseSnapshot(raw: unknown): EtaxSnapshot {
  try {
    const o = typeof raw === 'string' ? JSON.parse(raw) : raw;
    return {
      url: String(o?.url || ''), title: String(o?.title || ''), text: String(o?.text || ''),
      dialogs: Array.isArray(o?.dialogs) ? o.dialogs.map(String) : [], hasFileInput: !!o?.hasFileInput,
      tables: Array.isArray(o?.tables) ? o.tables.map((t: any) => ({ head: (t?.head || []).map(String), rows: (t?.rows || []).map((r: any) => (r || []).map(String)) })) : [],
    };
  } catch { return { url: '', title: '', text: '', dialogs: [], hasFileInput: false, tables: [] }; }
}

const money = (s: string | undefined): number => { const n = Number(String(s || '').replace(/[,，\s¥￥元]/g, '')); return Number.isFinite(n) ? n : 0; };

export interface EtaxFacts {
  kind: EtaxPageKind;
  /** 页面右上角 / 标题里的企业名称 */
  company: string;
  taxNo: string;
  /** 可用发票额度（申报前）；读不到为 null */
  quota: number | null;
  totalQuota: number | null;
  /** 需要人做的事：face 扫脸二维码开着；level 认证等级不够（点「开始认证」）；ack 扫脸已通过待点「我已知晓」；session 会话失效；login 没登录 */
  need: '' | 'face' | 'level' | 'ack' | 'session' | 'login';
  /** 批量开票页上写的模板版本（如 V260401） */
  templateVersion: string;
}

export function etaxFacts(s: EtaxSnapshot): EtaxFacts {
  const kind = etaxPageKind(s.url);
  const dlg = s.dialogs.join('\n');
  let need: EtaxFacts['need'] = '';
  if (kind === 'login' || kind === 'portal') need = 'login';
  else if (s.text.includes(ETAX_TEXT.sessionLost)) need = 'session';
  else if (dlg.includes(ETAX_TEXT.facePassed)) need = 'ack';
  else if (dlg.includes(ETAX_TEXT.levelTip)) need = 'level';
  else if (dlg.includes(ETAX_TEXT.faceTitle)) need = 'face';
  const q = ETAX_TEXT.quota.exec(s.text); const tq = ETAX_TEXT.totalQuota.exec(s.text);
  // 标题形如「蓝字发票开具-全国统一规范电子税务局-某某公司」
  const company = (/电子税务局-(.+)$/.exec(s.title)?.[1] || '').trim();
  const taxNo = (/\n([0-9A-Z]{15,20})\n/.exec(`\n${s.text}\n`)?.[1] || '');
  return { kind, company, taxNo, quota: q ? money(q[1]) : null, totalQuota: tq ? money(tq[1]) : null, need, templateVersion: ETAX_TEXT.templateVersion.exec(s.text)?.[1] || '' };
}

export interface BatchRecord { serial: string; kind: string; invoiceNo: string; amount: number; at: string; ok: boolean; result: string; failReason: string }

/** i18n-ignore: 「批量开票记录」表头原文 */
const REC = { serial: '发票流水号', kind: '发票类型', invoiceNo: '数电发票号码', amount: '合计金额', at: '操作时间', result: '开具结果', fail: '失败原因' };

/** 读「批量开票记录」表：按发票流水号回填，精确匹配，不用猜 */
export function parseBatchRecords(s: EtaxSnapshot): BatchRecord[] {
  const t = s.tables.find((x) => x.head.some((h) => h.includes(REC.serial)) && x.head.some((h) => h.includes(REC.result)));
  if (!t) return [];
  const col = (k: string) => t.head.findIndex((h) => h.replace(/\s/g, '').includes(k));
  const c = { serial: col(REC.serial), kind: col(REC.kind), invoiceNo: col(REC.invoiceNo), amount: col(REC.amount), at: col(REC.at), result: col(REC.result), fail: col(REC.fail) };
  return t.rows.map((r) => {
    const result = (r[c.result] || '').trim();
    const invoiceNo = (r[c.invoiceNo] || '').replace(/\s/g, '');
    return { serial: (r[c.serial] || '').trim(), kind: r[c.kind] || '', invoiceNo: /^\d{8,20}$/.test(invoiceNo) ? invoiceNo : '', amount: money(r[c.amount]), at: (r[c.at] || '').trim(), ok: result.includes(ETAX_TEXT.success) && /^\d{8,20}$/.test(invoiceNo), result, failReason: c.fail >= 0 ? (r[c.fail] || '').trim() : '' };
  }).filter((x) => x.serial);
}

/** 批量开票页导入后的预览表：流水号 → 价税合计，用来核对导入的张数与金额 */
export function parseBatchPreview(s: EtaxSnapshot): Array<{ serial: string; total: number; buyer: string }> {
  /** i18n-ignore: 预览表表头原文 */
  const H = { serial: '发票流水号', total: '价税合计', buyer: '购买方纳税人名称' };
  const t = s.tables.find((x) => x.head.some((h) => h.includes(H.serial)) && x.head.some((h) => h.includes(H.total)));
  if (!t) return [];
  const col = (k: string) => t.head.findIndex((h) => h.replace(/\s/g, '').includes(k));
  const cs = col(H.serial); const ct = col(H.total); const cb = col(H.buyer);
  return t.rows.map((r) => ({ serial: (r[cs] || '').trim(), total: money(r[ct]), buyer: cb >= 0 ? (r[cb] || '').trim() : '' })).filter((x) => x.serial);
}
