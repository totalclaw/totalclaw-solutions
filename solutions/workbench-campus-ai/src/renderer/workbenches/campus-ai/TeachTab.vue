<template>
  <div class="ca-teach">
    <nav class="ca-subnav" role="tablist">
      <button v-for="t in SUBS" :key="t.key" type="button" role="tab" :aria-selected="sub === t.key" :class="{ on: sub === t.key }" :data-test="`ca-teach-${t.key}`" @click="sub = t.key"><i :class="t.icon"></i>{{ t.label }}</button>
      <span class="grow"></span>
      <label class="ca-course-pick"><span>{{ $t('课程') }}</span>
        <select v-model="courseId" class="ca-sel" data-test="ca-course-select"><option value="">{{ $t('— 选择课程 —') }}</option><option v-for="c in courses" :key="c.id" :value="c.id">{{ c.name }}</option></select>
      </label>
    </nav>

    <!-- 课程与助教 -->
    <template v-if="sub === 'course'">
      <div class="ca-split">
        <section class="ss-panel">
          <h3><i class="ri-book-shelf-line"></i>{{ $t('课程') }}</h3>
          <div class="ss-actions">
            <button type="button" class="ss-btn sm" :disabled="!!busy" data-test="ca-teach-demo" @click="loadDemo"><i :class="busy === 'demo' ? 'ri-loader-4-line spin' : 'ri-magic-line'"></i>{{ $t('载入示例课程') }}</button>
            <span class="ss-muted">{{ $t('「电工电子技术」讲义 + 一份 5 题作业的标准答案与 20 名学生作答') }}</span>
          </div>
          <form class="ca-inline-form" @submit.prevent="saveCourse">
            <input v-model="form.name" class="ca-input" :placeholder="$t('课程名称')" />
            <input v-model="form.teacher" class="ca-input sm" :placeholder="$t('任课教师')" />
            <label class="ca-check"><input v-model="form.publicTutor" type="checkbox" />{{ $t('开放给学生手机提问') }}</label>
            <button type="submit" class="ss-btn primary sm" :disabled="!form.name.trim()">{{ form.id ? $t('保存') : $t('新建课程') }}</button>
          </form>
          <ul class="ca-courses">
            <li v-for="c in courses" :key="c.id" :class="{ on: c.id === courseId }" @click="courseId = c.id">
              <b>{{ c.name }}</b><small>{{ c.teacher || '—' }} · {{ $t('{n} 份资料', { n: docsOf(c.id).length }) }}<template v-if="c.publicTutor"> · {{ $t('手机可问') }}</template></small>
              <span class="grow"></span>
              <button type="button" class="ss-btn sm ghost" @click.stop="editCourse(c)">{{ $t('编辑') }}</button>
              <button type="button" class="ss-btn sm ghost danger" @click.stop="removeCourse(c.id)">{{ armed === c.id ? $t('确认删除') : $t('删除') }}</button>
            </li>
            <li v-if="!courses.length" class="empty">{{ $t('还没有课程：新建一门，或载入示例课程') }}</li>
          </ul>
        </section>

        <section class="ss-panel">
          <h3><i class="ri-folder-open-line"></i>{{ $t('课程资料') }}</h3>
          <template v-if="course">
            <div class="ss-actions">
              <button type="button" class="ss-btn sm" :disabled="!!busy" @click="importMaterials"><i class="ri-file-add-line"></i>{{ $t('导入讲义 / 课件 / 教材节选') }}</button>
              <span class="ss-muted">{{ $t('只给这门课的助教和出题用，不进全校问答') }}</span>
            </div>
            <ul class="ca-docs">
              <li v-for="d in docsOf(course.id)" :key="d.id"><i class="ri-file-text-line"></i><span>{{ d.name }}</span><em class="ss-chip" :class="d.status === 'built' ? 'ok' : d.status === 'failed' ? 'bad' : 'brand'">{{ d.status === 'built' ? $t('{n} 段', { n: d.chunks }) : d.status === 'failed' ? $t('失败') : $t('构建中') }}</em></li>
              <li v-if="!docsOf(course.id).length" class="empty">{{ $t('还没有资料') }}</li>
            </ul>
          </template>
          <p v-else class="ss-muted">{{ $t('先在左边选一门课') }}</p>
        </section>
      </div>

      <section class="ss-panel">
        <h3><i class="ri-user-voice-line"></i>{{ $t('课程助教') }}<small v-if="course" class="ss-muted">{{ course.name }}</small></h3>
        <p class="ss-muted">{{ $t('学生问这门课的问题，助教只依据课程资料作答并给出处；资料里没有的转给任课教师，不编。') }}</p>
        <form class="ss-actions" @submit.prevent="askTutor">
          <input v-model="tutorQ" class="ca-input" :disabled="!course" :placeholder="$t('例如：并联电阻的总电阻怎么算？')" data-test="ca-tutor-input" />
          <button type="submit" class="ss-btn primary" :disabled="!course || !tutorQ.trim() || !!busy" data-test="ca-tutor-ask"><i :class="busy === 'tutor' ? 'ri-loader-4-line spin' : 'ri-question-answer-line'"></i>{{ $t('提问') }}</button>
        </form>
        <article v-if="tutorA" class="ca-answer" data-test="ca-tutor-answer">
          <span class="ss-chip" :class="tutorA.kind === 'answer' || tutorA.kind === 'quote' ? 'brand' : 'warn'">{{ tutorA.kind === 'no_evidence' ? $t('资料里没有，已转任课教师') : tutorA.kind === 'quote' ? $t('原文摘录') : tutorA.kind === 'sensitive' ? $t('敏感问题') : $t('依据课程资料作答') }}</span>
          <p class="ca-pre">{{ tutorA.text }}</p>
          <ol v-if="tutorA.sources.length" class="ca-sources"><li v-for="(x, i) in tutorA.sources" :key="i"><b>{{ x.title }}</b><br>{{ x.snippet }}</li></ol>
        </article>
      </section>
    </template>

    <!-- 智能出题 -->
    <template v-else-if="sub === 'quiz'">
      <section class="ss-panel">
        <h3><i class="ri-file-list-3-line"></i>{{ $t('智能出题') }}<small v-if="course" class="ss-muted">{{ course.name }}</small></h3>
        <p class="ss-muted">{{ $t('只从课程资料出题，每题附一句原文出处并逐字核对；对不上原文、格式不对的题直接丢掉。出完请逐题审阅再用。') }}</p>
        <div class="ca-quiz-form">
          <label v-for="t in QTYPES" :key="t" class="ss-field"><span>{{ typeLabel(t) }}</span><input v-model.number="counts[t]" type="number" min="0" max="20" /></label>
          <label class="ss-field wide"><span>{{ $t('侧重（可选）') }}</span><input v-model="focus" :placeholder="$t('如：基尔霍夫定律、有效值')" /></label>
        </div>
        <div class="ss-actions">
          <button type="button" class="ss-btn primary" :disabled="!course || !!busy || !courseReady" data-test="ca-quiz-gen" @click="genQuiz"><i :class="busy === 'quiz' ? 'ri-loader-4-line spin' : 'ri-magic-line'"></i>{{ $t('出题') }}</button>
          <span v-if="!course" class="ss-muted">{{ $t('先选一门课') }}</span>
          <span v-else-if="!courseReady" class="ss-muted">{{ $t('这门课还没有已构建的资料') }}</span>
          <span v-else-if="busy === 'quiz'" class="ss-muted">{{ $t('正在出题，通常 30～90 秒…') }}</span>
        </div>
        <p v-if="quizMsg" class="ss-note" :class="quizMsg.dropped ? 'warn' : 'ok'"><i :class="quizMsg.dropped ? 'ri-alert-line' : 'ri-checkbox-circle-line'"></i>{{ $t('新出 {a} 道，丢弃 {b} 道', { a: quizMsg.made, b: quizMsg.dropped }) }}<template v-if="quizMsg.reasons.length">{{ $t('：{p0}', { p0: quizMsg.reasons.slice(0, 3).join('；') }) }}</template></p>
      </section>

      <section class="ss-panel">
        <h3><i class="ri-database-2-line"></i>{{ $t('题库') }}<span class="ss-chip">{{ bank.length }}</span></h3>
        <div class="ss-actions">
          <button type="button" class="ss-btn sm" :disabled="!bank.length" @click="toggleAll">{{ allPicked ? $t('取消全选') : $t('全选') }}</button>
          <button type="button" class="ss-btn sm" :disabled="!picked.length" @click="exportQuiz"><i class="ri-file-excel-2-line"></i>{{ $t('导出试卷与答案（{n} 题）', { n: picked.length }) }}</button>
          <button type="button" class="ss-btn sm" :disabled="!picked.length" @click="gradeFromBank"><i class="ri-checkbox-multiple-line"></i>{{ $t('用这些题建批改任务') }}</button>
          <button type="button" class="ss-btn sm ghost danger" :disabled="!picked.length" @click="removeQuestions">{{ armed === 'bank' ? $t('确认删除') : $t('删除所选') }}</button>
        </div>
        <ol class="ca-bank">
          <li v-for="q in bank" :key="q.id" :class="{ reviewed: q.reviewed }">
            <label class="ca-bank__pick"><input v-model="picked" type="checkbox" :value="q.id" /></label>
            <div class="ca-bank__body">
              <p><span class="ss-chip brand">{{ typeLabel(q.type) }}</span> <b>{{ q.stem }}</b> <small class="ss-muted">{{ $t('{n} 分', { n: q.score }) }}</small></p>
              <ol v-if="q.options.length" type="A" class="ca-bank__opts"><li v-for="(o, i) in q.options" :key="i" :class="{ right: q.answer.includes('ABCDEFGH'[i]) }">{{ o }}</li></ol>
              <p class="ca-bank__ans">{{ $t('答案：{p0}', { p0: answerText(q) }) }}<template v-if="q.points.length"> · {{ $t('要点：{p0}', { p0: q.points.join('；') }) }}</template></p>
              <p class="ca-bank__src"><i class="ri-double-quotes-l"></i>{{ q.sourceQuote }} <small>— {{ q.sourceTitle }}</small></p>
            </div>
            <label class="ca-check"><input type="checkbox" :checked="q.reviewed" @change="markReviewed(q.id, ($event.target as HTMLInputElement).checked)" />{{ $t('已审阅') }}</label>
          </li>
          <li v-if="!bank.length" class="empty">{{ course ? $t('这门课还没有题目') : $t('先选一门课') }}</li>
        </ol>
      </section>
    </template>

    <!-- 作业批改 -->
    <template v-else>
      <div class="ss-module">
        <StickyProgress :title="$t('作业批改')" :metas="metas" :runtime="runtime" :current-key="currentKey" @jump="jump" />
        <div class="ss-steps">
          <StepCard step-key="gr-key" :index="0" :title="metas[0].title" :hint="metas[0].hint" :runtime="runtime['gr-key']" :is-current="currentKey === 'gr-key'">
            <div class="ss-actions">
              <label class="ss-field inline"><span>{{ $t('批改任务') }}</span>
                <select v-model="gradingId" class="ca-sel"><option value="">{{ $t('— 新建 —') }}</option><option v-for="g in gradings" :key="g.id" :value="g.id">{{ $t('{p0}（{p1}）', { p0: g.title, p1: g.students }) }}</option></select>
              </label>
            </div>
            <form v-if="!gradingId" class="ca-inline-form" @submit.prevent="createFromFile()">
              <input v-model="newTitle" class="ca-input" :placeholder="$t('作业名称，如：第一章作业')" />
              <button type="submit" class="ss-btn primary sm" :disabled="!course || !!busy" data-test="ca-grade-key"><i class="ri-file-excel-2-line"></i>{{ $t('导入标准答案表') }}</button>
              <button v-if="demoFiles" type="button" class="ss-btn sm" :disabled="!!busy" data-test="ca-grade-key-demo" @click="createFromFile(demoFiles.keyFile)">{{ $t('用示例标准答案') }}</button>
              <span class="ss-muted">{{ $t('表头：题号、题型、标准答案、分值、评分要点；也可以在「智能出题」里选题直接建') }}</span>
            </form>
            <div v-if="grading" class="ca-key">
              <span v-for="k in grading.key" :key="k.no" class="ss-chip">{{ $t('第{p0}题', { p0: k.no }) }} · {{ typeLabel(k.type) }} · {{ $t('{n} 分', { n: k.score }) }}</span>
            </div>
          </StepCard>

          <StepCard step-key="gr-ans" :index="1" :title="metas[1].title" :hint="metas[1].hint" :runtime="runtime['gr-ans']" :is-current="currentKey === 'gr-ans'">
            <div class="ss-actions">
              <button type="button" class="ss-btn primary sm" :disabled="!grading || !!busy" data-test="ca-grade-answers" @click="importAnswers()"><i class="ri-file-excel-2-line"></i>{{ grading?.rows.length ? $t('重新导入作答') : $t('导入学生作答表') }}</button>
              <button v-if="demoFiles && grading" type="button" class="ss-btn sm" :disabled="!!busy" data-test="ca-grade-answers-demo" @click="importAnswers(demoFiles.answersFile)">{{ $t('用示例学生作答') }}</button>
              <span class="ss-muted">{{ $t('表头：学号、姓名，每题一列（列名带题号，如「第1题」）。客观题导入即自动判分') }}</span>
            </div>
            <p v-for="p in ansProblems" :key="p" class="ss-note warn"><i class="ri-alert-line"></i>{{ p }}</p>
          </StepCard>

          <StepCard step-key="gr-auto" :index="2" :title="metas[2].title" :hint="metas[2].hint" :runtime="runtime['gr-auto']" :is-current="currentKey === 'gr-auto'" :retry="busy ? undefined : suggest">
            <div class="ss-actions">
              <button type="button" class="ss-btn primary sm" :disabled="!grading?.rows.length || !!busy || !hasShort" data-test="ca-grade-suggest" @click="suggest"><i :class="busy === 'suggest' ? 'ri-loader-4-line spin' : 'ri-robot-2-line'"></i>{{ $t('主观题给建议分') }}</button>
              <span class="ss-muted">{{ hasShort ? $t('同一题的作答匿名编号后成批交给模型，按评分要点给分；建议分要你确认') : $t('这份作业没有主观题') }}</span>
            </div>
            <p v-if="gradeProgress" class="ss-note info"><i class="ri-loader-4-line spin"></i>{{ gradeProgress }}</p>
          </StepCard>

          <StepCard step-key="gr-confirm" :index="3" :title="metas[3].title" :hint="metas[3].hint" :runtime="runtime['gr-confirm']" :is-current="currentKey === 'gr-confirm'">
            <template v-if="grading?.rows.length">
              <div class="ss-actions">
                <button type="button" class="ss-btn primary sm" :disabled="!!busy || !confirmable" data-test="ca-grade-confirm" @click="confirmAll">{{ $t('确认全部已有分数的学生（{n}）', { n: confirmable }) }}</button>
                <span class="ss-muted">{{ $t('改分直接在格子里改，改过的记为教师评分') }}</span>
              </div>
              <div class="ss-table-wrap tall">
                <table class="ss-table">
                  <thead><tr><th>{{ $t('学生') }}</th><th v-for="k in grading.key" :key="k.no" class="num">{{ $t('第{p0}题', { p0: k.no }) }}<br><small>/{{ k.score }}</small></th><th class="num">{{ $t('总分') }}</th><th>{{ $t('状态') }}</th></tr></thead>
                  <tbody>
                    <tr v-for="r in grading.rows" :key="r.studentId">
                      <td>{{ r.name || r.studentId }}<br><small class="ss-muted">{{ r.studentId }}</small></td>
                      <td v-for="it in r.items" :key="it.no" class="num ca-cell" :class="it.by" :title="`${it.response}\n${it.reason}`">
                        <input v-if="isShort(it.no)" class="ca-score" type="number" min="0" :max="it.max" step="0.5" :value="it.final ?? ''" :placeholder="$t('待评')" @change="(e) => setScore(r.studentId, it.no, (e.target as HTMLInputElement).value)" />
                        <span v-else>{{ it.final }}</span>
                      </td>
                      <td class="num"><b>{{ r.total }}</b></td>
                      <td><span class="ss-chip" :class="r.confirmed ? 'ok' : 'warn'">{{ r.confirmed ? $t('已确认') : $t('待确认') }}</span></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </template>
            <p v-else class="ss-muted">{{ $t('先导入学生作答') }}</p>
          </StepCard>

          <StepCard step-key="gr-export" :index="4" :title="metas[4].title" :hint="metas[4].hint" :runtime="runtime['gr-export']" :is-current="currentKey === 'gr-export'">
            <div class="ss-actions">
              <button type="button" class="ss-btn primary sm" :disabled="!grading?.rows.length || !!busy || unconfirmed > 0" data-test="ca-grade-export" @click="exportGrades"><i class="ri-download-2-line"></i>{{ $t('导出成绩与评分说明') }}</button>
              <span v-if="unconfirmed" class="ss-muted">{{ $t('还有 {n} 名学生没确认', { n: unconfirmed }) }}</span>
            </div>
            <p v-if="grading?.exportPath" class="ss-file-out"><i class="ri-file-check-line"></i><code>{{ grading.exportPath }}</code><button type="button" class="ss-link" @click="openPath(grading.exportPath!, true)">{{ $t('打开所在文件夹') }}</button></p>
          </StepCard>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
/** 教学：课程与助教 / 智能出题 / 作业批改 */
import { computed, reactive, ref, watch } from 'vue';
import { CA_QUESTION_TYPES, type CaAnswer, type CaCourse, type CaGrading, type CaQuestion, type CaQuestionType } from '@totalclaw/ipc-contracts';
import { useNotificationStore } from '../../stores/notification';
import { t as i18nT } from '../../i18n';
import StepCard from '../service-settlement/StepCard.vue';
import StickyProgress from '../service-settlement/StickyProgress.vue';
import { ca, caProgress, caState, errorMessage, openPath, refreshState, scrollToStep, type StepMeta, type StepRuntime } from './shared';

const notif = useNotificationStore();
type Sub = 'course' | 'quiz' | 'grade';
const SUBS: Array<{ key: Sub; label: string; icon: string }> = [
  { key: 'course', label: i18nT('课程与助教'), icon: 'ri-book-shelf-line' },
  { key: 'quiz', label: i18nT('智能出题'), icon: 'ri-file-list-3-line' },
  { key: 'grade', label: i18nT('作业批改'), icon: 'ri-checkbox-multiple-line' },
];
const QTYPES = CA_QUESTION_TYPES;
const sub = ref<Sub>('course');
const busy = ref('');
const armed = ref('');
const courseId = ref('');
const form = reactive<{ id?: string; name: string; teacher: string; publicTutor: boolean }>({ name: '', teacher: '', publicTutor: true });
const tutorQ = ref('');
const tutorA = ref<CaAnswer | null>(null);
const counts = reactive<Record<CaQuestionType, number>>({ single: 4, multiple: 2, judge: 2, short: 2 });
const focus = ref('');
const quizMsg = ref<{ made: number; dropped: number; reasons: string[] } | null>(null);
const bank = ref<CaQuestion[]>([]);
const picked = ref<string[]>([]);
const gradingId = ref('');
const grading = ref<CaGrading | null>(null);
const newTitle = ref('');
const ansProblems = ref<string[]>([]);
const errors = ref<Record<string, string>>({});

const courses = computed(() => caState.value?.courses || []);
const course = computed<CaCourse | null>(() => courses.value.find((c) => c.id === courseId.value) || null);
const docsOf = (id: string) => (caState.value?.docs || []).filter((d) => d.courseId === id);
const courseReady = computed(() => !!course.value && docsOf(course.value.id).some((d) => d.status === 'built'));
const gradings = computed(() => (caState.value?.gradings || []).filter((g) => !courseId.value || g.courseId === courseId.value));
const allPicked = computed(() => bank.value.length > 0 && picked.value.length === bank.value.length);
const gradeProgress = computed(() => (caProgress.value.scope === 'grade' ? caProgress.value.message : ''));
const typeLabel = (t: CaQuestionType): string => ({ single: i18nT('单选题'), multiple: i18nT('多选题'), judge: i18nT('判断题'), short: i18nT('简答题') }[t]);
const answerText = (q: CaQuestion): string => (q.type === 'judge' ? (q.answer === 'T' ? i18nT('对') : i18nT('错')) : q.answer);
const isShort = (no: string): boolean => grading.value?.key.find((k) => k.no === no)?.type === 'short';
const hasShort = computed(() => !!grading.value?.key.some((k) => k.type === 'short'));
const unconfirmed = computed(() => grading.value?.rows.filter((r) => !r.confirmed).length || 0);
const confirmable = computed(() => grading.value?.rows.filter((r) => !r.confirmed && r.items.every((i) => i.final !== null)).length || 0);

async function act<T>(key: string, fn: () => Promise<T>): Promise<T | null> {
  busy.value = key;
  errors.value = { ...errors.value, [key]: '' };
  try { const r = await fn(); await refreshState(); return r; } catch (e) { errors.value = { ...errors.value, [key]: errorMessage(e) }; notif.error(errorMessage(e)); return null; } finally { busy.value = ''; }
}
function confirmTwice(id: string): boolean {
  if (armed.value === id) { armed.value = ''; return true; }
  armed.value = id; setTimeout(() => { if (armed.value === id) armed.value = ''; }, 3000); return false;
}

// 课程
async function loadDemo(): Promise<void> {
  const r = await act('demo', () => ca<{ courseId: string; keyFile: string; answersFile: string }>('teach.demo'));
  if (r) { courseId.value = r.courseId; demoFiles.value = r; notif.success(i18nT('已载入示例课程')); }
}
const demoFiles = ref<{ keyFile: string; answersFile: string } | null>(null);
async function saveCourse(): Promise<void> {
  const r = await act('course', () => ca<CaCourse>('course.save', { input: { ...form } }));
  if (r) { courseId.value = r.id; Object.assign(form, { id: undefined, name: '', teacher: '', publicTutor: true }); }
}
function editCourse(c: CaCourse): void { Object.assign(form, { id: c.id, name: c.name, teacher: c.teacher, publicTutor: c.publicTutor }); }
async function removeCourse(id: string): Promise<void> {
  if (!confirmTwice(id)) return;
  await act('course', () => ca('course.remove', { id }));
  if (courseId.value === id) courseId.value = '';
}
async function importMaterials(): Promise<void> {
  const paths = await ca<string[]>('files.pick', { kind: 'doc', multi: true, title: i18nT('选择课程资料') }).catch(() => []);
  if (paths.length) await act('course', () => ca('course.import', { courseId: courseId.value, paths }));
}
async function askTutor(): Promise<void> {
  const r = await act('tutor', () => ca<CaAnswer>('tutor.ask', { courseId: courseId.value, question: tutorQ.value }));
  if (r) tutorA.value = r;
}

// 出题
async function loadBank(): Promise<void> {
  bank.value = courseId.value ? await ca<CaQuestion[]>('quiz.list', { courseId: courseId.value }).catch(() => []) : [];
  picked.value = picked.value.filter((id) => bank.value.some((q) => q.id === id));
}
async function genQuiz(): Promise<void> {
  const r = await act('quiz', () => ca<{ made: number; dropped: number; reasons: string[] }>('quiz.generate', { courseId: courseId.value, counts: { ...counts }, focus: focus.value }));
  if (r) { quizMsg.value = r; await loadBank(); }
}
function toggleAll(): void { picked.value = allPicked.value ? [] : bank.value.map((q) => q.id); }
async function markReviewed(id: string, v: boolean): Promise<void> {
  try { await ca('quiz.update', { id, patch: { reviewed: v } }); await loadBank(); } catch (e) { notif.error(errorMessage(e)); }
}
async function removeQuestions(): Promise<void> {
  if (!confirmTwice('bank')) return;
  await act('quiz', () => ca('quiz.remove', { ids: picked.value }));
  picked.value = [];
  await loadBank();
}
async function exportQuiz(): Promise<void> {
  const f = await act('quiz', () => ca<string>('quiz.export', { courseId: courseId.value, ids: picked.value }));
  if (f) void openPath(f, true);
}
async function gradeFromBank(): Promise<void> {
  const r = await act('quiz', () => ca<{ id: string }>('grade.create', { courseId: courseId.value, title: i18nT('{p0} 测验', { p0: course.value?.name || '' }), questionIds: picked.value }));
  if (r) { gradingId.value = r.id; sub.value = 'grade'; }
}

// 批改
const metas: StepMeta[] = [
  { key: 'gr-key', title: i18nT('标准答案'), hint: i18nT('导入标准答案表，或从题库选题生成') },
  { key: 'gr-ans', title: i18nT('学生作答'), hint: i18nT('导入作答表，客观题按答案自动判分') },
  { key: 'gr-auto', title: i18nT('主观题建议分'), hint: i18nT('按评分要点给建议分，不发姓名学号') },
  { key: 'gr-confirm', title: i18nT('教师确认'), hint: i18nT('逐题核对、改分、确认') },
  { key: 'gr-export', title: i18nT('导出成绩'), hint: i18nT('成绩表 + 每题评分说明') },
];
const runtime = computed<Record<string, StepRuntime>>(() => {
  const g = grading.value;
  const err = errors.value;
  const shortPending = g ? g.rows.some((r) => r.items.some((i) => isShort(i.no) && i.by === 'pending')) : true;
  return {
    'gr-key': busy.value === 'key' ? { state: 'running' } : err.key ? { state: 'failed', error: err.key } : g ? { state: 'done', summary: i18nT('{n} 道题，满分 {m}', { n: g.key.length, m: g.key.reduce((s, k) => s + k.score, 0) }) } : { state: 'todo' },
    'gr-ans': busy.value === 'ans' ? { state: 'running' } : err.ans ? { state: 'failed', error: err.ans } : g?.rows.length ? { state: 'done', summary: i18nT('{n} 名学生', { n: g.rows.length }) } : { state: 'todo' },
    'gr-auto': busy.value === 'suggest' ? { state: 'running', kind: 'llm', progressAt: Date.now() } : err.suggest ? { state: 'failed', error: err.suggest } : g?.rows.length && !hasShort.value ? { state: 'skipped' } : g?.rows.length && !shortPending ? { state: 'done', summary: i18nT('主观题已有分数') } : { state: 'todo' },
    'gr-confirm': g?.rows.length && !unconfirmed.value ? { state: 'done', summary: i18nT('{n} 名学生已确认', { n: g.rows.length }) } : { state: 'todo' },
    'gr-export': busy.value === 'export' ? { state: 'running' } : err.export ? { state: 'failed', error: err.export } : g?.exportedAt ? { state: 'done', summary: g.exportPath || '' } : { state: 'todo' },
  };
});
const currentKey = computed(() => metas.find((m) => !['done', 'skipped'].includes(runtime.value[m.key].state))?.key || 'gr-export');
const jump = (k: string): void => { void scrollToStep(k); };

async function loadGrading(): Promise<void> {
  grading.value = gradingId.value ? await ca<CaGrading>('grade.get', { id: gradingId.value }).catch(() => null) : null;
}
async function createFromFile(preset?: string): Promise<void> {
  if (!course.value) { notif.warn(i18nT('先在右上角选一门课')); return; }
  const paths = preset ? [preset] : await ca<string[]>('files.pick', { kind: 'excel', multi: false, title: i18nT('选择标准答案表') }).catch(() => []);
  if (!paths[0]) return;
  const r = await act('key', () => ca<{ id: string; problems: string[] }>('grade.create', { courseId: courseId.value, title: newTitle.value || i18nT('{p0} 作业', { p0: course.value!.name }), keyPath: paths[0] }));
  if (r) { gradingId.value = r.id; r.problems.forEach((p) => notif.warn(p)); }
}
async function importAnswers(preset?: string): Promise<void> {
  const paths = preset ? [preset] : await ca<string[]>('files.pick', { kind: 'excel', multi: false, title: i18nT('选择学生作答表') }).catch(() => []);
  if (!paths[0]) return;
  const r = await act('ans', () => ca<{ students: number; problems: string[] }>('grade.answers', { id: gradingId.value, path: paths[0] }));
  if (r) { ansProblems.value = r.problems; await loadGrading(); }
}
async function suggest(): Promise<void> {
  const r = await act('suggest', () => ca<{ suggested: number; failed: number }>('grade.suggest', { id: gradingId.value }));
  await loadGrading();
  if (r) notif.success(i18nT('建议分 {a} 份，待教师评 {b} 份', { a: r.suggested, b: r.failed }));
}
async function setScore(studentId: string, no: string, v: string): Promise<void> {
  try { await ca('grade.set', { id: gradingId.value, studentId, no, final: v === '' ? null : Number(v) }); await loadGrading(); } catch (e) { notif.error(errorMessage(e)); }
}
async function confirmAll(): Promise<void> { await act('confirm', () => ca('grade.confirm', { id: gradingId.value })); await loadGrading(); }
async function exportGrades(): Promise<void> {
  const f = await act('export', () => ca<string>('grade.export', { id: gradingId.value }));
  await loadGrading();
  if (f) void openPath(f, true);
}

watch(courseId, () => { void loadBank(); tutorA.value = null; quizMsg.value = null; });
watch(gradingId, () => { ansProblems.value = []; void loadGrading(); });
watch(sub, (v) => { if (v === 'quiz') void loadBank(); if (v === 'grade') void loadGrading(); });
if (!courseId.value && courses.value[0]) courseId.value = courses.value[0].id;
</script>

<style scoped>
.ca-teach { display: grid; gap: 14px; }
.ca-subnav { display: flex; gap: 6px; align-items: center; flex-wrap: wrap; padding: 6px; border: 1px solid var(--color-border); border-radius: 12px; background: var(--color-bg-card); }
.ca-subnav button { display: inline-flex; gap: 6px; align-items: center; padding: 6px 14px; border: none; border-radius: 8px; background: transparent; font: inherit; font-size: 13px; font-weight: 600; color: var(--color-text-secondary); cursor: pointer; }
.ca-subnav button:hover { color: var(--ca-oxblood); }
.ca-subnav button.on { background: var(--ca-oxblood); color: var(--ca-banner-ink); }
.ca-subnav .grow { flex: 1; }
.ca-course-pick { display: inline-flex; gap: 6px; align-items: center; font-size: 12.5px; color: var(--color-text-secondary); }
.ca-inline-form { display: flex; gap: 8px; flex-wrap: wrap; align-items: center; }
.ca-input.sm { flex: 0 1 160px; min-width: 120px; }
.ca-courses, .ca-docs { list-style: none; margin: 0; padding: 0; display: grid; gap: 6px; }
.ca-courses li { display: flex; gap: 8px; align-items: center; padding: 8px 10px; border: 1px solid var(--color-border); border-radius: 10px; cursor: pointer; }
.ca-courses li.on { border-color: var(--ca-oxblood); background: var(--color-brand-subtle); }
.ca-courses li b { font-family: var(--ca-serif); }
.ca-courses li small { color: var(--color-text-secondary); font-size: 12px; }
.ca-courses .grow { flex: 1; }
.ca-docs li { display: flex; gap: 8px; align-items: center; font-size: 13px; }
.ca-docs li span { flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.ca-courses .empty, .ca-docs .empty, .ca-bank .empty { color: var(--color-text-secondary); font-size: 13px; border: none; cursor: default; }
.ca-answer { border: 1px solid var(--color-border); border-radius: 10px; padding: 12px 14px; display: grid; gap: 8px; }
.ca-quiz-form { display: grid; gap: 10px; grid-template-columns: repeat(4, minmax(80px, 120px)) minmax(200px, 1fr); }
@media (max-width: 900px) { .ca-quiz-form { grid-template-columns: repeat(2, 1fr); } .ca-quiz-form .wide { grid-column: 1 / -1; } }
.ca-bank { margin: 0; padding: 0; list-style: none; display: grid; gap: 8px; counter-reset: q; }
.ca-bank > li { display: grid; grid-template-columns: auto minmax(0, 1fr) auto; gap: 10px; align-items: start; padding: 10px 12px; border: 1px solid var(--color-border); border-radius: 10px; }
.ca-bank > li.reviewed { border-color: color-mix(in srgb, var(--color-success) 40%, var(--color-border)); }
.ca-bank__body p { margin: 0 0 4px; font-size: 13px; line-height: 1.6; }
.ca-bank__opts { margin: 0 0 4px; padding-inline-start: 22px; font-size: 13px; }
.ca-bank__opts li.right { color: var(--color-success); font-weight: 700; }
.ca-bank__ans { color: var(--ca-oxblood); }
.ca-bank__src { color: var(--color-text-secondary); font-size: 12px !important; font-family: var(--ca-serif); }
.ca-bank__src i { color: var(--ca-gold); margin-inline-end: 4px; }
.ca-key { display: flex; gap: 6px; flex-wrap: wrap; }
.ca-cell.model { background: color-mix(in srgb, var(--ca-gold) 12%, transparent); }
.ca-cell.teacher { background: color-mix(in srgb, var(--color-success) 10%, transparent); }
.ca-cell.pending { background: color-mix(in srgb, var(--color-warning) 12%, transparent); }
.ca-score { width: 64px; text-align: right; }
</style>
