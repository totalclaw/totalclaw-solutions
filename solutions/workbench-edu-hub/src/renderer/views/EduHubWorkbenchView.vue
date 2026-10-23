<template>
  <div class="eh-page">
    <header class="eh-head">
      <PageBackButton />
      <div class="eh-title">
        <h2>{{ direction === 'quran' ? $t('AI 学习中心 · 古兰经教学平台') : $t('AI 学习中心 · 文档生成教案') }}</h2>
        <p>{{ direction === 'quran' ? $t('标准经文语料 → 章节结构与课程 → 动态出题与学情分析 → 强化教学与复测；学生用同一套校内服务扫码作答。') : $t('导入教材讲义 → 一次生成教案、学生要点与小测 → 审核发布 → 学生浏览器直接学习，数据不出本机。') }}</p>
      </div>
      <span :class="['eh-run', status.running ? 'on' : 'off']">
        <i></i>{{ status.running ? $t('校内服务运行中') : $t('服务未启动') }}
      </span>
    </header>

    <!--
      制作方向。两个方向共用同一套校内服务（学生扫同一个码、用同一枚班级码），
      只是教师这一侧的内容生产链不同：一条从文档生成教案，一条从经文语料走教学闭环。
      古兰经方向是按账号售卖的方案包，没开通就不显示这个标签（授权口径与合并前一致）。
    -->
    <nav v-if="quranEnabled" class="eh-dirs" role="tablist" :aria-label="$t('制作方向')">
      <button
        v-for="d in DIRECTIONS" :key="d.key" type="button" role="tab" class="eh-dir"
        :class="{ on: direction === d.key }" :aria-selected="direction === d.key ? 'true' : 'false'"
        @click="switchDirection(d.key)"
      ><i :class="d.icon"></i>{{ d.label }}</button>
    </nav>

    <!-- 全局错误条：任一步骤的操作失败都在此可见（不只 step 1） -->
    <div v-if="svcNotice" class="eh-notice" role="status">
      <span>{{ svcNotice }}</span>
      <button class="eh-notice-x" :aria-label="$t('关闭')" @click="svcNotice = ''">×</button>
    </div>
    <div v-if="svcError" class="eh-banner" role="alert">
      <span>{{ svcError }}</span>
      <button class="eh-banner-x" :aria-label="$t('关闭')" @click="svcError = ''">×</button>
    </div>

    <!-- 古兰经方向：整块正文换成它自己的三入口（教师端九步主线 / 学生端 / 管理层） -->
    <QuranPlatform v-if="direction === 'quran'" />

    <!-- 步骤条：sticky 常驻视口（解决方案工作台硬规则） -->
    <nav v-show="direction === 'lesson'" class="eh-steps">
      <button
        v-for="s in steps" :key="s.id"
        :class="['eh-step', step === s.id && 'on', s.done() && 'done']"
        @click="step = s.id">
        <span class="n"><i v-if="s.done()" class="ri-check-line" aria-hidden="true"></i><template v-else>{{ s.n }}</template></span>
        <span class="tx">{{ s.label }}<small>{{ s.sub() }}</small></span>
      </button>
    </nav>

    <!-- ① 服务与班级 -->
    <section v-show="direction === 'lesson' && step === 1" class="eh-pane">
      <div class="eh-svc">
        <div class="eh-card">
          <h3>{{ $t('学生访问入口') }}</h3>
          <div v-if="status.running" class="eh-url">{{ status.url }}</div>
          <div v-else class="eh-hint">{{ $t('启动后学生用浏览器/扫码进入，无需安装任何应用。') }}</div>
          <div class="eh-btns">
            <button v-if="!status.running" class="btn pri" :disabled="busy" @click="startSvc">{{ $t('启动校内服务') }}</button>
            <template v-else>
              <button class="btn danger" :disabled="busy" @click="stopSvc">{{ $t('停止服务') }}</button>
              <button class="btn" @click="copyUrl">{{ copied ? $t('已复制') : $t('复制地址') }}</button>
            </template>
          </div>
          <p class="eh-hint">{{ $t('随本解决方案启停；退出应用自动停止。学生数据保存在本机，AI 请求经本机代理。') }}</p>
        </div>
        <div class="eh-card eh-qr-card">
          <img v-if="qrDataUrl" :src="qrDataUrl" class="eh-qr" alt="QR" />
          <div v-else class="eh-qr eh-qr-empty">{{ $t('启动后生成二维码') }}</div>
          <div class="eh-code">
            <span class="k">{{ $t('班级码（学生登录用）') }}</span>
            <b>{{ status.classCode }}</b>
            <div class="eh-btns">
              <button class="btn sm" @click="rotateCode">{{ $t('换一枚') }}</button>
              <button class="btn sm" @click="toggleCodeHistory">
                {{ codeHistoryOpen ? $t('收起历史') : $t('历史班级码') }}
              </button>
            </div>
            <span class="k num">{{ $t('在线 {online} / 共 {total} 名学生', { online: status.onlineStudents, total: status.totalStudents }) }}</span>
            <!-- 换码前发出去的那枚不再蒸发：留痕 + 可一键恢复（用户实拍：刷新完就找不回来了） -->
            <div v-if="codeHistoryOpen" class="eh-codehist">
              <div v-for="h in codeHistory" :key="h.code" class="eh-codehist-row">
                <b class="eh-codehist-code">{{ h.code }}</b>
                <span v-if="!h.retiredAt" class="chip ok">{{ $t('在用') }}</span>
                <span v-else class="k">{{ $t('{t} 停用', { t: relTime(h.retiredAt) }) }}</span>
                <span v-if="h.students" class="k">{{ $t('{n} 人', { n: h.students }) }}</span>
                <span class="grow"></span>
                <button v-if="h.retiredAt" class="btn sm" @click="restoreCode(h.code)">{{ $t('设为当前') }}</button>
              </div>
              <div v-if="!codeHistory.length" class="k">{{ $t('还没有换过班级码。') }}</div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ② 资料与教案 -->
    <section v-show="direction === 'lesson' && step === 2" class="eh-pane">
      <div class="eh-row">
        <button class="btn pri" @click="importFiles">{{ $t('导入资料（PDF / DOCX / PPTX / TXT）') }}</button>
        <span class="k">{{ $t('导入即解析；解析完成后可一键生成教案，同一文档重复生成走缓存秒回。') }}</span>
      </div>

      <div v-for="m in materials" :key="m.id" class="eh-card eh-mat">
        <div class="eh-mat-head">
          <b class="grow">{{ m.name }}</b>
          <span v-if="m.status === 'parsing'" class="chip warn">{{ $t('解析中…') }}</span>
          <span v-else-if="m.status === 'failed'" class="chip bad">{{ $t('解析失败') }}</span>
          <span v-else class="chip ok num">{{ $t('{pages} 页 · {kchars}k 字', { pages: m.pages, kchars: Math.round(m.chars / 1000) }) }}</span>
          <button v-if="m.status === 'failed'" type="button" class="eh-retry" :disabled="reparsing.has(m.id)" @click="reparse(m)">
            {{ reparsing.has(m.id) ? $t('重新解析中…') : $t('重新解析') }}
          </button>
          <template v-if="m.status === 'ready'">
            <select v-model="genOptsFor(m.id).grade" class="eh-sel" :class="{ 'eh-sel--need': !genOptsFor(m.id).grade }" :aria-label="$t('学段')">
              <option value="" disabled>{{ $t('请选择学段') }}</option>
              <option v-for="g in gradeOptions" :key="g.key" :value="g.key">{{ g.label }}</option>
            </select>
            <select v-model.number="genOptsFor(m.id).minutes" class="eh-sel" :aria-label="$t('课时长度')">
              <option :value="40">40 {{ $t('分钟') }}</option>
              <option :value="45">45 {{ $t('分钟') }}</option>
              <option :value="90">90 {{ $t('分钟') }}</option>
            </select>
            <select v-model="genOptsFor(m.id).lang" class="eh-sel" :aria-label="$t('输出语言')">
              <option value="zh-CN">{{ $t('中文') }}</option>
              <option value="en-US">English</option>
              <option value="ar">العربية</option>
            </select>
            <div class="eh-seg" role="group" :aria-label="$t('生成方式')">
              <button type="button" :class="['eh-seg-b', { on: genOptsFor(m.id).mode === 'rich' }]"
                :title="$t('大模型直出整页，最精美，约几分钟')" @click="genOptsFor(m.id).mode = 'rich'">{{ $t('精美') }}</button>
              <button type="button" :class="['eh-seg-b', { on: genOptsFor(m.id).mode === 'fast' }]"
                :title="$t('代码排版整页，约 1 分钟')" @click="genOptsFor(m.id).mode = 'fast'">{{ $t('快速') }}</button>
            </div>
            <button class="btn pri sm" :disabled="generatingIds.has(m.id) || !genOptsFor(m.id).grade"
              :title="genOptsFor(m.id).grade ? '' : $t('先选学段：这份文档没判出来，猜错了整份教案的难度都会偏')"
              @click="generate(m)">
              {{ generatingIds.has(m.id) ? $t('生成中…') : $t('生成教案') }}
            </button>
          </template>
          <button class="eh-del" :title="$t('删除这份资料及其教案')" @click="removeMaterial(m)"><i class="ri-delete-bin-line"></i></button>
        </div>
        <p v-if="m.status === 'failed'" class="eh-err">
          <i class="ri-error-warning-line"></i>{{ m.error || $t('未知原因') }}
        </p>
        <p v-if="m.status === 'ready' && m.suggest" class="k eh-suggest">
          <i class="ri-search-eye-line"></i>{{ suggestText(m) }}
        </p>
        <p v-if="m.status === 'ready'" class="k eh-mode-hint">
          {{ genOptsFor(m.id).mode === 'rich' ? $t('精美：大模型亲自设计整页（版式更丰富），约几分钟。') : $t('快速：代码排版整页（示意图统一渲染），约 1 分钟。') }}
        </p>

        <!-- 该资料下的教案 -->
        <div v-for="l in lessonsOf(m.id)" :key="l.id" class="eh-lesson">
          <div class="eh-lesson-head">
            <b class="grow">{{ l.plan?.title || l.materialName }}</b>
            <span v-if="l.status === 'generating'" class="chip warn" data-test="eh-gen-chip">{{ $t('AI 生成中…') }} · {{ runElapsed('lesson', l.id) }}</span>
            <span v-else-if="l.status === 'failed'" class="chip bad" :title="l.error">{{ $t('生成失败') }}</span>
            <template v-else>
              <!-- 教案语言切换（2026-08-23）：已有版本秒切；没有的按同参数后台生成，期间顶层内容不动 -->
              <span class="eh-lang" role="group" :title="$t('切换教案语言：已有版本立即切换，没有的会按同样参数生成该语言版本')">
                <button
                  v-for="opt in LANG_OPTS" :key="opt.value" type="button" class="eh-lang-btn"
                  :class="{ active: (l.lang || 'zh-CN') === opt.value, ready: !!l.variants?.[opt.value]?.plan }"
                  :disabled="l.langStatus === 'switching'"
                  @click="switchLang(l, opt.value)"
                >
                  <i v-if="l.langStatus === 'switching' && l.langTarget === opt.value" class="ri-loader-4-line eh-spin" aria-hidden="true"></i>
                  {{ opt.label }}
                </button>
              </span>
              <span v-if="l.langStatus === 'switching'" class="chip warn">{{ $t('正在生成 {lang} 版…', { lang: langLabel(l.langTarget) }) }}</span>
              <span v-else-if="l.langStatus === 'failed'" class="chip bad" :title="l.langError">{{ $t('语言切换失败') }}</span>
              <span v-if="l.mode" class="chip mut">{{ l.mode === 'fast' ? $t('快速') : $t('精美') }}</span>
              <!-- 「缓存命中 / N 秒生成」是内部指标，对老师没有意义，不在前端展示（用户明确提出） -->
              <span :class="['chip', l.status === 'published' ? 'ok' : 'mut']">
                {{ l.status === 'published' ? $t('已发布') : $t('草稿（未发布）') }}
              </span>
              <span v-if="l.avatarStatus === 'ready'" class="chip ok">{{ $t('数字人讲解已生成') }}</span>
              <button class="btn sm" @click="toggleExpand(l.id)">{{ expanded === l.id ? $t('收起') : $t('审核内容') }}</button>
              <button v-if="l.sections && l.sections.length" class="btn sm"
                :disabled="avatarRunning(l)" @click="genAvatar(l)">
                {{ avatarRunning(l) ? $t('数字人生成中…') : (l.avatarStatus === 'ready' ? $t('重生数字人') : $t('生成数字人讲解')) }}
              </button>
              <span v-if="avatarRunning(l)" class="chip warn" data-test="eh-avatar-chip">{{ runElapsed('avatar', l.id) }}</span>
              <button class="btn sm" :disabled="audioBusy === l.id" @click="genAudio(l)">
                {{ audioBusy === l.id ? $t('音频生成中…') : $t('生成音频总结') }}
              </button>
              <button
                :class="['btn sm', l.status === 'published' ? '' : 'pri']"
                @click="publish(l, l.status !== 'published')">
                {{ l.status === 'published' ? $t('结束授课') : $t('发布到学生端') }}
              </button>
              <button class="eh-del" :title="$t('删除这份教案')" @click="removeLesson(l)"><i class="ri-delete-bin-line"></i></button>
            </template>
          </div>
          <!--
            很久没收到主进程事件 → 「可能已超时」：没有取消通道，只给 继续等待 / 查看日志
            （失败由主进程判定后走下面既有的「重试」，它会另起一份教案）。
          -->
          <StepRunAlert
            v-if="runAlertProps('lesson', l.id)"
            v-bind="runAlertProps('lesson', l.id)!"
            state="suspect"
            hide-retry
            :title="$t('教案生成可能已超时')"
            @keep-waiting="keepWaiting('lesson', l.id)"
          />
          <StepRunAlert
            v-if="runAlertProps('avatar', l.id)"
            v-bind="runAlertProps('avatar', l.id)!"
            state="suspect"
            hide-retry
            :title="$t('数字人讲解可能已超时')"
            @keep-waiting="keepWaiting('avatar', l.id)"
          />
          <p v-if="l.status === 'failed'" class="eh-err">
            {{ l.error }}
            <button class="btn sm" @click="retry(l)">{{ $t('重试') }}</button>
            <button class="btn sm" @click="removeLesson(l)">{{ $t('删除') }}</button>
          </p>

          <!-- 审核展开：图文学习页（学生所见）+ 教案 + 小测 -->
          <div v-if="expanded === l.id && l.plan" class="eh-detail">
            <template v-if="l.lessonHtml">
              <h4>{{ $t('图文学习页（学生所见，含分解章节 / 示意图 / 真实配图）') }}</h4>
              <!-- 服务端安全组装的 HTML（文本 xmlEsc、SVG 服务端渲染、图片 data URI）v-html 注入无 XSS 面 -->
              <div class="eh-doc-wrap" v-html="l.lessonHtml"></div>
            </template>
            <template v-if="l.knowledgeMapSvg">
              <h4>{{ $t('知识导图') }}</h4>
              <!-- 服务端渲染的安全 SVG（所有文本已 xmlEsc），v-html 注入无 XSS 面 -->
              <div class="eh-map" v-html="l.knowledgeMapSvg"></div>
            </template>
            <template v-if="l.illustrations && l.illustrations.length">
              <h4>{{ $t('教学配图（{n} 张）', { n: l.illustrations.length }) }}</h4>
              <p class="k" style="margin:0 0 8px">{{ $t('每张配图 AI 已按内容拟好画面，点「生成配图」用图像模型出图（需在设置里启用图像生成）。') }}</p>
              <div class="eh-ills">
                <div v-for="(il, ii) in l.illustrations" :key="ii" class="eh-ill">
                  <img v-if="il.imageDataUrl" :src="il.imageDataUrl" :alt="il.caption" class="eh-ill-img" />
                  <div v-else class="eh-ill-ph" :title="il.prompt">
                    <span class="eh-ill-icon" aria-hidden="true"><i class="ri-image-add-line"></i></span>
                    <span class="eh-ill-cap-in">{{ il.caption }}</span>
                    <button class="btn sm pri" :disabled="illBusy === l.id + ':' + ii" @click="genIllustration(l, ii)">
                      {{ illBusy === l.id + ':' + ii ? $t('生成中…') : $t('生成配图') }}
                    </button>
                  </div>
                  <div v-if="il.imageDataUrl" class="eh-ill-cap">{{ il.caption }}
                    <span v-if="il.sourcePage" class="chip src num">P.{{ il.sourcePage }}</span>
                  </div>
                </div>
              </div>
            </template>
            <template v-if="l.avatarStatus === 'ready'">
              <h4>{{ $t('数字人讲解（学生端每节课上方播放）') }}</h4>
              <div v-if="avatarMediaLoading === l.id" class="k">{{ $t('载入数字人预览…') }}</div>
              <div v-else-if="(avatarMedia[l.id] || []).length" class="eh-avs">
                <div v-for="a in avatarMedia[l.id]" :key="a.sec" class="eh-av">
                  <div class="eh-av-h"><i class="ri-presentation-line" aria-hidden="true"></i> {{ a.title }}</div>
                  <video class="eh-av-vid" controls preload="metadata" playsinline :src="a.url"></video>
                </div>
              </div>
              <div v-else class="k">{{ $t('未取到数字人成片（可能已过期或未就绪），可点上方「重生数字人」。') }}</div>
            </template>
            <div class="eh-cols">
              <div>
                <h4>{{ $t('教学目标') }}</h4>
                <ul><li v-for="(o, i) in l.plan.objectives" :key="i">{{ o }}</li></ul>
                <h4>{{ $t('重点') }}</h4>
                <ul><li v-for="(o, i) in l.plan.keyPoints" :key="i">{{ o }}</li></ul>
                <h4>{{ $t('难点') }}</h4>
                <ul><li v-for="(o, i) in l.plan.difficulties" :key="i">{{ o }}</li></ul>
                <h4>{{ $t('板书要点') }}</h4>
                <ul><li v-for="(o, i) in l.plan.boardNotes" :key="i">{{ o }}</li></ul>
                <h4>{{ $t('作业') }}</h4>
                <p class="eh-body">{{ l.plan.homework }}</p>
              </div>
              <div>
                <h4>{{ $t('课堂环节（共 {min} 分钟）', { min: l.plan.durationMinutes }) }}</h4>
                <table class="eh-table">
                  <tbody>
                    <tr v-for="(sch, i) in l.plan.schedule" :key="i">
                      <td class="num" style="white-space:nowrap">{{ sch.minutes }}′</td>
                      <td><b>{{ sch.phase }}</b><br /><span class="k">{{ sch.activity }}</span></td>
                    </tr>
                  </tbody>
                </table>
                <h4>{{ $t('学生要点（{n} 节，带来源页码）', { n: l.studentDigest.length }) }}</h4>
                <div v-for="(s, i) in l.studentDigest" :key="i" class="eh-digest">
                  <b>{{ s.sectionTitle }}</b>
                  <span v-if="s.sourcePages.length" class="chip src num">P.{{ s.sourcePages.join(',') }}</span>
                  <ul><li v-for="(b, j) in s.bullets" :key="j">{{ b }}</li></ul>
                </div>
              </div>
            </div>
            <h4>{{ $t('课堂小测（{n} 题，学生端不下发答案）', { n: l.quiz.length }) }}</h4>
            <div v-for="(q, i) in l.quiz" :key="i" class="eh-quiz">
              <b>{{ i + 1 }}. {{ q.q }}</b>
              <div class="eh-opts">
                <span v-for="(o, j) in q.options" :key="j" :class="['eh-opt', j === q.answer && 'right']">{{ o }}</span>
              </div>
              <span class="k">{{ $t('解析：') }}{{ q.explain }}
                <span v-if="q.sourcePage" class="chip src num">P.{{ q.sourcePage }}</span></span>
            </div>
          </div>
        </div>
      </div>
      <div v-if="!materials.length" class="eh-card eh-hint">{{ $t('还没有资料。点上方「导入资料」，从教材或讲义开始。') }}</div>
    </section>

    <!-- ③ 学情看板：每个学生 × 每节课 三态（未开始 / 已阅读 / 成绩） -->
    <section v-show="direction === 'lesson' && step === 3" class="eh-pane">
      <div class="eh-row">
        <span class="k">{{ $t('每个学生对每节已发布课程的进展：未开始 → 在学（打开了但小测没交）→ 已学完（交了小测）。10 秒自动刷新。') }}</span>
        <button class="btn sm" @click="loadProgress">{{ $t('刷新') }}</button>
      </div>
      <!-- 班级汇总条 -->
      <div class="ehs-summary">
        <div class="ehs-sum"><span class="v">{{ classSummary.n }}</span><span class="l">{{ $t('学生') }}</span></div>
        <div class="ehs-sum"><span class="v ehs-online">{{ classSummary.online }}</span><span class="l">{{ $t('在线') }}</span></div>
        <div class="ehs-sum"><span class="v">{{ classSummary.avgDone }}%</span><span class="l">{{ $t('平均进度') }}</span></div>
        <div class="ehs-sum"><span class="v" :class="scoreClass(classSummary.avgScore)">{{ classSummary.avgScore == null ? '—' : classSummary.avgScore + '%' }}</span><span class="l">{{ $t('平均得分') }}</span></div>
        <div class="ehs-sum grow"><span class="v">{{ publishedLessons.length }}</span><span class="l">{{ $t('已发布课程') }}</span></div>
      </div>

      <!-- 学生列表：一人一行，点开看详情 -->
      <div v-if="studentStats.length" class="ehs-list">
        <div v-for="s in studentStats" :key="s.studentId" class="ehs-row" role="button" tabindex="0"
          @click="openStudent(s.studentId)" @keydown.enter="openStudent(s.studentId)">
          <div class="ehs-ava sm" :style="{ '--hue': avatarHue(s.name) }">{{ initial(s.name) }}</div>
          <div class="ehs-rid">
            <b class="ehs-name" :title="s.name">{{ s.name }}</b>
            <span class="ehs-seen">
              <span v-if="s.studentNo" class="ehs-no">{{ $t('学号') }} {{ s.studentNo }}</span>{{ relTime(s.lastSeenAt) }}
            </span>
          </div>
          <div class="ehs-rbar">
            <div class="ehs-rbar-track"><span :style="{ width: s.donePct + '%' }"></span></div>
            <div class="ehs-rsegs" :aria-label="$t('每节课进度')">
              <span v-for="l in s.perLesson" :key="l.id" class="ehs-seg2" :class="l.status" :title="segTitle(l)"></span>
            </div>
          </div>
          <div class="ehs-rstats">
            <span class="ehs-rstat" :title="$t('交了小测才算学完')"><b>{{ s.doneCount }}<i>/{{ s.total }}</i></b><em>{{ $t('已学完') }}</em></span>
            <span class="ehs-rstat" :title="$t('点开过但小测还没交')"><b :class="s.readingCount ? 'mid' : ''">{{ s.readingCount }}</b><em>{{ $t('在学') }}</em></span>
            <span class="ehs-rstat"><b :class="scoreClass(s.avgPct)">{{ s.avgPct == null ? '—' : s.avgPct + '%' }}</b><em>{{ $t('均分') }}</em></span>
          </div>
          <div class="ehs-rpct"><b>{{ s.donePct }}%</b>
            <button class="eh-del" :title="$t('删除这个学生账号及其全部学习记录')" @click.stop="removeStudent(s)"><i class="ri-delete-bin-line"></i></button>
            <span class="ehs-chev" aria-hidden="true">›</span>
          </div>
        </div>
      </div>
      <div v-else class="eh-card k">{{ $t('还没有学生登录。让学生扫码或输入班级码进入。') }}</div>

      <!-- 学生详情抽屉 -->
      <transition name="ehs-fade">
        <div v-if="activeStudent" class="ehs-modal" role="dialog" aria-modal="true" data-native-browser-hide="true" @click.self="closeStudent">
          <div class="ehs-sheet">
            <button class="ehs-x" :aria-label="$t('关闭')" @click="closeStudent"><i class="ri-close-line" aria-hidden="true"></i></button>
            <div class="ehs-sheet-head">
              <div class="ehs-ava lg" :style="{ '--hue': avatarHue(activeStudent.name) }">{{ initial(activeStudent.name) }}</div>
              <div class="ehs-sheet-id">
                <b class="ehs-sheet-name">{{ activeStudent.name }}</b>
                <div v-if="activeStudent.studentNo" class="ehs-sheet-no k">{{ $t('学号') }} {{ activeStudent.studentNo }}</div>
                <div class="ehs-sheet-seen k">{{ $t('最近活跃 {t}', { t: relTime(activeStudent.lastSeenAt) }) }}</div>
              </div>
            </div>
            <div class="ehs-kpis">
              <div class="ehs-kpi"><span class="v">{{ activeStudent.donePct }}%</span><span class="l">{{ $t('学习进度') }}</span></div>
              <div class="ehs-kpi"><span class="v">{{ activeStudent.doneCount }}/{{ activeStudent.total }}</span><span class="l">{{ $t('已学完（交了小测）') }}</span></div>
              <div class="ehs-kpi"><span class="v">{{ activeStudent.readingCount }}</span><span class="l">{{ $t('在学（未交小测）') }}</span></div>
              <div class="ehs-kpi"><span class="v" :class="scoreClass(activeStudent.avgPct)">{{ activeStudent.avgPct == null ? '—' : activeStudent.avgPct + '%' }}</span><span class="l">{{ $t('平均得分') }}</span></div>
            </div>
            <div class="ehs-sec">
              <h5>{{ $t('每节课进展') }}</h5>
              <ul class="ehs-lessons">
                <li v-for="l in activeStudent.perLesson" :key="l.id" class="ehs-lrow">
                  <span class="ehs-ldot" :class="l.status"></span>
                  <span class="ehs-ltitle" :title="l.title">{{ l.title }}</span>
                  <span class="ehs-lstat" :class="l.status">
                    <template v-if="l.status === 'quiz'">
                      <b :class="scoreClass(l.pct ?? null)">{{ l.score }}/{{ l.total }}</b>
                      <i v-if="l.pct != null"> · {{ l.pct }}%</i>
                    </template>
                    <template v-else-if="l.status === 'read'">{{ $t('已阅读') }}</template>
                    <template v-else>{{ $t('未开始') }}</template>
                  </span>
                </li>
                <li v-if="!activeStudent.perLesson.length" class="k">{{ $t('还没有已发布的课程。') }}</li>
              </ul>
            </div>
            <div class="ehs-sec">
              <h5>{{ $t('历史学习记录') }}</h5>
              <div v-if="historyLoading" class="k">{{ $t('加载中…') }}</div>
              <ul v-else-if="studentHistory.length" class="ehs-timeline">
                <li v-for="(ev, i) in studentHistory" :key="i" class="ehs-tl-row" :class="ev.kind">
                  <span class="ehs-tl-kind" :class="ev.kind">{{ HIST_LABEL[ev.kind] }}</span>
                  <span class="ehs-tl-body">
                    <span class="ehs-tl-title" :title="ev.title">{{ ev.title }}</span>
                    <b v-if="ev.kind === 'test' || ev.kind === 'practice'" :class="scoreClass(evPct(ev))">{{ ev.score }}/{{ ev.total }}</b>
                    <i v-else-if="ev.text" class="ehs-tl-text" :title="ev.text">{{ ev.text }}</i>
                  </span>
                  <span class="ehs-tl-at k">{{ relTime(ev.at) }}</span>
                </li>
              </ul>
              <div v-else class="k">{{ $t('暂无学习记录') }}</div>
            </div>
            <div v-if="activeStudent.questions.length" class="ehs-sec">
              <h5>{{ $t('本人提问（{n}）', { n: activeStudent.questions.length }) }}</h5>
              <div v-for="qa in activeStudent.questions" :key="qa.id" class="ehs-q">
                <div class="ehs-q-q">{{ $t('Q：{p0}', { p0: qa.q }) }}<span v-if="!qa.grounded" class="chip mut">{{ $t('超范围') }}</span></div>
                <div class="ehs-q-a k">{{ $t('A：{p0}', { p0: qa.a }) }}</div>
              </div>
            </div>
          </div>
        </div>
      </transition>
      <!-- 学生受限提问记录（AI 答案锚定本课） -->
      <div class="eh-row" style="margin-top:18px">
        <b class="grow">{{ $t('学生提问（AI 只答本课内容）') }}</b>
        <button class="btn sm" @click="loadQuestions">{{ $t('刷新') }}</button>
      </div>
      <div class="eh-card eh-scroll">
        <div v-for="qa in questions" :key="qa.id" class="eh-qa">
          <div class="eh-qa-h"><b>{{ qa.studentName || '—' }}</b><span class="k">{{ relTime(qa.at) }}</span>
            <span v-if="!qa.grounded" class="chip mut">{{ $t('超范围') }}</span>
            <span class="grow"></span>
            <button class="eh-del" :title="$t('删除这条提问')" @click="removeQuestion(qa)"><i class="ri-delete-bin-line"></i></button></div>
          <div class="eh-qa-q">{{ $t('Q：{p0}', { p0: qa.q }) }}</div>
          <div class="k eh-qa-a">{{ $t('A：{p0}', { p0: qa.a }) }}</div>
        </div>
        <div v-if="!questions.length" class="k">{{ $t('还没有学生提问。') }}</div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, onUnmounted, watch } from 'vue';
import QRCode from 'qrcode';
import PageBackButton from '../components/PageBackButton.vue';
import StepRunAlert from '../components/StepRunAlert.vue';
import { evaluateWatchdog, formatStepDuration, useStepWatchdog, type StepKind, type WatchdogSnapshot } from '../composables/useStepWatchdog';
import type {
  EduHubStatus, EduHubMaterial, EduHubLesson, EduHubEvent, EduHubProgressRow, EduHubStudentEvent,
  EduHubClassCodeRecord,
} from '@totalclaw/ipc-contracts';
import { t as i18nT } from '../i18n';
import {
  aggregateStudentProgress, summarizeClass,
  type EduHubStudentAgg, type EduHubLessonProgress,
} from '../utils/eduHubProgress';
import { humanizeErrorMessage } from '../utils/humanize';
import { useDialog } from '../composables/useDialog';
import QuranPlatform from '../workbenches/quran-teaching/QuranPlatform.vue';
import { isSolutionEnabled } from '../workbenches/solutionAccess';
import { useRoute, useRouter } from 'vue-router';

// preload 缺席（组件测试 / 非 Electron）时不炸 setup —— 与同族 5 个工作台一致的可选链取用
const api = (window as any)?.electronAPI?.workbenches?.eduHub;
const dialog = useDialog();

/**
 * 制作方向。古兰经教学平台原本是独立解决方案，现在并进来成为一个方向：两边共用同一套
 * 校内服务（学生扫同一个码），只是教师侧的内容生产链不同。
 *
 * 它仍是按账号售卖的方案包 —— 标签露不露看 isSolutionEnabled，没开通的账号看不到，
 * 与合并前的授权口径一致（注册表里那条改成 hidden，只是不在列表里单列）。
 */
type Direction = 'lesson' | 'quran';
const route = useRoute();
const router = useRouter();
const direction = ref<Direction>(route.query.direction === 'quran' ? 'quran' : 'lesson');
const quranEnabled = ref(false);
const DIRECTIONS = computed(() => ([
  { key: 'lesson' as const, label: i18nT('文档生成教案'), icon: 'ri-file-text-line' },
  { key: 'quran' as const, label: i18nT('古兰经教学平台'), icon: 'ri-book-open-line' },
]));
function switchDirection(d: Direction): void {
  if (direction.value === d) return;
  direction.value = d;
  // 方向写进地址：刷新 / 分享链接 / 语音「打开古兰经教学」都能直接落到对的方向
  void router.replace({ path: route.path, query: d === 'quran' ? { ...route.query, direction: 'quran' } : omitDirection(route.query) });
}
function omitDirection(q: Record<string, any>): Record<string, any> {
  const { direction: _drop, ...rest } = q || {};
  return rest;
}

const step = ref(1);
const busy = ref(false);
const copied = ref(false);
const svcError = ref('');
/**
 * 中性提示（进行中 / 已完成），**不能塞进 svcError**。
 * 之前两者共用一个红色 role="alert" 横幅，于是「正在生成中文版教案…」这种纯告知
 * 也被渲染成刺眼的红色报错，用户截图反馈「搞得那都是红色」。
 */
const svcNotice = ref('');
let noticeTimer: ReturnType<typeof setTimeout> | undefined;
/** 中性提示定时淡出；错误不自动消失（错误要留给用户看清并处理）。 */
function notify(text: string, autoHideMs = 8000): void {
  svcNotice.value = text;
  if (noticeTimer) clearTimeout(noticeTimer);
  if (autoHideMs > 0) noticeTimer = setTimeout(() => { svcNotice.value = ''; }, autoHideMs);
}
/**
 * 每次用户主动操作前把横幅清掉。
 *
 * 不清的后果用户已经截图反馈过：早先某次失败的红条会一直挂在顶部，之后教案明明
 * 生成成功了它还在，看上去就是「生成成功也要报错」。横幅是全页共用的单例，
 * 不在动作入口清，它就会跨操作残留。
 */
function beginAction(): void {
  svcError.value = '';
  svcNotice.value = '';
  if (noticeTimer) clearTimeout(noticeTimer);
}
const expanded = ref('');
// 每份资料**各自**的生成选项（学段/时长/语言/方式）——互不联动。
// 原来是 genGrade/genMinutes/genLang/genMode 四个全局单例 ref，改一份资料的选项会串到所有资料。
type EhGenOpts = { grade: string; minutes: number; lang: 'zh-CN' | 'en-US' | 'ar'; mode: 'fast' | 'rich' };
const genOptsMap = reactive<Record<string, EhGenOpts>>({});
/**
 * 三个下拉的初值来自**这份文档的判定结果**（main 侧 analyzeMaterial，解析完就算好了）。
 * 以前是写死的「初中 / 45 分钟 / 中文」—— 导进来一份英文大学 syllabus 也照样显示初中中文，
 * 看着像分析过其实没有。判不出学段时留空串，下拉显示「请选择学段」且不让生成，
 * 逼一次真实选择，好过替老师瞎猜。
 */
function genOptsFor(id: string): EhGenOpts {
  let o = genOptsMap[id];
  if (!o) {
    const sug = materials.value.find((m) => m.id === id)?.suggest;
    o = {
      grade: sug?.gradeKey ?? '',
      minutes: sug?.durationMinutes ?? 45,
      lang: sug?.lang ?? 'zh-CN',
      mode: 'rich',
    };
    genOptsMap[id] = o;
  }
  return o;
}
const illBusy = ref('');
const avatarBusy = ref('');
// 教师侧数字人预览：展开审核时按需拉本课已生成的成片（data URL，按节），让教案里能直接看到数字人。
const avatarMedia = reactive<Record<string, Array<{ sec: number; title: string; url: string }>>>({});
const avatarMediaLoading = ref('');
async function loadAvatarMedia(l: EduHubLesson, force = false): Promise<void> {
  if (!force && avatarMedia[l.id]) return;
  avatarMediaLoading.value = l.id;
  try {
    const r = await api.avatarMedia({ id: l.id });
    avatarMedia[l.id] = (r?.items || []) as Array<{ sec: number; title: string; url: string }>;
  } catch { avatarMedia[l.id] = []; }
  finally { avatarMediaLoading.value = ''; }
}
const audioBusy = ref('');
// 与 main 侧 eduHubStore.eduHubGradeOptions() 必须逐字一致：判定结果要能落进这个下拉，
// 对不上就会显示空白选项。改一处必须同步改另一处。
/**
 * 学段选项：值用稳定键，显示按当前语言翻。
 *
 * 之前这里是模块加载时就 i18nT 好的中文数组，而资料判定给的学段标签由**主进程**翻译，
 * 两边语言不一致时下拉框对不上任何一项 —— 英文界面里既看到中文「中职/高职」，
 * 又会被「先选学段」挡住不让生成。computed 保证切语言时重算。
 */
const GRADE_KEYS = ['primary', 'primary_upper', 'junior', 'senior', 'vocational', 'university'] as const;
function gradeLabelOf(key: string): string {
  switch (key) {
    case 'primary': return i18nT('小学');
    case 'primary_upper': return i18nT('小学高年级');
    case 'junior': return i18nT('初中');
    case 'senior': return i18nT('高中');
    case 'vocational': return i18nT('中职/高职');
    case 'university': return i18nT('大学/本科');
    default: return key;
  }
}
const gradeOptions = computed(() => GRADE_KEYS.map((k) => ({ key: k as string, label: gradeLabelOf(k) })));
/** 判定结果那句话在**界面**拼，不用主进程存盘的 reason（它的语言在解析时就冻住了）。 */
function suggestText(m: EduHubMaterial): string {
  const sg = m.suggest;
  if (!sg) return '';
  const lang = sg.lang === 'zh-CN' ? i18nT('中文') : sg.lang === 'ar' ? i18nT('阿拉伯文') : i18nT('英文');
  return sg.gradeKey
    ? i18nT('按文档判定：{lang} · {grade} · 约 {min} 分钟（可改）', { lang, grade: gradeLabelOf(sg.gradeKey), min: String(sg.durationMinutes) })
    : i18nT('按文档判定：{lang} · 约 {min} 分钟；学段没判出来，请你选一个', { lang, min: String(sg.durationMinutes) });
}

const status = ref<EduHubStatus>({ running: false, url: null, port: null, classCode: '—', onlineStudents: 0, totalStudents: 0 });
const materials = ref<EduHubMaterial[]>([]);
/** 判定结果到达得比首次渲染晚（解析是异步的）：老师没动过的那份就用判定值补上 */
watch(materials, (list) => {
  for (const m of list) {
    const o = genOptsMap[m.id];
    if (!o || !m.suggest) continue;
    if (!o.grade && m.suggest.gradeKey) o.grade = m.suggest.gradeKey;
  }
}, { deep: true });
const lessons = ref<EduHubLesson[]>([]);
const progress = ref<EduHubProgressRow[]>([]);
const questions = ref<Array<{ id: string; studentName: string; q: string; a: string; grounded: boolean; at: number }>>([]);
const qrDataUrl = ref('');
const generatingIds = computed(() => new Set(lessons.value.filter((l) => l.status === 'generating').map((l) => l.materialId)));
const publishedLessons = computed(() => lessons.value.filter((l) => l.status === 'published'));

// ── 教案 / 数字人生成看门狗（2026-10-13：「等 10 分钟都没变化，不知道是生成不出来还是正在生成」）──
// 教案没有 createdAt，起点 = 本实例首次看到它在生成的时刻；心跳 = 主进程推来的该教案事件
// （llm / images / avatar 各阶段）。没有取消通道：可能已超时只给 继续等待 / 查看日志，
// 失败走既有的「重试」（它会另起一份教案）。应用重启后主进程已把残留的 generating 改成 failed。
type RunType = 'lesson' | 'avatar';
const RUN_SPEC: Record<RunType, { kind: StepKind; estimateMs: number; stallMs?: number }> = {
  // 主进程里单次模型调用上限 5 分钟、格式修正可能再来一轮，且中途只在每轮开头推事件：
  // 默认 4 分钟无进度上限会把正常的「精美」生成误判成卡住，按 预计 + 5 分钟 = 9 分钟放宽
  lesson: { kind: 'llm', estimateMs: 240_000, stallMs: 9 * 60_000 },
  // 按节离线成片，每节完成推一次事件；单节云端渲染按视频上限（10 分钟）
  avatar: { kind: 'video', estimateMs: 300_000 },
};
const runKey = (type: RunType, id: string) => `${type}:${id}`;
/** 本实例首次看到「在生成」的时刻 */
const runSeenAt = reactive<Record<string, number>>({});
/** 最近一次收到该教案事件的时刻 */
const runEventAt = reactive<Record<string, number>>({});
/** 用户点「继续等待」的时刻 */
const runWaitAt = reactive<Record<string, number>>({});
function avatarRunning(l: EduHubLesson): boolean { return l.avatarStatus === 'generating' || avatarBusy.value === l.id; }
const activeRunKeys = computed(() => {
  const keys: string[] = [];
  for (const l of lessons.value) {
    if (l.status === 'generating') keys.push(runKey('lesson', l.id));
    if (avatarRunning(l)) keys.push(runKey('avatar', l.id));
  }
  return keys;
});
const runWatchdog = useStepWatchdog({ running: () => activeRunKeys.value.length > 0, kind: 'llm' });
watch(activeRunKeys, (next, prev) => {
  for (const k of next) if (!runSeenAt[k]) runSeenAt[k] = Math.min(Date.now(), runEventAt[k] || Infinity);
  for (const k of prev || []) if (!next.includes(k)) { delete runSeenAt[k]; delete runEventAt[k]; delete runWaitAt[k]; }
}, { immediate: true });
function runSnapshot(type: RunType, id: string): WatchdogSnapshot | null {
  const key = runKey(type, id);
  const startedAt = runSeenAt[key];
  if (!startedAt) return null;
  const spec = RUN_SPEC[type];
  return evaluateWatchdog({
    startedAt, estimateMs: spec.estimateMs, kind: spec.kind, stallMs: spec.stallMs,
    lastHeartbeatAt: runEventAt[key] ?? null, waitExtendedAt: runWaitAt[key] ?? null,
  }, runWatchdog.now.value);
}
function runElapsed(type: RunType, id: string): string {
  const s = runSnapshot(type, id);
  return s ? i18nT('已用 {p0}', { p0: formatStepDuration(s.elapsedMs / 1000) }) : '';
}
/** 到了怀疑线才给卡片用的 props；没到返回 null（模板 v-if 用） */
function runAlertProps(type: RunType, id: string): { elapsedSec: number; estimateSec: number; sinceHeartbeatSec: number | null } | null {
  const s = runSnapshot(type, id);
  if (!s || s.verdict !== 'suspect') return null;
  return {
    elapsedSec: Math.floor(s.elapsedMs / 1000),
    estimateSec: RUN_SPEC[type].estimateMs / 1000,
    sinceHeartbeatSec: s.sinceHeartbeatMs == null ? null : Math.floor(s.sinceHeartbeatMs / 1000),
  };
}
function keepWaiting(type: RunType, id: string): void {
  runWaitAt[runKey(type, id)] = Date.now();
}

// ── 学情看板：以「学生」为维度聚合，每人一张卡、可点开详情 ────────────────────────
type EhStudentStat = EduHubStudentAgg & {
  questions: Array<{ id: string; q: string; a: string; grounded: boolean; at: number }>;
};
/**
 * 学情聚合走 utils/eduHubProgress 的纯函数（那里有完整用例）。视图这层只负责
 * 把课程标题接上、把该生的提问挂上，不再自己算一遍口径 ——
 * 「已学完 = 交了小测」「进度条与格子同源」这两条规矩必须只有一处实现。
 */
const studentStats = computed<EhStudentStat[]>(() => {
  const refs = publishedLessons.value.map((l) => ({
    id: l.id,
    title: l.plan?.title || l.materialName || i18nT('未命名课程'),
  }));
  return progress.value.map((row) => {
    const agg = aggregateStudentProgress(row as any, refs);
    const qs = questions.value.filter((q) => q.studentName && q.studentName === row.name)
      .map((q) => ({ id: q.id, q: q.q, a: q.a, grounded: q.grounded, at: q.at }));
    return { ...agg, questions: qs };
  });
});
// 班级汇总（看板顶栏）
const classSummary = computed(() => ({
  ...summarizeClass(studentStats.value),
  online: status.value.onlineStudents || 0,
}));
const activeStudentId = ref<string | null>(null);
const activeStudent = computed(() => studentStats.value.find((s) => s.studentId === activeStudentId.value) || null);
// 点开账号 → 拉该生历史学习记录时间线（阅读/测试/练习/笔记/提问）
const studentHistory = ref<EduHubStudentEvent[]>([]);
const historyLoading = ref(false);
async function openStudent(id: string): Promise<void> {
  activeStudentId.value = id;
  studentHistory.value = [];
  historyLoading.value = true;
  try { studentHistory.value = await api.studentHistory({ studentId: id }); }
  catch { /* 历史加载失败静默：抽屉里进度/提问等其它信息仍在 */ }
  finally { historyLoading.value = false; }
}
function closeStudent(): void { activeStudentId.value = null; studentHistory.value = []; }
const HIST_LABEL: Record<EduHubStudentEvent['kind'], string> = {
  open: i18nT('阅读'), test: i18nT('测试'), practice: i18nT('练习'), note: i18nT('笔记'), ask: i18nT('提问'),
};
function evPct(ev: EduHubStudentEvent): number | null {
  return ev.total && ev.total > 0 ? Math.round((ev.score || 0) / ev.total * 100) : null;
}
function initial(name: string): string { const n = (name || '').trim(); return n ? Array.from(n)[0].toUpperCase() : '?'; }
function avatarHue(name: string): number { let h = 0; for (const c of (name || '?')) h = (h * 31 + c.charCodeAt(0)) % 360; return h; }
function scoreClass(pct: number | null): string { if (pct == null) return ''; return pct >= 80 ? 'good' : pct >= 60 ? 'mid' : 'low'; }
function segTitle(l: EduHubLessonProgress): string {
  const st = l.status === 'quiz' ? i18nT('已学完 · 小测 {s}/{t}', { s: l.score ?? 0, t: l.total ?? 0 }) : l.status === 'read' ? i18nT('在学 · 小测未交') : i18nT('未开始');
  return `${l.title} · ${st}`;
}

const steps = [
  { id: 1, n: '1', label: i18nT('服务与班级'), done: () => status.value.running, sub: () => (status.value.running ? i18nT('{n} 人在线', { n: status.value.onlineStudents }) : i18nT('待启动')) },
  { id: 2, n: '2', label: i18nT('资料与教案'), done: () => publishedLessons.value.length > 0, sub: () => i18nT('{m} 份资料 · {l} 份教案', { m: materials.value.length, l: lessons.value.length }) },
  { id: 3, n: '3', label: i18nT('学情看板'), done: () => false, sub: () => i18nT('{n} 名学生', { n: status.value.totalStudents }) },
];

let offEvent: (() => void) | null = null;
let pollTimer: ReturnType<typeof setInterval> | null = null;
/** 页面卸载后置 true：onMounted 的 await 之后不再订阅事件 / 建轮询 */
let eduDisposed = false;

onMounted(async () => {
  // 授权查询与桥接无关：桥接没起来也要知道古兰经方向该不该露（否则合并后方向标签永远不出现）
  try { quranEnabled.value = await isSolutionEnabled('workbench-quran-teaching'); } catch { quranEnabled.value = false; }
  // 古兰经方向的接口由 workbench-quran-teaching 方案注册：开通了还要确保装上（没装按需安装；用户卸载过就不露这个方向）
  if (quranEnabled.value) {
    try {
      const prep = await (window as any).electronAPI?.solutionPkg?.prepare?.({ id: 'workbench-quran-teaching' });
      if (prep && prep.ok === false) quranEnabled.value = false;
    } catch { /* 安装服务不可用：按开通状态显示，与旧版一致 */ }
  }
  if (eduDisposed) return;
  // 地址里带 direction=quran 但账号没开通：退回文档方向，不把一个点不开的空白页留给用户
  if (direction.value === 'quran' && !quranEnabled.value) direction.value = 'lesson';
  if (!api) { svcError.value = i18nT('工作台桥接未就绪'); return; }
  await refreshAll();
  if (eduDisposed) return;
  // D1：打开解决方案即启动服务（失败只提示，不挡工作台其它步骤）
  if (!status.value.running) await startSvc();
  if (eduDisposed) return;
  offEvent = api.onEvent((ev: EduHubEvent) => {
    if (ev.kind === 'material' && ev.phase === 'deleted') {
      // 和教案那条同一个坑：不先判删除，下面的 upsert 会把刚删掉的资料原样加回来
      materials.value = materials.value.filter((m) => m.id !== ev.id);
      lessons.value = lessons.value.filter((l) => l.materialId !== ev.id);
      return;
    }
    if (ev.kind === 'material' && ev.material) {
      const i = materials.value.findIndex((m) => m.id === ev.id);
      if (i >= 0) materials.value[i] = ev.material; else materials.value.unshift(ev.material);
    }
    if (ev.kind === 'lesson') {
      // 任何该教案的事件都是「还活着」的证据（看门狗心跳）
      const at = Date.now();
      runEventAt[runKey('lesson', ev.id)] = at;
      runEventAt[runKey('avatar', ev.id)] = at;
    }
    if (ev.kind === 'lesson' && ev.phase === 'deleted') {
      // 删除事件必须先判：走下面那条 upsert 会把刚删掉的教案原样加回来
      lessons.value = lessons.value.filter((l) => l.id !== ev.id);
      return;
    }
    if (ev.kind === 'lesson' && ev.lesson) {
      const i = lessons.value.findIndex((l) => l.id === ev.id);
      if (i >= 0) lessons.value[i] = ev.lesson; else lessons.value.unshift(ev.lesson);
    }
  });
  // 学情/在线数轻轮询：只在本页可见时（10s，纯内存接口开销可忽略）
  pollTimer = setInterval(() => { void refreshStatus(); if (step.value === 3) void loadProgress(); }, 10_000);
});

onUnmounted(() => {
  eduDisposed = true;
  offEvent?.(); offEvent = null;
  if (pollTimer) { clearInterval(pollTimer); pollTimer = null; }
});

// 切到学情看板立即拉一次（不等 10s 轮询），避免看到滞后的空表
watch(step, (s) => { if (s === 3) { void loadProgress(); void loadQuestions(); void refreshStatus(); } });

async function refreshAll(): Promise<void> {
  svcError.value = '';
  await Promise.all([refreshStatus(), loadMaterials(), loadLessons(), loadProgress()]);
}
async function refreshStatus(): Promise<void> {
  try {
    status.value = await api.status();
    qrDataUrl.value = status.value.url ? await QRCode.toDataURL(status.value.url, { margin: 1, width: 176 }) : '';
  } catch (e) { svcError.value = humanizeErrorMessage(e, i18nT('读取校内服务状态失败')); }
}
async function loadMaterials(): Promise<void> { try { materials.value = await api.materials(); } catch (e) { svcError.value = humanizeErrorMessage(e, i18nT('读取教材失败')); } }
async function loadLessons(): Promise<void> { try { lessons.value = await api.lessons(); } catch (e) { svcError.value = humanizeErrorMessage(e, i18nT('读取课程失败')); } }
async function loadProgress(): Promise<void> { try { progress.value = await api.progress(); } catch (e) { svcError.value = humanizeErrorMessage(e, i18nT('读取学习进展失败')); } }
async function loadQuestions(): Promise<void> { try { questions.value = await api.questions(); } catch (e) { svcError.value = humanizeErrorMessage(e, i18nT('读取学生提问失败')); } }

async function startSvc(): Promise<void> {
  busy.value = true; svcError.value = '';
  try { status.value = await api.start(); await refreshStatus(); }
  catch (e: any) { svcError.value = humanizeErrorMessage(e, i18nT('校内服务启动失败')); }
  finally { busy.value = false; }
}
async function stopSvc(): Promise<void> {
  busy.value = true; svcError.value = '';
  try { status.value = await api.stop(); qrDataUrl.value = ''; }
  catch (e: any) { svcError.value = humanizeErrorMessage(e, i18nT('停止服务失败')); }
  finally { busy.value = false; }
}
async function rotateCode(): Promise<void> {
  try {
    status.value = await api.rotateCode();
    if (codeHistoryOpen.value) await loadCodeHistory();
  }
  catch (e: any) { svcError.value = humanizeErrorMessage(e, i18nT('班级码轮换失败')); }
}
// ── 班级码历史（换码后老师还能查到/恢复之前那枚）────────────────────────
const codeHistoryOpen = ref(false);
const codeHistory = ref<EduHubClassCodeRecord[]>([]);
async function loadCodeHistory(): Promise<void> {
  try { codeHistory.value = await api.codeHistory(); }
  catch (e) { svcError.value = humanizeErrorMessage(e, i18nT('读取班级码历史失败')); }
}
async function toggleCodeHistory(): Promise<void> {
  codeHistoryOpen.value = !codeHistoryOpen.value;
  if (codeHistoryOpen.value) await loadCodeHistory();
}
async function restoreCode(code: string): Promise<void> {
  if (!(await dialog.confirm({
    message: i18nT('把班级码换回 {code}？当前那枚会立即失效，正在用它登录的学生需要重新输入。', { code }),
  }))) return;
  try {
    status.value = await api.restoreCode({ code });
    await loadCodeHistory();
    await refreshStatus(); // 二维码里带的是地址不是码，但状态栏那枚班级码要立刻刷新
  } catch (e: any) { svcError.value = humanizeErrorMessage(e, i18nT('恢复班级码失败')); }
}

// ── 删除（教师侧清理）：四处都二次确认，且把「会连带删掉什么」说清楚 ──────────
async function removeLesson(l: EduHubLesson): Promise<void> {
  const title = l.plan?.title || l.materialName;
  if (!(await dialog.confirm({
    message: i18nT('删除教案《{title}》？学生对它的学习进度、小测成绩、笔记和提问会一并删除，不可恢复。', { title }),
    danger: true,
  }))) return;
  try {
    await api.deleteLesson({ id: l.id });
    lessons.value = lessons.value.filter((x) => x.id !== l.id);
    await Promise.all([loadMaterials(), loadProgress()]);
  } catch (e: any) { svcError.value = humanizeErrorMessage(e, i18nT('删除教案失败')); }
}

async function removeMaterial(m: EduHubMaterial): Promise<void> {
  const n = lessons.value.filter((l) => l.materialId === m.id).length;
  if (!(await dialog.confirm({
    message: n
      ? i18nT('删除资料《{name}》？它名下的 {n} 份教案、学生对这些教案的学习进度、小测成绩、笔记和提问，以及导入的原文件都会一并删除，不可恢复。', { name: m.name, n: String(n) })
      : i18nT('删除资料《{name}》？导入的原文件和解析结果会一并删除，不可恢复。', { name: m.name }),
    danger: true,
  }))) return;
  try {
    await api.deleteMaterial({ id: m.id });
    materials.value = materials.value.filter((x) => x.id !== m.id);
    lessons.value = lessons.value.filter((l) => l.materialId !== m.id);
    await loadProgress();
  } catch (e: any) { svcError.value = humanizeErrorMessage(e, i18nT('删除资料失败')); }
}

async function removeStudent(stat: { studentId: string; name: string }): Promise<void> {
  if (!(await dialog.confirm({
    message: i18nT('删除学生「{name}」？他的学习进度、小测成绩、练习、笔记和提问会一并删除，不可恢复。', { name: stat.name }),
    danger: true,
  }))) return;
  try {
    await api.deleteStudent({ studentId: stat.studentId });
    if (activeStudentId.value === stat.studentId) closeStudent();
    await Promise.all([loadProgress(), loadQuestions(), refreshStatus()]);
  } catch (e: any) { svcError.value = humanizeErrorMessage(e, i18nT('删除学生失败')); }
}

async function removeQuestion(qa: { id: string }): Promise<void> {
  try {
    await api.deleteQuestion({ id: qa.id });
    questions.value = questions.value.filter((x) => x.id !== qa.id);
  } catch (e: any) { svcError.value = humanizeErrorMessage(e, i18nT('删除提问失败')); }
}

function copyUrl(): void {
  if (!status.value.url) return;
  void navigator.clipboard.writeText(status.value.url);
  copied.value = true;
  setTimeout(() => { copied.value = false; }, 1500);
}

async function importFiles(): Promise<void> {
  try {
    const r = await api.import();
    for (const m of r?.imported || []) {
      if (!materials.value.some((x) => x.id === m.id)) materials.value.unshift(m);
    }
  } catch (e: any) { svcError.value = humanizeErrorMessage(e, i18nT('导入失败')); }
}
/**
 * 就地重跑解析。
 *
 * 「解析失败」里有一大类文件本身完全没问题：`status='parsing'` 的记录在应用重启时会被
 * 收敛成 failed（主进程 load() 那段「不留永久转圈」）。以前失败后只能回文件选择框重导一遍，
 * 客户实测截图里同一份 docx 因此出现了三条。走本地副本重解析，原文件挪走/改名也不影响。
 */
const reparsing = ref<Set<string>>(new Set());
async function reparse(m: EduHubMaterial): Promise<void> {
  if (reparsing.value.has(m.id)) return;
  reparsing.value = new Set([...reparsing.value, m.id]);
  svcError.value = '';
  try {
    const r = await api.reparse({ id: m.id });
    const next = r?.material;
    if (next) {
      const i = materials.value.findIndex((x) => x.id === next.id);
      if (i >= 0) materials.value[i] = next; else materials.value.unshift(next);
      if (next.status !== 'ready') svcError.value = next.error || i18nT('重新解析仍未成功');
    }
  } catch (e: any) {
    svcError.value = humanizeErrorMessage(e, i18nT('重新解析失败'));
  } finally {
    const left = new Set(reparsing.value); left.delete(m.id); reparsing.value = left;
  }
}
function lessonsOf(materialId: string): EduHubLesson[] {
  return lessons.value.filter((l) => l.materialId === materialId);
}
async function generate(m: EduHubMaterial): Promise<void> {
  beginAction();
  try {
    const o = genOptsFor(m.id);
    const lesson = await api.generate({ materialId: m.id, grade: o.grade, durationMinutes: o.minutes, lang: o.lang, mode: o.mode });
    if (!lessons.value.some((l) => l.id === lesson.id)) lessons.value.unshift(lesson);
  } catch (e: any) { svcError.value = humanizeErrorMessage(e, i18nT('生成失败')); }
}
async function genIllustration(l: EduHubLesson, index: number): Promise<void> {
  beginAction();
  illBusy.value = `${l.id}:${index}`;
  try {
    const updated = await api.genIllustration({ id: l.id, index });
    const i = lessons.value.findIndex((x) => x.id === l.id);
    if (i >= 0) lessons.value[i] = updated;
  } catch (e: any) { svcError.value = humanizeErrorMessage(e, i18nT('生成配图失败')); }
  finally { illBusy.value = ''; }
}
// 教案语言：三种输出语言与生成时的下拉一致；label 用各语言自己的名字，切换时一眼认得出
const LANG_OPTS: { value: 'zh-CN' | 'en-US' | 'ar'; label: string }[] = [
  { value: 'zh-CN', label: i18nT('中文') },
  { value: 'en-US', label: 'English' },
  { value: 'ar', label: 'العربية' },
];
function langLabel(v?: string): string { return LANG_OPTS.find((o) => o.value === v)?.label || v || ''; }
async function switchLang(l: EduHubLesson, lang: 'zh-CN' | 'en-US' | 'ar'): Promise<void> {
  if ((l.lang || 'zh-CN') === lang || l.langStatus === 'switching') return;
  beginAction();
  try {
    const updated = await api.switchLang({ id: l.id, lang });
    const i = lessons.value.findIndex((x) => x.id === l.id);
    if (i >= 0) lessons.value[i] = updated;
    if (updated.langStatus === 'switching') notify(i18nT('正在生成 {lang} 版教案，完成后自动切换（已发布的教案学生端届时同步更新）。', { lang: langLabel(lang) }), 0);
  } catch (e: any) { svcError.value = humanizeErrorMessage(e, i18nT('切换语言失败')); }
}
async function retry(l: EduHubLesson): Promise<void> {
  const m = materials.value.find((x) => x.id === l.materialId);
  if (m) await generate(m);
}
function toggleExpand(id: string): void {
  expanded.value = expanded.value === id ? '' : id;
  if (expanded.value === id) {
    const l = lessons.value.find((x) => x.id === id);
    if (l && l.avatarStatus === 'ready') void loadAvatarMedia(l);
  }
}
async function publish(l: EduHubLesson, on: boolean): Promise<void> {
  beginAction();
  try {
    const updated = await api.publish({ id: l.id, on });
    const i = lessons.value.findIndex((x) => x.id === l.id);
    if (i >= 0) lessons.value[i] = updated;
  } catch (e: any) { svcError.value = humanizeErrorMessage(e, i18nT('发布操作失败')); }
}
// 数字人讲解：按节离线成片（慢，进度经 EVENT 更新 lesson.avatarStatus）
async function genAvatar(l: EduHubLesson): Promise<void> {
  beginAction();
  avatarBusy.value = l.id;
  try {
    const r = await api.genAvatar({ id: l.id });
    notify(i18nT('数字人讲解已生成 {ok}/{total} 节；下方可直接预览，发布后学生端可见。', { ok: r.ok, total: r.total }));
    // 生成完刷新教师预览：已展开就重载，否则失效缓存等下次展开再拉
    if (expanded.value === l.id) { void loadAvatarMedia(l, true); }
    else { delete avatarMedia[l.id]; }
  } catch (e: any) { svcError.value = humanizeErrorMessage(e, i18nT('生成数字人讲解失败')); }
  finally { avatarBusy.value = ''; }
}

// 音频总结：把课程要点合成一段 mp3 口播（发布后学生端封面出现播放器）
async function genAudio(l: EduHubLesson): Promise<void> {
  beginAction();
  audioBusy.value = l.id;
  try {
    await api.genAudio({ id: l.id });
    notify(i18nT('音频总结已生成；发布后学生端可播放。'));
  } catch (e: any) { svcError.value = humanizeErrorMessage(e, i18nT('生成音频总结失败')); }
  finally { audioBusy.value = ''; }
}

function relTime(ts: number): string {
  if (!ts) return '—';
  const d = Date.now() - ts;
  if (d < 60_000) return i18nT('刚刚');
  if (d < 3600_000) return i18nT('{p0} 分钟前', { p0: Math.floor(d / 60_000) });
  if (d < 86400_000) return i18nT('{p0} 小时前', { p0: Math.floor(d / 3600_000) });
  return new Date(ts).toLocaleDateString();
}
</script>

<style scoped>
/* 与其它工作台同一套：根即滚动容器（父 .page-wrap 是 overflow:hidden 的定高区）。
   缺 height/overflow 时，长内容（含展开的教案）会溢出被裁剪、整页无法滚动。 */
.eh-page { padding: 18px clamp(20px, 4vw, 64px) 60px; width: 100%; height: 100%; min-height: 0; overflow-y: auto; }
.eh-head { display: flex; align-items: flex-start; gap: 14px; margin-bottom: 14px; }
.eh-title { flex: 1; }
.eh-title h2 { margin: 0 0 2px; font-size: 20px; }
.eh-title p { margin: 0; font-size: var(--font-size-md); color: var(--color-text-secondary); max-width: 72ch; }
.eh-run { display: inline-flex; align-items: center; gap: 7px; font-size: var(--font-size-md); padding: 5px 13px; border-radius: var(--radius-pill); white-space: nowrap; }
.eh-run i { width: 8px; height: 8px; border-radius: 50%; }
.eh-run.on { background: var(--ehw-ok-a12); color: var(--ehw-ok); }
.eh-run.on i { background: var(--ehw-ok); }
.eh-run.off { background: var(--color-bg-input); color: var(--color-text-secondary); }
.eh-run.off i { background: var(--color-text-secondary); }

/* 制作方向：排在标题与步骤条之间，选中态用品牌色实底，与步骤条区分开 */
.eh-dirs { display: flex; gap: 8px; margin-bottom: 12px; flex-wrap: wrap; }
.eh-dir {
  display: inline-flex; align-items: center; gap: 6px; padding: 7px 14px; border-radius: var(--radius-4); cursor: pointer;
  font-size: var(--font-size-md); font-weight: 600; border: 1px solid var(--color-border);
  background: var(--color-bg-base); color: var(--color-text-secondary);
}
.eh-dir:hover { border-color: color-mix(in srgb, var(--color-brand) 45%, var(--color-border)); color: var(--color-text-primary); }
.eh-dir.on { background: var(--color-brand); border-color: var(--color-brand); color: var(--color-on-accent); }

.eh-steps { position: sticky; top: 0; z-index: 30; display: flex; background: var(--color-bg-primary);
  border: 1px solid var(--color-border); border-radius: var(--radius-5); overflow: hidden; margin-bottom: 16px;
  box-shadow: var(--ehw-shadow); }
.eh-step { flex: 1; display: flex; align-items: center; justify-content: center; gap: 9px; border: 0;
  background: none; padding: 11px 8px; cursor: pointer; color: var(--color-text-secondary);
  border-bottom: 3px solid transparent; font-size: 13.5px; }
.eh-step.on { color: var(--color-text-primary); border-bottom-color: var(--ehw-ok-2); font-weight: 700; }
.eh-step .n { width: 21px; height: 21px; border-radius: 50%; background: var(--color-bg-input);
  display: grid; place-items: center; font-size: var(--font-size-xs); font-weight: 700; flex-shrink: 0; }
.eh-step.done .n { background: var(--ehw-ok-a15); color: var(--ehw-ok); }
.eh-step.on .n { background: var(--ehw-ok-2); color: var(--color-on-accent); }
.eh-step .tx small { display: block; font-size: 10.5px; color: var(--color-text-secondary); font-weight: 400; line-height: 1.3; }

.eh-banner { display: flex; align-items: center; gap: 10px; background: var(--ehw-danger-a8);
  border: 1px solid var(--ehw-danger-a30); color: var(--ehw-danger); border-radius: var(--radius-4); padding: 10px 14px;
  margin-bottom: 14px; font-size: 13.5px; }
.eh-banner span { flex: 1; }
.eh-banner-x { border: 0; background: none; color: var(--ehw-danger); font-size: 20px; line-height: 1; cursor: pointer; padding: 0 4px; }
.eh-notice { display: flex; align-items: center; gap: 10px; background: var(--color-bg-input);
  border: 1px solid var(--color-border); color: var(--color-text-primary); border-radius: var(--radius-4); padding: 10px 14px;
  margin-bottom: 14px; font-size: 13.5px; }
.eh-notice span { flex: 1; }
.eh-notice-x { border: 0; background: none; color: var(--color-text-secondary); font-size: 20px; line-height: 1; cursor: pointer; padding: 0 4px; }
.eh-pane { display: flex; flex-direction: column; gap: 12px; }
.eh-card { background: var(--color-bg-primary); border: 1px solid var(--color-border); border-radius: var(--radius-5); padding: 16px 18px; }
.eh-card h3 { margin: 0 0 10px; font-size: var(--font-size-lg); }
.eh-svc { display: grid; grid-template-columns: 1.5fr 1fr; gap: 12px; }
@container main-page (max-width: 860px) { .eh-svc { grid-template-columns: 1fr; } }
.eh-url { font-family: var(--font-mono); font-size: 16px; background: var(--color-bg-input);
  border: 1px dashed var(--color-border); border-radius: var(--radius-3); padding: 10px 14px; overflow-x: auto; }
.eh-btns { display: flex; gap: 8px; margin-top: 12px; flex-wrap: wrap; }
.eh-hint { font-size: 12.5px; color: var(--color-text-secondary); margin: 10px 0 0; }
.eh-err { font-size: var(--font-size-md); color: var(--ehw-danger); margin: 8px 0 0; }
.eh-qr-card { display: flex; gap: 16px; align-items: center; }
.eh-qr { width: 130px; height: 130px; border-radius: var(--radius-3); border: 1px solid var(--color-border); background: var(--ehw-surface); flex-shrink: 0; }
.eh-qr-empty { display: grid; place-items: center; font-size: var(--font-size-xs); color: var(--color-text-secondary); text-align: center; padding: 8px; }
.eh-code b { display: block; font-family: var(--font-mono); font-size: 28px; letter-spacing: 0.1em; color: var(--ehw-ok-2); margin: 2px 0 8px; }
.k { font-size: var(--font-size-sm); color: var(--color-text-secondary); }
.num { font-variant-numeric: tabular-nums; }

.btn { border: 1px solid var(--color-border); background: var(--color-bg-primary); color: var(--color-text-primary);
  border-radius: var(--radius-3); padding: 8px 16px; font-size: 13.5px; font-weight: 600; cursor: pointer; }
.btn.pri { background: var(--ehw-ok-2); border-color: var(--ehw-ok-2); color: var(--color-on-accent); }
.btn.danger { color: var(--ehw-danger); border-color: var(--ehw-danger); background: transparent; }
.btn.sm { padding: 4px 12px; font-size: 12.5px; }
.btn:disabled { opacity: 0.5; cursor: not-allowed; }
.btn:focus-visible { outline: 2px solid var(--ehw-ok-2); outline-offset: 2px; }

.eh-row { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; }
.chip { display: inline-flex; align-items: center; font-size: var(--font-size-sm); border-radius: var(--radius-pill); padding: 2px 10px; white-space: nowrap; }
.chip.ok { background: var(--ehw-ok-a13); color: var(--ehw-ok); }
.chip.warn { background: var(--ehw-warn-a16); color: var(--ehw-warn); }
.chip.bad { background: var(--ehw-danger-a10); color: var(--ehw-danger); }
.chip.src { background: var(--ehw-ok-a10); color: var(--ehw-ok-2); }
.chip.mut { background: var(--color-bg-input); color: var(--color-text-secondary); }

.eh-mat-head { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
/* 重新解析：只在失败时出现，低调 —— 它是补救入口，不该抢「生成教案」的注意力 */
.eh-retry {
  flex-shrink: 0; padding: 3px 10px; font-size: var(--font-size-sm); line-height: 1.5;
  border: 1px solid var(--border, var(--ehw-line-strong)); border-radius: var(--radius-2);
  background: var(--surface, var(--ehw-surface)); color: var(--text-secondary, var(--ehw-text-2)); cursor: pointer;
}
.eh-retry:hover:not(:disabled) { border-color: var(--ehw-ok-3); color: var(--ehw-ok-3); }
.eh-retry:disabled { opacity: .55; cursor: default; }
.eh-mat-head .grow { flex: 1; min-width: 200px; }
.eh-sel--need { border-color: var(--ehw-warn-2); color: var(--ehw-warn-3); }
/* 删除键：低调的图标按钮，hover 才变红 —— 删数据这种事不该长得像个诱饵 */
.eh-del {
  flex-shrink: 0; width: 26px; height: 26px; padding: 0; margin-inline-start: 4px;
  display: inline-flex; align-items: center; justify-content: center;
  border: none; border-radius: var(--radius-2); background: none; cursor: pointer;
  color: var(--color-text-muted); font-size: var(--font-size-base);
}
.eh-del:hover { background: var(--ehw-danger-a10-2); color: var(--ehw-danger); }
/* 班级码历史 */
.eh-codehist { width: 100%; margin-top: 8px; border-top: 1px solid var(--color-border-subtle); padding-top: 8px; display: flex; flex-direction: column; gap: 6px; }
.eh-codehist-row { display: flex; align-items: center; gap: 8px; font-size: var(--font-size-sm); }
.eh-codehist-code { font-family: ui-monospace, SFMono-Regular, Menlo, monospace; letter-spacing: .06em; }
.eh-suggest { display: flex; align-items: center; gap: 5px; margin: 4px 0 0; }
.eh-suggest i { color: var(--color-brand); }
.eh-sel { padding: 5px 8px; border: 1px solid var(--color-border); border-radius: var(--radius-3);
  background: var(--color-bg-primary); color: var(--color-text-primary); font-size: 12.5px; }
.eh-seg { display: inline-flex; border: 1px solid var(--color-border); border-radius: var(--radius-3); overflow: hidden; }
.eh-seg-b { padding: 5px 12px; border: 0; background: var(--color-bg-primary); color: var(--color-text-secondary);
  font-size: 12.5px; cursor: pointer; }
.eh-seg-b + .eh-seg-b { border-inline-start: 1px solid var(--color-border); }
.eh-seg-b.on { background: var(--color-primary, var(--ehw-ok-2)); color: var(--color-on-accent); font-weight: 600; }
.eh-mode-hint { margin: 8px 0 0; }
.eh-qa { padding: 8px 0; border-bottom: 1px dashed var(--color-border); }
.eh-qa:last-child { border-bottom: 0; }
.eh-qa-h { display: flex; align-items: center; gap: 8px; font-size: 12.5px; margin-bottom: 3px; }
.eh-qa-q { font-size: 13.5px; }
.eh-qa-a { margin-top: 2px; }
.eh-lesson { border-top: 1px dashed var(--color-border); margin-top: 12px; padding-top: 12px; }
.eh-lesson-head { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
.eh-lesson-head .grow { flex: 1; min-width: 180px; }
.eh-lang { display: inline-flex; border: 1px solid var(--color-border); border-radius: var(--radius-pill); overflow: hidden; }
.eh-lang-btn { border: none; background: transparent; color: var(--color-text-secondary); font: inherit; font-size: 11.5px; font-weight: 700; padding: 3px 10px; cursor: pointer; display: inline-flex; align-items: center; gap: 4px; }
.eh-lang-btn + .eh-lang-btn { border-inline-start: 1px solid var(--color-border); }
.eh-lang-btn.ready { color: var(--color-text-primary); }
.eh-lang-btn.active { background: var(--color-brand); color: var(--color-on-accent); }
.eh-lang-btn:disabled { opacity: .6; cursor: wait; }
.eh-spin { animation: eh-spin 1s linear infinite; }
@keyframes eh-spin { to { transform: rotate(360deg); } }

.eh-detail { margin-top: 12px; background: var(--color-bg-input); border-radius: var(--radius-4); padding: 14px 16px; }
.eh-map { background: var(--color-bg-primary); border: 1px solid var(--color-border); border-radius: var(--radius-4); padding: 10px; margin: 6px 0 4px; overflow-x: auto; }
.eh-doc-wrap { background: var(--color-bg-primary); border: 1px solid var(--color-border); border-radius: var(--radius-5); padding: 18px 22px; margin: 6px 0 14px; }
.eh-ills { display: grid; grid-template-columns: repeat(auto-fill, minmax(min(100%, 220px), 1fr)); gap: 12px; margin: 6px 0; }
.eh-ill { border: 1px solid var(--color-border); border-radius: var(--radius-4); overflow: hidden; background: var(--color-bg-primary); }
.eh-ill-img { width: 100%; display: block; aspect-ratio: 3 / 2; object-fit: cover; }
.eh-ill-ph { display: flex; flex-direction: column; gap: 10px; padding: 16px 14px; aspect-ratio: 3 / 2; justify-content: center; align-items: center; text-align: center; background: var(--color-bg-input); }
.eh-ill-icon { font-size: 26px; color: var(--color-text-secondary); opacity: 0.7; }
.eh-ill-cap-in { font-size: var(--font-size-md); font-weight: 600; line-height: 1.35; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; }
.eh-ill-cap { padding: 8px 12px; font-size: 12.5px; border-top: 1px solid var(--color-border); }
.eh-avs { display: grid; grid-template-columns: repeat(auto-fill, minmax(min(100%, 240px), 1fr)); gap: 12px; margin: 6px 0 4px; }
.eh-av { border: 1px solid var(--color-border); border-radius: var(--radius-4); overflow: hidden; background: var(--color-bg-primary); }
.eh-av-h { padding: 7px 11px; font-size: 12.5px; font-weight: 600; color: var(--color-text-primary); border-bottom: 1px solid var(--color-border); background: var(--color-bg-input); }
.eh-av-vid { width: 100%; display: block; aspect-ratio: 16 / 9; background: var(--ehw-dark); object-fit: contain; }
.eh-detail h4 { margin: 12px 0 6px; font-size: var(--font-size-md); color: var(--color-text-secondary); letter-spacing: 0.04em; }
.eh-detail h4:first-child { margin-top: 0; }
.eh-detail ul { margin: 4px 0; padding-inline-start: 18px; }
.eh-detail li { font-size: 13.5px; margin: 2px 0; }
.eh-body { font-size: 13.5px; margin: 4px 0; }
.eh-cols { display: grid; grid-template-columns: 1fr 1fr; gap: 18px; }
@container main-page (max-width: 860px) { .eh-cols { grid-template-columns: 1fr; } }
.eh-digest { margin: 8px 0; }
.eh-digest b { font-size: 13.5px; margin-inline-end: 6px; }
.eh-quiz { margin: 10px 0; font-size: 13.5px; }
.eh-opts { display: flex; flex-wrap: wrap; gap: 6px; margin: 6px 0; }
.eh-opt { border: 1px solid var(--color-border); border-radius: var(--radius-3); padding: 3px 10px; font-size: 12.5px; }
.eh-opt.right { border-color: var(--ehw-ok); background: var(--ehw-ok-a10-2); color: var(--ehw-ok); font-weight: 600; }

.eh-table { width: 100%; border-collapse: collapse; font-size: 13.5px; }
.eh-table td, .eh-table th { padding: 7px 8px; border-bottom: 1px dashed var(--color-border); text-align: start; vertical-align: top; }
.eh-table th { font-size: var(--font-size-sm); color: var(--color-text-secondary); border-bottom: 1px solid var(--color-border); white-space: nowrap; }
.eh-table tr:last-child td { border-bottom: 0; }
.eh-scroll { overflow-x: auto; }

/* ── 学情看板（以学生为维度：卡片网格 + 详情抽屉）───────────────────────────── */
/* ui-theme-exempt-begin：学情面板强调色（经典主题原值） */
.eh-pane { --ehs-accent: #0e6b5c; --ehs-accent-soft: rgba(14, 107, 92, 0.1); }
/* ui-theme-exempt-end */
:root[data-ui-theme] .eh-pane { --ehs-accent: var(--color-success); --ehs-accent-soft: color-mix(in srgb, var(--color-success) 10%, transparent); }
/* 班级汇总条 */
.ehs-summary { display: flex; flex-wrap: wrap; gap: 10px; padding: 4px 2px 2px; }
.ehs-sum { flex: 0 0 auto; min-width: 92px; padding: 12px 16px; border: 1px solid var(--color-border);
  border-radius: var(--radius-5); background: linear-gradient(150deg, var(--ehs-accent-soft), var(--color-bg-primary) 62%); }
.ehs-sum.grow { margin-inline-start: auto; }
.ehs-sum .v { display: block; font-size: 22px; font-weight: 780; line-height: 1.1; color: var(--color-text-primary); font-variant-numeric: tabular-nums; }
.ehs-sum .l { font-size: 11.5px; color: var(--color-text-secondary); }
.ehs-online { color: var(--ehw-ok); }
.ehs-sum .v.good { color: var(--ehw-ok); } .ehs-sum .v.mid { color: var(--ehw-warn); } .ehs-sum .v.low { color: var(--ehw-danger); }

/* 学生列表：一人一行（紧凑） */
.ehs-list { display: flex; flex-direction: column; gap: 8px; margin-top: 6px; }
.ehs-row { display: flex; align-items: center; gap: 14px; padding: 10px 15px; border: 1px solid var(--color-border);
  border-radius: var(--radius-5); background: var(--color-bg-primary); cursor: pointer;
  transition: border-color .14s ease, background .14s ease, box-shadow .14s ease; }
.ehs-row:hover, .ehs-row:focus-visible { border-color: color-mix(in srgb, var(--ehs-accent) 42%, var(--color-border));
  background: color-mix(in srgb, var(--ehs-accent-soft) 55%, var(--color-bg-primary)); box-shadow: var(--ehw-shadow-2); outline: none; }
.ehs-ava { width: 42px; height: 42px; flex: 0 0 auto; border-radius: var(--radius-5); display: grid; place-items: center;
  font-size: 17px; font-weight: 800; color: var(--color-on-accent);
  background: linear-gradient(140deg, hsl(var(--hue, 200), 62%, 52%), hsl(calc(var(--hue, 200) + 26), 66%, 44%));
  box-shadow: var(--ehw-shadow-3); }
.ehs-ava.sm { width: 36px; height: 36px; border-radius: var(--radius-4); font-size: var(--font-size-base); }
.ehs-ava.lg { width: 58px; height: 58px; border-radius: var(--radius-7); font-size: var(--font-size-2xl); }
.ehs-rid { flex: 0 0 auto; width: 148px; min-width: 0; display: flex; flex-direction: column; }
.ehs-name { font-size: var(--font-size-base); font-weight: 700; color: var(--color-text-primary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.ehs-seen { font-size: var(--font-size-xs); color: var(--color-text-secondary); }
.ehs-rbar { flex: 1 1 110px; min-width: 84px; display: flex; flex-direction: column; gap: 5px; }
.ehs-rbar-track { height: 6px; border-radius: var(--radius-1); background: var(--color-bg-input); overflow: hidden; }
.ehs-rbar-track span { display: block; height: 100%; border-radius: var(--radius-1); background: var(--ehw-grad); transition: width .3s ease; }
.ehs-rsegs { display: flex; gap: 3px; }
.ehs-seg2 { flex: 1; height: 4px; border-radius: calc(var(--radius-1) / 2); background: var(--color-bg-input); }
/* 只打开没交小测 = 半格：一眼区分「学完了」和「点开就跑了」。
   整格/半格/空格三态与右边「x/y 已学完」同源（都来自 perLesson），不会再出现
   「计数说 1/3、条子看着像满格」这种对不上的情况。 */
.ehs-seg2.read { background: var(--ehw-grad-2); }
.ehs-seg2.quiz { background: var(--ehw-ok); }
.ehs-rstats { flex: 0 0 auto; display: flex; gap: 20px; }
.ehs-rstat { display: flex; flex-direction: column; align-items: center; min-width: 40px; }
.ehs-rstat b { font-size: var(--font-size-lg); font-weight: 760; color: var(--color-text-primary); font-variant-numeric: tabular-nums; line-height: 1.15; }
.ehs-rstat b i { font-size: var(--font-size-xs); font-style: normal; font-weight: 600; color: var(--color-text-secondary); }
.ehs-rstat b.good { color: var(--ehw-ok); } .ehs-rstat b.mid { color: var(--ehw-warn); } .ehs-rstat b.low { color: var(--ehw-danger); }
.ehs-rstat em { font-size: 10.5px; font-style: normal; color: var(--color-text-secondary); }
.ehs-rpct { flex: 0 0 auto; display: flex; align-items: center; gap: 6px; min-width: 62px; justify-content: flex-end; }
.ehs-rpct b { font-size: 16px; font-weight: 800; color: var(--ehs-accent); font-variant-numeric: tabular-nums; }
.ehs-chev { font-size: var(--font-size-xl); color: var(--color-text-secondary); opacity: .6; }
@container main-page (max-width: 720px) { .ehs-rstats { display: none; } .ehs-rid { width: 108px; } }

/* 详情抽屉 */
.ehs-modal { position: fixed; inset: 0; z-index: 200; display: flex; justify-content: flex-end;
  background: var(--ehw-dark-a42); backdrop-filter: var(--ehw-blur); }
.ehs-sheet { position: relative; width: min(460px, 94vw); height: 100%; overflow-y: auto; padding: 26px 24px 40px;
  background: var(--color-bg-primary); border-inline-start: 1px solid var(--color-border); box-shadow: var(--ehw-shadow-4); }
.ehs-x { position: absolute; top: 16px; inset-inline-end: 16px; width: 32px; height: 32px; border: 1px solid var(--color-border);
  border-radius: var(--radius-3); background: var(--color-bg-primary); color: var(--color-text-secondary); font-size: var(--font-size-base); cursor: pointer; }
.ehs-x:hover { color: var(--color-text-primary); border-color: var(--ehs-accent); }
.ehs-sheet-head { display: flex; align-items: center; gap: 14px; margin-bottom: 18px; }
.ehs-sheet-name { display: block; font-size: 19px; font-weight: 780; color: var(--color-text-primary); }
.ehs-kpis { display: grid; grid-template-columns: repeat(4, 1fr); gap: 9px; margin-bottom: 22px; }
.ehs-kpi { text-align: center; padding: 12px 6px; border-radius: var(--radius-5); background: linear-gradient(155deg, var(--ehs-accent-soft), var(--color-bg-input) 70%); }
.ehs-kpi .v { display: block; font-size: 20px; font-weight: 800; color: var(--color-text-primary); font-variant-numeric: tabular-nums; }
.ehs-kpi .v.good { color: var(--ehw-ok); } .ehs-kpi .v.mid { color: var(--ehw-warn); } .ehs-kpi .v.low { color: var(--ehw-danger); }
.ehs-kpi .l { font-size: 10.5px; color: var(--color-text-secondary); }
.ehs-sec { margin-bottom: 22px; }
.ehs-sec h5 { margin: 0 0 10px; font-size: var(--font-size-sm); letter-spacing: .05em; text-transform: uppercase; color: var(--color-text-secondary); }
.ehs-lessons { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 2px; }
.ehs-lrow { display: flex; align-items: center; gap: 10px; padding: 10px 12px; border-radius: var(--radius-4); background: var(--color-bg-primary); border: 1px solid transparent; }
.ehs-lrow:hover { background: var(--color-bg-input); }
.ehs-ldot { width: 9px; height: 9px; flex: 0 0 auto; border-radius: 50%; background: var(--color-text-secondary); opacity: .45; }
.ehs-ldot.read { background: var(--ehw-warn-4); opacity: 1; }
.ehs-ldot.quiz { background: var(--ehw-ok); opacity: 1; }
.ehs-ltitle { flex: 1; min-width: 0; font-size: 13.5px; color: var(--color-text-primary); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.ehs-lstat { flex: 0 0 auto; font-size: 12.5px; color: var(--color-text-secondary); font-variant-numeric: tabular-nums; }
.ehs-lstat.todo { opacity: .6; }
.ehs-lstat b { font-weight: 800; }
.ehs-lstat b.good { color: var(--ehw-ok); } .ehs-lstat b.mid { color: var(--ehw-warn); } .ehs-lstat b.low { color: var(--ehw-danger); }
.ehs-lstat i { font-style: normal; }
.ehs-q { padding: 9px 0; border-bottom: 1px dashed var(--color-border); }
.ehs-q:last-child { border-bottom: 0; }
.ehs-q-q { font-size: var(--font-size-md); color: var(--color-text-primary); display: flex; gap: 8px; align-items: center; flex-wrap: wrap; }
.ehs-q-a { margin-top: 3px; font-size: 12.5px; }
/* 学号：行内小徽标 + 抽屉头 */
.ehs-no { display: inline-block; margin-right: 7px; padding: 0 6px; border-radius: var(--radius-1); font-weight: 700;
  font-variant-numeric: tabular-nums; color: var(--ehs-accent); background: var(--ehs-accent-soft); }
.ehs-sheet-no { margin-top: 2px; font-variant-numeric: tabular-nums; }
/* 历史学习记录时间线 */
.ehs-timeline { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 2px; max-height: 300px; overflow-y: auto; }
.ehs-tl-row { display: flex; align-items: center; gap: 10px; padding: 8px 10px; border-radius: var(--radius-3); background: var(--color-bg-primary); }
.ehs-tl-row:hover { background: var(--color-bg-input); }
.ehs-tl-kind { flex: 0 0 auto; min-width: 40px; text-align: center; font-size: var(--font-size-xs); font-weight: 700; padding: 2px 7px; border-radius: var(--radius-2);
  color: var(--color-text-secondary); background: var(--color-bg-input); border: 1px solid var(--color-border); }
.ehs-tl-kind.test { color: var(--ehw-ok); border-color: color-mix(in srgb, var(--ehw-ok) 40%, var(--color-border)); }
.ehs-tl-kind.practice { color: var(--ehw-info); border-color: color-mix(in srgb, var(--ehw-info) 40%, var(--color-border)); }
.ehs-tl-kind.note { color: var(--ehw-warn); border-color: color-mix(in srgb, var(--ehw-warn) 40%, var(--color-border)); }
.ehs-tl-kind.ask { color: var(--ehw-brand); border-color: color-mix(in srgb, var(--ehw-brand) 40%, var(--color-border)); }
.ehs-tl-body { flex: 1; min-width: 0; display: flex; align-items: baseline; gap: 8px; }
.ehs-tl-title { flex: 0 1 auto; min-width: 0; font-size: var(--font-size-md); color: var(--color-text-primary); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.ehs-tl-body b { flex: 0 0 auto; font-weight: 800; font-variant-numeric: tabular-nums; }
.ehs-tl-body b.good { color: var(--ehw-ok); } .ehs-tl-body b.mid { color: var(--ehw-warn); } .ehs-tl-body b.low { color: var(--ehw-danger); }
.ehs-tl-text { flex: 1; min-width: 0; font-style: normal; font-size: var(--font-size-sm); color: var(--color-text-secondary); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.ehs-tl-at { flex: 0 0 auto; font-size: var(--font-size-xs); font-variant-numeric: tabular-nums; }
.ehs-fade-enter-active, .ehs-fade-leave-active { transition: opacity .2s ease; }
.ehs-fade-enter-active .ehs-sheet, .ehs-fade-leave-active .ehs-sheet { transition: transform .24s cubic-bezier(.22,.61,.36,1); }
.ehs-fade-enter-from, .ehs-fade-leave-to { opacity: 0; }
.ehs-fade-enter-from .ehs-sheet, .ehs-fade-leave-to .ehs-sheet { transform: translateX(24px); }
@container main-page (max-width: 560px) { .ehs-grid { grid-template-columns: 1fr; } .ehs-kpis { grid-template-columns: repeat(2, 1fr); } .ehs-sheet { width: 100vw; } }
@media (prefers-reduced-motion: reduce) { .ehs-card, .ehs-fade-enter-active, .ehs-fade-leave-active, .ehs-fade-enter-active .ehs-sheet, .ehs-fade-leave-active .ehs-sheet { transition: none !important; } }

/* ─── 调色板（docs/ui-design-system.md）：经典主题保持原值；界面主题（data-ui-theme）下映射全局 token ─── */
.eh-page { /* ui-theme-exempt: 经典主题原值 */
  --ehw-ok-a12: rgba(34, 197, 94, 0.12);
  --ehw-ok: #16a34a;
  --ehw-shadow: 0 6px 18px rgba(0, 0, 0, 0.06);
  --ehw-ok-2: #0e6b5c;
  --ehw-ok-a15: rgba(34, 197, 94, 0.15);
  --ehw-danger-a8: rgba(220, 38, 38, 0.08);
  --ehw-danger-a30: rgba(220, 38, 38, 0.3);
  --ehw-danger: #dc2626;
  --ehw-surface: #fff;
  --ehw-ok-a13: rgba(34, 197, 94, 0.13);
  --ehw-warn-a16: rgba(217, 165, 82, 0.16);
  --ehw-warn: #b7791f;
  --ehw-danger-a10: rgba(220, 38, 38, 0.1);
  --ehw-ok-a10: rgba(14, 107, 92, 0.1);
  --ehw-line-strong: #d4d4d8;
  --ehw-text-2: #52525b;
  --ehw-ok-3: #0e9f6e;
  --ehw-warn-2: #d97706;
  --ehw-warn-3: #b45309;
  --ehw-danger-a10-2: rgba(220, 38, 38, .1);
  --ehw-dark: #000;
  --ehw-ok-a10-2: rgba(34, 197, 94, 0.1);
  --ehw-shadow-2: 0 4px 14px rgba(14, 107, 92, 0.1);
  --ehw-shadow-3: 0 4px 12px hsla(var(--hue, 200), 60%, 45%, 0.32);
  --ehw-grad: linear-gradient(90deg, var(--ehs-accent), #16a34a);
  --ehw-grad-2: linear-gradient(90deg, rgba(217, 165, 82, 0.85) 50%, var(--color-bg-input) 50%);
  --ehw-dark-a42: rgba(15, 23, 42, 0.42);
  --ehw-blur: blur(2px);
  --ehw-shadow-4: -18px 0 44px rgba(0, 0, 0, 0.22);
  --ehw-warn-4: #d9a552;
  --ehw-info: #2563eb;
  --ehw-brand: #7c3aed;
}
:root[data-ui-theme] .eh-page {
  --ehw-ok-a12: color-mix(in srgb, var(--color-success) 12%, transparent);
  --ehw-ok: var(--color-success);
  --ehw-shadow: var(--shadow-card);
  --ehw-ok-2: var(--color-success);
  --ehw-ok-a15: color-mix(in srgb, var(--color-success) 15%, transparent);
  --ehw-danger-a8: color-mix(in srgb, var(--color-danger) 8%, transparent);
  --ehw-danger-a30: color-mix(in srgb, var(--color-danger) 30%, transparent);
  --ehw-danger: var(--color-danger);
  --ehw-surface: var(--color-bg-card);
  --ehw-ok-a13: color-mix(in srgb, var(--color-success) 13%, transparent);
  --ehw-warn-a16: color-mix(in srgb, var(--color-warning) 16%, transparent);
  --ehw-warn: var(--color-warning);
  --ehw-danger-a10: color-mix(in srgb, var(--color-danger) 10%, transparent);
  --ehw-ok-a10: color-mix(in srgb, var(--color-success) 10%, transparent);
  --ehw-line-strong: var(--color-border-strong);
  --ehw-text-2: var(--color-text-secondary);
  --ehw-ok-3: var(--color-success);
  --ehw-warn-2: var(--color-warning);
  --ehw-warn-3: var(--color-warning);
  --ehw-danger-a10-2: color-mix(in srgb, var(--color-danger) 10%, transparent);
  --ehw-dark: var(--color-bg-code);
  --ehw-ok-a10-2: color-mix(in srgb, var(--color-success) 10%, transparent);
  --ehw-shadow-2: var(--shadow-card-hover);
  --ehw-shadow-3: var(--shadow-card);
  --ehw-grad: var(--ehs-accent);
  --ehw-grad-2: linear-gradient(90deg, color-mix(in srgb, var(--color-warning) 85%, transparent) 50%, var(--color-bg-input) 50%);
  --ehw-dark-a42: color-mix(in srgb, var(--color-scrim) 42%, transparent);
  --ehw-blur: var(--overlay-blur);
  --ehw-shadow-4: var(--shadow-pop);
  --ehw-warn-4: var(--color-warning);
  --ehw-info: var(--color-info);
  --ehw-brand: var(--color-brand);
}
</style>
