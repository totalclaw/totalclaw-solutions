<template>
  <div style="display:grid;gap:14px">
    <!--
      真学生在自己设备上作答：与 AI 学习中心同一套校内服务（端口错开，两条线可同时演示）。
      下面那套「在这台机器上模拟某位学生」保留不动 —— 没有学生设备时照样能演示完整闭环。
    -->
    <section class="qt-panel">
      <header class="qt-panel__head">
        <strong><i class="ri-wifi-line"></i>{{ $t('校内服务 · 学生用自己的设备作答') }}</strong>
        <span class="qt-chip" :class="lan.running ? 'ok' : ''"><i :class="lan.running ? 'ri-check-line' : 'ri-pause-line'"></i>{{ lan.running ? $t('运行中') : $t('未启动') }}</span>
        <span class="grow"></span>
        <button v-if="!lan.running" type="button" class="qt-btn sm primary" :disabled="lanBusy" @click="startLan"><i class="ri-play-line"></i>{{ $t('启动校内服务') }}</button>
        <template v-else>
          <button type="button" class="qt-btn sm ghost" @click="copyLanUrl"><i class="ri-file-copy-line"></i>{{ lanCopied ? $t('已复制') : $t('复制地址') }}</button>
          <button type="button" class="qt-btn sm ghost danger" :disabled="lanBusy" @click="stopLan"><i class="ri-stop-line"></i>{{ $t('停止服务') }}</button>
        </template>
      </header>
      <div v-if="lan.running" class="qt-lan">
        <div class="qt-lan__qr">
          <img v-if="lanQr" :src="lanQr" alt="QR" />
          <p class="qt-muted" dir="ltr">{{ lan.url }}</p>
        </div>
        <div class="qt-lan__info">
          <div class="qt-field"><span>{{ $t('班级码（学生登录用）') }}</span><b class="qt-code">{{ lan.classCode }}</b>
            <button type="button" class="qt-btn sm ghost" @click="rotateLan"><i class="ri-refresh-line"></i>{{ $t('换一枚') }}</button>
          </div>
          <div class="qt-field"><span>{{ $t('已认领') }}</span><b>{{ $t('{n} / {m} 名学生', { n: lan.claimed, m: lan.total }) }}</b>
            <button type="button" class="qt-btn sm ghost" @click="releaseLan"><i class="ri-user-shared-line"></i>{{ $t('全部放开') }}</button>
          </div>
          <!--
            课程与试卷分开下发：课上先讲半节再考、或者只讲不考，都是常态。
            绑在一起会变成「不发卷学生就没东西看」。
          -->
          <div class="qt-field"><span>{{ $t('已下发课程') }}</span>
            <select v-model="lanPlanId" class="qt-select" @change="publishLesson">
              <option value="">{{ $t('只发当前经文范围（不带课时安排）') }}</option>
              <option v-if="state.plan" :value="state.plan.id">{{ planLabel(state.plan) }}</option>
            </select>
          </div>
          <div class="qt-field"><span>{{ $t('已下发试卷') }}</span>
            <select v-model="lanPaperId" class="qt-select" @change="publishLan">
              <option value="">{{ $t('未下发（学生端只看学习内容，不做题）') }}</option>
              <option v-for="p in myPapers" :key="p.id" :value="p.id">{{ p.title }}</option>
            </select>
          </div>
          <p class="qt-muted">{{ $t('学生扫码 → 输班级码 → 认领自己的名字 → 作答。答案直接写回这台机器，教师端的薄弱点分析与复测用的就是这份数据。') }}</p>
        </div>
      </div>
      <p v-else class="qt-muted">{{ $t('启动后把二维码投到屏幕上，学生用手机浏览器扫码即可，不用装任何应用。教师机与学生设备要在同一个局域网。') }}</p>
    </section>

    <section class="qt-panel">
      <header class="qt-panel__head"><strong><i class="ri-user-smile-line"></i>{{ $t('学生端 · 我的学习') }}</strong><span class="qt-muted">{{ $t('一个简洁学习界面：学习内容 → 练习 / 考试 → 结果与推荐复习') }}</span><span class="grow"></span>
        <div class="qt-seg"><button v-for="s in state.students" :key="s.id" type="button" class="qt-seg__btn" :class="{ active: studentId === s.id }" @click="studentId = s.id"><span class="qt-avatar" style="width:20px;height:20px;border-radius:6px;font-size:10px">{{ studentBadge(s) }}</span>{{ s.name[state.lang] }}</button></div>
      </header>
      <div class="qt-seg" style="justify-self:start"><button v-for="tab in tabs" :key="tab.key" type="button" class="qt-seg__btn" :class="{ active: view === tab.key }" @click="view = tab.key"><i :class="tab.icon"></i>{{ tab.label }}</button></div>
    </section>

    <!-- 学习内容 -->
    <div v-if="view === 'learn'" class="qt-cols two">
      <section class="qt-panel">
        <header class="qt-panel__head"><strong><i class="ri-book-open-line"></i>{{ chapterName(state.selection.chapter) }} · <bdi dir="ltr">{{ rangeLabel(state.selection) }}</bdi></strong><span class="qt-layer l1"><i class="ri-lock-line"></i>L1</span></header>
        <div class="qt-verse-list tall"><QtVerse v-for="v in state.verses" :key="v.ref" :verse="v" size="lg" /></div>
      </section>
      <section class="qt-panel">
        <header class="qt-panel__head"><strong><i class="ri-layout-grid-line"></i>{{ $t('本课单元与词汇') }}</strong><span class="qt-layer l2">L2</span></header>
        <div v-if="state.parse" style="display:grid;gap:8px">
          <div v-for="u in state.parse.units" :key="u.id" class="qt-card"><div class="qt-card__title">{{ u.index }}. {{ u.title[state.lang] }} <span class="qt-muted" dir="ltr">{{ verseRange(u.from, u.to) }}</span></div><div class="qt-card__body">{{ u.theme[state.lang] }}</div></div>
          <div class="qt-tags"><span v-for="w in state.parse.vocabulary.filter((x) => x.meaning).slice(0, 18)" :key="w.word" class="qt-word l2"><span class="qt-ar" lang="ar">{{ w.word }}</span><small>{{ w.meaning![state.lang] }}</small></span></div>
        </div>
        <p v-else class="qt-note">{{ $t('教师尚未载入本课内容') }}</p>
        <header class="qt-panel__head"><strong><i class="ri-question-answer-line"></i>{{ $t('提问（只依据批准资料回答）') }}</strong></header>
        <div style="display:flex;gap:8px"><input v-model="question" class="qt-input" style="flex:1" :placeholder="$t('例如：坚忍在这一章里指什么？')" @keyup.enter="ask" /><button type="button" class="qt-btn primary" :disabled="asking || !question.trim()" @click="ask"><i :class="asking ? 'ri-loader-4-line qt-spin' : 'ri-send-plane-line'"></i></button></div>
        <div v-if="answer" class="qt-note" :class="answer.insufficient ? 'warn' : 'info'" style="white-space:pre-wrap"><i :class="answer.insufficient ? 'ri-alert-line' : 'ri-sparkling-2-line'"></i><span>{{ answer.insufficient ? $t('这个问题超出了已批准教学资料能支持的范围，需要更多经批准的参考资料，请咨询老师。') : answer.answer }}<div v-if="answer.sources.length" class="qt-tags" style="margin-top:6px"><span v-for="s in answer.sources" :key="s.id" class="qt-chip"><span class="qt-layer l2">L2</span>{{ s.title }}</span></div></span></div>
      </section>
    </div>

    <!-- 练习 -->
    <section v-else-if="view === 'practice'" class="qt-panel">
      <header class="qt-panel__head"><strong><i class="ri-pencil-line"></i>{{ $t('练习 / 考试') }}</strong>
        <select v-model="paperId" class="qt-select"><option v-for="p in myPapers" :key="p.id" :value="p.id">{{ p.title }}</option></select>
        <span class="grow"></span><span v-if="paper" class="qt-chip">{{ $t('{d}/{n} 已作答', { d: answeredCount, n: myQuestions.length }) }}</span><span v-if="paper && myQuestions.length && answeredCount === myQuestions.length" class="qt-chip ok">{{ $t('得分 {p}%', { p: myScore }) }}</span>
      </header>
      <p class="qt-note info">
        <i class="ri-information-line"></i>{{ $t('每个学生拿到的试卷版本不同；作答会实时写入学习行为记录，教师端与管理层立即重算。') }}
        <span v-if="myVariant" class="qt-chip" :title="myVariant.signature">{{ $t('我的卷版本 {v}', { v: myVariantLabel }) }}</span>
      </p>
      <div v-if="paper" style="display:grid;gap:10px">
        <QtQuestion v-for="(q, i) in myQuestions" :key="q.id + studentId" :q="q" :index="i" mode="answer" :lang="state.lang" :given="givenOf(q.id)" :verses="state.verses" @answer="submitAnswer" />
      </div>
      <div v-else class="qt-empty"><i class="ri-file-list-3-line"></i>{{ $t('教师尚未生成试卷') }}</div>
    </section>

    <!-- 结果 -->
    <section v-else class="qt-panel">
      <header class="qt-panel__head"><strong><i class="ri-medal-line"></i>{{ $t('我的结果与推荐复习') }}</strong><span class="grow"></span><button type="button" class="qt-btn sm" @click="loadAnalysis"><i class="ri-refresh-line"></i>{{ $t('刷新') }}</button></header>
      <template v-if="mine">
        <div class="qt-cols">
          <div class="qt-student" style="cursor:default"><div class="qt-score" :class="pctClass(mine.total.pct)"><bdi dir="ltr">{{ mine.total.pct }}%</bdi></div><div class="qt-muted">{{ $t('{c}/{n} 题正确', { c: mine.total.correct, n: mine.total.total }) }}</div>
            <div class="qt-dims"><div v-for="d in DIM_ORDER" :key="d" class="qt-dim" :class="mine.dimensions[d].total ? pctClass(mine.dimensions[d].pct) : ''"><span>{{ dimLabel(d) }}</span><span class="bar"><span :style="{ width: `${mine.dimensions[d].total ? mine.dimensions[d].pct : 0}%` }"></span></span><span class="pct">{{ mine.dimensions[d].total ? `${mine.dimensions[d].pct}%` : '—' }}</span></div></div>
          </div>
          <div class="qt-panel"><header class="qt-panel__head"><strong><i class="ri-focus-2-line"></i>{{ $t('主要弱项') }}</strong></header><div class="qt-tags"><span v-for="w in mine.weakItems" :key="w.key" class="qt-chip bad" :title="w.refs.join(', ')">{{ w.label }} {{ w.wrong }}/{{ w.total }}</span><span v-if="!mine.weakItems.length" class="qt-chip ok">{{ $t('没有明显弱项') }}</span></div>
            <header class="qt-panel__head"><strong><i class="ri-lightbulb-flash-line"></i>{{ $t('推荐动作') }}</strong></header><ul style="margin:0;padding-inline-start:16px;font-size:12.5px;display:grid;gap:4px"><li v-for="(r, i) in mine.recommendations" :key="i">{{ r }}</li></ul>
          </div>
        </div>
        <section v-if="state.reinforcement" class="qt-panel"><header class="qt-panel__head"><strong><i class="ri-flashlight-line"></i>{{ $t('老师为你准备的强化内容：{t}', { t: state.reinforcement.targetLabel }) }}</strong></header><p style="margin:0;font-size:12.5px;line-height:1.7">{{ state.reinforcement.explanation }}</p><div class="qt-cards"><div v-for="(c, i) in state.reinforcement.cards" :key="i" class="qt-card"><div class="qt-card__title">{{ c.title }}</div><div v-if="c.arabic" class="qt-ar sm" lang="ar">{{ c.arabic }}</div><div v-if="c.body" class="qt-card__body">{{ c.body }}</div></div></div></section>
      </template>
      <div v-else class="qt-empty"><i class="ri-bar-chart-line"></i>{{ $t('先完成一套练习') }}</div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { questionsForStudent } from '../../../shared/quranPaperVariant';
/** 学生端：学习内容 / 练习考试（真作答写入记录）/ 结果与推荐复习 / 受限提问。 */
import { computed, onMounted, ref, watch } from 'vue';
import type { QuranStudentAnalysis } from '@totalclaw/ipc-contracts';
import { t as i18nT } from '../../i18n';
import QRCode from 'qrcode';
import type { QuranLanStatusDto } from '@totalclaw/ipc-contracts';
import QtVerse from './QtVerse.vue';
import QtQuestion from './QtQuestion.vue';
import { DIM_ORDER, api, chapterName, dimLabel, pctClass, rangeLabel, refreshStatus, state, studentBadge, verseRange } from './shared';

// ── 校内局域网学生端 ──
const lan = ref<QuranLanStatusDto>({ running: false, port: null, url: null, classCode: '', claimed: 0, total: 0, paperId: '', planId: '' });
const lanQr = ref('');
const lanBusy = ref(false);
const lanCopied = ref(false);
const lanPaperId = ref('');
async function refreshLan(): Promise<void> {
  try { lan.value = await api().lanStatus(); } catch { return; }
  // 两个下拉一律按**服务端实际下发的**回显：它们原来是纯本地 ref，面板一重挂载
  // （切 tab、重开工作台、重启应用）就退回「未下发」，而学生端照样在发着卷 ——
  // 老师看着「未下发」以为没发出去，会再发一遍。
  lanPaperId.value = lan.value.paperId || '';
  lanPlanId.value = lan.value.planId || '';
  // 二维码只放地址，不含班级码 —— 码会被投到屏幕上、也可能被拍走，班级码得由老师口头/板书给
  lanQr.value = lan.value.url ? await QRCode.toDataURL(lan.value.url, { margin: 1, width: 168 }) : '';
}
async function startLan(): Promise<void> {
  lanBusy.value = true;
  try {
    lan.value = await api().lanStart();
    await refreshLan();
    /**
     * 起服务时默认发一份卷：老师的常规动作就是「生成卷 → 起服务 → 学生扫码作答」，
     * 停在「未下发」等于学生扫进来只能看不能做，还得回来再点一次。
     * 默认取教师端当前正在看的那份（state.activePaperId），否则取第一份。
     *
     * ⚠️ 只在**起服务这一刻**且服务端确实没发过卷时做，不在 refreshLan 里做 ——
     * 否则老师显式选回「未下发（只讲不考）」会被下一次刷新又改回来。
     * 而且必须真调 publishLan：这个下拉的标题是「已下发试卷」，
     * 只把 ref 设上而不下发，显示就是假的。
     */
    if (!lanPaperId.value && myPapers.value.length) {
      lanPaperId.value = myPapers.value.find((p) => p.id === state.activePaperId)?.id || myPapers.value[0].id;
    }
    if (lanPaperId.value) await publishLan();
  } finally { lanBusy.value = false; }
}
async function stopLan(): Promise<void> {
  lanBusy.value = true;
  try { lan.value = await api().lanStop(); lanQr.value = ''; } finally { lanBusy.value = false; }
}
async function rotateLan(): Promise<void> { lan.value = await api().lanRotate(); }
async function releaseLan(): Promise<void> { lan.value = await api().lanRelease(); }
const lanPlanId = ref('');
function planLabel(p: { difficultyLabel?: string; sessions?: unknown[] }): string {
  const n = Array.isArray(p.sessions) ? p.sessions.length : 0;
  return [p.difficultyLabel || i18nT('本课课程'), n ? i18nT('{n} 课时', { n }) : ''].filter(Boolean).join(' · ');
}
/** 下发课程：范围一定带上（学生端的经文与单元按它取），课时安排可选 */
async function publishLesson(): Promise<void> {
  const sel = state.selection;
  lan.value = await api().lanLesson({ planId: lanPlanId.value, lang: state.lang, chapter: sel.chapter, from: sel.from, to: sel.to });
}
async function publishLan(): Promise<void> {
  const sel = state.selection;
  lan.value = await api().lanPublish({ paperId: lanPaperId.value, lang: state.lang, chapter: sel.chapter, from: sel.from, to: sel.to });
}
async function copyLanUrl(): Promise<void> {
  if (!lan.value.url) return;
  try { await navigator.clipboard.writeText(lan.value.url); lanCopied.value = true; setTimeout(() => { lanCopied.value = false; }, 1600); } catch { /* 没有剪贴板权限时地址就在屏幕上，用户手抄 */ }
}

const studentId = ref('stu-a');
const view = ref<'learn' | 'practice' | 'result'>('learn');
const tabs = computed(() => [{ key: 'learn' as const, label: i18nT('学习内容'), icon: 'ri-book-open-line' }, { key: 'practice' as const, label: i18nT('练习 / 考试'), icon: 'ri-pencil-line' }, { key: 'result' as const, label: i18nT('结果与复习'), icon: 'ri-medal-line' }]);
const paperId = ref('');
const question = ref('');
const asking = ref(false);
const answer = ref<{ answer: string; sources: Array<{ id: string; title: string }>; insufficient: boolean } | null>(null);
const analysis = ref<QuranStudentAnalysis | null>(null);

// 只列当前内容语言的试卷（题干 / 选项 / 解析都是该语言）
const myPapers = computed(() => state.papers.filter((p) => p.chapter === state.selection.chapter && p.lang === state.lang));
const paper = computed(() => myPapers.value.find((p) => p.id === paperId.value) || null);
// 这名学生自己那一版（题序 + 选项顺序）；没有变体的旧存档退回原卷
const myVariant = computed(() => paper.value?.variants?.find((v) => v.studentId === studentId.value) || null);
const myQuestions = computed(() => (paper.value ? questionsForStudent(paper.value, studentId.value) : []));
// 给个短标识，让"每人一版"在界面上看得见（指纹全文在 title 里）
const myVariantLabel = computed(() => (myVariant.value ? myVariant.value.signature.slice(0, 6) : ''));
const answeredCount = computed(() => myQuestions.value.filter((q) => givenOf(q.id) !== null).length);
const myScore = computed(() => { if (!paper.value) return 0; const c = myQuestions.value.filter((q) => state.records.some((r) => r.studentId === studentId.value && r.paperId === paper.value!.id && r.questionId === q.id && r.correct)).length; return Math.round((c / Math.max(1, myQuestions.value.length)) * 100); });
const mine = computed(() => analysis.value);

onMounted(async () => { void refreshLan(); if (!state.ready) await refreshStatus(); if (!state.verses.length && state.corpus?.allVerified) { const s = state.selection; state.verses = await api().verses({ chapter: s.chapter, from: s.from, to: s.to }); } if (!paperId.value && (state.activePaperId || myPapers.value[0])) paperId.value = state.activePaperId || myPapers.value[0].id; await loadRecords(); });
watch([paperId, studentId], () => { void loadRecords(); void loadAnalysis(); });
// 切内容语言：试卷换成该语言那一套，结果与推荐按新语言重算，上一条问答作废
watch(() => state.lang, () => {
  answer.value = null;
  if (!myPapers.value.some((p) => p.id === paperId.value)) paperId.value = myPapers.value.find((p) => p.id === state.activePaperId)?.id || myPapers.value[0]?.id || '';
  else void loadRecords();
});

async function loadRecords(): Promise<void> { if (!paper.value) { analysis.value = null; return; } const r = await api().analyze({ paperId: paper.value.id, lang: state.lang }); state.records = r.records; state.analysis = r.analysis; analysis.value = r.analysis.students.find((s: QuranStudentAnalysis) => s.studentId === studentId.value) || null; }
async function loadAnalysis(): Promise<void> { await loadRecords(); }
function givenOf(qid: string): number | number[] | null { const r = state.records.find((x) => x.studentId === studentId.value && x.paperId === paperId.value && x.questionId === qid); return r ? r.answer : null; }
async function submitAnswer(p: { id: string; answer: number | number[] }): Promise<void> {
  if (!paper.value) return;
  const r = await api().answerSet({ paperId: paper.value.id, studentId: studentId.value, questionId: p.id, answer: p.answer, lang: state.lang });
  state.records = r.records; state.analysis = r.analysis; analysis.value = r.analysis.students.find((s: QuranStudentAnalysis) => s.studentId === studentId.value) || null;
}
async function ask(): Promise<void> {
  if (!question.value.trim()) return;
  asking.value = true;
  try { const s = state.selection; answer.value = await api().studentAsk({ question: question.value, chapter: s.chapter, from: s.from, to: s.to, lang: state.lang }); } finally { asking.value = false; }
}
</script>
