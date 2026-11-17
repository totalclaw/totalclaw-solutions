<template>
  <Teleport to="body">
    <div class="mm-dialog-overlay" role="dialog" aria-modal="true" :aria-label="$t('创建会议')" data-test="mm-create-dialog" @click.self="close">
      <section class="mm-cd">
        <header class="mm-cd__head">
          <h3>{{ $t('创建会议') }}</h3>
          <button type="button" class="mm-cd__x" :title="$t('关闭')" @click="close"><i class="ri-close-line"></i></button>
        </header>

        <div class="mm-cd__body">
          <p v-if="loadError" class="ss-note danger"><i class="ri-error-warning-line"></i>{{ loadError }}</p>
          <p v-else-if="loaded && !projects.length" class="ss-note warn"><i class="ri-information-line"></i>{{ $t('没有进行中的项目：先在「项目」里新建项目（结项中、已归档的项目不能新建会议）。') }}</p>

          <label class="ss-field">
            <span>{{ $t('所属项目') }} <b class="req">*</b></span>
            <select v-model="form.projectId" data-test="mm-create-project">
              <option value="">{{ $t('选择项目') }}</option>
              <option v-for="p in projects" :key="p.id" :value="p.id">{{ p.name }}</option>
            </select>
          </label>
          <label class="ss-field">
            <span>{{ $t('会议主题') }} <b class="req">*</b></span>
            <input v-model="form.title" type="text" maxlength="80" :placeholder="$t('例如：A2 量产导入第 5 次周例会')" data-test="mm-create-title" />
          </label>
          <div class="mm-cd__row">
            <label class="ss-field">
              <span>{{ $t('会议时间') }} <b class="req">*</b></span>
              <input v-model="form.time" type="datetime-local" data-test="mm-create-time" />
            </label>
            <div class="ss-field">
              <span>{{ $t('来源') }}</span>
              <div class="mm-cd__seg" role="radiogroup">
                <button
                  v-for="s in SOURCES"
                  :key="s"
                  type="button"
                  role="radio"
                  :aria-checked="form.source === s"
                  :class="{ on: form.source === s }"
                  :data-test="`mm-create-source-${s}`"
                  @click="form.source = s"
                >{{ MEETING_SOURCE_LABEL[s] }}</button>
              </div>
            </div>
          </div>
          <div class="ss-field">
            <span>{{ $t('主持人') }}<small class="ss-muted">{{ $t('（默认是你，可以改；主持人负责上传、指认、终审）') }}</small></span>
            <PersonSearchSelect v-model="form.hostId" :people="people" :aria-label="$t('主持人')" data-test="mm-create-host" />
          </div>

          <div class="ss-field">
            <span>{{ $t('参会人') }} <b class="req">*</b><small class="ss-muted">{{ $t('已选 {n} 人（主持人自动参会）', { n: attendeeCount }) }}</small></span>
            <div v-if="selectedPeople.length" class="mm-cd__chips">
              <span v-for="p in selectedPeople" :key="p.id" class="mm-cd__chip">
                {{ p.name }}
                <button v-if="p.id !== form.hostId" type="button" :title="$t('移除')" @click="togglePerson(p.id)"><i class="ri-close-line"></i></button>
              </span>
            </div>
            <div class="mm-cd__picker">
              <label class="mm-cd__search"><i class="ri-search-line" aria-hidden="true"></i><input v-model="q" type="search" :placeholder="$t('搜索姓名、职务')" data-test="mm-create-search" /></label>
              <div class="mm-cd__groups">
                <div v-for="g in pickGroups" :key="g.id" class="mm-cd__group">
                  <div class="mm-cd__ghead">
                    <b>{{ g.name }}</b><small>{{ g.people.length }}</small>
                    <span class="mm-grow"></span>
                    <button type="button" class="ss-link" @click="toggleDept(g.people)">{{ g.people.every((p) => picked.has(p.id)) ? $t('取消全选') : $t('全选') }}</button>
                  </div>
                  <label v-for="p in g.people" :key="p.id" class="mm-cd__person" :data-test="`mm-create-person-${p.id}`">
                    <input type="checkbox" :checked="picked.has(p.id) || p.id === form.hostId" :disabled="p.id === form.hostId" @change="togglePerson(p.id)" />
                    <span class="mm-av" :style="{ background: avatarOf(p.name).color }">{{ avatarOf(p.name).text }}</span>
                    <span>{{ p.name }}</span><small>{{ p.title || '' }}</small>
                  </label>
                </div>
                <p v-if="loaded && !pickGroups.length" class="mm-cd__none">{{ q.trim() ? $t('没有找到这个人') : $t('组织里还没有人员') }}</p>
              </div>
            </div>
            <small class="ss-muted"><i class="ri-information-line"></i> {{ $t('找不到人员请联系管理员同步通讯录') }}</small>
          </div>

          <p v-if="error" class="ss-note danger"><i class="ri-error-warning-line"></i>{{ error }}</p>
        </div>

        <footer class="mm-cd__foot">
          <span class="ss-muted">{{ $t('创建后在会议详情里上传录音、录屏或文字记录') }}</span>
          <span class="mm-grow"></span>
          <button type="button" class="ss-btn" @click="close">{{ $t('取消') }}</button>
          <button type="button" class="ss-btn primary" :disabled="busy" data-test="mm-create-submit" @click="submit">
            <i :class="busy ? 'ri-loader-4-line spin' : 'ri-add-line'"></i>{{ $t('创建会议') }}
          </button>
        </footer>
      </section>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
/**
 * 新建会议弹窗：所属项目（只列进行中的项目）、主题、时间、来源（线下 / 腾讯会议 / Zoom）、
 * 主持人（默认自己，可改）、参会人（多选，按部门分组 + 搜索）。提交 meeting.create。
 */
import { computed, onBeforeUnmount, onMounted, reactive, ref } from 'vue';
import type { MmMeeting, MmMeetingSource } from '../../../shared/meetingMgmt/types';
import { t as i18nT } from '../../i18n';
import { useNotificationStore } from '../../stores/notification';
import { MEETING_SOURCE_LABEL, avatarOf, errorMessage, mm, mmBoot } from './shared';
import { fromLocalInput, groupPeopleByDept, loadPeople, toLocalInput, type MmPeople } from './meetingUi';
import PersonSearchSelect from './PersonSearchSelect.vue';

const props = defineProps<{ projectId?: string }>();
const emit = defineEmits<{ (e: 'close'): void; (e: 'created', id: string): void }>();

const SOURCES: MmMeetingSource[] = ['offline', 'tencent', 'zoom'];

const notif = useNotificationStore();
const projects = ref<Array<{ id: string; name: string; status: string }>>([]);
const people = ref<MmPeople>({ depts: [], people: [] });
const loaded = ref(false);
const loadError = ref('');
const error = ref('');
const busy = ref(false);
const q = ref('');
const picked = ref<Set<string>>(new Set());

/** 默认时间：下一个整点 */
function nextHour(): number {
  const d = new Date();
  d.setMinutes(0, 0, 0);
  d.setHours(d.getHours() + 1);
  return d.getTime();
}
const form = reactive({
  projectId: props.projectId || '',
  title: '',
  time: toLocalInput(nextHour()),
  source: 'offline' as MmMeetingSource,
  hostId: mmBoot.value?.me?.person?.id || '',
});

const pickGroups = computed(() => groupPeopleByDept(people.value, q.value));
const selectedPeople = computed(() => {
  const ids = new Set(picked.value);
  if (form.hostId) ids.add(form.hostId);
  return people.value.people.filter((p) => ids.has(p.id));
});
const attendeeCount = computed(() => selectedPeople.value.length);

function togglePerson(id: string): void {
  if (id === form.hostId) return;
  const next = new Set(picked.value);
  if (next.has(id)) next.delete(id); else next.add(id);
  picked.value = next;
}
function toggleDept(list: MmPeople['people']): void {
  const next = new Set(picked.value);
  const all = list.every((p) => next.has(p.id));
  for (const p of list) {
    if (p.id === form.hostId) continue;
    if (all) next.delete(p.id); else next.add(p.id);
  }
  picked.value = next;
}

function close(): void {
  if (!busy.value) emit('close');
}
function onKey(ev: KeyboardEvent): void {
  if (ev.key === 'Escape') close();
}

async function submit(): Promise<void> {
  if (busy.value) return;
  error.value = '';
  const time = fromLocalInput(form.time);
  if (!form.projectId) { error.value = i18nT('请选择所属项目'); return; }
  if (!form.title.trim()) { error.value = i18nT('请填写会议主题'); return; }
  if (!Number.isFinite(time)) { error.value = i18nT('请填写会议时间'); return; }
  if (!form.hostId) { error.value = i18nT('请选择主持人'); return; }
  const attendeeIds = [...new Set([form.hostId, ...picked.value])];
  if (attendeeIds.length < 2) { error.value = i18nT('请至少再选一位参会人'); return; }
  busy.value = true;
  try {
    const mt = await mm<MmMeeting>('meeting.create', {
      projectId: form.projectId, title: form.title.trim(), time, source: form.source, hostId: form.hostId, attendeeIds,
    });
    notif.success(i18nT('会议已创建，下一步上传会议文件'));
    emit('created', mt.id);
  } catch (e) {
    error.value = errorMessage(e);
  } finally {
    busy.value = false;
  }
}

onMounted(async () => {
  document.addEventListener('keydown', onKey);
  try {
    const [ps, pp] = await Promise.all([
      mm<Array<{ id: string; name: string; status: string }>>('project.list', { status: 'active' }),
      loadPeople(),
    ]);
    projects.value = (Array.isArray(ps) ? ps : []).filter((p) => !p.status || p.status === 'active');
    people.value = pp;
    if (!form.projectId && projects.value.length === 1) form.projectId = projects.value[0].id;
  } catch (e) {
    loadError.value = errorMessage(e);
  } finally {
    loaded.value = true;
  }
});
onBeforeUnmount(() => document.removeEventListener('keydown', onKey));
</script>

<style scoped>
.mm-dialog-overlay { position: fixed; inset: 0; z-index: 1000; display: grid; place-items: center; padding: 24px; background: var(--color-scrim, color-mix(in srgb, var(--color-text-primary) 40%, transparent)); }
.mm-cd { width: min(720px, 100%); max-height: calc(100vh - 48px); display: grid; grid-template-rows: auto minmax(0, 1fr) auto; border-radius: var(--radius-6); background: var(--color-bg-card); border: 1px solid var(--color-border); box-shadow: 0 24px 60px color-mix(in srgb, var(--color-text-primary) 22%, transparent); }
.mm-cd__head { display: flex; align-items: center; padding: 16px 20px; border-bottom: 1px solid var(--color-border); }
.mm-cd__head h3 { margin: 0; font-size: 18px; flex: 1; }
.mm-cd__x { width: 32px; height: 32px; border: none; border-radius: var(--radius-3); background: transparent; color: var(--color-text-secondary); font-size: 20px; cursor: pointer; }
.mm-cd__x:hover { background: var(--color-bg-hover); }
.mm-cd__body { display: grid; gap: 14px; padding: 16px 20px; overflow-y: auto; min-height: 0; }
.mm-cd__row { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 14px; }
.req { color: var(--color-danger); }
.ss-field small { margin-inline-start: 6px; }
.mm-cd__seg { display: inline-flex; border: 1px solid var(--color-border); border-radius: var(--radius-3); overflow: hidden; height: 34px; }
.mm-cd__seg button { flex: 1; padding: 0 14px; border: none; background: var(--color-bg-input); color: var(--color-text-secondary); font: inherit; font-size: var(--font-size-md); cursor: pointer; }
.mm-cd__seg button + button { border-inline-start: 1px solid var(--color-border); }
.mm-cd__seg button.on { background: var(--color-brand); color: var(--color-on-accent); font-weight: 700; }
.mm-cd__chips { display: flex; flex-wrap: wrap; gap: 6px; }
.mm-cd__chip { display: inline-flex; align-items: center; gap: 4px; padding: 2px 4px 2px 10px; border-radius: var(--radius-pill); background: color-mix(in srgb, var(--color-brand) 10%, transparent); color: var(--color-brand); font-size: 12.5px; }
.mm-cd__chip button { border: none; background: transparent; color: inherit; cursor: pointer; padding: 0 2px; display: inline-flex; }
.mm-cd__picker { display: grid; border: 1px solid var(--color-border); border-radius: var(--radius-4); overflow: hidden; }
.mm-cd__search { display: flex; align-items: center; gap: 6px; padding: 0 10px; height: 36px; border-bottom: 1px solid var(--color-border); color: var(--color-text-secondary); }
.mm-cd__search input { flex: 1; border: none; background: transparent; color: var(--color-text-primary); font: inherit; font-size: var(--font-size-md); outline: none; height: auto; padding: 0; }
.mm-cd__groups { max-height: 260px; overflow-y: auto; padding: 4px 10px 10px; display: grid; gap: 6px; }
.mm-cd__ghead { display: flex; align-items: center; gap: 6px; padding: 6px 0 2px; font-size: 12.5px; }
.mm-cd__ghead small { color: var(--color-text-secondary); }
.mm-grow { flex: 1; }
.mm-cd__person { display: flex; align-items: center; gap: 8px; padding: 4px 6px; border-radius: var(--radius-3); cursor: pointer; font-size: var(--font-size-md); color: var(--color-text-primary); }
.mm-cd__person:hover { background: var(--color-bg-hover); }
.mm-cd__person input { height: auto; width: auto; }
.mm-cd__person small { color: var(--color-text-secondary); font-size: 11.5px; }
.mm-av { width: 24px; height: 24px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; color: var(--color-on-accent); font-size: 11.5px; font-weight: 700; flex: 0 0 auto; }
.mm-cd__none { margin: 6px 0; color: var(--color-text-secondary); font-size: 12.5px; }
.mm-cd__foot { display: flex; align-items: center; gap: 8px; padding: 14px 20px; border-top: 1px solid var(--color-border); flex-wrap: wrap; }
.spin { animation: mm-spin 1s linear infinite; }
@keyframes mm-spin { to { transform: rotate(360deg); } }
</style>
