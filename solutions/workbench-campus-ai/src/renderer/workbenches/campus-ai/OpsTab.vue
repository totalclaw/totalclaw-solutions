<template>
  <div class="ca-ops">
    <section class="ss-panel ca-profile" data-test="ca-profile">
      <h3><i class="ri-government-line"></i>{{ $t('学校档案') }}</h3>
      <div class="ca-profile__body">
        <div class="ca-profile__logo">
          <div class="ca-profile__crest" :class="{ empty: !state?.logo }">
            <img v-if="state?.logo" :src="state.logo" alt="" />
            <i v-else class="ri-image-add-line"></i>
          </div>
          <div class="ss-actions">
            <button type="button" class="ss-btn sm" :disabled="logoBusy" data-test="ca-logo-pick" @click="pickLogo"><i :class="logoBusy ? 'ri-loader-4-line spin' : 'ri-upload-2-line'"></i>{{ state?.logo ? $t('更换校徽') : $t('上传校徽') }}</button>
            <button v-if="state?.logo" type="button" class="ss-btn sm ghost" :disabled="logoBusy" @click="clearLogo">{{ $t('移除') }}</button>
          </div>
          <small class="ss-muted">{{ $t('PNG、JPG、WebP 或 SVG，3MB 以内；透明底的圆形校徽效果最好') }}</small>
        </div>
        <div class="ca-profile__fields">
          <div class="ss-grid">
            <label class="ss-field"><span>{{ $t('学校名称') }}</span><input v-model="draft.schoolName" :placeholder="$t('如：某某职业技术学院')" data-test="ca-profile-name" /></label>
            <label class="ss-field"><span>{{ $t('英文名称') }}</span><input v-model="prof.englishName" /></label>
            <label class="ss-field"><span>{{ $t('校训') }}</span><input v-model="prof.motto" /></label>
            <label class="ss-field"><span>{{ $t('建校年份') }}</span><input v-model="prof.founded" inputmode="numeric" /></label>
            <label class="ss-field"><span>{{ $t('地址') }}</span><input v-model="prof.address" /></label>
            <label class="ss-field"><span>{{ $t('官网') }}</span><input v-model="prof.website" placeholder="https://" /></label>
          </div>
          <label class="ss-field"><span>{{ $t('学校简介') }}</span><textarea v-model="prof.intro" rows="3"></textarea></label>
          <small class="ss-muted">{{ $t('校名、校徽和校训显示在页头和学生手机端；校名用于问答和通知的署名。点下方「保存设置」生效。') }}</small>
        </div>
      </div>
    </section>

    <section class="ss-panel">
      <h3><i class="ri-pulse-line"></i>{{ $t('服务状态') }}</h3>
      <div class="ss-table-wrap">
        <table class="ss-table">
          <thead><tr><th>{{ $t('服务') }}</th><th>{{ $t('状态') }}</th><th>{{ $t('说明') }}</th><th></th></tr></thead>
          <tbody>
            <tr>
              <td>{{ $t('大模型') }}</td>
              <td><span class="ss-chip" :class="modelTest ? (modelTest.ok ? 'ok' : 'bad') : state?.model ? 'brand' : 'warn'">{{ modelTest ? (modelTest.ok ? $t('正常') : $t('不可用')) : state?.model ? $t('已配置') : $t('未配置') }}</span></td>
              <td class="ca-wrap">{{ modelTest ? (modelTest.ok ? $t('{p0} · {n} 秒', { p0: modelTest.model, n: (modelTest.ms / 1000).toFixed(1) }) : modelTest.error) : (state?.model || $t('在「设置 → 模型」里配置')) }}<br><small class="ss-muted">{{ $t('用于依据原文作答、写谈话提纲与通知；不可用时问答转办、通知改用模板') }}</small></td>
              <td><button type="button" class="ss-btn sm" :disabled="testing" data-test="ca-model-test" @click="testModel"><i :class="testing ? 'ri-loader-4-line spin' : 'ri-flashlight-line'"></i>{{ $t('检测') }}</button></td>
            </tr>
            <tr>
              <td>{{ $t('知识库检索') }}</td>
              <td><span class="ss-chip ok">{{ $t('本机') }}</span></td>
              <td class="ca-wrap">{{ $t('分段与向量在本机计算，不依赖外部服务；已就绪 {a} 份文档、{b} 段', { a: state?.stats.docsBuilt || 0, b: state?.stats.chunks || 0 }) }}</td>
              <td></td>
            </tr>
            <tr>
              <td>{{ $t('学生手机端') }}</td>
              <td><span class="ss-chip" :class="state?.mobile.running ? 'ok' : ''">{{ state?.mobile.running ? $t('运行中') : $t('未开启') }}</span></td>
              <td class="ca-wrap">{{ state?.mobile.url || $t('在「智能问答」里开启') }}</td>
              <td></td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <section class="ss-panel">
      <h3><i class="ri-settings-3-line"></i>{{ $t('平台设置') }}</h3>
      <div class="ss-grid">
        <label class="ss-field"><span>{{ $t('学校求助电话（敏感问题时告诉学生）') }}</span><input v-model="draft.hotline" :placeholder="$t('如心理咨询中心、保卫处值班电话')" /></label>
        <label class="ss-field"><span>{{ $t('敏感问题转给') }}</span><select v-model="draft.sensitiveDept"><option v-for="d in deptList" :key="d" :value="d">{{ d }}</option></select></label>
        <label class="ss-field"><span>{{ $t('问答记录保留天数') }}</span><input v-model.number="draft.retentionDays" type="number" min="7" max="3650" /></label>
        <label class="ss-field"><span>{{ $t('手机端每台每天提问上限') }}</span><input v-model.number="draft.mobileDailyLimit" type="number" min="1" max="500" /></label>
        <label class="ss-field"><span>{{ $t('检索证据下限（0.05～0.9，越高越严）') }}</span><input v-model.number="draft.minScore" type="number" min="0.05" max="0.9" step="0.01" /></label>
      </div>
      <label class="ss-field"><span>{{ $t('部门（用；分隔）') }}</span><input v-model="deptText" /></label>
      <label class="ss-field"><span>{{ $t('文档类别（用；分隔）') }}</span><input v-model="catText" /></label>
      <div class="ss-actions">
        <span class="ss-muted">{{ $t('输出目录：{p0}', { p0: state?.outputDir || '' }) }}</span>
        <button type="button" class="ss-link" @click="pickDir">{{ $t('更换') }}</button>
      </div>
      <div class="ss-actions"><button type="button" class="ss-btn primary" :disabled="saving || !dirty" data-test="ca-settings-save" @click="save"><i class="ri-save-line"></i>{{ $t('保存设置') }}</button></div>
    </section>

    <section class="ss-panel">
      <h3><i class="ri-shield-keyhole-line"></i>{{ $t('数据与隐私') }}</h3>
      <ul class="ca-list">
        <li>{{ $t('知识库文档、问答记录、学生成绩与考勤都只存在本机账号目录里') }}</li>
        <li>{{ $t('学生手机端是匿名会话，不收集姓名学号；只能看到自己问过的问题') }}</li>
        <li>{{ $t('学业预警交给模型的只有匿名事实，不含姓名、学号、班级') }}</li>
        <li>{{ $t('问答记录与审计日志超过保留天数自动删除') }}</li>
      </ul>
      <div class="ss-actions">
        <button type="button" class="ss-btn" @click="purge('privacy.purgeExpired')"><i class="ri-time-line"></i>{{ $t('立即清理过期记录') }}</button>
        <button type="button" class="ss-btn danger" @click="purge('privacy.purgeQa')">{{ purgeArmed ? $t('确认清空') : $t('清空全部问答记录') }}</button>
      </div>
    </section>

    <section class="ss-panel">
      <h3><i class="ri-file-list-3-line"></i>{{ $t('调用审计') }}</h3>
      <div class="ss-actions"><button type="button" class="ss-btn sm" @click="loadAudit"><i class="ri-refresh-line"></i>{{ $t('刷新') }}</button><span class="ss-muted">{{ $t('最近 300 条；不记录学生个人信息原文') }}</span></div>
      <div v-if="audit.length" class="ss-table-wrap tall">
        <table class="ss-table">
          <thead><tr><th>{{ $t('时间') }}</th><th>{{ $t('模块') }}</th><th>{{ $t('操作') }}</th><th>{{ $t('结果') }}</th><th class="num">{{ $t('耗时') }}</th><th>{{ $t('说明') }}</th></tr></thead>
          <tbody>
            <tr v-for="(a, i) in audit" :key="i" :class="{ bad: !a.ok }">
              <td>{{ fmtDateTime(a.at) }}</td><td>{{ moduleLabel(a.module) }}</td><td>{{ a.action }}</td>
              <td><span class="ss-chip" :class="a.ok ? 'ok' : 'bad'">{{ a.ok ? $t('成功') : $t('失败') }}</span></td>
              <td class="num">{{ a.ms !== undefined ? `${(a.ms / 1000).toFixed(1)}s` : '' }}</td>
              <td class="ca-wrap">{{ a.detail || '' }}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <p v-else class="ss-muted">{{ $t('还没有记录') }}</p>
    </section>
  </div>
</template>

<script setup lang="ts">
/** 运维与设置：服务状态、平台设置、数据与隐私、调用审计 */
import { computed, onMounted, reactive, ref, watch } from 'vue';
import type { CaAuditEntry, CaModule, CaSchoolProfile, CaSettings } from '@totalclaw/ipc-contracts';
import { useNotificationStore } from '../../stores/notification';
import { t as i18nT } from '../../i18n';
import { ca, caState, errorMessage, fmtDateTime, refreshState } from './shared';

const notif = useNotificationStore();
const state = computed(() => caState.value);
const draft = reactive<Partial<CaSettings>>({});
const prof = reactive<Omit<CaSchoolProfile, 'logoPath'>>({ englishName: '', motto: '', founded: '', address: '', website: '', intro: '' });
const logoBusy = ref(false);
const deptText = ref('');
const catText = ref('');
const saving = ref(false);
const testing = ref(false);
const modelTest = ref<{ ok: boolean; model: string; ms: number; error?: string } | null>(null);
const audit = ref<CaAuditEntry[]>([]);
const purgeArmed = ref(false);

const split = (s: string): string[] => s.split(/[；;,，\n]/).map((x) => x.trim()).filter(Boolean);
const deptList = computed(() => split(deptText.value));
function load(s: CaSettings | undefined): void {
  if (!s) return;
  Object.assign(draft, { schoolName: s.schoolName, hotline: s.hotline, sensitiveDept: s.sensitiveDept, retentionDays: s.retentionDays, mobileDailyLimit: s.mobileDailyLimit, minScore: s.minScore });
  Object.assign(prof, { englishName: s.profile.englishName, motto: s.profile.motto, founded: s.profile.founded, address: s.profile.address, website: s.profile.website, intro: s.profile.intro });
  deptText.value = s.depts.join(i18nT('；'));
  catText.value = s.categories.join(i18nT('；'));
}
// 按内容 watch：状态每次刷新都会换对象，按对象 watch 会把正在编辑的表单冲掉
watch(() => JSON.stringify(caState.value?.settings || null), () => load(caState.value?.settings), { immediate: true });
const patch = (): Partial<CaSettings> => ({ ...draft, depts: split(deptText.value), categories: split(catText.value), profile: { ...prof, logoPath: caState.value?.settings.profile.logoPath || '' } });
const dirty = computed(() => {
  const s = caState.value?.settings;
  if (!s) return false;
  const p = patch();
  return (Object.keys(p) as Array<keyof CaSettings>).some((k) => JSON.stringify(p[k]) !== JSON.stringify(s[k]));
});

async function save(): Promise<void> {
  saving.value = true;
  try { await ca('settings.patch', { patch: patch() }); await refreshState(); notif.success(i18nT('已保存')); } catch (e) { notif.error(errorMessage(e)); } finally { saving.value = false; }
}
async function pickDir(): Promise<void> {
  const dir = await ca<string>('folder.pick').catch(() => '');
  if (!dir) return;
  try { await ca('settings.patch', { patch: { outputDir: dir } }); await refreshState(); } catch (e) { notif.error(errorMessage(e)); }
}
async function pickLogo(): Promise<void> {
  const paths = await ca<string[]>('files.pick', { kind: 'image', multi: false, title: i18nT('选择校徽图片') }).catch(() => []);
  if (!paths[0]) return;
  logoBusy.value = true;
  try { await ca('brand.logo', { path: paths[0] }); await refreshState(); } catch (e) { notif.error(errorMessage(e)); } finally { logoBusy.value = false; }
}
async function clearLogo(): Promise<void> {
  logoBusy.value = true;
  try { await ca('brand.logoClear'); await refreshState(); } catch (e) { notif.error(errorMessage(e)); } finally { logoBusy.value = false; }
}
async function testModel(): Promise<void> {
  testing.value = true;
  try { modelTest.value = await ca('model.test'); void loadAudit(); } catch (e) { modelTest.value = { ok: false, model: '', ms: 0, error: errorMessage(e) }; } finally { testing.value = false; }
}
async function purge(action: string): Promise<void> {
  if (action === 'privacy.purgeQa' && !purgeArmed.value) {
    purgeArmed.value = true;
    setTimeout(() => { purgeArmed.value = false; }, 3000);
    return;
  }
  purgeArmed.value = false;
  try {
    const n = await ca<number>(action);
    await refreshState();
    notif.success(i18nT('已删除 {n} 条问答记录', { n }));
    void loadAudit();
  } catch (e) { notif.error(errorMessage(e)); }
}
async function loadAudit(): Promise<void> {
  try { audit.value = await ca<CaAuditEntry[]>('audit.list', { limit: 300 }); } catch (e) { notif.error(errorMessage(e)); }
}
function moduleLabel(m: CaModule): string {
  return { kb: i18nT('知识库'), qa: i18nT('问答'), mobile: i18nT('手机端'), ticket: i18nT('转办'), warning: i18nT('学业预警'), ops: i18nT('运维'), apps: i18nT('AI 应用中心'), teach: i18nT('教学'), research: i18nT('科研'), gov: i18nT('校务治理') }[m] || m;
}
onMounted(() => { void loadAudit(); });
</script>

<style scoped>
.ca-ops { display: grid; gap: 14px; max-width: 1100px; }
.ca-profile__body { display: grid; grid-template-columns: 200px minmax(0, 1fr); gap: 20px; align-items: start; }
@media (max-width: 760px) { .ca-profile__body { grid-template-columns: 1fr; } }
.ca-profile__logo { display: grid; gap: 10px; justify-items: center; text-align: center; }
.ca-profile__crest { width: 132px; height: 132px; border-radius: 50%; display: grid; place-items: center; border: 3px solid var(--ca-gold); box-shadow: 0 0 0 5px var(--color-bg-card), 0 0 0 6px var(--ca-gold-soft); background: var(--color-bg-card); overflow: hidden; }
.ca-profile__crest img { width: 100%; height: 100%; object-fit: contain; padding: 10px; }
.ca-profile__crest.empty { border-style: dashed; }
.ca-profile__crest i { font-size: 34px; color: var(--color-text-muted); }
.ca-profile__fields { display: grid; gap: 10px; }
</style>
