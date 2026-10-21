import { describe, expect, it } from 'vitest';
import { ONBOARD_FIELDS, WORKBENCH_SCRIPT, isOnboardFormUrl, onboardFillScript, parseFillResult, parseWorkbench, todoCount } from './zcyPage';

// 卡片文字照 2026-10-10 在吉林供应商工作台看到的原样
const CARDS = ['0 协议待办理', '0 商品待上架', '0 商品冻结', '2 待接单', '0 待发货', '0 退换货', '7596 获取采购文件', '0 待投标', '0 待开标', '0 待澄清', '1 待报价', '0 合同确认', '3 不认识的卡'];

describe('政采云工作台读取', () => {
  it('入驻中的账号：区划、身份、待办计数', () => {
    const w = parseWorkbench(JSON.stringify({ url: 'https://middle.zcygov.cn/guide/supplier', host: 'middle.zcygov.cn', identity: '您正在入驻吉林省，当前身份为·临时供应商', cards: CARDS, hasLoginForm: false, text: '' }));
    expect(w).toMatchObject({ loggedIn: true, onWorkbench: true, region: '吉林省', identity: '临时供应商', temporary: true });
    expect(w.todos).toHaveLength(12);
    expect(todoCount(w, '待接单')).toBe(2);
    expect(todoCount(w, '待报价')).toBe(1);
    expect(todoCount(w, '获取采购文件')).toBe(7596);
    expect(todoCount(w, '不认识的卡')).toBe(0);
  });
  it('正式供应商没有那句入驻提示；被打回登录页算没登录；别的域名不算', () => {
    const formal = parseWorkbench({ url: 'https://middle.zcygov.cn/guide/supplier', host: 'middle.zcygov.cn', identity: '', cards: CARDS });
    expect(formal).toMatchObject({ loggedIn: true, temporary: false, identity: '', region: '' });
    expect(parseWorkbench({ url: 'https://login.zcygov.cn/user-login/#/', host: 'login.zcygov.cn', hasLoginForm: true }).loggedIn).toBe(false);
    expect(parseWorkbench({ url: 'https://middle.zcygov.cn.evil.com/guide/supplier', host: 'middle.zcygov.cn.evil.com', cards: CARDS }).loggedIn).toBe(false);
    expect(parseWorkbench('不是 JSON').loggedIn).toBe(false);
    expect(parseWorkbench({ url: 'https://www.zcygov.cn/goods-center/exception/403', host: 'www.zcygov.cn', text: '无访问权限 抱歉，您无权限访问此页面' }).forbidden).toBe(true);
  });
  it('脚本语法正确', () => { expect(() => new Function(`return ${WORKBENCH_SCRIPT}`)).not.toThrow(); });
});

describe('入驻表单填充', () => {
  it('只认入驻填报页', () => {
    expect(isOnboardFormUrl('https://middle.zcygov.cn/settle-front/#/enter/newsettle?entranceType=102&settleCategory=1&libraryCode=229900')).toBe(true);
    expect(isOnboardFormUrl('https://middle.zcygov.cn/settle-front/#/enter/steps')).toBe(false);
    expect(isOnboardFormUrl('https://middle.zcygov.cn/supplier-v2/#/enter/supplier/list')).toBe(false);
    expect(isOnboardFormUrl('https://evil.com/settle-front/#/enter/newsettle')).toBe(false);
  });

  /** 假页面：按 id 取输入框，记录写入与事件 */
  function fakePage(existing: Record<string, string>, opts: { host?: string; hash?: string; absent?: string[]; readonly?: string[] } = {}) {
    const els: Record<string, any> = {};
    for (const f of ONBOARD_FIELDS) {
      if (opts.absent?.includes(f.id)) continue;
      const tag = /bizAddress|companyIntro|mainscope/.test(f.id) ? 'TEXTAREA' : 'INPUT';
      els[f.id] = { tagName: tag, value: existing[f.id] || '', disabled: false, readOnly: !!opts.readonly?.includes(f.id), events: [] as string[], focus() {}, blur() {}, dispatchEvent(e: any) { this.events.push(e.type); } };
    }
    const desc = { set(this: any, v: string) { this.value = v; } };
    const env = {
      location: { hostname: opts.host ?? 'middle.zcygov.cn', hash: opts.hash ?? '#/enter/newsettle?libraryCode=229900' },
      document: { getElementById: (id: string) => els[id] || null },
      HTMLInputElement: { prototype: {} }, HTMLTextAreaElement: { prototype: {} },
      Object: { getOwnPropertyDescriptor: () => desc }, Event: class { constructor(public type: string) {} }, JSON,
    };
    const run = (script: string) => new Function(...Object.keys(env), `return ${script}`)(...Object.values(env));
    return { els, run };
  }
  const company = { name: '示例"科技"有限公司', creditCode: '91220106MA00000000', address: '长春市某路 1 号\n2 层', postcode: '130000', email: 'a@b.cn', contact: '张三', intro: '做`${软件}`的' };

  it('空的填上，一样的不动，不一样的默认不覆盖并列出来；每个填上的都派发了 input 事件', () => {
    const page = fakePage({ 'supplierBaseInfo.name': '示例"科技"有限公司', 'certificateBiz.socialCreditCode': '91220106MAKC000000' });
    const r = parseFillResult(page.run(onboardFillScript(company)));
    expect(r.error).toBeUndefined();
    expect(r.same).toEqual(['商家全称']);
    expect(r.kept).toEqual([['统一社会信用代码', '91220106MAKC000000']]);
    expect(r.filled.sort()).toEqual(['对外电子邮箱', '店铺介绍', '联系人姓名', '详细地址', '邮政编码'].sort());
    expect(page.els['supplierBaseInfo.bizAddress'].value).toBe('长春市某路 1 号\n2 层');
    expect(page.els['supplierBaseInfo.companyIntro'].value).toBe('做`${软件}`的');
    expect(page.els['supplierBaseInfo.postcode'].events).toEqual(['input', 'change']);
    expect(page.els['certificateBiz.socialCreditCode'].value).toBe('91220106MAKC000000');
    // 资料里没填的项不碰
    expect(page.els['supplierBaseInfo.employees'].events).toEqual([]);
  });
  it('明确要求覆盖才覆盖；页面上没有或只读的输入框报出来', () => {
    const page = fakePage({ 'certificateBiz.socialCreditCode': 'OLD' }, { absent: ['supplierBaseInfo.postcode'], readonly: ['supplierBaseInfo.enterpriseEmail'] });
    const r = parseFillResult(page.run(onboardFillScript(company, true)));
    expect(page.els['certificateBiz.socialCreditCode'].value).toBe('91220106MA00000000');
    expect(r.missing.sort()).toEqual(['对外电子邮箱', '邮政编码'].sort());
    expect(r.kept).toEqual([]);
  });
  it('不在入驻填报页就什么都不做', () => {
    const a = fakePage({}, { hash: '#/enter/steps' });
    expect(parseFillResult(a.run(onboardFillScript(company))).error).toBe('not-onboard-form');
    expect(a.els['supplierBaseInfo.name'].value).toBe('');
    const b = fakePage({}, { host: 'evil.com' });
    expect(parseFillResult(b.run(onboardFillScript(company))).error).toBe('not-onboard-form');
    expect(onboardFillScript(company)).not.toMatch(/click\(|submit\(/);
  });
});
