<template>
  <div class="ft-workbench">
    <header class="workbench-header">
      <div class="heading">
        <PageBackButton />
        <span class="heading-icon"><i class="ri-ship-2-line"></i></span>
        <div>
          <p class="eyebrow">{{ $t('行业工作台') }}</p>
          <h1>{{ $t('外贸业务智能体') }}</h1>
          <p class="subtitle">{{ $t('按十项日常工作分成十个模块：数字员工把资料、初稿和提醒准备好，业务员做判断、做决定。对外发出的内容由人确认；只有打开了自动回复的邮箱会按规则自动回信。') }}</p>
        </div>
      </div>
      <div class="header-actions">
        <button class="ss-btn" :disabled="loading" @click="reload"><i :class="loading ? 'ri-loader-4-line spin' : 'ri-refresh-line'"></i>{{ $t('刷新') }}</button>
      </div>
    </header>

    <!-- 十个模块 -->
    <nav class="ft-tabs" role="tablist">
      <button
        v-for="m in modules" :key="m.key" type="button" role="tab"
        class="ft-tab" :class="{ active: active === m.key }" :aria-selected="active === m.key" :title="m.desc"
        @click="select(m.key)"
      >
        <i :class="m.icon"></i>
        <span>{{ m.title }}</span>
        <em v-if="badge(m.key)" class="ft-badge">{{ badge(m.key) }}</em>
      </button>
      <span class="ft-tabs__grow"></span>
      <!-- 设置：多邮箱接管 / 结果目录 / 各模块模型（原来放顶部，太占空间） -->
      <button
        type="button" role="tab" class="ft-tab" :class="{ active: active === 'settings' }" :aria-selected="active === 'settings'"
        :title="settingsHint" @click="select('settings')"
      >
        <i class="ri-settings-3-line"></i>
        <span>{{ $t('设置') }}</span>
        <em v-if="settingsAlert" class="ft-badge warn" :title="settingsHint">!</em>
      </button>
    </nav>

    <p v-if="progressText" class="ss-note info ft-progress"><i class="ri-loader-4-line spin"></i>{{ progressText }}</p>

    <div v-if="ready" class="ft-body">
      <SettingsTab v-if="active === 'settings'" />
      <component :is="tabComponent" v-else :key="active" :meta="activeMeta" :focus="focus[active] || null" @goto="goto" />
    </div>
    <p v-else-if="loadError" class="ss-note danger"><i class="ri-error-warning-line"></i>{{ loadError }}</p>
    <p v-else class="ss-note"><i class="ri-loader-4-line spin"></i>{{ $t('正在加载工作台…') }}</p>
  </div>
</template>

<script setup lang="ts">
/**
 * 解决方案 · 外贸业务智能体工作台。
 *
 * 页面按十项日常工作组织成十个 tab（平台运营 / 客户开发 / 新询盘处理 / 客户背调 / 客户跟进 /
 * 内容生产 / 网站社媒 / 报价 / 订单推进 / 数据整理），多邮箱接管放在顶部全局条。
 * 每个模块自己是分步向导（每步独立状态 + 粘性进度条，见 docs/solution-workbench-ux-guidelines.md），
 * 模块头明确写出本模块用哪个模型。
 */
import { computed, onBeforeUnmount, onMounted, reactive, ref, type Component } from 'vue';
import type { FtModuleKey } from '@totalclaw/ipc-contracts';
import { t as i18nT } from '../i18n';
import PageBackButton from '../components/PageBackButton.vue';
import SettingsTab from '../workbenches/foreign-trade/SettingsTab.vue';
import PlatformTab from '../workbenches/foreign-trade/PlatformTab.vue';
import ProspectTab from '../workbenches/foreign-trade/ProspectTab.vue';
import InquiryTab from '../workbenches/foreign-trade/InquiryTab.vue';
import BackgroundTab from '../workbenches/foreign-trade/BackgroundTab.vue';
import FollowupTab from '../workbenches/foreign-trade/FollowupTab.vue';
import ContentTab from '../workbenches/foreign-trade/ContentTab.vue';
import SocialTab from '../workbenches/foreign-trade/SocialTab.vue';
import QuoteTab from '../workbenches/foreign-trade/QuoteTab.vue';
import OrderTab from '../workbenches/foreign-trade/OrderTab.vue';
import ReportTab from '../workbenches/foreign-trade/ReportTab.vue';
import {
  errorMessage, ftProgress, ftState, loadModels, moduleMetas, onFtEvent, refreshState,
} from '../workbenches/foreign-trade/shared';
import '../workbenches/service-settlement/styles.css';
import '../workbenches/foreign-trade/styles.css';

const modules = moduleMetas();
const COMPONENTS: Record<FtModuleKey, Component> = {
  platform: PlatformTab, prospect: ProspectTab, inquiry: InquiryTab, background: BackgroundTab, followup: FollowupTab,
  content: ContentTab, social: SocialTab, quote: QuoteTab, order: OrderTab, report: ReportTab,
};
const TAB_KEY = 'totalclaw:foreign-trade-tab:v1';
type TabKey = FtModuleKey | 'settings';
function savedTab(): TabKey {
  try {
    const v = localStorage.getItem(TAB_KEY);
    return v === 'settings' || modules.some((m) => m.key === v) ? (v as TabKey) : 'inquiry';
  } catch { return 'inquiry'; }
}

const state = ftState;
const active = ref<TabKey>(savedTab());
const focus = reactive<Record<string, any>>({});
const ready = ref(false);
const loading = ref(false);
const loadError = ref('');

const mailboxes = computed(() => state.value?.mailboxes || []);
const mailboxErrors = computed(() => mailboxes.value.filter((m) => m.enabled && m.status === 'error').length);
/** 设置 tab 上的提醒：还没接管邮箱，或有邮箱收件异常 */
const settingsAlert = computed(() => ready.value && (!mailboxes.value.length || mailboxErrors.value > 0));
const settingsHint = computed(() => (!mailboxes.value.length
  ? i18nT('还没有接管邮箱，在这里添加')
  : mailboxErrors.value ? i18nT('{n} 个邮箱收件异常', { n: mailboxErrors.value }) : i18nT('邮箱接管、结果目录、各模块模型')));
const activeMeta = computed(() => modules.find((m) => m.key === active.value) || modules[0]);
const tabComponent = computed(() => (active.value === 'settings' ? null : COMPONENTS[active.value]));
const progressText = computed(() => ftProgress[active.value] || '');

function badge(key: FtModuleKey): string {
  const s = state.value;
  if (!s) return '';
  if (key === 'inquiry') {
    const n = s.inquiries.filter((q) => q.status === 'new' || q.status === 'extracted').length;
    return n ? String(n) : '';
  }
  if (key === 'order') {
    const today = new Date().toISOString().slice(0, 10);
    const n = s.orders.filter((o) => o.status === 'active').reduce((sum, o) => sum + o.nodes.filter((x) => !x.done && x.due && x.due < today).length, 0);
    return n ? String(n) : '';
  }
  return '';
}

function select(key: TabKey): void {
  active.value = key;
  try { localStorage.setItem(TAB_KEY, key); } catch { /* 忽略 */ }
}
function goto(key: string, payload: any): void {
  if (!modules.some((m) => m.key === key)) return;
  focus[key as FtModuleKey] = { ...(payload || {}), at: Date.now() };
  select(key as FtModuleKey);
}

async function reload(): Promise<void> {
  loading.value = true;
  try {
    await Promise.all([refreshState(), loadModels()]);
    ready.value = true;
    loadError.value = '';
  } catch (e) {
    loadError.value = errorMessage(e);
  } finally {
    loading.value = false;
  }
}

let refreshTimer: ReturnType<typeof setTimeout> | null = null;
function scheduleRefresh(): void {
  if (refreshTimer) return;
  refreshTimer = setTimeout(() => { refreshTimer = null; void refreshState().catch(() => {}); }, 400);
}
const clearProgress: Record<string, ReturnType<typeof setTimeout>> = {};
let off: (() => void) | null = null;
onMounted(() => {
  void reload();
  off = onFtEvent((ev) => {
    if (ev.type === 'progress' && ev.payload?.key) {
      const key = String(ev.payload.key);
      ftProgress[key] = String(ev.payload.message || '');
      clearTimeout(clearProgress[key]);
      clearProgress[key] = setTimeout(() => { ftProgress[key] = ''; }, 15_000);
      return;
    }
    scheduleRefresh();
  });
});
onBeforeUnmount(() => {
  off?.();
  off = null;
  if (refreshTimer) clearTimeout(refreshTimer);
  for (const t of Object.values(clearProgress)) clearTimeout(t);
});
</script>

<style scoped>
/* 外层 .page-wrap 是 overflow:hidden：路由页自己给滚动区，sticky 进度条以本容器为滚动上下文 */
.ft-workbench { display: grid; gap: 14px; padding: 18px 22px 40px; max-width: 1440px; margin: 0 auto; width: 100%; box-sizing: border-box; flex: 1; min-height: 0; overflow-y: auto; align-content: start; }
.workbench-header { display: flex; align-items: flex-start; justify-content: space-between; gap: 16px; flex-wrap: wrap; }
.heading { display: flex; gap: 14px; align-items: flex-start; }
.heading-icon { width: 48px; height: 48px; border-radius: 14px; display: inline-flex; align-items: center; justify-content: center; background: color-mix(in srgb, var(--color-brand) 14%, transparent); color: var(--color-brand); font-size: 24px; flex: 0 0 auto; }
.eyebrow { margin: 0; font-size: 11px; font-weight: 800; letter-spacing: .08em; text-transform: uppercase; color: var(--color-text-secondary); }
h1 { margin: 2px 0 4px; font-size: 22px; }
.subtitle { margin: 0; color: var(--color-text-secondary); font-size: 13px; line-height: 1.6; max-width: 900px; }
.header-actions { display: flex; gap: 8px; align-items: center; }


/* 横向可滚动的 tab 条是滚动容器，min-height 默认会算成 0：外层网格高度固定、内容溢出时这一行被压扁成一条线 */
.ft-tabs { display: flex; gap: 2px; overflow-x: auto; overflow-y: hidden; min-height: 44px; align-items: stretch; border-bottom: 1px solid var(--color-border); scrollbar-width: thin; }
.ft-tab { display: inline-flex; align-items: center; gap: 6px; padding: 8px 14px; border: none; border-bottom: 2px solid transparent; margin-bottom: -1px; background: transparent; cursor: pointer; font: inherit; font-size: 13px; font-weight: 600; color: var(--color-text-secondary); white-space: nowrap; flex: 0 0 auto; border-radius: 8px 8px 0 0; transition: .15s; }
.ft-tab i { font-size: 16px; }
.ft-tab:hover { color: var(--color-brand); background: var(--color-bg-hover); }
.ft-tab.active { color: var(--color-brand); border-bottom-color: var(--color-brand); }
.ft-tabs__grow { flex: 1 1 auto; }
.ft-badge.warn { background: var(--color-warning); }
.ft-badge { font-style: normal; font-size: 10.5px; font-weight: 800; min-width: 18px; height: 18px; padding: 0 5px; border-radius: 9px; background: var(--color-danger); color: #fff; display: inline-flex; align-items: center; justify-content: center; }
.ft-progress { position: sticky; top: 0; z-index: 5; }
.ft-body { display: grid; gap: 14px; }
.spin { animation: ft-spin 1s linear infinite; }
@keyframes ft-spin { to { transform: rotate(360deg); } }
</style>
