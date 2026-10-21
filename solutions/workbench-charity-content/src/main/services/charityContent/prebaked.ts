/**
 * 慈善活动内容工场 · 预置成品（一键流程任一步失败时的兜底）。
 *
 * 目录：resources/bundled-solutions/charity-content/
 *   demo-archive.json                      演示档案（三语）
 *   prebaked/report.json                   三语报告正文
 *   prebaked/report-{zh,en,ar}.pdf         报告 PDF
 *   prebaked/poster-{zh,en,ar}.jpg         海报
 *   prebaked/speech-{zh,en,ar}.mp3         语音（逐句合成拼接）
 *   prebaked/speech-{zh,en,ar}.cues.json   语音逐句时间轴（第 4 步字幕按它对齐；回落时与 mp3 一起拷）
 *   prebaked/video-{zh,en,ar}.mp4          短视频（素材剪辑版）
 *   prebaked/video-{zh,en,ar}-ai.mp4       短视频（AI 增强版，可选）
 * 回落时把对应文件**拷进本次输出目录**，界面拿到的路径与真跑一致；只在开发者日志留一行。
 */
import { copyFileSync, existsSync, mkdirSync, readFileSync } from 'node:fs';
import { basename, join } from 'node:path';
import type { CharityArchive, CharityLang, CharityMediaDescription, CharityReport, CharityTri } from '@totalclaw/ipc-contracts';
import { t as i18nT } from '@totalclaw/i18n';
import { LANGS, normalizeArchive, toTri } from './archive';
import { parseReport } from './reportText';
import { prebakedRoot } from './demoPack';

export const PREBAKED_REL = join('bundled-solutions', 'charity-content');

export interface PrebakedSet {
  root: string;
  archive: CharityArchive | null;
  report: CharityReport | null;
  /** 预置画面描述（按 kind 顺序套到用户素材上；不含路径） */
  descriptions: Array<{ kind: 'image' | 'video'; description: CharityTri }>;
  pdf: Partial<CharityTri>;
  poster: Partial<CharityTri>;
  speech: Partial<CharityTri>;
  video: Partial<CharityTri>;
  /** AI 增强版成片（fal i2v + Stable Audio），有 key 跑过 --ai 才有 */
  videoAi: Partial<CharityTri>;
}

function existingByLang(dir: string, prefix: string, ext: string, suffix = ''): Partial<CharityTri> {
  const out: Partial<CharityTri> = {};
  for (const lang of LANGS) {
    const p = join(dir, `${prefix}-${lang}${suffix}.${ext}`);
    if (existsSync(p)) out[lang] = p;
  }
  return out;
}

/**
 * 读预置目录；缺什么就缺什么（各步只回落自己需要的那部分）。
 *
 * 优先用从 CDN 下载到本地的那一份（演示包按需下载，见 demoPack.ts），没有才退回随包目录。
 * 下载包里文件是平铺的（demo-archive.json 与 prebaked/ 下的内容同级），随包目录还是
 * 原来的两层结构 —— 所以下面每个文件都按「先平铺、后两层」两个位置找。
 */
export function loadPrebaked(resourcesDir: string): PrebakedSet {
  const bundled = join(resourcesDir, PREBAKED_REL);
  const root = prebakedRoot(resourcesDir, bundled);
  // 下载包是平铺的；随包目录里成品在 prebaked/ 子目录下
  const pre = existsSync(join(root, 'report.json')) ? root : join(root, 'prebaked');
  let archive: CharityArchive | null = null;
  try {
    const p = existsSync(join(root, 'demo-archive.json')) ? join(root, 'demo-archive.json') : join(bundled, 'demo-archive.json');
    if (existsSync(p)) archive = normalizeArchive(JSON.parse(readFileSync(p, 'utf8')), undefined, 'demo');
  } catch { archive = null; }
  let report: CharityReport | null = null;
  try {
    const p = join(pre, 'report.json');
    if (existsSync(p)) report = parseReport(readFileSync(p, 'utf8'));
  } catch { report = null; }
  let descriptions: PrebakedSet['descriptions'] = [];
  try {
    const p = join(pre, 'descriptions.json');
    if (existsSync(p)) {
      const arr = JSON.parse(readFileSync(p, 'utf8'));
      if (Array.isArray(arr)) descriptions = arr.filter((d) => d && (d.kind === 'image' || d.kind === 'video')).map((d) => ({ kind: d.kind, description: toTri(d.description) }));
    }
  } catch { descriptions = []; }
  return {
    root, archive, report, descriptions,
    pdf: existingByLang(pre, 'report', 'pdf'),
    poster: existingByLang(pre, 'poster', 'jpg'),
    speech: existingByLang(pre, 'speech', 'mp3'),
    video: existingByLang(pre, 'video', 'mp4'),
    videoAi: existingByLang(pre, 'video', 'mp4', '-ai'),
  };
}

/** 把预置描述按「同类别顺序」套到用户素材路径上：第 1 张图配第 1 条图片描述……多出来的素材复用最后一条 */
export function mapPrebakedDescriptions(set: PrebakedSet, items: Array<{ path: string; kind: 'image' | 'video' }>): CharityMediaDescription[] {
  const byKind: Record<'image' | 'video', CharityTri[]> = { image: [], video: [] };
  for (const d of set.descriptions) byKind[d.kind].push(d.description);
  const used: Record<'image' | 'video', number> = { image: 0, video: 0 };
  const out: CharityMediaDescription[] = [];
  for (const it of items) {
    const pool = byKind[it.kind].length ? byKind[it.kind] : byKind[it.kind === 'image' ? 'video' : 'image'];
    if (!pool.length) continue;
    const idx = Math.min(used[it.kind], pool.length - 1);
    used[it.kind] += 1;
    out.push({ path: it.path, kind: it.kind, description: pool[idx] });
  }
  return out;
}

export function prebakedComplete(set: PrebakedSet): boolean {
  return !!set.archive && !!set.report && LANGS.every((l) => set.pdf[l] && set.poster[l] && set.speech[l] && set.video[l]);
}

/**
 * 把一组按语言的预置文件拷进输出目录，返回新路径表（缺的语言跳过）。
 *
 * ⚠️ `neverOverwrite`：**失败回退路径必须传 true**。
 * 预置文件名与真跑输出**完全同名**（都是 `video-<lang>-ai.mp4` / `report-<lang>.pdf` …），
 * 不加保护时一次回退就会用演示片覆盖用户上一轮真跑出来的成品，而界面按成功渲染 ——
 * 用户会拿着别人机构的视频去发布（2026-09-22 审查确认）。
 * 传 true 时：目标已存在就不动它，改用 `演示-` 前缀另存，回执因此指向一个一眼能认出
 * 是演示素材的文件名，真产物原封不动。
 */
export function copyPrebakedFiles(
  files: Partial<CharityTri>,
  outDir: string,
  rename?: (lang: CharityLang, src: string) => string,
  opts: { neverOverwrite?: boolean } = {},
): Partial<CharityTri> {
  mkdirSync(outDir, { recursive: true });
  const out: Partial<CharityTri> = {};
  for (const lang of LANGS) {
    const src = files[lang];
    if (!src || !existsSync(src)) continue;
    const name = rename ? rename(lang, src) : basename(src);
    let dst = join(outDir, name);
    if (opts.neverOverwrite && existsSync(dst)) dst = join(outDir, i18nT('演示-{name}', { name }));
    copyFileSync(src, dst);
    out[lang] = dst;
  }
  return out;
}
