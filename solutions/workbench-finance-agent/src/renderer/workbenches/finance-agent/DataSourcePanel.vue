<template>
  <section class="ss-panel fa-data">
    <header>
      <strong><i class="ri-database-2-line"></i> {{ $t('账套数据（数据对接）') }}</strong>
      <span class="ss-muted">{{ $t('从财务软件导出序时账、科目余额表，导进来给报表、税务、风险、预算用。只读分析，不回写正式账套。') }}</span>
    </header>
    <div class="fa-data__grid">
      <div class="fa-data__item">
        <div class="fa-data__head">
          <span>{{ $t('序时账（凭证明细）') }}</span>
          <span v-if="journal" class="ss-chip ok">{{ $t('{n} 行', { n: journal.rows.length }) }}</span>
          <span v-else class="ss-chip">{{ $t('未导入') }}</span>
        </div>
        <p v-if="journal" class="ss-muted">{{ $t('{p0}，{p1} 导入', { p0: journal.fileName, p1: fmtDateTime(journal.importedAt) }) }}</p>
        <p v-if="reviewed" class="ss-muted">{{ $t('另有本工作台已审核凭证 {n} 张，一并计入', { n: reviewed }) }}</p>
        <FileDrop compact kind="excel" :multi="false" :label="journal ? $t('重新导入序时账') : $t('导入序时账')" :hint="$t('需要：日期、科目、借方、贷方；可选：凭证号、摘要、往来单位、部门')" :disabled="!!busy" @picked="(p) => importJournal(p[0])" />
        <button v-if="journal" type="button" class="ss-link" @click="clear('journal')">{{ $t('清除') }}</button>
      </div>
      <div class="fa-data__item">
        <div class="fa-data__head">
          <span>{{ $t('科目余额表') }}</span>
          <span v-for="b in balances" :key="b.period" class="ss-chip ok">{{ b.period }}</span>
          <span v-if="!balances.length" class="ss-chip">{{ $t('未导入') }}</span>
        </div>
        <label class="ss-field fa-data__period"><span>{{ $t('所属期间') }}</span><input v-model="period" type="month" /></label>
        <FileDrop compact kind="excel" :multi="false" :label="$t('导入科目余额表')" :hint="$t('需要：科目名称、期初借贷、本期借贷、期末借贷')" :disabled="!!busy || !period" @picked="(p) => importBalances(p[0])" />
      </div>
    </div>
    <p v-if="message" class="ss-note" :class="messageOk ? 'ok' : 'danger'"><i :class="messageOk ? 'ri-check-line' : 'ri-error-warning-line'"></i>{{ message }}</p>
  </section>
</template>

<script setup lang="ts">
/**
 * 数据对接面板：导入账套导出的序时账 / 科目余额表。报表、税务、风险、预算几个 tab 共用。
 */
import { computed, ref } from 'vue';
import { t as i18nT } from '../../i18n';
import FileDrop from './FileDrop.vue';
import { errorMessage, fa, faState, fmtDateTime, fmtMoney, prevMonth, refreshState } from './shared';

const journal = computed(() => faState.value?.data.journal || null);
const balances = computed(() => faState.value?.data.balances || []);
const reviewed = computed(() => (faState.value?.data.vouchers || []).filter((v) => v.status === 'reviewed').length);
const period = ref(prevMonth());
const busy = ref('');
const message = ref('');
const messageOk = ref(true);

async function importJournal(path: string): Promise<void> {
  busy.value = 'journal';
  try {
    const r = await fa<{ count: number; debit: number; credit: number; balanced: boolean; from?: string; to?: string }>('data.importJournal', { path });
    messageOk.value = r.balanced;
    message.value = r.balanced
      ? i18nT('导入 {n} 行分录（{a} 至 {b}），借贷合计 {c}，平衡', { n: r.count, a: r.from || '-', b: r.to || '-', c: fmtMoney(r.debit) })
      : i18nT('导入 {n} 行，但借方 {a} ≠ 贷方 {b}：导出的可能不是完整凭证，请检查', { n: r.count, a: fmtMoney(r.debit), b: fmtMoney(r.credit) });
    await refreshState();
  } catch (e) { messageOk.value = false; message.value = errorMessage(e); } finally { busy.value = ''; }
}
async function importBalances(path: string): Promise<void> {
  busy.value = 'balances';
  try {
    const r = await fa<{ count: number; period: string }>('data.importBalances', { path, period: period.value });
    messageOk.value = true;
    message.value = i18nT('{p0} 科目余额表导入 {n} 个科目', { p0: r.period, n: r.count });
    await refreshState();
  } catch (e) { messageOk.value = false; message.value = errorMessage(e); } finally { busy.value = ''; }
}
async function clear(kind: 'journal' | 'balances'): Promise<void> {
  if (!window.confirm(i18nT('清除已导入的数据？'))) return;
  await fa('data.clear', { kind });
  await refreshState();
}
</script>

<style scoped>
.ss-panel > header strong { display: flex; gap: 6px; align-items: center; }
.fa-data__grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 12px; }
.fa-data__item { display: grid; gap: 8px; align-content: start; padding: 10px; border-radius: var(--radius-5); background: var(--color-bg-primary); }
.fa-data__head { display: flex; gap: 6px; align-items: center; flex-wrap: wrap; font-weight: 600; font-size: var(--font-size-md); }
.fa-data__period { max-width: 220px; }
.fa-data p { margin: 0; }
</style>
