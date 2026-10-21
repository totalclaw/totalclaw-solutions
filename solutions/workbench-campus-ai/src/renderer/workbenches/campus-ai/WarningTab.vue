<template>
  <div class="ss-module">
    <StickyProgress :title="$t('学业预警')" :metas="metas" :runtime="runtime" :current-key="currentKey" @jump="jump" />
    <div class="ss-steps">
      <!-- 1 导入数据 -->
      <StepCard step-key="cw-data" :index="0" :title="metas[0].title" :hint="metas[0].hint" :runtime="runtime['cw-data']" :is-current="currentKey === 'cw-data'">
        <div class="ss-actions">
          <button type="button" class="ss-btn" :disabled="!!busy" data-test="ca-warn-demo" @click="loadDemo"><i :class="busy === 'cw-demo' ? 'ri-loader-4-line spin' : 'ri-magic-line'"></i>{{ $t('载入示例数据') }}</button>
          <span class="ss-muted">{{ $t('4 个班 120 名学生的名单、成绩、考勤（人名随机生成），写在输出目录的「示例数据」里') }}</span>
        </div>
        <div class="ca-slots">
          <div v-for="k in DATASETS" :key="k" class="ca-slot" :class="{ ok: ds(k)?.loaded, bad: ds(k) && !ds(k)!.loaded }" @dragover.prevent @drop.prevent="(e) => onDrop(k, e)">
            <header>
              <b>{{ datasetLabel(k) }}</b>
              <span v-if="k === 'attendance'" class="ss-chip">{{ $t('可选') }}</span>
              <span v-if="ds(k)?.loaded" class="ss-chip ok">{{ $t('{n} 行', { n: ds(k)!.count }) }}</span>
            </header>
            <small class="ss-muted">{{ datasetHint(k) }}</small>
            <template v-if="ds(k)">
              <p class="ca-file"><i class="ri-file-excel-2-line"></i>{{ ds(k)!.fileName }}<span v-if="ds(k)!.sheetNames.length > 1"> · {{ ds(k)!.sheetName }}</span></p>
              <p v-if="ds(k)!.missing.length" class="ss-note danger"><i class="ri-error-warning-line"></i>{{ $t('没认出：{p0}。请在下面指定对应的列', { p0: ds(k)!.missing.map(roleName).join('、') }) }}</p>
              <details :open="ds(k)!.missing.length > 0">
                <summary class="ss-muted">{{ $t('列对应') }}</summary>
                <div class="ca-map">
                  <label v-for="r in rolesOf(k)" :key="r" class="ss-field inline">
                    <span>{{ roleName(r) }}<em v-if="isRequired(k, r)">*</em></span>
                    <select :value="ds(k)!.mapping[r] || ''" @change="(e) => remap(k, r, (e.target as HTMLSelectElement).value)">
                      <option value="">—</option>
                      <option v-for="h in ds(k)!.headers" :key="h" :value="h">{{ h }}</option>
                    </select>
                  </label>
                </div>
              </details>
              <p v-for="n in ds(k)!.notes" :key="n" class="ss-note"><i class="ri-information-line"></i>{{ n }}</p>
              <p v-if="ds(k)!.skippedCount" class="ss-note warn"><i class="ri-alert-line"></i>{{ $t('{n} 行没有收下：{p0}', { n: ds(k)!.skippedCount, p0: ds(k)!.skipped.slice(0, 5).map((x) => $t('第 {r} 行（{why}）', { r: x.row, why: x.reason })).join('；') }) }}</p>
            </template>
            <div class="ss-actions">
              <button type="button" class="ss-btn sm" :disabled="!!busy" :data-test="`ca-warn-pick-${k}`" @click="pick(k)"><i class="ri-folder-open-line"></i>{{ ds(k) ? $t('换一份') : $t('选择表格') }}</button>
              <button v-if="ds(k)" type="button" class="ss-btn sm ghost" :disabled="!!busy" @click="clear(k)">{{ $t('移除') }}</button>
            </div>
          </div>
        </div>
      </StepCard>

      <!-- 2 计算预警 -->
      <StepCard step-key="cw-compute" :index="1" :title="metas[1].title" :hint="metas[1].hint" :runtime="runtime['cw-compute']" :is-current="currentKey === 'cw-compute'">
        <details class="ca-rules">
          <summary>{{ $t('预警规则：任一门槛满足即达到该级，从红色往下判；填 0 表示这一项不作门槛') }}</summary>
          <div class="ss-table-wrap">
            <table class="ss-table">
              <thead><tr><th>{{ $t('级别') }}</th><th>{{ $t('不及格门数 ≥') }}</th><th>{{ $t('不及格学分 ≥') }}</th><th>{{ $t('缺勤率 ≥（%）') }}</th></tr></thead>
              <tbody>
                <tr v-for="lv in LEVELS" :key="lv">
                  <td><span class="ss-chip" :class="levelClass(lv)">{{ levelLabel(lv) }}</span></td>
                  <td><input v-model.number="rules[lv].failCourses" type="number" min="0" step="1" /></td>
                  <td><input v-model.number="rules[lv].failCredits" type="number" min="0" step="0.5" /></td>
                  <td><input v-model.number="rulePct[lv]" type="number" min="0" max="100" step="1" /></td>
                </tr>
              </tbody>
            </table>
          </div>
          <div class="ss-actions">
            <label class="ss-field inline"><span>{{ $t('及格线') }}</span><input v-model.number="rules.passScore" type="number" min="0" max="100" /></label>
            <button type="button" class="ss-btn sm" :disabled="!!busy || !rulesDirty" @click="saveRules">{{ $t('保存规则') }}</button>
            <button type="button" class="ss-btn sm ghost" @click="resetRules">{{ $t('恢复默认') }}</button>
          </div>
        </details>
        <div class="ss-actions">
          <button type="button" class="ss-btn primary" :disabled="!!busy || !canCompute" data-test="ca-warn-compute" @click="compute"><i :class="busy === 'cw-compute' ? 'ri-loader-4-line spin' : 'ri-calculator-line'"></i>{{ warn ? $t('重新计算') : $t('计算预警') }}</button>
          <span v-if="!canCompute" class="ss-muted">{{ $t('先在第 1 步导入学生名单和课程成绩') }}</span>
        </div>
        <p v-if="warn?.stale" class="ss-note warn"><i class="ri-alert-line"></i>{{ $t('{p0}，下面的结果已经过期，请重新计算', { p0: warn.staleReason || $t('数据或规则已经改过') }) }}</p>
        <template v-if="warn">
          <div class="ss-kpis">
            <div class="ss-kpi"><small>{{ $t('学生') }}</small><strong>{{ warn.summary.students }}</strong></div>
            <div v-for="lv in LEVELS" :key="lv" class="ss-kpi" :class="`lv-${lv}`"><small>{{ levelLabel(lv) }}</small><strong>{{ warn.summary.byLevel[lv] }}</strong></div>
          </div>
          <p v-if="warn.summary.unknownStudents.length" class="ss-note warn"><i class="ri-alert-line"></i>{{ $t('{n} 个学号在成绩或考勤里有、名单里没有，已按成绩表里的姓名计算：{p0}', { n: warn.summary.unknownStudents.length, p0: warn.summary.unknownStudents.slice(0, 8).join('、') }) }}</p>
          <p v-if="warn.summary.noAttendance" class="ss-note"><i class="ri-information-line"></i>{{ $t('没有考勤数据：本次只按成绩判定') }}</p>
        </template>
      </StepCard>

      <!-- 3 辅导员复核 -->
      <StepCard step-key="cw-review" :index="2" :title="metas[2].title" :hint="metas[2].hint" :runtime="runtime['cw-review']" :is-current="currentKey === 'cw-review'">
        <template v-if="warn && !warn.stale">
          <div class="ca-filter">
            <button v-for="f in REVIEW_FILTERS" :key="f.key" type="button" :class="{ on: rf === f.key }" @click="rf = f.key">{{ f.label }}</button>
            <select v-model="classFilter" class="ca-sel"><option value="">{{ $t('全部班级') }}</option><option v-for="c in classes" :key="c" :value="c">{{ c }}</option></select>
            <button type="button" class="ss-btn sm" :disabled="!!busy || !shownPending.length" data-test="ca-warn-confirm-all" @click="reviewMany(shownPending.map((x) => x.studentId), 'confirmed')">{{ $t('确认列表中待复核的 {n} 人', { n: shownPending.length }) }}</button>
          </div>
          <div class="ss-table-wrap tall">
            <table class="ss-table">
              <thead><tr><th>{{ $t('学生') }}</th><th>{{ $t('班级') }}</th><th>{{ $t('计算级别') }}</th><th>{{ $t('依据') }}</th><th>{{ $t('复核') }}</th><th>{{ $t('备注') }}</th></tr></thead>
              <tbody>
                <tr v-for="x in shown" :key="x.studentId">
                  <td>{{ x.name }}<br><small class="ss-muted">{{ x.studentId }}</small></td>
                  <td>{{ x.className || '—' }}</td>
                  <td><span class="ss-chip" :class="levelClass(x.level)">{{ x.level ? levelLabel(x.level) : '' }}</span></td>
                  <td class="ca-wrap">{{ x.basis.join($t('；')) }}<small v-if="x.failed.length" class="ss-muted"><br>{{ x.failed.map((f) => `${f.course} ${f.score}`).join('、') }}</small></td>
                  <td>
                    <div class="ca-review">
                      <span class="ss-chip" :class="statusOf(x) === 'confirmed' ? 'ok' : statusOf(x) === 'dismissed' ? '' : 'warn'">{{ reviewLabel(statusOf(x)) }}</span>
                      <select :value="reviewOf(x)?.level || ''" :title="$t('调整级别')" @change="(e) => reviewMany([x.studentId], 'confirmed', ((e.target as HTMLSelectElement).value || null) as any)">
                        <option value="">{{ $t('按计算') }}</option>
                        <option v-for="lv in LEVELS" :key="lv" :value="lv">{{ levelLabel(lv) }}</option>
                      </select>
                      <button type="button" class="ss-btn sm" :disabled="!!busy" @click="reviewMany([x.studentId], 'confirmed')">{{ $t('确认') }}</button>
                      <button type="button" class="ss-btn sm ghost" :disabled="!!busy" @click="reviewMany([x.studentId], 'dismissed')">{{ $t('不预警') }}</button>
                    </div>
                  </td>
                  <td><input class="ca-note" :value="reviewOf(x)?.note || ''" :placeholder="$t('可选')" @change="(e) => reviewMany([x.studentId], statusOf(x) === 'pending' ? 'confirmed' : statusOf(x), undefined, (e.target as HTMLInputElement).value)" /></td>
                </tr>
              </tbody>
            </table>
          </div>
          <p class="ss-muted">{{ $t('共 {a} 人预警，待复核 {b} 人', { a: warned.length, b: pending }) }}</p>
        </template>
        <p v-else class="ss-muted">{{ $t('先完成第 2 步计算') }}</p>
      </StepCard>

      <!-- 4 谈话提纲与通知 -->
      <StepCard step-key="cw-notice" :index="3" :title="metas[3].title" :hint="metas[3].hint" :runtime="runtime['cw-notice']" :is-current="currentKey === 'cw-notice'" :retry="noticeError ? writeNotices : undefined">
        <div class="ss-actions">
          <label class="ca-check"><input v-model="useModel" type="checkbox" />{{ $t('用大模型写（不勾就用规则模板）') }}</label>
          <button type="button" class="ss-btn primary" :disabled="!!busy || !confirmedCount" data-test="ca-warn-notices" @click="writeNotices"><i :class="busy === 'cw-notice' ? 'ri-loader-4-line spin' : 'ri-quill-pen-line'"></i>{{ $t('为已确认的 {n} 人生成', { n: confirmedCount }) }}</button>
        </div>
        <p class="ss-note info"><i class="ri-shield-user-line"></i>{{ $t('发给模型的只有匿名事实（课程、分数、学分、缺勤），不发姓名、学号、班级；模型写的数字和事实对不上就改用模板。') }}</p>
        <p v-if="noticeProgress" class="ss-note info"><i class="ri-loader-4-line spin"></i>{{ noticeProgress }}</p>
        <div v-if="noticeList.length" class="ca-notices">
          <details v-for="x in noticeList" :key="x.studentId" class="ca-notice">
            <summary><b>{{ x.name }}</b> <span class="ss-chip" :class="levelClass(effective(x))">{{ levelLabel(effective(x)!) }}</span> <span class="ss-chip" :class="warn!.notices[x.studentId].by === 'model' ? 'brand' : ''">{{ warn!.notices[x.studentId].by === 'model' ? $t('模型撰写') : $t('规则模板') }}</span></summary>
            <h4>{{ $t('谈话提纲') }}</h4>
            <p class="ca-pre">{{ warn!.notices[x.studentId].outline }}</p>
            <h4>{{ $t('学生通知') }}</h4>
            <p class="ca-pre">{{ fill(warn!.notices[x.studentId].notice, x.name) }}</p>
          </details>
        </div>
      </StepCard>

      <!-- 5 导出与发送 -->
      <StepCard step-key="cw-export" :index="4" :title="metas[4].title" :hint="metas[4].hint" :runtime="runtime['cw-export']" :is-current="currentKey === 'cw-export'">
        <div class="ss-actions">
          <button type="button" class="ss-btn primary" :disabled="!!busy || !warn || warn.stale || pending > 0" data-test="ca-warn-export" @click="exportAll"><i :class="busy === 'cw-export' ? 'ri-loader-4-line spin' : 'ri-file-excel-2-line'"></i>{{ $t('导出预警名单与通知') }}</button>
          <span v-if="pending" class="ss-muted">{{ $t('还有 {n} 人没复核，复核完才能导出', { n: pending }) }}</span>
        </div>
        <p v-if="warn?.exportDir" class="ss-file-out"><i class="ri-folder-check-line"></i><code>{{ warn.exportDir }}</code><button type="button" class="ss-link" @click="openPath(warn.exportDir!)">{{ $t('打开文件夹') }}</button></p>
        <div class="ca-mail">
          <div class="ss-actions">
            <button type="button" class="ss-btn" :disabled="!!busy || !warn || warn.stale || !confirmedCount" @click="loadPlan"><i class="ri-mail-settings-line"></i>{{ $t('按辅导员预览邮件') }}</button>
            <span class="ss-muted">{{ $t('每位辅导员一封，附本人学生的名单、依据、提纲与通知') }}</span>
          </div>
          <template v-if="plan">
            <div class="ss-table-wrap">
              <table class="ss-table">
                <thead><tr><th>{{ $t('辅导员') }}</th><th>{{ $t('邮箱') }}</th><th class="num">{{ $t('学生') }}</th><th>{{ $t('结果') }}</th></tr></thead>
                <tbody>
                  <tr v-for="g in plan" :key="g.counselor + g.to" :class="{ bad: !g.to }">
                    <td>{{ g.counselor }}</td><td>{{ g.to || $t('没有邮箱，不发送') }}</td><td class="num">{{ g.students }}</td>
                    <td>{{ sendResult(g.to) }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <label class="ca-check"><input v-model="mailConfirm" type="checkbox" data-test="ca-warn-mail-confirm" />{{ $t('我已核对收件人和名单，确认发送') }}</label>
            <div class="ss-actions"><button type="button" class="ss-btn primary" :disabled="!!busy || !mailConfirm || !plan.some((g) => g.to)" @click="sendMail"><i :class="busy === 'cw-mail' ? 'ri-loader-4-line spin' : 'ri-send-plane-line'"></i>{{ $t('发送') }}</button></div>
          </template>
        </div>
      </StepCard>
    </div>
  </div>
</template>

<script setup lang="ts">
/** 学业预警：导入数据 → 计算预警 → 辅导员复核 → 谈话提纲与通知 → 导出与发送 */
import { computed, reactive, ref, watch } from 'vue';
import { CA_DATASET_ROLES, type CaDatasetKey, type CaLevel, type CaReviewStatus, type CaStudentResult, type CaWarnRules } from '@totalclaw/ipc-contracts';
import { useNotificationStore } from '../../stores/notification';
import { t as i18nT } from '../../i18n';
import StepCard from '../service-settlement/StepCard.vue';
import StickyProgress from '../service-settlement/StickyProgress.vue';
import {
  EXCEL_RE, ca, caProgress, caResults, caState, datasetHint, datasetLabel, droppedPaths, errorMessage, levelClass, levelLabel, openPath,
  refreshState, reviewLabel, scrollToStep, type StepMeta, type StepRuntime,
} from './shared';

const notif = useNotificationStore();
const DATASETS: CaDatasetKey[] = ['roster', 'grades', 'attendance'];
const LEVELS: CaLevel[] = ['red', 'orange', 'yellow'];
const busy = ref('');
const errors = ref<Record<string, string>>({});
const roleLabels = ref<Record<string, string>>({});
const useModel = ref(true);
const plan = ref<Array<{ counselor: string; to: string; students: number }> | null>(null);
const sent = ref<Record<string, { ok: boolean; message?: string }>>({});
const mailConfirm = ref(false);
const rf = ref<'pending' | 'all' | 'confirmed' | 'dismissed'>('pending');
const classFilter = ref('');

const metas: StepMeta[] = [
  { key: 'cw-data', title: i18nT('导入数据'), hint: i18nT('学生名单、课程成绩、考勤三张表，Excel 或 CSV，列名自动认') },
  { key: 'cw-compute', title: i18nT('计算预警'), hint: i18nT('按规则算每人的不及格门数、学分和缺勤率，分红橙黄三级，每人附依据') },
  { key: 'cw-review', title: i18nT('辅导员复核'), hint: i18nT('逐人确认、调整级别或标为不预警；没复核完不能导出') },
  { key: 'cw-notice', title: i18nT('谈话提纲与通知'), hint: i18nT('为已确认的学生写谈话提纲和通知草稿，数字全部取自计算结果') },
  { key: 'cw-export', title: i18nT('导出与发送'), hint: i18nT('导出名单与通知文件；按辅导员发邮件要你确认') },
];

const warn = computed(() => caState.value?.warn || null);
const ds = (k: CaDatasetKey) => caState.value?.datasets[k] || null;
const canCompute = computed(() => !!ds('grades')?.loaded);
const warned = computed(() => caResults.value.filter((x) => x.level));
const reviewOf = (x: CaStudentResult) => warn.value?.reviews[x.studentId];
const statusOf = (x: CaStudentResult): CaReviewStatus => reviewOf(x)?.status || 'pending';
const effective = (x: CaStudentResult): CaLevel | null => (reviewOf(x)?.level || x.level) ?? null;
const pending = computed(() => (warn.value && !warn.value.stale ? warned.value.filter((x) => statusOf(x) === 'pending').length : 0));
const confirmedCount = computed(() => (warn.value && !warn.value.stale ? warned.value.filter((x) => statusOf(x) === 'confirmed').length : 0));
const classes = computed(() => [...new Set(warned.value.map((x) => x.className).filter(Boolean))].sort());
const shown = computed(() => warned.value.filter((x) => (rf.value === 'all' || statusOf(x) === rf.value) && (!classFilter.value || x.className === classFilter.value)));
const shownPending = computed(() => shown.value.filter((x) => statusOf(x) === 'pending'));
const noticeList = computed(() => (warn.value ? warned.value.filter((x) => warn.value!.notices[x.studentId] && statusOf(x) === 'confirmed') : []));
const noticeProgress = computed(() => (caProgress.value.scope === 'notice' ? caProgress.value.message : ''));
const noticeError = computed(() => errors.value['cw-notice'] || '');

const REVIEW_FILTERS = [
  { key: 'pending' as const, label: i18nT('待复核') },
  { key: 'confirmed' as const, label: i18nT('已确认') },
  { key: 'dismissed' as const, label: i18nT('不预警') },
  { key: 'all' as const, label: i18nT('全部') },
];

// 规则编辑（缺勤率界面用百分数）
const rules = reactive<CaWarnRules>(JSON.parse(JSON.stringify(caState.value?.settings.warnRules || { passScore: 60, red: { failCourses: 4, failCredits: 12, absenceRate: 1 / 3 }, orange: { failCourses: 2, failCredits: 6, absenceRate: 0.2 }, yellow: { failCourses: 1, failCredits: 1, absenceRate: 0.1 } })));
const rulePct = reactive<Record<CaLevel, number>>({ red: 0, orange: 0, yellow: 0 });
function loadRules(src: CaWarnRules | undefined): void {
  if (!src) return;
  Object.assign(rules, JSON.parse(JSON.stringify(src)));
  for (const lv of LEVELS) rulePct[lv] = Math.round(src[lv].absenceRate * 1000) / 10;
}
// 按内容 watch：状态每次刷新都会换对象，按对象 watch 会把正在改的规则冲掉
watch(() => JSON.stringify(caState.value?.settings.warnRules || null), () => loadRules(caState.value?.settings.warnRules), { immediate: true });
const rulesPayload = (): CaWarnRules => ({
  passScore: Number(rules.passScore) || 0,
  red: { ...rules.red, absenceRate: (Number(rulePct.red) || 0) / 100 },
  orange: { ...rules.orange, absenceRate: (Number(rulePct.orange) || 0) / 100 },
  yellow: { ...rules.yellow, absenceRate: (Number(rulePct.yellow) || 0) / 100 },
});
const rulesDirty = computed(() => JSON.stringify(rulesPayload()) !== JSON.stringify(caState.value?.settings.warnRules));

const runtime = computed<Record<string, StepRuntime>>(() => {
  const err = errors.value;
  const w = warn.value;
  const live = !!w && !w.stale;
  const noticed = live ? noticeList.value.length : 0;
  return {
    'cw-data': ['cw-data', 'cw-demo'].includes(busy.value) ? { state: 'running' }
      : err['cw-data'] ? { state: 'failed', error: err['cw-data'] }
        : DATASETS.some((k) => ds(k) && !ds(k)!.loaded) ? { state: 'failed', error: i18nT('有表格的必填列没认出来，请在下面指定') }
          : canCompute.value ? { state: 'done', summary: DATASETS.filter((k) => ds(k)?.loaded).map((k) => `${datasetLabel(k)} ${ds(k)!.count}`).join(' · ') } : { state: 'todo' },
    'cw-compute': busy.value === 'cw-compute' ? { state: 'running' }
      : err['cw-compute'] ? { state: 'failed', error: err['cw-compute'] }
        : live ? { state: 'done', summary: i18nT('{a} 名学生中预警 {b} 人：红 {r} · 橙 {o} · 黄 {y}', { a: w!.summary.students, b: w!.summary.warned, r: w!.summary.byLevel.red, o: w!.summary.byLevel.orange, y: w!.summary.byLevel.yellow }) } : { state: 'todo' },
    'cw-review': busy.value === 'cw-review' ? { state: 'running' }
      : err['cw-review'] ? { state: 'failed', error: err['cw-review'] }
        : live && warned.value.length && !pending.value ? { state: 'done', summary: i18nT('确认 {a} 人，不预警 {b} 人', { a: confirmedCount.value, b: warned.value.length - confirmedCount.value }) }
          : live && !warned.value.length ? { state: 'skipped' } : { state: 'todo' },
    'cw-notice': busy.value === 'cw-notice' ? { state: 'running', kind: 'llm', progressAt: Date.now() }
      : err['cw-notice'] ? { state: 'failed', error: err['cw-notice'] }
        : live && confirmedCount.value && noticed >= confirmedCount.value ? { state: 'done', summary: i18nT('{n} 份', { n: noticed }) }
          : live && !confirmedCount.value && warned.value.length && !pending.value ? { state: 'skipped' } : { state: 'todo' },
    'cw-export': ['cw-export', 'cw-mail'].includes(busy.value) ? { state: 'running' }
      : err['cw-export'] || err['cw-mail'] ? { state: 'failed', error: err['cw-export'] || err['cw-mail'] }
        : live && w!.exportedAt ? { state: 'done', summary: i18nT('已导出到 {p0}', { p0: w!.exportDir || '' }) } : { state: 'todo' },
  };
});
const currentKey = computed(() => metas.find((m) => !['done', 'skipped'].includes(runtime.value[m.key].state))?.key || metas[metas.length - 1].key);
const jump = (key: string): void => { void scrollToStep(key); };

async function act<T>(key: string, fn: () => Promise<T>): Promise<T | null> {
  busy.value = key;
  errors.value = { ...errors.value, [key]: '' };
  try {
    const r = await fn();
    await refreshState();
    return r;
  } catch (e) {
    errors.value = { ...errors.value, [key]: errorMessage(e) };
    notif.error(errorMessage(e));
    return null;
  } finally { busy.value = ''; }
}

const roleName = (r: string): string => roleLabels.value[r] || r;
const rolesOf = (k: CaDatasetKey): string[] => [...CA_DATASET_ROLES[k].required, ...CA_DATASET_ROLES[k].optional];
const isRequired = (k: CaDatasetKey, r: string): boolean => CA_DATASET_ROLES[k].required.includes(r);

async function importFile(k: CaDatasetKey, path: string, mapping?: Record<string, string>): Promise<void> {
  await act('cw-data', () => ca('warn.import', { dataset: k, path, sheet: ds(k)?.path === path ? ds(k)?.sheetName : undefined, mapping: mapping || null }));
}
async function pick(k: CaDatasetKey): Promise<void> {
  const paths = await ca<string[]>('files.pick', { kind: 'excel', multi: false, title: datasetLabel(k) }).catch(() => []);
  if (paths[0]) await importFile(k, paths[0]);
}
function onDrop(k: CaDatasetKey, e: DragEvent): void {
  const p = droppedPaths(e, EXCEL_RE)[0];
  if (p) void importFile(k, p);
}
function remap(k: CaDatasetKey, role: string, header: string): void {
  const m = ds(k);
  if (!m) return;
  const mapping = { ...m.mapping };
  if (header) mapping[role] = header; else delete mapping[role];
  void importFile(k, m.path, mapping);
}
async function clear(k: CaDatasetKey): Promise<void> { await act('cw-data', () => ca('warn.clear', { dataset: k })); }
async function loadDemo(): Promise<void> {
  const r = await act('cw-demo', () => ca<{ students: number }>('warn.demo'));
  if (r) notif.success(i18nT('已载入示例数据：{n} 名学生', { n: r.students }));
}
async function saveRules(): Promise<void> { await act('cw-compute', () => ca('warn.rules', { rules: rulesPayload() })); }
function resetRules(): void { loadRules(caState.value?.defaults.warnRules); }
async function compute(): Promise<void> {
  if (rulesDirty.value) await ca('warn.rules', { rules: rulesPayload() }).catch(() => {});
  const r = await act('cw-compute', () => ca('warn.compute'));
  if (r) { rf.value = 'pending'; void scrollToStep('cw-review'); }
}
async function reviewMany(ids: string[], status: CaReviewStatus, level?: CaLevel | null, note?: string): Promise<void> {
  if (!ids.length) return;
  await act('cw-review', () => ca('warn.review', { ids, status, level, note }));
}
async function writeNotices(): Promise<void> {
  const r = await act('cw-notice', () => ca<{ done: number; byModel: number }>('warn.notices', { useModel: useModel.value }));
  if (r) notif.success(i18nT('已生成 {a} 份，其中模型撰写 {b} 份', { a: r.done, b: r.byModel }));
}
async function exportAll(): Promise<void> {
  const r = await act('cw-export', () => ca<{ dir: string; notices: number }>('warn.export'));
  if (r) notif.success(i18nT('已导出，学生通知 {n} 份', { n: r.notices }));
}
async function loadPlan(): Promise<void> {
  sent.value = {};
  mailConfirm.value = false;
  plan.value = await act('cw-mail', () => ca('warn.mailPlan'));
}
async function sendMail(): Promise<void> {
  const r = await act('cw-mail', () => ca<Array<{ to: string; ok: boolean; message?: string }>>('warn.mailSend', { confirm: mailConfirm.value }));
  if (r) {
    sent.value = Object.fromEntries(r.map((x) => [x.to, { ok: x.ok, message: x.message }]));
    mailConfirm.value = false;
    const okN = r.filter((x) => x.ok).length;
    if (okN === r.length) notif.success(i18nT('已发送 {n} 封', { n: okN })); else notif.warn(i18nT('发送 {a} 封，失败 {b} 封', { a: okN, b: r.length - okN }));
  }
}
function sendResult(to: string): string {
  const r = sent.value[to];
  if (!r) return '—';
  return r.ok ? i18nT('已发送') : i18nT('失败：{p0}', { p0: r.message || '' });
}
const fill = (text: string, name: string): string => String(text || '').split('[STUDENT]').join(name);

void ca<Record<string, string>>('warn.roles').then((r) => { roleLabels.value = r; }).catch(() => {});
</script>

<style scoped>
.ca-slots { display: grid; gap: 10px; grid-template-columns: repeat(auto-fit, minmax(min(100%, 280px), 1fr)); }
.ca-slot { border: 1px solid var(--color-border); border-radius: 12px; padding: 12px; display: grid; gap: 8px; align-content: start; }
.ca-slot.ok { border-color: color-mix(in srgb, var(--color-success) 45%, var(--color-border)); }
.ca-slot.bad { border-color: color-mix(in srgb, var(--color-danger) 45%, var(--color-border)); }
.ca-slot header { display: flex; gap: 6px; align-items: center; }
.ca-file { margin: 0; font-size: 12.5px; display: flex; gap: 6px; align-items: center; }
.ca-map { display: grid; gap: 6px; margin-top: 6px; }
.ca-map em { color: var(--color-danger); font-style: normal; }
.ca-rules summary { cursor: pointer; font-size: 12.5px; color: var(--color-text-secondary); }
.ca-rules .ss-table input { width: 80px; }
.ss-kpi.lv-red strong { color: var(--color-danger); }
.ss-kpi.lv-orange strong { color: var(--color-warning); }
.ss-kpi.lv-yellow strong { color: var(--color-brand); }
.ca-sel { height: 28px; border: 1px solid var(--color-border); border-radius: 8px; padding: 0 6px; font: inherit; font-size: 12px; background: var(--color-bg-card); color: var(--color-text); }
.ca-review { display: flex; gap: 4px; align-items: center; }
.ca-note { width: 140px; }
.ca-check { display: inline-flex; gap: 6px; align-items: center; font-size: 12.5px; }
.ca-notices { display: grid; gap: 6px; }
.ca-notice { border: 1px solid var(--color-border); border-radius: 10px; padding: 8px 12px; }
.ca-notice summary { cursor: pointer; display: flex; gap: 6px; align-items: center; }
.ca-notice h4 { margin: 8px 0 4px; font-size: 12.5px; color: var(--color-text-secondary); }
.ca-mail { display: grid; gap: 8px; border-top: 1px dashed var(--color-border); padding-top: 10px; }
</style>
