<template>
  <div class="mm-spa" data-test="mm-params">
    <header class="mm-sp__head">
      <div>
        <h3>{{ $t('参数设置') }}</h3>
        <p>{{ $t('催办与提醒周期。提醒只推消息，不改任何状态；逾期是任务上的标记，不是状态。') }}</p>
      </div>
    </header>
    <p v-if="error" class="ss-note danger"><i class="ri-error-warning-line"></i>{{ error }}</p>

    <ul class="mm-spa__list">
      <li v-for="f in FIELDS" :key="f.key">
        <div>
          <strong>{{ f.title }}</strong>
          <small>{{ f.hint }}</small>
        </div>
        <label class="mm-spa__num">
          <input v-model.number="form[f.key]" type="number" :min="f.min" :max="f.max" step="1" :aria-label="f.title" :data-test="`mm-param-${f.key}`" />
          <span>{{ f.unit }}</span>
        </label>
      </li>
    </ul>
    <p v-if="invalid" class="ss-note warn"><i class="ri-alert-line"></i>{{ invalid }}</p>

    <div class="ss-actions">
      <button type="button" class="ss-btn primary" :disabled="busy || !dirty || !!invalid" data-test="mm-params-save" @click="save"><i :class="busy ? 'ri-loader-4-line spin' : 'ri-save-line'"></i>{{ $t('保存') }}</button>
      <button v-if="dirty" type="button" class="ss-link" @click="reset">{{ $t('撤销修改') }}</button>
      <button type="button" class="ss-link" @click="defaults">{{ $t('恢复默认') }}</button>
    </div>
  </div>
</template>

<script setup lang="ts">
/** 参数设置：发言确认超时（小时）、到期提前提醒（天）、进度跟踪周期（天）、周报周期（天） */
import { computed, reactive, ref, watch } from 'vue';
import { MM_DEFAULT_SETTINGS, type MmSettings } from '../../../shared/meetingMgmt/types';
import { t as i18nT } from '../../i18n';
import { useNotificationStore } from '../../stores/notification';
import { errorMessage, mm } from './shared';

type Key = 'confirmTimeoutHours' | 'dueRemindDays' | 'trackCycleDays' | 'reportCycleDays';
const FIELDS: Array<{ key: Key; title: string; hint: string; unit: string; min: number; max: number }> = [
  { key: 'confirmTimeoutHours', title: i18nT('发言确认超时'), hint: i18nT('发言人超过这么久没确认，就催办一次（不改状态）'), unit: i18nT('小时'), min: 1, max: 720 },
  { key: 'dueRemindDays', title: i18nT('到期提前提醒'), hint: i18nT('任务截止前几天提醒部门负责人'), unit: i18nT('天'), min: 0, max: 30 },
  { key: 'trackCycleDays', title: i18nT('进度跟踪周期'), hint: i18nT('多久提醒部门负责人更新一次进度'), unit: i18nT('天'), min: 1, max: 90 },
  { key: 'reportCycleDays', title: i18nT('周报周期'), hint: i18nT('多久给任务负责人和项目负责人发一份进度汇总报告'), unit: i18nT('天'), min: 1, max: 90 },
];

const props = defineProps<{ settings: MmSettings }>();
const emit = defineEmits<{ (e: 'saved', s?: MmSettings): void }>();

const notif = useNotificationStore();
const busy = ref(false);
const error = ref('');
const form = reactive<Record<Key, number>>({ confirmTimeoutHours: 24, dueRemindDays: 1, trackCycleDays: 7, reportCycleDays: 7 });

const dirty = computed(() => FIELDS.some((f) => Number(form[f.key]) !== props.settings[f.key]));
const invalid = computed(() => {
  for (const f of FIELDS) {
    const v = Number(form[f.key]);
    if (!Number.isInteger(v) || v < f.min || v > f.max) return i18nT('「{t}」要填 {a}～{b} 之间的整数', { t: f.title, a: f.min, b: f.max });
  }
  return '';
});

function reset(): void {
  for (const f of FIELDS) form[f.key] = props.settings[f.key];
}
function defaults(): void {
  for (const f of FIELDS) form[f.key] = MM_DEFAULT_SETTINGS[f.key];
}
watch(() => props.settings, reset, { immediate: true });

async function save(): Promise<void> {
  busy.value = true;
  error.value = '';
  try {
    const patch = Object.fromEntries(FIELDS.map((f) => [f.key, Number(form[f.key])]));
    const r = await mm<MmSettings>('settings.save', { patch });
    notif.success(i18nT('参数已保存'));
    emit('saved', r);
  } catch (e) {
    error.value = errorMessage(e);
  } finally {
    busy.value = false;
  }
}
</script>

<style scoped>
.mm-spa { display: grid; gap: 16px; }
.mm-sp__head { display: flex; align-items: flex-start; gap: 16px; flex-wrap: wrap; }
.mm-sp__head > div:first-child { flex: 1; min-width: 260px; display: grid; gap: 6px; }
.mm-sp__head h3 { margin: 0; font-size: 18px; }
.mm-sp__head p { margin: 0; color: var(--color-text-secondary); font-size: 13px; line-height: 1.6; }
.mm-spa__list { list-style: none; margin: 0; padding: 0; display: grid; border: 1px solid var(--color-border); border-radius: var(--radius-5); }
.mm-spa__list li { display: flex; align-items: center; gap: 16px; padding: 14px 18px; border-bottom: 1px solid var(--color-border-subtle); }
.mm-spa__list li:last-child { border-bottom: none; }
.mm-spa__list li > div { flex: 1; display: grid; gap: 3px; }
.mm-spa__list strong { font-size: 14px; }
.mm-spa__list small { font-size: 12.5px; color: var(--color-text-secondary); }
.mm-spa__num { display: inline-flex; align-items: center; gap: 8px; font-size: 13px; color: var(--color-text-secondary); }
.mm-spa__num input { width: 90px; height: 34px; border-radius: var(--radius-3); border: 1px solid var(--color-border); background: var(--color-bg-input); color: var(--color-text-primary); font: inherit; font-size: 14px; text-align: right; padding: 0 10px; font-variant-numeric: tabular-nums; }
.mm-spa__num input:focus { outline: none; border-color: var(--color-brand); }
.spin { animation: mm-spa-spin 1s linear infinite; }
@keyframes mm-spa-spin { to { transform: rotate(360deg); } }
</style>
