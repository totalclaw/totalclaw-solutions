<template>
  <div v-if="res" class="cap-res" data-test="cap-result">
    <p v-if="!res.degraded.authorized" class="ss-note warn" data-test="cap-degraded"><i class="ri-database-2-line"></i>{{ $t('本结果未使用授权数据源，数据完整度：{p0}', { p0: $t(LEVEL[res.degraded.completeness]) }) }}</p>
    <p v-if="res.disclaimer" class="ss-note danger" data-test="cap-disclaimer"><i class="ri-error-warning-line"></i>{{ $t(DISCLAIMER[res.disclaimer]) }}</p>

    <section v-if="res.upstream.length" class="cap-sec" data-test="cap-upstream">
      <strong>{{ $t('上游转交的估值引用') }}</strong>
      <div v-for="u in res.upstream" :key="u.runId" class="fau-row">
        <span class="fau-badge muted"><FauNum :value="srcText({ kind: 'handoff', name: `${u.moduleId}/${u.modeId}` })" /></span>
        <span v-for="m in u.metrics.slice(0, 6)" :key="m.id" class="cap-chip">{{ $t(m.label) }} <FauNum :value="fmtCap(m.value, m.unit)" /></span>
      </div>
    </section>

    <section v-if="res.metrics.length" class="cap-metrics" data-test="cap-metrics">
      <div v-for="m in res.metrics" :key="m.id" class="cap-metric" :class="m.flag" :data-test="`cap-m-${m.id}`">
        <small>{{ $t(m.label) }}</small>
        <strong><FauNum :value="fmtCap(m.value, m.unit)" /></strong>
      </div>
    </section>

    <ul v-if="res.flags.length" class="cap-flags" data-test="cap-flags">
      <li v-for="f in res.flags" :key="f.id" :class="f.level" :data-test="`cap-flag-${f.id}`"><i :class="f.level === 'warn' ? 'ri-alarm-warning-line' : 'ri-information-line'"></i>{{ msg(f.message) }}</li>
    </ul>

    <details v-for="tb in res.tables" :key="tb.id" class="cap-sec" :open="res.tables.length <= 2" :data-test="`cap-table-${tb.id}`">
      <summary>{{ $t(tb.title) }} <small class="ss-muted">{{ $t('{n} 行', { n: tb.rows.length }) }}</small></summary>
      <div class="fau-table-wrap">
        <table class="fau-table">
          <thead><tr><th v-for="c in tb.columns" :key="c.key" :class="{ num: isNumeric(c.unit) }">{{ $t(c.label) }}</th></tr></thead>
          <tbody>
            <tr v-for="(r, i) in tb.rows" :key="i">
              <td v-for="c in tb.columns" :key="c.key" :class="{ num: isNumeric(c.unit) }"><FauNum v-if="isNumeric(c.unit) || c.unit === 'date'" :value="fmtCap(r[c.key], c.unit)" /><template v-else>{{ fmtCap(r[c.key], c.unit) }}</template></td>
            </tr>
          </tbody>
        </table>
      </div>
    </details>

    <section v-if="res.sections?.length" class="cap-sec" data-test="cap-narrative">
      <strong>{{ $t('叙述与回核') }}</strong>
      <div v-for="(s, si) in res.sections" :key="si" class="cap-narr">
        <h4>{{ s.heading }}</h4>
        <p v-for="(p, pi) in s.paragraphs" :key="pi" :class="{ bad: p.status !== 'verified' }" :data-test="`cap-p-${si}-${pi}`">
          {{ p.text }}
          <span v-if="p.status !== 'verified'" class="fau-badge bad">{{ $t('[未注明来源]') }}</span>
          <span v-if="p.advice" class="fau-badge warn">{{ $t('含买卖或配置建议措辞，签核前须删改') }}</span>
          <small v-if="p.missing?.length" class="ss-muted"><br>{{ $t('数据里找不到') }}: <FauNum :value="p.missing.join(', ')" /></small>
        </p>
      </div>
    </section>

    <section v-if="res.facts?.length" class="cap-sec" data-test="cap-facts">
      <strong>{{ $t('事实与出处') }}</strong>
      <div class="fau-table-wrap">
        <table class="fau-table">
          <thead><tr><th>{{ $t('指标 / 事实') }}</th><th>{{ $t('数值') }}</th><th>{{ $t('来源') }}</th><th>{{ $t('原文引文') }}</th></tr></thead>
          <tbody>
            <tr v-for="(f, i) in res.facts" :key="i"><td>{{ f.label }}</td><td><FauNum :value="f.value" /></td><td><FauNum :value="factTag(f)" /></td><td class="wrap">{{ f.quote }}</td></tr>
          </tbody>
        </table>
      </div>
      <p v-if="res.droppedFacts" class="ss-muted">{{ $t('模型给出的 {n} 条事实在原文里定位不到，已丢弃', { n: res.droppedFacts }) }}</p>
    </section>

    <details class="cap-sec">
      <summary>{{ $t('输入与来源') }}</summary>
      <div class="fau-table-wrap">
        <table class="fau-table">
          <tbody>
            <tr v-for="f in res.inputs.fields" :key="f.key"><td>{{ $t(f.label) }}</td><td class="num"><FauNum :value="fmtCap(f.value, f.unit)" /></td><td :class="{ 'cap-unsourced': f.src.kind === 'default' }"><FauNum :value="srcText(f.src)" /></td></tr>
          </tbody>
        </table>
      </div>
    </details>
  </div>
</template>

<script setup lang="ts">
/** G6 投融资与估值 · 第 ④ 步结果：数据完整度与「非投资建议」声明、指标、提醒、结果表、叙述回核、事实出处、输入来源 */
import { computed } from 'vue';
import type { FauCapFact, FauCapResult, FauRun } from '@totalclaw/ipc-contracts';
import { i18nKey, t as i18nT } from '../../../../i18n';
import FauNum from '../../FauNum.vue';
import { msg } from '../../shared';
import { fmtCap, isNumeric, srcText } from './format';

const props = defineProps<{ run: FauRun }>();
const res = computed(() => props.run.result as FauCapResult | undefined);
const DISCLAIMER: Record<string, string> = {
  research: i18nKey('仅供内部研究，非投资建议'),
  markets: i18nKey('仅供分析参考，非投资建议，不构成交易指令'),
  wealth: i18nKey('仅供持牌顾问内部使用，非投资建议，不发给客户，不执行交易'),
};
const factTag = (f: FauCapFact) => (f.page ? i18nT('[上传: {p0} 第 {n} 页]', { p0: f.doc, n: f.page }) : srcText({ kind: 'upload', file: f.doc }));
const LEVEL: Record<string, string> = { high: i18nKey('高'), medium: i18nKey('中'), low: i18nKey('低') };
</script>

<style scoped>
.cap-res { contain: inline-size; display: grid; grid-template-columns: minmax(0, 1fr); gap: 10px; }
.cap-sec { border: 1px solid var(--color-border); border-radius: 12px; padding: 10px 12px; display: grid; grid-template-columns: minmax(0, 1fr); gap: 8px; background: var(--color-bg-card); }
.cap-sec summary { cursor: pointer; font-weight: 700; font-size: 12.5px; }
.cap-metrics { display: grid; gap: 8px; grid-template-columns: repeat(auto-fill, minmax(min(100%, 170px), 1fr)); }
.cap-metric { border: 1px solid var(--color-border); border-radius: 10px; padding: 8px 10px; display: grid; gap: 2px; background: var(--color-bg-card); }
.cap-metric small { color: var(--color-text-secondary); font-size: 11.5px; }
.cap-metric strong { font-size: 15px; }
.cap-metric.warn { border-color: var(--color-warning); }
.cap-metric.bad { border-color: var(--color-danger); }
.cap-flags { list-style: none; margin: 0; padding: 0; display: grid; gap: 4px; font-size: 12.5px; }
.cap-flags li { display: flex; gap: 6px; align-items: center; }
.cap-flags li.warn { color: var(--color-warning); }
.cap-chip { font-size: 12px; padding: 2px 8px; border-radius: 999px; background: var(--color-bg-hover); }
.cap-narr h4 { margin: 6px 0 2px; font-size: 13px; }
.cap-narr p { margin: 0 0 6px; font-size: 12.5px; line-height: 1.6; }
.cap-narr p.bad { background: color-mix(in srgb, var(--color-danger) 7%, transparent); border-radius: 6px; padding: 2px 6px; }
.cap-unsourced { color: var(--color-warning); }
</style>
