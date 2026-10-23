<template>
  <section class="ba-mhead">
    <div class="ba-mhead__main">
      <h2><i :class="icon"></i>{{ title }}</h2>
      <div class="ba-mhead__split">
        <span><em class="ss-chip brand">{{ $t('能力') }}</em>{{ ability }}</span>
        <span><em class="ss-chip">{{ $t('输出物') }}</em>{{ output }}</span>
      </div>
    </div>
    <label v-if="moduleKey" class="ba-mhead__model" :title="$t('本模块的脚本、文案、解读都用这个模型；金额与指标由规则计算，不经过模型')">
      <small><i class="ri-cpu-line"></i>{{ $t('本模块使用模型') }}</small>
      <select :value="current" :disabled="saving" @change="onChange(($event.target as HTMLSelectElement).value)">
        <option value="">{{ $t('跟随系统默认（{p0}）', { p0: baModels.defaultLabel || $t('未配置') }) }}</option>
        <optgroup v-for="g in modelGroups()" :key="g.group" :label="g.group"><option v-for="o in g.options" :key="o.value" :value="o.value">{{ o.label }}</option></optgroup>
        <option v-if="current && !baModels.options.some((o) => o.value === current)" :value="current">{{ current }}</option>
      </select>
    </label>
  </section>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import type { BaModuleKey } from '@totalclaw/ipc-contracts';
import { useNotificationStore } from '../../stores/notification';
import { ba, baModels, baState, errorMessage, modelGroups, refreshState } from './shared';

const props = defineProps<{ moduleKey?: BaModuleKey; icon: string; title: string; ability: string; output: string }>();
const notif = useNotificationStore();
const saving = ref(false);
const current = computed(() => (props.moduleKey ? baState.value?.settings.moduleModels[props.moduleKey] || '' : ''));

async function onChange(value: string): Promise<void> {
  if (!props.moduleKey) return;
  saving.value = true;
  try {
    const models = { ...(baState.value?.settings.moduleModels || {}) };
    if (value) models[props.moduleKey] = value; else delete models[props.moduleKey];
    await ba('settings.patch', { patch: { moduleModels: models } });
    await refreshState();
  } catch (e) { notif.error(errorMessage(e)); } finally { saving.value = false; }
}
</script>

<style scoped>
.ba-mhead { display: flex; gap: 16px; align-items: flex-start; justify-content: space-between; flex-wrap: wrap; padding: 12px 14px; border: 1px solid var(--color-border); border-radius: var(--radius-6); background: var(--color-bg-card); }
.ba-mhead__main { display: grid; gap: 6px; min-width: 0; flex: 1; }
.ba-mhead h2 { margin: 0; font-size: 16px; display: flex; align-items: center; gap: 8px; }
.ba-mhead h2 i { color: var(--color-brand); font-size: 20px; }
.ba-mhead__split { display: grid; gap: 4px; font-size: 12.5px; color: var(--color-text-secondary); line-height: 1.55; }
.ba-mhead__split span { display: flex; gap: 8px; align-items: baseline; }
.ba-mhead__split em { font-style: normal; flex: 0 0 auto; }
.ba-mhead__model { display: grid; gap: 4px; min-width: 240px; }
.ba-mhead__model small { font-size: 11.5px; color: var(--color-text-secondary); display: flex; gap: 4px; align-items: center; }
.ba-mhead__model select { height: 34px; border-radius: var(--radius-3); border: 1px solid var(--color-brand); background: var(--color-bg-input); color: var(--color-text-primary); font: inherit; font-size: 12.5px; padding: 0 8px; max-width: 360px; }
</style>
