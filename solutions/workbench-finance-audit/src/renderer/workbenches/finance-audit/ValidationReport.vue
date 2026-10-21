<template>
  <div class="fau-vr" data-test="fau-validation">
    <p v-if="!report" class="ss-note"><i class="ri-information-line"></i>{{ $t('还没有校验结果') }}</p>
    <template v-else>
      <div class="fau-row">
        <span class="fau-badge" :class="report.blockers.length ? 'bad' : 'ok'">{{ $t('阻断项 {n}', { n: report.blockers.length }) }}</span>
        <span class="fau-badge" :class="report.warnings.length ? 'warn' : 'muted'">{{ $t('提醒项 {n}', { n: report.warnings.length }) }}</span>
      </div>
      <div v-if="report.checks.length" class="fau-table-wrap">
        <table class="fau-table">
          <thead><tr><th>{{ $t('检查项') }}</th><th>{{ $t('结果') }}</th></tr></thead>
          <tbody>
            <tr v-for="c in report.checks" :key="c.id" :class="{ bad: !c.ok && c.level === 'block', warn: !c.ok && c.level === 'warn' }">
              <td class="wrap">{{ msg(c.message) }}</td>
              <td><span :class="c.ok ? 'fau-true' : 'fau-false'">{{ c.ok ? 'TRUE' : 'FALSE' }}</span></td>
            </tr>
          </tbody>
        </table>
      </div>
      <ul v-for="(list, kind) in { block: report.blockers, warn: report.warnings }" :key="kind" class="fau-issues">
        <li v-for="i in list" :key="i.id" :class="kind">
          <i :class="kind === 'block' ? 'ri-close-circle-line' : 'ri-error-warning-line'"></i>
          <span class="grow">{{ msg(i.message) }}</span>
          <small v-if="i.rows?.length">{{ $t('行号') }}: <FauNum :value="i.rows.join(', ')" /></small>
        </li>
      </ul>
    </template>
  </div>
</template>

<script setup lang="ts">
import type { FauValidationReport } from '@totalclaw/ipc-contracts';
import FauNum from './FauNum.vue';
import { msg } from './shared';

defineProps<{ report: FauValidationReport | null | undefined }>();
</script>

<style scoped>
.fau-vr { display: grid; gap: 8px; }
.fau-issues { list-style: none; margin: 0; padding: 0; display: grid; gap: 4px; }
.fau-issues li { display: flex; gap: 8px; align-items: flex-start; font-size: 12.5px; padding: 6px 10px; border-radius: 8px; }
.fau-issues li.block { background: color-mix(in srgb, var(--color-danger) 9%, transparent); color: var(--color-danger); }
.fau-issues li.warn { background: color-mix(in srgb, var(--color-warning) 11%, transparent); color: var(--color-warning); }
.fau-issues .grow { flex: 1; min-width: 0; }
</style>
