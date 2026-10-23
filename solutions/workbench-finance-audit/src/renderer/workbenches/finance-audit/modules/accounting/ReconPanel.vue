<template>
  <div v-if="res" class="fau-recon" data-test="fau-recon-panel">
    <section v-for="acc in res.bank || []" :key="acc.account" class="fau-sec" :data-test="`fau-bank-${acc.account}`">
      <header class="fau-row">
        <strong class="grow">{{ $t('银行账户') }} <FauNum :value="acc.account" /></strong>
        <span class="fau-badge" :class="acc.statement.balanced ? 'ok' : 'bad'" data-test="fau-bank-balanced">{{ acc.statement.balanced ? $t('调节后两边相等') : $t('调节后两边不相等') }}</span>
      </header>
      <div class="fau-counts">
        <span v-for="c in BANK_CLASSES" :key="c" class="fau-badge" :class="c === 'matched' ? 'ok' : acc.counts[c] ? 'warn' : 'muted'" :data-test="`fau-bank-count-${c}`">
          {{ $t(BANK_LABEL[c]) }} <FauNum :value="acc.counts[c] || 0" />
        </span>
      </div>
      <div class="fau-table-wrap">
        <table class="fau-table">
          <tbody>
            <tr><td>{{ $t('企业账面余额') }}</td><td class="num"><FauNum :cents="acc.statement.bookBalance" /></td><td>{{ $t('银行对账单余额') }}</td><td class="num"><FauNum :cents="acc.statement.bankBalance" /></td></tr>
            <tr><td>{{ $t('加：银行已收企业未收') }}</td><td class="num"><FauNum :cents="acc.statement.addBankInNotBook" /></td><td>{{ $t('加：企业已收银行未收') }}</td><td class="num"><FauNum :cents="acc.statement.addBookInNotBank" /></td></tr>
            <tr><td>{{ $t('减：银行已付企业未付') }}</td><td class="num"><FauNum :cents="acc.statement.lessBankOutNotBook" /></td><td>{{ $t('减：企业已付银行未付') }}</td><td class="num"><FauNum :cents="acc.statement.lessBookOutNotBank" /></td></tr>
            <tr><td>{{ $t('加减：金额差异调整') }}</td><td class="num"><FauNum :cents="acc.statement.amountDiffAdj" /></td><td></td><td></td></tr>
            <tr><td><strong>{{ $t('调整后企业余额') }}</strong></td><td class="num"><strong><FauNum :cents="acc.statement.adjustedBook" /></strong></td><td><strong>{{ $t('调整后银行余额') }}</strong></td><td class="num"><strong><FauNum :cents="acc.statement.adjustedBank" /></strong></td></tr>
          </tbody>
        </table>
      </div>
      <ul v-if="acc.escalations.length" class="fau-esc" data-test="fau-bank-escalations">
        <li v-for="(e, i) in acc.escalations" :key="i"><i class="ri-alarm-warning-line"></i>{{ msg(e) }}</li>
      </ul>
      <details :open="hasOpen(acc)">
        <summary>{{ $t('未达账项明细') }}</summary>
        <div class="fau-table-wrap">
          <table class="fau-table">
            <thead><tr><th>{{ $t('分类') }}</th><th>{{ $t('日期') }}</th><th>{{ $t('流水号 / 单号') }}</th><th>{{ $t('对方') }}</th><th>{{ $t('摘要') }}</th><th class="num">{{ $t('账面金额') }}</th><th class="num">{{ $t('银行金额') }}</th><th>{{ $t('原因') }}</th></tr></thead>
            <tbody>
              <tr v-for="it in acc.items.filter((x) => x.cls !== 'matched')" :key="it.id" :class="{ bad: !!it.escalate }">
                <td>{{ $t(BANK_LABEL[it.cls]) }}</td>
                <td><FauNum :value="it.date" /></td>
                <td><FauNum :value="it.ref" /></td>
                <td>{{ it.counterparty }}</td>
                <td>{{ it.summary }}</td>
                <td class="num"><FauNum :cents="it.bookAmount" /></td>
                <td class="num"><FauNum :cents="it.bankAmount" /></td>
                <td>{{ it.cause ? $t(CAUSE_LABEL[it.cause] || it.cause) : '' }}<span v-if="it.escalate" class="fau-badge bad">{{ msg(it.escalate) }}</span></td>
              </tr>
            </tbody>
          </table>
        </div>
      </details>
      <details>
        <summary>{{ $t('已达账项') }}</summary>
        <div class="fau-table-wrap">
          <table class="fau-table">
            <tbody>
              <tr v-for="it in acc.items.filter((x) => x.cls === 'matched')" :key="it.id">
                <td><FauNum :value="it.date" /></td><td><FauNum :value="it.ref" /></td><td>{{ it.summary }}</td>
                <td class="num"><FauNum :cents="it.bankAmount" /></td><td>{{ $t('第 {n} 轮', { n: it.pass || '-' }) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </details>
    </section>

    <section v-if="res.glsub" class="fau-sec" data-test="fau-glsub">
      <header class="fau-row">
        <strong class="grow">{{ $t('总账与子账') }}</strong>
        <span class="fau-badge">{{ $t('相符率') }} <FauNum :ratio="res.glsub.matchRate" /></span>
      </header>
      <div class="fau-counts">
        <span v-for="c in GLSUB_CLASSES" :key="c" class="fau-badge" :class="c === 'matched' ? 'ok' : res.glsub.counts[c] ? 'warn' : 'muted'" :data-test="`fau-glsub-count-${c}`">
          {{ $t(GLSUB_LABEL[c]) }} <FauNum :value="res.glsub.counts[c] || 0" />
        </span>
      </div>
      <ul v-if="res.glsub.escalations.length" class="fau-esc"><li v-for="(e, i) in res.glsub.escalations" :key="i"><i class="ri-alarm-warning-line"></i>{{ msg(e) }}</li></ul>
      <div class="fau-table-wrap">
        <table class="fau-table">
          <thead><tr><th>{{ $t('对账键') }}</th><th>{{ $t('分类') }}</th><th class="num">{{ $t('总账金额') }}</th><th class="num">{{ $t('子账金额') }}</th><th class="num">{{ $t('差额') }}</th><th>{{ $t('可能成因') }}</th><th>{{ $t('根因') }}</th><th>{{ $t('回核') }}</th><th></th></tr></thead>
          <tbody>
            <tr v-for="b in res.glsub.breaks.filter((x) => x.cls !== 'matched')" :key="b.id" :class="{ bad: b.major }" :data-test="`fau-break-${b.key}`">
              <td><FauNum :value="b.key" /></td>
              <td>{{ $t(GLSUB_LABEL[b.cls]) }}<span v-if="b.major" class="fau-badge bad">{{ $t('重大') }}</span></td>
              <td class="num"><FauNum :cents="b.glAmount" /></td>
              <td class="num"><FauNum :cents="b.subAmount" /></td>
              <td class="num"><FauNum :cents="b.diff" /></td>
              <td>{{ b.causes.map((c) => $t(CAUSE_LABEL[c] || c)).join(sep) }}</td>
              <td class="wrap">{{ b.trace?.rootCause }}<small v-if="b.trace" class="ss-muted"><br>{{ b.trace.owner }} · <FauNum :value="b.trace.expectedClearDate" /></small></td>
              <td>
                <span v-if="b.trace" class="fau-badge" :class="b.trace.status === 'verified' ? 'ok' : 'bad'" :data-test="`fau-trace-${b.key}`">{{ b.trace.status === 'verified' ? $t('已核实') : b.trace.status === 'rejected' ? $t('已打回') : $t('未核实') }}</span>
                <small v-if="b.trace?.missing?.length" class="ss-muted"><br><FauNum :value="b.trace.missing.join(', ')" /></small>
              </td>
              <td><button v-if="run.modeId === 'glsub'" type="button" class="ss-btn sm ghost" :disabled="busy" @click="retrace(b.id)"><i class="ri-search-eye-line"></i>{{ $t('重新追溯') }}</button></td>
            </tr>
          </tbody>
        </table>
      </div>
      <p v-if="error" class="ss-note danger"><i class="ri-error-warning-line"></i>{{ error }}</p>
    </section>
  </div>
</template>

<script setup lang="ts">
/** A2 对账中心：第 ④ 步结果（银企对账调节表 / 总账与子账差异与根因追溯） */
import { computed, ref } from 'vue';
import type { FauBankAccountResult, FauBankClass, FauGlSubClass, FauReconResult, FauRun } from '@totalclaw/ipc-contracts';
import { FAU_BANK_CLASSES, FAU_GLSUB_CLASSES } from '@totalclaw/ipc-contracts';
import { i18nKey, listSeparator } from '../../../../i18n';
import FauNum from '../../FauNum.vue';
import { errorMessage, fau, msg } from '../../shared';

const props = defineProps<{ run: FauRun }>();
const emit = defineEmits<{ (e: 'open-run', runId: string): void }>();
const res = computed(() => props.run.result as FauReconResult | undefined);
const busy = ref(false);
const error = ref('');
const BANK_CLASSES = FAU_BANK_CLASSES;
const sep = listSeparator();
const GLSUB_CLASSES = FAU_GLSUB_CLASSES;

const BANK_LABEL: Record<FauBankClass, string> = {
  matched: i18nKey('已达'), book_out_bank_not: i18nKey('企业已付银行未付'), book_in_bank_not: i18nKey('企业已收银行未收'),
  bank_out_book_not: i18nKey('银行已付企业未付'), bank_in_book_not: i18nKey('银行已收企业未收'), amount_diff: i18nKey('金额差异'), unmatched: i18nKey('无法匹配'),
};
const GLSUB_LABEL: Record<FauGlSubClass, string> = {
  matched: i18nKey('相符'), amount: i18nKey('金额差异'), quantity: i18nKey('数量差异'), timing: i18nKey('时间差异'), gl_only: i18nKey('仅总账有'), sub_only: i18nKey('仅子账有'),
};
const CAUSE_LABEL: Record<string, string> = {
  timing: i18nKey('时间性差异'), fx: i18nKey('汇率'), mapping: i18nKey('映射'), duplicate_or_missing: i18nKey('重复或漏记'), fee_or_accrual: i18nKey('费用 / 计提'),
  data_quality: i18nKey('数据质量'), fee: i18nKey('银行手续费'), interest: i18nKey('利息'), unknown_deduction: i18nKey('不明扣款'),
};
const hasOpen = (acc: FauBankAccountResult) => acc.items.some((i) => i.cls !== 'matched');

async function retrace(breakId: string): Promise<void> {
  busy.value = true; error.value = '';
  try {
    const r = await fau<FauRun>('recon.break.retrace', { runId: props.run.id, breakId });
    emit('open-run', r.id);
  } catch (e) { error.value = errorMessage(e); } finally { busy.value = false; }
}
</script>

<style scoped>
.fau-recon { display: grid; gap: 10px; }
.fau-sec { border: 1px solid var(--color-border); border-radius: var(--radius-5); padding: 10px 12px; display: grid; gap: 8px; background: var(--color-bg-card); }
.fau-sec summary { cursor: pointer; font-weight: 700; font-size: 12.5px; }
.fau-counts { display: flex; flex-wrap: wrap; gap: 6px; }
.fau-esc { list-style: none; margin: 0; padding: 0; display: grid; gap: 4px; }
.fau-esc li { display: flex; gap: 6px; align-items: center; color: var(--color-danger); font-size: 12.5px; }
</style>
