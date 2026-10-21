/**
 * 演示文稿产出（第 10 节）：应用不能新建 pptx，随包带三语模板（resources/finance-audit/templates/board-deck.<语言>.pptx，
 * 由 scripts/build-finance-audit-board-template.py 生成），这里用 pptxEditor 只替换 `{{占位符}}` 的文字，
 * 其余 XML（版式、字体、阿语模板的 rtl="1" 段落方向）原样保留。
 *
 * 模板固定 8 页：第 1 页封面（title / subtitle / company / period / draft / boundary），
 * 第 2–8 页各一个标题 sN.title 与 6 行要点 sN.b1–b6，每页页脚 footer。没给值的占位符写成空。
 */
import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { i18nKey } from '@totalclaw/i18n';
import type { FauLocale } from '@totalclaw/ipc-contracts';
import { readPptx, writePptx, type PptPatch } from '../../pptxEditor';
import { FauStepError } from '../skillRunner';

export const DECK_SLIDES = 8;
export const DECK_BULLETS = 6;

function templateRoots(): string[] {
  const out: string[] = [];
  try { if ((process as any).resourcesPath) out.push(join((process as any).resourcesPath, 'finance-audit', 'templates')); } catch { /* 非 electron */ }
  // 源码（src/main/services/financeAudit/outputs）上溯 7 层；打包后的 dist/main 上溯 4 层
  for (let up = 3; up <= 8; up += 1) out.push(join(__dirname, ...Array(up).fill('..'), 'resources', 'finance-audit', 'templates'));
  return out;
}

export function deckTemplate(locale: FauLocale): string | null {
  for (const root of templateRoots()) {
    const p = join(root, `board-deck.${locale}.pptx`);
    if (existsSync(p)) return p;
  }
  return null;
}

/** 一页的内容：标题 + 最多 6 行（多出的截掉，换行压成一行） */
export interface DeckSlide { title: string; bullets: string[] }
export interface DeckContent {
  cover: { title: string; subtitle: string; company: string; period: string; draft: string; boundary: string };
  footer: string;
  /** 第 2–8 页 */
  slides: DeckSlide[];
}

const oneLine = (s: string, max = 220) => String(s || '').replace(/\s+/g, ' ').trim().slice(0, max);

export function deckValues(c: DeckContent): Record<string, string> {
  const v: Record<string, string> = { ...c.cover, footer: c.footer };
  for (let n = 2; n <= DECK_SLIDES; n += 1) {
    const s = c.slides[n - 2];
    v[`s${n}.title`] = oneLine(s?.title || '', 120);
    for (let i = 1; i <= DECK_BULLETS; i += 1) {
      const b = oneLine(s?.bullets[i - 1] || '');
      // 项目符号写在文字开头（模板不用 buChar），阿语段落里按 RTL 落在右侧
      v[`s${n}.b${i}`] = b ? `• ${b}` : '';
    }
  }
  for (const k of Object.keys(v)) v[k] = oneLine(v[k], 300);
  return v;
}

/** 按模板写出 pptx，返回替换的占位符个数 */
export function writeDeck(locale: FauLocale, outPath: string, content: DeckContent): { path: string; filled: number } {
  const tpl = deckTemplate(locale);
  if (!tpl) throw new FauStepError(i18nKey('找不到演示文稿模板，请重新安装应用'));
  const values = deckValues(content);
  const patches: PptPatch[] = [];
  for (const slide of readPptx(tpl).slides) {
    for (const shape of slide.shapes) {
      for (const run of shape.runs) {
        const m = run.text.match(/^\{\{([\w.]+)\}\}$/);
        if (m) patches.push({ slide: slide.index, sp: shape.sp, p: run.p, r: run.r, text: values[m[1]] ?? '' });
      }
    }
  }
  mkdirSync(dirname(outPath), { recursive: true });
  writeFileSync(outPath, writePptx(tpl, patches));
  return { path: outPath, filled: patches.length };
}
