<template>
  <div class="ss-module">
    <div class="ss-kpis">
      <div class="ss-kpi"><small>{{ $t('已开具') }}</small><strong>{{ count('issued') }}</strong></div>
      <div class="ss-kpi accent"><small>{{ $t('已开具价税合计') }}</small><strong>{{ money(issuedTotal) }}</strong></div>
      <div class="ss-kpi"><small>{{ $t('开具中') }}</small><strong>{{ count('handed') }}</strong></div>
      <div class="ss-kpi"><small>{{ $t('开具失败') }}</small><strong>{{ count('failed') }}</strong></div>
      <div class="ss-kpi"><small>{{ $t('已红冲') }}</small><strong>{{ count('red') }}</strong></div>
    </div>
    <div class="ss-actions">
      <input v-model="q" type="search" class="iv-search" :placeholder="$t('搜购买方、税号、发票号码、订单号')" />
      <select v-model="filter" class="iv-filter">
        <option value="">{{ $t('全部状态') }}</option>
        <option v-for="s in STATUSES" :key="s" :value="s">{{ statusLabel(s) }}</option>
      </select>
      <span class="grow"></span>
      <button type="button" class="ss-btn" :disabled="busy || !list.length" data-test="iv-ledger-export" @click="exportLedger"><i class="ri-file-excel-2-line"></i>{{ $t('导出台账') }}</button>
    </div>
    <div v-if="exportedFile" class="ss-file-out"><i class="ri-file-excel-2-fill"></i><code>{{ exportedFile }}</code><button type="button" class="ss-link" @click="openPath(exportedFile)">{{ $t('打开') }}</button><button type="button" class="ss-link" @click="openPath(exportedFile, true)">{{ $t('在文件夹中显示') }}</button></div>
    <p v-if="!list.length" class="ss-empty">{{ $t('确认过的发票会出现在这里') }}</p>
    <div v-else class="ss-table-wrap">
      <table class="ss-table" data-test="iv-ledger">
        <thead><tr><th>{{ $t('状态') }}</th><th>{{ $t('购买方名称') }}</th><th>{{ $t('票种') }}</th><th class="num">{{ $t('价税合计') }}</th><th>{{ $t('发票号码') }}</th><th>{{ $t('开票日期') }}</th><th>{{ $t('批次') }}</th><th></th></tr></thead>
        <tbody>
          <template v-for="d in list" :key="d.id">
            <tr>
              <td><span class="ss-chip" :class="statusClass(d.status)" :title="d.failReason || d.redReason">{{ statusLabel(d.status) }}</span></td>
              <td>{{ d.buyerName }}<small v-if="d.buyerTaxNo" class="iv-sub">{{ d.buyerTaxNo }}</small></td>
              <td>{{ kindLabel(d.kind) }}</td>
              <td class="num">{{ money(d.total) }}</td>
              <td class="iv-mono">{{ d.invoiceNo || '—' }}</td>
              <td>{{ d.issuedAt || '—' }}</td>
              <td>{{ batchName(d.batchId) }}</td>
              <td class="iv-ops">
                <button v-if="d.file" type="button" class="ss-link" @click="openPath(d.file)">{{ $t('发票文件') }}</button>
                <button v-else-if="d.status === 'issued'" type="button" class="ss-link" @click="attach(d)">{{ $t('附发票文件') }}</button>
                <a v-if="d.pdfUrl" class="ss-link" :href="d.pdfUrl" target="_blank" rel="noopener">PDF</a>
                <button v-if="d.conversationId" type="button" class="ss-link" @click="openConv(d.conversationId)">{{ $t('执行过程') }}</button>
                <button v-if="d.status === 'issued'" type="button" class="ss-link" @click="redId = redId === d.id ? '' : d.id">{{ $t('红冲') }}</button>
                <button v-if="d.status === 'failed'" type="button" class="ss-link" @click="setStatus(d, 'confirmed')">{{ $t('重新开具') }}</button>
              </td>
            </tr>
            <tr v-if="redId === d.id">
              <td colspan="8" class="iv-red">
                <p class="ss-muted">{{ $t('红冲要你本人在电子税务局「发票业务 → 红字发票开具」里发起《红字发票信息确认单》：对方未确认用途的由你直接开具红字发票，已确认用途的要对方确认后才能开。这里只登记原因和结果，不代你操作。') }}</p>
                <div class="ss-actions">
                  <input v-model="redReason" type="text" class="iv-search" :placeholder="$t('冲红原因，如：开票有误、销货退回、服务中止、销售折让')" />
                  <button type="button" class="ss-btn sm" :disabled="busy || !redReason.trim()" @click="noteRed(d)">{{ $t('记下原因') }}</button>
                  <button type="button" class="ss-btn sm primary" :disabled="busy" @click="setStatus(d, 'red')">{{ $t('我已红冲，标记') }}</button>
                </div>
              </td>
            </tr>
          </template>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
/** 发票台账：确认过的每一张发票的状态、号码、文件；导出、附文件、红冲。 */
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';
import type { IvDraft, IvDraftStatus } from '@totalclaw/ipc-contracts';
import { useNotificationStore } from '../../stores/notification';
import { t as i18nT } from '../../i18n';
import { errorMessage, iv, ivState, kindLabel, money, openPath, refreshState, statusClass, statusLabel } from './shared';

const notif = useNotificationStore();
const router = useRouter();
const STATUSES: IvDraftStatus[] = ['confirmed', 'handed', 'issued', 'failed', 'red'];
const q = ref('');
const filter = ref<IvDraftStatus | ''>('');
const busy = ref(false);
const exportedFile = ref('');
const redId = ref('');
const redReason = ref('');

const all = computed<IvDraft[]>(() => (ivState.value?.drafts || []).filter((d) => d.status !== 'draft'));
const list = computed(() => {
  const k = q.value.trim().toLowerCase();
  return all.value.filter((d) => (!filter.value || d.status === filter.value)
    && (!k || [d.buyerName, d.buyerTaxNo, d.invoiceNo || '', ...d.orderNos].some((x) => x.toLowerCase().includes(k))));
});
const count = (s: IvDraftStatus) => all.value.filter((d) => d.status === s).length;
const issuedTotal = computed(() => Math.round(all.value.filter((d) => d.status === 'issued').reduce((n, d) => n + Math.round(d.total * 100), 0)) / 100);
const batchName = (id: string) => ivState.value?.batches.find((b) => b.id === id)?.name || '';

async function act(fn: () => Promise<unknown>): Promise<boolean> {
  busy.value = true;
  try { await fn(); await refreshState(); return true; } catch (e) { notif.error(errorMessage(e)); return false; } finally { busy.value = false; }
}
async function exportLedger(): Promise<void> { await act(async () => { exportedFile.value = await iv<string>('ledger.export'); }); }
async function attach(d: IvDraft): Promise<void> { await act(() => iv('ledger.attach', { id: d.id })); }
async function setStatus(d: IvDraft, status: IvDraftStatus): Promise<void> { if (await act(() => iv('drafts.status', { ids: [d.id], status }))) redId.value = ''; }
async function noteRed(d: IvDraft): Promise<void> { if (await act(() => iv('ledger.redNote', { id: d.id, reason: redReason.value }))) notif.success(i18nT('已记下，红冲完成后回来点「我已红冲」')); }
function openConv(id: string): void { void router.push(`/conversations/${id}`).catch((e) => notif.error(errorMessage(e))); }
</script>

<style scoped>
.iv-search { flex: 1; min-width: 220px; max-width: 420px; height: 34px; border-radius: var(--radius-3); border: 1px solid var(--color-border); background: var(--color-bg-input); color: var(--color-text-primary); font: inherit; font-size: var(--font-size-md); padding: 0 10px; }
.iv-filter { height: 34px; border-radius: var(--radius-3); border: 1px solid var(--color-border); background: var(--color-bg-input); color: var(--color-text-primary); font: inherit; font-size: var(--font-size-md); }
.iv-sub { display: block; color: var(--color-text-secondary); font-size: var(--font-size-xs); font-family: var(--font-mono); }
.iv-mono { font-family: var(--font-mono); }
.iv-ops { display: flex; gap: 10px; align-items: center; }
.iv-red { white-space: normal !important; background: var(--color-bg-hover); }
.iv-red p { margin: 0 0 8px; }
</style>
