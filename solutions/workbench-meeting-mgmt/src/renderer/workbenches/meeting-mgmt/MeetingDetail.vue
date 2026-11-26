<template>
  <section class="mm-dt" data-test="mm-meeting-detail">
    <p v-if="error && !d" class="ss-note danger"><i class="ri-error-warning-line"></i><span>{{ error }}</span><button type="button" class="ss-link" @click="refresh">{{ $t('重试') }}</button></p>
    <p v-else-if="!d" class="ss-note"><i class="ri-loader-4-line spin"></i>{{ $t('正在加载会议…') }}</p>

    <template v-if="d">
      <!-- 顶部：标题 + 状态 + 环节进度（sticky：滚动时一直看得见） -->
      <div class="mm-dt__sticky" data-test="mm-meeting-steps">
        <div class="mm-dt__titlerow">
          <h3>{{ m.title }}</h3>
          <span class="ss-chip" :class="tone" data-test="mm-meeting-status">{{ statusText }}</span>
          <span class="mm-grow"></span>
          <ol class="mm-steps">
            <li
              v-for="(s, i) in MEETING_STEPS"
              :key="s.key"
              :class="{ done: i < stepIdx || (m.status === 'dispatched' && i === stepIdx), cur: i === stepIdx && m.status !== 'dispatched', bad: i === stepIdx && m.status === 'failed' }"
              :data-test="`mm-step-${s.key}`"
            ><i class="mm-steps__dot"></i>{{ s.label }}</li>
          </ol>
        </div>
        <div v-if="m.status === 'processing'" class="mm-dt__procline">
          <span class="mm-dt__procbar"><i :style="{ width: `${procPct}%` }"></i></span>
          <small>{{ $t('处理中 · {stage} {p}%', { stage: STAGE_LABEL[procStage], p: procPct }) }}</small>
        </div>
      </div>

      <p class="mm-dt__info">
        <span>{{ d.projectName }}</span>
        <span>{{ fmtMs(m.time) }}</span>
        <span>{{ $t('主持人 {name}', { name: nameOf(m.hostId) }) }}</span>
        <span>{{ sourceText }}</span>
        <span v-if="m.durationSec">{{ fmtDuration(m.durationSec) }}</span>
      </p>
      <p v-if="d.projectStatus !== 'active'" class="ss-note warn">
        <i class="ri-lock-line"></i>{{ d.projectStatus === 'archived' ? $t('项目已归档，会议只读') : $t('项目结项中，会议只读') }}
      </p>

      <!-- 当前环节的操作横幅 -->
      <div v-if="banner" class="mm-banner" :class="banner.tone" data-test="mm-meeting-banner">
        <span class="mm-banner__icon"><i :class="banner.icon"></i></span>
        <div class="mm-banner__text">
          <strong>{{ banner.title }}</strong>
          <small v-if="banner.desc">{{ banner.desc }}</small>
        </div>
        <div v-if="banner.actions.length" class="mm-banner__ops">
          <button
            v-for="a in banner.actions"
            :key="a.key"
            type="button"
            class="mm-btn"
            :class="a.kind"
            :disabled="!!busy"
            :data-test="`mm-action-${a.key}`"
            @click="runAction(a.key)"
          ><i v-if="busy === a.key" class="ri-loader-4-line spin"></i>{{ a.label }}</button>
        </div>
      </div>
      <p v-if="error" class="ss-note danger"><i class="ri-error-warning-line"></i>{{ error }}</p>

      <!-- 内容页签 -->
      <nav class="mm-dt__tabs" role="tablist">
        <button
          v-for="t in tabs"
          :key="t.key"
          type="button"
          role="tab"
          :class="{ on: tab === t.key }"
          :aria-selected="tab === t.key"
          :data-test="`mm-dtab-${t.key}`"
          @click="tab = t.key"
        >{{ t.title }}<span v-if="t.extra" class="mm-dt__extra">{{ t.extra }}</span></button>
      </nav>

      <div class="mm-dt__grid">
        <div class="mm-dt__main">
          <!-- 纪要内容 -->
          <template v-if="tab === 'minutes'">
            <UploadPanel
              v-if="m.status === 'pending_upload' || m.status === 'processing' || m.status === 'failed'"
              :detail="d"
              :live="live"
              :now="now"
              :wait-from="waitFrom"
              @changed="onChildChanged"
              @log="tab = 'files'"
              @wait="waitFrom = Date.now()"
            />
            <SpeakerAssignPanel v-if="m.status === 'pending_assign' || (d.my.isHost && (m.status === 'pending_confirm' || m.status === 'pending_review'))" :key="`sa-${m.status}`" :detail="d" @changed="onChildChanged" />
            <MinutesPanel v-if="m.segments.length || !['pending_upload', 'processing', 'failed'].includes(m.status)" :detail="d" :anchor="anchor" :anchor-seq="anchorSeq" @changed="onChildChanged" />
          </template>

          <!-- 发言确认 -->
          <template v-else-if="tab === 'confirm'">
            <p v-if="!m.confirmations.length" class="mm-dt__empty">{{ $t('转写和发言人识别完成后，这里显示每位发言人的确认状态') }}</p>
            <div v-else class="ss-table-wrap">
              <table class="ss-table" data-test="mm-confirm-table">
                <thead><tr><th>{{ $t('发言人') }}</th><th>{{ $t('部门') }}</th><th class="num">{{ $t('发言段数') }}</th><th>{{ $t('状态') }}</th><th>{{ $t('确认时间') }}</th><th>{{ $t('催办') }}</th></tr></thead>
                <tbody>
                  <tr v-for="c in m.confirmations" :key="c.personId" :data-test="`mm-confirm-${c.personId}`">
                    <td><span class="mm-person"><span class="mm-av sm" :style="{ background: avatarOf(nameOf(c.personId)).color }">{{ avatarOf(nameOf(c.personId)).text }}</span>{{ nameOf(c.personId) }}</span></td>
                    <td>{{ d.names[c.personId]?.deptName || '-' }}</td>
                    <td class="num">{{ segCountOf(c.personId) }}</td>
                    <td>
                      <span v-if="c.status === 'confirmed'" class="ss-chip ok">{{ $t('已确认') }}</span>
                      <span v-else-if="c.returnedAt" class="ss-chip bad" :title="c.returnNote || ''">{{ $t('被退回') }}</span>
                      <span v-else class="ss-chip warn">{{ $t('未确认') }}</span>
                      <small v-if="c.returnedAt && c.returnNote && c.status !== 'confirmed'" class="mm-dt__note">{{ c.returnNote }}</small>
                    </td>
                    <td>{{ c.confirmedAt ? fmtMs(c.confirmedAt) : '-' }}</td>
                    <td>{{ c.remindedAt ? $t('已催办 {t}', { t: fmtMs(c.remindedAt) }) : '-' }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <small class="ss-muted">{{ $t('超过 {h} 小时未确认，系统自动催办（只提醒，不改状态）；全员确认后自动进入主持人终审。', { h: timeoutHours }) }}</small>
          </template>

          <!-- 转写原文 -->
          <template v-else-if="tab === 'transcript'">
            <p v-if="!transcript.length" class="mm-dt__empty">{{ $t('还没有转写内容') }}</p>
            <ol v-else class="mm-raw" data-test="mm-transcript">
              <li v-for="s in transcript" :key="s.id">
                <time>{{ fmtClock(s.start) }}</time>
                <b>{{ speakerName(d, s.speakerLabel) }}</b>
                <span>{{ s.originalText || s.text }}</span>
              </li>
            </ol>
          </template>

          <!-- 文件与处理记录 -->
          <template v-else-if="tab === 'files'">
            <div class="mm-dt__sub">
              <b>{{ $t('上传的文件') }}</b>
              <span class="mm-grow"></span>
              <button v-if="d.my.isHost && (m.status === 'pending_upload' || m.status === 'failed')" type="button" class="ss-btn sm" :disabled="!!busy" @click="runAction('pick')">
                <i :class="busy === 'pick' ? 'ri-loader-4-line spin' : 'ri-upload-2-line'"></i>{{ $t('上传文件') }}
              </button>
              <button v-if="canReprocess" type="button" class="ss-btn sm" :disabled="!!busy" data-test="mm-reprocess" :title="$t('换了更准的转写模型后，用现在的模型把这场会议重新转写一遍')" @click="runAction('reprocess')">
                <i :class="busy === 'reprocess' ? 'ri-loader-4-line spin' : 'ri-refresh-line'"></i>{{ $t('用当前模型重新转写') }}
              </button>
            </div>
            <p v-if="!m.files.length" class="mm-dt__empty">{{ $t('还没有上传文件') }}</p>
            <div v-else class="ss-table-wrap">
              <table class="ss-table">
                <thead><tr><th>{{ $t('文件') }}</th><th>{{ $t('类型') }}</th><th class="num">{{ $t('大小') }}</th><th>{{ $t('上传时间') }}</th></tr></thead>
                <tbody>
                  <tr v-for="f in m.files" :key="f.id"><td>{{ f.name }}</td><td>{{ FILE_KIND_LABEL[f.kind] || f.kind }}</td><td class="num">{{ fmtSize(f.size) }}</td><td>{{ fmtMs(f.uploadedAt) }}</td></tr>
                </tbody>
              </table>
            </div>
            <div class="mm-dt__sub">
              <b>{{ $t('处理记录') }}</b>
              <span v-if="m.process" class="ss-muted">{{ $t('{stage} · {p}%', { stage: STAGE_LABEL[m.process.stage], p: Math.round(m.process.progress || 0) }) }}<template v-if="m.process.finishedAt"> · {{ $t('完成于 {t}', { t: fmtMs(m.process.finishedAt) }) }}</template></span>
              <span class="mm-grow"></span>
              <button v-if="d.my.isHost && m.status === 'failed'" type="button" class="ss-btn sm primary" :disabled="!!busy" data-test="mm-files-retry" @click="runAction('retry')">
                <i :class="busy === 'retry' ? 'ri-loader-4-line spin' : 'ri-restart-line'"></i>{{ $t('重试') }}
              </button>
            </div>
            <p v-if="m.process?.error" class="ss-note danger"><i class="ri-error-warning-line"></i>{{ m.process.error }}</p>
            <p v-if="!m.process?.log?.length" class="mm-dt__empty">{{ $t('还没有处理记录') }}</p>
            <ol v-else class="mm-log">
              <li v-for="(l, i) in m.process.log" :key="i"><time>{{ fmtMs(l.at) }}</time><span>{{ l.text }}</span></li>
            </ol>
          </template>

          <!-- 执行方案 -->
          <PlanPanel v-else-if="tab === 'plan'" :detail="d" @changed="onChildChanged" />

          <!-- 关联任务 -->
          <template v-else-if="tab === 'tasks'">
            <p v-if="!d.tasks.length" class="mm-dt__empty">{{ $t('这场会议还没有派发任务') }}</p>
            <ul v-else class="mm-tasks" data-test="mm-meeting-tasks">
              <li v-for="t in d.tasks" :key="t.id" @click="openLink({ kind: 'task', id: t.id })">
                <div class="mm-tasks__main">
                  <strong>{{ t.title }}</strong>
                  <small>{{ t.deptName }} · {{ t.assigneeName }} · {{ $t('截止 {d}', { d: t.due }) }}</small>
                </div>
                <span class="mm-tasks__bar"><i :class="{ bad: t.overdue }" :style="{ width: `${Math.max(0, Math.min(100, t.percent || 0))}%` }"></i></span>
                <small class="mm-tasks__pct">{{ Math.round(t.percent || 0) }}%</small>
                <span v-if="t.overdue" class="ss-chip bad">{{ $t('逾期 {n} 天', { n: t.overdueDays }) }}</span>
                <span class="ss-chip" :class="taskTone(t)">{{ objectionLabel(t.objection) || TASK_STATUS_LABEL[t.status] }}</span>
                <i class="ri-arrow-right-s-line" aria-hidden="true"></i>
              </li>
            </ul>
          </template>
        </div>

        <!-- 右侧栏：决议事项 + 参会人 -->
        <aside class="mm-dt__side">
          <MinutesDraftSide :detail="d" @changed="onChildChanged" />
          <section class="mm-side">
            <h5>{{ $t('参会人') }} <span>{{ m.attendeeIds.length }}</span><small v-if="confirmHint"> · {{ confirmHint }}</small></h5>
            <div class="mm-avatars">
              <span
                v-for="pid in m.attendeeIds"
                :key="pid"
                class="mm-av"
                :class="{ host: pid === m.hostId }"
                :style="{ background: avatarOf(nameOf(pid)).color }"
                :title="pid === m.hostId ? $t('{name}（主持人）', { name: nameOf(pid) }) : nameOf(pid)"
              >{{ avatarOf(nameOf(pid)).text }}</span>
            </div>
          </section>
        </aside>
      </div>
    </template>
  </section>
</template>

<script setup lang="ts">
/**
 * 会议智能管理 · 会议详情（原型 02-会议.png 右侧）。
 * 顶部 sticky：标题、状态、「上传—处理—发言确认—终审—定稿—方案—已派发」进度；基本信息行；当前环节的操作横幅。
 * 页签：纪要内容 / 发言确认 x/y / 转写原文 / 文件与处理记录 / 执行方案 / 关联任务；右侧：AI 识别的决议事项、参会人。
 * 按钮按 meeting.get 返回的 my 和状态显示，越权由主进程再拦一次。
 */
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import type { MmMeeting, MmMeetingStatus, MmProcessStage, MmTaskView } from '../../../shared/meetingMgmt/types';
import { t as i18nT } from '../../i18n';
import { useNotificationStore } from '../../stores/notification';
import {
  MEETING_SOURCE_LABEL, MEETING_STATUS_LABEL, MEETING_STEPS, TASK_STATUS_LABEL,
  avatarOf, errorMessage, fmtClock, meetingStepIndex, mm, mmBoot, objectionLabel, onMmEvent, openLink,
} from './shared';
import {
  FILE_KIND_LABEL, MEETING_STATUS_TONE, STAGE_LABEL, fmtDuration, fmtMs, fmtSize, meetingRoleLabel, speakerName,
  speakerPersonId, type MmMeetingDetail, type MmTone,
} from './meetingUi';
import UploadPanel from './UploadPanel.vue';
import SpeakerAssignPanel from './SpeakerAssignPanel.vue';
import MinutesDraftSide from './MinutesDraftSide.vue';
import MinutesPanel from './MinutesPanel.vue';
import PlanPanel from './PlanPanel.vue';

type TabKey = 'minutes' | 'confirm' | 'transcript' | 'files' | 'plan' | 'tasks';
type ActionKey = 'pick' | 'retry' | 'confirm' | 'approve' | 'generate' | 'none' | 'goPlan' | 'goTasks' | 'goMinutes' | 'goConfirm' | 'reprocess';

const props = defineProps<{ meetingId: string; focus?: { tab?: string; anchor?: string; seq: number } | null }>();
const emit = defineEmits<{ (e: 'changed'): void; (e: 'role', label: string): void }>();

const notif = useNotificationStore();
const d = ref<MmMeetingDetail | null>(null);
const error = ref('');
const busy = ref<ActionKey | ''>('');
const tab = ref<TabKey>('minutes');
const anchor = ref('');
const anchorSeq = ref(0);
const live = ref<{ stage: MmProcessStage; progress: number; text?: string; at: number } | null>(null);
const now = ref(Date.now());
const waitFrom = ref(0);

/** 只在 d 有值的模板分支和带判空的逻辑里用 */
const m = computed(() => d.value?.meeting as MmMeeting);
const meId = computed(() => mmBoot.value?.me?.person?.id);
const timeoutHours = computed(() => mmBoot.value?.settings?.confirmTimeoutHours ?? 24);
const stepIdx = computed(() => meetingStepIndex(m.value.status));
const tone = computed<MmTone>(() => MEETING_STATUS_TONE[m.value.status] || 'muted');
const statusText = computed(() => {
  const st = m.value.status;
  if (st === 'pending_confirm' && d.value?.confirm.total) return i18nT('待确认 {a}/{b}', { a: d.value.confirm.done, b: d.value.confirm.total });
  return MEETING_STATUS_LABEL[st];
});
const procStage = computed<MmProcessStage>(() => live.value?.stage || m.value.process?.stage || 'extract');
const procPct = computed(() => Math.max(0, Math.min(100, Math.round(live.value?.progress ?? m.value.process?.progress ?? 0))));
const transcript = computed(() => [...m.value.segments].sort((a, b) => a.start - b.start));
const myConf = computed(() => m.value.confirmations.find((c) => c.personId === meId.value));
/** 主持人定稿前可用当前的转写模型重新转写（换了更准的模型后用） */
const canReprocess = computed(() => !!d.value?.my.isHost && d.value.projectStatus === 'active' && ['pending_assign', 'pending_confirm', 'pending_review', 'failed'].includes(m.value.status) && m.value.files.some((f) => f.kind === 'audio' || f.kind === 'video'));
const nameOf = (id: string | undefined) => (id ? d.value?.names[id]?.name || '' : '');
const sourceText = computed(() => {
  const kinds = [...new Set(m.value.files.map((f) => f.kind))].map((k) => FILE_KIND_LABEL[k]).join(' / ');
  return kinds ? `${MEETING_SOURCE_LABEL[m.value.source]} ${kinds}` : MEETING_SOURCE_LABEL[m.value.source];
});
const confirmHint = computed(() => {
  const c = d.value?.confirm;
  if (!c?.total) return '';
  return c.done >= c.total ? i18nT('均已确认') : i18nT('已确认 {a}/{b}', { a: c.done, b: c.total });
});
function segCountOf(personId: string): number {
  return m.value.segments.filter((s) => speakerPersonId(m.value, s.speakerLabel) === personId).length;
}
function taskTone(t: MmTaskView): MmTone {
  if (t.objection) return 'warn';
  if (t.status === 'done') return 'ok';
  if (t.status === 'cancelled') return 'muted';
  if (t.status === 'to_accept') return 'brand';
  return 'muted';
}

const tabs = computed(() => {
  if (!d.value) return [];
  const c = d.value.confirm;
  const list: Array<{ key: TabKey; title: string; extra?: string }> = [
    { key: 'minutes', title: i18nT('纪要内容') },
    { key: 'confirm', title: i18nT('发言确认'), extra: c?.total ? `${c.done}/${c.total}` : '' },
    { key: 'transcript', title: i18nT('转写原文') },
    { key: 'files', title: i18nT('文件与处理记录') },
  ];
  if (m.value.plan || (['pending_owner', 'plan_confirm', 'dispatched'] as MmMeetingStatus[]).includes(m.value.status)) list.push({ key: 'plan', title: i18nT('执行方案') });
  if (m.value.status === 'dispatched' || d.value?.tasks.length) list.push({ key: 'tasks', title: i18nT('关联任务'), extra: d.value?.tasks.length ? String(d.value.tasks.length) : '' });
  return list;
});
watch(tabs, (list) => { if (list.length && !list.some((t) => t.key === tab.value)) tab.value = 'minutes'; });

interface Banner { tone: MmTone; icon: string; title: string; desc?: string; actions: Array<{ key: ActionKey; label: string; kind: 'primary' | 'soft' | 'plain' }> }
const banner = computed<Banner | null>(() => {
  const dt = d.value;
  if (!dt) return null;
  const mt = dt.meeting;
  const my = dt.my;
  const host = nameOf(mt.hostId);
  const readonly = dt.projectStatus === 'archived';
  const act = (key: ActionKey, label: string, kind: 'primary' | 'soft' | 'plain' = 'primary') => (readonly ? [] : [{ key, label, kind }]);
  const wait = (title: string, desc?: string): Banner => ({ tone: 'muted', icon: 'ri-time-line', title, desc, actions: [] });
  switch (mt.status) {
    case 'pending_upload':
      return my.isHost
        ? { tone: 'warn', icon: 'ri-upload-cloud-2-line', title: i18nT('上传会议文件，开始转写和整理'), desc: i18nT('录音、录屏、文字记录都支持；优先上传录音或录屏，能按声纹自动认出发言人'), actions: act('pick', i18nT('选择文件')) }
        : wait(i18nT('等待主持人 {name} 上传会议文件', { name: host }));
    case 'processing':
      return { tone: 'brand', icon: 'ri-loader-4-line spin', title: i18nT('正在处理：{stage}', { stage: STAGE_LABEL[procStage.value] }), desc: i18nT('完成后自动通知每位发言人确认本人发言'), actions: [] };
    case 'failed':
      return my.isHost
        ? { tone: 'bad', icon: 'ri-error-warning-line', title: i18nT('处理失败'), desc: mt.process?.error || '', actions: act('retry', i18nT('重试')) }
        : { tone: 'bad', icon: 'ri-error-warning-line', title: i18nT('处理失败，等待主持人 {name} 重试', { name: host }), desc: mt.process?.error || '', actions: [] };
    case 'pending_assign': {
      const n = mt.speakers.filter((s) => !s.personId).length;
      return my.isHost
        ? { tone: 'warn', icon: 'ri-user-search-line', title: i18nT('有 {n} 位发言人没认出来，请先指认', { n }), desc: i18nT('试听片段后从参会人里选人；全部指认完自动进入发言确认'), actions: tab.value === 'minutes' ? [] : act('goMinutes', i18nT('去指认')) }
        : wait(i18nT('等待主持人 {name} 指认发言人', { name: host }));
    }
    case 'pending_confirm': {
      const c = dt.confirm;
      if (myConf.value?.status === 'pending') {
        const mine = mt.segments.filter((s) => my.myLabels.includes(s.speakerLabel) || speakerPersonId(mt, s.speakerLabel) === meId.value).length;
        const returned = myConf.value.returnedAt ? i18nT('主持人退回了你的发言：{note}。改完后重新确认。', { note: myConf.value.returnNote || i18nT('（没有写原因）') }) : '';
        return { tone: returned ? 'warn' : 'brand', icon: 'ri-chat-check-line', title: i18nT('请核对你的 {n} 段发言', { n: mine }), desc: returned || i18nT('有误的直接在纪要里修改；没问题就点「确认我的发言」'), actions: act('confirm', i18nT('确认我的发言')) };
      }
      if (myConf.value?.status === 'confirmed') return { tone: 'ok', icon: 'ri-check-double-line', title: i18nT('你已确认本人发言'), desc: i18nT('其他发言人确认中（{a}/{b}），全部确认后进入主持人终审', { a: c.done, b: c.total }), actions: [] };
      return { tone: 'brand', icon: 'ri-chat-check-line', title: i18nT('发言人确认中 {a}/{b}', { a: c.done, b: c.total }), desc: my.isHost ? i18nT('全部确认后自动进入你的终审；超时未确认的系统自动催办') : i18nT('全部确认后进入主持人终审'), actions: tab.value === 'confirm' ? [] : [{ key: 'goConfirm', label: i18nT('查看确认进度'), kind: 'soft' }] };
    }
    case 'pending_review':
      return my.isHost
        ? { tone: 'brand', icon: 'ri-check-line', title: i18nT('{n} 位发言人已全部确认，等你终审', { n: dt.confirm.total }), desc: i18nT('可直接修改任意段落，或把某段退回给指定发言人（只有被退回的人需要重新确认）'), actions: act('approve', i18nT('审核通过')) }
        : wait(i18nT('发言人已全部确认，等待主持人 {name} 终审', { name: host }));
    case 'finalized':
      return my.isHost
        ? {
          tone: 'ok', icon: 'ri-file-shield-2-line', title: i18nT('纪要已定稿，下一步：是否生成任务？'),
          desc: mt.decisions.length ? i18nT('AI 识别出 {n} 项决议事项；选「生成任务」由 AI 拆成执行方案，再由你指定任务负责人', { n: mt.decisions.length }) : i18nT('没有识别到决议事项，一般选「无需生成任务」结束会议'),
          actions: readonly ? [] : [{ key: 'generate', label: i18nT('生成任务'), kind: 'primary' }, { key: 'none', label: i18nT('无需生成任务'), kind: 'plain' }],
        }
        : wait(i18nT('纪要已定稿，等待主持人 {name} 选择是否生成任务', { name: host }));
    case 'ended':
      return { tone: 'muted', icon: 'ri-flag-line', title: i18nT('会议已结束（无需生成任务）'), desc: mt.finalizedAt ? i18nT('纪要于 {t} 定稿', { t: fmtMs(mt.finalizedAt) }) : '', actions: [] };
    case 'pending_owner':
      return my.isHost
        ? { tone: 'brand', icon: 'ri-user-star-line', title: i18nT('执行方案已生成，请指定任务负责人'), desc: i18nT('任务负责人负责确认方案；确认后自动下发给各部门负责人'), actions: tab.value === 'plan' ? [] : act('goPlan', i18nT('去指定')) }
        : wait(i18nT('执行方案已生成，等待主持人 {name} 指定任务负责人', { name: host }));
    case 'plan_confirm':
      return my.isPlanOwner
        ? { tone: 'brand', icon: 'ri-file-list-3-line', title: i18nT('请确认执行方案'), desc: i18nT('可以编辑任务、增删、设完成时间；确认后按部门下发给第一负责人'), actions: tab.value === 'plan' ? [] : act('goPlan', i18nT('去确认方案')) }
        : wait(i18nT('等待任务负责人 {name} 确认方案', { name: (mt.plan?.ownerIds?.length ? mt.plan.ownerIds : mt.plan?.ownerId ? [mt.plan.ownerId] : []).map((id) => nameOf(id)).filter(Boolean).join(i18nT('、')) }));
    case 'dispatched':
      return { tone: 'ok', icon: 'ri-send-plane-line', title: i18nT('已派发 {n} 项任务', { n: dt.tasks.length || mt.taskIds.length }), desc: i18nT('各部门负责人接收后开始执行，进度在「任务」里跟进'), actions: tab.value === 'tasks' ? [] : [{ key: 'goTasks', label: i18nT('查看关联任务'), kind: 'soft' }] };
    default:
      return null;
  }
});

async function refresh(): Promise<void> {
  const id = props.meetingId;
  try {
    const r = await mm<MmMeetingDetail>('meeting.get', { id });
    if (id !== props.meetingId) return;
    d.value = r;
    error.value = '';
    if (r?.meeting?.status !== 'processing') live.value = null;
  } catch (e) {
    error.value = errorMessage(e);
  }
}
function onChildChanged(): void {
  void refresh();
  emit('changed');
}
/** 连着来的变更事件合成一次刷新（一次操作主进程可能发好几个 changed） */
let refreshTimer: ReturnType<typeof setTimeout> | null = null;
function scheduleRefresh(): void {
  if (refreshTimer) clearTimeout(refreshTimer);
  refreshTimer = setTimeout(() => { refreshTimer = null; void refresh(); }, 300);
}

async function runAction(key: ActionKey): Promise<void> {
  if (key === 'goPlan') { tab.value = 'plan'; return; }
  if (key === 'goTasks') { tab.value = 'tasks'; return; }
  if (key === 'goMinutes') { tab.value = 'minutes'; return; }
  if (key === 'goConfirm') { tab.value = 'confirm'; return; }
  if (!d.value || busy.value) return;
  const id = d.value.meeting.id;
  if (key === 'approve' && !window.confirm(i18nT('审核通过后纪要锁定，不能再改，并通知全部参会人。确定通过？'))) return;
  if (key === 'none' && !window.confirm(i18nT('确定无需生成任务？会议将直接结束。'))) return;
  if (key === 'reprocess' && !window.confirm(i18nT('用当前的转写模型把这场会议重新转写一遍？发言人识别、确认状态和对纪要的修改都会清掉，处理完重新走确认。'))) return;
  busy.value = key;
  error.value = '';
  try {
    if (key === 'pick') {
      const r = await mm<unknown>('meeting.pickFiles', { id });
      if (r) notif.success(i18nT('文件已上传，开始处理'));
    } else if (key === 'retry') {
      await mm('meeting.retry', { id });
    } else if (key === 'reprocess') {
      await mm('meeting.reprocess', { id });
      notif.success(i18nT('已开始重新转写'));
    } else if (key === 'confirm') {
      await mm('meeting.confirm', { id });
      notif.success(i18nT('已确认你的发言'));
    } else if (key === 'approve') {
      await mm('meeting.review.approve', { id });
      notif.success(i18nT('纪要已定稿，已通知参会人'));
    } else if (key === 'generate') {
      await mm('meeting.decide', { id, decision: 'generate' });
      notif.success(i18nT('执行方案已生成，下一步指定任务负责人'));
      tab.value = 'plan';
    } else if (key === 'none') {
      await mm('meeting.decide', { id, decision: 'none' });
    }
    await refresh();
    emit('changed');
  } catch (e) {
    error.value = errorMessage(e);
    notif.error(errorMessage(e));
  } finally {
    busy.value = '';
  }
}

// 首页 / 通知点进来：定位到页签或段落
watch(() => props.focus?.seq, () => {
  const f = props.focus;
  if (!f) return;
  const keys: TabKey[] = ['minutes', 'confirm', 'transcript', 'files', 'plan', 'tasks'];
  if (f.tab && keys.includes(f.tab as TabKey)) tab.value = f.tab as TabKey;
  if (f.anchor) {
    if (keys.includes(f.anchor as TabKey)) tab.value = f.anchor as TabKey;
    else { tab.value = 'minutes'; anchor.value = f.anchor; anchorSeq.value = f.seq; }
  }
}, { immediate: true });

watch(() => meetingRoleLabel(d.value, meId.value), (r) => { if (r) emit('role', r); }, { immediate: true });

let ticker: ReturnType<typeof setInterval> | null = null;
watch(() => d.value?.meeting.status === 'processing', (on) => {
  if (on && !ticker) ticker = setInterval(() => { now.value = Date.now(); }, 1000);
  if (!on && ticker) { clearInterval(ticker); ticker = null; }
}, { immediate: true });

let off: (() => void) | null = null;
onMounted(() => {
  void refresh();
  off = onMmEvent((ev) => {
    // 别处改了这场会议（手机上确认发言、切身份代办、另一个窗口改发言人…）：详情跟着刷新，不用手动重进
    if (ev?.type === 'changed') {
      if (ev.scope === 'all' || (ev.scope === 'meeting' && (!ev.id || ev.id === props.meetingId))) scheduleRefresh();
      return;
    }
    if (ev?.type !== 'process' || ev.meetingId !== props.meetingId) return;
    live.value = { stage: ev.stage, progress: ev.progress, text: ev.text, at: Date.now() };
    now.value = Date.now();
    if (ev.stage === 'done' || (d.value && d.value.meeting.status !== 'processing')) void refresh();
  });
});
onBeforeUnmount(() => {
  off?.();
  if (refreshTimer) clearTimeout(refreshTimer);
  if (ticker) clearInterval(ticker);
});
defineExpose({ refresh });
</script>

<style scoped>
.mm-dt { display: grid; gap: 14px; align-content: start; min-width: 0; padding: 0 26px 26px; border: 1px solid var(--color-border); border-radius: var(--radius-6); background: var(--color-bg-card); }
.mm-dt > .ss-note:first-child { margin-top: 22px; }
.mm-grow { flex: 1; }

.mm-dt__sticky { position: sticky; top: 0; z-index: 3; display: grid; gap: 8px; margin: 0 -26px; padding: 22px 26px 10px; background: var(--color-bg-card); border-radius: var(--radius-6) var(--radius-6) 0 0; }
.mm-dt__titlerow { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; }
.mm-dt__titlerow h3 { margin: 0; font-size: 22px; font-weight: 800; }
.mm-steps { list-style: none; margin: 0; padding: 0; display: flex; align-items: center; flex-wrap: wrap; gap: 4px 0; font-size: var(--font-size-md); color: var(--color-text-secondary); }
.mm-steps li { display: inline-flex; align-items: center; gap: 6px; white-space: nowrap; }
.mm-steps li + li::before { content: ''; width: 26px; height: 1px; margin: 0 8px; background: var(--color-border); }
.mm-steps__dot { width: 8px; height: 8px; border-radius: 50%; background: var(--color-border); flex: 0 0 auto; }
.mm-steps li.done { color: var(--color-text-primary); }
.mm-steps li.done .mm-steps__dot { background: color-mix(in srgb, var(--color-brand) 55%, var(--color-bg-card)); }
.mm-steps li.done + li::before, .mm-steps li.cur::before { background: color-mix(in srgb, var(--color-brand) 45%, var(--color-border)); }
.mm-steps li.cur { color: var(--color-brand); font-weight: 700; }
.mm-steps li.cur .mm-steps__dot { background: var(--color-brand); box-shadow: 0 0 0 3px color-mix(in srgb, var(--color-brand) 22%, transparent); }
.mm-steps li.bad { color: var(--color-danger); }
.mm-steps li.bad .mm-steps__dot { background: var(--color-danger); box-shadow: 0 0 0 3px color-mix(in srgb, var(--color-danger) 22%, transparent); }
.mm-dt__procline { display: flex; align-items: center; gap: 10px; }
.mm-dt__procbar { flex: 1; height: 4px; border-radius: 2px; background: var(--color-bg-hover); overflow: hidden; }
.mm-dt__procbar i { display: block; height: 100%; background: var(--color-brand); transition: width .3s; }
.mm-dt__procline small { color: var(--color-brand); font-size: var(--font-size-sm); white-space: nowrap; }

.mm-dt__info { margin: -6px 0 0; display: flex; flex-wrap: wrap; gap: 4px 0; color: var(--color-text-secondary); font-size: var(--font-size-md); }
.mm-dt__info span + span::before { content: '·'; margin: 0 8px; }

.mm-banner { display: flex; align-items: center; gap: 14px; padding: 16px 20px; border-radius: var(--radius-5); border: 1px solid color-mix(in srgb, var(--color-brand) 30%, var(--color-border)); background: color-mix(in srgb, var(--color-brand) 6%, var(--color-bg-card)); flex-wrap: wrap; }
.mm-banner__icon { width: 40px; height: 40px; border-radius: var(--radius-4); display: inline-flex; align-items: center; justify-content: center; background: var(--color-brand); color: var(--color-on-accent); font-size: 20px; flex: 0 0 auto; }
.mm-banner__text { flex: 1; min-width: 220px; display: grid; gap: 3px; }
.mm-banner__text strong { font-size: 16px; }
.mm-banner__text small { color: var(--color-text-secondary); font-size: 12.5px; line-height: 1.55; }
.mm-banner__ops { display: flex; gap: 8px; flex-wrap: wrap; }
.mm-banner.ok { border-color: color-mix(in srgb, var(--color-success) 35%, var(--color-border)); background: color-mix(in srgb, var(--color-success) 6%, var(--color-bg-card)); }
.mm-banner.ok .mm-banner__icon { background: var(--color-success); }
.mm-banner.warn { border-color: color-mix(in srgb, var(--color-warning) 40%, var(--color-border)); background: color-mix(in srgb, var(--color-warning) 7%, var(--color-bg-card)); }
.mm-banner.warn .mm-banner__icon { background: var(--color-warning); }
.mm-banner.bad { border-color: color-mix(in srgb, var(--color-danger) 40%, var(--color-border)); background: color-mix(in srgb, var(--color-danger) 6%, var(--color-bg-card)); }
.mm-banner.bad .mm-banner__icon { background: var(--color-danger); }
.mm-banner.muted { border-color: var(--color-border); background: var(--color-bg-hover); }
.mm-banner.muted .mm-banner__icon { background: color-mix(in srgb, var(--color-text-secondary) 60%, transparent); }

.mm-btn { display: inline-flex; align-items: center; justify-content: center; gap: 6px; min-width: 120px; height: 42px; padding: 0 20px; border-radius: var(--radius-4); border: 1px solid var(--color-border); background: var(--color-bg-card); color: var(--color-text-primary); font: inherit; font-size: var(--font-size-md); font-weight: 700; cursor: pointer; white-space: nowrap; }
.mm-btn:disabled { opacity: .6; cursor: not-allowed; }
.mm-btn.primary { background: var(--color-brand); border-color: var(--color-brand); color: var(--color-on-accent); }
.mm-btn.primary:hover:where(:not(:disabled)) { filter: brightness(1.06); }
.mm-btn.soft { background: color-mix(in srgb, var(--color-brand) 7%, var(--color-bg-card)); border-color: color-mix(in srgb, var(--color-brand) 35%, var(--color-border)); color: var(--color-brand); }
.mm-btn.plain:hover:where(:not(:disabled)) { border-color: var(--color-brand); color: var(--color-brand); }

.mm-dt__tabs { display: flex; gap: 28px; border-bottom: 1px solid var(--color-border); overflow-x: auto; scrollbar-width: thin; }
.mm-dt__tabs button { position: relative; display: inline-flex; align-items: center; gap: 6px; padding: 12px 0 11px; border: none; background: transparent; color: var(--color-text-secondary); font: inherit; font-size: 15px; cursor: pointer; white-space: nowrap; }
.mm-dt__tabs button::after { content: ''; position: absolute; inset-inline: 0; bottom: -1px; height: 2px; background: transparent; }
.mm-dt__tabs button.on { color: var(--color-text-primary); font-weight: 700; }
.mm-dt__tabs button.on::after { background: var(--color-brand); }
.mm-dt__tabs button:hover { color: var(--color-brand); }
.mm-dt__extra { padding: 0 6px; border-radius: var(--radius-3); background: var(--color-bg-hover); color: var(--color-text-secondary); font-size: var(--font-size-sm); font-weight: 600; }

.mm-dt__grid { container-type: inline-size; display: grid; grid-template-columns: minmax(0, 1fr) 260px; gap: 20px; align-items: start; }
/* 按详情区自身宽度收成单栏（窗口里还有左侧会议列表，看视口宽度不准） */
@container (max-width: 720px) { .mm-dt__grid > * { grid-column: 1 / -1; } }
.mm-dt__main { display: grid; gap: 12px; min-width: 0; align-content: start; }
.mm-dt__empty { margin: 0; padding: 12px 14px; border-radius: var(--radius-4); background: var(--color-bg-hover); color: var(--color-text-secondary); font-size: 12.5px; }
.mm-dt__sub { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; font-size: var(--font-size-md); }
.mm-dt__note { display: block; margin-top: 2px; color: var(--color-danger); font-size: 11px; white-space: normal; }

.mm-person { display: inline-flex; align-items: center; gap: 8px; }
.mm-av { width: 34px; height: 34px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; color: var(--color-on-accent); font-size: var(--font-size-md); font-weight: 700; flex: 0 0 auto; }
.mm-av.sm { width: 24px; height: 24px; font-size: 11.5px; }

.mm-raw, .mm-log { list-style: none; margin: 0; padding: 0; display: grid; gap: 6px; font-size: var(--font-size-md); line-height: 1.6; }
.mm-raw li { display: grid; grid-template-columns: 64px auto minmax(0, 1fr); gap: 10px; align-items: baseline; padding: 4px 0; border-bottom: 1px dashed var(--color-border); }
.mm-raw time, .mm-log time { color: var(--color-text-secondary); font-variant-numeric: tabular-nums; font-size: var(--font-size-sm); }
.mm-raw b { white-space: nowrap; }
.mm-log { font-size: 12.5px; }
.mm-log li { display: grid; grid-template-columns: 130px minmax(0, 1fr); gap: 10px; }
.mm-log li span { overflow-wrap: anywhere; }

.mm-tasks { list-style: none; margin: 0; padding: 0; display: grid; gap: 8px; }
.mm-tasks li { display: flex; align-items: center; gap: 10px; padding: 12px 14px; border: 1px solid var(--color-border); border-radius: var(--radius-4); cursor: pointer; flex-wrap: wrap; }
.mm-tasks li:hover { border-color: color-mix(in srgb, var(--color-brand) 45%, var(--color-border)); }
.mm-tasks__main { flex: 1; min-width: 220px; display: grid; gap: 2px; }
.mm-tasks__main small { color: var(--color-text-secondary); font-size: 12.5px; }
.mm-tasks__bar { width: 110px; height: 6px; border-radius: 3px; background: var(--color-bg-hover); overflow: hidden; }
.mm-tasks__bar i { display: block; height: 100%; background: var(--color-brand); }
.mm-tasks__bar i.bad { background: var(--color-danger); }
.mm-tasks__pct { color: var(--color-text-secondary); font-variant-numeric: tabular-nums; min-width: 34px; }

.mm-dt__side { display: grid; gap: 14px; align-content: start; }
.mm-side { display: grid; gap: 10px; padding: 16px 18px; border: 1px solid var(--color-border); border-radius: var(--radius-5); background: var(--color-bg-card); }
.mm-side h5 { margin: 0; font-size: 15px; font-weight: 800; }
.mm-side h5 span, .mm-side h5 small { color: var(--color-text-secondary); font-weight: 500; font-size: var(--font-size-sm); }
.mm-avatars { display: flex; flex-wrap: wrap; padding-inline-start: 6px; }
.mm-avatars .mm-av { margin-inline-start: -6px; border: 2px solid var(--color-bg-card); }
.mm-avatars .mm-av.host { box-shadow: 0 0 0 2px var(--color-brand); }
.spin { animation: mm-spin 1s linear infinite; }
@keyframes mm-spin { to { transform: rotate(360deg); } }
</style>
