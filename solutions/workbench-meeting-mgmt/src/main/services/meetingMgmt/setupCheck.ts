/**
 * 会议智能管理 · 配置引导里的「电脑配置检测 + 推荐哪个本机转写模型」。
 *
 * 2026-11-17 起会议转写默认用 sherpa-onnx 的两个模型（选型实测见 streamingAsrModel.ts 的 MEETING_ASR_MODELS）：
 *   - FireRedASR2（最准，含方言；约 1.2 GB，处理时约 4 GB 内存）+ SenseVoice 兜底嘈杂片段 —— 内存 ≥ 16GB、≥ 8 核推荐；
 *   - SenseVoice（快、小，228 MB）—— 配置不够时推荐，也比原来的 Whisper large-v3 准一倍。
 * 耗时以实测为基准（M5 Pro 18 核 / 24GB），按这台电脑用得上的核数等比例换算，只是粗估。
 */
import { cpus, totalmem } from 'node:os';
import { statfsSync } from 'node:fs';
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
