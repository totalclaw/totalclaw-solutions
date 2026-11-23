<template>
  <div class="mm-projects" data-test="mm-projects-tab">
    <header class="mm-pagehead">
      <h2>{{ $t('项目') }}</h2>
      <p>{{ $t('汇总查看项目下的会议、任务和报告') }}</p>
      <span class="grow"></span>
      <button v-if="mmBoot?.me.canCreateProject" type="button" class="ss-btn" data-test="mm-project-new" @click="createOpen = true"><i class="ri-add-line"></i>{{ $t('新建项目') }}</button>
    </header>
    <p v-if="error" class="ss-note danger"><i class="ri-error-warning-line"></i>{{ error }}</p>

    <div class="mm-projects__grid">
      <aside class="mm-plist">
        <label class="mm-search">
          <i class="ri-search-line" aria-hidden="true"></i>
          <input v-model="q" type="search" :placeholder="$t('搜索项目')" :aria-label="$t('搜索项目')" data-test="mm-projects-search" />
        </label>
        <div class="mm-plist__filters" role="tablist" :aria-label="$t('项目状态')">
          <button v-for="s in STATUSES" :key="s" type="button" role="tab" :aria-selected="status === s" :class="{ on: status === s }" :data-test="`mm-projects-filter-${s}`" @click="status = s">
            {{ PROJECT_STATUS_LABEL[s] }} <em>{{ counts[s] }}</em>
          </button>
        </div>
        <p v-if="loading && !cards.length" class="mm-plist__empty">{{ $t('加载中…') }}</p>
        <p v-else-if="!shown.length" class="mm-plist__empty">{{ q ? $t('没有匹配的项目') : EMPTY[status] }}</p>
        <button
          v-for="c in shown"
          :key="c.id"
          type="button"
          class="mm-pcard"
          :class="{ on: c.id === selectedId }"
          :data-test="`mm-project-card-${c.id}`"
          @click="select(c.id)"
        >
          <span class="mm-pcard__top">
            <strong>{{ c.name }}</strong>
            <span v-if="c.overdue > 0" class="mm-pcard__over">{{ $t('逾期 {n}', { n: c.overdue }) }}</span>
          </span>
          <span class="mm-pcard__bot">
            <i class="mm-bar"><b :style="{ width: `${cardPct(c)}%` }"></b></i>
            <em>{{ cardPct(c) }}%</em>
            <span class="owner">{{ c.ownerName }}</span>
          </span>
        </button>
        <p class="mm-plist__foot">{{ $t('只显示你参与的项目') }}</p>
      </aside>

      <div class="mm-projects__detail">
        <ProjectDetail v-if="selectedId" :project-id="selectedId" :refresh-seq="detailSeq" :focus="focus" @changed="loadList" @role="setRole" />
        <div v-else class="mm-projects__none">
          <i class="ri-folder-open-line" aria-hidden="true"></i>
          <p>{{ cards.length ? $t('选择左侧的一个项目查看详情') : $t('还没有你参与的项目') }}</p>
          <button v-if="!cards.length && mmBoot?.me.canCreateProject" type="button" class="ss-btn primary" @click="createOpen = true"><i class="ri-add-line"></i>{{ $t('新建项目') }}</button>
        </div>
      </div>
    </div>

    <ProjectCreateDialog :open="createOpen" @close="createOpen = false" @created="onCreated" />
  </div>
</template>

<script setup lang="ts">
/**
 * 项目页签（原型 04-项目.png）：左列项目列表（搜索、进行中 / 结项中 / 已归档 筛选与计数、卡片），右侧项目详情。
 * 首页待办 / 通知点进来：mmNav.link = { kind:'project' | 'project_summary' | 'report', id } → 打开对应项目与页签。
 */
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import type { MmProject, MmProjectStatus } from '../../../shared/meetingMgmt/types';
import { t as i18nT } from '../../i18n';
import { useNotificationStore } from '../../stores/notification';
import ProjectDetail from './ProjectDetail.vue';
import ProjectCreateDialog from './ProjectCreateDialog.vue';
import { PROJECT_STATUS_LABEL, errorMessage, mm, mmBoot, mmNav, mmRole, onMmEvent } from './shared';
import { pct, ratioPct, resolveProjectLink, type ProjectTabKey } from './pagesLogic';
import '../service-settlement/styles.css';

interface ProjectCard { id: string; name: string; status: MmProjectStatus; ownerName: string; done: number; total: number; overdue: number; rate: number }

const STATUSES: MmProjectStatus[] = ['active', 'closing', 'archived'];
const EMPTY: Record<MmProjectStatus, string> = {
  active: i18nT('没有进行中的项目'),
  closing: i18nT('没有结项中的项目'),
  archived: i18nT('没有已归档的项目'),
};

const notif = useNotificationStore();
const cards = ref<ProjectCard[]>([]);
const status = ref<MmProjectStatus>('active');
const q = ref('');
const selectedId = ref('');
const detailSeq = ref(0);
const focus = ref<{ tab: ProjectTabKey; reportId?: string; seq: number } | null>(null);
const createOpen = ref(false);
const loading = ref(false);
const error = ref('');

const emit = defineEmits<{ (e: 'role', label: string): void }>();

/** 顶部身份胶囊：选中项目时显示我在这个项目上的角色 */
function setRole(label: string): void {
  mmRole.value = label;
  emit('role', label);
}
watch(selectedId, (id) => { if (!id) setRole(''); });

const counts = computed(() => Object.fromEntries(STATUSES.map((s) => [s, cards.value.filter((c) => c.status === s).length])) as Record<MmProjectStatus, number>);
const shown = computed(() => {
  const k = q.value.trim().toLowerCase();
  return cards.value.filter((c) => c.status === status.value && (!k || `${c.name} ${c.ownerName}`.toLowerCase().includes(k)));
});
const cardPct = (c: ProjectCard) => (typeof c.rate === 'number' && Number.isFinite(c.rate) ? pct(c.rate) : ratioPct(c.done, c.total));

async function loadList(): Promise<void> {
  loading.value = true;
  try {
    const list = await mm<ProjectCard[]>('project.list', {});
    cards.value = Array.isArray(list) ? list : [];
    error.value = '';
    ensureSelection();
  } catch (e) {
    error.value = errorMessage(e);
  } finally {
    loading.value = false;
  }
}

let firstLoad = true;
/**
 * 列表刷新后保持选中：选中的项目状态变了（发起结项 → 结项中、审核通过 → 已归档）就把筛选跟过去；
 * 没选中时选当前筛选的第一个（第一次打开时当前筛选没有项目，就换到有项目的那一栏）。
 */
function ensureSelection(): void {
  const cur = cards.value.find((c) => c.id === selectedId.value);
  if (cur) {
    if (cur.status !== status.value) status.value = cur.status;
    return;
  }
  // 从首页 / 通知点进来的项目可能不在列表里（权限 / 刚变动）：保持打开，由详情页报错
  if (selectedId.value && focus.value) return;
  if (firstLoad && !counts.value[status.value]) {
    const s = STATUSES.find((x) => counts.value[x] > 0);
    if (s) status.value = s;
  }
  firstLoad = false;
  selectedId.value = shown.value[0]?.id ?? '';
}

watch(status, () => {
  if (!shown.value.some((c) => c.id === selectedId.value)) selectedId.value = shown.value[0]?.id ?? '';
});

function select(id: string): void {
  selectedId.value = id;
  focus.value = null;
}

/** 报告链接只给了一个 id：它是项目 id 就直接开；否则在我参与的项目里找哪个项目有这份报告 */
async function findProjectOfReport(reportId: string): Promise<string> {
  if (cards.value.some((c) => c.id === reportId)) return reportId;
  for (const c of cards.value) {
    try {
      const r = await mm<{ project: MmProject }>('project.get', { id: c.id });
      if (r?.project?.weeklyReports?.some((x) => x.id === reportId) || r?.project?.summary?.id === reportId) return c.id;
    } catch { /* 跳过没权限的 */ }
  }
  return '';
}

async function handleNav(): Promise<void> {
  const nav = mmNav.value;
  if (nav.tab !== 'projects') return;
  const target = resolveProjectLink(nav.link);
  if (!target) return;
  let projectId = target.projectId || '';
  let reportId = target.reportId;
  if (nav.link?.kind === 'report' && !nav.link.anchor) {
    projectId = await findProjectOfReport(nav.link.id);
    if (projectId === nav.link.id) reportId = undefined;
  }
  if (!projectId) {
    notif.warn(i18nT('没找到要打开的项目或报告'));
    return;
  }
  const card = cards.value.find((c) => c.id === projectId);
  if (card) status.value = card.status;
  q.value = '';
  selectedId.value = projectId;
  focus.value = { tab: target.tab, reportId, seq: nav.seq };
}
watch(() => mmNav.value.seq, () => { void handleNav(); });

async function onCreated(p: MmProject): Promise<void> {
  createOpen.value = false;
  notif.success(i18nT('项目已创建'));
  status.value = 'active';
  q.value = '';
  await loadList();
  if (p?.id) select(p.id);
}

let timer: ReturnType<typeof setTimeout> | null = null;
let off: (() => void) | null = null;
let lastReloadAt = 0;
/** 数据变了：合并短时间内的多次触发（自己订阅的事件 + 外壳调 refresh）只拉一次 */
function scheduleReload(): void {
  if (timer) clearTimeout(timer);
  timer = setTimeout(() => {
    timer = null;
    lastReloadAt = Date.now();
    void loadList();
    detailSeq.value += 1;
  }, 250);
}
/** 外壳在数据变化 / 切换身份后调用 */
function refresh(): void {
  if (timer || Date.now() - lastReloadAt < 800) return;
  scheduleReload();
}
defineExpose({ refresh });

let disposed = false;
onMounted(async () => {
  lastReloadAt = Date.now();
  await loadList();
  if (disposed) return;
  await handleNav();
  if (disposed) return;
  off = onMmEvent((ev) => {
    if (ev.type !== 'changed' || !['all', 'project', 'task', 'meeting', 'org'].includes(ev.scope)) return;
    scheduleReload();
  });
});
onBeforeUnmount(() => {
  disposed = true;
  off?.();
  off = null;
  if (timer) clearTimeout(timer);
  mmRole.value = '';
});
</script>

<style scoped>
.mm-projects { display: grid; gap: 16px; }
.mm-pagehead { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; }
.mm-pagehead h2 { margin: 0; font-size: 22px; font-weight: 700; }
.mm-pagehead p { margin: 0; color: var(--color-text-secondary); font-size: 13px; }
.mm-pagehead .grow { flex: 1; }
.mm-projects__grid { display: grid; grid-template-columns: minmax(260px, 340px) minmax(0, 1fr); gap: 20px; align-items: start; }
.mm-plist { display: grid; gap: 12px; align-content: start; position: sticky; top: 0; }
.mm-search { display: flex; align-items: center; gap: 8px; height: 40px; padding: 0 12px; border: 1px solid var(--color-border); border-radius: var(--radius-4); background: var(--color-bg-card); color: var(--color-text-muted); }
.mm-search input { flex: 1; min-width: 0; border: none; outline: none; background: transparent; font: inherit; font-size: 13px; color: var(--color-text-primary); }
.mm-search:focus-within { border-color: var(--color-brand); }
.mm-plist__filters { display: flex; gap: 8px; flex-wrap: wrap; }
.mm-plist__filters button { height: 34px; padding: 0 16px; border-radius: var(--radius-pill); border: 1px solid var(--color-border); background: var(--color-bg-card); color: var(--color-text-primary); font: inherit; font-size: 13px; cursor: pointer; display: inline-flex; align-items: center; gap: 6px; }
.mm-plist__filters button em { font-style: normal; color: var(--color-text-secondary); font-variant-numeric: tabular-nums; }
.mm-plist__filters button.on { background: var(--color-text-primary); border-color: var(--color-text-primary); color: var(--color-bg-card); }
.mm-plist__filters button.on em { color: inherit; opacity: .8; }
.mm-plist__filters button:focus-visible { outline: 2px solid var(--color-brand); outline-offset: 2px; }
.mm-pcard { display: grid; gap: 12px; width: 100%; padding: 16px 18px; border: 1px solid transparent; border-radius: var(--radius-5); background: transparent; cursor: pointer; font: inherit; color: var(--color-text-primary); text-align: left; transition: background-color .12s, border-color .12s; }
.mm-pcard:hover { background: var(--color-bg-hover); }
.mm-pcard.on { border-color: color-mix(in srgb, var(--color-brand) 45%, var(--color-border)); background: var(--color-bg-card); box-shadow: var(--shadow-sm); }
.mm-pcard:focus-visible { outline: 2px solid var(--color-brand); outline-offset: 1px; }
.mm-pcard__top { display: flex; align-items: center; gap: 8px; }
.mm-pcard__top strong { flex: 1; min-width: 0; font-size: 14.5px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.mm-pcard__over { padding: 1px 8px; border-radius: var(--radius-2); font-size: 12px; font-weight: 700; color: var(--color-danger); background: color-mix(in srgb, var(--color-danger) 12%, transparent); white-space: nowrap; }
.mm-pcard__bot { display: flex; align-items: center; gap: 10px; font-size: 12.5px; }
.mm-pcard__bot em { font-style: normal; color: var(--color-text-secondary); font-variant-numeric: tabular-nums; min-width: 34px; }
.mm-pcard__bot .owner { margin-inline-start: auto; color: var(--color-text-secondary); white-space: nowrap; }
.mm-bar { flex: 0 1 170px; height: 6px; border-radius: 3px; background: var(--color-bg-hover); overflow: hidden; display: block; }
.mm-pcard.on .mm-bar, .mm-pcard:hover .mm-bar { background: color-mix(in srgb, var(--color-border) 70%, transparent); }
.mm-bar b { display: block; height: 100%; border-radius: 3px; background: var(--gradient-brand, var(--color-brand)); }
.mm-plist__empty { margin: 0; padding: 18px; text-align: center; color: var(--color-text-secondary); font-size: 12.5px; }
.mm-plist__foot { margin: 4px 0 0; padding-inline-start: 18px; font-size: 12.5px; color: var(--color-text-muted); }
.mm-projects__detail { min-width: 0; border: 1px solid var(--color-border); border-radius: var(--radius-6); background: var(--color-bg-card); min-height: 480px; }
.mm-projects__none { display: grid; justify-items: center; align-content: center; gap: 10px; min-height: 420px; color: var(--color-text-secondary); font-size: 13px; }
.mm-projects__none > i { font-size: 36px; color: var(--color-text-muted); }
.mm-projects__none p { margin: 0; }
@media (max-width: 1000px) {
  .mm-projects__grid { grid-template-columns: 1fr; }
  .mm-plist { position: static; }
}
</style>
