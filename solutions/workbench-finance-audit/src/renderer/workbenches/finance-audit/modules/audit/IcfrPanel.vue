<template>
  <div v-if="res" class="fau-audit" data-test="fau-icfr-panel">
    <section v-if="res.mode === 'design'" class="fau-sec">
      <header><strong class="grow">{{ $t('风险控制矩阵（草稿）') }}</strong><span class="fau-badge warn">{{ $t('起草的控制须经测试才能下结论') }}</span></header>
      <div class="fau-table-wrap">
        <table class="fau-table">
          <thead><tr><th>{{ $t('控制编号') }}</th><th>{{ $t('流程') }}</th><th>{{ $t('控制描述') }}</th><th>{{ $t('频率') }}</th><th>{{ $t('关键控制') }}</th><th>{{ $t('回核') }}</th></tr></thead>
          <tbody>
            <tr v-for="c in res.controls" :key="c.id" :class="{ warn: !c.verified }" :data-test="`fau-rcm-${c.id}`">
              <td><FauNum :value="c.id" /></td><td>{{ c.process }}</td>
              <td class="wrap">{{ c.description }}<br><small class="fau-quote">{{ c.quote }}</small></td>
              <td>{{ $t(FREQ_LABEL[c.frequency]) }}</td><td>{{ c.key ? $t('是') : '' }}</td>
              <td><span class="fau-badge" :class="c.verified ? 'ok' : 'bad'">{{ c.verified ? $t('已核实') : $t('未核实') }}</span></td>
            </tr>
          </tbody>
        </table>
      </div>
      <details :open="res.approvalMatrix.length > 0">
        <summary>{{ $t('审批矩阵') }} · <FauNum :value="res.approvalMatrix.length" /></summary>
        <div class="fau-table-wrap">
          <table class="fau-table">
            <thead><tr><th>{{ $t('事项') }}</th><th>{{ $t('权限条件') }}</th><th>{{ $t('审批人') }}</th><th>{{ $t('原文依据') }}</th></tr></thead>
            <tbody><tr v-for="(a, i) in res.approvalMatrix" :key="i"><td>{{ a.matter }}</td><td>{{ a.threshold }}</td><td>{{ a.approver }}</td><td class="wrap"><small class="fau-quote">{{ a.quote }}</small></td></tr></tbody>
          </table>
        </div>
      </details>
    </section>

    <section v-if="res.mode === 'testing'" class="fau-sec" data-test="fau-icfr-plans">
      <header>
        <strong class="grow">{{ $t('抽样计划') }}</strong>
        <label class="fau-row"><span class="ss-muted">{{ $t('随机种子') }}</span><input v-model.number="seed" type="number" min="0" :disabled="!editable" data-test="fau-icfr-seed" /></label>
        <button type="button" class="ss-btn sm" :disabled="busy || !editable" data-test="fau-icfr-reseed" @click="reseed">{{ $t('按这个种子重新抽样') }}</button>
      </header>
      <div class="fau-table-wrap">
        <table class="fau-table">
          <thead><tr><th>{{ $t('控制编号') }}</th><th>{{ $t('频率') }}</th><th class="num">{{ $t('总体数量') }}</th><th class="num">{{ $t('属性抽样样本量') }}</th><th class="num">{{ $t('频率最小样本量') }}</th><th class="num">{{ $t('样本量') }}</th><th>{{ $t('随机种子') }}</th><th>{{ $t('结论') }}</th></tr></thead>
          <tbody>
            <tr v-for="p in res.plans" :key="p.controlId" :data-test="`fau-plan-${p.controlId}`">
              <td><FauNum :value="p.controlId" /></td><td>{{ $t(FREQ_LABEL[p.frequency]) }}</td>
              <td class="num"><FauNum :value="p.population" /></td><td class="num"><FauNum :value="p.attributeN" /></td><td class="num"><FauNum :value="p.frequencyMin" /></td>
              <td class="num" :data-test="`fau-plan-n-${p.controlId}`"><FauNum :value="p.n" /><span v-if="p.testAll" class="fau-badge muted">{{ $t('全量测试') }}</span></td>
              <td><FauNum :value="p.seed" /></td>
              <td><span class="fau-badge" :class="CONCLUSION_CLASS[testOf(p.controlId)?.conclusion || 'pending']">{{ $t(CONCLUSION_LABEL[testOf(p.controlId)?.conclusion || 'pending']) }}</span></td>
            </tr>
          </tbody>
        </table>
      </div>
      <details open>
        <summary>{{ $t('样本明细与测试结论') }} · <FauNum :value="res.samples.length" /></summary>
        <div class="fau-table-wrap">
          <table class="fau-table">
            <thead><tr><th>{{ $t('控制编号') }}</th><th class="num">{{ $t('序号') }}</th><th>{{ $t('单号') }}</th><th>{{ $t('日期') }}</th><th class="num">{{ $t('金额') }}</th><th>{{ $t('测试结论') }}</th></tr></thead>
            <tbody>
              <tr v-for="s in res.samples" :key="`${s.controlId}#${s.row}`" :class="{ bad: s.result === 'fail' }">
                <td><FauNum :value="s.controlId" /></td><td class="num"><FauNum :value="s.seq" /></td><td><FauNum :value="s.ref" /></td><td><FauNum :value="s.date" /></td><td class="num"><FauNum :cents="s.amount" /></td>
                <td>
                  <span class="fau-seg">
                    <button v-for="r in RESULTS" :key="r" type="button" :class="{ on: s.result === r }" :disabled="busy || !editable" :data-test="`fau-sample-${s.controlId}-${s.seq}-${r}`" @click="setResult(s.controlId, s.row, r)">{{ $t(RESULT_LABEL[r]) }}</button>
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </details>
    </section>

    <section v-if="res.mode !== 'design'" class="fau-sec" data-test="fau-icfr-deficiencies">
      <header>
        <strong class="grow">{{ $t('缺陷评估') }}</strong>
        <span v-for="g in GRADES" :key="g" class="fau-badge" :class="GRADE_CLASS[g]" :data-test="`fau-grade-count-${g}`">{{ $t(GRADE_LABEL[g]) }} <FauNum :value="res.counts[g] || 0" /></span>
      </header>
      <p v-if="!res.deficiencies.length" class="ss-muted">{{ $t('没有缺陷') }}</p>
      <div v-else class="fau-table-wrap">
        <table class="fau-table">
          <thead><tr><th>{{ $t('缺陷编号') }}</th><th>{{ $t('缺陷描述') }}</th><th class="num">{{ $t('涉及金额') }}</th><th>{{ $t('财务影响') }}</th><th>{{ $t('运营影响') }}</th><th>{{ $t('补偿性控制') }}</th><th>{{ $t('缺陷等级') }}</th></tr></thead>
          <tbody>
            <tr v-for="d in res.deficiencies" :key="d.id" :class="{ bad: d.grade === 'material_weakness' }" :data-test="`fau-def-${d.id}`">
              <td><FauNum :value="d.id" /></td><td class="wrap">{{ d.description }}</td><td class="num"><FauNum :cents="d.amount" /></td>
              <td>{{ $t(IMPACT_LABEL[d.amountTier]) }}</td>
              <td><select :value="d.opImpact" :disabled="busy || !editable" :data-test="`fau-def-op-${d.id}`" @change="setDef(d.id, { opImpact: ($event.target as HTMLSelectElement).value })"><option v-for="l in LEVELS" :key="l" :value="l">{{ $t(IMPACT_LABEL[l]) }}</option></select></td>
              <td><select :value="d.compensating" :disabled="busy || !editable" :data-test="`fau-def-comp-${d.id}`" @change="setDef(d.id, { compensating: ($event.target as HTMLSelectElement).value })"><option v-for="c in COMPS" :key="c" :value="c">{{ $t(COMP_LABEL[c]) }}</option></select></td>
              <td><span class="fau-badge" :class="GRADE_CLASS[d.grade]" :data-test="`fau-def-grade-${d.id}`">{{ $t(GRADE_LABEL[d.grade]) }}</span></td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
    <p v-if="error" class="ss-note danger"><i class="ri-error-warning-line"></i>{{ error }}</p>
  </div>
</template>

<script setup lang="ts">
/** B1 内控与 SOX：第 ④ 步结果——RCM 草稿、抽样计划与样本（逐个记录测试结论）、缺陷分级（可改运营影响与补偿性控制）。 */
import { computed, ref } from 'vue';
import type { FauControlTest, FauDeficiencyGrade, FauIcfrResult, FauModuleDef, FauRun, FauSampleResult } from '@totalclaw/ipc-contracts';
import { FAU_COMPENSATING, FAU_DEFICIENCY_GRADES, FAU_IMPACT_LEVELS } from '@totalclaw/ipc-contracts';
import { COMP_LABEL, CONCLUSION_LABEL, FREQ_LABEL, GRADE_LABEL, IMPACT_LABEL, RESULT_LABEL } from '../../../../../shared/financeAudit/auditLabels';
import FauNum from '../../FauNum.vue';
import { errorMessage, fau } from '../../shared';
import './audit.css';

const props = defineProps<{ run: FauRun; def: FauModuleDef }>();
const emit = defineEmits<{ (e: 'changed'): void }>();
const res = computed(() => props.run.result as FauIcfrResult | undefined);
const editable = computed(() => !['signing', 'archived', 'void'].includes(props.run.status));
const busy = ref(false);
const error = ref('');
const seed = ref<number>(typeof props.run.params.seed === 'number' ? props.run.params.seed : (res.value?.plans[0]?.seed ?? 0));
const RESULTS: FauSampleResult[] = ['pass', 'fail', 'pending'];
const GRADES = FAU_DEFICIENCY_GRADES;
const LEVELS = FAU_IMPACT_LEVELS;
const COMPS = FAU_COMPENSATING;
const GRADE_CLASS: Record<FauDeficiencyGrade, string> = { material_weakness: 'bad', significant: 'warn', deficiency: 'muted', improvement: 'ok' };
const CONCLUSION_CLASS: Record<FauControlTest['conclusion'], string> = { effective: 'ok', ineffective: 'bad', pending: 'muted' };
const testOf = (id: string) => res.value?.tests.find((t) => t.controlId === id);

async function guarded(fn: () => Promise<unknown>): Promise<void> {
  busy.value = true; error.value = '';
  try { await fn(); emit('changed'); } catch (e) { error.value = errorMessage(e); } finally { busy.value = false; }
}
const setResult = (controlId: string, row: number, result: FauSampleResult) => guarded(() => fau('icfr.sample.update', { runId: props.run.id, controlId, row, result }));
const setDef = (id: string, patch: Record<string, string>) => guarded(() => fau('icfr.deficiency.update', { runId: props.run.id, id, ...patch }));
const reseed = () => guarded(() => fau('audit.params.set', { runId: props.run.id, moduleId: 'icfr', params: { seed: Math.max(0, Math.floor(Number(seed.value) || 0)) } }));
</script>
