<template>
  <div class="ss-module">
    <ModuleHeader :meta="meta" />

    <nav class="fa-sub">
      <button type="button" class="fa-sub__btn" :class="{ active: mode === 'rec' }" @click="mode = 'rec'"><i class="ri-scales-3-line"></i>{{ $t('往来对账') }}</button>
      <button type="button" class="fa-sub__btn" :class="{ active: mode === 'aging' }" @click="mode = 'aging'"><i class="ri-time-line"></i>{{ $t('账龄分析') }}</button>
    </nav>

    <!-- 往来对账 -->
    <div v-show="mode === 'rec'" class="fa-split">
      <aside class="fa-list">
        <div class="ss-subhead">{{ $t('对账记录') }}</div>
        <ul>
          <li v-for="r in recs" :key="r.id" :class="{ active: r.id === recId }" @click="recId = r.id">
            <div class="fa-list__top">
              <strong>{{ r.counterparty || $t('未识别单位') }}</strong>
              <span class="ss-chip" :class="diffCount(r) ? 'warn' : 'ok'">{{ diffCount(r) ? $t('{n} 处差异', { n: diffCount(r) }) : $t('一致') }}</span>
            </div>
            <div class="fa-list__meta">
              <span>{{ r.side === 'ar' ? $t('应收') : $t('应付') }} · {{ r.asOf }}</span>
              <button type="button" class="ss-link" @click.stop="removeRec(r.id)">{{ $t('删除') }}</button>
            </div>
          </li>
          <li v-if="!recs.length" class="ss-empty">{{ $t('还没有对账记录') }}</li>
        </ul>
      </aside>

      <section class="fa-detail">
        <StickyProgress :title="$t('往来对账')" :metas="recMetas" :runtime="recRuntime" :current-key="recCurrent" @jump="jump" />
        <div class="ss-steps">
          <StepCard step-key="rec-setup" :index="0" :title="recMetas[0].title" :hint="recMetas[0].hint" :runtime="recRuntime['rec-setup']">
            <div class="ss-grid">
              <label class="ss-field"><span>{{ $t('对账方向') }}</span>
                <select v-model="recForm.side"><option value="ar">{{ $t('应收（客户欠我们）') }}</option><option value="ap">{{ $t('应付（我们欠供应商）') }}</option></select>
              </label>
              <label class="ss-field"><span>{{ $t('对方单位（可空，自动识别）') }}</span><input v-model.trim="recForm.counterparty" type="text" /></label>
              <label class="ss-field"><span>{{ $t('截止日') }}</span><input v-model="recForm.asOf" type="date" /></label>
            </div>
          </StepCard>

          <StepCard step-key="rec-files" :index="1" :title="recMetas[1].title" :hint="recMetas[1].hint" :runtime="recRuntime['rec-files']">
            <div class="fa-two">
              <div class="fa-filebox">
                <FileDrop kind="excel" :multi="false" :label="$t('我方台账（往来明细）')" :hint="$t('需要：日期、金额（或借方 / 贷方）；可选：单号、摘要')" :disabled="!!busy" @picked="(p) => (recForm.oursPath = p[0])" />
                <p v-if="recForm.oursPath" class="ss-muted fa-path"><i class="ri-file-excel-2-line"></i>{{ baseName(recForm.oursPath) }}</p>
              </div>
              <div class="fa-filebox">
                <FileDrop kind="excel" :multi="false" :label="$t('对方对账单')" :hint="$t('客户 / 供应商发来的对账单 Excel')" :disabled="!!busy" @picked="(p) => (recForm.theirsPath = p[0])" />
                <p v-if="recForm.theirsPath" class="ss-muted fa-path"><i class="ri-file-excel-2-line"></i>{{ baseName(recForm.theirsPath) }}</p>
              </div>
            </div>
            <div class="ss-actions">
              <button type="button" class="ss-btn primary" :disabled="!!busy || !recForm.oursPath || !recForm.theirsPath" @click="runRec">
                <i :class="busy === 'rec-files' ? 'ri-loader-4-line spin' : 'ri-git-compare-line'"></i>{{ $t('逐笔比对') }}
              </button>
              <span class="ss-muted">{{ $t('先按单号匹配，再按金额相同、日期相差 7 天内匹配') }}</span>
            </div>
          </StepCard>

          <StepCard step-key="rec-result" :index="2" :title="recMetas[2].title" :hint="recMetas[2].hint" :runtime="recRuntime['rec-result']">
            <template v-if="rec">
              <div class="ss-kpis">
                <div class="ss-kpi"><small>{{ $t('我方余额') }}</small><strong>{{ fmtMoney(rec.balanceOurs) }}</strong></div>
                <div class="ss-kpi"><small>{{ $t('对方余额') }}</small><strong>{{ fmtMoney(rec.balanceTheirs) }}</strong></div>
                <div class="ss-kpi accent"><small>{{ $t('差额') }}</small><strong>{{ fmtMoney(rec.balanceOurs - rec.balanceTheirs) }}</strong></div>
                <div class="ss-kpi"><small>{{ $t('差异笔数') }}</small><strong>{{ diffCount(rec) }}</strong></div>
              </div>
              <label class="ss-field ss-check fa-inline"><input v-model="onlyDiff" type="checkbox" /><span>{{ $t('只看差异') }}</span></label>
              <div class="ss-table-wrap">
                <table class="ss-table">
                  <thead><tr><th>{{ $t('状态') }}</th><th>{{ $t('我方日期') }}</th><th>{{ $t('我方单号') }}</th><th class="num">{{ $t('我方金额') }}</th><th>{{ $t('对方日期') }}</th><th>{{ $t('对方单号') }}</th><th class="num">{{ $t('对方金额') }}</th><th class="num">{{ $t('差额') }}</th><th>{{ $t('说明') }}</th></tr></thead>
                  <tbody>
                    <tr v-for="(m, i) in shownMatches" :key="i" :class="{ bad: m.status !== 'matched' }">
                      <td><span class="ss-chip" :class="statusChip(m.status)">{{ statusLabel(m.status) }}</span></td>
                      <td>{{ m.ours?.date || '' }}</td><td>{{ m.ours?.ref || '' }}</td><td class="num">{{ m.ours ? fmtMoney(m.ours.amount) : '' }}</td>
                      <td>{{ m.theirs?.date || '' }}</td><td>{{ m.theirs?.ref || '' }}</td><td class="num">{{ m.theirs ? fmtMoney(m.theirs.amount) : '' }}</td>
                      <td class="num">{{ m.status === 'matched' ? '' : fmtMoney(m.diff) }}</td>
                      <td>{{ m.note || '' }}</td>
                    </tr>
                    <tr v-if="!shownMatches.length"><td colspan="9" class="ss-empty">{{ $t('没有差异') }}</td></tr>
                  </tbody>
                </table>
              </div>
            </template>
            <p v-else class="ss-muted">{{ $t('比对后在这里看差异') }}</p>
          </StepCard>

          <StepCard step-key="rec-letter" :index="3" :title="recMetas[3].title" :hint="recMetas[3].hint" :runtime="recRuntime['rec-letter']">
            <template v-if="rec?.letter">
              <pre class="fa-letter">{{ rec.letter }}</pre>
              <div class="ss-actions">
                <button type="button" class="ss-btn sm ghost" @click="copy(rec.letter)"><i class="ri-file-copy-line"></i>{{ $t('复制对账函') }}</button>
                <button type="button" class="ss-btn sm primary" :disabled="!!busy" @click="exportRec"><i :class="busy === 'rec-letter' ? 'ri-loader-4-line spin' : 'ri-download-2-line'"></i>{{ $t('导出比对表和对账函') }}</button>
                <template v-if="rec.exportPath">
                  <code class="fa-out">{{ rec.exportPath }}</code>
                  <button type="button" class="ss-link" @click="open(rec.exportPath)">{{ $t('打开') }}</button>
                  <button type="button" class="ss-link" @click="open(rec.exportPath, true)">{{ $t('所在文件夹') }}</button>
                </template>
              </div>
              <p class="ss-muted">{{ $t('对账函是草稿，经财务复核并由有权人签章后再发出，工作台不会自动发送。') }}</p>
            </template>
            <p v-else class="ss-muted">{{ $t('比对完成后生成对账函') }}</p>
          </StepCard>
        </div>
      </section>
    </div>

    <!-- 账龄分析 -->
    <div v-show="mode === 'aging'" class="fa-split">
      <aside class="fa-list">
        <div class="ss-subhead">{{ $t('账龄分析记录') }}</div>
        <ul>
          <li v-for="a in agings" :key="a.id" :class="{ active: a.id === agingId }" @click="agingId = a.id">
            <div class="fa-list__top">
              <strong>{{ a.side === 'ar' ? $t('应收') : $t('应付') }} · {{ a.asOf }}</strong>
              <span class="ss-chip" :class="a.warnings.length ? 'warn' : 'ok'">{{ $t('{n} 条预警', { n: a.warnings.length }) }}</span>
            </div>
            <div class="fa-list__meta">
              <span class="fa-ellipsis">{{ a.fileName }}</span>
              <button type="button" class="ss-link" @click.stop="removeAging(a.id)">{{ $t('删除') }}</button>
            </div>
          </li>
          <li v-if="!agings.length" class="ss-empty">{{ $t('还没有账龄分析') }}</li>
        </ul>
      </aside>

      <section class="fa-detail">
        <StickyProgress :title="$t('账龄分析')" :metas="agingMetas" :runtime="agingRuntime" :current-key="agingCurrent" @jump="jump" />
        <div class="ss-steps">
          <StepCard step-key="age-run" :index="0" :title="agingMetas[0].title" :hint="agingMetas[0].hint" :runtime="agingRuntime['age-run']">
            <div class="ss-grid">
              <label class="ss-field"><span>{{ $t('方向') }}</span>
                <select v-model="agingForm.side"><option value="ar">{{ $t('应收') }}</option><option value="ap">{{ $t('应付') }}</option></select>
              </label>
              <label class="ss-field"><span>{{ $t('截止日') }}</span><input v-model="agingForm.asOf" type="date" /></label>
              <label class="ss-field"><span>{{ $t('默认账期（天）') }}</span><input v-model.number="agingForm.termsDays" type="number" min="0" /></label>
            </div>
            <FileDrop kind="excel" :multi="false" :label="$t('上传应收 / 应付台账')" :hint="$t('需要：往来单位、日期、金额（或余额）；可选：单号、到期日、账期、已收付')" :disabled="!!busy" @picked="(p) => runAging(p[0])" />
          </StepCard>

          <StepCard step-key="age-buckets" :index="1" :title="agingMetas[1].title" :hint="agingMetas[1].hint" :runtime="agingRuntime['age-buckets']">
            <template v-if="aging">
              <div class="ss-kpis">
                <div v-for="b in aging.buckets" :key="b.bucket" class="ss-kpi"><small>{{ $t('{p0}（{n} 笔）', { p0: b.bucket, n: b.count }) }}</small><strong>{{ fmtMoney(b.amount) }}</strong></div>
              </div>
              <div class="ss-table-wrap">
                <table class="ss-table">
                  <thead><tr><th>{{ $t('往来单位') }}</th><th class="num">{{ $t('未结') }}</th><th class="num">{{ $t('其中逾期') }}</th><th class="num">{{ $t('最长逾期（天）') }}</th></tr></thead>
                  <tbody>
                    <tr v-for="c in aging.byCounterparty" :key="c.counterparty" :class="{ bad: c.overdue > 0 }">
                      <td>{{ c.counterparty }}</td><td class="num">{{ fmtMoney(c.outstanding) }}</td><td class="num">{{ c.overdue ? fmtMoney(c.overdue) : '' }}</td><td class="num">{{ c.maxOverdueDays || '' }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </template>
            <p v-else class="ss-muted">{{ $t('上传台账后显示') }}</p>
          </StepCard>

          <StepCard step-key="age-warn" :index="2" :title="agingMetas[2].title" :hint="agingMetas[2].hint" :runtime="agingRuntime['age-warn']">
            <ul v-if="aging?.warnings.length" class="fa-findings">
              <li v-for="(w, i) in aging.warnings" :key="i">
                <span class="ss-chip" :class="levelChip(w.level)">{{ levelLabel(w.level) }}</span>
                <div><strong>{{ w.title }}</strong><p class="fa-pre">{{ w.detail }}</p><p class="ss-muted">{{ w.suggestion }}</p></div>
              </li>
            </ul>
            <p v-else-if="aging" class="ss-note ok"><i class="ri-check-line"></i>{{ $t('没有逾期款项') }}</p>
          </StepCard>

          <StepCard step-key="age-dunning" :index="3" :title="agingMetas[3].title" :hint="agingMetas[3].hint" :runtime="agingRuntime['age-dunning']">
            <template v-if="aging">
              <div class="ss-actions">
                <select v-model="dunningCp" class="fa-select">
                  <option value="">{{ $t('选择逾期单位') }}</option>
                  <option v-for="c in overdueCps" :key="c" :value="c">{{ c }}</option>
                </select>
                <button type="button" class="ss-btn sm primary" :disabled="!dunningCp || !!busy" @click="makeDunning"><i class="ri-mail-send-line"></i>{{ $t('生成催款函') }}</button>
                <button type="button" class="ss-btn sm ghost" :disabled="!!busy" @click="exportAging"><i :class="busy === 'age-dunning' ? 'ri-loader-4-line spin' : 'ri-download-2-line'"></i>{{ $t('导出账龄表') }}</button>
                <template v-if="agingExport">
                  <code class="fa-out">{{ agingExport }}</code>
                  <button type="button" class="ss-link" @click="open(agingExport)">{{ $t('打开') }}</button>
                </template>
              </div>
              <template v-if="dunningText">
                <pre class="fa-letter">{{ dunningText }}</pre>
                <button type="button" class="ss-btn sm ghost" @click="copy(dunningText)"><i class="ri-file-copy-line"></i>{{ $t('复制催款函') }}</button>
                <p class="ss-muted">{{ $t('催款函是草稿，由财务复核后自行发出。') }}</p>
              </template>
            </template>
          </StepCard>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * 往来对账：我方台账 ↔ 对方对账单逐笔比对 → 差额 → 对账函；账龄分析 → 逾期预警 → 催款函。
 */
import { computed, reactive, ref, watch } from 'vue';
import type { FaAgingRun, FaRecMatch, FaReconcileRun } from '@totalclaw/ipc-contracts';
import { useNotificationStore } from '../../stores/notification';
import { t as i18nT } from '../../i18n';
import StepCard from '../service-settlement/StepCard.vue';
import StickyProgress from '../service-settlement/StickyProgress.vue';
import ModuleHeader from './ModuleHeader.vue';
import FileDrop from './FileDrop.vue';
import {
  errorMessage, fa, faState, fmtMoney, levelChip, levelLabel, openPath, refreshState, scrollToStep,
  type FaModuleMeta, type StepMeta, type StepRuntime,
} from './shared';

defineProps<{ meta: FaModuleMeta; focus?: any }>();
defineEmits<{ (e: 'goto', module: string, payload?: any): void }>();
const notif = useNotificationStore();

const today = () => new Date().toISOString().slice(0, 10);
const mode = ref<'rec' | 'aging'>('rec');
const busy = ref('');
const errors = ref<Record<string, string>>({});

const recs = computed(() => faState.value?.data.reconciles || []);
const agings = computed(() => faState.value?.data.agings || []);
const recId = ref('');
const agingId = ref('');
const rec = computed<FaReconcileRun | null>(() => recs.value.find((r) => r.id === recId.value) || null);
const aging = computed<FaAgingRun | null>(() => agings.value.find((a) => a.id === agingId.value) || null);
watch(recs, (l) => { if (!recId.value && l.length) recId.value = l[0].id; }, { immediate: true });
watch(agings, (l) => { if (!agingId.value && l.length) agingId.value = l[0].id; }, { immediate: true });

const recForm = reactive({ side: 'ar' as 'ar' | 'ap', counterparty: '', asOf: today(), oursPath: '', theirsPath: '' });
const agingForm = reactive({ side: 'ar' as 'ar' | 'ap', asOf: today(), termsDays: 30 });
const onlyDiff = ref(true);
const dunningCp = ref('');
const dunningText = ref('');
const agingExport = ref('');
watch(agingId, () => { dunningCp.value = ''; dunningText.value = ''; agingExport.value = ''; });

const recMetas: StepMeta[] = [
  { key: 'rec-setup', title: i18nT('对账设置'), hint: i18nT('方向、对方单位、截止日') },
  { key: 'rec-files', title: i18nT('上传台账与对账单'), hint: i18nT('我方往来明细 + 对方发来的对账单') },
  { key: 'rec-result', title: i18nT('差异结果'), hint: i18nT('逐笔比对，自动标记差额') },
  { key: 'rec-letter', title: i18nT('对账函'), hint: i18nT('按差异生成对账函，导出比对表') },
];
const agingMetas: StepMeta[] = [
  { key: 'age-run', title: i18nT('上传台账'), hint: i18nT('应收 / 应付未结明细') },
  { key: 'age-buckets', title: i18nT('账龄汇总'), hint: i18nT('按账龄段和往来单位汇总') },
  { key: 'age-warn', title: i18nT('逾期预警'), hint: i18nT('逾期与长期挂账') },
  { key: 'age-dunning', title: i18nT('催款函与导出'), hint: i18nT('选逾期单位生成催款函') },
];

function st(key: string, done: boolean, summary?: string): StepRuntime {
  return busy.value === key ? { state: 'running' } : errors.value[key] ? { state: 'failed', error: errors.value[key] } : done ? { state: 'done', summary } : { state: 'todo' };
}
const recRuntime = computed<Record<string, StepRuntime>>(() => ({
  'rec-setup': st('rec-setup', !!rec.value || !!recForm.asOf, recForm.side === 'ar' ? i18nT('应收') : i18nT('应付')),
  'rec-files': st('rec-files', !!rec.value, rec.value ? `${rec.value.oursFile || ''} / ${rec.value.theirsFile || ''}` : ''),
  'rec-result': st('rec-result', !!rec.value, rec.value ? i18nT('{n} 处差异', { n: diffCount(rec.value) }) : ''),
  'rec-letter': st('rec-letter', !!rec.value?.exportPath),
}));
const recCurrent = computed(() => recMetas.find((m) => recRuntime.value[m.key].state !== 'done')?.key || 'rec-letter');
const agingRuntime = computed<Record<string, StepRuntime>>(() => ({
  'age-run': st('age-run', !!aging.value, aging.value?.fileName),
  'age-buckets': st('age-buckets', !!aging.value, aging.value ? i18nT('{n} 家往来单位', { n: aging.value.byCounterparty.length }) : ''),
  'age-warn': st('age-warn', !!aging.value, aging.value ? i18nT('{n} 条预警', { n: aging.value.warnings.length }) : ''),
  'age-dunning': st('age-dunning', !!dunningText.value || !!agingExport.value),
}));
const agingCurrent = computed(() => agingMetas.find((m) => agingRuntime.value[m.key].state !== 'done')?.key || 'age-dunning');

const shownMatches = computed(() => (rec.value?.matches || []).filter((m) => !onlyDiff.value || m.status !== 'matched'));
const overdueCps = computed(() => (aging.value?.byCounterparty || []).filter((c) => c.overdue > 0).map((c) => c.counterparty));

function diffCount(r: FaReconcileRun): number { return r.matches.filter((m) => m.status !== 'matched').length; }
function statusLabel(s: FaRecMatch['status']): string {
  return { matched: i18nT('一致'), amount_diff: i18nT('金额不符'), only_ours: i18nT('我方有对方无'), only_theirs: i18nT('对方有我方无') }[s];
}
function statusChip(s: FaRecMatch['status']): string { return s === 'matched' ? 'ok' : s === 'amount_diff' ? 'bad' : 'warn'; }
function baseName(p: string): string { return p.split(/[\\/]/).pop() || p; }

async function run(key: string, fn: () => Promise<unknown>): Promise<boolean> {
  busy.value = key;
  errors.value = { ...errors.value, [key]: '' };
  void scrollToStep(key);
  try { await fn(); await refreshState(); return true; } catch (e) { errors.value = { ...errors.value, [key]: errorMessage(e) }; return false; } finally { busy.value = ''; }
}
async function runRec(): Promise<void> {
  await run('rec-files', async () => {
    const r = await fa<FaReconcileRun>('rec.run', { side: recForm.side, oursPath: recForm.oursPath, theirsPath: recForm.theirsPath, asOf: recForm.asOf, counterparty: recForm.counterparty || undefined });
    recId.value = r.id;
  });
  if (rec.value) void scrollToStep('rec-result');
}
async function exportRec(): Promise<void> {
  if (!rec.value) return;
  await run('rec-letter', () => fa('rec.export', { id: rec.value!.id }));
}
async function removeRec(id: string): Promise<void> {
  if (!window.confirm(i18nT('删除这条对账记录？'))) return;
  try { await fa('rec.remove', { id }); if (recId.value === id) recId.value = ''; await refreshState(); } catch (e) { notif.error(errorMessage(e)); }
}
async function runAging(path: string): Promise<void> {
  await run('age-run', async () => {
    const r = await fa<FaAgingRun>('aging.run', { side: agingForm.side, path, asOf: agingForm.asOf, termsDays: agingForm.termsDays });
    agingId.value = r.id;
  });
}
async function makeDunning(): Promise<void> {
  if (!aging.value || !dunningCp.value) return;
  busy.value = 'age-dunning';
  errors.value = { ...errors.value, 'age-dunning': '' };
  try { dunningText.value = await fa<string>('aging.dunning', { id: aging.value.id, counterparty: dunningCp.value }); } catch (e) { errors.value = { ...errors.value, 'age-dunning': errorMessage(e) }; } finally { busy.value = ''; }
}
async function exportAging(): Promise<void> {
  if (!aging.value) return;
  busy.value = 'age-dunning';
  errors.value = { ...errors.value, 'age-dunning': '' };
  try { agingExport.value = (await fa<{ path: string }>('aging.export', { id: aging.value.id })).path; } catch (e) { errors.value = { ...errors.value, 'age-dunning': errorMessage(e) }; } finally { busy.value = ''; }
}
async function removeAging(id: string): Promise<void> {
  if (!window.confirm(i18nT('删除这条账龄分析？'))) return;
  try { await fa('aging.remove', { id }); if (agingId.value === id) agingId.value = ''; await refreshState(); } catch (e) { notif.error(errorMessage(e)); }
}
async function copy(text: string): Promise<void> {
  try { await navigator.clipboard.writeText(text); notif.success(i18nT('已复制')); } catch (e) { notif.error(errorMessage(e)); }
}
function open(path: string, reveal = false): void { openPath(path, reveal).catch((e) => notif.error(errorMessage(e))); }
function jump(key: string): void { void scrollToStep(key); }
</script>

<style scoped>
.fa-sub { display: flex; gap: 6px; }
.fa-sub__btn { display: inline-flex; gap: 6px; align-items: center; padding: 6px 12px; border-radius: var(--radius-pill); border: 1px solid var(--color-border); background: var(--color-bg-card); color: var(--color-text-secondary); cursor: pointer; font: inherit; font-size: 12.5px; font-weight: 600; }
.fa-sub__btn.active { border-color: var(--color-brand); color: var(--color-brand); background: color-mix(in srgb, var(--color-brand) 8%, var(--color-bg-card)); }
.fa-split { display: grid; grid-template-columns: minmax(220px, 270px) 1fr; gap: 14px; align-items: start; }
@media (max-width: 960px) { .fa-split { grid-template-columns: 1fr; } }
.fa-list { display: grid; gap: 8px; border: 1px solid var(--color-border); border-radius: var(--radius-6); background: var(--color-bg-card); padding: 10px; position: sticky; top: 0; max-height: calc(100vh - 160px); overflow: hidden; grid-template-rows: auto 1fr; }
.fa-list ul { list-style: none; margin: 0; padding: 0; display: grid; gap: 6px; overflow-y: auto; align-content: start; }
.fa-list li { padding: 8px 10px; border-radius: var(--radius-4); border: 1px solid transparent; cursor: pointer; display: grid; gap: 3px; background: var(--color-bg-primary); }
.fa-list li.active { border-color: var(--color-brand); background: color-mix(in srgb, var(--color-brand) 8%, var(--color-bg-card)); }
.fa-list__top { display: flex; justify-content: space-between; gap: 6px; align-items: center; font-size: var(--font-size-md); }
.fa-list__meta { display: flex; gap: 8px; font-size: var(--font-size-xs); color: var(--color-text-secondary); align-items: center; justify-content: space-between; }
.fa-ellipsis { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.fa-detail { display: grid; gap: 12px; min-width: 0; }
.fa-two { display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 10px; }
.fa-filebox { display: grid; gap: 4px; }
.fa-path { display: flex; gap: 4px; align-items: center; margin: 0; font-size: var(--font-size-sm); }
.fa-inline { flex-direction: row !important; align-items: center; gap: 6px; }
.ss-check { flex-direction: row !important; align-items: center; gap: 6px; }
.fa-letter { white-space: pre-wrap; font-family: inherit; font-size: var(--font-size-md); line-height: 1.7; margin: 0; padding: 12px 14px; border-radius: var(--radius-4); background: var(--color-bg-primary); border: 1px solid var(--color-border); max-height: 420px; overflow-y: auto; }
.fa-out { font-size: 11.5px; color: var(--color-text-secondary); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 360px; }
.fa-select { height: 32px; border-radius: var(--radius-3); border: 1px solid var(--color-border); background: var(--color-bg-input); color: var(--color-text-primary); font: inherit; padding: 0 6px; min-width: 200px; }
.fa-findings { list-style: none; margin: 0; padding: 0; display: grid; gap: 8px; }
.fa-findings li { display: flex; gap: 8px; align-items: flex-start; font-size: 12.5px; }
.fa-findings p { margin: 2px 0 0; }
.fa-pre { white-space: pre-wrap; }
.spin { animation: fa-spin 1s linear infinite; }
@keyframes fa-spin { to { transform: rotate(360deg); } }
</style>
