<template>
  <div class="mm-sa" data-test="mm-ai">
    <header class="mm-sp__head">
      <div>
        <h3>{{ $t('AI 能力配置') }}</h3>
        <p>{{ $t('转写、声纹识别、执行方案和总结报告用到的 AI。文字类 AI 用你在应用里选的模型；模型不可用时都有确定性兜底，流程不会断。报告里的数字由系统计算，模型只写叙述。') }}</p>
      </div>
    </header>
    <p v-if="error" class="ss-note danger"><i class="ri-error-warning-line"></i>{{ error }}</p>

    <section class="mm-sa__block">
      <h4>{{ $t('转写') }}</h4>
      <AsrModelPicker />
      <p class="ss-muted">{{ $t('录音和录屏都按停顿切片后逐段转写；文字记录（txt / docx / srt / vtt 等）跳过转写。') }}</p>
    </section>

    <section class="mm-sa__block">
      <h4>{{ $t('声纹识别') }}</h4>
      <label class="mm-sa__range">
        <span>{{ $t('相似度下限') }}</span>
        <input v-model.number="form.voiceprintThreshold" type="range" min="0.3" max="0.9" step="0.01" data-test="mm-ai-threshold" />
        <b>{{ Number(form.voiceprintThreshold).toFixed(2) }}</b>
      </label>
      <p class="ss-muted">{{ $t('只和本场参会人的声纹比对；低于下限的发言人留给主持人试听后指认。调高更严（指认更多），调低更松（可能认错）。默认 0.55。') }}</p>
    </section>

    <section class="mm-sa__block">
      <h4>{{ $t('提示词') }} <small>{{ $t('留空 = 用内置提示词') }}</small></h4>
      <label class="ss-field"><span>{{ $t('纪要整理（按议题 / 时间线整理、识别决议、3 行摘要）') }}</span><textarea v-model="form.organizePrompt" rows="4" :placeholder="$t('留空使用内置')"></textarea></label>
      <label class="ss-field"><span>{{ $t('执行方案（从决议拆任务：每项一个责任部门、执行事项、交付标准、建议完成时间）') }}</span><textarea v-model="form.planPrompt" rows="4" :placeholder="$t('留空使用内置')"></textarea></label>
      <label class="ss-field"><span>{{ $t('项目总结（概况、关键决策、任务完成情况、变更与裁决记录）') }}</span><textarea v-model="form.summaryPrompt" rows="4" :placeholder="$t('留空使用内置')"></textarea></label>
    </section>

    <div class="ss-actions">
      <button type="button" class="ss-btn primary" :disabled="busy || !dirty" data-test="mm-ai-save" @click="save"><i :class="busy ? 'ri-loader-4-line spin' : 'ri-save-line'"></i>{{ $t('保存') }}</button>
      <button v-if="dirty" type="button" class="ss-link" @click="reset">{{ $t('撤销修改') }}</button>
    </div>
  </div>
</template>

<script setup lang="ts">
/** AI 能力配置：转写模型（AsrModelPicker 自己存）、声纹相似度下限、三段提示词（settings.save { patch: { ai } }） */
import { computed, reactive, ref, watch } from 'vue';
import type { MmSettings } from '../../../shared/meetingMgmt/types';
import { t as i18nT } from '../../i18n';
import { useNotificationStore } from '../../stores/notification';
import AsrModelPicker from './AsrModelPicker.vue';
import { errorMessage, mm } from './shared';

const props = defineProps<{ settings: MmSettings }>();
const emit = defineEmits<{ (e: 'saved', s?: MmSettings): void }>();

const notif = useNotificationStore();
const busy = ref(false);
const error = ref('');
const form = reactive({ voiceprintThreshold: 0.55, planPrompt: '', summaryPrompt: '', organizePrompt: '' });

function snapshot(s: MmSettings) {
  const ai = s.ai ?? { asr: 'local', voiceprintThreshold: 0.55 };
  return {
    voiceprintThreshold: Number.isFinite(ai.voiceprintThreshold) ? ai.voiceprintThreshold : 0.55,
    planPrompt: ai.planPrompt ?? '', summaryPrompt: ai.summaryPrompt ?? '', organizePrompt: ai.organizePrompt ?? '',
  };
}
const dirty = computed(() => JSON.stringify(snapshot(props.settings)) !== JSON.stringify({ ...form, voiceprintThreshold: Number(form.voiceprintThreshold) }));
function reset(): void { Object.assign(form, snapshot(props.settings)); }
watch(() => props.settings, reset, { immediate: true });

async function save(): Promise<void> {
  busy.value = true;
  error.value = '';
  try {
    const th = Math.max(0, Math.min(1, Number(form.voiceprintThreshold) || 0.55));
    // 转写方式不在这里存（AsrModelPicker 走 asr.* 动作），省得把它改回去
    const ai: Partial<MmSettings['ai']> = {
      voiceprintThreshold: Math.round(th * 100) / 100,
      // 空串 = 用内置（不用 undefined：JSON 往返会丢字段，主进程深合并时清不掉旧提示词）
      planPrompt: form.planPrompt.trim(),
      summaryPrompt: form.summaryPrompt.trim(),
      organizePrompt: form.organizePrompt.trim(),
    };
    const r = await mm<MmSettings>('settings.save', { patch: { ai } });
    notif.success(i18nT('AI 能力配置已保存'));
    emit('saved', r);
  } catch (e) {
    error.value = errorMessage(e);
  } finally {
    busy.value = false;
  }
}
</script>

<style scoped>
.mm-sa { display: grid; gap: 18px; }
.mm-sp__head { display: flex; align-items: flex-start; gap: 16px; flex-wrap: wrap; }
.mm-sp__head > div:first-child { flex: 1; min-width: 260px; display: grid; gap: 6px; }
.mm-sp__head h3 { margin: 0; font-size: 18px; }
.mm-sp__head p { margin: 0; color: var(--color-text-secondary); font-size: 13px; line-height: 1.6; max-width: 80ch; }
.mm-sa__block { display: grid; gap: 10px; padding-bottom: 18px; border-bottom: 1px solid var(--color-border-subtle); }
.mm-sa__block h4 { margin: 0; font-size: 14.5px; display: flex; gap: 8px; align-items: baseline; }
.mm-sa__block h4 small { font-weight: 400; font-size: 12.5px; color: var(--color-text-secondary); }
.mm-sa__block .ss-muted { margin: 0; }
.mm-sa__opts { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 240px), 1fr)); gap: 10px; }
.mm-sa__opts label { position: relative; display: grid; gap: 4px; padding: 12px 14px; border: 1px solid var(--color-border); border-radius: var(--radius-5); cursor: pointer; }
.mm-sa__opts label.on { border-color: var(--color-brand); background: var(--color-brand-subtle); }
.mm-sa__opts label:focus-within { outline: 2px solid var(--color-brand); outline-offset: 2px; }
.mm-sa__opts input { position: absolute; opacity: 0; pointer-events: none; }
.mm-sa__opts strong { font-size: 13.5px; }
.mm-sa__opts small { font-size: 12px; color: var(--color-text-secondary); line-height: 1.5; }
.mm-sa__range { display: flex; align-items: center; gap: 12px; font-size: 13px; max-width: 480px; }
.mm-sa__range input { flex: 1; accent-color: var(--color-brand); }
.mm-sa__range b { font-variant-numeric: tabular-nums; min-width: 36px; }
.spin { animation: mm-sa-spin 1s linear infinite; }
@keyframes mm-sa-spin { to { transform: rotate(360deg); } }
</style>
