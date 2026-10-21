<template>
  <div class="ss-module">
    <ModuleHeader :meta="meta" />
    <StickyProgress :title="$t('网站/社媒')" :metas="metas" :runtime="runtime" :current-key="currentKey" @jump="scrollTo" />
    <div class="ss-steps">
      <StepCard step-key="schedule" :index="0" :title="metas[0].title" :hint="metas[0].hint" :runtime="runtime.schedule">
        <div v-if="contents.length" class="ss-table-wrap">
          <table class="ss-table">
            <thead><tr><th>{{ $t('内容') }}</th><th>{{ $t('状态') }}</th><th>{{ $t('发布渠道') }}</th><th>{{ $t('计划时间') }}</th><th></th></tr></thead>
            <tbody>
              <tr v-for="c in contents" :key="c.id">
                <td class="ft-wrap">{{ c.title || $t('（无标题）') }}</td>
                <td><span class="ss-chip" :class="c.status === 'approved' ? 'ok' : ''">{{ c.status === 'approved' ? $t('已定稿') : $t('草稿') }}</span><span v-if="c.published" class="ss-chip brand">{{ $t('已交付发布') }}</span></td>
                <td><select v-model="edits[c.id].channel"><option value="">—</option><option v-for="ch in CHANNELS" :key="ch" :value="ch">{{ ch }}</option></select></td>
                <td><input v-model="edits[c.id].scheduledAt" type="datetime-local" /></td>
                <td><button type="button" class="ss-btn sm ghost" :disabled="busy === 'schedule'" @click="saveSchedule(c.id)"><i class="ri-save-line"></i>{{ $t('保存') }}</button></td>
              </tr>
            </tbody>
          </table>
        </div>
        <p v-else class="ss-empty">{{ $t('还没有内容，先到「内容生产」写好并定稿') }}</p>
        <div v-if="calendar.length">
          <div class="ss-subhead">{{ $t('排期') }}</div>
          <ul class="ft-cal">
            <li v-for="c in calendar" :key="c.id" :class="{ past: (c.scheduledAt || '') < nowLocal }">
              <strong>{{ (c.scheduledAt || '').replace('T', ' ') }}</strong>
              <span class="ss-chip brand">{{ c.channel || '—' }}</span>
              <span>{{ c.title }}</span>
              <span v-if="c.published" class="ss-chip ok">{{ $t('已交付发布') }}</span>
            </li>
          </ul>
        </div>
      </StepCard>

      <StepCard step-key="publish" :index="1" :title="metas[1].title" :hint="metas[1].hint" :runtime="runtime.publish">
        <div class="ss-grid">
          <label class="ss-field"><span>{{ $t('要发布的内容（已定稿）') }}</span>
            <select v-model="publishId">
              <option value="">{{ $t('请选择') }}</option>
              <option v-for="c in approved" :key="c.id" :value="c.id">{{ c.title }}</option>
            </select>
          </label>
          <label class="ss-field"><span>{{ $t('发布渠道') }}</span>
            <select v-model="publishChannel"><option v-for="ch in CHANNELS" :key="ch" :value="ch">{{ ch }}</option></select>
          </label>
        </div>
        <p class="ss-note info"><i class="ri-information-line"></i>{{ $t('数字员工会用内置浏览器里已登录的账号打开发帖页、填好正文并上传素材；点击「发布」前会停下来请你确认。') }}</p>
        <div class="ss-actions">
          <button type="button" class="ss-btn primary" :disabled="!publishId || busy === 'publish'" @click="handOver"><i :class="busy === 'publish' ? 'ri-loader-4-line spin' : 'ri-robot-2-line'"></i>{{ $t('交给数字员工发布') }}</button>
          <span class="grow"></span>
          <button type="button" class="ss-btn ghost" @click="router.push('/workbenches/global-ads')"><i class="ri-megaphone-line"></i>{{ $t('海外社媒投放工作台') }}</button>
          <button type="button" class="ss-btn ghost" @click="router.push('/video-studio')"><i class="ri-film-line"></i>{{ $t('短视频工作台') }}</button>
        </div>
        <div v-if="jobs.length" class="ss-table-wrap">
          <table class="ss-table">
            <thead><tr><th>{{ $t('时间') }}</th><th>{{ $t('渠道') }}</th><th>{{ $t('内容') }}</th><th></th></tr></thead>
            <tbody>
              <tr v-for="j in jobs" :key="j.id">
                <td>{{ fmtDateTime(j.at) }}</td><td>{{ j.channel }}</td><td class="ft-wrap">{{ contentTitle(j.contentId) }}</td>
                <td><button v-if="j.conversationId" type="button" class="ss-btn sm ghost" @click="router.push(`/conversations/${j.conversationId}`)"><i class="ri-eye-line"></i>{{ $t('查看执行过程') }}</button></td>
              </tr>
            </tbody>
          </table>
        </div>
      </StepCard>

      <StepCard step-key="seo" :index="2" :title="metas[2].title" :hint="metas[2].hint" :runtime="runtime.seo">
        <div class="ss-actions">
          <input v-model="siteUrl" type="url" class="ft-input" placeholder="https://www.yourcompany.com" />
          <button type="button" class="ss-btn primary" :disabled="!siteUrl || busy === 'seo'" @click="checkSite"><i :class="busy === 'seo' ? 'ri-loader-4-line spin' : 'ri-search-eye-line'"></i>{{ $t('检查网站') }}</button>
        </div>
        <p v-if="busy === 'seo'" class="ss-muted">{{ ftProgress.social || $t('正在逐页检查，最多 15 个页面，通常需要几分钟…') }}</p>
        <template v-if="latestSeo">
          <div class="ss-kpis">
            <div class="ss-kpi"><small>{{ $t('检查页面') }}</small><strong>{{ latestSeo.pages }}</strong></div>
            <div class="ss-kpi"><small>{{ $t('SEO 问题') }}</small><strong>{{ latestSeo.issues.length }}</strong></div>
            <div class="ss-kpi"><small>{{ $t('失效链接') }}</small><strong>{{ latestSeo.brokenLinks }}</strong></div>
            <div class="ss-kpi"><small>{{ $t('失效图片') }}</small><strong>{{ latestSeo.brokenImages }}</strong></div>
          </div>
          <ul class="ft-issues"><li v-for="(x, i) in latestSeo.issues" :key="i">{{ x }}</li></ul>
          <p class="ss-muted">{{ $t('检查时间：{p0} · {p1}', { p0: fmtDateTime(latestSeo.at), p1: latestSeo.url }) }}</p>
        </template>
      </StepCard>

      <StepCard step-key="data" :index="3" :title="metas[3].title" :hint="metas[3].hint" :runtime="runtime.data">
        <div class="ss-kpis">
          <div class="ss-kpi"><small>{{ $t('内容总数') }}</small><strong>{{ contents.length }}</strong></div>
          <div class="ss-kpi"><small>{{ $t('已定稿') }}</small><strong>{{ approved.length }}</strong></div>
          <div class="ss-kpi"><small>{{ $t('已排期') }}</small><strong>{{ calendar.length }}</strong></div>
          <div class="ss-kpi accent"><small>{{ $t('已交付发布') }}</small><strong>{{ jobs.length }}</strong></div>
        </div>
        <div v-if="byChannel.length" class="ss-table-wrap">
          <table class="ss-table">
            <thead><tr><th>{{ $t('渠道') }}</th><th class="num">{{ $t('排期') }}</th><th class="num">{{ $t('已发布') }}</th></tr></thead>
            <tbody><tr v-for="r in byChannel" :key="r.channel"><td>{{ r.channel }}</td><td class="num">{{ r.scheduled }}</td><td class="num">{{ r.published }}</td></tr></tbody>
          </table>
        </div>
        <p class="ss-muted">{{ $t('关注、互动等账号数据请从各平台后台导出；站内发布记录在这里汇总。') }}</p>
      </StepCard>
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * 网站/社媒：内容排期 → 交给数字员工发布 → 网站 SEO 检查 → 发布数据汇总。
 */
import { computed, reactive, ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useNotificationStore } from '../../stores/notification';
import { t as i18nT } from '../../i18n';
import StepCard from '../service-settlement/StepCard.vue';
import StickyProgress from '../service-settlement/StickyProgress.vue';
import { scrollToStep, type StepMeta, type StepRuntime } from '../service-settlement/shared';
import ModuleHeader from './ModuleHeader.vue';
import { errorMessage, fmtDateTime, ft, ftProgress, ftState, refreshState, type FtModuleMeta } from './shared';

const props = defineProps<{ meta: FtModuleMeta; focus?: { contentId?: string } | null }>();
defineEmits<{ (e: 'goto', module: string, payload: any): void }>();
const router = useRouter();
const notif = useNotificationStore();
const state = ftState;
const CHANNELS = ['LinkedIn', 'Facebook', 'Instagram', 'YouTube', 'TikTok', 'X'];

const contents = computed(() => state.value?.contents || []);
const approved = computed(() => contents.value.filter((c) => c.status === 'approved'));
const jobs = computed(() => (state.value?.publishJobs || []).filter((j) => j.kind === 'social_post'));
const calendar = computed(() => contents.value.filter((c) => c.scheduledAt).slice().sort((a, b) => (a.scheduledAt || '').localeCompare(b.scheduledAt || '')));
const latestSeo = computed(() => state.value?.seoChecks[0] || null);
const nowLocal = new Date(Date.now() - new Date().getTimezoneOffset() * 60_000).toISOString().slice(0, 16);

const edits = reactive<Record<string, { channel: string; scheduledAt: string }>>({});
watch(contents, (list) => {
  for (const c of list) if (!edits[c.id]) edits[c.id] = { channel: c.channel || '', scheduledAt: c.scheduledAt || '' };
}, { immediate: true });

const publishId = ref('');
const publishChannel = ref('LinkedIn');
const siteUrl = ref('');
const busy = ref('');
const errors = ref<Record<string, string>>({});
watch(() => state.value?.settings.website, (w) => { if (w && !siteUrl.value) siteUrl.value = w; }, { immediate: true });
watch(() => props.focus?.contentId, (id) => { if (id) { publishId.value = id; void scrollToStep('publish'); } }, { immediate: true });

const byChannel = computed(() => CHANNELS.map((ch) => ({
  channel: ch,
  scheduled: contents.value.filter((c) => c.channel === ch && c.scheduledAt).length,
  published: jobs.value.filter((j) => j.channel === ch).length,
})).filter((r) => r.scheduled || r.published));

const metas: StepMeta[] = [
  { key: 'schedule', title: i18nT('内容排期'), hint: i18nT('给定稿内容定渠道和发布时间') },
  { key: 'publish', title: i18nT('发布'), hint: i18nT('交给数字员工在内置浏览器里发，发布前由你确认') },
  { key: 'seo', title: i18nT('网站检查'), hint: i18nT('检查标题、描述、失效链接和图片等基础 SEO 问题') },
  { key: 'data', title: i18nT('数据整理'), hint: i18nT('按渠道汇总排期和发布情况') },
];
const runtime = computed<Record<string, StepRuntime>>(() => {
  const st = (key: string, done: boolean, summary?: string): StepRuntime => (busy.value === key
    ? { state: 'running' }
    : errors.value[key] ? { state: 'failed', error: errors.value[key] }
      : done ? { state: 'done', summary } : { state: 'todo' });
  return {
    schedule: st('schedule', calendar.value.length > 0, i18nT('{n} 条已排期', { n: calendar.value.length })),
    publish: st('publish', jobs.value.length > 0, i18nT('{n} 次', { n: jobs.value.length })),
    seo: st('seo', !!latestSeo.value, latestSeo.value ? i18nT('{n} 个问题', { n: latestSeo.value.issues.length }) : ''),
    data: st('data', jobs.value.length > 0),
  };
});
const currentKey = computed(() => metas.find((m) => runtime.value[m.key].state !== 'done')?.key || 'data');

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
function contentTitle(id: string): string { return contents.value.find((c) => c.id === id)?.title || id; }

async function saveSchedule(id: string): Promise<void> {
  const e = edits[id];
  const ok = await run('schedule', () => ft('content.save', { draft: { id, channel: e.channel, scheduledAt: e.scheduledAt } }));
  if (ok) notif.success(i18nT('已保存'));
}
async function handOver(): Promise<void> {
  const c = contents.value.find((x) => x.id === publishId.value);
  if (!c) return;
  const ok = await run('publish', async () => {
    const text = await ft<string>('publish.instruction', { contentId: c.id, kind: 'social_post', channel: publishChannel.value });
    const api = (window as any).electronAPI;
    const conv = await api.conversation.create({ kind: 'single', members: ['general_assistant'], title: i18nT('发布到 {p0}：{p1}', { p0: publishChannel.value, p1: c.title.slice(0, 30) }), initialMessage: text });
    void api.conversation.sendMessage(conv.id, text);
    await ft('publish.record', { contentId: c.id, kind: 'social_post', channel: publishChannel.value, conversationId: conv.id });
  });
  if (ok) notif.success(i18nT('已交给数字员工，点击「查看执行过程」可以看它操作；发布前会请你确认'));
}
async function checkSite(): Promise<void> {
  await run('seo', () => ft('seo.check', { url: siteUrl.value.trim() }));
}
function scrollTo(key: string): void { void scrollToStep(key); }
</script>

<style scoped>
.ft-wrap { white-space: normal !important; max-width: 320px; }
.ft-input { height: 34px; border-radius: 9px; border: 1px solid var(--color-border); background: var(--color-bg-input, var(--color-bg-primary)); color: var(--color-text-primary); font: inherit; font-size: 12.5px; padding: 0 10px; min-width: 260px; flex: 1; }
.ft-cal { list-style: none; margin: 6px 0 0; padding: 0; display: grid; gap: 6px; }
.ft-cal li { display: flex; gap: 8px; align-items: center; font-size: 12.5px; padding: 6px 10px; border-radius: 8px; background: var(--color-bg-primary); }
.ft-cal li.past { opacity: .6; }
.ft-issues { margin: 0; padding-inline-start: 20px; font-size: 12.5px; display: grid; gap: 3px; }
</style>
