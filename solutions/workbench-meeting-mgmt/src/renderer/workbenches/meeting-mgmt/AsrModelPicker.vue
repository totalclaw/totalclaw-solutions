<template>
  <section class="mm-asr" data-test="mm-asr">
    <div class="mm-asr__modes" role="radiogroup" :aria-label="$t('转写方式')">
      <button type="button" role="radio" :aria-checked="mode !== 'cloud'" :class="{ on: mode !== 'cloud' }" data-test="mm-asr-mode-local" @click="pickMode('local')">
        <i class="ri-computer-line"></i>
        <span><strong>{{ $t('本机模型') }}</strong><small>{{ $t('推荐 · 录音不出这台电脑') }}</small></span>
      </button>
      <button type="button" role="radio" :aria-checked="mode === 'cloud'" :class="{ on: mode === 'cloud' }" data-test="mm-asr-mode-cloud" @click="pickMode('cloud')">
        <i class="ri-cloud-line"></i>
        <span><strong>{{ $t('在线接口') }}</strong><small>{{ $t('填自己的语音识别 API') }}</small></span>
      </button>
    </div>

    <p v-if="loading && !st" class="ss-muted"><i class="ri-loader-4-line spin"></i> {{ $t('正在检测这台电脑…') }}</p>

    <template v-else-if="st && mode !== 'cloud'">
      <article class="mm-asr__best" :class="{ ready: bestReady }" data-test="mm-asr-best">
        <header>
          <span class="mm-asr__tag"><i class="ri-medal-line"></i>{{ $t('为这台电脑推荐') }}</span>
          <span v-if="bestReady" class="ss-chip ok" data-test="mm-asr-best-ready">{{ $t('已就绪') }}</span>
        </header>
        <h4>{{ best.title }}</h4>
        <p>{{ best.desc }}</p>
        <ul class="mm-asr__facts">
          <li><i class="ri-hard-drive-2-line"></i>{{ $t('约 {n} MB', { n: st.recommend.sizeMb }) }}</li>
          <li><i class="ri-timer-line"></i>{{ $t('1 小时录音约 {n} 分钟', { n: st.recommend.estMinPerHour }) }}</li>
          <li><i class="ri-shield-check-line"></i>{{ $t('全程在本机') }}</li>
        </ul>
        <p v-if="st.recommend.downgradeReason" class="ss-note warn mm-asr__why"><i class="ri-information-line"></i>{{ downgradeText }}</p>
        <div v-if="!bestReady" class="mm-asr__act">
          <button type="button" class="ss-btn primary" :disabled="!!installing" data-test="mm-asr-best-install" @click="installAll(st.recommend.installIds)">
            <i :class="installing ? 'ri-loader-4-line spin' : 'ri-download-2-line'"></i>{{ $t('一键下载') }}
          </button>
          <small v-if="st.recommend.installIds.length > 1">{{ $t('会依次下载 SenseVoice（嘈杂片段的兜底）和 FireRedASR2') }}</small>
        </div>
      </article>

      <details class="mm-asr__more" data-test="mm-asr-more">
        <summary>{{ $t('全部本机模型与实测对比') }}</summary>
        <div class="ss-table-wrap">
          <table class="ss-table mm-asr__table">
            <thead>
              <tr>
                <th>{{ $t('模型') }}</th>
                <th class="num">{{ $t('会议室录音') }}</th>
                <th class="num">{{ $t('电话音质') }}</th>
                <th class="num">{{ $t('吴语方言') }}</th>
                <th class="num">{{ $t('1 小时耗时') }}</th>
                <th class="num">{{ $t('体积') }}</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="row in rows" :key="row.key" :data-test="`mm-asr-row-${row.key}`">
                <td><strong>{{ row.name }}</strong><small>{{ row.note }}</small></td>
                <td class="num">{{ row.room }}</td>
                <td class="num">{{ row.phone }}</td>
                <td class="num">{{ row.wu }}</td>
                <td class="num">{{ row.time }}</td>
                <td class="num">{{ row.size }}</td>
                <td class="mm-asr__cell-act">
                  <span v-if="row.ready" class="ss-chip ok">{{ $t('已下载') }}</span>
                  <button v-else-if="row.installId" type="button" class="ss-btn sm" :disabled="!!installing" :data-test="`mm-asr-install-${row.key}`" @click="installAll([row.installId])">
                    <i :class="installing === row.installId ? 'ri-loader-4-line spin' : 'ri-download-2-line'"></i>{{ $t('下载') }}
                  </button>
                  <small v-else class="ss-muted">{{ $t('在 设置 → 语音 下载') }}</small>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <p class="ss-muted mm-asr__src">{{ $t('表中是字错率（越低越准），用同一批带标准答案的录音在本机实测；耗时按这台电脑的配置估算。') }}</p>
        <label class="ss-field mm-asr__pref">
          <span>{{ $t('转写时用') }}</span>
          <select v-model="localModel" data-test="mm-asr-pref" @change="saveMode()">
            <option value="auto">{{ $t('自动（推荐）：装了 FireRedASR2 用它，否则 SenseVoice') }}</option>
            <option value="firered">FireRedASR2</option>
            <option value="sensevoice">SenseVoice</option>
            <option value="whisper">Whisper large-v3</option>
          </select>
        </label>
      </details>
    </template>

    <template v-else-if="st && mode === 'cloud'">
      <div class="mm-asr__cloud" data-test="mm-asr-cloud">
        <label class="ss-field">
          <span>{{ $t('服务商') }}</span>
          <select v-model="cloud.provider" data-test="mm-asr-cloud-provider" @change="onProvider">
            <option value="dashscope">{{ $t('阿里云百炼 · Qwen3-ASR-Flash（方言好）') }}</option>
            <option value="siliconflow">{{ $t('硅基流动 · SenseVoice / TeleSpeech 方言') }}</option>
            <option value="openai">OpenAI</option>
            <option value="custom">{{ $t('其他（OpenAI 兼容接口）') }}</option>
          </select>
        </label>
        <label class="ss-field">
          <span>{{ $t('接口地址') }}</span>
          <input v-model="cloud.baseUrl" type="url" spellcheck="false" placeholder="https://…/v1" data-test="mm-asr-cloud-url" />
        </label>
        <label class="ss-field">
          <span>{{ $t('模型') }}</span>
          <input v-model="cloud.model" type="text" spellcheck="false" list="mm-asr-models" data-test="mm-asr-cloud-model" />
          <datalist id="mm-asr-models"><option v-for="m in presetModels" :key="m" :value="m" /></datalist>
        </label>
        <label class="ss-field">
          <span>API Key <em v-if="st.asr.cloud?.hasKey" class="mm-asr__set">{{ $t('已保存') }}</em></span>
          <span class="mm-asr__secret">
            <input v-model="cloud.apiKey" :type="showKey ? 'text' : 'password'" autocomplete="new-password" spellcheck="false"
              :placeholder="st.asr.cloud?.hasKey ? $t('已保存，点右边的眼睛查看') : $t('粘贴 API Key')" data-test="mm-asr-cloud-key" />
            <button type="button" class="mm-asr__eye" :title="showKey ? $t('隐藏') : $t('查看')" data-test="mm-asr-cloud-eye" @click="toggleKey"><i :class="showKey ? 'ri-eye-off-line' : 'ri-eye-line'"></i></button>
          </span>
          <a v-if="keyUrl" class="ss-link mm-asr__keylink" href="#" @click.prevent="openKeyUrl">{{ $t('去哪拿 API Key') }}</a>
        </label>
        <p class="ss-note info"><i class="ri-information-line"></i>{{ $t('选在线接口后，会议录音会按片段（每段不超过 20 秒）上传到这个服务转写，按服务商的价格计费；认人（声纹）仍在本机。API Key 只加密保存在这台电脑。') }}</p>
        <p v-if="testMsg" class="ss-note" :class="testOk ? 'ok' : 'danger'" data-test="mm-asr-cloud-test-msg"><i :class="testOk ? 'ri-checkbox-circle-line' : 'ri-error-warning-line'"></i>{{ testMsg }}</p>
        <div class="mm-asr__act">
          <button type="button" class="ss-btn" :disabled="busy" data-test="mm-asr-cloud-test" @click="testCloud"><i :class="acting === 'test' ? 'ri-loader-4-line spin' : 'ri-plug-line'"></i>{{ $t('测试连接') }}</button>
          <button type="button" class="ss-btn primary" :disabled="busy || !cloud.model.trim() || !(cloud.apiKey.trim() || st.asr.cloud?.hasKey)" data-test="mm-asr-cloud-save" @click="saveCloud"><i :class="acting === 'save' ? 'ri-loader-4-line spin' : 'ri-save-line'"></i>{{ $t('保存并使用') }}</button>
          <button v-if="st.asr.cloud" type="button" class="ss-link" :disabled="busy" data-test="mm-asr-cloud-clear" @click="clearCloud">{{ $t('清除在线接口') }}</button>
        </div>
      </div>
    </template>

    <p v-if="installLine" class="ss-muted mono mm-asr__log" data-test="mm-asr-log">{{ installLine }}</p>
    <p v-if="error" class="ss-note danger" data-test="mm-asr-error"><i class="ri-error-warning-line"></i>{{ error }}</p>
  </section>
</template>

<script setup lang="ts">
/**
 * 会议转写模型：本机模型（按这台电脑的配置推荐最好的，一键下载；全部模型的实测对比）或自己填的在线语音识别接口。
 * 配置引导第 1 步和 系统设置 → AI 能力 共用。数据来自 setup.status（管理员）。
 */
import { computed, onBeforeUnmount, onMounted, reactive, ref } from 'vue';
import { t as i18nT } from '../../i18n';
import { useNotificationStore } from '../../stores/notification';
import { errorMessage, mm, openExternalUrl } from './shared';

type Engine = 'firered' | 'sensevoice';
type Provider = 'dashscope' | 'siliconflow' | 'openai' | 'custom';
interface Preset { id: Provider; protocol: string; baseUrl: string; models: string[]; keyUrl: string }
interface AsrView { mode: 'local' | 'agent' | 'cloud'; localModel: 'auto' | 'firered' | 'sensevoice' | 'whisper'; cloud: { provider: Provider; baseUrl: string; model: string; hasKey: boolean } | null; presets: Preset[] }
export interface AsrStatus {
  hardware: { memGb: number; cores: number; freeDiskGb: number | null };
  models: { asrModel: string | null; senseVoice?: boolean; fireRed?: boolean; asrReady: boolean };
  recommend: { engine: Engine; installIds: string[]; sizeMb: number; estMinPerHour: number; downgradeReason?: 'memory' | 'cores' | 'disk' };
  estimates?: { firered: number; sensevoice: number };
  asr: AsrView;
}

const emit = defineEmits<{ (e: 'changed'): void }>();
const notif = useNotificationStore();

const st = ref<AsrStatus | null>(null);
const loading = ref(false);
const busy = ref(false);
const acting = ref('');
const error = ref('');
const installing = ref('');
const installLine = ref('');
const mode = ref<'local' | 'agent' | 'cloud'>('local');
const localModel = ref<AsrView['localModel']>('auto');
const cloud = reactive({ provider: 'dashscope' as Provider, baseUrl: '', model: '', apiKey: '' });
const showKey = ref(false);
const testMsg = ref('');
const testOk = ref(false);

const presets = computed<Preset[]>(() => st.value?.asr.presets ?? []);
const preset = computed(() => presets.value.find((p) => p.id === cloud.provider));
const presetModels = computed(() => preset.value?.models ?? []);
const keyUrl = computed(() => preset.value?.keyUrl || '');

const bestReady = computed(() => !!st.value?.models.asrReady);
const best = computed(() => st.value?.recommend.engine === 'firered'
  ? { title: i18nT('FireRedASR2（最准）+ SenseVoice 兜底'), desc: i18nT('实测最准的本机模型：普通话、各地口音、吴语 / 上海话 / 闽南语 / 粤语和专业名词都明显好于以前的 Whisper。嘈杂片段自动换 SenseVoice 的结果，不会出乱码。') }
  : { title: i18nT('SenseVoice（快速）'), desc: i18nT('又快又小：普通话、口音和粤语都认，带标点，比以前的 Whisper 准一倍，1 小时录音一两分钟转完。') });
const downgradeText = computed(() => {
  const r = st.value?.recommend;
  const hw = st.value?.hardware;
  if (!r?.downgradeReason || !hw) return '';
  const why = r.downgradeReason === 'memory' ? i18nT('内存 {n} GB', { n: hw.memGb })
    : r.downgradeReason === 'cores' ? i18nT('处理器 {n} 核', { n: hw.cores })
      : i18nT('磁盘只剩 {n} GB', { n: hw.freeDiskGb ?? 0 });
  return i18nT('最准的 FireRedASR2 需要 16 GB 以上内存、8 核以上处理器和约 1.5 GB 磁盘，这台电脑{why}，所以推荐 SenseVoice。', { why });
});
const rows = computed(() => {
  const s = st.value;
  if (!s) return [];
  const est = s.estimates;
  return [
    { key: 'firered', name: 'FireRedASR2', note: i18nT('最准，含方言'), room: '12.5%', phone: '10.6%', wu: '18.5%', time: est ? i18nT('约 {n} 分钟', { n: est.firered }) : '—', size: '1.2 GB', ready: !!s.models.fireRed, installId: 'asr-meeting-firered2' },
    { key: 'sensevoice', name: 'SenseVoice', note: i18nT('快、小，也做兜底'), room: '14.3%', phone: '20.3%', wu: '34.5%', time: est ? i18nT('约 {n} 分钟', { n: est.sensevoice }) : '—', size: '228 MB', ready: !!s.models.senseVoice, installId: 'asr-meeting-sensevoice' },
    { key: 'whisper', name: 'Whisper large-v3', note: i18nT('只在阿拉伯语等其他语种时用'), room: '31.7%', phone: '34.5%', wu: '77.7%', time: i18nT('约 16 分钟'), size: '2.9 GB', ready: s.models.asrModel === 'large-v3', installId: '' },
  ];
});

function fillFrom(s: AsrStatus): void {
  mode.value = s.asr.mode;
  localModel.value = s.asr.localModel;
  const c = s.asr.cloud;
  const pid: Provider = c?.provider ?? 'dashscope';
  const p = s.asr.presets.find((x) => x.id === pid);
  Object.assign(cloud, { provider: pid, baseUrl: c?.baseUrl ?? p?.baseUrl ?? '', model: c?.model ?? p?.models[0] ?? '', apiKey: '' });
}

async function load(): Promise<void> {
  loading.value = true;
  try {
    const s = await mm<AsrStatus>('setup.status');
    st.value = s;
    if (s) fillFrom(s);
    error.value = '';
  } catch (e) {
    error.value = errorMessage(e);
  } finally {
    loading.value = false;
  }
}

async function act(kind: string, fn: () => Promise<void>): Promise<void> {
  busy.value = true;
  acting.value = kind;
  error.value = '';
  try { await fn(); } catch (e) { error.value = errorMessage(e); } finally { busy.value = false; acting.value = ''; }
}

/** 切到本机：立刻生效；切到在线：先只换界面，填好保存才生效（没配好就切会让会议没法转写） */
function pickMode(m: 'local' | 'cloud'): void {
  testMsg.value = '';
  if (m === 'cloud') { mode.value = 'cloud'; return; }
  mode.value = 'local';
  if (st.value?.asr.mode !== 'local') void saveMode();
}
function saveMode(): Promise<void> {
  return act('mode', async () => {
    const v = await mm<AsrView>('asr.mode.save', { mode: mode.value === 'cloud' ? 'cloud' : 'local', localModel: localModel.value });
    if (st.value && v) st.value.asr = v;
    emit('changed');
  });
}

function onProvider(): void {
  const p = preset.value;
  cloud.baseUrl = p?.baseUrl ?? '';
  cloud.model = p?.models[0] ?? '';
  testMsg.value = '';
}
function cloudPayload(): Record<string, string> {
  return { provider: cloud.provider, baseUrl: cloud.baseUrl.trim(), model: cloud.model.trim(), apiKey: cloud.apiKey.trim() };
}
function testCloud(): Promise<void> {
  testMsg.value = '';
  return act('test', async () => {
    const r = await mm<{ ok: boolean; ms?: number; error?: string }>('asr.cloud.test', cloudPayload());
    testOk.value = !!r?.ok;
    testMsg.value = r?.ok ? i18nT('连接正常（{n} 毫秒），地址、模型和 API Key 都对', { n: r.ms ?? 0 }) : (r?.error || i18nT('连接失败'));
  });
}
function saveCloud(): Promise<void> {
  return act('save', async () => {
    await mm('asr.cloud.save', cloudPayload());
    const v = await mm<AsrView>('asr.mode.save', { mode: 'cloud', localModel: localModel.value });
    if (st.value && v) st.value.asr = v;
    cloud.apiKey = '';
    showKey.value = false;
    notif.success(i18nT('已改为在线接口转写'));
    emit('changed');
  });
}
function clearCloud(): Promise<void> {
  if (!window.confirm(i18nT('清除在线接口和保存的 API Key？会议转写会改回本机模型。'))) return Promise.resolve();
  return act('clear', async () => {
    const v = await mm<AsrView>('asr.cloud.save', { clear: true });
    if (st.value && v) { st.value.asr = v; fillFrom(st.value); }
    emit('changed');
  });
}
async function toggleKey(): Promise<void> {
  if (showKey.value) { showKey.value = false; return; }
  if (!cloud.apiKey && st.value?.asr.cloud?.hasKey) {
    try { cloud.apiKey = (await mm<{ apiKey: string }>('asr.cloud.reveal'))?.apiKey || ''; } catch (e) { error.value = errorMessage(e); return; }
  }
  showKey.value = true;
}
function openKeyUrl(): void {
  openExternalUrl(keyUrl.value);
}

// ── 模型下载（复用应用的组件安装器：electronAPI.pyExt）──
const pyExt = () => (window as any).electronAPI?.pyExt;
async function installAll(ids: string[]): Promise<void> {
  const a = pyExt();
  if (!a?.install) { error.value = i18nT('组件安装器不可用，请到应用的 设置 → 语音 里下载'); return; }
  error.value = '';
  try {
    for (const id of ids) {
      if (id === 'asr-meeting-firered2' && st.value?.models.fireRed) continue;
      if (id === 'asr-meeting-sensevoice' && st.value?.models.senseVoice) continue;
      installing.value = id;
      installLine.value = i18nT('开始下载…');
      const r = await a.install(id);
      if (!r?.ok) { error.value = r?.error || i18nT('下载失败'); break; }
      await load();
    }
    if (!error.value) installLine.value = i18nT('下载完成');
    emit('changed');
  } catch (e) {
    error.value = errorMessage(e);
  } finally {
    installing.value = '';
  }
}

let unsub: (() => void) | null = null;
onMounted(() => {
  void load();
  const a = pyExt();
  if (a?.onInstallProgress) {
    unsub = a.onInstallProgress((p: { id?: string; line?: string }) => {
      if (p?.id && p.id === installing.value && p.line) installLine.value = String(p.line).slice(0, 200);
    });
  }
});
onBeforeUnmount(() => { try { unsub?.(); } catch { /* */ } });

defineExpose({ reload: load });
</script>

<style scoped>
.mm-asr { display: grid; gap: 14px; }
.mm-asr__modes { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px; }
.mm-asr__modes button {
  display: flex; align-items: center; gap: 12px; padding: 12px 14px; text-align: left; cursor: pointer;
  border: 1px solid var(--color-border); border-radius: var(--radius-5); background: var(--color-bg-elevated, var(--color-bg));
  color: var(--color-text); transition: border-color .15s, background .15s;
}
.mm-asr__modes button:hover { border-color: var(--color-brand); }
.mm-asr__modes button.on { border-color: var(--color-brand); background: var(--color-brand-subtle); box-shadow: inset 0 0 0 1px var(--color-brand); }
.mm-asr__modes button > i { font-size: 20px; color: var(--color-brand); }
.mm-asr__modes span { display: grid; gap: 2px; }
.mm-asr__modes strong { font-size: 13.5px; }
.mm-asr__modes small { font-size: 12px; color: var(--color-text-secondary); }

.mm-asr__best {
  display: grid; gap: 8px; padding: 16px 18px; border-radius: var(--radius-6, 12px);
  border: 1px solid color-mix(in srgb, var(--color-brand) 35%, var(--color-border));
  background: linear-gradient(135deg, var(--color-brand-subtle), transparent 70%);
}
.mm-asr__best.ready { border-color: color-mix(in srgb, var(--color-success, #16a34a) 35%, var(--color-border)); }
.mm-asr__best header { display: flex; align-items: center; justify-content: space-between; gap: 8px; }
.mm-asr__tag { display: inline-flex; align-items: center; gap: 4px; font-size: 12px; font-weight: 600; color: var(--color-brand); }
.mm-asr__best h4 { margin: 0; font-size: 16px; }
.mm-asr__best > p { margin: 0; font-size: 13px; line-height: 1.6; color: var(--color-text-secondary); }
.mm-asr__facts { display: flex; flex-wrap: wrap; gap: 6px 16px; margin: 2px 0 0; padding: 0; list-style: none; font-size: 12.5px; color: var(--color-text-secondary); }
.mm-asr__facts li { display: inline-flex; align-items: center; gap: 4px; }
.mm-asr__facts i { color: var(--color-brand); }
.mm-asr__why { margin: 0; }
.mm-asr__act { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
.mm-asr__act small { font-size: 12px; color: var(--color-text-secondary); }

.mm-asr__more { border: 1px solid var(--color-border-subtle); border-radius: var(--radius-5); padding: 10px 14px; }
.mm-asr__more summary { cursor: pointer; font-size: 13px; font-weight: 600; color: var(--color-text-secondary); }
.mm-asr__more[open] summary { margin-bottom: 10px; }
.mm-asr__table td strong { display: block; font-size: 13px; }
.mm-asr__table td small { display: block; font-size: 11.5px; color: var(--color-text-secondary); }
.mm-asr__cell-act { text-align: right; white-space: nowrap; }
.mm-asr__src { margin: 6px 0 0; font-size: 12px; }
.mm-asr__pref { margin-top: 10px; max-width: 520px; }

.mm-asr__cloud { display: grid; gap: 10px; }
.mm-asr__secret { position: relative; display: flex; }
.mm-asr__secret input { flex: 1; padding-right: 36px; }
.mm-asr__eye { position: absolute; right: 6px; top: 50%; transform: translateY(-50%); border: 0; background: none; cursor: pointer; color: var(--color-text-secondary); font-size: 16px; }
.mm-asr__set { font-style: normal; font-size: 11.5px; color: var(--color-success, #16a34a); margin-left: 6px; }
.mm-asr__keylink { font-size: 12px; justify-self: start; }
.mm-asr__log { margin: 0; font-size: 12px; word-break: break-all; }
.spin { animation: mm-asr-spin 1s linear infinite; display: inline-block; }
@keyframes mm-asr-spin { to { transform: rotate(360deg); } }
@media (max-width: 640px) { .mm-asr__modes { grid-template-columns: 1fr; } }
</style>
