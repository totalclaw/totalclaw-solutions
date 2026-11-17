<template>
  <div class="mm-wb" data-test="mm-workbench">
    <section class="mm-head">
      <div class="mm-head__top">
        <PageBackButton />
        <span class="mm-mark" aria-hidden="true"></span>
        <h1>{{ $t('泰途会议智能管理') }}</h1>
        <p class="mm-head__sub">{{ $t('会议 → 纪要 → 任务 → 跟进 → 归档，全流程闭环') }}</p>
        <span class="mm-grow"></span>
        <span
          v-if="boot"
          class="mm-wecom"
          :class="{ on: boot.wecomConnected || boot.pushChannel === 'webhook' }"
          :title="boot.wecomConnected ? $t('通讯录与消息卡片走企业微信') : boot.pushChannel === 'webhook' ? $t('通知发到企微群（群机器人）') : $t('没有配置企业微信：通知只进系统内消息中心')"
          data-test="mm-wecom"
        >{{ boot.wecomConnected ? $t('企微已连接') : boot.pushChannel === 'webhook' ? $t('群机器人已连接') : $t('未连接企微') }}</span>
        <button v-if="boot && (me?.isAdmin || needPickMe)" type="button" class="ss-btn sm" data-test="mm-setup-open" @click="setupOpen = true"><i class="ri-settings-4-line"></i>{{ $t('配置引导') }}</button>
        <div ref="idRoot" class="mm-id">
          <button
            type="button"
            class="mm-id__pill"
            :class="{ switchable: canSwitch }"
            :disabled="!boot"
            :title="canSwitch ? $t('切换当前身份') : $t('只有管理员可以切换身份')"
            data-test="mm-identity"
            @click="toggleSwitcher"
          >
            <template v-if="me?.person">{{ roleLabel }} · {{ me.person.name }}</template>
            <template v-else>{{ $t('选择身份') }}</template>
            <i v-if="canSwitch" class="ri-arrow-down-s-line"></i>
          </button>
          <div v-if="switcherOpen" class="mm-id__panel" data-test="mm-identity-panel">
            <p class="mm-id__tip">{{ $t('切换后按这个人的角色显示按钮（管理员代办、演示用）') }}</p>
            <button
              v-if="operatorAdminId && operatorAdminId !== me?.person?.id && operatorName"
              type="button"
              class="mm-id__back"
              @click="switchTo(operatorAdminId)"
            ><i class="ri-arrow-go-back-line"></i>{{ $t('回到 {name}（管理员）', { name: operatorName }) }}</button>
            <input v-model="idQuery" class="mm-id__search" type="search" :placeholder="$t('搜索姓名')" />
            <p v-if="idLoading" class="mm-id__state"><i class="ri-loader-4-line spin"></i>{{ $t('正在加载人员…') }}</p>
            <p v-else-if="idError" class="mm-id__state danger">{{ idError }}</p>
            <div v-else class="mm-id__list">
              <template v-for="g in idGroups" :key="g.id">
                <h5>{{ g.name }}</h5>
                <button
                  v-for="p in g.people"
                  :key="p.id"
                  type="button"
                  class="mm-id__row"
                  :class="{ on: p.id === me?.person?.id }"
                  :disabled="switching"
                  :data-test="`mm-identity-${p.id}`"
                  @click="switchTo(p.id)"
                >
                  <span class="mm-av" :style="{ background: avatarOf(p.name).color }">{{ avatarOf(p.name).text }}</span>
                  <span class="mm-id__name">{{ p.name }}</span>
                  <small>{{ p.title || '' }}</small>
                  <span v-if="isAdminId(p.id)" class="mm-id__tag">{{ $t('管理员') }}</span>
                </button>
              </template>
              <p v-if="!idGroups.length" class="mm-id__state">{{ $t('找不到人员请联系管理员同步通讯录') }}</p>
            </div>
          </div>
        </div>
      </div>
      <nav class="mm-tabs" role="tablist">
        <button
          v-for="t in visibleTabs"
          :key="t.key"
          type="button"
          role="tab"
          class="mm-tab"
          :class="{ active: active === t.key }"
          :aria-selected="active === t.key"
          :data-test="`mm-tab-${t.key}`"
          @click="goTab(t.key)"
        >
          <span>{{ t.title }}</span><em v-if="badgeOf(t.key)" class="mm-badge">{{ badgeOf(t.key) }}</em>
        </button>
      </nav>
    </section>

    <p v-if="loadError && !boot" class="ss-note danger">
      <i class="ri-error-warning-line"></i><span>{{ loadError }}</span>
      <button type="button" class="ss-link" @click="reload">{{ $t('重试') }}</button>
    </p>
    <p v-else-if="!boot" class="ss-note"><i class="ri-loader-4-line spin"></i>{{ $t('正在加载工作台…') }}</p>
    <template v-else>
      <p v-if="boot.org.peopleCount === 0" class="ss-note info mm-setup" data-test="mm-no-org">
        <i class="ri-team-line"></i>
        <span>{{ canAdmin ? $t('还没有组织人员：可在「系统设置 → 通讯录同步」同步企业微信通讯录，也可以先载入演示数据走一遍全流程。') : $t('还没有组织人员，请联系管理员同步通讯录。') }}</span>
        <button v-if="canAdmin" type="button" class="ss-btn sm primary" :disabled="demoBusy" data-test="mm-demo-load" @click="loadDemo">
          <i :class="demoBusy ? 'ri-loader-4-line spin' : 'ri-magic-line'"></i>{{ $t('载入演示数据') }}
        </button>
      </p>
      <p v-else-if="!me?.person" class="ss-note warn">
        <i class="ri-user-search-line"></i><span>{{ $t('还没有选择当前身份：点右上角选择你是谁，按钮按你的角色显示。') }}</span>
        <button v-if="canSwitch" type="button" class="ss-btn sm" @click="openSwitcher">{{ $t('选择身份') }}</button>
      </p>
      <div :key="identityKey" class="mm-body">
        <HomeTab v-if="active === 'home'" ref="tabRef" @role="setRole('home', $event)" />
        <MeetingsTab v-else-if="active === 'meetings'" ref="tabRef" @role="setRole('meetings', $event)" />
        <TasksTab v-else-if="active === 'tasks'" ref="tabRef" @role="setRole('tasks', $event)" />
        <ProjectsTab v-else-if="active === 'projects'" ref="tabRef" @role="setRole('projects', $event)" />
        <SettingsTab v-else-if="active === 'settings'" ref="tabRef" />
      </div>
    </template>
    <SetupWizard v-if="setupOpen" @close="setupOpen = false" @done="onSetupDone" />
  </div>
</template>

<script setup lang="ts">
/**
 * 解决方案 · 会议智能管理（workbench-meeting-mgmt）外壳。docs/meeting-mgmt-workbench.md
 * 顶部：返回 + 标题 + 企微连接状态 + 当前身份胶囊（管理员可切换身份）；页签：首页 / 会议 / 任务 / 项目 / 系统设置（仅管理员）。
 * 页签内容：首页、会议在 workbenches/meeting-mgmt/{HomeTab,MeetingsTab}.vue；任务、项目、系统设置在同目录的 Tasks/Projects/SettingsTab.vue。
 * 页签组件可以 emit('role', '主持人') 告诉外壳在胶囊里显示什么角色；defineExpose({ refresh }) 的页签在数据变了时会被叫刷新。
 */
import { computed, onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue';
import { t as i18nT } from '../i18n';
import { useNotificationStore } from '../stores/notification';
import PageBackButton from '../components/PageBackButton.vue';
import HomeTab from '../workbenches/meeting-mgmt/HomeTab.vue';
import MeetingsTab from '../workbenches/meeting-mgmt/MeetingsTab.vue';
import TasksTab from '../workbenches/meeting-mgmt/TasksTab.vue';
import ProjectsTab from '../workbenches/meeting-mgmt/ProjectsTab.vue';
import SettingsTab from '../workbenches/meeting-mgmt/SettingsTab.vue';
import SetupWizard from '../workbenches/meeting-mgmt/SetupWizard.vue';
import { avatarOf, errorMessage, goTab, mm, mmBoot, mmNav, mmSetupAutoShown, onMmEvent, refreshBoot, type MmTab } from '../workbenches/meeting-mgmt/shared';
import {
  clearPeopleCache, groupPeopleByDept, loadPeople, operatorAdminId, rememberOperatorAdmin, type MmPeople,
} from '../workbenches/meeting-mgmt/meetingUi';
import '../workbenches/service-settlement/styles.css';

const TABS: Array<{ key: MmTab; title: string }> = [
  { key: 'home', title: i18nT('首页') },
  { key: 'meetings', title: i18nT('会议') },
  { key: 'tasks', title: i18nT('任务') },
  { key: 'projects', title: i18nT('项目') },
  { key: 'settings', title: i18nT('系统设置') },
];
const TAB_KEY = 'totalclaw:meeting-mgmt-tab:v1';

const notif = useNotificationStore();
const boot = mmBoot;
const me = computed(() => boot.value?.me ?? null);
const active = computed<MmTab>(() => mmNav.value.tab);
const loadError = ref('');
const demoBusy = ref(false);
const reloadKey = ref(0);
const tabRef = ref<{ refresh?: () => unknown } | null>(null);
const roleByTab = reactive<Partial<Record<MmTab, string>>>({});
/** 配置引导：管理员第一次打开（还没走完）时自动弹一次；右上角按钮随时再打开 */
const setupOpen = ref(false);

const canAdmin = computed(() => !!me.value?.isAdmin || (boot.value?.settings.adminIds.length ?? 0) === 0);
const canSwitch = computed(() => !!boot.value && (canAdmin.value || !!operatorAdminId.value));
const visibleTabs = computed(() => TABS.filter((t) => t.key !== 'settings' || !!me.value?.isAdmin));
const identityKey = computed(() => `${me.value?.person?.id || 'none'}:${reloadKey.value}`);

function badgeOf(k: MmTab): number {
  const b = boot.value?.badges;
  if (!b) return 0;
  return k === 'home' ? b.home : k === 'meetings' ? b.meetings : k === 'tasks' ? b.tasks : 0;
}
function setRole(tab: MmTab, label: unknown): void {
  roleByTab[tab] = typeof label === 'string' ? label : '';
}
/** 胶囊上的角色：页签告诉的优先；系统设置页固定「管理员」；其它按全局身份兜底 */
const roleLabel = computed(() => {
  if (active.value === 'settings') return i18nT('管理员');
  const r = roleByTab[active.value];
  if (r) return r;
  return me.value?.isAdmin ? i18nT('管理员') : i18nT('项目成员');
});

// ── 身份切换 ──────────────────────────────────────
const idRoot = ref<HTMLElement | null>(null);
const switcherOpen = ref(false);
const idQuery = ref('');
const idLoading = ref(false);
const idError = ref('');
const switching = ref(false);
const people = ref<MmPeople>({ depts: [], people: [] });
const idGroups = computed(() => groupPeopleByDept(people.value, idQuery.value));
const operatorName = computed(() => people.value.people.find((p) => p.id === operatorAdminId.value)?.name || '');
const isAdminId = (id: string) => (boot.value?.settings.adminIds || []).includes(id);

async function openSwitcher(): Promise<void> {
  if (!canSwitch.value) return;
  switcherOpen.value = true;
  idQuery.value = '';
  idLoading.value = true;
  idError.value = '';
  try { people.value = await loadPeople(); } catch (e) { idError.value = errorMessage(e); } finally { idLoading.value = false; }
}
function toggleSwitcher(): void {
  if (switcherOpen.value) { switcherOpen.value = false; return; }
  void openSwitcher();
}
async function switchTo(personId: string): Promise<void> {
  if (switching.value) return;
  if (personId === me.value?.person?.id) { switcherOpen.value = false; return; }
  switching.value = true;
  try {
    await mm('identity.set', { personId });
    await refreshBoot();
    switcherOpen.value = false;
    const name = me.value?.person?.name || '';
    notif.success(i18nT('当前身份已切换为 {name}', { name }));
  } catch (e) {
    idError.value = errorMessage(e);
    notif.error(errorMessage(e));
  } finally {
    switching.value = false;
  }
}
function onDocDown(ev: MouseEvent): void {
  if (!switcherOpen.value) return;
  const root = idRoot.value;
  if (root && ev.target instanceof Node && root.contains(ev.target)) return;
  switcherOpen.value = false;
}

// ── 加载与刷新 ────────────────────────────────────
async function reload(): Promise<void> {
  loadError.value = '';
  try { await refreshBoot(); } catch (e) { loadError.value = errorMessage(e); }
}
async function loadDemo(): Promise<void> {
  if (demoBusy.value) return;
  demoBusy.value = true;
  try {
    await mm('demo.load');
    clearPeopleCache();
    await refreshBoot();
    reloadKey.value += 1;
    notif.success(i18nT('演示数据已载入'));
  } catch (e) {
    notif.error(errorMessage(e));
  } finally {
    demoBusy.value = false;
  }
}

let timer: ReturnType<typeof setTimeout> | null = null;
function scheduleRefresh(): void {
  if (timer) return;
  timer = setTimeout(() => {
    timer = null;
    void refreshBoot().catch(() => { /* 下次事件再刷 */ });
    try { void tabRef.value?.refresh?.(); } catch { /* 页签自己处理 */ }
  }, 300);
}

/** 通讯录换了（企微同步 / 导入）、当前身份不在里面，且这台电脑上能选身份：要先选「你是谁」 */
const needPickMe = computed(() => !!boot.value && !me.value?.person && boot.value.org.peopleCount > 0 && !!boot.value.canSwitchIdentity);
watch(() => boot.value?.setupPending, (p) => {
  if (p && !mmSetupAutoShown.value) { mmSetupAutoShown.value = true; setupOpen.value = true; }
}, { immediate: true });
// 进来就要选人：直接弹配置引导，第一屏就是「你是哪一位」（不用先去右上角找选身份）
watch(needPickMe, (v) => { if (v) setupOpen.value = true; }, { immediate: true });
function onSetupDone(): void {
  setupOpen.value = false;
  clearPeopleCache();
  reloadKey.value += 1;
  notif.success(i18nT('配置已保存，可以开始使用了'));
}

// 管理员身份记下来：切成别人后还能切回来
watch(() => me.value, (m) => {
  if (m?.isAdmin && m.person?.id) rememberOperatorAdmin(m.person.id);
}, { immediate: true });
// 身份变了：角色胶囊重新由页签上报
watch(() => me.value?.person?.id, () => { for (const k of Object.keys(roleByTab)) delete roleByTab[k as MmTab]; });
// 系统设置只对管理员显示
watch([active, () => me.value?.isAdmin, boot], () => {
  if (boot.value && active.value === 'settings' && !me.value?.isAdmin) goTab('home');
});
watch(active, (k) => { try { localStorage.setItem(TAB_KEY, k); } catch { /* 忽略 */ } });

let off: (() => void) | null = null;
onMounted(() => {
  if (mmNav.value.seq === 0) {
    try {
      const saved = localStorage.getItem(TAB_KEY);
      if (saved && TABS.some((t) => t.key === saved) && saved !== 'home') goTab(saved as MmTab);
    } catch { /* 忽略 */ }
  }
  void reload();
  off = onMmEvent((ev) => {
    if (!ev) return;
    if (ev.type === 'changed') {
      if (ev.scope === 'org' || ev.scope === 'all') clearPeopleCache();
      scheduleRefresh();
    } else if (ev.type === 'mobile' && boot.value) {
      boot.value = { ...boot.value, mobile: { running: ev.running, url: ev.url } };
    }
  });
  document.addEventListener('mousedown', onDocDown);
});
onBeforeUnmount(() => {
  off?.();
  if (timer) clearTimeout(timer);
  document.removeEventListener('mousedown', onDocDown);
});
</script>

<style scoped>
.mm-wb { display: grid; gap: 16px; padding: 18px 22px 40px; max-width: 1440px; margin: 0 auto; width: 100%; box-sizing: border-box; flex: 1; min-height: 0; overflow-y: auto; align-content: start; }
.mm-head { border: 1px solid var(--color-border); border-radius: var(--radius-6); background: var(--color-bg-card); padding: 16px 22px 0; display: grid; }
.mm-head__top { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; padding-bottom: 14px; border-bottom: 1px solid var(--color-border); }
.mm-head__top :deep(.page-back) { align-self: center; }
.mm-mark { width: 14px; height: 14px; border-radius: 4px; background: var(--color-brand); flex: 0 0 auto; margin-inline-start: 6px; }
.mm-head h1 { margin: 0; font-size: 24px; font-weight: 800; letter-spacing: .02em; }
.mm-head__sub { margin: 0; color: var(--color-text-secondary); font-size: var(--font-size-md); }
.mm-grow { flex: 1; }
.mm-wecom { font-size: var(--font-size-md); color: var(--color-text-secondary); white-space: nowrap; }
.mm-wecom:not(.on) { color: var(--color-warning); }

.mm-id { position: relative; }
.mm-id__pill { display: inline-flex; align-items: center; gap: 4px; height: 32px; padding: 0 14px; border-radius: var(--radius-pill); border: none; background: color-mix(in srgb, var(--color-brand) 12%, transparent); color: var(--color-brand); font: inherit; font-size: var(--font-size-md); font-weight: 700; white-space: nowrap; cursor: default; }
.mm-id__pill.switchable { cursor: pointer; }
.mm-id__pill.switchable:hover { background: color-mix(in srgb, var(--color-brand) 20%, transparent); }
.mm-id__pill:disabled { opacity: .6; }
.mm-id__panel { position: absolute; inset-inline-end: 0; top: calc(100% + 6px); z-index: 40; width: 300px; max-height: 460px; display: grid; grid-template-rows: auto auto auto minmax(0, 1fr); gap: 8px; padding: 12px; border: 1px solid var(--color-border); border-radius: var(--radius-5); background: var(--color-bg-elevated, var(--color-bg-card)); box-shadow: 0 12px 32px color-mix(in srgb, var(--color-text-primary) 16%, transparent); }
.mm-id__tip { margin: 0; font-size: 11.5px; color: var(--color-text-secondary); line-height: 1.5; }
.mm-id__back { display: inline-flex; align-items: center; gap: 6px; height: 30px; padding: 0 10px; border-radius: var(--radius-3); border: 1px dashed var(--color-brand); background: transparent; color: var(--color-brand); font: inherit; font-size: var(--font-size-sm); font-weight: 700; cursor: pointer; }
.mm-id__search { height: 32px; border-radius: var(--radius-3); border: 1px solid var(--color-border); background: var(--color-bg-input); color: var(--color-text-primary); font: inherit; font-size: var(--font-size-md); padding: 0 10px; }
.mm-id__search:focus { outline: none; border-color: var(--color-brand); }
.mm-id__state { margin: 0; font-size: 12.5px; color: var(--color-text-secondary); display: flex; gap: 6px; align-items: center; }
.mm-id__state.danger { color: var(--color-danger); }
.mm-id__list { overflow-y: auto; min-height: 0; display: grid; gap: 2px; align-content: start; }
.mm-id__list h5 { margin: 8px 0 2px; font-size: 11.5px; color: var(--color-text-secondary); font-weight: 700; }
.mm-id__row { display: flex; align-items: center; gap: 8px; padding: 6px 8px; border: none; border-radius: var(--radius-3); background: transparent; color: var(--color-text-primary); font: inherit; font-size: var(--font-size-md); text-align: start; cursor: pointer; }
.mm-id__row:hover { background: var(--color-bg-hover); }
.mm-id__row.on { background: color-mix(in srgb, var(--color-brand) 10%, transparent); color: var(--color-brand); font-weight: 700; }
.mm-id__row small { color: var(--color-text-secondary); font-size: 11.5px; flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.mm-id__name { white-space: nowrap; }
.mm-id__tag { font-size: 10.5px; font-weight: 700; padding: 1px 6px; border-radius: var(--radius-pill); background: color-mix(in srgb, var(--color-brand) 14%, transparent); color: var(--color-brand); }
.mm-av { width: 24px; height: 24px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; color: var(--color-on-accent); font-size: 11.5px; font-weight: 700; flex: 0 0 auto; }

.mm-tabs { display: flex; gap: 8px; overflow-x: auto; overflow-y: hidden; scrollbar-width: thin; }
.mm-tab { position: relative; display: inline-flex; align-items: center; gap: 8px; padding: 14px 26px 13px; border: none; background: transparent; cursor: pointer; font: inherit; font-size: 15px; font-weight: 500; color: var(--color-text-secondary); white-space: nowrap; flex: 0 0 auto; }
.mm-tab::after { content: ''; position: absolute; inset-inline: 0; bottom: 0; height: 3px; border-radius: 3px 3px 0 0; background: transparent; }
.mm-tab:hover { color: var(--color-brand); }
.mm-tab.active { color: var(--color-brand); font-weight: 700; }
.mm-tab.active::after { background: var(--color-brand); }
.mm-badge { font-style: normal; font-size: 11px; font-weight: 800; min-width: 18px; height: 18px; padding: 0 5px; border-radius: 9px; background: var(--color-danger); color: var(--color-on-accent); display: inline-flex; align-items: center; justify-content: center; }

.mm-setup { align-items: center; }
.mm-setup span { flex: 1; }
.mm-body { display: grid; gap: 16px; min-width: 0; }
.spin { animation: mm-spin 1s linear infinite; }
@keyframes mm-spin { to { transform: rotate(360deg); } }
</style>
