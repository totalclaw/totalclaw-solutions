<template>
  <div class="fau-queue">
    <div class="fau-row">
      <span class="fau-badge">{{ $t('待编制 {n}', { n: count('prepare') }) }}</span>
      <span class="fau-badge">{{ $t('待复核 {n}', { n: count('review') }) }}</span>
      <span class="fau-badge">{{ $t('待批准 {n}', { n: count('approve') }) }}</span>
      <span class="fau-badge" :class="returned ? 'bad' : 'muted'">{{ $t('被退回 {n}', { n: returned }) }}</span>
    </div>
    <ul v-if="items.length" class="fau-list">
      <li v-for="q in items" :key="q.runId + q.level" :data-test="`fau-queue-${q.moduleId}`" @click="emit('open', q)">
        <span class="fau-dot" :class="q.returned ? 'danger' : ''"></span>
        <span class="grow">{{ moduleLabel(q.moduleId) }} · {{ q.returned ? $t('被退回') : $t('待{p0}', { p0: $t(LEVEL_LABEL[q.level]) }) }}</span>
        <small class="ss-muted"><FauNum :value="fmtTime(q.since)" /></small>
      </li>
    </ul>
    <p v-else class="ss-muted">{{ $t('没有待签项') }}</p>
  </div>
</template>

<script setup lang="ts">
/** 签核队列：首页与模块页共用 */
import { computed } from 'vue';
import type { FauSignLevel, FauSignoffQueueItem } from '@totalclaw/ipc-contracts';
import { moduleById } from '../../../shared/financeAudit/catalog';
import { t as i18nT } from '../../i18n';
import FauNum from './FauNum.vue';
import { LEVEL_LABEL, fmtTime } from './shared';

const props = defineProps<{ items: FauSignoffQueueItem[] }>();
const emit = defineEmits<{ (e: 'open', q: FauSignoffQueueItem): void }>();
const count = (l: FauSignLevel) => props.items.filter((q) => !q.returned && q.level === l).length;
const returned = computed(() => props.items.filter((q) => q.returned).length);
function moduleLabel(id: string): string {
  const m = moduleById(id);
  return m ? `${m.code} ${i18nT(m.name)}` : id;
}
</script>
