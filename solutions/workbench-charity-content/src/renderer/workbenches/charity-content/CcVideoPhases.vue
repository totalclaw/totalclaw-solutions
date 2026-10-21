<template>
  <div class="cc-phases" :aria-label="$t('成片进度')">
    <ol class="cc-phases__list">
      <li v-for="(p, i) in phases" :key="p" :class="stateOf(i)">
        <span class="cc-phases__dot">
          <i v-if="stateOf(i) === 'done'" class="ri-check-line"></i>
          <i v-else-if="stateOf(i) === 'running'" class="ri-loader-4-line cc-spin"></i>
          <template v-else>{{ i + 1 }}</template>
        </span>
        <span class="cc-phases__label">
          <strong>{{ videoPhaseLabel(p, langCount) }}</strong>
          <small v-if="stateOf(i) === 'running' && event && event.total > 1">{{ event.done }}/{{ event.total }}</small>
        </span>
      </li>
    </ol>
    <div class="cc-stagebar" role="progressbar" :aria-valuenow="pct" aria-valuemin="0" aria-valuemax="100"><span :style="{ width: `${pct}%` }"></span></div>
    <div class="cc-phases__foot">
      <p class="cc-skeleton__live"><i class="ri-loader-4-line cc-spin"></i>{{ (live?.step === 'video' && live.msg) || $t('准备中…') }}</p>
      <button type="button" class="cc-btn sm ghost" @click="$emit('cancel')"><i class="ri-stop-circle-line"></i>{{ $t('停止生成') }}</button>
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * 第 4 步成片的阶段条：阶段计划与当前阶段都来自主进程进度事件（上传 → 镜头 i/N → 剪辑 → 配乐 → 合成 k/3），
 * 进度 = 已完成阶段 + 当前阶段内计数，不做按时间推进的假百分比。
 */
import { computed } from 'vue';
import type { CharityProgressEvent, CharityVideoPhase } from '@totalclaw/ipc-contracts';
import { phaseFraction, videoPhaseLabel } from './shared';

const props = defineProps<{ live: CharityProgressEvent | null; fallbackPlan: CharityVideoPhase[]; langCount: number }>();
defineEmits<{ (e: 'cancel'): void }>();

const event = computed(() => (props.live?.step === 'video' && props.live.plan?.length ? props.live : null));
const phases = computed<CharityVideoPhase[]>(() => event.value?.plan || props.fallbackPlan);
const current = computed(() => (event.value?.phase ? phases.value.indexOf(event.value.phase) : 0));
function stateOf(i: number): 'done' | 'running' | 'todo' { return i < current.value ? 'done' : i === current.value ? 'running' : 'todo'; }
const pct = computed(() => Math.round((phaseFraction(event.value) ?? 0) * 100));
</script>
