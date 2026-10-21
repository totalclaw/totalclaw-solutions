<template>
  <div class="pa-rules">
    <section class="ss-panel">
      <header class="pa-rules__head">
        <h3>{{ $t('运算规则') }}</h3>
        <span class="ss-muted">{{ $t('所有状态和数量都按下面的规则用公式计算。改了规则，当前这次运算的结果会标为过期，需要重新运算') }}</span>
      </header>
      <div v-for="f in FIELDS" :key="f.key" class="pa-rule">
        <label class="pa-rule__input">
          <strong>{{ f.title }}</strong>
          <span><input v-model.number="form[f.key]" type="number" :min="f.min" :max="f.max" step="1" :data-test="`pa-rule-${f.key}`" /><em>{{ f.unit }}</em></span>
        </label>
        <p>{{ f.text }}</p>
        <small v-if="defaults && form[f.key] !== defaults[f.key]" class="ss-muted">{{ $t('默认 {n}', { n: defaults[f.key] }) }}</small>
      </div>
      <div class="pa-rule">
        <label class="pa-rule__input">
          <strong>{{ $t('季节修正') }}</strong>
          <span><input v-model="form.seasonal" type="checkbox" data-test="pa-rule-seasonal" /><em>{{ form.seasonal ? $t('开') : $t('关') }}</em></span>
        </label>
        <p>{{ $t('打开后，预测需求会参考去年同期：去年这个月和下个月的发货相对去年月均偏高或偏低多少，就把预测乘上这个比例（限制在 0.5 到 2 倍之间）。发货数据不满 24 个月的配件不修正。') }}</p>
      </div>
      <p v-if="error" class="ss-note danger"><i class="ri-error-warning-line"></i>{{ error }}</p>
      <p v-if="savedNote" class="ss-note ok"><i class="ri-check-line"></i>{{ savedNote }}</p>
      <div class="ss-actions">
        <button type="button" class="ss-btn primary" :disabled="busy || !dirty" data-test="pa-rules-save" @click="save"><i class="ri-save-line"></i>{{ $t('保存规则') }}</button>
        <button type="button" class="ss-btn" :disabled="busy || isDefault" data-test="pa-rules-reset" @click="reset"><i class="ri-arrow-go-back-line"></i>{{ $t('恢复默认') }}</button>
        <span v-if="dirty" class="ss-muted">{{ $t('有改动还没保存') }}</span>
      </div>
    </section>
    <section class="ss-panel">
      <h3>{{ $t('规则怎么用') }}</h3>
      <ul class="pa-list">
        <li>{{ $t('预测月均需求 = 近 3 个月均值 × 0.5 + 近 6 个月均值 × 0.3 + 近 12 个月均值 × 0.2（只用基准日所在月之前的完整月份），再乘季节系数；日均 = 月均 ÷ 30') }}</li>
        <li>{{ $t('已缺货：现有库存不大于 0，而且有需求') }}</li>
        <li>{{ $t('呆滞：有库存，但连续 {n} 个月没有发货，或预测需求为 0', { n: form.stagnantMonths }) }}</li>
        <li>{{ $t('将缺货：库存按日均需求消耗、在途按预计到货日加回，推算出的断货日距基准日不超过「采购提前期 + {n} 天安全天数」', { n: form.safetyDays }) }}</li>
        <li>{{ $t('冗余：库存够用的天数超过 {n} 个月', { n: form.redundantMonths }) }}</li>
        <li>{{ $t('健康：以上都不是') }}</li>
        <li>{{ $t('建议补库量 = 日均需求 ×（采购提前期 + 补货周期 {a} 天 + 安全天数 {b} 天）− 现有库存 − 在途数量，有最小起订量的向上取整到整倍数', { a: form.reviewDays, b: form.safetyDays }) }}</li>
        <li>{{ $t('最迟下单日 = 断货日 − 采购提前期；已经过了就是立即') }}</li>
      </ul>
    </section>
  </div>
</template>

<script setup lang="ts">
/** 规则：阈值用大白话解释，可改、可恢复默认；改动保存后当前运算结果标为过期。 */
import { computed, reactive, ref, watch } from 'vue';
import type { PaRules } from '@totalclaw/ipc-contracts';
import { t as i18nT } from '../../i18n';
import { errorMessage, pa, paState, refreshState } from './shared';

type NumKey = Exclude<keyof PaRules, 'seasonal'>;
const FIELDS: Array<{ key: NumKey; title: string; unit: string; text: string; min: number; max: number }> = [
  { key: 'safetyDays', title: i18nT('安全库存天数'), unit: i18nT('天'), min: 0, max: 365, text: i18nT('给到货延误、需求突增留的余量。断货日落在「采购提前期 + 这个天数」以内就报将缺货；补库量里也多备这么多天的用量。调大会更早预警、备货更多。') },
  { key: 'reviewDays', title: i18nT('补货周期'), unit: i18nT('天'), min: 1, max: 365, text: i18nT('两次下单之间隔多久。补一次货要够用到下次下单的货到为止，所以补库量里包含这么多天的用量。') },
  { key: 'redundantMonths', title: i18nT('冗余月数'), unit: i18nT('个月'), min: 1, max: 120, text: i18nT('现有库存按预测需求够用超过这么多个月，就算冗余，建议暂停补货。') },
  { key: 'stagnantMonths', title: i18nT('呆滞月数'), unit: i18nT('个月'), min: 1, max: 120, text: i18nT('有库存、连续这么多个月没有发货，就算呆滞，建议停止采购并调拨消化。') },
  { key: 'scrapMonths', title: i18nT('报废评估月数'), unit: i18nT('个月'), min: 1, max: 240, text: i18nT('呆滞的配件超过这么多个月没有发货，行动计划里会加一条「提交报废评估」。不能小于呆滞月数。') },
  { key: 'defaultLeadDays', title: i18nT('默认提前期'), unit: i18nT('天'), min: 1, max: 365, text: i18nT('采购提前期表里没有的配件，按这个天数算。用了默认值的配件会在结果里标出来。') },
];

const defaults = computed(() => paState.value?.defaults.rules || null);
const saved = computed(() => paState.value?.settings.rules || null);
const form = reactive<PaRules>({ safetyDays: 15, reviewDays: 30, redundantMonths: 6, stagnantMonths: 12, scrapMonths: 24, defaultLeadDays: 30, seasonal: true });
const busy = ref(false);
const error = ref('');
const savedNote = ref('');

watch(saved, (r) => { if (r) Object.assign(form, r); }, { immediate: true });
const same = (a: PaRules | null, b: PaRules): boolean => !!a && (Object.keys(b) as Array<keyof PaRules>).every((k) => a[k] === b[k]);
const dirty = computed(() => !same(saved.value, form));
const isDefault = computed(() => same(defaults.value, form) && !dirty.value);

async function apply(action: string, payload: unknown, note: string): Promise<void> {
  busy.value = true; error.value = ''; savedNote.value = '';
  try {
    const hadLive = !!paState.value?.run && !paState.value.run.stale;
    await pa(action, payload);
    const s = await refreshState();
    Object.assign(form, s.settings.rules);
    savedNote.value = hadLive && s.run?.stale ? i18nT('{p0}。当前的运算结果已标为过期，请到「运算」页签重新运算', { p0: note }) : note;
  } catch (e) { error.value = errorMessage(e); } finally { busy.value = false; }
}
function save(): void {
  for (const f of FIELDS) {
    const v = Number(form[f.key]);
    if (!Number.isInteger(v) || v < f.min || v > f.max) { error.value = i18nT('{p0}要填 {a} 到 {b} 之间的整数', { p0: f.title, a: f.min, b: f.max }); return; }
  }
  if (form.scrapMonths < form.stagnantMonths) { error.value = i18nT('报废评估月数不能小于呆滞月数'); return; }
  void apply('rules.save', { rules: { ...form } }, i18nT('规则已保存'));
}
function reset(): void { void apply('rules.reset', {}, i18nT('已恢复默认规则')); }
</script>

<style scoped>
.pa-rules { display: grid; gap: 14px; max-width: 1100px; }
.ss-panel { border: 1px solid var(--color-border); border-radius: 14px; background: var(--color-bg-card); padding: 16px; display: grid; gap: 12px; }
.pa-rules__head { display: grid; gap: 4px; }
h3 { margin: 0; font-size: 15px; }
.pa-rule { display: grid; grid-template-columns: minmax(220px, 280px) 1fr auto; gap: 6px 16px; align-items: center; padding: 10px 0; border-top: 1px solid var(--color-border); }
.pa-rule__input { display: flex; align-items: center; justify-content: space-between; gap: 10px; font-size: 13px; }
.pa-rule__input span { display: inline-flex; align-items: center; gap: 6px; }
.pa-rule__input input[type="number"] { width: 76px; height: 32px; border-radius: 8px; border: 1px solid var(--color-border); background: var(--color-bg-input, var(--color-bg-primary)); color: var(--color-text-primary); font: inherit; font-size: 13px; padding: 0 8px; text-align: right; }
.pa-rule__input em { font-style: normal; color: var(--color-text-secondary); font-size: 12px; min-width: 28px; }
.pa-rule p { margin: 0; font-size: 12.5px; line-height: 1.6; color: var(--color-text-secondary); }
.pa-list { margin: 0; padding-inline-start: 18px; font-size: 12.5px; color: var(--color-text-secondary); display: grid; gap: 4px; line-height: 1.6; }
@media (max-width: 760px) { .pa-rule { grid-template-columns: 1fr; } }
</style>
