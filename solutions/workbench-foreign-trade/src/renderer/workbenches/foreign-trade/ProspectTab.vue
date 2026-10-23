<template>
  <div class="ss-module">
    <ModuleHeader :meta="meta" />

    <section class="ss-rules">
      <h4><i class="ri-user-search-line"></i>{{ $t('客户画像') }}</h4>
      <div class="ss-grid">
        <label class="ss-field"><span>{{ $t('产品关键词') }}</span><input v-model.trim="criteria.keywords" type="text" placeholder="LED panel light" /></label>
        <label class="ss-field"><span>{{ $t('目标国家/地区') }}</span><input v-model.trim="criteria.country" type="text" placeholder="Germany" /></label>
        <label class="ss-field"><span>{{ $t('目标行业') }}</span><input v-model.trim="criteria.industry" type="text" /></label>
        <label class="ss-field"><span>{{ $t('客户类型') }}</span><input v-model.trim="criteria.customerType" type="text" placeholder="importer distributor wholesaler" /></label>
        <label class="ss-field"><span>{{ $t('排除') }}</span><input v-model.trim="criteria.exclude" type="text" :placeholder="$t('同行工厂、个人卖家等')" /></label>
        <label class="ss-field"><span>{{ $t('数量') }}</span><input v-model.number="criteria.count" type="number" min="5" max="40" /></label>
      </div>
    </section>

    <StickyProgress :title="$t('客户开发')" :metas="metas" :runtime="runtime" :current-key="currentKey" @jump="scrollTo" />
    <p v-if="busy && ftProgress.prospect" class="ss-note info"><i class="ri-loader-4-line spin"></i>{{ ftProgress.prospect }}</p>

    <div class="ss-steps">
      <StepCard step-key="search" :index="0" :title="metas[0].title" :hint="metas[0].hint" :runtime="runtime.search">
        <div class="ss-actions">
          <button type="button" class="ss-btn primary" :disabled="!!busy || !criteria.keywords" @click="search">
            <i :class="busy === 'search' ? 'ri-loader-4-line spin' : 'ri-search-line'"></i>{{ $t('检索潜客') }}
          </button>
          <span class="grow"></span>
          <span class="ss-muted">{{ $t('检索批次') }}</span>
          <select v-model="batchId" class="ft-select">
            <option value="">{{ $t('请选择') }}</option>
            <option v-for="b in batches" :key="b.id" :value="b.id">{{ $t('{p0} · {p1} · {p2}（{p3}）', { p0: fmtDateTime(b.createdAt), p1: b.criteria.keywords, p2: b.criteria.country || $t('不限'), p3: b.leadIds.length }) }}</option>
          </select>
          <button type="button" class="ss-btn sm ghost danger" :disabled="!batchId" :title="$t('删除这一批潜客')" @click="removeBatch"><i class="ri-delete-bin-line"></i></button>
        </div>
      </StepCard>

      <StepCard step-key="enrich" :index="1" :title="metas[1].title" :hint="metas[1].hint" :runtime="runtime.enrich">
        <div class="ss-actions">
          <button type="button" class="ss-btn primary" :disabled="!!busy || !batchId" @click="enrich">
            <i :class="busy === 'enrich' ? 'ri-loader-4-line spin' : 'ri-global-line'"></i>{{ $t('读取潜客网站') }}
          </button>
          <span class="ss-muted">{{ $t('读取首页与联系页，收集公司信息和公开邮箱') }}</span>
        </div>
      </StepCard>

      <StepCard step-key="score" :index="2" :title="metas[2].title" :hint="metas[2].hint" :runtime="runtime.score">
        <div class="ss-actions">
          <button type="button" class="ss-btn primary" :disabled="!!busy || !batchId" @click="score">
            <i :class="busy === 'score' ? 'ri-loader-4-line spin' : 'ri-medal-line'"></i>{{ $t('按画像打分') }}
          </button>
          <span class="grow"></span>
          <button type="button" class="ss-btn sm ghost" :disabled="!leads.length" @click="selectTier('A')">{{ $t('选中 A 档') }}</button>
          <button type="button" class="ss-btn sm ghost" :disabled="!selected.length" @click="selected = []">{{ $t('清空选择') }}</button>
        </div>
        <div v-if="leads.length" class="ss-table-wrap">
          <table class="ss-table">
            <thead>
              <tr>
                <th></th><th>{{ $t('公司') }}</th><th>{{ $t('网站') }}</th><th>{{ $t('邮箱') }}</th><th>{{ $t('国家') }}</th>
                <th class="num">{{ $t('分数') }}</th><th>{{ $t('档位') }}</th><th>{{ $t('依据') }}</th><th>{{ $t('状态') }}</th><th></th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="l in leads" :key="l.id" :class="{ 'ft-excluded': l.status === 'excluded' }">
                <td><input v-model="selected" type="checkbox" :value="l.id" :disabled="l.status === 'excluded'" /></td>
                <td><strong>{{ l.company }}</strong></td>
                <td><button v-if="l.website" type="button" class="ss-link" @click="openUrl(l.website)">{{ host(l.website) }}</button></td>
                <td class="ft-wrap">
                  <span v-if="l.emailLevel" class="ss-chip" :class="levelClass(l.emailLevel)" :title="levelHint(l.emailLevel)">{{ l.emailLevel }}</span>
                  {{ l.emails.join(', ') || '—' }}
                </td>
                <td>{{ l.country || '—' }}</td>
                <td class="num" :title="scoreTitle(l)">
                  {{ l.score ?? '—' }}
                  <small v-if="l.modelScore != null && (l.modelScore !== l.score || l.modelTier !== l.tier)" class="ft-model-score" data-test="ft-score-corrected">{{ $t('模型初判 {a} / {b}', { a: l.modelScore, b: l.modelTier || '' }) }}</small>
                </td>
                <td><span v-if="l.tier" class="ss-chip" :class="tierClass(l.tier)">{{ l.tier }}</span></td>
                <td class="ft-wrap">{{ l.reason || '' }}</td>
                <td><span class="ss-chip" :class="statusClass(l.status)">{{ statusLabel(l.status) }}</span></td>
                <td><button v-if="l.status !== 'excluded' && l.status !== 'sent'" type="button" class="ss-btn sm ghost" @click="exclude(l)">{{ $t('排除') }}</button></td>
              </tr>
            </tbody>
          </table>
        </div>
        <p v-else class="ss-empty">{{ $t('先检索潜客') }}</p>
      </StepCard>

      <StepCard step-key="draft" :index="3" :title="metas[3].title" :hint="metas[3].hint" :runtime="runtime.draft">
        <div class="ss-actions">
          <button type="button" class="ss-btn primary" :disabled="!!busy || !selected.length" @click="draft">
            <i :class="busy === 'draft' ? 'ri-loader-4-line spin' : 'ri-quill-pen-line'"></i>{{ $t('为选中的 {n} 家写开发信', { n: selected.length }) }}
          </button>
        </div>
      </StepCard>

      <StepCard step-key="send" :index="4" :title="metas[4].title" :hint="metas[4].hint" :runtime="runtime.send">
        <div class="ss-actions">
          <span class="ss-muted">{{ $t('发件邮箱') }}</span>
          <select v-model="mailboxId" class="ft-select">
            <option value="">{{ $t('请选择') }}</option>
            <option v-for="m in mailboxOptions" :key="m.id" :value="m.id">{{ m.label || m.address }}</option>
          </select>
          <span class="ss-muted">{{ $t('建议每天少量发送，避免邮箱被判为群发') }}</span>
        </div>
        <div v-for="l in drafted" :key="l.id" class="ft-letter">
          <div class="ft-letter__head" @click="toggle(l.id)">
            <i :class="open[l.id] ? 'ri-arrow-down-s-line' : 'ri-arrow-right-s-line'"></i>
            <strong>{{ l.company }}</strong>
            <span class="ss-chip" :class="statusClass(l.status)">{{ statusLabel(l.status) }}</span>
            <span v-if="l.letter" class="ss-muted">{{ $t('由 {p0} 撰写', { p0: modelLabel(l.letter.model) }) }}</span>
          </div>
          <template v-if="open[l.id] && editors[l.id]">
            <label class="ss-field"><span>{{ $t('收件人') }}</span><input v-model="editors[l.id].to" type="text" /></label>
            <label class="ss-field"><span>{{ $t('标题') }}</span><input v-model="editors[l.id].subject" type="text" /></label>
            <label class="ss-field"><span>{{ $t('正文') }}</span><textarea v-model="editors[l.id].body" rows="10"></textarea></label>
            <GateIssues :result="gates[l.id]" :opt-out-line="ftState?.settings.sendRules.optOutLine" @fix-opt-out="(line) => (editors[l.id].body = `${editors[l.id].body.trimEnd()}\n\n${line}`)" />
            <div class="ss-actions">
              <span class="grow"></span>
              <button type="button" class="ss-btn primary" :disabled="busy === 'send' || !mailboxId || l.status === 'sent'" @click="send(l)">
                <i :class="sendingId === l.id ? 'ri-loader-4-line spin' : 'ri-send-plane-line'"></i>{{ l.status === 'sent' ? $t('已发送') : $t('发送') }}
              </button>
            </div>
          </template>
        </div>
        <p v-if="!drafted.length" class="ss-empty">{{ $t('还没有写好的开发信') }}</p>
      </StepCard>
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * 客户开发：检索潜客 → 读取网站 → 按画像打分 → 写开发信 → 选邮箱确认发送。
 */
import { computed, reactive, ref, watch } from 'vue';
import type { FtEmailLevel, FtGateResult, FtLead, FtProspectCriteria } from '@totalclaw/ipc-contracts';
import { useNotificationStore } from '../../stores/notification';
import { t as i18nT } from '../../i18n';
import StepCard from '../service-settlement/StepCard.vue';
import StickyProgress from '../service-settlement/StickyProgress.vue';
import { scrollToStep, type StepMeta, type StepRuntime } from '../service-settlement/shared';
import ModuleHeader from './ModuleHeader.vue';
import GateIssues from './GateIssues.vue';
import {
  checkBeforeSend, enabledMailboxes, errorMessage, fmtDateTime, ft, ftProgress, ftState, mailboxName, modelLabel, refreshState,
  splitEmails, type FtModuleMeta,
} from './shared';

defineProps<{ meta: FtModuleMeta; focus?: Record<string, unknown> | null }>();
defineEmits<{ (e: 'goto', module: string, payload: any): void }>();
const notif = useNotificationStore();

const criteria = reactive<FtProspectCriteria>({ country: '', industry: '', keywords: '', customerType: '', exclude: '', count: 15 });
const batchId = ref('');
const busy = ref('');
const sendingId = ref('');
const errors = ref<Record<string, string>>({});
const selected = ref<string[]>([]);
const open = reactive<Record<string, boolean>>({});
const editors = reactive<Record<string, { to: string; subject: string; body: string }>>({});
const gates = reactive<Record<string, FtGateResult | null>>({});
const mailboxId = ref('');

const batches = computed(() => ftState.value?.prospectBatches || []);
const batch = computed(() => batches.value.find((b) => b.id === batchId.value) || null);
const leads = computed<FtLead[]>(() => {
  const b = batch.value;
  if (!b) return [];
  return (ftState.value?.leads || []).filter((l) => b.leadIds.includes(l.id))
    .slice().sort((a, c) => (c.score ?? -1) - (a.score ?? -1));
});
const drafted = computed(() => leads.value.filter((l) => l.letter));
const mailboxOptions = computed(() => {
  const list = enabledMailboxes(ftState.value);
  return [...list.filter((m) => m.purposes.includes('outreach')), ...list.filter((m) => !m.purposes.includes('outreach'))];
});

watch(batches, (l) => { if (!batchId.value && l.length) batchId.value = l[0].id; }, { immediate: true });
watch(batch, (b) => { if (b) Object.assign(criteria, b.criteria); selected.value = []; errors.value = {}; });
watch(mailboxOptions, (l) => { if (!mailboxId.value && l.length) mailboxId.value = l[0].id; }, { immediate: true });
watch(drafted, (l) => {
  for (const x of l) {
    if (!editors[x.id] && x.letter) editors[x.id] = { to: x.emails[0] || '', subject: x.letter.subject, body: x.letter.body };
  }
}, { immediate: true });

const metas: StepMeta[] = [
  { key: 'search', title: i18nT('检索潜客'), hint: i18nT('按产品、国家、客户类型检索公开网页，去掉平台、社媒和已有客户') },
  { key: 'enrich', title: i18nT('读取潜客网站'), hint: i18nT('读取官网首页与联系页，收集公司信息和邮箱') },
  { key: 'score', title: i18nT('按画像打分'), hint: i18nT('按客户画像给 0～100 分并分 A/B/C 档，附依据') },
  { key: 'draft', title: i18nT('写开发信'), hint: i18nT('针对每家公司的业务写开发信初稿') },
  { key: 'send', title: i18nT('确认发送'), hint: i18nT('业务员逐封修改确认后，从选定邮箱发出') },
];
const runtime = computed<Record<string, StepRuntime>>(() => {
  const ls = leads.value;
  const st = (key: string, done: boolean, summary?: string): StepRuntime => (busy.value === key
    ? { state: 'running' }
    : errors.value[key] ? { state: 'failed', error: errors.value[key] }
      : done ? { state: 'done', summary } : { state: 'todo' });
  const withEmail = ls.filter((l) => l.emails.length).length;
  const scored = ls.filter((l) => l.score != null).length;
  const sent = ls.filter((l) => l.status === 'sent').length;
  return {
    search: st('search', ls.length > 0, i18nT('{n} 家潜客', { n: ls.length })),
    enrich: st('enrich', withEmail > 0, i18nT('{n} 家找到邮箱', { n: withEmail })),
    score: st('score', scored > 0, i18nT('A 档 {n} 家', { n: ls.filter((l) => l.tier === 'A').length })),
    draft: st('draft', drafted.value.length > 0, i18nT('{n} 封', { n: drafted.value.length })),
    send: st('send', sent > 0, i18nT('已发 {n} 封', { n: sent })),
  };
});
const currentKey = computed(() => metas.find((m) => runtime.value[m.key].state !== 'done')?.key || 'send');

function statusLabel(s: FtLead['status']): string {
  return { found: i18nT('已找到'), scored: i18nT('已打分'), drafted: i18nT('已写信'), sent: i18nT('已发送'), excluded: i18nT('已排除') }[s];
}
function statusClass(s: FtLead['status']): string {
  return s === 'sent' ? 'ok' : s === 'drafted' ? 'brand' : s === 'excluded' ? '' : 'warn';
}
function tierClass(t: string): string { return t === 'A' ? 'ok' : t === 'B' ? 'warn' : ''; }
function levelClass(l: FtEmailLevel): string { return l === 'E1' ? 'ok' : l === 'E2' ? 'brand' : l === 'E3' ? 'warn' : 'bad'; }
function levelHint(l: FtEmailLevel): string {
  return { E1: i18nT('E1：官网上的具名或采购部门邮箱，可以直接发'), E2: i18nT('E2：官网上的通用邮箱（info / sales），可以发'), E3: i18nT('E3：邮箱域名和官网不一致，发前请核实'), E4: i18nT('E4：没有可用邮箱（或域名不收信），不算可触达') }[l];
}
/** 分数由代码按固定公式复算（邮箱 40% + 证据来源 25% + 决策人 20% + 规模 15% − 疑点），模型只做初判 */
function scoreTitle(l: FtLead): string {
  const d = l.scoreDetail;
  if (!d) return '';
  return i18nT('代码复算：邮箱 {a} · 来源 {b} · 决策人 {c} · 规模 {d} · 扣分 {e}', { a: d.email, b: d.sources, c: d.decisionMaker, d: d.scale, e: d.penalty })
    + (d.critical.length ? `\n${i18nT('严重疑点：{p0}', { p0: d.critical.join('；') })}` : '');
}
function host(url: string): string { try { return new URL(url).hostname.replace(/^www\./, ''); } catch { return url; } }

async function run(key: string, fn: () => Promise<unknown>): Promise<boolean> {
  busy.value = key;
  errors.value = { ...errors.value, [key]: '' };
  ftProgress.prospect = '';
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
    const r = await ft<{ batchId: string; count: number }>('prospect.search', { criteria: { ...criteria } });
    batchId.value = r.batchId;
  });
}
async function enrich(): Promise<void> { await run('enrich', () => ft('prospect.enrich', { batchId: batchId.value })); }
async function score(): Promise<void> { await run('score', () => ft('prospect.score', { batchId: batchId.value })); }
async function draft(): Promise<void> {
  const ids = [...selected.value];
  const ok = await run('draft', () => ft('prospect.draft', { leadIds: ids }));
  if (ok) for (const id of ids) { open[id] = true; delete editors[id]; }
  // 重新生成的信要覆盖旧编辑内容
  for (const l of drafted.value) if (!editors[l.id] && l.letter) editors[l.id] = { to: l.emails[0] || '', subject: l.letter.subject, body: l.letter.body };
}
function selectTier(t: 'A' | 'B' | 'C'): void {
  selected.value = leads.value.filter((l) => l.tier === t && l.status !== 'excluded' && l.status !== 'sent').map((l) => l.id);
}
async function exclude(l: FtLead): Promise<void> {
  try {
    await ft('prospect.update', { leadId: l.id, patch: { status: 'excluded' } });
    selected.value = selected.value.filter((x) => x !== l.id);
    await refreshState();
  } catch (e) { notif.error(errorMessage(e)); }
}
async function removeBatch(): Promise<void> {
  if (!batchId.value || !window.confirm(i18nT('删除这一批潜客？已经发出的开发信不受影响。'))) return;
  try { await ft('prospect.removeBatch', { batchId: batchId.value }); batchId.value = ''; await refreshState(); } catch (e) { notif.error(errorMessage(e)); }
}
function toggle(id: string): void { open[id] = !open[id]; }
async function send(l: FtLead): Promise<void> {
  const e = editors[l.id];
  if (!e || !mailboxId.value) return;
  const to = splitEmails(e.to);
  if (!to.length) { notif.warn(i18nT('请填写收件人')); return; }
  let approvedHash: string | null;
  try {
    const r = await checkBeforeSend({ kind: 'outreach', mailboxId: mailboxId.value, to, subject: e.subject, body: e.body, refId: l.id }, mailboxName(ftState.value, mailboxId.value));
    gates[l.id] = r.result;
    approvedHash = r.hash;
  } catch (err) { notif.error(errorMessage(err)); return; }
  if (!approvedHash) return;
  sendingId.value = l.id;
  const ok = await run('send', () => ft('prospect.send', { leadId: l.id, mailboxId: mailboxId.value, to, subject: e.subject, body: e.body, approvedHash }));
  sendingId.value = '';
  if (ok) notif.success(i18nT('已发送'));
}
function openUrl(url: string): void {
  const api = (window as any).electronAPI;
  if (api?.openExternal) void api.openExternal(url);
  else window.open(url, '_blank');
}
function scrollTo(key: string): void { void scrollToStep(key); }
</script>

<style scoped>
.ft-select { height: 30px; border-radius: var(--radius-3); border: 1px solid var(--color-border); background: var(--color-bg-input); color: var(--color-text-primary); font: inherit; font-size: var(--font-size-sm); max-width: 360px; }
.ft-wrap { white-space: normal !important; max-width: 280px; }
.ft-excluded td { opacity: .5; }
.ft-letter { border: 1px solid var(--color-border); border-radius: var(--radius-4); padding: 8px 10px; display: grid; gap: 8px; }
.ft-letter__head { display: flex; gap: 8px; align-items: center; cursor: pointer; font-size: var(--font-size-md); flex-wrap: wrap; }
.ft-model-score { display: block; font-size: 10.5px; color: var(--color-text-secondary); white-space: nowrap; }
</style>
