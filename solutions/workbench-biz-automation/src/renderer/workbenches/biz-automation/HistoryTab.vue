<template>
  <div class="ba-hist">
    <div class="ss-kpis">
      <div class="ss-kpi"><small>{{ $t('视频项目') }}</small><strong>{{ videos.length }}</strong></div>
      <div class="ss-kpi accent"><small>{{ $t('已发布') }}</small><strong>{{ counts.published }}</strong></div>
      <div class="ss-kpi"><small>{{ $t('平台发布成功（次）') }}</small><strong>{{ counts.platformPosts }}</strong></div>
      <div class="ss-kpi"><small>{{ $t('累计播放') }}</small><strong>{{ counts.plays }}</strong></div>
    </div>

    <section class="ss-panel">
      <header class="ba-hist__bar">
        <div class="ba-hist__filters" role="tablist">
          <button v-for="f in FILTERS" :key="f.key" type="button" role="tab" class="ba-hist__f" :class="{ on: filter === f.key }" :aria-selected="filter === f.key" @click="filter = f.key">
            {{ f.label }}<em>{{ filterCount(f.key) }}</em>
          </button>
        </div>
        <input v-model="keyword" type="search" class="ba-hist__q" :placeholder="$t('按名称 / 商品 / 文案搜索')" />
      </header>

      <p v-if="!rows.length" class="ss-empty">{{ videos.length ? $t('没有符合条件的记录') : $t('还没有视频项目。在「短视频发布」或「数字人介绍」里做完的视频，每一步都会记在这里。') }}</p>

      <article v-for="v in rows" :key="v.id" class="ba-hist__item" :class="{ open: openId === v.id }">
        <div class="ba-hist__row" role="button" tabindex="0" @click="toggle(v.id)" @keydown.enter="toggle(v.id)">
          <div class="ba-hist__thumb">
            <img v-if="cover(v)" :src="fileUrl(cover(v)!)" alt="" loading="lazy" />
            <i v-else class="ri-film-line"></i>
            <span v-if="v.durationSec" class="ba-hist__dur">{{ $t('{s} 秒', { s: v.durationSec }) }}</span>
          </div>
          <div class="ba-hist__main">
            <div class="ba-hist__title">
              <strong>{{ v.name }}</strong>
              <span class="ss-chip" :class="statusTone(v.status)">{{ statusLabel(v.status) }}</span>
              <span class="ss-chip">{{ videoTypeLabel(v.type) }}</span>
            </div>
            <div class="ba-hist__meta">
              <span>{{ $t('创建 {p0}', { p0: fmtDateTime(v.createdAt) }) }}</span>
              <span v-if="v.publishedAt">{{ $t('发布 {p0}', { p0: fmtDateTime(v.publishedAt) }) }}</span>
              <span v-else-if="v.updatedAt">{{ $t('最近更新 {p0}', { p0: fmtDateTime(v.updatedAt) }) }}</span>
              <span>{{ v.platforms.map(platformLabel).join(' / ') }}</span>
            </div>
            <div v-if="lastRun(v)" class="ba-hist__plats">
              <span v-for="r in platformResults(lastRun(v)!)" :key="r.platform" class="ss-chip" :class="r.tone">{{ r.label }}</span>
            </div>
            <p v-else-if="v.publishRunNote" class="ss-muted ba-hist__note">{{ v.publishRunNote }}</p>
          </div>
          <div class="ba-hist__ops" @click.stop>
            <button type="button" class="ss-btn sm" @click="$emit('goto', 'video', { id: v.id })"><i class="ri-external-link-line"></i>{{ $t('打开项目') }}</button>
            <button v-if="v.video" type="button" class="ss-btn sm ghost" @click="openPath(v.video, true)"><i class="ri-folder-open-line"></i>{{ $t('所在文件夹') }}</button>
            <i class="ba-hist__chev" :class="openId === v.id ? 'ri-arrow-up-s-line' : 'ri-arrow-down-s-line'"></i>
          </div>
        </div>

        <div v-if="openId === v.id" class="ba-hist__detail">
          <div class="ba-hist__cols">
            <div class="ba-hist__col">
              <span class="ss-subhead">{{ $t('节点记录') }}</span>
              <ol class="ba-hist__tl">
                <li v-for="(e, i) in timeline(v)" :key="i" :class="{ bad: !e.ok }">
                  <i :class="stepIcon(e.step)"></i>
                  <div>
                    <b>{{ stepLabel(e.step) }}</b><small>{{ fmtDateTime(e.at) }}</small>
                    <p>{{ e.text }}</p>
                  </div>
                </li>
              </ol>
              <p v-if="!v.history?.length" class="ss-muted">{{ $t('这条视频做于留痕功能上线前，节点记录按已有时间还原，不含失败记录。') }}</p>
            </div>
            <div class="ba-hist__col">
              <template v-if="v.video">
                <span class="ss-subhead">{{ $t('成片') }}</span>
                <video :src="fileUrl(v.video)" controls playsinline preload="metadata" class="ba-hist__video"></video>
              </template>

              <span class="ss-subhead">{{ $t('发布记录') }}</span>
              <p v-if="!v.publishRuns?.length" class="ss-muted">{{ v.status === 'published' ? $t('已人工确认发布（没有平台回执）') : $t('还没有发布记录') }}</p>
              <div v-for="(r, i) in [...(v.publishRuns || [])].reverse()" :key="r.runId || i" class="ba-hist__run">
                <div class="ba-hist__runhead">
                  <span class="ss-chip" :class="r.published.length ? 'ok' : r.outcome === 'cancelled' ? '' : 'bad'">{{ outcomeLabel(r) }}</span>
                  <small class="ss-muted">{{ fmtDateTime(r.at) }}</small>
                </div>
                <ul class="ba-hist__receipts">
                  <li v-for="x in platformResults(r)" :key="x.platform">
                    <span class="ss-chip" :class="x.tone">{{ x.label }}</span>
                    <a v-if="x.url" href="#" class="ss-link" @click.prevent="openUrl(x.url)">{{ $t('查看作品') }}</a>
                    <small v-if="x.error" class="ss-muted">{{ x.error }}</small>
                  </li>
                </ul>
                <small v-if="r.videoFile && r.videoFile !== v.video" class="ss-muted">{{ $t('当时发布的成片：{p0}', { p0: baseName(r.videoFile) }) }}</small>
              </div>

              <template v-if="v.stats && Object.keys(v.stats).length">
                <span class="ss-subhead">{{ $t('平台数据') }}</span>
                <div class="ss-table-wrap">
                  <table class="ss-table">
                    <thead><tr><th>{{ $t('平台') }}</th><th class="num">{{ $t('播放') }}</th><th class="num">{{ $t('点赞') }}</th><th class="num">{{ $t('评论') }}</th><th class="num">{{ $t('分享') }}</th><th>{{ $t('记录于') }}</th></tr></thead>
                    <tbody>
                      <tr v-for="p in v.platforms.filter((x) => v.stats?.[x])" :key="p">
                        <td>{{ platformLabel(p) }}</td><td class="num">{{ v.stats![p]!.plays }}</td><td class="num">{{ v.stats![p]!.likes }}</td><td class="num">{{ v.stats![p]!.comments }}</td><td class="num">{{ v.stats![p]!.shares }}</td><td>{{ fmtDateTime(v.stats![p]!.at) }}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </template>

              <template v-if="Object.keys(v.copies).length">
                <span class="ss-subhead">{{ $t('发布文案') }}</span>
                <div v-for="p in v.platforms.filter((x) => v.copies[x])" :key="p" class="ba-hist__copy">
                  <b>{{ platformLabel(p) }} · {{ v.copies[p]!.title }}</b>
                  <p>{{ v.copies[p]!.caption }}</p>
                  <small v-if="v.copies[p]!.topics.length" class="ss-muted">{{ v.copies[p]!.topics.map((t) => '#' + t).join(' ') }}</small>
                </div>
              </template>
            </div>
          </div>
        </div>
      </article>
    </section>
  </div>
</template>

<script setup lang="ts">
/**
 * 历史记录：每条视频项目一张卡 —— 状态、成片、各平台发布回执、节点留痕、平台数据、文案。
 * 数据都来自主进程 state.json（视频项目的 history / publishRuns / stats），这里只读不改；
 * 要继续做（重新成片、补发、录数据）点「打开项目」回到短视频发布向导。
 */
import { computed, ref } from 'vue';
import type { BaPublishRun, BaVideoEvent, BaVideoProject, BaVideoStep } from '@totalclaw/ipc-contracts';
import { t as i18nT } from '../../i18n';
import { baState, fileUrl, fmtDateTime, openPath, platformLabel, videoTypeLabel } from './shared';

defineEmits<{ (e: 'goto', key: string, payload?: unknown): void }>();

type FilterKey = 'all' | 'published' | 'active' | 'failed';
const FILTERS: Array<{ key: FilterKey; label: string }> = [
  { key: 'all', label: i18nT('全部') },
  { key: 'published', label: i18nT('已发布') },
  { key: 'active', label: i18nT('进行中') },
  { key: 'failed', label: i18nT('失败 / 未发成') },
];
const filter = ref<FilterKey>('all');
const keyword = ref('');
const openId = ref('');

const videos = computed<BaVideoProject[]>(() => baState.value?.videos || []);
/** 最近有动静的排前面（发布 / 留痕 / 更新时间取最晚的） */
function lastActivity(v: BaVideoProject): number {
  const ts = [v.createdAt, v.updatedAt, v.publishedAt, v.history?.[v.history.length - 1]?.at].map((x) => Date.parse(x || '')).filter(Number.isFinite);
  return ts.length ? Math.max(...ts) : 0;
}
function isFailed(v: BaVideoProject): boolean {
  const r = lastRun(v);
  return v.status === 'failed' || (v.status !== 'published' && !!r && !r.published.length);
}
function matches(v: BaVideoProject, f: FilterKey): boolean {
  if (f === 'published') return v.status === 'published';
  if (f === 'failed') return isFailed(v);
  if (f === 'active') return v.status !== 'published' && !isFailed(v);
  return true;
}
function filterCount(f: FilterKey): number { return videos.value.filter((v) => matches(v, f)).length; }
const rows = computed(() => {
  const q = keyword.value.trim().toLowerCase();
  return videos.value
    .filter((v) => matches(v, filter.value))
    .filter((v) => !q || [v.name, v.brief, ...Object.values(v.copies).flatMap((c) => [c?.title, c?.caption])].join('\n').toLowerCase().includes(q))
    .sort((a, b) => lastActivity(b) - lastActivity(a));
});
const counts = computed(() => {
  let published = 0; let platformPosts = 0; let plays = 0;
  for (const v of videos.value) {
    if (v.status === 'published') published++;
    platformPosts += (v.publishRuns || []).reduce((n, r) => n + r.published.length, 0);
    plays += Object.values(v.stats || {}).reduce((n, s) => n + (s?.plays || 0), 0);
  }
  return { published, platformPosts, plays };
});

function toggle(id: string): void { openId.value = openId.value === id ? '' : id; }
function cover(v: BaVideoProject): string | undefined { return v.scenes[0]?.image || v.materials[0]; }
function lastRun(v: BaVideoProject): BaPublishRun | undefined { return v.publishRuns?.[v.publishRuns.length - 1]; }
function baseName(p: string): string { return p.split(/[\\/]/).pop() || p; }
function openUrl(url: string): void { (window as any).electronAPI?.openExternal?.(url) ?? window.open(url, '_blank'); }

function statusLabel(s: BaVideoProject['status']): string {
  return ({ draft: i18nT('草稿'), scripted: i18nT('已写脚本'), rendering: i18nT('成片中'), rendered: i18nT('已成片'), approved: i18nT('已审核'), publishing: i18nT('发布中'), published: i18nT('已发布'), failed: i18nT('失败') } as Record<string, string>)[s] || s;
}
function statusTone(s: BaVideoProject['status']): string {
  return s === 'published' ? 'ok' : s === 'failed' ? 'bad' : s === 'publishing' || s === 'rendering' ? 'warn' : 'brand';
}
function outcomeLabel(r: BaPublishRun): string {
  if (r.outcome === 'cancelled') return i18nT('发布已取消');
  if (r.published.length) return i18nT('发布成功 {n} 个平台', { n: r.published.length });
  return r.outcome === 'failed' ? i18nT('发布工作流失败') : i18nT('没有平台发成功');
}
const PLAT_NAME: Record<string, string> = { douyin: i18nT('抖音'), kuaishou: i18nT('快手'), xiaohongshu: i18nT('小红书'), wxchannels: i18nT('视频号') };
function platformResults(r: BaPublishRun): Array<{ platform: string; label: string; tone: string; url?: string; error?: string }> {
  const rec = new Map(r.receipts.map((x) => [x.platform, x]));
  const name = (p: string) => PLAT_NAME[p] || p;
  return [
    ...r.published.map((p) => ({ platform: p, label: i18nT('{p0} 已发布', { p0: name(p) }), tone: 'ok', url: rec.get(p)?.url })),
    ...r.unconfirmed.map((p) => ({ platform: p, label: i18nT('{p0} 待核对', { p0: name(p) }), tone: 'warn', url: rec.get(p)?.url, error: rec.get(p)?.error })),
    ...r.failed.map((p) => ({ platform: p, label: i18nT('{p0} 未发成', { p0: name(p) }), tone: 'bad', error: rec.get(p)?.error })),
  ];
}

const STEP_LABEL: Record<BaVideoStep, string> = {
  create: i18nT('创建'), material: i18nT('素材'), script: i18nT('脚本与文案'), edit: i18nT('修改'), render: i18nT('成片'),
  approve: i18nT('审核'), schedule: i18nT('定时'), publish: i18nT('发布'), stats: i18nT('数据回收'),
};
const STEP_ICON: Record<BaVideoStep, string> = {
  create: 'ri-add-circle-line', material: 'ri-image-add-line', script: 'ri-quill-pen-line', edit: 'ri-edit-line', render: 'ri-film-line',
  approve: 'ri-shield-check-line', schedule: 'ri-timer-line', publish: 'ri-send-plane-line', stats: 'ri-bar-chart-2-line',
};
function stepLabel(s: BaVideoStep): string { return STEP_LABEL[s] || s; }
function stepIcon(s: BaVideoStep): string { return STEP_ICON[s] || 'ri-checkbox-blank-circle-line'; }
/**
 * 节点记录。新项目直接用主进程留痕；留痕上线前的老项目按已有时间戳还原一份（只有成功节点）。
 * 展示时最新的在上。
 */
function timeline(v: BaVideoProject): BaVideoEvent[] {
  if (v.history?.length) return [...v.history].reverse();
  const out: BaVideoEvent[] = [{ at: v.createdAt, step: 'create', text: i18nT('创建项目：{p0}', { p0: videoTypeLabel(v.type) }), ok: true }];
  if (v.scenes.length) out.push({ at: v.createdAt, step: 'script', text: i18nT('写好分镜脚本 {n} 个镜头', { n: v.scenes.length }), ok: true });
  if (v.video) out.push({ at: v.approvedAt || v.updatedAt || v.createdAt, step: 'render', text: i18nT('成片：{f}', { f: baseName(v.video) }), ok: true });
  if (v.approvedAt) out.push({ at: v.approvedAt, step: 'approve', text: i18nT('审核通过'), ok: true });
  if (v.publishedAt) out.push({ at: v.publishedAt, step: 'publish', text: v.publishRunNote || i18nT('已发布'), ok: true });
  for (const p of v.platforms) {
    const s = v.stats?.[p];
    if (s) out.push({ at: s.at, step: 'stats', text: i18nT('{p0} 数据：播放 {a} · 点赞 {b}', { p0: platformLabel(p), a: s.plays, b: s.likes }), ok: true });
  }
  return out.sort((a, b) => Date.parse(b.at) - Date.parse(a.at));
}
</script>

<style scoped>
.ba-hist { display: grid; gap: 14px; }
.ba-hist__bar { display: flex; gap: 10px; align-items: center; justify-content: space-between; flex-wrap: wrap; }
.ba-hist__filters { display: flex; gap: 6px; flex-wrap: wrap; }
.ba-hist__f { display: inline-flex; gap: 6px; align-items: center; padding: 5px 12px; border-radius: 999px; border: 1px solid var(--color-border); background: var(--color-bg-primary); color: var(--color-text-secondary); font: inherit; font-size: 12.5px; cursor: pointer; }
.ba-hist__f em { font-style: normal; font-size: 11px; font-variant-numeric: tabular-nums; opacity: .8; }
.ba-hist__f.on { border-color: var(--color-brand); color: var(--color-brand); background: color-mix(in srgb, var(--color-brand) 8%, var(--color-bg-primary)); font-weight: 700; }
.ba-hist__q { height: 32px; min-width: 240px; border-radius: 8px; border: 1px solid var(--color-border); background: var(--color-bg-input, var(--color-bg-primary)); color: var(--color-text-primary); font: inherit; font-size: 12.5px; padding: 0 10px; }
.ba-hist__item { border: 1px solid var(--color-border); border-radius: 12px; background: var(--color-bg-primary); overflow: hidden; }
.ba-hist__item.open { border-color: color-mix(in srgb, var(--color-brand) 45%, var(--color-border)); }
.ba-hist__row { display: grid; grid-template-columns: 72px minmax(0, 1fr) auto; gap: 12px; align-items: center; padding: 10px 12px; cursor: pointer; }
.ba-hist__row:hover { background: var(--color-bg-hover); }
.ba-hist__thumb { position: relative; width: 72px; height: 96px; border-radius: 8px; overflow: hidden; background: var(--color-bg-card); border: 1px solid var(--color-border); display: flex; align-items: center; justify-content: center; color: var(--color-text-secondary); font-size: 24px; }
.ba-hist__thumb img { width: 100%; height: 100%; object-fit: cover; }
.ba-hist__dur { position: absolute; right: 3px; bottom: 3px; font-size: 10.5px; padding: 1px 5px; border-radius: 6px; background: rgba(0, 0, 0, .6); color: #fff; }
.ba-hist__main { display: grid; gap: 5px; min-width: 0; }
.ba-hist__title { display: flex; gap: 8px; align-items: center; flex-wrap: wrap; }
.ba-hist__title strong { font-size: 14px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 100%; }
.ba-hist__meta { display: flex; gap: 4px 14px; flex-wrap: wrap; font-size: 12px; color: var(--color-text-secondary); }
.ba-hist__plats { display: flex; gap: 6px; flex-wrap: wrap; }
.ba-hist__note { margin: 0; font-size: 12px; }
.ba-hist__ops { display: flex; gap: 6px; align-items: center; }
.ba-hist__chev { font-size: 18px; color: var(--color-text-secondary); }
.ba-hist__detail { border-top: 1px solid var(--color-border); padding: 12px 14px 14px; background: var(--color-bg-card); }
.ba-hist__cols { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1.2fr); gap: 18px; }
@media (max-width: 960px) { .ba-hist__cols { grid-template-columns: 1fr; } }
.ba-hist__col { display: grid; gap: 8px; align-content: start; min-width: 0; }
.ba-hist__tl { list-style: none; margin: 0; padding: 0; display: grid; gap: 2px; max-height: 420px; overflow-y: auto; }
.ba-hist__tl li { display: grid; grid-template-columns: 22px 1fr; gap: 8px; padding: 6px 4px; border-left: 2px solid var(--color-border); margin-left: 10px; padding-left: 10px; }
.ba-hist__tl li > i { margin-left: -22px; width: 22px; height: 22px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; background: var(--color-bg-primary); color: var(--color-brand); border: 1px solid var(--color-border); font-size: 12px; }
.ba-hist__tl li.bad > i { color: var(--color-danger); }
.ba-hist__tl li.bad p { color: var(--color-danger); }
.ba-hist__tl b { font-size: 12.5px; margin-right: 8px; }
.ba-hist__tl small { font-size: 11.5px; color: var(--color-text-secondary); }
.ba-hist__tl p { margin: 2px 0 0; font-size: 12.5px; line-height: 1.55; word-break: break-word; }
.ba-hist__video { width: 200px; aspect-ratio: 9 / 16; border-radius: 10px; background: #000; }
.ba-hist__run { display: grid; gap: 6px; padding: 8px 10px; border: 1px solid var(--color-border); border-radius: 10px; background: var(--color-bg-primary); }
.ba-hist__runhead { display: flex; gap: 8px; align-items: center; }
.ba-hist__receipts { list-style: none; margin: 0; padding: 0; display: grid; gap: 4px; }
.ba-hist__receipts li { display: flex; gap: 8px; align-items: center; flex-wrap: wrap; font-size: 12px; }
.ba-hist__copy { display: grid; gap: 3px; padding: 8px 10px; border: 1px solid var(--color-border); border-radius: 10px; background: var(--color-bg-primary); font-size: 12.5px; }
.ba-hist__copy p { margin: 0; white-space: pre-wrap; line-height: 1.55; color: var(--color-text-secondary); }
</style>
