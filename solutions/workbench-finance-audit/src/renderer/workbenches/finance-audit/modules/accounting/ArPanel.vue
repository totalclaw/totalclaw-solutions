<template>
  <div v-if="res" class="fau-acc" data-test="fau-ar-panel">
    <section class="fau-acc-sec">
      <header>
        <strong>{{ $t('账龄分布与坏账准备') }}</strong>
        <span class="fau-badge muted">{{ $t('截止日') }} <FauNum :value="res.asOf" /></span>
        <span class="fau-badge">{{ $t('未清合计') }} <FauNum :cents="res.total" /></span>
        <span class="fau-badge warn">{{ $t('逾期金额') }} <FauNum :cents="res.overdue" /> · <FauNum :ratio="res.overdueRate" /></span>
        <span class="fau-badge bad" data-test="fau-ar-provision">{{ $t('坏账准备') }} <FauNum :cents="res.provision" /></span>
      </header>
      <div class="fau-table-wrap">
        <table class="fau-table">
          <thead><tr><th>{{ $t('账龄分层') }}</th><th class="num">{{ $t('未清金额') }}</th><th class="num">{{ $t('占比') }}</th><th class="num">{{ $t('笔数') }}</th><th>{{ $t('坏账概率') }}</th><th class="num">{{ $t('计提比例') }}</th><th class="num">{{ $t('坏账准备') }}</th></tr></thead>
          <tbody>
            <tr v-for="b in res.buckets" :key="b.bucket" :data-test="`fau-ar-bucket-${b.bucket}`">
              <td>{{ $t(AGING_BUCKET_LABEL[b.bucket]) }}</td>
              <td class="num" data-test="amount"><FauNum :cents="b.amount" /></td>
              <td class="num"><FauNum :ratio="b.share" /></td>
              <td class="num"><FauNum :value="b.count" /></td>
              <td><FauNum :value="BAD_DEBT_PROBABILITY[b.bucket]" /></td>
              <td class="num"><FauNum :ratio="b.provisionRate" /></td>
              <td class="num"><FauNum :cents="b.provision" /></td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <section class="fau-acc-sec">
      <header><strong>{{ $t('客户账龄') }}</strong><span class="fau-badge warn">{{ $t('TOP 风险客户') }}: {{ res.top.join(sep) || '-' }}</span></header>
      <div class="fau-table-wrap">
        <table class="fau-table">
          <thead><tr><th>{{ $t('客户') }}</th><th class="num">{{ $t('未清合计') }}</th><th class="num">{{ $t('逾期金额') }}</th><th class="num">{{ $t('最长逾期天数') }}</th><th class="num">{{ $t('坏账准备') }}</th><th>{{ $t('风险') }}</th><th>{{ $t('催款阶段') }}</th><th class="num">{{ $t('额度使用率') }}</th><th>{{ $t('提示') }}</th></tr></thead>
          <tbody>
            <tr v-for="c in res.customers" :key="c.customer" :class="{ bad: c.risk === 'high', warn: c.risk === 'medium' }" :data-test="`fau-ar-customer-${c.customer}`">
              <td>{{ c.customer }}</td>
              <td class="num"><FauNum :cents="c.open" /></td>
              <td class="num"><FauNum :cents="c.overdue" /></td>
              <td class="num"><FauNum :value="c.maxOverdueDays" /></td>
              <td class="num"><FauNum :cents="c.provision" /></td>
              <td>{{ $t(RISK_LABEL[c.risk]) }}</td>
              <td>{{ $t(STAGE_LABEL[c.stage]) }}</td>
              <td class="num"><FauNum :ratio="c.utilization" /></td>
              <td class="wrap"><FauFlags :flags="c.flags" /></td>
            </tr>
          </tbody>
        </table>
      </div>
      <p v-if="res.letters.length" class="ss-note warn" data-test="fau-ar-letters"><i class="ri-mail-forbid-line"></i>{{ $t('催款函 {n} 份只是草稿，不会自动发送；由人确认后自行发出', { n: res.letters.length }) }}</p>
    </section>

    <section v-if="res.credit.length" class="fau-acc-sec" data-test="fau-ar-credit">
      <header><strong>{{ $t('信用评估') }}</strong></header>
      <div class="fau-table-wrap">
        <table class="fau-table">
          <thead><tr><th>{{ $t('客户') }}</th><th>{{ $t('付款历史') }}</th><th>{{ $t('建议等级') }}</th><th class="num">{{ $t('建议账期（天）') }}</th><th class="num">{{ $t('现有额度') }}</th><th class="num">{{ $t('建议额度') }}</th><th>{{ $t('审批层级') }}</th><th>{{ $t('依据') }}</th></tr></thead>
          <tbody>
            <tr v-for="c in res.credit" :key="c.customer" :class="{ bad: c.grade === 'D' }">
              <td>{{ c.customer }}</td>
              <td>{{ $t(PAY_HISTORY_LABEL[c.history]) }}</td>
              <td><FauNum :value="c.grade" /></td>
              <td class="num"><FauNum :value="c.termDays" /></td>
              <td class="num"><FauNum :cents="c.currentLimit" /></td>
              <td class="num"><FauNum :cents="c.suggestedLimit" /></td>
              <td>{{ $t(CREDIT_APPROVAL_LABEL[c.approval]) }}</td>
              <td class="wrap"><FauFlags :flags="c.reasons" /></td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <ul v-if="res.escalations.length" class="fau-acc-esc" data-test="fau-ar-escalations">
      <li v-for="(e, i) in res.escalations" :key="i"><i class="ri-alarm-warning-line"></i>{{ msg(e) }}</li>
    </ul>
  </div>
</template>

<script setup lang="ts">
/** A3 应收与账龄：第 ④ 步结果（账龄分层、坏账准备、客户风险、信用评估） */
import { computed } from 'vue';
import type { FauArResult, FauModuleDef, FauRun } from '@totalclaw/ipc-contracts';
import { AGING_BUCKET_LABEL, BAD_DEBT_PROBABILITY, CREDIT_APPROVAL_LABEL, PAY_HISTORY_LABEL, RISK_LABEL, STAGE_LABEL } from '../../../../../shared/financeAudit/accountingLabels';
import { listSeparator } from '../../../../i18n';
import FauNum from '../../FauNum.vue';
import FauFlags from './FauFlags.vue';
import { msg } from '../../shared';

const props = defineProps<{ run: FauRun; def?: FauModuleDef }>();
const res = computed(() => props.run.result as FauArResult | undefined);
const sep = listSeparator();
</script>
