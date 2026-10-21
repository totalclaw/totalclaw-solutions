<template>
  <div class="ss-module">
    <ModuleHeader :meta="meta" />

    <section class="ss-rules">
      <h4><i class="ri-search-eye-line"></i>{{ $t('背调对象') }}</h4>
      <div class="ss-grid">
        <label class="ss-field"><span>{{ $t('公司名称') }}</span><input v-model.trim="form.company" type="text" /></label>
        <label class="ss-field"><span>{{ $t('官网') }}</span><input v-model.trim="form.website" type="text" placeholder="https://" /></label>
        <label class="ss-field"><span>{{ $t('邮箱') }}</span><input v-model.trim="form.email" type="text" /></label>
        <label class="ss-field"><span>{{ $t('国家/地区') }}</span><input v-model.trim="form.country" type="text" /></label>
      </div>
      <p class="ss-muted">{{ $t('至少填一项。只用公开网页信息，每条结论都附来源，方便核对。') }}</p>
    </section>

    <!-- 交易对手名单筛查（制裁 / 出口管制） -->
    <section class="ss-panel" data-test="ft-screening">
      <header>
        <strong><i class="ri-shield-keyhole-line"></i> {{ $t('制裁 / 出口管制名单筛查') }}</strong>
        <span class="ss-muted">{{ $t('官方免费名单下载到本机后在本地比对，名字不会发给任何第三方。') }}</span>
        <span class="grow"></span>
        <button type="button" class="ss-btn sm" :disabled="!!scrBusy" @click="refreshLists"><i :class="scrBusy === 'refresh' ? 'ri-loader-4-line spin' : 'ri-download-cloud-2-line'"></i>{{ $t('更新名单') }}</button>
      </header>
      <p v-if="scrBusy === 'refresh' && ftProgress.background" class="ss-note info"><i class="ri-loader-4-line spin"></i>{{ ftProgress.background }}</p>
      <div class="ss-table-wrap">
        <table class="ss-table">
          <thead><tr><th>{{ $t('名单') }}</th><th>{{ $t('版本') }}</th><th>{{ $t('下载时间') }}</th><th class="num">{{ $t('条目') }}</th><th></th></tr></thead>
          <tbody>
            <tr v-for="l in lists" :key="l.id" :data-test="`ft-list-${l.id}`">
              <td class="ft-wrap">{{ l.label }}</td>
              <td>{{ l.version || '—' }}</td>
              <td>
                <span v-if="l.fetchedAt" :class="{ 'ft-stale': isStale(l.fetchedAt) }">{{ fmtDateTime(l.fetchedAt) }}</span>
                <span v-else class="ss-chip warn">{{ $t('还没有') }}</span>
                <div v-if="l.error" class="ft-err">{{ $t('最近一次更新失败（{p0}）：{p1}', { p0: fmtDateTime(l.errorAt || ''), p1: l.error }) }}{{ l.fetchedAt ? $t('，继续用上次的缓存') : '' }}</div>
              </td>
              <td class="num">{{ l.count ?? '—' }}</td>
              <td><button type="button" class="ss-btn sm ghost" :disabled="!!scrBusy" :data-test="`ft-list-import-${l.id}`" @click="importList(l.id)"><i class="ri-file-upload-line"></i>{{ $t('导入文件') }}</button></td>
            </tr>
          </tbody>
        </table>
      </div>
      <p class="ss-muted">{{ $t('网络不通时：到名单官网下载文件（美国 CSL 的 JSON / CSV、联合国 XML、英国 CSV、欧盟 CSV）后点「导入文件」。名单超过 7 天会提示更新。') }}</p>
      <div class="ss-actions">
        <input v-model.trim="scrName" type="text" class="ft-scr-input" data-test="ft-screen-name" :placeholder="$t('公司或人名（英文原名最准）')" />
        <input v-model.trim="scrCountry" type="text" class="ft-scr-input sm" :placeholder="$t('国家（可选）')" />
        <button type="button" class="ss-btn sm primary" :disabled="!scrName || !!scrBusy" data-test="ft-screen-run" @click="screenNow"><i :class="scrBusy === 'run' ? 'ri-loader-4-line spin' : 'ri-search-eye-line'"></i>{{ $t('筛查') }}</button>
      </div>
      <p v-if="scrError" class="ss-note danger"><i class="ri-error-warning-line"></i>{{ scrError }}</p>
      <ScreeningResult v-if="scrResult" :result="scrResult" />
    </section>

    <div class="ft-split">
      <aside class="ft-list">
        <div class="ss-subhead">{{ $t('背调记录') }}</div>
        <ul>
          <li v-for="b in history" :key="b.id" :class="{ active: b.id === selectedId }" @click="selectedId = b.id">
            <div class="ft-list__top">
              <strong>{{ b.company }}</strong>
              <span class="ss-chip" :class="b.stage === 'done' ? 'ok' : 'warn'">{{ stageLabel(b.stage) }}</span>
            </div>
            <div class="ft-list__meta">
              <span>{{ fmtDateTime(b.createdAt) }}</span>
              <button type="button" class="ss-link" @click.stop="remove(b)">{{ $t('删除') }}</button>
            </div>
          </li>
          <li v-if="!history.length" class="ss-empty">{{ $t('还没有背调记录') }}</li>
        </ul>
      </aside>

      <section class="ft-detail">
        <StickyProgress :title="$t('客户背调')" :metas="metas" :runtime="runtime" :current-key="currentKey" @jump="scrollTo" />
        <p v-if="busy && ftProgress.background" class="ss-note info"><i class="ri-loader-4-line spin"></i>{{ ftProgress.background }}</p>
        <div class="ss-steps">
          <StepCard step-key="search" :index="0" :title="metas[0].title" :hint="metas[0].hint" :runtime="runtime.search">
            <div class="ss-actions">
              <button type="button" class="ss-btn primary" :disabled="!!busy || !canSearch" @click="search">
                <i :class="busy === 'search' ? 'ri-loader-4-line spin' : 'ri-search-line'"></i>{{ $t('开始检索') }}
              </button>
              <span class="ss-muted">{{ $t('新检索会生成一条新的背调记录') }}</span>
            </div>
            <div v-if="current" class="ft-sources">
              <div v-for="(s, i) in current.sources" :key="s.url" class="ft-source">
                <span class="ss-chip">{{ i + 1 }}</span>
                <button type="button" class="ss-link" @click="openUrl(s.url)">{{ s.title || s.url }}</button>
                <span class="ss-muted ft-url">{{ s.url }}</span>
                <span v-if="s.fetchError" class="ss-chip bad" :title="s.fetchError">{{ $t('未读到') }}</span>
                <span v-else-if="s.textLength" class="ss-chip ok">{{ $t('{n} 字', { n: s.textLength }) }}</span>
              </div>
            </div>
          </StepCard>

          <StepCard step-key="fetch" :index="1" :title="metas[1].title" :hint="metas[1].hint" :runtime="runtime.fetch">
            <div class="ss-actions">
              <button type="button" class="ss-btn primary" :disabled="!!busy || !current" @click="fetchPages">
                <i :class="busy === 'fetch' ? 'ri-loader-4-line spin' : 'ri-global-line'"></i>{{ current && current.stage !== 'searched' ? $t('重新读取') : $t('读取网页') }}
              </button>
            </div>
          </StepCard>

          <StepCard step-key="compose" :index="2" :title="metas[2].title" :hint="metas[2].hint" :runtime="runtime.compose">
            <div class="ss-actions">
              <button type="button" class="ss-btn primary" :disabled="!!busy || !current || current.stage === 'searched'" @click="compose">
                <i :class="busy === 'compose' ? 'ri-loader-4-line spin' : 'ri-file-list-3-line'"></i>{{ current?.stage === 'done' ? $t('重新整理') : $t('整理背调卡') }}
              </button>
              <span v-if="current?.model" class="ss-muted">{{ $t('由 {p0} 整理', { p0: modelLabel(current.model) }) }}</span>
            </div>
            <template v-if="current?.stage === 'done'">
              <p v-if="current.summary" class="ft-summary">{{ current.summary }}</p>
              <div v-if="current.facts.length" class="ss-table-wrap">
                <table class="ss-table">
                  <thead><tr><th>{{ $t('项目') }}</th><th>{{ $t('内容') }}</th><th>{{ $t('来源') }}</th></tr></thead>
                  <tbody>
                    <tr v-for="(f, i) in current.facts" :key="i">
                      <td>{{ f.label }}</td><td class="ft-wrap">{{ f.value }}</td>
                      <td><button v-if="f.source != null && current.sources[f.source]" type="button" class="ss-link" @click="openUrl(current.sources[f.source].url)">[{{ f.source + 1 }}]</button><span v-else>—</span></td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div v-if="current.risks.length">
                <div class="ss-subhead">{{ $t('风险提示') }}</div>
                <ul class="ft-risks">
                  <li v-for="(r, i) in current.risks" :key="i">
                    <i class="ri-error-warning-line"></i>
                    <span><strong v-if="r.label">{{ $t('{p0}：', { p0: r.label }) }}</strong>{{ r.value }}</span>
                    <button v-if="r.source != null && current.sources[r.source]" type="button" class="ss-link" @click="openUrl(current.sources[r.source].url)">[{{ r.source + 1 }}]</button>
                  </li>
                </ul>
              </div>
            </template>
          </StepCard>

          <StepCard step-key="checks" :index="3" :title="metas[3].title" :hint="metas[3].hint" :runtime="runtime.checks">
            <div class="ss-actions">
              <button type="button" class="ss-btn primary" :disabled="!!busy || !current" @click="runChecks">
                <i :class="busy === 'checks' ? 'ri-loader-4-line spin' : 'ri-radar-line'"></i>{{ current?.checkedAt ? $t('重新核查') : $t('核查域名、邮箱与名单') }}
              </button>
              <span v-if="current?.checkedAt" class="ss-muted">{{ $t('上次核查：{p0}', { p0: fmtDateTime(current.checkedAt) }) }}</span>
            </div>
            <p v-if="checksNote" class="ss-note warn"><i class="ri-error-warning-line"></i>{{ checksNote }}</p>
            <template v-if="current?.coverage?.length">
              <div class="ss-subhead">{{ $t('覆盖面') }}</div>
              <div class="ft-cov">
                <span v-for="c in current.coverage" :key="c.area" class="ft-cov__item" :title="c.note || ''">
                  <span class="ss-chip" :class="c.status === 'found' ? 'ok' : c.status === 'checked_none' ? 'brand' : ''">{{ coverageStatus(c.status) }}</span>
                  {{ areaLabel(c.area) }}<small v-if="c.note" class="ss-muted"> · {{ c.note }}</small>
                </span>
              </div>
              <div v-if="current.flags?.length">
                <div class="ss-subhead">{{ $t('红旗（按规则判定，不经模型）') }}</div>
                <ul class="ft-risks">
                  <li v-for="f in current.flags" :key="f.rule" :data-rule="f.rule">
                    <span class="ss-chip" :class="f.level === 'critical' ? 'bad' : 'warn'">{{ f.level === 'critical' ? $t('严重') : $t('一般') }}</span>
                    <span>{{ f.message }}</span>
                  </li>
                </ul>
              </div>
              <p v-else class="ss-note ok"><i class="ri-check-line"></i>{{ $t('没有发现规则能判定的红旗') }}</p>
              <ScreeningResult v-if="current.screening" :result="current.screening" />
            </template>
          </StepCard>

          <StepCard step-key="judge" :index="4" :title="metas[4].title" :hint="metas[4].hint" :runtime="runtime.judge">
            <p v-if="current?.suggestion" class="ss-note info"><i class="ri-lightbulb-line"></i>{{ current.suggestion }}</p>
            <p class="ss-muted">{{ $t('以上是参考意见，是否重点投入由业务员决定。') }}</p>
            <div class="ss-actions">
              <button v-if="current?.inquiryId" type="button" class="ss-btn sm ghost" @click="$emit('goto', 'inquiry', { inquiryId: current.inquiryId })"><i class="ri-mail-open-line"></i>{{ $t('回到询盘') }}</button>
              <button v-if="current?.inquiryId" type="button" class="ss-btn sm ghost" @click="$emit('goto', 'quote', { inquiryId: current.inquiryId })"><i class="ri-price-tag-3-line"></i>{{ $t('去报价') }}</button>
              <button type="button" class="ss-btn sm primary" :disabled="current?.stage !== 'done'" @click="judged = true"><i class="ri-check-line"></i>{{ $t('已看过，人工判断完成') }}</button>
            </div>
          </StepCard>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * 客户背调：检索公开信息 → 读取网页 → 整理背调卡（每条带来源）→ 人工判断。
 */
import { computed, onMounted, reactive, ref, watch } from 'vue';
import type { FtBackground, FtCoverageArea, FtCoverageItem, FtScreeningResult, FtScreeningSourceId, FtScreeningSourceStatus } from '@totalclaw/ipc-contracts';
import { useNotificationStore } from '../../stores/notification';
import { t as i18nT } from '../../i18n';
import StepCard from '../service-settlement/StepCard.vue';
import StickyProgress from '../service-settlement/StickyProgress.vue';
import { scrollToStep, type StepMeta, type StepRuntime } from '../service-settlement/shared';
import ModuleHeader from './ModuleHeader.vue';
import ScreeningResult from './ScreeningResult.vue';
import { errorMessage, fmtDateTime, ft, ftProgress, ftState, modelLabel, refreshState, type FtModuleMeta } from './shared';

const props = defineProps<{ meta: FtModuleMeta; focus?: { company?: string; email?: string; country?: string; website?: string; inquiryId?: string } | null }>();
defineEmits<{ (e: 'goto', module: string, payload: any): void }>();
const notif = useNotificationStore();

const form = reactive({ company: '', website: '', email: '', country: '', inquiryId: '' });
const selectedId = ref('');
const busy = ref('');
const errors = ref<Record<string, string>>({});
const judged = ref(false);
const checksNote = ref('');
const lists = ref<FtScreeningSourceStatus[]>([]);
const scrBusy = ref('');
const scrName = ref('');
const scrCountry = ref('');
const scrResult = ref<FtScreeningResult | null>(null);
const scrError = ref('');

const history = computed(() => ftState.value?.backgrounds || []);
const current = computed<FtBackground | null>(() => history.value.find((b) => b.id === selectedId.value) || null);
const canSearch = computed(() => !!(form.company || form.website || form.email));

watch(() => props.focus, (f) => {
  if (!f) return;
  Object.assign(form, { company: f.company || '', website: f.website || '', email: f.email || '', country: f.country || '', inquiryId: f.inquiryId || '' });
  const existing = f.inquiryId ? history.value.find((b) => b.inquiryId === f.inquiryId) : undefined;
  selectedId.value = existing?.id || '';
}, { immediate: true });
watch(history, (l) => { if (!selectedId.value && l.length && !props.focus) selectedId.value = l[0].id; }, { immediate: true });
watch(selectedId, () => { errors.value = {}; judged.value = false; checksNote.value = ''; });
watch(() => form.company, (c) => { if (c && !scrName.value) scrName.value = c; });
onMounted(() => { void loadLists(); });

const metas: StepMeta[] = [
  { key: 'search', title: i18nT('检索公开信息'), hint: i18nT('按公司名、官网、邮箱域名检索公开网页') },
  { key: 'fetch', title: i18nT('读取网页'), hint: i18nT('读取官网和检索到的网页正文') },
  { key: 'compose', title: i18nT('整理背调卡'), hint: i18nT('公司概况、主营、规模线索、风险提示，每条附来源') },
  { key: 'checks', title: i18nT('核查与名单筛查'), hint: i18nT('域名注册时间、收信服务器、邮箱域名，加制裁 / 出口管制名单比对；每个覆盖面标明查到 / 查过没有 / 没查') },
  { key: 'judge', title: i18nT('人工判断'), hint: i18nT('业务员判断客户实力与采购潜力，决定是否重点投入') },
];
const runtime = computed<Record<string, StepRuntime>>(() => {
  const b = current.value;
  const st = (key: string, done: boolean, summary?: string): StepRuntime => (busy.value === key
    ? { state: 'running' }
    : errors.value[key] ? { state: 'failed', error: errors.value[key] }
      : done ? { state: 'done', summary } : { state: 'todo' });
  const read = b ? b.sources.filter((s) => s.textLength).length : 0;
  return {
    search: st('search', !!b, b ? i18nT('{n} 个来源', { n: b.sources.length }) : ''),
    fetch: st('fetch', !!b && b.stage !== 'searched', b ? i18nT('读到 {n} 个网页', { n: read }) : ''),
    compose: st('compose', b?.stage === 'done', b?.stage === 'done' ? i18nT('{a} 条信息、{b} 条风险', { a: b.facts.length, b: b.risks.length }) : ''),
    checks: st('checks', !!b?.checkedAt, b?.checkedAt ? i18nT('{n} 条红旗', { n: b.flags?.length || 0 }) : ''),
    judge: st('judge', judged.value),
  };
});
const currentKey = computed(() => metas.find((m) => runtime.value[m.key].state !== 'done')?.key || 'judge');

function stageLabel(s: FtBackground['stage']): string {
  return { searched: i18nT('已检索'), fetched: i18nT('已读取'), done: i18nT('已完成') }[s];
}

async function run(key: string, fn: () => Promise<unknown>): Promise<boolean> {
  busy.value = key;
  errors.value = { ...errors.value, [key]: '' };
  ftProgress.background = '';
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
async function search(): Promise<void> {
  await run('search', async () => {
    const bg = await ft<FtBackground>('background.search', { ...form, inquiryId: form.inquiryId || undefined });
    selectedId.value = bg.id;
  });
}
async function fetchPages(): Promise<void> {
  if (!current.value) return;
  await run('fetch', () => ft('background.fetch', { id: current.value!.id }));
}
async function compose(): Promise<void> {
  if (!current.value) return;
  await run('compose', () => ft('background.compose', { id: current.value!.id }));
}
async function runChecks(): Promise<void> {
  if (!current.value) return;
  checksNote.value = '';
  await run('checks', async () => {
    const r = await ft<{ screeningError?: string }>('background.checks', { id: current.value!.id });
    if (r?.screeningError) checksNote.value = i18nT('名单筛查没做成：{p0}', { p0: r.screeningError });
  });
}
function coverageStatus(s: FtCoverageItem['status']): string {
  return { found: i18nT('查到'), checked_none: i18nT('查过没有'), not_checked: i18nT('没查') }[s];
}
function areaLabel(a: FtCoverageArea): string {
  return { website: i18nT('官网'), search: i18nT('公开检索'), domain_age: i18nT('域名注册时间'), mail_server: i18nT('收信服务器'), email_domain: i18nT('邮箱域名'), screening: i18nT('名单筛查') }[a] || a;
}
function isStale(at: string): boolean { return Date.now() - Date.parse(at) > 7 * 86_400_000; }
async function loadLists(): Promise<void> {
  try { lists.value = await ft<FtScreeningSourceStatus[]>('screening.status'); } catch (e) { scrError.value = errorMessage(e); }
}
async function refreshLists(): Promise<void> {
  scrBusy.value = 'refresh';
  scrError.value = '';
  ftProgress.background = '';
  try {
    lists.value = await ft<FtScreeningSourceStatus[]>('screening.refresh', {});
    const failed = lists.value.filter((l) => l.error && l.errorAt && Date.now() - Date.parse(l.errorAt) < 60_000);
    if (failed.length) scrError.value = i18nT('{n} 份名单没更新成，原因写在表里；有缓存的继续用缓存', { n: failed.length });
  } catch (e) { scrError.value = errorMessage(e); } finally { scrBusy.value = ''; }
}
async function importList(id: FtScreeningSourceId): Promise<void> {
  scrError.value = '';
  try {
    const paths = await ft<string[]>('files.pick', { filters: [{ name: i18nT('名单文件'), extensions: ['json', 'csv', 'xml', 'txt'] }] });
    if (!paths?.length) return;
    scrBusy.value = 'import';
    await ft('screening.import', { id, path: paths[0] });
    await loadLists();
    notif.success(i18nT('名单已导入'));
  } catch (e) { scrError.value = errorMessage(e); } finally { scrBusy.value = ''; }
}
async function screenNow(): Promise<void> {
  scrBusy.value = 'run';
  scrError.value = '';
  try {
    scrResult.value = await ft<FtScreeningResult>('screening.run', { name: scrName.value, country: scrCountry.value || undefined, context: 'manual' });
  } catch (e) { scrError.value = errorMessage(e); scrResult.value = null; } finally { scrBusy.value = ''; }
}
async function remove(b: FtBackground): Promise<void> {
  if (!window.confirm(i18nT('删除 {p0} 的背调记录？', { p0: b.company }))) return;
  try {
    await ft('background.remove', { id: b.id });
    if (selectedId.value === b.id) selectedId.value = '';
    await refreshState();
  } catch (e) { notif.error(errorMessage(e)); }
}
function openUrl(url: string): void {
  const api = (window as any).electronAPI;
  if (api?.openExternal) void api.openExternal(url);
  else window.open(url, '_blank');
}
function scrollTo(key: string): void { void scrollToStep(key); }
</script>

<style scoped>
.ft-split { display: grid; grid-template-columns: minmax(220px, 280px) 1fr; gap: 14px; align-items: start; }
@media (max-width: 960px) { .ft-split { grid-template-columns: 1fr; } }
.ft-list { display: grid; gap: 8px; border: 1px solid var(--color-border); border-radius: 14px; background: var(--color-bg-card); padding: 10px; position: sticky; top: 0; max-height: calc(100vh - 160px); overflow: hidden; grid-template-rows: auto 1fr; }
.ft-list ul { list-style: none; margin: 0; padding: 0; display: grid; gap: 6px; overflow-y: auto; align-content: start; }
.ft-list li { padding: 8px 10px; border-radius: 10px; border: 1px solid transparent; cursor: pointer; display: grid; gap: 3px; background: var(--color-bg-primary); }
.ft-list li.active { border-color: var(--color-brand); background: color-mix(in srgb, var(--color-brand) 8%, var(--color-bg-card)); }
.ft-list__top { display: flex; justify-content: space-between; gap: 6px; align-items: center; font-size: 13px; }
.ft-list__meta { display: flex; gap: 8px; font-size: 11px; color: var(--color-text-secondary); align-items: center; }
.ft-detail { display: grid; gap: 12px; min-width: 0; }
.ft-sources { display: grid; gap: 6px; }
.ft-source { display: flex; gap: 8px; align-items: center; font-size: 12.5px; flex-wrap: wrap; }
.ft-url { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 320px; }
.ft-summary { margin: 0; font-size: 13px; line-height: 1.6; }
.ft-wrap { white-space: normal !important; max-width: 520px; }
.ft-risks { list-style: none; margin: 6px 0 0; padding: 0; display: grid; gap: 6px; font-size: 12.5px; }
.ft-risks li { display: flex; gap: 6px; align-items: flex-start; }
.ft-risks i { color: var(--color-warning); }
.ft-cov { display: flex; flex-wrap: wrap; gap: 6px 14px; font-size: 12.5px; }
.ft-cov__item { display: inline-flex; gap: 4px; align-items: center; }
.ft-scr-input { height: 30px; min-width: 260px; flex: 1; border-radius: 8px; border: 1px solid var(--color-border); background: var(--color-bg-input, var(--color-bg-primary)); color: var(--color-text-primary); font: inherit; font-size: 12.5px; padding-inline: 8px; }
.ft-scr-input.sm { min-width: 120px; flex: 0 1 160px; }
.ft-stale { color: var(--color-warning); }
.ft-err { color: var(--color-danger); font-size: 11.5px; white-space: normal; }
</style>
