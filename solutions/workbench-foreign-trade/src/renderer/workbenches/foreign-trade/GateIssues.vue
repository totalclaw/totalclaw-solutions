<template>
  <div v-if="result && result.issues.length" class="ft-gate" :class="{ blocked: !result.ok }" data-test="ft-gate">
    <div class="ft-gate__head">
      <i :class="result.ok ? 'ri-information-line' : 'ri-forbid-2-line'"></i>
      <strong>{{ result.ok ? $t('发送前检查：可以发，有 {n} 处提醒', { n: warns.length }) : $t('发送前检查：被拦下，{n} 处要先改', { n: blocks.length }) }}</strong>
      <span v-if="!hideQuota" class="ss-muted">{{ $t('今天这个邮箱已发 {a} / {b} 封', { a: result.sentToday, b: result.dailyLimit }) }}</span>
    </div>
    <ul>
      <li v-for="(i, k) in result.issues" :key="k" :class="i.level" :data-rule="i.rule">
        <span class="ss-chip" :class="i.level === 'block' ? 'bad' : 'warn'">{{ i.level === 'block' ? $t('拦截') : $t('提醒') }}</span>
        {{ i.message }}
        <button v-if="i.rule === 'no_opt_out' && optOutLine" type="button" class="ss-link" @click="$emit('fix-opt-out', optOutLine)">{{ $t('补上退订句') }}</button>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
/** 发信闸门的结果：拦截原因与提醒逐条列出（开发信、跟进、询盘回复、报价邮件共用） */
import { computed } from 'vue';
import type { FtGateResult } from '@totalclaw/ipc-contracts';

const props = defineProps<{ result: FtGateResult | null | undefined; optOutLine?: string; hideQuota?: boolean }>();
defineEmits<{ (e: 'fix-opt-out', line: string): void }>();
const blocks = computed(() => (props.result?.issues || []).filter((i) => i.level === 'block'));
const warns = computed(() => (props.result?.issues || []).filter((i) => i.level === 'warn'));
</script>

<style scoped>
.ft-gate { border: 1px solid color-mix(in srgb, var(--color-warning) 45%, var(--color-border)); background: color-mix(in srgb, var(--color-warning) 7%, var(--color-bg-card)); border-radius: 10px; padding: 8px 10px; display: grid; gap: 6px; font-size: 12.5px; }
.ft-gate.blocked { border-color: color-mix(in srgb, var(--color-danger) 55%, var(--color-border)); background: color-mix(in srgb, var(--color-danger) 7%, var(--color-bg-card)); }
.ft-gate__head { display: flex; gap: 8px; align-items: center; flex-wrap: wrap; }
.ft-gate__head i { font-size: 16px; color: var(--color-warning); }
.ft-gate.blocked .ft-gate__head i { color: var(--color-danger); }
.ft-gate ul { list-style: none; margin: 0; padding: 0; display: grid; gap: 4px; }
.ft-gate li { display: flex; gap: 6px; align-items: baseline; flex-wrap: wrap; }
</style>
