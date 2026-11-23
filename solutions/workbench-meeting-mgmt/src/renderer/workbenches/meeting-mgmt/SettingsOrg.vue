<template>
  <div class="mm-so" data-test="mm-org">
    <header class="mm-sp__head">
      <div>
        <h3>{{ $t('通讯录同步') }}</h3>
        <p>{{ $t('人员只来自企微通讯录：部门、部门负责人（任务下发给第一位）、成员、职务、直属上级。系统内不维护人员信息；离职人员保留历史数据，不能再被选。') }}</p>
        <p>{{ $t('没有企微自建应用时，可以导入企微管理后台导出的通讯录表格（通讯录 → 批量导入/导出 → 导出成员）。群消息按手机号或企微账号提醒本人，表里没有的可以在下面逐个填。') }} <button type="button" class="ss-link" data-test="mm-org-link-contacts" @click="openExternalUrl(WECOM_URLS.contacts)">{{ $t('去企微后台导出') }} <i class="ri-external-link-line"></i></button></p>
      </div>
      <div class="ss-actions">
        <button type="button" class="ss-btn" :disabled="busy" data-test="mm-org-import" @click="importFile"><i class="ri-file-excel-2-line"></i>{{ $t('导入通讯录表格') }}</button>
        <button type="button" class="ss-btn primary" :disabled="busy" data-test="mm-org-sync" @click="sync"><i :class="busy ? 'ri-loader-4-line spin' : 'ri-refresh-line'"></i>{{ $t('立即同步') }}</button>
      </div>
    </header>
    <p v-if="!wecomConnected" class="ss-note warn"><i class="ri-information-line"></i>{{ $t('未连接企微：「立即同步」会载入演示组织。到「消息推送」里填好 CorpID / AgentID / Secret 后再同步，就是真实通讯录。') }}</p>
    <div v-if="last?.warnings?.length" class="ss-note warn" data-test="mm-org-warnings"><i class="ri-alert-line"></i><div><p v-for="(w, i) in last.warnings" :key="i">{{ w }}</p></div></div>
    <p v-if="error" class="ss-note danger"><i class="ri-error-warning-line"></i>{{ error }}</p>

    <section v-if="last" class="mm-so__last" data-test="mm-org-last">
      <div class="mm-so__lasthead">
        <strong>{{ $t('上次同步') }}</strong>
        <span>{{ fmtMs(last.at) }}</span>
        <span>{{ $t('操作人 {name}', { name: personName(last.by) }) }}</span>
        <span class="ss-chip" :class="last.source === 'demo' ? 'brand' : 'ok'">{{ last.source === 'wecom' ? $t('企微通讯录') : last.source === 'import' ? $t('导入的通讯录') : $t('演示组织') }}</span>
        <span v-if="last.error" class="ss-chip bad">{{ $t('同步出错') }}</span>
      </div>
      <p v-if="last.error" class="ss-note danger">{{ last.error }}</p>
      <ul class="mm-so__diff">
        <li v-for="k in DIFF" :key="k.key" :class="k.key">
          <button type="button" :disabled="!last[k.key].length" :aria-expanded="openDiff === k.key" @click="openDiff = openDiff === k.key ? '' : k.key">
            <b>{{ last[k.key].length }}</b><small>{{ k.title }}</small>
          </button>
        </li>
      </ul>
      <p v-if="openDiff && last[openDiff].length" class="mm-so__names">{{ last[openDiff].map(personName).join($t('、')) }}</p>
    </section>
    <p v-else class="ss-muted">{{ $t('还没有同步过') }}</p>

    <div class="mm-so__cols">
      <nav class="mm-so__depts" :aria-label="$t('部门')">
        <p class="mm-so__cap">{{ $t('部门（{n}）', { n: depts.length }) }}</p>
        <button v-for="d in depts" :key="d.id" type="button" :class="{ on: deptId === d.id }" :data-test="`mm-org-dept-${d.id}`" @click="deptId = d.id">
          <strong>{{ d.name }}</strong>
          <small>{{ $t('{n} 人', { n: countIn(d.id) }) }} · {{ $t('负责人 {names}', { names: leaderNames(d) || '—' }) }}</small>
        </button>
        <p v-if="!depts.length" class="ss-muted">{{ $t('还没有部门') }}</p>
      </nav>
      <div class="ss-table-wrap">
        <table class="ss-table">
          <thead><tr><th>{{ $t('姓名') }}</th><th>{{ $t('职务') }}</th><th>{{ $t('直属上级') }}</th><th>{{ $t('部门负责人') }}</th><th>{{ $t('企微账号') }}</th><th>{{ $t('手机号') }}</th><th></th></tr></thead>
          <tbody>
            <tr v-if="!members.length"><td colspan="7" class="mm-so__empty">{{ $t('这个部门没有成员') }}</td></tr>
            <tr v-for="p in members" :key="p.id" :data-test="`mm-org-row-${p.id}`">
              <td><PersonChip :name="p.name" /></td>
              <td>{{ p.title || '—' }}</td>
              <td>{{ p.leaderId ? personName(p.leaderId) : '—' }}</td>
              <td><span v-if="leaderRank(p.id) > 0" class="ss-chip" :class="leaderRank(p.id) === 1 ? 'brand' : ''">{{ leaderRank(p.id) === 1 ? $t('第一负责人') : $t('负责人 {n}', { n: leaderRank(p.id) }) }}</span></td>
              <template v-if="editing === p.id">
                <td><input v-model="edit.wecomUserId" class="mm-so__in mono" :placeholder="$t('企微账号')" spellcheck="false" data-test="mm-org-edit-uid" /></td>
                <td><input v-model="edit.mobile" class="mm-so__in mono" type="tel" :placeholder="$t('手机号')" data-test="mm-org-edit-mobile" /></td>
                <td class="mm-so__ops">
                  <button type="button" class="ss-link" :disabled="busy" data-test="mm-org-edit-save" @click="saveContact(p)">{{ $t('保存') }}</button>
                  <button type="button" class="ss-link" @click="editing = ''">{{ $t('取消') }}</button>
                </td>
              </template>
              <template v-else>
                <td class="mono" :title="mentionTitle(p)">{{ p.wecomUserId && trustedUid(p) ? p.wecomUserId : '—' }}</td>
                <td class="mono">{{ p.mobile || '—' }}</td>
                <td class="mm-so__ops"><button type="button" class="ss-link" :data-test="`mm-org-edit-${p.id}`" @click="startEdit(p)">{{ $t('编辑') }}</button></td>
              </template>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
/** 通讯录同步：立即同步（org.sync，有企微走企微、否则载入演示组织）、同步结果、部门与人员只读列表 */
import { computed, reactive, ref, watch } from 'vue';
import type { MmDept, MmOrgSyncResult, MmPerson } from '../../../shared/meetingMgmt/types';
import { t as i18nT } from '../../i18n';
import { useNotificationStore } from '../../stores/notification';
import PersonChip from './PersonChip.vue';
import { errorMessage, mm, mmBoot, openExternalUrl, WECOM_URLS } from './shared';
import { fmtMs } from './pagesLogic';

type DiffKey = 'added' | 'changed' | 'left';
const DIFF: Array<{ key: DiffKey; title: string }> = [
  { key: 'added', title: i18nT('新增') },
  { key: 'changed', title: i18nT('变更') },
  { key: 'left', title: i18nT('离职') },
];

const props = defineProps<{ people: MmPerson[]; depts: MmDept[] }>();
const emit = defineEmits<{ (e: 'changed'): void }>();

const notif = useNotificationStore();
const busy = ref(false);
const error = ref('');
const result = ref<MmOrgSyncResult | null>(null);
const openDiff = ref<'' | DiffKey>('');
const deptId = ref('');

const wecomConnected = computed(() => !!mmBoot.value?.wecomConnected);
/** 演示组织里自带的企微账号是编的（不显示、也不拿来提醒人），管理员手动填过的才算 */
const trustedUid = (p: MmPerson) => mmBoot.value?.org.source !== 'demo' || !!p.wecomIdManual;
const mentionTitle = (p: MmPerson) => (p.mobile || (p.wecomUserId && trustedUid(p)) ? i18nT('群消息能提醒到本人') : i18nT('没有手机号和企微账号：群消息里只写姓名'));
const editing = ref('');
const edit = reactive({ mobile: '', wecomUserId: '' });
function startEdit(p: MmPerson): void {
  editing.value = p.id;
  edit.mobile = p.mobile || '';
  edit.wecomUserId = p.wecomUserId && trustedUid(p) ? p.wecomUserId : '';
}
async function saveContact(p: MmPerson): Promise<void> {
  busy.value = true;
  error.value = '';
  try {
    const payload: Record<string, string> = { personId: p.id, mobile: edit.mobile.trim() };
    // 演示组织里没手动填过账号、这次也没填：不动自带的那个
    if (edit.wecomUserId.trim() || trustedUid(p)) payload.wecomUserId = edit.wecomUserId.trim();
    await mm('org.person.contact', payload);
    editing.value = '';
    notif.success(i18nT('已保存'));
    emit('changed');
  } catch (e) {
    error.value = errorMessage(e);
  } finally {
    busy.value = false;
  }
}
async function importFile(): Promise<void> {
  busy.value = true;
  error.value = '';
  try {
    const r = await mm<MmOrgSyncResult | null>('org.importFile');
    if (!r) return;
    result.value = r;
    notif.success(i18nT('导入完成：新增 {a}、变更 {b}、离职 {c}', { a: r.added.length, b: r.changed.length, c: r.left.length }));
    emit('changed');
  } catch (e) {
    error.value = errorMessage(e);
  } finally {
    busy.value = false;
  }
}
const last = computed(() => result.value ?? mmBoot.value?.org.lastSync ?? null);
const members = computed(() => props.people.filter((p) => p.deptId === deptId.value && !p.left));
const personName = (id: string) => props.people.find((p) => p.id === id)?.name || id;
const countIn = (id: string) => props.people.filter((p) => p.deptId === id && !p.left).length;
const leaderNames = (d: MmDept) => d.leaderIds.map(personName).join(i18nT('、'));
const leaderRank = (pid: string) => {
  const d = props.depts.find((x) => x.id === deptId.value);
  return d ? d.leaderIds.indexOf(pid) + 1 : 0;
};

watch(() => props.depts, (list) => {
  if (!list.some((d) => d.id === deptId.value)) deptId.value = list[0]?.id ?? '';
}, { immediate: true });

async function sync(): Promise<void> {
  busy.value = true;
  error.value = '';
  try {
    const r = await mm<MmOrgSyncResult>('org.sync');
    result.value = r;
    if (r?.error) error.value = r.error;
    else notif.success(i18nT('同步完成：新增 {a}、变更 {b}、离职 {c}', { a: r?.added?.length ?? 0, b: r?.changed?.length ?? 0, c: r?.left?.length ?? 0 }));
    emit('changed');
  } catch (e) {
    error.value = errorMessage(e);
  } finally {
    busy.value = false;
  }
}
</script>

<style scoped>
.mm-so { display: grid; gap: 16px; }
.mm-sp__head { display: flex; align-items: flex-start; gap: 16px; flex-wrap: wrap; }
.mm-sp__head > div:first-child { flex: 1; min-width: 260px; display: grid; gap: 6px; }
.mm-sp__head h3 { margin: 0; font-size: 18px; }
.mm-sp__head p { margin: 0; color: var(--color-text-secondary); font-size: 13px; line-height: 1.6; max-width: 80ch; }
.mm-so__last { display: grid; gap: 10px; padding: 14px 18px; border-radius: var(--radius-5); background: var(--color-bg-hover); }
.mm-so__lasthead { display: flex; flex-wrap: wrap; align-items: center; gap: 6px 14px; font-size: 13px; color: var(--color-text-secondary); }
.mm-so__lasthead strong { color: var(--color-text-primary); }
.mm-so__diff { list-style: none; margin: 0; padding: 0; display: flex; gap: 10px; flex-wrap: wrap; }
.mm-so__diff button { display: grid; gap: 2px; min-width: 96px; padding: 8px 14px; border: 1px solid var(--color-border); border-radius: var(--radius-4); background: var(--color-bg-card); cursor: pointer; font: inherit; text-align: left; color: var(--color-text-primary); }
.mm-so__diff button:disabled { cursor: default; opacity: .7; }
.mm-so__diff button[aria-expanded="true"] { border-color: var(--color-brand); }
.mm-so__diff b { font-size: 20px; font-variant-numeric: tabular-nums; }
.mm-so__diff small { font-size: 12px; color: var(--color-text-secondary); }
.mm-so__diff .added b { color: var(--color-success); }
.mm-so__diff .left b { color: var(--color-danger); }
.mm-so__names { margin: 0; font-size: 12.5px; color: var(--color-text-secondary); line-height: 1.6; }
.mm-so__cols { display: grid; grid-template-columns: minmax(180px, 240px) minmax(0, 1fr); gap: 16px; align-items: start; }
.mm-so__depts { display: grid; gap: 4px; max-height: 520px; overflow: auto; }
.mm-so__cap { margin: 0 0 4px; font-size: 12.5px; color: var(--color-text-secondary); font-weight: 700; }
.mm-so__depts button { display: grid; gap: 2px; padding: 8px 12px; border: none; border-radius: var(--radius-3); background: transparent; text-align: left; cursor: pointer; font: inherit; color: var(--color-text-primary); }
.mm-so__depts button:hover { background: var(--color-bg-hover); }
.mm-so__depts button.on { background: var(--color-brand-subtle); }
.mm-so__depts strong { font-size: 13.5px; }
.mm-so__depts small { font-size: 12px; color: var(--color-text-secondary); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.mm-so__empty { text-align: center !important; color: var(--color-text-secondary); }
td.mono { font-family: var(--font-mono); font-size: 12px; }
.mm-so__in { width: 100%; min-width: 110px; padding: 4px 8px; border: 1px solid var(--color-border); border-radius: var(--radius-3); background: var(--color-bg); color: inherit; font-size: 12px; }
.mm-so__ops { white-space: nowrap; display: flex; gap: 8px; }
.spin { animation: mm-so-spin 1s linear infinite; }
@keyframes mm-so-spin { to { transform: rotate(360deg); } }
@media (max-width: 760px) { .mm-so__cols { grid-template-columns: 1fr; } }
</style>
