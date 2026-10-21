<template>
  <div style="display:grid;gap:14px">
    <!--
      左右分栏：左边是步骤导航（直接复用 QtProgress —— 它本来就有状态点、标题、摘要、
      点击跳转与实时进度，竖过来即可，不另造一个），右边只显示当前这一步。
      九步全展开时页面要滚很久，演示时找不着现在在哪；分栏后左栏常驻、右栏专注一步。
      用 v-show 不用 v-if：步骤卡里有就地编辑等局部状态，切走再回来不该被清掉。
    -->
    <div class="qt-layout">
      <aside class="qt-side">
        <QtProgress :metas="steps.metas" :runtime="steps.runtime" :current-key="steps.currentKey.value" :live-msg="liveMsg" @jump="gotoStep" />
      </aside>

      <div class="qt-steps">
      <!-- ── 1 选择经文 ── -->
      <QtStep step-key="corpus" :index="0" :title="steps.metas[0].title" :hint="steps.metas[0].hint" :icon="steps.metas[0].icon" :runtime="steps.runtime.corpus" :is-current="steps.currentKey.value === 'corpus'" v-show="activeStep === 'corpus'">
        <template #tools>
          <span v-if="state.corpus?.allVerified" class="qt-chip ok"><i class="ri-shield-check-line"></i>{{ $t('语料包 {v} · {n} 章 {m} 节 · 校验通过', { v: state.corpus.version, n: state.corpus.chapters.length, m: state.corpus.totalVerses }) }}</span>
          <span v-else class="qt-chip bad"><i class="ri-error-warning-line"></i>{{ $t('语料未导入 / 校验未过') }}</span>
          <button type="button" class="qt-btn sm ghost" @click="importBundled"><i class="ri-download-2-line"></i>{{ $t('重新导入内置语料') }}</button>
          <button type="button" class="qt-btn sm ghost" @click="importDir"><i class="ri-folder-open-line"></i>{{ $t('从目录导入') }}</button>
        </template>
        <p v-if="state.corpus && state.corpus.problems.length" class="qt-note bad"><i class="ri-error-warning-line"></i>{{ state.corpus.problems.join(' · ') }}</p>
        <div class="qt-cols two">
          <section class="qt-panel">
            <header class="qt-panel__head"><strong><i class="ri-book-3-line"></i>{{ $t('固定测试语料（三级压力梯度）') }}</strong><span class="grow"></span><span class="qt-layer l1"><i class="ri-lock-line"></i>{{ $t('第一层 · 经文源数据 · 冻结') }}</span></header>
            <div v-for="tier in [1, 2, 3] as const" :key="tier" class="qt-tier">
              <div class="qt-tier__title">{{ tierLabel(tier) }}</div>
              <div class="qt-chapters">
                <button v-for="c in (state.corpus?.chapters || []).filter((x) => x.tier === tier)" :key="c.chapter" type="button" class="qt-chapter" :class="{ active: state.selection.chapter === c.chapter }" @click="selectChapter(c.chapter)">
                  <span class="qt-chapter__no"><span>#{{ c.chapter }}</span><i :class="c.verified ? 'ri-checkbox-circle-fill' : 'ri-close-circle-fill'" :style="{ color: c.verified ? 'var(--color-success)' : 'var(--color-danger)' }"></i></span>
                  <span class="qt-chapter__ar qt-ar sm" lang="ar">{{ c.nameAr }}</span>
                  <span class="qt-chapter__zh">{{ state.lang === 'ar' ? $t('第 {n} 章', { n: c.chapter }) : state.lang === 'en' ? c.nameEn : c.nameZh }}</span>
                  <span class="qt-chapter__meta"><span>{{ $t('{n} 节', { n: c.verseCount }) }}</span><span :title="c.sha256">{{ c.sha256.slice(0, 6) }}…</span></span>
                </button>
              </div>
            </div>
            <div class="qt-form" style="grid-template-columns:repeat(auto-fit,minmax(120px,1fr))">
              <label class="qt-field"><span>{{ $t('起始节') }}</span><input v-model.number="state.selection.from" type="number" min="1" :max="chapterVerseCount" /></label>
              <label class="qt-field"><span>{{ $t('结束节') }}</span><input v-model.number="state.selection.to" type="number" :min="state.selection.from" :max="chapterVerseCount" /></label>
              <label class="qt-field"><span>{{ $t('快捷范围') }}</span>
                <select class="qt-select" @change="quickRange(($event.target as HTMLSelectElement).value)">
                  <option value="">{{ $t('整章') }}</option><option value="random">{{ $t('随机连续节范围') }}</option><option value="first10">{{ $t('前 10 节') }}</option>
                </select>
              </label>
              <label class="qt-field"><span>{{ $t('检索（阿拉伯文词）') }}</span><input v-model="searchQ" type="text" dir="rtl" lang="ar" :placeholder="$t('例如：يوسف')" @keyup.enter="doSearch" /></label>
            </div>
            <p class="qt-note info"><i class="ri-information-line"></i>{{ $t('章号与节号是权威标识；中文名只做识别。原文由 AI 只读引用，不改写、不补写、不删减、不重排。') }}</p>
            <div class="qt-actions end">
              <button type="button" class="qt-btn primary lg" :disabled="!state.corpus?.allVerified || steps.isRunning()" @click="runCorpus()"><i class="ri-arrow-right-line"></i>{{ $t('载入 {c} {r} 并识别结构', { c: chapterName(state.selection.chapter), r: ltr(rangeLabel(state.selection)) }) }}</button>
            </div>
          </section>
          <section class="qt-panel">
            <header class="qt-panel__head"><strong><i class="ri-file-text-line"></i>{{ $t('经文预览') }}</strong><span class="qt-muted">{{ chapterName(state.selection.chapter) }} · <bdi dir="ltr">{{ rangeLabel(state.selection) }}</bdi> · {{ $t('{n} 节', { n: state.verses.length }) }}</span><span class="grow"></span>
              <!--
                §13.2：正式诵读应采用经批准的真人诵读音频；普通合成语音只适合教学说明。
                这里用的是合成语音，所以按钮旁常驻一个说明，别让客户误以为这是正式诵读音源。
              -->
              <button type="button" class="qt-btn xs ghost" :disabled="!state.verses.length || ttsBusy" @click="reciteSample"><i :class="ttsBusy ? 'ri-loader-4-line qt-spin' : 'ri-volume-up-line'"></i>{{ $t('诵读示例（原文）') }}</button>
              <span class="qt-chip warn" :title="$t('说明书 13.2：正式诵读优先采用经批准的真人诵读音频')"><i class="ri-information-line"></i>{{ $t('合成语音 · 非正式诵读音源') }}</span>
            </header>
            <div v-if="searchHits.length" class="qt-note ok"><i class="ri-search-line"></i>{{ $t('检索命中 {n} 节（已高亮）', { n: searchHits.length }) }}<button type="button" class="qt-btn xs ghost" style="margin-inline-start:auto" @click="searchHits = []; searchQ = ''">{{ $t('清除') }}</button></div>
            <div v-if="speech" class="qt-audio"><i class="ri-headphone-line"></i><audio :src="speech.url" controls></audio><span class="qt-chip" :class="speech.fallback ? 'warn' : 'ok'">{{ speech.fallback ? $t('本地引擎兜底') : 'fal MiniMax speech-02-hd' }}</span><span class="qt-layer l1">L1 {{ speech.verseRefs.join(', ') }}</span></div>
            <div class="qt-basmala qt-ar" v-if="state.selection.chapter !== 1 && state.selection.from === 1" lang="ar">بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ</div>
            <div class="qt-verse-list"><QtVerse v-for="v in state.verses" :key="v.ref" :verse="v" :hit="searchHits.includes(v.ref)" /></div>
            <details class="qt-panel" style="padding:8px 12px">
              <summary class="qt-muted" style="cursor:pointer">{{ $t('上传文本 / 文件入口（能力展示：粘贴的内容按「待审核资料」处理，不进锁定层）') }}</summary>
              <textarea v-model="pasted" class="qt-textarea" rows="3" :placeholder="$t('粘贴教师笔记或译文……')"></textarea>
              <p v-if="pasted.trim()" class="qt-note warn"><i class="ri-alert-line"></i>{{ $t('已收到 {n} 字：标记为「待审核」。未经内容审核人批准前，AI 不会用它做解释或出题。', { n: pasted.trim().length }) }}</p>
              <div class="qt-actions">
                <button type="button" class="qt-btn sm primary" :disabled="!pasted.trim() || intakeBusy" @click="submitIntake"><i :class="intakeBusy ? 'ri-loader-4-line qt-spin' : 'ri-inbox-archive-line'"></i>{{ $t('存为待审核资料') }}</button>
              </div>
              <ul v-if="intakeItems.length" class="qt-textlayer">
                <li v-for="it in intakeItems" :key="it.id">
                  <span class="qt-chip warn"><i class="ri-time-line"></i>{{ $t('待审核') }}</span>
                  <span class="qt-muted">{{ $t('{n} 字 · {t}', { n: it.chars, t: uiTime(it.createdAt) }) }} —— {{ it.preview }}</span>
                </li>
              </ul>
            </details>
          </section>
        </div>
      </QtStep>

      <!-- ── 2 识别结构 ── -->
      <QtStep step-key="parse" :index="1" :title="steps.metas[1].title" :hint="steps.metas[1].hint" :icon="steps.metas[1].icon" :runtime="steps.runtime.parse" :is-current="steps.currentKey.value === 'parse'" v-show="activeStep === 'parse'">
        <template #tools>
          <span v-if="state.parse" class="qt-chip">{{ $t('{v} 节 · {w} 词 · {u} 个词形 · {n} 个单元 · {c} 个概念 · {r} 组重复结构', { v: state.parse.verseCount, w: state.parse.wordCount, u: state.parse.uniqueWords, n: state.parse.units.length, c: state.parse.concepts.length, r: state.parse.repeated.length }) }}</span>
        </template>
        <div v-if="steps.runtime.parse.state === 'running'" class="qt-skeleton"><span v-for="n in 5" :key="n" :style="{ width: `${92 - n * 10}%` }"></span></div>
        <template v-else-if="state.parse">
          <section class="qt-panel">
            <header class="qt-panel__head"><strong><i class="ri-layout-grid-line"></i>{{ $t('教学单元（不是一章 = 一课）') }}</strong><span class="grow"></span><span class="qt-layer l2"><i class="ri-shield-check-line"></i>{{ $t('第二层 · 批准教案结构表') }}</span><span class="qt-layer l3"><i class="ri-sparkling-2-line"></i>{{ $t('第三层 · 自动分段') }}</span></header>
            <div class="qt-units">
              <div v-for="(u, i) in state.parse.units" :key="u.id" class="qt-unit" :style="{ '--i': i }">
                <div class="qt-unit__head"><span class="qt-unit__no">{{ u.index }}</span><span class="qt-unit__title">{{ u.title[state.lang] }}</span><span class="qt-chip"><bdi dir="ltr">{{ verseRange(u.from, u.to) }}</bdi></span><span class="qt-layer" :class="u.origin === 'approved' ? 'l2' : 'l3'">{{ u.origin === 'approved' ? 'L2' : 'L3' }}</span></div>
                <div class="qt-unit__theme">{{ u.theme[state.lang] }}</div>
                <div class="qt-tags"><span v-for="cid in u.conceptIds" :key="cid" class="qt-chip info">{{ conceptLabel(cid) }}</span><span v-if="u.repeated" class="qt-chip gold" :title="u.repeated.phrase"><i class="ri-repeat-line"></i>{{ $t('重复结构 ×{n}', { n: u.repeated.count }) }}</span></div>
                <div v-if="u.vocabulary.length" class="qt-ar sm" lang="ar" style="opacity:.85">{{ u.vocabulary.join(' · ') }}</div>
              </div>
            </div>
          </section>
          <div class="qt-cols">
            <section class="qt-panel">
              <header class="qt-panel__head"><strong><i class="ri-translate-2"></i>{{ $t('词汇与释义') }}</strong><span class="qt-muted">{{ $t('释义仅来自批准词表；无释义的词只用于识别 / 填空 / 排序题') }}</span></header>
              <div class="qt-tags">
                <span v-for="w in state.parse.vocabulary.slice(0, 40)" :key="w.word" class="qt-word" :class="{ l2: !!w.meaning }" :title="w.refs.join(', ')"><span class="qt-ar" lang="ar">{{ w.word }}</span><small v-if="w.meaning">{{ w.meaning[state.lang] }}</small><span class="count">×{{ w.count }} · {{ w.refs[0] }}</span></span>
              </div>
            </section>
            <section class="qt-panel">
              <header class="qt-panel__head"><strong><i class="ri-repeat-2-line"></i>{{ $t('重复 / 相近结构') }}</strong></header>
              <table v-if="state.parse.repeated.length" class="qt-table"><thead><tr><th>{{ $t('短语') }}</th><th>{{ $t('次数') }}</th><th>{{ $t('出处') }}</th></tr></thead><tbody>
                <tr v-for="r in state.parse.repeated.slice(0, 8)" :key="r.phrase"><td class="qt-ar sm" lang="ar">{{ r.phrase }}</td><td>×{{ r.count }}</td><td class="qt-muted" style="direction:ltr">{{ r.refs.slice(0, 8).join(', ') }}{{ r.refs.length > 8 ? '…' : '' }}</td></tr>
              </tbody></table>
              <p v-else class="qt-empty-inline"><i class="ri-information-line"></i>{{ $t('本范围没有识别到重复结构') }}</p>
              <template v-if="state.parse.events.length">
                <header class="qt-panel__head"><strong><i class="ri-time-line"></i>{{ $t('事件顺序与人物') }}</strong></header>
                <ol style="margin:0;padding-inline-start:18px;font-size:12.5px;display:grid;gap:4px"><li v-for="e in state.parse.events" :key="e.order"><b>{{ e.title[state.lang] }}</b> <span class="qt-muted"><bdi dir="ltr">{{ verseRange(e.from, e.to) }}</bdi> · {{ e.persons.map((x) => x[state.lang]).join(' / ') }}</span></li></ol>
              </template>
            </section>
          </div>
          <div class="qt-actions end"><button type="button" class="qt-btn primary lg" :disabled="steps.isRunning()" @click="runPlan()"><i class="ri-arrow-right-line"></i>{{ $t('下一步：生成提纲与课程') }}</button></div>
        </template>
      </QtStep>

      <!-- ── 3 提纲与课程 ── -->
      <QtStep step-key="plan" :index="2" :title="steps.metas[2].title" :hint="steps.metas[2].hint" :icon="steps.metas[2].icon" :runtime="steps.runtime.plan" :is-current="steps.currentKey.value === 'plan'" v-show="activeStep === 'plan'">
        <template #tools>
          <span v-if="state.plan" class="qt-chip" :class="state.plan.reviewStatus === 'accepted' ? 'ok' : state.plan.reviewStatus === 'edited' ? 'info' : 'warn'">{{ planStatusLabel(state.plan.reviewStatus) }}</span>
          <span v-if="state.plan" class="qt-chip">{{ state.plan.generator === 'llm' ? $t('LLM 润色') : $t('模板骨架') }}</span>
        </template>
        <div class="qt-form">
          <label class="qt-field"><span>{{ $t('学生年龄 / 年级') }}</span><input v-model="planForm.grade" type="text" /></label>
          <label class="qt-field"><span>{{ $t('学习水平') }}</span><select v-model="planForm.level" class="qt-select"><option value="beginner">{{ $t('初级') }}</option><option value="intermediate">{{ $t('中级') }}</option><option value="advanced">{{ $t('高级') }}</option></select></label>
          <label class="qt-field"><span>{{ $t('每周课次') }}</span><input v-model.number="planForm.sessionsPerWeek" type="number" min="1" max="7" /></label>
          <label class="qt-field"><span>{{ $t('单课时长（分钟）') }}</span><input v-model.number="planForm.sessionMinutes" type="number" min="15" max="180" step="5" /></label>
          <label class="qt-field"><span>{{ $t('教学周期（周）') }}</span><input v-model.number="planForm.weeks" type="number" min="1" max="16" /></label>
          <label class="qt-field wide"><span>{{ $t('教学目标（可选）') }}</span><input v-model="planForm.goals" type="text" :placeholder="$t('例如：能背诵并说明主题')" /></label>
        </div>
        <div class="qt-actions"><button type="button" class="qt-btn primary" :disabled="!state.parse || steps.isRunning()" @click="runPlan()"><i class="ri-magic-line"></i>{{ state.plan ? $t('重新生成') : $t('生成教学计划') }}</button>
          <template v-if="state.plan"><button type="button" class="qt-btn" :disabled="state.plan.reviewStatus === 'accepted'" @click="acceptPlan"><i class="ri-check-line"></i>{{ $t('接受') }}</button><button type="button" class="qt-btn" @click="planEditing = !planEditing"><i class="ri-edit-line"></i>{{ planEditing ? $t('完成编辑') : $t('编辑') }}</button></template>
        </div>
        <p v-if="langBusy.plan" class="qt-note info"><i class="ri-loader-4-line qt-spin"></i>{{ $t('正在按当前语言生成教学计划…') }}</p>
        <div v-if="steps.runtime.plan.state === 'running' || langBusy.plan" class="qt-skeleton"><span v-for="n in 6" :key="n" :style="{ width: `${95 - n * 8}%` }"></span></div>
        <template v-else-if="state.plan">
          <div class="qt-cols">
            <section class="qt-panel"><header class="qt-panel__head"><strong><i class="ri-user-settings-line"></i>{{ $t('课程适配说明') }}</strong><span class="qt-layer l3">AI</span></header><textarea v-if="planEditing" v-model="state.plan.adaptation" class="qt-textarea" rows="4" @change="savePlanEdits"></textarea><p v-else style="margin:0;font-size:12.5px;line-height:1.7">{{ state.plan.adaptation }}</p></section>
            <section class="qt-panel"><header class="qt-panel__head"><strong><i class="ri-flag-line"></i>{{ $t('学习目标与难度层级') }}</strong><span class="qt-chip">{{ state.plan.difficultyLabel }}</span></header><ul style="margin:0;padding-inline-start:18px;font-size:12.5px;display:grid;gap:4px"><li v-for="(o, i) in state.plan.objectives" :key="i"><input v-if="planEditing" v-model="state.plan.objectives[i]" class="qt-input" style="width:100%" @change="savePlanEdits" /><template v-else>{{ o }}</template></li></ul></section>
          </div>
          <section class="qt-panel"><header class="qt-panel__head"><strong><i class="ri-calendar-line"></i>{{ $t('总课程计划与周课程安排') }}</strong><span class="qt-muted">{{ state.plan.overview }}</span></header>
            <table class="qt-table"><thead><tr><th>{{ $t('周') }}</th><th>{{ $t('课') }}</th><th>{{ $t('节范围') }}</th><th>{{ $t('单课结构与时间分配') }}</th><th>{{ $t('重点词汇') }}</th><th>{{ $t('复习 / 测试目标') }}</th></tr></thead><tbody>
              <tr v-for="s in state.plan.sessions" :key="s.index"><td>W{{ s.week }}</td><td><b>{{ s.title }}</b><ul style="margin:4px 0 0;padding-inline-start:16px" class="qt-muted"><li v-for="(o, i) in s.objectives" :key="i">{{ o }}</li></ul></td><td style="direction:ltr;white-space:nowrap">{{ verseRange(s.from, s.to, state.selection.chapter) }}</td><td><div class="qt-tags"><span v-for="seg in s.segments" :key="seg.name" class="qt-chip" :title="seg.activity">{{ seg.name }} · {{ seg.minutes }}′</span></div></td><td class="qt-ar sm" lang="ar">{{ s.vocabulary.join(' · ') }}</td><td class="qt-muted">{{ s.reviewGoal }}<br />{{ s.testGoal }}</td></tr>
            </tbody></table>
          </section>
          <div class="qt-actions end"><button type="button" class="qt-btn primary lg" :disabled="steps.isRunning()" @click="runGraph()"><i class="ri-arrow-right-line"></i>{{ $t('下一步：生成理解图') }}</button></div>
        </template>
      </QtStep>

      <!-- ── 4 理解图 ── -->
      <QtStep step-key="graph" :index="3" :title="steps.metas[3].title" :hint="steps.metas[3].hint" :icon="steps.metas[3].icon" :runtime="steps.runtime.graph" :is-current="steps.currentKey.value === 'graph'" v-show="activeStep === 'graph'">
        <template #tools><button type="button" class="qt-btn sm" :disabled="!state.parse || steps.isRunning()" @click="runGraph()"><i class="ri-refresh-line"></i>{{ $t('刷新理解图') }}</button><span v-if="state.graph" class="qt-chip">{{ $t('{n} 节点 · {e} 关联', { n: state.graph.nodes.length, e: state.graph.edges.length }) }}</span></template>
        <p v-if="langBusy.graph" class="qt-note info"><i class="ri-loader-4-line qt-spin"></i>{{ $t('正在按当前语言重建理解图…') }}</p>
        <QtGraph v-if="state.graph" :graph="state.graph" :verses="state.verses" :materials="materials" :questions="allQuestions" :students="state.students" :lang="state.lang" />
        <div v-if="state.graph" class="qt-actions end"><button type="button" class="qt-btn primary lg" :disabled="steps.isRunning()" @click="runQuiz()"><i class="ri-arrow-right-line"></i>{{ $t('下一步：生成第一套练习') }}</button></div>
      </QtStep>

      <!-- ── 5 动态出题 ── -->
      <QtStep step-key="quiz" :index="4" :title="steps.metas[4].title" :hint="steps.metas[4].hint" :icon="steps.metas[4].icon" :runtime="steps.runtime.quiz" :is-current="steps.currentKey.value === 'quiz'" v-show="activeStep === 'quiz'">
        <template #tools>
          <label class="qt-field" style="grid-auto-flow:column;align-items:center"><span>{{ $t('题数') }}</span><input v-model.number="quizForm.count" type="number" min="3" max="30" style="width:64px" /></label>
          <select v-model="quizForm.kind" class="qt-select"><option value="practice">{{ $t('练习') }}</option><option value="exam">{{ $t('考试') }}</option></select>
          <button type="button" class="qt-btn sm primary" :disabled="!state.parse || steps.isRunning()" @click="runQuiz()"><i class="ri-add-line"></i>{{ $t('再生成一套') }}</button>
          <button type="button" class="qt-btn sm" :disabled="!state.parse || steps.isRunning()" @click="runQuiz(3)"><i class="ri-stack-line"></i>{{ $t('连续生成三套') }}</button>
        </template>
        <div v-if="rangePapers.length" class="qt-tags">
          <span v-for="p in rangePapers" :key="p.id" class="qt-chip link" :class="{ info: p.id === state.activePaperId }" @click="state.activePaperId = p.id">{{ p.title }} · {{ $t('{n} 题', { n: p.questions.length }) }}</span>
        </div>
        <p v-if="rangePapers.length >= 2" class="qt-note" :class="distinctSignatures ? 'ok' : 'bad'"><i class="ri-fingerprint-line"></i>{{ distinctSignatures ? $t('验收 05：本范围 {n} 套试卷指纹互不相同（题目组合 / 顺序 / 选项顺序 / 措辞随机）', { n: rangePapers.length }) : $t('有两套试卷完全相同') }}</p>
        <template v-if="activePaper">
          <div class="qt-tags"><span class="qt-chip">{{ $t('种子 {s}', { s: activePaper.seed }) }}</span><span class="qt-chip">{{ $t('{n} 题通过一致性检查', { n: activePaper.questions.filter((q) => q.verified).length }) }}</span><span class="qt-chip">{{ typeSummary(activePaper) }}</span></div>
          <div style="display:grid;gap:10px">
            <QtQuestion v-for="(q, i) in activePaper.questions" :key="q.id" :q="q" :index="i" mode="review" :lang="state.lang" :verses="chapterVerses" :materials="materials" traceable @edit="editQuestion" @confirm="confirmQuestion" @regenerate="regenerateQuestion" @remove="removeQuestion" />
          </div>
          <div class="qt-actions end"><button type="button" class="qt-btn primary lg" :disabled="steps.isRunning()" @click="runStudents()"><i class="ri-arrow-right-line"></i>{{ $t('下一步：5 名学生作答') }}</button></div>
        </template>
      </QtStep>

      <!-- ── 6 五名学生 ── -->
      <QtStep step-key="students" :index="5" :title="steps.metas[5].title" :hint="steps.metas[5].hint" :icon="steps.metas[5].icon" :runtime="steps.runtime.students" :is-current="steps.currentKey.value === 'students'" v-show="activeStep === 'students'">
        <template #tools><button type="button" class="qt-btn sm" :disabled="!activePaper || steps.isRunning()" @click="runStudents()"><i class="ri-shuffle-line"></i>{{ $t('重新载入预置答题') }}</button></template>
        <div class="qt-students">
          <div v-for="s in state.students" :key="s.id" class="qt-student" :class="{ active: focusStudent === s.id }" @click="focusStudent = s.id">
            <div class="qt-student__head"><span class="qt-avatar">{{ studentBadge(s) }}</span><div><div class="qt-student__name">{{ s.name[state.lang] }}</div><div class="qt-muted">{{ $t('虚拟学生 · 无真实信息') }}</div></div></div>
            <div class="qt-student__desc">{{ s.description[state.lang] }}</div>
            <div v-if="scoreOf(s.id)" class="qt-score" :class="pctClass(scoreOf(s.id)!.pct)"><bdi dir="ltr">{{ scoreOf(s.id)!.pct }}%</bdi><small class="qt-muted" style="font-size:11px;font-weight:600"> <bdi dir="ltr">{{ scoreOf(s.id)!.correct }}/{{ scoreOf(s.id)!.total }}</bdi></small></div>
          </div>
        </div>
        <section v-if="activePaper && state.records.length" class="qt-panel">
          <header class="qt-panel__head"><strong><i class="ri-edit-2-line"></i>{{ $t('{s} 的答题记录（改任一答案 → 群体统计立即重算）', { s: studentName(focusStudent) }) }}</strong><span class="grow"></span><span class="qt-muted">{{ $t('记录字段：学生编号 / 题目编号 / 原始答案 / 正误 / 尝试次数 / 时间戳') }}</span></header>
          <table class="qt-table"><thead><tr><th>#</th><th>{{ $t('题型') }}</th><th>{{ $t('维度') }}</th><th>{{ $t('来源') }}</th><th>{{ $t('学生答案') }}</th><th>{{ $t('正误') }}</th><th>{{ $t('来源') }}</th></tr></thead><tbody>
            <tr v-for="(q, i) in activePaper.questions" :key="q.id">
              <td>Q{{ i + 1 }}</td><td>{{ typeLabel(q.type) }}</td><td>{{ dimLabel(q.dimension) }}</td><td style="direction:ltr;white-space:nowrap">{{ refLabel(q.sourceRefs[0] || '') }}</td>
              <td>
                <select v-if="typeof q.answer === 'number'" class="qt-select" :value="recordOf(focusStudent, q.id)?.answer ?? -1" @change="setAnswer(q, Number(($event.target as HTMLSelectElement).value))"><option :value="-1">—</option><option v-for="(o, j) in q.options" :key="j" :value="j">{{ String.fromCharCode(65 + j) }}</option></select>
                <span v-else style="display:inline-flex;gap:6px;align-items:center"><span class="qt-muted" dir="ltr">{{ seqLabel(recordOf(focusStudent, q.id)?.answer) }}</span><button type="button" class="qt-btn xs" @click="setAnswer(q, q.answer)">{{ $t('设为正确') }}</button><button type="button" class="qt-btn xs ghost" @click="setAnswer(q, wrongSeq(q))">{{ $t('设为错误') }}</button></span>
              </td>
              <td><span class="qt-chip" :class="recordOf(focusStudent, q.id)?.correct ? 'ok' : 'bad'">{{ recordOf(focusStudent, q.id)?.correct ? '✓' : '✗' }}</span></td>
              <td><span class="qt-chip">{{ originLabel(recordOf(focusStudent, q.id)?.origin) }}</span></td>
            </tr>
          </tbody></table>
        </section>
        <div v-if="state.records.length" class="qt-actions end"><button type="button" class="qt-btn primary lg" :disabled="steps.isRunning()" @click="runAnalysis()"><i class="ri-arrow-right-line"></i>{{ $t('下一步：个人与群体分析') }}</button></div>
      </QtStep>

      <!-- ── 7 薄弱点分析 ── -->
      <QtStep step-key="analysis" :index="6" :title="steps.metas[6].title" :hint="steps.metas[6].hint" :icon="steps.metas[6].icon" :runtime="steps.runtime.analysis" :is-current="steps.currentKey.value === 'analysis'" v-show="activeStep === 'analysis'">
        <template #tools><button type="button" class="qt-btn sm" :disabled="!state.analysis || steps.isRunning()" @click="runAnalysis(true, !!state.analysis?.commentary)"><i class="ri-chat-3-line"></i>{{ state.analysis?.commentary ? $t('重新生成教学解释') : $t('AI 教学解释') }}</button><span v-if="state.analysis" class="qt-chip">{{ $t('计算于 {t}', { t: uiTime(state.analysis.group.computedAt) }) }}</span></template>
        <p v-if="langBusy.analysis || langBusy.commentary" class="qt-note info"><i class="ri-loader-4-line qt-spin"></i>{{ langBusy.commentary ? $t('正在按当前语言生成 AI 教学解释…') : $t('正在按当前语言重算分析…') }}</p>
        <template v-if="state.analysis">
          <section class="qt-panel">
            <header class="qt-panel__head"><strong><i class="ri-bar-chart-box-line"></i>{{ $t('个人学习分析（总分 + 五维，可追溯到章/节）') }}</strong></header>
            <div class="qt-heat">
              <span></span><span v-for="s in state.students" :key="s.id" style="text-align:center;font-weight:800">{{ s.name[state.lang] }}</span>
              <template v-for="row in heatRows" :key="row.key"><span>{{ row.label }}</span><span v-for="s in state.students" :key="s.id" class="cell" :class="row.cls(s.id)">{{ row.val(s.id) }}</span></template>
            </div>
            <div class="qt-students" style="margin-top:6px">
              <div v-for="a in state.analysis.students" :key="a.studentId" class="qt-student" style="cursor:default">
                <div class="qt-student__head"><span class="qt-avatar">{{ studentCode(a.studentId) }}</span><div><div class="qt-student__name">{{ studentName(a.studentId) }}</div><div class="qt-score" :class="pctClass(a.total.pct)" style="font-size:20px"><bdi dir="ltr">{{ a.total.pct }}%</bdi></div></div></div>
                <div class="qt-muted"><b>{{ $t('主要弱项') }}</b></div>
                <div class="qt-tags"><span v-for="w in a.weakItems.slice(0, 3)" :key="w.key" class="qt-chip bad" :title="w.refs.join(', ')">{{ w.label }} <bdi dir="ltr">{{ w.wrong }}/{{ w.total }}</bdi></span><span v-if="!a.weakItems.length" class="qt-chip ok">{{ $t('无明显弱项') }}</span></div>
                <div class="qt-muted"><b>{{ $t('推荐动作') }}</b></div>
                <ul style="margin:0;padding-inline-start:16px;font-size:11.5px;display:grid;gap:3px"><li v-for="(r, i) in a.recommendations" :key="i">{{ r }}</li></ul>
              </div>
            </div>
          </section>
          <section class="qt-panel">
            <header class="qt-panel__head"><strong><i class="ri-team-line"></i>{{ $t('3-5 名学生共同问题（本演示的差异化能力）') }}</strong><span class="grow"></span><span class="qt-chip" :class="state.analysis.group.commonCount ? 'bad' : 'ok'">{{ $t('{n} 个群体共同薄弱点', { n: state.analysis.group.commonCount }) }}</span></header>
            <div style="display:grid;gap:8px">
              <div v-for="issue in state.analysis.group.issues" :key="issue.key" class="qt-issue" :class="issue.verdict">
                <div class="qt-ratio" :style="{ '--p': issue.ratio * 100, '--c': issue.verdict === 'common' ? 'var(--color-danger)' : issue.verdict === 'hint' ? 'var(--color-warning)' : 'var(--qt-teal)' }"><b dir="ltr">{{ issue.wrongCount }}/{{ issue.studentCount }}</b></div>
                <div class="qt-issue__body">
                  <div class="qt-issue__label">{{ issue.label }} <span class="qt-chip" :class="issue.verdict === 'common' ? 'bad' : issue.verdict === 'hint' ? 'warn' : ''">{{ verdictLabel(issue.verdict) }}</span> <span class="qt-chip info">{{ classLabel(issue.classification) }}</span></div>
                  <div class="qt-issue__note">{{ issue.note }}</div>
                  <div class="qt-tags"><span v-for="sid in issue.wrongStudents" :key="sid" class="qt-chip">{{ studentName(sid) }}</span><span v-if="issue.refs.length" class="qt-muted" dir="ltr">{{ issue.refs.slice(0, 5).join(', ') }}</span></div>
                </div>
                <button type="button" class="qt-btn sm gold" :disabled="steps.isRunning()" @click="runReinforce(issue.key)"><i class="ri-flashlight-line"></i>{{ $t('生成强化教学') }}</button>
              </div>
              <p v-if="!state.analysis.group.issues.length" class="qt-note ok"><i class="ri-emotion-happy-line"></i>{{ $t('5 名学生没有错题：修改一两个答案再看群体统计的变化') }}</p>
            </div>
            <p v-if="state.analysis.commentary" class="qt-note info" style="white-space:pre-wrap"><i class="ri-sparkling-2-line"></i><span><span class="qt-layer l3">AI</span> {{ state.analysis.commentary }}</span></p>
          </section>
        </template>
      </QtStep>

      <!-- ── 8 强化与复测 ── -->
      <QtStep step-key="reinforce" :index="7" :title="steps.metas[7].title" :hint="steps.metas[7].hint" :icon="steps.metas[7].icon" :runtime="steps.runtime.reinforce" :is-current="steps.currentKey.value === 'reinforce'" v-show="activeStep === 'reinforce'">
        <template #tools><span v-if="rf" class="qt-chip gold"><i class="ri-crosshair-line"></i>{{ rf.targetLabel }}</span><span v-if="rf" class="qt-chip info">{{ classLabel(rf.classification) }}</span></template>
        <p v-if="langBusy.reinforce" class="qt-note info"><i class="ri-loader-4-line qt-spin"></i>{{ $t('正在按当前语言生成强化教学…') }}</p>
        <template v-if="rf">
          <div class="qt-cols">
            <section class="qt-panel"><header class="qt-panel__head"><strong><i class="ri-book-read-line"></i>{{ $t('简要解释（仅基于批准资料）') }}</strong><span class="qt-layer l3">AI</span></header><p style="margin:0;font-size:12.5px;line-height:1.7">{{ rf.explanation }}</p>
              <div class="qt-actions">
                <span v-if="rf.reviewStatus === 'confirmed'" class="qt-chip ok"><i class="ri-shield-check-line"></i>{{ $t('教师已确认') }}</span>
                <button v-else type="button" class="qt-btn sm" :disabled="reviewBusy" @click="acceptReinforcement"><i class="ri-check-line"></i>{{ $t('接受') }}</button>
                <button v-if="!editingExplanation" type="button" class="qt-btn sm ghost" :disabled="reviewBusy" @click="startEditExplanation"><i class="ri-edit-line"></i>{{ $t('编辑解释') }}</button>
                <template v-else>
                  <button type="button" class="qt-btn sm primary" :disabled="reviewBusy" @click="saveExplanation"><i class="ri-save-line"></i>{{ $t('保存') }}</button>
                  <button type="button" class="qt-btn sm ghost" @click="editingExplanation = false">{{ $t('取消') }}</button>
                </template>
              </div>
              <div v-if="editingExplanation" class="qt-field"><span>{{ $t('简要解释（AI 生成，教师可改；只应基于批准资料）') }}</span><textarea v-model="draftExplanation" rows="4"></textarea></div>
              <div class="qt-actions"><button type="button" class="qt-btn sm" :disabled="ttsBusy" @click="teachingAudio(rf.explanation)"><i :class="ttsBusy ? 'ri-loader-4-line qt-spin' : 'ri-volume-up-line'"></i>{{ $t('教学音频') }}</button><button type="button" class="qt-btn sm" :disabled="steps.isRunning() || mediaBusy" @click="makeCard('review', rf.cards.flatMap((c) => c.refs).slice(0, 3))"><i class="ri-image-line"></i>{{ $t('生成复习卡图片') }}</button></div>
              <div v-if="teachSpeech" class="qt-audio"><audio :src="teachSpeech.url" controls></audio><span class="qt-chip" :class="teachSpeech.fallback ? 'warn' : 'ok'">{{ teachSpeech.fallback ? $t('本地引擎兜底') : 'fal MiniMax speech-02-hd' }}</span></div>
            </section>
            <section class="qt-panel"><header class="qt-panel__head"><strong><i class="ri-sticky-note-line"></i>{{ $t('复习卡') }}</strong></header>
              <div class="qt-cards"><div v-for="(c, i) in rf.cards" :key="i" class="qt-card"><div class="qt-card__title">{{ c.title }}</div><div v-if="c.arabic" class="qt-ar sm" lang="ar">{{ c.arabic }}</div><div v-if="c.body" class="qt-card__body">{{ c.body }}</div><div class="qt-muted" style="direction:ltr">{{ c.refs.slice(0, 4).join(', ') }}</div></div></div>
            </section>
          </div>
          <section class="qt-panel">
            <header class="qt-panel__head"><strong><i class="ri-pencil-ruler-2-line"></i>{{ $t('针对性练习（{n} 题）', { n: rf.practice.questions.length }) }}</strong><span class="grow"></span><span class="qt-chip">{{ rf.practice.title }}</span></header>
            <div style="display:grid;gap:8px"><QtQuestion v-for="(q, i) in rf.practice.questions" :key="q.id" :q="q" :index="i" mode="review" :lang="state.lang" :verses="chapterVerses" :materials="materials" traceable @edit="(p) => editQuestionIn(rf!.practice.id, p)" @confirm="(id) => confirmQuestionIn(rf!.practice.id, id)" @regenerate="(id) => regenerateIn(rf!.practice.id, id)" @remove="(id) => removeIn(rf!.practice.id, id)" /></div>
          </section>
          <section class="qt-panel">
            <header class="qt-panel__head"><strong><i class="ri-restart-line"></i>{{ $t('复测（{n} 题）与前后对比', { n: rf.retest.questions.length }) }}</strong><span class="grow"></span><button type="button" class="qt-btn sm primary" :disabled="steps.isRunning()" @click="runRetest"><i class="ri-play-line"></i>{{ rf.after ? $t('重新复测') : $t('运行复测') }}</button></header>
            <!-- 前后对比只看 rf.compare：原卷与复测卷共同考到的知识点，同一组知识点、同一批学生做分母 -->
            <template v-if="rf.after && rf.compare">
              <div class="qt-compare">
                <div class="qt-compare__tile"><div class="qt-muted">{{ $t('目标薄弱点答错人数') }}</div><div class="big" :class="lessIsBetter(rf.compare.target.before, rf.compare.target.after)"><bdi dir="ltr">{{ rf.compare.target.before }} → {{ rf.compare.target.after ?? '—' }}</bdi></div><div class="qt-muted">{{ $t('共 {n} 名学生', { n: rf.compare.target.studentCount }) }}</div></div>
                <template v-if="rf.compare.keys.length">
                  <div class="qt-compare__tile"><div class="qt-muted">{{ $t('共同知识点中的群体薄弱点') }}</div><div class="big" :class="lessIsBetter(rf.compare.common.before, rf.compare.common.after)"><bdi dir="ltr">{{ rf.compare.common.before }} → {{ rf.compare.common.after }}</bdi></div><div class="qt-muted">{{ $t('共 {n} 个知识点', { n: rf.compare.keys.length }) }}</div></div>
                  <div v-for="c in rf.compare.students" :key="c.studentId" class="qt-compare__tile"><div class="qt-muted">{{ studentName(c.studentId) }}</div><div class="big" :class="lessIsBetter(c.after.pct, c.before.pct)"><bdi dir="ltr">{{ c.before.pct }}% → {{ c.after.pct }}%</bdi></div><div class="qt-muted">{{ $t('原卷 {a}/{b} 题 → 复测 {c}/{d} 题', { a: c.before.correct, b: c.before.total, c: c.after.correct, d: c.after.total }) }}</div></div>
                </template>
              </div>
              <p class="qt-note info"><i class="ri-information-line"></i>{{ rf.compare.keys.length ? $t('口径：原卷与复测卷题目不同，这里只比两卷都考到的 {n} 个知识点。答错人数按 {m} 名学生计；群体薄弱点指被 3 名及以上学生答错的知识点；学生正确率只算这些知识点的题。', { n: rf.compare.keys.length, m: rf.compare.target.studentCount }) : $t('复测卷与原卷没有共同考到的知识点，只比较目标薄弱点的答错人数。') }}</p>
            </template>
            <p v-else-if="rf.after" class="qt-note warn"><i class="ri-alert-line"></i>{{ $t('这份复测结果按旧口径计算，点「重新复测」按同一口径重算前后对比。') }}</p>
            <div v-if="rf.after" style="display:grid;gap:8px"><QtQuestion v-for="(q, i) in rf.retest.questions" :key="q.id" :q="q" :index="i" mode="review" :lang="state.lang" :verses="chapterVerses" :materials="materials" traceable @edit="(p) => editQuestionIn(rf!.retest.id, p)" @confirm="(id) => confirmQuestionIn(rf!.retest.id, id)" @regenerate="(id) => regenerateIn(rf!.retest.id, id)" @remove="(id) => removeIn(rf!.retest.id, id)" /></div>
            <p v-else class="qt-note">{{ $t('点「运行复测」：5 名学生完成强化练习后再答复测卷，系统重算并展示前后变化。学生端也可以真人作答后再回来看对比。') }}</p>
          </section>
          <div class="qt-actions end"><button type="button" class="qt-btn primary lg" :disabled="steps.isRunning()" @click="steps.currentKey.value = 'media'; scrollToStep('media')"><i class="ri-arrow-right-line"></i>{{ $t('下一步：图片与视频') }}</button></div>
        </template>
        <p v-else-if="!langBusy.reinforce" class="qt-note">{{ $t('先在第 7 步的群体问题里点「生成强化教学」') }}</p>
      </QtStep>

      <!-- ── 9 图片与视频 ── -->
      <QtStep step-key="media" :index="8" :title="steps.metas[8].title" :hint="steps.metas[8].hint" :icon="steps.metas[8].icon" :runtime="steps.runtime.media" :is-current="steps.currentKey.value === 'media'" v-show="activeStep === 'media'">
        <template #tools>
          <label class="qt-toggle" :title="$t('背景由 fal 文生图绘制（提示词不含经文与人物），经文仍是文字层')"><input v-model="useFal" type="checkbox" :disabled="!state.status?.falReady" /><i class="qt-switch"></i>{{ $t('fal 背景') }}<span class="qt-chip" :class="state.status?.falReady ? 'ok' : ''">{{ state.status?.falReady ? $t('已配置') : $t('未配置') }}</span></label>
          <span class="qt-chip" :class="state.status?.ffmpegReady ? 'ok' : 'warn'">ffmpeg {{ state.status?.ffmpegReady ? '✓' : '✗' }}</span>
        </template>
        <section class="qt-panel">
          <header class="qt-panel__head"><strong><i class="ri-image-2-line"></i>{{ $t('教学视觉材料（两类以上；经文文字不由图像模型生成）') }}</strong><span class="grow"></span>
            <button v-for="k in cardKinds" :key="k" type="button" class="qt-btn sm" :disabled="!state.parse || mediaBusy" @click="makeCard(k)"><i class="ri-add-line"></i>{{ kindLabel(k) }}</button>
          </header>
          <p v-if="liveMsg && mediaBusy" class="qt-note info"><i class="ri-loader-4-line qt-spin"></i>{{ liveMsg }}</p>
          <div v-if="langCards.length" class="qt-media-grid">
            <div v-for="c in langCards" :key="c.id" class="qt-media"><img :src="c.url" :alt="c.title" loading="lazy" @click="openPath(c.path)" /><div class="qt-media__foot"><span class="qt-chip gold">{{ kindLabel(c.kind) }}</span><span class="qt-muted">{{ c.title }}</span><span class="grow"></span><span class="qt-chip" :class="c.background === 'fal' ? 'info' : ''">{{ c.background === 'fal' ? $t('fal 背景') : $t('模板背景') }}</span><button type="button" class="qt-btn xs ghost" :title="$t('展开文字层：可选中复制，并与锁定经文逐字比对')" @click="toggleTextLayer(c.id)"><i class="ri-file-text-line"></i>{{ $t('文字层') }}</button><button type="button" class="qt-btn xs danger" :disabled="reviewBusy" @click="removeCard(c.id)"><i class="ri-delete-bin-line"></i></button><span class="qt-layer l1" :title="c.textLayer.join('\n')"><i class="ri-text"></i>{{ $t('文字层 ×{n}', { n: c.textLayer.length }) }}</span><button type="button" class="qt-btn xs ghost" @click="openPath(c.path, true)"><i class="ri-folder-open-line"></i></button></div>
              <!--
                §13.1 末句：经文图层必须保持「可复制或可校验」的真实文本，而不是无法核对的像素。
                所以这里把文字层摊开：可以选中复制，每一条还实时与锁定经文（L1）逐字比对，
                对得上打勾、对不上标红 —— 客户当场就能验「这张卡上的经文没被改过」。
              -->
              <div v-if="openTextLayer === c.id" class="qt-panel" style="margin-top:8px">
                <header class="qt-panel__head">
                  <strong><i class="ri-shield-check-line"></i>{{ $t('经文文字层（可复制 · 与锁定经文逐字比对）') }}</strong>
                  <span class="grow"></span>
                  <button type="button" class="qt-btn xs ghost" @click="copyTextLayer(c)"><i class="ri-file-copy-line"></i>{{ $t('复制全部') }}</button>
                </header>
                <ul class="qt-textlayer">
                  <li v-for="(t, i) in c.textLayer" :key="i">
                    <span class="qt-chip" :class="matchesLockedVerse(t) ? 'ok' : 'warn'"><i :class="matchesLockedVerse(t) ? 'ri-check-line' : 'ri-error-warning-line'"></i>{{ matchesLockedVerse(t) ? $t('与锁定经文一致') : $t('不在本章锁定经文里') }}</span>
                    <bdi class="qt-ar sm" lang="ar" dir="rtl">{{ t }}</bdi>
                  </li>
                </ul>
              </div>
            </div>
          </div>
          <div v-else class="qt-empty"><i class="ri-gallery-line"></i>{{ $t('点上方按钮现场生成词汇卡 / 概念图 / 事件时间线 / 复习卡 / 章节结构图') }}</div>
        </section>
        <div class="qt-cols">
          <section class="qt-panel">
            <header class="qt-panel__head"><strong><i class="ri-film-line"></i>{{ $t('视频教学提纲 / 脚本 / 分镜（现场生成）') }}</strong><span class="grow"></span><button type="button" class="qt-btn sm primary" :disabled="!state.parse || mediaBusy" @click="makeScript"><i class="ri-magic-line"></i>{{ script ? $t('重新生成脚本') : $t('生成脚本与分镜') }}</button></header>
            <p v-if="langBusy.script" class="qt-note info"><i class="ri-loader-4-line qt-spin"></i>{{ $t('正在按当前语言生成视频脚本…') }}</p>
            <template v-if="script">
              <div class="qt-tags"><span class="qt-chip gold">{{ script.title }}</span><span class="qt-chip">{{ script.totalSec }}s</span><span class="qt-chip">{{ script.generator === 'llm' ? $t('LLM 润色') : $t('模板') }}</span><span class="qt-layer l3">AI</span></div>
              <p class="qt-note">{{ script.objective }}</p>
              <div class="qt-scenes"><div v-for="sc in script.scenes" :key="sc.no" class="qt-scene"><div class="qt-scene__no">{{ sc.no }}<small style="font-size:9px">{{ sc.durationSec }}s</small></div><div class="qt-scene__body"><div><span class="lbl">{{ $t('镜头') }}</span>{{ sc.visual }}</div><div><span class="lbl">{{ $t('旁白') }}</span>{{ sc.narration }}</div><div v-if="sc.subtitle"><span class="lbl">{{ $t('字幕') }}</span><span :class="{ 'qt-ar sm': /[؀-ۿ]/.test(sc.subtitle) }" style="white-space:pre-wrap">{{ sc.subtitle }}</span></div><div v-if="sc.verseRefs.length" class="qt-muted" style="direction:ltr"><span class="qt-layer l1">L1</span> {{ sc.verseRefs.join(', ') }}</div></div></div></div>
              <div class="qt-muted">{{ $t('复习题：{q}', { q: script.reviewQuestions.join(' / ') }) }}</div>
              <!-- 验收 14：关键 AI 输出要有接受 / 编辑 / 重新生成。重新生成在上面的标题栏，这里补另外两件 -->
              <div class="qt-actions">
                <span v-if="script.reviewStatus === 'confirmed'" class="qt-chip ok"><i class="ri-shield-check-line"></i>{{ $t('教师已确认') }}</span>
                <button v-else type="button" class="qt-btn sm" :disabled="reviewBusy" @click="acceptScript"><i class="ri-check-line"></i>{{ $t('接受') }}</button>
                <button v-if="!editingScript" type="button" class="qt-btn sm ghost" :disabled="reviewBusy" @click="startEditScript"><i class="ri-edit-line"></i>{{ $t('编辑教学目标') }}</button>
                <template v-else>
                  <button type="button" class="qt-btn sm primary" :disabled="reviewBusy" @click="saveScript"><i class="ri-save-line"></i>{{ $t('保存') }}</button>
                  <button type="button" class="qt-btn sm ghost" @click="editingScript = false">{{ $t('取消') }}</button>
                </template>
              </div>
              <div v-if="editingScript" class="qt-field"><span>{{ $t('教学目标（AI 生成，教师可改；改完仍标记为 AI 生成）') }}</span><textarea v-model="draftScriptObjective" rows="3"></textarea></div>
              <div class="qt-actions"><button type="button" class="qt-btn gold" :disabled="mediaBusy || !state.status?.ffmpegReady" @click="makeVideo"><i :class="mediaBusy ? 'ri-loader-4-line qt-spin' : 'ri-clapperboard-line'"></i>{{ $t('合成视频样例（分镜 + 配音）') }}</button><span class="qt-muted">{{ $t('配音优先 fal MiniMax speech-02-hd，本地引擎兜底并标注') }}</span></div>
            </template>
          </section>
          <section class="qt-panel">
            <header class="qt-panel__head"><strong><i class="ri-movie-line"></i>{{ $t('视频成片样例') }}</strong><span class="qt-muted">{{ $t('允许预置；现场脚本必须真生成') }}</span></header>
            <div v-if="state.videos.length" class="qt-media-grid">
              <div v-for="v in state.videos" :key="v.id" class="qt-media"><video :src="v.url" controls preload="metadata"></video><div class="qt-media__foot"><span class="qt-chip" :class="v.source === 'generated' ? 'ok' : 'info'">{{ v.source === 'generated' ? $t('现场合成') : $t('预置样例') }}</span><span v-if="v.voiceEngine" class="qt-chip" :class="v.voiceEngine === 'fal' ? 'ok' : v.voiceEngine === 'local' ? 'warn' : ''">{{ v.voiceEngine === 'fal' ? 'fal speech-02-hd' : v.voiceEngine === 'local' ? $t('本地配音兜底') : $t('无配音') }}</span><span class="grow"></span><button type="button" class="qt-btn xs ghost" @click="openPath(v.path, true)"><i class="ri-folder-open-line"></i></button></div></div>
            </div>
            <div v-else class="qt-empty"><i class="ri-video-line"></i>{{ $t('先生成脚本，再合成样例') }}</div>
          </section>
        </div>
      </QtStep>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * 教师端九步主线（说明书第七节）：选经文 → 识别结构 → 提纲课程 → 理解图 → 动态出题 → 5 名学生 → 分析 → 强化复测 → 图片视频。
 * 每步独立状态；长任务的进度经 WORKBENCH_QURAN_EVENT 推到粘性进度条。
 */
import { computed, onBeforeUnmount, onMounted, reactive, ref , watch} from 'vue';
import type { QuranApprovedMaterial, QuranPaper, QuranProgressEvent, QuranQuestion, QuranSpeechResult, QuranVerse } from '@totalclaw/ipc-contracts';
import { t as i18nT } from '../../i18n';
import QtStep from './QtStep.vue';
import QtProgress from './QtProgress.vue';
import QtVerse from './QtVerse.vue';
import QtQuestion from './QtQuestion.vue';
import QtGraph from './QtGraph.vue';
import {
  DIM_ORDER, activePaper, api, cardLang, ltr, chapterName, classLabel, contentGrade, currentScript, dimLabel, errorMessage, kindLabel, langBusy, localizedGrade, openPath, pctClass, rangeLabel, refLabel, refreshStatus, scrollToStep,
  stageLabel, state, studentBadge, studentName, teacherSteps, tierLabel, typeLabel, uiTime, verdictLabel, verseRange, type StepKey,
} from './shared';

/** 九步状态在 shared 的单例里：切学生端 / 管理层再回来、刷新页面都不归零 */
const steps = teacherSteps();
const liveMsg = ref('');
const materials = ref<QuranApprovedMaterial[]>([]);
const chapterVerses = ref<QuranVerse[]>([]);
const searchQ = ref('');
const searchHits = ref<string[]>([]);
const pasted = ref('');
const speech = ref<QuranSpeechResult | null>(null);
const teachSpeech = ref<QuranSpeechResult | null>(null);
const ttsBusy = ref(false);
const mediaBusy = ref(false);
const useFal = ref(false);
const planEditing = ref(false);
const focusStudent = ref('stu-b');
/** 当前内容语言的视频脚本（切语言时由 syncContentLang 换成同语言那份或补生成） */
const script = currentScript;
const cardKinds = ['vocab', 'concept_map', 'timeline', 'review', 'structure'] as const;
const planForm = reactive({ grade: i18nT('大学一年级'), level: 'beginner' as 'beginner' | 'intermediate' | 'advanced', sessionsPerWeek: 2, sessionMinutes: 45, weeks: 2, goals: '' });
const quizForm = reactive({ count: 10, kind: 'practice' as 'practice' | 'exam' });

// ── 左右分栏：当前显示哪一步 ──
// 跟着流程走：某一步开始跑（steps.currentKey 变）就自动切过去，演示时不用手动找；
// 教师点左栏也能随时回看已完成的步骤，不影响正在跑的那一步。
const activeStep = ref<StepKey>(steps.currentKey.value);
watch(steps.currentKey, (k) => { activeStep.value = k; });
function gotoStep(key: StepKey): void {
  activeStep.value = key;
  void scrollToStep(key);
}

// ── 现场演示场景（说明书第十九章）──
// ── 教师审核 AI 产物（验收 14：接受 / 编辑 / 重新生成）──
// 「重新生成」各自已有入口（脚本在标题栏、强化在群体问题行），这里补接受与编辑。
// 教师改过之后仍是 AI 生成物：aiGenerated 不动，§6 第三层的标记不因人改过就抹掉。
const reviewBusy = ref(false);
const editingScript = ref(false);
const draftScriptObjective = ref('');
const editingExplanation = ref(false);
const draftExplanation = ref('');

async function submitReview(payload: Record<string, unknown>, stepKey: StepKey): Promise<void> {
  if (reviewBusy.value) return;
  reviewBusy.value = true;
  try {
    await api().review(payload);
    await refreshStatus();
  } catch (e) {
    // 与本组件其它操作同一套错误出口：失败落在对应步骤卡上，用户看得见原因
    steps.fail(stepKey, e);
  } finally {
    reviewBusy.value = false;
  }
}

// ── 待审核资料（§8 上传文本/文件入口）──
// 之前这个 textarea 粘完什么也不发、刷新即没，等于摆设。现在真落库：存着、可见，
// 但 AI 用不了（approvedIds 里没有它），要经内容审核人批准后才会进第二层。
const intakeBusy = ref(false);
const intakeItems = ref<Array<{ id: string; chars: number; preview: string; createdAt: number }>>([]);
async function submitIntake(): Promise<void> {
  if (!pasted.value.trim() || intakeBusy.value) return;
  intakeBusy.value = true;
  try {
    const r = await api().intake({ text: pasted.value });
    intakeItems.value = r?.items || [];
    pasted.value = '';
  } catch (e) {
    steps.fail('corpus', e);
  } finally {
    intakeBusy.value = false;
  }
}

// ── 卡片文字层：可复制 + 与锁定经文逐字比对（§13.1 末句）──
const openTextLayer = ref('');
function toggleTextLayer(id: string): void { openTextLayer.value = openTextLayer.value === id ? '' : id; }

/**
 * 这一条文字是不是真的来自锁定经文（L1）。
 * 卡上的经文层可能是整节，也可能是节里的一个词（词汇卡），所以两种都算命中；
 * 比对前统一压掉空白差异，但**不做任何字形归一化** —— 去变音符之类的"宽容比对"
 * 会把被改过的经文也判成一致，那就失去校验的意义了。
 */
function matchesLockedVerse(text: string): boolean {
  const t = text.replace(/\s+/g, ' ').trim();
  if (!t) return false;
  return chapterVerses.value.some((v) => {
    const a = v.arabic.replace(/\s+/g, ' ').trim();
    return a === t || a.split(' ').includes(t);
  });
}

async function copyTextLayer(card: { textLayer: string[] }): Promise<void> {
  try { await navigator.clipboard.writeText(card.textLayer.join('\n')); } catch { /* 无剪贴板权限时用户仍可手动选中 */ }
}

async function removeCard(id: string): Promise<void> {
  if (!window.confirm(i18nT('删除这张教学图片卡片？图片文件保留在输出目录，只从清单里移除。'))) return;
  await submitReview({ target: 'card', id, remove: true }, 'media');
  if (openTextLayer.value === id) openTextLayer.value = '';
}

function startEditScript(): void { draftScriptObjective.value = script.value?.objective || ''; editingScript.value = true; }
async function saveScript(): Promise<void> {
  if (!script.value) return;
  await submitReview({ target: 'script', id: script.value.id, text: draftScriptObjective.value }, 'media');
  editingScript.value = false;
}
async function acceptScript(): Promise<void> {
  if (!script.value) return;
  await submitReview({ target: 'script', id: script.value.id, accept: true }, 'media');
}

function startEditExplanation(): void { draftExplanation.value = rf.value?.explanation || ''; editingExplanation.value = true; }
async function saveExplanation(): Promise<void> {
  if (!rf.value) return;
  await submitReview({ target: 'reinforcement', id: rf.value.id, text: draftExplanation.value }, 'reinforce');
  editingExplanation.value = false;
}
async function acceptReinforcement(): Promise<void> {
  if (!rf.value) return;
  await submitReview({ target: 'reinforcement', id: rf.value.id, accept: true }, 'reinforce');
}


const rf = computed(() => state.reinforcement);
const chapterVerseCount = computed(() => state.corpus?.chapters.find((c) => c.chapter === state.selection.chapter)?.verseCount || 1);
// 试卷按内容语言分开：英文界面只列英文卷（别的语言版本在切回去时再出现）
const rangePapers = computed(() => state.papers.filter((p) => p.lang === state.lang && p.chapter === state.selection.chapter && p.from === state.selection.from && p.to === state.selection.to && (p.kind === 'practice' || p.kind === 'exam')));
const distinctSignatures = computed(() => new Set(rangePapers.value.map((p) => p.signature)).size === rangePapers.value.length);
const allQuestions = computed(() => state.papers.filter((p) => p.lang === state.lang && p.chapter === state.selection.chapter).flatMap((p) => p.questions));
const langCards = computed(() => state.cards.filter((c) => cardLang(c) === state.lang));

let off: (() => void) | null = null;
onMounted(async () => {
  try {
    off = api()?.onEvent?.((ev: QuranProgressEvent) => { liveMsg.value = ev.stage === 'done' ? '' : `${stageLabel(ev.stage)} ${ev.done}/${ev.total}`; });
  } catch { /* 无事件通道 */ }
  if (!state.ready) await refreshStatus();
  await loadVerses();
  if (!script.value) script.value = state.scripts.find((x) => x.lang === state.lang && x.chapter === state.selection.chapter) || null;
  if (state.plan && state.plan.request.chapter === state.selection.chapter) { planForm.grade = localizedGrade(state.plan.request.grade); planForm.level = state.plan.request.level; }
});
onBeforeUnmount(() => { try { off?.(); } catch { /* ignore */ } });

function selectChapter(ch: number): void {
  state.selection = { chapter: ch, from: 1, to: state.corpus?.chapters.find((c) => c.chapter === ch)?.verseCount || 1 };
  state.parse = null; state.graph = null; state.analysis = null; state.activePaperId = ''; state.records = [];
  steps.resetAfter('corpus'); steps.reset('corpus');
  void loadVerses();
}
function quickRange(v: string): void {
  const n = chapterVerseCount.value;
  if (v === 'first10') { state.selection.from = 1; state.selection.to = Math.min(10, n); }
  else if (v === 'random') { const len = Math.min(n, 6 + Math.floor(Math.random() * 10)); const from = 1 + Math.floor(Math.random() * Math.max(1, n - len + 1)); state.selection.from = from; state.selection.to = Math.min(n, from + len - 1); }
  else { state.selection.from = 1; state.selection.to = n; }
  void loadVerses();
}
async function loadVerses(): Promise<void> {
  if (!state.corpus?.allVerified) return;
  const s = state.selection;
  s.from = Math.max(1, Math.min(chapterVerseCount.value, Number(s.from) || 1));
  s.to = Math.max(s.from, Math.min(chapterVerseCount.value, Number(s.to) || s.from));
  state.verses = await api().verses({ chapter: s.chapter, from: s.from, to: s.to });
  chapterVerses.value = await api().verses({ chapter: s.chapter });
  materials.value = await api().materials({ chapter: s.chapter, from: s.from, to: s.to });
}
async function importBundled(): Promise<void> { steps.start('corpus'); try { state.corpus = await api().importCorpus({}); await refreshStatus(); await loadVerses(); steps.done('corpus', state.corpus?.allVerified ? i18nT('校验通过') : i18nT('校验失败')); } catch (e) { steps.fail('corpus', e); } }
async function importDir(): Promise<void> {
  const r = await api().pickDir(); if (!r?.path) return;
  steps.start('corpus');
  try { state.corpus = await api().importCorpus({ dir: r.path }); await refreshStatus(); await loadVerses(); if (state.corpus?.allVerified) steps.done('corpus', i18nT('目录导入并校验通过')); else steps.fail('corpus', new Error(state.corpus?.problems.join(' · ') || i18nT('校验失败'))); } catch (e) { steps.fail('corpus', e); }
}
async function doSearch(): Promise<void> {
  if (!searchQ.value.trim()) { searchHits.value = []; return; }
  const hits: Array<{ verse: QuranVerse; hits: number }> = await api().search({ query: searchQ.value, chapter: state.selection.chapter });
  searchHits.value = hits.map((h) => h.verse.ref);
  if (hits.length) { const nums = hits.map((h) => h.verse.verse); state.selection.from = Math.min(...nums); state.selection.to = Math.max(...nums); await loadVerses(); }
}
async function reciteSample(): Promise<void> {
  ttsBusy.value = true;
  try { speech.value = await api().tts({ kind: 'verse', chapter: state.selection.chapter, from: state.selection.from, to: state.selection.to, lang: 'ar' }); } catch (e) { steps.fail('corpus', e); } finally { ttsBusy.value = false; }
}
async function teachingAudio(text: string): Promise<void> {
  ttsBusy.value = true;
  try { teachSpeech.value = await api().tts({ kind: 'teaching', chapter: state.selection.chapter, from: state.selection.from, to: state.selection.to, text, lang: state.lang }); } catch (e) { steps.fail('reinforce', e); } finally { ttsBusy.value = false; }
}

// ── 1→2
async function runCorpus(): Promise<void> {
  steps.start('corpus');
  try {
    await loadVerses();
    steps.done('corpus', i18nT('{c} {r} · {n} 节已载入（L1 冻结）', { c: chapterName(state.selection.chapter), r: ltr(rangeLabel(state.selection)), n: state.verses.length }));
    await runParse();
  } catch (e) { steps.fail('corpus', e); }
}
async function runParse(): Promise<void> {
  steps.start('parse');
  try {
    const s = state.selection;
    state.parse = await api().parse({ chapter: s.chapter, from: s.from, to: s.to });
    steps.done('parse', i18nT('{n} 个教学单元 · {c} 个概念 · {w} 个词形', { n: state.parse!.units.length, c: state.parse!.concepts.length, w: state.parse!.uniqueWords }));
  } catch (e) { steps.fail('parse', e); }
}
function conceptLabel(id: string): string { return state.parse?.concepts.find((c) => c.id === id)?.label[state.lang] || id; }

// ── 3
async function runPlan(): Promise<void> {
  steps.start('plan');
  try {
    const s = state.selection;
    state.plan = await api().planGenerate({ chapter: s.chapter, from: s.from, to: s.to, ...planForm, grade: contentGrade(planForm.grade, state.lang), lang: state.lang });
    planEditing.value = false;
    steps.done('plan', i18nT('{n} 课 · {g}', { n: state.plan!.sessions.length, g: state.plan!.generator === 'llm' ? i18nT('LLM 已润色') : i18nT('模板骨架（大脑未就绪）') }));
  } catch (e) { steps.fail('plan', e); }
}
async function acceptPlan(): Promise<void> { if (!state.plan) return; state.plan = await api().planSave({ id: state.plan.id, patch: { reviewStatus: 'accepted' } }); }
async function savePlanEdits(): Promise<void> { if (!state.plan) return; state.plan = await api().planSave({ id: state.plan.id, patch: { adaptation: state.plan.adaptation, objectives: state.plan.objectives, reviewStatus: 'edited' } }); }
function planStatusLabel(s: string): string { return s === 'accepted' ? i18nT('教师已接受') : s === 'edited' ? i18nT('教师已编辑') : i18nT('AI 草稿 · 待确认'); }

// ── 4
async function runGraph(): Promise<void> {
  steps.start('graph');
  try {
    const s = state.selection;
    state.graph = await api().graph({ chapter: s.chapter, from: s.from, to: s.to, lang: state.lang });
    steps.done('graph', i18nT('{n} 节点 · {e} 关联', { n: state.graph!.nodes.length, e: state.graph!.edges.length }));
  } catch (e) { steps.fail('graph', e); }
}

// ── 5
async function runQuiz(times = 1): Promise<void> {
  steps.start('quiz');
  try {
    const s = state.selection;
    let last: QuranPaper | null = null;
    for (let i = 0; i < times; i += 1) {
      const r = await api().paperGenerate({ chapter: s.chapter, from: s.from, to: s.to, lang: state.lang, level: planForm.level, count: quizForm.count, kind: quizForm.kind });
      last = r.paper;
    }
    await refreshStatus();
    if (last) state.activePaperId = last.id;
    steps.done('quiz', i18nT('已生成 {n} 套 · 当前第 {v} 版 · {q} 题', { n: rangePapers.value.length, v: last?.version || 1, q: last?.questions.length || 0 }));
  } catch (e) { steps.fail('quiz', e); }
}
function typeSummary(p: QuranPaper): string { const m = new Map<string, number>(); for (const q of p.questions) m.set(q.type, (m.get(q.type) || 0) + 1); return Array.from(m).map(([t, n]) => `${typeLabel(t as QuranQuestion['type'])} ${n}`).join(' · '); }
async function editQuestion(p: { id: string; stem: string; explanation?: string }): Promise<void> { await editQuestionIn(state.activePaperId, p); }
async function confirmQuestion(id: string): Promise<void> { await confirmQuestionIn(state.activePaperId, id); }
async function regenerateQuestion(id: string): Promise<void> { await regenerateIn(state.activePaperId, id); }
async function removeQuestion(id: string): Promise<void> { await removeIn(state.activePaperId, id); }
// 解析一起提交：主进程 updateQuestion 本来就支持 explanation，之前界面只发题干，白丢一个教师控制点
async function editQuestionIn(paperId: string, p: { id: string; stem: string; explanation?: string }): Promise<void> { await api().questionUpdate({ paperId, questionId: p.id, patch: { stem: p.stem, explanation: p.explanation } }); await refreshStatus(); syncRf(); }
async function confirmQuestionIn(paperId: string, id: string): Promise<void> { await api().questionUpdate({ paperId, questionId: id, patch: { reviewStatus: 'confirmed' } }); await refreshStatus(); syncRf(); }
async function regenerateIn(paperId: string, id: string): Promise<void> { try { await api().questionRegenerate({ paperId, questionId: id }); await refreshStatus(); syncRf(); await reloadRecords(); } catch (e) { steps.fail('quiz', e); } }
async function removeIn(paperId: string, id: string): Promise<void> { if (!window.confirm(i18nT('删除这道题？相关答题记录一并删除，不可恢复。'))) return; await api().questionUpdate({ paperId, questionId: id, patch: { remove: true } }); await refreshStatus(); syncRf(); await reloadRecords(); }
function syncRf(): void { if (state.reinforcement) { const r = state.status?.reinforcements.find((x) => x.id === state.reinforcement!.id); if (r) state.reinforcement = r; } }

// ── 6
async function runStudents(): Promise<void> {
  if (!activePaper.value) return;
  steps.start('students');
  try {
    state.records = await api().simulate({ paperId: activePaper.value.id });
    state.analysis = (await api().analyze({ paperId: activePaper.value.id, lang: state.lang })).analysis;
    steps.done('students', i18nT('5 名学生 × {n} 题 = {r} 条记录（预置，可改）', { n: activePaper.value.questions.length, r: state.records.length }));
  } catch (e) { steps.fail('students', e); }
}
async function reloadRecords(): Promise<void> { if (!activePaper.value) return; const r = await api().analyze({ paperId: activePaper.value.id, lang: state.lang }); state.records = r.records; state.analysis = r.analysis; }
function recordOf(studentId: string, questionId: string) { return state.records.find((r) => r.studentId === studentId && r.questionId === questionId); }
function scoreOf(studentId: string) { return state.analysis?.students.find((s) => s.studentId === studentId)?.total; }
function seqLabel(a: number | number[] | null | undefined): string { return Array.isArray(a) ? a.map((x) => x + 1).join('→') : '—'; }
function wrongSeq(q: QuranQuestion): number[] { const a = (q.answer as number[]).slice(); if (a.length >= 2) [a[0], a[1]] = [a[1], a[0]]; return a; }
function originLabel(o?: string): string { return o === 'edited' ? i18nT('演示人员修改') : o === 'retest' ? i18nT('复测') : i18nT('预置'); }
async function setAnswer(q: QuranQuestion, answer: number | number[]): Promise<void> {
  if (!activePaper.value) return;
  try {
    const r = await api().answerSet({ paperId: activePaper.value.id, studentId: focusStudent.value, questionId: q.id, answer, lang: state.lang });
    state.records = r.records; state.analysis = r.analysis;
    steps.runtime.analysis.summary = i18nT('已按修改后的答案重算（{t}）', { t: uiTime() });
    if (steps.runtime.analysis.state === 'todo') steps.runtime.analysis.state = 'done';
  } catch (e) { steps.fail('students', e); }
}

// ── 7
async function runAnalysis(commentary = false, force = false): Promise<void> {
  if (!activePaper.value) return;
  steps.start('analysis');
  try {
    const r = await api().analyze({ paperId: activePaper.value.id, lang: state.lang, commentary, force });
    state.records = r.records; state.analysis = r.analysis;
    steps.done('analysis', i18nT('{c} 个群体共同薄弱点 · {h} 个提示项', { c: r.analysis.group.commonCount, h: r.analysis.group.issues.filter((i: any) => i.verdict === 'hint').length }));
  } catch (e) { steps.fail('analysis', e); }
}
const heatRows = computed(() => {
  const a = state.analysis; if (!a) return [];
  const find = (id: string) => a.students.find((s) => s.studentId === id);
  const rows = [{ key: 'total', label: i18nT('总成绩'), val: (id: string) => `${find(id)?.total.pct ?? 0}%`, cls: (id: string) => pctClass(find(id)?.total.pct ?? 0) }];
  for (const d of DIM_ORDER) rows.push({ key: d, label: dimLabel(d), val: (id: string) => { const x = find(id)?.dimensions[d]; return x?.total ? `${x.pct}%` : '—'; }, cls: (id: string) => { const x = find(id)?.dimensions[d]; return x?.total ? pctClass(x.pct) : 'na'; } });
  return rows;
});
function studentCode(id: string): string { const s = state.students.find((x) => x.id === id); return s ? studentBadge(s) : '?'; }

// ── 8
async function runReinforce(issueKey: string): Promise<void> {
  if (!activePaper.value) return;
  steps.start('reinforce');
  try {
    state.reinforcement = await api().reinforce({ paperId: activePaper.value.id, issueKey, lang: state.lang });
    await refreshStatus();
    steps.done('reinforce', i18nT('{t} · 练习 {p} 题 · 复测 {r} 题', { t: state.reinforcement!.targetLabel, p: state.reinforcement!.practice.questions.length, r: state.reinforcement!.retest.questions.length }));
  } catch (e) { steps.fail('reinforce', e); }
}
async function runRetest(): Promise<void> {
  if (!rf.value) return;
  steps.start('reinforce');
  try {
    const r = await api().retest({ reinforcementId: rf.value.id, lang: state.lang });
    state.reinforcement = r.reinforcement;
    await refreshStatus();
    const cmp = r.reinforcement.compare;
    steps.done('reinforce', i18nT('复测完成：薄弱点错误人数 {b} → {a}', { b: cmp?.target.before ?? r.reinforcement.before.targetWrong, a: cmp ? (cmp.target.after ?? '—') : (r.reinforcement.after?.targetWrong ?? '—') }));
  } catch (e) { steps.fail('reinforce', e); }
}
/** 前后对比着色：后值比前值小算变好（答错人数 / 薄弱点数）；正确率反过来传参 */
function lessIsBetter(before: number, after: number | null): string { return after === null || after === before ? '' : after < before ? 'up' : 'down'; }

// ── 9
async function makeCard(kind: string, focusRefs?: string[]): Promise<void> {
  mediaBusy.value = true; steps.start('media');
  try {
    const s = state.selection;
    await api().card({ kind, chapter: s.chapter, from: s.from, to: s.to, lang: state.lang, useFal: useFal.value, focusRefs });
    await refreshStatus();
    steps.done('media', i18nT('{k} 已生成（经文为文字层）', { k: kindLabel(kind) }));
  } catch (e) { steps.fail('media', e); } finally { mediaBusy.value = false; liveMsg.value = ''; }
}
async function makeScript(): Promise<void> {
  mediaBusy.value = true; steps.start('media');
  try {
    const s = state.selection;
    script.value = await api().videoScript({ chapter: s.chapter, from: s.from, to: s.to, lang: state.lang });
    await refreshStatus();
    steps.done('media', i18nT('脚本 {n} 个镜头 · {s}s', { n: script.value!.scenes.length, s: script.value!.totalSec }));
  } catch (e) { steps.fail('media', e); } finally { mediaBusy.value = false; }
}
async function makeVideo(): Promise<void> {
  if (!script.value) return;
  mediaBusy.value = true; steps.start('media');
  try {
    const v = await api().videoSample({ scriptId: script.value.id });
    await refreshStatus();
    steps.done('media', i18nT('视频样例已合成 · 配音：{e}', { e: v.voiceEngine === 'fal' ? 'fal speech-02-hd' : v.voiceEngine === 'local' ? i18nT('本地兜底') : i18nT('无') }));
  } catch (e) { steps.fail('media', e); } finally { mediaBusy.value = false; liveMsg.value = ''; }
}

defineExpose({ errorMessage });
</script>
