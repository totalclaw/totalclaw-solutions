<template>
  <div class="mm-sr" data-test="mm-roles">
    <header class="mm-sp__head">
      <div>
        <h3>{{ $t('角色权限') }}</h3>
        <p>{{ $t('菜单对所有人相同，按钮按角色显示。系统级角色只有两类：管理员（系统设置、切换当前身份）和可新建项目的人；项目负责人、主持人、发言人、任务负责人、部门负责人都按项目 / 会议自动产生。') }}</p>
      </div>
    </header>
    <p v-if="error" class="ss-note danger"><i class="ri-error-warning-line"></i>{{ error }}</p>

    <div class="mm-sr__cols">
      <section class="mm-sr__card">
        <h4>{{ $t('管理员（{n}）', { n: form.adminIds.length }) }}</h4>
        <p class="ss-muted">{{ $t('管理员可以进入系统设置、代办与演示时切换当前身份，也可以新建项目。至少保留一位。') }}</p>
        <PersonPicker v-model="form.adminIds" :people="people" :depts="depts" :max-height="260" />
      </section>
      <section class="mm-sr__card">
        <h4>{{ $t('可新建项目的人（{n}）', { n: form.projectCreatorIds.length }) }}</h4>
        <p class="ss-muted">{{ $t('除管理员外，还有谁可以新建项目；建项目时指定的项目负责人不需要在这里。') }}</p>
        <PersonPicker v-model="form.projectCreatorIds" :people="people" :depts="depts" :max-height="260" />
      </section>
    </div>
    <p v-if="removingSelf" class="ss-note warn"><i class="ri-alert-line"></i>{{ $t('你把自己从管理员里去掉了：保存后将无法再进入系统设置。') }}</p>
    <div class="ss-actions">
      <button type="button" class="ss-btn primary" :disabled="busy || !dirty || !form.adminIds.length" data-test="mm-roles-save" @click="save"><i :class="busy ? 'ri-loader-4-line spin' : 'ri-save-line'"></i>{{ $t('保存') }}</button>
      <button v-if="dirty" type="button" class="ss-link" @click="reset">{{ $t('撤销修改') }}</button>
    </div>
  </div>
</template>

<script setup lang="ts">
/** 角色权限：管理员与可创建项目人员（settings.save） */
import { computed, reactive, ref, watch } from 'vue';
import type { MmDept, MmPerson, MmSettings } from '../../../shared/meetingMgmt/types';
import { t as i18nT } from '../../i18n';
import { useDialog } from '../../composables/useDialog';
import { useNotificationStore } from '../../stores/notification';
import PersonPicker from './PersonPicker.vue';
import { errorMessage, mm, mmBoot } from './shared';

const props = defineProps<{ settings: MmSettings; people: MmPerson[]; depts: MmDept[] }>();
const emit = defineEmits<{ (e: 'saved', s?: MmSettings): void }>();

const dialog = useDialog();
const notif = useNotificationStore();
const busy = ref(false);
const error = ref('');
const form = reactive({ adminIds: [] as string[], projectCreatorIds: [] as string[] });

const same = (a: string[], b: string[]) => a.length === b.length && a.every((x) => b.includes(x));
const dirty = computed(() => !same(form.adminIds, props.settings.adminIds) || !same(form.projectCreatorIds, props.settings.projectCreatorIds));
const myId = computed(() => mmBoot.value?.me.person?.id || '');
const removingSelf = computed(() => !!myId.value && props.settings.adminIds.includes(myId.value) && !form.adminIds.includes(myId.value));

function reset(): void {
  form.adminIds = [...props.settings.adminIds];
  form.projectCreatorIds = [...props.settings.projectCreatorIds];
}
watch(() => props.settings, reset, { immediate: true });

async function save(): Promise<void> {
  if (removingSelf.value && !(await dialog.confirm({ title: i18nT('去掉自己的管理员'), message: i18nT('保存后你将无法再进入系统设置，确定吗？'), danger: true }))) return;
  busy.value = true;
  error.value = '';
  try {
    const r = await mm<MmSettings>('settings.save', { patch: { adminIds: form.adminIds, projectCreatorIds: form.projectCreatorIds } });
    notif.success(i18nT('角色权限已保存'));
    emit('saved', r);
  } catch (e) {
    error.value = errorMessage(e);
  } finally {
    busy.value = false;
  }
}
</script>

<style scoped>
.mm-sr { display: grid; gap: 16px; }
.mm-sp__head { display: flex; align-items: flex-start; gap: 16px; flex-wrap: wrap; }
.mm-sp__head > div:first-child { flex: 1; min-width: 260px; display: grid; gap: 6px; }
.mm-sp__head h3 { margin: 0; font-size: 18px; }
.mm-sp__head p { margin: 0; color: var(--color-text-secondary); font-size: 13px; line-height: 1.6; max-width: 80ch; }
.mm-sr__cols { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 280px), 1fr)); gap: 16px; }
.mm-sr__card { display: grid; gap: 8px; align-content: start; padding: 14px 16px; border: 1px solid var(--color-border); border-radius: var(--radius-5); }
.mm-sr__card h4 { margin: 0; font-size: 14px; }
.mm-sr__card .ss-muted { margin: 0; }
.spin { animation: mm-sr-spin 1s linear infinite; }
@keyframes mm-sr-spin { to { transform: rotate(360deg); } }
</style>
