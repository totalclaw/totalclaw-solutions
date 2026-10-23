<template>
  <div class="ss-module iv-settings">
    <section class="iv-panel">
      <h3>{{ $t('销售方信息') }}</h3>
      <div class="ss-grid">
        <label class="ss-field"><span>{{ $t('地址') }}</span><input v-model="f.seller.address" type="text" /></label>
        <label class="ss-field"><span>{{ $t('电话') }}</span><input v-model="f.seller.phone" type="text" /></label>
        <label class="ss-field"><span>{{ $t('开户银行') }}</span><input v-model="f.seller.bank" type="text" /></label>
        <label class="ss-field"><span>{{ $t('银行账号') }}</span><input v-model="f.seller.bankAccount" type="text" /></label>
        <label class="ss-field"><span>{{ $t('开票人') }}</span><input v-model="f.seller.drawer" type="text" /></label>
      </div>
      <p class="ss-muted">{{ $t('名称、税号、税率、限额与额度在「开票」页的第 1 步里改。') }}</p>
    </section>

    <section class="iv-panel">
      <h3>{{ $t('开票默认值') }}</h3>
      <div class="ss-grid">
        <label class="ss-field"><span>{{ $t('表里没写票种时') }}</span><select v-model="f.defaultKind"><option value="normal">{{ $t('普通发票') }}</option><option value="special">{{ $t('专用发票') }}</option></select></label>
        <label class="ss-field"><span>{{ $t('表里没写是否含税时，金额按') }}</span><select v-model="f.amountTaxIncluded"><option :value="true">{{ $t('含税') }}</option><option :value="false">{{ $t('不含税') }}</option></select></label>
        <label class="ss-field"><span>{{ $t('单张发票明细行上限') }}</span><input v-model.number="f.maxLines" type="number" min="1" max="2000" /></label>
      </div>
    </section>

    <section class="iv-panel">
      <h3>{{ $t('官方批量导入模板') }}</h3>
      <p class="ss-muted">{{ $t('应用自带一份电子税务局官方《批量导入开具发票模板》（V260401 版，2026 年 10 月从吉林电子税务局下载）。批量开票页提示「导入模板已更新」时，在页面上下载新模板放到这里，生成导入文件就会改用它。') }}</p>
      <div class="ss-actions">
        <button type="button" class="ss-btn" @click="pickTemplate"><i class="ri-file-excel-2-line"></i>{{ $t('选择官方模板') }}</button>
        <code v-if="f.officialTemplate" class="iv-path">{{ f.officialTemplate }}</code>
        <button v-if="f.officialTemplate" type="button" class="ss-link" @click="f.officialTemplate = ''">{{ $t('改回自带模板') }}</button>
      </div>
    </section>

    <section class="iv-panel">
      <h3>{{ $t('输出目录与模型') }}</h3>
      <div class="ss-actions">
        <button type="button" class="ss-btn" @click="pickDir"><i class="ri-folder-open-line"></i>{{ $t('选择输出目录') }}</button>
        <code class="iv-path">{{ f.outputDir || $t('默认：文档 / TotalClaw / 发票智能体') }}</code>
      </div>
      <label class="ss-field iv-model"><span>{{ $t('读付款回单、建议税收编码用的模型') }}</span>
        <select v-model="f.model">
          <option value="">{{ $t('跟随系统默认（{p0}）', { p0: models.defaultLabel || $t('未配置') }) }}</option>
          <option v-for="o in models.options" :key="o.value" :value="o.value">{{ o.group ? `${o.group} · ` : '' }}{{ o.label }}</option>
        </select>
      </label>
      <p class="ss-muted">{{ $t('模型只读文字和给编码建议；金额、税额、拆票全部由规则计算。') }}</p>
    </section>

    <div class="ss-actions"><button type="button" class="ss-btn primary" :disabled="busy" @click="save"><i class="ri-save-line"></i>{{ $t('保存设置') }}</button></div>

    <section class="iv-panel">
      <h3>{{ $t('操作记录') }}<button type="button" class="ss-link" @click="clearLog">{{ $t('清空') }}</button></h3>
      <p v-if="!log.length" class="ss-empty">{{ $t('还没有记录') }}</p>
      <ul v-else class="iv-log"><li v-for="(l, i) in log" :key="i" :class="{ bad: !l.ok }"><time>{{ fmtDateTime(l.at) }}</time>{{ l.text }}</li></ul>
    </section>
  </div>
</template>

<script setup lang="ts">
/** 设置：销售方补充信息、默认值、官方模板、输出目录与模型、操作记录。 */
import { computed, onMounted, reactive, ref, watch } from 'vue';
import type { IvSettings } from '@totalclaw/ipc-contracts';
import { useNotificationStore } from '../../stores/notification';
import { t as i18nT } from '../../i18n';
import { errorMessage, fmtDateTime, iv, ivState, refreshState } from './shared';

const notif = useNotificationStore();
const busy = ref(false);
const models = reactive<{ options: Array<{ value: string; label: string; group?: string }>; defaultLabel: string }>({ options: [], defaultLabel: '' });
const f = reactive({ seller: { address: '', phone: '', bank: '', bankAccount: '', drawer: '' }, defaultKind: 'normal' as IvSettings['defaultKind'], amountTaxIncluded: true, maxLines: 100, officialTemplate: '', outputDir: '', model: '' });
const log = computed(() => ivState.value?.log || []);
let seeded = false;
watch(ivState, (s) => {
  if (!s || seeded) return;
  seeded = true;
  const st = s.settings;
  Object.assign(f.seller, { address: st.seller.address, phone: st.seller.phone, bank: st.seller.bank, bankAccount: st.seller.bankAccount, drawer: st.seller.drawer });
  Object.assign(f, { defaultKind: st.defaultKind, amountTaxIncluded: st.amountTaxIncluded, maxLines: st.maxLines, officialTemplate: st.officialTemplate, outputDir: st.outputDir, model: st.model });
}, { immediate: true });

async function pickTemplate(): Promise<void> { const p = await iv<string[]>('files.pick', { kind: 'excel' }); if (p[0]) f.officialTemplate = p[0]; }
async function pickDir(): Promise<void> { const d = await iv<string>('dirs.pick'); if (d) f.outputDir = d; }
async function save(): Promise<void> {
  busy.value = true;
  try {
    const cur = ivState.value!.settings.seller;
    await iv('settings.patch', { patch: { seller: { ...cur, ...f.seller }, defaultKind: f.defaultKind, amountTaxIncluded: f.amountTaxIncluded, maxLines: f.maxLines, officialTemplate: f.officialTemplate, outputDir: f.outputDir, model: f.model } });
    await refreshState();
    notif.success(i18nT('已保存'));
  } catch (e) { notif.error(errorMessage(e)); } finally { busy.value = false; }
}
async function clearLog(): Promise<void> { try { await iv('log.clear'); await refreshState(); } catch (e) { notif.error(errorMessage(e)); } }
onMounted(async () => { try { Object.assign(models, await iv('models.list')); } catch { /* 没有模型清单不影响设置 */ } });
</script>

<style scoped>
.iv-settings { max-width: 1100px; }
.iv-panel { border: 1px solid var(--color-border); border-radius: var(--radius-6); background: var(--color-bg-card); padding: 16px; display: grid; gap: 12px; }
.iv-panel h3 { margin: 0; font-size: var(--font-size-lg); display: flex; gap: 10px; align-items: baseline; }
.iv-path { font-size: var(--font-size-sm); color: var(--color-text-secondary); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; min-width: 0; flex: 1; }
.iv-model { max-width: 520px; }
.iv-log { list-style: none; margin: 0; padding: 0; display: grid; gap: 4px; font-size: 12.5px; max-height: 320px; overflow-y: auto; }
.iv-log time { color: var(--color-text-secondary); margin-inline-end: 10px; font-variant-numeric: tabular-nums; }
.iv-log li.bad { color: var(--color-danger); }
</style>
