<template>
  <section class="ss-module">
    <StickyProgress :title="$t('更新报废台账')" :metas="steps.metas" :runtime="steps.runtime" :current-key="steps.currentKey.value" @jump="scrollToStep" />

    <div class="ss-steps">
      <!-- 第 1 步：数据源（鉴定表 / 报废条码 / 可选模板 / 可选流程发起日期） -->
      <StepCard step-key="source" :index="0" :title="steps.metas[0].title" :hint="steps.metas[0].hint" :runtime="steps.runtime.source" :is-current="steps.currentKey.value === 'source'">
        <p class="ss-note info"><i class="ri-information-line"></i>{{ $t('OEM 报废用「xx鉴定表」，拆零报废用「报废条码」。把文件留在流程号命名的文件夹里（如 FYSQ026080001005）再选进来，流程号会自动带出；供应商名从文件名「退XX鉴定表」识别；认不出的在下面「来源识别」表里补填。台账只记非供应商责任的不可维修台数。') }}</p>
        <div class="ss-grid two">
          <FileDropField :label="$t('OEM 报废 · 鉴定表（可多选）')" :hint="$t('例如「2026年7月10日退奥荣鉴定表（115台）.xlsx」，有「汇总」sheet 时按汇总计')" :files="oemChips" @picked="(p) => addFiles(p, 'oem')" @remove="(p) => removePath(p,'oem')" />
          <FileDropField :label="$t('拆零报废 · 报废条码（可多选）')" :hint="$t('例如「报废条码(368).xls」')" :files="barcodeChips" @picked="(p) => addFiles(p, 'barcode')" @remove="(p) => removePath(p,'barcode')" />
        </div>
        <div class="ss-actions">
          <button type="button" class="ss-btn ghost" @click="pickFolder"><i class="ri-folder-add-line"></i>{{ $t('选一个流程文件夹，按文件名自动分类加入') }}</button>
          <button type="button" class="ss-btn ghost" @click="loadDownloads"><i class="ri-download-cloud-2-line"></i>{{ $t('从浏览器下载记录导入') }}</button>
        </div>
        <div v-if="downloads.length" class="ss-dl">
          <div class="ss-subhead">{{ $t('内置浏览器最近下载的表格（点一下按文件名分类加入）') }}</div>
          <button v-for="d in downloads" :key="d.path" type="button" class="ss-chip brand" :disabled="hasFile(d.path)" @click="addClassified([d.path])">
            <i class="ri-file-excel-2-line"></i>{{ d.filename }}
          </button>
        </div>

        <!-- 来源识别：每份文件的供应商 / 流程号（认不出的在这里补填），放错框 / 坏文件也在这里报 -->
        <template v-if="sourceRows.length">
          <div class="ss-subhead ss-sources__head">
            {{ $t('来源识别：供应商 / 流程号认不出的在这里补填') }}
            <span v-if="inspecting" class="ss-chip"><i class="ri-loader-4-line spin"></i>{{ $t('识别中…') }}</span>
          </div>
          <div class="ss-table-wrap ss-sources" data-testid="scrap-sources">
            <table class="ss-table">
              <thead>
                <tr>
                  <th>{{ $t('文件') }}</th><th>{{ $t('类型') }}</th><th>{{ $t('自制/OEM（供应商）') }}</th><th>{{ $t('流程号') }}</th>
                  <th class="num">{{ $t('台数') }}</th><th class="num">{{ $t('记入') }}</th><th>{{ $t('状态') }}</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="s in sourceRows" :key="s.path" :class="{ bad: s.error }">
                  <td :title="s.path">{{ s.fileName }}</td>
                  <td>{{ s.kind === 'oem' ? $t('OEM 鉴定表') : $t('报废条码') }}</td>
                  <td>
                    <span v-if="s.kind === 'barcode'">{{ $t('自制') }}</span>
                    <input
                      v-else type="text" class="ss-sources__input" :class="{ missing: !s.supplier }" data-role="supplier"
                      :value="supplierEdits[s.path] ?? s.supplier" :placeholder="$t('认不出，请填供应商名')" :title="$t('文件名「退XX鉴定表」里认不出时在这里填')"
                      @input="onEdit(supplierEdits, s.path, $event)"
                    />
                  </td>
                  <td>
                    <input
                      type="text" class="ss-sources__input" :class="{ missing: !s.processNo }" data-role="process-no"
                      :value="processNoEdits[s.path] ?? s.processNo" :placeholder="$t('认不出，请填流程号')" :title="$t('文件所在文件夹不是流程号命名时在这里填（如 FYSQ026080001005）')"
                      @input="onEdit(processNoEdits, s.path, $event)"
                    />
                  </td>
                  <td class="num">{{ s.error ? '—' : s.units }}</td>
                  <td class="num">{{ s.error ? '—' : s.kept }}</td>
                  <td>
                    <span v-if="s.error" class="ss-chip bad" :title="s.error"><i class="ri-error-warning-line"></i>{{ $t('解析失败') }}</span>
                    <span v-else-if="(s.kind === 'oem' && !s.supplier) || !s.processNo" class="ss-chip warn">{{ $t('待补填') }}</span>
                    <span v-else class="ss-chip ok">{{ $t('已识别') }}</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <p v-for="s in sourceErrors" :key="s.path" class="ss-note danger"><i class="ri-error-warning-line"></i>{{ s.error }}</p>
        </template>

        <div class="ss-grid two">
          <FileDropField :label="$t('报废台账模板（可选）')" :hint="$t('不选按内置 16 列模板输出；选了按模板真表头顺序输出')" :multi="false" compact :files="templateChips" @picked="(p) => (templatePath = p[0] || '')" @remove="templatePath = ''" />
          <label class="ss-field"><span>{{ $t('流程发起日期（可选，来源文件里没有这一项，不填留空）') }}</span><input v-model="startDate" type="date" /></label>
        </div>
        <label class="ss-check">
          <input v-model="includeReason" type="checkbox" />
          <span>{{ $t('台账末尾追加「报废原因」列（默认不加：8.21 模板的「鉴定结果」是裸「不可维修」，原因不拼进去）') }}</span>
        </label>
        <div class="ss-actions">
          <span class="grow"></span>
          <button type="button" class="ss-btn primary" :disabled="!hasSources || sourceErrors.length > 0 || steps.isRunning()" :title="sourceErrors.length ? $t('有文件解析失败，先移除或放到正确的框') : ''" @click="confirmSource"><i class="ri-check-line"></i>{{ $t('文件都齐了，去选渠道对照表') }}</button>
        </div>
      </StepCard>

      <!-- 第 2 步：渠道对照表 -->
      <StepCard step-key="lookup" :index="1" :title="steps.metas[1].title" :hint="steps.metas[1].hint" :runtime="steps.runtime.lookup" :is-current="steps.currentKey.value === 'lookup'">
        <FileDropField :label="$t('渠道匹配对照表 Excel')" :hint="$t('列：条形码 / 产品型号 / 店铺（至少一列）| 渠道 | 产品类型')" :multi="true" :disabled="lookupLoading || steps.isRunning()" :files="lookupChips" @picked="loadLookups" @remove="clearLookup" />
        <p class="ss-note info">{{ $t('支持多表；依次按条码 → 型号 → 店铺匹配渠道。重复条码取首条有效记录；型号或店铺对应多个渠道时继续下一级。') }}</p>
        <TableMapping v-for="lookup in lookups" :key="lookup.path" :table="lookup" :roles="LOOKUP_ROLES" @update="(m) => updateLookup(lookup, m)" @sheet="(s) => loadLookup(lookup.path, s)" />
        <div class="ss-actions">
          <button type="button" class="ss-btn primary" :disabled="!lookupReady || steps.runtime.source.state !== 'done' || steps.isRunning()" @click="confirmLookup"><i class="ri-check-line"></i>{{ $t('对照表没问题，去生成台账') }}</button>
        </div>
      </StepCard>

      <!-- 第 3 步：生成台账 -->
      <StepCard step-key="build" :index="2" :title="steps.metas[2].title" :hint="steps.metas[2].hint" :runtime="steps.runtime.build" :is-current="steps.currentKey.value === 'build'">
        <div class="ss-actions">
          <button type="button" class="ss-btn primary" :disabled="steps.runtime.lookup.state !== 'done' || steps.isRunning()" @click="build">
            <i :class="steps.runtime.build.state === 'running' ? 'ri-loader-4-line spin' : 'ri-table-line'"></i>{{ $t('生成报废台账') }}
          </button>
          <template v-if="result">
            <button type="button" class="ss-btn" @click="openPath(result.outputPath)"><i class="ri-file-excel-2-line"></i>{{ $t('打开台账工作簿') }}</button>
            <button type="button" class="ss-btn ghost" @click="openPath(result.outputDir, true)"><i class="ri-folder-open-line"></i>{{ $t('打开输出目录') }}</button>
          </template>
        </div>
        <template v-if="result">
          <div class="ss-kpis">
            <div class="ss-kpi"><small>{{ $t('鉴定表台数') }}</small><strong>{{ result.counts.oemUnits }}</strong></div>
            <div class="ss-kpi accent"><small>{{ $t('记入台账（非供应商责任·不可维修）') }}</small><strong>{{ result.counts.oemKept }}</strong></div>
            <div class="ss-kpi"><small>{{ $t('剔除·供应商责任') }}</small><strong>{{ result.counts.oemDroppedSupplier }}</strong></div>
            <div class="ss-kpi"><small>{{ $t('剔除·可维修') }}</small><strong>{{ result.counts.oemDroppedRepairable }}</strong></div>
            <div class="ss-kpi"><small>{{ $t('报废条码台数') }}</small><strong>{{ result.counts.barcodeUnits }}</strong></div>
            <div class="ss-kpi accent"><small>{{ $t('台账总行数') }}</small><strong>{{ result.counts.total }}</strong></div>
            <div class="ss-kpi"><small>{{ $t('已匹配渠道') }}</small><strong>{{ result.counts.matched }}</strong></div>
            <div class="ss-kpi" :class="{ accent: result.counts.unmatched }"><small>{{ $t('未匹配') }}</small><strong>{{ result.counts.unmatched }}</strong></div>
          </div>
          <p v-for="(w, i) in result.warnings" :key="i" class="ss-note warn"><i class="ri-alert-line"></i>{{ w }}</p>
          <div class="ss-subhead">{{ $t('来源文件') }}</div>
          <div class="ss-table-wrap" style="max-height: 180px; overflow: auto;">
            <table class="ss-table">
              <thead><tr><th>{{ $t('文件') }}</th><th>{{ $t('类型') }}</th><th>{{ $t('工作表') }}</th><th>{{ $t('流程号') }}</th><th>{{ $t('供应商') }}</th><th class="num">{{ $t('台数') }}</th><th class="num">{{ $t('记入') }}</th></tr></thead>
              <tbody>
                <tr v-for="s in result.sources" :key="s.path">
                  <td :title="s.path">{{ s.fileName }}</td><td>{{ s.kind === 'oem' ? $t('OEM 鉴定表') : $t('报废条码') }}</td><td>{{ s.sheets.join(' / ') }}</td>
                  <td>{{ s.processNo || '—' }}</td><td>{{ s.supplier || (s.kind === 'barcode' ? $t('自制') : '—') }}</td><td class="num">{{ s.units }}</td><td class="num">{{ s.kept }}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div class="ss-subhead">{{ $t('台账预览（前 {n} 行，共 {total} 行）', { n: result.preview.length, total: result.counts.total }) }}</div>
          <div class="ss-table-wrap" style="max-height: 320px; overflow: auto;">
            <table class="ss-table">
              <thead><tr><th v-for="h in result.headers" :key="h">{{ h }}</th></tr></thead>
              <tbody><tr v-for="(row, i) in result.preview" :key="i"><td v-for="h in result.headers" :key="h">{{ row[h] }}</td></tr></tbody>
            </table>
          </div>
          <div class="ss-file-out"><i class="ri-file-excel-2-line"></i><code>{{ result.outputPath }}</code></div>
        </template>
      </StepCard>

      <!-- 第 4 步：渠道 × 品类汇总 -->
      <StepCard step-key="summary" :index="3" :title="steps.metas[3].title" :hint="steps.metas[3].hint" :runtime="steps.runtime.summary" :is-current="steps.currentKey.value === 'summary'">
        <div class="ss-actions">
          <button type="button" class="ss-btn primary" :disabled="!result || steps.isRunning()" @click="confirmSummary"><i class="ri-file-excel-2-line"></i>{{ $t('打开《各渠道各品类报废费用汇总表》') }}</button>
          <button v-if="result" type="button" class="ss-btn ghost" @click="openPath(result.outputDir, true)"><i class="ri-folder-open-line"></i>{{ $t('打开输出目录') }}</button>
        </div>
        <template v-if="result">
          <div class="ss-kpis">
            <div class="ss-kpi"><small>{{ $t('渠道数') }}</small><strong>{{ result.aggregate.channelTotals.length }}</strong></div>
            <div class="ss-kpi"><small>{{ $t('品类数') }}</small><strong>{{ categoryCount }}</strong></div>
            <div class="ss-kpi accent"><small>{{ $t('报废台数') }}</small><strong>{{ result.counts.totalUnits }}</strong></div>
            <div v-if="result.aggregateAmount" class="ss-kpi accent"><small>{{ $t('报废费用合计') }}</small><strong>¥{{ fmtMoney(result.aggregateAmount.total.amount) }}</strong></div>
          </div>
          <p v-if="!result.aggregateAmount" class="ss-note info"><i class="ri-information-line"></i>{{ $t('来源文件里没有报废费用列，汇总按报废台数统计（不虚报金额）；来源表带金额列时会自动追加费用汇总。') }}</p>
          <div class="ss-table-wrap" style="max-height: 380px; overflow: auto;">
            <table class="ss-table">
              <thead><tr><th v-for="(h, i) in result.summaryHeaders" :key="h" :class="{ num: Number(i) >= 2 }">{{ h }}</th></tr></thead>
              <tbody>
                <tr v-for="(row, i) in result.summary" :key="i" :class="{ total: row[1] === '' }">
                  <td v-for="(cell, j) in row" :key="j" :class="{ num: Number(j) >= 2 }">{{ Number(j) >= 4 ? fmtMoney(cell) : cell }}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div class="ss-subhead">{{ $t('渠道 × 品类透视（台）') }}</div>
          <div class="ss-table-wrap" style="max-height: 260px; overflow: auto;">
            <table class="ss-table">
              <thead><tr><th v-for="(h, i) in result.pivot.headers" :key="h" :class="{ num: Number(i) >= 1 }">{{ h }}</th></tr></thead>
              <tbody>
                <tr v-for="(row, i) in result.pivot.rows" :key="i" :class="{ total: i === result.pivot.rows.length - 1 }">
                  <td v-for="(cell, j) in row" :key="j" :class="{ num: Number(j) >= 1 }">{{ cell }}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div class="ss-file-out"><i class="ri-file-excel-2-line"></i><code>{{ result.summaryPath }}</code></div>
        </template>
        <p v-else class="ss-empty">{{ $t('先在第 3 步生成台账') }}</p>
      </StepCard>
    </div>
  </section>
</template>

<script setup lang="ts">
/**
 * 模块三 · 更新报废台账（需求 8.21 修订）：
 *   鉴定表（OEM）+ 报废条码（拆零）→ 渠道对照表 → 按《报废台账模板》生成台账 → 渠道×品类汇总。
 * 计算全在主进程 scrapTemplate.ts；这里只收文件、显示数字。
 *
 * 第 1 步多一张「来源识别」表：文件一进来就用 scrapLedgerBuild({ dryRun }) 逐份预解析——
 * 供应商 / 流程号认不出（浏览器下载记录里的文件根本不在流程号目录）给输入框补填，
 * 放错框 / 坏文件在这一步就报，不等到第 3 步。
 */
import { computed, onBeforeUnmount, reactive, ref, watch } from 'vue';
import { useNotificationStore } from '../../stores/notification';
import { t as i18nT } from '../../i18n';
import StepCard from './StepCard.vue';
import FileDropField from './FileDropField.vue';
import TableMapping from './TableMapping.vue';
import StickyProgress from './StickyProgress.vue';
import { api, useSteps, scrollToStep, inspectTable, fmtMoney, openPath, errorMessage, recentBrowserDownloads, type PickedTable } from './shared';

defineProps<{ state: any }>();
const emit = defineEmits<{ (e: 'refresh'): void }>();
const notif = useNotificationStore();

const steps = useSteps([
  { key: 'source', title: i18nT('选择鉴定表 / 报废条码'), hint: i18nT('OEM 报废来自「鉴定表」，拆零报废来自「报废条码」；可选台账模板与流程发起日期') },
  { key: 'lookup', title: i18nT('渠道匹配对照表'), hint: i18nT('按条码 → 型号 → 店铺逐级匹配渠道与产品类型') },
  { key: 'build', title: i18nT('生成报废台账'), hint: i18nT('按《报废台账模板》汇成总表：只记非供应商责任的不可维修台数') },
  { key: 'summary', title: i18nT('按渠道 + 品类汇总'), hint: i18nT('输出《各渠道各品类报废费用汇总表》') },
]);
const LOOKUP_ROLES = [{ key: 'barcode', required: false }, { key: 'model', label: i18nT('产品型号'), required: false }, { key: 'shop', label: i18nT('店铺'), required: false }, { key: 'channel', required: true }, { key: 'category', label: i18nT('产品类型'), required: false }];

type Kind = 'oem' | 'barcode';
type FileClass = Kind | 'template' | 'lookup' | null;
const oem = reactive<string[]>([]);
const barcode = reactive<string[]>([]);
const templatePath = ref('');
const startDate = ref('');
const includeReason = ref(false);
const fileName = (p: string): string => p.split(/[\\/]/).pop() || p;
const oemChips = computed(() => oem.map((p) => ({ path: p, name: fileName(p), note: chipNote(p) })));
const barcodeChips = computed(() => barcode.map((p) => ({ path: p, name: fileName(p), note: chipNote(p) })));
const templateChips = computed(() => (templatePath.value ? [{ path: templatePath.value, name: fileName(templatePath.value) }] : []));
const hasSources = computed(() => oem.length > 0 || barcode.length > 0);
const hasFile = (p: string): boolean => oem.includes(p) || barcode.includes(p) || templatePath.value === p || lookups.value.some((t) => t.path === p);

const result = ref<any>(null);
/** 输入变了：台账 / 汇总全部作废，步骤打回；粘性进度条也回到这一步（否则四步全 todo 它还亮着第 4 步） */
function invalidate(from: 'source' | 'lookup'): void {
  result.value = null;
  if (steps.runtime[from].state !== 'todo') steps.reset(from);
  steps.resetAfter(from);
  steps.currentKey.value = from;
}
watch([templatePath, startDate, includeReason], () => { if (steps.runtime.source.state !== 'todo') invalidate('source'); });

// ── 来源识别（dryRun 预解析 + 供应商 / 流程号补填） ─────────────────────────────

interface SourceRow { kind: Kind; path: string; fileName: string; sheets: string[]; processNo: string; supplier?: string; units: number; kept: number; error?: string }
const sourceRows = ref<SourceRow[]>([]);
const inspecting = ref(false);
const supplierEdits = reactive<Record<string, string>>({});
const processNoEdits = reactive<Record<string, string>>({});
const sourceErrors = computed(() => sourceRows.value.filter((s) => s.error));
const sourceOf = (p: string): SourceRow | undefined => sourceRows.value.find((s) => s.path === p);
function chipNote(p: string): string {
  const s = sourceOf(p);
  if (!s) return '';
  if (s.error) return i18nT('解析失败');
  const parts: string[] = [];
  if (s.kind === 'oem') parts.push(s.supplier || i18nT('供应商待补填'));
  parts.push(s.processNo || i18nT('流程号待补填'));
  return parts.join(' · ');
}
let inspectTimer: ReturnType<typeof setTimeout> | null = null;
let inspectSeq = 0;
function scheduleInspect(): void {
  if (inspectTimer) clearTimeout(inspectTimer);
  inspectTimer = setTimeout(() => { inspectTimer = null; void inspectSources(); }, 250);
}
async function inspectSources(): Promise<void> {
  const seq = ++inspectSeq;
  if (!oem.length && !barcode.length) { sourceRows.value = []; inspecting.value = false; return; }
  const a = api();
  if (!a?.scrapLedgerBuild) return;
  inspecting.value = true;
  try {
    const r = await a.scrapLedgerBuild({ oemFiles: [...oem], barcodeFiles: [...barcode], dryRun: true, supplierByFile: { ...supplierEdits }, processNoByFile: { ...processNoEdits } });
    if (seq !== inspectSeq) return;
    sourceRows.value = Array.isArray(r?.sources) ? r.sources : [];
  } catch (e) {
    if (seq !== inspectSeq) return;
    // 整批预识别都失败（文件不存在之类）：把原因挂到每份文件上，第 1 步就拦住
    const msg = errorMessage(e);
    const row = (kind: Kind, p: string): SourceRow => ({ kind, path: p, fileName: fileName(p), sheets: [], processNo: '', supplier: '', units: 0, kept: 0, error: msg });
    sourceRows.value = [...oem.map((p) => row('oem', p)), ...barcode.map((p) => row('barcode', p))];
  } finally {
    if (seq === inspectSeq) inspecting.value = false;
  }
}
watch(() => `${oem.join('\n')}\u0000${barcode.join('\n')}`, scheduleInspect);
onBeforeUnmount(() => { if (inspectTimer) clearTimeout(inspectTimer); });
/** 补填框：空值 = 撤销手填、回落自动识别（不能把识别出来的清成空再落进台账） */
function onEdit(map: Record<string, string>, path: string, ev: Event): void {
  const v = String((ev.target as HTMLInputElement | null)?.value || '').trim();
  if (v) map[path] = v;
  else delete map[path];
  scheduleInspect();
  if (steps.runtime.source.state !== 'todo') invalidate('source');
}

// ── 文件进出 ────────────────────────────────────────────────────────────────────

/** 按文件名分类：含「鉴定」→ OEM 鉴定表；含「条码」→ 报废条码；含「对照」→ 渠道对照表；含「模板」→ 台账模板 */
function classify(p: string): FileClass {
  const n = fileName(p);
  if (/鉴定/.test(n)) return 'oem';
  if (/条码/.test(n)) return 'barcode';
  if (/对照/.test(n)) return 'lookup';
  if (/模板/.test(n)) return 'template';
  return null;
}
/**
 * 文件名说它是鉴定表却拖进了「报废条码」框（或反过来）→ 按名字归到正确的框并提示；
 * 主进程解析也会拒收放错框的文件，这里先挡一道省得用户到第 3 步才知道。
 */
function addFiles(paths: string[], kind: Kind): void {
  let added = 0;
  const moved: string[] = [];
  for (const p of paths) {
    if (!p || hasFile(p)) continue;
    const guess = classify(p);
    if (guess === 'lookup') { moved.push(fileName(p)); void loadLookup(p); continue; }
    if (guess === 'template') { moved.push(fileName(p)); templatePath.value = p; continue; }
    const target: Kind = guess && guess !== kind ? guess : kind;
    if (target !== kind) moved.push(fileName(p));
    (target === 'oem' ? oem : barcode).push(p);
    added += 1;
  }
  if (moved.length) notif.info(i18nT('已按文件名把 {list} 归到对应位置（鉴定表 / 报废条码 / 对照表 / 模板）', { list: moved.slice(0, 5).join('、') }));
  if (added) invalidate('source');
}
function removePath(p: string, kind: Kind): void {
  const target = kind === 'oem' ? oem : barcode;
  const i = target.indexOf(p);
  if (i < 0) return;
  target.splice(i, 1);
  delete supplierEdits[p];
  delete processNoEdits[p];
  // 数据源变了：台账 / 汇总结果全部作废，步骤态打回（第二轮审查回归：移除附件后旧结果不能残留）
  invalidate('source');
}
function addClassified(paths: string[]): void {
  const picked: Record<Kind, string[]> = { oem: [], barcode: [] };
  const unknown: string[] = [];
  for (const p of paths) {
    const k = classify(p);
    if (k === 'oem' || k === 'barcode') picked[k].push(p);
    else if (k === 'template') templatePath.value = p;
    else if (k === 'lookup') void loadLookup(p);
    else unknown.push(fileName(p));
  }
  addFiles(picked.oem, 'oem');
  addFiles(picked.barcode, 'barcode');
  if (unknown.length) notif.warn(i18nT('{n} 个文件名不含「鉴定」「条码」「对照」「模板」，没有加入：{list}。请拖到对应的框里', { n: unknown.length, list: unknown.slice(0, 5).join('、') }));
}
async function pickFolder(): Promise<void> {
  try {
    const r = await api().pickFolder({ title: i18nT('选择流程文件夹（如 FYSQ026080001005）') });
    if (!r?.path) return;
    // 往下钻两层：报废流程包是「根/OEM报废/FYSQ…/鉴定表」，对照表 / 模板在根，选根目录一次全收
    const { files } = await api().listFolderFiles({ dir: r.path, depth: 2 });
    if (!files.length) { notif.warn(i18nT('这个文件夹里没有 Excel')); return; }
    addClassified(files);
  } catch (e) { notif.error(errorMessage(e)); }
}
const downloads = ref<{ path: string; filename: string }[]>([]);
async function loadDownloads(): Promise<void> {
  downloads.value = await recentBrowserDownloads();
  if (!downloads.value.length) notif.info(i18nT('内置浏览器里还没有下载完成的表格文件'));
}
/** 演示预填（外部调用可传入路径预填）：鉴定表 ×2 + 报废条码 + 模板 + 对照表 */
async function prefillDemo(d: { oemFiles: string[]; barcodeFiles: string[]; templatePath: string; lookupPath: string }): Promise<void> {
  oem.splice(0, oem.length);
  barcode.splice(0, barcode.length);
  for (const m of steps.metas) steps.reset(m.key);
  steps.currentKey.value = 'source';
  addFiles(d.oemFiles, 'oem');
  addFiles(d.barcodeFiles, 'barcode');
  templatePath.value = d.templatePath;
  lookups.value = [];
  await loadLookup(d.lookupPath);
}
defineExpose({ prefillDemo });

function confirmSource(): void {
  const filled = sourceRows.value.filter((s) => (s.kind === 'oem' && supplierEdits[s.path]) || processNoEdits[s.path]).length;
  steps.done('source', i18nT('鉴定表 {a} 份、报废条码 {b} 份{tpl}{date}{filled}', {
    a: oem.length, b: barcode.length,
    tpl: templatePath.value ? i18nT('，使用自定义模板') : '',
    date: startDate.value ? i18nT('，流程发起日期 {d}', { d: startDate.value }) : '',
    filled: filled ? i18nT('，手工补填 {n} 份的供应商/流程号', { n: filled }) : '',
  }));
}

// ── 对照表 ──────────────────────────────────────────────────────────────────────

const lookups = ref<PickedTable[]>([]);
const lookupPending = ref(0);
const lookupLoading = computed(() => lookupPending.value > 0);
const lookupChips = computed(() => lookups.value.map((t) => ({ path: t.path, name: t.fileName, note: i18nT('{n} 行', { n: t.rowCount }) })));
const lookupReady = computed(() => !lookupLoading.value && lookups.value.length > 0 && lookups.value.every((t) => (t.mapping.barcode || t.mapping.model || t.mapping.shop) && t.mapping.channel));
async function loadLookups(paths: string[]): Promise<void> {
  for (const path of paths) await loadLookup(path);
}
function updateLookup(table: PickedTable, mapping: PickedTable['mapping']): void {
  table.mapping = mapping;
  invalidate('lookup');
}
let lookupQueue = Promise.resolve();
function loadLookup(path: string, sheetName?: string): Promise<void> {
  lookupPending.value += 1;
  invalidate('lookup');
  const task = lookupQueue.then(() => inspectLookup(path, sheetName));
  lookupQueue = task.catch(() => {});
  return task.finally(() => { lookupPending.value -= 1; });
}
async function inspectLookup(path: string, sheetName?: string): Promise<void> {
  if (!path || (!sheetName && lookups.value.some((t) => t.path === path))) return;
  try {
    const t = await inspectTable(path, LOOKUP_ROLES.map((r) => r.key), sheetName);
    // 对照表真实表头是「产品类型」，通用关键字表认不出品类时本地兜底
    if (!t.mapping.model) t.mapping.model = t.headers.find((h) => /^(产品型号|商品型号|成品型号|型号|规格型号)$/.test(h.trim())) || '';
    if (!t.mapping.shop) t.mapping.shop = t.headers.find((h) => /^(店铺名称|店铺|门店名称|门店|销售店铺)$/.test(h.trim())) || '';
    if (!t.mapping.category) t.mapping.category = t.headers.find((h) => /产品类型|类型/.test(h)) || '';
    const index = lookups.value.findIndex((item) => item.path === path);
    if (index >= 0) lookups.value[index] = t;
    else lookups.value.push(t);
    invalidate('lookup');
  } catch (e) {
    // 失败落在这一步的卡片上（不只 toast 一下就没了）
    steps.fail('lookup', e);
    notif.error(errorMessage(e));
  }
}
function clearLookup(path: string): void {
  lookups.value = lookups.value.filter((t) => t.path !== path);
  invalidate('lookup');
}
function confirmLookup(): void {
  if (!lookupReady.value) return;
  steps.done('lookup', i18nT('已确认 {n} 份对照表，共 {rows} 行', { n: lookups.value.length, rows: lookups.value.reduce((sum, t) => sum + t.rowCount, 0) }));
}

// ── 生成 / 汇总 ─────────────────────────────────────────────────────────────────

const categoryCount = computed(() => (result.value ? new Set(result.value.aggregate.rows.map((r: any) => r.category)).size : 0));
async function build(): Promise<void> {
  if (!lookupReady.value) return;
  steps.start('build');
  result.value = null;
  steps.reset('summary');
  try {
    const r = await api().scrapLedgerBuild({
      oemFiles: [...oem], barcodeFiles: [...barcode],
      lookups: lookups.value.map((t) => ({ path: t.path, sheetName: t.sheetName, barcodeColumn: t.mapping.barcode, channelColumn: t.mapping.channel, categoryColumn: t.mapping.category || undefined, modelColumn: t.mapping.model || undefined, shopColumn: t.mapping.shop || undefined })),
      templatePath: templatePath.value || undefined,
      startDate: startDate.value || undefined,
      supplierByFile: { ...supplierEdits },
      processNoByFile: { ...processNoEdits },
      includeReason: includeReason.value,
    });
    result.value = r;
    steps.done('build', i18nT('鉴定表 {a} 台记入 {b} 台（剔除供应商责任 {c}、可维修 {d}）；报废条码 {e} 台；台账共 {t} 行，匹配渠道 {m} / 未匹配 {u}', {
      a: r.counts.oemUnits, b: r.counts.oemKept, c: r.counts.oemDroppedSupplier, d: r.counts.oemDroppedRepairable, e: r.counts.barcodeUnits, t: r.counts.total, m: r.counts.matched, u: r.counts.unmatched,
    }));
    notif.success(i18nT('报废台账已生成'));
    emit('refresh');
  } catch (e) { steps.fail('build', e); }
}
function confirmSummary(): void {
  if (!result.value) return;
  openPath(result.value.summaryPath);
  const r = result.value;
  steps.done('summary', i18nT('{a} 个渠道 × {b} 个品类，报废 {c} 台{amt}；汇总表已生成', {
    a: r.aggregate.channelTotals.length, b: categoryCount.value, c: r.counts.totalUnits,
    amt: r.aggregateAmount ? i18nT('，费用合计 ¥{x}', { x: fmtMoney(r.aggregateAmount.total.amount) }) : '',
  }));
}
</script>

<style scoped>
.ss-grid.two { grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); align-items: start; }
.ss-dl { display: flex; flex-wrap: wrap; gap: 6px; align-items: center; }
.ss-dl .ss-subhead { width: 100%; }
.ss-dl .ss-chip { cursor: pointer; border: none; font: inherit; }
.ss-dl .ss-chip:disabled { opacity: .5; cursor: default; }
.ss-field input[type="date"] { height: 32px; }
.ss-check { display: inline-flex; align-items: center; gap: 8px; font-size: 12.5px; color: var(--color-text-secondary); cursor: pointer; }
.ss-check input { width: 15px; height: 15px; margin: 0; accent-color: var(--color-brand); }
.ss-sources { max-height: 240px; overflow: auto; }
.ss-sources__head { display: flex; align-items: center; gap: 8px; }
.ss-sources__head .ss-chip { text-transform: none; letter-spacing: 0; }
.ss-sources__input { width: 160px; height: 28px; padding: 0 8px; border: 1px solid var(--color-border); border-radius: 7px; background: var(--color-bg-primary); color: var(--color-text-primary); font: inherit; font-size: 12.5px; }
.ss-sources__input:focus { outline: none; border-color: var(--color-brand); }
.ss-sources__input.missing { border-color: var(--color-warning); background: color-mix(in srgb, var(--color-warning) 8%, var(--color-bg-primary)); }
.spin { animation: ss-spin 1s linear infinite; }
@keyframes ss-spin { to { transform: rotate(360deg); } }
</style>
