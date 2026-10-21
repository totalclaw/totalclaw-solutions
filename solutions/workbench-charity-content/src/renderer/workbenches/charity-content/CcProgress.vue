<template>
  <nav class="cc-progress" :class="{ busy: running, 'all-done': allDone }" :aria-label="$t('流程进度')">
    <WorkbenchStepBar :steps="barSteps" :model-value="viewId" @update:model-value="pick" />
    <div class="cc-progress__meta">
      <em v-if="running" class="live" :class="{ suspect: watchdog.suspect.value }">
        <i :class="watchdog.suspect.value ? 'ri-timer-flash-line' : 'ri-loader-4-line cc-spin'"></i>{{ liveText }}{{ elapsedLabel }}
      </em>
      <em v-else-if="allDone" class="live ok"><i class="ri-check-double-line"></i>{{ $t('全部完成') }}</em>
      <em v-else-if="failedIndex >= 0" class="live bad"><i class="ri-error-warning-line"></i>{{ $t('第 {n} 步失败', { n: failedIndex + 1 }) }}</em>
      <span v-else>{{ $t('每一步可单独重跑；点步骤名跳到对应区块') }}</span>
      <button v-if="running" type="button" class="cc-btn sm ghost" @click="$emit('cancel')"><i class="ri-stop-circle-line"></i>{{ $t('停止') }}</button>
    </div>
  </nav>
</template>

<script setup lang="ts">
/**
 * 顶部粘性流程条（UX 硬规则二：永远在视口内）。步骤条本体用全工作台共享的
 * WorkbenchStepBar（步骤 / 进度 / 上一步下一步），每步的副标题给真实运行态：
 * 进行中 = 主进程推来的阶段文案，失败 = 错误，完成 = 一句话结果。
 * 状态行显示已耗时 + 停止按钮，用户能分清「慢」和「死」。
 *
 * 已耗时由看门狗（useStepWatchdog）从**正在跑那一步的 startedAt** 算：
 * 原来是 watch(running) 时现记 Date.now() + setInterval，换 tab / 重挂载回来就归零。
 * 跑过预计或很久没进度时这里换成「可能已超时」，动作按钮在步骤卡上。
 */
import { computed, ref, watch } from 'vue';
import type { CharityProgressEvent } from '@totalclaw/ipc-contracts';
import WorkbenchStepBar, { type WorkbenchStep } from '../../components/WorkbenchStepBar.vue';
import { formatStepDuration, useStepWatchdog } from '../../composables/useStepWatchdog';
import { t as i18nT } from '../../i18n';
import type { StepKey, StepMeta, StepRuntime } from './shared';

const props = defineProps<{
  metas: StepMeta[];
  runtime: Record<StepKey, StepRuntime>;
  currentKey: StepKey;
  live: CharityProgressEvent | null;
}>();
const emit = defineEmits<{ (e: 'jump', key: StepKey): void; (e: 'cancel'): void }>();

function stepOf(key: StepKey): string {
  // 主进程事件 step 名 ↔ 界面步骤：material 收 scan/archive；report 收 analyze/report
  return key === 'material' ? (props.live?.step === 'scan' || props.live?.step === 'archive' ? props.live.step : 'scan')
    : key === 'report' ? (props.live?.step === 'analyze' || props.live?.step === 'report' ? props.live.step : 'report')
      : key === 'speech' ? 'tts' : 'video';
}
function stepSub(key: StepKey): string | undefined {
  const r = props.runtime[key];
  if (r.state === 'running') {
    if (watchdog.suspect.value) return i18nT('可能已超时');
    return (props.live && props.live.step === stepOf(key) && props.live.msg) || i18nT('进行中');
  }
  if (r.state === 'failed') return r.error || i18nT('失败');
  if (r.state === 'done') return r.summary || undefined;
  return undefined;
}
const currentIndex = computed(() => Math.max(0, props.metas.findIndex((m) => m.key === props.currentKey)));
const doneCount = computed(() => props.metas.filter((m) => props.runtime[m.key].state === 'done').length);
const runningMeta = computed(() => props.metas.find((m) => props.runtime[m.key].state === 'running') || null);
const running = computed(() => !!runningMeta.value);
const runningRuntime = computed(() => (runningMeta.value ? props.runtime[runningMeta.value.key] : null));
const allDone = computed(() => doneCount.value === props.metas.length);
const failedIndex = computed(() => props.metas.findIndex((m) => props.runtime[m.key].state === 'failed'));
const liveText = computed(() => (watchdog.suspect.value ? i18nT('可能已超时') : (props.live?.msg || i18nT('进行中'))));

/** 共享步骤条用数字 id：第 i 步 = i + 1 */
const barSteps = computed<WorkbenchStep[]>(() => props.metas.map((m, i) => ({
  id: i + 1,
  label: m.title,
  done: props.runtime[m.key].state === 'done',
  sub: stepSub(m.key),
})));

/** 用户在条上点选 / 上一步下一步的「查看位置」；运行态推进 currentKey 时跟着走 */
const viewId = ref(currentIndex.value + 1);
watch(currentIndex, (i) => { viewId.value = i + 1; });
function pick(id: number): void {
  viewId.value = id;
  const key = props.metas[id - 1]?.key;
  if (key) emit('jump', key);
}

const watchdog = useStepWatchdog({
  running: () => running.value,
  startedAt: () => runningRuntime.value?.startedAt,
  estimateMs: () => (runningRuntime.value?.estimateSec ? runningRuntime.value.estimateSec * 1000 : null),
  kind: () => runningRuntime.value?.kind || 'generic',
  lastProgressAt: () => runningRuntime.value?.progressAt,
});
const elapsedLabel = computed(() => (watchdog.elapsedSec.value >= 3 ? ` · ${formatStepDuration(watchdog.elapsedSec.value)}` : ''));
</script>
