<template>
  <div class="ba-workbench">
    <header class="workbench-header">
      <div class="heading">
        <PageBackButton />
        <span class="heading-icon"><i class="ri-rocket-2-line"></i></span>
        <div>
          <p class="eyebrow">{{ $t('行业工作台') }}</p>
          <h1>{{ $t('经营自动化智能体') }}</h1>
          <p class="subtitle">{{ $t('短视频发自媒体、数字人介绍企业、商品图文上下架、经营数据自动统计推送。发布与上架默认停在提交前由你确认，数字全部由规则计算，财务数据只读。') }}</p>
        </div>
      </div>
      <div class="header-actions">
        <!-- 演示模式：六个页签一键造好示例数据（本机生成、不调用 AI、不发布、不推送）；旧版 App 没有这个动作就不显示 -->
        <template v-if="state?.demo">
          <button v-if="hasDemo" class="ss-btn" :disabled="demoBusy" data-test="ba-demo-clear" @click="clearDemo"><i :class="demoBusy ? 'ri-loader-4-line spin' : 'ri-delete-bin-6-line'"></i>{{ $t('清除演示数据') }}</button>
          <button class="ss-btn" :class="{ primary: !hasDemo }" :disabled="demoBusy" data-test="ba-demo-seed" @click="seedDemo"><i :class="demoBusy ? 'ri-loader-4-line spin' : 'ri-slideshow-3-line'"></i>{{ hasDemo ? $t('重新生成演示数据') : $t('演示模式') }}</button>
        </template>
        <button class="ss-btn" :disabled="loading" @click="reload"><i :class="loading ? 'ri-loader-4-line spin' : 'ri-refresh-line'"></i>{{ $t('刷新') }}</button>
      </div>
    </header>

    <section v-if="state" class="ba-bar">
      <span><i class="ri-store-2-line"></i>{{ state.settings.brandName || $t('未设置品牌名') }}</span>
      <span v-if="hasDemo" class="ss-chip warn" data-test="ba-demo-chip"><i class="ri-slideshow-3-line"></i>{{ $t('含演示数据') }}</span>
      <span class="ss-muted">{{ $t('商品 {a} · 视频 {b} · 上架 {c} · 销售数据 {d} 行', { a: garments.length, b: state.videos.length, c: state.listings.filter((l) => l.status === 'listed').length, d: state.salesRows }) }}</span>
      <p class="ba-bar__rule">
        <span class="no"><i class="ri-close-circle-line"></i>{{ $t('模型不算钱、不改财务数据、不擅自提交') }}</span>
        <span class="yes"><i class="ri-checkbox-circle-line"></i>{{ $t('发布 / 上架停在提交前由你确认') }}</span>
      </p>
    </section>

    <nav class="ba-tabs" role="tablist">
      <button v-for="t in TABS" :key="t.key" type="button" role="tab" class="ba-tab" :class="{ active: active === t.key }" :aria-selected="active === t.key" @click="select(t.key)">
        <i :class="t.icon"></i><span>{{ t.title }}</span><em v-if="badge(t.key)" class="ba-badge">{{ badge(t.key) }}</em>
      </button>
    </nav>

    <p v-for="v in dueVideos" :key="v.id" class="ss-note warn"><i class="ri-timer-flash-line"></i>{{ $t('「{p0}」到了定时发布时间', { p0: v.name }) }}<button type="button" class="ss-btn sm primary" @click="publishDue(v.id)">{{ $t('立即发布') }}</button></p>
    <p v-if="progressText" class="ss-note info ba-progress"><i class="ri-loader-4-line spin"></i>{{ progressText }}</p>

    <div v-if="ready" class="ba-body">
      <VideoTab v-if="active === 'video'" :focus="focus.video || null" />
      <AvatarTab v-else-if="active === 'avatar'" @goto="goto" />
      <ListingTab v-else-if="active === 'listing'" />
      <FinanceTab v-else-if="active === 'finance'" />
      <ScheduleTab v-else-if="active === 'schedule'" />
      <HistoryTab v-else-if="active === 'history'" @goto="goto" />
      <SettingsTab v-else-if="active === 'settings'" />
      <div v-else class="ba-ov">
        <section class="ss-panel">
          <h3>{{ $t('四个模块，一个商品库') }}</h3>
          <div class="ba-ov__cards">
            <button v-for="c in cards" :key="c.key" type="button" class="ba-ov__card" @click="select(c.key)"><i :class="c.icon"></i><strong>{{ c.title }}</strong><span>{{ c.text }}</span></button>
          </div>
          <p class="ss-muted">{{ $t('商品库在「服装AI试衣」里维护（导入、AI 打标签、尺码库存）；试穿图会自动成为短视频与上架图的素材。') }}</p>
        </section>
        <section class="ss-panel">
          <h3>{{ $t('三条红线') }}</h3>
          <ul class="ba-list">
            <li>{{ $t('钱和数字不交给模型算：营业额、毛利、库存、价格全部由规则计算；模型只写解读与文案，写出来的数字回原数据核对') }}</li>
            <li>{{ $t('对外发布与上下架有人工闸门：发布视频、上架、改价默认停在提交前等你确认，每次执行都留痕') }}</li>
            <li>{{ $t('财务数据只读：只导入、只统计，不写回收银或财务系统') }}</li>
          </ul>
        </section>
        <section class="ss-panel">
          <h3>{{ $t('合规') }}</h3>
          <ul class="ba-list">
            <li>{{ $t('数字人视频画面带「AI 生成」标识，发布文案末尾注明；使用真人形象须本人书面授权') }}</li>
            <li>{{ $t('脚本、标题、讲稿自动检查广告法极限词；活动信息里没有的价格 / 折扣会被标出来') }}</li>
            <li>{{ $t('平台账号由你在内置浏览器登录，系统不保存密码；按人的节奏操作，建议每账号每天发布不超过 3 条') }}</li>
          </ul>
        </section>
      </div>
    </div>
    <p v-else-if="loadError" class="ss-note danger"><i class="ri-error-warning-line"></i>{{ loadError }}</p>
    <p v-else class="ss-note"><i class="ri-loader-4-line spin"></i>{{ $t('正在加载工作台…') }}</p>
  </div>
</template>

<script setup lang="ts">
/**
 * 解决方案 · 经营自动化智能体。docs/biz-automation-workbench.md
 * 页签：短视频发布 / 数字人介绍 / 商品上下架 / 经营数据 / 定时与联动 / 方案说明 / 设置；每个模块是分步向导。
 */
import { computed, onBeforeUnmount, onMounted, reactive, ref } from 'vue';
import { t as i18nT } from '../i18n';
import PageBackButton from '../components/PageBackButton.vue';
import VideoTab from '../workbenches/biz-automation/VideoTab.vue';
import AvatarTab from '../workbenches/biz-automation/AvatarTab.vue';
import ListingTab from '../workbenches/biz-automation/ListingTab.vue';
import FinanceTab from '../workbenches/biz-automation/FinanceTab.vue';
import ScheduleTab from '../workbenches/biz-automation/ScheduleTab.vue';
import SettingsTab from '../workbenches/biz-automation/SettingsTab.vue';
import HistoryTab from '../workbenches/biz-automation/HistoryTab.vue';
import { useRouter } from 'vue-router';
import { useNotificationStore } from '../stores/notification';
import { useDialog } from '../composables/useDialog';
import { ba, baGarments, baProgress, baState, consumePublishResult, errorMessage, loadModels, onBaEvent, refreshState, startPublishWorkflow } from '../workbenches/biz-automation/shared';
import '../workbenches/service-settlement/styles.css';

type TabKey = 'video' | 'avatar' | 'listing' | 'finance' | 'schedule' | 'history' | 'overview' | 'settings';
const TABS: Array<{ key: TabKey; icon: string; title: string }> = [
  { key: 'video', icon: 'ri-movie-2-line', title: i18nT('短视频发布') },
  { key: 'avatar', icon: 'ri-user-voice-line', title: i18nT('数字人介绍') },
  { key: 'listing', icon: 'ri-store-3-line', title: i18nT('商品上下架') },
  { key: 'finance', icon: 'ri-line-chart-line', title: i18nT('经营数据') },
  { key: 'schedule', icon: 'ri-timer-line', title: i18nT('定时与联动') },
  { key: 'history', icon: 'ri-history-line', title: i18nT('历史记录') },
  { key: 'overview', icon: 'ri-book-open-line', title: i18nT('方案说明') },
  { key: 'settings', icon: 'ri-settings-3-line', title: i18nT('设置') },
];
const cards = [
  { key: 'video' as TabKey, icon: 'ri-movie-2-line', title: i18nT('短视频发布'), text: i18nT('商品图、试穿图 → 脚本与各平台文案 → 配音字幕成片 → 审核 → 抖音 / 快手 / 小红书 / 视频号') },
  { key: 'avatar' as TabKey, icon: 'ri-user-voice-line', title: i18nT('数字人介绍'), text: i18nT('知识库资料写讲稿，数字人口播成片，进入发布') },
  { key: 'listing' as TabKey, icon: 'ri-store-3-line', title: i18nT('商品上下架'), text: i18nT('按渠道生成图文，数字员工在网店后台上架；售罄、断码、过季按规则处理') },
  { key: 'finance' as TabKey, icon: 'ri-line-chart-line', title: i18nT('经营数据'), text: i18nT('导入收银 / 费用数据，规则算指标，模型写解读并回核，日报定时推送') },
];
const TAB_KEY = 'totalclaw:biz-automation-tab:v1';
function savedTab(): TabKey {
  try { const v = localStorage.getItem(TAB_KEY); return TABS.some((t) => t.key === v) ? (v as TabKey) : 'overview'; } catch { return 'overview'; }
}

const state = baState;
const garments = computed(() => baGarments.value);
const active = ref<TabKey>(savedTab());
const focus = reactive<Record<string, any>>({});
const ready = ref(false);
const loading = ref(false);
const loadError = ref('');
const progressText = computed(() => baProgress[active.value] || '');
const dueVideos = computed(() => (state.value?.videos || []).filter((v) => v.publishDue && v.status === 'approved'));
const router = useRouter();
const notif = useNotificationStore();
/** 定时发布到点：交给现成的视频发布固定流程 */
async function publishDue(id: string): Promise<void> {
  try {
    const input = await ba('video.publishInput', { id });
    await startPublishWorkflow(input, id);
    await router.push({ path: '/workflow' });
  } catch (e) { notif.error(errorMessage(e)); }
}

function badge(k: TabKey): string {
  const s = state.value;
  if (!s) return '';
  if (k === 'listing') { const n = s.ruleHits.filter((h) => h.rule === 'soldout' || h.rule === 'broken_size').length; return n ? String(n) : ''; }
  if (k === 'video') { const n = s.videos.filter((v) => v.status === 'rendered' || v.status === 'scripted').length; return n ? String(n) : ''; }
  return '';
}
function select(k: TabKey): void {
  active.value = k;
  try { localStorage.setItem(TAB_KEY, k); } catch { /* 忽略 */ }
}
function goto(key: string, payload?: any): void {
  if (!TABS.some((t) => t.key === key)) return;
  focus[key] = { ...(payload || {}), at: Date.now() };
  select(key as TabKey);
}

// ── 演示模式 ──
const dialog = useDialog();
const demoBusy = ref(false);
const hasDemo = computed(() => { const d = state.value?.demo; return !!d && d.videos + d.avatars + d.listings + d.sales + d.reports > 0; });
async function seedDemo(): Promise<void> {
  const ok = await dialog.confirm({
    title: hasDemo.value ? i18nT('重新生成演示数据') : i18nT('演示模式'),
    message: i18nT('生成一整套示例数据，六个页签都能直接演示：短视频 4 个（含已发布、待定时发布）、数字人讲稿 2 份、上架记录 8 条、近 60 天收银与费用数据和日报 / 月报。商品库里没有演示商品时，会连带生成服装AI试衣的演示数据。\n全部在本机生成，不调用 AI、不发布、不推送；门店自己的数据不受影响，随时可以一键清除。'),
    confirmLabel: i18nT('生成'),
  });
  if (!ok) return;
  demoBusy.value = true;
  try {
    await ba('demo.seed');
    await refreshState();
    notif.success(i18nT('演示数据已生成'));
  } catch (e) { notif.error(errorMessage(e)); } finally { demoBusy.value = false; }
}
async function clearDemo(): Promise<void> {
  const ok = await dialog.confirm({ title: i18nT('清除演示数据'), message: i18nT('只删除演示模式生成的视频、讲稿、上架记录、收银与费用数据和报表；门店自己的数据不受影响。服装AI试衣的演示商品在那个页面单独清除。'), confirmLabel: i18nT('清除'), danger: true });
  if (!ok) return;
  demoBusy.value = true;
  try {
    await ba('demo.clear');
    await refreshState();
    notif.success(i18nT('演示数据已清除'));
  } catch (e) { notif.error(errorMessage(e)); } finally { demoBusy.value = false; }
}

async function reload(): Promise<void> {
  loading.value = true;
  try {
    // 从发布工作流回来：先把回执记到对应视频上，再取状态（否则第一屏还是「发布中」）
    const consumed = await consumePublishResult().catch(() => false);
    await Promise.all([refreshState(), loadModels()]);
    if (consumed) notif.info(i18nT('发布结果已记入历史记录'));
    ready.value = true;
    loadError.value = '';
  } catch (e) { loadError.value = errorMessage(e); } finally { loading.value = false; }
}

let timer: ReturnType<typeof setTimeout> | null = null;
const clearers: Record<string, ReturnType<typeof setTimeout>> = {};
let off: (() => void) | null = null;
onMounted(() => {
  void reload();
  off = onBaEvent((ev) => {
    if (ev.type === 'publish-due' && ev.payload?.id) { void publishDue(String(ev.payload.id)); return; }
    if (ev.type === 'progress' && ev.payload?.key) {
      const k = String(ev.payload.key);
      baProgress[k] = String(ev.payload.message || '');
      clearTimeout(clearers[k]);
      clearers[k] = setTimeout(() => { baProgress[k] = ''; }, 20_000);
      return;
    }
    if (timer) return;
    timer = setTimeout(() => { timer = null; void refreshState().catch(() => {}); }, 250);
  });
});
onBeforeUnmount(() => { off?.(); if (timer) clearTimeout(timer); for (const t of Object.values(clearers)) clearTimeout(t); });
</script>

<style scoped>
.ba-workbench { display: grid; gap: 12px; padding: 18px 22px 40px; max-width: 1440px; margin: 0 auto; width: 100%; box-sizing: border-box; flex: 1; min-height: 0; overflow-y: auto; align-content: start; }
.workbench-header { display: flex; align-items: flex-start; justify-content: space-between; gap: 16px; flex-wrap: wrap; }
.heading { display: flex; gap: 14px; align-items: flex-start; }
.heading-icon { width: 48px; height: 48px; border-radius: var(--radius-6); display: inline-flex; align-items: center; justify-content: center; background: color-mix(in srgb, var(--color-brand) 14%, transparent); color: var(--color-brand); font-size: var(--font-size-2xl); flex: 0 0 auto; }
.eyebrow { margin: 0; font-size: var(--font-size-xs); font-weight: 800; letter-spacing: .08em; text-transform: uppercase; color: var(--color-text-secondary); }
h1 { margin: 2px 0 4px; font-size: 22px; }
.subtitle { margin: 0; color: var(--color-text-secondary); font-size: var(--font-size-md); line-height: 1.6; max-width: 900px; }
.header-actions { display: flex; gap: 8px; align-items: center; }
.ba-bar { display: flex; gap: 10px 16px; align-items: center; flex-wrap: wrap; padding: 8px 12px; border: 1px solid var(--color-border); border-radius: var(--radius-5); background: var(--color-bg-card); font-size: 12.5px; }
.ba-bar > span:first-child { display: inline-flex; gap: 6px; align-items: center; font-weight: 700; }
.ba-bar__rule { margin: 0 0 0 auto; display: flex; gap: 12px; flex-wrap: wrap; color: var(--color-text-secondary); }
.ba-bar__rule span { display: inline-flex; gap: 4px; align-items: center; }
.ba-bar__rule .no i { color: var(--color-danger); }
.ba-bar__rule .yes i { color: var(--color-success); }
.ba-tabs { display: flex; gap: 2px; overflow-x: auto; overflow-y: hidden; min-height: 44px; align-items: stretch; border-bottom: 1px solid var(--color-border); scrollbar-width: thin; }
.ba-tab { display: inline-flex; align-items: center; gap: 6px; padding: 8px 12px; border: none; border-bottom: 2px solid transparent; margin-bottom: -1px; background: transparent; cursor: pointer; font: inherit; font-size: var(--font-size-md); font-weight: 600; color: var(--color-text-secondary); white-space: nowrap; flex: 0 0 auto; border-radius: var(--radius-3) var(--radius-3) 0 0; }
.ba-tab i { font-size: 16px; }
.ba-tab:hover { color: var(--color-brand); background: var(--color-bg-hover); }
.ba-tab.active { color: var(--color-brand); border-bottom-color: var(--color-brand); }
.ba-badge { font-style: normal; font-size: 10.5px; font-weight: 800; min-width: 18px; height: 18px; padding: 0 5px; border-radius: var(--radius-3); background: var(--color-danger); color: var(--color-on-accent); display: inline-flex; align-items: center; justify-content: center; }
.ba-progress { position: sticky; top: 0; z-index: 25; }
.ba-body { display: grid; gap: 14px; }
.ba-ov { display: grid; gap: 14px; max-width: 1100px; }
.ss-panel { border: 1px solid var(--color-border); border-radius: var(--radius-6); background: var(--color-bg-card); padding: 16px; display: grid; gap: 10px; }
h3 { margin: 0; font-size: var(--font-size-lg); }
.ba-ov__cards { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 10px; }
.ba-ov__card { display: grid; gap: 4px; text-align: start; padding: 12px; border-radius: var(--radius-5); background: var(--color-bg-primary); border: 1px solid var(--color-border); font: inherit; font-size: 12.5px; color: var(--color-text-primary); cursor: pointer; }
.ba-ov__card:hover { border-color: var(--color-brand); }
.ba-ov__card i { font-size: 22px; color: var(--color-brand); }
.ba-ov__card span { color: var(--color-text-secondary); line-height: 1.55; }
.ba-list { margin: 0; padding-inline-start: 18px; font-size: 12.5px; color: var(--color-text-secondary); display: grid; gap: 4px; line-height: 1.6; }
.spin { animation: ba-spin 1s linear infinite; }
@keyframes ba-spin { to { transform: rotate(360deg); } }
</style>
