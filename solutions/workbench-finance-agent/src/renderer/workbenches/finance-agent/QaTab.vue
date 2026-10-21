<template>
  <div class="ss-module">
    <ModuleHeader :meta="meta" />
    <StickyProgress :title="$t('财税问答')" :metas="metas" :runtime="runtime" :current-key="currentKey" @jump="jump" />

    <div class="ss-steps">
      <StepCard step-key="sources" :index="0" :title="metas[0].title" :hint="metas[0].hint" :runtime="runtime.sources">
        <p class="ss-note info"><i class="ri-book-2-line"></i>{{ $t('内置政策库：约 33 条常用财税要点（小规模优惠、六税两费、小微所得税、个税税率与专项附加、进项抵扣、税前扣除、发票、印花税、申报期限、会计准则等），整理截至 2025 年底，含 2026 年施行的《增值税法》。政策有执行期限，执行前请核对最新文件。') }}</p>
        <FileDrop kind="policy" :label="$t('导入企业财务制度')" :hint="$t('报销制度、费用标准、审批流程等（PDF / Word / 文本），问答时一并检索')" :disabled="!!busy" @picked="importPolicies" />
        <ul v-if="policies.length" class="fa-policies">
          <li v-for="p in policies" :key="p.id">
            <i class="ri-file-text-line"></i>
            <span class="fa-ellipsis">{{ p.fileName }}</span>
            <span class="ss-muted">{{ $t('{n} 段', { n: p.chunks }) }} · {{ fmtDateTime(p.importedAt) }}</span>
            <button type="button" class="ss-link" @click="removePolicy(p.id)">{{ $t('删除') }}</button>
          </li>
        </ul>
        <p v-else class="ss-muted">{{ $t('还没有导入企业制度，只按内置政策库回答') }}</p>
      </StepCard>

      <StepCard step-key="ask" :index="1" :title="metas[1].title" :hint="metas[1].hint" :runtime="runtime.ask">
        <div ref="listEl" class="fa-chat">
          <div v-for="m in messages" :key="m.id" class="fa-msg" :class="m.role">
            <div class="fa-bubble">
              <p class="fa-pre">{{ m.text }}</p>
              <div v-if="m.role === 'assistant'" class="fa-msg__meta">
                <span v-if="m.model">{{ $t('由 {p0} 回答', { p0: modelLabel(m.model) }) }}</span>
                <button v-if="m.citations?.length" type="button" class="ss-link" @click="toggle(m.id)">
                  {{ open[m.id] ? $t('收起依据') : $t('查看依据（{n}）', { n: m.citations.length }) }}
                </button>
              </div>
              <ol v-if="open[m.id] && m.citations?.length" class="fa-cites">
                <li v-for="(c, i) in m.citations" :key="i">
                  <strong>[{{ i + 1 }}] {{ c.title }}</strong>
                  <span class="ss-chip">{{ c.source === 'policy' ? $t('企业制度') : $t('内置政策') }}</span>
                  <span v-if="c.ref && c.source === 'builtin'" class="ss-muted">{{ c.ref }}</span>
                  <p class="fa-pre ss-muted">{{ c.excerpt }}</p>
                </li>
              </ol>
            </div>
          </div>
          <p v-if="!messages.length" class="ss-empty">{{ $t('还没有提问，试试下面的常见问题') }}</p>
          <div v-if="busy === 'ask'" class="fa-msg assistant"><div class="fa-bubble"><i class="ri-loader-4-line spin"></i> {{ $t('正在查资料作答…') }}</div></div>
        </div>
        <div class="fa-quick">
          <button v-for="q in quick" :key="q" type="button" class="ss-btn sm ghost" :disabled="!!busy" @click="ask(q)">{{ q }}</button>
        </div>
        <div class="fa-input">
          <textarea v-model="question" rows="3" :placeholder="$t('输入财税问题，Ctrl / ⌘ + Enter 发送')" :disabled="busy === 'ask'" @keydown.enter="onKey"></textarea>
          <div class="fa-input__actions">
            <button type="button" class="ss-btn primary" :disabled="!!busy || !question.trim()" @click="ask(question)"><i class="ri-send-plane-line"></i>{{ $t('发送') }}</button>
            <button type="button" class="ss-btn sm ghost" :disabled="!!busy || !messages.length" @click="clearQa"><i class="ri-delete-bin-line"></i>{{ $t('清空') }}</button>
          </div>
        </div>
      </StepCard>

      <StepCard step-key="memory" :index="2" :title="metas[2].title" :hint="metas[2].hint" :runtime="runtime.memory">
        <p v-if="ledger?.notes" class="fa-pre fa-notes">{{ ledger.notes }}</p>
        <p v-else class="ss-muted">{{ $t('当前账套还没有记忆要点') }}</p>
        <div class="fa-remember">
          <input v-model.trim="note" type="text" :placeholder="$t('记一条要点，如：本公司差旅住宿一线城市上限 600 元 / 晚')" @keydown.enter="remember" />
          <button type="button" class="ss-btn sm primary" :disabled="!!busy || !note" @click="remember"><i class="ri-bookmark-line"></i>{{ $t('记住') }}</button>
        </div>
      </StepCard>
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * 财务问答智能体：知识来源（内置政策 + 企业制度）→ 提问（带依据）→ 账套记忆。
 */
import { computed, nextTick, reactive, ref, watch } from 'vue';
import { useNotificationStore } from '../../stores/notification';
import { t as i18nT } from '../../i18n';
import StepCard from '../service-settlement/StepCard.vue';
import StickyProgress from '../service-settlement/StickyProgress.vue';
import ModuleHeader from './ModuleHeader.vue';
import FileDrop from './FileDrop.vue';
import {
  errorMessage, fa, faState, fmtDateTime, modelLabel, refreshState, scrollToStep,
  type FaModuleMeta, type StepMeta, type StepRuntime,
} from './shared';

defineProps<{ meta: FaModuleMeta; focus?: any }>();
defineEmits<{ (e: 'goto', module: string, payload?: any): void }>();
const notif = useNotificationStore();

const policies = computed(() => faState.value?.data.policies || []);
const messages = computed(() => faState.value?.data.qa || []);
const ledger = computed(() => faState.value?.ledgers.find((l) => l.id === faState.value?.activeLedgerId) || null);
const question = ref('');
const note = ref('');
const busy = ref('');
const errors = ref<Record<string, string>>({});
const open = reactive<Record<string, boolean>>({});
const listEl = ref<HTMLElement | null>(null);

const quick = [
  i18nT('小规模纳税人季度免征额是多少'),
  i18nT('员工个税累计预扣怎么算'),
  i18nT('餐饮发票能不能抵扣进项'),
  i18nT('业务招待费税前扣除标准'),
];

const metas: StepMeta[] = [
  { key: 'sources', title: i18nT('知识来源'), hint: i18nT('内置税法 / 会计准则要点 + 企业内部财务制度') },
  { key: 'ask', title: i18nT('提问'), hint: i18nT('按资料作答并标明依据，记住同一账套的上下文') },
  { key: 'memory', title: i18nT('账套记忆'), hint: i18nT('记下这个账套的要点，分析和问答都会参考') },
];
const runtime = computed<Record<string, StepRuntime>>(() => {
  const st = (key: string, done: boolean, summary?: string): StepRuntime => (busy.value === key ? { state: 'running' }
    : errors.value[key] ? { state: 'failed', error: errors.value[key] } : done ? { state: 'done', summary } : { state: 'todo' });
  const asked = messages.value.filter((m) => m.role === 'user').length;
  return {
    sources: st('sources', true, policies.value.length ? i18nT('内置政策 + {n} 份企业制度', { n: policies.value.length }) : i18nT('内置政策库')),
    ask: st('ask', asked > 0, i18nT('已问 {n} 个问题', { n: asked })),
    memory: st('memory', !!ledger.value?.notes),
  };
});
const currentKey = computed(() => metas.find((m) => runtime.value[m.key].state !== 'done')?.key || 'ask');

watch(() => messages.value.length, async () => {
  await nextTick();
  if (listEl.value) listEl.value.scrollTop = listEl.value.scrollHeight;
}, { immediate: true });

async function run(key: string, fn: () => Promise<unknown>): Promise<boolean> {
  busy.value = key;
  errors.value = { ...errors.value, [key]: '' };
  try { await fn(); await refreshState(); return true; } catch (e) { errors.value = { ...errors.value, [key]: errorMessage(e) }; return false; } finally { busy.value = ''; }
}
function importPolicies(paths: string[]): void { void run('sources', () => fa('policy.import', { paths })); }
async function removePolicy(id: string): Promise<void> {
  if (!window.confirm(i18nT('删除这份制度？'))) return;
  try { await fa('policy.remove', { id }); await refreshState(); } catch (e) { notif.error(errorMessage(e)); }
}
async function ask(q: string): Promise<void> {
  const text = q.trim();
  if (!text || busy.value) return;
  question.value = '';
  const ok = await run('ask', () => fa('qa.ask', { question: text }));
  if (!ok) question.value = text;
}
function onKey(ev: KeyboardEvent): void {
  if (ev.ctrlKey || ev.metaKey) { ev.preventDefault(); void ask(question.value); }
}
async function clearQa(): Promise<void> {
  if (!window.confirm(i18nT('清空本账套的问答记录？'))) return;
  await run('ask', () => fa('qa.clear'));
}
async function remember(): Promise<void> {
  if (!note.value) return;
  const text = note.value;
  if (await run('memory', () => fa('ledger.remember', { text }))) note.value = '';
}
function toggle(id: string): void { open[id] = !open[id]; }
function jump(key: string): void { void scrollToStep(key); }
</script>

<style scoped>
.fa-policies { list-style: none; margin: 0; padding: 0; display: grid; gap: 6px; font-size: 12.5px; }
.fa-policies li { display: flex; gap: 8px; align-items: center; padding: 6px 10px; border-radius: 8px; background: var(--color-bg-hover); }
.fa-policies i { color: var(--color-brand); }
.fa-ellipsis { flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.fa-chat { display: grid; gap: 10px; max-height: 480px; min-height: 120px; overflow-y: auto; padding: 10px; border-radius: 12px; background: var(--color-bg-primary); align-content: start; }
.fa-msg { display: flex; }
.fa-msg.user { justify-content: flex-end; }
.fa-bubble { max-width: 82%; padding: 9px 12px; border-radius: 12px; font-size: 13px; line-height: 1.65; background: var(--color-bg-card); border: 1px solid var(--color-border); }
.fa-msg.user .fa-bubble { background: color-mix(in srgb, var(--color-brand) 12%, var(--color-bg-card)); border-color: transparent; }
.fa-bubble p { margin: 0; }
.fa-msg__meta { display: flex; gap: 10px; font-size: 11.5px; color: var(--color-text-secondary); margin-top: 6px; }
.fa-cites { margin: 8px 0 0; padding-left: 0; list-style: none; display: grid; gap: 8px; font-size: 12px; }
.fa-cites li { display: grid; gap: 2px; border-left: 2px solid var(--color-brand); padding-left: 8px; }
.fa-pre { white-space: pre-wrap; }
.fa-quick { display: flex; gap: 6px; flex-wrap: wrap; }
.fa-input { display: flex; gap: 8px; align-items: flex-end; }
.fa-input textarea { flex: 1; min-width: 0; border-radius: 10px; border: 1px solid var(--color-border); background: var(--color-bg-input, var(--color-bg-primary)); color: var(--color-text-primary); font: inherit; font-size: 13px; padding: 8px 10px; resize: vertical; }
.fa-input__actions { display: grid; gap: 6px; }
.fa-notes { margin: 0; font-size: 12.5px; padding: 8px 10px; border-radius: 8px; background: var(--color-bg-hover); }
.fa-remember { display: flex; gap: 8px; }
.fa-remember input { flex: 1; min-width: 0; height: 32px; border-radius: 8px; border: 1px solid var(--color-border); background: var(--color-bg-primary); color: var(--color-text-primary); padding: 0 8px; font: inherit; }
.spin { animation: fa-spin 1s linear infinite; }
@keyframes fa-spin { to { transform: rotate(360deg); } }
</style>
