/**
 * 政采云页面：地址、在页面里执行的脚本、读回内容的解析（纯函数，可单测）。
 *
 * 结构来自 2026-10-10 用一个吉林账号登录后的实地查看（只读，没有提交任何内容）：
 *   登录页      https://login.zcygov.cn/user-login/                  #username / #password，协议勾选框由人勾
 *   供应商工作台 https://middle.zcygov.cn/guide/supplier
 *                 入驻中的账号在 h2 里写着「您正在入驻吉林省，当前身份为·临时供应商」，下面是六步入驻进度；
 *                 「待办总览」每个计数是一个 .store-one（内容形如「0 待接单」）
 *   入驻列表    https://middle.zcygov.cn/supplier-v2/#/enter/supplier/list   状态「待提交(入驻审核)」，操作「查看」「继续入驻」
 *   入驻填报    https://middle.zcygov.cn/settle-front/#/enter/newsettle?…libraryCode=229900
 *                 输入框的 id 是稳定的字段路径（supplierBaseInfo.name、certificateBiz.socialCreditCode …）
 *                 按钮：开始识别 / 新增 / 上传 / 进入工作台 / 保存草稿 / 提交入驻申请
 *   商品中心    https://www.zcygov.cn/goods-center/…   临时供应商访问是 403「无访问权限」——没入驻完就上不了架
 */
import type { ZcCompany } from '@totalclaw/ipc-contracts';

export const ZCY_WORKBENCH_URL = 'https://middle.zcygov.cn/guide/supplier';
export const ZCY_ONBOARD_LIST_URL = 'https://middle.zcygov.cn/supplier-v2/#/enter/supplier/list';

/** i18n-ignore: 政采云页面上的原文，拿去匹配别人的页面 */
const T = {
  identity: /您正在入驻(.+?)[，,]\s*当前身份为[·•\s]*(.+)/,
  temp: '临时', todoLabels: ['协议待办理', '商品待上架', '商品冻结', '待接单', '待发货', '退换货', '获取采购文件', '待投标', '待开标', '待澄清', '待报价', '合同确认'],
  forbidden: '无访问权限',
};

/** i18n-ignore: 工作台快照脚本（只读）：身份那一句、待办计数卡、是否被打回登录页；里面的中文是政采云页面原文 */
export const WORKBENCH_SCRIPT = `(() => {
  const vis = (el) => { const r = el.getBoundingClientRect(); return r.width > 0 && r.height > 0; };
  const one = (el) => String(el.innerText || '').split(/\\s+/).join(' ').trim();
  const h = Array.from(document.querySelectorAll('h1,h2,h3')).map(one).find((t) => t.indexOf('当前身份为') >= 0) || '';
  return JSON.stringify({ url: location.href, host: location.hostname, title: document.title, identity: h,
    cards: Array.from(document.querySelectorAll('.store-one')).filter(vis).map(one),
    hasLoginForm: !!document.querySelector('#password, input[type=password]'),
    text: one(document.body || document.documentElement).slice(0, 1500) });
})()`;

export interface ZcWorkbenchRead {
  url: string;
  loggedIn: boolean;
  /** 入驻的区划（如 吉林省）；正式供应商的工作台上没有这句话，读不到为空 */
  region: string;
  /** 身份原文（如 临时供应商） */
  identity: string;
  /** 还没成为正式供应商：商品中心等后台没有权限 */
  temporary: boolean;
  todos: Array<{ label: string; count: number }>;
  /** 这一页是不是供应商工作台 */
  onWorkbench: boolean;
  forbidden: boolean;
}

export function parseWorkbench(raw: unknown): ZcWorkbenchRead {
  let o: any = {};
  try { o = typeof raw === 'string' ? JSON.parse(raw) : raw || {}; } catch { o = {}; }
  const url = String(o.url || ''); const host = String(o.host || '');
  const onLogin = host === 'login.zcygov.cn' || !!o.hasLoginForm;
  const m = T.identity.exec(String(o.identity || ''));
  const todos: Array<{ label: string; count: number }> = [];
  for (const c of Array.isArray(o.cards) ? o.cards : []) {
    const mm = /^(\d+)\s+(.+)$/.exec(String(c).trim());
    if (mm && T.todoLabels.includes(mm[2].trim())) todos.push({ label: mm[2].trim(), count: Number(mm[1]) });
  }
  const identity = m ? m[2].trim() : '';
  return {
    url, loggedIn: !onLogin && /(^|\.)zcygov\.cn$/.test(host), region: m ? m[1].trim() : '', identity, temporary: identity.includes(T.temp),
    todos, onWorkbench: url.startsWith(ZCY_WORKBENCH_URL), forbidden: String(o.text || '').includes(T.forbidden),
  };
}

export const todoCount = (w: Pick<ZcWorkbenchRead, 'todos'> | null | undefined, label: string): number => w?.todos.find((t) => t.label === label)?.count ?? 0;

/** i18n-ignore: 入驻填报页的文本类字段：输入框 id → 企业资料里的键，label 是政采云页面上的字段原名（给人对照页面用）。下拉、级联、日期、上传、单选不在这里，由人在页面上选。 */
export const ONBOARD_FIELDS: Array<{ id: string; key: keyof ZcCompany; label: string }> = [
  { id: 'supplierBaseInfo.name', key: 'name', label: '商家全称' },
  { id: 'supplierBaseInfo.englishName', key: 'englishName', label: '英文名称' },
  { id: 'supplierBaseInfo.abbreviation', key: 'shortName', label: '商家简称' },
  { id: 'supplierBaseInfo.bizAddress', key: 'address', label: '详细地址' },
  { id: 'supplierBaseInfo.postcode', key: 'postcode', label: '邮政编码' },
  { id: 'supplierBaseInfo.contactPhone', key: 'phone', label: '对外联系电话' },
  { id: 'supplierBaseInfo.enterpriseEmail', key: 'email', label: '对外电子邮箱' },
  { id: 'supplierBaseInfo.contactpersonName', key: 'contact', label: '联系人姓名' },
  { id: 'supplierBaseInfo.contactpersonPhone', key: 'contactMobile', label: '联系人电话' },
  { id: 'supplierBaseInfo.bsseTotalAssets', key: 'totalAssets', label: '上年末资产总额(万元)' },
  { id: 'supplierBaseInfo.employees', key: 'employees', label: '上年末从业人员(人)' },
  { id: 'supplierBaseInfo.businessIncome', key: 'income', label: '上年度营业收入(万元)' },
  { id: 'supplierBaseInfo.companyIntro', key: 'intro', label: '店铺介绍' },
  { id: 'certificateBiz.socialCreditCode', key: 'creditCode', label: '统一社会信用代码' },
  { id: 'certificateBiz.certificateOrgname', key: 'registerOrg', label: '登记机关' },
  { id: 'certificateBiz.registerCapital', key: 'registerCapital', label: '注册资金(万元)' },
  { id: 'certificateBiz.mainscope', key: 'scope', label: '经营范围' },
  { id: 'certificateSocialInsurance.onjobQuantity', key: 'onjobCount', label: '在职人数' },
  { id: 'certificateSocialInsurance.socialPayQuantity', key: 'socialPayCount', label: '社保缴费人数' },
];

/** i18n-ignore: 入驻页上要人自己处理的项（应用不代选、不代传），是政采云页面上的字段原名 */
export const ONBOARD_MANUAL = ['店铺logo', '营业执照登记机关所在地', '所在地区', '所属经济行业', '商家规模', '是否残疾人福利企业', '是否监狱企业', '经济性质', '商家类型', '是否上市', '是否是品牌商', '营业执照扫描件', '成立日期', '证件有效期', '币种', '单位社保缴纳凭证附件', '法定代表人信息（身份证正反面盖章扫描件）', '《注册声明》盖章扫描件', '勾选「本人已阅读并同意」'];

export function isOnboardFormUrl(url: string): boolean {
  try { const u = new URL(url); return u.protocol === 'https:' && u.hostname === 'middle.zcygov.cn' && u.pathname.startsWith('/settle-front') && u.hash.includes('newsettle'); } catch { return false; }
}

/**
 * 入驻表单填充脚本：只填文本框，按 id 定位；不点任何按钮（保存草稿、提交入驻申请都由人点）。
 * 默认不覆盖页面上已经有的值（平台按营业执照预填的内容以平台为准），页面上的值和资料不一样的列出来给人看。
 */
export function onboardFillScript(company: Partial<ZcCompany>, overwrite = false): string {
  const pairs = ONBOARD_FIELDS.map((f) => [f.id, f.label, String((company as Record<string, unknown>)[f.key] ?? '').trim()]).filter((p) => p[2]);
  return `(() => {
  if (location.hostname !== 'middle.zcygov.cn' || location.hash.indexOf('newsettle') < 0) return JSON.stringify({ error: 'not-onboard-form' });
  const pairs = ${JSON.stringify(pairs)};
  const overwrite = ${overwrite ? 'true' : 'false'};
  const out = { filled: [], same: [], kept: [], missing: [] };
  for (const [id, label, value] of pairs) {
    const el = document.getElementById(id);
    if (!el || (el.tagName !== 'INPUT' && el.tagName !== 'TEXTAREA') || el.disabled || el.readOnly) { out.missing.push(label); continue; }
    const cur = String(el.value || '').trim();
    if (cur === value) { out.same.push(label); continue; }
    if (cur && !overwrite) { out.kept.push([label, cur.slice(0, 60)]); continue; }
    const proto = el.tagName === 'TEXTAREA' ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype;
    const d = Object.getOwnPropertyDescriptor(proto, 'value');
    el.focus(); d.set.call(el, value);
    el.dispatchEvent(new Event('input', { bubbles: true })); el.dispatchEvent(new Event('change', { bubbles: true })); el.blur();
    out.filled.push(label);
  }
  return JSON.stringify(out);
})()`;
}

export interface OnboardFillResult { filled: string[]; same: string[]; kept: Array<[string, string]>; missing: string[]; error?: string }

export function parseFillResult(raw: unknown): OnboardFillResult {
  try {
    const o = typeof raw === 'string' ? JSON.parse(raw) : raw || {};
    return { filled: (o.filled || []).map(String), same: (o.same || []).map(String), kept: (o.kept || []).map((x: any) => [String(x[0]), String(x[1])] as [string, string]), missing: (o.missing || []).map(String), ...(o.error ? { error: String(o.error) } : {}) };
  } catch { return { filled: [], same: [], kept: [], missing: [], error: 'bad-result' }; }
}
