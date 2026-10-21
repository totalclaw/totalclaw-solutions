<template>
  <article class="sd-card" :class="{ recalculating: recalculating }">
    <header class="sd-card-head">
      <span class="sd-dot" :class="`tone-${card.badgeTone || 'ok'}`"></span>
      <h3>{{ $t(card.title) }}</h3>
      <span v-if="card.badge" class="sd-badge" :class="`tone-${card.badgeTone || 'muted'}`">{{ $t(card.badge) }}</span>
      <span class="sd-head-spacer"></span>
      <span v-if="card.confidence != null" class="sd-meta">{{ $t('置信度') }} {{ Math.round(card.confidence * 100) }}%</span>
      <span v-if="card.evidenceCount" class="sd-meta">
        <i class="ri-attachment-2"></i>{{ card.evidenceCount }}
      </span>
      <button class="sd-collapse" type="button" @click="collapsed = !collapsed">
        <i :class="collapsed ? 'ri-arrow-down-s-line' : 'ri-arrow-up-s-line'"></i>
      </button>
    </header>

    <div v-if="recalculating" class="sd-skeleton">
      <span></span><span></span><span></span>
    </div>

    <div v-else-if="!collapsed" class="sd-card-body">
      <!-- 字段表 -->
      <table v-if="card.kind === 'fields'" class="sd-fields">
        <tbody>
          <tr
            v-for="field in card.fields"
            :key="field.key"
            :class="{ hot: hoverKey === field.key }"
            @mouseenter="onFieldHover(field)"
            @mouseleave="hoverKey = ''"
            @click="onFieldClick(field)"
          >
            <th>{{ $t(field.label) }}</th>
            <td dir="auto">{{ field.value }}</td>
            <td class="sd-anchor">
              <button
                v-for="(anchor, i) in field.anchors"
                :key="i"
                type="button"
                class="sd-anchor-btn"
                :title="anchorLabel(anchor)"
                @click.stop="emit('anchor', anchor)"
              >
                <i class="ri-attachment-2"></i>{{ anchorShort(anchor) }}
              </button>
            </td>
            <td class="sd-conf">{{ Math.round(field.confidence * 100) }}%</td>
          </tr>
        </tbody>
      </table>

      <!-- 信息缺口 + 澄清问题 -->
      <div v-else-if="card.kind === 'gaps'" class="sd-gaps">
        <ul class="sd-gap-list">
          <li v-for="gap in card.gaps" :key="gap.label">
            <i class="ri-error-warning-line"></i>
            <strong>{{ $t(gap.label) }}</strong>
            <span>{{ $t(gap.note) }}</span>
          </li>
        </ul>
        <div class="sd-sub-title">{{ $t('建议澄清问题') }}</div>
        <ol class="sd-question-list">
          <li v-for="(q, i) in card.questions" :key="i">{{ $t(q) }}</li>
        </ol>
        <div class="sd-card-actions">
          <button class="sd-btn" type="button" @click="copyQuestions">
            <i class="ri-file-copy-line"></i>{{ copied ? $t('已复制') : $t('复制全部') }}
          </button>
          <button class="sd-btn" type="button" @click="emit('insertQuestions', card.questions || [])">
            <i class="ri-mail-add-line"></i>{{ $t('插入邮件草稿') }}
          </button>
        </div>
      </div>

      <!-- 判定矩阵（产品匹配 / 符合性 / 能力 / 供应） -->
      <div v-else-if="card.kind === 'matrix'" class="sd-table-wrap">
        <table class="sd-table">
          <thead>
            <tr><th v-for="col in card.matrixColumns" :key="col">{{ $t(col) }}</th></tr>
          </thead>
          <tbody>
            <tr v-for="(row, i) in card.matrixRows" :key="i" :class="`verdict-row-${row.verdict}`">
              <td v-if="row.category">{{ $t(row.category) }}</td>
              <td>
                <span dir="auto">{{ $t(row.requirement) }}</span>
                <button
                  v-if="row.requirementAnchor"
                  class="sd-anchor-btn inline"
                  type="button"
                  @click="emit('anchor', row.requirementAnchor)"
                >
                  <i class="ri-attachment-2"></i>{{ anchorShort(row.requirementAnchor) }}
                </button>
              </td>
              <td dir="auto">{{ $t(row.proposed) }}</td>
              <td dir="auto">{{ $t(row.specValue) }}</td>
              <td><span class="sd-pill" :class="`verdict-${row.verdict}`">{{ verdictLabel(row.verdict) }}</span></td>
              <td v-if="hasAlternate" class="sd-alt">{{ row.alternate ? $t(row.alternate) : '—' }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- BOM 主选 / 备选 -->
      <div v-else-if="card.kind === 'bom'" class="sd-bom">
        <div class="sd-segmented">
          <button :class="{ active: bomTab === 'primary' }" type="button" @click="emit('bomVariant', 'primary')">{{ $t('主选') }}</button>
          <button :class="{ active: bomTab === 'alternate' }" type="button" @click="emit('bomVariant', 'alternate')">{{ $t('备选') }}</button>
        </div>
        <div class="sd-table-wrap">
          <table class="sd-table">
            <thead>
              <tr>
                <th>SKU</th><th>{{ $t('描述') }}</th><th class="num">{{ $t('数量') }}</th>
                <th class="num">{{ $t('单价') }}</th><th class="num">{{ $t('行小计') }}</th>
                <th>{{ $t('交期') }}</th><th>{{ $t('库存') }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="row in bomRows" :key="row.sku" :class="{ short: row.stockShort }">
                <td class="mono">{{ row.sku }}</td>
                <td dir="auto">{{ $t(row.description) }}</td>
                <td class="num">{{ row.qty }} {{ $t(row.unit) }}</td>
                <td class="num">{{ fmt(row.unitCost) }}</td>
                <td class="num">{{ fmt(row.qty * row.unitCost) }}</td>
                <td>{{ $t(row.leadTime) }}</td>
                <td>
                  <span :class="row.stockShort ? 'sd-pill verdict-partial' : 'sd-pill verdict-ok'">{{ $t(row.stock) }}</span>
                </td>
              </tr>
            </tbody>
            <tfoot>
              <tr><td colspan="4">{{ $t('合计') }}</td><td class="num">{{ fmt(bomSum) }}</td><td colspan="2"></td></tr>
            </tfoot>
          </table>
        </div>
        <p class="sd-note">{{ $t('切换主选 / 备选后，成本与报价卡会按新 BOM 重算。') }}</p>
      </div>

      <!-- 成本与报价：每一行都必须能点开公式 -->
      <div v-else-if="card.kind === 'pricing'" class="sd-pricing">
        <div v-for="line in card.calcLines" :key="line.key" class="sd-price-line" :class="line.emphasis">
          <span class="sd-price-label">{{ $t(line.label) }}</span>
          <button class="sd-formula-btn" type="button" @click="toggleFormula(line.key)">
            <i class="ri-function-line"></i>
          </button>
          <span class="sd-price-value">{{ line.currency }} {{ fmt(line.result) }}</span>
          <div v-if="openFormula === line.key" class="sd-formula-pop">
            <div class="sd-formula-title">{{ $t(line.label) }}</div>
            <div class="sd-formula-expr">{{ $t('{p0}：{p1}', { p0: $t('公式'), p1: line.formula }) }}</div>
            <div v-for="(input, name) in line.inputs" :key="name" class="sd-formula-input">
              <span>{{ name }}</span>
              <b>{{ input.value.toLocaleString('en-US') }}</b>
              <em v-if="input.note">{{ $t(input.note) }}</em>
            </div>
            <div class="sd-formula-result">= {{ line.currency }} {{ fmt(line.result) }}</div>
            <div class="sd-formula-meta">
              {{ $t('规则版本') }} {{ line.ruleVersion }}<template v-if="line.rounding"> · {{ line.rounding }}</template>
            </div>
          </div>
        </div>
        <div v-if="card.priceRange" class="sd-price-range">
          <span>{{ $t('建议报价区间') }}</span>
          <strong>SAR {{ fmt(card.priceRange.low) }} — {{ fmt(card.priceRange.high) }}</strong>
        </div>
        <!--
          多币种折算（P2-2）。以前客户问「这是多少人民币」只能手算，
          填错一个小数点就是商务事故。汇率**必须带时点** —— 不写时点的汇率等于没写。
        -->
        <div v-if="card.priceRange" class="sd-fx">
          <div class="sd-fx-head">
            <i class="ri-exchange-dollar-line"></i>
            <span>{{ $t('多币种折算') }}</span>
            <button class="sd-fx-refresh" type="button" :disabled="fxLoading" @click="loadFxRate(true)">
              {{ fxLoading ? $t('取汇率中…') : $t('刷新汇率') }}
            </button>
          </div>
          <div v-if="fxQuote" class="sd-fx-rows">
            <div v-for="cur in FX_TARGETS" :key="cur" class="sd-fx-row">
              <span>{{ cur }}</span>
              <b>{{ fxConvert(card.priceRange.low, cur) }} — {{ fxConvert(card.priceRange.high, cur) }}</b>
            </div>
          </div>
          <p class="sd-fx-note" :class="{ stale: fxQuote?.stale }">
            {{ fxNote }}
          </p>
        </div>
      </div>

      <!-- 历史对比 -->
      <div v-else-if="card.kind === 'benchmark'" class="sd-benchmark">
        <div class="sd-table-wrap">
          <table class="sd-table">
            <thead>
              <tr>
                <th>{{ $t('对照') }}</th><th>{{ $t('范围') }}</th>
                <th class="num">{{ $t('合计') }}</th><th class="num">{{ $t('毛利率') }}</th><th>{{ $t('结果') }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="row in card.benchmark" :key="row.name" :class="{ current: row.name === '本次' }">
                <td>{{ $t(row.name) }}</td><td dir="auto">{{ $t(row.scope) }}</td>
                <td class="num">{{ row.total }}</td><td class="num">{{ row.margin }}</td><td>{{ $t(row.result) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p class="sd-note">{{ $t(card.benchmarkNote || '') }}</p>
      </div>

      <!-- 硬性门槛四栏看板 -->
      <div v-else-if="card.kind === 'kanban'" class="sd-kanban">
        <div v-for="col in kanbanColumns" :key="col.key" class="sd-kanban-col" :class="`col-${col.key}`">
          <header>{{ $t(col.label) }} ({{ kanbanOf(col.key).length }})</header>
          <div v-for="item in kanbanOf(col.key)" :key="item.title" class="sd-kanban-card">
            <strong>{{ $t(item.title) }}</strong>
            <span v-if="item.note">{{ $t(item.note) }}</span>
            <!-- 人工改判：证书过期 / 招标人放宽都可能改变判定，改完写审计并重算决策 -->
            <select
              class="sd-kanban-move"
              :value="item.column"
              :aria-label="$t('改判')"
              @change="onGateMove(item, ($event.target as HTMLSelectElement).value)"
            >
              <option v-for="target in kanbanColumns" :key="target.key" :value="target.key">
                {{ $t(target.label) }}
              </option>
            </select>
          </div>
        </div>
      </div>

      <!-- Addendum 差异 -->
      <div v-else-if="card.kind === 'versionDiff'" class="sd-version">
        <p v-if="!card.versionDiff?.length" class="sd-note">
          {{ $t('尚未上传 Addendum。用顶部「模拟变更」上传预置的 Addendum 01 可现场演示增量重算。') }}
        </p>
        <template v-else>
          <div class="sd-table-wrap">
            <table class="sd-table">
              <thead>
                <tr><th>{{ $t('字段') }}</th><th>{{ $t('变更前') }}</th><th>{{ $t('变更后') }}</th><th>Δ</th></tr>
              </thead>
              <tbody>
                <tr v-for="row in card.versionDiff" :key="row.field">
                  <td>{{ $t(row.field) }}</td><td>{{ row.before }}</td>
                  <td class="changed">{{ row.after }}</td><td class="changed">{{ row.delta }}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div class="sd-impact">
            <div>
              <span class="sd-impact-label">{{ $t('受影响模块（已重算）') }}</span>
              <button
                v-for="id in card.affectedCards"
                :key="id"
                type="button"
                class="sd-chip affected"
                @click="emit('scrollToCard', id)"
              >{{ $t(cardTitle(id)) }}</button>
            </div>
            <div>
              <span class="sd-impact-label">{{ $t('未受影响') }}</span>
              <button
                v-for="id in card.unaffectedCards"
                :key="id"
                type="button"
                class="sd-chip"
                @click="emit('scrollToCard', id)"
              >{{ $t(cardTitle(id)) }}</button>
            </div>
          </div>
        </template>
      </div>

      <!-- Bid / No-Bid：结论块与评分块必须视觉分离 -->
      <div v-else-if="card.kind === 'decision' && card.decision" class="sd-decision">
        <div v-if="card.decision.hardBlock" class="sd-hard-block">
          <i class="ri-alert-line"></i>{{ $t(card.decision.hardBlock) }}
        </div>
        <div class="sd-decision-main" :class="`tone-${card.decision.tone}`">
          <div class="sd-decision-title">{{ $t('{p0}：', { p0: $t('建议') }) }}<strong>{{ $t(card.decision.recommendation) }}</strong></div>
          <div class="sd-decision-conf">{{ $t('{p0}：{p1}', { p0: $t('可信度'), p1: $t(card.decision.confidence) }) }}</div>
          <div class="sd-sub-title">{{ $t('必须成立的前提') }}</div>
          <ul class="sd-condition-list">
            <li v-for="(c, i) in card.decision.conditions" :key="i"><i class="ri-checkbox-blank-line"></i>{{ $t(c) }}</li>
          </ul>
        </div>
        <button class="sd-score-toggle" type="button" @click="showScores = !showScores">
          <i :class="showScores ? 'ri-arrow-up-s-line' : 'ri-arrow-down-s-line'"></i>
          {{ $t('评分明细（独立区块，不与结论合并）') }}
        </button>
        <div v-if="showScores" class="sd-scores">
          <div v-for="s in card.decision.scores" :key="s.label" class="sd-score-row">
            <span>{{ $t(s.label) }}</span>
            <div class="sd-score-bar"><i :style="{ width: `${(s.score / s.weight) * 100}%` }"></i></div>
            <b>{{ s.score }} / {{ s.weight }}</b>
          </div>
          <p class="sd-note">{{ $t('评分不能覆盖硬性门槛：存在无法解决的强制条件时，不得仅凭高分建议参与。') }}</p>
        </div>
        <!--
          对抗性复核（P2-1）。Bid/No-Bid 是**高风险单向决策** —— 决定投了就要投入
          几十万投标成本。上面这套评分再漂亮，也只是一条链路的一家之言；
          这个按钮把结论丢给专家团正反辩论一轮，专门找反对意见。
        -->
        <button class="sd-btn adversarial" type="button" @click="emit('adversarialReview', card.id)">
          <i class="ri-scales-3-line"></i>{{ $t('专家团正反辩论复核') }}
          <em>{{ $t('成本约为普通对话的 3–5 倍') }}</em>
        </button>
      </div>

      <!-- 多渠道合并时间线 -->
      <div v-else-if="card.kind === 'timeline'" class="sd-timeline">
        <div v-for="(item, i) in card.timeline" :key="i" class="sd-timeline-item">
          <span class="sd-source-chip" :class="`ch-${item.channel}`">
            <i :class="channelIcon(item.channel)"></i>{{ channelLabel(item.channel) }}
          </span>
          <span v-if="item.simulated" class="sd-sim-chip">Simulated</span>
          <span v-if="item.ticketNo" class="sd-ticket-chip">{{ item.ticketNo }}</span>
          <span class="sd-timeline-at">{{ item.at }}</span>
          <p dir="auto">{{ $t(item.summary) }}</p>
        </div>
        <div class="sd-merge-reasons">
          <div class="sd-sub-title">{{ $t('合并依据') }}</div>
          <div v-for="r in card.mergeReasons" :key="r.label" class="sd-reason-row">
            <span>{{ $t(r.label) }}</span><b>+{{ r.score }}</b>
          </div>
          <div class="sd-reason-total">
            {{ $t('合计') }} <b>{{ (card.mergeReasons || []).reduce((s, r) => s + r.score, 0) }}</b>
            · {{ $t('达到阈值给出合并建议，由人确认，合并后可撤销') }}
          </div>
        </div>
      </div>

      <!-- 证据列表（内部检索 / 外部研究） -->
      <div v-else-if="card.kind === 'evidenceList'" class="sd-evidence">
        <p v-if="card.approvedSourceNote" class="sd-note strong">{{ $t(card.approvedSourceNote) }}</p>
        <div v-for="ev in nonConflicting" :key="ev.id" class="sd-evidence-item">
          <div class="sd-evidence-head">
            <i :class="evidenceIcon(ev.kind)"></i>
            <strong>{{ $t(ev.title) }}</strong>
            <span class="sd-evidence-conf">{{ Math.round(ev.confidence * 100) }}%</span>
          </div>
          <p dir="auto">{{ $t(ev.excerpt) }}</p>
          <div class="sd-evidence-meta">
            <span v-if="ev.anchor?.url">🌐 {{ ev.anchor.docName }}</span>
            <span v-else-if="ev.anchor">📄 {{ ev.anchor.docName }}<template v-if="ev.anchor.page"> · p.{{ ev.anchor.page }}</template></span>
            <span>{{ ev.anchor?.capturedAt ? $t('快照') + ' ' + ev.anchor.capturedAt : $t('更新') + ' ' + ev.updatedAt }}</span>
            <span v-if="ev.scope">{{ $t('{p0}：{p1}', { p0: $t('适用范围'), p1: $t(ev.scope) }) }}</span>
            <button v-if="ev.anchor" class="sd-anchor-btn inline" type="button" @click="emit('anchor', ev.anchor!)">
              <i class="ri-external-link-line"></i>{{ $t('查看来源') }}
            </button>
          </div>
        </div>

        <div v-for="pair in conflictPairs" :key="pair[0].id" class="sd-conflict">
          <div class="sd-conflict-head"><i class="ri-error-warning-line"></i>{{ $t('冲突 —— 两条来源口径不一致，未静默取其一') }}</div>
          <div class="sd-conflict-grid">
            <div v-for="ev in pair" :key="ev.id">
              <strong>{{ $t(ev.title) }}</strong>
              <p dir="auto">{{ $t(ev.excerpt) }}</p>
              <span class="sd-evidence-meta">{{ ev.anchor?.docName }} · {{ ev.updatedAt }} · {{ Math.round(ev.confidence * 100) }}%</span>
            </div>
          </div>
          <button class="sd-btn warn" type="button" @click="emit('needsVerification', pair[0].title)">
            <i class="ri-user-search-line"></i>{{ $t('标记为待人工核验') }}
          </button>
        </div>
      </div>

      <!-- 报告 / 简短回复 -->
      <div v-else-if="card.kind === 'report'" class="sd-report">
        <template v-if="card.replyLines?.length">
          <div class="sd-reply" dir="auto">
            <p v-for="(line, i) in card.replyLines" :key="i" :class="{ blank: !line }">{{ line ? $t(line) : '' }}</p>
          </div>
        </template>
        <template v-else>
          <div class="sd-report-body">
            <nav class="sd-report-nav">
              <button
                v-for="s in card.reportSections"
                :key="s.id"
                type="button"
                :class="{ active: activeSection === s.id }"
                @click="activeSection = s.id"
              >
                {{ $t(s.title) }}
                <i v-if="s.regulatory" class="ri-lock-line" :title="$t('监管基础事实：模拟变更时逐字不变')"></i>
              </button>
            </nav>
            <div class="sd-report-section">
              <div class="sd-report-title">
                {{ $t(currentSection?.title || '') }}
                <span v-if="currentSection?.regulatory" class="sd-badge tone-muted">{{ $t('监管基础事实 · 不随目标客户变化') }}</span>
              </div>
              <p dir="auto">{{ $t(currentSection?.body || '') }}</p>
            </div>
          </div>
        </template>
      </div>

      <!-- 输出物 -->
      <div v-else-if="card.kind === 'outputs'" class="sd-outputs">
        <!--
          每行显示的是**真实状态**（由 syncOutputsCard 按案件里的文件回填）：
          没生成过就说「未生成」，别摆一个看着像已完成的「v1 · 草稿水印」——
          用户会据此以为文件早就有了，然后在输出中心看到「还没有生成任何文件」。
        -->
        <div v-for="o in card.outputs" :key="o.name" class="sd-output-row">
          <i :class="outputIcon(o.kind)"></i>
          <span class="sd-output-name">{{ o.name }}</span>
          <template v-if="o.generated">
            <span class="sd-output-version">{{ o.version }}</span>
            <span v-if="o.draft" class="sd-badge tone-muted">{{ $t('草稿水印') }}</span>
            <span v-else class="sd-badge tone-ok">{{ $t('正式件') }}</span>
          </template>
          <span v-else class="sd-badge tone-muted">{{ $t('未生成') }}</span>
          <!-- 这个按钮**是生成**（走 generateOutput 落真 docx/xlsx/pdf），原来写「预览」骗人 -->
          <button class="sd-btn" type="button" @click="emit('openOutput', o.name, o.kind)">
            {{ o.generated ? $t('重新生成') : $t('生成文件') }}
          </button>
        </div>
        <p class="sd-note">{{ $t('未审批前生成的文件带 DRAFT 水印且不可发送；审批通过后重新生成即为正式件，发送会真实外发。') }}</p>
      </div>

      <!-- 投标准备任务 -->
      <div v-else-if="card.kind === 'taskplan'" class="sd-table-wrap">
        <table class="sd-table">
          <thead>
            <tr><th>{{ $t('任务') }}</th><th>{{ $t('负责人') }}</th><th>{{ $t('截止') }}</th><th>{{ $t('依赖') }}</th></tr>
          </thead>
          <tbody>
            <tr v-for="t in card.taskplan" :key="t.task">
              <td dir="auto">{{ $t(t.task) }}</td><td>{{ t.owner }}</td><td>{{ t.due }}</td><td>{{ $t(t.dependsOn) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <footer v-if="!collapsed && !recalculating" class="sd-card-foot">
      <button class="sd-btn ghost" type="button" @click="emit('edit', card.id)"><i class="ri-edit-line"></i>{{ $t('编辑') }}</button>
      <!--
        采纳 / 标记待核是**互斥状态**，不是两个「触发一次」的动作。
        原先点完只弹个 toast，按钮长相不变、还能反复点 —— 用户以为没生效。
        现在选中态直接写在按钮上，再点一次取消。
      -->
      <button
        class="sd-btn"
        :class="review === 'accepted' ? 'accepted' : 'ghost'"
        type="button"
        @click="emit('accept', card.id)"
      >
        <i :class="review === 'accepted' ? 'ri-checkbox-circle-fill' : 'ri-check-line'"></i>
        {{ review === 'accepted' ? $t('已采纳') : $t('采纳') }}
      </button>
      <button
        class="sd-btn"
        :class="review === 'flagged' ? 'flagged' : 'ghost'"
        type="button"
        @click="emit('flag', card.id)"
      >
        <i :class="review === 'flagged' ? 'ri-flag-fill' : 'ri-flag-line'"></i>
        {{ review === 'flagged' ? $t('待核验') : $t('标记待核') }}
      </button>
    </footer>
  </article>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { t as i18nT } from '../../i18n';
import { CARD_TITLES } from './modules';
import type { Anchor, CardData, Evidence, Field, IntakeChannel, KanbanCard, Verdict } from './types';

const props = defineProps<{
  card: CardData;
  recalculating?: boolean;
  /** 复核状态（父级持有，因为要跨卡片统计与持久化） */
  review?: 'accepted' | 'flagged' | null;
}>();
const emit = defineEmits<{
  (e: 'anchor', anchor: Anchor): void;
  (e: 'scrollToCard', cardId: string): void;
  (e: 'insertQuestions', questions: string[]): void;
  (e: 'needsVerification', title: string): void;
  // kind 必须一起传：卡片上写着 .xlsx / .docx，落盘却按名字猜格式，
  // 猜不中就全成了 .pdf —— 声明的扩展名和真实内容对不上。
  (e: 'openOutput', name: string, kind?: string): void;
  (e: 'edit' | 'accept' | 'flag', cardId: string): void;
  /** 对抗性复核（P2-1）：把结论交给专家团正反辩论一轮，专门找反对意见 */
  (e: 'adversarialReview', cardId: string): void;
  (e: 'bomVariant', variant: 'primary' | 'alternate'): void;
  (e: 'gateMove', payload: { title: string; from: string; to: string }): void;
}>();

// ── 多币种折算（P2-2 汇率连接器）──────────────────────────────────────────
// 报价区间以 SAR 计，客户问「这是多少人民币」以前只能手算。
// 汇率**必须带时点**并跟着进交付物页脚 —— 不写时点的汇率等于没写。
const FX_TARGETS = ['CNY', 'AED', 'USD'] as const;
const fxQuote = ref<any>(null);
const fxLoading = ref(false);
const fxError = ref('');

async function loadFxRate(force = false): Promise<void> {
  // preload 暴露的是 `cases`（复数）；写成 `case` 会静默拿到 undefined，
  // 汇率区块就永远停在「尚未取汇率」——实测时抓到的第一个 bug
  const api = (window as any).electronAPI?.cases;
  if (!api?.fxRate || fxLoading.value) return;
  fxLoading.value = true;
  try {
    const res = await api.fxRate('SAR', force);
    fxQuote.value = res?.quote ?? null;
    // 拿到的是缓存/过期汇率时 message 非空，要照实说，不能当成正常
    fxError.value = res?.ok ? (res.message || '') : (res?.message || i18nT('拿不到汇率'));
  } catch (error) {
    fxQuote.value = null;
    fxError.value = String((error as Error)?.message || error);
  } finally {
    fxLoading.value = false;
  }
}

/** 换算并格式化。缺汇率显示 `—`，**不显示 0** —— 0 会被当成真实报价。 */
function fxConvert(amount: number, target: string): string {
  const q = fxQuote.value;
  if (!q || !Number.isFinite(amount)) return '—';
  const rate = target === q.base ? 1 : Number(q.rates?.[target]);
  if (!Number.isFinite(rate) || !rate) return '—';
  return (amount * rate).toLocaleString('en-US', { maximumFractionDigits: 0 });
}

const fxNote = computed(() => {
  if (fxError.value) return fxError.value;
  const q = fxQuote.value;
  if (!q) return i18nT('尚未取汇率');
  return q.stale
    ? i18nT('汇率时点 {p0}（来源 {p1}）⚠ 已超过 24 小时未更新，请人工确认', { p0: q.asOf, p1: q.source })
    : i18nT('汇率时点 {p0}（来源 {p1}）', { p0: q.asOf, p1: q.source });
});

// 报价卡一露面就取一次；不是报价卡的场合不打网络
onMounted(() => { if (props.card?.kind === 'pricing' && props.card?.priceRange) void loadFxRate(); });

function onGateMove(item: KanbanCard, to: string): void {
  if (!to || to === item.column) return;
  emit('gateMove', { title: item.title, from: item.column, to });
}

const collapsed = ref(false);
const bomTab = computed<'primary' | 'alternate'>(() => props.card.bomVariant ?? 'primary');
const openFormula = ref('');
const showScores = ref(false);
const hoverKey = ref('');
const copied = ref(false);
const activeSection = ref(props.card.reportSections?.[0]?.id ?? '');

const bomRows = computed(() =>
  bomTab.value === 'primary' ? props.card.bomPrimary ?? [] : props.card.bomAlternate ?? [],
);
const bomSum = computed(() => bomRows.value.reduce((sum, r) => sum + r.qty * r.unitCost, 0));
const hasAlternate = computed(() => (props.card.matrixRows ?? []).some((r) => r.alternate));
const currentSection = computed(
  () => props.card.reportSections?.find((s) => s.id === activeSection.value) ?? props.card.reportSections?.[0],
);

/** 冲突证据成对展示，不静默取一条（需求 P0-09 明确要求）。 */
const conflictPairs = computed<Evidence[][]>(() => {
  const list = props.card.evidences ?? [];
  const seen = new Set<string>();
  const pairs: Evidence[][] = [];
  for (const ev of list) {
    if (!ev.conflictsWith?.length || seen.has(ev.id)) continue;
    const others = list.filter((o) => ev.conflictsWith!.includes(o.id));
    if (!others.length) continue;
    [ev, ...others].forEach((e) => seen.add(e.id));
    pairs.push([ev, ...others]);
  }
  return pairs;
});
const nonConflicting = computed(() => (props.card.evidences ?? []).filter((e) => !e.conflictsWith?.length));

const kanbanColumns = [
  { key: 'met' as const, label: i18nT('已满足') },
  { key: 'closeable' as const, label: i18nT('可补齐') },
  { key: 'cannot' as const, label: i18nT('无法满足') },
  { key: 'review' as const, label: i18nT('待人工确认') },
];
function kanbanOf(col: string) {
  return (props.card.kanban ?? []).filter((k) => k.column === col);
}

function fmt(n: number): string {
  return Math.round(n).toLocaleString('en-US');
}
function cardTitle(id: string): string {
  return CARD_TITLES[id] ?? id;
}
function verdictLabel(v: Verdict): string {
  return i18nT({ ok: '满足', partial: '部分满足', deviate: '偏离', fail: '无法满足', pending: '待确认' }[v]);
}
function anchorShort(anchor: Anchor): string {
  if (anchor.page) return `p.${anchor.page}`;
  if (anchor.cell) return anchor.cell.split('!').pop() || anchor.cell;
  return i18nT('来源');
}
function anchorLabel(anchor: Anchor): string {
  return `${anchor.docName} ${anchorShort(anchor)}`;
}
function channelIcon(channel: IntakeChannel): string {
  return {
    email: 'ri-mail-line', whatsapp: 'ri-whatsapp-line', webform: 'ri-file-list-3-line',
    websnapshot: 'ri-global-line', upload: 'ri-upload-2-line',
  }[channel];
}
function channelLabel(channel: IntakeChannel): string {
  return i18nT({
    email: '邮件', whatsapp: 'WhatsApp', webform: '网页表单',
    websnapshot: '外部标讯', upload: '上传',
  }[channel]);
}
function evidenceIcon(kind: Evidence['kind']): string {
  return {
    internal_doc: 'ri-file-text-line',
    product_db: 'ri-database-2-line',
    history: 'ri-history-line',
    external_site: 'ri-global-line',
    snapshot: 'ri-camera-lens-line',
  }[kind];
}
function outputIcon(kind: string): string {
  return { word: 'ri-file-word-line', excel: 'ri-file-excel-line', pdf: 'ri-file-pdf-line', email: 'ri-mail-send-line' }[kind] || 'ri-file-line';
}

function onFieldHover(field: Field): void {
  hoverKey.value = field.key;
  if (field.anchors[0]) emit('anchor', field.anchors[0]);
}
function onFieldClick(field: Field): void {
  if (field.anchors[0]) emit('anchor', field.anchors[0]);
}
function toggleFormula(key: string): void {
  openFormula.value = openFormula.value === key ? '' : key;
}
async function copyQuestions(): Promise<void> {
  try {
    await navigator.clipboard.writeText((props.card.questions ?? []).join('\n'));
    copied.value = true;
    window.setTimeout(() => { copied.value = false; }, 1600);
  } catch {
    /* 剪贴板不可用时静默：演示机上不弹错误打断节奏 */
  }
}
</script>

<style scoped>
.sd-card {
  background: #fff;
  border: 1px solid #e3e8ef;
  border-radius: 8px;
  box-shadow: 0 1px 2px rgba(16, 24, 40, 0.05);
  margin-bottom: 16px;
}
.sd-card-head {
  display: flex; align-items: center; gap: 8px;
  padding: 14px 20px; border-bottom: 1px solid #eef2f6;
}
.sd-card-head h3 { font-size: 15px; line-height: 22px; margin: 0; color: #1b2733; font-weight: 600; }
.sd-head-spacer { flex: 1; }
.sd-dot { width: 8px; height: 8px; border-radius: 999px; background: #12805c; }
.sd-dot.tone-warn { background: #b45309; }
.sd-dot.tone-danger { background: #b42318; }
.sd-dot.tone-muted { background: #94a3b8; }
.sd-badge { font-size: 12px; line-height: 16px; padding: 2px 8px; border-radius: 999px; background: #f1f5f9; color: #475467; }
.sd-badge.tone-ok { background: #ecfdf3; color: #12805c; }
.sd-badge.tone-warn { background: #fffaeb; color: #b45309; }
.sd-badge.tone-danger { background: #fef3f2; color: #b42318; }
.sd-meta { font-size: 12px; color: #64748b; display: inline-flex; align-items: center; gap: 3px; }
.sd-collapse { background: none; border: none; cursor: pointer; color: #64748b; font-size: 16px; }
.sd-card-body { padding: 16px 20px; }
.sd-card-foot { display: flex; gap: 8px; padding: 10px 20px; border-top: 1px solid #eef2f6; }

.sd-skeleton { padding: 20px; display: grid; gap: 10px; }
.sd-skeleton span {
  height: 14px; border-radius: 4px;
  background: linear-gradient(90deg, #f1f5f9 25%, #e8eef5 37%, #f1f5f9 63%);
  background-size: 400% 100%; animation: sd-shimmer 1.2s ease infinite;
}
.sd-skeleton span:nth-child(2) { width: 78%; }
.sd-skeleton span:nth-child(3) { width: 54%; }
@keyframes sd-shimmer { 0% { background-position: 100% 50%; } 100% { background-position: 0 50%; } }

.sd-fields { width: 100%; border-collapse: collapse; }
.sd-fields tr { cursor: pointer; }
.sd-fields tr.hot, .sd-fields tr:hover { background: #e6f7f3; }
.sd-fields th {
  text-align: left; font-weight: 500; color: #64748b; font-size: 13px;
  padding: 7px 12px 7px 0; width: 128px; vertical-align: top;
}
.sd-fields td { padding: 7px 12px 7px 0; font-size: 13px; color: #1b2733; }
.sd-conf { color: #94a3b8; font-size: 12px; text-align: right; width: 48px; }
.sd-anchor { width: 92px; }
.sd-anchor-btn {
  border: 1px solid #e3e8ef; background: #f8fafc; border-radius: 6px; cursor: pointer;
  font-size: 11px; color: #0e9e86; padding: 1px 6px; display: inline-flex; align-items: center; gap: 2px;
}
.sd-anchor-btn.inline { margin-left: 6px; }

.sd-gap-list { list-style: none; margin: 0 0 14px; padding: 0; }
.sd-gap-list li {
  display: flex; align-items: baseline; gap: 8px; padding: 8px 12px;
  background: #fffaeb; border-radius: 6px; margin-bottom: 6px; font-size: 13px;
}
.sd-gap-list i { color: #b45309; }
.sd-gap-list strong { color: #1b2733; }
.sd-gap-list span { color: #64748b; }
.sd-sub-title { font-size: 13px; font-weight: 600; color: #475467; margin: 12px 0 6px; }
.sd-question-list { margin: 0; padding-left: 18px; color: #1b2733; font-size: 13px; line-height: 22px; }
.sd-card-actions { display: flex; gap: 8px; margin-top: 12px; }

.sd-table-wrap { overflow-x: auto; }
.sd-table { width: 100%; border-collapse: collapse; font-size: 13px; }
.sd-table th {
  background: #f1f5f9; color: #475467; font-weight: 600; text-align: left;
  padding: 8px 10px; white-space: nowrap;
}
.sd-table td { padding: 8px 10px; border-bottom: 1px solid #eef2f6; color: #1b2733; vertical-align: top; }
.sd-table .num, .sd-table th.num { text-align: right; font-variant-numeric: tabular-nums; }
.sd-table tr.short td { background: #fffaeb; }
.sd-table tr.current td { background: #e6f7f3; font-weight: 600; }
.sd-table td.changed { background: #fffaeb; font-weight: 600; }
.sd-table .mono { font-family: ui-monospace, 'JetBrains Mono', monospace; font-size: 12px; }
.sd-alt { color: #64748b; }

.sd-pill { display: inline-block; padding: 1px 8px; border-radius: 999px; font-size: 12px; white-space: nowrap; }
.verdict-ok { background: #ecfdf3; color: #12805c; }
.verdict-partial { background: #fffaeb; color: #b45309; }
.verdict-deviate { background: #fff4ed; color: #c2410c; }
.verdict-fail { background: #fef3f2; color: #b42318; }
.verdict-pending { background: #f2f4f7; color: #475467; }

.sd-segmented { display: inline-flex; border: 1px solid #e3e8ef; border-radius: 6px; overflow: hidden; margin-bottom: 10px; }
.sd-segmented button { border: none; background: #fff; padding: 5px 16px; cursor: pointer; font-size: 13px; color: #475467; }
.sd-segmented button.active { background: #0e9e86; color: #fff; }
.sd-note { font-size: 12px; color: #64748b; margin: 10px 0 0; line-height: 18px; }
.sd-note.strong { color: #12805c; background: #ecfdf3; padding: 8px 10px; border-radius: 6px; }

.sd-price-line {
  display: flex; align-items: center; gap: 8px; padding: 7px 0;
  border-bottom: 1px dashed #eef2f6; position: relative;
}
.sd-price-label { flex: 1; font-size: 13px; color: #1b2733; }
.sd-price-value { font-variant-numeric: tabular-nums; font-size: 13px; min-width: 128px; text-align: right; }
.sd-price-line.total, .sd-price-line.floor { font-weight: 700; border-bottom: 2px solid #cbd5e1; }
.sd-price-line.floor .sd-price-value { color: #0b7d6a; }
.sd-formula-btn {
  border: 1px solid #e3e8ef; background: #f1f5f9; color: #0e9e86; border-radius: 4px;
  cursor: pointer; width: 22px; height: 20px; display: inline-flex; align-items: center; justify-content: center;
}
.sd-formula-pop {
  position: absolute; right: 0; top: 100%; z-index: 20; width: 320px;
  background: #fff; border: 1px solid #cbd5e1; border-radius: 8px; padding: 12px;
  box-shadow: 0 12px 32px rgba(16, 24, 40, 0.12); font-size: 12px;
}
.sd-formula-title { font-weight: 600; margin-bottom: 4px; }
.sd-formula-expr { color: #475467; font-family: ui-monospace, monospace; margin-bottom: 8px; }
.sd-formula-input { display: flex; gap: 6px; align-items: baseline; padding: 2px 0; }
.sd-formula-input span { flex: 1; color: #64748b; }
.sd-formula-input b { font-variant-numeric: tabular-nums; }
.sd-formula-input em { color: #94a3b8; font-style: normal; font-size: 11px; }
.sd-formula-result { border-top: 1px solid #eef2f6; margin-top: 8px; padding-top: 6px; font-weight: 700; }
.sd-formula-meta { color: #94a3b8; margin-top: 4px; }
.sd-price-range {
  display: flex; justify-content: space-between; align-items: center;
  background: #e6f7f3; border-radius: 6px; padding: 10px 12px; margin-top: 12px; font-size: 14px;
}

.sd-kanban { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; }
.sd-kanban-col { background: #f8fafc; border-radius: 8px; padding: 8px; min-height: 120px; }
.sd-kanban-col header { font-size: 12px; font-weight: 600; color: #475467; margin-bottom: 8px; }
.sd-kanban-col.col-met header { color: #12805c; }
.sd-kanban-col.col-closeable header { color: #b45309; }
.sd-kanban-col.col-cannot header { color: #b42318; }
.sd-kanban-card { background: #fff; border: 1px solid #e3e8ef; border-radius: 6px; padding: 7px 9px; margin-bottom: 6px; }
.sd-kanban-card strong { display: block; font-size: 12px; color: #1b2733; }
.sd-kanban-card span { font-size: 11px; color: #64748b; }
.sd-kanban-move {
  margin-top: 6px; width: 100%; border: 1px solid #e3e8ef; border-radius: 4px;
  font-size: 11px; padding: 2px 4px; color: #475467; background: #fff; cursor: pointer;
}

.sd-impact { margin-top: 12px; display: grid; gap: 8px; }
.sd-impact-label { font-size: 12px; color: #64748b; margin-right: 6px; }
.sd-chip {
  border: 1px solid #e3e8ef; background: #f8fafc; color: #475467;
  border-radius: 999px; padding: 2px 10px; font-size: 12px; margin-right: 6px; cursor: pointer;
}
.sd-chip.affected { background: #fffaeb; border-color: #fde68a; color: #b45309; }

.sd-hard-block {
  background: #fef3f2; color: #b42318; border: 1px solid #fecdca; border-radius: 6px;
  padding: 10px 12px; font-weight: 600; font-size: 13px; margin-bottom: 12px;
  display: flex; align-items: center; gap: 6px;
}
.sd-decision-main { background: #fffaeb; border: 1px solid #fde68a; border-radius: 8px; padding: 14px; }
.sd-decision-main.tone-ok { background: #ecfdf3; border-color: #a6f4c5; }
.sd-decision-main.tone-danger { background: #fef3f2; border-color: #fecdca; }
.sd-decision-title { font-size: 15px; color: #1b2733; }
.sd-decision-conf { font-size: 13px; color: #64748b; margin-top: 4px; }
.sd-condition-list { list-style: none; margin: 0; padding: 0; font-size: 13px; }
.sd-condition-list li { display: flex; gap: 6px; align-items: baseline; padding: 3px 0; }
.sd-score-toggle {
  margin-top: 12px; background: none; border: none; cursor: pointer;
  color: #475467; font-size: 13px; display: inline-flex; align-items: center; gap: 4px;
}
.sd-scores { margin-top: 8px; background: #f8fafc; border-radius: 8px; padding: 12px; }
.sd-score-row { display: flex; align-items: center; gap: 10px; font-size: 12px; padding: 3px 0; }
.sd-score-row span { width: 92px; color: #475467; }
.sd-score-bar { flex: 1; height: 6px; background: #e3e8ef; border-radius: 999px; overflow: hidden; }
.sd-score-bar i { display: block; height: 100%; background: #0e9e86; }
.sd-score-row b { width: 56px; text-align: right; font-variant-numeric: tabular-nums; }

.sd-timeline-item { border-left: 2px solid #e3e8ef; padding: 0 0 14px 12px; margin-left: 4px; }
.sd-timeline-item p { margin: 6px 0 0; font-size: 13px; color: #1b2733; }
.sd-timeline-at { font-size: 12px; color: #94a3b8; margin-left: 6px; }
.sd-source-chip {
  display: inline-flex; align-items: center; gap: 4px; font-size: 12px;
  padding: 1px 8px; border-radius: 999px; background: #f1f5f9; color: #475467;
}
.sd-source-chip.ch-email { background: #eff6ff; color: #1d4ed8; }
.sd-source-chip.ch-whatsapp { background: #ecfdf3; color: #12805c; }
.sd-source-chip.ch-webform { background: #f5f3ff; color: #6d28d9; }
.sd-sim-chip { background: #f5f3ff; color: #7c3aed; font-size: 11px; padding: 1px 6px; border-radius: 999px; margin-left: 4px; }
.sd-ticket-chip {
  background: #f8fafc; border: 1px solid #e3e8ef; color: #475467;
  font-size: 11px; padding: 1px 6px; border-radius: 4px; margin-left: 4px;
  font-family: ui-monospace, monospace;
}
.sd-merge-reasons { background: #f8fafc; border-radius: 8px; padding: 12px; margin-top: 6px; }
.sd-reason-row { display: flex; justify-content: space-between; font-size: 12px; padding: 2px 0; color: #475467; }
.sd-reason-total { border-top: 1px solid #e3e8ef; margin-top: 6px; padding-top: 6px; font-size: 12px; color: #64748b; }

.sd-evidence-item { border-bottom: 1px solid #eef2f6; padding: 10px 0; }
.sd-evidence-head { display: flex; align-items: center; gap: 6px; font-size: 13px; }
.sd-evidence-head strong { flex: 1; color: #1b2733; }
.sd-evidence-conf { font-size: 12px; color: #94a3b8; }
.sd-evidence-item p { margin: 4px 0; font-size: 13px; color: #475467; }
.sd-evidence-meta { display: flex; flex-wrap: wrap; gap: 10px; font-size: 11px; color: #94a3b8; align-items: center; }
.sd-conflict { border: 1px solid #fde68a; background: #fffaeb; border-radius: 8px; padding: 12px; margin-top: 12px; }
.sd-conflict-head { color: #b45309; font-size: 13px; font-weight: 600; display: flex; gap: 6px; align-items: center; }
.sd-conflict-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin: 8px 0; }
.sd-conflict-grid strong { font-size: 12px; color: #1b2733; }
.sd-conflict-grid p { font-size: 12px; color: #475467; margin: 4px 0; }

.sd-report-body { display: grid; grid-template-columns: 168px 1fr; gap: 16px; }
.sd-report-nav { display: flex; flex-direction: column; gap: 2px; }
.sd-report-nav button {
  text-align: left; border: none; background: none; cursor: pointer;
  padding: 6px 10px; border-radius: 6px; font-size: 12px; color: #475467;
  display: flex; align-items: center; justify-content: space-between; gap: 4px;
}
.sd-report-nav button.active { background: #e6f7f3; color: #0b7d6a; font-weight: 600; }
.sd-report-title { font-size: 14px; font-weight: 600; color: #1b2733; margin-bottom: 8px; display: flex; gap: 8px; align-items: center; }
.sd-report-section p { font-size: 13px; line-height: 22px; color: #1b2733; white-space: pre-wrap; margin: 0; }
.sd-reply {
  background: #f8fafc; border: 1px solid #e3e8ef; border-radius: 8px; padding: 14px;
  font-size: 13px; line-height: 22px; color: #1b2733;
}
.sd-reply p { margin: 0; }
.sd-reply p.blank { height: 10px; }

.sd-output-row { display: flex; align-items: center; gap: 10px; padding: 8px 0; border-bottom: 1px solid #eef2f6; font-size: 13px; }
.sd-output-name { flex: 1; }
.sd-output-version { color: #64748b; font-size: 12px; }

.sd-btn {
  border: 1px solid #e3e8ef; background: #fff; border-radius: 6px; padding: 4px 12px;
  font-size: 12px; color: #475467; cursor: pointer; display: inline-flex; align-items: center; gap: 4px;
}
.sd-btn:hover { border-color: #0e9e86; color: #0e9e86; }
/* 多币种折算（P2-2）：汇率必须带时点，过期要显眼 */
.sd-fx { margin-top: 12px; border-top: 1px dashed #e3e8ef; padding-top: 10px; }
.sd-fx-head { display: flex; align-items: center; gap: 6px; font-size: 12px; color: #475467; }
.sd-fx-refresh {
  margin-left: auto; border: 0; background: none; cursor: pointer;
  color: #0e9e86; font-size: 11px; font-family: inherit;
}
.sd-fx-refresh:disabled { opacity: .5; cursor: not-allowed; }
.sd-fx-rows { display: flex; flex-wrap: wrap; gap: 14px; margin-top: 6px; }
.sd-fx-row { font-size: 12px; color: #64748b; }
.sd-fx-row b { color: #1b2733; margin-left: 4px; font-variant-numeric: tabular-nums; }
.sd-fx-note { font-size: 11px; color: #98a2b3; margin: 6px 0 0; }
.sd-fx-note.stale { color: #b45309; }

.sd-btn.ghost { border-color: transparent; background: #f8fafc; }
.sd-btn.warn { border-color: #fde68a; color: #b45309; }
/* 复核选中态：实心底色 + 实心图标，一眼能看出这张卡已经处理过 */
.sd-btn.accepted {
  border-color: transparent; background: #d1fae5; color: #047857; font-weight: 600;
}
.sd-btn.accepted:hover { border-color: transparent; color: #047857; }
.sd-btn.flagged {
  border-color: transparent; background: #fef3c7; color: #b45309; font-weight: 600;
}
.sd-btn.flagged:hover { border-color: transparent; color: #b45309; }
/* 对抗性复核入口（P2-1）：成本明码标价，别让用户点完才发现贵 */
.sd-btn.adversarial {
  margin-top: 10px; width: 100%; justify-content: center; gap: 6px;
  border-color: #d6bbfb; color: #6941c6; background: #f9f5ff;
}
.sd-btn.adversarial em { font-style: normal; font-size: 11px; color: #9b8afb; }

/* 颜色全部继承工作台的主题语义变量，避免深色模式出现白色卡片岛。 */
.sd-card, .sd-formula-pop, .sd-kanban-card, .sd-segmented button,
.sd-kanban-move, .sd-btn {
  color: var(--sd-text, var(--color-text-primary));
  background: var(--sd-surface, var(--color-bg-card));
  border-color: var(--sd-border, var(--color-border));
}
.sd-card { border-radius: 10px; box-shadow: var(--shadow-sm); }
.sd-card-head, .sd-card-foot, .sd-table td, .sd-evidence-item, .sd-output-row,
.sd-formula-result, .sd-reason-total { border-color: var(--sd-divider, var(--color-divider)); }
.sd-card-head h3, .sd-fields td, .sd-gap-list strong, .sd-question-list,
.sd-table td, .sd-price-label, .sd-decision-title, .sd-kanban-card strong,
.sd-timeline-item p, .sd-evidence-head strong, .sd-conflict-grid strong,
.sd-report-title, .sd-report-section p, .sd-reply { color: var(--sd-text, var(--color-text-primary)); }
.sd-meta, .sd-collapse, .sd-fields th, .sd-gap-list span, .sd-sub-title,
.sd-alt, .sd-note, .sd-formula-expr, .sd-formula-input span, .sd-kanban-col header,
.sd-kanban-card span, .sd-impact-label, .sd-score-toggle, .sd-score-row span,
.sd-reason-row, .sd-reason-total, .sd-evidence-item p, .sd-output-version {
  color: var(--sd-text-soft, var(--color-text-secondary));
}
.sd-conf, .sd-formula-input em, .sd-formula-meta, .sd-timeline-at,
.sd-evidence-conf, .sd-evidence-meta { color: var(--sd-text-muted, var(--color-text-muted)); }
.sd-badge, .verdict-pending, .sd-chip, .sd-ticket-chip, .sd-source-chip {
  color: var(--sd-text-soft, var(--color-text-secondary));
  background: var(--sd-surface-soft, var(--color-bg-input));
}
.sd-table th, .sd-formula-btn, .sd-kanban-col, .sd-scores, .sd-merge-reasons,
.sd-reply, .sd-btn.ghost, .sd-anchor-btn {
  background: var(--sd-surface-soft, var(--color-bg-input));
  color: var(--sd-text-soft, var(--color-text-secondary));
}
.sd-table th { color: var(--sd-text-soft, var(--color-text-secondary)); }
.sd-fields tr.hot, .sd-fields tr:hover, .sd-table tr.current td,
.sd-segmented button.active, .sd-report-nav button.active {
  color: var(--sd-accent-strong, var(--color-brand-hover));
  background: var(--sd-accent-soft, var(--color-brand-subtle));
}
.sd-anchor-btn, .sd-formula-btn, .sd-btn:hover, .sd-price-line.floor .sd-price-value,
.sd-report-nav button.active { color: var(--sd-accent-strong, var(--color-brand-hover)); }
.sd-btn:hover, .sd-anchor-btn:hover, .sd-formula-btn:hover { border-color: var(--sd-accent, var(--color-brand)); }
.sd-btn:focus-visible, .sd-collapse:focus-visible, .sd-anchor-btn:focus-visible,
.sd-formula-btn:focus-visible, .sd-report-nav button:focus-visible,
.sd-segmented button:focus-visible, .sd-kanban-move:focus-visible {
  outline: 2px solid var(--sd-accent, var(--color-brand)); outline-offset: 2px;
}
.sd-dot, .sd-score-bar i { background: var(--sd-success, var(--color-success)); }
.sd-dot.tone-warn { background: var(--sd-warning, var(--color-warning)); }
.sd-dot.tone-danger { background: var(--sd-danger, var(--color-danger)); }
.sd-dot.tone-muted { background: var(--sd-text-muted, var(--color-text-muted)); }
.sd-badge.tone-ok, .verdict-ok, .sd-note.strong, .sd-decision-main.tone-ok,
.sd-source-chip.ch-whatsapp {
  color: var(--color-status-success-fg); background: var(--color-status-success-bg);
  border-color: color-mix(in srgb, var(--color-status-success-fg) 34%, transparent);
}
.sd-badge.tone-warn, .verdict-partial, .sd-gap-list li, .sd-table tr.short td,
.sd-table td.changed, .sd-chip.affected, .sd-decision-main, .sd-conflict {
  color: var(--color-status-warning-fg); background: var(--color-status-warning-bg);
  border-color: color-mix(in srgb, var(--color-status-warning-fg) 34%, transparent);
}
.sd-badge.tone-danger, .verdict-fail, .sd-hard-block, .sd-decision-main.tone-danger {
  color: var(--color-status-danger-fg); background: var(--color-status-danger-bg);
  border-color: color-mix(in srgb, var(--color-status-danger-fg) 34%, transparent);
}
.verdict-deviate { color: var(--color-status-warning-fg); background: var(--color-status-warning-bg); }
.sd-gap-list i, .sd-conflict-head, .sd-kanban-col.col-closeable header,
.sd-chip.affected, .sd-btn.warn { color: var(--sd-warning, var(--color-warning)); }
.sd-kanban-col.col-met header { color: var(--sd-success, var(--color-success)); }
.sd-kanban-col.col-cannot header { color: var(--sd-danger, var(--color-danger)); }
.sd-price-range { background: var(--sd-accent-soft, var(--color-brand-subtle)); }
.sd-score-bar { background: var(--sd-divider, var(--color-divider)); }
.sd-score-bar i { background: var(--sd-accent, var(--color-brand)); }
.sd-price-line { border-color: var(--sd-divider, var(--color-divider)); }
.sd-price-line.total, .sd-price-line.floor { border-bottom-color: var(--sd-text-muted, var(--color-text-muted)); }
.sd-timeline-item {
  border-left: 0; border-bottom: 1px solid var(--sd-divider, var(--color-divider));
  padding: 0 0 12px; margin: 0 0 12px;
}
.sd-source-chip.ch-email { color: var(--color-status-info-fg); background: var(--color-status-info-bg); }
.sd-source-chip.ch-whatsapp { color: var(--color-status-success-fg); background: var(--color-status-success-bg); }
.sd-source-chip.ch-webform, .sd-sim-chip {
  color: var(--sd-accent-strong, var(--color-brand-hover));
  background: var(--sd-accent-soft, var(--color-brand-subtle));
}
.sd-report-nav button { color: var(--sd-text-soft, var(--color-text-secondary)); }
.sd-skeleton span {
  background: linear-gradient(90deg, var(--sd-surface-soft, var(--color-bg-input)) 25%, var(--sd-surface-hover, var(--color-bg-hover)) 37%, var(--sd-surface-soft, var(--color-bg-input)) 63%);
  background-size: 400% 100%;
}

@media (prefers-reduced-motion: reduce) {
  .sd-skeleton span { animation: none; }
}
</style>
