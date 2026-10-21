<template>
  <div class="ca-apps">
    <section class="ss-panel">
      <h3><i class="ri-compass-3-line"></i>{{ $t('AI 应用建设台账') }}</h3>
      <p class="ss-muted">{{ $t('按统一规划、建设与运维、教学、科研、校务治理、师生服务五个方向列出全校 AI 场景。内置场景已上线可直接进入；学校自己规划的场景在这里登记，阶段与责任部门由信息中心维护，用量取自调用审计。') }}</p>
      <div class="ca-apps__sum">
        <div v-for="d in DIRS" :key="d" class="ca-apps__dir" :class="{ on: dir === d }" role="button" tabindex="0" @click="dir = dir === d ? '' : d" @keydown.enter="dir = dir === d ? '' : d">
          <span class="ca-apps__seal">{{ dirSeal(d) }}</span>
          <div><b>{{ dirLabel(d) }}</b><small>{{ $t('{a} 个场景 · 已上线 {b} · 30 天 {c} 次', { a: sum(d).total, b: sum(d).live, c: sum(d).usage }) }}</small></div>
        </div>
      </div>
      <div class="ss-actions">
        <button type="button" class="ss-btn primary sm" @click="startNew"><i class="ri-add-line"></i>{{ $t('登记规划场景') }}</button>
        <button type="button" class="ss-btn sm" @click="exportLedger"><i class="ri-file-excel-2-line"></i>{{ $t('导出建设台账') }}</button>
      </div>
      <form v-if="draft" class="ca-apps__form" @submit.prevent="save">
        <div class="ss-grid">
          <label class="ss-field"><span>{{ $t('方向') }}</span><select v-model="draft.direction" :disabled="draft.builtin"><option v-for="d in DIRS" :key="d" :value="d">{{ dirLabel(d) }}</option></select></label>
          <label class="ss-field"><span>{{ $t('场景名称') }}</span><input v-model="draft.name" :disabled="draft.builtin" :placeholder="$t('如：招生咨询数字人、实训设备运维助手')" /></label>
          <label class="ss-field"><span>{{ $t('责任部门') }}</span><input v-model="draft.dept" list="ca-apps-depts" /></label>
          <label class="ss-field"><span>{{ $t('阶段') }}</span><select v-model="draft.stage"><option v-for="x in STAGES" :key="x" :value="x">{{ stageLabel(x) }}</option></select></label>
        </div>
        <label v-if="!draft.builtin" class="ss-field"><span>{{ $t('说明') }}</span><input v-model="draft.desc" /></label>
        <label class="ss-field"><span>{{ $t('备注（进度、负责人、计划上线时间）') }}</span><input v-model="draft.note" /></label>
        <datalist id="ca-apps-depts"><option v-for="x in caState?.settings.depts || []" :key="x" :value="x" /></datalist>
        <div class="ss-actions"><button type="submit" class="ss-btn primary sm">{{ $t('保存') }}</button><button type="button" class="ss-btn sm" @click="draft = null">{{ $t('取消') }}</button></div>
      </form>
    </section>

    <section v-for="d in shownDirs" :key="d" class="ss-panel ca-ledger">
      <h3><span class="ca-apps__seal sm">{{ dirSeal(d) }}</span>{{ dirLabel(d) }}</h3>
      <div class="ss-table-wrap">
        <table class="ss-table">
          <thead><tr><th>{{ $t('场景') }}</th><th>{{ $t('责任部门') }}</th><th>{{ $t('阶段') }}</th><th class="num">{{ $t('30 天调用') }}</th><th>{{ $t('备注') }}</th><th></th></tr></thead>
          <tbody>
            <tr v-for="x in byDir(d)" :key="x.id">
              <td class="ca-wrap"><b>{{ x.name }}</b><small v-if="!x.builtin" class="ss-chip">{{ $t('学校规划') }}</small><br><small class="ss-muted">{{ x.desc }}</small></td>
              <td>{{ x.dept || '—' }}</td>
              <td><span class="ca-stage" :class="x.stage">{{ stageLabel(x.stage) }}</span></td>
              <td class="num">{{ x.target ? x.usage30d : '—' }}</td>
              <td class="ca-wrap">{{ x.note || '' }}</td>
              <td>
                <button v-if="x.target && x.stage === 'live'" type="button" class="ss-btn sm" @click="open(x.target)">{{ $t('进入') }}</button>
                <button type="button" class="ss-btn sm ghost" @click="edit(x)">{{ $t('编辑') }}</button>
                <button v-if="!x.builtin" type="button" class="ss-btn sm ghost danger" @click="remove(x.id)">{{ armed === x.id ? $t('确认删除') : $t('删除') }}</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
/** AI 应用中心：五大方向场景目录与建设台账 */
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';
import { CA_DIRECTIONS, type CaDirection, type CaScenario, type CaStage } from '@totalclaw/ipc-contracts';
import { useNotificationStore } from '../../stores/notification';
import { t as i18nT } from '../../i18n';
import { ca, caState, errorMessage, openPath, refreshState } from './shared';

const emit = defineEmits<{ (e: 'go', tab: string): void }>();
const router = useRouter();
const notif = useNotificationStore();
const DIRS = CA_DIRECTIONS;
const STAGES: CaStage[] = ['planned', 'building', 'live'];
const dir = ref<'' | CaDirection>('');
const armed = ref('');
const draft = ref<{ id?: string; builtin: boolean; direction: CaDirection; name: string; desc: string; dept: string; stage: CaStage; note: string } | null>(null);

const list = computed(() => caState.value?.scenarios || []);
const shownDirs = computed(() => (dir.value ? [dir.value] : DIRS));
const byDir = (d: CaDirection): CaScenario[] => list.value.filter((x) => x.direction === d);
const sum = (d: CaDirection) => {
  const l = byDir(d);
  return { total: l.length, live: l.filter((x) => x.stage === 'live').length, usage: l.reduce((n, x) => n + x.usage30d, 0) };
};
const dirLabel = (d: CaDirection): string => ({ plan: i18nT('统一规划、建设与运维'), teach: i18nT('教学'), research: i18nT('科研'), gov: i18nT('校务治理'), service: i18nT('师生服务') }[d]);
const dirSeal = (d: CaDirection): string => ({ plan: i18nT('统'), teach: i18nT('教'), research: i18nT('研'), gov: i18nT('治'), service: i18nT('服') }[d]);
const stageLabel = (x: CaStage): string => ({ planned: i18nT('规划中'), building: i18nT('建设中'), live: i18nT('已上线') }[x]);

function open(target: string): void {
  if (target.startsWith('tab:')) emit('go', target.slice(4));
  else if (target.startsWith('route:')) void router.push(target.slice(6));
}
function startNew(): void {
  draft.value = { builtin: false, direction: dir.value || 'plan', name: '', desc: '', dept: '', stage: 'planned', note: '' };
}
function edit(x: CaScenario): void {
  draft.value = { id: x.id, builtin: x.builtin, direction: x.direction, name: x.name, desc: x.desc, dept: x.dept, stage: x.stage, note: x.note || '' };
}
async function save(): Promise<void> {
  const d = draft.value;
  if (!d) return;
  try {
    await ca('apps.save', { builtin: d.builtin, input: { id: d.id, direction: d.direction, name: d.name, desc: d.desc, dept: d.dept, stage: d.stage, note: d.note } });
    draft.value = null;
    await refreshState();
  } catch (e) { notif.error(errorMessage(e)); }
}
async function remove(id: string): Promise<void> {
  if (armed.value !== id) { armed.value = id; setTimeout(() => { if (armed.value === id) armed.value = ''; }, 3000); return; }
  armed.value = '';
  try { await ca('apps.remove', { id }); await refreshState(); } catch (e) { notif.error(errorMessage(e)); }
}
async function exportLedger(): Promise<void> {
  try { const f = await ca<string>('apps.export'); void openPath(f, true); } catch (e) { notif.error(errorMessage(e)); }
}
</script>

<style scoped>
.ca-apps { display: grid; gap: 14px; }
.ca-apps__sum { display: grid; gap: 10px; grid-template-columns: repeat(auto-fit, minmax(min(100%, 200px), 1fr)); }
.ca-apps__dir { display: flex; gap: 10px; align-items: center; padding: 10px 12px; border: 1px solid var(--color-border); border-radius: 10px; cursor: pointer; transition: border-color .15s, background .15s; }
.ca-apps__dir:hover, .ca-apps__dir:focus-visible { border-color: var(--ca-oxblood); outline: none; }
.ca-apps__dir.on { border-color: var(--ca-oxblood); background: var(--color-brand-subtle); }
.ca-apps__dir b { display: block; font-size: 13.5px; }
.ca-apps__dir small { color: var(--color-text-secondary); font-size: 12px; }
.ca-apps__seal { flex: 0 0 auto; width: 34px; height: 34px; border-radius: 50%; display: inline-grid; place-items: center; font-family: var(--ca-serif); font-weight: 800; font-size: 16px; color: var(--ca-banner-ink); background: var(--ca-oxblood); box-shadow: 0 0 0 2px var(--color-bg-card), 0 0 0 3px var(--ca-gold); }
.ca-apps__seal.sm { width: 26px; height: 26px; font-size: 13px; }
.ca-apps__form { display: grid; gap: 8px; padding: 12px; border: 1px dashed var(--ca-gold); border-radius: 10px; }
.ca-stage { display: inline-flex; padding: 2px 9px; border-radius: 999px; font-size: 11.5px; font-weight: 700; }
.ca-stage.live { background: oklch(0.6 0.13 150 / 0.14); color: oklch(0.45 0.12 150); }
.ca-stage.building { background: oklch(0.75 0.14 75 / 0.18); color: oklch(0.5 0.12 70); }
.ca-stage.planned { background: var(--color-bg-hover); color: var(--color-text-secondary); }
.ca-ledger h3 { gap: 10px; }
</style>
