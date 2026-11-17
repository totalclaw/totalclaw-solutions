<template>
  <section class="mm-min" data-test="mm-minutes">
    <div class="mm-min__bar">
      <div class="mm-seg-switch" role="tablist">
        <button type="button" role="tab" :class="{ on: mode === 'topic' }" :aria-selected="mode === 'topic'" data-test="mm-minutes-topic" @click="mode = 'topic'">{{ $t('按议题') }}</button>
        <button type="button" role="tab" :class="{ on: mode === 'timeline' }" :aria-selected="mode === 'timeline'" data-test="mm-minutes-timeline" @click="mode = 'timeline'">{{ $t('按时间线') }}</button>
      </div>
      <span class="ss-muted">{{ hintText }}</span>
    </div>

    <p v-if="!m.segments.length" class="mm-min__empty">{{ $t('还没有纪要内容：上传会议文件、处理完成后在这里按议题整理') }}</p>

    <!-- 按议题 -->
    <template v-else-if="mode === 'topic'">
      <div v-for="(b, i) in blocks" :key="b.id" class="mm-topic" :class="{ open: isOpen(b.id) }" :data-test="`mm-topic-${b.id}`">
        <button type="button" class="mm-topic__head" :aria-expanded="isOpen(b.id)" @click="toggle(b.id)">
          <i :class="isOpen(b.id) ? 'ri-arrow-down-s-line' : 'ri-arrow-right-s-line'"></i>
          <strong>{{ b.id === '__rest' ? b.title : $t('议题{n} · {title}', { n: topicNo(i), title: b.title }) }}</strong>
          <small>{{ $t('{n} 段', { n: b.segmentIds.length }) }}<template v-if="!isOpen(b.id) && b.speakers.length"> · {{ b.speakers.join(listSeparator()) }}</template></small>
        </button>
        <div v-if="isOpen(b.id)" class="mm-topic__body">
          <template v-for="sid in b.segmentIds" :key="sid">
            <div v-if="segById.get(sid)" v-bind="segAttrs(sid)">
              <span class="mm-av" :style="{ background: avatarOf(nameOfSeg(sid)).color }">{{ avatarOf(nameOfSeg(sid)).text }}</span>
              <div class="mm-seg__body">
                <div class="mm-seg__who">
                  <span class="mm-seg__name">{{ nameOfSeg(sid) }}</span>
                  <button v-if="hasAudio" type="button" class="mm-play" :class="{ on: playingId === sid }" :title="playingId === sid ? $t('暂停') : $t('播放这段原声')" :data-test="`mm-seg-play-${sid}`" @click="togglePlay(sid)"><i :class="playIcon(sid)"></i><time>{{ fmtClock(segById.get(sid)!.start) }}</time></button>
                  <time v-else>{{ fmtClock(segById.get(sid)!.start) }}</time>
                  <span v-if="isOwn(sid)" class="mm-mini brand">{{ $t('本人') }}</span>
                  <span v-if="segById.get(sid)!.originalText !== undefined" class="mm-mini" :title="$t('原文：{t}', { t: segById.get(sid)!.originalText || '' })">{{ $t('已修改') }}</span>
                  <span v-if="segById.get(sid)!.originalSpeakerLabel !== undefined" class="mm-mini" :title="$t('识别时是 {l}', { l: segById.get(sid)!.originalSpeakerLabel })">{{ $t('已改发言人') }}</span>
                </div>
                <SegmentSpeakerPicker v-if="speakerId === sid" :detail="detail" :segment-id="sid" @done="onMoved" />
                <template v-if="editingId === sid">
                  <textarea v-model="draft" class="mm-seg__edit" rows="3" :data-test="`mm-seg-edit-${sid}`"></textarea>
                  <div class="ss-actions">
                    <button type="button" class="ss-btn sm primary" :disabled="busy || !draft.trim()" :data-test="`mm-seg-save-${sid}`" @click="saveEdit(sid)"><i :class="busy ? 'ri-loader-4-line spin' : 'ri-check-line'"></i>{{ $t('保存') }}</button>
                    <button type="button" class="ss-link" @click="editingId = ''">{{ $t('取消') }}</button>
                  </div>
                </template>
                <p v-else class="mm-seg__text">{{ segById.get(sid)!.text }}</p>
                <div v-if="returningId === sid" class="mm-seg__return">
                  <input v-model="returnNote" type="text" :placeholder="$t('退回原因（发言人会看到），例如：这段数字需要核实')" :data-test="`mm-seg-return-note-${sid}`" />
                  <button type="button" class="ss-btn sm danger" :disabled="busy" :data-test="`mm-seg-return-ok-${sid}`" @click="doReturn(sid)">{{ $t('确认退回') }}</button>
                  <button type="button" class="ss-link" @click="returningId = ''">{{ $t('取消') }}</button>
                </div>
              </div>
              <div v-if="editingId !== sid && returningId !== sid && speakerId !== sid && (canEdit(sid) || canReturn(sid) || canMoveSpeaker)" class="mm-seg__ops">
                <button v-if="canMoveSpeaker" type="button" class="mm-op" :data-test="`mm-seg-move-${sid}`" @click="startMove(sid)"><i class="ri-user-shared-line"></i>{{ $t('改发言人') }}</button>
                <button v-if="canEdit(sid)" type="button" class="mm-op" :data-test="`mm-seg-modify-${sid}`" @click="startEdit(sid)"><i class="ri-pencil-line"></i>{{ $t('修改') }}</button>
                <button v-if="canReturn(sid)" type="button" class="mm-op danger" :data-test="`mm-seg-return-${sid}`" @click="startReturn(sid)">{{ $t('退回给发言人') }}</button>
              </div>
            </div>
          </template>
        </div>
      </div>
    </template>

    <!-- 按时间线 -->
    <div v-else class="mm-timeline">
      <div v-for="s in timeline" :key="s.id" v-bind="segAttrs(s.id)">
        <span class="mm-av" :style="{ background: avatarOf(nameOfSeg(s.id)).color }">{{ avatarOf(nameOfSeg(s.id)).text }}</span>
        <div class="mm-seg__body">
          <div class="mm-seg__who">
            <span class="mm-seg__name">{{ nameOfSeg(s.id) }}</span>
            <button v-if="hasAudio" type="button" class="mm-play" :class="{ on: playingId === s.id }" :title="playingId === s.id ? $t('暂停') : $t('播放这段原声')" :data-test="`mm-seg-play-${s.id}`" @click="togglePlay(s.id)"><i :class="playIcon(s.id)"></i><time>{{ fmtClock(s.start) }}</time></button>
            <time v-else>{{ fmtClock(s.start) }}</time>
            <span v-if="isOwn(s.id)" class="mm-mini brand">{{ $t('本人') }}</span>
            <span v-if="s.originalText !== undefined" class="mm-mini" :title="$t('原文：{t}', { t: s.originalText || '' })">{{ $t('已修改') }}</span>
            <span v-if="s.originalSpeakerLabel !== undefined" class="mm-mini" :title="$t('识别时是 {l}', { l: s.originalSpeakerLabel })">{{ $t('已改发言人') }}</span>
          </div>
          <SegmentSpeakerPicker v-if="speakerId === s.id" :detail="detail" :segment-id="s.id" @done="onMoved" />
          <template v-if="editingId === s.id">
            <textarea v-model="draft" class="mm-seg__edit" rows="3"></textarea>
            <div class="ss-actions">
              <button type="button" class="ss-btn sm primary" :disabled="busy || !draft.trim()" @click="saveEdit(s.id)"><i :class="busy ? 'ri-loader-4-line spin' : 'ri-check-line'"></i>{{ $t('保存') }}</button>
              <button type="button" class="ss-link" @click="editingId = ''">{{ $t('取消') }}</button>
            </div>
          </template>
          <p v-else class="mm-seg__text">{{ s.text }}</p>
          <div v-if="returningId === s.id" class="mm-seg__return">
            <input v-model="returnNote" type="text" :placeholder="$t('退回原因（发言人会看到），例如：这段数字需要核实')" />
            <button type="button" class="ss-btn sm danger" :disabled="busy" @click="doReturn(s.id)">{{ $t('确认退回') }}</button>
            <button type="button" class="ss-link" @click="returningId = ''">{{ $t('取消') }}</button>
          </div>
        </div>
        <div v-if="editingId !== s.id && returningId !== s.id && speakerId !== s.id && (canEdit(s.id) || canReturn(s.id) || canMoveSpeaker)" class="mm-seg__ops">
          <button v-if="canMoveSpeaker" type="button" class="mm-op" :data-test="`mm-seg-move-${s.id}`" @click="startMove(s.id)"><i class="ri-user-shared-line"></i>{{ $t('改发言人') }}</button>
          <button v-if="canEdit(s.id)" type="button" class="mm-op" @click="startEdit(s.id)"><i class="ri-pencil-line"></i>{{ $t('修改') }}</button>
          <button v-if="canReturn(s.id)" type="button" class="mm-op danger" @click="startReturn(s.id)">{{ $t('退回给发言人') }}</button>
        </div>
      </div>
    </div>

    <p v-if="error" class="ss-note danger"><i class="ri-error-warning-line"></i>{{ error }}</p>
  </section>
</template>

<script setup lang="ts">
/**
 * 会议详情 · 纪要内容：按议题（可折叠）/ 按时间线；每段头像、发言人、正文。
 * 待确认时发言人可改本人段（meeting.segment.edit）；终审时主持人悬停任意段可「修改 / 退回给发言人」（meeting.review.return）；
 * 定稿前（待指认 / 待确认 / 终审）主持人可逐段「改发言人」（SegmentSpeakerPicker → meeting.segment.speaker）。
 * 定稿后主持人仍可修正错字（项目归档前）。有录音的会议每段都能点播放听原声（meeting.segment.audio）。
 */
import { computed, nextTick, onBeforeUnmount, ref, watch } from 'vue';
import type { MmSegment } from '../../../shared/meetingMgmt/types';
import { listSeparator, t as i18nT } from '../../i18n';
import { avatarOf, errorMessage, fmtClock, mm, mmBoot } from './shared';
import { isOwnSegment, speakerName, speakerPersonId, topicBlocks, topicNo, type MmMeetingDetail } from './meetingUi';
import SegmentSpeakerPicker from './SegmentSpeakerPicker.vue';

const props = defineProps<{ detail: MmMeetingDetail; anchor?: string; anchorSeq?: number }>();
const emit = defineEmits<{ (e: 'changed'): void }>();

const mode = ref<'topic' | 'timeline'>('topic');
const opened = ref<Set<string>>(new Set());
const editingId = ref('');
const draft = ref('');
const returningId = ref('');
const returnNote = ref('');
const speakerId = ref('');
const busy = ref(false);
const error = ref('');

const m = computed(() => props.detail.meeting);
const meId = computed(() => mmBoot.value?.me?.person?.id);
const segById = computed(() => new Map<string, MmSegment>(m.value.segments.map((s) => [s.id, s])));
const blocks = computed(() => topicBlocks(props.detail));
const timeline = computed(() => [...m.value.segments].sort((a, b) => a.start - b.start));
const myConf = computed(() => m.value.confirmations.find((c) => c.personId === meId.value));
const isReview = computed(() => m.value.status === 'pending_review' && props.detail.my.isHost);
/** 主持人定稿前都能逐段改发言人（声纹认错 / 文字记录没标发言人时整篇都在一个人名下） */
const canMoveSpeaker = computed(() => props.detail.my.isHost && ['pending_assign', 'pending_confirm', 'pending_review'].includes(m.value.status));
const FINAL_STATUSES = ['finalized', 'ended', 'pending_owner', 'plan_confirm', 'dispatched'];
const isFinal = computed(() => FINAL_STATUSES.includes(m.value.status));
/** 定稿后主持人还能修正错字（项目归档后只读） */
const isFinalHost = computed(() => isFinal.value && props.detail.my.isHost && props.detail.projectStatus !== 'archived');
/** 有录音 / 录屏的会议才有原声可听（文字记录导入的没有） */
const hasAudio = computed(() => m.value.files.some((f) => f.kind === 'audio' || f.kind === 'video'));

const hintText = computed(() => {
  const n = (m.value.topics || []).length;
  const base = n ? i18nT('AI 整理 · {n} 个议题', { n }) : i18nT('AI 整理');
  if (isReview.value) return `${base} · ${i18nT('悬停段落可修改、退回或改发言人')}`;
  if (m.value.status === 'pending_confirm' && props.detail.my.isHost) return `${base} · ${i18nT('悬停段落可补全文字或改发言人')}`;
  if (m.value.status === 'pending_confirm' && myConf.value) return `${base} · ${i18nT('悬停本人发言可补全或修改')}`;
  if (canMoveSpeaker.value) return `${base} · ${i18nT('发言人认错了：悬停段落可改发言人')}`;
  if (isFinalHost.value) return `${base} · ${i18nT('纪要已定稿；发现错字可悬停段落修改')}`;
  if (isFinal.value) return `${base} · ${i18nT('纪要已定稿')}`;
  return base;
});

function segLabel(sid: string): string { return segById.value.get(sid)?.speakerLabel || ''; }
function nameOfSeg(sid: string): string { return speakerName(props.detail, segLabel(sid)); }
function isOwn(sid: string): boolean { return isOwnSegment(props.detail, segLabel(sid), meId.value); }
/** 待确认：主持人改任意段、发言人改本人段（确认过也能补全）；终审主持人；定稿后主持人修错字 */
function canEdit(sid: string): boolean {
  if (isReview.value || isFinalHost.value) return true;
  if (m.value.status !== 'pending_confirm' || props.detail.projectStatus === 'archived') return false;
  return props.detail.my.isHost || isOwn(sid);
}
function canReturn(sid: string): boolean {
  if (!isReview.value) return false;
  const pid = speakerPersonId(m.value, segLabel(sid));
  return !!pid && m.value.confirmations.some((c) => c.personId === pid);
}
function segAttrs(sid: string): Record<string, unknown> {
  return {
    class: ['mm-seg', { own: isOwn(sid), hoverable: canEdit(sid) || canReturn(sid) || canMoveSpeaker.value, hl: props.anchor === sid, editing: editingId.value === sid || returningId.value === sid || speakerId.value === sid }],
    'data-seg': sid,
    'data-test': `mm-seg-${sid}`,
  };
}

function isOpen(id: string): boolean { return opened.value.has(id); }
function toggle(id: string): void {
  const next = new Set(opened.value);
  if (next.has(id)) next.delete(id); else next.add(id);
  opened.value = next;
}
// 第一个议题默认展开（原型）；议题换了（处理完成）重新来
watch(() => blocks.value.map((b) => b.id).join('|'), () => {
  const first = blocks.value[0]?.id;
  const keep = new Set([...opened.value].filter((id) => blocks.value.some((b) => b.id === id)));
  if (!keep.size && first) keep.add(first);
  opened.value = keep;
}, { immediate: true });

// 从待办 / 通知定位到某段：展开所在议题并滚过去
watch(() => [props.anchor, props.anchorSeq], async () => {
  const sid = props.anchor;
  if (!sid || !segById.value.has(sid)) return;
  const b = blocks.value.find((x) => x.segmentIds.includes(sid));
  if (b && !opened.value.has(b.id)) opened.value = new Set([...opened.value, b.id]);
  await nextTick();
  const esc = typeof CSS !== 'undefined' && typeof CSS.escape === 'function' ? CSS.escape(sid) : sid.replace(/["\\]/g, '\\$&');
  const el = document.querySelector(`[data-seg="${esc}"]`) as HTMLElement | null;
  el?.scrollIntoView?.({ block: 'center', behavior: 'smooth' });
}, { immediate: true });

// ── 逐段播放原声：同一时间只放一段；片段按段缓存（最多 30 段） ──
const playingId = ref('');
const loadingId = ref('');
const clipCache = new Map<string, string>();
let player: HTMLAudioElement | null = null;
function playIcon(sid: string): string {
  return loadingId.value === sid ? 'ri-loader-4-line spin' : playingId.value === sid ? 'ri-pause-fill' : 'ri-play-fill';
}
async function togglePlay(sid: string): Promise<void> {
  if (playingId.value === sid && player) { player.pause(); playingId.value = ''; return; }
  player?.pause();
  playingId.value = '';
  loadingId.value = sid;
  error.value = '';
  try {
    let url = clipCache.get(sid);
    if (!url) {
      const r = await mm<{ dataUrl: string }>('meeting.segment.audio', { id: m.value.id, segmentId: sid });
      url = r?.dataUrl || '';
      if (!url) throw new Error(i18nT('这段没有可播放的原声'));
      if (clipCache.size >= 30) clipCache.delete(clipCache.keys().next().value as string);
      clipCache.set(sid, url);
    }
    if (!player) {
      player = new Audio();
      player.onended = () => { playingId.value = ''; };
    }
    player.src = url;
    await player.play();
    playingId.value = sid;
  } catch (e) {
    error.value = errorMessage(e);
  } finally {
    loadingId.value = '';
  }
}
onBeforeUnmount(() => { player?.pause(); player = null; });

function startMove(sid: string): void {
  editingId.value = '';
  returningId.value = '';
  speakerId.value = sid;
}
function onMoved(changed: boolean): void {
  speakerId.value = '';
  if (changed) emit('changed');
}
function startEdit(sid: string): void {
  speakerId.value = '';
  returningId.value = '';
  editingId.value = sid;
  draft.value = segById.value.get(sid)?.text || '';
}
function startReturn(sid: string): void {
  editingId.value = '';
  speakerId.value = '';
  returningId.value = sid;
  returnNote.value = '';
}
async function saveEdit(sid: string): Promise<void> {
  const text = draft.value.trim();
  if (!text || busy.value) return;
  busy.value = true;
  error.value = '';
  try {
    await mm('meeting.segment.edit', { id: m.value.id, segmentId: sid, text });
    editingId.value = '';
    emit('changed');
  } catch (e) {
    error.value = errorMessage(e);
  } finally {
    busy.value = false;
  }
}
async function doReturn(sid: string): Promise<void> {
  const personId = speakerPersonId(m.value, segLabel(sid));
  if (!personId || busy.value) return;
  const name = props.detail.names[personId]?.name || '';
  if (!window.confirm(i18nT('把这段退回给 {name} 重新确认？只有 {name} 需要重新确认。', { name }))) return;
  busy.value = true;
  error.value = '';
  try {
    await mm('meeting.review.return', { id: m.value.id, personId, note: returnNote.value.trim() });
    returningId.value = '';
    emit('changed');
  } catch (e) {
    error.value = errorMessage(e);
  } finally {
    busy.value = false;
  }
}
</script>

<style scoped>
.mm-min { display: grid; gap: 12px; min-width: 0; }
.mm-min__bar { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; }
.mm-seg-switch { display: inline-flex; padding: 3px; border-radius: var(--radius-4); background: var(--color-bg-hover); }
.mm-seg-switch button { height: 34px; padding: 0 18px; border: none; border-radius: var(--radius-3); background: transparent; color: var(--color-text-secondary); font: inherit; font-size: var(--font-size-md); cursor: pointer; }
.mm-seg-switch button.on { background: var(--color-bg-card); color: var(--color-brand); font-weight: 700; box-shadow: 0 1px 3px color-mix(in srgb, var(--color-text-primary) 10%, transparent); }
.mm-min__empty { margin: 0; padding: 14px; border-radius: var(--radius-4); background: var(--color-bg-hover); color: var(--color-text-secondary); font-size: 12.5px; }

.mm-topic { border: 1px solid var(--color-border-subtle, var(--color-border)); border-radius: var(--radius-5); background: var(--color-bg-card); box-shadow: 0 1px 2px color-mix(in srgb, var(--color-text-primary) 4%, transparent); overflow: hidden; }
.mm-topic__head { width: 100%; display: flex; align-items: center; gap: 10px; padding: 13px 18px; border: none; background: transparent; color: var(--color-text-primary); font: inherit; text-align: start; cursor: pointer; transition: background .15s; }
.mm-topic__head:hover { background: color-mix(in srgb, var(--color-brand) 4%, var(--color-bg-card)); }
.mm-topic.open .mm-topic__head { background: color-mix(in srgb, var(--color-brand) 6%, var(--color-bg-card)); border-bottom: 1px solid var(--color-border-subtle, var(--color-border)); }
.mm-topic__head i { font-size: 18px; color: var(--color-brand); }
.mm-topic__head strong { font-size: 15px; font-weight: 650; }
.mm-topic__head small { color: var(--color-text-secondary); font-size: var(--font-size-sm); }
.mm-topic__body { display: grid; gap: 2px; padding: 8px 10px 10px; }
.mm-timeline { display: grid; gap: 2px; padding: 6px; border: 1px solid var(--color-border-subtle, var(--color-border)); border-radius: var(--radius-5); background: var(--color-bg-card); }

.mm-seg { position: relative; display: grid; grid-template-columns: 34px minmax(0, 1fr) auto; gap: 12px; align-items: start; padding: 12px 12px; border: 1px solid transparent; border-radius: var(--radius-4); transition: background .15s, border-color .15s; }
.mm-seg:hover { background: color-mix(in srgb, var(--color-text-primary) 2.5%, var(--color-bg-card)); }
.mm-seg.hoverable:hover, .mm-seg.editing { background: color-mix(in srgb, var(--color-brand) 5%, var(--color-bg-card)); border-color: color-mix(in srgb, var(--color-brand) 24%, var(--color-border)); }
.mm-seg.hl { border-color: var(--color-warning); background: color-mix(in srgb, var(--color-warning) 7%, var(--color-bg-card)); }
.mm-av { width: 34px; height: 34px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; color: var(--color-on-accent); font-size: var(--font-size-sm); font-weight: 700; box-shadow: 0 0 0 2px var(--color-bg-card), 0 0 0 3px color-mix(in srgb, var(--color-text-primary) 6%, transparent); }
.mm-seg__body { display: grid; gap: 4px; min-width: 0; }
.mm-seg__who { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; color: var(--color-text-secondary); font-size: var(--font-size-sm); min-height: 24px; }
.mm-seg__name { font-weight: 600; color: var(--color-text-primary); }
.mm-seg__who time { font-variant-numeric: tabular-nums; }
.mm-play { display: inline-flex; align-items: center; gap: 3px; height: 22px; padding: 0 8px 0 4px; border: 1px solid var(--color-border); border-radius: 999px; background: var(--color-bg-card); color: var(--color-text-secondary); font: inherit; font-size: 12px; cursor: pointer; transition: color .15s, border-color .15s, background .15s; }
.mm-play i { font-size: 15px; line-height: 1; }
.mm-play:hover { color: var(--color-brand); border-color: color-mix(in srgb, var(--color-brand) 50%, var(--color-border)); }
.mm-play.on { color: var(--color-brand); border-color: var(--color-brand); background: color-mix(in srgb, var(--color-brand) 10%, var(--color-bg-card)); }
.mm-seg__text { margin: 0; font-size: 15px; line-height: 1.75; color: var(--color-text-primary); white-space: pre-wrap; word-break: break-word; }
.mm-seg__edit { width: 100%; box-sizing: border-box; min-height: 72px; padding: 8px 10px; border-radius: var(--radius-3); border: 1px solid var(--color-brand); background: var(--color-bg-input); color: var(--color-text-primary); font: inherit; font-size: var(--font-size-md); line-height: 1.6; resize: vertical; }
.mm-seg__edit:focus { outline: none; }
.mm-seg__return { display: flex; gap: 8px; align-items: center; flex-wrap: wrap; margin-top: 4px; }
.mm-seg__return input { flex: 1; min-width: 220px; height: 30px; border-radius: var(--radius-3); border: 1px solid color-mix(in srgb, var(--color-danger) 45%, var(--color-border)); background: var(--color-bg-input); color: var(--color-text-primary); font: inherit; font-size: 12.5px; padding: 0 10px; }
.mm-seg__ops { display: flex; gap: 8px; align-items: center; opacity: 0; transition: opacity .15s; }
.mm-seg.hoverable:hover .mm-seg__ops, .mm-seg__ops:focus-within { opacity: 1; }
.mm-seg.own .mm-seg__ops { opacity: 1; }
.mm-op { display: inline-flex; align-items: center; gap: 4px; height: 32px; padding: 0 12px; border-radius: var(--radius-3); border: 1px solid var(--color-border); background: var(--color-bg-card); color: var(--color-text-primary); font: inherit; font-size: var(--font-size-sm); font-weight: 600; cursor: pointer; white-space: nowrap; }
.mm-op:hover { border-color: var(--color-brand); color: var(--color-brand); }
.mm-op.danger { color: var(--color-danger); border-color: color-mix(in srgb, var(--color-danger) 45%, var(--color-border)); background: color-mix(in srgb, var(--color-danger) 5%, var(--color-bg-card)); }
.mm-op.danger:hover { color: var(--color-danger); border-color: var(--color-danger); }
.mm-mini { padding: 0 6px; border-radius: var(--radius-2, 4px); font-size: 11px; background: var(--color-bg-hover); color: var(--color-text-secondary); }
.mm-mini.brand { background: color-mix(in srgb, var(--color-brand) 12%, transparent); color: var(--color-brand); }
.spin { animation: mm-spin 1s linear infinite; }
@keyframes mm-spin { to { transform: rotate(360deg); } }
</style>
