<template>
  <article class="cc-step" :class="[`is-${runtime.state}`, { current: isCurrent, 'is-suspect': watchdog.suspect.value }]" :data-cc-step="stepKey">
    <header class="cc-step__head">
      <span class="cc-step__no">
        <svg v-if="runtime.state === 'done'" class="cc-check" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>
        <i v-else-if="runtime.state === 'running'" class="ri-loader-4-line cc-spin"></i>
        <i v-else-if="runtime.state === 'failed'" class="ri-close-line"></i>
        <i v-else :class="icon"></i>
      </span>
      <div class="cc-step__title">
        <strong>{{ $t('第 {n} 步', { n: index + 1 }) }} · {{ title }}</strong>
        <small>{{ hint }}</small>
      </div>
      <div class="cc-step__tools"><slot name="tools"></slot></div>
      <em class="cc-step__state" :class="[runtime.state, { suspect: watchdog.suspect.value }]">
        <template v-if="runtime.state === 'todo'">{{ $t('待执行') }}</template>
        <template v-else-if="runtime.state === 'running'">{{ runningLabel }}</template>
        <template v-else-if="runtime.state === 'done'">{{ $t('完成') }}</template>
        <template v-else>{{ $t('失败') }}</template>
      </em>
    </header>
    <!-- 失败即终止：红卡 + 真实原因 + 「重新生成」（宿主传了 retry 才有）+ 「查看日志」 -->
    <StepRunAlert
      v-if="runtime.state === 'failed' && runtime.error"
      state="failed"
      :message="runtime.error"
      :hide-retry="!retry"
      :retry-label="retryLabel"
      :busy="retrying"
      @retry="onRetry"
    />
    <!-- 跑过预计 / 很久没进度：「可能已超时」，可继续等待 / 重新生成（先取消旧任务）/ 查看日志 -->
    <StepRunAlert
      v-else-if="runtime.state === 'running' && watchdog.suspect.value"
      state="suspect"
      :elapsed-sec="watchdog.elapsedSec.value"
      :estimate-sec="runtime.estimateSec || null"
      :since-heartbeat-sec="watchdog.sinceHeartbeatSec.value"
      :hide-retry="!retry"
      :retry-label="retryLabel"
      :busy="retrying"
      @retry="onRetry"
      @keep-waiting="watchdog.keepWaiting()"
    />
    <p v-else-if="runtime.state === 'done' && runtime.summary" class="cc-step__summary"><i class="ri-checkbox-circle-line"></i>{{ runtime.summary }}</p>
    <div class="cc-step__body"><slot></slot></div>
  </article>
</template>

<script setup lang="ts">
/**
 * 步骤卡：独立状态 + 失败原因就写在这一步上（UX 硬规则一）。
 *
 * 2026-10-13 起自带看门狗（composables/useStepWatchdog）：
 *   - 进行中的状态胶囊显示真实已用时长（从 runtime.startedAt 算，换 tab / 重挂载不归零）；
 *   - 跑过 max(预计×3, 预计+5min) 或按 runtime.kind 的无进度上限没收到进度 → 「可能已超时」卡；
 *   - 失败 → 红卡 + 原因 + 「重新生成」（宿主传 retry 才有）+ 「查看日志」。
 * 「可能已超时」时点重新生成：先调 cancel（宿主的 cancelRun），等它结束再 retry，不堆僵尸任务。
 */
import { computed, ref } from 'vue';
import StepRunAlert from '../../components/StepRunAlert.vue';
import { formatStepDuration, useStepWatchdog } from '../../composables/useStepWatchdog';
import { t as i18nT } from '../../i18n';
import type { StepRuntime } from './shared';

const props = defineProps<{
  stepKey: string;
  index: number;
  title: string;
  hint: string;
  icon: string;
  runtime: StepRuntime;
  isCurrent?: boolean;
  /** 重跑这一步；传了才会出现「重新生成」按钮 */
  retry?: () => unknown;
  /** 取消还在跑的任务；「可能已超时」时点重新生成会先调它 */
  cancel?: () => unknown;
  retryLabel?: string;
}>();

const watchdog = useStepWatchdog({
  running: () => props.runtime.state === 'running',
  startedAt: () => props.runtime.startedAt,
  estimateMs: () => (props.runtime.estimateSec && props.runtime.estimateSec > 0 ? props.runtime.estimateSec * 1000 : null),
  kind: () => props.runtime.kind || 'generic',
  lastProgressAt: () => props.runtime.progressAt,
});

/** 进行中：「进行中 · 1 分 5 秒」；比预计慢 / 可能已超时就明说（用户要能分清「慢」和「死」） */
const runningLabel = computed(() => {
  const sec = watchdog.elapsedSec.value;
  if (sec < 3) return i18nT('进行中');
  const base = i18nT('进行中 · {p0}', { p0: formatStepDuration(sec) });
  if (watchdog.suspect.value) return i18nT('{p0} · 可能已超时', { p0: base });
  if (watchdog.overdue.value) return i18nT('{p0} · 比预计慢', { p0: base });
  return base;
});

const retrying = ref(false);
async function onRetry(): Promise<void> {
  if (!props.retry || retrying.value) return;
  retrying.value = true;
  try {
    if (props.runtime.state === 'running' && props.cancel) await props.cancel();
    await props.retry();
  } finally {
    retrying.value = false;
  }
}
</script>
