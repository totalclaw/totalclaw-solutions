<template>
  <div class="ca-gov">
    <nav class="ca-subnav" role="tablist">
      <button type="button" role="tab" :aria-selected="sub === 'doc'" :class="{ on: sub === 'doc' }" data-test="ca-gov-doc" @click="sub = 'doc'"><i class="ri-quill-pen-line"></i>{{ $t('公文助手') }}</button>
      <button type="button" role="tab" :aria-selected="sub === 'hot'" :class="{ on: sub === 'hot' }" data-test="ca-gov-hot" @click="sub = 'hot'"><i class="ri-fire-line"></i>{{ $t('诉求热点分析') }}</button>
    </nav>

    <!-- 公文助手 -->
    <div v-if="sub === 'doc'" class="ss-module">
      <StickyProgress :title="$t('公文助手')" :metas="metas" :runtime="runtime" :current-key="currentKey" @jump="jump" />
      <div class="ss-steps">
        <StepCard step-key="gd-input" :index="0" :title="metas[0].title" :hint="metas[0].hint" :runtime="runtime['gd-input']" :is-current="currentKey === 'gd-input'">
          <div class="ss-actions">
            <label class="ss-field inline"><span>{{ $t('打开已有') }}</span>
              <select v-model="docId" class="ca-sel"><option value="">{{ $t('— 新建 —') }}</option><option v-for="d in docs" :key="d.id" :value="d.id">{{ kindLabel(d.kind) }} · {{ d.title }}</option></select>
            </label>
          </div>
          <div class="ss-grid">
            <label class="ss-field"><span>{{ $t('文种') }}</span><select v-model="form.kind"><option v-for="k in KINDS" :key="k" :value="k">{{ kindLabel(k) }}</option></select></label>
            <label class="ss-field"><span>{{ $t('发文机关') }}</span><input v-model="form.issuer" :placeholder="caState?.settings.schoolName || $t('如：某某学院党政办公室')" /></label>
            <label class="ss-field"><span>{{ $t('发文字号') }}</span><input v-model="form.docNo" :placeholder="$t('如：某院发〔2026〕12号')" /></label>
            <label class="ss-field"><span>{{ $t('成文日期') }}</span><input v-model="form.date" type="date" /></label>
          </div>
          <label class="ss-field"><span>{{ $t('标题') }}</span><input v-model="form.title" :placeholder="$t('如：关于做好2026年秋季学期学业预警工作的通知')" data-test="ca-doc-title" /></label>
          <label class="ss-field"><span>{{ $t('主送机关') }}</span><input v-model="form.recipients" :placeholder="$t('如：各二级学院、各部门')" /></label>
          <label class="ss-field"><span>{{ $t('要点（正文只按这里写的事实、时间、数字起草）') }}</span><textarea v-model="form.points" rows="6" data-test="ca-doc-points" :placeholder="$t('每行一条，例如：\n11月10日前各学院完成成绩录入\n学工处11月15日发布预警名单\n辅导员一周内完成面谈')"></textarea></label>
          <label class="ss-field"><span>{{ $t('附件（每行一个）') }}</span><textarea v-model="form.attachments" rows="2"></textarea></label>
        </StepCard>

        <StepCard step-key="gd-draft" :index="1" :title="metas[1].title" :hint="metas[1].hint" :runtime="runtime['gd-draft']" :is-current="currentKey === 'gd-draft'" :retry="busy ? undefined : draft">
          <div class="ss-actions">
            <button type="button" class="ss-btn primary" :disabled="!!busy || !form.title.trim() || !form.points.trim()" data-test="ca-doc-draft" @click="draft"><i :class="busy === 'draft' ? 'ri-loader-4-line spin' : 'ri-quill-pen-line'"></i>{{ doc ? $t('按要点重新起草') : $t('起草正文') }}</button>
            <span class="ss-muted">{{ $t('按党政机关公文写法起草，只用要点里的事实') }}</span>
          </div>
        </StepCard>

        <StepCard step-key="gd-review" :index="2" :title="metas[2].title" :hint="metas[2].hint" :runtime="runtime['gd-review']" :is-current="currentKey === 'gd-review'">
          <template v-if="doc">
            <p v-if="doc.unverified.length" class="ss-note warn" data-test="ca-doc-unverified"><i class="ri-alert-line"></i>{{ $t('正文里这些数字在要点和标题里找不到，请核对：{p0}', { p0: doc.unverified.join('、') }) }}</p>
            <label v-if="doc.unverified.length" class="ca-check"><input v-model="ack" type="checkbox" />{{ $t('我已逐处核对上面标出的数字') }}</label>
            <p v-else class="ss-note ok"><i class="ri-checkbox-circle-line"></i>{{ $t('正文里的数字都能在要点里找到') }}</p>
            <div class="ca-paper">
              <p class="ca-paper__head">{{ doc.issuer }}{{ doc.kind === 'minutes' ? $t('会议纪要') : doc.kind === 'letter' ? '' : $t('文件') }}</p>
              <p v-if="doc.docNo" class="ca-paper__no">{{ doc.docNo }}</p>
              <hr />
              <p class="ca-paper__title">{{ doc.title }}</p>
              <p v-if="doc.recipients" class="ca-paper__to">{{ $t('{p0}：', { p0: doc.recipients }) }}</p>
              <textarea v-model="body" class="ca-paper__body" rows="14" data-test="ca-doc-body"></textarea>
            </div>
            <div class="ss-actions"><button type="button" class="ss-btn sm" :disabled="body === doc.body || !!busy" @click="saveBody">{{ $t('保存修改') }}</button></div>
          </template>
          <p v-else class="ss-muted">{{ $t('先起草正文') }}</p>
        </StepCard>

        <StepCard step-key="gd-export" :index="3" :title="metas[3].title" :hint="metas[3].hint" :runtime="runtime['gd-export']" :is-current="currentKey === 'gd-export'">
          <div class="ss-actions">
            <button type="button" class="ss-btn primary" :disabled="!doc || !!busy || body !== doc.body" data-test="ca-doc-export" @click="exportDoc"><i class="ri-file-word-2-line"></i>{{ $t('导出 Word') }}</button>
            <span class="ss-muted">{{ body !== doc?.body ? $t('先保存修改') : $t('版头红字与红线、小标宋标题、仿宋正文、署名与成文日期、版记，按 GB/T 9704 版式') }}</span>
          </div>
          <p v-if="doc?.docxPath" class="ss-file-out"><i class="ri-file-check-line"></i><code>{{ doc.docxPath }}</code><button type="button" class="ss-link" @click="openPath(doc.docxPath!)">{{ $t('打开') }}</button></p>
        </StepCard>
      </div>
    </div>

    <!-- 诉求热点 -->
    <template v-else>
      <section class="ss-panel">
        <h3><i class="ri-fire-line"></i>{{ $t('诉求热点分析') }}</h3>
        <p class="ss-muted">{{ $t('从师生问答与转办记录里按领域、部门、时间统计诉求热点、响应慢的部门和知识库缺口。数字全部由规则统计；勾选后模型只在这些数字上写一段小结，写错数字就改用规则版。') }}</p>
        <div class="ss-actions">
          <div class="ca-filter">
            <button v-for="d in [7, 30, 90]" :key="d" type="button" :class="{ on: days === d }" @click="days = d">{{ $t('近 {n} 天', { n: d }) }}</button>
          </div>
          <label class="ca-check"><input v-model="useModel" type="checkbox" />{{ $t('用大模型写小结') }}</label>
          <button type="button" class="ss-btn primary sm" :disabled="!!busy" data-test="ca-hot-run" @click="runReport"><i :class="busy === 'hot' ? 'ri-loader-4-line spin' : 'ri-line-chart-line'"></i>{{ $t('生成分析') }}</button>
          <button type="button" class="ss-btn sm" :disabled="!report" @click="exportReport"><i class="ri-download-2-line"></i>{{ $t('导出周报') }}</button>
        </div>
      </section>
      <template v-if="report">
        <div class="ss-kpis">
          <div class="ss-kpi accent"><small>{{ $t('本期问答') }}</small><strong>{{ report.total }}</strong><small>{{ trend(report.total, report.prevTotal) }}</small></div>
          <div class="ss-kpi"><small>{{ $t('自动答复率') }}</small><strong>{{ pct(report.autoRate) }}</strong></div>
          <div class="ss-kpi"><small>{{ $t('知识缺口') }}</small><strong>{{ report.gaps.length }}</strong></div>
          <div class="ss-kpi" :class="{ alert: report.sensitive }"><small>{{ $t('敏感问题') }}</small><strong>{{ report.sensitive }}</strong></div>
          <div class="ss-kpi"><small>{{ $t('带不满情绪') }}</small><strong>{{ report.negative }}</strong></div>
        </div>
        <section class="ss-panel">
          <h3>{{ $t('小结') }}<span class="ss-chip" :class="report.summaryBy === 'model' ? 'brand' : ''">{{ report.summaryBy === 'model' ? $t('模型撰写，数字已核对') : $t('规则生成') }}</span></h3>
          <p class="ca-pre" data-test="ca-hot-summary">{{ report.summary }}</p>
        </section>
        <div class="ca-split">
          <section class="ss-panel">
            <h3>{{ $t('领域分布') }}</h3>
            <div class="ss-table-wrap"><table class="ss-table">
              <thead><tr><th>{{ $t('领域') }}</th><th class="num">{{ $t('本期') }}</th><th class="num">{{ $t('上期') }}</th><th class="num">{{ $t('无依据') }}</th></tr></thead>
              <tbody><tr v-for="d in report.byDomain" :key="d.id"><td>{{ d.name }}</td><td class="num"><b>{{ d.count }}</b></td><td class="num">{{ d.prev }}</td><td class="num" :class="{ warn: d.noEvidence }">{{ d.noEvidence }}</td></tr></tbody>
            </table></div>
          </section>
          <section class="ss-panel">
            <h3>{{ $t('部门响应') }}</h3>
            <div v-if="report.byDept.length" class="ss-table-wrap"><table class="ss-table">
              <thead><tr><th>{{ $t('部门') }}</th><th class="num">{{ $t('待答复') }}</th><th class="num">{{ $t('已答复') }}</th><th class="num">{{ $t('平均响应') }}</th><th class="num">{{ $t('超 48 小时') }}</th></tr></thead>
              <tbody><tr v-for="d in report.byDept" :key="d.dept" :class="{ bad: d.overdue }"><td>{{ d.dept }}</td><td class="num">{{ d.open }}</td><td class="num">{{ d.answered }}</td><td class="num">{{ d.avgHours === null ? '—' : $t('{n} 小时', { n: d.avgHours }) }}</td><td class="num">{{ d.overdue }}</td></tr></tbody>
            </table></div>
            <p v-else class="ss-muted">{{ $t('本期没有转办') }}</p>
          </section>
        </div>
        <section class="ss-panel">
          <h3>{{ $t('知识库缺口') }}</h3>
          <p class="ss-muted">{{ $t('被反复问到、知识库里却没有依据的问题。补充对应资料或 FAQ 后，这类问题就能自动回答。') }}</p>
          <ol v-if="report.gaps.length" class="ca-gaps"><li v-for="g in report.gaps" :key="g.question"><span>{{ g.question }}</span><em>{{ g.domain }}</em><b>{{ $t('{n} 次', { n: g.count }) }}</b></li></ol>
          <p v-else class="ss-muted">{{ $t('本期没有知识缺口') }}</p>
          <div v-if="report.keywords.length" class="ca-kw"><span v-for="k in report.keywords" :key="k.term" :style="{ fontSize: `${12 + Math.min(8, k.count)}px` }">{{ k.term }}<sup>{{ k.count }}</sup></span></div>
        </section>
      </template>
    </template>
  </div>
</template>

<script setup lang="ts">
/** 校务治理：公文助手 + 诉求热点分析 */
import { computed, reactive, ref, watch } from 'vue';
import { CA_DOC_KINDS, type CaDocKind, type CaHotspotReport, type CaOfficialDoc } from '@totalclaw/ipc-contracts';
import { useNotificationStore } from '../../stores/notification';
import { t as i18nT } from '../../i18n';
import StepCard from '../service-settlement/StepCard.vue';
import StickyProgress from '../service-settlement/StickyProgress.vue';
import { ca, caState, errorMessage, openPath, pct, refreshState, scrollToStep, type StepMeta, type StepRuntime } from './shared';

const notif = useNotificationStore();
const KINDS = CA_DOC_KINDS;
const sub = ref<'doc' | 'hot'>('doc');
const busy = ref('');
const errors = ref<Record<string, string>>({});
const docId = ref('');
const today = (): string => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; };
const form = reactive({ kind: 'notice' as CaDocKind, issuer: '', docNo: '', date: today(), title: '', recipients: '', points: '', attachments: '' });
const body = ref('');
const days = ref(7);
const useModel = ref(true);
const report = ref<CaHotspotReport | null>(null);
const ack = ref(false);

const docs = computed<CaOfficialDoc[]>(() => caState.value?.officialDocs || []);
const doc = computed(() => docs.value.find((d) => d.id === docId.value) || null);
const kindLabel = (k: CaDocKind): string => ({ notice: i18nT('通知'), request: i18nT('请示'), report: i18nT('报告'), letter: i18nT('函'), minutes: i18nT('会议纪要') }[k]);

// 只在换了一份公文或它被保存过时同步表单（状态每次刷新都会换对象，按对象 watch 会冲掉没保存的修改）
watch(() => (doc.value ? `${doc.value.id}:${doc.value.updatedAt}` : ''), (key, old) => {
  const d = doc.value;
  if (!old || key.split(':')[0] !== old.split(':')[0]) ack.value = false;
  if (!d) { body.value = ''; return; }
  Object.assign(form, { kind: d.kind, issuer: d.issuer, docNo: d.docNo, date: d.date, title: d.title, recipients: d.recipients, points: d.points, attachments: d.attachments });
  body.value = d.body;
}, { immediate: true });

const metas: StepMeta[] = [
  { key: 'gd-input', title: i18nT('填写要点'), hint: i18nT('文种、发文机关、标题、主送机关和正文要点') },
  { key: 'gd-draft', title: i18nT('起草正文'), hint: i18nT('按公文写法起草，只用要点里的事实') },
  { key: 'gd-review', title: i18nT('核对修改'), hint: i18nT('要点里没有的数字会标出来，逐处核对后保存') },
  { key: 'gd-export', title: i18nT('导出 Word'), hint: i18nT('按 GB/T 9704 版式') },
];
const runtime = computed<Record<string, StepRuntime>>(() => {
  const d = doc.value;
  const err = errors.value;
  return {
    'gd-input': form.title.trim() && form.points.trim() ? { state: 'done', summary: `${kindLabel(form.kind)} · ${form.title}` } : { state: 'todo' },
    'gd-draft': busy.value === 'draft' ? { state: 'running', kind: 'llm', progressAt: Date.now() } : err.draft ? { state: 'failed', error: err.draft } : d ? { state: 'done', summary: i18nT('{n} 字', { n: d.body.length }) } : { state: 'todo' },
    'gd-review': d && body.value === d.body && (!d.unverified.length || ack.value) ? { state: 'done', summary: i18nT('数字已核对') } : { state: 'todo' },
    'gd-export': err.export ? { state: 'failed', error: err.export } : d?.docxPath && body.value === d.body ? { state: 'done', summary: d.docxPath } : { state: 'todo' },
  };
});
const currentKey = computed(() => metas.find((m) => runtime.value[m.key].state !== 'done')?.key || 'gd-export');
const jump = (k: string): void => { void scrollToStep(k); };

async function act<T>(key: string, fn: () => Promise<T>): Promise<T | null> {
  busy.value = key;
  errors.value = { ...errors.value, [key]: '' };
  try { const x = await fn(); await refreshState(); return x; } catch (e) { errors.value = { ...errors.value, [key]: errorMessage(e) }; notif.error(errorMessage(e)); return null; } finally { busy.value = ''; }
}
async function draft(): Promise<void> {
  const d = await act('draft', () => ca<CaOfficialDoc>('doc.draft', { input: { id: docId.value || undefined, ...form } }));
  if (d) { docId.value = d.id; body.value = d.body; void scrollToStep('gd-review'); }
}
async function saveBody(): Promise<void> {
  await act('save', () => ca('doc.save', { id: docId.value, patch: { body: body.value, ...form } }));
}
async function exportDoc(): Promise<void> {
  const f = await act('export', () => ca<string>('doc.export', { id: docId.value }));
  if (f) notif.success(i18nT('已导出 Word'));
}
async function runReport(): Promise<void> {
  const r = await act('hot', () => ca<CaHotspotReport>('hotspot.report', { days: days.value, useModel: useModel.value }));
  if (r) report.value = r;
}
async function exportReport(): Promise<void> {
  const f = await act('hexport', () => ca<string>('hotspot.export', { report: report.value }));
  if (f) void openPath(f, true);
}
function trend(cur: number, prev: number): string {
  if (!prev) return i18nT('上期 {n}', { n: prev });
  const d = Math.round(((cur - prev) / prev) * 100);
  return d >= 0 ? i18nT('比上期 +{n}%', { n: d }) : i18nT('比上期 {n}%', { n: d });
}
</script>

<style scoped>
.ca-gov { display: grid; gap: 14px; }
.ca-subnav { display: flex; gap: 6px; padding: 6px; border: 1px solid var(--color-border); border-radius: 12px; background: var(--color-bg-card); width: fit-content; }
.ca-subnav button { display: inline-flex; gap: 6px; align-items: center; padding: 6px 14px; border: none; border-radius: 8px; background: transparent; font: inherit; font-size: 13px; font-weight: 600; color: var(--color-text-secondary); cursor: pointer; }
.ca-subnav button.on { background: var(--ca-oxblood); color: var(--ca-banner-ink); }
/* 公文预览：白纸、红头、红线，与导出的 Word 同一套版式 */
.ca-paper { background: #fffefb; color: #1a1a1a; border: 1px solid var(--color-border); border-radius: 6px; padding: 28px 40px; display: grid; gap: 6px; max-width: 820px; }
.ca-paper__head { margin: 0; text-align: center; color: #d40000; font-family: var(--ca-serif); font-size: 30px; font-weight: 800; letter-spacing: .08em; }
.ca-paper__no { margin: 0; text-align: center; font-size: 14px; }
.ca-paper hr { border: none; border-top: 2px solid #d40000; margin: 4px 0 12px; width: 100%; }
.ca-paper__title { margin: 0; text-align: center; font-family: var(--ca-serif); font-size: 20px; font-weight: 700; line-height: 1.5; text-wrap: balance; }
.ca-paper__to { margin: 8px 0 0; font-size: 15px; }
.ca-paper__body { width: 100%; border: 1px dashed #d8cfc4; border-radius: 4px; padding: 8px 10px; font: 15px/2 'FangSong', 'STFangsong', var(--ca-serif); color: #1a1a1a; background: transparent; resize: vertical; }
.ss-kpi.alert strong { color: var(--color-danger); }
td.warn { color: var(--color-warning); font-weight: 700; }
.ca-gaps { margin: 0; padding-inline-start: 20px; display: grid; gap: 6px; font-size: 13px; }
.ca-gaps li { display: grid; grid-template-columns: minmax(0, 1fr) auto auto; gap: 10px; }
.ca-gaps em { font-style: normal; color: var(--color-text-secondary); font-size: 12px; }
.ca-kw { display: flex; flex-wrap: wrap; gap: 6px 14px; align-items: baseline; padding-top: 6px; }
.ca-kw span { font-family: var(--ca-serif); color: var(--ca-oxblood); }
.ca-kw sup { font-size: 10px; color: var(--color-text-secondary); margin-inline-start: 1px; }
</style>
