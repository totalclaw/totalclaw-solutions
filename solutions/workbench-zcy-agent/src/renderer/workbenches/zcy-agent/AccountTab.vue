<template>
  <div class="ss-module">
    <StickyProgress :title="$t('账号与材料')" :metas="metas" :runtime="runtime" :current-key="currentKey" @jump="jump" />
    <div class="ss-steps">
      <StepCard step-key="a-company" :index="0" :title="metas[0].title" :hint="metas[0].hint" :runtime="runtime['a-company']" :is-current="currentKey === 'a-company'">
        <div class="ss-grid">
          <label class="ss-field"><span>{{ $t('企业名称') }}</span><input v-model="c.name" type="text" data-test="zc-company-name" /></label>
          <label class="ss-field"><span>{{ $t('统一社会信用代码') }}</span><input v-model="c.creditCode" type="text" /></label>
          <label class="ss-field"><span>{{ $t('法定代表人') }}</span><input v-model="c.legalPerson" type="text" /></label>
          <label class="ss-field"><span>{{ $t('联系人') }}</span><input v-model="c.contact" type="text" /></label>
          <label class="ss-field"><span>{{ $t('联系电话') }}</span><input v-model="c.phone" type="text" /></label>
          <label class="ss-field"><span>{{ $t('地址') }}</span><input v-model="c.address" type="text" /></label>
          <label class="ss-field"><span>{{ $t('开户银行') }}</span><input v-model="c.bank" type="text" /></label>
          <label class="ss-field"><span>{{ $t('银行账号') }}</span><input v-model="c.bankAccount" type="text" /></label>
          <label class="ss-field"><span>{{ $t('所在区划（决定用哪套规则）') }}</span>
            <select v-model="regionId" data-test="zc-region"><option v-for="r in regions" :key="r.id" :value="r.id">{{ r.name }}</option></select>
          </label>
        </div>
        <button type="button" class="ss-link zc-more" @click="showMore = !showMore">{{ showMore ? $t('收起入驻资料') : $t('展开入驻要用的更多资料（{n} 项）', { n: MORE.length }) }}</button>
        <div v-if="showMore" class="ss-grid">
          <label v-for="f in MORE" :key="f.key" class="ss-field" :class="{ wide: f.wide }"><span>{{ f.label }}</span>
            <textarea v-if="f.wide" v-model="c[f.key]" rows="2"></textarea><input v-else v-model="c[f.key]" type="text" />
          </label>
        </div>
        <p v-if="region" class="ss-note info"><i class="ri-information-line"></i>{{ region.note }}{{ $t('（规则来自公开资料，各地会调整，以本区划现行规定为准，可在设置里改）') }}</p>
        <div class="ss-actions"><button type="button" class="ss-btn primary" :disabled="!!busy" data-test="zc-company-save" @click="saveCompany"><i class="ri-save-line"></i>{{ $t('保存') }}</button></div>
      </StepCard>

      <StepCard step-key="a-qual" :index="1" :title="metas[1].title" :hint="metas[1].hint" :runtime="runtime['a-qual']" :is-current="currentKey === 'a-qual'">
        <div class="ss-grid">
          <label class="ss-field"><span>{{ $t('资质名称') }}</span><input v-model="q.name" type="text" :placeholder="$t('如：营业执照、品牌授权书、3C 证书')" /></label>
          <label class="ss-field"><span>{{ $t('到期日（长期有效留空）') }}</span><input v-model="q.expireAt" type="date" /></label>
          <label class="ss-field"><span>{{ $t('说明') }}</span><input v-model="q.note" type="text" /></label>
        </div>
        <div class="ss-actions">
          <button type="button" class="ss-btn" @click="pickQualFile"><i class="ri-attachment-2"></i>{{ q.file ? fileName(q.file) : $t('选择文件') }}</button>
          <button type="button" class="ss-btn primary" :disabled="!!busy || !q.name.trim()" @click="saveQual"><i class="ri-add-line"></i>{{ q.id ? $t('保存修改') : $t('添加资质') }}</button>
          <button v-if="q.id" type="button" class="ss-link" @click="resetQual">{{ $t('取消') }}</button>
        </div>
        <p v-if="!quals.length" class="ss-empty">{{ $t('把营业执照、品牌授权、检测报告等登记在这里，到期前 30 天提醒') }}</p>
        <div v-else class="ss-table-wrap">
          <table class="ss-table">
            <thead><tr><th>{{ $t('资质名称') }}</th><th>{{ $t('到期日') }}</th><th>{{ $t('文件') }}</th><th>{{ $t('说明') }}</th><th></th></tr></thead>
            <tbody>
              <tr v-for="x in quals" :key="x.id">
                <td>{{ x.name }}</td>
                <td><span class="ss-chip" :class="qualClass(x.id)">{{ x.expireAt || $t('长期') }}</span></td>
                <td><button v-if="x.file" type="button" class="ss-link" @click="openPath(x.file)">{{ fileName(x.file) }}</button><span v-else class="ss-muted">—</span></td>
                <td>{{ x.note }}</td>
                <td class="zc-ops"><button type="button" class="ss-link" @click="Object.assign(q, x)">{{ $t('改') }}</button><button type="button" class="ss-link" @click="removeQual(x.id)">{{ $t('删除') }}</button></td>
              </tr>
            </tbody>
          </table>
        </div>
      </StepCard>

      <StepCard step-key="a-account" :index="2" :title="metas[2].title" :hint="metas[2].hint" :runtime="runtime['a-account']" :is-current="currentKey === 'a-account'">
        <p class="ss-note info"><i class="ri-shield-keyhole-line"></i>{{ $t('密码用系统钥匙串加密后存在这台电脑上，只在你点「打开登录页」时由应用填进政采云的登录框（只在 zcygov.cn 域名下填），不会发给模型，也不会出现在和数字员工的对话里。') }}</p>
        <p v-if="state && !state.secretStorage" class="ss-note warn"><i class="ri-error-warning-line"></i>{{ $t('这台电脑的系统钥匙串不可用，密码没法安全保存；登录时请自己在登录框里输入。') }}</p>
        <div class="ss-grid">
          <label class="ss-field"><span>{{ $t('登录账号') }}</span><input v-model="a.username" type="text" autocomplete="off" data-test="zc-username" /></label>
          <label class="ss-field"><span>{{ $t('密码') }}</span><input v-model="a.password" type="password" autocomplete="new-password" :placeholder="account?.hasPassword ? $t('已保存，留空不改') : ''" :disabled="!state?.secretStorage" data-test="zc-password" /></label>
          <label class="ss-field"><span>{{ $t('登录页地址') }}</span><input v-model="a.loginUrl" type="text" /></label>
          <label class="ss-field"><span>{{ $t('工作台地址') }}</span><input v-model="a.homeUrl" type="text" /></label>
        </div>
        <div class="ss-actions">
          <button type="button" class="ss-btn primary" :disabled="!!busy" data-test="zc-account-save" @click="saveAccount"><i class="ri-save-line"></i>{{ $t('保存账号') }}</button>
          <span v-if="account?.hasPassword" class="ss-chip ok" data-test="zc-has-password"><i class="ri-lock-line"></i>{{ $t('密码已加密保存') }}</span>
          <button v-if="account?.hasPassword" type="button" class="ss-link" @click="clearPassword">{{ $t('删除保存的密码') }}</button>
        </div>
      </StepCard>

      <StepCard step-key="a-login" :index="3" :title="metas[3].title" :hint="metas[3].hint" :runtime="runtime['a-login']" :is-current="currentKey === 'a-login'">
        <div class="ss-actions">
          <button type="button" class="ss-btn primary" :disabled="!!busy" data-test="zc-login" @click="login"><i :class="busy === 'a-login' ? 'ri-loader-4-line spin' : 'ri-login-box-line'"></i>{{ $t('打开登录页并填好账号密码') }}</button>
          <button v-if="loginResult" type="button" class="ss-btn" :disabled="!!busy" @click="logged = true"><i class="ri-check-line"></i>{{ $t('我已登录') }}</button>
        </div>
        <p v-if="loginResult" class="ss-note" :class="loginResult.filled ? 'ok' : 'warn'"><i :class="loginResult.filled ? 'ri-check-line' : 'ri-information-line'"></i>{{ loginText }}</p>
        <p class="ss-muted">{{ $t('协议勾选、滑块、图形验证码、短信验证码和「登录」按钮由你完成。登录后点下面的按钮，应用会打开供应商工作台并读回你的入驻状态和待办。CA 证书登录、电子投标客户端不在这个智能体的范围内。') }}</p>
        <div class="ss-actions">
          <button type="button" class="ss-btn primary" :disabled="!!busy" data-test="zc-read-workbench" @click="readWorkbench"><i :class="busy === 'a-login' ? 'ri-loader-4-line spin' : 'ri-dashboard-line'"></i>{{ $t('打开工作台并读取') }}</button>
          <button type="button" class="ss-link" @click="openSite('portal')">{{ $t('吉林省政府采购网') }}</button>
        </div>
        <template v-if="wb">
          <p v-if="!wb.loggedIn" class="ss-note warn" data-test="zc-wb-state"><i class="ri-user-follow-line"></i>{{ $t('政采云还没有登录（或登录已过期）：请在内置浏览器里登录后再点一次') }}</p>
          <div v-else class="zc-wb" data-test="zc-wb-state">
            <span class="ss-chip ok"><i class="ri-check-line"></i>{{ $t('已登录') }}</span>
            <span v-if="wb.region || wb.identity" class="ss-chip" :class="wb.temporary ? 'warn' : 'brand'">{{ wb.region }} · {{ wb.identity }}</span>
            <span v-for="t in wb.todos.filter((x) => x.count > 0)" :key="t.label" class="ss-chip bad">{{ t.label }} {{ t.count }}</span>
            <span class="ss-muted">{{ $t('读取于 {p0}', { p0: fmtDateTime(wb.readAt) }) }}</span>
          </div>
        </template>
      </StepCard>

      <StepCard step-key="a-onboard" :index="4" :title="metas[4].title" :hint="metas[4].hint" :runtime="runtime['a-onboard']" :is-current="currentKey === 'a-onboard'">
        <p v-if="wb?.loggedIn && !wb.temporary && !wb.identity" class="ss-note ok"><i class="ri-check-line"></i>{{ $t('工作台上没有「正在入驻」的提示，这个账号应该已经是正式供应商，这一步不用做') }}</p>
        <p v-else class="ss-note info"><i class="ri-information-line"></i>{{ $t('临时供应商进不了商品中心（实测是「无访问权限」），要先把入驻资料提交并通过审核。应用把文本资料填进入驻页面；证照上传、下拉选择、勾选协议，以及「保存草稿」「提交入驻申请」都由你来。') }}</p>
        <div class="ss-actions">
          <button type="button" class="ss-btn" :disabled="!!busy" data-test="zc-onboard-open" @click="openSite('onboard')"><i class="ri-external-link-line"></i>{{ $t('打开入驻页面') }}</button>
          <button type="button" class="ss-btn primary" :disabled="!!busy" data-test="zc-onboard-fill" @click="fillOnboard(false)"><i :class="busy === 'a-onboard' ? 'ri-loader-4-line spin' : 'ri-edit-2-line'"></i>{{ $t('把资料填进入驻页面') }}</button>
          <span class="ss-muted">{{ $t('先在入驻列表里点「继续入驻」进到填资料的页面，再点填写') }}</span>
        </div>
        <div v-if="check" class="zc-check" data-test="zc-onboard-check">
          <p v-if="check.missing.length" class="ss-note warn"><i class="ri-error-warning-line"></i>{{ $t('这些文本资料还没填（在第 1 步里补）：{p0}', { p0: check.missing.join('、') }) }}</p>
          <p v-else class="ss-note ok"><i class="ri-check-line"></i>{{ $t('能自动填的 {n} 项文本资料都齐了', { n: check.ready.length }) }}</p>
          <p class="ss-muted">{{ $t('要你在页面上处理的：{p0}', { p0: check.manual.join('、') }) }}</p>
        </div>
        <template v-if="fill">
          <p class="ss-note ok" data-test="zc-onboard-result"><i class="ri-check-line"></i>{{ $t('填了 {a} 项；{b} 项页面上本来就是这个值', { a: fill.filled.length, b: fill.same.length }) }}{{ fill.filled.length ? $t('：{p0}', { p0: fill.filled.join('、') }) : '' }}</p>
          <p v-if="fill.kept.length" class="ss-note warn"><i class="ri-error-warning-line"></i>{{ $t('这些项页面上已经有不一样的值，没有动（以平台按营业执照预填的为准；要用你的资料覆盖就点右边）：{p0}', { p0: fill.kept.map((k) => `${k[0]}=${k[1]}`).join('；') }) }}<button type="button" class="ss-btn sm" :disabled="!!busy" @click="fillOnboard(true)">{{ $t('用我的资料覆盖') }}</button></p>
          <p v-if="fill.missing.length" class="ss-note warn"><i class="ri-error-warning-line"></i>{{ $t('页面上没找到这些输入框（页面可能改版了），请手工填：{p0}', { p0: fill.missing.join('、') }) }}</p>
          <p class="ss-note info"><i class="ri-cursor-line"></i>{{ $t('现在请在入驻页面上完成上传与选择，核对无误后亲自点「保存草稿」或「提交入驻申请」。') }}</p>
        </template>
      </StepCard>
    </div>
  </div>
</template>

<script setup lang="ts">
/** 账号与材料：企业信息与区划 → 资质 → 账号密码（加密保存）→ 登录。 */
import { computed, reactive, ref, watch } from 'vue';
import type { ZcCompany } from '@totalclaw/ipc-contracts';
import { t as i18nT } from '../../i18n';
import StepCard from '../service-settlement/StepCard.vue';
import StickyProgress from '../service-settlement/StickyProgress.vue';
import { errorMessage, fmtDateTime, openPath, refreshState, scrollToStep, zc, zcState, type StepMeta, type StepRuntime } from './shared';

const state = zcState;
const busy = ref('');
const errors = ref<Record<string, string>>({});
const account = computed(() => state.value?.settings.account);
const regions = computed(() => state.value?.settings.regions || []);
const quals = computed(() => state.value?.settings.company.qualifications || []);
const c = reactive<Omit<ZcCompany, 'qualifications'>>({ name: '', creditCode: '', legalPerson: '', contact: '', phone: '', address: '', bank: '', bankAccount: '', englishName: '', shortName: '', postcode: '', email: '', contactMobile: '', totalAssets: '', employees: '', income: '', intro: '', registerOrg: '', registerCapital: '', scope: '', onjobCount: '', socialPayCount: '' });
type MoreKey = 'englishName' | 'shortName' | 'postcode' | 'email' | 'contactMobile' | 'totalAssets' | 'employees' | 'income' | 'registerOrg' | 'registerCapital' | 'onjobCount' | 'socialPayCount' | 'scope' | 'intro';
const MORE: Array<{ key: MoreKey; label: string; wide?: boolean }> = [
  { key: 'shortName', label: i18nT('商家简称') }, { key: 'englishName', label: i18nT('英文名称') }, { key: 'postcode', label: i18nT('邮政编码') },
  { key: 'email', label: i18nT('对外电子邮箱') }, { key: 'contactMobile', label: i18nT('联系人电话（业务负责人）') },
  { key: 'registerOrg', label: i18nT('营业执照登记机关') }, { key: 'registerCapital', label: i18nT('注册资金（万元）') },
  { key: 'totalAssets', label: i18nT('上年末资产总额（万元）') }, { key: 'employees', label: i18nT('上年末从业人员（人）') }, { key: 'income', label: i18nT('上年度营业收入（万元）') },
  { key: 'onjobCount', label: i18nT('在职人数') }, { key: 'socialPayCount', label: i18nT('社保缴费人数') },
  { key: 'scope', label: i18nT('经营范围（照营业执照）'), wide: true }, { key: 'intro', label: i18nT('店铺介绍'), wide: true },
];
const showMore = ref(false);
const wb = computed(() => state.value?.workbench || null);
const check = ref<{ ready: string[]; missing: string[]; manual: string[] } | null>(null);
const fill = ref<{ filled: string[]; same: string[]; kept: Array<[string, string]>; missing: string[] } | null>(null);
const regionId = ref('general');
const region = computed(() => regions.value.find((r) => r.id === regionId.value));
const a = reactive({ username: '', password: '', loginUrl: '', homeUrl: '' });
const blankQ = () => ({ id: '', name: '', file: '', expireAt: '', note: '' });
const q = reactive(blankQ());
const resetQual = () => Object.assign(q, blankQ());
const logged = ref(false);
const loginResult = ref<{ opened: boolean; filled: boolean; reason: string } | null>(null);
const fileName = (p: string) => p.split(/[\\/]/).pop() || p;

let seeded = false;
watch(state, (s) => {
  if (!s || seeded) return;
  seeded = true;
  const { qualifications: _q, ...rest } = s.settings.company;
  Object.assign(c, rest);
  regionId.value = s.settings.regionId;
  Object.assign(a, { username: s.settings.account.username, loginUrl: s.settings.account.loginUrl, homeUrl: s.settings.account.homeUrl });
}, { immediate: true });

const qualClass = (id: string) => { const al = state.value?.alerts.find((x) => x.kind === 'qualification' && x.refId === id); return al ? (al.level === 'error' ? 'bad' : 'warn') : ''; };
const loginText = computed(() => {
  const r = loginResult.value;
  if (!r) return '';
  if (r.filled) return i18nT('账号密码已填好：请在内置浏览器里过验证码并点登录');
  if (r.reason === 'no-credential') return i18nT('登录页已打开：还没有保存账号密码，请自己在登录框里输入');
  if (r.reason === 'off-site') return i18nT('页面跳到了政采云以外的域名，没有填密码；请确认地址后自己登录');
  return i18nT('登录页已打开，但没找到账号密码输入框（可能默认是扫码或短信登录页签）：请切到账号密码登录后自己输入');
});

async function run(key: string, fn: () => Promise<unknown>): Promise<boolean> {
  busy.value = key;
  errors.value = { ...errors.value, [key]: '' };
  try { await fn(); await refreshState(); return true; } catch (e) { errors.value = { ...errors.value, [key]: errorMessage(e) }; void scrollToStep(key); return false; } finally { busy.value = ''; }
}
async function saveCompany(): Promise<void> {
  await run('a-company', async () => {
    if (!c.name.trim()) throw new Error(i18nT('请填企业名称'));
    await zc('settings.patch', { patch: { company: { ...c }, regionId: regionId.value } });
  });
  await loadCheck();
}
async function pickQualFile(): Promise<void> { const p = await zc<string[]>('files.pick', { kind: 'any' }); if (p[0]) q.file = p[0]; }
async function saveQual(): Promise<void> { if (await run('a-qual', () => zc('qual.save', { ...q, id: q.id || undefined }))) resetQual(); }
async function removeQual(id: string): Promise<void> { await run('a-qual', () => zc('qual.remove', { id })); }
async function saveAccount(): Promise<void> {
  const ok = await run('a-account', async () => {
    if (!a.username.trim()) throw new Error(i18nT('请填登录账号'));
    await zc('account.save', { username: a.username, loginUrl: a.loginUrl, homeUrl: a.homeUrl, ...(a.password ? { password: a.password } : {}) });
  });
  if (ok) a.password = '';
}
async function clearPassword(): Promise<void> { await run('a-account', () => zc('account.clearPassword')); }
async function loadCheck(): Promise<void> { try { check.value = await zc('onboard.checklist'); } catch { check.value = null; } }
async function openSite(target: 'workbench' | 'onboard' | 'portal'): Promise<void> { await run(target === 'onboard' ? 'a-onboard' : 'a-login', () => zc('site.open', { target })); }
async function readWorkbench(): Promise<void> { if (await run('a-login', () => zc('site.readWorkbench'))) logged.value = !!wb.value?.loggedIn; }
async function fillOnboard(overwrite: boolean): Promise<void> {
  fill.value = null;
  await run('a-onboard', async () => { fill.value = await zc('onboard.fill', { overwrite }); });
}
async function login(): Promise<void> {
  loginResult.value = null;
  await run('a-login', async () => { loginResult.value = await zc('account.login'); });
}

const metas: StepMeta[] = [
  { key: 'a-company', title: i18nT('企业信息与区划'), hint: i18nT('区划决定比价、图片、接单时限用哪套规则') },
  { key: 'a-qual', title: i18nT('资质材料'), hint: i18nT('登记证照与授权，到期前提醒') },
  { key: 'a-account', title: i18nT('政采云账号'), hint: i18nT('密码加密存在本机，不进模型对话') },
  { key: 'a-login', title: i18nT('登录并读取工作台'), hint: i18nT('应用填账号密码，你过验证码；登录后读回入驻状态与待办') },
  { key: 'a-onboard', title: i18nT('入驻资料'), hint: i18nT('把文本资料填进入驻页面，上传与提交由你来') },
];
function st(key: string, done: boolean, summary?: string): StepRuntime {
  if (busy.value === key) return { state: 'running' };
  if (errors.value[key]) return { state: 'failed', error: errors.value[key] };
  return done ? { state: 'done', summary } : { state: 'todo' };
}
const runtime = computed<Record<string, StepRuntime>>(() => ({
  'a-company': st('a-company', !!state.value?.settings.company.name, state.value?.settings.company.name),
  'a-qual': st('a-qual', quals.value.length > 0, i18nT('{n} 项', { n: quals.value.length })),
  'a-account': st('a-account', !!account.value?.username),
  'a-login': st('a-login', logged.value || !!wb.value?.loggedIn, wb.value?.loggedIn ? [wb.value.region, wb.value.identity].filter(Boolean).join(' · ') : ''),
  'a-onboard': st('a-onboard', !!wb.value?.loggedIn && !wb.value.temporary && !!fill.value || (!!wb.value?.loggedIn && !wb.value.temporary && !wb.value.identity)),
}));
const currentKey = computed(() => metas.find((m) => runtime.value[m.key].state !== 'done')?.key || 'a-onboard');
void loadCheck();
function jump(key: string): void { void scrollToStep(key); }
</script>

<style scoped>
.zc-ops { display: flex; gap: 10px; }
.zc-more { justify-self: start; }
.ss-field.wide { grid-column: 1 / -1; }
.zc-wb { display: flex; gap: 8px; align-items: center; flex-wrap: wrap; font-size: 12.5px; }
.zc-check { display: grid; gap: 6px; }
.zc-check p { margin: 0; }
.spin { animation: zc-spin 1s linear infinite; }
@keyframes zc-spin { to { transform: rotate(360deg); } }
</style>
