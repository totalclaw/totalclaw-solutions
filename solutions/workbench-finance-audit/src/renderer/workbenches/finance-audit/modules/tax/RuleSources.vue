<template>
  <details class="fau-sec" data-test="fau-rule-sources" :open="open">
    <summary>
      {{ $t('地区规则与出处') }}
      <span class="fau-badge muted">{{ rules.length }}</span>
      <span v-if="rules.some((r) => !r.reviewed)" class="fau-badge warn" data-test="fau-rules-draft">{{ $t('草稿口径，需当地专业人士复核') }}</span>
    </summary>
    <p v-if="!rules.length" class="ss-muted">{{ $t('本次没有用到地区规则（中国口径沿用财务智能体）') }}</p>
    <div v-else class="fau-table-wrap">
      <table class="fau-table">
        <thead><tr><th>{{ $t('规则') }}</th><th>{{ $t('取值') }}</th><th>{{ $t('版本 / 生效日期') }}</th><th>{{ $t('出处') }}</th><th>{{ $t('原文') }}</th><th>{{ $t('审核状态') }}</th></tr></thead>
        <tbody>
          <tr v-for="r in rules" :key="`${r.id}@${r.version}`" :data-test="`fau-rule-${r.id}`">
            <td class="wrap">{{ label(r) }}<br><small class="ss-muted"><FauNum :value="r.id" /></small></td>
            <td class="wrap"><FauNum v-if="numeric(r)" :value="`${r.value}${r.unit ? ` ${r.unit}` : ''}`" /><template v-else>{{ valueText(r) }}</template></td>
            <td><FauNum :value="r.version" /><br><small class="ss-muted"><FauNum :value="r.effectiveFrom" /><template v-if="r.effectiveTo"> ~ <FauNum :value="r.effectiveTo" /></template></small></td>
            <td class="wrap">{{ r.source.issuer }} · {{ r.source.title }}<template v-if="r.source.clause"> · {{ r.source.clause }}</template></td>
            <td class="wrap">
              <template v-if="r.source.originalText">
                <div :lang="r.source.language" :dir="r.source.language === 'ar' ? 'rtl' : 'ltr'" class="fau-original" data-test="fau-rule-original">{{ r.source.originalText }}</div>
                <small v-if="translation(r)" class="ss-muted">{{ $t('译文') }}: {{ translation(r) }}</small>
                <small class="fau-badge muted">{{ $t('以原文为准') }}</small>
              </template>
              <small v-else class="ss-muted">{{ $t('原文摘录待当地专业人员核对补录') }}</small>
            </td>
            <td><span class="fau-badge" :class="r.reviewed ? 'ok' : 'warn'">{{ r.reviewed ? $t('已经当地专业人员审核') : $t('草稿口径') }}</span></td>
          </tr>
        </tbody>
      </table>
    </div>
  </details>
</template>

<script setup lang="ts">
/** 地区规则与出处：版本、生效日期、法规原文（按原语言与方向显示）+ 界面语言译文，标「以原文为准」；未审核的标草稿口径 */
import type { FauRuleUse } from '@totalclaw/ipc-contracts';
import { currentLocale } from '../../../../composables/useLocale';
import FauNum from '../../FauNum.vue';

defineProps<{ rules: FauRuleUse[]; open?: boolean }>();

const label = (r: FauRuleUse) => r.translations?.[currentLocale()]?.label || r.label;
/** 数字与日期走 FauNum（<bdi dir="ltr">），文字取值按界面语言方向显示 */
const numeric = (r: FauRuleUse) => typeof r.value === 'number' || /^\d{4}-\d{2}-\d{2}$/.test(String(r.value));
const valueText = (r: FauRuleUse) => String(r.translations?.[currentLocale()]?.value || r.value);
const translation = (r: FauRuleUse) => (r.source.language === currentLocale().slice(0, 2) ? '' : r.source.translations?.[currentLocale()] || '');
</script>

<style scoped>
.fau-sec { border: 1px solid var(--color-border); border-radius: 12px; padding: 10px 12px; display: grid; gap: 8px; background: var(--color-bg-card); }
.fau-sec summary { cursor: pointer; font-weight: 700; font-size: 12.5px; display: flex; flex-wrap: wrap; gap: 6px; align-items: center; }
.fau-original { font-weight: 600; unicode-bidi: isolate; text-align: start; }
</style>
