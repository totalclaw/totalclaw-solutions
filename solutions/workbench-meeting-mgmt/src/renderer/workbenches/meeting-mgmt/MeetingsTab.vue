<template>
  <div class="mm-meetings" data-test="mm-meetings">
    <header class="mm-meetings__head">
      <h2>{{ $t('会议') }}</h2>
      <p>{{ $t('上传会议文件后自动转写、识别发言人、整理纪要') }}</p>
      <span class="mm-grow"></span>
      <label class="mm-search">
        <i class="ri-search-line" aria-hidden="true"></i>
        <input v-model="q" type="search" :placeholder="$t('搜索会议、项目')" data-test="mm-meeting-search" />
      </label>
      <button type="button" class="mm-btn primary" data-test="mm-meeting-create" @click="createOpen = true"><i class="ri-add-line"></i>{{ $t('创建会议') }}</button>
    </header>

    <p v-if="error" class="ss-note danger"><i class="ri-error-warning-line"></i><span>{{ error }}</span><button type="button" class="ss-link" @click="refresh">{{ $t('重试') }}</button></p>

    <div class="mm-meetings__grid">
      <aside class="mm-mlist">
        <div class="mm-chips">
          <button
            v-for="f in FILTERS"
            :key="f.key"
            type="button"
            class="mm-chip"
            :class="{ on: filter === f.key }"
            :data-test="`mm-meeting-filter-${f.key}`"
            @click="filter = f.key"
          >{{ f.title }} <span>{{ counts[f.key] }}</span></button>
        </div>
        <p v-if="loading && !lists.all.length" class="mm-mlist__state"><i class="ri-loader-4-line spin"></i>{{ $t('正在加载会议…') }}</p>
        <div v-else-if="!shown.length" class="mm-mlist__empty">
          <span>{{ q.trim() ? $t('没有找到匹配的会议') : filter === 'all' ? $t('还没有参加过会议') : $t('这个筛选下没有会议') }}</span>
          <button v-if="filter === 'all' && !q.trim()" type="button" class="ss-link" @click="createOpen = true">{{ $t('新建会议') }}</button>
        </div>
        <template v-else>
          <template v-for="g in grouped" :key="g.key">
            <div v-if="g.items.length" class="mm-mlist__group"><span>{{ g.title }}</span><i></i></div>
            <button
              v-for="c in g.items"
              :key="c.id"
              type="button"
              class="mm-mcard"
              :class="{ on: c.id === selectedId }"
              :data-test="`mm-meeting-${c.id}`"
              @click="select(c.id)"
            >
              <span class="mm-mcard__title">{{ c.title }}<i v-if="c.needsMe" class="mm-mcard__dot" :title="$t('需要我处理')"></i></span>
              <span class="mm-mcard__meta">
                <small>{{ c.projectName }} · {{ fmtMd(c.time) }}</small>
                <span class="mm-tag" :class="MEETING_STATUS_TONE[c.status]">{{ c.confirmText || MEETING_STATUS_LABEL[c.status] }}</span>
              </span>
            </button>
          </template>
        </template>
      </aside>

      <MeetingDetail
        v-if="selectedId"
        :key="selectedId"
        ref="detailRef"
        :meeting-id="selectedId"
        :focus="focus"
        @changed="refreshList"
        @role="emit('role', $event)"
      />
      <section v-else class="mm-placeholder">
        <i class="ri-file-list-3-line" aria-hidden="true"></i>
        <p>{{ lists.all.length ? $t('选择左侧的会议查看详情') : $t('新建一场会议，上传录音或文字记录后自动整理纪要') }}</p>
      </section>
    </div>

    <MeetingCreateDialog v-if="createOpen" @close="createOpen = false" @created="onCreated" />
  </div>
</template>

<script setup lang="ts">
/**
 * 会议智能管理 · 会议页签（原型 02-会议.png）：左列会议列表（全部 / 待我处理 / 处理中 / 已定稿 + 计数，
 * 「需要我处理」「其他」分组），右侧会议详情；「+ 创建会议」与搜索。
 * 首页待办 / 通知点进来时经 mmNav 直接选中会议（meeting_plan 落到「执行方案」页签）。
 */
import { computed, onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue';
import { t as i18nT } from '../../i18n';
import { MEETING_STATUS_LABEL, errorMessage, mm, mmNav } from './shared';
import { MEETING_STATUS_TONE, fmtMd, lastMeetingId, pendingCreateMeeting, type MmMeetingCard } from './meetingUi';
import MeetingDetail from './MeetingDetail.vue';
import MeetingCreateDialog from './MeetingCreateDialog.vue';

type Filter = 'all' | 'todo' | 'processing' | 'final';
const FILTERS: Array<{ key: Filter; title: string }> = [
  { key: 'all', title: i18nT('全部') },
  { key: 'todo', title: i18nT('待我处理') },
  { key: 'processing', title: i18nT('处理中') },
  { key: 'final', title: i18nT('已定稿') },
];

const emit = defineEmits<{ (e: 'role', label: string): void }>();

const filter = ref<Filter>('all');
const q = ref('');
const loading = ref(false);
const error = ref('');
const createOpen = ref(false);
const selectedId = ref(lastMeetingId.value);
const focus = ref<{ tab?: string; anchor?: string; seq: number } | null>(null);
const detailRef = ref<{ refresh?: () => Promise<void> } | null>(null);
const lists = reactive<Record<Filter, MmMeetingCard[]>>({ all: [], todo: [], processing: [], final: [] });

const counts = computed(() => ({ all: lists.all.length, todo: lists.todo.length, processing: lists.processing.length, final: lists.final.length }));
const shown = computed(() => lists[filter.value]);
const grouped = computed(() => [
  { key: 'mine', title: i18nT('需要我处理'), items: shown.value.filter((c) => c.needsMe) },
  { key: 'other', title: i18nT('其他'), items: shown.value.filter((c) => !c.needsMe) },
]);

let listSeq = 0;
/** 从链接点进来的会议：列表里暂时没有也不要被自动选中别的会议顶掉 */
let navPinnedId = '';
/** 四个筛选各拉一次（计数和服务端的筛选口径保持一致） */
async function refreshList(): Promise<void> {
  const seq = ++listSeq;
  loading.value = true;
  try {
    const query = q.value.trim();
    const res = await Promise.all(FILTERS.map((f) => mm<MmMeetingCard[]>('meeting.list', { filter: f.key, ...(query ? { q: query } : {}) })));
    if (seq !== listSeq) return;
    FILTERS.forEach((f, i) => { lists[f.key] = Array.isArray(res[i]) ? res[i] : []; });
    error.value = '';
    const lost = !lists.all.some((c) => c.id === selectedId.value) && !query && selectedId.value !== navPinnedId;
    if (!selectedId.value || lost) {
      const pick = lists.all.find((c) => c.needsMe) || lists.all[0];
      if (pick) select(pick.id);
      else selectedId.value = '';
    }
  } catch (e) {
    if (seq === listSeq) error.value = errorMessage(e);
  } finally {
    if (seq === listSeq) loading.value = false;
  }
}
async function refresh(): Promise<void> {
  await Promise.all([refreshList(), detailRef.value?.refresh?.()]);
}

function select(id: string): void {
  // 换了会议：上一次从链接带来的「定位到某页签 / 段落」不再适用
  if (id !== selectedId.value) focus.value = null;
  selectedId.value = id;
  lastMeetingId.value = id;
}
function onCreated(id: string): void {
  createOpen.value = false;
  filter.value = 'all';
  q.value = '';
  select(id);
  void refreshList();
}

/** 首页 / 通知点进来：选中会议，执行方案类直接落到方案页签 */
function applyNav(): void {
  const nav = mmNav.value;
  if (nav.tab !== 'meetings' || !nav.link) return;
  if (nav.link.kind !== 'meeting' && nav.link.kind !== 'meeting_plan') return;
  if (!lists.all.some((c) => c.id === nav.link!.id)) { filter.value = 'all'; q.value = ''; }
  navPinnedId = nav.link.id;
  select(nav.link.id);
  // 同一场会议再次点进来也要重新定位：seq 每次导航都会变
  focus.value = { tab: nav.link.kind === 'meeting_plan' ? 'plan' : undefined, anchor: nav.link.anchor, seq: nav.seq };
}
watch(() => mmNav.value.seq, applyNav);

let qTimer: ReturnType<typeof setTimeout> | null = null;
watch(q, () => {
  if (qTimer) clearTimeout(qTimer);
  qTimer = setTimeout(() => { qTimer = null; void refreshList(); }, 250);
});

onMounted(() => {
  applyNav();
  if (pendingCreateMeeting.value) { pendingCreateMeeting.value = false; createOpen.value = true; }
  void refreshList();
});
onBeforeUnmount(() => { if (qTimer) clearTimeout(qTimer); });
defineExpose({ refresh });
</script>

<style scoped>
.mm-meetings { display: grid; gap: 14px; }
.mm-meetings__head { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; }
.mm-meetings__head h2 { margin: 0; font-size: 24px; font-weight: 800; }
.mm-meetings__head p { margin: 0; color: var(--color-text-secondary); font-size: var(--font-size-md); }
.mm-grow { flex: 1; }
.mm-search { display: inline-flex; align-items: center; gap: 8px; height: 40px; width: 300px; max-width: 100%; padding: 0 12px; border: 1px solid var(--color-border); border-radius: var(--radius-4); background: var(--color-bg-card); color: var(--color-text-secondary); }
.mm-search:focus-within { border-color: var(--color-brand); }
.mm-search input { flex: 1; min-width: 0; border: none; background: transparent; color: var(--color-text-primary); font: inherit; font-size: var(--font-size-md); outline: none; }

.mm-btn { display: inline-flex; align-items: center; justify-content: center; gap: 6px; height: 40px; padding: 0 18px; border-radius: var(--radius-4); border: 1px solid var(--color-border); background: var(--color-bg-card); color: var(--color-text-primary); font: inherit; font-size: var(--font-size-md); font-weight: 700; cursor: pointer; white-space: nowrap; }
.mm-btn.primary { background: var(--color-brand); border-color: var(--color-brand); color: var(--color-on-accent); }
.mm-btn.primary:hover { filter: brightness(1.06); }

.mm-meetings__grid { display: grid; grid-template-columns: minmax(240px, 280px) minmax(0, 1fr); gap: 18px; align-items: start; }
@media (max-width: 1000px) { .mm-meetings__grid { grid-template-columns: minmax(0, 1fr); } }

.mm-mlist { display: grid; gap: 8px; align-content: start; min-width: 0; }
/* 嵌套 grid 的隐式列是 auto，会被卡片里不换行的「项目 · 日期」撑宽、溢出左栏：每一层锁成 minmax(0, 1fr)，让它省略 */
.mm-mlist, .mm-mcard { grid-template-columns: minmax(0, 1fr); }
.mm-chips { display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 4px; }
.mm-chip { height: 32px; padding: 0 12px; border-radius: var(--radius-pill); border: 1px solid var(--color-border); background: var(--color-bg-card); color: var(--color-text-primary); font: inherit; font-size: var(--font-size-md); cursor: pointer; white-space: nowrap; }
.mm-chip span { color: var(--color-text-secondary); }
.mm-chip:hover { border-color: var(--color-brand); }
.mm-chip.on { background: var(--color-text-primary); border-color: var(--color-text-primary); color: var(--color-bg-card); }
.mm-chip.on span { color: inherit; }
.mm-mlist__state { margin: 0; display: flex; gap: 6px; align-items: center; color: var(--color-text-secondary); font-size: 12.5px; padding: 8px 4px; }
.mm-mlist__empty { display: grid; gap: 6px; justify-items: start; padding: 12px; border-radius: var(--radius-4); background: var(--color-bg-hover); color: var(--color-text-secondary); font-size: 12.5px; }
.mm-mlist__group { display: flex; align-items: center; gap: 8px; margin-top: 6px; padding: 0 4px; font-size: var(--font-size-md); font-weight: 700; color: var(--color-text-secondary); }
.mm-mlist__group i { flex: 1; height: 1px; background: var(--color-border); }

.mm-mcard { display: grid; gap: 8px; padding: 14px 18px; border: 1px solid transparent; border-radius: var(--radius-5); background: transparent; color: var(--color-text-primary); font: inherit; text-align: start; cursor: pointer; transition: background .15s, border-color .15s; }
.mm-mcard:hover { background: var(--color-bg-card); }
.mm-mcard.on { background: var(--color-bg-card); border-color: color-mix(in srgb, var(--color-brand) 45%, var(--color-border)); box-shadow: 0 2px 10px color-mix(in srgb, var(--color-brand) 10%, transparent); }
.mm-mcard__title { display: flex; align-items: center; gap: 8px; font-size: 15px; font-weight: 700; }
.mm-mcard__dot { width: 7px; height: 7px; border-radius: 50%; background: var(--color-danger); margin-inline-start: auto; flex: 0 0 auto; }
.mm-mcard__meta { display: flex; align-items: center; gap: 8px; }
.mm-mcard__meta small { flex: 1; min-width: 0; color: var(--color-text-secondary); font-size: 12.5px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

.mm-tag { display: inline-flex; align-items: center; padding: 2px 10px; border-radius: var(--radius-3); font-size: var(--font-size-sm); font-weight: 600; background: var(--color-bg-hover); color: var(--color-text-secondary); white-space: nowrap; }
.mm-tag.bad { background: color-mix(in srgb, var(--color-danger) 10%, transparent); color: var(--color-danger); }
.mm-tag.warn { background: color-mix(in srgb, var(--color-warning) 14%, transparent); color: var(--color-warning); }
.mm-tag.ok { background: color-mix(in srgb, var(--color-success) 14%, transparent); color: var(--color-success); }
.mm-tag.brand { background: color-mix(in srgb, var(--color-brand) 12%, transparent); color: var(--color-brand); }

.mm-placeholder { display: grid; place-items: center; gap: 8px; min-height: 360px; border: 1px dashed var(--color-border); border-radius: var(--radius-6); color: var(--color-text-secondary); font-size: var(--font-size-md); text-align: center; padding: 24px; }
.mm-placeholder i { font-size: 36px; opacity: .6; }
.mm-placeholder p { margin: 0; }
.spin { animation: mm-spin 1s linear infinite; }
@keyframes mm-spin { to { transform: rotate(360deg); } }
</style>
