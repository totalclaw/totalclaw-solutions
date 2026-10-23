<template>
  <div class="zc-rb">
    <div class="ss-actions">
      <button type="button" class="ss-btn primary" :disabled="busy" :data-test="`zc-rb-hand-${kind}`" @click="hand"><i :class="busy ? 'ri-loader-4-line spin' : 'ri-robot-2-line'"></i>{{ handLabel }}</button>
      <button v-if="convId" type="button" class="ss-btn" :disabled="busy" @click="readBack"><i class="ri-download-cloud-2-line"></i>{{ $t('读回它的结果') }}</button>
      <button v-if="convId" type="button" class="ss-link" @click="openConv">{{ $t('查看执行过程') }}</button>
      <button type="button" class="ss-link" :data-test="`zc-rb-paste-${kind}`" @click="showPaste = !showPaste">{{ $t('粘贴结果') }}</button>
      <slot />
    </div>
    <p class="ss-muted">{{ $t('数字员工只读页面、不做任何操作；读完会回复一段清单，点「读回它的结果」收进来。它停在登录或验证码上时，先去内置浏览器处理。') }}</p>
    <div v-if="showPaste" class="zc-rb__paste">
      <textarea v-model="text" rows="5" :placeholder="$t('把数字员工回复里的 JSON 清单粘贴到这里')" :data-test="`zc-rb-text-${kind}`"></textarea>
      <button type="button" class="ss-btn sm primary" :disabled="busy || !text.trim()" :data-test="`zc-rb-import-${kind}`" @click="importText(text)">{{ $t('收进来') }}</button>
    </div>
    <p v-if="error" class="ss-note danger"><i class="ri-error-warning-line"></i>{{ error }}</p>
    <p v-if="note" class="ss-note ok" :data-test="`zc-rb-note-${kind}`"><i class="ri-check-line"></i>{{ note }}</p>
  </div>
</template>

<script setup lang="ts">
/** 让数字员工只读地读回一份清单（订单 / 询价单），再收进台账；也可以直接粘贴结果。 */
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { t as i18nT } from '../../i18n';
import { ensureSite, errorMessage, handToDigitalEmployee, lastReply, refreshState, zc } from './shared';

const props = defineProps<{ kind: 'orders' | 'inquiry'; handLabel: string; convTitle: string }>();
const emit = defineEmits<{ (e: 'done'): void }>();
const router = useRouter();
const KEY = `totalclaw:zcy-agent-readback:${props.kind}`;
const convId = ref((() => { try { return localStorage.getItem(KEY) || ''; } catch { return ''; } })());
const busy = ref(false);
const showPaste = ref(false);
const text = ref('');
const error = ref('');
const note = ref('');

async function guard(fn: () => Promise<void>): Promise<void> {
  busy.value = true; error.value = ''; note.value = '';
  try { await fn(); } catch (e) { error.value = errorMessage(e); } finally { busy.value = false; }
}
async function hand(): Promise<void> {
  await guard(async () => {
    await ensureSite();
    const instruction = await zc<string>(`${props.kind}.patrolInstruction`);
    convId.value = await handToDigitalEmployee(props.convTitle, instruction);
    try { localStorage.setItem(KEY, convId.value); } catch { /* 忽略 */ }
  });
}
async function importText(raw: string): Promise<void> {
  await guard(async () => {
    const r = await zc<{ added: number; updated: number; dropped: number }>(`${props.kind}.importReply`, { text: raw });
    await refreshState();
    note.value = i18nT('新增 {a} 条，更新 {b} 条', { a: r.added, b: r.updated }) + (r.dropped ? i18nT('；{n} 条缺编号或状态认不出，没有收', { n: r.dropped }) : '');
    text.value = ''; showPaste.value = false;
    emit('done');
  });
}
async function readBack(): Promise<void> {
  let raw = '';
  await guard(async () => { raw = await lastReply(convId.value); });
  if (raw) await importText(raw);
}
function openConv(): void { void router.push(`/conversations/${convId.value}`).catch(() => {}); }
</script>

<style scoped>
.zc-rb { display: grid; gap: 8px; }
.zc-rb__paste { display: grid; gap: 8px; justify-items: start; }
.zc-rb__paste textarea { width: 100%; box-sizing: border-box; border-radius: var(--radius-3); border: 1px solid var(--color-border); background: var(--color-bg-input); color: var(--color-text-primary); font: 12px/1.5 var(--font-mono); padding: 8px 10px; resize: vertical; }
.spin { animation: zc-spin 1s linear infinite; }
@keyframes zc-spin { to { transform: rotate(360deg); } }
</style>
