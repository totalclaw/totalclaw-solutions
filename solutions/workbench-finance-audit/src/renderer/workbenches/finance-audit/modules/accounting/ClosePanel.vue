<template>
  <div v-if="res" class="fau-close" data-test="fau-close-panel">
    <details v-if="res.checklist" open class="fau-sec" data-test="fau-checklist">
      <summary>
        {{ $t('关账清单') }}
        <span class="fau-badge" :class="res.checklist.canStart ? 'ok' : 'warn'">{{ res.checklist.canStart ? $t('可以开始结账') : $t('暂不能开始结账') }}</span>
        <small class="ss-muted">{{ $t('通过 {a} · 提醒 {b} · 不通过 {c} · 待评 {d}', { a: res.checklist.counts.ok, b: res.checklist.counts.warn, c: res.checklist.counts.fail, d: res.checklist.counts.pending }) }}</small>
      </summary>
      <ul v-if="res.checklist.reasons.length" class="fau-prov">
        <li v-for="(r, i) in res.checklist.reasons" :key="i">{{ msg(r) }}</li>
      </ul>
      <div class="fau-table-wrap">
        <table class="fau-table">
          <thead><tr><th>#</th><th>{{ $t('检查项') }}</th><th>{{ $t('判断方式') }}</th><th>{{ $t('结果') }}</th><th>{{ $t('证据 / 说明') }}</th></tr></thead>
          <tbody>
            <tr v-for="(it, i) in res.checklist.items" :key="it.id" :class="{ bad: it.mark === 'fail', warn: it.mark === 'warn' }">
              <td>{{ i + 1 }}</td>
              <td class="wrap">{{ msg(it.label) }} <span v-if="it.critical" class="fau-badge muted">{{ $t('关键项') }}</span></td>
              <td>{{ it.auto ? $t('自动') : $t('人工') }}</td>
              <td>
                <select :value="it.mark" :disabled="locked || busy" :data-test="`fau-mark-${it.id}`" @change="update(it.id, ($event.target as HTMLSelectElement).value, it.evidence)">
                  <option v-for="(label, k) in MARK_LABEL" :key="k" :value="k">{{ $t(label) }}</option>
                </select>
              </td>
              <td class="wrap">
                <span v-if="it.note" class="ss-muted">{{ msg(it.note) }} </span>
                <input v-if="!it.auto" :value="it.evidence || ''" :disabled="locked || busy" :placeholder="$t('证据（凭证号、文件名…）')" @change="update(it.id, it.mark, ($event.target as HTMLInputElement).value)" />
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <p v-if="error" class="ss-note danger"><i class="ri-error-warning-line"></i>{{ error }}</p>
    </details>

    <details v-if="res.trial" open class="fau-sec" data-test="fau-trial">
      <summary>{{ $t('试算与勾稽') }} <span class="fau-badge" :class="res.trial.balanced ? 'ok' : 'bad'">{{ res.trial.balanced ? $t('试算平衡') : $t('试算不平') }}</span></summary>
      <div class="fau-table-wrap">
        <table class="fau-table">
          <thead><tr><th>{{ $t('项目') }}</th><th class="num">{{ $t('借方') }}</th><th class="num">{{ $t('贷方') }}</th></tr></thead>
          <tbody>
            <tr><td>{{ $t('期初余额') }}</td><td class="num"><FauNum :cents="res.trial.totals.openingDr" /></td><td class="num"><FauNum :cents="res.trial.totals.openingCr" /></td></tr>
            <tr><td>{{ $t('本期发生额') }}</td><td class="num"><FauNum :cents="res.trial.totals.periodDr" /></td><td class="num"><FauNum :cents="res.trial.totals.periodCr" /></td></tr>
            <tr><td>{{ $t('期末余额') }}</td><td class="num"><FauNum :cents="res.trial.totals.closingDr" /></td><td class="num"><FauNum :cents="res.trial.totals.closingCr" /></td></tr>
          </tbody>
        </table>
      </div>
      <div class="fau-table-wrap">
        <table class="fau-table">
          <thead><tr><th>{{ $t('检查项') }}</th><th class="num">{{ $t('左边') }}</th><th class="num">{{ $t('右边') }}</th><th class="num">{{ $t('差额') }}</th><th>{{ $t('结果') }}</th></tr></thead>
          <tbody>
            <tr v-for="c in res.trial.checks" :key="c.id" :class="{ bad: !c.ok }" :data-test="`fau-tie-${c.id}`">
              <td class="wrap">{{ $t(TIE_LABEL[c.id] || c.id) }}<br><small class="ss-muted">{{ msg(c.message) }}</small></td>
              <td class="num"><FauNum :cents="c.left" /></td>
              <td class="num"><FauNum :cents="c.right" /></td>
              <td class="num"><FauNum :cents="c.diff" /></td>
              <td><span :class="c.ok ? 'fau-true' : 'fau-false'">{{ c.ok ? 'TRUE' : 'FALSE' }}</span></td>
            </tr>
          </tbody>
        </table>
      </div>
    </details>

    <details v-if="res.crossPeriod" :open="!!res.crossPeriod.length" class="fau-sec" data-test="fau-cross">
      <summary>{{ $t('跨期调整') }} <span class="fau-badge" :class="res.crossPeriod.length ? 'warn' : 'muted'">{{ res.crossPeriod.length }}</span></summary>
      <div v-if="res.crossPeriod.length" class="fau-table-wrap">
        <table class="fau-table">
          <thead><tr><th>{{ $t('凭证号') }}</th><th>{{ $t('记账日期') }}</th><th>{{ $t('业务日期') }}</th><th>{{ $t('科目') }}</th><th class="num">{{ $t('金额') }}</th><th>{{ $t('类型') }}</th><th class="num">{{ $t('天数') }}</th><th>{{ $t('审批层级') }}</th><th>{{ $t('建议') }}</th></tr></thead>
          <tbody>
            <tr v-for="x in res.crossPeriod" :key="x.id" :class="{ warn: x.adjustThisPeriod, bad: x.approval === 'approver' }" :data-test="`fau-cross-${x.voucherNo}`">
              <td><FauNum :value="x.voucherNo" /></td>
              <td><FauNum :value="x.date" /></td>
              <td><FauNum :value="x.businessDate" /></td>
              <td><FauNum :value="x.accountCode" /> {{ x.accountName }}</td>
              <td class="num"><FauNum :cents="x.amount" /></td>
              <td>{{ $t(CROSS_LABEL[x.type]) }}</td>
              <td class="num"><FauNum :value="x.days" /></td>
              <td>{{ $t(APPROVAL_LABEL[x.approval]) }}<span v-if="x.adjustThisPeriod" class="fau-badge warn">{{ $t('必须本期调整') }}</span></td>
              <td class="wrap">{{ msg(x.advice) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <p v-else class="ss-muted">{{ $t('没有识别到跨期分录') }}</p>
    </details>

    <details v-if="res.accruals" open class="fau-sec" data-test="fau-accruals">
      <summary>{{ $t('计提表') }} <span class="fau-badge muted">{{ res.accruals.length }}</span></summary>
      <div class="ss-actions">
        <button type="button" class="ss-btn sm" :disabled="busy" @click="template"><i class="ri-download-2-line"></i>{{ $t('下载计提政策表模板') }}</button>
        <button v-for="r in reuse" :key="r.workbench" type="button" class="ss-btn sm ghost" @click="router.push(r.route || '/')"><i class="ri-external-link-line"></i>{{ $t(r.label || '') }}</button>
      </div>
      <div v-if="res.accruals.length" class="fau-table-wrap">
        <table class="fau-table">
          <thead><tr><th>{{ $t('政策编号') }}</th><th>{{ $t('计提项目') }}</th><th>{{ $t('费用科目') }}</th><th>{{ $t('负债科目') }}</th><th class="num">{{ $t('本期应摊') }}</th><th class="num">{{ $t('已入账') }}</th><th class="num">{{ $t('本期计提') }}</th><th>{{ $t('算式') }}</th><th>{{ $t('自动冲回') }}</th></tr></thead>
          <tbody>
            <tr v-for="a in res.accruals" :key="a.policyId" :data-test="`fau-accrual-${a.policyId}`">
              <td><FauNum :value="a.policyId" /></td>
              <td>{{ a.description }}</td>
              <td><FauNum :value="a.expenseAccount" /></td>
              <td><FauNum :value="a.liabilityAccount" /></td>
              <td class="num"><FauNum :cents="a.due" /></td>
              <td class="num"><FauNum :cents="a.booked" /></td>
              <td class="num"><strong><FauNum :cents="a.accrual" /></strong></td>
              <td><FauNum :value="a.formula" /></td>
              <td>{{ a.autoReverse ? $t('是') : $t('否') }}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <p v-if="res.jeDraft?.length" class="ss-muted">{{ $t('已生成分录草稿 {n} 行（通用凭证导入格式，不过账）', { n: res.jeDraft.length }) }}</p>
    </details>

    <details v-if="res.rollForward" open class="fau-sec" data-test="fau-roll">
      <summary>{{ $t('滚动表') }} <span class="fau-badge" :class="unexplained ? 'bad' : 'ok'">{{ unexplained ? $t('{n} 个科目有未解释差异', { n: unexplained }) : $t('全部轧平') }}</span></summary>
      <p class="ss-muted">{{ $t('期初 + 增加 + 计提 − 冲回 − 付款 ± 重分类 ± 折算 = 期末；轧不平的差额列为「未解释差异」，未倒挤。') }}</p>
      <div class="fau-table-wrap">
        <table class="fau-table">
          <thead><tr><th>{{ $t('科目') }}</th><th class="num">{{ $t('期初') }}</th><th class="num">{{ $t('增加') }}</th><th class="num">{{ $t('计提') }}</th><th class="num">{{ $t('冲回') }}</th><th class="num">{{ $t('付款') }}</th><th class="num">{{ $t('其他') }}</th><th class="num">{{ $t('计算期末') }}</th><th class="num">{{ $t('余额表期末') }}</th><th class="num">{{ $t('未解释差异') }}</th></tr></thead>
          <tbody>
            <tr v-for="r in res.rollForward" :key="r.accountCode" :class="{ bad: r.unexplained !== 0 }" :data-test="`fau-roll-${r.accountCode}`">
              <td><FauNum :value="r.accountCode" /> {{ r.accountName }}</td>
              <td class="num"><FauNum :cents="r.opening" /></td>
              <td class="num"><FauNum :cents="r.additions" /></td>
              <td class="num"><FauNum :cents="r.accruals" /></td>
              <td class="num"><FauNum :cents="r.reversals" /></td>
              <td class="num"><FauNum :cents="r.payments" /></td>
              <td class="num"><FauNum :cents="r.other + r.reclass + r.fx" /></td>
              <td class="num"><FauNum :cents="r.computed" /></td>
              <td class="num"><FauNum :cents="r.closing" /></td>
              <td class="num"><strong><FauNum :cents="r.unexplained" /></strong></td>
            </tr>
          </tbody>
        </table>
      </div>
    </details>

    <details v-if="res.flux" open class="fau-sec" data-test="fau-flux">
      <summary>{{ $t('波动说明') }} <span class="fau-badge muted">{{ res.flux.length }}</span></summary>
      <div class="fau-table-wrap">
        <table class="fau-table">
          <thead><tr><th>{{ $t('科目') }}</th><th class="num">{{ $t('本期') }}</th><th class="num">{{ $t('上期') }}</th><th class="num">{{ $t('对上期差额') }}</th><th class="num">%</th><th>{{ $t('说明') }}</th><th>{{ $t('回核') }}</th></tr></thead>
          <tbody>
            <tr v-for="f in res.flux" :key="f.accountCode" :class="{ bad: f.commentaryStatus === 'unverified' }" :data-test="`fau-flux-${f.accountCode}`">
              <td><FauNum :value="f.accountCode" /> {{ f.accountName }}</td>
              <td class="num"><FauNum :cents="f.current" /></td>
              <td class="num"><FauNum :cents="f.prior" /></td>
              <td class="num"><FauNum :cents="f.diffPrior" /></td>
              <td class="num"><FauNum :ratio="f.diffPriorPct" /></td>
              <td class="wrap">{{ f.commentary }}</td>
              <td><span class="fau-badge" :class="COMMENT_CLASS[f.commentaryStatus]">{{ $t(COMMENT_LABEL[f.commentaryStatus]) }}</span></td>
            </tr>
          </tbody>
        </table>
      </div>
    </details>

    <details class="fau-sec" :open="!!res.openItems.length" data-test="fau-open-items">
      <summary>{{ $t('未结事项') }} <span class="fau-badge muted">{{ res.openItems.length }}</span></summary>
      <ul v-if="res.openItems.length" class="fau-prov">
        <li v-for="o in res.openItems" :key="o.id">{{ o.description }} · <FauNum :cents="o.amount" /></li>
      </ul>
      <p v-else class="ss-muted">{{ $t('对账中心签核后转交过来的差异会出现在这里') }}</p>
    </details>
  </div>
</template>

<script setup lang="ts">
/** A1 月结关账：第 ④ 步的计算结果（引擎算数），关账清单人工项在这里勾 */
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';
import type { FauCheckMark, FauCloseResult, FauModuleDef, FauRun } from '@totalclaw/ipc-contracts';
import { i18nKey } from '../../../../i18n';
import FauNum from '../../FauNum.vue';
import { errorMessage, fau, msg } from '../../shared';
import { useNotificationStore } from '../../../../stores/notification';

const props = defineProps<{ run: FauRun; def: FauModuleDef }>();
const emit = defineEmits<{ (e: 'changed'): void }>();
const router = useRouter();
const res = computed(() => props.run.result as FauCloseResult | undefined);
const locked = computed(() => ['signing', 'archived', 'void'].includes(props.run.status));
const unexplained = computed(() => (res.value?.rollForward || []).filter((r) => r.unexplained !== 0).length);
const reuse = computed(() => props.def.reuse || []);
const busy = ref(false);
const error = ref('');

const MARK_LABEL: Record<FauCheckMark, string> = { ok: i18nKey('通过'), warn: i18nKey('提醒'), fail: i18nKey('不通过'), pending: i18nKey('待评') };
const TIE_LABEL: Record<string, string> = {
  trial: i18nKey('试算平衡'), bs: i18nKey('资产 = 负债 + 所有者权益'), np_retained: i18nKey('净利润 = 未分配利润本期增加'),
  cashflow: i18nKey('现金流量净额 = 货币资金变动'), opening: i18nKey('期初 = 上期期末'), movement: i18nKey('序时账发生额 = 余额表本期发生'),
};
const CROSS_LABEL: Record<string, string> = { omitted: i18nKey('漏做'), early: i18nKey('提前'), late: i18nKey('延迟') };
const APPROVAL_LABEL: Record<string, string> = { preparer: i18nKey('编制人'), reviewer: i18nKey('复核人'), approver: i18nKey('批准人') };
const COMMENT_LABEL: Record<string, string> = { none: i18nKey('未写说明'), verified: i18nKey('已核实'), unverified: i18nKey('未核实'), unknown: i18nKey('原因不明，待主管确认') };
const COMMENT_CLASS: Record<string, string> = { none: 'muted', verified: 'ok', unverified: 'bad', unknown: 'warn' };

async function update(itemId: string, mark: string, evidence?: string): Promise<void> {
  busy.value = true; error.value = '';
  try { await fau('close.checklist.update', { runId: props.run.id, itemId, mark, evidence }); emit('changed'); } catch (e) { error.value = errorMessage(e); } finally { busy.value = false; }
}
async function template(): Promise<void> {
  busy.value = true;
  try {
    const r = await fau<{ path: string }>('close.policyTemplate', { locale: props.run.outputLocale });
    await fau('artifact.reveal', { path: r.path });
  } catch (e) { useNotificationStore().error(errorMessage(e)); } finally { busy.value = false; }
}
</script>

<style scoped>
.fau-close { display: grid; gap: 10px; }
.fau-sec { border: 1px solid var(--color-border); border-radius: var(--radius-5); padding: 8px 12px; display: grid; gap: 8px; background: var(--color-bg-card); }
.fau-sec > summary { cursor: pointer; font-weight: 700; font-size: var(--font-size-md); display: flex; gap: 8px; align-items: center; flex-wrap: wrap; }
.fau-table input, .fau-table select { height: 28px; border-radius: var(--radius-2); border: 1px solid var(--color-border); background: var(--color-bg-input); color: var(--color-text-primary); padding-inline: 6px; font: inherit; font-size: var(--font-size-sm); }
</style>
