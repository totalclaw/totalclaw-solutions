<template>
  <section class="mm-sa" :class="{ quiet: correcting }" data-test="mm-speaker-assign">
    <header class="mm-sa__head">
      <h4>{{ correcting ? $t('更正发言人') : $t('指认发言人') }}</h4>
      <span class="ss-muted">{{ correcting ? $t('声纹认错了：试听后整组改给正确的人；只是个别段认错，在下面的纪要里逐段改') : unknown.length ? $t('{n} 位没认出来 · 试听片段后选人', { n: unknown.length }) : $t('发言人都已认出') }}</span>
      <span class="mm-grow"></span>
      <button v-if="correcting" type="button" class="ss-link" :aria-expanded="open" data-test="mm-speaker-toggle" @click="open = !open">{{ open ? $t('收起') : $t('展开') }}<i :class="open ? 'ri-arrow-up-s-line' : 'ri-arrow-down-s-line'"></i></button>
    </header>
    <p v-if="!detail.my.isHost && !correcting" class="ss-note"><i class="ri-time-line"></i>{{ $t('等待主持人 {name} 指认发言人', { name: hostName }) }}</p>

    <template v-if="open">
    <article v-for="s in rows" :key="s.label" class="mm-sa__row" :class="{ unknown: !s.personId }" :data-test="`mm-speaker-${s.label}`">
      <div class="mm-sa__who">
        <span class="mm-sa__label">{{ s.label }}</span>
        <small>{{ $t('{n} 段 · 约 {t}', { n: s.count, t: fmtClock(s.seconds) }) }}</small>
      </div>
      <div class="mm-sa__sample">
        <p v-for="(x, i) in s.samples" :key="i">{{ x }}</p>
        <audio v-if="clips[s.label]" :src="clips[s.label]" controls autoplay preload="auto" class="mm-sa__audio"></audio>
      </div>
      <div class="mm-sa__ops">
        <button type="button" class="ss-btn sm" :disabled="clipBusy === s.label" :data-test="`mm-speaker-clip-${s.label}`" @click="listen(s.label)">
          <i :class="clipBusy === s.label ? 'ri-loader-4-line spin' : 'ri-play-circle-line'"></i>{{ $t('试听') }}
        </button>
        <template v-if="s.personId && editing !== s.label">
          <span class="ss-chip ok">{{ nameOf(s.personId) }}<template v-if="s.matchedBy === 'voiceprint' && s.score != null"> · {{ $t('声纹 {p}', { p: s.score.toFixed(2) }) }}</template><template v-else-if="s.matchedBy === 'nickname'"> · {{ $t('昵称匹配') }}</template></span>
          <button v-if="detail.my.isHost && canAssign" type="button" class="ss-link" @click="startEdit(s.label, s.personId)">{{ $t('更正') }}</button>
        </template>
        <template v-else-if="detail.my.isHost && canAssign">
          <PersonSearchSelect
            :model-value="picks[s.label] || ''"
            @update:model-value="(v: string) => (picks[s.label] = v)"
            class="mm-sa__select"
            :people="people"
            :pinned="m.attendeeIds"
            :pinned-label="$t('本场参会人')"
            :names="detail.names"
            :hint="(id: string) => (takenBy(id, s.label) ? $t('（已指认给 {l}）', { l: takenBy(id, s.label) }) : '')"
            :aria-label="$t('选择发言人…')"
            :data-test="`mm-speaker-pick-${s.label}`"
          />
          <button type="button" class="ss-btn sm primary" :disabled="!picks[s.label] || busy === s.label" :data-test="`mm-speaker-save-${s.label}`" @click="assign(s.label)">
            <i :class="busy === s.label ? 'ri-loader-4-line spin' : 'ri-check-line'"></i>{{ $t('确认') }}
          </button>
          <button v-if="editing === s.label" type="button" class="ss-link" @click="editing = ''">{{ $t('取消') }}</button>
        </template>
        <span v-else class="ss-chip warn">{{ $t('未识别') }}</span>
      </div>
    </article>
    <p v-if="error" class="ss-note danger"><i class="ri-error-warning-line"></i>{{ error }}</p>
    <small class="ss-muted">{{ correcting ? $t('改给别人后，新的发言人要重新确认，其他人的确认保留。') : $t('只和本场参会人比对声纹；没来得及加进参会人的人也能直接选。全部指认完自动进入发言确认，系统通知每位发言人核对本人发言。') }}</small>
    </template>
  </section>
</template>

<script setup lang="ts">
/**
 * 会议详情 · 指认发言人：未识别发言人试听片段（meeting.speaker.clip）后选人（meeting.speaker.assign）。
 * 待确认 / 终审时给主持人一个默认收起的「更正发言人」（声纹认错了整组改）。可选本场参会人，也可选其他员工。
 */
import { computed, onMounted, reactive, ref } from 'vue';
import { t as i18nT } from '../../i18n';
import { errorMessage, fmtClock, mm } from './shared';
import { loadPeople, type MmMeetingDetail, type MmPeople } from './meetingUi';
import PersonSearchSelect from './PersonSearchSelect.vue';

const props = defineProps<{ detail: MmMeetingDetail }>();
const emit = defineEmits<{ (e: 'changed'): void }>();

const clips = reactive<Record<string, string>>({});
const picks = reactive<Record<string, string>>({});
const clipBusy = ref('');
const busy = ref('');
const editing = ref('');
const error = ref('');

const m = computed(() => props.detail.meeting);
/** 待确认 / 终审：更正模式（默认收起） */
const correcting = computed(() => m.value.status !== 'pending_assign');
const open = ref(!correcting.value);
const canAssign = computed(() => ['pending_assign', 'pending_confirm', 'pending_review'].includes(m.value.status));
const people = ref<MmPeople>({ depts: [], people: [] });
onMounted(async () => { try { people.value = await loadPeople(); } catch { /* 拿不到全员名单就只列参会人 */ } });
const hostName = computed(() => props.detail.names[m.value.hostId]?.name || '');
const nameOf = (id: string) => props.detail.names[id]?.name || id;

/** 未识别的排前面；每位给两句样本话帮主持人认人 */
const rows = computed(() => {
  const list = m.value.speakers.map((s) => {
    const segs = m.value.segments.filter((x) => x.speakerLabel === s.label).sort((a, b) => a.start - b.start);
    const samples = segs.filter((x) => x.text.trim()).slice(0, 2).map((x) => (x.text.length > 60 ? `${x.text.slice(0, 60)}…` : x.text));
    const seconds = segs.reduce((n, x) => n + Math.max(0, x.end - x.start), 0);
    return { ...s, count: segs.length, seconds, samples };
  });
  return [...list.filter((s) => !s.personId), ...list.filter((s) => s.personId)];
});
const unknown = computed(() => rows.value.filter((s) => !s.personId));

function takenBy(personId: string, exceptLabel: string): string {
  return m.value.speakers.find((s) => s.personId === personId && s.label !== exceptLabel)?.label || '';
}
function startEdit(label: string, personId?: string): void {
  editing.value = label;
  picks[label] = personId || '';
}
async function listen(label: string): Promise<void> {
  if (clips[label]) { // 已经有了：重新挂一次让它从头播
    const url = clips[label];
    clips[label] = '';
    setTimeout(() => { clips[label] = url; }, 0);
    return;
  }
  clipBusy.value = label;
  error.value = '';
  try {
    const r = await mm<{ dataUrl: string }>('meeting.speaker.clip', { id: m.value.id, label });
    if (!r?.dataUrl) throw new Error(i18nT('这位发言人没有可试听的片段'));
    clips[label] = r.dataUrl;
  } catch (e) {
    error.value = errorMessage(e);
  } finally {
    clipBusy.value = '';
  }
}
async function assign(label: string): Promise<void> {
  const personId = picks[label];
  if (!personId) return;
  busy.value = label;
  error.value = '';
  try {
    await mm('meeting.speaker.assign', { id: m.value.id, label, personId });
    editing.value = '';
    emit('changed');
  } catch (e) {
    error.value = errorMessage(e);
  } finally {
    busy.value = '';
  }
}
</script>

<style scoped>
.mm-sa { display: grid; gap: 10px; padding: 16px 18px; border: 1px solid color-mix(in srgb, var(--color-warning) 40%, var(--color-border)); border-radius: var(--radius-5); background: color-mix(in srgb, var(--color-warning) 5%, var(--color-bg-card)); }
.mm-sa__head { display: flex; align-items: baseline; gap: 10px; flex-wrap: wrap; }
.mm-sa__head h4 { margin: 0; font-size: 15px; }
.mm-sa.quiet { border-color: var(--color-border); background: var(--color-bg-card); }
.mm-sa__head .ss-link { display: inline-flex; align-items: center; gap: 2px; }
.mm-grow { flex: 1; }
.mm-sa__row { display: grid; grid-template-columns: 110px minmax(0, 1fr) auto; gap: 12px; align-items: center; padding: 10px 12px; border-radius: var(--radius-4); background: var(--color-bg-card); border: 1px solid var(--color-border); }
.mm-sa__row.unknown { border-color: color-mix(in srgb, var(--color-warning) 50%, var(--color-border)); }
@media (max-width: 900px) { .mm-sa__row { grid-template-columns: minmax(0, 1fr); } }
.mm-sa__who { display: grid; gap: 2px; }
.mm-sa__label { font-weight: 800; font-size: 15px; }
.mm-sa__who small { color: var(--color-text-secondary); font-size: 11.5px; }
.mm-sa__sample { display: grid; gap: 4px; min-width: 0; }
.mm-sa__sample p { margin: 0; padding-inline-start: 8px; border-inline-start: 2px solid var(--color-border); font-size: 12.5px; color: var(--color-text-secondary); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.mm-sa__audio { height: 32px; width: 100%; max-width: 360px; }
.mm-sa__ops { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; justify-content: flex-end; }
.mm-sa__select { flex: 0 1 280px; min-width: 200px; }
.spin { animation: mm-spin 1s linear infinite; }
@keyframes mm-spin { to { transform: rotate(360deg); } }
</style>
