<template>
  <div class="rdw" dir="ltr">
    <header class="rdw-top">
      <PageBackButton />
      <div class="rdw-title">{{ $t('研发工作流') }}</div>
      <div class="rdw-sub">{{ $t('客户需求 → AI 产品经理 → 开发 → 评审 → 测试 → 运维，逐节点真执行') }}</div>
    </header>

    <!-- ① 客户交付需求（表单，缺必填不放行） -->
    <section v-if="!running" class="rdw-intake">
      <h3>{{ $t('客户交付需求') }}</h3>
      <label class="rdw-field">
        <span>
          {{ $t('需求描述') }} <em>*</em>
          <button type="button" class="rdw-upload" :disabled="parsing" @click="uploadDoc">{{ parsing ? $t('解析中…') : $t('📎 上传文档解析') }}</button>
        </span>
        <textarea v-model="form.requirement" rows="5" :placeholder="$t('把你要做的产品/功能讲清楚：目标用户、要解决的问题、核心功能…（也可上传需求文档，自动解析填入）')"></textarea>
        <div v-if="attached.length" class="rdw-attached">
          <span v-for="(f, i) in attached" :key="i" class="rdw-chip" :class="{ warn: !!f.reason }" :title="f.reason || ''">
            📄 {{ f.name }}<template v-if="f.reason"> · {{ f.reason }}</template>
          </span>
        </div>
      </label>
      <div class="rdw-row">
        <label class="rdw-field">
          <span>{{ $t('开发类型') }} <em>*</em></span>
          <select v-model="form.devType">
            <option value="" disabled>{{ $t('请选择') }}</option>
            <option v-for="d in devTypes" :key="d.id" :value="d.id">{{ $t(d.label) }}</option>
          </select>
        </label>
        <label class="rdw-field">
          <span>{{ $t('项目名称') }}</span>
          <input v-model="form.projectName" :placeholder="$t('如 my-app（代码将落在产出地址下的此子目录）')" />
        </label>
      </div>
      <label class="rdw-field">
        <span>{{ $t('产出地址') }} <em>*</em></span>
        <div class="rdw-outdir">
          <input v-model="form.outputDir" readonly :placeholder="$t('必填：选择代码落地的文件夹，全部产出写入这里')" @click="pickOutputDir" />
          <button type="button" class="rdw-btn ghost" :disabled="pickingDir" @click="pickOutputDir">{{ pickingDir ? $t('选择中…') : $t('选择文件夹') }}</button>
        </div>
        <small v-if="form.outputDir" class="rdw-outdir-hint">{{ $t('代码将写入 {p0}', { p0: `${form.outputDir}/${form.projectName.trim() || 'rd-project'}/` }) }}</small>
      </label>
      <div class="rdw-row">
        <label class="rdw-field">
          <span>{{ $t('技术栈偏好（可选）') }}</span>
          <input v-model="form.techStack" :placeholder="techStackPlaceholder" />
        </label>
        <label class="rdw-field">
          <span>{{ $t('约束（截止/预算/合规，可选）') }}</span>
          <input v-model="form.constraints" :placeholder="$t('如 两周内 / 需过等保 / 预算有限')" />
        </label>
      </div>
      <p v-if="startError" class="rdw-err">{{ startError }}</p>
      <button class="rdw-start" :disabled="starting" @click="start">{{ starting ? $t('启动中…') : $t('开始研发') }}</button>
    </section>

    <!-- 产出历史：每跑一版就留一条记录 -->
    <section v-if="!running && rdHistory.length" class="rdw-history">
      <div class="rdw-history-head">
        <h3>{{ $t('产出历史') }}</h3>
        <span class="rdw-history-sub">{{ $t('每跑一版都会留一条记录，可打开产出目录或复用需求再来一版') }}</span>
      </div>
      <ul class="rdw-history-list">
        <li v-for="h in rdHistory" :key="h.id" class="rdw-history-item">
          <div class="rdw-history-main">
            <span class="rdw-history-name">{{ h.projectName || $t('研发工作流') }}</span>
            <span class="rdw-history-badge" :class="h.status">{{ historyStatusLabel(h.status) }}</span>
            <span v-if="h.devTypeLabel" class="rdw-history-type">{{ h.devTypeLabel }}</span>
            <span class="rdw-history-time">{{ historyTime(h.startedAt) }}</span>
          </div>
          <div class="rdw-history-dir" :title="h.projectDir">📁 {{ h.projectDir }}</div>
          <div v-if="h.requirement" class="rdw-history-req">{{ h.requirement }}</div>
          <div class="rdw-history-actions">
            <button class="rdw-btn primary" :disabled="chatBusy === h.projectDir" @click="goToChat(h.projectDir, h.projectName)">
              {{ chatBusy === h.projectDir ? $t('进入中…') : $t('去对话微调') }}
            </button>
            <button class="rdw-btn ghost" @click="openHistoryDir(h)">{{ $t('打开目录') }}</button>
            <button class="rdw-btn ghost" @click="reuseHistory(h)">{{ $t('用此需求再来一版') }}</button>
            <button class="rdw-btn ghost rdw-history-del" @click="removeHistory(h.id)">{{ $t('删除') }}</button>
          </div>
        </li>
      </ul>
    </section>

    <!-- 运行态：6 节点流水线 -->
    <section v-else class="rdw-run">
      <div class="rdw-run-head">
        <div>
          <b>{{ form.projectName || $t('研发工作流') }}</b>
          <span class="rdw-run-status" :class="runStatus">{{ runStatusLabel }}</span>
        </div>
        <div class="rdw-run-actions">
          <button v-if="projectDir && stateOf('dev').status === 'done'" class="rdw-btn primary" :disabled="chatBusy === projectDir" @click="goToChat(projectDir, form.projectName.trim() || 'rd-project')">
            {{ chatBusy === projectDir ? $t('进入中…') : $t('去对话微调') }}
          </button>
          <button v-if="projectDir" class="rdw-btn ghost" @click="openDir">{{ $t('打开项目目录') }}</button>
          <button v-if="runStatus === 'running' || runStatus === 'paused'" class="rdw-btn ghost" @click="cancel">{{ $t('取消') }}</button>
          <button v-else class="rdw-btn ghost" @click="reset">{{ $t('新建一次研发') }}</button>
        </div>
      </div>

      <!-- 某个节点很久没有任何动静（token / 工具 / 子代理进度都没有）：如实说「可能已超时」 -->
      <StepRunAlert
        v-if="runWatchdog.suspect.value"
        state="suspect"
        :elapsed-sec="runWatchdog.elapsedSec.value"
        :since-heartbeat-sec="runWatchdog.sinceHeartbeatSec.value"
        :retry-label="$t('中止运行')"
        @retry="cancel"
        @keep-waiting="runWatchdog.keepWaiting()"
      />
      <div class="rdw-nodes">
        <article v-for="n in nodeList" :key="n.id" class="rdw-node" :class="stateOf(n.id).status">
          <div class="rdw-node-head" @click="toggle(n.id)">
            <span class="rdw-dot" :class="stateOf(n.id).status"></span>
            <span class="rdw-node-name">{{ $t(n.name) }}</span>
            <span class="rdw-node-badge">{{ statusLabel(stateOf(n.id).status) }}</span>
            <span v-if="stateOf(n.id).status === 'running'" class="rdw-node-elapsed">⏱ {{ elapsedSec(n.id) }}s</span>
            <span class="rdw-node-metrics">
              <template v-if="stateOf(n.id).output.length">{{ stateOf(n.id).output.length }} {{ $t('字') }}</template>
              <template v-if="stateOf(n.id).files.length"> · 📄 {{ stateOf(n.id).files.length }} · +{{ addedLines(n.id) }} {{ $t('行') }}</template>
            </span>
          </div>
          <div class="rdw-node-duty">{{ $t(n.duty) }}</div>
          <!-- running 空窗期实时活动（填补 agent 首字延迟） -->
          <div v-if="stateOf(n.id).status === 'running'" class="rdw-node-activity">
            <span class="rdw-spin"></span>{{ stateOf(n.id).activity || $t('执行中…') }}
          </div>

          <!-- 人在环：该节点等待用户拍板/补料 -->
          <div v-if="stateOf(n.id).status === 'paused' && confirm && confirm.nodeId === n.id" class="rdw-confirm" :data-human-confirm="`${runId}:${confirm.nodeId}`">
            <div class="rdw-confirm-q">{{ confirm.question }}</div>
            <div v-if="confirm.detail" class="rdw-confirm-detail">{{ confirm.detail }}</div>
            <div v-if="confirm.options?.length" class="rdw-opts">
              <label v-for="(op, i) in confirm.options" :key="i" class="rdw-opt" :class="{ on: confirm.selected === op }">
                <input type="radio" :value="op" v-model="confirm.selected" /> {{ op }}
              </label>
            </div>
            <textarea v-model="confirm.reply" rows="2" :placeholder="$t('补充说明 / 自填你的方向（可选）')"></textarea>
            <div class="rdw-confirm-actions">
              <button class="rdw-btn primary" @click="respond(true)">{{ confirm.approveLabel || $t('继续') }}</button>
              <button class="rdw-btn ghost" @click="respond(false)">{{ confirm.rejectLabel || $t('打回重做') }}</button>
            </div>
          </div>

          <!-- 实时活动输出 -->
          <div v-if="!collapsed.has(n.id) && stateOf(n.id).output" class="rdw-node-output">{{ stateOf(n.id).output }}</div>

          <!-- 编辑了哪些文件（Codex 式 diff） -->
          <div v-if="!collapsed.has(n.id) && stateOf(n.id).files.length" class="rdw-node-changes">
            <FileDiffViewer v-for="(c, i) in stateOf(n.id).files" :key="i" :change="c" @open="openFile" />
          </div>
        </article>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { openPath } from '../workbenches/service-settlement/shared';
import { ref, reactive, computed, onBeforeUnmount } from 'vue';
import { useRouter } from 'vue-router';
import PageBackButton from '../components/PageBackButton.vue';
import StepRunAlert from '../components/StepRunAlert.vue';
import { useStepWatchdog } from '../composables/useStepWatchdog';
import FileDiffViewer, { type RdFileChange } from '../components/rd/FileDiffViewer.vue';
import { t as i18nT } from '../i18n';
import { RD_DEV_TYPES, RD_NODE_METAS, FIXED_RD_WORKFLOW_ID, buildRdWorkflow } from '../composables/rdWorkflow';

const api = () => (window as any).electronAPI;
const router = useRouter();
const devTypes = RD_DEV_TYPES;
// intake 节点是表单，引擎侧无事件；流水线状态只跟 5 个 AI 节点 + brainstorm 闸
const nodeList = RD_NODE_METAS.filter((n) => n.id !== 'intake');

const form = reactive({ requirement: '', projectName: '', devType: '', techStack: '', constraints: '', outputDir: '' });
const starting = ref(false);
const parsing = ref(false);
const pickingDir = ref(false);
const attached = ref<{ name: string; reason?: string }[]>([]);
const startError = ref('');
const running = ref(false);
const runId = ref('');
const runStatus = ref<'running' | 'paused' | 'done' | 'failed' | 'cancelled'>('running');
const projectDir = ref('');

// ── 产出历史：每跑一版就留一条记录（localStorage）——产出地址/项目名/开发类型/时间/状态，
//    支持一键打开目录、用此需求再来一版、删除。记录随运行事件更新终态。 ──────────────
type RdHistStatus = 'running' | 'paused' | 'done' | 'failed' | 'cancelled';
interface RdHistoryEntry {
  id: string;            // runId（拿到前用临时 uid，拿到后回填）
  projectName: string;
  outputDir: string;
  projectDir: string;
  requirement: string;   // 截断保存，仅用于展示与复用
  devTypeId: string;
  devTypeLabel: string;
  techStack: string;
  constraints: string;
  startedAt: number;
  status: RdHistStatus;
}
const RDW_HISTORY_KEY = 'rdw.history.v1';
const RDW_HISTORY_MAX = 30;
function loadHistory(): RdHistoryEntry[] {
  try { const raw = localStorage.getItem(RDW_HISTORY_KEY); const arr = raw ? JSON.parse(raw) : []; return Array.isArray(arr) ? arr : []; }
  catch { return []; }
}
const rdHistory = ref<RdHistoryEntry[]>(loadHistory());
let activeHistoryId = '';
function persistHistory() {
  try { localStorage.setItem(RDW_HISTORY_KEY, JSON.stringify(rdHistory.value.slice(0, RDW_HISTORY_MAX))); } catch { /* 忽略配额/隐私模式写失败 */ }
}
function pushHistory(entry: RdHistoryEntry) { rdHistory.value = [entry, ...rdHistory.value].slice(0, RDW_HISTORY_MAX); persistHistory(); }
function updateHistory(id: string, patch: Partial<RdHistoryEntry>) {
  if (!id) return;
  const i = rdHistory.value.findIndex((h) => h.id === id);
  if (i >= 0) { rdHistory.value[i] = { ...rdHistory.value[i], ...patch }; persistHistory(); }
}
// openPath 在 electronAPI.solution 命名空间下（全应用统一），之前错写成顶层 api().openPath → 恒 undefined → 按钮无反应。
async function openDirPath(p?: string) {
  if (!p) return;
  try {
    const r: any = await api().solution?.openPath?.(p);
    if (r && r.ok === false) startError.value = r.error || i18nT('打不开目录（可能还没生成，或已被移动）');
  } catch (e: any) { startError.value = e?.message || String(e); }
}
function openHistoryDir(h: RdHistoryEntry) { openDirPath(h.projectDir); }
function reuseHistory(h: RdHistoryEntry) {
  form.requirement = h.requirement || '';
  form.projectName = h.projectName || '';
  form.outputDir = h.outputDir || '';
  form.techStack = h.techStack || '';
  form.constraints = h.constraints || '';
  form.devType = h.devTypeId || '';
  startError.value = '';
  try { window.scrollTo({ top: 0, behavior: 'smooth' }); } catch { /* */ }
}
function removeHistory(id: string) { rdHistory.value = rdHistory.value.filter((h) => h.id !== id); persistHistory(); }
function historyTime(ts: number): string { try { return new Date(ts).toLocaleString(); } catch { return ''; } }
function historyStatusLabel(s: RdHistStatus): string {
  return { running: i18nT('执行中'), paused: i18nT('等待补充'), done: i18nT('已完成'), failed: i18nT('失败'), cancelled: i18nT('已取消') }[s] || s;
}

type NodeStatus = 'pending' | 'running' | 'paused' | 'done' | 'failed';
interface NodeState { status: NodeStatus; output: string; files: RdFileChange[]; startedAt?: number; activity?: string }
const states = reactive<Record<string, NodeState>>({});
const fresh = (): NodeState => ({ status: 'pending', output: '', files: [] });
for (const n of nodeList) states[n.id] = fresh();
states['brainstorm'] = fresh();
const stateOf = (id: string): NodeState => states[id] || fresh();

const collapsed = reactive(new Set<string>());
const toggle = (id: string) => { collapsed.has(id) ? collapsed.delete(id) : collapsed.add(id); };

// 实时活动：running 节点的计时 + 字数/文件/行数统计（让 agent 首字延迟的空窗期也能看到在动、写了多少）
const tick = ref(0);
let tickTimer: any = null;
function ensureTick() { if (!tickTimer) tickTimer = setInterval(() => { tick.value++; }, 1000); }
function stopTick() { if (tickTimer) { clearInterval(tickTimer); tickTimer = null; } }
function elapsedSec(id: string): number {
  const s = states[id]?.startedAt; if (!s) return 0;
  void tick.value; // 依赖 tick 触发重算
  return Math.max(0, Math.floor((Date.now() - s) / 1000));
}
/**
 * 看门狗：正在跑的节点多久没有任何动静（token / 工具调用 / 子代理进度都算心跳）。
 * 研发节点是 agent 循环，几分钟没输出就该让人知道「可能卡住了」，而不是只看秒表一直涨。
 */
const lastActivityAt = ref(0);
function touchActivity(): void { lastActivityAt.value = Date.now(); }
const runWatchdog = useStepWatchdog({
  running: () => running.value && runStatus.value === 'running',
  startedAt: () => {
    let latest = 0;
    for (const s of Object.values(states)) if (s.status === 'running' && s.startedAt && s.startedAt > latest) latest = s.startedAt;
    return latest || null;
  },
  kind: 'llm',
  lastProgressAt: () => lastActivityAt.value || null,
});
function addedLines(id: string): number {
  return (states[id]?.files || []).reduce((sum, f) => {
    if (f.action === 'write') return sum + (f.content ? f.content.split('\n').length : 0);
    if (f.action === 'patch') return sum + (f.newString ? f.newString.split('\n').length : (f.patchText ? f.patchText.split('\n').filter((l) => l.startsWith('+')).length : 0));
    return sum;
  }, 0);
}

const confirm = ref<null | { nodeId: string; question: string; detail?: string; options?: string[]; selected: string; reply: string; approveLabel?: string; rejectLabel?: string }>(null);
let currentNode = ''; // 当前运行节点（把 STREAM_TOOL_USE 文件改动归到它）
let offEvent: null | (() => void) = null;
let offTool: null | (() => void) = null;
let offSub: null | (() => void) = null;

const techStackPlaceholder = computed(() => {
  const d = devTypes.find((x) => x.id === form.devType);
  return d?.stackHint ? i18nT('留空则默认：') + d.stackHint : i18nT('如 React + TS / FastAPI …');
});

const runStatusLabel = computed(() => ({ running: i18nT('执行中'), paused: i18nT('等待补充'), done: i18nT('已完成'), failed: i18nT('失败'), cancelled: i18nT('已取消') }[runStatus.value]));
function statusLabel(s: NodeStatus): string {
  return { pending: i18nT('待执行'), running: i18nT('执行中'), paused: i18nT('等待补充'), done: i18nT('已完成'), failed: i18nT('失败') }[s];
}

async function uploadDoc() {
  if (parsing.value) return;
  parsing.value = true;
  try {
    const r = await api().rdParseDoc();
    if (r?.canceled) return;
    if (!r?.ok) { startError.value = r?.message || i18nT('解析失败'); return; }
    attached.value = (r.files || []).map((f: any) => ({ name: f.name, reason: f.reason }));
    if (r.combinedText) {
      form.requirement = (form.requirement.trim() ? form.requirement.trim() + '\n\n' : '') + r.combinedText;
    }
    startError.value = '';
  } catch (e: any) {
    startError.value = e?.message || String(e);
  } finally {
    parsing.value = false;
  }
}

async function pickOutputDir() {
  if (pickingDir.value) return;
  pickingDir.value = true;
  try {
    const r = await api().rdPickOutputDir?.();
    if (r?.canceled) return;
    if (!r?.ok) { startError.value = r?.message || i18nT('选择产出地址失败'); return; }
    if (r.dir) { form.outputDir = r.dir; startError.value = ''; }
  } catch (e: any) {
    startError.value = e?.message || String(e);
  } finally {
    pickingDir.value = false;
  }
}

async function start() {
  startError.value = '';
  if (!form.requirement.trim()) { startError.value = i18nT('请填写需求描述'); return; }
  if (!form.devType) { startError.value = i18nT('请选择开发类型'); return; }
  if (!form.outputDir.trim()) { startError.value = i18nT('请先选择产出地址（代码落地目录），否则无法开始研发'); return; }
  starting.value = true;
  try {
    const devTypeLabel = devTypes.find((d) => d.id === form.devType)?.label || form.devType;
    const projName = form.projectName.trim() || 'rd-project';
    const outDir = form.outputDir.trim();
    const wf = buildRdWorkflow({
      requirement: form.requirement.trim(),
      projectName: projName,
      devType: i18nT(devTypeLabel),
      techStack: form.techStack.trim() || (devTypes.find((d) => d.id === form.devType)?.stackHint || ''),
      constraints: form.constraints.trim() || i18nT('（无特殊约束）'),
      outputDir: outDir,
    });
    await api().saveWorkflow(wf);
    // 订阅事件后再启动，避免 run:started 漏收
    subscribe();
    running.value = true;
    runStatus.value = 'running';
    // 产出目录已知，直接把「打开项目目录」指向它（无需等产物台账反推）
    projectDir.value = `${outDir}/${projName}`;
    // 立刻留一条产出历史（先用临时 id，拿到 runId 后回填），做出来一版就有记录
    activeHistoryId = `local_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    pushHistory({
      id: activeHistoryId, projectName: projName, outputDir: outDir, projectDir: projectDir.value,
      requirement: form.requirement.trim().slice(0, 400),
      devTypeId: form.devType, devTypeLabel: i18nT(devTypeLabel),
      techStack: form.techStack.trim(), constraints: form.constraints.trim(),
      startedAt: Date.now(), status: 'running',
    });
    states['pm'] && (states['pm'].status = 'running');
    currentNode = 'pm';
    const res = await api().runWorkflow({ workflowId: FIXED_RD_WORKFLOW_ID, input: {
      requirement: form.requirement.trim(), projectName: projName,
      devType: i18nT(devTypeLabel), techStack: form.techStack.trim() || (devTypes.find((d) => d.id === form.devType)?.stackHint || ''),
      constraints: form.constraints.trim() || i18nT('（无特殊约束）'),
      outputDir: outDir,
    } });
    // runWorkflow 返回的是 WorkflowRun，其 id 字段是 run.id（不是 runId）——这就是本 run 的权威 id。
    // 兜底：万一没拿到，就从缓冲事件里取第一个带 runId 的（极端情况防 UI 永远空白）。
    const newRunId: string = res?.runId || res?.id || pendingEvents.find((e) => e.runId)?.runId || '';
    if (newRunId) {
      updateHistory(activeHistoryId, { id: newRunId }); activeHistoryId = newRunId; runId.value = newRunId;
      // 回放缓冲期事件：只回放属于本 run 的（runId 匹配或早期无 runId 的），别的 run 全丢
      const buf = pendingEvents; pendingEvents = [];
      for (const e of buf) { if (!e.runId || e.runId === newRunId) handleEvent(e); }
    }
  } catch (e: any) {
    startError.value = e?.message || String(e);
    running.value = false;
    unsubscribe();
  } finally {
    starting.value = false;
  }
}

function subscribe() {
  unsubscribe();
  offEvent = api().onWorkflowEvent((ev: any) => onEvent(ev));
  offTool = api().onStreamToolUse((ev: any) => onToolUse(ev));
  offSub = api().onStreamSubagentProgress?.((ev: any) => onSub(ev)) || null;
  ensureTick();
}
function unsubscribe() {
  try { offEvent?.(); } catch { /* */ } try { offTool?.(); } catch { /* */ } try { offSub?.(); } catch { /* */ }
  offEvent = offTool = offSub = null;
  stopTick();
}

// subagent 进度：把 agent 正在做的事（思考/工具）作为 running 节点的实时活动预览，填补首字延迟空窗
function onSub(ev: any) {
  if (ev?.runId && runId.value && ev.runId !== runId.value) return; // 隔离：非本 run 的子代理进度丢弃
  const node = states[(ev?.nodeId as string) || currentNode];
  if (!node || node.status !== 'running') return;
  touchActivity();
  const kind = ev?.kind === 'tool_use' ? i18nT('调用工具') : ev?.kind === 'nested_summary' ? i18nT('小结') : i18nT('思考');
  const preview = String(ev?.toolName || ev?.preview || '').slice(0, 80);
  node.activity = preview ? `${kind}：${preview}` : kind;
}

// 缓冲区：runWorkflow 尚未返回、本 run 的 runId 未知时先攒着；拿到 runId 后只回放本 run 的事件。
let pendingEvents: any[] = [];
function onEvent(ev: any) {
  if (!ev) return;
  // 严格 runId 隔离：runId 未知先缓冲；已知后别的 run 的事件一律丢弃，杜绝两个并发 run 状态串台、
  // 以及上一轮已取消 run 的尾流冲掉本 run 已返回的结果（用户实测：评审节点显示别的 run 的输出）。
  if (!runId.value) {
    pendingEvents.push(ev);
    if (pendingEvents.length > 800) pendingEvents.shift();
    return;
  }
  if (ev.runId && ev.runId !== runId.value) return;
  handleEvent(ev);
}
function handleEvent(ev: any) {
  const nid = ev.nodeId as string | undefined;
  touchActivity();
  switch (ev.kind) {
    case 'run:started': runStatus.value = 'running'; break;
    case 'node:entered':
      if (nid && states[nid]) { states[nid].status = 'running'; states[nid].startedAt = Date.now(); states[nid].activity = i18nT('启动中…'); currentNode = nid; ensureTick(); }
      break;
    case 'node:token':
      if (nid && states[nid]) { states[nid].output += String(ev.delta ?? ev.result ?? ''); states[nid].activity = i18nT('生成中…'); }
      break;
    case 'node:completed':
      if (nid && states[nid]) { states[nid].status = 'done'; states[nid].activity = undefined; if (ev.result != null) states[nid].output = String(ev.result); }
      break;
    case 'node:failed':
      if (nid && states[nid]) { states[nid].status = 'failed'; states[nid].activity = undefined; states[nid].output = String(ev.error || i18nT('执行失败')); }
      break;
    case 'node:rerun':
      if (nid && states[nid]) states[nid].status = 'running';
      break;
    case 'node:waiting_human':
      runStatus.value = 'paused';
      updateHistory(activeHistoryId, { status: 'paused' });
      if (nid && states[nid]) states[nid].status = 'paused';
      confirm.value = {
        nodeId: nid || 'brainstorm',
        question: ev.question || i18nT('需要你确认/补充后继续'),
        detail: ev.confirmationDetail,
        options: ev.confirmationOptions || [],
        selected: '', reply: '',
        approveLabel: ev.confirmationApproveLabel, rejectLabel: ev.confirmationRejectLabel,
      };
      break;
    case 'human-confirm-resolved':
      // 别处（全局待办 / IM）通过、退回，或取消、失效：本页确认收起，与本页 respond() 后的状态一致
      if (nid && confirm.value?.nodeId === nid) {
        confirm.value = null;
        runStatus.value = 'running';
        updateHistory(activeHistoryId, { status: 'running' });
        if (states[nid]?.status === 'paused') states[nid].status = 'running';
      }
      break;
    case 'run:completed': runStatus.value = 'done'; updateHistory(activeHistoryId, { status: 'done' }); loadArtifacts(); break;
    case 'run:failed': runStatus.value = 'failed'; updateHistory(activeHistoryId, { status: 'failed' }); break;
    case 'run:cancelled': runStatus.value = 'cancelled'; updateHistory(activeHistoryId, { status: 'cancelled' }); break;
  }
}

// STREAM_TOOL_USE：把 agent 文件工具的改动归到本 run 的对应节点（仅 wf_ 会话，避免与聊天串台）
function onToolUse(ev: any) {
  if (!ev || typeof ev.sessionId !== 'string' || !ev.sessionId.startsWith('wf_')) return;
  // 隔离：非本 run 的工具事件一律丢弃（主进程已给事件带上 runId）；并优先按事件自带 nodeId 归属，
  // 不再依赖全局 currentNode（两个 run 交错时 currentNode 会被别的 run 翻掉，导致文件改动记错节点）。
  if (ev.runId && runId.value && ev.runId !== runId.value) return;
  touchActivity();
  const ti = ev.toolInput || {};
  const path = ti.path || ti.file_path || ti.filePath;
  if (!path) return;
  const node = states[(ev.nodeId as string) || currentNode];
  if (!node) return;
  const name = String(ev.toolName || '');
  const short = String(path).split('/').pop();
  if (/write_file|create_file|write/i.test(name)) {
    node.files.push({ path, action: 'write', content: ti.content ?? ti.text });
    node.activity = i18nT('写入 {p0}', { p0: short });
  } else if (/patch|edit|apply_patch|replace/i.test(name)) {
    node.files.push({ path, action: 'patch', patchText: ti.patch, oldString: ti.old_string ?? ti.oldString, newString: ti.new_string ?? ti.newString });
    node.activity = i18nT('修改 {p0}', { p0: short });
  } else if (/read_file|read/i.test(name)) {
    node.activity = i18nT('读取 {p0}', { p0: short });
  }
  if (!projectDir.value && typeof path === 'string' && !path.startsWith('/')) {
    // 相对路径落在默认工作目录；具体绝对路径由「打开项目目录」用产物台账拿
  }
}

async function respond(approved: boolean) {
  const c = confirm.value; if (!c || !runId.value) return;
  try {
    await api().respondWorkflowHumanConfirm({ runId: runId.value, nodeId: c.nodeId, approved, reply: c.reply || undefined, selectedOption: c.selected || undefined });
    runStatus.value = 'running';
    updateHistory(activeHistoryId, { status: 'running' });
    if (states[c.nodeId]) states[c.nodeId].status = approved ? 'done' : 'running';
    confirm.value = null;
  } catch (e: any) {
    startError.value = e?.message || String(e);
  }
}

async function loadArtifacts() {
  try {
    const r = await api().getRunArtifacts?.({ runId: runId.value });
    const first = r?.deliverables?.[0]?.path || r?.changes?.[0]?.target;
    // 已用「产出地址」设了绝对目录时不覆盖（产物路径可能是相对的，覆盖会让「打开项目目录」失效）；
    // 仅在还没有目录时用产物路径兜底。
    if (first && !projectDir.value) projectDir.value = first;
  } catch { /* */ }
}
function openDir() { openDirPath(projectDir.value); }

// 去对话微调：把产出目录接进对话——登记成工作空间 → 建单聊(AI 开发工程师) → 绑工作空间(agent 的 cwd 落这里，可直接读改代码) → 跳进对话。
const chatBusy = ref('');
async function goToChat(dir?: string, projName?: string): Promise<void> {
  const d = (dir || '').trim();
  if (!d || chatBusy.value) return;
  chatBusy.value = d;
  startError.value = '';
  try {
    const a = api();
    const reg = await a.workFolder?.register?.({ name: projName || 'rd-project', path: d });
    const folderId = reg?.folder?.id;
    const conv = await a.conversation?.create?.({ kind: 'single', members: ['ai-dev'], title: i18nT('微调：{p0}', { p0: projName || 'rd-project' }) });
    const convId = conv?.id;
    if (!convId) { startError.value = i18nT('进入对话失败，请重试'); return; }
    if (folderId) { try { await a.conversation?.setWorkFolder?.(convId, folderId); } catch { /* 绑定失败不致命，对话仍能开，只是 cwd 落默认目录 */ } }
    if (conv?.navigateTo) router.push(conv.navigateTo);
    else router.push({ path: '/conversations', query: { id: convId } });
  } catch (e: any) {
    startError.value = e?.message || String(e);
  } finally {
    chatBusy.value = '';
  }
}
async function openFile(path: string) {
  if (!path) return;
  openPath(path, true);
}

async function cancel() {
  if (!runId.value) return;
  try {
    if (!api()?.cancelWorkflowRun) throw new Error(i18nT('取消接口不可用'));
    const result = await api().cancelWorkflowRun({ runId: runId.value });
    if (!result?.ok || result.accepted === false) throw new Error(result?.error || i18nT('运行已结束，未执行取消'));
    runStatus.value = 'cancelled';
    confirm.value = null;
    updateHistory(activeHistoryId, { status: 'cancelled' });
  } catch (e: any) { startError.value = e?.message || String(e); }
}
function reset() {
  unsubscribe();
  running.value = false; runId.value = ''; currentNode = ''; confirm.value = null; projectDir.value = ''; attached.value = [];
  pendingEvents = []; activeHistoryId = '';
  for (const k of Object.keys(states)) states[k] = fresh();
}

onBeforeUnmount(unsubscribe);
</script>

<style scoped>
.rdw {
  --rdw-surface: var(--color-bg-card);
  --rdw-surface-raised: var(--color-bg-elevated);
  --rdw-surface-soft: var(--color-bg-input);
  --rdw-hover: var(--color-bg-hover);
  --rdw-text: var(--color-text-primary);
  --rdw-text-soft: var(--color-text-secondary);
  --rdw-text-muted: var(--color-text-muted);
  --rdw-border: var(--color-border);
  --rdw-divider: var(--color-divider);
  --rdw-accent: var(--color-brand);
  --rdw-accent-strong: var(--color-brand-hover);
  --rdw-accent-soft: var(--color-brand-subtle);

  /* FileDiffViewer 仍使用旧变量，在当前工作台内映射到正式主题 token。 */
  --panel-bg: var(--rdw-surface);
  --input-bg: var(--rdw-surface-soft);
  --subtle-bg: var(--rdw-surface-soft);
  --code-bg: var(--color-bg-primary);
  --border-color: var(--rdw-border);
  --text-primary: var(--rdw-text);
  --text-secondary: var(--rdw-text-soft);
  --text-tertiary: var(--rdw-text-muted);
  --accent: var(--rdw-accent);

  position: relative;
  isolation: isolate;
  width: 100%;
  /* 滚动容器占满宽度 —— 滚动条落在窗口右缘，而不是悬在 1180px 居中框右侧的留白里（那样很怪）。
     内容改由下面三个直接子元素各自 max-width:1180px + 居中。 */
  max-width: none;
  height: 100%;
  min-width: 0;
  min-height: 0;
  margin: 0 auto;
  padding: clamp(22px, 3vw, 36px) clamp(18px, 3.4vw, 42px) 72px;
  overflow-x: hidden;
  overflow-y: auto;
  overscroll-behavior: contain;
  color: var(--rdw-text);
  scrollbar-gutter: stable;
}
/* 内容整体居中（最大 1180px），与全宽滚动容器解耦，让滚动条回到窗口右缘。 */
.rdw-top,
.rdw-intake,
.rdw-history,
.rdw-run { width: 100%; max-width: 1180px; margin-inline: auto; }
.rdw::before {
  content: '';
  position: absolute;
  z-index: -1;
  top: -210px;
  right: -220px;
  width: 620px;
  height: 620px;
  pointer-events: none;
  border-radius: 50%;
  background: radial-gradient(circle, color-mix(in srgb, var(--color-brand-secondary) 13%, transparent), transparent 68%);
}

/* 页头：与 TotalClaw 紫青品牌主题一致 */
.rdw-top {
  position: relative;
  overflow: hidden;
  margin-bottom: 20px;
  padding: 22px 26px 25px;
  border: 1px solid color-mix(in srgb, var(--rdw-accent) 22%, var(--rdw-border));
  border-radius: var(--radius-xl, 20px);
  background:
    linear-gradient(125deg, color-mix(in srgb, var(--rdw-accent-soft) 78%, var(--rdw-surface)) 0%, var(--rdw-surface) 54%, color-mix(in srgb, var(--color-brand-secondary) 8%, var(--rdw-surface)) 100%);
  box-shadow: var(--shadow-md);
}
.rdw-top::before {
  content: '';
  position: absolute;
  top: -100px;
  right: -55px;
  width: 260px;
  height: 260px;
  pointer-events: none;
  border: 44px solid color-mix(in srgb, var(--rdw-accent) 7%, transparent);
  border-radius: 50%;
}
.rdw-top::after {
  content: '';
  position: absolute;
  right: 26px;
  bottom: 0;
  left: 26px;
  height: 1px;
  pointer-events: none;
  background: linear-gradient(90deg, var(--rdw-accent), color-mix(in srgb, var(--color-brand-secondary) 72%, transparent), transparent 82%);
  opacity: .52;
}
/* 浮在渐变 hero 上：只调配色，尺寸与全站统一 */
.rdw-top :deep(.page-back) {
  position: relative;
  z-index: 1;
  --page-back-border: color-mix(in srgb, var(--rdw-accent) 20%, var(--rdw-border));
  --page-back-bg: color-mix(in srgb, var(--rdw-surface-raised) 86%, transparent);
  box-shadow: var(--shadow-sm);
}
.rdw-title {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  gap: 11px;
  margin-top: 24px;
  color: var(--rdw-text);
  font-size: clamp(25px, 2.4vw, 31px);
  font-weight: 780;
  line-height: 1.16;
  letter-spacing: -.035em;
}
.rdw-title::before {
  content: '';
  width: 12px;
  height: 12px;
  flex: 0 0 auto;
  border-radius: 4px;
  background: var(--gradient-brand);
  box-shadow: 0 0 0 6px var(--rdw-accent-soft), 0 7px 20px var(--color-brand-glow);
}
.rdw-sub {
  position: relative;
  z-index: 1;
  max-width: 820px;
  margin-top: 8px;
  color: var(--rdw-text-soft);
  font-size: 13.5px;
  line-height: 1.68;
}

/* 需求录入 */
.rdw-intake {
  display: grid;
  min-width: 0;
  padding: 24px 26px 26px;
  border: 1px solid var(--rdw-border);
  border-radius: 18px;
  background: color-mix(in srgb, var(--rdw-surface) 97%, transparent);
  box-shadow: var(--shadow-sm);
}
.rdw-intake h3 {
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 0 0 20px;
  padding-bottom: 16px;
  border-bottom: 1px solid var(--rdw-divider);
  color: var(--rdw-text);
  font-size: 17px;
  font-weight: 720;
}
.rdw-intake h3::before {
  content: '01';
  display: inline-grid;
  width: 30px;
  height: 30px;
  place-items: center;
  border-radius: 9px;
  color: var(--rdw-accent);
  background: var(--rdw-accent-soft);
  font-family: var(--font-mono);
  font-size: 10px;
  font-weight: 800;
  letter-spacing: .06em;
}
.rdw-field {
  min-width: 0;
  margin-bottom: 17px;
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 7px;
}
.rdw-field > span {
  color: var(--rdw-text-soft);
  font-size: 12px;
  font-weight: 650;
  letter-spacing: .01em;
}
.rdw-field em { color: var(--color-danger); font-style: normal; }
.rdw-field textarea,
.rdw-field input,
.rdw-field select,
.rdw-confirm textarea {
  width: 100%;
  border: 1px solid var(--rdw-border);
  border-radius: 11px;
  outline: none;
  background: var(--rdw-surface-soft);
  color: var(--rdw-text);
  font-family: inherit;
  font-size: 13px;
  transition: border-color .18s ease, box-shadow .18s ease, background .18s ease;
}
.rdw-field input,
.rdw-field select { min-height: 44px; padding: 9px 12px; }
.rdw-field textarea { min-height: 138px; padding: 11px 12px; line-height: 1.65; resize: vertical; }
.rdw-field textarea:hover,
.rdw-field input:hover,
.rdw-field select:hover,
.rdw-confirm textarea:hover { border-color: color-mix(in srgb, var(--rdw-accent) 30%, var(--rdw-border)); }
.rdw-field textarea:focus,
.rdw-field input:focus,
.rdw-field select:focus,
.rdw-confirm textarea:focus {
  border-color: var(--rdw-accent);
  background: var(--rdw-surface-raised);
  box-shadow: 0 0 0 3px var(--rdw-accent-soft);
}
.rdw-field :is(input, textarea)::placeholder,
.rdw-confirm textarea::placeholder { color: var(--rdw-text-muted); opacity: .78; }
.rdw-row {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
}
.rdw-upload {
  margin-left: 10px;
  font-size: 11px;
  padding: 2px 9px;
  border: 1px solid var(--rdw-border);
  border-radius: 6px;
  background: var(--rdw-surface);
  color: var(--color-accent, #2f6fed);
  cursor: pointer;
  font-weight: 500;
}
.rdw-upload:disabled { opacity: .55; cursor: default; }
.rdw-outdir { display: flex; gap: 10px; align-items: stretch; }
.rdw-outdir input { flex: 1; cursor: pointer; }
.rdw-outdir .rdw-btn { flex-shrink: 0; white-space: nowrap; }
.rdw-outdir-hint { margin-top: 6px; font-size: 12px; color: var(--color-text-secondary); word-break: break-all; }
.rdw-attached { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 8px; }
.rdw-chip {
  font-size: 11px;
  padding: 3px 9px;
  border-radius: 6px;
  border: 1px solid var(--rdw-border);
  background: var(--rdw-surface);
  color: var(--color-text-secondary, #5b6472);
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.rdw-chip.warn { color: var(--color-status-warn-fg, #8a6100); background: color-mix(in srgb, var(--color-status-warn-bg, #fdf1d6) 70%, var(--rdw-surface)); }
.rdw-err {
  margin: 0 0 14px;
  padding: 10px 12px;
  border: 1px solid color-mix(in srgb, var(--color-danger) 28%, var(--rdw-border));
  border-radius: 10px;
  color: var(--color-status-danger-fg);
  background: color-mix(in srgb, var(--color-status-danger-bg) 76%, var(--rdw-surface));
  font-size: 12.5px;
  line-height: 1.55;
}
.rdw-start {
  min-width: 148px;
  min-height: 46px;
  justify-self: end;
  padding: 10px 24px;
  border: 0;
  border-radius: 11px;
  color: #fff;
  background: var(--gradient-brand);
  box-shadow: 0 10px 26px var(--color-brand-glow);
  font-size: 13.5px;
  font-weight: 720;
  cursor: pointer;
  transition: transform .18s ease, box-shadow .18s ease, filter .18s ease;
}
.rdw-start:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 14px 32px var(--color-brand-glow); filter: saturate(1.08); }
.rdw-start:active:not(:disabled) { transform: translateY(0); }
.rdw-start:disabled { cursor: default; opacity: .52; box-shadow: none; filter: saturate(.7); }

/* 产出历史 */
.rdw-history {
  margin-top: 18px;
  padding: 20px 22px 22px;
  border: 1px solid var(--rdw-border);
  border-radius: 18px;
  background: color-mix(in srgb, var(--rdw-surface) 97%, transparent);
  box-shadow: var(--shadow-sm);
}
.rdw-history-head { display: flex; align-items: baseline; gap: 12px; flex-wrap: wrap; margin-bottom: 14px; padding-bottom: 12px; border-bottom: 1px solid var(--rdw-divider); }
.rdw-history-head h3 { margin: 0; color: var(--rdw-text); font-size: 15.5px; font-weight: 720; }
.rdw-history-sub { color: var(--rdw-text-muted); font-size: 12px; }
.rdw-history-list { list-style: none; margin: 0; padding: 0; display: grid; gap: 11px; }
.rdw-history-item {
  min-width: 0;
  padding: 13px 15px;
  border: 1px solid var(--rdw-border);
  border-radius: 13px;
  background: var(--rdw-surface-soft);
  transition: border-color .16s ease, box-shadow .16s ease;
}
.rdw-history-item:hover { border-color: color-mix(in srgb, var(--rdw-accent) 28%, var(--rdw-border)); box-shadow: var(--shadow-sm); }
.rdw-history-main { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
.rdw-history-name { color: var(--rdw-text); font-size: 13.5px; font-weight: 700; }
.rdw-history-badge { padding: 2px 9px; border-radius: 999px; font-size: 10.5px; font-weight: 650; border: 1px solid transparent; }
.rdw-history-badge.running { color: var(--rdw-accent); background: var(--rdw-accent-soft); }
.rdw-history-badge.paused { color: var(--color-status-warning-fg); background: var(--color-status-warning-bg); }
.rdw-history-badge.done { color: var(--color-status-success-fg); background: var(--color-status-success-bg); }
.rdw-history-badge.failed { color: var(--color-status-danger-fg); background: var(--color-status-danger-bg); }
.rdw-history-badge.cancelled { color: var(--rdw-text-soft); background: var(--rdw-surface-raised); border-color: var(--rdw-border); }
.rdw-history-type { color: var(--rdw-text-soft); font-size: 11.5px; }
.rdw-history-time { margin-left: auto; color: var(--rdw-text-muted); font-size: 11px; font-variant-numeric: tabular-nums; white-space: nowrap; }
.rdw-history-dir { margin-top: 7px; color: var(--rdw-text-soft); font-size: 11.5px; word-break: break-all; }
.rdw-history-req { margin-top: 5px; color: var(--rdw-text-muted); font-size: 12px; line-height: 1.5; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
.rdw-history-actions { margin-top: 11px; display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
.rdw-history-actions .rdw-btn { min-height: 32px; padding: 5px 12px; }
.rdw-history-del { color: var(--color-status-danger-fg) !important; }
.rdw-history-del:hover { border-color: color-mix(in srgb, var(--color-danger) 45%, var(--rdw-border)) !important; background: color-mix(in srgb, var(--color-status-danger-bg) 60%, var(--rdw-surface)) !important; }

/* 运行摘要 */
.rdw-run { display: grid; gap: 16px; min-width: 0; }
.rdw-run-head {
  position: sticky;
  z-index: 8;
  top: 0;
  margin: 0;
  padding: 15px 17px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  border: 1px solid var(--surface-stroke);
  border-radius: 16px;
  background: var(--surface-glass);
  box-shadow: var(--shadow-md);
  backdrop-filter: blur(16px) saturate(135%);
  -webkit-backdrop-filter: blur(16px) saturate(135%);
}
.rdw-run-head > div:first-child { min-width: 0; display: flex; align-items: center; gap: 9px; flex-wrap: wrap; }
.rdw-run-head b { overflow: hidden; color: var(--rdw-text); font-size: 16px; font-weight: 740; text-overflow: ellipsis; white-space: nowrap; }
.rdw-run-status {
  margin: 0;
  padding: 4px 10px;
  display: inline-flex;
  align-items: center;
  border: 1px solid transparent;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 680;
  line-height: 1.4;
}
.rdw-run-status.running { color: var(--rdw-accent); background: var(--rdw-accent-soft); border-color: color-mix(in srgb, var(--rdw-accent) 18%, transparent); }
.rdw-run-status.paused { color: var(--color-status-warning-fg); background: var(--color-status-warning-bg); border-color: color-mix(in srgb, var(--color-warning) 22%, transparent); }
.rdw-run-status.done { color: var(--color-status-success-fg); background: var(--color-status-success-bg); border-color: color-mix(in srgb, var(--color-success) 22%, transparent); }
.rdw-run-status.failed { color: var(--color-status-danger-fg); background: var(--color-status-danger-bg); border-color: color-mix(in srgb, var(--color-danger) 22%, transparent); }
.rdw-run-status.cancelled { color: var(--rdw-text-soft); background: var(--rdw-surface-soft); border-color: var(--rdw-border); }
.rdw-run-actions { display: flex; align-items: center; justify-content: flex-end; gap: 8px; flex-wrap: wrap; }
.rdw-btn {
  min-height: 38px;
  margin: 0;
  padding: 7px 14px;
  border: 1px solid transparent;
  border-radius: 9px;
  font-size: 12px;
  font-weight: 650;
  cursor: pointer;
  transition: border-color .16s ease, color .16s ease, background .16s ease, transform .16s ease;
}
.rdw-btn:hover:not(:disabled) { transform: translateY(-1px); }
.rdw-btn.primary { color: #fff; background: var(--gradient-brand); box-shadow: 0 8px 20px var(--color-brand-glow); }
.rdw-btn.ghost { margin: 0; color: var(--rdw-text-soft); background: var(--rdw-surface-raised); border-color: var(--rdw-border); }
.rdw-btn.ghost:hover { color: var(--rdw-accent); border-color: color-mix(in srgb, var(--rdw-accent) 45%, var(--rdw-border)); background: var(--rdw-accent-soft); }

/* 节点时间线 */
.rdw-nodes {
  counter-reset: rdw-step;
  min-width: 0;
  display: grid;
  gap: 14px;
}
.rdw-node {
  position: relative;
  min-width: 0;
  padding: 17px 18px 17px 68px;
  border: 1px solid var(--rdw-border);
  border-radius: 15px;
  background: color-mix(in srgb, var(--rdw-surface) 97%, transparent);
  box-shadow: var(--shadow-sm);
  counter-increment: rdw-step;
  transition: border-color .2s ease, box-shadow .2s ease, background .2s ease, transform .2s ease;
}
.rdw-node::before {
  content: counter(rdw-step, decimal-leading-zero);
  position: absolute;
  top: 15px;
  left: 17px;
  width: 36px;
  height: 36px;
  display: grid;
  place-items: center;
  border: 1px solid var(--rdw-border);
  border-radius: 11px;
  color: var(--rdw-text-muted);
  background: var(--rdw-surface-soft);
  font-family: var(--font-mono);
  font-size: 10px;
  font-weight: 800;
  letter-spacing: .05em;
}
.rdw-node:not(:last-child)::after {
  content: '';
  position: absolute;
  top: 100%;
  left: 34px;
  width: 2px;
  height: 15px;
  pointer-events: none;
  background: linear-gradient(var(--rdw-border), color-mix(in srgb, var(--rdw-accent) 28%, var(--rdw-border)));
}
.rdw-node:hover { border-color: color-mix(in srgb, var(--rdw-accent) 25%, var(--rdw-border)); box-shadow: var(--shadow-md); }
.rdw-node.running {
  border-color: color-mix(in srgb, var(--rdw-accent) 58%, var(--rdw-border));
  background: linear-gradient(115deg, var(--rdw-accent-soft), var(--rdw-surface) 48%);
  box-shadow: 0 14px 34px color-mix(in srgb, var(--color-brand-glow) 68%, transparent);
}
.rdw-node.running::before { color: #fff; border-color: transparent; background: var(--gradient-brand); box-shadow: 0 7px 18px var(--color-brand-glow); animation: rdw-pulse 1.6s ease-in-out infinite; }
.rdw-node.paused { border-color: color-mix(in srgb, var(--color-warning) 44%, var(--rdw-border)); background: linear-gradient(115deg, color-mix(in srgb, var(--color-status-warning-bg) 68%, var(--rdw-surface)), var(--rdw-surface) 52%); }
.rdw-node.paused::before { color: var(--color-status-warning-fg); border-color: color-mix(in srgb, var(--color-warning) 28%, var(--rdw-border)); background: var(--color-status-warning-bg); }
.rdw-node.done::before { color: var(--color-status-success-fg); border-color: color-mix(in srgb, var(--color-success) 28%, var(--rdw-border)); background: var(--color-status-success-bg); }
.rdw-node.failed { border-color: color-mix(in srgb, var(--color-danger) 44%, var(--rdw-border)); }
.rdw-node.failed::before { color: var(--color-status-danger-fg); border-color: color-mix(in srgb, var(--color-danger) 28%, var(--rdw-border)); background: var(--color-status-danger-bg); }
.rdw-dot { display: none; }
@keyframes rdw-pulse { 0%, 100% { box-shadow: 0 7px 18px var(--color-brand-glow); } 50% { box-shadow: 0 7px 26px color-mix(in srgb, var(--rdw-accent) 46%, transparent); } }
.rdw-node-head {
  min-height: 36px;
  margin: -5px -7px 0;
  padding: 5px 7px;
  display: flex;
  align-items: center;
  gap: 9px;
  border-radius: 9px;
  cursor: pointer;
  transition: background .16s ease;
}
.rdw-node-head:hover { background: color-mix(in srgb, var(--rdw-hover) 74%, transparent); }
.rdw-node-name { min-width: 0; color: var(--rdw-text); font-size: 14px; font-weight: 700; }
.rdw-node-badge {
  flex: 0 0 auto;
  padding: 3px 8px;
  border-radius: 999px;
  color: var(--rdw-text-muted);
  background: var(--rdw-surface-soft);
  font-size: 10.5px;
  font-weight: 650;
}
.rdw-node.running .rdw-node-badge { color: var(--rdw-accent); background: var(--rdw-accent-soft); }
.rdw-node.paused .rdw-node-badge { color: var(--color-status-warning-fg); background: var(--color-status-warning-bg); }
.rdw-node.done .rdw-node-badge { color: var(--color-status-success-fg); background: var(--color-status-success-bg); }
.rdw-node.failed .rdw-node-badge { color: var(--color-status-danger-fg); background: var(--color-status-danger-bg); }
.rdw-node-files {
  margin-left: auto;
  padding: 4px 8px;
  flex: 0 0 auto;
  border: 1px solid var(--rdw-border);
  border-radius: 8px;
  color: var(--rdw-text-soft);
  background: var(--rdw-surface-raised);
  font-size: 10.5px;
  line-height: 1.3;
}
.rdw-node-duty { margin: 7px 0 0; color: var(--rdw-text-muted); font-size: 12px; line-height: 1.55; }
.rdw-node-elapsed { font-size: 11px; color: var(--color-accent, #2f6fed); margin-left: 6px; font-variant-numeric: tabular-nums; }
.rdw-node-metrics { margin-left: auto; font-size: 11px; color: var(--rdw-text-muted); font-variant-numeric: tabular-nums; white-space: nowrap; }
.rdw-node-activity { display: flex; align-items: center; gap: 7px; margin: 8px 0 0; font-size: 12px; color: var(--color-accent, #2f6fed); }
.rdw-spin { width: 11px; height: 11px; border-radius: 50%; border: 2px solid color-mix(in srgb, var(--color-accent, #2f6fed) 30%, transparent); border-top-color: var(--color-accent, #2f6fed); animation: rdw-rot .7s linear infinite; flex-shrink: 0; }
@keyframes rdw-rot { to { transform: rotate(360deg); } }
.rdw-node-output {
  max-height: 360px;
  margin: 14px 0 0;
  padding: 13px 14px;
  overflow: auto;
  border: 1px solid var(--rdw-border);
  border-radius: 12px;
  color: var(--rdw-text);
  background: var(--rdw-surface-soft);
  font-size: 12.5px;
  line-height: 1.68;
  white-space: pre-wrap;
  overflow-wrap: anywhere;
}
.rdw-node-changes { margin: 14px 0 0; display: flex; flex-direction: column; gap: 9px; }

/* 人在环确认 */
.rdw-confirm {
  margin: 14px 0 0;
  padding: 16px;
  border: 1px solid color-mix(in srgb, var(--color-warning) 38%, var(--rdw-border));
  border-radius: 14px;
  background: color-mix(in srgb, var(--color-status-warning-bg) 70%, var(--rdw-surface));
  box-shadow: inset 3px 0 0 color-mix(in srgb, var(--color-warning) 70%, transparent);
}
.rdw-confirm-q { margin: 0 0 7px; color: var(--rdw-text); font-size: 13.5px; font-weight: 720; line-height: 1.55; }
.rdw-confirm-detail {
  max-height: 220px;
  margin: 0 0 11px;
  padding: 10px 11px;
  overflow: auto;
  border: 1px solid color-mix(in srgb, var(--color-warning) 18%, var(--rdw-border));
  border-radius: 10px;
  color: var(--rdw-text-soft);
  background: var(--rdw-surface-raised);
  font-size: 12px;
  line-height: 1.6;
  white-space: pre-wrap;
}
.rdw-opts {
  margin-bottom: 11px;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 210px), 1fr));
  gap: 8px;
}
.rdw-opt {
  min-height: 42px;
  padding: 9px 11px;
  display: flex;
  align-items: center;
  gap: 8px;
  border: 1px solid color-mix(in srgb, var(--color-warning) 18%, var(--rdw-border));
  border-radius: 10px;
  color: var(--rdw-text-soft);
  background: var(--rdw-surface-raised);
  font-size: 12.5px;
  cursor: pointer;
  transition: border-color .16s ease, background .16s ease, box-shadow .16s ease;
}
.rdw-opt:hover { border-color: color-mix(in srgb, var(--color-warning) 48%, var(--rdw-border)); }
.rdw-opt.on { color: var(--rdw-text); border-color: var(--color-warning); background: var(--color-status-warning-bg); box-shadow: 0 0 0 3px color-mix(in srgb, var(--color-warning) 14%, transparent); }
.rdw-opt input { flex: 0 0 auto; accent-color: var(--color-warning); }
.rdw-confirm textarea { min-height: 74px; padding: 10px 11px; line-height: 1.58; resize: vertical; }
.rdw-confirm-actions { margin-top: 11px; display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }

/* 子组件主题衔接 */
.rdw-node-changes :deep(.fdv) { border-color: var(--rdw-border); border-radius: 12px; box-shadow: var(--shadow-sm); }
.rdw-node-changes :deep(.fdv-head) { min-height: 40px; background: var(--rdw-surface-soft); }
.rdw-node-changes :deep(.fdv-body) { background: var(--color-bg-primary); }
.rdw-node-changes :deep(.fdv-action.write) { color: var(--color-status-success-fg); background: var(--color-status-success-bg); }
.rdw-node-changes :deep(.fdv-action.patch) { color: var(--color-status-warning-fg); background: var(--color-status-warning-bg); }
.rdw-node-changes :deep(.fdv-action.read) { color: var(--color-status-info-fg); background: var(--color-status-info-bg); }

.rdw :is(button, input, select, textarea):focus-visible,
.rdw :deep(.page-back:focus-visible) {
  outline: 2px solid var(--rdw-accent);
  outline-offset: 2px;
}

@container main-page (max-width: 760px) {
  .rdw { padding: 18px 18px 60px; }
  .rdw-top { padding: 20px 21px 23px; }
  .rdw-intake { padding: 21px; }
  .rdw-row { grid-template-columns: minmax(0, 1fr); gap: 0; }
  .rdw-run-head { position: relative; align-items: stretch; flex-direction: column; }
  .rdw-run-actions { width: 100%; justify-content: flex-start; }
}

@container main-page (max-width: 500px) {
  .rdw { padding: 12px 12px 54px; scrollbar-gutter: auto; }
  .rdw-top { margin-bottom: 12px; padding: 15px 16px 18px; border-radius: 16px; }
  .rdw-title { margin-top: 18px; font-size: 23px; }
  .rdw-sub { font-size: 12.5px; line-height: 1.58; }
  .rdw-intake { padding: 16px; border-radius: 15px; }
  .rdw-intake h3 { font-size: 15.5px; }
  .rdw-start { width: 100%; justify-self: stretch; }
  .rdw-run-actions { display: grid; grid-template-columns: minmax(0, 1fr); }
  .rdw-btn { width: 100%; min-height: 42px; }
  .rdw-node { padding: 14px; border-radius: 13px; }
  .rdw-node::before, .rdw-node::after { display: none; }
  .rdw-dot { width: 10px; height: 10px; display: block; flex: 0 0 auto; border-radius: 50%; background: var(--rdw-text-muted); }
  .rdw-dot.running { background: var(--rdw-accent); animation: rdw-dot-pulse 1.5s ease-in-out infinite; }
  .rdw-dot.paused { background: var(--color-warning); }
  .rdw-dot.done { background: var(--color-success); }
  .rdw-dot.failed { background: var(--color-danger); }
  .rdw-node-head { flex-wrap: wrap; }
  .rdw-node-files { margin-left: 0; }
  .rdw-confirm { padding: 14px; }
  .rdw-opts { grid-template-columns: minmax(0, 1fr); }
  .rdw-confirm-actions { display: grid; grid-template-columns: minmax(0, 1fr); }
}

@container main-page (max-width: 760px) {
  .rdw-row { grid-template-columns: minmax(0, 1fr); gap: 0; }
}
@keyframes rdw-dot-pulse { 0%, 100% { opacity: 1; } 50% { opacity: .35; } }
@media (prefers-reduced-motion: reduce) {
  .rdw *, .rdw *::before, .rdw *::after { scroll-behavior: auto !important; transition: none !important; animation: none !important; }
}
</style>
