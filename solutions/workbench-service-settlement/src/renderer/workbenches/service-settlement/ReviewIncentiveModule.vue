<template>
  <section class="ss-module">
    <StickyProgress :title="$t('服务电商好评激励核算')" :metas="steps.metas" :runtime="steps.runtime" :current-key="steps.currentKey.value" @jump="scrollToStep" />

    <div class="ss-steps">
      <!-- 第 1 步：导入评价明细 -->
      <StepCard step-key="import" :index="0" :title="steps.metas[0].title" :hint="steps.metas[0].hint" :runtime="steps.runtime.import" :is-current="steps.currentKey.value === 'import'">
        <div class="ss-grid">
          <label class="ss-field">
            <span>{{ $t('结算月份') }}</span>
            <input v-model="period" type="month" />
          </label>
        </div>
        <div class="ss-source">
          <div class="ss-subhead">{{ $t('① 京东安装评价明细（自营 + POP，可同时选多个文件，系统合并计算）') }}</div>
          <FileDropField :label="$t('京东安装评价明细 Excel')" :hint="$t('京东后台导出的安装评价明细，自营与 POP 各一份都拖进来')" :files="fileChips(jdInstall)" @picked="(p) => addTables('jdInstall', p)" @remove="(p) => removeTable('jdInstall', p)" />
          <TableMapping v-for="(t, i) in jdInstall" :key="t.path + t.sheetName" :table="t" :roles="INSTALL_ROLES" @update="(m) => (jdInstall[i].mapping = m)" @sheet="(s) => reloadSheet('jdInstall', i, s)" />
        </div>
        <div class="ss-source">
          <div class="ss-subhead">{{ $t('② 京东售后评价明细（维修工单满意度）') }}</div>
          <FileDropField :label="$t('京东售后评价明细 Excel')" :files="fileChips(jdAfterSales)" @picked="(p) => addTables('jdAfterSales', p)" @remove="(p) => removeTable('jdAfterSales', p)" />
          <TableMapping v-for="(t, i) in jdAfterSales" :key="t.path + t.sheetName" :table="t" :roles="AFTER_SALES_ROLES" @update="(m) => (jdAfterSales[i].mapping = m)" @sheet="(s) => reloadSheet('jdAfterSales', i, s)" />
        </div>
        <div class="ss-source">
          <div class="ss-subhead">{{ $t('③ 天猫平台评价明细') }}</div>
          <FileDropField :label="$t('天猫评价明细 Excel')" :files="fileChips(tmall)" @picked="(p) => addTables('tmall', p)" @remove="(p) => removeTable('tmall', p)" />
          <TableMapping v-for="(t, i) in tmall" :key="t.path + t.sheetName" :table="t" :roles="TMALL_ROLES" @update="(m) => (tmall[i].mapping = m)" @sheet="(s) => reloadSheet('tmall', i, s)" />
        </div>
        <div class="ss-actions">
          <button type="button" class="ss-btn primary" :disabled="!anyTable || steps.isRunning()" @click="confirmImport">
            <i class="ri-check-line"></i>{{ $t('文件都选好了，下一步') }}
          </button>
          <span class="ss-muted">{{ $t('已选 {n} 份明细', { n: jdInstall.length + jdAfterSales.length + tmall.length }) }}</span>
        </div>
      </StepCard>

      <!-- 第 2 步：京东安装评价率（客户 2026-09-09 要求：先把评价率算出来、单独成块） -->
      <StepCard step-key="rates" :index="1" :title="steps.metas[1].title" :hint="steps.metas[1].hint" :runtime="steps.runtime.rates" :is-current="steps.currentKey.value === 'rates'">
        <p class="ss-note info"><i class="ri-information-line"></i>{{ $t('京东安装评价率 = 京东安装完工中好评价量 ÷ 京东安装完工总单量（中好评价 = 非差评）。完工总单量在 CSS 里，评价明细里没有：把 CSS 导出的完工单量表放进来就按这个公式算；平台已经给了「评价率 / 差评率」列则直接用。') }}</p>
        <div class="ss-source">
          <div class="ss-subhead">{{ $t('④ 京东安装完工总单量（CSS）或平台评价率报表') }}</div>
          <FileDropField :label="$t('完工总单量 / 评价率报表 Excel')" :hint="$t('要有「服务商」列，再加「完工总单量」或「评价率 / 差评率」列任一；「中好评价量」列可选（没有就用明细里的非差评数）')" :files="fileChips(evaluable)" @picked="(p) => addTables('evaluable', p)" @remove="(p) => removeTable('evaluable', p)" />
          <TableMapping v-for="(t, i) in evaluable" :key="t.path + t.sheetName" :table="t" :roles="EVALUABLE_ROLES" @update="(m) => (evaluable[i].mapping = m)" @sheet="(s) => reloadSheet('evaluable', i, s)" />
        </div>
        <div class="ss-actions">
          <button type="button" class="ss-btn primary" :disabled="steps.runtime.import.state !== 'done' || steps.isRunning()" @click="computeRates">
            <i :class="steps.runtime.rates.state === 'running' ? 'ri-loader-4-line spin' : 'ri-percent-line'"></i>{{ evaluable.length ? $t('计算评价率，下一步') : $t('没有这张表，评价率按未知继续') }}
          </button>
        </div>
        <template v-if="rates">
          <p v-for="w in rates.warnings" :key="w" class="ss-note warn"><i class="ri-alert-line"></i>{{ w }}</p>
          <div class="ss-kpis">
            <div class="ss-kpi"><span>{{ $t('服务商') }}</span><strong>{{ rates.summary.providerCount }}</strong></div>
            <div class="ss-kpi"><span>{{ $t('已算出评价率') }}</span><strong>{{ rates.summary.withRate }}</strong></div>
            <div class="ss-kpi"><span>{{ $t('按完工总单量算') }}</span><strong>{{ rates.summary.fromCss }}</strong></div>
            <div class="ss-kpi"><span>{{ $t('平台直接给的') }}</span><strong>{{ rates.summary.fromReport }}</strong></div>
            <div class="ss-kpi"><span>{{ $t('无分母（系数最低档）') }}</span><strong>{{ rates.summary.unknown }}</strong></div>
          </div>
          <div class="ss-table-wrap" style="max-height: 360px; overflow: auto;">
            <table class="ss-table">
              <thead>
                <tr>
                  <th>{{ $t('服务商') }}</th><th class="num">{{ $t('完工总单量') }}</th><th class="num">{{ $t('已评价') }}</th><th class="num">{{ $t('中好评价（非差评）') }}</th>
                  <th class="num">{{ $t('评价率Y') }}</th><th>{{ $t('来源') }}</th><th class="num">{{ $t('差评') }}</th><th class="num">{{ $t('差评率X') }}</th><th>{{ $t('来源') }}</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="p in rates.providers" :key="p.provider">
                  <td>{{ p.provider }}</td><td class="num">{{ p.completedOrders ?? '—' }}</td><td class="num">{{ p.ratedOrders }}</td><td class="num">{{ p.midGoodOrders }}</td>
                  <td class="num">{{ p.rateY == null ? '—' : fmtPct(p.rateY) }}</td><td>{{ sourceLabel(p.rateYSource) }}</td>
                  <td class="num">{{ p.badOrders }}</td><td class="num">{{ fmtPct(p.badRateX) }}</td><td>{{ sourceLabel(p.badRateXSource) }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </template>
      </StepCard>

      <!-- 第 3 步：确认规则 -->
      <StepCard step-key="rules" :index="2" :title="steps.metas[2].title" :hint="steps.metas[2].hint" :runtime="steps.runtime.rules" :is-current="steps.currentKey.value === 'rules'">
        <div class="ss-rules">
          <h4><i class="ri-file-list-3-line"></i>{{ $t('京东安装：基础激励金额（按安装差评率 X）') }}<button type="button" class="ss-link" @click="resetRules">{{ $t('恢复文档默认') }}</button></h4>
          <div class="ss-rule-row">
            <span class="lbl">{{ $t('差评率 X >') }}</span><input v-model.number="rulesForm.badRateThresholdPct" type="number" step="0.1" min="0" /><span class="lbl">%</span>
            <span class="lbl">→</span><input v-model.number="rulesForm.baseAmountAboveThreshold" type="number" min="0" /><span class="lbl">{{ $t('元/单') }}</span>
            <span class="lbl">{{ $t('；') }}</span>
            <span class="lbl">{{ $t('X ≤ 阈值') }}</span><span class="lbl">→</span><input v-model.number="rulesForm.baseAmountWithinThreshold" type="number" min="0" /><span class="lbl">{{ $t('元/单') }}</span>
          </div>
          <h4><i class="ri-percent-line"></i>{{ $t('京东安装：评价率激励系数（按安装评价率 Y）') }}</h4>
          <div v-for="(tier, i) in rulesForm.coefTiers" :key="i" class="ss-rule-row">
            <span class="lbl">{{ i === 0 ? $t('Y <') : $t('Y ≥') }}</span>
            <input v-if="i > 0" v-model.number="tier.minRatePct" type="number" min="0" max="100" />
            <input v-else :value="rulesForm.coefTiers[1]?.minRatePct ?? 50" type="number" disabled />
            <span class="lbl">%</span><span class="lbl">→ {{ $t('系数') }}</span><input v-model.number="tier.coef" type="number" step="0.1" min="0" />
          </div>
          <h4><i class="ri-customer-service-2-line"></i>{{ $t('京东售后 / 天猫') }}</h4>
          <div class="ss-rule-row">
            <span class="lbl">{{ $t('售后「非常满意 / 满意」每单') }}</span><input v-model.number="rulesForm.afterSalesPerOrder" type="number" min="0" /><span class="lbl">{{ $t('元') }}</span>
            <span class="lbl">{{ $t('；{p0}', { p0: $t('天猫好评每单') }) }}</span><input v-model.number="rulesForm.tmallPerOrder" type="number" min="0" /><span class="lbl">{{ $t('元') }}</span>
          </div>
          <button type="button" class="ss-link" @click="showAdvanced = !showAdvanced">{{ showAdvanced ? $t('收起口径设置') : $t('口径设置（一般不用改）') }}</button>
          <div v-if="showAdvanced" class="ss-rule-row">
            <span class="lbl">{{ $t('有效好评 ≥') }}</span><select v-model.number="rulesForm.goodStarsMin"><option :value="5">5 {{ $t('星') }}</option><option :value="4">4 {{ $t('星') }}</option></select>
            <span class="lbl">{{ $t('；{p0}', { p0: $t('差评 ≤') }) }}</span><select v-model.number="rulesForm.badStarsMax"><option :value="1">1 {{ $t('星') }}</option><option :value="2">2 {{ $t('星') }}</option><option :value="3">3 {{ $t('星') }}</option></select>
            <span class="lbl">{{ $t('；{p0}', { p0: $t('差评率分母') }) }}</span>
            <select v-model="rulesForm.badRateDenominator"><option value="rated">{{ $t('已评价单数') }}</option><option value="evaluable">{{ $t('完工总单量') }}</option></select>
          </div>
          <p class="ss-note info"><i class="ri-information-line"></i>{{ $t('本项总激励 = ①有效好评单数 × 基础激励 × 系数 + ②（非常满意 + 满意工单数）× 售后单价 + ③天猫好评单数 × 天猫单价。安装差评率与评价率按自营 + POP 合并计算，标记「不计取」的 SKU 不进统计。') }}</p>
        </div>
        <div class="ss-actions">
          <button type="button" class="ss-btn primary" :disabled="steps.runtime.rates.state !== 'done' || steps.isRunning()" @click="confirmRules"><i class="ri-check-line"></i>{{ $t('规则没问题，下一步') }}</button>
        </div>
      </StepCard>

      <!-- 第 4 步：核算 -->
      <StepCard step-key="run" :index="3" :title="steps.metas[3].title" :hint="steps.metas[3].hint" :runtime="steps.runtime.run" :is-current="steps.currentKey.value === 'run'">
        <div class="ss-actions">
          <button type="button" class="ss-btn primary" :disabled="steps.runtime.rules.state !== 'done' || steps.isRunning()" @click="run">
            <i :class="steps.runtime.run.state === 'running' ? 'ri-loader-4-line spin' : 'ri-calculator-line'"></i>{{ steps.runtime.run.state === 'done' ? $t('重新核算') : $t('开始核算并生成结果表') }}
          </button>
          <template v-if="result">
            <button type="button" class="ss-btn" @click="openPath(outputPath)"><i class="ri-file-excel-2-line"></i>{{ $t('打开结果表') }}</button>
            <button type="button" class="ss-btn ghost" @click="openPath(outputPath, true)"><i class="ri-folder-open-line"></i>{{ $t('打开所在文件夹') }}</button>
          </template>
        </div>
        <template v-if="result">
          <div class="ss-kpis">
            <div class="ss-kpi"><small>{{ $t('服务商数') }}</small><strong>{{ result.totals.providerCount }}</strong></div>
            <div class="ss-kpi"><small>{{ $t('①京东安装好评激励') }}</small><strong>¥{{ fmtMoney(result.totals.installIncentive) }}</strong></div>
            <div class="ss-kpi"><small>{{ $t('②京东售后好评激励') }}</small><strong>¥{{ fmtMoney(result.totals.afterSalesIncentive) }}</strong></div>
            <div class="ss-kpi"><small>{{ $t('③天猫好评激励') }}</small><strong>¥{{ fmtMoney(result.totals.tmallIncentive) }}</strong></div>
            <div class="ss-kpi accent"><small>{{ $t('本项总激励') }}</small><strong>¥{{ fmtMoney(result.totals.total) }}</strong></div>
          </div>
          <p v-for="w in result.warnings" :key="w" class="ss-note warn"><i class="ri-alert-line"></i>{{ w }}</p>
          <div class="ss-table-wrap" style="max-height: 420px; overflow: auto;">
            <table class="ss-table">
              <thead>
                <tr>
                  <th>{{ $t('服务商') }}</th><th class="num">{{ $t('完工总单量') }}</th><th class="num">{{ $t('已评价') }}</th><th class="num">{{ $t('评价率Y') }}</th>
                  <th class="num">{{ $t('差评') }}</th><th class="num">{{ $t('差评率X') }}</th><th class="num">{{ $t('有效好评') }}</th><th class="num">{{ $t('基础') }}</th><th class="num">{{ $t('系数') }}</th>
                  <th class="num">①</th><th class="num">{{ $t('售后满意') }}</th><th class="num">②</th><th class="num">{{ $t('天猫好评') }}</th><th class="num">③</th><th class="num">{{ $t('总激励') }}</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="p in result.providers" :key="p.provider">
                  <!-- 评价率未知（没给可评价单数表）时可评价数只是 = 已评价数，和导出表一样显示「—」 -->
                  <td>{{ p.provider }}</td><td class="num">{{ p.rateYKnown ? p.evaluableOrders : '—' }}</td><td class="num">{{ p.ratedOrders }}</td><td class="num">{{ p.rateYKnown ? fmtPct(p.rateY) : '—' }}</td>
                  <td class="num">{{ p.badOrders }}</td><td class="num">{{ fmtPct(p.badRateX) }}</td><td class="num">{{ p.goodOrders }}</td><td class="num">{{ p.baseAmount }}</td><td class="num">{{ p.coef }}</td>
                  <td class="num">{{ fmtMoney(p.installIncentive) }}</td><td class="num">{{ p.afterSalesSatisfied }}</td><td class="num">{{ fmtMoney(p.afterSalesIncentive) }}</td>
                  <td class="num">{{ p.tmallGood }}</td><td class="num">{{ fmtMoney(p.tmallIncentive) }}</td><td class="num"><strong>{{ fmtMoney(p.total) }}</strong></td>
                </tr>
                <tr class="total">
                  <td>{{ $t('合计') }}</td><td class="num">{{ result.totals.evaluableOrders }}</td><td class="num">{{ result.totals.ratedOrders }}</td><td></td>
                  <td class="num">{{ result.totals.badOrders }}</td><td></td><td class="num">{{ result.totals.goodOrders }}</td><td></td><td></td>
                  <td class="num">{{ fmtMoney(result.totals.installIncentive) }}</td><td></td><td class="num">{{ fmtMoney(result.totals.afterSalesIncentive) }}</td><td></td><td class="num">{{ fmtMoney(result.totals.tmallIncentive) }}</td><td class="num">{{ fmtMoney(result.totals.total) }}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div class="ss-file-out"><i class="ri-file-excel-2-line"></i><code :title="outputPath">{{ outputPath }}</code></div>
        </template>
      </StepCard>

      <!-- 第 5 步：付款提醒 -->
      <StepCard step-key="remind" :index="4" :title="steps.metas[4].title" :hint="steps.metas[4].hint" :runtime="steps.runtime.remind" :is-current="steps.currentKey.value === 'remind'">
        <div class="ss-rule-row">
          <label class="ss-switch"><input v-model="reminder.enabled" type="checkbox" /><span>{{ $t('开启付款提醒') }}</span></label>
          <span class="lbl">{{ $t('每月') }}</span><input v-model.number="reminder.day" type="number" min="1" max="28" /><span class="lbl">{{ $t('日') }}</span>
          <input v-model.number="reminder.hour" type="number" min="0" max="23" /><span class="lbl">{{ $t('点提醒') }}</span>
          <button type="button" class="ss-btn sm primary" :disabled="steps.isRunning()" @click="saveReminder"><i class="ri-save-line"></i>{{ $t('保存提醒设置') }}</button>
        </div>
        <p class="ss-note"><i class="ri-notification-3-line"></i>{{ $t('到点会在应用内弹提醒并发系统通知；如果在「定时任务 · 结果推送」里配了企微/钉钉/邮箱出口，也会一并推送到手机。上次提醒：{last}', { last: props.state?.review?.paymentReminder?.lastFiredMonth || $t('尚未触发') }) }}</p>
        <div v-if="lastRun" class="ss-note ok"><i class="ri-history-line"></i>{{ $t('上次核算：{at}，{n} 家服务商，合计 ¥{total}', { at: fmtDateTime(lastRun.at), n: lastRun.count, total: fmtMoney(lastRun.total) }) }}<button type="button" class="ss-link" style="margin-inline-start:8px" @click="openPath(lastRun.path)">{{ $t('打开上次结果表') }}</button></div>
      </StepCard>
    </div>
  </section>
</template>

<script setup lang="ts">
/**
 * 模块一 · 服务电商好评激励（京东安装 + 京东售后 + 天猫好评）。
 * 四步：导入明细 → 确认规则 → 核算出表 → 每月 10 日付款提醒。
 */
import { computed, reactive, ref, watch } from 'vue';
import { useNotificationStore } from '../../stores/notification';
import { t as i18nT } from '../../i18n';
import StepCard from './StepCard.vue';
import DK from './dataKeywords.json';
import FileDropField from './FileDropField.vue';
import TableMapping from './TableMapping.vue';
import StickyProgress from './StickyProgress.vue';
import { api, useSteps, scrollToStep, inspectTable, fmtMoney, fmtPct, fmtDateTime, openPath, currentPeriod, errorMessage, type PickedTable } from './shared';

const props = defineProps<{ state: any }>();
const emit = defineEmits<{ (e: 'refresh'): void }>();
const notif = useNotificationStore();

const steps = useSteps([
  { key: 'import', title: i18nT('导入评价明细'), hint: i18nT('把京东 / 天猫后台导出的评价明细 Excel 放进来，系统自动认列') },
  { key: 'rates', title: i18nT('计算京东安装评价率'), hint: i18nT('评价率 = 完工中好评价量（非差评）÷ 完工总单量；放 CSS 完工单量表或平台评价率报表，逐家算出 Y 与差评率 X') },
  { key: 'rules', title: i18nT('确认计算规则'), hint: i18nT('默认就是政策规则表里的数字，看一眼没问题就下一步') },
  { key: 'run', title: i18nT('核算并输出激励结果表'), hint: i18nT('统计各服务商安装评价率、差评率，按规则算出①②③与总激励') },
  { key: 'remind', title: i18nT('每月 10 日付款提醒'), hint: i18nT('到点自动提醒安排付款') },
]);

const INSTALL_ROLES = [
  { key: 'provider', required: true },
  // 星级与「是否差评」二选一:京东安装真实导出没有星级列,只有 差评/非差评 布尔列
  { key: 'rating', label: i18nT('评价星级/结果') },
  { key: 'badFlag', label: i18nT('是否差评（与星级二选一）') },
  { key: 'evaluable' }, { key: 'counted' }, { key: 'rated' }, { key: 'sku' }, { key: 'orderNo' },
];
const AFTER_SALES_ROLES = [{ key: 'provider', required: true }, { key: 'satisfaction', required: true }, { key: 'orderNo' }];
const TMALL_ROLES = [{ key: 'provider', required: true }, { key: 'rating', required: true, label: i18nT('评价（好评/中评/差评）') }, { key: 'counted', label: i18nT('是否好评激励') }, { key: 'orderNo' }];
// 完工总单量（CSS）/ 平台评价率报表：完工总单量 / 评价率 / 差评率 至少给一列
//（完工总单量 → Y = 中好评价（非差评）/ 完工总单量；评价率、差评率列直接覆盖 Y / X；中好评价量列可选）
const EVALUABLE_ROLES = [
  { key: 'provider', required: true },
  { key: 'evaluableCount', label: i18nT('京东安装完工总单量') },
  { key: 'midGoodCount', label: i18nT('完工中好评价量（可选）') },
  { key: 'rateY' }, { key: 'badRateX' },
];

const period = ref<string>(props.state?.review?.period || currentPeriod());
const jdInstall = reactive<PickedTable[]>([]);
const jdAfterSales = reactive<PickedTable[]>([]);
const tmall = reactive<PickedTable[]>([]);
const evaluable = reactive<PickedTable[]>([]);
type Group = 'jdInstall' | 'jdAfterSales' | 'tmall' | 'evaluable';
const groups: Record<Group, PickedTable[]> = { jdInstall, jdAfterSales, tmall, evaluable };
const rolesOf: Record<Group, string[]> = {
  jdInstall: INSTALL_ROLES.map((r) => r.key),
  jdAfterSales: AFTER_SALES_ROLES.map((r) => r.key),
  tmall: TMALL_ROLES.map((r) => r.key),
  evaluable: EVALUABLE_ROLES.map((r) => r.key),
};
const anyTable = computed(() => jdInstall.length + jdAfterSales.length + tmall.length > 0);

function fileChips(list: PickedTable[]) {
  return list.map((t) => ({ path: t.path, name: t.fileName, note: i18nT('{n} 行', { n: t.rowCount }) }));
}

// 客户把三个平台的明细放在同一个工作簿的三个 sheet 里：按输入位挑默认页，用户仍可改选
const SHEET_HINTS: Record<Group, string[]> = DK.sheetHints;
async function addTables(group: Group, paths: string[]): Promise<void> {
  const list = groups[group];
  for (const p of paths) {
    if (list.some((t) => t.path === p)) continue;
    try {
      list.push(await inspectTable(p, rolesOf[group], undefined, SHEET_HINTS[group]));
    } catch (e) {
      notif.error(i18nT('读取失败：{msg}', { msg: errorMessage(e) }));
    }
  }
  invalidateFrom(group);
}
/**
 * 文件变了，从哪一步开始作废：明细（①②③）变 → 从「导入」起全部重来；
 * 完工总单量 / 评价率表（④）只影响「计算评价率」及其后（规则 / 核算），导入那步不用重确认。
 */
function invalidateFrom(group: Group): void {
  const from = group === 'evaluable' ? 'rates' : 'import';
  if (steps.runtime[from].state !== 'todo') { steps.reset(from); steps.resetAfter(from); }
  if (from === 'import') rates.value = null;
  if (from === 'rates') rates.value = null;
  result.value = null;
}
function removeTable(group: Group, path: string): void {
  const list = groups[group];
  const i = list.findIndex((t) => t.path === path);
  if (i >= 0) { list.splice(i, 1); invalidateFrom(group); }
}
async function reloadSheet(group: Group, index: number, sheetName: string): Promise<void> {
  const list = groups[group];
  const old = list[index];
  try { list[index] = await inspectTable(old.path, rolesOf[group], sheetName); } catch (e) { notif.error(errorMessage(e)); }
}

/** 演示预填（外部调用可传入路径预填）：同一工作簿放进三个位置，按 sheet 关键字自动挑页；评价率报表（可选）指定页 */
async function prefillDemo(d: { period: string; workbook: string; rateReport?: { workbook: string; sheet?: string } }): Promise<void> {
  period.value = d.period;
  for (const g of Object.keys(groups) as Group[]) groups[g].splice(0, groups[g].length);
  for (const m of steps.metas) steps.reset(m.key);
  rates.value = null;
  steps.currentKey.value = 'import';
  for (const g of ['jdInstall', 'jdAfterSales', 'tmall'] as Group[]) await addTables(g, [d.workbook]);
  if (d.rateReport?.workbook) {
    try { evaluable.push(await inspectTable(d.rateReport.workbook, rolesOf.evaluable, d.rateReport.sheet)); } catch (e) { notif.error(i18nT('读取失败：{msg}', { msg: errorMessage(e) })); }
  }
}
defineExpose({ prefillDemo });

// ── 评价率（单独一步）──
const rates = ref<any>(null);
const refOf = (t: PickedTable) => ({ path: t.path, sheetName: t.sheetName, mapping: t.mapping });
function sourceLabel(v: string): string {
  switch (v) {
    case 'css': return i18nT('完工总单量表算出');
    case 'report': return i18nT('平台报表直接给的');
    case 'detail': return i18nT('评价明细算出');
    default: return i18nT('无分母，未知');
  }
}
async function computeRates(): Promise<void> {
  steps.start('rates');
  const missing = evaluable.filter((t) => !t.mapping.provider);
  const noCount = evaluable.filter((t) => !t.mapping.evaluableCount && !t.mapping.rateY && !t.mapping.badRateX);
  if (missing.length) { steps.fail('rates', i18nT('{files} 没有选「服务商」列', { files: missing.map((t) => t.fileName).join('、') })); return; }
  if (noCount.length) { steps.fail('rates', i18nT('{files} 没有选「完工总单量」或「评价率 / 差评率」列', { files: noCount.map((t) => t.fileName).join('、') })); return; }
  try {
    const r = await api().reviewRates({ jdInstall: jdInstall.map(refOf), evaluable: evaluable.map(refOf) });
    rates.value = r;
    steps.resetAfter('rates');
    result.value = null;
    const s = r.summary;
    steps.done('rates', evaluable.length
      ? i18nT('{n} 家服务商：{k} 家算出评价率（完工总单量 {c} 家、平台报表 {r} 家），{u} 家无分母按最低档', { n: s.providerCount, k: s.withRate, c: s.fromCss, r: s.fromReport, u: s.unknown })
      : i18nT('{n} 家服务商没有完工总单量，评价率按未知、系数取最低档；拿到 CSS 完工单量表后回到这一步重算', { n: s.providerCount }));
  } catch (e) {
    steps.fail('rates', e);
  }
}

function confirmImport(): void {
  steps.start('import');
  const all = [...jdInstall, ...jdAfterSales, ...tmall];
  const missing = all.filter((t) => !t.mapping.provider);
  if (missing.length) { steps.fail('import', i18nT('{files} 没有选「服务商」列', { files: missing.map((t) => t.fileName).join('、') })); return; }
  // 京东安装真实导出没有星级列，只有「是否差评」——认到 badFlag 也算有评价结果列
  const noRating = [
    ...jdInstall.filter((t) => !t.mapping.rating && !t.mapping.rated && !t.mapping.badFlag),
    ...tmall.filter((t) => !t.mapping.rating && !t.mapping.badFlag),
    ...jdAfterSales.filter((t) => !t.mapping.satisfaction && !t.mapping.rating),
  ];
  if (noRating.length) {
    steps.fail('import', i18nT('{files} 没有选评价 / 差评 / 满意度列。一个工作簿有多页时，请先在上面把工作表切到对应那一页（安装 / 售后 / 天猫）', {
      files: noRating.map((t) => i18nT('{file}（工作表「{sheet}」）', { file: t.fileName, sheet: t.sheetName })).join('、'),
    }));
    return;
  }
  if (!/^\d{4}-\d{2}$/.test(period.value)) { steps.fail('import', i18nT('请选择结算月份')); return; }
  steps.resetAfter('import');
  result.value = null;
  steps.done('import', i18nT('{a} 份京东安装、{b} 份京东售后、{c} 份天猫明细，共 {rows} 行', { a: jdInstall.length, b: jdAfterSales.length, c: tmall.length, rows: all.reduce((s, t) => s + t.rowCount, 0) }));
}

// ── 规则 ──
const DEFAULT_FORM = () => ({
  badRateThresholdPct: 0.6,
  baseAmountAboveThreshold: 5,
  baseAmountWithinThreshold: 10,
  coefTiers: [{ minRatePct: 0, coef: 1 }, { minRatePct: 50, coef: 1.2 }, { minRatePct: 60, coef: 1.5 }],
  afterSalesPerOrder: 10,
  tmallPerOrder: 5,
  goodStarsMin: 5,
  // 京东口径：1 星=差评、2–3 星=中评、4–5 星=好评（天猫是 1–2 星差评，口径设置里可改）
  badStarsMax: 1,
  badRateDenominator: 'rated' as 'rated' | 'evaluable',
});
const rulesForm = reactive(DEFAULT_FORM());
const showAdvanced = ref(false);
function loadRulesFromState(): void {
  const r = props.state?.review?.rules;
  if (!r) return;
  if (r.badRateThreshold != null) rulesForm.badRateThresholdPct = Math.round(r.badRateThreshold * 10000) / 100;
  if (r.baseAmountAboveThreshold != null) rulesForm.baseAmountAboveThreshold = r.baseAmountAboveThreshold;
  if (r.baseAmountWithinThreshold != null) rulesForm.baseAmountWithinThreshold = r.baseAmountWithinThreshold;
  if (Array.isArray(r.coefTiers) && r.coefTiers.length) rulesForm.coefTiers = r.coefTiers.map((t: any) => ({ minRatePct: Math.round(t.minRate * 100), coef: t.coef }));
  if (r.afterSalesPerOrder != null) rulesForm.afterSalesPerOrder = r.afterSalesPerOrder;
  if (r.tmallPerOrder != null) rulesForm.tmallPerOrder = r.tmallPerOrder;
  if (r.goodStarsMin != null) rulesForm.goodStarsMin = r.goodStarsMin;
  if (r.badStarsMax != null) rulesForm.badStarsMax = r.badStarsMax;
  if (r.badRateDenominator) rulesForm.badRateDenominator = r.badRateDenominator;
}
loadRulesFromState();
function resetRules(): void { Object.assign(rulesForm, DEFAULT_FORM()); }
function rulesPayload() {
  return {
    badRateThreshold: Number(rulesForm.badRateThresholdPct) / 100,
    baseAmountAboveThreshold: Number(rulesForm.baseAmountAboveThreshold),
    baseAmountWithinThreshold: Number(rulesForm.baseAmountWithinThreshold),
    coefTiers: rulesForm.coefTiers.map((t, i) => ({ minRate: i === 0 ? 0 : Number(t.minRatePct) / 100, coef: Number(t.coef) })),
    afterSalesPerOrder: Number(rulesForm.afterSalesPerOrder),
    tmallPerOrder: Number(rulesForm.tmallPerOrder),
    goodStarsMin: rulesForm.goodStarsMin,
    badStarsMax: rulesForm.badStarsMax,
    badRateDenominator: rulesForm.badRateDenominator,
  };
}
function confirmRules(): void {
  steps.start('rules');
  const bad = [rulesForm.baseAmountAboveThreshold, rulesForm.baseAmountWithinThreshold, rulesForm.afterSalesPerOrder, rulesForm.tmallPerOrder, rulesForm.badRateThresholdPct].some((v) => !Number.isFinite(Number(v)) || Number(v) < 0);
  if (bad) { steps.fail('rules', i18nT('金额 / 阈值必须是非负数字')); return; }
  if (rulesForm.coefTiers.some((t) => !Number.isFinite(Number(t.coef)) || Number(t.coef) < 0)) { steps.fail('rules', i18nT('系数必须是非负数字')); return; }
  steps.resetAfter('rules');
  result.value = null;
  steps.done('rules', i18nT('X>{x}% → {a} 元，X≤{x}% → {b} 元；系数 {coefs}；售后 {c} 元/单；天猫 {d} 元/单', {
    x: rulesForm.badRateThresholdPct, a: rulesForm.baseAmountAboveThreshold, b: rulesForm.baseAmountWithinThreshold,
    coefs: rulesForm.coefTiers.map((t) => t.coef).join(' / '), c: rulesForm.afterSalesPerOrder, d: rulesForm.tmallPerOrder,
  }));
}

// ── 核算 ──
const result = ref<any>(null);
const outputPath = ref('');
async function run(): Promise<void> {
  steps.start('run');
  result.value = null;
  try {
    const r = await api().reviewRun({
      period: period.value,
      jdInstall: jdInstall.map(refOf), jdAfterSales: jdAfterSales.map(refOf), tmall: tmall.map(refOf),
      evaluable: evaluable.map(refOf),
      rules: rulesPayload(),
    });
    result.value = r.result;
    outputPath.value = r.outputPath;
    steps.done('run', i18nT('{n} 家服务商，本项总激励 ¥{total}，结果表已生成', { n: r.result.totals.providerCount, total: fmtMoney(r.result.totals.total) }));
    notif.success(i18nT('好评激励结果表已生成'));
    emit('refresh');
  } catch (e) {
    steps.fail('run', e);
  }
}

// ── 提醒 ──
const reminder = reactive({ enabled: true, day: 10, hour: 9 });
watch(() => props.state?.review?.paymentReminder, (pr) => { if (pr) Object.assign(reminder, { enabled: pr.enabled, day: pr.day, hour: pr.hour }); }, { immediate: true });
async function saveReminder(): Promise<void> {
  steps.start('remind');
  // 清空数字框会得到 ''/0：日落回 10、时落回 9，避免主进程夹成 1 日 0 点而界面又显示空白
  if (!Number.isFinite(Number(reminder.day)) || Number(reminder.day) < 1) reminder.day = 10;
  if (!Number.isFinite(Number(reminder.hour)) || reminder.hour === ('' as unknown as number)) reminder.hour = 9;
  try {
    await api().statePatch({ review: { period: period.value, paymentReminder: { ...reminder } } });
    steps.done('remind', reminder.enabled ? i18nT('已开启：每月 {d} 日 {h} 点提醒付款', { d: reminder.day, h: reminder.hour }) : i18nT('提醒已关闭'));
    emit('refresh');
  } catch (e) {
    steps.fail('remind', e);
  }
}

const lastRun = computed(() => {
  const r = props.state?.review;
  if (!r?.lastRunAt) return null;
  return { at: r.lastRunAt, count: r.lastSummary?.providerCount ?? 0, total: r.lastSummary?.total ?? 0, path: r.lastOutputPath };
});
</script>

<style scoped>
.ss-source { display: grid; gap: 8px; padding: 10px 12px; border-radius: var(--radius-5); background: var(--color-bg-primary); border: 1px solid var(--color-border); }
.ss-switch { display: inline-flex; align-items: center; gap: 6px; font-size: 12.5px; cursor: pointer; }
.spin { animation: ss-spin 1s linear infinite; }
@keyframes ss-spin { to { transform: rotate(360deg); } }
</style>
