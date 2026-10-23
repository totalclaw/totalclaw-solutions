<template>
  <section class="ap-lib">
    <header class="ap-lib__head">
      <div class="ap-lib__kinds" role="tablist">
        <button v-for="k in KINDS" :key="k" type="button" role="tab" :class="{ on: kind === k }" @click="kind = k">
          {{ kindLabel(k) }} <em>{{ count(k) }}</em>
        </button>
      </div>
      <span class="ss-muted">{{ $t('关掉的选项在顾客手机端不显示；每项都能再选细分场景') }}</span>
      <span class="grow"></span>
      <span class="ss-muted">{{ $t('示意图 {a} / {b}', { a: thumbCount, b: thumbTotal }) }}</span>
      <button type="button" class="ss-btn sm" :disabled="genBusy || thumbCount >= thumbTotal" @click="genThumbs"><i :class="genBusy ? 'ri-loader-4-line spin' : 'ri-image-ai-line'"></i>{{ $t('生成缺少的示意图') }}</button>
    </header>
    <p v-if="!apState?.imageReady" class="ss-note warn"><i class="ri-key-2-line"></i>{{ $t('示意图用图像服务生成（每张约 0.02～0.2 元）；还没有配置图像服务') }}</p>
    <div v-for="g in groups" :key="g" class="ap-lib__group">
      <h4>{{ g }}</h4>
      <div class="ap-lib__cards">
        <article v-for="o in inGroup(g)" :key="o.id" class="ap-lib__card" :class="{ off: disabled.includes(o.id) }">
          <header>
            <code>{{ o.id }}</code>
            <strong>{{ o.label }}</strong>
            <label class="ap-switch" :title="disabled.includes(o.id) ? $t('已关闭') : $t('已开启')">
              <input type="checkbox" :checked="!disabled.includes(o.id)" @change="toggle(o.id)" /><span></span>
            </label>
          </header>
          <img v-if="thumbs[o.id]" :src="fileUrl(thumbs[o.id])" alt="" class="ap-lib__thumb" loading="lazy" />
          <p v-if="o.detail" class="ss-muted">{{ o.detail }}</p>
          <div class="ap-lib__vars"><span v-for="v in o.variants" :key="v.id">{{ v.label }}</span></div>
          <small class="ss-muted">{{ o.audience.map(audienceLabel).join(' / ') }}</small>
        </article>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
/** 造型库：背景 30 / 姿势 20 / 发型 25 项及细分场景，按项开关手机端显示。 */
import { computed, ref } from 'vue';
import type { ApStyleKind } from '@totalclaw/ipc-contracts';
import { useNotificationStore } from '../../stores/notification';
import { t as i18nT } from '../../i18n';
import { ap, apOptions, apState, audienceLabel, errorMessage, fileUrl, kindLabel, refreshState } from './shared';

const notif = useNotificationStore();
const KINDS: ApStyleKind[] = ['background', 'pose', 'hair'];
const kind = ref<ApStyleKind>('background');
const disabled = computed(() => apState.value?.settings.disabledOptions || []);
const list = computed(() => apOptions.value.filter((o) => o.kind === kind.value));
const groups = computed(() => [...new Set(list.value.map((o) => o.group))]);
const inGroup = (g: string) => list.value.filter((o) => o.group === g);
const count = (k: ApStyleKind) => apOptions.value.filter((o) => o.kind === k).length;
const thumbs = computed(() => apState.value?.thumbs || {});
const thumbable = computed(() => apOptions.value.filter((o) => !o.needsUpload && o.id !== 'H00'));
const thumbTotal = computed(() => thumbable.value.length);
const thumbCount = computed(() => thumbable.value.filter((o) => thumbs.value[o.id]).length);
const genBusy = ref(false);
async function genThumbs(): Promise<void> {
  genBusy.value = true;
  try {
    const r = await ap<{ made: number; errors: string[] }>('options.thumbs', {});
    await refreshState();
    if (r.errors.length) notif.warn(i18nT('生成了 {n} 张，{m} 张失败：{p0}', { n: r.made, m: r.errors.length, p0: r.errors[0] }));
    else notif.success(i18nT('已生成 {n} 张示意图', { n: r.made }));
  } catch (e) { notif.error(errorMessage(e)); } finally { genBusy.value = false; }
}

async function toggle(id: string): Promise<void> {
  const cur = new Set(disabled.value);
  if (cur.has(id)) cur.delete(id); else cur.add(id);
  try { await ap('settings.patch', { patch: { disabledOptions: [...cur] } }); await refreshState(); } catch (e) { notif.error(errorMessage(e)); }
}
</script>

<style scoped>
.ap-lib { display: grid; gap: 14px; }
.ap-lib__head { display: flex; gap: 14px; align-items: center; flex-wrap: wrap; }
.ap-lib__kinds { display: inline-flex; border: 1px solid var(--color-border); border-radius: var(--radius-4); overflow: hidden; }
.ap-lib__kinds button { border: 0; background: var(--color-bg-card); padding: 7px 16px; font: inherit; font-size: var(--font-size-md); font-weight: 700; color: var(--color-text-secondary); cursor: pointer; }
.ap-lib__kinds button em { font-style: normal; font-size: var(--font-size-xs); opacity: .7; }
.ap-lib__kinds button.on { background: var(--color-brand); color: var(--color-on-accent); }
.ap-lib__group h4 { margin: 0 0 8px; font-size: var(--font-size-md); color: var(--color-text-secondary); }
.ap-lib__cards { display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 10px; }
.ap-lib__card { border: 1px solid var(--color-border); border-radius: var(--radius-5); padding: 10px 12px; background: var(--color-bg-card); display: grid; gap: 6px; }
.ap-lib__card.off { opacity: .5; }
.ap-lib__thumb { width: 100%; aspect-ratio: 4 / 5; object-fit: cover; border-radius: var(--radius-3); background: var(--color-bg-hover); }
.grow { flex: 1; }
.spin { animation: ap-spin 1s linear infinite; }
@keyframes ap-spin { to { transform: rotate(360deg); } }
.ap-lib__card header { display: flex; gap: 8px; align-items: center; }
.ap-lib__card header strong { flex: 1; font-size: 13.5px; }
.ap-lib__card code { font-size: var(--font-size-xs); color: var(--color-text-secondary); }
.ap-lib__card p { margin: 0; font-size: var(--font-size-sm); }
.ap-lib__vars { display: flex; flex-wrap: wrap; gap: 4px; }
.ap-lib__vars span { font-size: 11.5px; padding: 2px 8px; border-radius: var(--radius-pill); background: var(--color-bg-hover); }
.ap-switch { position: relative; width: 34px; height: 20px; flex: 0 0 auto; }
.ap-switch input { opacity: 0; width: 0; height: 0; }
.ap-switch span { position: absolute; inset: 0; border-radius: var(--radius-pill); background: var(--color-border); cursor: pointer; transition: background-color .2s; }
.ap-switch span::before { content: ""; position: absolute; width: 14px; height: 14px; left: 3px; top: 3px; border-radius: 50%; background: var(--asst2-surface); transition: transform .2s; }
.ap-switch input:checked + span { background: var(--color-brand); }
.ap-switch input:checked + span::before { transform: translateX(14px); }

/* ─── 调色板（docs/ui-design-system.md）：经典主题保持原值；界面主题（data-ui-theme）下映射全局 token ─── */
.ap-lib { /* ui-theme-exempt: 经典主题原值 */
  --asst2-surface: #fff;
}
:root[data-ui-theme] .ap-lib {
  --asst2-surface: var(--color-bg-card);
}
</style>
