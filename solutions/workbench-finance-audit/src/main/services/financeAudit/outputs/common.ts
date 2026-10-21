/**
 * 产出物公共：按输出语言取文案（tIn，与界面共用一套词典，第 13.2 节）、数字格式（一律西方阿拉伯数字）、
 * 文件命名与目录（第 7.2 节）。
 */
import { i18nKey, tIn } from '@totalclaw/i18n';
import type { FauLocale } from '@totalclaw/ipc-contracts';
import { safeFileName } from '../../serviceSettlement/excel';
import { join } from 'node:path';

export type L = (key: string, params?: Record<string, string | number>) => string;

export function labeler(locale: FauLocale): L {
  return (key, params) => tIn(locale, key, params);
}

/** 固定文案（产出物里所有语言都要有） */
export const OUT = {
  draft: i18nKey('草稿—待签核'),
  notOpinion: i18nKey('草稿，非审计 / 鉴证意见'),
  boundary: i18nKey('本文件为草稿：不过账、不付款、不提交申报、不对外发送、不出具审计意见；经人工签核后归档。'),
  company: i18nKey('公司'),
  project: i18nKey('项目'),
  period: i18nKey('期间'),
  module: i18nKey('模块'),
  mode: i18nKey('模式'),
  preparedAt: i18nKey('编制时间'),
  outputLocale: i18nKey('输出语言'),
  standard: i18nKey('准则'),
  model: i18nKey('模型'),
  check: i18nKey('检查项'),
  result: i18nKey('结果'),
  left: i18nKey('左边'),
  right: i18nKey('右边'),
  diff: i18nKey('差额'),
  source: i18nKey('来源'),
  row: i18nKey('行号'),
  unverified: i18nKey('未核实'),
  verified: i18nKey('已核实'),
  signLevel: i18nKey('签核级别'),
  signer: i18nKey('签核人'),
  signTitle: i18nKey('岗位'),
  signAt: i18nKey('签核时间'),
  signComment: i18nKey('意见'),
  signature: i18nKey('签名'),
  prepare: i18nKey('编制'),
  review: i18nKey('复核'),
  approve: i18nKey('批准'),
};

/** 数字：千分位与小数点按输出语言，但一律西方阿拉伯数字（与财务软件和 Excel 兼容） */
export function fmtAmount(cents: number | null | undefined, locale: FauLocale): string {
  if (cents === null || cents === undefined || !Number.isFinite(cents)) return '';
  const tag = locale === 'ar' ? 'ar-u-nu-latn' : locale;
  return new Intl.NumberFormat(tag, { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(cents / 100);
}

export function fmtPct(v: number | null | undefined, locale: FauLocale): string {
  if (v === null || v === undefined || !Number.isFinite(v)) return '';
  const tag = locale === 'ar' ? 'ar-u-nu-latn' : locale;
  return new Intl.NumberFormat(tag, { style: 'percent', maximumFractionDigits: 1 }).format(v);
}

function stamp(d = new Date()): string {
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}-${p(d.getHours())}${p(d.getMinutes())}${p(d.getSeconds())}`;
}

/** <模块码>-<产出名（输出语言）>-<期间>-<YYYYMMDD-HHMMSS>.<ext> */
export function outputFileName(code: string, title: string, period: string, ext: string, at = new Date()): string {
  return safeFileName(`${code}-${title}-${period}-${stamp(at)}.${ext}`);
}

/** <产出根>/<公司>/<项目>/<模块码>-<模块名> */
export function outputDirFor(root: string, company: string, project: string, code: string, moduleName: string): string {
  return join(root, safeFileName(company, 'company'), safeFileName(project, 'project'), safeFileName(`${code}-${moduleName}`));
}
