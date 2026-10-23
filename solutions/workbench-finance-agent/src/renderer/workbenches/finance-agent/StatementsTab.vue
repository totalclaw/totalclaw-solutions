<template>
  <div class="ss-module">
    <ModuleHeader :meta="meta" />

    <div class="fa-split">
      <aside class="fa-list">
        <div class="ss-subhead">{{ $t('已生成的报表') }}</div>
        <ul>
          <li v-for="s in history" :key="s.id" :class="{ active: s.id === selectedId }" @click="selectedId = s.id">
            <div class="fa-list__top">
              <strong>{{ s.period }}</strong>
              <span class="ss-chip" :class="s.checks.some((c) => c.level === 'error') ? 'bad' : 'ok'">{{ s.checks.some((c) => c.level === 'error') ? $t('勾稽不平') : $t('勾稽通过') }}</span>
            </div>
            <div class="fa-list__meta">
              <span>{{ s.source === 'balances' ? $t('按科目余额表') : $t('按凭证') }}</span>
              <button type="button" class="ss-link" @click.stop="remove(s.id)">{{ $t('删除') }}</button>
            </div>
          </li>
          <li v-if="!history.length" class="ss-empty">{{ $t('还没有生成报表') }}</li>
        </ul>
      </aside>

      <section class="fa-detail">
        <StickyProgress :title="$t('财务报表')" :metas="metas" :runtime="runtime" :current-key="currentKey" @jump="jump" />
        <div class="ss-steps">
          <StepCard step-key="stm-source" :index="0" :title="metas[0].title" :hint="metas[0].hint" :runtime="runtime['stm-source']">
            <DataSourcePanel />
            <div class="ss-grid">
              <label class="ss-field"><span>{{ $t('取数来源') }}</span>
                <select v-model="form.source">
                  <option value="balances">{{ $t('导入的科目余额表') }}</option>
                  <option value="vouchers">{{ $t('本工作台已审核凭证 + 序时账') }}</option>
                </select>
              </label>
              <label v-if="form.source === 'balances'" class="ss-field"><span>{{ $t('期间') }}</span>
                <select v-model="form.period">
                  <option value="">{{ $t('选择已导入的期间') }}</option>
                  <option v-for="b in balances" :key="b.period" :value="b.period">{{ b.period }}</option>
                </select>
              </label>
              <label v-else class="ss-field"><span>{{ $t('月份') }}</span><input v-model="form.period" type="month" /></label>
            </div>
            <p v-if="form.source === 'balances' && !balances.length" class="ss-note warn"><i class="ri-information-line"></i>{{ $t('还没有导入科目余额表：在上面的数据对接里导入，或改用「本工作台已审核凭证」') }}</p>
          </StepCard>

          <StepCard step-key="stm-build" :index="1" :title="metas[1].title" :hint="metas[1].hint" :runtime="runtime['stm-build']">
            <div class="ss-actions">
              <button type="button" class="ss-btn primary" :disabled="!!busy || !form.period" @click="build">
                <i :class="busy === 'stm-build' ? 'ri-loader-4-line spin' : 'ri-file-chart-line'"></i>{{ $t('生成三大报表') }}
              </button>
              <span class="ss-muted">{{ $t('按一级科目名称取数，小企业会计准则与企业会计准则都能认') }}</span>
            </div>
          </StepCard>

          <StepCard step-key="stm-view" :index="2" :title="metas[2].title" :hint="metas[2].hint" :runtime="runtime['stm-view']">
            <template v-if="current">
              <nav class="fa-sub">
                <button v-for="t in reportTabs" :key="t.key" type="button" class="fa-sub__btn" :class="{ active: report === t.key }" @click="report = t.key">{{ t.label }}</button>
              </nav>
              <div class="ss-table-wrap">
                <table class="ss-table">
                  <thead><tr><th>{{ $t('项目') }}</th><th class="num">{{ report === 'balanceSheet' ? $t('期末余额') : $t('本期金额') }}</th><th class="num">{{ report === 'balanceSheet' ? $t('期初余额') : $t('上期金额') }}</th></tr></thead>
                  <tbody>
                    <tr v-for="l in lines" :key="l.key" :class="{ total: l.bold }" :title="l.source || ''">
                      <td :style="{ paddingInlineStart: `${10 + (l.indent || 0) * 16}px` }">{{ l.label }}</td>
                      <td class="num">{{ fmtMoney(l.current) }}</td>
                      <td class="num">{{ l.prior == null ? '—' : fmtMoney(l.prior) }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </template>
            <p v-else class="ss-muted">{{ $t('生成后在这里查看') }}</p>
          </StepCard>

          <StepCard step-key="stm-check" :index="3" :title="metas[3].title" :hint="metas[3].hint" :runtime="runtime['stm-check']">
            <ul v-if="current" class="fa-checks">
              <li v-for="(c, i) in current.checks" :key="i" :class="c.level">
                <i :class="c.level === 'ok' ? 'ri-checkbox-circle-line' : c.level === 'error' ? 'ri-close-circle-line' : 'ri-error-warning-line'"></i>
                <span>{{ c.message }}</span>
              </li>
            </ul>
          </StepCard>

          <StepCard step-key="stm-analyze" :index="4" :title="metas[4].title" :hint="metas[4].hint" :runtime="runtime['stm-analyze']">
            <div class="ss-actions">
              <button type="button" class="ss-btn primary" :disabled="!!busy || !current" @click="analyze">
                <i :class="busy === 'stm-analyze' ? 'ri-loader-4-line spin' : 'ri-quill-pen-line'"></i>{{ current?.analysis ? $t('重新分析') : $t('生成经营简要分析') }}
              </button>
              <span v-if="current?.model" class="ss-muted">{{ $t('由 {p0} 撰写，数字全部取自报表', { p0: modelLabel(current.model) }) }}</span>
            </div>
            <div v-if="current?.analysis" class="fa-text">{{ current.analysis }}</div>
          </StepCard>

          <StepCard step-key="stm-export" :index="5" :title="metas[5].title" :hint="metas[5].hint" :runtime="runtime['stm-export']">
            <div class="ss-actions">
              <button type="button" class="ss-btn primary" :disabled="!!busy || !current" @click="exportIt">
                <i :class="busy === 'stm-export' ? 'ri-loader-4-line spin' : 'ri-download-2-line'"></i>{{ $t('导出 Excel') }}
              </button>
              <template v-if="current?.exportPath">
                <code class="fa-out">{{ current.exportPath }}</code>
                <button type="button" class="ss-link" @click="open(current.exportPath)">{{ $t('打开') }}</button>
                <button type="button" class="ss-link" @click="open(current.exportPath, true)">{{ $t('所在文件夹') }}</button>
              </template>
            </div>
            <p class="ss-muted">{{ $t('三张报表 + 勾稽校验在一个 Excel 里；有经营分析时另存一份 Markdown。') }}</p>
          </StepCard>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * 财务报表：选数据来源 → 生成三大报表 → 查看 → 勾稽校验 → 经营简要分析 → 导出。
 */
import { computed, reactive, ref, watch } from 'vue';
import type { FaStatementRun } from '@totalclaw/ipc-contracts';
import { useNotificationStore } from '../../stores/notification';
import { t as i18nT } from '../../i18n';
import StepCard from '../service-settlement/StepCard.vue';
import StickyProgress from '../service-settlement/StickyProgress.vue';
import ModuleHeader from './ModuleHeader.vue';
import DataSourcePanel from './DataSourcePanel.vue';
import {
  errorMessage, fa, faState, fmtMoney, modelLabel, openPath, prevMonth, refreshState, scrollToStep,
  type FaModuleMeta, type StepMeta, type StepRuntime,
} from './shared';

defineProps<{ meta: FaModuleMeta; focus?: any }>();
defineEmits<{ (e: 'goto', module: string, payload?: any): void }>();
const notif = useNotificationStore();

const history = computed(() => faState.value?.data.statements || []);
const balances = computed(() => faState.value?.data.balances || []);
const selectedId = ref('');
const current = computed<FaStatementRun | null>(() => history.value.find((s) => s.id === selectedId.value) || null);
watch(history, (l) => { if (!selectedId.value && l.length) selectedId.value = l[0].id; }, { immediate: true });

const form = reactive<{ source: 'balances' | 'vouchers'; period: string }>({ source: 'balances', period: '' });
watch(balances, (b) => {
  if (!b.length && form.source === 'balances' && !form.period) { form.source = 'vouchers'; form.period = prevMonth(); }
  else if (b.length && form.source === 'balances' && !form.period) form.period = b[0].period;
}, { immediate: true });
watch(() => form.source, (s) => { form.period = s === 'balances' ? (balances.value[0]?.period || '') : (form.period || prevMonth()); });

const report = ref<'balanceSheet' | 'income' | 'cashflow'>('balanceSheet');
const reportTabs = computed(() => [
  { key: 'balanceSheet' as const, label: i18nT('资产负债表') },
  { key: 'income' as const, label: i18nT('利润表') },
  { key: 'cashflow' as const, label: i18nT('现金流量表') },
]);
const lines = computed(() => (current.value ? current.value[report.value] : []));

const busy = ref('');
const errors = ref<Record<string, string>>({});
const metas: StepMeta[] = [
  { key: 'stm-source', title: i18nT('数据来源'), hint: i18nT('导入科目余额表，或用本工作台审核过的凭证') },
  { key: 'stm-build', title: i18nT('生成报表'), hint: i18nT('资产负债表、利润表、现金流量表') },
  { key: 'stm-view', title: i18nT('查看报表'), hint: i18nT('本期与期初 / 上期对比') },
  { key: 'stm-check', title: i18nT('勾稽校验'), hint: i18nT('资产 = 负债 + 权益、试算平衡、净利润与未分配利润、现金变动') },
  { key: 'stm-analyze', title: i18nT('经营简要分析'), hint: i18nT('营收、毛利、费用波动说明') },
  { key: 'stm-export', title: i18nT('导出'), hint: i18nT('Excel + Markdown') },
];
function st(key: string, done: boolean, summary?: string): StepRuntime {
  return busy.value === key ? { state: 'running' } : errors.value[key] ? { state: 'failed', error: errors.value[key] } : done ? { state: 'done', summary } : { state: 'todo' };
}
const runtime = computed<Record<string, StepRuntime>>(() => {
  const c = current.value;
  const errs = c ? c.checks.filter((x) => x.level === 'error').length : 0;
  return {
    'stm-source': st('stm-source', !!form.period, form.period),
    'stm-build': st('stm-build', !!c, c?.period),
    'stm-view': st('stm-view', !!c),
    'stm-check': c && errs ? { state: 'failed', error: i18nT('{n} 项勾稽不通过', { n: errs }) } : st('stm-check', !!c, c ? i18nT('全部通过') : ''),
    'stm-analyze': st('stm-analyze', !!c?.analysis),
    'stm-export': st('stm-export', !!c?.exportPath),
  };
});
const currentKey = computed(() => metas.find((m) => runtime.value[m.key].state !== 'done')?.key || 'stm-export');

async function run(key: string, fn: () => Promise<unknown>): Promise<void> {
  busy.value = key;
  errors.value = { ...errors.value, [key]: '' };
  void scrollToStep(key);
  try { await fn(); await refreshState(); } catch (e) { errors.value = { ...errors.value, [key]: errorMessage(e) }; } finally { busy.value = ''; }
}
async function build(): Promise<void> {
  await run('stm-build', async () => {
    const r = await fa<FaStatementRun>('stmt.build', { period: form.period, source: form.source });
    selectedId.value = r.id;
  });
  if (current.value) void scrollToStep('stm-view');
}
async function analyze(): Promise<void> { if (current.value) await run('stm-analyze', () => fa('stmt.analyze', { id: current.value!.id })); }
async function exportIt(): Promise<void> { if (current.value) await run('stm-export', () => fa('stmt.export', { id: current.value!.id })); }
async function remove(id: string): Promise<void> {
  if (!window.confirm(i18nT('删除这份报表？'))) return;
  try { await fa('stmt.remove', { id }); if (selectedId.value === id) selectedId.value = ''; await refreshState(); } catch (e) { notif.error(errorMessage(e)); }
}
function open(path: string, reveal = false): void { openPath(path, reveal).catch((e) => notif.error(errorMessage(e))); }
function jump(key: string): void { void scrollToStep(key); }
</script>

<style scoped>
.fa-split { display: grid; grid-template-columns: minmax(200px, 250px) 1fr; gap: 14px; align-items: start; }
@media (max-width: 960px) { .fa-split { grid-template-columns: 1fr; } }
.fa-list { display: grid; gap: 8px; border: 1px solid var(--color-border); border-radius: var(--radius-6); background: var(--color-bg-card); padding: 10px; position: sticky; top: 0; max-height: calc(100vh - 160px); overflow: hidden; grid-template-rows: auto 1fr; }
.fa-list ul { list-style: none; margin: 0; padding: 0; display: grid; gap: 6px; overflow-y: auto; align-content: start; }
.fa-list li { padding: 8px 10px; border-radius: var(--radius-4); border: 1px solid transparent; cursor: pointer; display: grid; gap: 3px; background: var(--color-bg-primary); }
.fa-list li.active { border-color: var(--color-brand); background: color-mix(in srgb, var(--color-brand) 8%, var(--color-bg-card)); }
.fa-list__top { display: flex; justify-content: space-between; gap: 6px; align-items: center; font-size: var(--font-size-md); }
.fa-list__meta { display: flex; gap: 8px; font-size: var(--font-size-xs); color: var(--color-text-secondary); align-items: center; justify-content: space-between; }
.fa-detail { display: grid; gap: 12px; min-width: 0; }
.fa-sub { display: flex; gap: 6px; flex-wrap: wrap; }
.fa-sub__btn { padding: 5px 12px; border-radius: var(--radius-pill); border: 1px solid var(--color-border); background: var(--color-bg-card); color: var(--color-text-secondary); cursor: pointer; font: inherit; font-size: 12.5px; font-weight: 600; }
.fa-sub__btn.active { border-color: var(--color-brand); color: var(--color-brand); background: color-mix(in srgb, var(--color-brand) 8%, var(--color-bg-card)); }
.fa-checks { list-style: none; margin: 0; padding: 0; display: grid; gap: 6px; font-size: 12.5px; }
.fa-checks li { display: flex; gap: 6px; align-items: flex-start; }
.fa-checks li.ok i { color: var(--color-success); }
.fa-checks li.warn i { color: var(--color-warning); }
.fa-checks li.error i { color: var(--color-danger); }
.fa-text { white-space: pre-wrap; font-size: var(--font-size-md); line-height: 1.7; padding: 12px 14px; border-radius: var(--radius-4); background: var(--color-bg-primary); border: 1px solid var(--color-border); }
.fa-out { font-size: 11.5px; color: var(--color-text-secondary); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 420px; }
.spin { animation: fa-spin 1s linear infinite; }
@keyframes fa-spin { to { transform: rotate(360deg); } }
</style>
