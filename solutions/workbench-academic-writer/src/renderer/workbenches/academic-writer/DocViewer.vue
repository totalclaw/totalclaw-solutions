<template>
  <Teleport to="body">
    <div class="awv-backdrop" @click.self="$emit('close')">
      <section class="awv" role="dialog" aria-modal="true">
        <header class="awv-bar">
          <div ref="menuRef" class="awv-file">
            <button type="button" class="awv-file__btn" :aria-expanded="menuOpen" @click="toggleMenu">
              <i :class="icon"></i><span>{{ fileName }}</span><i class="ri-arrow-down-s-line"></i>
            </button>
            <div v-if="menuOpen" class="awv-menu" role="menu">
              <div class="awv-menu__title"><i :class="icon"></i>{{ fileName }}</div>
              <div class="awv-menu__sep"></div>
              <div class="awv-sub" @mouseenter="subOpen = true" @mouseleave="subOpen = false">
                <button type="button" role="menuitem" class="awv-item" @click="subOpen = !subOpen"><i class="ri-arrow-right-up-line"></i>{{ $t('打开方式') }}<i class="ri-arrow-right-s-line awv-grow"></i></button>
                <div v-if="subOpen" class="awv-menu awv-menu--sub" role="menu">
                  <p v-if="loadingApps" class="awv-muted"><i class="ri-loader-4-line spin"></i>{{ $t('正在查找本机应用…') }}</p>
                  <button v-for="a in apps" :key="a.path" type="button" role="menuitem" class="awv-item" @click="openWith(a.path)">
                    <img v-if="a.icon" :src="a.icon" alt="" class="awv-appicon" /><i v-else class="ri-apps-line"></i>
                    <span>{{ a.name }}</span><em v-if="a.isDefault" class="awv-default">{{ $t('默认') }}</em>
                  </button>
                  <p v-if="!loadingApps && !apps.length" class="awv-muted">{{ $t('没有找到能打开它的应用') }}</p>
                  <div class="awv-menu__sep"></div>
                  <button type="button" role="menuitem" class="awv-item" @click="choose"><i class="ri-apps-2-line"></i>{{ $t('选择其他应用…') }}</button>
                  <button type="button" role="menuitem" class="awv-item" @click="reveal"><i class="ri-folder-open-line"></i>{{ $t('打开所在文件夹') }}</button>
                </div>
              </div>
              <button type="button" role="menuitem" class="awv-item" @click="$emit('cowrite'); menuOpen = false"><i class="ri-quill-pen-line"></i>{{ $t('在人机双写编辑器中打开') }}</button>
            </div>
          </div>
          <span class="awv-grow"></span>
          <span v-if="error" class="awv-error">{{ error }}</span>
          <button type="button" class="awv-icon" :title="$t('关闭')" @click="$emit('close')"><i class="ri-close-line"></i></button>
        </header>
        <!-- eslint-disable-next-line vue/no-v-html -->
        <article class="awv-paper" dir="auto" v-html="html"></article>
      </section>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
/**
 * 论文预览（内置打开）：左上角文件名下拉，与 Codex 的文件菜单同形 —— Open in ▸ 本机能打开它的应用（带图标、默认应用标记）、
 * 选择其他应用、打开所在文件夹；再加一项「在人机双写编辑器中打开」。
 */
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';
import type { AwOpenWithApp } from '@totalclaw/ipc-contracts';
import { renderMarkdown } from '../../utils/markdown';
import { aw, errorMessage } from './shared';

const props = defineProps<{ path: string; markdown: string }>();
defineEmits<{ (e: 'close'): void; (e: 'cowrite'): void }>();

const fileName = computed(() => props.path.split(/[\\/]/).pop() || props.path);
const icon = computed(() => (/\.docx?$/i.test(props.path) ? 'ri-file-word-2-line' : /\.bib$/i.test(props.path) ? 'ri-book-2-line' : 'ri-markdown-line'));
const html = computed(() => renderMarkdown(props.markdown));
const menuOpen = ref(false);
const subOpen = ref(false);
const apps = ref<AwOpenWithApp[]>([]);
const loadingApps = ref(false);
const error = ref('');
const menuRef = ref<HTMLElement | null>(null);

async function toggleMenu(): Promise<void> {
  menuOpen.value = !menuOpen.value;
  if (menuOpen.value && !apps.value.length && !loadingApps.value) {
    loadingApps.value = true;
    try { apps.value = await aw<AwOpenWithApp[]>('openIn.apps', { path: props.path }); } catch (e) { error.value = errorMessage(e); } finally { loadingApps.value = false; }
  }
}
async function run(fn: () => Promise<unknown>): Promise<void> {
  error.value = '';
  try { await fn(); menuOpen.value = false; } catch (e) { error.value = errorMessage(e); }
}
const openWith = (appPath: string) => run(() => aw('openIn.open', { path: props.path, appPath }));
const choose = () => run(() => aw('openIn.choose', { path: props.path }));
const reveal = () => run(() => aw('path.open', { path: props.path, reveal: true }));

function onDocClick(ev: MouseEvent): void {
  if (menuOpen.value && menuRef.value && !menuRef.value.contains(ev.target as Node)) menuOpen.value = false;
}
onMounted(() => document.addEventListener('mousedown', onDocClick));
onBeforeUnmount(() => document.removeEventListener('mousedown', onDocClick));
</script>

<style scoped>
.awv-backdrop { position: fixed; inset: 0; z-index: 10000; display: grid; place-items: center; padding: 18px; background: var(--awdv-scrim-a55); }
.awv { width: min(980px, 100%); height: min(92vh, 1200px); display: grid; grid-template-rows: auto 1fr; border-radius: var(--radius-6); overflow: hidden; background: var(--color-bg-card); border: 1px solid var(--color-border); }
.awv-bar { display: flex; align-items: center; gap: 8px; padding: 8px 10px; border-bottom: 1px solid var(--color-border); background: var(--color-bg-primary); }
.awv-grow { flex: 1; }
.awv-file { position: relative; }
.awv-file__btn { display: inline-flex; align-items: center; gap: 6px; height: 32px; padding: 0 10px; border-radius: var(--radius-7); border: 1px solid var(--color-border); background: var(--color-bg-card); color: var(--color-text-primary); font: inherit; font-size: var(--font-size-md); cursor: pointer; }
.awv-menu { position: absolute; top: calc(100% + 6px); left: 0; min-width: 240px; padding: 6px; border-radius: var(--radius-5); border: 1px solid var(--color-border); background: var(--color-bg-card); box-shadow: var(--awdv-shadow); z-index: 5; display: grid; gap: 2px; }
.awv-menu__title { display: flex; gap: 8px; align-items: center; padding: 6px 8px; font-size: var(--font-size-md); font-weight: 600; }
.awv-menu__sep { height: 1px; background: var(--color-border); margin: 4px 0; }
.awv-sub { position: relative; }
.awv-menu--sub { top: -6px; left: calc(100% + 4px); }
.awv-item { display: flex; align-items: center; gap: 8px; width: 100%; padding: 7px 8px; border: none; border-radius: var(--radius-3); background: transparent; color: var(--color-text-primary); font: inherit; font-size: var(--font-size-md); cursor: pointer; text-align: start; }
.awv-item:hover { background: var(--color-bg-hover); }
.awv-appicon { width: 18px; height: 18px; }
.awv-default { font-style: normal; font-size: var(--font-size-xs); color: var(--color-text-secondary); margin-inline-start: auto; }
.awv-muted { margin: 4px 8px; font-size: var(--font-size-sm); color: var(--color-text-secondary); display: flex; gap: 6px; align-items: center; }
.awv-icon { width: 30px; height: 30px; border: none; border-radius: var(--radius-3); background: transparent; color: var(--color-text-secondary); cursor: pointer; font-size: var(--font-size-xl); }
.awv-error { color: var(--color-danger); font-size: var(--font-size-sm); }
.awv-paper { overflow-y: auto; padding: 36px 56px; font-size: 14.5px; line-height: 1.85; color: var(--color-text-primary); }
.awv-paper :deep(h1) { text-align: center; font-size: 22px; }
.awv-paper :deep(h2) { font-size: 17px; margin-top: 1.6em; }
.spin { animation: awv-spin 1s linear infinite; }
@keyframes awv-spin { to { transform: rotate(360deg); } }

/* ─── 调色板（docs/ui-design-system.md）：经典主题保持原值；界面主题（data-ui-theme）下映射全局 token ─── */
.awv-backdrop { /* ui-theme-exempt: 经典主题原值 */
  --awdv-scrim-a55: rgba(0, 0, 0, .55);
  --awdv-shadow: 0 12px 32px rgba(0, 0, 0, .22);
}
:root[data-ui-theme] .awv-backdrop {
  --awdv-scrim-a55: color-mix(in srgb, var(--color-scrim) 55%, transparent);
  --awdv-shadow: var(--shadow-pop);
}
</style>
