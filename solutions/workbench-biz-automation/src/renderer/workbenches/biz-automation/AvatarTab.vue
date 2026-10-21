<template>
  <div class="ss-module">
    <ModuleHeader module-key="avatar" icon="ri-user-voice-line" :title="$t('数字人出镜介绍企业')"
      :ability="$t('从知识库取公司名称、地址、主营、特色服务写讲稿（没有的写【待补充】）→ 数字人口播成片带字幕 → 进入短视频发布')"
      :output="$t('30～120 秒口播成片，画面固定标注 AI 生成；讲稿自检广告法极限词')" />

    <div class="ba-projbar">
      <label class="ss-field"><span>{{ $t('数字人项目') }}</span>
        <select v-model="currentId">
          <option value="">{{ $t('— 新建 —') }}</option>
          <option v-for="a in avatars" :key="a.id" :value="a.id">{{ a.name }}</option>
        </select>
      </label>
      <span class="ss-chip" :class="dh?.ready ? 'ok' : 'warn'">{{ dh?.ready ? $t('数字人服务已就绪') : $t('数字人服务未配置') }}</span>
      <button v-if="current" type="button" class="ss-btn sm ghost danger" @click="remove"><i class="ri-delete-bin-line"></i>{{ $t('删除项目') }}</button>
    </div>

    <StickyProgress :title="$t('数字人介绍')" :metas="metas" :runtime="runtime" :current-key="currentKey" @jump="jump" />
    <div class="ss-steps">
      <StepCard step-key="a-topic" :index="0" :title="metas[0].title" :hint="metas[0].hint" :runtime="runtime['a-topic']" :is-current="currentKey === 'a-topic'">
        <template v-if="!current">
          <div class="ba-types">
            <button v-for="t in TOPICS" :key="t" type="button" class="ba-type" :class="{ on: form.topic === t }" @click="form.topic = t">{{ topicLabel(t) }}</button>
          </div>
          <div class="ss-grid">
            <label class="ss-field"><span>{{ $t('时长（秒）') }}</span><input v-model.number="form.seconds" type="number" min="20" max="120" /></label>
          </div>
          <label class="ss-field"><span>{{ $t('补充说明（选填，例如开业日期、活动内容）') }}</span><textarea v-model="form.brief" rows="2"></textarea></label>
          <details class="ba-facts">
            <summary>{{ $t('知识库里可用的资料 {n} 条', { n: facts.length }) }}</summary>
            <p v-if="!facts.length" class="ss-muted">{{ $t('知识库还没有公司资料：到左侧「知识库」导入营业执照、公司介绍等文档，讲稿会更完整') }}</p>
            <ul><li v-for="f in facts" :key="f.label + f.value"><b>{{ f.label }}</b>{{ $t('：{p0}', { p0: f.value }) }}</li></ul>
          </details>
          <div class="ss-actions">
            <button type="button" class="ss-btn primary" :disabled="!!busy" @click="create"><i :class="busy === 'a-topic' ? 'ri-loader-4-line spin' : 'ri-quill-pen-line'"></i>{{ $t('写讲稿') }}</button>
          </div>
        </template>
        <p v-else class="ss-muted">{{ current.name }}</p>
      </StepCard>

      <StepCard step-key="a-script" :index="1" :title="metas[1].title" :hint="metas[1].hint" :runtime="runtime['a-script']" :is-current="currentKey === 'a-script'">
        <template v-if="current">
          <p v-for="w in current.warnings" :key="w" class="ss-note warn"><i class="ri-error-warning-line"></i>{{ w }}</p>
          <textarea v-model="script" class="ba-script" rows="10"></textarea>
          <div class="ss-actions">
            <button type="button" class="ss-btn sm" :disabled="!!busy || script === current.script" @click="saveScript"><i class="ri-save-line"></i>{{ $t('保存讲稿') }}</button>
            <span class="ss-muted">{{ $t('约 {n} 字 · 由 {p0} 撰写', { n: script.length, p0: modelLabel(current.model) }) }}</span>
          </div>
        </template>
      </StepCard>

      <StepCard step-key="a-avatar" :index="2" :title="metas[2].title" :hint="metas[2].hint" :runtime="runtime['a-avatar']" :is-current="currentKey === 'a-avatar'">
        <template v-if="current">
          <div class="ss-grid">
            <label class="ss-field"><span>{{ $t('形象 ID（留空用服务商默认）') }}</span><input v-model.trim="cfg.avatarId" type="text" /></label>
            <label class="ss-field"><span>{{ $t('音色 ID（留空用默认）') }}</span><input v-model.trim="cfg.voiceId" type="text" /></label>
            <label class="ss-field"><span>{{ $t('画幅') }}</span><select v-model="cfg.aspectRatio"><option value="9:16">{{ $t('竖屏 9:16（短视频）') }}</option><option value="16:9">{{ $t('横屏 16:9') }}</option></select></label>
          </div>
          <label class="ss-field"><span>{{ $t('如使用真人定制分身：授权说明（本人姓名、授权日期、授权书存放位置）') }}</span><input v-model.trim="cfg.likenessConsent" type="text" /></label>
          <div class="ss-actions">
            <button type="button" class="ss-btn sm" :disabled="!!busy" @click="saveCfg"><i class="ri-save-line"></i>{{ $t('保存') }}</button>
            <span class="ss-muted">{{ $t('形象与音色在「数字人工作台 → 配置」里查看；使用真人形象必须有本人书面授权') }}</span>
          </div>
        </template>
      </StepCard>

      <!--
        数字人成片没有取消通道（云端任务），还在跑时「可能已超时」卡只给 继续等待 / 查看日志，不放重新生成
        （放了就是第二轮并行烧钱）；失败后才有「重新成片」。
      -->
      <StepCard step-key="a-render" :index="3" :title="metas[3].title" :hint="metas[3].hint" :runtime="runtime['a-render']" :is-current="currentKey === 'a-render'" :retry="current && current.status !== 'rendering' ? render : undefined" :retry-label="$t('重新成片')">
        <template v-if="current">
          <div class="ss-actions">
            <button type="button" class="ss-btn primary" :disabled="!!busy || current.status === 'rendering' || script !== current.script" @click="render"><i :class="current.status === 'rendering' ? 'ri-loader-4-line spin' : 'ri-film-line'"></i>{{ current.video ? $t('重新成片') : $t('数字人成片') }}</button>
            <span class="ss-muted">{{ $t('通常 1～5 分钟；讲稿里的【待补充】要先补完') }}</span>
          </div>
          <p class="ss-muted">{{ $t('成片后自动在画面顶部加「本视频由 AI 生成」标识，最后 3 秒叠片尾（门店名、地址、营业时间，在「设置」里填）') }}</p>
          <video v-if="current.video" :src="fileUrl(current.video)" controls playsinline class="ba-video" :class="{ wide: current.aspectRatio === '16:9' }"></video>
        </template>
      </StepCard>

      <StepCard step-key="a-publish" :index="4" :title="metas[4].title" :hint="metas[4].hint" :runtime="runtime['a-publish']" :is-current="currentKey === 'a-publish'">
        <template v-if="current">
          <div class="ss-actions">
            <label v-for="p in PLATFORMS" :key="p" class="ba-check"><input v-model="platforms" type="checkbox" :value="p" />{{ platformLabel(p) }}</label>
            <button type="button" class="ss-btn primary" :disabled="!!busy || !current.video || !platforms.length" @click="toVideo"><i class="ri-send-plane-line"></i>{{ $t('写发布文案并进入发布') }}</button>
          </div>
          <p class="ss-muted">{{ $t('生成一个已成片的视频项目，在「短视频发布」里审核后发布；文案末尾自动加「本视频由 AI 生成」') }}</p>
        </template>
      </StepCard>
    </div>
  </div>
</template>

<script setup lang="ts">
/** 模块 B：选主题 → 讲稿（知识库事实）→ 选数字人 → 成片 → 进入发布。 */
import { computed, onMounted, reactive, ref, watch } from 'vue';
import type { BaAvatarProject, BaAvatarTopic, BaPublishPlatform, BaVideoProject } from '@totalclaw/ipc-contracts';
import { useNotificationStore } from '../../stores/notification';
import { t as i18nT } from '../../i18n';
import StepCard from '../service-settlement/StepCard.vue';
import StickyProgress from '../service-settlement/StickyProgress.vue';
import ModuleHeader from './ModuleHeader.vue';
import {
  ba, baProgressAt, baState, ensureBaProgressTracking, errorMessage, fileUrl, modelLabel, noteRenderStarted, platformLabel, refreshState, renderStartedAt, scrollToStep,
  type StepMeta, type StepRuntime,
} from './shared';

const emit = defineEmits<{ (e: 'goto', module: string, payload?: any): void }>();
const notif = useNotificationStore();
ensureBaProgressTracking();
/** 数字人成片预计耗时（秒）：云端「通常 1～5 分钟」取中位偏上 */
const RENDER_ESTIMATE_SEC = 240;
const TOPICS: BaAvatarTopic[] = ['company_intro', 'brand_story', 'store_opening', 'service_intro', 'recruiting', 'holiday'];
const PLATFORMS: BaPublishPlatform[] = ['douyin', 'kuaishou', 'xiaohongshu', 'wxchannels'];
const topicLabel = (t: BaAvatarTopic) => ({ company_intro: i18nT('企业介绍'), brand_story: i18nT('品牌故事'), store_opening: i18nT('新店开业'), service_intro: i18nT('门店服务介绍'), recruiting: i18nT('招聘'), holiday: i18nT('节日祝福') }[t]);

const avatars = computed(() => baState.value?.avatars || []);
const currentId = ref('');
const current = computed<BaAvatarProject | null>(() => avatars.value.find((a) => a.id === currentId.value) || null);
const form = reactive({ topic: 'company_intro' as BaAvatarTopic, seconds: 45, brief: '' });
const facts = ref<Array<{ label: string; value: string }>>([]);
const dh = ref<{ ready: boolean } | null>(null);
const script = ref('');
const cfg = reactive({ avatarId: '', voiceId: '', aspectRatio: '9:16' as '9:16' | '16:9', likenessConsent: '' });
const platforms = ref<BaPublishPlatform[]>(['douyin', 'wxchannels']);
const busy = ref('');
const errors = ref<Record<string, string>>({});
watch(current, (a) => {
  script.value = a?.script || '';
  Object.assign(cfg, { avatarId: a?.avatarId || '', voiceId: a?.voiceId || '', aspectRatio: a?.aspectRatio || '9:16', likenessConsent: a?.likenessConsent || '' });
}, { immediate: true });
onMounted(async () => {
  facts.value = await ba('avatar.facts').catch(() => []);
  dh.value = await ba('avatar.status').catch(() => ({ ready: false }));
});

const metas: StepMeta[] = [
  { key: 'a-topic', title: i18nT('选主题'), hint: i18nT('企业介绍 / 品牌故事 / 新店开业 / 服务介绍 / 招聘 / 节日祝福') },
  { key: 'a-script', title: i18nT('讲稿'), hint: i18nT('事实只取知识库，缺的写【待补充】') },
  { key: 'a-avatar', title: i18nT('选数字人'), hint: i18nT('形象、音色、画幅；真人分身需书面授权') },
  { key: 'a-render', title: i18nT('口播成片'), hint: i18nT('带字幕与 AI 生成标识') },
  { key: 'a-publish', title: i18nT('进入发布'), hint: i18nT('交给「短视频发布」审核后发出') },
];
function st(key: string, done: boolean, summary?: string, running = false, failed = '', extra?: Partial<StepRuntime>): StepRuntime {
  if (busy.value === key || running) return { state: 'running', ...(extra || {}) };
  if (errors.value[key] || failed) return { state: 'failed', error: errors.value[key] || failed };
  return done ? { state: 'done', summary } : { state: 'todo' };
}
const runtime = computed<Record<string, StepRuntime>>(() => {
  const a = current.value;
  return {
    'a-topic': st('a-topic', !!a, a ? topicLabel(a.topic) : ''),
    'a-script': st('a-script', !!a && !/【待补充/.test(a.script), a ? i18nT('{n} 字', { n: a.script.length }) : ''),
    'a-avatar': st('a-avatar', !!a && (!!a.avatarId || !!a.video || a.status === 'rendering')),
    'a-render': st('a-render', !!a?.video, '', a?.status === 'rendering', a?.status === 'failed' ? a.error || '' : '',
      a ? { kind: 'video', estimateSec: RENDER_ESTIMATE_SEC, startedAt: renderStartedAt(a), progressAt: baProgressAt.avatar } : undefined),
    'a-publish': st('a-publish', !!a && (baState.value?.videos || []).some((v) => v.video === a.video && !!a.video)),
  };
});
const currentKey = computed(() => metas.find((m) => runtime.value[m.key].state !== 'done')?.key || 'a-publish');

async function run(key: string, fn: () => Promise<unknown>): Promise<boolean> {
  busy.value = key;
  errors.value = { ...errors.value, [key]: '' };
  try { await fn(); await refreshState(); return true; } catch (e) { errors.value = { ...errors.value, [key]: errorMessage(e) }; void scrollToStep(key); return false; } finally { busy.value = ''; }
}
async function create(): Promise<void> { await run('a-topic', async () => { const a = await ba<BaAvatarProject>('avatar.create', { ...form }); currentId.value = a.id; }); }
async function saveScript(): Promise<void> { if (current.value) await run('a-script', () => ba('avatar.update', { id: current.value!.id, patch: { script: script.value } })); }
async function saveCfg(): Promise<void> { if (current.value) await run('a-avatar', () => ba('avatar.update', { id: current.value!.id, patch: { ...cfg } })); }
async function render(): Promise<void> {
  const a = current.value;
  if (!a || busy.value || a.status === 'rendering') return; // 云端任务没有取消通道：跑着就不许再起一轮
  noteRenderStarted(a.id);
  await run('a-render', () => ba('avatar.render', { id: a.id }));
}
async function toVideo(): Promise<void> {
  if (!current.value) return;
  let vid = '';
  const ok = await run('a-publish', async () => { const v = await ba<BaVideoProject>('avatar.toVideo', { id: current.value!.id, platforms: platforms.value }); vid = v.id; });
  if (ok) emit('goto', 'video', { id: vid });
}
async function remove(): Promise<void> {
  if (!current.value || !window.confirm(i18nT('删除数字人项目「{p0}」？', { p0: current.value.name }))) return;
  try { await ba('avatar.remove', { id: current.value.id }); currentId.value = ''; await refreshState(); } catch (e) { notif.error(errorMessage(e)); }
}
function jump(key: string): void { void scrollToStep(key); }
</script>

<style scoped>
.ba-projbar { display: flex; gap: 10px; align-items: flex-end; flex-wrap: wrap; }
.ba-projbar .ss-field { min-width: 320px; }
.ba-types { display: flex; flex-wrap: wrap; gap: 8px; }
.ba-type { padding: 8px 14px; border: 1px solid var(--color-border); border-radius: 10px; background: var(--color-bg-primary); color: var(--color-text-primary); cursor: pointer; font: inherit; font-size: 13px; }
.ba-type.on { border-color: var(--color-brand); background: color-mix(in srgb, var(--color-brand) 8%, var(--color-bg-primary)); font-weight: 700; }
.ba-facts { font-size: 12.5px; }
.ba-facts ul { margin: 6px 0 0; padding-inline-start: 18px; max-height: 200px; overflow: auto; color: var(--color-text-secondary); }
.ba-script { width: 100%; box-sizing: border-box; border-radius: 10px; border: 1px solid var(--color-border); background: var(--color-bg-input, var(--color-bg-primary)); color: var(--color-text-primary); font: inherit; font-size: 13.5px; line-height: 1.8; padding: 10px 12px; resize: vertical; }
.ba-check { display: inline-flex; gap: 4px; align-items: center; font-size: 12.5px; }
.ba-video { width: 240px; aspect-ratio: 9 / 16; border-radius: 12px; background: #000; }
.ba-video.wide { width: 480px; aspect-ratio: 16 / 9; }
.spin { animation: ba-spin 1s linear infinite; }
@keyframes ba-spin { to { transform: rotate(360deg); } }
</style>
