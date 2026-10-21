<template>
  <div class="ss-module">
    <ModuleHeader :meta="meta" />
    <p class="ss-note warn fa-compliance"><i class="ri-alarm-warning-line"></i>{{ $t('本智能体不对接电子税务局、不自动提交申报：只做数据整理、草稿生成和风险自查，申报由财务人员在电子税务局核对后自行提交。') }}</p>

    <DataSourcePanel />

    <div class="fa-split">
      <aside class="fa-list">
        <div class="ss-subhead">{{ $t('申报草稿') }}</div>
        <ul>
          <li v-for="r in runs" :key="r.id" :class="{ active: r.id === viewId }" @click="viewRun(r)">
            <div class="fa-list__top"><strong>{{ r.period }}</strong><span class="ss-chip" :class="r.findings.some((f) => f.level === 'high') ? 'bad' : r.findings.length ? 'warn' : 'ok'">{{ $t('{n} 项提示', { n: r.findings.length }) }}</span></div>
            <div class="fa-list__meta">
              <span>{{ $t('增值税 {p0}', { p0: fmtMoney(r.result.vatPayable) }) }}</span>
              <span>{{ fmtDateTime(r.createdAt) }}</span>
              <button type="button" class="ss-link" @click.stop="removeRun(r.id)">{{ $t('删除') }}</button>
            </div>
          </li>
          <li v-if="!runs.length" class="ss-empty">{{ $t('还没有申报草稿') }}</li>
        </ul>
      </aside>

      <section class="fa-detail">
        <StickyProgress :title="$t('税务申报 {p0}', { p0: period })" :metas="metas" :runtime="runtime" :current-key="currentKey" @jump="scrollTo" />
        <div class="ss-steps">
          <!-- ① 所属期与取数 -->
          <StepCard step-key="derive" :index="0" :title="metas[0].title" :hint="metas[0].hint" :runtime="runtime.derive">
            <div class="ss-actions">
              <div class="fa-seg">
                <button type="button" :class="{ active: mode === 'month' }" @click="mode = 'month'">{{ $t('按月') }}</button>
                <button type="button" :class="{ active: mode === 'quarter' }" @click="mode = 'quarter'">{{ $t('按季') }}</button>
              </div>
              <input v-if="mode === 'month'" v-model="month" type="month" class="fa-input" />
              <template v-else>
                <input v-model.number="year" type="number" min="2000" max="2100" class="fa-input fa-year" />
                <select v-model.number="quarter" class="fa-input"><option v-for="q in 4" :key="q" :value="q">{{ $t('第 {n} 季度', { n: q }) }}</option></select>
              </template>
              <button type="button" class="ss-btn primary" :disabled="!!busy || !period" @click="derive"><i :class="busy === 'derive' ? 'ri-loader-4-line spin' : 'ri-download-2-line'"></i>{{ $t('从票据与账面取数') }}</button>
              <span class="ss-muted">{{ $t('销项按已识别的销项票据按税率汇总，进项取专票与客票；账面收入、利润取导入的序时账和已审核凭证') }}</span>
            </div>

            <template v-if="inputs">
              <div class="ss-subhead">{{ $t('销售额（按税率）') }}</div>
              <table class="ss-table fa-edit">
                <thead><tr><th>{{ $t('税率 / 征收率（%）') }}</th><th class="num">{{ $t('不含税销售额') }}</th><th class="num">{{ $t('税额') }}</th><th></th></tr></thead>
                <tbody>
                  <tr v-for="(g, i) in inputs.salesByRate" :key="i">
                    <td><input v-model.number="ratePct[i]" type="number" step="0.1" @change="g.rate = (Number(ratePct[i]) || 0) / 100" /></td>
                    <td><input v-model.number="g.amount" type="number" step="0.01" class="num" /></td>
                    <td><input v-model.number="g.tax" type="number" step="0.01" class="num" /></td>
                    <td><button type="button" class="ss-link" @click="removeRate(i)">{{ $t('删行') }}</button></td>
                  </tr>
                </tbody>
              </table>
              <button type="button" class="ss-btn ghost sm" @click="addRate"><i class="ri-add-line"></i>{{ $t('加一个税率') }}</button>
              <div class="ss-grid">
                <label class="ss-field"><span>{{ $t('未开票收入（不含税）') }}</span><input v-model.number="inputs.uninvoicedSales" type="number" step="0.01" /></label>
                <label class="ss-field"><span>{{ $t('未开票收入适用税率（%）') }}</span><input v-model.number="uninvoicedRatePct" type="number" step="0.1" /></label>
                <label class="ss-field"><span>{{ $t('认证可抵扣进项税额') }}</span><input v-model.number="inputs.inputTax" type="number" step="0.01" /></label>
                <label class="ss-field"><span>{{ $t('进项税额转出') }}</span><input v-model.number="inputs.inputTransferOut" type="number" step="0.01" /></label>
                <label class="ss-field"><span>{{ $t('上期留抵税额') }}</span><input v-model.number="inputs.carriedCredit" type="number" step="0.01" /></label>
                <label class="ss-field"><span>{{ $t('账面收入（核对账税差异）') }}</span><input v-model.number="inputs.bookRevenue" type="number" step="0.01" /></label>
                <label class="ss-field"><span>{{ $t('本年累计利润总额') }}</span><input v-model.number="inputs.profitYtd" type="number" step="0.01" /></label>
                <label class="ss-field"><span>{{ $t('本年已预缴企业所得税') }}</span><input v-model.number="inputs.citPaidYtd" type="number" step="0.01" /></label>
                <label class="ss-field fa-check"><input v-model="inputs.quarterly" type="checkbox" /><span>{{ $t('按季申报（免征额按 3 个月算）') }}</span></label>
              </div>
            </template>
          </StepCard>

          <!-- ② 个税 -->
          <StepCard step-key="iit" :index="1" :title="metas[1].title" :hint="metas[1].hint" :runtime="runtime.iit">
            <div class="ss-actions">
              <label class="ss-field fa-small"><span>{{ $t('本年第几个月（累计月数）') }}</span><input v-model.number="monthIndex" type="number" min="1" max="12" /></label>
            </div>
            <FileDrop compact kind="excel" :multi="false" :label="$t('导入工资表')" :hint="$t('需要：姓名、应发工资；可选：个人社保公积金、专项附加扣除、累计收入 / 累计已预扣税额等')" :disabled="!!busy" @picked="(p) => importPayroll(p[0])" />
            <table v-if="iitRows.length" class="ss-table fa-edit">
              <thead><tr><th>{{ $t('姓名') }}</th><th class="num">{{ $t('本月应发') }}</th><th class="num">{{ $t('三险一金') }}</th><th class="num">{{ $t('专项附加') }}</th><th class="num">{{ $t('累计收入（此前）') }}</th><th class="num">{{ $t('累计三险一金') }}</th><th class="num">{{ $t('累计专项附加') }}</th><th class="num">{{ $t('累计已预扣') }}</th><th class="num">{{ $t('月数') }}</th><th></th></tr></thead>
              <tbody>
                <tr v-for="(r, i) in iitRows" :key="i">
                  <td><input v-model.trim="r.name" type="text" /></td>
                  <td><input v-model.number="r.salary" type="number" step="0.01" /></td>
                  <td><input v-model.number="r.insurance" type="number" step="0.01" /></td>
                  <td><input v-model.number="r.special" type="number" step="0.01" /></td>
                  <td><input v-model.number="r.ytdSalary" type="number" step="0.01" /></td>
                  <td><input v-model.number="r.ytdInsurance" type="number" step="0.01" /></td>
                  <td><input v-model.number="r.ytdSpecial" type="number" step="0.01" /></td>
                  <td><input v-model.number="r.ytdTaxPaid" type="number" step="0.01" /></td>
                  <td><input v-model.number="r.monthIndex" type="number" min="1" max="12" /></td>
                  <td><button type="button" class="ss-link" @click="iitRows.splice(i, 1)">{{ $t('删行') }}</button></td>
                </tr>
              </tbody>
            </table>
            <div class="ss-actions">
              <button type="button" class="ss-btn ghost sm" @click="addIit"><i class="ri-user-add-line"></i>{{ $t('手工加一人') }}</button>
              <span class="ss-muted">{{ $t('没有工资可以跳过，个税为 0。') }}</span>
            </div>
          </StepCard>

          <!-- ③ 计算 -->
          <StepCard step-key="compute" :index="2" :title="metas[2].title" :hint="metas[2].hint" :runtime="runtime.compute">
            <div class="ss-actions">
              <button type="button" class="ss-btn primary" :disabled="!!busy || !inputs" @click="compute"><i :class="busy === 'compute' ? 'ri-loader-4-line spin' : 'ri-calculator-line'"></i>{{ $t('计算税额') }}</button>
              <span class="ss-muted">{{ $t('税率与优惠口径在「设置 → 税务」里改') }}</span>
              <button type="button" class="ss-link" @click="$emit('goto', 'settings')">{{ $t('去设置') }}</button>
            </div>
            <template v-if="run">
              <div class="ss-kpis">
                <div class="ss-kpi accent"><small>{{ $t('应纳增值税') }}</small><strong>{{ fmtMoney(run.result.vatPayable) }}</strong></div>
                <div class="ss-kpi"><small>{{ $t('附加税费') }}</small><strong>{{ fmtMoney(run.result.surchargeTotal) }}</strong></div>
                <div class="ss-kpi"><small>{{ $t('企业所得税（本期应补）') }}</small><strong>{{ fmtMoney(run.result.citPayable) }}</strong></div>
                <div class="ss-kpi"><small>{{ $t('个税代扣') }}</small><strong>{{ fmtMoney(run.result.iitTotal) }}</strong></div>
                <div class="ss-kpi"><small>{{ $t('增值税税负率') }}</small><strong>{{ run.result.burdenRate != null ? fmtPct(run.result.burdenRate) : '—' }}</strong></div>
              </div>
              <p v-if="run.result.vatExempt" class="ss-note ok"><i class="ri-check-line"></i>{{ $t('销售额未超过免征额，本期增值税免征') }}</p>
              <div v-for="sec in calcSections" :key="sec.title">
                <div class="ss-subhead">{{ sec.title }}</div>
                <table class="ss-table">
                  <thead><tr><th>{{ $t('项目') }}</th><th>{{ $t('计算过程') }}</th><th class="num">{{ $t('结果') }}</th></tr></thead>
                  <tbody><tr v-for="(l, i) in sec.lines" :key="i"><td>{{ l.label }}</td><td class="fa-wrap">{{ l.formula }}</td><td class="num">{{ l.value > 0 && l.value < 1 ? fmtPct(l.value, 0) : fmtMoney(l.value) }}</td></tr></tbody>
                </table>
              </div>
              <template v-if="run.result.iit.length">
                <div class="ss-subhead">{{ $t('个人所得税（累计预扣法）') }}</div>
                <table class="ss-table">
                  <thead><tr><th>{{ $t('姓名') }}</th><th class="num">{{ $t('累计应纳税所得额') }}</th><th class="num">{{ $t('税率') }}</th><th class="num">{{ $t('速算扣除数') }}</th><th class="num">{{ $t('累计已预扣') }}</th><th class="num">{{ $t('本月应预扣') }}</th></tr></thead>
                  <tbody>
                    <tr v-for="(r, i) in run.result.iit" :key="i">
                      <td>{{ r.name }}</td><td class="num">{{ fmtMoney(r.taxableYtd) }}</td><td class="num">{{ r.rate != null ? fmtPct(r.rate, 0) : '—' }}</td>
                      <td class="num">{{ fmtMoney(r.quickDeduction) }}</td><td class="num">{{ fmtMoney(r.ytdTaxPaid) }}</td><td class="num">{{ fmtMoney(r.taxThisMonth) }}</td>
                    </tr>
                  </tbody>
                </table>
              </template>
            </template>
          </StepCard>

          <!-- ④ 账税差异与风险预检 -->
          <StepCard step-key="check" :index="3" :title="metas[3].title" :hint="metas[3].hint" :runtime="runtime.check">
            <template v-if="run">
              <p v-if="!run.findings.length" class="ss-note ok"><i class="ri-check-line"></i>{{ $t('没有发现账税差异或风险') }}</p>
              <div v-for="(f, i) in run.findings" :key="i" class="fa-finding" :class="f.level">
                <div class="fa-finding__head"><span class="ss-chip" :class="levelChip(f.level)">{{ levelLabel(f.level) }}</span><strong>{{ f.title }}</strong></div>
                <p class="fa-pre">{{ f.detail }}</p>
                <p class="fa-sugg"><i class="ri-lightbulb-line"></i>{{ f.suggestion }}</p>
              </div>
              <div class="ss-actions"><button type="button" class="ss-btn ghost sm" @click="checked = true"><i class="ri-check-line"></i>{{ $t('已逐项核对') }}</button></div>
            </template>
            <p v-else class="ss-muted">{{ $t('先计算税额。') }}</p>
          </StepCard>

          <!-- ⑤ 申报备注 -->
          <StepCard step-key="note" :index="4" :title="metas[4].title" :hint="metas[4].hint" :runtime="runtime.note">
            <div class="ss-actions">
              <button type="button" class="ss-btn primary" :disabled="!!busy || !run" @click="writeNote"><i :class="busy === 'note' ? 'ri-loader-4-line spin' : 'ri-quill-pen-line'"></i>{{ run?.note ? $t('重新生成申报备注') : $t('生成申报备注') }}</button>
              <span v-if="run?.model" class="ss-muted">{{ $t('由 {p0} 撰写，数字取自上面的计算结果', { p0: modelLabel(run.model) }) }}</span>
            </div>
            <div v-if="run?.note" class="fa-note">{{ run.note }}</div>
          </StepCard>

          <!-- ⑥ 导出 -->
          <StepCard step-key="export" :index="5" :title="metas[5].title" :hint="metas[5].hint" :runtime="runtime.export">
            <div class="ss-actions">
              <button type="button" class="ss-btn primary" :disabled="!!busy || !run" @click="exportRun"><i :class="busy === 'export' ? 'ri-loader-4-line spin' : 'ri-file-excel-2-line'"></i>{{ $t('导出申报表草稿') }}</button>
            </div>
            <div v-if="run?.exportPath" class="ss-actions">
              <code class="fa-path">{{ run.exportPath }}</code>
              <button type="button" class="ss-btn ghost sm" @click="openFile(run.exportPath)"><i class="ri-external-link-line"></i>{{ $t('打开') }}</button>
              <button type="button" class="ss-btn ghost sm" @click="openFile(run.exportPath, true)"><i class="ri-folder-line"></i>{{ $t('在文件夹中显示') }}</button>
            </div>
          </StepCard>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * 税务申报智能体：所属期取数 → 个税 → 按规则计算 → 账税差异与风险预检 → 申报备注 → 导出草稿。
 * 只出草稿，不对接电子税务局。
 */
import { computed, ref, watch } from 'vue';
import type { FaCalcLine, FaIitRow, FaTaxInputs, FaTaxRun } from '@totalclaw/ipc-contracts';
import { useNotificationStore } from '../../stores/notification';
import { t as i18nT } from '../../i18n';
import StepCard from '../service-settlement/StepCard.vue';
import StickyProgress from '../service-settlement/StickyProgress.vue';
import ModuleHeader from './ModuleHeader.vue';
import FileDrop from './FileDrop.vue';
import DataSourcePanel from './DataSourcePanel.vue';
import {
  errorMessage, fa, faState, fmtDateTime, fmtMoney, fmtPct, levelChip, levelLabel, modelLabel, openPath, prevMonth, refreshState, scrollToStep,
  type FaModuleMeta, type StepMeta, type StepRuntime,
} from './shared';

defineProps<{ meta: FaModuleMeta; focus?: any }>();
defineEmits<{ (e: 'goto', module: string, payload?: any): void }>();
const notif = useNotificationStore();

const small = computed(() => faState.value?.ledgers.find((l) => l.id === faState.value?.activeLedgerId)?.taxpayerType !== 'general');
const now = new Date();
const mode = ref<'month' | 'quarter'>(small.value ? 'quarter' : 'month');
const month = ref(prevMonth());
const year = ref(now.getMonth() < 3 ? now.getFullYear() - 1 : now.getFullYear());
const quarter = ref(now.getMonth() < 3 ? 4 : Math.floor(now.getMonth() / 3));
const period = computed(() => (mode.value === 'month' ? month.value : `${year.value}-Q${quarter.value}`));

const inputs = ref<FaTaxInputs | null>(null);
const ratePct = ref<number[]>([]);
const uninvoicedRatePct = ref(0);
const iitRows = ref<FaIitRow[]>([]);
const monthIndex = ref(now.getMonth() || 1);
const viewId = ref('');
const busy = ref('');
const errors = ref<Record<string, string>>({});
const iitTouched = ref(false);
const checked = ref(false);

const runs = computed(() => faState.value?.data.taxRuns || []);
const run = computed<FaTaxRun | null>(() => runs.value.find((r) => r.id === viewId.value) || null);
watch(uninvoicedRatePct, (v) => { if (inputs.value) inputs.value.uninvoicedRate = (Number(v) || 0) / 100; });

const calcSections = computed<Array<{ title: string; lines: FaCalcLine[] }>>(() => (run.value ? [
  { title: i18nT('增值税'), lines: run.value.result.vat },
  { title: i18nT('附加税费'), lines: run.value.result.surcharges },
  { title: i18nT('企业所得税（季度预缴）'), lines: run.value.result.cit },
] : []));

const metas: StepMeta[] = [
  { key: 'derive', title: i18nT('所属期与取数'), hint: i18nT('从票据与账面数据预填，可逐项改') },
  { key: 'iit', title: i18nT('工资个税'), hint: i18nT('导入工资表，按累计预扣法计算') },
  { key: 'compute', title: i18nT('计算税额'), hint: i18nT('增值税、附加税、企业所得税、个税，每行带公式') },
  { key: 'check', title: i18nT('账税差异与风险预检'), hint: i18nT('账面收入 vs 申报、税负率、进项抵扣异常') },
  { key: 'note', title: i18nT('申报备注'), hint: i18nT('给复核人看的说明，模型只引用算好的数字') },
  { key: 'export', title: i18nT('导出草稿'), hint: i18nT('申报表草稿 + 个税明细 + 风险预检 Excel') },
];
const runtime = computed<Record<string, StepRuntime>>(() => {
  const r = run.value;
  const st = (key: string, done: boolean, summary?: string): StepRuntime => (busy.value === key
    ? { state: 'running' }
    : errors.value[key] ? { state: 'failed', error: errors.value[key] }
      : done ? { state: 'done', summary } : { state: 'todo' });
  return {
    derive: st('derive', !!inputs.value || !!r, i18nT('所属期 {p0}', { p0: period.value })),
    iit: st('iit', iitTouched.value || !!r, i18nT('{n} 人', { n: iitRows.value.length })),
    compute: st('compute', !!r, r ? i18nT('增值税 {a}，附加 {b}，所得税 {c}', { a: fmtMoney(r.result.vatPayable), b: fmtMoney(r.result.surchargeTotal), c: fmtMoney(r.result.citPayable) }) : ''),
    check: st('check', !!r && (checked.value || !r.findings.length), r ? i18nT('{n} 项提示', { n: r.findings.length }) : ''),
    note: st('note', !!r?.note),
    export: st('export', !!r?.exportPath, r?.exportPath),
  };
});
const currentKey = computed(() => metas.find((m) => runtime.value[m.key].state !== 'done')?.key || 'export');

function syncRatePct(): void {
  ratePct.value = (inputs.value?.salesByRate || []).map((g) => Math.round(g.rate * 10000) / 100);
  uninvoicedRatePct.value = Math.round((inputs.value?.uninvoicedRate || 0) * 10000) / 100;
}
function viewRun(r: FaTaxRun): void {
  viewId.value = r.id;
  const q = r.period.match(/^(\d{4})-Q([1-4])$/);
  if (q) { mode.value = 'quarter'; year.value = Number(q[1]); quarter.value = Number(q[2]); } else { mode.value = 'month'; month.value = r.period; }
  inputs.value = JSON.parse(JSON.stringify(r.inputs));
  iitRows.value = JSON.parse(JSON.stringify(r.iitRows || []));
  syncRatePct();
  checked.value = false;
  errors.value = {};
}
function addRate(): void {
  inputs.value?.salesByRate.push({ rate: small.value ? 0.01 : 0.13, amount: 0, tax: 0 });
  syncRatePct();
}
function removeRate(i: number): void {
  inputs.value?.salesByRate.splice(i, 1);
  ratePct.value.splice(i, 1);
}
function addIit(): void {
  iitTouched.value = true;
  iitRows.value.push({ name: '', salary: 0, insurance: 0, special: 0, ytdSalary: 0, ytdInsurance: 0, ytdSpecial: 0, ytdTaxPaid: 0, monthIndex: monthIndex.value });
}

async function run_(key: string, fn: () => Promise<unknown>): Promise<boolean> {
  busy.value = key;
  errors.value = { ...errors.value, [key]: '' };
  void scrollToStep(key);
  try {
    await fn();
    return true;
  } catch (e) {
    errors.value = { ...errors.value, [key]: errorMessage(e) };
    return false;
  } finally {
    busy.value = '';
  }
}
async function derive(): Promise<void> {
  await run_('derive', async () => {
    inputs.value = await fa<FaTaxInputs>('tax.derive', { period: period.value });
    syncRatePct();
    viewId.value = '';
    checked.value = false;
  });
}
async function importPayroll(path: string): Promise<void> {
  await run_('iit', async () => {
    iitRows.value = await fa<FaIitRow[]>('tax.importPayroll', { path, monthIndex: monthIndex.value });
    iitTouched.value = true;
    if (!iitRows.value.length) throw new Error(i18nT('工资表里没有读到人员'));
  });
}
async function compute(): Promise<void> {
  if (!inputs.value) return;
  inputs.value.salesByRate.forEach((g, i) => { g.rate = (Number(ratePct.value[i]) || 0) / 100; });
  const payload = { period: period.value, inputs: inputs.value, iitRows: iitRows.value.filter((r) => r.name) };
  await run_('compute', async () => {
    const r = await fa<FaTaxRun>('tax.compute', payload);
    await refreshState();
    viewId.value = r.id;
    checked.value = false;
  });
}
async function writeNote(): Promise<void> {
  if (!run.value) return;
  const id = run.value.id;
  await run_('note', async () => { await fa('tax.note', { id }); await refreshState(); });
}
async function exportRun(): Promise<void> {
  if (!run.value) return;
  const id = run.value.id;
  await run_('export', async () => { await fa('tax.export', { id }); await refreshState(); });
}
async function removeRun(id: string): Promise<void> {
  if (!window.confirm(i18nT('删除这份申报草稿？'))) return;
  try { await fa('tax.remove', { id }); if (viewId.value === id) viewId.value = ''; await refreshState(); } catch (e) { notif.error(errorMessage(e)); }
}
function openFile(path: string, reveal = false): void {
  openPath(path, reveal).catch((e) => notif.error(errorMessage(e)));
}
function scrollTo(key: string): void { void scrollToStep(key); }
</script>

<style scoped>
.fa-compliance { font-weight: 600; }
.fa-split { display: grid; grid-template-columns: minmax(200px, 250px) 1fr; gap: 14px; align-items: start; }
@media (max-width: 960px) { .fa-split { grid-template-columns: 1fr; } }
.fa-list { display: grid; gap: 8px; border: 1px solid var(--color-border); border-radius: 14px; background: var(--color-bg-card); padding: 10px; position: sticky; top: 0; max-height: calc(100vh - 160px); overflow: hidden; grid-template-rows: auto 1fr; }
.fa-list ul { list-style: none; margin: 0; padding: 0; display: grid; gap: 6px; overflow-y: auto; align-content: start; }
.fa-list li { padding: 8px 10px; border-radius: 10px; border: 1px solid transparent; cursor: pointer; display: grid; gap: 3px; background: var(--color-bg-primary); }
.fa-list li.active { border-color: var(--color-brand); background: color-mix(in srgb, var(--color-brand) 8%, var(--color-bg-card)); }
.fa-list__top { display: flex; justify-content: space-between; gap: 6px; align-items: center; font-size: 13px; }
.fa-list__meta { display: flex; gap: 8px; font-size: 11px; color: var(--color-text-secondary); align-items: center; flex-wrap: wrap; }
.fa-detail { display: grid; gap: 12px; min-width: 0; }
.fa-seg { display: inline-flex; border: 1px solid var(--color-border); border-radius: 9px; overflow: hidden; }
.fa-seg button { border: none; background: transparent; padding: 6px 12px; font: inherit; font-size: 12.5px; cursor: pointer; color: var(--color-text-secondary); }
.fa-seg button.active { background: var(--color-brand); color: #fff; }
.fa-input { height: 32px; border-radius: 8px; border: 1px solid var(--color-border); background: var(--color-bg-input, var(--color-bg-primary)); color: var(--color-text-primary); padding: 0 8px; font: inherit; font-size: 12.5px; }
.fa-year { width: 90px; }
.fa-edit input { width: 100%; box-sizing: border-box; min-width: 70px; }
.fa-check { flex-direction: row !important; align-items: center; gap: 6px; }
.fa-small { max-width: 220px; }
.fa-wrap { white-space: normal !important; }
.fa-finding { border: 1px solid var(--color-border); border-radius: 12px; padding: 8px 12px; display: grid; gap: 4px; }
.fa-finding.high { border-color: color-mix(in srgb, var(--color-danger) 50%, var(--color-border)); }
.fa-finding.warn { border-color: color-mix(in srgb, var(--color-warning) 50%, var(--color-border)); }
.fa-finding__head { display: flex; gap: 8px; align-items: center; font-size: 13px; }
.fa-pre { margin: 0; white-space: pre-wrap; font-size: 12.5px; color: var(--color-text-secondary); }
.fa-sugg { margin: 0; font-size: 12.5px; }
.fa-sugg i { color: var(--color-warning); margin-inline-end: 4px; }
.fa-note { white-space: pre-wrap; font-size: 13px; line-height: 1.65; padding: 10px 12px; border-radius: 10px; background: var(--color-bg-primary); }
.fa-path { flex: 1; min-width: 200px; font-size: 12px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; color: var(--color-text-secondary); }
</style>
