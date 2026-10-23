<template>
  <div v-if="res" class="fau-fpa" :data-test="`fau-fpa-${res.moduleId}`">
    <section v-if="res.alerts.length" class="fau-fpa-sec">
      <h4>{{ $t('预警') }}</h4>
      <ul class="fau-fpa-alerts">
        <li v-for="a in res.alerts" :key="a.id" :class="a.level" :data-test="`fau-fpa-alert-${a.id}`">
          <span class="fau-badge" :class="BADGE[a.level]">{{ $t(LEVEL_LABEL[a.level]) }}</span>{{ msg(a.message) }}
        </li>
      </ul>
    </section>

    <section v-if="res.sources.length" class="fau-fpa-sec" data-test="fau-fpa-sources">
      <h4>{{ $t('数据来源') }}</h4>
      <div class="fau-row">
        <span v-for="s in res.sources" :key="s.datasetId" class="fau-badge" :class="s.signed ? 'ok' : 'warn'" :data-test="`fau-fpa-source-${s.slot}`">
          <i :class="s.signed ? 'ri-shield-check-line' : 'ri-error-warning-line'"></i>{{ s.label }} · {{ s.signed ? $t('已签核') : $t('未签核') }}
        </span>
      </div>
    </section>

    <section v-for="c in res.charts" :key="c.id" class="fau-fpa-sec" :data-test="`fau-fpa-chart-${c.id}`">
      <h4>{{ $t(c.title) }}</h4>
      <div class="fau-fpa-legend">
        <span v-for="(s, si) in c.series" :key="s.name"><i class="sw" :class="`s${si % 3}`"></i>{{ $t(s.name) }}</span>
      </div>
      <div class="fau-fpa-chart">
        <div v-for="(label, li) in c.labels" :key="li" class="fau-fpa-bar-row">
          <span class="lbl">{{ c.labelKeys ? $t(label) : label }}</span>
          <div class="bars">
            <div v-for="(s, si) in c.series" :key="s.name" class="bar-line">
              <span class="bar" :class="[`s${si % 3}`, { neg: (s.values[li] ?? 0) < 0 }]" :style="{ inlineSize: `${barPct(c, s.values[li])}%` }"></span>
              <FauNum v-if="c.unit === 'amount'" :cents="s.values[li]" />
              <FauNum v-else-if="c.unit === 'pct'" :ratio="s.values[li]" />
              <FauNum v-else :value="s.values[li]" />
            </div>
          </div>
        </div>
      </div>
    </section>

    <section v-for="t in res.tables" :key="t.id" class="fau-fpa-sec" :data-test="`fau-fpa-table-${t.id}`">
      <h4>{{ $t(t.title) }} <small class="ss-muted">{{ $t('{n} 行', { n: t.rows.length }) }}</small></h4>
      <div class="fau-table-wrap">
        <table class="fau-table">
          <thead><tr><th v-for="c in t.columns" :key="c.key" :class="{ num: NUMERIC.includes(c.kind) }">{{ $t(c.label) }}</th></tr></thead>
          <tbody>
            <tr v-for="(r, ri) in t.rows" :key="ri" :class="rowClass(t, r)" :data-test="`fau-fpa-row-${t.id}-${ri}`">
              <td v-for="c in t.columns" :key="c.key" :class="{ num: NUMERIC.includes(c.kind), wrap: c.kind === 'text' && String(r[c.key] ?? '').length > 40 }">
                <FauNum v-if="c.kind === 'amount'" :cents="asNum(r[c.key])" />
                <FauNum v-else-if="c.kind === 'pct'" :ratio="asNum(r[c.key])" />
                <FauNum v-else-if="c.kind === 'num'" :value="r[c.key]" />
                <span v-else-if="c.kind === 'level' && r[c.key]" class="fau-badge" :class="BADGE[String(r[c.key])]">{{ $t(LEVEL_LABEL[String(r[c.key])] || String(r[c.key])) }}</span>
                <template v-else-if="c.kind === 'label'">{{ r[c.key] ? $t(String(r[c.key])) : '' }}</template>
                <template v-else>{{ r[c.key] ?? '' }}</template>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <section v-if="res.narratives.length" class="fau-fpa-sec">
      <h4>{{ $t('说明') }}</h4>
      <article v-for="n in res.narratives" :key="n.id" class="fau-fpa-nar" :class="{ bad: n.status === 'unverified' }" :data-test="`fau-fpa-nar-${n.id}`">
        <header class="fau-row">
          <strong class="grow">{{ $t(n.heading) }}</strong>
          <span class="fau-badge" :class="n.status === 'verified' ? 'ok' : n.status === 'unverified' ? 'bad' : 'muted'">{{ $t(STATUS_LABEL[n.status]) }}</span>
        </header>
        <p>{{ n.text }}</p>
        <small v-if="n.missing?.length" class="ss-muted">{{ $t('数据里找不到') }}: <FauNum :value="n.missing.join(', ')" /></small>
      </article>
    </section>

    <section v-if="res.checks.length" class="fau-fpa-sec" data-test="fau-fpa-checks">
      <h4>Checks</h4>
      <ul class="fau-fpa-checks">
        <li v-for="c in res.checks" :key="c.id" :data-test="`fau-fpa-check-${c.id}`"><span :class="c.ok ? 'fau-true' : 'fau-false'">{{ c.ok ? 'TRUE' : 'FALSE' }}</span> {{ msg(c.message) }}</li>
      </ul>
    </section>
  </div>
</template>

<script setup lang="ts">
/**
 * 财务分析与管理报告（D1–D10）第 ④ 步结果：预警、数据来源（是否已签核）、条形图、规则引擎的表、模型叙述（逐段回核）、自检。
 * 金额 / 比例全部经 FauNum（<bdi dir="ltr">）；条形图用逻辑属性 inline-size，阿语 RTL 下自动从右往左画，标签与图例跟着镜像。
 */
import { computed } from 'vue';
import type { FauFpaCell, FauFpaChart, FauFpaResult, FauFpaTable, FauRun } from '@totalclaw/ipc-contracts';
import { i18nKey } from '../../../../i18n';
import FauNum from '../../FauNum.vue';
import { msg } from '../../shared';

const props = defineProps<{ run: FauRun }>();
const res = computed(() => props.run.result as FauFpaResult | undefined);

const LEVEL_LABEL: Record<string, string> = { green: i18nKey('绿灯'), yellow: i18nKey('黄灯'), red: i18nKey('红灯') };
const BADGE: Record<string, string> = { green: 'ok', yellow: 'warn', red: 'bad' };
const STATUS_LABEL: Record<string, string> = { verified: i18nKey('已核实'), unverified: i18nKey('未核实'), unknown: i18nKey('原因不明，待主管确认') };
const NUMERIC = ['amount', 'pct', 'num'];

const asNum = (v: FauFpaCell | undefined) => (typeof v === 'number' ? v : null);

function barPct(c: FauFpaChart, v: number | null | undefined): number {
  const max = Math.max(...c.series.flatMap((s) => s.values.map((x) => Math.abs(x ?? 0))), 0);
  // 最长的条占 75%，留位置给数值
  return max && v != null ? Math.max(1, Math.round((Math.abs(v) / max) * 75)) : 0;
}

/** 有红灯 / 未核实 / 重度偏差的行标红，黄灯标黄 */
function rowClass(t: FauFpaTable, r: Record<string, FauFpaCell>): string {
  const levels = t.columns.filter((c) => c.kind === 'level').map((c) => r[c.key]);
  if (levels.includes('red') || t.columns.some((c) => c.kind === 'label' && r[c.key] === i18nKey('未核实'))) return 'bad';
  return levels.includes('yellow') ? 'warn' : '';
}
</script>

<style scoped>
.fau-fpa { display: grid; gap: 12px; }
.fau-fpa-sec { display: grid; gap: 6px; min-width: 0; }
.fau-fpa-sec h4 { margin: 0; font-size: var(--font-size-md); display: flex; gap: 8px; align-items: baseline; }
.fau-fpa-alerts, .fau-fpa-checks { list-style: none; margin: 0; padding: 0; display: grid; gap: 4px; font-size: 12.5px; }
.fau-fpa-alerts li { display: flex; gap: 8px; align-items: center; }
.fau-fpa-legend { display: flex; flex-wrap: wrap; gap: 12px; font-size: var(--font-size-sm); color: var(--color-text-secondary); }
.fau-fpa-legend .sw { display: inline-block; inline-size: 10px; block-size: 10px; border-radius: calc(var(--radius-1) / 2); margin-inline-end: 4px; vertical-align: middle; }
.fau-fpa-chart { display: grid; gap: 6px; }
.fau-fpa-bar-row { display: grid; grid-template-columns: minmax(90px, 180px) 1fr; gap: 8px; align-items: center; font-size: var(--font-size-sm); }
.fau-fpa-bar-row .lbl { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; text-align: start; }
.fau-fpa-bar-row .bars { display: grid; gap: 2px; min-width: 0; }
.bar-line { display: flex; align-items: center; gap: 6px; min-width: 0; }
.bar { display: inline-block; block-size: 10px; border-start-end-radius: var(--radius-1); border-end-end-radius: var(--radius-1); flex: 0 0 auto; }
.bar.neg { opacity: .55; }
.s0 { background: var(--color-brand); }
.s1 { background: var(--color-text-secondary); }
.s2 { background: var(--color-warning); }
.fau-fpa-nar { border: 1px solid var(--color-border); border-radius: var(--radius-4); padding: 8px 10px; display: grid; gap: 4px; }
.fau-fpa-nar.bad { border-color: var(--color-danger); background: color-mix(in srgb, var(--color-danger) 6%, transparent); }
.fau-fpa-nar p { margin: 0; font-size: 12.5px; line-height: 1.6; }
</style>
