<template>
  <div class="fs-workbench">
    <header class="workbench-header">
      <div class="heading">
        <PageBackButton />
        <span class="heading-icon"><i class="ri-timer-flash-line"></i></span>
        <div>
          <p class="eyebrow">{{ $t('行业工作台') }}</p>
          <h1>{{ $t('流程时效监控智能体') }}</h1>
          <p class="subtitle">{{ $t('把 OA、费控、CSS 三个系统导出的流程报表放进来，按《时效看板指标》的规则算出每个流程和每位审核人是否超时，出时效看板、周报和月度分析报告，跟进在途流程和改善建议。数字全部由规则计算，邮件由你确认后发出。') }}</p>
        </div>
      </div>
      <div class="header-actions">
        <button class="ss-btn" :disabled="loading" @click="reload"><i :class="loading ? 'ri-loader-4-line spin' : 'ri-refresh-line'"></i>{{ $t('刷新') }}</button>
      </div>
    </header>

    <section v-if="state" class="fs-bar">
      <span><i class="ri-calendar-check-line"></i>{{ state.session.period ? `${kindLabel(state.session.period.kind)} · ${state.session.period.label}` : $t('还没有导入报表') }}</span>
      <span class="ss-muted">{{ $t('周期快照 {a} · 在途跟进 {b} · 改善事项 {c} · 规则 {d}', { a: state.snapshots.length, b: openTrack, c: activeLedger, d: state.rules.custom ? $t('导入版') : $t('内置版') }) }}</span>
      <p class="fs-bar__rule">
        <span class="no"><i class="ri-close-circle-line"></i>{{ $t('模型不算数、不自己发邮件') }}</span>
        <span class="yes"><i class="ri-checkbox-circle-line"></i>{{ $t('每个数字都能追到流程和节点，发送由你点') }}</span>
      </p>
    </section>

    <nav class="fs-tabs" role="tablist">
      <button v-for="t in TABS" :key="t.key" type="button" role="tab" class="fs-tab" :class="{ active: active === t.key }" :aria-selected="active === t.key" :data-test="`fs-tab-${t.key}`" @click="select(t.key)">
        <i :class="t.icon"></i><span>{{ t.title }}</span>
        <em v-if="t.key === 'track' && dueTrack" class="fs-badge">{{ dueTrack }}</em>
        <em v-if="t.key === 'ledger' && overdueLedger" class="fs-badge">{{ overdueLedger }}</em>
      </button>
    </nav>

    <div v-if="ready" class="fs-body">
      <BulletinTab v-show="active === 'bulletin'" />
      <BoardTab v-if="active === 'board'" />
      <TrackTab v-else-if="active === 'track'" />
      <LedgerTab v-else-if="active === 'ledger'" />
      <RulesTab v-else-if="active === 'rules'" />
      <div v-else-if="active === 'overview'" class="fs-ov">
        <section class="ss-panel">
          <h3>{{ $t('它替流程管理员做什么') }}</h3>
          <ul class="fs-list">
            <li>{{ $t('读报表：OA、费控、CSS 导出的时效报表列名各不相同，自动认出单号、流程名、发起人、状态、时间、节点、处理人等列，认不准的让你点选；读不了的行会告诉你是哪一行、为什么') }}</li>
            <li>{{ $t('对规则：把报表里的流程名对到规则表的流程细类，对不上的列出来由你指定；没登记内外部属性的节点由你定计入还是不计入，定过一次以后都记得') }}</li>
            <li>{{ $t('算时效：每个流程的端到端用时、每次审核的个人用时，是否超时；在途流程是否已逾期、是否临期；各大类 / 细类的平均用时和合规率；审核人和发起人的合规率排名') }}</li>
            <li>{{ $t('找异常：和上一周期比，平均用时增加超过 3 天或合规率低于 95% 的流程类型标为异常，展开每个节点的耗时、等待和在途停留，指出耗时最长的节点') }}</li>
            <li>{{ $t('收原因：按责任人各出一封邮件列明名下的超时流程，你看过后点发送；原因回填后归到固定的七类并写根因') }}</li>
            <li>{{ $t('出通报：周报是邮件正文加明细表，月报是带图表的分析报告 PDF 加明细表；预览、改字、填收件人之后由你点发送') }}</li>
            <li>{{ $t('盯闭环：在途逾期的流程进跟进名单，内部流程每 3 天、外部流程每 7 天提醒一次，直到报表显示它办结；月报的改善建议记入改善台账，到期前 7 天提醒确认，逾期升级督办') }}</li>
          </ul>
        </section>
        <section class="ss-panel">
          <h3>{{ $t('指标是怎么算的') }}</h3>
          <ul class="fs-list">
            <li>{{ $t('已办结：OA 审批状态为「结束」，CSS 状态为「已审核」，费控当前处理人为「结束」；按单号去重。终止的流程不统计') }}</li>
            <li>{{ $t('在途：OA 审批状态为「待审」，CSS 状态为「审核中」，费控当前处理人既不是「结束」也不是「终止」') }}</li>
            <li>{{ $t('OA / 费控单个流程用时 = 流程结束时间 − 起草（创建）时间，按自然日') }}</li>
            <li>{{ $t('CSS 单个流程用时 = 各内部审核节点用时之和（外部节点不算）；退换货申请只算最后一次审核的用时') }}</li>
            <li>{{ $t('流程时效合规率 = 不超时的办结流程数 ÷ 有时效要求的办结流程数；各大类平均用时 = 这一大类下各细类平均用时的平均值') }}</li>
            <li>{{ $t('个人审核用时：OA / 费控只算内部节点，按自然日，管理干部按流程细类（费控还看金额是否超过 10 万）、非管理干部统一 3 天；CSS 按节点各自的要求，只算工作日') }}</li>
            <li>{{ $t('个人审核合规率 = 这个人不超时的审核次数 ÷ 被统计的审核次数；花名册以外的人不参与排名') }}</li>
            <li>{{ $t('在途标签：在途时长超过时效要求 = 已逾期；超过时效要求的 80% = 较大逾期风险。在途时长算到报表导出那一天') }}</li>
            <li>{{ $t('统计周期：办结流程按结束时间落在周期内的算本期；个人审核按审核完成时间落在周期内的算本期；在途流程不分周期，全部统计') }}</li>
          </ul>
        </section>
        <section class="ss-panel">
          <h3>{{ $t('三条红线') }}</h3>
          <ul class="fs-list">
            <li>{{ $t('数字不交给模型：用时、合规率、排名、环比全部由规则计算。模型只做两件事——把原因归到固定的七类并写根因、根据已算出的数字写总结和建议；它写的话里出现材料里没有的数字，那句话会被去掉，去掉太多就改用规则写的版本。不用模型一样能走完全程') }}</li>
            <li>{{ $t('邮件由人发：原因收集邮件、进度提醒、周报月报，都是先预览、你点了才发；没有邮箱的责任人会列出来，不会悄悄跳过') }}</li>
            <li>{{ $t('每个数字可回溯：看板和通报里的数都能在明细表里找到对应的流程和节点；对不上规则的流程名、没登记的节点、没收的行都列出来，不悄悄丢') }}</li>
          </ul>
        </section>
        <section class="ss-panel">
          <h3>{{ $t('先知道这几件事') }}</h3>
          <ul class="fs-list">
            <li>{{ $t('数据来自你导出的报表文件：应用不登录 OA、费控、CSS，也不改里面的任何东西。报表导出得越全（尤其是处理人维度的节点表），个人审核和节点分析越准') }}</li>
            <li>{{ $t('CSS 的报表如果没有节点明细，流程用时只能按「结束 − 开始」估算，会在结果里标出来') }}</li>
            <li>{{ $t('环比要有上一周期的快照：第一次用没有环比，从第二个周期开始才有') }}</li>
            <li>{{ $t('改善建议记在本机的改善台账里，可以导出 Excel 发给相关人；它目前代替企业微信的共享台账，不会自动写到企业微信里') }}</li>
            <li>{{ $t('在途跟进和台账提醒由应用在后台检查，应用开着才会提醒；提醒出现在本页和系统通知里') }}</li>
            <li>{{ $t('规则表更新后，在「规则」页导入新的《时效看板指标》工作簿即可；节假日要在「规则」页自己维护') }}</li>
          </ul>
        </section>
      </div>
    </div>
    <p v-else-if="loadError" class="ss-note danger"><i class="ri-error-warning-line"></i>{{ loadError }}</p>
    <p v-else class="ss-note"><i class="ri-loader-4-line spin"></i>{{ $t('正在加载工作台…') }}</p>
  </div>
</template>

<script setup lang="ts">
/**
 * 解决方案 · 流程时效监控智能体。docs/flow-sla-workbench.md
 * 页签：通报（分步向导）/ 时效看板 / 在途跟进 / 改善台账 / 规则 / 方案说明。
 */
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';
import { t as i18nT } from '../i18n';
import { useNotificationStore } from '../stores/notification';
import PageBackButton from '../components/PageBackButton.vue';
import BulletinTab from '../workbenches/flow-sla/BulletinTab.vue';
import BoardTab from '../workbenches/flow-sla/BoardTab.vue';
import TrackTab from '../workbenches/flow-sla/TrackTab.vue';
import LedgerTab from '../workbenches/flow-sla/LedgerTab.vue';
import RulesTab from '../workbenches/flow-sla/RulesTab.vue';
import { errorMessage, fsState, kindLabel, onFsEvent, refreshState } from '../workbenches/flow-sla/shared';
import '../workbenches/service-settlement/styles.css';

type TabKey = 'bulletin' | 'board' | 'track' | 'ledger' | 'rules' | 'overview';
const TABS: Array<{ key: TabKey; icon: string; title: string }> = [
  { key: 'bulletin', icon: 'ri-mail-send-line', title: i18nT('通报') },
  { key: 'board', icon: 'ri-dashboard-3-line', title: i18nT('时效看板') },
  { key: 'track', icon: 'ri-route-line', title: i18nT('在途跟进') },
  { key: 'ledger', icon: 'ri-book-2-line', title: i18nT('改善台账') },
  { key: 'rules', icon: 'ri-ruler-2-line', title: i18nT('规则') },
  { key: 'overview', icon: 'ri-book-open-line', title: i18nT('方案说明') },
];
const TAB_KEY = 'totalclaw:flow-sla-tab:v1';
function savedTab(): TabKey {
  try { const v = localStorage.getItem(TAB_KEY); return TABS.some((t) => t.key === v) ? (v as TabKey) : 'bulletin'; } catch { return 'bulletin'; }
}

const notif = useNotificationStore();
const state = fsState;
const active = ref<TabKey>(savedTab());
const ready = ref(false);
const loading = ref(false);
const loadError = ref('');
const openTrack = computed(() => (state.value?.tracking || []).filter((t) => !t.closedAt).length);
const dueTrack = computed(() => (state.value?.tracking || []).filter((t) => !t.closedAt && t.nextFollowAt && Date.parse(t.nextFollowAt) <= Date.now()).length);
const activeLedger = computed(() => (state.value?.ledger || []).filter((l) => l.status === 'doing' || l.status === 'overdue').length);
const overdueLedger = computed(() => (state.value?.ledger || []).filter((l) => l.status === 'overdue').length);

function select(k: TabKey): void {
  active.value = k;
  try { localStorage.setItem(TAB_KEY, k); } catch { /* 忽略 */ }
}
async function reload(): Promise<void> {
  loading.value = true;
  try { await refreshState(); ready.value = true; loadError.value = ''; } catch (e) { loadError.value = errorMessage(e); } finally { loading.value = false; }
}

let timer: ReturnType<typeof setTimeout> | null = null;
let off: (() => void) | null = null;
onMounted(() => {
  void reload();
  off = onFsEvent((ev) => {
    if (ev?.type === 'reminder' && ev.payload?.title) notif.warn(String(ev.payload.title), 8000);
    if (timer) return;
    timer = setTimeout(() => { timer = null; void refreshState().catch(() => {}); }, 250);
  });
});
onBeforeUnmount(() => { off?.(); if (timer) clearTimeout(timer); });
</script>

<style scoped>
.fs-workbench { display: grid; gap: 12px; padding: 18px 22px 40px; max-width: 1440px; margin: 0 auto; width: 100%; box-sizing: border-box; flex: 1; min-height: 0; overflow-y: auto; align-content: start; }
.workbench-header { display: flex; align-items: flex-start; justify-content: space-between; gap: 16px; flex-wrap: wrap; }
.heading { display: flex; gap: 14px; align-items: flex-start; }
.heading-icon { width: 48px; height: 48px; border-radius: var(--radius-6); display: inline-flex; align-items: center; justify-content: center; background: color-mix(in srgb, var(--color-brand) 14%, transparent); color: var(--color-brand); font-size: var(--font-size-2xl); flex: 0 0 auto; }
.eyebrow { margin: 0; font-size: var(--font-size-xs); font-weight: 800; letter-spacing: .08em; text-transform: uppercase; color: var(--color-text-secondary); }
h1 { margin: 2px 0 4px; font-size: 22px; }
.subtitle { margin: 0; color: var(--color-text-secondary); font-size: var(--font-size-md); line-height: 1.6; max-width: 900px; }
.header-actions { display: flex; gap: 8px; align-items: center; }
.fs-bar { display: flex; gap: 10px 16px; align-items: center; flex-wrap: wrap; padding: 8px 12px; border: 1px solid var(--color-border); border-radius: var(--radius-5); background: var(--color-bg-card); font-size: 12.5px; }
.fs-bar > span:first-child { display: inline-flex; gap: 6px; align-items: center; font-weight: 700; }
.fs-bar__rule { margin: 0 0 0 auto; display: flex; gap: 12px; flex-wrap: wrap; color: var(--color-text-secondary); }
.fs-bar__rule span { display: inline-flex; gap: 4px; align-items: center; }
.fs-bar__rule .no i { color: var(--color-danger); }
.fs-bar__rule .yes i { color: var(--color-success); }
.fs-tabs { display: flex; gap: 2px; overflow-x: auto; overflow-y: hidden; min-height: 44px; align-items: stretch; border-bottom: 1px solid var(--color-border); scrollbar-width: thin; }
.fs-tab { display: inline-flex; align-items: center; gap: 6px; padding: 8px 12px; border: none; border-bottom: 2px solid transparent; margin-bottom: -1px; background: transparent; cursor: pointer; font: inherit; font-size: var(--font-size-md); font-weight: 600; color: var(--color-text-secondary); white-space: nowrap; flex: 0 0 auto; border-radius: var(--radius-3) var(--radius-3) 0 0; }
.fs-tab i { font-size: 16px; }
.fs-tab:hover { color: var(--color-brand); background: var(--color-bg-hover); }
.fs-tab.active { color: var(--color-brand); border-bottom-color: var(--color-brand); }
.fs-badge { font-style: normal; font-size: 10.5px; font-weight: 800; min-width: 18px; height: 18px; padding: 0 5px; border-radius: var(--radius-3); background: var(--color-danger); color: var(--color-on-accent); display: inline-flex; align-items: center; justify-content: center; }
.fs-body { display: grid; gap: 14px; }
.fs-ov { display: grid; gap: 14px; max-width: 1100px; }
.ss-panel { border: 1px solid var(--color-border); border-radius: var(--radius-6); background: var(--color-bg-card); padding: 16px; display: grid; gap: 10px; }
h3 { margin: 0; font-size: var(--font-size-lg); }
.fs-list { margin: 0; padding-inline-start: 18px; font-size: 12.5px; color: var(--color-text-secondary); display: grid; gap: 4px; line-height: 1.6; }
.spin { animation: fs-spin 1s linear infinite; }
@keyframes fs-spin { to { transform: rotate(360deg); } }
</style>
