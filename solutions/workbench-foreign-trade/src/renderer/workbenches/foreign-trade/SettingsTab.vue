<template>
  <div class="ss-module">
    <MailboxPanel />

    <section class="ss-panel">
      <header>
        <strong><i class="ri-folder-3-line"></i> {{ $t('结果文件存到') }}</strong>
        <span class="ss-muted">{{ $t('报价单、报表、产品素材、导出的文案都存在这里。') }}</span>
      </header>
      <div class="ss-actions">
        <code class="ft-path">{{ state?.outputDir || '—' }}</code>
        <button type="button" class="ss-btn sm ghost" @click="pickOutputDir"><i class="ri-folder-settings-line"></i>{{ $t('更改') }}</button>
        <button type="button" class="ss-btn sm ghost" :disabled="!state?.outputDir" @click="openPath(state!.outputDir)"><i class="ri-external-link-line"></i>{{ $t('打开') }}</button>
      </div>
    </section>

    <!-- 发信闸门 -->
    <section v-if="rules" class="ss-panel" data-test="ft-send-rules">
      <header>
        <strong><i class="ri-shield-check-line"></i> {{ $t('发信规则') }}</strong>
        <span class="ss-muted">{{ $t('开发信、跟进、询盘回复、报价邮件和自动回复发出前都按这里检查；被拦下的写清原因，不会发出。') }}</span>
      </header>
      <div class="ss-grid">
        <label class="ss-field"><span>{{ $t('每个邮箱每天最多发（封）') }}</span><input v-model.number="rules.dailyLimit" type="number" min="1" data-test="ft-rule-daily" /></label>
        <label class="ss-field"><span>{{ $t('开发信 / 跟进正文上限（词）') }}</span><input v-model.number="rules.maxBodyWords" type="number" min="40" /></label>
        <label class="ss-field"><span>{{ $t('标题上限（字符）') }}</span><input v-model.number="rules.maxSubjectLen" type="number" min="20" /></label>
        <label class="ss-field"><span>{{ $t('开发信 / 跟进最多几个链接') }}</span><input v-model.number="rules.maxLinks" type="number" min="0" /></label>
        <label class="ss-field"><span>{{ $t('退信率超过多少停发开发信（%）') }}</span><input v-model.number="bouncePct" type="number" min="1" max="50" /></label>
        <label class="ss-field"><span>{{ $t('额外禁用词（逗号分隔）') }}</span><input v-model="extraBanned" type="text" /></label>
      </div>
      <label class="ft-check"><input v-model="rules.requireOptOut" type="checkbox" />{{ $t('开发信必须带退订句') }}</label>
      <label class="ss-field"><span>{{ $t('一键补上的退订句') }}</span><input v-model="rules.optOutLine" type="text" /></label>
      <div class="ss-actions"><span class="grow"></span>
        <button type="button" class="ss-btn sm primary" :disabled="saving === 'rules'" data-test="ft-rules-save" @click="saveRules"><i class="ri-save-line"></i>{{ $t('保存发信规则') }}</button>
      </div>
    </section>

    <!-- 抑制名单 -->
    <section class="ss-panel" data-test="ft-suppressions">
      <header>
        <strong><i class="ri-forbid-line"></i> {{ $t('抑制名单（不再发信）') }}</strong>
        <span class="ss-muted">{{ $t('对方回信要求退订、邮件被退回会自动加进来；手动加入要写原因。名单里的邮箱或域名，任何发送都会被拦下。') }}</span>
      </header>
      <div class="ss-actions">
        <input v-model.trim="supValue" type="text" class="ft-input" data-test="ft-sup-value" :placeholder="$t('邮箱或域名')" />
        <input v-model.trim="supReason" type="text" class="ft-input wide" data-test="ft-sup-reason" :placeholder="$t('原因（必填）')" />
        <button type="button" class="ss-btn sm" :disabled="!supValue || !supReason" data-test="ft-sup-add" @click="addSuppression"><i class="ri-add-line"></i>{{ $t('加入') }}</button>
      </div>
      <div v-if="suppressions.length" class="ss-table-wrap ft-scroll">
        <table class="ss-table">
          <thead><tr><th>{{ $t('邮箱 / 域名') }}</th><th>{{ $t('来源') }}</th><th>{{ $t('原因') }}</th><th>{{ $t('时间') }}</th><th></th></tr></thead>
          <tbody>
            <tr v-for="x in suppressions" :key="x.id">
              <td>{{ x.email || `@${x.domain}` }}</td>
              <td><span class="ss-chip" :class="x.source === 'manual' ? '' : 'warn'">{{ sourceLabel(x.source) }}</span></td>
              <td class="ft-wrap">{{ x.reason }}</td>
              <td>{{ fmtDateTime(x.at) }}</td>
              <td><button type="button" class="ss-btn sm ghost danger" :title="$t('移出名单')" @click="removeSuppression(x.id)"><i class="ri-delete-bin-line"></i></button></td>
            </tr>
          </tbody>
        </table>
      </div>
      <p v-else class="ss-muted">{{ $t('名单是空的') }}</p>
      <template v-if="sendLog.length">
        <div class="ss-subhead">{{ $t('最近的发送记录') }}</div>
        <div class="ss-table-wrap ft-scroll">
          <table class="ss-table">
            <thead><tr><th>{{ $t('时间') }}</th><th>{{ $t('类型') }}</th><th>{{ $t('收件人') }}</th><th>{{ $t('标题') }}</th><th>{{ $t('结果') }}</th></tr></thead>
            <tbody>
              <tr v-for="r in sendLog" :key="r.id">
                <td>{{ fmtDateTime(r.at) }}</td><td>{{ kindLabel(r.kind) }}</td><td class="ft-wrap">{{ r.to.join(', ') }}</td><td class="ft-wrap">{{ r.subject }}</td>
                <td><span class="ss-chip" :class="r.status === 'sent' ? 'ok' : r.status === 'blocked' ? 'warn' : 'bad'" :title="r.reason || ''">{{ statusLabel(r.status) }}</span><div v-if="r.reason" class="ss-muted ft-wrap">{{ r.reason }}</div></td>
              </tr>
            </tbody>
          </table>
        </div>
      </template>
    </section>

    <!-- 单据抬头与银行 -->
    <section v-if="docs" class="ss-panel" data-test="ft-doc-settings">
      <header>
        <strong><i class="ri-bank-line"></i> {{ $t('单据抬头与银行') }}</strong>
        <span class="ss-muted">{{ $t('生成 PI / 商业发票 / 装箱单时默认带出，订单里还可以逐单改。') }}</span>
      </header>
      <div class="ss-grid">
        <label class="ss-field"><span>{{ $t('公司英文名称') }}</span><input v-model="docs.seller.name" type="text" /></label>
        <label class="ss-field"><span>{{ $t('公司英文地址') }}</span><input v-model="docs.seller.address" type="text" /></label>
        <label class="ss-field"><span>{{ $t('收款银行') }}</span><input v-model="docs.bank.name" type="text" /></label>
        <label class="ss-field"><span>{{ $t('账户名') }}</span><input v-model="docs.bank.accountName" type="text" /></label>
        <label class="ss-field"><span>{{ $t('账号') }}</span><input v-model="docs.bank.accountNo" type="text" /></label>
        <label class="ss-field"><span>SWIFT</span><input v-model="docs.bank.swift" type="text" /></label>
        <label class="ss-field"><span>{{ $t('默认付款方式') }}</span><input v-model="docs.payment" type="text" /></label>
        <label class="ss-field"><span>{{ $t('默认起运港') }}</span><input v-model="docs.portOfLoading" type="text" /></label>
        <label class="ss-field"><span>{{ $t('默认计价方式') }}</span><input v-model="docs.priceUnit" type="text" placeholder="USD/PCS" /></label>
      </div>
      <div class="ss-actions"><span class="grow"></span>
        <button type="button" class="ss-btn sm primary" :disabled="saving === 'docs'" @click="saveDocSettings"><i class="ri-save-line"></i>{{ $t('保存') }}</button>
      </div>
    </section>

    <section class="ss-panel">
      <header>
        <strong><i class="ri-cpu-line"></i> {{ $t('各模块使用的模型') }}</strong>
        <span class="ss-muted">{{ $t('每个模块单独指定；不指定就用系统默认模型（{p0}）。各模块页面顶部也能改。', { p0: ftModels.defaultLabel || $t('未配置') }) }}</span>
      </header>
      <div class="ss-table-wrap">
        <table class="ss-table">
          <thead><tr><th>{{ $t('模块') }}</th><th>{{ $t('使用模型') }}</th></tr></thead>
          <tbody>
            <tr v-for="m in modules" :key="m.key">
              <td><i :class="m.icon"></i> {{ m.title }}</td>
              <td>
                <select :value="state?.settings.moduleModels[m.key] || ''" :disabled="saving === m.key" @change="setModel(m.key, ($event.target as HTMLSelectElement).value)">
                  <option value="">{{ $t('跟随系统默认（{p0}）', { p0: ftModels.defaultLabel || $t('未配置') }) }}</option>
                  <optgroup v-for="g in modelGroups()" :key="g.group" :label="g.group"><option v-for="o in g.options" :key="o.value" :value="o.value">{{ o.label }}</option></optgroup>
                </select>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
/**
 * 设置 tab：多邮箱接管、结果文件目录、各模块模型。原来放在页面顶部，太占空间，收进这里。
 */
import { computed, ref, watch } from 'vue';
import type { FtModuleKey, FtSendKind, FtSendRecord, FtSendRules, FtSettings, FtSuppression } from '@totalclaw/ipc-contracts';
import { t as i18nT } from '../../i18n';
import { useNotificationStore } from '../../stores/notification';
import MailboxPanel from './MailboxPanel.vue';
import { errorMessage, fmtDateTime, ft, ftModels, modelGroups, ftState, moduleMetas, refreshState } from './shared';

const notif = useNotificationStore();
const state = ftState;
const modules = moduleMetas();
const saving = ref('');
const rules = ref<FtSendRules | null>(null);
const bouncePct = ref(5);
const extraBanned = ref('');
const docs = ref<FtSettings['tradeDocs'] | null>(null);
const supValue = ref('');
const supReason = ref('');
const suppressions = computed(() => state.value?.suppressions || []);
const sendLog = computed(() => (state.value?.sendLog || []).slice(0, 30));
watch(() => JSON.stringify(state.value?.settings.sendRules || null), () => {
  const r = state.value?.settings.sendRules;
  rules.value = r ? { ...r } : null;
  bouncePct.value = Math.round((r?.maxBounceRate ?? 0.05) * 100);
  extraBanned.value = (r?.extraBanned || []).join(', ');
}, { immediate: true });
watch(() => JSON.stringify(state.value?.settings.tradeDocs || null), () => {
  const d = state.value?.settings.tradeDocs;
  docs.value = d ? JSON.parse(JSON.stringify(d)) : null;
}, { immediate: true });

function sourceLabel(s: FtSuppression['source']): string { return { manual: i18nT('手动'), unsubscribe: i18nT('对方退订'), bounce: i18nT('退信') }[s]; }
function kindLabel(k: FtSendKind): string {
  return { outreach: i18nT('开发信'), followup: i18nT('跟进'), inquiry_reply: i18nT('询盘回复'), auto_reply: i18nT('自动回复'), quote: i18nT('报价') }[k] || k;
}
function statusLabel(s: FtSendRecord['status']): string { return { sent: i18nT('已发出'), blocked: i18nT('被拦下'), failed: i18nT('发送失败') }[s]; }

async function saveRules(): Promise<void> {
  if (!rules.value) return;
  saving.value = 'rules';
  try {
    await ft('settings.patch', { patch: { sendRules: { ...rules.value, maxBounceRate: (Number(bouncePct.value) || 5) / 100, extraBanned: extraBanned.value.split(/[,，;；\n]+/).map((x) => x.trim()).filter(Boolean) } } });
    await refreshState();
    notif.success(i18nT('发信规则已保存'));
  } catch (e) { notif.error(errorMessage(e)); } finally { saving.value = ''; }
}
async function addSuppression(): Promise<void> {
  try {
    await ft('suppression.add', { value: supValue.value, reason: supReason.value });
    supValue.value = '';
    supReason.value = '';
    await refreshState();
  } catch (e) { notif.error(errorMessage(e)); }
}
async function removeSuppression(id: string): Promise<void> {
  if (!window.confirm(i18nT('移出抑制名单后，这个邮箱 / 域名又能收到工作台发的信。确定吗？'))) return;
  try { await ft('suppression.remove', { id }); await refreshState(); } catch (e) { notif.error(errorMessage(e)); }
}
async function saveDocSettings(): Promise<void> {
  if (!docs.value) return;
  saving.value = 'docs';
  try { await ft('settings.patch', { patch: { tradeDocs: docs.value } }); await refreshState(); notif.success(i18nT('已保存')); } catch (e) { notif.error(errorMessage(e)); } finally { saving.value = ''; }
}

async function setModel(key: FtModuleKey, value: string): Promise<void> {
  saving.value = key;
  try {
    const models: Record<string, string> = { ...(state.value?.settings.moduleModels || {}) };
    if (value) models[key] = value; else delete models[key];
    await ft('settings.patch', { patch: { moduleModels: models } });
    await refreshState();
  } catch (e) {
    notif.error(errorMessage(e));
  } finally {
    saving.value = '';
  }
}
async function pickOutputDir(): Promise<void> {
  try { if (await ft('outputDir.pick')) await refreshState(); } catch (e) { notif.error(errorMessage(e)); }
}
function openPath(path: string): void { void ft('path.open', { path }).catch((e) => notif.error(errorMessage(e))); }
</script>

<style scoped>
.ss-panel > header strong { display: flex; gap: 6px; align-items: center; }
.ft-path { flex: 1; min-width: 200px; font-size: 12px; color: var(--color-text-secondary); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.ss-table select { min-width: 280px; }
.ss-table td i { color: var(--color-brand); margin-inline-end: 4px; }
.ft-input { height: 30px; min-width: 200px; border-radius: 8px; border: 1px solid var(--color-border); background: var(--color-bg-input, var(--color-bg-primary)); color: var(--color-text-primary); font: inherit; font-size: 12.5px; padding-inline: 8px; }
.ft-input.wide { flex: 1; }
.ft-check { display: inline-flex; gap: 6px; align-items: center; font-size: 12.5px; }
.ft-scroll { max-height: 260px; overflow: auto; }
.ft-wrap { white-space: normal !important; max-width: 320px; }
</style>
