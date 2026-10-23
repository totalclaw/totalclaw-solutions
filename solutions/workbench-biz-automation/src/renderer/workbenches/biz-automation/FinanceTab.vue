<template>
  <div class="ss-module">
    <ModuleHeader module-key="finance" icon="ri-line-chart-line" :title="$t('经营数据调取与统计')"
      :ability="$t('导入收银系统 / 网店导出的销售明细与费用表（只读）→ 按固定口径算营业额、毛利、客单价、连带率、售罄率 → 模型只写解读，解读里的数字逐个回原数据核对 → 推送、导出')"
      :output="$t('经营日报 / 周报 / 月报、Excel 报表、随时问数；数字全部由规则计算')" />

    <StickyProgress :title="$t('经营数据')" :metas="metas" :runtime="runtime" :current-key="currentKey" @jump="jump" />
    <div class="ss-steps">
      <StepCard step-key="f-sales" :index="0" :title="metas[0].title" :hint="metas[0].hint" :runtime="runtime['f-sales']" :is-current="currentKey === 'f-sales'">
        <div class="ss-actions">
          <button type="button" class="ss-btn primary" :disabled="!!busy" @click="importFile('sales')"><i class="ri-file-excel-2-line"></i>{{ $t('导入销售明细') }}</button>
          <span class="ss-muted">{{ $t('已有 {n} 行。列：日期、单号、商品 / 货号、品类、数量、实收金额、成本（可选）、渠道（可选）；同一日期段重复导入会覆盖', { n: state?.salesRows || 0 }) }}</span>
          <button v-if="state?.salesRows" type="button" class="ss-link" @click="clear('sales')">{{ $t('清空') }}</button>
        </div>
        <div class="ss-actions">
          <button type="button" class="ss-btn sm" :disabled="!!busy" @click="folderPull"><i class="ri-folder-received-line"></i>{{ $t('从共享文件夹取数') }}</button>
          <span class="ss-muted">{{ $t('文件夹在「设置」里配置；定时取数在「定时与联动」里打开') }}</span>
        </div>
        <p v-for="r in pullResult" :key="r.kind" class="ss-note" :class="r.ok ? 'ok' : 'danger'"><i :class="r.ok ? 'ri-check-line' : 'ri-error-warning-line'"></i>{{ $t('{p0} {p1}：{p2}', { p0: r.kind, p1: r.file || '', p2: r.note }) }}</p>
        <p class="ss-muted">{{ $t('取数方式：收银系统（秦丝、有赞零售、管家婆等）后台导出 Excel；有开放接口或数据库的，可在「数据查询」里配数据源后导出同样的表。只读，不改原系统。') }}</p>
        <ImportList :items="imports.filter((i) => i.kind === 'sales')" />
      </StepCard>

      <StepCard step-key="f-expense" :index="1" :title="metas[1].title" :hint="metas[1].hint" :runtime="runtime['f-expense']" :is-current="currentKey === 'f-expense'">
        <div class="ss-actions">
          <button type="button" class="ss-btn" :disabled="!!busy" @click="importFile('expense')"><i class="ri-file-excel-2-line"></i>{{ $t('导入费用表') }}</button>
          <button type="button" class="ss-btn ghost sm" @click="skipExpense = true">{{ $t('没有，跳过') }}</button>
          <span class="ss-muted">{{ $t('已有 {n} 行。列：日期 / 月份、费用项目、金额（房租、工资、水电、推广等）', { n: state?.expenseRows || 0 }) }}</span>
        </div>
        <ImportList :items="imports.filter((i) => i.kind === 'expense')" />
      </StepCard>

      <StepCard step-key="f-metrics" :index="2" :title="metas[2].title" :hint="metas[2].hint" :runtime="runtime['f-metrics']" :is-current="currentKey === 'f-metrics'">
        <div class="ss-actions">
          <label class="ss-field"><span>{{ $t('开始') }}</span><input v-model="from" type="date" /></label>
          <label class="ss-field"><span>{{ $t('结束') }}</span><input v-model="to" type="date" /></label>
          <button type="button" class="ss-btn primary" :disabled="!!busy || !state?.salesRows" @click="calc"><i class="ri-calculator-line"></i>{{ $t('计算') }}</button>
        </div>
        <template v-if="metrics">
          <div class="ss-kpis">
            <div class="ss-kpi accent"><small>{{ $t('净营业额') }}</small><strong>{{ fmtMoney(metrics.netRevenue) }}</strong><small v-if="metrics.prev">{{ delta(metrics.netRevenue, metrics.prev.revenue) }}</small></div>
            <div class="ss-kpi"><small>{{ $t('毛利') }}</small><strong>{{ fmtMoney(metrics.grossProfit) }}</strong><small>{{ $t('毛利率 {p0}', { p0: fmtPct(metrics.grossMargin, 1) }) }}</small></div>
            <div class="ss-kpi"><small>{{ $t('订单') }}</small><strong>{{ metrics.orders }}</strong></div>
            <div class="ss-kpi"><small>{{ $t('客单价') }}</small><strong>{{ fmtMoney(metrics.avgOrderValue) }}</strong></div>
            <div class="ss-kpi"><small>{{ $t('连带率') }}</small><strong>{{ metrics.unitsPerOrder }}</strong></div>
            <div class="ss-kpi"><small>{{ $t('费用') }}</small><strong>{{ fmtMoney(metrics.expenses) }}</strong><small>{{ $t('费用率 {p0}', { p0: fmtPct(metrics.expenseRate, 1) }) }}</small></div>
            <div class="ss-kpi"><small>{{ $t('净利润') }}</small><strong>{{ fmtMoney(metrics.netProfit) }}</strong></div>
            <div class="ss-kpi"><small>{{ $t('库存周转天数') }}</small><strong>{{ metrics.turnoverDays ?? '—' }}</strong><small v-if="metrics.inventoryValue != null">{{ $t('库存金额约 {p0}', { p0: fmtMoney(metrics.inventoryValue) }) }}</small></div>
          </div>
          <p v-if="metrics.lastDataDay && metrics.lastDataDay < to" class="ss-note warn"><i class="ri-time-line"></i>{{ $t('销售数据只到 {p0}，之后的日期还没取到数据', { p0: metrics.lastDataDay }) }}</p>
          <div v-if="metrics.daily.length > 1" class="ba-trend" :title="$t('每日净营业额')">
            <i v-for="d in metrics.daily" :key="d.day" :style="{ height: `${Math.max(2, (Math.max(0, d.netRevenue) / trendMax) * 100)}%` }" :title="`${d.day}：${fmtMoney(d.netRevenue)}`"></i>
          </div>
          <p v-if="metrics.costCoverage < 1" class="ss-note warn"><i class="ri-information-line"></i>{{ $t('只有 {p0} 的销售带成本，毛利按带成本的部分计算；导入带「成本」列的明细后更准', { p0: fmtPct(metrics.costCoverage, 0) }) }}</p>
          <div class="ba-blocks">
            <div v-for="b in blocks" :key="b.title" class="ba-block">
              <strong>{{ b.title }}</strong>
              <p v-if="!b.rows.length" class="ss-muted">—</p>
              <div v-for="r in b.rows" :key="r.key" class="ba-bar">
                <span>{{ r.label }}</span>
                <i :style="{ width: `${Math.max(2, (b.pct ? r.value : (r.share ?? 0)) * 100)}%` }"></i>
                <b>{{ b.pct ? fmtPct(r.value, 0) : fmtMoney(r.value) }}</b>
              </div>
            </div>
          </div>
          <div class="ss-actions"><span class="ss-subhead">{{ $t('款式排行') }}</span>
            <select v-model="sortKey" class="ba-mini"><option value="amount">{{ $t('按销售额') }}</option><option value="qty">{{ $t('按销量') }}</option><option value="grossProfit">{{ $t('按毛利') }}</option><option value="sellThrough">{{ $t('按售罄率') }}</option></select>
          </div>
          <div class="ss-table-wrap ba-scroll">
            <table class="ss-table">
              <thead><tr><th>{{ $t('商品') }}</th><th class="num">{{ $t('销量') }}</th><th class="num">{{ $t('销售额') }}</th><th class="num">{{ $t('毛利') }}</th><th class="num">{{ $t('售罄率') }}</th></tr></thead>
              <tbody><tr v-for="r in sortedItems" :key="r.key"><td>{{ r.label }}</td><td class="num">{{ r.qty }}</td><td class="num">{{ fmtMoney(r.amount) }}</td><td class="num">{{ r.grossProfit == null ? '—' : fmtMoney(r.grossProfit) }}</td><td class="num">{{ r.sellThrough == null ? '—' : fmtPct(r.sellThrough, 0) }}</td></tr></tbody>
            </table>
          </div>
          <template v-if="metrics.slowMovers.length">
            <span class="ss-subhead">{{ $t('滞销清单（有库存、本期卖出不超过 1 件）') }}</span>
            <div class="ba-slow"><span v-for="x in metrics.slowMovers" :key="x.key" class="ss-chip warn">{{ x.label }} · {{ $t('库存 {a}，卖出 {b}', { a: x.stock, b: x.qty }) }}</span></div>
          </template>
        </template>
      </StepCard>

      <StepCard step-key="f-report" :index="3" :title="metas[3].title" :hint="metas[3].hint" :runtime="runtime['f-report']" :is-current="currentKey === 'f-report'">
        <div class="ss-actions">
          <button v-for="k in KINDS" :key="k" type="button" class="ss-btn sm" :class="{ primary: k === 'daily' }" :disabled="!!busy || !state?.salesRows" @click="report(k)">{{ kindLabel(k) }}</button>
          <button type="button" class="ss-btn sm ghost" :disabled="!!busy || !state?.salesRows || !from || !to" @click="report('custom')">{{ $t('按上面选的期间') }}</button>
        </div>
        <div v-if="current" class="ba-report">
          <header><strong>{{ kindLabel(current.kind) }} · {{ current.metrics.from }} ~ {{ current.metrics.to }}</strong><span class="ss-muted">{{ current.model ? $t('解读由 {p0} 撰写', { p0: modelLabel(current.model) }) : '' }}</span></header>
          <p v-if="current.staleNote" class="ss-note warn"><i class="ri-time-line"></i>{{ current.staleNote }}</p>
          <pre>{{ current.commentary }}</pre>
          <p v-if="current.unverified.length" class="ss-note danger"><i class="ri-error-warning-line"></i>{{ $t('这些数字在数据里找不到来源，请核对后再发：{p0}', { p0: current.unverified.join('、') }) }}</p>
          <p v-else-if="current.model" class="ss-note ok"><i class="ri-check-double-line"></i>{{ $t('解读里的数字都已回原数据核对') }}</p>
        </div>
        <div v-if="reports.length > 1" class="ba-history">
          <span class="ss-muted">{{ $t('历史报表') }}</span>
          <button v-for="r in reports.slice(0, 8)" :key="r.id" type="button" class="ss-chip" :class="{ brand: r.id === current?.id }" @click="currentReportId = r.id">{{ kindLabel(r.kind) }} {{ r.metrics.from }}</button>
        </div>
      </StepCard>

      <StepCard step-key="f-push" :index="4" :title="metas[4].title" :hint="metas[4].hint" :runtime="runtime['f-push']" :is-current="currentKey === 'f-push'">
        <template v-if="current">
          <div class="ss-actions">
            <button type="button" class="ss-btn primary" :disabled="!!busy || !state?.ready.push" @click="push"><i class="ri-send-plane-line"></i>{{ $t('推送') }}</button>
            <button type="button" class="ss-btn" :disabled="!!busy" @click="exportIt"><i class="ri-download-2-line"></i>{{ $t('导出 Excel') }}</button>
            <button type="button" class="ss-btn" :disabled="!!busy" @click="exportPdf"><i class="ri-file-pdf-2-line"></i>{{ $t('导出 PDF') }}</button>
            <button type="button" class="ss-btn sm ghost" @click="copyText"><i class="ri-file-copy-line"></i>{{ $t('复制文字版') }}</button>
            <button type="button" class="ss-btn sm ghost" :disabled="!!busy" @click="toFinance"><i class="ri-calculator-line"></i>{{ $t('转入财务智能体') }}</button>
            <button v-if="current.exportPath" type="button" class="ss-link" @click="openPath(current.exportPath, true)">{{ $t('所在文件夹') }}</button>
          </div>
          <p v-if="!state?.ready.push" class="ss-muted">{{ $t('推送渠道在「设置 → 通知与推送」配置（企业微信 / 钉钉机器人、邮箱）') }}</p>
          <div v-if="current.pushed?.length" class="ss-actions"><span v-for="p in current.pushed" :key="p.channel" class="ss-chip" :class="p.ok ? 'ok' : 'bad'" :title="p.error">{{ p.channel }} <i :class="p.ok ? 'ri-check-line' : 'ri-close-line'"></i></span></div>
        </template>
      </StepCard>

      <StepCard step-key="f-qa" :index="5" :title="metas[5].title" :hint="metas[5].hint" :runtime="runtime['f-qa']" :is-current="currentKey === 'f-qa'">
        <form class="ba-ask" @submit.prevent="ask">
          <input v-model="question" type="text" :placeholder="$t('例如：上个月连衣裙卖了多少？哪个渠道毛利最高？')" />
          <button type="submit" class="ss-btn primary" :disabled="!!busy || !question.trim() || !state?.salesRows"><i class="ri-question-answer-line"></i>{{ $t('提问') }}</button>
        </form>
        <div v-for="(q, i) in (state?.qa || []).slice(0, 6)" :key="i" class="ba-qa">
          <b>{{ q.q }}</b>
          <pre>{{ q.a }}</pre>
          <small class="ss-muted">{{ fmtDateTime(q.at) }} · {{ modelLabel(q.model) }}</small>
        </div>
      </StepCard>
    </div>
  </div>
</template>

<script setup lang="ts">
/** 模块 D：导入销售 → 导入费用 → 指标 → 报表（解读 + 回核）→ 推送 / 导出 → 问数。 */
import { computed, defineComponent, h, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import type { BaImport, BaMetrics, BaReport } from '@totalclaw/ipc-contracts';
import { useNotificationStore } from '../../stores/notification';
import { t as i18nT } from '../../i18n';
import StepCard from '../service-settlement/StepCard.vue';
import StickyProgress from '../service-settlement/StickyProgress.vue';
import ModuleHeader from './ModuleHeader.vue';
import { ba, baState, errorMessage, fmtDateTime, fmtMoney, fmtPct, modelLabel, openPath, pickFiles, refreshState, scrollToStep, type StepMeta, type StepRuntime } from './shared';

/** 导入记录小列表 */
const ImportList = defineComponent({
  props: { items: { type: Array as () => BaImport[], required: true } },
  setup(p) {
    return () => (p.items.length
      ? h('ul', { class: 'ba-imports' }, p.items.slice(0, 5).map((i) => h('li', {}, i18nT('{p0}：{a} ~ {b}，{n} 行（跳过 {m} 行）· 识别列 {c}', { p0: i.file, a: i.from, b: i.to, n: i.rows, m: i.skipped, c: Object.values(i.mapping).join(' / ') }))))
      : null);
  },
});

const notif = useNotificationStore();
const router = useRouter();
const state = baState;
const KINDS: Array<'daily' | 'weekly' | 'monthly'> = ['daily', 'weekly', 'monthly'];
const imports = computed(() => state.value?.imports || []);
const reports = computed<BaReport[]>(() => state.value?.reports || []);
const currentReportId = ref('');
const current = computed(() => reports.value.find((r) => r.id === currentReportId.value) || reports.value[0] || null);
const from = ref('');
const to = ref('');
const metrics = ref<BaMetrics | null>(null);
const skipExpense = ref(false);
const question = ref('');
const busy = ref('');
const errors = ref<Record<string, string>>({});
onMounted(async () => {
  const r = await ba<{ from: string; to: string }>('finance.range').catch(() => ({ from: '', to: '' }));
  if (r.to) { to.value = r.to; const d = new Date(`${r.to}T00:00:00`); d.setDate(d.getDate() - 29); from.value = d.toISOString().slice(0, 10) < r.from ? r.from : d.toISOString().slice(0, 10); }
});

const metas: StepMeta[] = [
  { key: 'f-sales', title: i18nT('导入销售数据'), hint: i18nT('收银系统 / 网店导出的销售明细（只读）') },
  { key: 'f-expense', title: i18nT('导入费用'), hint: i18nT('房租、工资、水电、推广等，可跳过') },
  { key: 'f-metrics', title: i18nT('经营指标'), hint: i18nT('营业额、毛利、客单价、连带率、费用率、售罄率') },
  { key: 'f-report', title: i18nT('生成报表'), hint: i18nT('日报 / 周报 / 月报；解读里的数字回原数据核对') },
  { key: 'f-push', title: i18nT('推送与导出'), hint: i18nT('企业微信 / 钉钉 / 邮件，或导出 Excel') },
  { key: 'f-qa', title: i18nT('随时问数'), hint: i18nT('用大白话问，回答注明期间与口径') },
];
function st(key: string, done: boolean, summary?: string): StepRuntime {
  if (busy.value === key) return { state: 'running' };
  if (errors.value[key]) return { state: 'failed', error: errors.value[key] };
  return done ? { state: 'done', summary } : { state: 'todo' };
}
const runtime = computed<Record<string, StepRuntime>>(() => ({
  'f-sales': st('f-sales', (state.value?.salesRows || 0) > 0, i18nT('{n} 行', { n: state.value?.salesRows || 0 })),
  'f-expense': st('f-expense', (state.value?.expenseRows || 0) > 0 || skipExpense.value, state.value?.expenseRows ? i18nT('{n} 行', { n: state.value.expenseRows }) : i18nT('已跳过')),
  'f-metrics': st('f-metrics', !!metrics.value || reports.value.length > 0),
  'f-report': st('f-report', !!current.value, current.value ? `${current.value.metrics.from} ~ ${current.value.metrics.to}` : ''),
  'f-push': st('f-push', !!current.value && (!!current.value.pushed?.some((p) => p.ok) || !!current.value.exportPath)),
  'f-qa': st('f-qa', (state.value?.qa.length || 0) > 0),
}));
const currentKey = computed(() => metas.find((m) => runtime.value[m.key].state !== 'done')?.key || 'f-qa');

const blocks = computed(() => {
  const m = metrics.value;
  if (!m) return [];
  return [
    { title: i18nT('渠道'), rows: m.byChannel.slice(0, 6), pct: false },
    { title: i18nT('品类'), rows: m.byCategory.slice(0, 6), pct: false },
    { title: i18nT('畅销款'), rows: m.topItems.slice(0, 6).map((r) => ({ ...r, share: m.netRevenue ? r.value / m.netRevenue : 0 })), pct: false },
    { title: i18nT('售罄率'), rows: m.sellThrough.slice(0, 6), pct: true },
  ];
});
const sortKey = ref<'amount' | 'qty' | 'grossProfit' | 'sellThrough'>('amount');
const sortedItems = computed(() => [...(metrics.value?.items || [])].sort((a, b) => ((b[sortKey.value] ?? -1) as number) - ((a[sortKey.value] ?? -1) as number)).slice(0, 30));
const trendMax = computed(() => Math.max(1, ...(metrics.value?.daily.map((d) => d.netRevenue) || [1])));
const pullResult = ref<Array<{ kind: string; file?: string; ok: boolean; note: string }>>([]);
async function folderPull(): Promise<void> {
  await run('f-sales', async () => {
    pullResult.value = await ba('finance.folderImport');
    if (!pullResult.value.length) throw new Error(i18nT('还没有配置共享文件夹：到「设置 → 共享文件夹取数」选择'));
  });
}
async function exportPdf(): Promise<void> {
  if (!current.value) return;
  await run('f-push', async () => { const f = await ba<string>('finance.exportPdf', { id: current.value!.id }); await openPath(f, true); });
}
/** 汇总成序时账草稿 → 导入财务智能体当前账套（含税金额，价税分离在财务智能体里复核） */
async function toFinance(): Promise<void> {
  if (!current.value) return;
  if (!window.confirm(i18nT('把 {a} ~ {b} 的营业额、成本、费用汇总成序时账草稿，导入财务智能体当前账套？金额为含税，价税分离与科目请在财务智能体里复核。', { a: current.value.metrics.from, b: current.value.metrics.to }))) return;
  const ok = await run('f-push', async () => {
    const file = await ba<string>('finance.toJournal', { id: current.value!.id });
    const api = (window as any).electronAPI;
    const fa = api?.workbenches?.financeAgent;
    const notReady = new Error(i18nT('财务智能体未开通，序时账已导出：{p0}', { p0: file }));
    // 财务智能体是独立方案：接口由它的主进程注册，preload 上的 invoke 一直在。先确保它已开通并装上
    // （没装按需安装；用户卸载过 / 未开通就不装），装不上或接口还没注册都给出导出路径，不抛英文原始错误
    const prep = await api?.solutionPkg?.prepare?.({ id: 'workbench-finance-agent' }).catch(() => null);
    if (!fa?.invoke || (prep && prep.ok === false)) throw notReady;
    try {
      await fa.invoke('data.importJournal', { path: file, append: true });
    } catch (e) {
      if (/No handler registered/i.test(String((e as Error)?.message))) throw notReady;
      throw e;
    }
  });
  if (ok) { notif.success(i18nT('已导入财务智能体')); void router.push('/workbenches/finance-agent'); }
}
const kindLabel = (k: BaReport['kind']) => ({ daily: i18nT('日报（昨天）'), weekly: i18nT('周报（上周）'), monthly: i18nT('月报（上月）'), custom: i18nT('自定义期间') }[k]);
function delta(cur: number, prev: number): string {
  if (!prev) return '';
  const d = (cur - prev) / prev;
  return `${d >= 0 ? '↑' : '↓'} ${fmtPct(Math.abs(d), 1)} ${i18nT('较上期')}`;
}

async function run(key: string, fn: () => Promise<unknown>): Promise<boolean> {
  busy.value = key;
  errors.value = { ...errors.value, [key]: '' };
  try { await fn(); await refreshState(); return true; } catch (e) { errors.value = { ...errors.value, [key]: errorMessage(e) }; void scrollToStep(key); return false; } finally { busy.value = ''; }
}
async function importFile(kind: 'sales' | 'expense'): Promise<void> {
  const paths = await pickFiles('excel');
  if (!paths.length) return;
  await run(kind === 'sales' ? 'f-sales' : 'f-expense', async () => {
    await ba('finance.import', { path: paths[0], kind });
    if (kind === 'sales') {
      const r = await ba<{ from: string; to: string }>('finance.range');
      if (!from.value) from.value = r.from;
      if (!to.value) to.value = r.to;
    }
  });
}
async function clear(kind: 'sales' | 'expense'): Promise<void> {
  if (!window.confirm(i18nT('清空已导入的数据？'))) return;
  await run('f-sales', () => ba('finance.clear', { kind }));
  metrics.value = null;
}
async function calc(): Promise<void> { await run('f-metrics', async () => { metrics.value = await ba<BaMetrics>('finance.metrics', { from: from.value, to: to.value }); }); }
async function report(kind: BaReport['kind']): Promise<void> {
  await run('f-report', async () => { const r = await ba<BaReport>('finance.report', { kind, from: from.value, to: to.value }); currentReportId.value = r.id; metrics.value = r.metrics; });
}
async function push(): Promise<void> {
  if (!current.value) return;
  const ok = await run('f-push', () => ba('finance.push', { id: current.value!.id }));
  if (ok) notif.success(i18nT('已推送'));
}
async function exportIt(): Promise<void> {
  if (!current.value) return;
  await run('f-push', async () => { const f = await ba<string>('finance.export', { id: current.value!.id }); await openPath(f, true); });
}
async function copyText(): Promise<void> {
  if (!current.value) return;
  try { await navigator.clipboard.writeText(await ba<string>('finance.reportText', { id: current.value.id })); notif.success(i18nT('已复制')); } catch (e) { notif.error(errorMessage(e)); }
}
async function ask(): Promise<void> {
  const ok = await run('f-qa', () => ba('finance.ask', { q: question.value }));
  if (ok) question.value = '';
}
function jump(key: string): void { void scrollToStep(key); }
</script>

<style scoped>
.ba-trend { display: flex; align-items: flex-end; gap: 2px; height: 90px; padding: 6px; border: 1px solid var(--color-border); border-radius: var(--radius-4); }
.ba-trend i { flex: 1; background: var(--color-brand); border-radius: calc(var(--radius-1) / 2) calc(var(--radius-1) / 2) 0 0; min-width: 2px; }
.ba-scroll { max-height: 320px; overflow: auto; }
.ba-slow { display: flex; flex-wrap: wrap; gap: 6px; }
.ba-mini { height: 28px; border-radius: var(--radius-2); border: 1px solid var(--color-border); background: var(--color-bg-input); color: var(--color-text-primary); font: inherit; font-size: var(--font-size-sm); }
.ba-blocks { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 10px; }
.ba-block { display: grid; gap: 6px; padding: 10px 12px; border: 1px solid var(--color-border); border-radius: var(--radius-4); font-size: 12.5px; }
.ba-bar { display: grid; grid-template-columns: 90px 1fr 80px; gap: 8px; align-items: center; }
.ba-bar span { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.ba-bar i { height: 8px; border-radius: var(--radius-1); background: var(--color-brand); display: block; }
.ba-bar b { text-align: end; font-variant-numeric: tabular-nums; }
.ba-report { display: grid; gap: 8px; padding: 12px; border: 1px solid var(--color-border); border-radius: var(--radius-5); background: var(--color-bg-primary); }
.ba-report header { display: flex; gap: 10px; align-items: center; flex-wrap: wrap; }
.ba-report pre, .ba-qa pre { margin: 0; white-space: pre-wrap; font: inherit; font-size: var(--font-size-md); line-height: 1.75; }
.ba-history { display: flex; gap: 6px; flex-wrap: wrap; align-items: center; }
.ba-history .ss-chip { border: 0; cursor: pointer; }
.ba-ask { display: flex; gap: 8px; }
.ba-ask input { flex: 1; height: 36px; border-radius: var(--radius-4); border: 1px solid var(--color-border); background: var(--color-bg-input); color: var(--color-text-primary); font: inherit; padding: 0 12px; }
.ba-qa { display: grid; gap: 4px; padding: 10px 12px; border-radius: var(--radius-4); background: var(--color-bg-primary); border: 1px solid var(--color-border); }
:deep(.ba-imports) { margin: 0; padding-inline-start: 18px; font-size: var(--font-size-sm); color: var(--color-text-secondary); }
</style>
