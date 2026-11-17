<template>
  <div class="mm-sm" data-test="mm-mobile-settings">
    <header class="mm-sp__head">
      <div>
        <h3>{{ $t('手机端') }}</h3>
        <p>{{ $t('在本机开一个手机页服务，同一局域网里的手机用浏览器打开。每个人一个带令牌的专属链接（等同企微免登），功能与电脑端一致，另有声纹采集页；企微卡片的按钮也跳到这里。') }}</p>
      </div>
      <span class="ss-chip" :class="status.running ? 'ok' : ''" data-test="mm-mobile-settings-state">{{ status.running ? $t('运行中') : $t('未开启') }}</span>
    </header>
    <p v-if="error" class="ss-note danger"><i class="ri-error-warning-line"></i>{{ error }}</p>

    <section class="mm-sm__svc">
      <div class="mm-sm__addr">
        <small>{{ $t('局域网地址') }}</small>
        <b v-if="status.running && status.url" class="mono">{{ status.url }}</b>
        <b v-else class="muted">{{ $t('服务未开启') }}</b>
      </div>
      <button type="button" class="ss-btn" data-test="mm-mobile-goto-home" @click="goTab('home')"><i class="ri-home-4-line"></i>{{ $t('到首页开关服务、扫码') }}</button>
    </section>
    <p class="ss-muted">{{ $t('专属链接只发给本人，泄露了可以让管理员重置。') }}</p>

    <div class="mm-sm__tools">
      <h4>{{ $t('每人专属链接') }}</h4>
      <span class="grow"></span>
      <label class="mm-sm__qr"><input v-model="showQr" type="checkbox" data-test="mm-mobile-qr" />{{ $t('同时显示二维码') }}</label>
      <label class="mm-search"><i class="ri-search-line" aria-hidden="true"></i><input v-model="q" type="search" :placeholder="$t('搜索员工')" :aria-label="$t('搜索员工')" /></label>
    </div>

    <div class="ss-table-wrap">
      <table class="ss-table">
        <thead><tr><th>{{ $t('员工') }}</th><th>{{ $t('部门') }}</th><th>{{ $t('专属链接') }}</th><th class="num">{{ $t('操作') }}</th></tr></thead>
        <tbody>
          <tr v-if="!paged.rows.length"><td colspan="4" class="mm-sm__empty">{{ $t('没有符合条件的员工') }}</td></tr>
          <tr v-for="p in paged.rows" :key="p.id">
            <td><PersonChip :name="p.name" /></td>
            <td>{{ deptName(p.deptId) || '—' }}</td>
            <td class="mm-sm__link">
              <template v-if="links[p.id]">
                <span class="mono">{{ links[p.id] }}</span>
                <img v-if="showQr && qrs[p.id]" :src="qrs[p.id]" :alt="$t('{name} 的专属链接二维码', { name: p.name })" width="120" height="120" />
              </template>
              <span v-else class="ss-muted">—</span>
            </td>
            <td class="num">
              <button type="button" class="ss-link" :disabled="!status.running || rowBusy === p.id" :title="status.running ? '' : $t('先开启手机页服务')" :data-test="`mm-mobile-link-${p.id}`" @click="makeLink(p)">
                {{ links[p.id] ? $t('复制链接') : $t('生成并复制') }}
              </button>
              <template v-if="links[p.id]">
                <span class="mm-sm__sep" aria-hidden="true">·</span>
                <button type="button" class="ss-link danger" :disabled="rowBusy === p.id" :data-test="`mm-mobile-reset-${p.id}`" @click="resetLink(p)">{{ $t('重置') }}</button>
              </template>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <footer class="mm-sm__foot">
      <span>{{ $t('共 {n} 人', { n: filtered.length }) }}</span>
      <span class="grow"></span>
      <nav v-if="paged.pages > 1" class="mm-pager" :aria-label="$t('分页')">
        <button type="button" :disabled="paged.page <= 1" :aria-label="$t('上一页')" @click="page = paged.page - 1"><i class="ri-arrow-left-s-line"></i></button>
        <button v-for="n in paged.pages" :key="n" type="button" :class="{ on: n === paged.page }" @click="page = n">{{ n }}</button>
        <button type="button" :disabled="paged.page >= paged.pages" :aria-label="$t('下一页')" @click="page = paged.page + 1"><i class="ri-arrow-right-s-line"></i></button>
      </nav>
    </footer>
  </div>
</template>

<script setup lang="ts">
/** 手机端设置：服务状态（开关和本人二维码在首页 MobileAccessCard）、每人专属链接（mobile.link）与可选二维码、重置 */
import { computed, onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue';
import QRCode from 'qrcode';
import type { MmDept, MmPerson } from '../../../shared/meetingMgmt/types';
import { t as i18nT } from '../../i18n';
import { useDialog } from '../../composables/useDialog';
import { useNotificationStore } from '../../stores/notification';
import PersonChip from './PersonChip.vue';
import { errorMessage, goTab, mm, mmBoot, onMmEvent } from './shared';
import { copyText, matchPerson, paginate, pickUrl } from './pagesLogic';

const props = defineProps<{ people: MmPerson[]; depts: MmDept[] }>();

const dialog = useDialog();
const notif = useNotificationStore();
const status = ref<{ running: boolean; url?: string }>({ running: !!mmBoot.value?.mobile.running, url: mmBoot.value?.mobile.url });
const rowBusy = ref('');
const error = ref('');
const q = ref('');
const page = ref(1);
const showQr = ref(false);
const links = reactive<Record<string, string>>({});
const qrs = reactive<Record<string, string>>({});

const deptName = (id: string) => props.depts.find((d) => d.id === id)?.name || '';
const filtered = computed(() => props.people.filter((p) => !p.left && matchPerson(p, deptName(p.deptId), q.value)));
const paged = computed(() => paginate(filtered.value, page.value, 10));
watch(q, () => { page.value = 1; });

async function refreshStatus(): Promise<void> {
  try {
    const r = await mm<{ running: boolean; url?: string }>('mobile.status');
    if (r) status.value = { running: !!r.running, url: r.url };
  } catch (e) {
    error.value = errorMessage(e);
  }
}

async function makeQr(id: string): Promise<void> {
  if (!links[id] || qrs[id]) return;
  qrs[id] = await QRCode.toDataURL(links[id], { margin: 1, width: 240 }).catch(() => '');
}

async function makeLink(p: MmPerson): Promise<void> {
  rowBusy.value = p.id;
  error.value = '';
  try {
    if (!links[p.id]) {
      const url = pickUrl(await mm('mobile.link', { personId: p.id }));
      if (!url) throw new Error(i18nT('没拿到专属链接，请确认手机页服务已开启'));
      links[p.id] = url;
    }
    if (showQr.value) await makeQr(p.id);
    if (await copyText(links[p.id])) notif.success(i18nT('已复制 {name} 的专属链接', { name: p.name }));
  } catch (e) {
    error.value = errorMessage(e);
  } finally {
    rowBusy.value = '';
  }
}

/** 链接泄露了：重置令牌，旧链接立即失效 */
async function resetLink(p: MmPerson): Promise<void> {
  const ok = await dialog.confirm({
    title: i18nT('重置专属链接'),
    message: i18nT('重置后 {name} 的旧链接立即失效（包括已发出的企微卡片按钮），需要把新链接重新发给本人。确定吗？', { name: p.name }),
    danger: true,
    confirmLabel: i18nT('重置'),
  });
  if (!ok) return;
  rowBusy.value = p.id;
  error.value = '';
  try {
    const url = pickUrl(await mm('mobile.link', { personId: p.id, reset: true }));
    if (!url) throw new Error(i18nT('没拿到专属链接，请确认手机页服务已开启'));
    links[p.id] = url;
    delete qrs[p.id];
    if (showQr.value) await makeQr(p.id);
    notif.success(i18nT('已重置 {name} 的专属链接', { name: p.name }));
  } catch (e) {
    error.value = errorMessage(e);
  } finally {
    rowBusy.value = '';
  }
}

watch(showQr, (v) => { if (v) Object.keys(links).forEach((id) => { void makeQr(id); }); });

let off: (() => void) | null = null;
onMounted(() => {
  void refreshStatus();
  off = onMmEvent((ev) => {
    if (ev.type === 'mobile') {
      status.value = { running: ev.running, url: ev.url };
      if (!ev.running) { Object.keys(links).forEach((k) => delete links[k]); Object.keys(qrs).forEach((k) => delete qrs[k]); }
    }
  });
});
onBeforeUnmount(() => off?.());
</script>

<style scoped>
.mm-sm { display: grid; gap: 16px; }
.mm-sp__head { display: flex; align-items: flex-start; gap: 16px; flex-wrap: wrap; }
.mm-sp__head > div:first-child { flex: 1; min-width: 260px; display: grid; gap: 6px; }
.mm-sp__head h3 { margin: 0; font-size: 18px; }
.mm-sp__head p { margin: 0; color: var(--color-text-secondary); font-size: 13px; line-height: 1.6; max-width: 80ch; }
.mm-sm__svc { display: flex; align-items: center; gap: 16px; flex-wrap: wrap; padding: 16px 20px; border-radius: var(--radius-5); background: var(--color-bg-hover); }
.mm-sm__addr { flex: 1; min-width: 220px; display: grid; gap: 3px; }
.mm-sm__addr small { font-size: 12px; color: var(--color-text-secondary); }
.mm-sm__addr b { font-size: 15px; word-break: break-all; }
.mm-sm__addr b.muted { color: var(--color-text-muted); font-weight: 400; }
.mono { font-family: var(--font-mono); }
.mm-sm > .ss-muted { margin: 0; }
.mm-sm__tools { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; }
.mm-sm__tools h4 { margin: 0; font-size: 14.5px; }
.mm-sm__tools .grow { flex: 1; }
.mm-sm__qr { display: inline-flex; align-items: center; gap: 6px; font-size: 12.5px; color: var(--color-text-secondary); }
.mm-search { display: flex; align-items: center; gap: 8px; width: min(100%, 220px); height: 34px; padding: 0 12px; border: 1px solid var(--color-border); border-radius: var(--radius-4); background: var(--color-bg-card); color: var(--color-text-muted); }
.mm-search input { flex: 1; min-width: 0; border: none; outline: none; background: transparent; font: inherit; font-size: 13px; color: var(--color-text-primary); }
.mm-sm__link { white-space: normal !important; max-width: 420px; }
.mm-sm__link .mono { display: block; font-size: 12px; word-break: break-all; }
.mm-sm__link img { display: block; margin-top: 6px; border-radius: var(--radius-2); background: #fff; }
.mm-sm__sep { margin: 0 6px; color: var(--color-text-muted); }
.ss-link.danger { color: var(--color-danger); }
.mm-sm__empty { text-align: center !important; color: var(--color-text-secondary); }
.mm-sm__foot { display: flex; align-items: center; gap: 10px; font-size: 12.5px; color: var(--color-text-secondary); }
.mm-sm__foot .grow { flex: 1; }
.mm-pager { display: flex; gap: 2px; }
.mm-pager button { min-width: 26px; height: 26px; border: none; border-radius: var(--radius-2); background: transparent; color: var(--color-text-secondary); font: inherit; font-size: 12.5px; cursor: pointer; }
.mm-pager button.on { background: var(--color-brand-subtle); color: var(--color-brand); font-weight: 700; }
.mm-pager button:disabled { opacity: .4; cursor: default; }
.spin { animation: mm-sm-spin 1s linear infinite; }
@keyframes mm-sm-spin { to { transform: rotate(360deg); } }
</style>
