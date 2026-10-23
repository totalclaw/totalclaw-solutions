<template>
  <div v-if="st && s" class="ca-hud" data-test="ca-hud">
    <!-- 顶栏：标题、时钟、服务灯 -->
    <header class="hud-top">
      <div class="hud-title">
        <span class="hud-title__mark"></span>
        <div>
          <h2>{{ $t('校级 AI 中枢') }}</h2>
          <p>{{ s.settings.schoolName || $t('高校一体化AI智能体') }}</p>
        </div>
      </div>
      <div class="hud-clock" aria-live="off"><b>{{ clock.time }}</b><small>{{ clock.date }}</small></div>
      <ul class="hud-lights">
        <li :class="s.model ? 'on' : 'off'"><i></i>{{ $t('大模型') }}</li>
        <li :class="st.docsBuilt ? 'on' : 'off'"><i></i>{{ $t('知识库') }}</li>
        <li :class="s.mobile.running ? 'on' : 'off'"><i></i>{{ $t('手机端') }}</li>
        <li :class="st.sensitiveOpen ? 'alert' : 'on'"><i></i>{{ $t('心理关怀') }}</li>
      </ul>
    </header>

    <div class="hud-main">
      <!-- 左：仪表 -->
      <section class="hud-col">
        <div class="hud-gauge" v-for="g in gauges" :key="g.key">
          <svg viewBox="0 0 120 120" role="img" :aria-label="`${g.label} ${g.text}`">
            <circle class="track" cx="60" cy="60" r="50" />
            <circle class="value" :class="g.tone" cx="60" cy="60" r="50" :stroke-dasharray="`${g.ratio * 314.16} 314.16`" />
          </svg>
          <div class="hud-gauge__label"><b>{{ g.text }}</b><small>{{ g.label }}</small></div>
        </div>
      </section>

      <!-- 中：五大方向轨道 -->
      <section class="hud-core" :aria-label="$t('五大方向')">
        <svg class="hud-orbit" viewBox="0 0 400 400" aria-hidden="true">
          <circle class="ring r1" cx="200" cy="200" r="182" />
          <circle class="ring r2" cx="200" cy="200" r="150" />
          <circle class="arc a1" cx="200" cy="200" r="166" />
          <circle class="arc a2" cx="200" cy="200" r="118" />
          <line v-for="n in nodes" :key="`l-${n.key}`" class="spoke" x1="200" y1="200" :x2="n.x" :y2="n.y" />
        </svg>
        <div class="hud-crest">
          <img v-if="s.logo" :src="s.logo" alt="" />
          <i v-else class="ri-government-line"></i>
        </div>
        <button v-for="n in nodes" :key="n.key" type="button" class="hud-node" :style="{ left: `${(n.x / 400) * 100}%`, top: `${(n.y / 400) * 100}%` }" @click="$emit('go', 'apps')">
          <b>{{ n.label }}</b>
          <span>{{ $t('{a}/{b} 上线', { a: n.live, b: n.total }) }}</span>
          <em>{{ $t('30 天 {n} 次', { n: n.usage }) }}</em>
        </button>
      </section>

      <!-- 右：读数 -->
      <section class="hud-col hud-readouts">
        <div v-for="r in readouts" :key="r.label" class="hud-readout" :class="r.tone">
          <small>{{ r.label }}</small><b>{{ r.value }}</b>
        </div>
      </section>
    </div>

    <div class="hud-bottom">
      <section class="hud-panel">
        <h3>{{ $t('近 14 天问答') }}</h3>
        <div class="hud-bars" role="img" :aria-label="$t('近 14 天问答')">
          <div v-for="d in st.byDay" :key="d.day" class="hud-bar" :title="$t('{day}：{a} 次，自动答复 {b}', { day: d.day, a: d.qa, b: d.auto })">
            <span class="hud-bar__all" :style="{ height: `${barH(d.qa)}%` }"><span class="hud-bar__auto" :style="{ height: d.qa ? `${(d.auto / d.qa) * 100}%` : '0' }"></span></span>
            <small>{{ d.day.slice(8) }}</small>
          </div>
        </div>
      </section>
      <section class="hud-panel">
        <h3>{{ $t('诉求领域') }}</h3>
        <ul class="hud-domains">
          <li v-for="d in st.byDomain.slice(0, 6)" :key="d.id"><span>{{ d.name }}</span><i :style="{ width: `${(d.count / maxDomain) * 100}%` }"></i><b>{{ d.count }}</b></li>
          <li v-if="!st.byDomain.length" class="empty">{{ $t('还没有问答') }}</li>
        </ul>
      </section>
      <section class="hud-panel">
        <h3>{{ $t('实时问答') }}</h3>
        <ul class="hud-feed">
          <li v-for="(r, i) in st.recent.slice(0, 7)" :key="i" :class="r.kind">
            <time>{{ hhmm(r.at) }}</time><span>{{ r.question }}</span><em>{{ kindShort(r.kind) }}</em>
          </li>
          <li v-if="!st.recent.length" class="empty">{{ $t('还没有问答') }}</li>
        </ul>
      </section>
      <section class="hud-panel hud-alerts">
        <h3>{{ $t('待办') }}</h3>
        <button v-if="st.sensitiveOpen" type="button" class="hud-alert bad" @click="$emit('go', 'tickets')"><i class="ri-alarm-warning-line"></i>{{ $t('{n} 条敏感问题待处理', { n: st.sensitiveOpen }) }}</button>
        <button v-if="st.openTickets" type="button" class="hud-alert" @click="$emit('go', 'tickets')"><i class="ri-git-pull-request-line"></i>{{ $t('{n} 个转办待答复', { n: st.openTickets }) }}</button>
        <button v-if="st.warnPending" type="button" class="hud-alert" @click="$emit('go', 'warning')"><i class="ri-user-search-line"></i>{{ $t('{n} 名预警学生待复核', { n: st.warnPending }) }}</button>
        <button v-if="!st.docs" type="button" class="hud-alert" @click="$emit('go', 'kb')"><i class="ri-book-2-line"></i>{{ $t('知识库还是空的') }}</button>
        <p v-if="!st.sensitiveOpen && !st.openTickets && !st.warnPending && st.docs" class="hud-clear"><i class="ri-shield-check-line"></i>{{ $t('当前没有待办') }}</p>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
/** 总览：科幻风格的校级 AI 中枢（全部读数来自真实统计） */
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';
import { CA_DIRECTIONS, type CaAnswerKind, type CaDirection } from '@totalclaw/ipc-contracts';
import { t as i18nT } from '../../i18n';
import { caState, pct } from './shared';

defineEmits<{ (e: 'go', tab: string): void }>();
const s = computed(() => caState.value);
const st = computed(() => caState.value?.stats || null);

const DIR_LABEL = (d: CaDirection): string => ({ plan: i18nT('规划建设运维'), teach: i18nT('教学'), research: i18nT('科研'), gov: i18nT('校务治理'), service: i18nT('师生服务') }[d]);
const nodes = computed(() => CA_DIRECTIONS.map((d, i) => {
  const a = (-90 + i * 72) * (Math.PI / 180);
  const v = st.value!.directions[d];
  return { key: d, label: DIR_LABEL(d), x: 200 + Math.cos(a) * 166, y: 200 + Math.sin(a) * 166, live: v.live, total: v.scenarios, usage: v.usage30d };
}));

const gauges = computed(() => {
  const x = st.value!;
  const scen = Object.values(x.directions).reduce((a, d) => ({ live: a.live + d.live, all: a.all + d.scenarios }), { live: 0, all: 0 });
  return [
    { key: 'auto', label: i18nT('自动答复率'), ratio: x.autoRate ?? 0, text: pct(x.autoRate, 0), tone: 'cyan' },
    { key: 'kb', label: i18nT('知识库就绪'), ratio: x.docs ? x.docsBuilt / x.docs : 0, text: x.docs ? pct(x.docsBuilt / x.docs, 0) : '—', tone: 'teal' },
    { key: 'apps', label: i18nT('场景上线'), ratio: scen.all ? scen.live / scen.all : 0, text: scen.all ? `${scen.live}/${scen.all}` : '—', tone: 'amber' },
  ];
});

const readouts = computed(() => {
  const x = st.value!;
  return [
    { label: i18nT('近 7 天问答'), value: String(x.qa7d), tone: '' },
    { label: i18nT('知识分段'), value: String(x.chunks), tone: '' },
    { label: i18nT('FAQ'), value: String(x.faqs), tone: '' },
    { label: i18nT('课程 / 题库'), value: `${x.courses} / ${x.questions}`, tone: '' },
    { label: i18nT('科研成果'), value: String(x.outputs), tone: '' },
    { label: i18nT('待答复转办'), value: String(x.openTickets), tone: x.openTickets ? 'warn' : '' },
  ];
});

const maxQa = computed(() => Math.max(1, ...(st.value?.byDay || []).map((d) => d.qa)));
const barH = (n: number): number => (n ? Math.max(5, (n / maxQa.value) * 100) : 0);
const maxDomain = computed(() => Math.max(1, ...(st.value?.byDomain || []).map((d) => d.count)));
const hhmm = (iso: string): string => { const d = new Date(iso); return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`; };
const kindShort = (k: CaAnswerKind): string => ({ faq: 'FAQ', answer: i18nT('原文作答'), quote: i18nT('原文摘录'), no_evidence: i18nT('转办'), sensitive: i18nT('敏感') }[k]);

const clock = ref({ time: '', date: '' });
const tick = (): void => {
  const d = new Date();
  const p2 = (n: number) => String(n).padStart(2, '0');
  clock.value = { time: `${p2(d.getHours())}:${p2(d.getMinutes())}:${p2(d.getSeconds())}`, date: `${d.getFullYear()}-${p2(d.getMonth() + 1)}-${p2(d.getDate())}` };
};
let timer: ReturnType<typeof setInterval> | null = null;
onMounted(() => { tick(); timer = setInterval(tick, 1000); });
onBeforeUnmount(() => { if (timer) clearInterval(timer); });
</script>

<style scoped>
.ca-hud {
  --hud-bg: oklch(0.17 0.035 250);
  --hud-panel: oklch(0.21 0.04 250 / 0.85);
  --hud-line: oklch(0.80 0.12 210 / 0.22);
  --hud-cyan: oklch(0.84 0.13 205);
  --hud-teal: oklch(0.82 0.13 175);
  --hud-amber: oklch(0.84 0.14 80);
  --hud-red: oklch(0.70 0.19 25);
  --hud-ink: oklch(0.95 0.02 220);
  --hud-dim: oklch(0.75 0.03 230);
  position: relative;
  display: grid;
  gap: 14px;
  padding: 18px;
  border-radius: var(--radius-6);
  color: var(--hud-ink);
  background:
    radial-gradient(120% 80% at 50% 35%, oklch(0.26 0.06 235 / 0.9), transparent 70%),
    linear-gradient(var(--hud-line) 1px, transparent 1px) 0 0 / 32px 32px,
    linear-gradient(90deg, var(--hud-line) 1px, transparent 1px) 0 0 / 32px 32px,
    var(--hud-bg);
  border: 1px solid oklch(0.80 0.12 210 / 0.35);
  overflow: hidden;
  font-variant-numeric: tabular-nums;
}
/* 扫描线：一条淡光带缓慢下扫 */
.ca-hud::after { content: ''; position: absolute; left: 0; right: 0; top: -30%; height: 30%; background: linear-gradient(transparent, oklch(0.85 0.12 205 / 0.06), transparent); animation: hud-scan 9s linear infinite; pointer-events: none; }
@keyframes hud-scan { to { transform: translateY(440%); } }

.hud-top { display: flex; align-items: center; gap: 16px; flex-wrap: wrap; }
.hud-title { display: flex; gap: 10px; align-items: center; flex: 1; min-width: 220px; }
.hud-title__mark { width: 10px; height: 34px; border-radius: calc(var(--radius-1) / 2); background: var(--hud-cyan); box-shadow: var(--caot2-shadow); }
.hud-title h2 { margin: 0; font-size: var(--font-size-xl); letter-spacing: .12em; }
.hud-title p { margin: 2px 0 0; font-size: 12.5px; color: var(--hud-dim); }
.hud-clock { display: grid; justify-items: end; font-family: var(--font-mono); }
.hud-clock b { font-size: 22px; color: var(--hud-cyan); text-shadow: 0 0 10px oklch(0.84 0.13 205 / 0.6); }
.hud-clock small { font-size: var(--font-size-xs); color: var(--hud-dim); }
.hud-lights { list-style: none; margin: 0; padding: 0; display: flex; gap: 12px; flex-wrap: wrap; font-size: var(--font-size-sm); color: var(--hud-dim); }
.hud-lights li { display: inline-flex; align-items: center; gap: 6px; }
.hud-lights i { width: 8px; height: 8px; border-radius: 50%; background: oklch(0.5 0.02 240); }
.hud-lights .on i { background: var(--hud-teal); box-shadow: var(--caot2-shadow-2); }
.hud-lights .alert i { background: var(--hud-red); box-shadow: var(--caot2-shadow-3); animation: hud-blink 1.4s ease-in-out infinite; }
@keyframes hud-blink { 50% { opacity: .35; } }

.hud-main { display: grid; grid-template-columns: 200px minmax(0, 1fr) 200px; gap: 14px; align-items: center; }
@media (max-width: 1100px) { .hud-main { grid-template-columns: 1fr; } }
.hud-col { display: grid; gap: 12px; }
.hud-gauge { position: relative; display: grid; place-items: center; }
.hud-gauge svg { width: 132px; height: 132px; transform: rotate(-90deg); }
.hud-gauge .track { fill: none; stroke: oklch(0.4 0.04 240 / 0.6); stroke-width: 8; }
.hud-gauge .value { fill: none; stroke-width: 8; stroke-linecap: round; transition: stroke-dasharray .6s cubic-bezier(.22, 1, .36, 1); }
.hud-gauge .value.cyan { stroke: var(--hud-cyan); filter: drop-shadow(0 0 6px var(--hud-cyan)); }
.hud-gauge .value.teal { stroke: var(--hud-teal); filter: drop-shadow(0 0 6px var(--hud-teal)); }
.hud-gauge .value.amber { stroke: var(--hud-amber); filter: drop-shadow(0 0 6px var(--hud-amber)); }
.hud-gauge__label { position: absolute; display: grid; justify-items: center; }
.hud-gauge__label b { font-size: 20px; font-family: var(--font-mono); }
.hud-gauge__label small { font-size: var(--font-size-xs); color: var(--hud-dim); }

.hud-core { position: relative; aspect-ratio: 1; max-width: 460px; width: 100%; justify-self: center; }
.hud-orbit { position: absolute; inset: 0; width: 100%; height: 100%; }
.hud-orbit .ring { fill: none; stroke: oklch(0.80 0.12 210 / 0.25); stroke-width: 1; }
.hud-orbit .ring.r2 { stroke-dasharray: 2 6; }
.hud-orbit .arc { fill: none; stroke-width: 2; stroke-linecap: round; transform-origin: 200px 200px; }
.hud-orbit .a1 { stroke: var(--hud-cyan); stroke-dasharray: 120 924; animation: hud-rot 28s linear infinite; filter: drop-shadow(0 0 4px var(--hud-cyan)); }
.hud-orbit .a2 { stroke: var(--hud-amber); stroke-dasharray: 60 682; animation: hud-rot 18s linear infinite reverse; }
.hud-orbit .spoke { stroke: oklch(0.80 0.12 210 / 0.18); stroke-width: 1; }
@keyframes hud-rot { to { transform: rotate(360deg); } }
.hud-crest { position: absolute; left: 50%; top: 50%; width: 30%; aspect-ratio: 1; transform: translate(-50%, -50%); border-radius: 50%; display: grid; place-items: center; background: oklch(0.98 0.01 80); border: 2px solid var(--hud-cyan); box-shadow: var(--caot2-shadow-4); overflow: hidden; }
.hud-crest img { width: 100%; height: 100%; object-fit: contain; padding: 10%; }
.hud-crest i { font-size: 42px; color: oklch(0.42 0.13 22); }
.hud-node { position: absolute; transform: translate(-50%, -50%); display: grid; justify-items: center; gap: 1px; padding: 6px 10px; border-radius: var(--radius-4); border: 1px solid oklch(0.80 0.12 210 / 0.45); background: oklch(0.19 0.04 250 / 0.92); color: var(--hud-ink); font: inherit; cursor: pointer; min-width: 92px; transition: border-color .18s, box-shadow .18s; }
.hud-node:hover, .hud-node:focus-visible { border-color: var(--hud-cyan); box-shadow: var(--caot2-shadow-5); outline: none; }
.hud-node b { font-size: var(--font-size-md); letter-spacing: .04em; }
.hud-node span { font-size: 11.5px; color: var(--hud-teal); }
.hud-node em { font-style: normal; font-size: 10.5px; color: var(--hud-dim); }

.hud-readouts { gap: 8px; }
.hud-readout { display: flex; justify-content: space-between; align-items: baseline; padding: 8px 12px; border: 1px solid var(--hud-line); border-radius: var(--radius-3); background: var(--hud-panel); }
.hud-readout small { font-size: var(--font-size-sm); color: var(--hud-dim); }
.hud-readout b { font-family: var(--font-mono); font-size: var(--font-size-xl); color: var(--hud-cyan); }
.hud-readout.warn b { color: var(--hud-amber); }

.hud-bottom { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 240px), 1fr)); gap: 12px; }
.hud-panel { padding: 12px 14px; border: 1px solid var(--hud-line); border-radius: var(--radius-4); background: var(--hud-panel); display: grid; gap: 8px; align-content: start; min-width: 0; }
.hud-panel h3 { margin: 0; font-size: 12.5px; letter-spacing: .1em; color: var(--hud-dim); font-weight: 700; }
.hud-bars { display: flex; align-items: flex-end; gap: 4px; height: 120px; }
.hud-bar { flex: 1; display: flex; flex-direction: column; align-items: center; gap: 3px; height: 100%; justify-content: flex-end; min-width: 0; }
.hud-bar small { font-size: 10px; color: var(--hud-dim); }
.hud-bar__all { width: 100%; max-width: 14px; border-radius: var(--radius-1) var(--radius-1) 0 0; background: oklch(0.84 0.14 80 / 0.55); display: flex; flex-direction: column; justify-content: flex-end; overflow: hidden; }
.hud-bar__auto { width: 100%; background: var(--hud-cyan); box-shadow: var(--caot2-shadow-6); }
.hud-domains, .hud-feed { list-style: none; margin: 0; padding: 0; display: grid; gap: 6px; font-size: 12.5px; }
.hud-domains li { display: grid; grid-template-columns: 96px 1fr 28px; gap: 8px; align-items: center; }
.hud-domains span { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; color: var(--hud-dim); }
.hud-domains i { height: 6px; border-radius: var(--radius-1); background: var(--hud-teal); box-shadow: var(--caot2-shadow-7); }
.hud-domains b { font-family: var(--font-mono); text-align: end; }
.hud-feed li { display: grid; grid-template-columns: 40px minmax(0, 1fr) auto; gap: 8px; align-items: center; }
.hud-feed time { font-family: var(--font-mono); color: var(--hud-dim); font-size: 11.5px; }
.hud-feed span { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.hud-feed em { font-style: normal; font-size: var(--font-size-xs); color: var(--hud-cyan); }
.hud-feed li.no_evidence em { color: var(--hud-amber); }
.hud-feed li.sensitive em { color: var(--hud-red); }
.hud-domains .empty, .hud-feed .empty { color: var(--hud-dim); display: block; }
.hud-alert { display: flex; gap: 8px; align-items: center; padding: 7px 10px; border-radius: var(--radius-3); border: 1px solid oklch(0.84 0.14 80 / 0.5); background: oklch(0.84 0.14 80 / 0.08); color: var(--hud-amber); font: inherit; font-size: 12.5px; cursor: pointer; text-align: start; }
.hud-alert.bad { border-color: oklch(0.70 0.19 25 / 0.6); background: oklch(0.70 0.19 25 / 0.12); color: oklch(0.82 0.12 25); }
.hud-alert:hover { filter: brightness(1.15); }
.hud-clear { margin: 0; display: flex; gap: 6px; align-items: center; color: var(--hud-teal); font-size: 12.5px; }

@media (prefers-reduced-motion: reduce) {
  .ca-hud::after, .hud-orbit .arc, .hud-lights .alert i { animation: none; }
  .hud-gauge .value { transition: none; }
}

/* ─── 调色板（docs/ui-design-system.md）：经典主题保持原值；界面主题（data-ui-theme）下映射全局 token ─── */
.ca-hud { /* ui-theme-exempt: 经典主题原值 */
  --caot2-shadow: 0 0 12px var(--hud-cyan);
  --caot2-shadow-2: 0 0 8px var(--hud-teal);
  --caot2-shadow-3: 0 0 10px var(--hud-red);
  --caot2-shadow-4: 0 0 0 6px oklch(0.84 0.13 205 / 0.12), 0 0 40px oklch(0.84 0.13 205 / 0.45);
  --caot2-shadow-5: 0 0 14px oklch(0.84 0.13 205 / 0.45);
  --caot2-shadow-6: 0 0 8px var(--hud-cyan);
  --caot2-shadow-7: 0 0 6px var(--hud-teal);
}
:root[data-ui-theme] .ca-hud {
  --caot2-shadow: var(--shadow-card);
  --caot2-shadow-2: var(--shadow-card);
  --caot2-shadow-3: var(--shadow-card);
  --caot2-shadow-4: var(--shadow-card);
  --caot2-shadow-5: var(--shadow-card-hover);
  --caot2-shadow-6: var(--shadow-card);
  --caot2-shadow-7: var(--shadow-card);
}
</style>
