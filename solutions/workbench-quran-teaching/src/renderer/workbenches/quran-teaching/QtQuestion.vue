<template>
  <article class="qt-q" :class="{ unverified: !q.verified }" :style="{ '--i': index }">
    <header class="qt-q__head">
      <span class="qt-q__no">Q{{ index + 1 }}</span>
      <span class="qt-chip info">{{ typeLabel(q.type) }}</span>
      <span class="qt-chip">{{ difficultyLabel(q.difficulty) }}</span>
      <span class="qt-chip">{{ dimLabel(q.dimension) }}</span>
      <span class="qt-layer l3" :title="$t('第三层 · AI 生成材料')"><i class="ri-sparkling-2-line"></i>AI</span>
      <span v-if="q.reviewStatus === 'confirmed'" class="qt-chip ok"><i class="ri-shield-check-line"></i>{{ $t('教师已确认') }}</span>
      <span v-else class="qt-chip warn">{{ $t('待教师确认') }}</span>
      <span class="grow" style="flex:1"></span>
      <span v-if="mode === 'answer' && graded" class="qt-chip" :class="correct ? 'ok' : 'bad'"><i :class="correct ? 'ri-check-line' : 'ri-close-line'"></i>{{ correct ? $t('正确') : $t('错误') }}</span>
      <slot name="tools"></slot>
    </header>

    <div v-if="editing" class="qt-field"><span>{{ $t('题干（选项不可编辑：选项 = 锁定经文 / 批准释义）') }}</span><textarea v-model="draftStem" rows="3"></textarea></div>
    <div v-if="editing" class="qt-field"><span>{{ $t('解析（仅基于批准资料）') }}</span><textarea v-model="draftExplanation" rows="2"></textarea></div>
    <p v-else class="qt-q__stem" :dir="stemDir"><template v-for="(part, i) in stemParts" :key="i"><span v-if="part.ar" class="qt-ar" lang="ar">{{ part.text }}</span><template v-else>{{ part.text }}</template></template></p>

    <!-- mcq / fill / concept -->
    <div v-if="q.type === 'mcq' || q.type === 'fill' || q.type === 'concept'" class="qt-opts">
      <label v-for="(o, i) in q.options" :key="i" class="qt-opt" :class="optClass(i)" @click="pick(i)">
        <span class="qt-opt__key">{{ String.fromCharCode(65 + i) }}</span>
        <span class="qt-opt__text" :class="{ ar: isAr(o) }">{{ o }}</span>
        <i v-if="showAnswer && i === q.answer" class="ri-check-double-line" style="color:var(--color-success)"></i>
      </label>
    </div>

    <!-- order -->
    <div v-else-if="q.type === 'order'" class="qt-order">
      <div v-for="(idx, pos) in orderSeq" :key="pos" class="qt-order__item" :class="orderClass(pos)">
        <span class="pos">{{ pos + 1 }}</span>
        <span class="qt-opt__text" :class="{ ar: isAr(q.options[idx]) }">{{ q.options[idx] }}</span>
        <span v-if="mode === 'answer' && !graded" style="display:inline-flex;gap:4px">
          <button type="button" class="qt-btn xs" :disabled="pos === 0" @click="move(pos, -1)"><i class="ri-arrow-up-s-line"></i></button>
          <button type="button" class="qt-btn xs" :disabled="pos === orderSeq.length - 1" @click="move(pos, 1)"><i class="ri-arrow-down-s-line"></i></button>
        </span>
        <span v-else-if="showAnswer" class="qt-muted" style="direction:ltr">{{ $t('应在第 {n} 位', { n: (q.answer as number[]).indexOf(idx) + 1 }) }}</span>
      </div>
    </div>

    <!-- match -->
    <div v-else-if="q.type === 'match'" class="qt-match">
      <div v-for="(l, i) in q.left || []" :key="i" class="qt-match__row" :class="matchClass(i)">
        <span class="qt-opt__text" :class="{ ar: isAr(l) }">{{ l }}</span>
        <i class="ri-arrow-left-right-line qt-muted"></i>
        <select v-if="mode === 'answer' && !graded" class="qt-select" :value="matchSel[i]" @change="setMatch(i, Number(($event.target as HTMLSelectElement).value))">
          <option :value="-1">{{ $t('请选择') }}</option>
          <option v-for="(o, j) in q.options" :key="j" :value="j">{{ o }}</option>
        </select>
        <span v-else class="qt-opt__text" :class="{ ar: isAr(q.options[matchSel[i] >= 0 ? matchSel[i] : (q.answer as number[])[i]]) }">
          {{ matchSel[i] >= 0 ? q.options[matchSel[i]] : (showAnswer ? q.options[(q.answer as number[])[i]] : '—') }}
          <small v-if="showAnswer && matchSel[i] >= 0 && matchSel[i] !== (q.answer as number[])[i]" class="qt-muted"> → {{ q.options[(q.answer as number[])[i]] }}</small>
        </span>
      </div>
    </div>

    <div v-if="mode === 'answer' && !graded" class="qt-actions end">
      <button type="button" class="qt-btn sm primary" :disabled="!canSubmit" @click="submit"><i class="ri-send-plane-line"></i>{{ $t('提交本题') }}</button>
    </div>

    <div v-if="showAnswer" class="qt-explain"><i class="ri-lightbulb-line"></i> {{ q.explanation }}</div>

    <footer class="qt-q__foot">
      <span><i class="ri-map-pin-line"></i> {{ $t('来源') }}: <bdi dir="ltr">{{ q.sourceRefs.map(refLabel).join(', ') }}</bdi></span>
      <span v-if="q.conceptLabel"><i class="ri-price-tag-3-line"></i> {{ q.conceptLabel }}</span>
      <span v-if="q.materialIds.length" class="qt-layer l2"><i class="ri-shield-check-line"></i>L2 × {{ q.materialIds.length }}</span>
      <span class="qt-chip" :class="q.verified ? 'ok' : 'bad'" :title="q.verifyNote"><i :class="q.verified ? 'ri-checkbox-circle-line' : 'ri-error-warning-line'"></i>{{ q.verified ? $t('一致性检查通过') : $t('未通过校验，不下发') }}</span>
      <span class="grow"></span>
      <button v-if="traceable" type="button" class="qt-btn xs ghost" @click="sourceOpen = !sourceOpen"><i class="ri-search-eye-line"></i>{{ sourceOpen ? $t('收起来源') : $t('查看来源') }}</button>
      <template v-if="mode === 'review'">
        <button v-if="!editing" type="button" class="qt-btn xs" @click="startEdit"><i class="ri-edit-line"></i>{{ $t('编辑') }}</button>
        <template v-else>
          <button type="button" class="qt-btn xs primary" @click="saveEdit"><i class="ri-save-line"></i>{{ $t('保存') }}</button>
          <button type="button" class="qt-btn xs ghost" @click="editing = false">{{ $t('取消') }}</button>
        </template>
        <button v-if="q.reviewStatus !== 'confirmed'" type="button" class="qt-btn xs" @click="$emit('confirm', q.id)"><i class="ri-check-line"></i>{{ $t('确认') }}</button>
        <button type="button" class="qt-btn xs" @click="$emit('regenerate', q.id)"><i class="ri-refresh-line"></i>{{ $t('重新生成') }}</button>
        <button type="button" class="qt-btn xs danger" @click="$emit('remove', q.id)"><i class="ri-delete-bin-line"></i>{{ $t('删除') }}</button>
      </template>
    </footer>

    <div v-if="sourceOpen" class="qt-source">
      <div class="qt-source__title"><i class="ri-book-mark-line"></i>{{ $t('来源追溯（验收 06）') }}</div>
      <div v-for="v in sourceVerses" :key="v.ref" class="qt-verse"><div class="qt-ar sm" lang="ar">{{ v.arabic }}</div><span class="qt-verse__ref">{{ v.ref }}</span></div>
      <div v-if="sourceMaterials.length" class="qt-tags">
        <span v-for="m in sourceMaterials" :key="m.id" class="qt-chip" :title="m.source[lang]"><span class="qt-layer l2">L2</span>{{ m.title[lang] }}{{ m.word ? ` · ${m.word}` : '' }}</span>
      </div>
      <p class="qt-muted"><i class="ri-shield-check-line"></i> {{ q.verifyNote }}</p>
    </div>
  </article>
</template>

<script setup lang="ts">
/**
 * 题目卡：review 模式（教师看答案 / 编辑 / 确认 / 重生成 / 删除 / 查来源）
 *       answer 模式（学生作答：选择 / 填空 / 排序 / 匹配，提交后判分并显示解析）。
 */
import { computed, ref, watch } from 'vue';
import type { QuranApprovedMaterial, QuranQuestion, QuranVerse } from '@totalclaw/ipc-contracts';
import { type Lang, difficultyLabel, dimLabel, refLabel, typeLabel } from './shared';

const props = defineProps<{
  q: QuranQuestion;
  index: number;
  mode: 'review' | 'answer';
  lang: Lang;
  /** answer 模式：已有作答（预置 / 已提交） */
  given?: number | number[] | null;
  verses?: QuranVerse[];
  materials?: QuranApprovedMaterial[];
  traceable?: boolean;
}>();
const emit = defineEmits<{ (e: 'answer', payload: { id: string; answer: number | number[] }): void; (e: 'edit', payload: { id: string; stem: string; explanation?: string }): void; (e: 'confirm', id: string): void; (e: 'regenerate', id: string): void; (e: 'remove', id: string): void }>();

const isAr = (s: string): boolean => /[؀-ۿ]/.test(s) && !/[一-鿿]/.test(s) && !/[A-Za-z]{3,}/.test(s);
const stemDir = computed(() => (props.lang === 'ar' ? 'rtl' : 'ltr'));
/** 题干里的经文行单独用阿语字体（模板把经文放在换行后） */
const stemParts = computed(() => props.q.stem.split('\n').flatMap((line, i, arr) => { const p = { text: line, ar: isAr(line) }; return i < arr.length - 1 ? [p, { text: '\n', ar: false }] : [p]; }));

const chosen = ref<number>(-1);
const orderSeq = ref<number[]>([]);
const matchSel = ref<number[]>([]);
const graded = ref(false);
const correct = ref(false);

function loadGiven(): void {
  const g = props.given;
  graded.value = false; correct.value = false;
  chosen.value = -1;
  orderSeq.value = props.q.options.map((_, i) => i);
  matchSel.value = (props.q.left || []).map(() => -1);
  if (g === null || g === undefined) return;
  if (typeof g === 'number') chosen.value = g;
  else if (props.q.type === 'order') orderSeq.value = g.length === props.q.options.length ? g.slice() : orderSeq.value;
  else matchSel.value = g.slice();
  graded.value = props.mode === 'answer';
  correct.value = judge();
}
watch(() => [props.q.id, props.given, props.mode], loadGiven, { immediate: true, deep: true });

function judge(): boolean {
  if (typeof props.q.answer === 'number') return chosen.value === props.q.answer;
  const seq = props.q.type === 'order' ? orderSeq.value : matchSel.value;
  return seq.length === props.q.answer.length && props.q.answer.every((v, i) => v === seq[i]);
}
const showAnswer = computed(() => props.mode === 'review' || graded.value);
const canSubmit = computed(() => (typeof props.q.answer === 'number' ? chosen.value >= 0 : props.q.type === 'order' ? true : matchSel.value.every((v) => v >= 0)));

function pick(i: number): void { if (props.mode === 'answer' && !graded.value) chosen.value = i; }
function move(pos: number, delta: number): void { const s = orderSeq.value.slice(); const j = pos + delta; [s[pos], s[j]] = [s[j], s[pos]]; orderSeq.value = s; }
function setMatch(i: number, v: number): void { const s = matchSel.value.slice(); s[i] = v; matchSel.value = s; }
function submit(): void {
  graded.value = true; correct.value = judge();
  emit('answer', { id: props.q.id, answer: typeof props.q.answer === 'number' ? chosen.value : (props.q.type === 'order' ? orderSeq.value.slice() : matchSel.value.slice()) });
}
function optClass(i: number): Record<string, boolean> {
  const isAns = i === props.q.answer;
  return { correct: showAnswer.value && isAns, chosen: chosen.value === i && !showAnswer.value, wrong: showAnswer.value && chosen.value === i && !isAns };
}
function orderClass(pos: number): Record<string, boolean> {
  if (!showAnswer.value) return {};
  const ok = (props.q.answer as number[])[pos] === orderSeq.value[pos];
  return { correct: ok, wrong: !ok };
}
function matchClass(i: number): Record<string, boolean> {
  if (!showAnswer.value || matchSel.value[i] < 0) return {};
  const ok = (props.q.answer as number[])[i] === matchSel.value[i];
  return { correct: ok, wrong: !ok };
}

const editing = ref(false);
const draftStem = ref('');
// 解析也能改：主进程 updateQuestion 一直支持 explanation，之前界面只发了题干，白白少了一个教师控制点
const draftExplanation = ref('');
function startEdit(): void { draftStem.value = props.q.stem; draftExplanation.value = props.q.explanation; editing.value = true; }
function saveEdit(): void { emit('edit', { id: props.q.id, stem: draftStem.value, explanation: draftExplanation.value }); editing.value = false; }

const sourceOpen = ref(false);
const sourceVerses = computed(() => (props.verses || []).filter((v) => props.q.sourceRefs.some((r) => r === v.ref || (/[-–]/.test(r) && inRange(v, r)))));
const sourceMaterials = computed(() => (props.materials || []).filter((m) => props.q.materialIds.includes(m.id)));
function inRange(v: QuranVerse, r: string): boolean { const m = /^(\d+):(\d+)[-–](\d+)$/.exec(r); return !!m && v.chapter === Number(m[1]) && v.verse >= Number(m[2]) && v.verse <= Number(m[3]); }
</script>
