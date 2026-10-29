<template>
  <div class="fau-wizard ss-module" data-test="fau-setup">
    <StickyProgress :title="$t('首次配置')" :metas="steps.metas" :runtime="steps.runtime" :current-key="steps.currentKey.value" @jump="scrollToStep" />
    <div class="fau-steps">
      <!-- ① 公司与地区 -->
      <StepCard step-key="company" :index="0" :title="steps.metas[0].title" :hint="steps.metas[0].hint" :runtime="steps.runtime.company" :is-current="steps.currentKey.value === 'company'">
        <div class="ss-grid">
          <label class="ss-field"><span>{{ $t('公司名称') }} *</span><input v-model.trim="form.name" data-test="fau-company-name" /></label>
          <label class="ss-field"><span>{{ $t('统一社会信用代码 / 商业登记号') }}</span><input v-model.trim="form.regNo" dir="ltr" /></label>
          <label class="ss-field"><span>{{ $t('增值税号') }}</span><input v-model.trim="form.vatNo" dir="ltr" /></label>
          <label class="ss-field"><span>{{ $t('记账本位币') }}</span><input v-model.trim="form.currency" dir="ltr" maxlength="3" data-test="fau-currency" @input="currencyTouched = true" /></label>
          <label class="ss-field"><span>{{ $t('会计年度起始月') }}</span>
            <select v-model.number="form.fiscalYearStartMonth"><option v-for="m in 12" :key="m" :value="m">{{ m }}</option></select>
          </label>
        </div>
        <div class="fau-row">
          <span class="ss-muted">{{ $t('地区档案（可多选，主地区决定准则与报表口径）') }}</span>
        </div>
        <div class="fau-regions">
          <label v-for="p in profiles" :key="p.id" class="fau-region" :class="{ off: !p.available }">
            <input type="checkbox" :value="p.id" :checked="form.regions.includes(p.id)" :disabled="!p.available" :data-test="`fau-region-${p.id}`" @change="toggleRegion(p.id)" />
            <span>{{ $t(p.name) }}</span>
            <small v-if="!p.available" class="fau-badge muted" :data-batch="p.plannedBatch">{{ $t('即将上线') }}</small>
            <label v-else-if="form.regions.includes(p.id)" class="fau-primary"><input v-model="form.region" type="radio" :value="p.id" />{{ $t('主地区') }}</label>
            <small v-if="p.taxRegimes?.length" class="fau-tax">{{ p.taxRegimes.map((x) => $t(x)).join(sep) }}</small>
          </label>
        </div>
        <div class="ss-actions">
          <button type="button" class="ss-btn primary" data-test="fau-setup-next-company" @click="nextCompany">{{ $t('下一步') }}</button>
          <template v-if="!company">
            <button type="button" class="ss-btn" :disabled="saving" data-test="fau-setup-quick" @click="quickStart"><i class="ri-flashlight-line"></i>{{ $t('用默认配置开始') }}</button>
            <button type="button" class="ss-btn ghost" :disabled="saving" data-test="fau-setup-sample" @click="emit('sample')"><i class="ri-flask-line"></i>{{ $t('打开示例项目') }}</button>
          </template>
        </div>
        <p v-if="!company" class="ss-muted fau-quick-hint">{{ $t('「用默认配置开始」：其余五步（准则与科目映射、ERP、阈值、签核人、套餐）先用默认值，直接进首页，之后随时可以完善。「打开示例项目」：用一套示例数据把各模块先跑一遍看效果。') }}</p>
      </StepCard>

      <!-- ② 准则 + 科目映射 -->
      <StepCard step-key="standard" :index="1" :title="steps.metas[1].title" :hint="steps.metas[1].hint" :runtime="steps.runtime.standard" :is-current="steps.currentKey.value === 'standard'">
        <label class="ss-field"><span>{{ $t('会计准则') }}</span>
          <select v-model="form.standard" data-test="fau-standard">
            <option v-for="s in standardsOfRegion" :key="s" :value="s">{{ $t(standardLabels[s] || s) }}</option>
          </select>
        </label>
        <FauFileDrop :label="$t('上传一份科目余额表做科目映射')" :hint="$t('中国科目编码按前缀自动识别；其它科目表自动给出建议后由你确认')" @picked="(p) => mapAccounts(p[0])" />
        <TableMapping v-if="mapInspect && !mapResult" :table="mapInspect" :roles="mapInspect.roles.map((r: any) => ({ ...r, label: $t(r.label) }))" @update="(m) => mapAccounts(mapInspect!.path, m)" @sheet="(s) => mapAccounts(mapInspect!.path, undefined, s)" />
        <template v-if="mapResult">
          <p v-if="mapResult.autoComplete" class="ss-note ok" data-test="fau-map-auto"><i class="ri-checkbox-circle-line"></i>{{ $t('已自动完成：{n} 个科目全部映射到报表大类', { n: mapResult.entries.length }) }}</p>
          <p v-else class="ss-note warn" data-test="fau-map-review"><i class="ri-error-warning-line"></i>{{ $t('这份科目表需要人工确认：{n} 个科目，其中 {m} 个还没有大类', { n: mapResult.entries.length, m: unmappedCount }) }}</p>
          <div v-if="!mapResult.autoComplete" class="fau-table-wrap">
            <table class="fau-table">
              <thead><tr><th>{{ $t('科目编码') }}</th><th>{{ $t('科目名称') }}</th><th>{{ $t('报表大类') }}</th></tr></thead>
              <tbody>
                <tr v-for="(e, i) in mapResult.entries" :key="e.code + e.name" :class="{ warn: !e.cls }">
                  <td><FauNum :value="e.code" /></td>
                  <td>{{ e.name }}</td>
                  <td>
                    <select v-model="e.cls" :data-test="`fau-map-cls-${i}`" @change="e.source = 'manual'">
                      <option value="">{{ $t('请选择…') }}</option>
                      <option v-for="(label, k) in CLASS_LABEL" :key="k" :value="k">{{ $t(label) }}</option>
                    </select>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </template>
        <p v-if="mapError" class="ss-note danger"><i class="ri-error-warning-line"></i>{{ mapError }}</p>
        <div class="ss-actions">
          <button type="button" class="ss-btn primary" :disabled="!!mapResult && unmappedCount > 0" data-test="fau-setup-next-standard" @click="nextStandard">{{ mapResult ? $t('确认映射并继续') : $t('稍后再做，继续') }}</button>
        </div>
      </StepCard>

      <!-- ③ ERP 与数据来源 -->
      <StepCard step-key="erp" :index="2" :title="steps.metas[2].title" :hint="steps.metas[2].hint" :runtime="steps.runtime.erp" :is-current="steps.currentKey.value === 'erp'">
        <div class="fau-seg">
          <button v-for="(label, k) in ERP_LABEL" :key="k" type="button" :class="{ on: form.erp === k }" @click="form.erp = k">{{ $t(label) }}</button>
        </div>
        <p class="ss-muted">{{ $t('ERP 类型决定上传步骤里显示哪份「怎么导出」指引；连接器取数即将上线，现在以上传文件为主。') }}</p>
        <div class="ss-actions"><button type="button" class="ss-btn primary" @click="done('erp')">{{ $t('下一步') }}</button></div>
      </StepCard>

      <!-- ④ 重要性水平与阈值 -->
      <StepCard step-key="thresholds" :index="3" :title="steps.metas[3].title" :hint="steps.metas[3].hint" :runtime="steps.runtime.thresholds" :is-current="steps.currentKey.value === 'thresholds'">
        <div class="fau-row">
          <input v-model.trim="thQuery" type="search" class="fau-th-search" :placeholder="$t('搜索阈值、模块或依据')" data-test="fau-th-search" />
          <span class="ss-muted">{{ $t('只列已启用套餐里的模块；金额按元、比例按百分比填写。没改的沿用默认值。') }}</span>
        </div>
        <div class="fau-table-wrap fau-th-wrap">
          <table class="fau-table" data-test="fau-th-table">
            <thead><tr><th>{{ $t('阈值') }}</th><th class="num">{{ $t('默认值') }}</th><th>{{ $t('本公司') }}</th><th>{{ $t('依据') }}</th></tr></thead>
            <template v-for="g in thGroups" :key="g.group">
              <tbody><tr class="fau-th-group"><td colspan="4">{{ $t(GROUP_LABELS[g.group]) }}</td></tr></tbody>
              <tbody v-for="m in g.modules" :key="m.id" :data-test="`fau-th-mod-${m.id}`">
                <tr class="fau-th-mod">
                  <td colspan="4">
                    <button type="button" class="fau-th-toggle" :aria-expanded="isThOpen(m.id)" :data-test="`fau-th-toggle-${m.id}`" @click="toggleTh(m.id)">
                      <i class="fau-dir-icon" :class="isThOpen(m.id) ? 'ri-arrow-down-s-line' : 'ri-arrow-right-s-line'"></i>
                      <span class="fau-code">{{ m.code }}</span>{{ $t(m.name) }}
                      <span v-if="m.changed" class="fau-badge warn" :data-test="`fau-th-changed-${m.id}`">{{ $t('已改 {n} 项', { n: m.changed }) }}</span>
                    </button>
                  </td>
                </tr>
                <tr v-for="it in m.items" v-show="isThOpen(m.id)" :key="it.key">
                  <td class="wrap"><div>{{ thresholdNameText(it) }}</div><small class="ss-muted" :title="$t('以原文为准')">{{ thresholdOriginalText(it) }}</small></td>
                  <td class="num"><FauNum :value="thresholdText(it, it.value)" /> <small>{{ thresholdUnit(it, form.currency) }}</small></td>
                  <td class="fau-th-input">
                    <input type="number" step="any" min="0" dir="ltr" :value="form.thresholds[it.key] == null ? '' : thresholdInput(it, form.thresholds[it.key])" :placeholder="String(thresholdInput(it, it.value))" :data-test="`fau-th-input-${it.key}`" @change="setOverride(it, ($event.target as HTMLInputElement).value)" />
                    <small>{{ thresholdUnit(it, form.currency) }}</small>
                  </td>
                  <td class="wrap"><small>{{ thresholdBasisText(it) }}</small></td>
                </tr>
              </tbody>
            </template>
          </table>
          <p v-if="!thGroups.length" class="ss-muted fau-th-empty">{{ thQuery ? $t('没有匹配的阈值') : $t('已启用的套餐里没有可设置的阈值') }}</p>
        </div>
        <div class="ss-actions"><button type="button" class="ss-btn primary" @click="done('thresholds')">{{ $t('下一步') }}</button></div>
      </StepCard>

      <!-- ⑤ 签核人与岗位 -->
      <StepCard step-key="signers" :index="4" :title="steps.metas[4].title" :hint="steps.metas[4].hint" :runtime="steps.runtime.signers" :is-current="steps.currentKey.value === 'signers'">
        <div v-for="(s, i) in form.signers" :key="s.id" class="fau-row fau-signer">
          <input v-model.trim="s.name" :placeholder="$t('姓名')" :data-test="`fau-signer-name-${i}`" />
          <input v-model.trim="s.title" :placeholder="$t('岗位')" :data-test="`fau-signer-title-${i}`" />
          <label v-for="l in LEVELS" :key="l" class="fau-check"><input type="checkbox" :checked="s.levels.includes(l)" @change="toggleLevel(s, l)" />{{ $t(LEVEL_LABEL[l]) }}</label>
          <button type="button" class="ss-btn ghost sm" :title="$t('移除')" @click="form.signers.splice(i, 1)"><i class="ri-delete-bin-line"></i></button>
        </div>
        <div class="ss-actions"><button type="button" class="ss-btn sm" data-test="fau-signer-add" @click="addSigner"><i class="ri-user-add-line"></i>{{ $t('添加签核人') }}</button></div>
        <div class="fau-row">
          <span class="ss-muted">{{ $t('职责分离（同一次运行里编制人与复核人不能是同一人）') }}</span>
          <span class="fau-seg">
            <button type="button" :class="{ on: form.sodMode === 'block' }" @click="form.sodMode = 'block'">{{ $t('阻断') }}</button>
            <button type="button" :class="{ on: form.sodMode === 'record' }" @click="form.sodMode = 'record'">{{ $t('允许但记录') }}</button>
          </span>
        </div>
        <div class="ss-actions"><button type="button" class="ss-btn primary" @click="done('signers')">{{ $t('下一步') }}</button></div>
      </StepCard>

      <!-- ⑥ 启用套餐 -->
      <StepCard step-key="packages" :index="5" :title="steps.metas[5].title" :hint="steps.metas[5].hint" :runtime="steps.runtime.packages" :is-current="steps.currentKey.value === 'packages'">
        <div class="fau-regions">
          <label v-for="(label, k) in PACKAGE_LABELS" :key="k" class="fau-region">
            <input type="checkbox" :checked="form.packages.includes(k)" :disabled="k === 'core'" :data-test="`fau-pkg-${k}`" @change="togglePackage(k)" />
            <span>{{ $t(label) }}</span>
          </label>
        </div>
        <OutputLocalePicker v-model="form.outputLocale" />
        <div class="ss-actions">
          <button type="button" class="ss-btn primary" :disabled="saving" data-test="fau-setup-save" @click="save"><i class="ri-save-3-line"></i>{{ $t('保存配置') }}</button>
          <button v-if="company" type="button" class="ss-btn ghost" @click="emit('cancel')">{{ $t('取消') }}</button>
        </div>
      </StepCard>
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * 首次配置向导（P1，第 5.3 节，对应 cold-start）：六步各自独立状态；保存写 company.json。
 * 改阈值不影响已签核的运行（运行记录里存着当时的阈值版本）。
 */
import { computed, onMounted, reactive, ref } from 'vue';
import type { FauAccountClass, FauAccountMapEntry, FauCompany, FauErp, FauGroup, FauInspectResult, FauPackage, FauRegion, FauRegionProfile, FauSignLevel, FauSigner, FauStandard, FauLocale } from '@totalclaw/ipc-contracts';
import { DEFAULT_PACKAGES, FAU_MODULES, GROUP_LABELS, PACKAGE_LABELS } from '../../../shared/financeAudit/catalog';
import { i18nKey, listSeparator, t as i18nT } from '../../i18n';
import { currentLocale } from '../../composables/useLocale';
import StepCard from '../service-settlement/StepCard.vue';
import StickyProgress from '../service-settlement/StickyProgress.vue';
import TableMapping from '../service-settlement/TableMapping.vue';
import { scrollToStep, useSteps } from '../service-settlement/shared';
import FauFileDrop from './FauFileDrop.vue';
import FauNum from './FauNum.vue';
import OutputLocalePicker from './OutputLocalePicker.vue';
import { LEVEL_LABEL, errorMessage, fau, lastMonth, thresholdBasisText, thresholdInput, thresholdNameText, thresholdOriginalText, thresholdStore, thresholdText, thresholdUnit, type ThresholdItem } from './shared';

const props = defineProps<{ company: FauCompany | null; /** 从首页「去完善」进来时直接落到这一步 */ startAt?: string }>();
const emit = defineEmits<{ (e: 'saved', c: FauCompany): void; (e: 'cancel'): void; (e: 'sample'): void }>();

const steps = useSteps([
  { key: 'company', title: i18nT('公司与地区'), hint: i18nT('公司名称、登记号与税号、地区档案、本位币、会计年度') },
  { key: 'standard', title: i18nT('准则与科目映射'), hint: i18nT('选准则；上传一份余额表把科目映射到报表大类，以后各期复用') },
  { key: 'erp', title: i18nT('ERP 与数据来源'), hint: i18nT('决定上传步骤里显示哪份导出指引') },
  { key: 'thresholds', title: i18nT('重要性水平与阈值'), hint: i18nT('默认值逐条注明出处，可按公司修改') },
  { key: 'signers', title: i18nT('签核人与岗位'), hint: i18nT('编制人、复核人、批准人；是否强制职责分离') },
  { key: 'packages', title: i18nT('启用套餐'), hint: i18nT('选择首页显示的分组；投融资扩展包默认折叠') },
]);

const LEVELS: FauSignLevel[] = ['prepare', 'review', 'approve'];
const sep = listSeparator();
const CLASS_LABEL: Record<Exclude<FauAccountClass, ''>, string> = {
  asset: i18nKey('资产'), liability: i18nKey('负债'), equity: i18nKey('所有者权益'), revenue: i18nKey('收入'), expense: i18nKey('费用'), common: i18nKey('共同类'),
};
const ERP_LABEL: Record<FauErp, string> = {
  yonyou: i18nKey('用友'), kingdee: i18nKey('金蝶'), sap: 'SAP', oracle: 'Oracle', chanjet: i18nKey('畅捷通'), other: i18nKey('其它'),
};

const c = props.company;
const form = reactive({
  id: c?.id, name: c?.name || '', regNo: c?.regNo || '', vatNo: c?.vatNo || '',
  regions: [...(c?.regions || ['CN'])] as FauRegion[], region: (c?.region || 'CN') as FauRegion, standard: (c?.standard || 'CAS') as FauStandard,
  currency: c?.currency || 'CNY', fiscalYearStartMonth: c?.fiscalYearStartMonth || 1, hijriFiscalYear: !!c?.hijriFiscalYear,
  erp: (c?.erp || 'other') as FauErp, accountMap: [...(c?.accountMap || [])] as FauAccountMapEntry[], accountMapConfirmed: !!c?.accountMapConfirmed,
  thresholds: { ...(c?.thresholds || {}) } as Record<string, number>,
  signers: (c?.signers || []).map((s) => ({ ...s, levels: [...s.levels] })) as FauSigner[],
  sodMode: (c?.sodMode || 'block') as 'block' | 'record',
  packages: [...(c?.packages || DEFAULT_PACKAGES)] as FauPackage[],
  // 财会审计报告只有中英阿三种输出语言；越南语 / 马来语界面默认出英文报告
  outputLocale: c?.outputLocale || ((['zh-CN', 'en-US', 'ar'] as string[]).includes(currentLocale()) ? currentLocale() as FauLocale : 'en-US'),
});

const profiles = ref<FauRegionProfile[]>([]);
const standardLabels = ref<Record<string, string>>({});
const thresholds = ref<ThresholdItem[]>([]);
const mapInspect = ref<(FauInspectResult & { roles: any[] }) | null>(null);
const mapResult = ref<{ entries: FauAccountMapEntry[]; autoComplete: boolean; needsReview: boolean; unmapped: number } | null>(null);
const mapError = ref('');
const saving = ref(false);
/** 新建公司时本位币跟着主地区走（沙特 SAR、阿联酋 AED），人改过就不再覆盖 */
const currencyTouched = ref(false);

const standardsOfRegion = computed(() => profiles.value.find((p) => p.id === form.region)?.standards || ['CAS']);

/** 阈值步：分组 → 模块（默认折叠），只列已启用套餐里的模块；搜索时展开命中的模块 */
const thQuery = ref('');
const thOpen = ref<Set<string>>(new Set());
const isThOpen = (id: string) => !!thQuery.value || thOpen.value.has(id);
function toggleTh(id: string): void {
  const next = new Set(thOpen.value);
  if (next.has(id)) next.delete(id); else next.add(id);
  thOpen.value = next;
}
const thGroups = computed(() => {
  const q = thQuery.value.toLowerCase();
  const out: Array<{ group: FauGroup; modules: Array<{ id: string; code: string; name: string; items: ThresholdItem[]; changed: number }> }> = [];
  for (const m of FAU_MODULES) {
    if (!form.packages.includes(m.package)) continue;
    const all = thresholds.value.filter((it) => it.module === m.id);
    const hit = (it: ThresholdItem) => !q || [i18nT(m.name), m.code, it.label ? i18nT(it.label) : '', it.original, thresholdOriginalText(it), thresholdBasisText(it)].some((s) => s.toLowerCase().includes(q));
    const items = all.filter(hit);
    if (!items.length) continue;
    const changed = all.filter((it) => form.thresholds[it.key] != null && form.thresholds[it.key] !== it.value).length;
    let g = out.find((x) => x.group === m.group);
    if (!g) out.push(g = { group: m.group, modules: [] });
    g.modules.push({ id: m.id, code: m.code, name: m.name, items, changed });
  }
  return out;
});
const unmappedCount = computed(() => (mapResult.value ? mapResult.value.entries.filter((e) => !e.cls).length : 0));

onMounted(async () => {
  if (props.startAt && steps.indexOf(props.startAt) > 0) {
    for (const m of steps.metas.slice(0, steps.indexOf(props.startAt))) steps.done(m.key);
    void scrollToStep(props.startAt);
  }
  try {
    const r = await fau<{ profiles: FauRegionProfile[]; standards: Record<string, string> }>('region.profiles');
    profiles.value = r.profiles;
    standardLabels.value = r.standards;
    // 所有已开放的业务模块的阈值（没有阈值文件的模块返回空）
    thresholds.value = await fau<ThresholdItem[]>('thresholds.get', { modules: FAU_MODULES.filter((m) => m.status === 'ready' && m.group !== 'platform').map((m) => m.id) });
  } catch (e) { steps.fail('company', e); }
});

function done(key: string): void { steps.done(key); void scrollToStep(steps.currentKey.value); }

function toggleRegion(id: FauRegion): void {
  form.regions = form.regions.includes(id) ? form.regions.filter((r) => r !== id) : [...form.regions, id];
  if (!form.regions.includes(form.region)) form.region = form.regions[0] || 'CN';
}
function checkCompany(): boolean {
  if (!form.name) { steps.fail('company', i18nT('请填写公司名称')); return false; }
  if (!form.regions.length) { steps.fail('company', i18nT('请至少选择一个地区档案')); return false; }
  const p = profiles.value.find((x) => x.id === form.region);
  if (p && !p.standards.includes(form.standard)) form.standard = p.defaultStandard;
  if (p && !props.company && !currencyTouched.value) form.currency = p.currency;
  else if (p && !form.currency) form.currency = p.currency;
  return true;
}
function nextCompany(): void {
  if (checkCompany()) done('company');
}
/** 用默认配置开始：其余五步都用默认值，直接建好公司档案和第一个月结项目，进首页（首页提示还有哪几项是默认值） */
async function quickStart(): Promise<void> {
  if (!checkCompany()) return;
  saving.value = true;
  steps.start('company');
  try {
    const saved = await fau<FauCompany>('company.save', { company: { ...form, signers: [], quickStart: true } });
    await fau('project.create', { type: 'month_close', period: lastMonth() });
    steps.done('company', i18nT('已保存'));
    emit('saved', saved);
  } catch (e) {
    steps.fail('company', e);
  } finally {
    saving.value = false;
  }
}
async function mapAccounts(path: string, mapping?: Record<string, string>, sheet?: string): Promise<void> {
  mapError.value = '';
  try {
    const r = await fau<{ inspect: FauInspectResult; result: typeof mapResult.value }>('company.mapAccounts', { path, mapping, sheet, standard: form.standard, previous: form.accountMap });
    mapInspect.value = r.inspect as any;
    mapResult.value = r.result;
  } catch (e) { mapError.value = errorMessage(e); }
}
function nextStandard(): void {
  if (mapResult.value) {
    form.accountMap = mapResult.value.entries.map((e) => ({ ...e, source: mapResult.value!.autoComplete ? e.source : 'manual' }));
    form.accountMapConfirmed = mapResult.value.entries.every((e) => e.cls);
  }
  done('standard');
}
function setOverride(it: ThresholdItem, raw: string): void {
  if (raw.trim() === '') { delete form.thresholds[it.key]; return; }
  const v = thresholdStore(it, raw);
  if (v != null) form.thresholds[it.key] = v;
}
function addSigner(): void {
  form.signers.push({ id: `sg_${Math.random().toString(36).slice(2, 10)}`, name: '', title: '', levels: ['prepare'] });
}
function toggleLevel(s: FauSigner, l: FauSignLevel): void {
  s.levels = s.levels.includes(l) ? s.levels.filter((x) => x !== l) : [...s.levels, l];
}
function togglePackage(k: FauPackage): void {
  form.packages = form.packages.includes(k) ? form.packages.filter((p) => p !== k) : [...form.packages, k];
}
async function save(): Promise<void> {
  saving.value = true;
  steps.start('packages');
  try {
    const saved = await fau<FauCompany>('company.save', { company: { ...form, signers: form.signers.filter((s) => s.name) } });
    steps.done('packages', i18nT('已保存'));
    emit('saved', saved);
  } catch (e) {
    steps.fail('packages', e);
  } finally {
    saving.value = false;
  }
}
</script>

<style scoped>
.fau-wizard { display: grid; gap: 12px; }
.fau-regions { display: flex; flex-wrap: wrap; gap: 8px; }
.fau-region { display: inline-flex; flex-wrap: wrap; align-items: center; gap: 6px; padding: 6px 10px; border: 1px solid var(--color-border); border-radius: var(--radius-4); font-size: 12.5px; max-width: 360px; }
.fau-tax { flex-basis: 100%; color: var(--color-text-secondary); font-size: 11.5px; }
.fau-region.off { opacity: .6; }
.fau-primary { display: inline-flex; gap: 4px; align-items: center; color: var(--color-text-secondary); font-size: var(--font-size-sm); }
.fau-signer input { height: 32px; border-radius: var(--radius-3); border: 1px solid var(--color-border); background: var(--color-bg-input); color: var(--color-text-primary); padding-inline: 8px; font: inherit; font-size: 12.5px; }
.fau-check { display: inline-flex; gap: 4px; align-items: center; font-size: var(--font-size-sm); }
.fau-quick-hint { margin: 0; font-size: var(--font-size-sm); }
.fau-th-search { height: 32px; min-width: min(100%, 280px); border-radius: var(--radius-3); border: 1px solid var(--color-border); background: var(--color-bg-input); color: var(--color-text-primary); padding-inline: 10px; font: inherit; font-size: 12.5px; }
/* 阈值表跟着整页滚，不要内部固定高度的滚动区（嵌在整页滚动里会让人觉得「滑不动」） */
.fau-th-wrap { max-height: none; }
.fau-th-wrap .fau-table th { position: static; }
.fau-th-group td { background: var(--color-bg-hover); font-weight: 800; font-size: var(--font-size-md); }
.fau-th-mod td { padding: 0; }
.fau-th-toggle { display: flex; align-items: center; gap: 6px; width: 100%; padding: 7px 10px; border: none; background: transparent; color: inherit; font: inherit; font-weight: 700; text-align: start; cursor: pointer; }
.fau-th-toggle:hover { background: var(--color-bg-hover); }
.fau-th-toggle .fau-code { font-weight: 800; color: var(--color-brand); }
.fau-th-input { white-space: nowrap; }
.fau-th-empty { margin: 0; padding: 10px 12px; }
.fau-table input[type="number"] { width: 110px; height: 28px; border-radius: var(--radius-2); border: 1px solid var(--color-border); background: var(--color-bg-input); color: var(--color-text-primary); padding-inline: 6px; }
.fau-table select { height: 28px; border-radius: var(--radius-2); border: 1px solid var(--color-border); background: var(--color-bg-input); color: var(--color-text-primary); }
</style>
