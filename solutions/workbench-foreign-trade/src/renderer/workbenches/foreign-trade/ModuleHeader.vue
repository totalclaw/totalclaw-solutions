<template>
  <section class="ft-mhead">
    <div class="ft-mhead__main">
      <h2><i :class="meta.icon"></i>{{ meta.title }}</h2>
      <div class="ft-mhead__split">
        <span><em class="ss-chip brand">{{ $t('数字员工完成') }}</em>{{ meta.agentDoes }}</span>
        <span><em class="ss-chip">{{ $t('业务人员负责') }}</em>{{ meta.humanDoes }}</span>
      </div>
      <div v-if="skills.length" class="ft-mhead__skills">
        <small><i class="ri-book-open-line"></i>{{ $t('相关技能') }}</small>
        <button v-for="s in skills" :key="s" type="button" class="ss-chip" :disabled="opening" :title="$t('和外贸专家开一个对话，用技能 {p0} 来做', { p0: s })" @click="openSkill(s)">{{ s }}</button>
      </div>
    </div>
    <label class="ft-mhead__model" :title="$t('本模块所有生成、提取、分类都用这个模型；结果上会标明是哪个模型产出的')">
      <small><i class="ri-cpu-line"></i>{{ $t('本模块使用模型') }}</small>
      <select :value="current" :disabled="saving" @change="onChange(($event.target as HTMLSelectElement).value)">
        <option value="">{{ $t('跟随系统默认（{p0}）', { p0: ftModels.defaultLabel || $t('未配置') }) }}</option>
        <optgroup v-for="g in modelGroups()" :key="g.group" :label="g.group"><option v-for="o in g.options" :key="o.value" :value="o.value">{{ o.label }}</option></optgroup>
        <option v-if="current && !ftModels.options.some((o) => o.value === current)" :value="current">{{ current }}</option>
      </select>
    </label>
  </section>
</template>

<script setup lang="ts">
/**
 * 模块头：写清这个模块里数字员工做什么、人做什么，并明确本模块用哪个模型。
 * 「相关技能」：点一个技能就和该模块的外贸专家开单聊，草稿里写明用哪个技能，人补充后再发（登记见 shared/foreignTradeSkills）。
 */
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useNotificationStore } from '../../stores/notification';
import { t as i18nT } from '../../i18n';
import { FT_MODULE_ROLE, FT_MODULE_SKILLS } from '../../../shared/foreignTradeSkills';
import { ft, ftModels, modelGroups, ftState, errorMessage, refreshState, type FtModuleMeta } from './shared';

const props = defineProps<{ meta: FtModuleMeta }>();
const notif = useNotificationStore();
const router = useRouter();
const saving = ref(false);
const opening = ref(false);
const current = computed(() => ftState.value?.settings.moduleModels[props.meta.key] || '');
const skills = computed(() => FT_MODULE_SKILLS[props.meta.key] || []);

async function openSkill(skill: string): Promise<void> {
  opening.value = true;
  try {
    const api = (window as any).electronAPI;
    const conv = await api.conversation.create({ kind: 'single', members: [FT_MODULE_ROLE[props.meta.key]], title: i18nT('外贸 · {p0}', { p0: props.meta.title }) });
    await router.push({ path: '/conversations', query: { id: conv.id, draft: i18nT('请用技能 {p0}（技能库 foreign-trade 分类）帮我：', { p0: skill }) } });
  } catch (e) {
    notif.error(errorMessage(e));
  } finally {
    opening.value = false;
  }
}

async function onChange(value: string): Promise<void> {
  saving.value = true;
  try {
    const models = { ...(ftState.value?.settings.moduleModels || {}), [props.meta.key]: value };
    if (!value) delete (models as any)[props.meta.key];
    await ft('settings.patch', { patch: { moduleModels: models } });
    await refreshState();
  } catch (e) {
    notif.error(errorMessage(e));
  } finally {
    saving.value = false;
  }
}
</script>

<style scoped>
.ft-mhead { display: flex; gap: 16px; align-items: flex-start; justify-content: space-between; flex-wrap: wrap; padding: 12px 14px; border: 1px solid var(--color-border); border-radius: var(--radius-6); background: var(--color-bg-card); }
.ft-mhead__main { display: grid; gap: 6px; min-width: 0; flex: 1; }
.ft-mhead h2 { margin: 0; font-size: 16px; display: flex; align-items: center; gap: 8px; }
.ft-mhead h2 i { color: var(--color-brand); font-size: 20px; }
.ft-mhead__split { display: grid; gap: 4px; font-size: 12.5px; color: var(--color-text-secondary); }
.ft-mhead__split span { display: flex; gap: 8px; align-items: baseline; }
.ft-mhead__split em { font-style: normal; flex: 0 0 auto; }
.ft-mhead__skills { display: flex; flex-wrap: wrap; gap: 6px; align-items: center; font-size: var(--font-size-sm); }
.ft-mhead__skills small { color: var(--color-text-secondary); display: flex; gap: 4px; align-items: center; }
.ft-mhead__skills button { cursor: pointer; border: 1px solid var(--color-border); font: inherit; font-size: 11.5px; }
.ft-mhead__skills button:hover:not(:disabled) { border-color: var(--color-brand); color: var(--color-brand); }
.ft-mhead__model { display: grid; gap: 4px; min-width: 240px; }
.ft-mhead__model small { font-size: 11.5px; color: var(--color-text-secondary); display: flex; gap: 4px; align-items: center; }
.ft-mhead__model select { height: 34px; border-radius: var(--radius-3); border: 1px solid var(--color-brand); background: var(--color-bg-input); color: var(--color-text-primary); font: inherit; font-size: 12.5px; padding: 0 8px; max-width: 360px; }
</style>
