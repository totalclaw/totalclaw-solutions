<template>
  <section v-if="findings.length" class="fau-sec" data-test="fau-tax-findings">
    <strong>{{ $t('风险与提醒') }}</strong>
    <ul class="fau-findings">
      <li v-for="f in findings" :key="f.id" :class="f.level" :data-test="`fau-finding-${f.id}`">
        <span class="fau-badge" :class="f.level === 'high' ? 'bad' : f.level === 'warn' ? 'warn' : 'muted'">{{ $t(LEVEL[f.level]) }}</span>
        <div>
          <div>{{ msg(f.title) }}</div>
          <small v-if="f.detail" class="ss-muted">{{ msg(f.detail) }}</small>
          <small v-if="f.suggestion" class="ss-muted"><br>{{ msg(f.suggestion) }}</small>
          <small v-if="f.rows?.length" class="ss-muted"><br>{{ $t('来源行') }} <FauNum :value="f.rows.slice(0, 20).join(',')" /></small>
        </div>
      </li>
    </ul>
  </section>
</template>

<script setup lang="ts">
/** 税务组的风险清单（级别 + 说明 + 建议 + 来源行） */
import type { FauTaxFinding } from '@totalclaw/ipc-contracts';
import { i18nKey } from '../../../../i18n';
import FauNum from '../../FauNum.vue';
import { msg } from '../../shared';

defineProps<{ findings: FauTaxFinding[] }>();
const LEVEL: Record<string, string> = { info: i18nKey('提示'), warn: i18nKey('提醒'), high: i18nKey('高风险') };
</script>

<style scoped>
.fau-sec { border: 1px solid var(--color-border); border-radius: var(--radius-5); padding: 10px 12px; display: grid; gap: 8px; background: var(--color-bg-card); }
.fau-findings { list-style: none; margin: 0; padding: 0; display: grid; gap: 6px; font-size: 12.5px; }
.fau-findings li { display: flex; gap: 8px; align-items: flex-start; }
</style>
