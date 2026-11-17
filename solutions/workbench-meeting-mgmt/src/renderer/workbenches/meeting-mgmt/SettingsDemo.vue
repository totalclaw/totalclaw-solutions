<template>
  <div class="mm-sd" data-test="mm-demo">
    <header class="mm-sp__head">
      <div>
        <h3>{{ $t('演示数据') }}</h3>
        <p>{{ $t('一键载入演示组织（20 人、6 个部门）和 3 个项目，以及若干会议、任务、异议，与原型同名，用来演示完整闭环或培训；也可以一键清空。') }}</p>
      </div>
    </header>
    <p v-if="error" class="ss-note danger"><i class="ri-error-warning-line"></i>{{ error }}</p>
    <p class="ss-note warn"><i class="ri-alert-line"></i>{{ $t('演示数据和正式数据在同一个工作台里。正式使用前请先清空演示数据；清空不能撤销。') }}</p>

    <div class="mm-sd__cards">
      <section class="mm-sd__card">
        <i class="ri-database-2-line" aria-hidden="true"></i>
        <div>
          <strong>{{ $t('载入演示数据') }}</strong>
          <small>{{ $t('载入后右上角「当前身份」可以切到任意演示人员，看每个角色的按钮') }}</small>
        </div>
        <button type="button" class="ss-btn primary" :disabled="busy" data-test="mm-demo-load" @click="load"><i :class="busy && acting === 'load' ? 'ri-loader-4-line spin' : 'ri-download-2-line'"></i>{{ $t('载入') }}</button>
      </section>
      <section class="mm-sd__card">
        <i class="ri-delete-bin-6-line danger" aria-hidden="true"></i>
        <div>
          <strong>{{ $t('清空数据') }}</strong>
          <small>{{ $t('删除全部项目、会议（含上传的文件）、任务和通知；组织、声纹与系统设置保留') }}</small>
        </div>
        <button type="button" class="ss-btn danger" :disabled="busy" data-test="mm-demo-clear" @click="clear"><i :class="busy && acting === 'clear' ? 'ri-loader-4-line spin' : 'ri-delete-bin-line'"></i>{{ $t('清空') }}</button>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
/** 演示数据：载入 / 清空（demo.load / demo.clear，都带确认） */
import { ref } from 'vue';
import { t as i18nT } from '../../i18n';
import { useDialog } from '../../composables/useDialog';
import { useNotificationStore } from '../../stores/notification';
import { errorMessage, mm, refreshBoot } from './shared';

const emit = defineEmits<{ (e: 'changed'): void }>();

const dialog = useDialog();
const notif = useNotificationStore();
const busy = ref(false);
const acting = ref<'' | 'load' | 'clear'>('');
const error = ref('');

async function run(kind: 'load' | 'clear', okText: string): Promise<void> {
  busy.value = true;
  acting.value = kind;
  error.value = '';
  try {
    await mm(kind === 'load' ? 'demo.load' : 'demo.clear');
    await refreshBoot().catch(() => null);
    notif.success(okText);
    emit('changed');
  } catch (e) {
    error.value = errorMessage(e);
  } finally {
    busy.value = false;
    acting.value = '';
  }
}

async function load(): Promise<void> {
  const ok = await dialog.confirm({
    title: i18nT('载入演示数据'),
    message: i18nT('载入演示组织和示例项目？工作台里已有正式数据时，请先确认不会和演示数据混在一起。'),
    confirmLabel: i18nT('载入'),
  });
  if (ok) await run('load', i18nT('演示数据已载入'));
}

async function clear(): Promise<void> {
  const ok = await dialog.confirm({
    title: i18nT('清空数据'),
    message: i18nT('删除全部项目、会议（含上传的文件）、任务和通知，不能撤销；组织、声纹与系统设置保留。确定清空吗？'),
    confirmLabel: i18nT('清空'),
    danger: true,
  });
  if (ok) await run('clear', i18nT('数据已清空'));
}
</script>

<style scoped>
.mm-sd { display: grid; gap: 16px; }
.mm-sp__head { display: flex; align-items: flex-start; gap: 16px; flex-wrap: wrap; }
.mm-sp__head > div:first-child { flex: 1; min-width: 260px; display: grid; gap: 6px; }
.mm-sp__head h3 { margin: 0; font-size: 18px; }
.mm-sp__head p { margin: 0; color: var(--color-text-secondary); font-size: 13px; line-height: 1.6; max-width: 80ch; }
.mm-sd__cards { display: grid; gap: 12px; }
.mm-sd__card { display: flex; align-items: center; gap: 14px; padding: 16px 18px; border: 1px solid var(--color-border); border-radius: var(--radius-5); }
.mm-sd__card > i { font-size: 24px; color: var(--color-brand); }
.mm-sd__card > i.danger { color: var(--color-danger); }
.mm-sd__card div { flex: 1; display: grid; gap: 3px; }
.mm-sd__card strong { font-size: 14px; }
.mm-sd__card small { font-size: 12.5px; color: var(--color-text-secondary); }
.spin { animation: mm-sd-spin 1s linear infinite; }
@keyframes mm-sd-spin { to { transform: rotate(360deg); } }
</style>
