/**
 * 会议智能管理 · 配置引导里的「电脑配置检测 + 推荐哪个本机转写模型」。
 *
 * 2026-11-17 起会议转写默认用 sherpa-onnx 的两个模型（选型实测见 streamingAsrModel.ts 的 MEETING_ASR_MODELS）：
 *   - FireRedASR2（最准，含方言；约 1.2 GB，处理时约 4 GB 内存）+ SenseVoice 兜底嘈杂片段 —— 内存 ≥ 16GB、≥ 8 核推荐；
 *   - SenseVoice（快、小，228 MB）—— 配置不够时推荐，也比原来的 Whisper large-v3 准一倍。
 * 耗时以实测为基准（M5 Pro 18 核 / 24GB），按这台电脑用得上的核数等比例换算，只是粗估。
 */
import { createHash } from 'node:crypto';
import { createReadStream, createWriteStream, existsSync, mkdirSync, renameSync, statSync, statfsSync, unlinkSync, writeFileSync } from 'node:fs';
import { cpus, totalmem } from 'node:os';
import { dirname, join } from 'node:path';
import { t as i18nT } from '@totalclaw/i18n';
import { autoParallelism } from './pipeline/runtime';

export interface HardwareInfo {
  cpu: string;
  cores: number;
  memGb: number;
  arch: string;
  platform: string;
  appleSilicon: boolean;
  /** 模型目录所在磁盘的剩余空间；读不到为 null */
  freeDiskGb: number | null;
}

export interface AsrRecommendation {
  engine: 'firered' | 'sensevoice';
  /** 要下载的组件 id（electronAPI.pyExt.install），按顺序装；FireRedASR2 方案 = SenseVoice（兜底）+ FireRedASR2 */
  installIds: string[];
  sizeMb: number;
  /** 处理 1 小时录音大约几分钟（粗估） */
  estMinPerHour: number;
  workers: number;
  /** 为什么不推荐 FireRedASR2（推荐它时为空） */
  downgradeReason?: 'memory' | 'cores' | 'disk';
  /** 电脑配置评级 */
  tier: 'good' | 'ok' | 'weak';
}

/** 配置引导推荐下载的声纹模型：CAM++（ERes2NetV2 实测没有更好，见 speakerModel.ts） */
export const SPEAKER_INSTALL_ID = 'speaker-campplus';
export const MEETING_ASR_IDS = { firered: 'asr-meeting-firered2', sensevoice: 'asr-meeting-sensevoice' } as const;
export const ASR_SIZES_MB = { firered: 1178, sensevoice: 228 } as const;

/** 实测基准：每小时录音的分钟数（转写 + 提声纹）、当时并行用上的核数 */
const BASE = { firered: { minPerHour: 12, coresUsed: 8 }, sensevoice: { minPerHour: 1.5, coresUsed: 12 } } as const;

export function detectHardware(modelsDir?: string): HardwareInfo {
  const list = cpus();
  const cpu = (list[0]?.model || '').replace(/\s+/g, ' ').trim();
  let freeDiskGb: number | null = null;
  if (modelsDir) {
    try { const st = statfsSync(modelsDir); freeDiskGb = Math.round((st.bavail * st.bsize) / 1024 ** 3 * 10) / 10; } catch { freeDiskGb = null; }
  }
  return {
    cpu, cores: list.length, memGb: Math.round(totalmem() / 1024 ** 3 * 10) / 10,
    arch: process.arch, platform: process.platform,
    appleSilicon: process.platform === 'darwin' && process.arch === 'arm64',
    freeDiskGb,
  };
}

export function estimateMinPerHour(engine: 'firered' | 'sensevoice', hw: Pick<HardwareInfo, 'cores' | 'memGb' | 'appleSilicon'>): { minutes: number; workers: number } {
  const arg = engine === 'firered' ? 'sherpa:{"kind":"fire_red_aed"}' : 'sherpa:{"kind":"sense_voice"}';
  const p = autoParallelism(arg, undefined, { cores: hw.cores, memGb: hw.memGb });
  const used = Math.max(1, Math.min(hw.cores, p.workers * p.threads));
  // 非 Apple 芯片的单核一般慢一些（同样核数按 1.5 倍算），粗估
  const factor = (BASE[engine].coresUsed / used) * (hw.appleSilicon ? 1 : 1.5);
  return { minutes: Math.max(1, Math.round(BASE[engine].minPerHour * factor)), workers: p.workers };
}

export function recommendAsr(hw: HardwareInfo): AsrRecommendation {
  let downgradeReason: AsrRecommendation['downgradeReason'];
  if (hw.memGb < 16) downgradeReason = 'memory';
  else if (hw.cores < 8) downgradeReason = 'cores';
  // 两个模型约 1.4GB，留 1.5GB 余量
  else if (hw.freeDiskGb !== null && hw.freeDiskGb < 3) downgradeReason = 'disk';
  const engine = downgradeReason ? 'sensevoice' : 'firered';
  const est = estimateMinPerHour(engine, hw);
  const tier = downgradeReason ? (hw.memGb < 8 || hw.cores < 4 ? 'weak' : 'ok') : 'good';
  return {
    engine,
    installIds: engine === 'firered' ? [MEETING_ASR_IDS.sensevoice, MEETING_ASR_IDS.firered] : [MEETING_ASR_IDS.sensevoice],
    sizeMb: engine === 'firered' ? ASR_SIZES_MB.firered + ASR_SIZES_MB.sensevoice : ASR_SIZES_MB.sensevoice,
    estMinPerHour: est.minutes, workers: est.workers, tier, ...(downgradeReason ? { downgradeReason } : {}),
  };
}

// ─── 会议语音模型 CDN 直下（断点续传 + SHA-256 校验，不依赖外网 HF / GitHub 代理）─────────

export const MEETING_MODELS_CDN_BASE = 'https://cdn2.taituai.com/meeting-models';
export const ALLOWED_MEETING_MODEL_IDS = new Set<string>([MEETING_ASR_IDS.sensevoice, MEETING_ASR_IDS.firered, SPEAKER_INSTALL_ID]);

export interface CdnModelFileSpec {
  file: string;
  sha256: string;
  bytes: number;
}

export interface MeetingModelDownloadProgress {
  id: string;
  percent: number;
  bytes: number;
  totalBytes: number;
  line: string;
}

export interface CdnDownloadOptions {
  baseUrl?: string;
  signal?: AbortSignal;
  onProgress?: (p: MeetingModelDownloadProgress) => void;
  fetchImpl?: typeof fetch;
  /** 测试注入：覆盖目标目录和文件清单 */
  targetOverride?: { destDir: string; label: string; files: CdnModelFileSpec[]; refsMain?: { file: string; rev: string } };
  chunkTimeoutMs?: number;
  maxRetries?: number;
  /** 重新下载：不跳过已存在的目标文件，清掉旧 .part 从头下并校验 SHA-256 */
  force?: boolean;
}

function modelLabel(id: string): string {
  if (id === MEETING_ASR_IDS.firered) return 'FireRedASR2';
  if (id === MEETING_ASR_IDS.sensevoice) return 'SenseVoice';
  if (id === SPEAKER_INSTALL_ID) return i18nT('声纹模型 CAM++');
  return id;
}

async function resolveCdnTarget(id: string): Promise<{ destDir: string; label: string; files: CdnModelFileSpec[]; refsMain?: { file: string; rev: string } } | null> {
  if (id === MEETING_ASR_IDS.sensevoice || id === MEETING_ASR_IDS.firered) {
    const sam = await import('../streamingAsrModel');
    const spec = sam.streamingAsrSpec(id);
    if (!spec) return null;
    return { destDir: sam.streamingArchiveDir(spec), label: modelLabel(id), files: spec.files };
  }
  if (id === SPEAKER_INSTALL_ID) {
    const [{ SPEAKER_MODEL }, { whisperModelsDir }] = await Promise.all([import('../speakerModel'), import('../whisperModels')]);
    const repoRoot = join(whisperModelsDir(), `models--${SPEAKER_MODEL.repoId.replace('/', '--')}`);
    return {
      destDir: join(repoRoot, 'snapshots', SPEAKER_MODEL.revision),
      label: modelLabel(id),
      files: [{ file: SPEAKER_MODEL.file, sha256: SPEAKER_MODEL.sha256, bytes: SPEAKER_MODEL.bytes }],
      refsMain: { file: join(repoRoot, 'refs', 'main'), rev: SPEAKER_MODEL.revision },
    };
  }
  return null;
}

function sha256File(filePath: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const h = createHash('sha256');
    const s = createReadStream(filePath, { highWaterMark: 1024 * 1024 });
    s.on('data', (chunk) => h.update(chunk));
    s.on('error', reject);
    s.on('end', () => resolve(h.digest('hex')));
  });
}

function safeReplaceFile(from: string, to: string): void {
  try {
    renameSync(from, to);
  } catch {
    try { if (existsSync(to)) unlinkSync(to); } catch { /* ignore */ }
    renameSync(from, to);
  }
}

async function downloadOneFile(
  url: string,
  dest: string,
  spec: CdnModelFileSpec,
  opts: {
    fetchImpl: typeof fetch;
    signal?: AbortSignal;
    chunkTimeoutMs: number;
    maxRetries: number;
    onBytes: (fileBytes: number) => void;
  },
): Promise<void> {
  const part = `${dest}.part`;
  mkdirSync(dirname(dest), { recursive: true });
  let lastErr = '';
  for (let attempt = 1; attempt <= opts.maxRetries; attempt++) {
    if (opts.signal?.aborted) throw new Error(i18nT('下载已取消'));
    let offset = 0;
    try {
      if (existsSync(part)) {
        const sz = statSync(part).size;
        if (sz > spec.bytes) unlinkSync(part);
        else offset = sz;
      }
    } catch { offset = 0; }

    // 已完整下完的 .part 直接走校验
    if (offset < spec.bytes) {
      const ctrl = new AbortController();
      const onOuterAbort = () => ctrl.abort();
      opts.signal?.addEventListener('abort', onOuterAbort, { once: true });
      let timer: ReturnType<typeof setTimeout> | null = null;
      const bump = () => {
        if (timer) clearTimeout(timer);
        timer = setTimeout(() => ctrl.abort(), opts.chunkTimeoutMs);
      };
      let ws: ReturnType<typeof createWriteStream> | null = null;
      try {
        bump();
        const headers: Record<string, string> = offset > 0 ? { Range: `bytes=${offset}-` } : {};
        const resp = await opts.fetchImpl(url, { headers, signal: ctrl.signal });
        if (resp.status === 416) {
          try { unlinkSync(part); } catch { /* ignore */ }
          continue;
        }
        if (!resp.ok && resp.status !== 206) throw new Error(`HTTP ${resp.status}`);
        const append = resp.status === 206 && offset > 0;
        let cur = append ? offset : 0;
        ws = createWriteStream(part, { flags: append ? 'a' : 'w' });
        const body = resp.body;
        if (!body) throw new Error('empty response body');
        const reader = body.getReader();
        opts.onBytes(cur);
        while (true) {
          bump();
          const { done, value } = await reader.read();
          if (done) break;
          if (!value?.byteLength) continue;
          cur += value.byteLength;
          if (!ws.write(Buffer.from(value.buffer, value.byteOffset, value.byteLength))) {
            await new Promise<void>((res, rej) => { ws!.once('drain', res); ws!.once('error', rej); });
          }
          opts.onBytes(cur);
        }
        await new Promise<void>((res, rej) => { ws!.end(() => res()); ws!.once('error', rej); });
        ws = null;
      } catch (e: any) {
        try { ws?.destroy(); } catch { /* ignore */ }
        if (opts.signal?.aborted) throw new Error(i18nT('下载已取消'));
        lastErr = ctrl.signal.aborted ? i18nT('下载连接超时') : String(e?.message || e);
        if (attempt < opts.maxRetries) continue;
        throw new Error(lastErr);
      } finally {
        if (timer) clearTimeout(timer);
        opts.signal?.removeEventListener('abort', onOuterAbort);
      }
    }

    const actualSize = existsSync(part) ? statSync(part).size : 0;
    if (actualSize !== spec.bytes) {
      lastErr = i18nT('文件下载不完整（{p0}/{p1}）', { p0: String(actualSize), p1: String(spec.bytes) });
      if (actualSize > spec.bytes) try { unlinkSync(part); } catch { /* ignore */ }
      if (attempt < opts.maxRetries) continue;
      throw new Error(lastErr);
    }
    const digest = await sha256File(part);
    if (spec.sha256 && digest.toLowerCase() !== spec.sha256.toLowerCase()) {
      try { unlinkSync(part); } catch { /* ignore */ }
      lastErr = i18nT('文件校验不通过：{p0}', { p0: spec.file });
      if (attempt < opts.maxRetries) continue;
      throw new Error(lastErr);
    }
    safeReplaceFile(part, dest);
    opts.onBytes(spec.bytes);
    return;
  }
  throw new Error(lastErr || i18nT('下载失败'));
}

/** 从公司 CDN 直下会议语音模型（支持 Range 断点续传 + SHA-256 校验），直接落到宿主识别的标准目录。 */
export async function downloadMeetingModelFromCdn(
  id: string,
  opts: CdnDownloadOptions = {},
): Promise<{ ok: true; destDir: string } | { ok: false; error: string }> {
  const target = opts.targetOverride ?? (await resolveCdnTarget(id));
  if (!target) return { ok: false, error: i18nT('不支持的模型：{p0}', { p0: id }) };
  const base = (opts.baseUrl || process.env.TOTALCLAW_MEETING_MODELS_CDN || MEETING_MODELS_CDN_BASE).replace(/\/+$/, '');
  const fetchImpl = opts.fetchImpl ?? globalThis.fetch;
  const totalBytes = target.files.reduce((s, f) => s + f.bytes, 0) || 1;
  const chunkTimeoutMs = opts.chunkTimeoutMs ?? 30_000;
  const maxRetries = opts.maxRetries ?? 3;
  let completed = 0;
  let lastEmit = 0;

  const report = (curFileBytes: number, force = false) => {
    const now = Date.now();
    if (!force && now - lastEmit < 350) return;
    lastEmit = now;
    const got = Math.min(totalBytes, completed + curFileBytes);
    const percent = Math.min(99, Math.floor((got / totalBytes) * 100));
    opts.onProgress?.({
      id,
      percent,
      bytes: got,
      totalBytes,
      line: i18nT('正在下载 {p0}：{p1} MB / {p2} MB（{p3}%）', {
        p0: target.label,
        p1: Math.floor(got / 1048576),
        p2: Math.max(1, Math.ceil(totalBytes / 1048576)),
        p3: percent,
      }),
    });
  };

  try {
    mkdirSync(target.destDir, { recursive: true });
    report(0, true);
    for (const f of target.files) {
      const dest = join(target.destDir, f.file);
      if (opts.force) {
        try { if (existsSync(`${dest}.part`)) unlinkSync(`${dest}.part`); } catch { /* ignore */ }
      } else if (existsSync(dest)) {
        try {
          if (statSync(dest).size === f.bytes) {
            completed += f.bytes;
            report(0, true);
            continue;
          }
        } catch { /* re-download */ }
      }
      await downloadOneFile(`${base}/${id}/${f.file}`, dest, f, {
        fetchImpl,
        signal: opts.signal,
        chunkTimeoutMs,
        maxRetries,
        onBytes: (n) => report(n),
      });
      completed += f.bytes;
      report(0, true);
    }
    if (target.refsMain && (opts.force || !existsSync(target.refsMain.file))) {
      try {
        mkdirSync(dirname(target.refsMain.file), { recursive: true });
        writeFileSync(target.refsMain.file, target.refsMain.rev, 'utf8');
      } catch { /* 非必须 */ }
    }
    return { ok: true, destDir: target.destDir };
  } catch (e: any) {
    return { ok: false, error: String(e?.message || e) };
  }
}
