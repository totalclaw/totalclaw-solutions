<template>
  <nav class="qt-progress" :class="{ busy: running, 'all-done': doneCount === metas.length }" :aria-label="$t('流程进度')">
    <div class="qt-progress__meta">
      <strong>{{ $t('演示主线') }}</strong>
      <span>{{ $t('第 {a} / {b} 步', { a: currentIndex + 1, b: metas.length }) }}</span>
      <span class="qt-chip gold"><i class="ri-lock-line"></i>{{ $t('原文冻结') }}</span>
      <em v-if="running" class="live" :class="{ suspect: watchdog.suspect.value }">
        <i :class="watchdog.suspect.value ? 'ri-timer-flash-line' : 'ri-loader-4-line qt-spin'"></i>{{ liveMsg || $t('进行中') }}{{ elapsedLabel }}
      </em>
      <em v-else-if="doneCount === metas.length" class="live ok"><i class="ri-check-double-line"></i>{{ $t('全部完成') }}</em>
      <em v-else-if="failedKey" class="live bad"><i class="ri-error-warning-line"></i>{{ $t('第 {n} 步失败', { n: failedIndex + 1 }) }}</em>
    </div>
    <div class="qt-progress__bar"><span class="qt-progress__fill" :style="{ width: `${fillPct}%` }"></span></div>
    <ol class="qt-progress__steps">
      <li v-for="(m, i) in metas" :key="m.key" :class="[runtime[m.key]?.state || 'todo', { current: m.key === currentKey }]" :title="m.hint" @click="$emit('jump', m.key)">
        <span class="qt-progress__dot">
          <i v-if="runtime[m.key]?.state === 'done'" class="ri-check-line"></i>
          <i v-else-if="runtime[m.key]?.state === 'failed'" class="ri-close-line"></i>
          <i v-else-if="runtime[m.key]?.state === 'running'" class="ri-loader-4-line qt-spin"></i>
          <template v-else>{{ i + 1 }}</template>
        </span>
        <span class="qt-progress__label">
          <strong>{{ m.title }}</strong>
          <small :class="{ bad: runtime[m.key]?.state === 'failed' }">{{ runtime[m.key]?.state === 'failed' ? (runtime[m.key]?.error || $t('失败')) : runtime[m.key]?.summary || '' }}</small>
        </span>
      </li>
    </ol>
  </nav>
</template>

<script setup lang="ts">
/**
 * 粘性进度条：始终在视口顶部（UX 硬规则二）；进行中显示耗时，失败指出第几步。
 * 已耗时由看门狗（useStepWatchdog）从正在跑那一步的 startedAt 算（原来 watch(running) 现记时间，
 * 切学生端再切回来就归零）；liveMsg 变化 = 心跳；跑过预计或 4 分钟没进度标「可能已超时」。
 */
import { computed, watch } from 'vue';
import { formatStepDuration, useStepWatchdog } from '../../composables/useStepWatchdog';
import { t as i18nT } from '../../i18n';
import type { StepKey, StepMeta, StepRuntime } from './shared';

const props = defineProps<{ metas: StepMeta[]; runtime: Record<string, StepRuntime>; currentKey: string; liveMsg?: string }>();
// 只会发 metas 里的 key，按 StepKey 声明，调用方不必再放宽类型
defineEmits<{ (e: 'jump', key: StepKey): void }>();
/** 最长的一步（出题 / 合成视频）主进程超时 45～180 秒，预计按上限给 */
const ESTIMATE_SEC = 180;
const currentIndex = computed(() => Math.max(0, props.metas.findIndex((m) => m.key === props.currentKey)));
const doneCount = computed(() => props.metas.filter((m) => props.runtime[m.key]?.state === 'done').length);
const runningRuntime = computed(() => {
  const m = props.metas.find((x) => props.runtime[x.key]?.state === 'running');
  return m ? props.runtime[m.key] : null;
});
const running = computed(() => !!runningRuntime.value);
const failedKey = computed(() => props.metas.find((m) => props.runtime[m.key]?.state === 'failed')?.key || '');
const failedIndex = computed(() => props.metas.findIndex((m) => m.key === failedKey.value));
const fillPct = computed(() => { const base = (doneCount.value / Math.max(1, props.metas.length)) * 100; return running.value ? Math.min(100, base + (100 / props.metas.length) * 0.5) : base; });
const watchdog = useStepWatchdog({
  running: () => running.value,
  startedAt: () => runningRuntime.value?.startedAt,
  estimateMs: () => ESTIMATE_SEC * 1000,
  kind: 'llm',
});
watch(() => props.liveMsg, (v) => { if (v && running.value) watchdog.heartbeat(); });
const elapsedLabel = computed(() => {
  const sec = watchdog.elapsedSec.value;
  const base = sec >= 3 ? ` · ${formatStepDuration(sec)}` : '';
  return watchdog.suspect.value ? `${base} · ${i18nT('可能已超时')}` : base;
});
</script>
