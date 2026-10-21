<template>
  <div v-if="res" class="fau-acc" data-test="fau-expense-panel">
    <section class="fau-acc-sec">
      <header>
        <strong>{{ $t('逐单结论') }}</strong>
        <span v-for="v in VERDICTS" :key="v" class="fau-badge" :class="v === 'pass' ? 'ok' : v === 'review' ? 'warn' : 'bad'" :data-test="`fau-exp-verdict-${v}`">{{ $t(CLAIM_VERDICT_LABEL[v]) }} <FauNum :value="res.counts[v]" /></span>
        <span class="fau-badge muted">{{ $t('报销合计') }} <FauNum :cents="res.totals.amount" /></span>
      </header>
      <div class="fau-table-wrap">
        <table class="fau-table">
          <thead><tr><th>{{ $t('报销单号') }}</th><th>{{ $t('报销人') }}</th><th>{{ $t('部门') }}</th><th class="num">{{ $t('金额') }}</th><th>{{ $t('结论') }}</th><th>{{ $t('原因') }}</th></tr></thead>
          <tbody>
            <tr v-for="c in res.claims" :key="c.claimNo" :class="{ bad: c.verdict === 'reject' || c.verdict === 'escalate', warn: c.verdict === 'review' }" :data-test="`fau-exp-claim-${c.claimNo}`">
              <td><FauNum :value="c.claimNo" /></td>
              <td>{{ c.employee }}</td>
              <td>{{ c.dept }}</td>
              <td class="num"><FauNum :cents="c.total" /></td>
              <td data-test="verdict">{{ $t(CLAIM_VERDICT_LABEL[c.verdict]) }}</td>
              <td class="wrap"><FauFlags :flags="c.reasons" /></td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <section class="fau-acc-sec" data-test="fau-exp-anomalies">
      <header><strong>{{ $t('异常模式') }}</strong><span class="fau-badge" :class="res.anomalies.length ? 'warn' : 'ok'"><FauNum :value="res.anomalies.length" /></span></header>
      <p v-if="!res.anomalies.length" class="ss-muted">{{ $t('无') }}</p>
      <div v-else class="fau-table-wrap">
        <table class="fau-table">
          <thead><tr><th>{{ $t('异常模式') }}</th><th>{{ $t('级别') }}</th><th>{{ $t('对象') }}</th><th class="num">{{ $t('笔数') }}</th><th class="num">{{ $t('金额') }}</th><th>{{ $t('行号') }}</th></tr></thead>
          <tbody>
            <tr v-for="(a, i) in res.anomalies" :key="i" :class="{ bad: a.level === 'block', warn: a.level === 'warn' }" :data-test="`fau-exp-anomaly-${a.code}`">
              <td>{{ $t(ANOMALY_LABEL[a.code]) }}</td>
              <td>{{ a.level === 'block' ? $t('须升级') : $t('须抽查') }}</td>
              <td>{{ a.subject }}</td>
              <td class="num"><FauNum :value="a.count" /></td>
              <td class="num"><FauNum :cents="a.amount" /></td>
              <td><FauNum :value="a.rows.join(', ')" /></td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <section v-if="qrLines.length" class="fau-acc-sec" data-test="fau-exp-zatca">
      <header><strong>{{ $t('ZATCA 二维码') }}</strong></header>
      <div class="fau-table-wrap">
        <table class="fau-table">
          <thead><tr><th>{{ $t('行号') }}</th><th>{{ $t('阶段') }}</th><th>{{ $t('卖方名称') }}</th><th>{{ $t('增值税号') }}</th><th>{{ $t('开票时间') }}</th><th class="num">{{ $t('含税总额') }}</th><th class="num">{{ $t('增值税额') }}</th><th>{{ $t('结果') }}</th></tr></thead>
          <tbody>
            <tr v-for="l in qrLines" :key="l.row" :class="{ bad: !l.qr!.ok }" :data-test="`fau-exp-qr-${l.row}`">
              <td><FauNum :value="l.row" /></td>
              <td><FauNum :value="l.qr!.phase" /></td>
              <td>{{ l.qr!.sellerName }}</td>
              <td><FauNum :value="l.qr!.vatNo" /></td>
              <td><FauNum :value="l.qr!.timestamp" /></td>
              <td class="num"><FauNum :cents="l.qr!.total" /></td>
              <td class="num"><FauNum :cents="l.qr!.vat" /></td>
              <td data-test="qr-result">
                <span v-if="l.qr!.ok" class="fau-badge ok">{{ $t('与票面一致') }}</span>
                <template v-else><span v-for="p in l.qr!.problems" :key="p" class="fau-badge bad">{{ $t(QR_PROBLEM_LABEL[p] || p) }}</span></template>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <details class="fau-acc-sec">
      <summary>{{ $t('逐张票据检查') }}</summary>
      <div class="fau-table-wrap">
        <table class="fau-table">
          <thead><tr><th>{{ $t('行号') }}</th><th>{{ $t('报销人') }}</th><th>{{ $t('发票号') }}</th><th>{{ $t('开票日期') }}</th><th>{{ $t('销售方') }}</th><th class="num">{{ $t('价税合计') }}</th><th>{{ $t('检查结果') }}</th></tr></thead>
          <tbody>
            <tr v-for="l in res.lines" :key="l.row" :class="{ bad: l.flags.some((f) => f.level === 'block'), warn: l.flags.some((f) => f.level === 'warn') }">
              <td><FauNum :value="l.row" /></td>
              <td>{{ l.employee }}</td>
              <td><FauNum :value="l.invoiceNo" /></td>
              <td><FauNum :value="l.invoiceDate" /></td>
              <td>{{ l.seller }}</td>
              <td class="num"><FauNum :cents="l.total" /></td>
              <td class="wrap"><FauFlags :flags="l.flags" :ok-text="$t('符合规则')" /></td>
            </tr>
          </tbody>
        </table>
      </div>
    </details>

    <ul v-if="res.escalations.length" class="fau-acc-esc" data-test="fau-exp-escalations">
      <li v-for="(e, i) in res.escalations" :key="i"><i class="ri-alarm-warning-line"></i>{{ msg(e) }}</li>
    </ul>
  </div>
</template>

<script setup lang="ts">
/** A5 费用报销稽核：第 ④ 步结果（逐单结论、异常模式、ZATCA 二维码核对、逐张票据） */
import { computed } from 'vue';
import type { FauExpenseResult, FauModuleDef, FauRun } from '@totalclaw/ipc-contracts';
import { FAU_CLAIM_VERDICTS } from '@totalclaw/ipc-contracts';
import { ANOMALY_LABEL, CLAIM_VERDICT_LABEL, QR_PROBLEM_LABEL } from '../../../../../shared/financeAudit/accountingLabels';
import FauNum from '../../FauNum.vue';
import FauFlags from './FauFlags.vue';
import { msg } from '../../shared';

const props = defineProps<{ run: FauRun; def?: FauModuleDef }>();
const res = computed(() => props.run.result as FauExpenseResult | undefined);
const qrLines = computed(() => (res.value?.lines || []).filter((l) => l.qr));
const VERDICTS = FAU_CLAIM_VERDICTS;
</script>
