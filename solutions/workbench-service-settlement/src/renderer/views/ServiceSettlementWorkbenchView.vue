<template>
  <div class="ss-workbench">
    <header class="workbench-header">
      <div class="heading">
        <PageBackButton />
        <span class="heading-icon"><i class="ri-hand-coin-line"></i></span>
        <div>
          <p class="eyebrow">{{ $t('行业工作台') }}</p>
          <h1>{{ $t('服务商结算与激励核算') }}</h1>
          <p class="subtitle">{{ $t('服务电商好评激励核算 · 服务费用结案汇总与付款跟踪 · 报废台账更新 · 服务营销激励季度结案。只需放进导出的 Excel，每一步系统都替你算、替你发、替你盯。') }}</p>
        </div>
      </div>
      <div class="header-actions">
        <button class="ss-btn" :disabled="loading" @click="refresh"><i :class="loading ? 'ri-loader-4-line spin' : 'ri-refresh-line'"></i>{{ $t('刷新') }}</button>
      </div>
    </header>

    <!-- 全局设置条：输出目录 / 邮箱状态 / 通讯录 / 提醒 -->
    <section class="ss-toolbar">
      <div class="ss-toolbar__item">
        <i class="ri-folder-3-line"></i>
        <div>
          <small>{{ $t('结果文件存到') }}</small>
          <strong :title="outputDir">{{ outputDir || $t('默认目录') }}</strong>
        </div>
        <button type="button" class="ss-btn sm ghost" @click="pickOutputDir"><i class="ri-folder-settings-line"></i>{{ $t('更改') }}</button>
        <button type="button" class="ss-btn sm ghost" :disabled="!outputDir" @click="openPath(outputDir)"><i class="ri-external-link-line"></i>{{ $t('打开') }}</button>
      </div>
      <div class="ss-toolbar__item">
        <i :class="email.smtpConfigured ? 'ri-mail-check-line ok' : 'ri-mail-settings-line warn'"></i>
        <div>
          <small>{{ $t('邮箱（发信 / 收信）') }}</small>
          <strong>
            <span class="ss-chip" :class="email.smtpConfigured ? 'ok' : email.officialRelay ? 'warn' : 'bad'">{{ email.smtpConfigured ? $t('发信已配') : email.officialRelay ? $t('官方代发') : $t('发信未配') }}</span>
            <span class="ss-chip" :class="email.imapConfigured ? 'ok' : 'bad'">{{ email.imapConfigured ? $t('收信已配') : $t('收信未配') }}</span>
          </strong>
        </div>
        <button type="button" class="ss-btn sm ghost" @click="goEmailSettings"><i class="ri-settings-3-line"></i>{{ $t('去设置') }}</button>
      </div>
      <div class="ss-toolbar__item">
        <i class="ri-contacts-book-2-line"></i>
        <div>
          <small>{{ $t('服务商通讯录') }}</small>
          <strong>{{ $t('{n} 家，{m} 家有邮箱', { n: directory.length, m: directory.filter((c) => c.email).length }) }}</strong>
        </div>
        <button type="button" class="ss-btn sm ghost" @click="showDirectory = !showDirectory"><i class="ri-edit-line"></i>{{ showDirectory ? $t('收起') : $t('维护') }}</button>
      </div>
      <div class="ss-toolbar__item">
        <i class="ri-notification-3-line" :class="{ warn: unreadReminders.length }"></i>
        <div>
          <small>{{ $t('提醒中心') }}</small>
          <strong>{{ unreadReminders.length ? $t('{n} 条未读', { n: unreadReminders.length }) : $t('没有未读提醒') }}</strong>
        </div>
        <button type="button" class="ss-btn sm ghost" @click="showReminders = !showReminders"><i class="ri-list-check"></i>{{ showReminders ? $t('收起') : $t('查看') }}</button>
      </div>
    </section>

    <!-- 通讯录维护 -->
    <section v-if="showDirectory" class="ss-panel">
      <header><strong>{{ $t('服务商通讯录') }}</strong><span class="ss-muted">{{ $t('邮箱用于下发结算明细与各类通知；企微用于识别回传消息来自哪家服务商。填一次长期有效。') }}</span>
        <span class="grow"></span>
        <button type="button" class="ss-btn sm" @click="importDirectory"><i class="ri-file-upload-line"></i>{{ $t('从 Excel 导入') }}</button>
        <button type="button" class="ss-btn sm primary" :disabled="!dirDirty" @click="saveDirectory"><i class="ri-save-line"></i>{{ $t('保存') }}</button>
      </header>
      <div class="ss-table-wrap" style="max-height: 320px; overflow: auto;">
        <table class="ss-table">
          <thead><tr><th>{{ $t('服务商') }}</th><th>{{ $t('别名（同一家的其它写法，逗号分隔）') }}</th><th>{{ $t('邮箱') }}</th><th>{{ $t('企微 / 微信') }}</th><th>{{ $t('区域经理') }}</th><th>{{ $t('负责人') }}</th><th>{{ $t('手机') }}</th></tr></thead>
          <tbody>
            <tr v-for="c in dirDraft" :key="c.provider">
              <td>{{ c.provider }}</td>
              <!-- 别名：明细里改过名 / 写法不同的同一家并入本主体核算（客户对账实报：宁波鄞州亿天 + 新河亿天 按一家付款） -->
              <td><input :value="(c.aliases || []).join('、')" type="text" @input="c.aliases = ($event.target as HTMLInputElement).value.split(/[,，、;；|]+/).map((s: string) => s.trim()).filter(Boolean); dirDirty = true" /></td>
              <td><input v-model="c.email" type="text" :placeholder="$t('多个邮箱用逗号隔开')" @input="dirDirty = true" /></td>
              <td><input v-model="c.wecom" type="text" @input="dirDirty = true" /></td>
              <td><input v-model="c.manager" type="text" @input="dirDirty = true" /></td>
              <td><input v-model="c.leaderName" type="text" @input="dirDirty = true" /></td>
              <td><input v-model="c.phone" type="text" @input="dirDirty = true" /></td>
            </tr>
            <tr><td><input v-model="newProvider" type="text" :placeholder="$t('新增服务商名称')" @keydown.enter="addProvider" /></td><td colspan="6"><button type="button" class="ss-btn sm ghost" :disabled="!newProvider.trim()" @click="addProvider"><i class="ri-add-line"></i>{{ $t('添加') }}</button></td></tr>
          </tbody>
        </table>
      </div>
    </section>

    <!-- 提醒中心 -->
    <section v-if="showReminders" class="ss-panel">
      <header><strong>{{ $t('提醒中心') }}</strong><span class="grow"></span><button type="button" class="ss-btn sm ghost" @click="ackAll"><i class="ri-check-double-line"></i>{{ $t('全部已读') }}</button><button type="button" class="ss-btn sm ghost" @click="tickNow"><i class="ri-play-line"></i>{{ $t('立即检查一次') }}</button></header>
      <ul class="ss-reminders">
        <li v-for="r in reminders" :key="r.id" :class="{ unread: !r.read }">
          <i :class="reminderIcon(r.type)"></i>
          <div><strong>{{ r.title }}</strong><p>{{ r.body }}</p><small>{{ fmtDateTime(r.firedAt) }}<template v-if="r.outlets?.length"> · {{ $t('已推送：{o}', { o: r.outlets.join('、') }) }}</template></small></div>
        </li>
        <li v-if="!reminders.length" class="ss-muted">{{ $t('还没有提醒。每月付款日、发票 3 天未核销、20 天未开票、退回到期前 10 天都会在这里出现。') }}</li>
      </ul>
    </section>

    <!-- 模块 tab -->
    <nav class="ss-tabs" role="tablist">
      <button v-for="m in MODULES" :key="m.key" type="button" role="tab" class="ss-tab" :class="{ active: activeModule === m.key }" :aria-selected="activeModule === m.key" @click="activeModule = m.key">
        <i :class="m.icon"></i>
        <span><strong>{{ m.title }}</strong><small>{{ m.desc }}</small></span>
      </button>
    </nav>

    <div v-if="ready" class="ss-body">
      <ReviewIncentiveModule v-show="activeModule === 'review'" :state="state" @refresh="refresh" />
      <SettlementModule v-show="activeModule === 'settlement'" :state="state" :email="email" :tracking-flags="trackingFlags" :dir="dirs.settlement || outputDir" @refresh="refresh" />
      <ScrapLedgerModule v-show="activeModule === 'scrap'" :state="state" @refresh="refresh" />
      <MarketingIncentiveModule v-show="activeModule === 'marketing'" :state="state" @refresh="refresh" />
    </div>
    <p v-else-if="loadError" class="ss-note danger"><i class="ri-error-warning-line"></i>{{ loadError }}</p>
    <p v-else class="ss-note"><i class="ri-loader-4-line spin"></i>{{ $t('正在加载工作台…') }}</p>
  </div>
</template>

<script setup lang="ts">
/**
 * 解决方案 · 服务商结算与激励核算工作台（需求《智能体 8.21》）。
 *
 * 四个模块各自是一个分步向导（每步独立状态 + 顶部粘性进度条，见 docs/solution-workbench-ux-guidelines.md）。
 * 模块用 v-show 而不是 v-if：用户在四个模块之间来回切，已经放进去的文件与算好的结果不能丢。
 * 所有主进程监听的退订函数都接住并在 unmount 时调用（routeViewListenerLeak 护栏）。
 */
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useNotificationStore } from '../stores/notification';
import { t as i18nT } from '../i18n';
import PageBackButton from '../components/PageBackButton.vue';
import ReviewIncentiveModule from '../workbenches/service-settlement/ReviewIncentiveModule.vue';
import SettlementModule from '../workbenches/service-settlement/SettlementModule.vue';
import ScrapLedgerModule from '../workbenches/service-settlement/ScrapLedgerModule.vue';
import MarketingIncentiveModule from '../workbenches/service-settlement/MarketingIncentiveModule.vue';
import { api, openPath, errorMessage, fmtDateTime, pickFiles } from '../workbenches/service-settlement/shared';
import '../workbenches/service-settlement/styles.css';

const router = useRouter();
const notif = useNotificationStore();

const MODULES = [
  { key: 'review', icon: 'ri-star-smile-line', title: i18nT('服务电商好评激励'), desc: i18nT('京东安装 + 京东售后 + 天猫好评 · 4 步') },
  { key: 'settlement', icon: 'ri-file-list-3-line', title: i18nT('结案汇总、下发及付款跟踪'), desc: i18nT('汇总 → 拆分 → 邮件下发 → 发票 → 付款 · 5 步') },
  { key: 'scrap', icon: 'ri-delete-bin-6-line', title: i18nT('更新报废台账'), desc: i18nT('鉴定表 + 报废条码 → 对照表 → 台账 → 渠道品类汇总 · 4 步') },
  { key: 'marketing', icon: 'ri-line-chart-line', title: i18nT('服务营销激励结案'), desc: i18nT('有赞订单 → 达成率 → 激励 → 通知 → 个税 → 报告 · 11 步') },
] as const;
type ModuleKey = typeof MODULES[number]['key'];
const TAB_KEY = 'totalclaw:service-settlement-tab:v1';
function readSavedTab(): ModuleKey {
  try {
    const v = localStorage.getItem(TAB_KEY);
    return MODULES.some((m) => m.key === v) ? (v as ModuleKey) : 'review';
  } catch { return 'review'; }
}
const activeModule = ref<ModuleKey>(readSavedTab());
watch(activeModule, (v) => { try { localStorage.setItem(TAB_KEY, v); } catch { /* ignore */ } });

const state = ref<any>(null);
const email = ref<any>({});
const trackingFlags = ref<Record<string, any>>({});
const dirs = ref<Record<string, string>>({});
const outputDir = ref('');
const ready = ref(false);
const loading = ref(false);
const loadError = ref('');

async function refresh(): Promise<void> {
  loading.value = true;
  try {
    const a = api();
    if (!a?.stateGet) throw new Error(i18nT('工作台接口未就绪（请重启应用）'));
    const r = await a.stateGet();
    state.value = r.state;
    email.value = r.email || {};
    trackingFlags.value = r.trackingFlags || {};
    dirs.value = r.dirs || {};
    outputDir.value = r.outputDir || '';
    if (!dirDirty.value) dirDraft.value = (r.state.providerDirectory || []).map((c: any) => ({ ...c }));
    ready.value = true;
    loadError.value = '';
  } catch (e) {
    loadError.value = errorMessage(e);
  } finally {
    loading.value = false;
  }
}

async function pickOutputDir(): Promise<void> {
  try {
    const r = await api().pickFolder({ title: i18nT('选择结果文件的保存目录'), setAsOutput: true });
    if (r?.path) { outputDir.value = r.path; notif.success(i18nT('结果文件将保存到：{p}', { p: r.path })); await refresh(); }
  } catch (e) { notif.error(errorMessage(e)); }
}
function goEmailSettings(): void { router.push({ path: '/settings', query: { section: 'notify', focus: 'smtp' } }); }

// ── 通讯录 ──
const directory = computed<any[]>(() => state.value?.providerDirectory || []);
const showDirectory = ref(false);
const dirDraft = ref<any[]>([]);
const dirDirty = ref(false);
const newProvider = ref('');
function addProvider(): void {
  const name = newProvider.value.trim();
  if (!name || dirDraft.value.some((c) => c.provider === name)) return;
  dirDraft.value.push({ provider: name, email: '', wecom: '', manager: '', leaderName: '', phone: '' });
  newProvider.value = '';
  dirDirty.value = true;
}
async function saveDirectory(): Promise<void> {
  try {
    await api().contactsUpsert({ contacts: dirDraft.value });
    dirDirty.value = false;
    notif.success(i18nT('通讯录已保存'));
    await refresh();
  } catch (e) { notif.error(errorMessage(e)); }
}
async function importDirectory(): Promise<void> {
  const paths = await pickFiles('excel', false, i18nT('选择服务商通讯录 Excel'));
  if (!paths[0]) return;
  try {
    const r = await api().contactsImport({ path: paths[0] });
    notif.success(i18nT('已导入 {n} 条', { n: r.imported }));
    dirDirty.value = false;
    await refresh();
  } catch (e) { notif.error(errorMessage(e)); }
}

// ── 提醒 ──
const showReminders = ref(false);
const reminders = computed<any[]>(() => [...(state.value?.reminders || [])].reverse());
const unreadReminders = computed(() => reminders.value.filter((r) => !r.read));
function reminderIcon(type: string): string {
  return ({ payment_day: 'ri-money-cny-circle-line', writeoff_3d: 'ri-alarm-warning-line', invoice_20d: 'ri-bill-line', return_second: 'ri-arrow-go-back-line', invoice_received: 'ri-mail-download-line', unpaid_report: 'ri-file-chart-line' } as Record<string, string>)[type] || 'ri-notification-3-line';
}
async function ackAll(): Promise<void> { try { await api().remindersAck({ all: true }); await refresh(); } catch (e) { notif.error(errorMessage(e)); } }
async function tickNow(): Promise<void> { try { await api().triggerTick(); await refresh(); notif.info(i18nT('已检查一轮提醒与收件')); } catch (e) { notif.error(errorMessage(e)); } }

let unsubEvent: (() => void) | null = null;
onMounted(() => {
  void refresh();
  const a = api();
  if (a?.onEvent) {
    unsubEvent?.();
    unsubEvent = a.onEvent((ev: any) => {
      if (ev?.type === 'reminder' && ev.payload) {
        notif.actionable('warn', `${ev.payload.title}`, { label: i18nT('查看'), onClick: () => { showReminders.value = true; } }, 10000);
      } else if (ev?.type === 'intake-scanned' && ev.payload?.invoices) {
        notif.success(i18nT('收到 {n} 份服务商发票，已自动归档', { n: ev.payload.invoices }));
      }
      void refresh();
    });
  }
});
onBeforeUnmount(() => { unsubEvent?.(); unsubEvent = null; });
</script>

<style scoped>
/* 外层 .page-wrap 是 overflow:hidden：路由页必须自己给滚动区（pageScrollStrategy 护栏），
   否则四个模块的长向导超出视口就被切掉。sticky 进度条以本容器为滚动上下文，贴顶不受影响。 */
.ss-workbench { display: grid; gap: 14px; padding: 18px 22px 40px; max-width: 1440px; margin: 0 auto; width: 100%; box-sizing: border-box; flex: 1; min-height: 0; overflow-y: auto; align-content: start; }
.workbench-header { display: flex; align-items: flex-start; justify-content: space-between; gap: 16px; flex-wrap: wrap; }
.heading { display: flex; gap: 14px; align-items: flex-start; }
.heading-icon { width: 48px; height: 48px; border-radius: 14px; display: inline-flex; align-items: center; justify-content: center; background: color-mix(in srgb, var(--color-brand) 14%, transparent); color: var(--color-brand); font-size: 24px; flex: 0 0 auto; }
.eyebrow { margin: 0; font-size: 11px; font-weight: 800; letter-spacing: .08em; text-transform: uppercase; color: var(--color-text-secondary); }
h1 { margin: 2px 0 4px; font-size: 22px; }
.subtitle { margin: 0; color: var(--color-text-secondary); font-size: 13px; line-height: 1.6; max-width: 900px; }
.header-actions { display: flex; gap: 8px; align-items: center; }

.ss-toolbar { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 260px), 1fr)); gap: 10px; }
.ss-toolbar__item { display: flex; align-items: center; gap: 10px; padding: 10px 12px; border: 1px solid var(--color-border); border-radius: 12px; background: var(--color-bg-card); min-width: 0; }
.ss-toolbar__item > i { font-size: 20px; color: var(--color-brand); flex: 0 0 auto; }
.ss-toolbar__item > i.ok { color: var(--color-success); }
.ss-toolbar__item > i.warn { color: var(--color-warning); }
.ss-toolbar__item > div { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 2px; }
.ss-toolbar__item small { color: var(--color-text-secondary); font-size: 11.5px; }
.ss-toolbar__item strong { font-size: 12.5px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; display: flex; gap: 4px; align-items: center; }

.ss-panel { border: 1px solid var(--color-border); border-radius: 14px; background: var(--color-bg-card); padding: 12px 14px; display: grid; gap: 10px; }
.ss-panel > header { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; font-size: 13px; }
.ss-panel > header .grow { flex: 1; }
.ss-reminders { list-style: none; margin: 0; padding: 0; display: grid; gap: 8px; max-height: 320px; overflow: auto; }
.ss-reminders li { display: flex; gap: 10px; align-items: flex-start; padding: 8px 10px; border-radius: 10px; background: var(--color-bg-primary); font-size: 12.5px; }
.ss-reminders li.unread { border-inline-start: 3px solid var(--color-warning); }
.ss-reminders li > i { font-size: 18px; color: var(--color-warning); }
.ss-reminders p { margin: 2px 0; white-space: pre-wrap; color: var(--color-text-secondary); }
.ss-reminders small { color: var(--color-text-muted, var(--color-text-secondary)); }

.ss-tabs { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 220px), 1fr)); gap: 8px; }
.ss-tab { display: flex; align-items: center; gap: 10px; padding: 10px 12px; border-radius: 12px; border: 1px solid var(--color-border); background: var(--color-bg-card); cursor: pointer; text-align: left; font: inherit; color: var(--color-text-primary); transition: .15s; }
.ss-tab i { font-size: 20px; color: var(--color-text-secondary); }
.ss-tab span { display: flex; flex-direction: column; gap: 2px; min-width: 0; }
.ss-tab strong { font-size: 13px; }
.ss-tab small { font-size: 11.5px; color: var(--color-text-secondary); }
.ss-tab:hover { border-color: var(--color-brand); }
.ss-tab.active { border-color: var(--color-brand); background: color-mix(in srgb, var(--color-brand) 8%, var(--color-bg-card)); }
.ss-tab.active i { color: var(--color-brand); }
.ss-body { display: grid; gap: 14px; }
.spin { animation: ss-spin 1s linear infinite; }
@keyframes ss-spin { to { transform: rotate(360deg); } }
</style>
