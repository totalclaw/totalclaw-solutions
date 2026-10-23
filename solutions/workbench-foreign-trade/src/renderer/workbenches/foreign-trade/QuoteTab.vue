<template>
  <div class="ss-module">
    <ModuleHeader :meta="meta" />

    <!-- 产品目录 -->
    <section class="ss-panel">
      <header>
        <strong><i class="ri-archive-drawer-line"></i> {{ $t('产品目录') }}</strong>
        <span class="ss-muted">{{ $t('共 {n} 个产品。报价只用目录里的成本价计算。', { n: products.length }) }}</span>
        <span class="grow"></span>
        <button type="button" class="ss-btn sm" :disabled="importing" @click="importProducts"><i :class="importing ? 'ri-loader-4-line spin' : 'ri-file-upload-line'"></i>{{ $t('从 Excel 导入') }}</button>
        <button type="button" class="ss-btn sm ghost" @click="showCatalog = !showCatalog"><i class="ri-list-check"></i>{{ showCatalog ? $t('收起') : $t('查看') }}</button>
      </header>
      <p v-if="importInfo" class="ss-note ok"><i class="ri-check-line"></i>{{ importInfo }}</p>
      <div v-if="showCatalog && products.length" class="ss-table-wrap ft-scroll">
        <table class="ss-table">
          <thead><tr><th>{{ $t('型号') }}</th><th>{{ $t('品名') }}</th><th>{{ $t('规格') }}</th><th class="num">{{ $t('成本价') }}</th><th class="num">{{ $t('起订量') }}</th><th class="num">{{ $t('装箱数') }}</th><th class="num">{{ $t('箱体积') }}</th><th class="num">{{ $t('单件净重') }}</th><th>{{ $t('HS 编码') }}</th><th></th></tr></thead>
          <tbody>
            <template v-for="p in products" :key="p.id">
              <tr :data-test="`ft-product-${p.model}`">
                <td>{{ p.model }}</td><td>{{ p.name }}</td><td>{{ p.spec || '—' }}</td><td class="num">{{ fmtMoney(p.unitCost) }}</td>
                <td class="num">{{ p.moq ?? '—' }}</td><td class="num">{{ p.pcsPerCarton ?? '—' }}</td><td class="num">{{ p.cartonCbm ?? '—' }}</td><td class="num">{{ p.unitNetKg ?? '—' }}</td>
                <td>
                  <span v-if="p.hsConfirmed" class="ss-chip ok" :title="$t('{p0} 于 {p1} 确认', { p0: p.hsConfirmed.by, p1: fmtDateTime(p.hsConfirmed.at) })" data-test="ft-hs-confirmed"><i class="ri-check-line"></i>{{ p.hsConfirmed.code }}</span>
                  <button type="button" class="ss-link" data-test="ft-hs-open" @click="hsOpen = hsOpen === p.id ? '' : p.id">{{ p.hsConfirmed ? $t('改') : p.hsSuggestions?.length ? $t('{n} 个候选，待确认', { n: p.hsSuggestions.length }) : $t('找编码') }}</button>
                </td>
                <td><button type="button" class="ss-btn sm ghost danger" @click="removeProduct(p.id)"><i class="ri-delete-bin-line"></i></button></td>
              </tr>
              <tr v-if="hsOpen === p.id" class="ft-hs-row">
                <td colspan="10">
                  <div class="ft-hs" data-test="ft-hs-panel">
                    <p class="ss-muted">{{ $t('先在本地 HS2022 编码表里按关键词检索，再由模型从候选里排序并写理由；编码由你确认后才会写进 PI / CI。') }}</p>
                    <div class="ss-actions">
                      <button type="button" class="ss-btn sm primary" :disabled="hsBusy === p.id" @click="hsSuggest(p.id, true)"><i :class="hsBusy === p.id ? 'ri-loader-4-line spin' : 'ri-search-line'"></i>{{ $t('检索并让模型排序') }}</button>
                      <button type="button" class="ss-btn sm" :disabled="hsBusy === p.id" data-test="ft-hs-local" @click="hsSuggest(p.id, false)"><i class="ri-search-line"></i>{{ $t('只做本地检索') }}</button>
                      <span v-if="p.hsModel" class="ss-muted">{{ $t('由 {p0} 排序', { p0: modelLabel(p.hsModel) }) }}</span>
                      <span class="grow"></span>
                      <input v-model="hsManual[p.id]" type="text" class="ft-hs-input" :placeholder="$t('手填 6～10 位编码')" />
                      <button type="button" class="ss-btn sm" :disabled="!hsManual[p.id]" @click="hsConfirm(p.id, hsManual[p.id])"><i class="ri-check-line"></i>{{ $t('确认这个编码') }}</button>
                      <button v-if="p.hsConfirmed" type="button" class="ss-btn sm ghost danger" @click="hsClear(p.id)">{{ $t('撤销确认') }}</button>
                    </div>
                    <p v-if="hsError[p.id]" class="ss-note danger"><i class="ri-error-warning-line"></i>{{ hsError[p.id] }}</p>
                    <ol v-if="p.hsSuggestions?.length" class="ft-hs-list">
                      <li v-for="c in p.hsSuggestions" :key="c.code" :data-test="`ft-hs-cand-${c.code}`">
                        <div class="ft-hs-list__head">
                          <code>{{ c.code }}</code>
                          <span class="ss-muted">{{ $t('匹配度 {p0}', { p0: Math.round(c.score * 100) + '%' }) }}</span>
                          <span class="grow"></span>
                          <span v-if="p.hsConfirmed?.code === c.code" class="ss-chip ok">{{ $t('已确认') }}</span>
                          <button v-else type="button" class="ss-btn sm" @click="hsConfirm(p.id, c.code)"><i class="ri-check-line"></i>{{ $t('确认') }}</button>
                        </div>
                        <div class="ft-hs-list__desc">{{ c.description }}</div>
                        <div v-if="c.reason" class="ft-hs-list__reason"><i class="ri-lightbulb-line"></i>{{ c.reason }}</div>
                      </li>
                    </ol>
                  </div>
                </td>
              </tr>
            </template>
          </tbody>
        </table>
      </div>
      <p v-else-if="!products.length" class="ss-empty">{{ $t('还没有产品目录。导入含「型号 / 品名 / 出厂价」列的 Excel，可选「装箱数 / 箱体积」用于计算海运费。') }}</p>
    </section>

    <!-- 报价规则 -->
    <section v-if="rules" class="ss-rules">
      <h4><i class="ri-scales-3-line"></i>{{ $t('报价规则') }}
        <button type="button" class="ss-link" :disabled="fxBusy" @click="showFx">{{ $t('查看当前汇率') }}</button>
      </h4>
      <div class="ss-rule-row">
        <span class="lbl">{{ $t('成本币种') }}</span><input v-model="rulesDraft.baseCurrency" type="text" />
        <span class="lbl">{{ $t('报价币种') }}</span><input v-model="rulesDraft.quoteCurrency" type="text" />
        <span class="lbl">{{ $t('汇率来源') }}</span>
        <select v-model="rulesDraft.rateSource"><option value="manual">{{ $t('手填') }}</option><option value="live">{{ $t('实时') }}</option></select>
        <template v-if="rulesDraft.rateSource === 'manual'"><span class="lbl">{{ $t('1 报价币种 =') }}</span><input v-model.number="rulesDraft.manualRate" type="number" step="0.0001" /><span class="lbl">{{ rulesDraft.baseCurrency }}</span></template>
      </div>
      <div class="ss-rule-row">
        <span class="lbl">{{ $t('包装 %') }}</span><input v-model.number="rulesDraft.packagingPct" type="number" step="0.1" />
        <span class="lbl">{{ $t('国内运输（每票）') }}</span><input v-model.number="rulesDraft.inlandFreight" type="number" />
        <span class="lbl">{{ $t('海运（每立方，报价币种）') }}</span><input v-model.number="rulesDraft.oceanFreightPerCbm" type="number" />
        <span class="lbl">{{ $t('保险 %') }}</span><input v-model.number="rulesDraft.insurancePct" type="number" step="0.01" />
      </div>
      <div class="ss-rule-row">
        <span class="lbl">{{ $t('目标毛利 %') }}</span><input v-model.number="rulesDraft.marginPct" type="number" step="0.5" />
        <span class="lbl">{{ $t('默认贸易术语') }}</span>
        <select v-model="rulesDraft.defaultIncoterm"><option v-for="t in INCOTERMS" :key="t" :value="t">{{ t }}</option></select>
        <span class="lbl">{{ $t('报价有效期（天）') }}</span><input v-model.number="rulesDraft.validityDays" type="number" />
        <span class="grow"></span>
        <button type="button" class="ss-btn sm primary" :disabled="!rulesDirty" @click="saveRules"><i class="ri-save-line"></i>{{ $t('保存规则') }}</button>
      </div>
      <p v-if="fxInfo" class="ss-note info"><i class="ri-exchange-line"></i>{{ $t('1 {c} = {r} {b}（{s}，{t}）', { c: rules.quoteCurrency, r: fxInfo.rate, b: rules.baseCurrency, s: fxInfo.source, t: fxInfo.asOf }) }}</p>
    </section>

    <!-- 已有报价 -->
    <section v-if="quotes.length" class="ss-panel">
      <header><strong><i class="ri-file-list-2-line"></i> {{ $t('报价单') }}</strong><span class="grow"></span><button type="button" class="ss-btn sm" @click="newQuote"><i class="ri-add-line"></i>{{ $t('新建报价') }}</button></header>
      <div class="ss-table-wrap ft-scroll">
        <table class="ss-table">
          <thead><tr><th>{{ $t('客户') }}</th><th>{{ $t('日期') }}</th><th>{{ $t('贸易术语') }}</th><th class="num">{{ $t('总额') }}</th><th>{{ $t('状态') }}</th><th></th></tr></thead>
          <tbody>
            <tr v-for="q in quotes" :key="q.id" :class="{ 'ft-active': q.id === quoteId }">
              <td>{{ q.customerName || q.customerEmail || '—' }}</td><td>{{ fmtDate(q.createdAt) }}</td><td>{{ q.incoterm }}</td>
              <td class="num">{{ fmtMoney(q.total) }} {{ q.currency }}</td>
              <td><span class="ss-chip" :class="q.status === 'sent' ? 'ok' : q.status === 'approved' ? 'brand' : 'warn'">{{ quoteStatusLabel(q.status) }}</span></td>
              <td class="ft-row-actions">
                <button type="button" class="ss-btn sm ghost" @click="openQuote(q)"><i class="ri-folder-open-line"></i>{{ $t('打开') }}</button>
                <button type="button" class="ss-btn sm ghost danger" @click="removeQuote(q.id)"><i class="ri-delete-bin-line"></i></button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <StickyProgress :title="$t('报价')" :metas="metas" :runtime="runtime" :current-key="currentKey" @jump="scrollTo" />
    <div class="ss-steps">
      <StepCard step-key="pick" :index="0" :title="metas[0].title" :hint="metas[0].hint" :runtime="runtime.pick">
        <div class="ss-grid">
          <label class="ss-field"><span>{{ $t('询盘') }}</span>
            <select v-model="inquiryId">
              <option value="">{{ $t('不关联询盘（手动添加产品）') }}</option>
              <option v-for="q in quotableInquiries" :key="q.id" :value="q.id">{{ (q.company || q.customerName) + ' · ' + (q.subject || '') }}</option>
            </select>
          </label>
          <label class="ss-field"><span>{{ $t('客户名称') }}</span><input v-model="customerName" type="text" /></label>
          <label class="ss-field"><span>{{ $t('客户邮箱') }}</span><input v-model="customerEmail" type="text" /></label>
        </div>
        <div v-if="currentInquiry?.items.length" class="ss-table-wrap">
          <table class="ss-table">
            <thead><tr><th>{{ $t('产品') }}</th><th>{{ $t('型号') }}</th><th>{{ $t('规格') }}</th><th class="num">{{ $t('数量') }}</th></tr></thead>
            <tbody><tr v-for="(it, i) in currentInquiry.items" :key="i"><td>{{ it.product }}</td><td>{{ it.model || '—' }}</td><td>{{ it.spec || '—' }}</td><td class="num">{{ it.quantity || '—' }} {{ it.unit || '' }}</td></tr></tbody>
          </table>
        </div>
      </StepCard>

      <StepCard step-key="match" :index="1" :title="metas[1].title" :hint="metas[1].hint" :runtime="runtime.match">
        <div class="ss-actions">
          <button type="button" class="ss-btn primary" :disabled="busy === 'match' || !inquiryId" @click="match"><i :class="busy === 'match' ? 'ri-loader-4-line spin' : 'ri-links-line'"></i>{{ $t('按询盘匹配产品') }}</button>
          <button type="button" class="ss-btn" @click="addLine"><i class="ri-add-line"></i>{{ $t('手动添加一行') }}</button>
          <span v-if="matchModel" class="ss-muted">{{ $t('由 {p0} 匹配', { p0: modelLabel(matchModel) }) }}</span>
        </div>
        <div v-if="lines.length" class="ss-table-wrap">
          <table class="ss-table">
            <thead><tr><th>{{ $t('客户要的') }}</th><th>{{ $t('目录产品') }}</th><th>{{ $t('型号') }}</th><th>{{ $t('品名') }}</th><th class="num">{{ $t('数量') }}</th><th class="num">{{ $t('成本价') }}</th><th>{{ $t('匹配') }}</th><th></th></tr></thead>
            <tbody>
              <tr v-for="(l, i) in lines" :key="i">
                <td class="ft-wrap"><input v-model="l.requested" type="text" /><div v-if="l.note" class="ss-muted">{{ l.note }}</div></td>
                <td>
                  <select :value="l.productId || ''" @change="pickProduct(l, ($event.target as HTMLSelectElement).value)">
                    <option value="">{{ $t('（不在目录）') }}</option>
                    <option v-for="p in products" :key="p.id" :value="p.id">{{ p.model }} · {{ p.name }}</option>
                  </select>
                </td>
                <td><input v-model="l.model" type="text" /></td>
                <td><input v-model="l.name" type="text" /></td>
                <td class="num"><input v-model.number="l.quantity" type="number" /></td>
                <td class="num"><input v-model.number="l.unitCost" type="number" step="0.01" /></td>
                <td><span class="ss-chip" :class="l.match === 'exact' ? 'ok' : l.match === 'partial' ? 'warn' : 'bad'">{{ matchLabel(l.match) }}</span></td>
                <td><button type="button" class="ss-btn sm ghost danger" @click="lines.splice(i, 1)"><i class="ri-delete-bin-line"></i></button></td>
              </tr>
            </tbody>
          </table>
        </div>
      </StepCard>

      <StepCard step-key="calc" :index="2" :title="metas[2].title" :hint="metas[2].hint" :runtime="runtime.calc">
        <div class="ss-grid">
          <label class="ss-field"><span>{{ $t('贸易术语') }}</span>
            <select v-model="incoterm"><option v-for="t in INCOTERMS" :key="t" :value="t">{{ t }}</option></select>
          </label>
          <label class="ss-field"><span>{{ $t('目的港 / 交货地') }}</span><input v-model="destination" type="text" /></label>
        </div>
        <div class="ss-actions">
          <button type="button" class="ss-btn primary" :disabled="busy === 'calc' || !lines.length" @click="calc"><i :class="busy === 'calc' ? 'ri-loader-4-line spin' : 'ri-calculator-line'"></i>{{ $t('计算报价') }}</button>
          <span class="ss-muted">{{ $t('所有数字按报价规则计算，模型不参与定价') }}</span>
        </div>
        <template v-if="quote">
          <p v-for="(w, i) in quote.warnings" :key="i" class="ss-note warn"><i class="ri-error-warning-line"></i>{{ w }}</p>
          <div class="ss-table-wrap">
            <table class="ss-table">
              <thead><tr><th>{{ $t('项目') }}</th><th>{{ $t('计算过程') }}</th><th class="num">{{ $t('金额') }}</th><th>{{ $t('币种') }}</th></tr></thead>
              <tbody>
                <tr v-for="c in quote.calc" :key="c.key" :class="{ total: c.key === 'total' }">
                  <td>{{ c.label }}</td><td class="ft-wrap ss-muted">{{ c.formula }}</td><td class="num">{{ fmtMoney(c.value) }}</td><td>{{ c.currency }}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div class="ss-table-wrap">
            <table class="ss-table">
              <thead><tr><th>{{ $t('型号') }}</th><th>{{ $t('品名') }}</th><th class="num">{{ $t('数量') }}</th><th class="num">{{ $t('单价') }}</th><th class="num">{{ $t('金额') }}</th></tr></thead>
              <tbody>
                <tr v-for="(l, i) in quote.lines" :key="i"><td>{{ l.model }}</td><td>{{ l.name }}</td><td class="num">{{ l.quantity }}</td><td class="num">{{ fmtMoney(l.unitPrice) }}</td><td class="num">{{ fmtMoney(l.amount) }}</td></tr>
                <tr class="total"><td colspan="4">{{ $t('合计（{p0}）', { p0: quote.currency }) }}</td><td class="num">{{ fmtMoney(quote.total) }}</td></tr>
              </tbody>
            </table>
          </div>
        </template>
      </StepCard>

      <StepCard step-key="export" :index="3" :title="metas[3].title" :hint="metas[3].hint" :runtime="runtime.export">
        <div class="ss-actions">
          <button type="button" class="ss-btn primary" :disabled="!quote || busy === 'export'" @click="exportQuote"><i :class="busy === 'export' ? 'ri-loader-4-line spin' : 'ri-file-pdf-2-line'"></i>{{ $t('生成报价单（PDF + Excel）') }}</button>
        </div>
        <div v-if="quote?.filePath" class="ss-file-out">
          <i class="ri-file-check-line"></i><code>{{ quote.filePath }}</code>
          <button type="button" class="ss-btn sm ghost" @click="open(quote.filePath)"><i class="ri-external-link-line"></i>{{ $t('打开') }}</button>
        </div>
        <p class="ss-muted">{{ $t('Excel 里含内部成本明细页，只留在本地；发给客户的是 PDF。') }}</p>
      </StepCard>

      <StepCard step-key="approve" :index="4" :title="metas[4].title" :hint="metas[4].hint" :runtime="runtime.approve">
        <p class="ss-note info"><i class="ri-information-line"></i>{{ $t('审批前报价单带「DRAFT」水印；审批通过后重新生成正式版并去掉水印，之后才能发给客户。') }}</p>
        <div class="ss-actions">
          <button type="button" class="ss-btn primary" :disabled="!quote || quote.status !== 'draft' || busy === 'approve'" @click="approve"><i :class="busy === 'approve' ? 'ri-loader-4-line spin' : 'ri-shield-check-line'"></i>{{ $t('我已核对，审批通过') }}</button>
          <span v-if="quote?.approvedAt" class="ss-muted">{{ $t('已于 {p0} 审批', { p0: fmtDateTime(quote.approvedAt) }) }}</span>
        </div>
      </StepCard>

      <StepCard step-key="send" :index="5" :title="metas[5].title" :hint="metas[5].hint" :runtime="runtime.send">
        <div class="ss-grid">
          <label class="ss-field"><span>{{ $t('邮件语言') }}</span><input v-model="language" type="text" placeholder="English" /></label>
          <label class="ss-field"><span>{{ $t('发件邮箱') }}</span>
            <select v-model="mailboxId"><option value="">{{ $t('请选择') }}</option><option v-for="m in mailboxes" :key="m.id" :value="m.id">{{ m.label || m.address }}</option></select>
          </label>
        </div>
        <div class="ss-actions">
          <button type="button" class="ss-btn" :disabled="!quote || busy === 'draft'" @click="emailDraft"><i :class="busy === 'draft' ? 'ri-loader-4-line spin' : 'ri-quill-pen-line'"></i>{{ $t('写报价邮件') }}</button>
          <span v-if="mail.model" class="ss-muted">{{ $t('由 {p0} 撰写', { p0: modelLabel(mail.model) }) }}</span>
        </div>
        <label class="ss-field"><span>{{ $t('收件人') }}</span><input v-model="mail.to" type="text" /></label>
        <label class="ss-field"><span>{{ $t('标题') }}</span><input v-model="mail.subject" type="text" /></label>
        <label class="ss-field"><span>{{ $t('正文') }}</span><textarea v-model="mail.body" rows="10"></textarea></label>
        <GateIssues :result="gate" />
        <div class="ss-actions">
          <span v-if="quote && quote.status === 'draft'" class="ss-muted">{{ $t('报价单还没有审批，审批后才能发出') }}</span>
          <span class="grow"></span>
          <button type="button" class="ss-btn primary" :disabled="!quote || quote.status === 'draft' || !mailboxId || !mail.subject || !mail.body || busy === 'send'" @click="send"><i :class="busy === 'send' ? 'ri-loader-4-line spin' : 'ri-send-plane-line'"></i>{{ $t('发送报价') }}</button>
        </div>
        <p v-if="quote?.sentAt" class="ss-note ok"><i class="ri-check-line"></i>{{ $t('已于 {p0} 发出', { p0: fmtDateTime(quote.sentAt) }) }}</p>
      </StepCard>
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * 报价：询盘 → 匹配产品 → 按规则计算（每个数字有公式）→ 报价单 → 人工审批 → 发送。
 */
import { computed, reactive, ref, watch } from 'vue';
import type { FtGateResult, FtIncoterm, FtQuote, FtQuoteLine, FtQuoteRules } from '@totalclaw/ipc-contracts';
import { useNotificationStore } from '../../stores/notification';
import { t as i18nT } from '../../i18n';
import StepCard from '../service-settlement/StepCard.vue';
import StickyProgress from '../service-settlement/StickyProgress.vue';
import { scrollToStep, type StepMeta, type StepRuntime } from '../service-settlement/shared';
import ModuleHeader from './ModuleHeader.vue';
import GateIssues from './GateIssues.vue';
import {
  checkBeforeSend, enabledMailboxes, errorMessage, fmtDate, fmtDateTime, fmtMoney, ft, ftState, mailboxName, modelLabel,
  refreshState, splitEmails, type FtModuleMeta,
} from './shared';

const props = defineProps<{ meta: FtModuleMeta; focus?: { inquiryId?: string } | null }>();
defineEmits<{ (e: 'goto', module: string, payload: any): void }>();
const notif = useNotificationStore();
const state = ftState;

const INCOTERMS: FtIncoterm[] = ['EXW', 'FOB', 'CFR', 'CIF'];
const products = computed(() => state.value?.products || []);
const quotes = computed(() => state.value?.quotes || []);
const mailboxes = computed(() => enabledMailboxes(state.value));
const rules = computed(() => state.value?.settings.quoteRules);
const quotableInquiries = computed(() => (state.value?.inquiries || []).filter((q) => q.items.length && q.status !== 'spam'));

const showCatalog = ref(false);
const importing = ref(false);
const importInfo = ref('');
const rulesDraft = reactive<FtQuoteRules>({} as FtQuoteRules);
const rulesDirty = computed(() => !!rules.value && JSON.stringify(rules.value) !== JSON.stringify({ ...rules.value, ...rulesDraft }));
watch(rules, (r) => { if (r) Object.assign(rulesDraft, r); }, { immediate: true });
const fxBusy = ref(false);
const fxInfo = ref<{ rate: number; source: string; asOf: string } | null>(null);

const inquiryId = ref('');
const customerName = ref('');
const customerEmail = ref('');
const lines = ref<FtQuoteLine[]>([]);
const matchModel = ref('');
const incoterm = ref<FtIncoterm>('FOB');
const destination = ref('');
const quoteId = ref('');
const language = ref('');
const mailboxId = ref('');
const mail = reactive({ to: '', subject: '', body: '', model: '' });
const busy = ref('');
const errors = ref<Record<string, string>>({});
const gate = ref<FtGateResult | null>(null);
const hsOpen = ref('');
const hsBusy = ref('');
const hsManual = reactive<Record<string, string>>({});
const hsError = reactive<Record<string, string>>({});

const quote = computed(() => quotes.value.find((q) => q.id === quoteId.value) || null);
const currentInquiry = computed(() => state.value?.inquiries.find((q) => q.id === inquiryId.value) || null);

watch(() => props.focus?.inquiryId, (id) => { if (id) { newQuote(); inquiryId.value = id; } }, { immediate: true });
watch(currentInquiry, (q) => {
  if (!q) return;
  customerName.value = q.company || q.customerName;
  customerEmail.value = q.customerEmail;
  if (!mailboxId.value) mailboxId.value = q.mailboxId;
  const dest = q.fields.find((f) => f.key === 'destination')?.value;
  if (dest && !destination.value) destination.value = dest;
  const inc = q.fields.find((f) => f.key === 'incoterm')?.value?.toUpperCase();
  if (inc && (INCOTERMS as string[]).includes(inc)) incoterm.value = inc as FtIncoterm;
});
watch(rules, (r) => { if (r && !quoteId.value) incoterm.value = r.defaultIncoterm; }, { immediate: true });

const metas: StepMeta[] = [
  { key: 'pick', title: i18nT('选择询盘'), hint: i18nT('从已整理的询盘带出客户和产品，也可以不关联询盘') },
  { key: 'match', title: i18nT('匹配产品'), hint: i18nT('对照产品目录，标出完全匹配、部分匹配、目录里没有') },
  { key: 'calc', title: i18nT('计算报价'), hint: i18nT('按报价规则算成本、运费、保险、毛利，每个数字可看公式') },
  { key: 'export', title: i18nT('生成报价单'), hint: i18nT('输出 PDF（给客户）和 Excel（含内部成本页）') },
  { key: 'approve', title: i18nT('审批'), hint: i18nT('价格和付款条件由人确认') },
  { key: 'send', title: i18nT('发送'), hint: i18nT('审批后从选定邮箱发给客户') },
];
const runtime = computed<Record<string, StepRuntime>>(() => {
  const q = quote.value;
  const st = (key: string, done: boolean, summary?: string): StepRuntime => (busy.value === key
    ? { state: 'running' }
    : errors.value[key] ? { state: 'failed', error: errors.value[key] }
      : done ? { state: 'done', summary } : { state: 'todo' });
  return {
    pick: st('pick', !!(inquiryId.value || customerName.value || customerEmail.value), customerName.value || customerEmail.value),
    match: st('match', lines.value.length > 0, i18nT('{n} 行', { n: lines.value.length })),
    calc: st('calc', !!q, q ? `${fmtMoney(q.total)} ${q.currency}` : ''),
    export: st('export', !!q?.filePath),
    approve: st('approve', !!q && q.status !== 'draft'),
    send: st('send', q?.status === 'sent'),
  };
});
const currentKey = computed(() => metas.find((m) => runtime.value[m.key].state !== 'done')?.key || 'send');

function matchLabel(m: FtQuoteLine['match']): string { return { exact: i18nT('完全匹配'), partial: i18nT('部分匹配'), none: i18nT('目录里没有') }[m]; }
function quoteStatusLabel(s: FtQuote['status']): string { return { draft: i18nT('草稿'), approved: i18nT('已审批'), sent: i18nT('已发出') }[s]; }

async function run(key: string, fn: () => Promise<unknown>): Promise<boolean> {
  busy.value = key;
  errors.value = { ...errors.value, [key]: '' };
  void scrollToStep(key);
  try {
    await fn();
    await refreshState();
    return true;
  } catch (e) {
    errors.value = { ...errors.value, [key]: errorMessage(e) };
    return false;
  } finally {
    busy.value = '';
  }
}

async function importProducts(): Promise<void> {
  try {
    const paths = await ft<string[]>('files.pick', { filters: [{ name: 'Excel', extensions: ['xlsx', 'xls', 'csv'] }] });
    if (!paths?.length) return;
    importing.value = true;
    const r = await ft<{ added: number; updated: number; total: number; columns: Record<string, string> }>('product.import', { path: paths[0], replace: false });
    importInfo.value = i18nT('新增 {a} 个、更新 {u} 个，共 {t} 个。识别到的列：{c}', { a: r.added, u: r.updated, t: r.total, c: Object.entries(r.columns).map(([k, v]) => `${k}=${v}`).join('、') });
    await refreshState();
  } catch (e) {
    notif.error(errorMessage(e));
  } finally {
    importing.value = false;
  }
}
async function removeProduct(id: string): Promise<void> {
  try { await ft('product.remove', { id }); await refreshState(); } catch (e) { notif.error(errorMessage(e)); }
}
async function hsSuggest(productId: string, rerank: boolean): Promise<void> {
  hsBusy.value = productId;
  hsError[productId] = '';
  try { await ft('hs.suggest', { productId, rerank }); await refreshState(); } catch (e) { hsError[productId] = errorMessage(e); } finally { hsBusy.value = ''; }
}
async function hsConfirm(productId: string, code: string): Promise<void> {
  hsError[productId] = '';
  try { await ft('hs.confirm', { productId, code }); hsManual[productId] = ''; await refreshState(); } catch (e) { hsError[productId] = errorMessage(e); }
}
async function hsClear(productId: string): Promise<void> {
  try { await ft('hs.clear', { productId }); await refreshState(); } catch (e) { hsError[productId] = errorMessage(e); }
}
async function saveRules(): Promise<void> {
  try { await ft('settings.patch', { patch: { quoteRules: { ...rulesDraft } } }); await refreshState(); notif.success(i18nT('报价规则已保存')); } catch (e) { notif.error(errorMessage(e)); }
}
async function showFx(): Promise<void> {
  fxBusy.value = true;
  try { fxInfo.value = await ft('quote.fx'); } catch (e) { notif.error(errorMessage(e)); } finally { fxBusy.value = false; }
}

function newQuote(): void {
  quoteId.value = '';
  inquiryId.value = '';
  customerName.value = '';
  customerEmail.value = '';
  lines.value = [];
  matchModel.value = '';
  destination.value = '';
  errors.value = {};
  Object.assign(mail, { to: '', subject: '', body: '', model: '' });
}
function openQuote(q: FtQuote): void {
  quoteId.value = q.id;
  inquiryId.value = q.inquiryId || '';
  customerName.value = q.customerName || '';
  customerEmail.value = q.customerEmail || '';
  lines.value = q.lines.map((l) => ({ ...l }));
  incoterm.value = q.incoterm;
  destination.value = q.destination || '';
  mailboxId.value = q.mailboxId || mailboxId.value;
  errors.value = {};
  Object.assign(mail, { to: q.customerEmail || '', subject: '', body: '', model: '' });
}
async function removeQuote(id: string): Promise<void> {
  if (!window.confirm(i18nT('确定删除这份报价单？'))) return;
  try { await ft('quote.remove', { id }); if (quoteId.value === id) newQuote(); await refreshState(); } catch (e) { notif.error(errorMessage(e)); }
}

function addLine(): void {
  lines.value.push({ requested: '', model: '', name: '', quantity: 0, unitCost: 0, match: 'none' });
}
function pickProduct(l: FtQuoteLine, id: string): void {
  const p = products.value.find((x) => x.id === id);
  if (!p) { l.productId = undefined; l.match = 'none'; return; }
  Object.assign(l, { productId: p.id, model: p.model, name: p.name, unitCost: p.unitCost, match: 'exact', note: undefined });
}
async function match(): Promise<void> {
  await run('match', async () => {
    const r = await ft<{ lines: FtQuoteLine[]; model?: string }>('quote.match', { inquiryId: inquiryId.value });
    lines.value = r.lines;
    matchModel.value = r.model || '';
  });
}
async function calc(): Promise<void> {
  await run('calc', async () => {
    const q = await ft<FtQuote>('quote.calc', {
      id: quoteId.value || undefined, inquiryId: inquiryId.value || undefined, lines: lines.value, incoterm: incoterm.value,
      destination: destination.value || undefined, customerName: customerName.value || undefined, customerEmail: customerEmail.value || undefined,
      mailboxId: mailboxId.value || undefined, model: matchModel.value || undefined,
    });
    quoteId.value = q.id;
    if (!mail.to) mail.to = q.customerEmail || '';
  });
}
async function exportQuote(): Promise<void> {
  if (!quote.value) return;
  await run('export', () => ft('quote.export', { id: quote.value!.id }));
}
async function approve(): Promise<void> {
  if (!quote.value) return;
  const ok = await run('approve', () => ft('quote.approve', { id: quote.value!.id }));
  if (ok) notif.success(i18nT('报价单已审批，正式版已生成'));
}
async function emailDraft(): Promise<void> {
  if (!quote.value) return;
  await run('draft', async () => {
    const d = await ft<{ subject: string; body: string; model: string }>('quote.emailDraft', { id: quote.value!.id, language: language.value });
    Object.assign(mail, { subject: d.subject, body: d.body, model: d.model });
    if (!mail.to) mail.to = quote.value?.customerEmail || '';
  });
}
async function send(): Promise<void> {
  const q = quote.value;
  if (!q) return;
  const to = splitEmails(mail.to);
  if (!to.length) { notif.warn(i18nT('请填写收件人')); return; }
  let approvedHash: string | null;
  try {
    const r = await checkBeforeSend({ kind: 'quote', mailboxId: mailboxId.value, to, subject: mail.subject, body: mail.body, refId: q.id }, mailboxName(state.value, mailboxId.value));
    gate.value = r.result;
    approvedHash = r.hash;
  } catch (err) { notif.error(errorMessage(err)); return; }
  if (!approvedHash) return;
  const ok = await run('send', () => ft('quote.send', { id: q.id, mailboxId: mailboxId.value, to, subject: mail.subject, body: mail.body, approvedHash }));
  if (ok) notif.success(i18nT('报价已发出'));
}
function open(path?: string): void { if (path) void ft('path.open', { path }).catch((e) => notif.error(errorMessage(e))); }
function scrollTo(key: string): void { void scrollToStep(key); }
</script>

<style scoped>
.ft-scroll { max-height: 420px; overflow: auto; }
.ft-hs-row td { background: var(--color-bg-primary); white-space: normal !important; }
.ft-hs { display: grid; gap: 8px; }
.ft-hs-input { height: 28px; width: 150px; border-radius: var(--radius-3); border: 1px solid var(--color-border); background: var(--color-bg-input); color: var(--color-text-primary); font: inherit; font-size: var(--font-size-sm); padding-inline: 8px; }
.ft-hs-list { margin: 0; padding-inline-start: 20px; display: grid; gap: 8px; font-size: 12.5px; }
.ft-hs-list__head { display: flex; gap: 8px; align-items: center; }
.ft-hs-list__desc { color: var(--color-text-secondary); }
.ft-hs-list__reason { display: flex; gap: 4px; align-items: baseline; }
.ft-row-actions { display: flex; gap: 4px; }
.ft-wrap { white-space: normal !important; max-width: 320px; }
.ft-active td { background: color-mix(in srgb, var(--color-brand) 8%, transparent); }
</style>
