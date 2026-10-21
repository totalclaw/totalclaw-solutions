<template>
  <article
    class="ss-step"
    :class="[`is-${runtime.state}`, { current: isCurrent, 'is-suspect': watchdog.suspect.value }]"
    :data-step-key="stepKey"
  >
    <header class="ss-step__head">
      <span class="ss-step__no">
        <i v-if="runtime.state === 'done'" class="ri-check-line"></i>
        <i v-else-if="runtime.state === 'running'" class="ri-loader-4-line spin"></i>
        <i v-else-if="runtime.state === 'failed'" class="ri-close-line"></i>
        <template v-else>{{ index + 1 }}</template>
      </span>
      <div class="ss-step__title">
        <strong>{{ $t('第 {n} 步', { n: index + 1 }) }} · {{ title }}</strong>
        <small v-if="hint">{{ hint }}</small>
      </div>
      <em class="ss-step__state" :class="[runtime.state, { suspect: watchdog.suspect.value }]">
        <template v-if="runtime.state === 'todo'">{{ $t('待执行') }}</template>
        <template v-else-if="runtime.state === 'running'">{{ runningLabel }}</template>
        <template v-else-if="runtime.state === 'done'">{{ $t('完成') }}</template>
        <template v-else-if="runtime.state === 'failed'">{{ $t('失败') }}</template>
        <template v-else>{{ $t('跳过') }}</template>
      </em>
    </header>
    <!--
      失败即终止 + 可重新生成：宿主给了 retry 就在卡上直接放「重新生成」；
      没给就只留原因与「查看日志」（宁可少一个按钮，也不放一个点了没反应的）。
    -->
    <StepRunAlert
      v-if="runtime.state === 'failed' && runtime.error"
      state="failed"
      :message="runtime.error"
      :hide-retry="!retry"
      :retry-label="retryLabel"
      :busy="retrying"
      @retry="onRetry"
    />
    <!-- 跑过预计 / 很久没进度：说清「可能已超时」，给继续等待 / 重新生成（会先取消旧任务）/ 查看日志 -->
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
    <p v-else-if="runtime.state === 'done' && runtime.summary" class="ss-step__summary">
      <i class="ri-checkbox-circle-line"></i>{{ runtime.summary }}
    </p>
    <div class="ss-step__body">
      <slot></slot>
    </div>
  </article>
</template>

<script setup lang="ts">
/**
 * 步骤卡：编号 / 标题 / 独立状态（待执行·进行中·完成·失败）/ 失败原因就写在这一步上。
 * 对应 docs/solution-workbench-ux-guidelines.md 规则一。
 *
 * 2026-10-13 起自带看门狗（composables/useStepWatchdog）：
 *   - 进行中的状态胶囊显示真实已用时长（从 runtime.startedAt 算，重挂载不归零）；
 *   - 跑过 max(预计×3, 预计+5min) 或按 runtime.kind 的无进度上限没有进度 → 「可能已超时」卡；
 *   - 失败 → 红卡 + 原因 + 「重新生成」（宿主传 retry 才有）+ 「查看日志」。
 * 宿主只需把 startedAt / progressAt / kind / estimateSec 写进 runtime（都可省略），
 * 以及按需传 retry / cancel 两个函数。
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
  hint?: string;
  runtime: StepRuntime;
  isCurrent?: boolean;
  /** 重跑这一步；传了才会出现「重新生成」按钮 */
  retry?: () => unknown;
  /** 取消还在跑的任务；「可能已超时」时点重新生成会先调它，等它结束再 retry（不堆僵尸） */
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

/** 进行中：「进行中 · 1 分 05 秒」；比预计慢就明说（用户要能分清「慢」和「死」） */
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
    if (props.runtime.state === 'running' && props.cancel) {
      await props.cancel();
    }
    await props.retry();
  } finally {
    retrying.value = false;
  }
}
</script>

<style scoped>
.ss-step {
  border: 1px solid var(--color-border);
  border-radius: 14px;
  background: var(--color-bg-card);
  scroll-margin-top: 140px;
  transition: border-color .2s, box-shadow .2s;
}
.ss-step.current { border-color: var(--color-brand); box-shadow: 0 0 0 3px color-mix(in srgb, var(--color-brand) 14%, transparent); }
.ss-step.is-failed { border-color: var(--color-danger); }
.ss-step.is-suspect { border-color: #cf8a13; }
.ss-step.is-done { border-color: color-mix(in srgb, var(--color-success) 55%, var(--color-border)); }
.ss-step__head {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
}
.ss-step__no {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
  font-size: 14px;
  background: var(--color-bg-hover);
  color: var(--color-text-secondary);
  flex: 0 0 auto;
}
.is-done .ss-step__no { background: color-mix(in srgb, var(--color-success) 18%, transparent); color: var(--color-success); }
.is-running .ss-step__no { background: color-mix(in srgb, var(--color-brand) 16%, transparent); color: var(--color-brand); }
.is-failed .ss-step__no { background: color-mix(in srgb, var(--color-danger) 16%, transparent); color: var(--color-danger); }
.ss-step__title { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 2px; }
.ss-step__title strong { font-size: 14px; }
.ss-step__title small { color: var(--color-text-secondary); font-size: 12px; line-height: 1.5; }
.ss-step__state {
  font-style: normal;
  font-size: 11px;
  font-weight: 800;
  padding: 3px 10px;
  border-radius: 999px;
  background: var(--color-bg-hover);
  color: var(--color-text-secondary);
  flex: 0 0 auto;
  font-variant-numeric: tabular-nums;
}
.ss-step__state.running { background: color-mix(in srgb, var(--color-brand) 16%, transparent); color: var(--color-brand); }
.ss-step__state.running.suspect { background: color-mix(in srgb, #cf8a13 16%, transparent); color: #a0650d; }
.ss-step__state.done { background: color-mix(in srgb, var(--color-success) 18%, transparent); color: var(--color-success); }
.ss-step__state.failed { background: color-mix(in srgb, var(--color-danger) 16%, transparent); color: var(--color-danger); }
.ss-step__summary {
  margin: 0 16px 8px;
  padding: 8px 12px;
  border-radius: 10px;
  font-size: 12.5px;
  display: flex;
  gap: 8px;
  align-items: flex-start;
  line-height: 1.5;
  white-space: pre-wrap;
  background: color-mix(in srgb, var(--color-success) 10%, transparent);
  color: var(--color-success);
}
.ss-step :deep(.sra) { margin: 0 16px 8px; }
.ss-step__body { padding: 0 16px 16px; display: grid; gap: 12px; }
.spin { animation: ss-spin 1s linear infinite; }
@keyframes ss-spin { to { transform: rotate(360deg); } }
</style>
