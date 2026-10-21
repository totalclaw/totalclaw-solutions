<template>
  <div class="fau-tax" data-test="fau-tax-panel">
    <p v-if="draftBasis" class="ss-note warn" data-test="fau-draft-basis"><i class="ri-error-warning-line"></i>{{ $t('草稿口径，需当地专业人士复核') }}</p>
    <p class="ss-note info"><i class="ri-shield-check-line"></i>{{ $t('只出申报底稿，不提交申报：中国由人在电子税务局提交（代填可去财务智能体），沙特由人在 ZATCA 平台提交，阿联酋由人在 FTA 平台提交。') }}</p>

    <!-- C1 纳税申报准备 -->
    <template v-if="tax">
      <div v-if="tax.mode === 'cn'" class="ss-actions">
        <button type="button" class="ss-btn sm" data-test="fau-go-finance-agent" @click="router.push('/workbenches/finance-agent')"><i class="ri-external-link-line fau-dir-icon"></i>{{ $t('申报代填去财务智能体「申报上报」（由人提交）') }}</button>
      </div>
      <section v-for="s in tax.sections" :key="s.id" class="fau-sec" :data-test="`fau-tax-sec-${s.id}`">
        <header class="fau-row">
          <strong class="grow">{{ msg(s.title) }} <small class="ss-muted"><FauNum :value="s.currency" /></small></strong>
          <span class="fau-badge" :class="s.payable >= 0 ? 'warn' : 'ok'">{{ $t('本节应缴') }} <FauNum :cents="s.payable" /></span>
        </header>
        <div class="fau-table-wrap">
          <table class="fau-table">
            <thead><tr><th>{{ $t('项目') }}</th><th class="num">{{ $t('计税基数') }}</th><th class="num">{{ $t('税率') }}</th><th class="num">{{ $t('税额') }}</th><th>{{ $t('计算过程') }}</th></tr></thead>
            <tbody>
              <tr v-for="l in s.lines" :key="l.id" :data-test="`fau-tax-line-${s.id}-${l.id}`">
                <td class="wrap">{{ msg(l.label) }}<small v-if="l.rows?.length" class="ss-muted"><br>{{ $t('来源行') }} <FauNum :value="rowsText(l.rows)" /></small></td>
                <td class="num"><FauNum v-if="l.base != null" :cents="l.base" /></td>
                <td class="num"><FauNum v-if="l.rate != null" :ratio="l.rate" /></td>
                <td class="num"><FauNum v-if="l.tax != null" :cents="l.tax" /></td>
                <td class="wrap"><FauNum v-if="l.formula" :value="l.formula" /></td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section v-if="tax.zakat" class="fau-sec" data-test="fau-zakat">
        <header class="fau-row">
          <strong class="grow">{{ $t('天课基数') }}</strong>
          <span class="fau-badge">{{ tax.zakat.yearBasis === 'hijri' ? $t('天课率（回历年）') : $t('天课率（公历年按天数折算）') }} <FauNum :value="rateText(tax.zakat.rate)" /></span>
          <span v-if="tax.zakat.floorApplied" class="fau-badge warn">{{ $t('按调整后净利润（下限）') }}</span>
        </header>
        <div class="fau-table-wrap">
          <table class="fau-table">
            <thead><tr><th>{{ $t('行号') }}</th><th>{{ $t('科目') }}</th><th>{{ $t('类别') }}</th><th class="num">{{ $t('金额') }}</th></tr></thead>
            <tbody>
              <tr v-for="i in tax.zakat.items" :key="i.row" :class="{ warn: i.category === 'none' }" :data-test="`fau-zakat-${i.row}`">
                <td><FauNum :value="i.row" /></td>
                <td><FauNum :value="i.accountCode" /> {{ i.accountName }}</td>
                <td>
                  <select :value="zakatMap[i.accountCode || i.accountName] || i.category" :disabled="!editable || busy" @change="zakatMap[i.accountCode || i.accountName] = ($event.target as HTMLSelectElement).value">
                    <option v-for="c in ZAKAT_CATEGORIES" :key="c" :value="c">{{ $t(ZAKAT_LABEL[c]) }}</option>
                  </select>
                  <span v-if="i.source === 'manual'" class="fau-badge muted">{{ $t('人工') }}</span>
                </td>
                <td class="num"><FauNum :cents="i.amount" /></td>
              </tr>
            </tbody>
          </table>
        </div>
        <dl class="fau-kv">
          <dt>{{ $t('加项合计') }}</dt><dd><FauNum :cents="tax.zakat.additions" /></dd>
          <dt>{{ $t('减项合计') }}</dt><dd><FauNum :cents="tax.zakat.deductions" /></dd>
          <dt>{{ $t('调整后净利润（基数下限）') }}</dt><dd><FauNum :cents="tax.zakat.adjustedProfit" /></dd>
          <dt>{{ $t('天课基数') }}</dt><dd><FauNum :cents="tax.zakat.base" /></dd>
          <dt>{{ $t('应缴天课') }}</dt><dd data-test="fau-zakat-due"><FauNum :cents="tax.zakat.zakatDue" /></dd>
        </dl>
        <div v-if="editable" class="ss-actions">
          <button type="button" class="ss-btn sm" :disabled="busy || !Object.keys(zakatMap).length" data-test="fau-zakat-rerun" @click="rerunZakat"><i class="ri-refresh-line"></i>{{ $t('按新归类重算') }}</button>
        </div>
      </section>

      <section v-if="tax.calendar.length" class="fau-sec" data-test="fau-tax-calendar">
        <strong>{{ $t('申报日历') }}</strong>
        <div class="fau-table-wrap">
          <table class="fau-table">
            <thead><tr><th>{{ $t('事项') }}</th><th>{{ $t('期间') }}</th><th>{{ $t('截止日') }}</th><th v-if="tax.region === 'SA'">{{ $t('截止日（回历）') }}</th></tr></thead>
            <tbody>
              <tr v-for="c in tax.calendar" :key="c.id">
                <td>{{ msg(c.label) }}</td><td><FauNum :value="c.period" /></td><td><FauNum :value="c.due" /></td>
                <td v-if="tax.region === 'SA'"><FauNum :value="hijri(c.due)" /></td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
      <FindingList :findings="tax.findings" />
      <RuleSources :rules="tax.rules" :open="draftBasis" />
    </template>

    <!-- C2 监管报送与信息披露 -->
    <template v-if="reg">
      <div class="fau-row">
        <span v-for="l in LEVELS" :key="l" class="fau-badge" :class="l === 'none' ? 'muted' : 'warn'" :data-test="`fau-disclosure-count-${l}`">{{ $t(LEVEL_LABEL[l]) }} <FauNum :value="reg.counts[l] || 0" /></span>
      </div>
      <dl class="fau-kv">
        <dt>{{ $t('总资产') }}</dt><dd><FauNum :cents="reg.base.totalAssets" /></dd>
        <dt>{{ $t('净资产') }}</dt><dd><FauNum :cents="reg.base.netAssets" /></dd>
        <dt>{{ $t('营业收入') }}</dt><dd><FauNum :cents="reg.base.revenue" /></dd>
        <dt>{{ $t('净利润') }}</dt><dd><FauNum :cents="reg.base.netProfit" /></dd>
      </dl>
      <div class="fau-table-wrap">
        <table class="fau-table">
          <thead><tr><th>{{ $t('日期') }}</th><th>{{ $t('类型') }}</th><th>{{ $t('事项说明') }}</th><th class="num">{{ $t('金额') }}</th><th>{{ $t('结论') }}</th><th>{{ $t('达到的标准') }}</th><th>{{ $t('披露草稿') }}</th></tr></thead>
          <tbody>
            <tr v-for="i in reg.items" :key="i.id" :class="{ warn: i.level === 'disclose', bad: i.level === 'shareholder' }" :data-test="`fau-disclosure-${i.row}`">
              <td><FauNum :value="i.date" /></td>
              <td>{{ $t(EVENT_LABEL[i.type] || EVENT_LABEL.other) }}</td>
              <td class="wrap">{{ i.description }}<small v-if="i.counterparty" class="ss-muted"><br>{{ i.counterparty }}</small></td>
              <td class="num"><FauNum :cents="i.amount" /></td>
              <td>{{ $t(LEVEL_LABEL[i.level]) }}</td>
              <td class="wrap"><div v-for="x in i.tests.filter((t) => t.hit)" :key="x.id">{{ msg(x.label) }}<template v-if="x.ratio != null"> <FauNum :ratio="x.ratio" /></template></div></td>
              <td class="wrap">
                <template v-if="i.draft">{{ i.draft }}<br><span class="fau-badge" :class="i.draftStatus === 'verified' ? 'ok' : 'bad'">{{ i.draftStatus === 'verified' ? $t('已核实') : $t('未核实') }}</span></template>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <FindingList :findings="reg.dataChecks" />
      <RuleSources v-if="reg.rules.length" :rules="reg.rules" :open="draftBasis" />
    </template>

    <!-- C3 转让定价 -->
    <template v-if="tp">
      <section class="fau-sec" data-test="fau-tp-range">
        <header class="fau-row">
          <strong class="grow">{{ $t(PLI_LABEL[tp.pli]) }}</strong>
          <span class="fau-badge" :class="tp.position === 'below' ? 'bad' : tp.position === 'within' ? 'ok' : 'warn'" data-test="fau-tp-position">{{ $t(POSITION_LABEL[tp.position]) }}</span>
        </header>
        <dl class="fau-kv">
          <dt>{{ $t('受测方') }}</dt><dd><FauNum :ratio="tp.tested.pli" /></dd>
          <template v-if="tp.range">
            <dt>{{ $t('可比公司家数') }}</dt><dd><FauNum :value="tp.range.n" /></dd>
            <dt>{{ $t('下四分位') }}</dt><dd data-test="fau-tp-q1"><FauNum :value="pct4(tp.range.q1)" /></dd>
            <dt>{{ $t('中位值') }}</dt><dd data-test="fau-tp-median"><FauNum :value="pct4(tp.range.median)" /></dd>
            <dt>{{ $t('上四分位') }}</dt><dd data-test="fau-tp-q3"><FauNum :value="pct4(tp.range.q3)" /></dd>
          </template>
          <template v-if="tp.adjustment"><dt>{{ $t('调整到中位值需增加的营业利润') }}</dt><dd><FauNum :cents="tp.adjustment.amount" /></dd></template>
        </dl>
        <div class="fau-table-wrap">
          <table class="fau-table">
            <thead><tr><th>{{ $t('可比公司') }}</th><th>{{ $t('年度') }}</th><th class="num">{{ $t(PLI_LABEL[tp.pli]) }}</th><th>{{ $t('参与计算') }}</th></tr></thead>
            <tbody>
              <tr v-for="c in tp.comparables" :key="c.row" :class="{ warn: !c.included }">
                <td>{{ c.name }}</td><td><FauNum :value="c.year" /></td><td class="num"><FauNum :ratio="c.pli" /></td>
                <td>{{ c.included ? '✓' : msg(c.reason) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
      <section v-if="tp.rpt.length || tp.docs.length" class="fau-sec" data-test="fau-tp-docs">
        <div v-if="tp.rpt.length" class="fau-table-wrap">
          <table class="fau-table">
            <thead><tr><th>{{ $t('交易类型') }}</th><th class="num">{{ $t('笔数') }}</th><th class="num">{{ $t('金额') }}</th></tr></thead>
            <tbody><tr v-for="g in tp.rpt" :key="g.type"><td>{{ $t(RPT_LABEL[g.type]) }}</td><td class="num"><FauNum :value="g.count" /></td><td class="num"><FauNum :cents="g.amount" /></td></tr></tbody>
          </table>
        </div>
        <div v-if="tp.docs.length" class="fau-table-wrap">
          <table class="fau-table">
            <thead><tr><th>{{ $t('文档') }}</th><th>{{ $t('须准备') }}</th><th>{{ $t('依据') }}</th><th>{{ $t('已准备') }}</th></tr></thead>
            <tbody>
              <tr v-for="d in tp.docs" :key="d.id" :class="{ bad: d.required && !d.prepared }" :data-test="`fau-tp-doc-${d.id}`">
                <td>{{ $t(DOC_LABEL[d.id]) }}</td><td>{{ d.required ? '✓' : '—' }}</td><td class="wrap">{{ msg(d.reason) }}</td><td>{{ d.prepared ? '✓' : '—' }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
      <section v-for="n in tp.narrative" :key="n.id" class="fau-sec">
        <strong>{{ msg(n.heading) }} <span class="fau-badge" :class="n.status === 'verified' ? 'ok' : 'bad'">{{ n.status === 'verified' ? $t('已核实') : $t('未核实') }}</span></strong>
        <p class="fau-narr">{{ n.text }}</p>
      </section>
      <FindingList :findings="tp.findings" />
      <RuleSources v-if="tp.rules.length" :rules="tp.rules" :open="draftBasis" />
    </template>
    <p v-if="error" class="ss-note danger"><i class="ri-error-warning-line"></i>{{ error }}</p>
  </div>
</template>

<script setup lang="ts">
/** 税务组（C1–C3）第 ④ 步结果：申报底稿各节、天课基数（可改归类重算）、申报日历（沙特附回历）、披露判断、四分位与文档要求、规则与出处 */
import { computed, reactive, ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import type { FauDisclosureLevel, FauModuleDef, FauRegulatoryResult, FauRun, FauTaxResult, FauTpResult, FauZakatCategory } from '@totalclaw/ipc-contracts';
import { FAU_DISCLOSURE_LEVELS, FAU_ZAKAT_CATEGORIES } from '@totalclaw/ipc-contracts';
import { i18nKey } from '../../../../i18n';
import FauNum from '../../FauNum.vue';
import { errorMessage, fau, msg } from '../../shared';
import FindingList from './FindingList.vue';
import RuleSources from './RuleSources.vue';

const props = defineProps<{ run: FauRun; def: FauModuleDef; editable: boolean }>();
const emit = defineEmits<{ (e: 'changed'): void }>();
const router = useRouter();

const tax = computed(() => (props.def.id === 'tax' ? (props.run.result as FauTaxResult) : null));
const reg = computed(() => (props.def.id === 'regulatory' ? (props.run.result as FauRegulatoryResult) : null));
const tp = computed(() => (props.def.id === 'transfer-pricing' ? (props.run.result as FauTpResult) : null));
const draftBasis = computed(() => !!(tax.value?.draftBasis || reg.value?.draftBasis || tp.value?.draftBasis));

const ZAKAT_CATEGORIES = FAU_ZAKAT_CATEGORIES;
const LEVELS = FAU_DISCLOSURE_LEVELS;
const ZAKAT_LABEL: Record<FauZakatCategory, string> = {
  add_equity: i18nKey('加项：权益'), add_provision: i18nKey('加项：准备'), add_liability: i18nKey('加项：非流动负债'),
  deduct_fixed: i18nKey('减项：固定资产净值'), deduct_investment: i18nKey('减项：长期投资'), deduct_intangible: i18nKey('减项：无形资产'),
  deduct_other: i18nKey('减项：其他'), none: i18nKey('不计入'),
};
const LEVEL_LABEL: Record<FauDisclosureLevel, string> = { shareholder: i18nKey('提交股东大会并披露'), disclose: i18nKey('及时披露'), notes: i18nKey('在报表附注披露'), none: i18nKey('暂不需要披露') };
const EVENT_LABEL: Record<string, string> = { transaction: i18nKey('交易'), related_party: i18nKey('关联交易'), guarantee: i18nKey('担保'), litigation: i18nKey('诉讼 / 仲裁'), impairment: i18nKey('减值'), other: i18nKey('其他') };
const PLI_LABEL: Record<string, string> = { ncp: i18nKey('完全成本加成率'), om: i18nKey('营业利润率') };
const POSITION_LABEL: Record<string, string> = { below: i18nKey('低于下四分位'), within: i18nKey('在四分位区间内'), above: i18nKey('高于上四分位'), na: i18nKey('无法判断') };
const RPT_LABEL: Record<string, string> = {
  tangible: i18nKey('有形资产'), intangible_transfer: i18nKey('无形资产所有权转让'), intangible_license: i18nKey('无形资产使用权许可'),
  service: i18nKey('劳务'), financing: i18nKey('资金融通'), financial_asset: i18nKey('金融资产转让'), other: i18nKey('其他'),
};
const DOC_LABEL: Record<string, string> = { disclosure: i18nKey('关联交易披露表'), master: i18nKey('主体文档'), local: i18nKey('本地文档'), cbcr: i18nKey('国别报告') };

const zakatMap = reactive<Record<string, string>>({});
const busy = ref(false);
const error = ref('');
watch(() => props.run.id, () => { for (const k of Object.keys(zakatMap)) delete zakatMap[k]; });

const rowsText = (rows: number[]) => (rows.length > 12 ? `${rows.slice(0, 12).join(',')} …` : rows.join(','));
const rateText = (r: number) => `${Math.round(r * 1e6) / 1e4}%`;
const pct4 = (v: number) => `${Math.round(v * 1e6) / 1e4}%`;
/** 回历日期（乌姆古拉历），沙特档案下作附加列；西方阿拉伯数字 */
function hijri(iso: string): string {
  try {
    return new Intl.DateTimeFormat('en-u-ca-islamic-umalqura-nu-latn', { year: 'numeric', month: '2-digit', day: '2-digit', timeZone: 'UTC' }).format(new Date(`${iso}T00:00:00Z`));
  } catch { return ''; }
}

async function rerunZakat(): Promise<void> {
  busy.value = true; error.value = '';
  try {
    const prev = (props.run.params.zakatMap || {}) as Record<string, string>;
    await fau('run.setInputs', { runId: props.run.id, inputs: props.run.inputs, params: { zakatMap: { ...prev, ...zakatMap } } });
    await fau('run.start', { runId: props.run.id, fromStep: 'validate' });
    emit('changed');
  } catch (e) { error.value = errorMessage(e); } finally { busy.value = false; }
}
</script>

<style scoped>
.fau-tax { display: grid; gap: 10px; }
.fau-sec { border: 1px solid var(--color-border); border-radius: 12px; padding: 10px 12px; display: grid; gap: 8px; background: var(--color-bg-card); }
.fau-narr { margin: 0; white-space: pre-wrap; line-height: 1.6; font-size: 12.5px; }
.fau-tax select { height: 28px; border-radius: 8px; border: 1px solid var(--color-border); background: var(--color-bg-input, var(--color-bg-primary)); color: var(--color-text-primary); font: inherit; font-size: 12px; }
</style>
