<template>
  <div class="ca-qa">
    <div class="ca-qa__main">
      <section class="ss-panel">
        <h3><i class="ri-chat-smile-3-line"></i>{{ $t('试问一个问题') }}</h3>
        <p class="ss-muted">{{ $t('和学生在手机上问的是同一套判定：FAQ 命中直接给审定答案；知识库有依据才作答并列出处；没有依据不编，转给对应部门；敏感问题立即给求助方式。') }}</p>
        <form class="ss-actions" @submit.prevent="ask">
          <input v-model="question" class="ca-input" maxlength="500" :placeholder="$t('例如：国家助学金什么时候申请？')" data-test="ca-qa-input" />
          <button type="submit" class="ss-btn primary" :disabled="asking || !question.trim()" data-test="ca-qa-ask"><i :class="asking ? 'ri-loader-4-line spin' : 'ri-send-plane-2-line'"></i>{{ $t('提问') }}</button>
        </form>
        <p v-if="!hasKb" class="ss-note warn"><i class="ri-alert-line"></i>{{ $t('知识库里还没有资料：所有问题都会被转办。先到「校园知识库」导入资料') }}</p>
        <p v-if="asking" class="ss-note info"><i class="ri-loader-4-line spin"></i>{{ $t('正在检索资料并作答…') }}</p>
        <p v-if="askError" class="ss-note danger"><i class="ri-error-warning-line"></i>{{ askError }}</p>
        <article v-if="last" class="ca-answer" :class="last.kind" data-test="ca-qa-answer">
          <header><span class="ss-chip" :class="kindClass(last.kind)">{{ kindLabel(last.kind) }}</span><span v-if="last.domain" class="ss-chip"><i class="ri-robot-2-line"></i>{{ domainName(last.domain) }}</span><small class="ss-muted">{{ $t('{n} 秒', { n: (last.ms / 1000).toFixed(1) }) }}</small><small v-if="last.dept" class="ss-muted">{{ $t('已转给：{p0}', { p0: last.dept }) }}</small></header>
          <p class="ca-pre">{{ last.text }}</p>
          <ol v-if="last.sources.length" class="ca-sources">
            <li v-for="(s, i) in last.sources" :key="i"><b>{{ s.title }}</b><span v-if="s.dept"> · {{ s.dept }}</span><br>{{ s.snippet }}</li>
          </ol>
          <div v-if="last.kind !== 'sensitive'" class="ss-actions">
            <button type="button" class="ss-btn sm" :class="{ primary: fb[last.qaId] === 'up' }" @click="feedback(last.qaId, 'up')"><i class="ri-thumb-up-line"></i>{{ $t('有用') }}</button>
            <button type="button" class="ss-btn sm" :class="{ primary: fb[last.qaId] === 'down' }" @click="feedback(last.qaId, 'down')"><i class="ri-thumb-down-line"></i>{{ $t('没用') }}</button>
          </div>
        </article>
      </section>

      <section class="ss-panel">
        <h3><i class="ri-history-line"></i>{{ $t('问答记录') }}</h3>
        <div class="ca-filter">
          <button v-for="k in FILTERS" :key="k.key" type="button" :class="{ on: filter === k.key }" @click="setFilter(k.key)">{{ k.label }}</button>
          <button type="button" class="ss-link" @click="loadRecords"><i class="ri-refresh-line"></i>{{ $t('刷新') }}</button>
        </div>
        <div v-if="records.length" class="ss-table-wrap tall">
          <table class="ss-table">
            <thead><tr><th>{{ $t('时间') }}</th><th>{{ $t('渠道') }}</th><th>{{ $t('问题') }}</th><th>{{ $t('答复') }}</th><th>{{ $t('出处') }}</th><th>{{ $t('反馈') }}</th></tr></thead>
            <tbody>
              <tr v-for="r in records" :key="r.id">
                <td>{{ fmtDateTime(r.at) }}</td>
                <td>{{ r.channel === 'mobile' ? $t('手机') : $t('电脑') }}</td>
                <td class="ca-wrap">{{ r.question }}</td>
                <td class="ca-wrap"><span class="ss-chip" :class="kindClass(r.kind)">{{ kindLabel(r.kind) }}</span> <small v-if="r.domain" class="ss-muted">{{ domainName(r.domain) }}</small> {{ r.answer.slice(0, 120) }}</td>
                <td class="ca-wrap">{{ r.sources.map((s) => s.title).join('；') || '—' }}</td>
                <td>{{ r.feedback === 'up' ? $t('有用') : r.feedback === 'down' ? $t('没用') : '—' }}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p v-else class="ss-muted">{{ $t('还没有记录') }}</p>
      </section>
    </div>

    <aside class="ss-panel ca-qa__mobile">
      <h3><i class="ri-qr-code-line"></i>{{ $t('学生手机扫码提问') }}</h3>
      <p class="ss-muted">{{ $t('手机和这台电脑在同一个校园网里即可，不用安装、不用注册。二维码里带校园口令，换口令后旧码失效。') }}</p>
      <template v-if="mobile?.running && mobile.joinUrl">
        <img v-if="qr" :src="qr" class="ca-qr" alt="" data-test="ca-mobile-qr" />
        <code class="ca-url">{{ mobile.joinUrl }}</code>
        <div class="ss-actions">
          <button type="button" class="ss-btn sm" @click="copy(mobile.joinUrl)"><i class="ri-file-copy-line"></i>{{ $t('复制链接') }}</button>
          <button type="button" class="ss-btn sm" :disabled="!!mbusy" @click="downloadQr"><i class="ri-download-2-line"></i>{{ $t('保存二维码') }}</button>
          <button type="button" class="ss-btn sm" :disabled="!!mbusy" @click="mobileAct('mobile.rotateKey')">{{ rotateArmed ? $t('确认更换') : $t('更换口令') }}</button>
          <button type="button" class="ss-btn sm danger" :disabled="!!mbusy" @click="mobileAct('mobile.stop')">{{ $t('停止服务') }}</button>
        </div>
        <p class="ss-muted">{{ $t('每台手机每天最多提问 {n} 次（在「运维与设置」里改）', { n: caState?.settings.mobileDailyLimit }) }}</p>
      </template>
      <div v-else class="ss-actions">
        <button type="button" class="ss-btn primary" :disabled="!!mbusy" data-test="ca-mobile-start" @click="mobileAct('mobile.start')"><i :class="mbusy ? 'ri-loader-4-line spin' : 'ri-wifi-line'"></i>{{ $t('开启手机服务') }}</button>
      </div>
    </aside>
  </div>
</template>

<script setup lang="ts">
/** 校园智能问答：电脑端试问 + 学生手机端二维码 + 问答记录 */
import { computed, onMounted, ref, watch } from 'vue';
import QRCode from 'qrcode';
import type { CaAnswer, CaAnswerKind, CaQaRecord } from '@totalclaw/ipc-contracts';
import { useNotificationStore } from '../../stores/notification';
import { t as i18nT } from '../../i18n';
import { ca, caState, errorMessage, fmtDateTime, kindClass, kindLabel, refreshState } from './shared';

const notif = useNotificationStore();
const question = ref('');
const asking = ref(false);
const askError = ref('');
const last = ref<CaAnswer | null>(null);
const fb = ref<Record<string, 'up' | 'down'>>({});
const records = ref<CaQaRecord[]>([]);
const filter = ref<'' | CaAnswerKind>('');
const mbusy = ref('');
const rotateArmed = ref(false);
const qr = ref('');
const mobile = computed(() => caState.value?.mobile || null);
const domainName = (id: string): string => caState.value?.domains.find((d) => d.id === id)?.name || '';
const hasKb = computed(() => !!caState.value && (caState.value.stats.docsBuilt > 0 || caState.value.faqs.length > 0));

const FILTERS: Array<{ key: '' | CaAnswerKind; label: string }> = [
  { key: '', label: i18nT('全部') },
  { key: 'faq', label: kindLabel('faq') },
  { key: 'answer', label: kindLabel('answer') },
  { key: 'quote', label: kindLabel('quote') },
  { key: 'no_evidence', label: kindLabel('no_evidence') },
  { key: 'sensitive', label: kindLabel('sensitive') },
];

async function ask(): Promise<void> {
  asking.value = true;
  askError.value = '';
  try {
    last.value = await ca<CaAnswer>('qa.ask', { question: question.value });
    void loadRecords();
    void refreshState();
  } catch (e) { askError.value = errorMessage(e); } finally { asking.value = false; }
}
async function feedback(qaId: string, value: 'up' | 'down'): Promise<void> {
  const next = fb.value[qaId] === value ? null : value;
  try {
    await ca('qa.feedback', { qaId, value: next });
    const copy = { ...fb.value };
    if (next) copy[qaId] = next; else delete copy[qaId];
    fb.value = copy;
    void loadRecords();
  } catch (e) { notif.error(errorMessage(e)); }
}
async function loadRecords(): Promise<void> {
  try { records.value = await ca<CaQaRecord[]>('qa.list', { kind: filter.value || undefined, limit: 200 }); } catch (e) { notif.error(errorMessage(e)); }
}
function setFilter(k: '' | CaAnswerKind): void { filter.value = k; void loadRecords(); }

async function mobileAct(action: string): Promise<void> {
  if (action === 'mobile.rotateKey' && !rotateArmed.value) {
    rotateArmed.value = true;
    setTimeout(() => { rotateArmed.value = false; }, 3000);
    return;
  }
  rotateArmed.value = false;
  mbusy.value = action;
  try { await ca(action); await refreshState(); } catch (e) { notif.error(errorMessage(e)); } finally { mbusy.value = ''; }
}
async function copy(text: string): Promise<void> {
  try { await navigator.clipboard.writeText(text); notif.success(i18nT('已复制')); } catch { notif.warn(i18nT('复制失败，请手动选择链接复制')); }
}
function downloadQr(): void {
  if (!qr.value) return;
  const a = document.createElement('a');
  a.href = qr.value;
  a.download = `${caState.value?.settings.schoolName || 'campus'}-${i18nT('校园问答二维码')}.png`;
  a.click();
}

watch(() => mobile.value?.joinUrl, async (url) => {
  qr.value = url ? await QRCode.toDataURL(url, { margin: 1, width: 560 }).catch(() => '') : '';
}, { immediate: true });
onMounted(() => { void loadRecords(); });
</script>

<style scoped>
.ca-qa { display: grid; gap: 14px; grid-template-columns: minmax(0, 1fr) 320px; align-items: start; }
@media (max-width: 1000px) { .ca-qa { grid-template-columns: 1fr; } }
.ca-qa__main { display: grid; gap: 14px; min-width: 0; }
.ca-qa__mobile { position: sticky; top: 0; }
.ca-input { flex: 1; min-width: 240px; height: 36px; border: 1px solid var(--color-border); border-radius: var(--radius-3); padding: 0 10px; font: inherit; background: var(--color-bg-input); color: var(--color-text); }
.ca-answer { border: 1px solid var(--color-border); border-radius: var(--radius-5); padding: 12px 14px; display: grid; gap: 8px; }
.ca-answer header { display: flex; gap: 10px; align-items: center; flex-wrap: wrap; }
.ca-answer.sensitive { border-color: color-mix(in srgb, var(--color-danger) 45%, var(--color-border)); background: color-mix(in srgb, var(--color-danger) 5%, transparent); }
.ca-answer.no_evidence { border-color: color-mix(in srgb, var(--color-warning) 45%, var(--color-border)); }
.ca-qr { width: 100%; max-width: 260px; justify-self: center; border-radius: var(--radius-3); background: var(--caqt-surface); padding: 6px; }
.ca-url { font-size: 11.5px; word-break: break-all; color: var(--color-text-secondary); }

/* ─── 调色板（docs/ui-design-system.md）：经典主题保持原值；界面主题（data-ui-theme）下映射全局 token ─── */
.ca-qa { /* ui-theme-exempt: 经典主题原值 */
  --caqt-surface: #fff;
}
:root[data-ui-theme] .ca-qa {
  --caqt-surface: var(--color-bg-card);
}
</style>
