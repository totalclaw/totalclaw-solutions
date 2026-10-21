<template>
  <section v-if="spec" class="cap-in" data-test="cap-input">
    <header class="fau-row">
      <strong class="grow"><i class="ri-database-2-line"></i> {{ $t('录入与来源') }}</strong>
      <span v-if="command" class="fau-badge muted" data-test="cap-command">{{ $t('对应命令') }} <FauNum :value="command" /></span>
    </header>
    <p class="ss-note info"><i class="ri-shield-check-line"></i>{{ $t('付费数据源默认关闭、标「需授权」；没有授权时用上传、公开数据或手工录入，每个数字都带来源，没有来源的产出里标 [未注明来源]。') }}</p>

    <div v-if="connectors.length" class="fau-row cap-conn" data-test="cap-connectors">
      <span class="ss-muted">{{ $t('可选的授权数据源') }}</span>
      <span v-for="c in connectors" :key="c.id" class="fau-badge" :class="c.status === 'authorized' ? 'ok' : 'muted'" :title="c.fallback ? $t(c.fallback) : ''" :data-test="`cap-conn-${c.id}`">
        {{ $t(c.name) }} · {{ $t(CONN_LABEL[c.status]) }}
      </span>
      <button type="button" class="ss-link" @click="router.push({ path: '/agents', query: { tab: 'connectors' } })">{{ $t('去连接器设置') }}</button>
    </div>

    <!-- 字段 -->
    <div v-if="spec.fields.length" class="cap-grid">
      <label v-for="f in spec.fields" :key="f.key" class="cap-field" :class="{ need: f.required, unsourced: srcOf(f.key).kind === 'default' && fields[f.key]?.v != null }" :data-test="`cap-f-${f.key}`">
        <span class="cap-label">{{ $t(f.label) }}<em v-if="f.required">*</em></span>
        <span class="cap-control">
          <select v-if="f.unit === 'select'" :value="fields[f.key]?.v ?? ''" :disabled="!editable" @change="setField(f, ($event.target as HTMLSelectElement).value)">
            <option value="">{{ $t('请选择…') }}</option>
            <option v-for="o in f.options || []" :key="o.v" :value="o.v">{{ $t(o.label) }}</option>
          </select>
          <input v-else :type="f.unit === 'date' ? 'date' : 'text'" :inputmode="isNumeric(f.unit) ? 'decimal' : undefined" dir="auto" :value="toInput(fields[f.key]?.v, f.unit)" :disabled="!editable" @change="setField(f, ($event.target as HTMLInputElement).value)" />
          <small v-if="f.unit === 'pct'" class="ss-muted">%</small>
        </span>
        <span class="cap-src">
          <select :value="srcOf(f.key).kind" :disabled="!editable || fields[f.key]?.v == null" :aria-label="$t('来源')" @change="setSrcKind(fields[f.key], ($event.target as HTMLSelectElement).value)">
            <option v-for="k in srcKinds(srcOf(f.key).kind)" :key="k" :value="k">{{ $t(SRC_LABEL[k]) }}</option>
          </select>
          <input v-if="srcOf(f.key).kind === 'public'" type="url" dir="ltr" :placeholder="$t('公开来源链接（https://…）')" :value="srcOf(f.key).url || ''" :disabled="!editable" @change="setSrcUrl(fields[f.key], ($event.target as HTMLInputElement).value)" />
        </span>
      </label>
    </div>

    <!-- 录入表 -->
    <div v-for="tb in spec.tables" :key="tb.id" class="cap-table" :data-test="`cap-t-${tb.id}`">
      <header class="fau-row">
        <strong class="grow">{{ $t(tb.label) }} <small class="ss-muted">{{ $t('{n} 行', { n: tables[tb.id]?.length || 0 }) }}<template v-if="tb.minRows"> · {{ $t('至少 {n} 行', { n: tb.minRows }) }}</template></small></strong>
        <button v-if="editable" type="button" class="ss-btn sm ghost" :data-test="`cap-import-${tb.id}`" @click="pickFor(tb.id)"><i class="ri-file-upload-line"></i>{{ $t('从文件导入') }}</button>
        <button type="button" class="ss-btn sm ghost" @click="template(tb.id)"><i class="ri-download-2-line"></i>{{ $t('下载模板') }}</button>
      </header>
      <p class="ss-muted cap-help">{{ $t(tb.help) }}</p>
      <template v-if="pending?.tableId === tb.id && pending.inspect">
        <TableMapping :table="pending.inspect as any" :roles="pending.inspect.roles.map((r) => ({ ...r, label: $t(r.label) }))" @update="(m) => reinspect(m)" @sheet="(s) => reinspect(undefined, s)" />
        <div class="ss-actions">
          <button type="button" class="ss-btn primary sm" :disabled="busy || pending.inspect.missing.length > 0" :data-test="`cap-import-confirm-${tb.id}`" @click="doImport(false)"><i class="ri-download-2-line"></i>{{ $t('替换为文件里的行') }}</button>
          <button type="button" class="ss-btn sm" :disabled="busy || pending.inspect.missing.length > 0" @click="doImport(true)">{{ $t('追加到现有行') }}</button>
          <button type="button" class="ss-btn ghost sm" @click="pending = null">{{ $t('取消') }}</button>
        </div>
      </template>
      <div class="fau-table-wrap">
        <table class="fau-table">
          <thead>
            <tr><th v-for="c in tb.columns" :key="c.key" :class="{ num: isNumeric(c.unit) }">{{ $t(c.label) }}<template v-if="c.unit === 'pct'"> (%)</template><em v-if="c.required">*</em></th><th>{{ $t('来源') }}</th><th></th></tr>
          </thead>
          <tbody>
            <tr v-for="(r, i) in tables[tb.id] || []" :key="i" :data-test="`cap-row-${tb.id}-${i}`">
              <td v-for="c in tb.columns" :key="c.key" :class="{ num: isNumeric(c.unit) }">
                <select v-if="c.unit === 'select'" :value="r.cells[c.key] ?? ''" :disabled="!editable" @change="setCell(r, c, ($event.target as HTMLSelectElement).value)">
                  <option value="">-</option>
                  <option v-for="o in c.options || []" :key="o.v" :value="o.v">{{ $t(o.label) }}</option>
                </select>
                <input v-else :type="c.unit === 'date' ? 'date' : 'text'" dir="auto" :value="toInput(r.cells[c.key] as any, c.unit)" :disabled="!editable" @change="setCell(r, c, ($event.target as HTMLInputElement).value)" />
              </td>
              <td class="cap-src">
                <small v-if="r.src.kind === 'upload' || r.src.kind === 'handoff'" class="ss-muted"><FauNum :value="srcText(r.src)" /></small>
                <template v-else>
                  <select :value="r.src.kind" :disabled="!editable" :aria-label="$t('来源')" @change="setSrcKind(r, ($event.target as HTMLSelectElement).value)">
                    <option v-for="k in srcKinds(r.src.kind)" :key="k" :value="k">{{ $t(SRC_LABEL[k]) }}</option>
                  </select>
                  <input v-if="r.src.kind === 'public'" type="url" dir="ltr" :placeholder="$t('公开来源链接（https://…）')" :value="r.src.url || ''" :disabled="!editable" @change="setSrcUrl(r, ($event.target as HTMLInputElement).value)" />
                </template>
              </td>
              <td><button v-if="editable" type="button" class="ss-iconbtn" :title="$t('删除这一行')" @click="removeRow(tb.id, i)"><i class="ri-delete-bin-line"></i></button></td>
            </tr>
          </tbody>
        </table>
      </div>
      <button v-if="editable" type="button" class="ss-btn sm ghost" :data-test="`cap-addrow-${tb.id}`" @click="addRow(tb.id)"><i class="ri-add-line"></i>{{ $t('加一行（手工录入）') }}</button>
    </div>

    <div class="ss-actions">
      <button v-if="editable" type="button" class="ss-btn primary" :disabled="busy || !dirty" data-test="cap-save" @click="save"><i class="ri-save-3-line"></i>{{ $t('保存录入') }}</button>
      <span v-if="dirty" class="ss-muted">{{ $t('有改动还没保存；保存后再开始校验') }}</span>
      <span v-else-if="savedOnce" class="fau-badge ok">{{ $t('已保存') }}</span>
    </div>
    <p v-if="error" class="ss-note danger" data-test="cap-error"><i class="ri-error-warning-line"></i>{{ error }}</p>
  </section>
</template>

<script setup lang="ts">
/**
 * G6 投融资与估值 · 第 ② 步录入面板：字段与录入表按 specs.ts 渲染（三级降级：有授权连接器 / 上传或公开数据 / 手工录入），
 * 每个值、每行都带来源；模板默认值的来源是「未注明来源」，改动或确认后变成手工录入。
 */
import { computed, onMounted, reactive, ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import type { FauCapInputs, FauCapRow, FauCapSource, FauCapValue, FauInspectResult, FauModuleDef, FauRun } from '@totalclaw/ipc-contracts';
import { capSpec, initialInputs, type CapFieldSpec } from '../../../../../shared/financeAudit/capital/specs';
import { i18nKey } from '../../../../i18n';
import TableMapping from '../../../service-settlement/TableMapping.vue';
import FauNum from '../../FauNum.vue';
import { errorMessage, fau } from '../../shared';
import { fromInput, isNumeric, srcText, toInput } from './format';

const props = defineProps<{ run: FauRun; def: FauModuleDef; editable: boolean }>();
const emit = defineEmits<{ (e: 'changed'): void }>();
const router = useRouter();

const SRC_LABEL: Record<string, string> = {
  manual: i18nKey('手工录入'), public: i18nKey('公开数据（填链接）'), connector: i18nKey('来自授权连接器'), default: i18nKey('模板默认值（未注明来源）'),
  upload: i18nKey('上传文件'), handoff: i18nKey('上游转交'),
};
const CONN_LABEL: Record<string, string> = { needs_auth: i18nKey('需授权'), added: i18nKey('已添加，待授权'), authorized: i18nKey('已授权') };

const spec = computed(() => capSpec(props.def.id, props.run.modeId));
const command = computed(() => props.def.quickActions?.find((q) => q.id === props.run.modeId)?.command || '');
const fields = reactive<Record<string, FauCapValue>>({});
const tables = reactive<Record<string, FauCapRow[]>>({});
const connectors = ref<Array<{ id: string; name: string; status: string; fallback: string }>>([]);
const pending = ref<{ tableId: string; path: string; inspect: (FauInspectResult & { roles: { key: string; label: string; required?: boolean }[] }) | null } | null>(null);
const dirty = ref(false);
const savedOnce = ref(false);
const busy = ref(false);
const error = ref('');

function load(): void {
  const cap = (props.run.params.cap as FauCapInputs | undefined) || (spec.value ? initialInputs(props.def.id, props.run.modeId) as unknown as FauCapInputs : { fields: {}, tables: {} });
  for (const k of Object.keys(fields)) delete fields[k];
  for (const k of Object.keys(tables)) delete tables[k];
  for (const [k, v] of Object.entries(cap.fields || {})) fields[k] = { v: v.v, src: { ...v.src } };
  for (const tb of spec.value?.tables || []) tables[tb.id] = (cap.tables?.[tb.id] || []).map((r) => ({ cells: { ...r.cells }, src: { ...r.src } }));
  // 第一次打开：带出模板默认值，算作未保存
  dirty.value = !props.run.params.cap && Object.keys(fields).length > 0;
}

const srcOf = (key: string): FauCapSource => fields[key]?.src || { kind: 'default' };
/** 可选来源：上传 / 转交只能由导入产生；模板默认值只在还没确认时出现 */
const srcKinds = (cur: string): string[] => [...(cur === 'default' ? ['default'] : []), 'manual', 'public', 'connector'];

function setField(f: CapFieldSpec, raw: string): void {
  const v = f.unit === 'select' ? (raw || null) : fromInput(raw, f.unit);
  if (v === null) delete fields[f.key];
  else fields[f.key] = { v, src: fields[f.key] && fields[f.key].src.kind !== 'default' ? fields[f.key].src : { kind: 'manual' } };
  dirty.value = true;
}
function setCell(r: FauCapRow, c: CapFieldSpec, raw: string): void {
  r.cells[c.key] = c.unit === 'select' ? (raw || null) : fromInput(raw, c.unit);
  if (r.src.kind === 'upload' || r.src.kind === 'default') r.src = { kind: 'manual' };
  dirty.value = true;
}
function setSrcKind(target: { src: FauCapSource } | undefined, kind: string): void {
  if (!target) return;
  target.src = { kind: kind as FauCapSource['kind'], ...(kind === 'public' && target.src.url ? { url: target.src.url } : {}) };
  dirty.value = true;
}
function setSrcUrl(target: { src: FauCapSource } | undefined, url: string): void {
  if (!target) return;
  target.src = { ...target.src, url: url.trim() };
  dirty.value = true;
}
function addRow(id: string): void {
  (tables[id] ||= []).push({ cells: {}, src: { kind: 'manual' } });
  dirty.value = true;
}
function removeRow(id: string, i: number): void {
  tables[id]?.splice(i, 1);
  dirty.value = true;
}

async function guarded(fn: () => Promise<unknown>): Promise<void> {
  busy.value = true; error.value = '';
  try { await fn(); } catch (e) { error.value = errorMessage(e); } finally { busy.value = false; }
}
function save(): Promise<void> {
  return guarded(async () => {
    await fau('capital.save', { runId: props.run.id, cap: { fields, tables } });
    dirty.value = false;
    savedOnce.value = true;
    emit('changed');
  });
}
function pickFor(tableId: string): Promise<void> {
  return guarded(async () => {
    const r = await fau<{ paths: string[] }>('capital.pickTable');
    if (!r.paths.length) return;
    pending.value = { tableId, path: r.paths[0], inspect: null };
    await reinspect();
  });
}
async function reinspect(mapping?: Record<string, string>, sheet?: string): Promise<void> {
  const p = pending.value;
  if (!p) return;
  await guarded(async () => {
    p.inspect = await fau('capital.inspectTable', { runId: props.run.id, path: p.path, tableId: p.tableId, mapping: mapping ?? p.inspect?.mapping, sheet: sheet ?? p.inspect?.sheetName });
  });
}
function doImport(append: boolean): Promise<void> {
  const p = pending.value;
  if (!p?.inspect) return Promise.resolve();
  return guarded(async () => {
    // 先存手工改动，再导入（导入在主进程合并进已保存的录入）
    if (dirty.value) await fau('capital.save', { runId: props.run.id, cap: { fields, tables } });
    await fau('capital.importTable', { runId: props.run.id, path: p.path, tableId: p.tableId, mapping: p.inspect!.mapping, sheet: p.inspect!.sheetName, append });
    pending.value = null;
    dirty.value = false;
    emit('changed');
  });
}
function template(tableId: string): Promise<void> {
  return guarded(async () => {
    const r = await fau<{ path: string }>('capital.template', { moduleId: props.def.id, modeId: props.run.modeId, tableId });
    await fau('artifact.reveal', { path: r.path });
  });
}

watch(() => [props.run.id, props.run.updatedAt], () => { if (!dirty.value) load(); });
onMounted(async () => {
  load();
  try { connectors.value = await fau('capital.connectors', { moduleId: props.def.id }); } catch { connectors.value = []; }
});
</script>

<style scoped>
/* 录入表很宽：不让它的最小内容宽度把七步页撑出视口（表格在自己的横向滚动容器里滚） */
.cap-in { contain: inline-size; display: grid; grid-template-columns: minmax(0, 1fr); gap: 10px; border: 1px solid var(--color-border); border-radius: 12px; padding: 10px 12px; background: var(--color-bg-card); }
.cap-grid { display: grid; gap: 8px 14px; grid-template-columns: repeat(auto-fill, minmax(min(100%, 320px), 1fr)); }
.cap-field { display: grid; gap: 4px; font-size: 12.5px; padding: 6px 8px; border-radius: 8px; border: 1px dashed transparent; }
.cap-field.need .cap-label em, th em { color: var(--color-danger); font-style: normal; margin-inline-start: 2px; }
.cap-field.unsourced { border-color: color-mix(in srgb, var(--color-warning) 55%, transparent); }
.cap-control, .cap-src { display: flex; gap: 6px; align-items: center; min-width: 0; }
.cap-control input, .cap-control select, .cap-src input, .cap-src select, .cap-table td input, .cap-table td select {
  height: 28px; border-radius: 7px; border: 1px solid var(--color-border); background: var(--color-bg-input, var(--color-bg-primary)); color: var(--color-text-primary);
  font: inherit; font-size: 12.5px; padding-inline: 6px; min-width: 0; width: 100%;
}
.cap-src input { max-width: 260px; }
.cap-table { display: grid; grid-template-columns: minmax(0, 1fr); gap: 6px; }
.cap-table td { min-width: 90px; }
.cap-help { margin: 0; font-size: 12px; }
.cap-conn { font-size: 12px; }
</style>
