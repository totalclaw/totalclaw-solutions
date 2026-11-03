<template>
  <div class="ap-workbench">
    <header class="workbench-header">
      <div class="heading">
        <PageBackButton />
        <span class="heading-icon"><i class="ri-t-shirt-air-line"></i></span>
        <div>
          <p class="eyebrow">{{ $t('行业工作台') }}</p>
          <h1>{{ $t('服装AI试衣') }}</h1>
          <p class="subtitle">{{ $t('AI 一键换装：顾客在手机上、店员在电脑上都能看到试穿效果；背景、姿势、发型自由选；试穿码到店试实物，试穿数据指导主推款。') }}</p>
        </div>
      </div>
      <div class="header-actions">
        <!-- 演示模式：一键给每个页签造好示例数据（本机生成、不调用 AI）；旧版 App 的主进程没有这个动作，就不显示 -->
        <template v-if="state?.demo">
          <button v-if="hasDemo" class="ss-btn" :disabled="demoBusy" data-test="ap-demo-clear" @click="clearDemo"><i :class="demoBusy ? 'ri-loader-4-line spin' : 'ri-delete-bin-6-line'"></i>{{ $t('清除演示数据') }}</button>
          <button class="ss-btn" :class="{ primary: !hasDemo }" :disabled="demoBusy" data-test="ap-demo-seed" @click="seedDemo"><i :class="demoBusy ? 'ri-loader-4-line spin' : 'ri-slideshow-3-line'"></i>{{ hasDemo ? $t('重新生成演示数据') : $t('演示模式') }}</button>
        </template>
        <button class="ss-btn" :disabled="loading" @click="reload"><i :class="loading ? 'ri-loader-4-line spin' : 'ri-refresh-line'"></i>{{ $t('刷新') }}</button>
      </div>
    </header>

    <section v-if="state" class="ap-bar">
      <span><i class="ri-store-2-line"></i>{{ state.settings.storeName }}</span>
      <span class="ss-chip" :class="state.imageReady ? 'ok' : 'warn'"><i :class="state.imageReady ? 'ri-check-line' : 'ri-key-2-line'"></i>{{ state.imageReady ? $t('图像服务已就绪') : $t('图像服务未配置') }}</span>
      <button type="button" class="ss-chip" :class="state.mobile.running ? 'ok' : ''" @click="select('mobile')"><i class="ri-smartphone-line"></i>{{ state.mobile.running ? $t('手机端运行中') : $t('手机端未开启') }}</button>
      <span v-if="hasDemo" class="ss-chip warn" data-test="ap-demo-chip"><i class="ri-slideshow-3-line"></i>{{ $t('含演示数据') }}</span>
      <span class="ss-muted">{{ $t('商品 {a} · 顾客 {b} · 试穿图 {c}', { a: state.garments.length, b: state.customers.filter((c) => !c.purgedAt).length, c: state.tryons.filter((t) => t.status === 'done').length }) }}</span>
      <span class="ap-bar__rule"><i class="ri-shield-user-line"></i>{{ $t('先授权后上传 · 照片只存本机 · {d} 天自动删除', { d: state.settings.retentionDays }) }}</span>
    </section>

    <nav class="ap-tabs" role="tablist">
      <button v-for="t in TABS" :key="t.key" type="button" role="tab" class="ap-tab" :class="{ active: active === t.key }" :aria-selected="active === t.key" @click="select(t.key)">
        <i :class="t.icon"></i><span>{{ t.title }}</span><em v-if="badge(t.key)" class="ap-badge">{{ badge(t.key) }}</em>
      </button>
    </nav>

    <p v-if="apProgress.message" class="ss-note info ap-progress"><i class="ri-loader-4-line spin"></i>{{ apProgress.message }}</p>

    <div v-if="ready" class="ap-body">
      <TryonFlow v-show="active === 'flow'" ref="flowRef" />
      <LiveTab v-if="active === 'live'" />
      <GarmentsTab v-else-if="active === 'garments'" />
      <StylesTab v-else-if="active === 'styles'" />
      <MobileTab v-else-if="active === 'mobile'" @open-customer="openCustomer" />
      <CheckinTab v-else-if="active === 'checkin'" />
      <DashboardTab v-else-if="active === 'dashboard'" />
      <OverviewTab v-else-if="active === 'overview'" />
      <SettingsTab v-else-if="active === 'settings'" />
    </div>
    <p v-else-if="loadError" class="ss-note danger"><i class="ri-error-warning-line"></i>{{ loadError }}</p>
    <p v-else class="ss-note"><i class="ri-loader-4-line spin"></i>{{ $t('正在加载工作台…') }}</p>
  </div>
</template>

<script setup lang="ts">
/**
 * 解决方案 · 服装实体店智能体。docs/apparel-store-workbench.md
 *
 * 主页是「AI 一键换装」七步固定流程（每步独立状态 + 粘性进度条）；
 * 其余页签：商品库 / 造型库 / 手机端 / 到店核销 / 数据看板 / 方案说明 / 设置。
 * 手机端顾客的操作经主进程推 state 事件，这里整体刷新。
 */
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';
import { t as i18nT } from '../i18n';
import PageBackButton from '../components/PageBackButton.vue';
import TryonFlow from '../workbenches/apparel-store/TryonFlow.vue';
import GarmentsTab from '../workbenches/apparel-store/GarmentsTab.vue';
import LiveTab from '../workbenches/apparel-store/LiveTab.vue';
import StylesTab from '../workbenches/apparel-store/StylesTab.vue';
import MobileTab from '../workbenches/apparel-store/MobileTab.vue';
import CheckinTab from '../workbenches/apparel-store/CheckinTab.vue';
import DashboardTab from '../workbenches/apparel-store/DashboardTab.vue';
import OverviewTab from '../workbenches/apparel-store/OverviewTab.vue';
import SettingsTab from '../workbenches/apparel-store/SettingsTab.vue';
import { ap, apProgress, apState, errorMessage, loadOptions, onApEvent, refreshState, refreshStats } from '../workbenches/apparel-store/shared';
import { useDialog } from '../composables/useDialog';
import { useNotificationStore } from '../stores/notification';
import '../workbenches/service-settlement/styles.css';

type TabKey = 'flow' | 'live' | 'garments' | 'styles' | 'mobile' | 'checkin' | 'dashboard' | 'overview' | 'settings';
const TABS: Array<{ key: TabKey; icon: string; title: string }> = [
  { key: 'flow', icon: 'ri-shirt-line', title: i18nT('一键换装') },
  { key: 'live', icon: 'ri-live-line', title: i18nT('实时试衣') },
  { key: 'garments', icon: 'ri-t-shirt-line', title: i18nT('商品库') },
  { key: 'styles', icon: 'ri-landscape-line', title: i18nT('造型库') },
  { key: 'mobile', icon: 'ri-smartphone-line', title: i18nT('手机端') },
  { key: 'checkin', icon: 'ri-qr-scan-2-line', title: i18nT('到店核销') },
  { key: 'dashboard', icon: 'ri-bar-chart-2-line', title: i18nT('数据看板') },
  { key: 'overview', icon: 'ri-book-open-line', title: i18nT('方案说明') },
  { key: 'settings', icon: 'ri-settings-3-line', title: i18nT('设置') },
];
const TAB_KEY = 'totalclaw:apparel-store-tab:v1';
function savedTab(): TabKey {
  try { const v = localStorage.getItem(TAB_KEY); return TABS.some((t) => t.key === v) ? (v as TabKey) : 'flow'; } catch { return 'flow'; }
}

const state = apState;
const active = ref<TabKey>(savedTab());
const ready = ref(false);
const loading = ref(false);
const loadError = ref('');
const flowRef = ref<InstanceType<typeof TryonFlow> | null>(null);
const dialog = useDialog();
const notif = useNotificationStore();

// ── 演示模式 ──
const demoBusy = ref(false);
const hasDemo = computed(() => { const d = state.value?.demo; return !!d && d.garments + d.customers + d.tryons > 0; });
async function seedDemo(): Promise<void> {
  const ok = await dialog.confirm({
    title: hasDemo.value ? i18nT('重新生成演示数据') : i18nT('演示模式'),
    message: i18nT('生成一整套示例数据，每个页签都能直接演示：商品 12 件、顾客 11 位（含 3 位已按保留期清除）、试穿图 30 多张（含待核销的试穿码、到店结果和 14 天数据走势）。\n全部在本机生成，不调用 AI、不产生费用；门店自己录入的数据不受影响，随时可以一键清除。'),
    confirmLabel: i18nT('生成'),
  });
  if (!ok) return;
  demoBusy.value = true;
  try {
    const r = await ap<{ garments: number; customers: number; tryons: number }>('demo.seed');
    await Promise.all([refreshState(), refreshStats().catch(() => undefined)]);
    notif.success(i18nT('已生成演示数据：商品 {a} 件、顾客 {b} 位、试穿 {c} 张', { a: r.garments, b: r.customers, c: r.tryons }));
  } catch (e) { notif.error(errorMessage(e)); } finally { demoBusy.value = false; }
}
async function clearDemo(): Promise<void> {
  const ok = await dialog.confirm({ title: i18nT('清除演示数据'), message: i18nT('只删除演示模式生成的商品、顾客和试穿图（连同图片）；门店自己录入的数据不受影响。'), confirmLabel: i18nT('清除'), danger: true });
  if (!ok) return;
  demoBusy.value = true;
  try {
    await ap('demo.clear');
    await Promise.all([refreshState(), refreshStats().catch(() => undefined)]);
    notif.success(i18nT('演示数据已清除'));
  } catch (e) { notif.error(errorMessage(e)); } finally { demoBusy.value = false; }
}

const waiting = computed(() => (state.value?.tryons || []).filter((t) => t.wantVisit && !t.visit).length);
function badge(k: TabKey): string {
  if (k === 'checkin') return waiting.value ? String(waiting.value) : '';
  if (k === 'mobile') return state.value?.mobile.activeSessions ? String(state.value.mobile.activeSessions) : '';
  return '';
}
function select(k: TabKey): void {
  active.value = k;
  try { localStorage.setItem(TAB_KEY, k); } catch { /* 忽略 */ }
}
function openCustomer(id: string): void {
  select('flow');
  flowRef.value?.focusCustomer(id);
}

async function reload(): Promise<void> {
  loading.value = true;
  try {
    await Promise.all([refreshState(), loadOptions()]);
    ready.value = true;
    loadError.value = '';
  } catch (e) { loadError.value = errorMessage(e); } finally { loading.value = false; }
}

let timer: ReturnType<typeof setTimeout> | null = null;
let progressTimer: ReturnType<typeof setTimeout> | null = null;
let off: (() => void) | null = null;
onMounted(() => {
  void reload();
  off = onApEvent((ev) => {
    if (ev.type === 'progress') {
      apProgress.message = String(ev.payload?.message || '');
      if (progressTimer) clearTimeout(progressTimer);
      progressTimer = setTimeout(() => { apProgress.message = ''; }, 15_000);
      return;
    }
    if (timer) return;
    timer = setTimeout(() => { timer = null; void refreshState().catch(() => {}); }, 200);
  });
});
onBeforeUnmount(() => { off?.(); if (timer) clearTimeout(timer); if (progressTimer) clearTimeout(progressTimer); apProgress.message = ''; });
</script>

<style scoped>
/* 外层 .page-wrap 是 overflow:hidden：路由页自己给滚动区，sticky 进度条以本容器为滚动上下文 */
.ap-workbench { display: grid; gap: 12px; padding: 18px 22px 40px; max-width: 1440px; margin: 0 auto; width: 100%; box-sizing: border-box; flex: 1; min-height: 0; overflow-y: auto; align-content: start; }
.workbench-header { display: flex; align-items: flex-start; justify-content: space-between; gap: 16px; flex-wrap: wrap; }
.heading { display: flex; gap: 14px; align-items: flex-start; }
.heading-icon { width: 48px; height: 48px; border-radius: var(--radius-6); display: inline-flex; align-items: center; justify-content: center; background: color-mix(in srgb, var(--color-brand) 14%, transparent); color: var(--color-brand); font-size: var(--font-size-2xl); flex: 0 0 auto; }
.eyebrow { margin: 0; font-size: var(--font-size-xs); font-weight: 800; letter-spacing: .08em; text-transform: uppercase; color: var(--color-text-secondary); }
h1 { margin: 2px 0 4px; font-size: 22px; }
.subtitle { margin: 0; color: var(--color-text-secondary); font-size: var(--font-size-md); line-height: 1.6; max-width: 900px; }
.header-actions { display: flex; gap: 8px; align-items: center; }
.ap-bar { display: flex; gap: 10px 16px; align-items: center; flex-wrap: wrap; padding: 8px 12px; border: 1px solid var(--color-border); border-radius: var(--radius-5); background: var(--color-bg-card); font-size: 12.5px; }
.ap-bar > span:first-child { display: inline-flex; gap: 6px; align-items: center; font-weight: 700; }
.ap-bar button.ss-chip { border: 0; cursor: pointer; font: inherit; font-size: var(--font-size-xs); font-weight: 700; }
.ap-bar__rule { margin-inline-start: auto; display: inline-flex; gap: 4px; align-items: center; color: var(--color-text-secondary); }
.ap-bar__rule i { color: var(--color-success); }
.ap-tabs { display: flex; gap: 2px; overflow-x: auto; overflow-y: hidden; min-height: 44px; align-items: stretch; border-bottom: 1px solid var(--color-border); scrollbar-width: thin; }
.ap-tab { display: inline-flex; align-items: center; gap: 6px; padding: 8px 12px; border: none; border-bottom: 2px solid transparent; margin-bottom: -1px; background: transparent; cursor: pointer; font: inherit; font-size: var(--font-size-md); font-weight: 600; color: var(--color-text-secondary); white-space: nowrap; flex: 0 0 auto; border-radius: var(--radius-3) var(--radius-3) 0 0; }
.ap-tab i { font-size: 16px; }
.ap-tab:hover { color: var(--color-brand); background: var(--color-bg-hover); }
.ap-tab.active { color: var(--color-brand); border-bottom-color: var(--color-brand); }
.ap-badge { font-style: normal; font-size: 10.5px; font-weight: 800; min-width: 18px; height: 18px; padding: 0 5px; border-radius: var(--radius-3); background: var(--color-danger); color: var(--color-on-accent); display: inline-flex; align-items: center; justify-content: center; }
.ap-progress { position: sticky; top: 0; z-index: 25; }
.ap-body { display: grid; gap: 14px; }
.spin { animation: ap-spin 1s linear infinite; }
@keyframes ap-spin { to { transform: rotate(360deg); } }
</style>
