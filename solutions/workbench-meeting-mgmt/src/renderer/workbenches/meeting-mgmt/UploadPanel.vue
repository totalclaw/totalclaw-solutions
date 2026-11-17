<template>
  <section class="mm-up" data-test="mm-upload-panel">
    <!-- 待上传 -->
    <template v-if="m.status === 'pending_upload'">
      <div v-if="detail.my.isHost" class="mm-up__zone">
        <i class="ri-upload-cloud-2-line mm-up__icon" aria-hidden="true"></i>
        <strong>{{ $t('上传会议录音、录屏或文字记录') }}</strong>
        <p>{{ $t('优先上传录音或录屏：系统按停顿切段转写，再和本场参会人的声纹比对，自动认出谁在说话。只有文字记录时，没有发言人标注的段落要你手动分配。') }}</p>
        <button type="button" class="ss-btn primary" :disabled="busy" data-test="mm-pick-files" @click="pick">
          <i :class="busy ? 'ri-loader-4-line spin' : 'ri-folder-open-line'"></i>{{ busy ? $t('正在拷入文件…') : $t('选择文件') }}
        </button>
        <ul class="mm-up__formats">
          <li><b>{{ $t('录音') }}</b>{{ $t('mp3、m4a、wav、aac、amr、flac、ogg、opus、wma 等') }}</li>
          <li><b>{{ $t('录屏') }}</b>{{ $t('mp4、mov、mkv、avi、flv、wmv、webm 等，自动提取音轨') }}</li>
          <li><b>{{ $t('文字记录') }}</b>{{ $t('txt、md、docx、srt、vtt、json，跳过转写，按参会昵称匹配员工') }}</li>
        </ul>
        <small class="ss-muted">{{ $t('扩展名不认识的文件会先探测，有音轨就当录音处理；可以一次选多个文件。') }}</small>
      </div>
      <p v-else class="ss-note"><i class="ri-time-line"></i>{{ $t('等待主持人 {name} 上传会议文件', { name: hostName }) }}</p>
    </template>

    <!-- 处理中 -->
    <template v-else-if="m.status === 'processing'">
      <div class="mm-up__proc">
        <ol class="mm-up__stages">
          <li v-for="(s, i) in stages" :key="s" :class="{ done: i < stageIdx, cur: i === stageIdx }">
            <i :class="i < stageIdx ? 'ri-checkbox-circle-fill' : i === stageIdx ? 'ri-loader-4-line spin' : 'ri-checkbox-blank-circle-line'"></i>{{ STAGE_LABEL[s] }}
          </li>
        </ol>
        <div class="mm-up__bar"><i :style="{ width: `${pct}%` }"></i></div>
        <p class="mm-up__line">
          <b>{{ STAGE_LABEL[proc.stage] }} · {{ pct }}%</b>
          <span v-if="proc.text" class="ss-muted">{{ proc.text }}</span>
          <span class="mm-grow"></span>
          <span v-if="startedAt" class="ss-muted">{{ $t('已用时 {t}', { t: fmtElapsed(now - startedAt) }) }}</span>
        </p>
        <p v-if="stalled" class="ss-note warn" data-test="mm-process-stalled">
          <i class="ri-hourglass-line"></i>
          <span>{{ $t('已经 {m} 分钟没有新进度。长录音转写较慢，可以继续等待；也可以看看处理日志。', { m: stalledMinutes }) }}</span>
          <button type="button" class="ss-link" @click="emit('wait')">{{ $t('继续等待') }}</button>
          <button type="button" class="ss-link" @click="emit('log')">{{ $t('查看日志') }}</button>
        </p>
        <small v-else class="ss-muted">{{ $t('处理在后台进行，可以先去做别的事；完成后发言人会收到确认通知。') }}</small>
      </div>
    </template>

    <!-- 失败 -->
    <template v-else-if="m.status === 'failed'">
      <p class="ss-note danger" data-test="mm-process-failed">
        <i class="ri-error-warning-line"></i>
        <span>{{ $t('处理失败（{stage}）：{error}', { stage: STAGE_LABEL[m.process?.stage || 'extract'], error: m.process?.error || $t('未知原因') }) }}</span>
      </p>
      <div class="ss-actions">
        <button v-if="detail.my.isHost" type="button" class="ss-btn primary" :disabled="busy" data-test="mm-retry" @click="retry">
          <i :class="busy ? 'ri-loader-4-line spin' : 'ri-restart-line'"></i>{{ $t('重试') }}
        </button>
        <button v-if="detail.my.isHost" type="button" class="ss-btn" :disabled="busy" @click="pick"><i class="ri-folder-open-line"></i>{{ $t('换文件重新上传') }}</button>
        <button type="button" class="ss-btn ghost" @click="emit('log')"><i class="ri-file-list-3-line"></i>{{ $t('查看处理日志') }}</button>
        <span v-if="!detail.my.isHost" class="ss-muted">{{ $t('等待主持人 {name} 重试', { name: hostName }) }}</span>
      </div>
    </template>
    <p v-if="error" class="ss-note danger"><i class="ri-error-warning-line"></i>{{ error }}</p>
  </section>
</template>

<script setup lang="ts">
/** 会议详情 · 上传区（待上传）、处理进度（处理中，进度来自 process 事件）、失败重试。 */
import { computed, ref } from 'vue';
import type { MmProcessStage } from '../../../shared/meetingMgmt/types';
import { useNotificationStore } from '../../stores/notification';
import { t as i18nT } from '../../i18n';
import { errorMessage, mm } from './shared';
import { PROCESS_STALL_MS, STAGE_LABEL, fmtElapsed, lastProgressAt, type MmMeetingDetail } from './meetingUi';

const props = defineProps<{
  detail: MmMeetingDetail;
  /** 最近一次 process 事件 */
  live: { stage: MmProcessStage; progress: number; text?: string; at: number } | null;
  now: number;
  /** 「继续等待」后从这个时刻重新计 */
  waitFrom: number;
}>();
const emit = defineEmits<{ (e: 'changed'): void; (e: 'log'): void; (e: 'wait'): void }>();

const notif = useNotificationStore();
const busy = ref(false);
const error = ref('');
const m = computed(() => props.detail.meeting);
const hostName = computed(() => props.detail.names[m.value.hostId]?.name || '');

const proc = computed(() => {
  const p = m.value.process;
  if (props.live) return { stage: props.live.stage, progress: props.live.progress, text: props.live.text };
  return { stage: p?.stage || 'extract', progress: p?.progress || 0, text: p?.log?.length ? p.log[p.log.length - 1].text : '' };
});
const pct = computed(() => Math.max(0, Math.min(100, Math.round(proc.value.progress || 0))));
/** 文字记录走「解析 → 整理」，音视频走「提取音轨 → 转写 → 识别发言人 → 整理」 */
const stages = computed<MmProcessStage[]>(() => {
  const files = m.value.files || [];
  if (files.length && files.every((f) => f.kind === 'transcript')) return ['parse', 'organize'];
  const list: MmProcessStage[] = files.some((f) => f.kind === 'video') ? ['extract', 'transcribe', 'diarize', 'organize'] : ['transcribe', 'diarize', 'organize'];
  return list.includes(proc.value.stage) ? list : ['extract', 'transcribe', 'diarize', 'parse', 'organize'];
});
const stageIdx = computed(() => Math.max(0, stages.value.indexOf(proc.value.stage)));
const startedAt = computed(() => m.value.process?.startedAt || 0);
const lastAt = computed(() => Math.max(lastProgressAt(m.value.process, props.live?.at) || 0, props.waitFrom || 0));
const stalled = computed(() => !!lastAt.value && props.now - lastAt.value > PROCESS_STALL_MS);
const stalledMinutes = computed(() => Math.floor((props.now - lastAt.value) / 60_000));

async function pick(): Promise<void> {
  if (busy.value) return;
  busy.value = true;
  error.value = '';
  try {
    const r = await mm<unknown>('meeting.pickFiles', { id: m.value.id });
    if (r) notif.success(i18nT('文件已上传，开始处理'));
    emit('changed');
  } catch (e) {
    error.value = errorMessage(e);
  } finally {
    busy.value = false;
  }
}
async function retry(): Promise<void> {
  if (busy.value) return;
  busy.value = true;
  error.value = '';
  try {
    await mm('meeting.retry', { id: m.value.id });
    emit('changed');
  } catch (e) {
    error.value = errorMessage(e);
  } finally {
    busy.value = false;
  }
}
</script>

<style scoped>
.mm-up { display: grid; gap: 10px; }
.mm-up__zone { display: grid; justify-items: center; gap: 10px; padding: 28px 24px; border: 1.5px dashed color-mix(in srgb, var(--color-brand) 40%, var(--color-border)); border-radius: var(--radius-6); background: color-mix(in srgb, var(--color-brand) 4%, var(--color-bg-card)); text-align: center; }
.mm-up__icon { font-size: 40px; color: var(--color-brand); }
.mm-up__zone strong { font-size: 16px; }
.mm-up__zone p { margin: 0; max-width: 620px; color: var(--color-text-secondary); font-size: 12.5px; line-height: 1.6; }
.mm-up__formats { list-style: none; margin: 6px 0 0; padding: 0; display: grid; gap: 4px; font-size: 12.5px; color: var(--color-text-secondary); text-align: start; }
.mm-up__formats b { display: inline-block; min-width: 64px; color: var(--color-text-primary); margin-inline-end: 6px; }
.mm-up__proc { display: grid; gap: 10px; padding: 16px 18px; border: 1px solid var(--color-border); border-radius: var(--radius-5); background: var(--color-bg-card); }
.mm-up__stages { list-style: none; margin: 0; padding: 0; display: flex; flex-wrap: wrap; gap: 6px 18px; font-size: var(--font-size-md); color: var(--color-text-secondary); }
.mm-up__stages li { display: inline-flex; align-items: center; gap: 5px; }
.mm-up__stages li.done { color: var(--color-success); }
.mm-up__stages li.cur { color: var(--color-brand); font-weight: 700; }
.mm-up__bar { height: 8px; border-radius: 4px; background: var(--color-bg-hover); overflow: hidden; }
.mm-up__bar i { display: block; height: 100%; background: var(--color-brand); border-radius: 4px; transition: width .3s; }
.mm-up__line { margin: 0; display: flex; gap: 10px; align-items: baseline; flex-wrap: wrap; font-size: var(--font-size-md); }
.mm-grow { flex: 1; }
.spin { animation: mm-spin 1s linear infinite; }
@keyframes mm-spin { to { transform: rotate(360deg); } }
</style>
