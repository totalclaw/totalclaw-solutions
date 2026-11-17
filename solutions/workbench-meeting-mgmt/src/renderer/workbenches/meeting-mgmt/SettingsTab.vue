<template>
  <div class="mm-settings" data-test="mm-settings-tab">
    <header class="mm-pagehead">
      <h2>{{ $t('系统设置') }}</h2>
      <p>{{ $t('仅管理员可见') }}</p>
    </header>

    <p v-if="!isAdmin" class="ss-empty" data-test="mm-settings-denied">{{ $t('只有管理员可以查看和修改系统设置。如需调整，请联系管理员。') }}</p>

    <div v-else class="mm-settings__grid">
      <nav class="mm-smenu" :aria-label="$t('设置项')">
        <button v-for="m in MENU" :key="m.key" type="button" :class="{ on: active === m.key }" :aria-current="active === m.key ? 'page' : undefined" :data-test="`mm-settings-menu-${m.key}`" @click="active = m.key">
          <strong>{{ m.title }}</strong><small>{{ m.sub }}</small>
        </button>
      </nav>

      <section class="mm-settings__panel">
        <p v-if="error" class="ss-note danger"><i class="ri-error-warning-line"></i>{{ error }}</p>
        <p v-if="!settings && !error" class="ss-muted">{{ $t('加载中…') }}</p>
        <template v-else-if="settings">
          <SettingsVoiceprint v-if="active === 'voiceprint'" :people="people" :depts="depts" :refresh-seq="seq" />
          <SettingsOrg v-else-if="active === 'org'" :people="people" :depts="depts" @changed="reloadAll" />
          <SettingsRoles v-else-if="active === 'roles'" :settings="settings" :people="people" :depts="depts" @saved="onSaved" />
          <SettingsAi v-else-if="active === 'ai'" :settings="settings" @saved="onSaved" />
          <SettingsWecom v-else-if="active === 'wecom'" :settings="settings" @saved="onSaved" />
          <SettingsParams v-else-if="active === 'params'" :settings="settings" @saved="onSaved" />
          <SettingsMobile v-else-if="active === 'mobile'" :people="people" :depts="depts" />
          <SettingsDemo v-else @changed="reloadAll" />
        </template>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * 系统设置页签（原型 05-系统设置.png）：左侧菜单 声纹库 / 通讯录同步 / 角色权限 / AI 能力配置 /
 * 消息推送 / 参数设置 / 手机端 / 演示数据；右侧对应面板。仅管理员（外壳也会隐藏页签）。
 */
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import type { MmDept, MmPerson, MmSettings } from '../../../shared/meetingMgmt/types';
import { t as i18nT } from '../../i18n';
import SettingsVoiceprint from './SettingsVoiceprint.vue';
import SettingsOrg from './SettingsOrg.vue';
import SettingsRoles from './SettingsRoles.vue';
import SettingsAi from './SettingsAi.vue';
import SettingsWecom from './SettingsWecom.vue';
import SettingsParams from './SettingsParams.vue';
import SettingsMobile from './SettingsMobile.vue';
import SettingsDemo from './SettingsDemo.vue';
import { errorMessage, mm, mmBoot, mmSettingsSection, onMmEvent, refreshBoot } from './shared';
import '../service-settlement/styles.css';

type MenuKey = 'voiceprint' | 'org' | 'roles' | 'ai' | 'wecom' | 'params' | 'mobile' | 'demo';
const MENU: Array<{ key: MenuKey; title: string; sub: string }> = [
  { key: 'voiceprint', title: i18nT('声纹库'), sub: i18nT('采集链接与采集情况') },
  { key: 'org', title: i18nT('通讯录同步'), sub: i18nT('企微部门与成员') },
  { key: 'roles', title: i18nT('角色权限'), sub: i18nT('管理员与可创建项目人员') },
  { key: 'ai', title: i18nT('AI 能力配置'), sub: i18nT('转写、声纹、方案、总结') },
  { key: 'wecom', title: i18nT('消息推送'), sub: i18nT('14 类企微通知') },
  { key: 'params', title: i18nT('参数设置'), sub: i18nT('催办与提醒周期') },
  { key: 'mobile', title: i18nT('手机端'), sub: i18nT('手机页服务与专属链接') },
  { key: 'demo', title: i18nT('演示数据'), sub: i18nT('载入或清空演示组织与项目') },
];

const active = ref<MenuKey>('voiceprint');
// 别处点进来指定了分区（首页「推送失败」→ 消息推送）
watch(mmSettingsSection, (v) => {
  if (v && MENU.some((m) => m.key === v)) active.value = v as MenuKey;
  if (v) mmSettingsSection.value = '';
}, { immediate: true });
const settings = ref<MmSettings | null>(null);
const people = ref<MmPerson[]>([]);
const depts = ref<MmDept[]>([]);
const seq = ref(0);
const error = ref('');
const isAdmin = computed(() => !!mmBoot.value?.me.isAdmin);

async function loadSettings(): Promise<void> {
  try {
    settings.value = await mm<MmSettings>('settings.get');
    error.value = '';
  } catch (e) {
    error.value = errorMessage(e);
  }
}
async function loadPeople(): Promise<void> {
  try {
    const r = await mm<{ depts: MmDept[]; people: MmPerson[] }>('people.list');
    people.value = r?.people ?? [];
    depts.value = r?.depts ?? [];
  } catch (e) {
    error.value = errorMessage(e);
  }
}
let lastReloadAt = 0;
async function reloadAll(): Promise<void> {
  lastReloadAt = Date.now();
  seq.value += 1;
  await Promise.all([loadSettings(), loadPeople(), refreshBoot().catch(() => null)]);
}
async function onSaved(next?: MmSettings): Promise<void> {
  if (next && typeof next === 'object' && 'adminIds' in next) settings.value = next;
  else await loadSettings();
  await refreshBoot().catch(() => null);
}

let timer: ReturnType<typeof setTimeout> | null = null;
let off: (() => void) | null = null;
onMounted(() => {
  if (isAdmin.value) void reloadAll();
  off = onMmEvent((ev) => {
    if (ev.type !== 'changed' || !['all', 'org', 'settings'].includes(ev.scope)) return;
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => { timer = null; if (isAdmin.value) void reloadAll(); }, 300);
  });
});
watch(isAdmin, (v) => { if (v && !settings.value) void reloadAll(); });
/** 外壳在数据变化后调用：面板自己按需刷新，这里只重拉设置与人员（同一轮事件已触发过就跳过） */
function refresh(): void {
  if (timer || !isAdmin.value || Date.now() - lastReloadAt < 800) return;
  timer = setTimeout(() => { timer = null; void reloadAll(); }, 300);
}
defineExpose({ refresh });
onBeforeUnmount(() => {
  off?.();
  if (timer) clearTimeout(timer);
});
</script>

<style scoped>
.mm-settings { display: grid; gap: 16px; }
.mm-pagehead { display: flex; align-items: baseline; gap: 12px; flex-wrap: wrap; }
.mm-pagehead h2 { margin: 0; font-size: 22px; font-weight: 700; }
.mm-pagehead p { margin: 0; color: var(--color-text-secondary); font-size: 13px; }
.mm-settings__grid { display: grid; grid-template-columns: minmax(200px, 280px) minmax(0, 1fr); gap: 20px; align-items: start; }
.mm-smenu { display: grid; gap: 4px; padding: 12px; border: 1px solid var(--color-border); border-radius: var(--radius-6); background: var(--color-bg-card); position: sticky; top: 0; }
.mm-smenu button { display: grid; gap: 3px; padding: 11px 14px; border: none; border-radius: var(--radius-4); background: transparent; text-align: left; cursor: pointer; font: inherit; color: var(--color-text-primary); }
.mm-smenu button:hover { background: var(--color-bg-hover); }
.mm-smenu button.on { background: var(--color-brand-subtle); }
.mm-smenu button.on strong { color: var(--color-brand); }
.mm-smenu button:focus-visible { outline: 2px solid var(--color-brand); outline-offset: -2px; }
.mm-smenu strong { font-size: 14px; }
.mm-smenu small { font-size: 12px; color: var(--color-text-secondary); }
.mm-settings__panel { min-width: 0; padding: 22px 26px 26px; border: 1px solid var(--color-border); border-radius: var(--radius-6); background: var(--color-bg-card); display: grid; gap: 16px; align-content: start; min-height: 420px; }
@media (max-width: 900px) {
  .mm-settings__grid { grid-template-columns: 1fr; }
  .mm-smenu { position: static; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); }
}
</style>
