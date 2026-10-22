<template>
  <div class="workbench education-workbench" :dir="isRtl ? 'rtl' : 'ltr'">
    <header class="hero">
      <PageBackButton />
      <div class="hero-copy">
        <div class="eyebrow">{{ $t('教育工作台') }}</div>
        <h1>{{ $t('职教与高校智能教学工作台') }}</h1>
        <p>{{ $t('面向职业院校与高校，由课程设计、实训导师、学情分析和教学审核 Agent 协作完成备课、实训、答疑与形成性评价。') }}</p>
      </div>
      <div class="hero-actions">
        <button class="button secondary" type="button" :disabled="statusLoading" @click="loadStatus">
          <i :class="statusLoading ? 'ri-loader-4-line spin' : 'ri-refresh-line'"></i>
          {{ statusLoading ? $t('正在检查…') : $t('刷新能力状态') }}
        </button>
      </div>
    </header>

    <section class="demo-banner">
      <i class="ri-chat-smile-3-line"></i>
      <div>
        <strong>{{ $t('快速开始 · 跨境电商运营实训课') }}</strong>
        <p>{{ $t('点击后会调用全局配置的大模型，由实训导师发布岗位任务并逐轮辅导；每条回复都可朗读。') }}</p>
      </div>
      <button class="button primary compact" type="button" :disabled="teacherBusy" @click="startEducationLesson">
        <i class="ri-play-fill"></i>{{ teacherBusy ? $t('老师正在回复…') : $t('开始真实演示') }}
      </button>
    </section>

    <section class="education-platform-flow" :aria-label="brandName() + ' platform capabilities'">
      <header>
        <div>
          <span><i class="ri-apps-2-line"></i> {{ $t('TotalClaw 职教与高校多 Agent 教学链') }}</span>
          <small>{{ $t('真实模型会话、课程工作流、语音交互、教学配图与教师审核') }}</small>
        </div>
        <em :class="{ active: teacherBusy || teacherRecording || teacherTranscribing || !!speakingMessageId }">
          <i></i>{{ educationLiveStatus }}
        </em>
      </header>
      <div>
        <article :class="{ active: lessonBusy, done: !!lessonResult }">
          <span><i class="ri-brain-line"></i></span>
          <div><small>COURSE DESIGNER</small><strong>{{ $t('课程设计 Agent') }}</strong><p>{{ $t('课程目标 · 任务拆解 · 教学资源') }}</p></div>
        </article>
        <article :class="{ active: teacherBusy, done: teacherMessages.some((item) => item.role === 'assistant' && item.content !== TEACHER_WELCOME()) }">
          <span><i class="ri-translate-2"></i></span>
          <div><small>PRACTICE MENTOR</small><strong>{{ $t('实训导师 Agent') }}</strong><p>{{ teacherModelLabel || $t('使用全局当前大模型') }}</p></div>
        </article>
        <article :class="{ active: teacherRecording || teacherTranscribing }">
          <span><i class="ri-mic-line"></i></span>
          <div><small>SPEECH TOOL</small><strong>{{ $t('课堂语音工具') }}</strong><p>{{ $t('语音输入 · 转写 · 逐条朗读') }}</p></div>
        </article>
        <article :class="{ active: lessonBusy, done: !!lessonResult }">
          <span><i class="ri-volume-up-line"></i></span>
          <div><small>TEACHING REVIEW</small><strong>{{ $t('教学审核 Agent') }}</strong><p>{{ $t('评价标准 · 安全边界 · 教师确认') }}</p></div>
        </article>
        <article :class="{ done: lessonResult || configuredImageProviders.length > 0 }">
          <span><i class="ri-image-ai-line"></i></span>
          <div><small>TEACHING TOOLS</small><strong>{{ $t('教学工具链') }}</strong><p>ASR / TTS · Workflow · Image Model</p></div>
        </article>
      </div>
    </section>

    <section class="teacher-chat">
      <aside class="teacher-profile">
        <div class="teacher-avatar">{{ $t('教') }}</div>
        <span class="teacher-online"><i></i>{{ $t('在线') }}</span>
        <h2>{{ $t('你的实训导师') }}</h2>
        <p>{{ $t('直接提交课程问题、岗位任务或作品草稿；导师会逐步引导、给出反馈，并在关键环节交由教师确认。') }}</p>
        <div class="teacher-capabilities">
          <span><i class="ri-briefcase-4-line"></i>{{ $t('岗位任务') }}</span>
          <span><i class="ri-chat-smile-3-line"></i>{{ $t('案例推演') }}</span>
          <span><i class="ri-file-list-3-line"></i>{{ $t('形成性反馈') }}</span>
        </div>
      </aside>

      <div class="chat-workspace">
        <div class="chat-topbar">
          <div>
            <strong>{{ $t('实训辅导对话') }}</strong>
            <span>{{ teacherProviderLabel }}</span>
          </div>
          <button type="button" @click="clearTeacherChat">
            <i class="ri-delete-bin-line"></i>{{ $t('重新开始') }}
          </button>
        </div>

        <div ref="teacherMessageList" class="teacher-messages">
          <article
            v-for="message in teacherMessages"
            :key="message.id"
            :class="['teacher-message', message.role]"
          >
            <span class="message-avatar">{{ message.role === 'assistant' ? $t('教') : $t('学') }}</span>
            <div>
              <div class="message-meta">
                <small>{{ message.role === 'assistant' ? $t('实训导师') : $t('学生') }}</small>
                <button
                  type="button"
                  :title="speakingMessageId === message.id ? $t('停止朗读') : $t('朗读这条消息')"
                  @click="speakTeacherMessage(message)"
                >
                  <i :class="speakingMessageId === message.id ? 'ri-stop-circle-line' : 'ri-volume-up-line'"></i>
                  {{ speakingMessageId === message.id ? $t('停止') : $t('朗读') }}
                </button>
              </div>
              <div
                class="teacher-message-markdown"
                dir="auto"
                v-html="renderMarkdown(message.content)"
              ></div>
            </div>
          </article>
          <article v-if="teacherBusy" class="teacher-message assistant">
            <span class="message-avatar">{{ $t('教') }}</span>
            <div>
              <small>{{ $t('实训导师') }}</small>
              <p class="typing"><i></i><i></i><i></i></p>
            </div>
          </article>
        </div>

        <div class="teacher-prompts">
          <button v-for="prompt in teacherQuickPrompts" :key="prompt" type="button" @click="sendTeacherPrompt(prompt)">
            {{ prompt }}
          </button>
        </div>

        <form class="teacher-composer" @submit.prevent="sendTeacherMessage">
          <textarea
            v-model="teacherInput"
            rows="2"
            :placeholder="$t('输入课程问题或实训任务，例如：带我完成一次跨境电商商品上架策划')"
            :disabled="teacherBusy"
            @keydown.enter.exact.prevent="sendTeacherMessage"
          ></textarea>
          <div>
            <button
              :class="['composer-tool', { recording: teacherRecording }]"
              type="button"
              :disabled="teacherBusy || teacherTranscribing"
              :title="teacherRecording ? $t('停止录音并发送') : $t('按下后直接说话')"
              @click="toggleTeacherRecording"
            >
              <i :class="teacherRecording ? 'ri-stop-circle-fill' : teacherTranscribing ? 'ri-loader-4-line spin' : 'ri-mic-line'"></i>
            </button>
            <button class="composer-send" type="submit" :disabled="teacherBusy || !teacherInput.trim()">
              <i :class="teacherBusy ? 'ri-loader-4-line spin' : 'ri-send-plane-fill'"></i>
              {{ teacherBusy ? $t('导师正在回复…') : $t('发送') }}
            </button>
          </div>
        </form>
        <p v-if="teacherRecording" class="teacher-recording"><i></i>{{ $t('正在听你说话，再按一次结束') }}</p>
        <p v-if="teacherError" class="teacher-error"><i class="ri-error-warning-line"></i>{{ teacherError }}</p>
      </div>
    </section>

    <section class="boundary-banner" aria-live="polite">
      <i class="ri-information-line"></i>
      <div>
        <strong>{{ $t('当前能力边界') }}</strong>
        <p>
          {{ $t('语音识别只返回转写文本与服务端置信度，不提供逐字声调评分。声调评分与汉字笔顺识别需要接入独立的教育领域引擎。') }}
        </p>
      </div>
    </section>

    <section class="panel capability-panel">
      <div class="section-heading">
        <div>
          <span class="section-kicker">{{ $t('能力概览') }}</span>
          <h2>{{ $t('服务就绪情况') }}</h2>
        </div>
        <span :class="['status-pill', statusTone]">
          <i class="ri-checkbox-blank-circle-fill"></i>
          {{ statusLabel }}
        </span>
      </div>

      <div v-if="statusError" class="message error" role="alert">
        <i class="ri-error-warning-line"></i>
        <span>{{ statusError }}</span>
      </div>

      <div class="capability-grid">
        <article v-for="item in capabilityCards" :key="item.id" class="capability-card">
          <div :class="['capability-icon', item.available ? 'available' : 'unavailable']">
            <i :class="item.icon"></i>
          </div>
          <div class="capability-copy">
            <div class="capability-title-row">
              <strong>{{ $t(item.label) }}</strong>
              <span :class="['mini-status', item.available ? 'available' : 'unavailable']">
                {{ item.available ? $t('可用') : $t('未接入') }}
              </span>
            </div>
            <p>{{ $t(item.description) }}</p>
            <small v-if="item.reason">{{ $t(item.reason) }}</small>
          </div>
        </article>
      </div>
    </section>

    <nav class="workbench-tabs" :aria-label="$t('教育工作台功能')">
      <button
        type="button"
        :class="{ active: activeTab === 'practice' }"
        @click="activeTab = 'practice'"
      >
        <i class="ri-mic-line"></i>
          {{ $t('实训互动') }}
      </button>
      <button
        type="button"
        :class="{ active: activeTab === 'lesson' }"
        @click="activeTab = 'lesson'"
      >
        <i class="ri-book-open-line"></i>
        {{ $t('智能备课') }}
      </button>
      <button
        type="button"
        :class="{ active: activeTab === 'visual' }"
        @click="activeTab = 'visual'"
      >
        <i class="ri-image-ai-line"></i>
        {{ $t('教学配图') }}
      </button>
    </nav>

    <section v-if="activeTab === 'practice'" class="panel workspace-panel">
      <div class="section-heading">
        <div>
          <span class="section-kicker">{{ $t('学生练习') }}</span>
          <h2>{{ $t('听、说与跟读') }}</h2>
          <p>{{ $t('可上传音频或填写音频地址进行转写，也可先合成标准示范音频。') }}</p>
        </div>
        <div class="segmented">
          <button
            type="button"
            :class="{ active: speechMode === 'asr' }"
            @click="speechMode = 'asr'"
          >
            {{ $t('语音转写') }}
          </button>
          <button
            type="button"
            :class="{ active: speechMode === 'tts' }"
            @click="speechMode = 'tts'"
          >
            {{ $t('示范朗读') }}
          </button>
        </div>
      </div>

      <div v-if="speechMode === 'asr'" class="form-layout">
        <div class="form-card">
          <div class="field-grid two">
            <label class="field">
              <span>{{ $t('识别服务') }}</span>
              <select v-model="asrForm.backend">
                <option value="deepgram">deepgram</option>
                <option value="xunfei">xunfei</option>
                <option value="azure">azure</option>
              </select>
            </label>
            <label class="field">
              <span>{{ $t('音频语言') }}</span>
              <select v-model="asrForm.language">
                <option value="zh">{{ $t('中文') }}</option>
                <option value="ar">{{ $t('阿拉伯语') }}</option>
                <option value="en">{{ $t('英语') }}</option>
              </select>
            </label>
          </div>

          <label class="field">
            <span>{{ $t('音频地址') }}</span>
            <input
              v-model="asrForm.audioUrl"
              type="url"
              :placeholder="$t('填写 https:// 地址，或在下方选择本地音频文件')"
            />
          </label>

          <label class="file-picker">
            <input type="file" accept="audio/*" @change="selectAudioFile" />
            <i class="ri-upload-cloud-2-line"></i>
            <span>
              <strong>{{ selectedAudioName || $t('选择本地音频') }}</strong>
              <small>{{ $t('文件只转换为本次调用需要的音频数据，不会伪造评分结果。') }}</small>
            </span>
          </label>

          <label class="check-field">
            <input v-model="asrForm.diarization" type="checkbox" />
            <span>{{ $t('区分不同说话人') }}</span>
          </label>

          <button class="button primary" type="button" :disabled="speechBusy" @click="runAsr">
            <i :class="speechBusy ? 'ri-loader-4-line spin' : 'ri-sound-module-line'"></i>
            {{ speechBusy ? $t('正在识别…') : $t('开始转写') }}
          </button>
        </div>

        <div class="result-card">
          <div class="result-title">
            <strong>{{ $t('转写结果') }}</strong>
            <span>{{ $t('不含声调评分') }}</span>
          </div>
          <div v-if="speechError" class="message error" role="alert">{{ speechError }}</div>
          <div v-else-if="asrUtterances.length" class="utterance-list">
            <article v-for="(utterance, index) in asrUtterances" :key="index">
              <div class="utterance-meta">
                <span>{{ formatSpeechTime(utterance.startMs) }} – {{ formatSpeechTime(utterance.endMs) }}</span>
                <span v-if="utterance.confidence != null">
                  {{ $t('转写置信度 {value}%', { value: formatConfidence(utterance.confidence) }) }}
                </span>
              </div>
              <p>{{ utterance.text || $t('未返回文本') }}</p>
            </article>
          </div>
          <div v-else class="empty-state">
            <i class="ri-chat-voice-line"></i>
            <p>{{ $t('提交音频后，真实转写内容会显示在这里。') }}</p>
          </div>
          <div class="result-note">
            <i class="ri-shield-check-line"></i>
            {{ $t('服务端置信度表示转写可靠程度，不等于发音、声调或教学评分。') }}
          </div>
        </div>
      </div>

      <div v-else class="form-layout">
        <div class="form-card">
          <div class="field-grid two">
            <label class="field">
              <span>{{ $t('合成服务') }}</span>
              <select v-model="ttsForm.backend">
                <option v-for="backend in ttsBackends" :key="backend" :value="backend">{{ backend }}</option>
              </select>
            </label>
            <label class="field">
              <span>{{ $t('朗读语言') }}</span>
              <select v-model="ttsForm.language">
                <option value="zh">{{ $t('中文') }}</option>
                <option value="ar">{{ $t('阿拉伯语') }}</option>
                <option value="en">{{ $t('英语') }}</option>
              </select>
            </label>
          </div>
          <label class="field">
            <span>{{ $t('示范文本') }}</span>
            <textarea
              v-model="ttsForm.text"
              rows="6"
              :placeholder="$t('例如：你好，我叫穆罕默德。')"
            ></textarea>
          </label>
          <div class="field-grid two">
            <label class="field">
              <span>{{ $t('音色标识（可选）') }}</span>
              <input v-model="ttsForm.voice" type="text" :placeholder="$t('留空使用服务默认音色')" />
            </label>
            <label class="field">
              <span>{{ $t('音频格式') }}</span>
              <select v-model="ttsForm.format">
                <option value="mp3">mp3</option>
                <option value="wav">wav</option>
                <option value="opus">opus</option>
                <option value="pcm16">pcm16</option>
              </select>
            </label>
          </div>
          <button class="button primary" type="button" :disabled="speechBusy" @click="runTts">
            <i :class="speechBusy ? 'ri-loader-4-line spin' : 'ri-volume-up-line'"></i>
            {{ speechBusy ? $t('正在合成…') : $t('生成示范音频') }}
          </button>
          <span v-if="ttsRun.startedAt.value" class="step-elapsed" data-test="tts-elapsed">{{ ttsRun.elapsedLabel() }}</span>
        </div>

        <div class="result-card">
          <div class="result-title">
            <strong>{{ $t('标准示范音频') }}</strong>
            <span>{{ $t('用于听辨与跟读') }}</span>
          </div>
          <!-- 没有取消通道：可能已超时只给 继续等待 / 查看日志；失败给原因 + 重新生成（同一函数再跑一次） -->
          <StepRunAlert
            v-if="ttsRun.watchdog.suspect.value"
            state="suspect"
            hide-retry
            :elapsed-sec="ttsRun.watchdog.elapsedSec.value"
            :estimate-sec="ttsRun.estimateSec"
            :message="$t('服务端最长等待 5 分钟，超过会自动报错。')"
            @keep-waiting="ttsRun.watchdog.keepWaiting()"
          />
          <StepRunAlert v-if="speechError && ttsRun.failed.value" state="failed" :message="speechError" :busy="speechBusy" @retry="runTts()" />
          <div v-else-if="speechError" class="message error" role="alert">{{ speechError }}</div>
          <div v-else-if="ttsAudio" class="audio-result">
            <i class="ri-volume-up-line"></i>
            <audio :src="ttsAudio.dataUrl" controls></audio>
            <small>{{ ttsAudio.format }} · {{ formatBytes(ttsAudio.bytes) }}</small>
            <a class="button secondary compact" :href="ttsAudio.dataUrl" :download="`lesson-demo.${ttsAudio.format}`">
              <i class="ri-download-line"></i>
              {{ $t('下载音频') }}
            </a>
          </div>
          <div v-else class="empty-state">
            <i class="ri-headphone-line"></i>
            <p>{{ $t('输入文本后生成真实的语音示范。') }}</p>
          </div>
        </div>
      </div>
    </section>

    <section v-else-if="activeTab === 'lesson'" class="panel workspace-panel">
      <div class="section-heading">
        <div>
          <span class="section-kicker">{{ $t('教师备课') }}</span>
          <h2>{{ $t('生成并复核一节课') }}</h2>
          <p>{{ $t('填写课程与专业信息，系统将通过固定多 Agent 工作流生成岗位任务、案例材料、分层支持、评价量规并完成教学审核。') }}</p>
        </div>
      </div>

      <div class="lesson-layout">
        <form class="form-card" @submit.prevent="prepareLesson">
          <label class="field">
            <span>{{ $t('课程主题') }}</span>
            <input v-model="lessonForm.topic" type="text" :placeholder="$t('例如：跨境电商商品上架实训')" />
          </label>
          <div class="field-grid two">
            <label class="field">
              <span>{{ $t('专业 / 班级') }}</span>
              <input v-model="lessonForm.grade" type="text" :placeholder="$t('例如：跨境电商专业大二')" />
            </label>
            <label class="field">
              <span>{{ $t('学习水平') }}</span>
              <select v-model="lessonForm.learnerLevel">
                <option value="入门">{{ $t('入门') }}</option>
                <option value="基础">{{ $t('基础') }}</option>
                <option value="进阶">{{ $t('进阶') }}</option>
                <option value="综合实训">{{ $t('综合实训') }}</option>
              </select>
            </label>
          </div>
          <div class="field-grid two">
            <label class="field">
              <span>{{ $t('课程时长（分钟）') }}</span>
              <input v-model.number="lessonForm.durationMinutes" type="number" min="15" max="180" />
            </label>
            <label class="field">
              <span>{{ $t('输出语言') }}</span>
              <select v-model="lessonForm.outputLanguage">
                <option value="zh-CN">{{ $t('中文') }}</option>
                <option value="en-US">{{ $t('英语') }}</option>
                <option value="ar">{{ $t('阿拉伯语') }}</option>
              </select>
            </label>
          </div>
          <button class="button primary" type="submit" :disabled="lessonBusy">
            <i :class="lessonBusy ? 'ri-loader-4-line spin' : 'ri-sparkling-2-line'"></i>
            {{ lessonBusy ? $t('正在生成与复核…') : $t('开始备课') }}
          </button>
          <span v-if="lessonRun.startedAt.value" class="step-elapsed" data-test="lesson-elapsed">{{ lessonRun.elapsedLabel() }}</span>
        </form>

        <div class="result-card lesson-result">
          <div class="result-title">
            <strong>{{ $t('教案结果') }}</strong>
            <span>{{ $t('由真实工作流返回') }}</span>
          </div>
          <StepRunAlert
            v-if="lessonRun.watchdog.suspect.value"
            state="suspect"
            hide-retry
            :elapsed-sec="lessonRun.watchdog.elapsedSec.value"
            :estimate-sec="lessonRun.estimateSec"
            :message="$t('服务端最长等待 30 分钟，超过会自动报错。')"
            @keep-waiting="lessonRun.watchdog.keepWaiting()"
          />
          <StepRunAlert v-if="lessonError && lessonRun.failed.value" state="failed" :message="lessonError" :busy="lessonBusy" @retry="prepareLesson()" />
          <div v-else-if="lessonError" class="message error" role="alert">{{ lessonError }}</div>
          <div v-else-if="lessonResult" class="lesson-output">
            <pre>{{ lessonResult }}</pre>
          </div>
          <div v-else class="empty-state">
            <i class="ri-file-list-3-line"></i>
            <p>{{ $t('生成完成后，教案与复核意见会显示在这里。') }}</p>
          </div>
        </div>
      </div>
    </section>

    <section v-else class="panel workspace-panel">
      <div class="section-heading">
        <div>
          <span class="section-kicker">{{ $t('教师素材') }}</span>
          <h2>{{ $t('生成课程教学配图') }}</h2>
          <p>{{ $t('使用模型设置中已接入的图片引擎生成配图；密钥继续由统一模型设置保管。') }}</p>
        </div>
        <button class="button secondary" type="button" @click="openImageModelSettings">
          <i class="ri-settings-3-line"></i>
          {{ $t('配置图片模型') }}
        </button>
      </div>

      <div class="model-summary">
        <div>
          <span>{{ $t('当前默认图片引擎') }}</span>
          <strong>{{ activeImageProviderLabel }}</strong>
          <small v-if="imageModelState?.activeModel">{{ imageModelState.activeModel }}</small>
        </div>
        <span :class="['status-pill', configuredImageProviders.length ? 'success' : 'danger']">
          <i class="ri-checkbox-blank-circle-fill"></i>
          {{ configuredImageProviders.length ? $t('已有可用引擎') : $t('尚未配置') }}
        </span>
      </div>

      <div class="form-layout">
        <div class="form-card">
          <div v-if="imageModelLoading" class="message">
            <i class="ri-loader-4-line spin"></i>
            {{ $t('正在读取图片模型配置…') }}
          </div>
          <div v-else-if="!configuredImageProviders.length" class="message error">
            <i class="ri-error-warning-line"></i>
            {{ $t('还没有实际可调用的图片引擎，请先完成模型配置。') }}
          </div>

          <div class="field-grid two">
            <label class="field">
              <span>{{ $t('图片引擎') }}</span>
              <select v-model="imageForm.backend" :disabled="!configuredImageProviders.length">
                <option
                  v-for="provider in configuredImageProviders"
                  :key="provider.id"
                  :value="provider.id"
                >
                  {{ $t(provider.label) }}
                </option>
              </select>
            </label>
            <label class="field">
              <span>{{ $t('模型 ID（可选）') }}</span>
              <input
                v-model="imageForm.model"
                type="text"
                :placeholder="imageModelState?.activeModel || $t('留空使用引擎默认模型')"
              />
            </label>
          </div>

          <label class="field">
            <span>{{ $t('教学配图提示词') }}</span>
            <textarea
              v-model="imageForm.prompt"
              rows="6"
              :placeholder="$t('例如：适合职业院校课堂的智能仓储拣选流程教学图，不含文字，步骤清晰。')"
            ></textarea>
          </label>

          <div class="field-grid two">
            <label class="field">
              <span>{{ $t('画面风格（可选）') }}</span>
              <input v-model="imageForm.style" type="text" :placeholder="$t('例如：教材插画、扁平风格')" />
            </label>
            <label class="field">
              <span>{{ $t('尺寸') }}</span>
              <select v-model="imageForm.size">
                <option value="1024x1024">1024 × 1024</option>
                <option value="1536x1024">1536 × 1024</option>
                <option value="1024x1536">1024 × 1536</option>
              </select>
            </label>
          </div>

          <button
            class="button primary"
            type="button"
            :disabled="imageBusy || !configuredImageProviders.length"
            @click="generateTeachingImage"
          >
            <i :class="imageBusy ? 'ri-loader-4-line spin' : 'ri-image-ai-line'"></i>
            {{ imageBusy ? $t('正在生成教学配图…') : $t('生成教学配图') }}
          </button>
          <span v-if="imageRun.startedAt.value" class="step-elapsed" data-test="image-elapsed">{{ imageRun.elapsedLabel() }}</span>
        </div>

        <div class="result-card">
          <div class="result-title">
            <strong>{{ $t('真实生成结果') }}</strong>
            <span>{{ $t('不使用模拟图片') }}</span>
          </div>
          <StepRunAlert
            v-if="imageRun.watchdog.suspect.value"
            state="suspect"
            hide-retry
            :elapsed-sec="imageRun.watchdog.elapsedSec.value"
            :estimate-sec="imageRun.estimateSec"
            :message="$t('服务端最长等待 5 分钟，超过会自动报错。')"
            @keep-waiting="imageRun.watchdog.keepWaiting()"
          />
          <StepRunAlert v-if="imageError && imageRun.failed.value" state="failed" :message="imageError" :busy="imageBusy" @retry="generateTeachingImage()" />
          <div v-else-if="imageError" class="message error" role="alert">{{ imageError }}</div>
          <div v-else-if="generatedImages.length" class="teaching-image-grid">
            <a
              v-for="(image, index) in generatedImages"
              :key="`${image.url}-${index}`"
              :href="image.url"
              target="_blank"
              rel="noreferrer"
            >
              <img :src="image.url" :alt="image.revisedPrompt || imageForm.prompt" />
              <small>{{ image.size || imageProviderResult }}</small>
            </a>
          </div>
          <div v-else class="empty-state">
            <i class="ri-gallery-line"></i>
            <p>{{ $t('配图生成后会显示在这里；失败时保留服务端真实错误。') }}</p>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, reactive, ref } from 'vue';
import PageBackButton from '../components/PageBackButton.vue';
import { brandName } from '../utils/brand';
import StepRunAlert from '../components/StepRunAlert.vue';
import { formatStepDuration, useStepWatchdog, type StepKind } from '../composables/useStepWatchdog';
import { humanizeErrorMessage } from '../utils/humanize';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import type { MediaModelKindState, MediaModelProviderState } from '@totalclaw/ipc-contracts';
import { t as i18nT } from '../i18n';
import { renderMarkdown } from '../utils/markdown';

type Capability = {
  available?: boolean;
  reason?: string;
  data?: unknown;
};

type CapabilityCard = {
  id: string;
  label: string;
  description: string;
  icon: string;
  available: boolean;
  reason: string;
};

type SpeechUtterance = {
  text?: string;
  startMs?: number;
  endMs?: number;
  confidence?: number;
};

const { locale } = useI18n();
const router = useRouter();
// 跟随 App 当前语言（设置里切换），不再强制切成阿拉伯语、也不改整个 App 的方向
const isRtl = computed(() => locale.value === 'ar');

const activeTab = ref<'practice' | 'lesson' | 'visual'>('practice');
const speechMode = ref<'asr' | 'tts'>('asr');
const statusLoading = ref(false);
const statusError = ref('');
const statusResponse = ref<any>(null);

type TeacherMessage = { id: string; role: 'user' | 'assistant'; content: string };
const teacherMessages = ref<TeacherMessage[]>([]);
const teacherInput = ref('');
const teacherBusy = ref(false);
const teacherError = ref('');
const teacherSessionId = ref('');
const teacherModelLabel = ref('');
const teacherRecording = ref(false);
const teacherTranscribing = ref(false);
const speakingMessageId = ref('');
const autoSpeakNextReply = ref(false);
const teacherMessageList = ref<HTMLElement | null>(null);
const teacherProviderLabel = computed(() =>
  teacherModelLabel.value
    ? i18nT('使用全局模型 {provider} 实时回复', { provider: teacherModelLabel.value })
    : i18nT('使用全局当前大模型实时回复'));
const educationLiveStatus = computed(() => {
  if (teacherRecording.value) return i18nT('正在听取学生语音');
  if (teacherTranscribing.value) return i18nT('正在把语音转成文本');
  if (teacherBusy.value) return i18nT('实训导师正在回复');
  if (speakingMessageId.value) return i18nT('正在朗读教学消息');
  return i18nT('多 Agent 教学链已就绪');
});
const teacherQuickPrompts = computed(() => [
  i18nT('带我完成一次跨境电商商品上架策划'),
  i18nT('模拟新能源汽车检修工单分析'),
  i18nT('帮我拆解毕业设计的本周任务'),
  i18nT('根据作品草稿给我形成性反馈'),
]);

const TEACHER_WELCOME = () => i18nT('你好！我是你的实训导师。请告诉我你的专业、课程和想完成的岗位任务；我会分步骤引导，并把关键评价点交给教师确认。');

const statusLabel = computed(() => {
  if (statusLoading.value) return i18nT('检查中');
  if (statusError.value) return i18nT('不可用');
  if (statusResponse.value?.ok) return i18nT('服务已连接');
  return i18nT('尚未检查');
});

const statusTone = computed(() => {
  if (statusLoading.value) return 'loading';
  if (statusError.value) return 'danger';
  if (statusResponse.value?.ok) return 'success';
  return 'neutral';
});

const capabilityDefinitions = computed(() => [
  {
    id: 'conversation',
    label: i18nT('实训导师对话'),
    description: i18nT('用于课程答疑、岗位任务推演和作品反馈的真实模型对话。'),
    icon: 'ri-chat-3-line',
  },
  {
    id: 'speech',
    label: i18nT('课堂语音交互'),
    description: i18nT('支持学生语音提问、课堂录音转写与逐条朗读。'),
    icon: 'ri-mic-line',
  },
  {
    id: 'workflow',
    label: i18nT('多 Agent 备课工作流'),
    description: i18nT('课程设计、资源生成和教学审核 Agent 协同产出课程包。'),
    icon: 'ri-node-tree',
  },
  {
    id: 'digitalHuman',
    label: i18nT('数字人服务'),
    description: i18nT('可作为后续示范形象能力使用。'),
    icon: 'ri-user-voice-line',
  },
  {
    id: 'masking',
    label: i18nT('学生信息脱敏'),
    description: i18nT('用于保护进入模型流程的个人信息。'),
    icon: 'ri-shield-user-line',
  },
  {
    id: 'toneScoring',
    label: i18nT('技能动作自动评分'),
    description: i18nT('需要专业设备或实训平台采集操作过程，当前未接入。'),
    icon: 'ri-pulse-line',
  },
  {
    id: 'strokeOrder',
    label: i18nT('教务系统成绩回写'),
    description: i18nT('需要学校教务系统授权和教师确认，当前未接入。'),
    icon: 'ri-brush-2-line',
  },
]);

const capabilityCards = computed<CapabilityCard[]>(() => {
  const capabilities = (statusResponse.value?.capabilities || {}) as Record<string, Capability>;
  return capabilityDefinitions.value.map((definition) => {
    const capability = capabilities[definition.id];
    return {
      ...definition,
      available: capability?.available === true,
      reason: capability?.reason ? i18nT(String(capability.reason)) : '',
    };
  });
});

/**
 * 长步骤看门狗（2026-10-13：「等 10 分钟都没变化，不知道是生成不出来还是正在生成」）。
 * 这页的三条生成（示范音频 / 教案 / 配图）都是单次 await 主进程调用，没有进度事件也没有取消通道：
 * 记真实开始时刻 → 秒表从那里走；跑过怀疑线出「可能已超时」卡（只给 继续等待 / 查看日志，
 * 主进程自己有 5 / 30 分钟硬超时会报错）；失败出红卡 + 重新生成。序号守卫让上一轮迟到的结果作废。
 */
function stepRun(kind: StepKind, estimateMs: number) {
  const startedAt = ref<number | null>(null);
  const failed = ref(false);
  let seq = 0;
  const watchdog = useStepWatchdog({
    running: () => startedAt.value != null,
    startedAt: () => startedAt.value,
    estimateMs: () => estimateMs,
    kind,
  });
  return {
    startedAt, failed, watchdog, estimateSec: Math.round(estimateMs / 1000),
    /** 新一轮开始：返回本轮序号 */
    begin(): number { failed.value = false; startedAt.value = Date.now(); return ++seq; },
    /** 本轮是不是最新一轮（用户点了重新生成后，旧那轮的结果不再写回界面） */
    current(s: number): boolean { return s === seq; },
    end(s: number): void { if (s === seq) startedAt.value = null; },
    elapsedLabel(): string { return i18nT('已用 {p0}', { p0: formatStepDuration(watchdog.elapsedSec.value) }); },
  };
}
const ttsRun = stepRun('tts', 20_000);
const lessonRun = stepRun('llm', 180_000);
const imageRun = stepRun('image', 60_000);

const asrForm = reactive({
  backend: 'deepgram',
  language: 'zh',
  audioUrl: '',
  diarization: false,
});
const selectedAudioName = ref('');
const speechBusy = ref(false);
const speechError = ref('');
const asrUtterances = ref<SpeechUtterance[]>([]);

const ttsBackends = ref(['elevenlabs', 'xunfei', 'azure']);
const ttsForm = reactive({
  backend: 'elevenlabs',
  text: i18nT('你好，我叫穆罕默德。'),
  voice: '',
  language: 'zh',
  format: 'mp3' as 'mp3' | 'wav' | 'opus' | 'pcm16',
});
const ttsAudio = ref<{ dataUrl: string; format: string; bytes: number } | null>(null);

const lessonBusy = ref(false);
const lessonError = ref('');
const lessonRaw = ref<any>(null);
const lessonForm = reactive({
  topic: '',
  grade: '',
  learnerLevel: i18nT('入门'),
  durationMinutes: 45,
  outputLanguage: 'zh-CN' as 'zh-CN' | 'en-US' | 'ar',
});

const imageModelLoading = ref(false);
const mediaKinds = ref<MediaModelKindState[]>([]);
const imageBusy = ref(false);
const imageError = ref('');
const imageProviderResult = ref('');
const generatedImages = ref<Array<{ url: string; revisedPrompt?: string; size?: string }>>([]);
const imageForm = reactive({
  backend: '',
  model: '',
  prompt: '',
  style: i18nT('教材插画'),
  size: '1024x1024',
});

const imageModelState = computed(() =>
  mediaKinds.value.find((item) => item.kind === 'image'));

const configuredImageProviders = computed<MediaModelProviderState[]>(() =>
  imageModelState.value?.providers.filter((provider) => provider.configured) || []);

const activeImageProviderLabel = computed(() => {
  const state = imageModelState.value;
  if (!state?.activeProvider) return i18nT('未设置默认引擎');
  return state.providers.find((provider) => provider.id === state.activeProvider)?.label
    || state.activeProvider;
});

const lessonResult = computed(() => {
  if (!lessonRaw.value) return '';
  const raw = lessonRaw.value;
  let value = raw.reviewedLesson
    ?? raw.vars?.reviewedLesson
    ?? raw.vars?.reviewed_lesson
    ?? raw.bindings?.reviewedLesson
    ?? raw.bindings?.reviewed_lesson
    ?? raw.finalOutput
    ?? raw.output
    ?? raw.result
    ?? raw;
  for (let depth = 0; depth < 4 && value && typeof value === 'object'; depth += 1) {
    value = value.output ?? value.content ?? value.text ?? value.result ?? value.value ?? value;
    if (typeof value === 'string') break;
  }
  return typeof value === 'string' ? value : JSON.stringify(value, null, 2);
});

function educationApi(): any {
  return (window as any).electronAPI?.workbenches?.education;
}

function speechApi(): any {
  return (window as any).electronAPI?.qiyeApi;
}

let teacherMediaRecorder: MediaRecorder | null = null;
let teacherMediaStream: MediaStream | null = null;
let teacherAudioChunks: Blob[] = [];

async function clearTeacherChat(): Promise<void> {
  const previousSessionId = teacherSessionId.value;
  teacherSessionId.value = '';
  teacherMessages.value = [{ id: `teacher-${Date.now()}`, role: 'assistant', content: TEACHER_WELCOME() }];
  teacherInput.value = '';
  teacherError.value = '';
  if (previousSessionId) {
    try {
      await (window as any).electronAPI?.deleteSession?.({ sessionId: previousSessionId });
    } catch {
      // 会话清理失败不影响用户立即开始新对话。
    }
  }
}

async function loadTeacherModelLabel(): Promise<void> {
  try {
    const result = await (window as any).electronAPI?.modelsList?.();
    const config = result?.configuration;
    teacherModelLabel.value = [config?.activeProvider, config?.activeModel].filter(Boolean).join(' / ');
  } catch {
    teacherModelLabel.value = '';
  }
}

async function ensureTeacherSession(): Promise<string> {
  if (teacherSessionId.value) return teacherSessionId.value;
  const api = (window as any).electronAPI;
  if (!api?.createSession) throw new Error(i18nT('全局对话服务不可用'));
  const result = await api.createSession({ roleId: 'education_chinese_teacher' });
  const sessionId = String(result?.sessionId || '');
  if (!sessionId) throw new Error(i18nT('实训导师会话创建失败'));
  teacherSessionId.value = sessionId;
  return sessionId;
}

async function scrollTeacherMessages(): Promise<void> {
  await nextTick();
  const el = teacherMessageList.value;
  if (el) el.scrollTop = el.scrollHeight;
}

async function sendTeacherMessage(): Promise<void> {
  const text = teacherInput.value.trim();
  if (!text || teacherBusy.value) return;
  teacherError.value = '';
  teacherMessages.value.push({ id: `user-${Date.now()}`, role: 'user', content: text });
  teacherInput.value = '';
  teacherBusy.value = true;
  await scrollTeacherMessages();
  const api = (window as any).electronAPI;
  let removeTokenListener: (() => void) | undefined;
  let removeCompleteListener: (() => void) | undefined;
  let removeErrorListener: (() => void) | undefined;
  try {
    if (!api?.sendMessage || !api?.onStreamToken) throw new Error(i18nT('全局对话服务不可用'));
    const sessionId = await ensureTeacherSession();
    let reply = '';
    let streamError = '';
    teacherMessages.value.push({
      id: `assistant-${Date.now()}`,
      role: 'assistant',
      content: '',
    });
    // 必须改数组里的响应式版本：改 push 进去的原对象不触发界面更新（回复会等整段结束才一次性出现）
    const assistantMessage = teacherMessages.value[teacherMessages.value.length - 1];
    removeTokenListener = api.onStreamToken((data: any) => {
      if (data?.sessionId === sessionId) {
        reply += String(data?.text || '');
        assistantMessage.content = reply;
        void scrollTeacherMessages();
      }
    });
    removeCompleteListener = api.onStreamComplete?.((data: any) => {
      if (data?.sessionId !== sessionId || reply.trim()) return;
      reply = String(data?.finalMessage ?? data?.message ?? data?.content ?? '');
    });
    removeErrorListener = api.onStreamError?.((data: any) => {
      if (data?.sessionId === sessionId) streamError = String(humanizeErrorMessage(data, i18nT('实训导师回复失败')));
    });
    await api.sendMessage({
      sessionId,
      content: [
        i18nT('【本轮教学协议】学生是阿拉伯语母语的职业院校/高校学生。'),
        i18nT('请始终使用结构化 Markdown，并按“中文教学内容 → 阿拉伯语解释”的双语格式回复；阿拉伯语段落自然、可按 RTL 显示。'),
        i18nT('逐步引导，不一次替学生完成作业；关键评价与高风险操作交由教师确认。'),
        i18nT('【学生消息】{text}', { text }),
      ].join('\n'),
    });
    if (streamError) throw new Error(streamError);
    reply = reply.trim();
    if (!reply) throw new Error(i18nT('实训导师没有返回有效内容'));
    assistantMessage.content = reply;
    if (autoSpeakNextReply.value) {
      autoSpeakNextReply.value = false;
      await nextTick();
      speakTeacherMessage(assistantMessage);
    }
  } catch (error) {
    autoSpeakNextReply.value = false;
    const last = teacherMessages.value.at(-1);
    if (last?.role === 'assistant' && !last.content) teacherMessages.value.pop();
    teacherError.value = errorMessage(error, i18nT('实训导师回复失败'));
  } finally {
    removeTokenListener?.();
    removeCompleteListener?.();
    removeErrorListener?.();
    teacherBusy.value = false;
    await scrollTeacherMessages();
  }
}

function sendTeacherPrompt(prompt: string): void {
  teacherInput.value = prompt;
  void sendTeacherMessage();
}

async function startEducationLesson(): Promise<void> {
  activeTab.value = 'practice';
  await clearTeacherChat();
  autoSpeakNextReply.value = true;
  sendTeacherPrompt(i18nT('我是跨境电商专业学生。请以“为阿联酋市场策划一款校园智能水杯的商品上架”为实训任务，先给我任务背景、岗位角色、第一步操作和提交要求；不要一次替我完成全部作业。'));
}

function stopTeacherMediaTracks(): void {
  teacherMediaStream?.getTracks().forEach((track) => track.stop());
  teacherMediaStream = null;
}

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ''));
    reader.onerror = () => reject(reader.error || new Error(i18nT('读取录音失败')));
    reader.readAsDataURL(blob);
  });
}

async function transcribeTeacherRecording(blob: Blob): Promise<void> {
  teacherTranscribing.value = true;
  teacherError.value = '';
  try {
    const api = speechApi();
    if (!api?.speechAsr) throw new Error(i18nT('语音识别接口不可用'));
    const audioUrl = await blobToDataUrl(blob);
    const response = await api.speechAsr({
      backend: asrForm.backend || 'deepgram',
      audioUrl,
      language: asrForm.language || 'zh',
      diarization: false,
    });
    const utterances = Array.isArray(response?.utterances) ? response.utterances : [];
    const transcript = utterances.map((item: any) => String(item?.text || '')).filter(Boolean).join(' ').trim();
    if (!transcript) throw new Error(i18nT('没有识别到语音，请靠近麦克风后重试'));
    teacherInput.value = transcript;
    await sendTeacherMessage();
  } catch (error) {
    teacherError.value = errorMessage(error, i18nT('语音识别失败'));
  } finally {
    teacherTranscribing.value = false;
  }
}

async function startTeacherRecording(): Promise<void> {
  teacherError.value = '';
  try {
    await (window as any).electronAPI?.appPermissions?.requestMicrophone?.();
    teacherMediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });
    teacherAudioChunks = [];
    const preferredType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
      ? 'audio/webm;codecs=opus'
      : 'audio/webm';
    teacherMediaRecorder = new MediaRecorder(teacherMediaStream, { mimeType: preferredType });
    teacherMediaRecorder.addEventListener('dataavailable', (event) => {
      if (event.data.size > 0) teacherAudioChunks.push(event.data);
    });
    teacherMediaRecorder.addEventListener('stop', () => {
      const blob = new Blob(teacherAudioChunks, { type: teacherMediaRecorder?.mimeType || preferredType });
      stopTeacherMediaTracks();
      if (blob.size > 0) void transcribeTeacherRecording(blob);
    }, { once: true });
    teacherMediaRecorder.start();
    teacherRecording.value = true;
  } catch (error) {
    stopTeacherMediaTracks();
    teacherRecording.value = false;
    teacherError.value = errorMessage(error, i18nT('无法使用麦克风，请检查系统权限'));
  }
}

function stopTeacherRecording(): void {
  if (teacherMediaRecorder?.state === 'recording') teacherMediaRecorder.stop();
  teacherRecording.value = false;
}

function toggleTeacherRecording(): void {
  if (teacherRecording.value) stopTeacherRecording();
  else void startTeacherRecording();
}

function speakTeacherMessage(message: TeacherMessage): void {
  if (!('speechSynthesis' in window)) {
    teacherError.value = i18nT('当前系统不支持语音朗读');
    return;
  }
  window.speechSynthesis.cancel();
  if (speakingMessageId.value === message.id) {
    speakingMessageId.value = '';
    return;
  }
  const segments = message.content
    .split(/\n+/)
    .map((segment) => segment.trim())
    .filter(Boolean);
  speakingMessageId.value = message.id;
  segments.forEach((segment, index) => {
    const utterance = new SpeechSynthesisUtterance(segment);
    utterance.lang = /[\u0600-\u06ff]/.test(segment) ? 'ar-SA' : 'zh-CN';
    utterance.rate = 0.9;
    utterance.pitch = 1;
    if (index === segments.length - 1) {
      utterance.onend = () => {
        if (speakingMessageId.value === message.id) speakingMessageId.value = '';
      };
      utterance.onerror = () => {
        if (speakingMessageId.value === message.id) speakingMessageId.value = '';
      };
    }
    window.speechSynthesis.speak(utterance);
  });
}

/**
 * 错误 → 人话。必须走 humanizeErrorMessage，不能直接把 error.message 摆给用户：
 * 原文里常带绝对路径、栈帧、Python traceback、exit code、ENOENT 这类工程噪音，
 * 以及 QIYE_API_401 / GATEWAY_NOT_READY 这类内部错误码 —— 用户看不懂也没法照做。
 * humanizeErrorMessage 负责查错误码映射表、剥噪音、并做语种兜底。
 */
function errorMessage(error: unknown, fallback: string): string {
  return humanizeErrorMessage(error, fallback);
}

async function loadStatus(): Promise<void> {
  statusLoading.value = true;
  statusError.value = '';
  try {
    const api = educationApi();
    if (!api?.status) throw new Error(i18nT('教育工作台接口不可用'));
    statusResponse.value = await api.status();
  } catch (error) {
    statusResponse.value = null;
    statusError.value = errorMessage(error, i18nT('能力状态检查失败'));
  } finally {
    statusLoading.value = false;
  }
}

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ''));
    reader.onerror = () => reject(reader.error || new Error(i18nT('读取音频文件失败')));
    reader.readAsDataURL(file);
  });
}

async function selectAudioFile(event: Event): Promise<void> {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];
  if (!file) return;
  speechError.value = '';
  selectedAudioName.value = file.name;
  try {
    asrForm.audioUrl = await fileToDataUrl(file);
  } catch (error) {
    selectedAudioName.value = '';
    asrForm.audioUrl = '';
    speechError.value = errorMessage(error, i18nT('读取音频文件失败'));
  }
}

async function runAsr(): Promise<void> {
  if (!asrForm.audioUrl.trim()) {
    speechError.value = i18nT('请选择音频文件或填写音频地址');
    return;
  }
  speechBusy.value = true;
  speechError.value = '';
  ttsRun.failed.value = false; // 与示范音频共用 speechError：识别的报错不该顶着「重新生成音频」的卡
  asrUtterances.value = [];
  try {
    const api = speechApi();
    if (!api?.speechAsr) throw new Error(i18nT('语音识别接口不可用'));
    const response = await api.speechAsr({
      backend: asrForm.backend,
      audioUrl: asrForm.audioUrl.trim(),
      language: asrForm.language || undefined,
      diarization: asrForm.diarization,
    });
    asrUtterances.value = Array.isArray(response?.utterances) ? response.utterances : [];
  } catch (error) {
    speechError.value = errorMessage(error, i18nT('语音识别失败'));
  } finally {
    speechBusy.value = false;
  }
}

async function runTts(): Promise<void> {
  if (!ttsForm.text.trim()) {
    speechError.value = i18nT('请输入示范文本');
    return;
  }
  if (speechBusy.value) return;
  const seq = ttsRun.begin();
  speechBusy.value = true;
  speechError.value = '';
  ttsAudio.value = null;
  try {
    const api = speechApi();
    if (!api?.speechTts) throw new Error(i18nT('语音合成接口不可用'));
    const response = await api.speechTts({
      backend: ttsForm.backend,
      text: ttsForm.text.trim(),
      voice: ttsForm.voice.trim() || undefined,
      language: ttsForm.language || undefined,
      format: ttsForm.format,
    });
    if (!ttsRun.current(seq)) return;
    ttsAudio.value = {
      dataUrl: `data:${response.mimeType};base64,${response.audioBase64}`,
      format: response.format,
      bytes: Number(response.bytes || 0),
    };
  } catch (error) {
    if (!ttsRun.current(seq)) return;
    ttsRun.failed.value = true;
    speechError.value = errorMessage(error, i18nT('语音合成失败'));
  } finally {
    if (ttsRun.current(seq)) { speechBusy.value = false; ttsRun.end(seq); }
  }
}

async function prepareLesson(): Promise<void> {
  if (!lessonForm.topic.trim() || !lessonForm.grade.trim()) {
    lessonError.value = i18nT('请填写课程主题和学段');
    return;
  }
  if (lessonBusy.value) return;
  const seq = lessonRun.begin();
  lessonBusy.value = true;
  lessonError.value = '';
  lessonRaw.value = null;
  try {
    const api = educationApi();
    if (!api?.prepareLesson) throw new Error(i18nT('教育备课接口不可用'));
    const result = await api.prepareLesson({
      topic: lessonForm.topic.trim(),
      grade: lessonForm.grade.trim(),
      learnerLevel: lessonForm.learnerLevel,
      durationMinutes: lessonForm.durationMinutes,
      outputLanguage: lessonForm.outputLanguage,
    });
    if (!lessonRun.current(seq)) return;
    lessonRaw.value = result;
  } catch (error) {
    if (!lessonRun.current(seq)) return;
    lessonRun.failed.value = true;
    lessonError.value = errorMessage(error, i18nT('教案生成失败'));
  } finally {
    if (lessonRun.current(seq)) { lessonBusy.value = false; lessonRun.end(seq); }
  }
}

async function loadImageModelState(): Promise<void> {
  imageModelLoading.value = true;
  try {
    const response = await (window as any).electronAPI?.mediaModel?.get?.();
    mediaKinds.value = Array.isArray(response?.kinds) ? response.kinds : [];
    const state = imageModelState.value;
    const active = state?.providers.find((provider) =>
      provider.id === state.activeProvider && provider.configured);
    imageForm.backend = active?.id || configuredImageProviders.value[0]?.id || '';
    imageForm.model = state?.activeModel || '';
  } catch (error) {
    mediaKinds.value = [];
    imageError.value = errorMessage(error, i18nT('读取图片模型配置失败'));
  } finally {
    imageModelLoading.value = false;
  }
}

function openImageModelSettings(): void {
  router.push({
    path: '/settings',
    query: { section: 'ai-models', media: 'image' },
  });
}

async function generateTeachingImage(): Promise<void> {
  if (!imageForm.backend) {
    imageError.value = i18nT('请先配置图片模型');
    return;
  }
  if (!imageForm.prompt.trim()) {
    imageError.value = i18nT('请输入教学配图提示词');
    return;
  }
  if (imageBusy.value) return;
  const seq = imageRun.begin();
  imageBusy.value = true;
  imageError.value = '';
  generatedImages.value = [];
  imageProviderResult.value = '';
  try {
    const [width, height] = imageForm.size.split('x').map(Number);
    const api = speechApi();
    if (!api?.imageGenerate) throw new Error(i18nT('图片生成接口不可用'));
    const response = await api.imageGenerate({
      backend: imageForm.backend,
      model: imageForm.model.trim() || undefined,
      prompt: imageForm.prompt.trim(),
      style: imageForm.style.trim() || undefined,
      width,
      height,
      n: 1,
    });
    if (!imageRun.current(seq)) return;
    generatedImages.value = Array.isArray(response?.images) ? response.images : [];
    imageProviderResult.value = [response?.provider, response?.model].filter(Boolean).join(' · ');
    if (!generatedImages.value.length) {
      throw new Error(i18nT('图片服务未返回可展示的图片'));
    }
  } catch (error) {
    if (!imageRun.current(seq)) return;
    imageRun.failed.value = true;
    imageError.value = errorMessage(error, i18nT('教学配图生成失败'));
  } finally {
    if (imageRun.current(seq)) { imageBusy.value = false; imageRun.end(seq); }
  }
}

function formatSpeechTime(value: unknown): string {
  const ms = Number(value);
  if (!Number.isFinite(ms)) return '—';
  return `${(ms / 1000).toFixed(1)}s`;
}

function formatConfidence(value: unknown): string {
  const confidence = Number(value);
  if (!Number.isFinite(confidence)) return '—';
  return (confidence * 100).toFixed(1);
}

function formatBytes(value: number): string {
  if (!Number.isFinite(value) || value <= 0) return '0 KB';
  return `${(value / 1024).toFixed(1)} KB`;
}

onMounted(() => {
  lessonForm.outputLanguage = locale.value === 'ar'
    ? 'ar'
    : locale.value === 'en-US'
      ? 'en-US'
      : 'zh-CN';
  void loadStatus();
  void clearTeacherChat();
  void loadTeacherModelLabel();
  void loadImageModelState();
});

onBeforeUnmount(() => {
  if (teacherMediaRecorder?.state === 'recording') teacherMediaRecorder.stop();
  stopTeacherMediaTracks();
  window.speechSynthesis?.cancel();
});
</script>

<style scoped>
.workbench {
  height: 100%;
  min-height: 0;
  overflow-y: auto;
  padding: 24px;
  color: var(--color-text);
  background:
    radial-gradient(circle at 8% 0%, color-mix(in srgb, var(--color-primary, #3b82f6) 8%, transparent), transparent 30%),
    var(--color-bg);
}

.hero {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 24px;
  max-width: 1280px;
  margin: 0 auto 18px;
}

.hero-copy { max-width: 760px; margin-inline-end: auto; }
.hero-actions { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; justify-content: flex-end; }
.demo-banner {
  display: flex;
  align-items: center;
  gap: 12px;
  max-width: 1280px;
  margin: 0 auto 14px;
  padding: 12px 14px;
  border: 1px solid color-mix(in srgb, var(--color-brand) 28%, var(--color-border));
  border-radius: 13px;
  background: color-mix(in srgb, var(--color-brand) 7%, var(--color-bg-card));
}
.demo-banner > i { flex: 0 0 auto; color: var(--color-brand); font-size: 22px; }
.demo-banner > div { flex: 1; min-width: 0; }
.demo-banner strong { display: block; margin-bottom: 3px; font-size: 13px; }
.demo-banner p { margin: 0; color: var(--color-text-muted); font-size: 11px; line-height: 1.5; }
.education-platform-flow {
  max-width: 1280px; margin: 0 auto 14px; padding: 13px 14px;
  border: 1px solid color-mix(in srgb, var(--color-brand) 28%, var(--color-border));
  border-radius: 15px; background: color-mix(in srgb, var(--color-bg-card) 94%, #eff6ff);
}
.education-platform-flow > header {
  display: flex; align-items: center; justify-content: space-between; gap: 14px; margin-bottom: 10px;
}
.education-platform-flow > header > div { display: grid; gap: 2px; }
.education-platform-flow > header span { color: var(--color-text); font-size: 12px; font-weight: 800; }
.education-platform-flow > header span i { margin-inline-end: 5px; color: var(--color-brand); }
.education-platform-flow > header small { color: var(--color-text-muted); font-size: 9px; }
.education-platform-flow > header em {
  display: inline-flex; align-items: center; gap: 6px; padding: 5px 9px; border-radius: 999px;
  color: #047857; background: #d1fae5; font-size: 9px; font-style: normal; font-weight: 800; white-space: nowrap;
}
.education-platform-flow > header em i {
  width: 6px; height: 6px; border-radius: 50%; background: #10b981; box-shadow: 0 0 0 3px rgba(16,185,129,.14);
}
.education-platform-flow > header em.active i { animation: education-pulse 1.1s ease-in-out infinite; }
.education-platform-flow > div {
  display: grid; grid-template-columns: repeat(5, minmax(0, 1fr)); gap: 8px;
}
.education-platform-flow article {
  display: grid; grid-template-columns: 32px 1fr; align-items: center; gap: 8px; min-width: 0;
  padding: 9px; border: 1px solid var(--color-border); border-radius: 10px; background: var(--color-bg-card);
  opacity: .64; transition: opacity .2s, border-color .2s, box-shadow .2s;
}
.education-platform-flow article.done { opacity: .92; border-color: #a7f3d0; }
.education-platform-flow article.active {
  opacity: 1; border-color: var(--color-brand); box-shadow: 0 7px 20px rgba(59,130,246,.14);
}
.education-platform-flow article > span {
  display: grid; width: 32px; height: 32px; place-items: center; border-radius: 9px;
  color: var(--color-brand); background: color-mix(in srgb, var(--color-brand) 11%, transparent);
}
.education-platform-flow article div { min-width: 0; }
.education-platform-flow article small,
.education-platform-flow article strong,
.education-platform-flow article p { display: block; }
.education-platform-flow article small { color: var(--color-text-muted); font-size: 7px; letter-spacing: .04em; }
.education-platform-flow article strong { margin: 2px 0; font-size: 10px; }
.education-platform-flow article p {
  overflow: hidden; margin: 0; color: var(--color-text-muted); font-size: 8px; text-overflow: ellipsis; white-space: nowrap;
}
@keyframes education-pulse {
  0%, 100% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.5); opacity: .55; }
}
.teacher-chat {
  display: grid;
  grid-template-columns: 260px minmax(0, 1fr);
  max-width: 1280px;
  min-height: 520px;
  margin: 0 auto 18px;
  overflow: hidden;
  border: 1px solid color-mix(in srgb, var(--color-brand) 30%, var(--color-border));
  border-radius: 18px;
  background: var(--color-bg-card);
  box-shadow: 0 18px 50px rgba(15, 23, 42, .10);
}
.teacher-profile {
  padding: 32px 24px;
  color: #fff;
  background:
    radial-gradient(circle at 20% 8%, rgba(255,255,255,.18), transparent 30%),
    linear-gradient(155deg, #2563eb, #4f46e5 55%, #7c3aed);
}
.teacher-avatar {
  display: grid; width: 72px; height: 72px; place-items: center;
  margin-bottom: 12px; border: 2px solid rgba(255,255,255,.75); border-radius: 22px;
  background: rgba(255,255,255,.16); font-size: 32px; font-weight: 800;
}
.teacher-online { display: inline-flex; align-items: center; gap: 5px; margin-bottom: 20px; font-size: 10px; }
.teacher-online i { width: 7px; height: 7px; border-radius: 50%; background: #4ade80; box-shadow: 0 0 0 3px rgba(74,222,128,.22); }
.teacher-profile h2 { margin: 0 0 8px; font-size: 20px; }
.teacher-profile p { margin: 0; color: rgba(255,255,255,.76); font-size: 12px; line-height: 1.7; }
.teacher-capabilities { display: grid; gap: 8px; margin-top: 28px; }
.teacher-capabilities span { display: flex; align-items: center; gap: 8px; padding: 8px 10px; border-radius: 9px; background: rgba(255,255,255,.11); font-size: 10px; }
.chat-workspace { display: flex; min-width: 0; min-height: 0; flex-direction: column; }
.chat-topbar {
  display: flex; align-items: center; justify-content: space-between; gap: 12px;
  padding: 14px 18px; border-bottom: 1px solid var(--color-border);
}
.chat-topbar strong, .chat-topbar span { display: block; }
.chat-topbar strong { font-size: 13px; }
.chat-topbar span { margin-top: 3px; color: var(--color-text-muted); font-size: 9px; }
.chat-topbar button {
  display: inline-flex; align-items: center; gap: 5px; padding: 6px 9px;
  border: 1px solid var(--color-border); border-radius: 8px; color: var(--color-text-muted);
  background: var(--color-bg-primary); cursor: pointer; font-family: inherit; font-size: 9px;
}
.teacher-messages {
  flex: 1; min-height: 260px; max-height: 330px; overflow-y: auto;
  padding: 20px; background: color-mix(in srgb, var(--color-bg-primary) 84%, #eff6ff);
}
.teacher-message { display: flex; align-items: flex-start; gap: 9px; max-width: 78%; margin-bottom: 15px; }
.teacher-message.user { margin-inline-start: auto; flex-direction: row-reverse; }
.message-avatar {
  display: grid; width: 30px; height: 30px; flex: 0 0 auto; place-items: center;
  border-radius: 9px; color: #fff; background: var(--color-brand); font-size: 10px; font-weight: 800;
}
.teacher-message.user .message-avatar { color: var(--color-text-secondary); background: var(--color-bg-hover); }
.message-meta { display: flex; min-height: 19px; align-items: center; justify-content: space-between; gap: 10px; }
.teacher-message small { display: block; margin: 0 0 4px; color: var(--color-text-muted); font-size: 8px; }
.teacher-message.user small { text-align: right; }
.message-meta button {
  display: inline-flex; align-items: center; gap: 3px; margin: 0 2px 3px 0; padding: 2px 5px;
  border: 0; border-radius: 5px; color: var(--color-brand); background: transparent;
  cursor: pointer; font-family: inherit; font-size: 8px;
}
.message-meta button:hover { background: color-mix(in srgb, var(--color-brand) 8%, transparent); }
.teacher-message-markdown {
  margin: 0; padding: 10px 12px; border: 1px solid var(--color-border); border-radius: 4px 13px 13px;
  overflow-wrap: anywhere; color: var(--color-text-primary); background: var(--color-bg-card);
  font-size: 11px; line-height: 1.65; unicode-bidi: plaintext;
}
.teacher-message.user .teacher-message-markdown { border-color: transparent; border-radius: 13px 4px 13px 13px; color: #fff; background: var(--color-brand); }
.teacher-message-markdown :deep(p) { margin: 0 0 7px; }
.teacher-message-markdown :deep(p:last-child) { margin-bottom: 0; }
.teacher-message-markdown :deep(ul),
.teacher-message-markdown :deep(ol) { margin: 5px 0; padding-inline-start: 20px; }
.teacher-message-markdown :deep(li) { margin: 2px 0; }
.teacher-message-markdown :deep(strong) { font-weight: 800; }
.teacher-message-markdown :deep(code) {
  padding: 1px 4px; border-radius: 4px; color: inherit;
  background: color-mix(in srgb, currentColor 10%, transparent); font-family: var(--font-mono, ui-monospace);
}
.teacher-message-markdown :deep(pre) {
  max-width: 100%; overflow-x: auto; margin: 7px 0; padding: 8px;
  border-radius: 7px; background: color-mix(in srgb, #0f172a 92%, transparent);
  color: #e2e8f0; direction: ltr; text-align: left;
}
.teacher-message-markdown :deep(blockquote) {
  margin: 7px 0; padding-inline-start: 9px;
  border-inline-start: 3px solid color-mix(in srgb, currentColor 35%, transparent); opacity: .88;
}
.typing {
  display: flex !important; gap: 4px; width: 42px; margin: 0; padding: 10px 12px;
  border: 1px solid var(--color-border); border-radius: 4px 13px 13px; background: var(--color-bg-card);
}
.typing i { width: 5px; height: 5px; border-radius: 50%; background: #94a3b8; animation: teacher-bounce 1s infinite alternate; }
.typing i:nth-child(2) { animation-delay: .18s; }
.typing i:nth-child(3) { animation-delay: .36s; }
@keyframes teacher-bounce { to { transform: translateY(-4px); opacity: .5; } }
.teacher-prompts { display: flex; gap: 6px; overflow-x: auto; padding: 10px 16px 0; }
.teacher-prompts button {
  flex: 0 0 auto; padding: 6px 9px; border: 1px solid color-mix(in srgb, var(--color-brand) 25%, var(--color-border));
  border-radius: 999px; color: var(--color-brand); background: color-mix(in srgb, var(--color-brand) 6%, var(--color-bg-card));
  cursor: pointer; font-family: inherit; font-size: 9px;
}
.teacher-composer { display: grid; grid-template-columns: 1fr auto; gap: 9px; padding: 10px 16px 16px; }
.teacher-composer textarea {
  min-height: 58px; resize: none; padding: 10px 12px; border: 1px solid var(--color-border); border-radius: 11px;
  color: var(--color-text-primary); background: var(--color-bg-primary); font-family: inherit; font-size: 11px; line-height: 1.5;
}
.teacher-composer > div { display: flex; align-items: stretch; gap: 6px; }
.composer-tool, .composer-send { border: 0; border-radius: 10px; cursor: pointer; font-family: inherit; }
.composer-tool { width: 38px; color: var(--color-brand); background: color-mix(in srgb, var(--color-brand) 9%, var(--color-bg-card)); font-size: 16px; }
.composer-tool.recording { color: #fff; background: #ef4444; box-shadow: 0 0 0 5px rgba(239, 68, 68, .12); }
.composer-tool:disabled { opacity: .55; cursor: default; }
.composer-send { display: inline-flex; align-items: center; gap: 6px; padding: 0 14px; color: #fff; background: var(--color-brand); font-size: 10px; font-weight: 700; }
.composer-send:disabled { opacity: .48; cursor: default; }
.teacher-recording {
  display: flex; align-items: center; gap: 7px; margin: -7px 16px 12px;
  color: #dc2626; font-size: 9px;
}
.teacher-recording i {
  width: 7px; height: 7px; border-radius: 50%; background: #ef4444;
  animation: teacher-recording-pulse 1s ease-in-out infinite;
}
@keyframes teacher-recording-pulse { 50% { transform: scale(1.55); opacity: .45; } }
.teacher-error { margin: -7px 16px 12px; color: var(--color-danger, #dc2626); font-size: 9px; }
.eyebrow,
.section-kicker {
  color: var(--color-primary, #3b82f6);
  font-size: 12px;
  font-weight: 700;
  letter-spacing: .08em;
  text-transform: uppercase;
}
.hero h1 {
  margin: 7px 0 8px;
  font-size: clamp(26px, 3vw, 38px);
  line-height: 1.12;
}
.hero p,
.section-heading p {
  margin: 0;
  color: var(--color-text-secondary);
  line-height: 1.7;
}

.boundary-banner,
.panel,
.workbench-tabs {
  max-width: 1280px;
  margin-inline: auto;
}
.boundary-banner {
  display: flex;
  gap: 12px;
  align-items: flex-start;
  padding: 14px 16px;
  margin-bottom: 16px;
  border: 1px solid color-mix(in srgb, var(--color-warning, #f59e0b) 42%, var(--color-border));
  border-radius: 14px;
  background: color-mix(in srgb, var(--color-warning, #f59e0b) 10%, var(--color-bg-elevated));
}
.boundary-banner > i { color: var(--color-warning, #f59e0b); font-size: 20px; }
.boundary-banner p { margin: 4px 0 0; color: var(--color-text-secondary); line-height: 1.55; }

.panel {
  padding: 20px;
  border: 1px solid var(--color-border);
  border-radius: 18px;
  background: var(--color-bg-elevated);
  box-shadow: 0 10px 32px color-mix(in srgb, #000 5%, transparent);
}
.capability-panel { margin-bottom: 16px; }
.section-heading {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 18px;
  margin-bottom: 18px;
}
.section-heading h2 {
  margin: 4px 0 4px;
  font-size: 19px;
}
.status-pill,
.mini-status {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  white-space: nowrap;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 650;
}
.status-pill { padding: 7px 11px; background: var(--color-bg-input); }
.status-pill i { font-size: 7px; }
.status-pill.success,
.mini-status.available { color: var(--color-success, #22c55e); }
.status-pill.danger,
.mini-status.unavailable { color: var(--color-danger, #ef4444); }
.status-pill.loading { color: var(--color-info, #3b82f6); }

.capability-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;
}
.capability-card {
  display: flex;
  gap: 12px;
  min-width: 0;
  padding: 14px;
  border: 1px solid var(--color-border);
  border-radius: 13px;
  background: color-mix(in srgb, var(--color-bg-input) 48%, transparent);
}
.capability-icon {
  display: grid;
  place-items: center;
  width: 36px;
  height: 36px;
  flex: 0 0 36px;
  border-radius: 10px;
  font-size: 18px;
}
.capability-icon.available {
  color: var(--color-success, #22c55e);
  background: color-mix(in srgb, var(--color-success, #22c55e) 13%, transparent);
}
.capability-icon.unavailable {
  color: var(--color-text-muted);
  background: var(--color-bg-input);
}
.capability-copy { min-width: 0; flex: 1; }
.capability-title-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}
.mini-status { padding: 3px 7px; background: var(--color-bg-elevated); }
.capability-card p {
  margin: 7px 0 0;
  color: var(--color-text-secondary);
  font-size: 12.5px;
  line-height: 1.5;
}
.capability-card small {
  display: block;
  margin-top: 7px;
  color: var(--color-warning, #f59e0b);
  line-height: 1.45;
}

.workbench-tabs {
  display: flex;
  gap: 6px;
  margin-bottom: 10px;
  padding: 5px;
  border: 1px solid var(--color-border);
  border-radius: 13px;
  background: var(--color-bg-elevated);
}
.workbench-tabs button,
.segmented button {
  border: 0;
  color: var(--color-text-secondary);
  background: transparent;
  cursor: pointer;
}
.workbench-tabs button {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-width: 140px;
  padding: 10px 16px;
  border-radius: 9px;
  font-weight: 650;
}
.workbench-tabs button.active,
.segmented button.active {
  color: var(--color-primary, #3b82f6);
  background: color-mix(in srgb, var(--color-primary, #3b82f6) 11%, var(--color-bg-input));
}

.workspace-panel { margin-bottom: 24px; }
.model-summary {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin: -4px 0 16px;
  padding: 12px 14px;
  border: 1px solid var(--color-border);
  border-radius: 12px;
  background: color-mix(in srgb, var(--color-primary, #3b82f6) 5%, var(--color-bg-input));
}
.model-summary > div { display: flex; align-items: baseline; flex-wrap: wrap; gap: 8px; }
.model-summary span,
.model-summary small { color: var(--color-text-secondary); font-size: 12px; }
.model-summary strong { font-size: 14px; }
.segmented {
  display: inline-flex;
  gap: 3px;
  padding: 3px;
  border-radius: 10px;
  background: var(--color-bg-input);
}
.segmented button { padding: 7px 11px; border-radius: 8px; }

.form-layout,
.lesson-layout {
  display: grid;
  grid-template-columns: minmax(0, .9fr) minmax(0, 1.1fr);
  gap: 14px;
}
.form-card,
.result-card {
  min-width: 0;
  padding: 16px;
  border: 1px solid var(--color-border);
  border-radius: 14px;
  background: color-mix(in srgb, var(--color-bg-input) 36%, transparent);
}
.field-grid {
  display: grid;
  gap: 12px;
}
.field-grid.two { grid-template-columns: repeat(2, minmax(0, 1fr)); }
.field {
  display: grid;
  gap: 7px;
  margin-bottom: 13px;
  color: var(--color-text-secondary);
  font-size: 12px;
  font-weight: 650;
}
.field input,
.field select,
.field textarea {
  width: 100%;
  box-sizing: border-box;
  border: 1px solid var(--color-border);
  border-radius: 9px;
  outline: none;
  color: var(--color-text);
  background: var(--color-bg-input);
  font: inherit;
  font-size: 13px;
}
.field input,
.field select { height: 40px; padding: 0 11px; }
.field textarea { resize: vertical; padding: 10px 11px; line-height: 1.55; }
.field input:focus,
.field select:focus,
.field textarea:focus {
  border-color: var(--color-primary, #3b82f6);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--color-primary, #3b82f6) 12%, transparent);
}

.file-picker {
  display: flex;
  align-items: center;
  gap: 11px;
  min-height: 66px;
  margin-bottom: 13px;
  padding: 10px 12px;
  border: 1px dashed var(--color-border);
  border-radius: 11px;
  cursor: pointer;
}
.file-picker:hover { border-color: var(--color-primary, #3b82f6); }
.file-picker input { display: none; }
.file-picker > i { color: var(--color-primary, #3b82f6); font-size: 25px; }
.file-picker span { display: grid; min-width: 0; gap: 3px; }
.file-picker strong { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.file-picker small { color: var(--color-text-secondary); line-height: 1.4; }
.check-field {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0 0 15px;
  color: var(--color-text-secondary);
  font-size: 13px;
}

.button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
  min-height: 39px;
  padding: 0 14px;
  border: 1px solid transparent;
  border-radius: 9px;
  font: inherit;
  font-size: 13px;
  font-weight: 650;
  text-decoration: none;
  cursor: pointer;
}
.button:disabled { opacity: .55; cursor: not-allowed; }
.button.primary {
  color: white;
  background: var(--color-primary, #3b82f6);
}
.button.secondary {
  color: var(--color-text);
  border-color: var(--color-border);
  background: var(--color-bg-elevated);
}
.button.compact { min-height: 33px; padding-inline: 10px; font-size: 12px; }

.result-title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 14px;
}
.result-title span {
  padding: 3px 7px;
  border-radius: 999px;
  color: var(--color-text-secondary);
  background: var(--color-bg-input);
  font-size: 11px;
}
.empty-state {
  display: grid;
  place-items: center;
  min-height: 180px;
  color: var(--color-text-secondary);
  text-align: center;
}
.empty-state i { font-size: 38px; opacity: .38; }
.empty-state p { margin: 7px 0 0; }
.utterance-list {
  display: grid;
  gap: 9px;
  max-height: 310px;
  overflow-y: auto;
}
.utterance-list article {
  padding: 11px;
  border: 1px solid var(--color-border);
  border-radius: 10px;
  background: var(--color-bg-elevated);
}
.utterance-meta {
  display: flex;
  justify-content: space-between;
  gap: 8px;
  color: var(--color-text-secondary);
  font-size: 11px;
}
.utterance-list p { margin: 7px 0 0; line-height: 1.6; }
.result-note {
  display: flex;
  gap: 7px;
  align-items: flex-start;
  margin-top: 12px;
  padding: 9px 10px;
  border-radius: 9px;
  color: var(--color-text-secondary);
  background: color-mix(in srgb, var(--color-info, #3b82f6) 8%, transparent);
  font-size: 12px;
  line-height: 1.5;
}
.result-note i { color: var(--color-info, #3b82f6); }
.audio-result {
  display: grid;
  place-items: center;
  gap: 12px;
  min-height: 210px;
}
.audio-result > i { color: var(--color-primary, #3b82f6); font-size: 34px; }
.audio-result audio { width: min(100%, 500px); }
.audio-result small { color: var(--color-text-secondary); }
.teaching-image-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 190px), 1fr));
  gap: 12px;
}
.teaching-image-grid a {
  display: grid;
  gap: 7px;
  color: var(--color-text-secondary);
  text-decoration: none;
}
.teaching-image-grid img {
  width: 100%;
  aspect-ratio: 1;
  object-fit: cover;
  border: 1px solid var(--color-border);
  border-radius: 12px;
  background: var(--color-bg-input);
}
.teaching-image-grid small {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.lesson-result { min-height: 390px; }
.lesson-output { max-height: 560px; overflow: auto; }
.lesson-output pre {
  margin: 0;
  white-space: pre-wrap;
  word-break: break-word;
  color: var(--color-text);
  font-family: var(--font-mono, ui-monospace);
  font-size: 12.5px;
  line-height: 1.65;
}
.message {
  display: flex;
  gap: 8px;
  align-items: flex-start;
  margin-bottom: 12px;
  padding: 10px 12px;
  border-radius: 9px;
  font-size: 12.5px;
  line-height: 1.5;
}
.message.error {
  color: var(--color-danger, #ef4444);
  background: color-mix(in srgb, var(--color-danger, #ef4444) 10%, transparent);
}
/* 生成中的真实已用时长（紧挨按钮；看门狗秒表，换 tab 回来不归零） */
.step-elapsed {
  display: inline-block;
  margin-inline-start: 10px;
  font-size: 12px;
  font-variant-numeric: tabular-nums;
  color: var(--color-text-muted);
}
.spin { animation: spin .85s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }

[dir="rtl"] .hero,
[dir="rtl"] .section-heading,
[dir="rtl"] .capability-card,
[dir="rtl"] .boundary-banner,
[dir="rtl"] .result-note,
[dir="rtl"] .file-picker { text-align: right; }

@container main-page (max-width: 980px) {
  .education-platform-flow > div { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .teacher-chat { grid-template-columns: 210px minmax(0, 1fr); }
  .capability-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .form-layout,
  .lesson-layout { grid-template-columns: 1fr; }
}

@container main-page (max-width: 680px) {
  .workbench { padding: 14px; }
  .demo-banner { align-items: flex-start; flex-wrap: wrap; }
  .demo-banner > div { flex-basis: calc(100% - 42px); }
  .education-platform-flow > header { align-items: flex-start; flex-direction: column; }
  .education-platform-flow > div { grid-template-columns: 1fr; }
  .teacher-chat { display: block; }
  .teacher-profile { padding: 20px; }
  .teacher-capabilities { display: none; }
  .teacher-messages { max-height: 360px; }
  .teacher-composer { grid-template-columns: 1fr; }
  .teacher-composer > div { justify-content: flex-end; min-height: 42px; }
  .hero,
  .section-heading { flex-direction: column; }
  .model-summary { align-items: flex-start; flex-direction: column; }
  .capability-grid,
  .field-grid.two { grid-template-columns: 1fr; }
  .workbench-tabs button { flex: 1; min-width: 0; padding-inline: 8px; }
  .segmented { width: 100%; }
  .segmented button { flex: 1; }
}
</style>
