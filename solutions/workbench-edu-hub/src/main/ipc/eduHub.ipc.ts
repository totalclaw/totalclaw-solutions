/**
 * eduHub.ipc —— AI Learning Hub 工作台 IPC（文档→教案→内网学生端）。
 *
 * 单例懒建：首次任何调用才建 store/proc（不拖慢 app 启动）；服务启停由工作台显式控制
 * （进入解决方案 onMounted 自动 START），app 退出由 proc 登记到统一退出登记器的清理兜底。
 * LLM 走 runOneshotChat plainCompletion（零工具最快链路，与聊天同大脑配置）。
 */
import { ipcMain, dialog } from 'electron';
import { IPC_CHANNELS, type EduHubEvent, type EduHubLesson } from '@totalclaw/ipc-contracts';
import type { IpcDeps } from './shared';
import { rateLimit } from './shared';
import { QiyeApiClient } from '../services/qiyeApiClient';
import { EduHubStore } from '../services/eduHubStore';
import { EduHubProc } from '../services/eduHubProc';
import { isTaskFinished, isTaskFailed } from '../services/digitalHumanProc';
import { runOneshotChat } from '../services/councilChatRouter';
import { onAccountKeyChange } from '../services/accountScope';
import { t as i18nT } from '@totalclaw/i18n';

let store: EduHubStore | null = null;
let proc: EduHubProc | null = null;
let accountHooked = false;

/** LLM 调用：把「SessionProvider 未就绪 / 大脑未配置」这类开发者措辞映射成教师能懂的引导语。 */
async function eduHubLlm(deps: IpcDeps, prompt: string, timeoutMs: number): Promise<string> {
  try {
    return await runOneshotChat(deps, prompt, { plainCompletion: true, timeoutMs });
  } catch (e: any) {
    const msg = String(e?.message || e);
    if (/SessionProvider|engineRegistry|未就绪|API key|api_key|not.*ready|provider/i.test(msg)) {
      throw new Error(i18nT('AI 大脑尚未就绪，请到「设置 → 模型配置」完成配置后重试'));
    }
    throw e;
  }
}

/** 图像生成：经 qiye-api /v1/image/generate；结果统一归一成 data URI（学生端内联展示，无需再服务图片）。 */
async function eduHubGenImage(deps: IpcDeps, prompt: string): Promise<string> {
  const proc = (deps as any).qiyeApiProc;
  if (!proc || proc.getStatus?.() !== 'ready') {
    throw new Error(i18nT('图像服务未就绪，请到「设置 → 模型配置」启用图像生成'));
  }
  const client = new QiyeApiClient({
    baseUrl: proc.getBaseUrl(),
    getBearerToken: () => proc.getBearerToken(),
    defaultTimeoutMs: 300_000,
  });
  const r: any = await client.post('/v1/image/generate', { backend: 'auto', prompt, width: 768, height: 512, n: 1 }, 300_000);
  const img = (r?.images || [])[0];
  if (!img?.url) throw new Error(i18nT('图像生成未返回图片'));
  if (String(img.url).startsWith('data:')) return String(img.url);
  // 远端 URL（带 bearer 的 qiye-api 或第三方）→ 下载成 base64 data URI，学生端可直接内联
  const resp = await fetch(String(img.url));
  const buf = Buffer.from(await resp.arrayBuffer());
  return `data:${img.mimeType || 'image/png'};base64,${buf.toString('base64')}`;
}

/** 数字人离线成片：复用 DigitalHumanProc（synthesize 提交 → 轮询 queryTask 取 video_url）。 */
async function eduHubGenAvatar(deps: IpcDeps, script: string, opts?: { aspectRatio?: string }): Promise<string> {
  const dh = deps.digitalHumanProc;
  if (!dh) throw new Error(i18nT('数字人服务未就绪，请先到「数字人工作台 → 配置」选择 provider 并填凭据'));
  // QiyeApiClient 会 snakeToCamel，故字段是 taskId/videoUrl（兼容 snake 兜底）。
  const sub: any = await dh.synthesize({ script, aspectRatio: opts?.aspectRatio || '16:9', subtitle: true });
  if (isTaskFinished(sub)) { const u = sub?.videoUrl ?? sub?.video_url; if (u) return String(u); } // 少数 provider 同步返回
  const taskId = sub?.taskId ?? sub?.task_id;
  if (!taskId) throw new Error(String(sub?.error || i18nT('数字人成片提交失败')));
  const deadline = Date.now() + 10 * 60_000; // 最长 10 分钟
  while (Date.now() < deadline) {
    await new Promise((r) => setTimeout(r, 4000));
    const q: any = await dh.queryTask(String(taskId));
    if (isTaskFailed(q)) throw new Error(String(q?.error || i18nT('数字人成片失败')));
    if (isTaskFinished(q)) { const u = q?.videoUrl ?? q?.video_url; if (u) return String(u); }
  }
  throw new Error(i18nT('数字人成片超时，请稍后重试'));
}

/** 音频总结：经 qiye-api /v1/speech/tts（返回二进制），存成 mp3 供学生端播放器播。 */
async function eduHubGenAudio(deps: IpcDeps, text: string, lang: 'zh-CN' | 'en-US' | 'ar'): Promise<Buffer> {
  const proc = (deps as any).qiyeApiProc;
  if (!proc || proc.getStatus?.() !== 'ready') {
    throw new Error(i18nT('语音服务未就绪，请到「设置 → 模型配置」启用语音合成'));
  }
  const client = new QiyeApiClient({
    baseUrl: proc.getBaseUrl(),
    getBearerToken: () => proc.getBearerToken(),
    defaultTimeoutMs: 300_000,
  });
  // TTS 不接受 backend:'auto'（与图像不同）——必须给具体后端。查 capabilities 按语言挑后端+音色。
  const bcp47 = lang === 'ar' ? 'ar' : lang === 'en-US' ? 'en-US' : 'zh-CN';
  const langPrefix = bcp47.split('-')[0].toLowerCase(); // zh / en / ar
  let backend = ''; let voice = '';
  try {
    const caps: any = await client.get('/v1/speech/tts/capabilities', 30_000);
    const backends: any[] = caps?.backends || [];
    // 优先：某后端有匹配目标语言的音色
    for (const b of backends) {
      const v = (b.voices || []).find((x: any) => String(x.language || '').toLowerCase().startsWith(langPrefix));
      if (v) { backend = b.name; voice = v.id; break; }
    }
    // 兜底：多语言后端 elevenlabs（无语言标签也能念），否则第一个后端
    if (!backend) {
      const chosen = backends.find((b) => b.name === 'elevenlabs') || backends[0];
      if (chosen) { backend = chosen.name; voice = (chosen.voices || [])[0]?.id || ''; }
    }
  } catch (e: any) {
    deps.logger?.warn?.('edu-hub', i18nT('读取 TTS 能力失败'), { err: String(e?.message || e) });
  }
  if (!backend) throw new Error(i18nT('未找到可用的语音合成后端，请到「设置 → 模型配置」配置 TTS 提供方'));
  const body: Record<string, unknown> = { backend, text, language: bcp47, format: 'mp3' };
  if (voice) body.voice = voice;
  let buffer: Buffer;
  try {
    ({ buffer } = await client.postBinary('/v1/speech/tts', body, 300_000));
  } catch (e: any) {
    // TTS 走流式响应：后端未配 API Key 时会在流中途抛错 → 客户端只见 'terminated'，
    // 拿不到「ELEVENLABS_API_KEY not set」原文。给可操作指引（最常见就是没配密钥）。
    const raw = String(e?.message || e).slice(0, 120);
    throw new Error(i18nT('语音合成失败（后端 {p0}）：该语音后端多半未配置 API Key。请到「设置 → 模型配置 → 语音合成」为 Azure / ElevenLabs / 讯飞 等填入密钥后重试（原始：{p1}）', { p0: backend, p1: raw }));
  }
  if (!buffer || !buffer.length) throw new Error(i18nT('语音合成未返回音频'));
  return buffer;
}

function ensure(deps: IpcDeps): { store: EduHubStore; proc: EduHubProc } {
  // 账号切换：进程内 activeAccountKey 先切（relaunch 是事后补的），旧单例的 root 已固化在
  // 构造期，不失效就会向局域网继续下发上一账号的教案/学生/成绩。停服务 + 丢单例，下次懒建重扫。
  if (!accountHooked) {
    accountHooked = true;
    onAccountKeyChange(() => {
      const p = proc; proc = null; store = null;
      if (p) void p.stop();
    });
  }
  if (!store) {
    store = new EduHubStore({
      logger: deps.logger,
      llm: (prompt, timeoutMs) => eduHubLlm(deps, prompt, timeoutMs),
      genImage: (prompt) => eduHubGenImage(deps, prompt),
      genAvatarVideo: (script, opts) => eduHubGenAvatar(deps, script, opts),
      genAudio: (text, lang) => eduHubGenAudio(deps, text, lang),
    });
    store.onEvent = (ev: EduHubEvent) => {
      try {
        deps.getMainWindow()?.webContents.send(IPC_CHANNELS.WORKBENCH_EDU_HUB_EVENT, ev);
      } catch { /* 窗口已销毁 */ }
    };
  }
  if (!proc) proc = new EduHubProc(store, deps.logger);
  return { store, proc };
}

export function registerEduHubHandlers(deps: IpcDeps): void {
  ipcMain.handle(IPC_CHANNELS.WORKBENCH_EDU_HUB_STATUS, async () => ensure(deps).proc.status());

  ipcMain.handle(IPC_CHANNELS.WORKBENCH_EDU_HUB_START, async () => {
    const { proc: p } = ensure(deps);
    const st = await p.start();
    deps.logger.audit?.('edu-hub', i18nT('校内学生服务启动'), { port: st.port });
    return st;
  });

  ipcMain.handle(IPC_CHANNELS.WORKBENCH_EDU_HUB_STOP, async () => {
    const { proc: p } = ensure(deps);
    await p.stop();
    deps.logger.audit?.('edu-hub', i18nT('校内学生服务停止'), {});
    return p.status();
  });

  ipcMain.handle(IPC_CHANNELS.WORKBENCH_EDU_HUB_ROTATE_CODE, async () => {
    const { store: s, proc: p } = ensure(deps);
    s.rotateClassCode();
    deps.logger.audit?.('edu-hub', i18nT('班级码已轮换'), {});
    return p.status();
  });

  ipcMain.handle(IPC_CHANNELS.WORKBENCH_EDU_HUB_CODE_HISTORY, async () => ensure(deps).store.classCodeHistory());

  ipcMain.handle(IPC_CHANNELS.WORKBENCH_EDU_HUB_RESTORE_CODE, async (_e, payload: { code: string }) => {
    const { store: s, proc: p } = ensure(deps);
    s.restoreClassCode(String(payload?.code || ''));
    deps.logger.audit?.('edu-hub', i18nT('恢复历史班级码'), {});
    return p.status();
  });

  // ── 删除（教师侧清理）：四条都带 audit —— 删数据必须留痕 ──
  ipcMain.handle(IPC_CHANNELS.WORKBENCH_EDU_HUB_DELETE_MATERIAL, async (_e, payload: { id: string }) => {
    const { store: s } = ensure(deps);
    const removed = s.deleteMaterial(String(payload?.id || ''));
    deps.logger.audit?.('edu-hub', i18nT('删除资料'), { id: payload?.id, lessons: removed.lessons });
    return { ok: true, ...removed };
  });

  ipcMain.handle(IPC_CHANNELS.WORKBENCH_EDU_HUB_DELETE_LESSON, async (_e, payload: { id: string }) => {
    const { store: s } = ensure(deps);
    s.deleteLesson(String(payload?.id || ''));
    deps.logger.audit?.('edu-hub', i18nT('删除教案'), { id: payload?.id });
    return { ok: true };
  });

  ipcMain.handle(IPC_CHANNELS.WORKBENCH_EDU_HUB_DELETE_STUDENT, async (_e, payload: { studentId: string }) => {
    const { store: s } = ensure(deps);
    s.deleteStudent(String(payload?.studentId || ''));
    deps.logger.audit?.('edu-hub', i18nT('删除学生账号'), { studentId: payload?.studentId });
    return { ok: true };
  });

  ipcMain.handle(IPC_CHANNELS.WORKBENCH_EDU_HUB_DELETE_QUESTION, async (_e, payload: { id: string }) => {
    const { store: s } = ensure(deps);
    s.deleteQuestion(String(payload?.id || ''));
    deps.logger.audit?.('edu-hub', i18nT('删除学生提问'), { id: payload?.id });
    return { ok: true };
  });

  // 导入（多选）：只经系统文件选择器拿路径 —— 路径必须由用户在原生对话框亲手选定，
  // 绝不接受渲染层直传任意磁盘路径（否则一次 XSS 就能把本机私密文件拷入并经内网下发）。
  ipcMain.handle(IPC_CHANNELS.WORKBENCH_EDU_HUB_IMPORT, async () => {
    rateLimit('EDU_HUB_IMPORT', 10);
    const { store: s } = ensure(deps);
    const win = deps.getMainWindow();
    const dialogOpts = {
      title: i18nT('导入课程资料'),
      properties: ['openFile', 'multiSelections'] as Array<'openFile' | 'multiSelections'>,
      filters: [{ name: i18nT('课程资料'), extensions: ['pdf', 'docx', 'pptx', 'txt', 'md'] }],
    };
    const picked = win ? await dialog.showOpenDialog(win, dialogOpts) : await dialog.showOpenDialog(dialogOpts);
    if (picked.canceled || !picked.filePaths.length) return { imported: [] };
    const imported = picked.filePaths.map((f) => s.importMaterial(f));
    deps.logger.audit?.('edu-hub', i18nT('导入课程资料'), { count: imported.length });
    return { imported };
  });

  // 进程中断留下的 failed（「解析被中断」）文件本身没问题，重跑即可 ——
  // 不该让用户回文件选择框重导一遍（客户截图里同一份 docx 因此出现了三条）。
  //
  // 这条注册曾**误写在 IMPORT 的 handler 函数体里**：于是首次导入之前它根本没注册
  // （渲染层调用报 no handler），第二次导入又会对同一通道重复 handle，
  // Electron 直接抛「Attempted to register a second handler」把导入整个打死。
  ipcMain.handle(IPC_CHANNELS.WORKBENCH_EDU_HUB_REPARSE, async (_e, payload: { id?: string }) => {
    rateLimit('EDU_HUB_REPARSE', 20);
    const id = String(payload?.id || '').trim();
    if (!id) throw new Error(i18nT('缺少资料 ID'));
    const { store: s } = ensure(deps);
    const material = await s.reparseMaterial(id);
    deps.logger.audit?.('edu-hub', i18nT('重新解析课程资料'), { id, status: material.status });
    return { material };
  });

  ipcMain.handle(IPC_CHANNELS.WORKBENCH_EDU_HUB_MATERIALS, async () => ensure(deps).store.listMaterials());

  // 生成教案：立即返回 lesson（generating），完成经 EVENT 推送
  ipcMain.handle(
    IPC_CHANNELS.WORKBENCH_EDU_HUB_GENERATE,
    async (_e, payload: { materialId: string; grade?: string; durationMinutes?: number; lang?: 'zh-CN' | 'en-US' | 'ar'; mode?: 'fast' | 'rich' }) => {
      rateLimit('EDU_HUB_GENERATE', 6);
      const { store: s } = ensure(deps);
      const grade = String(payload?.grade || '').trim() || i18nT('初中');
      const durationMinutes = Math.max(15, Math.min(180, Number(payload?.durationMinutes) || 45));
      const lang = payload?.lang === 'en-US' || payload?.lang === 'ar' ? payload.lang : 'zh-CN';
      const mode = payload?.mode === 'fast' ? 'fast' : 'rich';
      const lesson = s.generateLesson(String(payload?.materialId || ''), { grade, durationMinutes, lang, mode });
      deps.logger.audit?.('edu-hub', i18nT('触发教案生成'), { materialId: payload?.materialId, lessonId: lesson.id, lang, mode });
      return lesson;
    },
  );

  ipcMain.handle(
    IPC_CHANNELS.WORKBENCH_EDU_HUB_GEN_ILLUSTRATION,
    async (_e, payload: { id: string; index: number }) => {
      rateLimit('EDU_HUB_GEN_ILLUSTRATION', 20);
      const { store: s } = ensure(deps);
      const lesson = await s.generateIllustration(String(payload?.id || ''), Number(payload?.index) || 0);
      deps.logger.audit?.('edu-hub', i18nT('生成教学配图'), { lessonId: payload?.id, index: payload?.index });
      return lesson;
    },
  );

  ipcMain.handle(IPC_CHANNELS.WORKBENCH_EDU_HUB_LESSONS, async () => ensure(deps).store.listLessons());

  ipcMain.handle(
    IPC_CHANNELS.WORKBENCH_EDU_HUB_SAVE_LESSON,
    async (_e, payload: { id: string; plan?: EduHubLesson['plan']; studentDigest?: EduHubLesson['studentDigest']; quiz?: EduHubLesson['quiz'] }) => {
      const { store: s } = ensure(deps);
      const lesson = s.saveLesson(String(payload?.id || ''), payload || {});
      deps.logger.audit?.('edu-hub', i18nT('保存教案修改'), { lessonId: lesson.id });
      return lesson;
    },
  );

  // 教案语言切换：同参数生成另一语言版本并缓存；已有版本秒切。返回的 lesson 带 langStatus，完成经 EVENT 推送。
  ipcMain.handle(
    IPC_CHANNELS.WORKBENCH_EDU_HUB_SWITCH_LANG,
    async (_e, payload: { id: string; lang: 'zh-CN' | 'en-US' | 'ar' }) => {
      rateLimit('EDU_HUB_SWITCH_LANG', 12);
      const { store: s } = ensure(deps);
      const lang = payload?.lang === 'en-US' || payload?.lang === 'ar' ? payload.lang : 'zh-CN';
      const lesson = s.switchLessonLang(String(payload?.id || ''), lang);
      deps.logger.audit?.('edu-hub', i18nT('切换教案语言'), { lessonId: lesson.id, lang, cached: lesson.langStatus !== 'switching' });
      return lesson;
    },
  );

  ipcMain.handle(
    IPC_CHANNELS.WORKBENCH_EDU_HUB_PUBLISH,
    async (_e, payload: { id: string; on: boolean }) => {
      const { store: s } = ensure(deps);
      const lesson = s.publishLesson(String(payload?.id || ''), !!payload?.on);
      deps.logger.audit?.('edu-hub', payload?.on ? i18nT('发布教案到学生端') : i18nT('下线教案'), { lessonId: lesson.id });
      return lesson;
    },
  );

  ipcMain.handle(IPC_CHANNELS.WORKBENCH_EDU_HUB_PROGRESS, async () => ensure(deps).store.progressRows());

  // 点开某学生账号 → 其历史学习记录时间线（阅读/测试/练习/笔记/提问，按时间倒序）
  ipcMain.handle(
    IPC_CHANNELS.WORKBENCH_EDU_HUB_STUDENT_HISTORY,
    async (_e, payload: { studentId: string }) =>
      ensure(deps).store.memoryTimeline(String(payload?.studentId || '')),
  );

  // 数字人讲解：按节离线成片（慢，进度经 EVENT 推送；未配置数字人 store 抛可读错误）
  ipcMain.handle(
    IPC_CHANNELS.WORKBENCH_EDU_HUB_GEN_AVATAR,
    async (_e, payload: { id: string }) => {
      rateLimit('EDU_HUB_GEN_AVATAR', 4);
      const { store: s } = ensure(deps);
      const r = await s.generateAvatarVideos(String(payload?.id || ''));
      deps.logger.audit?.('edu-hub', i18nT('生成数字人讲解'), { lessonId: payload?.id, ok: r.ok, total: r.total });
      return r;
    },
  );

  // 教师审核预览：把本课已 ready 的数字人成片读回工作台（data URL，按节），让教案里能直接看到生成的数字人。
  ipcMain.handle(
    IPC_CHANNELS.WORKBENCH_EDU_HUB_AVATAR_MEDIA,
    async (_e, payload: { id: string }) => {
      const { store: s } = ensure(deps);
      return { items: s.reviewAvatarMedia(String(payload?.id || '')) };
    },
  );

  // 音频总结：一段口播稿离线合成 mp3（TTS 未就绪时 store 抛可读错误）
  ipcMain.handle(
    IPC_CHANNELS.WORKBENCH_EDU_HUB_GEN_AUDIO,
    async (_e, payload: { id: string }) => {
      rateLimit('EDU_HUB_GEN_AUDIO', 6);
      const { store: s } = ensure(deps);
      const r = await s.generateAudio(String(payload?.id || ''));
      deps.logger.audit?.('edu-hub', i18nT('生成音频总结'), { lessonId: payload?.id, bytes: r.bytes });
      return r;
    },
  );

  // 学生受限提问记录（教师控制台）
  ipcMain.handle(IPC_CHANNELS.WORKBENCH_EDU_HUB_QUESTIONS, async () => ensure(deps).store.recentQuestions());
}
