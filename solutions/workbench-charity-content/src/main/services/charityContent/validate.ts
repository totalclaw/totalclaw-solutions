/**
 * 慈善活动内容工场 · IPC 入参校验（纯函数，可单测）。
 * 渲染层传来的路径一律要求绝对路径；输出目录必须是「素材目录/输出/<runId>」的形状，
 * 防止把成片写到任意位置。
 */
import { isAbsolute, basename, dirname } from 'node:path';
import type { CharityLang, CharityTtsQuality, CharityVideoMode } from '@totalclaw/ipc-contracts';
import { t as i18nT } from '@totalclaw/i18n';
import { OUTPUT_DIR_NAME } from './pipeline';
import { CHARITY_PROMPT_MAX, CHARITY_TEXT_MAX } from '../../../shared/charityPrompts';

export const RUN_ID_RE = /^\d{8}-\d{6}$/;

export function requireAbs(value: unknown, label: string): string {
  const v = typeof value === 'string' ? value.trim() : '';
  if (!v || !isAbsolute(v)) throw new Error(i18nT('{label} 必须是绝对路径', { label }));
  if (v.includes('\0')) throw new Error(i18nT('{label} 含非法字符', { label }));
  return v;
}

export function requireRunId(value: unknown): string {
  const v = typeof value === 'string' ? value.trim() : '';
  if (!RUN_ID_RE.test(v)) throw new Error(i18nT('runId 格式不正确'));
  return v;
}

/** outDir 形状：<任意>/输出/<runId> 且 runId 与请求一致 */
export function requireOutDir(value: unknown, runId: string): string {
  const v = requireAbs(value, i18nT('输出目录'));
  if (basename(v) !== runId || basename(dirname(v)) !== OUTPUT_DIR_NAME) throw new Error(i18nT('输出目录与本次运行不匹配'));
  return v;
}

export function requirePaths(value: unknown, label: string, max = 200): string[] {
  if (!Array.isArray(value)) throw new Error(i18nT('{label} 必须是路径数组', { label }));
  if (value.length > max) throw new Error(i18nT('{label} 数量超过上限 {max}', { label, max }));
  return value.map((p, i) => requireAbs(p, `${label}[${i}]`));
}

const LANG_SET = new Set<CharityLang>(['zh', 'en', 'ar']);
export function requireLangs(value: unknown): CharityLang[] {
  if (value === undefined) return ['zh', 'en', 'ar'];
  if (!Array.isArray(value)) throw new Error(i18nT('langs 必须是数组'));
  const out = value.filter((l): l is CharityLang => LANG_SET.has(l));
  if (!out.length) throw new Error(i18nT('至少选择一种语言'));
  return [...new Set(out)];
}

/** 默认高保真（fal）；只有显式 'standard' 才直接走备用 edge-tts */
export function requireQuality(value: unknown): CharityTtsQuality {
  return value === 'standard' ? 'standard' : 'hd';
}

export function requireMode(value: unknown): CharityVideoMode {
  if (value === 'ai' || value === 'clip') return value;
  throw new Error(i18nT('成片模式只能是 clip 或 ai'));
}

export function requireTriText(value: unknown, maxLen = CHARITY_TEXT_MAX): Partial<Record<CharityLang, string>> {
  if (!value || typeof value !== 'object') throw new Error(i18nT('text 必须是对象'));
  const out: Partial<Record<CharityLang, string>> = {};
  for (const lang of LANG_SET) {
    const v = (value as Record<string, unknown>)[lang];
    if (typeof v === 'string' && v.trim()) out[lang] = v.trim().slice(0, maxLen);
  }
  if (!Object.keys(out).length) throw new Error(i18nT('没有可朗读的文本'));
  return out;
}

export function requireCaptions(value: unknown): Partial<Record<CharityLang, string[]>> {
  const out: Partial<Record<CharityLang, string[]>> = {};
  if (!value || typeof value !== 'object') return out;
  for (const lang of LANG_SET) {
    const v = (value as Record<string, unknown>)[lang];
    if (Array.isArray(v)) out[lang] = v.map((s) => String(s ?? '').trim()).filter(Boolean).slice(0, 8);
  }
  return out;
}

/** 提示词：缺省 / 非字符串当空（= 与没有提示词时一致）；超过上限直接报错，不静默截断 */
export function requirePrompt(value: unknown, label: string, max = CHARITY_PROMPT_MAX): string {
  if (value === undefined || value === null) return '';
  if (typeof value !== 'string') throw new Error(i18nT('{label} 必须是文本', { label }));
  const v = value.replace(/\r\n?/g, '\n').trim();
  if (v.includes('\0')) throw new Error(i18nT('{label} 含非法字符', { label }));
  if (v.length > max) throw new Error(i18nT('{label}过长（最多 {max} 字）', { label, max }));
  return v;
}
