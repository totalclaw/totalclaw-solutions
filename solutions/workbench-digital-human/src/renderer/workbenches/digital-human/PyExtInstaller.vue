<!--
  运行时可插拔 Python 依赖 —— 扫描器 + 一键安装 UI。

  背景：装机版数字人的部分 provider（阿里云 DVH/IMS、火山）需要额外 Python SDK，
  但这些 SDK 刻意**不打进冻结产物**（否则每加一个能力就得重打整包）。冻结二进制经
  entry hook 从 TOTALCLAW_PLUGINS_DIR 按需加载；本组件调 electronAPI.pyExt 用内置 uv
  在线装到那个目录，装完主进程自动重启 qiye-api 让新依赖生效。

  按 group 嵌进功能页时，分组里一个可选组件都没有（比如 mac 上的 ocr 分组 —— 唯一一条
  native-ocr 只在 win32-x64 列出）就整块不渲染；加载完之前也不渲染，免得先闪一下「加载中」
  再消失。清单加载失败不算空 —— 块要留着给用户看错误和「刷新」。
  不带 group 的完整目录（设置 → 扩展）不受此影响，照常显示空态文案。

  折叠标题由本组件自己带（`summary` prop）：外层 <details><summary> 必须跟列表同生同灭，
  宿主在子组件加载完之前根本不知道分组有没有东西，自己包一层 details 要么先闪标题再藏、
  要么得再挂一套三态；交给知道条数的这一层一并处理最省事。传了 summary 根元素就是
  <details>，宿主的 class / style 落在它上面（卡片样式、去内层边框都用 :deep(.pyext) 盖）。
  仍 emit('empty', 清单加载成功且本分组为 0 条) 给需要联动的宿主。

  「此功能需要的组件 / 可选依赖按需安装」那两行说明只给完整目录：按分组嵌进功能页时宿主
  已经说明了这块是什么，再摆一遍只是重复。嵌入态只留「刷新」—— 有 summary 就挂在折叠
  标题行右侧（click 要 prevent，否则连带折叠），没 summary 就单独一行靠右。
-->
<template>
  <component :is="summary ? 'details' : 'div'" v-if="visible" :class="summary ? 'pyext-details' : undefined">
    <summary v-if="summary" class="pyext-summary">
      <span class="pyext-summary-label">{{ summary }}</span>
      <button class="pyext-refresh" :disabled="loading" @click.prevent.stop="refresh">{{ $t('刷新') }}</button>
    </summary>
    <div class="pyext">
      <div v-if="!summary" class="pyext-head" :class="{ bare: groupScoped }">
        <div v-if="!groupScoped">
          <div class="pyext-title">{{ $t('此功能需要的组件') }}</div>
          <div class="pyext-sub">{{ $t('可选依赖按需安装，无需重装应用') }}</div>
        </div>
        <button class="pyext-refresh" :disabled="loading" @click="refresh">{{ $t('刷新') }}</button>
      </div>

      <div v-if="!uvAvailable && !loading" class="pyext-warn">
        {{ $t('未检测到内置 uv，安装可能失败') }}
      </div>

      <div v-if="loadError" class="pyext-warn" role="alert">{{ loadError }}</div>
      <div v-else-if="loading" class="pyext-empty">{{ $t('加载中…') }}</div>
      <div v-else-if="!items.length" class="pyext-empty">{{ $t('当前分组无可选依赖') }}</div>

      <ul v-else class="pyext-list">
        <li v-for="it in items" :key="it.id" class="pyext-item">
          <div class="pyext-item-main">
            <div class="pyext-item-label">
              {{ $t(it.label) }}
              <span v-if="it.installed" class="pyext-badge ok">{{ $t('已安装') }}</span>
              <span v-else class="pyext-badge miss">{{ $t('未安装') }}</span>
            </div>
            <div class="pyext-item-note">{{ it.note ? $t(it.note) : it.spec }}</div>
            <div v-if="progress[it.id]" class="pyext-progress" :class="{ err: progress[it.id].phase === 'error' }">
              <span class="pyext-phase">{{ phaseLabel(progress[it.id].phase) }}</span>
              <span class="pyext-line">{{ progress[it.id].line }}</span>
            </div>
          </div>
          <div class="pyext-item-actions">
            <button
              v-if="!it.installed"
              class="pyext-btn install"
              :disabled="busy[it.id]"
              @click="install(it)"
            >{{ busy[it.id] ? $t('安装中…') : $t('安装依赖') }}</button>
            <button
              v-else-if="it.kind !== 'native-ocr' && it.kind !== 'hf-model'"
              class="pyext-btn remove"
              :disabled="busy[it.id]"
              @click="remove(it)"
            >{{ $t('卸载') }}</button>
          </div>
        </li>
      </ul>

      <div v-if="pluginsDir" class="pyext-dir" :title="pluginsDir"><details><summary>{{ $t('安装位置') }}</summary>{{ pluginsDir }}</details></div>
    </div>
  </component>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, onBeforeUnmount } from 'vue';
import { t as i18nT } from '../../i18n';

interface PyExtItem {
  id: string; label: string; group: string; spec: string;
  probeModule: string; note?: string; installed: boolean; kind?: string;
}
interface Progress { phase: string; line?: string }

const props = defineProps<{
  group?: string | string[];
  /** 传了就自带 <details><summary> 折叠外壳（已翻译的标题文案），分组为空时连标题一起不渲染 */
  summary?: string;
}>();
/** empty=true 只在清单成功加载且本分组为 0 条时发；加载失败发 false（宿主要把块留着） */
const emit = defineEmits<{ empty: [value: boolean] }>();

const api = () => (window as any).electronAPI?.pyExt;

const loading = ref(true);
const loadError = ref('');
const items = ref<PyExtItem[]>([]);
const groupScoped = computed(() => Array.isArray(props.group) ? props.group.length > 0 : !!props.group);
/** 三态：null = 还没加载完（不渲染）；true = 分组确实没有可选组件（不渲染）；false = 有组件或加载失败（渲染） */
const groupEmpty = ref<boolean | null>(null);
const visible = computed(() => !groupScoped.value || groupEmpty.value === false);
const pluginsDir = ref('');
const uvAvailable = ref(true);
const busy = reactive<Record<string, boolean>>({});
const progress = reactive<Record<string, Progress>>({});
let unsub: null | (() => void) = null;

function phaseLabel(p: string): string {
  const zh = ({ start: i18nT('启动'), resolving: i18nT('解析'), downloading: i18nT('下载'), installing: i18nT('安装'), done: i18nT('完成'), error: i18nT('失败') } as Record<string, string>)[p];
  return zh ? i18nT(zh) : p;
}

async function refresh() {
  const a = api();
  loading.value = true;
  loadError.value = '';
  try {
    if (!a?.list) throw new Error(i18nT('运行时扩展接口不可用'));
    const r = await a.list();
    // 主进程拿不到安装器时回 { ok:false, items:[] }：那是加载失败，不是「这个分组没东西」
    if (r?.ok === false) throw new Error(r.message || i18nT('加载失败'));
    const all: PyExtItem[] = (r?.items || []);
    const groups = groupScoped.value ? (Array.isArray(props.group) ? props.group : [props.group as string]) : null;
    items.value = groups ? all.filter(x => groups.includes(x.group)) : all;
    pluginsDir.value = r?.pluginsDir || '';
    uvAvailable.value = r?.uvAvailable !== false;
  } catch (e: any) { loadError.value = e?.message || String(e); } finally {
    loading.value = false;
    const empty = !loadError.value && items.value.length === 0;
    groupEmpty.value = empty;
    emit('empty', empty);
  }
}

async function install(it: PyExtItem) {
  const a = api();
  if (!a || busy[it.id]) return;
  busy[it.id] = true;
  progress[it.id] = { phase: 'start', line: '' };
  try {
    const res = await a.install(it.id);
    if (res?.ok) {
      progress[it.id] = { phase: 'done', line: i18nT('安装完成，已生效') };
      await refresh();
    } else {
      progress[it.id] = { phase: 'error', line: res?.error || i18nT('安装失败') };
    }
  } catch (e: any) {
    progress[it.id] = { phase: 'error', line: e?.message || String(e) };
  } finally {
    busy[it.id] = false;
  }
}

async function remove(it: PyExtItem) {
  const a = api();
  if (!a || busy[it.id]) return;
  busy[it.id] = true;
  try {
    const res = await a.remove(it.id);
    if (!res?.ok) throw new Error(res?.error || i18nT('卸载失败'));
    progress[it.id] = { phase: 'done', line: i18nT('卸载完成') };
    await refresh();
  } catch (e: any) {
    progress[it.id] = { phase: 'error', line: e?.message || String(e) };
  } finally {
    busy[it.id] = false;
  }
}

onMounted(() => {
  const a = api();
  if (a?.onInstallProgress) {
    unsub = a.onInstallProgress((p: any) => {
      if (p && p.id) progress[p.id] = { phase: p.phase, line: p.line };
    });
  }
  refresh();
});
onBeforeUnmount(() => { try { unsub?.(); } catch { /* */ } });
</script>

<style scoped>
.pyext-summary { cursor: pointer; }
/* 折叠标题行右侧的「刷新」：宿主把 summary 排成 flex 时靠 auto margin 推到行尾，默认 list-item 排版时靠 float */
.pyext-summary > .pyext-refresh { float: inline-end; margin-inline-start: auto; }
.pyext { border: 1px solid var(--color-border); border-radius: 10px; padding: 14px 16px; background: var(--color-bg-card); }
.pyext-head { display: flex; align-items: flex-start; justify-content: space-between; gap: 12px; margin-bottom: 10px; }
.pyext-head.bare { justify-content: flex-end; }
.pyext-title { font-weight: 600; font-size: 14px; color: var(--color-text-primary); }
.pyext-sub { font-size: 12px; color: var(--color-text-secondary); margin-top: 2px; }
.pyext-refresh { font-size: 12px; font-weight: 400; padding: 4px 10px; border: 1px solid var(--color-border); border-radius: 6px; background: transparent; color: var(--color-text-secondary); cursor: pointer; }
.pyext-refresh:disabled { opacity: .5; cursor: default; }
.pyext-warn { font-size: 12px; color: var(--color-warning, #a15c00); background: var(--color-warning-bg, #fff5e6); border: 1px solid var(--color-warning-border, #ffe0a3); border-radius: 6px; padding: 6px 10px; margin-bottom: 10px; }
.pyext-empty { font-size: 13px; color: var(--color-text-secondary); padding: 10px 2px; }
.pyext-list { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 8px; }
.pyext-item { display: flex; align-items: flex-start; justify-content: space-between; gap: 12px; padding: 10px 12px; border: 1px solid var(--color-border); border-radius: 8px; background: var(--color-bg-input); }
.pyext-item-main { min-width: 0; flex: 1; }
.pyext-item-label { font-size: 13px; font-weight: 600; color: var(--color-text-primary); display: flex; align-items: center; gap: 8px; }
.pyext-badge { font-size: 11px; font-weight: 500; padding: 1px 7px; border-radius: 999px; }
.pyext-badge.ok { color: #0a7d33; background: #e5f7ec; }
.pyext-badge.miss { color: #8a6100; background: #fdf1d6; }
.pyext-item-note { font-size: 12px; color: var(--color-text-secondary); margin-top: 3px; word-break: break-all; }
.pyext-progress { font-size: 11px; color: var(--color-text-secondary); margin-top: 6px; display: flex; gap: 6px; align-items: baseline; }
.pyext-phase { flex-shrink: 0; font-weight: 600; }
.pyext-line { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.pyext-item-actions { flex-shrink: 0; }
.pyext-progress.err { color: var(--color-danger, #c0392b); }
.pyext-btn { font-size: 12px; padding: 5px 14px; border-radius: 6px; border: 1px solid transparent; cursor: pointer; }
.pyext-btn.install { background: var(--color-brand); color: #fff; }
.pyext-btn.remove { background: transparent; border-color: var(--color-border); color: var(--color-text-secondary); }
.pyext-btn:disabled { opacity: .55; cursor: default; }
.pyext-dir { font-size: 11px; color: var(--color-text-muted); margin-top: 10px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
</style>
