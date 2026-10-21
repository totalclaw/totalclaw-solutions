/**
 * 研发工作流 IPC —— 目前只有「上传文档并解析成文本」，复用通用 documentExtractor
 * （pdf/docx/xlsx/csv/txt/md…），把解析结果填进「需求描述」。
 */
import { ipcMain, dialog } from 'electron';
import { basename } from 'path';
import { existsSync, mkdirSync } from 'fs';
import { IPC_CHANNELS } from '@totalclaw/ipc-contracts';
import { t as i18nT } from '@totalclaw/i18n';
import type { IpcDeps } from './shared';

export function registerRdWorkflowHandlers(_deps: IpcDeps): void {
  // 产出地址选择：openDirectory + createDirectory，返回绝对路径。研发工作流必须先有它才能跑，
  // 选定后由 WORKFLOW_RUN 作为本次运行 agent 的 workingDirectory（代码真落到这里）。
  ipcMain.handle(IPC_CHANNELS.WORKBENCH_RD_PICK_OUTPUT_DIR, async () => {
    const picked = await dialog.showOpenDialog({
      title: i18nT('选择产出地址（代码落地目录）'),
      properties: ['openDirectory', 'createDirectory'],
    });
    if (picked.canceled || !picked.filePaths.length) return { ok: false, canceled: true };
    const dir = picked.filePaths[0];
    try {
      mkdirSync(dir, { recursive: true }); // 选了不存在的目录（createDirectory 允许）也确保建好
    } catch (e: any) {
      return { ok: false, message: e?.message || i18nT('目录不可写') };
    }
    return { ok: true, dir };
  });

  ipcMain.handle(IPC_CHANNELS.WORKBENCH_RD_PARSE_DOC, async () => {
    const picked = await dialog.showOpenDialog({
      title: i18nT('选择需求文档'),
      properties: ['openFile', 'multiSelections'],
      filters: [
        { name: i18nT('可解析文档'), extensions: ['pdf', 'docx', 'doc', 'pptx', 'xlsx', 'xls', 'csv', 'txt', 'md', 'markdown', 'log', 'json', 'html', 'htm'] },
        { name: i18nT('所有文件'), extensions: ['*'] },
      ],
    });
    if (picked.canceled || !picked.filePaths.length) return { ok: false, canceled: true };

    const { extractDocument } = await import('../services/documentExtractor');
    const files: { name: string; text: string; reason?: string }[] = [];
    for (const fp of picked.filePaths) {
      const name = basename(fp);
      if (!existsSync(fp)) { files.push({ name, text: '', reason: i18nT('文件不存在') }); continue; }
      try {
        const doc = await extractDocument(fp, name);
        const text = (doc.text || '').trim();
        files.push({ name, text, reason: text ? undefined : (doc.warning || i18nT('未解析到文本（可能是扫描件/加密/不支持的格式）')) });
      } catch (e: any) {
        files.push({ name, text: '', reason: e?.message || String(e) });
      }
    }
    const combinedText = files.filter((f) => f.text).map((f) => `# ${f.name}\n${f.text}`).join('\n\n');
    return { ok: true, files, combinedText };
  });
}
