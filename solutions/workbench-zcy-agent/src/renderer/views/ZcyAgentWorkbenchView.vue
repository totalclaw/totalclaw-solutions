<template>
  <div class="zc-workbench">
    <header class="workbench-header">
      <div class="heading">
        <PageBackButton />
        <span class="heading-icon"><i class="ri-government-line"></i></span>
        <div>
          <p class="eyebrow">{{ $t('行业工作台') }}</p>
          <h1>{{ $t('政采云智能体') }}</h1>
          <p class="subtitle">{{ $t('给它企业材料和政采云账号，它在内置浏览器里替你做供应商的日常工作：商品上架、询价报价、接单发货、待开票订单转开票。价格由规则计算，提交、报价、接单都停在最后一步由你确认。') }}</p>
        </div>
      </div>
      <div class="header-actions">
        <button class="ss-btn" :disabled="loading" @click="reload"><i :class="loading ? 'ri-loader-4-line spin' : 'ri-refresh-line'"></i>{{ $t('刷新') }}</button>
      </div>
    </header>

    <section v-if="state" class="zc-bar">
      <span><i class="ri-building-2-line"></i>{{ state.settings.company.name || $t('未设置企业') }}</span>
      <span class="ss-muted">{{ $t('规则：{r} · 商品 {a} · 询价单 {b} · 订单 {c}', { r: regionName, a: state.products.length, b: state.inquiries.length, c: state.orders.length }) }}</span>
      <span v-if="state.workbench?.loggedIn" class="ss-chip" :class="state.workbench.temporary ? 'warn' : 'ok'" data-test="zc-bar-wb">{{ [state.workbench.region, state.workbench.identity || $t('已登录')].filter(Boolean).join(' · ') }}</span>
      <span v-else class="ss-chip" data-test="zc-bar-wb">{{ $t('还没读取政采云工作台') }}</span>
      <p class="zc-bar__rule">
        <span class="no"><i class="ri-close-circle-line"></i>{{ $t('模型不算价、不碰密码与验证码、不擅自提交') }}</span>
        <span class="yes"><i class="ri-checkbox-circle-line"></i>{{ $t('提交审核 / 报价 / 接单 / 发货由你亲自点') }}</span>
      </p>
    </section>

    <section v-if="state?.alerts.length" class="zc-alerts" data-test="zc-alerts">
      <p v-for="(a, i) in state.alerts.slice(0, showAllAlerts ? 50 : 4)" :key="i" class="ss-note" :class="a.level === 'error' ? 'danger' : 'warn'">
        <i :class="alertIcon(a.kind)"></i>{{ a.text }}<button type="button" class="ss-link" @click="select(alertTab(a.kind))">{{ $t('去处理') }}</button>
      </p>
      <button v-if="state.alerts.length > 4" type="button" class="ss-link" @click="showAllAlerts = !showAllAlerts">{{ showAllAlerts ? $t('收起') : $t('还有 {n} 条', { n: state.alerts.length - 4 }) }}</button>
    </section>

    <nav class="zc-tabs" role="tablist">
      <button v-for="t in TABS" :key="t.key" type="button" role="tab" class="zc-tab" :class="{ active: active === t.key }" :aria-selected="active === t.key" :data-test="`zc-tab-${t.key}`" @click="select(t.key)">
        <i :class="t.icon"></i><span>{{ t.title }}</span><em v-if="badge(t.key)" class="zc-badge">{{ badge(t.key) }}</em>
      </button>
    </nav>

    <div v-if="ready" class="zc-body">
      <AccountTab v-if="active === 'account'" />
      <ListingTab v-else-if="active === 'listing'" />
      <QuoteTab v-else-if="active === 'quote'" />
      <OrdersTab v-else-if="active === 'orders'" />
      <SettingsTab v-else-if="active === 'settings'" />
      <div v-else class="zc-ov">
        <section class="ss-panel">
          <h3>{{ $t('先打开政采云，再做四件事') }}</h3>
          <div class="zc-ov__cards">
            <button v-for="c in cards" :key="c.key" type="button" class="zc-ov__card" @click="select(c.key)"><i :class="c.icon"></i><strong>{{ c.title }}</strong><span>{{ c.text }}</span></button>
          </div>
        </section>
        <section class="ss-panel">
          <h3>{{ $t('红线') }}</h3>
          <ul class="zc-list">
            <li>{{ $t('价格不交给模型算：售价是否超过自营基准、询价报价、合计，全部由规则计算；模型只按你给的参数写商品详情，写出的数字回参数核对') }}</li>
            <li>{{ $t('最后一步由人点：提交审核、提交报价、确认接单、确认发货、合同签章，数字员工一律停在按钮前截图给你；询价只有一轮报价，提交后不能改') }}</li>
            <li>{{ $t('密码不进模型：账号密码用系统钥匙串加密存在本机，只由应用填进政采云的登录框；验证码、滑块、短信、CA 证书由你完成，不做任何绕过') }}</li>
            <li>{{ $t('不抓取电商页面：比价链接和对方售价由你提供，系统只做比较') }}</li>
          </ul>
        </section>
        <section class="ss-panel">
          <h3>{{ $t('先知道这几件事') }}</h3>
          <ul class="zc-list">
            <li>{{ $t('默认按吉林省的规则（出自吉林省公共资源交易中心的上架指南）；其它省的比价口径、图片规格、接单时限、禁用词在设置里改') }}</li>
            <li>{{ $t('价格违规后果重：平台按月抽检，高于自营价会被扣诚信分、暂停交易甚至清退；在售商品超价会一直提醒') }}</li>
            <li>{{ $t('项目电子投标（投标客户端、CA 加密解密）不在范围内；标书请用「标书编写」工作台准备') }}</li>
            <li>{{ $t('政采云的用户协议对自动化工具的限制请自行确认；这个智能体按人的节奏逐步操作，不做批量抓取') }}</li>
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
 * 解决方案 · 政采云智能体。docs/zcy-agent-workbench.md
 * 页签：账号与材料 / 商品上架 / 询价报价 / 订单履约 / 方案说明 / 设置；每个模块是分步向导。
 */
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';
import type { ZcAlert } from '@totalclaw/ipc-contracts';
import { t as i18nT } from '../i18n';
import PageBackButton from '../components/PageBackButton.vue';
import AccountTab from '../workbenches/zcy-agent/AccountTab.vue';
import ListingTab from '../workbenches/zcy-agent/ListingTab.vue';
import QuoteTab from '../workbenches/zcy-agent/QuoteTab.vue';
import OrdersTab from '../workbenches/zcy-agent/OrdersTab.vue';
import SettingsTab from '../workbenches/zcy-agent/SettingsTab.vue';
import { errorMessage, onZcEvent, refreshState, zcState } from '../workbenches/zcy-agent/shared';
import '../workbenches/service-settlement/styles.css';

type TabKey = 'account' | 'listing' | 'quote' | 'orders' | 'overview' | 'settings';
const TABS: Array<{ key: TabKey; icon: string; title: string }> = [
  { key: 'account', icon: 'ri-shield-keyhole-line', title: i18nT('账号与材料') },
  { key: 'listing', icon: 'ri-store-3-line', title: i18nT('商品上架') },
  { key: 'quote', icon: 'ri-price-tag-3-line', title: i18nT('询价报价') },
  { key: 'orders', icon: 'ri-truck-line', title: i18nT('订单履约') },
  { key: 'overview', icon: 'ri-book-open-line', title: i18nT('方案说明') },
  { key: 'settings', icon: 'ri-settings-3-line', title: i18nT('设置') },
];
const cards = [
  { key: 'account' as TabKey, icon: 'ri-shield-keyhole-line', title: i18nT('账号与材料'), text: i18nT('企业信息、资质到期提醒、账号密码加密保存、登录') },
  { key: 'listing' as TabKey, icon: 'ri-store-3-line', title: i18nT('商品上架'), text: i18nT('商品表 → 标题、图片、比价链接与售价检查 → 数字员工填写，停在提交审核前') },
  { key: 'quote' as TabKey, icon: 'ri-price-tag-3-line', title: i18nT('询价报价'), text: i18nT('读回待报价的询价单 → 填成本、规则算报价 → 数字员工填写，停在提交报价前') },
  { key: 'orders' as TabKey, icon: 'ri-truck-line', title: i18nT('订单履约'), text: i18nT('读回订单 → 接单与发货时限预警 → 回填物流 → 待开票订单转入发票智能体') },
];
const TAB_KEY = 'totalclaw:zcy-agent-tab:v1';
function savedTab(): TabKey {
  try { const v = localStorage.getItem(TAB_KEY); return TABS.some((t) => t.key === v) ? (v as TabKey) : 'overview'; } catch { return 'overview'; }
}

const state = zcState;
const active = ref<TabKey>(savedTab());
const ready = ref(false);
const loading = ref(false);
const loadError = ref('');
const showAllAlerts = ref(false);
const regionName = computed(() => state.value?.settings.regions.find((r) => r.id === state.value?.settings.regionId)?.name || '');

const alertTab = (k: ZcAlert['kind']): TabKey => (k === 'qualification' ? 'account' : k === 'price' ? 'listing' : k === 'inquiry_deadline' ? 'quote' : 'orders');
const alertIcon = (k: ZcAlert['kind']): string => (k === 'qualification' ? 'ri-file-warning-line' : k === 'price' ? 'ri-price-tag-3-line' : k === 'inquiry_deadline' ? 'ri-timer-flash-line' : 'ri-truck-line');
function badge(k: TabKey): string {
  const n = (state.value?.alerts || []).filter((a) => alertTab(a.kind) === k).length;
  return n ? String(n) : '';
}
function select(k: TabKey): void {
  active.value = k;
  try { localStorage.setItem(TAB_KEY, k); } catch { /* 忽略 */ }
}
async function reload(): Promise<void> {
  loading.value = true;
  try { await refreshState(); ready.value = true; loadError.value = ''; } catch (e) { loadError.value = errorMessage(e); } finally { loading.value = false; }
}

let timer: ReturnType<typeof setTimeout> | null = null;
let off: (() => void) | null = null;
let tick: ReturnType<typeof setInterval> | null = null;
onMounted(() => {
  void reload();
  off = onZcEvent(() => {
    if (timer) return;
    timer = setTimeout(() => { timer = null; void refreshState().catch(() => {}); }, 250);
  });
  // 预警里的「还剩几小时」随时间变，每 5 分钟重算一次
  tick = setInterval(() => { void refreshState().catch(() => {}); }, 5 * 60_000);
});
onBeforeUnmount(() => { off?.(); if (timer) clearTimeout(timer); if (tick) clearInterval(tick); });
</script>

<style scoped>
.zc-workbench { display: grid; gap: 12px; padding: 18px 22px 40px; max-width: 1440px; margin: 0 auto; width: 100%; box-sizing: border-box; flex: 1; min-height: 0; overflow-y: auto; align-content: start; }
.workbench-header { display: flex; align-items: flex-start; justify-content: space-between; gap: 16px; flex-wrap: wrap; }
.heading { display: flex; gap: 14px; align-items: flex-start; }
.heading-icon { width: 48px; height: 48px; border-radius: var(--radius-6); display: inline-flex; align-items: center; justify-content: center; background: color-mix(in srgb, var(--color-brand) 14%, transparent); color: var(--color-brand); font-size: var(--font-size-2xl); flex: 0 0 auto; }
.eyebrow { margin: 0; font-size: var(--font-size-xs); font-weight: 800; letter-spacing: .08em; text-transform: uppercase; color: var(--color-text-secondary); }
h1 { margin: 2px 0 4px; font-size: 22px; }
.subtitle { margin: 0; color: var(--color-text-secondary); font-size: var(--font-size-md); line-height: 1.6; max-width: 900px; }
.header-actions { display: flex; gap: 8px; align-items: center; }
.zc-bar { display: flex; gap: 10px 16px; align-items: center; flex-wrap: wrap; padding: 8px 12px; border: 1px solid var(--color-border); border-radius: var(--radius-5); background: var(--color-bg-card); font-size: 12.5px; }
.zc-bar > span:first-child { display: inline-flex; gap: 6px; align-items: center; font-weight: 700; }
.zc-bar__rule { margin: 0 0 0 auto; display: flex; gap: 12px; flex-wrap: wrap; color: var(--color-text-secondary); }
.zc-bar__rule span { display: inline-flex; gap: 4px; align-items: center; }
.zc-bar__rule .no i { color: var(--color-danger); }
.zc-bar__rule .yes i { color: var(--color-success); }
.zc-alerts { display: grid; gap: 6px; }
.zc-alerts .ss-note { margin: 0; align-items: center; }
.zc-alerts .ss-link { margin-inline-start: auto; white-space: nowrap; }
.zc-tabs { display: flex; gap: 2px; overflow-x: auto; overflow-y: hidden; min-height: 44px; align-items: stretch; border-bottom: 1px solid var(--color-border); scrollbar-width: thin; }
.zc-tab { display: inline-flex; align-items: center; gap: 6px; padding: 8px 12px; border: none; border-bottom: 2px solid transparent; margin-bottom: -1px; background: transparent; cursor: pointer; font: inherit; font-size: var(--font-size-md); font-weight: 600; color: var(--color-text-secondary); white-space: nowrap; flex: 0 0 auto; border-radius: var(--radius-3) var(--radius-3) 0 0; }
.zc-tab i { font-size: 16px; }
.zc-tab:hover { color: var(--color-brand); background: var(--color-bg-hover); }
.zc-tab.active { color: var(--color-brand); border-bottom-color: var(--color-brand); }
.zc-badge { font-style: normal; font-size: 10.5px; font-weight: 800; min-width: 18px; height: 18px; padding: 0 5px; border-radius: var(--radius-3); background: var(--color-danger); color: var(--color-on-accent); display: inline-flex; align-items: center; justify-content: center; }
.zc-body { display: grid; gap: 14px; }
.zc-ov { display: grid; gap: 14px; max-width: 1100px; }
.ss-panel { border: 1px solid var(--color-border); border-radius: var(--radius-6); background: var(--color-bg-card); padding: 16px; display: grid; gap: 10px; }
h3 { margin: 0; font-size: var(--font-size-lg); }
.zc-ov__cards { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 10px; }
.zc-ov__card { display: grid; gap: 4px; text-align: start; padding: 12px; border-radius: var(--radius-5); background: var(--color-bg-primary); border: 1px solid var(--color-border); font: inherit; font-size: 12.5px; color: var(--color-text-primary); cursor: pointer; }
.zc-ov__card:hover { border-color: var(--color-brand); }
.zc-ov__card i { font-size: 22px; color: var(--color-brand); }
.zc-ov__card span { color: var(--color-text-secondary); line-height: 1.55; }
.zc-list { margin: 0; padding-inline-start: 18px; font-size: 12.5px; color: var(--color-text-secondary); display: grid; gap: 4px; line-height: 1.6; }
.spin { animation: zc-spin 1s linear infinite; }
@keyframes zc-spin { to { transform: rotate(360deg); } }
</style>
