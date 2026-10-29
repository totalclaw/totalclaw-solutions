<template>
  <div class="video-studio-page">
    <header class="studio-hero">
      <PageBackButton />
      <div class="hero-copy">
        <span class="hero-kicker"><i class="ri-movie-2-line"></i>{{ $t('内置 Skill · totalclaw-video-studio') }}</span>
        <h1>{{ $t('多媒体创作与发布工作台') }}</h1>
        <p>{{ $t('从素材整理、脚本、配音配乐到成片审核，一次准备抖音、快手、小红书和微信视频号版本。') }}</p>
      </div>
      <div class="hero-actions">
        <div class="hero-flow" :aria-label="$t('视频制作流程')">
          <template v-for="(step, index) in flowSteps" :key="step.label">
            <div
              class="flow-step"
              :class="{
                ready: flowStepState(index) === 'done',
                active: flowStepState(index) === 'active',
              }"
            >
              <span><i :class="flowStepState(index) === 'done' ? 'ri-check-line' : step.icon"></i></span>
              <small>{{ $t(step.label) }}</small>
            </div>
            <i v-if="index < flowSteps.length - 1" class="ri-arrow-right-s-line flow-arrow"></i>
          </template>
        </div>
      </div>
    </header>

    <section class="job-progress-panel" :class="`is-${jobRunStatus}`">
      <div class="job-progress-heading">
        <div class="job-progress-title">
          <span class="job-progress-icon">
            <i :class="jobRunStatus === 'running' ? 'ri-loader-4-line spin' : jobRunStatus === 'failed' ? 'ri-error-warning-line' : jobProgressPercent === 100 ? 'ri-check-line' : 'ri-time-line'"></i>
          </span>
          <div>
            <strong>{{ jobProgressTitle }}</strong>
            <small>{{ jobCurrentNodeName }}</small>
          </div>
        </div>
        <div v-if="!jobRunTerminated" class="job-progress-number">
          <strong>{{ jobProgressPercent }}%</strong>
          <span>{{ jobCompletedCount }}/{{ jobProgressNodes.length }} {{ $t('步骤完成') }}</span>
          <span v-if="jobTimeText" class="job-progress-time">{{ jobTimeText }}</span>
        </div>
        <div v-else class="job-progress-number">
          <span>{{ $t('停在第 {p0} 步（共 {p1} 步）', { p0: jobCompletedCount, p1: jobProgressNodes.length }) }}</span>
        </div>
        <!-- 直连成片跑着就能停：两条管线的取消通道都在（solution.cancelVideo / globalAdsRun.cancelSlideshow） -->
        <button
          v-if="jobDirectRunning"
          type="button"
          class="job-stop-btn"
          :disabled="stopping"
          @click="stopProduction()"
        >
          <i :class="stopping ? 'ri-loader-4-line spin' : 'ri-stop-circle-line'"></i>{{ stopping ? $t('正在停止…') : $t('停止') }}
        </button>
      </div>
      <div v-if="!jobRunTerminated" class="job-progress-track" role="progressbar" :aria-valuenow="jobProgressPercent" aria-valuemin="0" aria-valuemax="100">
        <i :style="{ width: `${jobProgressPercent}%` }"></i>
      </div>
      <div class="job-progress-stages">
        <div
          v-for="(step, index) in flowSteps"
          :key="`progress-${step.label}`"
          :class="['job-progress-stage', `is-${flowStepState(index)}`]"
        >
          <i :class="flowStepState(index) === 'done' ? 'ri-checkbox-circle-fill' : flowStepState(index) === 'active' ? 'ri-loader-4-line spin' : 'ri-circle-line'"></i>
          <span>{{ $t(step.label) }}</span>
          <small>{{ flowStepDetail(index) }}</small>
        </div>
      </div>
      <!--
        三种必须有人处理的终态：失败 / 可能已超时 / 上次运行已中断。
        失败即终止：spinner 已由管线的收尾逻辑收掉；这里给原因与「重新生成」。
        超时由看门狗判（跑过预计的 3 倍或 10 分钟没进度），可「继续等待」或「重新生成」
        （重新生成会先取消还在跑的旧任务，等它退出再起，不堆僵尸子进程）。
      -->
      <StepRunAlert
        v-if="jobRunAlert"
        :state="jobRunAlert.state"
        :message="jobRunAlert.message"
        :elapsed-sec="jobWatchdog.elapsedSec.value"
        :estimate-sec="jobEstimateSec || null"
        :since-heartbeat-sec="jobWatchdog.sinceHeartbeatSec.value"
        :busy="jobRestarting"
        @retry="regenerateProduction()"
        @keep-waiting="jobWatchdog.keepWaiting()"
      />
    </section>

    <!--
      发布确认就地弹在演示页上。以前这个确认只存在于全局待办中心，演示页只显示一行
      「等待发布确认」，用户在页面上找不到任何可点的东西，进度就永远停在最后一步。
    -->
    <section v-if="jobPendingConfirm" class="publish-confirm-panel">
      <header class="publish-confirm-head">
        <span class="publish-confirm-icon"><i class="ri-shield-check-line"></i></span>
        <div>
          <strong>{{ jobPendingConfirm?.nodeName || $t('发布前确认') }}</strong>
          <small>{{ jobPendingConfirm?.question || $t('请确认各平台登录状态后再发布') }}</small>
        </div>
        <button type="button" class="ghost-btn" :disabled="confirmSubmitting" @click="checkAllPlatformLogins">
          <i class="ri-refresh-line"></i>{{ $t('检测登录状态') }}
        </button>
      </header>

      <p class="publish-confirm-hint">
        {{ $t('不要求所有平台都已登录：只发布你勾选的平台，未勾选的会在回执里如实标注为未发布。登录一律在右侧内置浏览器完成。') }}
      </p>

      <ul class="publish-confirm-list">
        <li v-for="platform in selectedPlatforms" :key="`confirm-${platform.id}`">
          <label class="publish-confirm-pick">
            <input
              type="checkbox"
              :checked="platformPublishPicked[platform.id] !== false"
              @change="platformPublishPicked = { ...platformPublishPicked, [platform.id]: ($event.target as HTMLInputElement).checked }"
            />
            <span class="publish-confirm-name">{{ platform.label }}</span>
          </label>
          <span class="publish-confirm-state" :class="`is-${platformLoginState[platform.id] || 'unknown'}`">
            <template v-if="platformLoginState[platform.id] === 'checking'">
              <i class="ri-loader-4-line spin"></i>{{ $t('检测中') }}
            </template>
            <template v-else-if="platformLoginState[platform.id] === 'ready'">
              <i class="ri-checkbox-circle-fill"></i>{{ $t('已登录') }}
            </template>
            <template v-else-if="platformLoginState[platform.id] === 'absent'">
              <i class="ri-error-warning-fill"></i>{{ $t('未登录') }}
            </template>
            <template v-else>
              <i class="ri-question-line"></i>{{ $t('未检测') }}
            </template>
          </span>
          <button type="button" class="ghost-btn small" @click="openPlatformLogin(platform.id)">
            <i class="ri-external-link-line"></i>{{ $t('去内置浏览器登录') }}
          </button>
        </li>
      </ul>

      <footer class="publish-confirm-actions">
        <span class="publish-confirm-summary">
          {{ $t('本次将发布 {count} 个平台', { count: pickedPublishPlatforms.length }) }}
          <template v-if="skippedPublishPlatforms.length">
            · {{ $t('跳过 {count} 个', { count: skippedPublishPlatforms.length }) }}
          </template>
        </span>
        <button type="button" class="ghost-btn" :disabled="confirmSubmitting" @click="submitPublishConfirm(false)">
          {{ $t('暂不发布并修改') }}
        </button>
        <button
          type="button"
          class="primary-btn"
          :disabled="confirmSubmitting || !pickedPublishPlatforms.length"
          @click="submitPublishConfirm(true)"
        >
          <i :class="confirmSubmitting ? 'ri-loader-4-line spin' : 'ri-send-plane-fill'"></i>
          {{ $t('确认并开始发布') }}
        </button>
      </footer>
    </section>

    <!-- 发布在本页完成：预览、登录引导、确认提交、停止/继续与分平台回执（S17a） -->
    <PublishRunPanel :owner-path="PUBLISH_OWNER_PATH" :focus-id="publishRunFocusId" @change="onPublishRunChange" />

    <section class="model-strip">
      <article class="model-card" :class="`status-${ttsStatus.tone}`">
        <span class="model-icon voice"><i class="ri-mic-line"></i></span>
        <div class="model-copy">
          <div class="model-heading">
            <strong>{{ $t('TTS 配音') }}</strong>
            <span class="status-dot"></span>
            <em>{{ $t(ttsStatus.label) }}</em>
          </div>
          <p>{{ ttsStatus.detail }}</p>
        </div>
        <button class="model-action" @click="openMediaSettings('tts')">
          {{ ttsStatus.tone === 'ready' ? $t('查看配置') : $t('去配置') }}<i class="ri-arrow-right-line"></i>
        </button>
      </article>

      <article class="model-card" :class="`status-${seedanceStatus.tone}`">
        <span class="model-icon video"><i class="ri-movie-2-line"></i></span>
        <div class="model-copy">
          <div class="model-heading">
            <strong>fal · MiniMax</strong>
            <span class="status-dot"></span>
            <em>{{ $t(seedanceStatus.label) }}</em>
          </div>
          <p>{{ seedanceStatus.detail }}</p>
        </div>
        <button class="model-action" @click="openMediaSettings('video')">
          {{ seedanceStatus.tone === 'ready' ? $t('查看配置') : $t('去配置') }}<i class="ri-arrow-right-line"></i>
        </button>
      </article>

      <button class="refresh-models" :title="$t('刷新配置状态')" :disabled="modelLoading" @click="loadModelState">
        <i :class="modelLoading ? 'ri-loader-4-line spin' : 'ri-refresh-line'"></i>
      </button>
    </section>

    <div class="studio-grid">
      <main class="studio-form">
        <section class="form-card">
          <div class="section-head">
            <span class="section-index">01</span>
            <div>
              <h2>{{ $t('告诉 AI 这条视频要做什么') }}</h2>
              <p>{{ $t('素材目录和内容目标会一起交给视频 Skill；资料不全时，Agent 会先在对话里补问。') }}</p>
            </div>
            <button class="demo-preset-button" type="button" @click="applyDemoPreset">
              <i class="ri-lightbulb-line"></i>{{ $t('载入推荐方案') }}
            </button>
          </div>

          <div class="field-grid">
            <label class="field">
              <span>{{ $t('项目名称') }}</span>
              <input v-model.trim="draft.projectName" :placeholder="$t('例如：新品推广短视频')" maxlength="80" />
            </label>
            <label class="field">
              <span>{{ $t('品牌 / 门店') }}</span>
              <input v-model.trim="draft.brandName" v-kb-fill="'brand'" :placeholder="$t('填写品牌或门店名称')" maxlength="80" />
            </label>
          </div>

          <label class="field full">
            <span>{{ $t('素材文件夹') }} <b>{{ $t('必填') }}</b></span>
            <div class="folder-picker">
              <i class="ri-folder-video-line"></i>
              <input v-model.trim="draft.materialDir" :placeholder="$t('选择包含图片、原视频或音频的文件夹')" />
              <button type="button" @click="pickMaterialFolder">{{ $t('选择文件夹') }}</button>
            </div>
          </label>

          <label class="field full">
            <span class="field-label-row">
              <span>{{ $t('内容目标与关键信息') }} <b>{{ $t('必填') }}</b></span>
              <button type="button" :disabled="polishingBrief || !draft.brief.trim()" @click.prevent="polishVideoPrompt">
                <i :class="polishingBrief ? 'ri-loader-4-line spin' : 'ri-edit-2-line'"></i>
                {{ polishingBrief ? $t('AI 润色中… {p0}', { p0: polishElapsedText }) : $t('AI 润色视频提示词') }}
              </button>
            </span>
            <textarea
              v-model="draft.brief"
              v-kb-fill="'main_business'"
              rows="5"
              maxlength="3000"
              :placeholder="$t('写清楚产品卖点、价格、门店位置、目标人群、活动时间和希望观众采取的行动。')"
            ></textarea>
            <small>{{ draft.brief.length }}/3000</small>
          </label>
        </section>

        <section class="form-card">
          <div class="section-head">
            <span class="section-index">02</span>
            <div>
              <h2>{{ $t('选择成片方式') }}</h2>
              <p>{{ $t('不确定就选“AI 自动判断”；需要生成动态镜头时选 fal 动态视频。') }}</p>
            </div>
          </div>
          <div class="choice-grid production-grid">
            <button
              v-for="mode in productionModes"
              :key="mode.id"
              type="button"
              :class="['choice-card', { active: draft.productionMode === mode.id, unavailable: mode.id === 'seedance' && !seedanceAvailable }]"
              :disabled="mode.id === 'seedance' && !seedanceAvailable"
              :title="mode.id === 'seedance' && !seedanceAvailable
                ? $t('动态视频需要 fal 密钥或管理员为此方案开通媒体服务')
                : ''"
              @click="pickProductionMode(mode.id)"
            >
              <span class="choice-icon"><i :class="mode.icon"></i></span>
              <strong>{{ $t(mode.label) }}</strong>
              <small>{{ mode.desc }}</small>
              <i class="ri-checkbox-circle-fill choice-check"></i>
            </button>
          </div>
          <label class="field render-ratio">
            <span>{{ $t('成片比例') }}</span>
            <select v-model="draft.aspectRatio">
              <option value="9:16">{{ $t('9:16（竖屏短视频）') }}</option>
              <option value="16:9">{{ $t('16:9（横屏视频）') }}</option>
              <option value="1:1">{{ $t('1:1（方形）') }}</option>
              <option value="4:3">4:3</option>
            </select>
          </label>
          <div
            v-if="draft.productionMode === 'seedance' && !modelLoading && seedanceStatus.tone === 'missing'"
            class="config-hint"
          >
            <i class="ri-alert-line"></i>
            <span>{{ $t('动态视频通道尚未接入，请配置 fal 密钥或联系管理员开通。') }}</span>
            <button type="button" @click="openMediaSettings('video')">{{ $t('配置视频通道') }}</button>
          </div>
        </section>

        <section class="form-card">
          <div class="section-head">
            <span class="section-index">03</span>
            <div>
              <h2>{{ $t('配音与配乐') }}</h2>
              <p>{{ $t('TTS 负责旁白，BGM 会按视频节奏自动混音并避让人声。') }}</p>
            </div>
          </div>
          <div class="audio-row">
            <label class="toggle-card">
              <span class="toggle-copy">
                <i class="ri-mic-line"></i>
                <span><strong>{{ $t('生成 AI 旁白') }}</strong><small>{{ $t('使用 AI 模型配置中的默认 TTS') }}</small></span>
              </span>
              <input v-model="draft.voiceover" type="checkbox" />
              <span class="switch"></span>
            </label>
            <label class="field music-field">
              <span>{{ $t('配乐情绪') }}</span>
              <select v-model="draft.bgmMood">
                <option v-for="mood in musicMoods" :key="mood.id" :value="mood.id">{{ $t(mood.label) }}</option>
              </select>
            </label>
          </div>
          <label v-if="draft.voiceover" class="field full voice-style">
            <span>{{ $t('旁白语气') }}</span>
            <input v-model.trim="draft.voiceStyle" :placeholder="$t('例如：自然亲切、语速稍快、重点词有力量')" maxlength="160" />
          </label>
          <div
            v-if="draft.voiceover && !modelLoading && ttsStatus.tone === 'missing'"
            class="config-hint"
          >
            <i class="ri-alert-line"></i>
            <span>{{ $t('还没有可用的默认 TTS，建议先完成配音引擎配置。') }}</span>
            <button type="button" @click="openMediaSettings('tts')">{{ $t('配置 TTS') }}</button>
          </div>
        </section>

        <section class="form-card">
          <div class="section-head">
            <span class="section-index">04</span>
            <div>
              <h2>{{ $t('选择发布平台') }}</h2>
              <p>{{ $t('同一条内容会按各平台标题、正文、标签和封面规则分别生成，不直接复制粘贴。') }}</p>
            </div>
          </div>
          <div class="platform-grid">
            <label
              v-for="platform in platforms"
              :key="platform.id"
              :class="['platform-card', platform.id, { active: draft.platforms.includes(platform.id) }]"
            >
              <input
                type="checkbox"
                :checked="draft.platforms.includes(platform.id)"
                @change="togglePlatform(platform.id)"
              />
              <span class="platform-mark">{{ platform.mark }}</span>
              <span><strong>{{ $t(platform.label) }}</strong><small>{{ $t(platform.desc) }}</small></span>
              <i class="ri-checkbox-circle-fill"></i>
            </label>
          </div>

          <div class="platform-topics">
            <div class="topics-heading">
              <div>
                <strong>{{ $t('发布话题') }}</strong>
                <small>{{ $t('每个平台可以单独调整；输入时可省略 #，系统会自动补齐。') }}</small>
              </div>
              <span><i class="ri-hashtag"></i>{{ $t('发布前可修改') }}</span>
            </div>
            <div class="topic-grid">
              <label v-for="platform in selectedPlatforms" :key="`topic-${platform.id}`" class="topic-field">
                <span><b :class="['topic-mark', platform.id]">{{ platform.mark }}</b>{{ $t(platform.label) }}</span>
                <input
                  v-model="draft.topics[platform.id]"
                  :placeholder="$t('#话题1 #话题2')"
                  maxlength="240"
                />
              </label>
            </div>
          </div>

          <div class="release-policy">
            <i class="ri-shield-check-line"></i>
            <div>
              <strong>{{ $t('先审核，再公开发布') }}</strong>
              <p>{{ $t('任务默认生成成片、四平台文案并完成发布前校验。只有你在人工确认弹窗中批准后，Agent 才会执行公开发布。') }}</p>
            </div>
          </div>
        </section>

        <div class="submit-bar">
          <div class="submit-summary">
            <strong>{{ selectedPlatformText || $t('尚未选择平台') }}</strong>
            <span>{{ productionModeLabel }} · {{ draft.aspectRatio }} · {{ draft.voiceover ? $t('含配音') : $t('不配音') }} · {{ musicMoodLabel }}</span>
          </div>
          <div class="submit-actions">
            <button
              v-if="hasPreviewVideo"
              class="publish-video-button"
              type="button"
              :disabled="publishing"
              @click="openPublishConfirm"
            >
              <i :class="publishing ? 'ri-loader-4-line spin' : publishDone ? 'ri-refresh-line' : 'ri-send-plane-fill'"></i>
              <span>{{ publishing && publishStageText ? publishStageText : publishDone ? $t('再次发布') : $t('准备发布') }}</span>
            </button>
            <button
              class="local-preview-button"
              type="button"
              :disabled="!hasPreviewVideo"
              :title="hasPreviewVideo ? lastJob.videoPath : $t('成片生成到本地后可预览')"
              @click="openLatestVideoPreview"
            >
              <i class="ri-video-line"></i>{{ $t('预览本地成片') }}
            </button>
            <button class="start-button" :disabled="!canPreview || starting" @click="previewOpen = true">
              <i class="ri-eye-line"></i>
              {{ $t('先预览制作方案') }}
            </button>
          </div>
        </div>
      </main>

      <aside class="studio-aside">
        <section class="aside-card skill-card">
          <div class="aside-title">
            <span><i class="ri-movie-2-line"></i></span>
            <div><strong>{{ $t('视频 Skill 会自动完成') }}</strong><small>totalclaw-video-studio</small></div>
          </div>
          <ol class="capability-list">
            <li><i class="ri-file-search-line"></i><span><strong>{{ $t('读取与筛选素材') }}</strong><small>{{ $t('图片、视频、音频统一整理') }}</small></span></li>
            <li><i class="ri-quill-pen-line"></i><span><strong>{{ $t('脚本与平台文案') }}</strong><small>{{ $t('钩子、字幕、标题、正文和标签') }}</small></span></li>
            <li><i class="ri-scissors-cut-line"></i><span><strong>{{ $t('剪辑、配音和配乐') }}</strong><small>{{ $t('按任务比例成片、字幕烧录与人声避让') }}</small></span></li>
            <li><i class="ri-send-plane-line"></i><span><strong>{{ $t('审核后分平台发布') }}</strong><small>{{ $t('扫码登录、风险熔断、结果留痕') }}</small></span></li>
          </ol>
        </section>

        <section v-if="hasPreviewVideo || lastJob.conversationId" class="aside-card job-card">
          <span class="job-eyebrow"><i class="ri-history-line"></i>{{ $t('最近一次制作任务') }}</span>
          <h3>{{ hasPreviewVideo ? $t('本次成片已就绪') : $t('最近一次短视频制作') }}</h3>
          <p>{{ hasPreviewVideo
            ? $t('本次制作产出的成片可立即播放审核，并继续进入多平台发布流程。')
            : $t('任务已经交给 AI。制作过程、缺失信息补问和发布确认都在这条对话里继续。')
          }}</p>
          <div class="job-actions">
            <button v-if="lastJob.conversationId" type="button" @click="openLastJob"><i class="ri-chat-3-line"></i>{{ $t('查看制作进度') }}</button>
            <button
              v-if="hasPreviewVideo"
              class="job-publish-button"
              type="button"
              :disabled="publishing"
              @click="openPublishConfirm"
            >
              <i :class="publishing ? 'ri-loader-4-line spin' : publishDone ? 'ri-refresh-line' : 'ri-send-plane-fill'"></i>
              <span>{{ publishing && publishStageText ? publishStageText : publishDone ? $t('再次发布') : $t('准备发布') }}</span>
            </button>
            <button
              class="job-preview-button"
              type="button"
              :disabled="!hasPreviewVideo"
              :title="hasPreviewVideo ? lastJob.videoPath : $t('等待工作流生成本地成片')"
              @click="openLatestVideoPreview"
            >
              <i class="ri-play-circle-line"></i>{{ $t('预览成片') }}
            </button>
          </div>
        </section>

        <section v-if="historyEntries.length" class="aside-card history-card">
          <span class="job-eyebrow"><i class="ri-history-line"></i>{{ $t('制作历史') }}</span>
          <h3>{{ $t('共 {count} 条', { count: historyEntries.length }) }}</h3>
          <ul class="history-list">
            <li v-for="entry in historyVisible" :key="entry.taskId" class="history-item">
              <div class="history-main">
                <strong :title="entry.projectName">{{ entry.projectName }}</strong>
                <small>{{ formatHistoryTime(entry.createdAt) }}</small>
              </div>
              <span class="history-status" :class="`is-${entry.status}`">{{ historyStatusLabel(entry.status) }}</span>
              <button
                type="button"
                class="history-publish"
                :disabled="publishing || !entry.videoPath"
                :title="entry.videoPath || $t('这条任务还没有产出成片')"
                @click="publishFromHistory(entry)"
              >
                <i class="ri-send-plane-line"></i>{{ $t('去发布') }}
              </button>
            </li>
          </ul>
          <footer v-if="historyPageCount > 1" class="history-pager">
            <button type="button" :disabled="historyPage === 0" @click="historyPage -= 1">
              <i class="ri-arrow-left-s-line"></i>
            </button>
            <span>{{ historyPage + 1 }} / {{ historyPageCount }}</span>
            <button type="button" :disabled="historyPage >= historyPageCount - 1" @click="historyPage += 1">
              <i class="ri-arrow-right-s-line"></i>
            </button>
          </footer>
        </section>

        <section class="aside-card tips-card">
          <span class="job-eyebrow"><i class="ri-lightbulb-flash-line"></i>{{ $t('出片更稳的素材建议') }}</span>
          <ul>
            <li>{{ $t('至少准备 6 张清晰图片，或 3 段以上原视频') }}</li>
            <li>{{ $t('首张图尽量有主体和视觉冲击力，将作为封面候选') }}</li>
            <li>{{ $t('价格、地点、营业时间等事实要写进内容目标，避免 AI 猜测') }}</li>
          </ul>
        </section>
      </aside>
    </div>

    <!-- F5：预览遮罩必须 Teleport 到 body——留在视图 DOM 里会被祖先的 transform/filter/backdrop-filter
         困进局部堆叠上下文（fixed 退化成「相对该祖先」定位 + z-index 出不去），实测盖不住/被盖。
         backdrop 带 role="dialog" 供原生浏览器避让锁（nativeBrowserModalLock.invariant.test.ts）。 -->
    <Teleport to="body">
    <div v-if="previewOpen" role="dialog" class="preview-backdrop" @click.self="previewOpen = false">
      <section class="preview-dialog" role="dialog" aria-modal="true" :aria-label="$t('制作方案预览')">
        <header class="preview-head">
          <div>
            <span><i class="ri-shield-check-line"></i>{{ $t('审核后再创建任务') }}</span>
            <h2>{{ $t('制作方案预览') }}</h2>
            <p>{{ $t('下面是即将交给视频 Skill 的完整指令；确认后才会登记到工作区并启动制作。') }}</p>
          </div>
          <button type="button" :aria-label="$t('关闭')" @click="previewOpen = false"><i class="ri-close-line"></i></button>
        </header>

        <div class="preview-summary">
          <span><strong>{{ draft.projectName || $t('未命名项目') }}</strong><small>{{ draft.brandName || $t('未填写品牌') }}</small></span>
          <span><strong>{{ productionModeLabel }}</strong><small>{{ draft.aspectRatio }} · {{ selectedPlatformText }}</small></span>
          <span><strong>{{ draft.voiceover ? $t('包含 AI 配音') : $t('不生成配音') }}</strong><small>{{ musicMoodLabel }}</small></span>
        </div>

        <div v-if="!draft.materialDir.trim()" class="preview-warning">
          <i class="ri-folder-warning-line"></i>
          <span>{{ $t('未选择素材文件夹时，将直接复用已生成的演示成片进入审核。') }}</span>
          <button type="button" @click="pickMaterialFolder">{{ $t('选择素材文件夹') }}</button>
        </div>

        <div class="preview-source" role="status">
          <template v-if="draft.productionMode === 'seedance'">
            <strong>{{ $t('视频生成费用预估') }}</strong>
            <span>{{ $t('按 {shots} 个镜头、共 {seconds} 秒估算', { shots: videoEstimate.shots, seconds: videoEstimate.seconds }) }} · {{ videoEstimate.model }}</span>
            <span>{{ videoEstimate.usd == null ? $t('当前模型暂无价格，费用未知') : $t('约 US$ {cost}', { cost: videoEstimate.usd.toFixed(2) }) }}</span>
            <small>{{ $t('视频按秒计费，不按文字 token 计费；此预估不含文字策划、配音与重生成，实际账单以服务商为准。') }}</small>
            <small v-if="videoEstimate.inferred">{{ $t('内容目标未写明时长，本次按 15 秒估算。') }}</small>
          </template>
          <template v-else>
            <strong>{{ $t('本地图片成片：视频生成费用为 0') }}</strong>
            <small>{{ $t('文字策划、云端配音及发布流程中的 AI 调用另计。') }}</small>
          </template>
        </div>

        <pre class="prompt-preview">{{ promptPreview }}</pre>

        <footer class="preview-actions">
          <button class="preview-cancel" type="button" @click="previewOpen = false">{{ $t('返回修改') }}</button>
          <button class="preview-confirm" type="button" :disabled="!canStart || starting" @click="confirmProduction">
            <i :class="starting ? 'ri-loader-4-line spin' : 'ri-check-line'"></i>
            {{ starting ? $t('正在创建制作任务…') : $t('审核通过，开始制作') }}
          </button>
        </footer>
      </section>
    </div>
    </Teleport>

    <Teleport to="body">
    <div v-if="videoPreviewOpen" role="dialog" class="video-preview-backdrop" @click.self="closeVideoPreview">
      <section class="video-preview-dialog" role="dialog" aria-modal="true" :aria-label="$t('成片预览')">
        <header>
          <div>
            <span><i class="ri-play-circle-line"></i>{{ $t('视频预览') }}</span>
            <h2>{{ $t('成片预览') }}</h2>
            <p>{{ videoPreviewPath || $t('点击播放即可预览本次生成的成片。') }}</p>
          </div>
          <button type="button" :aria-label="$t('关闭')" @click="closeVideoPreview"><i class="ri-close-line"></i></button>
        </header>
        <div class="video-stage">
          <!-- @error：协议 404 / 解码失败时清 src 亮出失败态，不让用户对着黑屏（与确认卡预览同规则） -->
          <video v-if="videoPreviewSrc" :src="videoPreviewSrc" controls autoplay playsinline @error="videoPreviewSrc = ''"></video>
          <div v-else class="video-preview-empty">
            <i class="ri-movie-line"></i>
            <strong>{{ videoPreviewLoading ? $t('正在读取成片…') : $t('本地成片读取失败') }}</strong>
            <span>{{ $t('请返回制作任务查看产物状态。') }}</span>
          </div>
        </div>
        <div v-if="videoPreviewPath" class="video-preview-path" :title="videoPreviewPath">
          <i class="ri-file-video-line"></i><span>{{ videoPreviewPath }}</span>
        </div>
        <footer>
          <button
            class="preview-publish"
            type="button"
            :disabled="publishing"
            @click="openPublishConfirm"
          >
            <i :class="publishing ? 'ri-loader-4-line spin' : publishDone ? 'ri-refresh-line' : 'ri-send-plane-fill'"></i>
            <span>{{ publishing && publishStageText ? publishStageText : publishDone ? $t('再次发布') : $t('准备发布') }}</span>
          </button>
          <button class="preview-confirm" type="button" @click="closeVideoPreview">
            <i class="ri-check-line"></i>{{ $t('关闭预览') }}
          </button>
        </footer>
      </section>
    </div>
    </Teleport>

    <Teleport to="body">
      <div
        v-if="publishConfirmOpen"
        class="video-publish-confirm-dock"
        role="dialog"
        aria-modal="true"
        :aria-label="$t('短视频发布人工确认')"
      >
        <HumanConfirmCard
          :request="publishApprovalRequest"
          :busy="publishing"
          :context-data="publishContextData"
          :context-labels="publishContextLabels"
          :context-preview="publishContextPreview"
          @decide="onPublishDecision"
          @dismiss="closePublishConfirm"
        />
      </div>
    </Teleport>

  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, onUnmounted, reactive, ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import type { MediaFalCapabilitiesResponse, MediaModelKindState, PublishRun } from '@totalclaw/ipc-contracts';
import { estimateVideoProduction } from '../utils/videoProductionEstimate';
import PageBackButton from '../components/PageBackButton.vue';
import { useNotificationStore } from '../stores/notification';
import { humanizeChatError } from '../utils/humanizeChatError';
import { humanizeErrorMessage } from '../utils/humanize';
import { t as i18nT } from '../i18n';
import { currentLocale } from '../composables/useLocale';
import HumanConfirmCard, {
  type HumanConfirmCardRequest,
} from '../components/workflow/HumanConfirmCard.vue';
import { createNativeBrowserModalLock } from '../composables/useNativeBrowserModalLock';
import {
  narrationTimeline,
  parseSeedanceShotList,
  SEEDANCE_SHOT_SYSTEM_PROMPT,
} from '../utils/seedanceShots';
import PublishRunPanel from '../components/PublishRunPanel.vue';
import { PLATFORM_PUBLISH_URLS, type PublishPlatformId, publishPlatforms } from '../composables/publishPlatforms';
import StepRunAlert from '../components/StepRunAlert.vue';
import { useStepWatchdog } from '../composables/useStepWatchdog';
import {
  adoptInterruptedDirectRun,
  beginDirectRun,
  clearInterruptedDirectRun,
  endDirectRun,
  jobCancelRequested,
  jobCurrentNodeName,
  jobEstimateSec,
  jobInterrupted,
  jobNodeStates,
  jobProgressAt,
  jobProgressNodes,
  jobRunMode,
  jobRunStatus,
  jobStartedAt,
  jobWaitExtendedAt,
  type VideoJobNodeState,
  type VideoJobRunMode,
  type VideoJobRunStatus,
} from '../composables/videoStudioRunState';

type ProductionMode = 'smart' | 'seedance' | 'slideshow';
type PlatformId = PublishPlatformId;
type AspectRatio = '9:16' | '16:9' | '1:1' | '4:3';
type StatusTone = 'ready' | 'partial' | 'missing';
type JobRunStatus = VideoJobRunStatus;

interface StudioDraft {
  projectName: string;
  brandName: string;
  materialDir: string;
  brief: string;
  productionMode: ProductionMode;
  aspectRatio: AspectRatio;
  voiceover: boolean;
  voiceStyle: string;
  bgmMood: string;
  platforms: PlatformId[];
  topics: Record<PlatformId, string>;
}

/**
 * 进度面板的唯一数据源标记。
 *
 * 制作进度曾经同时被三方写：工作流轮询、直连脚本的进度回调、工作流实时事件。
 * 谁最后写谁赢，于是直连成片跑完后轮询又把上一条卡住的 agent-loop 运行认回来，
 * 页面永远停在「6/8 · 发布 公开发布最终确认」。用这个字段定死当前归谁管，
 * 不属于自己的写入一律让开。
 */
type JobSource = 'none' | 'workflow' | 'direct';

interface LastJob {
  conversationId: string;
  projectName: string;
  workspaceId?: string;
  departmentId?: string;
  taskId?: string;
  /** 当前进度面板由谁驱动，见 JobSource。 */
  source?: JobSource;
  /** 工作流在创建时就确定的本地最终成片路径。 */
  expectedVideoPath?: string;
  /** 已经由主进程验证真实存在的本地成片路径。 */
  videoPath?: string;
}

const DRAFT_KEY = `totalclaw:video-studio-draft:v6:${currentLocale()}`;
const LAST_JOB_KEY = 'totalclaw:video-studio-last-job:v2';
const LEGACY_SAMPLE_PATTERN = /TOMORROW\s*WORLD|TomorrowCommercialTower|Tomorrow\s+Commercial\s+Tower|明日世界|TCT2/i;
const router = useRouter();
const notif = useNotificationStore();

const flowSteps = [
  { label: i18nT('素材'), icon: 'ri-gallery-upload-line' },
  { label: i18nT('创作'), icon: 'ri-quill-pen-line' },
  { label: i18nT('合成'), icon: 'ri-film-line' },
  { label: i18nT('发布'), icon: 'ri-send-plane-line' },
];
// 素材读取与筛选不在这张表里：它已经在启动前由 scan_materials.py 跑完，
// 不是工作流节点。留在表里的话 run.nodeStates 永远没有它，进度会卡在差一步。
const defaultJobProgressNodes = [
  { id: 'creative_plan', phase: 1, label: i18nT('脚本与平台方案') },
  { id: 'creative_review', phase: 1, label: i18nT('制作方案审核') },
  { id: 'render_final', phase: 1, label: i18nT('剪辑、配音与成片') },
  { id: 'video_review', phase: 2, label: i18nT('成片质量审核') },
  { id: 'publish_validation', phase: 2, label: i18nT('发布内容校验') },
  { id: 'publish_approval', phase: 3, label: i18nT('等待发布确认') },
  { id: 'platform_publish', phase: 3, label: i18nT('分平台发布') },
];

const productionModes: Array<{ id: ProductionMode; label: string; desc: string; icon: string }> = [
  { id: 'smart', label: i18nT('AI 自动判断'), desc: i18nT('根据素材类型选择最合适流程'), icon: 'ri-brain-line' },
  { id: 'seedance', label: i18nT('fal 动态视频'), desc: i18nT('根据分镜提示词生成动态镜头'), icon: 'ri-movie-2-line' },
  { id: 'slideshow', label: i18nT('图片成片'), desc: i18nT('图片、字幕和节拍快速合成'), icon: 'ri-slideshow-3-line' },
];

// 平台清单与各平台发布页地址在 composables/publishPlatforms.ts，与慈善活动内容工场共用一份
const platforms = publishPlatforms();

const musicMoods = [
  { id: 'auto', label: i18nT('AI 按内容自动选择') },
  { id: 'upbeat', label: i18nT('轻快活力') },
  { id: 'energetic', label: i18nT('热烈有冲击力') },
  { id: 'chill', label: i18nT('松弛治愈') },
  { id: 'emotional', label: i18nT('温暖情绪') },
  { id: 'cinematic', label: i18nT('电影感') },
];

function defaultDraft(): StudioDraft {
  const defaultTopics = i18nT('#品牌短片 #新品推广');
  return {
    projectName: '',
    brandName: '',
    materialDir: '',
    brief: [
      i18nT('制作一条 15 秒左右、9:16 竖屏的品牌推广短片，用于抖音、快手、小红书和微信视频号发布。'),
      '',
      i18nT('只读取用户选择的素材文件夹，自动识别其中的图片、视频和音频。已有竖屏视频优先智能剪辑；只有缺少必要过渡镜头时才调用 Seedance。'),
      '',
      i18nT('0–3 秒：使用最有视觉冲击力的素材开场，以简短字幕快速建立主题。'),
      i18nT('3–9 秒：用远景、近景和细节镜头交替展示核心卖点，字幕只呈现可核验信息。'),
      i18nT('9–15 秒：回到品牌主视觉，以明确的行动引导收尾。'),
      '',
      i18nT('只使用素材和用户输入中能够核验的事实，不虚构价格、效果、资质、奖项或活动政策；信息不足时先向用户补问。'),
      '',
      i18nT('整体画面现代、清晰、有节奏感。字幕语言跟随素材和用户要求；使用自然、有质感的旁白。BGM 选择克制、具有上升感的商业氛围音乐，并对旁白做人声避让。输出最终成片预览、封面建议及四个平台差异化文案。'),
    ].join('\n'),
    // 默认走「图片成片」拼接：不依赖任何生成模型 token，装完即可出片。
    // Seedance 这类生成路径要配了 key 才可选，见 seedanceAvailable。
    productionMode: 'slideshow',
    aspectRatio: '9:16',
    voiceover: true,
    voiceStyle: i18nT('自然、有质感的品牌旁白；语言跟随文案，发音清晰，语速中等'),
    bgmMood: 'cinematic',
    platforms: ['douyin', 'kuaishou', 'xiaohongshu', 'wxchannels'],
    topics: {
      douyin: defaultTopics,
      kuaishou: defaultTopics,
      xiaohongshu: defaultTopics,
      wxchannels: defaultTopics,
    },
  };
}

function applyDemoPreset(): void {
  Object.assign(draft, defaultDraft());
  notif.success(i18nT('通用推荐方案和四平台话题已填好'));
}

function loadStored<T extends object>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? { ...fallback, ...JSON.parse(raw) } : fallback;
  } catch {
    return fallback;
  }
}

function containsLegacySample(...values: unknown[]): boolean {
  return values.some((value) => LEGACY_SAMPLE_PATTERN.test(
    typeof value === 'string' ? value : JSON.stringify(value ?? ''),
  ));
}

function clearLegacySampleCache(): void {
  try {
    for (const key of [
      'totalclaw:video-studio-draft:v1',
      'totalclaw:video-studio-draft:v2',
      'totalclaw:video-studio-draft:v3',
      'totalclaw:video-studio-draft:v4',
      'totalclaw:video-studio-last-job:v1',
    ]) {
      const value = localStorage.getItem(key);
      if (value && containsLegacySample(value)) localStorage.removeItem(key);
    }
  } catch {
    // 本地存储不可用时继续使用当前通用默认值。
  }
}

clearLegacySampleCache();
/**
 * 演示预置：打开工作台即是填满的状态，不用现场找目录、想项目名、编话题标签。
 *
 * 为什么不直接写进 defaultDraft()：materialDir 是**某一台演示机上的绝对路径**，
 * 话题标签也是这一个项目专用的。写死进默认值，别的客户装完打开就看到一条不存在的
 * 路径和一组与自己毫无关系的标签。所以整套预置只在**该目录确实存在于本机**时才应用
 * （见 onMounted 里的 seedDemoDraft），且只在用户还没填过任何内容时应用。
 */
const DEMO_MATERIAL_DIR = '/Users/mac03/Downloads/0725/明日世界TOMORROW WORLD 短视频大赛-素材/TomorrowCommercialTower1素材/外立面';

/**
 * 写成函数而不是常量：模块级常量在 import 期就求值，语言切换后不会重算，
 * 英文/阿语界面下预填进去的仍是中文。这里在挂载时调用，取当前语言。
 * 品牌名、话题标签、素材路径是专有名词与数据，不过词典。
 */
function demoSeed() {
  return {
  materialDir: DEMO_MATERIAL_DIR,
  projectName: i18nT('明日世界 · 商业塔楼外立面'),
  brandName: 'TOMORROW WORLD',
  topics: '#TOMORROW_WORLD #TOMORROWCOMMERCIALTOWER2',
  brief: [
    i18nT('为「TOMORROW WORLD 明日世界」商业塔楼制作一条 15 秒左右、9:16 竖屏的形象短片，用于抖音、快手、小红书和微信视频号发布。'),
    '',
    i18nT('素材是塔楼外立面、夜景、主入口、街景、零售区与效果图。请按「远景建立 → 近景细节 → 夜景收束」的顺序组织镜头，画面明亮、现代、有节奏感。'),
    '',
    i18nT('0–3 秒：用最具冲击力的塔楼全景开场，字幕点明项目名。'),
    i18nT('3–9 秒：主入口、街景、零售区交替呈现，突出地段与业态。'),
    i18nT('9–15 秒：回到夜景主视觉，以明确的行动引导收尾。'),
    '',
    i18nT('只使用素材中能够核验的事实，不虚构价格、面积、招商政策、开业时间或奖项。'),
    '',
    i18nT('旁白自然、有质感；配乐克制、具有上升感，并对旁白做人声避让。输出成片预览、封面建议及四个平台差异化文案。'),
  ].join('\n'),
  };
}

const draftDefaults = defaultDraft();
const storedDraft = loadStored(DRAFT_KEY, draftDefaults);
const safeStoredDraft = containsLegacySample(storedDraft) ? draftDefaults : storedDraft;
const draft = reactive<StudioDraft>({
  ...safeStoredDraft,
  topics: {
    ...draftDefaults.topics,
    ...(safeStoredDraft.topics || {}),
  },
});
const storedLastJob = loadStored<LastJob>(LAST_JOB_KEY, { conversationId: '', projectName: '' });
// 恢复时**不带成片绑定**：videoPath/expectedVideoPath 要等 onMounted 的磁盘核验通过
// 才回填。否则同步渲染早于异步核验一拍，页面先闪出「本次成片已就绪」——用户看到的
// 就是上一轮（甚至已被删除）的成片当成本次产物。
const lastJob = reactive<LastJob>(
  containsLegacySample(storedLastJob)
    ? { conversationId: '', projectName: '' }
    : { ...storedLastJob, videoPath: '', expectedVideoPath: storedLastJob.expectedVideoPath },
);
/** 待核验的持久化成片路径（onMounted 核验通过才写回 lastJob.videoPath）。 */
const pendingRestoreVideoPath = String(storedLastJob.videoPath || '');
// 旧版本存下来的记录没有 source，按它带的字段推断一次，免得升级后进度面板集体失灵。
if (!lastJob.source) {
  lastJob.source = lastJob.taskId || lastJob.conversationId
    ? 'workflow'
    : lastJob.videoPath ? 'direct' : 'none';
}
const modelKinds = ref<MediaModelKindState[]>([]);
const videoCapabilities = ref<MediaFalCapabilitiesResponse | null>(null);
const videoEstimate = computed(() => estimateVideoProduction(draft.brief, videoCapabilities.value));
const modelLoading = ref(false);
const starting = ref(false);
const previewOpen = ref(false);
const polishingBrief = ref(false);
// 润色要模型吐出整份分镜表（上千字），推理型模型一两分钟很正常。
// 没有计时的话按钮只是个转圈，用户无从判断「还在跑」还是「卡死了」（用户实测反馈）。
const polishElapsedSec = ref(0);
let polishTimer: number | null = null;
const polishElapsedText = computed(() => {
  const s = polishElapsedSec.value;
  if (!s) return '';
  return s >= 60 ? `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}` : `${s}s`;
});
const videoPreviewOpen = ref(false);
const videoPreviewLoading = ref(false);
const videoPreviewSrc = ref('');
const videoPreviewPath = ref('');
const publishConfirmOpen = ref(false);
const publishing = ref(false);
/**
 * 准备发布的阶段提示。生成发布文案要调一次 LLM（几十秒），此前这段界面
 * 完全静默 —— 用户看到的就是「点了没反应/卡住了」。这里把每一步说清楚并带计时。
 */
const publishStage = ref('');
const publishStageSec = ref(0);
let publishStageTimer: number | null = null;
function setPublishStage(text: string): void {
  publishStage.value = text;
  publishStageSec.value = 0;
  if (publishStageTimer) window.clearInterval(publishStageTimer);
  if (!text) { publishStageTimer = null; return; }
  const startedAt = Date.now();
  publishStageTimer = window.setInterval(() => {
    publishStageSec.value = Math.round((Date.now() - startedAt) / 1000);
  }, 1000);
}
const publishStageText = computed(() => {
  if (!publishStage.value) return '';
  const s = publishStageSec.value;
  const used = s >= 60 ? `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}` : `${s}s`;
  return s > 2 ? `${publishStage.value} ${used}` : publishStage.value;
});
const publishReceipt = ref('');
/** 本页发布任务归属（主进程按它过滤，只在本页展示） */
const PUBLISH_OWNER_PATH = '/video-studio';
/** 刚准备的那条发布任务：发布预览切过去并滚到可见处 */
const publishRunFocusId = ref('');
/** 发布预览里的分平台结果同步成按钮旁的回执摘要（「再次发布」也据此出现） */
function onPublishRunChange(run: PublishRun | null): void {
  // 预览里改过并确认（或待确认时停止保留）的正文写回快照：「准备发布 / 再次发布」复用的是快照里的正文
  const previous = loadLastPublishInput();
  if (run && previous && previous.videoPath === run.input.videoPath && previous.caption !== run.input.caption) {
    try { localStorage.setItem(LAST_PUBLISH_INPUT_KEY, JSON.stringify({ ...previous, caption: run.input.caption })); } catch { /* 本地存储不可用不影响发布 */ }
  }
  const settled = run && ['completed', 'partial', 'needs_review', 'failed'].includes(run.status);
  const done = run?.platforms.filter((item) => item.state === 'published') || [];
  // 预览里可能是别的成片的发布记录：回执只给当前这条成片，否则按钮旁的结果和「再次发布」都对不上片子
  if (!run || run.input.videoPath !== lastJob.videoPath || !settled || (!done.length && run.status !== 'needs_review')) { publishReceipt.value = ''; return; }
  const names = (state: string) => run.platforms.filter((item) => item.state === state)
    .map((item) => publishPlatforms().find((p) => p.id === item.id)?.label || item.id);
  publishReceipt.value = describePublishReceipt({
    platformCount: done.length,
    unconfirmedCount: names('unconfirmed').length,
    failedCount: names('failed').length,
    unconfirmedPlatforms: names('unconfirmed'),
    failedPlatforms: names('failed'),
  });
}
const publishNativeBrowserLock = createNativeBrowserModalLock();
// 进度面板的运行态（jobRunStatus / jobNodeStates / jobProgressNodes / jobCurrentNodeName …）
// 在 composables/videoStudioRunState.ts，模块级共享：换页回来仍是正在跑的那份。
/** 图片成片直连路径的三步进度，对应脚本自己打出的 scan / stage / render。 */
const slideshowProgressNodes = [
  { id: 'scan', phase: 0, label: i18nT('扫描素材') },
  { id: 'stage', phase: 1, label: i18nT('整理素材') },
  { id: 'render', phase: 2, label: i18nT('合成成片') },
];
/** F2：开了配音/配乐时多一步「配音与配乐」（主进程 audio 阶段：TTS → 取/合成 BGM → 混音）。 */
const slideshowAudioNode = { id: 'audio', phase: 3, label: i18nT('配音与配乐') };
/**
 * Seedance 直连生产线的四步进度（用户指令：视频生成不经 agent 工作流，
 * 优化提示词 → 直调 Seedance → 合成 → 确定性质检；只有发布保留工作流）。
 * 质检与缺陷镜头重生成在 make_video_seedance.py 里确定性完成，不用 agent。
 */
const seedanceProgressNodes = [
  { id: 'scan', phase: 0, label: i18nT('扫描素材') },
  { id: 'shots', phase: 1, label: i18nT('专业分镜提示词') },
  { id: 'render', phase: 2, label: i18nT('Seedance 逐镜头生成 + 拼接合成') },
  { id: 'qc', phase: 3, label: i18nT('质检与修复') },
];
/**
 * 制作计时（用户要求：要预估时间和已用时间）。
 * 预估基于实测：单镜头 5s 片在 fast 档 ≈ 提交 36s + 出片 ~4 分钟 + 后期合成 ~1.5 分钟。
 * 逐镜头串行提交，所以总时长 ≈ 镜头数 × 单镜头耗时 + 合成固定开销。
 * 这些常量来自 2026-08-06 的真机跑测（见 seedancePipeline 护栏说明），不是拍脑袋。
 */
/**
 * 成片耗时预估 —— 2026-08-07 按真实 run 日志重新标定。
 *
 * 旧模型是 `镜头数 × 260s + 95s`，跟本文件调用点自己写的
 * 「一次提交全部 scene，服务端并行，总耗时≈最慢一条」直接矛盾。
 *
 * 实测（fast 档 720p / 5 秒镜头，取 ads-slideshow/run-*.log 里三次成功运行）：
 *     3 镜头 → 161s      3 镜头 → 169s      6 镜头 → 204s
 * 三次的**生成阶段都是 139s**，与镜头数无关；多出来的只是本地拼接/BGM/字幕。
 *
 * 旧模型给 6 镜头报「预计还需 27:35」，实际 3:24 —— 差 8 倍。用户盯着那个数字，
 * 当然会问「动态生成怎么这么久」。真正慢的不是生成，是这条预估。
 *
 * 标定成略偏保守（3 镜头 214s vs 实测 165s、6 镜头 268s vs 实测 204s）：
 * 估高一点只是提前完成，估低了用户会以为卡死。
 */
const SEEDANCE_GENERATION_SECONDS = 160; // 服务端并行，与镜头数无关（实测 139s + 提交/下载开销）
const SEEDANCE_ASSEMBLY_PER_SHOT = 18;   // 本地 xfade 拼接 + BGM + 字幕，随镜头数线性
/**
 * standard 档**没有实测数据**（默认是 fast）。官方口径是更慢更贵、单镜头分钟级排队，
 * 这里保守放大 3 倍占位。宁可估高，也不让用户在真的要等很久时以为程序卡死。
 * 一旦有了 standard 档的 run 日志，按同样方法重新标定。
 */
const SEEDANCE_STANDARD_FACTOR = 3;

/** 预估总秒数：生成（并行，恒定）+ 本地合成（随镜头数线性）。 */
function estimateSeedanceSeconds(shotCount: number, tier: string): number {
  const factor = tier === 'standard' ? SEEDANCE_STANDARD_FACTOR : 1;
  return SEEDANCE_GENERATION_SECONDS * factor + shotCount * SEEDANCE_ASSEMBLY_PER_SHOT;
}
function formatDuration(sec: number): string {
  const s = Math.max(0, Math.round(sec));
  const m = Math.floor(s / 60);
  return m > 0 ? `${m}:${String(s % 60).padStart(2, '0')}` : `${s}s`;
}
/**
 * 直连成片的看门狗：秒表从 jobStartedAt（管线真实开始时刻，模块级）走，换 tab / 重挂载不归零；
 * 跑过 max(预计×3, 预计+5min) 或 10 分钟（视频类无进度上限）没收到任何进度就判「可能已超时」。
 * 进度时刻与「继续等待」时刻都落在模块级运行态里，新实例判得和老实例一样。
 * 只管直连管线（lastJob.source==='direct'）：发布工作流有自己的事件流与取消方式。
 */
const jobWatchdog = useStepWatchdog({
  running: () => jobRunStatus.value === 'running' && !!jobRunMode.value && lastJob.source === 'direct',
  startedAt: () => jobStartedAt.value || null,
  estimateMs: () => (jobEstimateSec.value > 0 ? jobEstimateSec.value * 1000 : null),
  kind: 'video',
  lastProgressAt: () => jobProgressAt.value || null,
  waitExtendedAt: () => jobWaitExtendedAt.value || null,
  onHeartbeat: (at) => { jobProgressAt.value = at; },
  onKeepWaiting: (at) => { jobWaitExtendedAt.value = at; },
});
/**
 * 已用时间；超过预估后如实显示「已超预估」而不是倒计到负数。
 * 进度还在到就把这个事实摆出来（「N 秒前有进度」）：用户要能分清「慢」和「死」。
 */
const jobTimeText = computed(() => {
  if (jobWatchdog.verdict.value === 'idle') return '';
  const elapsed = jobWatchdog.elapsedSec.value;
  const used = formatDuration(elapsed);
  if (jobWatchdog.suspect.value) return i18nT('已用 {p0} · 可能已超时', { p0: used });
  const since = jobWatchdog.sinceHeartbeatSec.value;
  const pulse = since != null && since >= 5 && since < 120 ? i18nT('（{p0} 秒前有进度）', { p0: since }) : '';
  if (!jobEstimateSec.value) return i18nT('已用 {p0}', { p0: used }) + pulse;
  const left = jobEstimateSec.value - elapsed;
  return left > 0
    ? i18nT('已用 {p0} · 预计还需 {p1}', { p0: used, p1: formatDuration(left) })
    : i18nT('已用 {p0} · 已超预估，仍在生成', { p0: used }) + pulse;
});

/** 「停止」正在等主进程收掉子进程 */
const stopping = ref(false);
/** 「重新生成」正在取消旧任务 → 再起新任务的那一小段 */
const jobRestarting = ref(false);
/** 本实例亲手起的直连管线还没收尾（结果绑定由它自己写；别的实例只读模块态） */
const ownsDirectRun = ref(false);

// 上个进程 / 上次页面留下的「运行中」标记：本进程并没有在跑 → 标「已中断」
adoptInterruptedDirectRun();
// 新实例挂上来：模块态空着（首次 / 测试归零）才摆默认节点表，否则沿用正在跑 / 刚结束的那份
if (!jobProgressNodes.value.length) {
  jobProgressNodes.value = jobInterrupted.value
    ? [...(jobRunMode.value === 'seedance' ? seedanceProgressNodes : slideshowProgressNodes)]
    : [...defaultJobProgressNodes];
}
if (!jobCurrentNodeName.value) jobCurrentNodeName.value = i18nT('尚未启动制作任务');
const jobRunId = ref('');

/** 本次运行卡住的人工确认（来自 run.pendingHumanConfirm 或实时事件）。 */
const jobPendingConfirm = ref<{ nodeId: string; nodeName?: string; question?: string; detail?: string } | null>(null);
const confirmSubmitting = ref(false);
type PlatformLoginState = 'unknown' | 'checking' | 'ready' | 'absent';
const platformLoginState = ref<Record<string, PlatformLoginState>>({});
/** 勾选=本次发布该平台。默认全选；检测到未登录会自动取消勾选，用户仍可手动勾回。 */
const platformPublishPicked = ref<Record<string, boolean>>({});
let unsubscribeConversationUpdated: (() => void) | null = null;
let unsubscribeTaskRun: (() => void) | null = null;
let jobProgressPoll: number | null = null;

watch(
  draft,
  (value) => {
    try { localStorage.setItem(DRAFT_KEY, JSON.stringify(value)); } catch { /* 本地存储不可用时不阻断 */ }
  },
  { deep: true },
);

const selectedPlatformText = computed(() =>
  platforms.filter((item) => draft.platforms.includes(item.id)).map((item) => item.label).join(i18nT('、')),
);
const selectedPlatforms = computed(() =>
  platforms.filter((item) => draft.platforms.includes(item.id)),
);
/**
 * 机器可读的平台 ID 串（douyin,kuaishou,...）。
 * 发布/登录链路（video-publish:*、skill 上传脚本）只认 ID —— 把中文标签串
 * （selectedPlatformText）传给它们是踩过的 bug：勾选与实际打开的平台对不上。
 */
const selectedPlatformIds = computed(() =>
  selectedPlatforms.value.map((item) => item.id).join(','),
);
const productionModeLabel = computed(() =>
  productionModes.find((item) => item.id === draft.productionMode)?.label || i18nT('AI 自动判断'),
);
const musicMoodLabel = computed(() =>
  musicMoods.find((item) => item.id === draft.bgmMood)?.label || i18nT('AI 按内容自动选择'),
);
const canPreview = computed(() => !!draft.brief.trim() && draft.platforms.length > 0);
// 两条制作路径都硬依赖素材目录（成片就是拿它生成的）。不在这里拦住，
// 按钮看着可点，点下去必然在 runSlideshowDirect / startProduction 里抛「请先选择素材目录」。
const canStart = computed(() => canPreview.value && !!draft.materialDir.trim());
const hasPreviewVideo = computed(() => !!lastJob.videoPath);
/**
 * 发布是否已完成。
 *
 * 这件事以前是拿 jobRunStatus === 'success' 判的，可那个状态说的是「制作完成」。
 * 直连成片跑完就是 success，于是发布按钮当场变成「已完成发布」并禁用——
 * 片子刚出来就再也发不出去。发布完成的唯一凭据是发布工作流回写的回执。
 */
const publishDone = computed(() => !!publishReceipt.value);
const PUBLISH_RECEIPT_KEY = 'totalclaw:publish-workflow-result:video-studio';
/**
 * 上一次发布的完整入参（平台 / 话题 / 文案 / 成片）。
 * 「再次发布」要能原样重来：补发平台、上一轮部分平台失败重试，都不该让用户重填，
 * 更不该因为重新调 LLM 而换一版文案（同一条片子发出去两种文案很怪）。
 */
const LAST_PUBLISH_INPUT_KEY = 'totalclaw:video-studio-last-publish-input:v1';
interface LastPublishInput {
  videoPath: string;
  platformIds: string[];
  topics: Record<string, string>;
  caption: string;
  projectName: string;
  savedAt: number;
}
function loadLastPublishInput(): LastPublishInput | null {
  try {
    const raw = JSON.parse(localStorage.getItem(LAST_PUBLISH_INPUT_KEY) || 'null');
    return raw && typeof raw.caption === 'string' && Array.isArray(raw.platformIds) ? raw as LastPublishInput : null;
  } catch { return null; }
}
/** 新片开始制作就作废上一条回执，否则旧回执会一直把发布按钮按成「已完成发布」。 */
function clearPublishReceipt(): void {
  publishReceipt.value = '';
  try { localStorage.removeItem(PUBLISH_RECEIPT_KEY); } catch { /* 本地存储不可用时忽略 */ }
}
const publishApprovalRequest = computed<HumanConfirmCardRequest>(() => ({
  key: `video-publish-${lastJob.projectName || 'showcase'}`,
  runId: jobRunId.value || 'VIDEO-SHOWCASE',
  nodeId: 'publish_approval',
  nodeName: i18nT('发布前人工确认'),
  question: i18nT('是否确认将当前成片发布到所选平台？'),
  detail: i18nT('成片、平台文案、话题与发布范围已经准备完成。确认后将执行分平台发布，并记录每个平台的执行回执。'),
  requireComment: false,
  source: 'human_confirm_node',
  approveLabel: i18nT('确认并发布'),
  rejectLabel: i18nT('退回修改'),
  approveEffect: i18nT('按当前版本向所选平台执行发布，并写入发布时间与平台回执。'),
  rejectEffect: i18nT('保留当前成片并返回修改，不执行发布。'),
}));
const publishContextLabels: Record<string, string> = {
  video: i18nT('待发布成片'),
  platforms: i18nT('目标平台'),
  topics: i18nT('各平台话题'),
  policy: i18nT('执行策略'),
};
const publishContextData = computed<Record<string, unknown>>(() => ({
  video: lastJob.videoPath || i18nT('现有演示成片'),
  platforms: selectedPlatforms.value.map((item) => item.label),
  topics: Object.fromEntries(
    selectedPlatforms.value.map((item) => [
      item.label,
      normalizeTopics(draft.topics[item.id] || ''),
    ]),
  ),
  policy: i18nT('逐平台执行；任何平台失败都会保留原始回执并停止该平台重试。'),
}));
const publishContextPreview = computed(() =>
  `${lastJob.projectName || i18nT('短视频演示成片')}\n${selectedPlatformText.value}\n${publishReceipt.value}`);
const jobCompletedCount = computed(() => {
  if (jobRunStatus.value === 'success') return jobProgressNodes.value.length;
  return jobProgressNodes.value.filter((item) => jobNodeStates.value[item.id] === 'done').length;
});
const jobProgressPercent = computed(() =>
  jobProgressNodes.value.length
    ? Math.round((jobCompletedCount.value / jobProgressNodes.value.length) * 100)
    : 0,
);
/**
 * 终态（取消/失败）不再摆进度条和百分比。
 * 那些数字是真的——那条 run 确实停在第 N 步——但和一条走了 88% 的进度条摆在一起，
 * 看着像有任务卡在那儿，实际上它早就不动了。
 */
const jobRunTerminated = computed(() => ['cancelled', 'failed'].includes(jobRunStatus.value));

/**
 * 进度面板下方的告警卡：失败 / 可能已超时 / 上次运行已中断，三选一。
 * 只对直连管线出：工作流来源的失败由工作流自己的入口处理，这里的「重新生成」对它不对。
 */
const jobRunAlert = computed<{ state: 'failed' | 'suspect' | 'interrupted'; message: string } | null>(() => {
  if (jobInterrupted.value) return { state: 'interrupted', message: '' };
  if (lastJob.source !== 'direct' || !jobRunMode.value) return null;
  if (jobRunStatus.value === 'running') {
    return jobWatchdog.suspect.value ? { state: 'suspect', message: '' } : null;
  }
  if (jobRunStatus.value === 'failed') {
    return { state: 'failed', message: jobCurrentNodeName.value || i18nT('成片失败') };
  }
  return null;
});
/** 直连管线正在跑（本实例起的或别的实例起的都算）：可停止 */
const jobDirectRunning = computed(() => jobRunStatus.value === 'running' && !!jobRunMode.value && lastJob.source === 'direct');

const jobProgressTitle = computed(() => {
  if (jobInterrupted.value) return i18nT('上次成片已中断');
  if (jobRunStatus.value === 'running') return i18nT('视频制作进行中');
  if (jobRunStatus.value === 'waiting_human') return i18nT('等待人工审核');
  if (jobRunStatus.value === 'success') return i18nT('视频制作已完成');
  if (jobRunStatus.value === 'failed') return i18nT('视频制作遇到问题');
  if (jobRunStatus.value === 'cancelled') {
    return hasPreviewVideo.value ? i18nT('上次制作已取消（成片仍可用）') : i18nT('视频制作已取消');
  }
  if (lastJob.taskId || lastJob.conversationId) return i18nT('制作任务等待执行');
  return i18nT('尚未创建制作任务');
});

function flowStepState(phase: number): 'pending' | 'active' | 'done' {
  const nodes = jobProgressNodes.value.filter((item) => item.phase === phase);
  if (!nodes.length) {
    // 「素材」阶段(0)已经没有工作流节点了——扫描在任务启动前就由 scan_materials.py 跑完
    // （实测 0.37 秒，原来是个 110 秒的 llm_call 节点）。这里若还判 pending，
    // 界面会显示「等待执行」，看起来像素材被跳过了，其实是早就读完了。
    if (phase === 0 && jobRunStatus.value !== 'idle') return 'done';
    return hasPreviewVideo.value && phase < 2 ? 'done' : 'pending';
  }
  if (jobRunStatus.value === 'success' || nodes.every((item) => jobNodeStates.value[item.id] === 'done')) {
    return 'done';
  }
  // 终态（取消/失败）不该再有阶段在转圈：被中断的 run 会把某个节点永远留在
  // running 状态，这里若还判 active，那个 loading 图标就再也停不下来。
  if (!jobRunTerminated.value
    && nodes.some((item) => jobNodeStates.value[item.id] === 'running' || jobNodeStates.value[item.id] === 'failed')) {
    return 'active';
  }
  const firstIncompletePhase = flowSteps.findIndex((_, index) =>
    jobProgressNodes.value.some((item) => item.phase === index && jobNodeStates.value[item.id] !== 'done'),
  );
  return jobRunStatus.value === 'running' && firstIncompletePhase === phase ? 'active' : 'pending';
}

function flowStepDetail(phase: number): string {
  const nodes = jobProgressNodes.value.filter((item) => item.phase === phase);
  if (!nodes.length && phase === 0 && jobRunStatus.value !== 'idle') return i18nT('启动前已扫描完成');
  if (!nodes.length && hasPreviewVideo.value && phase < 2) return i18nT('成片已生成');
  const active = nodes.find((item) =>
    jobNodeStates.value[item.id] === 'running' || jobNodeStates.value[item.id] === 'failed',
  );
  if (active) return active.label;
  if (flowStepState(phase) === 'done') return i18nT('已完成');
  if (flowStepState(phase) === 'active') return i18nT('正在准备');
  return i18nT('等待执行');
}

function statusForTts(): { tone: StatusTone; label: string; detail: string } {
  const kind = modelKinds.value.find((item) => item.kind === 'tts');
  if (!kind) {
    return { tone: 'missing', label: i18nT('待检查'), detail: i18nT('登录后可读取当前 TTS 配置') };
  }
  const active = kind.providers.find((item) => item.id === kind.activeProvider);
  if (active?.configured) {
    return {
      tone: 'ready',
      label: i18nT('已就绪'),
      detail: i18nT('当前默认：{p0}', { p0: active.label }),
    };
  }
  const configured = kind.providers.filter((item) => item.configured);
  // 同上：唯一一个已配置的引擎就是默认，不必再让用户确认一次。
  if (configured.length === 1) {
    return { tone: 'ready', label: i18nT('已就绪'), detail: i18nT('当前默认：{p0}', { p0: configured[0].label }) };
  }
  if (configured.length > 1) {
    return {
      tone: 'partial',
      label: i18nT('可用但未设默认'),
      detail: i18nT('已接入 {p0}，建议设为默认', { p0: configured[0].label }),
    };
  }
  return { tone: 'missing', label: i18nT('未配置'), detail: i18nT('配置一个配音引擎后再开始制作') };
}

function statusForSeedance(): { tone: StatusTone; label: string; detail: string } {
  // 与 globalAdsRun.slideshow 的方案密钥解析一致，不能用聊天通道或 ARK 的 Key 判可用。
  if (!videoCapabilities.value) return { tone: 'missing', label: i18nT('待检查'), detail: i18nT('尚未读取动态视频通道状态') };
  const { keys, quota } = videoCapabilities.value;
  if (quota?.dailyLimit != null && quota.usedToday >= quota.dailyLimit) {
    return { tone: 'missing', label: i18nT('额度已用完'), detail: i18nT('动态视频通道今日额度已用完，请联系管理员或等待额度恢复') };
  }
  return keys.primary || keys.backup
    ? { tone: 'ready', label: i18nT('已就绪'), detail: i18nT('动态视频走 fal 通道，按秒计费；文字策划仍使用当前聊天模型') }
    : { tone: 'missing', label: i18nT('未配置'), detail: i18nT('请配置 fal 密钥或联系管理员开通此方案') };
}

/**
 * 客户端配置的 Seedance 档位（fast=720p 出片快 / standard=1080p 更精细）。
 * 此前主进程写死 standard，单镜头分钟级排队、界面又无进度反馈，表现为「一直转圈」。
 * 现在跟随「AI 模型 → 视频生成」里配的模型名：名字里带 fast/lite 判为 fast 档，
 * 明确带 pro/standard 判为 standard，读不到就按 fast（更快，符合默认预期）。
 */
const seedanceQuality = computed<'fast' | 'standard'>(() => {
  const kind = modelKinds.value.find((item) => item.kind === 'video');
  const name = String(kind?.activeModel || '').toLowerCase();
  if (/\b(standard|pro)\b/.test(name) || name.includes('seedance-2-0-2')) return 'standard';
  return 'fast';
});

const ttsStatus = computed(statusForTts);
const seedanceStatus = computed(statusForSeedance);

/**
 * Seedance 要火山方舟 ARK API Key 才能用。没配就把该模式置灰，
 * 免得用户选了它、跑到一半才在制作节点中断。
 * modelLoading 期间状态还没读回来（tone 会短暂是 missing），此时不置灰，避免闪烁。
 */
const seedanceAvailable = computed(() => modelLoading.value || seedanceStatus.value.tone !== 'missing');

/** 用户是否亲手点过成片方式：点过就以他的选择为准，自动默认不再插手。 */
const productionModeTouched = ref(false);
function pickProductionMode(id: ProductionMode): void {
  productionModeTouched.value = true;
  draft.productionMode = id;
}

// 已选中 Seedance 但读回来发现没配置 → 落回默认的拼接，不把用户卡在不可用的模式上。
watch(seedanceAvailable, (ok) => {
  if (!ok && draft.productionMode === 'seedance') draft.productionMode = 'slideshow';
});

// 反向：配了 ARK Key 就默认选 Seedance（动态视频是主推路径，图片成片只是无 key 时的兜底）。
// 初值只能写 'slideshow' —— 模型状态是异步读回来的，挂载时还不知道配没配。
// 只在「用户没点过」且「当前仍停在那个兜底默认」时上调，绝不覆盖用户的选择。
watch(
  () => seedanceStatus.value.tone,
  (tone) => {
    if (modelLoading.value || tone === 'missing') return;
    if (productionModeTouched.value) return;
    if (draft.productionMode !== 'slideshow') return;
    draft.productionMode = 'seedance';
  },
  { immediate: true },
);

/** MEDIA_MODEL_CHANGED 退订函数（本视图会反复挂载，必须接住，见 BrowseView 那次泄漏） */
let unsubMediaModel: (() => void) | null = null;
onUnmounted(() => { try { unsubMediaModel?.(); } catch { /* 已退订 */ } unsubMediaModel = null; });

async function loadModelState(): Promise<void> {
  modelLoading.value = true;
  const api = (window as any).electronAPI;
  try {
    const [models, fal] = await Promise.allSettled([
      api?.mediaModel?.get?.(),
      api?.mediaFal?.capabilities?.({ solutionId: 'workbench-global-ads' }),
    ]);
    const result = models.status === 'fulfilled' ? models.value : null;
    modelKinds.value = Array.isArray(result?.kinds) ? result.kinds : [];
    videoCapabilities.value = fal.status === 'fulfilled' ? fal.value || null : null;
  } catch {
    modelKinds.value = [];
  } finally {
    modelLoading.value = false;
  }
}

function openMediaSettings(kind: 'tts' | 'video'): void {
  router.push({
    path: '/settings',
    query: {
      section: 'ai-models',
      media: kind,
      ...(kind === 'video' ? { provider: 'fal' } : {}),
    },
  });
}

async function pickMaterialFolder(): Promise<void> {
  try {
    const path = await (window as any).electronAPI?.solution?.pickFolder?.();
    if (path) draft.materialDir = path;
  } catch (error) {
    notif.fromException(i18nT('选择素材文件夹失败'), error);
  }
}

function togglePlatform(id: PlatformId): void {
  const index = draft.platforms.indexOf(id);
  if (index >= 0) draft.platforms.splice(index, 1);
  else draft.platforms.push(id);
}

function normalizeTopics(value: string): string {
  return value
    .split(/[\s,，]+/)
    .map((topic) => topic.trim())
    .filter(Boolean)
    .map((topic) => topic.startsWith('#') ? topic : `#${topic}`)
    .join(' ');
}

function platformTopicLines(): string {
  return selectedPlatforms.value
    .map((platform) => `${platform.label}：${normalizeTopics(draft.topics[platform.id] || '') || i18nT('未指定，可在发布前补充')}`)
    .join('\n');
}

async function polishVideoPrompt(): Promise<void> {
  const source = draft.brief.trim();
  if (!source || polishingBrief.value) return;
  polishingBrief.value = true;
  polishElapsedSec.value = 0;
  const polishStartedAt = Date.now();
  if (polishTimer) window.clearInterval(polishTimer);
  polishTimer = window.setInterval(() => {
    polishElapsedSec.value = Math.round((Date.now() - polishStartedAt) / 1000);
  }, 1000);
  try {
    // 走主进程 LLM_ONESHOT（引擎 oneshot，与聊天同链路）。此前直调 qiye-api
    // chat-completions 并按默认大脑 provider 名匹配 adapter：真机默认大脑是内置
    // `totalclaw` 通道（不在 adapter 列表），匹配不到就回退列表首个 provider（没配 key）
    // → 必然 400/503 →「请求内容有误」。聊天能用，润色就必须能用。
    const api = (window as any).electronAPI;
    if (!api?.llmOneshot) throw new Error(i18nT('默认 LLM 服务尚未就绪'));
    const result = await api.llmOneshot({
      // 润色标准与 utils/seedanceShots 的十要素规范同源：产出不是散文，
      // 而是「全局参数段 + 逐镜头分镜表」的专业结构（用户实测：粗提示词直接喂
      // Seedance 只会出平移废片，每一轮生成都必须值回票价）。
      systemPrompt: [
        i18nT('你是专业短视频导演和 Seedance 视频提示词编辑。'),
        i18nT('请把用户提供的中文视频提示词升级成结构化的专业制作指令，格式固定为两段：'),
        i18nT('【全局】画幅、总时长与镜头数、全片色调与氛围关键词、风格参照、主体一致性锚点（主体外观/色板的一句描述，供各镜头原句复用）。'),
        i18nT('【分镜】逐镜头列出：镜头序号与时长（单镜头 5-10 秒整数）；景别（远/全/中/近/特写）；机位与运镜+速度（推拉摇移跟升降/环绕，配速度词）；主体+具体动作动词（禁止「展示产品」这类空话）；环境与光线（时段/光源方向/质感）；构图（画面下 1/4 留字幕安全区）；镜头内动作起止（起幅/落幅）；与上一镜的衔接意图；末尾负向提示（无文字水印、无畸变人脸手指、无抖动闪烁、不要淡入淡出黑场）。'),
        i18nT('要求：保留用户给出的全部事实、产品名、时长和时间轴；日夜时序单调渐进；结构清晰、表达紧凑。'),
        i18nT('绝对禁止虚构价格、门店地址、优惠规则、产品功效或用户未提供的事实。'),
        i18nT('只输出升级后的完整制作指令，不要解释，不要使用 Markdown 代码块。'),
      ].join('\n'),
      prompt: i18nT("成片方式：{p0}\n画幅：{p1}\n当前视频提示词：\n{source}", { p0: productionModeLabel.value, p1: draft.aspectRatio, source }),
      timeoutMs: 300_000,
      // 纯补全：润色是一句进一句出的文本改写，绝不允许 worker 带工具把 brief 当任务执行
      plainCompletion: true,
    });
    const polished = String(result?.text || '').trim();
    if (!polished) throw new Error(i18nT('LLM 未返回可用的润色结果'));
    draft.brief = polished.slice(0, 3000);
    notif.success(i18nT('视频提示词已由 AI 润色并回填'));
  } catch (error) {
    notif.fromException(i18nT('视频提示词润色失败'), error);
  } finally {
    if (polishTimer) { window.clearInterval(polishTimer); polishTimer = null; }
    polishElapsedSec.value = 0;
    polishingBrief.value = false;
  }
}

function buildProductionPrompt(outputPath?: string): string {
  const platformNames = selectedPlatformText.value;
  const platformTopics = platformTopicLines();
  const ttsKind = modelKinds.value.find((item) => item.kind === 'tts');
  const defaultTts = ttsKind?.activeProvider
    ? `${ttsKind.activeProvider}${ttsKind.activeModel ? ` / ${ttsKind.activeModel}` : ''}`
    : i18nT('未读取到明确默认项');
  const voiceInstruction = draft.voiceover
    ? i18nT('需要 TTS 旁白。旁白语气：{p0}。使用 AI 模型配置中的默认 TTS（{defaultTts}）；如果默认声线语言与文案不匹配，同一 provider 内改用对应语言的女声。', {
        p0: draft.voiceStyle.trim() || i18nT('请根据内容自动选择自然、适合短视频的表达'),
        defaultTts,
      })
    : i18nT('不生成 TTS 旁白，保留素材原声并按需配乐。');
  const modeInstruction: Record<ProductionMode, string> = {
    smart: i18nT('分析素材后进行本地图片成片；需要生成动态镜头时请选择 fal 动态视频。'),
    // Seedance 自带音轨常混入人声/念白，和我们自己的旁白叠在一起会串味，
    // 所以生成阶段明确只要环境音与配乐，人声一律由后续 TTS 统一合成。
    seedance: i18nT('使用 fal 视频通道按分镜提示词生成动态镜头，再进行本地拼接与配音；生成费用按秒计算。'),
    slideshow: i18nT('将图片制作成 {p0} 视频，使用有节奏的运镜、转场、字幕和封面。', { p0: draft.aspectRatio }),
  };

  return [
    i18nT('请使用内置 totalclaw-video-studio skill 执行下面这条短视频制作任务。'),
    '',
    i18nT('【项目】{p0}', { p0: draft.projectName.trim() || draft.brandName.trim() || i18nT('未命名短视频项目') }),
    i18nT('【品牌/门店】{p0}', { p0: draft.brandName.trim() || i18nT('未填写') }),
    i18nT('【素材目录】{p0}', { p0: draft.materialDir.trim() }),
    i18nT("【内容目标与事实】\n{p0}", { p0: draft.brief.trim() }),
    i18nT('【成片方式】{p0}', { p0: modeInstruction[draft.productionMode] }),
    i18nT('【成片比例】{p0}', { p0: draft.aspectRatio }),
    i18nT('【配音】{voiceInstruction}', { voiceInstruction }),
    i18nT('【配乐】{p0}', { p0: draft.bgmMood === 'auto' ? i18nT('按内容和镜头节奏自动选择') : musicMoodLabel.value }),
    // 标签给人看，ID 给发布/登录工具用；发布范围以 ID 清单为准，不允许 agent 自行扩平台。
    i18nT('【目标平台】{platformNames}', { platformNames: `${platformNames}（平台 ID，发布工具只认它们：${selectedPlatformIds.value}）` }),
    i18nT("【各平台发布话题】\n{platformTopics}", { platformTopics }),
    ...(outputPath ? [i18nT('【本地最终成片】{outputPath}', { outputPath })] : []),
    '',
    i18nT('执行要求：'),
    i18nT('1. 先检查素材和事实信息；缺少会影响真实性的关键信息时，只追问缺失项，不得猜价格、地点、活动规则。'),
    i18nT('2. 输出 {p0} 成片，并为每个平台分别生成标题、正文、标签和封面建议，遵守各平台长度与格式差异；对应平台文案必须带上上方配置的话题，发布前允许用户单独调整。', { p0: draft.aspectRatio }),
    // 之前写死「抖音、快手、小红书、微信视频号…四平台」——只勾一个平台也会被 agent 理解成四个全发。
    i18nT('3. {p0} 统一走 totalclaw-video-studio 的受控发布流程；只处理上方目标平台清单里的平台，完成各平台发布前校验后，进入带详情的人工确认节点。', { p0: platformNames }),
    i18nT('4. 先生成可播放成片，把产物路径、平台文案和风险检查结果写入任务记录。{p0}成片完成后必须额外单独输出一行：TOTALCLAW_VIDEO_PREVIEW=成片绝对路径，供视频工作台自动识别。', { p0: outputPath ? i18nT('最终成片必须写入指定本地路径：{outputPath}。', { outputPath }) : '' }),
    i18nT('5. 公开发布是不可逆动作：必须等我在对话中明确确认后再执行；遇验证码、风控或结果不明确立即暂停，不自动重试。'),
    '',
    // 初始提示词也必须按专业分镜标准写（用户指令）：与 skill 的 references/seedance-prompting.md 同源。
    i18nT('镜头与成片工艺标准（必须遵守）：'),
    i18nT('a. 分镜逐镜头写满十要素：景别、机位与运镜+速度、主体+具体动作动词（禁止「展示产品」空话）、环境与光线、色调氛围（全片统一）、构图（画面下 1/4 留字幕安全区）、镜头内动作起止、与上一镜衔接、主体一致性锚点原句复用、末尾负向提示（无文字水印/无畸变人脸手指/无抖动闪烁）。Seedance 分镜写法以 skill 的 references/seedance-prompting.md 为准。'),
    i18nT('b. 转场用一条 xfade 链（0.3-0.5 秒），严禁每段各自黑场淡入淡出再拼接；生成端不要自带淡入淡出。'),
    i18nT('c. 字幕用 burn_subtitles.py 默认字号与安全区；响度走 mix_audio.py 内置的 -14 LUFS 归一；成片必须 yuv420p。'),
    i18nT('d. 首帧即封面（满画面有信息量）；结尾完整淡出或干净硬收；日夜时序单调渐进。'),
  ].join('\n');
}

const promptPreview = computed(() => buildProductionPrompt());

/**
 * 分镜专用的精简需求块（Seedance 直连第 ② 步）。
 *
 * 与 buildProductionPrompt 刻意分家：那份是给 agent 的**任务执行指令**（含发布确认、
 * skill 调用、产物路径回显等），塞进分镜调用会把模型推去「执行任务」而不是「产出 JSON」。
 * 这里只给创作所需事实 + 可选图 + 时长与画幅约束，最后一行重申 JSON 契约。
 */
function buildShotListRequest(project: string, images: string[]): string {
  const aspect = draft.aspectRatio || '9:16';
  const brand = draft.brandName.trim();
  const brief = draft.brief.trim();
  const bgm = draft.bgmMood === 'auto' ? i18nT('按内容与镜头节奏自动选择') : musicMoodLabel.value;
  return [
    i18nT('项目：{p0}', { p0: project }),
    ...(brand ? [i18nT('品牌/门店：{p0}', { p0: brand })] : []),
    i18nT('画幅：{p0}（构图请为画面下 1/4 的字幕留安全区）。', { p0: aspect }),
    i18nT('配乐情绪：{p0}。生成端只要环境音与配乐，不要任何人声念白（旁白后期统一合成）。', { p0: bgm }),
    '',
    i18nT('内容目标与事实（只依据这里的信息，不得虚构价格、地址、优惠或功效）：'),
    brief || i18nT('（未填写具体要求：请依据素材本身的画面内容组织镜头）'),
    '',
    i18nT('可用首帧参考图（reference_image 只能原样从下面这份清单里选）：'),
    ...images.slice(0, 8).map((path, index) => `${index + 1}. ${path}`),
    '',
    // 契约放最后：模型对末尾指令的服从度最高，前面写多少创作要求都不该动摇输出格式。
    // 提示词长度必须写进契约：Seedance 的生成参数（--rs/--dur/--rt）是**拼在提示词
    // 尾部的文本 flag**，没有独立字段。提示词越长，这些参数离得越远、被稀释得越厉害；
    // 火山方舟官方也建议 50–200 字，超长反而削弱指令服从度。不说上限，模型会越写越长。
    '',
    /**
     * 分幕方法论必须显式给出（2026-08-07 用户问「怎么分解的一幕一幕的」）。
     *
     * 原来这份请求**只给素材清单和 JSON 格式**，对「分几幕、每幕承担什么叙事职能、
     * 幕与幕怎么承接」只字未提，还留了句悬空的要素引用 —— 那份清单写在
     * references/seedance-prompting.md 里，模型根本读不到。于是分镜数量和结构
     * 全靠自由发挥，复杂需求下尤其飘。
     *
     * 这里把 skill 参考文档里已经打磨过的方法论压缩成可执行指令：叙事骨架定「分几幕」，
     * 十要素定「每幕怎么写」，一致性锚点与转场意图定「幕之间怎么接」。
     */
    /**
     * ⚠️ 幕数必须由目标时长推导，不能写死区间（2026-08-07 用户点出）。
     * 每幕固定 5 秒（API 下限），写死「3–6 幕」等于给成片设了 15–30 秒的隐形上限 ——
     * 用户在内容目标里写「做一分钟」，模型仍只出 3–6 幕，需求被静默压掉。
     * 界面上没有独立的时长字段，时长就写在用户的内容目标里，所以这里要求模型
     * 先从中读出目标时长，再据此算幕数。
     */
    i18nT('分镜方法（决定分几幕）：先从上面的内容目标里读出目标时长，'
      + '按「幕数 = 目标时长 ÷ 5 秒」计算（没写时长就按 15 秒算，即 3 幕）。'
      + '再按「钩子 → 展开 → 细节 → 收束」的叙事骨架把这些幕分配到各叙事段落：'
      + '时长越长，展开与细节段落的幕数就越多，不要靠拉长单幕来凑时长。'
      + '一幕一个明确信息点，不要一幕塞多件事。每幕 duration 一律填 5。'),
    i18nT('每幕 prompt 必须写全这些要素，组织成连贯中文段落（不是填表）：'
      + '①景别（远/全/中/近/特写）②运镜与速度（推拉摇移跟升降环绕 + 缓慢匀速/急速）'
      + '③主体与具体动作（用「推门而入」「抬手斟茶」这类实动词，禁止「展示产品」「呈现空间」这类空话）'
      + '④时段与光线方向 ⑤色调氛围 ⑥构图（画面下 1/4 留干净留白给字幕）'
      + '⑦起幅与落幅（落幅要能接下一镜）⑧与上一镜的衔接方式（动作匹配/方向延续/明暗接续）。'),
    i18nT('跨幕一致性：主体外观描述（建筑材质、品牌色、人物衣着色板）在各幕之间'
      + '**原句照抄**，否则每幕生成的主体长得不一样。全片色调统一。'),
    i18nT('每条 prompt 末尾固定加：真实质感，无任何文字、字幕、水印、logo，'
      + '无畸变人脸与手指，无乱码文字，画面无抖动闪烁。'),
    '',
    // 200 字：既装得下上面那八要素，又不超出火山方舟建议的 50–200 字区间。
    // 上限存在的理由不是省 token，而是 --rs/--dur/--rt 这些参数拼在提示词**尾部**，
    // 提示词越长它们越容易被稀释失效。
    i18nT('每条 prompt 控制在 200 字以内（这是硬要求）：写满要素但不堆砌形容词，'
      + '超长会让画面控制参数失效。caption 不超过 20 字。'),
    i18nT('现在只输出一个 JSON 对象，不要任何解释文字与代码块围栏，格式：'),
    '{"scenes":[{"reference_image":"上面清单里的绝对路径","duration":5,"prompt":"按上面要素写的镜头提示词","caption":"该镜头字幕"}]}',
  ].join('\n');
}

async function confirmProduction(): Promise<void> {
  if (!canStart.value || starting.value) return;
  // 以前是等 startProduction() 整个跑完才关弹窗。图片成片直连要跑约一分钟，
  // 于是按钮在「正在创建制作任务…」上转一分多钟，而真正的三步进度就在弹窗背后，
  // 用户只看得见一个卡住的按钮。开跑即关，进度交给面板。
  previewOpen.value = false;
  await startProduction();
}

/**
 * 制作历史。数据源取工作区里 origin.kind==='video-studio' 的任务，不用 localStorage：
 * 任务和运行状态本来就是权威持久层，换台机器/清缓存都还在，也不会和真实运行对不上。
 */
type HistoryEntry = {
  taskId: string;
  workspaceId: string;
  departmentId: string;
  conversationId: string;
  projectName: string;
  createdAt: number;
  status: 'running' | 'waiting_human' | 'success' | 'failed' | 'cancelled' | 'pending';
  videoPath: string;
};
const historyEntries = ref<HistoryEntry[]>([]);
/**
 * 直连成片不产生工作流任务，所以在本地留一份产出记录，和工作流任务合并成历史。
 * 只存路径/项目名/时间这些定位信息，成片文件本身在用户素材目录里。
 */
const DIRECT_HISTORY_KEY = 'totalclaw:video-studio-direct-history:v1';
type DirectRecord = { videoPath: string; projectName: string; createdAt: number };
function loadDirectHistory(): DirectRecord[] {
  try {
    const raw = JSON.parse(localStorage.getItem(DIRECT_HISTORY_KEY) || '[]');
    return Array.isArray(raw) ? raw : [];
  } catch { return []; }
}
function appendDirectHistory(record: DirectRecord): void {
  try {
    const list = [record, ...loadDirectHistory().filter((item) => item.videoPath !== record.videoPath)];
    localStorage.setItem(DIRECT_HISTORY_KEY, JSON.stringify(list.slice(0, 100)));
  } catch { /* 本地存储不可用时不阻断成片 */ }
}
const historyPage = ref(0);
const HISTORY_PAGE_SIZE = 10;
const historyPageCount = computed(() =>
  Math.max(1, Math.ceil(historyEntries.value.length / HISTORY_PAGE_SIZE)));
const historyVisible = computed(() =>
  historyEntries.value.slice(historyPage.value * HISTORY_PAGE_SIZE, (historyPage.value + 1) * HISTORY_PAGE_SIZE));

async function refreshHistory(): Promise<void> {
  const api = (window as any).electronAPI;
  if (!api?.listWorkspaceTree) return;
  try {
    const tree = await api.listWorkspaceTree();
    const rows: HistoryEntry[] = [];
    for (const workspace of Array.isArray(tree) ? tree : []) {
      for (const department of workspace?.departments || []) {
        for (const task of department?.tasks || []) {
          if (task?.origin?.kind !== 'video-studio') continue;
          const runs = Array.isArray(task.runs) ? task.runs : [];
          const latest = runs[runs.length - 1];
          const outputInput = (task.workflowDef?.inputs || [])
            .find((item: any) => item?.key === 'outputPath');
          rows.push({
            taskId: String(task.id || ''),
            workspaceId: String(workspace.id || ''),
            departmentId: String(department.id || ''),
            conversationId: String(task.conversationId || ''),
            projectName: String(task.name || task.origin?.label || i18nT('短视频项目')),
            createdAt: Number(task.createdAt || 0),
            status: normalizeJobRunStatus(latest?.status) as HistoryEntry['status'],
            videoPath: String(outputInput?.defaultValue || ''),
          });
        }
      }
    }
    for (const record of loadDirectHistory()) {
      rows.push({
        taskId: `direct:${record.videoPath}`,
        workspaceId: '', departmentId: '', conversationId: '',
        projectName: record.projectName,
        createdAt: record.createdAt,
        status: 'success',
        videoPath: record.videoPath,
      });
    }
    // 历史的语义是「可以拿去发布的成片」，所以每条都按同一把尺子核实文件真在磁盘上。
    // 之前直接信任工作流登记的 outputPath，于是那些跑到一半被取消、根本没产出文件的
    // 任务也进了列表，点进去发布必然空手而归。已结束但没文件的一律不列；
    // 还在跑的保留（此刻没有文件是正常的）。
    const inflight = ['running', 'waiting_human', 'pending'];
    const verified = await Promise.all(rows.map(async (row) => {
      if (row.videoPath) {
        try {
          const meta = await (window as any).electronAPI?.solution?.inspectMedia?.(row.videoPath);
          if (meta?.ok && meta?.path) {
            // F6：直连条目的时间以**产物真实 mtime**为准——localStorage 登记时间可能
            // 陈旧或被同路径复用条目顶掉，历史列表要按文件的真实生成时间排序展示。
            const realMtime = Number(meta.mtimeMs) > 0 ? Number(meta.mtimeMs) : 0;
            const createdAt = row.taskId.startsWith('direct:') && realMtime ? realMtime : row.createdAt;
            return { ...row, videoPath: String(meta.path), createdAt };
          }
        } catch { /* 单条核实失败按无文件处理 */ }
      }
      return inflight.includes(row.status) ? { ...row, videoPath: '' } : null;
    }));
    const kept = verified.filter((row): row is HistoryEntry => !!row);
    kept.sort((left, right) => right.createdAt - left.createdAt);
    historyEntries.value = kept;
    if (historyPage.value > historyPageCount.value - 1) historyPage.value = historyPageCount.value - 1;
  } catch {
    // 历史列表拉取失败不影响制作主流程
  }
}

function historyStatusLabel(status: HistoryEntry['status']): string {
  if (status === 'success') return i18nT('已完成');
  if (status === 'failed') return i18nT('制作失败');
  if (status === 'cancelled') return i18nT('已停止');
  if (status === 'waiting_human') return i18nT('等待确认');
  if (status === 'running') return i18nT('制作中');
  return i18nT('等待开始');
}

function formatHistoryTime(value: number): string {
  if (!value) return '';
  try { return new Date(value).toLocaleString(); } catch { return ''; }
}

/**
 * 从历史条目直接进发布：把当前跟踪目标切到这条任务，再走同一个发布确认入口，
 * 不需要为了发一条旧片重新制作一遍。
 */
async function publishFromHistory(entry: HistoryEntry): Promise<void> {
  // 进度面板只有一个跟踪目标（lastJob）。有制作正在跑时把它整体改写成历史任务，
  // 正在跑的那条会直接从界面上消失——实测表现就是「素材又不读了/进度对不上」，
  // 其实任务还在后台跑。这时如实拒绝，让用户先处理活着的那条。
  if (entry.taskId !== lastJob.taskId && await hasLiveWorkflowRun()) {
    notif.warn(i18nT('当前有制作正在进行，发布历史成片会丢失它的进度跟踪；请等它完成或先停止'));
    return;
  }
  // 直连产出的条目没有工作流任务，直接切成片并打开发布，别去查不存在的 run。
  if (entry.taskId.startsWith('direct:')) {
    lastJob.source = 'direct';
    lastJob.conversationId = '';
    lastJob.workspaceId = undefined;
    lastJob.departmentId = undefined;
    lastJob.taskId = undefined;
    lastJob.projectName = entry.projectName;
    lastJob.expectedVideoPath = entry.videoPath;
    lastJob.videoPath = entry.videoPath;
    persistLastJob();
    await loadVideoPreview(entry.videoPath);
    await openPublishConfirm();
    return;
  }
  lastJob.source = 'workflow';
  lastJob.conversationId = entry.conversationId;
  lastJob.projectName = entry.projectName;
  lastJob.workspaceId = entry.workspaceId;
  lastJob.departmentId = entry.departmentId;
  lastJob.taskId = entry.taskId;
  lastJob.expectedVideoPath = entry.videoPath;
  lastJob.videoPath = entry.videoPath;
  persistLastJob();
  videoPreviewSrc.value = '';
  videoPreviewPath.value = '';
  await refreshJobProgress();
  if (entry.videoPath) await loadVideoPreview(entry.videoPath);
  await openPublishConfirm();
}

/** 成片落到素材目录下的私有子目录，跟着素材走，换机器也不会指向别人的绝对路径。 */
function localOutputPath(materialDir: string, jobId: string): string {
  const separator = materialDir.includes('\\') ? '\\' : '/';
  return [
    materialDir.replace(/[\\/]+$/, ''),
    '.totalclaw-video-studio',
    jobId,
    'final.mp4',
  ].join(separator);
}

/**
 * 「已取消」不是「失败」。
 *
 * 主进程两条成片通道（globalAdsRun.slideshow / solution.videoGenerate）都刻意把
 * 用户主动取消单独标成 `cancelled` —— 语义与失败相反，混在一起用户会以为出了错
 * 去排查。但渲染层两处都只判 `!ok` 就抛错，`cancelled` 从头到尾没人读
 * （preload 的返回类型里甚至没声明这个字段，2026-08-07 一并补上）。后果两条：
 *   ① 面板变红「成片失败：已取消」，自相矛盾；
 *   ② 更糟的是**智能模式**：runSeedanceDirect 抛错会触发「回落图片成片」，
 *      于是用户刚点了取消，app 立刻又开一轮真花钱的制作。
 * 走这里就不抛错，回 false 交给 startProduction 正常收场。
 */
function markJobCancelled(): void {
  jobNodeStates.value = Object.fromEntries(
    Object.entries(jobNodeStates.value).map(([key, state]) => [key, state === 'running' ? 'pending' : state]),
  ) as Record<string, VideoJobNodeState>;
  jobRunStatus.value = 'cancelled';
  jobCurrentNodeName.value = i18nT('已取消本次成片');
  dropStaleResultBinding();
}

/**
 * 叫停直连管线：按管线调对应的取消通道（不知道是哪条就两条都调，两条都幂等）。
 * 主进程会杀整个进程组；管线那边收到 `{cancelled:true}` 走 markJobCancelled 收尾。
 * 还没 spawn 子进程的阶段（旁白 / 扫描 / 分镜）靠 jobCancelRequested 在步骤间自行退出。
 */
async function cancelDirectRunners(mode: VideoJobRunMode): Promise<void> {
  const api = (window as any).electronAPI;
  jobCancelRequested.value = true;
  const calls: Array<Promise<unknown>> = [];
  if (mode !== 'seedance' && typeof api?.solution?.cancelVideo === 'function') {
    calls.push(Promise.resolve().then(() => api.solution.cancelVideo()));
  }
  if (mode !== 'slideshow' && typeof api?.globalAdsRun?.cancelSlideshow === 'function') {
    calls.push(Promise.resolve().then(() => api.globalAdsRun.cancelSlideshow()));
  }
  await Promise.allSettled(calls);
}

/** 进度面板上的「停止」 */
async function stopProduction(): Promise<void> {
  if (stopping.value || !jobDirectRunning.value) return;
  stopping.value = true;
  try {
    await cancelDirectRunners(jobRunMode.value);
    // 主进程杀子进程 → 管线收到 cancelled → 面板翻「已取消」；等它真的翻过去，按钮才松手
    await waitUntil(() => jobRunStatus.value !== 'running', 15_000);
  } catch (error) {
    notif.fromException(i18nT('停止成片失败'), error);
  } finally {
    stopping.value = false;
  }
}

/** 等一个条件成立（轮询 200ms），超时返回 false。 */
function waitUntil(predicate: () => boolean, timeoutMs: number): Promise<boolean> {
  return new Promise((resolve) => {
    if (predicate()) { resolve(true); return; }
    const startedAt = Date.now();
    const timer = window.setInterval(() => {
      if (predicate()) { window.clearInterval(timer); resolve(true); return; }
      if (Date.now() - startedAt >= timeoutMs) { window.clearInterval(timer); resolve(false); }
    }, 200);
  });
}

/**
 * 「重新生成」：三种终态共用一个入口。
 *   - 还在跑（可能已超时）：先取消旧任务，等它真的退出再起新一轮，不堆僵尸子进程；
 *     20 秒内还不退出就不硬起（主进程只允许一轮成片）。
 *   - 上次运行已中断：主进程可能还在跑上一轮（只是页面刷新了），startProduction 会先清场。
 *   - 失败：直接再来一轮。
 */
async function regenerateProduction(): Promise<void> {
  if (jobRestarting.value) return;
  jobRestarting.value = true;
  try {
    if (jobDirectRunning.value) {
      await cancelDirectRunners(jobRunMode.value);
      // 等管线真的收尾（status 翻终态 + startProduction 的 finally 松开 starting），再起新一轮
      const stopped = await waitUntil(() => jobRunStatus.value !== 'running' && !starting.value, 20_000);
      if (!stopped) {
        notif.warn(i18nT('旧任务还没有退出，暂时无法重新生成；请稍后再试或重启应用。'));
        return;
      }
    } else if (starting.value) {
      return; // 一轮正在起步，别叠着起
    }
    await startProduction();
  } finally {
    jobRestarting.value = false;
  }
}

/**
 * 图片成片开跑前能在本地可靠判断的前置条件：素材目录必须能读、且至少有一张图片。
 * 否则脚本会在起步就报「素材目录里没找到图片」——没必要先把节点摆出来再失败。
 * 老版本 preload 没有扫描通道时跳过：交给脚本自己报错。
 */
async function preflightSlideshowMaterials(dir: string): Promise<boolean> {
  const lister = (window as any).electronAPI?.solution?.listMediaDir;
  if (typeof lister !== 'function') return true;
  let listed: any = null;
  try { listed = await lister(dir); } catch (error) {
    notif.warn(i18nT('素材文件夹读取失败：{p0}', { p0: humanizeErrorMessage(error) }));
    return false;
  }
  if (!listed?.ok) {
    notif.warn(listed?.error
      ? i18nT('素材文件夹读取失败：{p0}', { p0: String(listed.error) })
      : i18nT('素材文件夹读不到（可能已被移动或删除）：{p0}', { p0: dir }));
    return false;
  }
  const images = (Array.isArray(listed.files) ? listed.files : []).filter((file: any) => file?.kind === 'image');
  if (!images.length) {
    notif.warn(i18nT('素材文件夹里没有图片（jpg/png/webp/heic…），图片成片无法开始：{p0}', { p0: dir }));
    return false;
  }
  return true;
}

/**
 * 图片成片直连 skill：不建工作流、不经模型，逐行读脚本的进度 JSON 更新界面。
 */
async function runSlideshowDirect(project: string): Promise<boolean> {
  const api = (window as any).electronAPI;
  const materialDir = draft.materialDir.trim();
  if (!materialDir) throw new Error(i18nT('请先选择素材目录，成片要用你自己的素材生成'));
  if (!api?.solution?.videoGenerate) throw new Error(i18nT('成片服务尚未就绪'));

  clearPublishReceipt();
  // 开跑即清上一轮的成片绑定：本轮还没产出任何东西，界面就不该有「可预览的成片」。
  // 实测事故：选 Seedance 跑着，「预览本地成片」放出的却是上一轮图片成片
  // （成片-时间戳.mp4，还在素材目录根），用户完全有理由以为那就是 Seedance 的产物。
  dropStaleResultBinding();
  // F2：配音/配乐设置必须跟着直连请求走（此前被整个丢掉，成片连音频流都没有）
  const wantsAudio = draft.voiceover || !!draft.bgmMood;
  // 直连不产生工作流任务：认领进度面板，并清掉上一条工作流的跟踪目标。
  lastJob.source = 'direct';
  lastJob.conversationId = '';
  lastJob.workspaceId = undefined;
  lastJob.departmentId = undefined;
  lastJob.taskId = undefined;
  persistLastJob();
  jobRunId.value = '';
  jobPendingConfirm.value = null;
  // 真实开始时刻 + 「运行中」标记落在模块级运行态（看门狗、换页回来、重启后判中断都靠它）
  ownsDirectRun.value = true;
  beginDirectRun('slideshow', project);
  jobProgressNodes.value = wantsAudio ? [...slideshowProgressNodes, slideshowAudioNode] : [...slideshowProgressNodes];
  jobNodeStates.value = wantsAudio
    ? { scan: 'running', stage: 'pending', render: 'pending', audio: 'pending' }
    : { scan: 'running', stage: 'pending', render: 'pending' };
  jobCurrentNodeName.value = i18nT('正在扫描素材');

  const off = api.solution.onVideoProgress?.((p: any) => {
    // 主进程推来的每一条进度都是心跳：看门狗据此不怀疑（哪怕 stage 不认识）
    jobProgressAt.value = Date.now();
    const stage = String(p?.stage || '');
    if (!stage) return;
    const order = wantsAudio ? ['scan', 'stage', 'render', 'audio'] : ['scan', 'stage', 'render'];
    const idx = order.indexOf(stage);
    if (idx < 0) return;
    const next: Record<string, VideoJobNodeState> = {};
    order.forEach((key, i) => { next[key] = i < idx ? 'done' : i === idx ? 'running' : 'pending'; });
    jobNodeStates.value = next;
    jobCurrentNodeName.value = String(p?.msg || stage);
  });

  try {
    // F2 ①：开了「生成 AI 旁白」先写旁白文案（纯补全 LLM，一句进一句出）；
    // LLM 失败不挡出片——回落用素材简报口播化，保证「配音开了就有配音」。
    let narration: Array<{ id: string; text: string; start: number }> = [];
    if (draft.voiceover) {
      jobCurrentNodeName.value = i18nT('正在撰写 AI 旁白文案');
      try {
        const reply = await api.llmOneshot({
          systemPrompt: [
            i18nT('你是短视频旁白撰稿人。根据给出的项目信息写一段中文口播旁白。'),
            i18nT('直接输出旁白正文：不要解释、不要标题、不要 Markdown、不要表情符号。'),
            i18nT('语句自然口语化，长度控制在 60 字以内（视频只有十几秒）。'),
            i18nT('绝对禁止虚构价格、地址、优惠规则或未提供的事实。'),
          ].join('\n'),
          prompt: [
            i18nT('项目：{p0}', { p0: project }),
            draft.voiceStyle.trim() ? i18nT('旁白语气：{p0}', { p0: draft.voiceStyle.trim() }) : '',
            i18nT("内容要点：\n{p0}", { p0: draft.brief.trim() || project }),
          ].filter(Boolean).join('\n'),
          timeoutMs: 120_000,
          plainCompletion: true,
        });
        const text = String(reply?.text || '').trim().slice(0, 200);
        if (text) narration = [{ id: 's1', text, start: 0 }];
      } catch { /* 回落用简报文本，绝不因旁白文案挡住出片 */ }
      if (!narration.length) {
        const fallback = (draft.brief.trim() || project).slice(0, 120);
        if (fallback) narration = [{ id: 's1', text: fallback, start: 0 }];
      }
    }
    // 写旁白期间用户点了「停止」：取消通道对还没 spawn 的子进程无效，这里自己退出
    if (jobCancelRequested.value) { markJobCancelled(); return false; }

    const res = await api.solution.videoGenerate({
      script: 'oneclick',
      materialDir,
      perImage: 2.2,
      width: 1080,
      height: 1920,
      title: project,
      // F2 ②：配音/配乐设置端到端直通（主进程 audio 阶段消费）
      narration,
      bgmMood: draft.bgmMood || undefined,
    });
    if (res?.cancelled) { markJobCancelled(); return false; }
    if (!res?.ok) throw new Error(res?.error || i18nT('成片失败'));
    /**
     * 扫描阶段被跳过的坏素材要如实报出来（脚本带回文件名 + 原因）。
     * 片子确实出来了，但少了几张——不说的话用户只会觉得「怎么比我放进去的少」，
     * 也不知道该去删哪个文件。
     */
    const skipped = Array.isArray((res as any).skippedFiles) ? (res as any).skippedFiles : [];
    if (skipped.length) {
      const listed = skipped.slice(0, 5)
        .map((item: any) => `${String(item?.name)}（${String(item?.reason)}）`).join(i18nT('、'));
      notif.warn(i18nT('有 {p0} 个素材读不出来，已跳过：{p1}', {
        p0: skipped.length,
        p1: listed + (skipped.length > 5 ? '…' : ''),
      }));
    }
    const videoPath = String(res.videoPath || '');
    jobNodeStates.value = wantsAudio
      ? { scan: 'done', stage: 'done', render: 'done', audio: 'done' }
      : { scan: 'done', stage: 'done', render: 'done' };
    // 先把结果绑定落盘，再翻 success：换页回来的新实例是靠 watch(jobRunStatus) 读 localStorage 认领成片的
    lastJob.projectName = project;
    lastJob.expectedVideoPath = videoPath;
    lastJob.videoPath = videoPath;
    persistLastJob();
    jobRunStatus.value = 'success';
    jobCurrentNodeName.value = i18nT('成片已完成，可预览并进入发布');
    if (videoPath) {
      appendDirectHistory({ videoPath, projectName: project, createdAt: Date.now() });
      await loadVideoPreview(videoPath);
    }
    await refreshHistory();
    notif.success(i18nT('成片已完成'));
    return true;
  } catch (error: any) {
    // 失败必须收尾面板状态：running 是本函数开跑时亲手写上的，异常只往上抛的话
    // startProduction 那边弹完错误 toast，这里的进度面板还在永远转圈「视频制作进行中」。
    jobNodeStates.value = Object.fromEntries(
      Object.entries(jobNodeStates.value).map(([key, state]) => [key, state === 'running' ? 'failed' : state]),
    ) as Record<string, VideoJobNodeState>;
    jobRunStatus.value = 'failed';
    // 这行会直接显示在「当前节点」那一栏（用户可见的进度位），必须是人话：
    // 原写法把 ffmpeg/Seedance/Python 的原始报错（含绝对路径与 exit code）整句摆上去。
    jobCurrentNodeName.value = humanizeErrorMessage(error, i18nT('成片失败'));
    // F6：本次流水线没产出就是没产出——绝不让上一条旧成片留在绑定位上冒充结果
    //（E2E 实证：生成失败后预览/发布入口仍指向旧 final.mp4，看起来像「每次都出同一条片」）。
    dropStaleResultBinding();
    throw error;
  } finally {
    // 任何终态都清「运行中」标记（成功 / 失败 / 取消），否则下次打开误报「已中断」
    endDirectRun();
    ownsDirectRun.value = false;
    try { off?.(); } catch { /* 取消监听失败不影响结果 */ }
  }
}

/**
 * F6 2026-08-05：清掉直连路径的成片绑定（连同预览状态）。
 * 失败/产物核实不过时调用——结果绑定只允许指向「本次运行自己产出的文件」，
 * 严禁把上一次运行、别的任务、或内置演示片顶上来当结果。
 */
function dropStaleResultBinding(): void {
  lastJob.videoPath = '';
  lastJob.expectedVideoPath = undefined;
  persistLastJob();
  videoPreviewSrc.value = '';
  videoPreviewPath.value = '';
}

/**
 * Seedance 动态成片**直连生产线**（用户指令：视频生成不经 agent 工作流，
 * 只有发布保留受控工作流）。四步全部可视化，失败必须收尾步骤状态：
 * ① 素材扫描（scan_materials.py 直跑，0.4s 级）
 * ② 一次 LLM_ONESHOT 按十要素规范产出结构化分镜（utils/seedanceShots）
 * ③ 主进程直调 make_video_seedance.py：并行生成 clip → xfade 拼接 → BGM → 字幕，
 *    内置**确定性**质检（blackdetect/freezedetect）与缺陷镜头自动重生成 —— 不用 agent 质检
 * ④ 成片可播放校验，之后交给既有发布工作流
 */
async function runSeedanceDirect(project: string): Promise<boolean> {
  const api = (window as any).electronAPI;
  const materialDir = draft.materialDir.trim();
  if (!materialDir) throw new Error(i18nT('请先选择素材目录，成片要用你自己的素材生成'));
  if (typeof api?.globalAdsRun?.slideshow !== 'function') throw new Error(i18nT('成片服务尚未就绪'));
  if (!api?.llmOneshot) throw new Error(i18nT('默认 LLM 服务尚未就绪'));

  clearPublishReceipt();
  // 开跑即清上一轮的成片绑定：本轮还没产出任何东西，界面就不该有「可预览的成片」。
  // 实测事故：选 Seedance 跑着，「预览本地成片」放出的却是上一轮图片成片
  // （成片-时间戳.mp4，还在素材目录根），用户完全有理由以为那就是 Seedance 的产物。
  dropStaleResultBinding();
  // 直连不产生工作流任务：认领进度面板，并清掉上一条工作流的跟踪目标。
  lastJob.source = 'direct';
  lastJob.conversationId = '';
  lastJob.workspaceId = undefined;
  lastJob.departmentId = undefined;
  lastJob.taskId = undefined;
  persistLastJob();
  jobRunId.value = '';
  jobPendingConfirm.value = null;
  // 真实开始时刻 + 「运行中」标记落在模块级运行态（看门狗、换页回来、重启后判中断都靠它）
  ownsDirectRun.value = true;
  beginDirectRun('seedance', project);
  jobProgressNodes.value = [...seedanceProgressNodes];
  jobNodeStates.value = { scan: 'running', shots: 'pending', render: 'pending', qc: 'pending' };
  jobCurrentNodeName.value = i18nT('正在扫描素材');
  const setStep = (id: string, state: VideoJobNodeState): void => {
    jobNodeStates.value = { ...jobNodeStates.value, [id]: state };
  };

  // 生成/合成/质检的实时行来自 make_video_seedance.py stdout（主进程逐行透传）
  const off = api.globalAdsRun.onSlideshowProgress?.((p: any) => {
    // 每一行都是心跳：看门狗据此不怀疑
    jobProgressAt.value = Date.now();
    const msg = String(p?.msg || '');
    if (!msg) return;
    jobCurrentNodeName.value = msg;
    if (/质检|补生成/.test(msg)) { setStep('render', 'done'); setStep('qc', 'running'); }
  });

  try {
    // ① 素材扫描（同工作流时代的直连预检：路径/画幅是 ffprobe 实读，不让模型猜）
    const scan = await api.solution?.materialScan?.({ materialDir, aspect: draft.aspectRatio || '9:16' })
      .catch((e: any) => ({ ok: false, error: String(e?.message || e) }));
    if (!scan?.ok) throw new Error(i18nT('素材扫描失败：{p0}', { p0: String(scan?.error || i18nT('未知原因')).slice(0, 120) }));
    const images = (scan.included || [])
      .filter((m: any) => m?.kind === 'image' && m?.path)
      .map((m: any) => String(m.path));
    if (!images.length) throw new Error(i18nT('素材目录里没有可用图片，请先添加清晰的参考素材'));
    // 扫描 / 分镜两步还没 spawn 子进程，取消通道对它们无效：用户点了停止就在步骤间自己退出
    if (jobCancelRequested.value) { markJobCancelled(); return false; }
    setStep('scan', 'done');
    setStep('shots', 'running');
    jobCurrentNodeName.value = i18nT('正在按十要素规范撰写分镜提示词');

    // ② 一次 LLM 调用产出结构化分镜（解析失败就停：不拿空话提示词去烧生成额度）
    //
    // ⚠️ 绝不要把 buildProductionPrompt() 塞进来（2026-08-06 实测教训）：那份是**工作流时代
    // 给 agent 的执行指令墙**——「请使用内置 skill 执行这条任务」「公开发布必须等我确认」
    // 「成片后输出 TOTALCLAW_VIDEO_PREVIEW=路径」等 20 余行命令式要求。把它拼进分镜调用后，
    // 模型收到的是「执行一个制作任务」而不是「写一份 JSON 分镜」，JSON 契约还被埋在中间段落；
    // 同一套 system prompt 直打 DeepSeek（只给精简需求）稳定回标准 {"scenes":[...]}，
    // 拼上这堵墙就废。这里只给分镜真正需要的创作信息，且把格式契约放在**最后一行**（近因效应）。
    const reply = await api.llmOneshot({
      systemPrompt: SEEDANCE_SHOT_SYSTEM_PROMPT,
      prompt: buildShotListRequest(project, images),
      timeoutMs: 300_000,
      // 纯补全（F1 修复）：分镜是结构化文本生成。不带此标记时 worker 池按全量 toolset 建
      // agent，推理型模型会把「制作要求」当任务执行（E2E 实测 37+ 轮工具调用、13.5 分钟，
      // 最终回复不是分镜表 → parseSeedanceShotList 拒收 → 流水线打不起来）。
      plainCompletion: true,
    });
    const replyText = String(reply?.text || '');
    const scenes = parseSeedanceShotList(replyText, images);
    if (!scenes.length) {
      // 可观测性：以前这里只抛一句「模型没返回可用分镜」，回复内容不落任何地方——
      // 排查只能靠猜（实测为此白跑了几轮）。把长度与首尾片段留进日志，下次一眼看出
      // 是空回复、是散文、还是 JSON 结构不对。
      const diag = {
        replyLength: replyText.length,
        head: replyText.slice(0, 200),
        tail: replyText.length > 400 ? replyText.slice(-120) : '',
      };
      // eslint-disable-next-line no-console
      console.warn('[video-studio] 分镜解析失败', diag);
      /**
       * ⚠️ console.warn 在装机包里等于没写（2026-08-07 实测）：主窗口的 webContents
       * 没挂 console-message 钩子，渲染进程的 console 一个字都不进 app 日志。
       * 用户导出 app.log 排查「视频生成失败」时，日志里只看得到分镜那次 LLM 调用
       * 正常返回、之后一片空白 —— 连「是分镜没解析出来，还是成片脚本失败」都判不出来。
       * 走已有的 logs:from-renderer 通道补进主日志（通道和主进程 handler 早就在，
       * 只是渲染层一处都没用过）。
       */
      try {
        void api?.sendRendererLog?.({
          level: 'error',
          source: 'video-studio',
          message: i18nT('分镜解析失败：模型回复不是可用的结构化分镜'),
          data: diag,
        });
      } catch { /* 日志送不出去不影响下面如实报错 */ }
      throw new Error(i18nT('模型没有返回可用的结构化分镜，未开始生成（不浪费生成额度）'));
    }
    if (jobCancelRequested.value) { markJobCancelled(); return false; }
    setStep('shots', 'done');
    setStep('render', 'running');
    // 有了真实镜头数才能给出可信预估（此前界面只有一个不动的转圈）。
    // 预估从管线真实开始时刻起算：把扫描 + 分镜已经花掉的时间加进去，「预计还需」才是纯生成的估计。
    const elapsedSoFar = Math.max(0, Math.round((Date.now() - jobStartedAt.value) / 1000));
    jobEstimateSec.value = elapsedSoFar + Math.max(30, Math.round(estimateSeedanceSeconds(scenes.length, seedanceQuality.value)));
    jobCurrentNodeName.value = i18nT('动态视频并行生成 {p0} 个镜头…', { p0: scenes.length });

    // ③ 生成 + 拼接 + BGM + 字幕 + 确定性质检（主进程 spawn skill 脚本；QC 不经 agent）
    const jobId = `video_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const outputPath = localOutputPath(materialDir, jobId);
    const result = await api.globalAdsRun.slideshow({
      mode: 'fal',
      materialDir,
      outputs: [{ aspect: draft.aspectRatio || '9:16', path: outputPath }],
      title: project,
      bgmMood: draft.bgmMood,
      scenes,
      narration: draft.voiceover ? narrationTimeline(scenes) : [],
      seedanceQuality: seedanceQuality.value,
    });
    if (result?.cancelled) { markJobCancelled(); return false; }
    if (!result?.ok) throw new Error(result?.error || i18nT('动态视频生成失败'));
    setStep('render', 'done');
    setStep('qc', 'running');

    // ④ 产物校验（确定性）：文件真实可播放才算成
    jobCurrentNodeName.value = i18nT('正在校验成片');
    const produced = String(result.produced?.[0]?.path || outputPath);
    const check = await api.solution?.inspectMedia?.(produced);
    if (check?.ok !== true) throw new Error(i18nT('成片校验未通过：{p0}', { p0: String(check?.error || i18nT('文件不可播放')) }));
    setStep('qc', 'done');
    // 先把结果绑定落盘，再翻 success：换页回来的新实例是靠 watch(jobRunStatus) 读 localStorage 认领成片的
    lastJob.projectName = project;
    lastJob.expectedVideoPath = produced;
    lastJob.videoPath = produced;
    persistLastJob();
    jobRunStatus.value = 'success';
    jobCurrentNodeName.value = i18nT('成片已完成，可预览并进入发布');
    appendDirectHistory({ videoPath: produced, projectName: project, createdAt: Date.now() });
    await loadVideoPreview(produced);
    await refreshHistory();
    notif.success(i18nT('成片已完成'));
    return true;
  } catch (error: any) {
    // 失败必须收尾面板状态（与 runSlideshowDirect 同一条纪律：不许留永远转圈的步骤）
    jobNodeStates.value = Object.fromEntries(
      Object.entries(jobNodeStates.value).map(([key, state]) => [key, state === 'running' ? 'failed' : state]),
    ) as Record<string, VideoJobNodeState>;
    jobRunStatus.value = 'failed';
    // 这行会直接显示在「当前节点」那一栏（用户可见的进度位），必须是人话：
    // 原写法把 ffmpeg/Seedance/Python 的原始报错（含绝对路径与 exit code）整句摆上去。
    jobCurrentNodeName.value = humanizeErrorMessage(error, i18nT('成片失败'));
    // F6：Seedance 没生成出来（分镜被拒/生成失败/质检不过）就如实失败，
    // 绝不保留上一条旧成片的绑定去冒充本次结果。
    dropStaleResultBinding();
    throw error;
  } finally {
    // 任何终态都清「运行中」标记（成功 / 失败 / 取消），否则下次打开误报「已中断」
    endDirectRun();
    ownsDirectRun.value = false;
    try { off?.(); } catch { /* 取消监听失败不影响结果 */ }
  }
}

/**
 * 有没有一条正被本页跟踪、还活着的工作流运行。
 *
 * 必须去问服务端，不能只信本地的 jobRunStatus：刚进页面时 refreshJobProgress 还在飞，
 * 响应式状态仍是初始值——实测这个窗口里点「开始制作」/「去发布」，守卫全部失效，
 * 又并行起了一条 run。本地状态只作为快速路径，拿不到树时才回落。
 *
 * 不把 pending 算进来：任务创建成功但 startTaskRun 失败时 run 永远不会出现，
 * pending 永远不清，入口会被自己永久挡住。创建窗口本身由 starting 标志护着。
 */
const LIVE_RUN_STATUSES = ['running', 'waiting_human'];

async function hasLiveWorkflowRun(): Promise<boolean> {
  if (lastJob.source !== 'workflow') return false;
  if (LIVE_RUN_STATUSES.includes(jobRunStatus.value)) return true;
  if (!lastJob.taskId) return false;
  try {
    const tree = await (window as any).electronAPI?.listWorkspaceTree?.();
    for (const workspace of Array.isArray(tree) ? tree : []) {
      for (const department of workspace?.departments || []) {
        const task = (department?.tasks || []).find((item: any) => item?.id === lastJob.taskId);
        if (!task) continue;
        const runs = Array.isArray(task.runs) ? task.runs : [];
        return runs.some((run: any) =>
          LIVE_RUN_STATUSES.includes(normalizeJobRunStatus(run?.status)));
      }
    }
  } catch { /* 查不到就按「没有活跃运行」放行，不因为查询失败挡住用户 */ }
  return false;
}

async function startProduction(): Promise<boolean> {
  if (!canStart.value || starting.value) return false;
  // 已有制作在跑时禁止再起一条：实测连点「开始制作」会并行起多条 run，
  // 每条都在真调模型和 Seedance——用户看到的是一个面板，账单上是三份钱。
  // 直连管线的运行态是模块级的：换页回来的新实例也看得见「还在跑」，同样拦。
  if (jobDirectRunning.value || await hasLiveWorkflowRun()) {
    notif.warn(i18nT('已有制作正在进行（{p0}），等它完成或先停止后再开始新的', { p0: jobCurrentNodeName.value || i18nT('执行中') }));
    return false;
  }
  if (!draft.materialDir.trim()) {
    notif.warn(i18nT('请先选择素材文件夹：真实生成需要读取本地素材'));
    return false;
  }
  starting.value = true;
  try {
    // 上次运行已中断（页面刷新 / 应用重启）：主进程可能还在跑上一轮的子进程，
    // 不清场的话新一轮会被拒「已有一个成片任务在运行」。两条取消通道都幂等，一并调。
    if (jobInterrupted.value) {
      await cancelDirectRunners('');
      clearInterruptedDirectRun();
      // 主进程收尾是异步的（SIGTERM → 子进程退出 → 句柄置空），给它一口气
      await new Promise((resolve) => { window.setTimeout(resolve, 1000); });
    }
    const project = draft.projectName.trim() || draft.brandName.trim() || i18nT('短视频项目');
    const materialDir = draft.materialDir.trim();
    // 视频**生成**一律直连，不再建 agent 工作流（用户指令：优化提示词 → 直调
    // Seedance → 合成 → 确定性质检；只有**发布**保留带登录确认闸门的工作流）。
    // 图片成片本来就是直连；Seedance 改直连后同样是分钟级出片，质检也不再经 agent。
    if (draft.productionMode === 'slideshow') {
      // 开跑前预检：素材目录里得有图片，否则根本不起（不摆节点、不转圈）
      if (!await preflightSlideshowMaterials(materialDir)) return false;
      return await runSlideshowDirect(project);
    }
    try {
      return await runSeedanceDirect(project);
    } catch (error: any) {
      if (draft.productionMode !== 'smart') throw error;
      // 智能模式兜底：动态生成链路不可用（缺视频模型 key / 没有图片素材）时回落图片成片
      notif.warn(i18nT('动态视频生成不可用（{p0}），已改用图片成片', { p0: humanizeErrorMessage(error).slice(0, 120) }));
      if (!await preflightSlideshowMaterials(materialDir)) return false;
      return await runSlideshowDirect(project);
    }
  } catch (error) {
    // 2026-08-05 修：分镜提示词（LLM_ONESHOT）等 LLM 步骤失败时，此前 fromException 的
    // humanize 会把英文原因（如 No LLM provider configured）按语种不符吞成
    // 「操作失败，请稍后重试」，用户完全不知道该干啥。这里先按聊天同款分类器
    // 归一化：配置类错误给真因 + 「去配置」按钮直达「AI 模型」设置；其余保持原样。
    // 分类器自身异常绝不遮蔽原始错误 → 防御性回落 fromException。
    let h: ReturnType<typeof humanizeChatError> | null = null;
    try { h = humanizeChatError(error); } catch { h = null; }
    if (h && (h.suggestModelConfig || h.suggestRecharge)) {
      notif.actionable('warn', i18nT('创建视频制作任务失败：{p0}', { p0: h.message }), {
        label: h.suggestRecharge ? i18nT('去充值') : i18nT('去配置'),
        onClick: () => router.push({ path: '/settings', query: { section: 'ai-models' } }),
      });
    } else {
      notif.fromException(i18nT('创建视频制作任务失败'), error);
    }
    return false;
  } finally {
    starting.value = false;
  }
}

// （旧「生成工作流」及占位任务修复已随直连化移除：视频生成不再建 agent 工作流，
//   历史工作流任务仍可在制作历史里查看；发布链路的工作流保持不变。）

function normalizeJobRunStatus(value: unknown): JobRunStatus {
  const status = String(value || '').toLowerCase();
  if (status === 'running') return 'running';
  if (status === 'waiting_human') return 'waiting_human';
  if (status === 'success' || status === 'completed' || status === 'done') return 'success';
  if (status === 'failed' || status === 'error') return 'failed';
  if (status === 'cancelled' || status === 'canceled') return 'cancelled';
  if (status === 'pending') return 'pending';
  return 'idle';
}

function videoProgressPhase(nodeId: string): number {
  // 「素材」阶段（0）现在没有工作流节点——扫描在启动前就跑完了。
  // videoPhaseState 对空阶段判定为已完成，正好如实反映事实。
  if (['creative_plan', 'creative_review', 'render_final'].includes(nodeId)) return 1;
  if (['video_review', 'publish_validation'].includes(nodeId)) return 2;
  if (['publish_approval', 'platform_publish'].includes(nodeId)) return 3;
  return 1;
}

async function refreshJobProgress(): Promise<void> {
  // 进度面板当前不归工作流管（直连成片 / 空闲）就整段让开，
  // 否则轮询会把脚本刚推上去的进度覆盖回工作流状态。
  if (lastJob.source !== 'workflow') return;
  const rootApi = (window as any).electronAPI;
  if (!rootApi?.listWorkspaceTree) return;
  try {
    if (!lastJob.taskId && lastJob.conversationId && rootApi.conversation?.get) {
      const conversation = await rootApi.conversation.get(lastJob.conversationId);
      if (conversation?.taskId) lastJob.taskId = String(conversation.taskId);
    }
    // 只认 taskId。这里原本还有一条「按项目名模糊匹配任意 video-studio 任务」的兜底，
    // 于是任何一次 taskId 被清空（直连成片、从历史切片）都会把上一条卡在
    // publish_approval 的旧运行重新认领回来，进度条复活成 6/8 且点不动。
    if (!lastJob.taskId) return;

    const tree = await rootApi.listWorkspaceTree();
    let matched: { workspace: any; department: any; task: any } | null = null;
    for (const workspace of Array.isArray(tree) ? tree : []) {
      for (const department of workspace?.departments || []) {
        const task = (department?.tasks || []).find((item: any) => item?.id === lastJob.taskId);
        if (task) {
          matched = { workspace, department, task };
          break;
        }
      }
      if (matched) break;
    }

    if (!matched) return;

    lastJob.workspaceId = String(matched.workspace.id || '');
    lastJob.departmentId = String(matched.department.id || '');
    lastJob.taskId = String(matched.task.id || '');
    persistLastJob();
    const workflowNodes = (matched.task.workflowDef?.nodes || [])
      .filter((item: any) => item?.type !== 'start' && item?.type !== 'end')
      .map((item: any) => ({
        id: String(item.id),
        phase: videoProgressPhase(String(item.id)),
        label: String(item.name || item.id).replace(/^[①②③④⑤⑥⑦⑧]\s*/, ''),
      }));
    jobProgressNodes.value = workflowNodes.length ? workflowNodes : [...defaultJobProgressNodes];

    const runs = Array.isArray(matched.task.runs) ? matched.task.runs : [];
    const run = [...runs].reverse().find((item: any) =>
      ['running', 'waiting_human'].includes(String(item?.status || '').toLowerCase()),
    ) || runs[runs.length - 1];
    if (!run) {
      jobRunId.value = '';
      jobRunStatus.value = 'pending';
      jobNodeStates.value = {};
      jobCurrentNodeName.value = i18nT('任务已创建，等待工作流开始');
      return;
    }

    jobRunId.value = String(run.runId || run.id || '');
    jobRunStatus.value = normalizeJobRunStatus(run.status);
    jobNodeStates.value = { ...(run.nodeStates || {}) };
    // 主进程把挂起的人工确认落在 run.pendingHumanConfirm；据此就地渲染确认卡，
    // 页面重载或中途进来也能接着答，不用回全局待办中心找。
    // 只有还活着（waiting_human/running）的 run 才渲染确认卡：被取消的 run
    // 可能仍带着 pendingHumanConfirm 快照，照渲染用户就会对着一条已死的运行点「确认发布」。
    const snapshot = ['waiting_human', 'running'].includes(jobRunStatus.value)
      ? run.pendingHumanConfirm : null;
    jobPendingConfirm.value = snapshot?.nodeId
      ? {
        nodeId: String(snapshot.nodeId),
        nodeName: snapshot.nodeName ? String(snapshot.nodeName).replace(/^[①②③④⑤⑥⑦⑧]\s*/, '') : undefined,
        question: snapshot.question,
        detail: snapshot.detail,
      }
      : null;
    const activeId = Object.entries(jobNodeStates.value)
      .find(([, status]) => status === 'running')?.[0]
      || String(run.currentNodeId || '');
    const activeNode = (matched.task.workflowDef?.nodes || [])
      .find((item: any) => item?.id === activeId);
    if (activeNode?.name) {
      jobCurrentNodeName.value = String(activeNode.name).replace(/^[①②③④⑤⑥⑦⑧]\s*/, '');
    } else if (jobRunStatus.value === 'success') {
      jobCurrentNodeName.value = i18nT('全部制作步骤已完成');
    } else if (jobRunStatus.value === 'failed') {
      jobCurrentNodeName.value = String(run.error || i18nT('请进入制作对话查看失败原因'));
    } else if (jobRunStatus.value === 'cancelled') {
      jobCurrentNodeName.value = i18nT('任务已停止');
    } else {
      jobCurrentNodeName.value = i18nT('正在同步工作流状态');
    }
  } catch {
    // 进度展示失败不影响视频制作主流程，下一次轮询会继续恢复。
  }
}

/**
 * 在内置浏览器里打开某平台的发布页，供用户当场登录。
 *
 * 一切登录都必须发生在内置浏览器：登录态落在应用自己的浏览器分区里，
 * 后续受控发布读的就是这一份；拉外部 Chrome 登录的话两边分区不通，
 * 会出现「明明登录了却发不出去」。
 */
async function openPlatformLogin(platformId: string): Promise<void> {
  const url = PLATFORM_PUBLISH_URLS[platformId as PlatformId];
  if (!url) return;
  const api = (window as any).electronAPI;
  try {
    await api?.browserTabs?.create?.({ url, activate: true });
    platformLoginState.value = { ...platformLoginState.value, [platformId]: 'unknown' };
  } catch (error: any) {
    notif.fromException(i18nT('打开平台登录页失败'), error);
  }
}

/**
 * 判断某平台在内置浏览器里是否已登录。
 *
 * 判据和 skill 侧一致：落地 URL 不在登录/扫码页，且页面渲染出了 input[type=file]
 * ——发布页只有登录后才会出现文件选择器。两条都满足才算登录，宁可误判为未登录，
 * 也不能把未登录当成可发布。
 */
async function checkPlatformLogin(platformId: string): Promise<void> {
  const url = PLATFORM_PUBLISH_URLS[platformId as PlatformId];
  const api = (window as any).electronAPI;
  if (!url || !api?.browserTabs?.create) return;
  platformLoginState.value = { ...platformLoginState.value, [platformId]: 'checking' };
  try {
    const tab = await api.browserTabs.create({ url, activate: false });
    const tabId = String(tab?.id || '');
    if (!tabId) throw new Error(i18nT('内置浏览器未能打开该平台'));
    // 给页面留出跳转+渲染时间：登录态失效时平台会先加载再重定向到登录页。
    await new Promise((resolve) => setTimeout(resolve, 4500));
    const probe = await api.browserTabs.command({
      tabId,
      command: 'eval',
      args: [`JSON.stringify({
        url: location.href,
        fileInputs: (function(){
          var n = 0;
          (function walk(root){
            try {
              n += root.querySelectorAll('input[type="file"]').length;
              root.querySelectorAll('*').forEach(function(e){ if (e.shadowRoot) walk(e.shadowRoot); });
            } catch (err) {}
          })(document);
          return n;
        })(),
      })`],
    });
    const raw = (probe as any)?.data ?? (probe as any)?.result ?? probe;
    const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw;
    const landedUrl = String(parsed?.url || '');
    const onLoginPage = /login|signin|passport|\/auth/i.test(landedUrl);
    const ready = !onLoginPage && Number(parsed?.fileInputs || 0) > 0;
    platformLoginState.value = { ...platformLoginState.value, [platformId]: ready ? 'ready' : 'absent' };
    // 未登录的平台默认不发，避免把「没登录」当成「发布成功」。用户仍可手动勾回。
    if (!ready) platformPublishPicked.value = { ...platformPublishPicked.value, [platformId]: false };
  } catch {
    platformLoginState.value = { ...platformLoginState.value, [platformId]: 'absent' };
    platformPublishPicked.value = { ...platformPublishPicked.value, [platformId]: false };
  }
}

async function checkAllPlatformLogins(): Promise<void> {
  await Promise.all(selectedPlatforms.value.map((item) => checkPlatformLogin(item.id)));
}

const pickedPublishPlatforms = computed(() =>
  selectedPlatforms.value.filter((item) => platformPublishPicked.value[item.id] !== false),
);
const skippedPublishPlatforms = computed(() =>
  selectedPlatforms.value.filter((item) => platformPublishPicked.value[item.id] === false),
);

/**
 * 回答演示页上的发布确认。
 *
 * 不要求全部平台登录：勾选哪些就发哪些，未勾选的平台在回执里如实写明「未登录已跳过」，
 * 流程照样走到底并产出结果——但绝不允许把跳过写成发布成功。
 */
async function submitPublishConfirm(approved: boolean): Promise<void> {
  const pendingNode = jobPendingConfirm.value;
  if (!pendingNode || !jobRunId.value || confirmSubmitting.value) return;
  confirmSubmitting.value = true;
  try {
    const picked = pickedPublishPlatforms.value.map((item) => item.label);
    const skipped = skippedPublishPlatforms.value.map((item) => item.label);
    const reply = approved
      ? [
        i18nT('确认发布的平台：{list}', { list: picked.join('、') || i18nT('（无）') }),
        skipped.length
          ? i18nT('跳过的平台（未登录或本次不发）：{list}，请在回执中如实标注为未发布，不要写成成功。', { list: skipped.join('、') })
          : '',
      ].filter(Boolean).join('\n')
      : i18nT('暂不发布，请按修改意见调整后重新校验。');
    const result = await (window as any).electronAPI?.respondTaskRunHumanConfirm?.({
      runId: jobRunId.value,
      nodeId: pendingNode.nodeId,
      approved,
      reply,
      selectedOption: approved ? picked.join(i18nT('、')) : undefined,
    });
    if (!result || result.ok === false || result.stale) {
      notif.warn(i18nT('这条确认已经失效，正在刷新运行状态'));
    } else {
      notif.success(approved ? i18nT('已确认，开始分平台发布') : i18nT('已退回，等待修改后重新校验'));
      // 全局待办中心也订阅了同一条确认，通知它一并撤下，避免两处重复。
      window.dispatchEvent(new CustomEvent('totalclaw-human-confirm-resolved', {
        detail: { runId: jobRunId.value, nodeId: pendingNode.nodeId },
      }));
      jobPendingConfirm.value = null;
    }
    await refreshJobProgress();
  } catch (error: any) {
    notif.fromException(i18nT('提交发布确认失败'), error);
  } finally {
    confirmSubmitting.value = false;
  }
}

function handleJobRunEvent(event: any): void {
  if (!event?.runId) return;
  // 页面此刻展示的不是工作流进度（直连成片等）时，别让别处的运行事件写进来。
  if (lastJob.source !== 'workflow') return;
  if (!jobRunId.value) {
    if (event.kind === 'run-started') void refreshJobProgress();
    return;
  }
  if (String(event.runId) !== jobRunId.value) return;

  if (event.nodeStates) jobNodeStates.value = { ...event.nodeStates };
  // 别处（全局待办 / 对话页 / IM）已作答或该节点已结束：发布确认面板同步收起。
  if (
    (event.kind === 'human-confirm-resolved' || event.kind === 'node-completed' || event.kind === 'node-failed')
    && event.nodeId && jobPendingConfirm.value?.nodeId === String(event.nodeId)
  ) jobPendingConfirm.value = null;
  if (event.kind === 'run-started') {
    jobRunStatus.value = 'running';
    jobCurrentNodeName.value = i18nT('工作流已启动');
  } else if (event.kind === 'node-entered') {
    jobRunStatus.value = 'running';
    if (event.nodeId) {
      jobNodeStates.value = { ...jobNodeStates.value, [event.nodeId]: 'running' };
    }
    jobCurrentNodeName.value = String(event.nodeName || event.roleName || event.nodeId || i18nT('正在执行'));
  } else if (event.kind === 'node-completed') {
    if (event.nodeId) {
      jobNodeStates.value = { ...jobNodeStates.value, [event.nodeId]: 'done' };
    }
  } else if (event.kind === 'node-failed') {
    jobRunStatus.value = 'failed';
    if (event.nodeId) {
      jobNodeStates.value = { ...jobNodeStates.value, [event.nodeId]: 'failed' };
    }
    jobCurrentNodeName.value = String(event.error || event.nodeName || i18nT('节点执行失败'));
  } else if (event.kind === 'human-confirm-requested') {
    jobRunStatus.value = 'waiting_human';
    jobCurrentNodeName.value = String(event.nodeName || i18nT('等待人工确认'));
    if (event.nodeId) {
      jobPendingConfirm.value = {
        nodeId: String(event.nodeId),
        nodeName: event.nodeName ? String(event.nodeName).replace(/^[①②③④⑤⑥⑦⑧]\s*/, '') : undefined,
        question: event.humanConfirm?.question,
        detail: event.humanConfirm?.detail,
      };
      // 确认一出现就顺手探一遍登录态，用户打开页面即可看到哪些平台需要先登录。
      void checkAllPlatformLogins();
    }
  } else if (event.kind === 'run-completed') {
    jobRunStatus.value = 'success';
    jobCurrentNodeName.value = i18nT('全部制作步骤已完成');
    void refreshJobProgress();
    void refreshHistory();
  } else if (event.kind === 'run-failed') {
    jobRunStatus.value = 'failed';
    jobCurrentNodeName.value = String(event.error || i18nT('请进入制作对话查看失败原因'));
    void refreshJobProgress();
  } else if (event.kind === 'run-cancelled') {
    jobRunStatus.value = 'cancelled';
    jobCurrentNodeName.value = i18nT('任务已停止');
    void refreshJobProgress();
  }
}

async function openLastJob(): Promise<void> {
  if (!lastJob.conversationId) return;
  try {
    const conversation = await (window as any).electronAPI?.conversation?.get?.(lastJob.conversationId);
    if (!conversation?.id) {
      const recovered = await recoverLegacyVideoJob();
      if (!recovered) throw new Error(i18nT('这条制作任务已不存在'));
    }
    await router.push({
      path: '/conversations',
      query: { id: lastJob.conversationId, returnTo: '/video-studio' },
    });
  } catch (error) {
    notif.fromException(i18nT('无法打开制作进度'), error);
  }
}

async function loadVideoPreview(path: string): Promise<boolean> {
  const normalized = path.trim().replace(/^['"`]|['"`]$/g, '');
  if (!normalized || videoPreviewLoading.value) return false;
  videoPreviewLoading.value = true;
  videoPreviewOpen.value = true;
  try {
    const result = await (window as any).electronAPI?.solution?.previewMedia?.(normalized);
    const mediaSource = result?.srcUrl || result?.dataUrl;
    if (!result?.ok || !mediaSource) throw new Error(result?.error || i18nT('无法读取成片'));
    videoPreviewSrc.value = mediaSource;
    videoPreviewPath.value = result.path || normalized;
    return true;
  } catch (error) {
    notif.fromException(i18nT('成片预览失败'), error);
    return false;
  } finally {
    videoPreviewLoading.value = false;
  }
}

function candidateVideoPaths(content: string): string[] {
  const found: string[] = [];
  const add = (value: string | undefined) => {
    const path = String(value || '').trim().replace(/^['"`]|['"`]$/g, '');
    if (path && !found.includes(path)) found.push(path);
  };
  // F6：只认**显式产物标记**（TOTALCLAW_VIDEO_PREVIEW= / video_path 字段）。
  // 此前还有一条「正文里任何绝对路径 .mp4 都算候选」的兜底——agent 列个素材目录、
  // 引用一下旧成片路径，那些**别的任务/上一轮**的旧片就被采纳成本次结果
  //（E2E「每次都出同一条旧片」的采集面之一）。工作流指令第 4 条本就强制要求
  // 输出 TOTALCLAW_VIDEO_PREVIEW=绝对路径，合规运行不靠裸路径打捞。
  const explicitPatterns = [
    /(?:^|\n)TOTALCLAW_VIDEO_PREVIEW=(.+\.(?:mp4|m4v|webm|mov))\s*(?:\n|$)/ig,
    /["']?video_(?:path|file)["']?\s*[:=]\s*["'`](.+?\.(?:mp4|m4v|webm|mov))["'`]/ig,
    /["']?videoPath["']?\s*[:=]\s*["'`](.+?\.(?:mp4|m4v|webm|mov))["'`]/ig,
  ];
  for (const pattern of explicitPatterns) {
    let match: RegExpExecArray | null;
    while ((match = pattern.exec(content))) add(match[1]);
  }
  return found;
}

function rankVideoCandidates(paths: string[]): string[] {
  return [...new Set(paths)].sort((left, right) => {
    const score = (path: string): number => {
      const value = path.toLowerCase();
      let result = 0;
      if (lastJob.expectedVideoPath && path === lastJob.expectedVideoPath) result += 200;
      if (/totalclaw_video_preview/.test(value)) result += 120;
      if (/(^|[\\/])final(?:[_\-.]|$)/.test(value)) result += 100;
      if (/(mixed|master|publish|with[_-]?tts|成片)/.test(value)) result += 50;
      if (/(raw|reference|source|input|原始)/.test(value)) result -= 60;
      return result;
    };
    return score(right) - score(left);
  });
}

async function inspectVideoPath(path: string): Promise<string> {
  try {
    const result = await (window as any).electronAPI?.solution?.inspectMedia?.(path);
    return result?.ok && result?.path ? String(result.path) : '';
  } catch {
    return '';
  }
}

function persistLastJob(): void {
  try { localStorage.setItem(LAST_JOB_KEY, JSON.stringify(lastJob)); } catch { /* */ }
}

async function discoverVideoFromConversation(autoOpen = false): Promise<boolean> {
  const conversationId = lastJob.conversationId;
  if (!conversationId) return false;
  try {
    const candidates = [
      lastJob.videoPath,
      lastJob.expectedVideoPath,
    ].filter((item): item is string => !!item);
    const messages = await (window as any).electronAPI?.conversation?.getTranscript?.(conversationId);
    if (Array.isArray(messages)) {
      for (let index = messages.length - 1; index >= 0; index -= 1) {
        candidates.push(...candidateVideoPaths(String(messages[index]?.content || '')));
      }
    }
    for (const candidate of rankVideoCandidates(candidates)) {
      const verifiedPath = await inspectVideoPath(candidate);
      if (!verifiedPath) continue;
      const isNew = lastJob.videoPath !== verifiedPath;
      lastJob.videoPath = verifiedPath;
      persistLastJob();
      if (autoOpen && isNew) await loadVideoPreview(verifiedPath);
      return true;
    }
    if (lastJob.videoPath) {
      lastJob.videoPath = '';
      videoPreviewSrc.value = '';
      videoPreviewPath.value = '';
      persistLastJob();
    }
  } catch {
    // 对话仍在生成或暂不可读时，等待下一次 updated 事件。
  }
  return false;
}

/**
 * 早期版本只缓存 conversationId，没有固定成片路径。测试期间创建的“记录回归”
 * 对话也可能覆盖真实制作任务。仅在当前缓存没有成片、也没有新版本预期输出路径时，
 * 从最近的视频对话中恢复最后一个真实存在的最终成片。
 */
async function recoverLegacyVideoJob(): Promise<boolean> {
  // 面板已归直连成片所有时不许翻旧账：本次没产出就该显示没产出，
  // 从历史对话里捞一条无关的旧视频顶上，等于把别的成片冒充成这次的结果。
  if (lastJob.source === 'direct') return false;
  if (lastJob.expectedVideoPath || lastJob.videoPath) return false;
  // 已经在跟踪一个真实任务时绝不翻旧账。实测这条是「状态对不上」的总根源：
  // 它把 taskId 清空、conversationId 换成一条不相干的旧对话，紧接着
  // refreshJobProgress 又从那条旧对话反推出另一个 taskId——跟踪目标就此跳走，
  // 正在跑的 run 从界面上消失，防并行/防抢占的守卫也跟着全部失效。
  if (lastJob.taskId) return false;
  const conversationApi = (window as any).electronAPI?.conversation;
  if (!conversationApi?.list || !conversationApi?.getTranscript) return false;
  try {
    const rows = await conversationApi.list();
    const videoRows = (Array.isArray(rows) ? rows : [])
      .filter((item: any) => /视频|seedance|短片/i.test(String(item?.title || item?.lastMessagePreview || '')))
      .filter((item: any) => !containsLegacySample(item?.title, item?.lastMessagePreview))
      .slice(0, 20);
    for (const conversation of videoRows) {
      const messages = await conversationApi.getTranscript(conversation.id);
      if (!Array.isArray(messages)) continue;
      const candidates: string[] = [];
      for (let index = messages.length - 1; index >= 0; index -= 1) {
        const message = messages[index] || {};
        candidates.push(...candidateVideoPaths(String(message.content || '')));
        if (message.toolCalls) {
          candidates.push(...candidateVideoPaths(JSON.stringify(message.toolCalls)));
        }
      }
      for (const candidate of rankVideoCandidates(candidates)) {
        const verifiedPath = await inspectVideoPath(candidate);
        if (!verifiedPath) continue;
        lastJob.source = 'workflow';
        lastJob.conversationId = String(conversation.id);
        lastJob.projectName = String(conversation.title || i18nT('视频制作任务'))
          .replace(/^视频制作\s*[·\-]\s*/i, '');
        lastJob.workspaceId = undefined;
        lastJob.departmentId = undefined;
        lastJob.taskId = undefined;
        lastJob.expectedVideoPath = undefined;
        lastJob.videoPath = verifiedPath;
        persistLastJob();
        return true;
      }
    }
  } catch {
    // 旧任务恢复失败不影响新任务创建。
  }
  return false;
}

async function openLatestVideoPreview(): Promise<void> {
  const path = lastJob.videoPath;
  if (!path) return;
  if (videoPreviewSrc.value && videoPreviewPath.value === path) videoPreviewOpen.value = true;
  else await loadVideoPreview(path);
}

/**
 * 发布前的登录确认就在演示页上完成，不把人先甩到工作流页去答。
 *
 * 「全部登录」不是硬门槛：勾了哪些就发哪些，没登录的平台如实跳过、流程照样走到底。
 */
/**
 * 发布完成后不再把按钮永久锁成「已完成发布」（用户反馈：发完就再也发不了第二次）。
 * 改为显示「再次发布」，点击即清掉上一条回执重新开始 —— 同一条成片补发平台、
 * 或上一轮部分平台失败后重试，都是正常需求。
 */
async function openPublishConfirm(): Promise<void> {
  if (!hasPreviewVideo.value || publishing.value) return;
  // 再次发布：清掉上一轮回执，进度面板与按钮回到可发布状态。
  if (publishDone.value) clearPublishReceipt();
  publishing.value = true;
  try {
    const api = (window as any).electronAPI;
    if (!api?.publishRuns?.start) {
      throw new Error(i18nT('当前版本未开放本页发布'));
    }
    // 只发用户勾选的平台：未登录的在确认面板里被取消勾选，这里就不该再带上。
    const platformIds = (pickedPublishPlatforms.value.length ? pickedPublishPlatforms.value : selectedPlatforms.value)
      .map((item) => item.id);
    const topics = Object.fromEntries(
      selectedPlatforms.value.map((item) => [item.id, normalizeTopics(draft.topics[item.id] || '')]),
    );
    /**
     * 再次发布：优先回填上一次的入参（平台/话题/文案），只要成片没换、平台选择没改。
     * 让「补发一个平台」「上一轮失败重试」保持同一版文案与话题，不会因为重新调 LLM
     * 而出现同片两版文案；用户改了平台或换了成片才重新生成。
     */
    const previous = loadLastPublishInput();
    const sameVideo = !!previous && previous.videoPath === lastJob.videoPath;
    const samePlatforms = !!previous
      && previous.platformIds.length === platformIds.length
      && previous.platformIds.every((id) => (platformIds as string[]).includes(id));
    const reusable = sameVideo && samePlatforms && !!previous?.caption;
    // 发布文案：此前只塞一个品牌名（用户反馈「只有最简单的」）。这里让 LLM 按
    // 本次内容目标写一条真正能发的正文（钩子 + 卖点 + 行动号召），失败再回落品牌名。
    // 走纯补全通道（无工具、一轮出结果），与润色同链路。
    setPublishStage(reusable ? i18nT('复用上次发布文案…') : i18nT('正在生成发布文案…'));
    const caption = reusable ? previous!.caption : await buildPublishCaption();
    const mergedTopics = reusable
      ? { ...previous!.topics, ...topics }
      : topics;
    const input = {
      videoPath: lastJob.videoPath || '',
      projectName: lastJob.projectName || draft.projectName || i18nT('短视频发布任务'),
      platforms: [...platformIds] as string[],
      topics: mergedTopics,
      caption,
    };
    try {
      const snapshot: LastPublishInput = {
        videoPath: lastJob.videoPath || '',
        platformIds: [...platformIds] as string[],
        topics: mergedTopics,
        caption,
        projectName: input.projectName,
        savedAt: Date.now(),
      };
      localStorage.setItem(LAST_PUBLISH_INPUT_KEY, JSON.stringify(snapshot));
    } catch { /* 本地存储不可用不影响发布 */ }
    /**
     * S17a：发布在本页完成。这里只「准备」：主进程校验成片、打开平台登录页并复核登录，
     * 停在下方发布预览里等用户核对后点「确认发布」才提交。不建工作流、不跳工作流页或对话页。
     */
    setPublishStage(i18nT('正在准备发布预览…'));
    const run = await api.publishRuns.start({ kind: 'video', ownerPath: PUBLISH_OWNER_PATH, input }) as PublishRun;
    videoPreviewOpen.value = false;
    publishRunFocusId.value = run.id;
  } catch (error) {
    notif.fromException(i18nT('无法准备发布'), error);
  } finally {
    setPublishStage('');
    publishing.value = false;
  }
}

/**
 * 生成发布正文（一次 LLM 纯补全）。
 * 输入只给「品牌 / 项目 / 内容目标 / 目标平台」，输出一段可直接发布的中文文案：
 * 开头一句钩子、中间讲清核心卖点、结尾一句行动号召，控制在 120 字内，不带话题标签
 * （话题由 topics 单独带，避免重复）。任何失败都回落到品牌名，绝不阻断发布。
 */
async function buildPublishCaption(): Promise<string> {
  const fallback = draft.brandName || lastJob.projectName || draft.projectName || i18nT('品牌短视频');
  const brief = draft.brief.trim();
  if (!brief) return fallback;
  try {
    const api = (window as any).electronAPI;
    if (!api?.llmOneshot) return fallback;
    const reply = await api.llmOneshot({
      systemPrompt: i18nT('你是短视频运营，负责写发布文案。只输出正文本身，不要解释、不要引号、不要话题标签。'),
      prompt: [
        i18nT('品牌 / 项目：{p0}', { p0: draft.brandName || draft.projectName || fallback }),
        i18nT('目标平台：{p0}', { p0: selectedPlatformText.value }),
        '',
        i18nT('内容目标与关键信息：'),
        brief.slice(0, 1200),
        '',
        i18nT('写一条 120 字以内的中文发布正文：开头一句钩子抓住注意力，中间讲清最核心的卖点或看点，结尾一句行动号召。只依据上面给出的事实，不得虚构价格、地址、优惠或功效。现在只输出正文。'),
      ].join('\n'),
      timeoutMs: 120_000,
      plainCompletion: true,
    });
    const text = String(reply?.text || '').trim().replace(/^["'「」]+|["'「」]+$/g, '');
    return text ? text.slice(0, 300) : fallback;
  } catch {
    return fallback;
  }
}

async function closePublishConfirm(): Promise<void> {
  publishConfirmOpen.value = false;
  publishNativeBrowserLock.set(false);
}

async function onPublishDecision(decision: {
  approved: boolean;
  reply?: string;
  selectedOption?: string;
}): Promise<void> {
  if (publishing.value) return;
  if (!decision.approved) {
    await closePublishConfirm();
    jobCurrentNodeName.value = i18nT('发布已退回修改，成片仍保留');
    notif.info(i18nT('已退回修改，本次没有执行发布'));
    return;
  }
  publishing.value = true;
  jobNodeStates.value = {
    ...jobNodeStates.value,
    publish_approval: 'done',
    platform_publish: 'running',
  };
  jobRunStatus.value = 'running';
  jobCurrentNodeName.value = i18nT('正在执行分平台发布');
  try {
    /**
     * ⚠️ 这条路径此前是**假发布**（2026-08-07 审计删除）：
     * 原实现 `setTimeout(900)` 后直接写「N 个平台发布完成」+ notif.success，
     * 中间不执行任何真实上传或点击。当前 `publishConfirmOpen` 全文件只有 false
     * 赋值、这张卡渲染不出来，所以它是死代码 —— 但只要有人恢复这个确认 dock，
     * 它立刻变成一条「不发布也报成功」的伪造回执通路，比没有更危险。
     *
     * 真实发布走的是发布工作流（buildVideoPublishWorkflow → 主进程
     * uploadVideoInEmbeddedBrowser），回执由 run:completed 事件带回。
     * 这里不再伪造任何结果：如果将来要恢复人工确认卡，请把它接到工作流上。
     */
    throw new Error(i18nT('发布确认卡尚未接入真实发布流程，请从「去发布」进入发布工作流'));
  } finally {
    publishing.value = false;
  }
}

function closeVideoPreview(): void {
  videoPreviewOpen.value = false;
}

/**
 * 发布回执文案：published / unconfirmed / failed 必须分开讲（2026-08-07 审计）。
 *
 * 原来只读 platformCount 渲染「N 个平台发布完成」，而主进程那时把三种状态一律计入
 * 该字段 —— 平台弹了二次确认、90 秒读不到成功特征的 unconfirmed 也算「发布完成」，
 * 用户以为上线了，其实一条都没有。现在主进程分状态给数，这里如实呈现。
 */
function describePublishReceipt(receipt: any): string {
  const ok = Number(receipt?.platformCount || 0);
  const unconfirmed = Number(receipt?.unconfirmedCount || 0);
  const failed = Number(receipt?.failedCount || 0);
  // 旧回执（无分状态字段）保持原文案，避免历史记录显示成 0
  if (!('unconfirmedCount' in (receipt || {}))) {
    return i18nT('{p0} 个平台发布完成', { p0: ok });
  }
  const parts = [i18nT('{p0} 个平台发布完成', { p0: ok })];
  if (unconfirmed) {
    parts.push(i18nT('{p0} 个待人工核对（{p1}）', {
      p0: unconfirmed, p1: (receipt.unconfirmedPlatforms || []).join('、'),
    }));
  }
  if (failed) {
    parts.push(i18nT('{p0} 个失败（{p1}）', {
      p0: failed, p1: (receipt.failedPlatforms || []).join('、'),
    }));
  }
  return parts.join(i18nT('，'));
}

/**
 * 只在「用户还什么都没填」且「预置目录确实在本机」时，整套填入演示预置。
 * 任何一项已被用户动过就整套不填——预置是为了省去现场找目录，不是覆盖用户的输入。
 */
async function seedDemoDraft(): Promise<void> {
  const api = (window as any).electronAPI?.solution;
  if (!(await api?.folderExists?.(DEMO_MATERIAL_DIR).catch(() => false))) return;
  const seed = demoSeed();
  // 逐字段只填**当前为空**的那些，不整套覆盖。
  // 原来要求三个字段全空才填，结果只要用过一次工作台（localStorage 里有草稿），
  // 这条就永远不触发——素材目录该填的时候仍然是空的。
  if (!draft.materialDir.trim()) draft.materialDir = seed.materialDir;
  if (!draft.projectName.trim()) draft.projectName = seed.projectName;
  if (!draft.brandName.trim()) draft.brandName = seed.brandName;
  // 内容目标出厂就带一份通用版。只有在它仍是那份出厂文案（用户没动过）时才换成
  // 与预置素材匹配的版本；用户自己改过一个字，就不动。
  if (draft.brief.trim() === draftDefaults.brief.trim()) draft.brief = seed.brief;
  for (const p of Object.keys(draft.topics) as Array<keyof typeof draft.topics>) {
    const cur = String(draft.topics[p] || '').trim();
    if (!cur || cur === draftDefaults.topics[p]) draft.topics[p] = seed.topics;
  }
}

onMounted(() => {
  void seedDemoDraft();
  try {
    const stored = JSON.parse(localStorage.getItem(PUBLISH_RECEIPT_KEY) || 'null');
    // 只保留回执文字，绝不据此点亮进度/置 success。
    // 旧实现进页面读到上一次的发布回执就把状态写成「已完成」，于是表单还空着、
    // 素材都没选，页面已经显示「素材已扫描完成 / 成片已就绪」——全是上一轮的残影。
    // 进度真值只能来自本次运行（直连管线写入）或经磁盘核验的成片绑定。
    if (stored?.kind === 'run:completed') {
      const receipt = JSON.parse(String(stored?.finalVariables?.node_receipt_result || '{}'));
      publishReceipt.value = describePublishReceipt(receipt);
    }
  } catch { /* 旧版或损坏的回写记录不影响工作台 */ }
  void loadModelState();
  // 别处（设置页 / 广告工作台）配好模型后要即时反映：mediaModel.save 会广播
  // MEDIA_MODEL_CHANGED。没有它的话用户配完 ARK Key 回到这里仍显示「未配置」、
  // Seedance 也不会自动可选，得离开页面再进来才刷新。
  try { unsubMediaModel = (window as any).electronAPI?.onMediaModelChanged?.(() => { void loadModelState(); }); } catch { /* 无该通道则忽略 */ }
  void (async () => {
    // 「内置演示成片」整套机制已于 2026-08-06 拆除（函数/常量/预览分支/写死文案全删）：
    // 它会把一条 42 秒演示片写进 lastJob 并伪造出全套「已完成」状态，用户每次进页面
    // 都看到「已复用完成渲染的 42 秒成片」——生成根本没跑过。生成必须真跑，没有捷径。
    //
    // 持久化绑定的核验对**所有来源**生效（此前只核 source==='direct'，旧数据/工作流来源
    // 的绑定绕开核验，演示片就是从这个缺口复活的）：磁盘上没有这个文件就一律放手归零。
    if (pendingRestoreVideoPath) {
      const verifiedRestore = await inspectVideoPath(pendingRestoreVideoPath);
      if (verifiedRestore) {
        // 核验通过才让它成为「本次成片」，进度面板同步点亮。
        lastJob.videoPath = pendingRestoreVideoPath;
      }
      if (!verifiedRestore) {
        lastJob.source = 'none';
        dropStaleResultBinding();
        jobRunStatus.value = 'idle';
        jobNodeStates.value = {};
        jobProgressNodes.value = [...defaultJobProgressNodes];
        jobCurrentNodeName.value = i18nT('填写方案并启动后，这里会实时显示每一步');
      } else {
        jobProgressNodes.value = [...slideshowProgressNodes];
        jobNodeStates.value = { scan: 'done', stage: 'done', render: 'done' };
        jobRunStatus.value = 'success';
        jobCurrentNodeName.value = i18nT('成片已完成，可预览并进入发布');
      }
    }
    await refreshJobProgress();
    // 服务端还有活着的 run 时，下面这些「清理/翻旧账」的自愈分支一律不许动跟踪目标。
    // 实测链路：清理分支先把 taskId 抹掉 → recoverLegacyVideoJob 捞一条不相干的旧对话
    // → refreshJobProgress 又从那条对话反推出另一个 taskId，跟踪目标就此跳走，
    // 正在跑的 run 从界面上消失，防并行/防抢占的守卫也跟着全部失效。
    // 自愈只该处理「确实没有任何东西在跑」的残局。
    const trackingLiveRun = await hasLiveWorkflowRun();
    // 上一轮跑失败/被取消的运行，不该成为这次进页面的落地状态。
    // 它是真的（那条 run 确实停在 6/8），但显示成「视频制作已取消 · 75%」会让人以为
    // 当前有个任务卡住了，而实际上这里根本没有进行中的任务。终态且没留下成片就放手。
    //
    // 两种例外**必须留着**（2026-10-13）：
    //   ① 上次直连成片被应用重启 / 页面刷新打断 —— 用户要看到「已中断 + 重新生成」，
    //      抹成空闲等于把事故藏起来；
    //   ② 本进程里直连成片跑失败了、用户换页又回来 —— 失败原因与「重新生成」要还在。
    const keepDirectOutcome = jobInterrupted.value
      || (lastJob.source === 'direct' && !!jobRunMode.value && jobRunStatus.value === 'failed');
    if (!trackingLiveRun
      && !keepDirectOutcome
      && ['cancelled', 'failed'].includes(jobRunStatus.value)
      && !(lastJob.videoPath && await inspectVideoPath(lastJob.videoPath))) {
      lastJob.source = 'none';
      lastJob.taskId = undefined;
      lastJob.workspaceId = undefined;
      lastJob.departmentId = undefined;
      lastJob.conversationId = '';
      lastJob.videoPath = '';
      lastJob.expectedVideoPath = undefined;
      persistLastJob();
      jobRunId.value = '';
      jobNodeStates.value = {};
      jobProgressNodes.value = [...defaultJobProgressNodes];
      jobRunStatus.value = 'idle';
      jobRunMode.value = '';
      jobCurrentNodeName.value = i18nT('填写方案并启动后，这里会实时显示每一步');
    }
    await refreshHistory();
    // 直连来源的结果绑定只认自己产出的文件，不去对话里捞（同上事故）。
    const found = lastJob.source === 'direct' ? false : await discoverVideoFromConversation(false);
    if (!trackingLiveRun && !found && !lastJob.expectedVideoPath && !lastJob.taskId) {
      await recoverLegacyVideoJob();
    }
  })();
  const conversationApi = (window as any).electronAPI?.conversation;
  unsubscribeConversationUpdated = conversationApi?.onUpdated?.((conversation: any) => {
    if (conversation?.id !== lastJob.conversationId) return;
    // 直连管线（Seedance / 图片成片）不产生对话，这条「从对话里发现成片」是工作流时代的
    // 遗留。实测事故：Seedance 正在跑（零产出），它翻出对话里一条**上一轮**的
    // 成片-时间戳.mp4，核实文件存在就认成本次成果并自动弹预览——用户看到的是
    // 「跑完了 + 一条很土的片子」，而真正的生成还在后台等 API。
    // 直连跑着时它一律让开；本轮结果只由直连管线自己写入。
    if (lastJob.source === 'direct' || jobRunStatus.value === 'running') return;
    void discoverVideoFromConversation(true);
  }) || null;
  const rootApi = (window as any).electronAPI;
  unsubscribeTaskRun = rootApi?.onTaskRunEvent?.(handleJobRunEvent) || null;
  jobProgressPoll = window.setInterval(() => {
    void refreshJobProgress();
  }, 3000);
});

/**
 * 直连管线是别的实例起的（用户换页又回来）：运行态是模块级的所以进度照样显示，
 * 但结果绑定（lastJob）是组件级的 —— 老实例的闭包只会写它自己那份 + localStorage。
 * 这里盯着模块级状态翻终态：成功就从 localStorage 认领成片、打开预览、刷历史；
 * 失败 / 取消就把本实例的结果绑定清掉（老闭包清的是它自己那份）。
 */
watch(jobRunStatus, (status, prev) => {
  if (ownsDirectRun.value || prev !== 'running' || !jobRunMode.value) return;
  if (status === 'success') {
    const stored = loadStored<LastJob>(LAST_JOB_KEY, { conversationId: '', projectName: '' });
    if (stored.source !== 'direct' || !stored.videoPath) return;
    lastJob.source = 'direct';
    lastJob.conversationId = '';
    lastJob.taskId = undefined;
    lastJob.workspaceId = undefined;
    lastJob.departmentId = undefined;
    lastJob.projectName = String(stored.projectName || lastJob.projectName || '');
    lastJob.expectedVideoPath = stored.expectedVideoPath || stored.videoPath;
    lastJob.videoPath = String(stored.videoPath);
    void loadVideoPreview(lastJob.videoPath);
    void refreshHistory();
  } else if (status === 'failed' || status === 'cancelled') {
    if (lastJob.source === 'direct') dropStaleResultBinding();
  }
});

onBeforeUnmount(() => {
  publishNativeBrowserLock.release();
  unsubscribeConversationUpdated?.();
  unsubscribeConversationUpdated = null;
  unsubscribeTaskRun?.();
  unsubscribeTaskRun = null;
  if (jobProgressPoll) window.clearInterval(jobProgressPoll);
  jobProgressPoll = null;
  // 发布阶段计时器：发布中途切走页面时 finally 还没跑到，不清会一直写已销毁组件的 ref
  if (publishStageTimer) window.clearInterval(publishStageTimer);
  publishStageTimer = null;
});
</script>

<style scoped>
.video-studio-page {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding: 26px 28px 40px;
  color: var(--color-text-primary);
  background:
    var(--vsv-grad);
}
.studio-hero {
  display: flex; align-items: center; justify-content: space-between; gap: 28px;
  max-width: 1320px; margin: 0 auto 18px; padding: 26px 30px; overflow: hidden;
  border: 1px solid color-mix(in srgb, var(--color-brand) 20%, var(--color-border)); border-radius: var(--radius-8);
  background:
    linear-gradient(
      135deg,
      color-mix(in srgb, var(--color-bg-card) 96%, var(--color-brand) 4%),
      color-mix(in srgb, var(--color-bg-card) 89%, var(--color-brand) 11%)
    );
  box-shadow: var(--shadow-md);
}
.hero-copy { min-width: 0; margin-inline-end: auto; }
.hero-kicker { display: inline-flex; align-items: center; gap: 7px; margin-bottom: 9px; color: var(--color-brand); font-size: var(--font-size-sm); font-weight: 700; letter-spacing: .03em; }
.hero-copy h1 { margin: 0; font-size: 27px; line-height: 1.25; letter-spacing: -.02em; }
.hero-copy p { max-width: 700px; margin: 10px 0 0; color: var(--color-text-secondary); font-size: var(--font-size-base); line-height: 1.7; }
.hero-actions { display: grid; justify-items: end; flex: 0 0 auto; gap: 15px; }
.hero-flow { display: flex; align-items: center; flex: 0 0 auto; }
.flow-step { display: grid; justify-items: center; gap: 6px; color: var(--color-text-muted); }
.flow-step span { display: grid; place-items: center; width: 38px; height: 38px; border: 1px solid var(--color-border); border-radius: 50%; background: var(--color-bg-card); }
.flow-step.ready span { color: var(--color-brand); border-color: var(--vsv-brand-a24); background: var(--color-brand-subtle); }
.flow-step.active span { color: var(--color-on-accent); border-color: var(--color-brand); background: var(--color-brand); box-shadow: 0 0 0 5px var(--color-brand-subtle); }
.flow-step.active small { color: var(--color-brand); font-weight: 700; }
.flow-step small { color: var(--color-text-secondary); font-size: var(--font-size-sm); font-weight: 500; white-space: nowrap; }
.flow-arrow { margin: 0 8px 20px; color: var(--color-text-muted); }

.job-progress-panel {
  /* 进度条必须始终在可视范围内（产品硬规则）：制作过程动辄几分钟，用户会往下翻
     素材/文案，进度一旦滚出视口就等于「不知道跑到哪了」。sticky 让它吸在顶部。
     z-index 低于弹层家族（9000+），不会盖住确认卡与预览。 */
  position: sticky; top: 8px; z-index: 20;
  max-width: 1320px; box-sizing: border-box; margin: 0 auto 18px; padding: 15px 17px;
  border: 1px solid color-mix(in srgb, var(--color-brand) 20%, var(--color-border)); border-radius: var(--radius-7);
  /* 半透明 + 毛玻璃：吸顶后它会盖在表单上方，实心底色遮挡感太强（用户反馈）。
     82% 不透明度既保证进度文字清晰可读，又能透出下方内容的位置感。 */
  background: color-mix(in srgb, color-mix(in srgb, var(--color-bg-card) 96%, var(--color-brand) 4%) 82%, transparent);
  backdrop-filter: var(--vsv-blur);
  -webkit-backdrop-filter: var(--vsv-blur);
  box-shadow: var(--shadow-md);
}
.job-progress-heading { display: flex; align-items: center; justify-content: space-between; gap: 16px; }
.job-progress-title { display: flex; flex: 1 1 auto; align-items: center; gap: 10px; min-width: 0; }
.job-progress-title > div { display: grid; min-width: 0; gap: 3px; }
.job-progress-title strong { font-size: 13.5px; }
.job-progress-title small { overflow: hidden; color: var(--color-text-secondary); font-size: 11.5px; text-overflow: ellipsis; white-space: nowrap; }
.job-progress-icon { display: grid; place-items: center; flex: 0 0 auto; width: 34px; height: 34px; border-radius: var(--radius-4); color: var(--color-brand); background: var(--color-brand-subtle); }
.job-progress-number { display: grid; justify-items: end; flex: 0 0 auto; gap: 1px; }
.job-progress-number strong { color: var(--color-brand); font-size: 19px; line-height: 1; }
.job-progress-number span { color: var(--color-text-muted); font-size: 10px; }
.job-progress-time { color: var(--color-brand); font-size: 10.5px; font-variant-numeric: tabular-nums; }
.job-progress-track { height: 7px; margin: 12px 0; overflow: hidden; border-radius: var(--radius-pill); background: var(--color-bg-input); }
.job-progress-track > i { display: block; height: 100%; border-radius: inherit; background: var(--gradient-brand); transition: width .35s ease; }
.job-progress-stages { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 8px; }
.job-progress-stage {
  display: grid; grid-template-columns: 16px minmax(0, 1fr); align-items: center; column-gap: 5px; min-width: 0;
  padding: 7px 8px; border: 1px solid var(--color-border); border-radius: var(--radius-3); color: var(--color-text-muted); background: var(--color-bg-card);
}
.job-progress-stage > i { grid-row: 1 / span 2; font-size: var(--font-size-base); }
.job-progress-stage > span { color: var(--color-text-secondary); font-size: var(--font-size-xs); font-weight: 700; }
.job-progress-stage > small { overflow: hidden; font-size: 9.5px; text-overflow: ellipsis; white-space: nowrap; }
.job-progress-stage.is-active { color: var(--color-brand); border-color: color-mix(in srgb, var(--color-brand) 36%, var(--color-border)); background: var(--color-brand-subtle); }
.job-progress-stage.is-active > span { color: var(--color-brand); }
.job-progress-stage.is-done { color: var(--color-success); border-color: color-mix(in srgb, var(--color-success) 26%, var(--color-border)); }
.job-progress-panel.is-failed .job-progress-icon { color: var(--color-danger); background: var(--color-status-danger-bg); }
.job-stop-btn {
  display: inline-flex; align-items: center; gap: 4px; flex: 0 0 auto; min-height: 28px; padding: 0 10px;
  border: 1px solid color-mix(in srgb, var(--color-danger) 38%, var(--color-border)); border-radius: var(--radius-2); cursor: pointer; font: inherit;
  font-size: var(--font-size-xs); font-weight: 700; color: var(--color-danger); background: var(--color-bg-card);
}
.job-stop-btn:disabled { opacity: .45; cursor: not-allowed; }

.publish-confirm-panel {
  max-width: 1320px; box-sizing: border-box; margin: 0 auto 18px; padding: 15px 17px;
  border: 1px solid color-mix(in srgb, var(--color-warning) 42%, var(--color-border)); border-radius: var(--radius-7);
  background: color-mix(in srgb, var(--color-bg-card) 92%, var(--color-warning) 8%); box-shadow: var(--shadow-sm);
}
.publish-confirm-head { display: flex; align-items: center; gap: 10px; }
.publish-confirm-head > div { display: grid; min-width: 0; gap: 3px; margin-inline-end: auto; }
.publish-confirm-head strong { font-size: 13.5px; }
.publish-confirm-head small { color: var(--color-text-secondary); font-size: 11.5px; }
.publish-confirm-icon {
  display: grid; place-items: center; flex: 0 0 auto; width: 34px; height: 34px;
  border-radius: var(--radius-4); color: var(--color-warning); background: color-mix(in srgb, var(--color-warning) 16%, transparent);
}
.publish-confirm-hint { margin: 10px 0 12px; color: var(--color-text-secondary); font-size: 11.5px; line-height: 1.6; }
.publish-confirm-list { display: grid; gap: 8px; margin: 0; padding: 0; list-style: none; }
.publish-confirm-list > li {
  display: flex; align-items: center; gap: 10px; padding: 8px 10px;
  border: 1px solid var(--color-border); border-radius: var(--radius-4); background: var(--color-bg-card);
}
.publish-confirm-pick { display: flex; align-items: center; gap: 8px; margin-inline-end: auto; cursor: pointer; }
.publish-confirm-name { font-size: 12.5px; font-weight: 700; }
.publish-confirm-state { display: inline-flex; align-items: center; gap: 4px; font-size: var(--font-size-xs); }
.publish-confirm-state.is-ready { color: var(--color-success); }
.publish-confirm-state.is-absent { color: var(--color-danger); }
.publish-confirm-state.is-checking,
.publish-confirm-state.is-unknown { color: var(--color-text-muted); }
.publish-confirm-actions { display: flex; flex-wrap: wrap; align-items: center; min-width: 0; gap: 10px; margin-top: 14px; }
.publish-confirm-summary { margin-inline-end: auto; color: var(--color-text-secondary); font-size: 11.5px; }

.history-list { display: grid; gap: 6px; margin: 10px 0 0; padding: 0; list-style: none; }
.history-item {
  display: flex; align-items: center; gap: 8px; padding: 7px 9px;
  border: 1px solid var(--color-border); border-radius: var(--radius-3); background: var(--color-bg-card);
}
.history-main { display: grid; min-width: 0; gap: 2px; margin-inline-end: auto; }
.history-main strong { overflow: hidden; font-size: var(--font-size-sm); text-overflow: ellipsis; white-space: nowrap; }
.history-main small { color: var(--color-text-muted); font-size: 10px; }
.history-status { flex: 0 0 auto; font-size: 10.5px; }
.history-status.is-success { color: var(--color-success); }
.history-status.is-failed, .history-status.is-cancelled { color: var(--color-danger); }
.history-status.is-running, .history-status.is-waiting_human { color: var(--color-brand); }
.history-publish {
  display: inline-flex; align-items: center; gap: 4px; flex: 0 0 auto; padding: 4px 8px;
  border: 1px solid var(--color-border); border-radius: var(--radius-2); font-size: var(--font-size-xs); cursor: pointer;
  color: var(--color-brand); background: var(--color-brand-subtle);
}
.history-publish:disabled { color: var(--color-text-muted); background: var(--color-bg-input); cursor: not-allowed; }
.history-pager { display: flex; align-items: center; justify-content: center; gap: 10px; margin-top: 10px; font-size: var(--font-size-xs); }
.history-pager button {
  display: grid; place-items: center; width: 24px; height: 24px; border: 1px solid var(--color-border);
  border-radius: var(--radius-2); background: var(--color-bg-card); cursor: pointer;
}
.history-pager button:disabled { color: var(--color-text-muted); cursor: not-allowed; }

.model-strip { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr) 42px; gap: 12px; max-width: 1320px; margin: 0 auto 18px; }
.model-card { display: flex; align-items: center; gap: 12px; min-width: 0; padding: 13px 14px; border: 1px solid var(--color-border); border-radius: var(--radius-6); background: var(--color-bg-card); box-shadow: var(--shadow-sm); }
.model-icon { display: grid; place-items: center; flex: 0 0 auto; width: 38px; height: 38px; border-radius: var(--radius-4); font-size: var(--font-size-xl); }
.model-icon.voice { color: var(--vsv-brand); background: var(--vsv-brand-a10); }
.model-icon.video { color: var(--vsv-info); background: var(--vsv-info-a10); }
.model-copy { flex: 1; min-width: 0; }
.model-heading { display: flex; align-items: center; gap: 7px; }
.model-heading strong { font-size: 13.5px; }
.model-heading em { color: var(--color-text-secondary); font-size: var(--font-size-sm); font-style: normal; font-weight: 500; }
.status-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--color-text-muted); }
.status-ready .status-dot { background: var(--color-success); box-shadow: var(--vsv-shadow); }
.status-partial .status-dot { background: var(--color-warning); }
.status-missing .status-dot { background: var(--color-danger); }
.model-copy p { margin: 4px 0 0; overflow: hidden; color: var(--color-text-secondary); font-size: var(--font-size-sm); text-overflow: ellipsis; white-space: nowrap; }
.model-action, .refresh-models { border: 0; border-radius: var(--radius-3); color: var(--color-brand); background: var(--color-brand-subtle); cursor: pointer; font-family: inherit; }
.model-action { display: inline-flex; align-items: center; gap: 4px; padding: 8px 10px; font-size: var(--font-size-sm); font-weight: 600; white-space: nowrap; }
.model-action:hover, .refresh-models:hover { background: var(--vsv-brand-a17); }
.refresh-models { display: grid; place-items: center; font-size: 16px; }

.studio-grid { display: grid; grid-template-columns: minmax(0, 1fr) 310px; align-items: start; gap: 18px; max-width: 1320px; margin: 0 auto; }
.studio-form { display: grid; gap: 14px; min-width: 0; }
.form-card, .aside-card { border: 1px solid var(--color-border); border-radius: var(--radius-7); background: var(--color-bg-card); box-shadow: var(--shadow-sm); }
.form-card { padding: 22px; }
.section-head { display: flex; align-items: flex-start; gap: 12px; margin-bottom: 19px; }
.section-index { display: grid; place-items: center; flex: 0 0 auto; width: 32px; height: 32px; border-radius: var(--radius-3); color: var(--color-brand); background: var(--color-brand-subtle); font-size: var(--font-size-xs); font-weight: 800; }
.section-head h2 { margin: 0; font-size: 17px; }
.section-head p { margin: 6px 0 0; color: var(--color-text-secondary); font-size: var(--font-size-md); line-height: 1.55; }
.demo-preset-button { display: inline-flex; align-items: center; gap: 5px; flex: 0 0 auto; height: 34px; margin-left: auto; padding: 0 11px; border: 1px solid var(--vsv-brand-a22); border-radius: var(--radius-3); color: var(--color-brand); background: var(--color-brand-subtle); cursor: pointer; font: inherit; font-size: var(--font-size-sm); font-weight: 700; white-space: nowrap; }
.demo-preset-button:hover { border-color: var(--vsv-brand-a42); background: var(--vsv-brand-a16); }

.field-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 13px; }
.field { display: grid; gap: 7px; min-width: 0; }
.field.full { margin-top: 14px; }
.field > span { color: var(--color-text-primary); font-size: var(--font-size-md); font-weight: 650; }
.field > span b { margin-left: 4px; color: var(--color-danger); font-size: 10px; }
.field-label-row { display: flex; align-items: center; justify-content: space-between; gap: 12px; }
.field-label-row > span { min-width: 0; }
.field-label-row > button { display: inline-flex; align-items: center; justify-content: center; gap: 5px; flex: 0 0 auto; height: 30px; padding: 0 10px; border: 1px solid var(--vsv-brand-a24); border-radius: var(--radius-3); color: var(--color-brand); background: var(--color-brand-subtle); cursor: pointer; font: inherit; font-size: 11.5px; font-weight: 700; }
.field-label-row > button:hover:not(:disabled) { border-color: var(--vsv-brand-a42); background: var(--vsv-brand-a16); }
.field-label-row > button:disabled { cursor: not-allowed; filter: grayscale(.25); opacity: .55; }
.field input, .field textarea, .field select, .folder-picker { box-sizing: border-box; width: 100%; border: 1px solid var(--color-border); border-radius: var(--radius-4); color: var(--color-text-primary); background: var(--color-bg-input); font: inherit; font-size: var(--font-size-base); outline: none; }
.field input::placeholder, .field textarea::placeholder, .folder-picker input::placeholder {
  color: var(--color-text-secondary);
  opacity: .92;
}
.field input, .field select { height: 41px; padding: 0 12px; }
.field textarea { min-height: 116px; padding: 11px 12px; resize: vertical; line-height: 1.6; }
.field input:focus, .field textarea:focus, .field select:focus, .folder-picker:focus-within { border-color: var(--color-brand); box-shadow: var(--shadow-focus); }
.field > small { justify-self: end; margin-top: -2px; color: var(--color-text-secondary); font-size: var(--font-size-xs); }
.folder-picker { display: flex; align-items: center; gap: 8px; padding: 4px 5px 4px 12px; }
.folder-picker > i { flex: 0 0 auto; color: var(--color-brand); font-size: 17px; }
.folder-picker input { flex: 1; min-width: 0; height: 32px; padding: 0; border: 0; box-shadow: none; background: transparent; }
.folder-picker input:focus { box-shadow: none; }
.folder-picker button { flex: 0 0 auto; height: 33px; padding: 0 12px; border: 0; border-radius: var(--radius-3); color: var(--color-brand); background: var(--color-brand-subtle); cursor: pointer; font: inherit; font-size: var(--font-size-sm); font-weight: 700; }

.choice-grid { display: grid; gap: 10px; }
.production-grid { grid-template-columns: repeat(4, minmax(0, 1fr)); }
.render-ratio { width: min(260px, 100%); margin-top: 14px; }
.choice-card { position: relative; display: grid; align-content: start; justify-items: start; gap: 7px; min-height: 118px; padding: 14px; border: 1px solid var(--color-border); border-radius: var(--radius-5); color: var(--color-text-primary); background: var(--color-bg-card); cursor: pointer; text-align: left; font-family: inherit; }
.choice-card:hover { border-color: var(--vsv-brand-a42); transform: translateY(-1px); }
.choice-card.active { border-color: var(--color-brand); background: var(--color-brand-subtle); box-shadow: inset 0 0 0 1px var(--color-brand); }
.choice-icon { display: grid; place-items: center; width: 31px; height: 31px; border-radius: var(--radius-3); color: var(--color-brand); background: var(--color-brand-subtle); }
.choice-card.active .choice-icon { color: var(--color-on-accent); background: var(--color-brand); }
.choice-card strong { font-size: 13.5px; }
.choice-card small { color: var(--color-text-secondary); font-size: var(--font-size-sm); line-height: 1.5; }
.choice-check { position: absolute; top: 10px; right: 10px; color: var(--color-brand); opacity: 0; }
.choice-card.active .choice-check { opacity: 1; }
/* 未配置生成 token 的模式：置灰且不可点，hover 不再抬起，避免看起来还能选。 */
.choice-card.unavailable { opacity: .45; cursor: not-allowed; }
.choice-card.unavailable:hover { border-color: var(--color-border); transform: none; }
.config-hint {
  display: flex; align-items: center; gap: 8px; margin-top: 12px; padding: 10px 12px;
  border: 1px solid var(--vsv-warn-a22); border-radius: var(--radius-4);
  color: var(--color-status-warning-fg); background: var(--color-status-warning-bg); font-size: var(--font-size-xs);
}
.config-hint > span { flex: 1; line-height: 1.45; }
.config-hint button {
  flex: 0 0 auto; padding: 5px 9px; border: 0; border-radius: var(--radius-2);
  color: var(--color-status-warning-fg); background: var(--vsv-warn-a12);
  cursor: pointer; font: inherit; font-weight: 600;
}

.audio-row { display: grid; grid-template-columns: 1fr 280px; gap: 13px; }
.toggle-card { display: flex; align-items: center; justify-content: space-between; gap: 14px; min-height: 66px; padding: 0 14px; border: 1px solid var(--color-border); border-radius: var(--radius-5); cursor: pointer; }
.toggle-copy { display: flex; align-items: center; gap: 10px; }
.toggle-copy > i { color: var(--color-brand); font-size: 21px; }
.toggle-copy > span { display: grid; gap: 3px; }
.toggle-copy strong { font-size: var(--font-size-md); }
.toggle-copy small { color: var(--color-text-secondary); font-size: var(--font-size-sm); }
.toggle-card input { position: absolute; opacity: 0; pointer-events: none; }
.switch { position: relative; width: 38px; height: 22px; border-radius: var(--radius-pill); background: var(--color-border); transition: background-color .2s; }
.switch::after { content: ''; position: absolute; top: 3px; left: 3px; width: 16px; height: 16px; border-radius: 50%; background: var(--vsv-surface); box-shadow: var(--vsv-shadow-2); transition: transform .2s; }
.toggle-card input:checked + .switch { background: var(--color-brand); }
.toggle-card input:checked + .switch::after { transform: translateX(16px); }
.music-field { align-content: center; }
.voice-style { margin-top: 12px !important; }

.platform-grid { display: grid; grid-template-columns: repeat(4, minmax(0,1fr)); gap: 10px; }
.platform-card { position: relative; display: flex; align-items: center; gap: 10px; min-width: 0; padding: 12px; border: 1px solid var(--color-border); border-radius: var(--radius-5); cursor: pointer; }
.platform-card input { position: absolute; opacity: 0; }
.platform-mark { display: grid; place-items: center; flex: 0 0 auto; width: 32px; height: 32px; border-radius: var(--radius-3); color: var(--color-on-accent); background: var(--vsv-dark); font-size: var(--font-size-sm); font-weight: 800; }
.platform-card.douyin .platform-mark { background: var(--vsv-grad-2); }
.platform-card.kuaishou .platform-mark { background: var(--vsv-warn); }
.platform-card.xiaohongshu .platform-mark { background: var(--vsv-danger); }
.platform-card.wxchannels .platform-mark { background: var(--vsv-ok); }
.platform-card > span:nth-of-type(2) { display: grid; min-width: 0; gap: 3px; }
.platform-card strong { font-size: var(--font-size-md); }
.platform-card small { overflow: hidden; color: var(--color-text-secondary); font-size: 11.5px; text-overflow: ellipsis; white-space: nowrap; }
.platform-card > i { position: absolute; top: 8px; right: 8px; color: var(--color-brand); opacity: 0; }
.platform-card.active { border-color: var(--color-brand); background: var(--color-brand-subtle); }
.platform-card.active > i { opacity: 1; }
.platform-topics { margin-top: 14px; padding: 14px; border: 1px solid var(--color-border); border-radius: var(--radius-5); background: var(--color-bg-input); }
.topics-heading { display: flex; align-items: flex-start; justify-content: space-between; gap: 12px; margin-bottom: 11px; }
.topics-heading > div { display: grid; gap: 4px; }
.topics-heading strong { font-size: var(--font-size-md); }
.topics-heading small { color: var(--color-text-secondary); font-size: 11.5px; line-height: 1.45; }
.topics-heading > span { display: inline-flex; align-items: center; gap: 4px; flex: 0 0 auto; padding: 5px 8px; border-radius: var(--radius-pill); color: var(--color-brand); background: var(--color-brand-subtle); font-size: 10.5px; font-weight: 700; }
.topic-grid { display: grid; grid-template-columns: repeat(2, minmax(0,1fr)); gap: 9px; }
.topic-field { display: grid; gap: 6px; min-width: 0; }
.topic-field > span { display: flex; align-items: center; gap: 6px; color: var(--color-text-secondary); font-size: 11.5px; font-weight: 650; }
.topic-mark { display: grid; place-items: center; width: 20px; height: 20px; border-radius: var(--radius-2); color: var(--color-on-accent); background: var(--vsv-dark); font-size: 9px; }
.topic-mark.douyin { background: var(--vsv-grad-2); }
.topic-mark.kuaishou { background: var(--vsv-warn); }
.topic-mark.xiaohongshu { background: var(--vsv-danger); }
.topic-mark.wxchannels { background: var(--vsv-ok); }
.topic-field input { box-sizing: border-box; width: 100%; height: 38px; min-width: 0; padding: 0 11px; border: 1px solid var(--color-border); border-radius: var(--radius-3); color: var(--color-text-primary); background: var(--color-bg-card); outline: none; font: inherit; font-size: 12.5px; }
.topic-field input::placeholder { color: var(--color-text-secondary); opacity: .8; }
.topic-field input:focus { border-color: var(--color-brand); box-shadow: var(--shadow-focus); }
.release-policy { display: flex; align-items: flex-start; gap: 10px; margin-top: 14px; padding: 12px 14px; border: 1px solid color-mix(in srgb, var(--color-status-success-fg) 20%, transparent); border-radius: var(--radius-5); color: var(--color-status-success-fg); background: var(--color-status-success-bg); }
.release-policy > i { margin-top: 1px; font-size: 20px; }
.release-policy strong { font-size: 12.5px; }
.release-policy p { margin: 4px 0 0; color: var(--color-status-success-fg); font-size: var(--font-size-sm); line-height: 1.55; opacity: .84; }

.submit-bar { position: sticky; bottom: 10px; z-index: 3; display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 12px 20px; padding: 15px 17px; border: 1px solid color-mix(in srgb, var(--color-brand) 24%, var(--color-border)); border-radius: var(--radius-7); background: color-mix(in srgb, var(--color-bg-elevated) 92%, transparent); box-shadow: var(--shadow-lg); -webkit-backdrop-filter: var(--vsv-blur-2); backdrop-filter: var(--vsv-blur-2); }
.submit-summary { display: grid; min-width: 0; gap: 4px; }
.submit-summary strong { overflow: hidden; font-size: 12.5px; text-overflow: ellipsis; white-space: nowrap; }
.submit-summary span { color: var(--color-text-secondary); font-size: var(--font-size-sm); }
.submit-actions { display: flex; flex-wrap: wrap; align-items: center; justify-content: flex-end; min-width: 0; gap: 9px; }
.publish-video-button {
  display: inline-flex; align-items: center; justify-content: center; gap: 6px; flex: 0 0 auto;
  height: 40px; padding: 0 14px; border: 0; border-radius: var(--radius-4); color: var(--color-on-accent);
  background: var(--vsv-grad-3);
  box-shadow: var(--vsv-shadow-3); cursor: pointer; font: inherit;
  font-size: var(--font-size-sm); font-weight: 750;
}
.publish-video-button > span { overflow: hidden; max-width: 15em; text-overflow: ellipsis; white-space: nowrap; }
.publish-video-button:disabled { cursor: not-allowed; filter: grayscale(.28); opacity: .58; box-shadow: none; }
.local-preview-button { display: inline-flex; align-items: center; justify-content: center; gap: 6px; flex: 0 0 auto; height: 40px; padding: 0 13px; border: 1px solid var(--color-border); border-radius: var(--radius-4); color: var(--color-text-primary); background: var(--color-bg-card); cursor: pointer; font: inherit; font-size: var(--font-size-sm); font-weight: 700; }
.local-preview-button:hover:where(:not(:disabled)) { border-color: var(--vsv-brand-a35); color: var(--color-brand); }
.local-preview-button:disabled { cursor: not-allowed; color: var(--color-text-muted); background: var(--color-bg-input); opacity: .52; }
/* 原来是品牌渐变（紫→青）+ 大面积光晕：跨度太大、饱和度太高，在这一排里过分抢眼，
   而且和旁边的白底次级按钮不在一个量级上。收成品牌色实心 + 克制的投影。 */
.start-button { display: inline-flex; align-items: center; justify-content: center; gap: 8px; flex: 0 0 auto; min-width: 190px; height: 44px; padding: 0 18px; border: 0; border-radius: var(--radius-4); color: var(--color-on-accent); background: var(--color-brand); box-shadow: var(--vsv-shadow-4); cursor: pointer; font: inherit; font-size: 13.5px; font-weight: 600; letter-spacing: .2px; transition: background .15s, box-shadow .15s, transform .1s; }
.start-button:hover:not(:disabled) { background: color-mix(in srgb, var(--color-brand) 88%, var(--vsv-dark-2)); box-shadow: var(--vsv-shadow-5); }
.start-button:active:not(:disabled) { transform: translateY(1px); box-shadow: var(--vsv-shadow-6); }
.start-button:disabled { cursor: not-allowed; filter: grayscale(.3); opacity: .48; box-shadow: none; }

.studio-aside { display: grid; gap: 14px; position: sticky; top: 0; }
.aside-card { padding: 18px; }
.aside-title { display: flex; align-items: center; gap: 10px; }
.aside-title > span { display: grid; place-items: center; width: 38px; height: 38px; border-radius: var(--radius-4); color: var(--color-on-accent); background: var(--gradient-brand); font-size: 19px; }
.aside-title > div { display: grid; gap: 3px; }
.aside-title strong { font-size: 13.5px; }
.aside-title small { color: var(--color-text-secondary); font-size: 11.5px; }
.capability-list { display: grid; gap: 14px; margin: 18px 0 0; padding: 0; list-style: none; }
.capability-list li { display: flex; align-items: flex-start; gap: 10px; }
.capability-list li > i { width: 22px; margin-top: 1px; color: var(--color-brand); font-size: 16px; }
.capability-list li > span { display: grid; gap: 3px; }
.capability-list strong { font-size: var(--font-size-md); }
.capability-list small { color: var(--color-text-secondary); font-size: 11.5px; line-height: 1.5; }
.job-card { border-color: var(--vsv-brand-a22); background: linear-gradient(145deg, var(--color-bg-card), var(--color-brand-subtle)); }
.job-eyebrow { display: inline-flex; align-items: center; gap: 6px; color: var(--color-brand); font-size: 10.5px; font-weight: 700; }
.job-card h3 { margin: 12px 0 6px; font-size: var(--font-size-lg); }
.job-card p { margin: 0; color: var(--color-text-secondary); font-size: var(--font-size-sm); line-height: 1.6; }
.job-card button { display: flex; align-items: center; justify-content: center; gap: 6px; width: 100%; height: 37px; margin-top: 14px; border: 0; border-radius: var(--radius-4); color: var(--color-on-accent); background: var(--color-brand); cursor: pointer; font: inherit; font-size: var(--font-size-sm); font-weight: 600; }
.job-actions { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 88px), 1fr)); gap: 8px; }
.job-actions button { margin-top: 14px; }
.job-actions .job-publish-button { background: var(--vsv-grad-3); }
.job-actions .job-publish-button:disabled { cursor: not-allowed; filter: grayscale(.28); opacity: .58; }
.job-actions .job-preview-button { color: var(--color-brand); background: var(--color-bg-card); box-shadow: var(--vsv-shadow-7); }
.job-actions .job-preview-button:disabled { cursor: not-allowed; color: var(--color-text-muted); background: var(--color-bg-input); box-shadow: none; opacity: .52; }
.tips-card ul { display: grid; gap: 9px; margin: 13px 0 0; padding-left: 17px; color: var(--color-text-secondary); font-size: var(--font-size-sm); line-height: 1.55; }

/* F5：已 Teleport 到 body；z 压过全 app 普通弹层（modal 家族 9000-9999），低于全局锁层（99998+） */
.preview-backdrop { position: fixed; z-index: 10500; inset: 0; display: grid; place-items: center; padding: 28px; background: var(--vsv-dark-a58); backdrop-filter: var(--vsv-blur-3); }
.preview-dialog { display: grid; grid-template-rows: auto auto auto minmax(min(100%, 220px), 1fr) auto; width: min(900px, calc(100vw - 48px)); max-height: min(820px, calc(100vh - 56px)); overflow: hidden; border: 1px solid var(--color-border); border-radius: var(--radius-8); background: var(--color-bg-card); box-shadow: var(--vsv-shadow-8); }
.preview-head { display: flex; align-items: flex-start; justify-content: space-between; gap: 20px; padding: 22px 24px 17px; border-bottom: 1px solid var(--color-border); }
.preview-head > div > span { display: inline-flex; align-items: center; gap: 6px; color: var(--color-success); font-size: var(--font-size-xs); font-weight: 750; }
.preview-head h2 { margin: 6px 0 0; font-size: 20px; }
.preview-head p { margin: 6px 0 0; color: var(--color-text-secondary); font-size: 12.5px; }
.preview-head > button { display: grid; place-items: center; flex: 0 0 auto; width: 34px; height: 34px; border: 0; border-radius: var(--radius-3); color: var(--color-text-secondary); background: var(--color-bg-input); cursor: pointer; font-size: var(--font-size-xl); }
.preview-summary { display: grid; grid-template-columns: 1.25fr 1fr 1fr; gap: 10px; padding: 15px 24px; border-bottom: 1px solid var(--color-border); background: var(--color-bg-input); }
.preview-summary > span { display: grid; gap: 3px; min-width: 0; }
.preview-summary strong, .preview-summary small { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.preview-summary strong { font-size: 12.5px; }
.preview-summary small { color: var(--color-text-secondary); font-size: 11.5px; }
.preview-warning { display: flex; align-items: center; gap: 9px; margin: 14px 24px 0; padding: 10px 12px; border: 1px solid color-mix(in srgb, var(--color-status-warning-fg) 24%, transparent); border-radius: var(--radius-4); color: var(--color-status-warning-fg); background: var(--color-status-warning-bg); font-size: var(--font-size-sm); }
.preview-warning > span { flex: 1; }
.preview-warning > button { height: 30px; padding: 0 10px; border: 1px solid color-mix(in srgb, var(--color-status-warning-fg) 22%, transparent); border-radius: var(--radius-3); color: var(--color-status-warning-fg); background: color-mix(in srgb, var(--color-status-warning-bg) 82%, var(--color-bg-card)); cursor: pointer; font: inherit; font-size: 11.5px; font-weight: 700; }
.prompt-preview { margin: 14px 24px; overflow: auto; padding: 16px 18px; border: 1px solid var(--color-border); border-radius: var(--radius-5); color: var(--color-text-primary); background: var(--color-bg-input); font: 12.5px/1.75 ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; white-space: pre-wrap; word-break: break-word; }
.preview-actions { display: flex; flex-wrap: wrap; justify-content: flex-end; min-width: 0; gap: 10px; padding: 15px 24px; border-top: 1px solid var(--color-border); }
.preview-cancel, .preview-confirm, .preview-publish { height: 39px; padding: 0 16px; border-radius: var(--radius-4); cursor: pointer; font: inherit; font-size: 12.5px; font-weight: 700; }
.preview-cancel { border: 1px solid var(--color-border); color: var(--color-text-primary); background: var(--color-bg-card); }
.preview-confirm { display: inline-flex; align-items: center; gap: 6px; border: 0; color: var(--color-on-accent); background: var(--gradient-brand); }
.preview-publish {
  display: inline-flex; align-items: center; gap: 6px; border: 0; color: var(--color-on-accent);
  background: var(--vsv-grad-3);
  box-shadow: var(--vsv-shadow-9);
}
.preview-confirm:disabled, .preview-publish:disabled { cursor: not-allowed; filter: grayscale(.35); opacity: .48; }
.video-publish-confirm-dock {
  position: fixed; z-index: 1500; inset: 0; display: grid; place-items: center;
  padding: 24px; background: var(--vsv-scrim-a62); backdrop-filter: var(--vsv-blur-4);
}
.video-publish-confirm-dock :deep(.hc-card) {
  width: min(860px, calc(100vw - 48px)); max-height: calc(100vh - 48px);
}

/* F5：已 Teleport 到 body；比方案预览高一档（成片预览可叠在方案预览之上） */
.video-preview-backdrop { position: fixed; z-index: 10510; inset: 0; display: grid; place-items: center; padding: 24px; background: var(--vsv-scrim-a72); backdrop-filter: var(--vsv-blur-5); }
.video-preview-dialog { display: grid; grid-template-rows: auto minmax(min(100%, 260px), 1fr) auto auto; width: min(920px, calc(100vw - 44px)); max-height: calc(100vh - 48px); overflow: hidden; border: 1px solid var(--vsv-surface-a12); border-radius: var(--radius-8); background: var(--vsv-dark-3); box-shadow: var(--vsv-shadow-10); }
.video-preview-dialog > header { display: flex; align-items: flex-start; justify-content: space-between; gap: 20px; padding: 19px 22px 16px; color: var(--color-on-accent); }
.video-preview-dialog > header span { display: inline-flex; align-items: center; gap: 6px; color: var(--vsv-ok-2); font-size: var(--font-size-xs); font-weight: 750; }
.video-preview-dialog > header h2 { margin: 6px 0 0; font-size: 20px; }
.video-preview-dialog > header p { margin: 5px 0 0; color: var(--vsv-muted); font-size: var(--font-size-sm); }
.video-preview-dialog > header button { display: grid; place-items: center; width: 34px; height: 34px; border: 0; border-radius: var(--radius-3); color: var(--vsv-info-faint); background: var(--vsv-surface-a8); cursor: pointer; font-size: var(--font-size-xl); }
.video-stage { display: grid; place-items: center; min-height: 260px; overflow: hidden; background: var(--vsv-dark-4); }
.video-stage video { display: block; width: 100%; max-height: calc(100vh - 260px); background: var(--vsv-dark-2); object-fit: contain; }
.video-preview-empty { display: grid; justify-items: center; gap: 8px; color: var(--vsv-info-faint); text-align: center; }
.video-preview-empty > i { color: var(--vsv-brand-2); font-size: 42px; }
.video-preview-empty > span { color: var(--vsv-muted-2); font-size: var(--font-size-sm); }
.video-preview-path { display: flex; align-items: center; gap: 7px; min-width: 0; padding: 9px 20px; color: var(--vsv-muted-3); background: var(--vsv-dark-5); font-size: var(--font-size-xs); }
.video-preview-path span { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.video-preview-dialog > footer { display: flex; justify-content: flex-end; gap: 10px; padding: 14px 20px; background: var(--vsv-dark-3); }
.video-preview-dialog > footer .preview-cancel { border-color: var(--vsv-surface-a14); color: var(--vsv-on-dark); background: var(--vsv-surface-a6); }
.spin { animation: spin 1s linear infinite; }
.spin-slow { animation: spin 2s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }

@container main-page (max-width: 1120px) {
  .studio-grid { grid-template-columns: 1fr; }
  .studio-aside { position: static; grid-template-columns: repeat(3, minmax(0,1fr)); }
  .production-grid, .platform-grid { grid-template-columns: repeat(2, minmax(0,1fr)); }
  .preview-summary { grid-template-columns: 1fr; }
}
@container main-page (max-width: 820px) {
  .video-studio-page { padding: 18px; }
  .studio-hero { align-items: flex-start; flex-direction: column; }
  .hero-actions { width: 100%; justify-items: start; }
  .job-progress-stages { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .model-strip { grid-template-columns: 1fr 42px; }
  .model-card:nth-child(2) { grid-column: 1; grid-row: 2; }
  .refresh-models { grid-column: 2; grid-row: 1 / span 2; }
  .field-grid, .audio-row { grid-template-columns: 1fr; }
  .topic-grid { grid-template-columns: 1fr; }
  .studio-aside { grid-template-columns: 1fr; }
  .submit-bar { align-items: stretch; flex-direction: column; }
  .submit-actions { justify-content: flex-end; }
}
@media (prefers-reduced-motion: reduce) {
  .spin, .spin-slow { animation: none; }
  .choice-card { transition: none; }
}

/* 按实际内容宽度重排，兼容浏览器分栏与嵌入设置页。 */
/* body 上的 Teleport 弹窗仍以视口为尺寸基准。 */
@media (max-width: 1120px) {
  .preview-summary { grid-template-columns: 1fr; }
}
/* 吸底操作条压在表单上：键盘聚焦 / 定位到被它挡住的控件时，留出操作条的高度 */
.studio-form :is(input, select, textarea) { scroll-margin-bottom: 120px; }
/* 发布预览滚到可见处时别钻到吸顶的制作进度面板底下 */
.prp { scroll-margin-top: 240px; }
/* 界面主题没有毛玻璃：吸底操作条改不透明，免得底下的表单透出来 */
:root[data-ui-theme] .submit-bar { background: var(--color-bg-elevated); }

/* ─── 调色板（docs/ui-design-system.md）：经典主题保持原值；界面主题（data-ui-theme）下映射全局 token ─── */
.video-studio-page, .preview-backdrop, .video-preview-backdrop, .video-publish-confirm-dock { /* ui-theme-exempt: 经典主题原值 */
  --vsv-grad: radial-gradient(circle at 8% 2%, rgba(103, 92, 243, 0.10), transparent 30%),
    radial-gradient(circle at 92% 4%, rgba(33, 184, 215, 0.09), transparent 28%),
    var(--color-bg-primary);
  --vsv-brand-a24: rgba(103,92,243,.24);
  --vsv-blur: blur(14px) saturate(140%);
  --vsv-brand: #7c3aed;
  --vsv-brand-a10: rgba(124,58,237,.10);
  --vsv-info: #0284c7;
  --vsv-info-a10: rgba(2,132,199,.10);
  --vsv-shadow: 0 0 0 3px rgba(5,150,105,.11);
  --vsv-brand-a17: rgba(103,92,243,.17);
  --vsv-brand-a22: rgba(103,92,243,.22);
  --vsv-brand-a42: rgba(103,92,243,.42);
  --vsv-brand-a16: rgba(103,92,243,.16);
  --vsv-warn-a22: rgba(217,119,6,.22);
  --vsv-warn-a12: rgba(217,119,6,.12);
  --vsv-surface: white;
  --vsv-shadow-2: 0 1px 3px rgba(0,0,0,.2);
  --vsv-dark: #303444;
  --vsv-grad-2: linear-gradient(135deg,#1f2937,#ef476f);
  --vsv-warn: #ff5b22;
  --vsv-danger: #ff2442;
  --vsv-ok: var(--color-wechat);
  --vsv-blur-2: blur(14px);
  --vsv-grad-3: linear-gradient(135deg, #ef4444, #f97316);
  --vsv-shadow-3: 0 8px 18px rgba(239,68,68,.24);
  --vsv-brand-a35: rgba(103,92,243,.35);
  --vsv-shadow-4: 0 2px 6px rgba(15, 23, 42, .12);
  --vsv-dark-2: #000;
  --vsv-shadow-5: 0 4px 12px rgba(15, 23, 42, .16);
  --vsv-shadow-6: 0 1px 4px rgba(15, 23, 42, .14);
  --vsv-shadow-7: inset 0 0 0 1px rgba(103,92,243,.24);
  --vsv-dark-a58: rgba(20,22,39,.58);
  --vsv-blur-3: blur(5px);
  --vsv-shadow-8: 0 24px 70px rgba(18,20,38,.28);
  --vsv-shadow-9: 0 9px 22px rgba(239, 68, 68, .3);
  --vsv-scrim-a62: rgba(15, 18, 34, .62);
  --vsv-blur-4: blur(7px);
  --vsv-scrim-a72: rgba(13,15,28,.72);
  --vsv-blur-5: blur(7px);
  --vsv-surface-a12: rgba(255,255,255,.12);
  --vsv-dark-3: #171a29;
  --vsv-shadow-10: 0 26px 80px rgba(0,0,0,.46);
  --vsv-ok-2: #6ee7b7;
  --vsv-muted: #aeb4c8;
  --vsv-info-faint: #d8dbea;
  --vsv-surface-a8: rgba(255,255,255,.08);
  --vsv-dark-4: #080a11;
  --vsv-brand-2: #8278ff;
  --vsv-muted-2: #939aae;
  --vsv-muted-3: #9ea5b9;
  --vsv-dark-5: #121521;
  --vsv-surface-a14: rgba(255,255,255,.14);
  --vsv-on-dark: #e7e9f2;
  --vsv-surface-a6: rgba(255,255,255,.06);
}
:root[data-ui-theme] .video-studio-page, :root[data-ui-theme] .preview-backdrop, :root[data-ui-theme] .video-preview-backdrop, :root[data-ui-theme] .video-publish-confirm-dock {
  --vsv-grad: var(--color-bg-primary);
  --vsv-brand-a24: color-mix(in srgb, var(--color-brand) 24%, transparent);
  --vsv-blur: var(--glass-blur);
  --vsv-brand: var(--color-brand);
  --vsv-brand-a10: color-mix(in srgb, var(--color-brand) 10%, transparent);
  --vsv-info: var(--color-info);
  --vsv-info-a10: color-mix(in srgb, var(--color-info) 10%, transparent);
  --vsv-shadow: 0 0 0 3px color-mix(in srgb, var(--color-success) 11%, transparent);
  --vsv-brand-a17: color-mix(in srgb, var(--color-brand) 17%, transparent);
  --vsv-brand-a22: color-mix(in srgb, var(--color-brand) 22%, transparent);
  --vsv-brand-a42: color-mix(in srgb, var(--color-brand) 42%, transparent);
  --vsv-brand-a16: color-mix(in srgb, var(--color-brand) 16%, transparent);
  --vsv-warn-a22: color-mix(in srgb, var(--color-warning) 22%, transparent);
  --vsv-warn-a12: color-mix(in srgb, var(--color-warning) 12%, transparent);
  --vsv-surface: var(--color-bg-card);
  --vsv-shadow-2: var(--shadow-knob);
  --vsv-dark: var(--color-bg-code);
  --vsv-grad-2: var(--vsv-ink);
  --vsv-warn: var(--color-warning);
  --vsv-danger: var(--color-danger);
  --vsv-ok: var(--color-success);
  --vsv-blur-2: var(--glass-blur);
  --vsv-grad-3: var(--color-danger);
  --vsv-shadow-3: var(--shadow-card);
  --vsv-brand-a35: color-mix(in srgb, var(--color-brand) 35%, transparent);
  --vsv-shadow-4: var(--shadow-card);
  --vsv-dark-2: var(--color-bg-code);
  --vsv-shadow-5: var(--shadow-card-hover);
  --vsv-shadow-6: var(--shadow-sm);
  --vsv-shadow-7: inset 0 0 0 1px color-mix(in srgb, var(--color-brand) 24%, transparent);
  --vsv-dark-a58: color-mix(in srgb, var(--color-scrim) 58%, transparent);
  --vsv-blur-3: var(--overlay-blur);
  --vsv-shadow-8: var(--shadow-pop);
  --vsv-shadow-9: var(--shadow-card);
  --vsv-scrim-a62: color-mix(in srgb, var(--color-scrim) 62%, transparent);
  --vsv-blur-4: var(--glass-blur);
  --vsv-scrim-a72: color-mix(in srgb, var(--color-scrim) 72%, transparent);
  --vsv-blur-5: var(--overlay-blur);
  --vsv-surface-a12: color-mix(in srgb, var(--color-bg-card) 12%, transparent);
  --vsv-dark-3: var(--color-bg-code);
  --vsv-shadow-10: var(--shadow-pop);
  --vsv-ok-2: var(--color-success);
  --vsv-muted: var(--color-text-muted);
  --vsv-info-faint: color-mix(in srgb, var(--color-info) 45%, var(--color-on-accent));
  --vsv-surface-a8: color-mix(in srgb, var(--color-bg-card) 8%, transparent);
  --vsv-dark-4: var(--color-bg-code);
  --vsv-brand-2: var(--color-brand);
  --vsv-muted-2: var(--color-text-muted);
  --vsv-muted-3: var(--color-text-muted);
  --vsv-dark-5: var(--color-bg-code);
  --vsv-surface-a14: color-mix(in srgb, var(--color-bg-card) 14%, transparent);
  --vsv-on-dark: var(--color-text-code);
  --vsv-surface-a6: color-mix(in srgb, var(--color-bg-card) 6%, transparent);
  /* 深色封面块的墨色底：浅色主题取正文色染品牌色，深色主题见下一条 */
  --vsv-ink: color-mix(in srgb, var(--color-brand) 16%, var(--color-text-primary));
}
:root[data-ui-theme][data-scheme="dark"] .video-studio-page, :root[data-ui-theme][data-scheme="dark"] .preview-backdrop, :root[data-ui-theme][data-scheme="dark"] .video-preview-backdrop, :root[data-ui-theme][data-scheme="dark"] .video-publish-confirm-dock { --vsv-ink: color-mix(in srgb, var(--color-brand) 20%, var(--color-bg-elevated)); }
</style>
