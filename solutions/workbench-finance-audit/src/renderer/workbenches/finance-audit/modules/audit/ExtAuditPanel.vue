<template>
  <div v-if="res" class="fau-audit" data-test="fau-ea-panel">
    <section v-if="res.mode === 'support'" class="fau-sec" data-test="fau-ea-support">
      <header>
        <strong class="grow">{{ $t('资料清单与审计调整') }}</strong>
        <label class="fau-row"><span class="ss-muted">{{ $t('重要性水平') }}</span><input v-model.number="materiality" type="number" min="0" :disabled="!editable" data-test="fau-ea-materiality" /></label>
        <button type="button" class="ss-btn sm" :disabled="busy || !editable" @click="setParams({ materiality: Number(materiality) || 0 })">{{ $t('按重要性水平重算') }}</button>
      </header>
      <div class="fau-counts">
        <span v-for="s in PBC_STATES" :key="s" class="fau-badge" :class="s === 'provided' ? 'ok' : s === 'overdue' ? 'bad' : 'muted'">{{ $t(PBC_STATUS_LABEL[s]) }} <FauNum :value="(res.pbc || []).filter((x) => x.status === s).length" /></span>
      </div>
      <details :open="!!res.pbc?.length">
        <summary>{{ $t('PBC 进度') }}</summary>
        <div class="fau-table-wrap">
          <table class="fau-table">
            <thead><tr><th>{{ $t('编号') }}</th><th>{{ $t('资料名称') }}</th><th>{{ $t('负责人') }}</th><th>{{ $t('截止日期') }}</th><th>{{ $t('状态') }}</th></tr></thead>
            <tbody><tr v-for="x in res.pbc || []" :key="x.id" :class="{ bad: x.status === 'overdue' }"><td><FauNum :value="x.id" /></td><td class="wrap">{{ x.item }}</td><td>{{ x.owner }}</td><td><FauNum :value="x.dueDate" /></td><td>{{ $t(PBC_STATUS_LABEL[x.status]) }}</td></tr></tbody>
          </table>
        </div>
      </details>
      <div v-if="res.adjustments?.length" class="fau-table-wrap" data-test="fau-ea-adjustments">
        <table class="fau-table">
          <thead><tr><th>{{ $t('凭证号') }}</th><th>{{ $t('摘要') }}</th><th class="num">{{ $t('利润影响') }}</th><th class="num">{{ $t('资产影响') }}</th><th class="num">{{ $t('负债影响') }}</th><th class="num">{{ $t('权益影响') }}</th><th>{{ $t('超过重要性水平') }}</th></tr></thead>
          <tbody>
            <tr v-for="a in res.adjustments" :key="a.voucherNo" :class="{ bad: a.exceedsMateriality || !a.balanced }" :data-test="`fau-ea-adj-${a.voucherNo}`">
              <td><FauNum :value="a.voucherNo" /></td><td class="wrap">{{ a.summary }}</td><td class="num"><FauNum :cents="a.profitImpact" /></td><td class="num"><FauNum :cents="a.assetImpact" /></td><td class="num"><FauNum :cents="a.liabilityImpact" /></td><td class="num"><FauNum :cents="a.equityImpact" /></td><td>{{ a.exceedsMateriality ? $t('是') : '' }}</td>
            </tr>
            <tr v-if="res.adjustmentTotals"><td colspan="2"><strong>{{ $t('合计') }}</strong></td><td class="num"><strong><FauNum :cents="res.adjustmentTotals.profit" /></strong></td><td class="num"><FauNum :cents="res.adjustmentTotals.assets" /></td><td class="num"><FauNum :cents="res.adjustmentTotals.liabilities" /></td><td class="num"><FauNum :cents="res.adjustmentTotals.equity" /></td><td></td></tr>
          </tbody>
        </table>
      </div>
    </section>

    <section v-if="res.confirmations" class="fau-sec" data-test="fau-ea-confirmations">
      <header>
        <strong class="grow">{{ $t('函证控制表') }}</strong>
        <span v-if="res.responseRate !== null && res.responseRate !== undefined" class="fau-badge">{{ $t('回函率') }} <FauNum :ratio="res.responseRate" /></span>
        <template v-if="res.mode === 'confirm_prepare'">
          <span v-if="run.status !== 'archived'" class="fau-badge warn" data-test="fau-ea-send-locked">{{ $t('签核归档后才能发送') }}</span>
          <button v-else type="button" class="ss-btn sm primary" :disabled="busy" data-test="fau-ea-send" @click="prepare"><i class="ri-mail-send-line fau-dir-icon"></i>{{ $t('发送函证') }}</button>
        </template>
      </header>
      <p class="ss-note info"><i class="ri-shield-check-line"></i>{{ $t('函证只生成草稿，不会自动发送；签核归档后由人点「发送」并在确认框确认') }}</p>
      <div class="fau-table-wrap">
        <table class="fau-table">
          <thead><tr><th>{{ $t('函证编号') }}</th><th>{{ $t('类型') }}</th><th>{{ $t('函证对象') }}</th><th>{{ $t('邮箱') }}</th><th class="num">{{ $t('账面金额') }}</th><th class="num">{{ $t('回函金额') }}</th><th class="num">{{ $t('差额') }}</th><th>{{ $t('状态') }}</th><th>{{ $t('替代程序') }}</th></tr></thead>
          <tbody>
            <tr v-for="c in res.confirmations" :key="c.id" :class="{ bad: c.status === 'replied_diff' || c.status === 'no_reply' }" :data-test="`fau-conf-${c.id}`">
              <td><FauNum :value="c.id" /></td><td>{{ $t(CONFIRM_TYPE_LABEL[c.type]) }}</td><td>{{ c.party }}</td><td><FauNum :value="c.email" /></td>
              <td class="num"><FauNum :cents="c.bookAmount" /></td><td class="num"><FauNum :cents="c.replyAmount" /></td><td class="num"><FauNum :cents="c.diff" /></td>
              <td><span class="fau-badge" :class="STATUS_CLASS[c.status]" :data-test="`fau-conf-status-${c.id}`">{{ $t(CONFIRM_STATUS_LABEL[c.status]) }}</span><span v-if="sentIds.has(c.id)" class="fau-badge ok">{{ $t('已发送') }}</span></td>
              <td class="wrap">{{ c.alternative.map((a) => $t(a)).join(sep) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <div v-if="preview" class="fau-modal-mask" data-test="fau-ea-confirm-dialog" @click.self="preview = null">
      <div class="fau-modal" role="dialog" aria-modal="true">
        <h3>{{ $t('确认发送函证') }}</h3>
        <p class="ss-note warn"><i class="ri-error-warning-line"></i>{{ $t('以下函证将以邮件发给对方，附件是签核归档时的询证函副本。发出后不能撤回。') }}</p>
        <p v-if="preview.via === 'official'" class="ss-muted">{{ $t('你没有配置自己的发信邮箱，将由官方代发；对方回信不会直接到你的邮箱') }}</p>
        <ul class="fau-list">
          <li v-for="it in preview.items" :key="it.id" :data-test="`fau-ea-send-item-${it.id}`"><FauNum :value="it.id" /><span class="grow">{{ it.party }} · <FauNum :value="it.email" /></span><small class="ss-muted">{{ it.attachment }}</small></li>
        </ul>
        <ul v-if="preview.blocked.length" class="fau-esc"><li v-for="(b, i) in preview.blocked" :key="i"><i class="ri-forbid-line"></i>{{ msg(b) }}</li></ul>
        <div class="ss-actions">
          <button type="button" class="ss-btn primary" :disabled="busy || !preview.items.length" data-test="fau-ea-send-confirm" @click="send">{{ $t('确认发送 {n} 份', { n: preview.items.length }) }}</button>
          <button type="button" class="ss-btn ghost" @click="preview = null">{{ $t('取消') }}</button>
        </div>
      </div>
    </div>
    <p v-if="sentMsg" class="ss-note ok" data-test="fau-ea-sent"><i class="ri-mail-check-line"></i>{{ sentMsg }}</p>
    <p v-if="error" class="ss-note danger"><i class="ri-error-warning-line"></i>{{ error }}</p>
  </div>
</template>

<script setup lang="ts">
/**
 * B3 外审配合与函证：第 ④ 步结果。函证发送是受保护的例外：只在签核归档后出现「发送函证」，
 * 主进程先出预览并签发一次性令牌，人在确认框里点「确认发送」才真正发出。
 */
import { computed, onMounted, ref } from 'vue';
import type { FauConfirmSendPreview, FauConfirmStatus, FauExtAuditResult, FauModuleDef, FauRun } from '@totalclaw/ipc-contracts';
import { listSeparator, t as i18nT } from '../../../../i18n';
import { CONFIRM_STATUS_LABEL, CONFIRM_TYPE_LABEL, PBC_STATUS_LABEL } from '../../../../../shared/financeAudit/auditLabels';
import FauNum from '../../FauNum.vue';
import { errorMessage, fau, msg } from '../../shared';
import './audit.css';

const props = defineProps<{ run: FauRun; def: FauModuleDef }>();
const emit = defineEmits<{ (e: 'changed'): void }>();
const res = computed(() => props.run.result as FauExtAuditResult | undefined);
const editable = computed(() => !['signing', 'archived', 'void'].includes(props.run.status));
const busy = ref(false);
const error = ref('');
const sentMsg = ref('');
const materiality = ref<number>((res.value?.materiality || 0) / 100);
const preview = ref<FauConfirmSendPreview | null>(null);
const sent = ref<{ id: string; ok: boolean }[]>([]);
const sentIds = computed(() => new Set(sent.value.filter((s) => s.ok).map((s) => s.id)));
const sep = listSeparator();
const PBC_STATES = ['provided', 'requested', 'overdue'] as const;
const STATUS_CLASS: Record<FauConfirmStatus, string> = { draft: 'muted', sent: 'warn', replied_match: 'ok', replied_diff: 'bad', no_reply: 'bad' };

async function guarded(fn: () => Promise<unknown>): Promise<void> {
  busy.value = true; error.value = '';
  try { await fn(); } catch (e) { error.value = errorMessage(e); } finally { busy.value = false; }
}
const setParams = (params: Record<string, unknown>) => guarded(async () => { await fau('audit.params.set', { runId: props.run.id, moduleId: 'ext-audit', params }); emit('changed'); });
const loadSent = async () => { if (res.value?.mode === 'confirm_prepare') sent.value = await fau('ext-audit.confirm.sentLog', { runId: props.run.id }); };
const prepare = () => guarded(async () => { preview.value = await fau<FauConfirmSendPreview>('ext-audit.confirm.prepareSend', { runId: props.run.id }); });
const send = () => guarded(async () => {
  const p = preview.value;
  if (!p) return;
  const r = await fau<{ id: string; ok: boolean }[]>('ext-audit.confirm.send', { runId: props.run.id, token: p.token });
  preview.value = null;
  sentMsg.value = i18nT('已发送 {n} 份，失败 {m} 份', { n: r.filter((x) => x.ok).length, m: r.filter((x) => !x.ok).length });
  await loadSent();
  emit('changed');
});
onMounted(() => { void loadSent().catch(() => {}); });
</script>
