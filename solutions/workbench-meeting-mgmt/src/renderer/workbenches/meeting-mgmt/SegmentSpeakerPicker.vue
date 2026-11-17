<template>
  <div class="mm-ssp" :data-test="`mm-seg-speaker-${segmentId}`">
    <PersonSearchSelect
      v-model="pickValue"
      class="mm-ssp__select"
      :people="people"
      :extras="speakers"
      :extras-label="$t('本场发言人')"
      :exclude="takenIds"
      :aria-label="$t('这段的发言人')"
      :data-test="`mm-seg-speaker-pick-${segmentId}`"
    />
    <button type="button" class="ss-btn sm primary" :disabled="busy || !changed" :data-test="`mm-seg-speaker-save-${segmentId}`" @click="save">
      <i :class="busy ? 'ri-loader-4-line spin' : 'ri-check-line'"></i>{{ $t('改给这个人') }}
    </button>
    <button type="button" class="ss-link" @click="emit('done', false)">{{ $t('取消') }}</button>
    <p v-if="error" class="ss-note danger"><i class="ri-error-warning-line"></i>{{ error }}</p>
  </div>
</template>

<script setup lang="ts">
/** 会议详情 · 逐段改发言人（主持人，定稿前）：改给本场已有的发言人，或任意一位员工（meeting.segment.speaker） */
import { computed, onMounted, ref } from 'vue';
import { errorMessage, mm } from './shared';
import { loadPeople, speakerName, type MmMeetingDetail, type MmPeople } from './meetingUi';
import PersonSearchSelect, { type PersonPickExtra } from './PersonSearchSelect.vue';

const props = defineProps<{ detail: MmMeetingDetail; segmentId: string }>();
const emit = defineEmits<{ (e: 'done', changed: boolean): void }>();

const m = computed(() => props.detail.meeting);
const current = computed(() => m.value.segments.find((s) => s.id === props.segmentId)?.speakerLabel || '');
const pick = ref(`label:${current.value}`);
const busy = ref(false);
const error = ref('');
const people = ref<MmPeople>({ depts: [], people: [] });

/** 本场已有的发言人（按标签选；值 = label:S1） */
const speakers = computed<PersonPickExtra[]>(() => m.value.speakers.map((s) => ({
  value: `label:${s.label}`, label: s.personId ? `${speakerName(props.detail, s.label)}（${s.label}）` : s.label,
  sub: s.personId ? props.detail.names[s.personId]?.deptName || '' : '',
})));
/** 本场已经有标签的人不在员工里重复列 */
const takenIds = computed(() => m.value.speakers.map((s) => s.personId).filter(Boolean) as string[]);
/** 选人框的值：发言人标签原样（label:S1），员工是 personId；内部 pick 统一成 label:… / person:… */
const pickValue = computed({
  get: () => (pick.value.startsWith('person:') ? pick.value.slice('person:'.length) : pick.value),
  set: (v: string) => { pick.value = !v ? '' : v.startsWith('label:') ? v : `person:${v}`; },
});
const changed = computed(() => pick.value && pick.value !== `label:${current.value}`);

async function save(): Promise<void> {
  if (!changed.value || busy.value) return;
  const [kind, value] = [pick.value.slice(0, pick.value.indexOf(':')), pick.value.slice(pick.value.indexOf(':') + 1)];
  busy.value = true;
  error.value = '';
  try {
    await mm('meeting.segment.speaker', { id: m.value.id, segmentId: props.segmentId, ...(kind === 'label' ? { label: value } : { personId: value }) });
    emit('done', true);
  } catch (e) {
    error.value = errorMessage(e);
  } finally {
    busy.value = false;
  }
}

onMounted(async () => {
  try { people.value = await loadPeople(); } catch (e) { error.value = errorMessage(e); }
});
</script>

<style scoped>
.mm-ssp { display: flex; gap: 8px; align-items: center; flex-wrap: wrap; margin-top: 4px; }
.mm-ssp__select { flex: 0 1 300px; max-width: 100%; }
.mm-ssp .ss-note { flex-basis: 100%; margin: 0; }
.spin { animation: mm-ssp-spin 1s linear infinite; }
@keyframes mm-ssp-spin { to { transform: rotate(360deg); } }
</style>
