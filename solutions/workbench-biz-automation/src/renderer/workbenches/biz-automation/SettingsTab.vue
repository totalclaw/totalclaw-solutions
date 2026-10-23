<template>
  <div v-if="s" class="ba-set">
    <section class="ss-panel">
      <header class="ba-head"><strong><i class="ri-store-2-line"></i>{{ $t('品牌与输出') }}</strong></header>
      <div class="ss-grid">
        <label class="ss-field"><span>{{ $t('品牌 / 门店名（视频顶部标题、报表抬头）') }}</span><input v-model.trim="draft.brandName" type="text" maxlength="30" /></label>
        <label class="ss-field"><span>{{ $t('门店地址（数字人片尾）') }}</span><input v-model.trim="draft.storeAddress" type="text" maxlength="80" /></label>
        <label class="ss-field"><span>{{ $t('营业时间（数字人片尾）') }}</span><input v-model.trim="draft.openingHours" type="text" maxlength="40" /></label>
      </div>
      <p class="ss-muted">{{ $t('输出目录：{p0}', { p0: s.outputDir }) }}</p>
    </section>

    <section class="ss-panel">
      <header class="ba-head"><strong><i class="ri-folder-received-line"></i>{{ $t('共享文件夹取数') }}</strong></header>
      <p class="ss-muted">{{ $t('收银 / 进销存系统每天把报表导出到这些文件夹（或数字员工登录后台导出到这里），定时任务取最新一份；只读，不改原文件。') }}</p>
      <div v-for="k in FOLDER_KINDS" :key="k.key" class="ba-folder">
        <b>{{ k.label }}</b>
        <code>{{ draft.dataFolders?.[k.key] || $t('未设置') }}</code>
        <button type="button" class="ss-btn sm" @click="pickFolder(k.key)"><i class="ri-folder-open-line"></i>{{ $t('选择文件夹') }}</button>
        <button v-if="draft.dataFolders?.[k.key]" type="button" class="ss-link" @click="draft.dataFolders[k.key] = ''">{{ $t('清除') }}</button>
      </div>
    </section>

    <section class="ss-panel">
      <header class="ba-head"><strong><i class="ri-store-3-line"></i>{{ $t('上架渠道') }}</strong></header>
      <div class="ss-table-wrap">
        <table class="ss-table">
          <thead><tr><th>{{ $t('启用') }}</th><th>{{ $t('渠道') }}</th><th>{{ $t('商家后台地址') }}</th><th>{{ $t('主图比例') }}</th><th>{{ $t('标题字数上限') }}</th><th :title="$t('打开后数字员工填完直接提交，不再停在提交前；每次执行记为「自动执行」')">{{ $t('全自动提交') }}</th></tr></thead>
          <tbody>
            <tr v-for="c in draft.channels" :key="c.id">
              <td><input v-model="c.enabled" type="checkbox" /></td>
              <td><input v-model.trim="c.name" type="text" /></td>
              <td><input v-model.trim="c.url" type="text" class="ba-url" /></td>
              <td><select v-model="c.aspect"><option value="1:1">1:1</option><option value="3:4">3:4</option></select></td>
              <td><input v-model.number="c.titleMax" type="number" min="10" max="60" /></td>
              <td><input type="checkbox" :checked="!!c.autoSubmit" @change="toggleAuto(c, ($event.target as HTMLInputElement))" /></td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <section class="ss-panel">
      <header class="ba-head"><strong><i class="ri-scales-3-line"></i>{{ $t('上下架规则') }}</strong></header>
      <label class="ba-check"><input v-model="draft.autoDelistLocal" type="checkbox" />{{ $t('售罄时自动把门店试穿手机端下架（只动本机，网店下架要人确认）') }}</label>
      <label class="ss-field"><span>{{ $t('主力尺码（这些尺码缺货算断码，逗号分隔）') }}</span><input v-model="coreSizes" type="text" /></label>
      <div class="ba-seasons">
        <span class="ss-subhead">{{ $t('季节在售月份（不在这些月份的款提醒过季）') }}</span>
        <label v-for="(months, season) in draft.seasonMonths" :key="season" class="ba-season">
          <b>{{ season }}</b>
          <input :value="months.join(',')" type="text" :placeholder="$t('如 5,6,7,8；留空表示四季都卖')" @change="draft.seasonMonths[season] = parseMonths(($event.target as HTMLInputElement).value)" />
        </label>
      </div>
    </section>

    <section class="ss-panel">
      <header class="ba-head"><strong><i class="ri-checkbox-circle-line"></i>{{ $t('能力就绪') }}</strong></header>
      <ul class="ba-ready">
        <li><span class="ss-chip" :class="s.ready.ffmpeg ? 'ok' : 'bad'">ffmpeg</span>{{ $t('短视频成片') }}</li>
        <li><span class="ss-chip" :class="s.ready.image ? 'ok' : 'warn'">{{ $t('图像 / 语音服务') }}</span>{{ $t('高保真配音；没有时用标准音色') }}</li>
        <li><span class="ss-chip" :class="s.ready.digitalHuman ? 'ok' : 'warn'">{{ $t('数字人服务') }}</span>{{ $t('在「数字人工作台 → 配置」设置') }}</li>
        <li><span class="ss-chip" :class="s.ready.knowledge ? 'ok' : 'warn'">{{ $t('知识库') }}</span>{{ $t('数字人讲稿的公司资料来源') }}</li>
        <li><span class="ss-chip" :class="s.ready.push ? 'ok' : 'warn'">{{ $t('推送渠道') }}</span>{{ $t('在「设置 → 通知与推送」配置') }}</li>
      </ul>
    </section>

    <div class="ss-actions">
      <button type="button" class="ss-btn primary" :disabled="!dirty" @click="save"><i class="ri-save-line"></i>{{ $t('保存设置') }}</button>
      <span v-if="dirty" class="ss-muted">{{ $t('有未保存的修改') }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue';
import type { BaSettings } from '@totalclaw/ipc-contracts';
import { useNotificationStore } from '../../stores/notification';
import { t as i18nT } from '../../i18n';
import { ba, baState, errorMessage, refreshState } from './shared';

const notif = useNotificationStore();
const s = computed(() => baState.value);
const draft = reactive<BaSettings>({} as BaSettings);
const coreSizes = ref('');
watch(() => s.value?.settings, (v) => { if (v) { Object.assign(draft, JSON.parse(JSON.stringify(v))); coreSizes.value = v.coreSizes.join(','); } }, { immediate: true });
const dirty = computed(() => !!s.value && (JSON.stringify({ ...draft, coreSizes: parseSizes(coreSizes.value) }) !== JSON.stringify(s.value.settings)));

const FOLDER_KINDS: Array<{ key: 'sales' | 'expense' | 'inventory'; label: string }> = [
  { key: 'sales', label: i18nT('销售明细') }, { key: 'expense', label: i18nT('费用') }, { key: 'inventory', label: i18nT('库存快照') },
];
async function pickFolder(k: 'sales' | 'expense' | 'inventory'): Promise<void> {
  const dir = await ba<string>('dirs.pick').catch(() => '');
  if (dir) draft.dataFolders = { ...draft.dataFolders, [k]: dir };
}
function toggleAuto(c: BaSettings['channels'][number], el: HTMLInputElement): void {
  if (el.checked && !window.confirm(i18nT('打开「{p0}」全自动提交？数字员工填完后会直接提交上架 / 下架，不再等你确认。建议稳定运行两周后再打开。', { p0: c.name }))) { el.checked = false; return; }
  c.autoSubmit = el.checked;
}
function parseMonths(v: string): number[] {
  return [...new Set(v.split(/[,，\s]+/).map(Number).filter((n) => Number.isInteger(n) && n >= 1 && n <= 12))];
}
function parseSizes(v: string): string[] {
  return v.split(/[,，\s]+/).map((x) => x.trim().toUpperCase()).filter(Boolean);
}
async function save(): Promise<void> {
  try {
    await ba('settings.patch', { patch: { brandName: draft.brandName, storeAddress: draft.storeAddress, openingHours: draft.openingHours, dataFolders: draft.dataFolders, channels: draft.channels, seasonMonths: draft.seasonMonths, coreSizes: parseSizes(coreSizes.value), autoDelistLocal: draft.autoDelistLocal } });
    await refreshState();
    notif.success(i18nT('已保存'));
  } catch (e) { notif.error(errorMessage(e)); }
}
</script>

<style scoped>
.ba-set { display: grid; gap: 14px; max-width: 1000px; }
.ss-panel { border: 1px solid var(--color-border); border-radius: var(--radius-6); background: var(--color-bg-card); padding: 14px; display: grid; gap: 10px; }
.ba-head strong { display: flex; gap: 6px; align-items: center; font-size: var(--font-size-base); }
.ba-check { display: flex; gap: 6px; align-items: center; font-size: 12.5px; }
.ba-url { min-width: 260px; }
.ba-seasons { display: grid; gap: 6px; }
.ba-season { display: grid; grid-template-columns: 60px 1fr; gap: 8px; align-items: center; font-size: 12.5px; }
.ba-season input { height: 30px; border-radius: var(--radius-3); border: 1px solid var(--color-border); background: var(--color-bg-input); color: var(--color-text-primary); font: inherit; padding: 0 8px; max-width: 320px; }
.ba-folder { display: flex; gap: 10px; align-items: center; font-size: 12.5px; flex-wrap: wrap; }
.ba-folder b { width: 70px; }
.ba-folder code { flex: 1; min-width: 200px; color: var(--color-text-secondary); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.ba-ready { list-style: none; margin: 0; padding: 0; display: grid; gap: 6px; font-size: 12.5px; }
.ba-ready li { display: flex; gap: 8px; align-items: center; }
</style>
