<template>
  <div class="fa-workbench">
    <header class="workbench-header">
      <div class="heading">
        <PageBackButton />
        <span class="heading-icon"><i class="ri-calculator-line"></i></span>
        <div>
          <p class="eyebrow">{{ $t('行业工作台') }}</p>
          <h1>{{ $t('财务智能体') }}</h1>
          <p class="subtitle">{{ $t('财务智能体不是替代会计，是帮财务做重复、数据核对、信息提取、预审分析工作，把财务从机械单据处理释放到管理决策。') }}</p>
        </div>
      </div>
      <div class="header-actions">
        <button class="ss-btn" :disabled="loading" @click="reload"><i :class="loading ? 'ri-loader-4-line spin' : 'ri-refresh-line'"></i>{{ $t('刷新') }}</button>
      </div>
    </header>

    <!-- 账套 + 套餐 + 合规边界：一行 -->
    <section v-if="state" class="fa-bar">
      <label class="fa-bar__ledger" :title="$t('代账公司一个客户一个账套；数据、问答记忆都跟着账套走')">
        <i class="ri-building-2-line"></i>
        <span>{{ $t('账套') }}</span>
        <select :value="state.activeLedgerId" :disabled="switching" @change="switchLedger(($event.target as HTMLSelectElement).value)">
          <!-- 首个账套名是创建时按当时语言写进数据的「默认账套」：显示时按当前语言；用户起的名字原样 -->
          <option v-for="l in state.ledgers" :key="l.id" :value="l.id">{{ l.name === '默认账套' ? $t('默认账套') : l.name }}</option>
        </select>
        <em class="ss-chip">{{ ledger?.taxpayerType === 'general' ? $t('一般纳税人') : $t('小规模纳税人') }}</em>
        <button type="button" class="ss-link" @click="editLedger(ledger)">{{ $t('编辑') }}</button>
        <button type="button" class="ss-link" @click="editLedger(null)">{{ $t('新建账套') }}</button>
      </label>
      <label class="fa-bar__pkg">
        <i class="ri-gift-line"></i>
        <span>{{ $t('套餐') }}</span>
        <select :value="state.settings.package" @change="setPackage(($event.target as HTMLSelectElement).value as FaPackage)">
          <option v-for="p in PACKAGES" :key="p" :value="p">{{ packageLabel(p) }}</option>
        </select>
      </label>
      <p class="fa-bar__rule">
        <span class="no"><i class="ri-close-circle-line"></i>{{ $t('不自动提交申报、不电子签名、不改正式账套') }}</span>
        <span class="yes"><i class="ri-checkbox-circle-line"></i>{{ $t('只做解析、草稿、风险提示、辅助计算，由财务人员复核确认') }}</span>
      </p>
    </section>

    <!-- 账套编辑 -->
    <section v-if="ledgerForm" class="ss-panel fa-ledger-form">
      <header>
        <strong><i class="ri-building-2-line"></i> {{ ledgerForm.id ? $t('编辑账套') : $t('新建账套') }}</strong>
        <span class="ss-muted">{{ $t('税号用来判断票据抬头是不是本公司、是进项还是销项。') }}</span>
      </header>
      <div class="ss-grid">
        <label class="ss-field"><span>{{ $t('公司名称') }}</span><input v-model.trim="ledgerForm.name" type="text" /></label>
        <label class="ss-field"><span>{{ $t('统一社会信用代码') }}</span><input v-model.trim="ledgerForm.taxId" type="text" maxlength="20" /></label>
        <label class="ss-field"><span>{{ $t('纳税人类型') }}</span>
          <select v-model="ledgerForm.taxpayerType"><option value="small">{{ $t('小规模纳税人') }}</option><option value="general">{{ $t('一般纳税人') }}</option></select>
        </label>
        <label class="ss-field"><span>{{ $t('城建税所在地') }}</span>
          <select v-model="ledgerForm.cityTier"><option value="urban">{{ $t('市区（7%）') }}</option><option value="county">{{ $t('县城、镇（5%）') }}</option><option value="other">{{ $t('其他（1%）') }}</option></select>
        </label>
        <label class="ss-field"><span>{{ $t('行业') }}</span><input v-model.trim="ledgerForm.industry" type="text" /></label>
        <label class="ss-field ss-check"><input v-model="ledgerForm.smallLowProfit" type="checkbox" /><span>{{ $t('小型微利企业（所得税 5%、六税两费减半）') }}</span></label>
      </div>
      <label class="ss-field"><span>{{ $t('账套备注（智能体会记住，分析和问答时参考）') }}</span><textarea v-model="ledgerForm.notes" rows="3"></textarea></label>
      <div class="ss-actions">
        <button type="button" class="ss-btn primary" :disabled="!ledgerForm.name" @click="saveLedger"><i class="ri-check-line"></i>{{ $t('保存') }}</button>
        <button type="button" class="ss-btn ghost" @click="ledgerForm = null">{{ $t('取消') }}</button>
        <span class="grow"></span>
        <button v-if="ledgerForm.id && (state?.ledgers.length || 0) > 1" type="button" class="ss-btn danger sm" @click="removeLedger(ledgerForm.id)"><i class="ri-delete-bin-line"></i>{{ $t('删除账套') }}</button>
      </div>
    </section>

    <!-- 十个智能体 -->
    <nav class="fa-tabs" role="tablist">
      <button
        v-for="m in visibleModules" :key="m.key" type="button" role="tab"
        class="fa-tab" :class="{ active: active === m.key }" :aria-selected="active === m.key" :title="m.desc"
        @click="select(m.key)"
      >
        <i :class="m.icon"></i>
        <span>{{ m.title }}</span>
        <em v-if="badge(m.key)" class="fa-badge">{{ badge(m.key) }}</em>
      </button>
      <span class="fa-tabs__grow"></span>
      <button type="button" role="tab" class="fa-tab" :class="{ active: active === 'overview' }" @click="select('overview')">
        <i class="ri-book-open-line"></i><span>{{ $t('方案说明') }}</span>
      </button>
      <button type="button" role="tab" class="fa-tab" :class="{ active: active === 'settings' }" @click="select('settings')">
        <i class="ri-settings-3-line"></i><span>{{ $t('设置') }}</span>
      </button>
    </nav>

    <p v-if="progressText" class="ss-note info fa-progress"><i class="ri-loader-4-line spin"></i>{{ progressText }}</p>

    <div v-if="ready" class="fa-body">
      <OverviewTab v-if="active === 'overview'" @goto="goto" />
      <SettingsTab v-else-if="active === 'settings'" />
      <component :is="tabComponent" v-else :key="`${active}-${state?.activeLedgerId}`" :meta="activeMeta" :focus="focus[active] || null" @goto="goto" />
    </div>
    <p v-else-if="loadError" class="ss-note danger"><i class="ri-error-warning-line"></i>{{ loadError }}</p>
    <p v-else class="ss-note"><i class="ri-loader-4-line spin"></i>{{ $t('正在加载工作台…') }}</p>
  </div>
</template>

<script setup lang="ts">
/**
 * 解决方案 · 财务智能体工作台。
 *
 * tab 按方案目录组织：十个核心财务智能体各一个 tab（凭证 / 税务申报 / 费用报销 / 往来对账 / 财务报表 /
 * 风险巡检 / 预算管控 / 成本核算 / 合同审核 / 财税问答），右侧「方案说明」收配套能力、业务定位、
 * 合规区分与打包套餐，「设置」收模型、规则与数据对接。套餐决定显示哪些智能体。
 * 每个智能体自己是分步向导（每步独立状态 + 粘性进度条，见 docs/solution-workbench-ux-guidelines.md）。
 */
import { computed, onBeforeUnmount, onMounted, reactive, ref, type Component } from 'vue';
import type { FaLedger, FaLedgerInput, FaModuleKey, FaPackage } from '@totalclaw/ipc-contracts';
import { t as i18nT } from '../i18n';
import { useNotificationStore } from '../stores/notification';
import PageBackButton from '../components/PageBackButton.vue';
import OverviewTab from '../workbenches/finance-agent/OverviewTab.vue';
import SettingsTab from '../workbenches/finance-agent/SettingsTab.vue';
import VoucherTab from '../workbenches/finance-agent/VoucherTab.vue';
import TaxTab from '../workbenches/finance-agent/TaxTab.vue';
import FilingTab from '../workbenches/finance-agent/FilingTab.vue';
import ExpenseTab from '../workbenches/finance-agent/ExpenseTab.vue';
import ReconcileTab from '../workbenches/finance-agent/ReconcileTab.vue';
import StatementsTab from '../workbenches/finance-agent/StatementsTab.vue';
import RiskTab from '../workbenches/finance-agent/RiskTab.vue';
import BudgetTab from '../workbenches/finance-agent/BudgetTab.vue';
import CostTab from '../workbenches/finance-agent/CostTab.vue';
import ContractTab from '../workbenches/finance-agent/ContractTab.vue';
import QaTab from '../workbenches/finance-agent/QaTab.vue';
import {
  errorMessage, fa, faProgress, faState, loadModels, moduleMetas, onFaEvent, packageLabel, packageModules, refreshState,
} from '../workbenches/finance-agent/shared';
import '../workbenches/service-settlement/styles.css';
import '../workbenches/foreign-trade/styles.css';

const notif = useNotificationStore();
const modules = moduleMetas();
const PACKAGES: FaPackage[] = ['all', 'micro', 'agency', 'manufacturing'];
const COMPONENTS: Record<FaModuleKey, Component> = {
  voucher: VoucherTab, tax: TaxTab, filing: FilingTab, expense: ExpenseTab, reconcile: ReconcileTab, statements: StatementsTab,
  risk: RiskTab, budget: BudgetTab, cost: CostTab, contract: ContractTab, qa: QaTab,
};
const TAB_KEY = 'totalclaw:finance-agent-tab:v1';
type TabKey = FaModuleKey | 'overview' | 'settings';
function savedTab(): TabKey {
  try {
    const v = localStorage.getItem(TAB_KEY);
    return v === 'settings' || v === 'overview' || modules.some((m) => m.key === v) ? (v as TabKey) : 'voucher';
  } catch { return 'voucher'; }
}

const state = faState;
const active = ref<TabKey>(savedTab());
const focus = reactive<Record<string, any>>({});
const ready = ref(false);
const loading = ref(false);
const switching = ref(false);
const loadError = ref('');
const ledgerForm = ref<(FaLedgerInput & { taxpayerType: 'general' | 'small'; cityTier: 'urban' | 'county' | 'other'; smallLowProfit: boolean }) | null>(null);

const ledger = computed(() => state.value?.ledgers.find((l) => l.id === state.value?.activeLedgerId) || null);
const visibleModules = computed(() => {
  const keys = packageModules(state.value?.settings.package || 'all');
  return modules.filter((m) => keys.includes(m.key));
});
const activeMeta = computed(() => modules.find((m) => m.key === active.value) || modules[0]);
const tabComponent = computed(() => (active.value === 'settings' || active.value === 'overview' ? null : COMPONENTS[active.value]));
const progressText = computed(() => faProgress[active.value] || '');

function badge(key: FaModuleKey): string {
  const d = state.value?.data;
  if (!d) return '';
  const n = key === 'voucher' ? d.docs.filter((x) => !x.claimId && x.status === 'flagged').length
    : key === 'filing' ? d.filings.reduce((n, f) => n + f.items.filter((i) => i.status === 'pending' || i.status === 'handed').length, 0)
    : key === 'expense' ? d.claims.filter((c) => !c.decision && c.items.length).length
      : key === 'risk' ? (d.risks[0]?.findings.filter((f) => f.level === 'high').length || 0)
        : key === 'budget' ? (d.budgetAnalyses[0]?.rows.filter((r) => r.level === 'over').length || 0)
          : 0;
  return n ? String(n) : '';
}

function select(key: TabKey): void {
  active.value = key;
  try { localStorage.setItem(TAB_KEY, key); } catch { /* 忽略 */ }
}
function goto(key: string, payload?: any): void {
  if (key !== 'overview' && key !== 'settings' && !modules.some((m) => m.key === key)) return;
  focus[key] = { ...(payload || {}), at: Date.now() };
  select(key as TabKey);
}

async function switchLedger(id: string): Promise<void> {
  switching.value = true;
  try { await fa('ledger.switch', { id }); await refreshState(); } catch (e) { notif.error(errorMessage(e)); } finally { switching.value = false; }
}
function editLedger(l: FaLedger | null): void {
  ledgerForm.value = l
    ? { id: l.id, name: l.name, taxId: l.taxId, taxpayerType: l.taxpayerType, cityTier: l.cityTier, industry: l.industry, smallLowProfit: l.smallLowProfit, notes: l.notes }
    : { name: '', taxId: '', taxpayerType: 'small', cityTier: 'urban', industry: '', smallLowProfit: true, notes: '' };
}
async function saveLedger(): Promise<void> {
  if (!ledgerForm.value) return;
  try {
    await fa('ledger.save', { input: ledgerForm.value });
    ledgerForm.value = null;
    await refreshState();
  } catch (e) { notif.error(errorMessage(e)); }
}
async function removeLedger(id: string): Promise<void> {
  const l = state.value?.ledgers.find((x) => x.id === id);
  if (!l || !window.confirm(i18nT('删除账套「{p0}」及其全部票据、凭证和分析记录？此操作不可恢复。', { p0: l.name }))) return;
  try { await fa('ledger.remove', { id }); ledgerForm.value = null; await refreshState(); } catch (e) { notif.error(errorMessage(e)); }
}
async function setPackage(p: FaPackage): Promise<void> {
  try {
    await fa('settings.patch', { patch: { package: p } });
    await refreshState();
    const keys = packageModules(p);
    if (active.value !== 'overview' && active.value !== 'settings' && !keys.includes(active.value)) select(keys[0]);
  } catch (e) { notif.error(errorMessage(e)); }
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
  refreshTimer = setTimeout(() => { refreshTimer = null; void refreshState().catch(() => {}); }, 300);
}
const clearProgress: Record<string, ReturnType<typeof setTimeout>> = {};
let off: (() => void) | null = null;
onMounted(() => {
  void reload();
  off = onFaEvent((ev) => {
    if (ev.type === 'progress' && ev.payload?.key) {
      const key = String(ev.payload.key);
      faProgress[key] = String(ev.payload.message || '');
      clearTimeout(clearProgress[key]);
      if (faProgress[key]) clearProgress[key] = setTimeout(() => { faProgress[key] = ''; }, 20_000);
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
.fa-workbench { display: grid; gap: 12px; padding: 18px 22px 40px; max-width: 1440px; margin: 0 auto; width: 100%; box-sizing: border-box; flex: 1; min-height: 0; overflow-y: auto; align-content: start; }
.workbench-header { display: flex; align-items: flex-start; justify-content: space-between; gap: 16px; flex-wrap: wrap; }
.heading { display: flex; gap: 14px; align-items: flex-start; }
.heading-icon { width: 48px; height: 48px; border-radius: var(--radius-6); display: inline-flex; align-items: center; justify-content: center; background: color-mix(in srgb, var(--color-brand) 14%, transparent); color: var(--color-brand); font-size: var(--font-size-2xl); flex: 0 0 auto; }
.eyebrow { margin: 0; font-size: var(--font-size-xs); font-weight: 800; letter-spacing: .08em; text-transform: uppercase; color: var(--color-text-secondary); }
h1 { margin: 2px 0 4px; font-size: 22px; }
.subtitle { margin: 0; color: var(--color-text-secondary); font-size: var(--font-size-md); line-height: 1.6; max-width: 900px; }
.header-actions { display: flex; gap: 8px; align-items: center; }

.fa-bar { display: flex; gap: 10px 18px; align-items: center; flex-wrap: wrap; padding: 8px 12px; border: 1px solid var(--color-border); border-radius: var(--radius-5); background: var(--color-bg-card); font-size: 12.5px; }
.fa-bar label { display: flex; gap: 6px; align-items: center; }
.fa-bar label > i { color: var(--color-brand); font-size: 16px; }
.fa-bar select { height: 30px; border-radius: var(--radius-3); border: 1px solid var(--color-border); background: var(--color-bg-input); color: var(--color-text-primary); font: inherit; padding: 0 6px; max-width: 260px; }
.fa-bar__ledger select { border-color: var(--color-brand); font-weight: 600; }
.fa-bar__rule { margin: 0 0 0 auto; display: flex; gap: 12px; flex-wrap: wrap; color: var(--color-text-secondary); }
.fa-bar__rule span { display: inline-flex; gap: 4px; align-items: center; }
.fa-bar__rule .no i { color: var(--color-danger); }
.fa-bar__rule .yes i { color: var(--color-success); }
.fa-ledger-form textarea { width: 100%; box-sizing: border-box; }
.ss-panel > header strong { display: flex; gap: 6px; align-items: center; }
.ss-check { flex-direction: row !important; align-items: center; gap: 6px; }
.grow { flex: 1; }

/* 横向可滚动的 tab 条是滚动容器，min-height 默认会算成 0：外层网格高度固定、内容溢出时这一行被压扁成一条线 */
.fa-tabs { display: flex; gap: 2px; overflow-x: auto; overflow-y: hidden; min-height: 44px; align-items: stretch; border-bottom: 1px solid var(--color-border); scrollbar-width: thin; }
.fa-tab { display: inline-flex; align-items: center; gap: 6px; padding: 8px 12px; border: none; border-bottom: 2px solid transparent; margin-bottom: -1px; background: transparent; cursor: pointer; font: inherit; font-size: var(--font-size-md); font-weight: 600; color: var(--color-text-secondary); white-space: nowrap; flex: 0 0 auto; border-radius: var(--radius-3) var(--radius-3) 0 0; transition: color .15s, border-color .15s, background-color .15s; }
.fa-tab i { font-size: 16px; }
.fa-tab:hover { color: var(--color-brand); background: var(--color-bg-hover); }
.fa-tab.active { color: var(--color-brand); border-bottom-color: var(--color-brand); }
.fa-tabs__grow { flex: 1 1 auto; }
.fa-badge { font-style: normal; font-size: 10.5px; font-weight: 800; min-width: 18px; height: 18px; padding: 0 5px; border-radius: var(--radius-3); background: var(--color-danger); color: var(--color-on-accent); display: inline-flex; align-items: center; justify-content: center; }
.fa-progress { position: sticky; top: 0; z-index: 5; }
.fa-body { display: grid; gap: 14px; }
.spin { animation: fa-spin 1s linear infinite; }
@keyframes fa-spin { to { transform: rotate(360deg); } }
</style>
