<template>
  <div class="cc-workbench" :class="{ 'reduced-motion': reducedMotion }">
    <!-- Hero -->
    <header class="cc-hero">
      <PageBackButton />
      <div class="cc-hero__glow" aria-hidden="true"></div>
      <div class="cc-hero__copy">
        <p class="cc-hero__eyebrow"><i class="ri-heart-3-line"></i>{{ $t('公益传播 · 项目工作台') }}</p>
        <h1>{{ $t('慈善活动内容工场') }}</h1>
        <p class="cc-hero__sub">{{ lineMeta.hint }}</p>
        <div class="cc-hero__chain" aria-hidden="true">
          <span v-for="(m, i) in steps.metas" :key="m.key" class="cc-hero__chip" :class="steps.runtime[m.key].state"><i :class="m.icon"></i>{{ m.title }}<i v-if="i < steps.metas.length - 1" class="ri-arrow-right-s-line arrow"></i></span>
        </div>
      </div>
      <div class="cc-hero__actions">
        <FalServiceConfig solution-id="workbench-charity-content" />
        <button v-if="line === 'event'" type="button" class="cc-btn hero" :disabled="oneClickBusy || steps.isRunning() || !hasMaterials" :title="hasMaterials ? '' : $t('先放进素材')" @click="runOneClick">
          <i :class="oneClickBusy ? 'ri-loader-4-line cc-spin' : 'ri-play-circle-line'"></i>{{ oneClickBusy ? $t('一键流程进行中…') : $t('一键完整流程') }}
        </button>
        <button v-if="line === 'event' && prebaked?.available && !hasMaterials" type="button" class="cc-btn ghost" @click="loadDemoMaterials"><i class="ri-folder-download-line"></i>{{ $t('载入演示素材') }}</button>
        <!--
          演示现场最常用的一条：不跑任何生成，直接摆出一整套真跑出来的成品。
          讲解的人没有十分钟等真跑，而这些报告 / 海报 / 语音 / 成片本来就是真跑的产物。
        -->
        <button type="button" class="cc-btn hero" :disabled="demoBusy || steps.isRunning()" :title="demoPackHint" @click="loadDemoResult">
          <i :class="demoBusy ? 'ri-loader-4-line cc-spin' : 'ri-flashlight-line'"></i>{{ demoBusy ? (demoMsg || $t('准备演示成品…')) : $t('直接出演示成品') }}
        </button>
      </div>
    </header>

    <!--
      先选制作方向。两条线是隔离的：只想给一篇项目说明配音出片时，不该被迫先传现场素材走报告。
      切线会换掉下面整条步骤链（各自的进度、各自的产物），已跑出来的东西留在原地不清。
    -->
    <nav class="cc-lines" role="tablist" :aria-label="$t('制作方向')">
      <button
        v-for="lm in LINE_METAS" :key="lm.key" type="button" role="tab" class="cc-line"
        :class="{ active: line === lm.key }" :aria-selected="line === lm.key ? 'true' : 'false'"
        :disabled="steps.isRunning()" :title="steps.isRunning() ? $t('当前步骤进行中，结束后可切换') : ''"
        @click="switchLine(lm.key)"
      >
        <i :class="lm.icon"></i>
        <span class="cc-line__text"><strong>{{ lm.title }}</strong><small>{{ lm.hint }}</small></span>
      </button>
    </nav>

    <!-- 没有任何 fal key（本地没填、管理员也没为本方案下发）时的顶部提示；AI 步骤照常能跑，只是走回退 -->
    <FalServiceConfig solution-id="workbench-charity-content" variant="banner" :fallback-hint="$t('未配置时各步自动回退：短视频出素材剪辑版、语音用标准音质（备用）、看图用默认模型。')" />

    <CcProgress :metas="steps.metas" :runtime="steps.runtime" :current-key="steps.currentKey.value" :live="live" @jump="scrollToStep" @cancel="cancelRun" />

    <!--
      换页 / 重进后发现主进程里上一次的运行还在跑（本组件的状态是组件内的，runId 随卸载丢了）：
      从事件里认领那个 runId，至少让人知道「它还在后台跑」并且能把它停掉，不至于以为卡死又点一轮。
    -->
    <div v-if="orphanRun" class="cc-note warn cc-orphan" role="status">
      <i class="ri-loader-4-line cc-spin"></i>
      <span class="grow">{{ $t('上一次的运行仍在后台进行：{p0}', { p0: orphanRun.msg || orphanRun.step }) }}</span>
      <button type="button" class="cc-btn sm ghost" :disabled="orphanStopping" @click="stopOrphanRun"><i class="ri-stop-circle-line"></i>{{ $t('停止') }}</button>
    </div>

    <div class="cc-steps">
      <!-- ── 第 1 步：上传素材 + 活动档案 ── -->
      <CcStep v-if="line === 'event'" step-key="material" :index="stepIndex('material')" :title="stepMeta('material').title" :hint="stepMeta('material').hint" :icon="stepMeta('material').icon" :runtime="steps.runtime.material" :is-current="steps.currentKey.value === 'material'" :retry="lastAction.material" :cancel="cancelRun">
        <template #tools>
          <span v-if="dir" class="cc-path" :title="dir"><i class="ri-folder-3-line"></i><bdi dir="ltr">{{ dir }}</bdi></span>
          <button v-if="dir" type="button" class="cc-btn sm ghost" @click="openOutDir"><i class="ri-external-link-line"></i>{{ $t('输出目录') }}</button>
        </template>
        <MaterialGrid :items="items" :disabled="steps.isRunning()" @pick-dir="pickDir" @pick-files="pickFiles" @dropped="onDropped" @remove="removeItem" />
        <p v-if="items.length" class="cc-note info"><i class="ri-information-line"></i>{{ $t('{img} 张照片 · {vid} 段视频 · {pdf} 份 PDF；输出到 {out}', { img: countKind('image'), vid: countKind('video'), pdf: countKind('pdf'), out: ltrIsolate(outDir) }) }}</p>
        <CcPromptBox
          v-model="contentPrompt" kind="content" :default-value="contentPromptState.defaultValue" icon="ri-quill-pen-line" :disabled="steps.isRunning()"
          :label="$t('内容提示词')" :hint="$t('讲什么：看图描述的侧重点、报告与海报文案、第 3 步默认旁白都按它写；数字仍只用活动档案')"
        />

        <section class="cc-panel">
          <header class="cc-panel__head">
            <strong><i class="ri-profile-line"></i>{{ $t('活动档案') }}</strong>
            <span class="cc-muted">{{ $t('报告、海报、旁白里的数字只来自这里；视觉模型先起草，你可以随时改。') }}</span>
            <span class="grow"></span>
            <span v-if="archive" class="cc-chip" :class="archive.source === 'vlm' ? 'ok' : archive.source === 'demo' ? 'info' : ''">{{ archive.source === 'vlm' ? $t('视觉模型草案') : archive.source === 'demo' ? $t('演示档案') : $t('手工填写') }}</span>
            <button type="button" class="cc-btn sm primary" :disabled="!countKind('image') || steps.isRunning()" @click="draftArchive()"><i class="ri-eye-2-line"></i>{{ archive ? $t('重新识别') : $t('看图生成档案') }}</button>
            <button v-if="prebaked?.archive" type="button" class="cc-btn sm ghost" :disabled="steps.isRunning()" @click="archive = clone(prebaked!.archive!)"><i class="ri-archive-line"></i>{{ $t('用演示档案') }}</button>
          </header>
          <div v-if="steps.runtime.material.state === 'running' && !archive" class="cc-skeleton cc-skeleton--form" aria-hidden="true"><span v-for="n in 6" :key="n"></span></div>
          <div v-else-if="archive" class="cc-archive">
            <LangChips v-model="archiveLang" />
            <div class="cc-form" :dir="LANG_DIR[archiveLang]">
              <label class="cc-field"><span>{{ $t('机构名') }}</span><input v-model="archive.orgName[archiveLang]" type="text" :lang="archiveLang" /></label>
              <label class="cc-field"><span>{{ $t('活动名') }}</span><input v-model="archive.eventName[archiveLang]" type="text" :lang="archiveLang" /></label>
              <label class="cc-field"><span>{{ $t('地点') }}</span><input v-model="archive.location[archiveLang]" type="text" :lang="archiveLang" /></label>
              <label class="cc-field"><span>{{ $t('主办方') }}</span><input v-model="archive.organizer[archiveLang]" type="text" :lang="archiveLang" /></label>
              <label class="cc-field wide"><span>{{ $t('一句话简介') }}</span><textarea v-model="archive.summary[archiveLang]" rows="2" :lang="archiveLang"></textarea></label>
            </div>
            <div class="cc-form" dir="ltr">
              <label class="cc-field"><span>{{ $t('日期') }}</span><input v-model="archive.date" type="date" /></label>
              <label class="cc-field"><span>{{ $t('参与人数') }}</span><input :value="archive.participants ?? ''" type="number" min="0" :placeholder="$t('未披露')" @input="archive!.participants = numOrNull(($event.target as HTMLInputElement).value)" /></label>
              <label class="cc-field"><span>{{ $t('善款金额') }}</span><input v-model="archive.donation" type="text" placeholder="SAR 120,000" /></label>
            </div>
          </div>
          <p v-else class="cc-note"><i class="ri-lightbulb-line"></i>{{ $t('放进照片后点「看图生成档案」，或直接用演示档案。') }}</p>
        </section>
        <div class="cc-actions end">
          <button type="button" class="cc-btn primary lg" :disabled="!hasMaterials || !archiveReady(archive) || steps.isRunning()" @click="runReport()"><i class="ri-arrow-right-line"></i>{{ $t('下一步：整理与报告') }}</button>
        </div>
      </CcStep>

      <!-- ── 第 2 步：整理与报告 ── -->
      <CcStep v-if="line === 'event'" step-key="report" :index="stepIndex('report')" :title="stepMeta('report').title" :hint="stepMeta('report').hint" :icon="stepMeta('report').icon" :runtime="steps.runtime.report" :is-current="steps.currentKey.value === 'report'" :retry="lastAction.report" :cancel="cancelRun">
        <template #tools>
          <button type="button" class="cc-btn sm" :disabled="!hasMaterials || !archiveReady(archive) || steps.isRunning()" @click="runReport()"><i class="ri-refresh-line"></i>{{ report ? $t('重新生成') : $t('生成') }}</button>
        </template>
        <p v-if="needsModel(steps.runtime.report.error) || needsModel(steps.runtime.material.error)" class="cc-note warn">
          <i class="ri-cpu-line"></i>{{ $t('还没有默认模型：报告与看图都要用它。') }}
          <button type="button" class="cc-btn sm primary" @click="goModelSettings"><i class="ri-settings-3-line"></i>{{ $t('去设置 → 模型') }}</button>
        </p>
        <p v-if="analyzeWarning && steps.runtime.report.state !== 'running'" class="cc-note warn"><i class="ri-eye-off-line"></i>{{ analyzeWarning }}</p>
        <div v-if="steps.runtime.report.state === 'running'" class="cc-skeleton cc-skeleton--report" aria-hidden="true">
          <div class="cc-skeleton__row"><span v-for="n in 3" :key="n" class="tile"></span></div>
          <span v-for="n in 5" :key="'l' + n" class="line" :style="{ width: `${92 - n * 9}%` }"></span>
          <p class="cc-skeleton__live"><i class="ri-loader-4-line cc-spin"></i>{{ live?.msg || $t('准备中…') }}</p>
        </div>
        <template v-else-if="report">
          <section class="cc-panel">
            <header class="cc-panel__head"><strong><i class="ri-image-2-line"></i>{{ $t('素材整理') }}</strong><span class="cc-muted">{{ descriptions.length ? $t('{n} 个素材已生成画面描述（视频按每 10 秒抽帧）', { n: descriptions.length }) : $t('本次没有画面描述，报告只依据活动档案撰写') }}</span><span class="grow"></span><LangChips v-model="viewLang" /></header>
            <ul v-if="descriptions.length" class="cc-desc">
              <li v-for="d in descriptions" :key="d.path">
                <img v-if="thumbOf(d.path)" :src="thumbOf(d.path)" alt="" />
                <span v-else class="cc-desc__icon"><i :class="d.kind === 'video' ? 'ri-film-line' : 'ri-image-line'"></i></span>
                <div :dir="LANG_DIR[viewLang]" :lang="viewLang"><small>{{ baseName(d.path) }}<template v-if="d.frames?.length"> · {{ $t('{n} 帧', { n: d.frames.length }) }}</template></small> <span v-if="d.unrecognized" class="cc-chip warn" :title="$t('模型回复无法解析，这里先用活动档案信息代替；报告不会采用这条描述')"><i class="ri-question-line"></i>{{ $t('未识别') }}</span><p>{{ d.description[viewLang] }}</p></div>
              </li>
            </ul>
          </section>

          <section class="cc-panel">
            <header class="cc-panel__head"><strong><i class="ri-file-text-line"></i>{{ $t('活动报告') }}</strong><span class="grow"></span><LangChips v-model="viewLang" /></header>
            <div class="cc-report">
              <article class="cc-report__text" :dir="LANG_DIR[viewLang]" :lang="viewLang">
                <h3>{{ report[viewLang].title }}</h3>
                <h4>{{ $t('活动概况') }}</h4><p>{{ report[viewLang].overview }}</p>
                <h4>{{ $t('活动亮点') }}</h4><ul><li v-for="(h, i) in report[viewLang].highlights" :key="i">{{ h }}</li></ul>
                <h4>{{ $t('现场回顾') }}</h4><p>{{ report[viewLang].scene }}</p>
                <h4>{{ $t('致谢') }}</h4><p>{{ report[viewLang].thanks }}</p>
              </article>
              <aside class="cc-report__pdf">
                <div class="cc-pdfpage" :class="{ rtl: viewLang === 'ar' }">
                  <img v-if="pdfPreview[viewLang]" :src="pdfPreview[viewLang]" :alt="$t('报告首页')" />
                  <span v-else class="cc-pdfpage__empty"><i class="ri-file-pdf-2-line"></i>PDF</span>
                </div>
                <AssetActions :path="pdf[viewLang]" :label="`report-${viewLang}.pdf`" @regen="runReport()" />
              </aside>
            </div>
          </section>

          <section class="cc-panel">
            <header class="cc-panel__head"><strong><i class="ri-layout-2-line"></i>{{ $t('宣传海报 9:16') }}</strong><span class="cc-muted">{{ $t('素材照片做背景；点卡片翻面看三语版本') }}</span></header>
            <div class="cc-posters">
              <div v-for="l in LANGS" :key="l" class="cc-poster" :class="{ flipped: posterFlipped[l] }" @click="posterFlipped[l] = !posterFlipped[l]">
                <div class="cc-poster__inner">
                  <div class="cc-poster__face front">
                    <img v-if="posterPreview[l]" :src="posterPreview[l]" :alt="LANG_LABEL[l]" />
                    <span class="cc-poster__tag" :lang="l">{{ LANG_LABEL[l] }}</span>
                  </div>
                  <div class="cc-poster__face back" :dir="LANG_DIR[l]" :lang="l">
                    <strong>{{ archive?.eventName[l] }}</strong>
                    <span>{{ archive?.orgName[l] }}</span>
                    <small>{{ archive?.date }} · {{ archive?.location[l] }}</small>
                    <AssetActions :path="poster[l]" :label="`poster-${l}.jpg`" compact @regen="runReport()" @click.stop />
                  </div>
                </div>
              </div>
            </div>
          </section>
        </template>
        <p v-else class="cc-note"><i class="ri-lightbulb-line"></i>{{ $t('第 1 步准备好素材与档案后，这里会生成画面描述、三语报告 PDF 和海报。') }}</p>
        <div v-if="report" class="cc-actions end">
          <button type="button" class="cc-btn primary lg" :disabled="steps.isRunning()" @click="useSummaryForSpeech(); runSpeechAll()"><i class="ri-arrow-right-line"></i>{{ $t('下一步：报告摘要转语音') }}</button>
        </div>
      </CcStep>

      <!-- ── 第 3 步：文章转语音 ── -->
      <CcStep step-key="speech" :index="stepIndex('speech')" :title="stepMeta('speech').title" :hint="stepMeta('speech').hint" :icon="stepMeta('speech').icon" :runtime="steps.runtime.speech" :is-current="steps.currentKey.value === 'speech'" :retry="lastAction.speech" :cancel="cancelRun">
        <section class="cc-panel">
          <header class="cc-panel__head">
            <strong><i class="ri-text"></i>{{ $t('朗读来源') }}</strong>
            <div class="cc-seg" role="tablist">
              <button v-for="s in SPEECH_SOURCES" :key="s.key" type="button" class="cc-seg__btn" :class="{ active: speechSource === s.key }" @click="speechSource = s.key; if (s.key === 'summary') useSummaryForSpeech()">{{ s.label }}</button>
            </div>
            <span class="grow"></span>
            <span class="cc-chip ok"><i class="ri-hd-line"></i>{{ $t('高保真 · MiniMax speech-02-hd（fal）') }}</span>
          </header>
          <div v-if="speechSource === 'pdf'" class="cc-actions">
            <!-- event 线从已上传素材里挑；article 线没有素材清单，直接选本机文件 -->
            <select v-if="line === 'event'" v-model="pdfPick" class="cc-select">
              <option value="">{{ $t('选择素材里的 PDF…') }}</option>
              <option v-for="p in items.filter((i) => i.kind === 'pdf')" :key="p.path" :value="p.path">{{ p.name }}</option>
            </select>
            <template v-else>
              <button type="button" class="cc-btn sm" :disabled="pdfBusy" @click="pickSpeechPdf"><i class="ri-file-upload-line"></i>{{ $t('选择 PDF 文件') }}</button>
              <span v-if="pdfPick" class="cc-path" :title="pdfPick"><bdi dir="ltr">{{ pdfPick.split('/').pop() }}</bdi></span>
            </template>
            <label class="cc-field inline"><span>{{ $t('取前') }}</span><input v-model.number="pdfPages" type="number" min="1" max="10" style="width:64px" /><span>{{ $t('页有文字的页') }}</span></label>
            <button type="button" class="cc-btn sm primary" :disabled="!pdfPick || pdfBusy" @click="extractPdf"><i :class="pdfBusy ? 'ri-loader-4-line cc-spin' : 'ri-file-search-line'"></i>{{ $t('抽取文字') }}</button>
            <small v-if="pdfInfo" class="cc-muted">{{ pdfInfo }}</small>
          </div>
          <!-- 文稿在上，生成配置紧贴按钮：从上往下就是「要读什么 → 读成什么 → 开始生成」 -->
          <textarea v-model="sourceText" class="cc-textarea" rows="5" :dir="LANG_DIR[sourceLang]" :lang="sourceLang" :placeholder="$t('要朗读的文稿（粘贴 / 抽取 / 取报告摘要）')"></textarea>
          <p v-if="speechStale" class="cc-note info"><i class="ri-information-line"></i>{{ speechStale }}</p>

          <div class="cc-voice-pick">
            <div class="cc-voice-pick__row"><span class="cc-voice-pick__label">{{ $t('目标语言') }}</span>
              <div class="cc-langs" role="group" :aria-label="$t('目标语言')">
                <button
                  v-for="l in LANGS" :key="l" type="button" class="cc-lang" :class="{ active: speechLangs.includes(l), done: !!speech[l] }"
                  :aria-pressed="speechLangs.includes(l) ? 'true' : 'false'" :lang="l" @click="toggleSpeechLang(l)"
                >{{ LANG_LABEL[l] }}<i v-if="speech[l]" class="ri-check-line" :title="$t('已合成')"></i></button>
              </div>
              <small v-if="translateTargets.length" class="cc-muted">{{ $t('{langs} 会先从文稿转译再配音', { langs: translateTargets.map((l) => LANG_LABEL[l]).join(listSeparator()) }) }}</small>
            </div>
            <!-- 每种选中的语言各自定性别与音色：中文要男声、阿语要女声是常见需求 -->
            <div v-for="l in speechLangs" :key="l" class="cc-voice-pick__row">
              <span class="cc-voice-pick__label" :lang="l">{{ LANG_LABEL[l] }}</span>
              <div class="cc-seg" role="radiogroup" :aria-label="$t('声音性别')">
                <button v-for="g in VOICE_GENDERS" :key="g.key" type="button" role="radio" class="cc-seg__btn" :class="{ active: speechGender[l] === g.key }" :aria-checked="speechGender[l] === g.key" :data-gender="g.key" @click="setSpeechGender(l, g.key)">{{ g.label }}</button>
              </div>
              <select v-model="voices[l]" class="cc-select" :aria-label="$t('声音音色')">
                <option v-for="v in HD_VOICES()[l][speechGender[l]]" :key="v.id" :value="v.id">{{ v.label }}</option>
              </select>
            </div>
          </div>

          <div class="cc-actions">
            <button type="button" class="cc-btn primary lg" :disabled="!sourceText.trim() || !speechLangs.length || steps.isRunning()" @click="runSpeech()"><i class="ri-mic-line"></i>{{ speechLangs.length ? $t('合成 {langs} 语音', { langs: speechLangs.map((l) => LANG_LABEL[l]).join(listSeparator()) }) : $t('合成语音') }}</button>
            <small class="cc-muted">{{ $t('每次都按文稿框里当前的文字生成；与文稿语言不同的目标会先转译。视频配音用这里合成的语音') }}</small>
          </div>
        </section>
        <div v-if="steps.runtime.speech.state === 'running'" class="cc-skeleton cc-skeleton--audio" aria-hidden="true"><span v-for="n in 3" :key="n"></span><p class="cc-skeleton__live"><i class="ri-loader-4-line cc-spin"></i>{{ live?.msg || $t('合成中…') }}</p></div>
        <section v-else-if="Object.keys(speech).length" class="cc-panel">
          <header class="cc-panel__head"><strong><i class="ri-headphone-line"></i>{{ $t('语音成品') }}</strong><span class="grow"></span><label class="cc-toggle"><input v-model="useNarration" type="checkbox" /><span></span>{{ $t('作为视频配音') }}</label></header>
          <ul class="cc-speech">
            <li v-for="l in LANGS.filter((x) => speech[x])" :key="l" class="cc-reveal">
              <div class="cc-speech__head"><strong :lang="l">{{ LANG_LABEL[l] }}</strong><span class="cc-chip" :class="speech[l]!.quality === 'hd' ? 'ok' : 'warn'" :title="speech[l]!.quality === 'hd' ? '' : $t('fal 不可用（未配置密钥 / 额度用尽 / 接口失败），已用本地 edge-tts 兜底')">{{ speech[l]!.quality === 'hd' ? $t('高保真') : $t('标准音质（备用）') }}</span><small class="cc-muted">{{ speech[l]!.voice }} · {{ fmtDur(speech[l]!.durationSec) }}</small></div>
              <AudioWave v-if="speech[l]!.dataUrl" :src="speech[l]!.dataUrl!" />
              <AssetActions :path="speech[l]!.path" :label="`speech-${l}.mp3`" compact @regen="regenSpeech(l)" />
            </li>
          </ul>
        </section>
        <div v-if="Object.keys(speech).length" class="cc-actions end">
          <button type="button" class="cc-btn primary lg" :disabled="steps.isRunning() || !canMakeVideo" @click="runVideo()"><i class="ri-arrow-right-line"></i>{{ $t('下一步：生成宣传短视频') }}</button>
        </div>
      </CcStep>

      <!-- ── 第 4 步：宣传短视频 ── -->
      <CcStep step-key="video" :index="stepIndex('video')" :title="stepMeta('video').title" :hint="stepMeta('video').hint" :icon="stepMeta('video').icon" :runtime="steps.runtime.video" :is-current="steps.currentKey.value === 'video'" :retry="lastAction.video" :cancel="cancelRun">
        <section class="cc-panel">
          <header class="cc-panel__head"><strong><i class="ri-clapperboard-line"></i>{{ $t('成片方式') }}</strong></header>
          <div class="cc-modes">
            <button type="button" class="cc-mode" :class="{ active: videoMode === 'ai' }" @click="videoMode = 'ai'">
              <i class="ri-movie-2-line"></i><strong>{{ $t('AI 增强版') }}</strong><small>{{ $t('fal 图生视频把照片变成 2–3 个动态镜头 + Stable Audio 配乐，再本地合成') }}</small>
              <small v-if="prebaked && prebaked.falReady === false" class="warn"><i class="ri-error-warning-line"></i> {{ $t('未检测到 fal 密钥：生成时会自动改用素材剪辑版') }}</small>
              <span class="cc-mode__badge">{{ $t('推荐') }}</span><span class="cc-mode__check"><i class="ri-check-line"></i></span>
            </button>
            <button type="button" class="cc-mode" :class="{ active: videoMode === 'clip' }" @click="videoMode = 'clip'">
              <i class="ri-scissors-cut-line"></i><strong>{{ $t('素材剪辑版') }}</strong><small>{{ $t('本地合成：照片缓推 + 视频片段 + 三语字幕 + 配音 + 配乐，时长跟随配音') }}</small><span class="cc-mode__check"><i class="ri-check-line"></i></span>
            </button>
          </div>
          <div class="cc-form">
            <div class="cc-field"><span>{{ $t('输出语言') }}</span><div class="cc-checks"><label v-for="l in LANGS" :key="l"><input v-model="videoLangs" type="checkbox" :value="l" /><span :lang="l">{{ LANG_LABEL[l] }}</span></label></div></div>
            <label class="cc-field"><span>{{ $t('配乐情绪') }}</span><select v-model="bgmMood" class="cc-select"><option value="warm">{{ $t('温暖') }}</option><option value="hopeful">{{ $t('希望') }}</option><option value="calm">{{ $t('平静') }}</option><option value="inspiring">{{ $t('振奋') }}</option></select></label>
            <div class="cc-field"><span>{{ $t('配音') }}</span><span class="cc-chip" :class="useNarration && Object.keys(speech).length ? 'ok' : ''">{{ useNarration && Object.keys(speech).length ? $t('用第 3 步的语音（{n} 种语言）', { n: LANGS.filter((l) => speech[l]).length }) : $t('无配音（只字幕 + 配乐）') }}</span></div>
          </div>
        </section>
        <CcPromptBox
          v-model="videoPrompt" kind="video" :default-value="videoPromptState.defaultValue" icon="ri-movie-line" :disabled="steps.isRunning()"
          :label="$t('视频提示词')" :hint="$t('怎么拍：AI 镜头的画面风格、配乐、剪辑节奏与转场、片尾标语；与内容提示词合并成最终镜头提示词')"
        >
          <template #effective>
            <p class="cc-muted">{{ usedPrompts ? $t('这是上一次生成实际送给模型的提示词') : $t('还没生成：下面是按当前两个提示词合并的预览') }}</p>
            <p v-if="usedPrompts ? usedPrompts.condensed : longPrompts" class="cc-note info"><i class="ri-compress-line"></i>{{ usedPrompts ? $t('提示词较长，已先用文本模型浓缩成要点再拼进镜头与配乐提示词') : $t('提示词较长：生成时会先用文本模型浓缩成要点，再拼进镜头与配乐提示词（报告与旁白仍整段使用）') }}</p>
            <dl class="cc-prompt__dl">
              <dt>{{ $t('镜头提示词（内容要点 + 视觉风格）') }}</dt><dd dir="auto">{{ shownPrompts.shot }}</dd>
              <dt>{{ $t('配乐提示词') }}</dt><dd dir="auto">{{ shownPrompts.music }}</dd>
              <dt>{{ $t('剪辑节奏与转场') }}</dt><dd>{{ paceLabel(shownPrompts.clipStyle.pace) }} · {{ transitionLabel(shownPrompts.clipStyle.transition) }}</dd>
              <dt>{{ $t('片尾标语') }}</dt><dd dir="auto">{{ endSloganText || $t('无片尾') }}</dd>
            </dl>
          </template>
        </CcPromptBox>
        <div class="cc-actions">
          <button type="button" class="cc-btn primary lg" :disabled="!canMakeVideo || !videoLangs.length || steps.isRunning()" @click="runVideo()"><i class="ri-film-line"></i>{{ $t('生成短视频') }}</button>
        </div>
        <template v-if="steps.runtime.video.state === 'running'">
          <CcVideoPhases :live="live" :fallback-plan="VIDEO_PLAN[videoMode === 'ai' && prebaked?.falReady !== false ? 'ai' : 'clip']" :lang-count="videoLangs.length" @cancel="cancelRun" />
          <div class="cc-skeleton cc-skeleton--video" aria-hidden="true">
            <div class="cc-skeleton__row"><span v-for="n in videoLangs.length || 3" :key="n" class="phone"></span></div>
          </div>
        </template>
        <section v-else-if="Object.keys(videos).length" class="cc-panel">
          <header class="cc-panel__head">
            <strong><i class="ri-movie-2-line"></i>{{ $t('成片') }}</strong>
            <span class="cc-chip" :class="videoResultMode === 'ai' ? 'ok' : ''"><i :class="videoResultMode === 'ai' ? 'ri-movie-2-line' : 'ri-scissors-cut-line'"></i>{{ $t('9:16 · {mode}', { mode: videoResultMode === 'ai' ? $t('AI 增强版') : $t('素材剪辑版') }) }}</span>
            <span class="grow"></span>
            <span v-if="videoAi && videoAi.estUsd > 0" class="cc-chip info" :title="$t('按 fal 单价估算：动态镜头按秒计，配乐按次计；上传不计费')"><i class="ri-coins-line"></i>{{ $t('本次 fal 费用约 {usd} 美元', { usd: videoAi.estUsd.toFixed(2) }) }}</span>
          </header>
          <p v-if="videoAi?.fallbackReason" class="cc-note warn"><i class="ri-error-warning-line"></i>{{ $t('已改用素材剪辑版（{why}）', { why: videoAi.fallbackReason }) }}</p>
          <ul v-if="videoAi && videoResultMode === 'ai'" class="cc-shots">
            <li v-for="s in videoAi.shots" :key="s.index" :class="s.source" :title="s.reason || ''">
              <i :class="s.source === 'fal' ? 'ri-image-edit-line' : 'ri-image-line'"></i>
              {{ s.source === 'fal' ? (s.reused ? $t('镜头 {n} · AI 动态（复用）', { n: s.index }) : $t('镜头 {n} · AI 动态', { n: s.index })) : $t('镜头 {n} · 本地推拉（回退）', { n: s.index }) }}
              <small v-if="s.source !== 'fal' && s.reason">{{ s.reason }}</small>
            </li>
            <li :class="videoAi.music.source === 'fal' ? '' : 'fallback'" :title="videoAi.music.reason || ''">
              <i class="ri-music-2-line"></i>{{ musicLabel(videoAi.music.source) }}
              <small v-if="videoAi.music.source !== 'fal' && videoAi.music.reason">{{ videoAi.music.reason }}</small>
            </li>
          </ul>
          <div class="cc-videos">
            <div v-for="l in LANGS.filter((x) => videos[x])" :key="l + videos[l]!.path" class="cc-video cc-unveil">
              <div class="cc-video__phone"><video :src="videos[l]!.srcUrl" controls playsinline preload="metadata"></video></div>
              <div class="cc-video__meta"><strong :lang="l">{{ LANG_LABEL[l] }}</strong><small class="cc-muted"><bdi dir="ltr">{{ fmtDur(videos[l]!.durationSec) }}</bdi> · <bdi dir="ltr">{{ fmtSize(videos[l]!.size) }}</bdi></small></div>
              <AssetActions :path="videos[l]!.path" :label="baseName(videos[l]!.path)" compact @regen="runVideo()" />
            </div>
          </div>
        </section>
      </CcStep>

      <!-- ── 最后一步：多平台发布 ── -->
      <CcStep step-key="publish" :index="stepIndex('publish')" :title="stepMeta('publish').title" :hint="stepMeta('publish').hint" :icon="stepMeta('publish').icon" :runtime="steps.runtime.publish" :is-current="steps.currentKey.value === 'publish'" :retry="lastAction.publish" :cancel="cancelRun" :retry-label="$t('重新发布')">
        <p v-if="!publishTarget" class="cc-note"><i class="ri-lightbulb-line"></i>{{ $t('先在上一步生成成片，或在下面的历史成品里点「发布」。') }}</p>
        <template v-else>
          <section class="cc-panel">
            <header class="cc-panel__head"><strong><i class="ri-movie-line"></i>{{ $t('发布哪一版成片') }}</strong><span class="cc-muted">{{ $t('一次发一版；其它语言版本可以再发一次') }}</span></header>
            <!-- 选了历史成品：直说发的是哪一次的哪一版，并留一条退路回到本次成片 -->
            <div v-if="publishPick" class="cc-note info">
              <i class="ri-history-line"></i>
              <span class="grow">{{ $t('发布历史成品：{time} · {lang} · {mode}', { time: fmtRunTime(publishPick.runId), lang: LANG_LABEL[publishPick.lang], mode: publishPick.mode === 'ai' ? $t('AI 增强版') : $t('素材剪辑版') }) }}</span>
              <button v-if="publishableLangs.length" type="button" class="cc-btn sm ghost" @click="clearPublishPick"><i class="ri-arrow-go-back-line"></i>{{ $t('改发本次成片') }}</button>
            </div>
            <div v-else class="cc-seg" role="radiogroup" :aria-label="$t('发布哪一版成片')">
              <button v-for="l in publishableLangs" :key="l" type="button" role="radio" class="cc-seg__btn" :class="{ active: publishLang === l }" :aria-checked="publishLang === l" :lang="l" @click="publishLang = l">{{ LANG_LABEL[l] }}</button>
            </div>
            <!--
              发布前把「到底要发哪条片子」摆出来：语言、时长、体积、成片方式、文件名，
              再配一个能直接播的预览。以前这里只有三个语言按钮，用户没法确认选中的那一版
              是不是自己要的 —— 发出去才发现发错语言，在平台侧是删不干净的。
            -->
            <div v-if="publishTarget" class="cc-pubpick">
              <div class="cc-pubpick__meta">
                <span class="cc-pubpick__lang" :lang="publishTarget.lang">{{ LANG_LABEL[publishTarget.lang] }}</span>
                <span class="cc-muted">{{ publishTargetDesc }}</span>
                <span class="grow"></span>
                <button type="button" class="cc-btn sm ghost" @click="openPath(publishTarget.path, true)"><i class="ri-folder-open-line"></i>{{ $t('打开文件位置') }}</button>
              </div>
              <div v-if="publishPreviewUrl" class="cc-video__phone"><video :src="publishPreviewUrl" controls playsinline preload="metadata"></video></div>
              <p v-else class="cc-muted"><i class="ri-loader-4-line"></i>{{ $t('预览加载中…') }}</p>
            </div>
          </section>

          <section class="cc-panel">
            <header class="cc-panel__head"><strong><i class="ri-send-plane-line"></i>{{ $t('选择发布平台') }}</strong><span class="cc-muted">{{ $t('登录一律在浏览器里完成；没勾的平台不会被碰') }}</span></header>
            <p class="cc-muted">{{ $t('国内平台') }}</p>
            <div class="cc-platforms">
              <button
                v-for="p in PUBLISH_PLATFORMS" :key="p.id" type="button" class="cc-platform"
                :class="{ active: publishPlatformIds.includes(p.id) }" :aria-pressed="publishPlatformIds.includes(p.id) ? 'true' : 'false'"
                @click="togglePublishPlatform(p.id)"
              >
                <span class="cc-platform__mark">{{ p.mark }}</span>
                <span class="cc-platform__text"><strong>{{ p.label }}</strong><small>{{ p.desc }}</small></span>
                <i v-if="publishPlatformIds.includes(p.id)" class="ri-check-line"></i>
              </button>
            </div>
            <p class="cc-muted">{{ $t('海外平台') }}</p>
            <div class="cc-platforms">
              <button
                v-for="p in OVERSEAS_PLATFORMS" :key="p.id" type="button" class="cc-platform"
                :class="{ active: overseasIds.includes(p.id) }" :aria-pressed="overseasIds.includes(p.id) ? 'true' : 'false'"
                @click="toggleOverseas(p.id)"
              >
                <span class="cc-platform__mark" :style="{ color: p.color, background: `color-mix(in srgb, ${p.color} 14%, transparent)` }"><i :class="p.icon"></i></span>
                <span class="cc-platform__text"><strong>{{ p.label }}</strong><small>{{ p.desc }}</small></span>
                <i v-if="overseasIds.includes(p.id)" class="ri-check-line"></i>
              </button>
            </div>
            <p class="cc-note info"><i class="ri-information-line"></i>{{ $t('两组可以同时勾选：国内走发布工作流（内置浏览器登录），海外直接驱动（YouTube 走系统 Chrome，Meta 走 Business Suite），各走各的链路。') }}</p>
          </section>

          <!-- 海外发布是直驱的，回执必须原样摆出来：成功 / 停在人工闸门 / 被什么挡住 -->
          <section v-if="overseasRuns.length" class="cc-panel">
            <header class="cc-panel__head"><strong><i class="ri-global-line"></i>{{ $t('海外发布回执') }}</strong></header>
            <ul class="cc-oruns">
              <li v-for="r in overseasRuns" :key="r.platformId" :class="r.state">
                <span class="cc-orun__icon" :style="{ color: r.color }"><i :class="r.icon"></i></span>
                <span class="cc-orun__text">
                  <strong>{{ r.platform }}</strong>
                  <small>{{ r.detail || overseasStateLabel(r) }}</small>
                </span>
                <span class="cc-chip" :class="r.state === 'done' && r.status !== 'handback' ? 'ok' : (r.state === 'failed' || r.state === 'cancelled') ? 'warn' : ''">{{ overseasStateLabel(r) }}</span>
              </li>
            </ul>
          </section>

          <section class="cc-panel">
            <header class="cc-panel__head">
              <strong><i class="ri-chat-quote-line"></i>{{ $t('发布文案') }}</strong>
              <span class="cc-muted">{{ $t('发布前可改；话题标签单独填，正文里不用再写') }}</span>
              <span class="grow"></span>
              <button type="button" class="cc-btn sm ghost" :disabled="captionBusy" @click="fillPublishCaption(true)"><i :class="captionBusy ? 'ri-loader-4-line cc-spin' : 'ri-quill-pen-line'"></i>{{ $t('重新生成文案') }}</button>
            </header>
            <textarea v-model="publishCaption" class="cc-textarea" rows="3" :dir="LANG_DIR[publishLang]" :lang="publishLang" :placeholder="$t('这条视频的发布正文')"></textarea>
            <label class="cc-field"><span>{{ $t('话题标签') }}</span><input v-model="publishTopics" type="text" :placeholder="$t('公益 慈善 用空格分隔')" /></label>
          </section>

          <p class="cc-note info"><i class="ri-shield-check-line"></i>{{ $t('发布会走工作流：打开内置浏览器 → 你扫码登录后点一下确认 → 自动上传、填写文案并发布。未登录的平台会被拦下并列出，不会带着空登录态硬发。') }}</p>
          <div class="cc-actions">
            <button type="button" class="cc-btn primary lg" :disabled="(!publishPlatformIds.length && !overseasIds.length) || !publishCaption.trim() || publishBusy" @click="runPublish()">
              <i :class="publishBusy ? 'ri-loader-4-line cc-spin' : 'ri-send-plane-fill'"></i>{{ $t('开始发布（{n} 个平台）', { n: publishPlatformIds.length + overseasIds.length }) }}
            </button>
          </div>
        </template>
      </CcStep>
    </div>

    <!-- 历史 -->
    <section v-if="history.length" class="cc-panel cc-history">
      <header class="cc-panel__head"><strong><i class="ri-history-line"></i>{{ $t('历史成品') }}</strong><span class="cc-muted">{{ $t('按次归档在 输出/<时间戳>/ 下；打开前会重新验真文件') }}</span><span class="grow"></span><button type="button" class="cc-btn sm ghost" @click="loadHistory"><i class="ri-refresh-line"></i>{{ $t('刷新') }}</button></header>
      <ul class="cc-history__list">
        <li v-for="r in history" :key="r.runId">
          <div class="cc-history__head"><strong>{{ fmtRunTime(r.runId) }}</strong><span v-if="r.archive" class="cc-muted">{{ pickContentLang(r.archive.eventName) }}</span><span class="grow"></span><button type="button" class="cc-btn sm ghost" @click="openPath(r.outDir, true)"><i class="ri-folder-open-line"></i>{{ $t('打开目录') }}</button></div>
          <details v-if="r.prompts" class="cc-history__prompts">
            <summary><i class="ri-quill-pen-line"></i>{{ $t('本次用的提示词') }}</summary>
            <p v-if="r.prompts.content"><b>{{ $t('内容提示词') }}</b><span dir="auto">{{ r.prompts.content }}</span></p>
            <p v-if="r.prompts.video"><b>{{ $t('视频提示词') }}</b><span dir="auto">{{ r.prompts.video }}</span></p>
          </details>
          <div class="cc-history__assets">
            <span v-for="l in LANGS.filter((x) => r.pdf?.[x])" :key="'p' + l" class="cc-chip link" @click="openVerified(r.pdf![l]!)"><i class="ri-file-pdf-2-line"></i>PDF {{ LANG_LABEL[l] }}</span>
            <span v-for="l in LANGS.filter((x) => r.poster?.[x])" :key="'o' + l" class="cc-chip link" @click="openVerified(r.poster![l]!)"><i class="ri-image-line"></i>{{ $t('海报') }} {{ LANG_LABEL[l] }}</span>
            <span v-for="l in LANGS.filter((x) => r.speech?.[x])" :key="'s' + l" class="cc-chip link" @click="openVerified(r.speech![l]!)"><i class="ri-mic-line"></i>{{ $t('语音') }} {{ LANG_LABEL[l] }}</span>
            <!-- 成片这一类多一个发布入口：看一眼是预览，直接发是发布，两个动作分开不误点 -->
            <span v-for="l in LANGS.filter((x) => r.videoAi?.[x])" :key="'va' + l" class="cc-chip link ok cc-chip--act">
              <span class="cc-chip__main" @click="previewHistoryVideo(r.videoAi![l]!, 'ai')"><i class="ri-movie-2-line"></i>{{ $t('视频') }} {{ LANG_LABEL[l] }} · {{ $t('AI 增强版') }}</span>
              <button type="button" class="cc-chip__act" :title="$t('发布这一条')" @click.stop="publishFromHistory(r, l, r.videoAi![l]!, 'ai')"><i class="ri-send-plane-line"></i>{{ $t('发布') }}</button>
            </span>
            <span v-for="l in LANGS.filter((x) => r.video?.[x])" :key="'v' + l" class="cc-chip link cc-chip--act">
              <span class="cc-chip__main" @click="previewHistoryVideo(r.video![l]!, 'clip')"><i class="ri-scissors-cut-line"></i>{{ $t('视频') }} {{ LANG_LABEL[l] }} · {{ $t('素材剪辑版') }}</span>
              <button type="button" class="cc-chip__act" :title="$t('发布这一条')" @click.stop="publishFromHistory(r, l, r.video![l]!, 'clip')"><i class="ri-send-plane-line"></i>{{ $t('发布') }}</button>
            </span>
          </div>
        </li>
      </ul>
    </section>
    <div v-if="historyVideoUrl" class="cc-lightbox" @click.self="historyVideoUrl = ''">
      <span class="cc-chip" :class="historyVideoMode === 'ai' ? 'ok' : ''"><i :class="historyVideoMode === 'ai' ? 'ri-movie-2-line' : 'ri-scissors-cut-line'"></i>{{ historyVideoMode === 'ai' ? $t('AI 增强版') : $t('素材剪辑版') }}</span>
      <div class="cc-video__phone big"><video :src="historyVideoUrl" controls autoplay playsinline></video></div>
      <button type="button" class="cc-btn ghost light" @click="historyVideoUrl = ''"><i class="ri-close-line"></i>{{ $t('关闭') }}</button>
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * 解决方案 · 慈善活动内容工场。
 *
 * 四步向导（每步独立状态 + 顶部粘性流程条，见 docs/solution-workbench-ux-guidelines.md）：
 *   1 上传素材 → 视觉模型起草活动档案（可改）
 *   2 逐图/抽帧描述 → 三语报告 PDF + 9:16 海报
 *   3 报告摘要 / 粘贴 / PDF 抽文 → 高保真语音（阿语自动回落标准音质）
 *   4 AI 增强版（默认；fal 不可用自动改剪辑版并标原因）/ 素材剪辑版 9:16 短视频（字幕 + 配音 + 配乐），进度按真实阶段
 * 「一键完整流程」把四步串起来，任一步失败由主进程回落预置成品（响应带 fallback 标记，只进 console）。
 */
import { computed, onBeforeUnmount, onMounted, reactive, ref, shallowRef, watch } from 'vue';
import type {
  CharityArchive, CharityMediaDescription, CharityMediaItem, CharityPrebakedResponse, CharityProgressEvent, CharityReport, CharityHistoryRun,
  CharityVideoAiReport, CharityVideoMode, CharityEffectivePrompts,
} from '@totalclaw/ipc-contracts';
import { useRouter } from 'vue-router';
import { useNotificationStore } from '../stores/notification';
import { t as i18nT, uiContentLang, pickContentLang, listSeparator } from '../i18n';
import { useStepWatchdog } from '../composables/useStepWatchdog';
import PageBackButton from '../components/PageBackButton.vue';
import CcProgress from '../workbenches/charity-content/CcProgress.vue';
import CcStep from '../workbenches/charity-content/CcStep.vue';
import LangChips from '../workbenches/charity-content/LangChips.vue';
import MaterialGrid from '../workbenches/charity-content/MaterialGrid.vue';
import AudioWave from '../workbenches/charity-content/AudioWave.vue';
import AssetActions from '../workbenches/charity-content/AssetActions.vue';
import CcVideoPhases from '../workbenches/charity-content/CcVideoPhases.vue';
import CcPromptBox from '../workbenches/charity-content/CcPromptBox.vue';
import { clipStyleFromPrompt, endSloganFromPrompt, mergeShotPrompt, needsCondense } from '../../shared/charityPrompts';
import {
  LANGS, LANG_LABEL, LANG_DIR, HD_VOICES, detectLang, type Lang, type StepKey, type StepMeta, type LineKey, type SpeechItems, type VideoItems,
  api, solutionApi, useSteps, stepMetas, lineMetas, scrollToStep, prefersReducedMotion, errorMessage, openPath, archiveReady, summaryTextOf, acceptStepResult, fmtDur, fmtSize, fmtRunTime, emptyTri, blankArchive, ltrIsolate,
  VIDEO_PLAN, usePersistedPrompt, defaultVoices, type VoiceGender,
} from '../workbenches/charity-content/shared';
import '../workbenches/charity-content/styles.css';
import FalServiceConfig from '../components/FalServiceConfig.vue';
// 发布链路与短视频工作台共用：同一个发布工作流、同一份平台清单，不另起一套
import { FIXED_VIDEO_PUBLISH_WORKFLOW_ID, buildVideoPublishWorkflow, setWorkflowAutoRun } from '../composables/workflowAutoRun';
import { type PublishPlatformId, platformIdsParam, publishPlatforms } from '../composables/publishPlatforms';
// 海外平台直驱（YouTube 系统 Chrome + AI 向导、Meta Business Suite 注入）与广告工作台共用同一套实现
import { type OverseasPlatformId, type OverseasPublishRun, overseasPlatforms, useOverseasPublish } from '../composables/overseasPublish';

const router = useRouter();
const notif = useNotificationStore();
const reducedMotion = prefersReducedMotion();
// ── 制作方向（两条隔离的线）──
// 记住上次选的：机构通常固定用其中一条（做活动记录的和做项目说明配音的往往不是同一个人）。
const LINE_METAS = lineMetas();
const LINE_STORE_KEY = 'charity-content.line';
function loadLine(): LineKey {
  try { const v = localStorage.getItem(LINE_STORE_KEY); if (v === 'event' || v === 'article') return v; } catch { /* 隐私模式 / 禁用存储 */ }
  return 'event';
}
const line = ref<LineKey>(loadLine());
const lineMeta = computed(() => LINE_METAS.find((m) => m.key === line.value) || LINE_METAS[0]);

/**
 * 能不能出片：
 *   event 线要有素材（画面就是那些照片与视频）；
 *   article 线要有至少一条配音（画面按文稿现生成，没配音则连时间轴都没有，出来是条哑片）。
 */
const canMakeVideo = computed(() => (line.value === 'article' ? LANGS.some((l) => !!speech.value[l]) : hasMaterials.value));

// 步骤链随线路重建（两条线的步骤集合与顺序都不同）。useSteps 每次返回新的 runtime，
// 所以切线等于把那条线的进度清成初始态——但**已产出的文件不动**（报告、语音、视频仍在磁盘与历史里）。
const steps = shallowRef(useSteps(stepMetas(line.value)));
function switchLine(next: LineKey): void {
  if (next === line.value || steps.value.isRunning()) return;
  line.value = next;
  try { localStorage.setItem(LINE_STORE_KEY, next); } catch { /* 忽略 */ }
  steps.value = useSteps(stepMetas(next));
  live.value = null;
}
/** 按 key 取当前线上的步骤描述；不在本线上时回落到全集，模板不会炸。 */
function stepMeta(key: StepKey): StepMeta {
  return steps.value.metas.find((m) => m.key === key) || stepMetas('event').find((m) => m.key === key)!;
}
/** 当前线上的第几步（0 基）。两条线步骤数不同，序号必须动态算，不能写死下标。 */
function stepIndex(key: StepKey): number {
  const i = steps.value.metas.findIndex((m) => m.key === key);
  return i < 0 ? 0 : i;
}

const live = ref<CharityProgressEvent | null>(null);

/**
 * 每一步最近一次的运行入口（带当时的参数）：步骤卡失败 / 可能已超时时的「重新生成」就重跑它。
 * 之所以记「入口」而不是写死一个函数：第 1 步可能是扫描也可能是起草档案，第 3 步可能是整批合成也可能是单语重做。
 */
const lastAction = reactive<Partial<Record<StepKey, () => Promise<unknown>>>>({});

/**
 * 换页 / 重进后，主进程里上一次的运行还在跑（本组件的 runId 随卸载丢了，它的 await 也没人接）。
 * 从进度事件里认领那个 runId：显示「仍在后台进行」+ 可停止。10 分钟没再来事件就当它已经结束，横幅自动收起。
 */
const orphanRun = ref<{ runId: string; step: string; msg: string; firstAt: number; lastAt: number } | null>(null);
const orphanStopping = ref(false);
const orphanWatchdog = useStepWatchdog({
  running: () => !!orphanRun.value,
  startedAt: () => orphanRun.value?.firstAt,
  lastProgressAt: () => orphanRun.value?.lastAt,
  kind: 'video',
});
watch(orphanWatchdog.suspect, (s) => { if (s) orphanRun.value = null; });
async function stopOrphanRun(): Promise<void> {
  const o = orphanRun.value;
  if (!o || orphanStopping.value) return;
  orphanStopping.value = true;
  try { await api().cancel({ runId: o.runId }); orphanRun.value = null; notif.info(i18nT('已停止')); } catch (e) { notif.error(errorMessage(e)); } finally { orphanStopping.value = false; }
}
/**
 * 这条进度事件是不是本组件正在跑的那一轮：
 *   · 本轮 runId 一致（或本轮还没拿到 runId —— 第一次扫描素材时 runId 由扫描结果带回）；
 *   · 重新扫描素材会换一个新 runId，那些 scan / archive 事件也是我们的。
 */
function ownsEvent(ev: CharityProgressEvent): boolean {
  if (!steps.value.isRunning()) return false;
  if (!runId.value || ev.runId === runId.value) return true;
  return steps.value.runtime.material?.state === 'running' && (ev.step === 'scan' || ev.step === 'archive');
}
function onProgressEvent(ev: CharityProgressEvent): void {
  if (ev.runId === 'demo-pack') return; // 演示包下载的进度另有去处
  const now = Date.now();
  if (ownsEvent(ev)) {
    live.value = ev;
    steps.value.heartbeat(now);
    return;
  }
  // 本轮 runId 的零散事件（步骤已收尾后迟到的那一两条）：是我们自己的，不是别人的运行
  if (runId.value && ev.runId === runId.value) return;
  // 不是我们这一轮的：是上一次（已卸载的组件）留在主进程里的运行
  const prev = orphanRun.value;
  orphanRun.value = { runId: ev.runId, step: ev.step, msg: ev.msg, firstAt: prev && prev.runId === ev.runId ? prev.firstAt : now, lastAt: now };
}

// ── 状态 ──
const dir = ref('');
const runId = ref('');
const outDir = ref('');
const items = ref<CharityMediaItem[]>([]);
const archive = ref<CharityArchive | null>(null);
// 档案 / 报告 / 朗读文本默认先展示与界面同语的那一份（三语都在，切换标签可看其它语言）
const archiveLang = ref<Lang>(uiContentLang());
const viewLang = ref<Lang>(uiContentLang());
const descriptions = ref<CharityMediaDescription[]>([]);
const analyzeWarning = ref('');
const NEEDS_MODEL_RE = /默认模型|default model/i;
function needsModel(err?: string): boolean { return !!err && NEEDS_MODEL_RE.test(err); }
function goModelSettings(): void { router.push({ path: '/settings', query: { section: 'ai-models' } }); }
const report = ref<CharityReport | null>(null);
const pdf = reactive(emptyTri());
const poster = reactive(emptyTri());
const posterPreview = reactive(emptyTri());
const pdfPreview = reactive(emptyTri());
const posterFlipped = reactive<Record<Lang, boolean>>({ zh: false, en: false, ar: false });
const speechSource = ref<'summary' | 'paste' | 'pdf'>(line.value === 'article' ? 'paste' : 'summary');
const ALL_SPEECH_SOURCES = [
  { key: 'summary' as const, label: i18nT('报告摘要') },
  { key: 'paste' as const, label: i18nT('粘贴文字') },
  { key: 'pdf' as const, label: i18nT('上传 PDF 抽文字') },
];
// article 线没跑过素材与报告，「报告摘要」这条来源无从谈起 —— 不显示，免得点了是空的。
const SPEECH_SOURCES = computed(() => (line.value === 'article' ? ALL_SPEECH_SOURCES.filter((s) => s.key !== 'summary') : ALL_SPEECH_SOURCES));
/**
 * 文稿只有一份（粘贴 / PDF 抽取 / 报告摘要都写进它），要出哪几种语言由「目标语言」多选决定；
 * 与文稿语言不同的目标，合成前先过一遍转译。speechText 存的是每种语言**实际被读出来**的文字
 * （源语言那一种就是文稿原文），既给判重用，也让成品能追溯到读的到底是什么。
 */
const sourceText = ref('');
const sourceLang = computed<Lang>(() => detectLang(sourceText.value));
const speechLangs = ref<Lang[]>([uiContentLang()]);
const translateTargets = computed(() => speechLangs.value.filter((l) => l !== sourceLang.value));
function toggleSpeechLang(l: Lang): void {
  speechLangs.value = speechLangs.value.includes(l) ? speechLangs.value.filter((x) => x !== l) : [...speechLangs.value, l];
}
const speechText = reactive<Record<Lang, string>>({ zh: '', en: '', ar: '' });
/**
 * 声音性别按语言各记一份：「选目标语言 → 选性别 → 选音色」是一条线选下来的，
 * 选的就该只影响当前这一种语言（中文要男声、阿语要女声是很常见的）。切性别时把该语言的
 * 音色换成这一性别的默认，仍可在下拉里细选。
 */
const speechGender = reactive<Record<Lang, VoiceGender>>({ zh: 'female', en: 'female', ar: 'female' });
const VOICE_GENDERS = computed(() => [
  { key: 'female' as const, label: i18nT('女声') },
  { key: 'male' as const, label: i18nT('男声') },
]);
const voices = reactive<Record<Lang, string>>(defaultVoices('female'));
function setSpeechGender(l: Lang, g: VoiceGender): void {
  if (speechGender[l] === g) return;
  speechGender[l] = g;
  voices[l] = defaultVoices(g)[l];
}
/** 换过文稿后其它语言的旧文本已清空时的提示（只提示一次，用户一改就不再提） */
const speechStale = ref('');
const speech = ref<SpeechItems>({});
const useNarration = ref(true);
const pdfPick = ref('');
const pdfPages = ref(2);
const pdfBusy = ref(false);
const pdfInfo = ref('');
/** 默认 AI 增强版（fal 不可用时主进程自动改用剪辑版并在结果里标原因）；剪辑版可手选 */
const videoMode = ref<CharityVideoMode>('ai');
/** 实际出片方式与 AI 镜头 / 配乐去向（请求 ai 也可能回退成 clip） */
const videoResultMode = ref<CharityVideoMode>('ai');
const videoAi = ref<CharityVideoAiReport | null>(null);
function musicLabel(src: CharityVideoAiReport['music']['source']): string {
  return src === 'fal' ? i18nT('配乐 · Stable Audio') : src === 'library' ? i18nT('配乐 · 本地配乐库（回退）') : src === 'synth' ? i18nT('配乐 · 本地合成（回退）') : i18nT('无配乐');
}
const videoLangs = ref<Lang[]>(['zh', 'en', 'ar']);
const bgmMood = ref('warm');
const videos = ref<VideoItems>({});
const history = ref<CharityHistoryRun[]>([]);
const historyVideoUrl = ref('');
const historyVideoMode = ref<CharityVideoMode>('clip');
const prebaked = ref<CharityPrebakedResponse | null>(null);
const oneClickBusy = ref(false);
// 两个提示词：第 1 步内容提示词（讲什么）、第 4 步视频提示词（怎么拍）；按界面语言预填默认，本会话刷新不丢
const contentPromptState = usePersistedPrompt('content');
const videoPromptState = usePersistedPrompt('video');
const contentPrompt = contentPromptState.value;
const videoPrompt = videoPromptState.value;
/** 上一次成片实际送给模型的提示词（主进程回传）；没生成过时展开看的是按当前输入合并的预览 */
const usedPrompts = ref<CharityEffectivePrompts | null>(null);
const promptPreview = computed<CharityEffectivePrompts>(() => {
  const m = mergeShotPrompt(contentPrompt.value, videoPrompt.value, bgmMood.value);
  const end = endSloganFromPrompt(videoPrompt.value);
  const endSlogan: Partial<Record<Lang, string>> = {};
  if (end.wanted) for (const l of LANGS) endSlogan[l] = end.text || archive.value?.eventName[l] || archive.value?.orgName[l] || '';
  return { shot: m.shot, music: m.music, contentPoints: m.contentPoints, stylePoints: m.stylePoints, clipStyle: clipStyleFromPrompt(videoPrompt.value), endSlogan };
});
const shownPrompts = computed(() => usedPrompts.value || promptPreview.value);
const longPrompts = computed(() => needsCondense(contentPrompt.value, videoPrompt.value));
const endSloganText = computed(() => shownPrompts.value.endSlogan[uiContentLang()] || LANGS.map((l) => shownPrompts.value.endSlogan[l]).find(Boolean) || '');
function paceLabel(p: CharityEffectivePrompts['clipStyle']['pace']): string { return p === 'slow' ? i18nT('舒缓节奏') : p === 'fast' ? i18nT('明快节奏') : i18nT('正常节奏'); }
function transitionLabel(t: CharityEffectivePrompts['clipStyle']['transition']): string { return t === 'fade' ? i18nT('淡入淡出') : i18nT('直切'); }

const hasMaterials = computed(() => items.value.some((i) => i.ok && (i.kind === 'image' || i.kind === 'video')));
const okPaths = computed(() => items.value.filter((i) => i.ok && (i.kind === 'image' || i.kind === 'video')).map((i) => i.path));
const imagePaths = computed(() => items.value.filter((i) => i.ok && i.kind === 'image').map((i) => i.path));
function countKind(k: CharityMediaItem['kind']): number { return items.value.filter((i) => i.kind === k && i.ok).length; }
function thumbOf(path: string): string { return items.value.find((i) => i.path === path)?.thumbDataUrl || ''; }
function baseName(p: string): string { return p.split(/[\\/]/).pop() || p; }
function numOrNull(v: string): number | null { const n = Number(v); return v === '' || !Number.isFinite(n) ? null : Math.max(0, Math.round(n)); }
function clone<T>(v: T): T { return JSON.parse(JSON.stringify(v)); }


// ── 第 1 步 ──
async function scan(req: { dir?: string; files?: string[] }): Promise<void> {
  lastAction.material = () => scan(req);
  const gen = steps.value.start('material');
  try {
    const r = acceptStepResult(i18nT('素材探测'), await api().scan(req));
    dir.value = r.dir; runId.value = r.runId; outDir.value = r.outDir;
    items.value = r.items;
    steps.value.resetAfter('material');
    report.value = null; descriptions.value = []; speech.value = {}; videos.value = {};
    steps.value.done('material', i18nT('已探测 {n} 个素材', { n: items.value.filter((i) => i.ok).length }), gen);
    await loadHistory();
  } catch (e) { steps.value.fail('material', e, gen); }
}
/** 输出目录到真正生成时才建：还没生成过（目录不存在）就定位到素材目录 */
async function openOutDir(): Promise<void> {
  const r = outDir.value ? await Promise.resolve(solutionApi()?.openPath?.(outDir.value, { reveal: true })).catch(() => null) : null;
  if (!r?.ok) openPath(dir.value, true);
}
async function pickDir(): Promise<void> { const r = await api().pickDir(); if (r?.path) await scan({ dir: r.path }); }
async function pickFiles(): Promise<void> { const r = await api().pickFiles(); if (r?.paths?.length) await scan({ dir: dir.value || undefined, files: [...items.value.map((i) => i.path), ...r.paths] }); }
async function onDropped(paths: string[]): Promise<void> {
  // 拖进目录 → 整目录；拖进文件 → 追加到当前清单
  const looksDir = paths.length === 1 && !/\.[a-z0-9]{2,5}$/i.test(paths[0]);
  if (looksDir) await scan({ dir: paths[0] });
  else await scan({ dir: dir.value || undefined, files: [...items.value.map((i) => i.path), ...paths] });
}
function removeItem(path: string): void { items.value = items.value.filter((i) => i.path !== path); }
async function loadDemoMaterials(): Promise<void> {
  // 随包演示素材先复制到 <文稿>/TotalClaw/慈善演示素材/（幂等，安装目录只读），产物写到其下 输出/<时间戳>/
  let r: { ok: boolean; dir?: string; error?: string } | null = null;
  try { r = await api().demoMaterials(); } catch (e) { r = { ok: false, error: errorMessage(e) }; }
  if (!r?.ok || !r.dir) { notif.warn(r?.error || i18nT('演示素材准备失败，请手动选择素材目录')); return; }
  await scan({ dir: r.dir });
  if (steps.value.runtime.material.state === 'failed') return;
  if (!archive.value && prebaked.value?.archive) archive.value = clone(prebaked.value.archive);
}
async function draftArchive(fallback = false): Promise<void> {
  lastAction.material = () => draftArchive(fallback);
  const gen = steps.value.start('material');
  try {
    const r = acceptStepResult(i18nT('档案草案'), await api().archiveDraft({ runId: runId.value, outDir: outDir.value, images: imagePaths.value, fallbackToPrebaked: fallback }));
    archive.value = r.archive;
    steps.value.done('material', i18nT('档案草案已生成：{ev}', { ev: pickContentLang(r.archive.eventName) }), gen);
  } catch (e) { steps.value.fail('material', e, gen); }
}

// ── 第 2 步 ──
async function runReport(fallback = false): Promise<boolean> {
  if (!archive.value) return false;
  lastAction.report = () => runReport(fallback);
  const gen = steps.value.start('report');
  report.value = null;
  analyzeWarning.value = '';
  try {
    const a = acceptStepResult(i18nT('素材整理'), await api().analyze({ runId: runId.value, outDir: outDir.value, items: okPaths.value, archive: archive.value, contentPrompt: contentPrompt.value, fallbackToPrebaked: fallback }));
    descriptions.value = a.descriptions || [];
    analyzeWarning.value = a.warning || '';
    const r = acceptStepResult(i18nT('报告生成'), await api().report({ runId: runId.value, outDir: outDir.value, archive: archive.value, descriptions: descriptions.value, images: imagePaths.value, contentPrompt: contentPrompt.value, fallbackToPrebaked: fallback }));
    report.value = r.report;
    Object.assign(pdf, r.pdf); Object.assign(poster, r.poster); Object.assign(posterPreview, r.posterPreview);
    for (const l of LANGS) {
      const u = await api().fileUrl({ path: r.pdf[l], kind: 'pdf' });
      pdfPreview[l] = u?.url || '';
    }
    steps.value.resetAfter('report');
    steps.value.done('report', i18nT('三语报告 PDF 与海报已生成，{n} 个素材已整理', { n: descriptions.value.length }), gen);
    useSummaryForSpeech();
    await loadHistory();
    return true;
  } catch (e) { steps.value.fail('report', e, gen); return false; }
}
/**
 * event 线：报告摘要本来就是三语现成的，直接填进各语言的朗读文本，不必再过转译
 * （再译一遍等于把专门生成的三语文案又改写一次）。文稿框显示与界面同语的那一份，
 * 目标语言也一并勾上有内容的那几种。
 */
function useSummaryForSpeech(): void {
  const s = summaryTextOf(report.value);
  for (const l of LANGS) if (s[l]) speechText[l] = s[l]!;
  const got = LANGS.filter((l) => speechText[l].trim());
  if (got.length) speechLangs.value = got;
  sourceText.value = speechText[uiContentLang()] || speechText[got[0]] || '';
  speechStale.value = '';
  speechSource.value = 'summary';
}

// ── 第 3 步 ──
/** article 线：直接从本机挑一个 PDF 当文稿来源（event 线是从已上传素材里挑）。 */
/**
 * 选一个 PDF。走专用通道（单选、只列 PDF）而不是通用素材选择器——后者标题是
 * 「选择活动照片 / 视频 / PDF」、允许多选照片视频，选中非 PDF 时这里只能静默丢弃、什么也不发生。
 */
async function pickSpeechPdf(): Promise<void> {
  const r = await api().pickPdf();
  if (!r?.path) return; // 取消
  pdfPick.value = r.path;
  await extractPdf();
}

async function extractPdf(): Promise<void> {
  if (!pdfPick.value) return;
  pdfBusy.value = true; pdfInfo.value = '';
  try {
    const r = await api().pdfText({ path: pdfPick.value, pages: pdfPages.value });
    if (!r?.ok) throw new Error(r?.error || i18nT('抽取失败'));
    // 换了文稿就等于换了内容：上一份留下的译文全部作废（合成时按新文稿重算）
    for (const x of LANGS) speechText[x] = '';
    sourceText.value = r.text;
    // 抽出来的是哪种语言就把它勾进目标语言，免得「抽了阿语文稿却只勾着中文」
    const l = detectLang(r.text);
    if (!speechLangs.value.includes(l)) speechLangs.value = [...speechLangs.value, l];
    speechStale.value = '';
    pdfInfo.value = i18nT('已抽取第 {p} 页（共 {t} 页）', { p: r.pages.join(listSeparator()), t: r.totalPages });
  } catch (e) { notif.error(errorMessage(e)); } finally { pdfBusy.value = false; }
}
/**
 * 保证本次运行有 runId 与输出目录。
 *
 * 活动记录线是「素材扫描」顺带发的；文章转语音线没有素材这一步，runId 一直是空字符串，
 * 点「合成语音」必被服务端校验挡下报「runId 格式不正确」——补这一步向主进程要一个。
 */
async function ensureRun(): Promise<boolean> {
  if (runId.value && outDir.value) return true;
  const r = await api().startRun({ dir: dir.value || undefined });
  if (!r?.ok || !r.runId || !r.outDir) { notif.warn(r?.error || i18nT('无法建立本次运行的输出目录')); return false; }
  runId.value = r.runId; outDir.value = r.outDir; dir.value = r.dir || dir.value;
  await loadHistory();
  return true;
}

/**
 * 第 3 步的合成入口。
 *
 * 文稿只有一份；「目标语言」多选决定出哪几种。与文稿语言不同的目标先过一遍转译，
 * 再逐语言合成。每次点按钮都重新读文稿框里当前的文字 —— 以前是每种语言各存一个框、
 * 换文稿只填进检测到的那一种，剩下的框留着上一份的旧文字也一起被配了音。
 */
/** 合成一种语言：用 speechText[lang]（源语言=文稿原文，其余=译文），成品并进 speech 不覆盖别的语言 */
async function synthOneLang(lang: Lang, fallback: boolean): Promise<void> {
  const body = speechText[lang].trim();
  if (!body) return;
  const r = acceptStepResult(i18nT('语音合成'), await api().tts({
    runId: runId.value, outDir: outDir.value, text: { [lang]: body }, voices: { [lang]: voices[lang] },
    gender: speechGender[lang], quality: 'hd', fallbackToPrebaked: fallback,
  }));
  // 合并而不是替换：别的语言之前合成好的成品还在，不能被这一次覆盖掉
  speech.value = { ...speech.value, ...r.items };
}
/** 合成结果落到步骤摘要（按目前累积到的成品算，不是本次这几种） */
function speechDone(gen: number): void {
  const made = LANGS.filter((l) => speech.value[l]);
  const hd = made.filter((l) => speech.value[l]?.quality === 'hd').length;
  steps.value.resetAfter('speech');
  steps.value.done('speech', i18nT('{n} 种语言已合成（{hd} 种高保真）', { n: made.length, hd }), gen);
}
/**
 * 把文稿摊成目标语言的朗读文本：源语言那一种直接用原文，其余送去转译。
 * 转译失败的语言不合成（返回的清单里没有它），避免拿空文本或旧译文去配音。
 */
async function resolveSpeechText(targets: Lang[]): Promise<Lang[]> {
  const src = sourceLang.value;
  const body = sourceText.value.trim();
  for (const l of LANGS) speechText[l] = ''; // 旧译文属于上一份文稿，不能留
  speechText[src] = body;
  const need = targets.filter((l) => l !== src);
  if (!need.length) return targets.filter((l) => speechText[l].trim());
  const r = await api().translate({ runId: runId.value, text: body, targets: need });
  if (!r?.ok) throw new Error(r?.error || i18nT('转译失败'));
  for (const l of need) if (r.items?.[l]) speechText[l] = String(r.items[l]).trim();
  if (r.failed?.length) notif.warn(i18nT('{langs} 转译失败，这几种没有合成', { langs: r.failed.map((l: Lang) => LANG_LABEL[l]).join(listSeparator()) }));
  return targets.filter((l) => speechText[l].trim());
}
async function runSpeech(fallback = false): Promise<boolean> {
  if (!sourceText.value.trim() || !speechLangs.value.length) return false;
  if (!await ensureRun()) return false;
  lastAction.speech = () => runSpeech(fallback);
  const gen = steps.value.start('speech');
  try {
    for (const l of await resolveSpeechText([...speechLangs.value])) await synthOneLang(l, fallback);
    speechDone(gen);
    await loadHistory();
    return true;
  } catch (e) { steps.value.fail('speech', e, gen); return false; }
}
/** 成品列表里的「重新生成」：只重做那一行的语言，文本沿用它上次读的那份（不重新转译） */
async function regenSpeech(lang: Lang): Promise<void> {
  if (!speechText[lang].trim() || !await ensureRun()) return;
  lastAction.speech = () => regenSpeech(lang);
  const gen = steps.value.start('speech');
  try {
    await synthOneLang(lang, false);
    speechDone(gen);
    await loadHistory();
  } catch (e) { steps.value.fail('speech', e, gen); }
}
/**
 * 一键完整流程用：报告摘要本来就是三语现成的，直接逐个合成，不再过转译
 * （再译一遍等于把专门生成的三语文案又改写一次）。
 */
async function runSpeechAll(fallback = false): Promise<boolean> {
  const wanted = LANGS.filter((l) => speechText[l].trim());
  if (!wanted.length) return false;
  if (!await ensureRun()) return false;
  lastAction.speech = () => runSpeechAll(fallback);
  const gen = steps.value.start('speech');
  try {
    for (const l of wanted) await synthOneLang(l, fallback);
    speechDone(gen);
    await loadHistory();
    return true;
  } catch (e) { steps.value.fail('speech', e, gen); return false; }
}
// ── 最后一步：多平台发布 ──
//
// 发布不另起一套：直接复用短视频工作台那条「校验成片 → 内置浏览器登录 → 分平台上传 →
// 回读回执」的发布工作流（buildVideoPublishWorkflow），只把入参换成本工作台的成片与文案。
// 平台清单也是同一份（composables/publishPlatforms）——两边各存一份迟早会漂。
const PUBLISH_PLATFORMS = publishPlatforms();
/**
 * 海外平台单独一组。两组的发布链路完全不同：
 *   国内 → 发布工作流（内置浏览器登录 → 分平台上传 → 人工确认）
 *   海外 → 直驱（YouTube 弹系统 Chrome 走 AI 向导、Meta 注入 Business Suite）
 * 所以不能混成一个清单一把发，只能同时勾选、各走各的。google_ads 是买广告不是发内容，
 * 这条线用不上，不列出来。
 */
const OVERSEAS_PLATFORMS = overseasPlatforms().filter((p) => p.id !== 'google_ads');
const overseasIds = ref<OverseasPlatformId[]>([]);
const { runs: overseasRuns, publish: publishOverseas, cancel: cancelOverseas } = useOverseasPublish();
function toggleOverseas(id: OverseasPlatformId): void {
  overseasIds.value = overseasIds.value.includes(id) ? overseasIds.value.filter((x) => x !== id) : [...overseasIds.value, id];
}
/**
 * 回执措辞。`state` 只说这条驱动跑完没跑砸，真正的结论在 `status` 里：
 * handback = 素材与文案都就位了、停在平台页面等你点最后那一下，这不是「已发布」，
 * 写成已发布就是谎报。
 */
function overseasStateLabel(r: OverseasPublishRun): string {
  if (r.state === 'done') return r.status === 'handback' ? i18nT('等你确认') : i18nT('已发布');
  if (r.state === 'cancelled') return i18nT('已停止');
  if (r.state === 'failed') return r.status === 'blocked' ? i18nT('被挡住') : i18nT('失败');
  if (r.state === 'running') return i18nT('进行中');
  return i18nT('待发布');
}
const publishLang = ref<Lang>(uiContentLang());
/**
 * 选中的历史成品。非空时发布这一条，而不是本次运行的成片 —— 历史列表里的成片本来就该
 * 能直接发，不该逼用户为了发一条上周的片子把整条流程重跑一遍。
 */
const publishPick = ref<{ path: string; lang: Lang; runId: string; archive?: CharityArchive; mode: CharityVideoMode } | null>(null);
const publishPlatformIds = ref<PublishPlatformId[]>([]);
const publishCaption = ref('');
const publishTopics = ref('');
const publishBusy = ref(false);
const captionBusy = ref(false);
/** 本次运行里有成片的语言 */
const publishableLangs = computed(() => LANGS.filter((l) => videos.value[l]));
/** 这一步真正要发的东西：优先选中的历史成品，否则本次运行里当前语言那一版 */
const publishTarget = computed<{ path: string; lang: Lang; runId: string; archive?: CharityArchive } | null>(() => {
  if (publishPick.value) return publishPick.value;
  const l = publishLang.value;
  const item = videos.value[l];
  return item ? { path: item.path, lang: l, runId: runId.value, archive: archive.value || undefined } : null;
});

/**
 * 发布对象的一行描述：成片方式 + 时长 + 体积 + 文件名。
 * 历史成品没有 durationSec/size（历史列表只存路径与方式），能给什么给什么，不硬凑。
 */
const publishTargetDesc = computed(() => {
  const t = publishTarget.value;
  if (!t) return '';
  const item = publishPick.value ? null : videos.value[t.lang];
  const parts: string[] = [];
  const mode = publishPick.value?.mode || item?.mode;
  if (mode) parts.push(mode === 'ai' ? i18nT('AI 增强版') : i18nT('素材剪辑版'));
  if (item?.durationSec) parts.push(fmtDur(item.durationSec));
  if (item?.size) parts.push(fmtSize(item.size));
  parts.push(t.path.split(/[/\\]/).pop() || ''); // Windows 是反斜杠，只切 '/' 会把整条绝对路径显示出来
  return parts.filter(Boolean).join(' · ');
});

/**
 * 发布对象的可播放 URL。
 *
 * 不能直接把本地绝对路径塞进 <video src>：渲染进程没有文件系统权限，必须经
 * `fileUrl()` 换成自定义协议地址（与历史成品预览同一条路）。
 * 切换语言、改选历史成品都要重新换一次，所以挂 watch 而不是算一次。
 */
const publishPreviewUrl = ref('');
watch(publishTarget, async (t) => {
  publishPreviewUrl.value = '';
  if (!t?.path) return;
  const want = t.path;
  const r = await api().fileUrl({ path: want, kind: 'video' }).catch(() => null);
  // 换 URL 是异步的，等回来时用户可能已经切到别的语言了，落后的那次不许覆盖。
  if (publishTarget.value?.path !== want) return;
  publishPreviewUrl.value = r?.ok && r.url ? r.url : '';
}, { immediate: true });

function togglePublishPlatform(id: PublishPlatformId): void {
  publishPlatformIds.value = publishPlatformIds.value.includes(id)
    ? publishPlatformIds.value.filter((x) => x !== id)
    : [...publishPlatformIds.value, id];
}

/**
 * 备一条发布正文。
 *
 * 先用现成的事实拼一条（活动名 + 报告摘要）——这条线本来就有三语报告，不必每次都花一次
 * 模型调用；`force` 或没有现成文本时才走 LLM 润色成更像人写的发布文案。
 * 任何失败都回落到拼出来的那条，绝不阻断发布。
 */
async function fillPublishCaption(force = false): Promise<void> {
  const l = publishLang.value;
  // 发历史成品时用那一次归档的档案，别拿当前界面上的档案去配上周的片子
  const arc = publishPick.value?.archive || archive.value || undefined;
  const summary = publishPick.value ? arc?.summary[l] : (report.value?.[l]?.summary || arc?.summary[l]);
  const plain = [summary || '', arc?.eventName[l] || ''].map((x) => String(x || '').trim()).filter(Boolean).join(' ');
  if (!force && publishCaption.value.trim()) return;
  if (!force) { publishCaption.value = plain.slice(0, 300); return; }
  captionBusy.value = true;
  try {
    const llm = (window as any).electronAPI?.llmOneshot;
    if (!llm || !plain) { publishCaption.value = plain.slice(0, 300); return; }
    const reply = await llm({
      systemPrompt: i18nT('你是公益机构的新媒体运营。只输出发布正文本身，不要解释、不要引号、不要话题标签。'),
      prompt: [
        i18nT('机构：{p0}', { p0: arc?.orgName[l] || '' }),
        i18nT('活动：{p0}', { p0: arc?.eventName[l] || '' }),
        '',
        i18nT('可用事实（不得超出这些内容虚构）：'),
        plain.slice(0, 1200),
        '',
        i18nT('写一条 120 字以内的发布正文：开头一句话说清这是什么活动，中间讲最打动人的一个事实，结尾一句温和的号召。只依据上面的事实，不得虚构人数、金额、地点。现在只输出正文。'),
      ].join('\n'),
      timeoutMs: 120_000,
      plainCompletion: true,
    });
    const text = String(reply?.text || '').trim().replace(/^["\'「」]+|["\'「」]+$/g, '');
    publishCaption.value = (text || plain).slice(0, 300);
  } catch {
    publishCaption.value = plain.slice(0, 300); // 润色失败不挡发布
  } finally { captionBusy.value = false; }
}

/**
 * 进入发布工作流。成片路径、平台、话题、文案交给工作流入参，人工确认那一步由工作流页承接
 * （发布前会停下来等你确认，确认了才真正公开）。
 */
/**
 * 发布。两组平台链路不同，各走各的：
 *   海外 → 直驱（弹浏览器 / 注入上传页），结果就地出回执，**留在本页**看；
 *   国内 → 发布工作流，跳转到工作流页继续（人工确认在那边）。
 * 两组都勾时先跑海外（它要你盯着浏览器），跑完再跳工作流，不会让页面在你操作到一半时被切走。
 */
/**
 * 「机构：」这种只剩标签、冒号后面空着的行要丢掉，别喂给 LLM 当事实。
 * 抽成常量是因为它是**判据**不是文案：翻译了反而认不出来（i18n 守卫会把裸中文标出来，
 * 但这里要的恰恰是不随界面语言变的那个字符）。
 */
const LABEL_ONLY_SUFFIX = String.fromCharCode(0xFF1A);

async function runPublish(): Promise<void> {
  const target = publishTarget.value;
  if (!target || publishBusy.value) return;
  if (!publishPlatformIds.value.length && !overseasIds.value.length) return;
  const l = target.lang;
  publishBusy.value = true;
  lastAction.publish = () => runPublish();
  const gen = steps.value.start('publish');
  try {
    const caption = publishCaption.value.trim();
    const tags = publishTopics.value.split(/[\s,，#]+/).map((x) => x.trim()).filter(Boolean).slice(0, 8);
    const projectName = target.archive?.eventName[l] || target.archive?.orgName[l] || i18nT('慈善活动内容工场');

    if (overseasIds.value.length) {
      // contextBrief 由调用方自己拼：YouTube 上传向导的 LLM 靠它填标题与说明，
      // 这里给的是「哪个机构、什么活动、讲了什么」，绝不让它自由发挥编事实
      const brief = [
        i18nT('机构：{p0}', { p0: target.archive?.orgName[l] || '' }),
        i18nT('活动：{p0}', { p0: target.archive?.eventName[l] || '' }),
        caption,
      ].filter((x) => x && !x.endsWith(LABEL_ONLY_SUFFIX)).join('\n');
      await publishOverseas(overseasIds.value.map((platform) => ({
        platform, videoPath: target.path, title: projectName, caption,
        hashtags: tags, autoPublish: true, contextBrief: brief,
      })));
    }

    if (publishPlatformIds.value.length) {
      const api = (window as any).electronAPI;
      if (!api?.saveWorkflow || !api?.runWorkflow) throw new Error(i18nT('当前版本未开放工作流运行'));
      const ids = publishPlatformIds.value;
      // 话题按平台各来一份：工作流入参要的是 {平台 ID: ["话题", …]} 这个形状
      const input = {
        videoPath: target.path,
        projectName,
        platforms: platformIdsParam(ids),
        topics: JSON.stringify(Object.fromEntries(ids.map((id) => [id, tags]))),
        caption,
        workflowSource: 'charity-content',
        returnPath: '/workbenches/charity-content',
        returnLabel: i18nT('返回慈善活动内容工场'),
      };
      await api.saveWorkflow(buildVideoPublishWorkflow(input));
      setWorkflowAutoRun(FIXED_VIDEO_PUBLISH_WORKFLOW_ID, input);
      steps.value.done('publish', i18nT('已交给发布工作流：{n} 个平台 · {lang} 版', { n: ids.length, lang: LANG_LABEL[l] }), gen);
      await router.push({ path: '/workflow' });
      return;
    }
    // 只发海外：回执就在本页，按实际结果收尾，不谎报成功
    // 被停掉的不能写成「完成」：cancelRun 已经把这一步标成失败了，这里再 done 一次
    // 会把它盖回绿的 —— 界面显示发布完成、实际一个都没发出去。
    if (overseasRuns.value.some((r) => r.state === 'cancelled')) return;
    // 只数真发出去的：停在人工闸门的不算成功，它还等着你去点
    const ok = overseasRuns.value.filter((r) => r.state === 'done' && r.status !== 'handback').length;
    steps.value.done('publish', i18nT('海外发布完成：{ok} / {n} 个平台', { ok, n: overseasRuns.value.length }), gen);
  } catch (e) {
    steps.value.fail('publish', e, gen);
  } finally { publishBusy.value = false; }
}

/**
 * 一键载入演示成品：不跑生成，直接把预置的报告 / 海报 / 语音 / 成片装进本次运行。
 *
 * 成品本体在 CDN 上（一百多兆，不塞安装包也不进仓库），第一次用会先下载一次并逐文件
 * 校验 sha256，之后本地复用 —— 所以换机器也带得走，它本来就不在机器上。
 */
const demoBusy = ref(false);
const demoMsg = ref('');
const demoPack = ref<{ ready?: boolean; totalBytes?: number; baseUrl?: string } | null>(null);
const demoPackHint = computed(() => {
  if (demoPack.value?.ready) return i18nT('直接摆出一整套真跑出来的成品，不花时间生成');
  if (!demoPack.value?.baseUrl) return i18nT('演示包地址未配置，请联系管理员');
  return i18nT('首次使用会先下载演示数据（约 {mb} MB），之后本地复用', { mb: Math.round((demoPack.value?.totalBytes || 0) / 1024 / 1024) });
});

async function loadDemoResult(): Promise<void> {
  if (demoBusy.value) return;
  demoBusy.value = true;
  demoMsg.value = '';
  try {
    const st = await api().demoPackStatus();
    demoPack.value = st;
    if (st?.ok && !st.ready) {
      if (!st.baseUrl) { notif.warn(i18nT('演示包地址未配置，请联系管理员')); return; }
      demoMsg.value = i18nT('下载演示数据…');
      const got = await api().demoPackFetch();
      if (!got?.ok) { notif.error(got?.error || i18nT('演示数据下载失败')); return; }
      demoPack.value = got;
    }
    if (!await ensureRun()) return;
    const r = acceptStepResult(i18nT('演示成品'), await api().demoResult({ runId: runId.value, outDir: outDir.value, mode: videoMode.value }));
    archive.value = r.archive;
    report.value = r.report;
    Object.assign(pdf, r.pdf || {});
    Object.assign(poster, r.poster || {});
    Object.assign(posterPreview, r.posterPreview || {});
    speech.value = r.speech || {};
    videos.value = r.videos || {};
    videoResultMode.value = r.mode || 'clip';
    videoAi.value = null;
    // 全流程直接置为完成：这一套成品是齐的，步骤条不该还停在第一步让人以为没跑
    for (const m of steps.value.metas) {
      if (m.key === 'publish') continue; // 发布还得人点，不能替他标完成
      steps.value.done(m.key, i18nT('已载入演示成品'));
    }
    if (!publishableLangs.value.includes(publishLang.value)) publishLang.value = publishableLangs.value[0] || publishLang.value;
    await fillPublishCaption();
    await loadHistory();
    notif.info(i18nT('演示成品已就绪，可直接播放、下载或发布'));
  } catch (e) {
    notif.error(errorMessage(e));
  } finally { demoBusy.value = false; demoMsg.value = ''; }
}

// ── 第 4 步 ──
async function runVideo(fallback = false): Promise<boolean> {
  // article 线不经过「活动档案」那一步，用空档案占位即可（档案只在报告 / 海报里出数字）
  if (!archive.value && line.value === 'article') archive.value = blankArchive();
  if (!archive.value) return false;
  if (!await ensureRun()) return false;
  lastAction.video = () => runVideo(fallback);
  const gen = steps.value.start('video');
  videos.value = {};
  videoAi.value = null;
  usedPrompts.value = null;
  live.value = null;
  try {
    const captions: Partial<Record<Lang, string[]>> = {};
    for (const l of LANGS) captions[l] = report.value?.[l]?.captions || [archive.value.eventName[l], archive.value.orgName[l]].filter(Boolean);
    const narration: Partial<Record<Lang, string>> = {};
    if (useNarration.value) for (const l of LANGS) if (speech.value[l]) narration[l] = speech.value[l]!.path;
    const r = acceptStepResult(i18nT('短视频'), await api().video({ runId: runId.value, outDir: outDir.value, items: okPaths.value, mode: videoMode.value, langs: videoLangs.value, archive: archive.value, captions, narration, bgmMood: bgmMood.value, contentPrompt: contentPrompt.value, videoPrompt: videoPrompt.value, visuals: line.value === 'article' ? 'ai-text' : 'materials', fallbackToPrebaked: fallback }));
    videos.value = r.items;
    usedPrompts.value = r.prompts || null;
    videoResultMode.value = r.mode || videoMode.value;
    videoAi.value = r.ai || null;
    steps.value.done('video', videoSummary(Object.keys(r.items).length, videoResultMode.value, videoAi.value), gen);
    // 备好发布这一步：默认发与界面同语的那一版（没有就取第一版），文案先用现成事实拼一条
    if (!publishableLangs.value.includes(publishLang.value)) publishLang.value = publishableLangs.value[0] || publishLang.value;
    await fillPublishCaption();
    await loadHistory();
    return true;
  } catch (e) { steps.value.fail('video', e, gen); return false; }
}

function videoSummary(n: number, mode: CharityVideoMode, ai: CharityVideoAiReport | null): string {
  if (ai?.fallbackReason) return i18nT('{n} 个语言版本成片完成 · 已改用素材剪辑版（{why}）', { n, why: ai.fallbackReason });
  if (mode !== 'ai' || !ai) return i18nT('{n} 个语言版本成片完成', { n });
  const fell = ai.shots.filter((s) => s.source !== 'fal').map((s) => s.index);
  return fell.length
    ? i18nT('{n} 个语言版本 AI 增强版完成 · 第 {shots} 镜回退本地推拉', { n, shots: fell.join(listSeparator()) })
    : i18nT('{n} 个语言版本 AI 增强版完成 · {k} 个动态镜头', { n, k: ai.shots.length });
}

// ── 一键完整流程：每步真跑，失败由主进程回落预置成品 ──
async function runOneClick(): Promise<void> {
  if (oneClickBusy.value) return;
  oneClickBusy.value = true;
  try {
    for (const k of ['material', 'report', 'speech', 'video'] as StepKey[]) steps.value.reset(k);
    if (!archive.value || archive.value.source === 'vlm') await draftArchive(true);
    else steps.value.done('material', i18nT('已探测 {n} 个素材，档案就绪：{ev}', { n: items.value.filter((i) => i.ok).length, ev: pickContentLang(archive.value.eventName) }));
    if (steps.value.runtime.material.state === 'failed') return;
    if (!(await runReport(true))) return;
    useSummaryForSpeech();
    if (!(await runSpeechAll(true))) return;
    useNarration.value = true;
    videoMode.value = 'ai';
    await runVideo(true);
  } finally { oneClickBusy.value = false; }
}
async function cancelRun(): Promise<void> {
  if (runId.value) await api().cancel({ runId: runId.value });
  // 发布这一步不在主进程流水线里：它是渲染层驱动浏览器 + 主进程跑 Meta 自动化，
  // 只 cancel 流水线的话界面标成已停止、浏览器那边还在照点不误（实拍反馈：
  // 第 5 步已失败，Facebook 回执却一直「进行中」）。
  cancelOverseas();
  for (const m of steps.value.metas) if (steps.value.runtime[m.key].state === 'running') steps.value.fail(m.key, i18nT('已停止'));
}

// ── 历史 ──
async function loadHistory(): Promise<void> {
  if (!dir.value) return;
  try { const r = await api().history({ dir: dir.value }); history.value = r?.runs || []; } catch { history.value = []; }
}
async function openVerified(path: string): Promise<void> {
  const kind = /\.mp4$/i.test(path) ? 'video' : /\.mp3$/i.test(path) ? 'audio' : /\.pdf$/i.test(path) ? 'pdf' : 'image';
  const r = await api().fileUrl({ path, kind });
  if (!r?.ok) { notif.error(r?.error || i18nT('文件已不存在')); await loadHistory(); return; }
  openPath(path);
}
/**
 * 从历史成品直接发布。先验真文件（归档目录可能被手工清过），再把它选成发布目标；
 * 文案按那一次归档的档案重备一条，免得拿当前界面上的活动名去配上一次的片子。
 */
async function publishFromHistory(run: CharityHistoryRun, lang: Lang, path: string, mode: CharityVideoMode): Promise<void> {
  const r = await api().fileUrl({ path, kind: 'video' });
  if (!r?.ok || !r.url) { notif.error(r?.error || i18nT('文件已不存在')); await loadHistory(); return; }
  publishPick.value = { path, lang, runId: run.runId, archive: run.archive, mode };
  publishLang.value = lang;
  publishCaption.value = '';
  await fillPublishCaption();
  steps.value.reset('publish');
  void scrollToStep('publish');
}
/** 放弃历史选择，回到发布本次运行的成片 */
function clearPublishPick(): void {
  publishPick.value = null;
  publishLang.value = publishableLangs.value[0] || publishLang.value;
  publishCaption.value = '';
  void fillPublishCaption();
}

async function previewHistoryVideo(path: string, mode: CharityVideoMode): Promise<void> {
  const r = await api().fileUrl({ path, kind: 'video' });
  if (!r?.ok || !r.url) { notif.error(r?.error || i18nT('文件已不存在')); await loadHistory(); return; }
  historyVideoMode.value = mode;
  historyVideoUrl.value = r.url;
}

let offEvent: (() => void) | null = null;
onMounted(async () => {
  offEvent = api()?.onEvent?.(onProgressEvent) || null;
  try { prebaked.value = await api().prebaked(); } catch { prebaked.value = null; }
  try { demoPack.value = await api().demoPackStatus(); } catch { demoPack.value = null; }
});
onBeforeUnmount(() => { offEvent?.(); });
</script>

<style scoped>
/* 列宽 minmax(0,1fr)：只由主内容区决定（侧栏展开/收起都不横向溢出）；行高 max-content：本容器定高滚动，
   auto 行在内容超高时会退到子项的自动最小高度，带 overflow 的子项（hero）会被压扁 */
.cc-workbench { display: grid; grid-template-columns: minmax(0, 1fr); grid-auto-rows: max-content; gap: 16px; padding: 18px 22px 48px; max-width: 1440px; margin: 0 auto; width: 100%; min-width: 0; box-sizing: border-box; flex: 1; min-height: 0; overflow-y: auto; overflow-x: hidden; align-content: start; position: relative; }
/* 历史成品的「海报 / 视频 + 语言名」chip：英文词典里 poster / video 是小写（关键词匹配也在用），这里只在显示层首字母大写 */
.cc-history__assets .cc-chip { text-transform: capitalize; }
</style>
