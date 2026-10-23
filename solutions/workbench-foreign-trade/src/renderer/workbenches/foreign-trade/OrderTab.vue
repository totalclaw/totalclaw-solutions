<template>
  <div class="ss-module">
    <ModuleHeader :meta="meta" />

    <!-- 新建订单 -->
    <section class="ss-panel">
      <header>
        <strong><i class="ri-add-box-line"></i> {{ $t('新建订单') }}</strong>
        <span class="grow"></span>
        <button type="button" class="ss-btn sm ghost" @click="showCreate = !showCreate"><i :class="showCreate ? 'ri-arrow-up-s-line' : 'ri-arrow-down-s-line'"></i>{{ showCreate ? $t('收起') : $t('展开') }}</button>
      </header>
      <template v-if="showCreate">
        <div class="ss-grid">
          <label class="ss-field"><span>{{ $t('来自报价单（可选）') }}</span>
            <select v-model="form.quoteId" @change="fillFromQuote">
              <option value="">{{ $t('不关联') }}</option>
              <option v-for="q in doneQuotes" :key="q.id" :value="q.id">{{ (q.customerName || q.customerEmail || '') + ' · ' + fmtMoney(q.total) + ' ' + q.currency }}</option>
            </select>
          </label>
          <label class="ss-field"><span>{{ $t('订单号') }}</span><input v-model.trim="form.orderNo" type="text" /></label>
          <label class="ss-field"><span>{{ $t('客户') }}</span><input v-model.trim="form.customerName" type="text" /></label>
          <label class="ss-field"><span>{{ $t('客户邮箱') }}</span><input v-model.trim="form.customerEmail" type="text" /></label>
          <label class="ss-field"><span>{{ $t('金额') }}</span><input v-model.number="form.amount" type="number" /></label>
          <label class="ss-field"><span>{{ $t('币种') }}</span><input v-model.trim="form.currency" type="text" /></label>
        </div>
        <div class="ss-actions"><span class="grow"></span>
          <button type="button" class="ss-btn primary" :disabled="!form.orderNo || creating" @click="create"><i :class="creating ? 'ri-loader-4-line spin' : 'ri-add-line'"></i>{{ $t('创建订单') }}</button>
        </div>
      </template>
    </section>

    <div class="ft-split">
      <aside class="ft-list">
        <ul>
          <li v-for="o in orders" :key="o.id" :class="{ active: o.id === selectedId }" @click="selectedId = o.id">
            <div class="ft-list__top"><strong>{{ o.orderNo }}</strong><span class="ss-chip" :class="o.status === 'done' ? 'ok' : overdueCount(o) ? 'bad' : 'brand'">{{ o.status === 'done' ? $t('已完成') : overdueCount(o) ? $t('{n} 个节点逾期', { n: overdueCount(o) }) : $t('进行中') }}</span></div>
            <div class="ft-list__sub">{{ o.customerName || '—' }}</div>
            <div class="ft-list__meta"><span v-if="o.amount != null">{{ fmtMoney(o.amount) }} {{ o.currency || '' }}</span><span>{{ fmtDate(o.createdAt) }}</span></div>
          </li>
          <li v-if="!orders.length" class="ss-empty">{{ $t('还没有订单') }}</li>
        </ul>
      </aside>

      <section v-if="current" class="ft-detail">
        <StickyProgress :title="$t('订单 {p0}', { p0: current.orderNo })" :metas="metas" :runtime="runtime" :current-key="currentKey" @jump="scrollTo" />
        <div class="ss-steps">
          <StepCard step-key="nodes" :index="0" :title="metas[0].title" :hint="metas[0].hint" :runtime="runtime.nodes">
            <div class="ss-table-wrap">
              <table class="ss-table">
                <thead><tr><th>{{ $t('节点') }}</th><th>{{ $t('计划日期') }}</th><th>{{ $t('完成') }}</th><th>{{ $t('完成时间') }}</th></tr></thead>
                <tbody>
                  <tr v-for="n in nodesDraft" :key="n.key" :class="{ bad: isOverdue(n) }">
                    <td>{{ n.label }}<span v-if="isOverdue(n)" class="ss-chip bad">{{ $t('逾期') }}</span></td>
                    <td><input v-model="n.due" type="date" /></td>
                    <td><input v-model="n.done" type="checkbox" /></td>
                    <td>{{ n.doneAt ? fmtDateTime(n.doneAt) : '—' }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div class="ss-actions"><span class="grow"></span>
              <button type="button" class="ss-btn primary" :disabled="busy === 'nodes'" @click="saveNodes"><i :class="busy === 'nodes' ? 'ri-loader-4-line spin' : 'ri-save-line'"></i>{{ $t('保存节点') }}</button>
            </div>
          </StepCard>


          <StepCard step-key="gen" :index="1" :title="metas[1].title" :hint="metas[1].hint" :runtime="runtime.gen">
            <div v-if="!docForm" class="ss-actions">
              <button type="button" class="ss-btn primary" :disabled="busy === 'gen'" data-test="ft-docs-prepare" @click="prepareDocs(false)"><i :class="busy === 'gen' ? 'ri-loader-4-line spin' : 'ri-file-add-line'"></i>{{ $t('准备单据信息') }}</button>
              <span class="ss-muted">{{ $t('从报价单、产品目录和「设置 → 单据抬头与银行」带出，每一项都可以改') }}</span>
            </div>
            <template v-else>
              <div class="ss-subhead">{{ $t('抬头与条款') }}</div>
              <div class="ss-grid" data-test="ft-docs-form">
                <label class="ss-field"><span>{{ $t('卖方（出单公司，英文）') }}</span><input v-model="docForm.seller.name" type="text" data-test="ft-doc-seller" /></label>
                <label class="ss-field"><span>{{ $t('卖方地址') }}</span><input v-model="docForm.seller.address" type="text" /></label>
                <label class="ss-field"><span>{{ $t('买方') }}</span><input v-model="docForm.buyer.name" type="text" data-test="ft-doc-buyer" /></label>
                <label class="ss-field"><span>{{ $t('买方地址') }}</span><input v-model="docForm.buyer.address" type="text" /></label>
                <label class="ss-field"><span>{{ $t('PI 号') }}</span><input v-model="docForm.piNo" type="text" /></label>
                <label class="ss-field"><span>{{ $t('CI 号') }}</span><input v-model="docForm.ciNo" type="text" /></label>
                <label class="ss-field"><span>{{ $t('日期') }}</span><input v-model="docForm.date" type="date" /></label>
                <label class="ss-field"><span>{{ $t('币种') }}</span><input v-model.trim="docForm.currency" type="text" /></label>
                <label class="ss-field"><span>{{ $t('计价方式') }}</span>
                  <select v-model="docForm.priceUnit"><option v-for="u in priceUnits" :key="u" :value="u">{{ priceUnitLabel(u) }}</option></select>
                </label>
                <label class="ss-field"><span>{{ $t('贸易术语') }}</span><input v-model.trim="docForm.incoterm" type="text" /></label>
                <label class="ss-field"><span>{{ $t('起运港') }}</span><input v-model="docForm.portOfLoading" type="text" /></label>
                <label class="ss-field"><span>{{ $t('目的港') }}</span><input v-model="docForm.portOfDestination" type="text" data-test="ft-doc-dest" /></label>
                <label class="ss-field"><span>{{ $t('付款方式') }}</span><input v-model="docForm.payment" type="text" /></label>
                <label class="ss-field"><span>{{ $t('信用证号（可选）') }}</span><input v-model="docForm.lcNumber" type="text" /></label>
                <label class="ss-field"><span>{{ $t('唛头（可选）') }}</span><input v-model="docForm.shippingMarks" type="text" /></label>
                <label class="ss-field"><span>{{ $t('产地证 / 质检证书要求') }}</span><input v-model="docForm.certificates" type="text" /></label>
              </div>
              <div class="ss-subhead">{{ $t('收款银行') }}</div>
              <div class="ss-grid">
                <label class="ss-field"><span>{{ $t('银行名称') }}</span><input v-model="docForm.bank.name" type="text" data-test="ft-doc-bank" /></label>
                <label class="ss-field"><span>{{ $t('账户名') }}</span><input v-model="docForm.bank.accountName" type="text" /></label>
                <label class="ss-field"><span>{{ $t('账号') }}</span><input v-model="docForm.bank.accountNo" type="text" data-test="ft-doc-account" /></label>
                <label class="ss-field"><span>SWIFT</span><input v-model.trim="docForm.bank.swift" type="text" data-test="ft-doc-swift" /></label>
              </div>
              <div class="ss-subhead">{{ $t('装箱参数') }}</div>
              <div class="ss-grid">
                <label class="ss-field"><span>{{ $t('每箱重量（kg，没填装箱数时按它分箱）') }}</span><input v-model.number="docForm.packing.kgPerCarton" type="number" step="0.1" /></label>
                <label class="ss-field"><span>{{ $t('每托箱数（0 = 不打托）') }}</span><input v-model.number="docForm.packing.cartonsPerPallet" type="number" /></label>
                <label class="ss-field"><span>{{ $t('托盘自重（kg）') }}</span><input v-model.number="docForm.packing.palletWeightKg" type="number" step="0.1" /></label>
                <label class="ss-field"><span>{{ $t('纸箱自重（kg / 箱）') }}</span><input v-model.number="docForm.packing.cartonTareKg" type="number" step="0.01" /></label>
                <label class="ss-field"><span>{{ $t('每托体积（CBM，没有箱体积时估算用）') }}</span><input v-model.number="docForm.packing.cbmPerPallet" type="number" step="0.001" /></label>
              </div>
              <div class="ss-subhead">{{ $t('产品行') }}</div>
              <div class="ss-table-wrap">
                <table class="ss-table ft-doc-lines">
                  <thead><tr><th>{{ $t('目录产品') }}</th><th>{{ $t('型号') }}</th><th>{{ $t('品名（英文）') }}</th><th>{{ $t('HS 编码') }}</th><th class="num">{{ $t('数量') }}</th><th>{{ $t('单位') }}</th><th class="num">{{ $t('单价') }}</th><th class="num">{{ $t('单件净重') }}</th><th class="num">{{ $t('装箱数') }}</th><th class="num">{{ $t('箱体积') }}</th><th></th></tr></thead>
                  <tbody>
                    <tr v-for="(l, i) in docForm.lines" :key="i" :data-test="`ft-doc-line-${i}`">
                      <td>
                        <select :value="l.productId || ''" @change="pickDocProduct(l, ($event.target as HTMLSelectElement).value)">
                          <option value="">{{ $t('（不在目录）') }}</option>
                          <option v-for="p in products" :key="p.id" :value="p.id">{{ p.model }} · {{ p.name }}</option>
                        </select>
                      </td>
                      <td><input v-model="l.model" type="text" /></td>
                      <td><input v-model="l.description" type="text" /></td>
                      <td>
                        <span v-if="l.hsCode && l.hsConfirmed" class="ss-chip ok" data-test="ft-doc-hs"><i class="ri-check-line"></i>{{ l.hsCode }}</span>
                        <span v-else-if="l.hsCode" class="ss-chip bad" :title="$t('到「报价 → 产品目录」里确认')">{{ $t('{p0} 未确认', { p0: l.hsCode }) }}</span>
                        <span v-else class="ss-muted" :title="$t('到「报价 → 产品目录」里找编码并确认')">{{ $t('没有') }}</span>
                      </td>
                      <td class="num"><input v-model.number="l.quantity" type="number" /></td>
                      <td><input v-model="l.unit" type="text" class="ft-unit" /></td>
                      <td class="num"><input v-model.number="l.unitPrice" type="number" step="0.0001" /></td>
                      <td class="num"><input v-model.number="l.unitNetKg" type="number" step="0.001" /></td>
                      <td class="num"><input v-model.number="l.pcsPerCarton" type="number" /></td>
                      <td class="num"><input v-model.number="l.cartonCbm" type="number" step="0.001" /></td>
                      <td><button type="button" class="ss-btn sm ghost danger" @click="docForm.lines.splice(i, 1)"><i class="ri-delete-bin-line"></i></button></td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div class="ss-actions">
                <button type="button" class="ss-btn sm" @click="addDocLine"><i class="ri-add-line"></i>{{ $t('添加一行') }}</button>
                <button type="button" class="ss-btn sm ghost" :disabled="busy === 'gen'" @click="prepareDocs(true)"><i class="ri-refresh-line"></i>{{ $t('重新从订单带出') }}</button>
                <span class="grow"></span>
                <button type="button" class="ss-btn" :disabled="busy === 'gen'" data-test="ft-docs-save" @click="saveDocs"><i class="ri-save-line"></i>{{ $t('保存') }}</button>
                <button type="button" class="ss-btn primary" :disabled="busy === 'gen' || !docForm.lines.length" data-test="ft-docs-generate" @click="generateDocs"><i :class="busy === 'gen' ? 'ri-loader-4-line spin' : 'ri-file-list-3-line'"></i>{{ $t('生成 PI / CI / 装箱单') }}</button>
              </div>
              <ul v-if="genFindings.length" class="ft-findings" data-test="ft-docs-findings">
                <li v-for="(f, i) in genFindings" :key="i" :data-rule="f.rule" :data-level="f.level">
                  <span class="ss-chip" :class="findingClass(f.level)">{{ findingLabel(f.level) }}</span>
                  <span>{{ f.message }}<small v-if="f.suggestion" class="ss-muted"> · {{ f.suggestion }}</small></span>
                </li>
              </ul>
              <template v-if="current.tradeDocs?.generated">
                <p class="ss-note" :class="crossErrors.length ? 'danger' : 'ok'" data-test="ft-docs-cross">
                  <i :class="crossErrors.length ? 'ri-error-warning-line' : 'ri-check-double-line'"></i>
                  {{ crossErrors.length ? $t('交叉校验有 {n} 处对不上，见上面的红色条目', { n: crossErrors.length }) : $t('交叉校验通过：逐行金额、合计与大写金额一致，CI 与装箱单的净重、毛重一致') }}
                </p>
                <div class="ss-kpis">
                  <div class="ss-kpi accent"><small>{{ $t('合计') }}</small><strong>{{ fmtMoney(current.tradeDocs.generated.totals.amount) }} {{ current.tradeDocs.input.currency }}</strong></div>
                  <div class="ss-kpi"><small>{{ $t('箱数') }}</small><strong>{{ current.tradeDocs.generated.totals.cartons }}</strong></div>
                  <div class="ss-kpi"><small>{{ $t('净重 / 毛重（kg）') }}</small><strong>{{ current.tradeDocs.generated.totals.netWeightKg }} / {{ current.tradeDocs.generated.totals.grossWeightKg }}</strong></div>
                  <div class="ss-kpi"><small>{{ $t('体积（CBM）') }}</small><strong>{{ current.tradeDocs.generated.totals.cbm }}</strong></div>
                </div>
                <p class="ss-muted ft-words" data-test="ft-docs-words">SAY: {{ current.tradeDocs.generated.totals.amountInWords }}</p>
                <div class="ss-table-wrap">
                  <table class="ss-table">
                    <thead><tr><th>{{ $t('单据') }}</th><th>{{ $t('Excel（公式联动）') }}</th><th>PDF</th></tr></thead>
                    <tbody>
                      <tr v-for="f in current.tradeDocs.generated.files" :key="f.kind" :data-test="`ft-docs-file-${f.kind}`">
                        <td>{{ docKindLabel(f.kind) }}</td>
                        <td><button type="button" class="ss-link" @click="open(f.xlsx)">{{ baseName(f.xlsx) }}</button></td>
                        <td><button type="button" class="ss-link" @click="open(f.pdf)">{{ baseName(f.pdf) }}</button></td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </template>
            </template>
          </StepCard>

          <StepCard step-key="docs" :index="2" :title="metas[2].title" :hint="metas[2].hint" :runtime="runtime.docs">
            <div class="ss-actions">
              <label class="ss-field inline"><span>{{ $t('单据类型') }}</span>
                <select v-model="docKind"><option v-for="k in DOC_KINDS" :key="k" :value="k">{{ docKindLabel(k) }}</option></select>
              </label>
              <button type="button" class="ss-btn" :disabled="busy === 'docs'" @click="addDocs"><i :class="busy === 'docs' ? 'ri-loader-4-line spin' : 'ri-upload-2-line'"></i>{{ $t('上传单据') }}</button>
            </div>
            <div v-if="current.docs.length" class="ss-table-wrap">
              <table class="ss-table">
                <thead><tr><th>{{ $t('类型') }}</th><th>{{ $t('文件') }}</th><th></th></tr></thead>
                <tbody>
                  <tr v-for="d in current.docs" :key="d.id">
                    <td><span class="ss-chip">{{ docKindLabel(d.kind) }}</span></td>
                    <td><button type="button" class="ss-link" @click="open(d.path)">{{ d.name }}</button></td>
                    <td><button type="button" class="ss-btn sm ghost danger" @click="removeDoc(d.id)"><i class="ri-delete-bin-line"></i></button></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </StepCard>

          <StepCard step-key="extract" :index="3" :title="metas[3].title" :hint="metas[3].hint" :runtime="runtime.extract">
            <div class="ss-actions">
              <button type="button" class="ss-btn primary" :disabled="!current.docs.length || busy === 'extract'" @click="extract"><i :class="busy === 'extract' ? 'ri-loader-4-line spin' : 'ri-file-search-line'"></i>{{ $t('提取单据字段') }}</button>
              <span v-if="busy === 'extract' && ftProgress.order" class="ss-muted">{{ ftProgress.order }}</span>
            </div>
            <div v-if="extractedDocs.length" class="ss-table-wrap">
              <table class="ss-table">
                <thead><tr><th>{{ $t('字段') }}</th><th v-for="d in extractedDocs" :key="d.id">{{ d.name }}</th></tr></thead>
                <tbody>
                  <tr v-for="f in FIELDS" :key="f"><td>{{ fieldLabel(f) }}</td><td v-for="d in extractedDocs" :key="d.id" class="ft-wrap">{{ d.fields?.[f] || '—' }}</td></tr>
                </tbody>
              </table>
            </div>
            <p v-for="d in current.docs.filter((x) => x.error)" :key="d.id" class="ss-note danger"><i class="ri-error-warning-line"></i>{{ $t('{p0}：{p1}', { p0: d.name, p1: d.error }) }}</p>
          </StepCard>

          <StepCard step-key="check" :index="4" :title="metas[4].title" :hint="metas[4].hint" :runtime="runtime.check">
            <div class="ss-actions">
              <button type="button" class="ss-btn primary" :disabled="!extractedDocs.length || busy === 'check'" @click="check"><i :class="busy === 'check' ? 'ri-loader-4-line spin' : 'ri-git-compare-line'"></i>{{ $t('核对单据一致性') }}</button>
            </div>
            <template v-if="current.check">
              <div v-if="current.check.issues.length" class="ss-table-wrap">
                <table class="ss-table">
                  <thead><tr><th>{{ $t('不一致的字段') }}</th><th>{{ $t('各单据写法') }}</th></tr></thead>
                  <tbody>
                    <tr v-for="i in current.check.issues" :key="i.field" class="bad">
                      <td>{{ fieldLabel(i.field) }}</td>
                      <td class="ft-wrap"><div v-for="v in i.values" :key="v.doc" class="ft-diff">{{ $t('{p0}：', { p0: v.doc }) }}<strong>{{ v.value }}</strong></div></td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <p v-else class="ss-note ok"><i class="ri-check-double-line"></i>{{ current.check.compared.length ? $t('核对了 {p0}，各单据一致', { p0: current.check.compared.map(fieldLabel).join('、') }) : $t('至少要有两份单据提取到同一字段才能核对') }}</p>
              <template v-if="current.check.findings?.length">
                <div class="ss-subhead">{{ $t('金额与重量核对（逐行重算、合计、大写金额三方比对，按序号配行）') }}</div>
                <ul class="ft-findings" data-test="ft-check-findings">
                  <li v-for="(f, i) in current.check.findings" :key="i" :data-rule="f.rule" :data-level="f.level">
                    <span class="ss-chip" :class="findingClass(f.level)">{{ findingLabel(f.level) }}</span><span>{{ f.message }}</span>
                  </li>
                </ul>
              </template>
            </template>
          </StepCard>

          <StepCard step-key="finish" :index="5" :title="metas[5].title" :hint="metas[5].hint" :runtime="runtime.finish">
            <div class="ss-actions">
              <button v-if="current.status !== 'done'" type="button" class="ss-btn primary" :disabled="busy === 'finish'" @click="finish('done')"><i class="ri-flag-line"></i>{{ $t('标记订单完成') }}</button>
              <button v-else type="button" class="ss-btn" :disabled="busy === 'finish'" @click="finish('active')"><i class="ri-arrow-go-back-line"></i>{{ $t('重新打开') }}</button>
              <span class="grow"></span>
              <button type="button" class="ss-btn ghost danger" @click="remove"><i class="ri-delete-bin-line"></i>{{ $t('删除订单') }}</button>
            </div>
          </StepCard>
        </div>
      </section>
      <section v-else class="ft-detail ss-empty">{{ $t('在左侧选择一个订单，或先新建订单') }}</section>
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * 订单推进：节点计划与逾期提醒 → 单据归档 → 字段提取 → 跨单据一致性核对 → 完成。
 */
import { computed, reactive, ref, watch } from 'vue';
import type { FtDocFinding, FtOrder, FtOrderDocKind, FtOrderNode, FtTradeDocInput, FtTradeLine } from '@totalclaw/ipc-contracts';
import { useNotificationStore } from '../../stores/notification';
import { t as i18nT } from '../../i18n';
import StepCard from '../service-settlement/StepCard.vue';
import StickyProgress from '../service-settlement/StickyProgress.vue';
import { scrollToStep, type StepMeta, type StepRuntime } from '../service-settlement/shared';
import ModuleHeader from './ModuleHeader.vue';
import { confirmScreening, errorMessage, fmtDate, fmtDateTime, fmtMoney, ft, ftProgress, ftState, refreshState, todayIso, type FtModuleMeta } from './shared';

const props = defineProps<{ meta: FtModuleMeta; focus?: { orderId?: string; quoteId?: string } | null }>();
defineEmits<{ (e: 'goto', module: string, payload: any): void }>();
const notif = useNotificationStore();
const state = ftState;

const DOC_KINDS: FtOrderDocKind[] = ['PI', 'CI', 'PL', 'BL', 'contract', 'other'];
const FIELDS = ['order_no', 'consignee', 'product_names', 'total_quantity', 'total_amount', 'currency', 'destination'];

const orders = computed(() => state.value?.orders || []);
const doneQuotes = computed(() => (state.value?.quotes || []).filter((q) => q.status !== 'draft'));
const selectedId = ref('');
const current = computed(() => orders.value.find((o) => o.id === selectedId.value) || null);
const extractedDocs = computed(() => (current.value?.docs || []).filter((d) => d.fields && Object.keys(d.fields).length));
const showCreate = ref(false);
const creating = ref(false);
const form = reactive({ quoteId: '', orderNo: '', customerName: '', customerEmail: '', amount: undefined as number | undefined, currency: '' });
const docKind = ref<FtOrderDocKind>('PI');
const nodesDraft = ref<FtOrderNode[]>([]);
const busy = ref('');
const errors = ref<Record<string, string>>({});
const products = computed(() => state.value?.products || []);
const docForm = ref<FtTradeDocInput | null>(null);
const genFindings = computed<FtDocFinding[]>(() => current.value?.tradeDocs?.validation || []);
const crossErrors = computed(() => genFindings.value.filter((f) => f.level === 'error' && !/^R\d+$/.test(f.rule)));
const priceUnits = computed(() => {
  const cur = (docForm.value?.currency || 'USD').toUpperCase();
  const list = [`${cur}/PCS`, `${cur}/MPCS`, `${cur}/TON`];
  return docForm.value?.priceUnit && !list.includes(docForm.value.priceUnit) ? [docForm.value.priceUnit, ...list] : list;
});

watch(() => props.focus, (f) => {
  if (f?.orderId) selectedId.value = f.orderId;
  if (f?.quoteId) { showCreate.value = true; form.quoteId = f.quoteId; fillFromQuote(); }
}, { immediate: true });
watch(orders, (l) => { if (!selectedId.value && l.length) selectedId.value = l[0].id; }, { immediate: true });
// 侦听拼成字符串：返回数组的话每次状态推送都是新数组，会把正在编辑的内容冲掉
watch(() => `${current.value?.id}|${JSON.stringify(current.value?.tradeDocs?.input || null)}`, () => {
  const input = current.value?.tradeDocs?.input;
  docForm.value = input ? JSON.parse(JSON.stringify(input)) : null;
}, { immediate: true });
watch(() => `${current.value?.id}|${JSON.stringify(current.value?.nodes || [])}`, () => {
  nodesDraft.value = (current.value?.nodes || []).map((n) => ({ ...n }));
  errors.value = {};
}, { immediate: true });

const today = todayIso();
function isOverdue(n: FtOrderNode): boolean { return !n.done && !!n.due && n.due < today; }
function overdueCount(o: FtOrder): number { return o.status === 'done' ? 0 : o.nodes.filter(isOverdue).length; }

const metas: StepMeta[] = [
  { key: 'nodes', title: i18nT('节点计划'), hint: i18nT('定金、生产、验货、订舱、装运、到港、尾款，到期没完成会标红') },
  { key: 'gen', title: i18nT('生成单据'), hint: i18nT('PI、商业发票、装箱单按规则计算金额、重量和大写金额，输出 Excel（公式联动）与 PDF；HS 编码只用人工确认过的') },
  { key: 'docs', title: i18nT('上传单据'), hint: i18nT('形式发票、商业发票、装箱单、提单、合同统一归档') },
  { key: 'extract', title: i18nT('提取字段'), hint: i18nT('从每份单据读出合同号、收货人、品名、数量、金额、目的港') },
  { key: 'check', title: i18nT('一致性核对'), hint: i18nT('同一字段在不同单据里写法不一样就列出来') },
  { key: 'finish', title: i18nT('完成订单'), hint: i18nT('全部节点完成后标记订单完成') },
];
const runtime = computed<Record<string, StepRuntime>>(() => {
  const o = current.value;
  const st = (key: string, done: boolean, summary?: string): StepRuntime => (busy.value === key
    ? { state: 'running' }
    : errors.value[key] ? { state: 'failed', error: errors.value[key] }
      : done ? { state: 'done', summary } : { state: 'todo' });
  const doneNodes = o?.nodes.filter((n) => n.done).length || 0;
  return {
    nodes: st('nodes', !!o && o.nodes.some((n) => n.due || n.done), o ? i18nT('{a}/{b} 个节点完成', { a: doneNodes, b: o.nodes.length }) : ''),
    gen: st('gen', !!o?.tradeDocs?.generated, o?.tradeDocs?.generated ? `${fmtMoney(o.tradeDocs.generated.totals.amount)} ${o.tradeDocs.input.currency}` : ''),
    docs: st('docs', !!o?.docs.length, i18nT('{n} 份单据', { n: o?.docs.length || 0 })),
    extract: st('extract', extractedDocs.value.length > 0, i18nT('{n} 份已提取', { n: extractedDocs.value.length })),
    check: st('check', !!o?.check, o?.check ? (o.check.issues.length || o.check.findings?.some((f) => f.level === 'error') ? i18nT('{n} 处不一致', { n: o.check.issues.length + (o.check.findings || []).filter((f) => f.level === 'error').length }) : i18nT('一致')) : ''),
    finish: st('finish', o?.status === 'done'),
  };
});
const currentKey = computed(() => metas.find((m) => runtime.value[m.key].state !== 'done')?.key || 'finish');

function docKindLabel(k: FtOrderDocKind): string {
  return { PI: i18nT('形式发票 PI'), CI: i18nT('商业发票 CI'), PL: i18nT('装箱单 PL'), BL: i18nT('提单 BL'), contract: i18nT('合同'), other: i18nT('其他') }[k];
}
function fieldLabel(f: string): string {
  return ({ order_no: i18nT('合同号'), consignee: i18nT('收货人'), product_names: i18nT('品名'), total_quantity: i18nT('总数量'), total_amount: i18nT('总金额'), currency: i18nT('币种'), destination: i18nT('目的港') } as Record<string, string>)[f] || f;
}

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

function fillFromQuote(): void {
  const q = doneQuotes.value.find((x) => x.id === form.quoteId);
  if (!q) return;
  form.customerName = q.customerName || '';
  form.customerEmail = q.customerEmail || '';
  form.amount = q.total;
  form.currency = q.currency;
}
function priceUnitLabel(u: string): string {
  const mode = /TON/i.test(u) ? i18nT('按吨') : /MPCS/i.test(u) ? i18nT('按千件') : i18nT('按件');
  return `${u}（${mode}）`;
}
function findingClass(l: FtDocFinding['level']): string { return l === 'error' ? 'bad' : l === 'warning' ? 'warn' : 'brand'; }
function findingLabel(l: FtDocFinding['level']): string { return { error: i18nT('错误'), warning: i18nT('提醒'), info: i18nT('说明') }[l]; }
function baseName(p: string): string { return p.split(/[\\/]/).pop() || p; }
function pickDocProduct(l: FtTradeLine, id: string): void {
  const p = products.value.find((x) => x.id === id);
  if (!p) { l.productId = undefined; return; }
  Object.assign(l, { productId: p.id, model: p.model, description: l.description || p.name, hsCode: p.hsConfirmed?.code, hsConfirmed: !!p.hsConfirmed, unitNetKg: p.unitNetKg, pcsPerCarton: p.pcsPerCarton, cartonCbm: p.cartonCbm });
}
function addDocLine(): void {
  docForm.value?.lines.push({ no: docForm.value.lines.length + 1, model: '', description: '', quantity: 0, unit: 'PCS' });
}
async function prepareDocs(reset: boolean): Promise<void> {
  if (!current.value) return;
  if (reset && !window.confirm(i18nT('按订单和报价单重新带出，当前改动会丢掉，继续吗？'))) return;
  await run('gen', () => ft('docs.prepare', { orderId: current.value!.id, reset }));
}
async function saveDocs(): Promise<boolean> {
  if (!current.value || !docForm.value) return false;
  return run('gen', () => ft('docs.save', { orderId: current.value!.id, input: docForm.value }));
}
async function generateDocs(): Promise<void> {
  if (!current.value || !docForm.value) return;
  if (!(await saveDocs())) return;
  try {
    if (!(await confirmScreening(docForm.value?.buyer.name || current.value.customerName || '', i18nT('生成 PI')))) return;
  } catch (e) { notif.error(errorMessage(e)); return; }
  const ok = await run('gen', () => ft('docs.generate', { orderId: current.value!.id }));
  if (ok) notif.success(i18nT('PI、商业发票、装箱单已生成'));
}
async function create(): Promise<void> {
  try {
    if (!(await confirmScreening(form.customerName, i18nT('创建订单')))) return;
  } catch (e) { notif.error(errorMessage(e)); return; }
  creating.value = true;
  try {
    const o = await ft<FtOrder>('order.create', { ...form, quoteId: form.quoteId || undefined });
    await refreshState();
    selectedId.value = o.id;
    Object.assign(form, { quoteId: '', orderNo: '', customerName: '', customerEmail: '', amount: undefined, currency: '' });
    showCreate.value = false;
    notif.success(i18nT('订单已创建'));
  } catch (e) {
    notif.error(errorMessage(e));
  } finally {
    creating.value = false;
  }
}
async function saveNodes(): Promise<void> {
  if (!current.value) return;
  await run('nodes', () => ft('order.update', { id: current.value!.id, patch: { nodes: nodesDraft.value } }));
}
async function addDocs(): Promise<void> {
  if (!current.value) return;
  const paths = await ft<string[]>('files.pick', { multi: true, filters: [{ name: i18nT('单据'), extensions: ['pdf', 'xlsx', 'xls', 'docx', 'doc', 'csv', 'png', 'jpg', 'jpeg'] }] }).catch((e) => { notif.error(errorMessage(e)); return [] as string[]; });
  if (!paths.length) return;
  await run('docs', () => ft('order.addDocs', { id: current.value!.id, files: paths.map((path) => ({ path, kind: docKind.value })) }));
}
async function removeDoc(docId: string): Promise<void> {
  if (!current.value) return;
  try { await ft('order.removeDoc', { id: current.value.id, docId }); await refreshState(); } catch (e) { notif.error(errorMessage(e)); }
}
async function extract(): Promise<void> {
  if (!current.value) return;
  await run('extract', () => ft('order.extract', { id: current.value!.id }));
}
async function check(): Promise<void> {
  if (!current.value) return;
  await run('check', () => ft('order.check', { id: current.value!.id }));
}
async function finish(status: 'done' | 'active'): Promise<void> {
  if (!current.value) return;
  await run('finish', () => ft('order.update', { id: current.value!.id, patch: { status } }));
}
async function remove(): Promise<void> {
  if (!current.value || !window.confirm(i18nT('确定删除订单 {p0}？', { p0: current.value.orderNo }))) return;
  try { await ft('order.remove', { id: current.value.id }); selectedId.value = ''; await refreshState(); } catch (e) { notif.error(errorMessage(e)); }
}
function open(path: string): void { void ft('path.open', { path }).catch((e) => notif.error(errorMessage(e))); }
function scrollTo(key: string): void { void scrollToStep(key); }
</script>

<style scoped>
.ft-split { display: grid; grid-template-columns: minmax(240px, 300px) 1fr; gap: 14px; align-items: start; }
@media (max-width: 960px) { .ft-split { grid-template-columns: 1fr; } }
.ft-list { border: 1px solid var(--color-border); border-radius: var(--radius-6); background: var(--color-bg-card); padding: 10px; position: sticky; top: 0; max-height: calc(100vh - 160px); overflow-y: auto; }
.ft-list ul { list-style: none; margin: 0; padding: 0; display: grid; gap: 6px; }
.ft-list li { padding: 8px 10px; border-radius: var(--radius-4); border: 1px solid transparent; cursor: pointer; display: grid; gap: 3px; background: var(--color-bg-primary); }
.ft-list li.active { border-color: var(--color-brand); background: color-mix(in srgb, var(--color-brand) 8%, var(--color-bg-card)); }
.ft-list__top { display: flex; justify-content: space-between; gap: 6px; align-items: center; font-size: var(--font-size-md); }
.ft-list__sub { font-size: var(--font-size-sm); color: var(--color-text-secondary); }
.ft-list__meta { display: flex; gap: 8px; font-size: var(--font-size-xs); color: var(--color-text-secondary); }
.ft-detail { display: grid; gap: 12px; min-width: 0; }
.ft-wrap { white-space: normal !important; max-width: 280px; }
.ft-diff { color: var(--color-danger); font-size: var(--font-size-sm); }
.ft-doc-lines input, .ft-doc-lines select { min-width: 70px; }
.ft-doc-lines input[type=number] { width: 86px; }
.ft-unit { width: 56px; min-width: 56px !important; }
.ft-findings { list-style: none; margin: 0; padding: 0; display: grid; gap: 5px; font-size: 12.5px; }
.ft-findings li { display: flex; gap: 6px; align-items: baseline; }
.ft-words { margin: 0; font-family: var(--font-mono); font-size: var(--font-size-sm); }
</style>
