<template>
  <div class="ca-research">
    <section class="ss-panel">
      <h3><i class="ri-bar-chart-grouped-line"></i>{{ $t('科研成果统计') }}</h3>
      <p class="ss-muted">{{ $t('导入科研处的成果登记表（论文、专利、纵向 / 横向项目、获奖、著作），按学院、类型、年度、级别统计数量与经费。数字全部由规则汇总，不经模型。') }}</p>
      <div class="ss-actions">
        <button type="button" class="ss-btn primary sm" :disabled="!!busy" data-test="ca-research-import" @click="importOutputs()"><i :class="busy === 'import' ? 'ri-loader-4-line spin' : 'ri-file-excel-2-line'"></i>{{ r?.outputs ? $t('重新导入成果表') : $t('导入成果表') }}</button>
        <button type="button" class="ss-btn sm" :disabled="!!busy" data-test="ca-research-demo" @click="loadDemo"><i class="ri-file-download-line"></i>{{ $t('载入示例') }}</button>
        <button type="button" class="ss-btn sm" :disabled="!r?.outputs" @click="exportStats"><i class="ri-download-2-line"></i>{{ $t('导出统计表') }}</button>
        <span v-if="r?.outputsFile" class="ss-muted">{{ fileName(r.outputsFile) }}<template v-if="r.skipped"> · {{ $t('跳过 {n} 行空行', { n: r.skipped }) }}</template></span>
      </div>
      <p v-for="p in problems" :key="p" class="ss-note"><i class="ri-information-line"></i>{{ p }}</p>
      <template v-if="stats">
        <div class="ss-kpis">
          <div class="ss-kpi accent"><small>{{ $t('成果总数') }}</small><strong>{{ stats.total }}</strong></div>
          <div class="ss-kpi"><small>{{ $t('经费合计') }}</small><strong>{{ stats.funding }}</strong></div>
          <div class="ss-kpi"><small>{{ $t('覆盖学院') }}</small><strong>{{ stats.byCollege.length }}</strong></div>
          <div class="ss-kpi"><small>{{ $t('成果类型') }}</small><strong>{{ stats.byType.length }}</strong></div>
        </div>
        <div class="ca-split">
          <div class="ca-chart">
            <h4>{{ $t('年度分布') }}</h4>
            <div v-for="x in stats.byYear" :key="x.key" class="ca-bar-row"><span>{{ x.key }}</span><i :style="{ width: `${(x.count / maxOf(stats.byYear)) * 100}%` }"></i><b>{{ x.count }}</b></div>
          </div>
          <div class="ca-chart">
            <h4>{{ $t('类型分布') }}</h4>
            <div v-for="x in stats.byType" :key="x.key" class="ca-bar-row"><span>{{ x.key }}</span><i class="gold" :style="{ width: `${(x.count / maxOf(stats.byType)) * 100}%` }"></i><b>{{ x.count }}</b></div>
          </div>
        </div>
        <h4>{{ $t('学院 × 类型') }}</h4>
        <div class="ss-table-wrap">
          <table class="ss-table">
            <thead><tr><th>{{ $t('学院') }}</th><th v-for="c in stats.matrix.cols" :key="c" class="num">{{ c }}</th><th class="num">{{ $t('合计') }}</th><th class="num">{{ $t('经费') }}</th></tr></thead>
            <tbody>
              <tr v-for="(row, i) in stats.matrix.rows" :key="row">
                <td>{{ row }}</td>
                <td v-for="(n, j) in stats.matrix.cells[i]" :key="j" class="num" :style="heat(n)">{{ n || '' }}</td>
                <td class="num"><b>{{ stats.byCollege.find((x) => x.key === row)?.count }}</b></td>
                <td class="num">{{ stats.byCollege.find((x) => x.key === row)?.funding }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </template>
    </section>

    <section class="ss-panel">
      <h3><i class="ri-file-search-line"></i>{{ $t('申报指南解读') }}</h3>
      <p class="ss-muted">{{ $t('上传项目申报指南（PDF / Word），抽出截止时间、申报条件、材料清单、资助额度和联系方式。每条都附原文，并逐条回原文核对，原文里找不到的条目不列出。') }}</p>
      <div class="ss-actions">
        <button type="button" class="ss-btn primary sm" :disabled="!!busy" data-test="ca-guide-pick" @click="analyze()"><i :class="busy === 'guide' ? 'ri-loader-4-line spin' : 'ri-upload-2-line'"></i>{{ $t('上传申报指南') }}</button>
        <button v-if="demoGuide" type="button" class="ss-btn sm" :disabled="!!busy" data-test="ca-guide-demo" @click="analyze(demoGuide)">{{ $t('解读示例指南') }}</button>
        <span v-if="guideProgress" class="ss-muted"><i class="ri-loader-4-line spin"></i>{{ guideProgress }}</span>
      </div>
      <article v-for="g in guides" :key="g.id" class="ca-guide" data-test="ca-guide">
        <header>
          <b>{{ g.title }}</b><small class="ss-muted">{{ g.fileName }} · {{ fmtDateTime(g.at) }}</small>
          <span v-if="g.dropped" class="ss-chip warn">{{ $t('{n} 条在原文里找不到，已丢弃', { n: g.dropped }) }}</span>
          <span class="grow"></span>
          <button type="button" class="ss-btn sm" @click="exportGuide(g.id)"><i class="ri-download-2-line"></i>{{ $t('导出') }}</button>
          <button type="button" class="ss-btn sm ghost danger" @click="removeGuide(g.id)">{{ armed === g.id ? $t('确认删除') : $t('删除') }}</button>
        </header>
        <div class="ca-guide__grid">
          <div v-for="k in SECTIONS" :key="k" class="ca-guide__sec">
            <h4>{{ secLabel(k) }}<em>{{ g[k].length }}</em></h4>
            <ul>
              <li v-for="(it, i) in g[k]" :key="i">
                <p><span v-if="it.date" class="ss-chip bad">{{ it.date }}</span> {{ it.text }}</p>
                <blockquote>{{ it.quote }}</blockquote>
              </li>
              <li v-if="!g[k].length" class="empty">{{ $t('指南里没有写') }}</li>
            </ul>
          </div>
        </div>
      </article>
    </section>
  </div>
</template>

<script setup lang="ts">
/** 科研：成果统计 + 申报指南解读 */
import { computed, ref } from 'vue';
import type { CaGuide } from '@totalclaw/ipc-contracts';
import { useNotificationStore } from '../../stores/notification';
import { t as i18nT } from '../../i18n';
import { ca, caProgress, caState, errorMessage, fmtDateTime, openPath, refreshState } from './shared';

const notif = useNotificationStore();
type Sec = 'deadlines' | 'eligibility' | 'materials' | 'funding' | 'contacts';
const SECTIONS: Sec[] = ['deadlines', 'eligibility', 'materials', 'funding', 'contacts'];
const busy = ref('');
const armed = ref('');
const problems = ref<string[]>([]);
const demoGuide = ref('');
const r = computed(() => caState.value?.research || null);
const stats = computed(() => r.value?.stats || null);
const guides = computed<CaGuide[]>(() => r.value?.guides || []);
const guideProgress = computed(() => (caProgress.value.scope === 'guide' ? caProgress.value.message : ''));
const secLabel = (k: Sec): string => ({ deadlines: i18nT('截止时间'), eligibility: i18nT('申报条件'), materials: i18nT('材料清单'), funding: i18nT('资助额度'), contacts: i18nT('联系方式') }[k]);
const maxOf = (list: Array<{ count: number }>): number => Math.max(1, ...list.map((x) => x.count));
const fileName = (p: string): string => p.split(/[\\/]/).pop() || p;
const maxCell = computed(() => Math.max(1, ...(stats.value?.matrix.cells.flat() || [1])));
const heat = (n: number) => (n ? { background: `color-mix(in srgb, var(--ca-oxblood) ${Math.round((n / maxCell.value) * 28)}%, transparent)` } : {});

async function act<T>(key: string, fn: () => Promise<T>): Promise<T | null> {
  busy.value = key;
  try { const x = await fn(); await refreshState(); return x; } catch (e) { notif.error(errorMessage(e)); return null; } finally { busy.value = ''; }
}
async function importOutputs(preset?: string): Promise<void> {
  const paths = preset ? [preset] : await ca<string[]>('files.pick', { kind: 'excel', multi: false, title: i18nT('选择成果登记表') }).catch(() => []);
  if (!paths[0]) return;
  const x = await act('import', () => ca<{ count: number; problems: string[] }>('research.import', { path: paths[0] }));
  if (x) problems.value = x.problems;
}
async function loadDemo(): Promise<void> {
  const x = await act('demo', () => ca<{ outputs: string; guide: string }>('research.demo'));
  if (x) { demoGuide.value = x.guide; await importOutputs(x.outputs); }
}
async function exportStats(): Promise<void> {
  const f = await act('export', () => ca<string>('research.export'));
  if (f) void openPath(f, true);
}
async function analyze(preset?: string): Promise<void> {
  const paths = preset ? [preset] : await ca<string[]>('files.pick', { kind: 'doc', multi: false, title: i18nT('选择申报指南') }).catch(() => []);
  if (!paths[0]) return;
  const g = await act('guide', () => ca<CaGuide>('guide.analyze', { path: paths[0] }));
  if (g) notif.success(i18nT('解读完成'));
}
async function exportGuide(id: string): Promise<void> {
  const f = await act('gexport', () => ca<string>('guide.export', { id }));
  if (f) void openPath(f, true);
}
async function removeGuide(id: string): Promise<void> {
  if (armed.value !== id) { armed.value = id; setTimeout(() => { if (armed.value === id) armed.value = ''; }, 3000); return; }
  armed.value = '';
  await act('gremove', () => ca('guide.remove', { id }));
}
</script>

<style scoped>
.ca-research { display: grid; gap: 14px; }
.ca-chart { display: grid; gap: 6px; }
.ca-chart h4, .ca-research h4 { margin: 4px 0; font-size: var(--font-size-md); font-family: var(--ca-serif); }
.ca-bar-row { display: grid; grid-template-columns: 90px 1fr 36px; gap: 8px; align-items: center; font-size: 12.5px; }
.ca-bar-row span { color: var(--color-text-secondary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.ca-bar-row i { height: 10px; border-radius: var(--radius-1); background: var(--ca-oxblood); min-width: 2px; }
.ca-bar-row i.gold { background: var(--ca-gold); }
.ca-bar-row b { text-align: end; font-variant-numeric: tabular-nums; }
.ca-guide { border: 1px solid var(--color-border); border-radius: var(--radius-5); padding: 12px 14px; display: grid; gap: 10px; }
.ca-guide header { display: flex; gap: 8px; align-items: center; flex-wrap: wrap; }
.ca-guide header b { font-family: var(--ca-serif); font-size: var(--font-size-lg); }
.ca-guide header .grow { flex: 1; }
.ca-guide__grid { display: grid; gap: 12px; grid-template-columns: repeat(auto-fit, minmax(min(100%, 300px), 1fr)); }
.ca-guide__sec h4 { display: flex; gap: 6px; align-items: center; }
.ca-guide__sec h4 em { font-style: normal; font-size: var(--font-size-xs); color: var(--color-text-secondary); }
.ca-guide__sec ul { margin: 0; padding: 0; list-style: none; display: grid; gap: 8px; }
.ca-guide__sec p { margin: 0; font-size: var(--font-size-md); line-height: 1.55; }
.ca-guide__sec blockquote { margin: 4px 0 0; padding: 5px 10px; font-family: var(--ca-serif); font-size: var(--font-size-sm); line-height: 1.6; color: var(--color-text-secondary); background: color-mix(in srgb, var(--ca-gold) 10%, var(--color-bg-card)); border-radius: var(--radius-2); }
.ca-guide__sec blockquote::before { content: '「'; color: var(--ca-gold); }
.ca-guide__sec blockquote::after { content: '」'; color: var(--ca-gold); }
.ca-guide__sec .empty { color: var(--color-text-secondary); font-size: 12.5px; }
</style>
