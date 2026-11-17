<template>
  <section class="mm-side" data-test="mm-decisions">
    <h5>
      {{ $t('AI 识别的决议事项') }} <span>{{ m.decisions.length }}</span>
      <span class="mm-grow"></span>
      <template v-if="(editable || fixable) && !editing">
        <button type="button" class="ss-link" :disabled="!!busy" data-test="mm-minutes-edit" @click="startEdit"><i class="ri-pencil-line"></i>{{ $t('编辑') }}</button>
        <button v-if="editable" type="button" class="ss-link" :disabled="!!busy || !m.segments.length" data-test="mm-minutes-reorganize" @click="reorganize"><i :class="busy === 'ai' ? 'ri-loader-4-line spin' : 'ri-sparkling-line'"></i>{{ $t('AI 重新整理') }}</button>
      </template>
    </h5>

    <template v-if="!editing">
      <p v-if="!m.decisions.length" class="ss-muted">{{ isPreFinal ? $t('处理完成后在这里列出会上形成的决议') : $t('没有识别到决议事项') }}</p>
      <ol v-else class="mm-decisions">
        <li v-for="(x, i) in m.decisions" :key="x.id"><span>{{ i + 1 }}</span>{{ x.text }}</li>
      </ol>
      <template v-if="m.summaryLines.length && (!isPreFinal || editable)">
        <h6>{{ isPreFinal ? $t('纪要摘要（草稿）') : $t('纪要摘要') }}</h6>
        <ul class="mm-summary"><li v-for="(l, i) in m.summaryLines" :key="i">{{ l }}</li></ul>
      </template>
      <small v-if="editable" class="ss-muted">{{ $t('AI 初稿，定稿前请核对：决议会拆成任务，摘要会进纪要通知。发言人改过后可「AI 重新整理」。') }}</small>
      <small v-else-if="isPreFinal" class="ss-muted">{{ $t('终审通过后可选择「生成任务」或「无需生成任务」') }}</small>
      <small v-else-if="fixable" class="ss-muted">{{ $t('纪要已定稿：发现错字可以编辑修正，已拆出的任务不跟着变。') }}</small>
    </template>

    <div v-else class="mm-mde" data-test="mm-minutes-editor">
      <div v-for="(x, i) in draft.decisions" :key="x.key" class="mm-mde__row">
        <span class="mm-mde__no">{{ i + 1 }}</span>
        <textarea v-model="x.text" rows="2" :aria-label="$t('决议 {n}', { n: i + 1 })" :data-test="`mm-decision-input-${i}`"></textarea>
        <button type="button" class="mm-mde__del" :aria-label="$t('删除这条决议')" @click="draft.decisions.splice(i, 1)"><i class="ri-close-line"></i></button>
      </div>
      <button type="button" class="ss-link" data-test="mm-decision-add" @click="addDecision"><i class="ri-add-line"></i>{{ $t('加一条决议') }}</button>
      <h6>{{ $t('纪要摘要（最多 3 行）') }}</h6>
      <input v-for="(_, i) in draft.summary" :key="i" v-model="draft.summary[i]" type="text" maxlength="200" :aria-label="$t('摘要第 {n} 行', { n: i + 1 })" :data-test="`mm-summary-input-${i}`" />
      <div class="ss-actions">
        <button type="button" class="ss-btn sm primary" :disabled="!!busy" data-test="mm-minutes-save" @click="save"><i :class="busy === 'save' ? 'ri-loader-4-line spin' : 'ri-check-line'"></i>{{ $t('保存') }}</button>
        <button type="button" class="ss-link" :disabled="!!busy" @click="editing = false">{{ $t('取消') }}</button>
      </div>
    </div>
    <p v-if="note" class="ss-note"><i class="ri-information-line"></i>{{ note }}</p>
    <p v-if="error" class="ss-note danger"><i class="ri-error-warning-line"></i>{{ error }}</p>
  </section>
</template>

<script setup lang="ts">
/**
 * 会议详情右栏 · 决议事项与纪要摘要。
 * 主持人定稿前（待指认 / 待确认 / 终审）可手改（meeting.minutes.save），或按当前发言人和改过的文字让 AI 重新整理（meeting.minutes.reorganize）。
 */
import { computed, reactive, ref } from 'vue';
import { t as i18nT } from '../../i18n';
import { errorMessage, mm } from './shared';
import type { MmMeetingDetail } from './meetingUi';

const props = defineProps<{ detail: MmMeetingDetail }>();
const emit = defineEmits<{ (e: 'changed'): void }>();

const m = computed(() => props.detail.meeting);
const isPreFinal = computed(() => !['finalized', 'ended', 'pending_owner', 'plan_confirm', 'dispatched'].includes(m.value.status));
const editable = computed(() => props.detail.my.isHost && ['pending_assign', 'pending_confirm', 'pending_review'].includes(m.value.status));
/** 定稿后主持人还能修正决议和摘要的文字（不能 AI 重新整理；项目归档后只读） */
const fixable = computed(() => props.detail.my.isHost && !isPreFinal.value && props.detail.projectStatus !== 'archived');
const editing = ref(false);
const busy = ref<'' | 'save' | 'ai'>('');
const error = ref('');
const note = ref('');
let seq = 0;
const draft = reactive<{ decisions: Array<{ key: number; id?: string; text: string }>; summary: string[] }>({ decisions: [], summary: ['', '', ''] });

function startEdit(): void {
  draft.decisions = m.value.decisions.map((d) => ({ key: ++seq, id: d.id, text: d.text }));
  draft.summary = [0, 1, 2].map((i) => m.value.summaryLines[i] || '');
  error.value = '';
  note.value = '';
  editing.value = true;
}
function addDecision(): void {
  draft.decisions.push({ key: ++seq, text: '' });
}
async function save(): Promise<void> {
  busy.value = 'save';
  error.value = '';
  try {
    await mm('meeting.minutes.save', {
      id: m.value.id,
      decisions: draft.decisions.map((d) => ({ ...(d.id ? { id: d.id } : {}), text: d.text })),
      summaryLines: draft.summary.map((x) => x.trim()).filter(Boolean),
    });
    editing.value = false;
    emit('changed');
  } catch (e) {
    error.value = errorMessage(e);
  } finally {
    busy.value = '';
  }
}
async function reorganize(): Promise<void> {
  if (!window.confirm(i18nT('按现在的发言人和文字重新整理议题、决议和摘要？会覆盖现在的内容（包括你手改过的）。'))) return;
  busy.value = 'ai';
  error.value = '';
  note.value = '';
  try {
    const r = await mm<{ note?: string }>('meeting.minutes.reorganize', { id: m.value.id });
    note.value = r?.note || i18nT('已重新整理');
    emit('changed');
  } catch (e) {
    error.value = errorMessage(e);
  } finally {
    busy.value = '';
  }
}
</script>

<style scoped>
.mm-side { display: grid; gap: 10px; padding: 16px 18px; border: 1px solid var(--color-border); border-radius: var(--radius-5); background: var(--color-bg-card); }
.mm-side h5 { margin: 0; font-size: 15px; font-weight: 800; display: flex; align-items: center; gap: 6px; flex-wrap: wrap; }
.mm-side h5 > span:not(.mm-grow) { color: var(--color-text-secondary); font-weight: 500; font-size: var(--font-size-sm); }
.mm-side h5 .ss-link { display: inline-flex; align-items: center; gap: 3px; font-weight: 500; font-size: 12.5px; }
.mm-side h6 { margin: 12px 0 6px; font-size: 13px; }
.mm-grow { flex: 1; }
.mm-decisions { list-style: none; margin: 0; padding: 0; display: grid; gap: 10px; font-size: var(--font-size-md); line-height: 1.5; }
.mm-decisions li { display: grid; grid-template-columns: 22px minmax(0, 1fr); gap: 8px; }
.mm-decisions li span, .mm-mde__no { width: 22px; height: 22px; border-radius: var(--radius-2, 4px); display: inline-flex; align-items: center; justify-content: center; background: color-mix(in srgb, var(--color-brand) 10%, transparent); color: var(--color-brand); font-size: 11.5px; font-weight: 700; }
.mm-summary { margin: 0; padding-inline-start: 18px; display: grid; gap: 4px; font-size: 12.5px; color: var(--color-text-secondary); line-height: 1.6; }
.mm-mde { display: grid; gap: 8px; }
.mm-mde__row { display: grid; grid-template-columns: 22px minmax(0, 1fr) 26px; gap: 6px; align-items: start; }
.mm-mde textarea, .mm-mde input { width: 100%; box-sizing: border-box; border-radius: var(--radius-3); border: 1px solid var(--color-border); background: var(--color-bg-input); color: var(--color-text-primary); font: inherit; font-size: 13px; padding: 6px 8px; }
.mm-mde textarea { resize: vertical; line-height: 1.5; }
.mm-mde input { height: 30px; }
.mm-mde textarea:focus, .mm-mde input:focus { outline: none; border-color: var(--color-brand); }
.mm-mde__del { width: 26px; height: 26px; border: none; border-radius: var(--radius-2, 4px); background: transparent; color: var(--color-text-muted); cursor: pointer; }
.mm-mde__del:hover { background: color-mix(in srgb, var(--color-danger) 10%, transparent); color: var(--color-danger); }
.mm-mde > .ss-link { display: inline-flex; align-items: center; gap: 3px; justify-self: start; }
.spin { animation: mm-mde-spin 1s linear infinite; }
@keyframes mm-mde-spin { to { transform: rotate(360deg); } }
</style>
