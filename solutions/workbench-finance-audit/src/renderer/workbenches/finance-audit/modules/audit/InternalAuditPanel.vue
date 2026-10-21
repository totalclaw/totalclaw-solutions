<template>
  <div v-if="res" class="fau-audit" data-test="fau-ia-panel">
    <section v-if="res.plan" class="fau-sec" data-test="fau-ia-plan">
      <header>
        <strong class="grow">{{ $t('年度审计计划') }}</strong>
        <label class="fau-row"><span class="ss-muted">{{ $t('年度可用审计人天') }}</span><input v-model.number="days" type="number" min="0" :disabled="!editable" data-test="fau-ia-days" /></label>
        <button type="button" class="ss-btn sm" :disabled="busy || !editable" @click="setParams({ availableDays: Number(days) || 0 })">{{ $t('按新人天重算') }}</button>
      </header>
      <div class="fau-counts">
        <span class="fau-badge">{{ $t('需求人天') }} <FauNum :value="res.plan.requiredDays" /></span>
        <span class="fau-badge">{{ $t('可用人天') }} <FauNum :value="res.plan.availableDays" /></span>
        <span class="fau-badge" :class="res.plan.gap > 0 ? 'bad' : 'ok'" data-test="fau-ia-gap">{{ $t('缺口') }} <FauNum :value="res.plan.gap" /></span>
      </div>
      <div class="fau-table-wrap">
        <table class="fau-table">
          <thead><tr><th>{{ $t('审计领域') }}</th><th>{{ $t('可能性') }}</th><th>{{ $t('影响') }}</th><th>{{ $t('风险等级') }}</th><th>{{ $t('必审') }}</th><th class="num">{{ $t('预计人天') }}</th><th>{{ $t('季度') }}</th></tr></thead>
          <tbody>
            <tr v-for="a in res.plan.areas" :key="a.id" :class="{ warn: !a.included }" :data-test="`fau-ia-area-${a.id}`">
              <td>{{ a.name }}</td><td>{{ $t(IMPACT_LABEL[a.likelihood]) }}</td><td>{{ $t(IMPACT_LABEL[a.impact]) }}</td>
              <td><span class="fau-badge" :class="a.risk === 'high' ? 'bad' : a.risk === 'medium' ? 'warn' : 'muted'">{{ $t(IMPACT_LABEL[a.risk]) }}</span></td>
              <td>{{ a.mandatory ? $t('是') : '' }}</td><td class="num"><FauNum :value="a.days" /></td>
              <td>{{ a.included ? a.quarter : $t('未纳入') }}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <p class="wrap">{{ res.plan.narrative }} <span v-if="res.plan.narrativeStatus === 'unverified'" class="fau-badge bad">{{ $t('未核实') }}</span></p>
    </section>

    <section v-if="res.mode === 'fieldwork'" class="fau-sec" data-test="fau-ia-fieldwork">
      <header><strong class="grow">{{ $t('审计发现') }}</strong><span class="fau-badge">{{ $t('审计程序') }} <FauNum :value="res.procedures?.length || 0" /></span></header>
      <p v-if="!res.findings?.length" class="ss-muted">{{ $t('没有能引用原文的发现') }}</p>
      <div v-else class="fau-table-wrap">
        <table class="fau-table">
          <thead><tr><th>{{ $t('编号') }}</th><th>{{ $t('标题') }}</th><th>{{ $t('严重程度') }}</th><th>{{ $t('建议') }}</th><th>{{ $t('原文依据') }}</th></tr></thead>
          <tbody>
            <tr v-for="f in res.findings" :key="f.id" :class="{ bad: f.severity === 'major' }">
              <td><FauNum :value="f.id" /></td><td class="wrap">{{ f.title }}</td>
              <td><span class="fau-badge" :class="f.severity === 'major' ? 'bad' : f.severity === 'moderate' ? 'warn' : 'muted'">{{ $t(SEVERITY_LABEL[f.severity]) }}</span></td>
              <td class="wrap">{{ f.recommendation }}</td><td class="wrap"><small class="fau-quote">{{ f.quote }} · {{ f.docName }}</small></td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <section v-if="res.tracked" class="fau-sec" data-test="fau-ia-tracking">
      <header>
        <strong class="grow">{{ $t('发现整改台账') }}</strong>
        <label class="fau-row"><span class="ss-muted">{{ $t('截至日') }}</span><input v-model="asOf" type="date" :disabled="!editable" /></label>
        <button type="button" class="ss-btn sm" :disabled="busy || !editable" @click="setParams({ asOf })">{{ $t('按截至日重算') }}</button>
      </header>
      <div class="fau-counts">
        <span v-for="t in TIERS" :key="t" class="fau-badge" :class="t >= 2 ? 'bad' : t === 1 ? 'warn' : 'muted'" :data-test="`fau-ia-tier-${t}`">{{ $t(TIER_LABEL[t]) }} <FauNum :value="res.tracked.filter((f) => f.tier === t && f.status !== 'closed').length" /></span>
      </div>
      <div class="fau-table-wrap">
        <table class="fau-table">
          <thead><tr><th>{{ $t('编号') }}</th><th>{{ $t('标题') }}</th><th>{{ $t('严重程度') }}</th><th>{{ $t('负责人') }}</th><th>{{ $t('整改期限') }}</th><th>{{ $t('状态') }}</th><th class="num">{{ $t('超期天数') }}</th><th>{{ $t('升级') }}</th></tr></thead>
          <tbody>
            <tr v-for="f in res.tracked" :key="f.id" :class="{ bad: f.tier >= 2, warn: f.tier === 1 }" :data-test="`fau-ia-track-${f.id}`">
              <td><FauNum :value="f.id" /></td><td class="wrap">{{ f.title }}</td><td>{{ $t(SEVERITY_LABEL[f.severity]) }}</td><td>{{ f.owner }}</td>
              <td><FauNum :value="f.dueDate" /></td><td>{{ $t(TRACK_STATUS_LABEL[f.status]) }}</td><td class="num"><FauNum :value="f.overdueDays || ''" /></td><td>{{ $t(TIER_LABEL[f.tier]) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
    <p v-if="error" class="ss-note danger"><i class="ri-error-warning-line"></i>{{ error }}</p>
  </div>
</template>

<script setup lang="ts">
/** B2 内部审计：第 ④ 步结果——年度计划（可改可用人天重算）、流程合规审计发现、整改台账超期分级（可改截至日）。 */
import { computed, ref } from 'vue';
import type { FauInternalAuditResult, FauModuleDef, FauRun } from '@totalclaw/ipc-contracts';
import { IMPACT_LABEL, SEVERITY_LABEL, TIER_LABEL, TRACK_STATUS_LABEL } from '../../../../../shared/financeAudit/auditLabels';
import FauNum from '../../FauNum.vue';
import { errorMessage, fau } from '../../shared';
import './audit.css';

const props = defineProps<{ run: FauRun; def: FauModuleDef }>();
const emit = defineEmits<{ (e: 'changed'): void }>();
const res = computed(() => props.run.result as FauInternalAuditResult | undefined);
const editable = computed(() => !['signing', 'archived', 'void'].includes(props.run.status));
const busy = ref(false);
const error = ref('');
const days = ref<number>(res.value?.plan?.availableDays ?? 240);
const asOf = ref<string>(res.value?.asOf || '');
const TIERS = [3, 2, 1] as const;

async function setParams(params: Record<string, unknown>): Promise<void> {
  busy.value = true; error.value = '';
  try { await fau('audit.params.set', { runId: props.run.id, moduleId: 'internal-audit', params }); emit('changed'); } catch (e) { error.value = errorMessage(e); } finally { busy.value = false; }
}
</script>
