<template>
  <div class="cc-audio" :class="{ playing }">
    <button type="button" class="cc-audio__play" :aria-label="playing ? $t('暂停') : $t('播放')" @click="toggle">
      <i :class="playing ? 'ri-pause-fill' : 'ri-play-fill'"></i>
    </button>
    <canvas ref="canvas" class="cc-audio__wave" @click="seek"></canvas>
    <span class="cc-audio__time">{{ fmtDur(current) }} / {{ fmtDur(duration) }}</span>
    <audio ref="audio" :src="src" preload="metadata" @timeupdate="onTime" @loadedmetadata="onMeta" @ended="playing = false" @pause="playing = false" @play="playing = true"></audio>
  </div>
</template>

<script setup lang="ts">
/**
 * 语音试听：Web Audio 解码 → 峰值条形波形（canvas），播放进度着色；点击波形跳转。
 * data URL 解码失败（比如非常长的音频）就退回纯进度条，不影响播放。
 */
import { onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { fmtDur } from './shared';

const props = defineProps<{ src: string }>();
const audio = ref<HTMLAudioElement | null>(null);
const canvas = ref<HTMLCanvasElement | null>(null);
const playing = ref(false);
const current = ref(0);
const duration = ref(0);
let peaks: number[] = [];
let ctx: AudioContext | null = null;

async function decode(): Promise<void> {
  peaks = [];
  try {
    const res = await fetch(props.src);
    const buf = await res.arrayBuffer();
    ctx = ctx || new (window.AudioContext || (window as any).webkitAudioContext)();
    const decoded = await ctx.decodeAudioData(buf.slice(0));
    const data = decoded.getChannelData(0);
    const bars = 96;
    const block = Math.max(1, Math.floor(data.length / bars));
    const out: number[] = [];
    for (let i = 0; i < bars; i += 1) {
      let peak = 0;
      const start = i * block;
      for (let j = 0; j < block; j += 8) { const v = Math.abs(data[start + j] || 0); if (v > peak) peak = v; }
      out.push(peak);
    }
    const max = Math.max(0.05, ...out);
    peaks = out.map((p) => p / max);
  } catch { peaks = []; }
  draw();
}

function draw(): void {
  const c = canvas.value; if (!c) return;
  const dpr = window.devicePixelRatio || 1;
  const w = c.clientWidth || 300; const h = c.clientHeight || 40;
  c.width = w * dpr; c.height = h * dpr;
  const g = c.getContext('2d'); if (!g) return;
  g.scale(dpr, dpr); g.clearRect(0, 0, w, h);
  const styles = getComputedStyle(c);
  const brand = styles.getPropertyValue('--color-brand').trim() || '#675cf3';
  const muted = styles.getPropertyValue('--color-border').trim() || '#ccc';
  const bars = peaks.length || 96;
  const gap = 2; const bw = Math.max(1.5, (w - gap * (bars - 1)) / bars);
  const progress = duration.value ? current.value / duration.value : 0;
  for (let i = 0; i < bars; i += 1) {
    const p = peaks.length ? peaks[i] : 0.35;
    const bh = Math.max(3, p * (h - 6));
    g.fillStyle = i / bars <= progress ? brand : muted;
    const x = i * (bw + gap); const y = (h - bh) / 2;
    g.beginPath(); (g as any).roundRect ? (g as any).roundRect(x, y, bw, bh, 1.5) : g.rect(x, y, bw, bh); g.fill();
  }
}

function toggle(): void { const a = audio.value; if (!a) return; if (a.paused) void a.play(); else a.pause(); }
function onTime(): void { current.value = audio.value?.currentTime || 0; draw(); }
function onMeta(): void { duration.value = audio.value?.duration || 0; draw(); }
function seek(ev: MouseEvent): void {
  const a = audio.value; const c = canvas.value; if (!a || !c || !duration.value) return;
  const rect = c.getBoundingClientRect();
  a.currentTime = Math.max(0, Math.min(duration.value, ((ev.clientX - rect.left) / rect.width) * duration.value));
}
onMounted(() => { void decode(); });
watch(() => props.src, () => { current.value = 0; playing.value = false; void decode(); });
onBeforeUnmount(() => { try { audio.value?.pause(); ctx?.close(); } catch { /* ignore */ } });
</script>
