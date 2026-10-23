<template>
  <div class="fs-rules">
    <p v-if="error" class="ss-note danger"><i class="ri-error-warning-line"></i>{{ error }}</p>
    <p v-if="!rules && !error" class="ss-note"><i class="ri-loader-4-line spin"></i>{{ $t('正在加载规则…') }}</p>
    <template v-if="rules">
      <section class="fs-card">
        <header>
          <h3>{{ $t('时效规则表') }}</h3>
          <span class="ss-chip" :class="rules.custom ? 'brand' : ''" data-test="fs-rules-source">{{ rules.custom ? $t('导入的：{p0}', { p0: rules.version }) : $t('内置：{p0}', { p0: rules.version }) }}</span>
          <span class="grow"></span>
          <button type="button" class="ss-btn primary" :disabled="busy" data-test="fs-rules-import" @click="importRules"><i class="ri-upload-2-line"></i>{{ $t('导入更新后的《时效看板指标》') }}</button>
          <button v-if="rules.custom" type="button" class="ss-btn" :disabled="busy" data-test="fs-rules-reset" @click="resetRules"><i class="ri-arrow-go-back-line"></i>{{ $t('恢复内置规则') }}</button>
        </header>
        <p class="ss-muted">{{ $t('导入时整体替换下面五张表。工作簿里要有这五张工作表：端到端用时、CSS各节点时效要求、oa、费控节点内外部、oa费控个人节点时效要求、审核人身份。导入后「通报」里已经算过的结果要重新计算。') }}</p>
        <p v-for="w in warnings" :key="w" class="ss-note warn"><i class="ri-error-warning-line"></i>{{ w }}</p>
        <div class="ss-actions">
          <div class="fs-seg"><button v-for="t in TABLES" :key="t.key" type="button" :class="{ on: table === t.key }" :data-test="`fs-rules-tab-${t.key}`" @click="table = t.key">{{ t.title }}<em>{{ counts[t.key] }}</em></button></div>
          <label class="ss-field inline"><span>{{ $t('搜索') }}</span><input v-model="keyword" type="text" :placeholder="$t('流程名、节点、姓名')" /></label>
        </div>

        <div class="ss-table-wrap fs-scroll">
          <table v-if="table === 'e2e'" class="ss-table">
            <thead><tr><th>{{ $t('大类') }}</th><th>{{ $t('流程细类') }}</th><th>{{ $t('所属系统') }}</th><th>{{ $t('整体时效要求') }}</th></tr></thead>
            <tbody><tr v-for="(r, i) in e2e" :key="i"><td>{{ r.category }}</td><td>{{ r.flowType }}</td><td>{{ r.system }}</td>
              <td>{{ r.variants?.length ? r.variants.map((v) => $t('标题含「{a}」{b} 天', { a: v.keyword, b: v.limitDays })).join('；') : r.limitDays == null ? $t('无整体时效要求') : $t('{n} 天', { n: r.limitDays }) }}</td></tr></tbody>
          </table>
          <table v-else-if="table === 'cssNodes'" class="ss-table">
            <thead><tr><th>{{ $t('事务类型') }}</th><th>{{ $t('费用类型') }}</th><th>{{ $t('审批节点') }}</th><th>{{ $t('是否计入端到端') }}</th><th class="num">{{ $t('单节点要求（工作日）') }}</th><th>{{ $t('备注') }}</th></tr></thead>
            <tbody><tr v-for="(r, i) in cssNodes" :key="i"><td>{{ r.flowType }}</td><td>{{ r.feeType }}</td><td>{{ r.node }}</td><td><span class="ss-chip" :class="r.internal ? 'brand' : ''">{{ r.internal ? $t('内部（计入）') : $t('外部（不计入）') }}</span></td><td class="num">{{ r.limitWorkdays ?? '-' }}</td><td>{{ r.note }}</td></tr></tbody>
          </table>
          <table v-else-if="table === 'oaFkNodes'" class="ss-table">
            <thead><tr><th>{{ $t('流程名') }}</th><th>{{ $t('环节名称') }}</th><th>{{ $t('节点属性') }}</th></tr></thead>
            <tbody><tr v-for="(r, i) in oaFkNodes" :key="i"><td>{{ r[0] }}</td><td>{{ r[1] }}</td><td><span class="ss-chip" :class="r[2] ? 'brand' : ''">{{ r[2] ? $t('内部') : $t('外部') }}</span></td></tr></tbody>
          </table>
          <table v-else-if="table === 'personal'" class="ss-table">
            <thead><tr><th>{{ $t('审核人身份') }}</th><th>{{ $t('大类') }}</th><th>{{ $t('流程细类') }}</th><th>{{ $t('平台') }}</th><th>{{ $t('金额') }}</th><th>{{ $t('重要性') }}</th><th class="num">{{ $t('时效要求（天）') }}</th></tr></thead>
            <tbody><tr v-for="(r, i) in personal" :key="i"><td>{{ r.identity }}</td><td>{{ r.category }}</td><td>{{ r.flowType }}</td><td>{{ r.platform }}</td><td>{{ r.amount === 'le10w' ? $t('金额线以内') : r.amount === 'gt10w' ? $t('金额线以上') : $t('不分金额') }}</td><td>{{ r.importance }}</td><td class="num">{{ r.limitDays ?? '-' }}</td></tr></tbody>
          </table>
          <table v-else class="ss-table">
            <thead><tr><th>{{ $t('姓名') }}</th><th>{{ $t('身份') }}</th></tr></thead>
            <tbody><tr v-for="n in managers" :key="n"><td>{{ n }}</td><td>{{ $t('管理干部') }}</td></tr></tbody>
          </table>
        </div>
        <p class="ss-muted">{{ table === 'managers' ? $t('名单以外的人按非管理干部算；花名册里「身份」写了管理干部的人也会算作管理干部。') : shownNote }}</p>
      </section>

      <section class="fs-card">
        <header><h3>{{ $t('判定阈值') }}</h3><span class="grow"></span><button type="button" class="ss-link" :disabled="busy" @click="resetThresholds">{{ $t('恢复默认') }}</button></header>
        <div class="ss-grid">
          <label class="ss-field"><span>{{ $t('较大逾期风险：在途时长超过时效要求的（%）') }}</span><input v-model.number="th.riskPct" type="number" min="1" max="100" step="1" data-test="fs-th-risk" /></label>
          <label class="ss-field"><span>{{ $t('异常：平均用时环比增加超过（天）') }}</span><input v-model.number="th.avgIncreaseDays" type="number" min="0" step="0.5" /></label>
          <label class="ss-field"><span>{{ $t('异常：时效合规率低于（%）') }}</span><input v-model.number="th.minPct" type="number" min="0" max="100" step="1" data-test="fs-th-min" /></label>
          <label class="ss-field"><span>{{ $t('金额线（元，管理干部审核时效按它分两档）') }}</span><input v-model.number="th.amountThreshold" type="number" min="0" step="10000" /></label>
          <label class="ss-field"><span>{{ $t('内部流程在途跟进间隔（天）') }}</span><input v-model.number="th.internalDays" type="number" min="1" step="1" /></label>
          <label class="ss-field"><span>{{ $t('外部流程在途跟进间隔（天）') }}</span><input v-model.number="th.externalDays" type="number" min="1" step="1" /></label>
          <label class="ss-field"><span>{{ $t('改善事项到期前几天提醒') }}</span><input v-model.number="th.improveRemindDays" type="number" min="0" step="1" /></label>
        </div>
        <div class="ss-actions"><button type="button" class="ss-btn primary" :disabled="busy" data-test="fs-th-save" @click="saveThresholds"><i class="ri-save-line"></i>{{ $t('保存阈值') }}</button><span v-if="saved === 'th'" class="ss-chip ok">{{ $t('已保存') }}</span></div>
      </section>

      <section class="fs-card">
        <header><h3>{{ $t('节假日日历') }}</h3><span class="ss-muted">{{ $t('CSS 节点的个人审核用时只算工作日：周末不算，下面的节假日不算，调休上班的周末要算') }}</span></header>
        <div class="fs-cal">
          <label class="ss-field"><span>{{ $t('节假日（工作日里放假的日期，一行一个，如 2026-10-01）') }}</span><textarea v-model="holidays" rows="7" data-test="fs-holidays"></textarea></label>
          <label class="ss-field"><span>{{ $t('调休上班（要上班的周六、周日，一行一个）') }}</span><textarea v-model="extraWorkdays" rows="7" data-test="fs-extra"></textarea></label>
        </div>
        <div class="ss-actions"><button type="button" class="ss-btn primary" :disabled="busy" data-test="fs-cal-save" @click="saveCalendar"><i class="ri-save-line"></i>{{ $t('保存日历') }}</button><span v-if="saved === 'cal'" class="ss-chip ok">{{ $t('已保存') }}</span></div>
      </section>

      <section class="fs-card">
        <header><h3>{{ $t('输出目录') }}</h3></header>
        <p class="ss-file-out"><i class="ri-folder-line"></i><code>{{ state?.outputDir }}</code><button type="button" class="ss-link" @click="pickDir">{{ $t('更改') }}</button><button v-if="state?.settings.outputDir" type="button" class="ss-link" @click="setDir('')">{{ $t('恢复默认位置') }}</button></p>
        <p class="ss-muted">{{ $t('通报、明细表、原因收集表、示例数据和台账导出都放在这里') }}</p>
      </section>
    </template>
  </div>
</template>

<script setup lang="ts">
/** 规则：五张规则表的查看 / 导入 / 恢复内置，判定阈值，节假日日历，输出目录。 */
import { computed, onMounted, reactive, ref } from 'vue';
import type { FsRulesView, FsThresholds } from '@totalclaw/ipc-contracts';
import { t as i18nT } from '../../i18n';
import { errorMessage, fs, fsState, refreshState } from './shared';

type TableKey = 'e2e' | 'cssNodes' | 'oaFkNodes' | 'personal' | 'managers';
const TABLES: Array<{ key: TableKey; title: string }> = [
  { key: 'e2e', title: i18nT('端到端用时') }, { key: 'cssNodes', title: i18nT('CSS 各节点') }, { key: 'oaFkNodes', title: i18nT('OA / 费控节点内外部') },
  { key: 'personal', title: i18nT('OA / 费控个人节点') }, { key: 'managers', title: i18nT('审核人身份') },
];
const MAX_ROWS = 300;

const state = fsState;
const rules = ref<FsRulesView | null>(null);
const busy = ref(false);
const error = ref('');
const warnings = ref<string[]>([]);
const table = ref<TableKey>('e2e');
const keyword = ref('');
const saved = ref<'' | 'th' | 'cal'>('');
const th = reactive({ riskPct: 80, avgIncreaseDays: 3, minPct: 95, amountThreshold: 100000, internalDays: 3, externalDays: 7, improveRemindDays: 7 });
const holidays = ref('');
const extraWorkdays = ref('');

function apply(r: FsRulesView): void {
  rules.value = r;
  seedThresholds(r.thresholds);
  holidays.value = r.holidays.join('\n');
  extraWorkdays.value = r.extraWorkdays.join('\n');
}
function seedThresholds(t: FsThresholds): void {
  Object.assign(th, { riskPct: Math.round(t.riskRatio * 1000) / 10, avgIncreaseDays: t.avgIncreaseDays, minPct: Math.round(t.minComplianceRate * 1000) / 10, amountThreshold: t.amountThreshold, internalDays: t.internalDays, externalDays: t.externalDays, improveRemindDays: t.improveRemindDays });
}
async function load(): Promise<void> {
  try { apply(await fs<FsRulesView>('rules.get')); error.value = ''; } catch (e) { error.value = errorMessage(e); }
}
onMounted(load);

const hit = (...cells: Array<string | null | undefined>): boolean => {
  const k = keyword.value.trim().toLowerCase();
  return !k || cells.some((c) => String(c || '').toLowerCase().includes(k));
};
const counts = computed<Record<TableKey, number>>(() => ({ e2e: rules.value?.e2e.length ?? 0, cssNodes: rules.value?.cssNodes.length ?? 0, oaFkNodes: rules.value?.oaFkNodes.length ?? 0, personal: rules.value?.personal.length ?? 0, managers: rules.value?.managers.length ?? 0 }));
const e2eAll = computed(() => (rules.value?.e2e ?? []).filter((r) => hit(r.category, r.flowType, r.system)));
const cssAll = computed(() => (rules.value?.cssNodes ?? []).filter((r) => hit(r.flowType, r.feeType, r.node)));
const oaFkAll = computed(() => (rules.value?.oaFkNodes ?? []).filter((r) => hit(r[0], r[1])));
const personalAll = computed(() => (rules.value?.personal ?? []).filter((r) => hit(r.identity, r.category, r.flowType, r.platform)));
const managers = computed(() => (rules.value?.managers ?? []).filter((n) => hit(n)));
const e2e = computed(() => e2eAll.value.slice(0, MAX_ROWS));
const cssNodes = computed(() => cssAll.value.slice(0, MAX_ROWS));
const oaFkNodes = computed(() => oaFkAll.value.slice(0, MAX_ROWS));
const personal = computed(() => personalAll.value.slice(0, MAX_ROWS));
const shownNote = computed(() => {
  const total = { e2e: e2eAll.value.length, cssNodes: cssAll.value.length, oaFkNodes: oaFkAll.value.length, personal: personalAll.value.length, managers: managers.value.length }[table.value];
  return total > MAX_ROWS ? i18nT('符合条件的有 {a} 行，这里列前 {b} 行；用搜索缩小范围', { a: total, b: MAX_ROWS }) : i18nT('{a} 行', { a: total });
});

async function act(fn: () => Promise<void>): Promise<boolean> {
  busy.value = true; error.value = ''; saved.value = '';
  try { await fn(); await refreshState(); return true; } catch (e) { error.value = errorMessage(e); return false; } finally { busy.value = false; }
}
async function importRules(): Promise<void> {
  const paths = await fs<string[]>('files.pick', { multi: false });
  if (!paths.length) return;
  warnings.value = [];
  await act(async () => {
    const r = await fs<{ warnings: string[] }>('rules.import', { path: paths[0] });
    warnings.value = r.warnings;
    await load();
  });
}
async function resetRules(): Promise<void> {
  if (!window.confirm(i18nT('恢复成内置的规则表？导入的规则会被丢掉。'))) return;
  warnings.value = [];
  await act(async () => { await fs('rules.reset'); await load(); });
}
async function saveThresholds(): Promise<void> {
  const ok = await act(async () => {
    const pct = (v: number, label: string): number => { if (!(v > 0 && v <= 100)) throw new Error(i18nT('{p0}要填 1 到 100 之间的数', { p0: label })); return Math.round(v * 10) / 1000; };
    const patch: FsThresholds = {
      riskRatio: pct(Number(th.riskPct), i18nT('较大逾期风险的比例')), minComplianceRate: pct(Number(th.minPct), i18nT('合规率下限')),
      avgIncreaseDays: Number(th.avgIncreaseDays), amountThreshold: Number(th.amountThreshold), internalDays: Number(th.internalDays), externalDays: Number(th.externalDays), improveRemindDays: Number(th.improveRemindDays),
    };
    for (const [k, v] of Object.entries(patch)) if (!Number.isFinite(v) || v < 0) throw new Error(i18nT('阈值里有没填或填错的数（{p0}）', { p0: k }));
    seedThresholds(await fs<FsThresholds>('rules.thresholds', { patch }));
  });
  if (ok) saved.value = 'th';
}
async function resetThresholds(): Promise<void> {
  await act(async () => { seedThresholds(await fs<FsThresholds>('rules.thresholds', { patch: null })); });
}
const lines = (s: string): string[] => s.split(/[\s,，;；]+/).map((x) => x.trim()).filter(Boolean);
async function saveCalendar(): Promise<void> {
  const ok = await act(async () => { await fs('calendar.save', { holidays: lines(holidays.value), extraWorkdays: lines(extraWorkdays.value) }); await load(); });
  if (ok) saved.value = 'cal';
}
async function pickDir(): Promise<void> {
  const dir = await fs<string>('dirs.pick');
  if (dir) await setDir(dir);
}
async function setDir(dir: string): Promise<void> {
  await act(async () => { await fs('settings.patch', { patch: { outputDir: dir } }); });
}
</script>

<style scoped>
.fs-rules { display: grid; gap: 14px; }
.fs-card { border: 1px solid var(--color-border); border-radius: var(--radius-6); background: var(--color-bg-card); padding: 14px; display: grid; gap: 10px; min-width: 0; }
.fs-card header { display: flex; gap: 10px; align-items: center; flex-wrap: wrap; }
.fs-card header .grow { flex: 1; }
.fs-card h3 { margin: 0; font-size: var(--font-size-base); }
.fs-scroll { max-height: 440px; overflow: auto; }
.fs-cal { display: grid; gap: 12px; grid-template-columns: repeat(auto-fit, minmax(min(100%, 320px), 1fr)); }
.fs-cal textarea { font-family: var(--font-mono); }
.fs-seg { display: inline-flex; border: 1px solid var(--color-border); border-radius: var(--radius-3); overflow-x: auto; max-width: 100%; }
.fs-seg button { height: 30px; padding: 0 12px; border: none; background: var(--color-bg-card); color: var(--color-text-secondary); font: inherit; font-size: var(--font-size-sm); font-weight: 700; cursor: pointer; white-space: nowrap; display: inline-flex; gap: 6px; align-items: center; }
.fs-seg button em { font-style: normal; font-weight: 400; opacity: .8; }
.fs-seg button.on { background: var(--color-brand); color: var(--color-on-accent); }
.spin { animation: fs-spin 1s linear infinite; }
@keyframes fs-spin { to { transform: rotate(360deg); } }
</style>
