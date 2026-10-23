<template>
  <div class="iv-workbench">
    <header class="workbench-header">
      <div class="heading">
        <PageBackButton />
        <span class="heading-icon"><i class="ri-bill-line"></i></span>
        <div>
          <p class="eyebrow">{{ $t('行业工作台') }}</p>
          <h1>{{ $t('发票智能体') }}</h1>
          <p class="subtitle">{{ $t('拿着付款单或一张开票申请表（很多行、很多家购买方），自动识别、校验、组票拆票算税，在系统浏览器里走到电子税务局的批量开票页并放入导入文件，或经开票服务商接口开具。金额由规则计算，「批量开具」由你亲自点。') }}</p>
        </div>
      </div>
      <div class="header-actions">
        <button class="ss-btn" :disabled="loading" @click="reload"><i :class="loading ? 'ri-loader-4-line spin' : 'ri-refresh-line'"></i>{{ $t('刷新') }}</button>
      </div>
    </header>

    <section v-if="state" class="iv-bar">
      <span><i class="ri-building-2-line"></i>{{ state.settings.seller.name || $t('未设置销售方') }}</span>
      <span class="ss-muted">{{ $t('批次 {a} · 待开具 {b} · 已开具 {c} · 客户 {d}', { a: state.batches.length, b: pending, c: issued, d: state.customers.length }) }}</span>
      <p class="iv-bar__rule">
        <span class="no"><i class="ri-close-circle-line"></i>{{ $t('模型不算钱、不代过扫脸与验证码、不擅自开具') }}</span>
        <span class="yes"><i class="ri-checkbox-circle-line"></i>{{ $t('每张发票可追到来源行，开具由你亲自点') }}</span>
      </p>
    </section>

    <nav class="iv-tabs" role="tablist">
      <button v-for="t in TABS" :key="t.key" type="button" role="tab" class="iv-tab" :class="{ active: active === t.key }" :aria-selected="active === t.key" :data-test="`iv-tab-${t.key}`" @click="select(t.key)">
        <i :class="t.icon"></i><span>{{ t.title }}</span><em v-if="t.key === 'ledger' && pending" class="iv-badge">{{ pending }}</em>
      </button>
    </nav>

    <div v-if="ready" class="iv-body">
      <IssueTab v-show="active === 'issue'" />
      <LedgerTab v-if="active === 'ledger'" />
      <ArchiveTab v-else-if="active === 'archive'" />
      <SettingsTab v-else-if="active === 'settings'" />
      <div v-else-if="active === 'overview'" class="iv-ov">
        <section class="ss-panel">
          <h3>{{ $t('它替财务做什么') }}</h3>
          <ul class="iv-list">
            <li>{{ $t('识别表格：付款单、开票申请表的列名五花八门，自动认出购买方、税号、项目、金额等列，认不准的让你点选') }}</li>
            <li>{{ $t('逐行校验：税号位数与校验位、同名不同税号、与客户档案不一致、数量 × 单价 ≠ 金额、税率不合法、疑似重复开票') }}</li>
            <li>{{ $t('组票拆票：按购买方 / 订单号 / 逐行合并，超过单张限额或行数上限自动拆，价税分离按分做整数运算，合计一分不差') }}</li>
            <li>{{ $t('开具：系统浏览器打开电子税务局，应用走到「批量开票」页并放入导入文件，你核对后点「批量开具」；或经诺诺接口提交') }}</li>
            <li>{{ $t('台账：从「批量开票记录」按发票流水号读回号码，附发票文件，登记红冲，导出台账') }}</li>
          </ul>
        </section>
        <section class="ss-panel">
          <h3>{{ $t('三条红线') }}</h3>
          <ul class="iv-list">
            <li>{{ $t('钱不交给模型算：金额、税额、拆票全部由规则计算；模型只读付款回单上的文字、给税收编码建议，读出来的名称和金额逐条回原文核对，编码要你确认') }}</li>
            <li>{{ $t('开具有人工闸门：应用不会点「批量开具」「发票开具」；登录、扫脸（实人认证）、短信验证码只能由你本人完成，不做任何绕过') }}</li>
            <li>{{ $t('每张票可回溯：发票 → 明细行 → 来源文件的第几行，重复开票会被提示') }}</li>
          </ul>
        </section>
        <section class="ss-panel">
          <h3>{{ $t('先知道这几件事') }}</h3>
          <ul class="iv-list">
            <li>{{ $t('数电发票必须在电子税务局开具，开票前要实人认证；认证多久一次由税务机关按企业风险设定') }}</li>
            <li>{{ $t('发票额度按自然月的不含税总额管理，额度不够要先在电子税务局申请调额') }}</li>
            <li>{{ $t('应用自带电子税务局官方《批量导入开具发票模板》（V260401 版）；页面提示模板更新时，下载新模板放到设置里即可') }}</li>
            <li>{{ $t('建筑服务、不动产租赁、货物运输等特定业务，以及差额开具、减按开具，这一版不处理，请在电子税务局手工开') }}</li>
            <li>{{ $t('电子税务局不接受应用的内置浏览器，所以用系统的 Chrome / Edge；进「蓝字发票开具」和「批量开票」前各要扫一次脸') }}</li>
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
 * 解决方案 · 发票智能体。docs/invoice-agent-workbench.md
 * 页签：开票（分步向导）/ 发票台账 / 客户与商品 / 方案说明 / 设置。
 */
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';
import { t as i18nT } from '../i18n';
import PageBackButton from '../components/PageBackButton.vue';
import IssueTab from '../workbenches/invoice-agent/IssueTab.vue';
import LedgerTab from '../workbenches/invoice-agent/LedgerTab.vue';
import ArchiveTab from '../workbenches/invoice-agent/ArchiveTab.vue';
import SettingsTab from '../workbenches/invoice-agent/SettingsTab.vue';
import { errorMessage, ivState, onIvEvent, refreshState } from '../workbenches/invoice-agent/shared';
import '../workbenches/service-settlement/styles.css';

type TabKey = 'issue' | 'ledger' | 'archive' | 'overview' | 'settings';
const TABS: Array<{ key: TabKey; icon: string; title: string }> = [
  { key: 'issue', icon: 'ri-bill-line', title: i18nT('开票') },
  { key: 'ledger', icon: 'ri-book-2-line', title: i18nT('发票台账') },
  { key: 'archive', icon: 'ri-contacts-book-2-line', title: i18nT('客户与商品') },
  { key: 'overview', icon: 'ri-book-open-line', title: i18nT('方案说明') },
  { key: 'settings', icon: 'ri-settings-3-line', title: i18nT('设置') },
];
const TAB_KEY = 'totalclaw:invoice-agent-tab:v1';
function savedTab(): TabKey {
  try { const v = localStorage.getItem(TAB_KEY); return TABS.some((t) => t.key === v) ? (v as TabKey) : 'issue'; } catch { return 'issue'; }
}

const state = ivState;
const active = ref<TabKey>(savedTab());
const ready = ref(false);
const loading = ref(false);
const loadError = ref('');
const pending = computed(() => (state.value?.drafts || []).filter((d) => d.status === 'confirmed' || d.status === 'handed' || d.status === 'failed').length);
const issued = computed(() => (state.value?.drafts || []).filter((d) => d.status === 'issued').length);

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
onMounted(() => {
  void reload();
  off = onIvEvent(() => {
    if (timer) return;
    timer = setTimeout(() => { timer = null; void refreshState().catch(() => {}); }, 250);
  });
});
onBeforeUnmount(() => { off?.(); if (timer) clearTimeout(timer); });
</script>

<style scoped>
.iv-workbench { display: grid; gap: 12px; padding: 18px 22px 40px; max-width: 1440px; margin: 0 auto; width: 100%; box-sizing: border-box; flex: 1; min-height: 0; overflow-y: auto; align-content: start; }
.workbench-header { display: flex; align-items: flex-start; justify-content: space-between; gap: 16px; flex-wrap: wrap; }
.heading { display: flex; gap: 14px; align-items: flex-start; }
.heading-icon { width: 48px; height: 48px; border-radius: var(--radius-6); display: inline-flex; align-items: center; justify-content: center; background: color-mix(in srgb, var(--color-brand) 14%, transparent); color: var(--color-brand); font-size: var(--font-size-2xl); flex: 0 0 auto; }
.eyebrow { margin: 0; font-size: var(--font-size-xs); font-weight: 800; letter-spacing: .08em; text-transform: uppercase; color: var(--color-text-secondary); }
h1 { margin: 2px 0 4px; font-size: 22px; }
.subtitle { margin: 0; color: var(--color-text-secondary); font-size: var(--font-size-md); line-height: 1.6; max-width: 900px; }
.header-actions { display: flex; gap: 8px; align-items: center; }
.iv-bar { display: flex; gap: 10px 16px; align-items: center; flex-wrap: wrap; padding: 8px 12px; border: 1px solid var(--color-border); border-radius: var(--radius-5); background: var(--color-bg-card); font-size: 12.5px; }
.iv-bar > span:first-child { display: inline-flex; gap: 6px; align-items: center; font-weight: 700; }
.iv-bar__rule { margin: 0 0 0 auto; display: flex; gap: 12px; flex-wrap: wrap; color: var(--color-text-secondary); }
.iv-bar__rule span { display: inline-flex; gap: 4px; align-items: center; }
.iv-bar__rule .no i { color: var(--color-danger); }
.iv-bar__rule .yes i { color: var(--color-success); }
.iv-tabs { display: flex; gap: 2px; overflow-x: auto; overflow-y: hidden; min-height: 44px; align-items: stretch; border-bottom: 1px solid var(--color-border); scrollbar-width: thin; }
.iv-tab { display: inline-flex; align-items: center; gap: 6px; padding: 8px 12px; border: none; border-bottom: 2px solid transparent; margin-bottom: -1px; background: transparent; cursor: pointer; font: inherit; font-size: var(--font-size-md); font-weight: 600; color: var(--color-text-secondary); white-space: nowrap; flex: 0 0 auto; border-radius: var(--radius-3) var(--radius-3) 0 0; }
.iv-tab i { font-size: 16px; }
.iv-tab:hover { color: var(--color-brand); background: var(--color-bg-hover); }
.iv-tab.active { color: var(--color-brand); border-bottom-color: var(--color-brand); }
.iv-badge { font-style: normal; font-size: 10.5px; font-weight: 800; min-width: 18px; height: 18px; padding: 0 5px; border-radius: var(--radius-3); background: var(--color-danger); color: var(--color-on-accent); display: inline-flex; align-items: center; justify-content: center; }
.iv-body { display: grid; gap: 14px; }
.iv-ov { display: grid; gap: 14px; max-width: 1100px; }
.ss-panel { border: 1px solid var(--color-border); border-radius: var(--radius-6); background: var(--color-bg-card); padding: 16px; display: grid; gap: 10px; }
h3 { margin: 0; font-size: var(--font-size-lg); }
.iv-list { margin: 0; padding-inline-start: 18px; font-size: 12.5px; color: var(--color-text-secondary); display: grid; gap: 4px; line-height: 1.6; }
.spin { animation: iv-spin 1s linear infinite; }
@keyframes iv-spin { to { transform: rotate(360deg); } }
</style>
