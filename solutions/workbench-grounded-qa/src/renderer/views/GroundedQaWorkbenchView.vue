<template>
  <div class="gqa">
    <div class="gqa__inner">
      <header class="workbench-header gqa__intro">
        <div class="heading">
          <PageBackButton />
          <span class="heading-icon"><i class="ri-question-answer-line"></i></span>
          <div>
            <p class="eyebrow">{{ $t('行业工作台') }}</p>
            <h1>{{ $t('知识问答助手') }}</h1>
            <p class="subtitle">
              {{ $t('只依据已审批资料作答，逐条标注来源页码；超出职责范围或资料里查不到的问题一律拒答，不猜不编。') }}
            </p>
          </div>
        </div>
        <div class="header-actions">
          <button type="button" class="btn ghost" :disabled="syncing" @click="syncHandbook">
            <i :class="syncing ? 'ri-loader-4-line spin' : 'ri-refresh-line'"></i>{{ $t('刷新') }}
          </button>
        </div>
      </header>

      <!-- 审批范围：默认收起，左上角箭头展开 -->
      <section class="gqa__panel" :class="{ open: approveOpen }">
        <button type="button" class="gqa__panel-head" :aria-expanded="approveOpen" @click="approveOpen = !approveOpen">
          <i class="ri-arrow-right-s-line gqa__arrow"></i>
          <div class="gqa__panel-title">
            <strong>{{ $t('审批可回答范围') }}</strong>
            <small>{{ $t('未审批的资料检索不到 —— 这是这套方案的权限边界，不是摆设') }}</small>
          </div>
          <span v-if="syncing" class="gqa__badge">
            <i class="ri-loader-4-line spin"></i>
            <template v-if="progress">{{ $t('正在识别 {file}（{done}/{total} 页）', progress) }}</template>
            <template v-else>{{ $t('正在读取资料…') }}</template>
          </span>
          <span v-else-if="docs.length" class="gqa__badge" :class="{ ok: approvedCount > 0 }">
            {{ $t('{total} 份资料 · {n} 份已审批', { total: docs.length, n: approvedCount }) }}
          </span>
          <span v-else class="gqa__badge warn">{{ $t('还没有资料') }}</span>
        </button>

        <div v-show="approveOpen" class="gqa__panel-body">
          <p v-if="syncError" class="gqa__error"><i class="ri-error-warning-line"></i>{{ syncError }}</p>
          <div class="gqa__folder">
            <i :class="folder ? 'ri-folder-3-line' : 'ri-folder-warning-line'"></i>
            <span v-if="folder" class="gqa__folder-path" :title="folder">{{ folder }}</span>
            <span v-else>{{ $t('还没有选择资料文件夹') }}</span>
            <button class="btn ghost small" :disabled="syncing" @click="pickFolder">
              <i class="ri-folder-open-line"></i>{{ folder ? $t('更换文件夹') : $t('选择文件夹') }}
            </button>
            <button v-if="folder" class="btn ghost small" :disabled="syncing" @click="syncHandbook">
              <i :class="syncing ? 'ri-loader-4-line spin' : 'ri-refresh-line'"></i>{{ $t('重新读取') }}
            </button>
          </div>
          <div v-if="docs.length" class="gqa__table-wrap">
            <table class="gqa__table">
              <thead>
                <tr>
                  <th>{{ $t('资料名称') }}</th><th>{{ $t('页数') }}</th><th>{{ $t('字数') }}</th><th>{{ $t('可回答') }}</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="d in docs" :key="d.id">
                  <td class="gqa__name" :title="d.name">{{ d.name }}</td>
                  <td>{{ d.pages }}</td>
                  <td>{{ d.chars.toLocaleString() }}</td>
                  <td>
                    <label class="gqa__switch">
                      <input type="checkbox" :checked="d.approved" @change="toggle(d)" />
                      <span>{{ d.approved ? $t('已审批') : $t('未审批') }}</span>
                    </label>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <!-- 多轮问答 -->
      <section class="gqa__chat">
        <header class="gqa__chat-head">
          <div class="gqa__panel-title">
            <strong>{{ $t('知识问答') }}</strong>
            <small>{{ $t('自动识别提问语言并用同一语言作答；回答带来源，可以接着追问') }}</small>
          </div>
          <button class="btn ghost small" :disabled="!turns.length || asking" @click="turns = []">
            <i class="ri-add-line"></i>{{ $t('新对话') }}
          </button>
        </header>

        <div ref="listEl" class="gqa__messages">
          <div v-if="!turns.length" class="gqa__empty">
            <i class="ri-book-open-line"></i>
            <p>{{ $t('从下面的问题开始，或直接输入你的问题') }}</p>
          </div>

          <template v-for="turn in turns" :key="turn.id">
            <div class="gqa__msg user">
              <div class="gqa__bubble" dir="auto">{{ turn.question }}</div>
            </div>
            <div class="gqa__msg bot">
              <div v-if="turn.status === 'pending'" class="gqa__bubble muted">
                <i class="ri-loader-4-line spin"></i>{{ $t('检索并作答…') }}
              </div>
              <div v-else-if="turn.status === 'failed'" class="gqa__bubble failed">
                <i class="ri-error-warning-line"></i>{{ turn.error }}
              </div>
              <div v-else-if="turn.status === 'refused'" class="gqa__bubble refusal">
                <strong><i class="ri-shield-keyhole-line"></i>{{ reasonLabel(turn.reason) }}</strong>
                <p dir="auto">{{ turn.refusal }}</p>
              </div>
              <div v-else class="gqa__bubble">
                <div class="gqa__answer" dir="auto">{{ turn.answer }}</div>
                <div v-if="turn.citations.length" class="gqa__cites">
                  <span class="gqa__cites-label">{{ $t('来源') }}</span>
                  <span v-for="(c, i) in turn.citations" :key="i" class="gqa__cite" :title="c.snippet" dir="auto">
                    <i class="ri-file-text-line"></i>{{ c.docName }} · {{ $t('第 {n} 页', { n: c.page }) }}
                  </span>
                </div>
              </div>
            </div>
          </template>
        </div>

        <div class="gqa__samples">
          <span class="gqa__muted">{{ $t('试试：') }}</span>
          <button
            v-for="s in samples"
            :key="s.q"
            class="chip"
            :class="{ 'chip--boundary': !s.inScope, 'chip--ready': s.ready }"
            :title="s.inScope ? (s.ready ? $t('答案已就绪，点击立即显示') : '') : $t('这个问题不在资料范围内，用来看助手怎么拒答')"
            :disabled="asking"
            @click="send(s.q)"
          >{{ s.q }}</button>
        </div>

        <div class="gqa__composer">
          <textarea
            v-model="question"
            class="gqa__input"
            rows="2"
            dir="auto"
            :placeholder="$t('输入问题，Enter 发送，Shift+Enter 换行')"
            :disabled="asking"
            @keydown.enter.exact.prevent="send()"
          ></textarea>
          <button class="btn primary" :disabled="asking || !question.trim()" @click="send()">
            <i :class="asking ? 'ri-loader-4-line spin' : 'ri-send-plane-2-line'"></i>{{ $t('发送') }}
          </button>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * 受控知识问答工作台（知识问答助手）。
 *
 * 资料固定取自桌面的「宣教助手知识手册」文件夹，进页面自动同步；审批面板默认收起。
 * 问答是多轮的：每轮把之前的问答作为历史带给主进程，用于补全追问；回答语言跟提问语言走。
 *
 * 判定全在主进程 groundedQa.logic.ts，这里只做展示 —— 界面不能有任何
 * "要不要拒答"的分支，否则边界会散落两处各改一半。
 */
import { computed, nextTick, onMounted, onUnmounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { humanizeErrorMessage } from '../utils/humanize';
import PageBackButton from '../components/PageBackButton.vue';

const { t } = useI18n();

type Lang = 'zh' | 'en' | 'ar';
interface Doc { id: string; name: string; ext: string; pages: number; chars: number; approved: boolean; importedAt: number }
interface Citation { docName: string; page: number; snippet: string }
interface Turn {
  id: number;
  question: string;
  status: 'pending' | 'answered' | 'refused' | 'failed';
  answer?: string; refusal?: string; reason?: string; error?: string; lang?: Lang;
  citations: Citation[];
}

const docs = ref<Doc[]>([]);
const folder = ref<string | null>(null);
const syncing = ref(false);
const syncError = ref('');
/** 解析进度：仅在识别扫描件/整图页时才有值 */
const progress = ref<{ file: string; done: number; total: number } | null>(null);
const approveOpen = ref(false);

const turns = ref<Turn[]>([]);
const question = ref('');
const asking = ref(false);
const listEl = ref<HTMLElement | null>(null);
let seq = 0;

/**
 * 示例问题由主进程从**当前资料**算出来（换一批资料就换一批问题），拿不到就不显示。
 * 前 4 条能答（答案已在后台预取，点了秒回），最后 1 条故意问资料外的事，用来演示拒答。
 */
interface Sample { q: string; inScope: boolean; ready: boolean }
const samples = ref<Sample[]>([]);

const approvedCount = computed(() => docs.value.filter((d) => d.approved).length);

function api() { return (window as any).electronAPI?.workbenches?.groundedQa; }
const errText = (e: any) => humanizeErrorMessage(e, t('操作失败，请重试'));

function reasonLabel(r?: string): string {
  if (r === 'restricted') return t('权限不足');
  if (r === 'out_of_scope') return t('超出职责范围');
  return t('资料中无依据');
}

async function refresh(): Promise<void> {
  try {
    if (!api()?.list) throw new Error(t('知识问答接口不可用'));
    const r = await api().list();
    docs.value = r?.docs || [];
    folder.value = r?.folder ?? null;
    samples.value = r?.suggestions || [];
  } catch (e) {
    syncError.value = errText(e);
  }
}

/** 换文件夹：主进程弹系统目录选择框，选完立即同步一次并刷新列表 */
async function pickFolder(): Promise<void> {
  syncing.value = true;
  syncError.value = '';
  try {
    const r = await api().pickFolder();
    if (r && !r.canceled) {
      folder.value = r.folder ?? null;
      if (r.suggestions) samples.value = r.suggestions;
    }
  } catch (e) {
    syncError.value = errText(e);
  } finally {
    syncing.value = false;
    await refresh();
  }
}

async function syncHandbook(): Promise<void> {
  syncing.value = true;
  syncError.value = '';
  try {
    const r = await api().import();
    folder.value = r?.folder ?? null;
  } catch (e) {
    syncError.value = errText(e);
  } finally {
    syncing.value = false;
    await refresh();
  }
}

async function toggle(d: Doc): Promise<void> {
  try {
    // 只传基本类型拼出来的新对象：reactive Proxy 过 contextBridge 会报 could not be cloned
    await api().approve({ id: String(d.id), approved: !d.approved });
  } catch (e) {
    syncError.value = errText(e);
  }
  await refresh();
}

function scrollToBottom(): void {
  void nextTick(() => { if (listEl.value) listEl.value.scrollTop = listEl.value.scrollHeight; });
}

async function send(text?: string): Promise<void> {
  const q = (text ?? question.value).trim();
  if (!q || asking.value) return;
  // 历史只带已经有结论的轮次；失败的轮次对理解追问没有帮助
  const history = turns.value
    .filter((x) => x.status === 'answered' || x.status === 'refused')
    .map((x) => ({ question: String(x.question), ...(x.answer ? { answer: String(x.answer) } : {}) }));
  turns.value.push({ id: ++seq, question: q, status: 'pending', citations: [] });
  const turn = turns.value[turns.value.length - 1];
  question.value = '';
  asking.value = true;
  scrollToBottom();
  try {
    const r = await api().ask({ question: q, history });
    turn.lang = r.lang;
    turn.citations = r.citations || [];
    if (r.answered) {
      turn.status = 'answered';
      turn.answer = r.answer;
    } else {
      turn.status = 'refused';
      turn.refusal = r.refusal;
      turn.reason = r.reason;
    }
  } catch (e) {
    turn.status = 'failed';
    turn.error = errText(e);
  } finally {
    asking.value = false;
    scrollToBottom();
  }
}

let stopProgress: (() => void) | undefined;
let stopReady: (() => void) | undefined;

onMounted(async () => {
  stopProgress = api()?.onImportProgress?.((p: { file: string; done: number; total: number }) => { progress.value = p; });
  stopReady = api()?.onSuggestionsReady?.((p: { ready: string[] }) => {
    const ready = new Set(p.ready || []);
    samples.value = samples.value.map((s) => ({ ...s, ready: ready.has(s.q) }));
  });
  await refresh();
  await syncHandbook();
});

onUnmounted(() => { stopProgress?.(); stopReady?.(); });
</script>

<style scoped>
/* 外层 .page-wrap 是 overflow:hidden：路由页必须自己给滚动区，否则首屏以下的内容被裁掉看不到。
   内容铺满页面宽度，不做限宽居中。
   __inner 定高 = 视口高：审批面板收起时问答区刚好占满剩余高度、消息在区内滚动、输入框常驻底部；
   面板展开后问答区压到 min-height 为止，再多就由 .gqa 整页滚动。 */
.gqa { flex: 1; min-height: 0; overflow-y: auto; overscroll-behavior: contain; }
.gqa__inner { height: 100%; padding: 16px 24px 20px; box-sizing: border-box; display: flex; flex-direction: column; gap: 14px; }

/* 页头与其它行业工作台同一套：图标 + 眉题 + 标题 + 副标题，右侧「返回解决方案」+ 刷新 */
.workbench-header { display: flex; align-items: flex-start; justify-content: space-between; gap: 16px; flex-wrap: wrap; flex-shrink: 0; }
.heading { display: flex; gap: 14px; align-items: flex-start; min-width: 0; }
.heading-icon { width: 48px; height: 48px; border-radius: 14px; display: inline-flex; align-items: center; justify-content: center; background: color-mix(in srgb, var(--color-brand) 14%, transparent); color: var(--color-brand); font-size: 24px; flex: 0 0 auto; }
.eyebrow { margin: 0; font-size: 11px; font-weight: 800; letter-spacing: .08em; text-transform: uppercase; color: var(--color-text-secondary); }
.gqa__intro h1 { margin: 2px 0 4px; font-size: 22px; }
.gqa__intro .subtitle { margin: 0; color: var(--color-text-secondary); font-size: 13px; line-height: 1.6; max-width: 900px; }
.header-actions { display: flex; gap: 8px; align-items: center; }
.gqa__muted { color: var(--color-text-secondary); font-size: 12px; margin: 0; display: flex; align-items: center; gap: 6px; }
.gqa__error { color: var(--color-danger); font-size: 12.5px; margin: 0; display: flex; align-items: center; gap: 6px; }

.gqa__panel, .gqa__chat { border: 1px solid var(--color-border); border-radius: 14px; background: var(--color-bg-card); flex-shrink: 0; }
.gqa__panel-head { width: 100%; display: flex; align-items: center; gap: 10px; padding: 12px 14px; background: transparent; border: 0; color: inherit; font: inherit; text-align: start; cursor: pointer; border-radius: 14px; }
.gqa__panel-head:hover { background: var(--color-bg-hover); }
.gqa__arrow { font-size: 20px; color: var(--color-text-secondary); transition: transform .18s ease; flex-shrink: 0; }
.gqa__panel.open .gqa__arrow { transform: rotate(90deg); }
:global([dir="rtl"]) .gqa__panel:not(.open) .gqa__arrow { transform: rotate(180deg); }
.gqa__panel-title { display: grid; gap: 2px; min-width: 0; flex: 1; }
.gqa__panel-title strong { font-size: 14px; }
.gqa__panel-title small { color: var(--color-text-secondary); font-size: 12px; }
.gqa__badge { display: inline-flex; align-items: center; gap: 6px; font-size: 12px; padding: 3px 10px; border-radius: 999px; background: var(--color-bg-hover); color: var(--color-text-secondary); white-space: nowrap; }
.gqa__badge.ok { color: var(--color-success); background: color-mix(in srgb, var(--color-success) 10%, transparent); }
.gqa__badge.warn { color: var(--color-warning, #d08a20); background: color-mix(in srgb, var(--color-warning, #d08a20) 10%, transparent); }
.gqa__panel-body { padding: 0 14px 14px 44px; display: grid; gap: 10px; }

.gqa__folder { display: flex; align-items: center; gap: 8px; font-size: 12px; color: var(--color-text-secondary); flex-wrap: wrap; }
/* 路径可能很长：单行省略，完整值给 title */
.gqa__folder-path { max-width: min(560px, 60%); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; direction: ltr; }
.gqa__table-wrap { overflow-x: auto; }
.gqa__table { width: 100%; border-collapse: collapse; font-size: 13px; }
.gqa__table th { text-align: start; font-weight: 600; color: var(--color-text-secondary); font-size: 12px; padding: 6px 8px; border-bottom: 1px solid var(--color-border); }
.gqa__table td { padding: 8px; border-bottom: 1px solid var(--color-border); vertical-align: middle; }
/* 资料名吃掉剩余宽度（width:100% + max-width:0 让 ellipsis 在自动表格布局里生效），其余列按内容收紧 */
.gqa__table td, .gqa__table th { white-space: nowrap; }
.gqa__name { width: 100%; max-width: 0; min-width: 160px; overflow: hidden; text-overflow: ellipsis; }
.gqa__switch { display: inline-flex; align-items: center; gap: 6px; cursor: pointer; }

.gqa__chat { flex: 1 1 0; min-height: 460px; display: flex; flex-direction: column; overflow: hidden; }
.gqa__chat-head { display: flex; align-items: center; gap: 10px; padding: 12px 14px; border-bottom: 1px solid var(--color-border); }
.gqa__messages { flex: 1; min-height: 0; overflow-y: auto; overscroll-behavior: contain; padding: 14px; display: flex; flex-direction: column; gap: 10px; }
.gqa__empty { margin: auto; text-align: center; color: var(--color-text-secondary); font-size: 13px; }
.gqa__empty i { font-size: 30px; opacity: .5; }
.gqa__empty p { margin: 6px 0 0; }

.gqa__msg { display: flex; }
.gqa__msg.user { justify-content: flex-end; }
.gqa__bubble { max-width: min(760px, 85%); padding: 10px 14px; border-radius: 14px; font-size: 14px; line-height: 1.75; background: var(--color-bg-hover); overflow-wrap: anywhere; }
.gqa__msg.user .gqa__bubble { background: color-mix(in srgb, var(--color-brand) 12%, transparent); white-space: pre-wrap; }
.gqa__bubble.muted { color: var(--color-text-secondary); display: inline-flex; align-items: center; gap: 6px; }
.gqa__bubble.failed { color: var(--color-danger); display: inline-flex; align-items: center; gap: 6px; }
.gqa__bubble.refusal { border: 1px solid var(--color-warning, #d08a20); background: color-mix(in srgb, var(--color-warning, #d08a20) 8%, transparent); }
.gqa__bubble.refusal strong { display: flex; align-items: center; gap: 6px; font-size: 13px; margin-bottom: 2px; }
.gqa__bubble.refusal p { margin: 0; font-size: 13px; }
.gqa__answer { white-space: pre-wrap; }
.gqa__cites { margin-top: 8px; padding-top: 8px; border-top: 1px dashed var(--color-border); font-size: 12px; display: flex; flex-wrap: wrap; align-items: center; gap: 6px; }
.gqa__cites-label { color: var(--color-text-secondary); }
/* 悬停看原文片段 */
.gqa__cite { display: inline-flex; align-items: center; gap: 4px; padding: 2px 8px; border-radius: 999px; color: var(--color-brand); background: color-mix(in srgb, var(--color-brand) 8%, transparent); cursor: help; }

.gqa__samples { display: flex; gap: 8px; flex-wrap: wrap; align-items: center; padding: 10px 14px 0; border-top: 1px solid var(--color-border); }
.chip { border: 1px solid var(--color-border); background: transparent; color: var(--color-text-secondary); border-radius: 999px; padding: 4px 12px; font-size: 12px; cursor: pointer; }
.chip:hover:not(:disabled) { color: var(--color-text-primary); border-color: var(--color-brand); }
/* 最后一条是「资料外」的演示问题：虚线框区分开，别让人以为它答不上是出了故障 */
.chip--boundary { border-style: dashed; }
/* 答案已预取：左侧一个小绿点，点下去是秒回 */
.chip--ready::before { content: ''; width: 5px; height: 5px; border-radius: 50%; background: var(--color-success); display: inline-block; margin-inline-end: 5px; vertical-align: middle; }
.gqa__composer { display: flex; gap: 8px; align-items: flex-end; padding: 10px 14px 14px; }
.gqa__input { flex: 1; min-width: 0; resize: none; padding: 9px 12px; border: 1px solid var(--color-border); border-radius: 10px; background: var(--color-bg-input, transparent); color: inherit; font: inherit; font-size: 14px; line-height: 1.6; }

.spin { animation: gqa-spin 1s linear infinite; }
@keyframes gqa-spin { to { transform: rotate(360deg); } }
</style>
