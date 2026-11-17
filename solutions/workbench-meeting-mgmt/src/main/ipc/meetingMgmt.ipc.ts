/**
 * 解决方案 · 会议智能管理工作台（主进程 IPC）。docs/meeting-mgmt-workbench.md
 *
 * 一条动作通道 WORKBENCH_MM_INVOKE：{ action, payload } → MeetingMgmtService.dispatch(PC 当前身份, action, payload)；
 * 数据变化 / 处理进度 / 手机页服务状态经 WORKBENCH_MM_EVENT 推给窗口。
 * 只在电脑端的三个动作在这一层处理：
 *   meeting.pickFiles   弹系统选择框 → meeting.upload
 *   voiceprint.import   弹系统选择框选一段录音 → voiceprint.enroll（PC 导入声纹，同一入口）
 *   org.importFile      弹系统选择框选通讯录表格 → org.import
 *   file.open           用系统默认程序打开会议文件（openPathGuarded，不直接 shell.openPath）
 * 设置里 AI 转写选「agent」时，流水线逐段调 agent 自己的 STT（transcribeWavViaAgent，与语音输入同一条路）；
 * agent 没就绪时流水线回落本机 Whisper。
 * 返回的函数停掉定时提醒、手机页服务和正在跑的流水线（卸载 / 停用时由宿主调用）。
 */
import { dialog, ipcMain, type BrowserWindow, type OpenDialogOptions } from 'electron';
import { IPC_CHANNELS } from '@totalclaw/ipc-contracts';
import { t as i18nT } from '@totalclaw/i18n';
import type { MmEvent } from '../../shared/meetingMgmt/types';
import type { WorkbenchIpcDeps } from './workbenchApi';
import { openPathGuarded } from '../utils/openPathGuarded';
import { userFacingError } from '../utils/userFacingError';
import { onAppWillQuit } from '../util/quitRegistry';
import { MM_PICK_EXTENSIONS, MeetingMgmtService } from '../services/meetingMgmt/service';
import { createMeetingLlm } from '../services/meetingMgmt/llm';
import { configureMeetingPipeline } from '../services/meetingMgmt/pipeline/runtime';

const VOICE_EXTENSIONS = ['wav', 'mp3', 'm4a', 'aac', 'amr', 'flac', 'ogg', 'opus', 'webm', 'caf', 'aiff', 'wma'];

export function registerMeetingMgmtHandlers(deps: WorkbenchIpcDeps): () => void {
  const logger = deps.logger;
  const win = (): BrowserWindow | null => deps.getMainWindow?.() ?? null;
  const emit = (ev: MmEvent): void => {
    try { win()?.webContents.send(IPC_CHANNELS.WORKBENCH_MM_EVENT, ev); } catch { /* 窗口已关 */ }
  };
  configureMeetingPipeline({
    agentTranscribe: async (wavBase64) => {
      const [{ transcribeWavViaAgent }, { QiyeApiClient }] = await Promise.all([import('../services/localAsr'), import('../services/qiyeApiClient')]);
      const proc = deps.qiyeApiProc;
      const client = proc && proc.getStatus() === 'ready'
        ? new QiyeApiClient({ baseUrl: proc.getBaseUrl(), getBearerToken: () => proc.getBearerToken(), defaultTimeoutMs: 180_000 })
        : null;
      return transcribeWavViaAgent(wavBase64, client);
    },
  });
  const service = new MeetingMgmtService({ llm: createMeetingLlm(deps), emit, logger });
  service.startBackground();

  const pick = async (opts: OpenDialogOptions): Promise<string[]> => {
    const w = win();
    const r = w ? await dialog.showOpenDialog(w, opts) : await dialog.showOpenDialog(opts);
    return r.canceled ? [] : r.filePaths;
  };

  const handlers: Record<string, (payload: any) => Promise<unknown>> = {
    'meeting.pickFiles': async (p) => {
      const paths = await pick({
        title: i18nT('选择会议录音、录屏或文字记录'),
        properties: ['openFile', 'multiSelections'],
        filters: [{ name: i18nT('会议文件'), extensions: MM_PICK_EXTENSIONS }, { name: i18nT('所有文件'), extensions: ['*'] }],
      });
      if (!paths.length) return null;
      return service.dispatchPc('meeting.upload', { id: p?.id, paths });
    },
    'voiceprint.import': async (p) => {
      const paths = await pick({
        title: i18nT('选择一段 10~15 秒的本人录音'),
        properties: ['openFile'],
        filters: [{ name: i18nT('录音'), extensions: VOICE_EXTENSIONS }, { name: i18nT('所有文件'), extensions: ['*'] }],
      });
      if (!paths.length) return null;
      return service.dispatchPc('voiceprint.enroll', { personId: p?.personId, path: paths[0], consent: p?.consent === true, ...(typeof p?.autoLearn === 'boolean' ? { autoLearn: p.autoLearn } : {}) });
    },
    'org.importFile': async () => {
      const paths = await pick({
        title: i18nT('选择通讯录表格（企微后台「通讯录 → 导出成员」导出的文件）'),
        properties: ['openFile'],
        filters: [{ name: i18nT('表格'), extensions: ['xlsx', 'xls', 'csv'] }, { name: i18nT('所有文件'), extensions: ['*'] }],
      });
      if (!paths.length) return null;
      return service.dispatchPc('org.import', { path: paths[0] });
    },
    'file.open': async (p) => {
      const path = service.resolveMeetingFile(service.pcActorId(), p);
      const err = await openPathGuarded(path);
      if (err) throw new Error(i18nT('打开文件失败：{p0}', { p0: err }));
      return true;
    },
  };

  ipcMain.handle(IPC_CHANNELS.WORKBENCH_MM_INVOKE, async (_e, req: { action: string; payload?: unknown }) => {
    const action = String(req?.action || '');
    const payload = req?.payload ?? {};
    try {
      const h = handlers[action];
      return h ? await h(payload) : await service.dispatchPc(action, payload);
    } catch (error) {
      logger?.warn?.('meeting-mgmt', `${action} failed`, { error: (error as Error)?.message });
      throw new Error(userFacingError(error));
    }
  });

  let stopped = false;
  const stop = (): void => {
    if (stopped) return;
    stopped = true;
    void service.stop();
  };
  const offQuit = onAppWillQuit('meeting-mgmt', stop, { once: true });
  // 卸载 / 停用时由宿主调用（宿主只撤 IPC 通道，后台任务要自己停）
  return () => { offQuit(); stop(); };
}
