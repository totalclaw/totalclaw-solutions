/**
 * 流水线对外的类型（docs/meeting-mgmt-workbench.md 3.1 节 B → A 的接口），index.ts 原样再导出。
 */
import type {
  MmDecision, MmMeetingFile, MmPerson, MmProcessStage, MmSegment, MmSpeakerSlot, MmTopic, MmVoiceprint,
} from '../../../../shared/meetingMgmt/types';

/** null = 模型不可用，走兜底 */
export type MmLlm = (prompt: string, opts?: { json?: boolean; timeoutMs?: number }) => Promise<string | null>;

export interface PipelineInput {
  meetingId: string;
  /** files/<meetingId>/ 绝对路径（中间产物、发言片段都写这里） */
  workDir: string;
  files: MmMeetingFile[];
  /** 只和这些人比对声纹 / 昵称 */
  attendees: MmPerson[];
  /** 已按参会人过滤 */
  voiceprints: MmVoiceprint[];
  /** 声纹相似度下限 */
  threshold: number;
  asr: 'local' | 'agent' | 'cloud';
  /** asr = 'cloud' 时的在线语音识别接口（Key 已解密，只在主进程里） */
  cloudAsr?: import('../cloudAsr').CloudAsrConfig;
  /** 本机转写用哪个模型（auto = 装了 FireRedASR2 且内存够用它，否则 SenseVoice，都不认的语种用 Whisper） */
  asrModel?: 'auto' | 'firered' | 'sensevoice' | 'whisper';
  organizePrompt?: string;
  llm: MmLlm;
  signal?: AbortSignal;
  onStage: (stage: MmProcessStage, progress: number, text?: string) => void;
}

export interface PipelineResult {
  segments: MmSegment[];
  speakers: MmSpeakerSlot[];
  topics: MmTopic[];
  decisions: MmDecision[];
  summaryLines: string[];
  durationSec?: number;
}
