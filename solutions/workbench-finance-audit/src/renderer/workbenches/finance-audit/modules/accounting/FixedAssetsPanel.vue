<template>
  <div v-if="res" class="fau-acc" data-test="fau-fa-panel">
    <section class="fau-acc-sec">
      <header>
        <strong>{{ $t('折旧核对表') }}</strong>
        <span class="fau-badge" :class="diffs.length ? 'warn' : 'ok'" data-test="fau-fa-diffs">{{ $t('差异') }} <FauNum :value="diffs.length" /></span>
        <label class="fau-badge muted"><input v-model="all" type="checkbox" /> {{ $t('显示全部资产') }}</label>
      </header>
      <div class="fau-table-wrap">
        <table class="fau-table">
          <thead><tr><th>{{ $t('资产编号') }}</th><th>{{ $t('资产名称') }}</th><th>{{ $t('折旧方法') }}</th><th class="num">{{ $t('原值') }}</th><th class="num">{{ $t('本期应提（重算）') }}</th><th class="num">{{ $t('本期账面') }}</th><th class="num">{{ $t('本期差异') }}</th><th class="num">{{ $t('累计折旧（重算）') }}</th><th class="num">{{ $t('累计差异') }}</th><th>{{ $t('提示') }}</th></tr></thead>
          <tbody>
            <tr v-for="l in shown" :key="l.assetNo" :class="{ bad: l.flags.some((f) => f.level === 'block'), warn: l.flags.some((f) => f.level === 'warn') }" :data-test="`fau-fa-asset-${l.assetNo}`">
              <td><FauNum :value="l.assetNo" /></td>
              <td>{{ l.name }}</td>
              <td>{{ $t(DEP_METHOD_LABEL[l.method]) }}</td>
              <td class="num"><FauNum :cents="l.cost" /></td>
              <td class="num" data-test="expected"><FauNum :cents="l.expectedPeriod" /></td>
              <td class="num"><FauNum :cents="l.bookedPeriod" /></td>
              <td class="num" data-test="diff"><FauNum :cents="l.diffPeriod" /></td>
              <td class="num"><FauNum :cents="l.expectedAccum" /></td>
              <td class="num"><FauNum :cents="l.diffAccum" /></td>
              <td class="wrap"><FauFlags :flags="l.flags" /></td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <section class="fau-acc-sec" data-test="fau-fa-roll">
      <header><strong>{{ $t('资产滚动表') }}</strong></header>
      <div class="fau-table-wrap">
        <table class="fau-table">
          <thead><tr><th>{{ $t('资产类别') }}</th><th class="num">{{ $t('期初原值') }}</th><th class="num">{{ $t('本期新增') }}</th><th class="num">{{ $t('本期处置') }}</th><th class="num">{{ $t('期末原值') }}</th><th class="num">{{ $t('期初累计折旧') }}</th><th class="num">{{ $t('本期折旧') }}</th><th class="num">{{ $t('处置转出折旧') }}</th><th class="num">{{ $t('期末累计折旧') }}</th><th class="num">{{ $t('期末净值') }}</th></tr></thead>
          <tbody>
            <tr v-for="r in res.roll" :key="r.category">
              <td>{{ r.category }}</td>
              <td class="num"><FauNum :cents="r.openingCost" /></td>
              <td class="num"><FauNum :cents="r.additions" /></td>
              <td class="num"><FauNum :cents="r.disposals" /></td>
              <td class="num"><FauNum :cents="r.closingCost" /></td>
              <td class="num"><FauNum :cents="r.openingAccum" /></td>
              <td class="num"><FauNum :cents="r.depreciation" /></td>
              <td class="num"><FauNum :cents="r.disposalAccum" /></td>
              <td class="num"><FauNum :cents="r.closingAccum" /></td>
              <td class="num"><FauNum :cents="r.nbv" /></td>
            </tr>
          </tbody>
        </table>
      </div>
      <div v-if="res.glTie" class="fau-acc-kpis">
        <span v-for="g in res.glTie" :key="g.item" class="fau-badge" :class="g.diff ? 'bad' : 'ok'">{{ g.item === 'cost' ? $t('原值') : $t('累计折旧') }} · {{ $t('与总账差') }} <FauNum :cents="g.diff" /></span>
      </div>
    </section>

    <section v-if="res.disposals.length || res.additions.length" class="fau-acc-sec" data-test="fau-fa-review">
      <header><strong>{{ $t('购置与处置审核') }}</strong></header>
      <div v-if="res.disposals.length" class="fau-table-wrap">
        <table class="fau-table">
          <thead><tr><th>{{ $t('资产编号') }}</th><th>{{ $t('处置日期') }}</th><th class="num">{{ $t('账面净值') }}</th><th class="num">{{ $t('净收入') }}</th><th class="num">{{ $t('处置损益') }}</th><th>{{ $t('提示') }}</th></tr></thead>
          <tbody>
            <tr v-for="d in res.disposals" :key="`${d.assetNo}-${d.row}`" :data-test="`fau-fa-disposal-${d.assetNo}`">
              <td><FauNum :value="d.assetNo" /></td>
              <td><FauNum :value="d.date" /></td>
              <td class="num"><FauNum :cents="d.nbv" /></td>
              <td class="num"><FauNum :cents="d.net" /></td>
              <td class="num" data-test="gain"><FauNum :cents="d.gainLoss" /></td>
              <td class="wrap"><FauFlags :flags="d.flags" /></td>
            </tr>
          </tbody>
        </table>
      </div>
      <ul v-if="res.additions.length" class="fau-list">
        <li v-for="a in res.additions" :key="`${a.assetNo}-${a.row}`"><FauNum :value="a.assetNo" /><span class="grow">{{ a.name }}</span><FauNum :cents="a.amount" /><FauFlags :flags="a.flags" :ok-text="$t('符合资本化条件')" /></li>
      </ul>
      <p v-if="res.je.length" class="ss-note info"><i class="ri-file-list-3-line"></i>{{ $t('处置分录草稿 {n} 行，借贷合计相等，只出导入格式，不过账', { n: res.je.length }) }}</p>
    </section>

    <ul v-if="res.escalations.length" class="fau-acc-esc" data-test="fau-fa-escalations">
      <li v-for="(e, i) in res.escalations" :key="i"><i class="ri-alarm-warning-line"></i>{{ msg(e) }}</li>
    </ul>
  </div>
</template>

<script setup lang="ts">
/** A6 固定资产：第 ④ 步结果（折旧重算差异、资产滚动表、购置与处置审核） */
import { computed, ref } from 'vue';
import type { FauFaResult, FauModuleDef, FauRun } from '@totalclaw/ipc-contracts';
import { DEP_METHOD_LABEL } from '../../../../../shared/financeAudit/accountingLabels';
import FauNum from '../../FauNum.vue';
import FauFlags from './FauFlags.vue';
import { msg } from '../../shared';

const props = defineProps<{ run: FauRun; def?: FauModuleDef }>();
const res = computed(() => props.run.result as FauFaResult | undefined);
const all = ref(false);
const diffs = computed(() => (res.value?.lines || []).filter((l) => l.flags.some((f) => f.level !== 'info')));
const shown = computed(() => (all.value || !diffs.value.length ? res.value?.lines || [] : diffs.value));
</script>
