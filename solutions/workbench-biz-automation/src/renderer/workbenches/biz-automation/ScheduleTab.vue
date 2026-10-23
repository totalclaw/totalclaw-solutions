<template>
  <div class="ba-sched">
    <section class="ss-panel">
      <header class="ba-head"><strong><i class="ri-timer-line"></i>{{ $t('定时任务与模块联动') }}</strong><span class="ss-muted">{{ $t('应用开着时每分钟检查一次，到点执行；错过的当天补跑一次') }}</span></header>
      <div class="ba-jobs">
        <div class="ba-job">
          <label class="ba-check"><input v-model="draft.dailyReport.enabled" type="checkbox" /><b>{{ $t('经营日报') }}</b></label>
          <span>{{ $t('每天') }} <input v-model="draft.dailyReport.time" type="time" /></span>
          <label class="ba-check"><input v-model="draft.dailyReport.push" type="checkbox" />{{ $t('生成后推送') }}</label>
          <small class="ss-muted">{{ $t('模块 D：取昨天数据 → 指标 → 解读 → 推送店长') }}</small>
        </div>
        <div class="ba-job">
          <label class="ba-check"><input v-model="draft.inventoryPatrol.enabled" type="checkbox" /><b>{{ $t('库存巡检') }}</b></label>
          <span>{{ $t('每天') }} <input v-model="draft.inventoryPatrol.time" type="time" /></span>
          <small class="ss-muted">{{ $t('模块 C：售罄下架（门店手机端）、断码 / 过季提醒') }}</small>
        </div>
        <div class="ba-job">
          <label class="ba-check"><input v-model="draft.weeklyVideo.enabled" type="checkbox" /><b>{{ $t('本周主推视频') }}</b></label>
          <span>
            <select v-model.number="draft.weeklyVideo.weekday"><option v-for="(d, i) in WEEKDAYS" :key="i" :value="i">{{ d }}</option></select>
            <input v-model="draft.weeklyVideo.time" type="time" />
          </span>
          <small class="ss-muted">{{ $t('模块 A：按上周销量前 3 款写好脚本，等你审核后成片发布（不会自动发出去）') }}</small>
        </div>
        <div class="ba-job">
          <label class="ba-check"><input v-model="draft.folderImport.enabled" type="checkbox" /><b>{{ $t('共享文件夹取数') }}</b></label>
          <span>{{ $t('每天') }} <input v-model="draft.folderImport.time" type="time" /></span>
          <span></span>
          <small class="ss-muted">{{ $t('模块 D：从「设置」里配置的文件夹取最新的销售 / 费用 / 库存表，排在日报之前；失败会提醒') }}</small>
        </div>
        <div class="ba-job">
          <label class="ba-check"><input v-model="draft.monthlyReport.enabled" type="checkbox" /><b>{{ $t('经营月报') }}</b></label>
          <span>{{ $t('每月 {n} 日', { n: draft.monthlyReport.day }) }} <input v-model="draft.monthlyReport.time" type="time" /></span>
          <label class="ba-check"><input v-model="draft.monthlyReport.push" type="checkbox" />{{ $t('生成后推送') }}</label>
          <small class="ss-muted">{{ $t('模块 D：上月月报推送老板') }}</small>
        </div>
        <div class="ba-job">
          <label class="ba-check"><input v-model="draft.newArrival.enabled" type="checkbox" /><b>{{ $t('新品入库联动') }}</b></label>
          <span class="ss-muted">{{ $t('随时') }}</span>
          <span></span>
          <small class="ss-muted">{{ $t('新款导入商品库后：模块 C 生成上架草稿、模块 A 写新品上新视频脚本，都等你审核') }}</small>
        </div>
        <div class="ba-job ba-job--cal">
          <label class="ba-check"><input v-model="draft.calendar.enabled" type="checkbox" /><b>{{ $t('节日 / 周年数字人') }}</b></label>
          <span>{{ $t('提前') }} <input v-model.number="draft.calendar.leadDays" type="number" min="0" max="30" class="ba-num" /> {{ $t('天') }}</span>
          <span></span>
          <small class="ss-muted">{{ $t('模块 B：到日子前生成数字人祝福讲稿草稿，等你审核后成片发布') }}</small>
          <div class="ba-cal">
            <span v-for="(d, i) in draft.calendar.days" :key="i" class="ba-cal__day">
              <input v-model="d.date" type="text" placeholder="MM-DD" class="ba-num" />
              <input v-model="d.name" type="text" />
              <select v-model="d.topic"><option value="holiday">{{ $t('节日') }}</option><option value="store_opening">{{ $t('开业周年') }}</option></select>
              <button type="button" class="ss-link" @click="draft.calendar.days.splice(i, 1)"><i class="ri-close-line"></i></button>
            </span>
            <button type="button" class="ss-btn sm ghost" @click="draft.calendar.days.push({ date: '', name: '', topic: 'holiday' })"><i class="ri-add-line"></i>{{ $t('加一天（农历节日每年日期不同，请按当年日期填）') }}</button>
          </div>
        </div>
      </div>
      <div class="ss-actions">
        <button type="button" class="ss-btn primary" :disabled="!dirty" @click="save"><i class="ri-save-line"></i>{{ $t('保存') }}</button>
        <button type="button" class="ss-btn" :disabled="running" @click="runNow"><i :class="running ? 'ri-loader-4-line spin' : 'ri-play-line'"></i>{{ $t('立即执行一次已开启的任务') }}</button>
      </div>

    </section>

    <section class="ss-panel">
      <header class="ba-head"><strong>{{ $t('执行记录') }}</strong><span class="grow"></span><button type="button" class="ss-link" @click="clearLog">{{ $t('清空') }}</button></header>
      <p v-if="!log.length" class="ss-empty">{{ $t('暂无') }}</p>
      <ul class="ba-log">
        <li v-for="(l, i) in log" :key="i" :class="{ bad: !l.ok }"><small>{{ fmtDateTime(l.at) }}</small><span class="ss-chip">{{ l.module === 'schedule' ? $t('定时') : moduleTitle(l.module) }}</span>{{ l.text }}</li>
      </ul>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue';
import type { BaSchedule } from '@totalclaw/ipc-contracts';
import { useNotificationStore } from '../../stores/notification';
import { t as i18nT } from '../../i18n';
import { ba, baState, errorMessage, fmtDateTime, moduleTitle, refreshState } from './shared';

const notif = useNotificationStore();
const WEEKDAYS = [i18nT('周日'), i18nT('周一'), i18nT('周二'), i18nT('周三'), i18nT('周四'), i18nT('周五'), i18nT('周六')];
const draft = reactive<BaSchedule>({
  dailyReport: { enabled: false, time: '08:30', push: true }, inventoryPatrol: { enabled: false, time: '09:00' }, weeklyVideo: { enabled: false, weekday: 1, time: '10:00' },
  monthlyReport: { enabled: false, day: 1, time: '09:30', push: true }, newArrival: { enabled: false }, calendar: { enabled: false, leadDays: 3, days: [] }, folderImport: { enabled: false, time: '08:00' },
});
watch(() => baState.value?.settings.schedule, (s) => { if (s) Object.assign(draft, JSON.parse(JSON.stringify(s))); }, { immediate: true });
const dirty = computed(() => JSON.stringify(draft) !== JSON.stringify(baState.value?.settings.schedule));
const log = computed(() => baState.value?.log || []);
const running = ref(false);

async function save(): Promise<void> {
  try { await ba('settings.patch', { patch: { schedule: draft } }); await refreshState(); notif.success(i18nT('已保存')); } catch (e) { notif.error(errorMessage(e)); }
}
async function runNow(): Promise<void> {
  running.value = true;
  try { if (dirty.value) await save(); await ba('schedule.runNow'); await refreshState(); } catch (e) { notif.error(errorMessage(e)); } finally { running.value = false; }
}
async function clearLog(): Promise<void> { await ba('log.clear').catch(() => {}); await refreshState(); }
</script>

<style scoped>
.ba-sched { display: grid; gap: 14px; }
.ss-panel { border: 1px solid var(--color-border); border-radius: var(--radius-6); background: var(--color-bg-card); padding: 14px; display: grid; gap: 10px; }
.ba-head { display: flex; gap: 10px; align-items: center; flex-wrap: wrap; }
.ba-head strong { display: flex; gap: 6px; align-items: center; font-size: var(--font-size-base); }
.ba-jobs { display: grid; gap: 8px; }
.ba-job { display: grid; grid-template-columns: 160px 220px 140px 1fr; gap: 10px; align-items: center; padding: 10px 12px; border: 1px solid var(--color-border); border-radius: var(--radius-4); font-size: 12.5px; }
.ba-job input[type="time"], .ba-job select { height: 30px; border-radius: var(--radius-3); border: 1px solid var(--color-border); background: var(--color-bg-input); color: var(--color-text-primary); font: inherit; padding: 0 6px; }
.ba-num { width: 64px; }
.ba-job--cal { grid-template-columns: 160px 220px 140px 1fr; }
.ba-cal { grid-column: 1 / -1; display: flex; flex-wrap: wrap; gap: 6px; align-items: center; }
.ba-cal__day { display: inline-flex; gap: 4px; align-items: center; padding: 4px 6px; border: 1px solid var(--color-border); border-radius: var(--radius-3); }
.ba-cal__day input, .ba-cal__day select { height: 26px; border-radius: var(--radius-2); border: 1px solid var(--color-border); background: var(--color-bg-input); color: var(--color-text-primary); font: inherit; font-size: var(--font-size-sm); padding: 0 6px; }
.ba-check { display: inline-flex; gap: 6px; align-items: center; }
.ba-log { list-style: none; margin: 0; padding: 0; display: grid; gap: 4px; font-size: 12.5px; max-height: 360px; overflow: auto; }
.ba-log li { display: flex; gap: 8px; align-items: center; }
.ba-log li.bad { color: var(--color-danger); }
.ba-log small { color: var(--color-text-secondary); flex: 0 0 auto; }
.grow { flex: 1; }
.spin { animation: ba-spin 1s linear infinite; }
@keyframes ba-spin { to { transform: rotate(360deg); } }
@media (max-width: 1000px) { .ba-job { grid-template-columns: 1fr 1fr; } }
</style>
