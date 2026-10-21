/**
 * 政采云登录：域名白名单与登录框填充脚本（纯函数，可单测）。
 * 密码只在这里拼进一段在政采云页面里执行的脚本，不落盘、不进日志、不进任何模型对话。
 */

/** 只认政采云自己的域名：密码绝不填到别的站点上 */
export function isZcyHost(url: string): boolean {
  try {
    const u = new URL(url);
    return u.protocol === 'https:' && (u.hostname === 'zcygov.cn' || u.hostname.endsWith('.zcygov.cn'));
  } catch { return false; }
}

/** 登录框自动填充脚本：找可见的密码框和它前面的文本框，用原生 setter 写值并派发 input 事件（框架才认） */
export function loginFillScript(username: string, password: string): string {
  return `(() => {
  const vis = (el) => { const r = el.getBoundingClientRect(); return r.width > 0 && r.height > 0 && getComputedStyle(el).visibility !== 'hidden'; };
  const pw = Array.from(document.querySelectorAll('input[type="password"]')).find(vis);
  if (!pw) return 'no-form';
  const scope = pw.closest('form') || document;
  const texts = Array.from(scope.querySelectorAll('input')).filter((el) => vis(el) && ['text', 'tel', 'email', ''].includes((el.getAttribute('type') || '').toLowerCase()));
  const user = texts.filter((el) => el.compareDocumentPosition(pw) & Node.DOCUMENT_POSITION_FOLLOWING).pop() || texts[0];
  if (!user) return 'no-user';
  const set = (el, v) => {
    const d = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value');
    el.focus(); d.set.call(el, v);
    el.dispatchEvent(new Event('input', { bubbles: true })); el.dispatchEvent(new Event('change', { bubbles: true }));
  };
  set(user, ${JSON.stringify(username)}); set(pw, ${JSON.stringify(password)});
  return 'filled';
})()`;
}
