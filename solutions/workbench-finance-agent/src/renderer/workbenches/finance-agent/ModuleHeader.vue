<template>
  <section class="fa-mhead">
    <div class="fa-mhead__main">
      <h2><i :class="meta.icon"></i>{{ $t('{p0}智能体', { p0: meta.title }) }}</h2>
      <div class="fa-mhead__split">
        <span><em class="ss-chip brand">{{ $t('能力') }}</em>{{ meta.ability }}</span>
        <span><em class="ss-chip">{{ $t('输出物') }}</em>{{ meta.output }}</span>
      </div>
    </div>
    <label class="fa-mhead__model" :title="$t('本智能体所有抽取、分析、写作都用这个模型；金额由规则计算，不经过模型')">
      <small><i class="ri-cpu-line"></i>{{ $t('本智能体使用模型') }}</small>
      <select :value="current" :disabled="saving" @change="onChange(($event.target as HTMLSelectElement).value)">
        <option value="">{{ $t('跟随系统默认（{p0}）', { p0: faModels.defaultLabel || $t('未配置') }) }}</option>
        <optgroup v-for="g in modelGroups()" :key="g.group" :label="g.group"><option v-for="o in g.options" :key="o.value" :value="o.value">{{ o.label }}</option></optgroup>
        <option v-if="current && !faModels.options.some((o) => o.value === current)" :value="current">{{ current }}</option>
      </select>
    </label>
  </section>
</template>

<script setup lang="ts">
/**
 * 智能体头：写清能力与输出物（方案原文），并明确本智能体用哪个模型。
 */
import { computed, ref } from 'vue';
import { useNotificationStore } from '../../stores/notification';
import { fa, faModels, faState, modelGroups, errorMessage, refreshState, type FaModuleMeta } from './shared';

const props = defineProps<{ meta: FaModuleMeta }>();
const notif = useNotificationStore();
const saving = ref(false);
const current = computed(() => faState.value?.settings.moduleModels[props.meta.key] || '');

async function onChange(value: string): Promise<void> {
  saving.value = true;
  try {
    const models: Record<string, string> = { ...(faState.value?.settings.moduleModels || {}) };
    if (value) models[props.meta.key] = value; else delete models[props.meta.key];
    await fa('settings.patch', { patch: { moduleModels: models } });
    await refreshState();
  } catch (e) {
    notif.error(errorMessage(e));
  } finally {
    saving.value = false;
  }
}
</script>

<style scoped>
.fa-mhead { display: flex; gap: 16px; align-items: flex-start; justify-content: space-between; flex-wrap: wrap; padding: 12px 14px; border: 1px solid var(--color-border); border-radius: var(--radius-6); background: var(--color-bg-card); }
.fa-mhead__main { display: grid; gap: 6px; min-width: 0; flex: 1; }
.fa-mhead h2 { margin: 0; font-size: 16px; display: flex; align-items: center; gap: 8px; }
.fa-mhead h2 i { color: var(--color-brand); font-size: 20px; }
.fa-mhead__split { display: grid; gap: 4px; font-size: 12.5px; color: var(--color-text-secondary); line-height: 1.55; }
.fa-mhead__split span { display: flex; gap: 8px; align-items: baseline; }
.fa-mhead__split em { font-style: normal; flex: 0 0 auto; }
.fa-mhead__model { display: grid; gap: 4px; min-width: 240px; }
.fa-mhead__model small { font-size: 11.5px; color: var(--color-text-secondary); display: flex; gap: 4px; align-items: center; }
.fa-mhead__model select { height: 34px; border-radius: var(--radius-3); border: 1px solid var(--color-brand); background: var(--color-bg-input); color: var(--color-text-primary); font: inherit; font-size: 12.5px; padding: 0 8px; max-width: 360px; }
</style>
