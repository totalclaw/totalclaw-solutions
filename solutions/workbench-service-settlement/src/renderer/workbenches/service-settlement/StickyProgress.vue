<template>
  <nav class="ss-progress" :class="{ busy: running, 'all-done': doneCount === metas.length }" :aria-label="$t('流程进度')">
    <WorkbenchStepBar :steps="barSteps" :model-value="viewId" @update:model-value="pick" />
    <div class="ss-progress__meta">
      <strong>{{ title }}</strong>
      <em v-if="running" class="ss-progress__live" :class="{ suspect: watchdog.suspect.value }">
        <i :class="watchdog.suspect.value ? 'ri-timer-flash-line' : 'ri-loader-4-line spin'"></i>{{ liveLabel }}
      </em>
      <em v-else-if="doneCount === metas.length" class="ss-progress__live ok"><i class="ri-check-double-line"></i>{{ $t('全部完成') }}</em>
      <em v-else-if="failedKey" class="ss-progress__live bad"><i class="ri-error-warning-line"></i>{{ $t('第 {n} 步失败', { n: failedIndex + 1 }) }}</em>
    </div>
  </nav>
</template>

<script setup lang="ts">
/**
 * 粘性进度条：始终在视口顶部（UX 硬规则二）。步骤条本体用全工作台共享的
 * WorkbenchStepBar（步骤 / 进度 / 上一步下一步），每步副标题给真实运行态；
 * 状态行进行中显示已耗时，用户能区分「慢」和「死」；失败直接指出第几步。
 *
 * 已耗时由看门狗（useStepWatchdog）从**正在跑那一步的 startedAt** 算：
 * 原来是 watch(running) 时现记 Date.now()，换 tab / 重挂载回来就归零。
 * 跑过预计或很久没进度时这里只换一句「可能已超时」，动作按钮在步骤卡上。
 */
import { computed, ref, watch } from 'vue';
import WorkbenchStepBar, { type WorkbenchStep } from '../../components/WorkbenchStepBar.vue';
import { formatStepDuration, useStepWatchdog } from '../../composables/useStepWatchdog';
import { t as i18nT } from '../../i18n';
import type { StepMeta, StepRuntime } from './shared';

const props = defineProps<{
  title: string;
  metas: StepMeta[];
  runtime: Record<string, StepRuntime>;
  currentKey: string;
}>();
const emit = defineEmits<{ (e: 'jump', key: string): void }>();

const currentIndex = computed(() => Math.max(0, props.metas.findIndex((m) => m.key === props.currentKey)));
const doneCount = computed(() => props.metas.filter((m) => props.runtime[m.key]?.state === 'done').length);
const runningMeta = computed(() => props.metas.find((m) => props.runtime[m.key]?.state === 'running') || null);
const running = computed(() => !!runningMeta.value);
const runningRuntime = computed(() => (runningMeta.value ? props.runtime[runningMeta.value.key] : null));
const failedKey = computed(() => props.metas.find((m) => props.runtime[m.key]?.state === 'failed')?.key || '');
const failedIndex = computed(() => props.metas.findIndex((m) => m.key === failedKey.value));

const watchdog = useStepWatchdog({
  running: () => running.value,
  startedAt: () => runningRuntime.value?.startedAt,
  estimateMs: () => (runningRuntime.value?.estimateSec ? runningRuntime.value.estimateSec * 1000 : null),
  kind: () => runningRuntime.value?.kind || 'generic',
  lastProgressAt: () => runningRuntime.value?.progressAt,
});

const liveLabel = computed(() => {
  const sec = watchdog.elapsedSec.value;
  const elapsed = sec >= 3 ? ` · ${formatStepDuration(sec)}` : '';
  if (watchdog.suspect.value) return `${i18nT('可能已超时')}${elapsed}`;
  return `${i18nT('进行中')}${elapsed}`;
});

function stepSub(key: string): string | undefined {
  const r = props.runtime[key];
  if (!r) return undefined;
  if (r.state === 'running') return watchdog.suspect.value ? i18nT('可能已超时') : i18nT('进行中');
  if (r.state === 'failed') return r.error || i18nT('失败');
  if (r.state === 'done') return r.summary || undefined;
  return undefined;
}

/** 共享步骤条用数字 id：第 i 步 = i + 1 */
const barSteps = computed<WorkbenchStep[]>(() => props.metas.map((m, i) => ({
  id: i + 1,
  label: m.title,
  done: props.runtime[m.key]?.state === 'done',
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
</script>

<style scoped>
/* 步骤条与标题行同在一张卡片里吸顶：标题行若在卡外，吸顶后会悬空、下面内容从它身后穿过。
   top 抵掉工作台根节点的 padding-top（各工作台统一 18px），否则吸顶卡上方留一条缝，内容从缝里穿过 */
.ss-progress {
  position: sticky;
  top: -18px;
  z-index: 20;
  background: var(--color-bg-primary);
  border: 1px solid var(--color-border);
  border-radius: 12px;
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.06);
  /* clip 而不是 hidden：hidden 会让它成为滚动容器、在内容超高的 grid 里最小高度归零被压成一条线 */
  overflow: clip;
  display: grid;
}
.ss-progress :deep(.wsb) { position: static; margin-bottom: 0; border: 0; border-radius: 0; box-shadow: none; }
.ss-progress__meta { display: flex; align-items: center; gap: 12px; font-size: 12.5px; padding: 8px 14px; border-block-start: 1px solid var(--color-border); }
.ss-progress__meta strong { font-size: 13.5px; }
.ss-progress__live { margin-inline-start: auto; font-style: normal; display: inline-flex; align-items: center; gap: 6px; color: var(--color-brand); font-weight: 700; font-variant-numeric: tabular-nums; }
.ss-progress__live.ok { color: var(--color-success); }
.ss-progress__live.bad { color: var(--color-danger); }
.ss-progress__live.suspect { color: #a0650d; }
.spin { animation: ss-spin 1s linear infinite; }
@keyframes ss-spin { to { transform: rotate(360deg); } }
</style>
