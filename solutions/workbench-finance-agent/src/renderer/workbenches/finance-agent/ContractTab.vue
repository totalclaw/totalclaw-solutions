<template>
  <div class="ss-module">
    <ModuleHeader :meta="meta" />

    <div class="fa-split">
      <aside class="fa-list">
        <div class="ss-subhead">{{ $t('审核记录') }}</div>
        <ul>
          <li v-for="c in contracts" :key="c.id" :class="{ active: c.id === selectedId }" @click="selectedId = c.id">
            <div class="fa-list__top">
              <strong class="fa-ellipsis" :title="c.fileName">{{ c.fileName }}</strong>
              <span class="ss-chip" :class="highCount(c) ? 'bad' : c.findings.length ? 'warn' : 'ok'">{{ $t('{n} 项', { n: c.findings.length }) }}</span>
            </div>
            <div class="fa-list__meta">
              <span>{{ c.contractType }}</span>
              <span>{{ fmtDateTime(c.createdAt) }}</span>
              <button type="button" class="ss-link" @click.stop="remove(c.id)">{{ $t('删除') }}</button>
            </div>
          </li>
          <li v-if="!contracts.length" class="ss-empty">{{ $t('还没有审核过合同') }}</li>
        </ul>
      </aside>

      <section class="fa-detail">
        <StickyProgress :title="$t('合同财税审核')" :metas="metas" :runtime="runtime" :current-key="currentKey" @jump="jump" />
        <div class="ss-steps">
          <StepCard step-key="upload" :index="0" :title="metas[0].title" :hint="metas[0].hint" :runtime="runtime.upload">
            <FileDrop kind="contract" :multi="false" :label="$t('上传采购 / 销售合同')" :hint="$t('支持 PDF、Word、文本、图片（图片走本机 OCR）')" :disabled="!!busy" @picked="(p) => review(p[0])" />
            <label class="fa-check"><input v-model="useModel" type="checkbox" /><span>{{ $t('用模型逐条审核涉税条款（引用会回原文核对，核不上的丢弃）') }}</span></label>
            <p v-if="current" class="ss-muted">{{ $t('{p0}：{p1}，合同金额 {p2}，全文 {n} 字', { p0: current.fileName, p1: current.contractType, p2: current.amount != null ? fmtMoney(current.amount) : $t('未识别'), n: current.textLength }) }}</p>
          </StepCard>

          <StepCard step-key="clauses" :index="1" :title="metas[1].title" :hint="metas[1].hint" :runtime="runtime.clauses">
            <div v-if="current?.clauses.length" class="ss-table-wrap">
              <table class="ss-table">
                <thead><tr><th>{{ $t('条款') }}</th><th>{{ $t('约定内容') }}</th><th>{{ $t('原文') }}</th></tr></thead>
                <tbody>
                  <tr v-for="(c, i) in current.clauses" :key="i">
                    <td>{{ c.type }}</td>
                    <td class="fa-wrap">{{ c.value }}</td>
                    <td class="fa-wrap">
                      <span v-if="c.quote">{{ $t('「{p0}」', { p0: c.quote }) }}</span>
                      <span v-if="!c.verified" class="ss-chip warn">{{ $t('未在原文核实') }}</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p v-else-if="current" class="ss-muted">{{ $t('没有抽到涉税条款') }}</p>
            <p v-if="current?.model" class="ss-muted">{{ $t('由 {p0} 抽取', { p0: modelLabel(current.model) }) }}</p>
          </StepCard>

          <StepCard step-key="risks" :index="2" :title="metas[2].title" :hint="metas[2].hint" :runtime="runtime.risks">
            <ul v-if="current?.findings.length" class="fa-findings">
              <li v-for="(f, i) in current.findings" :key="i">
                <span class="ss-chip" :class="levelChip(f.level)">{{ levelLabel(f.level) }}</span>
                <div>
                  <strong>{{ f.title }}</strong>
                  <p class="fa-pre">{{ f.detail }}</p>
                  <p v-if="f.suggestion" class="fa-suggest"><i class="ri-lightbulb-line"></i>{{ f.suggestion }}</p>
                </div>
              </li>
            </ul>
            <p v-else-if="current" class="ss-note ok"><i class="ri-check-line"></i>{{ $t('没有发现财税风险条款') }}</p>
          </StepCard>

          <StepCard step-key="stamp" :index="3" :title="metas[3].title" :hint="metas[3].hint" :runtime="runtime.stamp">
            <ul v-if="current?.stampDuty" class="fa-calc">
              <li v-for="(l, i) in current.stampDuty" :key="i"><strong>{{ l.label }}</strong><span>{{ l.formula }}</span><em v-if="l.value > 1">{{ fmtMoney(l.value) }}</em></li>
            </ul>
            <p v-else-if="current" class="ss-muted">{{ $t('没有识别出合同类型或金额，无法测算印花税') }}</p>
          </StepCard>

          <StepCard step-key="export" :index="4" :title="metas[4].title" :hint="metas[4].hint" :runtime="runtime.export">
            <div class="ss-actions">
              <button type="button" class="ss-btn primary" :disabled="!!busy || !current" @click="exportOne">
                <i :class="busy === 'export' ? 'ri-loader-4-line spin' : 'ri-markdown-line'"></i>{{ $t('导出审核意见') }}
              </button>
              <template v-if="current?.exportPath">
                <code class="fa-path">{{ current.exportPath }}</code>
                <button type="button" class="ss-btn sm ghost" @click="open(current.exportPath)"><i class="ri-external-link-line"></i>{{ $t('打开') }}</button>
              </template>
            </div>
            <p class="ss-muted">{{ $t('审核意见仅供参考，需财务 / 法务人员复核确认。') }}</p>
          </StepCard>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * 合同财税审核智能体：上传 → 涉税条款 → 风险提示 → 印花税测算 → 导出意见。
 */
import { computed, ref, watch } from 'vue';
import type { FaContractReview } from '@totalclaw/ipc-contracts';
import { useNotificationStore } from '../../stores/notification';
import { t as i18nT } from '../../i18n';
import StepCard from '../service-settlement/StepCard.vue';
import StickyProgress from '../service-settlement/StickyProgress.vue';
import ModuleHeader from './ModuleHeader.vue';
import FileDrop from './FileDrop.vue';
import {
  errorMessage, fa, faState, fmtDateTime, fmtMoney, levelChip, levelLabel, modelLabel, openPath, refreshState, scrollToStep,
  type FaModuleMeta, type StepMeta, type StepRuntime,
} from './shared';

defineProps<{ meta: FaModuleMeta; focus?: any }>();
defineEmits<{ (e: 'goto', module: string, payload?: any): void }>();
const notif = useNotificationStore();

const contracts = computed<FaContractReview[]>(() => faState.value?.data.contracts || []);
const selectedId = ref('');
const current = computed(() => contracts.value.find((c) => c.id === selectedId.value) || null);
const useModel = ref(true);
const busy = ref('');
const errors = ref<Record<string, string>>({});
watch(contracts, (l) => { if (!selectedId.value && l.length) selectedId.value = l[0].id; }, { immediate: true });
watch(selectedId, () => { errors.value = {}; });

const highCount = (c: FaContractReview) => c.findings.filter((f) => f.level === 'high').length;

const metas: StepMeta[] = [
  { key: 'upload', title: i18nT('上传合同'), hint: i18nT('读取全文，识别合同类型与金额') },
  { key: 'clauses', title: i18nT('涉税条款'), hint: i18nT('开票时间、税率、付款节点、价款、发票类型') },
  { key: 'risks', title: i18nT('风险提示'), hint: i18nT('固定规则 + 模型，均附原文引用') },
  { key: 'stamp', title: i18nT('印花税测算'), hint: i18nT('按《印花税法》税目税率') },
  { key: 'export', title: i18nT('导出审核意见'), hint: i18nT('Markdown 审核意见') },
];
const runtime = computed<Record<string, StepRuntime>>(() => {
  const c = current.value;
  const st = (key: string, done: boolean, summary?: string): StepRuntime => (busy.value === key ? { state: 'running' }
    : errors.value[key] ? { state: 'failed', error: errors.value[key] } : done ? { state: 'done', summary } : { state: 'todo' });
  return {
    upload: st('upload', !!c, c?.contractType),
    clauses: st('clauses', !!c, c ? i18nT('{n} 条', { n: c.clauses.length }) : ''),
    risks: st('risks', !!c, c ? i18nT('{n} 项，其中高风险 {m} 项', { n: c.findings.length, m: highCount(c) }) : ''),
    stamp: st('stamp', !!c, c?.stampDuty ? fmtMoney(c.stampDuty[c.stampDuty.length - 1].value) : ''),
    export: st('export', !!c?.exportPath),
  };
});
const currentKey = computed(() => metas.find((m) => runtime.value[m.key].state !== 'done')?.key || 'export');

async function review(path: string): Promise<void> {
  busy.value = 'upload';
  errors.value = {};
  void scrollToStep('upload');
  try {
    const r = await fa<FaContractReview>('contract.review', { path, useModel: useModel.value });
    await refreshState();
    selectedId.value = r.id;
    void scrollToStep('risks');
  } catch (e) { errors.value = { upload: errorMessage(e) }; } finally { busy.value = ''; }
}
async function exportOne(): Promise<void> {
  busy.value = 'export';
  errors.value = { ...errors.value, export: '' };
  try { await fa('contract.export', { id: selectedId.value }); await refreshState(); } catch (e) { errors.value = { ...errors.value, export: errorMessage(e) }; } finally { busy.value = ''; }
}
async function remove(id: string): Promise<void> {
  if (!window.confirm(i18nT('删除这条审核记录？'))) return;
  try { await fa('contract.remove', { id }); if (selectedId.value === id) selectedId.value = ''; await refreshState(); } catch (e) { notif.error(errorMessage(e)); }
}
function open(path: string): void { openPath(path).catch((e) => notif.error(errorMessage(e))); }
function jump(key: string): void { void scrollToStep(key); }
</script>

<style scoped>
.fa-split { display: grid; grid-template-columns: minmax(220px, 280px) 1fr; gap: 14px; align-items: start; }
@media (max-width: 960px) { .fa-split { grid-template-columns: 1fr; } }
.fa-list { display: grid; gap: 8px; border: 1px solid var(--color-border); border-radius: var(--radius-6); background: var(--color-bg-card); padding: 10px; position: sticky; top: 0; }
.fa-list ul { list-style: none; margin: 0; padding: 0; display: grid; gap: 6px; max-height: 60vh; overflow-y: auto; }
.fa-list li { padding: 8px 10px; border-radius: var(--radius-4); border: 1px solid transparent; cursor: pointer; display: grid; gap: 3px; background: var(--color-bg-primary); }
.fa-list li.active { border-color: var(--color-brand); }
.fa-list__top { display: flex; justify-content: space-between; gap: 6px; align-items: center; font-size: var(--font-size-md); min-width: 0; }
.fa-list__meta { display: flex; gap: 8px; font-size: var(--font-size-xs); color: var(--color-text-secondary); flex-wrap: wrap; }
.fa-ellipsis { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; min-width: 0; }
.fa-detail { display: grid; gap: 12px; min-width: 0; }
.fa-check { display: flex; gap: 6px; align-items: center; font-size: 12.5px; }
.fa-wrap { white-space: normal !important; max-width: 460px; }
.fa-findings { list-style: none; margin: 0; padding: 0; display: grid; gap: 10px; font-size: 12.5px; }
.fa-findings li { display: flex; gap: 8px; align-items: flex-start; }
.fa-findings p { margin: 3px 0 0; }
.fa-suggest { display: flex; gap: 4px; color: var(--color-text-secondary); }
.fa-suggest i { color: var(--color-warning); }
.fa-pre { white-space: pre-wrap; }
.fa-calc { list-style: none; margin: 0; padding: 0; display: grid; gap: 4px; font-size: 12.5px; }
.fa-calc li { display: flex; gap: 10px; flex-wrap: wrap; }
.fa-calc em { font-style: normal; color: var(--color-brand); font-weight: 700; }
.fa-path { font-size: var(--font-size-sm); color: var(--color-text-secondary); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 420px; }
.spin { animation: fa-spin 1s linear infinite; }
@keyframes fa-spin { to { transform: rotate(360deg); } }
</style>
