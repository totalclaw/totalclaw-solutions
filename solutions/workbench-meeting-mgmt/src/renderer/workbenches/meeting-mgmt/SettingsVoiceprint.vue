<template>
  <div class="mm-sv" data-test="mm-voiceprint">
    <header class="mm-sp__head">
      <div>
        <h3>{{ $t('声纹库') }}</h3>
        <p>{{ $t('员工在企微里打开采集链接，授权同意后录 10～15 秒，用于会议发言人识别（只在本场参会人中比对）') }}</p>
      </div>
      <div class="ss-actions">
        <button type="button" class="ss-btn" :disabled="busy" data-test="mm-vp-copy" @click="copyLink"><i class="ri-link"></i>{{ $t('复制采集链接') }}</button>
        <button type="button" class="ss-btn primary" :disabled="busy || !wecomConnected" :title="wecomConnected ? '' : $t('未连接企微')" data-test="mm-vp-send" @click="sendWecom"><i class="ri-send-plane-line"></i>{{ groupMode ? $t('发送到企微群') : $t('推送到企微') }}</button>
      </div>
    </header>
    <p v-if="!wecomConnected" class="ss-note warn"><i class="ri-information-line"></i>{{ $t('未连接企微：先在「消息推送」里配置企微自建应用或群机器人才能推送；也可以复制采集链接自己发。采集链接要先在「手机端」开启手机页服务。') }}</p>
    <p class="ss-muted mm-sv__tip">{{ $t('每人的采集链接都带本人令牌（等同免登），只能本人打开录自己的声纹；复制时按人一条一行。') }}</p>
    <p v-if="sendResult" class="ss-note" :class="sendResult.failed.length ? 'warn' : 'ok'" data-test="mm-vp-send-result">
      <i :class="sendResult.failed.length ? 'ri-alert-line' : 'ri-checkbox-circle-line'"></i>
      {{ $t('已推送 {a} 人', { a: sendResult.sent }) }}<template v-if="sendResult.failed.length">{{ $t('，{b} 人失败：{names}', { b: sendResult.failed.length, names: sendResult.failed.slice(0, 6).map((f) => $t('{p0}（{p1}）', { p0: personName(f.personId), p1: f.error })).join($t('；')) }) }}</template>
    </p>
    <p v-if="error" class="ss-note danger"><i class="ri-error-warning-line"></i>{{ error }}</p>

    <div class="mm-sv__cov" data-test="mm-vp-coverage">
      <div class="mm-sv__num"><b>{{ collected }}</b><span>/ {{ $t('{n} 人', { n: rows.length }) }}</span><small>{{ $t('已采集') }}</small></div>
      <div class="mm-sv__bar">
        <i class="mm-bar"><b :style="{ width: `${coverage}%` }"></b></i>
        <small>{{ $t('覆盖率 {p}% · 还有 {n} 人未采集', { p: coverage, n: rows.length - collected }) }}</small>
      </div>
    </div>

    <div class="mm-sv__tools">
      <nav class="mm-subtabs" role="tablist">
        <button v-for="f in FILTERS" :key="f.key" type="button" role="tab" :aria-selected="filter === f.key" :class="{ on: filter === f.key }" :data-test="`mm-vp-filter-${f.key}`" @click="filter = f.key; page = 1">
          {{ f.title }} <em>{{ countOf(f.key) }}</em>
        </button>
      </nav>
      <span class="grow"></span>
      <label class="mm-search"><i class="ri-search-line" aria-hidden="true"></i><input v-model="q" type="search" :placeholder="$t('搜索员工')" :aria-label="$t('搜索员工')" @input="page = 1" /></label>
      <button type="button" class="ss-btn sm" data-test="mm-vp-record" @click="openRecord(myId)"><i class="ri-mic-line"></i>{{ $t('现场录音') }}</button>
      <button type="button" class="ss-btn sm" data-test="mm-vp-import" @click="openImport('')"><i class="ri-upload-2-line"></i>{{ $t('导入录音代为采集') }}</button>
    </div>

    <div class="ss-table-wrap">
      <table class="ss-table mm-sv__table">
        <thead>
          <tr>
            <th>{{ $t('员工') }}</th><th>{{ $t('部门') }}</th><th>{{ $t('状态') }}</th>
            <th>{{ $t('授权时间（个保法单独同意）') }}</th><th>{{ $t('采集时间') }}</th><th class="num">{{ $t('操作') }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="!paged.rows.length"><td colspan="6" class="mm-sv__empty">{{ loading ? $t('加载中…') : $t('没有符合条件的员工') }}</td></tr>
          <tr v-for="r in paged.rows" :key="r.person.id" :data-test="`mm-vp-row-${r.person.id}`">
            <td><PersonChip :name="r.person.name" /></td>
            <td>{{ r.deptName || '—' }}</td>
            <td>
              <span class="mm-sv__st">
                <span class="ss-chip" :class="r.status === 'collected' ? 'ok' : 'warn'">{{ r.status === 'collected' ? $t('已采集') : $t('未采集') }}</span>
                <span v-if="r.needsUpdate" class="ss-chip warn" :title="$t('这份声纹是旧模型采的。本机已装更准的声纹模型，请本人用采集链接重录一次（只要有一位参会人还是旧声纹，整场就只能用旧模型认人）')" :data-test="`mm-vp-old-${r.person.id}`">{{ $t('建议重录') }}</span>
                <span v-if="r.autoLearn" class="mm-sv__learn" :title="$t('确认会议发言后，用本人的发言自动补充声纹')" :data-test="`mm-vp-learn-${r.person.id}`"><i class="ri-loop-right-line"></i>{{ r.extraCount ? $t('会议补充 {n} 条', { n: r.extraCount }) : $t('会议补充已开') }}</span>
              </span>
            </td>
            <td class="mono">{{ r.consentAt ? fmtMs(r.consentAt, true) : '—' }}</td>
            <td class="mono">{{ r.enrolledAt ? fmtMs(r.enrolledAt) : '—' }}</td>
            <td class="num">
              <template v-if="r.status === 'collected'">
                <template v-if="r.person.id === myId">
                  <button type="button" class="ss-link" :disabled="busy" :data-test="`mm-vp-learn-toggle`" @click="toggleLearn(r)">{{ r.autoLearn ? $t('关闭会议补充') : $t('开启会议补充') }}</button>
                  <span class="mm-sv__sep" aria-hidden="true">·</span>
                </template>
                <template v-if="r.needsUpdate">
                  <button type="button" class="ss-link" :disabled="busy" :data-test="`mm-vp-copy-${r.person.id}`" @click="copyOne(r)">{{ $t('复制重录链接') }}</button>
                  <span class="mm-sv__sep" aria-hidden="true">·</span>
                </template>
                <button type="button" class="ss-link" :disabled="busy" :data-test="`mm-vp-rec-${r.person.id}`" @click="openRecord(r.person.id)">{{ $t('现场重录') }}</button>
                <span class="mm-sv__sep" aria-hidden="true">·</span>
                <button type="button" class="ss-link danger" :disabled="busy" :data-test="`mm-vp-del-${r.person.id}`" @click="remove(r)">{{ $t('删除（撤回授权）') }}</button>
              </template>
              <template v-else>
                <button type="button" class="ss-link" :disabled="busy" :data-test="`mm-vp-rec-${r.person.id}`" @click="openRecord(r.person.id)">{{ $t('现场录音') }}</button>
                <span class="mm-sv__sep" aria-hidden="true">·</span>
                <button type="button" class="ss-link" :disabled="busy" :data-test="`mm-vp-copy-${r.person.id}`" @click="copyOne(r)">{{ $t('复制链接') }}</button>
                <span class="mm-sv__sep" aria-hidden="true">·</span>
                <button type="button" class="ss-link" @click="openImport(r.person.id)">{{ $t('代为采集') }}</button>
              </template>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <footer class="mm-sv__foot">
      <span>{{ $t('共 {n} 人', { n: filtered.length }) }}</span>
      <span class="grow"></span>
      <nav v-if="paged.pages > 1" class="mm-pager" :aria-label="$t('分页')">
        <button type="button" :disabled="paged.page <= 1" :aria-label="$t('上一页')" @click="page = paged.page - 1"><i class="ri-arrow-left-s-line"></i></button>
        <button v-for="n in paged.pages" :key="n" type="button" :class="{ on: n === paged.page }" :aria-current="n === paged.page ? 'page' : undefined" @click="page = n">{{ n }}</button>
        <button type="button" :disabled="paged.page >= paged.pages" :aria-label="$t('下一页')" @click="page = paged.page + 1"><i class="ri-arrow-right-s-line"></i></button>
      </nav>
    </footer>

    <TModal :open="importOpen" :title="$t('导入录音代为采集')" icon="ri-mic-line" size="md" :description="$t('管理员代员工导入一段 10～15 秒、只有本人说话的清晰录音。必须先取得本人对采集声纹的单独同意。')" @close="importOpen = false">
      <div class="mm-sv__imp" data-test="mm-vp-import-dialog">
        <div class="mm-sv__f">
          <span>{{ $t('员工') }}</span>
          <PersonPicker v-model="imp.personId" :people="people" :depts="depts" :multiple="false" :max-height="200" />
        </div>
        <label class="mm-sv__f">
          <span>{{ $t('录音文件') }}</span>
          <input ref="fileEl" type="file" accept=".mp3,.m4a,.wav,.aac,.amr,.flac,.ogg,.opus,.wma,.webm,.caf,.aiff,audio/*" data-test="mm-vp-file" @change="onFile" />
          <small v-if="imp.path" class="ss-muted">{{ imp.path }}</small>
        </label>
        <label class="mm-sv__consent">
          <input v-model="imp.consent" type="checkbox" data-test="mm-vp-consent" />
          <span>{{ $t('我已取得该员工本人对采集、使用声纹（含确认会议发言后用其本人发言补充声纹）的单独同意（个人信息保护法）；授权人与授权时间会记录在案。') }}</span>
        </label>
        <p v-if="impError" class="ss-note danger"><i class="ri-error-warning-line"></i>{{ impError }}</p>
      </div>
      <template #footer>
        <button type="button" class="ss-btn" @click="importOpen = false">{{ $t('取消') }}</button>
        <button type="button" class="ss-btn primary" :disabled="busy || !imp.personId || !imp.path || !imp.consent" data-test="mm-vp-import-submit" @click="submitImport">
          <i :class="busy ? 'ri-loader-4-line spin' : 'ri-check-line'"></i>{{ $t('校验并采集') }}
        </button>
      </template>
    </TModal>

    <TModal :open="recordOpen" :title="$t('现场录音采集声纹')" icon="ri-mic-line" size="md" :description="$t('直接用本机麦克风录 10～15 秒声音；请由被采集人本人朗读并授权同意。')" @close="recordOpen = false">
      <div class="mm-sv__imp" data-test="mm-vp-record-dialog">
        <div class="mm-sv__f">
          <span>{{ $t('员工') }}</span>
          <PersonPicker v-model="rec.personId" :people="people" :depts="depts" :multiple="false" :max-height="180" />
        </div>
        <VoiceRecorder v-if="recordOpen" :script="recordScript" :disabled="busy" @recorded="rec.recorded = $event" @reset="rec.recorded = null" />
        <label class="mm-sv__consent">
          <input v-model="rec.consent" type="checkbox" data-test="mm-vp-rec-consent" />
          <span>{{ rec.personId === myId ? $t('我同意采集本人的声纹（声音特征），并在我确认会议发言后用其中我本人的发言补充声纹（最多保留最近 5 条），只用于在会议纪要里识别我的发言，保存在这台电脑上，可以随时在声纹库关闭补充或删除声纹。') : $t('我已取得该员工本人对采集、使用声纹（含确认会议发言后用其本人发言补充声纹）的单独同意（个人信息保护法）；授权人与授权时间会记录在案。') }}</span>
        </label>
        <p v-if="recError" class="ss-note danger"><i class="ri-error-warning-line"></i>{{ recError }}</p>
      </div>
      <template #footer>
        <button type="button" class="ss-btn" @click="recordOpen = false">{{ $t('取消') }}</button>
        <button type="button" class="ss-btn primary" :disabled="busy || !rec.personId || !rec.recorded || !rec.consent" data-test="mm-vp-rec-submit" @click="submitRecord">
          <i :class="busy ? 'ri-loader-4-line spin' : 'ri-check-line'"></i>{{ $t('提交声纹') }}
        </button>
      </template>
    </TModal>
  </div>
</template>

<script setup lang="ts">
/** 声纹库：采集链接、推企微、覆盖率、全部 / 未采集 / 已采集 + 搜索 + 分页；删除 = 撤回授权；管理员可导入录音代为采集 */
import { computed, reactive, ref, watch } from 'vue';
import type { MmDept, MmPerson } from '../../../shared/meetingMgmt/types';
import { t as i18nT } from '../../i18n';
import { useDialog } from '../../composables/useDialog';
import { useNotificationStore } from '../../stores/notification';
import TModal from '../../components/TModal.vue';
import PersonChip from './PersonChip.vue';
import PersonPicker from './PersonPicker.vue';
import VoiceRecorder from './VoiceRecorder.vue';
import { errorMessage, mm, mmBoot } from './shared';
import { copyText, filePath, fmtMs, matchPerson, paginate, pickUrl, ratioPct } from './pagesLogic';

interface VpRow {
  person: MmPerson; deptName: string; status: 'collected' | 'missing'; consentAt?: number; enrolledAt?: number;
  /** 旧模型采的、本机已装新模型 → 建议重录；本人是否同意用确认过的会议补充、已补几条 */
  needsUpdate?: boolean; autoLearn?: boolean; extraCount?: number;
}
type FilterKey = 'all' | 'missing' | 'collected';
const FILTERS: Array<{ key: FilterKey; title: string }> = [
  { key: 'all', title: i18nT('全部人员') },
  { key: 'missing', title: i18nT('未采集') },
  { key: 'collected', title: i18nT('已采集') },
];
const PAGE_SIZE = 8;

const props = withDefaults(defineProps<{ people: MmPerson[]; depts: MmDept[]; refreshSeq?: number }>(), { refreshSeq: 0 });

const dialog = useDialog();
const notif = useNotificationStore();
const rows = ref<VpRow[]>([]);
const loading = ref(false);
const busy = ref(false);
const error = ref('');
const links = ref<Record<string, string>>({});
const sendResult = ref<{ sent: number; failed: Array<{ personId: string; error: string }> } | null>(null);
const filter = ref<FilterKey>('all');
const q = ref('');
const page = ref(1);
const importOpen = ref(false);
const imp = reactive({ personId: '', path: '', consent: false });
const impError = ref('');
const fileEl = ref<HTMLInputElement | null>(null);
const recordOpen = ref(false);
const rec = reactive<{ personId: string; consent: boolean; recorded: { data: string; ext: string; seconds: number } | null }>({ personId: '', consent: false, recorded: null });
const recError = ref('');

const wecomConnected = computed(() => !!mmBoot.value?.pushChannel || !!mmBoot.value?.wecomConnected);
const myId = computed(() => mmBoot.value?.me.person?.id || '');
/** 只配了群机器人：发一条群消息（@ 还没采集的人），按钮是不带令牌的群链接 */
const groupMode = computed(() => mmBoot.value?.pushChannel === 'webhook');
const collected = computed(() => rows.value.filter((r) => r.status === 'collected').length);
const coverage = computed(() => ratioPct(collected.value, rows.value.length));
const countOf = (k: FilterKey) => (k === 'all' ? rows.value.length : rows.value.filter((r) => r.status === k).length);
const filtered = computed(() => rows.value
  .filter((r) => filter.value === 'all' || r.status === filter.value)
  .filter((r) => matchPerson(r.person, r.deptName, q.value))
  // 未采集的排前面（原型），已采集按采集时间新的在前
  .sort((a, b) => (a.status === b.status ? (b.enrolledAt || 0) - (a.enrolledAt || 0) : a.status === 'missing' ? -1 : 1)));
const paged = computed(() => paginate(filtered.value, page.value, PAGE_SIZE));

async function load(): Promise<void> {
  loading.value = true;
  try {
    const r = await mm<VpRow[]>('voiceprint.list');
    rows.value = Array.isArray(r) ? r : [];
    error.value = '';
  } catch (e) {
    error.value = errorMessage(e);
  } finally {
    loading.value = false;
  }
}
watch(() => props.refreshSeq, () => { void load(); }, { immediate: true });

const personName = (id: string) => rows.value.find((r) => r.person.id === id)?.person.name || props.people.find((p) => p.id === id)?.name || id;
const recordScript = computed(() => {
  const row = rows.value.find((r) => r.person.id === rec.personId);
  const p = row?.person || props.people.find((x) => x.id === rec.personId);
  const dept = row?.deptName || props.depts.find((d) => d.id === p?.deptId)?.name || '';
  return i18nT('大家好，我是{dept}的{name}。这是我的声纹采集录音，用于在会议纪要里自动识别我的发言。我会用平时开会说话的音量和语速，把这段话完整地读完。', {
    dept, name: p?.name || '',
  });
});

/** voiceprint.link → { url（本人）, links: 每人一条 }；拿一次缓存起来 */
async function fetchLinks(): Promise<Record<string, string>> {
  const r = await mm<{ url?: string; links?: Array<{ personId: string; url: string }> } | string>('voiceprint.link');
  const map: Record<string, string> = {};
  if (r && typeof r === 'object' && Array.isArray(r.links)) for (const x of r.links) if (x?.personId && x.url) map[x.personId] = x.url;
  const mine = mmBoot.value?.me.person?.id;
  const own = pickUrl(r);
  if (mine && own && !map[mine]) map[mine] = own;
  if (!Object.keys(map).length) throw new Error(i18nT('没拿到采集链接，请先在「手机端」开启手机页服务'));
  links.value = map;
  return map;
}

/** 复制采集链接：未采集的人每人一行「姓名 · 部门：链接」（都采集了就复制全部） */
async function copyLink(): Promise<void> {
  busy.value = true;
  error.value = '';
  try {
    const map = await fetchLinks();
    const missing = rows.value.filter((r) => r.status === 'missing' && map[r.person.id]);
    const pick = missing.length ? missing : rows.value.filter((r) => map[r.person.id]);
    const text = pick.map((r) => `${r.person.name}${r.deptName ? ` · ${r.deptName}` : ''}${i18nT('：')}${map[r.person.id]}`).join('\n');
    if (await copyText(text)) notif.success(missing.length ? i18nT('已复制 {n} 位未采集员工的采集链接（每人一条，请分别发给本人）', { n: pick.length }) : i18nT('已复制 {n} 人的采集链接', { n: pick.length }));
    else error.value = i18nT('复制失败，请重试');
  } catch (e) {
    error.value = errorMessage(e);
  } finally {
    busy.value = false;
  }
}

async function copyOne(r: VpRow): Promise<void> {
  busy.value = true;
  error.value = '';
  try {
    const map = links.value[r.person.id] ? links.value : await fetchLinks();
    const url = map[r.person.id];
    if (!url) throw new Error(i18nT('没拿到 {name} 的采集链接', { name: r.person.name }));
    if (await copyText(url)) notif.success(i18nT('已复制 {name} 的采集链接', { name: r.person.name }));
  } catch (e) {
    error.value = errorMessage(e);
  } finally {
    busy.value = false;
  }
}

async function sendWecom(): Promise<void> {
  const ok = await dialog.confirm({
    title: groupMode.value ? i18nT('发送到企微群') : i18nT('推送到企微'),
    message: groupMode.value
      ? i18nT('在企微群里发一条声纹采集邀请，点名提醒还没采集的人（已采集的不打扰）？')
      : i18nT('给还没采集的人逐个推送声纹采集卡片（已采集的不打扰）？'),
  });
  if (!ok) return;
  busy.value = true;
  error.value = '';
  sendResult.value = null;
  try {
    const r = await mm<{ sent?: number; failed?: Array<{ personId: string; error: string }>; skipped?: number; group?: boolean }>('voiceprint.send');
    sendResult.value = { sent: Number(r?.sent) || 0, failed: Array.isArray(r?.failed) ? r!.failed : [] };
    if (r?.skipped) notif.success(i18nT('所有人都已采集过声纹，不用再发'));
    else if (!sendResult.value.failed.length) notif.success(r?.group ? i18nT('采集邀请已发到企微群') : i18nT('采集卡片已推送到企微'));
  } catch (e) {
    error.value = errorMessage(e);
  } finally {
    busy.value = false;
  }
}

async function remove(r: VpRow): Promise<void> {
  const ok = await dialog.confirm({
    title: i18nT('删除声纹（撤回授权）'),
    message: i18nT('删除 {name} 的声纹样本和授权记录？之后的会议里不再能自动识别 TA，需要重新授权采集。', { name: r.person.name }),
    danger: true,
    confirmLabel: i18nT('删除'),
  });
  if (!ok) return;
  busy.value = true;
  error.value = '';
  try {
    await mm('voiceprint.delete', { personId: r.person.id });
    notif.success(i18nT('已删除并撤回授权'));
    await load();
  } catch (e) {
    error.value = errorMessage(e);
  } finally {
    busy.value = false;
  }
}

/** 本人开 / 关「用确认过的会议补充声纹」（采集时已同意、默认开；只能本人操作）；关掉要确认（已补的样本一起删） */
async function toggleLearn(r: VpRow): Promise<void> {
  const on = !r.autoLearn;
  if (!on) {
    const ok = await dialog.confirm({
      title: i18nT('关闭会议补充'),
      message: i18nT('关闭后不再从会议里补充样本，已补充的 {n} 条样本会一并删除；注册时录的声纹不受影响。', { n: r.extraCount || 0 }),
      confirmLabel: i18nT('关闭并删除样本'),
      danger: true,
    });
    if (!ok) return;
  }
  busy.value = true;
  error.value = '';
  try {
    await mm('voiceprint.autoLearn.set', { enabled: on });
    notif.success(on ? i18nT('已开启：之后确认会议发言时会自动补充声纹') : i18nT('已关闭并删除会议补充样本'));
    await load();
  } catch (e) {
    error.value = errorMessage(e);
  } finally {
    busy.value = false;
  }
}

function openImport(personId: string): void {
  Object.assign(imp, { personId, path: '', consent: false });
  impError.value = '';
  if (fileEl.value) fileEl.value.value = '';
  importOpen.value = true;
}
function onFile(ev: Event): void {
  const f = (ev.target as HTMLInputElement).files?.[0];
  imp.path = filePath(f);
  impError.value = f && !imp.path ? i18nT('读不到这个文件的本机路径，请选择电脑上的录音文件') : '';
}
async function submitImport(): Promise<void> {
  busy.value = true;
  impError.value = '';
  try {
    await mm('voiceprint.enroll', { personId: imp.personId, path: imp.path, consent: true });
    importOpen.value = false;
    notif.success(i18nT('声纹已采集'));
    await load();
  } catch (e) {
    impError.value = errorMessage(e);
  } finally {
    busy.value = false;
  }
}

function openRecord(personId: string): void {
  Object.assign(rec, { personId: personId || myId.value, consent: false, recorded: null });
  recError.value = '';
  recordOpen.value = true;
}
async function submitRecord(): Promise<void> {
  if (!rec.recorded || !rec.personId) return;
  busy.value = true;
  recError.value = '';
  try {
    const r = await mm<{ ok: boolean; seconds?: number }>('voiceprint.enrollData', {
      personId: rec.personId, consent: true, data: rec.recorded.data, ext: rec.recorded.ext,
    });
    recordOpen.value = false;
    notif.success(r?.seconds ? i18nT('声纹已采集（{s} 秒）', { s: r.seconds }) : i18nT('声纹已采集'));
    await load();
  } catch (e) {
    recError.value = errorMessage(e);
  } finally {
    busy.value = false;
  }
}
</script>

<style scoped>
.mm-sv { display: grid; gap: 16px; }
.mm-sp__head { display: flex; align-items: flex-start; gap: 16px; flex-wrap: wrap; }
.mm-sp__head > div:first-child { flex: 1; min-width: 260px; display: grid; gap: 6px; }
.mm-sp__head h3 { margin: 0; font-size: 18px; }
.mm-sp__head p { margin: 0; color: var(--color-text-secondary); font-size: 13px; line-height: 1.6; }
.mm-sv__tip { margin: -6px 0 0; }
.mm-sv__sep { margin: 0 6px; color: var(--color-text-muted); }
.mm-sv__st { display: inline-flex; align-items: center; gap: 6px; flex-wrap: wrap; }
.mm-sv__learn { display: inline-flex; align-items: center; gap: 3px; font-size: 12px; color: var(--color-brand); }
.mm-sv__cov { display: grid; grid-template-columns: auto minmax(0, 1fr); gap: 40px; align-items: center; padding: 18px 24px; border-radius: var(--radius-5); background: var(--color-bg-hover); }
.mm-sv__num { display: grid; grid-template-columns: auto auto; align-items: baseline; column-gap: 6px; }
.mm-sv__num b { font-size: 26px; font-variant-numeric: tabular-nums; }
.mm-sv__num span { color: var(--color-text-secondary); font-size: 15px; }
.mm-sv__num small { grid-column: 1 / -1; font-size: 12.5px; color: var(--color-text-secondary); }
.mm-sv__bar { display: grid; gap: 8px; }
.mm-sv__bar small { font-size: 12.5px; color: var(--color-text-secondary); }
.mm-bar { display: block; height: 8px; border-radius: 4px; background: color-mix(in srgb, var(--color-border) 70%, transparent); overflow: hidden; }
.mm-bar b { display: block; height: 100%; border-radius: 4px; background: var(--gradient-brand, var(--color-brand)); }
.mm-sv__tools { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; border-bottom: 1px solid var(--color-border-subtle); }
.mm-sv__tools .grow { flex: 1; }
.mm-subtabs { display: flex; gap: 22px; }
.mm-subtabs button { position: relative; height: 40px; padding: 0; border: none; background: none; font: inherit; font-size: 14px; color: var(--color-text-secondary); cursor: pointer; display: inline-flex; align-items: center; gap: 6px; }
.mm-subtabs button em { font-style: normal; font-size: 11.5px; padding: 0 6px; border-radius: var(--radius-pill); background: var(--color-bg-hover); }
.mm-subtabs button.on { color: var(--color-text-primary); font-weight: 700; }
.mm-subtabs button.on::after { content: ''; position: absolute; inset-inline: 0; bottom: -1px; height: 2px; border-radius: 1px; background: var(--color-brand); }
.mm-search { display: flex; align-items: center; gap: 8px; width: min(100%, 240px); height: 34px; padding: 0 12px; margin-bottom: 6px; border: 1px solid var(--color-border); border-radius: var(--radius-4); background: var(--color-bg-card); color: var(--color-text-muted); }
.mm-search input { flex: 1; min-width: 0; border: none; outline: none; background: transparent; font: inherit; font-size: 13px; color: var(--color-text-primary); }
.mm-sv__tools .ss-btn { margin-bottom: 6px; }
.mm-sv__table td { height: 44px; font-size: 13px; }
.mm-sv__table td.mono { font-variant-numeric: tabular-nums; font-family: var(--font-mono); font-size: 12.5px; }
.mm-sv__empty { text-align: center !important; color: var(--color-text-secondary); }
.ss-link.danger { color: var(--color-danger); }
.mm-sv__foot { display: flex; align-items: center; gap: 10px; font-size: 12.5px; color: var(--color-text-secondary); }
.mm-sv__foot .grow { flex: 1; }
.mm-pager { display: flex; gap: 2px; }
.mm-pager button { min-width: 26px; height: 26px; border: none; border-radius: var(--radius-2); background: transparent; color: var(--color-text-secondary); font: inherit; font-size: 12.5px; cursor: pointer; }
.mm-pager button.on { background: var(--color-brand-subtle); color: var(--color-brand); font-weight: 700; }
.mm-pager button:disabled { opacity: .4; cursor: default; }
.mm-sv__imp { display: grid; gap: 14px; }
.mm-sv__f { display: grid; gap: 6px; font-size: 12.5px; }
.mm-sv__f > span { color: var(--color-text-secondary); }
.mm-sv__consent { display: flex; gap: 8px; align-items: flex-start; font-size: 12.5px; line-height: 1.55; padding: 10px 12px; border-radius: var(--radius-4); background: color-mix(in srgb, var(--color-warning) 10%, transparent); }
.mm-sv__consent input { margin-top: 3px; }
.spin { animation: mm-sv-spin 1s linear infinite; }
@keyframes mm-sv-spin { to { transform: rotate(360deg); } }
@media (max-width: 760px) { .mm-sv__cov { grid-template-columns: 1fr; gap: 12px; } }
</style>
