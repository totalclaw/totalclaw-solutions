<template>
  <section class="mm-pd" data-test="mm-project-detail">
    <p v-if="loading && !d" class="mm-pd__loading"><i class="ri-loader-4-line spin"></i>{{ $t('加载中…') }}</p>
    <p v-if="error" class="ss-note danger"><i class="ri-error-warning-line"></i>{{ error }}</p>

    <template v-if="d && p">
      <!-- 顶部：名称 + 状态 + 进度条（sticky，滚动时始终可见） -->
      <header class="mm-pd__head">
        <div class="mm-pd__titlerow">
          <h3>{{ p.name }}</h3>
          <span class="mm-tag" :class="projectTone(p.status)" data-test="mm-project-status">{{ PROJECT_STATUS_LABEL[p.status] }}</span>
          <span class="grow"></span>
          <ol class="mm-steps" :aria-label="$t('项目状态')">
            <template v-for="(s, i) in PROJECT_STEPS" :key="s">
              <li v-if="i > 0" class="mm-steps__line" :class="{ done: i <= stepIdx }" aria-hidden="true"></li>
              <li class="mm-steps__step" :class="{ done: i < stepIdx, on: i === stepIdx }" :aria-current="i === stepIdx ? 'step' : undefined">
                <i aria-hidden="true"></i>{{ PROJECT_STATUS_LABEL[s] }}
              </li>
            </template>
          </ol>
          <div ref="moreEl" class="mm-more">
            <button type="button" class="mm-more__btn" :aria-label="$t('更多')" :aria-expanded="menuOpen" data-test="mm-project-more" @click.stop="menuOpen = !menuOpen"><i class="ri-more-fill"></i></button>
            <div v-if="menuOpen" class="mm-more__menu" role="menu">
              <button type="button" role="menuitem" :disabled="!d.can.editMembers" data-test="mm-project-edit-members" @click="menuOpen = false; membersOpen = true"><i class="ri-team-line"></i>{{ $t('编辑成员') }}</button>
              <button type="button" role="menuitem" @click="menuOpen = false; load()"><i class="ri-refresh-line"></i>{{ $t('刷新') }}</button>
            </div>
          </div>
          <button v-if="d.can.close && p.status === 'active'" type="button" class="ss-btn primary" :disabled="busy" data-test="mm-project-close" @click="closeProject">
            <i :class="busy ? 'ri-loader-4-line spin' : 'ri-flag-2-line'"></i>{{ $t('发起结项') }}
          </button>
        </div>
        <p class="mm-pd__meta">{{ $t('负责人 {owner} · {n} 位成员 · {date} 创建', { owner: d.ownerName, n: d.members.length, date: fmtDate(p.createdAt) }) }}</p>
      </header>
      <p v-if="p.desc" class="mm-pd__desc">{{ p.desc }}</p>

      <!-- 结项检查不通过：列出未完成事项 -->
      <section v-if="closeFail" class="mm-pd__fail" data-test="mm-close-fail">
        <header>
          <strong>{{ $t('结项检查未通过，还有 {n} 项未完成', { n: closeFail.length }) }}</strong>
          <button type="button" class="mm-x" :aria-label="$t('关闭')" @click="closeFail = null"><i class="ri-close-line"></i></button>
        </header>
        <p class="ss-muted">{{ $t('结项要求：所有会议已派发或已结束、所有任务已完成或已取消、没有处理中的异议。') }}</p>
        <ul class="mm-block-list">
          <li v-for="it in closeFail" :key="`${it.kind}-${it.id}`">
            <span class="mm-tag" :class="blockerView(it, d.tasks, { canArbitrate: !!d.can.close }).tone">{{ blockerView(it, d.tasks, { canArbitrate: !!d.can.close }).chip }}</span>
            <span class="t">{{ it.title }}<small> · {{ it.reason }}</small></span>
            <button type="button" class="ss-link" @click="openLink(blockerView(it, d.tasks, { canArbitrate: !!d.can.close }).link)">{{ blockerView(it, d.tasks, { canArbitrate: !!d.can.close }).action }} <i class="ri-arrow-right-s-line"></i></button>
          </li>
        </ul>
      </section>

      <!-- 5 个统计 -->
      <ul class="mm-pd__stats" data-test="mm-project-stats">
        <li><b>{{ $t('{n} 场', { n: d.stats.meetings }) }}</b><small>{{ $t('会议') }}</small></li>
        <li><b>{{ d.stats.done }} / {{ d.stats.total }}</b><small>{{ $t('任务完成') }}</small></li>
        <li :class="{ bad: d.stats.overdue > 0 }"><b>{{ d.stats.overdue }}</b><small>{{ $t('逾期任务') }}</small></li>
        <li :class="{ warn: d.stats.objections > 0 }"><b>{{ d.stats.objections }}</b><small>{{ $t('处理中异议') }}</small></li>
        <li class="brand"><b>{{ pct(d.stats.weekRate) }}%</b><small>{{ $t('本周完成率') }}</small></li>
      </ul>

      <nav class="mm-pd__tabs" role="tablist">
        <button v-for="tb in tabs" :key="tb.key" type="button" role="tab" :aria-selected="tab === tb.key" :class="{ on: tab === tb.key }" :data-test="`mm-pd-tab-${tb.key}`" @click="tab = tb.key">
          {{ tb.title }}<em v-if="tb.count !== undefined">{{ tb.count }}</em>
        </button>
      </nav>

      <!-- 概览 -->
      <div v-if="tab === 'overview'" class="mm-pd__ov">
        <div class="mm-pd__ovl">
          <section v-if="p.status === 'active' && blockers.length" class="mm-pd__blockers" data-test="mm-close-blockers">
            <h4>{{ $t('结项前需处理 · {n} 项', { n: blockers.length }) }}</h4>
            <ul class="mm-block-list">
              <li v-for="it in blockers" :key="`${it.kind}-${it.id}`">
                <span class="mm-tag" :class="blockerView(it, d.tasks, { canArbitrate: !!d.can.close }).tone">{{ blockerView(it, d.tasks, { canArbitrate: !!d.can.close }).chip }}</span>
                <span class="t" :title="it.reason ? `${it.title} · ${it.reason}` : it.title">{{ it.title }}<small v-if="it.reason"> · {{ it.reason }}</small></span>
                <button type="button" class="ss-link" :data-test="`mm-blocker-${it.id}`" @click="openLink(blockerView(it, d.tasks, { canArbitrate: !!d.can.close }).link)">{{ blockerView(it, d.tasks, { canArbitrate: !!d.can.close }).action }} <i class="ri-arrow-right-s-line"></i></button>
              </li>
            </ul>
          </section>
          <p v-else-if="p.status === 'active'" class="ss-note ok"><i class="ri-checkbox-circle-line"></i>{{ $t('会议、任务都已收尾，没有处理中的异议，可以发起结项。') }}</p>

          <section class="mm-pd__depts">
            <h4>{{ $t('各部门任务进度') }}</h4>
            <p v-if="!d.deptProgress.length" class="ss-muted">{{ $t('还没有任务') }}</p>
            <ul v-else>
              <li v-for="dp in d.deptProgress" :key="dp.deptId">
                <span class="n">{{ dp.name }}</span>
                <i class="mm-bar wide"><b :style="{ width: `${ratioPct(dp.done, dp.total)}%` }"></b></i>
                <span class="v">{{ dp.done }}/{{ dp.total }}</span>
              </li>
            </ul>
          </section>
        </div>
        <div class="mm-pd__ovr">
          <section class="mm-pd__decisions">
            <h4>{{ $t('关键决策') }} <small>{{ $t('来自会议纪要') }}</small></h4>
            <p v-if="!d.decisions.length" class="ss-muted">{{ $t('还没有定稿的决议') }}</p>
            <ol v-else class="mm-tl">
              <li v-for="(dc, i) in d.decisions" :key="i">
                <i class="mm-tl__dot" aria-hidden="true"></i>
                <div>
                  <p>{{ dc.text }}</p>
                  <time>{{ fmtMd(dc.at) }}<template v-if="dc.meetingTitle"> · <button v-if="dc.meetingId" type="button" class="mm-linkish" @click="openLink({ kind: 'meeting', id: dc.meetingId })">{{ dc.meetingTitle }}</button><template v-else>{{ dc.meetingTitle }}</template></template></time>
                </div>
              </li>
            </ol>
          </section>
          <section class="mm-pd__members">
            <h4>{{ $t('成员') }} <small>{{ d.members.length }}</small></h4>
            <div class="mm-avs">
              <i v-for="m in d.members" :key="m.id" :style="{ background: avatarOf(m.name).color }" :title="m.name" :aria-label="m.name">{{ avatarOf(m.name).text }}</i>
            </div>
          </section>
        </div>
      </div>

      <!-- 会议 -->
      <div v-else-if="tab === 'meetings'" class="mm-pd__list">
        <div class="mm-pd__listbar">
          <p class="ss-muted">{{ p.status === 'active' ? $t('项目进行中才能新建会议。') : $t('项目已结项，不能再新建会议。') }}</p>
          <span class="grow"></span>
          <button v-if="d.can.createMeeting" type="button" class="ss-btn primary sm" data-test="mm-project-new-meeting" @click="meetingOpen = true"><i class="ri-add-line"></i>{{ $t('新建会议') }}</button>
        </div>
        <p v-if="!d.meetings.length" class="ss-empty">{{ $t('这个项目还没有会议') }}</p>
        <button v-for="m in d.meetings" :key="m.id" type="button" class="mm-mrow" :data-test="`mm-pd-meeting-${m.id}`" @click="openLink({ kind: 'meeting', id: m.id })">
          <span class="t"><strong>{{ m.title }}</strong><small>{{ fmtMs(m.time) }}<template v-if="m.confirmText"> · {{ m.confirmText }}</template></small></span>
          <span v-if="m.needsMe" class="mm-tag warn">{{ $t('待你处理') }}</span>
          <span class="mm-tag" :class="meetingTone(m.status)">{{ MEETING_STATUS_LABEL[m.status] || m.status }}</span>
          <i class="ri-arrow-right-s-line" aria-hidden="true"></i>
        </button>
      </div>

      <!-- 任务 -->
      <div v-else-if="tab === 'tasks'" class="mm-pd__list">
        <TaskTable :tasks="d.tasks" group-by="status" :empty-text="$t('这个项目还没有任务')" @select="(t) => openLink({ kind: 'task', id: t.id })" />
      </div>

      <ProjectReports v-else-if="tab === 'reports'" :project="p" :focus-report-id="focusReportId" :can-generate="d.can.generateReport ?? p.status !== 'archived'" @changed="onChildChanged" />
      <ProjectSummary v-else :project="p" :can="d.can" :members="d.members" :generating="!!d.summaryGenerating" :is-owner="isOwner" @changed="onChildChanged" />
    </template>

    <ProjectMembersDialog
      v-if="d && p"
      :open="membersOpen"
      :project-id="p.id"
      :owner-id="p.ownerId"
      :member-ids="p.memberIds"
      :members="d.members"
      @close="membersOpen = false"
      @saved="onMembersSaved"
    />
    <MeetingCreateDialog v-if="d && p && meetingOpen" :project-id="p.id" @close="meetingOpen = false" @created="onMeetingCreated" />
  </section>
</template>

<script setup lang="ts">
/**
 * 项目详情（原型 04 右侧）：名称 + 状态、sticky 状态进度条（进行中—结项中—已归档）、··· 编辑成员、发起结项；
 * 5 个统计；页签 概览 / 会议 / 任务 / 进度报告 / 总结报告。
 */
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import type {
  MmCloseCheckItem, MmMeetingStatus, MmPerson, MmProject, MmTaskView,
} from '../../../shared/meetingMgmt/types';
import { t as i18nT } from '../../i18n';
import { useDialog } from '../../composables/useDialog';
import { useNotificationStore } from '../../stores/notification';
import TaskTable from './TaskTable.vue';
import ProjectReports from './ProjectReports.vue';
import ProjectSummary from './ProjectSummary.vue';
import ProjectMembersDialog from './ProjectMembersDialog.vue';
import MeetingCreateDialog from './MeetingCreateDialog.vue';
import { MEETING_STATUS_LABEL, PROJECT_STATUS_LABEL, avatarOf, errorMessage, fmtDate, mm, mmBoot, openLink } from './shared';
import {
  PROJECT_STEPS, blockerView, dedupeBlockers, fmtMd, fmtMs, pct, projectRole, projectStepIndex, projectTone, ratioPct, type ProjectTabKey, type Tone,
} from './pagesLogic';

interface ProjectGet {
  project: MmProject;
  ownerName: string;
  members: MmPerson[];
  meetings: Array<{ id: string; title: string; projectName: string; time: number; status: MmMeetingStatus; needsMe: boolean; confirmText?: string }>;
  tasks: MmTaskView[];
  stats: { meetings: number; done: number; total: number; overdue: number; objections: number; weekRate: number };
  deptProgress: Array<{ deptId: string; name: string; done: number; total: number }>;
  decisions: Array<{ text: string; at: number; meetingTitle: string; meetingId?: string }>;
  closeBlockers: MmCloseCheckItem[];
  /** 总结报告正在后台生成 */
  summaryGenerating?: boolean;
  can: { editMembers?: boolean; close?: boolean; reviewSummary?: boolean; createMeeting?: boolean; generateReport?: boolean };
}

const props = withDefaults(defineProps<{
  projectId: string;
  refreshSeq?: number;
  /** 外部要求切到某个页签（首页 / 通知点进来）；seq 变了才生效 */
  focus?: { tab: ProjectTabKey; reportId?: string; seq: number } | null;
}>(), { refreshSeq: 0, focus: null });
const emit = defineEmits<{ (e: 'changed'): void; (e: 'role', label: string): void }>();

const dialog = useDialog();
const notif = useNotificationStore();
const d = ref<ProjectGet | null>(null);
const loading = ref(false);
const busy = ref(false);
const error = ref('');
const tab = ref<ProjectTabKey>('overview');
const focusReportId = ref('');
const closeFail = ref<MmCloseCheckItem[] | null>(null);
const menuOpen = ref(false);
const membersOpen = ref(false);
const meetingOpen = ref(false);
const moreEl = ref<HTMLElement | null>(null);

const p = computed(() => d.value?.project ?? null);
const stepIdx = computed(() => (p.value ? projectStepIndex(p.value.status) : 0));
const blockers = computed(() => dedupeBlockers(d.value?.closeBlockers));
const isOwner = computed(() => !!p.value && p.value.ownerId === mmBoot.value?.me.person?.id);
const tabs = computed(() => [
  { key: 'overview' as const, title: i18nT('概览'), count: undefined as number | undefined },
  { key: 'meetings' as const, title: i18nT('会议'), count: d.value?.meetings.length ?? 0 },
  { key: 'tasks' as const, title: i18nT('任务'), count: d.value?.tasks.length ?? 0 },
  { key: 'reports' as const, title: i18nT('进度报告'), count: p.value?.weeklyReports?.length ?? 0 },
  { key: 'summary' as const, title: i18nT('总结报告'), count: undefined },
]);

function meetingTone(s: MmMeetingStatus): Tone {
  if (s === 'failed') return 'bad';
  if (s === 'dispatched' || s === 'ended') return 'ok';
  if (s === 'processing') return 'brand';
  return 'warn';
}

let reqSeq = 0;
async function load(): Promise<void> {
  if (!props.projectId) return;
  const my = ++reqSeq;
  loading.value = true;
  try {
    const r = await mm<ProjectGet>('project.get', { id: props.projectId });
    if (my !== reqSeq) return;
    d.value = r;
    emit('role', projectRole(r.project, mmBoot.value?.me.person?.id));
    error.value = '';
  } catch (e) {
    if (my === reqSeq) error.value = errorMessage(e);
  } finally {
    if (my === reqSeq) loading.value = false;
  }
}

watch(() => props.projectId, () => {
  d.value = null;
  closeFail.value = null;
  menuOpen.value = false;
  tab.value = 'overview';
  void load();
}, { immediate: true });
watch(() => props.refreshSeq, () => { void load(); });
watch(() => props.focus?.seq, () => {
  if (!props.focus) return;
  tab.value = props.focus.tab;
  focusReportId.value = props.focus.reportId || '';
}, { immediate: true });

async function closeProject(): Promise<void> {
  if (!p.value) return;
  const ok = await dialog.confirm({
    title: i18nT('发起结项'),
    message: i18nT('先检查：所有会议已派发或已结束、所有任务已完成或已取消、没有处理中的异议。通过后项目进入「结项中」，不能再新建会议和任务，也不能撤回；AI 随后生成总结报告交你审核。'),
    confirmLabel: i18nT('检查并结项'),
  });
  if (!ok) return;
  busy.value = true;
  error.value = '';
  try {
    const r = await mm<{ ok: boolean; items: MmCloseCheckItem[] }>('project.close', { id: p.value.id });
    if (r?.ok) {
      closeFail.value = null;
      notif.success(i18nT('结项检查通过，项目进入结项中，AI 正在生成总结报告'));
      tab.value = 'summary';
    } else {
      closeFail.value = dedupeBlockers(r?.items);
    }
    await load();
    emit('changed');
  } catch (e) {
    error.value = errorMessage(e);
  } finally {
    busy.value = false;
  }
}

/** 报告 / 总结有动作（生成、审核归档）：详情重拉，左侧列表的状态与计数也跟着刷新 */
async function onChildChanged(): Promise<void> {
  await load();
  emit('changed');
}

async function onMembersSaved(): Promise<void> {
  membersOpen.value = false;
  notif.success(i18nT('成员已更新'));
  await load();
  emit('changed');
}

/** 新建会议用会议页签同一个弹窗（MeetingCreateDialog，已带上本项目）；建好跳到会议页上传文件 */
function onMeetingCreated(id: string): void {
  meetingOpen.value = false;
  emit('changed');
  if (id) openLink({ kind: 'meeting', id });
}

function onDocClick(ev: MouseEvent): void {
  if (menuOpen.value && moreEl.value && !moreEl.value.contains(ev.target as Node)) menuOpen.value = false;
}
onMounted(() => document.addEventListener('click', onDocClick));
onBeforeUnmount(() => document.removeEventListener('click', onDocClick));
</script>

<style scoped>
.mm-pd { display: grid; gap: 16px; align-content: start; min-width: 0; }
.mm-pd > .ss-note { margin: 0 26px; }
.mm-pd__loading { margin: 0; padding: 24px; color: var(--color-text-secondary); display: flex; gap: 6px; align-items: center; }
.mm-pd__head { position: sticky; top: 0; z-index: 2; display: grid; gap: 6px; padding: 22px 26px 12px; background: var(--color-bg-card); border-bottom: 1px solid var(--color-border-subtle); border-radius: var(--radius-6) var(--radius-6) 0 0; }
.mm-pd__titlerow { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
.mm-pd__titlerow h3 { margin: 0; font-size: 21px; font-weight: 700; }
.mm-pd__titlerow .grow { flex: 1; }
.mm-pd__meta { margin: 0; color: var(--color-text-secondary); font-size: 13px; }
.mm-pd__desc { margin: 0 26px; color: var(--color-text-secondary); font-size: 13px; line-height: 1.6; white-space: pre-wrap; max-width: 90ch; }
.mm-steps { list-style: none; margin: 0 4px 0 0; padding: 0; display: flex; align-items: center; gap: 8px; font-size: 13px; color: var(--color-text-muted); }
.mm-steps__step { display: inline-flex; align-items: center; gap: 6px; white-space: nowrap; }
.mm-steps__step i { width: 9px; height: 9px; border-radius: 50%; background: var(--color-border); display: inline-block; }
.mm-steps__step.done { color: var(--color-text-secondary); }
.mm-steps__step.done i { background: color-mix(in srgb, var(--color-brand) 55%, var(--color-border)); }
.mm-steps__step.on { color: var(--color-brand); font-weight: 700; }
.mm-steps__step.on i { background: var(--color-brand); box-shadow: 0 0 0 3px var(--color-brand-subtle); }
.mm-steps__line { width: 28px; height: 1px; background: var(--color-border); }
.mm-steps__line.done { background: var(--color-brand); }
.mm-more { position: relative; }
.mm-more__btn { width: 42px; height: 38px; border-radius: var(--radius-4); border: 1px solid var(--color-border); background: var(--color-bg-card); color: var(--color-text-secondary); cursor: pointer; font-size: 18px; display: grid; place-items: center; }
.mm-more__btn:hover { color: var(--color-brand); border-color: var(--color-brand); }
.mm-more__menu { position: absolute; inset-inline-end: 0; top: calc(100% + 6px); z-index: 5; min-width: 150px; padding: 4px; border-radius: var(--radius-4); border: 1px solid var(--color-border); background: var(--color-bg-elevated, var(--color-bg-card)); box-shadow: var(--shadow-pop, var(--shadow-md)); display: grid; }
.mm-more__menu button { display: flex; align-items: center; gap: 8px; padding: 7px 10px; border: none; background: none; border-radius: var(--radius-2); font: inherit; font-size: 13px; color: var(--color-text-primary); cursor: pointer; text-align: left; }
.mm-more__menu button:hover:not(:disabled) { background: var(--color-bg-hover); }
.mm-more__menu button:disabled { opacity: .5; cursor: not-allowed; }
.mm-pd__fail { margin: 0 26px; display: grid; gap: 8px; padding: 14px 16px; border-radius: var(--radius-5); border: 1px solid color-mix(in srgb, var(--color-danger) 40%, var(--color-border)); background: color-mix(in srgb, var(--color-danger) 5%, var(--color-bg-card)); }
.mm-pd__fail header { display: flex; align-items: center; justify-content: space-between; color: var(--color-danger); }
.mm-pd__fail .ss-muted { margin: 0; }
.mm-x { border: none; background: none; color: var(--color-text-secondary); cursor: pointer; font-size: 16px; }
.mm-pd__stats { list-style: none; margin: 0 26px; padding: 18px 0; display: grid; grid-template-columns: repeat(5, minmax(0, 1fr)); border-radius: var(--radius-5); background: var(--color-bg-hover); }
.mm-pd__stats li { display: grid; gap: 4px; padding: 0 24px; border-inline-start: 1px solid var(--color-border); }
.mm-pd__stats li:first-child { border-inline-start: none; }
.mm-pd__stats b { font-size: 26px; font-weight: 700; font-variant-numeric: tabular-nums; line-height: 1.2; }
.mm-pd__stats small { font-size: 12.5px; color: var(--color-text-secondary); }
.mm-pd__stats li.bad b { color: var(--color-danger); }
.mm-pd__stats li.warn b { color: var(--color-warning); }
.mm-pd__stats li.brand b { color: var(--color-brand); }
.mm-pd__tabs { display: flex; gap: 28px; margin: 4px 26px 0; border-bottom: 1px solid var(--color-border-subtle); }
.mm-pd__tabs button { position: relative; height: 42px; padding: 0; border: none; background: none; font: inherit; font-size: 14px; color: var(--color-text-secondary); cursor: pointer; display: inline-flex; align-items: center; gap: 6px; }
.mm-pd__tabs button em { font-style: normal; font-size: 11.5px; padding: 0 6px; border-radius: var(--radius-pill); background: var(--color-bg-hover); color: var(--color-text-secondary); }
.mm-pd__tabs button.on { color: var(--color-text-primary); font-weight: 700; }
.mm-pd__tabs button.on::after { content: ''; position: absolute; inset-inline: 0; bottom: -1px; height: 2px; border-radius: 1px; background: var(--color-brand); }
.mm-pd__tabs + * { margin: 0 26px 26px; }
.mm-pd__ov { display: grid; grid-template-columns: minmax(0, 1.25fr) minmax(0, 1fr); gap: 28px; align-items: start; }
.mm-pd__ovl, .mm-pd__ovr { display: grid; gap: 22px; align-content: start; min-width: 0; }
/* 嵌套的 grid 默认列宽是 auto，会被一行不换行的长标题撑开、盖到右栏上：每一层都锁成 minmax(0, 1fr) */
.mm-pd__ovl, .mm-pd__ovr, .mm-block-list, .mm-pd__depts ul, .mm-tl { grid-template-columns: minmax(0, 1fr); }
.mm-pd h4 { margin: 0 0 10px; font-size: 14.5px; display: flex; align-items: baseline; gap: 8px; }
.mm-pd h4 small { font-size: 12.5px; font-weight: 400; color: var(--color-text-secondary); }
.mm-pd__blockers { padding: 14px 18px; border-radius: var(--radius-5); border: 1px solid color-mix(in srgb, var(--color-danger) 35%, var(--color-border)); background: color-mix(in srgb, var(--color-danger) 4%, var(--color-bg-card)); }
.mm-pd__blockers h4 { color: var(--color-danger); }
.mm-block-list { list-style: none; margin: 0; padding: 0; display: grid; gap: 8px; }
.mm-block-list li { display: flex; align-items: center; gap: 10px; font-size: 13px; }
.mm-block-list .t { flex: 1; min-width: 0; overflow: hidden; display: -webkit-box; -webkit-box-orient: vertical; -webkit-line-clamp: 2; line-height: 1.5; overflow-wrap: anywhere; }
.mm-block-list .t small { color: var(--color-text-secondary); font-size: 12.5px; }
.mm-block-list .ss-link { display: inline-flex; align-items: center; white-space: nowrap; }
.mm-pd__depts ul { list-style: none; margin: 0; padding: 0; display: grid; gap: 14px; }
.mm-pd__depts li { display: grid; grid-template-columns: 70px minmax(0, 1fr) 40px; align-items: center; gap: 12px; font-size: 13px; }
.mm-pd__depts .n { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.mm-pd__depts .v { color: var(--color-text-secondary); text-align: right; font-variant-numeric: tabular-nums; }
.mm-bar { display: block; height: 6px; border-radius: 3px; background: var(--color-bg-hover); overflow: hidden; }
.mm-bar b { display: block; height: 100%; border-radius: 3px; background: var(--gradient-brand, var(--color-brand)); }
.mm-tl { list-style: none; margin: 0; padding: 0; display: grid; gap: 14px; }
.mm-tl li { display: grid; grid-template-columns: 10px minmax(0, 1fr); gap: 10px; position: relative; }
.mm-tl li:not(:last-child)::before { content: ''; position: absolute; inset-inline-start: 4px; top: 14px; bottom: -14px; width: 1px; background: var(--color-border); }
.mm-tl__dot { width: 9px; height: 9px; border-radius: 50%; background: var(--color-brand); margin-top: 5px; display: block; }
.mm-tl p { margin: 0; font-size: 13.5px; line-height: 1.55; }
.mm-tl time { font-size: 12px; color: var(--color-text-muted); }
.mm-linkish { border: none; background: none; padding: 0; font: inherit; color: inherit; cursor: pointer; text-decoration: underline dotted; text-underline-offset: 2px; }
.mm-linkish:hover { color: var(--color-brand); }
.mm-avs { display: flex; flex-wrap: wrap; }
.mm-avs i { width: 32px; height: 32px; border-radius: 50%; display: inline-grid; place-items: center; color: #fff; font-style: normal; font-size: 13px; font-weight: 700; border: 2px solid var(--color-bg-card); margin-inline-start: -6px; }
.mm-avs i:first-child { margin-inline-start: 0; }
.mm-pd__list { display: grid; gap: 8px; }
.mm-pd__listbar { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
.mm-pd__listbar .grow { flex: 1; }
.mm-pd__listbar .ss-muted { margin: 0; }
.mm-mrow { display: flex; align-items: center; gap: 10px; padding: 12px 14px; border: 1px solid var(--color-border); border-radius: var(--radius-4); background: var(--color-bg-card); cursor: pointer; font: inherit; color: var(--color-text-primary); text-align: left; width: 100%; }
.mm-mrow:hover { border-color: var(--color-brand); }
.mm-mrow .t { flex: 1; min-width: 0; display: grid; gap: 2px; }
.mm-mrow .t small { color: var(--color-text-secondary); font-size: 12px; }
.mm-mrow > i { color: var(--color-text-muted); }
.mm-tag { display: inline-flex; align-items: center; padding: 2px 9px; border-radius: var(--radius-2); font-size: 12px; font-weight: 700; white-space: nowrap; background: var(--color-bg-hover); color: var(--color-text-secondary); }
.mm-tag.bad { background: color-mix(in srgb, var(--color-danger) 12%, transparent); color: var(--color-danger); }
.mm-tag.warn { background: color-mix(in srgb, var(--color-warning) 16%, transparent); color: var(--color-warning); }
.mm-tag.brand { background: color-mix(in srgb, var(--color-brand) 12%, transparent); color: var(--color-brand); }
.mm-tag.ok { background: color-mix(in srgb, var(--color-success) 14%, transparent); color: var(--color-success); }
.mm-tag.muted { opacity: .8; }
.spin { animation: mm-pd-spin 1s linear infinite; }
@keyframes mm-pd-spin { to { transform: rotate(360deg); } }
@media (max-width: 1100px) {
  .mm-pd__ov { grid-template-columns: 1fr; }
  .mm-pd__stats { grid-template-columns: repeat(3, minmax(0, 1fr)); row-gap: 14px; }
  .mm-pd__stats li:nth-child(4) { border-inline-start: none; }
}
@media (prefers-reduced-motion: reduce) { .spin { animation: none; } }
</style>
