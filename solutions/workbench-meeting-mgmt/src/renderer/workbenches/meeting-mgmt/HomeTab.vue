<template>
  <div class="mm-home" data-test="mm-home">
    <p v-if="error" class="ss-note danger"><i class="ri-error-warning-line"></i><span>{{ error }}</span><button type="button" class="ss-link" @click="refresh">{{ $t('重试') }}</button></p>
    <p v-if="!home && !error" class="ss-note"><i class="ri-loader-4-line spin"></i>{{ $t('正在加载首页…') }}</p>

    <template v-if="home">
      <p v-if="pushFailed" class="ss-note danger mm-home__push" data-test="mm-home-push-failed">
        <i class="ri-error-warning-line"></i>
        <span>{{ $t('有 {n} 条企微通知没发出去，相关的人可能没收到卡片（系统内消息照常有）', { n: pushFailed }) }}</span>
        <button type="button" class="ss-link" @click="goSettings('wecom')">{{ $t('查看并重发') }}</button>
      </p>

      <!-- 问候与核心指标 -->
      <section class="mm-card mm-hello">
        <div class="mm-hello__text">
          <h2>{{ $t('{greet}，{name}', { greet: greeting, name: home.greetingName || me?.person?.name || '' }) }}</h2>
          <p data-test="mm-home-brief">{{ brief.before }}<b v-if="brief.red" class="bad">{{ brief.red }}</b>{{ brief.after }}</p>
        </div>
        <div class="mm-hello__counts">
          <div class="mm-count" :class="{ brand: home.counts.todos > 0, zero: !home.counts.todos }">
            <strong>{{ home.counts.todos }}</strong>
            <small>{{ $t('待处理') }}</small>
          </div>
          <div class="mm-count" :class="{ warn: home.counts.dueToday > 0, zero: !home.counts.dueToday }" role="button" tabindex="0" @click="goTab('tasks')" @keydown.enter="goTab('tasks')">
            <strong>{{ home.counts.dueToday }}</strong>
            <small>{{ $t('今日到期') }}</small>
          </div>
          <div class="mm-count" :class="{ bad: home.counts.overdue > 0, zero: !home.counts.overdue }" role="button" tabindex="0" @click="goTab('tasks')" @keydown.enter="goTab('tasks')">
            <strong>{{ home.counts.overdue }}</strong>
            <small>{{ $t('逾期') }}</small>
          </div>
          <div class="mm-count" :class="{ unread: home.counts.unread > 0, zero: !home.counts.unread }">
            <strong>{{ home.counts.unread }}</strong>
            <small>{{ $t('未读通知') }}</small>
          </div>
        </div>
      </section>

      <!-- 第一工作区：待我处理（主） + 通知（辅），等高并排 -->
      <div class="mm-home__primary">
        <!-- 待我处理 -->
        <section class="mm-card mm-todos" data-test="mm-home-todos">
          <header class="mm-card__head">
            <span class="mm-card__ico brand" aria-hidden="true"><i class="ri-checkbox-circle-line"></i></span>
            <h3>{{ $t('待我处理') }}</h3>
            <span class="mm-grow"></span>
            <div class="mm-chips">
              <button
                v-for="f in FILTERS"
                :key="f.key"
                type="button"
                class="mm-chip"
                :class="{ on: filter === f.key }"
                :data-test="`mm-todo-filter-${f.key}`"
                @click="filter = f.key"
              >{{ f.title }} <span>{{ groups.counts[f.key] }}</span></button>
            </div>
          </header>

          <p v-if="!shownTotal" class="mm-empty"><i class="ri-check-double-line" aria-hidden="true"></i><span>{{ $t('暂无待办') }}</span></p>
          <div v-else class="mm-todos__list">
            <template v-for="g in GROUPS" :key="g.key">
              <div v-if="groups[g.key].length" class="mm-group" :class="g.key">
                <span class="mm-group__lbl">{{ g.title }}</span><span class="mm-group__n">{{ groups[g.key].length }}</span>
                <i class="mm-group__line"></i>
                <button v-if="g.key === 'week'" type="button" class="ss-link" data-test="mm-week-toggle" @click="weekOpen = !weekOpen">
                  {{ weekOpen ? $t('收起') : $t('展开') }}<i :class="weekOpen ? 'ri-arrow-up-s-line' : 'ri-arrow-down-s-line'"></i>
                </button>
              </div>
              <template v-if="g.key !== 'week' || weekOpen">
                <article
                  v-for="t in groups[g.key]"
                  :key="t.id"
                  class="mm-todo"
                  :class="{ urgent: t.urgency === 'urgent' }"
                  :data-test="`mm-todo-${t.id}`"
                  @click="openLink(t.link)"
                >
                  <span class="mm-todo__tag">{{ tagOf(t) }}</span>
                  <div class="mm-todo__main">
                    <strong>{{ t.title }}</strong>
                    <small v-if="t.subtitle">{{ t.subtitle }}</small>
                  </div>
                  <span v-if="t.hint" class="mm-todo__hint" :class="t.urgency">{{ t.hint }}</span>
                  <button type="button" class="mm-btn" :class="t.urgency === 'urgent' ? 'primary' : 'soft'" @click.stop="openLink(t.link)">{{ TODO_ACTION_LABEL[t.type] }}</button>
                </article>
              </template>
            </template>
          </div>
        </section>

        <!-- 通知 -->
        <section class="mm-card mm-card--notices" data-test="mm-home-notices">
          <header class="mm-card__head">
            <span class="mm-card__ico bad" aria-hidden="true"><i class="ri-notification-3-line"></i></span>
            <h3>{{ $t('通知') }}</h3>
            <span v-if="home.counts.unread" class="mm-tag bad">{{ $t('{n} 未读', { n: home.counts.unread }) }}</span>
            <span class="mm-grow"></span>
            <button v-if="showAll && home.counts.unread" type="button" class="ss-link" :disabled="busy" data-test="mm-notice-readall" @click="readAll">{{ $t('全部标为已读') }}</button>
            <button type="button" class="ss-link" data-test="mm-notice-all" @click="toggleAll">
              {{ showAll ? $t('收起') : $t('全部') }}<i :class="showAll ? 'ri-arrow-up-s-line' : 'ri-arrow-right-s-line'"></i>
            </button>
          </header>
          <p v-if="!noticeList.length" class="mm-empty"><i class="ri-mail-check-line" aria-hidden="true"></i><span>{{ $t('暂无通知') }}</span></p>
          <ul v-else class="mm-notices" :class="{ all: showAll }">
            <li v-for="n in noticeList" :key="n.id" :class="{ unread: !n.read }" :data-test="`mm-notice-${n.id}`" @click="openNotice(n)">
              <i class="mm-dot" aria-hidden="true"></i>
              <div class="mm-notices__body">
                <div class="mm-notices__top"><strong>{{ n.title || NOTICE_TYPE_LABEL[n.type] }}</strong><time>{{ fmtAgo(n.at) }}</time></div>
                <small v-if="n.summary">{{ n.summary }}</small>
              </div>
            </li>
          </ul>
        </section>
      </div>

      <!-- 第二工作区：三栏平铺（我的任务 / 我参与的项目 / 最近会议），拒绝向下堆叠 -->
      <div class="mm-home__bento">
        <!-- 我的任务 · 本周截止 -->
        <section class="mm-card" data-test="mm-home-mytasks">
          <header class="mm-card__head">
            <span class="mm-card__ico warn" aria-hidden="true"><i class="ri-calendar-todo-line"></i></span>
            <h3>{{ $t('我的任务 · 本周截止') }}</h3>
            <span class="mm-grow"></span>
            <button type="button" class="ss-link" @click="goTab('tasks')">{{ $t('全部任务') }}<i class="ri-arrow-right-s-line"></i></button>
          </header>
          <p v-if="!home.myTasksThisWeek.length" class="mm-empty"><i class="ri-calendar-check-line" aria-hidden="true"></i><span>{{ $t('没有即将到期或逾期的任务') }}</span></p>
          <ul v-else class="mm-mytasks">
            <li v-for="t in home.myTasksThisWeek" :key="t.id" :data-test="`mm-mytask-${t.id}`" @click="openLink({ kind: 'task', id: t.id })">
              <div class="mm-mytasks__day"><small>{{ dueDayLabel(t.due).day }}</small><b>{{ dueDayLabel(t.due).md }}</b></div>
              <div class="mm-mytasks__body">
                <strong>{{ t.title }}</strong>
                <div class="mm-mytasks__bar">
                  <span class="mm-bar"><i :class="{ bad: t.overdue }" :style="{ width: `${clampPct(t.percent)}%` }"></i></span>
                  <span class="mm-mytasks__pct">{{ clampPct(t.percent) }}%</span>
                  <span v-if="t.overdue" class="mm-tag bad">{{ $t('逾期 {n} 天', { n: t.overdueDays }) }}</span>
                  <span v-else-if="t.objection" class="mm-tag warn">{{ objectionLabel(t.objection) }}</span>
                </div>
              </div>
            </li>
          </ul>
        </section>

        <!-- 我参与的项目 -->
        <section class="mm-card" data-test="mm-home-projects">
          <header class="mm-card__head">
            <span class="mm-card__ico brand" aria-hidden="true"><i class="ri-folder-3-line"></i></span>
            <h3>{{ $t('我参与的项目') }}</h3>
            <span class="mm-grow"></span>
            <button type="button" class="ss-link" @click="goTab('projects')">{{ $t('全部项目') }}<i class="ri-arrow-right-s-line"></i></button>
          </header>
          <p v-if="!home.projects.length" class="mm-empty"><i class="ri-folder-open-line" aria-hidden="true"></i><span>{{ $t('还没有参与的项目') }}</span></p>
          <ul v-else class="mm-rows">
            <li v-for="p in home.projects" :key="p.id" @click="openLink({ kind: 'project', id: p.id })">
              <strong>{{ p.name }}</strong>
              <span class="mm-tag" :class="p.status === 'active' ? 'brand' : p.status === 'closing' ? 'warn' : ''">{{ PROJECT_STATUS_LABEL[p.status] }}</span>
              <span class="mm-grow"></span>
              <small>{{ $t('任务 {a}/{b}', { a: p.done, b: p.total }) }}</small>
              <small v-if="p.overdue" class="bad">{{ $t('逾期 {n}', { n: p.overdue }) }}</small>
            </li>
          </ul>
        </section>

        <!-- 最近会议 -->
        <section class="mm-card" data-test="mm-home-meetings">
          <header class="mm-card__head">
            <span class="mm-card__ico ok" aria-hidden="true"><i class="ri-vidicon-line"></i></span>
            <h3>{{ $t('最近会议') }}</h3>
            <span class="mm-grow"></span>
            <button type="button" class="ss-link" @click="goTab('meetings')">{{ $t('全部会议') }}<i class="ri-arrow-right-s-line"></i></button>
          </header>
          <div v-if="!home.recentMeetings.length" class="mm-empty mm-empty--row">
            <span class="mm-empty__msg"><i class="ri-mic-line" aria-hidden="true"></i><span>{{ $t('还没有参加过会议') }}</span></span>
            <button v-if="canCreateMeeting" type="button" class="mm-btn soft sm" data-test="mm-home-new-meeting" @click="newMeeting">{{ $t('新建会议') }}</button>
          </div>
          <ul v-else class="mm-rows">
            <li v-for="m in home.recentMeetings" :key="m.id" @click="openLink({ kind: 'meeting', id: m.id })">
              <div class="mm-row__main">
                <strong>{{ m.title }}</strong>
                <small>{{ m.projectName }} · {{ fmtMd(m.time) }}</small>
              </div>
              <span class="mm-tag" :class="MEETING_STATUS_TONE[m.status]">{{ MEETING_STATUS_LABEL[m.status] }}</span>
            </li>
          </ul>
        </section>
      </div>

      <!-- 手机端紧凑横条：扫码 + 链接 + 启停，收成单行不占侧栏 -->
      <MobileAccessCard compact />
    </template>
  </div>
</template>

<script setup lang="ts">
/**
 * 会议智能管理 · 首页（横向 Bento 布局，一屏总览，不纵向堆叠）。
 * 1. 问候与核心指标卡；
 * 2. 主工作区（等高双栏）：待我处理 + 通知；
 * 3. 三栏平铺：我的任务 · 本周截止 + 我参与的项目 + 最近会议；
 * 4. 底部紧凑横条：手机端（服务开关、局域网/外网地址、可放大专属二维码）。
 */
import { computed, onMounted, ref, watch } from 'vue';
import type { MmHomeView, MmNotice, MmTodo } from '../../../shared/meetingMgmt/types';
import { t as i18nT } from '../../i18n';
import {
  MEETING_STATUS_LABEL, NOTICE_TYPE_LABEL, PROJECT_STATUS_LABEL, TODO_ACTION_LABEL, TODO_TYPE_LABEL,
  errorMessage, fmtAgo, goSettings, goTab, mm, mmBoot, objectionLabel, openLink,
} from './shared';
import {
  MEETING_STATUS_TONE, dueDayLabel, fmtMd, greetingOf, groupTodos, homeRoleLabel, pendingCreateMeeting, type TodoFilter,
} from './meetingUi';
import MobileAccessCard from './MobileAccessCard.vue';

const emit = defineEmits<{ (e: 'role', label: string): void }>();

const FILTERS: Array<{ key: TodoFilter; title: string }> = [
  { key: 'all', title: i18nT('全部') },
  { key: 'meeting', title: i18nT('会议') },
  { key: 'task', title: i18nT('任务') },
  { key: 'project', title: i18nT('项目') },
];
const GROUPS: Array<{ key: 'urgent' | 'today' | 'week'; title: string }> = [
  { key: 'urgent', title: i18nT('紧急') },
  { key: 'today', title: i18nT('今天') },
  { key: 'week', title: i18nT('本周') },
];

const home = ref<MmHomeView | null>(null);
const error = ref('');
const busy = ref(false);
const filter = ref<TodoFilter>('all');
const weekOpen = ref(false);
const showAll = ref(false);
const allNotices = ref<MmNotice[]>([]);
const me = computed(() => mmBoot.value?.me ?? home.value?.me ?? null);
const pushFailed = computed(() => (mmBoot.value?.me?.isAdmin ? mmBoot.value?.pushFailed || 0 : 0));

const greeting = computed(() => greetingOf(new Date().getHours()));
const allGroups = computed(() => groupTodos(home.value?.todos ?? [], 'all'));
const groups = computed(() => groupTodos(home.value?.todos ?? [], filter.value));
const todayCount = computed(() => allGroups.value.today.length);
/** 「今天有 2 件紧急、3 件需在今天完成的事项」：整句走词条，标红的那段用占位符切出来 */
const MARK = '\u0001';
const brief = computed(() => {
  const u = allGroups.value.urgent.length;
  const d = todayCount.value;
  let s: string;
  if (u && d) s = i18nT('今天有 {urgent}、{n} 件需在今天完成的事项', { urgent: MARK, n: d });
  else if (u) s = i18nT('今天有 {urgent}的事项', { urgent: MARK });
  else if (d) s = i18nT('今天有 {n} 件需在今天完成的事项', { n: d });
  else s = i18nT('今天没有紧急或需要今天完成的事项');
  const at = s.indexOf(MARK);
  if (at < 0) return { before: s, red: '', after: '' };
  return { before: s.slice(0, at), red: i18nT('{n} 件紧急', { n: u }), after: s.slice(at + MARK.length) };
});
const shownTotal = computed(() => groups.value.urgent.length + groups.value.today.length + groups.value.week.length);
const noticeList = computed(() => (showAll.value ? allNotices.value : (home.value?.notices ?? []).slice(0, 5)));
const canCreateMeeting = computed(() => (home.value?.projects ?? []).some((p) => p.status === 'active'));

/** 待办类型标签；逾期的「更新进度」按原型叫「任务逾期」 */
function tagOf(t: MmTodo): string {
  if (t.type === 'update_progress' && t.urgency === 'urgent') return i18nT('任务逾期');
  return TODO_TYPE_LABEL[t.type] || t.type;
}
const clampPct = (n: number | undefined) => Math.max(0, Math.min(100, Math.round(Number(n) || 0)));

async function refresh(): Promise<void> {
  try {
    home.value = await mm<MmHomeView>('home.get');
    error.value = '';
    if (showAll.value) allNotices.value = await mm<MmNotice[]>('notice.list', {});
  } catch (e) {
    error.value = errorMessage(e);
  }
}
async function toggleAll(): Promise<void> {
  if (showAll.value) { showAll.value = false; return; }
  try {
    allNotices.value = await mm<MmNotice[]>('notice.list', {});
    showAll.value = true;
  } catch (e) {
    error.value = errorMessage(e);
  }
}
async function readAll(): Promise<void> {
  busy.value = true;
  try { await mm('notice.read', { all: true }); await refresh(); } catch (e) { error.value = errorMessage(e); } finally { busy.value = false; }
}
async function openNotice(n: MmNotice): Promise<void> {
  if (!n.read) {
    try { await mm('notice.read', { ids: [n.id] }); } catch { /* 标已读失败不挡跳转 */ }
  }
  openLink(n.link);
}
function newMeeting(): void {
  pendingCreateMeeting.value = true;
  goTab('meetings');
}

watch(() => homeRoleLabel(home.value), (r) => { if (r) emit('role', r); }, { immediate: true });

onMounted(() => { void refresh(); });
defineExpose({ refresh });
</script>

<style scoped>
.mm-home { display: grid; gap: 14px; }
.mm-home__push { margin: 0; display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }

.mm-card {
  border: 1px solid var(--color-border);
  border-radius: var(--radius-6);
  background: var(--color-bg-card);
  padding: 16px 20px;
  display: grid;
  gap: 12px;
  align-content: start;
  min-width: 0;
  box-shadow: 0 1px 2px color-mix(in srgb, var(--color-text-primary) 4%, transparent);
}
.mm-card__head { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
.mm-card__head h3 { margin: 0; font-size: 15.5px; font-weight: 800; letter-spacing: -.01em; }
.mm-card__head .ss-link { display: inline-flex; align-items: center; gap: 2px; font-size: 12.5px; }
.mm-card__ico {
  width: 26px;
  height: 26px;
  border-radius: var(--radius-3);
  display: inline-grid;
  place-items: center;
  font-size: 14px;
  flex: none;
}
.mm-card__ico.brand { background: color-mix(in srgb, var(--color-brand) 12%, transparent); color: var(--color-brand); }
.mm-card__ico.bad { background: color-mix(in srgb, var(--color-danger) 11%, transparent); color: var(--color-danger); }
.mm-card__ico.warn { background: color-mix(in srgb, var(--color-warning) 14%, transparent); color: var(--color-warning); }
.mm-card__ico.ok { background: color-mix(in srgb, var(--color-success) 13%, transparent); color: var(--color-success); }

.mm-grow { flex: 1; }
.mm-empty {
  margin: 0;
  padding: 14px 14px;
  border-radius: var(--radius-4);
  background: color-mix(in srgb, var(--color-bg-hover) 65%, transparent);
  border: 1px dashed color-mix(in srgb, var(--color-border) 85%, transparent);
  color: var(--color-text-secondary);
  font-size: 12.5px;
  display: flex;
  align-items: center;
  gap: 8px;
}
.mm-empty i { font-size: 15px; opacity: .75; flex: none; }
.mm-empty--row { justify-content: space-between; gap: 10px; }
.mm-empty__msg { display: inline-flex; align-items: center; gap: 8px; min-width: 0; }

/* ── 问候与指标栏 ── */
.mm-hello {
  grid-template-columns: minmax(0, 1fr) auto;
  align-items: center;
  gap: 16px;
  padding: 16px 22px;
  background: linear-gradient(135deg, color-mix(in srgb, var(--color-brand) 5%, var(--color-bg-card)) 0%, var(--color-bg-card) 58%);
}
.mm-hello h2 { margin: 0 0 4px; font-size: 22px; font-weight: 800; letter-spacing: -.01em; }
.mm-hello p { margin: 0; color: var(--color-text-secondary); font-size: 13px; }
.mm-hello b.bad { color: var(--color-danger); font-weight: 700; }
.mm-hello__counts { display: grid; grid-template-columns: repeat(4, minmax(84px, 1fr)); gap: 10px; }
.mm-count {
  display: grid;
  gap: 2px;
  padding: 9px 14px;
  border-radius: var(--radius-4);
  border: 1px solid color-mix(in srgb, var(--color-border) 80%, transparent);
  background: color-mix(in srgb, var(--color-bg-hover) 55%, var(--color-bg-card));
  transition: border-color .15s, background-color .15s;
}
.mm-count[role="button"] { cursor: pointer; }
.mm-count[role="button"]:hover { border-color: color-mix(in srgb, var(--color-brand) 45%, var(--color-border)); }
.mm-count strong { font-size: 24px; font-weight: 800; font-variant-numeric: tabular-nums; line-height: 1.15; }
.mm-count small { color: var(--color-text-secondary); font-size: 11.5px; white-space: nowrap; }
.mm-count.zero strong { color: var(--color-text-muted, var(--color-text-secondary)); font-weight: 700; opacity: .65; }
.mm-count.brand { background: color-mix(in srgb, var(--color-brand) 7%, var(--color-bg-card)); border-color: color-mix(in srgb, var(--color-brand) 22%, var(--color-border)); }
.mm-count.brand strong { color: var(--color-brand); }
.mm-count.warn { background: color-mix(in srgb, var(--color-warning) 9%, var(--color-bg-card)); border-color: color-mix(in srgb, var(--color-warning) 28%, var(--color-border)); }
.mm-count.warn strong { color: var(--color-warning); }
.mm-count.bad { background: color-mix(in srgb, var(--color-danger) 7%, var(--color-bg-card)); border-color: color-mix(in srgb, var(--color-danger) 28%, var(--color-border)); }
.mm-count.bad strong { color: var(--color-danger); }
.mm-count.unread { background: color-mix(in srgb, var(--color-danger) 5%, var(--color-bg-card)); border-color: color-mix(in srgb, var(--color-danger) 22%, var(--color-border)); }
.mm-count.unread strong { color: var(--color-danger); }

/* ── 主工作区：待我处理 + 通知（等高双栏） ── */
.mm-home__primary {
  display: grid;
  grid-template-columns: minmax(0, 1.55fr) minmax(320px, 1fr);
  gap: 14px;
  align-items: stretch;
}
/* ── 第二工作区：三栏平铺 Bento ── */
.mm-home__bento {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 14px;
  align-items: stretch;
}
@media (max-width: 1140px) {
  .mm-home__primary { grid-template-columns: minmax(0, 1.3fr) minmax(280px, 1fr); }
  .mm-home__bento { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .mm-home__bento > :last-child { grid-column: 1 / -1; }
}
@media (max-width: 880px) {
  .mm-hello { grid-template-columns: minmax(0, 1fr); }
  .mm-hello__counts { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .mm-home__primary, .mm-home__bento { grid-template-columns: minmax(0, 1fr); }
  .mm-home__bento > :last-child { grid-column: auto; }
}

/* ── 筛选胶囊条 ── */
.mm-chips {
  display: inline-flex;
  gap: 2px;
  padding: 3px;
  border-radius: var(--radius-pill);
  background: var(--color-bg-hover);
  flex-wrap: wrap;
}
.mm-chip {
  height: 26px;
  padding: 0 11px;
  border-radius: var(--radius-pill);
  border: none;
  background: transparent;
  color: var(--color-text-secondary);
  font: inherit;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
  transition: background-color .15s, color .15s, box-shadow .15s;
}
.mm-chip span { opacity: .72; margin-inline-start: 2px; font-variant-numeric: tabular-nums; }
.mm-chip:hover { color: var(--color-text-primary); }
.mm-chip.on {
  background: var(--color-bg-card);
  color: var(--color-text-primary);
  box-shadow: 0 1px 3px color-mix(in srgb, var(--color-text-primary) 10%, transparent);
}
.mm-chip.on span { color: var(--color-brand); opacity: 1; }

.mm-todos__list {
  display: grid;
  gap: 8px;
  align-content: start;
  max-height: 330px;
  overflow-y: auto;
  scrollbar-width: thin;
}

.mm-group { display: flex; align-items: center; gap: 8px; margin-top: 2px; font-size: 12px; }
.mm-group__lbl { font-weight: 700; color: var(--color-text-secondary); }
.mm-group.urgent .mm-group__lbl { color: var(--color-danger); }
.mm-group.today .mm-group__lbl { color: var(--color-warning); }
.mm-group__n { color: var(--color-text-muted, var(--color-text-secondary)); font-variant-numeric: tabular-nums; }
.mm-group__line { flex: 1; height: 1px; background: var(--color-border); }
.mm-group .ss-link { display: inline-flex; align-items: center; gap: 2px; font-size: 12px; }

.mm-todo {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto auto;
  align-items: center;
  gap: 12px;
  padding: 11px 14px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-4);
  background: var(--color-bg-card);
  cursor: pointer;
  transition: border-color .15s, box-shadow .15s, background-color .15s;
}
.mm-todo:hover {
  border-color: color-mix(in srgb, var(--color-brand) 45%, var(--color-border));
  background: color-mix(in srgb, var(--color-brand) 2%, var(--color-bg-card));
  box-shadow: 0 2px 8px color-mix(in srgb, var(--color-text-primary) 5%, transparent);
}
.mm-todo.urgent {
  background: color-mix(in srgb, var(--color-danger) 4%, var(--color-bg-card));
  border-color: color-mix(in srgb, var(--color-danger) 35%, var(--color-border));
  border-inline-start: 3px solid var(--color-danger);
}
.mm-todo__tag {
  padding: 3px 9px;
  border-radius: var(--radius-3);
  background: var(--color-bg-hover);
  color: var(--color-text-secondary);
  font-size: 11.5px;
  font-weight: 600;
  white-space: nowrap;
}
.mm-todo.urgent .mm-todo__tag { background: color-mix(in srgb, var(--color-danger) 11%, transparent); color: var(--color-danger); }
.mm-todo__main { display: grid; gap: 2px; min-width: 0; }
.mm-todo__main strong { font-size: 14px; font-weight: 700; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.mm-todo__main small { color: var(--color-text-secondary); font-size: 12px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.mm-todo__hint { font-size: 12px; white-space: nowrap; color: var(--color-text-secondary); font-variant-numeric: tabular-nums; }
.mm-todo__hint.urgent { color: var(--color-danger); font-weight: 600; }
.mm-todo__hint.today { color: var(--color-warning); font-weight: 600; }

.mm-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  min-width: 76px;
  height: 32px;
  padding: 0 14px;
  border-radius: var(--radius-3);
  border: 1px solid var(--color-border);
  background: var(--color-bg-card);
  color: var(--color-text-primary);
  font: inherit;
  font-size: 12.5px;
  font-weight: 700;
  cursor: pointer;
  white-space: nowrap;
  transition: background-color .15s, border-color .15s, filter .15s;
}
.mm-btn.primary { background: var(--color-brand); border-color: var(--color-brand); color: var(--color-on-accent); }
.mm-btn.primary:hover { filter: brightness(1.06); }
.mm-btn.soft { background: color-mix(in srgb, var(--color-brand) 7%, var(--color-bg-card)); border-color: color-mix(in srgb, var(--color-brand) 32%, var(--color-border)); color: var(--color-brand); }
.mm-btn.soft:hover { background: color-mix(in srgb, var(--color-brand) 14%, var(--color-bg-card)); }
.mm-btn.sm { min-width: 0; height: 28px; padding: 0 10px; font-size: var(--font-size-sm); }

.mm-tag { display: inline-flex; align-items: center; padding: 2px 8px; border-radius: var(--radius-3); font-size: 11.5px; font-weight: 600; background: var(--color-bg-hover); color: var(--color-text-secondary); white-space: nowrap; }
.mm-tag.bad { background: color-mix(in srgb, var(--color-danger) 10%, transparent); color: var(--color-danger); }
.mm-tag.warn { background: color-mix(in srgb, var(--color-warning) 14%, transparent); color: var(--color-warning); }
.mm-tag.ok { background: color-mix(in srgb, var(--color-success) 14%, transparent); color: var(--color-success); }
.mm-tag.brand { background: color-mix(in srgb, var(--color-brand) 12%, transparent); color: var(--color-brand); }

/* ── 通知列表 ── */
.mm-notices {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  gap: 2px;
  max-height: 290px;
  overflow-y: auto;
  scrollbar-width: thin;
}
.mm-notices.all { max-height: 420px; }
.mm-notices li {
  display: grid;
  grid-template-columns: 10px minmax(0, 1fr);
  gap: 9px;
  padding: 8px 10px;
  border-radius: var(--radius-3);
  cursor: pointer;
  transition: background-color .15s;
}
.mm-notices li:hover { background: var(--color-bg-hover); }
.mm-notices li:hover strong { color: var(--color-brand); }
.mm-dot { width: 7px; height: 7px; border-radius: 50%; margin-top: 6px; background: transparent; }
.mm-notices li.unread .mm-dot {
  background: var(--color-danger);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--color-danger) 16%, transparent);
}
/* 列宽限死在卡片里：防止长标题把时间挤出去 */
.mm-notices__body { display: grid; grid-template-columns: minmax(0, 1fr); gap: 2px; min-width: 0; }
.mm-notices__top { display: flex; align-items: baseline; gap: 8px; min-width: 0; }
.mm-notices__top strong { flex: 1; font-size: 13px; font-weight: 700; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.mm-notices li:not(.unread) .mm-notices__top strong { font-weight: 500; color: var(--color-text-secondary); }
.mm-notices__top time { flex: none; color: var(--color-text-muted, var(--color-text-secondary)); font-size: 11.5px; white-space: nowrap; }
.mm-notices__body small {
  color: var(--color-text-secondary);
  font-size: 12px;
  min-width: 0;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 1;
  overflow: hidden;
  overflow-wrap: anywhere;
}
.mm-notices.all .mm-notices__body small { -webkit-line-clamp: 2; }

/* ── 我的任务 · 本周截止 ── */
.mm-mytasks {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  gap: 4px;
  max-height: 220px;
  overflow-y: auto;
  scrollbar-width: thin;
}
.mm-mytasks li {
  display: grid;
  grid-template-columns: 48px minmax(0, 1fr);
  gap: 10px;
  padding: 8px 10px;
  margin: 0 -10px;
  border-radius: var(--radius-3);
  cursor: pointer;
  transition: background-color .15s;
}
.mm-mytasks li:hover { background: var(--color-bg-hover); }
.mm-mytasks li:hover strong { color: var(--color-brand); }
.mm-mytasks__day {
  display: grid;
  justify-items: center;
  align-content: center;
  gap: 1px;
  padding: 4px 0;
  border-radius: var(--radius-3);
  background: var(--color-bg-hover);
}
.mm-mytasks__day small { color: var(--color-text-secondary); font-size: 10.5px; }
.mm-mytasks__day b { font-size: 13px; font-variant-numeric: tabular-nums; }
.mm-mytasks__body { display: grid; gap: 6px; min-width: 0; align-content: center; }
.mm-mytasks__body strong { font-size: 13.5px; font-weight: 700; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.mm-mytasks__bar { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
.mm-mytasks__pct { color: var(--color-text-secondary); font-size: 11.5px; font-variant-numeric: tabular-nums; }
.mm-bar { flex: 1; min-width: 70px; max-width: 150px; height: 6px; border-radius: 4px; background: var(--color-bg-hover); overflow: hidden; }
.mm-bar i { display: block; height: 100%; border-radius: 4px; background: var(--color-brand); }
.mm-bar i.bad { background: var(--color-danger); }

/* ── 项目 / 最近会议列表 ── */
.mm-rows {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  gap: 2px;
  max-height: 220px;
  overflow-y: auto;
  scrollbar-width: thin;
}
.mm-rows li {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 10px;
  margin: 0 -10px;
  border-radius: var(--radius-3);
  cursor: pointer;
  min-width: 0;
  transition: background-color .15s;
}
.mm-rows li:hover { background: var(--color-bg-hover); }
.mm-rows li:hover strong { color: var(--color-brand); }
.mm-rows strong { font-size: 13.5px; font-weight: 600; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.mm-rows > li > .mm-tag, .mm-rows > li > small { flex: none; }
.mm-rows small { color: var(--color-text-secondary); font-size: 12px; white-space: nowrap; }
.mm-rows small.bad { color: var(--color-danger); font-weight: 600; }
.mm-row__main { flex: 1; display: grid; gap: 2px; min-width: 0; }
.mm-row__main small { overflow: hidden; text-overflow: ellipsis; }

.spin { animation: mm-spin 1s linear infinite; }
@keyframes mm-spin { to { transform: rotate(360deg); } }
</style>
