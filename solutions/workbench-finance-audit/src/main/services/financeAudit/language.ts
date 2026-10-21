/**
 * 输出语言检查（第 13.3 节）：只查模型写的叙述字段。
 *
 * 先去掉引号 / 书名号 / 反引号里的内容（科目名、单位名、原文引用），以及数字、编码、链接，再按字母比例判：
 *   ar：阿拉伯字母占字母总数 60% 以上；
 *   en：没有汉字，且拉丁字母占 60% 以上；
 *   zh-CN：汉字占 30% 以上。
 * 不通过时调用方带提示重试一次；仍不通过则该步失败（不静默交付错误语言的底稿）。
 */
import type { FauLocale } from '@totalclaw/ipc-contracts';

const QUOTED = [
  /「[^」]*」/g, /『[^』]*』/g, /《[^》]*》/g, /“[^”]*”/g, /‘[^’]*’/g, /"[^"]*"/g, /`[^`]*`/g, /«[^»]*»/g,
  /\([^)]*\)/g, /（[^）]*）/g,
];

export function stripForLanguageCheck(text: string): string {
  let t = String(text || '');
  t = t.replace(/https?:\/\/\S+/g, ' ');
  for (const re of QUOTED) t = t.replace(re, ' ');
  // 编码 / 单号 / 数字
  t = t.replace(/[A-Za-z]*[-_#]?\d[\w\-./]*/g, ' ');
  return t;
}

export interface LanguageCheck {
  ok: boolean;
  han: number;
  latin: number;
  arabic: number;
}

export function checkOutputLanguage(text: string, locale: FauLocale, extraIgnore: string[] = []): LanguageCheck {
  let t = stripForLanguageCheck(text);
  // 用户数据（科目名、往来单位）原样保留，不算语言错
  for (const s of extraIgnore) if (s) t = t.split(s).join(' ');
  const han = (t.match(/\p{Script=Han}/gu) || []).length;
  const latin = (t.match(/[A-Za-z]/g) || []).length;
  const arabic = (t.match(/\p{Script=Arabic}/gu) || []).length;
  const letters = han + latin + arabic;
  if (letters === 0) return { ok: true, han, latin, arabic };
  let ok: boolean;
  if (locale === 'ar') ok = arabic / letters >= 0.6;
  else if (locale === 'en-US') ok = han === 0 && latin / letters >= 0.6;
  else ok = han / letters >= 0.3;
  return { ok, han, latin, arabic };
}
