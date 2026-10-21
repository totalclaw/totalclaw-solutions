import { describe, expect, it } from 'vitest';
import { isZcyHost, loginFillScript } from './login';

describe('政采云登录', () => {
  it('只认 https 的 zcygov.cn 及其子域', () => {
    expect(isZcyHost('https://login.zcygov.cn/user-login/')).toBe(true);
    expect(isZcyHost('https://www.zcygov.cn/')).toBe(true);
    expect(isZcyHost('https://zcygov.cn')).toBe(true);
    expect(isZcyHost('http://login.zcygov.cn/')).toBe(false);
    expect(isZcyHost('https://login.zcygov.cn.evil.com/')).toBe(false);
    expect(isZcyHost('https://evilzcygov.cn/')).toBe(false);
    expect(isZcyHost('https://evil.com/?u=login.zcygov.cn')).toBe(false);
    expect(isZcyHost('about:blank')).toBe(false);
    expect(isZcyHost('')).toBe(false);
  });

  it('账号密码里有引号、反斜杠、换行、模板符号也不会把脚本撑破', () => {
    const user = 'a"b\\c';
    const pass = "p'`${x}\n</script> ";
    const script = loginFillScript(user, pass);
    // 语法上是一段合法脚本
    expect(() => new Function(`return ${script}`)).not.toThrow();
    // 在一个假的页面环境里跑：填进去的值与原值逐字符相同
    const made: Record<string, any> = {};
    const input = (type: string) => {
      const el: any = { type, value: '', getAttribute: (k: string) => (k === 'type' ? type : null), getBoundingClientRect: () => ({ width: 10, height: 10 }), focus() {}, dispatchEvent() {}, closest: () => null };
      el.compareDocumentPosition = (other: any) => (other === made.pw && type !== 'password' ? 4 : 0);
      return el;
    };
    made.user = input('text'); made.pw = input('password');
    const desc = { set(this: any, v: string) { this.value = v; } };
    const run = new Function('document', 'getComputedStyle', 'HTMLInputElement', 'Node', 'Event', 'Object', `return ${script}`);
    const fakeObject = { getOwnPropertyDescriptor: () => desc };
    const doc = { querySelectorAll: (sel: string) => (sel.includes('password') ? [made.pw] : [made.user, made.pw]) };
    const out = run(doc, () => ({ visibility: 'visible' }), { prototype: {} }, { DOCUMENT_POSITION_FOLLOWING: 4 }, class { constructor(public t: string) {} }, fakeObject);
    expect(out).toBe('filled');
    expect(made.user.value).toBe(user);
    expect(made.pw.value).toBe(pass);
  });

  it('页面上没有密码框就不填', () => {
    const run = new Function('document', 'getComputedStyle', `return ${loginFillScript('u', 'p')}`);
    expect(run({ querySelectorAll: () => [] }, () => ({}))).toBe('no-form');
  });
});
