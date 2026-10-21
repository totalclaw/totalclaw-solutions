<template>
  <div class="qt-graph-layout">
    <div class="qt-graph">
      <button type="button" class="qt-btn xs qt-graph__fit" @click="fit"><i class="ri-fullscreen-line"></i>{{ $t('适应视图') }}</button>
      <VueFlow :id="flowId" v-model:nodes="nodes" v-model:edges="edges" :fit-view-on-init="true" :min-zoom="0.2" :max-zoom="2" :nodes-draggable="true" :nodes-connectable="false" :elements-selectable="true" @node-click="onNodeClick">
        <Background :gap="18" />
        <Controls />
        <MiniMap pannable zoomable />
        <template #node-qt="{ data, id }">
          <div class="qt-node" :class="[data.kind, { selected: id === selectedId }]" :title="data.label">
            <template v-if="data.kind === 'question'"><i class="ri-file-list-3-line"></i> {{ $t('{n} 道题', { n: data.label }) }}</template>
            <template v-else-if="data.kind === 'material'"><i class="ri-shield-check-line"></i> {{ $t('{n} 条批准资料', { n: data.label }) }}</template>
            <template v-else>{{ data.label }}</template>
            <span v-if="data.sub && data.kind !== 'question'" class="qt-node__sub">{{ data.sub }}</span>
            <span v-if="data.mastery" class="qt-node__mastery" :title="$t('5 名学生掌握率')"><i v-for="s in students" :key="s.id" :class="masteryClass(data.mastery[s.id])"></i></span>
          </div>
        </template>
      </VueFlow>
    </div>
    <aside class="qt-panel">
      <template v-if="selected">
        <header class="qt-panel__head"><strong><i class="ri-focus-3-line"></i>{{ kindLabelOf(selected.kind) }}</strong><span class="grow"></span><span class="qt-chip">{{ selected.refs.length }} {{ $t('节') }}</span></header>
        <p class="qt-q__stem" :class="{ 'qt-ar': selected.kind === 'verse' }">{{ selected.label }}</p>
        <div class="qt-verse-list" style="max-height:200px">
          <div v-for="v in linkedVerses" :key="v.ref" class="qt-verse"><div class="qt-ar sm" lang="ar">{{ v.arabic }}</div><span class="qt-verse__ref">{{ v.ref }}</span></div>
        </div>
        <div v-if="linkedMaterials.length">
          <div class="qt-muted" style="margin-bottom:4px"><span class="qt-layer l2">L2</span> {{ $t('批准教学资料') }}</div>
          <div class="qt-tags"><span v-for="m in linkedMaterials" :key="m.id" class="qt-chip" :title="m.source[lang]">{{ m.title[lang] }}{{ m.word ? ` · ${m.word}` : '' }}</span></div>
        </div>
        <div v-if="linkedQuestions.length">
          <div class="qt-muted" style="margin-bottom:4px"><span class="qt-layer l3">L3</span> {{ $t('相关题目') }}</div>
          <div class="qt-tags"><span v-for="q in linkedQuestions" :key="q.id" class="qt-chip info" :title="q.stem">{{ typeLabel(q.type) }} · <bdi dir="ltr">{{ refLabel(q.sourceRefs[0] || '') }}</bdi></span></div>
        </div>
        <div v-if="selected.mastery">
          <div class="qt-muted" style="margin-bottom:4px">{{ $t('5 名学生掌握情况') }}</div>
          <div class="qt-dims">
            <div v-for="s in students" :key="s.id" class="qt-dim" :class="pctClass(Math.round((selected.mastery[s.id] ?? 0) * 100))">
              <span>{{ s.name[lang] }}</span><span class="bar"><span :style="{ width: `${Math.round((selected.mastery[s.id] ?? 0) * 100)}%` }"></span></span><span class="pct">{{ selected.mastery[s.id] === undefined ? '—' : `${Math.round(selected.mastery[s.id] * 100)}%` }}</span>
            </div>
          </div>
        </div>
        <!-- 只有教学单元与概念节点会算掌握率；经文 / 题目 / 资料节点本来就不算，别说成「尚无数据」误导 -->
        <p v-else-if="selected && selected.kind !== 'unit' && selected.kind !== 'concept'" class="qt-note">{{ $t('这类节点不统计掌握率：掌握率按教学单元与概念计算，点这两类节点可以看到') }}</p>
        <p v-else class="qt-note">{{ $t('尚无答题数据：生成试卷并载入 5 名学生后，这里显示掌握率') }}</p>
      </template>
      <div v-else class="qt-empty"><i class="ri-cursor-line"></i>{{ $t('点击任一节点，查看关联章/节、批准资料、相关题目与 5 名学生掌握情况') }}</div>
      <div class="qt-legend"><span><i style="background:var(--qt-teal)"></i>{{ $t('章') }}</span><span><i style="border-color:var(--qt-gold)"></i>{{ $t('教学单元') }}</span><span><i style="border-color:var(--qt-teal)"></i>{{ $t('概念') }}</span><span><i></i>{{ $t('经文') }}</span><span><i style="border-style:dashed"></i>{{ $t('题目') }}</span></div>
    </aside>
  </div>
</template>

<script setup lang="ts">
/** 理解图：vue-flow 分层布局（章 → 单元 → 概念 → 经文/题目）；点节点右栏显示关联内容与 5 名学生掌握率。 */
import { computed, nextTick, ref, watch } from 'vue';
import { VueFlow, MarkerType, useVueFlow, type Node, type Edge } from '@vue-flow/core';
import { Background } from '@vue-flow/background';
import { Controls } from '@vue-flow/controls';
import { MiniMap } from '@vue-flow/minimap';
import type { QuranApprovedMaterial, QuranGraph, QuranGraphNode, QuranQuestion, QuranStudent, QuranVerse } from '@totalclaw/ipc-contracts';
import { t as i18nT } from '../../i18n';
import { type Lang, pctClass, refLabel, typeLabel } from './shared';

const props = defineProps<{ graph: QuranGraph; verses: QuranVerse[]; materials: QuranApprovedMaterial[]; questions: QuranQuestion[]; students: QuranStudent[]; lang: Lang }>();

const flowId = `qt-graph-${Math.random().toString(36).slice(2, 8)}`;
const { fitView } = useVueFlow({ id: flowId });
function fit(): void { try { void fitView({ padding: 0.15, duration: 300 }); } catch { /* 实例未就绪 */ } }
const nodes = ref<Node[]>([]);
const edges = ref<Edge[]>([]);
const selectedId = ref('');

function layout(g: QuranGraph): void {
  const byLevel = new Map<number, QuranGraphNode[]>();
  for (const n of g.nodes) { const l = byLevel.get(n.level) || []; l.push(n); byLevel.set(n.level, l); }
  const colX = [0, 320, 640, 960];
  const out: Node[] = [];
  for (const [level, list] of byLevel) {
    const gap = level === 3 ? 92 : level === 2 ? 76 : 96;
    const total = (list.length - 1) * gap;
    list.forEach((n, i) => { out.push({ id: n.id, type: 'qt', position: { x: colX[level] ?? level * 320, y: i * gap - total / 2 }, data: n }); });
  }
  nodes.value = out;
  const built: Edge[] = g.edges.map((e): Edge => ({ id: e.id, source: e.source, target: e.target, animated: e.kind === 'tests', markerEnd: MarkerType.ArrowClosed, style: { stroke: e.kind === 'tests' ? 'var(--color-brand)' : e.kind === 'explains' ? 'var(--qt-teal)' : 'var(--qt-gold)', strokeWidth: 1.4 } }));
  edges.value = built;
}
watch(() => props.graph, (g) => { selectedId.value = ''; layout(g); void nextTick(() => setTimeout(fit, 60)); }, { immediate: true });

function onNodeClick(ev: { node: Node }): void { selectedId.value = ev.node.id; }
const selected = computed(() => props.graph.nodes.find((n) => n.id === selectedId.value) || null);
const linkedVerses = computed(() => (selected.value ? props.verses.filter((v) => selected.value!.refs.includes(v.ref)).slice(0, 12) : []));
const linkedMaterials = computed(() => {
  const s = selected.value; if (!s) return [];
  if (s.kind === 'material') return props.materials.filter((m) => m.kind !== 'glossary').slice(0, 12);
  const lo = Math.min(...s.refs.map((r) => Number(r.split(':')[1]))); const hi = Math.max(...s.refs.map((r) => Number(r.split(':')[1])));
  return props.materials.filter((m) => m.kind !== 'glossary' && (m.from ?? 1) <= hi && (m.to ?? 9999) >= lo).slice(0, 8);
});
const linkedQuestions = computed(() => { const s = selected.value; if (!s) return []; return props.questions.filter((q) => q.sourceRefs.some((r) => s.refs.includes(r)) || (s.kind === 'concept' && q.conceptId && s.id === `concept-${q.conceptId}`)).slice(0, 10); });
function masteryClass(v: number | undefined): string { if (v === undefined) return 'na'; return pctClass(Math.round(v * 100)); }
function kindLabelOf(k: QuranGraphNode['kind']): string {
  const m: Record<QuranGraphNode['kind'], string> = { chapter: i18nT('章'), unit: i18nT('教学单元'), concept: i18nT('概念'), verse: i18nT('经文'), material: i18nT('批准资料'), question: i18nT('题目'), student: i18nT('学生') };
  return m[k];
}
</script>
