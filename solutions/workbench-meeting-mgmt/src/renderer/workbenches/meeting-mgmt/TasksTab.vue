<template>
  <div class="mm-tasks" data-test="mm-tasks-tab">
    <header class="mm-pagehead">
      <h2>{{ $t('任务') }}</h2>
      <p>{{ $t('会议决议拆出的任务，在这里接收、跟进、处理异议') }}</p>
      <span class="grow"></span>
      <label class="mm-search">
        <i class="ri-search-line" aria-hidden="true"></i>
        <input v-model="q" type="search" :placeholder="$t('搜索任务')" :aria-label="$t('搜索任务')" data-test="mm-tasks-search" />
      </label>
    </header>

    <section v-if="planTodos.length" class="mm-banner" data-test="mm-plan-banner">
      <span class="mm-banner__n">{{ planTodos.length }}</span>
      <div class="mm-banner__text">
        <strong>{{ $t('{n} 份执行方案待你确认', { n: planTodos.length }) }}</strong>
        <small>{{ bannerSub }}</small>
      </div>
      <button type="button" class="ss-btn primary" data-test="mm-plan-banner-go" @click="openLink(planTodos[0].link)">{{ $t('去确认方案') }}</button>
    </section>

    <p v-if="error" class="ss-note danger"><i class="ri-error-warning-line"></i>{{ error }}</p>

    <section class="mm-tasks__card" :class="{ split: !!selectedId }">
      <div class="mm-tasks__main">
        <div class="mm-tasks__bar">
          <div class="mm-seg" role="tablist" :aria-label="$t('任务视图')">
            <button v-for="v in VIEWS" :key="v.key" type="button" role="tab" :aria-selected="view === v.key" :class="{ on: view === v.key }" :title="v.hint" :data-test="`mm-tasks-view-${v.key}`" @click="view = v.key">{{ v.title }}</button>
          </div>
          <label class="mm-select">
            <span>{{ $t('分组：') }}</span>
            <select v-model="groupBy" data-test="mm-tasks-groupby">
              <option value="status">{{ $t('状态') }}</option>
              <option value="project">{{ $t('项目') }}</option>
              <option value="dept">{{ $t('部门') }}</option>
            </select>
            <i class="ri-arrow-down-s-line" aria-hidden="true"></i>
          </label>
          <label class="mm-select">
            <span>{{ $t('项目：') }}</span>
            <select v-model="projectId" data-test="mm-tasks-project">
              <option value="">{{ $t('全部') }}</option>
              <option v-for="p in projects" :key="p.id" :value="p.id">{{ p.name }}</option>
            </select>
            <i class="ri-arrow-down-s-line" aria-hidden="true"></i>
          </label>
          <span class="grow"></span>
          <button type="button" class="mm-icon-btn" :disabled="loading" :aria-label="$t('刷新')" :title="$t('刷新')" @click="reload"><i :class="loading ? 'ri-loader-4-line spin' : 'ri-refresh-line'"></i></button>
        </div>
        <TaskTable
          :tasks="shown"
          :group-by="groupBy"
          :selected-id="selectedId"
          :empty-text="loading ? $t('加载中…') : q ? $t('没有匹配「{q}」的任务', { q }) : EMPTY[view]"
          @select="(t) => (selectedId = t.id)"
        />
      </div>
      <TaskDetailPanel v-if="selectedId" :key="selectedId" :task-id="selectedId" :refresh-seq="detailSeq" @close="selectedId = ''" @changed="reload" @role="setRole" />
    </section>
  </div>
</template>

<script setup lang="ts">
/**
 * 任务页签（原型 03-任务.png）：待确认方案横幅、三种视图（我接收的 / 我分派的 / 全部任务，与手机端同名）、
 * 分组（状态 / 项目 / 部门）、项目筛选、搜索；右侧详情抽屉。
 * 首页待办 / 通知点进来：mmNav.link = { kind:'task', id } → 打开对应任务。
 */
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import type { MmHomeView, MmTaskView, MmTodo } from '../../../shared/meetingMgmt/types';
import { t as i18nT } from '../../i18n';
import TaskTable from './TaskTable.vue';
import TaskDetailPanel from './TaskDetailPanel.vue';
import { errorMessage, mm, mmNav, mmRole, onMmEvent, openLink } from './shared';
import { filterTasks, type TaskGroupBy } from './pagesLogic';
import '../service-settlement/styles.css';

type ViewKey = 'received' | 'all' | 'assigned';
// 叫法和顺序按需求文档（与手机端一致）：我接收的 = 部门负责人视角，我分派的 = 任务负责人视角
const VIEWS: Array<{ key: ViewKey; title: string; hint: string }> = [
  { key: 'received', title: i18nT('我接收的'), hint: i18nT('下发给我的部门、由我接收和执行的任务') },
  { key: 'assigned', title: i18nT('我分派的'), hint: i18nT('我作为任务负责人确认下发的任务') },
  { key: 'all', title: i18nT('全部任务'), hint: i18nT('我参与的项目里的全部任务') },
];
const EMPTY: Record<ViewKey, string> = {
  received: i18nT('没有下发给你的任务'),
  all: i18nT('你参与的项目里还没有任务'),
  assigned: i18nT('你还没有下发过任务'),
};

const view = ref<ViewKey>('all');
const groupBy = ref<TaskGroupBy>('status');
const projectId = ref('');
const q = ref('');
const tasks = ref<MmTaskView[]>([]);
const projects = ref<Array<{ id: string; name: string }>>([]);
const planTodos = ref<MmTodo[]>([]);
const selectedId = ref('');
const detailSeq = ref(0);
const loading = ref(false);
const error = ref('');

const emit = defineEmits<{ (e: 'role', label: string): void }>();

const shown = computed(() => filterTasks(tasks.value, q.value));
const bannerSub = computed(() => {
  const first = planTodos.value[0];
  if (!first) return '';
  const line = [first.title, first.subtitle].filter(Boolean).join(' · ');
  return planTodos.value.length > 1 ? i18nT('{line} 等 {n} 份', { line, n: planTodos.value.length }) : line;
});

let reqSeq = 0;
async function loadTasks(): Promise<void> {
  const my = ++reqSeq;
  loading.value = true;
  try {
    const list = await mm<MmTaskView[]>('task.list', { view: view.value, projectId: projectId.value || undefined });
    if (my !== reqSeq) return;
    tasks.value = Array.isArray(list) ? list : [];
    error.value = '';
  } catch (e) {
    if (my === reqSeq) error.value = errorMessage(e);
  } finally {
    if (my === reqSeq) loading.value = false;
  }
}

async function loadSide(): Promise<void> {
  const [ps, home] = await Promise.allSettled([
    mm<Array<{ id: string; name: string }>>('project.list', {}),
    mm<MmHomeView>('home.get'),
  ]);
  if (ps.status === 'fulfilled' && Array.isArray(ps.value)) projects.value = ps.value.map((p) => ({ id: p.id, name: p.name }));
  if (home.status === 'fulfilled') planTodos.value = (home.value?.todos ?? []).filter((t) => t.type === 'confirm_plan');
}

async function reload(): Promise<void> {
  detailSeq.value += 1;
  await Promise.all([loadTasks(), loadSide()]);
}

watch([view, projectId], () => { void loadTasks(); });

/** 顶部身份胶囊：打开任务时显示我在这个任务上的角色，关掉恢复默认 */
function setRole(label: string): void {
  mmRole.value = label;
  emit('role', label);
}
watch(selectedId, (id) => { if (!id) setRole(''); });

/** 首页 / 通知 → 打开某个任务；当前视图里看不到它就切到「我参与项目的 · 全部」 */
function handleNav(): void {
  const nav = mmNav.value;
  if (nav.tab !== 'tasks' || nav.link?.kind !== 'task') return;
  const id = nav.link.id;
  selectedId.value = id;
  q.value = '';
  if (!tasks.value.some((t) => t.id === id) && (view.value !== 'all' || projectId.value)) {
    view.value = 'all';
    projectId.value = '';
  }
}
watch(() => mmNav.value.seq, handleNav);

let timer: ReturnType<typeof setTimeout> | null = null;
let off: (() => void) | null = null;
let lastReloadAt = 0;
/** 数据变了：合并短时间内的多次触发（自己订阅的事件 + 外壳调 refresh）只拉一次 */
function scheduleReload(): void {
  if (timer) clearTimeout(timer);
  timer = setTimeout(() => { timer = null; lastReloadAt = Date.now(); void reload(); }, 250);
}
/** 外壳在数据变化 / 切换身份后调用 */
function refresh(): void {
  if (timer || Date.now() - lastReloadAt < 800) return;
  scheduleReload();
}
defineExpose({ refresh });

onMounted(async () => {
  handleNav();
  lastReloadAt = Date.now();
  await reload();
  // 列表加载完再判断一次（打开的任务不在当前视图里时切视图）
  handleNav();
  off = onMmEvent((ev) => {
    if (ev.type !== 'changed' || !['all', 'task', 'meeting', 'project', 'org'].includes(ev.scope)) return;
    scheduleReload();
  });
});
onBeforeUnmount(() => {
  off?.();
  if (timer) clearTimeout(timer);
  mmRole.value = '';
});
</script>

<style scoped>
.mm-tasks { display: grid; gap: 16px; }
.mm-pagehead { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; }
.mm-pagehead h2 { margin: 0; font-size: 22px; font-weight: 700; }
.mm-pagehead p { margin: 0; color: var(--color-text-secondary); font-size: 13px; }
.mm-pagehead .grow { flex: 1; }
.mm-search { display: flex; align-items: center; gap: 8px; width: min(100%, 300px); height: 38px; padding: 0 12px; border: 1px solid var(--color-border); border-radius: var(--radius-4); background: var(--color-bg-card); color: var(--color-text-muted); }
.mm-search input { flex: 1; min-width: 0; border: none; outline: none; background: transparent; font: inherit; font-size: 13px; color: var(--color-text-primary); }
.mm-search:focus-within { border-color: var(--color-brand); }
.mm-banner { display: flex; align-items: center; gap: 14px; padding: 14px 16px 14px 18px; border-radius: var(--radius-6); border: 1px solid color-mix(in srgb, var(--color-brand) 28%, var(--color-border)); background: color-mix(in srgb, var(--color-brand) 7%, var(--color-bg-card)); }
.mm-banner__n { width: 34px; height: 34px; border-radius: var(--radius-3); background: var(--color-brand); color: var(--color-on-accent); display: grid; place-items: center; font-weight: 700; font-size: 15px; flex: 0 0 34px; }
.mm-banner__text { flex: 1; min-width: 0; display: grid; gap: 3px; }
.mm-banner__text strong { font-size: 14.5px; }
.mm-banner__text small { color: var(--color-text-secondary); font-size: 12.5px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.mm-tasks__card { display: grid; grid-template-columns: minmax(0, 1fr); border: 1px solid var(--color-border); border-radius: var(--radius-6); background: var(--color-bg-card); overflow: clip; min-height: 480px; }
.mm-tasks__card.split { grid-template-columns: minmax(0, 1fr) minmax(360px, 36%); }
.mm-tasks__main { min-width: 0; padding: 18px 18px 22px; display: grid; gap: 14px; align-content: start; }
.mm-tasks__bar { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
.mm-tasks__bar .grow { flex: 1; }
.mm-seg { display: inline-flex; padding: 3px; border-radius: var(--radius-4); background: var(--color-bg-hover); }
.mm-seg button { height: 32px; padding: 0 14px; border: none; border-radius: var(--radius-3); background: transparent; color: var(--color-text-secondary); font: inherit; font-size: 13px; cursor: pointer; }
.mm-seg button.on { background: var(--color-bg-card); color: var(--color-brand); font-weight: 700; box-shadow: var(--shadow-sm); }
.mm-seg button:focus-visible { outline: 2px solid var(--color-brand); outline-offset: 1px; }
.mm-select { position: relative; display: inline-flex; align-items: center; height: 34px; padding: 0 30px 0 12px; border: 1px solid var(--color-border); border-radius: var(--radius-pill); background: var(--color-bg-card); font-size: 13px; color: var(--color-text-secondary); }
.mm-select select { appearance: none; border: none; outline: none; background: transparent; font: inherit; color: var(--color-text-primary); cursor: pointer; max-width: 180px; }
.mm-select i { position: absolute; inset-inline-end: 10px; pointer-events: none; }
.mm-select:focus-within { border-color: var(--color-brand); }
.mm-icon-btn { width: 34px; height: 34px; border-radius: var(--radius-3); border: 1px solid var(--color-border); background: var(--color-bg-card); color: var(--color-text-secondary); cursor: pointer; display: grid; place-items: center; }
.mm-icon-btn:hover:not(:disabled) { color: var(--color-brand); border-color: var(--color-brand); }
.spin { animation: mm-tasks-spin 1s linear infinite; }
@keyframes mm-tasks-spin { to { transform: rotate(360deg); } }
@media (max-width: 1100px) {
  .mm-tasks__card.split { grid-template-columns: minmax(0, 1fr); }
}
@media (prefers-reduced-motion: reduce) { .spin { animation: none; } }
</style>
