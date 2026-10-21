<template>
  <div v-if="s" class="ap-set">
    <section class="ss-panel">
      <header class="ap-head"><strong><i class="ri-store-2-line"></i>{{ $t('门店与生成') }}</strong></header>
      <div class="ss-grid">
        <label class="ss-field"><span>{{ $t('门店名称（手机端标题、试穿图水印）') }}</span><input v-model.trim="draft.storeName" type="text" maxlength="30" /></label>
        <label class="ss-field"><span>{{ $t('换装模型') }}</span>
          <select v-model="draft.editModel"><option v-for="m in AP_EDIT_MODELS" :key="m" :value="m">{{ modelLabel(m) }}{{ m === AP_EDIT_MODELS[0] ? $t('（推荐，保脸更稳）') : $t('（中文提示友好）') }}</option></select>
        </label>
        <label class="ss-field"><span>{{ $t('手机端每人每天最多生成（张）') }}</span><input v-model.number="draft.mobileDailyLimit" type="number" min="1" max="100" /></label>
      </div>
      <label class="ap-check"><input v-model="draft.watermark" type="checkbox" />{{ $t('试穿图右下角加门店名与试穿码（顾客保存、分享时带上）') }}</label>
      <p class="ss-note" :class="s.imageReady ? 'ok' : 'warn'">
        <i :class="s.imageReady ? 'ri-check-line' : 'ri-key-2-line'"></i>
        {{ s.imageReady ? $t('图像服务已就绪（换装、打标签、形象分析都用它）') : $t('还没有配置图像服务：请到「设置 → 媒体模型」填写 fal 密钥，或联系管理员为本方案下发') }}
      </p>
    </section>

    <section class="ss-panel">
      <header class="ap-head"><strong><i class="ri-shield-user-line"></i>{{ $t('隐私') }}</strong></header>
      <div class="ss-grid">
        <label class="ss-field"><span>{{ $t('顾客照片与试穿图保留天数（1～30）') }}</span><input v-model.number="draft.retentionDays" type="number" min="1" max="30" /></label>
      </div>
      <ul class="ap-list">
        <li>{{ $t('先授权后上传：没有勾选授权不能上传照片，授权时间记入顾客档案') }}</li>
        <li>{{ $t('照片、试穿图只存在本机账号私有目录；到期自动删除，统计只保留匿名计数') }}</li>
        <li>{{ $t('顾客可在手机端一键删除自己的照片和试穿图；体型分析只存标签，不存测量数据') }}</li>
        <li>{{ $t('照片只用于生成试穿图，不用于营销素材、不用于模型训练') }}</li>
      </ul>
      <div class="ss-actions">
        <button type="button" class="ss-btn sm" @click="purgeExpired"><i class="ri-time-line"></i>{{ $t('立即清除过期照片') }}</button>
        <button type="button" class="ss-btn sm danger" @click="purgeAll"><i class="ri-delete-bin-line"></i>{{ $t('清空全部顾客照片与试穿图') }}</button>
      </div>
    </section>

    <div class="ss-actions">
      <button type="button" class="ss-btn primary" :disabled="!dirty" @click="save"><i class="ri-save-line"></i>{{ $t('保存设置') }}</button>
      <span v-if="dirty" class="ss-muted">{{ $t('有未保存的修改') }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive, watch } from 'vue';
import { AP_EDIT_MODELS, type ApSettings } from '@totalclaw/ipc-contracts';
import { useNotificationStore } from '../../stores/notification';
import { t as i18nT } from '../../i18n';
import { ap, apState, errorMessage, modelLabel, refreshState } from './shared';

const notif = useNotificationStore();
const s = computed(() => apState.value);
const draft = reactive<Partial<ApSettings>>({});
watch(() => s.value?.settings, (v) => { if (v) Object.assign(draft, v); }, { immediate: true });
const dirty = computed(() => !!s.value && (['storeName', 'editModel', 'mobileDailyLimit', 'watermark', 'retentionDays'] as const).some((k) => draft[k] !== s.value!.settings[k]));

async function save(): Promise<void> {
  try { await ap('settings.patch', { patch: draft }); await refreshState(); notif.success(i18nT('已保存')); } catch (e) { notif.error(errorMessage(e)); }
}
async function purgeExpired(): Promise<void> {
  try { const n = await ap<number>('privacy.purgeExpired'); await refreshState(); notif.success(i18nT('已清除 {n} 位顾客的过期照片', { n })); } catch (e) { notif.error(errorMessage(e)); }
}
async function purgeAll(): Promise<void> {
  if (!window.confirm(i18nT('清空全部顾客的照片、试穿图与分析结果？此操作不可恢复。'))) return;
  try { const n = await ap<number>('privacy.purgeAll'); await refreshState(); notif.success(i18nT('已清除 {n} 位顾客的照片与试穿图', { n })); } catch (e) { notif.error(errorMessage(e)); }
}
</script>

<style scoped>
.ap-set { display: grid; gap: 14px; max-width: 920px; }
.ss-panel { border: 1px solid var(--color-border); border-radius: 14px; background: var(--color-bg-card); padding: 14px; display: grid; gap: 10px; }
.ap-head strong { display: flex; gap: 6px; align-items: center; font-size: 14px; }
.ap-check { display: flex; gap: 6px; align-items: center; font-size: 12.5px; }
.ap-list { margin: 0; padding-inline-start: 18px; font-size: 12.5px; color: var(--color-text-secondary); display: grid; gap: 4px; }
</style>
