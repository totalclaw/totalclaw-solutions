<template>
  <div class="pa-sched">
    <section class="ss-panel">
      <header class="pa-sched__head">
        <h3>{{ $t('定时运算') }}</h3>
        <span class="ss-chip" :class="form.enabled ? 'ok' : ''">{{ form.enabled ? $t('已开启') : $t('未开启') }}</span>
      </header>
      <p class="ss-muted">{{ $t('每天到点，从数据文件夹里按文件名找出每类数据最新的一份，重新运算，把结果存进看板和历史，并提醒相比上一次新增的已缺货、将缺货配件。应用开着才会运行。定时运算不改动「运算」页签里正在检验的那一次结果，也不会生成采购订单。') }}</p>

      <div class="ss-grid">
        <label class="ss-field inline pa-check"><input v-model="form.enabled" type="checkbox" data-test="pa-sched-enabled" /><span>{{ $t('开启定时运算') }}</span></label>
        <label class="ss-field"><span>{{ $t('每天几点运行') }}</span><input v-model="form.time" type="time" data-test="pa-sched-time" /></label>
      </div>
      <label class="ss-field">
        <span>{{ $t('数据文件夹（业务系统每天把导出的表放到这里）') }}</span>
        <div class="pa-folder">
          <input v-model="form.folder" type="text" :placeholder="$t('选择或粘贴文件夹路径')" data-test="pa-sched-folder" />
          <button type="button" class="ss-btn" @click="pickFolder"><i class="ri-folder-open-line"></i>{{ $t('选择文件夹') }}</button>
        </div>
      </label>

      <div class="pa-kw">
        <strong>{{ $t('按文件名认数据') }}</strong>
        <span class="ss-muted">{{ $t('文件名里带下面任意一个字样，就当作这类数据；同一类有多份时取修改时间最新的。多个字样用逗号隔开') }}</span>
        <div v-for="k in DATASETS" :key="k" class="pa-kw__row">
          <span>{{ datasetLabel(k) }}<em v-if="k === 'monthly' || k === 'stock'">*</em></span>
          <input v-model="keywordText[k]" type="text" :data-test="`pa-sched-kw-${k}`" />
          <small :class="found[k] ? 'hit' : 'miss'">
            <template v-if="found[k]"><i class="ri-file-excel-2-line"></i>{{ found[k] }}</template>
            <template v-else-if="savedFolder">{{ k === 'monthly' || k === 'stock' ? $t('文件夹里没有找到，定时运算会失败') : $t('文件夹里没有找到') }}</template>
          </small>
        </div>
        <button type="button" class="ss-link" @click="resetKeywords">{{ $t('恢复默认字样') }}</button>
      </div>

      <div class="ss-grid">
        <label class="ss-field inline pa-check"><input v-model="form.notify" type="checkbox" /><span>{{ $t('运算完弹系统通知') }}</span></label>
        <label class="ss-field inline pa-check"><input v-model="form.emailEnabled" type="checkbox" data-test="pa-sched-email" /><span>{{ $t('把预警摘要和结果表发邮件') }}</span></label>
      </div>
      <label v-if="form.emailEnabled" class="ss-field">
        <span>{{ $t('收件人（多个用逗号隔开）。用应用里已配置的邮件通道发送，附件是「库存状态与行动计划」表') }}</span>
        <input v-model="form.emailTo" type="text" placeholder="buyer@example.com, manager@example.com" data-test="pa-sched-email-to" />
      </label>

      <p v-if="error" class="ss-note danger" data-test="pa-sched-error"><i class="ri-error-warning-line"></i>{{ error }}</p>
      <p v-if="note" class="ss-note ok"><i class="ri-check-line"></i>{{ note }}</p>
      <div class="ss-actions">
        <button type="button" class="ss-btn primary" :disabled="busy" data-test="pa-sched-save" @click="save"><i class="ri-save-line"></i>{{ $t('保存设置') }}</button>
        <button type="button" class="ss-btn" :disabled="busy || running" data-test="pa-sched-run" @click="runNow">
          <i :class="running ? 'ri-loader-4-line spin' : 'ri-play-line'"></i>{{ running ? $t('正在运算…') : $t('立即运行一次') }}
        </button>
        <span class="ss-muted">{{ $t('「立即运行一次」会先保存上面的设置') }}</span>
      </div>
    </section>

    <section class="ss-panel">
      <h3>{{ $t('上一次定时运算') }}</h3>
      <p v-if="!status?.lastRunAt" class="ss-empty">{{ $t('还没有运行过') }}</p>
      <template v-else>
        <p class="ss-note" :class="status.lastOk ? 'ok' : 'danger'" data-test="pa-sched-last">
          <i :class="status.lastOk ? 'ri-check-line' : 'ri-error-warning-line'"></i>
          <span><b>{{ fmtDateTime(status.lastRunAt) }} · {{ status.lastOk ? $t('完成') : $t('没有完成') }}</b><br />{{ status.lastMessage }}</span>
        </p>
        <p v-if="status.lastFiles.length" class="ss-muted">{{ $t('用到的文件：{p0}', { p0: status.lastFiles.join('、') }) }}</p>
        <div v-if="lastScheduled?.files.length" class="ss-file-out">
          <i class="ri-file-excel-2-line"></i><code :title="lastScheduled.files[0]">{{ lastScheduled.files[0] }}</code>
          <button type="button" class="ss-btn sm" @click="open(lastScheduled.files[0])">{{ $t('打开文件') }}</button>
          <button type="button" class="ss-btn sm" @click="open(lastScheduled.files[0], true)">{{ $t('打开所在文件夹') }}</button>
        </div>
      </template>
    </section>

    <section class="ss-panel">
      <h3>{{ $t('输出目录') }}</h3>
      <div class="ss-file-out">
        <i class="ri-folder-line"></i><code>{{ state?.outputDir }}</code>
        <button type="button" class="ss-btn sm" @click="changeOutputDir">{{ $t('更换') }}</button>
        <button v-if="state?.settings.outputDir" type="button" class="ss-btn sm" @click="setOutputDir('')">{{ $t('用默认目录') }}</button>
        <button type="button" class="ss-btn sm" @click="open(state?.outputDir || '')">{{ $t('打开') }}</button>
      </div>
      <p class="ss-muted">{{ $t('采购订单、库存状态与行动计划、示例数据都写到这里；定时运算的结果在其中的「定时运算」文件夹') }}</p>
    </section>
  </div>
</template>

<script setup lang="ts">
/** 定时运算：开关、时间、数据文件夹、文件名字样、通知与邮件；立即运行一次；如实显示上次结果。 */
import { computed, reactive, ref, watch } from 'vue';
import { PA_DATASETS, type PaDatasetKey, type PaSchedule } from '@totalclaw/ipc-contracts';
import { useNotificationStore } from '../../stores/notification';
import { t as i18nT } from '../../i18n';
import { datasetLabel, errorMessage, fmtDateTime, openPath, pa, paState, refreshState } from './shared';

const notif = useNotificationStore();
const DATASETS = PA_DATASETS;
const state = paState;
const status = computed(() => state.value?.scheduleStatus || null);
const lastScheduled = computed(() => (state.value?.history || []).find((h) => h.source === 'schedule') || null);
const savedFolder = computed(() => state.value?.settings.schedule.folder || '');

const form = reactive({ enabled: false, time: '08:00', folder: '', notify: true, emailEnabled: false, emailTo: '' });
const keywordText = reactive<Record<PaDatasetKey, string>>({ monthly: '', yearly: '', leadTime: '', inTransit: '', stock: '' });
const found = ref<Partial<Record<PaDatasetKey, string>>>({});
const busy = ref(false);
const running = ref(false);
const error = ref('');
const note = ref('');

function seed(s: PaSchedule): void {
  Object.assign(form, { enabled: s.enabled, time: s.time, folder: s.folder, notify: s.notify, emailEnabled: s.emailEnabled, emailTo: s.emailTo });
  for (const k of DATASETS) keywordText[k] = (s.keywords[k] || []).join(i18nT('，'));
}
let seeded = false;
watch(() => state.value?.settings.schedule, (s) => { if (s && !seeded) { seeded = true; seed(s); void preview(); } }, { immediate: true });

async function preview(): Promise<void> {
  try { found.value = await pa('schedule.preview'); } catch { found.value = {}; }
}
function payload(): Partial<PaSchedule> {
  const keywords = {} as Record<PaDatasetKey, string[]>;
  for (const k of DATASETS) keywords[k] = keywordText[k].split(/[,，;；、\s]+/).map((x) => x.trim()).filter(Boolean);
  return { ...form, folder: form.folder.trim(), emailTo: form.emailTo.trim(), keywords };
}
async function persist(): Promise<boolean> {
  busy.value = true; error.value = ''; note.value = '';
  try {
    const next = await pa<PaSchedule>('schedule.save', { schedule: payload() });
    await refreshState();
    seed(next);
    await preview();
    return true;
  } catch (e) { error.value = errorMessage(e); return false; } finally { busy.value = false; }
}
async function save(): Promise<void> {
  if (await persist()) note.value = form.enabled ? i18nT('已保存，每天 {p0} 运行', { p0: form.time }) : i18nT('已保存（定时运算没有开启）');
}
async function runNow(): Promise<void> {
  if (!(await persist())) return;
  running.value = true;
  try {
    const r = await pa<{ ok: boolean; message: string }>('schedule.runNow');
    await refreshState();
    if (r.ok) note.value = i18nT('运行完成，结果见下方和「预警看板」'); else error.value = r.message;
  } catch (e) { error.value = errorMessage(e); } finally { running.value = false; }
}
async function pickFolder(): Promise<void> {
  try { const dir = await pa<string>('dirs.pick'); if (dir) form.folder = dir; } catch (e) { notif.error(errorMessage(e)); }
}
function resetKeywords(): void {
  const d = state.value?.defaults.keywords;
  if (d) for (const k of DATASETS) keywordText[k] = d[k].join(i18nT('，'));
}
function open(path: string, reveal = false): void { if (path) void openPath(path, reveal).catch((e) => notif.error(errorMessage(e))); }
async function setOutputDir(dir: string): Promise<void> {
  try { await pa('settings.outputDir', { dir }); await refreshState(); } catch (e) { notif.error(errorMessage(e)); }
}
async function changeOutputDir(): Promise<void> {
  try { const dir = await pa<string>('dirs.pick'); if (dir) await setOutputDir(dir); } catch (e) { notif.error(errorMessage(e)); }
}
</script>

<style scoped>
.pa-sched { display: grid; gap: 14px; max-width: 1100px; }
.ss-panel { border: 1px solid var(--color-border); border-radius: var(--radius-6); background: var(--color-bg-card); padding: 16px; display: grid; gap: 12px; }
.pa-sched__head { display: flex; align-items: center; gap: 10px; }
h3 { margin: 0; font-size: var(--font-size-lg); }
p { margin: 0; }
.pa-check { grid-template-columns: auto 1fr; align-items: center; }
.pa-check input { width: 16px; height: 16px; padding: 0; }
.pa-check span { color: var(--color-text-primary); }
.pa-folder { display: flex; gap: 8px; }
.pa-folder input { flex: 1; }
.pa-kw { display: grid; gap: 8px; border: 1px solid var(--color-border); border-radius: var(--radius-5); padding: 12px; font-size: 12.5px; }
.pa-kw__row { display: grid; grid-template-columns: 150px minmax(160px, 280px) 1fr; gap: 10px; align-items: center; }
.pa-kw__row > span em { color: var(--color-danger); font-style: normal; margin-inline-start: 2px; }
.pa-kw__row input { height: 32px; border-radius: var(--radius-3); border: 1px solid var(--color-border); background: var(--color-bg-input); color: var(--color-text-primary); font: inherit; font-size: 12.5px; padding: 0 10px; min-width: 0; }
.pa-kw__row small { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; display: inline-flex; gap: 4px; align-items: center; }
.pa-kw__row small.hit { color: var(--color-success); }
.pa-kw__row small.miss { color: var(--color-text-secondary); }
.spin { animation: pa-spin 1s linear infinite; }
@keyframes pa-spin { to { transform: rotate(360deg); } }
@media (max-width: 760px) { .pa-kw__row { grid-template-columns: 1fr; } }
</style>
