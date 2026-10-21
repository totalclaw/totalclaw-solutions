<template>
  <div class="ss-module">
    <!-- 结果文件目录 -->
    <section class="ss-panel">
      <header>
        <strong><i class="ri-folder-3-line"></i> {{ $t('结果文件存到') }}</strong>
        <span class="ss-muted">{{ $t('凭证导入文件、申报表草稿、报表、报告都存在这里，按账套、按智能体分目录。') }}</span>
      </header>
      <div class="ss-actions">
        <code class="fa-path">{{ state?.outputDir || '—' }}</code>
        <button type="button" class="ss-btn sm ghost" @click="pickOutputDir"><i class="ri-folder-settings-line"></i>{{ $t('更改') }}</button>
        <button type="button" class="ss-btn sm ghost" :disabled="!state?.outputDir" @click="open(state!.outputDir)"><i class="ri-external-link-line"></i>{{ $t('打开') }}</button>
      </div>
    </section>

    <!-- 各智能体模型 -->
    <section class="ss-panel">
      <header>
        <strong><i class="ri-cpu-line"></i> {{ $t('各智能体使用的模型') }}</strong>
        <span class="ss-muted">{{ $t('每个智能体单独指定；不指定就用系统默认模型（{p0}）。金额一律由规则计算，不经过模型。', { p0: faModels.defaultLabel || $t('未配置') }) }}</span>
      </header>
      <div class="ss-table-wrap">
        <table class="ss-table">
          <thead><tr><th>{{ $t('智能体') }}</th><th>{{ $t('使用模型') }}</th></tr></thead>
          <tbody>
            <tr v-for="m in modules" :key="m.key">
              <td><i :class="m.icon" class="fa-icon"></i> {{ m.title }}</td>
              <td>
                <select :value="state?.settings.moduleModels[m.key] || ''" :disabled="savingModel === m.key" @change="setModel(m.key, ($event.target as HTMLSelectElement).value)">
                  <option value="">{{ $t('跟随系统默认（{p0}）', { p0: faModels.defaultLabel || $t('未配置') }) }}</option>
                  <optgroup v-for="g in modelGroups()" :key="g.group" :label="g.group"><option v-for="o in g.options" :key="o.value" :value="o.value">{{ o.label }}</option></optgroup>
                </select>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <!-- 税务口径 -->
    <section class="ss-panel">
      <header>
        <strong><i class="ri-government-line"></i> {{ $t('税务口径') }}</strong>
        <span class="ss-muted">{{ $t('政策默认值截至 2025 年底，执行前核对最新文件。') }}</span>
      </header>
      <div class="ss-grid">
        <label class="ss-field"><span>{{ $t('小规模征收率（%）') }}</span><input v-model.number="tax.smallScaleRate" type="number" step="0.1" min="0" /></label>
        <label class="ss-field"><span>{{ $t('小规模月销售额免征额（元）') }}</span><input v-model.number="tax.smallExemptMonthly" type="number" min="0" /></label>
        <label class="ss-field"><span>{{ $t('教育费附加（%）') }}</span><input v-model.number="tax.eduSurchargeRate" type="number" step="0.1" min="0" /></label>
        <label class="ss-field"><span>{{ $t('地方教育附加（%）') }}</span><input v-model.number="tax.localEduSurchargeRate" type="number" step="0.1" min="0" /></label>
        <label class="ss-field"><span>{{ $t('小型微利企业所得税实际税率（%）') }}</span><input v-model.number="tax.smallProfitCitRate" type="number" step="0.1" min="0" /></label>
        <label class="ss-field"><span>{{ $t('企业所得税一般税率（%）') }}</span><input v-model.number="tax.citRate" type="number" step="0.1" min="0" /></label>
        <label class="ss-field"><span>{{ $t('行业增值税税负预警值（%）') }}</span><input v-model.number="tax.industryVatBurden" type="number" step="0.1" min="0" /></label>
        <label class="ss-field fa-check"><input v-model="tax.halveSurcharges" type="checkbox" /><span>{{ $t('六税两费减半征收') }}</span></label>
      </div>
      <div class="ss-actions"><button type="button" class="ss-btn primary sm" :disabled="!!saving" @click="saveTax"><i class="ri-save-line"></i>{{ $t('保存') }}</button></div>
    </section>

    <!-- 报销规则 -->
    <section class="ss-panel">
      <header>
        <strong><i class="ri-receipt-line"></i> {{ $t('报销规则') }}</strong>
        <span class="ss-muted">{{ $t('费用报销智能体按这些规则预审；上限填 0 表示不限。') }}</span>
      </header>
      <div class="ss-table-wrap">
        <table class="ss-table">
          <thead><tr><th>{{ $t('类别') }}</th><th class="num">{{ $t('单张上限（元）') }}</th><th>{{ $t('必须专票') }}</th><th>{{ $t('入账科目') }}</th><th></th></tr></thead>
          <tbody>
            <tr v-for="(r, i) in expense.rules" :key="i">
              <td><input v-model.trim="r.category" type="text" /></td>
              <td><input v-model.number="r.perItemCap" type="number" min="0" /></td>
              <td><input v-model="r.requireSpecial" type="checkbox" /></td>
              <td><input v-model.trim="r.accountName" type="text" /></td>
              <td><button type="button" class="ss-link" @click="expense.rules.splice(i, 1)">{{ $t('删除') }}</button></td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="ss-actions"><button type="button" class="ss-btn sm ghost" @click="expense.rules.push({ category: '', perItemCap: 0, accountName: '' })"><i class="ri-add-line"></i>{{ $t('加一条规则') }}</button></div>
      <div class="ss-grid">
        <label class="ss-field"><span>{{ $t('票据有效期（天）') }}</span><input v-model.number="expense.validityDays" type="number" min="1" /></label>
        <label class="ss-field fa-check"><input v-model="expense.allowCrossYearUntilJan31" type="checkbox" /><span>{{ $t('允许次年 1 月 31 日前报销上年票据') }}</span></label>
        <label class="ss-field fa-check"><input v-model="expense.requireCompanyTitle" type="checkbox" /><span>{{ $t('发票抬头必须是本公司') }}</span></label>
      </div>
      <div class="ss-subhead">{{ $t('月度报销额度（按员工级别）') }}</div>
      <div v-for="(q, i) in quotas" :key="i" class="fa-row">
        <input v-model.trim="q.level" type="text" :placeholder="$t('级别（如 经理）')" />
        <input v-model.number="q.amount" type="number" min="0" :placeholder="$t('每月额度（元）')" />
        <button type="button" class="ss-link" @click="quotas.splice(i, 1)">{{ $t('删除') }}</button>
      </div>
      <div class="ss-actions">
        <button type="button" class="ss-btn sm ghost" @click="quotas.push({ level: '', amount: 0 })"><i class="ri-add-line"></i>{{ $t('加一个级别') }}</button>
        <button type="button" class="ss-btn primary sm" :disabled="!!saving" @click="saveExpense"><i class="ri-save-line"></i>{{ $t('保存') }}</button>
      </div>
    </section>

    <!-- 风险阈值 -->
    <section class="ss-panel">
      <header>
        <strong><i class="ri-shield-check-line"></i> {{ $t('风险巡检阈值') }}</strong>
      </header>
      <div class="ss-grid">
        <label class="ss-field"><span>{{ $t('大额现金 / 大额付给个人（元）') }}</span><input v-model.number="risk.largeCash" type="number" min="0" /></label>
        <label class="ss-field"><span>{{ $t('增值税税负低于（%）预警') }}</span><input v-model.number="risk.minVatBurden" type="number" step="0.1" min="0" /></label>
        <label class="ss-field"><span>{{ $t('往来挂账超过（天）') }}</span><input v-model.number="risk.staleDays" type="number" min="1" /></label>
        <label class="ss-field"><span>{{ $t('同一开票方连号张数') }}</span><input v-model.number="risk.consecutiveCount" type="number" min="2" /></label>
        <label class="ss-field"><span>{{ $t('费用环比上涨倍数') }}</span><input v-model.number="risk.expenseSpikeRatio" type="number" step="0.1" min="1" /></label>
      </div>
      <div class="ss-actions"><button type="button" class="ss-btn primary sm" :disabled="!!saving" @click="saveRisk"><i class="ri-save-line"></i>{{ $t('保存') }}</button></div>
    </section>

    <!-- 数据对接 -->
    <DataSourcePanel />
    <section class="ss-panel">
      <header>
        <strong><i class="ri-plug-line"></i> {{ $t('API 接收外部数据') }}</strong>
        <span class="ss-muted">{{ $t('只监听本机，必须带令牌；收到的数据只进本工作台的分析库，不回写正式账套。') }}</span>
      </header>
      <div class="ss-grid">
        <label class="ss-field fa-check"><input v-model="apiForm.enabled" type="checkbox" /><span>{{ $t('开启 API 接收') }}</span></label>
        <label class="ss-field"><span>{{ $t('端口') }}</span><input v-model.number="apiForm.port" type="number" min="1024" max="65535" /></label>
      </div>
      <div class="ss-actions">
        <button type="button" class="ss-btn primary sm" :disabled="!!saving" @click="saveApi"><i class="ri-save-line"></i>{{ $t('保存') }}</button>
        <span class="ss-chip" :class="apiStatus?.running ? 'ok' : ''">{{ apiStatus?.running ? $t('运行中') : $t('未运行') }}</span>
        <code v-if="apiStatus?.url" class="fa-path">{{ apiStatus.url }}</code>
        <span v-if="apiStatus?.error" class="ss-chip bad" :title="apiStatus.error">{{ apiStatus.error }}</span>
      </div>
      <div v-if="state?.settings.apiReceiver.token" class="ss-actions">
        <span class="ss-muted">{{ $t('令牌') }}</span>
        <code class="fa-path">{{ showToken ? state.settings.apiReceiver.token : '••••••••••••' }}</code>
        <button type="button" class="ss-link" @click="showToken = !showToken">{{ showToken ? $t('隐藏') : $t('显示') }}</button>
        <button type="button" class="ss-link" @click="copyToken">{{ $t('复制') }}</button>
        <button type="button" class="ss-link" @click="regenerate">{{ $t('重新生成') }}</button>
      </div>
      <pre class="fa-code">{{ curlExample }}</pre>
      <p class="ss-muted">{{ $t('kind 可选 journal（序时账）、balances（科目余额表，带 period）、budget（预算，带 year）；rows 的字段名用中文表头或英文字段都能识别；ledger 可填账套名，不填进当前账套。') }}</p>
    </section>
  </div>
</template>

<script setup lang="ts">
/**
 * 设置：结果目录、各智能体模型、税务口径、报销规则、风险阈值、数据对接（Excel 导入 + 本机 API）。
 * 百分比字段界面按 % 显示，存小数。
 */
import { computed, reactive, ref, watch } from 'vue';
import type { FaExpenseRule, FaModuleKey } from '@totalclaw/ipc-contracts';
import { useNotificationStore } from '../../stores/notification';
import { t as i18nT } from '../../i18n';
import DataSourcePanel from './DataSourcePanel.vue';
import { errorMessage, fa, faModels, faState, modelGroups, moduleMetas, openPath, refreshState } from './shared';

const notif = useNotificationStore();
const state = faState;
const modules = moduleMetas();
const savingModel = ref('');
const saving = ref('');
const showToken = ref(false);
const apiStatus = computed(() => state.value?.apiStatus);

const pct = (v: number) => Math.round((Number(v) || 0) * 100000) / 1000;
const dec = (v: number) => Math.round((Number(v) || 0) * 1000) / 100000;

const tax = reactive({ smallScaleRate: 0, smallExemptMonthly: 0, eduSurchargeRate: 0, localEduSurchargeRate: 0, halveSurcharges: true, smallProfitCitRate: 0, citRate: 0, industryVatBurden: 0 });
const expense = reactive<{ rules: FaExpenseRule[]; validityDays: number; allowCrossYearUntilJan31: boolean; requireCompanyTitle: boolean }>({ rules: [], validityDays: 180, allowCrossYearUntilJan31: true, requireCompanyTitle: true });
const quotas = ref<Array<{ level: string; amount: number }>>([]);
const risk = reactive({ largeCash: 0, minVatBurden: 0, staleDays: 365, consecutiveCount: 3, expenseSpikeRatio: 2 });
const apiForm = reactive({ enabled: false, port: 18765 });

function load(): void {
  const s = state.value?.settings;
  if (!s) return;
  Object.assign(tax, {
    smallScaleRate: pct(s.tax.smallScaleRate), smallExemptMonthly: s.tax.smallExemptMonthly, eduSurchargeRate: pct(s.tax.eduSurchargeRate),
    localEduSurchargeRate: pct(s.tax.localEduSurchargeRate), halveSurcharges: s.tax.halveSurcharges, smallProfitCitRate: pct(s.tax.smallProfitCitRate),
    citRate: pct(s.tax.citRate), industryVatBurden: pct(s.tax.industryVatBurden),
  });
  expense.rules = s.expense.rules.map((r) => ({ ...r }));
  expense.validityDays = s.expense.validityDays;
  expense.allowCrossYearUntilJan31 = s.expense.allowCrossYearUntilJan31;
  expense.requireCompanyTitle = s.expense.requireCompanyTitle;
  quotas.value = Object.entries(s.expense.monthlyQuota || {}).map(([level, amount]) => ({ level, amount }));
  Object.assign(risk, { ...s.risk, minVatBurden: pct(s.risk.minVatBurden) });
  Object.assign(apiForm, { enabled: s.apiReceiver.enabled, port: s.apiReceiver.port });
}
watch(() => state.value?.activeLedgerId, load, { immediate: true });

const curlExample = computed(() => {
  const port = state.value?.settings.apiReceiver.port || apiForm.port;
  return [
    `curl -X POST http://127.0.0.1:${port}/finance/import \\`,
    `  -H "Authorization: Bearer <token>" \\`,
    `  -H "Content-Type: application/json" \\`,
    `  -d '{"kind":"journal","rows":[{"date":"2026-09-01","voucherNo":"1","summary":"...","accountName":"...","debit":100,"credit":0}]}'`,
  ].join('\n');
});

async function patch(key: string, value: unknown): Promise<void> {
  saving.value = key;
  try {
    await fa('settings.patch', { patch: { [key]: value } });
    await refreshState();
    notif.success(i18nT('已保存'));
  } catch (e) { notif.error(errorMessage(e)); } finally { saving.value = ''; }
}
function saveTax(): Promise<void> {
  return patch('tax', {
    smallScaleRate: dec(tax.smallScaleRate), smallExemptMonthly: Number(tax.smallExemptMonthly) || 0, eduSurchargeRate: dec(tax.eduSurchargeRate),
    localEduSurchargeRate: dec(tax.localEduSurchargeRate), halveSurcharges: !!tax.halveSurcharges, smallProfitCitRate: dec(tax.smallProfitCitRate),
    citRate: dec(tax.citRate), industryVatBurden: dec(tax.industryVatBurden),
  });
}
function saveExpense(): Promise<void> {
  const monthlyQuota: Record<string, number> = {};
  for (const q of quotas.value) if (q.level) monthlyQuota[q.level] = Number(q.amount) || 0;
  return patch('expense', {
    rules: expense.rules.filter((r) => r.category).map((r) => ({ ...r, perItemCap: Number(r.perItemCap) || 0, requireSpecial: !!r.requireSpecial })),
    validityDays: Number(expense.validityDays) || 180, allowCrossYearUntilJan31: !!expense.allowCrossYearUntilJan31,
    requireCompanyTitle: !!expense.requireCompanyTitle, monthlyQuota,
  });
}
function saveRisk(): Promise<void> {
  return patch('risk', {
    largeCash: Number(risk.largeCash) || 0, minVatBurden: dec(risk.minVatBurden), staleDays: Number(risk.staleDays) || 365,
    consecutiveCount: Number(risk.consecutiveCount) || 3, expenseSpikeRatio: Number(risk.expenseSpikeRatio) || 2,
  });
}
function saveApi(): Promise<void> {
  return patch('apiReceiver', { enabled: !!apiForm.enabled, port: Number(apiForm.port) || 18765 });
}
async function regenerate(): Promise<void> {
  try { await fa('api.regenerateToken'); await refreshState(); } catch (e) { notif.error(errorMessage(e)); }
}
async function copyToken(): Promise<void> {
  try { await navigator.clipboard.writeText(state.value?.settings.apiReceiver.token || ''); } catch (e) { notif.error(errorMessage(e)); }
}
async function setModel(key: FaModuleKey, value: string): Promise<void> {
  savingModel.value = key;
  try {
    const models: Record<string, string> = { ...(state.value?.settings.moduleModels || {}) };
    if (value) models[key] = value; else delete models[key];
    await fa('settings.patch', { patch: { moduleModels: models } });
    await refreshState();
  } catch (e) { notif.error(errorMessage(e)); } finally { savingModel.value = ''; }
}
async function pickOutputDir(): Promise<void> {
  try { if (await fa('outputDir.pick')) await refreshState(); } catch (e) { notif.error(errorMessage(e)); }
}
function open(path: string): void { openPath(path).catch((e) => notif.error(errorMessage(e))); }
</script>

<style scoped>
.ss-panel > header strong { display: flex; gap: 6px; align-items: center; }
.fa-path { font-size: 12px; color: var(--color-text-secondary); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 520px; }
.fa-icon { color: var(--color-brand); }
.ss-table select { min-width: 280px; }
.ss-table input[type="text"], .ss-table input[type="number"] { width: 100%; min-width: 80px; box-sizing: border-box; }
.fa-check { flex-direction: row !important; align-items: center; gap: 6px; }
.fa-row { display: flex; gap: 8px; align-items: center; max-width: 520px; }
.fa-row input { flex: 1; min-width: 0; height: 32px; border-radius: 8px; border: 1px solid var(--color-border); background: var(--color-bg-primary); color: var(--color-text-primary); padding: 0 8px; font: inherit; }
.fa-code { margin: 0; padding: 10px 12px; border-radius: 10px; background: var(--color-bg-primary); font-size: 11.5px; overflow-x: auto; white-space: pre; }
</style>
