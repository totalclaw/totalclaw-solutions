/**
 * 邮件 / 发票命名模板里的变量名随界面语言显示（{服务商} / {Provider} / {مزود_الخدمة}），三种写法都能被替换：
 * 引擎先把译名还原成中文变量名再填值，已存的中文模板照常可用。主进程与界面共用（无依赖）。
 * i18n-ignore：变量名是模板语法，不走词典（词典译名带空格 / 大小写不一，不能当变量名）。
 */
// i18n-ignore：中文变量名是模板语法（已存模板与 fillTemplate 用的就是它们），不翻译
export const VAR = { provider: '服务商', period: '结算期', payable: '应付合计', sentDate: '发送日期', seq: '序号', date: '日期', originalName: '原文件名' } as const;

// i18n-ignore：同上，变量名的三种写法
export const TEMPLATE_TOKENS: Record<string, { 'en-US': string; ar: string }> = {
  服务商: { 'en-US': 'Provider', ar: 'مزود_الخدمة' },
  结算期: { 'en-US': 'Period', ar: 'فترة_التسوية' },
  应付合计: { 'en-US': 'Payable', ar: 'المستحق' },
  发送日期: { 'en-US': 'SentDate', ar: 'تاريخ_الإرسال' },
  序号: { 'en-US': 'Seq', ar: 'الرقم' },
  日期: { 'en-US': 'Date', ar: 'التاريخ' },
  原文件名: { 'en-US': 'OriginalName', ar: 'اسم_الملف' },
};

/** 当前语言下的变量写法（带花括号）；中文或未知语言用中文变量名 */
export function templateToken(zh: string, locale: string): string {
  const alias = locale === 'en-US' || locale === 'ar' ? TEMPLATE_TOKENS[zh]?.[locale] : undefined;
  return `{${alias || zh}}`;
}

const ALIAS_TO_ZH = new Map<string, string>();
for (const [zh, names] of Object.entries(TEMPLATE_TOKENS)) {
  ALIAS_TO_ZH.set(names['en-US'].toLowerCase(), zh);
  ALIAS_TO_ZH.set(names.ar, zh);
}

/** 把模板里的英文 / 阿语变量名还原成中文变量名（英文不区分大小写），其余文字不动 */
export function normalizeTemplateTokens(tpl: string): string {
  return String(tpl || '').replace(/\{([^{}]+)\}/g, (m, name: string) => {
    const zh = ALIAS_TO_ZH.get(name.trim()) ?? ALIAS_TO_ZH.get(name.trim().toLowerCase());
    return zh ? `{${zh}}` : m;
  });
}
