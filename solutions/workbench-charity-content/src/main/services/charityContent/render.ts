/**
 * 慈善活动内容工场 · Electron 渲染能力（离屏窗口 → PDF / 图片；nativeImage → 缩略图 data URL）。
 * 与 saudiOutputBuilder 同一套 printToPDF 做法；海报走 capturePage（背景色 / 字体子集由 Chromium 负责）。
 */
import { BrowserWindow, nativeImage, screen } from 'electron';
import { readFileSync, unlinkSync, writeFileSync } from 'node:fs';
import { extname } from 'node:path';

/**
 * HTML 先落盘再 loadFile：报告里内嵌 3 张照片 + 海报整张背景图都是 data URL，
 * 拼成 data:text/html 后超过 Chromium 对 URL 的长度上限会直接 ERR_FAILED（实测第二份 PDF 就炸）。
 */
async function withOffscreen<T>(html: string, tmpHtmlPath: string, width: number, height: number, fn: (win: BrowserWindow) => Promise<T>): Promise<T> {
  const win = new BrowserWindow({
    show: false, width, height, useContentSize: true,
    // Electron 42+ 默认缩放为 1；保留原来跟随主屏 DPI 的输出尺寸。
    webPreferences: { offscreen: { deviceScaleFactor: screen.getPrimaryDisplay().scaleFactor }, nodeIntegration: false, contextIsolation: true, sandbox: true, backgroundThrottling: false },
  });
  try {
    win.setContentSize(width, height);
    writeFileSync(tmpHtmlPath, html, 'utf8');
    await win.loadFile(tmpHtmlPath);
    // 字体与背景图（data URL）都在 HTML 里，给渲染进程一点时间把字体布局完
    await new Promise((r) => setTimeout(r, 250));
    return await fn(win);
  } finally {
    try { win.destroy(); } catch { /* 已销毁 */ }
    try { unlinkSync(tmpHtmlPath); } catch { /* 已删 */ }
  }
}

export async function renderHtmlToPdf(html: string, outPath: string): Promise<void> {
  await withOffscreen(html, `${outPath}.html`, 900, 1200, async (win) => {
    const buf = await win.webContents.printToPDF({ printBackground: true, pageSize: 'A4', preferCSSPageSize: true, margins: { top: 0, bottom: 0, left: 0, right: 0 } });
    writeFileSync(outPath, buf);
  });
}

export async function renderHtmlToImage(html: string, outPath: string, width: number, height: number): Promise<void> {
  await withOffscreen(html, `${outPath}.html`, width, height, async (win) => {
    const img = await win.webContents.capturePage({ x: 0, y: 0, width, height });
    if (img.isEmpty()) throw new Error('capturePage returned empty image');
    const ext = extname(outPath).toLowerCase();
    writeFileSync(outPath, ext === '.png' ? img.toPNG() : img.toJPEG(90));
  });
}

/** 本地图片 → 缩到 maxSize 的 data URL（解不了返回空串，调用方画占位） */
export function imageToDataUrl(path: string, maxSize = 720): string {
  try {
    const img = nativeImage.createFromPath(path);
    if (img.isEmpty()) return '';
    const { width, height } = img.getSize();
    const scale = Math.min(1, maxSize / Math.max(width, height));
    const resized = scale < 1 ? img.resize({ width: Math.round(width * scale), height: Math.round(height * scale), quality: 'good' }) : img;
    return `data:image/jpeg;base64,${resized.toJPEG(82).toString('base64')}`;
  } catch { return ''; }
}

export function audioToDataUrl(path: string): string {
  try {
    const buf = readFileSync(path);
    if (buf.length > 12 * 1024 * 1024) return '';
    const ext = extname(path).toLowerCase();
    const mime = ext === '.wav' ? 'audio/wav' : ext === '.m4a' ? 'audio/mp4' : 'audio/mpeg';
    return `data:${mime};base64,${buf.toString('base64')}`;
  } catch { return ''; }
}
