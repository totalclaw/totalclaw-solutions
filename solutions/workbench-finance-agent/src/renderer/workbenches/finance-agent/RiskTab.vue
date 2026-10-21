<template>
  <div class="ss-module">
    <ModuleHeader :meta="meta" />

    <div class="fa-split">
      <aside class="fa-list">
        <div class="ss-subhead">{{ $t('巡检记录') }}</div>
        <ul>
          <li v-for="r in history" :key="r.id" :class="{ active: r.id === selectedId }" @click="selectedId = r.id">
            <div class="fa-list__top">
              <strong>{{ fmtDateTime(r.createdAt) }}</strong>
              <span class="ss-chip" :class="countOf(r, 'high') ? 'bad' : r.findings.length ? 'warn' : 'ok'">{{ $t('{n} 项', { n: r.findings.length }) }}</span>
            </div>
            <div class="fa-list__meta">
              <span>{{ $t('高 {a} · 中 {b} · 低 {c}', { a: countOf(r, 'high'), b: countOf(r, 'warn'), c: countOf(r, 'info') }) }}</span>
              <button type="button" class="ss-link" @click.stop="remove(r.id)">{{ $t('删除') }}</button>
            </div>
          </li>
          <li v-if="!history.length" class="ss-empty">{{ $t('还没有巡检过') }}</li>
        </ul>
      </aside>

      <section class="fa-detail">
        <StickyProgress :title="$t('财税风险巡检')" :metas="metas" :runtime="runtime" :current-key="currentKey" @jump="jump" />
        <div class="ss-steps">
          <StepCard step-key="rsk-scope" :index="0" :title="metas[0].title" :hint="metas[0].hint" :runtime="runtime['rsk-scope']">
            <div class="ss-kpis">
              <div class="ss-kpi"><small>{{ $t('票据') }}</small><strong>{{ scope.docs }}</strong></div>
              <div class="ss-kpi"><small>{{ $t('凭证') }}</small><strong>{{ scope.vouchers }}</strong></div>
              <div class="ss-kpi"><small>{{ $t('序时账行数') }}</small><strong>{{ scope.journal }}</strong></div>
              <div class="ss-kpi"><small>{{ $t('账龄表') }}</small><strong>{{ scope.agings }}</strong></div>
              <div class="ss-kpi"><small>{{ $t('科目余额表') }}</small><strong>{{ scope.balances }}</strong></div>
            </div>
            <p class="ss-muted">{{ $t('规则：发票连号、大额现金、大额付给个人、异常费用（环比暴涨 / 整千大额 / 周末招待）、税负偏低、往来长期挂账、余额方向异常、问题票据。') }}</p>
            <div class="ss-actions">
              <button type="button" class="ss-btn sm ghost" @click="showData = !showData"><i class="ri-database-2-line"></i>{{ showData ? $t('收起数据对接') : $t('补充账套数据') }}</button>
              <button type="button" class="ss-btn sm ghost" @click="$emit('goto', 'settings')"><i class="ri-equalizer-line"></i>{{ $t('调整预警阈值') }}</button>
            </div>
            <DataSourcePanel v-if="showData" />
          </StepCard>

          <StepCard step-key="rsk-scan" :index="1" :title="metas[1].title" :hint="metas[1].hint" :runtime="runtime['rsk-scan']">
            <div class="ss-actions">
              <button type="button" class="ss-btn primary" :disabled="!!busy" @click="scan">
                <i :class="busy === 'rsk-scan' ? 'ri-loader-4-line spin' : 'ri-radar-line'"></i>{{ $t('开始巡检') }}
              </button>
              <span class="ss-muted">{{ $t('全部按固定规则扫描，不经过模型') }}</span>
            </div>
          </StepCard>

          <StepCard step-key="rsk-detail" :index="2" :title="metas[2].title" :hint="metas[2].hint" :runtime="runtime['rsk-detail']">
            <template v-if="current">
              <p v-if="!current.findings.length" class="ss-note ok"><i class="ri-check-line"></i>{{ $t('没有发现规则内的风险点') }}</p>
              <div v-for="g in groups" :key="g.level" class="fa-group">
                <div class="ss-subhead"><span class="ss-chip" :class="levelChip(g.level)">{{ levelLabel(g.level) }}</span> {{ $t('{n} 项', { n: g.items.length }) }}</div>
                <ul class="fa-findings">
                  <li v-for="(f, i) in g.items" :key="i">
                    <strong>{{ f.title }}</strong>
                    <p class="fa-pre">{{ f.detail }}</p>
                    <p class="fa-suggest"><i class="ri-lightbulb-line"></i>{{ f.suggestion }}</p>
                    <small v-if="f.refs?.length" class="ss-muted">{{ $t('涉及 {n} 条记录', { n: f.refs.length }) }}</small>
                  </li>
                </ul>
              </div>
            </template>
            <p v-else class="ss-muted">{{ $t('巡检后在这里查看') }}</p>
          </StepCard>

          <StepCard step-key="rsk-summary" :index="3" :title="metas[3].title" :hint="metas[3].hint" :runtime="runtime['rsk-summary']">
            <div class="ss-actions">
              <button type="button" class="ss-btn primary" :disabled="!!busy || !current || !current.findings.length" @click="summarize">
                <i :class="busy === 'rsk-summary' ? 'ri-loader-4-line spin' : 'ri-quill-pen-line'"></i>{{ current?.summary ? $t('重新总结') : $t('生成总体结论') }}
              </button>
              <span v-if="current?.model" class="ss-muted">{{ $t('由 {p0} 撰写', { p0: modelLabel(current.model) }) }}</span>
            </div>
            <div v-if="current?.summary" class="fa-text">{{ current.summary }}</div>
          </StepCard>

          <StepCard step-key="rsk-export" :index="4" :title="metas[4].title" :hint="metas[4].hint" :runtime="runtime['rsk-export']">
            <div class="ss-actions">
              <button type="button" class="ss-btn primary" :disabled="!!busy || !current" @click="exportIt">
                <i :class="busy === 'rsk-export' ? 'ri-loader-4-line spin' : 'ri-download-2-line'"></i>{{ $t('导出风险报告') }}
              </button>
              <template v-if="current?.reportPath">
                <code class="fa-out">{{ current.reportPath }}</code>
                <button type="button" class="ss-link" @click="open(current.reportPath)">{{ $t('打开') }}</button>
                <button type="button" class="ss-link" @click="open(current.reportPath, true)">{{ $t('所在文件夹') }}</button>
              </template>
            </div>
            <p class="ss-muted">{{ $t('Markdown 报告，附每项的整改建议；结论需财务人员复核确认。') }}</p>
          </StepCard>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * 财税风险巡检：巡检范围 → 按规则全量扫描 → 风险明细 → 模型写总体结论 → 导出报告。
 */
import { computed, ref, watch } from 'vue';
import type { FaFinding, FaRiskRun } from '@totalclaw/ipc-contracts';
import { useNotificationStore } from '../../stores/notification';
import { t as i18nT } from '../../i18n';
import StepCard from '../service-settlement/StepCard.vue';
import StickyProgress from '../service-settlement/StickyProgress.vue';
import ModuleHeader from './ModuleHeader.vue';
import DataSourcePanel from './DataSourcePanel.vue';
import {
  errorMessage, fa, faState, fmtDateTime, levelChip, levelLabel, modelLabel, openPath, refreshState, scrollToStep,
  type FaModuleMeta, type StepMeta, type StepRuntime,
} from './shared';

defineProps<{ meta: FaModuleMeta; focus?: any }>();
defineEmits<{ (e: 'goto', module: string, payload?: any): void }>();
const notif = useNotificationStore();

const history = computed(() => faState.value?.data.risks || []);
const selectedId = ref('');
const current = computed<FaRiskRun | null>(() => history.value.find((r) => r.id === selectedId.value) || null);
watch(history, (l) => { if (!selectedId.value && l.length) selectedId.value = l[0].id; }, { immediate: true });
const showData = ref(false);

const scope = computed(() => {
  const d = faState.value?.data;
  return {
    docs: d?.docs.length || 0,
    vouchers: d?.vouchers.length || 0,
    journal: (d?.journal?.rows.length || 0) + (d?.vouchers.filter((v) => v.status === 'reviewed').reduce((n, v) => n + v.lines.length, 0) || 0),
    agings: d?.agings.length || 0,
    balances: d?.balances.length || 0,
  };
});
const groups = computed(() => {
  const list = current.value?.findings || [];
  return (['high', 'warn', 'info'] as FaFinding['level'][]).map((level) => ({ level, items: list.filter((f) => f.level === level) })).filter((g) => g.items.length);
});
function countOf(r: FaRiskRun, level: FaFinding['level']): number { return r.findings.filter((f) => f.level === level).length; }

const busy = ref('');
const errors = ref<Record<string, string>>({});
const metas: StepMeta[] = [
  { key: 'rsk-scope', title: i18nT('巡检范围'), hint: i18nT('当前账套的票据、凭证、序时账、账龄表') },
  { key: 'rsk-scan', title: i18nT('全量扫描'), hint: i18nT('按固定规则识别风险点') },
  { key: 'rsk-detail', title: i18nT('风险明细'), hint: i18nT('按高 / 中 / 低分组，附整改建议') },
  { key: 'rsk-summary', title: i18nT('总体结论'), hint: i18nT('模型写优先处理顺序，不改数字') },
  { key: 'rsk-export', title: i18nT('风险报告'), hint: i18nT('导出 Markdown 报告') },
];
function st(key: string, done: boolean, summary?: string): StepRuntime {
  return busy.value === key ? { state: 'running' } : errors.value[key] ? { state: 'failed', error: errors.value[key] } : done ? { state: 'done', summary } : { state: 'todo' };
}
const runtime = computed<Record<string, StepRuntime>>(() => {
  const c = current.value;
  const total = scope.value.docs + scope.value.journal + scope.value.agings + scope.value.balances;
  return {
    'rsk-scope': st('rsk-scope', total > 0, total ? '' : i18nT('账套还没有数据')),
    'rsk-scan': st('rsk-scan', !!c, c ? fmtDateTime(c.createdAt) : ''),
    'rsk-detail': st('rsk-detail', !!c, c ? i18nT('{n} 项风险', { n: c.findings.length }) : ''),
    'rsk-summary': st('rsk-summary', !!c?.summary || (!!c && !c.findings.length)),
    'rsk-export': st('rsk-export', !!c?.reportPath),
  };
});
const currentKey = computed(() => metas.find((m) => runtime.value[m.key].state !== 'done')?.key || 'rsk-export');

async function run(key: string, fn: () => Promise<unknown>): Promise<void> {
  busy.value = key;
  errors.value = { ...errors.value, [key]: '' };
  void scrollToStep(key);
  try { await fn(); await refreshState(); } catch (e) { errors.value = { ...errors.value, [key]: errorMessage(e) }; } finally { busy.value = ''; }
}
async function scan(): Promise<void> {
  await run('rsk-scan', async () => { selectedId.value = (await fa<FaRiskRun>('risk.scan')).id; });
  if (current.value) void scrollToStep('rsk-detail');
}
async function summarize(): Promise<void> { if (current.value) await run('rsk-summary', () => fa('risk.summary', { id: current.value!.id })); }
async function exportIt(): Promise<void> { if (current.value) await run('rsk-export', () => fa('risk.export', { id: current.value!.id })); }
async function remove(id: string): Promise<void> {
  if (!window.confirm(i18nT('删除这条巡检记录？'))) return;
  try { await fa('risk.remove', { id }); if (selectedId.value === id) selectedId.value = ''; await refreshState(); } catch (e) { notif.error(errorMessage(e)); }
}
function open(path: string, reveal = false): void { openPath(path, reveal).catch((e) => notif.error(errorMessage(e))); }
function jump(key: string): void { void scrollToStep(key); }
</script>

<style scoped>
.fa-split { display: grid; grid-template-columns: minmax(200px, 250px) 1fr; gap: 14px; align-items: start; }
@media (max-width: 960px) { .fa-split { grid-template-columns: 1fr; } }
.fa-list { display: grid; gap: 8px; border: 1px solid var(--color-border); border-radius: 14px; background: var(--color-bg-card); padding: 10px; position: sticky; top: 0; max-height: calc(100vh - 160px); overflow: hidden; grid-template-rows: auto 1fr; }
.fa-list ul { list-style: none; margin: 0; padding: 0; display: grid; gap: 6px; overflow-y: auto; align-content: start; }
.fa-list li { padding: 8px 10px; border-radius: 10px; border: 1px solid transparent; cursor: pointer; display: grid; gap: 3px; background: var(--color-bg-primary); }
.fa-list li.active { border-color: var(--color-brand); background: color-mix(in srgb, var(--color-brand) 8%, var(--color-bg-card)); }
.fa-list__top { display: flex; justify-content: space-between; gap: 6px; align-items: center; font-size: 13px; }
.fa-list__meta { display: flex; gap: 8px; font-size: 11px; color: var(--color-text-secondary); align-items: center; justify-content: space-between; }
.fa-detail { display: grid; gap: 12px; min-width: 0; }
.fa-group { display: grid; gap: 6px; }
.fa-findings { list-style: none; margin: 0; padding: 0; display: grid; gap: 8px; }
.fa-findings li { padding: 10px 12px; border-radius: 10px; border: 1px solid var(--color-border); background: var(--color-bg-primary); display: grid; gap: 4px; font-size: 12.5px; }
.fa-findings p { margin: 0; }
.fa-pre { white-space: pre-wrap; color: var(--color-text-secondary); }
.fa-suggest { display: flex; gap: 4px; align-items: flex-start; }
.fa-suggest i { color: var(--color-warning); }
.fa-text { white-space: pre-wrap; font-size: 13px; line-height: 1.7; padding: 12px 14px; border-radius: 10px; background: var(--color-bg-primary); border: 1px solid var(--color-border); }
.fa-out { font-size: 11.5px; color: var(--color-text-secondary); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 420px; }
.spin { animation: fa-spin 1s linear infinite; }
@keyframes fa-spin { to { transform: rotate(360deg); } }
</style>
