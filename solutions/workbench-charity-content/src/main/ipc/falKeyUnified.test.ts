/**
 * fal 取 key 全应用统一（「要在别人电脑上也能用」）：
 *   - 优先级：本地用户填的 > 服务端按方案下发 > 服务端全局
 *   - 本地为空、只有服务端按方案下发的 key 时：慈善（生成 / 看图 / 语音）、古兰经（背景 / 语音）、TTS 路由都拿得到
 *   - 方案未开通（服务端没下发该方案项、也没有全局项）→ 拿不到，调用方走回退
 *   - /me 刷新后即时生效：不重建任何对象，下一次调用就用上新 key
 * 真实走 falServerConfig / falProvider / mediaFal.ipc / ttsRouter / 慈善 runtime / 古兰经 IPC；
 * 只把 electron、加密库、网络调用换成假实现。
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const H = vi.hoisted(() => ({
  handlers: new Map<string, (...args: any[]) => any>(),
  media: new Map<string, string>(),
  app: new Map<string, string>(),
  root: '',
  falReqs: [] as any[],
  quranDeps: null as any,
}));

vi.mock('electron', () => ({
  ipcMain: { handle: (ch: string, fn: (...a: any[]) => any) => { H.handlers.set(ch, fn); } },
  BrowserWindow: { getAllWindows: () => [] },
  app: { isPackaged: false, getPath: () => H.root },
  dialog: {},
}));
vi.mock('../services/mediaSecrets', () => ({
  getMediaSecret: (n: string) => H.media.get(n),
  getAppSecret: (n: string) => H.app.get(n),
  setAppSecret: (n: string, v: string) => { if (v) H.app.set(n, v); else H.app.delete(n); return true; },
}));
vi.mock('../services/mediaModelConfig', () => ({ readAgentEnv: () => ({}) }));
vi.mock('../services/accountScope', () => ({ privateRoot: () => H.root, onAccountKeyChange: () => {} }));
vi.mock('../services/qiyeApiBridge', () => ({ qiyeApiBridge: {}, getConfiguredDefaultProvider: () => 'deepseek' }));
vi.mock('../services/councilChatRouter', () => ({ runOneshotChat: vi.fn(async () => '') }));
vi.mock('../services/qiyeApiClient', () => ({ QiyeApiClient: class {} }));
vi.mock('../services/charityContent/render', () => ({ imageToDataUrl: () => '' }));
vi.mock('../services/ffmpegPath', () => ({ resolveFfmpegPair: () => ({ ffmpeg: null, ffprobe: null }) }));
vi.mock('../services/mediaProtocol', () => ({ buildLocalMediaUrl: (p: string) => `local://${p}` }));
vi.mock('../services/localTts', () => ({ synthesizeLocalSpeech: vi.fn(async () => ({ ok: false })) }));
vi.mock('../services/quranTeaching/offscreenRender', () => ({ renderHtmlToPng: vi.fn() }));
// quranTeaching.ipc 的 store 是模块级单例（只在切账号时重建）：deps 挂实例上，跨用例复用同一个
vi.mock('../services/quranTeaching/store', () => ({
  QuranTeachingStore: class {
    d: any;
    constructor(d: any) { this.d = d; H.quranDeps = d; }
    status() { return { falReady: !!this.d.falReady() }; }
  },
}));
vi.mock('./shared', () => ({ rateLimit: () => {} }));
// 真实生成不发网络：只记下请求（重点看 solutionId），其余 mediaFal.ipc 导出照旧是真的
vi.mock('./mediaFal.ipc', async (orig) => {
  const real = await orig<typeof import('./mediaFal.ipc')>();
  return {
    ...real,
    runFalJob: vi.fn(async (_deps: any, req: any) => {
      H.falReqs.push(req);
      const f = join(H.root, `fal-${H.falReqs.length}.bin`);
      writeFileSync(f, 'x');
      return { jobId: 'j', model: req.model || 'm', elapsedMs: 1, urls: [], files: [f], text: 'seen' };
    }),
  };
});

import { IPC_CHANNELS } from '@totalclaw/ipc-contracts';
import { __resetFalServerCache, applyServerProviderConfigs } from '../services/media/falServerConfig';
import { resolveFalKeySlots } from '../services/media/falProvider';
import { configureTtsRouter, getTtsRouter } from '../services/media/ttsRouter';
import { createCharityRuntime, CHARITY_SOLUTION_ID } from '../services/charityContent/runtime';
import { falKeysReady, registerMediaFalHandlers, resolveFalSlotsFor } from './mediaFal.ipc';
import { QURAN_SOLUTION_ID, registerQuranTeachingHandlers } from './quranTeaching.ipc';

const deps = () => ({
  appConfig: {}, authState: { authenticated: true },
  logger: { info: vi.fn(), warn: vi.fn(), audit: vi.fn() },
  getMainWindow: () => null, engineRegistry: { getActive: () => null },
} as any);
const cfg = (keys: { primary?: string; backup?: string }, solutionId?: string) => ({
  provider: 'fal', solutionId, keys: { primary: keys.primary || '', backup: keys.backup || '' }, defaults: {}, quota: { dailyLimit: null },
});
const call = (ch: string, payload?: any) => H.handlers.get(ch)!({}, payload);
const falSynth = vi.fn(async (a: { keys: string[] }) => ({ audioBase64: Buffer.from(a.keys.join('|')).toString('base64'), mimeType: 'audio/mpeg', ms: 1 }));

beforeEach(() => {
  H.root = mkdtempSync(join(tmpdir(), 'fal-unified-'));
  H.media.clear(); H.app.clear(); H.handlers.clear(); H.falReqs = [];
  __resetFalServerCache();
  falSynth.mockClear();
  registerMediaFalHandlers(deps());
  // 注册时 configureTtsRouter 已按真实路径配过一次；换成假合成器，别的依赖照旧
  configureTtsRouter({ agentHome: () => undefined, falSynthesize: falSynth as any });
});
afterEach(() => rmSync(H.root, { recursive: true, force: true }));

describe('取 key 优先级：本地 > 服务端方案 > 服务端全局', () => {
  it('三层都有时用本地；本地清掉用本方案项；别的方案回落全局', () => {
    applyServerProviderConfigs([cfg({ primary: 'GLOBAL' }), cfg({ primary: 'CHARITY', backup: 'CHARITY-B' }, CHARITY_SOLUTION_ID)]);
    H.media.set('FAL_KEY', 'LOCAL');
    expect(resolveFalSlotsFor(deps(), CHARITY_SOLUTION_ID)).toMatchObject({ primary: 'LOCAL', source: 'local' });

    H.media.delete('FAL_KEY');
    const s = resolveFalSlotsFor(deps(), CHARITY_SOLUTION_ID);
    expect(s).toMatchObject({ primary: 'CHARITY', backup: 'CHARITY-B', source: 'server' });
    expect(s.server?.solutionId).toBe(CHARITY_SOLUTION_ID);

    const q = resolveFalSlotsFor(deps(), QURAN_SOLUTION_ID);
    expect(q).toMatchObject({ primary: 'GLOBAL', source: 'server' });
    expect(q.server?.solutionId).toBeUndefined();
  });

  it('本地只填了备用 key 也算本地，不与服务端 key 混用', () => {
    applyServerProviderConfigs([cfg({ primary: 'GLOBAL' })]);
    H.media.set('FAL_KEY_BACKUP', 'LOCAL-B');
    expect(resolveFalKeySlots(undefined, undefined, CHARITY_SOLUTION_ID)).toMatchObject({ primary: '', backup: 'LOCAL-B', source: 'local' });
  });
});

describe('本地为空、只有服务端按方案下发的 key', () => {
  beforeEach(() => {
    applyServerProviderConfigs([cfg({ primary: 'CH-KEY' }, CHARITY_SOLUTION_ID), cfg({ primary: 'QR-KEY' }, QURAN_SOLUTION_ID)]);
  });

  it('慈善：AI 生成 / 看图 / 上传能力可用，请求带本方案 id', async () => {
    const rt = createCharityRuntime(deps(), () => undefined);
    const fal = rt.falFacade();
    expect(fal.run).toBeTypeOf('function');
    expect(fal.upload).toBeTypeOf('function');
    await fal.run!({ capability: 'i2v', imageUrl: '/x.jpg' } as any);
    expect(H.falReqs.at(-1)).toMatchObject({ capability: 'i2v', solutionId: CHARITY_SOLUTION_ID });
  });

  it('慈善：语音按本方案取 key（不绑方案的全局路由拿不到、会走备用嗓音）', async () => {
    const fal = createCharityRuntime(deps(), () => undefined).falFacade();
    const r = await fal.tts!.synthesize({ text: '欢迎参加公益活动' });
    expect(r).toMatchObject({ ok: true, provider: 'fal', degraded: false });
    expect(falSynth.mock.calls[0][0].keys).toEqual(['CH-KEY']);
    expect(fal.tts!.falAvailable()).toEqual({ ok: true });

    const unbound = await getTtsRouter().synthesize({ text: '欢迎参加公益活动' });
    expect(unbound).toMatchObject({ provider: 'none', degraded: true, degradedReason: 'no_key' });
  });

  it('古兰经：状态显示可用；背景图与语音都带本方案 id 调 fal', async () => {
    registerQuranTeachingHandlers(deps());
    expect(await call(IPC_CHANNELS.WORKBENCH_QURAN_STATUS)).toEqual({ falReady: true });
    expect(await H.quranDeps.falBackground('calm pattern')).toMatch(/^data:image\/jpeg;base64,/);
    const voice = await H.quranDeps.tts('بسم الله', 'ar', join(H.root, 'v'));
    expect(voice).toMatchObject({ engine: 'fal' });
    expect(H.falReqs.map((r) => [r.capability, r.solutionId])).toEqual([['t2i', QURAN_SOLUTION_ID], ['tts', QURAN_SOLUTION_ID]]);
  });

  it('设置 / 工作台状态：带 solutionId 报「服务端下发 · 本方案」，不带报未配置', async () => {
    const withSid = await call(IPC_CHANNELS.MEDIA_FAL_CAPABILITIES, { solutionId: CHARITY_SOLUTION_ID });
    expect(withSid.keys).toEqual({ primary: true, backup: false, source: 'server' });
    expect(withSid.serverSolutionId).toBe(CHARITY_SOLUTION_ID);
    expect(JSON.stringify(withSid)).not.toContain('CH-KEY');
    const plain = await call(IPC_CHANNELS.MEDIA_FAL_CAPABILITIES);
    expect(plain.keys.source).toBe('none');
  });
});

describe('方案未开通：服务端不下发该方案项', () => {
  it('只开通了慈善 → 古兰经拿不到 key，语音与背景走本地兜底', async () => {
    applyServerProviderConfigs([cfg({ primary: 'CH-KEY' }, CHARITY_SOLUTION_ID)]);
    expect(falKeysReady(deps(), CHARITY_SOLUTION_ID)).toBe(true);
    expect(falKeysReady(deps(), QURAN_SOLUTION_ID)).toBe(false);
    registerQuranTeachingHandlers(deps());
    expect(await call(IPC_CHANNELS.WORKBENCH_QURAN_STATUS)).toEqual({ falReady: false });
    // 没 key：不调 fal，本地引擎也不可用时返回 null（界面标「未合成」而不是报错）
    expect(await H.quranDeps.tts('hello', 'en', join(H.root, 'v'))).toBeNull();
    expect(H.falReqs).toEqual([]);
  });

  it('什么都没有：慈善的 fal 能力全是 null（剪辑版 / 备用嗓音 / 视觉模型兜底），TTS 报 no_key', async () => {
    const fal = createCharityRuntime(deps(), () => undefined).falFacade();
    expect(fal).toEqual({ run: null, tts: null, upload: null });
    expect(getTtsRouter().falAvailable(CHARITY_SOLUTION_ID)).toEqual({ ok: false, reason: 'no_key' });
  });
});

describe('/me 刷新后即时生效', () => {
  it('同一个古兰经会话：下发前不可用，下发后下一次就可用；撤销后又不可用', async () => {
    registerQuranTeachingHandlers(deps());
    expect(await call(IPC_CHANNELS.WORKBENCH_QURAN_STATUS)).toEqual({ falReady: false });
    applyServerProviderConfigs([cfg({ primary: 'QR-KEY' }, QURAN_SOLUTION_ID)]);
    expect(await call(IPC_CHANNELS.WORKBENCH_QURAN_STATUS)).toEqual({ falReady: true });
    applyServerProviderConfigs([]);
    expect(await call(IPC_CHANNELS.WORKBENCH_QURAN_STATUS)).toEqual({ falReady: false });
  });
});
