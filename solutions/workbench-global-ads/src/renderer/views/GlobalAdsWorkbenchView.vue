<template>
  <div class="ads-workbench" :dir="isRtl ? 'rtl' : 'ltr'">
    <header class="hero">
      <PageBackButton />
      <div class="hero-copy">
        <span class="eyebrow"><i class="ri-map-pin-2-line"></i>{{ $t('UAE GROWTH DESK · 阿联酋') }}</span>
        <h1>{{ $t('阿联酋海外广告代投放工作台') }}</h1>
        <p>{{ $t('依托 {p0} 等海外主流推广渠道，为客户提供产品广告投放、品牌曝光、用户增长、数据复盘与账户优化全链路服务，助力品牌实现持续增长与业务突破。', { p0: visiblePlatformLabels }) }}</p>
        <div class="hero-tags">
          <span><i class="ri-global-line"></i>{{ $t('四大主流渠道') }}</span>
          <span><i class="ri-line-chart-line"></i>{{ $t('全链路增长') }}</span>
          <span><i class="ri-shield-check-line"></i>{{ $t('客户授权登录') }}</span>
        </div>
        <!-- 服务链压缩版：原六张大卡改为一行小 icon（悬停看明细），不再占独立区块 -->
        <div class="hero-chain" :aria-label="$t('阿联酋广告代投放服务链')">
          <span
            v-for="(step, index) in HERO_CHAIN"
            :key="step.label"
            class="hero-chain-step"
            :title="$t(step.detail)"
          >
            <i :class="step.icon"></i>{{ $t(step.label) }}
            <em v-if="index < HERO_CHAIN.length - 1" aria-hidden="true">›</em>
          </span>
        </div>
      </div>
      <div class="hero-actions">
        <button class="button ghost" :disabled="refreshing" @click="refreshAll">
          <i :class="refreshing ? 'ri-loader-4-line spin' : 'ri-refresh-line'"></i>
          {{ refreshing ? $t('刷新中…') : $t('刷新状态') }}
        </button>
      </div>
    </header>

    <!-- ══ 多 Tab 导航：投放工作区 / 平台连接 / 指标与复盘 / 操作审计 / 定时自动化 ══ -->
    <nav class="ads-tabs" role="tablist" :aria-label="$t('广告工作台功能分区')">
      <button
        v-for="tab in ADS_TABS"
        :key="tab.id"
        type="button"
        role="tab"
        :aria-selected="activeTab === tab.id"
        :class="{ active: activeTab === tab.id }"
        @click="activeTab = tab.id"
      >
        <i :class="tab.icon"></i>{{ $t(tab.label) }}
      </button>
    </nav>
    <p class="ads-tab-intro">
      <i class="ri-information-line"></i>{{ $t(activeTabDef.desc) }}
    </p>

    <!-- ══ 投放工作区 Tab：引导式分步（左）+ 历史视频（右）══ -->
    <section v-if="activeTab === 'campaign'" class="campaign-guide">
      <div ref="guideMainEl" class="guide-main">
        <!-- 解决方案工作台硬规则：共享步骤条粘顶常驻视口；点选滚到对应步骤卡片 -->
        <WorkbenchStepBar :steps="guideBarSteps" :model-value="guideBarStep" @update:model-value="jumpGuideStep" />
        <!-- 第 1 步：制作引擎 -->
        <article class="guide-step" :class="{ done: adsGenerationReady }">
          <header>
            <span class="step-no"><i v-if="adsGenerationReady" class="ri-check-line"></i><template v-else>1</template></span>
            <div>
              <strong>{{ $t('第 1 步 · 配置制作引擎') }}</strong>
              <small>{{ $t('接入视频生成模型与 TTS 配音；点击卡片在弹出层完成，不跳转页面。') }}</small>
            </div>
            <em class="step-state" :class="adsGenerationReady ? 'ok' : 'todo'">
              {{ adsGenerationReady ? $t('已完成') : $t('待完成') }}
            </em>
          </header>
          <div class="step-body">
            <div class="media-engine-grid">
              <button type="button" class="media-engine-chip" :class="`tone-${adsVideoModelStatus.tone}`" @click="openMediaDialog('video')">
                <i class="ri-film-line"></i>
                <span>
                  <strong>{{ $t('视频生成模型') }}<template v-if="videoModelLabel"> · {{ videoModelLabel }}</template></strong>
                  <small v-if="adsVideoModelStatus.detail">{{ adsVideoModelStatus.detail }}</small>
                </span>
                <em>{{ adsVideoModelStatus.tone === 'ready' ? $t('已就绪') : $t('去配置') }}</em>
              </button>
              <button type="button" class="media-engine-chip" :class="`tone-${adsTtsStatus.tone}`" @click="openMediaDialog('tts')">
                <i class="ri-mic-line"></i>
                <span>
                  <strong>{{ $t('TTS 配音') }}</strong>
                  <small>{{ adsTtsStatus.detail }}</small>
                </span>
                <em>{{ adsTtsStatus.tone === 'ready' ? $t('已就绪') : $t('去配置') }}</em>
              </button>
            </div>
            <p v-if="adsVideoMode === 'dynamic' && !videoModelReady" class="media-engine-warning">
              <i class="ri-error-warning-line"></i>{{ $t('尚未配置视频剪辑模型：生成广告视频与后续投放流程都会被阻止，请先完成配置。') }}
            </p>

            <!-- #17 成片设置：成片方式 / 成片比例 / 配音与配乐 -->
            <div class="production-settings">
              <div class="ps-block">
                <span class="ps-label">{{ $t('成片方式') }}</span>
                <div class="ps-modes">
                  <button
                    v-for="mode in ADS_VIDEO_MODES"
                    :key="mode.id"
                    type="button"
                    :class="{ active: adsVideoMode === mode.id }"
                    @click="adsVideoMode = mode.id"
                  >
                    <i :class="mode.icon"></i>
                    <span><strong>{{ $t(mode.label) }}</strong><small>{{ $t(mode.desc) }}</small></span>
                  </button>
                </div>
              </div>
              <!-- #22 成片比例：多选，勾几个出几份；默认随第 2 步平台自动预勾 -->
              <div class="ps-block">
                <span class="ps-label">{{ $t('成片比例') }}</span>
                <div class="ps-aspects">
                  <label
                    v-for="aspect in ADS_VIDEO_ASPECTS"
                    :key="aspect.value"
                    class="ps-aspect"
                    :class="{ on: adsVideoAspects.includes(aspect.value) }"
                  >
                    <input
                      type="checkbox"
                      :checked="adsVideoAspects.includes(aspect.value)"
                      @change="toggleAspect(aspect.value)"
                    />
                    <span>
                      <strong>{{ aspect.label }}</strong>
                      <small>{{ aspectPlatformNote(aspect.value) || $t(aspect.hint) }}</small>
                    </span>
                  </label>
                </div>
                <small class="ps-hint">
                  {{ $t('将按勾选的比例各出一份成片（当前 {p0} 份：{p1}）；发布时自动挑该平台收得下的那一份。', {
                    p0: requiredAspects.length,
                    p1: requiredAspects.join(' / '),
                  }) }}
                </small>
              </div>

              <!-- #23 配音与配乐：独立一行，不跟成片比例挤在一起 -->
              <div class="ps-block ps-audio-row">
                <label class="ps-switch" :class="{ on: adsVideoVoiceover }">
                  <span class="ps-switch-icon"><i class="ri-mic-line"></i></span>
                  <span class="ps-switch-text">
                    <strong>{{ $t('生成 AI 旁白与字幕') }}</strong>
                    <small>{{ $t('用默认 TTS 配音，并把同一时间轴的字幕烧进画面') }}</small>
                  </span>
                  <input v-model="adsVideoVoiceover" type="checkbox" />
                  <span class="ps-switch-track" aria-hidden="true"><span class="ps-switch-thumb"></span></span>
                </label>
                <label class="ps-field">
                  <span>{{ $t('配乐情绪') }}</span>
                  <select v-model="adsVideoBgmMood">
                    <option v-for="mood in ADS_BGM_MOODS" :key="mood.id" :value="mood.id">{{ $t(mood.label) }}</option>
                  </select>
                </label>
                <!--
                  素材兜底策略（P3-6）。以前素材不够时链路**自己决定**怎么办 ——
                  用户既不知道会发生什么，也无从选择。这几条的差别是要不要花钱、要不要等，
                  必须显式选；**默认那条不花钱**（点「生成」不等于同意为补素材额外付费）。
                -->
                <label class="ps-field">
                  <span>{{ $t('素材不足时') }}</span>
                  <select v-model="adsMaterialFallback">
                    <option v-for="opt in MATERIAL_FALLBACK_OPTIONS" :key="opt.id" :value="opt.id">
                      {{ $t(opt.label) }}{{ opt.costs ? $t('（花钱）') : '' }}
                    </option>
                  </select>
                  <small class="ps-field-hint">{{ $t(currentFallbackHint) }}</small>
                </label>
              </div>
            </div>
          </div>
        </article>

        <!-- 第 2 步：勾选并连接平台（用户实际操作过才算完成，默认全选不白送对号） -->
        <article class="guide-step" :class="{ done: guideStep2Done }">
          <header>
            <span class="step-no"><i v-if="guideStep2Done" class="ri-check-line"></i><template v-else>2</template></span>
            <div>
              <strong>{{ $t('第 2 步 · 选择并连接投放平台') }}</strong>
              <small>{{ $t('勾选本次要投放的平台；Web 登录在工作流里完成，Google 系会弹外部 Chrome。详细配置在「平台连接」Tab。') }}</small>
            </div>
            <em class="step-state" :class="guideStep2Done ? 'ok' : 'todo'">
              {{ guideStep2Done ? $t('已选 {p0} 个平台', { p0: includedPlatformDefs.length }) : $t('待确认') }}
            </em>
          </header>
          <div class="step-body">
            <div class="guide-platform-strip">
              <label
                v-for="platform in PLATFORM_DEFS"
                :key="`guide-${platform.id}`"
                class="guide-platform-chip"
                :class="{ off: excludedRunPlatforms.has(platform.id) }"
                :style="{ '--platform-color': platform.color }"
              >
                <input
                  type="checkbox"
                  :checked="!excludedRunPlatforms.has(platform.id)"
                  @change="toggleRunPlatform(platform.id)"
                />
                <i :class="platform.icon"></i>
                <span>{{ $t(platform.label) }}</span>
                <em v-if="requiresExternalBrowser(platform.id)" :title="$t('受 Google 登录限制，该平台无法在内置浏览器登录，会自动弹出外部系统浏览器（Chrome）完成登录。')">
                  <i class="ri-external-link-line"></i>
                </em>
              </label>
              <button class="mini-button" type="button" @click="activeTab = 'connect'">
                <i class="ri-settings-3-line"></i>{{ $t('平台详细配置') }}
              </button>
            </div>
            <div class="guide-id-note">
              <span><i class="ri-key-2-line"></i>{{ $t('真实发布需要各平台账号 ID（{p0}），点击补填：', { p0: platformIdHints }) }}</span>
              <button
                v-for="platform in includedPlatformDefs"
                :key="`id-${platform.id}`"
                class="mini-button"
                type="button"
                @click="openCredentialDialog(platform.id)"
              >
                <i :class="platform.icon"></i>{{ $t(platform.label) }}
              </button>
            </div>
          </div>
        </article>

        <!-- 第 3 步：素材与广告视频 -->
        <article class="guide-step" :class="{ done: guideStep3Done }">
          <header>
            <span class="step-no"><i v-if="guideStep3Done" class="ri-check-line"></i><template v-else>3</template></span>
            <div>
              <strong>{{ $t('第 3 步 · 准备素材或广告视频') }}</strong>
              <small>{{ adsVideoMode === 'slideshow'
                ? $t('上传客户素材（图片/视频）——第 1 步选的是「图片成片」，会把这些图片按分镜拼成成片；也可在右侧历史列表直接选一条已生成的。')
                : $t('上传客户素材作为参考图——第 1 步选的是「动态视频生成」，视频模型会据此生成运镜镜头；也可在右侧历史列表直接选一条已生成的。') }}</small>
            </div>
            <em class="step-state" :class="guideStep3Done ? 'ok' : 'todo'">
              {{ selectedPublishVideoPath ? $t('已选历史成片')
                : creativeAsset ? $t('素材已就绪')
                  : adsPromptReady ? $t('提示词已就绪')
                    : $t('待完成') }}
            </em>
          </header>
          <div class="step-body">
            <input
              ref="creativeInput"
              class="file-input"
              type="file"
              multiple
              accept="image/png,image/jpeg,image/webp,image/gif,video/mp4,video/quicktime,video/webm"
              @change="onCreativeInput"
            />
            <input
              ref="creativeFolderInput"
              class="file-input"
              type="file"
              multiple
              webkitdirectory
              directory
              accept="image/png,image/jpeg,image/webp,image/gif,video/mp4,video/quicktime,video/webm"
              @change="onCreativeInput"
            />
            <div class="creative-source-actions">
              <button class="creative-source-button" type="button" @click="creativeInput?.click()">
                <i class="ri-file-add-line"></i>
                <span><strong>{{ $t('多选素材文件') }}</strong><small>{{ $t('一次选择多张图片和多个视频') }}</small></span>
              </button>
              <button class="creative-source-button" type="button" :disabled="creativeFolderScanning" @click="pickCreativeFolderNative">
                <i :class="creativeFolderScanning ? 'ri-loader-4-line spin' : 'ri-folder-upload-line'"></i>
                <span>
                  <strong>{{ $t('选择素材文件夹') }}</strong>
                  <small>{{ creativeFolderScanning ? $t('正在扫描素材…') : $t('递归读取文件夹中的全部支持素材') }}</small>
                </span>
              </button>
              <!-- 只有「动态视频生成」需要提示词：图片成片是确定性拼接，没有分镜可写 -->
              <button
                v-if="adsVideoMode === 'dynamic'"
                class="creative-source-button generate"
                :class="{ chosen: adsPromptReady }"
                type="button"
                :disabled="adsPromptGenerating"
                @click="openAdsVideoDialog"
              >
                <i :class="adsPromptGenerating ? 'ri-loader-4-line spin' : 'ri-quill-pen-line'"></i>
                <i v-if="adsPromptReady && !adsPromptGenerating" class="ri-checkbox-circle-fill chosen-mark"></i>
                <span>
                  <strong>{{ $t('生成广告视频提示词') }}</strong>
                  <small>{{ adsPromptScenes.length
                    ? $t('已生成 {p0} 个分镜提示词，点击查看或重写', { p0: adsPromptScenes.length })
                    : videoModelLabel
                      ? $t('先写分镜与运镜提示，第 5 步按它调用 {p0} 出片', { p0: videoModelLabel })
                      : $t('先写分镜与运镜提示；需在第 1 步配置视频生成模型') }}</small>
                </span>
              </button>
            </div>

            <!-- 保存后的分镜提示词就地展示、就地可改：第 5 步按这份出片，
                 藏在弹层里用户看不到自己到底在用什么提示词（实测反馈） -->
            <section v-if="adsVideoMode === 'dynamic' && adsPromptChosen && adsPromptScenes.length" class="prompt-inline">
              <header>
                <span><i class="ri-film-line"></i>{{ $t('分镜提示词') }}</span>
                <small>{{ $t('第 5 步按这份提示词调用视频模型出片；可直接修改，改完自动保存。') }}</small>
                <button class="mini-button" type="button" @click="openAdsVideoDialog">
                  <i class="ri-edit-line"></i>{{ $t('重新生成') }}
                </button>
              </header>
              <label class="prompt-brief">
                <span>{{ $t('投放要求 / 创意简报') }}</span>
                <textarea v-model.trim="adsVideoBrief" rows="3"></textarea>
              </label>
              <ol class="prompt-scenes">
                <li v-for="(scene, index) in adsPromptScenes" :key="`inline-${scene.id}`">
                  <header>
                    <strong>{{ $t('镜头 {p0}', { p0: index + 1 }) }}</strong>
                    <small :title="scene.referenceImage">{{ (scene.referenceImage || '').split(/[\\/]/).pop() }}</small>
                    <em>
                      <input v-model.number="scene.duration" type="number" min="2" max="10" @change="persistAdsPromptScenes" />{{ $t('秒') }}
                    </em>
                  </header>
                  <label>
                    <span>{{ $t('运镜提示（英文，交给视频模型）') }}</span>
                    <textarea v-model.trim="scene.prompt" rows="2" @change="persistAdsPromptScenes"></textarea>
                  </label>
                  <label>
                    <span>{{ $t('字幕 / 旁白文案') }}</span>
                    <input v-model.trim="scene.caption" type="text" @change="persistAdsPromptScenes" />
                  </label>
                </li>
              </ol>
            </section>

            <button
              class="creative-dropzone"
              :class="{ filled: creativeAssets.length, dragging: creativeDragging }"
              type="button"
              @click="creativeInput?.click()"
              @dragenter.prevent="creativeDragging = true"
              @dragover.prevent="creativeDragging = true"
              @dragleave.prevent="creativeDragging = false"
              @drop.prevent="onCreativeDrop"
            >
              <template v-if="creativeAsset">
                <span class="creative-preview">
                  <!-- 只有真有预览图才渲染 <img>：走原生目录选择器时素材没有 blob 预览，
                       `src=""` 会被浏览器画成裂图占位符（实测就是这个现象） -->
                  <img
                    v-if="creativeAsset.kind === 'image' && creativeAsset.previewUrl"
                    :src="creativeAsset.previewUrl"
                    alt=""
                  />
                  <i v-else-if="creativeAsset.kind === 'image'" class="ri-image-line"></i>
                  <i v-else class="ri-video-line"></i>
                </span>
                <span class="creative-meta">
                  <strong>{{ $t('{count} 个客户素材已就绪', { count: creativeAssets.length }) }}</strong>
                  <small>{{ creativeTypeLabel }} · {{ formatFileSize(creativeTotalSize) }}</small>
                  <em><i class="ri-add-circle-line"></i>{{ $t('点击重新多选，或拖入一整批素材') }}</em>
                </span>
                <i class="ri-checkbox-circle-fill uploaded-check"></i>
              </template>
              <template v-else>
                <span class="upload-icon"><i class="ri-upload-cloud-2-line"></i></span>
                <span class="creative-meta">
                  <strong>{{ $t('拖入多张图片和多个视频，或在上方选择整个文件夹') }}</strong>
                  <small>{{ $t('点击也可多选文件 · 不限制素材文件大小') }}</small>
                  <em>{{ $t('支持 JPG、PNG、WebP、GIF、MP4、MOV、WebM') }}</em>
                </span>
              </template>
            </button>
            <div v-if="creativeAssets.length" class="creative-file-list" :aria-label="$t('已选择素材')">
              <span v-for="asset in creativeAssets.slice(0, creativeListLimit)" :key="`${asset.relativePath}-${asset.name}`">
                <i :class="asset.kind === 'video' ? 'ri-video-line' : 'ri-image-line'"></i>
                <span>
                  <strong>{{ asset.name }}</strong>
                  <small>{{ asset.relativePath || formatFileSize(asset.size) }}</small>
                </span>
                <!-- 一次扫进来几百个素材，用不上的要能单条剔除 -->
                <button
                  class="creative-remove"
                  type="button"
                  :title="$t('移除这个素材')"
                  @click.stop="removeCreativeAsset(asset)"
                >
                  <i class="ri-close-line"></i>
                </button>
              </span>
              <button
                v-if="creativeAssets.length > creativeListLimit"
                class="creative-more"
                type="button"
                @click="creativeListLimit += 40"
              >
                +{{ creativeAssets.length - creativeListLimit }} {{ $t('个素材，点击展开') }}
              </button>
            </div>
            <p v-if="creativeError" class="creative-error"><i class="ri-error-warning-line"></i>{{ creativeError }}</p>
          </div>
        </article>

        <!-- 第 4 步：投放信息（用户实际编辑过才算完成，预填默认值不白送对号） -->
        <article class="guide-step" :class="{ done: guideStep4Done }">
          <header>
            <span class="step-no"><i v-if="guideStep4Done" class="ri-check-line"></i><template v-else>4</template></span>
            <div>
              <strong>{{ $t('第 4 步 · 填写投放信息') }}</strong>
              <small>{{ $t('品牌、阿语标题、客户标识与各平台话题；勾选了几个平台就展示几个话题输入框。') }}</small>
            </div>
            <em class="step-state" :class="guideStep4Done ? 'ok' : 'todo'">
              {{ guideStep4Done ? $t('已完成') : $t('待确认') }}
            </em>
          </header>
          <div class="step-body">
            <div class="creative-fields">
              <label>
                <span>{{ $t('品牌 / 产品名称') }}</span>
                <input v-model.trim="creativeBrief.brandName" v-kb-fill="'brand'" type="text" :placeholder="$t('例如：UAE Market Entry')" />
              </label>
              <label>
                <span>{{ $t('阿语广告标题') }}</span>
                <input v-model.trim="creativeBrief.arabicHeadline" dir="rtl" type="text" placeholder="اكتشف علامتنا في الإمارات" />
              </label>
              <label class="span-wide">
                <span>{{ $t('客户标识（账户隔离与审计）') }}</span>
                <input v-model.trim="campaign.tenantId" type="text" :placeholder="$t('例如：tenant-uae-demo')" />
              </label>
            </div>
            <div class="platform-topics" :aria-label="$t('各平台话题')">
              <div class="platform-topics-head">
                <span>{{ $t('各平台话题') }}</span>
                <small>{{ $t('勾选了哪些「本次投放」平台就展示哪些；发布时写入对应平台的内容与广告系列。') }}</small>
              </div>
              <label v-for="platform in includedPlatformDefs" :key="`topic-${platform.id}`">
                <span :style="{ color: platform.color }"><i :class="platform.icon"></i>{{ $t(platform.label) }}</span>
                <input
                  v-model.trim="platformTopics[platform.id]"
                  type="text"
                  :placeholder="$t('例如：#UAE #Dubai #迪拜')"
                />
              </label>
              <p v-if="!includedPlatformDefs.length" class="platform-topics-empty">
                {{ $t('当前没有勾选任何「本次投放」平台；先在平台连接 Tab 勾选后再填写话题。') }}
              </p>
            </div>
          </div>
        </article>

        <!-- 第 5 步：一键执行 -->
        <article class="guide-step run-step" :class="{ ready: canStartAdsScenario('campaign-launch') }">
          <header>
            <span class="step-no"><i class="ri-rocket-2-line"></i></span>
            <div>
              <strong>{{ $t('第 5 步 · 一键执行投放') }}</strong>
              <small>{{ $t('前 4 步就绪后点击执行：按第 1 步的设置重新生成成片 → 逐平台打开编辑器 → 注入成片 → 填写文案 → 提交发布。想用现成成片再投一次，请点右侧历史列表里那条的「一键发布」。') }}</small>
            </div>
          </header>
          <div class="step-body run-body">
            <button
              class="button primary run-button"
              type="button"
              :disabled="!canStartAdsScenario('campaign-launch') || !!adsPublishBusyId || adsGenActive"
              @click="startInlineAdsPublish"
            >
              <i :class="(adsPublishBusyId || adsGenActive) ? 'ri-loader-4-line spin' : 'ri-rocket-2-line'"></i>
              {{ adsGenActive ? $t('正在生成成片…')
                : adsPublishBusyId ? $t('正在执行投放…')
                  : adsPublishRuns.length ? $t('执行新一轮投放任务')
                    : $t('一键执行投放任务') }}
            </button>
            <!-- 生成阶段：动态视频生成模式下第 5 步先真调模型出片，进度与预览都在这里 -->
            <!-- 失败后也要留着：只认 active/preview 的话，一出错整块就消失，
                 用户看不到哪一步挂了、也无从判断要不要重试（实测反馈） -->
            <div v-if="adsGenActive || adsGenPreviewPath || adsGenNodes.length" class="run-live" :class="{ active: adsGenActive }">
              <div class="run-live-head">
                <!-- 取消是中性终态：不用告警图标、不说「失败」（用户自己叫停的，不是出错） -->
                <i :class="adsGenActive ? 'ri-loader-4-line spin'
                  : adsGenNodes.some((n) => n.state === 'failed') ? 'ri-error-warning-line'
                    : adsGenNodes.some((n) => n.state === 'cancelled') ? 'ri-stop-circle-line'
                      : 'ri-checkbox-circle-line'"></i>
                <strong>{{ adsGenActive ? $t('正在生成广告成片')
                  : adsGenNodes.some((n) => n.state === 'failed') ? $t('成片生成失败')
                    : adsGenNodes.some((n) => n.state === 'cancelled') ? $t('已取消本次成片')
                      : $t('成片已生成') }}</strong>
                <em>
                  <template v-if="adsGenBatch">{{ $t('画幅 {p0}/{p1}', { p0: adsGenBatch.done + 1, p1: adsGenBatch.total }) }} · </template>
                  {{ adsGenProgress.done }} / {{ adsGenProgress.total }}
                </em>
                <!-- 主进程一直有取消通道（preload 的 cancelSlideshow），界面上却没有入口：
                     跑起来之后用户只能干等或杀应用。成片是分钟级的重活，必须给得起后悔药。 -->
                <button
                  v-if="adsGenActive"
                  class="mini-button run-retry"
                  type="button"
                  :disabled="adsGenCancelling"
                  @click="cancelAdsGeneration()"
                >
                  <i class="ri-stop-circle-line"></i>{{ adsGenCancelling ? $t('正在停止…') : $t('取消生成') }}
                </button>
              </div>
              <div class="publish-progress-bar">
                <span :style="{ width: `${adsGenProgress.percent}%` }"></span>
              </div>
              <ol class="run-live-nodes">
                <li v-for="node in adsGenNodes" :key="node.id" :class="node.state">
                  <i :class="node.state === 'running' ? 'ri-loader-4-line spin'
                    : node.state === 'done' ? 'ri-check-line'
                      : node.state === 'failed' ? 'ri-close-line'
                        : node.state === 'cancelled' ? 'ri-stop-circle-line' : 'ri-time-line'"></i>
                  <strong>{{ $t(node.name) }}</strong>
                  <span class="node-eta">{{ genNodeEtaLabel(node) }}</span>
                </li>
              </ol>
              <!-- 失败原因进下面的告警卡（带重新生成）；其它阶段性消息仍在这里 -->
              <p v-if="adsGenMessage && adsGenAlert?.state !== 'failed'" class="run-gen-msg">{{ adsGenMessage }}</p>
              <!--
                三种必须有人处理的终态：失败 / 可能已超时 / 上次运行已中断。
                失败即终止：spinner 已由 failAdsGenRunningNodes 收掉；这里给原因与「重新生成」。
                超时由看门狗判（跑过 max(预计×3, 预计+5min) 或很久没进度），可「继续等待」或「重新生成」
                （重新生成会先取消还在跑的旧任务，不堆僵尸进程）。
              -->
              <StepRunAlert
                v-if="adsGenAlert"
                :state="adsGenAlert.state"
                :message="adsGenAlert.message"
                :elapsed-sec="adsGenWatchdog.elapsedSec.value"
                :estimate-sec="adsGenRunningNode?.etaSec || null"
                :since-heartbeat-sec="adsGenWatchdog.sinceHeartbeatSec.value"
                :retry-label="$t('重新生成并执行投放')"
                :busy="adsGenRestarting"
                @retry="regenerateAdsVideo()"
                @keep-waiting="adsGenWatchdog.keepWaiting()"
              />
              <button
                v-if="adsGenPreviewPath"
                class="mini-button primary"
                type="button"
                @click="previewAdsVideo({ id: 'gen', projectName: creativeBrief.brandName, path: adsGenPreviewPath, createdAt: Date.now() })"
              >
                <i class="ri-play-circle-line"></i>{{ $t('预览成片') }}
              </button>
            </div>

            <!-- 执行中就地展开多节点状态：用户点完立刻看到"程序在跑"，不必去右侧找 -->
            <div v-if="adsPublishRuns.length" class="run-live" :class="{ active: !!adsPublishBusyId }">
              <div class="run-live-head">
                <i :class="adsPublishBusyId ? 'ri-loader-4-line spin'
                  : adsRunInterrupted ? 'ri-error-warning-line' : 'ri-checkbox-circle-line'"></i>
                <strong>{{ adsPublishBusyId ? $t('投放执行中')
                  : adsRunInterrupted ? $t('上次执行被中断') : $t('本次投放已结束') }}</strong>
                <em>
                  <template v-if="adsRunStartedAt && !adsPublishBusyId">{{ formatAdsVideoTime(adsRunStartedAt) }} · </template>
                  {{ adsPublishProgress.platformsDone }} / {{ adsPublishProgress.platforms }}
                </em>
                <!-- 中断/失败可重试：只重跑没成功的那几条，已发出去的不动（重发会在平台侧堆重复内容） -->
                <button
                  v-if="adsFailedRunCount && !adsPublishBusyId && !adsGenActive"
                  class="mini-button primary run-retry"
                  type="button"
                  @click="retryFailedPublishRuns()"
                >
                  <i class="ri-refresh-line"></i>{{ $t('重试未完成的 {p0} 个平台', { p0: adsFailedRunCount }) }}
                </button>
              </div>
              <div class="publish-progress-bar">
                <span :style="{ width: `${adsPublishProgress.percent}%` }"></span>
              </div>
              <ol class="run-live-nodes">
                <li v-for="run in adsPublishRuns" :key="`live-${run.platformId}`" :class="run.state">
                  <i :class="run.state === 'running' ? 'ri-loader-4-line spin'
                    : run.state === 'done' ? 'ri-check-line'
                      : run.state === 'failed' ? 'ri-close-line' : 'ri-time-line'"></i>
                  <strong>{{ run.platform }}</strong>
                  <span>{{ currentRunStepLabel(run) }}</span>
                  <button
                    v-if="run.state === 'failed' && !adsPublishBusyId && !adsGenActive"
                    class="mini-button run-retry-one"
                    type="button"
                    :title="$t('只重跑这个平台')"
                    @click="retryFailedPublishRuns(run.platformId)"
                  >
                    <i class="ri-refresh-line"></i>{{ $t('重试') }}
                  </button>
                </li>
              </ol>
            </div>
            <p v-if="!canStartAdsScenario('campaign-launch') && !adsPublishBusyId && !adsGenActive" class="run-blocked">
              <i class="ri-information-line"></i>{{ adsScenarioBlockedReason('campaign-launch') }}
            </p>
            <!-- 开跑前的预检没过（例如素材目录里一张图都没有）：原地说清，不去起任务 -->
            <p v-else-if="adsPreflightError" class="run-blocked">
              <i class="ri-error-warning-line"></i>{{ adsPreflightError }}
            </p>
            <!-- 「全部就绪」只在真的空闲且上一轮没有失败/超时时显示；和失败态同屏是自相矛盾（实测截图） -->
            <p v-else-if="!adsPublishRuns.length && !adsGenActive && !adsGenAlert" class="run-ok"><i class="ri-checkbox-circle-line"></i>{{ $t('全部就绪，可一键执行。') }}</p>
          </div>
        </article>
      </div>

      <!-- 右侧：历史生成视频 + 发布回执 -->
      <aside class="guide-side">
        <div class="side-head">
          <strong>{{ $t('历史生成视频') }}</strong>
          <button class="mini-button" :disabled="adsVideoHistoryChecking" @click="refreshAdsVideoHistory">
            <i :class="adsVideoHistoryChecking ? 'ri-loader-4-line spin' : 'ri-refresh-line'"></i>
          </button>
        </div>
        <p class="side-note">{{ $t('生成过的广告视频都在这里：可预览、选为发布视频，或直接一键发布测试发布链路。') }}</p>
        <label class="ps-toggle auto-publish-toggle">
          <input v-model="adsAutoPublish" type="checkbox" />
          <span>
            <strong>{{ $t('自动完成发布') }}</strong>
            <small>{{ adsAutoPublish
              ? $t('注入成片后自动填文案并点击「发布」，全程无需人工')
              : $t('只准备成片与文案，最终「发布」由你手动点击') }}</small>
          </span>
        </label>
        <div v-if="!adsVideoHistory.length" class="section-state">
          {{ $t('还没有生成过广告视频。点击右上角「生成广告视频」开始第一条。') }}
        </div>
        <div v-else class="ads-video-history">
          <article
            v-for="record in adsVideoPageItems"
            :key="record.id"
            class="ads-video-item"
            :class="{ selected: selectedPublishVideoPath === record.path }"
          >
            <span class="ads-video-icon">
              <i :class="adsVideoVerified[record.path] ? 'ri-movie-2-line' : 'ri-time-line'"></i>
            </span>
            <div class="ads-video-meta">
              <strong>
                {{ adsVideoDisplayName(record) }}
                <!-- 画幅徽标从**文件名**解析，不依赖 projectName 怎么拼 ——
                     名字是生成时拼好存进 localStorage 的，历史数据/改过命名规则时就没有画幅了 -->
                <span v-if="aspectOfPath(record.path)" class="ads-video-aspect">{{ aspectOfPath(record.path) }}</span>
              </strong>
              <small>{{ formatAdsVideoTime(record.createdAt) }} · {{ record.path }}</small>
              <em :class="adsVideoVerified[record.path] ? 'ok' : 'pending'">
                {{ adsVideoVerified[record.path] ? $t('已生成，可用于发布') : $t('生成中 / 文件尚未出现') }}
              </em>
              <!-- 画幅是硬约束：先摆出这批成片能覆盖哪些平台，免得点了才发现平台被摘 -->
              <small v-if="adsVideoVerified[record.path]" class="ads-video-fit">
                <span class="fit-ok">{{ $t('{p0}：{p1}', { p0: $t('可发布'), p1: recordCoverage(record).ok.join(' / ') || $t('无') }) }}</span>
                <span v-if="recordCoverage(record).miss.length" class="fit-miss">
                  {{ $t('{p0}：{p1}', { p0: $t('画幅不符'), p1: recordCoverage(record).miss.join(' / ') }) }}
                </span>
              </small>
            </div>
            <div class="ads-video-actions">
              <button
                class="mini-button primary"
                :disabled="!adsVideoVerified[record.path] || !!adsPublishBusyId"
                :title="$t('对勾选的「本次投放」平台直接执行真实视频发布（测试发布链路）')"
                @click="publishHistoryVideo(record)"
              >
                <i :class="adsPublishBusyId === record.id ? 'ri-loader-4-line spin' : 'ri-send-plane-line'"></i>
                {{ $t('一键发布') }}
              </button>
              <button class="mini-button" :disabled="!adsVideoVerified[record.path]" @click="previewAdsVideo(record)">
                <i class="ri-play-circle-line"></i>{{ $t('预览') }}
              </button>
              <button
                class="mini-button"
                :class="{ primary: selectedPublishVideoPath !== record.path }"
                :disabled="!adsVideoVerified[record.path]"
                @click="chooseAdsPublishVideo(record)"
              >
                <i :class="selectedPublishVideoPath === record.path ? 'ri-checkbox-circle-fill' : 'ri-checkbox-blank-circle-line'"></i>
                {{ selectedPublishVideoPath === record.path ? $t('已选为发布视频') : $t('选为发布视频') }}
              </button>
              <button class="mini-button warn" @click="removeAdsVideoRecord(record.id)">
                <i class="ri-delete-bin-line"></i>{{ $t('移除') }}
              </button>
            </div>
          </article>
          <!-- #32 分页：第 1 页恒为最新（按生成时间倒序）。
               只有一页时也保留这一行显示总条数 —— 否则条数减少后整块凭空消失，看着像功能没了。 -->
          <div class="ads-video-pager">
            <button
              v-if="adsVideoPageCount > 1"
              class="mini-button"
              :disabled="adsVideoPage <= 1"
              @click="adsVideoPage -= 1"
            >
              <i class="ri-arrow-left-s-line"></i>{{ $t('上一页') }}
            </button>
            <span>
              {{ $t('共 {p0} 条', { p0: adsVideoHistory.length }) }}
              <template v-if="adsVideoPageCount > 1"> · {{ adsVideoPage }} / {{ adsVideoPageCount }}</template>
            </span>
            <button
              v-if="adsVideoPageCount > 1"
              class="mini-button"
              :disabled="adsVideoPage >= adsVideoPageCount"
              @click="adsVideoPage += 1"
            >
              {{ $t('下一页') }}<i class="ri-arrow-right-s-line"></i>
            </button>
          </div>
        </div>

        <!-- #28 发布运行状态：和工作流「实时执行记录」同一套读法 —— 总进度条 + 每平台逐步点亮 -->
        <div v-if="adsPublishRuns.length" class="publish-runs" :aria-label="$t('发布运行状态')">
          <div class="publish-runs-head">
            <strong>{{ $t('发布运行状态') }}</strong>
            <em>{{ adsPublishProgress.platformsDone }}/{{ adsPublishProgress.platforms }}</em>
          </div>
          <div class="publish-progress-bar">
            <span :style="{ width: `${adsPublishProgress.percent}%` }"></span>
          </div>
          <article v-for="run in adsPublishRuns" :key="run.platformId" class="publish-run" :class="run.state">
            <header>
              <i :class="run.icon" :style="{ color: run.color }"></i>
              <strong>{{ run.platform }}</strong>
              <span class="run-aspect">{{ run.aspect }}</span>
              <em class="status-pill" :class="run.state === 'running' ? 'warning' : run.state === 'done' ? 'ready' : run.state === 'failed' ? 'error' : ''">
                {{ run.status || $t('待执行') }}
              </em>
            </header>
            <small class="run-file" :title="run.file">{{ run.file }}</small>
            <ol class="run-steps">
              <li v-for="step in run.steps" :key="step.key" :class="step.state">
                <i
                  :class="step.state === 'done' ? 'ri-check-line'
                    : step.state === 'running' ? 'ri-loader-4-line spin'
                      : step.state === 'failed' ? 'ri-close-line'
                        : step.state === 'skipped' ? 'ri-subtract-line' : 'ri-circle-line'"
                ></i>
                <span>{{ $t(step.label) }}</span>
              </li>
            </ol>
            <p v-if="run.detail" class="run-detail">{{ run.detail }}</p>
          </article>
        </div>
      </aside>
    </section>

    <section v-if="activeTab === 'connect'" class="growth-entry-grid solo">

      <article v-if="activeTab === 'connect'" class="platform-entry-card">
        <div class="entry-heading">
          <span class="section-kicker">{{ $t('Channel Access') }}</span>
          <h2>{{ $t('主流投放平台') }}</h2>
          <p>{{ $t('每个平台只能选择一种接入方式：API 使用 Token，Web 登录由客户本人在右侧浏览器完成账号、密码与 MFA。') }}</p>
        </div>
        <div class="platform-login-grid">
          <article
            v-for="platform in PLATFORM_DEFS"
            :key="`login-${platform.id}`"
            class="platform-access-tile"
            :style="{ '--platform-color': platform.color }"
          >
            <div class="access-tile-heading">
              <span class="platform-logo"><i :class="platform.icon"></i></span>
              <span>
                <strong>{{ $t(platform.label) }}</strong>
                <small>{{ platform.caption }}</small>
              </span>
              <label class="access-tile-include" :title="$t('取消勾选后，本次发布不会打开该平台，也不会等待它登录')">
                <input
                  type="checkbox"
                  :checked="!excludedRunPlatforms.has(platform.id)"
                  @change="toggleRunPlatform(platform.id)"
                />
                <span>{{ $t('本次投放') }}</span>
              </label>
            </div>
            <div class="access-mode-switch" role="radiogroup" :aria-label="$t('{platform} 接入方式', { platform: platform.label })">
              <button
                type="button"
                role="radio"
                :aria-checked="platformModes[platform.id] === 'api'"
                :class="{ active: platformModes[platform.id] === 'api' }"
                @click="choosePlatformMode(platform.id, 'api')"
              >
                <i class="ri-key-2-line"></i>API
              </button>
              <button
                type="button"
                role="radio"
                :aria-checked="platformModes[platform.id] === 'web'"
                :class="{ active: platformModes[platform.id] === 'web' }"
                @click="choosePlatformMode(platform.id, 'web')"
              >
                <i class="ri-window-line"></i>Web
              </button>
            </div>
            <p v-if="requiresExternalBrowser(platform.id)" class="access-google-note">
              <i class="ri-external-link-line"></i>{{ $t('受 Google 登录限制，该平台无法在内置浏览器登录，会自动弹出外部系统浏览器（Chrome）完成登录。') }}
            </p>
            <button
              class="access-connect-button"
              type="button"
              :disabled="quickLoginBusy === platform.id"
              @click="connectPlatform(platform.id)"
            >
              <i :class="quickLoginBusy === platform.id ? 'ri-loader-4-line spin' : platformModes[platform.id] === 'api' ? 'ri-settings-3-line' : 'ri-arrow-right-up-line'"></i>
              {{ platformModes[platform.id] === 'api' ? $t('配置 API 凭据') : $t('打开 Web 登录') }}
            </button>
          </article>
        </div>
        <p v-if="quickLoginNote" class="quick-login-note">
          <i class="ri-window-line"></i>{{ quickLoginNote }}
        </p>
      </article>
    </section>


    <section v-if="activeTab === 'campaign' && creativeAssets.length" class="generated-ad-preview">
      <div class="ad-preview-copy">
        <span class="section-kicker">{{ $t('Agent Creative Preview') }}</span>
        <h2>{{ $t('广告成品预览') }}</h2>
        <p>{{ $t('Agent 根据客户上传素材、品牌信息与阿语 RTL 标题实时合成。这里展示的是即将交给发布工作流的广告成品，不是素材原图。') }}</p>
        <div class="ad-preview-platforms" role="tablist" :aria-label="$t('选择预览平台')">
          <button
            v-for="platform in PLATFORM_DEFS"
            :key="`preview-${platform.id}`"
            type="button"
            role="tab"
            :aria-selected="previewPlatform === platform.id"
            :class="{ active: previewPlatform === platform.id }"
            :style="{ '--platform-color': platform.color }"
            @click="previewPlatform = platform.id"
          >
            <i :class="platform.icon"></i>{{ $t(platform.label) }}
          </button>
        </div>
        <ul>
          <li><i class="ri-checkbox-circle-fill"></i>{{ $t('已应用 UAE 地区与阿拉伯语 RTL 版式') }}</li>
          <li><i class="ri-checkbox-circle-fill"></i>{{ $t('已生成平台 CTA、品牌署名与投放安全区') }}</li>
          <li><i class="ri-checkbox-circle-fill"></i>{{ $t('发布前会在工作流人工确认节点再次展示') }}</li>
        </ul>
      </div>
      <article class="ad-preview-device" :style="{ '--platform-color': previewPlatformDef.color }">
        <header>
          <span class="ad-preview-avatar">{{ creativeBrief.brandName.slice(0, 1).toUpperCase() || 'U' }}</span>
          <div>
            <strong>{{ creativeBrief.brandName || $t('客户品牌') }}</strong>
            <small>{{ $t(previewPlatformDef.label) }} · {{ $t('赞助内容') }}</small>
          </div>
          <i class="ri-more-fill"></i>
        </header>
        <div class="ad-preview-visual">
          <img
            v-if="campaignPreviewAsset?.kind === 'image' && campaignPreviewAsset.previewUrl"
            :src="campaignPreviewAsset.previewUrl"
            :alt="$t('客户素材生成的广告预览')"
          />
          <div v-else class="ad-preview-video">
            <i class="ri-video-line"></i>
            <span>{{ campaignPreviewAsset?.name }}</span>
          </div>
          <span class="ad-preview-market">UAE · AR / EN</span>
        </div>
        <div class="ad-preview-body" dir="rtl">
          <span>{{ creativeBrief.brandName || $t('客户品牌') }}</span>
          <h3>{{ creativeBrief.arabicHeadline || 'اكتشف علامتنا في الإمارات' }}</h3>
          <p>{{ $t('اكتشف تجربة مصممة خصيصاً لعملائنا في دولة الإمارات.') }}</p>
        </div>
        <footer>
          <span>
            <small>{{ $t('الوجهة') }}</small>
            <strong>{{ $t('اكتشف المزيد') }}</strong>
          </span>
          <button type="button" @click="notif.info(i18nT('广告落地页地址待确认，当前仅预览广告素材。'))">{{ $t('了解更多') }}</button>
        </footer>
      </article>
    </section>

    <AutomationOpsConsole
      v-if="activeTab === 'scenarios'"
      domain="global-ads"
      :execute="executeAdsAutomation"
      :can-start="canStartAdsScenario"
      :start-blocked-reason="adsScenarioBlockedReason"
      :before-start="beforeAdsScenarioStart"
      :hidden-scenarios="hiddenAdsScenarios"
    />

    <section
      v-if="activeTab === 'connect'"
      class="region-gate"
      :class="{
        blocked: statusLoaded && !regionAllowed,
        allowed: statusLoaded && regionAllowed,
        unavailable: statusError,
      }"
    >
      <span class="gate-icon">
        <i v-if="statusLoading" class="ri-loader-4-line spin"></i>
        <i v-else-if="statusError" class="ri-cloud-off-line"></i>
        <i v-else-if="regionAllowed" class="ri-shield-check-line"></i>
        <i v-else class="ri-forbid-2-line"></i>
      </span>
      <div>
        <strong v-if="statusLoading">{{ $t('正在核验区域与投放护栏') }}</strong>
        <strong v-else-if="statusError">{{ $t('区域状态不可用，写操作保持关闭') }}</strong>
        <strong v-else-if="regionAllowed">{{ $t('当前区域允许广告写操作') }}</strong>
        <strong v-else>{{ $t('当前区域禁止广告写操作') }}</strong>
        <p v-if="statusError">{{ statusError }}</p>
        <p v-else-if="!regionAllowed">
          {{ $t(String(statusData?.regionBlockReason || statusData?.region_block_reason || '请由管理员核对运行区域与 global_ads 配置。')) }}
        </p>
        <p v-else>
          {{ $t("{p0}：{p1}\n          · {p2}：{p3}\n          · {p4}：{p5}\n          · {p6}", { p0: $t('区域'), p1: statusData?.region || '—', p2: $t('币种'), p3: statusData?.currency || '—', p4: $t('时区'), p5: statusData?.timezone || '—', p6: $t('写操作始终受预算护栏与人工确认保护。') }) }}
        </p>
      </div>
      <span v-if="statusLoaded" class="gate-state">
        {{ regionAllowed ? $t('可投放') : $t('只读') }}
      </span>
    </section>

    <section v-if="activeTab === 'connect'" class="truth-grid" :aria-label="$t('能力边界')">
      <article>
        <i class="ri-close-circle-line"></i>
        <div>
          <strong>{{ $t('Snapchat / TikTok 暂未支持') }}</strong>
          <span>{{ $t('当前只支持下方四个平台，不会把未实现平台显示为可用。') }}</span>
        </div>
      </article>
      <article>
        <i class="ri-window-line"></i>
        <div>
          <strong>{{ $t('Web 会话：单进程最多 1 个') }}</strong>
          <span>
            {{ $t('当前活跃') }} {{ numberOrDash(statusData?.web?.activeSessions ?? statusData?.web?.active_sessions) }}
            / {{ $t('上限') }} {{ numberOrDash(statusData?.web?.maxParallelSessions ?? statusData?.web?.max_parallel_sessions) }}
          </span>
        </div>
      </article>
      <article>
        <i class="ri-bar-chart-box-line"></i>
        <div>
          <strong>{{ $t('Web 数据只有天粒度') }}</strong>
          <span>{{ $t('Web 控制台导出不提供 breakdown，复盘报告会保留这项限制说明。') }}</span>
        </div>
      </article>
    </section>

    <section v-if="activeTab === 'connect'" class="panel">
      <div class="section-head">
        <div>
          <span class="section-kicker">{{ $t('连接状态') }}</span>
          <!-- 平台数跟着 PLATFORM_DEFS 走：隐藏一个平台就少一个，别再写死「四平台」 -->
          <h2>{{ $t('{p0} 个平台状态', { p0: PLATFORM_DEFS.length }) }}</h2>
          <p class="section-note">{{ $t('未来会支持更多平台') }}</p>
        </div>
        <span class="muted">{{ configuredPlatformCount }} / {{ PLATFORM_DEFS.length }} {{ $t('已配置') }}</span>
      </div>

      <div v-if="platformsLoading" class="section-state">
        <i class="ri-loader-4-line spin"></i>{{ $t('读取真实平台状态…') }}
      </div>
      <div v-else class="platform-grid">
        <article v-for="platform in platformCards" :key="platform.id" class="platform-card">
          <div class="platform-title">
            <span class="platform-mark">{{ platformMark(platform.id) }}</span>
            <div>
              <strong>{{ $t(platform.label) }}</strong>
              <span>{{ platform.driverFamily || $t('驱动未报告') }}</span>
            </div>
            <span class="status-pill" :class="platform.tone">{{ platform.statusLabel }}</span>
          </div>
          <dl>
            <div><dt>{{ $t('模式') }}</dt><dd>{{ modeLabel(platform.mode) }}</dd></div>
            <div v-if="platform.mode === 'api'"><dt>{{ $t('API 账户') }}</dt><dd>{{ platform.accountKeys.join(', ') || '—' }}</dd></div>
            <div v-else>
              <dt>{{ $t('Web 登录') }}</dt>
              <dd>{{ webLoginLabel(platform.webLogin) }}</dd>
            </div>
          </dl>
          <p v-if="platform.mode === 'api' && platform.missingSecrets.length" class="platform-warning">
            <i class="ri-key-2-line"></i> {{ $t('{p0}：{p1}', { p0: $t('缺少凭据项'), p1: platform.missingSecrets.join(', ') }) }}
          </p>
          <p v-else-if="platform.error" class="platform-warning">
            <i class="ri-error-warning-line"></i>{{ platform.error }}
          </p>
          <div v-if="platform.capabilities.length" class="capabilities">
            <span v-for="cap in platform.capabilities.slice(0, 5)" :key="cap">{{ cap }}</span>
            <span v-if="platform.capabilities.length > 5">+{{ platform.capabilities.length - 5 }}</span>
          </div>
          <div class="platform-actions">
            <button
              v-if="platform.mode === 'api'"
              class="mini-button primary"
              :disabled="!!platformBusy[platform.id]"
              @click="openCredentialDialog(platform.id)"
            >
              <i class="ri-settings-3-line"></i>
              {{ platform.missingSecrets.length ? $t('配置凭据') : $t('更新凭据') }}
            </button>
            <button
              class="mini-button"
              :disabled="!!platformBusy[platform.id] || (platform.mode === 'api' && platform.missingSecrets.length > 0)"
              @click="verifyPlatform(platform)"
            >
              <i :class="platformBusy[platform.id] === 'verify' ? 'ri-loader-4-line spin' : 'ri-radar-line'"></i>
              {{ $t('验证访问') }}
            </button>
            <button
              v-if="platform.mode === 'web'"
              class="mini-button"
              :disabled="!!platformBusy[platform.id] || !regionAllowed || !statusLoaded"
              @click="startWebLogin(platform)"
            >
              <i :class="platformBusy[platform.id] === 'start' ? 'ri-loader-4-line spin' : 'ri-window-line'"></i>
              {{ $t('启动 Web 登录') }}
            </button>
          </div>
          <p
            v-if="platformVerifyResults[platform.id]"
            class="operation-state"
            :class="{ bad: platformVerifyResults[platform.id]?.verified !== true }"
          >
            <i :class="platformVerifyResults[platform.id]?.verified === true ? 'ri-checkbox-circle-line' : 'ri-error-warning-line'"></i>
            {{ verificationLabel(platformVerifyResults[platform.id]) }}
          </p>
          <div v-if="webSessions[platform.id]" class="web-session">
            <div>
              <strong>{{ $t('Web 会话') }} · {{ webSessions[platform.id]?.state || $t('未知') }}</strong>
              <span>{{ webSessions[platform.id]?.humanHint || webSessions[platform.id]?.human_hint || webSessions[platform.id]?.detail || webSessions[platform.id]?.errorMessage || webSessions[platform.id]?.error_message || $t('请以已打开浏览器中的真实页面为准。') }}</span>
            </div>
            <div class="web-session-actions">
              <button
                class="mini-button"
                :disabled="!!platformBusy[platform.id] || webSessionTerminal(webSessions[platform.id])"
                @click="pollWebLogin(platform.id)"
              >
                {{ $t('探测一次') }}
              </button>
              <button
                class="mini-button warn"
                :disabled="!!platformBusy[platform.id] || webSessionTerminal(webSessions[platform.id])"
                @click="cancelWebLogin(platform.id)"
              >
                {{ $t('取消') }}
              </button>
            </div>
          </div>
        </article>
      </div>
      <p v-if="platformsError" class="inline-error">
        <i class="ri-error-warning-line"></i>{{ platformsError }}
      </p>
    </section>

    <section v-if="activeTab === 'insights'" class="panel">
      <div class="section-head">
        <div>
          <span class="section-kicker">{{ $t('只读分析') }}</span>
          <h2>{{ $t('指标与跨平台复盘') }}</h2>
        </div>
        <span class="muted">{{ $t('findings 由确定性规则计算') }}</span>
      </div>

      <div class="review-controls">
        <label class="field">
          <span>{{ $t('开始日期') }}</span>
          <input v-model="review.since" type="date" />
        </label>
        <label class="field">
          <span>{{ $t('结束日期') }}</span>
          <input v-model="review.until" type="date" />
        </label>
        <label class="field">
          <span>{{ $t('指标平台') }}</span>
          <select v-model="review.insightsPlatform">
            <option v-for="item in PLATFORM_DEFS" :key="item.id" :value="item.id">
              {{ $t(item.label) }}
            </option>
          </select>
        </label>
        <label class="field">
          <span>{{ $t('指标模式') }}</span>
          <select v-model="review.insightsMode">
            <option value="api">API</option>
            <option value="web">Web</option>
          </select>
        </label>
      </div>

      <div class="review-platforms">
        <span>{{ $t('复盘平台') }}</span>
        <label v-for="item in PLATFORM_DEFS" :key="item.id">
          <input v-model="review.platforms" type="checkbox" :value="item.id" />
          {{ $t(item.label) }}
        </label>
        <label>
          <input v-model="review.comparePrevious" type="checkbox" />
          {{ $t('对比紧邻上一周期') }}
        </label>
      </div>

      <div class="review-actions">
        <button class="button ghost" :disabled="insightsLoading || !validReviewDates" @click="loadInsights">
          <i :class="insightsLoading ? 'ri-loader-4-line spin' : 'ri-line-chart-line'"></i>
          {{ $t('拉取单平台指标') }}
        </button>
        <button
          class="button primary"
          :disabled="reportLoading || !validReviewDates || !review.platforms.length"
          @click="buildReviewReport"
        >
          <i :class="reportLoading ? 'ri-loader-4-line spin' : 'ri-file-chart-line'"></i>
          {{ $t('生成跨平台复盘') }}
        </button>
      </div>

      <div class="ads-chart-card">
        <div class="ads-chart-head">
          <strong>{{ $t('平台每日指标') }} · {{ review.since }} — {{ review.until }}</strong>
          <em>{{ $t('点击 / 转化（柱）· 花费（线）') }}</em>
        </div>
        <VChart v-if="insightsChartOption" class="ads-chart" :option="insightsChartOption" autoresize />
        <p v-else class="ads-chart sd-hint">{{ $t('暂无可绘制的每日指标，请先读取平台数据；区间汇总不会转换为日趋势。') }}</p>
      </div>

      <div v-if="insightsResult" class="result-block wide">
        <div class="result-title">
          <strong>{{ $t('指标真实响应') }}</strong>
          <span :class="resultTone(insightsResult)">{{ resultStatus(insightsResult) }}</span>
        </div>
        <pre>{{ pretty(insightsResult) }}</pre>
      </div>

      <div v-if="reportResult" class="report">
        <div class="metric-grid">
          <article v-for="metric in reportMetrics" :key="metric.key">
            <span>{{ $t(metric.label) }}</span>
            <strong>{{ metric.value }}</strong>
          </article>
        </div>

        <div class="ads-chart-card">
          <div class="ads-chart-head"><strong>{{ $t('各平台每日花费与转化') }}</strong></div>
          <p class="ads-chart sd-hint">{{ $t('每日复盘明细待确认：现有报告仅返回平台区间汇总，暂不绘制趋势。') }}</p>
        </div>

        <div v-if="reportPlatforms.length" class="report-platform-grid">
          <article v-for="row in reportPlatforms" :key="String(row.platform)">
            <strong>{{ platformLabel(String(row.platform)) }}</strong>
            <span>{{ $t('花费') }} {{ formatMetric(row.spend) }}</span>
            <span>{{ $t('点击') }} {{ formatMetric(row.clicks) }}</span>
            <span>{{ $t('转化') }} {{ formatMetric(row.conversions) }}</span>
            <em>{{ $t(String(row.verdict || '未给出结论')) }}</em>
          </article>
        </div>

        <div v-if="reportFindings.length" class="findings">
          <h3>{{ $t('确定性发现') }}</h3>
          <article v-for="(finding, index) in reportFindings" :key="`${finding.code || 'finding'}-${index}`">
            <span :class="`severity-${finding.severity || 'info'}`">{{ finding.severity || 'info' }}</span>
            <div>
              <strong>{{ finding.code || $t('发现') }} · {{ platformLabel(String(finding.platform || '')) }}</strong>
              <p>{{ finding.detail || '—' }}</p>
              <small v-if="finding.suggestion">{{ finding.suggestion }}</small>
            </div>
          </article>
        </div>

        <p v-if="reportNotes" class="report-notes">
          <i class="ri-sticky-note-line"></i>{{ reportNotes }}
        </p>
        <div class="result-block wide">
          <div class="result-title"><strong>{{ $t('复盘完整响应') }}</strong></div>
          <pre>{{ pretty(reportResult) }}</pre>
        </div>
      </div>
    </section>

    <section v-if="activeTab === 'audit'" class="panel">
      <div class="section-head">
        <div>
          <span class="section-kicker">{{ $t('可追溯性') }}</span>
          <h2>{{ $t('广告操作审计') }}</h2>
        </div>
        <button class="button ghost compact" :disabled="auditLoading" @click="loadAudit">
          <i :class="auditLoading ? 'ri-loader-4-line spin' : 'ri-refresh-line'"></i>{{ $t('刷新') }}
        </button>
      </div>

      <div class="audit-filters">
        <label class="field">
          <span>{{ $t('平台') }}</span>
          <select v-model="auditFilter.platform">
            <option value="">{{ $t('全部平台') }}</option>
            <option v-for="item in PLATFORM_DEFS" :key="item.id" :value="item.id">{{ $t(item.label) }}</option>
          </select>
        </label>
        <label class="field">
          <span>{{ $t('租户标识') }}</span>
          <input v-model.trim="auditFilter.tenantId" :placeholder="$t('可选')" />
        </label>
        <button class="button ghost compact" :disabled="auditLoading" @click="loadAudit">
          {{ $t('应用筛选') }}
        </button>
      </div>

      <div v-if="auditLoading" class="section-state">
        <i class="ri-loader-4-line spin"></i>{{ $t('读取审计流水…') }}
      </div>
      <p v-else-if="auditError" class="inline-error"><i class="ri-error-warning-line"></i>{{ auditError }}</p>
      <div v-else-if="!auditEntries.length" class="section-state">{{ $t('当前筛选下没有审计记录。') }}</div>
      <div v-else class="audit-table-wrap">
        <table class="audit-table">
          <thead>
            <tr>
              <th>{{ $t('时间') }}</th>
              <th>{{ $t('平台 / 模式') }}</th>
              <th>{{ $t('动作') }}</th>
              <th>{{ $t('租户') }}</th>
              <th>{{ $t('结果') }}</th>
              <th>{{ $t('预算') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(entry, index) in paginatedAuditEntries"
              :key="`${entry.ts || entry.iso || index}-${(auditPage - 1) * AUDIT_PAGE_SIZE + index}`"
            >
              <td>{{ formatAuditTime(entry) }}</td>
              <td><strong>{{ platformLabel(String(entry.platform || '')) }}</strong><span>{{ entry.mode || '—' }}</span></td>
              <td>{{ entry.action || '—' }}</td>
              <td>{{ entry.tenantId || entry.tenant_id || '—' }}</td>
              <td>
                <span class="status-pill" :class="entry.success ? 'ready' : 'error'">
                  {{ entry.success ? $t('成功') : $t('失败') }}
                </span>
                <small>{{ entry.status || entry.errorCode || entry.error_code || '—' }}</small>
              </td>
              <td>{{ (entry.budgetUsd ?? entry.budget_usd) == null ? '—' : `${formatMetric(entry.budgetUsd ?? entry.budget_usd)} USD` }}</td>
            </tr>
          </tbody>
        </table>
        <nav class="audit-pagination" :aria-label="$t('广告审计分页')">
          <span>
            {{ $t('共 {p0} 条', { p0: auditEntries.length }) }}
            · {{ auditRangeStart }}–{{ auditRangeEnd }}
            · {{ $t('每页 10 条') }}
          </span>
          <div>
            <button type="button" :disabled="auditPage === 1" @click="goAuditPage(auditPage - 1)">
              <i class="ri-arrow-left-s-line"></i>{{ $t('上一页') }}
            </button>
            <button
              v-for="page in auditPageNumbers"
              :key="page"
              type="button"
              :class="{ active: auditPage === page }"
              :aria-current="auditPage === page ? 'page' : undefined"
              @click="goAuditPage(page)"
            >
              {{ page }}
            </button>
            <button type="button" :disabled="auditPage === auditPageCount" @click="goAuditPage(auditPage + 1)">
              {{ $t('下一页') }}<i class="ri-arrow-right-s-line"></i>
            </button>
          </div>
        </nav>
      </div>
    </section>

    <!-- ══ 定时自动化 Tab ══ -->
    <section v-if="activeTab === 'automation'" class="panel automation-panel">
      <div class="section-head">
        <div>
          <span class="section-kicker">{{ $t('Scheduling') }}</span>
          <h2>{{ $t('定时自动化') }}</h2>
        </div>
        <button class="button primary compact" :disabled="adsCronSaving" @click="saveAdsCronJobs">
          <i :class="adsCronSaving ? 'ri-loader-4-line spin' : 'ri-save-3-line'"></i>{{ $t('保存定时任务') }}
        </button>
      </div>
      <p class="tab-section-note">{{ $t('把复盘、巡检等环节写成真实定时任务（保存后在 左侧菜单 → 定时任务 也可统一管理），让投放链路按节奏自动运转；预算变更始终保留人工确认。') }}</p>
      <div class="cron-list">
        <article v-for="preset in adsCronPresets" :key="preset.key" class="cron-item">
          <label class="cron-toggle">
            <input
              v-model="adsCronEnabled[preset.key]"
              type="checkbox"
              :disabled="preset.key === 'video' && !adsCronVideoDir.trim()"
            />
            <span>
              <strong>{{ $t(preset.name) }}</strong>
              <small>{{ $t(preset.desc) }}</small>
            </span>
          </label>
          <!-- 人话排期：频率 + 时间/星期/间隔 下拉；底层自动生成 cron，不让用户写表达式 -->
          <div class="cron-plan">
            <label>
              <span>{{ $t('执行频率') }}</span>
              <select v-model="adsCronPlans[preset.key].freq">
                <option value="daily">{{ $t('每天') }}</option>
                <option value="weekly">{{ $t('每周') }}</option>
                <option value="hours">{{ $t('每隔几小时') }}</option>
              </select>
            </label>
            <label v-if="adsCronPlans[preset.key].freq === 'weekly'">
              <span>{{ $t('星期') }}</span>
              <select v-model.number="adsCronPlans[preset.key].weekday">
                <option v-for="day in ADS_CRON_WEEKDAYS" :key="day.value" :value="day.value">{{ $t(day.label) }}</option>
              </select>
            </label>
            <label v-if="adsCronPlans[preset.key].freq === 'hours'">
              <span>{{ $t('间隔') }}</span>
              <select v-model.number="adsCronPlans[preset.key].everyHours">
                <option v-for="hours in ADS_CRON_INTERVALS" :key="hours" :value="hours">{{ $t('{p0} 小时', { p0: hours }) }}</option>
              </select>
            </label>
            <label v-if="adsCronPlans[preset.key].freq !== 'hours'">
              <span>{{ $t('时间') }}</span>
              <span class="cron-time">
                <select v-model.number="adsCronPlans[preset.key].hour">
                  <option v-for="hour in ADS_CRON_HOURS" :key="hour" :value="hour">{{ pad2(hour) }}</option>
                </select>
                <em>:</em>
                <select v-model.number="adsCronPlans[preset.key].minute">
                  <option v-for="minute in ADS_CRON_MINUTES" :key="minute" :value="minute">{{ pad2(minute) }}</option>
                </select>
              </span>
            </label>
            <small class="cron-hint">{{ cronHumanHint(planToCron(adsCronPlans[preset.key])) }}</small>
          </div>
          <div v-if="preset.key === 'video'" class="cron-video-dir">
            <span>{{ $t('素材库（必选）') }}</span>
            <div class="credential-input with-action">
              <input v-model.trim="adsCronVideoDir" type="text" :placeholder="$t('包含图片 / 视频素材的本地文件夹绝对路径')" />
              <button type="button" @click="pickAdsCronVideoDir"><i class="ri-folder-open-line"></i></button>
            </div>
          </div>
        </article>
      </div>
      <p v-if="adsCronSavedNote" class="operation-state"><i class="ri-checkbox-circle-line"></i>{{ adsCronSavedNote }}</p>
    </section>

    <!-- ══ 弹出层：媒体模型配置（视频 / TTS），不跳转设置页 ══ -->
    <Teleport to="body">
      <div v-if="mediaDialogOpen" role="dialog" class="credential-backdrop" @click.self="closeMediaDialog">
        <section class="credential-dialog" role="dialog" aria-modal="true" :aria-label="$t('配置制作引擎')">
          <header>
            <div>
              <span class="section-kicker">{{ mediaDialogKind === 'video' ? $t('Video Engine') : $t('Voice Engine') }}</span>
              <h2>{{ mediaDialogKind === 'video' ? $t('视频生成模型配置') : $t('TTS 配音配置') }}</h2>
              <p>{{ mediaDialogKind === 'video'
                ? $t('选择接入引擎并填入密钥；保存后立即设为默认视频生成引擎。')
                : $t('配置旁白使用的 TTS 引擎；保存后立即设为默认配音引擎。') }}</p>
            </div>
            <button type="button" :aria-label="$t('关闭')" @click="closeMediaDialog">
              <i class="ri-close-line"></i>
            </button>
          </header>
          <form @submit.prevent="saveMediaDialog">
            <div class="credential-fields">
              <label>
                <span>{{ $t('接入引擎') }}</span>
                <select v-model="mediaDialogProviderId">
                  <option v-for="p in mediaDialogProviders" :key="p.id" :value="p.id">
                    {{ p.label }}{{ p.configured ? ` · ${$t('已接入')}` : '' }}
                  </option>
                </select>
              </label>
              <label v-for="field in mediaDialogKeyFields" :key="field.env">
                <span>
                  {{ field.label }}
                  <em v-if="field.required">{{ $t('必填') }}</em>
                  <small v-else-if="field.set">{{ $t('已保存，留空即不覆盖') }}</small>
                  <!-- 有官方默认值的选填项（如 ARK Base URL）必须说清「不用填」，
                       否则灰色 placeholder 看着和空的必填框一模一样，用户会以为漏填了 -->
                  <small v-else-if="field.placeholder">{{ $t('可选，留空用默认值') }}</small>
                  <small v-else>{{ $t('可选') }}</small>
                </span>
                <div :class="['credential-input', { secret: field.secret }]">
                  <input
                    v-model.trim="mediaDialogEnv[field.env]"
                    :type="field.secret && !revealedMediaFields[field.env] ? 'password' : 'text'"
                    :placeholder="field.set ? (field.masked || '••••••') : (field.placeholder || '')"
                    autocomplete="off"
                  />
                  <button
                    v-if="field.secret"
                    type="button"
                    :aria-label="revealedMediaFields[field.env] ? $t('隐藏') : $t('显示')"
                    @click="revealedMediaFields[field.env] = !revealedMediaFields[field.env]"
                  >
                    <i :class="revealedMediaFields[field.env] ? 'ri-eye-off-line' : 'ri-eye-line'"></i>
                  </button>
                </div>
              </label>
              <label>
                <span>{{ $t('模型名称') }} <small>{{ $t('可选，留空用引擎默认') }}</small></span>
                <div class="credential-input">
                  <input v-model.trim="mediaDialogModel" type="text" :placeholder="mediaDialogModelPlaceholder" autocomplete="off" />
                </div>
              </label>
            </div>
            <p v-if="mediaDialogError" class="credential-error">
              <i class="ri-error-warning-line"></i>{{ mediaDialogError }}
            </p>
            <footer>
              <button class="button ghost" type="button" :disabled="mediaDialogSaving" @click="closeMediaDialog">
                {{ $t('取消') }}
              </button>
              <button class="button primary" type="submit" :disabled="mediaDialogSaving">
                <i :class="mediaDialogSaving ? 'ri-loader-4-line spin' : 'ri-save-3-line'"></i>
                {{ mediaDialogSaving ? $t('正在保存…') : $t('保存并设为默认') }}
              </button>
            </footer>
          </form>
        </section>
      </div>
    </Teleport>

    <!-- ══ 弹出层：生成广告视频提示词（只服务动态视频生成）══ -->
    <Teleport to="body">
      <div v-if="adsVideoDialogOpen" role="dialog" class="credential-backdrop" @click.self="adsVideoDialogOpen = false">
        <section class="credential-dialog" role="dialog" aria-modal="true" :aria-label="$t('生成广告视频提示词')">
          <header>
            <div>
              <span class="section-kicker">{{ $t('Ad Prompt') }}</span>
              <h2>{{ $t('生成广告视频提示词') }}</h2>
              <p>{{ $t('先把分镜与运镜提示写出来，可逐条修改；第 5 步执行投放时按这份提示词调用视频模型出片。') }}</p>
            </div>
            <button type="button" :aria-label="$t('关闭')" @click="adsVideoDialogOpen = false">
              <i class="ri-close-line"></i>
            </button>
          </header>
          <form @submit.prevent="saveAdsPromptScenes">
            <div class="credential-fields">
              <label>
                <span>{{ $t('素材文件夹') }} <em>{{ $t('必填') }}</em></span>
                <div class="credential-input with-action">
                  <input v-model.trim="adsVideoMaterialDir" type="text" :placeholder="$t('包含图片 / 视频素材的本地文件夹绝对路径')" />
                  <button type="button" @click="pickAdsVideoMaterialDir"><i class="ri-folder-open-line"></i></button>
                </div>
              </label>
              <label class="span-wide">
                <span>{{ $t('投放要求 / 创意简报') }}</span>
                <textarea v-model.trim="adsVideoBrief" rows="4"></textarea>
              </label>
            </div>

            <div class="prompt-actions">
              <button
                class="button ghost"
                type="button"
                :disabled="adsPromptGenerating || !adsVideoMaterialDir"
                @click="generateAdsPromptScenes"
              >
                <i :class="adsPromptGenerating ? 'ri-loader-4-line spin' : 'ri-quill-pen-line'"></i>
                {{ adsPromptGenerating ? $t('正在生成提示词…') : adsPromptScenes.length ? $t('重新生成提示词') : $t('生成提示词') }}
              </button>
              <small v-if="adsPromptNote">{{ adsPromptNote }}</small>
            </div>

            <ol v-if="adsPromptScenes.length" class="prompt-scenes">
              <li v-for="(scene, index) in adsPromptScenes" :key="scene.id">
                <header>
                  <strong>{{ $t('镜头 {p0}', { p0: index + 1 }) }}</strong>
                  <small :title="scene.referenceImage">{{ (scene.referenceImage || '').split(/[\\/]/).pop() }}</small>
                  <em>
                    <input v-model.number="scene.duration" type="number" min="2" max="10" />{{ $t('秒') }}
                  </em>
                </header>
                <label>
                  <span>{{ $t('运镜提示（英文，交给视频模型）') }}</span>
                  <textarea v-model.trim="scene.prompt" rows="2"></textarea>
                </label>
                <label>
                  <span>{{ $t('字幕 / 旁白文案') }}</span>
                  <input v-model.trim="scene.caption" type="text" />
                </label>
              </li>
            </ol>
            <p v-else class="credential-hint">
              <i class="ri-information-line"></i>{{ $t('还没有提示词。选好素材文件夹后点「生成提示词」，会按素材图片顺序写出分镜与运镜提示。') }}
            </p>

            <p v-if="!videoModelReady" class="credential-error">
              <i class="ri-error-warning-line"></i>{{ $t('尚未配置视频生成模型，无法开始生成；请先在「制作引擎配置」中完成接入。') }}
            </p>
            <footer>
              <button class="button ghost" type="button" @click="adsVideoDialogOpen = false">{{ $t('取消') }}</button>
              <button class="button primary" type="submit" :disabled="!adsPromptScenes.length">
                <i class="ri-save-3-line"></i>{{ $t('保存提示词') }}
              </button>
            </footer>
          </form>
        </section>
      </div>
    </Teleport>

    <!-- ══ 弹出层：历史成片预览 ══ -->
    <Teleport to="body">
      <div v-if="adsVideoPreviewOpen" role="dialog" class="credential-backdrop" @click.self="adsVideoPreviewOpen = false">
        <section class="credential-dialog video-preview-dialog" role="dialog" aria-modal="true" :aria-label="$t('广告成片预览')">
          <header>
            <div>
              <span class="section-kicker">{{ $t('Preview') }}</span>
              <h2>{{ $t('广告成片预览') }}</h2>
              <p class="preview-path">{{ adsVideoPreviewPath }}</p>
            </div>
            <button type="button" :aria-label="$t('关闭')" @click="adsVideoPreviewOpen = false">
              <i class="ri-close-line"></i>
            </button>
          </header>
          <div class="video-preview-body">
            <i v-if="adsVideoPreviewLoading" class="ri-loader-4-line spin"></i>
            <!-- @error：协议 404 / 解码失败时清 src 亮出失败态，不让用户对着黑屏（与确认卡预览同规则） -->
            <video v-else-if="adsVideoPreviewSrc" :src="adsVideoPreviewSrc" controls autoplay @error="adsVideoPreviewSrc = ''"></video>
            <p v-else>{{ $t('无法读取成片') }}</p>
          </div>
        </section>
      </div>
    </Teleport>

    <Teleport to="body">
      <div v-if="credentialDialogOpen" role="dialog" class="credential-backdrop" @click.self="closeCredentialDialog">
        <section class="credential-dialog" role="dialog" aria-modal="true" :aria-label="$t('配置 API 凭据')">
        <header>
          <div>
            <span class="section-kicker">{{ $t('API Connection') }}</span>
            <h2>{{ credentialPlatformLabel }} · {{ $t('API 凭据配置') }}</h2>
            <p>{{ $t('只保存本次填写的字段；已经保存的 Token 不会回显，也不会因留空而被覆盖。') }}</p>
          </div>
          <button type="button" :aria-label="$t('关闭')" @click="closeCredentialDialog">
            <i class="ri-close-line"></i>
          </button>
        </header>

        <p v-if="credentialPlatformId === 'instagram'" class="credential-info">
          <i class="ri-information-line"></i>
          {{ $t('Instagram API 共用 Facebook 的 Meta System User Token；此处保存后会同时更新共享 Meta 凭据。') }}
        </p>
        <p v-else-if="credentialPlatformId === 'youtube'" class="credential-info">
          <i class="ri-information-line"></i>
          {{ $t('YouTube 此处管理自然内容上传与数据；付费 Video Campaign 由 Google Ads 执行。') }}
        </p>

        <form @submit.prevent="savePlatformCredentials">
          <div class="credential-fields">
            <label v-for="field in activeCredentialFields" :key="field.key">
              <span>
                {{ $t(field.label) }}
                <em v-if="field.required">{{ $t('必填') }}</em>
                <small v-else>{{ $t('可选') }}</small>
              </span>
              <div :class="['credential-input', { secret: field.secret }]">
                <input
                  v-model.trim="credentialDraft[field.key]"
                  :type="field.secret && !revealedCredentialFields[field.key] ? 'password' : 'text'"
                  :placeholder="field.placeholder"
                  autocomplete="off"
                />
                <button
                  v-if="field.secret"
                  type="button"
                  :aria-label="revealedCredentialFields[field.key] ? $t('隐藏') : $t('显示')"
                  @click="revealedCredentialFields[field.key] = !revealedCredentialFields[field.key]"
                >
                  <i :class="revealedCredentialFields[field.key] ? 'ri-eye-off-line' : 'ri-eye-line'"></i>
                </button>
              </div>
              <small v-if="field.hint">{{ $t(field.hint) }}</small>
            </label>
          </div>
          <p v-if="credentialError" class="credential-error">
            <i class="ri-error-warning-line"></i>{{ credentialError }}
          </p>
          <footer>
            <button class="button ghost" type="button" :disabled="credentialSaving" @click="closeCredentialDialog">
              {{ $t('取消') }}
            </button>
            <button class="button primary" type="submit" :disabled="credentialSaving || !credentialHasInput">
              <i :class="credentialSaving ? 'ri-loader-4-line spin' : 'ri-save-3-line'"></i>
              {{ credentialSaving ? $t('正在保存…') : $t('保存并切换到 API') }}
            </button>
          </footer>
        </form>
        </section>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, onUnmounted, reactive, ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import PageBackButton from '../components/PageBackButton.vue';
import WorkbenchStepBar, { type WorkbenchStep } from '../components/WorkbenchStepBar.vue';
import StepRunAlert from '../components/StepRunAlert.vue';
import { useStepWatchdog } from '../composables/useStepWatchdog';
import VChart from 'vue-echarts';
import { use } from 'echarts/core';
import { CanvasRenderer } from 'echarts/renderers';
import { BarChart, LineChart } from 'echarts/charts';
import { GridComponent, LegendComponent, TooltipComponent } from 'echarts/components';
import { adsDailyMetrics } from '../workbenches/adsDailyMetrics';
use([CanvasRenderer, BarChart, LineChart, GridComponent, LegendComponent, TooltipComponent]);
import { i18n, t as i18nT } from '../i18n';
import { humanizeErrorMessage } from '../utils/humanize';
import { useNotificationStore } from '../stores/notification';
import { createNativeBrowserModalLock } from '../composables/useNativeBrowserModalLock';
import AutomationOpsConsole from '../components/AutomationOpsConsole.vue';
// 运行态放在模块级共享：离开工作台再回来，正在跑的任务不会"消失"
import {
  adsPublishBusyId, adsPublishRuns, adsGenActive, adsGenNodes, adsGenMessage, adsGenPreviewPath,
  adsRunInterrupted, adsRunStartedAt, persistAdsRunState, restoreAdsRunState, resetAdsRunState,
  adsGenProgressAt, adsGenWaitExtendedAt, failAdsGenRunningNodes,
  type PublishRun, type PublishStep, type PublishStepState, type GenNode,
} from '../composables/adsRunState';
import type {
  AutomationExecutionContext,
  AutomationStepReporter,
} from '../workbenches/automationExecution';
import {
  DEFAULT_MATERIAL_FALLBACK, MATERIAL_FALLBACK_OPTIONS, isMaterialFallbackStrategy,
  type MaterialFallbackStrategy,
} from '@totalclaw/core-domain';
import { workflowOutput, workflowRunId } from '../workbenches/workflowResult';
import {
  buildAdsVideoProductionWorkflow,
  buildGlobalAdsPublishWorkflow,
  FIXED_ADS_PUBLISH_WORKFLOW_ID,
  FIXED_ADS_VIDEO_WORKFLOW_ID,
  reconcileModuleCronJobs,
  selectGlobalAdsWorkflowPlatforms,
  setWorkflowAutoRun,
} from '../composables/workflowAutoRun';
// 海外真实发布（YouTube 上传向导 / Meta CDP 注入 / API 驱动 + 运行态机）与慈善活动内容
// 工场共用同一份实现，广告专属概念（画幅挑选 / 投放品牌与阿语标题）留在本文件，
// 只把「怎么把它发出去」的部分抽到这里，见该文件头部注释。
import {
  FOREGROUND_SHARED_BROWSER_KEY,
  askLlmOnce,
  extractJsonObject,
  finishOverseasPublishRun,
  markOverseasPublishStep,
  overseasPublishStepsFor,
  runOverseasPublish,
  type OverseasPlatformId,
} from '../composables/overseasPublish';

type PlatformId = 'facebook' | 'instagram' | 'google_ads' | 'youtube';
type AdsMode = 'api' | 'web';
type AnyRecord = Record<string, any>;

interface PlatformCard {
  id: PlatformId;
  label: string;
  enabled: boolean;
  configured: boolean;
  mode: string;
  driverFamily: string;
  accountKeys: string[];
  missingSecrets: string[];
  capabilities: string[];
  webLogin: AnyRecord | null;
  error: string;
  tone: 'ready' | 'warning' | 'error' | 'muted';
  statusLabel: string;
  isSandbox: boolean;
}

interface CreativeAsset {
  name: string;
  size: number;
  type: string;
  kind: 'image' | 'video';
  previewUrl: string;
  previewDataUrl: string;
  /** 浏览器控件给的相对路径（`<文件夹名>/<文件名>`），仅用于展示 */
  relativePath: string;
  /** 绝对路径 —— 只有走原生目录选择器才有；生成与发布都必须用它 */
  absolutePath?: string;
}

interface CredentialField {
  key: string;
  label: string;
  placeholder: string;
  hint?: string;
  secret?: boolean;
  required?: boolean;
  sharedMeta?: boolean;
  defaultValue?: string;
}

const ALL_PLATFORM_DEFS: ReadonlyArray<{
  id: PlatformId;
  label: string;
  caption: string;
  loginUrl: string;
  icon: string;
  color: string;
}> = [
  {
    id: 'facebook',
    label: 'Facebook',
    caption: 'Business Manager',
    loginUrl: 'https://business.facebook.com/',
    icon: 'ri-facebook-fill',
    color: '#1877f2',
  },
  {
    id: 'instagram',
    label: 'Instagram',
    caption: 'Professional Account',
    loginUrl: 'https://www.instagram.com/accounts/login/',
    icon: 'ri-instagram-line',
    color: '#d62976',
  },
  {
    id: 'google_ads',
    label: 'Google Ads',
    caption: 'Ads Manager',
    loginUrl: 'https://ads.google.com/',
    icon: 'ri-google-fill',
    color: '#4285f4',
  },
  {
    id: 'youtube',
    label: 'YouTube',
    caption: 'YouTube Studio',
    loginUrl: 'https://studio.youtube.com/',
    icon: 'ri-youtube-fill',
    color: '#ff0033',
  },
];

/**
 * 暂不开放的平台：整块从 UI 里摘掉（平台卡片 / 勾选 / 话题输入 / 发布分支 / 凭据面板都跟着消失），
 * 代码与画幅表全保留 —— 等对应平台后台配置齐了，把 id 从这里删掉即可原样启用。
 * google_ads：付费广告投放需要先备好广告账户与计费，先不让它出现在流程里干扰。
 */
const HIDDEN_PLATFORMS = new Set<PlatformId>(['google_ads']);
const PLATFORM_DEFS = ALL_PLATFORM_DEFS.filter((item) => !HIDDEN_PLATFORMS.has(item.id));
/** 各平台「审计主键」账号 ID 的填写提示 —— 说明文案要跟着实际开放的平台走。 */
const PLATFORM_ID_HINT: Record<PlatformId, string> = {
  facebook: i18nT('FB 广告账户 act_…'),
  instagram: i18nT('IG 商业账号 ID'),
  youtube: i18nT('YouTube 频道 ID'),
  google_ads: 'Google Ads Customer ID',
};

/** 平台隐藏时，只服务该平台的场景也一并摘掉（web-login 整条就是 Google Ads 托管登录）。 */
const hiddenAdsScenarios = HIDDEN_PLATFORMS.has('google_ads') ? ['web-login'] : [];
/** 页面文案里的渠道名一律从这里取 —— 写死平台名会在隐藏平台后变成对用户的空头承诺。 */
const visiblePlatformLabels = PLATFORM_DEFS.map((item) => item.label).join(i18nT('、'));
const platformIdHints = PLATFORM_DEFS.map((item) => i18nT(PLATFORM_ID_HINT[item.id])).join(i18nT('、'));

const CREDENTIAL_FIELDS: Record<PlatformId, CredentialField[]> = {
  facebook: [
    { key: 'system_user_token', label: 'Meta System User Token', placeholder: 'EAAG…', secret: true, required: true },
    { key: 'app_secret', label: 'Meta App Secret', placeholder: 'App Secret', secret: true },
    { key: 'app_id', label: 'App ID', placeholder: '1234567890123456' },
    { key: 'business_id', label: 'Business ID', placeholder: '987654321098765' },
    { key: 'ad_account_id', label: 'Ad Account ID', placeholder: 'act_1112223334445' },
    { key: 'page_id', label: 'Page ID', placeholder: '101010101010101' },
    { key: 'pixel_id', label: 'Pixel ID', placeholder: '202020202020202' },
    { key: 'api_version', label: i18nT('Graph API 版本'), placeholder: 'v20.0', defaultValue: 'v20.0' },
  ],
  instagram: [
    {
      key: 'system_user_token',
      label: i18nT('共享 Meta System User Token'),
      placeholder: 'EAAG…',
      secret: true,
      required: true,
      sharedMeta: true,
    },
    { key: 'app_secret', label: i18nT('共享 Meta App Secret'), placeholder: 'App Secret', secret: true, sharedMeta: true },
    {
      key: 'ig_business_account_id',
      label: 'Instagram Business Account ID',
      placeholder: '17841400000000000',
      hint: '必须是 Business / Creator 账号对应的数字 ID，不是 @handle。',
    },
    { key: 'linked_page_id', label: i18nT('关联 Facebook Page ID'), placeholder: '101010101010101' },
    { key: 'ad_account_id', label: 'Ad Account ID', placeholder: 'act_1112223334445' },
    { key: 'api_version', label: i18nT('Graph API 版本'), placeholder: 'v20.0', defaultValue: 'v20.0' },
  ],
  google_ads: [
    { key: 'developer_token', label: 'Developer Token', placeholder: 'AbC-dEf…', secret: true, required: true },
    { key: 'refresh_token', label: 'OAuth Refresh Token', placeholder: '1//0g…', secret: true, required: true },
    { key: 'client_secret', label: 'OAuth Client Secret', placeholder: 'GOCSPX-…', secret: true },
    {
      key: 'login_customer_id',
      label: 'Manager Customer ID',
      placeholder: '1234567890',
      hint: i18nT('10 位纯数字，不要输入横杠。'),
    },
    { key: 'customer_id', label: 'Customer ID', placeholder: '9876543210', hint: i18nT('10 位纯数字，不要输入横杠。') },
    { key: 'oauth_client_id', label: 'OAuth Client ID', placeholder: '8888-xxxx.apps.googleusercontent.com' },
    { key: 'api_version', label: i18nT('Google Ads API 版本'), placeholder: 'v18', defaultValue: 'v18' },
  ],
  youtube: [
    { key: 'refresh_token', label: 'YouTube Refresh Token', placeholder: '1//0g…', secret: true, required: true },
    { key: 'client_secret', label: 'OAuth Client Secret', placeholder: 'GOCSPX-…', secret: true },
    { key: 'channel_id', label: 'Channel ID', placeholder: 'UCxxxxxxxxxxxxxxxxxxxx' },
    { key: 'oauth_client_id', label: 'OAuth Client ID', placeholder: '8888-yyyy.apps.googleusercontent.com' },
    { key: 'paid_delegate_to', label: i18nT('付费广告委派平台'), placeholder: 'google_ads', defaultValue: 'google_ads' },
  ],
};

const notif = useNotificationStore();
const router = useRouter();
const statusData = ref<AnyRecord | null>(null);
const statusLoading = ref(false);
const statusError = ref('');
const platformRows = ref<AnyRecord[]>([]);
const platformsLoading = ref(false);
const platformsError = ref('');
const refreshing = ref(false);
const platformBusy = reactive<Record<string, '' | 'verify' | 'start' | 'poll' | 'cancel' | 'configure'>>({});
const platformVerifyResults = reactive<Record<string, AnyRecord | null>>({});
const webSessions = reactive<Record<string, AnyRecord | null>>({});
// 默认全部 Web 模式：演示与真实投放都以「客户本人网页登录」为主路径；
// API 模式仅在客户提供了平台 Token 时手动切换。
const platformModes = reactive<Record<PlatformId, AdsMode>>({
  facebook: 'web',
  instagram: 'web',
  google_ads: 'web',
  youtube: 'web',
});
const credentialDialogOpen = ref(false);
const credentialNativeBrowserLock = createNativeBrowserModalLock();
const credentialPlatformId = ref<PlatformId>('facebook');
const credentialDraft = reactive<Record<string, string>>({});
const revealedCredentialFields = reactive<Record<string, boolean>>({});
const credentialSaving = ref(false);
const credentialError = ref('');
const creativeInput = ref<HTMLInputElement | null>(null);
const creativeFolderInput = ref<HTMLInputElement | null>(null);
const creativeAssets = ref<CreativeAsset[]>([]);
const creativeDragging = ref(false);
const creativeError = ref('');
const creativeBrief = reactive({
  brandName: 'UAE Growth Campaign',
  arabicHeadline: 'اكتشف علامتنا في الإمارات',
});
const previewPlatform = ref<PlatformId>('facebook');
const quickLoginBusy = ref<PlatformId | ''>('');
const quickLoginNote = ref('');

const campaign = reactive({
  mode: 'api' as AdsMode,
  tenantId: 'tenant-uae-demo',
});
const publishResult = ref<AnyRecord | null>(null);
const pendingCampaignPlans = ref<Array<{
  platform: PlatformId;
  mode: AdsMode;
  spec: AnyRecord;
  confirmToken: string;
  validation: AnyRecord;
}>>([]);

const review = reactive({
  since: dateInputDaysAgo(6),
  until: dateInputDaysAgo(0),
  insightsPlatform: 'facebook' as PlatformId,
  insightsMode: 'api' as AdsMode,
  platforms: PLATFORM_DEFS.map((item) => item.id) as PlatformId[],
  comparePrevious: true,
});
const insightsLoading = ref(false);
const insightsResult = ref<AnyRecord | null>(null);
const reportLoading = ref(false);
const reportResult = ref<AnyRecord | null>(null);

const auditLoading = ref(false);
const auditError = ref('');
const auditEntries = ref<AnyRecord[]>([]);
const auditFilter = reactive({ platform: '', tenantId: '' });
const AUDIT_PAGE_SIZE = 10;
const auditPage = ref(1);
const auditPageCount = computed(() => Math.max(1, Math.ceil(auditEntries.value.length / AUDIT_PAGE_SIZE)));
const paginatedAuditEntries = computed(() => {
  const start = (auditPage.value - 1) * AUDIT_PAGE_SIZE;
  return auditEntries.value.slice(start, start + AUDIT_PAGE_SIZE);
});
const auditPageNumbers = computed(() =>
  Array.from({ length: auditPageCount.value }, (_, index) => index + 1));
const auditRangeStart = computed(() =>
  auditEntries.value.length ? (auditPage.value - 1) * AUDIT_PAGE_SIZE + 1 : 0);
const auditRangeEnd = computed(() =>
  Math.min(auditPage.value * AUDIT_PAGE_SIZE, auditEntries.value.length));

// ═══════════ 多 Tab 分区（#3 简化页面）═══════════
type AdsTab = 'connect' | 'campaign' | 'scenarios' | 'insights' | 'audit' | 'automation';
const ADS_TABS: ReadonlyArray<{ id: AdsTab; icon: string; label: string; desc: string }> = [
  {
    id: 'campaign',
    icon: 'ri-advertisement-line',
    label: i18nT('投放工作区'),
    desc: i18nT('上传客户素材、配置制作引擎（视频模型与 TTS 配音）、真实生成并挑选广告视频，然后一键进入多平台投放工作流。'),
  },
  {
    id: 'connect',
    icon: 'ri-plug-line',
    label: i18nT('平台连接'),
    desc: i18nT('接入并登录下方列出的各投放平台：每个平台可选 Web 登录（客户本人扫码或输密码）或 API 凭据接入，实时展示各平台连接与登录状态。'),
  },
  {
    id: 'scenarios',
    icon: 'ri-slideshow-3-line',
    label: i18nT('场景执行台'),
    desc: i18nT('与「投放工作区」五步向导相互独立的演示 / 排查场景：作业包发布、跨平台指标复盘等。日常投放请用五步向导。'),
  },
  {
    id: 'insights',
    icon: 'ri-line-chart-line',
    label: i18nT('指标与复盘'),
    desc: i18nT('拉取各平台真实投放指标，生成跨平台复盘报告与确定性优化发现；未授权平台不会出现虚构数据。'),
  },
  {
    id: 'audit',
    icon: 'ri-shield-check-line',
    label: i18nT('操作审计'),
    desc: i18nT('每一次广告校验、创建与平台回执都有可追溯的审计流水，支持按平台与租户筛选。'),
  },
  {
    id: 'automation',
    icon: 'ri-timer-line',
    label: i18nT('定时自动化'),
    desc: i18nT('把跨平台复盘、平台巡检等环节配置成真实定时任务，让投放链路按节奏自动运转；预算变更始终保留人工确认。'),
  },
];
const activeTab = ref<AdsTab>('campaign');
const activeTabDef = computed(() => ADS_TABS.find((tab) => tab.id === activeTab.value) || ADS_TABS[0]);

/**
 * 步骤对号必须「真完成」才亮：第 2/4 步的条件默认值就满足（全选平台 / 预填客户标识），
 * 页面一打开就打勾是错的。加「用户动过」判定：用户在该步骤有过实际操作后才算完成。
 */
const guideTouched = reactive({ platforms: false, info: false });
/**
 * 第 2 步完成 = **有勾平台**就算完成，只有全都没勾才是待确认。
 * 原来还要求 `guideTouched.platforms`（用户主动动过勾选）—— 可平台默认就是全选，
 * 接受默认的用户永远"没动过"，序号处一直是「2」不出对号（实测反馈）。
 * 「动过才算数」那套只适用于有预填默认值的文本字段（第 4 步投放信息），
 * 勾选类不适用：勾着就是选了。
 */
/**
 * 第 2 步完成 = **勾了平台**。
 * ⚠️ 不能用 workflowPlatforms —— 那是「已就绪可投放」的集合（要平台连接状态 OK），
 * 平台还没连上时它是空的，于是勾了两个平台却一直「待确认」（实测反馈）。
 * 就绪度是另一回事，由第 5 步的 canStartAdsScenario 把关，不该反映在"选没选"上。
 */
const guideStep2Done = computed(() => includedPlatformDefs.value.length > 0);
/**
 * 第 3 步完成 = 手上有能进第 5 步的东西：
 * 上传的素材 / 选中的历史成片 / **动态模式下已保存的分镜提示词**。
 * 漏掉最后一项时，用提示词模式的用户第 3 步永远「待完成」，第 5 步也点不动（实测反馈）。
 */
const adsPromptReady = computed(() => adsVideoMode.value === 'dynamic'
  && adsPromptChosen.value
  && adsPromptScenes.value.length > 0
  && !!adsVideoMaterialDir.value.trim());
const guideStep3Done = computed(() => !!creativeAsset.value
  || !!selectedPublishVideoPath.value
  || adsPromptReady.value);

const guideStep4Done = computed(() => guideTouched.info && !!campaign.tenantId.trim());

/** 服务链压缩版：原六张大卡 → hero 内一行小 icon（title 悬停看明细）。 */
const HERO_CHAIN: ReadonlyArray<{ icon: string; label: string; detail: string }> = [
  { icon: 'ri-briefcase-4-line', label: i18nT('客户需求'), detail: i18nT('品牌、市场、预算、KPI、受众') },
  { icon: 'ri-focus-3-line', label: i18nT('市场策略'), detail: i18nT('阿英双语 · 本地化 · 渠道组合') },
  { icon: 'ri-palette-line', label: i18nT('素材适配'), detail: i18nT('客户上传素材 · 阿语文案') },
  { icon: 'ri-advertisement-line', label: i18nT('跨平台投放'), detail: 'Facebook · Instagram · Ads · YouTube' },
  { icon: 'ri-line-chart-line', label: i18nT('数据复盘'), detail: i18nT('花费 · 触达 · 点击 · 转化') },
  { icon: 'ri-settings-4-line', label: i18nT('账户优化'), detail: i18nT('预算 · 受众 · 素材 · 落地页') },
];

// ═══════════ 制作引擎：视频生成模型 + TTS 配音（#6）═══════════
interface MediaKeyField {
  env: string; label: string; secret: boolean; placeholder?: string; required?: boolean;
  set: boolean; masked?: string;
}
interface MediaProviderState {
  id: string; label: string; configured: boolean; keys: MediaKeyField[];
  /** 留空时该引擎实际会用的模型 —— 占位提示用，主进程 MEDIA_MATRIX 给。 */
  defaultModel?: string;
}
interface MediaKindState {
  kind: string; label: string; activeProvider: string | null; activeModel?: string;
  providers: MediaProviderState[];
}

const mediaKinds = ref<MediaKindState[]>([]);
const mediaLoading = ref(false);

/**
 * 读取媒体模型配置。
 *
 * ⚠️ 失败时**不要清空已有配置**，而且要重试。
 * `mediaModel.get` 在主进程有 `ensureAuth()`：应用刚启动、登录态还在刷新时会直接抛
 * （日志里能看到 `fetchMe 失败 → accessToken 刷新成功` 这段窗口）。原来 catch 里把
 * `mediaKinds` 清成空数组、又只在 onMounted 调一次 —— 结果就是配置明明在服务端好好的，
 * 界面却认定"没配视频模型"：「生成广告视频」灰掉、「动态视频生成」灰掉、
 * 制作引擎卡片显示未配置（实测反馈"之前配置的视频生成模型丢失了"）。
 */
/** MEDIA_MODEL_CHANGED 退订函数（路由视图反复挂载，必须接住） */
let unsubMediaModelAds: (() => void) | null = null;
onUnmounted(() => { try { unsubMediaModelAds?.(); } catch { /* 已退订 */ } unsubMediaModelAds = null; });

async function loadMediaModelState(attempt = 0): Promise<void> {
  mediaLoading.value = true;
  try {
    const result = await (window as any).electronAPI?.mediaModel?.get?.();
    const kinds = Array.isArray(result?.kinds) ? result.kinds : [];
    // 只有真拿到数据才覆盖；空结果不清掉已有的（避免闪回"未配置"）
    if (kinds.length) mediaKinds.value = kinds;
    else if (!mediaKinds.value.length && attempt < 5) {
      window.setTimeout(() => { void loadMediaModelState(attempt + 1); }, 2000 * (attempt + 1));
    }
  } catch (error) {
    console.warn('[ads-media] 读取媒体模型配置失败，稍后重试', { attempt, error });
    if (attempt < 5) {
      window.setTimeout(() => { void loadMediaModelState(attempt + 1); }, 2000 * (attempt + 1));
    }
  } finally {
    mediaLoading.value = false;
  }
}

function mediaKindState(kind: string): MediaKindState | null {
  return mediaKinds.value.find((item) => item.kind === kind) || null;
}

/**
 * 当前生效的视频生成模型显示名：优先具体模型 ID，其次引擎默认模型，再次引擎名。
 * **没配置就返回空串** —— 界面上一律「有才显示」，绝不预先写死某个厂商的模型名。
 */
const videoModelLabel = computed(() => {
  const kind = mediaKindState('video');
  const active = kind?.providers.find((item) => item.id === kind.activeProvider);
  if (!active?.configured) return '';
  return String(kind?.activeModel || '').trim() || active.defaultModel || active.label;
});

const adsVideoModelStatus = computed<{ tone: 'ready' | 'partial' | 'missing'; detail: string }>(() => {
  const kind = mediaKindState('video');
  if (!kind) return { tone: 'missing', detail: i18nT('登录后可读取视频生成模型配置') };
  const active = kind.providers.find((item) => item.id === kind.activeProvider);
  if (active?.configured) {
    // 标题那行已经是「视频生成模型 · <模型名>」，右侧还有「已就绪」——
    // 这里再来一句「当前默认：豆包 Seedance」纯属重复，留空即可。
    return { tone: 'ready', detail: '' };
  }
  const ready = kind.providers.find((item) => item.configured);
  if (ready) {
    return { tone: 'partial', detail: i18nT('{p0} 已接入，还未设为默认视频生成引擎', { p0: ready.label }) };
  }
  return { tone: 'missing', detail: i18nT('未配置 —— 请选择接入引擎并填入密钥') };
});
const adsTtsStatus = computed<{ tone: 'ready' | 'partial' | 'missing'; detail: string }>(() => {
  const kind = mediaKindState('tts');
  if (!kind) return { tone: 'missing', detail: i18nT('登录后可读取当前 TTS 配置') };
  const active = kind.providers.find((item) => item.id === kind.activeProvider);
  if (active?.configured) {
    return { tone: 'ready', detail: i18nT('当前默认：{p0}', { p0: active.label }) };
  }
  const available = kind.providers.find((item) => item.configured);
  if (available) {
    return { tone: 'partial', detail: i18nT('已接入 {p0}，建议设为默认', { p0: available.label }) };
  }
  return { tone: 'missing', detail: i18nT('配置一个配音引擎后旁白才可用') };
});
/** #6 硬闸：视频剪辑模型没配置（默认引擎不可用）时，生成与后续投放流程都阻止。 */
const videoModelReady = computed(() => adsVideoModelStatus.value.tone === 'ready');

// ─── #17 成片设置（第 1 步）：成片方式 / 成片比例 / 配音与配乐 ───
/**
 * 成片方式。**不写死具体模型名** —— 视频生成引擎是可换的（Seedance / 通义万相 / 可灵…），
 * 界面上只说「动态视频生成」，具体用哪个模型由第 1 步配的那个决定，没配就不显示模型名。
 */
const ADS_VIDEO_MODES = computed<ReadonlyArray<{ id: 'slideshow' | 'dynamic'; icon: string; label: string; desc: string }>>(() => [
  { id: 'slideshow', icon: 'ri-slideshow-3-line', label: i18nT('图片成片'), desc: i18nT('素材图片一键成片（oneclick_from_folder 脚本，快、稳定）') },
  {
    id: 'dynamic',
    icon: 'ri-movie-2-line',
    label: i18nT('动态视频生成'),
    desc: videoModelLabel.value
      ? i18nT('由 {p0} 用参考图生成运镜与动态镜头', { p0: videoModelLabel.value })
      : i18nT('用参考图生成运镜与动态镜头（需先在上方配置视频生成模型）'),
  },
]);
const adsVideoMode = ref<'slideshow' | 'dynamic'>('slideshow');
const ADS_VIDEO_ASPECTS: ReadonlyArray<{ value: string; label: string; hint: string }> = [
  { value: '9:16', label: '9:16', hint: i18nT('竖屏 / Reels / Shorts') },
  { value: '4:5', label: '4:5', hint: i18nT('竖版信息流帖子') },
  { value: '16:9', label: '16:9', hint: i18nT('横屏 / 常规视频') },
  { value: '1:1', label: '1:1', hint: i18nT('方形') },
];
/** #22：成片比例多选 —— 勾几个就出几份成片。默认随第 2 步平台自动预勾。 */
const adsVideoAspects = ref<string[]>(['9:16']);
/** 用户手动动过比例后就不再跟着平台自动改，避免覆盖他的选择。 */
const aspectsTouched = ref(false);
function toggleAspect(value: string): void {
  aspectsTouched.value = true;
  const next = new Set(adsVideoAspects.value);
  if (next.has(value)) next.delete(value);
  else next.add(value);
  // 至少保留一个，否则生成时无从下手
  adsVideoAspects.value = next.size ? [...next] : [value];
}

/**
 * 各平台可接受的画幅（实测踩过：把 9:16 成片发到 Instagram **帖子**会被平台直接拒，
 * 报「doesn't fit within Instagram's accepted aspect ratio range of 4:5 to 16:9」——
 * 9:16 只有 Reels 收，普通帖必须 4:5 到 16:9 之间）。
 */
const PLATFORM_ASPECT: Record<PlatformId, { recommended: string; accepts: string[]; note: string }> = {
  instagram: { recommended: '9:16', accepts: ['9:16', '4:5', '1:1', '16:9'], note: i18nT('Reels 收 9:16；普通帖只接受 4:5 ~ 16:9') },
  // ⚠️ accepts 里**不能**有 9:16：Business Suite 的帖子编辑器发布目标是 IG 账号，
  // 实测直接拒 9:16（"doesn't fit within Instagram's accepted aspect ratio range of 4:5 to 16:9"），
  // Publish 会一直 aria-disabled。9:16 只能走 Reels 编辑器（= instagram 那条）。
  facebook: { recommended: '4:5', accepts: ['4:5', '1:1', '16:9'], note: i18nT('Feed 帖只接受 4:5 ~ 16:9；9:16 请走 Reels') },
  youtube: { recommended: '16:9', accepts: ['16:9', '9:16'], note: i18nT('常规视频 16:9；≤60 秒 9:16 自动识别为 Shorts') },
  google_ads: { recommended: '16:9', accepts: ['16:9', '1:1', '4:5'], note: i18nT('视频广告由 YouTube 承载，以 16:9 为主') },
};

/** 本次要生成的画幅集合 = 用户在「成片比例」里勾的那些（默认随平台预勾）。 */
const requiredAspects = computed<string[]>(() =>
  (adsVideoAspects.value.length ? adsVideoAspects.value : ['9:16']));

/**
 * 某个画幅对应当前勾选的哪些平台 —— 标注必须跟着实际映射走。
 * 写死「4:5 = Instagram 帖子」是错的：在本表里 4:5 是 **Facebook** 的推荐值
 * （IG 推荐 9:16 走 Reels），标错会让人以为勾了 IG 才需要 4:5。
 */
function aspectPlatformNote(aspect: string): string {
  const owners = includedPlatformDefs.value
    .filter((platform) => PLATFORM_ASPECT[platform.id]?.recommended === aspect)
    .map((platform) => platform.label);
  if (owners.length) return i18nT('{p0} 推荐', { p0: owners.join(' / ') });
  const acceptors = includedPlatformDefs.value
    .filter((platform) => (PLATFORM_ASPECT[platform.id]?.accepts || []).includes(aspect))
    .map((platform) => platform.label);
  return acceptors.length ? i18nT('{p0} 可用', { p0: acceptors.join(' / ') }) : '';
}
/**
 * 这一批成片（同一次生成导出的多个画幅）能覆盖第 2 步勾选的哪些平台。
 * 发布前就摆出来，用户不必点了才知道某个平台会被摘掉。
 */
function recordCoverage(record: AdsVideoRecord): { ok: string[]; miss: string[] } {
  const prefix = record.path.replace(/-(9x16|4x5|16x9|1x1)\.mp4$/i, '');
  const batch = adsVideoHistory.value.filter((item) =>
    item.path === record.path || (item.path.startsWith(prefix) && adsVideoVerified[item.path]));
  const ok: string[] = [];
  const miss: string[] = [];
  for (const platform of includedPlatformDefs.value) {
    if (batch.some((item) => platformAcceptsPath(platform.id, item.path))) ok.push(platform.label);
    else miss.push(platform.label);
  }
  return { ok, miss };
}

/**
 * 历史条目显示名：
 *  - 去掉名字尾部的画幅括号（如「品牌（9:16）」）—— 画幅右边已有独立徽标，重复一遍多余。
 *    老记录是把画幅拼进 projectName 存到 localStorage 的，只能在显示层剥。
 *  - 文件还没落地的（正在生成）用括号显示状态，让列表里一眼分得清哪条还没好。
 */
function adsVideoDisplayName(record: AdsVideoRecord): string {
  const base = String(record.projectName || '')
    .replace(/[（(]\s*\d+\s*[:：]\s*\d+\s*[）)]\s*$/, '')
    .trim() || i18nT('广告成片');
  return adsVideoVerified[record.path] ? base : `${base}（${i18nT('生成中')}）`;
}

/** 某条成片路径能否投给该平台（按文件名里的画幅标记判断，生成时会带上）。 */
function aspectOfPath(path: string): string {
  const match = String(path || '').match(/-(9x16|4x5|16x9|1x1)\./i);
  return match ? match[1].replace('x', ':') : '';
}
function platformAcceptsPath(platformId: PlatformId, path: string): boolean {
  const aspect = aspectOfPath(path);
  if (!aspect) return true; // 无标记的老成片不拦，交平台自己判
  return (PLATFORM_ASPECT[platformId]?.accepts || []).includes(aspect);
}
const adsVideoVoiceover = ref(true);
/**
 * 配乐情绪 —— **必须与 fetch_bgm.py 的 choices 一一对应**。
 * 之前列表里有 `cinematic` / `auto`，脚本不认，argparse 直接报 usage 退出（实测踩过）。
 */
const ADS_BGM_MOODS: ReadonlyArray<{ id: string; label: string }> = [
  { id: 'upbeat', label: i18nT('轻快活力') },
  { id: 'energetic', label: i18nT('热烈有冲击力') },
  { id: 'chill', label: i18nT('松弛治愈') },
  { id: 'emotional', label: i18nT('温暖情绪') },
  { id: 'dramatic', label: i18nT('戏剧张力（电影感）') },
  { id: 'corporate', label: i18nT('商务专业') },
  { id: 'lofi', label: i18nT('Lo-Fi 慵懒') },
];
const adsVideoBgmMood = ref('dramatic');

/**
 * 素材兜底策略（P3-6）。持久化在 localStorage：这是个「一次选定长期沿用」的偏好，
 * 每次进页面都重置回默认值会让选过的用户莫名其妙。
 */
const ADS_MATERIAL_FALLBACK_KEY = 'totalclaw:global-ads-material-fallback:v1';
const adsMaterialFallback = ref<MaterialFallbackStrategy>(
  (localStorage.getItem(ADS_MATERIAL_FALLBACK_KEY) as MaterialFallbackStrategy) || DEFAULT_MATERIAL_FALLBACK,
);
if (!isMaterialFallbackStrategy(adsMaterialFallback.value)) {
  adsMaterialFallback.value = DEFAULT_MATERIAL_FALLBACK;   // 存过脏值也要能自愈
}
watch(adsMaterialFallback, (value) => {
  try { localStorage.setItem(ADS_MATERIAL_FALLBACK_KEY, value); } catch { /* 隐私模式写不进就算了 */ }
});
const currentFallbackHint = computed(
  () => MATERIAL_FALLBACK_OPTIONS.find((o) => o.id === adsMaterialFallback.value)?.hint ?? '',
);
/**
 * 自动完成发布：注入成片后继续填文案并点「发布」，不停在人工闸门。
 * 关掉则只把素材与文案准备好，最终提交交回人工（更保守）。
 */
const ADS_AUTO_PUBLISH_KEY = 'totalclaw:global-ads-auto-publish:v1';
const adsAutoPublish = ref(localStorage.getItem(ADS_AUTO_PUBLISH_KEY) !== 'false');
watch(adsAutoPublish, (value) => {
  try { localStorage.setItem(ADS_AUTO_PUBLISH_KEY, value ? 'true' : 'false'); } catch { /* */ }
});
/** 图片成片不依赖视频生成模型；只有动态视频生成方式才被硬闸拦。 */
const adsGenerationReady = computed(() => adsVideoMode.value === 'slideshow' || videoModelReady.value);

// ── 投放向导共享步骤条（5 步与下方 .guide-step 一一对应；点选只滚动定位，不改变各步的真实就绪态） ──
const guideMainEl = ref<HTMLElement | null>(null);
const guideBarStep = ref(1);
const guideBarSteps = computed<WorkbenchStep[]>(() => [
  { id: 1, label: i18nT('配置制作引擎'), done: adsGenerationReady.value },
  { id: 2, label: i18nT('选择投放平台'), done: guideStep2Done.value },
  { id: 3, label: i18nT('准备素材'), done: guideStep3Done.value },
  { id: 4, label: i18nT('填写投放信息'), done: guideStep4Done.value },
  { id: 5, label: i18nT('一键执行投放'), done: false },
]);
function jumpGuideStep(id: number): void {
  guideBarStep.value = id;
  const el = guideMainEl.value?.querySelectorAll<HTMLElement>('.guide-step')[id - 1];
  if (el && typeof el.scrollIntoView === 'function') el.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

const mediaDialogOpen = ref(false);
const mediaDialogKind = ref<'video' | 'tts'>('video');
const mediaDialogProviderId = ref('');
const mediaDialogEnv = reactive<Record<string, string>>({});
const revealedMediaFields = reactive<Record<string, boolean>>({});
const mediaDialogModel = ref('');
const mediaDialogSaving = ref(false);
const mediaDialogError = ref('');

const mediaDialogProviders = computed(() => mediaKindState(mediaDialogKind.value)?.providers || []);
const mediaDialogProvider = computed(() =>
  mediaDialogProviders.value.find((item) => item.id === mediaDialogProviderId.value) || null);
const mediaDialogKeyFields = computed(() => mediaDialogProvider.value?.keys || []);
/**
 * 占位符必须跟着**当前选中的引擎**走。写死 seedance 的模型名会出现
 * 「引擎已切到通义万相、备注还写着 doubao-seedance-…」——用户照着填就废了。
 */
const mediaDialogModelPlaceholder = computed(() => {
  if (mediaDialogKind.value === 'tts') return i18nT('留空使用引擎默认声线');
  return mediaDialogProvider.value?.defaultModel || i18nT('留空使用引擎默认模型');
});

watch(mediaDialogProviderId, () => {
  for (const key of Object.keys(mediaDialogEnv)) delete mediaDialogEnv[key];
  const state = mediaKindState(mediaDialogKind.value);
  mediaDialogModel.value = state?.activeProvider === mediaDialogProviderId.value
    ? String(state?.activeModel || '')
    : '';
});

function openMediaDialog(kind: 'video' | 'tts'): void {
  mediaDialogKind.value = kind;
  mediaDialogError.value = '';
  for (const key of Object.keys(mediaDialogEnv)) delete mediaDialogEnv[key];
  for (const key of Object.keys(revealedMediaFields)) delete revealedMediaFields[key];
  mediaDialogProviderId.value = '';
  mediaDialogOpen.value = true;
  // 同 VideoStudioView：别处配好模型要即时反映到本页的「制作引擎」就绪闸
  try { unsubMediaModelAds = (window as any).electronAPI?.onMediaModelChanged?.(() => { void loadMediaModelState(); }); } catch { /* 无该通道则忽略 */ }
  void loadMediaModelState().then(() => {
    const state = mediaKindState(kind);
    const preferred = kind === 'video'
      ? (state?.providers.find((item) => item.id === 'seedance')?.id
        || state?.activeProvider
        || state?.providers[0]?.id
        || '')
      : (state?.activeProvider
        || state?.providers.find((item) => item.configured)?.id
        || state?.providers[0]?.id
        || '');
    mediaDialogProviderId.value = preferred;
  });
}

function closeMediaDialog(): void {
  if (mediaDialogSaving.value) return;
  mediaDialogOpen.value = false;
  mediaDialogError.value = '';
}

async function saveMediaDialog(): Promise<void> {
  const provider = mediaDialogProviderId.value;
  if (!provider) return;
  mediaDialogSaving.value = true;
  mediaDialogError.value = '';
  try {
    const env: Record<string, string> = {};
    for (const field of mediaDialogKeyFields.value) {
      const value = String(mediaDialogEnv[field.env] || '').trim();
      if (value) env[field.env] = value;
    }
    // 必填且既没保存过、本次也没填 → 明确报缺，不让保存后仍不可用
    const missing = mediaDialogKeyFields.value.filter((field) => field.required && !field.set && !env[field.env]);
    if (missing.length) {
      throw new Error(i18nT('请填写：{p0}', { p0: missing.map((field) => field.label).join(', ') }));
    }
    const target = (window as any).electronAPI;
    if (!target?.mediaModel?.save) throw new Error(i18nT('当前版本未开放媒体模型配置'));
    await target.mediaModel.save({
      kind: mediaDialogKind.value,
      provider,
      env,
      setDefault: true,
      ...(mediaDialogModel.value.trim() ? { model: mediaDialogModel.value.trim() } : {}),
    });
    await loadMediaModelState();
    // 这里存的就是「设置 → AI 模型」那份配置（同一个 mediaModel IPC / 同一份 .env + config.yaml）。
    // 广播一次，让已经打开的设置页立刻重读，不必等它重新挂载。
    window.dispatchEvent(new CustomEvent('totalclaw:media-model-changed', {
      detail: { kind: mediaDialogKind.value, provider },
    }));
    notif.success(mediaDialogKind.value === 'video'
      ? i18nT('视频生成模型已保存并设为默认')
      : i18nT('TTS 配音引擎已保存并设为默认'));
    mediaDialogOpen.value = false;
  } catch (error) {
    mediaDialogError.value = errorMessage(error);
  } finally {
    mediaDialogSaving.value = false;
  }
}

// ═══════════ 广告视频：真实生成 + 历史列表 + 发布选用（#2 / #7）═══════════
interface AdsVideoRecord { id: string; projectName: string; path: string; createdAt: number }
const ADS_VIDEO_HISTORY_KEY = 'totalclaw:global-ads-video-history:v1';

function loadAdsVideoHistoryFromStore(): AdsVideoRecord[] {
  try {
    const raw = localStorage.getItem(ADS_VIDEO_HISTORY_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed)
      ? parsed.filter((item): item is AdsVideoRecord => !!item && typeof item.path === 'string' && !!item.path)
      : [];
  } catch {
    return [];
  }
}

const adsVideoHistory = ref<AdsVideoRecord[]>(loadAdsVideoHistoryFromStore());
const adsVideoVerified = reactive<Record<string, boolean>>({});
/**
 * #32 历史分页：**永远按生成时间倒序**，所以第 1 页恒为最新。
 * 不依赖数组本身的插入顺序 —— 删除、跨会话读 localStorage 后顺序未必可靠。
 */
const ADS_VIDEO_PAGE_SIZE = 5;
const adsVideoPage = ref(1);
const adsVideoHistorySorted = computed(() =>
  [...adsVideoHistory.value].sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0)));
const adsVideoPageCount = computed(() =>
  Math.max(1, Math.ceil(adsVideoHistorySorted.value.length / ADS_VIDEO_PAGE_SIZE)));
const adsVideoPageItems = computed(() =>
  adsVideoHistorySorted.value.slice((adsVideoPage.value - 1) * ADS_VIDEO_PAGE_SIZE, adsVideoPage.value * ADS_VIDEO_PAGE_SIZE));
// 删到当前页空了就回退，别停在一个空白页
watch(adsVideoPageCount, (count) => { if (adsVideoPage.value > count) adsVideoPage.value = count; });

const adsVideoHistoryChecking = ref(false);
/** 发布时手动选中的成片；beforeAdsScenarioStart 会把它并进 assets 一起进工作流。 */
const selectedPublishVideoPath = ref('');
/**
 * 广告视频提示词（分镜）—— 第 3 步产出、第 5 步消费。
 *
 * 为什么拆开：动态视频生成需要一份「每张参考图配一句运镜提示」的分镜，
 * 这份东西用户要能**看得见、改得动**，而不是在第 5 步现场由模型临时写完就用。
 * 图片成片是确定性拼接，没有分镜可写，所以这个模块只在动态模式出现。
 */
/**
 * caption = 主字幕（跟随界面语言，同时用于 TTS 朗读）；
 * captionAr = 副字幕（阿语，只烧进画面、**不参与朗读**）。
 * 两者必须分开存：合成一个字段的话，narrationFromScenes 会把阿语也一起念出来。
 */
interface AdsPromptScene { id: string; referenceImage: string; duration: number; prompt: string; caption: string; captionAr: string }
const ADS_PROMPT_KEY = 'totalclaw:global-ads-prompt-scenes:v1';
const adsPromptScenes = ref<AdsPromptScene[]>((() => {
  try {
    const raw = JSON.parse(localStorage.getItem(ADS_PROMPT_KEY) || '[]');
    return Array.isArray(raw) ? raw.filter((x) => x && typeof x.prompt === 'string') : [];
  } catch { return []; }
})());
/**
 * 三个素材来源（多选文件 / 选文件夹 / 生成提示词）是**互斥**的：选后两者之一，
 * 提示词就不再是本轮的出片依据，选中角标和下面的分镜提示词模块都要收起来。
 * 单看 adsPromptScenes.length 不够 —— 提示词要留着（下次还能用），只是这轮不选它。
 */
const ADS_PROMPT_CHOSEN_KEY = 'totalclaw:global-ads-prompt-chosen:v1';
const adsPromptChosen = ref<boolean>((() => {
  const saved = localStorage.getItem(ADS_PROMPT_CHOSEN_KEY);
  // 没存过就沿用老行为：有提示词即视为选中
  return saved === null ? adsPromptScenes.value.length > 0 : saved === '1';
})());
watch(adsPromptChosen, (value) => {
  try { localStorage.setItem(ADS_PROMPT_CHOSEN_KEY, value ? '1' : '0'); } catch { /* */ }
});

const adsPromptGenerating = ref(false);
const adsPromptNote = ref('');

function persistAdsPromptScenes(): void {
  try { localStorage.setItem(ADS_PROMPT_KEY, JSON.stringify(adsPromptScenes.value)); } catch { /* */ }
}

/** 生成分镜提示词：一次 LLM 调用；超时或失败退化为确定性模板，不让用户卡在这一步。 */
async function generateAdsPromptScenes(): Promise<void> {
  if (adsPromptGenerating.value) return;
  const lister = (window as any).electronAPI?.solution?.listMediaDir;
  const dir = adsVideoMaterialDir.value.trim();
  if (!dir || typeof lister !== 'function') {
    adsPromptNote.value = i18nT('请先选择素材文件夹');
    return;
  }
  adsPromptGenerating.value = true;
  adsPromptNote.value = i18nT('正在读取素材并撰写分镜…');
  try {
    const listed = await lister(dir);
    const images: string[] = (listed?.files || [])
      .filter((file: AnyRecord) => file?.kind === 'image')
      .map((file: AnyRecord) => String(file.path))
      .slice(0, 6);
    if (!images.length) {
      adsPromptNote.value = i18nT('这个文件夹里没有图片素材，视频模型需要参考图作为首帧。');
      return;
    }
    const brand = creativeBrief.brandName.trim() || 'UAE Growth Campaign';
    let scenes: AdsPromptScene[] = [];
    try {
      const reply = await askLlmOnce('marketing-content-creator', [
        i18nT('为品牌「{p0}」写一条面向阿联酋市场的 15–30 秒广告分镜，3 个场景。', { p0: brand }),
        creativeBrief.arabicHeadline.trim() ? i18nT('阿语广告标题：{p0}', { p0: creativeBrief.arabicHeadline.trim() }) : '',
        adsVideoBrief.value.trim(),
        i18nT('可用的首帧参考图（按顺序分配，一个场景一张）：') + '\n' + images.map((path: string, i: number) => `${i + 1}. ${path}`).join('\n'),
        // 运镜 prompt 必须是英文（视频模型只吃英文），但字幕是给人看/给 TTS 念的，跟随界面语言。
        // 原来写死「中英/阿语」，界面切成别的语言时字幕和旁白都对不上。
        // 这是阿联酋市场的投放物料：主讲与主字幕跟随界面语言，阿语作为副字幕固定保留。
        // 运镜 prompt 必须英文（视频模型只吃英文）。
        i18nT('每个场景给三样：① 运镜与画面变化的英文 prompt（要有明确的镜头运动，不要只"轻微动"）；② 一句{p0}主字幕（会同时用于配音朗读）；③ 同一句话的阿拉伯语副字幕。', { p0: copyLanguage().label }),
        i18nT('只输出 JSON，不要解释、不要代码块。格式：')
          + ' {"scenes":[{"reference_image":"上面列出的绝对路径","duration":5,"prompt":"camera move…","caption":"主字幕","caption_ar":"阿语副字幕"}]}',
        i18nT('严禁编造价格、优惠、功效或上下文里没有的事实。'),
      ].filter(Boolean).join('\n'), 40_000);
      const parsed = extractJsonObject(reply);
      scenes = (Array.isArray(parsed?.scenes) ? parsed.scenes : []).slice(0, 4)
        .map((scene: AnyRecord, index: number) => ({
          id: `0${index + 1}`,
          referenceImage: images.includes(String(scene?.reference_image)) ? String(scene.reference_image) : images[index % images.length],
          duration: Number(scene?.duration) > 0 ? Math.min(10, Number(scene.duration)) : 5,
          prompt: String(scene?.prompt || '').trim(),
          caption: String(scene?.caption || '').trim(),
          captionAr: String(scene?.caption_ar || '').trim(),
        }))
        .filter((scene: AdsPromptScene) => scene.prompt);
      adsPromptNote.value = scenes.length ? i18nT('已按素材生成分镜提示词，可逐条修改。') : '';
    } catch (error) {
      adsPromptNote.value = i18nT('模型未按时返回，已按参考图顺序生成基础提示词，可自行修改：{p0}', { p0: errorMessage(error) });
    }
    if (!scenes.length) {
      // 确定性兜底：一图一镜、运镜模板轮换、字幕只用已填内容，不编事实
      const moves = [
        'slow push in, cinematic lighting, subtle parallax',
        'slow pan right, shallow depth of field, natural light',
        'gentle pull back revealing the scene, cinematic grade',
        'slow tilt up, soft highlights, premium look',
      ];
      const caption = creativeBrief.arabicHeadline.trim() || brand;
      scenes = images.slice(0, 3).map((image: string, index: number) => ({
        id: `0${index + 1}`,
        referenceImage: image,
        duration: 5,
        prompt: moves[index % moves.length],
        caption: index === 0 ? caption : '',
        // 兜底只用用户填过的内容，没有可用的阿语副字幕就留空（不编）
        captionAr: index === 0 ? creativeBrief.arabicHeadline.trim() : '',
      }));
    }
    adsPromptScenes.value = scenes;
    persistAdsPromptScenes();
  } catch (error) {
    adsPromptNote.value = errorMessage(error);
  } finally {
    adsPromptGenerating.value = false;
  }
}

async function saveAdsPromptScenes(): Promise<void> {
  adsPromptScenes.value = adsPromptScenes.value
    .map((scene) => ({ ...scene, prompt: scene.prompt.trim(), caption: scene.caption.trim(), captionAr: (scene.captionAr || '').trim() }))
    .filter((scene) => scene.prompt);
  persistAdsPromptScenes();
  adsPromptChosen.value = adsPromptScenes.value.length > 0;
  /**
   * 弹层里已经选了素材文件夹，保存时**顺手把素材载进来** ——
   * 否则用户还得再去点一次「选择素材文件夹」，第 3 步才显示素材已就绪（实测反馈）。
   */
  const dir = adsVideoMaterialDir.value.trim();
  const lister = (window as any).electronAPI?.solution?.listMediaDir;
  if (dir && typeof lister === 'function' && !creativeAssets.value.length) {
    try {
      const listed = await lister(dir);
      if (listed?.ok && Array.isArray(listed.files) && listed.files.length) applyScannedAssets(listed);
    } catch (error) {
      console.warn('[ads-assets] 保存提示词时载入素材失败（不影响提示词已保存）', error);
    }
  }
  adsVideoDialogOpen.value = false;
  notif.success(i18nT('已保存 {p0} 个分镜提示词；第 5 步将按它出片', { p0: adsPromptScenes.value.length }));
}

const adsVideoDialogOpen = ref(false);
const adsVideoGenerating = ref(false);
/** 素材目录持久化：重启后据此扫「广告成片」子目录，历史列表能自愈 */
const ADS_MATERIAL_DIR_KEY = 'totalclaw:global-ads-material-dir:v1';
const adsVideoMaterialDir = ref(localStorage.getItem(ADS_MATERIAL_DIR_KEY) || '');
watch(adsVideoMaterialDir, (value) => {
  try { localStorage.setItem(ADS_MATERIAL_DIR_KEY, value || ''); } catch { /* */ }
});
/**
 * 创意简报默认文案 —— **跟着第 1 步的设置走**，不写死画幅。
 * 之前固定写「9:16 竖版」，而第 1 步早就是多选画幅了（勾了哪些平台就出哪些），
 * 简报和实际要出的画幅对不上，模型会照着简报只按 9:16 构图。
 */
function buildAdsVideoBrief(): string {
  const aspects = requiredAspects.value.join(' / ');
  const mode = adsVideoMode.value === 'slideshow'
    ? i18nT('图片成片')
    : (videoModelLabel.value || i18nT('动态视频生成'));
  const voice = adsVideoVoiceover.value
    ? i18nT('阿英双语字幕 + TTS 旁白')
    : i18nT('阿英双语字幕（不加 AI 旁白，保留素材原声）');
  return i18nT('制作一条 15–30 秒 UAE 广告视频（画幅：{p0}；成片方式：{p1}）：阿语 RTL 标题 + {p2}；突出品牌核心卖点与明确的行动引导；只使用素材内可核验的事实。', {
    p0: aspects, p1: mode, p2: voice,
  });
}
const adsVideoBrief = ref('');
/** 用户没改过就跟着第 1 步刷新；改过之后不再覆盖他写的内容。 */
const adsVideoBriefTouched = ref(false);
watch(adsVideoBrief, (value) => {
  if (value && value !== buildAdsVideoBrief()) adsVideoBriefTouched.value = true;
});
const adsVideoPreviewOpen = ref(false);
const adsVideoPreviewLoading = ref(false);
const adsVideoPreviewSrc = ref('');
const adsVideoPreviewPath = ref('');

function persistAdsVideoHistory(): void {
  try { localStorage.setItem(ADS_VIDEO_HISTORY_KEY, JSON.stringify(adsVideoHistory.value)); } catch { /* */ }
}

function formatAdsVideoTime(ts: number): string {
  const date = new Date(ts);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

/**
 * 从磁盘发现成片并并入历史。
 *
 * 历史索引原本只存在 localStorage 里 —— 清一次缓存、换台机器，磁盘上明明有成片，
 * 列表却是空的（实测：8 条成片在「广告成片」目录里，列表显示"还没有生成过"）。
 * 这里扫一遍成片目录，把不在索引里的补进去，让列表能自愈。
 */
async function discoverAdsVideosFromDisk(): Promise<void> {
  const dir = adsVideoMaterialDir.value.trim();
  const lister = (window as any).electronAPI?.solution?.listMediaDir;
  if (!dir || typeof lister !== 'function') return;
  const sep = dir.includes('\\') ? '\\' : '/';
  const outDir = `${dir.replace(/[\\/]+$/, '')}${sep}${i18nT('广告成片')}`;
  try {
    const listed = await lister(outDir);
    if (!listed?.ok || !Array.isArray(listed.files)) return;
    const known = new Set(adsVideoHistory.value.map((item) => item.path));
    const found = listed.files
      .filter((file: AnyRecord) => file?.kind === 'video' && !known.has(String(file.path)))
      .map((file: AnyRecord, index: number) => ({
        id: `disk-${Number(file.mtimeMs) || Date.now()}-${index}`,
        projectName: creativeBrief.brandName.trim() || String(file.name).replace(/\.[^.]+$/, ''),
        path: String(file.path),
        createdAt: Number(file.mtimeMs) || Date.now(),
      }));
    if (!found.length) return;
    adsVideoHistory.value = [...found, ...adsVideoHistory.value]
      .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0))
      .slice(0, 200);
    persistAdsVideoHistory();
  } catch (error) {
    console.warn('[ads-video] 扫描成片目录失败（不影响已有历史）', error);
  }
}

async function refreshAdsVideoHistory(): Promise<void> {
  if (adsVideoHistoryChecking.value) return;
  adsVideoHistoryChecking.value = true;
  try {
    await discoverAdsVideosFromDisk();
    for (const record of adsVideoHistory.value) {
      try {
        const result = await (window as any).electronAPI?.solution?.inspectMedia?.(record.path);
        adsVideoVerified[record.path] = result?.ok === true;
      } catch {
        adsVideoVerified[record.path] = false;
      }
    }
    // 选中的成片被删了 → 撤销选择，别把死路径带进发布流程
    if (selectedPublishVideoPath.value && !adsVideoVerified[selectedPublishVideoPath.value]) {
      selectedPublishVideoPath.value = '';
    }
  } finally {
    adsVideoHistoryChecking.value = false;
  }
}

function openAdsVideoDialog(): void {
  // 图片成片方式不依赖视频生成模型；只有动态视频生成方式才要求模型就绪
  if (!adsGenerationReady.value) {
    notif.warn(i18nT('请先配置视频生成模型，再生成广告视频'));
    openMediaDialog('video');
    return;
  }
  if (!adsVideoBriefTouched.value) adsVideoBrief.value = buildAdsVideoBrief();
  adsVideoDialogOpen.value = true;
}

/**
 * 选择素材文件夹（**原生**选择器）。
 *
 * 原来这里点的是 `<input webkitdirectory>`：浏览器只给 `<文件夹名>/<文件名>` 这种相对路径，
 * 拿不到绝对路径。而生成脚本跑在子进程、发布注入走主进程，两边都只认绝对路径 ——
 * 于是出现「明明在第 3 步选了 34 个素材，第 5 步却说没选素材文件夹 / 文件读不到」。
 * 改走原生选择器：一次选定，素材目录（绝对路径）与素材清单一起拿到。
 * 「多选素材文件」那个入口保持不变（浏览器控件能出缩略图）。
 */
const creativeFolderScanning = ref(false);
/** 素材列表一次最多渲染多少条（几百个素材全画出来会拖慢整页） */
const creativeListLimit = ref(8);

/** 移除单个素材：扫整目录时难免混进用不上的东西。 */
function removeCreativeAsset(target: CreativeAsset): void {
  const key = target.absolutePath || target.relativePath || target.name;
  const next = creativeAssets.value.filter((item) =>
    (item.absolutePath || item.relativePath || item.name) !== key);
  // 撤销的是预览图所属那条时，把 blob 释放掉，别泄漏
  if (target.previewUrl && target.previewUrl.startsWith('blob:')) {
    try { URL.revokeObjectURL(target.previewUrl); } catch { /* */ }
  }
  creativeAssets.value = next;
  if (!next.length) creativeError.value = '';
}
async function pickCreativeFolderNative(): Promise<void> {
  adsPromptChosen.value = false;
  if (creativeFolderScanning.value) return;
  const target = (window as any).electronAPI?.solution;
  if (typeof target?.pickFolder !== 'function' || typeof target?.listMediaDir !== 'function') {
    // 老版本没有目录扫描通道 —— 退回浏览器控件，至少功能可用
    creativeFolderInput.value?.click();
    return;
  }
  try {
    const dir = await target.pickFolder({ title: i18nT('选择素材文件夹') });
    console.info('[ads-assets] 选择素材文件夹', { dir });
    if (!dir) return; // 用户取消
    creativeFolderScanning.value = true;
    const listed = await target.listMediaDir(String(dir));
    console.info('[ads-assets] 扫描结果', { ok: listed?.ok, count: listed?.files?.length, error: listed?.error });
    if (!listed?.ok) {
      creativeError.value = listed?.error || i18nT('读取素材文件夹失败');
      return;
    }
    if (!Array.isArray(listed.files) || !listed.files.length) {
      creativeError.value = i18nT('这个文件夹里没有找到可用的图片或视频素材。');
      return;
    }
    applyScannedAssets(listed);
    adsVideoMaterialDir.value = String(listed.dir || dir);
    creativeError.value = '';
    console.info('[ads-assets] 已载入素材', { count: creativeAssets.value.length, dir: adsVideoMaterialDir.value });
    notif.success(i18nT('已载入 {p0} 个素材', { p0: creativeAssets.value.length }));
  } catch (error) {
    console.error('[ads-assets] 读取素材文件夹失败', error);
    creativeError.value = errorMessage(error);
    notif.fromException(i18nT('读取素材文件夹失败'), error);
  } finally {
    creativeFolderScanning.value = false;
  }
}

/** 把 listMediaDir 的结果填进 creativeAssets（原生扫描与「保存提示词」共用）。 */
function applyScannedAssets(listed: AnyRecord): void {
    releaseCreativePreviews();
    // 主进程给的首图缩略图（nativeImage 缩到 96px）——挂给第一张图片，摘要卡才有预览
    const thumb = String(listed.thumbDataUrl || '');
    let thumbUsed = false;
    creativeAssets.value = listed.files.map((file: AnyRecord) => {
      const isImage = file.kind !== 'video';
      const useThumb = isImage && !thumbUsed && !!thumb;
      if (useThumb) thumbUsed = true;
      return {
      name: String(file.name),
      size: Number(file.size) || 0,
      type: String(file.type || ''),
      kind: isImage ? ('image' as const) : ('video' as const),
      previewUrl: useThumb ? thumb : '',
      previewDataUrl: useThumb ? thumb : '',
      relativePath: String(file.path),
      // 绝对路径是关键：生成与发布都靠它
      absolutePath: String(file.path),
      };
    });
}

async function pickAdsVideoMaterialDir(): Promise<void> {
  try {
    const path = await (window as any).electronAPI?.solution?.pickFolder?.();
    if (path) adsVideoMaterialDir.value = path;
  } catch (error) {
    notif.fromException(i18nT('选择素材文件夹失败'), error);
  }
}


function chooseAdsPublishVideo(record: AdsVideoRecord): void {
  selectedPublishVideoPath.value = selectedPublishVideoPath.value === record.path ? '' : record.path;
}

// injectMetaUpload / completeYouTubeWizard 已抽到 composables/overseasPublish.ts（与慈善活动内容工场共用），这里改走 runOverseasPublish()。

// ─── #14 一键发布：对勾选的 web 平台直接跑真实发布驱动（测试发布链路）───


// ─── #28 发布运行状态：按平台逐条推进，做成和工作流「实时执行记录」一样的可视进度 ───


/**
 * 各平台的发布步骤骨架：路径不同（外部 Chrome vs 内置浏览器 vs API 驱动），步骤也不同。
 * 「挑选成片画幅」这一步是广告工作台特有的（同一次生成有多个宽高比变体，要按平台挑对应
 * 的那份），composable 里的 overseasPublishStepsFor 不含它，这里统一补在最前面。
 */
function publishStepsFor(platformId: PlatformId): PublishStep[] {
  return [
    { key: 'pick', label: i18nT('按平台挑选成片画幅'), state: 'pending' },
    ...overseasPublishStepsFor(platformId as OverseasPlatformId),
  ];
}

/** 把某一步推到指定状态，并触发本页运行面板的响应式刷新 + 落盘（算法本体在 composables/overseasPublish.ts，两个工作台共用）。 */
function markPublishStep(run: PublishRun, key: string, state: PublishStepState): void {
  markOverseasPublishStep(run, key, state);
  // 触发深层数组的响应式刷新
  adsPublishRuns.value = [...adsPublishRuns.value];
  persistAdsRunState();
}

/** 结束一条平台运行，并触发本页运行面板的响应式刷新（算法本体同上，两个工作台共用）。 */
function finishPublishRun(run: PublishRun, ok: boolean, status: string, detail: string): void {
  finishOverseasPublishRun(run, ok, status, detail);
  adsPublishRuns.value = [...adsPublishRuns.value];
}

/**
 * 节点耗时文案：跑着报「已用 Xs / 预计 Ys」，没跑报「预计 Ys」。
 * 预估值按实测标定（27 张图单画幅 oneclick ≈ 40s），不是拍脑袋的数字；
 * 视频模型那条是网络任务，按每画幅 3 分钟估，实际以进度为准。
 */
function genNodeEtaLabel(node: GenNode): string {
  const fmt = (sec: number): string => (sec >= 60
    ? i18nT('{p0} 分 {p1} 秒', { p0: Math.floor(sec / 60), p1: sec % 60 })
    : i18nT('{p0} 秒', { p0: sec }));
  const eta = Number(node.etaSec) > 0 ? fmt(Number(node.etaSec)) : '';
  if (node.state === 'running' && node.startedAt) {
    // 「现在」来自看门狗的秒表：从节点真实开始时刻算，换 tab / 重挂载回来也不会归零
    const used = Math.max(0, Math.round((adsGenWatchdog.now.value - node.startedAt) / 1000));
    if (adsGenWatchdog.suspect.value) return i18nT('已用 {p0} · 可能已超时', { p0: fmt(used) });
    if (!eta) return i18nT('已用 {p0}', { p0: fmt(used) });
    // 超出预估就明说，别一直挂着「预计 25 秒」让人以为马上好（实测跑到 1 分 35 秒还显示预计 25 秒）
    const over = used - Number(node.etaSec);
    if (over > 5) {
      const since = adsGenWatchdog.sinceHeartbeatSec.value;
      // 进度还在到就把这个事实摆出来：用户要能分清「慢」和「死」
      return since != null && since < 120
        ? i18nT('已用 {p0} · 已超预计 {p1} · 仍在生成（{p2} 前有进度）', { p0: fmt(used), p1: fmt(over), p2: fmt(since) })
        : i18nT('已用 {p0} · 已超预计 {p1}', { p0: fmt(used), p1: fmt(over) });
    }
    return i18nT('已用 {p0} · 预计 {p1}', { p0: fmt(used), p1: eta });
  }
  if (node.state === 'done') return '';
  return eta ? i18nT('预计 {p0}', { p0: eta }) : '';
}

/** 多画幅批次进度（{done,total}）；单画幅时为 null，不占版面 */
const adsGenBatch = ref<{ done: number; total: number } | null>(null);
/** 当前在跑的生成节点（任何时刻最多一个） */
const adsGenRunningNode = computed(() => adsGenNodes.value.find((node) => node.state === 'running') || null);
/**
 * 生成阶段的看门狗：秒表从节点真实开始时刻走；跑过 max(预计×3, 预计+5min) 或按类型
 * 的无进度上限（视频 10 分钟）没收到进度就判「可能已超时」。进度时刻与「继续等待」时刻
 * 都落在模块级 adsRunState 里，换页回来判定不变。
 */
const adsGenWatchdog = useStepWatchdog({
  running: () => adsGenActive.value && !!adsGenRunningNode.value,
  startedAt: () => adsGenRunningNode.value?.startedAt,
  estimateMs: () => (Number(adsGenRunningNode.value?.etaSec) > 0 ? Number(adsGenRunningNode.value!.etaSec) * 1000 : null),
  kind: () => adsGenRunningNode.value?.kind || 'generic',
  lastProgressAt: () => adsGenProgressAt.value || null,
  waitExtendedAt: () => adsGenWaitExtendedAt.value || null,
  onHeartbeat: (at) => { adsGenProgressAt.value = at; },
  onKeepWaiting: (at) => { adsGenWaitExtendedAt.value = at; },
});
/** 主进程推来一次进度 = 一次心跳 */
function adsGenHeartbeat(): void {
  adsGenWatchdog.heartbeat();
}
/** 开跑前预检没过的原因（素材目录没图片之类）；开新一轮时清空 */
const adsPreflightError = ref('');
/** 「重新生成」正在取消旧任务 → 再起新任务的那一小段 */
const adsGenRestarting = ref(false);
/**
 * 生成面板的告警卡：失败 / 可能已超时 / 上次运行已中断，三选一。
 * 发布阶段有自己的「重试未完成的平台」，不在这里重复。
 */
const adsGenAlert = computed<{ state: 'failed' | 'suspect' | 'interrupted'; message: string } | null>(() => {
  if (adsGenActive.value) {
    return adsGenWatchdog.suspect.value ? { state: 'suspect', message: '' } : null;
  }
  const failed = adsGenNodes.value.some((node) => node.state === 'failed');
  if (!failed) return null;
  if (adsRunInterrupted.value && !adsPublishRuns.value.length) {
    return { state: 'interrupted', message: adsGenMessage.value };
  }
  return { state: 'failed', message: adsGenMessage.value || i18nT('成片生成失败') };
});
onBeforeUnmount(() => {
  window.removeEventListener('totalclaw:media-model-changed', onMediaModelChangedElsewhere);
});

/** 等一个条件成立（轮询 200ms），超时返回 false。 */
function waitUntil(predicate: () => boolean, timeoutMs: number): Promise<boolean> {
  return new Promise((resolve) => {
    const startedAt = Date.now();
    const timer = window.setInterval(() => {
      if (predicate()) { window.clearInterval(timer); resolve(true); return; }
      if (Date.now() - startedAt >= timeoutMs) { window.clearInterval(timer); resolve(false); }
    }, 200);
  });
}

/**
 * 「重新生成」：还在跑（可能已超时）就先取消旧任务，等它真的退出再起新一轮，
 * 不堆僵尸子进程。旧任务 20 秒内还不退出就不硬起（主进程只允许一轮 slideshow）。
 */
async function regenerateAdsVideo(): Promise<void> {
  if (adsGenRestarting.value || adsPublishBusyId.value) return;
  adsGenRestarting.value = true;
  try {
    if (adsGenActive.value) {
      await cancelAdsGeneration();
      const stopped = await waitUntil(() => !adsGenActive.value, 20_000);
      if (!stopped) {
        notif.warn(i18nT('旧任务还没有退出，暂时无法重新生成；请稍后再试或重启应用。'));
        return;
      }
    }
    await startInlineAdsPublish();
  } finally {
    adsGenRestarting.value = false;
  }
}

/** 预检失败的专用信号：不是生成失败，是根本没开始 */
class AdsPreflightError extends Error {
  preflight = true as const;
}
/**
 * 开跑前能在本地可靠判断的前置条件。
 * 图片成片：素材目录必须能读、且至少有一张图片 —— 否则脚本会在起步就报
 * 「素材目录里没找到图片」，没必要先把 4 个节点摆出来再失败。
 * 动态模式没有保存分镜时同样需要图片做首帧参考图。
 */
async function preflightAdsGeneration(dir: string): Promise<void> {
  const lister = (window as any).electronAPI?.solution?.listMediaDir;
  if (typeof lister !== 'function') return; // 老版本没有扫描通道：交给脚本自己报错
  if (adsVideoMode.value === 'dynamic') {
    const savedScenes = adsPromptChosen.value
      && adsPromptScenes.value.some((scene) => scene.prompt.trim() && scene.referenceImage);
    const loadedImages = creativeAssets.value.some((item) => item.kind === 'image' && item.absolutePath);
    // 分镜自带参考图绝对路径 / 素材已载入内存：都不依赖目录扫描
    if (savedScenes || loadedImages) return;
  }
  let listed: AnyRecord | null = null;
  try { listed = await lister(dir); } catch (error) {
    throw new AdsPreflightError(i18nT('素材文件夹读取失败：{p0}', { p0: errorMessage(error) }));
  }
  if (!listed?.ok) {
    throw new AdsPreflightError(listed?.error
      ? i18nT('素材文件夹读取失败：{p0}', { p0: String(listed.error) })
      : i18nT('素材文件夹读不到（可能已被移动或删除）：{p0}', { p0: dir }));
  }
  const images = (Array.isArray(listed.files) ? listed.files : []).filter((file: AnyRecord) => file?.kind === 'image');
  if (!images.length) {
    throw new AdsPreflightError(adsVideoMode.value === 'slideshow'
      ? i18nT('素材文件夹里没有图片（jpg/png/webp/heic…），图片成片无法开始：{p0}。请在第 3 步换一个含图片的文件夹。', { p0: dir })
      : i18nT('素材文件夹里没有图片，动态视频生成需要图片作为首帧参考图：{p0}。请在第 3 步换一个含图片的文件夹，或先生成分镜提示词。', { p0: dir }));
  }
}

/** 这条平台此刻在做什么：跑着就报当前步骤，结束了就报终态。 */
function currentRunStepLabel(run: PublishRun): string {
  if (run.state === 'running') {
    const step = (Array.isArray(run.steps) ? run.steps : []).find((item) => item.state === 'running');
    return step ? i18nT(step.label) : i18nT('执行中…');
  }
  if (run.state === 'done') return run.status || i18nT('已完成');
  if (run.state === 'failed') return run.status || i18nT('未完成');
  return i18nT('待执行');
}

/** 中断 / 失败、可重试的平台数 */
const adsFailedRunCount = computed(() => adsPublishRuns.value.filter((run) => run.state === 'failed').length);

const adsPublishProgress = computed(() => {
  const runs = adsPublishRuns.value;
  // 防御性取值：渲染函数里抛一次异常，整页交互都会被打断（实测踩过），字段一律兜底
  const stepsOf = (run: PublishRun): PublishStep[] => (Array.isArray(run?.steps) ? run.steps : []);
  const total = runs.reduce((sum, run) => sum + stepsOf(run).length, 0);
  const done = runs.reduce(
    (sum, run) => sum + stepsOf(run).filter((step) => step.state === 'done' || step.state === 'failed' || step.state === 'skipped').length,
    0,
  );
  return {
    total,
    done,
    percent: total ? Math.round((done / total) * 100) : 0,
    platformsDone: runs.filter((run) => run.state === 'done' || run.state === 'failed').length,
    platforms: runs.length,
  };
});

/**
 * 一键发布：按平台把「这一批成片」里画幅合适的那份发出去。
 *
 * 画幅是硬约束（实测：把 9:16 发进 Business Suite 帖子编辑器会被平台直接拒），
 * 所以入口先做一次**可行性体检** —— 这批成片里没有任何一份是某平台收得下的，
 * 就把该平台在第 2 步的勾选自动摘掉并说明原因，而不是照发一遍再收一条 blocked 回执。
 *
 * google_ads 无自然发布（付费视频广告由 YouTube 承载）→ 明确跳过说明，不伪造。
 */
async function publishHistoryVideo(record: AdsVideoRecord): Promise<void> {
  if (adsPublishBusyId.value) return;
  // 静默 return 会表现为「点了没反应」，一定要给出原因
  if (!adsVideoVerified[record.path]) {
    notif.warn(i18nT('这条成片的文件当前读不到（可能已被移动或删除）：{p0}', { p0: record.path }));
    return;
  }
  const target = api();
  if (!target || typeof target.publish !== 'function') {
    notif.warn(i18nT('当前版本未开放广告内容发布'));
    return;
  }
  selectedPublishVideoPath.value = record.path;

  /**
   * 候选只取**同一批次**（同一次生成导出的多个画幅，内容一致只是重构图）。
   * 不回落到「全历史里随便找一条该平台收得下的」—— 那会把用户没点的、内容不同的
   * 旧成片发出去，比阻断危险得多。
   */
  const batchPrefix = record.path.replace(/-(9x16|4x5|16x9|1x1)\.mp4$/i, '');
  const batch = adsVideoHistory.value.filter((item) =>
    item.path === record.path || (item.path.startsWith(batchPrefix) && adsVideoVerified[item.path]));
  const pickForPlatform = (platformId: PlatformId): AdsVideoRecord | null => {
    const conf = PLATFORM_ASPECT[platformId];
    // 优先推荐画幅。**不能只判断「当前这条在 accepts 里就用它」** —— 一次生成了
    // 9:16/4:5/16:9 三份时，FB 会拿着点击时那条 9:16 去发，而不是挑它推荐的 4:5
    // （实测因此被平台拒、Publish 恒禁用）。
    const preferred = batch.find((item) => aspectOfPath(item.path) === conf?.recommended);
    if (preferred) return preferred;
    return batch.find((item) => platformAcceptsPath(platformId, item.path)) || null;
  };

  // ① 可行性体检：这批画幅发不了的平台，直接从第 2 步的勾选里摘掉
  const eligible: Array<{ platform: typeof PLATFORM_DEFS[number]; video: AdsVideoRecord }> = [];
  const dropped: string[] = [];
  for (const platform of includedPlatformDefs.value) {
    const video = pickForPlatform(platform.id);
    if (video) eligible.push({ platform, video });
    else dropped.push(platform.label);
  }
  if (dropped.length) {
    const next = new Set(excludedRunPlatforms.value);
    for (const platform of includedPlatformDefs.value) {
      if (dropped.includes(platform.label)) next.add(platform.id);
    }
    excludedRunPlatforms.value = next;
    notif.warn(i18nT('这批成片的画幅（{p0}）不适用于 {p1}，已在第 2 步取消勾选。需要投这些平台请在「成片比例」里补勾对应画幅后重新生成。', {
      p0: [...new Set(batch.map((item) => aspectOfPath(item.path)).filter(Boolean))].join(' / ') || i18nT('未知'),
      p1: dropped.join(' / '),
    }));
  }
  if (!eligible.length) {
    notif.warn(i18nT('没有平台能接受这批成片的画幅，未执行发布。'));
    return;
  }

  // ② 建运行清单（先全量渲染出来，用户一眼看到这次要发几个平台、各自发哪一份）
  adsPublishBusyId.value = record.id;
  adsPublishRuns.value = eligible.map(({ platform, video }) => ({
    platformId: platform.id,
    platform: platform.label,
    icon: platform.icon,
    color: platform.color,
    file: video.path.split(/[\\/]/).pop() || video.path,
    // 重试要按这条绝对路径重新发，只留文件名是不够的
    filePath: video.path,
    aspect: aspectOfPath(video.path) || i18nT('未标注'),
    steps: publishStepsFor(platform.id),
    state: 'pending',
    status: 'pending',
    detail: '',
  }));

  try {
    for (let index = 0; index < eligible.length; index += 1) {
      const { platform, video: publishRecord } = eligible[index];
      const run = adsPublishRuns.value[index];
      await runOnePlatformPublish(run, platform, publishRecord);
    }
  } finally {
    adsPublishBusyId.value = '';
    persistAdsRunState();
  }
}

/**
 * 跑单个平台的发布 —— 首轮循环与「重试」共用这一段，避免两处逻辑漂移。
 *
 * 三条路径的真实驱动（YouTube 上传向导 / Meta CDP 注入 / API 驱动）与运行态机都在
 * composables/overseasPublish.ts（与慈善活动内容工场共用）；这里只管拼「广告工作台
 * 专属的入参」——文案怎么拼、YouTube 向导 LLM 要看到的投放背景是什么。
 */
async function runOnePlatformPublish(
  run: PublishRun,
  platform: typeof PLATFORM_DEFS[number],
  publishRecord: AdsVideoRecord,
): Promise<void> {
  const target = api();
  if (!target || typeof target.publish !== 'function') {
    finishPublishRun(run, false, 'blocked', i18nT('当前版本未开放广告内容发布'));
    return;
  }
  // YouTube 上传向导要交给 LLM 的发布背景：投放品牌 / 阿语标题 / 话题 / 目标市场，
  // 这些都是广告工作台专属的东西，composable 不替你编，只能在这里拼好再传进去。
  const youtubeTopics = String(platformTopics.youtube || '').trim();
  const arabicHeadline = creativeBrief.arabicHeadline.trim();
  const contextBrief = [
    i18nT('品牌 / 产品：{p0}', { p0: creativeBrief.brandName.trim() || publishRecord.projectName }),
    arabicHeadline ? i18nT('阿语广告标题：{p0}', { p0: arabicHeadline }) : '',
    youtubeTopics ? i18nT('话题：{p0}', { p0: youtubeTopics }) : '',
    i18nT('目标市场：阿联酋（UAE），受众为一般成年消费者。'),
    i18nT('上面没给到的字段就别自己编：没有话题就不要加话题标签，没有阿语标题就只用中英文写。'),
  ].filter(Boolean).join('\n');
  await runOverseasPublish(run, {
    platform: platform.id,
    videoPath: publishRecord.path,
    title: publishRecord.projectName,
    caption: [creativeBrief.arabicHeadline, platformTopics[platform.id] || ''].filter(Boolean).join('\n'),
    hashtags: String(platformTopics[platform.id] || '').split(/[\s,，]+/).filter(Boolean),
    tenantId: campaign.tenantId.trim() || 'tenant-uae-demo',
    autoPublish: adsAutoPublish.value,
    contextBrief,
  }, () => {
    // composable 每次内部状态变化都会回调一次：原来 markPublishStep 每步都落盘、
    // finishPublishRun 只重刷不落盘，这里统一落盘——多写几次账户态 JSON 不影响正确性，
    // 换回两个回调反而让调用方多背一层状态，不值当。
    adsPublishRuns.value = [...adsPublishRuns.value];
    persistAdsRunState();
  });
}

/**
 * 重试未完成的平台。
 *
 * 中断 / 失败的那几条按各自记录的成片路径重新跑，已成功的**不动**
 * （重发会在平台侧堆出重复内容）。找不到当时那条成片就如实标出来。
 */
async function retryFailedPublishRuns(platformId?: string): Promise<void> {
  if (adsPublishBusyId.value || adsGenActive.value) return;
  const targets = adsPublishRuns.value.filter((run) =>
    run.state === 'failed' && (!platformId || run.platformId === platformId));
  if (!targets.length) return;
  adsRunInterrupted.value = false;
  adsPublishBusyId.value = `retry-${Date.now()}`;
  try {
    for (const run of targets) {
      const platform = PLATFORM_DEFS.find((item) => item.id === run.platformId);
      const path = String(run.filePath || '');
      if (!platform || !path) {
        finishPublishRun(run, false, 'blocked', i18nT('这条运行记录缺少成片路径，无法重试；请重新选择成片后执行。'));
        continue;
      }
      const check = await (window as any).electronAPI?.solution?.inspectMedia?.(path);
      if (check?.ok !== true) {
        finishPublishRun(run, false, 'blocked',
          i18nT('这条成片的文件当前读不到（可能已被移动或删除）：{p0}', { p0: path }));
        continue;
      }
      adsVideoVerified[path] = true;
      // 重置这条的步骤，重新从头点亮
      run.steps = publishStepsFor(platform.id);
      run.state = 'pending';
      run.status = 'pending';
      run.detail = '';
      adsPublishRuns.value = [...adsPublishRuns.value];
      await runOnePlatformPublish(run, platform, {
        id: `retry-${platform.id}`,
        projectName: creativeBrief.brandName.trim() || platform.label,
        path,
        createdAt: Date.now(),
      });
    }
  } finally {
    adsPublishBusyId.value = '';
    persistAdsRunState();
  }
}

function removeAdsVideoRecord(id: string): void {
  const removed = adsVideoHistory.value.find((item) => item.id === id);
  adsVideoHistory.value = adsVideoHistory.value.filter((item) => item.id !== id);
  persistAdsVideoHistory();
  if (removed && selectedPublishVideoPath.value === removed.path) selectedPublishVideoPath.value = '';
}

async function previewAdsVideo(record: AdsVideoRecord): Promise<void> {
  adsVideoPreviewOpen.value = true;
  adsVideoPreviewLoading.value = true;
  adsVideoPreviewSrc.value = '';
  adsVideoPreviewPath.value = record.path;
  try {
    const result = await (window as any).electronAPI?.solution?.previewMedia?.(record.path);
    const source = result?.srcUrl || result?.dataUrl;
    if (!result?.ok || !source) throw new Error(result?.error || i18nT('无法读取成片'));
    adsVideoPreviewSrc.value = source;
    adsVideoPreviewPath.value = result.path || record.path;
  } catch (error) {
    notif.fromException(i18nT('成片预览失败'), error);
  } finally {
    adsVideoPreviewLoading.value = false;
  }
}

// ═══════════ 定时自动化（#8）═══════════
const adsCronPresets: ReadonlyArray<{ key: string; name: string; desc: string; cron: string; prompt: string }> = [
  {
    key: 'review',
    name: i18nT('阿联酋广告·每日跨平台复盘'),
    desc: i18nT('每天 09:00 拉取各投放平台指标并生成复盘报告'),
    cron: '0 9 * * *',
    prompt: i18nT('用「阿联酋广告投放」能力拉取已开放投放平台最近 7 天的真实投放指标，生成跨平台复盘报告（中文+阿拉伯语摘要），标记创意疲劳与预算异常；不要执行任何预算修改，预算调整只生成待办交人工确认。'),
  },
  {
    key: 'patrol',
    name: i18nT('阿联酋广告·平台登录巡检'),
    desc: i18nT('每 6 小时检查各平台登录态与 API 凭据有效性，失效即生成提醒'),
    cron: '0 */6 * * *',
    prompt: i18nT('巡检阿联酋广告工作台各已开放平台的登录会话与 API 凭据有效性；发现登录失效或凭据过期时生成一条明确的提醒说明哪个平台需要重新登录或补凭据，不要自动重试登录。'),
  },
  {
    key: 'weekly',
    name: i18nT('阿联酋广告·每周投放周报'),
    desc: i18nT('每周一 10:00 汇总上周投放数据，产出阿英双语周报'),
    cron: '0 10 * * 1',
    prompt: i18nT('汇总阿联酋广告投放上一周（周一到周日）的跨平台投放数据，产出一份阿拉伯语+英语双语周报：花费、展示、点击、转化、各平台对比、发现与下周建议；数据缺失的平台如实标记，不得编造。'),
  },
  {
    key: 'video',
    name: i18nT('阿联酋广告·定时视频投放'),
    desc: i18nT('按计划从素材库真实生成 UAE 广告视频并自动发布到已登录平台（需先选择素材库）'),
    cron: '30 10 * * *',
    prompt: i18nT('用「阿联酋广告投放」能力执行一轮定时视频投放：从素材库 {materialDir} 读取素材，真实生成一条 15–30 秒 9:16 的 UAE 广告视频（阿语 RTL 标题 + 阿英双语字幕 + TTS 旁白），随后对已登录的平台执行真实发布（YouTube 经外部 Chrome 上传，Meta 经 Business Suite），发布结果与回执写入审计；未登录的平台如实标记跳过，不得伪造成功。'),
  },
];
const adsCronEnabled = reactive<Record<string, boolean>>({ review: true, patrol: true, weekly: true, video: false });
const adsCronSaving = ref(false);
const adsCronSavedNote = ref('');
/** 定时视频投放的素材库（前提条件；持久化本地） */
const ADS_CRON_VIDEO_DIR_KEY = 'totalclaw:global-ads-cron-video-dir:v1';
const adsCronVideoDir = ref(localStorage.getItem(ADS_CRON_VIDEO_DIR_KEY) || '');
watch(adsCronVideoDir, (value) => {
  try { localStorage.setItem(ADS_CRON_VIDEO_DIR_KEY, value || ''); } catch { /* */ }
  if (!value.trim()) adsCronEnabled.video = false;
});
async function pickAdsCronVideoDir(): Promise<void> {
  try {
    const path = await (window as any).electronAPI?.solution?.pickFolder?.();
    if (path) adsCronVideoDir.value = path;
  } catch (error) {
    notif.fromException(i18nT('选择素材文件夹失败'), error);
  }
}

/**
 * 人话排期（普通用户不懂 cron）：频率 + 时间/星期/间隔 三个下拉，底层再拼 cron 表达式。
 */
interface AdsCronPlan { freq: 'daily' | 'weekly' | 'hours'; hour: number; minute: number; weekday: number; everyHours: number }
const adsCronPlans = reactive<Record<string, AdsCronPlan>>({
  review: { freq: 'daily', hour: 9, minute: 0, weekday: 1, everyHours: 6 },
  patrol: { freq: 'hours', hour: 9, minute: 0, weekday: 1, everyHours: 6 },
  weekly: { freq: 'weekly', hour: 10, minute: 0, weekday: 1, everyHours: 6 },
  video: { freq: 'daily', hour: 10, minute: 30, weekday: 1, everyHours: 6 },
});
const ADS_CRON_HOURS = Array.from({ length: 24 }, (_, index) => index);
const ADS_CRON_MINUTES = [0, 15, 30, 45];
const ADS_CRON_INTERVALS = [1, 2, 3, 4, 6, 8, 12];
const ADS_CRON_WEEKDAYS: ReadonlyArray<{ value: number; label: string }> = [
  { value: 1, label: i18nT('周一') }, { value: 2, label: i18nT('周二') }, { value: 3, label: i18nT('周三') },
  { value: 4, label: i18nT('周四') }, { value: 5, label: i18nT('周五') }, { value: 6, label: i18nT('周六') }, { value: 0, label: i18nT('周日') },
];
function planToCron(plan: AdsCronPlan): string {
  if (plan.freq === 'hours') return `0 */${plan.everyHours} * * *`;
  if (plan.freq === 'weekly') return `${plan.minute} ${plan.hour} * * ${plan.weekday}`;
  return `${plan.minute} ${plan.hour} * * *`;
}
function cronToPlan(cron: string, fallback: AdsCronPlan): AdsCronPlan {
  const parts = String(cron || '').trim().split(/\s+/);
  if (parts.length !== 5) return { ...fallback };
  const [minute, hour, , , weekday] = parts;
  if (hour.startsWith('*/')) {
    return { ...fallback, freq: 'hours', everyHours: Number(hour.slice(2)) || fallback.everyHours };
  }
  if (/^\d+$/.test(minute) && /^\d+$/.test(hour)) {
    if (/^\d+$/.test(weekday)) {
      return { ...fallback, freq: 'weekly', minute: Number(minute), hour: Number(hour), weekday: Number(weekday) };
    }
    return { ...fallback, freq: 'daily', minute: Number(minute), hour: Number(hour) };
  }
  return { ...fallback };
}
const pad2 = (n: number) => String(n).padStart(2, '0');

function cronHumanHint(expr: string): string {
  const parts = String(expr || '').trim().split(/\s+/);
  if (parts.length !== 5) return i18nT('5 段 cron 表达式：分 时 日 月 周');
  const [minute, hour, , , dayOfWeek] = parts;
  if (/^\d+$/.test(minute) && /^\d+$/.test(hour) && dayOfWeek === '*') {
    return i18nT('每天 {p0}:{p1} 执行', { p0: hour.padStart(2, '0'), p1: minute.padStart(2, '0') });
  }
  if (/^\d+$/.test(minute) && hour.startsWith('*/')) {
    return i18nT('每 {p0} 小时执行一次', { p0: hour.slice(2) });
  }
  if (/^\d+$/.test(minute) && /^\d+$/.test(hour) && /^\d+$/.test(dayOfWeek)) {
    return i18nT('每周第 {p0} 天 {p1}:{p2} 执行', { p0: dayOfWeek, p1: hour.padStart(2, '0'), p2: minute.padStart(2, '0') });
  }
  return i18nT('按 cron 表达式执行');
}

async function loadAdsCronJobs(): Promise<void> {
  try {
    const listed: any = await (window as any).electronAPI?.listOpenclawCronJobs?.();
    const existing: any[] = Array.isArray(listed) ? listed : (listed?.jobs || []);
    for (const preset of adsCronPresets) {
      const match = existing.find((job: any) => String(job?.name || '') === i18nT(preset.name));
      if (match) {
        adsCronEnabled[preset.key] = match.enabled !== false;
        if (match.cron) adsCronPlans[preset.key] = cronToPlan(String(match.cron), adsCronPlans[preset.key]);
      }
    }
  } catch { /* 列表拉不到不阻塞页面 */ }
}

async function saveAdsCronJobs(): Promise<void> {
  if (adsCronSaving.value) return;
  adsCronSaving.value = true;
  adsCronSavedNote.value = '';
  try {
    const target = (window as any).electronAPI;
    if (!target?.saveOpenclawCronJobs) throw new Error(i18nT('当前版本未开放定时任务'));
    const listed: any = await target.listOpenclawCronJobs?.();
    const existing: any[] = Array.isArray(listed) ? listed : (listed?.jobs || []);
    const presetNames = adsCronPresets.map((preset) => i18nT(preset.name));
    const jobs = adsCronPresets
      .filter((preset) => {
        if (!adsCronEnabled[preset.key]) return false;
        // 定时视频投放的前提条件：素材库必选
        if (preset.key === 'video' && !adsCronVideoDir.value.trim()) {
          notif.warn(i18nT('「定时视频投放」需要先选择素材库，本次未写入该任务'));
          return false;
        }
        return true;
      })
      .map((preset) => ({
        name: i18nT(preset.name),
        cron: planToCron(adsCronPlans[preset.key]),
        prompt: preset.key === 'video'
          ? i18nT(preset.prompt, { materialDir: adsCronVideoDir.value.trim() })
          : i18nT(preset.prompt),
        deliver: 'local',
        enabled: true,
      }));
    // 只提交本模块这几条：同名已有任务复用 id（edit，不再每次 create 出一份重复），不勾选的交单条删除；用户其它任务一律不碰
    const { upserts, deleteIds } = reconcileModuleCronJobs(existing, jobs, presetNames);
    if (upserts.length) await target.saveOpenclawCronJobs(upserts);
    for (const id of deleteIds) await target.deleteOpenclawCronJob?.(id);
    adsCronSavedNote.value = i18nT('已写入 {p0} 条定时任务，可在「定时任务」页查看管理', { p0: jobs.length });
    notif.success(adsCronSavedNote.value);
  } catch (error) {
    notif.fromException(i18nT('定时任务保存失败'), error);
  } finally {
    adsCronSaving.value = false;
  }
}

const isRtl = computed(() =>
  i18n.global.locale.value === 'ar' || document.documentElement.getAttribute('dir') === 'rtl',
);
const statusLoaded = computed(() => !!statusData.value && !statusLoading.value);
const regionAllowed = computed(() => {
  const value = statusData.value?.regionAllowed ?? statusData.value?.region_allowed;
  return value !== false;
});
const validReviewDates = computed(() =>
  !!review.since && !!review.until && review.since <= review.until,
);
const activeCredentialFields = computed(() => CREDENTIAL_FIELDS[credentialPlatformId.value]);
const credentialPlatformLabel = computed(() => platformLabel(credentialPlatformId.value));
const credentialHasInput = computed(() =>
  activeCredentialFields.value.some((field) => String(credentialDraft[field.key] || '').trim()),
);

watch(
  credentialDialogOpen,
  (open) => credentialNativeBrowserLock.set(open),
  { flush: 'post' },
);

const platformCards = computed<PlatformCard[]>(() => {
  const byId = new Map<string, AnyRecord>();
  for (const row of platformRows.value) {
    const id = String(row?.platform || row?.id || '').toLowerCase();
    if (id) byId.set(id, row);
  }
  return PLATFORM_DEFS.map((definition) => {
    const row = byId.get(definition.id);
    const selectedMode = platformModes[definition.id];
    if (!row) {
      return {
        id: definition.id,
        label: definition.label,
        enabled: false,
        configured: false,
        mode: selectedMode,
        driverFamily: '',
        accountKeys: [],
        missingSecrets: [],
        capabilities: [],
        webLogin: null,
        error: platformsError.value || i18nT('平台未返回状态'),
        tone: 'muted',
        statusLabel: i18nT('未知'),
        isSandbox: false,
      };
    }
    const configured = row.configured === true;
    const enabled = row.enabled !== false;
    const mode = selectedMode || (row.mode === 'web' ? 'web' : 'api');
    const isSandbox = (row.demoSandbox === true || row.demo_sandbox === true)
      && mode === 'api';
    const missingSecrets = arrayOfStrings(row.missingSecrets ?? row.missing_secrets);
    const error = String(row.errorMessage || row.error_message || row.error || '');
    const webLogin = isRecord(row.webLogin ?? row.web_login) ? (row.webLogin ?? row.web_login) : null;
    const webState = String(webLogin?.state || '');
    let tone: PlatformCard['tone'] = 'ready';
    let statusLabel = i18nT('就绪');
    if (isSandbox) {
      tone = 'ready';
      statusLabel = i18nT('Mock 沙箱');
    } else if (!enabled) {
      tone = 'muted';
      statusLabel = i18nT('未启用');
    } else if (mode === 'web' && webState !== 'ready') {
      tone = 'warning';
      statusLabel = i18nT('待登录');
    } else if (mode === 'api' && (!configured || missingSecrets.length)) {
      tone = 'warning';
      statusLabel = configured ? i18nT('待补凭据') : i18nT('未配置');
    } else if (error) {
      tone = 'error';
      statusLabel = i18nT('异常');
    }
    return {
      id: definition.id,
      label: String(row.label || definition.label),
      enabled,
      configured,
      mode,
      driverFamily: String(row.driverFamily || row.driver_family || ''),
      accountKeys: arrayOfStrings(row.accountKeys ?? row.account_keys).filter(Boolean),
      missingSecrets,
      capabilities: arrayOfStrings(row.capabilities),
      webLogin,
      error,
      tone,
      statusLabel,
      isSandbox,
    };
  });
});
const sandboxEnabled = computed(() =>
  platformCards.value.some((item) => item.isSandbox && item.tone === 'ready'));
const configuredPlatformCount = computed(() =>
  platformCards.value.filter((item) => item.configured && item.enabled).length,
);
const creativeAsset = computed(() => creativeAssets.value.find((item) => item.kind === 'image') ?? creativeAssets.value[0] ?? null);
const campaignPreviewAsset = computed(() => creativeAsset.value);
const previewPlatformDef = computed(() =>
  PLATFORM_DEFS.find((item) => item.id === previewPlatform.value) || PLATFORM_DEFS[0]);
const creativeImageCount = computed(() =>
  creativeAssets.value.filter((asset) => asset.kind === 'image').length);
const creativeVideoCount = computed(() =>
  creativeAssets.value.filter((asset) => asset.kind === 'video').length);
const creativeTotalSize = computed(() =>
  creativeAssets.value.reduce((sum, asset) => sum + asset.size, 0));
const creativeTypeLabel = computed(() => {
  const labels: string[] = [];
  if (creativeImageCount.value) labels.push(i18nT('{count} 张图片', { count: creativeImageCount.value }));
  if (creativeVideoCount.value) labels.push(i18nT('{count} 个视频', { count: creativeVideoCount.value }));
  return labels.join(' · ');
});
/**
 * 本次运行要排除的平台。
 *
 * 发布流程的平台集原本只由「就绪度」算出（enabled && (isSandbox || web || 凭据齐全)），
 * 演示沙箱下四个平台全部 isSandbox=true，于是永远四个一起上。可现场往往只登录了其中一个
 * （实测：只登录 YouTube 时，facebook/instagram 停在登录页，第 ④ 步 verify-login 逐平台
 * 回读后按设计阻止发布 —— 整条演示卡死）。这里让操作者按需摘掉没登录的平台。
 *
 * 用「排除集」而不是「选中集」：默认空集 == 保持原有的全量行为，不改变既有默认。
 */
const excludedRunPlatforms = ref<Set<string>>(new Set());

/** #13：各平台话题（启用了几个「本次投放」平台就展示几个输入框）。 */
const platformTopics = reactive<Record<PlatformId, string>>({
  facebook: '', instagram: '', google_ads: '', youtube: '',
});
const includedPlatformDefs = computed(() =>
  PLATFORM_DEFS.filter((item) => !excludedRunPlatforms.value.has(item.id)));
/**
 * 只带勾选平台里**真正填了话题**的那几个；平台 id → 话题串。
 * 没填就不要出现在这份 JSON 里 —— 之前无脑带上空串，下游拿到的是
 * `{"facebook":"","instagram":""}`，看着像"配了话题只是内容为空"，
 * agent 也可能顺手编几个标签补上。一个都没填时就是 `{}`。
 */
function includedTopicsJson(): string {
  return JSON.stringify(Object.fromEntries(
    includedPlatformDefs.value
      .map((item) => [item.id, String(platformTopics[item.id] || '').trim()] as const)
      .filter(([, topic]) => topic.length > 0),
  ));
}
// 第 4 步「真完成」信号：用户实际编辑过投放信息（预填默认值不算）
watch(
  [() => creativeBrief.brandName, () => creativeBrief.arabicHeadline, () => campaign.tenantId, platformTopics],
  () => { guideTouched.info = true; },
  { deep: true },
);

// #22：第 2 步勾了哪些平台，成片比例就自动预勾对应的那些（用户手动改过后不再覆盖）
watch(
  includedPlatformDefs,
  (platforms) => {
    if (aspectsTouched.value) return;
    const set = new Set<string>();
    for (const platform of platforms) set.add(PLATFORM_ASPECT[platform.id]?.recommended || '9:16');
    if (set.size) adsVideoAspects.value = [...set];
  },
  { immediate: true },
);

function toggleRunPlatform(platformId: string): void {
  const next = new Set(excludedRunPlatforms.value);
  if (next.has(platformId)) next.delete(platformId);
  else next.add(platformId);
  excludedRunPlatforms.value = next;
  guideTouched.platforms = true;
}

const workflowPlatforms = computed(() =>
  selectGlobalAdsWorkflowPlatforms(platformCards.value)
    .filter((item) => !excludedRunPlatforms.value.has(item.id)));

function canStartAdsScenario(scenarioId: string): boolean {
  if (scenarioId !== 'campaign-launch') return true;
  // 图片成片方式不依赖视频生成模型；只有动态视频生成方式受硬闸约束
  return adsGenerationReady.value
    && guideStep3Done.value
    && Boolean(campaign.tenantId.trim())
    && workflowPlatforms.value.length > 0;
}

function adsScenarioBlockedReason(scenarioId: string): string {
  if (scenarioId !== 'campaign-launch') return '';
  if (!adsGenerationReady.value) {
    return i18nT('请先配置视频生成模型：在「投放工作区 → 制作引擎配置」点开弹层完成接入后，才能执行后续投放流程。');
  }
  if (!guideStep3Done.value) {
    return i18nT('请先在上方上传客户广告素材，或在「广告视频」历史列表中选择一条已生成的成片。');
  }
  if (!campaign.tenantId.trim()) return i18nT('请填写客户标识，用于账户隔离与审计。');
  if (!workflowPlatforms.value.length) {
    return i18nT('请至少启用一个 Web 目标平台，或为一个 API 平台配齐凭据；Web 登录会在工作流中完成。');
  }
  return '';
}

/**
 * 第 5 步「一键执行投放」——**就在本页执行**，不跳工作流页。
 *
 * 为什么不再走工作流：发布本身已经是主进程单一实现（metaComposerPublish），
 * 工作流那层只是把它重新编排一遍（prepare/open_login/verify_login/commit/receipt），
 * 实测出过的问题全在编排层——人工确认卡住、落地页跳 Ads Manager、确认令牌、占位符插值。
 * 而右侧「发布运行状态」面板本身就是简版工作流（逐平台、逐步骤、总进度），够用且更贴上下文。
 * 工作流定义仍保留：定时任务跑在无界面环境，驱动不了渲染层，继续走那条路。
 */
async function startInlineAdsPublish(): Promise<void> {
  if (adsPublishBusyId.value || adsGenActive.value) return;
  adsPreflightError.value = '';
  resetAdsRunState();
  /**
   * 第 5 步 = **走一整轮新任务**（第 1 步到第 5 步）：按第 1 步的成片方式/比例/旁白设置，
   * 用第 3 步的素材**重新生成成片**，再逐平台发布。
   *
   * ⚠️ 不要因为历史里选过一条就跳过生成 —— 那是「用现成成片再投一次」，
   * 那条路在右侧历史列表每条的「一键发布」按钮上，语义完全不同（实测被用户指出混淆了）。
   */
  let record: AdsVideoRecord | null = null;
  try {
    const produced = await runAdsVideoGenerationInline();
    record = adsVideoHistory.value.find((item) => item.path === produced) || null;
  } catch (error) {
    /**
     * 兜底收尾运行标志：动态生成路径上有多个「进 try/finally 之前」的抛点
     * （快路接口缺失 / 没有参考图 / 模型没回分镜），adsGenActive 在
     * runAdsVideoGenerationInline 开头就置了 true —— 不在这里收掉的话，
     * 「一键执行投放」按钮会永远停在「正在生成成片…」禁用态（模块级共享状态，
     * 换页回来也不会好）。
     */
    adsGenActive.value = false;
    /**
     * 取消 ≠ 失败。以前这条路只能拿到一句「图片成片失败：已取消」——「失败」和
     * 「已取消」语义相反，拼在一起用户会以为出了错，去排查、去重试。
     * 现在按标记走中性收尾：节点停在「已取消」而不是标红，提示也是中性的。
     */
    if (isAdsRunCancelled(error)) {
      adsGenNodes.value = adsGenNodes.value.map((node) => (node.state === 'running' || node.state === 'pending'
        ? { ...node, state: 'cancelled' as const } : node));
      adsGenMessage.value = i18nT('已取消本次成片');
      try { persistAdsRunState(); } catch { /* 落库失败不影响收尾 */ }
      // 「重新生成」自己发起的取消是过程，不是结果：不弹「已取消」打断用户
      if (!adsGenRestarting.value) notif.info(i18nT('已取消本次成片'));
      return;
    }
    // 预检没过 = 根本没开始：原地说清原因，不摆节点、不算失败
    if ((error as { preflight?: boolean } | null)?.preflight) {
      adsPreflightError.value = errorMessage(error);
      notif.warn(adsPreflightError.value);
      return;
    }
    /**
     * 失败即终止：把还在转圈的节点收成 failed。
     * 修前只写了 adsGenMessage，节点仍是 running —— 面板同时显示「失败原因」和一个
     * 永远在转的 spinner、计时停在 0 秒、底下还挂着「全部就绪」（实测截图）。
     */
    failAdsGenRunningNodes();
    adsGenMessage.value = errorMessage(error);
    try { persistAdsRunState(); } catch { /* 落库失败不影响收尾 */ }
    notif.fromException(i18nT('生成广告成片失败'), error);
    return;
  }
  if (!record) {
    notif.warn(i18nT('本轮没有产出可用成片，未进入发布。'));
    return;
  }
  /**
   * ⚠️ 这一步不能省。`publishHistoryVideo` 的第一行是
   * `if (!adsVideoVerified[record.path] …) return;` —— 静默返回、没有任何提示。
   * 而 `adsVideoVerified` 只在点「刷新」时才逐条写入：用户没点过刷新、或者发的是
   * 刚上传的素材（从来没进过那张表）时，按钮是亮的、点下去却毫无反应（实测就是这个现象）。
   * 这里先就地校验这一条，校验不过就明确告诉用户文件找不到，绝不静默失败。
   */
  if (!adsVideoVerified[record.path]) {
    try {
      const result = await (window as any).electronAPI?.solution?.inspectMedia?.(record.path);
      adsVideoVerified[record.path] = result?.ok === true;
    } catch {
      adsVideoVerified[record.path] = false;
    }
  }
  if (!adsVideoVerified[record.path]) {
    notif.warn(i18nT('这条成片的文件当前读不到（可能已被移动或删除）：{p0}', { p0: record.path }));
    return;
  }
  await publishHistoryVideo(record);
  persistAdsPublishLog(record);
}

/**
 * 第 5 步的「生成成片」阶段运行态。
 * 动态视频生成模式下，第 5 步要**真的调视频模型出片**，而不是去挑一条现成的旧成片。
 */
/**
 * 生成阶段的节点清单 **从工作流定义本身派生**，不再手写。
 * 手写过一次就漂了：真实 id 是 render_final / video_review，
 * 我照着序号猜成了 produce / qc —— 结果 ④⑤ 永远匹配不到 node:entered，
 * 界面上一直显示「待执行」，用户以为卡住了（实测跑了 20 分钟还是灰的）。
 */
function adsGenNodeDefs(): Array<{ id: string; name: string }> {
  try {
    const wf = buildAdsVideoProductionWorkflow({});
    return (wf.nodes || [])
      .filter((node: AnyRecord) => node?.type === 'llm_call')
      .map((node: AnyRecord) => ({ id: String(node.id), name: String(node.name || node.id) }));
  } catch {
    return [];
  }
}

const adsGenProgress = computed(() => {
  const total = adsGenNodes.value.length || 1;
  const done = adsGenNodes.value.filter((n) => n.state === 'done' || n.state === 'failed').length;
  return { done, total, percent: Math.round((done / total) * 100) };
});

/**
 * 就地跑「广告视频生成」工作流并把节点进度显示在第 5 步里，跑完返回成片绝对路径。
 * 不跳工作流页 —— 与发布保持同一体验；进度来自 WORKFLOW_EVENT 的真实节点事件。
 */
/**
 * 图片成片快路：直连确定性脚本，进度用同一套节点面板展示（4 步，不是 5 个 agent 节点）。
 * 旁白/字幕文案用**一次**轻量 LLM 调用写出来（不是 agent 循环），拿不到就退化为无旁白。
 */
/**
 * 「用户主动取消」的专用信号。
 *
 * 取消要沿着同一条 throw 链退出（中间那些 finally 都得跑），但它**不是失败**：
 * 打上标记，最外层据此走中性文案，而不是弹「生成广告成片失败」的红字。
 */
/** 取消请求已发出、还没收到子进程真正退出的那一小段（按钮据此禁用，防连点） */
const adsGenCancelling = ref(false);
watch(adsGenActive, (active) => { if (!active) adsGenCancelling.value = false; });

async function cancelAdsGeneration(): Promise<void> {
  if (!adsGenActive.value || adsGenCancelling.value) return;
  adsGenCancelling.value = true;
  adsGenMessage.value = i18nT('正在停止本次成片…');
  try {
    const api = (window as any).electronAPI?.globalAdsRun;
    if (typeof api?.cancelSlideshow !== 'function') throw new Error(i18nT('当前版本不支持取消成片'));
    await api.cancelSlideshow();
    // 真正的收尾在 startInlineAdsPublish 的 catch 里：子进程被杀之后主进程回
    // { cancelled: true }，那条路径才知道该把哪些节点标成「已取消」。
  } catch (error) {
    adsGenCancelling.value = false;
    notif.fromException(i18nT('取消成片失败'), error);
  }
}

function adsRunCancelled(): Error {
  const error = new Error(i18nT('已取消本次成片')) as Error & { cancelled?: boolean };
  error.cancelled = true;
  return error;
}
function isAdsRunCancelled(error: unknown): boolean {
  return !!(error as { cancelled?: boolean } | null)?.cancelled;
}

/**
 * 扫描阶段被跳过的坏素材要如实报出来。
 * 片子确实出来了，但少了几张 —— 不说的话用户只会觉得「怎么比我放进去的少」，
 * 更不知道该去删哪个文件（脚本已经把文件名和原因一起带上来了）。
 */
function reportSkippedMaterials(result: AnyRecord | null | undefined): void {
  const skipped = Array.isArray(result?.skippedFiles) ? result!.skippedFiles as AnyRecord[] : [];
  if (!skipped.length) return;
  const listed = skipped.slice(0, 5)
    .map((item) => `${String(item.name)}（${String(item.reason)}）`).join(i18nT('、'));
  notif.warn(i18nT('有 {p0} 个素材读不出来，已跳过：{p1}', {
    p0: skipped.length,
    p1: listed + (skipped.length > 5 ? '…' : ''),
  }));
}

async function runSlideshowFastPath(
  materialDir: string,
  outputs: Array<{ aspect: string; path: string }>,
  brand: string,
): Promise<string> {
  const api = (window as any).electronAPI?.globalAdsRun;
  if (typeof api?.slideshow !== 'function') {
    adsGenActive.value = false;
    throw new Error(i18nT('当前版本未开放图片成片快路'));
  }

  // 预估耗时按实测标定：27 张图 / 单画幅 oneclick 约 40s，混音与烧字幕各约 15–30s
  const perAspect = Math.max(1, outputs.length);
  adsGenNodes.value = [
    { id: 'script', name: i18nT('① 生成旁白与字幕文案'), state: 'pending', etaSec: 25, kind: 'llm' },
    { id: 'render', name: i18nT('② 图片拼接成片'), state: 'pending', etaSec: 45 * perAspect, kind: 'image' },
    { id: 'mix', name: i18nT('③ 混入旁白与配乐'), state: 'pending', etaSec: 20 * perAspect, kind: 'tts' },
    { id: 'subtitle', name: i18nT('④ 烧录字幕'), state: 'pending', etaSec: 30 * perAspect, kind: 'image' },
  ];
  const mark = (id: string, state: GenNode['state']): void => {
    adsGenNodes.value = adsGenNodes.value.map((n) => (n.id === id
      ? { ...n, state, startedAt: state === 'running' ? Date.now() : n.startedAt }
      : n));
    // ⚠️ 落库失败绝不能把生成整条打死：persist 里 IPC 若抛（如结构化克隆失败），
    // 异常会一路逃到最外层，界面只剩一句「An object could not be cloned.」而
    // adsGenActive 还卡在 true —— 转圈不停、预计时间一直涨（实测踩过）。
    try { persistAdsRunState(); } catch (error) {
      console.warn('[ads-gen] 运行态落库失败（不影响出片）', error);
    }
  };

  // ① 文案：一次 LLM 调用，写 3 句旁白 + 对应字幕（要旁白才调；关掉就跳过）
  let narration: Array<{ id: string; text: string }> = [];
  let subtitles: Array<{ start: number; end: number; text: string }> = [];
  /**
   * 兜底文案：只用用户已经填过的内容（品牌 / 阿语标题 / 话题）拼，**不编事实**。
   * 有它才敢给 LLM 设短超时 —— 模型慢就走这份，成片不会被文案卡住。
   */
  const lang = copyLanguage();
  const fallbackCopy = (): Array<{ en: string; ar: string }> => {
    const brandName = brand.trim();
    const ar = creativeBrief.arabicHeadline.trim();
    const topics = String(platformTopics.instagram || platformTopics.facebook || '').trim();
    const lines: Array<{ en: string; ar: string }> = [];
    if (brandName) lines.push({ en: brandName, ar });
    else if (ar) lines.push({ en: '', ar });
    if (topics) lines.push({ en: topics, ar: '' });
    return lines.filter((line) => line.en || line.ar);
  };
  if (adsVideoVoiceover.value) {
    mark('script', 'running');
    adsGenMessage.value = i18nT('正在撰写旁白与字幕文案…');
    try {
      /**
       * ⚠️ 超时必须短。askLlmOnce 走的是**完整 agent 会话**（createSession → 引擎启动 →
       * 技能扫描 → 一轮对话），冷启动几分钟很常见。而这一步只是写 3 句文案，
       * 挡在确定性成片前面得不偿失 —— 用户实测「独立跑脚本 40 秒，走第 5 步几十分钟」，
       * 差的就是这里。25 秒拿不到就用兜底文案，成片照常出。
       */
      const reply = await askLlmOnce('marketing-content-creator', [
        i18nT('为品牌「{p0}」写一条面向阿联酋市场的短视频广告旁白，3 句，每句 6–12 个词，口语、可直接朗读。', { p0: brand }),
        // 旁白语言跟随界面语言（原来写死英文），否则中文用户会听到中文音色念英文
        i18nT('旁白（primary 字段）必须用{p0}撰写。', { p0: lang.label }),
        creativeBrief.arabicHeadline.trim() ? i18nT('阿语广告标题：{p0}', { p0: creativeBrief.arabicHeadline.trim() }) : '',
        i18nT('只输出 JSON，不要解释、不要代码块。格式：')
          + ` {"lines":[{"primary":"${lang.label}旁白","ar":"阿语字幕"}]}`,
        i18nT('严禁编造价格、优惠、功效或上下文里没有的事实。'),
      ].filter(Boolean).join('\n'), 25_000);
      const parsed = extractJsonObject(reply);
      const lines = Array.isArray(parsed?.lines) && parsed.lines.length
        ? parsed.lines.slice(0, 3)
        : fallbackCopy();
      // 兼容模型仍按老格式回 en 的情况
      const primaryOf = (line: AnyRecord): string =>
        String(line?.primary || line?.[lang.code] || line?.en || '').trim();
      narration = lines.map((line: AnyRecord, index: number) => ({
        id: `s${index + 1}`, text: primaryOf(line),
      })).filter((item: { text: string }) => item.text);
      subtitles = lines.map((line: AnyRecord, index: number) => {
        const primary = primaryOf(line);
        const arabic = String(line?.ar || '').trim();
        // 界面本来就是阿语时，两行会重复，只留一行
        const rows = lang.code === 'ar' ? [primary || arabic] : [primary, arabic];
        return {
          start: 1 + index * 7,
          end: 6.5 + index * 7,
          text: rows.filter(Boolean).join('\n'),
        };
      }).filter((item: { text: string }) => item.text);
    } catch (error) {
      // 模型慢/挂了都不阻断成片：改用只含用户已填内容的兜底文案，并如实说明
      const lines = fallbackCopy();
      narration = lines.map((line, index) => ({ id: `s${index + 1}`, text: String(line.en || line.ar || '').trim() }))
        .filter((item) => item.text);
      subtitles = lines.map((line, index) => ({
        start: 1 + index * 7,
        end: 6.5 + index * 7,
        // 兜底文案只含用户自己填过的品牌/阿语标题/话题，本来就没有语言可选，原样呈现
        text: [line.en, line.ar].filter(Boolean).join('\n'),
      })).filter((item) => item.text);
      adsGenMessage.value = narration.length
        ? i18nT('模型未在 25 秒内返回，已改用你填写的品牌与标题作为文案：{p0}', { p0: errorMessage(error) })
        : i18nT('旁白文案生成失败，本次成片不带旁白与字幕：{p0}', { p0: errorMessage(error) });
    }
    mark('script', narration.length ? 'done' : 'failed');
  } else {
    mark('script', 'done');
  }

  /**
   * 进度订阅 —— **单调推进**，不能各管各地点亮。
   *
   * ⚠️ 主进程是**按画幅循环**推的：每个画幅都发一轮 render → mix → subtitle。
   * 原来写成「收到 render 就点亮 render、收到 mix 就点亮 mix」，第二个画幅的 render
   * 会把 ② 重新点亮，而上一轮的 ④ 还停在 running —— 界面上 ② 和 ④ 同时转圈、
   * ③ 却显示完成，顺序完全乱掉（实测反馈）。
   *
   * 改成：进入某阶段就把它之前的全标完成、之后的全复位 pending，
   * 指针只在一条时间线上前后移动，任何时刻只有一个节点在跑。
   */
  const STAGE_ORDER = ['script', 'render', 'mix', 'subtitle'];
  const enterStage = (stage: string): void => {
    const at = STAGE_ORDER.indexOf(stage);
    if (at < 0) return;
    adsGenNodes.value = adsGenNodes.value.map((node) => {
      const index = STAGE_ORDER.indexOf(node.id);
      if (index < at) return node.state === 'failed' ? node : { ...node, state: 'done' as const };
      if (index > at) return { ...node, state: 'pending' as const, startedAt: undefined };
      return node.state === 'running'
        ? node                                   // 同一阶段的后续消息不重置计时
        : { ...node, state: 'running' as const, startedAt: Date.now() };
    });
    try { persistAdsRunState(); } catch { /* 落库失败不影响出片 */ }
  };
  const off = (window as any).electronAPI?.globalAdsRun?.onSlideshowProgress?.((p: AnyRecord) => {
    adsGenHeartbeat();
    if (p?.msg) adsGenMessage.value = String(p.msg);
    // 多画幅时把「第几个」摆出来，否则同一个节点反复跑用户不知道在干嘛
    const total = Number(p?.total) || 0;
    adsGenBatch.value = total > 1 ? { done: Number(p?.done) || 0, total } : null;
    if (typeof p?.stage === 'string') enterStage(String(p.stage));
  });
  try {
    enterStage('render');
    const result = await api.slideshow({
      materialDir, outputs, title: brand, narration, subtitles,
      // 音色必须跟文案同语言：tts.py 的 edge 引擎默认是中文女声，不传就会用中文声音念外文
      narrationVoice: lang.voice,
    });
    if (result?.cancelled) throw adsRunCancelled();
    if (!result?.ok) throw new Error(result?.error || i18nT('图片成片失败'));
    for (const node of ['render', 'mix', 'subtitle']) mark(node, 'done');
    reportSkippedMaterials(result);

    const produced = (result.produced || []).map((item: AnyRecord) => String(item.path));
    const usable: string[] = [];
    for (const path of produced) {
      const check = await (window as any).electronAPI?.solution?.inspectMedia?.(path);
      if (check?.ok === true) { adsVideoVerified[path] = true; usable.push(path); }
    }
    if (!usable.length) throw new Error(i18nT('脚本已结束但没有产出可用成片'));
    adsVideoHistory.value = [
      ...usable.map((path, index) => ({
        id: `adv-${Date.now()}-${index}`, projectName: brand, path, createdAt: Date.now(),
      })),
      ...adsVideoHistory.value,
    ].slice(0, 200);
    persistAdsVideoHistory();
    adsVideoPage.value = 1;
    selectedPublishVideoPath.value = usable[0];
    adsGenPreviewPath.value = usable[0];
    adsGenMessage.value = i18nT('成片已生成，可预览；即将进入发布。');
    persistAdsRunState();
    return usable[0];
  } finally {
    if (typeof off === 'function') off();
    adsGenActive.value = false;
  }
}

async function runAdsVideoGenerationInline(): Promise<string> {
  // 注：这里不再校验 saveWorkflow/runWorkflow —— 两条生成路径都是快路
  // （globalAdsRun.slideshow 直连脚本 / 视频模型），早已不经工作流；
  // 快路自己会对缺失的接口报「当前版本未开放…」。
  /**
   * 素材目录必须是**绝对路径**：生成脚本跑在主进程/子进程里，只认绝对路径。
   * 第 3 步那个「选择素材文件夹」走的是浏览器 webkitdirectory，只给
   * `<文件夹名>/<文件名>` 这种相对路径，拿不到绝对路径 —— 所以这里单独存一份。
   * 用户已经在第 3 步选过素材却还要他再点一次很别扭，但浏览器不给绝对路径就是拿不到；
   * 至少别甩一个"去别处选"的错误，直接把原生选择器弹在这里。
   */
  if (!adsVideoMaterialDir.value.trim()) {
    adsGenMessage.value = i18nT('请选择素材所在的文件夹（生成脚本需要绝对路径）');
    await pickAdsVideoMaterialDir();
  }
  const dir = adsVideoMaterialDir.value.trim();
  if (!dir) throw new Error(i18nT('没有选择素材文件夹，无法生成成片。'));
  // 开跑前预检：目录能读、至少一张图片。没过就原地报原因，不起任务（AdsPreflightError）
  await preflightAdsGeneration(dir);

  const sep = dir.includes('\\') ? '\\' : '/';
  const date = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  const stamp = `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}-${pad(date.getHours())}${pad(date.getMinutes())}${pad(date.getSeconds())}`;
  const outDir = `${dir.replace(/[\\/]+$/, '')}${sep}${i18nT('广告成片')}`;
  const aspects = requiredAspects.value;
  const outputs = aspects.map((aspect) => ({
    aspect,
    path: `${outDir}${sep}uae-ad-${stamp}-${aspect.replace(':', 'x')}.mp4`,
  }));
  const input = {
    materialDir: dir,
    brand: creativeBrief.brandName.trim() || 'UAE Growth Campaign',
    headlineAr: creativeBrief.arabicHeadline.trim(),
    outputPath: outputs[0].path,
    brief: adsVideoBrief.value.trim(),
    mode: adsVideoMode.value,
    videoModel: videoModelLabel.value,
    aspectRatio: outputs[0].aspect,
    voiceover: adsVideoVoiceover.value ? 'true' : 'false',
    bgmMood: adsVideoBgmMood.value,
    extraOutputs: outputs.slice(1).map((item) => `${item.aspect}=${item.path}`).join(','),
    // 素材不足时怎么办由用户显式选（P3-6），不让链路自己决定要不要花钱生图
    materialFallback: adsMaterialFallback.value,
  };

  adsGenActive.value = true;
  adsGenPreviewPath.value = '';

  /**
   * 图片成片走**快路**：直连 bundled skill 的确定性脚本（FFmpeg 拼图 → 混音 → 烧字幕）。
   * 之前和动态视频生成共用 5 节点 agent 工作流，每节点一轮 LLM 循环 ——
   * 同样一件确定性的活要跑几十分钟（实测反馈"之前特别快，现在怎么这么慢"）。
   * agent 编排只有动态视频生成才需要（要写分镜、调模型）。
   */
  if (adsVideoMode.value === 'slideshow') {
    return runSlideshowFastPath(dir, outputs, input.brand);
  }

  return runFalShotsFastPath(outputs, input.brand);
}

/**
 * 动态视频生成快路：一次 LLM 写分镜 → fal 逐镜头文生视频 → 本地拼接出片。
 *
 * 出镜头的模型已从 Seedance 换成 fal（t2v = MiniMax H3 Max），与慈善活动内容工场同一条
 * 通道：密钥、配额、用量审计与熔断都在 runFalJob 那一层收口过，不必再养第二套。
 *
 * 同样不走 5 节点 agent 工作流：那条链路每个节点一轮 LLM 循环，同一件事要跑几十分钟
 * （实测反馈"之前一两分钟就出来了"）。分镜确实需要模型来写，但**一次调用就够**，
 * 拼接 / BGM / 字幕都由脚本确定性完成。
 */
/** 把分镜的 caption 转成旁白脚本（起始秒按镜头时长累计，与画面对齐）。 */
function narrationFromScenes(scenes: AnyRecord[]): Array<{ id: string; text: string; start: number }> {
  let at = 0;
  const lines: Array<{ id: string; text: string; start: number }> = [];
  for (const [index, scene] of scenes.entries()) {
    /**
     * ⚠️ 只取第一行。caption 传给成片脚本时是「主字幕\n阿语副字幕」两行（副字幕只烧画面），
     * 这里若把整串折成一行喂给 TTS，配音会把阿语也念出来。
     * 主字幕固定在前，取首行即为跟随界面语言的那句。
     */
    const text = String(scene?.caption || '').split(/\r?\n/)[0].replace(/\s+/g, ' ').trim();
    const duration = Number(scene?.duration) > 0 ? Number(scene.duration) : 5;
    if (text) lines.push({ id: `s${index + 1}`, text, start: at });
    at += duration;
  }
  return lines;
}

async function runFalShotsFastPath(
  outputs: Array<{ aspect: string; path: string }>,
  brand: string,
): Promise<string> {
  const api = (window as any).electronAPI?.globalAdsRun;
  if (typeof api?.slideshow !== 'function') throw new Error(i18nT('当前版本未开放视频生成快路'));

  // 视频模型出片是网络任务，比本地 FFmpeg 慢一个量级；按每画幅 3 分钟估
  const perAspect = Math.max(1, outputs.length);
  adsGenNodes.value = [
    { id: 'script', name: i18nT('① 生成分镜与运镜提示'), state: 'pending', etaSec: 40, kind: 'llm' },
    // 镜头只生成一次、多画幅共用（主进程侧重排版），不再按画幅乘倍数
    { id: 'render', name: i18nT('② 视频模型出片并拼接'), state: 'pending', etaSec: 180, kind: 'video' },
  ];
  const mark = (id: string, state: GenNode['state']): void => {
    adsGenNodes.value = adsGenNodes.value.map((n) => (n.id === id
      ? { ...n, state, startedAt: state === 'running' ? Date.now() : n.startedAt }
      : n));
    persistAdsRunState();
  };

  /**
   * ⚠️ 先看第 3 步保存的提示词，再谈"有没有素材"。
   * 提示词条目自带 referenceImage 绝对路径，本身就是首帧参考图；
   * 把「必须先载入 creativeAssets」的校验放在前面，会把已经写好提示词的用户拦住
   * （实测：第 3 步显示「提示词已就绪」，第 5 步却报"需要图片素材"）。
   */
  const savedScenes = (adsPromptChosen.value ? adsPromptScenes.value : [])
    .filter((scene) => scene.prompt.trim() && scene.referenceImage)
    .map((scene, index) => ({
      id: scene.id || `0${index + 1}`,
      reference_image: scene.referenceImage,
      duration: Number(scene.duration) > 0 ? Math.min(10, Number(scene.duration)) : 5,
      prompt: scene.prompt.trim(),
      // 烧进画面的是「主字幕 + 阿语副字幕」两行；朗读走 narrationFromScenes，只取主字幕
      caption: [scene.caption.trim(), (scene.captionAr || '').trim()]
        .filter(Boolean)
        .filter((line, i, arr) => arr.indexOf(line) === i)   // 界面本就是阿语时两行会重复
        .join('\n'),
    }));
  if (savedScenes.length) {
    // 直接读提示词，这一步是本地取值，不该有等待
    adsGenNodes.value = adsGenNodes.value.map((n) => (n.id === 'script'
      ? { ...n, state: 'done' as const, etaSec: 1 } : n));
    adsGenMessage.value = i18nT('使用第 3 步保存的 {p0} 个分镜提示词', { p0: savedScenes.length });
    persistAdsRunState();
    return runFalShotsRender(savedScenes, outputs, brand, api);
  }

  // 没有保存过提示词才现场生成 —— 这时才需要素材里的图片当参考图
  const images = creativeAssets.value
    .filter((item) => item.kind === 'image' && item.absolutePath)
    .map((item) => String(item.absolutePath))
    .slice(0, 6);
  if (!images.length) {
    // 没有参考图 = 分镜这一步失败：把节点标红再抛，面板才会显示「成片生成失败」而不是全灰
    mark('script', 'failed');
    throw new Error(i18nT('动态视频生成需要图片素材作为首帧参考图；请在第 3 步先「生成广告视频提示词」，或用「选择素材文件夹」载入素材。'));
  }

  /**
   * 确定性兜底分镜：一张参考图一个镜头，运镜提示走固定模板轮换，
   * 字幕只用用户已填的阿语标题/品牌 —— **不编任何事实**。
   */
  const fallbackScenes = (refs: string[]): AnyRecord[] => {
    const moves = [
      'slow push in, cinematic lighting, subtle parallax',
      'slow pan right, shallow depth of field, natural light',
      'gentle pull back revealing the scene, cinematic grade',
      'slow tilt up, soft highlights, premium look',
    ];
    const caption = creativeBrief.arabicHeadline.trim() || brand.trim();
    return refs.slice(0, 4).map((image, index) => ({
      id: `0${index + 1}`,
      reference_image: image,
      duration: 5,
      prompt: moves[index % moves.length],
      caption: index === 0 ? caption : '',
    }));
  };

  mark('script', 'running');
  adsGenMessage.value = i18nT('正在生成分镜与运镜提示…');
  let scenes: AnyRecord[] = [];
  try {
    const reply = await askLlmOnce('marketing-content-creator', [
      i18nT('为品牌「{p0}」写一条面向阿联酋市场的 15–30 秒广告分镜，3 个场景。', { p0: brand }),
      creativeBrief.arabicHeadline.trim() ? i18nT('阿语广告标题：{p0}', { p0: creativeBrief.arabicHeadline.trim() }) : '',
      i18nT('可用的首帧参考图（按顺序分配，一个场景一张）：') + '\n' + images.map((path: string, i: number) => `${i + 1}. ${path}`).join('\n'),
      i18nT('每个场景给：运镜与画面变化的英文 prompt（要有明确的镜头运动，不要只"轻微动"），以及一句中英/阿语字幕。'),
      i18nT('只输出 JSON，不要解释、不要代码块。格式：')
        + ' {"scenes":[{"reference_image":"上面列出的绝对路径","duration":5,"prompt":"camera move…","caption":"字幕"}]}',
      i18nT('严禁编造价格、优惠、功效或上下文里没有的事实。'),
    ].filter(Boolean).join('\n'), 40_000);
    const parsed = extractJsonObject(reply);
    scenes = (Array.isArray(parsed?.scenes) ? parsed.scenes : []).slice(0, 4)
      .map((scene: AnyRecord, index: number) => ({
        id: `0${index + 1}`,
        reference_image: images.includes(String(scene?.reference_image)) ? String(scene.reference_image) : images[index % images.length],
        duration: Number(scene?.duration) > 0 ? Math.min(10, Number(scene.duration)) : 5,
        prompt: String(scene?.prompt || '').trim(),
        caption: String(scene?.caption || '').trim(),
      }))
      .filter((scene: AnyRecord) => scene.prompt);
  } catch (error) {
    /**
     * 模型慢/挂了**不该中止整条生成**。
     * askLlmOnce 走完整 agent 会话（引擎启动 + 技能扫描 + 一轮对话），冷启动几十秒很常见；
     * 而分镜只是"每张参考图配一句运镜提示"，完全可以用确定性模板兜底 ——
     * 之前这里直接 throw，用户看到的就是「分镜生成失败：模型响应超时」然后什么都没出（实测反馈）。
     */
    scenes = fallbackScenes(images);
    adsGenMessage.value = scenes.length
      ? i18nT('模型未按时返回分镜，已改用参考图顺序与你填写的标题生成分镜：{p0}', { p0: errorMessage(error) })
      : i18nT('分镜生成失败：{p0}', { p0: errorMessage(error) });
  }
  if (!scenes.length) {
    mark('script', 'failed');
    throw new Error(i18nT('模型没有返回可用的分镜，未开始出片。'));
  }
  mark('script', 'done');

  return runFalShotsRender(scenes, outputs, brand, api);
}

/** 用给定分镜调视频模型出片（第 3 步保存的提示词与现场生成的都走这里）。 */
async function runFalShotsRender(
  scenes: AnyRecord[],
  outputs: Array<{ aspect: string; path: string }>,
  brand: string,
  api: AnyRecord,
): Promise<string> {
  const mark = (id: string, state: GenNode['state']): void => {
    adsGenNodes.value = adsGenNodes.value.map((n) => (n.id === id
      ? { ...n, state, startedAt: state === 'running' ? Date.now() : n.startedAt }
      : n));
    try { persistAdsRunState(); } catch { /* 落库失败不影响出片 */ }
  };
  const off = api.onSlideshowProgress?.((p: AnyRecord) => {
    adsGenHeartbeat();
    if (p?.msg) adsGenMessage.value = String(p.msg);
    if (p?.stage === 'render' || p?.stage === 'mix') mark('render', 'running');
  });
  try {
    mark('render', 'running');
    const result = await api.slideshow({
      mode: 'fal',
      materialDir: adsVideoMaterialDir.value.trim(),
      outputs,
      title: brand,
      bgmMood: adsVideoBgmMood.value,
      scenes,
      /**
       * 旁白开关对动态模式同样生效。
       * 文案直接复用分镜里的 caption（它本来就是给这一镜写的字幕），
       * 不再单独多问一次模型 —— 那会再压上一次 agent 冷启动的等待。
       * 起始秒按各镜头累计时长推，和画面对齐。
       */
      narration: adsVideoVoiceover.value ? narrationFromScenes(scenes) : [],
      // 与图片成片同理：音色跟随文案语言，否则中文音色念外文
      narrationVoice: copyLanguage().voice,
    });
    if (result?.cancelled) throw adsRunCancelled();
    if (!result?.ok) throw new Error(result?.error || i18nT('动态视频生成失败'));
    mark('render', 'done');

    const usable: string[] = [];
    for (const item of (result.produced || [])) {
      const path = String((item as AnyRecord).path);
      const check = await (window as any).electronAPI?.solution?.inspectMedia?.(path);
      if (check?.ok === true) { adsVideoVerified[path] = true; usable.push(path); }
    }
    if (!usable.length) throw new Error(i18nT('脚本已结束但没有产出可用成片'));
    adsVideoHistory.value = [
      ...usable.map((path, index) => ({
        id: `adv-${Date.now()}-${index}`, projectName: brand, path, createdAt: Date.now(),
      })),
      ...adsVideoHistory.value,
    ].slice(0, 200);
    persistAdsVideoHistory();
    adsVideoPage.value = 1;
    selectedPublishVideoPath.value = usable[0];
    adsGenPreviewPath.value = usable[0];
    adsGenMessage.value = i18nT('成片已生成，可预览；即将进入发布。');
    persistAdsRunState();
    return usable[0];
  } finally {
    if (typeof off === 'function') off();
    adsGenActive.value = false;
  }
}

/**
 * 发布回执落盘（审计留痕）。
 * inline 面板是组件状态，刷新就没了；工作流那条路本来有持久化的运行记录，
 * 改成就地执行后这块必须自己补上，否则「发过什么、结果如何」查无对证。
 */
const ADS_PUBLISH_LOG_KEY = 'totalclaw:global-ads-publish-log:v1';
function persistAdsPublishLog(record: AdsVideoRecord): void {
  if (!adsPublishRuns.value.length) return;
  try {
    const previous = JSON.parse(localStorage.getItem(ADS_PUBLISH_LOG_KEY) || '[]');
    const entry = {
      at: Date.now(),
      tenantId: campaign.tenantId.trim(),
      brand: creativeBrief.brandName.trim(),
      source: record.path,
      runs: adsPublishRuns.value.map((run) => ({
        platform: run.platformId,
        file: run.file,
        aspect: run.aspect,
        state: run.state,
        status: run.status,
        detail: run.detail,
      })),
    };
    const next = [entry, ...(Array.isArray(previous) ? previous : [])].slice(0, 100);
    localStorage.setItem(ADS_PUBLISH_LOG_KEY, JSON.stringify(next));
  } catch { /* 留痕失败不影响已完成的发布 */ }
}

async function beforeAdsScenarioStart(scenarioId: string): Promise<boolean> {
  if (scenarioId !== 'campaign-launch') return false;
  const readyPlatforms = workflowPlatforms.value;
  const assets: AnyRecord[] = creativeAssets.value.map((item) => ({
    name: item.name,
    kind: item.kind,
    type: item.type,
    size: item.size,
    relativePath: item.relativePath,
    previewDataUrl: item.previewDataUrl,
  }));
  // #7：历史列表里手动选中的已生成成片，作为发布素材一并带进工作流（绝对路径）
  if (selectedPublishVideoPath.value) {
    const basename = selectedPublishVideoPath.value.split(/[\\/]/).pop() || 'ad-video.mp4';
    assets.push({
      name: basename,
      kind: 'video',
      type: 'video/mp4',
      size: 0,
      relativePath: selectedPublishVideoPath.value,
      absolutePath: selectedPublishVideoPath.value,
      source: 'generated',
      previewDataUrl: '',
    });
  }
  const input = {
    tenantId: campaign.tenantId.trim(),
    brand: creativeBrief.brandName.trim(),
    platforms: JSON.stringify(readyPlatforms),
    assets: JSON.stringify(assets),
    headlineAr: creativeBrief.arabicHeadline.trim(),
    topics: includedTopicsJson(),
    workflowSource: 'global-ads',
    returnPath: '/workbenches/global-ads',
    returnLabel: i18nT('返回广告投放工作台'),
  };
  try {
    const target = (window as any).electronAPI;
    if (!target?.saveWorkflow || !target?.runWorkflow) {
      throw new Error(i18nT('当前版本未开放工作流运行'));
    }
    await target.saveWorkflow(buildGlobalAdsPublishWorkflow(input));
    setWorkflowAutoRun(FIXED_ADS_PUBLISH_WORKFLOW_ID, input);
    await router.push({ path: '/workflow' });
    return true;
  } catch (error) {
    notif.fromException(i18nT('无法进入广告投放工作流'), error);
    return true;
  }
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

function creativeKind(file: File): CreativeAsset['kind'] | '' {
  if (file.type.startsWith('image/')) return 'image';
  if (file.type.startsWith('video/')) return 'video';
  const extension = file.name.split('.').pop()?.toLowerCase() || '';
  if (['jpg', 'jpeg', 'png', 'webp', 'gif'].includes(extension)) return 'image';
  if (['mp4', 'mov', 'webm'].includes(extension)) return 'video';
  return '';
}

function releaseCreativePreviews(): void {
  for (const asset of creativeAssets.value) {
    if (asset.previewUrl) URL.revokeObjectURL(asset.previewUrl);
  }
}

async function setCreativeFiles(files: File[]): Promise<void> {
  // 用户改用现成素材了，提示词这轮就不算数（提示词本身保留）
  adsPromptChosen.value = false;
  creativeDragging.value = false;
  creativeError.value = '';
  if (!files.length) return;
  const accepted: CreativeAsset[] = [];
  const rejected: string[] = [];
  let imagePreviewAssigned = false;
  for (const file of files) {
    const kind = creativeKind(file);
    if (!kind) {
      rejected.push(i18nT('{p0}（不支持的格式）', { p0: file.name }));
      continue;
    }
    const relativePath = String((file as File & { webkitRelativePath?: string }).webkitRelativePath || '');
    const useAsPreview = kind === 'image' && !imagePreviewAssigned;
    const previewUrl = useAsPreview ? URL.createObjectURL(file) : '';
    if (useAsPreview) imagePreviewAssigned = true;
    accepted.push({
      name: file.name,
      size: file.size,
      type: file.type,
      kind,
      previewUrl,
      previewDataUrl: previewUrl ? await createAdPreviewThumbnail(previewUrl) : '',
      relativePath,
    });
  }
  if (!accepted.length) {
    creativeError.value = rejected.length
      ? i18nT('没有可用素材：{details}', { details: rejected.slice(0, 3).join(i18nT('；')) })
      : i18nT('请选择图片或视频文件。');
    return;
  }
  releaseCreativePreviews();
  creativeAssets.value = accepted;
  if (rejected.length) {
    creativeError.value = i18nT('已载入 {count} 个素材，跳过 {rejected} 个：{details}', {
      count: accepted.length,
      rejected: rejected.length,
      details: rejected.slice(0, 3).join(i18nT('；')),
    });
  }
  quickLoginNote.value = i18nT('整批 {count} 个素材已就绪，Agent 将全部用于脚本、剪辑和投放流程。', {
    count: accepted.length,
  });
}

async function createAdPreviewThumbnail(sourceUrl: string): Promise<string> {
  return new Promise((resolve) => {
    const image = new Image();
    image.onload = () => {
      const maxSide = 720;
      const scale = Math.min(1, maxSide / Math.max(image.naturalWidth, image.naturalHeight));
      const canvas = document.createElement('canvas');
      canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
      canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
      const context = canvas.getContext('2d');
      if (!context) return resolve('');
      context.drawImage(image, 0, 0, canvas.width, canvas.height);
      resolve(canvas.toDataURL('image/jpeg', 0.76));
    };
    image.onerror = () => resolve('');
    image.src = sourceUrl;
  });
}

function onCreativeInput(event: Event): void {
  const input = event.target as HTMLInputElement;
  void setCreativeFiles(Array.from(input.files || []));
  input.value = '';
}

function onCreativeDrop(event: DragEvent): void {
  void setCreativeFiles(Array.from(event.dataTransfer?.files || []));
}

const reportBody = computed<AnyRecord>(() =>
  isRecord(reportResult.value?.report) ? reportResult.value!.report : (reportResult.value || {}),
);
const reportPlatforms = computed<AnyRecord[]>(() =>
  Array.isArray(reportBody.value.byPlatform)
    ? reportBody.value.byPlatform
    : (Array.isArray(reportBody.value.by_platform) ? reportBody.value.by_platform : []),
);
const reportFindings = computed<AnyRecord[]>(() =>
  Array.isArray(reportBody.value.findings) ? reportBody.value.findings : [],
);
const reportNotes = computed(() => String(reportBody.value.notes || ''));
const reportMetrics = computed(() => {
  const totals = isRecord(reportBody.value.totals) ? reportBody.value.totals : {};
  const wanted = [
    ['spend', i18nT('花费')],
    ['impressions', i18nT('展示')],
    ['clicks', i18nT('点击')],
    ['conversions', i18nT('转化')],
    ['cpa', 'CPA'],
    ['roas', 'ROAS'],
  ];
  return wanted.map(([key, label]) => ({
    key,
    label,
    value: totals[key] == null ? '—' : formatMetric(totals[key]),
  }));
});

function api(): AnyRecord | null {
  return (window as any).electronAPI?.workbenches?.globalAds || null;
}

let activeAdsContext: AutomationExecutionContext | undefined;

function browserTabsApi(): AnyRecord {
  const tabs = (window as any).electronAPI?.browserTabs;
  if (!tabs?.create || !tabs?.command) {
    throw new Error(i18nT('内置浏览器自动操作接口不可用'));
  }
  return tabs;
}

function browserCommandValue(response: AnyRecord): unknown {
  if (response?.success === false) throw new Error(String(response?.error || i18nT('浏览器操作失败')));
  const raw = response?.data?.result;
  if (typeof raw !== 'string') return raw ?? response?.data ?? response;
  const trimmed = raw.trim();
  if (!trimmed) return '';
  if (/^(?:true|false|null|-?\d+(?:\.\d+)?|\{|\[)/.test(trimmed)) {
    try { return JSON.parse(trimmed); } catch { /* keep original text */ }
  }
  return raw;
}

async function runBrowserCommand(
  command: string,
  args: string[] = [],
  contextId: string,
): Promise<unknown> {
  const response = await browserTabsApi().command({
    contextId,
    command,
    args,
  });
  return browserCommandValue(response);
}

/** Google 系（google_ads / youtube）被 Google 硬封锁内嵌浏览器登录，必须弹外部系统 Chrome。 */
const insightsChartOption = computed(() => {
  const rows = adsDailyMetrics(insightsResult.value);
  if (!rows.length) return null;
  const def = PLATFORM_DEFS.find((item) => item.id === insightsResult.value?.platform);
  return {
    tooltip: { trigger: 'axis' },
    legend: { top: 0, textStyle: { fontSize: 11 } },
    grid: { left: 8, right: 8, top: 40, bottom: 4, containLabel: true },
    xAxis: { type: 'category', data: rows.map((r) => String(r.date).slice(5)), axisTick: { show: false } },
    yAxis: [
      { type: 'value', name: i18nT('点击'), splitLine: { lineStyle: { type: 'dashed' } }, axisLabel: { fontSize: 11 } },
      { type: 'value', name: i18nT('花费（账户币种）'), splitLine: { show: false }, axisLabel: { fontSize: 11 } },
    ],
    series: [
      { name: i18nT('点击'), type: 'bar', barMaxWidth: 28, itemStyle: { color: def?.color || '#4a7cff', borderRadius: [3, 3, 0, 0] }, data: rows.map((r) => r.clicks) },
      { name: i18nT('转化'), type: 'bar', barMaxWidth: 28, itemStyle: { color: '#22c55e', borderRadius: [3, 3, 0, 0] }, data: rows.map((r) => r.conversions) },
      { name: i18nT('花费'), type: 'line', yAxisIndex: 1, smooth: true, lineStyle: { width: 2, color: '#f59e0b' }, itemStyle: { color: '#f59e0b' }, data: rows.map((r) => r.spend) },
    ],
  };
});

function requiresExternalBrowser(platformId: PlatformId): boolean {
  return platformId === 'google_ads' || platformId === 'youtube';
}

// FOREGROUND_SHARED_BROWSER_KEY 现从 composables/overseasPublish.ts 导入（与那边的发布路径
// 共用同一个外部 Chrome 实例，字面量必须与主进程 workflow.ipc 对齐，见该常量定义处注释）。

async function openPlatformLogin(platformId: PlatformId): Promise<boolean> {
  const definition = PLATFORM_DEFS.find((item) => item.id === platformId);
  if (!definition) return false;
  quickLoginBusy.value = platformId;
  quickLoginNote.value = '';
  // 与发布工作流共用同一 contextId：快捷登录留下的登录态/页面，工作流直接复用（记住登录态）。
  const contextId = `ads-publish-${platformId}`;
  try {
    if (requiresExternalBrowser(platformId)) {
      // Google 系：外部系统 Chrome（共享一个实例，多 tab）
      const foreground = (window as any).electronAPI?.browserTabs?.openForeground;
      if (typeof foreground !== 'function') throw new Error(i18nT('当前版本未开放外部浏览器登录'));
      await foreground({ contextId, url: definition.loginUrl, browserKey: FOREGROUND_SHARED_BROWSER_KEY });
      quickLoginNote.value = i18nT('{platform} 已在弹出的系统 Chrome 窗口打开（Google 限制内嵌浏览器登录），请由客户本人完成账号、密码与 MFA。', {
        platform: definition.label,
      });
      return true;
    }
    await browserTabsApi().create({ contextId, source: 'user', activate: true });
    await runBrowserCommand('open', [definition.loginUrl], contextId);
    quickLoginNote.value = i18nT('{platform} 官方登录页已在右侧打开，请由客户本人完成账号、密码与 MFA。', {
      platform: definition.label,
    });
    return true;
  } catch (error) {
    quickLoginNote.value = i18nT('无法打开 {platform}：{message}', {
      platform: definition.label,
      message: errorMessage(error),
    });
    return false;
  } finally {
    quickLoginBusy.value = '';
  }
}

function choosePlatformMode(platformId: PlatformId, mode: AdsMode): void {
  platformModes[platformId] = mode;
  platformVerifyResults[platformId] = null;
  quickLoginNote.value = mode === 'api'
    ? i18nT('{p0} 已选择 API 模式，请配置 Token 后验证访问。', { p0: platformLabel(platformId) })
    : i18nT('{p0} 已选择 Web 模式，点击“打开 Web 登录”由客户本人完成登录。', { p0: platformLabel(platformId) });
}

function openCredentialDialog(platformId: PlatformId): void {
  credentialPlatformId.value = platformId;
  credentialError.value = '';
  for (const key of Object.keys(credentialDraft)) delete credentialDraft[key];
  for (const key of Object.keys(revealedCredentialFields)) delete revealedCredentialFields[key];
  for (const field of CREDENTIAL_FIELDS[platformId]) {
    credentialDraft[field.key] = field.defaultValue || '';
  }
  credentialDialogOpen.value = true;
}

function closeCredentialDialog(): void {
  if (credentialSaving.value) return;
  credentialDialogOpen.value = false;
  credentialError.value = '';
}

async function connectPlatform(platformId: PlatformId): Promise<void> {
  if (platformModes[platformId] === 'api') {
    openCredentialDialog(platformId);
    return;
  }

  quickLoginBusy.value = platformId;
  try {
    const target = requireApi();
    if (typeof target.platformConfigure !== 'function') throw new Error(i18nT('平台配置接口不可用'));
    await target.platformConfigure({ platform: platformId, enabled: true, mode: 'web' });
    await refreshPlatforms();
  } catch (error) {
    notif.fromException(i18nT('切换 Web 模式失败'), error);
    quickLoginBusy.value = '';
    return;
  }
  quickLoginBusy.value = '';
  await openPlatformLogin(platformId);
}

async function savePlatformCredentials(): Promise<void> {
  if (!credentialHasInput.value) return;
  const platformId = credentialPlatformId.value;
  credentialSaving.value = true;
  credentialError.value = '';
  try {
    const target = requireApi();
    if (typeof target.platformConfigure !== 'function') throw new Error(i18nT('平台配置接口不可用'));
    const fields = CREDENTIAL_FIELDS[platformId];

    if (platformId === 'instagram') {
      const sharedMetaPayload: AnyRecord = { platform: 'facebook' };
      for (const field of fields.filter((item) => item.sharedMeta)) {
        const value = String(credentialDraft[field.key] || '').trim();
        if (value) sharedMetaPayload[field.key] = value;
      }
      if (Object.keys(sharedMetaPayload).length > 1) {
        await target.platformConfigure(sharedMetaPayload);
      }
    }

    // 保持用户当前选择的接入模式：web 模式下补账号 ID（发布/审计必需）不应把平台切成 API
    const payload: AnyRecord = {
      platform: platformId,
      enabled: true,
      mode: platformModes[platformId] || 'web',
    };
    for (const field of fields.filter((item) => !item.sharedMeta)) {
      const value = String(credentialDraft[field.key] || '').trim();
      if (value) payload[field.key] = value;
    }
    await target.platformConfigure(payload);

    platformVerifyResults[platformId] = null;
    quickLoginNote.value = i18nT('{p0} 凭据/账号 ID 已保存。', {
      p0: platformLabel(platformId),
    });
    credentialDialogOpen.value = false;
    notif.success(i18nT('{p0} API 凭据已保存', { p0: platformLabel(platformId) }));
    await refreshPlatforms();
  } catch (error) {
    credentialError.value = errorMessage(error);
  } finally {
    credentialSaving.value = false;
  }
}

function browserPause(ms = 550): Promise<void> {
  const signal = activeAdsContext?.signal;
  if (!signal) return new Promise((resolve) => window.setTimeout(resolve, ms));
  signal.throwIfAborted();
  return new Promise((resolve, reject) => {
    const timer = window.setTimeout(() => {
      signal.removeEventListener('abort', onAbort);
      resolve();
    }, ms);
    const onAbort = () => {
      window.clearTimeout(timer);
      reject(new DOMException(i18nT('广告自动化已由人工接管'), 'AbortError'));
    };
    signal.addEventListener('abort', onAbort, { once: true });
  });
}

async function executeAdsAutomation(
  scenarioId: string,
  phase: 'prepare' | 'commit',
  reportStep?: AutomationStepReporter,
  context?: AutomationExecutionContext,
): Promise<{ note?: string; progressManaged?: boolean }> {
  activeAdsContext = context;
  context?.throwIfCancelled();

  if (scenarioId === 'campaign-launch' && phase === 'prepare') {
    const asset = creativeAsset.value;
    if (!asset) throw new Error(i18nT('请先上传客户广告素材'));
    const assetBatch = creativeAssets.value.map((item) => ({
      name: item.name,
      kind: item.kind,
      type: item.type,
      size: item.size,
      relativePath: item.relativePath,
    }));
    const readyPlatforms = platformCards.value.filter((item) => item.tone === 'ready');
    if (!readyPlatforms.length) {
      throw new Error(i18nT('没有通过真实验证的投放平台，已阻止创建广告系列'));
    }
    const brief = {
      tenantId: campaign.tenantId.trim(),
      brand: creativeBrief.brandName,
      asset: { name: asset.name, kind: asset.kind, size: asset.size },
      assets: assetBatch,
      assetSummary: {
        total: assetBatch.length,
        images: creativeImageCount.value,
        videos: creativeVideoCount.value,
        totalBytes: creativeTotalSize.value,
      },
      targetMarket: 'United Arab Emirates',
      languages: ['ar', 'en'],
      platforms: readyPlatforms.map((item) => ({ id: item.id, mode: item.mode })),
      environment: sandboxEnabled.value ? 'mock' : 'connected-account',
    };
    reportStep?.(0, i18nT('客户策略 Agent 已读取客户标识、UAE 市场目标和整批 {count} 个真实素材', {
      count: assetBatch.length,
    }), {
      actor: i18nT('客户策略 Agent'), actorId: 'client-strategy', actorType: 'agent',
      tool: i18nT('客户 Brief / 批量素材库'),
      evidence: `${creativeImageCount.value} images · ${creativeVideoCount.value} videos · ${formatFileSize(creativeTotalSize.value)}`,
      output: assetBatch.map((item) => item.relativePath || item.name).slice(0, 20).join('\n'),
    });
    const target = requireApi();
    if (typeof target.runWorkflow !== 'function') throw new Error(i18nT('广告多 Agent 工作流接口不可用'));
    const workflowRunIdValue = context?.runId || `ads-${Date.now()}`;
    const unregisterWorkflowCancel = context?.registerCancellation(async () => {
      await target.cancelWorkflow?.({ runId: workflowRunIdValue });
    });
    const workflowResult = await target.runWorkflow({
      runId: workflowRunIdValue,
      taskType: 'campaign',
      brief,
    }).finally(() => unregisterWorkflowCancel?.());
    context?.throwIfCancelled();
    const workflowText = workflowOutput(workflowResult, ['reviewed_package']);
    const workflowId = workflowRunId(workflowResult) || context?.runId || '';
    reportStep?.(1, i18nT('广告动态工作流已完成策略拆解、渠道分工和预算边界'), {
      actor: i18nT('广告多 Agent 工作流'), actorId: 'client-strategy', actorType: 'agent',
      tool: '/v1/workflows/dynamic/run', evidence: workflowId,
      output: workflowText.slice(0, 320),
    });
    reportStep?.(2, i18nT('工作流中的素材本地化、媒体计划和合规复核 Agent 已并行完成'), {
      actor: i18nT('素材本地化 Agent'), actorId: 'creative-localizer', actorType: 'agent',
      tool: 'Dynamic AST · parallel + reduce', evidence: workflowId,
      output: workflowText.slice(0, 320),
    });

    if (typeof target.campaignCreate !== 'function') throw new Error(i18nT('真实广告创建接口不可用'));
    pendingCampaignPlans.value = [];
    for (const platform of readyPlatforms) {
      context?.throwIfCancelled();
      const spec = {
        name: `${creativeBrief.brandName} · UAE · ${new Date().toISOString().slice(0, 10)}`,
        campaign_key: `uae-${campaign.tenantId.trim()}`,
        objective: 'traffic',
        daily_budget_usd: 25,
        bid_strategy: 'lowest_cost',
        landing_url: 'https://example.com/uae-growth',
        targeting: {
          countries: ['AE'],
          languages: ['ar', 'en'],
          age_min: 21,
          age_max: 55,
        },
        creative: {
          asset_name: asset.name,
          asset_kind: asset.kind,
          asset_count: assetBatch.length,
          asset_batch: assetBatch,
          image_count: creativeImageCount.value,
          video_count: creativeVideoCount.value,
          headline_ar: creativeBrief.arabicHeadline,
          localized_copy: workflowText,
        },
        demo_sandbox: platform.isSandbox,
      };
      const validation = await target.campaignCreate({
        platform: platform.id,
        mode: platform.mode,
        tenantId: campaign.tenantId.trim(),
        tenant_id: campaign.tenantId.trim(),
        actor: 'totalclaw-media-buyer',
        dryRun: true,
        dry_run: true,
        spec,
      });
      assertBusinessSuccess(validation, i18nT('{p0} 广告计划校验失败', { p0: platform.label }));
      const confirmToken = String(
        validation?.confirmToken
        || validation?.confirm_token
        || validation?.raw?.confirmToken
        || validation?.raw?.confirm_token
        || '',
      );
      if (!confirmToken) {
        throw new Error(i18nT('{p0} 未返回人工确认令牌，已阻止真实花费动作', { p0: platform.label }));
      }
      pendingCampaignPlans.value.push({
        platform: platform.id,
        mode: platform.mode as AdsMode,
        spec,
        confirmToken,
        validation,
      });
    }
    reportStep?.(3, i18nT('媒体投放 Agent 已通过平台驱动校验 {count} 个 Mock 广告系列计划', {
      count: pendingCampaignPlans.value.length,
    }), {
      actor: i18nT('媒体投放 Agent'), actorId: 'media-buyer', actorType: 'agent',
      tool: '/v1/global_ads/campaign/create',
      evidence: pendingCampaignPlans.value.map((item) => `${item.platform}:validated`).join(' · '),
    });
    reportStep?.(4, i18nT('预算、受众、素材和目标平台已固化，正在提交 Mock 平台发布'), {
      actor: i18nT('媒体投放 Agent'), actorId: 'media-buyer', actorType: 'agent',
      tool: 'Platform Drivers',
      evidence: i18nT('{count} 个已校验发布计划', { count: pendingCampaignPlans.value.length }),
    });
    const results: AnyRecord[] = [];
    for (const plan of pendingCampaignPlans.value) {
      context?.throwIfCancelled();
      // pendingCampaignPlans 是 Vue ref，取出的 plan/spec 会被代理；Electron IPC
      // 不能克隆 Proxy，提交前必须还原成纯数据对象。
      const commitSpec = JSON.parse(JSON.stringify(plan.spec)) as AnyRecord;
      const result = await target.campaignCreate({
        platform: plan.platform,
        mode: plan.mode,
        tenantId: campaign.tenantId.trim(),
        tenant_id: campaign.tenantId.trim(),
        actor: 'totalclaw-media-buyer',
        dryRun: false,
        dry_run: false,
        confirmToken: plan.confirmToken,
        confirm_token: plan.confirmToken,
        spec: commitSpec,
      });
      assertBusinessSuccess(result, i18nT('{p0} 广告系列创建失败', { p0: platformLabel(plan.platform) }));
      results.push({ platform: plan.platform, result });
    }
    publishResult.value = {
      status: 'created',
      execution: 'global-ads-platform-drivers',
      results,
      runId: context?.runId,
    };
    reportStep?.(5, i18nT('Mock 平台驱动已返回 {count} 个发布结果，审计记录正在刷新', {
      count: results.length,
    }), {
      actor: i18nT('媒体投放 Agent'), actorId: 'media-buyer', actorType: 'agent',
      tool: '/v1/global_ads/campaign/create',
      evidence: results.map((item) => `${item.platform}:success`).join(' · '),
      output: JSON.stringify(results).slice(0, 360),
    });
    pendingCampaignPlans.value = [];
    await loadAudit();
    return {
      note: i18nT('Mock 广告平台发布已完成，系列回执与执行证据已进入审计。'),
      progressManaged: true,
    };
  }
  if (scenarioId === 'cross-platform-review' && phase === 'prepare') {
    reportStep?.(0, i18nT('正在读取 Facebook、Instagram、Google Ads 与 YouTube 指标'), {
      actor: i18nT('增长分析 Agent'), actorId: 'growth-analyst', actorType: 'agent',
      tool: '/v1/global_ads/review-report',
    });
    await browserTabsApi().create({
      contextId: 'global-ads-review',
      source: 'agent',
      activate: true,
    });
    await runBrowserCommand('open', ['https://ads.google.com/aw/overview'], 'global-ads-review');
    await browserPause(700);
    const target = requireApi();
    if (typeof target.reviewReport !== 'function') throw new Error(i18nT('跨平台复盘接口不可用'));
    const result = await target.reviewReport({
      since: review.since,
      until: review.until,
      platforms: PLATFORM_DEFS.map((item) => item.id),
      compare: 'previous_period',
      tenantId: campaign.tenantId.trim() || 'tenant-ae-demo',
      tenant_id: campaign.tenantId.trim() || 'tenant-ae-demo',
      demoSandbox: sandboxEnabled.value,
      demo_sandbox: sandboxEnabled.value,
    });
    assertBusinessSuccess(result, i18nT('真实平台指标读取失败；已停止后续复盘，不生成虚假结论'));
    reportResult.value = result;
    const body = isRecord(result?.report) ? result.report : result;
    const coveredPlatforms = Array.isArray(body?.byPlatform)
      ? body.byPlatform.map((item: AnyRecord) => item.platform).filter(Boolean)
      : [];
    if (!coveredPlatforms.length && !Object.keys(body?.totals || {}).length) {
      throw new Error(i18nT('复盘接口没有返回任何真实指标，已停止后续 Agent 分析'));
    }
    reportStep?.(1, i18nT('确定性接口已统一真实返回的花费、展示、点击、转化与时间口径'), {
      actor: i18nT('增长分析 Agent'), actorId: 'growth-analyst', actorType: 'agent',
      tool: 'Metric Normalizer',
      evidence: i18nT('{count} 个数据源 · {since}—{until}', {
        count: coveredPlatforms.length || 1,
        since: review.since,
        until: review.until,
      }),
    });
    if (typeof target.runWorkflow !== 'function') throw new Error(i18nT('广告复盘工作流接口不可用'));
    const reviewWorkflowRunId = context?.runId || `ads-review-${Date.now()}`;
    const unregisterWorkflowCancel = context?.registerCancellation(async () => {
      await target.cancelWorkflow?.({ runId: reviewWorkflowRunId });
    });
    const reviewWorkflow = await target.runWorkflow({
      runId: reviewWorkflowRunId,
      taskType: 'review',
      brief: { report: result, since: review.since, until: review.until },
    }).finally(() => unregisterWorkflowCancel?.());
    context?.throwIfCancelled();
    const growthOutput = workflowOutput(reviewWorkflow, ['reviewed_package']);
    const reviewRunId = workflowRunId(reviewWorkflow) || context?.runId || '';
    reportStep?.(2, i18nT('增长、创意和账户审计 Agent 已在动态工作流中并行复核真实指标'), {
      actor: i18nT('广告复盘工作流'), actorId: 'growth-analyst', actorType: 'agent',
      tool: '/v1/workflows/dynamic/run', evidence: reviewRunId,
      output: growthOutput.slice(0, 320),
    });
    reportStep?.(3, i18nT('阿英双语复盘已生成，并保留平台数据覆盖说明'), {
      actor: i18nT('增长分析 Agent'), actorId: 'growth-analyst', actorType: 'agent',
      tool: 'Report Builder', evidence: context?.runId,
      output: growthOutput.slice(0, 320),
    });
    reportStep?.(4, i18nT('优化待办已生成，预算调整等待客户确认'), {
      actor: i18nT('账户优化 Agent'), actorId: 'account-optimizer', actorType: 'agent',
      tool: 'Human Gate', evidence: i18nT('未执行任何花费变更'),
    });
    return {
      note: i18nT('真实指标已完成归一和 Agent 复盘；预算调整仍未执行。'),
      progressManaged: true,
    };
  }
  if (scenarioId === 'cross-platform-review' && phase === 'commit') {
    reportStep?.(4, i18nT('客户已确认，优化待办已写入审计队列'));
    return {
      note: i18nT('复盘结果和客户确认记录已完成留痕。'),
      progressManaged: true,
    };
  }
  if (scenarioId === 'web-login' && phase === 'prepare') {
    reportStep?.(0, i18nT('正在弹出系统 Chrome 打开 Google Ads 登录（Google 限制内嵌浏览器登录）'), {
      actor: i18nT('媒体投放 Agent'), actorId: 'media-buyer', actorType: 'agent',
      tool: i18nT('系统 Chrome · Google Ads'),
    });
    const opened = await openPlatformLogin('google_ads');
    if (!opened) throw new Error(quickLoginNote.value || i18nT('Google Ads 官方登录页打开失败'));
    webSessions.google_ads = {
      state: 'awaiting_customer',
      platform: 'google_ads',
      loginUrl: 'https://ads.google.com/',
    };
    reportStep?.(1, i18nT('Google Ads 官方登录页已打开，请客户本人输入账号、密码和 MFA'), {
      actor: i18nT('客户本人'), actorType: 'human', tool: 'Google Ads Login',
      evidence: i18nT('密码与 MFA 不经过 TotalClaw'),
    });
    return {
      note: i18nT('登录页已在右侧打开；完成登录后请在人工确认弹窗中核对详情并继续。'),
      progressManaged: true,
    };
  }
  if (scenarioId === 'web-login' && phase === 'commit') {
    reportStep?.(2, i18nT('正在回读 Google Ads 当前页面与账户访问状态'));
    // Google 系登录页在外部系统 Chrome 里（内嵌被 Google 封锁），经 foreground CDP 回读
    const readForeground = (window as any).electronAPI?.browserTabs?.readForeground;
    if (typeof readForeground !== 'function') throw new Error(i18nT('当前版本未开放外部浏览器登录'));
    const state = await readForeground({
      contextId: 'ads-publish-google_ads',
      browserKey: FOREGROUND_SHARED_BROWSER_KEY,
    });
    const currentUrl = String(state?.url || '');
    const pageText = String(state?.text || '');
    if (!/ads\.google\.com/i.test(currentUrl)
      || /sign in|choose an account|登录|选择帐号|verify it'?s you/i.test(pageText)) {
      throw new Error(i18nT('尚未验证 Google Ads 已登录账户；请完成账号与 MFA 后再确认'));
    }
    await browserPause(320);
    reportStep?.(3, i18nT('已验证登录后页面，并按当前账户能力注册读取、预览与受控写入操作'), {
      actor: i18nT('媒体投放 Agent'), actorId: 'media-buyer', actorType: 'agent',
      tool: 'browser.eval', evidence: currentUrl,
    });
    await browserPause(320);
    reportStep?.(4, i18nT('人工接管结束，会话状态与访问地址已写入审计记录'), {
      actor: i18nT('媒体投放 Agent'), actorId: 'media-buyer', actorType: 'agent',
      tool: 'Web Session Registry', evidence: currentUrl,
    });
    webSessions.google_ads = {
      ...(webSessions.google_ads || {}),
      state: 'ready',
      currentUrl,
    };
    return {
      note: i18nT('Google Ads 会话已接入，当前页面：{url}', { url: currentUrl }),
      progressManaged: true,
    };
  }
  return { note: i18nT('人工确认已记录，优化动作进入审计队列。') };
}

function requireApi(): AnyRecord {
  const target = api();
  if (!target) throw new Error(i18nT('当前版本未提供海外广告工作台 IPC'));
  return target;
}

async function refreshStatus(): Promise<void> {
  statusLoading.value = true;
  statusError.value = '';
  try {
    const target = requireApi();
    if (typeof target.status !== 'function') throw new Error(i18nT('状态接口不可用'));
    const result = await target.status();
    if (!isRecord(result)) throw new Error(i18nT('状态接口返回格式无效'));
    statusData.value = result;
  } catch (error) {
    statusData.value = null;
    statusError.value = errorMessage(error);
  } finally {
    statusLoading.value = false;
  }
}

async function refreshPlatforms(): Promise<void> {
  platformsLoading.value = true;
  platformsError.value = '';
  try {
    const target = requireApi();
    if (typeof target.platforms !== 'function') throw new Error(i18nT('平台状态接口不可用'));
    const result = await target.platforms();
    const rows = Array.isArray(result) ? result : result?.platforms;
    if (!Array.isArray(rows)) throw new Error(i18nT('平台状态接口返回格式无效'));
    platformRows.value = rows;
    for (const row of rows) {
      const platformId = String(row?.platform || row?.id || '') as PlatformId;
      const mode = String(row?.mode || '');
      // 演示沙箱兜底 rows 恒报 mode:'api'，不能拿它冲掉「默认全 Web」；
      // 只同步真实配置过（configured）的平台模式。
      const isSandboxRow = row?.demoSandbox === true || row?.demo_sandbox === true;
      if (
        PLATFORM_DEFS.some((item) => item.id === platformId)
        && (mode === 'api' || mode === 'web')
        && !isSandboxRow
        && row?.configured === true
      ) {
        platformModes[platformId] = mode;
      }
    }
    const defaultMode = result?.defaultMode ?? result?.default_mode;
    if (defaultMode === 'api' || defaultMode === 'web') {
      campaign.mode = defaultMode;
    }
  } catch (error) {
    platformRows.value = [];
    platformsError.value = errorMessage(error);
  } finally {
    platformsLoading.value = false;
  }
}

async function refreshAll(): Promise<void> {
  refreshing.value = true;
  await Promise.allSettled([refreshStatus(), refreshPlatforms(), loadAudit()]);
  refreshing.value = false;
}

async function verifyPlatform(platform: PlatformCard): Promise<void> {
  platformBusy[platform.id] = 'verify';
  try {
    const target = requireApi();
    if (typeof target.platformVerify !== 'function') throw new Error(i18nT('平台验证接口不可用'));
    const result = await target.platformVerify({
      platform: platform.id,
      mode: platform.mode || campaign.mode,
    });
    if (!isRecord(result)) throw new Error(i18nT('平台验证接口返回格式无效'));
    platformVerifyResults[platform.id] = result;
    if (result.verified === true && result.success === true) {
      notif.success(i18nT('{p0} 访问验证通过', { p0: platform.label }));
    } else {
      notif.warn(verificationLabel(result));
    }
  } catch (error) {
    platformVerifyResults[platform.id] = {
      verified: false,
      error_message: errorMessage(error),
    };
    notif.fromException(i18nT('{p0} 访问验证失败', { p0: platform.label }), error);
  } finally {
    platformBusy[platform.id] = '';
  }
}

async function startWebLogin(platform: PlatformCard): Promise<void> {
  if (!statusLoaded.value || !regionAllowed.value) {
    notif.warn(i18nT('当前区域不允许启动 Web 登录会话'));
    return;
  }
  platformBusy[platform.id] = 'start';
  try {
    const target = requireApi();
    if (typeof target.webLoginStart !== 'function') throw new Error(i18nT('Web 登录接口不可用'));
    const tenantId = campaign.tenantId.trim();
    const result = await target.webLoginStart({
      platform: platform.id,
      ...(tenantId ? { tenantId, tenant_id: tenantId } : {}),
    });
    if (!isRecord(result) || !String(result.sessionId || result.session_id || '').trim()) {
      throw new Error(i18nT('Web 登录接口没有返回有效会话'));
    }
    webSessions[platform.id] = result;
    if (result.state === 'ready') {
      notif.success(i18nT('{p0} Web 登录已验证就绪', { p0: platform.label }));
    } else if (result.state === 'failed' || result.state === 'timeout') {
      notif.warn(String(result.errorMessage || result.error_message || i18nT('Web 登录会话未就绪')));
    } else {
      notif.info(i18nT('请在已打开的浏览器窗口中由本人完成登录，再点击“探测一次”'));
    }
  } catch (error) {
    notif.fromException(i18nT('启动 Web 登录失败'), error);
  } finally {
    platformBusy[platform.id] = '';
  }
}

async function pollWebLogin(platformId: PlatformId): Promise<void> {
  const sessionId = String(
    webSessions[platformId]?.sessionId || webSessions[platformId]?.session_id || '',
  ).trim();
  if (!sessionId) return;
  platformBusy[platformId] = 'poll';
  try {
    const target = requireApi();
    if (typeof target.webLoginStatus !== 'function') throw new Error(i18nT('Web 登录状态接口不可用'));
    const result = await target.webLoginStatus({ sessionId });
    if (!isRecord(result)) throw new Error(i18nT('Web 登录状态返回格式无效'));
    webSessions[platformId] = result;
    if (result.state === 'ready') {
      notif.success(i18nT('{p0} Web 登录已验证就绪', { p0: platformLabel(platformId) }));
      await refreshPlatforms();
    } else if (result.state === 'failed' || result.state === 'timeout') {
      notif.warn(String(result.errorMessage || result.error_message || i18nT('Web 登录会话未就绪')));
    }
  } catch (error) {
    notif.fromException(i18nT('探测 Web 登录失败'), error);
  } finally {
    platformBusy[platformId] = '';
  }
}

async function cancelWebLogin(platformId: PlatformId): Promise<void> {
  const sessionId = String(
    webSessions[platformId]?.sessionId || webSessions[platformId]?.session_id || '',
  ).trim();
  if (!sessionId) return;
  platformBusy[platformId] = 'cancel';
  try {
    const target = requireApi();
    if (typeof target.webLoginCancel !== 'function') throw new Error(i18nT('Web 登录取消接口不可用'));
    const result = await target.webLoginCancel({
      sessionId,
      reason: i18nT('用户在广告工作台主动取消'),
    });
    if (!isRecord(result)) throw new Error(i18nT('Web 登录取消接口返回格式无效'));
    webSessions[platformId] = result;
    notif.info(i18nT('Web 登录会话已取消'));
    await refreshStatus();
  } catch (error) {
    notif.fromException(i18nT('取消 Web 登录失败'), error);
  } finally {
    platformBusy[platformId] = '';
  }
}

async function loadInsights(): Promise<void> {
  if (!validReviewDates.value) {
    notif.warn(i18nT('复盘日期无效'));
    return;
  }
  insightsLoading.value = true;
  insightsResult.value = null;
  try {
    const target = requireApi();
    if (typeof target.insights !== 'function') throw new Error(i18nT('广告指标接口不可用'));
    const result = await target.insights({
      platform: review.insightsPlatform,
      mode: review.insightsMode,
      level: 'campaign',
      since: review.since,
      until: review.until,
      demoSandbox: sandboxEnabled.value,
      demo_sandbox: sandboxEnabled.value,
    });
    insightsResult.value = isRecord(result) ? result : { response: result };
    assertBusinessSuccess(result, i18nT('指标拉取未成功'));
    notif.success(i18nT('已读取平台真实指标'));
  } catch (error) {
    notif.fromException(i18nT('指标拉取失败'), error);
  } finally {
    insightsLoading.value = false;
  }
}

async function buildReviewReport(): Promise<void> {
  if (!validReviewDates.value || !review.platforms.length) {
    notif.warn(i18nT('请选择有效日期和至少一个复盘平台'));
    return;
  }
  reportLoading.value = true;
  reportResult.value = null;
  try {
    const target = requireApi();
    if (typeof target.reviewReport !== 'function') throw new Error(i18nT('广告复盘接口不可用'));
    const result = await target.reviewReport({
      since: review.since,
      until: review.until,
      platforms: [...review.platforms],
      compare: review.comparePrevious ? 'previous_period' : '',
      tenant_id: campaign.tenantId.trim(),
      tenantId: campaign.tenantId.trim(),
      demoSandbox: sandboxEnabled.value,
      demo_sandbox: sandboxEnabled.value,
    });
    if (!isRecord(result)) throw new Error(i18nT('复盘接口返回格式无效'));
    if (result.ok === false || result.error) {
      throw new Error(String(result.errorMessage || result.error_message || result.error || i18nT('复盘未成功')));
    }
    reportResult.value = result;
    notif.success(i18nT('跨平台复盘已生成'));
  } catch (error) {
    notif.fromException(i18nT('生成复盘失败'), error);
  } finally {
    reportLoading.value = false;
  }
}

async function loadAudit(): Promise<void> {
  auditLoading.value = true;
  auditError.value = '';
  auditPage.value = 1;
  try {
    const target = requireApi();
    if (typeof target.audit !== 'function') throw new Error(i18nT('广告审计接口不可用'));
    const result = await target.audit({
      platform: auditFilter.platform,
      tenantId: auditFilter.tenantId.trim(),
      limit: 100,
    });
    const entries = Array.isArray(result) ? result : result?.entries;
    if (!Array.isArray(entries)) throw new Error(i18nT('审计接口返回格式无效'));
    auditEntries.value = entries;
  } catch (error) {
    auditEntries.value = [];
    auditError.value = errorMessage(error);
  } finally {
    auditLoading.value = false;
  }
}

function goAuditPage(page: number): void {
  auditPage.value = Math.min(auditPageCount.value, Math.max(1, page));
}

function assertBusinessSuccess(result: any, fallback: string): void {
  if (!isRecord(result)) throw new Error(fallback);
  if (result.ok === false || result.success !== true) {
    throw new Error(String(
      result.error_message
      || result.errorMessage
      || result.error
      || result.remediation
      || result.status
      || fallback,
    ));
  }
}

function resultTone(result: AnyRecord): string {
  if (result?.success !== true || result?.ok === false) return 'result-bad';
  const status = String(result?.status || '').toLowerCase();
  if (status === 'needs_human' || result?.handbackId || result?.handback_id) return 'result-warn';
  if (status === 'pending_review') return 'result-pending';
  return 'result-ok';
}

function resultStatus(result: AnyRecord): string {
  if (result?.success === true && result?.ok !== false) return String(result.status || i18nT('成功'));
  return String(result?.status || result?.errorCode || result?.error_code || i18nT('未成功'));
}

function webLoginLabel(value: AnyRecord | null): string {
  if (!value) return i18nT('未报告');
  if (value.loggedIn === true || value.logged_in === true) return i18nT('已登录');
  if (value.configured === true || value.profileExists === true || value.profile_exists === true) return i18nT('已准备，待验证');
  const state = String(value.status || value.state || '');
  return state || i18nT('未登录');
}

function verificationLabel(value: AnyRecord | null): string {
  if (!value) return i18nT('尚未验证');
  if (value.verified === true && value.success === true) return i18nT('真实访问验证通过');
  return String(
    value.error_message
    || value.errorMessage
    || value.remediation
    || value.status
    || i18nT('访问验证未通过'),
  );
}

function webSessionTerminal(value: AnyRecord | null): boolean {
  return ['ready', 'failed', 'cancelled', 'timeout'].includes(String(value?.state || ''));
}

function modeLabel(value: string): string {
  if (value === 'api') return 'API';
  if (value === 'web') return 'Web';
  return value || '—';
}

function platformMark(id: PlatformId): string {
  return ({ facebook: 'f', instagram: '◎', google_ads: 'G', youtube: '▶' } as const)[id];
}

function platformLabel(id: string): string {
  return PLATFORM_DEFS.find((item) => item.id === id)?.label || id || '—';
}

function formatTimestamp(seconds: number): string {
  if (!seconds) return '—';
  return new Date(seconds * 1000).toLocaleString(localeForFormat());
}

function formatAuditTime(entry: AnyRecord): string {
  if (entry.iso) {
    const date = new Date(entry.iso);
    if (!Number.isNaN(date.getTime())) return date.toLocaleString(localeForFormat());
    return String(entry.iso);
  }
  if (entry.ts) return new Date(Number(entry.ts) * 1000).toLocaleString(localeForFormat());
  return '—';
}

function formatMetric(value: unknown): string {
  const number = Number(value);
  if (!Number.isFinite(number)) return String(value ?? '—');
  return new Intl.NumberFormat(localeForFormat(), { maximumFractionDigits: 4 }).format(number);
}

function numberOrDash(value: unknown): string {
  return Number.isFinite(Number(value)) ? String(Number(value)) : '—';
}

/**
 * 成片文案（旁白 + 字幕）应当用哪种语言写。
 *
 * ⚠️ 这里必须跟随界面语言，不能写死。原来两条链路都是硬编码的：
 *   - 图片成片：向模型要 `{"en":…,"ar":…}`，旁白只取 `line.en` → **永远是英文**；
 *   - 动态视频：提示词写死「一句中英/阿语字幕」。
 * 而 tts.py 的 edge 引擎默认音色是 `zh-CN-XiaoxiaoNeural`（中文女声），
 * 于是实际效果是**中文声音在念英文文案**，中文用户既听不懂也对不上口型。
 *
 * 注意区分：这是「成片给谁看/听」的语言，与广告投放定向里的
 * `targeting.languages: ['ar','en']`（投给 UAE 哪些语言的人群）是两回事，那个不动。
 * 阿语标题是用户自己填的 UAE 市场素材，作为附加字幕行保留。
 */
function copyLanguage(): { code: 'zh' | 'en' | 'ar'; label: string; voice: string } {
  const loc = String(i18n.global.locale.value || 'zh-CN');
  if (loc === 'ar') return { code: 'ar', label: i18nT('阿拉伯语'), voice: 'ar-AE-FatimaNeural' };
  if (loc.startsWith('en')) return { code: 'en', label: i18nT('英语'), voice: 'en-US-AriaNeural' };
  return { code: 'zh', label: i18nT('简体中文'), voice: 'zh-CN-XiaoxiaoNeural' };
}

function localeForFormat(): string {
  return i18n.global.locale.value === 'ar' ? 'ar-AE' : i18n.global.locale.value;
}

function pretty(value: unknown): string {
  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return String(value);
  }
}

/**
 * 错误 → 人话。本视图有 60+ 个 catch 全走这里，是整个工作台的错误收口点。
 * 直接返回 error.message 的老写法会把这些原样摆到界面上（实测样本）：
 *   「节点执行失败: 以下平台尚未完成登录：douyin、xiaohongshu」← 尚可
 *   「ERR_ABORTED (-3) loading 'https://business.facebook.com/...'」← 用户看不懂
 *   qiye-api 的 QIYE_API_401 / QIYE_API_404 等内部码、含绝对路径的 Python 报错
 * humanizeErrorMessage 查错误码映射、剥噪音、语种兜底，统一给出可照做的话术。
 */
function errorMessage(error: unknown): string {
  return humanizeErrorMessage(error, i18nT('未知错误'));
}

function isRecord(value: unknown): value is AnyRecord {
  return !!value && typeof value === 'object' && !Array.isArray(value);
}

function arrayOfStrings(value: unknown): string[] {
  return Array.isArray(value) ? value.map((item) => String(item)) : [];
}

function dateInputDaysAgo(days: number): string {
  const date = new Date();
  date.setHours(12, 0, 0, 0);
  date.setDate(date.getDate() - days);
  return date.toISOString().slice(0, 10);
}

function onMediaModelChangedElsewhere(): void { void loadMediaModelState(); }

onMounted(() => {
  // 恢复上一次的运行快照：跨组件实例靠模块级状态，跨进程靠主进程落库
  void restoreAdsRunState();
  window.addEventListener('totalclaw:media-model-changed', onMediaModelChangedElsewhere);
  try {
    const stored = JSON.parse(localStorage.getItem('totalclaw:publish-workflow-result:global-ads') || 'null');
    if (stored?.kind === 'run:completed') {
      publishResult.value = JSON.parse(String(stored?.finalVariables?.node_receipt_result || '{}'));
    }
  } catch { /* 旧版或损坏的回写记录不影响审计刷新 */ }
  void refreshAll();
  void loadMediaModelState();
  void refreshAdsVideoHistory();
  void loadAdsCronJobs();
});

onBeforeUnmount(() => {
  credentialNativeBrowserLock.release();
  releaseCreativePreviews();
});
</script>

<style scoped>
.ads-workbench {
  box-sizing: border-box;
  height: 100%;
  min-height: 0;
  overflow-y: auto;
  padding: 24px;
  color: var(--color-text-primary);
  background:
    radial-gradient(circle at 8% 0%, color-mix(in srgb, var(--color-brand) 9%, transparent), transparent 28rem),
    var(--color-bg-primary);
}
/* 宽屏对齐：所有顶层区块统一 1440px 上限并居中，杜绝「有的限宽有的全宽」的长短不齐。 */
.ads-workbench > * {
  max-width: 1440px;
  margin-left: auto;
  margin-right: auto;
}

.hero {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 24px;
  max-width: 1440px;
  margin: 0 auto 18px;
  padding: 24px 26px;
  overflow: hidden;
  border: 1px solid color-mix(in srgb, var(--gaw-warn) 30%, var(--color-border));
  border-radius: var(--radius-8);
  background:
    var(--gaw-grad);
  box-shadow: var(--gaw-shadow);
}
.hero-copy { position: relative; z-index: 1; margin-inline-end: auto; }
/* 深色 hero 上的返回箭头：与 .hero .button.ghost 同一套浅色 */
.hero :deep(.page-back) { position: relative; z-index: 1; --page-back-bg: color-mix(in srgb, var(--color-on-accent) 10%, transparent); --page-back-fg: var(--color-on-accent); --page-back-border: color-mix(in srgb, var(--color-on-accent) 24%, transparent); --page-back-hover-fg: var(--color-on-accent); --page-back-hover-border: color-mix(in srgb, var(--color-on-accent) 60%, transparent); }
.hero-actions { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; justify-content: flex-end; }
.hero .button.ghost {
  border-color: var(--gaw-surface-a24);
  color: var(--color-on-accent);
  background: var(--gaw-surface-a10);
  backdrop-filter: var(--gaw-blur);
}
.hero h1 { color: var(--color-on-accent); }
.hero p { color: var(--gaw-on-accent-a78); }
.hero .eyebrow { color: var(--gaw-warn-2); }
.hero-tags { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 17px; }
.hero-tags span {
  display: inline-flex; align-items: center; gap: 6px; padding: 6px 10px;
  border: 1px solid var(--gaw-surface-a13); border-radius: var(--radius-pill);
  color: var(--gaw-on-accent-a82); background: var(--gaw-surface-a7); font-size: 10px; font-weight: 700;
}

/* 服务链压缩版：hero 内一行小 icon（原六张大卡已移除） */
.hero-chain {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 4px;
  margin-top: 12px;
}
.hero-chain-step {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 4px 8px;
  border-radius: var(--radius-pill);
  background: var(--gaw-surface-a12);
  color: var(--gaw-on-accent-a92);
  font-size: var(--font-size-xs);
  font-weight: 600;
  cursor: default;
}
.hero-chain-step i { font-size: var(--font-size-md); }
.hero-chain-step em {
  margin-inline-start: 3px;
  font-style: normal;
  color: var(--gaw-on-accent-a50);
}

.growth-entry-grid {
  display: grid;
  grid-template-columns: minmax(0, 1.08fr) minmax(380px, .92fr);
  gap: 14px;
  max-width: 1440px;
  margin: 0 auto 18px;
}
.creative-card, .platform-entry-card {
  min-width: 0; padding: 18px; border: 1px solid var(--color-border); border-radius: var(--radius-7);
  background: var(--color-bg-card); box-shadow: var(--gaw-shadow-2);
}
.entry-heading h2 { margin: 4px 0 5px; font-size: var(--font-size-xl); }
.entry-heading p { margin: 0 0 14px; color: var(--color-text-muted); font-size: 10.5px; line-height: 1.6; }
.file-input { display: none; }
.creative-source-actions {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 9px;
  margin-bottom: 9px;
}
.creative-source-button {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  align-items: center;
  gap: 10px;
  min-width: 0;
  padding: 10px 12px;
  border: 1px solid color-mix(in srgb, var(--gaw-ok) 28%, var(--color-border));
  border-radius: var(--radius-5);
  color: var(--color-text-primary);
  text-align: start;
  background: color-mix(in srgb, var(--gaw-ok) 4%, var(--color-bg-card));
  cursor: pointer;
  font: inherit;
}
.creative-source-button:hover {
  border-color: var(--gaw-ok-2);
  background: color-mix(in srgb, var(--gaw-ok) 9%, var(--color-bg-card));
}
.creative-source-button > i {
  display: grid;
  place-items: center;
  width: 34px;
  height: 34px;
  border-radius: var(--radius-4);
  color: var(--gaw-ok-2);
  background: color-mix(in srgb, var(--gaw-ok) 12%, var(--color-bg-card));
  font-size: var(--font-size-xl);
}
.creative-source-button > span { display: grid; min-width: 0; gap: 2px; }
.creative-source-button strong { font-size: 10.5px; }
.creative-source-button small { overflow: hidden; color: var(--color-text-muted); font-size: 8.5px; text-overflow: ellipsis; white-space: nowrap; }
.creative-dropzone {
  display: grid; grid-template-columns: auto minmax(0, 1fr) auto; align-items: center; gap: 13px;
  width: 100%; min-height: 92px; padding: 13px; border: 1.5px dashed color-mix(in srgb, var(--gaw-ok) 48%, var(--color-border));
  border-radius: var(--radius-6); text-align: start; color: var(--color-text-primary);
  background: color-mix(in srgb, var(--gaw-ok) 5%, var(--color-bg-input)); cursor: pointer; font-family: inherit;
  transition: border-color .18s ease, background .18s ease, transform .18s ease;
}
.creative-dropzone:hover, .creative-dropzone.dragging {
  border-color: var(--gaw-ok-2); background: color-mix(in srgb, var(--gaw-ok) 10%, var(--color-bg-card)); transform: translateY(-1px);
}
.upload-icon, .creative-preview {
  display: grid; place-items: center; width: 64px; height: 64px; overflow: hidden; border-radius: var(--radius-5);
  color: var(--gaw-ok-2); background: color-mix(in srgb, var(--gaw-ok) 12%, var(--color-bg-card)); font-size: 25px;
}
.creative-preview img { width: 100%; height: 100%; object-fit: cover; }
.creative-preview > i { font-size: 26px; }
.creative-meta { display: grid; min-width: 0; gap: 4px; }
.creative-meta strong { overflow: hidden; font-size: var(--font-size-sm); text-overflow: ellipsis; white-space: nowrap; }
.creative-meta small { color: var(--color-text-muted); font-size: 9.5px; }
.creative-meta em { color: var(--gaw-ok-2); font-size: 9px; font-style: normal; font-weight: 700; }
.uploaded-check { color: var(--gaw-ok-3); font-size: 20px; }
.creative-file-list {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 6px;
  max-height: 150px;
  margin-top: 9px;
  overflow-y: auto;
}
.creative-file-list > span {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  align-items: center;
  gap: 7px;
  min-width: 0;
  padding: 7px 9px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-3);
  background: var(--color-bg-input);
}
.creative-file-list > span > i { color: var(--gaw-ok-2); }
.creative-file-list > span { position: relative; }
.creative-remove {
  flex-shrink: 0; width: 22px; height: 22px; display: grid; place-items: center;
  border: 0; border-radius: var(--radius-2); background: transparent; color: var(--color-text-muted);
  cursor: pointer; opacity: 0; transition: opacity .15s ease;
}
.creative-file-list > span:hover .creative-remove { opacity: 1; }
.creative-remove:hover { color: var(--gaw-danger); background: color-mix(in srgb, var(--gaw-danger) 12%, transparent); }
.creative-file-list > span > span { display: grid; min-width: 0; gap: 2px; }
.creative-file-list strong,
.creative-file-list small { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.creative-file-list strong { font-size: 9.5px; }
.creative-file-list small { color: var(--color-text-muted); font-size: 8px; }
.creative-file-list .creative-more {
  display: flex;
  justify-content: center;
  color: var(--gaw-ok-2);
  font-size: 9.5px;
  font-weight: 800;
}
.creative-error, .quick-login-note {
  display: flex; align-items: flex-start; gap: 6px; margin: 9px 0 0; font-size: 9.5px; line-height: 1.5;
}
.creative-error { color: var(--gaw-danger); }
.creative-fields { display: grid; grid-template-columns: 1fr 1fr; gap: 9px; margin-top: 10px; }
.creative-fields .span-wide { grid-column: 1 / -1; }
.creative-fields label { display: grid; gap: 5px; color: var(--color-text-secondary); font-size: 9.5px; font-weight: 700; }
.creative-fields input {
  box-sizing: border-box; width: 100%; height: 36px; padding: 0 10px; border: 1px solid var(--color-border);
  border-radius: var(--radius-3); outline: none; color: var(--color-text-primary); background: var(--color-bg-input); font: inherit; font-size: 10.5px;
}
.creative-fields input:focus { border-color: var(--gaw-ok-2); box-shadow: var(--gaw-shadow-3); }
.platform-login-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 9px; }
.platform-access-tile {
  display: grid; min-width: 0; gap: 9px; padding: 10px;
  border: 1px solid color-mix(in srgb, var(--platform-color) 22%, var(--color-border));
  border-radius: var(--radius-5); background: color-mix(in srgb, var(--platform-color) 5%, var(--color-bg-input));
}
.access-tile-heading {
  /* 第三列放「本次投放」勾选：不占文字列宽，标题过长时先挤文字不挤勾选框。 */
  display: grid; grid-template-columns: auto minmax(0, 1fr) auto; align-items: center; gap: 9px;
}
/* 勾选框加进来后最后一个子元素是 label，原来的 span:last-child 会失配，改按 span 序号取。 */
.access-tile-heading > span:nth-of-type(2) { display: grid; min-width: 0; gap: 3px; }
.access-tile-include {
  display: inline-flex; align-items: center; gap: 4px; flex: 0 0 auto;
  color: var(--color-text-muted); font-size: 8.5px; cursor: pointer; user-select: none;
}
.access-tile-include input { margin: 0; cursor: pointer; }
.access-tile-heading strong { font-size: var(--font-size-xs); }
.access-tile-heading small { overflow: hidden; color: var(--color-text-muted); font-size: 8.5px; text-overflow: ellipsis; white-space: nowrap; }
.access-mode-switch {
  display: grid; grid-template-columns: 1fr 1fr; gap: 4px; padding: 3px;
  border: 1px solid var(--color-border); border-radius: var(--radius-3); background: var(--color-bg-card);
}
.access-mode-switch button {
  display: inline-flex; align-items: center; justify-content: center; gap: 4px; min-height: 27px;
  border: 0; border-radius: var(--radius-2); color: var(--color-text-muted); background: transparent;
  cursor: pointer; font: inherit; font-size: 9px; font-weight: 800;
}
.access-mode-switch button.active {
  color: var(--platform-color);
  background: color-mix(in srgb, var(--platform-color) 11%, var(--color-bg-card));
  box-shadow: var(--gaw-shadow-4);
}
.access-connect-button {
  display: inline-flex; align-items: center; justify-content: center; gap: 5px; min-height: 30px;
  border: 1px solid color-mix(in srgb, var(--platform-color) 28%, var(--color-border)); border-radius: var(--radius-3);
  color: var(--platform-color); background: var(--color-bg-card); cursor: pointer;
  font: inherit; font-size: 9px; font-weight: 800;
}
.access-connect-button:disabled { cursor: wait; opacity: .55; }
.platform-login {
  display: grid; grid-template-columns: auto minmax(0, 1fr) auto; align-items: center; gap: 9px;
  min-height: 60px; padding: 10px; border: 1px solid color-mix(in srgb, var(--platform-color) 22%, var(--color-border));
  border-radius: var(--radius-5); color: var(--color-text-primary); background: color-mix(in srgb, var(--platform-color) 5%, var(--color-bg-input));
  cursor: pointer; text-align: start; font-family: inherit; transition: transform .18s ease, border-color .18s ease, box-shadow .18s ease;
}
.platform-login:hover {
  transform: translateY(-2px); border-color: color-mix(in srgb, var(--platform-color) 58%, var(--color-border));
  box-shadow: var(--gaw-shadow-5);
}
.platform-login:disabled { cursor: wait; opacity: .62; }
.platform-logo {
  display: grid; place-items: center; width: 36px; height: 36px; border-radius: var(--radius-4);
  color: var(--color-on-accent); background: var(--platform-color); font-size: var(--font-size-xl);
}
.platform-login > span:nth-child(2) { display: grid; min-width: 0; gap: 3px; }
.platform-login strong { font-size: var(--font-size-xs); }
.platform-login small { overflow: hidden; color: var(--color-text-muted); font-size: 8.5px; text-overflow: ellipsis; white-space: nowrap; }
.platform-login > i:last-child { color: var(--platform-color); }
.quick-login-note {
  padding: 9px; border-radius: var(--radius-3); color: var(--gaw-ok-4); background: color-mix(in srgb, var(--gaw-ok) 9%, var(--color-bg-card));
}
.generated-ad-preview {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(300px, 420px);
  gap: 24px;
  align-items: center;
  max-width: 1440px;
  margin: 0 auto 18px;
  padding: 24px;
  border: 1px solid color-mix(in srgb, var(--gaw-brand) 34%, var(--color-border));
  border-radius: var(--radius-8);
  background:
    var(--gaw-grad-2);
  box-shadow: var(--gaw-shadow-6);
}
.ad-preview-copy h2 { margin: 5px 0 7px; font-size: 22px; }
.ad-preview-copy > p { max-width: 680px; margin: 0; color: var(--color-text-secondary); font-size: var(--font-size-sm); line-height: 1.7; }
.ad-preview-platforms { display: flex; flex-wrap: wrap; gap: 7px; margin: 16px 0; }
.ad-preview-platforms button {
  display: inline-flex; align-items: center; gap: 6px; min-height: 34px; padding: 0 11px;
  border: 1px solid var(--color-border); border-radius: var(--radius-4); color: var(--color-text-secondary);
  background: var(--color-bg-input); cursor: pointer; font: inherit; font-size: 10px; font-weight: 800;
}
.ad-preview-platforms button.active {
  border-color: color-mix(in srgb, var(--platform-color) 55%, var(--color-border));
  color: var(--platform-color);
  background: color-mix(in srgb, var(--platform-color) 9%, var(--color-bg-card));
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--platform-color) 8%, transparent);
}
.ad-preview-copy ul { display: grid; gap: 8px; margin: 0; padding: 0; list-style: none; }
.ad-preview-copy li { display: flex; align-items: center; gap: 7px; color: var(--color-text-secondary); font-size: 10.5px; }
.ad-preview-copy li i { color: var(--gaw-ok-5); font-size: var(--font-size-base); }
.ad-preview-device {
  overflow: hidden;
  border: 1px solid color-mix(in srgb, var(--platform-color) 28%, var(--color-border));
  border-radius: var(--radius-7);
  background: var(--color-bg-card);
  box-shadow: var(--gaw-shadow-7);
}
.ad-preview-device > header {
  display: grid; grid-template-columns: auto minmax(0, 1fr) auto; align-items: center; gap: 9px; padding: 12px;
}
.ad-preview-device > header > div { display: grid; gap: 2px; }
.ad-preview-device > header strong { font-size: var(--font-size-xs); }
.ad-preview-device > header small { color: var(--color-text-muted); font-size: 8.5px; }
.ad-preview-device > header > i { color: var(--color-text-muted); }
.ad-preview-avatar {
  display: grid; place-items: center; width: 34px; height: 34px; border-radius: 50%;
  color: var(--color-on-accent); background: var(--gaw-grad-3); font-size: var(--font-size-md); font-weight: 900;
}
.ad-preview-visual { position: relative; min-height: 230px; overflow: hidden; background: var(--gaw-dark); }
.ad-preview-visual img { display: block; width: 100%; height: 260px; object-fit: cover; }
.ad-preview-visual::after {
  position: absolute; inset: auto 0 0; height: 42%; content: '';
  background: var(--gaw-grad-4); pointer-events: none;
}
.ad-preview-video { display: grid; place-items: center; gap: 8px; min-height: 230px; color: var(--color-on-accent); }
.ad-preview-video i { font-size: 42px; }
.ad-preview-video span { max-width: 80%; overflow: hidden; font-size: 10px; text-overflow: ellipsis; white-space: nowrap; }
.ad-preview-market {
  position: absolute; z-index: 1; inset-inline-start: 12px; bottom: 11px; padding: 5px 8px;
  border-radius: var(--radius-pill); color: var(--color-on-accent); background: var(--gaw-dark-a64); backdrop-filter: var(--gaw-blur);
  font-size: 8px; font-weight: 900; letter-spacing: .08em;
}
.ad-preview-body { display: grid; gap: 5px; padding: 13px 14px 10px; text-align: start; }
.ad-preview-body > span { color: var(--platform-color); font-size: 8.5px; font-weight: 900; }
.ad-preview-body h3 { margin: 0; font-size: 17px; line-height: 1.45; }
.ad-preview-body p { margin: 0; color: var(--color-text-secondary); font-size: 10px; line-height: 1.6; }
.ad-preview-device > footer {
  display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 10px 14px 13px;
  border-top: 1px solid var(--color-border); background: var(--color-bg-input);
}
.ad-preview-device > footer > span { display: grid; gap: 2px; }
.ad-preview-device > footer small { color: var(--color-text-muted); font-size: 8px; }
.ad-preview-device > footer strong { font-size: 10px; }
.ad-preview-device > footer button {
  min-height: 31px; padding: 0 13px; border: 0; border-radius: var(--radius-3); color: var(--color-on-accent);
  background: var(--platform-color); font: inherit; font-size: 9px; font-weight: 900;
}
.demo-banner {
  display: flex;
  align-items: center;
  gap: 12px;
  max-width: 1440px;
  margin: 0 auto 18px;
  padding: 13px 15px;
  border: 1px solid color-mix(in srgb, var(--color-brand) 40%, var(--color-border));
  border-radius: var(--radius-6);
  background: color-mix(in srgb, var(--color-brand) 9%, var(--color-bg-card));
}
.demo-banner > i { color: var(--color-brand); font-size: 22px; }
.demo-banner > div { flex: 1; min-width: 0; }
.demo-banner strong { display: block; margin-bottom: 3px; }
.demo-banner p { margin: 0; color: var(--color-text-muted); font-size: var(--font-size-sm); }
.capability-console-heading {
  max-width: 1440px;
  margin: 8px auto 12px;
}
.capability-console-heading span,
.capability-console-heading strong { display: block; }
.capability-console-heading span { margin-bottom: 3px; color: var(--color-brand); font-size: 10px; font-weight: 800; letter-spacing: .08em; text-transform: uppercase; }
.capability-console-heading strong { font-size: var(--font-size-lg); }

@container main-page (max-width: 980px) {
  .generated-ad-preview { grid-template-columns: 1fr; }
  .ad-preview-device { width: min(100%, 460px); justify-self: center; }
}

.hero h1 { margin: 7px 0 6px; font-size: clamp(24px, 3vw, 34px); letter-spacing: -.035em; }
.hero p { max-width: 880px; margin: 0; font-size: var(--font-size-base); line-height: 1.72; }
.eyebrow, .section-kicker { color: var(--color-brand); font-size: var(--font-size-xs); font-weight: 800; letter-spacing: .1em; text-transform: uppercase; }
.eyebrow { display: inline-flex; align-items: center; gap: 7px; }

.region-gate, .truth-grid, .panel {
  max-width: 1440px;
  margin-inline: auto;
}

.region-gate {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  align-items: center;
  gap: 14px;
  padding: 16px 18px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-7);
  background: var(--color-bg-card);
  box-shadow: var(--shadow-sm);
}

.region-gate.allowed { border-color: color-mix(in srgb, var(--gaw-ok-6) 34%, var(--color-border)); background: color-mix(in srgb, var(--gaw-ok-6) 7%, var(--color-bg-card)); }
.region-gate.blocked { border-color: color-mix(in srgb, var(--gaw-danger-2) 42%, var(--color-border)); background: color-mix(in srgb, var(--gaw-danger-2) 8%, var(--color-bg-card)); }
.region-gate.unavailable { border-color: color-mix(in srgb, var(--gaw-warn-3) 42%, var(--color-border)); background: color-mix(in srgb, var(--gaw-warn-3) 8%, var(--color-bg-card)); }
.gate-icon { display: grid; place-items: center; width: 42px; height: 42px; border-radius: var(--radius-5); color: var(--color-brand); background: var(--color-brand-subtle); font-size: 20px; }
.blocked .gate-icon { color: var(--gaw-danger-2); background: color-mix(in srgb, var(--gaw-danger-2) 13%, transparent); }
.region-gate strong { font-size: var(--font-size-base); }
.region-gate p { margin: 4px 0 0; color: var(--color-text-secondary); font-size: 12.5px; line-height: 1.55; }
.gate-state { padding: 5px 10px; border-radius: var(--radius-pill); color: var(--color-text-secondary); background: var(--color-bg-input); font-size: var(--font-size-xs); font-weight: 800; }

.truth-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
  margin-top: 12px;
}
.truth-grid article {
  display: flex;
  align-items: flex-start;
  gap: 11px;
  padding: 14px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-6);
  background: var(--color-bg-card);
}
.truth-grid i { margin-top: 1px; color: var(--gaw-warn-4); font-size: 19px; }
.truth-grid div { display: grid; gap: 4px; }
.truth-grid strong { font-size: 12.5px; }
.truth-grid span { color: var(--color-text-secondary); font-size: 11.5px; line-height: 1.5; }

.panel {
  margin-top: 16px;
  padding: 20px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-7);
  background: var(--color-bg-card);
  box-shadow: var(--shadow-sm);
}
.section-head { display: flex; align-items: center; justify-content: space-between; gap: 18px; margin-bottom: 16px; }
.section-head h2 { margin: 4px 0 0; font-size: var(--font-size-xl); }
.muted { color: var(--color-text-muted); font-size: 11.5px; }
.safe-badge { display: inline-flex; align-items: center; gap: 6px; padding: 6px 10px; border-radius: var(--radius-pill); color: var(--gaw-ok-7); background: color-mix(in srgb, var(--gaw-ok-6) 12%, transparent); font-size: var(--font-size-xs); font-weight: 800; }

.platform-grid { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 12px; }
.platform-card { min-width: 0; padding: 14px; border: 1px solid var(--color-border); border-radius: var(--radius-6); background: var(--color-bg-input); }
.platform-title { display: grid; grid-template-columns: auto minmax(0, 1fr) auto; align-items: center; gap: 9px; }
.platform-mark { display: grid; place-items: center; width: 34px; height: 34px; border-radius: var(--radius-4); color: var(--color-on-accent); background: var(--gaw-grad-5); font-weight: 900; }
.platform-title div { min-width: 0; display: grid; gap: 2px; }
.platform-title strong { font-size: var(--font-size-md); }
.platform-title div span { overflow: hidden; color: var(--color-text-muted); font-size: 10px; text-overflow: ellipsis; white-space: nowrap; }
.status-pill { display: inline-flex; width: fit-content; padding: 4px 7px; border-radius: var(--radius-pill); font-size: 10px; font-weight: 800; white-space: nowrap; }
.status-pill.ready, .result-ok { color: var(--gaw-ok-7); background: color-mix(in srgb, var(--gaw-ok-6) 13%, transparent); }
.status-pill.warning { color: var(--gaw-warn-5); background: color-mix(in srgb, var(--gaw-warn-3) 15%, transparent); }
.status-pill.error, .result-bad { color: var(--gaw-danger-3); background: color-mix(in srgb, var(--gaw-danger-2) 13%, transparent); }
.status-pill.muted { color: var(--color-text-muted); background: var(--color-bg-card); }
.result-warn { color: var(--gaw-warn-5); background: color-mix(in srgb, var(--gaw-warn-3) 15%, transparent); }
.result-pending { color: var(--color-brand); background: var(--color-brand-subtle); }
.platform-card dl { display: grid; gap: 7px; margin: 14px 0 0; }
.platform-card dl div { display: flex; justify-content: space-between; gap: 8px; }
.platform-card dt { color: var(--color-text-muted); font-size: 10.5px; }
.platform-card dd { overflow: hidden; margin: 0; color: var(--color-text-secondary); font-size: 10.5px; text-align: end; text-overflow: ellipsis; white-space: nowrap; }
.platform-warning { display: flex; align-items: flex-start; gap: 5px; margin: 10px 0 0; color: var(--gaw-warn-6); font-size: 10.5px; line-height: 1.45; word-break: break-word; }
.capabilities { display: flex; flex-wrap: wrap; gap: 4px; margin-top: 10px; }
.capabilities span { padding: 3px 6px; border: 1px solid var(--color-border); border-radius: var(--radius-2); color: var(--color-text-muted); background: var(--color-bg-card); font-size: 9px; }
.platform-actions { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 10px; }
.mini-button { display: inline-flex; align-items: center; justify-content: center; gap: 4px; min-height: 28px; padding: 0 8px; border: 1px solid var(--color-border); border-radius: var(--radius-2); color: var(--color-text-secondary); background: var(--color-bg-card); cursor: pointer; font: inherit; font-size: 9.5px; font-weight: 750; }
.mini-button:disabled { cursor: not-allowed; opacity: .45; }
.mini-button.primary { border-color: color-mix(in srgb, var(--color-brand) 32%, var(--color-border)); color: var(--color-brand); background: var(--color-brand-subtle); }
.mini-button.warn { color: var(--gaw-warn-6); }
.operation-state { display: flex; align-items: flex-start; gap: 5px; margin: 9px 0 0; color: var(--gaw-ok-7); font-size: 10px; line-height: 1.45; }
.operation-state.bad { color: var(--gaw-danger); }
.web-session { display: grid; gap: 8px; margin-top: 9px; padding: 9px; border: 1px solid var(--color-border); border-radius: var(--radius-3); background: var(--color-bg-card); }
.web-session > div:first-child { display: grid; gap: 3px; }
.web-session strong { font-size: 10.5px; }
.web-session span { color: var(--color-text-muted); font-size: 9.5px; line-height: 1.45; }
.web-session-actions { display: flex; gap: 5px; }

.credential-backdrop {
  position: fixed; z-index: 3000; inset: 0; display: grid; place-items: center; padding: 24px;
  background: var(--gaw-dark-a58); backdrop-filter: var(--gaw-blur-2);
}
.credential-dialog {
  width: min(780px, calc(100vw - 48px)); max-height: min(820px, calc(100vh - 48px)); overflow: auto;
  border: 1px solid var(--color-border); border-radius: var(--radius-8); background: var(--color-bg-card);
  box-shadow: var(--gaw-shadow-8);
}
.credential-dialog > header {
  position: sticky; z-index: 2; top: 0; display: flex; align-items: flex-start; justify-content: space-between; gap: 18px;
  padding: 20px 22px 16px; border-bottom: 1px solid var(--color-border); background: var(--color-bg-card);
}
.credential-dialog > header h2 { margin: 5px 0; font-size: 20px; }
.credential-dialog > header p { margin: 0; color: var(--color-text-muted); font-size: var(--font-size-xs); line-height: 1.55; }
.credential-dialog > header > button {
  display: grid; flex: 0 0 auto; width: 34px; height: 34px; place-items: center; border: 1px solid var(--color-border);
  border-radius: var(--radius-4); color: var(--color-text-secondary); background: var(--color-bg-input); cursor: pointer; font-size: var(--font-size-xl);
}
.credential-info {
  display: flex; align-items: flex-start; gap: 7px; margin: 16px 22px 0; padding: 10px 12px;
  border-radius: var(--radius-4); color: var(--gaw-warn-7); background: color-mix(in srgb, var(--gaw-warn-3) 11%, var(--color-bg-card));
  font-size: 10.5px; line-height: 1.55;
}
.credential-dialog form { padding: 18px 22px 22px; }
.credential-fields { display: grid; grid-template-columns: 1fr 1fr; gap: 14px 12px; }
.credential-fields label { display: grid; min-width: 0; gap: 6px; }
.credential-fields label > span { display: flex; align-items: center; gap: 7px; color: var(--color-text-secondary); font-size: 10.5px; font-weight: 750; }
.credential-fields label > span em {
  padding: 2px 5px; border-radius: var(--radius-1); color: var(--gaw-danger-4); background: color-mix(in srgb, var(--gaw-danger-2) 10%, transparent);
  font-size: 8px; font-style: normal;
}
.credential-fields label > span small { color: var(--color-text-muted); font-size: 8px; font-weight: 500; }
.credential-fields label > small { color: var(--color-text-muted); font-size: 8.5px; line-height: 1.45; }
/* 裸 <select> 会走系统原生外观（浅底 + 原生箭头），跟同一行的深色 input 明显不是一套 ——
   统一按 .credential-input input 的规格重画，箭头用内联 SVG 背景补回来。 */
.credential-fields select {
  box-sizing: border-box; width: 100%; height: 40px; padding: 0 32px 0 11px; border: 1px solid var(--color-border);
  border-radius: var(--radius-4); outline: none; color: var(--color-text-primary); background-color: var(--color-bg-input);
  font: inherit; font-size: var(--font-size-xs); appearance: none; -webkit-appearance: none; cursor: pointer;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6' viewBox='0 0 10 6'%3E%3Cpath d='M1 1l4 4 4-4' fill='none' stroke='%238b8fa3' stroke-width='1.6' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E");
  background-repeat: no-repeat; background-position: right 11px center;
}
[dir='rtl'] .credential-fields select { padding: 0 11px 0 32px; background-position: left 11px center; }
.credential-fields select:focus { border-color: var(--color-brand); box-shadow: var(--shadow-focus); }
.credential-input { display: grid; grid-template-columns: minmax(0, 1fr); }
.credential-input.secret { grid-template-columns: minmax(0, 1fr) 38px; }
.credential-input input {
  box-sizing: border-box; width: 100%; height: 40px; padding: 0 11px; border: 1px solid var(--color-border);
  border-radius: var(--radius-4); outline: none; color: var(--color-text-primary); background: var(--color-bg-input); font: inherit; font-size: var(--font-size-xs);
}
.credential-input.secret input { border-start-end-radius: 0; border-end-end-radius: 0; }
.credential-input input:focus { border-color: var(--color-brand); box-shadow: var(--shadow-focus); }
.credential-input button {
  border: 1px solid var(--color-border); border-inline-start: 0; border-start-end-radius: var(--radius-4); border-end-end-radius: var(--radius-4);
  color: var(--color-text-muted); background: var(--color-bg-input); cursor: pointer;
}
.creative-source-button.chosen {
  position: relative;
  border-color: color-mix(in srgb, var(--color-brand) 55%, var(--color-border));
  background: color-mix(in srgb, var(--color-brand) 7%, transparent);
}
.creative-source-button .chosen-mark {
  position: absolute; top: 8px; inset-inline-end: 10px;
  color: var(--color-brand); font-size: var(--font-size-lg);
}
.prompt-brief { display: grid; gap: 4px; margin: 10px 0 4px; }
.prompt-brief > span { color: var(--color-text-secondary); font-size: 10px; font-weight: 700; }
.prompt-brief textarea {
  box-sizing: border-box; width: 100%; padding: 8px 10px; border: 1px solid var(--color-border);
  border-radius: var(--radius-3); background: var(--color-bg-input); color: var(--color-text-primary);
  font: inherit; font-size: var(--font-size-xs); resize: vertical;
}

.prompt-inline { margin-top: 12px; padding: 12px 14px; border: 1px solid var(--color-border); border-radius: var(--radius-5); }
.prompt-inline > header { display: flex; align-items: center; gap: 10px; margin-bottom: 4px; }
.prompt-inline > header span { display: flex; align-items: center; gap: 6px; font-size: 12.5px; font-weight: 700; }
.prompt-inline > header small { flex: 1; min-width: 0; color: var(--color-text-secondary); font-size: 10.5px; }
.prompt-inline .prompt-scenes { max-height: none; }

.prompt-actions { display: flex; align-items: center; gap: 10px; margin-top: 14px; }
.prompt-actions small { color: var(--color-text-secondary); font-size: 10.5px; line-height: 1.45; }
.prompt-scenes { display: grid; gap: 10px; margin: 12px 0 0; padding: 0; list-style: none; max-height: 42vh; overflow-y: auto; }
.prompt-scenes li { padding: 10px 12px; border: 1px solid var(--color-border); border-radius: var(--radius-4); }
.prompt-scenes li > header { display: flex; align-items: center; gap: 8px; margin-bottom: 8px; }
.prompt-scenes li > header strong { font-size: 11.5px; }
.prompt-scenes li > header small {
  flex: 1; min-width: 0; color: var(--color-text-muted); font-size: 10px;
  overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
}
.prompt-scenes li > header em { display: flex; align-items: center; gap: 4px; color: var(--color-text-muted); font-size: 10px; font-style: normal; }
.prompt-scenes li > header em input { width: 46px; height: 26px; padding: 0 6px; border: 1px solid var(--color-border); border-radius: var(--radius-2); background: var(--color-bg-input); color: var(--color-text-primary); font: inherit; font-size: 10.5px; }
.prompt-scenes li > label { display: grid; gap: 4px; margin-top: 6px; }
.prompt-scenes li > label > span { color: var(--color-text-secondary); font-size: 10px; font-weight: 700; }
.prompt-scenes li textarea,
.prompt-scenes li > label input {
  box-sizing: border-box; width: 100%; padding: 7px 9px; border: 1px solid var(--color-border);
  border-radius: var(--radius-3); background: var(--color-bg-input); color: var(--color-text-primary);
  font: inherit; font-size: var(--font-size-xs); resize: vertical;
}

.credential-hint { display: flex; align-items: flex-start; gap: 6px; margin: 14px 0 0; color: var(--color-text-secondary); font-size: 10.5px; }
.credential-error { display: flex; align-items: flex-start; gap: 6px; margin: 14px 0 0; color: var(--gaw-danger); font-size: 10.5px; }
.credential-dialog footer { display: flex; justify-content: flex-end; gap: 9px; margin-top: 20px; padding-top: 16px; border-top: 1px solid var(--color-border); }

.campaign-grid { display: grid; grid-template-columns: minmax(0, 1.35fr) minmax(320px, .65fr); gap: 16px; align-items: start; }
.field-row, .review-controls { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 10px; }
.review-controls { grid-template-columns: repeat(4, minmax(0, 1fr)); }
.field { display: grid; gap: 6px; min-width: 0; color: var(--color-text-secondary); font-size: var(--font-size-xs); font-weight: 700; }
.field > span { display: flex; justify-content: space-between; gap: 8px; }
.field small { color: var(--color-text-muted); font-weight: 500; }
.field input, .field select, .field textarea {
  box-sizing: border-box;
  width: 100%;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-4);
  outline: none;
  color: var(--color-text-primary);
  background: var(--color-bg-input);
  font: inherit;
  font-size: 12.5px;
}
.field input, .field select { height: 39px; padding: 0 10px; }
.field textarea { resize: vertical; min-height: 330px; padding: 12px; font: 12px/1.6 ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; direction: ltr; text-align: left; }
.field input:focus, .field select:focus, .field textarea:focus { border-color: var(--color-brand); box-shadow: var(--shadow-focus); }
.field textarea[aria-invalid="true"] { border-color: var(--gaw-danger-2); }
.spec-field { margin-top: 12px; }
.campaign-actions, .review-actions { display: flex; flex-wrap: wrap; gap: 9px; margin-top: 12px; }
.action-note { display: flex; align-items: flex-start; gap: 6px; margin: 9px 0 0; color: var(--color-text-muted); font-size: 10.5px; line-height: 1.5; }

.button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
  min-height: 39px;
  padding: 0 14px;
  border: 1px solid transparent;
  border-radius: var(--radius-4);
  cursor: pointer;
  font: inherit;
  font-size: 11.5px;
  font-weight: 800;
}
.button:disabled { cursor: not-allowed; opacity: .45; }
.button.primary { color: var(--color-on-accent); background: var(--color-brand); }
.button.danger { color: var(--color-on-accent); background: var(--gaw-danger-5); }
.button.ghost { border-color: var(--color-border); color: var(--color-text-primary); background: var(--color-bg-card); }
.button.compact { min-height: 32px; padding: 0 10px; font-size: 10.5px; }

.confirmation-card { position: sticky; top: 14px; padding: 15px; border: 1px solid var(--color-border); border-radius: var(--radius-6); background: var(--color-bg-input); }
.confirmation-title { display: flex; align-items: center; gap: 9px; }
.confirmation-title > i { display: grid; place-items: center; width: 36px; height: 36px; border-radius: var(--radius-4); color: var(--color-brand); background: var(--color-brand-subtle); font-size: var(--font-size-xl); }
.confirmation-title div { display: grid; gap: 2px; }
.confirmation-title strong { font-size: var(--font-size-md); }
.confirmation-title span { color: var(--color-text-muted); font-size: 10.5px; }
.token-box, .empty-box { margin-top: 12px; padding: 12px; border: 1px dashed color-mix(in srgb, var(--color-brand) 42%, var(--color-border)); border-radius: var(--radius-4); background: var(--color-bg-card); }
.token-box { display: grid; gap: 7px; }
.token-box.invalid { border-color: var(--gaw-danger-2); opacity: .72; }
.token-box code { overflow-wrap: anywhere; color: var(--color-brand); font-size: var(--font-size-sm); direction: ltr; text-align: left; }
.token-box span, .empty-box { color: var(--color-text-muted); font-size: 10.5px; line-height: 1.5; }
.token-warning, .inline-error { display: flex; align-items: flex-start; gap: 6px; color: var(--gaw-danger); font-size: var(--font-size-xs); line-height: 1.5; }
.token-warning { margin: 9px 0 0; }
.inline-error { margin: 10px 0 0; }

.result-block { margin-top: 13px; overflow: hidden; border: 1px solid var(--color-border); border-radius: var(--radius-4); background: var(--color-bg-card); }
.result-block.wide { margin-top: 14px; }
.result-title { display: flex; align-items: center; justify-content: space-between; gap: 10px; padding: 9px 11px; border-bottom: 1px solid var(--color-border); font-size: 10.5px; }
.result-title span { padding: 3px 6px; border-radius: var(--radius-pill); font-weight: 800; }
.result-block pre { max-height: 300px; overflow: auto; margin: 0; padding: 11px; color: var(--color-text-secondary); font: 10.5px/1.55 ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; white-space: pre-wrap; word-break: break-word; direction: ltr; text-align: left; }

.review-platforms { display: flex; flex-wrap: wrap; align-items: center; gap: 8px 15px; margin-top: 12px; padding: 11px; border: 1px solid var(--color-border); border-radius: var(--radius-4); background: var(--color-bg-input); color: var(--color-text-secondary); font-size: var(--font-size-xs); }
.review-platforms > span { font-weight: 800; }
.review-platforms label { display: inline-flex; align-items: center; gap: 5px; cursor: pointer; }
.metric-grid { display: grid; grid-template-columns: repeat(6, minmax(0, 1fr)); gap: 9px; margin-top: 16px; }
.metric-grid article { display: grid; gap: 5px; padding: 12px; border: 1px solid var(--color-border); border-radius: var(--radius-4); background: var(--color-bg-input); }
.metric-grid span { color: var(--color-text-muted); font-size: 10.5px; }
.metric-grid strong { font-size: var(--font-size-xl); }
.report-platform-grid { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 9px; margin-top: 10px; }
.report-platform-grid article { display: grid; gap: 5px; padding: 12px; border: 1px solid var(--color-border); border-radius: var(--radius-4); }
.report-platform-grid strong { margin-bottom: 3px; font-size: var(--font-size-sm); }
.report-platform-grid span { color: var(--color-text-secondary); font-size: 10.5px; }
.report-platform-grid em { margin-top: 4px; color: var(--color-brand); font-size: 10px; font-style: normal; }
.findings { margin-top: 16px; }
.findings h3 { margin: 0 0 9px; font-size: var(--font-size-base); }
.findings article { display: grid; grid-template-columns: auto minmax(0, 1fr); gap: 10px; padding: 11px 0; border-top: 1px solid var(--color-border); }
.findings article > span { height: fit-content; padding: 3px 6px; border-radius: var(--radius-2); font-size: 9px; font-weight: 800; text-transform: uppercase; }
.severity-critical, .severity-high { color: var(--gaw-danger); background: color-mix(in srgb, var(--gaw-danger-2) 13%, transparent); }
.severity-warning, .severity-medium { color: var(--gaw-warn-5); background: color-mix(in srgb, var(--gaw-warn-3) 15%, transparent); }
.severity-info, .severity-low { color: var(--color-brand); background: var(--color-brand-subtle); }
.findings strong { font-size: 11.5px; }
.findings p { margin: 3px 0; color: var(--color-text-secondary); font-size: var(--font-size-xs); line-height: 1.5; }
.findings small { color: var(--color-text-muted); font-size: 10.5px; }
.report-notes { display: flex; align-items: flex-start; gap: 7px; margin: 14px 0 0; padding: 11px; border-radius: var(--radius-4); color: var(--gaw-warn-8); background: color-mix(in srgb, var(--gaw-warn-3) 10%, var(--color-bg-card)); font-size: 10.5px; line-height: 1.55; }

.audit-filters { display: grid; grid-template-columns: 180px minmax(min(100%, 220px), 1fr) auto; align-items: end; gap: 9px; margin-bottom: 12px; }
.section-state { display: flex; align-items: center; justify-content: center; gap: 8px; min-height: 90px; color: var(--color-text-muted); font-size: var(--font-size-sm); }
.audit-table-wrap { overflow-x: auto; border: 1px solid var(--color-border); border-radius: var(--radius-4); }
.audit-table { width: 100%; border-collapse: collapse; font-size: 10.5px; }
.audit-table th, .audit-table td { padding: 10px; border-bottom: 1px solid var(--color-border); text-align: start; vertical-align: middle; white-space: nowrap; }
.audit-table th { color: var(--color-text-muted); background: var(--color-bg-input); font-size: 9.5px; text-transform: uppercase; }
.audit-table tbody tr:last-child td { border-bottom: 0; }
.audit-table td span, .audit-table td small { display: block; width: fit-content; margin-top: 3px; color: var(--color-text-muted); font-size: 9px; }
.audit-table td .status-pill { color: inherit; }
.audit-pagination {
  display: flex; align-items: center; justify-content: space-between; gap: 14px; padding: 11px 12px;
  border-top: 1px solid var(--color-border); background: var(--color-bg-input);
}
.audit-pagination > span { color: var(--color-text-muted); font-size: 10px; }
.audit-pagination > div { display: flex; flex-wrap: wrap; justify-content: flex-end; gap: 5px; }
.audit-pagination button {
  display: inline-flex; align-items: center; justify-content: center; min-width: 30px; height: 30px; padding: 0 8px;
  border: 1px solid var(--color-border); border-radius: var(--radius-2); color: var(--color-text-secondary);
  background: var(--color-bg-card); cursor: pointer; font: inherit; font-size: 9.5px; font-weight: 750;
}
.audit-pagination button.active { border-color: var(--color-brand); color: var(--color-on-accent); background: var(--color-brand); }
.audit-pagination button:disabled { cursor: not-allowed; opacity: .42; }

.spin { animation: spin .8s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }

[dir="rtl"] .hero, [dir="rtl"] .section-head { text-align: right; }
[dir="rtl"] .eyebrow i, [dir="rtl"] .button i, [dir="rtl"] .action-note i, [dir="rtl"] .report-notes i { margin-inline: 0; }

@container main-page (max-width: 1180px) {
  .growth-entry-grid { grid-template-columns: 1fr; }
  .platform-grid, .report-platform-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .campaign-grid { grid-template-columns: 1fr; }
  .confirmation-card { position: static; }
  .metric-grid { grid-template-columns: repeat(3, minmax(0, 1fr)); }
}

@container main-page (max-width: 760px) {
  .ads-workbench { padding: 14px; }
  .hero { flex-direction: column; }
  .creative-source-actions, .creative-file-list { grid-template-columns: 1fr; }
  .creative-fields, .platform-login-grid, .credential-fields { grid-template-columns: 1fr; }
  .creative-dropzone { grid-template-columns: auto minmax(0, 1fr); }
  .uploaded-check { display: none; }
  .truth-grid, .platform-grid, .report-platform-grid, .field-row, .review-controls, .metric-grid { grid-template-columns: 1fr; }
  .region-gate { grid-template-columns: auto minmax(0, 1fr); }
  .gate-state { grid-column: 2; }
  .audit-filters { grid-template-columns: 1fr; }
  .audit-pagination { align-items: flex-start; flex-direction: column; }
  .audit-pagination > div { justify-content: flex-start; }
  .section-head { align-items: flex-start; flex-direction: column; }
}

@media (prefers-reduced-motion: reduce) {
  .spin { animation-duration: 1.6s; }
}

/* ══ 多 Tab 导航（#3）══ */
.ads-tabs {
  display: flex;
  gap: 6px;
  max-width: 1440px;
  margin: 4px auto 0;
  padding: 6px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-6);
  background: var(--color-bg-secondary, var(--gaw-muted-a6));
  overflow-x: auto;
}
.ads-tabs button {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 9px 16px;
  border: none;
  border-radius: var(--radius-4);
  background: transparent;
  color: var(--color-text-secondary);
  font-size: 13.5px;
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
  transition: background .15s ease, color .15s ease;
}
.ads-tabs button:hover { color: var(--color-text-primary); }
.ads-tabs button.active {
  background: var(--color-primary, var(--gaw-info));
  color: var(--color-on-accent);
}
.ads-tab-intro {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  max-width: 1440px;
  margin: 10px auto 16px;
  padding: 0 4px;
  color: var(--color-text-secondary);
  font-size: var(--font-size-md);
  line-height: 1.6;
}
.ads-tab-intro i { flex-shrink: 0; margin-top: 2px; }
.growth-entry-grid.solo { grid-template-columns: 1fr; }
.tab-section-note {
  margin: 0 0 14px;
  color: var(--color-text-secondary);
  font-size: 12.5px;
  line-height: 1.6;
}

/* ══ 制作引擎配置（#6）══ */
.media-engine-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 280px), 1fr));
  gap: 12px;
}
.media-engine-chip {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-6);
  background: transparent;
  text-align: start;
  cursor: pointer;
  transition: border-color .15s ease, background .15s ease;
}
.media-engine-chip:hover { border-color: var(--color-primary, var(--gaw-info)); }
.media-engine-chip i { font-size: 22px; color: var(--color-text-secondary); }
.media-engine-chip span { display: grid; gap: 3px; min-width: 0; }
.media-engine-chip strong { font-size: 13.5px; }
.media-engine-chip small {
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.media-engine-chip em {
  font-style: normal;
  font-size: var(--font-size-sm);
  font-weight: 700;
  padding: 4px 10px;
  border-radius: var(--radius-pill);
  white-space: nowrap;
}
.media-engine-chip.tone-ready em { background: var(--gaw-ok-a14); color: var(--gaw-ok-8); }
.media-engine-chip.tone-partial em { background: var(--gaw-warn-a16); color: var(--gaw-warn-9); }
.media-engine-chip.tone-missing em { background: var(--gaw-danger-a13); color: var(--gaw-danger-6); }
.access-google-note {
  display: flex;
  align-items: flex-start;
  gap: 6px;
  margin: 8px 0 0;
  padding: 7px 9px;
  border-radius: var(--radius-3);
  background: var(--gaw-warn-a10);
  color: var(--gaw-warn-9);
  font-size: var(--font-size-xs);
  line-height: 1.5;
}
.access-google-note i { flex-shrink: 0; margin-top: 1px; }

.media-engine-warning {
  display: flex;
  align-items: center;
  gap: 7px;
  margin: 12px 0 0;
  color: var(--gaw-warn-9);
  font-size: 12.5px;
}

/* ══ 成片设置（#17）：卡片式选择，对齐短视频工作台的设计 ══ */
.production-settings {
  display: grid;
  gap: 14px;
  margin-top: 4px;
  padding-top: 12px;
  border-top: 1px dashed var(--color-border);
}
.ps-block { display: grid; gap: 8px; }
.ps-label { font-size: var(--font-size-md); font-weight: 700; }
.ps-modes {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 240px), 1fr));
  gap: 10px;
}
.ps-modes button {
  position: relative;
  display: grid;
  gap: 8px;
  justify-items: start;
  text-align: start;
  padding: 14px;
  border: 1.5px solid var(--color-border);
  border-radius: var(--radius-6);
  background: var(--color-bg-card);
  cursor: pointer;
  transition: border-color .15s ease, background .15s ease;
}
.ps-modes button:hover { border-color: color-mix(in srgb, var(--color-brand) 45%, var(--color-border)); }
.ps-modes button.active {
  border-color: var(--color-brand);
  background: color-mix(in srgb, var(--color-brand) 7%, var(--color-bg-card));
}
.ps-modes button.active::after {
  content: '✓';
  position: absolute;
  top: 8px;
  inset-inline-end: 8px;
  display: grid;
  place-items: center;
  width: 18px;
  height: 18px;
  border-radius: var(--radius-pill);
  background: var(--color-brand);
  color: var(--color-on-accent);
  font-size: var(--font-size-xs);
  font-weight: 800;
}
.ps-modes button > i {
  display: grid;
  place-items: center;
  width: 36px;
  height: 36px;
  border-radius: var(--radius-4);
  background: color-mix(in srgb, var(--color-brand) 12%, transparent);
  color: var(--color-brand);
  font-size: var(--font-size-xl);
}
.ps-modes button.active > i { background: var(--color-brand); color: var(--color-on-accent); }
.ps-modes button strong { display: block; font-size: 13.5px; }
.ps-modes button small {
  display: block;
  margin-top: 2px;
  color: var(--color-text-secondary);
  font-size: 11.5px;
  line-height: 1.5;
}
.ps-row {
  display: grid;
  grid-template-columns: minmax(180px, auto) minmax(0, 1fr) minmax(180px, auto);
  gap: 12px;
  align-items: end;
}
.ps-field { display: grid; gap: 5px; }
.ps-field > span { font-size: var(--font-size-sm); font-weight: 600; color: var(--color-text-secondary); }
.ps-hint { color: var(--color-text-secondary); font-size: var(--font-size-xs); line-height: 1.5; }
/* 成片比例多选（#22） */
.ps-aspects { display: flex; flex-wrap: wrap; gap: 8px; }
.ps-aspect {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 14px;
  border: 1.5px solid var(--color-border);
  border-radius: var(--radius-5);
  background: var(--color-bg-card);
  cursor: pointer;
  transition: border-color .15s ease, background .15s ease;
}
.ps-aspect:hover { border-color: color-mix(in srgb, var(--color-brand) 45%, var(--color-border)); }
.ps-aspect.on {
  border-color: var(--color-brand);
  background: color-mix(in srgb, var(--color-brand) 8%, var(--color-bg-card));
}
.ps-aspect input { width: 15px; height: 15px; accent-color: var(--color-brand); }
.ps-aspect span { display: grid; gap: 1px; }
.ps-aspect strong { font-size: var(--font-size-md); }
.ps-aspect small { color: var(--color-text-secondary); font-size: var(--font-size-xs); }
/* 配音与配乐独立一行（#23） */
.ps-audio-row {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(180px, 260px);
  gap: 12px;
  align-items: end;
}
@container main-page (max-width: 900px) {
  .ps-audio-row { grid-template-columns: 1fr; align-items: stretch; }
}
.ps-field select {
  padding: 9px 12px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-4);
  background: var(--color-bg-card);
  color: var(--color-text-primary);
  font-size: var(--font-size-md);
}
.ps-toggle {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 14px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-5);
  background: var(--color-bg-card);
  cursor: pointer;
}
/* 滑动开关（对齐短视频工作台的「生成 AI 旁白」样式） */
.ps-switch {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-6);
  background: var(--color-bg-card);
  cursor: pointer;
}
.ps-switch input { display: none; }
.ps-switch-icon {
  display: grid;
  place-items: center;
  width: 32px;
  height: 32px;
  border-radius: var(--radius-4);
  background: color-mix(in srgb, var(--color-brand) 12%, transparent);
  color: var(--color-brand);
  font-size: 16px;
}
.ps-switch-text { display: grid; gap: 2px; min-width: 0; }
.ps-switch-text strong { font-size: 13.5px; }
.ps-switch-text small { color: var(--color-text-secondary); font-size: 11.5px; }
.ps-switch-track {
  position: relative;
  width: 46px;
  height: 26px;
  border-radius: var(--radius-pill);
  background: color-mix(in srgb, var(--color-text-secondary) 32%, transparent);
  transition: background .18s ease;
}
.ps-switch-thumb {
  position: absolute;
  top: 3px;
  inset-inline-start: 3px;
  width: 20px;
  height: 20px;
  border-radius: var(--radius-pill);
  background: var(--gaw-surface);
  box-shadow: var(--gaw-shadow-9);
  transition: transform .18s ease;
}
.ps-switch.on .ps-switch-track { background: var(--color-brand); }
.ps-switch.on .ps-switch-thumb { transform: translateX(20px); }
[dir="rtl"] .ps-switch.on .ps-switch-thumb { transform: translateX(-20px); }
.ps-toggle input { width: 16px; height: 16px; accent-color: var(--color-brand); }
.ps-toggle strong { display: block; font-size: var(--font-size-md); }
.ps-toggle small { display: block; color: var(--color-text-secondary); font-size: 11.5px; }
@container main-page (max-width: 1180px) {
  .ps-row { grid-template-columns: 1fr; align-items: stretch; }
}

/* ══ 广告视频历史（#7）══ */
.ads-video-history { display: grid; gap: 10px; }
.ads-video-item {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  align-items: center;
  gap: 12px;
  padding: 12px 14px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-5);
}
.ads-video-item.selected { border-color: var(--color-primary, var(--gaw-info)); background: var(--gaw-info-a5); }
.ads-video-icon i { font-size: 22px; color: var(--color-text-secondary); }
.ads-video-meta { display: grid; gap: 2px; min-width: 0; }
.ads-video-meta strong { font-size: 13.5px; }
.ads-video-meta small {
  color: var(--color-text-secondary);
  font-size: 11.5px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.ads-video-meta em { font-style: normal; font-size: 11.5px; font-weight: 600; }
.ads-video-meta em.ok { color: var(--gaw-ok-8); }
.ads-video-meta em.pending { color: var(--gaw-warn-9); }
.ads-video-actions { display: flex; gap: 6px; flex-wrap: wrap; justify-content: flex-end; }
.refresh-history { justify-self: start; }

/* ══ 引导式投放工作区（左步骤 + 右历史）══ */
.campaign-guide {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 380px;
  gap: 16px;
  align-items: start;
  margin-bottom: 18px;
}
.guide-main { display: grid; gap: 12px; min-width: 0; }
.guide-main :deep(.wsb) { margin-bottom: 0; }
.guide-step { scroll-margin-top: 120px; }
.guide-step {
  border: 1px solid var(--color-border);
  border-radius: var(--radius-7);
  background: var(--color-bg-card);
  overflow: hidden;
}
.guide-step > header {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
}
.guide-step .step-no {
  display: grid;
  place-items: center;
  width: 30px;
  height: 30px;
  border-radius: var(--radius-pill);
  background: color-mix(in srgb, var(--color-brand) 12%, transparent);
  color: var(--color-brand);
  font-weight: 800;
  font-size: var(--font-size-base);
}
.guide-step.done .step-no { background: var(--gaw-ok-a16); color: var(--gaw-ok-8); }
.guide-step > header strong { display: block; font-size: var(--font-size-base); }
.guide-step > header small {
  display: block;
  margin-top: 2px;
  color: var(--color-text-secondary);
  font-size: 11.5px;
  line-height: 1.55;
}
.step-state {
  font-style: normal;
  font-size: 11.5px;
  font-weight: 700;
  padding: 4px 10px;
  border-radius: var(--radius-pill);
  white-space: nowrap;
}
.step-state.ok { background: var(--gaw-ok-a14); color: var(--gaw-ok-8); }
.step-state.todo { background: var(--gaw-warn-a16); color: var(--gaw-warn-9); }
.guide-step .step-body { padding: 0 16px 16px; display: grid; gap: 10px; }
.guide-platform-strip { display: flex; flex-wrap: wrap; gap: 8px; align-items: center; }
.guide-platform-chip {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 7px 12px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-pill);
  cursor: pointer;
  font-size: 12.5px;
  font-weight: 600;
}
.guide-platform-chip i { color: var(--platform-color); }
.guide-platform-chip.off { opacity: .45; }
.guide-platform-chip em { display: inline-flex; color: var(--gaw-warn-9); font-style: normal; }
.creative-source-button.generate { border-color: color-mix(in srgb, var(--color-brand) 45%, var(--color-border)); }
.guide-id-note {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 6px;
  padding: 8px 10px;
  border-radius: var(--radius-4);
  background: var(--gaw-warn-a8);
  font-size: 11.5px;
  color: var(--color-text-secondary);
  line-height: 1.6;
}
.guide-id-note > span { display: inline-flex; gap: 6px; align-items: flex-start; }
.guide-id-note i { color: var(--gaw-warn-9); }
.run-step.ready { border-color: color-mix(in srgb, var(--color-brand) 55%, var(--color-border)); }
.run-body { align-items: flex-start; }
.run-button { padding: 12px 26px; font-size: 14.5px; }
.run-blocked {
  display: flex;
  gap: 7px;
  margin: 0;
  color: var(--gaw-warn-9);
  font-size: 12.5px;
  line-height: 1.6;
}
.run-ok { display: flex; gap: 7px; margin: 0; color: var(--gaw-ok-8); font-size: 12.5px; }
.guide-side {
  position: sticky;
  top: 0;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-7);
  background: var(--color-bg-card);
  padding: 14px 16px;
  display: grid;
  gap: 10px;
  max-height: calc(100vh - 120px);
  overflow-y: auto;
}
.side-head { display: flex; align-items: center; justify-content: space-between; }
/* 窄栏里历史卡片改堆叠：图标+信息一行，操作按钮换行铺开，标题不再被挤成竖排 */
.guide-side .ads-video-item { grid-template-columns: auto minmax(0, 1fr); }
.guide-side .ads-video-actions { grid-column: 1 / -1; justify-content: flex-start; }
.guide-side .ads-video-meta strong { word-break: break-word; }
.side-head strong { font-size: var(--font-size-base); }
.side-note { margin: 0; color: var(--color-text-secondary); font-size: 11.5px; line-height: 1.6; }
@container main-page (max-width: 1180px) {
  .campaign-guide { grid-template-columns: 1fr; }
  .guide-side { position: static; max-height: none; }
}

/* ══ 各平台话题（#13）══ */
.platform-topics {
  margin-top: 14px;
  padding: 12px 14px;
  border: 1px dashed var(--color-border);
  border-radius: var(--radius-5);
  display: grid;
  gap: 10px;
}
.platform-topics-head { display: grid; gap: 2px; }
.platform-topics-head span { font-size: var(--font-size-md); font-weight: 700; }
.platform-topics-head small { color: var(--color-text-secondary); font-size: 11.5px; }
.platform-topics label {
  display: grid;
  grid-template-columns: 130px minmax(0, 1fr);
  align-items: center;
  gap: 10px;
}
.platform-topics label > span {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 12.5px;
  font-weight: 600;
}
.platform-topics input {
  padding: 7px 10px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-3);
  background: transparent;
  color: var(--color-text-primary);
  font-size: 12.5px;
}
.platform-topics-empty { margin: 0; color: var(--color-text-secondary); font-size: var(--font-size-sm); }

/* ══ 发布回执（#14）══ */
.section-note { margin: 3px 0 0; color: var(--color-text-muted); font-size: 10.5px; }
.ads-video-pager { display: flex; align-items: center; justify-content: center; gap: 10px; margin-top: 4px; }
.ads-video-pager span { color: var(--color-text-muted); font-size: 10.5px; font-weight: 700; }

.ads-video-aspect {
  display: inline-block; margin-inline-start: 6px; padding: 1px 6px; border: 1px solid var(--color-border);
  border-radius: var(--radius-pill); color: var(--color-text-muted); font-size: 9px; font-weight: 700; vertical-align: middle;
}

.ads-video-fit { display: flex; flex-wrap: wrap; gap: 4px 10px; margin-top: 2px; font-size: 9.5px; }
.ads-video-fit .fit-ok { color: var(--gaw-ok-9); font-weight: 650; }
.ads-video-fit .fit-miss { color: var(--color-text-muted); }

/* #28 发布运行状态：总进度条 + 每平台步骤清单（对齐工作流「实时执行记录」的读法） */
/* 第 5 步内嵌的「执行中」多节点面板：点完就在原地展开，不用去右侧找 */
.run-live {
  margin-top: 12px; padding: 12px 14px; border: 1px solid var(--color-border); border-radius: var(--radius-5);
  background: color-mix(in srgb, var(--color-bg-card) 70%, transparent);
}
.run-live.active {
  border-color: color-mix(in srgb, var(--color-brand) 55%, var(--color-border));
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--color-brand) 10%, transparent);
}
.run-live-head { display: flex; align-items: center; gap: 8px; margin-bottom: 9px; }
.run-live-head strong { font-size: 12.5px; }
.run-live-head i { color: var(--color-brand); }
.run-live-head em { margin-inline-start: auto; color: var(--color-text-muted); font-size: var(--font-size-xs); font-style: normal; font-weight: 700; }
.run-live-nodes { display: grid; gap: 6px; margin: 10px 0 0; padding: 0; list-style: none; }
.run-live-nodes li {
  display: flex; align-items: center; gap: 8px; padding: 7px 10px;
  border: 1px solid var(--color-border); border-radius: var(--radius-3); font-size: 11.5px;
  color: var(--color-text-secondary);
}
.run-live-nodes li strong { min-width: 78px; color: var(--color-text-primary); font-size: 11.5px; }
.run-live-nodes li i { width: 14px; text-align: center; }
.run-live-nodes li.running {
  border-color: color-mix(in srgb, var(--color-brand) 50%, var(--color-border));
  background: color-mix(in srgb, var(--color-brand) 7%, transparent);
}
.run-live-nodes li.running i { color: var(--color-brand); }
.run-live-nodes li.done i { color: var(--gaw-ok-9); }
.run-live-nodes li.failed { color: var(--gaw-danger); }
.run-live-nodes li.failed i { color: var(--gaw-danger); }
/* 取消是中性终态：走静音色，绝不用失败的红——用户自己叫停的不该看起来像出了错 */
.run-live-nodes li.cancelled { color: var(--color-text-muted); }
.run-live-nodes li.cancelled i { color: var(--color-text-muted); }
.run-live-head .run-retry { margin-inline-start: 10px; }
.run-live-nodes li .run-retry-one { margin-inline-start: auto; }
.run-live-nodes li .node-eta { margin-inline-start: auto; color: var(--color-text-muted); font-size: 10px; }
.run-gen-msg { margin: 9px 0 8px; color: var(--color-text-secondary); font-size: var(--font-size-xs); line-height: 1.5; word-break: break-word; }

.publish-runs { margin-top: 14px; display: grid; gap: 9px; }
.publish-runs-head { display: flex; align-items: center; justify-content: space-between; }
.publish-runs-head strong { font-size: var(--font-size-md); }
.publish-runs-head em { color: var(--color-text-muted); font-size: var(--font-size-xs); font-style: normal; font-weight: 700; }
.publish-progress-bar { height: 4px; border-radius: var(--radius-pill); background: var(--color-border); overflow: hidden; }
.publish-progress-bar span {
  display: block; height: 100%; border-radius: var(--radius-pill); background: var(--color-brand);
  transition: width .35s ease;
}
.publish-run { padding: 10px 12px; border: 1px solid var(--color-border); border-radius: var(--radius-4); }
.publish-run.running { border-color: color-mix(in srgb, var(--color-brand) 45%, var(--color-border)); }
.publish-run.failed { border-color: color-mix(in srgb, var(--gaw-danger) 40%, var(--color-border)); }
.publish-run header { display: flex; align-items: center; gap: 7px; }
.publish-run header strong { font-size: 12.5px; }
.publish-run header .run-aspect {
  padding: 1px 6px; border: 1px solid var(--color-border); border-radius: var(--radius-pill);
  color: var(--color-text-muted); font-size: 9.5px; font-weight: 700;
}
.publish-run header .status-pill { margin-inline-start: auto; font-style: normal; }
.publish-run .run-file {
  display: block; margin-top: 3px; color: var(--color-text-muted); font-size: 10px;
  overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
}
.publish-run .run-steps { display: grid; gap: 3px; margin: 8px 0 0; padding: 0; list-style: none; }
.publish-run .run-steps li {
  display: flex; align-items: center; gap: 6px;
  color: var(--color-text-muted); font-size: var(--font-size-xs);
}
.publish-run .run-steps li i { width: 13px; font-size: var(--font-size-xs); text-align: center; }
.publish-run .run-steps li.running { color: var(--color-text-primary); font-weight: 650; }
.publish-run .run-steps li.running i { color: var(--color-brand); }
.publish-run .run-steps li.done { color: var(--color-text-secondary); }
.publish-run .run-steps li.done i { color: var(--gaw-ok-9); }
.publish-run .run-steps li.failed { color: var(--gaw-danger); }
.publish-run .run-steps li.skipped { opacity: .5; }
.publish-run .run-detail {
  margin: 8px 0 0; color: var(--color-text-secondary); font-size: 11.5px; line-height: 1.55; word-break: break-word;
}

.publish-receipts { margin-top: 14px; display: grid; gap: 8px; }
.publish-receipts h3 { margin: 0 0 2px; font-size: 13.5px; }
.publish-receipts article {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  gap: 10px;
  align-items: flex-start;
  padding: 10px 12px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-4);
}
.publish-receipts article strong { font-size: 12.5px; }
.publish-receipts article p {
  margin: 2px 0 0;
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
  line-height: 1.55;
  word-break: break-word;
}

/* ══ 定时自动化（#8）══ */
.cron-list { display: grid; gap: 10px; }
.cron-item {
  display: grid;
  grid-template-columns: minmax(0, 1.4fr) minmax(220px, .6fr);
  gap: 14px;
  align-items: center;
  padding: 12px 14px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-5);
}
.cron-toggle { display: flex; align-items: flex-start; gap: 10px; cursor: pointer; }
.cron-toggle input { margin-top: 3px; }
.cron-toggle span { display: grid; gap: 2px; }
.cron-toggle strong { font-size: 13.5px; }
.cron-toggle small { color: var(--color-text-secondary); font-size: var(--font-size-sm); line-height: 1.5; }
.cron-expr { display: grid; gap: 4px; }
.cron-expr span { font-size: 11.5px; color: var(--color-text-secondary); }
.cron-expr input {
  padding: 7px 10px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-3);
  background: transparent;
  color: var(--color-text-primary);
  font-family: var(--font-mono);
  font-size: 12.5px;
}
.cron-expr small { color: var(--color-text-secondary); font-size: var(--font-size-xs); }
/* 人话排期控件（不暴露 cron 表达式） */
.cron-plan {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  align-items: flex-end;
}
.cron-plan > label { display: grid; gap: 4px; }
.cron-plan > label > span:first-child { font-size: 11.5px; color: var(--color-text-secondary); }
.cron-plan select {
  padding: 7px 10px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-3);
  background: transparent;
  color: var(--color-text-primary);
  font-size: 12.5px;
}
.cron-time { display: inline-flex; align-items: center; gap: 4px; }
.cron-time em { font-style: normal; color: var(--color-text-secondary); }
.cron-hint { align-self: center; color: var(--color-text-secondary); font-size: var(--font-size-xs); }
.cron-video-dir {
  grid-column: 1 / -1;
  display: grid;
  gap: 4px;
}
.cron-video-dir > span { font-size: 11.5px; color: var(--color-text-secondary); }

/* ══ 弹出层补充（成片预览 / 文件夹选择输入）══ */
.video-preview-dialog { max-width: 720px; }
.video-preview-dialog .preview-path {
  font-size: 11.5px;
  color: var(--color-text-secondary);
  word-break: break-all;
}
.video-preview-body {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 300px;
  padding: 12px 18px 18px;
}
.video-preview-body video {
  width: 100%;
  max-height: 60vh;
  border-radius: var(--radius-5);
  background: var(--gaw-dark-2);
}
.credential-input.with-action { display: flex; gap: 6px; }
.credential-input.with-action button {
  flex-shrink: 0;
  padding: 0 12px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-3);
  background: transparent;
  color: var(--color-text-secondary);
  cursor: pointer;
}
.credential-fields textarea {
  width: 100%;
  box-sizing: border-box;
  padding: 9px 11px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-3);
  background: transparent;
  color: var(--color-text-primary);
  font: inherit;
  font-size: var(--font-size-md);
  resize: vertical;
}
@container main-page (max-width: 900px) {
  .cron-item { grid-template-columns: 1fr; }
  .ads-video-item { grid-template-columns: auto minmax(0, 1fr); }
  .ads-video-actions { grid-column: 1 / -1; justify-content: flex-start; }
}

/* 按实际内容宽度重排，兼容浏览器分栏与嵌入设置页。 */
/* body 上的 Teleport 弹窗仍以视口为尺寸基准。 */
@media (max-width: 760px) {
  .credential-fields { grid-template-columns: 1fr; }
}
.ads-chart-card {
  margin-top: 16px;
  padding: 14px 16px 6px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-6);
  background: var(--color-bg-card);
}
.ads-chart-head {
  display: flex;
  align-items: baseline;
  gap: 10px;
  flex-wrap: wrap;
  margin-bottom: 6px;
}
.ads-chart-head strong { font-size: var(--font-size-md); }
.ads-chart-head em { font-style: normal; font-size: 11.5px; color: var(--color-text-muted); }
.ads-chart { height: 300px; width: 100%; }

/* ─── 调色板（docs/ui-design-system.md）：经典主题保持原值；界面主题（data-ui-theme）下映射全局 token ─── */
.ads-workbench, .credential-backdrop { /* ui-theme-exempt: 经典主题原值 */
  --gaw-warn: #c89d4b;
  --gaw-grad: radial-gradient(circle at 84% 15%, rgba(198, 155, 72, .24), transparent 18rem),
    radial-gradient(circle at 72% 110%, rgba(21, 147, 119, .23), transparent 22rem),
    linear-gradient(125deg, color-mix(in srgb, #082d3b 95%, var(--color-bg-card)), color-mix(in srgb, #0e5f59 82%, var(--color-bg-card)));
  --gaw-shadow: 0 20px 55px rgba(5, 39, 47, .16);
  --gaw-surface-a24: rgba(255,255,255,.24);
  --gaw-surface-a10: rgba(255,255,255,.1);
  --gaw-blur: blur(8px);
  --gaw-on-accent-a78: rgba(238, 250, 247, .78);
  --gaw-warn-2: #e6bd67;
  --gaw-surface-a13: rgba(255,255,255,.13);
  --gaw-on-accent-a82: rgba(255,255,255,.82);
  --gaw-surface-a7: rgba(255,255,255,.07);
  --gaw-surface-a12: rgba(255, 255, 255, .12);
  --gaw-on-accent-a92: rgba(255, 255, 255, .92);
  --gaw-on-accent-a50: rgba(255, 255, 255, .5);
  --gaw-shadow-2: 0 12px 34px rgba(15, 23, 42, .07);
  --gaw-ok: #11947b;
  --gaw-ok-2: #0e8b73;
  --gaw-ok-3: #10a47f;
  --gaw-danger: #bd3645;
  --gaw-shadow-3: 0 0 0 3px rgba(14,139,115,.1);
  --gaw-shadow-4: 0 1px 4px color-mix(in srgb, var(--platform-color) 15%, transparent);
  --gaw-shadow-5: 0 9px 22px color-mix(in srgb, var(--platform-color) 14%, transparent);
  --gaw-ok-4: #0b6d5c;
  --gaw-brand: #735cff;
  --gaw-grad-2: radial-gradient(circle at 90% 0, color-mix(in srgb, #735cff 13%, transparent), transparent 38%),
    var(--color-bg-card);
  --gaw-shadow-6: 0 16px 40px rgba(25, 31, 55, .08);
  --gaw-ok-5: #14a47f;
  --gaw-shadow-7: 0 18px 46px rgba(15, 23, 42, .16);
  --gaw-grad-3: linear-gradient(135deg, var(--platform-color), #7c4dff);
  --gaw-dark: #101626;
  --gaw-grad-4: linear-gradient(transparent, rgba(6, 10, 22, .54));
  --gaw-dark-a64: rgba(15, 23, 42, .64);
  --gaw-ok-6: #1b9b65;
  --gaw-danger-2: #dc3f4f;
  --gaw-warn-3: #d78b1f;
  --gaw-warn-4: #d17a17;
  --gaw-ok-7: #137950;
  --gaw-grad-5: linear-gradient(135deg, var(--color-brand), #3086e8);
  --gaw-warn-5: #9c620d;
  --gaw-danger-3: #bb3343;
  --gaw-warn-6: #a0650d;
  --gaw-dark-a58: rgba(15, 23, 42, .58);
  --gaw-blur-2: blur(5px);
  --gaw-shadow-8: 0 30px 90px rgba(15, 23, 42, .28);
  --gaw-warn-7: #76500f;
  --gaw-danger-4: #b83242;
  --gaw-danger-5: #c93648;
  --gaw-warn-8: #925f13;
  --gaw-muted-a6: rgba(127, 127, 127, .06);
  --gaw-info: #4f6bff;
  --gaw-ok-a14: rgba(46, 178, 108, .14);
  --gaw-ok-8: #2eb26c;
  --gaw-warn-a16: rgba(240, 165, 34, .16);
  --gaw-warn-9: #cf8a13;
  --gaw-danger-a13: rgba(233, 78, 78, .13);
  --gaw-danger-6: #e04e4e;
  --gaw-warn-a10: rgba(240, 165, 34, .1);
  --gaw-surface: #fff;
  --gaw-shadow-9: 0 1px 3px rgba(0, 0, 0, .3);
  --gaw-info-a5: rgba(79, 107, 255, .05);
  --gaw-ok-a16: rgba(46, 178, 108, .16);
  --gaw-warn-a8: rgba(240, 165, 34, .08);
  --gaw-ok-9: #2f9e6d;
  --gaw-dark-2: #000;
}
:root[data-ui-theme] .ads-workbench, :root[data-ui-theme] .credential-backdrop {
  /* hero 墨色底：浅色主题取主题正文色染一点品牌色，深色主题见下方 data-scheme="dark" */
  --gaw-ink: color-mix(in srgb, var(--color-brand) 16%, var(--color-text-primary));
  --gaw-warn: var(--color-warning);
  --gaw-grad: var(--gaw-ink);
  --gaw-shadow: var(--shadow-pop);
  --gaw-surface-a24: color-mix(in srgb, var(--color-bg-card) 24%, transparent);
  --gaw-surface-a10: color-mix(in srgb, var(--color-bg-card) 10%, transparent);
  --gaw-blur: var(--glass-blur);
  --gaw-on-accent-a78: color-mix(in srgb, var(--color-on-accent) 78%, transparent);
  --gaw-warn-2: var(--color-warning);
  --gaw-surface-a13: color-mix(in srgb, var(--color-bg-card) 13%, transparent);
  --gaw-on-accent-a82: color-mix(in srgb, var(--color-on-accent) 82%, transparent);
  --gaw-surface-a7: color-mix(in srgb, var(--color-bg-card) 7%, transparent);
  --gaw-surface-a12: color-mix(in srgb, var(--color-bg-card) 12%, transparent);
  --gaw-on-accent-a92: color-mix(in srgb, var(--color-on-accent) 92%, transparent);
  --gaw-on-accent-a50: color-mix(in srgb, var(--color-on-accent) 50%, transparent);
  --gaw-shadow-2: var(--shadow-card);
  --gaw-ok: var(--color-success);
  --gaw-ok-2: var(--color-success);
  --gaw-ok-3: var(--color-success);
  --gaw-danger: var(--color-danger);
  --gaw-shadow-3: 0 0 0 3px color-mix(in srgb, var(--color-success) 10%, transparent);
  --gaw-shadow-4: var(--shadow-sm);
  --gaw-shadow-5: var(--shadow-card-hover);
  --gaw-ok-4: var(--color-success);
  --gaw-brand: var(--color-brand);
  --gaw-grad-2: var(--color-bg-card);
  --gaw-shadow-6: var(--shadow-card);
  --gaw-ok-5: var(--color-success);
  --gaw-shadow-7: var(--shadow-pop);
  --gaw-grad-3: var(--platform-color);
  --gaw-dark: var(--color-bg-code);
  --gaw-grad-4: linear-gradient(transparent, color-mix(in srgb, var(--color-scrim) 54%, transparent));
  --gaw-dark-a64: color-mix(in srgb, var(--color-scrim) 64%, transparent);
  --gaw-ok-6: var(--color-success);
  --gaw-danger-2: var(--color-danger);
  --gaw-warn-3: var(--color-warning);
  --gaw-warn-4: var(--color-warning);
  --gaw-ok-7: var(--color-success);
  --gaw-grad-5: var(--btn-primary-bg);
  --gaw-warn-5: var(--color-warning);
  --gaw-danger-3: var(--color-danger);
  --gaw-warn-6: var(--color-warning);
  --gaw-dark-a58: color-mix(in srgb, var(--color-scrim) 58%, transparent);
  --gaw-blur-2: var(--overlay-blur);
  --gaw-shadow-8: var(--shadow-pop);
  --gaw-warn-7: var(--color-warning);
  --gaw-danger-4: var(--color-danger);
  --gaw-danger-5: var(--color-danger);
  --gaw-warn-8: var(--color-warning);
  --gaw-muted-a6: color-mix(in srgb, var(--color-text-muted) 6%, transparent);
  --gaw-info: var(--color-info);
  --gaw-ok-a14: color-mix(in srgb, var(--color-success) 14%, transparent);
  --gaw-ok-8: var(--color-success);
  --gaw-warn-a16: color-mix(in srgb, var(--color-warning) 16%, transparent);
  --gaw-warn-9: var(--color-warning);
  --gaw-danger-a13: color-mix(in srgb, var(--color-danger) 13%, transparent);
  --gaw-danger-6: var(--color-danger);
  --gaw-warn-a10: color-mix(in srgb, var(--color-warning) 10%, transparent);
  --gaw-surface: var(--color-bg-card);
  --gaw-shadow-9: var(--shadow-sm);
  --gaw-info-a5: color-mix(in srgb, var(--color-info) 5%, transparent);
  --gaw-ok-a16: color-mix(in srgb, var(--color-success) 16%, transparent);
  --gaw-warn-a8: color-mix(in srgb, var(--color-warning) 8%, transparent);
  --gaw-ok-9: var(--color-success);
  --gaw-dark-2: var(--color-bg-code);
}
:root[data-ui-theme][data-scheme="dark"] .ads-workbench { --gaw-ink: color-mix(in srgb, var(--color-brand) 20%, var(--color-bg-elevated)); }
</style>
