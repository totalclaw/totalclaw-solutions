<template>
  <div v-if="res" class="fau-audit" data-test="fau-fraud-panel">
    <section class="fau-sec" data-test="fau-fraud-benford">
      <header>
        <strong class="grow">{{ $t('本福特检验') }}</strong>
        <span class="fau-badge" :class="BEN_CLASS[res.benford.conformity]" data-test="fau-benford-conformity">{{ $t(BENFORD_LABEL[res.benford.conformity]) }}</span>
        <span class="fau-badge muted">n <FauNum :value="res.benford.n" /> · MAD <FauNum :value="res.benford.mad.toFixed(4)" /></span>
      </header>
      <div class="fau-table-wrap">
        <table class="fau-table">
          <thead><tr><th>{{ $t('首位数字') }}</th><th v-for="d in 9" :key="d" class="num"><FauNum :value="d" /></th></tr></thead>
          <tbody>
            <tr><td>{{ $t('实际占比') }}</td><td v-for="(o, i) in res.benford.observed" :key="i" class="num" :class="{ bad: res.benford.spikes.includes(i + 1) }"><FauNum :ratio="o" /></td></tr>
            <tr><td>{{ $t('期望占比') }}</td><td v-for="(e, i) in res.benford.expected" :key="i" class="num"><FauNum :ratio="e" /></td></tr>
          </tbody>
        </table>
      </div>
    </section>

    <section class="fau-sec" data-test="fau-fraud-hits">
      <header>
        <strong class="grow">{{ $t('异常清单') }}</strong>
        <span v-for="c in res.coverage.filter((x) => x.hits > 0)" :key="c.rule" class="fau-badge warn" :data-test="`fau-fraud-rule-${c.rule}`">{{ $t(FRAUD_RULE_LABEL[c.rule] || c.rule) }} <FauNum :value="c.hits" /></span>
      </header>
      <details>
        <summary>{{ $t('规则覆盖') }}</summary>
        <ul class="fau-list"><li v-for="c in res.coverage" :key="c.rule"><span class="grow">{{ $t(FRAUD_RULE_LABEL[c.rule] || c.rule) }}</span><span class="fau-badge" :class="c.status === 'ran' ? 'ok' : 'muted'">{{ c.status === 'ran' ? $t('已执行') : $t('不适用') }}</span></li></ul>
      </details>
      <p v-if="!res.hits.length" class="ss-muted">{{ $t('没有异常') }}</p>
      <div v-else class="fau-table-wrap">
        <table class="fau-table">
          <thead><tr><th>{{ $t('规则') }}</th><th>{{ $t('风险') }}</th><th>{{ $t('单号 / 对象') }}</th><th class="num">{{ $t('金额') }}</th><th>{{ $t('说明') }}</th></tr></thead>
          <tbody>
            <tr v-for="h in res.hits" :key="h.id" :class="{ bad: h.level === 'high', warn: h.level === 'warn' }">
              <td>{{ $t(FRAUD_RULE_LABEL[h.rule] || h.rule) }}</td><td>{{ $t(LEVEL_LABEL[h.level]) }}</td><td><FauNum :value="h.refs.join(', ')" /></td><td class="num"><FauNum :cents="h.amount" /></td><td class="wrap">{{ h.detail }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <section v-if="res.plan.length || res.summary" class="fau-sec" data-test="fau-fraud-plan">
      <header><strong class="grow">{{ $t('调查计划（草稿，须批准立项）') }}</strong><span v-if="res.summaryStatus === 'unverified'" class="fau-badge bad">{{ $t('摘要未核实') }}</span></header>
      <p class="wrap">{{ res.summary }}</p>
      <ol class="fau-steps-list">
        <li v-for="s in res.plan" :key="s.id"><strong>{{ s.objective }}</strong> — {{ s.procedure }} <span v-if="!s.verified" class="fau-badge bad">{{ $t('未核实') }}</span></li>
      </ol>
    </section>
  </div>
</template>

<script setup lang="ts">
/** B5 舞弊排查：第 ④ 步结果——本福特检验、异常清单（带证据）、规则覆盖、调查计划草稿。 */
import { computed } from 'vue';
import type { FauBenfordResult, FauFraudResult, FauModuleDef, FauRun } from '@totalclaw/ipc-contracts';
import { i18nKey } from '../../../../i18n';
import { BENFORD_LABEL, FRAUD_RULE_LABEL } from '../../../../../shared/financeAudit/auditLabels';
import FauNum from '../../FauNum.vue';
import './audit.css';

const props = defineProps<{ run: FauRun; def: FauModuleDef }>();
const res = computed(() => props.run.result as FauFraudResult | undefined);
const LEVEL_LABEL = { high: i18nKey('高'), warn: i18nKey('中'), info: i18nKey('低') };
const BEN_CLASS: Record<FauBenfordResult['conformity'], string> = { close: 'ok', acceptable: 'ok', marginal: 'warn', nonconformity: 'bad', insufficient: 'muted' };
</script>

<style scoped>
.fau-steps-list { margin: 0; padding-inline-start: 18px; display: grid; gap: 4px; font-size: 12.5px; }
</style>
