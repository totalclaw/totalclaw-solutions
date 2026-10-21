<template>
  <div v-if="res" class="fau-audit" data-test="fau-review-panel">
    <section class="fau-sec">
      <header>
        <strong class="grow">{{ $t('放行建议') }}</strong>
        <span class="fau-badge" :class="res.recommendation === 'release' ? 'ok' : 'bad'" data-test="fau-review-decision">{{ res.recommendation === 'release' ? $t('建议放行') : $t('建议暂扣') }}</span>
      </header>
      <ul v-if="res.reasons.length" class="fau-esc"><li v-for="(r, i) in res.reasons" :key="i"><i class="ri-alarm-warning-line"></i>{{ msg(r) }}</li></ul>
    </section>

    <section v-if="res.trial" class="fau-sec" data-test="fau-review-trial">
      <header><strong class="grow">{{ $t('报表勾稽') }}</strong></header>
      <ul class="fau-list">
        <li v-for="c in res.trial.checks" :key="c.id" :data-test="`fau-review-tie-${c.id}`"><span :class="c.ok ? 'fau-true' : 'fau-false'">{{ c.ok ? 'TRUE' : 'FALSE' }}</span><span class="grow">{{ msg(c.message) }}</span></li>
      </ul>
    </section>

    <section v-if="res.xls" class="fau-sec" data-test="fau-review-xls">
      <header>
        <strong class="grow">{{ $t('底稿质检') }}</strong>
        <span v-for="f in res.files || []" :key="f.file" class="fau-badge muted">{{ f.file }} · <FauNum :value="f.findings" /></span>
      </header>
      <p v-if="!res.xls.length" class="ss-muted">{{ $t('没有发现问题') }}</p>
      <div v-else class="fau-table-wrap">
        <table class="fau-table">
          <thead><tr><th>{{ $t('文件') }}</th><th>{{ $t('单元格') }}</th><th>{{ $t('规则') }}</th><th>{{ $t('严重程度') }}</th><th>{{ $t('公式') }}</th></tr></thead>
          <tbody>
            <tr v-for="f in res.xls" :key="`${f.file}:${f.id}`" :class="{ bad: f.severity === 'critical' }" :data-test="`fau-xls-${f.rule}`">
              <td>{{ f.file }}</td><td><FauNum :value="`${f.sheet}!${f.cell}`" /></td><td>{{ $t(XLS_RULE_LABEL[f.rule]) }}</td><td>{{ $t(QC_SEVERITY_LABEL[f.severity]) }}</td><td><FauNum :value="f.formula ? `=${f.formula}` : f.detail || ''" /></td>
            </tr>
          </tbody>
        </table>
      </div>
      <details v-if="res.crossRefs?.length">
        <summary>{{ $t('交叉索引') }} · <FauNum :value="res.crossRefs.filter((x) => !x.found).length" /> / <FauNum :value="res.crossRefs.length" /></summary>
        <ul class="fau-list"><li v-for="r in res.crossRefs" :key="`${r.file}:${r.ref}`"><FauNum :value="r.ref" /><span class="grow">{{ r.file }}</span><span class="fau-badge" :class="r.found ? 'ok' : 'bad'">{{ r.found ? $t('已找到') : $t('断链') }}</span></li></ul>
      </details>
    </section>

    <section v-if="res.nav" class="fau-sec" data-test="fau-review-nav">
      <header>
        <strong class="grow">{{ $t('LP 资本账户重算') }}</strong>
        <span class="fau-badge" :class="res.nav.navTies ? 'ok' : 'bad'">{{ $t('LP 期末资本合计 = 基金净值') }}</span>
      </header>
      <div class="fau-table-wrap">
        <table class="fau-table">
          <thead><tr><th>{{ $t('LP 编号') }}</th><th>{{ $t('行项目') }}</th><th class="num">{{ $t('对账单金额') }}</th><th class="num">{{ $t('重算金额') }}</th><th class="num">{{ $t('差额') }}</th><th>{{ $t('放行建议') }}</th></tr></thead>
          <tbody>
            <template v-for="lp in res.nav.lps" :key="lp.lpId">
              <tr v-for="l in lp.lines" :key="`${lp.lpId}:${l.line}`" :class="{ bad: !l.ok }" :data-test="`fau-nav-${lp.lpId}-${l.line}`">
                <td><FauNum :value="lp.lpId" /></td><td>{{ $t(NAV_LINE_LABEL[l.line]) }}</td><td class="num"><FauNum :cents="l.statement" /></td><td class="num"><FauNum :cents="l.recomputed" /></td><td class="num"><FauNum :cents="l.diff" /></td>
                <td><span class="fau-badge" :class="lp.decision === 'release' ? 'ok' : 'bad'" :data-test="`fau-nav-decision-${lp.lpId}`">{{ lp.decision === 'release' ? $t('建议放行') : $t('建议暂扣') }}</span></td>
              </tr>
            </template>
          </tbody>
        </table>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
/** B4 报表与底稿复核：第 ④ 步结果——放行 / 暂扣建议、报表勾稽、底稿质检与交叉索引、LP 逐行比对。 */
import { computed } from 'vue';
import type { FauModuleDef, FauReviewResult, FauRun } from '@totalclaw/ipc-contracts';
import { NAV_LINE_LABEL, QC_SEVERITY_LABEL, XLS_RULE_LABEL } from '../../../../../shared/financeAudit/auditLabels';
import FauNum from '../../FauNum.vue';
import { msg } from '../../shared';
import './audit.css';

const props = defineProps<{ run: FauRun; def: FauModuleDef }>();
const res = computed(() => props.run.result as FauReviewResult | undefined);
</script>
