<template>
  <div class="fau-audit ss-module" data-test="fau-qc-panel">
    <StickyProgress :title="$t('办公产出与质检')" :metas="steps.metas" :runtime="steps.runtime" :current-key="steps.currentKey.value" @jump="scrollToStep" />
    <div class="fau-steps">
      <!-- ① 选择文件 -->
      <StepCard step-key="qc-pick" :index="0" :title="steps.metas[0].title" :hint="steps.metas[0].hint" :runtime="steps.runtime['qc-pick']" :is-current="steps.currentKey.value === 'qc-pick'">
        <div class="ss-actions">
          <button type="button" class="ss-btn" :disabled="busy" data-test="fau-qc-pick-xlsx" @click="pick('xlsx')"><i class="ri-file-excel-2-line"></i>{{ $t('选择 Excel 底稿或模型') }}</button>
          <button type="button" class="ss-btn" :disabled="busy" data-test="fau-qc-pick-pptx" @click="pick('pptx')"><i class="ri-slideshow-line"></i>{{ $t('选择演示文稿') }}</button>
        </div>
        <p v-if="info" class="ss-note info" data-test="fau-qc-file"><i class="ri-file-line"></i>{{ info.file }} · <template v-if="info.kind === 'xlsx'">{{ $t('{n} 张工作表', { n: info.sheets?.length || 0 }) }}</template><template v-else>{{ $t('{n} 页', { n: info.slides || 0 }) }}</template></p>
      </StepCard>

      <!-- ② 质检范围 -->
      <StepCard step-key="qc-scope" :index="1" :title="steps.metas[1].title" :hint="steps.metas[1].hint" :runtime="steps.runtime['qc-scope']" :is-current="steps.currentKey.value === 'qc-scope'">
        <p v-if="!info" class="ss-muted">{{ $t('先完成第 1 步') }}</p>
        <template v-else-if="info.kind === 'xlsx'">
          <div class="fau-row">
            <span class="ss-muted">{{ $t('范围') }}</span>
            <span class="fau-seg">
              <button v-for="s in SCOPES" :key="s" type="button" :class="{ on: scope === s }" :data-test="`fau-qc-scope-${s}`" @click="scope = s">{{ $t(SCOPE_LABEL[s]) }}</button>
            </span>
          </div>
          <div v-if="scope !== 'model'" class="fau-row">
            <label class="fau-row"><span class="ss-muted">{{ $t('工作表') }}</span><select v-model="sheet"><option v-for="n in info.sheets || []" :key="n" :value="n">{{ n }}</option></select></label>
            <label v-if="scope === 'selection'" class="fau-row"><span class="ss-muted">{{ $t('区域') }}</span><input v-model.trim="range" type="text" dir="ltr" placeholder="B3:F20" data-test="fau-qc-range" /></label>
          </div>
        </template>
        <p v-else class="ss-muted">{{ $t('演示文稿检查全部页：跨页数字一致性、单位与日期写法、措辞与占位符、数据来源') }}</p>
        <div v-if="info" class="ss-actions"><button type="button" class="ss-btn primary" data-test="fau-qc-scope-next" @click="steps.done('qc-scope')">{{ $t('下一步') }}</button></div>
      </StepCard>

      <!-- ③ 质检 -->
      <StepCard step-key="qc-run" :index="2" :title="steps.metas[2].title" :hint="steps.metas[2].hint" :runtime="steps.runtime['qc-run']" :is-current="steps.currentKey.value === 'qc-run'" :retry="info ? run : undefined">
        <div class="ss-actions">
          <OutputLocalePicker v-model="locale" />
          <button type="button" class="ss-btn primary" :disabled="busy || !info || steps.runtime['qc-scope'].state !== 'done'" data-test="fau-qc-run" @click="run"><i class="ri-search-eye-line"></i>{{ $t('开始质检') }}</button>
        </div>
      </StepCard>

      <!-- ④ 查看报告 -->
      <StepCard step-key="qc-report" :index="3" :title="steps.metas[3].title" :hint="steps.metas[3].hint" :runtime="steps.runtime['qc-report']" :is-current="steps.currentKey.value === 'qc-report'">
        <template v-if="report">
          <div class="fau-counts">
            <span v-for="s in SEVERITIES" :key="s" class="fau-badge" :class="s === 'critical' ? 'bad' : s === 'important' ? 'warn' : 'muted'" :data-test="`fau-qc-count-${s}`">{{ $t(QC_SEVERITY_LABEL[s]) }} <FauNum :value="report.counts[s]" /></span>
            <button type="button" class="ss-btn sm" data-test="fau-qc-open" @click="openReport"><i class="ri-external-link-line"></i>{{ $t('打开质检报告') }}</button>
          </div>
          <div class="fau-table-wrap">
            <table class="fau-table">
              <thead><tr><th>{{ $t('位置') }}</th><th>{{ $t('规则') }}</th><th>{{ $t('严重程度') }}</th><th>{{ $t('说明') }}</th></tr></thead>
              <tbody>
                <tr v-for="f in report.findings" :key="f.id" :class="{ bad: f.severity === 'critical' }" :data-test="`fau-qc-finding-${f.rule}`">
                  <td><FauNum :value="f.location" /></td><td>{{ $t(XLS_RULE_LABEL[f.rule as keyof typeof XLS_RULE_LABEL] || DECK_RULE_LABEL[f.rule] || f.rule) }}</td><td>{{ $t(QC_SEVERITY_LABEL[f.severity]) }}</td><td class="wrap"><bdi>{{ f.detail }}</bdi></td>
                </tr>
              </tbody>
            </table>
          </div>
        </template>
        <p v-else class="ss-muted">{{ $t('质检完成后在这里看结果') }}</p>
      </StepCard>

      <!-- ⑤ 用新数字刷新（演示文稿） -->
      <StepCard step-key="qc-refresh" :index="4" :title="steps.metas[4].title" :hint="steps.metas[4].hint" :runtime="steps.runtime['qc-refresh']" :is-current="steps.currentKey.value === 'qc-refresh'">
        <p v-if="info?.kind !== 'pptx'" class="ss-muted">{{ $t('只对演示文稿可用') }}</p>
        <template v-else>
          <div v-for="(m, i) in mapping" :key="i" class="fau-row">
            <input v-model.trim="m.from" type="text" dir="ltr" :placeholder="$t('旧值，如 $485M')" :data-test="`fau-qc-from-${i}`" />
            <i class="ri-arrow-right-line fau-dir-icon"></i>
            <input v-model.trim="m.to" type="text" dir="ltr" :placeholder="$t('新值，如 $512M')" :data-test="`fau-qc-to-${i}`" />
            <button v-if="mapping.length > 1" type="button" class="ss-link" @click="mapping.splice(i, 1)">{{ $t('删除') }}</button>
          </div>
          <div class="ss-actions">
            <button type="button" class="ss-btn sm ghost" @click="mapping.push({ from: '', to: '' })">{{ $t('再加一组') }}</button>
            <button type="button" class="ss-btn sm" :disabled="busy" data-test="fau-qc-plan" @click="planRefresh">{{ $t('生成刷新计划') }}</button>
          </div>
          <template v-if="plan">
            <div class="fau-table-wrap">
              <table class="fau-table">
                <thead><tr><th>{{ $t('页') }}</th><th>{{ $t('原文') }}</th><th>{{ $t('改成') }}</th></tr></thead>
                <tbody><tr v-for="(c, i) in plan.changes" :key="i" :data-test="`fau-qc-change-${i}`"><td><FauNum :value="c.slide" /></td><td><FauNum :value="c.before" /></td><td><FauNum :value="c.after" /></td></tr></tbody>
              </table>
            </div>
            <ul v-if="plan.flagged.length" class="fau-esc"><li v-for="(f, i) in plan.flagged" :key="i"><i class="ri-error-warning-line"></i>{{ $t('第 {n} 页可能是派生数字，未改：', { n: f.slide }) }}<bdi>{{ f.text }}</bdi></li></ul>
            <div class="ss-actions">
              <button type="button" class="ss-btn primary" :disabled="busy || !plan.changes.length" data-test="fau-qc-apply" @click="applyRefresh">{{ $t('确认刷新（另存新文件，原文件不动）') }}</button>
            </div>
          </template>
          <p v-if="refreshed" class="ss-note ok" data-test="fau-qc-refreshed"><i class="ri-check-line"></i>{{ $t('已另存：{p0}', { p0: refreshed }) }}</p>
        </template>
      </StepCard>
    </div>
    <p v-if="error" class="ss-note danger" data-test="fau-qc-error"><i class="ri-error-warning-line"></i>{{ error }}</p>
  </div>
</template>

<script setup lang="ts">
/**
 * P4 办公产出与质检（独立入口，不走七步、不签核）：分步——选文件 → 范围（选区 / 单表 / 整个模型）→ 质检 → 看报告 →（演示文稿）刷新数字。
 * 刷新先出计划，人点确认后另存新文件，原文件不动。
 */
import { reactive, ref } from 'vue';
import type { FauDeckChange, FauHome, FauLocale, FauQcReport, FauQcScope, FauQcSeverity } from '@totalclaw/ipc-contracts';
import { i18nKey, t as i18nT } from '../../../../i18n';
import { DECK_RULE_LABEL, QC_SEVERITY_LABEL, XLS_RULE_LABEL } from '../../../../../shared/financeAudit/auditLabels';
import StepCard from '../../../service-settlement/StepCard.vue';
import StickyProgress from '../../../service-settlement/StickyProgress.vue';
import { scrollToStep, useSteps } from '../../../service-settlement/shared';
import FauNum from '../../FauNum.vue';
import OutputLocalePicker from '../../OutputLocalePicker.vue';
import { errorMessage, fau } from '../../shared';
import './audit.css';

const props = defineProps<{ home: FauHome }>();
const steps = useSteps([
  { key: 'qc-pick', title: i18nT('选择文件'), hint: i18nT('Excel 底稿 / 模型，或演示文稿；只读检查，不改原文件') },
  { key: 'qc-scope', title: i18nT('质检范围'), hint: i18nT('选区、单表或整个模型（含资产负债平衡与隐藏表检查）') },
  { key: 'qc-run', title: i18nT('质检'), hint: i18nT('按表格与模型审计、演示文稿质检的规则逐项检查') },
  { key: 'qc-report', title: i18nT('查看报告'), hint: i18nT('按严重、重要、次要列出问题，另存一份质检报告') },
  { key: 'qc-refresh', title: i18nT('用新数字刷新'), hint: i18nT('演示文稿：按旧值 → 新值找出所有写法，先出计划，确认后另存新文件') },
]);
const SCOPES: FauQcScope[] = ['selection', 'sheet', 'model'];
const SCOPE_LABEL: Record<FauQcScope, string> = { selection: i18nKey('选区'), sheet: i18nKey('单表'), model: i18nKey('整个模型') };
const SEVERITIES: FauQcSeverity[] = ['critical', 'important', 'minor'];

const busy = ref(false);
const error = ref('');
const path = ref('');
const info = ref<{ kind: 'xlsx' | 'pptx'; file: string; sheets?: string[]; slides?: number } | null>(null);
const scope = ref<FauQcScope>('model');
const sheet = ref('');
const range = ref('');
const locale = ref<FauLocale>(props.home.company?.outputLocale || 'zh-CN');
const report = ref<FauQcReport | null>(null);
const mapping = reactive<Array<{ from: string; to: string }>>([{ from: '', to: '' }]);
const plan = ref<{ changes: FauDeckChange[]; flagged: { slide: number; text: string }[] } | null>(null);
const refreshed = ref('');

async function pick(kind: 'xlsx' | 'pptx'): Promise<void> {
  error.value = '';
  try {
    const r = await fau<{ paths: string[] }>('office-output.pick', { kind });
    if (!r.paths.length) return;
    steps.start('qc-pick');
    path.value = r.paths[0];
    info.value = await fau('office-output.inspect', { path: path.value });
    sheet.value = info.value?.sheets?.[0] || '';
    report.value = null; plan.value = null; refreshed.value = '';
    steps.resetAfter('qc-pick');
    steps.done('qc-pick', info.value?.file);
  } catch (e) { steps.fail('qc-pick', e); error.value = errorMessage(e); }
}
async function run(): Promise<void> {
  busy.value = true; error.value = '';
  steps.start('qc-run');
  try {
    report.value = await fau<FauQcReport>('office-output.check', { path: path.value, scope: scope.value, sheet: sheet.value, range: range.value, locale: locale.value });
    steps.done('qc-run', i18nT('问题 {n} 处', { n: report.value.findings.length }));
    steps.done('qc-report');
  } catch (e) { steps.fail('qc-run', e); error.value = errorMessage(e); } finally { busy.value = false; }
}
async function openReport(): Promise<void> {
  if (report.value) try { await fau('artifact.open', { path: report.value.reportPath }); } catch (e) { error.value = errorMessage(e); }
}
async function planRefresh(): Promise<void> {
  busy.value = true; error.value = ''; refreshed.value = '';
  steps.start('qc-refresh');
  try {
    plan.value = await fau('office-output.refreshPlan', { path: path.value, mapping: mapping.map((m) => ({ ...m })) });
    steps.set('qc-refresh', { state: 'todo', summary: i18nT('计划替换 {n} 处，待确认', { n: plan.value?.changes.length || 0 }) });
  } catch (e) { steps.fail('qc-refresh', e); error.value = errorMessage(e); } finally { busy.value = false; }
}
async function applyRefresh(): Promise<void> {
  busy.value = true; error.value = '';
  steps.start('qc-refresh');
  try {
    const r = await fau<{ path: string; changes: number }>('office-output.refreshApply', { path: path.value, mapping: mapping.map((m) => ({ ...m })), confirmed: true, locale: locale.value });
    refreshed.value = r.path;
    steps.done('qc-refresh', i18nT('已替换 {n} 处', { n: r.changes }));
  } catch (e) { steps.fail('qc-refresh', e); error.value = errorMessage(e); } finally { busy.value = false; }
}
</script>
