<template>
  <TModal :open="open" :title="$t('编辑成员')" icon="ri-team-line" size="md" @close="emit('close')">
    <div class="mm-pmd" data-test="mm-project-members">
      <p class="ss-muted">{{ $t('项目负责人不能移除；成员还有未完成的待办或任务时也不能移除。') }}</p>
      <PersonPicker v-model="ids" :people="people" :depts="depts" :locked="[ownerId]" :locked-hint="$t('负责人')" :max-height="300" />
      <p v-if="removed.length" class="ss-muted">{{ $t('将移除：{names}', { names: removed.join($t('、')) }) }}</p>
      <p v-if="error" class="ss-note danger" data-test="mm-pm-error"><i class="ri-error-warning-line"></i>{{ error }}</p>
    </div>
    <template #footer>
      <button type="button" class="ss-btn" @click="emit('close')">{{ $t('取消') }}</button>
      <button type="button" class="ss-btn primary" :disabled="busy || !dirty" data-test="mm-pm-save" @click="save">
        <i :class="busy ? 'ri-loader-4-line spin' : 'ri-check-line'"></i>{{ $t('保存') }}
      </button>
    </template>
  </TModal>
</template>

<script setup lang="ts">
/** 编辑项目成员（project.members）：移除有未完成事项的成员时，显示主进程返回的错误 */
import { computed, ref, watch } from 'vue';
import type { MmDept, MmPerson, MmProject } from '../../../shared/meetingMgmt/types';
import TModal from '../../components/TModal.vue';
import PersonPicker from './PersonPicker.vue';
import { errorMessage, mm } from './shared';

const props = defineProps<{ open: boolean; projectId: string; ownerId: string; memberIds: string[]; members?: MmPerson[] }>();
const emit = defineEmits<{ (e: 'close'): void; (e: 'saved', p: MmProject): void }>();

const people = ref<MmPerson[]>([]);
const depts = ref<MmDept[]>([]);
const ids = ref<string[]>([]);
const busy = ref(false);
const error = ref('');

const dirty = computed(() => ids.value.length !== props.memberIds.length || ids.value.some((id) => !props.memberIds.includes(id)));
const removed = computed(() => props.memberIds.filter((id) => !ids.value.includes(id))
  .map((id) => people.value.find((p) => p.id === id)?.name || props.members?.find((p) => p.id === id)?.name || id));

watch(() => props.open, async (open) => {
  if (!open) return;
  ids.value = [...props.memberIds];
  error.value = '';
  try {
    const r = await mm<{ depts: MmDept[]; people: MmPerson[] }>('people.list');
    // 离职的老成员 people.list 里没有：补进来，保证能看到并移除
    const extra = (props.members ?? []).filter((m) => !(r?.people ?? []).some((p) => p.id === m.id)).map((m) => ({ ...m, left: false }));
    people.value = [...(r?.people ?? []), ...extra];
    depts.value = r?.depts ?? [];
  } catch (e) {
    error.value = errorMessage(e);
  }
}, { immediate: true });

async function save(): Promise<void> {
  busy.value = true;
  error.value = '';
  try {
    const memberIds = [...new Set([props.ownerId, ...ids.value])];
    const p = await mm<MmProject>('project.members', { id: props.projectId, memberIds });
    emit('saved', p);
  } catch (e) {
    error.value = errorMessage(e);
  } finally {
    busy.value = false;
  }
}
</script>

<style scoped>
.mm-pmd { display: grid; gap: 12px; }
.mm-pmd .ss-muted { margin: 0; }
.spin { animation: mm-pmd-spin 1s linear infinite; }
@keyframes mm-pmd-spin { to { transform: rotate(360deg); } }
</style>
