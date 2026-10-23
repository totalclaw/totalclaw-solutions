<template>
  <div class="ft-scr" :class="result.level" data-test="ft-screening-result" :data-level="result.level">
    <div class="ft-scr__head">
      <span class="ss-chip" :class="result.level === 'high' ? 'bad' : result.level === 'review' ? 'warn' : 'ok'">{{ levelLabel }}</span>
      <strong>{{ result.query }}</strong>
      <span class="ss-muted">{{ fmtDateTime(result.at) }}</span>
    </div>
    <div v-if="result.matches.length" class="ss-table-wrap">
      <table class="ss-table">
        <thead><tr><th class="num">{{ $t('相似度') }}</th><th>{{ $t('名单上的名称') }}</th><th>{{ $t('名单') }}</th><th>{{ $t('依据') }}</th><th>{{ $t('国家') }}</th></tr></thead>
        <tbody>
          <tr v-for="(m, i) in result.matches.slice(0, 10)" :key="i">
            <td class="num"><span class="ss-chip" :class="m.level === 'high' ? 'bad' : 'warn'">{{ m.score }}</span></td>
            <td class="ft-wrap"><strong>{{ m.name }}</strong><div v-if="m.matchedOn !== m.name" class="ss-muted">{{ $t('命中别名：{p0}', { p0: m.matchedOn }) }}</div></td>
            <td class="ft-wrap">{{ m.list }}<div v-if="m.ref" class="ss-muted">{{ m.ref }}</div></td>
            <td class="ft-wrap">{{ m.basis }}</td>
            <td class="ft-wrap">{{ (m.countries || []).join(', ') || '—' }}</td>
          </tr>
        </tbody>
      </table>
    </div>
    <p class="ss-muted ft-scr__lists">
      {{ $t('用到的名单：{p0}', { p0: result.lists.map((l) => `${l.id.toUpperCase()} ${l.version || ''}`.trim()).join('；') || '—' }) }}
      <template v-if="result.missing.length">{{ $t('；没有缓存、没参与筛查：{p0}', { p0: result.missing.map((x) => x.toUpperCase()).join('、') }) }}</template>
    </p>
    <p class="ss-muted">{{ $t('名单筛查只是辅助：没命中不等于可以交易（所有权、地址、音译都可能漏），有疑似命中也要人工核对后再定。') }}</p>
  </div>
</template>

<script setup lang="ts">
/** 交易对手名单筛查结果（背调卡与名单筛查面板共用） */
import { computed } from 'vue';
import type { FtScreeningResult } from '@totalclaw/ipc-contracts';
import { t as i18nT } from '../../i18n';
import { fmtDateTime } from './shared';

const props = defineProps<{ result: FtScreeningResult }>();
const levelLabel = computed(() => ({ high: i18nT('高度疑似命中'), review: i18nT('有待查的相近名字'), clear: i18nT('未命中') }[props.result.level]));
</script>

<style scoped>
.ft-scr { border: 1px solid var(--color-border); border-radius: var(--radius-4); padding: 8px 10px; display: grid; gap: 6px; font-size: 12.5px; }
.ft-scr.high { border-color: color-mix(in srgb, var(--color-danger) 55%, var(--color-border)); }
.ft-scr.review { border-color: color-mix(in srgb, var(--color-warning) 55%, var(--color-border)); }
.ft-scr__head { display: flex; gap: 8px; align-items: center; flex-wrap: wrap; }
.ft-scr__lists { margin: 0; }
.ft-scr p { margin: 0; }
.ft-wrap { white-space: normal !important; max-width: 280px; }
</style>
