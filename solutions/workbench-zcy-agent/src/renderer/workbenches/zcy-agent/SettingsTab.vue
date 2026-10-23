<template>
  <div class="ss-module zc-settings">
    <section class="zc-panel">
      <h3>{{ $t('区划规则') }}</h3>
      <p class="ss-muted">{{ $t('各省电子卖场的口径不同，内置的几套只是公开资料里查到的起点。请对照本区划现行的管理办法改成准确的数；改完商品会按新规则重查。') }}</p>
      <div v-for="r in regions" :key="r.id" class="zc-region" :class="{ on: r.id === regionId }">
        <div class="zc-region__head">
          <label><input v-model="regionId" type="radio" :value="r.id" /><input v-model="r.name" type="text" class="zc-name" /></label>
          <button v-if="regions.length > 1" type="button" class="ss-link" @click="removeRegion(r.id)">{{ $t('删除') }}</button>
        </div>
        <div class="ss-grid tight">
          <label class="ss-field"><span>{{ $t('主图最少张数') }}</span><input v-model.number="r.imageMin" type="number" min="0" /></label>
          <label class="ss-field"><span>{{ $t('主图最短边（像素）') }}</span><input v-model.number="r.imageMinSide" type="number" min="0" /></label>
          <label class="ss-field"><span>{{ $t('单张上限（KB）') }}</span><input v-model.number="r.imageMaxKb" type="number" min="1" /></label>
          <label class="ss-field"><span>{{ $t('比价基准') }}</span><select v-model="r.priceRule"><option value="avg">{{ $t('自营价均值（最低 3 个）') }}</option><option value="min">{{ $t('自营最低价') }}</option></select></label>
          <label class="ss-field"><span>{{ $t('高出基准多少算违规（%）') }}</span><input :value="Math.round(r.priceTolerance * 1000) / 10" type="number" min="0" step="0.5" @change="r.priceTolerance = (Number(($event.target as HTMLInputElement).value) || 0) / 100" /></label>
          <label class="ss-field"><span>{{ $t('至少几条自营链接') }}</span><input v-model.number="r.refMin" type="number" min="0" /></label>
          <label class="ss-field"><span>{{ $t('接单时限（小时）') }}</span><input v-model.number="r.acceptHours" type="number" min="1" /></label>
          <label class="ss-field"><span>{{ $t('标题最长字数') }}</span><input v-model.number="r.titleMax" type="number" min="10" /></label>
        </div>
        <label class="ss-field"><span>{{ $t('本区划额外禁用词（顿号或逗号隔开；广告法极限词已内置）') }}</span><input :value="r.bannedWords.join($t('、'))" type="text" @change="r.bannedWords = ($event.target as HTMLInputElement).value.split(/[、,，\s]+/).filter(Boolean)" /></label>
        <label class="ss-field"><span>{{ $t('规则出处与提醒') }}</span><input v-model="r.note" type="text" /></label>
      </div>
      <div class="ss-actions"><button type="button" class="ss-btn" @click="addRegion"><i class="ri-add-line"></i>{{ $t('加一套规则') }}</button></div>
    </section>

    <section class="zc-panel">
      <h3>{{ $t('报价与开票') }}</h3>
      <div class="ss-grid">
        <label class="ss-field"><span>{{ $t('默认目标毛利率（%）') }}</span><input v-model.number="marginPct" type="number" min="0" step="0.5" /></label>
        <label class="ss-field"><span>{{ $t('订单转开票用的税率') }}</span><select v-model.number="taxRate"><option v-for="x in [0.13, 0.09, 0.06, 0.03, 0.01, 0]" :key="x" :value="x">{{ pct(x) }}</option></select></label>
      </div>
    </section>

    <section class="zc-panel">
      <h3>{{ $t('巡检提醒') }}</h3>
      <p class="ss-muted">{{ $t('到点只发系统通知提醒你读回订单与询价单，不会自动操作网页。') }}</p>
      <label class="ss-field"><span>{{ $t('每天这些时刻提醒（如 09:00, 14:30，留空不提醒）') }}</span><input v-model="patrol" type="text" placeholder="09:00, 14:30" /></label>
    </section>

    <section class="zc-panel">
      <h3>{{ $t('模型') }}</h3>
      <label class="ss-field zc-model"><span>{{ $t('按参数写商品详情用的模型') }}</span>
        <select v-model="model">
          <option value="">{{ $t('跟随系统默认（{p0}）', { p0: models.defaultLabel || $t('未配置') }) }}</option>
          <option v-for="o in models.options" :key="o.value" :value="o.value">{{ o.group ? `${o.group} · ` : '' }}{{ o.label }}</option>
        </select>
      </label>
      <p class="ss-muted">{{ $t('模型只写详情文字，写出的数字回参数核对；售价、报价、比价基准全部由规则计算。') }}</p>
    </section>

    <div class="ss-actions"><button type="button" class="ss-btn primary" :disabled="busy" data-test="zc-settings-save" @click="save"><i class="ri-save-line"></i>{{ $t('保存设置') }}</button></div>

    <section class="zc-panel">
      <h3>{{ $t('操作记录') }}<button type="button" class="ss-link" @click="clearLog">{{ $t('清空') }}</button></h3>
      <p v-if="!log.length" class="ss-empty">{{ $t('还没有记录') }}</p>
      <ul v-else class="zc-log"><li v-for="(l, i) in log" :key="i" :class="{ bad: !l.ok }"><time>{{ fmtDateTime(l.at) }}</time>{{ l.text }}</li></ul>
    </section>
  </div>
</template>

<script setup lang="ts">
/** 设置：区划规则表、默认毛利率与开票税率、巡检提醒、模型、操作记录。 */
import { computed, onMounted, reactive, ref, watch } from 'vue';
import type { ZcRegionRule } from '@totalclaw/ipc-contracts';
import { useNotificationStore } from '../../stores/notification';
import { t as i18nT } from '../../i18n';
import { errorMessage, fmtDateTime, pct, refreshState, zc, zcState } from './shared';

const notif = useNotificationStore();
const busy = ref(false);
const regions = ref<ZcRegionRule[]>([]);
const regionId = ref('');
const marginPct = ref(8);
const taxRate = ref(0.13);
const patrol = ref('');
const model = ref('');
const models = reactive<{ options: Array<{ value: string; label: string; group?: string }>; defaultLabel: string }>({ options: [], defaultLabel: '' });
const log = computed(() => zcState.value?.log || []);
let seeded = false;
watch(zcState, (s) => {
  if (!s || seeded) return;
  seeded = true;
  const st = s.settings;
  regions.value = st.regions.map((r) => ({ ...r, bannedWords: [...r.bannedWords] }));
  regionId.value = st.regionId;
  marginPct.value = Math.round(st.defaultMargin * 10000) / 100;
  taxRate.value = st.invoiceTaxRate;
  patrol.value = st.patrolTimes.join(', ');
  model.value = st.model;
}, { immediate: true });

function addRegion(): void {
  const base = regions.value[0];
  regions.value.push({ ...base, id: `custom_${Date.now().toString(36)}`, name: i18nT('自定义规则'), bannedWords: [...base.bannedWords], note: '' });
}
function removeRegion(id: string): void {
  regions.value = regions.value.filter((r) => r.id !== id);
  if (regionId.value === id) regionId.value = regions.value[0].id;
}
async function save(): Promise<void> {
  busy.value = true;
  try {
    await zc('settings.patch', { patch: { regions: regions.value, regionId: regionId.value, defaultMargin: (Number(marginPct.value) || 0) / 100, invoiceTaxRate: taxRate.value, model: model.value, patrolTimes: patrol.value.split(/[、,，\s]+/).map((x) => x.replace(/：/g, ':').trim()).filter(Boolean) } });
    await refreshState();
    patrol.value = zcState.value!.settings.patrolTimes.join(', ');
    notif.success(i18nT('已保存'));
  } catch (e) { notif.error(errorMessage(e)); } finally { busy.value = false; }
}
async function clearLog(): Promise<void> { try { await zc('log.clear'); await refreshState(); } catch (e) { notif.error(errorMessage(e)); } }
onMounted(async () => { try { Object.assign(models, await zc('models.list')); } catch { /* 没有模型清单不影响设置 */ } });
</script>

<style scoped>
.zc-settings { max-width: 1100px; }
.zc-panel { border: 1px solid var(--color-border); border-radius: var(--radius-6); background: var(--color-bg-card); padding: 16px; display: grid; gap: 12px; }
.zc-panel h3 { margin: 0; font-size: var(--font-size-lg); display: flex; gap: 10px; align-items: baseline; }
.zc-region { display: grid; gap: 10px; padding: 12px; border: 2px solid var(--color-border); border-radius: var(--radius-5); }
.zc-region.on { border-color: var(--color-brand); }
.zc-region__head { display: flex; gap: 10px; align-items: center; justify-content: space-between; }
.zc-region__head label { display: flex; gap: 8px; align-items: center; }
.zc-name { height: 30px; border-radius: var(--radius-3); border: 1px solid var(--color-border); background: var(--color-bg-input); color: var(--color-text-primary); font: inherit; font-size: var(--font-size-md); font-weight: 700; padding: 0 8px; }
.zc-model { max-width: 520px; }
.zc-log { list-style: none; margin: 0; padding: 0; display: grid; gap: 4px; font-size: 12.5px; max-height: 320px; overflow-y: auto; }
.zc-log time { color: var(--color-text-secondary); margin-inline-end: 10px; font-variant-numeric: tabular-nums; }
.zc-log li.bad { color: var(--color-danger); }
</style>
