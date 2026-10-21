<template>
  <nav class="bw-progress" :class="{ busy: running }" :aria-label="$t('流程进度')">
    <div class="bw-progress__meta">
      <strong>{{ $t('标书制作进度') }}</strong>
      <em v-if="running" class="bw-progress__live" :class="{ suspect: watchdog.suspect.value }">
        <i :class="watchdog.suspect.value ? 'ri-timer-flash-line' : 'ri-loader-4-line bw-spin'"></i>{{ live?.message || $t('进行中') }}{{ elapsedLabel }}
      </em>
      <em v-else-if="doneCount === metas.length" class="bw-progress__live ok"><i class="ri-check-double-line"></i>{{ $t('全部完成') }}</em>
      <em v-else-if="failedIndex >= 0" class="bw-progress__live bad"><i class="ri-error-warning-line"></i>{{ $t('第 {n} 步失败', { n: failedIndex + 1 }) }}</em>
    </div>
    <WorkbenchStepBar :steps="barSteps" :model-value="viewId" @update:model-value="pick" />
  </nav>
</template>

<script setup lang="ts">
/**
 * 粘性进度条：始终留在视口顶部（UX 硬规则二）。步骤条本体用全工作台共享的
 * WorkbenchStepBar（步骤 / 进度 / 上一步下一步）；这里只补标书特有的状态行：
 * 进行中显示主进程推来的真实阶段文字 + 已耗时，用户能分清「慢」和「死」。
 *
 * 已耗时由看门狗（useStepWatchdog）从**正在跑那一步的 startedAt** 算：原来是 watch(running)
 * 时现记 Date.now() + setInterval，换 tab / 重挂载回来就归零。主进程的进度事件（live）= 心跳；
 * 跑过预计或 4 分钟没有进度就在这一行标「可能已超时」（主进程自带超时，这里不放动作按钮）。
 */
import { computed, ref, watch } from 'vue';
import WorkbenchStepBar, { type WorkbenchStep } from '../../components/WorkbenchStepBar.vue';
import { formatStepDuration, useStepWatchdog } from '../../composables/useStepWatchdog';
import { t as i18nT } from '../../i18n';
import type { StepKey, StepMeta, StepRuntime } from './shared';

const props = defineProps<{
  metas: StepMeta[];
  runtime: Record<StepKey, StepRuntime>;
  currentKey: StepKey;
  live: { message: string; done: number; total: number } | null;
}>();
const emit = defineEmits<{ (e: 'jump', key: StepKey): void }>();

/** 最长的一步是正文撰写：主进程 compose 超时 240 秒，预计按它给 */
const ESTIMATE_SEC = 240;

const currentIndex = computed(() => Math.max(0, props.metas.findIndex((m) => m.key === props.currentKey)));
const doneCount = computed(() => props.metas.filter((m) => props.runtime[m.key]?.state === 'done').length);
const runningRuntime = computed(() => {
  const m = props.metas.find((x) => props.runtime[x.key]?.state === 'running');
  return m ? props.runtime[m.key] : null;
});
const running = computed(() => !!runningRuntime.value);
const failedIndex = computed(() => props.metas.findIndex((m) => props.runtime[m.key]?.state === 'failed'));

const watchdog = useStepWatchdog({
  running: () => running.value,
  startedAt: () => runningRuntime.value?.startedAt,
  estimateMs: () => ESTIMATE_SEC * 1000,
  kind: 'llm',
});
// 主进程推来一条进度 = 一次心跳
watch(() => props.live, (v) => { if (v && running.value) watchdog.heartbeat(); }, { deep: true });

/** 共享步骤条用数字 id：第 i 步 = i + 1；done / 进行中 / 失败 来自各步真实运行态 */
const barSteps = computed<WorkbenchStep[]>(() => props.metas.map((m, i) => {
  const state = props.runtime[m.key]?.state;
  return {
    id: i + 1,
    label: m.title,
    done: state === 'done',
    sub: state === 'running' ? (watchdog.suspect.value ? i18nT('可能已超时') : i18nT('进行中')) : state === 'failed' ? i18nT('失败') : undefined,
  };
}));

/** 用户在条上点选 / 上一步下一步的「查看位置」；运行态推进 currentKey 时跟着走 */
const viewId = ref(currentIndex.value + 1);
watch(currentIndex, (i) => { viewId.value = i + 1; });
function pick(id: number): void {
  viewId.value = id;
  const key = props.metas[id - 1]?.key;
  if (key) emit('jump', key);
}

const elapsedLabel = computed(() => {
  const sec = watchdog.elapsedSec.value;
  const base = sec >= 3 ? ` · ${formatStepDuration(sec)}` : '';
  return watchdog.suspect.value ? `${base} · ${i18nT('可能已超时')}` : base;
});
</script>
