<template>
  <div
    class="workbench saudi-workbench"
    :class="`sd-module-${moduleId}`"
    :dir="isRtl ? 'rtl' : 'ltr'"
  >
    <header class="sd-hero">
      <PageBackButton />
      <div class="sd-hero-copy">
        <div class="sd-eyebrow">{{ $t('项目工作台 · 沙特需求') }}</div>
        <h1>{{ $t(moduleDef.title) }}</h1>
        <p>{{ $t(moduleDef.subtitle) }}</p>
        <div class="sd-hero-meta">
          <span><i class="ri-time-line"></i>{{ $t('演示约 {p0} 分钟', { p0: moduleDef.demoMinutes }) }}</span>
          <span><i class="ri-route-line"></i>{{ $t('{p0} 步向导', { p0: moduleDef.guideSteps.length }) }}</span>
          <span v-if="activeCase"><i class="ri-folder-3-line"></i>{{ activeCase.caseNo }}</span>
        </div>
      </div>
      <div class="sd-hero-visual" aria-hidden="true">
        <div v-if="moduleId === 'rfq-quote'" class="sd-quote-visual">
          <span class="sd-visual-orb"><i class="ri-money-dollar-circle-line"></i></span>
          <div class="sd-quote-sheet">
            <i></i><i></i><i></i><i></i>
            <b>SAR</b>
          </div>
          <span class="sd-quote-link"><i class="ri-arrow-right-up-line"></i></span>
        </div>
        <div v-else-if="moduleId === 'bid-decision'" class="sd-bid-visual">
          <span class="sd-bid-ring ring-a"></span>
          <span class="sd-bid-ring ring-b"></span>
          <span class="sd-bid-core"><i class="ri-scales-3-line"></i></span>
          <i class="sd-bid-node node-a"></i>
          <i class="sd-bid-node node-b"></i>
          <i class="sd-bid-node node-c"></i>
        </div>
        <div v-else class="sd-advisory-visual">
          <span class="sd-chat-bubble bubble-a"><i class="ri-mail-line"></i></span>
          <span class="sd-chat-bubble bubble-b"><i class="ri-whatsapp-line"></i></span>
          <span class="sd-chat-bubble bubble-c"><i class="ri-global-line"></i></span>
          <div class="sd-report-sheet"><i></i><i></i><i></i><b></b></div>
        </div>
      </div>
      <div class="sd-hero-side">
      <div class="sd-hero-actions">
        <button class="sd-hbtn" type="button" @click="resetWorkspace">
          <i class="ri-restart-line"></i>{{ $t('重置演示') }}
        </button>
        <button class="sd-hbtn" type="button" @click="openDataPack">
          <i class="ri-database-2-line"></i>{{ $t('数据包') }}
          <em v-if="dataPack" class="sd-hbtn-tag">{{ dataPack.version }}</em>
        </button>
        <button class="sd-hbtn" type="button" :disabled="!activeCase" @click="auditOpen = !auditOpen">
          <i class="ri-history-line"></i>{{ $t('审计') }}
        </button>
        <button class="sd-hbtn primary" type="button" :disabled="!activeTask" @click="scrollToStep(3)">
          <i class="ri-flashlight-line"></i>{{ $t('模拟变更') }}
        </button>
      </div>

      <!--
        本模块概览放在 hero 右侧的空白里 —— 之前占一整个 section，把真正的工作区往下挤。
        只统计本模块的案件；最近结果给 3 条，够看清"刚才在弄哪几件"。
      -->
      <div v-if="overview.total" class="sd-hero-overview">
        <div class="sd-kpis">
          <button class="sd-kpi" type="button" @click="scrollToStep(1)">
            <b>{{ overview.pending }}</b><span>{{ $t('待处理') }}</span>
          </button>
          <button class="sd-kpi" type="button" :class="{ warn: overview.approving > 0 }" @click="openFirstPendingApproval">
            <b>{{ overview.approving }}</b><span>{{ $t('待审批') }}</span>
          </button>
          <button class="sd-kpi" type="button" @click="scrollToStep(1)">
            <b>{{ overview.delivered }}</b><span>{{ $t('已交付') }}</span>
          </button>
        </div>
        <button
          v-for="r in overview.recent"
          :key="r.id"
          class="sd-recent-row"
          type="button"
          @click="openCaseById(r.id)"
        >
          <span class="sd-caseno-cell">{{ r.caseNo }}</span>
          <span class="sd-recent-subject" dir="auto">{{ r.subject }}</span>
          <span class="sd-recent-status">{{ r.statusLabel }}</span>
        </button>
      </div>
      </div>
    </header>

    <!-- UX 硬规则二：进度条常驻视口，滚多远都在（返回按钮在上面 hero 的操作区） -->
    <div class="sd-stickybar" :class="{ busy: anyRunning }">
      <div class="sd-stickybar-row">
      <nav class="sd-steps">
        <button
          v-for="(label, index) in moduleDef.guideSteps"
          :key="label"
          type="button"
          class="sd-step"
          :class="stepClass(index)"
          @click="scrollToStep(index)"
        >
          <span class="sd-step-index">
            <i v-if="stepState(index) === 'done'" class="ri-check-line"></i>
            <i v-else-if="stepState(index) === 'failed'" class="ri-close-line"></i>
            <template v-else>{{ index + 1 }}</template>
          </span>
          <span class="sd-step-label">
            {{ $t(label) }}
            <em v-if="stepFailReason(index)">{{ stepFailReason(index) }}</em>
          </span>
        </button>
      </nav>
        <span class="sd-progress-text">
          <template v-if="anyRunning"><i class="ri-loader-4-line spin"></i>{{ $t('进行中') }}</template>
          <template v-else-if="doneCount === moduleDef.guideSteps.length"><i class="ri-check-double-line"></i>{{ $t('全部完成') }}</template>
          <template v-else>{{ $t('第 {p0} / {p1} 步', { p0: currentStep + 1, p1: moduleDef.guideSteps.length }) }}</template>
        </span>
      </div>
      <div class="sd-progress-bar"><span class="sd-progress-fill" :style="{ width: `${fillPct}%` }"></span></div>
    </div>

    <!--
      ① 接通道 —— 通道配好之后这块天天都不用动，所以做成**常驻但紧凑**的一排：
      一张卡一行（名称 + 状态 + 一句话 + 操作），不再用折叠开关让人多点一次。
    -->
    <section :ref="setStepRef(0)" class="sd-section sd-section-compact" :class="`is-${stepState(0)}`">
      <div class="sd-section-head">
        <span class="sd-step-no">1</span>
        <h2>{{ $t('第 1 步 · {p0}', { p0: $t(moduleDef.guideSteps[0]) }) }}</h2>
        <span class="sd-channel-summary">{{ channelSummary }}</span>
        <span class="sd-head-spacer"></span>
        <em class="sd-state-pill" :class="stepState(0)">{{ stepStateLabel(0) }}</em>
        <div class="sd-section-actions">
          <button class="sd-btn" type="button" :disabled="channelsLoading" @click="refreshChannels">
            <i :class="channelsLoading ? 'ri-loader-4-line spin' : 'ri-refresh-line'"></i>{{ $t('重新检测') }}
          </button>
          <!--
            模拟收件是**通道没接通时的演示兜底**（需求文档：未绑定时保留模拟入口，
            条目强制打紫色 Simulated 标记）。真通道已经连上就别摆着它了，
            否则会让人以为这是日常要点的东西。
          -->
          <button v-if="!hasLiveChannel" class="sd-btn" type="button" @click="simulateOpen = true">
            <i class="ri-add-line"></i>{{ $t('模拟一条收件') }}
          </button>
        </div>
      </div>
      <div class="sd-channels">
        <article
          v-for="ch in moduleChannels"
          :key="ch.channel"
          class="sd-channel"
          :class="[`state-${ch.state}`, { 'is-upload': ch.channel === 'upload', 'is-dropping': ch.channel === 'upload' && uploadDropping }]"
          @dragover="ch.channel === 'upload' && onUploadDragOver($event)"
          @dragleave="ch.channel === 'upload' && (uploadDropping = false)"
          @drop="ch.channel === 'upload' && onUploadDrop($event)"
          @click="ch.channel === 'upload' && pickUploadFiles()"
        >
          <div class="sd-channel-head">
            <i :class="channelIcon(ch.channel)"></i>
            <strong>{{ channelLabel(ch.channel) }}</strong>
            <span class="sd-state-dot"></span>
            <span class="sd-state-text">{{ stateLabel(ch.state) }}</span>
            <!-- 合规：外部来源永远打 Snapshot 紫 chip，不许让人以为是实时官方接口 -->
            <span v-if="ch.channel === 'websnapshot'" class="sd-sim-chip">Snapshot</span>
          </div>
          <!-- detail / nextStep 由主进程给，主进程给的是 i18n key（不预翻译），在这里按当前 UI 语言翻 -->
          <p class="sd-channel-detail">{{ ch.detail ? $t(ch.detail, ch.detailParams || {}) : '' }}</p>
          <p v-if="ch.nextStep" class="sd-channel-next">{{ $t(ch.nextStep, ch.nextStepParams || {}) }}</p>
          <p v-if="ch.channel === 'upload'" class="sd-channel-hint">
            {{ $t('可一次选多个文件（最多 20 个），或直接拖进来：PDF / Word / Excel / CSV / 图片 / 邮件 .eml / 表单 .json / 文本 .txt / 网页 .html') }}
          </p>
          <p v-if="ch.autoPoll?.enabled" class="sd-channel-auto">
            <i class="ri-refresh-line"></i>
            {{ $t('自动收件已开启 · 每 {p0} 秒一次', { p0: ch.autoPoll.intervalSeconds }) }}
          </p>
          <p v-if="ch.lastSyncAt" class="sd-channel-sync">
            {{ $t('上次收取') }} {{ shortTime(ch.lastSyncAt) }}
            <template v-if="ch.lastCount != null"> · {{ $t('{p0} 条', { p0: ch.lastCount }) }}</template>
          </p>
          <div class="sd-channel-foot">
            <button
              v-if="ch.channel === 'email' || ch.channel === 'webform' || ch.channel === 'websnapshot'"
              class="sd-link"
              type="button"
              :disabled="pollingChannel === ch.channel"
              @click="pollChannel(ch.channel)"
            >{{ pollingChannel === ch.channel ? $t('抓取中…') : (ch.channel === 'websnapshot' ? $t('抓取快照') : $t('立即收取')) }}</button>
            <button v-if="ch.channel === 'email'" class="sd-link" type="button" @click="openEmailConfig"><i v-if="emailConfigAllowed !== true" class="ri-lock-2-line" aria-hidden="true"></i>{{ $t('配置邮箱') }}</button>
            <button v-else-if="ch.channel === 'whatsapp'" class="sd-link" type="button" @click="openWhatsappPair">
              {{ ch.state === 'ready' ? $t('管理绑定') : $t('扫码绑定') }}
            </button>
            <button v-else-if="ch.channel === 'webform'" class="sd-link" type="button" @click="ticketConfigOpen = true">
              {{ $t('配置工单库') }}
            </button>
            <button v-else-if="ch.channel === 'websnapshot'" class="sd-link" type="button" @click="openTenderSources">
              {{ $t('来源登记') }}
            </button>
            <button v-else class="sd-link" type="button" :disabled="uploading" @click.stop="pickUploadFiles">
              <i :class="uploading ? 'ri-loader-4-line spin' : 'ri-folder-open-line'"></i>
              {{ uploading ? $t('上传中…') : $t('选择文件') }}
            </button>
          </div>
        </article>
      </div>
      <!-- 各模块口径不同：工单库那套只对咨询模块成立，招投标讲的是三来源去重 -->
      <p class="sd-hint">{{ $t(moduleDef.channelHint) }}</p>
      <div class="sd-actions">
        <button class="sd-btn primary" type="button" :disabled="channelsLoading" @click="scrollToStep(1)">
          <i class="ri-arrow-down-line"></i>{{ $t('通道就绪，下一步') }}
        </button>
        <span v-if="stepState(0) === 'done'" class="sd-summary"><i class="ri-checkbox-circle-line"></i>{{ channelSummary }}</span>
      </div>
    </section>

    <!-- ② 收件 -->
    <section :ref="setStepRef(1)" class="sd-section" :class="`is-${stepState(1)}`">
      <div class="sd-section-head">
        <span class="sd-step-no">2</span>
        <h2>{{ $t('第 2 步 · {p0}', { p0: $t(moduleDef.guideSteps[1]) }) }}</h2>
        <span class="sd-count">{{ $t('{p0} 条', { p0: intakeItems.length }) }}</span>
        <span class="sd-head-spacer"></span>
        <em class="sd-state-pill" :class="stepState(1)">{{ stepStateLabel(1) }}</em>
        <!-- 演示机上要能反复来一遍：只清 Simulated 条目，真实邮件/工单一条不碰 -->
        <button v-if="hasSimulatedItems" class="sd-btn" type="button" :disabled="clearingDemo" @click="clearDemoIntake">
          <i :class="clearingDemo ? 'ri-loader-4-line spin' : 'ri-delete-bin-line'"></i>{{ $t('清空演示条目') }}
        </button>
      </div>

      <div v-for="group in groups" :key="group.id" class="sd-group">
        <div class="sd-group-head">
          <span class="sd-link-chip"><i class="ri-link"></i>×{{ group.itemIds.length }}</span>
          <strong>{{ group.subject }}</strong>
          <span class="sd-group-customer">{{ group.customer }}</span>
          <span v-if="group.deadline" class="sd-deadline" :class="deadlineTone(group.deadline)">{{ deadlineText(group.deadline) }}</span>
          <span class="sd-head-spacer"></span>
          <span v-if="group.merged" class="sd-pill verdict-ok">{{ $t('已合并') }}</span>
          <template v-else>
            <button class="sd-btn" type="button" @click="mergeReasonsFor = mergeReasonsFor === group.id ? '' : group.id">
              {{ $t('查看依据') }}
            </button>
            <button class="sd-btn primary" type="button" @click="confirmMerge(group)">{{ $t('确认合并') }}</button>
          </template>
          <button v-if="group.merged" class="sd-btn" type="button" @click="undoMerge(group.id)">{{ $t('撤销合并') }}</button>
        </div>
        <div class="sd-group-sources">
          <span v-for="item in itemsOf(group)" :key="item.id" class="sd-source-chip" :class="`ch-${item.channel}`">
            <i :class="channelIcon(item.channel)"></i>{{ channelLabel(item.channel) }} {{ shortTime(item.receivedAt) }}
            <em v-if="item.ticket">{{ item.ticket.ticketNo }}</em>
            <em v-if="item.simulated" class="sim">Simulated</em>
          </span>
        </div>
        <div v-if="mergeReasonsFor === group.id" class="sd-merge-detail">
          <div class="sd-sub-title">{{ $t('合并依据（打分，人确认后才合并）') }}</div>
          <div v-for="r in group.reasons" :key="r.label" class="sd-reason-row"><span>{{ $t(r.label) }}</span><b>+{{ r.score }}</b></div>
          <div class="sd-reason-total">{{ $t('合计') }} <b>{{ group.totalScore }}</b></div>
        </div>
      </div>

      <div v-if="!intakeItems.length" class="sd-empty">
        <i class="ri-inbox-line"></i>
        <p>{{ $t('收件箱是空的。可以让客户发一封邮件 / 一条 WhatsApp，或者先载入演示样例把流程走通。') }}</p>
        <div class="sd-empty-actions">
          <button class="sd-btn primary" type="button" :disabled="seeding" @click="seedDemoIntake">
            <i :class="seeding ? 'ri-loader-4-line spin' : 'ri-download-2-line'"></i>{{ $t('载入演示样例') }}
          </button>
          <button class="sd-btn" type="button" @click="simulateOpen = true">{{ $t('手动模拟一条') }}</button>
        </div>
      </div>

      <!--
        分类与分野：任务多了平铺一片看不出轻重。这里给两层——
        上面一排筛选（状态 / 负责人 / 关键词），下面按状态分组，每组一条小标题带条数。
      -->
      <div v-else class="sd-inbox">
        <!-- 建档模式：选择会持久化，重进页面还是它 -->
        <div class="sd-filing">
          <span class="sd-filing-label">{{ $t('建档方式') }}</span>
          <div class="sd-segmented">
            <button type="button" :class="{ active: filingMode === 'manual' }" @click="setFilingMode('manual')">
              {{ $t('手动建档') }}
            </button>
            <button type="button" :class="{ active: filingMode === 'auto' }" @click="setFilingMode('auto')">
              {{ $t('自动建档') }}
            </button>
          </div>
          <span class="sd-filing-hint">
            {{ filingMode === 'auto'
              ? $t('新收件进来即自动立案，无需人工确认。')
              : $t('收件先进收件箱，点「建档」才立案 —— 演示时能一步步讲。') }}
          </span>
          <span class="sd-head-spacer"></span>
          <button
            v-if="filingMode === 'manual' && pendingFilingCount"
            class="sd-btn"
            type="button"
            :disabled="batchFiling"
            @click="fileAllPending(false)"
          >
            <i :class="batchFiling ? 'ri-loader-4-line spin' : 'ri-inbox-archive-line'"></i>
            {{ $t('一键建档（{p0} 条）', { p0: pendingFilingCount }) }}
          </button>
        </div>

        <div class="sd-filters">
          <select v-model="filterStatus">
            <option value="">{{ $t('全部状态') }}</option>
            <option v-for="s in statusOptions" :key="s" :value="s">{{ statusLabel(s) }}</option>
          </select>
          <input v-model="filterText" type="search" :placeholder="$t('搜编号 / 主题 / 客户')" />
          <span class="sd-head-spacer"></span>
          <span class="sd-filter-count">{{ $t('{p0} / {p1} 条', { p0: filteredItems.length, p1: intakeItems.length }) }}</span>
        </div>

        <div v-if="!filteredItems.length" class="sd-hint">{{ $t('没有符合当前筛选的任务。') }}</div>

        <div v-for="bucket in pagedGroups" :key="bucket.status" class="sd-bucket">
          <div class="sd-bucket-head">
            <span class="sd-pill" :class="statusTone(bucket.status)">{{ statusLabel(bucket.status) }}</span>
            <em>{{ $t('{p0} 条', { p0: bucket.items.length }) }}</em>
          </div>
          <div class="sd-table-wrap">
            <table class="sd-table intake">
              <thead>
                <tr>
                  <th>{{ $t('编号') }}</th>
                  <th>{{ $t('来源') }}</th><th>{{ $t('主题 / 项目') }}</th><th>{{ $t('客户') }}</th>
                  <th class="col-optional">{{ $t('收到') }}</th><th>{{ $t('截止') }}</th><th></th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="item in bucket.items"
                  :key="item.id"
                  :class="{ active: activeTaskId === item.id }"
                  @click="selectTask(item)"
                >
              <td class="sd-caseno-cell">{{ caseNoOf(item) || '—' }}</td>
              <td>
                <span class="sd-source-chip" :class="`ch-${item.channel}`">
                  <i :class="channelIcon(item.channel)"></i>{{ channelLabel(item.channel) }}
                </span>
                <span v-if="item.simulated" class="sd-sim-chip">Simulated</span>
              </td>
              <td>
                <div dir="auto">{{ item.subject }}</div>
                <div v-if="item.ticket" class="sd-ticket-line">
                  <i class="ri-file-list-3-line"></i>{{ item.ticket.ticketNo }} · {{ item.ticket.sourceName }}.{{ item.ticket.table }}
                  <button class="sd-link" type="button" @click.stop="ticketDetailFor = ticketDetailFor === item.id ? '' : item.id">
                    {{ $t('工单详情') }}
                  </button>
                </div>
                <!-- 合规：外部来源的链接与抓取时间必须在界面上看得见，不能只写在文档里 -->
                <div v-if="item.external" class="sd-ext-line">
                  <i class="ri-global-line"></i>
                  <a class="sd-ext-link" :href="item.external.sourceUrl" target="_blank" rel="noreferrer" @click.stop>
                    {{ item.external.sourceName }}
                  </a>
                  <span class="sd-sim-chip">Snapshot {{ shortTime(item.external.fetchedAt) }}</span>
                  <em v-if="item.external.scope">{{ item.external.scope }}</em>
                </div>
                <div v-if="item.attachments.length" class="sd-attach-line">
                  <span v-for="a in item.attachments" :key="a.relPath"><i class="ri-attachment-2"></i>{{ a.fileName }}</span>
                </div>
              </td>
              <td dir="auto">{{ item.customer || '—' }}</td>
              <td class="col-optional">{{ shortTime(item.receivedAt) }}</td>
              <td><span :class="['sd-deadline', deadlineTone(item.deadline)]">{{ deadlineText(item.deadline) }}</span></td>
              <td class="sd-row-actions">
                <button class="sd-btn primary" type="button" :disabled="assigning" @click.stop="selectTask(item)">
                  {{ item.caseId ? $t('打开工作台') : $t('建案并进入') }}
                </button>
                <!-- 收件箱得能删：演示反复来一遍、误收一封营销邮件，都不该只能去改磁盘 -->
                <button
                  class="sd-icon-btn"
                  type="button"
                  :title="$t('从收件箱移除')"
                  @click.stop="removeIntakeItem(item)"
                ><i class="ri-delete-bin-line"></i></button>
              </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- 分页：条目一多就别一路铺到底，翻页比无限滚更好定位 -->
        <div v-if="totalPages > 1" class="sd-pager">
          <button class="sd-btn" type="button" :disabled="page <= 1" @click="page -= 1">
            <i class="ri-arrow-left-s-line"></i>{{ $t('上一页') }}
          </button>
          <span class="sd-pager-info">{{ $t('第 {p0} / {p1} 页', { p0: page, p1: totalPages }) }}</span>
          <button class="sd-btn" type="button" :disabled="page >= totalPages" @click="page += 1">
            {{ $t('下一页') }}<i class="ri-arrow-right-s-line"></i>
          </button>
          <span class="sd-head-spacer"></span>
          <select v-model.number="pageSize" class="sd-pager-size">
            <option :value="10">{{ $t('每页 10 条') }}</option>
            <option :value="20">{{ $t('每页 20 条') }}</option>
            <option :value="50">{{ $t('每页 50 条') }}</option>
          </select>
        </div>
      </div>

      <!-- 工单详情：从数据库查到的那条记录，含可见取数 SQL -->
      <div v-if="ticketDetail?.ticket" class="sd-ticket-detail">
        <div class="sd-ticket-head">
          <strong>{{ $t('工单') }} {{ ticketDetail.ticket.ticketNo }}</strong>
          <span>{{ ticketDetail.ticket.sourceName }} · {{ ticketDetail.ticket.table }} #{{ ticketDetail.ticket.pkValue }}</span>
          <span class="sd-head-spacer"></span>
          <span class="sd-pill verdict-pending">{{ $t('状态') }} {{ ticketDetail.ticket.status }}</span>
          <button class="sd-btn" type="button" :disabled="refreshingTicket" @click="refreshTicket(ticketDetail)">
            <i :class="refreshingTicket ? 'ri-loader-4-line spin' : 'ri-refresh-line'"></i>{{ $t('刷新工单') }}
          </button>
          <button class="sd-btn ghost" type="button" @click="ticketDetailFor = ''">{{ $t('关闭') }}</button>
        </div>
        <table class="sd-fields">
          <tbody>
            <tr v-for="(value, key) in ticketDetail.ticket.fields" :key="key">
              <th>{{ key }}</th><td dir="auto">{{ value }}</td>
            </tr>
            <tr><th>{{ $t('创建 / 更新') }}</th><td>{{ ticketDetail.ticket.createdAt }} / {{ ticketDetail.ticket.updatedAt }}</td></tr>
          </tbody>
        </table>
        <div class="sd-sql">
          <span>{{ $t('取数 SQL') }}</span>
          <code>{{ ticketDetail.ticket.query }}</code>
          <button class="sd-btn ghost" type="button" @click="copyText(ticketDetail.ticket.query)">{{ $t('复制') }}</button>
        </div>
        <p class="sd-hint">{{ $t('默认只读：本通道只发 SELECT；把工单状态写回业务库需要单独开启写库授权。') }}</p>
      </div>
      <div class="sd-actions">
        <button class="sd-btn primary" type="button" :disabled="!activeCase" @click="scrollToStep(2)">
          <i class="ri-arrow-down-line"></i>
          {{ activeCase ? $t('已建案 {p0}，去下一步', { p0: activeCase.caseNo }) : $t('按选中条目建案，下一步') }}
        </button>
      </div>
    </section>

    <!-- ③④⑤ 工作台 -->
    <section :ref="setStepRef(2)" class="sd-section workspace-section" :class="`is-${stepState(2)}`">
      <div class="sd-section-head">
        <span class="sd-step-no">3</span>
        <h2>{{ $t('第 3 步 · {p0}', { p0: $t(moduleDef.guideSteps[2]) }) }}</h2>
        <!-- 任务编号放最前：客户与同事之间对号靠它，内部 id 不该露出去 -->
        <span v-if="activeCase" class="sd-caseno">{{ activeCase.caseNo }}</span>
        <span v-if="activeTask" class="sd-count">
          {{ activeTask.subject }}
          <template v-if="activeCase"> · {{ caseStatusLabel(activeCase.status) }} · v{{ activeCase.version }}</template>
        </span>
        <span class="sd-head-spacer"></span>
        <em class="sd-state-pill" :class="stepState(2)">{{ stepStateLabel(2) }}</em>
      </div>
      <div v-if="!activeTask" class="sd-empty">
        <i class="ri-inbox-line"></i>
        <p>{{ $t('先从收件箱选一条任务进入工作台。') }}</p>
      </div>

      <div v-else class="sd-workspace">
        <!-- 左：六步闭环 -->
        <aside class="sd-timeline-col">
          <div v-for="step in workflowSteps" :key="step.id" class="sd-wf-step" :class="`wf-${step.status}`">
            <span class="sd-wf-dot">
              <i v-if="step.status === 'done'" class="ri-check-line"></i>
              <i v-else-if="step.status === 'active'" class="ri-loader-4-line spin"></i>
              <i v-else-if="step.status === 'failed'" class="ri-close-line"></i>
            </span>
            <div>
              <strong>{{ $t(step.label) }}</strong>
              <small v-if="step.elapsed">{{ step.elapsed }}</small>
              <small v-if="step.failReason" class="fail">{{ step.failReason }}</small>
            </div>
          </div>
          <div v-if="lastImpact" class="sd-impact-summary">
            <div class="sd-sub-title">{{ $t('最近一次变更') }}</div>
            <p>{{ $t('重算 {p0} 张卡，未受影响 {p1} 张', { p0: lastImpact.affectedCards.length, p1: lastImpact.unaffectedCards.length }) }}</p>
            <button class="sd-link" type="button" @click="rightTab = 'diff'">{{ $t('查看前后差异') }}</button>
          </div>
        </aside>

        <!-- 中：卡片流 -->
        <div class="sd-cards-col">
          <div class="sd-extract-bar">
            <template v-if="extraction && !extraction.error">
              <i class="ri-file-search-line"></i>
              <span>
                {{ $t('已从 {p0} 份附件抽出 {p1} 个字段', { p0: extraction.documents.length, p1: extraction.fields.length }) }}
                <template v-if="unverifiedCount">
                  · <em class="warn">{{ $t('{p0} 项未能回溯原文', { p0: unverifiedCount }) }}</em>
                </template>
                <template v-if="extraction.boq?.length">
                  · {{ $t('BOQ 还原 {p0} 行', { p0: extraction.boq.length }) }}
                </template>
              </span>
              <span v-if="extraction.boqNote" class="sd-extract-warn">{{ extraction.boqNote }}</span>
              <span v-for="doc in extractionWarnings" :key="doc.fileName" class="sd-extract-warn">
                {{ $t('{p0}：{p1}', { p0: doc.fileName, p1: doc.warning }) }}
              </span>
              <span class="sd-head-spacer"></span>
              <button class="sd-btn" type="button" :disabled="extracting" @click="runExtraction(true)">
                <i :class="extracting ? 'ri-loader-4-line spin' : 'ri-refresh-line'"></i>{{ $t('重新抽取') }}
              </button>
            </template>
            <template v-else>
              <i class="ri-information-line"></i>
              <span>
                {{ extraction?.error
                  ? $t('抽取未成功：{p0}　卡片暂用演示基线数据。', { p0: extraction.error })
                  : $t('卡片当前用的是演示基线数据。点右侧按钮从本任务附件里真抽字段（结论会带回原文页码 / 单元格）。') }}
              </span>
              <span class="sd-head-spacer"></span>
              <button class="sd-btn primary" type="button" :disabled="extracting || !activeAttachments.length" @click="runExtraction(true)">
                <i :class="extracting ? 'ri-loader-4-line spin' : 'ri-file-search-line'"></i>
                {{ extracting ? $t('抽取中…') : $t('从附件抽取字段') }}
              </button>
            </template>
          </div>

          <SaudiCard
            v-for="card in cardsForStep(2)"
            :key="card.id"
            :ref="setCardRef(card.id)"
            :card="card"
            :recalculating="recalculatingCards.includes(card.id)"
            @anchor="onAnchor"
            @scroll-to-card="scrollToCard"
            @insert-questions="onInsertQuestions"
            @needs-verification="onNeedsVerification"
            @open-output="generateOutput"
            @edit="onCardEdit"
            :review="cardReview[card.id] ?? null"
            @accept="onCardAction('accept', $event)"
            @flag="onCardAction('flag', $event)"
            @bom-variant="onBomVariant"
            @gate-move="onGateMove"
            @adversarial-review="runAdversarialReview"
          />
        </div>

        <!-- 右：文档 / 证据 / 差异 -->
        <aside class="sd-right-col">
          <nav class="sd-right-tabs">
            <button :class="{ active: rightTab === 'doc' }" type="button" @click="rightTab = 'doc'">
              {{ $t('文档') }} <em v-if="activeAttachments.length">{{ activeAttachments.length }}</em>
            </button>
            <button :class="{ active: rightTab === 'evidence' }" type="button" @click="rightTab = 'evidence'">
              {{ $t('证据') }} <em v-if="allEvidence.length">{{ allEvidence.length }}</em>
            </button>
            <button :class="{ active: rightTab === 'diff' }" type="button" @click="rightTab = 'diff'">{{ $t('差异') }}</button>
          </nav>

          <div v-if="rightTab === 'doc'" class="sd-right-body">
            <DocumentPane
              v-if="activeTask"
              :item-id="activeTask.id"
              :attachments="activeAttachments"
              :anchor="activeAnchor"
            />
          </div>

          <div v-else-if="rightTab === 'evidence'" class="sd-right-body">
            <div v-if="!allEvidence.length" class="sd-right-empty">
              <i class="ri-shield-check-line"></i><p>{{ $t('本任务暂无外部证据。') }}</p>
            </div>
            <div v-for="ev in allEvidence" :key="ev.id" class="sd-ev-mini" :class="{ conflict: ev.conflictsWith?.length }">
              <div class="sd-ev-mini-head">
                <strong>{{ $t(ev.title) }}</strong>
                <span>{{ Math.round(ev.confidence * 100) }}%</span>
              </div>
              <p dir="auto">{{ $t(ev.excerpt) }}</p>
              <div class="sd-evidence-meta">
                <span>{{ ev.anchor?.docName || $t('内部资料') }}</span>
                <span>{{ ev.anchor?.capturedAt || ev.updatedAt }}</span>
                <span v-if="ev.conflictsWith?.length" class="sd-pill verdict-partial">{{ $t('冲突 · 待人工核验') }}</span>
              </div>
            </div>
          </div>

          <div v-else class="sd-right-body">
            <div v-if="!lastImpact" class="sd-right-empty">
              <i class="ri-git-compare-line"></i>
              <p>{{ $t('用顶部「模拟变更」改一个条件，这里并排显示前后两版，未变的项不会有底色。') }}</p>
            </div>
            <template v-else>
              <div class="sd-diff-head">
                <span>{{ lastImpact.fromVersion }} → {{ lastImpact.toVersion }}</span>
                <span class="sd-pill verdict-partial">{{ $t('重算 {p0} 张', { p0: lastImpact.affectedCards.length }) }}</span>
                <span class="sd-pill verdict-ok">{{ $t('未受影响 {p0} 张', { p0: lastImpact.unaffectedCards.length }) }}</span>
              </div>
              <div class="sd-diff-list">
                <div v-for="(line, i) in lastImpact.diffLines" :key="i" class="sd-diff-row" :class="{ changed: line.changed }">
                  <span class="sd-diff-label">{{ line.label }}</span>
                  <span class="sd-diff-before">{{ line.before }}</span>
                  <i class="ri-arrow-right-line"></i>
                  <span class="sd-diff-after">{{ line.after }}</span>
                  <em v-if="!line.changed">{{ $t('未变化') }}</em>
                </div>
              </div>
            </template>
          </div>
        </aside>
      </div>
      <div v-if="activeTask" class="sd-actions">
        <button class="sd-btn primary" type="button" :disabled="stepState(2) !== 'done'" @click="scrollToStep(3)">
          <i class="ri-arrow-down-line"></i>{{ $t('下一步：{p0}', { p0: $t(moduleDef.guideSteps[3]) }) }}
        </button>
      </div>
    </section>

    <!-- ④ 核心卡片 + Proof Switch -->
    <section :ref="setStepRef(3)" class="sd-section" :class="`is-${stepState(3)}`">
      <div class="sd-section-head">
        <span class="sd-step-no">4</span>
        <h2>{{ $t('第 4 步 · {p0}', { p0: $t(moduleDef.guideSteps[3]) }) }}</h2>
        <span class="sd-head-spacer"></span>
        <em class="sd-state-pill" :class="stepState(3)">{{ stepStateLabel(3) }}</em>
      </div>
      <template v-if="activeTask">
        <div class="sd-cards-col">
          <SaudiCard
            v-for="card in cardsForStep(3)"
            :key="card.id"
            :ref="setCardRef(card.id)"
            :card="card"
            :recalculating="recalculatingCards.includes(card.id)"
            @anchor="onAnchor"
            @scroll-to-card="scrollToCard"
            @insert-questions="onInsertQuestions"
            @needs-verification="onNeedsVerification"
            @open-output="generateOutput"
            @edit="onCardEdit"
            :review="cardReview[card.id] ?? null"
            @accept="onCardAction('accept', $event)"
            @flag="onCardAction('flag', $event)"
            @bom-variant="onBomVariant"
            @gate-move="onGateMove"
            @adversarial-review="runAdversarialReview"
          />
        </div>

        <!-- Proof Switch：改一个交付条件，只重算受影响的卡（真实重算走顶部同一个抽屉） -->
        <div class="sd-proof">
          <div class="sd-proof-head">
            <i class="ri-flashlight-line"></i>
            <div><strong>{{ $t(moduleDef.proofSwitch.title) }}</strong><p>{{ $t(moduleDef.proofSwitch.hint) }}</p></div>
          </div>
          <div class="sd-proof-form">
            <label v-for="ctrl in moduleDef.proofSwitch.controls" :key="ctrl.key" class="sd-proof-field">
              <span>{{ $t(ctrl.label) }}</span>
              <select v-if="ctrl.kind === 'select'" v-model="proofValues[ctrl.key]" :disabled="recalculating">
                <option v-for="opt in ctrl.options" :key="opt.value" :value="opt.value">{{ $t(opt.label) }}</option>
              </select>
              <button v-else class="sd-btn sm" type="button" @click="showToast(i18nT('补遗材料接入待确认，请通过收件箱导入真实文件。'))">
                <i class="ri-upload-2-line"></i>{{ $t('补遗材料接入待确认') }}
              </button>
            </label>
            <button class="sd-btn primary" type="button" :disabled="recalculating" @click="applyProofSwitch">
              <i :class="recalculating ? 'ri-loader-4-line spin' : 'ri-refresh-line'"></i>{{ $t('执行变更并只重算受影响卡') }}
            </button>
          </div>
          <div v-if="lastImpact" class="sd-impact">
            <div class="sd-impact-row">
              <span class="sd-sub-title">{{ $t('受影响（已重算）') }}</span>
              <span v-for="id in lastImpact.affectedCards" :key="id" class="sd-pill verdict-partial">{{ cardTitle(id) }}</span>
              <span v-if="!lastImpact.affectedCards.length" class="sd-alt">{{ $t('无') }}</span>
            </div>
            <div class="sd-impact-row">
              <span class="sd-sub-title">{{ $t('未受影响（逐字未变）') }}</span>
              <span v-for="id in lastImpact.unaffectedCards" :key="id" class="sd-pill verdict-ok">{{ cardTitle(id) }}</span>
            </div>
            <div class="sd-impact-row">
              <span class="sd-sub-title">{{ $t('版本') }}</span>
              <span class="mono">{{ lastImpact.fromVersion }} → {{ lastImpact.toVersion }}</span>
              <button class="sd-link" type="button" @click="showDiff">{{ $t('查看前后差异') }}</button>
            </div>
          </div>
        </div>

        <div class="sd-actions">
          <button class="sd-btn primary" type="button" :disabled="stepState(3) !== 'done'" @click="scrollToStep(4)">
            <i class="ri-arrow-down-line"></i>{{ $t('下一步：{p0}', { p0: $t(moduleDef.guideSteps[4]) }) }}
          </button>
        </div>
      </template>
      <p v-else class="sd-hint">{{ $t('先从收件箱选一条任务进入工作台。') }}</p>
    </section>

    <section v-if="auditOpen" class="sd-section sd-audit">
      <div class="sd-section-head"><h2>{{ $t('审计留痕') }}</h2><span class="sd-head-spacer"></span><button class="sd-btn ghost" type="button" @click="auditOpen = false">{{ $t('收起') }}</button></div>
      <div class="sd-table-wrap">
        <table class="sd-table">
          <thead>
            <tr>
              <th>{{ $t('时间') }}</th><th>{{ $t('操作人') }}</th><th>{{ $t('动作') }}</th>
              <th>{{ $t('对象') }}</th><th>{{ $t('变更前') }}</th><th>{{ $t('变更后') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="entry in auditEntries" :key="entry.id">
              <td>{{ shortTime(entry.at) }}</td>
              <td>{{ entry.actor }}</td>
              <td>{{ entry.action }}</td>
              <td dir="auto">{{ entry.target }}<small v-if="entry.note"> · {{ entry.note }}</small></td>
              <td dir="auto">{{ entry.before || '—' }}</td>
              <td dir="auto">{{ entry.after || '—' }}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <p v-if="!auditEntries.length" class="sd-hint">{{ $t('暂无审计记录。') }}</p>
    </section>

    <!-- ⑤ 审批交付 -->
    <section :ref="setStepRef(4)" class="sd-section" :class="`is-${stepState(4)}`">
      <div class="sd-section-head">
        <span class="sd-step-no">5</span>
        <h2>{{ $t('第 5 步 · {p0}', { p0: $t(moduleDef.guideSteps[4]) }) }}</h2>
        <em v-if="stepFailReason(4)" class="sd-fail-reason">{{ stepFailReason(4) }}</em>
        <span class="sd-head-spacer"></span>
        <em class="sd-state-pill" :class="stepState(4)">{{ stepStateLabel(4) }}</em>
      </div>
      <template v-if="activeCase">
          <div class="sd-approval-chain">
            <span class="sd-hint">{{ $t('多级审批人链待确认；当前按真实案件负责人和审批记录处理。') }}</span>
          </div>
          <div v-if="activeCase" class="sd-approval-bar">
            <span class="sd-pill" :class="caseStatusTone(activeCase.status)">{{ caseStatusLabel(activeCase.status) }}</span>
            <span class="sd-approval-owner">{{ $t('负责人') }} {{ activeCase.owner }}</span>
            <span class="sd-head-spacer"></span>
            <button
              v-if="!isPendingApproval && !isApproved"
              class="sd-btn primary"
              type="button"
              @click="submitForApproval"
            >{{ $t('提交审批') }}</button>
            <template v-if="isPendingApproval">
              <button class="sd-btn primary" type="button" @click="decide('approve')">{{ $t('批准') }}</button>
              <button class="sd-btn" type="button" @click="decide('approve_with_edits')">{{ $t('修改后批准') }}</button>
              <button class="sd-btn" type="button" @click="askReason('return')">{{ $t('退回') }}</button>
              <button class="sd-btn" type="button" @click="askReason('reject')">{{ $t('拒绝') }}</button>
              <button class="sd-btn" type="button" @click="askReason('reassign')">{{ $t('转交') }}</button>
            </template>
            <button class="sd-btn" type="button" @click="outputsOpen = true">
              {{ $t('输出中心') }} <em v-if="activeCase.outputs.length">{{ activeCase.outputs.length }}</em>
            </button>
          </div>

          <!--
            邮件审批等待条：转交出去之后，用户得看得见「信发了、在等谁」，
            否则转交完这一单就像掉进黑洞（对方没收到也无从发现）。
          -->
          <div v-if="mailApproval" class="sd-mail-approval">
            <i class="ri-mail-send-line"></i>
            <span class="sd-mail-approval-text">
              {{ $t('已发邮件给 {p0}，等待回复自动审批', { p0: mailApproval.assignee }) }}
              <em>{{ $t('回「同意」即通过，回「拒绝」即退回') }}</em>
            </span>
            <button class="sd-link" type="button" :disabled="mailBusy" @click="resendApprovalMail">{{ $t('重发') }}</button>
            <button class="sd-link" type="button" :disabled="mailBusy" @click="cancelApprovalMail">{{ $t('撤销等待') }}</button>
          </div>

        <div class="sd-cards-col">
          <SaudiCard
            v-for="card in outputCards"
            :key="card.id"
            :ref="setCardRef(card.id)"
            :card="card"
            :recalculating="recalculatingCards.includes(card.id)"
            @anchor="onAnchor"
            @scroll-to-card="scrollToCard"
            @insert-questions="onInsertQuestions"
            @needs-verification="onNeedsVerification"
            @open-output="generateOutput"
            @edit="onCardEdit"
            :review="cardReview[card.id] ?? null"
            @accept="onCardAction('accept', $event)"
            @flag="onCardAction('flag', $event)"
            @bom-variant="onBomVariant"
            @gate-move="onGateMove"
            @adversarial-review="runAdversarialReview"
          />
        </div>
      </template>
      <p v-else class="sd-hint">{{ $t('先从收件箱选一条任务进入工作台。') }}</p>
    </section>

    <!-- 模拟收件 -->
    <TModal
      :open="simulateOpen"
      :title="$t('模拟一条收件')"
      :description="$t('通道尚未接通时用于演示。模拟产生的条目一律带紫色 Simulated 标记，导出与审计同样带这个标记。')"
      :tone="moduleId"
      icon="ri-inbox-unarchive-line"
      size="md"
      @close="simulateOpen = false"
    >
      <div class="sd-drawer-field">
        <label>{{ $t('来源通道') }}</label>
        <select v-model="simChannel">
          <option value="email">{{ $t('邮件') }}</option>
          <option value="whatsapp">WhatsApp</option>
          <option value="webform">{{ $t('网页表单工单') }}</option>
        </select>
      </div>
      <div class="sd-drawer-field">
        <label>{{ $t('客户') }}</label>
        <input v-model="simCustomer" type="text" :placeholder="$t('客户或公司名称')" />
      </div>
      <div class="sd-drawer-field">
        <label>{{ $t('主题') }}</label>
        <input v-model="simSubject" type="text" :placeholder="$t('一句话说明诉求')" />
      </div>
      <div class="sd-drawer-field">
        <label>{{ $t('正文') }}</label>
        <textarea v-model="simBody" rows="5"></textarea>
      </div>
      <template #footer>
      <button class="sd-btn ghost" type="button" @click="simulateOpen = false">{{ $t('取消') }}</button>
      <button class="sd-btn primary" type="button" :disabled="!simSubject.trim()" @click="addSimulated">{{ $t('加入收件箱') }}</button>
      </template>
    </TModal>

    <!-- 数据包：产品目录 / 成本规则 / 历史报价。改规则会 bump 版本并写审计 -->
    <TModal
      :open="dataPackOpen"
      :title="$t('数据包')"
      :description="$t('这里改的是报价的依据：产品单价、费率、毛利。保存后规则版本号会 +1，报价卡每个公式弹层都会显示按哪一版算的，改动同时写进审计。')"
      :tone="moduleId"
      icon="ri-database-2-line"
      size="lg"
      @close="dataPackOpen = false"
    >
      <template v-if="dataPackDraft">
        <nav class="sd-pack-tabs">
          <button :class="{ active: packTab === 'rules' }" type="button" @click="packTab = 'rules'">{{ $t('成本规则') }}</button>
          <button :class="{ active: packTab === 'products' }" type="button" @click="packTab = 'products'">
            {{ $t('产品目录') }} <em>{{ dataPackDraft.products.length }}</em>
          </button>
          <button :class="{ active: packTab === 'benchmarks' }" type="button" @click="packTab = 'benchmarks'">
            {{ $t('历史报价') }} <em>{{ dataPackDraft.benchmarks.length }}</em>
          </button>
          <button v-if="moduleId === 'bid-decision'" :class="{ active: packTab === 'weights' }" type="button" @click="packTab = 'weights'">
            {{ $t('决策权重') }} <em>{{ weightTotal }}</em>
          </button>
        </nav>
        <div v-if="packTab === 'rules'" class="sd-drawer-grid">
          <div v-for="rule in RULE_FIELDS" :key="rule.key" class="sd-drawer-field">
            <label>{{ $t(rule.label) }}<em v-if="rule.suffix" class="sd-field-note">{{ rule.suffix }}</em></label>
            <input
              :value="ruleValue(rule.key)"
              type="number"
              :step="rule.step"
              @input="setRuleValue(rule.key, ($event.target as HTMLInputElement).value)"
            />
          </div>
          <div class="sd-drawer-field">
            <label>{{ $t('交付地点系数（距离 / 现场服务）') }}</label>
            <div v-for="city in Object.keys(dataPackDraft.rules.distanceFactor)" :key="city" class="sd-city-row">
              <span>{{ city }}</span>
              <input
                :value="dataPackDraft.rules.distanceFactor[city]"
                type="number" step="0.05"
                @input="dataPackDraft.rules.distanceFactor[city] = Number(($event.target as HTMLInputElement).value)"
              />
              <input
                :value="dataPackDraft.rules.onSiteFactor[city] ?? 1"
                type="number" step="0.05"
                @input="dataPackDraft.rules.onSiteFactor[city] = Number(($event.target as HTMLInputElement).value)"
              />
            </div>
          </div>
        </div>
        <div v-else-if="packTab === 'products'">
          <div class="sd-section-actions" style="margin-bottom: 8px;">
            <button class="sd-btn" type="button" @click="importProductsFile">
              <i class="ri-file-excel-line"></i>{{ $t('从 Excel 导入') }}
            </button>
            <button class="sd-btn" type="button" @click="addProduct">
              <i class="ri-add-line"></i>{{ $t('新增一行') }}
            </button>
          </div>
          <div class="sd-table-wrap">
            <table class="sd-table">
              <thead>
                <tr>
                  <th>SKU</th><th>{{ $t('描述') }}</th><th class="num">{{ $t('单价') }}</th>
                  <th>{{ $t('单位') }}</th><th>{{ $t('交期') }}</th><th>{{ $t('库存') }}</th><th></th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(row, i) in dataPackDraft.products" :key="i">
                  <td><input v-model="row.sku" class="sd-cell-input mono" type="text" /></td>
                  <td><input v-model="row.description" class="sd-cell-input" type="text" /></td>
                  <td class="num"><input v-model.number="row.unitCost" class="sd-cell-input num" type="number" /></td>
                  <td><input v-model="row.unit" class="sd-cell-input narrow" type="text" /></td>
                  <td><input v-model="row.leadTime" class="sd-cell-input narrow" type="text" /></td>
                  <td><input v-model="row.stock" class="sd-cell-input" type="text" /></td>
                  <td><button class="sd-btn ghost" type="button" @click="dataPackDraft.products.splice(i, 1)">×</button></td>
                </tr>
              </tbody>
            </table>
          </div>
          <p class="sd-hint">{{ $t('库存写"不足 / 缺货"时，供应卡会自动触发替代型号建议。') }}</p>
        </div>
        <div v-else-if="packTab === 'weights'">
          <p class="sd-hint">
            {{ $t('这是 Bid/No-Bid 的评分权重。顺序上硬性门槛永远排在评分之前——存在无法解决的强制条件时，分数再高也不建议参与，改权重不会改变这条规则。') }}
          </p>
          <div class="sd-table-wrap">
            <table class="sd-table">
              <thead>
                <tr><th>{{ $t('维度') }}</th><th class="num">{{ $t('权重') }}</th><th>{{ $t('占比') }}</th></tr>
              </thead>
              <tbody>
                <tr v-for="(row, i) in dataPackDraft.decisionWeights" :key="row.key || i">
                  <td><input v-model="row.label" class="sd-cell-input" type="text" /></td>
                  <td class="num"><input v-model.number="row.weight" class="sd-cell-input num" type="number" min="0" step="1" /></td>
                  <td>
                    <div class="sd-weight-bar"><i :style="{ width: `${weightTotal ? (row.weight / weightTotal) * 100 : 0}%` }"></i></div>
                  </td>
                </tr>
              </tbody>
              <tfoot>
                <tr>
                  <td>{{ $t('合计') }}</td>
                  <td class="num" :class="{ 'sd-weight-warn': weightTotal !== 100 }">{{ weightTotal }}</td>
                  <td>
                    <span v-if="weightTotal !== 100" class="sd-weight-warn">
                      {{ $t('合计不是 100，评分仍按实际权重算，只是口径要对客户说清楚') }}
                    </span>
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
        <div v-else class="sd-table-wrap">
          <table class="sd-table">
            <thead>
              <tr><th>{{ $t('对照') }}</th><th>{{ $t('范围') }}</th><th>{{ $t('合计') }}</th><th>{{ $t('毛利率') }}</th><th>{{ $t('结果') }}</th><th></th></tr>
            </thead>
            <tbody>
              <tr v-for="(row, i) in dataPackDraft.benchmarks" :key="i">
                <td><input v-model="row.name" class="sd-cell-input" type="text" /></td>
                <td><input v-model="row.scope" class="sd-cell-input" type="text" /></td>
                <td><input v-model="row.total" class="sd-cell-input narrow" type="text" /></td>
                <td><input v-model="row.margin" class="sd-cell-input narrow" type="text" /></td>
                <td><input v-model="row.result" class="sd-cell-input narrow" type="text" /></td>
                <td><button class="sd-btn ghost" type="button" @click="dataPackDraft.benchmarks.splice(i, 1)">×</button></td>
              </tr>
            </tbody>
          </table>
        </div>
      </template>
      <template #footer>
      <button class="sd-btn" type="button" :disabled="packBusy" @click="resetDataPack">
        <i class="ri-restart-line"></i>{{ $t('恢复出厂') }}
      </button>
      <span class="sd-head-spacer"></span>
      <button class="sd-btn ghost" type="button" @click="dataPackOpen = false">{{ $t('取消') }}</button>
      <button class="sd-btn primary" type="button" :disabled="packBusy" @click="saveDataPack">
        <i :class="packBusy ? 'ri-loader-4-line spin' : 'ri-save-line'"></i>{{ $t('保存并重算报价') }}
      </button>
      </template>
    </TModal>

    <!-- 邮箱账号配置：直接在模块页里填，填完就能自动巡检邮件，不用跳去设置页 -->
    <TModal
      v-if="emailConfigAllowed === true"
      :open="emailConfigOpen"
      :title="$t('邮箱收件配置')"
      :description="$t('填好后系统会按固定间隔自动巡检这个邮箱：把客户发来的询价 / 标书 / 咨询连同附件收进下面的收件箱。')"
      :tone="moduleId"
      icon="ri-mail-settings-line"
      size="md"
      @close="emailConfigOpen = false"
    >
      <div class="sd-drawer-field">
        <label>{{ $t('常用邮箱（选了自动填服务器地址）') }}</label>
        <div class="sd-preset-row">
          <button
            v-for="preset in EMAIL_PRESETS"
            :key="preset.key"
            type="button"
            class="sd-btn"
            :class="{ primary: emailForm.preset === preset.key }"
            @click="applyEmailPreset(preset.key)"
          >{{ preset.label }}</button>
        </div>
      </div>
      <div class="sd-drawer-field">
        <label>{{ $t('邮箱地址') }}</label>
        <input v-model="emailForm.address" type="text" placeholder="sales@company.com" />
      </div>
      <div class="sd-drawer-field">
        <label>
          {{ $t('密码 / 授权码') }}
          <em v-if="emailForm.passwordSet" class="sd-field-note">{{ $t('（已保存，留空表示不修改）') }}</em>
        </label>
        <input v-model="emailForm.password" type="password" :placeholder="$t('多数邮箱要用授权码，不是登录密码')" />
      </div>
      <div class="sd-drawer-grid">
        <div class="sd-drawer-field">
          <label>{{ $t('IMAP 收件服务器') }}</label>
          <input v-model="emailForm.imapHost" type="text" placeholder="imap.exmail.qq.com" />
        </div>
        <div class="sd-drawer-field">
          <label>{{ $t('IMAP 端口') }}</label>
          <input v-model="emailForm.imapPort" type="text" placeholder="993" />
        </div>
        <div class="sd-drawer-field">
          <label>{{ $t('SMTP 发信服务器') }}</label>
          <input v-model="emailForm.smtpHost" type="text" placeholder="smtp.exmail.qq.com" />
        </div>
        <div class="sd-drawer-field">
          <label>{{ $t('SMTP 端口') }}</label>
          <input v-model="emailForm.smtpPort" type="text" placeholder="465" />
        </div>
      </div>
      <p class="sd-hint">
        {{ $t('收件只用 IMAP；SMTP 仅用于以后回复客户，本平台目前所有发送都是模拟，不会真实外发。') }}
      </p>
      <template #footer>
      <button class="sd-btn ghost" type="button" @click="emailConfigOpen = false">{{ $t('取消') }}</button>
      <button class="sd-btn" type="button" @click="goSettings">{{ $t('去完整设置页') }}</button>
      <button class="sd-btn primary" type="button" :disabled="emailBusy || !emailForm.address.trim()" @click="saveEmailConfig">
        <i :class="emailBusy ? 'ri-loader-4-line spin' : 'ri-check-line'"></i>{{ $t('保存并立即收取') }}
      </button>
      </template>
    </TModal>

    <!--
      WhatsApp 扫码绑定 —— 就地弹层，不再把用户丢去「设置 · 消息平台」。
      底层与设置页共用 useWhatsappPairing（同一组 qiyeApi.whatsapp* IPC），两处不会走岔。
    -->
    <TModal
      :open="waOpen"
      :title="$t('WhatsApp 个人号绑定')"
      :description="$t('手机 WhatsApp →「设置 → 已连接的设备 → 连接设备」扫描下方二维码。走的是个人号通道（Baileys 桥），不是 Business API，对客户口径不要说成 Business API。')"
      :tone="moduleId"
      icon="ri-whatsapp-line"
      size="md"
      @close="closeWhatsappPair"
    >
      <div class="sd-wa-stage" :class="`stage-${waPair.state.stage}`">
        <i :class="waStageIcon"></i>
        <span>{{ $t(WA_PAIR_STAGE_LABEL[waPair.state.stage]) }}</span>
      </div>
      <div v-if="waPair.state.stage === 'paired'" class="sd-wa-paired">
        <i class="ri-checkbox-circle-fill"></i>
        <div>
          <strong>
            {{ $t('已绑定') }}
            <template v-if="waPair.state.user">{{ $t('（{p0}）', { p0: waPair.state.user }) }}</template>
          </strong>
          <p>{{ $t('该号收到的消息与附件会自动进入本模块收件箱。') }}</p>
        </div>
      </div>
      <div v-else-if="waPair.state.qrImageDataUrl" class="sd-wa-qr">
        <img :src="waPair.state.qrImageDataUrl" :alt="$t('WhatsApp 扫码配对')" />
        <p>{{ $t('二维码约 20s 刷新一次，过期会自动换新') }}</p>
      </div>
      <div v-else-if="waPair.state.stage === 'starting' || waPair.state.stage === 'waiting_scan'" class="sd-wa-booting">
        <i class="ri-loader-4-line spin"></i>
        <p>{{ $t('正在启动 WhatsApp bridge 并生成二维码…（首次约 5–10 秒，冷启稍慢）') }}</p>
      </div>
      <p v-if="waPair.state.error" class="sd-doc-error">{{ waPair.state.error }}</p>
      <template #footer>
      <button class="sd-btn ghost" type="button" @click="closeWhatsappPair">{{ $t('关闭') }}</button>
      <button
        v-if="waPair.state.stage === 'paired'"
        class="sd-btn"
        type="button"
        :disabled="waPair.state.busy"
        @click="unbindWhatsapp"
      >{{ $t('解绑') }}</button>
      <button
        v-else-if="waPair.state.stage === 'waiting_scan' || waPair.state.stage === 'starting'"
        class="sd-btn"
        type="button"
        @click="waPair.cancel()"
      >{{ $t('取消') }}</button>
      <button
        v-if="waPair.state.stage !== 'paired'"
        class="sd-btn primary"
        type="button"
        :disabled="waPair.state.busy"
        @click="waPair.start()"
      >
        <i :class="waPair.state.busy ? 'ri-loader-4-line spin' : 'ri-qr-code-line'"></i>
        {{ waPair.state.qrImageDataUrl ? $t('重新生成二维码') : $t('生成二维码') }}
      </button>
      </template>
    </TModal>

    <!--
      外部标讯来源登记（招投标模块）。用共用的 TModal 外壳，不再各画各的 overlay。
      合规红线写死在这块 UI 上：只登记获准的公开列表页、只抓快照、不登录不绕验证码。
    -->
    <TModal
      :open="tenderSourcesOpen"
      :title="$t('外部标讯来源登记')"
      :description="$t('只登记获准的公开公告列表页。系统抓的是网页快照，界面上每条标讯都会显示来源链接与抓取时间，并标 Snapshot —— 不得对客户说成实时对接官方接口。需要登录、验证码或反爬的站点不在本通道范围内。')"
      :tone="moduleId"
      icon="ri-global-line"
      size="lg"
      @close="tenderSourcesOpen = false"
    >
      <!-- 已登记的来源：可以加任意多个，各自独立启用/停用 -->
      <div class="sd-sub-title">
        {{ $t('已登记来源') }}
        <em v-if="tenderSources.length" class="sd-count-inline">{{ $t('{p0} 个', { p0: tenderSources.length }) }}</em>
      </div>
      <div v-if="!tenderSources.length" class="sd-hint">{{ $t('还没有登记来源。可以从下面的常用平台一键填入，也可以自己加。') }}</div>
      <div v-else class="sd-table-wrap">
        <table class="sd-table">
          <thead>
            <tr>
              <th>{{ $t('来源') }}</th><th>{{ $t('适用范围') }}</th><th>{{ $t('上次抓取') }}</th><th>{{ $t('启用') }}</th><th></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="src in tenderSources" :key="src.id">
              <td>
                <div>{{ src.name }}</div>
                <a class="sd-ext-link" :href="src.listUrl" target="_blank" rel="noreferrer">{{ src.listUrl }}</a>
              </td>
              <td>{{ src.scope || '—' }}</td>
              <td>{{ src.lastFetchedAt ? shortTime(src.lastFetchedAt) : $t('未抓过') }}</td>
              <td>{{ src.enabled ? $t('是') : $t('否') }}</td>
              <td>
                <button class="sd-link" type="button" @click="editTenderSource(src)">{{ $t('编辑') }}</button>
                <button class="sd-link" type="button" @click="removeTenderSource(src)">{{ $t('删除') }}</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!--
        预置的沙特公开招标平台。这几个是公开可访问的官方/半官方平台首页，
        行选择器与字段选择器给的是**常见结构的起手值** —— 各站 DOM 不同，
        必须点「试抓 5 条」看回显再调，别直接当成一定能跑通。
      -->
      <div class="sd-sub-title">{{ $t('常用平台（点一下填入）') }}</div>
      <p class="sd-hint">
        {{ $t('下面这些是**实测抓得到**的公开列表页，选择器已按各站真实结构调过。其它平台（Aramco / SEC / NWC 等）的采购页是前端渲染或没有公开列表，本通道抓不到，请改用邮件或上传件。') }}
      </p>
      <div class="sd-preset-list">
        <button
          v-for="preset in TENDER_PRESETS"
          :key="preset.name"
          class="sd-preset"
          type="button"
          @click="applyTenderPreset(preset)"
        >
          <strong>{{ $t(preset.name) }}</strong>
          <span>{{ preset.listUrl }}</span>
          <em>{{ $t(preset.note) }}</em>
        </button>
      </div>

      <div class="sd-sub-title">{{ tenderForm.id ? $t('编辑来源') : $t('新增来源') }}</div>
      <div class="sd-drawer-grid">
        <div class="sd-drawer-field">
          <label>{{ $t('来源名称') }}</label>
          <input v-model="tenderForm.name" type="text" :placeholder="$t('沙特中央招标平台')" />
        </div>
        <div class="sd-drawer-field">
          <label>{{ $t('适用范围（写清这条来源覆盖什么，演示时要能答上来）') }}</label>
          <input v-model="tenderForm.scope" type="text" :placeholder="$t('安防与网络类公开公告')" />
        </div>
      </div>
      <div class="sd-drawer-field">
        <label>{{ $t('公告列表页地址（公开可访问）') }}</label>
        <input v-model="tenderForm.listUrl" type="text" placeholder="https://tenders.etimad.sa/Tender/AllTendersForVisitor" />
      </div>
      <div class="sd-drawer-field">
        <label>{{ $t('公告行选择器（CSS，一行一条公告）') }}</label>
        <input v-model="tenderForm.rowSelector" type="text" placeholder="table tbody tr" />
      </div>
      <div class="sd-drawer-grid">
        <div v-for="key in TENDER_FIELD_KEYS" :key="key" class="sd-drawer-field">
          <label>{{ $t(TENDER_FIELD_LABELS[key]) }}</label>
          <input v-model="tenderForm.fieldSelectors[key]" type="text" :placeholder="$t('行内选择器，如 td:nth-child(2)')" />
        </div>
      </div>

      <div v-if="tenderTestResult" class="sd-ticket-test">
        <div class="sd-sql"><span>{{ $t('抓取') }}</span><code>{{ tenderTestResult.describe }}</code></div>
        <p v-if="tenderTestResult.loggedIn === false" class="sd-doc-error">
          <i class="ri-error-warning-line"></i>
          {{ $t('该页面需要登录 —— 按合规边界本通道不处理需登录/验证码的站点，请改用邮件或上传件。') }}
        </p>
        <p v-else-if="tenderTestResult.message" class="sd-doc-error">{{ tenderTestResult.message }}</p>
        <div v-else-if="tenderTestResult.rows?.length" class="sd-table-wrap">
          <table class="sd-table">
            <thead><tr><th v-for="col in Object.keys(tenderTestResult.rows[0])" :key="col">{{ col }}</th></tr></thead>
            <tbody>
              <tr v-for="(row, i) in tenderTestResult.rows" :key="i">
                <td v-for="col in Object.keys(tenderTestResult.rows[0])" :key="col">{{ row[col] }}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p v-else class="sd-hint">{{ $t('抓取成功，但这一页没解析出公告行 —— 多半是行选择器没对上。') }}</p>
      </div>

      <template #footer>
        <button v-if="tenderForm.id" class="sd-btn ghost" type="button" @click="resetTenderForm">
          {{ $t('取消编辑') }}
        </button>
        <button class="sd-btn" type="button" :disabled="tenderBusy || !tenderForm.listUrl.trim()" @click="testTenderSource">
          <i :class="tenderBusy ? 'ri-loader-4-line spin' : 'ri-flask-line'"></i>{{ $t('试抓 5 条') }}
        </button>
        <button class="sd-btn primary" type="button" :disabled="tenderBusy || !tenderForm.listUrl.trim()" @click="saveTenderSource">
          {{ tenderForm.id ? $t('保存修改') : $t('添加这个来源') }}
        </button>
      </template>
    </TModal>

    <!-- 工单库配置 -->
    <TModal
      :open="ticketConfigOpen"
      :title="$t('工单库配置（网页表单通道）')"
      :tone="moduleId"
      icon="ri-database-2-line"
      size="lg"
      @close="ticketConfigOpen = false"
    >
      <!-- 两种取数方式：有库权限就读库，没有就登录后台网站抓 -->
      <div class="sd-modes">
        <button
          type="button"
          class="sd-mode"
          :class="{ active: ticketForm.mode === 'database' }"
          @click="ticketForm.mode = 'database'"
        >
          <i class="ri-database-2-line"></i>
          <strong>{{ $t('读数据库') }}</strong>
          <span>{{ $t('客户表单落进业务库，我们按游标增量查，只发 SELECT') }}</span>
        </button>
        <button
          type="button"
          class="sd-mode"
          :class="{ active: ticketForm.mode === 'web' }"
          @click="ticketForm.mode = 'web'"
        >
          <i class="ri-global-line"></i>
          <strong>{{ $t('从网页抓取') }}</strong>
          <span>{{ $t('没有库权限时：配登录网址与账号密码，登录后抓工单列表页') }}</span>
        </button>
      </div>
      <!-- ① 读数据库 -->
      <template v-if="ticketForm.mode === 'database'">
        <p class="sd-hint">
          {{ $t('表单提交后落在业务库的工单表里。这里指定表与列名映射，系统按游标增量查询；只发 SELECT，不写库。') }}
        </p>
        <div class="sd-drawer-field">
          <label>{{ $t('数据源名（「企业数据 · 多库分析」里已登记的）') }}</label>
          <input v-model="ticketForm.sourceName" type="text" placeholder="crm_main" />
        </div>
        <div class="sd-drawer-grid">
          <div class="sd-drawer-field">
            <label>{{ $t('工单表 / 视图') }}</label>
            <input v-model="ticketForm.table" type="text" placeholder="web_form_ticket" />
          </div>
          <div class="sd-drawer-field">
            <label>{{ $t('主键列') }}</label>
            <input v-model="ticketForm.pk" type="text" placeholder="id" />
          </div>
          <div class="sd-drawer-field">
            <label>{{ $t('增量游标列') }}</label>
            <input v-model="ticketForm.cursorColumn" type="text" placeholder="updated_at" />
          </div>
          <div class="sd-drawer-field">
            <label>{{ $t('过滤条件（可选）') }}</label>
            <input v-model="ticketForm.where" type="text" placeholder="status IN ('new','reopened')" />
          </div>
        </div>
        <div class="sd-sub-title">{{ $t('列名映射') }}</div>
        <div class="sd-drawer-grid">
          <div v-for="key in TICKET_FIELD_KEYS" :key="key" class="sd-drawer-field">
            <label>{{ $t(TICKET_FIELD_LABELS[key]) }}</label>
            <input v-model="ticketForm.columnMap[key]" type="text" :placeholder="key" />
          </div>
        </div>
      </template>
      <!-- ② 从网页抓取 -->
      <template v-else>
        <p class="sd-hint">
          {{ $t('登录一次后会话会留着，后续每轮直接打开列表页抓取。全程只读：只做导航、填登录表单、读页面，不点任何提交或删除按钮。') }}
        </p>
        <div class="sd-drawer-field">
          <label>{{ $t('显示名（用于状态条与工单来源标注）') }}</label>
          <input v-model="ticketForm.sourceName" type="text" :placeholder="$t('客户工单后台')" />
        </div>
        <div class="sd-drawer-field">
          <label>{{ $t('登录网址') }}</label>
          <input v-model="ticketForm.web.loginUrl" type="text" placeholder="https://crm.example.com/login" />
        </div>
        <div class="sd-drawer-field">
          <label>{{ $t('工单列表页（登录后跳转到这里抓；留空则登录完就地抓）') }}</label>
          <input v-model="ticketForm.web.listUrl" type="text" placeholder="https://crm.example.com/tickets" />
        </div>
        <div class="sd-drawer-grid">
          <div class="sd-drawer-field">
            <label>{{ $t('账号') }}</label>
            <input v-model="ticketForm.web.username" type="text" autocomplete="off" />
          </div>
          <div class="sd-drawer-field">
            <label>
              {{ $t('密码') }}
              <em v-if="ticketForm.web.passwordSaved" class="sd-saved-tag">{{ $t('已保存') }}</em>
            </label>
            <input
              v-model="ticketForm.web.password"
              type="password"
              autocomplete="new-password"
              :placeholder="ticketForm.web.passwordSaved ? $t('不改就留空') : ''"
            />
          </div>
        </div>
        <p class="sd-hint">{{ $t('密码加密后存在本机，不会回传界面、不会出现在日志里。遇到验证码或二次验证的后台，这条通道用不了，请改用读数据库。') }}</p>
        <div class="sd-sub-title">{{ $t('抓取规则') }}</div>
        <div class="sd-drawer-field">
          <label>{{ $t('工单行选择器（CSS，一行一条工单）') }}</label>
          <input v-model="ticketForm.web.rowSelector" type="text" placeholder="table.tickets tbody tr" />
        </div>
        <div class="sd-drawer-grid">
          <div v-for="key in TICKET_FIELD_KEYS" :key="key" class="sd-drawer-field">
            <label>{{ $t(TICKET_FIELD_LABELS[key]) }}</label>
            <input v-model="ticketForm.web.fieldSelectors[key]" type="text" :placeholder="$t('行内选择器，如 td:nth-child(2)')" />
          </div>
        </div>
        <details class="sd-adv">
          <summary>{{ $t('登录表单选择器（一般不用填，自动识别）') }}</summary>
          <div class="sd-drawer-grid">
            <div class="sd-drawer-field">
              <label>{{ $t('账号输入框') }}</label>
              <input v-model="ticketForm.web.usernameSelector" type="text" placeholder="#username" />
            </div>
            <div class="sd-drawer-field">
              <label>{{ $t('密码输入框') }}</label>
              <input v-model="ticketForm.web.passwordSelector" type="text" placeholder="input[type=password]" />
            </div>
            <div class="sd-drawer-field">
              <label>{{ $t('登录按钮') }}</label>
              <input v-model="ticketForm.web.submitSelector" type="text" placeholder="button[type=submit]" />
            </div>
            <div class="sd-drawer-field">
              <label>{{ $t('页面渲染等待（毫秒）') }}</label>
              <input v-model.number="ticketForm.web.waitMs" type="number" placeholder="1500" />
            </div>
          </div>
        </details>
      </template>
      <div v-if="ticketTestResult" class="sd-ticket-test">
        <div class="sd-sql">
          <span>{{ ticketForm.mode === 'web' ? $t('抓取') : 'SQL' }}</span>
          <code>{{ ticketTestResult.sql }}</code>
        </div>
        <p v-if="ticketForm.mode === 'web' && ticketTestResult.loggedIn === false" class="sd-doc-error">
          <i class="ri-error-warning-line"></i>
          {{ $t('登录没通过，停在 {p0}', { p0: ticketTestResult.landedUrl || '-' }) }}
        </p>
        <p v-if="ticketTestResult.message" class="sd-doc-error">{{ ticketTestResult.message }}</p>
        <div v-else-if="ticketTestResult.rows?.length" class="sd-table-wrap">
          <table class="sd-table">
            <thead><tr><th v-for="col in Object.keys(ticketTestResult.rows[0])" :key="col">{{ col }}</th></tr></thead>
            <tbody>
              <tr v-for="(row, i) in ticketTestResult.rows" :key="i">
                <td v-for="col in Object.keys(ticketTestResult.rows[0])" :key="col">{{ row[col] }}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p v-else class="sd-hint">{{ $t('查询成功，但当前条件下没有工单。') }}</p>
      </div>
      <template #footer>
      <button class="sd-btn" type="button" :disabled="ticketBusy" @click="testTicketSource">
        <i :class="ticketBusy ? 'ri-loader-4-line spin' : 'ri-flask-line'"></i>
        {{ ticketForm.mode === 'web' ? $t('试抓 5 条') : $t('试查 5 行') }}
      </button>
      <button class="sd-btn primary" type="button" :disabled="ticketBusy" @click="saveTicketSource">{{ $t('保存并启用') }}</button>
      </template>
    </TModal>

    <!-- 输出中心 -->
    <TModal
      :open="outputsOpen && !!activeCase"
      :title="$t('输出中心')"
      :description="$t('未审批的文件带 DRAFT 水印且不可发送；审批通过后可一键把整批文件发给相关人。')"
      :tone="moduleId"
      icon="ri-folder-chart-line"
      size="lg"
      @close="outputsOpen = false"
    >
      <!-- 交付目录：案件目录始终有一份，这里配的是「另外再放去哪」 -->
      <div class="sd-sub-title">{{ $t('交付目录') }}</div>
      <div class="sd-dirs">
        <div class="sd-dir-row">
          <i class="ri-folder-open-line"></i>
          <span class="sd-dir-label">{{ $t('导出目录') }}</span>
          <code class="sd-dir-path">{{ deliveryDirs.outputDir || $t('未设置（只落案件目录）') }}</code>
          <button class="sd-btn" type="button" @click="pickDeliveryDir('output')">{{ $t('选择') }}</button>
          <button v-if="deliveryDirs.outputDir" class="sd-btn ghost" type="button" @click="clearDeliveryDir('output')">
            {{ $t('清除') }}
          </button>
        </div>
        <div class="sd-dir-row">
          <i class="ri-hard-drive-2-line"></i>
          <span class="sd-dir-label">{{ $t('备份目录') }}</span>
          <code class="sd-dir-path">{{ deliveryDirs.backupDir || $t('未设置') }}</code>
          <button class="sd-btn" type="button" @click="pickDeliveryDir('backup')">{{ $t('选择') }}</button>
          <button v-if="deliveryDirs.backupDir" class="sd-btn ghost" type="button" @click="clearDeliveryDir('backup')">
            {{ $t('清除') }}
          </button>
        </div>
        <p class="sd-hint">{{ $t('生成正式件时会自动往这两个目录各放一份，文件名前缀是任务编号。复制失败不影响案件目录里的那份。') }}</p>
      </div>
      <div class="sd-sub-title sd-sub-title-row">
        <span>{{ $t('已生成文件') }}</span>
        <!-- 一键发送：一封信带齐整批附件，发给一批人。逐个点「发送…」既慢又容易漏 -->
        <button
          v-if="sendableOutputs.length"
          class="sd-btn primary"
          type="button"
          :disabled="!isApproved"
          :title="isApproved ? '' : $t('本案尚未审批')"
          @click="openBatchSendDrawer()"
        >
          <i class="ri-send-plane-fill"></i>{{ $t('一键发送（{p0} 份）', { p0: sendableOutputs.length }) }}
        </button>
      </div>
      <div v-if="!activeCase.outputs.length" class="sd-hint">{{ $t('还没有生成任何文件。在「输出物」卡片里点生成。') }}</div>
      <!--
        同名文件按版本折叠：默认只摆最新那版，旧版收进「历史版本」。
        重新生成**不覆盖**是有意为之 —— 审批过、已经发出去的那版必须留痕；
        真不要了就点这一行右边的删除（连磁盘文件一起清，并记进审计）。
      -->
      <div
        v-for="row in visibleOutputRows"
        :key="row.o.id"
        class="sd-output-row"
        :class="{ 'is-history': row.isHistory }"
      >
        <i :class="outputIcon(row.o.kind)"></i>
        <span class="sd-output-name">{{ row.o.name }} {{ row.o.version }}</span>
        <span v-if="row.isHistory" class="sd-badge tone-muted">{{ $t('历史版本') }}</span>
        <span v-if="row.o.draft" class="sd-badge tone-muted">{{ $t('草稿水印') }}</span>
        <span v-else-if="row.o.generatedBeforeApproval" class="sd-badge tone-warn">{{ $t('文件里仍有 DRAFT 水印 · 建议重新生成') }}</span>
        <span v-else class="sd-badge tone-ok">{{ $t('正式件') }}</span>
        <span v-if="row.o.exportedPaths?.length" class="sd-badge tone-ok">{{ $t('已另存 {p0} 份', { p0: row.o.exportedPaths.length }) }}</span>
        <!--
          校验结论与**这一版文件**绑在一起。客户问「这个数字核过没有」时，
          答案要能在文件旁边一眼看到，而不是去翻审计流水。
        -->
        <button
          v-if="row.o.validation"
          class="sd-badge sd-badge-btn"
          :class="row.o.validation.warningCount ? 'tone-warn' : 'tone-ok'"
          type="button"
          @click="openValidationReport(row.o.validation, `${row.o.name} ${row.o.version}`)"
        >
          <i class="ri-shield-check-line"></i>{{ row.o.validation.summary }}
        </button>
        <span class="sd-output-version">{{ shortTime(row.o.generatedAt) }}</span>
        <!-- 同名旧版的入口挂在最新那一行上：不展开就完全看不到旧版，列表不再越堆越长 -->
        <button
          v-if="row.olderCount"
          class="sd-btn ghost"
          type="button"
          @click="toggleOutputHistory(row.o.name)"
        >
          {{ isOutputHistoryOpen(row.o.name)
            ? $t('收起历史')
            : $t('历史版本（{n}）', { n: row.olderCount }) }}
        </button>
        <button class="sd-btn" type="button" @click="revealOutput(row.o.id)">{{ $t('打开所在文件夹') }}</button>
        <button class="sd-btn" type="button" @click="openSendDrawer(row.o)">{{ $t('发送…') }}</button>
        <button class="sd-btn danger" type="button" :title="$t('删除这一版（连磁盘文件）')" @click="removeOutput(row.o)">
          <i class="ri-delete-bin-line"></i>
        </button>
      </div>
      <pre v-if="sendReceipt" class="sd-receipt">{{ sendReceipt }}</pre>
    </TModal>

    <!--
      对抗性复核结果（P2-1）。刻意把**提问原文**也摆出来 ——
      用户要能判断「这个反对意见是不是因为问题问歪了才得出来的」。
    -->
    <TModal
      :open="councilOpen"
      :title="$t('专家团正反辩论复核')"
      :description="$t('对同一份事实分别论证正反两面，再裁决 —— 专门用来找反对意见')"
      :tone="moduleId"
      icon="ri-scales-3-line"
      size="lg"
      @close="councilOpen = false"
    >
      <div class="sd-sub-title">{{ $t('提交给专家团的问题') }}</div>
      <pre class="sd-receipt">{{ councilQuestion }}</pre>
      <div class="sd-sub-title">{{ $t('裁决结论') }}</div>
      <div v-if="councilBusy" class="sd-hint">
        <i class="ri-loader-4-line"></i>
        {{ $t('三阶段议事进行中：独立作答 → 交叉排序 → 综合裁决，通常需要 1–3 分钟。') }}
      </div>
      <div v-else-if="councilError" class="sd-doc-error">{{ councilError }}</div>
      <pre v-else-if="councilAnswer" class="sd-receipt">{{ councilAnswer }}</pre>
      <p class="sd-hint">
        {{ $t('复核结论已写入案件审计 —— 事后要能回答「这个投标结论被质疑过没有」。') }}
      </p>
    </TModal>

    <!--
      交付物大纲（P1-1 大纲先行）。
      投标建议书是**要被评标委员会逐条打分**的，结构比辞藻重要得多；
      而且改一行大纲比改一份三十页的建议书便宜一个数量级 —— 人审就该提前到这一屏。
    -->
    <TModal
      :open="outlineOpen"
      :title="$t('交付物大纲')"
      :description="outlineTargetName"
      :tone="moduleId"
      icon="ri-list-check-2"
      size="lg"
      @close="outlineOpen = false"
    >
      <div v-if="outlineDraft" class="sd-ol">
        <div class="sd-ol-status" :class="outlineConfirmed ? 'ok' : 'todo'">
          <i :class="outlineConfirmed ? 'ri-checkbox-circle-fill' : 'ri-error-warning-fill'"></i>
          <span>{{ outlineConfirmed
            ? $t('大纲已确认（v{p0}），可以生成正文', { p0: outlineDraft.version })
            : $t('大纲未确认。确认之前不会生成 Word / PDF 正文。') }}</span>
        </div>

        <div class="sd-sub-title">{{ $t('目标受众') }}</div>
        <input v-model="outlineDraft.audience" class="sd-ol-input" :placeholder="$t('例：评标委员会技术组')" />

        <div class="sd-ol-two">
          <div>
            <div class="sd-sub-title">{{ $t('必讲（内容边界内）') }}</div>
            <textarea v-model="outlineInScopeText" class="sd-ol-area" rows="4"
              :placeholder="$t('一行一条')"></textarea>
          </div>
          <div>
            <div class="sd-sub-title">{{ $t('不讲（越界即风险）') }}</div>
            <textarea v-model="outlineOutScopeText" class="sd-ol-area" rows="4"
              :placeholder="$t('一行一条，例：其他客户的同类案例')"></textarea>
          </div>
        </div>

        <div class="sd-sub-title">{{ $t('逐节要点与证据来源') }}</div>
        <div v-for="(sec, i) in outlineDraft.sections" :key="sec.id" class="sd-ol-sec" :class="{ pending: sec.pending }">
          <div class="sd-ol-sec-head">
            <span class="sd-ol-no">{{ i + 1 }}</span>
            <input v-model="sec.title" class="sd-ol-input" @input="sec.dirty = true" />
            <span v-if="sec.pending" class="sd-badge tone-warn">{{ $t('待补') }}</span>
            <span v-else-if="sec.dirty" class="sd-badge tone-muted">{{ $t('已改动 · 将重新生成') }}</span>
            <button class="sd-btn ghost" type="button" @click="outlineDraft.sections.splice(i, 1)">
              <i class="ri-delete-bin-line"></i>
            </button>
          </div>
          <textarea :value="sec.points.join('\n')" class="sd-ol-area" rows="2"
            :placeholder="$t('本节要点，一行一条')"
            @input="onOutlinePoints(sec, ($event.target as HTMLTextAreaElement).value)"></textarea>
          <div class="sd-ol-evi">
            <i class="ri-links-line"></i>
            <span v-if="sec.evidence.length">{{ sec.evidence.join(' · ') }}</span>
            <span v-else class="sd-ol-evi-none">{{ $t('本节暂无证据来源 —— 交付物里这一段将无法回溯') }}</span>
          </div>
        </div>
        <button class="sd-btn" type="button" @click="addOutlineSection">
          <i class="ri-add-line"></i>{{ $t('加一节') }}
        </button>

        <div class="sd-ol-actions">
          <button class="sd-btn" type="button" :disabled="outlineBusy" @click="saveOutline(false)">
            {{ $t('保存草稿') }}
          </button>
          <button class="sd-btn" type="button" :disabled="outlineBusy || !outlineDraft.sections.length"
            @click="saveOutlineAsTemplate">
            {{ $t('存为模板') }}
          </button>
          <button class="sd-btn primary" type="button" :disabled="outlineBusy || !outlineDraft.sections.length"
            @click="confirmOutlineAndGenerate">
            {{ $t('确认大纲并生成正文') }}
          </button>
        </div>
        <p class="sd-hint">
          {{ $t('确认后大纲若再被修改，需要重新确认才能生成 —— 否则「先审后写」这道闸门等于虚设。') }}
        </p>
      </div>
    </TModal>

    <!--
      交付物校验报告。生成被拦时**自动弹这一屏** —— 只 toast 一句「生成失败」
      等于把人推回去自己猜是哪一行错了，而 toast 装不下逐条定位。
    -->
    <TModal
      :open="validationOpen"
      :title="$t('交付物校验')"
      :description="validationSubject"
      :tone="moduleId"
      icon="ri-shield-check-line"
      size="lg"
      @close="validationOpen = false"
    >
      <div v-if="validationReport" class="sd-vd">
        <div class="sd-vd-head" :class="validationReport.passed ? 'ok' : 'bad'">
          <i :class="validationReport.passed ? 'ri-checkbox-circle-fill' : 'ri-close-circle-fill'"></i>
          <strong>{{ validationReport.summary }}</strong>
          <span v-if="!validationReport.passed">{{ $t('已阻断生成，未写入任何文件') }}</span>
        </div>

        <div v-if="validationBlocking.length" class="sd-sub-title">{{ $t('阻断项') }}</div>
        <div v-for="(issue, i) in validationBlocking" :key="`b${i}`" class="sd-vd-issue bad">
          <div class="sd-vd-loc">{{ issue.locator }}</div>
          <div class="sd-vd-msg">{{ issue.message }}</div>
          <div v-if="issue.expected !== undefined || issue.actual !== undefined" class="sd-vd-delta">
            <span v-if="issue.expected !== undefined">{{ $t('应为') }} <b>{{ issue.expected }}</b></span>
            <span v-if="issue.actual !== undefined">{{ $t('实为') }} <b>{{ issue.actual }}</b></span>
          </div>
        </div>

        <div v-if="validationWarnings.length" class="sd-sub-title">{{ $t('提醒项（不阻断）') }}</div>
        <div v-for="(issue, i) in validationWarnings" :key="`w${i}`" class="sd-vd-issue warn">
          <div class="sd-vd-loc">{{ issue.locator }}</div>
          <div class="sd-vd-msg">{{ issue.message }}</div>
        </div>

        <div class="sd-sub-title">{{ $t('逐项结论') }}</div>
        <div class="sd-vd-checks">
          <div v-for="c in validationReport.checks" :key="c.id" class="sd-vd-check" :class="{ off: !c.scanned }">
            <i :class="c.passed ? 'ri-check-line' : 'ri-close-line'" :style="{ color: c.passed ? '#12b76a' : '#f04438' }"></i>
            <span>{{ c.label }}</span>
            <em>{{ c.scanned ? $t('查 {p0} 项', { p0: c.scanned }) : $t('本次无可检对象') }}</em>
          </div>
        </div>
      </div>
    </TModal>

    <!--
      发送前复核：审批过的是**文件**，真正发出去的是邮件 —— 收件人、抄送、主题、正文
      都得在这一屏看清楚再点。**只有真发一种模式**：模拟发送做过演示期的脚手架，
      留着只会让人以为发出去了其实没发。未审批仍然发不了，闸门在主进程判死。
    -->
    <TModal
      :open="sendDrawer.open"
      :title="$t('发送复核')"
      :tone="moduleId"
      icon="ri-send-plane-line"
      size="lg"
      @close="sendDrawer.open = false"
    >
      <!-- 单发：显示这一份；一键发送：列出整批，可勾掉不想带的 -->
      <div v-if="!sendDrawer.batch" class="sd-send-file">
        <i :class="outputIcon(sendDrawer.kind)"></i>
        <span>{{ sendDrawer.outputName }}</span>
        <span v-if="sendDrawer.draft" class="sd-badge tone-muted">{{ $t('草稿水印') }}</span>
        <span v-else class="sd-badge tone-ok">{{ $t('正式件') }}</span>
      </div>
      <div v-else class="sd-send-batch">
        <div class="sd-sub-title">{{ $t('随信附上（{p0} 份）', { p0: sendDrawer.outputIds.length }) }}</div>
        <label v-for="o in sendableOutputs" :key="o.id" class="sd-check">
          <input
            type="checkbox"
            :checked="sendDrawer.outputIds.includes(o.id)"
            @change="toggleBatchOutput(o.id)"
          />
          <i :class="outputIcon(o.kind)"></i>
          <span>{{ o.name }} {{ o.version }}</span>
        </label>
        <p v-if="draftOutputs.length" class="sd-hint">
          {{ $t('{p0} 份仍是草稿，未列出 —— 审批通过后才可发送。', { p0: draftOutputs.length }) }}
        </p>
      </div>
      <p v-if="!isApproved" class="sd-hint sd-warn">
        {{ $t('本案尚未审批，发送会被拦下 —— 请先在审批区批准。') }}
      </p>
      <div class="sd-drawer-field">
        <label>{{ $t('收件人（必填，多个用逗号分隔）') }}</label>
        <input v-model="sendDrawer.to" type="text" placeholder="buyer@example.com" />
      </div>
      <div class="sd-drawer-grid">
        <div class="sd-drawer-field">
          <label>{{ $t('抄送 Cc') }}</label>
          <input v-model="sendDrawer.cc" type="text" placeholder="manager@example.com" />
        </div>
        <div class="sd-drawer-field">
          <label>{{ $t('密送 Bcc') }}</label>
          <input v-model="sendDrawer.bcc" type="text" />
        </div>
      </div>
      <div class="sd-drawer-field">
        <label>{{ $t('主题') }}</label>
        <input v-model="sendDrawer.subject" type="text" />
      </div>
      <div class="sd-drawer-field">
        <label>{{ $t('正文（自动生成，可改；改动写进审计）') }}</label>
        <textarea v-model="sendDrawer.body" rows="10"></textarea>
      </div>
      <label class="sd-check">
        <input v-model="sendDrawer.attachOutput" type="checkbox" />
        {{ sendDrawer.batch ? $t('把上面这些文件作为附件一起发出') : $t('把该文件作为附件一起发出') }}
      </label>
      <p class="sd-hint sd-warn">
        {{ $t('邮件会立刻发到上面这些地址，发出去撤不回来。请先确认收件人。') }}
        <br />
        <!--
          发送前就说清楚**从哪个邮箱出去** —— 事后才发现发件人是官方地址，
          在商务往来里是会出事的误解。没配 SMTP 时顺带指路去配。
        -->
        <template v-if="smtpConfigured">
          {{ $t('发件人：{p0}（你自己的邮箱）', { p0: smtpSenderAddress }) }}
        </template>
        <template v-else>
          {{ $t('你还没配自己的发信邮箱，本次将由 TotalClaw 官方邮箱代发，收件人回信会回到你的账号邮箱；想用自己的邮箱发，去「设置 · 邮件」填 SMTP。') }}
        </template>
      </p>
      <p v-if="sendDrawer.error" class="sd-send-error">
        <i class="ri-error-warning-fill"></i>{{ sendDrawer.error }}
      </p>
      <template #footer>
      <button class="sd-btn ghost" type="button" @click="sendDrawer.open = false">{{ $t('取消') }}</button>
      <button
        class="sd-btn primary"
        type="button"
        :disabled="sendDrawer.busy || !sendDrawer.to.trim() || (sendDrawer.batch && !sendDrawer.outputIds.length)"
        @click="doSend"
      >
        <i :class="sendDrawer.busy ? 'ri-loader-4-line spin' : 'ri-send-plane-line'"></i>
        {{ $t('发送') }}
      </button>
      </template>
    </TModal>

    <!-- 审批理由 -->
    <TModal
      :open="!!reasonAction"
      :title="$t('{p0} · 需填写理由', { p0: reasonAction ? decisionLabel(reasonAction) : '' })"
      :tone="moduleId"
      icon="ri-shield-check-line"
      size="md"
      @close="reasonAction = null"
    >
      <div class="sd-drawer-field">
        <label>{{ $t('理由（必填，写进审计）') }}</label>
        <textarea v-model="reasonText" rows="4"></textarea>
      </div>
      <div v-if="reasonAction === 'reassign'" class="sd-drawer-field">
        <label>{{ $t('转交给') }}</label>
        <input v-model="reassignTo" type="text" :placeholder="$t('新负责人姓名，或填邮箱走邮件审批')" />
        <!-- 填邮箱才走邮件闭环；填人名就只是改负责人（老用法），这里如实说清楚 -->
        <p class="sd-hint">
          {{ reassignIsEmail
            ? $t('会把本单发到该邮箱；对方直接回复「同意」或「拒绝」，系统自动落审批结论。')
            : $t('填人名只改负责人、不发通知。想让对方收到邮件并回复审批，请填他的邮箱。') }}
        </p>
      </div>
      <template #footer>
      <button class="sd-btn ghost" type="button" @click="reasonAction = null">{{ $t('取消') }}</button>
      <button class="sd-btn primary" type="button" :disabled="!reasonText.trim()" @click="confirmReason">{{ $t('确认') }}</button>
      </template>
    </TModal>

    <div v-if="toast" class="sd-toast">{{ toast }}</div>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import { useEditionFeature } from '../../composables/useEditionFeature';
import { humanizeErrorMessage } from '../../utils/humanize';
import { t as i18nT, i18nKey } from '../../i18n';
import SaudiCard from './SaudiCard.vue';
import PageBackButton from '../../components/PageBackButton.vue';
import DocumentPane from './DocumentPane.vue';
import TModal from '../../components/TModal.vue';
import { buildCards, defaultState, DEMO_INTAKE, type ModuleState } from './demoData';
import { moduleById } from './modules';
import { shouldOpenOutputsAfterDecision } from './approvalFlow';
import { clearModuleState, readModuleState, writeModuleState } from './moduleStateStore';
import { computeImpact } from './proofSwitch';
import { computeWorkflowStates, reachedApproval } from './workflowStepState';
import { buildActionTitle } from './actionTitle';
import { useIntakeChannels } from './useIntakeChannels';
import { useWhatsappPairing, WA_PAIR_STAGE_LABEL } from '../../composables/useWhatsappPairing';
import { useDialog } from '../../composables/useDialog';
import { toPlain } from '../../utils/ipcPlain';
import { RULE_VERSION } from './calc';
import { buildStructuredOutput as buildOutputPayload } from './outputPayload';
import type {
  Anchor, CardData, ChangeImpact, ChannelState, Evidence, IntakeChannel,
  IntakeGroup, IntakeItem, SaudiModuleId, WorkflowStep,
} from './types';

const props = defineProps<{ moduleId: SaudiModuleId }>();

const router = useRouter();
const emailConfigAllowed = useEditionFeature('remote_notifications');
const dialog = useDialog();
const { locale } = useI18n();
const isRtl = computed(() => locale.value === 'ar');
const moduleDef = computed(() => moduleById(props.moduleId));

const { channels, loading: channelsLoading, refresh: refreshChannels, pollNow } = useIntakeChannels();

/**
 * 只显示本模块真正会用到的通道，并按 modules.ts 里声明的顺序排。
 * 三个 Demo 的来源本来就不同（邮件 / 网站快照 / 工单 / WhatsApp），四张卡到处摆会让客户
 * 以为每个数字员工都要接四条通道 —— 也和演示脚本对不上。
 */
const moduleChannels = computed(() => {
  const wanted = moduleDef.value.channels;
  const byId = new Map(channels.value.map((c) => [c.channel, c]));
  return wanted
    .map((id) => byId.get(id) ?? { channel: id, state: 'not_configured' as const, detail: i18nKey('正在检测…') })
    .filter(Boolean);
});

const intakeItems = ref<IntakeItem[]>([]);
const groups = ref<IntakeGroup[]>([]);
const activeTaskId = ref('');
const activeCase = ref<any>(null);
const auditEntries = ref<any[]>([]);
const state = ref<ModuleState>(defaultState(props.moduleId));
const cards = ref<CardData[]>([]);
/** 附件抽取结果：有它就用真字段覆盖基线卡片 */
const extraction = ref<any>(null);
const extracting = ref(false);
const unverifiedCount = computed(
  () => (extraction.value?.fields ?? []).filter((f: any) => f.unverified).length,
);
/** 扫描件 / 超页数 / 解析失败这类要如实摆在用户眼前，不能只写进日志。 */
const extractionWarnings = computed<{ fileName: string; warning?: string }[]>(
  () => (extraction.value?.documents ?? []).filter((d: any) => d.warning),
);

const rightTab = ref<'doc' | 'evidence' | 'diff'>('doc');
const activeAnchor = ref<Anchor | null>(null);
const lastImpact = ref<ChangeImpact | null>(null);
const recalculating = ref(false);
const recalculatingCards = ref<string[]>([]);

const proofValues = ref<Record<string, string>>({});
const simulateOpen = ref(false);
const simChannel = ref<IntakeChannel>('email');
const simCustomer = ref('');
const simSubject = ref('');
const simBody = ref('');
const mergeReasonsFor = ref('');
const ticketDetailFor = ref('');
const refreshingTicket = ref(false);
const outputsOpen = ref(false);
// 交付物校验报告（P0-1）。生成被拦时自动弹，也可从输出中心点校验 chip 回看
const validationOpen = ref(false);
const validationReport = ref<any>(null);
const validationSubject = ref('');
const validationBlocking = computed(() =>
  (validationReport.value?.issues ?? []).filter((i: any) => i.severity === 'block'));
const validationWarnings = computed(() =>
  (validationReport.value?.issues ?? []).filter((i: any) => i.severity === 'warn'));

function openValidationReport(report: any, subject: string): void {
  validationReport.value = report;
  validationSubject.value = subject;
  validationOpen.value = true;
}

// ── 交付物大纲（P1-1 大纲先行）─────────────────────────────────────────────
const outlineOpen = ref(false);
const outlineBusy = ref(false);
const outlineConfirmed = ref(false);
const outlineDraft = ref<any>(null);
/** 被大纲挡下的那次生成：确认后直接接着生成，不让用户再点一遍 */
const outlineTarget = ref<{ name: string; kind: string } | null>(null);
const outlineTargetName = computed(() => outlineTarget.value?.name || '');
/**
 * 必讲 / 不讲用多行文本编辑（一行一条）。
 * 做成 tag 输入框更"精致"，但这里要的是能快速粘一整段进去。
 */
const outlineInScopeText = computed({
  get: () => (outlineDraft.value?.inScope ?? []).join('\n'),
  set: (v: string) => { if (outlineDraft.value) outlineDraft.value.inScope = splitLines(v); },
});
const outlineOutScopeText = computed({
  get: () => (outlineDraft.value?.outOfScope ?? []).join('\n'),
  set: (v: string) => { if (outlineDraft.value) outlineDraft.value.outOfScope = splitLines(v); },
});

function splitLines(value: string): string[] {
  return String(value ?? '').split('\n').map((s) => s.trim()).filter(Boolean);
}

function onOutlinePoints(section: any, value: string): void {
  section.points = splitLines(value);
  section.dirty = true;   // 改过的节才需要重生成（增量，不是全文重来）
}

function addOutlineSection(): void {
  outlineDraft.value?.sections.push({
    id: `s${Date.now().toString(36)}`,
    title: '', points: [], evidence: [], dirty: true,
  });
}

/**
 * 从当前卡片装配一份大纲草稿。
 *
 * 标题直接用结论式标题（P1-2），证据来源取该卡的锚点/证据条目 ——
 * 「每节的证据来源」这一条要求，数据本来就在卡上，不装配等于白扔。
 */
function buildOutlineDraft(name: string, kind: string): any {
  const sections = cards.value
    .filter((c) => ['matrix', 'decision', 'pricing', 'kanban', 'bom', 'taskplan', 'gaps', 'report'].includes(c.kind))
    .map((card) => {
      const at = buildActionTitle(card as any);
      const evidence = [
        ...(card.evidences ?? []).map((e) => i18nT(e.title)),
        ...(card.fields ?? []).flatMap((f) => (f.anchors ?? []).map((a) => (
          a.page ? `${a.docName} p.${a.page}` : (a.cell ? `${a.docName}!${a.cell}` : a.docName)
        ))),
      ].filter(Boolean).slice(0, 6);
      return {
        id: card.id,
        title: at.text,
        pending: at.pending,
        points: (card.reportSections ?? []).map((s) => i18nT(s.title)).slice(0, 5),
        evidence,
        dirty: false,
      };
    });
  return {
    caseId: activeCase.value?.id,
    outputName: name,
    kind,
    audience: i18nT('客户决策人与评标委员会'),
    inScope: sections.filter((s) => !s.pending).map((s) => s.title).slice(0, 6),
    outOfScope: [
      i18nT('其他客户的同类案例与报价'),
      i18nT('未经确认的交付承诺与排期'),
    ],
    sections,
    version: 0,
  };
}

/** 打开大纲编辑器：优先读已存的那份，没有才现装配一份草稿。 */
async function openOutline(name: string, kind: string): Promise<void> {
  if (!activeCase.value) return;
  outlineTarget.value = { name, kind };
  outlineBusy.value = true;
  try {
    const res = await caseApi()?.getOutline?.({ caseId: activeCase.value.id, outputName: name });
    outlineConfirmed.value = !!res?.confirmed;
    outlineDraft.value = res?.outline
      ? JSON.parse(JSON.stringify(res.outline))
      : buildOutlineDraft(name, kind);
    outlineOpen.value = true;
  } catch (error) {
    showToast(humanizeErrorMessage(error, i18nT('打开大纲失败')));
  } finally {
    outlineBusy.value = false;
  }
}

async function saveOutline(silent = false): Promise<boolean> {
  if (!activeCase.value || !outlineDraft.value) return false;
  outlineBusy.value = true;
  try {
    const res = await caseApi()?.saveOutline?.(toPlain({
      caseId: activeCase.value.id,
      outputName: outlineTarget.value?.name,
      kind: outlineTarget.value?.kind,
      audience: outlineDraft.value.audience,
      inScope: outlineDraft.value.inScope,
      outOfScope: outlineDraft.value.outOfScope,
      sections: outlineDraft.value.sections,
    }));
    if (res?.ok) {
      outlineDraft.value = JSON.parse(JSON.stringify(res.outline));
      outlineConfirmed.value = !!res.confirmed;
      if (!silent) showToast(i18nT('大纲已保存（v{p0}）', { p0: res.outline.version }));
      return true;
    }
    showToast(res?.message || i18nT('大纲保存失败'));
    return false;
  } catch (error) {
    showToast(humanizeErrorMessage(error, i18nT('大纲保存失败')));
    return false;
  } finally {
    outlineBusy.value = false;
  }
}

async function saveOutlineAsTemplate(): Promise<void> {
  if (!activeCase.value || !outlineTarget.value) return;
  const name = await dialog.prompt(i18nT('模板名称'), i18nT('例：沙特投标建议书标准结构'));
  if (!name) return;
  if (!(await saveOutline(true))) return;
  try {
    const res = await caseApi()?.saveOutlineTemplate?.({
      name, caseId: activeCase.value.id, outputName: outlineTarget.value.name,
    });
    showToast(res?.ok ? i18nT('已存为模板：{p0}', { p0: name }) : (res?.message || i18nT('存模板失败')));
  } catch (error) {
    showToast(humanizeErrorMessage(error, i18nT('存模板失败')));
  }
}

/** 确认 + 直接接着生成 —— 让用户再回去点一次「生成文件」是纯粹的多余步骤。 */
async function confirmOutlineAndGenerate(): Promise<void> {
  if (!activeCase.value || !outlineTarget.value) return;
  if (!(await saveOutline(true))) return;
  outlineBusy.value = true;
  try {
    const res = await caseApi()?.confirmOutline?.({
      caseId: activeCase.value.id, outputName: outlineTarget.value.name,
    });
    if (!res?.ok) { showToast(res?.message || i18nT('确认大纲失败')); return; }
    outlineConfirmed.value = true;
    outlineOpen.value = false;
    await generateOutput(outlineTarget.value.name, outlineTarget.value.kind);
  } catch (error) {
    showToast(humanizeErrorMessage(error, i18nT('确认大纲失败')));
  } finally {
    outlineBusy.value = false;
  }
}

const auditOpen = ref(false);
const sendReceipt = ref('');
const reasonAction = ref<'return' | 'reject' | 'reassign' | null>(null);
const reasonText = ref('');
const reassignTo = ref('');
/** 填的是邮箱才走邮件审批闭环（转交发信 + 回信自动落结论） */
const reassignIsEmail = computed(() => /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(reassignTo.value.trim()));
const seeding = ref(false);
const assigning = ref(false);
const pollingChannel = ref('');
const toast = ref('');

// ── 数据包：产品目录 / 成本规则 / 历史报价 ───────────────────────────────────
const dataPack = ref<any>(null);
const dataPackDraft = ref<any>(null);
const dataPackOpen = ref(false);
const packBusy = ref(false);
const packTab = ref<'rules' | 'products' | 'benchmarks' | 'weights'>('rules');
/** 权重合计：不强制等于 100（客户口径不一），但不等于 100 要显式提示。 */
const weightTotal = computed<number>(
  () => (dataPackDraft.value?.decisionWeights ?? []).reduce((sum: number, w: any) => sum + (Number(w.weight) || 0), 0),
);
/** 规则表单项。费率类用小数（0.18 = 18%），单价类用整数。 */
const RULE_FIELDS = [
  { key: 'targetMargin', label: i18nT('目标毛利率'), step: '0.01', suffix: i18nT('（0.18 = 18%）') },
  { key: 'internationalLogisticsRate', label: i18nT('国际物流费率'), step: '0.001', suffix: i18nT('（占设备额）') },
  { key: 'localLogisticsBaseRate', label: i18nT('本地物流基准费率'), step: '10', suffix: 'SAR / m³' },
  { key: 'installUnitCost', label: i18nT('安装调试单价'), step: '50', suffix: i18nT('SAR / 台') },
  { key: 'warrantyRatePerYear', label: i18nT('维保年费率'), step: '0.001', suffix: '' },
  { key: 'riskRate', label: i18nT('风险准备金费率'), step: '0.001', suffix: '' },
  { key: 'round', label: i18nT('金额取整位'), step: '10', suffix: i18nT('（100 = 百位）') },
] as const;

function ruleValue(key: string): number {
  return Number(dataPackDraft.value?.rules?.[key] ?? 0);
}
function setRuleValue(key: string, raw: string): void {
  if (!dataPackDraft.value) return;
  const value = Number(raw);
  if (Number.isFinite(value)) dataPackDraft.value.rules[key] = value;
}

async function loadDataPack(): Promise<void> {
  try {
    const res = await (window as any).electronAPI?.dataPack?.get?.();
    dataPack.value = res?.pack ?? null;
  } catch {
    dataPack.value = null;
  }
}

function openDataPack(): void {
  // 编辑的是副本：取消就丢弃，不会把半改的规则漏进报价
  dataPackDraft.value = dataPack.value ? JSON.parse(JSON.stringify(dataPack.value)) : null;
  dataPackOpen.value = true;
  if (!dataPackDraft.value) {
    void loadDataPack().then(() => {
      dataPackDraft.value = dataPack.value ? JSON.parse(JSON.stringify(dataPack.value)) : null;
    });
  }
}

function addProduct(): void {
  dataPackDraft.value?.products.unshift({
    sku: '', description: '', unitCost: 0, unit: i18nT('台'), leadTime: '', stock: i18nT('充足'), stockShort: false,
  });
}

/** 从 Excel/CSV 导入产品目录：渲染层解成二维网格，认表头交给主进程。 */
async function importProductsFile(): Promise<void> {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.xlsx,.xls,.csv';
  input.onchange = async () => {
    const file = input.files?.[0];
    if (!file) return;
    packBusy.value = true;
    try {
      const XLSX: any = await import('xlsx');
      const buffer = new Uint8Array(await file.arrayBuffer());
      const workbook = XLSX.read(buffer, { type: 'array' });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const grid: string[][] = XLSX.utils
        .sheet_to_json(sheet, { header: 1, raw: false, defval: '' })
        .map((row: any[]) => row.map((cell) => String(cell ?? '')));
      const res = await (window as any).electronAPI?.dataPack?.importProducts?.(grid);
      if (res?.ok && res.products?.length) {
        dataPackDraft.value.products = res.products;
        showToast(i18nT('已导入 {p0} 条产品，确认后点保存', { p0: res.products.length }));
      } else {
        showToast(res?.message || i18nT('导入失败'));
      }
    } catch (error) {
      showToast(humanizeErrorMessage(error, i18nT('读取 Excel 失败')));
    } finally {
      packBusy.value = false;
    }
  };
  input.click();
}

async function saveDataPack(): Promise<void> {
  if (!dataPackDraft.value) return;
  packBusy.value = true;
  try {
    const res = await (window as any).electronAPI?.dataPack?.save?.({
      pack: dataPackDraft.value,
      actor: activeCase.value?.owner,
      caseId: activeCase.value?.id,
    });
    if (!res?.ok) { showToast(res?.message || i18nT('保存失败')); return; }
    dataPack.value = res.pack;
    dataPackOpen.value = false;
    rebuildCards();
    if (activeCase.value) await loadCase(activeCase.value.id);
    showToast(res.changed
      ? i18nT('已保存，规则版本 {p0}，报价按新规则重算', { p0: res.pack.version })
      : i18nT('没有实质改动，版本号未变'));
  } catch (error) {
    showToast(humanizeErrorMessage(error, i18nT('保存失败')));
  } finally {
    packBusy.value = false;
  }
}

async function resetDataPack(): Promise<void> {
  packBusy.value = true;
  try {
    const res = await (window as any).electronAPI?.dataPack?.reset?.(activeCase.value?.owner);
    if (res?.pack) {
      dataPack.value = res.pack;
      dataPackDraft.value = JSON.parse(JSON.stringify(res.pack));
      rebuildCards();
      showToast(i18nT('已恢复出厂数据包（版本 {p0}）', { p0: res.pack.version }));
    }
  } catch (error) {
    showToast(humanizeErrorMessage(error, i18nT('恢复失败')));
  } finally {
    packBusy.value = false;
  }
}

/**
 * 用户自己的发信邮箱配好了吗（地址 + 密码 + SMTP 服务器三件齐）。
 * 发送复核那一屏据此告诉用户「这封信从谁的邮箱出去」——
 * 事后才发现发件人是官方地址，在商务往来里是会出事的误解。
 */
const smtpConfigured = ref(false);
const smtpSenderAddress = ref('');

async function refreshSmtpState(): Promise<void> {
  if (emailConfigAllowed.value !== true) {
    smtpConfigured.value = false;
    smtpSenderAddress.value = '';
    return;
  }
  try {
    const res = await (window as any).electronAPI?.qiyeApi?.emailGetConfig?.();
    const cfg = res?.config ?? res;
    smtpConfigured.value = !!(cfg?.address && cfg?.passwordSet && cfg?.smtpHost);
    smtpSenderAddress.value = cfg?.address || '';
  } catch {
    // 读不到就按「没配」说话：宁可多提示一次代发，也不要让用户以为用的是自己的邮箱
    smtpConfigured.value = false;
    smtpSenderAddress.value = '';
  }
}

// 邮箱收件配置：放在模块页里，填完立刻能自动巡检邮件，不必先跳设置页
const emailConfigOpen = ref(false);
const emailBusy = ref(false);
const emailForm = ref({
  preset: '', address: '', password: '', passwordSet: false,
  imapHost: '', imapPort: '993', smtpHost: '', smtpPort: '465',
});
/** 常用邮箱服务器预设：省掉客户去翻服务商文档（沙特现场没人愿意查这个）。 */
const EMAIL_PRESETS = [
  { key: 'exmail', label: i18nT('腾讯企业邮'), imapHost: 'imap.exmail.qq.com', imapPort: '993', smtpHost: 'smtp.exmail.qq.com', smtpPort: '465' },
  { key: 'qq', label: i18nT('QQ 邮箱'), imapHost: 'imap.qq.com', imapPort: '993', smtpHost: 'smtp.qq.com', smtpPort: '465' },
  { key: '163', label: i18nT('163 邮箱'), imapHost: 'imap.163.com', imapPort: '993', smtpHost: 'smtp.163.com', smtpPort: '465' },
  { key: 'gmail', label: 'Gmail', imapHost: 'imap.gmail.com', imapPort: '993', smtpHost: 'smtp.gmail.com', smtpPort: '465' },
  { key: 'outlook', label: 'Outlook / M365', imapHost: 'outlook.office365.com', imapPort: '993', smtpHost: 'smtp.office365.com', smtpPort: '587' },
];

// ── 外部标讯来源（websnapshot 通道，招投标模块）────────────────────────────
const tenderSourcesOpen = ref(false);
const tenderBusy = ref(false);
const tenderSources = ref<any[]>([]);
const tenderTestResult = ref<any>(null);
const TENDER_FIELD_KEYS = ['title', 'link', 'buyer', 'deadline', 'summary'] as const;
const TENDER_FIELD_LABELS: Record<string, string> = {
  title: i18nT('公告标题'), link: i18nT('详情链接'), buyer: i18nT('招标人'),
  deadline: i18nT('截止时间'), summary: i18nT('摘要'),
};
/**
 * 沙特公开招标平台预置。
 *
 * ⚠ 选择器是**起手值不是保证**：各站 DOM 结构不同且会改版，填完必须点「试抓 5 条」
 * 看回显再调。合规上这几个都是公开可访问的列表页 —— 我们只抓快照，不登录、不绕验证码；
 * Etimad 的完整功能需要账号，这里用的是它对访客开放的公开列表页。
 */
const TENDER_PRESETS = [
  {
    // ✅ 实测可用（2026-08-13 真机验证）：命中 5 行，title/link/buyer 都取到真值。
    // 选择器是从它的真实 DOM 里逐个探出来的，不是猜的：
    //   卡片 div.tender-card；标题与详情链接都在 a[href*=DetailsForVisitor]；
    //   采购单位在 p；列表页只有「发布日期」(span)，**截止时间要进详情页**，所以 deadline 留空。
    name: i18nKey('沙特政府采购平台 Etimad（公开列表）'),
    listUrl: 'https://tenders.etimad.sa/Tender/AllTendersForVisitor',
    scope: i18nKey('沙特政府各部门公开招标公告'),
    note: i18nKey('已实测可用；公告为阿拉伯语原文'),
    rowSelector: 'div.tender-card',
    fieldSelectors: {
      title: 'a[href*=DetailsForVisitor]',
      link: 'a[href*=DetailsForVisitor]',
      buyer: 'p',
      deadline: '',
      summary: '',
    },
  },
];


/** 点预置 → 填进表单（不直接保存，让人先试抓校准再存） */
function applyTenderPreset(preset: typeof TENDER_PRESETS[number]): void {
  tenderForm.value = {
    ...emptyTenderForm(),
    name: i18nT(preset.name),
    listUrl: preset.listUrl,
    scope: i18nT(preset.scope),
    rowSelector: preset.rowSelector,
    fieldSelectors: { ...preset.fieldSelectors },
  };
  tenderTestResult.value = null;
  showToast(i18nT('已填入「{p0}」，建议先点「试抓 5 条」校准选择器再保存', { p0: i18nT(preset.name) }));
}

function resetTenderForm(): void {
  tenderForm.value = emptyTenderForm();
  tenderTestResult.value = null;
}

function emptyTenderForm(): any {
  return { id: '', enabled: true, name: '', listUrl: '', scope: '', rowSelector: '', fieldSelectors: {}, waitMs: 1500 };
}
const tenderForm = ref<any>(emptyTenderForm());

async function openTenderSources(): Promise<void> {
  tenderSourcesOpen.value = true;
  await loadTenderSources();
}
async function loadTenderSources(): Promise<void> {
  try {
    const res: any = await intakeApi()?.tenderSources?.();
    tenderSources.value = res?.sources ?? [];
  } catch { /* 拿不到就当没登记，界面照常能新增 */ }
}
function editTenderSource(source: any): void {
  tenderForm.value = { ...source, fieldSelectors: { ...(source.fieldSelectors || {}) } };
  tenderTestResult.value = null;
}
async function removeTenderSource(source: any): Promise<void> {
  const ok = await dialog.confirm({
    title: i18nT('删除来源'),
    message: i18nT('删除后不再从「{p0}」抓取新公告；已经进过收件箱的条目不受影响。', { p0: source.name || source.listUrl }),
    danger: true,
  });
  if (!ok) return;
  try {
    await intakeApi()?.deleteTenderSource?.(source.id);
    await loadTenderSources();
    await refreshChannels();
  } catch (error) {
    showToast(humanizeErrorMessage(error, i18nT('删除失败')));
  }
}
async function testTenderSource(): Promise<void> {
  tenderBusy.value = true;
  tenderTestResult.value = null;
  try {
    tenderTestResult.value = await intakeApi()?.testTenderSource?.({ source: toPlain(tenderForm.value), limit: 5 });
  } catch (error) {
    // 给用户的是干净文案，但原始错误必须落控制台：humanize 会把英文原文换成
    // 「操作失败，请稍后重试」，吞掉之后排障无从下手（这条坑刚踩过一次）。
    console.error('[saudi] 试抓外部标讯失败', { source: tenderForm.value }, error);
    tenderTestResult.value = { rows: [], describe: tenderForm.value.listUrl, message: humanizeErrorMessage(error, i18nT('试抓失败')) };
  } finally {
    tenderBusy.value = false;
  }
}
async function saveTenderSource(): Promise<void> {
  tenderBusy.value = true;
  try {
    await intakeApi()?.saveTenderSource?.(toPlain({ ...tenderForm.value, enabled: true }));
    await loadTenderSources();
    await refreshChannels();
    tenderForm.value = emptyTenderForm();
    tenderTestResult.value = null;
    // 清空表单是故意的：来源可以加任意多个，存完接着填下一个
    showToast(i18nT('来源已登记并启用（共 {p0} 个），下一轮会抓一次快照', { p0: tenderSources.value.length }));
  } catch (error) {
    showToast(humanizeErrorMessage(error, i18nT('保存失败')));
  } finally {
    tenderBusy.value = false;
  }
}

const ticketConfigOpen = ref(false);
const ticketBusy = ref(false);
const ticketTestResult = ref<any>(null);
const TICKET_FIELD_KEYS = ['ticketNo', 'customer', 'contact', 'email', 'phone', 'subject', 'body', 'category', 'deadline', 'status', 'createdAt', 'updatedAt'] as const;
const TICKET_FIELD_LABELS: Record<string, string> = {
  ticketNo: i18nT('工单号'), customer: i18nT('公司 / 客户'), contact: i18nT('联系人'), email: i18nT('邮箱'), phone: i18nT('电话'),
  subject: i18nT('主题'), body: i18nT('需求描述'), category: i18nT('需求类型'), deadline: i18nT('期望完成'),
  status: i18nT('状态'), createdAt: i18nT('创建时间'), updatedAt: i18nT('更新时间'),
};
const ticketForm = ref<any>({
  id: '', enabled: true, mode: 'database',
  sourceName: '', table: '', pk: 'id', cursorColumn: 'updated_at',
  pollSeconds: 60, where: '', columnMap: {}, categoryMap: {
    询价: 'rfq-quote', 报价: 'rfq-quote', 招标: 'bid-decision', 投标: 'bid-decision',
    咨询: 'advisory-report', 方案: 'advisory-report',
  },
  // web 模式的子对象一开始就建好，模板里 v-model 才不会往 undefined 上写
  web: {
    loginUrl: '', listUrl: '', username: '', password: '', passwordSaved: false,
    usernameSelector: '', passwordSelector: '', submitSelector: '',
    rowSelector: '', fieldSelectors: {}, waitMs: 1500,
  },
});

const stepRefs = ref<Record<number, HTMLElement | null>>({});
const cardRefs = ref<Record<string, any>>({});

const activeTask = computed(() => intakeItems.value.find((i) => i.id === activeTaskId.value) || null);
const ticketDetail = computed(() => intakeItems.value.find((i) => i.id === ticketDetailFor.value) || null);
const allEvidence = computed<Evidence[]>(() => cards.value.flatMap((c) => c.evidences ?? []));
/**
 * 右栏文档可选的附件 = **本任务全部来源**的附件，不只是当前选中那一条。
 *
 * 合并的意义就是「三条渠道是同一件事」：客户邮件发的规格书、表单里传的目标清单，
 * 建案之后都得能在工作台里翻。原来只取 activeTask 一条，从 WhatsApp 那条进工作台
 * 就会看到「该任务暂无附件」，而附件明明在同组的邮件上。
 * 同一份文件（同 sha256）在多条来源上重复出现时只列一次。
 */
const activeAttachments = computed(() => {
  const task = activeTask.value;
  if (!task) return [] as any[];
  const group = groups.value.find((g) => g.itemIds.includes(task.id));
  const sources = group
    ? intakeItems.value.filter((i) => group.itemIds.includes(i.id))
    : [task];
  const seen = new Set<string>();
  const out: any[] = [];
  for (const item of sources) {
    for (const a of item.attachments ?? []) {
      const key = a.sha256 || `${item.id}:${a.relPath}`;
      if (seen.has(key)) continue;
      seen.add(key);
      // 带上宿主条目 id：readAttachment 是按 itemId + relPath 取的，不记住就读不到别条的附件
      out.push({ ...a, itemId: item.id });
    }
  }
  return out;
});
const isPendingApproval = computed(() => activeCase.value?.status === 'pending_approval');
const isApproved = computed(() => ['approved', 'approved_with_edits', 'delivered'].includes(activeCase.value?.status));

/**
 * 六步闭环状态。推导规则抽到 workflowStepState.ts（可单测）——
 * 它误导过用户两次：「已批准但没生成文件」时建议一直转圈、批准后交付也一直转
 * （转圈 = 系统正在做，而那两处其实都在等人操作）。
 */
const workflowSteps = computed<WorkflowStep[]>(() => {
  const steps = moduleDef.value.workflowSteps.map((s) => ({ ...s }));
  if (!activeCase.value) return steps;
  const states = computeWorkflowStates({
    hasCase: true,
    status: activeCase.value.status,
    outputCount: activeCase.value.outputs?.length ?? 0,
    hasImpact: !!lastImpact.value,
  });
  states.forEach((st, i) => { if (steps[i]) steps[i].status = st; });
  return steps;
});

function intakeApi(): any { return (window as any).electronAPI?.intake; }
function caseApi(): any { return (window as any).electronAPI?.cases; }

// ── 加载 ─────────────────────────────────────────────────────────────────────

async function loadIntake(): Promise<void> {
  try {
    const res = await intakeApi()?.list?.({ module: props.moduleId });
    if (res?.ok) {
      intakeItems.value = (res.items || []) as IntakeItem[];
      groups.value = (res.groups || []) as IntakeGroup[];
      if (activeTaskId.value && !intakeItems.value.some((i) => i.id === activeTaskId.value)) {
        activeTaskId.value = '';
        activeCase.value = null;
      }
      // 编号在案件库里，跟着收件箱一起刷新
      await loadCaseIndex();
      // 自动建档模式：新进来的条目直接立案（silent，不弹 toast 打断）
      if (filingMode.value === 'auto' && !batchFiling.value && intakeItems.value.some((i) => !i.caseId)) {
        void fileAllPending(true);
      }
    }
  } catch (error) {
    showToast(humanizeErrorMessage(error, i18nT('收件箱读取失败')));
  }
}

async function loadCase(caseId: string): Promise<void> {
  try {
    const res = await caseApi()?.get?.(caseId);
    activeCase.value = res?.case ?? null;
    // 复核标注按案件分开存，切案件必须跟着换，否则会把上一单的标记显示在这一单上
    loadCardReview(caseId);
    // 现场变更（交付地点 / 保修 / BOM 选型 / 门槛改判）同理：它属于**被改的那一单**。
    // 原先 state 是整个工作台一份，在 A 单点完「模拟变更」再切到 B 单，
    // B 单的卡片会显示 A 单的塔布克 / 3 年 —— 而且和 B 单自己的审计对不上。
    loadModuleState(caseId);
    // 卡片要跟着这一单重建 —— 输出物卡的「已生成 / 草稿 or 正式件」「审批态角标」
    // 都是按 activeCase 回填的（syncOutputsCard）。不重建的话：刚生成完文件、
    // 或刚批准完，卡上还是旧样子，用户看到的就是「明明生成了卡上却说没有」。
    rebuildCards();
    await Promise.all([loadAudit(), loadMailApproval(caseId)]);
  } catch (error) {
    showToast(humanizeErrorMessage(error, i18nT('案件读取失败')));
  }
}

/** 这一单是否在等邮件回复审批（null = 没有） */
const mailApproval = ref<{ assignee: string; caseNo: string; sentAt: string } | null>(null);
const mailBusy = ref(false);

async function loadMailApproval(caseId: string): Promise<void> {
  try {
    const res = await caseApi()?.mailApproval?.get?.({ caseId });
    mailApproval.value = res?.pending ?? null;
  } catch { mailApproval.value = null; }
}

async function resendApprovalMail(): Promise<void> {
  const id = activeCase.value?.id;
  if (!id) return;
  mailBusy.value = true;
  try {
    const res = await caseApi()?.mailApproval?.resend?.({ caseId: id });
    showToast(res?.message || (res?.ok ? i18nT('已重新发送') : i18nT('重发失败')));
    await loadMailApproval(id);
  } finally { mailBusy.value = false; }
}

async function cancelApprovalMail(): Promise<void> {
  const id = activeCase.value?.id;
  if (!id) return;
  mailBusy.value = true;
  try {
    const res = await caseApi()?.mailApproval?.cancel?.({ caseId: id });
    showToast(res?.message || i18nT('已撤销等待'));
    await loadMailApproval(id);
  } finally { mailBusy.value = false; }
}

async function loadAudit(): Promise<void> {
  if (!activeCase.value) { auditEntries.value = []; return; }
  try {
    const res = await caseApi()?.audit?.({ caseId: activeCase.value.id });
    auditEntries.value = res?.entries || [];
  } catch { auditEntries.value = []; }
}

/**
 * 卡片 = 基线数据 ∪ 抽取结果。
 * 抽出来的字段**覆盖**同 key 的基线值，并带上经代码验证的锚点；抽不到的字段保持基线，
 * 这样演示不会因为某个字段没抽到就开天窗，同时真抽到的部分能点回原文。
 */
function rebuildCards(): void {
  const built = buildCards(props.moduleId, state.value, dataPack.value || undefined);
  const result = extraction.value;
  if (result && !result.error && Array.isArray(result.fields) && result.fields.length) {
    const byKey = new Map<string, any>(result.fields.map((f: any) => [f.key, f]));
    for (const card of built) {
      if (card.kind === 'fields' && card.fields) {
        card.fields = card.fields.map((field) => {
          const hit = byKey.get(field.key);
          if (!hit) return field;
          return {
            ...field,
            value: String(hit.value),
            confidence: Number(hit.confidence) || field.confidence,
            anchors: (hit.anchors ?? []).map((a: any) => ({
              docId: a.docName, docName: a.docName, type: a.type,
              page: a.page, cell: a.cell, bbox: a.bbox, keyword: a.keyword,
            })),
            // 未能回溯原文的字段标出来，别让它和有据可查的字段长一个样
            label: hit.unverified ? i18nT('{p0}（未回溯）', { p0: field.label }) : field.label,
          };
        });
      }
      // BOM 卡：从 PDF/Excel 几何还原出来的 BOQ 直接顶掉基线行——
      // 单价优先用数据包里的（客户的真实采购价），文档里的价格只作兜底。
      if (card.kind === 'bom' && Array.isArray(result.boq) && result.boq.length) {
        const priceBySku = new Map<string, any>(
          (dataPack.value?.products ?? []).map((p: any) => [p.sku, p]),
        );
        const rows = result.boq.map((line: any) => {
          const known = priceBySku.get(line.sku);
          return {
            sku: line.sku,
            description: line.description,
            qty: line.qty,
            unit: line.unit,
            unitCost: known?.unitCost ?? line.unitCost ?? 0,
            leadTime: known?.leadTime ?? '—',
            stock: known?.stock ?? i18nT('未在产品目录中'),
            stockShort: known?.stockShort ?? !known,
          };
        });
        card.bomPrimary = rows;
        card.bomAlternate = rows;
        card.badge = i18nT('来自原文 BOQ · {p0} 行', { p0: rows.length });
        card.badgeTone = 'ok';
      }
      // 信息缺口卡：模型抽出的缺口与澄清问题优先（它读的是这份真文档）
      if (card.id === 'gap' && Array.isArray(result.gaps) && result.gaps.length) {
        card.gaps = result.gaps;
        card.badge = i18nT('{p0} 项缺失', { p0: result.gaps.length });
        if (Array.isArray(result.questions) && result.questions.length) card.questions = result.questions;
      }
    }
  }
  syncOutputsCard(built);
  cards.value = built;
}

/**
 * 把「输出物」卡片和**案件里真实存在的文件**对齐。
 *
 * 这张卡原来整张是静态演示数据：每行恒定显示「v1 · 草稿水印」+「生成文件」，
 * 卡片角标恒定写「未审批 · 带草稿水印」。于是出现用户实拍的这一幕 ——
 * 案件已批准、卡上写着「已采纳 / 草稿水印 / v1」，看着像文件早就有了，
 * 打开输出中心却是「还没有生成任何文件」，一键发送也因此不出现。
 * 用户的结论是「这是个很大的 bug」，而其实是这张卡在说谎：它描述的是**计划**，
 * 长得却像**结果**。
 *
 * 现在逐行按真实状态显示：没生成过 → 未生成；生成过 → 已生成 vN（草稿 / 正式件）。
 * 角标跟审批态走，脚注也跟着说真话（审批后是真发，不是模拟）。
 */
function syncOutputsCard(built: CardData[]): void {
  const card = built.find((c) => c.kind === 'outputs');
  if (!card?.outputs?.length) return;

  const generated = activeCase.value?.outputs ?? [];
  /** 生成时文件名去掉了扩展名（见 generateOutput），所以按去扩展名后的名字对齐 */
  const baseName = (n: string) => String(n || '').replace(/\.[a-z0-9]+$/i, '');
  /**
   * 必须**同时比 kind**：咨询报告模块里「咨询报告_七段.docx」和「咨询报告_七段.pdf」
   * 去掉扩展名后是同一个名字，只按名字对齐会把生成过 docx 说成 pdf 也生成了
   * （自测发现：生成一份之后另一行也跟着变成「已生成」）。
   */
  const latestOf = (name: string, kind: string) => generated.find(
    (o: any) => baseName(o.name) === baseName(name) && o.kind === kind,
  );

  card.outputs = card.outputs.map((o) => {
    const hit: any = latestOf(o.name, o.kind);
    if (!hit) return { ...o, version: '', draft: false, generated: false };
    return {
      ...o,
      version: hit.version || 'v1',
      // draft 直接用案件里那份的真实标记（主进程按「审批没审批」决定）
      draft: !!hit.draft,
      generated: true,
    };
  });

  const anyGenerated = card.outputs.some((o: any) => o.generated);
  if (isApproved.value) {
    card.badge = anyGenerated
      ? i18nT('已审批 · 正式件')
      : i18nT('已审批 · 生成即正式件');
    card.badgeTone = 'ok';
  } else {
    card.badge = i18nT('未审批 · 生成的文件带草稿水印');
    card.badgeTone = 'muted';
  }
}

/** 跑一次附件抽取（force=true 忽略缓存重跑）。 */
async function runExtraction(force = false): Promise<void> {
  if (!activeTask.value) return;
  if (!activeAttachments.value.length) {
    showToast(i18nT('这条收件没有附件，无法抽取字段'));
    return;
  }
  extracting.value = true;
  try {
    const res = await intakeApi()?.extract?.({
      itemId: activeTask.value.id,
      module: props.moduleId,
      force,
    });
    extraction.value = res?.extraction ?? null;
    rebuildCards();
    if (res?.ok) {
      showToast(i18nT('已抽出 {p0} 个字段{p1}', {
        p0: res.extraction?.fields?.length ?? 0,
        p1: unverifiedCount.value ? i18nT('，其中 {p0} 项未能回溯原文', { p0: unverifiedCount.value }) : '',
      }));
    } else {
      showToast(res?.message || i18nT('抽取未成功，卡片保持基线数据'));
    }
  } catch (error) {
    showToast(humanizeErrorMessage(error, i18nT('抽取失败')));
  } finally {
    extracting.value = false;
  }
}

/** 进任务时先看有没有缓存好的抽取结果，有就直接用（不重复烧模型）。 */
async function loadExtraction(itemId: string): Promise<void> {
  try {
    const res = await intakeApi()?.getExtraction?.(itemId);
    extraction.value = res?.extraction ?? null;
  } catch {
    extraction.value = null;
  }
  rebuildCards();
}

function resetProofValues(): void {
  const next: Record<string, string> = {};
  for (const ctrl of moduleDef.value.proofSwitch.controls) next[ctrl.key] = ctrl.defaultValue ?? '';
  proofValues.value = next;
}

function resetWorkspace(): void {
  // 连持久化一起清：否则点了「重置演示」，切走再切回来，上一轮的现场变更又活了
  clearModuleState(window.localStorage, props.moduleId, activeCase.value?.id ?? '');
  state.value = defaultState(props.moduleId);
  rebuildCards();
  lastImpact.value = null;
  activeAnchor.value = null;
  rightTab.value = 'doc';
  resetProofValues();
  void loadIntake();
  void refreshChannels();
  showToast(i18nT('工作台已复位（收件箱与案件库数据保留）'));
}

let unsubscribe: (() => void) | null = null;

onMounted(async () => {
  resetProofValues();
  rebuildCards();
  await Promise.all([loadIntake(), refreshChannels(), loadDataPack(), loadDeliveryDirs(), loadFilingMode()]);
  rebuildCards();
  await loadTicketSource();
  unsubscribe = intakeApi()?.onEvent?.(() => {
    void loadIntake();
    if (activeCase.value) void loadCase(activeCase.value.id);
  }) ?? null;
});

onUnmounted(() => { unsubscribe?.(); });

watch(() => props.moduleId, async () => {
  activeTaskId.value = '';
  activeCase.value = null;
  extraction.value = null;
  state.value = defaultState(props.moduleId);
  rebuildCards();
  resetProofValues();
  await Promise.all([loadIntake(), refreshChannels()]);
});

// ── 步骤态（UX 硬规则一：每步独立状态，失败落到具体那一步）──────────────────
function stepState(index: number): 'done' | 'active' | 'todo' | 'failed' {
  if (index === 0) {
    if (channels.value.some((c) => c.state === 'error')) return 'failed';
    return channels.value.some((c) => c.state === 'ready' && c.channel !== 'upload') ? 'done' : 'active';
  }
  if (index === 1) return intakeItems.value.length ? 'done' : 'active';
  if (index === 2) return activeCase.value ? 'done' : 'todo';
  if (index === 3) {
    if (!activeCase.value) return 'todo';
    // 与 workflowSteps 同一口径（reachedApproval）：进了审批环节说明建议已交付，不该继续转圈
    if (reachedApproval(activeCase.value.status)) return 'done';
    return activeCase.value.outputs?.length || lastImpact.value ? 'done' : 'active';
  }
  if (!activeCase.value) return 'todo';
  if (activeCase.value.status === 'rejected' || activeCase.value.status === 'returned') return 'failed';
  if (activeCase.value.status === 'delivered') return 'done';
  return isPendingApproval.value || isApproved.value ? 'active' : 'todo';
}
function stepFailReason(index: number): string {
  if (index === 0) {
    const bad = channels.value.find((c) => c.state === 'error');
    return bad ? `${channelLabel(bad.channel)}：${bad.detail}` : '';
  }
  if (index === 4 && (activeCase.value?.status === 'returned' || activeCase.value?.status === 'rejected')) {
    return activeCase.value?.decision?.reason || '';
  }
  return '';
}
function stepClass(index: number): string { return `step-${stepState(index)}`; }
function setStepRef(index: number) {
  return (el: any) => { stepRefs.value[index] = (el as HTMLElement) ?? null; };
}
function setCardRef(cardId: string) {
  return (el: any) => { cardRefs.value[cardId] = el; };
}
function scrollToStep(index: number): void {
  stepRefs.value[index]?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}
/** 步骤态的人话标签（stateLabel 是通道态的，别混用） */
function stepStateLabel(index: number): string {
  return STEP_STATE_LABEL[stepState(index)];
}
const STEP_STATE_LABEL: Record<ReturnType<typeof stepState>, string> = {
  todo: i18nT('待做'), active: i18nT('进行中'), done: i18nT('完成'), failed: i18nT('失败'),
};
/**
 * 第 3 / 4 步各自渲染哪些卡：解析确认 = 原始信息 + 缺口（各模块 id 见 demoData），
 * 其余（匹配 / 报价 / 方案 / 检索…）归第 4 步，输出物卡单独归第 5 步。
 */
const STEP3_CARD_IDS: Record<SaudiModuleId, string[]> = {
  'rfq-quote': ['request', 'gap'],
  'bid-decision': ['tender', 'version', 'gate'],
  'advisory-report': ['request', 'merge', 'gap'],
};
function cardsForStep(step: 2 | 3): CardData[] {
  const s3 = STEP3_CARD_IDS[props.moduleId] ?? [];
  return cards.value.filter((c) => c.kind !== 'outputs' && (step === 2 ? s3.includes(c.id) : !s3.includes(c.id)));
}
const outputCards = computed(() => cards.value.filter((c) => c.kind === 'outputs'));
const cardTitle = (id: string): string => cards.value.find((c) => c.id === id)?.title ?? id;
function showDiff(): void { rightTab.value = 'diff'; scrollToStep(2); }
/** 进度条口径：任何一步有后台在跑就算「进行中」（真实 loading 标志，不是定时器） */
const anyRunning = computed(() => channelsLoading.value || seeding.value || clearingDemo.value || uploading.value
  || extracting.value || mailBusy.value || recalculatingCards.value.length > 0);
const doneCount = computed(() => moduleDef.value.guideSteps.filter((_, i) => stepState(i) === 'done').length);
const currentStep = computed(() => {
  const total = moduleDef.value.guideSteps.length;
  const i = moduleDef.value.guideSteps.findIndex((_, k) => stepState(k) !== 'done');
  return i < 0 ? total - 1 : i;
});
const fillPct = computed(() => {
  const total = moduleDef.value.guideSteps.length || 1;
  return Math.min(100, (doneCount.value / total) * 100 + (anyRunning.value ? 10 : 0));
});
function scrollToCard(cardId: string): void {
  const comp = cardRefs.value[cardId];
  const el: HTMLElement | undefined = comp?.$el ?? comp;
  el?.scrollIntoView?.({ behavior: 'smooth', block: 'center' });
}

// ── 收件箱操作 ───────────────────────────────────────────────────────────────

function itemsOf(group: IntakeGroup): IntakeItem[] {
  return intakeItems.value.filter((i) => group.itemIds.includes(i.id));
}

async function selectTask(item: IntakeItem): Promise<void> {
  activeTaskId.value = item.id;
  activeAnchor.value = null;
  rightTab.value = 'doc';
  await loadExtraction(item.id);
  if (item.caseId) {
    await loadCase(item.caseId);
  } else {
    // 建案：把这条（或它所在合并组的全部条目）指派到本模块
    assigning.value = true;
    try {
      const group = groups.value.find((g) => g.itemIds.includes(item.id) && g.merged);
      // 同 confirmMerge：合并组的 itemIds 是响应式 Proxy，必须 toPlain 才过得了 contextBridge。
      // 这条路径以前只在「点的是合并组里的条目」时挂，单条建案是新建的普通数组所以一直没事 ——
      // 于是这个 bug 表现得像随机失败。
      const itemIds = group ? group.itemIds : [item.id];
      const res = await intakeApi()?.assign?.(toPlain({ itemIds, module: props.moduleId }));
      if (res?.caseId) {
        await loadIntake();
        await loadCase(res.caseId);
        showToast(i18nT('已建案，{p0} 条来源归入同一任务', { p0: itemIds.length }));
      }
    } catch (error) {
      showToast(humanizeErrorMessage(error, i18nT('建案失败')));
    } finally {
      assigning.value = false;
    }
  }
  void nextTick(() => stepRefs.value[2]?.scrollIntoView({ behavior: 'smooth', block: 'start' }));
}

async function confirmMerge(group: IntakeGroup): Promise<void> {
  try {
    // toPlain 不能省：group 来自 groups.value（ref），group.itemIds 是 **Vue 响应式 Proxy 数组**，
    // contextBridge 在参数进 preload **之前**就先做一次结构化克隆，Proxy 在那一步直接抛
    // "An object could not be cloned." —— 冒到界面上就是一句「操作失败，请稍后重试」，
    // 完全看不出跟响应式有关系（preload 里的 plainClone 根本执行不到，见其文件头注释）。
    await intakeApi()?.merge?.(toPlain({ itemIds: group.itemIds, groupId: group.id }));
    mergeReasonsFor.value = '';
    await loadIntake();
    showToast(i18nT('已合并为一个任务，来源标签保留，可随时撤销'));
  } catch (error) {
    showToast(humanizeErrorMessage(error, i18nT('合并失败')));
  }
}

async function undoMerge(groupId: string): Promise<void> {
  try {
    await intakeApi()?.unmerge?.({ groupId });
    await loadIntake();
    showToast(i18nT('已撤销合并'));
  } catch (error) {
    showToast(humanizeErrorMessage(error, i18nT('撤销失败')));
  }
}

async function pollChannel(channel: IntakeChannel): Promise<void> {
  pollingChannel.value = channel;
  try {
    const result = await pollNow(channel);
    await loadIntake();
    showToast(result.message || i18nT('已收取 {p0} 条', { p0: result.fetched }));
  } finally {
    pollingChannel.value = '';
  }
}

// ── WhatsApp 绑定弹层 ───────────────────────────────────────────────────────
const waOpen = ref(false);
const waPair = useWhatsappPairing();
const waStageIcon = computed(() => ({
  idle: 'ri-qr-code-line',
  starting: 'ri-loader-4-line spin',
  waiting_scan: 'ri-qr-scan-2-line',
  enabling: 'ri-loader-4-line spin',
  expired: 'ri-time-line',
  paired: 'ri-checkbox-circle-line',
  failed: 'ri-error-warning-line',
}[waPair.state.stage] || 'ri-qr-code-line'));

async function openWhatsappPair(): Promise<void> {
  waOpen.value = true;
  await waPair.refreshBindState();
}

function closeWhatsappPair(): void {
  // 只停轮询，不 cancel —— 用户可能只是想看看收件箱再回来扫，cancel 会把 session 作废
  waPair.stopPoll();
  waOpen.value = false;
  void refreshChannels();
}

async function unbindWhatsapp(): Promise<void> {
  const ok = await dialog.confirm({
    title: i18nT('解绑 WhatsApp'),
    message: i18nT('解绑后该 WhatsApp 不再接收 TotalClaw 消息，需要重新扫码绑定。'),
    danger: true,
  });
  if (!ok) return;
  await waPair.unbind();
  await refreshChannels();
}

// ── 文件上传通道 ────────────────────────────────────────────────────────────
// 点卡片 = 主进程弹原生选择框；拖文件 = 用 preload 的 getPathForFile 取真实路径再交主进程读盘。
// 不走渲染层 FileReader + base64 过 IPC —— 25MB 的标书那样传又慢又吃内存。
const uploading = ref(false);
const uploadDropping = ref(false);

function onUploadDragOver(event: DragEvent): void {
  event.preventDefault();
  if (event.dataTransfer) event.dataTransfer.dropEffect = 'copy';
  uploadDropping.value = true;
}

async function onUploadDrop(event: DragEvent): Promise<void> {
  event.preventDefault();
  uploadDropping.value = false;
  const files = Array.from(event.dataTransfer?.files ?? []);
  if (!files.length) return;
  const getPath = (window as any).electronAPI?.getPathForFile;
  const paths = files.map((f) => (typeof getPath === 'function' ? getPath(f) : '')).filter(Boolean);
  if (!paths.length) {
    // 粘贴的截图 / blob 没有本地路径，拿不到就说清楚，别假装收下了
    showToast(i18nT('这些内容没有本地文件路径，请改用「选择文件」。'));
    return;
  }
  await runUpload(paths);
}

async function pickUploadFiles(): Promise<void> {
  if (uploading.value) return;
  await runUpload();
}

async function runUpload(filePaths?: string[]): Promise<void> {
  uploading.value = true;
  try {
    const res: any = await intakeApi()?.upload?.({ filePaths, module: props.moduleId });
    if (res?.canceled) return;
    const rejected: { fileName: string; reason: string }[] = res?.rejected ?? [];
    if (!res?.ok) {
      showToast(rejected.length
        ? i18nT('{p0} 未收下：{p1}', { p0: rejected[0].fileName, p1: rejected[0].reason })
        : i18nT('上传失败'));
      return;
    }
    await loadIntake();
    await refreshChannels();
    const names: string[] = res.fileNames ?? [];
    showToast(rejected.length
      ? i18nT('已建任务（{p0} 个文件）；{p1} 个被跳过：{p2}', {
        p0: names.length, p1: rejected.length, p2: rejected.map((r) => `${r.fileName}(${r.reason})`).join('、'),
      })
      : i18nT('已建任务（{p0} 个文件）', { p0: names.length }));
  } catch (error) {
    showToast(humanizeErrorMessage(error, i18nT('上传失败')));
  } finally {
    uploading.value = false;
  }
}

async function addSimulated(): Promise<void> {
  try {
    await intakeApi()?.simulate?.({
      channel: simChannel.value,
      module: props.moduleId,
      customer: simCustomer.value,
      subject: simSubject.value,
      body: simBody.value,
    });
    simulateOpen.value = false;
    simSubject.value = '';
    simBody.value = '';
    await loadIntake();
    showToast(i18nT('已加入收件箱（带 Simulated 标记）'));
  } catch (error) {
    showToast(humanizeErrorMessage(error, i18nT('模拟收件失败')));
  }
}

/** 载入演示样例：把基线条目经真实通道写进收件箱（带 Simulated 标记），后续全部走真链路。 */
// ── 收件箱的分类与筛选 ──────────────────────────────────────────────────────
// 任务一多平铺就看不出轻重。按状态分组 + 三个筛选（状态 / 负责人 / 关键词），
// 编号与负责人跟着案件走（需求文档「Opportunity/Request Inbox」明确要这两列）。
// ── 建档模式（自动 / 手动）────────────────────────────────────────────────
// 选择持久化在案件库存档里，重进页面/重启应用都还是它 —— 每次进来丢失是最烦的。
const filingMode = ref<'manual' | 'auto'>('manual');
const batchFiling = ref(false);
/** 还没建案的条目数（手动模式下「一键建档」要处理的就是这些） */
const pendingFilingCount = computed(() => intakeItems.value.filter((i) => !i.caseId).length);

async function loadFilingMode(): Promise<void> {
  try {
    const res: any = await intakeApi()?.filingMode?.();
    const mode = res?.settings?.byModule?.[props.moduleId];
    filingMode.value = mode === 'auto' ? 'auto' : 'manual';
  } catch { /* 读不到就用默认 manual */ }
}

async function setFilingMode(mode: 'manual' | 'auto'): Promise<void> {
  if (filingMode.value === mode) return;
  filingMode.value = mode;
  try {
    await intakeApi()?.setFilingMode?.({ module: props.moduleId, mode });
    showToast(mode === 'auto' ? i18nT('已切到自动建档：新收件会直接立案') : i18nT('已切到手动建档'));
    if (mode === 'auto') await fileAllPending(true);
  } catch (error) {
    showToast(humanizeErrorMessage(error, i18nT('保存建档方式失败')));
  }
}

/** 把还没建案的条目批量建档。合并组按组建一次，不会把同一任务拆成多个案件。 */
async function fileAllPending(silent = false): Promise<void> {
  const pending = intakeItems.value.filter((i) => !i.caseId);
  if (!pending.length) return;
  batchFiling.value = true;
  try {
    const done = new Set<string>();
    let created = 0;
    for (const item of pending) {
      if (done.has(item.id)) continue;
      const group = groups.value.find((g) => g.itemIds.includes(item.id) && g.merged);
      const itemIds = group ? group.itemIds : [item.id];
      itemIds.forEach((id) => done.add(id));
      // 一键建档扫的是整个收件箱，只要里面有一个合并组，不 toPlain 就会整批失败
      await intakeApi()?.assign?.(toPlain({ itemIds, module: props.moduleId }));
      created += 1;
    }
    await loadIntake();
    if (!silent) showToast(i18nT('已建档 {p0} 个任务', { p0: created }));
  } catch (error) {
    showToast(humanizeErrorMessage(error, i18nT('建档失败')));
  } finally {
    batchFiling.value = false;
  }
}

const filterStatus = ref('');
const filterText = ref('');

// ── 第 1 步「接通道」的摘要 ─────────────────────────────────────────────────
/** 标题旁的一行状态：不展开也知道通没通、哪条还没配 */
const channelSummary = computed(() => {
  const list = moduleChannels.value;
  const ready = list.filter((c) => c.state === 'ready');
  const bad = list.filter((c) => c.state === 'error');
  const parts = [i18nT('{p0}/{p1} 条通道已连接', { p0: ready.length, p1: list.length })];
  if (bad.length) parts.push(i18nT('{p0} 条连接失败', { p0: bad.length }));
  const notReady = list.filter((c) => c.state === 'not_configured').map((c) => channelLabel(c.channel));
  if (notReady.length) parts.push(i18nT('未配置：{p0}', { p0: notReady.join('、') }));
  return parts.join(' · ');
});

/**
 * 本模块是否有**真实**通道在工作（上传不算 —— 它永远"已连接"，
 * 拿它当依据的话模拟入口就永远不出现了）。
 * 模拟收件只在一条真通道都没通时才露出来。
 */
const hasLiveChannel = computed(() => moduleChannels.value.some(
  (c) => c.state === 'ready' && c.channel !== 'upload',
));

const caseIndex = ref<Record<string, { caseNo: string; owner: string }>>({});

function caseNoOf(item: IntakeItem): string {
  return item.caseId ? (caseIndex.value[item.caseId]?.caseNo || '') : '';
}

/** 本模块的案件全量（概览用；收件箱只有 caseId，编号/状态都在这里） */
const moduleCases = ref<any[]>([]);

async function loadCaseIndex(): Promise<void> {
  try {
    const res: any = await caseApi()?.list?.({ module: props.moduleId });
    const cases = res?.cases ?? [];
    moduleCases.value = cases;
    const map: Record<string, { caseNo: string; owner: string }> = {};
    for (const c of cases) map[c.id] = { caseNo: c.caseNo || '', owner: c.owner || '' };
    caseIndex.value = map;
  } catch { /* 拿不到就显示 '—'，不影响收件箱本身 */ }
}

/** 案件状态 → 人话。与审批条用同一套说法，别一处叫「待审批」一处叫「审批中」。 */
const CASE_STATUS_TEXT: Record<string, string> = {
  received: i18nKey('已接收'), parsed: i18nKey('已解析'), analyzed: i18nKey('已分析'),
  drafted: i18nKey('已起草'), pending_approval: i18nKey('待审批'), approved: i18nKey('已批准'),
  approved_with_edits: i18nKey('修改后批准'), returned: i18nKey('已退回'), rejected: i18nKey('已拒绝'),
  reassigned: i18nKey('已转交'), delivered: i18nKey('已交付（模拟）'),
};

const overview = computed(() => {
  const list = moduleCases.value;
  const delivered = list.filter((c) => c.status === 'delivered');
  const approving = list.filter((c) => c.status === 'pending_approval');
  return {
    total: list.length,
    // 「待处理」= 既没在等审批、也没交付的那些
    pending: list.length - delivered.length - approving.length,
    approving: approving.length,
    delivered: delivered.length,
    recent: [...list]
      .sort((a, b) => String(b.updatedAt || '').localeCompare(String(a.updatedAt || '')))
      .slice(0, 3)
      .map((c) => ({
        id: c.id,
        caseNo: c.caseNo || '—',
        subject: c.subject,
        statusLabel: i18nT(CASE_STATUS_TEXT[c.status] || c.status),
        at: String(c.updatedAt || '').replace('T', ' ').slice(5, 16),
      })),
  };
});

/** 点「最近结果」某一行 → 打开它对应的收件条目（进工作台） */
function openCaseById(caseId: string): void {
  const item = intakeItems.value.find((i) => i.caseId === caseId);
  if (item) void selectTask(item);
}

function openFirstPendingApproval(): void {
  const hit = moduleCases.value.find((c) => c.status === 'pending_approval');
  if (hit) openCaseById(hit.id);
}

/** 状态分组的展示顺序：要处理的排前面，已交付沉底 */
const STATUS_ORDER: IntakeItem['status'][] = ['new', 'merged', 'processing', 'assigned'];
const statusOptions = computed(() => STATUS_ORDER.filter((s) => intakeItems.value.some((i) => i.status === s)));
const filteredItems = computed(() => {
  const kw = filterText.value.trim().toLowerCase();
  return intakeItems.value.filter((i) => {
    if (filterStatus.value && i.status !== filterStatus.value) return false;
    if (!kw) return true;
    return [caseNoOf(i), i.subject, i.customer, i.from?.name]
      .filter(Boolean).some((v) => String(v).toLowerCase().includes(kw));
  });
});

// ── 分页 ────────────────────────────────────────────────────────────────────
// 收件多了一路铺到底既难定位又把工作台挤没了。按**过滤后的全量**分页，
// 再在当前页内按状态分组 —— 反过来（先分组再各组分页）会出现「每组都只有两条」
// 的怪样子，翻页也说不清翻的是谁。
const page = ref(1);
const pageSize = ref(10);
const totalPages = computed(() => Math.max(1, Math.ceil(filteredItems.value.length / pageSize.value)));
const pagedItems = computed(() => {
  const start = (page.value - 1) * pageSize.value;
  return filteredItems.value.slice(start, start + pageSize.value);
});
// 筛选变了/条目少了导致当前页超出范围时，回到最后一页而不是显示空白
watch([filteredItems, pageSize], () => {
  if (page.value > totalPages.value) page.value = totalPages.value;
});

/** 当前页内按状态分组（分野在页内做，翻页语义才清楚） */
const pagedGroups = computed(() => {
  const source = pagedItems.value;
  const buckets: { status: IntakeItem['status']; items: IntakeItem[] }[] = [];
  for (const status of STATUS_ORDER) {
    const items = source.filter((i) => i.status === status);
    if (items.length) buckets.push({ status, items });
  }
  // 状态表以后要是加了新值，别把它们悄悄漏掉
  const known = new Set(STATUS_ORDER);
  const rest = source.filter((i) => !known.has(i.status));
  if (rest.length) buckets.push({ status: rest[0].status, items: rest });
  return buckets;
});

// ── 交付目录（正式件另存 / 备份）────────────────────────────────────────────
const deliveryDirs = ref<{ outputDir?: string; backupDir?: string }>({});

async function loadDeliveryDirs(): Promise<void> {
  try {
    const res: any = await caseApi()?.deliveryDirs?.();
    deliveryDirs.value = res?.dirs || {};
  } catch { /* 读不到就当未设置 */ }
}
async function pickDeliveryDir(which: 'output' | 'backup'): Promise<void> {
  try {
    const res: any = await caseApi()?.setDeliveryDirs?.({ pick: which });
    if (res?.canceled) return;
    deliveryDirs.value = res?.dirs || {};
    showToast(which === 'output' ? i18nT('导出目录已设置') : i18nT('备份目录已设置'));
  } catch (error) {
    showToast(humanizeErrorMessage(error, i18nT('设置目录失败')));
  }
}
async function clearDeliveryDir(which: 'output' | 'backup'): Promise<void> {
  try {
    const res: any = await caseApi()?.setDeliveryDirs?.({ clear: which });
    deliveryDirs.value = res?.dirs || {};
  } catch (error) {
    showToast(humanizeErrorMessage(error, i18nT('清除失败')));
  }
}
async function revealOutput(outputId: string): Promise<void> {
  if (!activeCase.value) return;
  try {
    const res: any = await caseApi()?.revealOutput?.({ caseId: activeCase.value.id, outputId });
    if (!res?.ok) showToast(res?.message || i18nT('打不开所在文件夹'));
  } catch (error) {
    showToast(humanizeErrorMessage(error, i18nT('打不开所在文件夹')));
  }
}

/**
 * 输出物按「文件名」分组：每组只默认展开最新一版，旧版折进「历史版本」。
 *
 * 为什么不做「重新生成即覆盖」：这是合规工作台，版本留痕本身就是产品价值
 * （审批过的 v1 已经发出去了，覆盖掉等于把发出去的那份从记录里抹掉）。
 * 用户真正的痛点是**列表越堆越长**，那就折叠；真不想要的那版给显式删除。
 */
const outputGroups = computed(() => {
  const groups = new Map<string, any[]>();
  for (const o of (activeCase.value?.outputs ?? []) as any[]) {
    const key = String(o.name || '');
    const arr = groups.get(key) || [];
    arr.push(o);
    groups.set(key, arr);
  }
  return [...groups.entries()].map(([name, items]) => {
    // outputs 本身是 unshift 进去的（新的在前），这里再按时间兜一次底
    const sorted = items.slice().sort((a, b) => String(b.generatedAt).localeCompare(String(a.generatedAt)));
    return { name, latest: sorted[0], older: sorted.slice(1) };
  });
});
const expandedOutputHistory = ref<Set<string>>(new Set());
function isOutputHistoryOpen(name: string): boolean { return expandedOutputHistory.value.has(name); }
function toggleOutputHistory(name: string): void {
  const next = new Set(expandedOutputHistory.value);
  if (next.has(name)) next.delete(name); else next.add(name);
  expandedOutputHistory.value = next; // 换新 Set 才触发响应式（Set.add 不会）
}
/** 摊平成一行一条：最新那行带「历史版本（n）」入口，展开后旧版跟在它后面 */
const visibleOutputRows = computed(() => {
  const rows: Array<{ o: any; isHistory: boolean; olderCount: number }> = [];
  for (const g of outputGroups.value) {
    if (!g.latest) continue;
    rows.push({ o: g.latest, isHistory: false, olderCount: g.older.length });
    if (isOutputHistoryOpen(g.name)) {
      for (const o of g.older) rows.push({ o, isHistory: true, olderCount: 0 });
    }
  }
  return rows;
});

/** 删除一份输出物：磁盘文件与记录一起清，动作进审计 */
async function removeOutput(o: any): Promise<void> {
  if (!activeCase.value) return;
  const copies = (o.exportedPaths?.length || 0);
  if (!(await dialog.confirm({
    message: copies
      ? i18nT('删除《{name} {ver}》？案件目录里的那份，以及另存到导出/备份目录的 {n} 份拷贝都会一起删掉，不可恢复。', { name: o.name, ver: o.version, n: String(copies) })
      : i18nT('删除《{name} {ver}》？磁盘上的文件会一起删掉，不可恢复。', { name: o.name, ver: o.version }),
    danger: true,
  }))) return;
  try {
    const res: any = await caseApi()?.deleteOutput?.({ caseId: activeCase.value.id, outputId: o.id });
    if (!res?.ok) { showToast(res?.message || i18nT('删除失败')); return; }
    await loadCase(activeCase.value.id); // 重拉整单：输出物卡的角标也要跟着更新
  } catch (error) {
    showToast(humanizeErrorMessage(error, i18nT('删除失败')));
  }
}

const clearingDemo = ref(false);
const hasSimulatedItems = computed(() => intakeItems.value.some((i) => i.simulated));

async function removeIntakeItem(item: IntakeItem): Promise<void> {
  const ok = await dialog.confirm({
    title: i18nT('从收件箱移除'),
    message: item.caseId
      ? i18nT('「{p0}」已经建过案。移除只是把它从收件箱拿掉，案件与审计记录保留。', { p0: item.subject })
      : i18nT('确定移除「{p0}」？附件会一起清掉。', { p0: item.subject }),
    danger: true,
  });
  if (!ok) return;
  try {
    await intakeApi()?.remove?.(item.id);
    if (activeTaskId.value === item.id) activeTaskId.value = '';
    await loadIntake();
    showToast(i18nT('已从收件箱移除'));
  } catch (error) {
    showToast(humanizeErrorMessage(error, i18nT('移除失败')));
  }
}

async function clearDemoIntake(): Promise<void> {
  const count = intakeItems.value.filter((i) => i.simulated).length;
  const ok = await dialog.confirm({
    title: i18nT('清空演示条目'),
    message: i18nT('将删除 {p0} 条带 Simulated 标记的演示收件；真实邮件、工单与标讯不受影响。', { p0: count }),
    danger: true,
  });
  if (!ok) return;
  clearingDemo.value = true;
  try {
    const res: any = await intakeApi()?.clearSimulated?.({ module: props.moduleId });
    await loadIntake();
    showToast(i18nT('已清空 {p0} 条演示条目', { p0: res?.removed ?? count }));
  } catch (error) {
    showToast(humanizeErrorMessage(error, i18nT('清空失败')));
  } finally {
    clearingDemo.value = false;
  }
}

async function seedDemoIntake(): Promise<void> {
  seeding.value = true;
  try {
    for (const sample of DEMO_INTAKE[props.moduleId]) {
      await intakeApi()?.simulate?.({
        channel: sample.channel,
        module: props.moduleId,
        customer: sample.customer,
        // 保留各渠道真实的联系人地址：合并打分要靠它判「同一联系人 72 小时内」
        fromAddress: sample.from?.address,
        subject: sample.subject,
        body: sample.body,
        deadline: sample.deadline,
        // 外部标讯样例要带出处，否则演示时那条公告缺链接与抓取时间（合规必须显示）
        external: sample.external,
        // 附件走随包真文件：sha256 才算得出来，合并打分与「从附件抽取字段」才有料
        attachments: (sample.attachments ?? []).map((a) => ({ fileName: a.fileName, bundledPath: a.relPath })),
      });
    }
    await loadIntake();
    showToast(i18nT('演示样例已载入收件箱'));
  } catch (error) {
    showToast(humanizeErrorMessage(error, i18nT('载入演示样例失败')));
  } finally {
    seeding.value = false;
  }
}

async function refreshTicket(item: IntakeItem | null): Promise<void> {
  if (!item?.ticket) return;
  refreshingTicket.value = true;
  try {
    const sources = await intakeApi()?.ticketSources?.();
    const source = (sources?.sources || []).find((s: any) => s.sourceName === item.ticket!.sourceName);
    if (!source) {
      showToast(i18nT('没找到对应的工单源配置，先在「配置工单库」里保存一次'));
      return;
    }
    const res = await intakeApi()?.fetchTicket?.({
      sourceId: source.id,
      ticketNo: item.ticket.ticketNo,
      pkValue: item.ticket.pkValue,
    });
    if (res?.ok && res.ticket) {
      item.ticket = res.ticket;
      showToast(i18nT('已按工单号回查最新状态：{p0}', { p0: res.ticket.status }));
    } else {
      showToast(res?.message || i18nT('回查失败'));
    }
  } catch (error) {
    showToast(humanizeErrorMessage(error, i18nT('回查失败')));
  } finally {
    refreshingTicket.value = false;
  }
}

// ── 邮箱收件配置 ─────────────────────────────────────────────────────────────

/** 打开时先把已存的配置读回来（密码只回显"已保存"，不回显明文）。 */
async function openEmailConfig(): Promise<void> {
  if (emailConfigAllowed.value !== true) { void router.push('/settings?section=notify'); return; }
  emailConfigOpen.value = true;
  try {
    const res = await (window as any).electronAPI?.qiyeApi?.emailGetConfig?.();
    const cfg = res?.config ?? res;
    if (cfg) {
      emailForm.value = {
        preset: '',
        address: cfg.address || '',
        password: '',
        passwordSet: !!cfg.passwordSet,
        imapHost: cfg.imapHost || '',
        imapPort: cfg.imapPort || '993',
        smtpHost: cfg.smtpHost || '',
        smtpPort: cfg.smtpPort || '465',
      };
    }
  } catch { /* 读不到就用空表单，用户照样能填 */ }
}

function applyEmailPreset(key: string): void {
  const preset = EMAIL_PRESETS.find((p) => p.key === key);
  if (!preset) return;
  emailForm.value = {
    ...emailForm.value,
    preset: key,
    imapHost: preset.imapHost,
    imapPort: preset.imapPort,
    smtpHost: preset.smtpHost,
    smtpPort: preset.smtpPort,
  };
}

/** 保存后立刻收一轮：让用户当场看到"邮件真的进来了"，而不是保存完一片安静。 */
// （保存成功后会 refreshSmtpState()，让发送复核那屏的发件人说明立刻跟上）
async function saveEmailConfig(): Promise<void> {
  if (emailConfigAllowed.value !== true) { void router.push('/settings?section=notify'); return; }
  emailBusy.value = true;
  try {
    const form = emailForm.value;
    const res = await (window as any).electronAPI?.qiyeApi?.emailConfigure?.({
      address: form.address.trim(),
      // 留空 = 沿用已存密码（契约里 password 可选就是这个语义）
      password: form.password || undefined,
      smtpHost: form.smtpHost.trim(),
      smtpPort: form.smtpPort.trim() || '465',
      imapHost: form.imapHost.trim(),
      imapPort: form.imapPort.trim() || '993',
    });
    if (res && res.ok === false) {
      showToast(res.message || i18nT('保存失败'));
      return;
    }
    emailConfigOpen.value = false;
    showToast(i18nT('邮箱已保存，正在收取…'));
    void refreshSmtpState();   // 发送复核那屏的「发件人」说明立刻跟上
    const result = await pollNow('email');
    await loadIntake();
    showToast(result.message || i18nT('已收取 {p0} 封', { p0: result.fetched }));
  } catch (error) {
    showToast(humanizeErrorMessage(error, i18nT('保存邮箱配置失败')));
  } finally {
    emailBusy.value = false;
  }
}

// ── 工单库配置 ───────────────────────────────────────────────────────────────

async function loadTicketSource(): Promise<void> {
  try {
    const res = await intakeApi()?.ticketSources?.();
    const first = (res?.sources || [])[0];
    if (first) ticketForm.value = { ...ticketForm.value, ...first, columnMap: { ...first.columnMap } };
  } catch { /* 未就绪就用空表单 */ }
}

async function testTicketSource(): Promise<void> {
  ticketBusy.value = true;
  ticketTestResult.value = null;
  try {
    const res = await intakeApi()?.testTicketSource?.({ source: toPlain(ticketForm.value), limit: 5 });
    ticketTestResult.value = res;
  } catch (error) {
    ticketTestResult.value = {
      sql: '', rows: [],
      message: humanizeErrorMessage(error, ticketForm.value.mode === 'web' ? i18nT('试抓失败') : i18nT('试查失败')),
    };
  } finally {
    ticketBusy.value = false;
  }
}

async function saveTicketSource(): Promise<void> {
  ticketBusy.value = true;
  try {
    const res = await intakeApi()?.saveTicketSource?.(toPlain({ ...ticketForm.value, enabled: true }));
    if (res?.source) {
      // 主进程回来的 web.password 恒为空（密码不回传），本地表单也跟着清空，
      // 保留 passwordSaved 让「不改就留空」的提示成立
      ticketForm.value = {
        ...ticketForm.value,
        ...res.source,
        columnMap: { ...(res.source.columnMap || {}) },
        web: res.source.web
          ? { ...ticketForm.value.web, ...res.source.web, password: '', fieldSelectors: { ...(res.source.web.fieldSelectors || {}) } }
          : ticketForm.value.web,
      };
    }
    await refreshChannels();
    showToast(ticketForm.value.mode === 'web'
      ? i18nT('网页取数已保存并启用，下一轮会登录后抓一次列表页')
      : i18nT('工单源已保存并启用，下一轮拉取会带上它'));
    ticketConfigOpen.value = false;
  } catch (error) {
    showToast(humanizeErrorMessage(error, i18nT('保存失败')));
  } finally {
    ticketBusy.value = false;
  }
}

// ── 卡片交互 ─────────────────────────────────────────────────────────────────

function onAnchor(anchor: Anchor): void {
  activeAnchor.value = anchor;
  rightTab.value = 'doc';
}
function onInsertQuestions(questions: string[]): void {
  showToast(i18nT('{p0} 条澄清问题已写入邮件草稿（未审批不可发送）', { p0: questions.length }));
}
function onNeedsVerification(title: string): void {
  showToast(i18nT('已标记「{p0}」为待人工核验，报告风险段落会带出该标记', { p0: title }));
}

/** 卡片字段编辑 —— 真写审计（谁把 AI 的 X 改成了 Y）。 */
async function onCardEdit(cardId: string): Promise<void> {
  if (!activeCase.value) { showToast(i18nT('先从收件箱建案，编辑才会写进审计')); return; }
  const card = cards.value.find((c) => c.id === cardId);
  const field = card?.fields?.[0];
  const label = field?.label || card?.title || cardId;
  const before = field ? String(field.value) : '';
  const after = window.prompt(i18nT('修改「{p0}」为：', { p0: label }), before);
  if (after === null || after === before) return;
  try {
    await caseApi()?.editField?.({
      caseId: activeCase.value.id,
      cardId,
      fieldKey: field?.key || 'summary',
      label,
      before,
      after,
    });
    if (field) field.value = after;
    await loadCase(activeCase.value.id);
    showToast(i18nT('已写入审计：{p0} {p1} → {p2}', { p0: label, p1: before || '—', p2: after }));
  } catch (error) {
    showToast(humanizeErrorMessage(error, i18nT('写入审计失败')));
  }
}

// ── 对抗性复核（P2-1）─────────────────────────────────────────────────────
const councilOpen = ref(false);
const councilBusy = ref(false);
const councilQuestion = ref('');
const councilAnswer = ref('');
const councilError = ref('');

/**
 * 把 Bid/No-Bid 结论交给专家团正反辩论一轮。
 *
 * 为什么值得单独做一个入口：投标是**高风险单向决策** —— 决定投了就要投入几十万
 * 投标成本。工作台上那套加权评分再漂亮也只是一条链路的一家之言，
 * 而 `llm-council` 一直躺在 `/council` 独立页面里，业务侧根本用不到。
 *
 * 提问刻意写成「请分别论证该投与不该投」，而不是「这个决策对吗」 ——
 * 后者会得到一段附和，前者才逼出反对意见。
 */
async function runAdversarialReview(cardId: string): Promise<void> {
  const card = cards.value.find((c) => c.id === cardId);
  const d = card?.decision;
  if (!d) { showToast(i18nT('这张卡没有可复核的结论')); return; }

  const compliance = cards.value.find((c) => c.id === 'compliance');
  const facts: string[] = [
    i18nT('客户：{p0}', { p0: activeCase.value?.customer || '—' }),
    i18nT('项目：{p0}', { p0: activeCase.value?.subject || '—' }),
    i18nT('当前结论：{p0}（可信度 {p1}）', { p0: i18nT(d.recommendation), p1: i18nT(d.confidence || '—') }),
  ];
  if (d.hardBlock) facts.push(i18nT('硬性门槛：{p0}', { p0: i18nT(d.hardBlock) }));
  if (d.conditions?.length) {
    facts.push(i18nT('前提条件：{p0}', { p0: d.conditions.map((c) => i18nT(c)).join('; ') }));
  }
  if (d.scores?.length) {
    facts.push(i18nT('评分：{p0}', {
      p0: d.scores.map((s) => `${i18nT(s.label)} ${s.score}/${s.weight}`).join('; '),
    }));
  }
  if (compliance?.matrixRows?.length) {
    const dev = compliance.matrixRows.filter((r) => r.verdict === 'deviate' || r.verdict === 'fail').length;
    facts.push(i18nT('符合性：{p0} 项要求中 {p1} 项偏离', { p0: compliance.matrixRows.length, p1: dev }));
  }

  councilQuestion.value = [
    i18nT('以下是一个投标决策的全部已知事实：'),
    ...facts.map((f) => `- ${f}`),
    '',
    i18nT('请分别以「应当投标」和「不应投标」两个立场各自论证，各自列出最强的三条理由与它依赖的前提；'),
    i18nT('然后指出对方论证里最薄弱的一环；最后给出裁决与它成立的条件。'),
    i18nT('如果证据不足以支持任一立场，请直接说明缺哪一项证据，不要为了给结论而给结论。'),
  ].join('\n');

  councilAnswer.value = '';
  councilError.value = '';
  councilOpen.value = true;
  councilBusy.value = true;
  try {
    const api = (window as any).electronAPI;
    if (!api?.councilRun) throw new Error(i18nT('当前版本未开放专家团议事'));
    const res = await api.councilRun({
      userQuery: councilQuestion.value,
      requestId: `saudi-${cardId}-${Date.now()}`,
    });
    councilAnswer.value = String(res?.finalAnswer ?? res?.answer ?? res?.synthesis ?? '').trim();
    if (!councilAnswer.value) councilError.value = i18nT('专家团没有返回结论（可能是模型未配置）');
    else if (activeCase.value) {
      // 复核过程要留痕：事后要能回答「这个投标结论被质疑过没有」
      await caseApi()?.editField?.(toPlain({
        caseId: activeCase.value.id, cardId, fieldKey: 'adversarial_review',
        label: i18nT('对抗性复核'), before: i18nT(d.recommendation),
        after: councilAnswer.value.slice(0, 500),
      }));
    }
  } catch (error) {
    councilError.value = humanizeErrorMessage(error, i18nT('专家团复核失败'));
  } finally {
    councilBusy.value = false;
  }
}

/**
 * 卡片复核状态（采纳 / 待核验）。
 *
 * 原来点完只弹一条 toast，按钮长相不变、还能反复点 —— 用户反馈「没有任何变化，
 * 感觉和正常逻辑不符」。复核本来就是**状态**不是一次性动作：两态互斥，再点一次取消。
 *
 * 按案件存进 localStorage：翻到别的案件再翻回来、刷新页面，处理过的卡片仍然是处理过的。
 * 不进案件库是因为它属于「谁看过、谁认了」的工作台标注，不影响交付物数值与审计口径。
 */
const cardReview = ref<Record<string, 'accepted' | 'flagged'>>({});

function cardReviewKey(caseId: string): string {
  return `totalclaw:saudi:card-review:${props.moduleId}:${caseId}`;
}

function loadCardReview(caseId: string): void {
  try {
    const raw = window.localStorage.getItem(cardReviewKey(caseId));
    cardReview.value = raw ? JSON.parse(raw) : {};
  } catch {
    cardReview.value = {};
  }
}

/** 见 moduleStateStore：现场变更属于「对这一单做了什么」，必须跟着案件走。 */
function loadModuleState(caseId: string): void {
  state.value = readModuleState(window.localStorage, props.moduleId, caseId);
  // 差异面板是上一次变更的**快照**，不跟着案件走就会把 A 单的「重算 3 张卡」
  // 挂在 B 单头上。审计里仍有记录，这里清掉不丢信息。
  lastImpact.value = null;
  rebuildCards();
}

function persistModuleState(): void {
  writeModuleState(window.localStorage, props.moduleId, activeCase.value?.id ?? '', state.value);
}

function onCardAction(action: 'accept' | 'flag', cardId: string): void {
  const next = action === 'accept' ? 'accepted' : 'flagged';
  const current = cardReview.value[cardId];
  if (current === next) {
    delete cardReview.value[cardId];          // 再点一次 = 撤销，别把人锁死在某个状态里
  } else {
    cardReview.value[cardId] = next;
  }
  const caseId = activeCase.value?.id;
  if (caseId) {
    try { window.localStorage.setItem(cardReviewKey(caseId), JSON.stringify(cardReview.value)); } catch { /* 存不下不影响本次操作 */ }
  }
  const state = cardReview.value[cardId];
  showToast(state === 'accepted' ? i18nT('已采纳')
    : state === 'flagged' ? i18nT('已标记待核验')
      : i18nT('已取消标记'));
}

/**
 * 决定输出物的真实格式。优先级：卡片声明的 kind > 文件名扩展名 > 关键词兜底。
 * 早先只有关键词兜底，「符合性矩阵.xlsx」「Bid_No-Bid_建议书.docx」一个关键词都不中，
 * 全落成了 .pdf —— 界面写着 xlsx、磁盘上是 pdf。
 */
function resolveOutputKind(name: string, declaredKind?: string): 'word' | 'excel' | 'pdf' | 'email' {
  const known = ['word', 'excel', 'pdf', 'email'] as const;
  if (declaredKind && (known as readonly string[]).includes(declaredKind)) {
    return declaredKind as typeof known[number];
  }
  const ext = (name.match(/\.([a-z0-9]+)$/i)?.[1] || '').toLowerCase();
  const byExt: Record<string, typeof known[number]> = {
    docx: 'word', doc: 'word', xlsx: 'excel', xls: 'excel', csv: 'excel', pdf: 'pdf', eml: 'email',
  };
  if (byExt[ext]) return byExt[ext];
  if (name.includes(i18nT('报价'))) return 'excel';
  if (name.includes(i18nT('邮件'))) return 'email';
  if (name.includes(i18nT('方案')) || name.includes(i18nT('报告'))) return 'word';
  return 'pdf';
}

/** 输出物：真落盘（未审批带 DRAFT 水印，由主进程决定）。 */
async function generateOutput(name: string, declaredKind?: string): Promise<void> {
  if (!activeCase.value) { showToast(i18nT('先从收件箱建案再生成文件')); return; }
  const kind = resolveOutputKind(name, declaredKind);
  try {
    // toPlain：structured 里有 priceRange 这类**直接引用卡片上的嵌套响应式对象**，
    // Vue proxy 过不了 contextBridge 的结构化克隆（会报 "An object could not be cloned"）。
    const res = await caseApi()?.generateOutput?.(toPlain({
      caseId: activeCase.value.id,
      kind,
      name: name.replace(/\.[a-z]+$/i, ''),
      // 结构化过去，主进程生成真排版件（xlsx 带公式 / docx / printToPDF）
      structured: buildStructuredOutput(kind, name),
      content: buildOutputContent(kind),
    }));
    if (res?.ok) {
      await loadCase(activeCase.value.id);
      outputsOpen.value = true;
      const warn = res.validation?.warningCount;
      showToast([
        res.output?.draft
          ? i18nT('已生成草稿（带 DRAFT 水印），审批通过后才可发送')
          : i18nT('已生成正式件'),
        res.validation ? `· ${i18nT('校验')} ${res.validation.summary}` : '',
      ].filter(Boolean).join(' '));
      // 有提醒项就把报告推到面前 —— 提醒不阻断，但"没人看见的提醒"等于没有
      if (warn) openValidationReport(res.validation, `${name} · ${i18nT('校验提醒')}`);
    } else if (res?.needsOutline) {
      // 复杂交付物要先审结构。这里**直接把大纲编辑器推到面前**，
      // 而不是丢一句"生成失败"让用户自己找哪里能写大纲。
      showToast(res.message || i18nT('请先确认交付物大纲'));
      await openOutline(name.replace(/\.[a-z]+$/i, ''), kind);
    } else if (res?.validation && !res.validation.passed) {
      // 被校验拦下：逐条定位在弹层里摊开，toast 只留一句结论
      openValidationReport(res.validation, name);
      showToast(i18nT('交付物校验未通过，已阻断生成（{p0}）', { p0: res.validation.summary }));
    } else {
      showToast(res?.message || i18nT('生成失败'));
    }
  } catch (error) {
    showToast(humanizeErrorMessage(error, i18nT('生成失败')));
  }
}

/**
 * 结构化载荷的装配逻辑住在 outputPayload.ts —— 它决定了主进程的交付物校验器
 * 拿哪些数字去对账，藏在 SFC 里就没人能测（口径错配过一次，三个模块全生成不出文件）。
 * 这里只负责把工作台的当前状态喂进去。
 */
function buildStructuredOutput(kind: string, outputName = ''): any {
  return buildOutputPayload(kind, outputName, {
    cards: cards.value,
    bomVariant: state.value.bomVariant === 'alternate' ? 'alternate' : 'primary',
    title: `${i18nT(moduleDef.value.title)} · ${activeCase.value?.subject || ''}`,
    customer: activeCase.value?.customer || '',
    project: activeCase.value?.subject || '',
    ruleVersion: dataPack.value?.version || RULE_VERSION,
    subject: activeCase.value?.subject || '',
    to: originContactAddress(),
  });
}

/** 案件对应的来件人邮箱：案件记录里没存，回查它关联的收件条目。 */
function originContactAddress(): string {
  const ids = activeCase.value?.itemIds ?? [];
  for (const id of ids) {
    const address = intakeItems.value.find((i) => i.id === id)?.from?.address;
    if (address) return address;
  }
  return '';
}

/** 文本兜底：结构化生成失败时仍能落一份可读文件，不让用户空手而归。 */
function buildOutputContent(kind: string): string {
  const lines: string[] = [
    `${i18nT('任务')}: ${activeCase.value?.subject || ''}`,
    `${i18nT('客户')}: ${activeCase.value?.customer || ''}`,
    `${i18nT('规则版本')}: ${RULE_VERSION}`,
    '',
  ];
  for (const card of cards.value) {
    if (kind === 'excel' && card.kind !== 'pricing' && card.kind !== 'bom') continue;
    lines.push(`## ${card.title}`);
    for (const line of card.calcLines ?? []) {
      lines.push(`${line.label},${line.currency ?? ''} ${Math.round(line.result)},${line.formula}`);
    }
    for (const row of card.bomPrimary ?? []) {
      lines.push(`${row.sku},${row.description},${row.qty},${row.unitCost}`);
    }
    for (const field of card.fields ?? []) lines.push(`${field.label},${field.value}`);
    for (const section of card.reportSections ?? []) lines.push(`### ${section.title}\n${section.body}`);
    if (card.replyLines?.length) lines.push(card.replyLines.join('\n'));
    lines.push('');
  }
  return lines.join('\n');
}

// ── 审批 ─────────────────────────────────────────────────────────────────────

function decisionLabel(action: string | null): string {
  return i18nT({
    approve: '批准', approve_with_edits: '修改后批准', return: '退回', reject: '拒绝', reassign: '转交',
  }[action || ''] || '');
}

async function submitForApproval(): Promise<void> {
  if (!activeCase.value) return;
  try {
    await caseApi()?.submit?.({ caseId: activeCase.value.id });
    await loadCase(activeCase.value.id);
    showToast(i18nT('已提交审批，审批通过前不可发送'));
  } catch (error) {
    showToast(humanizeErrorMessage(error, i18nT('提交失败')));
  }
}

function askReason(action: 'return' | 'reject' | 'reassign'): void {
  reasonAction.value = action;
  reasonText.value = '';
  reassignTo.value = '';
}

async function confirmReason(): Promise<void> {
  const action = reasonAction.value;
  if (!action) return;
  await decide(action, reasonText.value, reassignTo.value);
  reasonAction.value = null;
}

async function decide(action: string, reason?: string, assignee?: string): Promise<void> {
  if (!activeCase.value) return;
  try {
    const res = await caseApi()?.decide?.({ caseId: activeCase.value.id, action, reason, assignee });
    if (res?.ok) {
      await loadCase(activeCase.value.id);
      showToast(i18nT('审批已记录：{p0}', { p0: decisionLabel(action) }));
      /*
       * 批准之后自动弹输出中心：审批通过的下一步动作**必然**是去看/发那几份文件，
       * 而在此之前它们是不可发送的。原先只有「生成输出物」那条路径会弹，
       * 走审批这条路弹层不出来，用户点完批准像是什么都没发生。
       *
       * 没有已生成文件时不弹 —— 弹一个空面板是噪音，此时该做的是先去生成。
       */
      if (action === 'reassign') await loadMailApproval(activeCase.value!.id);
      if (shouldOpenOutputsAfterDecision(action, activeCase.value?.outputs?.length ?? 0)) {
        outputsOpen.value = true;
      }
    } else {
      showToast(res?.message || i18nT('审批失败'));
    }
  } catch (error) {
    showToast(humanizeErrorMessage(error, i18nT('审批失败')));
  }
}

// ── 发送复核（审批的是文件，发出去的是邮件）──────────────────────────────────
const sendDrawer = ref({
  open: false,
  busy: false,
  outputId: '',
  outputName: '',
  kind: 'word' as 'word' | 'excel' | 'pdf' | 'email',
  draft: false,
  /** true = 一键发送（一封信带整批附件）；false = 只发某一份 */
  batch: false,
  /** 一键发送时选中的输出物；单发时留空 */
  outputIds: [] as string[],
  to: '',
  cc: '',
  bcc: '',
  subject: '',
  body: '',
  attachOutput: true,
  /**
   * 弹层内的失败原因。只靠 toast 不够：用户的眼睛在弹层上，
   * 提示飘在屏幕底部（还曾经被弹层遮罩压住），点完像是什么都没发生。
   */
  error: '',
});

/** 可发送的输出物：草稿一律排除 —— 主进程也会拦，但界面上就不该让人选中它。 */
const sendableOutputs = computed<any[]>(() => (activeCase.value?.outputs ?? []).filter((o: any) => !o.draft));
const draftOutputs = computed<any[]>(() => (activeCase.value?.outputs ?? []).filter((o: any) => o.draft));

function toggleBatchOutput(id: string): void {
  const list = sendDrawer.value.outputIds;
  const i = list.indexOf(id);
  if (i >= 0) list.splice(i, 1);
  else list.push(id);
}

/** 默认正文：把任务编号、客户、文件、审批状态写清楚，人只需微调 */
function defaultMailBody(outputName: string): string {
  const c = activeCase.value;
  if (!c) return '';
  return [
    i18nT('您好，'),
    '',
    i18nT('随信附上「{p0}」相关文件：{p1}。', { p0: c.subject, p1: outputName }),
    i18nT('任务编号：{p0}', { p0: c.caseNo }),
    c.deadline ? i18nT('回复截止：{p0}', { p0: c.deadline }) : '',
    '',
    i18nT('如有任何问题，欢迎直接回复本邮件。'),
    '',
    i18nT('顺颂商祺'),
    c.owner,
  ].filter(Boolean).join('\n');
}

function openSendDrawer(output: any): void {
  const c = activeCase.value;
  if (!c) return;
  void refreshSmtpState();
  sendDrawer.value = {
    open: true,
    busy: false,
    outputId: output.id,
    outputName: `${output.name} ${output.version}`,
    kind: output.kind,
    draft: !!output.draft,
    batch: false,
    outputIds: [],
    to: activeTask.value?.from?.address && activeTask.value.from.address.includes('@')
      ? activeTask.value.from.address
      : '',
    cc: '',
    bcc: '',
    subject: `${c.caseNo} ${c.subject}`,
    body: defaultMailBody(`${output.name} ${output.version}`),
    attachOutput: true,
    error: '',
  };
}

/**
 * 一键发送：把已审批的整批文件装进**同一封**邮件发给一批人。
 * 逐份点「发送…」既慢又容易漏，而一人一封 × N 份文件是骚扰。
 */
function openBatchSendDrawer(): void {
  const c = activeCase.value;
  if (!c) return;
  void refreshSmtpState();
  const ready = sendableOutputs.value;
  sendDrawer.value = {
    open: true,
    busy: false,
    outputId: ready[0]?.id ?? '',
    outputName: '',
    kind: (ready[0]?.kind ?? 'word') as 'word' | 'excel' | 'pdf' | 'email',
    draft: false,
    batch: true,
    outputIds: ready.map((o: any) => o.id),
    to: activeTask.value?.from?.address && activeTask.value.from.address.includes('@')
      ? activeTask.value.from.address
      : '',
    cc: '',
    bcc: '',
    subject: `${c.caseNo} ${c.subject}`,
    body: defaultMailBody(i18nT('{p0} 份交付文件', { p0: ready.length })),
    attachOutput: true,
    error: '',
  };
}

async function doSend(): Promise<void> {
  const c = activeCase.value;
  const d = sendDrawer.value;
  if (!c) return;
  // 只有真发一种模式了，所以每次都二次确认 —— 发出去撤不回来
  const ok = await dialog.confirm({
    title: i18nT('确认发送'),
    message: d.batch
      ? i18nT('将把 {p0} 份文件发给：{p1}。发出去撤不回来，确定吗？', { p0: d.outputIds.length, p1: d.to })
      : i18nT('将真的把邮件发给：{p0}。发出去撤不回来，确定吗？', { p0: d.to }),
    danger: true,
  });
  if (!ok) return;
  d.busy = true;
  d.error = '';
  try {
    const res = await caseApi()?.simulateSend?.({
      caseId: c.id,
      outputId: d.outputId,
      // 单发时不传 outputIds，主进程按 outputId 走原路径
      ...(d.batch ? { outputIds: [...d.outputIds] } : {}),
      to: d.to,
      cc: d.cc,
      bcc: d.bcc,
      subject: d.subject,
      body: d.body,
      attachOutput: d.attachOutput,
      mode: 'real',
    });
    if (res?.blocked || !res?.ok) {
      sendReceipt.value = '';
      // 弹层里留一条常驻的原因（toast 3 秒就没了，而且用户此刻在看弹层）
      d.error = res?.message || i18nT('未审批不可发送');
      showToast(d.error);
      return;
    }
    sendReceipt.value = res?.receipt || '';
    d.open = false;
    // 官方代发时必须说清楚「发件人是官方地址、回信回到你的邮箱」——
    // 用户以为用的是自己的邮箱，收件人却看到 no-reply@，那是会出商务事故的误解。
    const viaOfficial = res?.via === 'official';
    const base = d.batch
      ? i18nT('已发送 {p0} 份文件', { p0: d.outputIds.length })
      : i18nT('邮件已发送');
    showToast(viaOfficial
      ? `${base} · ${res?.message || i18nT('由 TotalClaw 官方邮箱代发')}`
      : base);
    await loadCase(c.id);
  } catch (error) {
    d.error = humanizeErrorMessage(error, i18nT('发送失败'));
    showToast(d.error);
  } finally {
    d.busy = false;
  }
}

// ── 卡内操作触发的重算（与 Proof Switch 同一条路径）────────────────────────────

/**
 * 按新状态重建卡片，算影响面，只让受影响的卡进骨架，并把变更写进审计。
 * Proof Switch、BOM 切换、门槛改判三处共用——避免出现"有的改动写审计、有的不写"。
 */
async function applyStateChange(
  nextState: ModuleState,
  changedFields: { label: string; before: string; after: string }[],
  auditNote?: string,
): Promise<void> {
  if (!changedFields.length) return;
  const before = cards.value;
  const after = buildCards(props.moduleId, nextState, dataPack.value || undefined);
  const version = activeCase.value?.version ?? 1;
  const impact = computeImpact(before, after, changedFields, `v${version}`, `v${version + 1}`);

  recalculating.value = true;
  recalculatingCards.value = impact.affectedCards;
  await new Promise((resolve) => window.setTimeout(resolve, 450));

  state.value = nextState;
  cards.value = after;
  lastImpact.value = impact;
  persistModuleState();
  recalculatingCards.value = [];
  recalculating.value = false;

  if (activeCase.value) {
    try {
      if (!caseApi()?.recordRecalc) throw new Error(i18nT('审计接口不可用'));
      await caseApi().recordRecalc({
        caseId: activeCase.value.id,
        changedFields,
        affectedCards: impact.affectedCards,
        unaffectedCards: impact.unaffectedCards,
        fromVersion: impact.fromVersion,
        toVersion: impact.toVersion,
        ruleVersion: RULE_VERSION,
      });
      await loadCase(activeCase.value.id);
    } catch (error) {
      showToast(i18nT('本地重算已完成，但审计保存失败：') + humanizeErrorMessage(error));
      return;
    }
  }
  showToast(auditNote || i18nT('已重算 {p0} 张卡，{p1} 张未受影响', {
    p0: impact.affectedCards.length, p1: impact.unaffectedCards.length,
  }));
}

/** BOM 主选 / 备选切换 —— 需求 D1-10：切换后成本必须联动重算。 */
function onBomVariant(variant: 'primary' | 'alternate'): void {
  if (variant === state.value.bomVariant) return;
  void applyStateChange(
    { ...state.value, bomVariant: variant },
    [{
      label: i18nT('BOM 方案'),
      before: i18nT(state.value.bomVariant === 'alternate' ? '备选' : '主选'),
      after: i18nT(variant === 'alternate' ? '备选' : '主选'),
    }],
    i18nT('已切到{p0} BOM，成本与报价已联动重算', { p0: i18nT(variant === 'alternate' ? '备选' : '主选') }),
  );
}

/**
 * 硬性门槛人工改判 —— 需求 D2-12：把某证书改成过期，建议要从「有条件参与」
 * 立刻翻成「不参与」，且**评分一分不变**（硬性优先于总分）。
 */
function onGateMove(payload: { title: string; from: string; to: string }): void {
  const nextState: ModuleState = {
    ...state.value,
    gateOverrides: { ...state.value.gateOverrides, [payload.title]: payload.to as any },
  };
  const label = (key: string) => i18nT({
    met: '已满足', closeable: '可补齐', cannot: '无法满足', review: '待人工确认',
  }[key] || key);
  void applyStateChange(
    nextState,
    [{ label: `${i18nT('硬性门槛')} · ${payload.title}`, before: label(payload.from), after: label(payload.to) }],
    i18nT('已改判「{p0}」为{p1}，Bid/No-Bid 结论已按硬性门槛重算', { p0: payload.title, p1: label(payload.to) }),
  );
}

// ── Proof Switch ─────────────────────────────────────────────────────────────

async function applyProofSwitch(): Promise<void> {
  const before = cards.value;
  const nextState: ModuleState = { ...state.value };
  const changedFields: { label: string; before: string; after: string }[] = [];

  for (const ctrl of moduleDef.value.proofSwitch.controls) {
    const value = proofValues.value[ctrl.key];
    if (ctrl.key === 'location' && value && value !== nextState.location) {
      const label = ctrl.options?.find((o) => o.value === value)?.label ?? value;
      changedFields.push({ label: i18nT('交付地点'), before: nextState.locationLabel, after: label });
      nextState.location = value;
      nextState.locationLabel = label;
    }
    if (ctrl.key === 'warranty' && value && Number(value) !== nextState.warrantyYears) {
      changedFields.push({ label: i18nT('保修年限'), before: `${nextState.warrantyYears}`, after: value });
      nextState.warrantyYears = Number(value);
    }
    if (ctrl.key === 'segment' && (value === 'household' || value === 'commercial') && value !== nextState.segment) {
      changedFields.push({
        label: i18nT('目标客户'),
        before: nextState.segment === 'household' ? i18nT('家庭消费者') : i18nT('办公室与商业客户'),
        after: value === 'household' ? i18nT('家庭消费者') : i18nT('办公室与商业客户'),
      });
      nextState.segment = value;
    }
    if (ctrl.key === 'addendum' && value === 'applied' && !nextState.addendumApplied) {
      changedFields.push({ label: 'Addendum 01', before: i18nT('未上传'), after: 'Addendum_01.pdf' });
      nextState.addendumApplied = true;
    }
  }

  if (!changedFields.length) { showToast(i18nT('没有改动任何条件')); return; }

  const version = activeCase.value?.version ?? 1;
  const after = buildCards(props.moduleId, nextState, dataPack.value || undefined);
  const impact = computeImpact(before, after, changedFields, `v${version}`, `v${version + 1}`);

  recalculating.value = true;
  // 只有受影响的卡进骨架态；未受影响的卡 key 不变、数据不变 → 不重挂载、不闪
  recalculatingCards.value = impact.affectedCards;
  await new Promise((resolve) => window.setTimeout(resolve, 600));

  state.value = nextState;
  cards.value = after;
  lastImpact.value = impact;
  persistModuleState();
  recalculatingCards.value = [];
  recalculating.value = false;
  rightTab.value = 'diff';

  if (activeCase.value) {
    try {
      if (!caseApi()?.recordRecalc) throw new Error(i18nT('审计接口不可用'));
      await caseApi().recordRecalc({
        caseId: activeCase.value.id,
        changedFields,
        affectedCards: impact.affectedCards,
        unaffectedCards: impact.unaffectedCards,
        fromVersion: impact.fromVersion,
        toVersion: impact.toVersion,
        ruleVersion: RULE_VERSION,
      });
      await loadCase(activeCase.value.id);
    } catch (error) {
      showToast(i18nT('本地重算已完成，但审计保存失败：') + humanizeErrorMessage(error));
      return;
    }
  }
  showToast(i18nT('已重算 {p0} 张卡，{p1} 张未受影响', { p0: impact.affectedCards.length, p1: impact.unaffectedCards.length }));
}

// ── 杂项 ─────────────────────────────────────────────────────────────────────

function channelIcon(channel: IntakeChannel): string {
  return {
    email: 'ri-mail-line', whatsapp: 'ri-whatsapp-line', webform: 'ri-file-list-3-line',
    websnapshot: 'ri-global-line', upload: 'ri-upload-2-line',
  }[channel];
}
function channelLabel(channel: IntakeChannel): string {
  return i18nT({
    email: '邮件', whatsapp: 'WhatsApp', webform: '网页表单工单',
    websnapshot: '外部标讯快照', upload: '文件上传',
  }[channel]);
}
function stateLabel(value: ChannelState): string {
  return i18nT({ ready: '已连接', not_configured: '未配置', error: '连接失败', degraded: '部分可用' }[value]);
}
function statusLabel(status: IntakeItem['status']): string {
  return i18nT({ new: '新', merged: '已合并', assigned: '已建案', processing: '处理中' }[status]);
}
function statusTone(status: IntakeItem['status']): string {
  return { new: 'verdict-pending', merged: 'verdict-ok', assigned: 'verdict-ok', processing: 'verdict-partial' }[status];
}
function caseStatusLabel(status: string): string {
  return i18nT({
    received: '已接收', parsed: '已解析', analyzed: '已分析', drafted: '已起草',
    pending_approval: '待审批', approved: '已批准', approved_with_edits: '修改后批准',
    returned: '已退回', rejected: '已拒绝', reassigned: '已转交', delivered: '已交付（模拟）',
  }[status] || status);
}
function caseStatusTone(status: string): string {
  if (['approved', 'approved_with_edits', 'delivered'].includes(status)) return 'verdict-ok';
  if (['returned', 'rejected'].includes(status)) return 'verdict-fail';
  if (status === 'pending_approval') return 'verdict-partial';
  return 'verdict-pending';
}
function outputIcon(kind: string): string {
  return { word: 'ri-file-word-line', excel: 'ri-file-excel-line', pdf: 'ri-file-pdf-line', email: 'ri-mail-send-line' }[kind] || 'ri-file-line';
}
function shortTime(value?: string): string {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return `${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
}
function deadlineText(deadline?: string): string {
  if (!deadline) return '—';
  const days = Math.ceil((new Date(deadline).getTime() - Date.now()) / 86_400_000);
  if (Number.isNaN(days)) return deadline;
  return days >= 0 ? i18nT('{p0} 天', { p0: days }) : i18nT('已过期');
}
function deadlineTone(deadline?: string): string {
  if (!deadline) return '';
  const days = Math.ceil((new Date(deadline).getTime() - Date.now()) / 86_400_000);
  if (Number.isNaN(days)) return '';
  if (days <= 7) return 'urgent';
  if (days <= 14) return 'soon';
  return '';
}
async function copyText(text: string): Promise<void> {
  try {
    await navigator.clipboard.writeText(text);
    showToast(i18nT('已复制'));
  } catch { /* 剪贴板不可用时不打断演示 */ }
}
function showToast(message: string): void {
  toast.value = message;
  window.setTimeout(() => { if (toast.value === message) toast.value = ''; }, 3000);
}
function goSettings(): void {
  void router.push('/settings');
}
</script>

<style scoped>
/*
 * 根即滚动容器 —— 与 Education / Healthcare 等工作台同一套写法。
 * 外层 .page-wrap 是定高 + overflow:hidden，这里若只写 min-height:100% 而不自带 overflow-y，
 * 页面就完全不能用滚轮滚，超出的部分被父级裁掉、露出 .main-content 的深色底
 * （现象：第 3–5 步区块下面一条黑带 + 页脚糊在一起）。
 */
.saudi-workbench {
  background: #f7f9fb; color: #1b2733;
  height: 100%; min-height: 0; overflow-y: auto;
  padding-bottom: 40px;
}

.sd-hero {
  display: flex; align-items: flex-start; justify-content: space-between; gap: 24px;
  padding: 24px 28px 18px; background: #fff; border-bottom: 1px solid #e3e8ef;
}
.sd-eyebrow { font-size: 12px; color: #0e9e86; font-weight: 600; letter-spacing: .04em; }
.sd-hero h1 { font-size: 20px; line-height: 28px; margin: 6px 0 4px; }
.sd-hero p { margin: 0; color: #64748b; font-size: 13px; max-width: 760px; }
.sd-hero-meta { display: flex; gap: 14px; margin-top: 10px; font-size: 12px; color: #64748b; flex-wrap: wrap; }
.sd-hero-meta span { display: inline-flex; align-items: center; gap: 4px; }
.sd-hero-actions { display: flex; gap: 8px; flex-shrink: 0; flex-wrap: wrap; justify-content: flex-end; }
.sd-hbtn {
  border: 1px solid #e3e8ef; background: #fff; border-radius: 6px; padding: 7px 14px;
  font-size: 13px; color: #475467; cursor: pointer; display: inline-flex; align-items: center; gap: 5px;
}
.sd-hbtn.primary { background: #0e9e86; border-color: #0e9e86; color: #fff; }
.sd-hbtn:disabled { opacity: .5; cursor: not-allowed; }

/* UX 硬规则二：sticky，任何滚动位置都能看到当前第几步 */
.sd-stickybar {
  position: sticky; top: 0; z-index: 30;
  display: grid; gap: 6px; padding: 8px 28px 6px;
  background: rgba(255, 255, 255, .96); border-bottom: 1px solid #e3e8ef;
  backdrop-filter: blur(6px);
}
.sd-stickybar-row { display: flex; align-items: center; gap: 10px; }
.sd-progress-text { font-size: 12px; color: #475467; display: inline-flex; align-items: center; gap: 5px; white-space: nowrap; }
.sd-progress-bar { height: 5px; border-radius: 999px; background: #e3e8ef; overflow: hidden; }
.sd-progress-fill { display: block; height: 100%; background: #0e9e86; border-radius: 999px; transition: width .4s ease; }
.busy .sd-progress-fill {
  background-image: linear-gradient(90deg, transparent 0, rgba(255, 255, 255, .4) 50%, transparent 100%);
  background-size: 200% 100%; animation: sd-shimmer 1.4s linear infinite;
}
@keyframes sd-shimmer { 0% { background-position: 100% 50%; } 100% { background-position: 0 50%; } }
.sd-steps {
  display: flex; gap: 4px; flex: 1; min-width: 0; overflow-x: auto;
}
.sd-step {
  display: inline-flex; align-items: center; gap: 7px; border: none; background: none;
  padding: 6px 12px; border-radius: 999px; cursor: pointer; white-space: nowrap;
  font-size: 13px; color: #64748b;
}
.sd-step-index {
  width: 20px; height: 20px; border-radius: 999px; background: #e3e8ef; color: #475467;
  display: inline-flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 600;
}
.sd-step.step-done { color: #12805c; }
.sd-step.step-done .sd-step-index { background: #ecfdf3; color: #12805c; }
.sd-step.step-active { color: #0b7d6a; background: #e6f7f3; }
.sd-step.step-active .sd-step-index { background: #0e9e86; color: #fff; }
.sd-step.step-failed { color: #b42318; background: #fef3f2; }
.sd-step.step-failed .sd-step-index { background: #b42318; color: #fff; }
.sd-step-label em { display: block; font-style: normal; font-size: 11px; color: #b42318; }

.sd-section { margin: 18px 28px; background: #fff; border: 1px solid #e3e8ef; border-radius: 10px; padding: 18px 20px; scroll-margin-top: 70px; }
.sd-section.is-active { border-color: #0e9e86; box-shadow: 0 0 0 3px rgba(14, 158, 134, .14); }
.sd-section.is-done { border-color: #9ddccf; }
.sd-section.is-failed { border-color: #fda29b; }
.sd-section-head { display: flex; align-items: center; gap: 12px; margin-bottom: 14px; }
.sd-section-head h2 { font-size: 15px; margin: 0; }
.sd-step-no {
  width: 28px; height: 28px; border-radius: 999px; background: #f1f5f9; color: #475467; flex-shrink: 0;
  display: inline-flex; align-items: center; justify-content: center; font-weight: 700; font-size: 13px;
}
.sd-section.is-done .sd-step-no { background: #ecfdf3; color: #12805c; }
.sd-section.is-active .sd-step-no { background: #0e9e86; color: #fff; }
.sd-section.is-failed .sd-step-no { background: #b42318; color: #fff; }
.sd-state-pill { font-style: normal; font-size: 11px; font-weight: 700; padding: 3px 10px; border-radius: 999px; background: #f1f5f9; color: #64748b; white-space: nowrap; }
.sd-state-pill.active { background: #e6f7f3; color: #0b7d6a; }
.sd-state-pill.done { background: #ecfdf3; color: #12805c; }
.sd-state-pill.failed { background: #fef3f2; color: #b42318; }
.sd-fail-reason { font-style: normal; font-size: 12px; color: #b42318; }
.sd-actions { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; margin: 10px 0 0; }
.sd-summary { font-size: 12.5px; color: #12805c; display: inline-flex; align-items: center; gap: 5px; }
.sd-proof { border: 1px solid #c9ede5; background: #f4fdfb; border-radius: 10px; padding: 14px 16px; margin-top: 12px; }
.sd-proof-head { display: flex; gap: 10px; align-items: flex-start; }
.sd-proof-head > i { font-size: 20px; color: #0e9e86; }
.sd-proof-head strong { font-size: 13px; }
.sd-proof-head p { margin: 2px 0 0; font-size: 12px; color: #64748b; }
.sd-impact { margin-top: 12px; display: grid; gap: 6px; }
.sd-impact-row { display: flex; align-items: center; gap: 6px; flex-wrap: wrap; }
.sd-impact-row .sd-sub-title { margin: 0; }
.sd-alt { font-size: 12px; color: #94a3b8; }
.sd-section-actions { margin-left: auto; display: flex; gap: 8px; }
.sd-count { color: #64748b; font-size: 13px; margin-left: auto; }
.sd-head-spacer { flex: 1; }

.sd-channels { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 240px), 1fr)); gap: 12px; }
.sd-channel { border: 1px solid #e3e8ef; border-radius: 8px; padding: 12px 14px; background: #fbfdff; }
/* 文件上传卡整张都是落区/按钮，视觉上得让人看出来能点 */
.sd-channel.is-upload { cursor: pointer; }
.sd-channel.is-upload:hover { border-color: #0e9e86; background: #f4fdfb; }
.sd-channel.is-dropping { border-color: #0e9e86; border-style: dashed; background: #e6f7f3; }
.sd-channel-head { display: flex; align-items: center; gap: 6px; font-size: 13px; }
.sd-channel-head strong { flex: 1; }
.sd-state-dot { width: 8px; height: 8px; border-radius: 999px; background: #94a3b8; }
.sd-channel.state-ready .sd-state-dot { background: #12805c; }
.sd-channel.state-error .sd-state-dot { background: #b42318; }
.sd-channel.state-degraded .sd-state-dot { background: #b45309; }
.sd-state-text { font-size: 12px; color: #64748b; }
.sd-channel-detail { font-size: 12px; color: #475467; margin: 8px 0 4px; word-break: break-all; }
.sd-channel-next { font-size: 11px; color: #b45309; margin: 0 0 4px; }
.sd-channel-sync { font-size: 11px; color: #94a3b8; margin: 0 0 6px; }
.sd-channel-foot { display: flex; justify-content: space-between; align-items: center; gap: 8px; }
.sd-link { background: none; border: none; color: #0e9e86; cursor: pointer; font-size: 12px; padding: 0; }
.sd-link:disabled { color: #94a3b8; cursor: not-allowed; }
.sd-channel-hint { font-size: 11px; color: #94a3b8; }
.sd-hint { font-size: 12px; color: #64748b; margin: 12px 0 0; line-height: 18px; }

.sd-group { border: 1px solid #fde68a; background: #fffbf0; border-radius: 8px; padding: 12px; margin-bottom: 12px; }
.sd-group-head { display: flex; align-items: center; gap: 8px; font-size: 13px; flex-wrap: wrap; }
.sd-group-customer { color: #64748b; }
.sd-link-chip { background: #f5f3ff; color: #6d28d9; border-radius: 999px; padding: 1px 8px; font-size: 12px; }
.sd-group-sources { display: flex; gap: 8px; margin-top: 8px; flex-wrap: wrap; }
.sd-merge-detail { margin-top: 10px; background: #fff; border-radius: 6px; padding: 10px; }
.sd-sub-title { font-size: 12px; font-weight: 600; color: #475467; margin: 10px 0 6px; }
.sd-reason-row { display: flex; justify-content: space-between; font-size: 12px; color: #475467; padding: 2px 0; }
.sd-reason-total { border-top: 1px solid #eef2f6; margin-top: 6px; padding-top: 6px; font-size: 12px; }

.sd-table-wrap { overflow-x: auto; }
.sd-table { width: 100%; border-collapse: collapse; font-size: 13px; }
.sd-table th { background: #f1f5f9; color: #475467; text-align: left; padding: 8px 10px; font-weight: 600; white-space: nowrap; }
.sd-table td { padding: 9px 10px; border-bottom: 1px solid #eef2f6; vertical-align: top; }
.sd-table.intake tbody tr { cursor: pointer; }
.sd-table.intake tbody tr:hover { background: #f8fafc; }
.sd-table.intake tbody tr.active { background: #e6f7f3; }
.sd-ticket-line { font-size: 11px; color: #6d28d9; margin-top: 3px; display: flex; align-items: center; gap: 4px; }
.sd-attach-line { font-size: 11px; color: #94a3b8; margin-top: 3px; display: flex; gap: 10px; flex-wrap: wrap; }
.sd-deadline.urgent { color: #b42318; font-weight: 600; }
.sd-deadline.soon { color: #b45309; }

.sd-source-chip {
  display: inline-flex; align-items: center; gap: 4px; font-size: 12px;
  padding: 1px 8px; border-radius: 999px; background: #f1f5f9; color: #475467;
}
.sd-source-chip.ch-email { background: #eff6ff; color: #1d4ed8; }
.sd-source-chip.ch-whatsapp { background: #ecfdf3; color: #12805c; }
.sd-source-chip.ch-webform { background: #f5f3ff; color: #6d28d9; }
.sd-source-chip.ch-websnapshot { background: #fff4ed; color: #c2410c; }
/* 发送复核 */
.sd-mail-approval {
  display: flex; align-items: center; gap: 10px; margin: 0 0 10px;
  padding: 8px 12px; border-radius: 8px; font-size: 12.5px;
  background: #eff6ff; border: 1px solid #bfdbfe; color: #1d4ed8;
}
.sd-mail-approval-text { flex: 1; display: flex; flex-direction: column; gap: 1px; }
.sd-mail-approval-text em { font-style: normal; font-size: 11px; opacity: .75; }

.sd-send-file { display: flex; align-items: center; gap: 8px; margin-bottom: 12px; font-size: 13px; }
/* 一键发送：标题行右侧放按钮；附件清单可勾选 */
.sd-sub-title-row { display: flex; align-items: center; justify-content: space-between; gap: 12px; }
.sd-send-batch { margin-bottom: 12px; }
.sd-send-batch .sd-check { display: flex; align-items: center; gap: 8px; padding: 4px 0; font-size: 13px; }
.sd-check { display: flex; align-items: center; gap: 6px; font-size: 13px; color: #475467; margin: 6px 0 4px; }
.sd-warn { color: #b42318; }
.sd-mode:disabled, .sd-mode.disabled { opacity: .5; cursor: not-allowed; }

/* 交付目录 */
.sd-dirs { margin-bottom: 6px; }
.sd-dir-row { display: flex; align-items: center; gap: 8px; margin-bottom: 8px; font-size: 13px; }
.sd-dir-label { color: #475467; white-space: nowrap; }
.sd-dir-path {
  flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
  background: #f1f5f9; border-radius: 5px; padding: 4px 8px; font-size: 12px; color: #1b2733;
}

/* hero 右侧的本模块概览（紧凑版：KPI 一排 + 最近 3 条） */
.sd-hero-side { display: flex; flex-direction: column; gap: 12px; align-items: stretch; width: 100%; min-width: 0; }
.sd-hero-overview { width: 100%; }
.sd-kpis { display: flex; gap: 8px; justify-content: flex-end; }
.sd-kpi {
  display: flex; align-items: baseline; gap: 5px;
  border: 1px solid #e3e8ef; border-radius: 8px; padding: 5px 12px; background: #fff;
  cursor: pointer;
}
.sd-kpi:hover { border-color: #0e9e86; }
.sd-kpi b { font-size: 17px; font-weight: 700; color: #1b2733; }
.sd-kpi.warn b { color: #b45309; }
.sd-kpi span { font-size: 12px; color: #64748b; }
.sd-recent-row {
  display: flex; align-items: center; gap: 8px; width: 100%; text-align: left;
  padding: 3px 6px; border: none; background: none; cursor: pointer; border-radius: 5px; font-size: 12px;
}
.sd-recent-row:hover { background: #f1f5f9; }
.sd-recent-subject { flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; color: #1b2733; }
.sd-recent-status { font-size: 11px; color: #64748b; flex-shrink: 0; }

/*
 * 第 1 步紧凑化：一张通道卡压成一行（图标+名称+状态 / 一句话 / 操作），
 * 整块高度从原来的三行卡降到一行多一点，把纵向空间还给收件箱与工作台。
 */
.sd-channel-summary { font-size: 12px; color: #64748b; margin-left: 10px; }
.sd-section-compact { padding-top: 12px; padding-bottom: 12px; }
.sd-section-compact .sd-channels { grid-template-columns: repeat(auto-fit, minmax(min(100%, 280px), 1fr)); gap: 8px; }
.sd-section-compact .sd-channel { padding: 8px 12px; }
.sd-section-compact .sd-channel-head { margin-bottom: 2px; }
.sd-section-compact .sd-channel-detail { font-size: 12px; margin: 0; }
.sd-section-compact .sd-channel-next,
.sd-section-compact .sd-channel-hint,
.sd-section-compact .sd-channel-auto,
.sd-section-compact .sd-channel-sync { font-size: 11px; margin: 2px 0 0; }
.sd-section-compact .sd-channel-foot { margin-top: 4px; }
.sd-section-compact .sd-hint { margin-top: 8px; font-size: 12px; }

/* 收件箱分页 */
.sd-pager { display: flex; align-items: center; gap: 10px; margin-top: 10px; }
.sd-pager-info { font-size: 12px; color: #64748b; }
.sd-pager-size {
  border: 1px solid #e3e8ef; border-radius: 6px; padding: 5px 8px; font-size: 12px;
  background: #fff; color: #1b2733;
}

/* 建档方式 */
.sd-filing { display: flex; align-items: center; gap: 10px; margin-bottom: 10px; flex-wrap: wrap; }
.sd-filing-label { font-size: 13px; color: #475467; }
/*
 * 二选一分段控件。此前 .sd-segmented 一条样式都没有，两个 <button> 直接吃浏览器
 * 默认外观（灰底斜角），跟这一屏其它控件完全不是一套东西 —— 用户报「太丑」。
 * 做法：外壳一个浅色槽，选中项用白片 + 阴影浮起来，跟 macOS 分段控件同一个心智。
 */
.sd-segmented {
  display: inline-flex;
  padding: 2px;
  gap: 2px;
  border-radius: 8px;
  background: #eef2f7;
  border: 1px solid #e3e8ef;
}
.sd-segmented button {
  appearance: none;
  border: 0;
  background: transparent;
  padding: 5px 14px;
  border-radius: 6px;
  font-size: 12.5px;
  font-family: inherit;
  color: #64748b;
  cursor: pointer;
  white-space: nowrap;
  transition: background .15s ease, color .15s ease, box-shadow .15s ease;
}
.sd-segmented button:hover:not(.active) { color: #1b2733; }
.sd-segmented button.active {
  background: #fff;
  color: var(--sd-accent, #4f46e5);
  font-weight: 600;
  box-shadow: 0 1px 2px rgba(16, 24, 40, .1);
}
.sd-segmented button:focus-visible {
  outline: 2px solid var(--sd-accent, #4f46e5);
  outline-offset: 1px;
}
.sd-filing-hint { font-size: 12px; color: #64748b; }
.sd-channel-auto { margin: 4px 0 0; font-size: 11px; color: #12805c; display: flex; align-items: center; gap: 4px; }

/* 收件箱分类分野 */
.sd-filters { display: flex; align-items: center; gap: 8px; margin-bottom: 12px; }
.sd-filters select, .sd-filters input {
  border: 1px solid #e3e8ef; border-radius: 6px; padding: 6px 10px; font-size: 13px;
  background: #fff; color: #1b2733; min-width: 132px;
}
.sd-filters input { flex: 0 1 240px; }
.sd-filter-count { font-size: 12px; color: #64748b; }
.sd-bucket { margin-bottom: 14px; }
.sd-bucket-head { display: flex; align-items: center; gap: 8px; margin-bottom: 6px; }
.sd-bucket-head em { font-style: normal; font-size: 12px; color: #64748b; }
.sd-caseno {
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: 12px;
  background: #eef2ff; color: #3730a3; border-radius: 5px; padding: 2px 8px; margin-right: 8px;
}
.sd-caseno-cell {
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: 12px;
  color: #475467; white-space: nowrap;
}
/* 1440×900 不许横向滚动：窄屏优先砍次要列（UX 硬规则），不压字号 */
@container main-page (max-width: 1400px) { .sd-table .col-optional { display: none; } }

.sd-row-actions { display: flex; align-items: center; gap: 6px; justify-content: flex-end; }
.sd-icon-btn {
  border: 1px solid #e3e8ef; background: #fff; border-radius: 6px; padding: 5px 8px;
  color: #94a3b8; cursor: pointer; line-height: 1;
}
.sd-icon-btn:hover { border-color: #b42318; color: #b42318; }
.sd-ext-line { font-size: 11px; color: #64748b; margin-top: 3px; display: flex; align-items: center; gap: 6px; flex-wrap: wrap; }
.sd-ext-line em { font-style: normal; color: #94a3b8; }
.sd-ext-link { color: #0e9e86; text-decoration: none; }
.sd-ext-link:hover { text-decoration: underline; }
.sd-source-chip em { font-style: normal; font-family: ui-monospace, monospace; font-size: 10px; opacity: .8; }
.sd-source-chip em.sim { color: #7c3aed; }
.sd-sim-chip { background: #f5f3ff; color: #7c3aed; font-size: 11px; padding: 1px 6px; border-radius: 999px; margin-left: 4px; }
.sd-pill { display: inline-block; padding: 1px 8px; border-radius: 999px; font-size: 12px; white-space: nowrap; }
.verdict-ok { background: #ecfdf3; color: #12805c; }
.verdict-partial { background: #fffaeb; color: #b45309; }
.verdict-fail { background: #fef3f2; color: #b42318; }
.verdict-pending { background: #f2f4f7; color: #475467; }

.sd-ticket-detail { border: 1px solid #ddd6fe; background: #faf9ff; border-radius: 8px; padding: 14px; margin-top: 14px; }
.sd-ticket-head { display: flex; align-items: center; gap: 10px; font-size: 13px; margin-bottom: 10px; flex-wrap: wrap; }
.sd-fields { width: 100%; border-collapse: collapse; }
.sd-fields th { text-align: left; font-weight: 500; color: #64748b; font-size: 13px; padding: 5px 12px 5px 0; width: 132px; }
.sd-fields td { padding: 5px 0; font-size: 13px; }
.sd-sql { display: flex; align-items: center; gap: 8px; margin-top: 10px; font-size: 12px; }
.sd-sql code {
  flex: 1; background: #f1f5f9; border-radius: 6px; padding: 6px 10px;
  font-family: ui-monospace, monospace; font-size: 11px; color: #475467; overflow-x: auto; white-space: nowrap;
}
.sd-ticket-test { margin-top: 12px; border-top: 1px solid #eef2f6; padding-top: 12px; }

.workspace-section { padding-bottom: 8px; }
.sd-empty, .sd-right-empty { text-align: center; color: #94a3b8; padding: 40px 0; }
.sd-empty i, .sd-right-empty i { font-size: 30px; }
.sd-empty p, .sd-right-empty p { font-size: 13px; margin: 8px 0 0; }
.sd-empty-actions { display: flex; gap: 8px; justify-content: center; margin-top: 12px; }

.sd-workspace { display: grid; grid-template-columns: 200px minmax(0, 1fr) 400px; gap: 16px; align-items: start; }
.sd-timeline-col { position: sticky; top: 68px; }
.sd-wf-step { display: flex; gap: 8px; padding: 8px 0; }
.sd-wf-dot {
  width: 20px; height: 20px; border-radius: 999px; background: #e3e8ef; color: #fff;
  display: inline-flex; align-items: center; justify-content: center; font-size: 12px; flex-shrink: 0;
}
.sd-wf-step.wf-done .sd-wf-dot { background: #12805c; }
.sd-wf-step.wf-active .sd-wf-dot { background: #0e9e86; }
.sd-wf-step.wf-failed .sd-wf-dot { background: #b42318; }
.sd-wf-step strong { display: block; font-size: 13px; }
.sd-wf-step small { font-size: 11px; color: #94a3b8; }
.sd-wf-step small.fail { color: #b42318; }
.sd-impact-summary { margin-top: 16px; background: #f8fafc; border-radius: 8px; padding: 10px; }
.sd-impact-summary p { font-size: 12px; color: #475467; margin: 0 0 6px; }

.sd-cards-col { min-width: 0; }
.sd-approval-bar {
  display: flex; align-items: center; gap: 8px; flex-wrap: wrap;
  background: #fff; border: 1px solid #e3e8ef; border-radius: 8px; padding: 10px 14px; margin-bottom: 14px;
}
.sd-approval-owner { font-size: 12px; color: #64748b; }
.sd-extract-bar {
  display: flex; gap: 8px; align-items: center; flex-wrap: wrap; font-size: 12px; color: #475467;
  background: #f8fafc; border: 1px solid #e3e8ef; border-radius: 8px; padding: 8px 12px; margin: 0 0 14px;
}
.sd-extract-bar em.warn { font-style: normal; color: #b45309; }
.sd-extract-warn { color: #b45309; background: #fffaeb; border-radius: 4px; padding: 1px 6px; }

.sd-right-col {
  position: sticky; top: 68px; border: 1px solid #e3e8ef; border-radius: 8px;
  background: #fff; max-height: calc(100vh - 96px); display: flex; flex-direction: column; overflow: hidden;
}
.sd-right-tabs { display: flex; border-bottom: 1px solid #e3e8ef; }
.sd-right-tabs button {
  flex: 1; border: none; background: none; padding: 9px 0; cursor: pointer;
  font-size: 13px; color: #64748b; border-bottom: 2px solid transparent;
}
.sd-right-tabs button.active { color: #0b7d6a; border-bottom-color: #0e9e86; font-weight: 600; }
.sd-right-tabs em { font-style: normal; font-size: 11px; color: #94a3b8; }
.sd-right-body { padding: 12px; overflow-y: auto; min-height: 0; }

.sd-ev-mini { border-bottom: 1px solid #eef2f6; padding: 10px 0; }
.sd-ev-mini.conflict { background: #fffbf0; border-radius: 6px; padding: 10px; }
.sd-ev-mini-head { display: flex; justify-content: space-between; gap: 8px; font-size: 13px; }
.sd-ev-mini p { font-size: 12px; color: #475467; margin: 4px 0; }
.sd-evidence-meta { display: flex; flex-wrap: wrap; gap: 8px; font-size: 11px; color: #94a3b8; align-items: center; }

.sd-diff-head { display: flex; gap: 8px; align-items: center; font-size: 12px; color: #475467; margin-bottom: 10px; flex-wrap: wrap; }
.sd-diff-row {
  display: grid; grid-template-columns: 1fr auto 14px auto; gap: 6px; align-items: baseline;
  padding: 6px 8px; border-radius: 4px; font-size: 12px;
}
/* 未变的必须真的没有底色 —— 这是 Proof Switch 说服力的来源 */
.sd-diff-row.changed { background: #fffaeb; }
.sd-diff-label { color: #475467; }
.sd-diff-before { color: #94a3b8; text-decoration: line-through; }
.sd-diff-after { color: #1b2733; font-weight: 600; }
.sd-diff-row em { grid-column: 1 / -1; font-style: normal; color: #cbd5e1; font-size: 11px; }
.sd-diff-row:not(.changed) .sd-diff-before,
.sd-diff-row:not(.changed) .sd-diff-after { color: #94a3b8; font-weight: 400; text-decoration: none; }

.sd-drawer-field { display: flex; flex-direction: column; gap: 5px; font-size: 13px; }
.sd-drawer-field label { color: #475467; }
.sd-drawer-field select, .sd-drawer-field input, .sd-drawer-field textarea {
  border: 1px solid #e3e8ef; border-radius: 6px; padding: 7px 10px; font-size: 13px; font-family: inherit; color: #1b2733;
}
.sd-drawer-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
.sd-preset-row { display: flex; flex-wrap: wrap; gap: 6px; }
.sd-hbtn-tag { font-style: normal; font-size: 11px; color: #0e9e86; background: #e6f7f3; border-radius: 999px; padding: 0 6px; }
.sd-pack-tabs { display: flex; gap: 6px; border-bottom: 1px solid #e3e8ef; padding-bottom: 8px; }
.sd-pack-tabs button {
  border: none; background: none; cursor: pointer; font-size: 13px; color: #64748b;
  padding: 4px 10px; border-radius: 6px;
}
.sd-pack-tabs button.active { background: #e6f7f3; color: #0b7d6a; font-weight: 600; }
.sd-pack-tabs em { font-style: normal; font-size: 11px; opacity: .7; }
.sd-cell-input {
  width: 100%; border: 1px solid transparent; background: transparent; border-radius: 4px;
  padding: 2px 4px; font-size: 12px; font-family: inherit; color: #1b2733;
}
.sd-cell-input:focus { border-color: #0e9e86; background: #fff; outline: none; }
.sd-cell-input.mono { font-family: ui-monospace, monospace; }
.sd-cell-input.num { text-align: right; font-variant-numeric: tabular-nums; }
.sd-cell-input.narrow { max-width: 90px; }
.sd-weight-bar { height: 8px; background: #e3e8ef; border-radius: 999px; overflow: hidden; min-width: 120px; }
.sd-weight-bar i { display: block; height: 100%; background: #0e9e86; }
.sd-weight-warn { color: #b45309; font-size: 11px; }
.sd-city-row { display: grid; grid-template-columns: 1fr 80px 80px; gap: 6px; align-items: center; margin-bottom: 4px; font-size: 12px; }
.sd-field-note { font-style: normal; color: #94a3b8; font-size: 11px; }
.sd-upload-mock { display: flex; align-items: center; gap: 8px; font-size: 13px; color: #475467; }

/* 常用平台预置 */
.sd-preset-list { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 260px), 1fr)); gap: 8px; margin-bottom: 6px; }
.sd-preset {
  text-align: left; cursor: pointer; display: flex; flex-direction: column; gap: 3px;
  border: 1px solid #e3e8ef; border-radius: 8px; padding: 10px 12px; background: #fff;
}
.sd-preset:hover { border-color: #0e9e86; background: #f4fdfb; }
.sd-preset strong { font-size: 13px; color: #1b2733; }
.sd-preset span { font-size: 11px; color: #0e9e86; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.sd-preset em { font-style: normal; font-size: 11px; color: #64748b; }
.sd-count-inline { font-style: normal; font-size: 12px; color: #64748b; margin-left: 6px; }

/* 工单取数二选一 */
.sd-modes { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 14px; }
.sd-mode {
  position: relative; text-align: left; cursor: pointer;
  border: 1px solid #e3e8ef; border-radius: 8px; padding: 12px 14px; background: #fff;
  display: flex; flex-direction: column; gap: 4px;
}
.sd-mode i { font-size: 18px; color: #64748b; }
.sd-mode strong { font-size: 13px; color: #1b2733; }
.sd-mode span { font-size: 12px; color: #64748b; line-height: 1.5; }
.sd-mode.active { border-color: #0e9e86; background: #f4fdfb; }
.sd-mode.active i { color: #0e9e86; }
.sd-mode.active::after {
  content: '✓'; position: absolute; top: 8px; right: 10px;
  color: #0e9e86; font-weight: 700; font-size: 13px;
}
.sd-saved-tag {
  margin-left: 6px; font-size: 11px; font-style: normal;
  background: #ecfdf3; color: #12805c; border-radius: 999px; padding: 1px 7px;
}
.sd-adv { margin-top: 10px; }
.sd-adv summary { cursor: pointer; font-size: 12px; color: #0e9e86; margin-bottom: 8px; }

/* WhatsApp 绑定弹层 */
.sd-wa-stage {
  display: flex; align-items: center; gap: 8px; margin: 4px 0 12px;
  padding: 8px 12px; border-radius: 6px; font-size: 13px;
  background: #f1f5f9; color: #475467;
}
.sd-wa-stage.stage-paired { background: #ecfdf3; color: #12805c; }
.sd-wa-stage.stage-failed, .sd-wa-stage.stage-expired { background: #fef3f2; color: #b42318; }
.sd-wa-qr { text-align: center; padding: 12px 0; }
.sd-wa-qr img {
  width: 232px; height: 232px; image-rendering: pixelated;
  border: 1px solid #e3e8ef; border-radius: 8px; background: #fff; padding: 8px;
}
.sd-wa-qr p { margin: 10px 0 0; font-size: 12px; color: #64748b; }
.sd-wa-booting { display: flex; flex-direction: column; align-items: center; gap: 10px; padding: 28px 0; color: #64748b; font-size: 13px; }
.sd-wa-booting i { font-size: 24px; color: #0e9e86; }
.sd-wa-paired { display: flex; gap: 10px; align-items: flex-start; padding: 14px; border-radius: 8px; background: #ecfdf3; }
.sd-wa-paired i { font-size: 20px; color: #12805c; }
.sd-wa-paired p { margin: 4px 0 0; font-size: 12px; color: #475467; }
.sd-receipt {
  background: #f8fafc; border: 1px solid #e3e8ef; border-radius: 8px; padding: 12px;
  font-family: inherit; font-size: 12px; white-space: pre-wrap; color: #1b2733;
}
.sd-output-row.is-history { opacity: .68; padding-inline-start: 18px; }
.sd-btn.danger { color: #dc2626; }
.sd-btn.danger:hover { background: rgba(220, 38, 38, .1); border-color: rgba(220, 38, 38, .35); }
.sd-output-row { display: flex; align-items: center; gap: 10px; padding: 8px 0; border-bottom: 1px solid #eef2f6; font-size: 13px; }
.sd-output-name { flex: 1; }
.sd-output-version { color: #64748b; font-size: 12px; }
.sd-badge { font-size: 12px; padding: 2px 8px; border-radius: 999px; background: #f1f5f9; color: #475467; }
.sd-badge.tone-ok { background: #ecfdf3; color: #12805c; }
.sd-badge.tone-warn { background: #fffaeb; color: #b45309; }
.sd-doc-error { color: #b42318; font-size: 12px; }

/* ── 交付物大纲（P1-1 大纲先行）────────────────────────────────────────── */
.sd-ol-status {
  display: flex; align-items: center; gap: 8px; padding: 10px 12px;
  border-radius: 8px; font-size: 13px; margin-bottom: 12px;
}
.sd-ol-status.ok { background: #ecfdf3; color: #12805c; }
.sd-ol-status.todo { background: #fffaeb; color: #b45309; }
.sd-ol-input {
  width: 100%; border: 1px solid #e3e8ef; border-radius: 6px; padding: 6px 10px;
  font-size: 13px; font-family: inherit; color: #1b2733; background: #fff;
}
.sd-ol-area {
  width: 100%; border: 1px solid #e3e8ef; border-radius: 6px; padding: 6px 10px;
  font-size: 12px; font-family: inherit; color: #475467; resize: vertical; background: #fff;
}
.sd-ol-two { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.sd-ol-sec {
  border: 1px solid #e3e8ef; border-radius: 8px; padding: 10px; margin-bottom: 8px; background: #fbfcfe;
}
.sd-ol-sec.pending { border-color: #fec84b; background: #fffcf5; }
.sd-ol-sec-head { display: flex; align-items: center; gap: 8px; margin-bottom: 6px; }
.sd-ol-no {
  width: 20px; height: 20px; border-radius: 999px; background: #eef2f6; color: #475467;
  font-size: 11px; display: inline-flex; align-items: center; justify-content: center; flex-shrink: 0;
}
.sd-ol-evi { display: flex; align-items: center; gap: 6px; font-size: 11px; color: #64748b; margin-top: 6px; }
.sd-ol-evi-none { color: #b45309; }
.sd-ol-actions { display: flex; gap: 8px; margin-top: 14px; }
.sd-btn.primary { background: var(--sd-accent, #4f46e5); color: #fff; border-color: transparent; }
.sd-btn.primary:disabled { opacity: .5; cursor: not-allowed; }

/* ── 交付物校验报告（P0-1）──────────────────────────────────────────────── */
.sd-badge-btn { border: 0; cursor: pointer; display: inline-flex; align-items: center; gap: 4px; font-family: inherit; }
.sd-badge-btn:hover { filter: brightness(0.96); }
.sd-vd-head {
  display: flex; align-items: center; gap: 8px; padding: 10px 12px; border-radius: 8px;
  font-size: 13px; margin-bottom: 12px;
}
.sd-vd-head.ok { background: #ecfdf3; color: #12805c; }
.sd-vd-head.bad { background: #fef3f2; color: #b42318; }
.sd-vd-head i { font-size: 16px; }
.sd-vd-head span { color: inherit; opacity: .8; font-size: 12px; }
.sd-vd-issue {
  border-left: 3px solid #f04438; background: #fff; padding: 8px 12px; margin-bottom: 8px;
  border-radius: 0 6px 6px 0; box-shadow: 0 1px 2px rgba(16, 24, 40, .05);
}
.sd-vd-issue.warn { border-left-color: #f79009; }
.sd-vd-loc { font-size: 12px; font-weight: 600; color: #1b2733; }
.sd-vd-msg { font-size: 12px; color: #475467; margin-top: 2px; }
.sd-vd-delta { font-size: 12px; color: #64748b; margin-top: 4px; display: flex; gap: 14px; }
.sd-vd-delta b { color: #1b2733; font-variant-numeric: tabular-nums; }
.sd-vd-checks { display: grid; grid-template-columns: repeat(auto-fill, minmax(min(100%, 240px), 1fr)); gap: 6px; }
.sd-vd-check { display: flex; align-items: center; gap: 6px; font-size: 12px; color: #475467; }
.sd-vd-check em { margin-left: auto; font-style: normal; color: #98a2b3; font-size: 11px; }
.sd-vd-check.off { opacity: .55; }

.sd-btn {
  border: 1px solid #e3e8ef; background: #fff; border-radius: 6px; padding: 5px 12px;
  font-size: 12px; color: #475467; cursor: pointer; display: inline-flex; align-items: center; gap: 4px;
}
.sd-btn:hover { border-color: #0e9e86; color: #0e9e86; }
.sd-btn.primary { background: #0e9e86; border-color: #0e9e86; color: #fff; }
.sd-btn.primary:hover { background: #0b7d6a; color: #fff; }
.sd-btn.ghost { border-color: transparent; background: #f8fafc; }
.sd-btn:disabled { opacity: .5; cursor: not-allowed; }
.sd-btn em { font-style: normal; color: inherit; opacity: .7; }

.sd-send-error {
  display: flex; align-items: flex-start; gap: 6px;
  margin: 8px 0 0; padding: 8px 10px; border-radius: 8px;
  font-size: 12.5px; color: var(--color-danger, #b42318);
  background: color-mix(in srgb, var(--color-danger, #b42318) 8%, transparent);
}

.sd-toast {
  /*
   * z-index 必须**高于 TModal（3000）**。
   *
   * 原来是 80：只要有弹层开着，toast 就被压在弹层遮罩下面 —— 用户看到的是
   * 「点了确定什么反应都没有」，而实际上提示早就弹出来了（比如「该文件仍是草稿，
   * 需先完成审批才能发送」），只是被挡住。发送复核、生成文件、大纲、审批这些
   * 操作全都在弹层里点，也就是说**这些场景的所有反馈都看不见**。
   * 比 DialogHost（5000）低一档，确认框仍然盖在 toast 之上。
   */
  position: fixed; bottom: 24px; left: 50%; transform: translateX(-50%);
  background: #1b2733; color: #fff; padding: 9px 18px; border-radius: 999px;
  font-size: 13px; z-index: 4000; box-shadow: 0 12px 32px rgba(16, 24, 40, .2); max-width: 80vw;
}

.spin { animation: sd-spin 1s linear infinite; }
@keyframes sd-spin { to { transform: rotate(360deg); } }

@container main-page (max-width: 1360px) {
  .sd-workspace { grid-template-columns: 180px minmax(0, 1fr) 340px; }
}

/* ── 阿拉伯语 RTL ─────────────────────────────────────────────────────────────
   界面镜像后有三处会错位：抽屉从左侧滑出、表格文字仍左对齐、审批条按钮堆在左边。
   数据单元格已在模板上加 dir="auto"，混排的拉丁型号（DS-2CD2T47G2）不会被翻转。 */
.saudi-workbench[dir='rtl'] .sd-table th,
.saudi-workbench[dir='rtl'] .sd-fields th { text-align: right; }
.saudi-workbench[dir='rtl'] .sd-section-actions,
.saudi-workbench[dir='rtl'] .sd-count { margin-left: 0; margin-right: auto; }
.saudi-workbench[dir='rtl'] .sd-hero-actions { justify-content: flex-start; }
.saudi-workbench[dir='rtl'] .sd-sim-chip,
.saudi-workbench[dir='rtl'] .sd-source-chip em { margin-left: 0; margin-right: 4px; }
.saudi-workbench[dir='rtl'] .sd-diff-row { direction: rtl; }

/* ── 解决方案视觉系统 ────────────────────────────────────────────────────────
   三页共享业务 DOM 和事件，只用 module class 改信息拓扑与视觉语言。
   所有颜色从全局主题 token 派生，系统/手动主题切换时同步变化。 */
.saudi-workbench {
  --sd-bg: var(--color-bg-primary);
  --sd-surface: var(--color-bg-card);
  --sd-surface-raised: var(--color-bg-elevated);
  --sd-surface-soft: var(--color-bg-input);
  --sd-surface-hover: var(--color-bg-hover);
  --sd-text: var(--color-text-primary);
  --sd-text-soft: var(--color-text-secondary);
  --sd-text-muted: var(--color-text-muted);
  --sd-border: var(--color-border);
  --sd-divider: var(--color-divider);
  --sd-accent: var(--color-brand);
  --sd-accent-strong: var(--color-brand-hover);
  --sd-accent-soft: var(--color-brand-subtle);
  --sd-accent-glow: var(--color-brand-glow);
  --sd-success: var(--color-success);
  --sd-warning: var(--color-warning);
  --sd-danger: var(--color-danger);
  --sd-info: var(--color-info);
  --sd-success-soft: var(--color-status-success-bg);
  --sd-warning-soft: var(--color-status-warning-bg);
  --sd-danger-soft: var(--color-status-danger-bg);
  --sd-info-soft: var(--color-status-info-bg);
  background: var(--sd-bg);
  color: var(--sd-text);
}

.sd-module-rfq-quote {
  --sd-accent: var(--color-brand-secondary);
  --sd-accent-strong: color-mix(in srgb, var(--color-brand-secondary) 76%, var(--color-text-primary));
  --sd-accent-soft: color-mix(in srgb, var(--color-brand-secondary) 13%, transparent);
  --sd-accent-glow: color-mix(in srgb, var(--color-brand-secondary) 24%, transparent);
}

.sd-module-bid-decision {
  --sd-accent: var(--color-brand);
  --sd-accent-strong: var(--color-brand-hover);
}

.sd-module-advisory-report {
  --sd-accent: color-mix(in srgb, var(--color-brand) 58%, var(--color-brand-secondary));
  --sd-accent-strong: color-mix(in srgb, var(--color-brand-hover) 68%, var(--color-brand-secondary));
  --sd-accent-soft: color-mix(in srgb, var(--color-brand-secondary) 10%, var(--color-brand-subtle));
  --sd-accent-glow: color-mix(in srgb, var(--color-brand-secondary) 22%, transparent);
}

.sd-hero {
  position: relative;
  isolation: isolate;
  overflow: hidden;
  color: var(--sd-text);
  background: var(--sd-surface);
  border-color: var(--sd-border);
}
.sd-hero::before,
.sd-hero::after { content: ''; position: absolute; pointer-events: none; z-index: -1; }
.sd-hero-copy { min-width: 0; }
.sd-hero h1 { color: var(--sd-text); text-wrap: balance; letter-spacing: -.018em; }
.sd-hero p { color: var(--sd-text-soft); line-height: 1.55; text-wrap: pretty; }
.sd-eyebrow { color: var(--sd-accent-strong); letter-spacing: .02em; }
.sd-hero-actions { position: relative; z-index: 1; }

.sd-hero-visual { position: relative; min-width: 190px; height: 112px; pointer-events: none; }
.sd-quote-visual, .sd-bid-visual, .sd-advisory-visual { position: absolute; inset: 0; }
.sd-visual-orb {
  position: absolute; left: 4px; top: 22px; width: 58px; height: 58px; border-radius: 50%;
  display: grid; place-items: center; color: var(--sd-accent-strong); font-size: 25px;
  background: var(--sd-accent-soft); box-shadow: inset 0 0 0 1px var(--sd-accent-glow);
}
.sd-quote-sheet {
  position: absolute; right: 12px; top: 7px; width: 116px; height: 92px; padding: 17px 14px;
  display: grid; align-content: start; gap: 8px; border-radius: 8px;
  background: var(--sd-surface-raised); border: 1px solid var(--sd-border); transform: rotate(3deg);
}
.sd-quote-sheet::before { content: ''; position: absolute; left: 14px; top: 10px; width: 26px; height: 4px; border-radius: 4px; background: var(--sd-accent); }
.sd-quote-sheet i { display: block; height: 3px; border-radius: 3px; background: var(--sd-divider); }
.sd-quote-sheet i:nth-child(2) { width: 72%; }
.sd-quote-sheet i:nth-child(3) { width: 88%; }
.sd-quote-sheet i:nth-child(4) { width: 55%; }
.sd-quote-sheet b { position: absolute; right: 10px; bottom: 8px; color: var(--sd-accent-strong); font: 700 11px/1 var(--font-mono); }
.sd-quote-link {
  position: absolute; left: 58px; top: 43px; width: 56px; height: 2px; background: var(--sd-accent-glow);
}
.sd-quote-link i { position: absolute; right: -8px; top: -8px; color: var(--sd-accent); font-size: 17px; }

.sd-bid-ring { position: absolute; left: 50%; top: 50%; border: 1px solid var(--sd-accent-glow); border-radius: 50%; transform: translate(-50%, -50%); }
.sd-bid-ring.ring-a { width: 102px; height: 102px; }
.sd-bid-ring.ring-b { width: 154px; height: 78px; transform: translate(-50%, -50%) rotate(-18deg); }
.sd-bid-core {
  position: absolute; left: 50%; top: 50%; width: 58px; height: 58px; border-radius: 14px;
  display: grid; place-items: center; transform: translate(-50%, -50%) rotate(45deg);
  background: var(--sd-accent); color: var(--color-text-inverse);
  box-shadow: 0 0 28px var(--sd-accent-glow);
}
.sd-bid-core i { font-size: 24px; transform: rotate(-45deg); }
.sd-bid-node { position: absolute; width: 9px; height: 9px; border-radius: 50%; background: var(--sd-surface); border: 2px solid var(--sd-accent); }
.sd-bid-node.node-a { left: 31px; top: 19px; }
.sd-bid-node.node-b { right: 28px; top: 29px; }
.sd-bid-node.node-c { left: 46px; bottom: 10px; }

.sd-chat-bubble {
  position: absolute; width: 45px; height: 36px; display: grid; place-items: center;
  border-radius: 12px 12px 12px 4px; color: var(--sd-accent-strong); background: var(--sd-accent-soft);
  box-shadow: inset 0 0 0 1px var(--sd-accent-glow);
}
.sd-chat-bubble.bubble-a { left: 3px; top: 8px; }
.sd-chat-bubble.bubble-b { left: 37px; top: 53px; }
.sd-chat-bubble.bubble-c { left: 81px; top: 21px; }
.sd-report-sheet {
  position: absolute; right: 3px; top: 4px; width: 84px; height: 101px; padding: 18px 12px 10px;
  display: grid; align-content: start; gap: 8px; border-radius: 4px 12px 12px 4px;
  background: var(--sd-surface-raised); border: 1px solid var(--sd-border);
}
.sd-report-sheet::before { content: ''; position: absolute; left: 0; top: 0; bottom: 0; width: 4px; border-radius: 4px 0 0 4px; background: var(--sd-accent); }
.sd-report-sheet i { height: 3px; border-radius: 3px; background: var(--sd-divider); }
.sd-report-sheet i:nth-child(2) { width: 72%; }
.sd-report-sheet b { width: 30px; height: 14px; border-radius: 4px; background: var(--sd-accent-soft); }

.sd-hbtn, .sd-btn, .sd-icon-btn, .sd-mode,
.sd-drawer-field select, .sd-drawer-field input, .sd-drawer-field textarea,
.sd-cell-input, .sd-kanban-move, .sd-doc-toolbar select {
  color: var(--sd-text-soft); background: var(--sd-surface); border-color: var(--sd-border);
}
.sd-hbtn, .sd-btn, .sd-icon-btn, .sd-channel, .sd-step, .sd-mode { transition: border-color 180ms ease, background-color 180ms ease, color 180ms ease, transform 180ms ease; }
.sd-hbtn:hover:not(:disabled), .sd-btn:hover:not(:disabled) { color: var(--sd-accent-strong); border-color: var(--sd-accent); background: var(--sd-accent-soft); }
.sd-hbtn.primary, .sd-btn.primary { color: var(--color-text-inverse); background: var(--sd-accent); border-color: var(--sd-accent); }
.sd-hbtn.primary:hover:not(:disabled), .sd-btn.primary:hover:not(:disabled) { color: var(--color-text-inverse); background: var(--sd-accent-strong); border-color: var(--sd-accent-strong); }
.sd-hbtn:focus-visible, .sd-btn:focus-visible, .sd-icon-btn:focus-visible, .sd-step:focus-visible,
.sd-right-tabs button:focus-visible, .sd-link:focus-visible, .sd-mode:focus-visible,
.sd-drawer-field :is(input, select, textarea):focus-visible {
  outline: 2px solid var(--sd-accent); outline-offset: 2px;
}

.sd-stickybar { background: var(--surface-glass); border-color: var(--sd-border); backdrop-filter: blur(12px) saturate(130%); }
.sd-step { color: var(--sd-text-soft); }
.sd-step-index { background: var(--sd-surface-soft); color: var(--sd-text-soft); }
.sd-step.step-done { color: var(--sd-success); }
.sd-step.step-done .sd-step-index { background: var(--sd-success-soft); color: var(--sd-success); }
.sd-step.step-active { color: var(--sd-accent-strong); background: var(--sd-accent-soft); }
.sd-step.step-active .sd-step-index { background: var(--sd-accent); color: var(--color-text-inverse); }
.sd-step.step-failed { color: var(--sd-danger); background: var(--sd-danger-soft); }
.sd-step.step-failed .sd-step-index { background: var(--sd-danger); color: var(--color-text-inverse); }
.sd-progress-text { color: var(--sd-text-soft); }
.sd-progress-bar { background: var(--sd-surface-soft); }
.sd-progress-fill { background: var(--sd-accent); }
.sd-section.is-active { border-color: var(--sd-accent); box-shadow: 0 0 0 3px var(--sd-accent-soft); }
.sd-section.is-done { border-color: var(--sd-success-soft); }
.sd-section.is-failed { border-color: var(--sd-danger-soft); }
.sd-step-no, .sd-state-pill { background: var(--sd-surface-soft); color: var(--sd-text-soft); }
.sd-section.is-done .sd-step-no, .sd-state-pill.done { background: var(--sd-success-soft); color: var(--sd-success); }
.sd-section.is-active .sd-step-no { background: var(--sd-accent); color: var(--color-text-inverse); }
.sd-state-pill.active { background: var(--sd-accent-soft); color: var(--sd-accent-strong); }
.sd-section.is-failed .sd-step-no { background: var(--sd-danger); color: var(--color-text-inverse); }
.sd-state-pill.failed, .sd-fail-reason { color: var(--sd-danger); }
.sd-state-pill.failed { background: var(--sd-danger-soft); }
.sd-summary { color: var(--sd-success); }
.sd-proof { background: var(--sd-accent-soft); border-color: var(--sd-border); }
.sd-hero-meta, .sd-alt { color: var(--sd-text-soft); }
.sd-step-label em { color: var(--sd-danger); }

.sd-section, .sd-approval-bar, .sd-right-col, .sd-drawer, .sd-merge-detail,
.sd-ticket-detail, .sd-formula-pop, .sd-wa-qr img, .sd-kanban-card {
  color: var(--sd-text); background: var(--sd-surface); border-color: var(--sd-border);
}
.sd-section-head h2, .sd-mode strong, .sd-fields td, .sd-diff-after,
.sd-cell-input, .sd-receipt, .sd-drawer-field :is(input, select, textarea) { color: var(--sd-text); }
.sd-count, .sd-hint, .sd-channel-detail, .sd-group-customer, .sd-approval-owner,
.sd-wf-step small, .sd-drawer-field label, .sd-output-version, .sd-wa-qr p,
.sd-evidence-meta, .sd-diff-head, .sd-diff-label, .sd-mode span { color: var(--sd-text-soft); }
.sd-channel-sync, .sd-channel-hint, .sd-attach-line, .sd-field-note,
.sd-diff-before, .sd-diff-row em, .sd-right-empty, .sd-empty { color: var(--sd-text-muted); }
.sd-link, .sd-ext-link, .sd-adv summary { color: var(--sd-accent-strong); }
.sd-section, .sd-channel, .sd-group, .sd-ticket-detail, .sd-right-col,
.sd-table td, .sd-table th, .sd-right-tabs, .sd-output-row, .sd-ev-mini,
.sd-reason-total, .sd-ticket-test, .sd-pack-tabs, .sd-sql code { border-color: var(--sd-divider); }
.sd-channel, .sd-table th, .sd-sql code, .sd-impact-summary, .sd-extract-bar,
.sd-btn.ghost, .sd-receipt, .sd-wa-stage { background: var(--sd-surface-soft); }
.sd-channel.is-upload:hover, .sd-channel.is-dropping, .sd-table.intake tbody tr.active,
.sd-mode.active, .sd-pack-tabs button.active { background: var(--sd-accent-soft); border-color: var(--sd-accent); }
.sd-table.intake tbody tr:hover { background: var(--sd-surface-hover); }
.sd-table th { color: var(--sd-text-soft); }
.sd-table td { color: var(--sd-text); }
.sd-right-tabs button { color: var(--sd-text-soft); }
.sd-right-tabs button.active { color: var(--sd-accent-strong); border-bottom-color: var(--sd-accent); }
.sd-right-tabs em { color: var(--sd-text-muted); }
.sd-wf-dot { background: var(--sd-surface-soft); color: var(--color-text-inverse); }
.sd-wf-step.wf-done .sd-wf-dot { background: var(--sd-success); }
.sd-wf-step.wf-active .sd-wf-dot { background: var(--sd-accent); }
.sd-wf-step.wf-failed .sd-wf-dot { background: var(--sd-danger); }
.sd-wf-step small.fail, .sd-doc-error { color: var(--sd-danger); }
.sd-extract-bar { color: var(--sd-text-soft); border-color: var(--sd-border); }
.sd-extract-bar em.warn, .sd-extract-warn, .sd-channel-next, .sd-weight-warn { color: var(--sd-warning); }
.sd-extract-warn { background: var(--sd-warning-soft); }
.sd-diff-row.changed, .sd-group, .sd-ev-mini.conflict { background: var(--sd-warning-soft); }
.sd-diff-after { color: var(--sd-text); }
.sd-drawer-mask { background: var(--color-bg-overlay); }
.sd-toast { color: var(--color-text-inverse); background: var(--sd-text); box-shadow: var(--shadow-md); }
.sd-sim-chip, .sd-link-chip { color: var(--sd-accent-strong); background: var(--sd-accent-soft); }
.sd-hbtn-tag { color: var(--sd-accent-strong); background: var(--sd-accent-soft); }
.verdict-ok, .sd-wa-stage.stage-paired, .sd-wa-paired { color: var(--color-status-success-fg); background: var(--color-status-success-bg); }
.verdict-partial { color: var(--color-status-warning-fg); background: var(--color-status-warning-bg); }
.verdict-fail, .sd-wa-stage.stage-failed, .sd-wa-stage.stage-expired { color: var(--color-status-danger-fg); background: var(--color-status-danger-bg); }
.verdict-pending, .sd-badge { color: var(--sd-text-soft); background: var(--sd-surface-soft); }
.sd-source-chip { color: var(--sd-text-soft); background: var(--sd-surface-soft); }
.sd-source-chip.ch-email { color: var(--color-status-info-fg); background: var(--color-status-info-bg); }
.sd-source-chip.ch-whatsapp { color: var(--color-status-success-fg); background: var(--color-status-success-bg); }
.sd-source-chip.ch-webform { color: var(--sd-accent-strong); background: var(--sd-accent-soft); }
.sd-source-chip.ch-websnapshot { color: var(--color-status-warning-fg); background: var(--color-status-warning-bg); }
.sd-state-text { color: var(--sd-text-soft); }
.sd-state-dot { background: var(--sd-text-muted); }
.sd-channel.state-ready .sd-state-dot { background: var(--sd-success); box-shadow: 0 0 0 4px color-mix(in srgb, var(--sd-success) 13%, transparent); }
.sd-channel.state-error .sd-state-dot { background: var(--sd-danger); }
.sd-channel.state-degraded .sd-state-dot { background: var(--sd-warning); }

/* Hero 右侧概览也必须吃主题 token，避免深色模式出现白色孤岛。 */
.sd-kpi {
  color: var(--sd-text);
  background: var(--sd-surface-raised);
  border-color: var(--sd-border);
}
.sd-kpi:hover { border-color: var(--sd-accent); background: var(--sd-accent-soft); }
.sd-kpi:focus-visible { outline: 2px solid var(--sd-accent); outline-offset: 2px; }
.sd-kpi b, .sd-recent-subject { color: var(--sd-text); }
.sd-kpi span, .sd-recent-status { color: var(--sd-text-soft); }
.sd-kpi.warn b { color: var(--sd-warning); }
.sd-recent-row { color: var(--sd-text-soft); }
.sd-recent-row:hover { background: var(--sd-surface-hover); }

/* 弹层内容：字段、选项卡、选择卡统一为清晰的业务表单层级。 */
.sd-drawer-field {
  gap: 8px;
  color: var(--sd-text);
}
.sd-drawer-field + .sd-drawer-field { margin-top: 16px; }
.sd-drawer-grid {
  gap: 16px;
  margin-block: 16px;
}
.sd-drawer-grid > .sd-drawer-field { margin-top: 0; }
.sd-drawer-field label {
  color: var(--sd-text-soft);
  font-size: 12.5px;
  line-height: 18px;
  font-weight: 620;
}
.sd-drawer-field select,
.sd-drawer-field input,
.sd-drawer-field textarea {
  min-height: 40px;
  padding: 9px 11px;
  color: var(--sd-text);
  background: var(--sd-surface-soft);
  border: 1px solid var(--sd-border);
  border-radius: 9px;
  outline: none;
  transition: border-color 160ms ease, box-shadow 160ms ease, background-color 160ms ease;
}
.sd-drawer-field textarea { min-height: 104px; line-height: 1.55; resize: vertical; }
.sd-drawer-field :is(input, textarea)::placeholder { color: var(--sd-text-muted); }
.sd-drawer-field :is(input, select, textarea):hover { border-color: color-mix(in srgb, var(--sd-border) 48%, var(--sd-accent)); }
.sd-drawer-field :is(input, select, textarea):focus-visible {
  border-color: var(--sd-accent);
  background: var(--sd-surface-raised);
  box-shadow: 0 0 0 3px var(--sd-accent-soft);
  outline: none;
}
.sd-pack-tabs {
  position: sticky;
  top: -20px;
  z-index: 4;
  gap: 4px;
  margin: -4px 0 20px;
  padding: 5px;
  background: color-mix(in srgb, var(--sd-surface-raised) 94%, transparent);
  border: 1px solid var(--sd-border);
  border-radius: 11px;
  box-shadow: 0 8px 18px color-mix(in srgb, var(--sd-bg) 72%, transparent);
  backdrop-filter: blur(10px);
}
.sd-pack-tabs button {
  min-height: 34px;
  padding: 6px 12px;
  color: var(--sd-text-soft);
  border: 1px solid transparent;
  border-radius: 8px;
}
.sd-pack-tabs button:hover { color: var(--sd-text); background: var(--sd-surface-hover); }
.sd-pack-tabs button.active {
  color: var(--sd-accent-strong);
  background: var(--sd-accent-soft);
  border-color: var(--sd-accent-glow);
  box-shadow: 0 3px 10px var(--sd-accent-glow);
}
.sd-preset-row { gap: 8px; }
.sd-preset-row .sd-btn { min-height: 36px; border-radius: 9px; }
.sd-upload-mock {
  min-height: 54px;
  padding: 10px 12px;
  color: var(--sd-text-soft);
  background: var(--sd-surface-soft);
  border: 1px dashed color-mix(in srgb, var(--sd-border) 55%, var(--sd-accent));
  border-radius: 10px;
}
.sd-upload-mock > span { flex: 1; min-width: 0; }
.sd-preset-list { gap: 10px; margin: 0 0 18px; }
.sd-preset {
  min-height: 78px;
  padding: 12px 14px;
  color: var(--sd-text);
  background: var(--sd-surface-soft);
  border-color: var(--sd-border);
  border-radius: 10px;
  transition: transform 160ms ease, border-color 160ms ease, background-color 160ms ease;
}
.sd-preset:hover { transform: translateY(-1px); border-color: var(--sd-accent); background: var(--sd-accent-soft); }
.sd-preset strong { color: var(--sd-text); }
.sd-preset span { color: var(--sd-accent-strong); }
.sd-preset em { color: var(--sd-text-soft); }
.sd-modes { gap: 12px; margin-bottom: 20px; }
.sd-mode {
  min-height: 104px;
  padding: 14px 16px;
  color: var(--sd-text);
  background: var(--sd-surface-soft);
  border-color: var(--sd-border);
  border-radius: 11px;
}
.sd-mode:hover:not(:disabled) { transform: translateY(-1px); border-color: var(--sd-accent); }
.sd-mode i { color: var(--sd-text-soft); font-size: 20px; }
.sd-mode strong { color: var(--sd-text); }
.sd-mode span { color: var(--sd-text-soft); }
.sd-mode.active { background: var(--sd-accent-soft); border-color: var(--sd-accent); box-shadow: inset 0 0 0 1px var(--sd-accent-glow); }
.sd-mode.active i, .sd-mode.active::after { color: var(--sd-accent-strong); }
.sd-city-row {
  grid-template-columns: minmax(min(100%, 120px), 1fr) 92px 92px;
  gap: 8px;
  margin-bottom: 8px;
  padding: 8px;
  background: var(--sd-surface-soft);
  border-radius: 9px;
}
.sd-sub-title {
  display: flex;
  align-items: center;
  gap: 7px;
  margin: 20px 0 10px;
  color: var(--sd-text);
  font-size: 12.5px;
  font-weight: 680;
}
.sd-sub-title::before { content: ''; width: 3px; height: 14px; border-radius: 3px; background: var(--sd-accent); }
.sd-wa-stage { min-height: 42px; border-radius: 10px; }
.sd-wa-qr { margin-top: 8px; padding: 18px; background: var(--sd-surface-soft); border-radius: 12px; }
.sd-wa-qr img { border-color: var(--sd-border); border-radius: 10px; }
.sd-send-file {
  min-height: 48px;
  padding: 10px 12px;
  color: var(--sd-text);
  background: var(--sd-surface-soft);
  border: 1px solid var(--sd-border);
  border-radius: 10px;
}
.sd-output-row {
  margin-top: 8px;
  padding: 10px 12px;
  background: var(--sd-surface-soft);
  border: 1px solid var(--sd-divider);
  border-radius: 10px;
}
.sd-output-row + .sd-output-row { margin-top: 8px; }
.sd-receipt { color: var(--sd-text); background: var(--sd-surface-soft); border-color: var(--sd-border); border-radius: 10px; }

/* 询价报价：报价单/成本链路，横向导轨 + 稳定三栏。 */
.sd-module-rfq-quote .sd-hero {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 190px minmax(340px, 410px);
  grid-template-areas: 'copy visual side';
  align-items: center;
  gap: 24px;
  padding-block: 28px;
  background:
    radial-gradient(circle at 72% 20%, var(--sd-accent-soft), transparent 31%),
    var(--sd-surface);
}
.sd-module-rfq-quote .sd-hero-copy { grid-area: copy; }
.sd-module-rfq-quote .sd-hero-visual { grid-area: visual; }
.sd-module-rfq-quote .sd-hero-side { grid-area: side; }
.sd-module-rfq-quote .sd-hero::after { left: 28px; right: 28px; bottom: 0; height: 2px; background: linear-gradient(90deg, var(--sd-accent), transparent 70%); }
.sd-module-rfq-quote .sd-hero h1 { font-size: 24px; }
.sd-module-rfq-quote .sd-section { border-radius: 6px; }
.sd-module-rfq-quote .sd-channels { position: relative; grid-template-columns: repeat(2, minmax(min(100%, 260px), 1fr)); gap: 26px; }
.sd-module-rfq-quote .sd-channels::before { content: ''; position: absolute; left: 25%; right: 25%; top: 26px; height: 1px; background: var(--sd-accent-glow); pointer-events: none; }
.sd-module-rfq-quote .sd-channel { position: relative; border-radius: 6px; background: var(--sd-surface); }
.sd-module-rfq-quote .sd-channel::after { content: ''; position: absolute; inset: 6px auto 6px 6px; width: 3px; border-radius: 3px; background: var(--sd-accent); opacity: .72; }
.sd-module-rfq-quote .sd-channel-head, .sd-module-rfq-quote .sd-channel-detail,
.sd-module-rfq-quote .sd-channel-next, .sd-module-rfq-quote .sd-channel-sync,
.sd-module-rfq-quote .sd-channel-hint, .sd-module-rfq-quote .sd-channel-foot { margin-left: 8px; }

/* 招投标：决策指挥台，流程横置，证据与卡片形成主副屏。 */
.sd-module-bid-decision .sd-hero {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 240px minmax(350px, 430px);
  grid-template-areas: 'copy visual side';
  align-items: center;
  gap: 28px;
  padding: 30px 34px 26px;
  background:
    linear-gradient(118deg, var(--sd-accent-soft), transparent 42%),
    radial-gradient(circle at 88% 50%, var(--sd-accent-soft), transparent 28%),
    var(--sd-surface);
}
.sd-module-bid-decision .sd-hero-copy { grid-area: copy; }
.sd-module-bid-decision .sd-hero-visual { grid-area: visual; width: 230px; height: 132px; }
.sd-module-bid-decision .sd-hero-side { grid-area: side; align-self: stretch; justify-content: center; }
.sd-module-bid-decision .sd-hero-actions { justify-content: flex-start; }
.sd-module-bid-decision .sd-hero h1 { font-size: 26px; max-width: 760px; }
.sd-module-bid-decision .sd-hero p { max-width: 680px; }
.sd-module-bid-decision .sd-stickybar { margin: 10px 28px 0; top: 8px; border: 1px solid var(--sd-border); border-radius: 10px; }
.sd-module-bid-decision .sd-section { border: 0; background: transparent; padding: 20px 0; margin-block: 10px; border-radius: 0; }
.sd-module-bid-decision .sd-section-head { padding-inline: 2px; }
.sd-module-bid-decision .sd-channels { grid-template-columns: repeat(3, minmax(min(100%, 220px), 1fr)); }
.sd-module-bid-decision .sd-channel { min-height: 138px; background: var(--sd-surface); border-radius: 12px; }
.sd-module-bid-decision .sd-channel:hover { transform: translateY(-2px); }
.sd-module-bid-decision .sd-workspace {
  grid-template-columns: minmax(0, 1fr) 400px;
  grid-template-areas: 'timeline timeline' 'cards evidence';
}
.sd-module-bid-decision .sd-timeline-col {
  grid-area: timeline; position: static; display: grid; grid-template-columns: repeat(6, minmax(min(100%, 120px), 1fr));
  gap: 0; padding: 12px 16px; border-radius: 10px; background: var(--sd-surface-soft); overflow-x: auto;
}
.sd-module-bid-decision .sd-wf-step { position: relative; min-width: 120px; align-items: center; }
.sd-module-bid-decision .sd-wf-step:not(:last-of-type)::after { content: ''; position: absolute; left: 26px; right: 8px; top: 18px; height: 1px; background: var(--sd-divider); }
.sd-module-bid-decision .sd-wf-step > div { position: relative; z-index: 1; padding-right: 8px; background: var(--sd-surface-soft); }
.sd-module-bid-decision .sd-wf-dot { position: relative; z-index: 2; }
.sd-module-bid-decision .sd-impact-summary { grid-column: 1 / -1; margin-top: 8px; background: var(--sd-surface); }
.sd-module-bid-decision .sd-cards-col { grid-area: cards; }
.sd-module-bid-decision .sd-right-col { grid-area: evidence; }

/* 客户问题与报告：多渠道研究台，证据先行的双栏布局。 */
.sd-module-advisory-report .sd-hero {
  display: grid;
  grid-template-columns: 210px minmax(0, 1fr) minmax(340px, 410px);
  grid-template-areas: 'visual copy side';
  align-items: center;
  gap: 24px;
  padding: 34px 28px;
  background:
    radial-gradient(circle at 18% 120%, var(--sd-accent-soft), transparent 42%),
    radial-gradient(circle at 74% 0%, var(--sd-accent-soft), transparent 30%),
    var(--sd-surface);
}
.sd-module-advisory-report .sd-hero-copy { grid-area: copy; }
.sd-module-advisory-report .sd-hero-visual { grid-area: visual; }
.sd-module-advisory-report .sd-hero-side { grid-area: side; }
.sd-module-advisory-report .sd-hero h1 { font-size: 25px; max-width: 690px; }
.sd-module-advisory-report .sd-section { border-radius: 14px; border-color: color-mix(in srgb, var(--sd-border) 74%, var(--sd-accent)); }
.sd-module-advisory-report .sd-channels { grid-template-columns: repeat(2, minmax(min(100%, 260px), 1fr)); }
.sd-module-advisory-report .sd-channel { border: 0; border-radius: 12px; background: var(--sd-surface-soft); }
.sd-module-advisory-report .sd-channel:nth-child(even) { transform: translateY(8px); }
.sd-module-advisory-report .sd-workspace {
  grid-template-columns: minmax(300px, .72fr) minmax(0, 1.45fr);
  grid-template-areas: 'evidence cards' 'timeline cards';
}
.sd-module-advisory-report .sd-right-col { grid-area: evidence; position: sticky; top: 68px; }
.sd-module-advisory-report .sd-timeline-col {
  grid-area: timeline; position: static; align-self: start; padding: 12px 14px;
  border-radius: 12px; background: var(--sd-surface-soft);
}
.sd-module-advisory-report .sd-cards-col { grid-area: cards; }
.sd-module-advisory-report .sd-right-tabs button.active { background: var(--sd-accent-soft); border-bottom-color: transparent; }

@container main-page (max-width: 1180px) {
  .sd-hero-visual { display: none; }
  .sd-module-rfq-quote .sd-hero {
    grid-template-columns: minmax(0, 1fr) minmax(320px, 400px);
    grid-template-areas: 'copy side';
  }
  .sd-module-bid-decision .sd-hero {
    grid-template-columns: minmax(0, 1fr) minmax(320px, 400px);
    grid-template-areas: 'copy side';
  }
  .sd-module-advisory-report .sd-hero {
    grid-template-columns: minmax(0, 1fr) minmax(320px, 400px);
    grid-template-areas: 'copy side';
  }
  .sd-module-bid-decision .sd-workspace,
  .sd-module-advisory-report .sd-workspace {
    grid-template-columns: minmax(0, 1fr);
    grid-template-areas: 'timeline' 'cards' 'evidence';
  }
  .sd-module-rfq-quote .sd-workspace { grid-template-columns: 170px minmax(0, 1fr); }
  .sd-module-rfq-quote .sd-right-col { grid-column: 1 / -1; position: static; max-height: 560px; }
  .sd-module-advisory-report .sd-right-col { position: static; max-height: 560px; }
}

@container main-page (max-width: 820px) {
  .sd-hero, .sd-module-rfq-quote .sd-hero, .sd-module-bid-decision .sd-hero,
  .sd-module-advisory-report .sd-hero { display: flex; flex-direction: column; padding: 22px 18px; }
  .sd-hero-actions { justify-content: flex-start; width: 100%; }
  .sd-stickybar, .sd-module-bid-decision .sd-stickybar { margin: 0; top: 0; border-inline: 0; border-radius: 0; padding-inline: 18px; }
  .sd-section, .sd-module-bid-decision .sd-section { margin-inline: 14px; padding-inline: 14px; }
  .sd-channels, .sd-module-rfq-quote .sd-channels, .sd-module-bid-decision .sd-channels,
  .sd-module-advisory-report .sd-channels { grid-template-columns: 1fr; }
  .sd-module-rfq-quote .sd-channels::before { display: none; }
  .sd-module-advisory-report .sd-channel:nth-child(even) { transform: none; }
  .sd-workspace, .sd-module-rfq-quote .sd-workspace,
  .sd-module-bid-decision .sd-workspace, .sd-module-advisory-report .sd-workspace {
    display: flex; flex-direction: column;
  }
  .sd-timeline-col, .sd-module-advisory-report .sd-timeline-col { position: static; width: 100%; }
  .sd-module-bid-decision .sd-timeline-col { display: flex; width: 100%; }
  .sd-right-col { position: static; width: 100%; max-height: 520px; }
  .sd-section-head { align-items: flex-start; flex-wrap: wrap; }
  .sd-section-actions { margin-left: 0; width: 100%; }
  .sd-hero-side { width: 100%; }
  .sd-kpis { justify-content: flex-start; flex-wrap: wrap; }
  .sd-drawer-grid, .sd-modes { grid-template-columns: 1fr; }
  .sd-city-row { grid-template-columns: minmax(min(100%, 110px), 1fr) 82px 82px; }
  .sd-output-row { flex-wrap: wrap; }
  .sd-output-name { flex-basis: calc(100% - 30px); }
}

@media (prefers-reduced-motion: reduce) {
  .saudi-workbench *, .saudi-workbench *::before, .saudi-workbench *::after {
    scroll-behavior: auto !important; animation-duration: .01ms !important;
    animation-iteration-count: 1 !important; transition-duration: .01ms !important;
  }
}
.sd-proof-form { display: flex; gap: 14px; align-items: flex-end; flex-wrap: wrap; margin-top: 12px; }
.sd-proof-field { display: grid; gap: 4px; font-size: 12px; color: #64748b; }
.sd-proof-field select { height: 32px; border: 1px solid #e3e8ef; border-radius: 6px; padding: 0 8px; background: #fff; font: inherit; font-size: 13px; color: #1b2733; }
</style>
