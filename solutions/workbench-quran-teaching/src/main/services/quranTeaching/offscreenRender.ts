/**
 * 离屏 Chromium 渲染：HTML → PNG。卡片与分镜帧都走这里，经文是页面里的真实文字（不是图像模型画的）。
 */
import { BrowserWindow, screen } from 'electron';
import { writeFileSync } from 'node:fs';

export async function renderHtmlToPng(html: string, outPath: string, width: number, height: number): Promise<void> {
  const win = new BrowserWindow({
    show: false, width, height, useContentSize: true,
    // Electron 42+ 默认缩放为 1；保留原来跟随主屏 DPI 的输出尺寸。
    webPreferences: { offscreen: { deviceScaleFactor: screen.getPrimaryDisplay().scaleFactor }, nodeIntegration: false, contextIsolation: true, sandbox: true, backgroundThrottling: false },
  });
  try {
    win.setContentSize(width, height);
    await win.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(html)}`);
    // 阿拉伯字体布局需要一点时间；字体全部来自系统 / CSS 内联
    await new Promise((r) => setTimeout(r, 350));
    const img = await win.webContents.capturePage({ x: 0, y: 0, width, height });
    if (img.isEmpty()) throw new Error('capturePage returned empty image');
    writeFileSync(outPath, img.toPNG());
  } finally {
    try { win.destroy(); } catch { /* 已销毁 */ }
  }
}
