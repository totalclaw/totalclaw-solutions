<template>
  <div class="fau-sign" data-test="fau-signoff">
    <div class="fau-levels">
      <div v-for="l in run.requiredLevels" :key="l" class="fau-level" :class="levelState(l)">
        <strong>{{ $t(LEVEL_LABEL[l]) }}</strong>
        <small v-if="doneRec(l)">{{ doneRec(l)!.signer.name }} · <FauNum :value="fmtTime(doneRec(l)!.at)" /></small>
        <small v-else-if="nextLevel === l">{{ $t('轮到这一级') }}</small>
        <small v-else>{{ $t('待签') }}</small>
      </div>
    </div>
    <p v-if="forcedApprove" class="ss-note warn"><i class="ri-alarm-warning-line"></i>{{ $t('命中升级条件（如试算不平、跨期 > 5 万、不明扣款 > 1000），必须由批准人签核') }}</p>
    <p v-if="run.status === 'returned' && run.returned" class="ss-note danger" data-test="fau-returned">
      <i class="ri-arrow-go-back-line"></i>{{ $t('{p0}退回：{p1}（回到第 {n} 步）', { p0: $t(LEVEL_LABEL[run.returned.level]), p1: run.returned.comment, n: STEP_ORDER.indexOf(run.returned.toStep) + 1 }) }}
    </p>

    <div v-if="canSign" class="fau-sign__form">
      <div class="ss-grid">
        <label class="ss-field">
          <span>{{ $t('签核人身份（{p0}）', { p0: $t(LEVEL_LABEL[nextLevel!]) }) }}</span>
          <select v-model="signerId" data-test="fau-signer">
            <option v-for="s in eligible" :key="s.id" :value="s.id">{{ s.name }} · {{ s.title }}</option>
            <option value="__manual">{{ $t('手动填写') }}</option>
          </select>
        </label>
        <template v-if="signerId === '__manual'">
          <label class="ss-field"><span>{{ $t('姓名') }}</span><input v-model.trim="manual.name" data-test="fau-signer-name" /></label>
          <label class="ss-field"><span>{{ $t('岗位') }}</span><input v-model.trim="manual.title" data-test="fau-signer-title" /></label>
        </template>
      </div>

      <div v-if="run.reminders.length" class="fau-acks">
        <div class="fau-row"><strong class="grow">{{ $t('提醒项：逐条确认「已知悉」') }}</strong><button type="button" class="ss-link" @click="ackAll">{{ $t('全部勾选') }}</button></div>
        <label v-for="r in run.reminders" :key="r.id" class="fau-ack" :class="{ locked: r.approverOnly && nextLevel !== 'approve' }">
          <input v-model="acks" type="checkbox" :value="r.id" :disabled="r.approverOnly && nextLevel !== 'approve'" :data-test="`fau-ack-${r.id}`" />
          <span class="grow">{{ msg(r.message) }}</span>
          <span v-if="r.approverOnly" class="fau-badge warn">{{ $t('批准人确认') }}</span>
          <span v-else-if="r.source === 'escalation'" class="fau-badge bad">{{ $t('升级') }}</span>
        </label>
      </div>

      <label class="ss-field">
        <span>{{ run.reminders.length ? $t('意见 / 知悉理由（必填）') : $t('意见') }}</span>
        <textarea v-model="comment" data-test="fau-sign-comment"></textarea>
      </label>
      <div class="ss-actions">
        <template v-if="nextLevel === 'prepare'">
          <button type="button" class="ss-btn primary" :disabled="busy" data-test="fau-sign-prepare" @click="submit('approve')"><i class="ri-quill-pen-line"></i>{{ $t('编制签核') }}</button>
        </template>
        <template v-else>
          <button type="button" class="ss-btn primary" :disabled="busy" data-test="fau-sign-approve" @click="submit('approve')"><i class="ri-check-double-line"></i>{{ $t('通过（{p0}）', { p0: $t(LEVEL_LABEL[nextLevel!]) }) }}</button>
          <span class="grow"></span>
          <label class="ss-field inline">
            <span>{{ $t('退回到') }}</span>
            <select v-model="returnTo" data-test="fau-return-step">
              <option v-for="k in RETURN_STEPS" :key="k" :value="k">{{ $t('第 {n} 步', { n: STEP_ORDER.indexOf(k) + 1 }) }} · {{ metaTitle(k) }}</option>
            </select>
          </label>
          <button type="button" class="ss-btn danger" :disabled="busy" data-test="fau-sign-return" @click="submit('return')"><i class="ri-arrow-go-back-line"></i>{{ $t('退回') }}</button>
        </template>
      </div>
      <p v-if="error" class="ss-note danger" data-test="fau-sign-error"><i class="ri-error-warning-line"></i>{{ error }}</p>
    </div>
    <p v-else-if="!run.artifacts.length" class="ss-note"><i class="ri-information-line"></i>{{ $t('还没有生成底稿，不能签核') }}</p>
    <p v-else-if="run.status === 'archived'" class="ss-note ok"><i class="ri-shield-check-line"></i>{{ $t('各级签核完成，已归档') }}</p>

    <div class="fau-row">
      <strong class="grow">{{ $t('签核历史') }}</strong>
      <button type="button" class="ss-btn sm" :disabled="busy" data-test="fau-verify" @click="verify"><i class="ri-shield-keyhole-line"></i>{{ $t('校验签核') }}</button>
    </div>
    <p v-if="verifyResult" class="ss-note" :class="verifyResult.ok ? 'ok' : 'danger'" data-test="fau-verify-result">
      <i :class="verifyResult.ok ? 'ri-shield-check-line' : 'ri-shield-cross-line'"></i>{{ msg(verifyResult.message) }}
    </p>
    <ul v-if="verifyResult && verifyResult.tampered.length" class="fau-prov">
      <li v-for="t in verifyResult.tampered" :key="t.path"><FauNum :value="t.path" /></li>
    </ul>
    <div v-if="history.length" class="fau-table-wrap">
      <table class="fau-table">
        <thead><tr><th>{{ $t('签核级别') }}</th><th>{{ $t('决定') }}</th><th>{{ $t('签核人') }}</th><th>{{ $t('签核时间') }}</th><th>{{ $t('意见') }}</th></tr></thead>
        <tbody>
          <tr v-for="h in history" :key="h.id" :class="{ bad: h.decision === 'return' }">
            <td>{{ $t(LEVEL_LABEL[h.level]) }}</td>
            <td>{{ h.decision === 'approve' ? $t('通过') : $t('退回') }}<span v-if="h.sodWaived" class="fau-badge warn">{{ $t('职责未分离') }}</span></td>
            <td>{{ h.signer.name }} · {{ h.signer.title }}</td>
            <td><FauNum :value="fmtTime(h.at)" /></td>
            <td class="wrap">{{ h.comment }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * 人工签核卡（第 9 节）：编制 → 复核 → 批准。职责分离、已知悉、退回意见都由主进程再校一遍，
 * 报错原样写在卡上（不吞）。签核记录只追加、哈希成链；「校验签核」重算链并比对文件哈希。
 */
import { computed, ref, watch } from 'vue';
import type { FauCompany, FauRun, FauSignLevel, FauSignoffRecord, FauSignoffVerify, FauStepKey } from '@totalclaw/ipc-contracts';
import FauNum from './FauNum.vue';
import { LEVEL_LABEL, STEP_ORDER, errorMessage, fau, fmtTime, msg, stepMetas } from './shared';

const props = defineProps<{ run: FauRun; company: FauCompany; active: FauSignoffRecord[]; nextLevel: FauSignLevel | null; baseLevels: FauSignLevel[] }>();
const emit = defineEmits<{ (e: 'changed'): void }>();

const RETURN_STEPS: FauStepKey[] = ['validate', 'analyze', 'draft'];
const metaTitle = (k: FauStepKey) => stepMetas().find((m) => m.key === k)?.title || k;
const busy = ref(false);
const error = ref('');
const acks = ref<string[]>([]);
const comment = ref('');
const returnTo = ref<FauStepKey>('analyze');
const signerId = ref('');
const manual = ref({ name: '', title: '' });
const history = ref<FauSignoffRecord[]>([]);
const verifyResult = ref<FauSignoffVerify | null>(null);

const canSign = computed(() => !!props.nextLevel && props.run.artifacts.length > 0 && ['ready', 'signing'].includes(props.run.status));
const forcedApprove = computed(() => props.run.requiredLevels.includes('approve') && !props.baseLevels.includes('approve'));
const eligible = computed(() => props.company.signers.filter((s) => props.nextLevel && s.levels.includes(props.nextLevel)));
const doneRec = (l: FauSignLevel) => props.active.find((r) => r.level === l && r.decision === 'approve');
const levelState = (l: FauSignLevel) => (doneRec(l) ? 'done' : props.nextLevel === l ? 'current' : 'todo');

watch(() => [props.nextLevel, props.run.id], () => {
  signerId.value = eligible.value[0]?.id || '__manual';
  acks.value = [];
  comment.value = '';
  error.value = '';
  void loadHistory();
}, { immediate: true });

async function loadHistory(): Promise<void> {
  try { history.value = await fau<FauSignoffRecord[]>('signoff.history', { runId: props.run.id }); } catch { history.value = []; }
}
function ackAll(): void {
  acks.value = props.run.reminders.filter((r) => !(r.approverOnly && props.nextLevel !== 'approve')).map((r) => r.id);
}
function signer(): { name: string; title: string } {
  if (signerId.value === '__manual') return { ...manual.value };
  const s = props.company.signers.find((x) => x.id === signerId.value);
  return s ? { name: s.name, title: s.title } : { name: '', title: '' };
}
async function submit(decision: 'approve' | 'return'): Promise<void> {
  if (!props.nextLevel) return;
  busy.value = true;
  error.value = '';
  try {
    const payload = { runId: props.run.id, level: props.nextLevel, decision, signer: signer(), comment: comment.value, acknowledged: acks.value, returnToStep: returnTo.value };
    await fau(props.nextLevel === 'prepare' ? 'signoff.submit' : 'signoff.decide', payload);
    emit('changed');
    await loadHistory();
  } catch (e) {
    error.value = errorMessage(e);
  } finally {
    busy.value = false;
  }
}
async function verify(): Promise<void> {
  busy.value = true;
  try { verifyResult.value = await fau<FauSignoffVerify>('signoff.verify', { runId: props.run.id }); } catch (e) { error.value = errorMessage(e); } finally { busy.value = false; }
}
</script>

<style scoped>
.fau-sign { display: grid; gap: 10px; }
.fau-levels { display: flex; gap: 8px; flex-wrap: wrap; }
.fau-level { border: 1px solid var(--color-border); border-radius: var(--radius-4); padding: 6px 12px; display: grid; gap: 2px; min-width: 130px; }
.fau-level small { color: var(--color-text-secondary); font-size: 11.5px; }
.fau-level.done { border-color: color-mix(in srgb, var(--color-success) 55%, var(--color-border)); }
.fau-level.current { border-color: var(--color-brand); box-shadow: 0 0 0 2px color-mix(in srgb, var(--color-brand) 15%, transparent); }
.fau-sign__form { display: grid; gap: 10px; border: 1px solid var(--color-border); border-radius: var(--radius-5); padding: 10px 12px; }
.fau-acks { display: grid; gap: 4px; }
.fau-ack { display: flex; align-items: center; gap: 8px; font-size: 12.5px; padding: 4px 6px; border-radius: var(--radius-3); }
.fau-ack.locked { opacity: .6; }
.fau-ack .grow { flex: 1; min-width: 0; }
</style>
