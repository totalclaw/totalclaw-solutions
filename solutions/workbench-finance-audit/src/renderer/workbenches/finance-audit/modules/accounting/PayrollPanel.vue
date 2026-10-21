<template>
  <div v-if="res" class="fau-acc" data-test="fau-payroll-panel">
    <section class="fau-acc-sec">
      <header>
        <strong>{{ $t('薪资复核表') }} · {{ $t(PAYROLL_REGIME_LABEL[res.regime]) }}</strong>
        <span class="fau-badge muted">{{ $t('人数') }} <FauNum :value="res.totals.headcount" /></span>
        <span class="fau-badge">{{ $t('应发合计') }} <FauNum :cents="res.totals.gross" /></span>
        <span class="fau-badge">{{ $t('实发合计') }} <FauNum :cents="res.totals.net" /></span>
        <span class="fau-badge muted">{{ $t('单位负担') }} <FauNum :cents="res.totals.employer" /></span>
        <span v-if="res.regime === 'sa'" class="fau-badge warn" data-test="fau-pay-eosb-total">{{ $t('期末服务金本期计提') }} <FauNum :cents="res.totals.eosbAccrual" /></span>
      </header>
      <p v-if="res.regime === 'sa'" class="ss-note warn"><i class="ri-scales-3-line"></i>{{ $t('沙特 GOSI 比例与期末服务金口径为草稿口径，待当地专业人员审核') }}</p>
      <div class="fau-table-wrap">
        <table class="fau-table">
          <thead>
            <tr>
              <th>{{ $t('员工编号') }}</th><th>{{ $t('姓名') }}</th><th class="num">{{ $t('应发合计') }}</th>
              <th class="num">{{ res.regime === 'sa' ? $t('GOSI 个人应扣') : $t('个人扣款（应扣）') }}</th><th class="num">{{ $t('个人扣款（实扣）') }}</th>
              <template v-if="res.regime === 'cn'"><th class="num">{{ $t('个税应扣') }}</th><th class="num">{{ $t('个税实扣') }}</th></template>
              <template v-if="res.regime === 'sa'"><th class="num">{{ $t('服务年限') }}</th><th class="num">{{ $t('期末服务金（重算）') }}</th><th class="num">{{ $t('期末服务金（账面）') }}</th></template>
              <th class="num">{{ $t('实发（重算）') }}</th><th>{{ $t('提示') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="l in res.lines" :key="l.empId" :class="{ bad: l.flags.some((f) => f.level === 'block'), warn: l.flags.some((f) => f.level === 'warn') }" :data-test="`fau-pay-emp-${l.empId}`">
              <td><FauNum :value="l.empId" /></td>
              <td>{{ l.name }}</td>
              <td class="num"><FauNum :cents="l.gross" /></td>
              <td class="num"><FauNum :cents="l.personalExpected" /></td>
              <td class="num"><FauNum :cents="l.personal" /></td>
              <template v-if="res.regime === 'cn'">
                <td class="num" data-test="iit-expected"><FauNum :cents="l.iitExpected" /></td>
                <td class="num"><FauNum :cents="l.iitWithheld" /></td>
              </template>
              <template v-if="res.regime === 'sa'">
                <td class="num"><FauNum :value="l.eosb?.years ?? '-'" /></td>
                <td class="num" data-test="eosb"><FauNum :cents="l.eosb?.liability ?? null" /></td>
                <td class="num"><FauNum :cents="l.eosb?.booked ?? null" /></td>
              </template>
              <td class="num"><FauNum :cents="l.netExpected" /></td>
              <td class="wrap"><FauFlags :flags="l.flags" /></td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <section v-if="res.changes" class="fau-acc-sec" data-test="fau-pay-changes">
      <header><strong>{{ $t('增减员') }}</strong></header>
      <p v-if="!res.changes.length" class="ss-muted">{{ $t('无') }}</p>
      <ul v-else class="fau-list">
        <li v-for="c in res.changes" :key="`${c.kind}-${c.empId}`"><span class="fau-badge" :class="c.kind === 'hire' ? 'ok' : 'muted'">{{ c.kind === 'hire' ? $t('新增') : $t('减员') }}</span><FauNum :value="c.empId" /><span class="grow">{{ c.name }}</span><FauFlags :flags="c.flags.filter((f) => f.level !== 'info')" /></li>
      </ul>
    </section>

    <p v-if="res.je.length" class="ss-note info" data-test="fau-pay-je"><i class="ri-file-list-3-line"></i>{{ $t('工资计提分录草稿 {n} 行，借贷合计相等，只出导入格式，不过账', { n: res.je.length }) }}</p>
    <ul v-if="res.escalations.length" class="fau-acc-esc" data-test="fau-pay-escalations">
      <li v-for="(e, i) in res.escalations" :key="i"><i class="ri-alarm-warning-line"></i>{{ msg(e) }}</li>
    </ul>
  </div>
</template>

<script setup lang="ts">
/** A7 薪酬核算：第 ④ 步结果（中国个税累计预扣 / 沙特 GOSI 与期末服务金 / 国际参数化） */
import { computed } from 'vue';
import type { FauModuleDef, FauPayrollResult, FauRun } from '@totalclaw/ipc-contracts';
import { PAYROLL_REGIME_LABEL } from '../../../../../shared/financeAudit/accountingLabels';
import FauNum from '../../FauNum.vue';
import FauFlags from './FauFlags.vue';
import { msg } from '../../shared';

const props = defineProps<{ run: FauRun; def?: FauModuleDef }>();
const res = computed(() => props.run.result as FauPayrollResult | undefined);
</script>
