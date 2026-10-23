<template>
  <div class="ss-module">
    <ModuleHeader :meta="meta" />
    <StickyProgress :title="$t('凭证处理')" :metas="metas" :runtime="runtime" :current-key="currentKey" @jump="scrollTo" />
    <p v-if="busy && faProgress.voucher" class="ss-note info"><i class="ri-loader-4-line spin"></i>{{ faProgress.voucher }}</p>

    <div class="ss-steps">
      <!-- ① 上传票据 -->
      <StepCard step-key="upload" :index="0" :title="metas[0].title" :hint="metas[0].hint" :runtime="runtime.upload">
        <FileDrop kind="invoice" :label="$t('上传发票、电子客票、银行回单')" :hint="$t('支持 PDF / OFD / XML 电子发票与图片（图片走本机 OCR），可多选')" :disabled="!!busy" @picked="importDocs" />
        <div v-if="docs.length" class="ss-table-wrap">
          <table class="ss-table fa-docs">
            <thead>
              <tr>
                <th>{{ $t('文件') }}</th><th>{{ $t('类型') }}</th><th>{{ $t('方向') }}</th><th>{{ $t('号码') }}</th><th>{{ $t('日期') }}</th>
                <th>{{ $t('对方') }}</th><th class="num">{{ $t('金额') }}</th><th class="num">{{ $t('税额') }}</th><th class="num">{{ $t('价税合计') }}</th>
                <th>{{ $t('类别') }}</th><th>{{ $t('状态') }}</th><th></th>
              </tr>
            </thead>
            <tbody>
              <template v-for="d in docs" :key="d.id">
                <tr :class="{ bad: d.status === 'flagged', 'fa-open': openId === d.id }" class="fa-row" @click="toggle(d)">
                  <td class="fa-file" :title="d.fileName"><i :class="openId === d.id ? 'ri-arrow-down-s-line' : 'ri-arrow-right-s-line'"></i>{{ d.fileName }}</td>
                  <td>{{ kindLabel(d.kind) }}</td>
                  <td>{{ dirLabel(d.direction) }}</td>
                  <td>{{ d.invoiceNo || '—' }}</td>
                  <td>{{ d.date || '—' }}</td>
                  <td class="fa-ellip" :title="counter(d)">{{ counter(d) || '—' }}</td>
                  <td class="num">{{ fmtMoney(d.amount) }}</td>
                  <td class="num">{{ fmtMoney(d.tax) }}</td>
                  <td class="num">{{ fmtMoney(d.total) }}</td>
                  <td>{{ d.category }}</td>
                  <td><span class="ss-chip" :class="statusChip(d.status)">{{ statusLabel(d.status) }}</span></td>
                  <td><button type="button" class="ss-link" @click.stop="removeDoc(d.id)">{{ $t('删除') }}</button></td>
                </tr>
                <tr v-if="openId === d.id && edit" class="fa-detail-row">
                  <td colspan="12">
                    <div class="fa-detail">
                      <div class="ss-grid">
                        <label class="ss-field"><span>{{ $t('类型') }}</span>
                          <select v-model="edit.kind"><option v-for="k in KINDS" :key="k" :value="k">{{ kindLabel(k) }}</option></select>
                        </label>
                        <label class="ss-field"><span>{{ $t('方向') }}</span>
                          <select v-model="edit.direction"><option value="in">{{ $t('进项') }}</option><option value="out">{{ $t('销项') }}</option><option value="unknown">{{ $t('未判断') }}</option></select>
                        </label>
                        <label class="ss-field"><span>{{ $t('发票号码') }}<em class="fa-src">{{ srcLabel(d, 'invoiceNo') }}</em></span><input v-model.trim="edit.invoiceNo" type="text" /></label>
                        <label class="ss-field"><span>{{ $t('日期') }}<em class="fa-src">{{ srcLabel(d, 'date') }}</em></span><input v-model="edit.date" type="date" /></label>
                        <label class="ss-field"><span>{{ $t('销售方') }}<em class="fa-src">{{ srcLabel(d, 'sellerName') }}</em></span><input v-model.trim="edit.sellerName" type="text" /></label>
                        <label class="ss-field"><span>{{ $t('销售方税号') }}<em class="fa-src">{{ srcLabel(d, 'sellerTaxId') }}</em></span><input v-model.trim="edit.sellerTaxId" type="text" /></label>
                        <label class="ss-field"><span>{{ $t('购买方') }}<em class="fa-src">{{ srcLabel(d, 'buyerName') }}</em></span><input v-model.trim="edit.buyerName" type="text" /></label>
                        <label class="ss-field"><span>{{ $t('购买方税号') }}<em class="fa-src">{{ srcLabel(d, 'buyerTaxId') }}</em></span><input v-model.trim="edit.buyerTaxId" type="text" /></label>
                        <label class="ss-field"><span>{{ $t('金额（不含税）') }}<em class="fa-src">{{ srcLabel(d, 'amount') }}</em></span><input v-model.number="edit.amount" type="number" step="0.01" /></label>
                        <label class="ss-field"><span>{{ $t('税额') }}<em class="fa-src">{{ srcLabel(d, 'tax') }}</em></span><input v-model.number="edit.tax" type="number" step="0.01" /></label>
                        <label class="ss-field"><span>{{ $t('价税合计') }}<em class="fa-src">{{ srcLabel(d, 'total') }}</em></span><input v-model.number="edit.total" type="number" step="0.01" /></label>
                        <label class="ss-field"><span>{{ $t('费用类别') }}</span>
                          <select v-model="edit.category"><option v-for="c in categories" :key="c" :value="c">{{ c }}</option></select>
                        </label>
                        <template v-if="d.kind === 'bank_receipt'">
                          <label class="ss-field"><span>{{ $t('付款方') }}</span><input v-model.trim="edit.payer" type="text" /></label>
                          <label class="ss-field"><span>{{ $t('收款方') }}</span><input v-model.trim="edit.payee" type="text" /></label>
                          <label class="ss-field"><span>{{ $t('用途') }}</span><input v-model.trim="edit.purpose" type="text" /></label>
                        </template>
                      </div>
                      <div class="ss-actions">
                        <button type="button" class="ss-btn primary sm" :disabled="!!busy" @click="saveDoc(d.id)"><i class="ri-save-line"></i>{{ $t('保存并重新校验') }}</button>
                        <button type="button" class="ss-btn ghost sm" @click="openFile(d.path)"><i class="ri-external-link-line"></i>{{ $t('打开原件') }}</button>
                        <span v-if="d.model" class="ss-muted">{{ $t('部分字段由 {p0} 补全（已回原文核对）', { p0: modelLabel(d.model) }) }}</span>
                      </div>
                      <ul class="fa-checks">
                        <li v-for="(c, i) in d.checks" :key="i"><span class="ss-chip" :class="levelChip(c.level)">{{ levelLabel(c.level) }}</span>{{ c.message }}</li>
                      </ul>
                      <details v-if="d.text" class="fa-raw">
                        <summary>{{ d.ocr ? $t('识别原文（本机 OCR）') : $t('识别原文') }}</summary>
                        <pre>{{ d.text }}</pre>
                      </details>
                    </div>
                  </td>
                </tr>
              </template>
            </tbody>
          </table>
        </div>
        <p v-else class="ss-muted">{{ $t('还没有票据。') }}</p>
      </StepCard>

      <!-- ② 识别校验 -->
      <StepCard step-key="check" :index="1" :title="metas[1].title" :hint="metas[1].hint" :runtime="runtime.check">
        <div class="ss-kpis">
          <div class="ss-kpi"><small>{{ $t('票据') }}</small><strong>{{ docs.length }}</strong></div>
          <div class="ss-kpi"><small>{{ $t('异常') }}</small><strong :class="{ 'fa-bad': flagged.length }">{{ flagged.length }}</strong></div>
          <div class="ss-kpi"><small>{{ $t('进项 {n} 张', { n: inDocs.length }) }}</small><strong>{{ fmtMoney(sumTotal(inDocs)) }}</strong></div>
          <div class="ss-kpi"><small>{{ $t('销项 {n} 张', { n: outDocs.length }) }}</small><strong>{{ fmtMoney(sumTotal(outDocs)) }}</strong></div>
          <div class="ss-kpi"><small>{{ $t('已确认') }}</small><strong>{{ docs.filter((d) => d.status === 'confirmed').length }}</strong></div>
        </div>
        <div v-if="flagged.length">
          <div class="ss-subhead">{{ $t('异常票据') }}</div>
          <ul class="fa-flag-list">
            <li v-for="d in flagged" :key="d.id">
              <strong @click="toggle(d)">{{ d.fileName }}</strong>
              <span>{{ d.checks.filter((c) => c.level === 'error').map((c) => c.message).join(' / ') }}</span>
            </li>
          </ul>
        </div>
        <p v-else-if="docs.length" class="ss-note ok"><i class="ri-check-line"></i>{{ $t('没有异常票据') }}</p>
        <div class="ss-actions">
          <button type="button" class="ss-btn primary" :disabled="!!busy || !recognized.length" @click="confirmAll">
            <i :class="busy === 'check' ? 'ri-loader-4-line spin' : 'ri-check-double-line'"></i>{{ $t('无异常的票据全部确认无误（{n} 张）', { n: recognized.length }) }}
          </button>
        </div>
      </StepCard>

      <!-- ③ 生成凭证草稿 -->
      <StepCard step-key="generate" :index="2" :title="metas[2].title" :hint="metas[2].hint" :runtime="runtime.generate">
        <div class="ss-actions">
          <label class="fa-inline"><input v-model="includeFlagged" type="checkbox" />{{ $t('包含异常票据') }}</label>
          <button type="button" class="ss-btn primary" :disabled="!!busy || !pendingDocs.length" @click="generate">
            <i :class="busy === 'generate' ? 'ri-loader-4-line spin' : 'ri-bill-line'"></i>{{ $t('为 {n} 张票据生成凭证', { n: pendingDocs.length }) }}
          </button>
          <span class="ss-muted">{{ $t('分录按固定规则生成（进项专票拆税额、普票全额入费用、销项拆收入与销项税），不经过模型') }}</span>
        </div>
        <ul v-if="skipped.length" class="fa-skipped">
          <li v-for="(s, i) in skipped" :key="i"><i class="ri-information-line"></i>{{ s }}</li>
        </ul>
      </StepCard>

      <!-- ④ 审核凭证 -->
      <StepCard step-key="review" :index="3" :title="metas[3].title" :hint="metas[3].hint" :runtime="runtime.review">
        <div class="ss-actions">
          <label class="ss-field fa-period"><span>{{ $t('期间') }}</span>
            <select v-model="periodFilter"><option value="">{{ $t('全部') }}</option><option v-for="p in periods" :key="p" :value="p">{{ p }}</option></select>
          </label>
          <button type="button" class="ss-btn primary sm" :disabled="!!busy || !selected.length" @click="review(false)"><i class="ri-shield-check-line"></i>{{ $t('审核选中（{n}）', { n: selected.length }) }}</button>
          <button type="button" class="ss-btn ghost sm" :disabled="!!busy || !selected.length" @click="review(true)"><i class="ri-arrow-go-back-line"></i>{{ $t('撤销审核') }}</button>
          <button type="button" class="ss-btn ghost sm" @click="startNew"><i class="ri-add-line"></i>{{ $t('手工新增凭证') }}</button>
          <label class="fa-inline"><input type="checkbox" :checked="allSelected" @change="selectAll(($event.target as HTMLInputElement).checked)" />{{ $t('全选') }}</label>
        </div>

        <!-- 编辑 / 新增 -->
        <div v-if="editing" class="ss-panel fa-vedit">
          <header><strong>{{ editing.id ? $t('编辑凭证 {p0}', { p0: editing.no }) : $t('新增凭证') }}</strong></header>
          <label class="ss-field fa-period"><span>{{ $t('日期') }}</span><input v-model="editing.date" type="date" /></label>
          <table class="ss-table">
            <thead><tr><th>{{ $t('摘要') }}</th><th>{{ $t('科目') }}</th><th>{{ $t('辅助核算') }}</th><th class="num">{{ $t('借方') }}</th><th class="num">{{ $t('贷方') }}</th><th></th></tr></thead>
            <tbody>
              <tr v-for="(l, i) in editing.lines" :key="i">
                <td><input v-model="l.summary" type="text" /></td>
                <td>
                  <select v-model="l.accountCode"><option value="">{{ $t('选择科目') }}</option><option v-for="a in accounts" :key="a.code" :value="a.code">{{ a.code }} {{ a.name }}</option></select>
                </td>
                <td><input v-model="l.aux" type="text" /></td>
                <td><input v-model.number="l.debit" type="number" step="0.01" class="num" /></td>
                <td><input v-model.number="l.credit" type="number" step="0.01" class="num" /></td>
                <td><button type="button" class="ss-link" @click="editing.lines.splice(i, 1)">{{ $t('删行') }}</button></td>
              </tr>
              <tr class="total">
                <td colspan="3">{{ $t('合计') }} <span class="ss-chip" :class="editBalanced ? 'ok' : 'bad'">{{ editBalanced ? $t('借贷平衡') : $t('借贷不平') }}</span></td>
                <td class="num">{{ fmtMoney(editDebit) }}</td><td class="num">{{ fmtMoney(editCredit) }}</td><td></td>
              </tr>
            </tbody>
          </table>
          <div class="ss-actions">
            <button type="button" class="ss-btn ghost sm" @click="editing.lines.push(blankLine())"><i class="ri-add-line"></i>{{ $t('加一行') }}</button>
            <button type="button" class="ss-btn primary sm" :disabled="!!busy || !editBalanced" @click="saveVoucher"><i class="ri-save-line"></i>{{ $t('保存') }}</button>
            <button type="button" class="ss-btn ghost sm" @click="editing = null">{{ $t('取消') }}</button>
          </div>
        </div>

        <div v-for="v in shownVouchers" :key="v.id" class="fa-voucher" :class="{ reviewed: v.status === 'reviewed' }">
          <div class="fa-voucher__head">
            <label class="fa-inline"><input v-model="selected" type="checkbox" :value="v.id" /><strong>{{ v.no }}</strong></label>
            <span>{{ v.date }}</span>
            <span class="ss-chip" :class="v.status === 'reviewed' ? 'ok' : 'warn'">{{ v.status === 'reviewed' ? $t('已审核') : $t('草稿') }}</span>
            <span class="ss-chip" :class="balanced(v) ? 'ok' : 'bad'">{{ balanced(v) ? $t('借贷平衡') : $t('借贷不平') }}</span>
            <span class="ss-muted fa-basis">{{ v.basis }}</span>
            <span class="grow"></span>
            <button type="button" class="ss-link" @click="startEdit(v)">{{ $t('编辑') }}</button>
            <button type="button" class="ss-link" @click="removeVoucher(v.id)">{{ $t('删除') }}</button>
          </div>
          <table class="ss-table">
            <thead><tr><th>{{ $t('摘要') }}</th><th>{{ $t('科目') }}</th><th>{{ $t('辅助核算') }}</th><th class="num">{{ $t('借方') }}</th><th class="num">{{ $t('贷方') }}</th></tr></thead>
            <tbody>
              <tr v-for="(l, i) in v.lines" :key="i">
                <td>{{ l.summary }}</td><td>{{ l.accountCode }} {{ l.accountName }}</td><td>{{ l.aux || '' }}</td>
                <td class="num">{{ l.debit ? fmtMoney(l.debit) : '' }}</td><td class="num">{{ l.credit ? fmtMoney(l.credit) : '' }}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p v-if="!shownVouchers.length" class="ss-muted">{{ $t('还没有凭证。') }}</p>
      </StepCard>

      <!-- ⑤ 导出 -->
      <StepCard step-key="export" :index="4" :title="metas[4].title" :hint="metas[4].hint" :runtime="runtime.export">
        <p class="ss-note info"><i class="ri-information-line"></i>{{ $t('导出的是通用凭证导入格式，由财务导入自己的财务软件；本工作台不改正式账套。') }}</p>
        <div class="ss-actions">
          <label class="ss-field fa-period"><span>{{ $t('期间') }}</span>
            <select v-model="exportPeriod"><option value="">{{ $t('全部') }}</option><option v-for="p in periods" :key="p" :value="p">{{ p }}</option></select>
          </label>
          <label class="fa-inline"><input v-model="onlyReviewed" type="checkbox" />{{ $t('只导出已审核') }}</label>
          <button type="button" class="ss-btn primary" :disabled="!!busy || !vouchers.length" @click="exportVouchers">
            <i :class="busy === 'export' ? 'ri-loader-4-line spin' : 'ri-file-excel-2-line'"></i>{{ $t('导出凭证与识别校验报告') }}
          </button>
        </div>
        <div v-if="exported" class="ss-actions">
          <code class="fa-path">{{ exported }}</code>
          <button type="button" class="ss-btn ghost sm" @click="openFile(exported)"><i class="ri-external-link-line"></i>{{ $t('打开') }}</button>
          <button type="button" class="ss-btn ghost sm" @click="openFile(exported, true)"><i class="ri-folder-line"></i>{{ $t('在文件夹中显示') }}</button>
        </div>
      </StepCard>
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * 凭证处理智能体：上传票据 → 识别校验 → 生成凭证草稿 → 人工审核 → 导出导入文件。
 */
import { computed, ref, watch } from 'vue';
import type { FaAccount, FaDoc, FaDocKind, FaVoucher, FaVoucherLine } from '@totalclaw/ipc-contracts';
import { useNotificationStore } from '../../stores/notification';
import { t as i18nT } from '../../i18n';
import StepCard from '../service-settlement/StepCard.vue';
import StickyProgress from '../service-settlement/StickyProgress.vue';
import ModuleHeader from './ModuleHeader.vue';
import FileDrop from './FileDrop.vue';
import {
  errorMessage, fa, faProgress, faState, fmtMoney, levelChip, levelLabel, modelLabel, openPath, refreshState, scrollToStep,
  type FaModuleMeta, type StepMeta, type StepRuntime,
} from './shared';

defineProps<{ meta: FaModuleMeta; focus?: any }>();
defineEmits<{ (e: 'goto', module: string, payload?: any): void }>();
const notif = useNotificationStore();

const KINDS: FaDocKind[] = ['vat_special', 'vat_normal', 'e_ticket', 'bank_receipt', 'receipt', 'other'];
const busy = ref('');
const errors = ref<Record<string, string>>({});
const openId = ref('');
const edit = ref<Partial<FaDoc> | null>(null);
const includeFlagged = ref(false);
const skipped = ref<string[]>([]);
const generatedOnce = ref(false);
const selected = ref<string[]>([]);
const periodFilter = ref('');
const exportPeriod = ref('');
const onlyReviewed = ref(false);
const exported = ref('');
const accounts = ref<FaAccount[]>([]);
type EditVoucher = { id?: string; no?: string; date: string; lines: Array<Omit<FaVoucherLine, 'accountName'> & { accountName?: string }> };
const editing = ref<EditVoucher | null>(null);

const data = computed(() => faState.value?.data);
const docs = computed(() => (data.value?.docs || []).filter((d) => !d.claimId));
const vouchers = computed(() => [...(data.value?.vouchers || [])].sort((a, b) => a.date.localeCompare(b.date) || a.no.localeCompare(b.no)));
const flagged = computed(() => docs.value.filter((d) => d.status === 'flagged'));
const recognized = computed(() => docs.value.filter((d) => d.status === 'recognized'));
const inDocs = computed(() => docs.value.filter((d) => d.direction === 'in'));
const outDocs = computed(() => docs.value.filter((d) => d.direction === 'out'));
const pendingDocs = computed(() => docs.value.filter((d) => !d.voucherId && (includeFlagged.value || d.status !== 'flagged')));
const periods = computed(() => [...new Set(vouchers.value.map((v) => v.period).filter(Boolean))].sort().reverse());
const shownVouchers = computed(() => vouchers.value.filter((v) => !periodFilter.value || v.period === periodFilter.value));
const allSelected = computed(() => shownVouchers.value.length > 0 && shownVouchers.value.every((v) => selected.value.includes(v.id)));
const categories = computed(() => {
  const set = new Set<string>();
  for (const c of faState.value?.categories || []) set.add(c);
  for (const r of faState.value?.settings.expense.rules || []) set.add(r.category);
  for (const d of data.value?.docs || []) if (d.category) set.add(d.category);
  return [...set];
});

const editDebit = computed(() => (editing.value?.lines || []).reduce((s, l) => s + Math.round((Number(l.debit) || 0) * 100), 0) / 100);
const editCredit = computed(() => (editing.value?.lines || []).reduce((s, l) => s + Math.round((Number(l.credit) || 0) * 100), 0) / 100);
const editBalanced = computed(() => (editing.value?.lines.length || 0) >= 2 && Math.abs(editDebit.value - editCredit.value) < 0.005 && editDebit.value > 0);

const metas: StepMeta[] = [
  { key: 'upload', title: i18nT('上传票据'), hint: i18nT('发票、电子客票、银行回单，版式规则读字段，读不全的交给模型补并回原文核对') },
  { key: 'check', title: i18nT('识别校验'), hint: i18nT('金额与税额、税号校验位、抬头、重复票、日期逐张校验') },
  { key: 'generate', title: i18nT('生成凭证草稿'), hint: i18nT('按固定分录规则生成记账凭证草稿') },
  { key: 'review', title: i18nT('审核凭证'), hint: i18nT('财务逐张核对分录，改完审核') },
  { key: 'export', title: i18nT('导出'), hint: i18nT('凭证导入文件 + 识别校验报告 + 异常票据清单') },
];
const runtime = computed<Record<string, StepRuntime>>(() => {
  const st = (key: string, done: boolean, summary?: string): StepRuntime => (busy.value === key
    ? { state: 'running' }
    : errors.value[key] ? { state: 'failed', error: errors.value[key] }
      : done ? { state: 'done', summary } : { state: 'todo' });
  const reviewed = vouchers.value.filter((v) => v.status === 'reviewed').length;
  return {
    upload: st('upload', docs.value.length > 0, i18nT('{n} 张票据', { n: docs.value.length })),
    check: st('check', docs.value.length > 0 && !recognized.value.length, i18nT('{a} 张已确认，{b} 张异常', { a: docs.value.filter((d) => d.status === 'confirmed').length, b: flagged.value.length })),
    generate: st('generate', vouchers.value.length > 0 && (generatedOnce.value || !pendingDocs.value.length), i18nT('{n} 张凭证草稿', { n: vouchers.value.length })),
    review: st('review', vouchers.value.length > 0 && reviewed === vouchers.value.length, i18nT('{n} 张已审核', { n: reviewed })),
    export: st('export', !!exported.value, exported.value),
  };
});
const currentKey = computed(() => metas.find((m) => runtime.value[m.key].state !== 'done')?.key || 'export');

watch(openId, (id) => {
  const d = docs.value.find((x) => x.id === id);
  edit.value = d ? { kind: d.kind, direction: d.direction, invoiceNo: d.invoiceNo, date: d.date, sellerName: d.sellerName, sellerTaxId: d.sellerTaxId, buyerName: d.buyerName, buyerTaxId: d.buyerTaxId, amount: d.amount, tax: d.tax, total: d.total, category: d.category, payer: d.payer, payee: d.payee, purpose: d.purpose } : null;
});

function kindLabel(k: FaDocKind): string {
  return { vat_special: i18nT('专票'), vat_normal: i18nT('普票'), e_ticket: i18nT('客票'), bank_receipt: i18nT('回单'), receipt: i18nT('收据'), other: i18nT('其他') }[k];
}
function dirLabel(d: string): string {
  return d === 'in' ? i18nT('进项') : d === 'out' ? i18nT('销项') : '—';
}
function statusLabel(s: FaDoc['status']): string {
  return { recognized: i18nT('已识别'), confirmed: i18nT('已确认'), flagged: i18nT('异常') }[s];
}
function statusChip(s: FaDoc['status']): string {
  return s === 'flagged' ? 'bad' : s === 'confirmed' ? 'ok' : 'warn';
}
function srcLabel(d: FaDoc, f: string): string {
  const s = d.fieldSource?.[f];
  return s === 'rule' ? i18nT('规则') : s === 'model' ? i18nT('模型') : s === 'manual' ? i18nT('手工') : '';
}
function counter(d: FaDoc): string {
  if (d.kind === 'bank_receipt') return d.direction === 'in' ? d.payee || '' : d.payer || '';
  return d.direction === 'out' ? d.buyerName || '' : d.sellerName || '';
}
function sumTotal(list: FaDoc[]): number {
  return list.reduce((s, d) => s + Math.round(d.total * 100), 0) / 100;
}
function balanced(v: FaVoucher): boolean {
  const dr = v.lines.reduce((s, l) => s + Math.round(l.debit * 100), 0);
  const cr = v.lines.reduce((s, l) => s + Math.round(l.credit * 100), 0);
  return dr === cr;
}
function toggle(d: FaDoc): void { openId.value = openId.value === d.id ? '' : d.id; }
function blankLine() { return { summary: '', accountCode: '', debit: 0, credit: 0, aux: '' }; }

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

async function importDocs(paths: string[]): Promise<void> {
  await run('upload', async () => {
    const r = await fa<{ count: number; flagged: number }>('doc.import', { paths });
    if (r.count < paths.length) throw new Error(i18nT('{a} 个文件里识别了 {b} 个，其余见进度提示', { a: paths.length, b: r.count }));
    if (r.flagged) notif.warn(i18nT('{n} 张票据有异常，请在第 2 步处理', { n: r.flagged }));
  });
}
async function saveDoc(id: string): Promise<void> {
  if (!edit.value) return;
  await run('check', () => fa('doc.update', { id, patch: edit.value }));
}
async function removeDoc(id: string): Promise<void> {
  if (!window.confirm(i18nT('删除这张票据？对应的凭证草稿会一起删除。'))) return;
  await run('upload', () => fa('doc.remove', { id }));
  if (openId.value === id) openId.value = '';
}
async function confirmAll(): Promise<void> {
  await run('check', async () => {
    for (const d of recognized.value) await fa('doc.update', { id: d.id, patch: { status: 'confirmed' } });
  });
}
async function generate(): Promise<void> {
  await run('generate', async () => {
    const r = await fa<{ created: number; skipped: string[] }>('voucher.generate', { includeFlagged: includeFlagged.value });
    skipped.value = r.skipped || [];
    generatedOnce.value = true;
  });
}
async function review(undo: boolean): Promise<void> {
  const ids = [...selected.value];
  await run('review', () => fa('voucher.review', { ids, undo }));
  selected.value = [];
}
function selectAll(on: boolean): void {
  selected.value = on ? shownVouchers.value.map((v) => v.id) : [];
}
async function ensureAccounts(): Promise<void> {
  if (!accounts.value.length) accounts.value = await fa<FaAccount[]>('accounts.list');
}
async function startEdit(v: FaVoucher): Promise<void> {
  await ensureAccounts();
  editing.value = { id: v.id, no: v.no, date: v.date, lines: v.lines.map((l) => ({ ...l, aux: l.aux || '' })) };
}
async function startNew(): Promise<void> {
  await ensureAccounts();
  editing.value = { date: new Date().toISOString().slice(0, 10), lines: [blankLine(), blankLine()] };
}
async function saveVoucher(): Promise<void> {
  const e = editing.value;
  if (!e) return;
  const ok = await run('review', () => (e.id ? fa('voucher.update', { id: e.id, date: e.date, lines: e.lines }) : fa('voucher.create', { date: e.date, lines: e.lines })));
  if (ok) editing.value = null;
}
async function removeVoucher(id: string): Promise<void> {
  if (!window.confirm(i18nT('删除这张凭证？'))) return;
  await run('review', () => fa('voucher.remove', { id }));
  selected.value = selected.value.filter((x) => x !== id);
}
async function exportVouchers(): Promise<void> {
  await run('export', async () => {
    const r = await fa<{ path: string; vouchers: number }>('voucher.export', { period: exportPeriod.value || undefined, onlyReviewed: onlyReviewed.value });
    exported.value = r.path;
  });
}
function openFile(path: string, reveal = false): void {
  openPath(path, reveal).catch((e) => notif.error(errorMessage(e)));
}
function scrollTo(key: string): void { void scrollToStep(key); }
</script>

<style scoped>
.fa-docs td { white-space: nowrap; }
.fa-row { cursor: pointer; }
.fa-row.fa-open td { background: color-mix(in srgb, var(--color-brand) 6%, transparent); }
.fa-file { max-width: 220px; overflow: hidden; text-overflow: ellipsis; }
.fa-file i { margin-inline-end: 4px; color: var(--color-text-secondary); }
.fa-ellip { max-width: 180px; overflow: hidden; text-overflow: ellipsis; }
.fa-detail-row td { white-space: normal; background: var(--color-bg-primary); }
.fa-detail { display: grid; gap: 10px; padding: 6px 2px; }
.fa-src { font-style: normal; font-size: 10.5px; color: var(--color-brand); margin-inline-start: 6px; }
.fa-checks { list-style: none; margin: 0; padding: 0; display: grid; gap: 4px; font-size: 12.5px; }
.fa-checks li { display: flex; gap: 6px; align-items: center; }
.fa-raw pre { white-space: pre-wrap; font-size: 11.5px; max-height: 260px; overflow: auto; background: var(--color-bg-card); padding: 8px; border-radius: var(--radius-3); }
.fa-bad { color: var(--color-danger); }
.fa-flag-list { list-style: none; margin: 6px 0 0; padding: 0; display: grid; gap: 4px; font-size: 12.5px; }
.fa-flag-list li { display: flex; gap: 8px; }
.fa-flag-list strong { cursor: pointer; color: var(--color-brand); }
.fa-inline { display: inline-flex; gap: 6px; align-items: center; font-size: 12.5px; }
.fa-skipped { list-style: none; margin: 0; padding: 0; display: grid; gap: 4px; font-size: 12.5px; color: var(--color-text-secondary); }
.fa-skipped i { color: var(--color-warning); margin-inline-end: 4px; }
.fa-period { max-width: 200px; }
.fa-vedit { border-color: var(--color-brand); }
.fa-vedit input, .fa-vedit select { width: 100%; box-sizing: border-box; }
.fa-voucher { border: 1px solid var(--color-border); border-radius: var(--radius-5); padding: 8px 10px; display: grid; gap: 6px; background: var(--color-bg-card); }
.fa-voucher.reviewed { border-color: color-mix(in srgb, var(--color-success) 50%, var(--color-border)); }
.fa-voucher__head { display: flex; gap: 8px; align-items: center; flex-wrap: wrap; font-size: 12.5px; }
.fa-basis { font-size: 11.5px; }
.grow { flex: 1; }
.fa-path { flex: 1; min-width: 200px; font-size: var(--font-size-sm); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; color: var(--color-text-secondary); }
</style>
