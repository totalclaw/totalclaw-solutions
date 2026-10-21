<template>
  <div v-if="res" class="fau-acc" data-test="fau-ic-panel">
    <section v-if="res.pairs.length" class="fau-acc-sec">
      <header>
        <strong>{{ $t('对账汇总') }}</strong>
        <span class="fau-badge" :class="res.breaks.length ? 'warn' : 'ok'">{{ $t('差异') }} <FauNum :value="res.breaks.length" /></span>
        <span class="fau-badge" :class="res.balanced ? 'ok' : 'bad'" data-test="fau-ic-balanced">{{ res.balanced ? $t('抵销分录借贷平衡') : $t('抵销分录借贷不平') }}</span>
      </header>
      <div class="fau-table-wrap">
        <table class="fau-table">
          <thead><tr><th>{{ $t('配对类别') }}</th><th>{{ $t('本方公司') }}</th><th>{{ $t('对方公司') }}</th><th class="num">{{ $t('本方金额') }}</th><th class="num">{{ $t('对方金额') }}</th><th class="num">{{ $t('差额') }}</th><th class="num">{{ $t('抵销金额') }}</th></tr></thead>
          <tbody>
            <tr v-for="(p, i) in res.pairs" :key="i" :class="{ warn: p.diff !== 0 }" :data-test="`fau-ic-pair-${p.pair}-${p.entity}`">
              <td>{{ $t(IC_PAIR_LABEL[p.pair]) }}</td>
              <td>{{ p.entity }}</td>
              <td>{{ p.counterparty }}</td>
              <td class="num"><FauNum :cents="p.own" /></td>
              <td class="num"><FauNum :cents="p.other" /></td>
              <td class="num"><FauNum :cents="p.diff" /></td>
              <td class="num" data-test="eliminated"><FauNum :cents="p.eliminated" /></td>
            </tr>
          </tbody>
        </table>
      </div>
      <details v-if="res.breaks.length" :open="res.breaks.length <= 10">
        <summary>{{ $t('差异明细') }}</summary>
        <div class="fau-table-wrap">
          <table class="fau-table">
            <thead><tr><th>{{ $t('配对类别') }}</th><th>{{ $t('本方公司') }}</th><th>{{ $t('对账键') }}</th><th>{{ $t('分类') }}</th><th class="num">{{ $t('本方金额') }}</th><th class="num">{{ $t('对方金额') }}</th><th class="num">{{ $t('差额') }}</th></tr></thead>
            <tbody>
              <tr v-for="b in res.breaks" :key="b.id">
                <td>{{ $t(IC_PAIR_LABEL[b.pair]) }}</td><td>{{ b.entity }}</td><td><FauNum :value="b.key" /></td><td>{{ $t(IC_CLASS_LABEL[b.cls] || b.cls) }}</td>
                <td class="num"><FauNum :cents="b.own" /></td><td class="num"><FauNum :cents="b.other" /></td><td class="num"><FauNum :cents="b.diff" /></td>
              </tr>
            </tbody>
          </table>
        </div>
      </details>
      <p class="ss-note info"><i class="ri-information-line"></i>{{ $t('抵销分录不含存货中的未实现内部利润，需按毛利率与期末结存另行计算') }}</p>
    </section>

    <section v-if="res.guarantees" class="fau-acc-sec" data-test="fau-ic-guarantees">
      <header><strong>{{ $t('担保检查') }}</strong></header>
      <div class="fau-table-wrap">
        <table class="fau-table">
          <thead><tr><th>{{ $t('担保方') }}</th><th>{{ $t('被担保方') }}</th><th class="num">{{ $t('担保金额') }}</th><th>{{ $t('到期日') }}</th><th class="num">{{ $t('担保余额 / 净资产') }}</th><th>{{ $t('提示') }}</th></tr></thead>
          <tbody>
            <tr v-for="g in res.guarantees" :key="g.row" :class="{ bad: g.flags.some((f) => f.level === 'block'), warn: g.flags.some((f) => f.level === 'warn') }">
              <td>{{ g.guarantor }}</td><td>{{ g.beneficiary }}</td><td class="num"><FauNum :cents="g.amount" /></td><td><FauNum :value="g.endDate" /></td>
              <td class="num"><FauNum :ratio="g.ratio" /></td><td class="wrap"><FauFlags :flags="g.flags" /></td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <section v-if="res.pricing" class="fau-acc-sec" data-test="fau-ic-pricing">
      <header><strong>{{ $t('内部定价偏离') }}</strong></header>
      <div class="fau-table-wrap">
        <table class="fau-table">
          <thead><tr><th>{{ $t('本方公司') }}</th><th>{{ $t('对方公司') }}</th><th>{{ $t('往来类型 / 科目') }}</th><th class="num">{{ $t('内部价格') }}</th><th class="num">{{ $t('市场价格') }}</th><th class="num">{{ $t('偏离率') }}</th><th>{{ $t('结论') }}</th></tr></thead>
          <tbody>
            <tr v-for="p in res.pricing" :key="p.row" :class="{ warn: p.flagged }">
              <td>{{ p.entity }}</td><td>{{ p.counterparty }}</td><td>{{ p.type }}</td>
              <td class="num"><FauNum :value="p.internalPrice" /></td><td class="num"><FauNum :value="p.marketPrice" /></td><td class="num"><FauNum :ratio="p.deviation" /></td>
              <td>{{ p.flagged ? $t('偏离，转转让定价') : $t('在范围内') }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <ul v-if="res.escalations.length" class="fau-acc-esc" data-test="fau-ic-escalations">
      <li v-for="(e, i) in res.escalations" :key="i"><i class="ri-alarm-warning-line"></i>{{ msg(e) }}</li>
    </ul>
  </div>
</template>

<script setup lang="ts">
/** A8 合并与内部往来：第 ④ 步结果（双边匹配、抵销分录、担保检查、内部定价偏离） */
import { computed } from 'vue';
import type { FauIcResult, FauModuleDef, FauRun } from '@totalclaw/ipc-contracts';
import { IC_CLASS_LABEL, IC_PAIR_LABEL } from '../../../../../shared/financeAudit/accountingLabels';
import FauNum from '../../FauNum.vue';
import FauFlags from './FauFlags.vue';
import { msg } from '../../shared';

const props = defineProps<{ run: FauRun; def?: FauModuleDef }>();
const res = computed(() => props.run.result as FauIcResult | undefined);
</script>
