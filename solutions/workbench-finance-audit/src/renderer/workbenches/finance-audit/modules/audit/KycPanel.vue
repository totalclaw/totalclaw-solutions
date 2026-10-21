<template>
  <div v-if="res" class="fau-audit" data-test="fau-kyc-panel">
    <section class="fau-sec">
      <header>
        <strong class="grow">{{ $t('处置建议') }}</strong>
        <span class="fau-badge" :class="DISP_CLASS[res.disposition]" data-test="fau-kyc-disposition" :data-disposition="res.disposition">{{ $t(KYC_DISPOSITION_LABEL[res.disposition]) }}</span>
        <span class="fau-badge" :class="res.rating === 'high' ? 'bad' : res.rating === 'medium' ? 'warn' : 'ok'">{{ $t('风险等级') }} · {{ $t(IMPACT_LABEL[res.rating]) }}</span>
      </header>
      <p class="ss-note info"><i class="ri-shield-user-line"></i>{{ $t('处置建议只是建议，从不批准；由合规官决定') }}</p>
      <ul v-if="res.missingDocs.length" class="fau-esc"><li v-for="d in res.missingDocs" :key="d"><i class="ri-file-warning-line"></i>{{ $t('缺少的文件') }}: {{ d }}</li></ul>
    </section>

    <section class="fau-sec" data-test="fau-kyc-record">
      <header><strong class="grow">{{ $t('主体档案') }}</strong><span class="fau-badge muted">{{ $t(APPLICANT_LABEL[res.record.applicantType]) }}</span></header>
      <dl class="fau-kv">
        <template v-for="f in FIELDS" :key="f.key">
          <dt>{{ $t(f.label) }}</dt>
          <dd><bdi>{{ res.record[f.key]?.value || '-' }}</bdi><small v-if="res.record[f.key]" class="fau-quote"> · {{ res.record[f.key]?.docName }}</small></dd>
        </template>
      </dl>
      <p v-if="res.record.dropped.length" class="ss-note warn"><i class="ri-eraser-line"></i>{{ $t('原文定位不到、已丢弃的字段：{p0}', { p0: res.record.dropped.join(', ') }) }}</p>
      <ul v-if="res.record.beneficialOwners.length" class="fau-list"><li v-for="(b, i) in res.record.beneficialOwners" :key="i"><span class="grow"><bdi>{{ b.name.value }}</bdi></span><FauNum :value="b.nationality" /> · <FauNum :value="b.pct ?? '-'" /></li></ul>
    </section>

    <section class="fau-sec" data-test="fau-kyc-rules">
      <header><strong class="grow">{{ $t('规则结论') }}</strong></header>
      <div class="fau-table-wrap">
        <table class="fau-table">
          <thead><tr><th>{{ $t('规则编号') }}</th><th>{{ $t('规则') }}</th><th>{{ $t('结论') }}</th><th>{{ $t('依据') }}</th></tr></thead>
          <tbody>
            <tr v-for="o in res.outcomes" :key="o.ruleId" :class="{ bad: o.outcome === 'fail' && o.effect !== 'risk' }" :data-test="`fau-kyc-rule-${o.ruleId}`">
              <td><FauNum :value="o.ruleId" /></td><td class="wrap">{{ o.builtin ? $t(o.text) : o.text }}</td>
              <td>{{ o.outcome === 'fail' ? $t('规则已触发') : o.outcome === 'pass' ? $t('规则未触发') : $t('不适用') }}</td><td class="wrap"><bdi>{{ o.evidence }}</bdi></td>
            </tr>
          </tbody>
        </table>
      </div>
      <div v-if="res.hits.length" class="fau-table-wrap" data-test="fau-kyc-hits">
        <table class="fau-table">
          <thead><tr><th>{{ $t('被筛查对象') }}</th><th>{{ $t('名单') }}</th><th>{{ $t('名单条目') }}</th><th class="num">{{ $t('相似度') }}</th><th>{{ $t('强度') }}</th></tr></thead>
          <tbody><tr v-for="(h, i) in res.hits" :key="i" class="bad"><td><bdi>{{ h.subject }}</bdi></td><td>{{ h.listName }}</td><td><bdi>{{ h.entry }}</bdi></td><td class="num"><FauNum :value="h.score" /></td><td>{{ h.strength === 'strong' ? $t('强命中') : $t('疑似命中') }}</td></tr></tbody>
        </table>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
/** B6 客商尽调：第 ④ 步结果——处置建议（从不批准）、主体档案（带原文依据）、规则结论、名单命中。 */
import { computed } from 'vue';
import type { FauKycDisposition, FauKycRecord, FauKycResult, FauModuleDef, FauRun } from '@totalclaw/ipc-contracts';
import { i18nKey } from '../../../../i18n';
import { APPLICANT_LABEL, IMPACT_LABEL, KYC_DISPOSITION_LABEL } from '../../../../../shared/financeAudit/auditLabels';
import FauNum from '../../FauNum.vue';
import './audit.css';

const props = defineProps<{ run: FauRun; def: FauModuleDef }>();
const res = computed(() => props.run.result as FauKycResult | undefined);
const DISP_CLASS: Record<FauKycDisposition, string> = { clear: 'ok', 'request-docs': 'warn', 'escalate-EDD': 'bad', 'decline-recommend': 'bad' };
const FIELDS: Array<{ key: 'legalName' | 'dobOrFormation' | 'jurisdiction' | 'address' | 'sourceOfFunds'; label: string }> = [
  { key: 'legalName', label: i18nKey('名称') }, { key: 'dobOrFormation', label: i18nKey('出生 / 成立日期') }, { key: 'jurisdiction', label: i18nKey('国籍 / 注册地') },
  { key: 'address', label: i18nKey('地址') }, { key: 'sourceOfFunds', label: i18nKey('资金来源') },
] satisfies Array<{ key: keyof FauKycRecord; label: string }>;
</script>
