<template>
  <div class="bw-workbench">
    <header class="bw-hero">
      <PageBackButton />
      <div class="bw-hero__copy">
        <p class="bw-hero__eyebrow"><i class="ri-draft-line"></i>{{ $t('招投标 · 项目工作台') }}</p>
        <h1>{{ $t('智能标书助手') }}</h1>
        <p class="bw-hero__sub">
          {{ $t('填投标目标与目标投标网站，自动抓公告并拆成逐条要求；标书模板可以上传，不上传就从知识库里找；公司资料取自知识库，逐章成文后做废标风险自检，最后导出 Word / PDF 正式件。') }}
        </p>
      </div>
      <div class="bw-hero__actions">
      </div>
    </header>

    <div class="bw-projects">
      <span class="bw-muted">{{ $t('当前项目') }}</span>
      <select :value="bw.state.value.currentId" :disabled="busy" @change="onSwitchProject">
        <option v-for="p in bw.state.value.projects" :key="p.id" :value="p.id">
          {{ p.name }}{{ p.notice?.projectCode ? ` · ${p.notice.projectCode}` : '' }}
        </option>
      </select>
      <button type="button" class="bw-btn sm" :disabled="busy" @click="addProject"><i class="ri-add-line"></i>{{ $t('新建项目') }}</button>
      <button type="button" class="bw-btn sm danger" :disabled="busy || bw.state.value.projects.length <= 1" @click="dropProject">
        <i class="ri-delete-bin-line"></i>{{ $t('删除') }}
      </button>
      <span v-if="project" class="bw-muted">{{ $t('更新于 {t}', { t: fmtDateTime(project.updatedAt) }) }}</span>
    </div>

    <div class="bw-projects">
      <span class="bw-muted"><i class="ri-folder-3-line"></i>{{ $t('标书存放位置') }}</span>
      <code class="bw-mono bw-path" :title="bw.docRoot.value" dir="ltr">{{ bw.docRoot.value || $t('（读取中）') }}</code>
      <button type="button" class="bw-btn sm" :disabled="busy" @click="changeDocRoot">
        <i class="ri-folder-settings-line"></i>{{ $t('更换位置') }}
      </button>
      <button type="button" class="bw-btn sm" :disabled="!bw.docRoot.value" @click="openPath(projectFolder || bw.docRoot.value, true)">
        <i class="ri-folder-open-line"></i>{{ $t('打开目录') }}
      </button>
      <button v-if="rootChanged" type="button" class="bw-btn sm" :disabled="busy" @click="restoreDocRoot">
        <i class="ri-arrow-go-back-line"></i>{{ $t('恢复默认') }}
      </button>
      <span class="bw-muted">{{ $t('生成的 Word / PDF / 自检表按项目名建子目录放这里；换位置只影响以后导出的文件。') }}</span>
    </div>

    <!-- 手填内容要不要沉淀成知识 —— 页面级开关，第 4 步的公司资料与第 5/6 步的缺料表都按它走 -->
    <div class="bw-projects">
      <span class="bw-muted"><i class="ri-database-2-line"></i>{{ $t('我手填的信息') }}</span>
      <button
        type="button" class="bw-chip" :class="{ on: rememberGaps }"
        :title="$t('打开：手填的公司资料与缺料内容写进知识图谱，以后新项目自动带出；关闭：只在本次标书里生效。')"
        @click="setRememberGaps(!rememberGaps)"
      >
        <i :class="rememberGaps ? 'ri-toggle-fill' : 'ri-toggle-line'"></i>
        {{ rememberGaps ? $t('存入知识图谱（以后自动带出）') : $t('仅本次有效（不进知识图谱）') }}
      </button>
      <span class="bw-muted">{{ rememberGaps
        ? $t('报价、工期这类一次性的信息建议关掉，免得污染知识库。')
        : $t('公司名称、资质编号这类下次还要用的，建议打开存下来。') }}</span>
    </div>

    <p v-if="!bw.llmReady.value" class="bw-note warn">
      <i class="ri-alert-line"></i>{{ $t('还没配置 AI 大脑：公告抽取只能走规则，逐章成文不可用。到「设置 → 模型配置」配好后回来重试。') }}
    </p>

    <BwProgress :metas="bw.metas" :runtime="bw.runtime" :current-key="bw.currentKey.value" :live="bw.live.value" @jump="scrollToStep" />

    <div v-if="project" class="bw-steps">
      <!-- ── 第 1 步：项目与投标目标 ── -->
      <BwStep
        step-key="project" :index="0" :title="bw.metas[0].title" :hint="bw.metas[0].hint" :icon="bw.metas[0].icon"
        :runtime="bw.runtime.project" :is-current="bw.currentKey.value === 'project'"
      >
        <div class="bw-form">
          <label class="bw-field"><span>{{ $t('项目名称') }}</span>
            <input v-model="project.name" type="text" :placeholder="$t('例：某某局智慧园区平台建设项目')" @change="bw.save()" />
          </label>
          <label class="bw-field"><span>{{ $t('投标人（我方公司）') }}</span>
            <span class="bw-inline">
              <input v-model="project.bidder" type="text" :placeholder="bw.defaultBidder.value || $t('填我方公司全称，或从知识库带出')" @change="bw.save()" />
              <button type="button" class="bw-btn sm" :disabled="pullingBidder" :title="$t('从知识库读取公司名称')" @click="pullBidder">
                <i :class="pullingBidder ? 'ri-loader-4-line bw-spin' : 'ri-database-2-line'"></i>{{ $t('从知识库带出') }}
              </button>
            </span>
          </label>
          <label class="bw-field"><span>{{ $t('标书语言') }}</span>
            <select v-model="project.lang" @change="bw.save()">
              <option value="zh-CN">{{ $t('简体中文') }}</option>
              <option value="en-US">English</option>
              <option value="ar">العربية</option>
            </select>
          </label>
          <label class="bw-field"><span>{{ $t('目标投标网站') }}</span>
            <input v-model="project.siteUrl" type="url" placeholder="https://" dir="ltr" @change="bw.save()" />
          </label>
          <label class="bw-field wide">
            <span class="bw-field__head">
              {{ $t('投标目标（想靠什么赢下这一标，会直接进写作要求）') }}
              <em v-if="goalDrafting" class="bw-muted"><i class="ri-loader-4-line bw-spin"></i>{{ $t('先给了一版草稿，AI 正在润色…') }}</em>
              <em v-else-if="goalFallback" class="bw-muted">{{ $t('大脑不可用，这句是本地拼的，请自行修改') }}</em>
              <button
                v-if="project.strategies.length" type="button" class="bw-btn sm"
                :disabled="goalDrafting" @click="draftGoal(true)"
              ><i class="ri-quill-pen-line"></i>{{ project.goal.trim() ? $t('按所选侧重重写') : $t('生成目标') }}</button>
            </span>
            <textarea
              v-model="project.goal" rows="3"
              :placeholder="$t('点下面的侧重标签会自动写一段；也可以直接自己写。')"
              @change="onGoalEdited"
            ></textarea>
          </label>
        </div>
        <p v-if="knowledgeHint" class="bw-note warn">
          <i class="ri-alert-line"></i><span>{{ knowledgeHint }}</span>
          <button type="button" class="bw-btn sm" @click="goKnowledge"><i class="ri-book-2-line"></i>{{ $t('去知识库') }}</button>
        </p>
        <div class="bw-chips">
          <button
            v-for="opt in strategies" :key="opt.key" type="button"
            class="bw-chip" :class="{ on: project.strategies.includes(opt.label) }"
            :disabled="goalDrafting"
            @click="toggleStrategy(opt.label)"
          >{{ opt.label }}</button>
        </div>
        <p class="bw-note"><i class="ri-information-line"></i>{{ goalEdited
          ? $t('目标已被你改过，点标签不会再覆盖；要按新选的侧重重写，点上面的「按所选侧重重写」。')
          : $t('点标签即按所选侧重自动写一段目标；自己改过之后就不会再被覆盖。') }}</p>
        <div class="bw-hero__actions">
          <button type="button" class="bw-btn primary" :disabled="busy" @click="confirmProject">
            <i class="ri-check-line"></i>{{ $t('确认，进入下一步') }}
          </button>
        </div>
      </BwStep>

      <!-- ── 第 2 步：招标公告 ── -->
      <BwStep
        step-key="notice" :index="1" :title="bw.metas[1].title" :hint="bw.metas[1].hint" :icon="bw.metas[1].icon"
        :runtime="bw.runtime.notice" :is-current="bw.currentKey.value === 'notice'"
      >
        <template #tools>
          <span v-if="requirements.length" class="bw-chip static ok"><i class="ri-list-check-2"></i>{{ $t('{n} 条要求', { n: requirements.length }) }}</span>
        </template>

        <!-- 先按目标找到那一条公告：用户手上常常只有平台首页，抓首页只会得到一堆导航文字 -->
        <div class="bw-form">
          <label class="bw-field wide">
            <span class="bw-field__head">
              {{ $t('按投标目标检索招标公告') }}
              <em v-if="searching" class="bw-muted"><i class="ri-loader-4-line bw-spin"></i>{{ $t('检索中…') }}</em>
            </span>
            <span class="bw-inline">
              <input
                v-model="searchKeywords" type="text"
                :placeholder="$t('关键词，留空按项目名与投标目标自动取（可加地区、采购人）')"
                @keyup.enter="searchNotices"
              />
              <button type="button" class="bw-btn primary" :disabled="searching" @click="searchNotices">
                <i :class="searching ? 'ri-loader-4-line bw-spin' : 'ri-search-line'"></i>{{ $t('检索公告') }}
              </button>
            </span>
          </label>
        </div>

        <div v-if="searchHits.length" class="bw-panel">
          <header class="bw-panel__head">
            <strong><i class="ri-list-check"></i>{{ $t('检索到 {n} 条公告', { n: searchHits.length }) }}</strong>
            <span class="bw-muted">{{ $t('关键词：{k}', { k: searchUsedKeywords }) }}</span>
            <span class="grow"></span>
            <span v-if="searchVia === 'browser'" class="bw-chip static warn">{{ $t('内置浏览器检索') }}</span>
          </header>
          <div class="bw-panel__body">
            <table class="bw-table">
              <tbody>
                <tr v-for="h in searchHits" :key="h.url">
                  <td>
                    <strong>{{ h.title }}</strong>
                    <div class="bw-muted">{{ h.source }}<template v-if="h.publishedAt"> · {{ h.publishedAt }}</template></div>
                    <div v-if="h.snippet" class="bw-muted">{{ h.snippet }}</div>
                  </td>
                  <td class="num">
                    <button type="button" class="bw-btn sm primary" :disabled="busy" @click="useHit(h)">
                      <i class="ri-download-cloud-2-line"></i>{{ $t('用这条并抓取') }}
                    </button>
                    <button type="button" class="bw-btn sm" @click="openInBrowser(h.url)">
                      <i class="ri-external-link-line"></i>{{ $t('先看看') }}
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        <p v-else-if="searchNote" class="bw-note warn"><i class="ri-alert-line"></i>{{ searchNote }}</p>

        <div class="bw-form">
          <label class="bw-field wide"><span>{{ $t('招标公告网址') }}</span>
            <input v-model="project.siteUrl" type="url" placeholder="https://" dir="ltr" @change="bw.save()" />
          </label>
        </div>
        <div class="bw-hero__actions">
          <button type="button" class="bw-btn primary" :disabled="busy || !project.siteUrl.trim()" @click="fetchNotice">
            <i class="ri-download-cloud-2-line"></i>{{ $t('抓取公告') }}
          </button>
          <button type="button" class="bw-btn" :disabled="busy || !project.siteUrl.trim()" @click="loginSite">
            <i class="ri-login-box-line"></i>{{ $t('先去登录这个网站') }}
          </button>
          <button type="button" class="bw-btn" :disabled="busy" @click="importNoticeFile">
            <i class="ri-file-upload-line"></i>{{ $t('上传招标文件') }}
          </button>
          <span class="grow"></span>
          <button type="button" class="bw-btn primary" :disabled="busy || noticeText.trim().length < 100" @click="extractNotice">
            <i class="ri-scan-2-line"></i>{{ $t('抽取招标要点') }}
          </button>
        </div>
        <p class="bw-note">
          <i class="ri-information-line"></i>
          {{ $t('要登录才能看的招标平台：先点「先去登录这个网站」，在内置浏览器里登录一次，抓取会复用同一份登录状态。') }}
        </p>

        <label class="bw-field wide"><span>{{ $t('公告正文（可直接粘贴或修改）') }}</span>
          <textarea v-model="noticeText" rows="8" :placeholder="$t('抓取或上传后正文会出现在这里；也可以直接把公告全文粘进来。')" @change="saveNoticeText"></textarea>
        </label>

        <div v-if="noticeWarnings.length" class="bw-note warn">
          <i class="ri-alert-line"></i><span>{{ noticeWarnings.join('\n') }}</span>
        </div>

        <p v-if="noticeLooksStale" class="bw-note warn">
          <i class="ri-alert-line"></i>
          {{ $t('下面这些要点看着不像正经字段（多半是早先版本抽的）。解析器已升级，点「抽取招标要点」重跑一次即可。') }}
          <button type="button" class="bw-btn sm" :disabled="busy || noticeText.trim().length < 100" @click="extractNotice">
            <i class="ri-refresh-line"></i>{{ $t('重新抽取') }}
          </button>
        </p>

        <div v-if="hasNoticeFacts" class="bw-panel">
          <header class="bw-panel__head">
            <strong><i class="ri-profile-line"></i>{{ $t('公告要点（抓错了可以直接改）') }}</strong>
            <span class="grow"></span>
            <a v-if="project.notice.url" class="bw-muted bw-mono" :href="project.notice.url" target="_blank" rel="noreferrer">{{ project.notice.url }}</a>
          </header>
          <div class="bw-panel__body">
            <div class="bw-form">
              <label class="bw-field"><span>{{ $t('采购人') }}</span><input v-model="project.notice.buyer" type="text" @change="bw.save()" /></label>
              <label class="bw-field"><span>{{ $t('代理机构') }}</span><input v-model="project.notice.agency" type="text" @change="bw.save()" /></label>
              <label class="bw-field"><span>{{ $t('招标编号') }}</span><input v-model="project.notice.projectCode" type="text" @change="bw.save()" /></label>
              <label class="bw-field"><span>{{ $t('预算金额') }}</span><input v-model="project.notice.budget" type="text" @change="bw.save()" /></label>
              <label class="bw-field"><span>{{ $t('投标保证金') }}</span><input v-model="project.notice.deposit" type="text" @change="bw.save()" /></label>
              <label class="bw-field"><span>{{ $t('投标截止时间') }}</span><input v-model="project.notice.bidDeadline" type="text" @change="bw.save()" /></label>
              <label class="bw-field"><span>{{ $t('开标时间') }}</span><input v-model="project.notice.openAt" type="text" @change="bw.save()" /></label>
              <label class="bw-field"><span>{{ $t('联系方式') }}</span><input v-model="project.notice.contact" type="text" @change="bw.save()" /></label>
            </div>
          </div>
        </div>

        <div v-if="project.notice.attachments?.length" class="bw-panel">
          <header class="bw-panel__head"><strong><i class="ri-attachment-2"></i>{{ $t('公告附件') }}</strong></header>
          <div class="bw-panel__body">
            <ul class="bw-muted">
              <li v-for="a in project.notice.attachments" :key="a.url">
                <a :href="a.url" target="_blank" rel="noreferrer">{{ a.name || a.url }}</a>
              </li>
            </ul>
            <p class="bw-note"><i class="ri-information-line"></i>{{ $t('附件（招标文件正本）里通常写着投标文件格式，下载后可以在第 3 步当模板上传。') }}</p>
          </div>
        </div>

        <div v-if="requirements.length" class="bw-panel">
          <header class="bw-panel__head">
            <strong><i class="ri-list-check-2"></i>{{ $t('逐条招标要求') }}</strong>
            <span class="grow"></span>
            <span v-for="k in requirementKinds" :key="k.key" class="bw-chip static">{{ k.label }} {{ k.count }}</span>
            <button type="button" class="bw-btn sm" @click="addRequirement"><i class="ri-add-line"></i>{{ $t('手工补一条') }}</button>
          </header>
          <div class="bw-panel__body">
            <table class="bw-table">
              <thead><tr>
                <th>{{ $t('类型') }}</th><th>{{ $t('要求') }}</th><th>{{ $t('分值') }}</th><th></th>
              </tr></thead>
              <tbody>
                <tr v-for="r in requirements" :key="r.id">
                  <td class="num">
                    <select v-model="r.kind" @change="bw.save()">
                      <option v-for="k in kindOptions" :key="k" :value="k">{{ requirementKindLabel(k) }}</option>
                    </select>
                  </td>
                  <td><textarea v-model="r.text" rows="2" @change="bw.save()"></textarea></td>
                  <td class="num">{{ r.points ?? '—' }}</td>
                  <td class="num">
                    <button type="button" class="bw-btn sm danger" @click="removeRequirement(r.id)"><i class="ri-delete-bin-line"></i></button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </BwStep>

      <!-- ── 第 3 步：标书模板 ── -->
      <BwStep
        step-key="template" :index="2" :title="bw.metas[2].title" :hint="bw.metas[2].hint" :icon="bw.metas[2].icon"
        :runtime="bw.runtime.template" :is-current="bw.currentKey.value === 'template'"
      >
        <template #tools>
          <span v-if="project.template" class="bw-chip static ok"><i class="ri-file-text-line"></i>{{ project.template.name }}</span>
        </template>

        <div class="bw-hero__actions">
          <button type="button" class="bw-btn primary" :disabled="busy" @click="importTemplate">
            <i class="ri-upload-2-line"></i>{{ $t('上传标书模板') }}
          </button>
          <button type="button" class="bw-btn" :disabled="busy" @click="suggestTemplates">
            <i class="ri-search-line"></i>{{ $t('从知识库里找模板') }}
          </button>
          <button type="button" class="bw-btn" :disabled="busy" @click="useBuiltinOutline">
            <i class="ri-list-ordered"></i>{{ $t('用内置标准大纲') }}
          </button>
        </div>
        <p class="bw-note">
          <i class="ri-information-line"></i>
          {{ $t('招标文件里规定了投标文件格式的，务必上传那一份 —— 章节顺序和名称按它来，评审时不会因为格式丢分。') }}
        </p>

        <div v-if="templateCandidates.length" class="bw-panel">
          <header class="bw-panel__head"><strong><i class="ri-folder-search-line"></i>{{ $t('知识库里的候选模板') }}</strong></header>
          <div class="bw-panel__body">
            <table class="bw-table">
              <tbody>
                <tr v-for="c in templateCandidates" :key="c.docId">
                  <td>{{ c.name }}</td>
                  <td class="bw-muted">{{ c.reason }}</td>
                  <td class="num">
                    <button type="button" class="bw-btn sm primary" :disabled="busy" @click="adoptTemplate(c.docId)">{{ $t('用这份') }}</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        <p v-else-if="templateNote" class="bw-note info"><i class="ri-information-line"></i>{{ templateNote }}</p>

        <div v-if="project.sections.length" class="bw-panel">
          <header class="bw-panel__head">
            <strong><i class="ri-list-ordered"></i>{{ $t('章节大纲（{n} 章，可增删改）', { n: project.sections.length }) }}</strong>
            <span class="grow"></span>
            <button type="button" class="bw-btn sm" @click="addSection"><i class="ri-add-line"></i>{{ $t('加一章') }}</button>
            <button type="button" class="bw-btn sm primary" :disabled="busy" @click="confirmOutline"><i class="ri-check-line"></i>{{ $t('大纲就这样') }}</button>
          </header>
          <div class="bw-panel__body">
            <div class="bw-sections">
              <div v-for="(s, i) in project.sections" :key="s.id" class="bw-section">
                <div class="bw-section__head">
                  <select v-model.number="s.level" class="bw-btn sm" @change="bw.save()">
                    <option :value="1">{{ $t('一级') }}</option>
                    <option :value="2">{{ $t('二级') }}</option>
                    <option :value="3">{{ $t('三级') }}</option>
                  </select>
                  <input v-model="s.title" type="text" class="title" :class="`lv${s.level}`" @change="bw.save()" />
                  <label class="bw-chip static">
                    <input v-model="s.required" type="checkbox" @change="bw.save()" />{{ $t('必备') }}
                  </label>
                  <button type="button" class="bw-btn sm" :disabled="i === 0" @click="moveSection(i, -1)"><i class="ri-arrow-up-line"></i></button>
                  <button type="button" class="bw-btn sm" :disabled="i === project.sections.length - 1" @click="moveSection(i, 1)"><i class="ri-arrow-down-line"></i></button>
                  <button type="button" class="bw-btn sm danger" @click="removeSection(s.id)"><i class="ri-delete-bin-line"></i></button>
                </div>
                <div v-if="s.guide" class="bw-section__body">
                  <p class="bw-note"><i class="ri-quill-pen-line"></i>{{ s.guide }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </BwStep>

      <!-- ── 第 4 步：公司资料与资格自检 ── -->
      <BwStep
        step-key="company" :index="3" :title="bw.metas[3].title" :hint="bw.metas[3].hint" :icon="bw.metas[3].icon"
        :runtime="bw.runtime.company" :is-current="bw.currentKey.value === 'company'"
      >
        <div class="bw-hero__actions">
          <button type="button" class="bw-btn primary" :disabled="busy" @click="loadCompany(false)">
            <i class="ri-database-2-line"></i>{{ project.company.length ? $t('重新从知识库读取（保留我手填的）') : $t('从知识库读取公司资料') }}
          </button>
          <button
            v-if="manualCompanyCount" type="button" class="bw-btn" :disabled="busy"
            :title="$t('把手填的值全部丢掉，一律用知识库里的')" @click="loadCompany(true)"
          ><i class="ri-refresh-line"></i>{{ $t('用知识库覆盖手填（{n} 项）', { n: manualCompanyCount }) }}</button>
          <button type="button" class="bw-btn" @click="goKnowledge"><i class="ri-book-2-line"></i>{{ $t('去知识库补资料') }}</button>
        </div>

        <div v-if="project.company.length" class="bw-panel">
          <header class="bw-panel__head">
            <strong><i class="ri-building-2-line"></i>{{ $t('公司资料') }}</strong>
            <span class="grow"></span>
            <span class="bw-chip static" :class="missingCompanyCount ? 'warn' : 'ok'">
              {{ missingCompanyCount ? $t('缺 {n} 项', { n: missingCompanyCount }) : $t('都齐了') }}
            </span>
          </header>
          <div class="bw-panel__body">
            <table class="bw-table">
              <thead><tr><th>{{ $t('字段') }}</th><th>{{ $t('值') }}</th><th>{{ $t('来源') }}</th></tr></thead>
              <tbody>
                <tr v-for="f in project.company" :key="f.key">
                  <td class="num">{{ f.label }}</td>
                  <td><textarea v-model="f.value" rows="1" @change="markManual(f)"></textarea></td>
                  <td class="num bw-muted">
                    <span class="bw-chip static" :class="f.from === 'missing' ? 'bad' : f.from === 'manual' ? '' : 'ok'">
                      {{ f.from === 'knowledge' ? $t('知识库') : f.from === 'manual' ? $t('手填') : $t('缺') }}
                    </span>
                    <template v-if="f.source?.label">{{ f.source.label }}</template>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <p v-if="manualCompanyCount" class="bw-note">
          <i class="ri-information-line"></i>
          {{ $t('你手填了 {n} 项公司资料。', { n: manualCompanyCount }) }}
          <button type="button" class="bw-btn sm" :disabled="savingCompany" @click="saveCompanyToKnowledge">
            <i :class="savingCompany ? 'ri-loader-4-line bw-spin' : 'ri-database-2-line'"></i>{{ $t('存进知识图谱（以后自动带出）') }}
          </button>
        </p>

        <div v-if="project.qualifications.length" class="bw-panel">
          <header class="bw-panel__head">
            <strong><i class="ri-shield-check-line"></i>{{ $t('资格门槛逐条核对') }}</strong>
            <span class="grow"></span>
            <span class="bw-chip static bad" v-if="unmetCount">{{ $t('{n} 条不满足', { n: unmetCount }) }}</span>
            <span class="bw-chip static warn" v-if="unknownCount">{{ $t('{n} 条待确认', { n: unknownCount }) }}</span>
          </header>
          <div class="bw-panel__body">
            <table class="bw-table">
              <thead><tr><th>{{ $t('资格要求') }}</th><th>{{ $t('结论') }}</th><th>{{ $t('依据') }}</th></tr></thead>
              <tbody>
                <tr v-for="q in project.qualifications" :key="q.requirementId">
                  <td>{{ q.text }}</td>
                  <td class="num">
                    <select v-model="q.verdict" @change="bw.save()">
                      <option value="met">{{ $t('满足') }}</option>
                      <option value="unmet">{{ $t('不满足') }}</option>
                      <option value="unknown">{{ $t('待确认') }}</option>
                    </select>
                  </td>
                  <td class="bw-muted">{{ q.evidence || q.note || '—' }}</td>
                </tr>
              </tbody>
            </table>
            <p class="bw-note"><i class="ri-information-line"></i>{{ $t('声明类条款（无违法记录、非关联投标这类）已自动判满足 —— 随标书出具承诺函即可；需要资质、业绩、报表等材料的条款只按知识库事实判断，拿不准一律标「待确认」，请人工过一遍。') }}</p>
          </div>
        </div>

        <div v-if="evidenceDocs.length" class="bw-panel">
          <header class="bw-panel__head"><strong><i class="ri-file-list-3-line"></i>{{ $t('可作证明材料的知识库文档') }}</strong></header>
          <div class="bw-panel__body">
            <ul class="bw-muted">
              <li v-for="d in evidenceDocs" :key="d.docId">{{ d.name }} — {{ d.reason }}</li>
            </ul>
          </div>
        </div>
      </BwStep>

      <!-- ── 第 5 步：逐章成文 ── -->
      <BwStep
        step-key="compose" :index="4" :title="bw.metas[4].title" :hint="bw.metas[4].hint" :icon="bw.metas[4].icon"
        :runtime="bw.runtime.compose" :is-current="bw.currentKey.value === 'compose'"
      >
        <template #tools>
          <span class="bw-chip static">{{ $t('{done} / {total} 章已完成', { done: doneSections, total: project.sections.length }) }}</span>
          <span v-if="placeholderCount" class="bw-chip static warn">{{ $t('{n} 处待补充', { n: placeholderCount }) }}</span>
        </template>

        <BwGapForm
          :sections="project.sections" :busy="fillingGaps" :remember="rememberGaps"
          @apply="applyGaps" @update:remember="setRememberGaps"
        />

        <div class="bw-hero__actions">
          <button type="button" class="bw-btn primary" :disabled="busy || !canCompose" @click="composeAll">
            <i class="ri-quill-pen-line"></i>{{ $t('按大纲逐章生成') }}
          </button>
          <button type="button" class="bw-btn" :disabled="!composing" @click="cancelCompose">
            <i class="ri-stop-circle-line"></i>{{ $t('停止') }}
          </button>
          <span class="grow"></span>
          <span v-if="composing" class="bw-muted">{{ $t('正在写：{t}', { t: composingTitle }) }}</span>
        </div>
        <p v-if="!canCompose" class="bw-note warn">
          <i class="ri-alert-line"></i>{{ $t('先完成前面几步：要有章节大纲，且 AI 大脑已配置。') }}
        </p>

        <div class="bw-sections">
          <div v-for="s in project.sections" :key="s.id" class="bw-section" :class="`is-${s.state}`">
            <div class="bw-section__head">
              <span class="title" :class="`lv${s.level}`">{{ s.title }}</span>
              <span class="bw-chip static" :class="s.state === 'done' ? 'ok' : s.state === 'failed' ? 'bad' : ''">{{ sectionStateLabel(s.state) }}</span>
              <span v-if="s.wordCount" class="bw-muted">{{ $t('{n} 字', { n: s.wordCount }) }}</span>
              <span v-if="s.edited" class="bw-chip static">{{ $t('手工改过') }}</span>
              <button type="button" class="bw-btn sm primary" :disabled="busy || !canCompose" @click="composeOne(s.id)">
                <i :class="s.state === 'running' ? 'ri-loader-4-line bw-spin' : 'ri-quill-pen-line'"></i>
                {{ s.content ? $t('重写') : $t('生成') }}
              </button>
              <button type="button" class="bw-btn sm" @click="toggleSection(s.id)">
                <i :class="openSections.has(s.id) ? 'ri-arrow-up-s-line' : 'ri-arrow-down-s-line'"></i>{{ $t('正文') }}
              </button>
            </div>
            <p v-if="s.state === 'failed' && s.error" class="bw-note bad" style="padding: 0 10px 8px;">
              <i class="ri-error-warning-line"></i>{{ s.error }}
            </p>
            <div v-if="openSections.has(s.id)" class="bw-section__body">
              <p v-if="s.guide" class="bw-note"><i class="ri-quill-pen-line"></i>{{ s.guide }}</p>
              <label class="bw-field"><span>{{ $t('重写意见（可空）') }}</span>
                <input v-model="rewriteHints[s.id]" type="text" :placeholder="$t('例：突出运维响应时效，补一段应急预案')" />
              </label>
              <textarea v-model="s.content" :placeholder="$t('这一章还没有正文。点「生成」让 AI 按招标要求写，或者直接在这里手写。')" @change="onSectionEdited(s)"></textarea>
              <div v-if="s.placeholders?.length" class="bw-chips">
                <span v-for="p in s.placeholders" :key="p" class="bw-chip static warn"><i class="ri-error-warning-line"></i>{{ p }}</span>
              </div>
            </div>
          </div>
        </div>
      </BwStep>

      <!-- ── 第 6 步：自检与导出 ── -->
      <BwStep
        step-key="review" :index="5" :title="bw.metas[5].title" :hint="bw.metas[5].hint" :icon="bw.metas[5].icon"
        :runtime="bw.runtime.review" :is-current="bw.currentKey.value === 'review'"
      >
        <div class="bw-hero__actions">
          <button type="button" class="bw-btn primary" :disabled="busy" @click="runCheck(false)">
            <i class="ri-shield-check-line"></i>{{ $t('运行投标前自检') }}
          </button>
          <button type="button" class="bw-btn" :disabled="busy || !hasContent" @click="exportPackage(true)">
            <i class="ri-file-download-line"></i>{{ $t('导出草稿件') }}
          </button>
          <button type="button" class="bw-btn primary" :disabled="busy || !hasContent || blocked" :title="blocked ? $t('先处理掉阻断项') : ''" @click="exportPackage(false)">
            <i class="ri-verified-badge-line"></i>{{ $t('导出正式件') }}
          </button>
        </div>

        <BwGapForm
          :sections="project.sections" :busy="fillingGaps" :remember="rememberGaps"
          @apply="applyGaps" @update:remember="setRememberGaps"
        />

        <div v-if="project.compliance.length" class="bw-panel">
          <header class="bw-panel__head">
            <strong><i class="ri-list-check-3"></i>{{ $t('自检结果') }}</strong>
            <em v-if="checking" class="bw-muted"><i class="ri-loader-4-line bw-spin"></i>{{ $t('重新自检中…') }}</em>
            <span class="grow"></span>
            <span class="bw-chip static" :class="blocked ? 'bad' : 'ok'">
              {{ blocked ? $t('有阻断项，只能导草稿') : $t('可以导出正式件') }}
            </span>
          </header>
          <div class="bw-panel__body">
            <table class="bw-table">
              <tbody>
                <tr v-for="c in project.compliance" :key="c.id">
                  <td class="num">
                    <span class="bw-chip static" :class="c.level === 'blocker' ? 'bad' : c.level === 'warning' ? 'warn' : 'ok'">{{ levelLabel(c.level) }}</span>
                  </td>
                  <td><strong>{{ c.title }}</strong><div class="bw-muted">{{ c.detail }}</div></td>
                  <td class="num">
                    <button v-if="c.stepKey" type="button" class="bw-btn sm" @click="scrollToStep(c.stepKey!)">{{ $t('去处理') }}</button>
                    <button
                      v-if="c.level !== 'ok'" type="button" class="bw-btn sm"
                      :title="$t('我已核对过，这条不再阻断导出（自检表里仍会列出）')"
                      @click="ackCompliance(c.id)"
                    ><i class="ri-checkbox-circle-line"></i>{{ $t('人工确认') }}</button>
                    <button
                      v-else-if="isAcked(c.id)" type="button" class="bw-btn sm"
                      @click="unackCompliance(c.id)"
                    ><i class="ri-arrow-go-back-line"></i>{{ $t('撤销确认') }}</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div v-if="project.exports.length" class="bw-panel">
          <header class="bw-panel__head"><strong><i class="ri-folder-download-line"></i>{{ $t('已导出的文件') }}</strong></header>
          <div class="bw-panel__body">
            <table class="bw-table">
              <tbody>
                <tr v-for="(x, i) in project.exports" :key="`${x.path}_${i}`">
                  <td class="bw-mono">{{ fileName(x.path) }}</td>
                  <td class="num"><span class="bw-chip static" :class="x.draft ? 'warn' : 'ok'">{{ x.draft ? $t('草稿') : $t('正式') }}</span></td>
                  <td class="num bw-muted">{{ fmtDateTime(x.at) }}</td>
                  <td class="num">
                    <button type="button" class="bw-btn sm" @click="openPath(x.path)"><i class="ri-external-link-line"></i>{{ $t('打开') }}</button>
                    <button type="button" class="bw-btn sm" @click="openPath(x.path, true)"><i class="ri-folder-open-line"></i>{{ $t('所在文件夹') }}</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </BwStep>
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * 解决方案 · 标书制作智能体。
 *
 * 六步向导：项目目标 → 招标公告 → 标书模板 → 公司资料与资格自检 → 逐章成文 → 自检与导出。
 * 每步独立状态、失败原因落在该步上，进度条 sticky 常驻视口（docs/solution-workbench-ux-guidelines.md）。
 *
 * 这个页面本身不做任何判断逻辑：抓取、抽取、成文、自检、导出都在主进程（bidWriter.ipc），
 * 渲染层只负责编排与编辑 —— 用户随时可以改任何一处，改完落盘。
 */
import { computed, onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import type {
  BidWriterCompanyField, BidWriterNoticeHit, BidWriterRequirement, BidWriterSection, BidWriterTemplateCandidate,
} from '@totalclaw/ipc-contracts';
import PageBackButton from '../components/PageBackButton.vue';
import BwProgress from '../workbenches/bid-writer/BwProgress.vue';
import BwStep from '../workbenches/bid-writer/BwStep.vue';
import BwGapForm from '../workbenches/bid-writer/BwGapForm.vue';
import { collectPlaceholders, placeholderFor } from '../workbenches/bid-writer/placeholder';
import {
  api, bindEvents, errorMessage, fmtDateTime, levelLabel, openEmbeddedBrowser, openPath,
  requirementKindLabel, scrollToStep, sectionStateLabel, strategyOptions, useBidWriter,
} from '../workbenches/bid-writer/shared';
import { t as i18nT } from '../i18n';
import { useNotificationStore } from '../stores/notification';
import '../workbenches/bid-writer/styles.css';

const bw = useBidWriter();
const router = useRouter();
const notify = useNotificationStore();

const project = bw.project;
const busy = computed(() => bw.isRunning());
const strategies = strategyOptions();
const kindOptions: BidWriterRequirement['kind'][] = ['qualification', 'scoring', 'deliverable', 'technical', 'commercial', 'format'];

const noticeText = ref('');
const noticeWarnings = ref<string[]>([]);
const searchKeywords = ref('');
const searchUsedKeywords = ref('');
const searchHits = ref<BidWriterNoticeHit[]>([]);
const searchVia = ref<'qiye-api' | 'browser' | ''>('');
const searchNote = ref('');
const searching = ref(false);
const templateCandidates = ref<BidWriterTemplateCandidate[]>([]);
const templateNote = ref('');
const evidenceDocs = ref<Array<{ docId: string; name: string; reason: string }>>([]);
const openSections = reactive(new Set<string>());
const rewriteHints = reactive<Record<string, string>>({});
const composing = ref(false);
const composingTitle = ref('');
const pullingBidder = ref(false);
const fillingGaps = ref(false);
const savingCompany = ref(false);
const checking = ref(false);
let checkTimer: number | null = null;
/** 「填写内容存入知识图谱」开关：按项目记住（关掉 = 只在本次标书里生效） */
const rememberGaps = computed(() => project.value?.rememberGaps !== false);
function setRememberGaps(v: boolean): void {
  const p = project.value;
  if (!p) return;
  p.rememberGaps = v;
  bw.save();
}
const goalDrafting = ref(false);
const goalFallback = ref(false);
/** 用户手改过目标：点标签不再覆盖他写的东西（要重写得自己点按钮） */
const goalEdited = ref(false);
let goalTimer: number | null = null;
let cancelComposeFlag = false;
let unbind: (() => void) | null = null;

const requirements = computed<BidWriterRequirement[]>(() => project.value?.notice?.requirements || []);
/**
 * 公告要点是不是「旧解析器」留下的坏值：采购人是一句正文、预算没有单位、截止时间没有日期。
 * 判据与主进程 noticeRules 的校验同口径，这里只做提示，不自动改数据。
 */
const noticeLooksStale = computed(() => {
  const n = project.value?.notice;
  if (!n) return false;
  const buyerBad = /(提供|发送|查询|缴纳|上传|购买|获取|递交|参加)/.test(n.buyer || '');
  const budgetBad = Boolean(n.budget) && !/(元|万|亿)/.test(n.budget || '');
  const deadlineBad = Boolean(n.bidDeadline) && !/\d{4}\s*[年\-/.]|\d{1,2}\s*[:：时]/.test(n.bidDeadline || '');
  return buyerBad || budgetBad || deadlineBad;
});

const hasNoticeFacts = computed(() => {
  const n = project.value?.notice;
  return Boolean(n && (n.buyer || n.projectCode || n.budget || n.bidDeadline || n.text));
});
const requirementKinds = computed(() => kindOptions
  .map((key) => ({ key, label: requirementKindLabel(key), count: requirements.value.filter((r) => r.kind === key).length }))
  .filter((k) => k.count > 0));
const manualCompanyCount = computed(() => (project.value?.company || []).filter((f) => f.from === 'manual' && String(f.value || '').trim()).length);
const missingCompanyCount = computed(() => (project.value?.company || []).filter((f) => !String(f.value || '').trim()).length);
const unmetCount = computed(() => (project.value?.qualifications || []).filter((q) => q.verdict === 'unmet').length);
const unknownCount = computed(() => (project.value?.qualifications || []).filter((q) => q.verdict === 'unknown').length);
const doneSections = computed(() => (project.value?.sections || []).filter((s) => String(s.content || '').trim()).length);
const placeholderCount = computed(() => (project.value?.sections || []).reduce((n, s) => n + (s.placeholders?.length || 0), 0));
const canCompose = computed(() => Boolean(project.value?.sections.length) && bw.llmReady.value);
const hasContent = computed(() => doneSections.value > 0);
const blocked = computed(() => (project.value?.compliance || []).some((c) => c.level === 'blocker'));

function fileName(path: string): string {
  return String(path || '').split(/[\\/]/).pop() || path;
}

const rootChanged = computed(() => Boolean(bw.docRoot.value && bw.defaultDocRoot.value && bw.docRoot.value !== bw.defaultDocRoot.value));
/** 本项目的子目录（导过一次之后才存在，用它「打开目录」更省一步） */
const projectFolder = computed(() => {
  const first = project.value?.exports?.[0]?.path;
  if (!first) return '';
  return first;
});

/**
 * 知识库为空 / 没形成图谱时，说清楚是哪一种，而不是留个「从知识库自动带出」的空框让用户猜。
 * 用户实测反馈：投标人一直空着，看不出是没资料还是功能坏了。
 */
const knowledgeHint = computed(() => {
  const k = bw.knowledge.value;
  if (bw.defaultBidder.value) return '';
  if (!k.docCount) return i18nT('知识库里还没有文档：把营业执照、资质证书、公司简介导进去并「形成知识图谱」，投标人、信用代码、资质业绩就能自动带出来。');
  if (!k.builtCount) return i18nT('知识库里有 {n} 份文档，但都还没形成知识图谱 —— 形成之后才能抽出公司事实。', { n: k.docCount });
  if (!k.factCount) return i18nT('知识库图谱已形成但没抽出公司事实：确认导入的资料里有「公司名称 / 统一社会信用代码」这类标签，或到知识库手工补一条。');
  if (k.nearestName) {
    // 投标文件必须写营业执照上的全称，品牌名 / 简称填进去可能直接废标 —— 只提示，不替用户填
    return i18nT('知识库里有{label}「{value}」，但没有公司全称。投标人必须写营业执照上的名称，到知识库补一条「公司名称」即可自动带出。', {
      label: k.nearestName.label, value: k.nearestName.value,
    });
  }
  return i18nT('知识库里有 {n} 条事实，但没认出公司名称：到知识库把「公司名称」这条补上即可自动带出。', { n: k.factCount });
});

let disposed = false;
onMounted(async () => {
  try {
    await bw.load();
    if (disposed) return;
    noticeText.value = String(project.value?.notice?.text || '');
    noticeWarnings.value = project.value?.notice?.warnings || [];
    goalEdited.value = Boolean(String(project.value?.goal || '').trim());
  } catch (e) {
    if (!disposed) notify.error(errorMessage(e));
  }
  if (disposed) return;
  unbind = bindEvents((ev) => {
    bw.live.value = { message: ev.message, done: ev.done, total: ev.total };
    if (ev.done >= ev.total) window.setTimeout(() => { if (!bw.isRunning()) bw.live.value = null; }, 800);
  });
});

onBeforeUnmount(() => {
  disposed = true;
  if (goalTimer) { window.clearTimeout(goalTimer); goalTimer = null; }
  if (checkTimer) { window.clearTimeout(checkTimer); checkTimer = null; }
  try { unbind?.(); unbind = null; } catch { /* 忽略 */ }
  void bw.saveNow().catch((e) => notify.error(errorMessage(e)));
});

// ── 存放位置 / 知识库 ──
async function changeDocRoot(): Promise<void> {
  try {
    const r = await bw.pickDocRoot();
    if (r.error) notify.error(r.error);
    else if (r.ok) notify.success(i18nT('以后导出的标书会放到：{p}', { p: bw.docRoot.value }));
  } catch (e) {
    notify.error(errorMessage(e));
  }
}
async function restoreDocRoot(): Promise<void> {
  try {
    await bw.resetDocRoot();
    notify.success(i18nT('已恢复默认存放位置'));
  } catch (e) {
    notify.error(errorMessage(e));
  }
}
/** 现问一次知识库：用户刚去导完资料回来点这个 */
async function pullBidder(): Promise<void> {
  const p = project.value;
  if (!p) return;
  pullingBidder.value = true;
  try {
    const r = await bw.refreshKnowledge();
    if (r.companyName) {
      p.bidder = r.companyName;
      bw.save();
      notify.success(i18nT('已带出：{name}', { name: r.companyName }));
    } else {
      notify.warn(knowledgeHint.value || i18nT('知识库里没有认出公司名称'));
    }
  } catch (e) {
    notify.error(errorMessage(e));
  } finally {
    pullingBidder.value = false;
  }
}

// ── 项目 ──
function onSwitchProject(e: Event): void {
  bw.switchProject((e.target as HTMLSelectElement).value);
  goalEdited.value = Boolean(String(project.value?.goal || '').trim());
  goalFallback.value = false;
  noticeText.value = String(project.value?.notice?.text || '');
  noticeWarnings.value = project.value?.notice?.warnings || [];
  templateCandidates.value = [];
  searchHits.value = [];
  searchKeywords.value = '';
  searchNote.value = '';
}
function addProject(): void {
  bw.createProject(i18nT('未命名投标项目'));
  goalEdited.value = false;
  goalFallback.value = false;
  noticeText.value = '';
  noticeWarnings.value = [];
  templateCandidates.value = [];
  searchHits.value = [];
  searchKeywords.value = '';
  searchNote.value = '';
}
function dropProject(): void {
  const p = project.value;
  if (!p) return;
  if (!window.confirm(i18nT('删除「{name}」？已导出的文件不会被删除。', { name: p.name }))) return;
  bw.removeProject(p.id);
  noticeText.value = String(project.value?.notice?.text || '');
}
function toggleStrategy(label: string): void {
  const p = project.value;
  if (!p) return;
  p.strategies = p.strategies.includes(label) ? p.strategies.filter((s) => s !== label) : [...p.strategies, label];
  bw.save();
  // 连点几个标签只生成一次：等 800ms 没有新动作再写
  if (goalTimer) window.clearTimeout(goalTimer);
  if (!p.strategies.length) { goalTimer = null; return; }
  goalTimer = window.setTimeout(() => { goalTimer = null; void draftGoal(false); }, 800);
}

function onGoalEdited(): void {
  goalEdited.value = Boolean(String(project.value?.goal || '').trim());
  goalFallback.value = false;
  bw.save();
}

/**
 * 按所选侧重写一段投标目标。
 * @param force 用户点按钮 = 明确要重写，覆盖他自己写的内容；标签触发时不覆盖手改过的文字。
 */
/** 本地先拼一句（与主进程的兜底同口径）：点完标签立刻有字，不用盯着空框等模型 */
function localGoal(strategies: string[], name: string): string {
  const picked = strategies.filter(Boolean);
  if (!picked.length) return '';
  const head = picked.slice(0, 3).join(i18nT('、'));
  const rest = picked.slice(3);
  const tail = rest.length ? i18nT('，同时确保{rest}。', { rest: rest.join(i18nT('、')) }) : i18nT('。');
  return i18nT('本项目以{head}作为主要取胜点参与{name}投标{tail}', { head, name: name || i18nT('本项目'), tail });
}

async function draftGoal(force: boolean): Promise<void> {
  const p = project.value;
  if (!p || goalDrafting.value) return;
  if (!p.strategies.length) { if (force) notify.warn(i18nT('先选一个侧重标签')); return; }
  if (!force && goalEdited.value) return;
  // 模型要十几秒，先把本地草稿写进去 —— 用户点完标签立刻看到东西，模型版回来再替换。
  // 期间 goalEdited 保持 false，所以这版草稿不会挡住后续替换。
  const draft = localGoal(p.strategies, p.name);
  if (draft) { p.goal = draft; goalFallback.value = true; bw.save(); }
  goalDrafting.value = true;
  const requested = p.strategies.join('|');
  try {
    const r = await api().goalDraft({ projectId: p.id, strategies: p.strategies });
    if (!r?.ok || !r.text) throw new Error(r?.error || i18nT('目标没生成出来'));
    // 等待期间用户又改了标签或手动改了文案：这次的结果已经过期，不要覆盖他现在看到的
    if (goalEdited.value || project.value?.id !== p.id || p.strategies.join('|') !== requested) return;
    p.goal = String(r.text).trim();
    goalFallback.value = Boolean(r.fallback);
    goalEdited.value = false;
    bw.save();
  } catch (e) {
    // 已经有本地草稿垫底了，这里只说明为什么没润色，不把输入框清空
    if (!draft) notify.error(errorMessage(e));
  } finally {
    goalDrafting.value = false;
  }
}
function confirmProject(): void {
  const p = project.value;
  if (!p) return;
  if (!p.name.trim()) { notify.error(i18nT('先填项目名称')); return; }
  if (!p.goal.trim() && !p.strategies.length) { notify.error(i18nT('填一句投标目标，或至少选一个侧重 —— 这决定后面每一章怎么写')); return; }
  bw.done('project', i18nT('{name} · 投标人 {bidder}', { name: p.name, bidder: p.bidder || i18nT('未填') }));
}

// ── 第 2 步：公告 ──
/** 按目标检索公告：用户手上常常只有平台首页，先帮他找到具体那一条 */
async function searchNotices(): Promise<void> {
  const p = project.value;
  if (!p || searching.value) return;
  searching.value = true;
  searchNote.value = '';
  try {
    const r = await api().noticeSearch({ projectId: p.id, keywords: searchKeywords.value.trim() || undefined });
    searchUsedKeywords.value = String(r?.keywords || '');
    if (!searchKeywords.value.trim() && r?.keywords) searchKeywords.value = String(r.keywords);
    searchHits.value = Array.isArray(r?.hits) ? r.hits : [];
    searchVia.value = r?.via || '';
    const warns = [...(r?.warnings || [])];
    if (!r?.ok && r?.error) warns.unshift(r.error);
    searchNote.value = warns.join('\n');
  } catch (e) {
    searchHits.value = [];
    searchNote.value = errorMessage(e);
  } finally {
    searching.value = false;
  }
}

/** 选中一条：填进网址并直接抓取（少一步手动点） */
async function useHit(hit: BidWriterNoticeHit): Promise<void> {
  const p = project.value;
  if (!p) return;
  p.siteUrl = hit.url;
  p.notice = { ...p.notice, title: hit.title, url: hit.url };
  bw.save();
  await fetchNotice();
}

function openInBrowser(url: string): void {
  void openEmbeddedBrowser(url, 'bid-writer-preview');
}

function saveNoticeText(): void {
  const p = project.value;
  if (!p) return;
  p.notice.text = noticeText.value;
  bw.save();
}
async function loginSite(): Promise<void> {
  const p = project.value;
  if (!p?.siteUrl) return;
  const host = (() => { try { return new URL(/^https?:/i.test(p.siteUrl) ? p.siteUrl : `https://${p.siteUrl}`).hostname; } catch { return 'site'; } })();
  const ok = await openEmbeddedBrowser(p.siteUrl, `bid-writer-${host}`);
  if (!ok) notify.error(i18nT('内置浏览器不可用'));
}
async function fetchNotice(): Promise<void> {
  const p = project.value;
  if (!p) return;
  bw.start('notice');
  try {
    const r = await api().noticeFetch({ url: p.siteUrl, projectId: p.id });
    noticeWarnings.value = r?.warnings || [];
    if (!r?.ok) throw new Error(r?.error || i18nT('抓取失败'));
    noticeText.value = String(r.text || '');
    p.notice = { ...p.notice, url: r.url, title: r.title, text: noticeText.value, attachments: r.attachments || [] };
    bw.save();
    bw.runtime.notice.state = 'todo';
    notify.success(i18nT('抓到 {n} 字正文，下一步点「抽取招标要点」', { n: noticeText.value.length }));
  } catch (e) {
    bw.fail('notice', e);
  }
}
async function importNoticeFile(): Promise<void> {
  const p = project.value;
  if (!p) return;
  bw.start('notice');
  try {
    const r = await api().noticeImport();
    if (!r?.ok) {
      bw.runtime.notice.state = 'todo';
      if (r?.error) notify.error(r.error);
      return;
    }
    noticeText.value = String(r.text || '');
    noticeWarnings.value = r.warnings || [];
    p.notice = { ...p.notice, title: r.title, text: noticeText.value };
    bw.save();
    bw.runtime.notice.state = 'todo';
  } catch (e) {
    bw.fail('notice', e);
  }
}
async function extractNotice(): Promise<void> {
  const p = project.value;
  if (!p) return;
  bw.start('notice');
  try {
    const notice = await api().noticeExtract({
      projectId: p.id, text: noticeText.value, url: p.notice.url || p.siteUrl, title: p.notice.title,
      rulesOnly: !bw.llmReady.value,
    });
    p.notice = { ...notice, attachments: p.notice.attachments || notice.attachments };
    noticeWarnings.value = notice.warnings || [];
    bw.resetAfter('notice');
    bw.done('notice', i18nT('{n} 条要求 · 截止 {t}', {
      n: notice.requirements.length, t: notice.bidDeadline || i18nT('未抓到'),
    }));
    bw.save();
  } catch (e) {
    bw.fail('notice', e);
  }
}
function addRequirement(): void {
  const p = project.value;
  if (!p) return;
  p.notice.requirements = [
    ...(p.notice.requirements || []),
    { id: `manual_${Date.now().toString(36)}`, kind: 'technical', text: '', source: { kind: 'manual', label: i18nT('手工添加') } },
  ];
  bw.save();
}
function removeRequirement(id: string): void {
  const p = project.value;
  if (!p) return;
  p.notice.requirements = (p.notice.requirements || []).filter((r) => r.id !== id);
  bw.save();
}

// ── 第 3 步：模板 ──
function applyTemplate(r: any): void {
  const p = project.value;
  if (!p || !r?.ok) { if (r?.error) notify.error(r.error); return; }
  p.template = r.template;
  p.sections = r.sections || [];
  bw.resetAfter('template');
  bw.save();
  notify.success(r.warnings?.[0] || i18nT('大纲已就绪'));
}
async function importTemplate(): Promise<void> {
  const p = project.value;
  if (!p) return;
  bw.start('template');
  try {
    const r = await api().templateImport({ projectId: p.id });
    if (!r?.ok && !r?.error) { bw.runtime.template.state = 'todo'; return; } // 用户取消了文件框
    applyTemplate(r);
    if (r.ok) bw.done('template', i18nT('模板：{name} · {n} 章', { name: r.template?.name || '', n: r.sections?.length || 0 }));
    else bw.fail('template', r.error);
  } catch (e) {
    bw.fail('template', e);
  }
}
async function suggestTemplates(): Promise<void> {
  const p = project.value;
  if (!p) return;
  try {
    const r = await api().templateSuggest({ projectId: p.id, query: p.name });
    templateCandidates.value = r?.candidates || [];
    templateNote.value = r?.note || '';
  } catch (e) {
    notify.error(errorMessage(e));
  }
}
async function adoptTemplate(docId: string): Promise<void> {
  const p = project.value;
  if (!p) return;
  bw.start('template');
  try {
    const r = await api().templateAdopt({ projectId: p.id, kind: 'knowledge', docId });
    applyTemplate(r);
    if (r?.ok) bw.done('template', i18nT('模板：{name} · {n} 章', { name: r.template?.name || '', n: r.sections?.length || 0 }));
    else bw.fail('template', r?.error);
  } catch (e) {
    bw.fail('template', e);
  }
}
async function useBuiltinOutline(): Promise<void> {
  const p = project.value;
  if (!p) return;
  bw.start('template');
  try {
    const r = await api().templateAdopt({ projectId: p.id, kind: 'builtin' });
    applyTemplate(r);
    bw.done('template', i18nT('内置标准大纲 · {n} 章', { n: r?.sections?.length || 0 }));
  } catch (e) {
    bw.fail('template', e);
  }
}
function confirmOutline(): void {
  const p = project.value;
  if (!p?.sections.length) return;
  bw.done('template', i18nT('{n} 章', { n: p.sections.length }));
  bw.save();
}
function addSection(): void {
  const p = project.value;
  if (!p) return;
  p.sections.push({
    id: `sec_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 5)}`,
    level: 1, title: i18nT('新章节'), state: 'todo',
  });
  bw.save();
}
function removeSection(id: string): void {
  const p = project.value;
  if (!p) return;
  p.sections = p.sections.filter((s) => s.id !== id);
  bw.save();
}
function moveSection(index: number, delta: number): void {
  const p = project.value;
  if (!p) return;
  const next = index + delta;
  if (next < 0 || next >= p.sections.length) return;
  const arr = [...p.sections];
  [arr[index], arr[next]] = [arr[next], arr[index]];
  p.sections = arr;
  bw.save();
}

// ── 第 4 步：公司资料 ──
function markManual(f: BidWriterCompanyField): void {
  f.from = String(f.value || '').trim() ? 'manual' : 'missing';
  bw.save();
}
function goKnowledge(): void {
  void router.push('/knowledge');
}
/**
 * @param overwriteManual true = 丢掉手填值一律用知识库（用户点「用知识库覆盖手填」）。
 * 默认 false：手填优先 —— 用户比知识库更知道这次要报哪个主体。但「重新读取」时他期待的
 * 就是拿知识库的新值，所以两个入口分开摆，不靠猜。
 */
async function loadCompany(overwriteManual = false): Promise<void> {
  const p = project.value;
  if (!p) return;
  if (overwriteManual && !window.confirm(i18nT('手填的 {n} 项会被知识库里的值覆盖，确定吗？', { n: manualCompanyCount.value }))) return;
  bw.start('company');
  try {
    const r = await api().companyProfile({
      projectId: p.id,
      requirements: p.notice?.requirements || [],
      manual: overwriteManual ? [] : (p.company || []).filter((f) => f.from === 'manual'),
    });
    p.company = r?.fields || [];
    p.qualifications = r?.qualifications || [];
    evidenceDocs.value = r?.evidenceDocs || [];
    (r?.warnings || []).forEach((w: string) => notify.warn(w));
    bw.save();
    const missing = p.company.filter((f) => !String(f.value || '').trim()).length;
    bw.done('company', missing
      ? i18nT('{n} 项资料还缺，先补上再往下写', { n: missing })
      : i18nT('公司资料齐了 · {n} 条资格待核对', { n: p.qualifications.length }));
  } catch (e) {
    bw.fail('company', e);
  }
}

// ── 第 5 步：逐章成文 ──
function toggleSection(id: string): void {
  if (openSections.has(id)) openSections.delete(id);
  else openSections.add(id);
}
function onSectionEdited(s: BidWriterSection): void {
  s.edited = true;
  s.state = String(s.content || '').trim() ? 'done' : 'todo';
  s.wordCount = countWords(String(s.content || ''));
  s.placeholders = collectPlaceholders(String(s.content || ''));
  bw.save();
}
/** 与主进程 compliance.ts 同一口径，改一处要改两处（正文实时统计不值得再跨进程一趟） */
function countWords(content: string): number {
  const s = content.trim();
  if (!s) return 0;
  const han = (s.match(/[一-龥]/g) || []).length;
  const words = (s.replace(/[一-龥]/g, ' ').match(/[A-Za-z0-9][A-Za-z0-9'-]*/g) || []).length;
  return han + words;
}

async function composeOne(sectionId: string): Promise<boolean> {
  const p = project.value;
  const s = p?.sections.find((x) => x.id === sectionId);
  if (!p || !s) return false;
  s.state = 'running';
  s.error = undefined;
  composingTitle.value = s.title;
  try {
    const r = await api().sectionCompose({ projectId: p.id, sectionId, instruction: rewriteHints[sectionId] || undefined });
    if (!r?.ok) throw new Error(r?.error || i18nT('生成失败'));
    s.content = r.content;
    s.placeholders = r.placeholders || [];
    s.wordCount = r.wordCount;
    s.state = 'done';
    s.edited = false;
    s.updatedAt = Date.now();
    bw.save();
    return true;
  } catch (e) {
    s.state = 'failed';
    s.error = errorMessage(e);
    bw.save();
    return false;
  }
}
async function composeAll(): Promise<void> {
  const p = project.value;
  if (!p) return;
  cancelComposeFlag = false;
  composing.value = true;
  bw.start('compose');
  let ok = 0; let failed = 0;
  try {
    for (const s of p.sections) {
      if (cancelComposeFlag) break;
      // 手工改过的不覆盖：用户自己写的比模型写的更该留着
      if (s.edited && String(s.content || '').trim()) continue;
      if (String(s.content || '').trim() && s.state === 'done') continue;
      const success = await composeOne(s.id);
      if (success) ok += 1; else failed += 1;
    }
    if (failed) bw.fail('compose', i18nT('{ok} 章写好，{failed} 章失败（失败原因写在对应章节上）', { ok, failed }));
    else bw.done('compose', i18nT('{ok} 章写好，共 {total} 章', { ok: doneSections.value, total: p.sections.length }));
    // 报价、工期、资质编号这类只能人填 —— 写完就把缺料表顶到眼前，别让用户自己去正文里找
    const gapCount = new Set(p.sections.flatMap((s) => s.placeholders || [])).size;
    if (gapCount) {
      notify.warn(i18nT('有 {n} 项信息需要你填写（报价、工期、证书编号这类 AI 不能编），已列在「需要你填写的信息」里。', { n: gapCount }));
      void scrollToStep('compose');
    }
  } finally {
    composing.value = false;
    composingTitle.value = '';
    await bw.saveNow();
  }
}
function cancelCompose(): void {
  cancelComposeFlag = true;
}

/**
 * 把「需要你填写」表里的值回填进所有章节正文：把【待补充：X】整体换成填写值。
 * 同时（可选）写进知识库，下一个项目同名信息就能自动带出来，不用再填一遍。
 */
async function applyGaps(payload: Record<string, string>, saveToKnowledge: boolean): Promise<void> {
  const p = project.value;
  if (!p || fillingGaps.value) return;
  fillingGaps.value = true;
  try {
    let replaced = 0;
    for (const s of p.sections) {
      const before = String(s.content || '');
      if (!before) continue;
      let after = before;
      for (const [label, value] of Object.entries(payload)) {
        // 占位是协议串（不随界面语言变），见 workbenches/bid-writer/placeholder.ts
        after = after.replace(placeholderFor(label), () => { replaced += 1; return value; });
      }
      if (after !== before) {
        s.content = after;
        s.placeholders = collectPlaceholders(after);
        s.wordCount = countWords(after);
        s.edited = true;   // 人填过的内容，批量生成时不许覆盖
      }
    }
    await bw.saveNow();
    if (saveToKnowledge) await saveGapsToKnowledge(payload);
    notify.success(i18nT('已回填 {n} 处', { n: replaced }));
    if (p.sections.some((s) => (s.placeholders?.length || 0) > 0)) {
      notify.warn(i18nT('还有占位没填完，导出正式件前需要清空。'));
    }
  } catch (e) {
    notify.error(errorMessage(e));
  } finally {
    fillingGaps.value = false;
  }
}

/** 第 4 步手填的公司资料 → 知识图谱（与缺料表同一条规则：进了图谱下次就自动带出） */
async function saveCompanyToKnowledge(): Promise<void> {
  const p = project.value;
  if (!p || savingCompany.value) return;
  savingCompany.value = true;
  try {
    const payload: Record<string, string> = {};
    for (const f of p.company || []) {
      if (f.from !== 'manual') continue;
      const v = String(f.value || '').trim();
      if (v) payload[f.label] = v;
    }
    if (!Object.keys(payload).length) { notify.warn(i18nT('没有手填的内容')); return; }
    await saveGapsToKnowledge(payload);
    notify.success(i18nT('已存入知识图谱 {n} 项', { n: Object.keys(payload).length }));
  } catch (e) {
    notify.error(errorMessage(e));
  } finally {
    savingCompany.value = false;
  }
}

/** 存进知识库（当前图谱的事实），下次自动带出 */
async function saveGapsToKnowledge(payload: Record<string, string>): Promise<void> {
  const kb = (window as any).electronAPI?.knowledge;
  if (!kb?.saveFact) return;
  for (const [label, value] of Object.entries(payload)) {
    try { await kb.saveFact({ label, value, confirmed: true }); } catch { /* 单条失败不影响回填 */ }
  }
}

// ── 第 6 步：自检与导出 ──

function isAcked(id: string): boolean {
  return (project.value?.complianceAcks || []).includes(id);
}

/** 人工确认一条阻断项：不再拦导出，但自检表里仍然列着并注明是人工放行的 */
async function ackCompliance(id: string): Promise<void> {
  const p = project.value;
  if (!p) return;
  p.complianceAcks = [...new Set([...(p.complianceAcks || []), id])];
  try { await bw.saveNow(); await runCheck(true); }
  catch (e) { notify.error(errorMessage(e)); }
}

async function unackCompliance(id: string): Promise<void> {
  const p = project.value;
  if (!p) return;
  p.complianceAcks = (p.complianceAcks || []).filter((x) => x !== id);
  try { await bw.saveNow(); await runCheck(true); }
  catch (e) { notify.error(errorMessage(e)); }
}

/**
 * 自检结果跟着数据走：改过资格结论 / 补过章节 / 填过占位之后，
 * 这张表必须自己刷新 —— 否则用户把 7 条资格都点成「满足」了，这里还挂着
 * 「有 7 条资格要求还没确认」（用户 2026-09-20 实测）。防抖 900ms，只在已经跑过自检后生效。
 */
function scheduleRecheck(): void {
  if (!project.value?.compliance?.length) return;
  if (checkTimer) window.clearTimeout(checkTimer);
  checkTimer = window.setTimeout(() => { checkTimer = null; void runCheck(true); }, 900);
}

watch(
  () => {
    const p = project.value;
    if (!p) return '';
    return [
      p.qualifications.map((q) => q.verdict).join(','),
      p.sections.map((s) => `${s.state}:${(s.placeholders || []).length}:${s.wordCount || 0}`).join('|'),
      p.company.map((f) => (String(f.value || '').trim() ? 1 : 0)).join(''),
      p.notice?.bidDeadline || '',
      (p.complianceAcks || []).join(','),
    ].join('#');
  },
  () => scheduleRecheck(),
);

/** @param silent 自动重跑：不改步骤状态、不弹提示，只更新结果 */
async function runCheck(silent = false): Promise<void> {
  const p = project.value;
  if (!p || checking.value) return;
  checking.value = true;
  if (!silent) bw.start('review');
  try {
    await bw.saveNow(); // 自检读的是主进程那份快照，先把界面上的改动落盘
    const r = await api().complianceCheck({ projectId: p.id });
    p.compliance = r?.items || [];
    bw.save();
    if (silent) return;
    if (r?.blocked) bw.fail('review', i18nT('有阻断项，先处理完才能导正式件'));
    else bw.done('review', i18nT('自检通过，可以导出正式件'));
  } catch (e) {
    if (!silent) bw.fail('review', e);
  } finally {
    checking.value = false;
  }
}
async function exportPackage(draft: boolean): Promise<void> {
  const p = project.value;
  if (!p) return;
  bw.start('review');
  try {
    await bw.saveNow();
    const r = await api().exportPackage({ projectId: p.id, draft, formats: ['docx', 'pdf', 'checklist'] });
    if (!r?.ok) throw new Error(r?.error || i18nT('导出失败'));
    const at = Date.now();
    p.exports = [...(r.paths || []).map((path: string) => ({ path, kind: path.split('.').pop() || '', at, draft })), ...p.exports].slice(0, 30);
    // 导出记录立刻落盘，不走 600ms 防抖：这是「文件在哪」的唯一线索，应用这时被关掉就找不回来了
    await bw.saveNow();
    bw.done('review', draft
      ? i18nT('草稿件已导出（{n} 个文件）', { n: r.paths?.length || 0 })
      : i18nT('正式件已导出（{n} 个文件）', { n: r.paths?.length || 0 }));
  } catch (e) {
    bw.fail('review', e);
  }
}
</script>
