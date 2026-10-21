<template>
  <div v-if="res" class="fau-acc" data-test="fau-ap-panel">
    <section v-if="res.match" class="fau-acc-sec" data-test="fau-ap-match">
      <header>
        <strong>{{ $t('三单匹配') }}</strong>
        <span v-for="g in GRADES" :key="g" class="fau-badge" :class="g === 'reject' ? 'bad' : g === 'review' ? 'warn' : 'ok'" :data-test="`fau-ap-grade-${g}`">{{ $t(MATCH_GRADE_LABEL[g]) }} <FauNum :value="res.matchCounts?.[g] ?? 0" /></span>
      </header>
      <div class="fau-table-wrap">
        <table class="fau-table">
          <thead><tr><th>{{ $t('采购订单号') }}</th><th>{{ $t('物料 / 品名') }}</th><th>{{ $t('供应商') }}</th><th class="num">{{ $t('订单数量') }}</th><th class="num">{{ $t('收货数量') }}</th><th class="num">{{ $t('发票数量') }}</th><th class="num">{{ $t('单价差异') }}</th><th>{{ $t('数量判定') }}</th><th>{{ $t('结论') }}</th><th class="num">{{ $t('可付') }}</th><th class="num">{{ $t('暂扣') }}</th><th>{{ $t('提示') }}</th></tr></thead>
          <tbody>
            <tr v-for="l in res.match" :key="l.key" :class="{ bad: l.grade === 'reject', warn: l.grade === 'review' }" :data-test="`fau-ap-line-${l.poNo}-${l.line || l.item}`">
              <td><FauNum :value="l.poNo" /><small v-if="l.line" class="ss-muted"> #<FauNum :value="l.line" /></small></td>
              <td>{{ l.item }}</td>
              <td>{{ l.supplier }}</td>
              <td class="num"><FauNum :value="l.poQty" /></td>
              <td class="num"><FauNum :value="l.grnQty" /></td>
              <td class="num"><FauNum :value="l.invQty" /></td>
              <td class="num"><FauNum :cents="l.priceDiff" /></td>
              <td>{{ $t(MATCH_QTY_LABEL[l.qty]) }}</td>
              <td data-test="grade">{{ $t(MATCH_GRADE_LABEL[l.grade]) }}</td>
              <td class="num"><FauNum :cents="l.payable" /></td>
              <td class="num"><FauNum :cents="l.hold" /></td>
              <td class="wrap"><FauFlags :flags="l.flags" /></td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <section v-if="res.plan" class="fau-acc-sec" data-test="fau-ap-plan">
      <header>
        <strong>{{ $t('付款计划草稿') }}</strong>
        <span class="fau-badge muted">{{ $t('可用资金') }} <FauNum v-if="res.plan.available != null" :cents="res.plan.available" /><template v-else>{{ $t('未提供') }}</template></span>
        <span class="fau-badge">{{ $t('30 天内到期应付（含已逾期）') }} <FauNum :cents="res.plan.due30" /></span>
        <span v-if="res.plan.gapTier" class="fau-badge" :class="res.plan.gapTier === 'none' ? 'ok' : res.plan.gapTier === 'large' ? 'bad' : 'warn'" data-test="fau-ap-gap">{{ $t(GAP_TIER_LABEL[res.plan.gapTier]) }} <FauNum v-if="res.plan.gap != null && res.plan.gap > 0" :cents="res.plan.gap" /></span>
      </header>
      <div class="fau-acc-kpis">
        <span class="fau-badge ok" data-test="fau-ap-scheduled">{{ $t('本次计划付款') }} <FauNum :cents="res.plan.scheduledTotal" /></span>
        <span class="fau-badge warn">{{ $t('延后') }} <FauNum :cents="res.plan.deferredTotal" /></span>
        <span class="fau-badge bad">{{ $t('暂扣') }} <FauNum :cents="res.plan.heldTotal" /></span>
        <span v-for="p in PRIORITIES" :key="p" class="fau-badge muted" :data-test="`fau-ap-priority-${p}`">{{ $t(PRIORITY_LABEL[p]) }} <FauNum :value="res.plan.byPriority[p].count" /></span>
      </div>
      <p class="ss-note warn"><i class="ri-bank-line"></i>{{ $t('付款计划只是草稿：本方案不付款，由人按审批层级在网银或资金系统里操作') }}</p>
      <div class="fau-table-wrap">
        <table class="fau-table">
          <thead><tr><th>{{ $t('优先级') }}</th><th>{{ $t('供应商') }}</th><th>{{ $t('发票号') }}</th><th>{{ $t('到期日') }}</th><th class="num">{{ $t('逾期天数') }}</th><th class="num">{{ $t('未付金额') }}</th><th class="num">{{ $t('暂扣') }}</th><th>{{ $t('安排') }}</th><th>{{ $t('审批层级') }}</th></tr></thead>
          <tbody>
            <tr v-for="l in res.plan.lines" :key="l.row" :class="{ bad: l.hold > 0, warn: !l.scheduled && !l.hold }">
              <td>{{ $t(PRIORITY_LABEL[l.priority]) }}</td>
              <td>{{ l.supplier }}</td>
              <td><FauNum :value="l.docNo" /></td>
              <td><FauNum :value="l.dueDate" /></td>
              <td class="num"><FauNum :value="l.overdueDays" /></td>
              <td class="num"><FauNum :cents="l.open" /></td>
              <td class="num"><FauNum :cents="l.hold" /></td>
              <td>{{ l.scheduled ? $t('本次计划') : $t('延后') }}<small v-if="l.deferTo" class="ss-muted"> → <FauNum :value="l.deferTo" /></small><FauFlags v-if="l.holdReason" :flags="[l.holdReason]" /></td>
              <td>{{ $t(PAY_APPROVAL_LABEL[l.approval]) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <section v-if="res.suppliers.length" class="fau-acc-sec" data-test="fau-ap-suppliers">
      <header><strong>{{ $t('供应商复核') }}</strong></header>
      <div class="fau-table-wrap">
        <table class="fau-table">
          <thead><tr><th>{{ $t('供应商') }}</th><th class="num">{{ $t('未付金额') }}</th><th>{{ $t('结论') }}</th><th>{{ $t('复核发现') }}</th></tr></thead>
          <tbody>
            <tr v-for="s in res.suppliers" :key="s.supplier" :class="{ bad: s.conclusion === 'hold', warn: s.conclusion === 'conditional' }" :data-test="`fau-ap-supplier-${s.supplier}`">
              <td>{{ s.supplier }}</td>
              <td class="num"><FauNum :cents="s.open" /></td>
              <td>{{ $t(SUPPLIER_CONCLUSION_LABEL[s.conclusion]) }}</td>
              <td class="wrap"><FauFlags :flags="s.flags" /></td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <ul v-if="res.escalations.length" class="fau-acc-esc" data-test="fau-ap-escalations">
      <li v-for="(e, i) in res.escalations" :key="i"><i class="ri-alarm-warning-line"></i>{{ msg(e) }}</li>
    </ul>
  </div>
</template>

<script setup lang="ts">
/** A4 应付与三单匹配：第 ④ 步结果（三单匹配分级、付款计划草稿、供应商复核） */
import { computed } from 'vue';
import type { FauApResult, FauModuleDef, FauRun } from '@totalclaw/ipc-contracts';
import { FAU_MATCH_GRADES, FAU_PAY_PRIORITIES } from '@totalclaw/ipc-contracts';
import {
  GAP_TIER_LABEL, MATCH_GRADE_LABEL, MATCH_QTY_LABEL, PAY_APPROVAL_LABEL, PRIORITY_LABEL, SUPPLIER_CONCLUSION_LABEL,
} from '../../../../../shared/financeAudit/accountingLabels';
import FauNum from '../../FauNum.vue';
import FauFlags from './FauFlags.vue';
import { msg } from '../../shared';

const props = defineProps<{ run: FauRun; def?: FauModuleDef }>();
const res = computed(() => props.run.result as FauApResult | undefined);
const GRADES = FAU_MATCH_GRADES;
const PRIORITIES = FAU_PAY_PRIORITIES;
</script>
