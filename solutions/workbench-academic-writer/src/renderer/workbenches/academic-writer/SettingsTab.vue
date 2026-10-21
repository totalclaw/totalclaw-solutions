<template>
  <div class="ss-module">
    <section class="ss-panel">
      <header><strong><i class="ri-folder-3-line"></i> {{ $t('结果文件存到') }}</strong><span class="ss-muted">{{ $t('导出的 Word、Markdown、BibTeX 按论文题目分文件夹存放。') }}</span></header>
      <div class="ss-actions">
        <code class="aw-path">{{ state?.outputDir || '—' }}</code>
        <button type="button" class="ss-btn sm ghost" @click="pickDir"><i class="ri-folder-settings-line"></i>{{ $t('更改') }}</button>
        <button type="button" class="ss-btn sm ghost" :disabled="!state?.outputDir" @click="openDir"><i class="ri-external-link-line"></i>{{ $t('打开') }}</button>
      </div>
    </section>

    <section class="ss-panel">
      <header><strong><i class="ri-search-eye-line"></i> {{ $t('文献检索') }}</strong></header>
      <label class="ss-field"><span>{{ $t('联系邮箱（可选）') }}</span>
        <input v-model.trim="email" type="email" placeholder="name@university.edu" />
      </label>
      <p class="ss-muted">{{ $t('PubMed、Crossref、OpenAlex 建议请求里带联系邮箱，限流更宽；只发给这些学术库，不发给别处。') }}</p>
      <div class="ss-subhead">{{ $t('默认检索来源') }}</div>
      <div class="aw-sources">
        <label v-for="s in API_SOURCES" :key="s" class="aw-check"><input v-model="sources" type="checkbox" :value="s" /><span>{{ sourceLabel(s) }}</span></label>
      </div>
      <div class="ss-actions">
        <button type="button" class="ss-btn primary" :disabled="!dirty || !sources.length" @click="save"><i class="ri-save-3-line"></i>{{ $t('保存') }}</button>
        <span v-if="!sources.length" class="ss-muted">{{ $t('至少选一个来源') }}</span>
      </div>
    </section>

  </div>
</template>

<script setup lang="ts">
/** 设置：结果目录、联系邮箱、默认检索来源（模型固定走系统默认，不在这里选） */
import { computed, ref, watch } from 'vue';
import { AW_API_SOURCES, type AwSource } from '@totalclaw/ipc-contracts';
import { t as i18nT } from '../../i18n';
import { useNotificationStore } from '../../stores/notification';
import { aw, awState, errorMessage, refreshState, sourceLabel } from './shared';

defineEmits<{ (e: 'goto', tab: string): void }>();
const notif = useNotificationStore();
const state = awState;
const API_SOURCES = AW_API_SOURCES;
const email = ref('');
const sources = ref<AwSource[]>([]);
watch(() => state.value?.settings, (s) => {
  if (!s) return;
  email.value = s.contactEmail || '';
  sources.value = [...(s.defaultSources || [])];
}, { immediate: true });
const dirty = computed(() => {
  const s = state.value?.settings;
  if (!s) return false;
  return email.value !== (s.contactEmail || '') || [...sources.value].sort().join() !== [...(s.defaultSources || [])].sort().join();
});

async function save(): Promise<void> {
  try {
    await aw('settings.patch', { patch: { contactEmail: email.value, defaultSources: sources.value } });
    await refreshState();
    notif.success(i18nT('已保存'));
  } catch (e) { notif.error(errorMessage(e)); }
}
async function pickDir(): Promise<void> {
  try { if (await aw('outputDir.pick')) await refreshState(); } catch (e) { notif.error(errorMessage(e)); }
}
function openDir(): void {
  if (state.value?.outputDir) void aw('path.open', { path: state.value.outputDir }).catch((e) => notif.error(errorMessage(e)));
}
</script>

<style scoped>
.ss-panel > header strong { display: flex; gap: 6px; align-items: center; }
.aw-path { flex: 1; min-width: 200px; font-size: 12px; color: var(--color-text-secondary); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.aw-sources { display: flex; gap: 14px; flex-wrap: wrap; }
.aw-check { display: inline-flex; gap: 6px; align-items: center; font-size: 13px; cursor: pointer; }
.aw-models { display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 12px; }
</style>
