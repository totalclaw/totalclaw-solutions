<template>
  <div class="ss-module">
    <section class="iv-panel">
      <h3>{{ $t('客户档案') }}<small>{{ $t('开过票的购买方自动记进来；下次表里只写名称，税号等信息自动补全') }}</small></h3>
      <div class="ss-grid">
        <label class="ss-field"><span>{{ $t('名称') }}</span><input v-model="c.name" type="text" /></label>
        <label class="ss-field"><span>{{ $t('税号') }}</span><input v-model="c.taxNo" type="text" /></label>
        <label class="ss-field"><span>{{ $t('地址') }}</span><input v-model="c.address" type="text" /></label>
        <label class="ss-field"><span>{{ $t('电话') }}</span><input v-model="c.phone" type="text" /></label>
        <label class="ss-field"><span>{{ $t('开户银行') }}</span><input v-model="c.bank" type="text" /></label>
        <label class="ss-field"><span>{{ $t('银行账号') }}</span><input v-model="c.bankAccount" type="text" /></label>
        <label class="ss-field"><span>{{ $t('邮箱') }}</span><input v-model="c.email" type="text" /></label>
      </div>
      <div class="ss-actions">
        <button type="button" class="ss-btn primary" :disabled="busy || !c.name.trim()" @click="saveCustomer"><i class="ri-save-line"></i>{{ c.id ? $t('保存修改') : $t('添加客户') }}</button>
        <button v-if="c.id" type="button" class="ss-link" @click="resetCustomer">{{ $t('取消') }}</button>
        <button type="button" class="ss-btn" :disabled="busy" @click="importCustomers"><i class="ri-file-excel-2-line"></i>{{ $t('从表格导入') }}</button>
      </div>
      <p v-if="!customers.length" class="ss-empty">{{ $t('还没有客户') }}</p>
      <div v-else class="ss-table-wrap iv-scroll">
        <table class="ss-table">
          <thead><tr><th>{{ $t('名称') }}</th><th>{{ $t('税号') }}</th><th>{{ $t('地址、电话') }}</th><th>{{ $t('开户行及账号') }}</th><th>{{ $t('邮箱') }}</th><th></th></tr></thead>
          <tbody>
            <tr v-for="x in customers" :key="x.id">
              <td>{{ x.name }}</td><td class="iv-mono">{{ x.taxNo }}</td><td>{{ x.address }} {{ x.phone }}</td><td>{{ x.bank }} {{ x.bankAccount }}</td><td>{{ x.email }}</td>
              <td class="iv-ops"><button type="button" class="ss-link" @click="Object.assign(c, x)">{{ $t('改') }}</button><button type="button" class="ss-link" @click="removeCustomer(x.id)">{{ $t('删除') }}</button></td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <section class="iv-panel">
      <h3>{{ $t('商品档案') }}<small>{{ $t('开票项目名称对应的税收分类编码；模型建议的要你确认后才会用') }}</small></h3>
      <div class="ss-grid">
        <label class="ss-field"><span>{{ $t('项目名称') }}</span><input v-model="g.name" type="text" /></label>
        <label class="ss-field"><span>{{ $t('税收分类编码（19 位）') }}</span><input v-model="g.taxCode" type="text" maxlength="19" /></label>
        <label class="ss-field"><span>{{ $t('分类简称') }}</span><input v-model="g.shortName" type="text" /></label>
        <label class="ss-field"><span>{{ $t('规格型号') }}</span><input v-model="g.spec" type="text" /></label>
        <label class="ss-field"><span>{{ $t('单位') }}</span><input v-model="g.unit" type="text" /></label>
      </div>
      <div class="ss-actions">
        <button type="button" class="ss-btn primary" :disabled="busy || !g.name.trim() || g.taxCode.length !== 19" @click="saveGoods"><i class="ri-save-line"></i>{{ g.id ? $t('保存修改') : $t('添加商品') }}</button>
        <button v-if="g.id" type="button" class="ss-link" @click="resetGoods">{{ $t('取消') }}</button>
      </div>
      <p v-if="!goods.length" class="ss-empty">{{ $t('还没有商品') }}</p>
      <div v-else class="ss-table-wrap iv-scroll">
        <table class="ss-table">
          <thead><tr><th>{{ $t('项目名称') }}</th><th>{{ $t('税收分类编码') }}</th><th>{{ $t('分类简称') }}</th><th>{{ $t('规格型号') }}</th><th>{{ $t('单位') }}</th><th>{{ $t('状态') }}</th><th></th></tr></thead>
          <tbody>
            <tr v-for="x in goods" :key="x.id">
              <td>{{ x.name }}</td><td class="iv-mono">{{ x.taxCode }}</td><td>{{ x.shortName }}</td><td>{{ x.spec }}</td><td>{{ x.unit }}</td>
              <td><span class="ss-chip" :class="x.confirmed ? 'ok' : 'warn'">{{ x.confirmed ? $t('已确认') : $t('模型建议，待确认') }}</span></td>
              <td class="iv-ops">
                <button v-if="!x.confirmed" type="button" class="ss-link" @click="act(() => iv('goods.confirm', { id: x.id }))">{{ $t('确认') }}</button>
                <button type="button" class="ss-link" @click="Object.assign(g, { id: x.id, name: x.name, taxCode: x.taxCode, shortName: x.shortName, spec: x.spec, unit: x.unit })">{{ $t('改') }}</button>
                <button type="button" class="ss-link" @click="act(() => iv('goods.remove', { id: x.id }))">{{ $t('删除') }}</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
/** 客户档案与商品档案：开票时自动补全、自动带编码。 */
import { computed, reactive, ref } from 'vue';
import { useNotificationStore } from '../../stores/notification';
import { t as i18nT } from '../../i18n';
import { errorMessage, iv, ivState, refreshState } from './shared';

const notif = useNotificationStore();
const busy = ref(false);
const customers = computed(() => ivState.value?.customers || []);
const goods = computed(() => ivState.value?.goods || []);
const blankC = () => ({ id: '', name: '', taxNo: '', address: '', phone: '', bank: '', bankAccount: '', email: '' });
const blankG = () => ({ id: '', name: '', taxCode: '', shortName: '', spec: '', unit: '' });
const c = reactive(blankC());
const g = reactive(blankG());
const resetCustomer = () => Object.assign(c, blankC());
const resetGoods = () => Object.assign(g, blankG());

async function act(fn: () => Promise<unknown>): Promise<boolean> {
  busy.value = true;
  try { await fn(); await refreshState(); return true; } catch (e) { notif.error(errorMessage(e)); return false; } finally { busy.value = false; }
}
async function saveCustomer(): Promise<void> { if (await act(() => iv('customers.upsert', { ...c, ...(c.id ? {} : { id: undefined }) }))) resetCustomer(); }
async function removeCustomer(id: string): Promise<void> { await act(() => iv('customers.remove', { id })); }
async function importCustomers(): Promise<void> {
  const paths = await iv<string[]>('files.pick', { kind: 'excel' });
  if (!paths.length) return;
  await act(async () => { const r = await iv<{ imported: number; total: number }>('customers.import', { path: paths[0] }); notif.success(i18nT('导入 {a} 家客户（表里 {b} 行）', { a: r.imported, b: r.total })); });
}
async function saveGoods(): Promise<void> { if (await act(() => iv('goods.upsert', { ...g, ...(g.id ? {} : { id: undefined }) }))) resetGoods(); }
</script>

<style scoped>
.iv-panel { border: 1px solid var(--color-border); border-radius: 14px; background: var(--color-bg-card); padding: 16px; display: grid; gap: 12px; }
.iv-panel h3 { margin: 0; font-size: 15px; display: flex; gap: 10px; align-items: baseline; flex-wrap: wrap; }
.iv-panel h3 small { font-size: 12px; font-weight: 400; color: var(--color-text-secondary); }
.iv-scroll { max-height: 380px; overflow-y: auto; }
.iv-mono { font-family: var(--font-mono, ui-monospace, monospace); }
.iv-ops { display: flex; gap: 10px; }
</style>
