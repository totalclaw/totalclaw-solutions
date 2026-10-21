<template>
  <div class="fau-input fau-tax-params" data-test="fau-tax-params">
    <header>
      <strong>{{ $t('申报参数') }}</strong>
      <span class="fau-badge muted">{{ $t('金额按主单位填写') }}</span>
      <span class="grow"></span>
      <button v-for="k in templateKinds" :key="k" type="button" class="ss-link" :data-test="`fau-tax-template-${k}`" :disabled="busy" @click="template(k)">
        <i class="ri-file-excel-2-line"></i>{{ $t('下载模板：{p0}', { p0: $t(KIND_TITLE[k] || k) }) }}
      </button>
    </header>
    <div class="ss-grid">
      <label v-for="f in fields" :key="f.key" class="ss-field" :class="{ check: f.type === 'bool' }">
        <span>{{ $t(f.label) }}</span>
        <select v-if="f.type === 'select'" v-model="form[f.key]" :disabled="!editable" :data-test="`fau-param-${f.key}`">
          <option v-for="o in f.options" :key="o.value" :value="o.value">{{ $t(o.label) }}</option>
        </select>
        <input v-else-if="f.type === 'bool'" v-model="form[f.key]" type="checkbox" :disabled="!editable" :data-test="`fau-param-${f.key}`" />
        <input v-else v-model.trim="form[f.key]" :inputmode="f.type === 'number' ? 'decimal' : 'text'" dir="ltr" :placeholder="f.placeholder || ''" :disabled="!editable" :data-test="`fau-param-${f.key}`" />
      </label>
    </div>
    <p v-if="hint" class="ss-note info"><i class="ri-information-line"></i>{{ $t(hint) }}</p>
    <div class="ss-actions">
      <button type="button" class="ss-btn sm" :disabled="!editable || busy" data-test="fau-tax-params-save" @click="save"><i class="ri-save-line"></i>{{ $t('保存参数') }}</button>
      <span v-if="saved" class="fau-badge ok">{{ $t('已保存') }}</span>
    </div>
    <p v-if="error" class="ss-note danger"><i class="ri-error-warning-line"></i>{{ error }}</p>
  </div>
</template>

<script setup lang="ts">
/**
 * 税务组（C1–C3）第 ② 步的参数：纳税人类型、留抵、持股比例、经审计分母、受测方数据等。
 * 金额按主单位填写，主进程换成最小货币单位；保存后从第 ③ 步重新校验计算。
 */
import { computed, reactive, ref, watch } from 'vue';
import type { FauModuleDef, FauRun, FauTaxInputKind } from '@totalclaw/ipc-contracts';
import { inputsForMode } from '../../../../../shared/financeAudit/catalog';
import { i18nKey } from '../../../../i18n';
import { errorMessage, fau } from '../../shared';

interface Field { key: string; label: string; type: 'text' | 'number' | 'bool' | 'select'; options?: { value: string; label: string }[]; placeholder?: string; dflt?: unknown }

const props = defineProps<{ run: FauRun; def: FauModuleDef; editable: boolean }>();
const emit = defineEmits<{ (e: 'save', params: Record<string, unknown>): void }>();

const KIND_TITLE: Record<string, string> = {
  vat_lines: i18nKey('销项与进项明细'), iit_rows: i18nKey('工资个税明细'), wht_payments: i18nKey('向非居民付款明细'), temp_diffs: i18nKey('暂时性差异明细'),
  disclosure_events: i18nKey('重大事项与交易清单'), rp_transactions: i18nKey('关联交易明细'), tp_comparables: i18nKey('可比公司财务数据'),
};
const TAX_KINDS = Object.keys(KIND_TITLE);

const PERIOD: Field = { key: 'period', label: i18nKey('税期（不填用项目期间；YYYY-MM / YYYY-Qn / YYYY）'), type: 'text', placeholder: '2026-09' };
const num = (key: string, label: string): Field => ({ key, label, type: 'number' });
const bool = (key: string, label: string): Field => ({ key, label, type: 'bool', dflt: false });

const FIELDS: Record<string, Field[]> = {
  cn: [
    PERIOD,
    { key: 'taxpayerType', label: i18nKey('纳税人类型'), type: 'select', dflt: 'general', options: [{ value: 'general', label: i18nKey('一般纳税人') }, { value: 'small', label: i18nKey('小规模纳税人') }] },
    { key: 'cityTier', label: i18nKey('城市维护建设税档次'), type: 'select', dflt: 'urban', options: [{ value: 'urban', label: i18nKey('市区（7%）') }, { value: 'county', label: i18nKey('县城、镇（5%）') }, { value: 'other', label: i18nKey('其他（1%）') }] },
    bool('smallLowProfit', i18nKey('小型微利企业（享受所得税优惠与六税两费减半）')),
    bool('quarterly', i18nKey('按季申报')),
    num('uninvoicedSales', i18nKey('未开票收入（不含税）')), num('inputTransferOut', i18nKey('进项税额转出')),
    num('carriedCredit', i18nKey('上期留抵税额')), num('citPaidYtd', i18nKey('本年已预缴企业所得税')),
  ],
  sa_vat: [PERIOD, num('carriedCredit', i18nKey('上期留抵税额')), num('priorCorrection', i18nKey('上期更正（补税为正，少报进项为负）'))],
  ae_vat: [PERIOD, num('carriedCredit', i18nKey('上期留抵税额')), num('priorCorrection', i18nKey('上期更正（补税为正，少报进项为负）'))],
  sa_zakat: [
    { ...PERIOD, label: i18nKey('会计年度（YYYY，或年末月份 YYYY-MM）'), placeholder: '2025' },
    { key: 'zakatYearBasis', label: i18nKey('天课年度口径'), type: 'select', dflt: '', options: [{ value: '', label: i18nKey('按公司档案') }, { value: 'gregorian', label: i18nKey('公历年（按天数折算）') }, { value: 'hijri', label: i18nKey('回历年') }] },
    { key: 'saudiShare', label: i18nKey('沙特 / 海湾国家股东持股比例（%）'), type: 'number', placeholder: '100' },
    num('profitAdjust', i18nKey('调整后净利润的调整额（不可扣除项为正）')),
  ],
  sa_wht: [PERIOD],
  ae_cit: [
    { ...PERIOD, label: i18nKey('税期（YYYY，或年末月份 YYYY-MM）'), placeholder: '2025' },
    num('citAdjust', i18nKey('纳税调整（不可扣除为正，免税收入为负）')),
    bool('smallBusinessRelief', i18nKey('选择适用小企业减免')), bool('qualifyingFreeZone', i18nKey('自由区合格主体')),
  ],
  intl: [
    PERIOD, { key: 'vatStandardRate', label: i18nKey('增值税 / 商品服务税标准税率（%）'), type: 'number' },
    { key: 'incomeTaxRate', label: i18nKey('所得税税率（%）'), type: 'number' }, num('taxAdjust', i18nKey('纳税调整（不可扣除为正，免税收入为负）')), num('carriedCredit', i18nKey('上期留抵税额')),
  ],
  disclosure: [
    PERIOD,
    { key: 'regime', label: i18nKey('披露规则'), type: 'select', dflt: '', options: [{ value: '', label: i18nKey('按公司主地区') }, { value: 'cn_sse', label: i18nKey('中国：上交所股票上市规则') }, { value: 'sa_cma', label: i18nKey('沙特：资本市场管理局规则') }, { value: 'intl', label: i18nKey('国际：IAS 24 与重要性') }] },
    num('auditedTotalAssets', i18nKey('最近一期经审计总资产')), num('auditedNetAssets', i18nKey('最近一期经审计净资产')),
    num('auditedRevenue', i18nKey('最近一个会计年度经审计营业收入')), num('auditedNetProfit', i18nKey('最近一个会计年度经审计净利润')),
  ],
  local_file: [],
  benchmark: [],
};
const TP: Field[] = [
  PERIOD,
  { key: 'tpJurisdiction', label: i18nKey('按哪个地区的规定判断'), type: 'select', dflt: '', options: [{ value: '', label: i18nKey('按公司主地区') }, { value: 'CN', label: i18nKey('中国') }, { value: 'SA', label: i18nKey('沙特') }, { value: 'AE', label: i18nKey('阿联酋') }, { value: 'INTL', label: i18nKey('国际') }] },
  { key: 'pli', label: i18nKey('利润水平指标'), type: 'select', dflt: 'ncp', options: [{ value: 'ncp', label: i18nKey('完全成本加成率') }, { value: 'om', label: i18nKey('营业利润率') }] },
  num('testedRevenue', i18nKey('受测方营业收入')), num('testedOperatingProfit', i18nKey('受测方营业利润')), num('testedTotalCost', i18nKey('受测方总成本')),
];
const TP_DOCS: Field[] = [
  num('groupRevenue', i18nKey('集团合并收入')), bool('groupHasMasterFile', i18nKey('集团已准备主体文档')),
  bool('hasDisclosure', i18nKey('已准备关联交易披露表')), bool('hasMasterFile', i18nKey('已准备主体文档')), bool('hasLocalFile', i18nKey('已准备本地文档')), bool('hasCbcr', i18nKey('已准备国别报告')),
  num('intlCbcrThreshold', i18nKey('国际口径国别报告门槛（按本位币）')),
];
FIELDS.local_file = [...TP, ...TP_DOCS];
FIELDS.benchmark = TP;

const HINT: Record<string, string> = {
  cn: i18nKey('中国口径直接调用财务智能体的计算，结果与它逐项相同；申报代填请到财务智能体「申报上报」，由人提交。'),
  sa_zakat: i18nKey('天课基数按年末余额表逐行归类，计算结果为草稿口径，需当地专业人士复核。'),
  ae_cit: i18nKey('应纳税所得额 375,000 迪拉姆以内按 0%，超过部分按 9%；结果为草稿口径，需当地专业人士复核。'),
  disclosure: i18nKey('分母请填最近一期经审计的数字；不填时用上传的余额表计算。'),
};

const fields = computed(() => FIELDS[props.run.modeId] || []);
const hint = computed(() => HINT[props.run.modeId] || '');
const templateKinds = computed(() => [...new Set(inputsForMode(props.def, props.run.modeId).map((i) => i.kind).filter((k) => TAX_KINDS.includes(k)))] as FauTaxInputKind[]);
const form = reactive<Record<string, unknown>>({});
const busy = ref(false);
const saved = ref(false);
const error = ref('');

function load(): void {
  for (const k of Object.keys(form)) delete form[k];
  for (const f of fields.value) {
    const v = props.run.params[f.key];
    form[f.key] = v === undefined ? (f.dflt ?? '') : (f.key === 'saudiShare' && typeof v === 'number' && v <= 1 ? v * 100 : v);
  }
}
watch(() => [props.run.id, props.run.modeId, props.run.updatedAt], load, { immediate: true });

function save(): void {
  const out: Record<string, unknown> = {};
  for (const f of fields.value) {
    const v = form[f.key];
    // 清空的字段也传（空串），覆盖掉上次保存的值
    if (f.type === 'number') {
      const n = Number(String(v ?? '').replace(/[,\s%]/g, ''));
      out[f.key] = String(v ?? '').trim() !== '' && Number.isFinite(n) ? n : '';
    } else if (f.type === 'bool') out[f.key] = !!v;
    else out[f.key] = String(v ?? '').trim();
  }
  emit('save', out);
  saved.value = true;
  setTimeout(() => { saved.value = false; }, 2000);
}

async function template(kind: FauTaxInputKind): Promise<void> {
  busy.value = true; error.value = '';
  try {
    const r = await fau<{ path: string }>('tax.template', { kind, locale: props.run.outputLocale });
    await fau('artifact.reveal', { path: r.path });
  } catch (e) { error.value = errorMessage(e); } finally { busy.value = false; }
}
</script>

<style scoped>
.fau-tax-params .ss-field.check { flex-direction: row; align-items: center; gap: 8px; }
.fau-tax-params .ss-link { display: inline-flex; align-items: center; gap: 4px; }
</style>
