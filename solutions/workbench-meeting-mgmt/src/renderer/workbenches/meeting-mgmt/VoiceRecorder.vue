<template>
  <div class="mm-rec" data-test="mm-rec">
    <p class="mm-rec__tip">{{ $t('请在安静的地方，用平时开会说话的音量和语速，朗读下面这段话：') }}</p>
    <blockquote class="mm-rec__script" data-test="mm-rec-script">{{ script }}</blockquote>
    <div class="mm-rec__bar">
      <button v-if="state !== 'recording'" type="button" class="ss-btn" :class="state === 'idle' ? 'primary' : ''" :disabled="disabled" data-test="mm-rec-start" @click="start">
        <i class="ri-mic-line"></i>{{ state === 'idle' ? $t('开始录音') : $t('重录') }}
      </button>
      <button v-else type="button" class="ss-btn danger" data-test="mm-rec-stop" @click="stop"><i class="ri-stop-circle-line"></i>{{ $t('停止录音') }}</button>
      <span class="mm-rec__time" :class="{ live: state === 'recording', short: seconds > 0 && seconds < MIN_SEC && state !== 'recording' }">
        <i v-if="state === 'recording'" class="mm-rec__dot"></i>{{ $t('{s} 秒', { s: seconds }) }}
      </span>
      <i class="mm-rec__meter"><b :style="{ width: `${level}%` }"></b></i>
    </div>
    <p v-if="state === 'done' && seconds < MIN_SEC" class="ss-note warn"><i class="ri-alert-line"></i>{{ $t('录音不足 10 秒，建议重录') }}</p>
    <audio v-if="previewUrl" :src="previewUrl" controls class="mm-rec__audio" data-test="mm-rec-preview"></audio>
    <p v-if="error" class="ss-note danger" data-test="mm-rec-error"><i class="ri-error-warning-line"></i>{{ error }}</p>
  </div>
</template>

<script setup lang="ts">
/**
 * 电脑上现场录一段 10~15 秒的声音（声纹采集用）：显示朗读稿、计时（15 秒自动停）、音量条、试听、重录。
 * 录完 emit('recorded', { data: base64, ext, seconds })，由调用方连同授权一起交给 voiceprint.enrollData。
 */
import { onBeforeUnmount, ref } from 'vue';
import { t as i18nT } from '../../i18n';

defineProps<{ script: string; disabled?: boolean }>();
const emit = defineEmits<{ (e: 'recorded', v: { data: string; ext: string; seconds: number }): void; (e: 'reset'): void }>();

const MIN_SEC = 10;
const MAX_SEC = 15;
const state = ref<'idle' | 'recording' | 'done'>('idle');
const seconds = ref(0);
const level = ref(0);
const error = ref('');
const previewUrl = ref('');

let stream: MediaStream | null = null;
let recorder: MediaRecorder | null = null;
let chunks: Blob[] = [];
let timer: ReturnType<typeof setInterval> | null = null;
let raf = 0;
let audioCtx: AudioContext | null = null;
let startedAt = 0;

function cleanup(): void {
  if (timer) { clearInterval(timer); timer = null; }
  if (raf) { cancelAnimationFrame(raf); raf = 0; }
  try { stream?.getTracks().forEach((t) => t.stop()); } catch { /* */ }
  stream = null;
  try { void audioCtx?.close(); } catch { /* */ }
  audioCtx = null;
  level.value = 0;
}

function pickMime(): string {
  for (const m of ['audio/webm;codecs=opus', 'audio/webm', 'audio/ogg;codecs=opus', 'audio/mp4']) {
    try { if (typeof MediaRecorder !== 'undefined' && MediaRecorder.isTypeSupported(m)) return m; } catch { /* */ }
  }
  return '';
}

async function start(): Promise<void> {
  error.value = '';
  if (previewUrl.value) { URL.revokeObjectURL(previewUrl.value); previewUrl.value = ''; }
  emit('reset');
  try {
    stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: false, autoGainControl: true } });
  } catch (e) {
    error.value = (e as Error)?.name === 'NotAllowedError'
      ? i18nT('没有麦克风权限：请在系统设置 → 隐私与安全性 → 麦克风里允许本应用，或改用「导入录音文件」')
      : i18nT('打不开麦克风：{p0}', { p0: (e as Error)?.message || '-' });
    cleanup();
    return;
  }
  const mime = pickMime();
  try {
    recorder = mime ? new MediaRecorder(stream, { mimeType: mime }) : new MediaRecorder(stream);
  } catch (e) {
    error.value = i18nT('这台电脑不支持录音：{p0}', { p0: (e as Error)?.message || '-' });
    cleanup();
    return;
  }
  chunks = [];
  recorder.ondataavailable = (ev) => { if (ev.data && ev.data.size) chunks.push(ev.data); };
  recorder.onstop = () => void finish(recorder?.mimeType || mime);
  // 音量条：看得出麦克风真的收到声音了
  try {
    audioCtx = new AudioContext();
    const analyser = audioCtx.createAnalyser();
    analyser.fftSize = 1024;
    audioCtx.createMediaStreamSource(stream).connect(analyser);
    const buf = new Uint8Array(analyser.fftSize);
    const tick = () => {
      analyser.getByteTimeDomainData(buf);
      let peak = 0;
      for (const v of buf) peak = Math.max(peak, Math.abs(v - 128));
      level.value = Math.min(100, Math.round((peak / 128) * 140));
      raf = requestAnimationFrame(tick);
    };
    tick();
  } catch { /* 音量条可有可无 */ }
  startedAt = Date.now();
  seconds.value = 0;
  state.value = 'recording';
  recorder.start(250);
  timer = setInterval(() => {
    seconds.value = Math.floor((Date.now() - startedAt) / 1000);
    if (seconds.value >= MAX_SEC) stop();
  }, 200);
}

function stop(): void {
  if (recorder && recorder.state !== 'inactive') recorder.stop();
  if (timer) { clearInterval(timer); timer = null; }
}

async function finish(mime: string): Promise<void> {
  const dur = Math.round((Date.now() - startedAt) / 100) / 10;
  cleanup();
  state.value = 'done';
  seconds.value = Math.round(dur);
  const blob = new Blob(chunks, { type: mime || 'audio/webm' });
  if (!blob.size) { error.value = i18nT('没有录到声音，请重录'); return; }
  previewUrl.value = URL.createObjectURL(blob);
  const buf = new Uint8Array(await blob.arrayBuffer());
  let bin = '';
  for (let i = 0; i < buf.length; i += 0x8000) bin += String.fromCharCode(...buf.subarray(i, i + 0x8000));
  const ext = /ogg/.test(mime) ? 'ogg' : /mp4/.test(mime) ? 'm4a' : 'webm';
  emit('recorded', { data: btoa(bin), ext, seconds: dur });
}

onBeforeUnmount(() => {
  try { if (recorder && recorder.state !== 'inactive') recorder.stop(); } catch { /* */ }
  cleanup();
  if (previewUrl.value) URL.revokeObjectURL(previewUrl.value);
});
</script>

<style scoped>
.mm-rec { display: grid; gap: 10px; }
.mm-rec__tip { margin: 0; font-size: 13px; color: var(--color-text-secondary); }
.mm-rec__script { margin: 0; padding: 12px 14px; border-radius: var(--radius-4); background: color-mix(in srgb, var(--color-brand) 7%, transparent); border-inline-start: 3px solid var(--color-brand); font-size: 15px; line-height: 1.8; }
.mm-rec__bar { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; }
.mm-rec__time { font-variant-numeric: tabular-nums; font-size: 13px; color: var(--color-text-secondary); display: inline-flex; align-items: center; gap: 6px; min-width: 52px; }
.mm-rec__time.live { color: var(--color-danger); font-weight: 600; }
.mm-rec__time.short { color: var(--color-warning); }
.mm-rec__dot { width: 8px; height: 8px; border-radius: 50%; background: var(--color-danger); animation: mm-rec-blink 1s infinite; }
@keyframes mm-rec-blink { 50% { opacity: 0.25; } }
.mm-rec__meter { flex: 1; min-width: 120px; max-width: 240px; height: 6px; border-radius: 3px; background: var(--color-border-subtle); overflow: hidden; }
.mm-rec__meter b { display: block; height: 100%; background: var(--color-success); transition: width 80ms linear; }
.mm-rec__audio { width: 100%; max-width: 420px; height: 36px; }
</style>
