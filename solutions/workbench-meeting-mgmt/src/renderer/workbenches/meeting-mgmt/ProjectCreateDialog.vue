<template>
  <TModal :open="open" :title="$t('新建项目')" icon="ri-folder-add-line" size="lg" @close="emit('close')">
    <div class="mm-pcd" data-test="mm-project-create">
      <label class="ss-field"><span>{{ $t('项目名称') }}</span><input v-model="form.name" type="text" maxlength="60" :placeholder="$t('如：A2 量产导入项目')" data-test="mm-pc-name" /></label>
      <label class="ss-field"><span>{{ $t('项目说明') }}</span><textarea v-model="form.desc" rows="3" :placeholder="$t('项目目标、范围、关键节点')" data-test="mm-pc-desc"></textarea></label>
      <div class="mm-pcd__cols">
        <div class="mm-pcd__f">
          <span>{{ $t('项目负责人') }}</span>
          <PersonPicker v-model="form.ownerId" :people="people" :depts="depts" :multiple="false" :max-height="240" />
        </div>
        <div class="mm-pcd__f">
          <span>{{ $t('项目成员（{n} 人）', { n: memberIds.length }) }}</span>
          <PersonPicker v-model="form.memberIds" :people="people" :depts="depts" :locked="form.ownerId ? [form.ownerId] : []" :locked-hint="$t('负责人')" :max-height="240" />
        </div>
      </div>
      <p class="ss-muted">{{ $t('项目负责人自动成为成员；之后会议的主持人、参会人、任务负责人和接收任务的部门负责人也会自动加入。') }}</p>
      <p v-if="error" class="ss-note danger"><i class="ri-error-warning-line"></i>{{ error }}</p>
    </div>
    <template #footer>
      <button type="button" class="ss-btn" @click="emit('close')">{{ $t('取消') }}</button>
      <button type="button" class="ss-btn primary" :disabled="busy || !form.name.trim() || !form.ownerId" data-test="mm-pc-submit" @click="submit">
        <i :class="busy ? 'ri-loader-4-line spin' : 'ri-check-line'"></i>{{ $t('创建项目') }}
      </button>
    </template>
  </TModal>
</template>

<script setup lang="ts">
/** 新建项目弹窗：名称、说明、项目负责人、项目成员（project.create） */
import { computed, reactive, ref, watch } from 'vue';
import type { MmDept, MmPerson, MmProject } from '../../../shared/meetingMgmt/types';
import TModal from '../../components/TModal.vue';
import PersonPicker from './PersonPicker.vue';
import { errorMessage, mm, mmBoot } from './shared';

const props = defineProps<{ open: boolean }>();
const emit = defineEmits<{ (e: 'close'): void; (e: 'created', p: MmProject): void }>();

const people = ref<MmPerson[]>([]);
const depts = ref<MmDept[]>([]);
const busy = ref(false);
const error = ref('');
const form = reactive({ name: '', desc: '', ownerId: '', memberIds: [] as string[] });

/** 提交的成员 = 选中的 + 负责人 */
const memberIds = computed(() => [...new Set([...(form.ownerId ? [form.ownerId] : []), ...form.memberIds])]);

watch(() => props.open, async (open) => {
  if (!open) return;
  const me = mmBoot.value?.me.person?.id || '';
  Object.assign(form, { name: '', desc: '', ownerId: me, memberIds: me ? [me] : [] });
  error.value = '';
  try {
    const r = await mm<{ depts: MmDept[]; people: MmPerson[] }>('people.list');
    people.value = r?.people ?? [];
    depts.value = r?.depts ?? [];
  } catch (e) {
    error.value = errorMessage(e);
  }
}, { immediate: true });

// 换了负责人：新负责人进成员
watch(() => form.ownerId, (id) => {
  if (id && !form.memberIds.includes(id)) form.memberIds = [id, ...form.memberIds];
});

async function submit(): Promise<void> {
  busy.value = true;
  error.value = '';
  try {
    const p = await mm<MmProject>('project.create', { name: form.name.trim(), desc: form.desc.trim(), ownerId: form.ownerId, memberIds: memberIds.value });
    emit('created', p);
  } catch (e) {
    error.value = errorMessage(e);
  } finally {
    busy.value = false;
  }
}
</script>

<style scoped>
.mm-pcd { display: grid; gap: 14px; }
.mm-pcd__cols { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 240px), 1fr)); gap: 14px; }
.mm-pcd .ss-muted { margin: 0; }
.mm-pcd__f { display: grid; gap: 6px; align-content: start; font-size: 12.5px; }
.mm-pcd__f > span { color: var(--color-text-secondary); }
.spin { animation: mm-pcd-spin 1s linear infinite; }
@keyframes mm-pcd-spin { to { transform: rotate(360deg); } }
</style>
