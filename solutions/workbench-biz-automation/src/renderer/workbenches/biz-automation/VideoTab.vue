<template>
  <div class="ss-module">
    <ModuleHeader module-key="video" icon="ri-movie-2-line" :title="$t('短视频生成并发布自媒体')"
      :ability="$t('商品图、试穿图、门店实拍 → 分镜脚本与各平台文案 → 配音字幕配乐成片 → 审核 → 发到抖音、快手、小红书、视频号')"
      :output="$t('9:16 成片、各平台标题文案话题、平台发布回执；价格与折扣只许来自你填的活动信息')" />

    <div class="ba-projbar">
      <label class="ss-field"><span>{{ $t('视频项目') }}</span>
        <select v-model="currentId">
          <option value="">{{ $t('— 新建视频 —') }}</option>
          <option v-for="v in videos" :key="v.id" :value="v.id">{{ v.name }} · {{ statusLabel(v.status) }}</option>
        </select>
      </label>
      <button v-if="current" type="button" class="ss-btn sm ghost danger" @click="remove"><i class="ri-delete-bin-line"></i>{{ $t('删除项目') }}</button>
    </div>

    <StickyProgress :title="$t('短视频发布')" :metas="metas" :runtime="runtime" :current-key="currentKey" @jump="jump" />
    <div class="ss-steps">
      <StepCard step-key="v-pick" :index="0" :title="metas[0].title" :hint="metas[0].hint" :runtime="runtime['v-pick']" :is-current="currentKey === 'v-pick'">
        <template v-if="!current">
          <div class="ba-types">
            <button v-for="t in TYPES" :key="t" type="button" class="ba-type" :class="{ on: form.type === t }" @click="form.type = t">
              <strong>{{ videoTypeLabel(t) }}</strong><small>{{ TYPE_HINT[t] }}</small>
            </button>
          </div>
          <p v-if="!garments.length" class="ss-note warn"><i class="ri-information-line"></i>{{ $t('商品库是空的：先到「服装AI试衣 → 商品库」导入服装图') }}</p>
          <div class="ba-gpick">
            <button v-for="g in garments" :key="g.id" type="button" :class="{ on: form.garmentIds.includes(g.id) }" @click="toggle(g.id)">
              <img :src="fileUrl(g.image)" alt="" loading="lazy" /><span>{{ g.name }}</span>
            </button>
          </div>
          <label class="ss-field"><span>{{ $t('活动信息 / 主题（促销价、活动时间等，脚本里的价格与折扣只许来自这里和商品价格）') }}</span><textarea v-model="form.brief" rows="2"></textarea></label>
          <div class="ss-actions">
            <span class="ss-muted">{{ $t('发布平台') }}</span>
            <label v-for="p in PLATFORMS" :key="p" class="ba-check"><input v-model="form.platforms" type="checkbox" :value="p" />{{ platformLabel(p) }}</label>
            <label class="ba-check"><input v-model="form.narration" type="checkbox" />{{ $t('AI 配音') }}</label>
            <select v-if="form.narration" v-model="form.voiceGender" class="ba-mini"><option value="female">{{ $t('女声') }}</option><option value="male">{{ $t('男声') }}</option></select>
          </div>
          <div class="ss-actions">
            <button type="button" class="ss-btn primary" :disabled="!!busy || !form.garmentIds.length || !form.platforms.length" @click="create"><i class="ri-add-line"></i>{{ $t('创建视频项目') }}</button>
          </div>
        </template>
        <div v-else class="ba-summary">
          <span class="ss-chip brand">{{ videoTypeLabel(current.type) }}</span>
          <span>{{ current.garmentIds.map(garmentName).join('、') || $t('数字人成片') }}</span>
          <span v-if="current.brief" class="ss-muted">{{ current.brief }}</span>
          <span class="ss-muted">{{ current.platforms.map(platformLabel).join(' / ') }}</span>
        </div>
      </StepCard>

      <StepCard step-key="v-material" :index="1" :title="metas[1].title" :hint="metas[1].hint" :runtime="runtime['v-material']" :is-current="currentKey === 'v-material'">
        <template v-if="current">
          <div class="ba-thumbs">
            <figure v-for="(m, i) in current.materials" :key="m"><img :src="fileUrl(m)" alt="" loading="lazy" /><figcaption>#{{ i }}</figcaption></figure>
          </div>
          <div class="ss-actions">
            <button type="button" class="ss-btn sm" :disabled="!!busy || !current.garmentIds.length" @click="addMaterials"><i class="ri-image-add-line"></i>{{ $t('补充门店实拍 / 其它图片') }}</button>
            <button v-if="current.garmentIds.length" type="button" class="ss-btn sm" :disabled="!!busy" @click="fillModels"><i :class="busy === 'v-material' ? 'ri-loader-4-line spin' : 'ri-user-star-line'"></i>{{ $t('为没有试穿图的款补模特图') }}</button>
            <span class="ss-muted">{{ $t('商品图与该款已生成的试穿图已自动带入') }}</span>
          </div>
        </template>
      </StepCard>

      <StepCard step-key="v-script" :index="2" :title="metas[2].title" :hint="metas[2].hint" :runtime="runtime['v-script']" :is-current="currentKey === 'v-script'">
        <template v-if="current">
          <div class="ss-actions">
            <button type="button" class="ss-btn primary" :disabled="!!busy || !current.garmentIds.length" @click="script"><i :class="busy === 'v-script' ? 'ri-loader-4-line spin' : 'ri-quill-pen-line'"></i>{{ current.scenes.length ? $t('重写脚本') : $t('写分镜脚本与文案') }}</button>
            <span v-if="current.model" class="ss-muted">{{ $t('由 {p0} 撰写', { p0: modelLabel(current.model) }) }}</span>
          </div>
          <p v-for="w in current.warnings" :key="w" class="ss-note warn"><i class="ri-error-warning-line"></i>{{ w }}</p>
          <div v-if="draft.scenes.length" class="ba-scenes">
            <div v-for="(s, i) in draft.scenes" :key="i" class="ba-scene">
              <img :src="fileUrl(s.image)" alt="" />
              <div>
                <small>{{ $t('镜头 {n}', { n: i + 1 }) }}</small>
                <select v-model="s.image" class="ba-mini"><option v-for="(m, k) in current.materials" :key="m" :value="m">{{ $t('图片 #{n}', { n: k }) }}</option></select>
                <input v-model="s.line" type="text" maxlength="40" />
              </div>
              <button type="button" class="ss-link" :aria-label="$t('删除')" @click="draft.scenes.splice(i, 1)"><i class="ri-close-line"></i></button>
            </div>
          </div>
          <div v-if="Object.keys(draft.copies).length" class="ba-copies">
            <div v-for="p in current.platforms" :key="p" class="ba-copy">
              <strong>{{ platformLabel(p) }}</strong>
              <template v-if="draft.copies[p]">
                <input v-model="draft.copies[p]!.title" type="text" :placeholder="$t('标题')" />
                <textarea v-model="draft.copies[p]!.caption" rows="3"></textarea>
                <input :value="draft.copies[p]!.topics.join(' ')" type="text" :placeholder="$t('话题，空格分隔')" @change="draft.copies[p]!.topics = ($event.target as HTMLInputElement).value.split(/\s+/).map((x) => x.replace(/^#/, '')).filter(Boolean)" />
              </template>
            </div>
          </div>
          <div v-if="draft.scenes.length" class="ss-actions">
            <button type="button" class="ss-btn sm" :disabled="!!busy || !dirty" @click="saveDraft"><i class="ri-save-line"></i>{{ $t('保存修改') }}</button>
            <span v-if="dirty" class="ss-muted">{{ $t('有未保存的修改（改了镜头要重新成片）') }}</span>
          </div>
        </template>
      </StepCard>

      <!-- 成片：失败 / 可能已超时的红黄卡与「重新生成」由步骤卡自带（retry = 重新成片，cancel = 先停掉旧任务） -->
      <StepCard step-key="v-render" :index="3" :title="metas[3].title" :hint="metas[3].hint" :runtime="runtime['v-render']" :is-current="currentKey === 'v-render'" :retry="render" :cancel="cancel" :retry-label="$t('重新成片')">
        <template v-if="current">
          <p v-if="!state?.ready.ffmpeg" class="ss-note warn"><i class="ri-error-warning-line"></i>{{ $t('找不到 ffmpeg，无法成片') }}</p>
          <div class="ss-actions">
            <button type="button" class="ss-btn primary" :disabled="!!busy || !current.scenes.length || current.status === 'rendering' || dirty || !current.garmentIds.length" @click="render"><i :class="current.status === 'rendering' ? 'ri-loader-4-line spin' : 'ri-film-line'"></i>{{ current.video ? $t('重新成片') : $t('开始成片') }}</button>
            <button v-if="current.status === 'rendering'" type="button" class="ss-btn sm ghost" :disabled="cancelling" @click="cancel">{{ $t('取消') }}</button>
            <span class="ss-muted">{{ $t('配音优先高保真，不可用时用标准音色；字幕与镜头逐句对齐') }}</span>
          </div>
          <div v-if="current.video" class="ba-player">
            <video :src="fileUrl(current.video)" controls playsinline></video>
            <div class="ba-player__side">
              <span>{{ $t('时长 {s} 秒', { s: current.durationSec || '—' }) }}</span>
              <span v-if="current.voiceQuality" class="ss-muted">{{ current.voiceQuality === 'hd' ? $t('高保真配音') : $t('标准音质配音（备用）') }}</span>
              <button type="button" class="ss-link" @click="openPath(current.video, true)">{{ $t('所在文件夹') }}</button>
            </div>
          </div>
        </template>
      </StepCard>

      <StepCard step-key="v-approve" :index="4" :title="metas[4].title" :hint="metas[4].hint" :runtime="runtime['v-approve']" :is-current="currentKey === 'v-approve'">
        <template v-if="current">
          <label v-if="current.warnings.length" class="ba-check"><input v-model="force" type="checkbox" />{{ $t('我已看过上面的提示，仍然通过') }}</label>
          <div class="ss-actions">
            <button type="button" class="ss-btn primary" :disabled="!!busy || !current.video || current.status === 'approved' || current.status === 'published'" @click="approve"><i class="ri-shield-check-line"></i>{{ $t('审核通过') }}</button>
            <span v-if="current.approvedAt" class="ss-muted">{{ $t('审核于 {p0}', { p0: fmtDateTime(current.approvedAt) }) }}</span>
          </div>
        </template>
      </StepCard>

      <StepCard step-key="v-publish" :index="5" :title="metas[5].title" :hint="metas[5].hint" :runtime="runtime['v-publish']" :is-current="currentKey === 'v-publish'">
        <template v-if="current">
          <p class="ss-muted">{{ $t('用你在内置浏览器里登录的平台账号发布：先确认登录，再逐个平台上传、填文案、提交，平台回执逐条显示。建议每个账号每天不超过 3 条。') }}</p>
          <div class="ss-actions">
            <button type="button" class="ss-btn primary" :disabled="!!busy || (current.status !== 'approved' && current.status !== 'published' && current.status !== 'publishing')" @click="publish"><i class="ri-send-plane-line"></i>{{ $t('发布到 {p0}', { p0: current.platforms.map(platformLabel).join('、') }) }}</button>
            <button v-if="current.status === 'publishing'" type="button" class="ss-link" @click="markPublished(true)">{{ $t('已在工作流里发完') }}</button>
            <button v-if="current.status === 'publishing'" type="button" class="ss-link" @click="markPublished(false)">{{ $t('没发成功，退回') }}</button>
            <span v-if="current.publishedAt" class="ss-chip ok">{{ $t('已发布 {p0}', { p0: fmtDateTime(current.publishedAt) }) }}</span>
          </div>
          <div v-if="current.status === 'approved'" class="ss-actions">
            <span class="ss-muted">{{ $t('或定时发布') }}</span>
            <input v-model="publishAt" type="datetime-local" class="ba-dt" />
            <button type="button" class="ss-btn sm" :disabled="!!busy || !publishAt" @click="schedule(publishAt)"><i class="ri-timer-line"></i>{{ $t('设定时') }}</button>
            <span v-if="current.publishAt" class="ss-chip brand">{{ current.publishDue ? $t('已到发布时间') : $t('定时 {p0}', { p0: fmtDateTime(current.publishAt) }) }}</span>
            <button v-if="current.publishAt" type="button" class="ss-link" @click="schedule(null)">{{ $t('取消定时') }}</button>
          </div>
          <p v-if="current.publishAt" class="ss-muted">{{ $t('到点会弹系统通知；经营自动化智能体打开着时自动发起发布（要用内置浏览器里各平台的登录态）') }}</p>
        </template>
      </StepCard>

      <StepCard step-key="v-review" :index="6" :title="metas[6].title" :hint="metas[6].hint" :runtime="runtime['v-review']" :is-current="currentKey === 'v-review'">
        <template v-if="current">
          <div class="ss-actions">
            <button type="button" class="ss-btn sm" :disabled="!!busy || current.status !== 'published'" @click="readBack"><i class="ri-robot-2-line"></i>{{ $t('交给数字员工回读各平台数据') }}</button>
            <span class="ss-muted">{{ $t('数字员工只读取创作者后台的播放、点赞、评论、分享；读回后填到下表') }}</span>
          </div>
          <div class="ss-table-wrap">
            <table class="ss-table">
              <thead><tr><th>{{ $t('平台') }}</th><th class="num">{{ $t('播放') }}</th><th class="num">{{ $t('点赞') }}</th><th class="num">{{ $t('评论') }}</th><th class="num">{{ $t('分享') }}</th><th></th></tr></thead>
              <tbody>
                <tr v-for="p in current.platforms" :key="p">
                  <td>{{ platformLabel(p) }}</td>
                  <td v-for="f in STAT_FIELDS" :key="f"><input v-model.number="statsDraft[p][f]" type="number" min="0" class="ba-stat" /></td>
                  <td><button type="button" class="ss-link" @click="saveStats(p)">{{ $t('保存') }}</button><small v-if="current.stats?.[p]" class="ss-muted"> · {{ fmtDateTime(current.stats[p]!.at) }}</small></td>
                </tr>
              </tbody>
            </table>
          </div>
          <template v-if="review.length">
            <span class="ss-subhead">{{ $t('按款式看引流效果（全部视频）') }}</span>
            <div class="ss-table-wrap">
              <table class="ss-table">
                <thead><tr><th>{{ $t('款式') }}</th><th class="num">{{ $t('视频数') }}</th><th class="num">{{ $t('播放') }}</th><th class="num">{{ $t('点赞') }}</th><th class="num">{{ $t('评论') }}</th><th class="num">{{ $t('分享') }}</th></tr></thead>
                <tbody><tr v-for="r in review" :key="r.garmentId"><td>{{ garmentName(r.garmentId) }}</td><td class="num">{{ r.videos }}</td><td class="num">{{ r.plays }}</td><td class="num">{{ r.likes }}</td><td class="num">{{ r.comments }}</td><td class="num">{{ r.shares }}</td></tr></tbody>
              </table>
            </div>
          </template>
        </template>
      </StepCard>
    </div>
  </div>
</template>

<script setup lang="ts">
/** 模块 A：选类型与商品 → 素材 → 脚本与文案 → 成片 → 审核 → 发布（现成的视频发布固定流程）。 */
import { computed, reactive, ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import type { BaPublishPlatform, BaVideoProject, BaVideoType } from '@totalclaw/ipc-contracts';
import { useNotificationStore } from '../../stores/notification';
import { t as i18nT } from '../../i18n';
import StepCard from '../service-settlement/StepCard.vue';
import StickyProgress from '../service-settlement/StickyProgress.vue';
import ModuleHeader from './ModuleHeader.vue';
import {
  ba, baGarments, baProgressAt, baState, ensureBaProgressTracking, errorMessage, fileUrl, fmtDateTime, garmentName, handToDigitalEmployee, modelLabel, noteRenderStarted, openPath, pickFiles, platformLabel, refreshState,
  renderStartedAt, scrollToStep, startPublishWorkflow, videoTypeLabel, type StepMeta, type StepRuntime,
} from './shared';

const props = defineProps<{ focus?: { id?: string } | null }>();
const notif = useNotificationStore();
const router = useRouter();
const state = baState;
ensureBaProgressTracking();
/** 成片预计耗时（秒）：按实测 3～6 镜头配音 + 推拉 + 合成约 2 分钟标定 */
const RENDER_ESTIMATE_SEC = 120;
const TYPES: BaVideoType[] = ['new_arrival', 'multi_look', 'store_tour', 'promotion', 'styling_tips'];
const PLATFORMS: BaPublishPlatform[] = ['douyin', 'kuaishou', 'xiaohongshu', 'wxchannels'];
const TYPE_HINT: Record<BaVideoType, string> = {
  new_arrival: i18nT('商品图 + AI 模特图 + 卖点，15～30 秒'),
  multi_look: i18nT('同一件衣服 × 多组试穿造型'),
  store_tour: i18nT('邀请进店，适合带定位发布'),
  promotion: i18nT('活动信息 + 主推款'),
  styling_tips: i18nT('按场合给穿搭建议'),
};

const garments = computed(() => baGarments.value);
const videos = computed(() => state.value?.videos || []);
const currentId = ref('');
const current = computed<BaVideoProject | null>(() => videos.value.find((v) => v.id === currentId.value) || null);
watch(() => props.focus, (f) => { if (f?.id) currentId.value = f.id; }, { immediate: true });

const form = reactive({ type: 'new_arrival' as BaVideoType, garmentIds: [] as string[], brief: '', platforms: ['douyin', 'xiaohongshu'] as BaPublishPlatform[], narration: true, voiceGender: 'female' as 'female' | 'male' });
const draft = reactive<{ scenes: BaVideoProject['scenes']; copies: BaVideoProject['copies'] }>({ scenes: [], copies: {} });
watch(current, (v) => { draft.scenes = v ? JSON.parse(JSON.stringify(v.scenes)) : []; draft.copies = v ? JSON.parse(JSON.stringify(v.copies)) : {}; }, { immediate: true });
const dirty = computed(() => !!current.value && (JSON.stringify(draft.scenes) !== JSON.stringify(current.value.scenes) || JSON.stringify(draft.copies) !== JSON.stringify(current.value.copies)));
const busy = ref('');
const errors = ref<Record<string, string>>({});
const force = ref(false);

const metas: StepMeta[] = [
  { key: 'v-pick', title: i18nT('选类型与商品'), hint: i18nT('新品上新 / 一衣多搭 / 门店探店 / 促销 / 穿搭教程') },
  { key: 'v-material', title: i18nT('素材准备'), hint: i18nT('自动带入商品图与试穿图，可补充门店实拍') },
  { key: 'v-script', title: i18nT('脚本与文案'), hint: i18nT('分镜口播 + 各平台标题、正文、话题，逐段可改') },
  { key: 'v-render', title: i18nT('成片'), hint: i18nT('配音、字幕、推拉镜头、配乐，9:16') },
  { key: 'v-approve', title: i18nT('审核'), hint: i18nT('极限词、来路不明的价格会提示') },
  { key: 'v-publish', title: i18nT('发布'), hint: i18nT('立即或定时发到抖音 / 快手 / 小红书 / 视频号，平台回执逐条显示') },
  { key: 'v-review', title: i18nT('复盘'), hint: i18nT('回收播放、点赞、评论数，按款式看引流效果') },
];
function st(key: string, done: boolean, summary?: string, running = false, failed = '', extra?: Partial<StepRuntime>): StepRuntime {
  if (busy.value === key || running) return { state: 'running', ...(extra || {}) };
  if (errors.value[key] || failed) return { state: 'failed', error: errors.value[key] || failed };
  return done ? { state: 'done', summary } : { state: 'todo' };
}
const runtime = computed<Record<string, StepRuntime>>(() => {
  const v = current.value;
  return {
    'v-pick': st('v-pick', !!v, v?.name),
    'v-material': st('v-material', !!v && v.materials.length > 0, v ? i18nT('{n} 张素材', { n: v.materials.length }) : ''),
    'v-script': st('v-script', !!v && (v.scenes.length > 0 || !!v.video), v ? i18nT('{n} 个镜头', { n: v.scenes.length }) : ''),
    // 成片：看门狗要的真实开始时刻 / 最近进度 / 类型 / 预计，一并写进 runtime（换 tab 回来计时不归零）
    'v-render': st('v-render', !!v?.video, v?.durationSec ? i18nT('{s} 秒', { s: v.durationSec }) : '', v?.status === 'rendering', v?.status === 'failed' ? v.error || '' : '',
      v ? { kind: 'video', estimateSec: RENDER_ESTIMATE_SEC, startedAt: renderStartedAt(v), progressAt: baProgressAt.video } : undefined),
    'v-approve': st('v-approve', !!v && ['approved', 'publishing', 'published'].includes(v.status)),
    'v-publish': st('v-publish', v?.status === 'published', v?.publishRunNote),
    'v-review': st('v-review', !!v?.stats && Object.keys(v.stats).length > 0),
  };
});
const currentKey = computed(() => metas.find((m) => runtime.value[m.key].state !== 'done')?.key || 'v-review');

const STAT_FIELDS = ['plays', 'likes', 'comments', 'shares'] as const;
type StatRow = Record<(typeof STAT_FIELDS)[number], number>;
const statsDraft = reactive<Record<string, StatRow>>({});
watch(current, (v) => {
  for (const p of PLATFORMS) { const x = v?.stats?.[p]; statsDraft[p] = { plays: x?.plays || 0, likes: x?.likes || 0, comments: x?.comments || 0, shares: x?.shares || 0 }; }
}, { immediate: true });
const review = ref<Array<{ garmentId: string; videos: number; plays: number; likes: number; comments: number; shares: number }>>([]);
async function loadReview(): Promise<void> { review.value = await ba('video.review').catch(() => []); }
void loadReview();
const publishAt = ref('');
// 新品上新：默认带出最近 7 天入库的款
watch(() => form.type, (t) => {
  if (t !== 'new_arrival' || form.garmentIds.length) return;
  const recent = garments.value.filter((g) => Date.now() - Date.parse(g.createdAt) < 7 * 86_400_000).slice(0, 5).map((g) => g.id);
  form.garmentIds.push(...recent);
}, { immediate: true });
function statusLabel(s: BaVideoProject['status']): string {
  return ({ draft: i18nT('草稿'), scripted: i18nT('已写脚本'), rendering: i18nT('成片中'), rendered: i18nT('已成片'), approved: i18nT('已审核'), publishing: i18nT('发布中'), published: i18nT('已发布'), failed: i18nT('失败') } as Record<string, string>)[s];
}
function toggle(id: string): void {
  const i = form.garmentIds.indexOf(id);
  if (i >= 0) form.garmentIds.splice(i, 1); else if (form.garmentIds.length < 5) form.garmentIds.push(id);
}
async function run(key: string, fn: () => Promise<unknown>): Promise<boolean> {
  busy.value = key;
  errors.value = { ...errors.value, [key]: '' };
  try { await fn(); await refreshState(); return true; } catch (e) { errors.value = { ...errors.value, [key]: errorMessage(e) }; void scrollToStep(key); return false; } finally { busy.value = ''; }
}
async function create(): Promise<void> {
  await run('v-pick', async () => {
    const v = await ba<BaVideoProject>('video.create', { ...form });
    currentId.value = v.id;
    await refreshState();
    await ba('video.script', { id: v.id });
  });
}
async function addMaterials(): Promise<void> {
  const paths = await pickFiles('image', true);
  if (paths.length && current.value) await run('v-material', () => ba('video.addMaterials', { id: current.value!.id, paths }));
}
async function script(): Promise<void> { if (current.value) await run('v-script', () => ba('video.script', { id: current.value!.id })); }
async function saveDraft(): Promise<void> { if (current.value) await run('v-script', () => ba('video.update', { id: current.value!.id, patch: { scenes: draft.scenes, copies: draft.copies } })); }
async function render(): Promise<void> {
  const v = current.value;
  // 还在跑（含换页回来主进程仍在跑的那一轮）就不再起第二轮：先取消，等它真退出
  if (!v || busy.value || v.status === 'rendering') return;
  noteRenderStarted(v.id);
  await run('v-render', () => ba('video.render', { id: v.id }));
}
const cancelling = ref(false);
/**
 * 取消成片，并等旧任务**真的**退出（主进程把状态改成 failed、本组件那个 await 收尾）再返回：
 * 步骤卡「可能已超时 → 重新生成」会先 await 这里再 render，不等就会两轮撞车 ——
 * 主进程按项目 id 记取消句柄，旧轮 finally 的 runs.delete 会把新轮的句柄删掉，新轮从此取消不了。
 */
async function cancel(): Promise<void> {
  const v = current.value;
  if (!v || cancelling.value) return;
  cancelling.value = true;
  try {
    await ba('video.cancel', { id: v.id }).catch(() => {});
    const deadline = Date.now() + 20_000;
    while (Date.now() < deadline) {
      await refreshState().catch(() => {});
      if (busy.value !== 'v-render' && current.value?.status !== 'rendering') return;
      await new Promise((r) => setTimeout(r, 300));
    }
    notif.warn(i18nT('上次成片的任务还没退出，请稍后再试或重启应用'));
  } finally { cancelling.value = false; }
}
async function approve(): Promise<void> { if (current.value) await run('v-approve', () => ba('video.approve', { id: current.value!.id, force: force.value })); }
async function publish(): Promise<void> {
  if (!current.value) return;
  const ok = await run('v-publish', async () => {
    const input = await ba('video.publishInput', { id: current.value!.id });
    await startPublishWorkflow(input, current.value!.id);
  });
  if (ok) await router.push({ path: '/workflow' });
}
async function markPublished(ok: boolean): Promise<void> {
  if (current.value) await run('v-publish', () => ba('video.markPublished', { id: current.value!.id, ok, note: ok ? i18nT('已在发布工作流完成') : i18nT('发布未完成') }));
}
async function fillModels(): Promise<void> {
  if (!current.value) return;
  const before = current.value.materials.length;
  const ok = await run('v-material', () => ba('video.fillModels', { id: current.value!.id }));
  if (ok) notif.info((current.value?.materials.length || 0) > before ? i18nT('已补 {n} 张模特图', { n: (current.value?.materials.length || 0) - before }) : i18nT('选中的款都已有试穿图，不用补'));
}
async function schedule(at: string | null): Promise<void> {
  if (current.value) await run('v-publish', () => ba('video.schedule', { id: current.value!.id, at: at ? new Date(at).toISOString() : null }));
}
async function readBack(): Promise<void> {
  if (!current.value) return;
  const ok = await run('v-review', async () => {
    const text = await ba<string>('video.statsInstruction', { id: current.value!.id });
    await handToDigitalEmployee(i18nT('回读视频数据：{p0}', { p0: current.value!.name }), text);
  });
  if (ok) notif.success(i18nT('已交给数字员工，读回后请把数字填到表里'));
}
async function saveStats(p: BaPublishPlatform): Promise<void> {
  if (!current.value) return;
  await run('v-review', () => ba('video.recordStats', { id: current.value!.id, platform: p, stats: { ...statsDraft[p], source: 'manual' } }));
  await loadReview();
}
async function remove(): Promise<void> {
  if (!current.value || !window.confirm(i18nT('删除视频项目「{p0}」？成片文件保留在输出目录。', { p0: current.value.name }))) return;
  try { await ba('video.remove', { id: current.value.id }); currentId.value = ''; await refreshState(); } catch (e) { notif.error(errorMessage(e)); }
}
function jump(key: string): void { void scrollToStep(key); }
</script>

<style scoped>
.ba-projbar { display: flex; gap: 10px; align-items: flex-end; }
.ba-projbar .ss-field { min-width: 320px; }
.ba-types { display: grid; grid-template-columns: repeat(auto-fit, minmax(170px, 1fr)); gap: 8px; }
.ba-type { display: grid; gap: 2px; text-align: start; padding: 10px 12px; border: 1px solid var(--color-border); border-radius: var(--radius-4); background: var(--color-bg-primary); color: var(--color-text-primary); cursor: pointer; font: inherit; }
.ba-type small { color: var(--color-text-secondary); font-size: 11.5px; }
.ba-type.on { border-color: var(--color-brand); background: color-mix(in srgb, var(--color-brand) 8%, var(--color-bg-primary)); }
.ba-gpick { display: grid; grid-template-columns: repeat(auto-fill, minmax(96px, 1fr)); gap: 8px; }
.ba-gpick button { display: grid; gap: 2px; padding: 0 0 6px; border: 2px solid var(--color-border); border-radius: var(--radius-4); overflow: hidden; background: var(--color-bg-card); cursor: pointer; font: inherit; font-size: 11.5px; color: var(--color-text-primary); }
.ba-gpick img { width: 100%; aspect-ratio: 3 / 4; object-fit: contain; background: var(--bavt-surface); }
.ba-gpick span { padding: 0 6px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.ba-gpick button.on { border-color: var(--color-brand); }
.ba-check { display: inline-flex; gap: 4px; align-items: center; font-size: 12.5px; }
.ba-mini { height: 28px; border-radius: var(--radius-2); border: 1px solid var(--color-border); background: var(--color-bg-input); color: var(--color-text-primary); font: inherit; font-size: var(--font-size-sm); }
.ba-summary { display: flex; gap: 10px; flex-wrap: wrap; align-items: center; font-size: 12.5px; }
.ba-thumbs { display: flex; gap: 8px; flex-wrap: wrap; }
.ba-thumbs figure { margin: 0; width: 84px; }
.ba-thumbs img { width: 84px; height: 112px; object-fit: cover; border-radius: var(--radius-3); border: 1px solid var(--color-border); background: var(--bavt-surface); }
.ba-thumbs figcaption { font-size: var(--font-size-xs); color: var(--color-text-secondary); text-align: center; }
.ba-scenes { display: grid; gap: 6px; }
.ba-scene { display: grid; grid-template-columns: 48px 1fr auto; gap: 10px; align-items: center; }
.ba-scene img { width: 48px; height: 64px; object-fit: cover; border-radius: var(--radius-2); }
.ba-scene > div { display: grid; grid-template-columns: auto auto 1fr; gap: 8px; align-items: center; }
.ba-scene small { color: var(--color-text-secondary); font-size: 11.5px; }
.ba-scene input, .ba-copy input, .ba-copy textarea { height: 30px; border-radius: var(--radius-3); border: 1px solid var(--color-border); background: var(--color-bg-input); color: var(--color-text-primary); font: inherit; font-size: 12.5px; padding: 0 8px; }
.ba-copy textarea { height: auto; padding: 6px 8px; resize: vertical; }
.ba-copies { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 10px; }
.ba-copy { display: grid; gap: 6px; padding: 10px; border: 1px solid var(--color-border); border-radius: var(--radius-4); }
.ba-dt { height: 30px; border-radius: var(--radius-3); border: 1px solid var(--color-border); background: var(--color-bg-input); color: var(--color-text-primary); font: inherit; font-size: 12.5px; padding: 0 8px; }
.ba-stat { width: 90px; text-align: end; }
.ba-player { display: flex; gap: 14px; align-items: flex-start; }
.ba-player video { width: 240px; aspect-ratio: 9 / 16; border-radius: var(--radius-5); background: var(--bavt-dark); }
.ba-player__side { display: grid; gap: 6px; font-size: 12.5px; }
.spin { animation: ba-spin 1s linear infinite; }
@keyframes ba-spin { to { transform: rotate(360deg); } }

/* ─── 调色板（docs/ui-design-system.md）：经典主题保持原值；界面主题（data-ui-theme）下映射全局 token ─── */
.ss-module { /* ui-theme-exempt: 经典主题原值 */
  --bavt-surface: #fff;
  --bavt-dark: #000;
}
:root[data-ui-theme] .ss-module {
  --bavt-surface: var(--color-bg-card);
  --bavt-dark: var(--color-bg-code);
}
</style>
