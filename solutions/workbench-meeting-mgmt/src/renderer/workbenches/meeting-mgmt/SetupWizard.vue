<template>
  <div class="mm-setup-overlay" role="dialog" aria-modal="true" :aria-label="$t('配置引导')" data-test="mm-setup">
    <div class="mm-sw2">
      <header class="mm-sw2__head">
        <div class="mm-sw2__title">
          <h2>{{ $t('配置引导') }}</h2>
          <p>{{ $t('把泰途会议智能管理要用到的配置一步步配好。每一步都可以先跳过，之后点右上角「配置引导」继续。') }}</p>
        </div>
        <button type="button" class="ss-btn" data-test="mm-setup-later" @click="emit('close')">{{ $t('稍后再说') }}</button>
      </header>
      <!-- 进度条固定在顶部，内容区自己滚 -->
      <div class="mm-sw2__progress" data-test="mm-setup-progress">
        <i class="mm-bar"><b :style="{ width: `${Math.round(doneCount / STEPS.length * 100)}%` }"></b></i>
        <span>{{ $t('已完成 {a} / {b}', { a: doneCount, b: STEPS.length }) }}</span>
      </div>

      <div class="mm-sw2__body">
        <nav class="mm-sw2__steps" :aria-label="$t('步骤')">
          <button
            v-for="(s, i) in STEPS" :key="s.key" type="button"
            :class="{ on: cur === s.key, ok: stepState(s.key) === 'done', skip: stepState(s.key) === 'skipped' }"
            :data-test="`mm-setup-step-${s.key}`" @click="go(s.key)"
          >
            <span class="mm-sw2__num"><i v-if="stepState(s.key) === 'done'" class="ri-check-line"></i><template v-else>{{ i + 1 }}</template></span>
            <span class="mm-sw2__stxt"><strong>{{ s.title }}</strong><small>{{ stepNote(s.key) }}</small></span>
          </button>
        </nav>

        <section class="mm-sw2__panel">
          <!-- 通讯录换成新的（企微同步 / 导入）后，原来的身份不在里面了：直接在这里选「你是谁」，选中的人成为管理员 -->
          <div v-if="needIdentity" class="mm-sw2__step" data-test="mm-setup-identity">
            <h3>{{ $t('通讯录已更新，你是哪一位？') }}</h3>
            <p class="ss-muted">{{ $t('组织已经换成新的通讯录（{n} 人），原来的演示身份不在里面了。选你自己，之后按你的身份继续配置；你会成为泰途会议智能管理的管理员。', { n: pickPeople.length }) }}</p>
            <input v-model="pickQuery" class="mm-sw2__search" type="search" :placeholder="$t('搜索姓名')" data-test="mm-setup-identity-search" />
            <div class="mm-sw2__people">
              <template v-for="g in pickGroups" :key="g.id">
                <h5>{{ g.name }}</h5>
                <button v-for="p in g.people" :key="p.id" type="button" class="mm-sw2__person" :disabled="busy" :data-test="`mm-setup-me-${p.id}`" @click="chooseMe(p.id)">
                  <strong>{{ p.name }}</strong><small>{{ p.title || '' }}</small>
                </button>
              </template>
              <p v-if="!pickGroups.length" class="ss-muted">{{ $t('没有找到这个人') }}</p>
            </div>
            <p v-if="error" class="ss-note danger"><i class="ri-error-warning-line"></i>{{ error }}</p>
          </div>
          <template v-else>
          <p v-if="loadError" class="ss-note danger"><i class="ri-error-warning-line"></i>{{ loadError }}</p>
          <p v-if="!st && !loadError" class="ss-note"><i class="ri-loader-4-line spin"></i>{{ $t('正在检测…') }}</p>
          <template v-if="st">
            <!-- 1 电脑配置与语音模型 -->
            <div v-if="cur === 'models'" class="mm-sw2__step" data-test="mm-setup-models">
              <h3>{{ $t('电脑配置与语音模型') }}</h3>
              <p class="ss-muted">{{ $t('按这台电脑的配置推荐跑得动的最准的转写模型（录音不出电脑）；也可以改填自己的在线语音识别接口。认人（声纹）始终在本机。') }}</p>
              <div class="mm-sw2__hw" data-test="mm-setup-hw">
                <div><small>{{ $t('处理器') }}</small><b>{{ st.hardware.cpu || st.hardware.arch }}</b><em>{{ $t('{n} 核', { n: st.hardware.cores }) }}</em></div>
                <div><small>{{ $t('内存') }}</small><b>{{ $t('{n} GB', { n: st.hardware.memGb }) }}</b></div>
                <div><small>{{ $t('模型所在磁盘剩余') }}</small><b>{{ st.hardware.freeDiskGb === null ? '—' : $t('{n} GB', { n: st.hardware.freeDiskGb }) }}</b></div>
                <div><small>{{ $t('评级') }}</small><b><span class="ss-chip" :class="tierClass">{{ tierText }}</span></b></div>
              </div>
              <AsrModelPicker data-test="mm-setup-asr" @changed="load" />
              <ul class="mm-sw2__items">
                <li>
                  <div><strong>{{ $t('声纹模型 CAM++') }}</strong><small>{{ $t('用来按声音认出是谁在发言') }}</small></div>
                  <span v-if="st.models.speaker" class="ss-chip ok" data-test="mm-setup-spk-ok">{{ $t('已下载') }}</span>
                  <button v-else type="button" class="ss-btn primary sm" :disabled="!!installing" data-test="mm-setup-spk-install" @click="install(st.recommend.speakerInstallId)">
                    <i :class="installing === st.recommend.speakerInstallId ? 'ri-loader-4-line spin' : 'ri-download-2-line'"></i>{{ $t('下载') }}
                  </button>
                </li>
                <li>
                  <div><strong>{{ $t('本机语音运行组件') }}</strong><small>{{ $t('随应用自带的 Python 和 ffmpeg') }}</small></div>
                  <span class="ss-chip" :class="st.models.python && st.models.ffmpeg ? 'ok' : 'bad'">{{ st.models.python && st.models.ffmpeg ? $t('正常') : $t('缺失') }}</span>
                </li>
              </ul>
              <p v-if="installLine" class="ss-muted mono mm-sw2__log" data-test="mm-setup-install-log">{{ installLine }}</p>
              <p v-if="!(st.models.python && st.models.ffmpeg)" class="ss-note danger"><i class="ri-error-warning-line"></i>{{ $t('本机语音运行组件不完整，录音没法处理。请重新安装应用，或到应用的 设置 → 语音 里修复。') }}</p>
            </div>

            <!-- 2 组织架构 -->
            <div v-else-if="cur === 'org'" class="mm-sw2__step" data-test="mm-setup-org">
              <h3>{{ $t('组织架构') }}</h3>
              <p class="ss-muted">{{ $t('任务按部门派给部门负责人，发言人只在本场参会人里认，都要先有组织架构。') }}</p>
              <p class="ss-note info" data-test="mm-setup-org-now"><i class="ri-team-line"></i>{{ $t('现在：{src} · {n} 人 · {d} 个部门', { src: orgSourceText, n: st.org.people, d: st.org.depts }) }}</p>
              <div class="mm-sw2__opts">
                <article>
                  <strong>{{ $t('先用演示组织') }}</strong>
                  <small>{{ $t('20 人、6 个部门，和原型同名，适合演示和培训。右上角「当前身份」能切到任意人推进流程。') }}</small>
                  <button type="button" class="ss-btn sm" :disabled="busy" data-test="mm-setup-org-demo" @click="useDemo">{{ st.org.source === 'demo' ? $t('就用演示组织') : $t('换回演示组织') }}</button>
                </article>
                <article>
                  <strong>{{ $t('导入通讯录表格（推荐）') }}</strong>
                  <small>{{ $t('企业微信管理后台 → 通讯录 → 批量导入/导出 → 导出成员，把导出的表格直接导进来。自己整理的表格也行：至少要有「姓名」「部门」，「手机」「账号」「是否部门负责人」「直属上级」有就更好。') }}</small>
                  <button type="button" class="ss-btn primary sm" :disabled="busy" data-test="mm-setup-org-import" @click="importOrg"><i :class="acting === 'import' ? 'ri-loader-4-line spin' : 'ri-file-excel-2-line'"></i>{{ $t('选择表格导入') }}</button>
                </article>
                <article>
                  <strong>{{ $t('企业微信自建应用') }}</strong>
                  <small>{{ $t('有自建应用（CorpID、AgentID、Secret，且本机出口 IP 在企业可信 IP 里）时，直接从企微同步通讯录，通知按人发卡片。') }}</small>
                  <div class="mm-sw2__form">
                    <input v-model="app.corpId" type="text" placeholder="CorpID" spellcheck="false" data-test="mm-setup-corp" />
                    <input v-model="app.agentId" type="text" placeholder="AgentID" spellcheck="false" data-test="mm-setup-agent" />
                    <span class="mm-sw2__secret">
                      <input v-model="app.secret" :type="showSecret ? 'text' : 'password'" :placeholder="st.wecom?.hasSecret ? $t('已保存，点右边的眼睛查看') : 'Secret'" autocomplete="new-password" spellcheck="false" data-test="mm-setup-secret" />
                      <button type="button" class="mm-sw2__eye" :title="showSecret ? $t('隐藏') : $t('查看')" :disabled="busy" data-test="mm-setup-secret-eye" @click="toggleSecret"><i :class="showSecret ? 'ri-eye-off-line' : 'ri-eye-line'"></i></button>
                    </span>
                  </div>
                  <button type="button" class="ss-btn sm" :disabled="busy || !app.corpId.trim() || !app.agentId.trim() || (!app.secret && !st.push.appConfigured)" data-test="mm-setup-app-sync" @click="saveApp"><i :class="acting === 'app' ? 'ri-loader-4-line spin' : 'ri-refresh-line'"></i>{{ $t('保存并同步通讯录') }}</button>
                  <details class="mm-sw2__guide" data-test="mm-setup-app-guide">
                    <summary>{{ $t('第一次接入：在企业微信管理后台做这几步') }}</summary>
                    <ol class="mm-sw2__ol">
                      <li>{{ $t('应用管理 → 自建 → 创建应用；可见范围选全公司（应用只能读到可见范围里的部门和成员）') }}</li>
                      <li>{{ $t('应用详情 → 开发者接口 → 网页授权及 JS-SDK → 设置可信域名：填公司备案的域名，下载 WW_verify 开头的验证文件，放到网站根目录后点验证') }}</li>
                      <li>{{ $t('同一页「企业可信 IP」：填这台电脑所在网络的公网出口 IP。不知道就先点上面的「保存并同步通讯录」，失败时这里会显示要填的 IP') }}</li>
                      <li>{{ $t('「我的企业」页面底部复制企业 ID（CorpID），应用详情里复制 AgentId 和 Secret，填到上面，再点「保存并同步通讯录」') }}</li>
                    </ol>
                  </details>
                </article>
              </div>
              <p v-if="egressIp" class="ss-note warn mm-sw2__ip" data-test="mm-setup-egress-ip">
                <i class="ri-global-line"></i>
                <span>{{ $t('企业微信要求把这个 IP 加进应用的「企业可信 IP」：') }}<b class="mono">{{ egressIp }}</b></span>
                <button type="button" class="ss-btn sm" @click="copyIp">{{ $t('复制') }}</button>
              </p>
              <div v-if="importResult" class="ss-note" :class="importResult.warnings?.length ? 'warn' : 'ok'" data-test="mm-setup-import-result">
                <i :class="importResult.warnings?.length ? 'ri-alert-line' : 'ri-checkbox-circle-line'"></i>
                <div>
                  <p>{{ $t('已导入 {n} 人、{d} 个部门（新增 {a}，变更 {c}，不在表里的 {l} 人标为离职）', { n: importResult.people, d: importResult.depts, a: importResult.added.length, c: importResult.changed.length, l: importResult.left.length }) }}</p>
                  <p v-for="(w, i) in importResult.warnings || []" :key="i">{{ w }}</p>
                </div>
              </div>
            </div>

            <!-- 3 通知推送 -->
            <div v-else-if="cur === 'push'" class="mm-sw2__step" data-test="mm-setup-push">
              <h3>{{ $t('通知推送') }}</h3>
              <p class="ss-muted">{{ $t('发言待确认、新任务、到期提醒这些通知发到哪里。不配也能用，通知只进系统内的消息中心。') }}</p>
              <p class="ss-note" :class="st.push.channel ? 'ok' : 'warn'" data-test="mm-setup-push-now">
                <i :class="st.push.channel ? 'ri-checkbox-circle-line' : 'ri-information-line'"></i>
                {{ st.push.channel === 'app' ? $t('已连接企业微信自建应用：通知按人发卡片') : st.push.channel === 'webhook' ? $t('已连接企微群机器人：通知发到群里') : $t('还没配置：通知只进消息中心') }}
              </p>
              <article class="mm-sw2__box">
                <strong>{{ $t('企微群机器人（推荐，最省事）') }}</strong>
                <ol class="mm-sw2__ol">
                  <li>{{ $t('在企业微信里打开要接收通知的内部群，点右上角「…」') }}</li>
                  <li>{{ $t('选「消息推送」（旧版叫「群机器人」）→「添加」→ 新建一个，名字可以叫「会议助手」') }}</li>
                  <li>{{ $t('复制生成的 Webhook 地址，粘贴到下面保存，再点「测试发送」看群里有没有收到') }}</li>
                </ol>
                <div class="mm-sw2__row">
                  <input v-model="hook" type="password" spellcheck="false" autocomplete="off" :placeholder="st.push.hasWebhook ? $t('已配置 {m}，要换地址再粘贴', { m: st.push.webhookMasked }) : 'https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=…'" data-test="mm-setup-hook" />
                  <button type="button" class="ss-btn primary sm" :disabled="busy || !hook.trim()" data-test="mm-setup-hook-save" @click="saveHook"><i :class="acting === 'hook' ? 'ri-loader-4-line spin' : 'ri-save-line'"></i>{{ $t('保存') }}</button>
                  <button type="button" class="ss-btn sm" :disabled="busy || !st.push.hasWebhook" data-test="mm-setup-hook-test" @click="testHook"><i :class="acting === 'hookTest' ? 'ri-loader-4-line spin' : 'ri-send-plane-line'"></i>{{ $t('测试发送') }}</button>
                </div>
                <p v-if="hookResult" class="ss-note" :class="hookResult.ok ? 'ok' : 'danger'" data-test="mm-setup-hook-result">{{ hookResult.ok ? $t('已发到群里，请到企微群里看一眼') : hookResult.error }}</p>
              </article>
              <article class="mm-sw2__box">
                <strong>{{ $t('让群消息真正提醒到人') }}</strong>
                <small>{{ $t('群机器人按手机号或企微账号提醒本人（对方企微里会有提醒）。导入的通讯录里带了就不用管；演示时可以把你自己的手机号填上，群里就会提醒到你。') }}</small>
                <p class="ss-muted" data-test="mm-setup-mentionable">{{ $t('现在能提醒到本人的：{a} / {b} 人', { a: st.org.mentionable, b: st.org.people }) }}</p>
                <div class="mm-sw2__row">
                  <span class="mm-sw2__who">{{ st.me.name }}</span>
                  <input v-model="myMobile" type="tel" :placeholder="$t('你的手机号')" data-test="mm-setup-mobile" />
                  <button type="button" class="ss-btn sm" :disabled="busy || myMobile.trim() === (st.me.mobile || '')" data-test="mm-setup-mobile-save" @click="saveMobile">{{ $t('保存') }}</button>
                </div>
                <p class="ss-muted">{{ $t('其他人的手机号、企微账号在「系统设置 → 通讯录」里逐个填。') }}</p>
              </article>
            </div>

            <!-- 4 手机端 -->
            <div v-else-if="cur === 'mobile'" class="mm-sw2__step" data-test="mm-setup-mobile-step">
              <h3>{{ $t('手机端') }}</h3>
              <p class="ss-muted">{{ $t('同事用手机确认发言、接任务、录声纹，企微消息里的按钮也跳到这里。手机要和这台电脑在同一个网络。') }}</p>
              <MobileAccessCard />
            </div>

            <!-- 5 声纹 -->
            <div v-else-if="cur === 'voice'" class="mm-sw2__step" data-test="mm-setup-voice">
              <h3>{{ $t('采集你的声纹') }}</h3>
              <p class="ss-muted">{{ $t('采集过声纹的人，上传会议录音后会被自动认出来。先录你自己的；其他同事可以扫码在手机上自己录，或管理员在「系统设置 → 声纹库」代为导入。') }}</p>
              <p class="ss-note" :class="st.me.voiceprint ? 'ok' : 'info'" data-test="mm-setup-voice-now">
                <i :class="st.me.voiceprint ? 'ri-checkbox-circle-line' : 'ri-mic-line'"></i>
                {{ st.me.voiceprint ? $t('{name} 的声纹已采集（重新录会覆盖）', { name: st.me.name }) : $t('{name} 还没有采集声纹', { name: st.me.name }) }} · {{ $t('全公司已采集 {a} / {b} 人', { a: st.voiceprints.collected, b: st.voiceprints.total }) }}
              </p>
              <p v-if="!st.models.speaker" class="ss-note warn"><i class="ri-alert-line"></i>{{ $t('还没有下载声纹模型：请先在第 1 步下载。') }}</p>
              <label class="mm-sw2__consent">
                <input v-model="consent" type="checkbox" data-test="mm-setup-consent" />
                <span>{{ $t('我同意采集本人的声纹（声音特征），并在我确认会议发言后用其中我本人的发言补充声纹（最多保留最近 5 条），只用于在会议纪要里识别我的发言，保存在这台电脑上，可以随时在声纹库关闭补充或删除声纹。') }}</span>
              </label>
              <VoiceRecorder :script="voiceScript" :disabled="busy || !st.models.speaker" @recorded="recorded = $event" @reset="recorded = null" />
              <div class="mm-sw2__row">
                <button type="button" class="ss-btn primary" :disabled="busy || !consent || !recorded || !st.models.speaker" data-test="mm-setup-voice-submit" @click="submitVoice">
                  <i :class="acting === 'voice' ? 'ri-loader-4-line spin' : 'ri-upload-2-line'"></i>{{ $t('提交声纹') }}
                </button>
                <button type="button" class="ss-link" :disabled="busy || !consent || !st.models.speaker" data-test="mm-setup-voice-import" @click="importVoice">{{ $t('改用已有的录音文件') }}</button>
              </div>
              <p v-if="voiceResult" class="ss-note" :class="voiceResult.ok ? 'ok' : 'danger'" data-test="mm-setup-voice-result">{{ voiceResult.ok ? $t('声纹已采集（{s} 秒）', { s: voiceResult.seconds }) : voiceResult.error }}</p>
            </div>

            <!-- 6 大模型 -->
            <div v-else-if="cur === 'ai'" class="mm-sw2__step" data-test="mm-setup-ai">
              <h3>{{ $t('大模型') }}</h3>
              <p class="ss-muted">{{ $t('整理议题和决议、生成执行方案、写周报和项目总结，用的是应用里当前选的大模型（会议转写和声纹不用它，只在本机）。') }}</p>
              <button type="button" class="ss-btn primary" :disabled="busy" data-test="mm-setup-llm-test" @click="testLlm"><i :class="acting === 'llm' ? 'ri-loader-4-line spin' : 'ri-flashlight-line'"></i>{{ $t('测试连接') }}</button>
              <p v-if="llm" class="ss-note" :class="llm.ok ? 'ok' : 'warn'" data-test="mm-setup-llm-result">
                <i :class="llm.ok ? 'ri-checkbox-circle-line' : 'ri-alert-line'"></i>
                {{ llm.ok ? $t('大模型可用：回复「{r}」，用时 {s} 秒', { r: llm.reply, s: ((llm.ms || 0) / 1000).toFixed(1) }) : $t('没连上大模型：纪要整理和拆任务会按规则兜底，效果差很多。请到应用的「设置 → 模型」里选一个能用的模型，再回来测试。') }}
              </p>
            </div>

            <!-- 完成 -->
            <div v-else-if="cur === 'finish'" class="mm-sw2__step" data-test="mm-setup-finish">
              <h3>{{ $t('配置完成情况') }}</h3>
              <ul class="mm-sw2__sum">
                <li v-for="s in STEPS" :key="s.key" :class="stepState(s.key)">
                  <i :class="stepState(s.key) === 'done' ? 'ri-checkbox-circle-fill' : 'ri-error-warning-line'"></i>
                  <strong>{{ s.title }}</strong><span>{{ stepNote(s.key) }}</span>
                  <button v-if="stepState(s.key) !== 'done'" type="button" class="ss-link" @click="go(s.key)">{{ $t('去配置') }}</button>
                </li>
              </ul>
              <p class="ss-muted">{{ $t('没配好的也可以先用，之后点右上角「配置引导」继续。') }}</p>
            </div>

            <p v-if="error" class="ss-note danger" data-test="mm-setup-error"><i class="ri-error-warning-line"></i>{{ error }}</p>
          </template>
          </template>
        </section>
      </div>

      <footer class="mm-sw2__foot">
        <button type="button" class="ss-btn" :disabled="idx <= 0" data-test="mm-setup-prev" @click="go(ALL[idx - 1]!)">{{ $t('上一步') }}</button>
        <span class="mm-grow"></span>
        <button v-if="cur !== 'finish' && stepState(cur) !== 'done'" type="button" class="ss-link" data-test="mm-setup-skip" @click="skip">{{ $t('先跳过') }}</button>
        <button v-if="cur !== 'finish'" type="button" class="ss-btn primary" data-test="mm-setup-next" @click="go(ALL[idx + 1]!)">{{ $t('下一步') }}</button>
        <button v-else type="button" class="ss-btn primary" :disabled="busy" data-test="mm-setup-done" @click="finish">{{ $t('完成') }}</button>
      </footer>
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * 会议智能管理 · 配置引导（管理员第一次打开工作台时自动弹出；右上角「配置引导」随时再打开）。
 * 六步：电脑配置与语音模型（检测配置、按配置推荐最准的转写模型并下载）→ 组织架构（演示 / 导入表格 / 企微自建应用）
 * → 通知推送（群机器人 / 自建应用；给自己填手机号让群里真提醒到人）→ 手机端 → 采集自己的声纹 → 大模型连接测试。
 * 每步状态独立；进度条固定在顶部（docs/solution-workbench-ux-guidelines.md）。
 */
import { computed, onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue';
import type { MmOrgSyncResult } from '../../../shared/meetingMgmt/types';
import { t as i18nT } from '../../i18n';
import { errorMessage, mm, refreshBoot, type MmMobileStatus } from './shared';
import { clearPeopleCache } from './meetingUi';
import MobileAccessCard from './MobileAccessCard.vue';
import AsrModelPicker from './AsrModelPicker.vue';
import VoiceRecorder from './VoiceRecorder.vue';

type StepKey = 'models' | 'org' | 'push' | 'mobile' | 'voice' | 'ai';
const STEPS: Array<{ key: StepKey; title: string }> = [
  { key: 'models', title: i18nT('电脑配置与语音模型') },
  { key: 'org', title: i18nT('组织架构') },
  { key: 'push', title: i18nT('通知推送') },
  { key: 'mobile', title: i18nT('手机端') },
  { key: 'voice', title: i18nT('采集你的声纹') },
  { key: 'ai', title: i18nT('大模型') },
];
const ALL: Array<StepKey | 'finish'> = [...STEPS.map((s) => s.key), 'finish'];

interface SetupStatus {
  done: boolean;
  org: { source: 'wecom' | 'demo' | 'import' | 'none'; people: number; depts: number; lastSync: MmOrgSyncResult | null; mentionable: number };
  push: { channel: 'app' | 'webhook' | null; hasWebhook: boolean; webhookMasked: string; appConfigured: boolean };
  wecom?: { corpId: string; agentId: string; hasSecret: boolean };
  me: { id: string; name: string; deptName: string; mobile: string; voiceprint: boolean };
  mobile: MmMobileStatus;
  voiceprints: { collected: number; total: number };
  hardware: { cpu: string; cores: number; memGb: number; arch: string; platform: string; appleSilicon: boolean; freeDiskGb: number | null };
  models: { python: boolean; ffmpeg: boolean; asrModel: string | null; senseVoice?: boolean; fireRed?: boolean; speaker: boolean; asrReady: boolean };
  recommend: { engine: 'firered' | 'sensevoice'; installIds: string[]; sizeMb: number; estMinPerHour: number; workers: number; downgradeReason?: 'memory' | 'cores' | 'disk'; tier: 'good' | 'ok' | 'weak'; speakerInstallId: string };
  asr?: { mode: 'local' | 'agent' | 'cloud'; cloud: { hasKey: boolean } | null };
}

const emit = defineEmits<{ (e: 'close'): void; (e: 'done'): void }>();

const st = ref<SetupStatus | null>(null);
const cur = ref<StepKey | 'finish'>('models');
const idx = computed(() => ALL.indexOf(cur.value));
const skipped = reactive(new Set<StepKey>());
const loadError = ref('');
const error = ref('');
const busy = ref(false);
const acting = ref('');
const installing = ref('');
const installLine = ref('');
const importResult = ref<(MmOrgSyncResult & { people: number; depts: number }) | null>(null);
const app = reactive({ corpId: '', agentId: '', secret: '' });
const hook = ref('');
const hookResult = ref<{ ok: boolean; error?: string } | null>(null);
const myMobile = ref('');
const consent = ref(false);
const recorded = ref<{ data: string; ext: string; seconds: number } | null>(null);
const voiceResult = ref<{ ok: boolean; seconds?: number; error?: string } | null>(null);
const llm = ref<{ ok: boolean; reply?: string; ms?: number } | null>(null);
const orgConfirmed = ref(false);
const showSecret = ref(false);
const needIdentity = ref(false);
const pickPeople = ref<Array<{ id: string; name: string; deptId: string; title?: string }>>([]);
const pickDepts = ref<Array<{ id: string; name: string }>>([]);
const pickQuery = ref('');
const pickGroups = computed(() => {
  const q = pickQuery.value.trim();
  const list = q ? pickPeople.value.filter((p) => p.name.includes(q)) : pickPeople.value;
  const out: Array<{ id: string; name: string; people: typeof list }> = [];
  for (const d of pickDepts.value) {
    const people = list.filter((p) => p.deptId === d.id);
    if (people.length) out.push({ id: d.id, name: d.name, people });
  }
  const rest = list.filter((p) => !pickDepts.value.some((d) => d.id === p.deptId));
  if (rest.length) out.push({ id: '_', name: i18nT('其他'), people: rest });
  return out;
});
/** 自建应用同步失败（企微 60020：出口 IP 不在可信 IP 里）时，错误里带着本机出口 IP：单独拿出来给管理员复制 */
const egressIp = computed(() => (/60020|可信 IP|trusted IP/i.test(error.value) ? (/(\d{1,3}(?:\.\d{1,3}){3})/.exec(error.value)?.[1] ?? '') : ''));
async function copyIp(): Promise<void> {
  try { await navigator.clipboard.writeText(egressIp.value); } catch { /* 剪贴板不可用 */ }
}

const IDENTITY_GONE = /当前身份无效|请先选择身份|identity is invalid|select an identity/i;

async function load(): Promise<void> {
  try {
    st.value = await mm<SetupStatus>('setup.status');
    loadError.value = '';
    needIdentity.value = false;
    myMobile.value = st.value.me.mobile || '';
    // 已填过的自建应用原样带出（不让人以为被删了）
    if (!app.corpId && st.value.wecom?.corpId) app.corpId = st.value.wecom.corpId;
    if (!app.agentId && st.value.wecom?.agentId) app.agentId = st.value.wecom.agentId;
  } catch (e) {
    const msg = errorMessage(e);
    if (IDENTITY_GONE.test(msg)) await askIdentity();
    else loadError.value = msg;
  }
}

/** 通讯录换了、当前身份不在里面：列出新通讯录让管理员选自己 */
async function askIdentity(): Promise<void> {
  try {
    const r = await mm<{ depts: Array<{ id: string; name: string }>; people: Array<{ id: string; name: string; deptId: string; title?: string }> }>('people.list');
    pickDepts.value = r?.depts ?? [];
    pickPeople.value = r?.people ?? [];
  } catch { /* 读不到就是空列表 */ }
  pickQuery.value = '';
  needIdentity.value = true;
}

function chooseMe(personId: string): Promise<void> {
  return run('identity', async () => {
    await mm('identity.set', { personId });
    clearPeopleCache();
    await refreshBoot().catch(() => null);
    needIdentity.value = false;
    await load();
  });
}

async function toggleSecret(): Promise<void> {
  if (!showSecret.value && !app.secret && st.value?.wecom?.hasSecret) {
    try {
      const r = await mm<{ secret: string }>('wecom.secret.reveal');
      app.secret = r?.secret || '';
    } catch (e) {
      error.value = errorMessage(e);
      return;
    }
  }
  showSecret.value = !showSecret.value;
}

function stepDone(k: StepKey): boolean {
  const s = st.value;
  if (!s) return false;
  switch (k) {
    // 转写：推荐的本机模型下好了，或者已经改用在线接口（填了 Key）；认人的声纹模型和运行组件两种方式都要
    case 'models': return (s.models.asrReady || (s.asr?.mode === 'cloud' && !!s.asr.cloud?.hasKey)) && s.models.speaker && s.models.python && s.models.ffmpeg;
    case 'org': return s.org.people > 0 && (s.org.source !== 'demo' || orgConfirmed.value);
    case 'push': return !!s.push.channel;
    case 'mobile': return s.mobile.running;
    case 'voice': return s.me.voiceprint;
    case 'ai': return !!llm.value?.ok;
  }
}
function stepState(k: StepKey | 'finish'): 'done' | 'skipped' | 'todo' {
  if (k === 'finish') return 'todo';
  return stepDone(k) ? 'done' : skipped.has(k) ? 'skipped' : 'todo';
}
const doneCount = computed(() => STEPS.filter((s) => stepDone(s.key)).length);

function stepNote(k: StepKey): string {
  const s = st.value;
  if (!s) return '';
  switch (k) {
    case 'models': {
      const m = s.asr?.mode === 'cloud' ? i18nT('在线接口') : s.recommend.engine === 'firered' ? 'FireRedASR2' : 'SenseVoice';
      return stepDone(k) ? i18nT('{m} 和声纹模型已就绪', { m }) : i18nT('推荐 {m}', { m });
    }
    case 'org': return i18nT('{src} · {n} 人', { src: orgSourceText.value, n: s.org.people });
    case 'push': return s.push.channel === 'app' ? i18nT('企微自建应用') : s.push.channel === 'webhook' ? i18nT('企微群机器人') : i18nT('只进消息中心');
    case 'mobile': return s.mobile.running ? i18nT('运行中') : i18nT('未开启');
    case 'voice': return s.me.voiceprint ? i18nT('已采集') : i18nT('未采集');
    case 'ai': return llm.value ? (llm.value.ok ? i18nT('可用') : i18nT('没连上')) : i18nT('未测试');
  }
}

const orgSourceText = computed(() => {
  const src = st.value?.org.source;
  return src === 'wecom' ? i18nT('企微通讯录') : src === 'import' ? i18nT('导入的通讯录') : src === 'demo' ? i18nT('演示组织') : i18nT('还没有组织');
});
const tierText = computed(() => ({ good: i18nT('配置很好'), ok: i18nT('够用'), weak: i18nT('偏弱') })[st.value?.recommend.tier || 'ok']);
const tierClass = computed(() => ({ good: 'ok', ok: 'brand', weak: 'warn' })[st.value?.recommend.tier || 'ok']);
const voiceScript = computed(() => i18nT('大家好，我是{dept}的{name}。这是我的声纹采集录音，用于在会议纪要里自动识别我的发言。我会用平时开会说话的音量和语速，把这段话完整地读完。', {
  dept: st.value?.me.deptName || '', name: st.value?.me.name || '',
}));

async function run(kind: string, fn: () => Promise<void>): Promise<void> {
  busy.value = true;
  acting.value = kind;
  error.value = '';
  try { await fn(); } catch (e) { error.value = errorMessage(e); } finally { busy.value = false; acting.value = ''; }
}

function go(k: StepKey | 'finish'): void {
  if (!k) return;
  cur.value = k;
  error.value = '';
}
function skip(): void {
  if (cur.value !== 'finish') skipped.add(cur.value);
  go(ALL[idx.value + 1]!);
}

// 手机端这一步：能自动开就替用户开好
watch(cur, (k) => {
  if (k === 'mobile' && st.value && !st.value.mobile.running) void run('mobile', async () => { await mm('mobile.start'); await load(); await refreshBoot().catch(() => null); });
});

// ── 模型下载（复用应用的组件安装器：electronAPI.pyExt）──
const pyExt = () => (window as any).electronAPI?.pyExt;
let unsubProgress: (() => void) | null = null;
async function install(id: string): Promise<void> {
  const a = pyExt();
  if (!a?.install) { error.value = i18nT('组件安装器不可用，请到应用的 设置 → 语音 里下载'); return; }
  installing.value = id;
  installLine.value = i18nT('开始下载…');
  error.value = '';
  try {
    const r = await a.install(id);
    if (!r?.ok) error.value = r?.error || i18nT('下载失败');
    else installLine.value = i18nT('下载完成');
    await load();
  } catch (e) {
    error.value = errorMessage(e);
  } finally {
    installing.value = '';
  }
}

// ── 组织 ──
function useDemo(): Promise<void> {
  return run('demo', async () => {
    const r = st.value?.org.source !== 'demo' ? await mm<{ needIdentity?: boolean }>('org.sync') : null;
    orgConfirmed.value = true;
    await refreshBoot().catch(() => null);
    if (r?.needIdentity) await askIdentity();
    else await load();
  });
}
function importOrg(): Promise<void> {
  return run('import', async () => {
    const r = await mm<(MmOrgSyncResult & { people: number; depts: number; needIdentity?: boolean }) | null>('org.importFile');
    if (!r) return;
    importResult.value = r;
    await refreshBoot().catch(() => null);
    if (r.needIdentity) await askIdentity();
    else await load();
  });
}
function saveApp(): Promise<void> {
  return run('app', async () => {
    const payload: Record<string, string> = { corpId: app.corpId.trim(), agentId: app.agentId.trim() };
    if (app.secret) payload.secret = app.secret;
    await mm('wecom.save', payload);
    // 填好的 Secret 留在框里（已加密保存在本机），不清空
    const r = await mm<MmOrgSyncResult & { needIdentity?: boolean }>('org.sync');
    if (r?.error) throw new Error(r.error);
    await refreshBoot().catch(() => null);
    if (r?.needIdentity) await askIdentity();
    else await load();
  });
}

// ── 推送 ──
function saveHook(): Promise<void> {
  return run('hook', async () => {
    hookResult.value = null;
    await mm('wecom.webhook.save', { url: hook.value.trim() });
    hook.value = '';
    await load();
    await refreshBoot().catch(() => null);
  });
}
function testHook(): Promise<void> {
  return run('hookTest', async () => {
    const r = await mm<{ ok: boolean; error?: string }>('wecom.webhook.test');
    hookResult.value = { ok: !!r?.ok, error: r?.error };
  });
}
function saveMobile(): Promise<void> {
  return run('mobileNo', async () => {
    if (!st.value) return;
    await mm('org.person.contact', { personId: st.value.me.id, mobile: myMobile.value.trim() });
    await load();
  });
}

// ── 声纹 ──
function submitVoice(): Promise<void> {
  return run('voice', async () => {
    if (!recorded.value || !st.value) return;
    voiceResult.value = null;
    try {
      const r = await mm<{ ok: boolean; seconds: number }>('voiceprint.enrollData', { personId: st.value.me.id, consent: true, data: recorded.value.data, ext: recorded.value.ext });
      voiceResult.value = { ok: true, seconds: r?.seconds };
    } catch (e) {
      voiceResult.value = { ok: false, error: errorMessage(e) };
    }
    await load();
  });
}
function importVoice(): Promise<void> {
  return run('voice', async () => {
    if (!st.value) return;
    voiceResult.value = null;
    try {
      const r = await mm<{ ok: boolean; seconds: number } | null>('voiceprint.import', { personId: st.value.me.id, consent: true });
      if (r) voiceResult.value = { ok: true, seconds: r.seconds };
    } catch (e) {
      voiceResult.value = { ok: false, error: errorMessage(e) };
    }
    await load();
  });
}

// ── 大模型 ──
function testLlm(): Promise<void> {
  return run('llm', async () => { llm.value = await mm<{ ok: boolean; reply?: string; ms?: number }>('setup.llmTest'); });
}

function finish(): Promise<void> {
  return run('finish', async () => {
    await mm('setup.finish');
    await refreshBoot().catch(() => null);
    emit('done');
  });
}

onMounted(() => {
  void load();
  const a = pyExt();
  if (a?.onInstallProgress) {
    unsubProgress = a.onInstallProgress((p: { id?: string; phase?: string; line?: string }) => {
      if (p?.id && p.id === installing.value && p.line) installLine.value = String(p.line).slice(0, 200);
    });
  }
});
onBeforeUnmount(() => { try { unsubProgress?.(); } catch { /* */ } });
</script>

<style scoped>
.mm-setup-overlay { position: fixed; inset: 0; z-index: 900; background: color-mix(in srgb, #000 42%, transparent); display: grid; place-items: center; padding: 24px; }
.mm-sw2 { width: min(1080px, 100%); height: min(760px, 100%); background: var(--color-bg-elevated, var(--color-bg)); border-radius: var(--radius-6, 14px); box-shadow: 0 24px 64px rgba(0, 0, 0, 0.25); display: grid; grid-template-rows: auto auto 1fr auto; overflow: hidden; }
.mm-sw2__head { display: flex; align-items: flex-start; gap: 16px; padding: 18px 22px 10px; }
.mm-sw2__title { flex: 1; display: grid; gap: 4px; }
.mm-sw2__title h2 { margin: 0; font-size: 19px; }
.mm-sw2__title p { margin: 0; font-size: 13px; color: var(--color-text-secondary); }
.mm-sw2__progress { display: flex; align-items: center; gap: 12px; padding: 0 22px 12px; border-bottom: 1px solid var(--color-border-subtle); font-size: 12.5px; color: var(--color-text-secondary); }
.mm-sw2__progress .mm-bar { flex: 1; height: 6px; border-radius: 3px; background: var(--color-border-subtle); overflow: hidden; display: block; }
.mm-sw2__progress .mm-bar b { display: block; height: 100%; background: var(--color-brand); transition: width 200ms; }
.mm-sw2__body { display: grid; grid-template-columns: 240px 1fr; min-height: 0; }
.mm-sw2__steps { border-inline-end: 1px solid var(--color-border-subtle); padding: 12px; display: grid; align-content: start; gap: 4px; overflow-y: auto; }
.mm-sw2__steps button { display: flex; gap: 10px; align-items: flex-start; text-align: start; padding: 10px; border: 0; border-radius: var(--radius-4); background: none; cursor: pointer; color: inherit; }
.mm-sw2__steps button.on { background: color-mix(in srgb, var(--color-brand) 10%, transparent); }
.mm-sw2__num { flex: 0 0 24px; height: 24px; border-radius: 50%; display: grid; place-items: center; font-size: 12px; font-weight: 700; background: var(--color-border-subtle); }
.mm-sw2__steps button.ok .mm-sw2__num { background: var(--color-success); color: #fff; }
.mm-sw2__steps button.skip .mm-sw2__num { background: color-mix(in srgb, var(--color-warning) 30%, transparent); }
.mm-sw2__stxt { display: grid; gap: 2px; min-width: 0; }
.mm-sw2__stxt strong { font-size: 13.5px; }
.mm-sw2__stxt small { font-size: 12px; color: var(--color-text-secondary); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.mm-sw2__panel { padding: 18px 22px; overflow-y: auto; min-height: 0; }
.mm-sw2__step { display: grid; gap: 12px; }
.mm-sw2__step h3 { margin: 0; font-size: 16px; }
.mm-sw2__hw { display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: 10px; }
.mm-sw2__hw > div { display: grid; gap: 4px; padding: 12px; border: 1px solid var(--color-border); border-radius: var(--radius-4); }
.mm-sw2__hw small { font-size: 12px; color: var(--color-text-secondary); }
.mm-sw2__hw b { font-size: 14px; overflow-wrap: anywhere; }
.mm-sw2__hw em { font-style: normal; font-size: 12px; color: var(--color-text-secondary); }
.mm-sw2__items { list-style: none; margin: 0; padding: 0; display: grid; gap: 8px; }
.mm-sw2__items > li { display: flex; align-items: center; gap: 12px; padding: 10px 12px; border: 1px solid var(--color-border-subtle); border-radius: var(--radius-4); }
.mm-sw2__items > li > div { flex: 1; display: grid; gap: 2px; }
.mm-sw2__items small { font-size: 12px; color: var(--color-text-secondary); }
.mm-sw2__items > li.mm-sw2__sub { border: 0; padding: 0 12px; font-size: 12.5px; color: var(--color-text-secondary); }
.mm-sw2__log { margin: 0; font-size: 12px; overflow-wrap: anywhere; }
.mm-sw2__opts { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 10px; }
.mm-sw2__opts article, .mm-sw2__box { display: grid; gap: 8px; align-content: start; padding: 14px; border: 1px solid var(--color-border); border-radius: var(--radius-5, 10px); }
.mm-sw2__opts small, .mm-sw2__box small { font-size: 12.5px; color: var(--color-text-secondary); line-height: 1.6; }
.mm-sw2__opts article .ss-btn { justify-self: start; }
.mm-sw2__form { display: grid; gap: 6px; }
.mm-sw2__form input, .mm-sw2__row input { padding: 7px 10px; border: 1px solid var(--color-border); border-radius: var(--radius-3, 6px); background: var(--color-bg); color: inherit; font: inherit; font-size: 13px; min-width: 0; }
.mm-sw2__row { display: flex; gap: 8px; align-items: center; flex-wrap: wrap; }
.mm-sw2__row input { flex: 1; min-width: 200px; }
.mm-sw2__who { font-weight: 600; font-size: 13px; }
.mm-sw2__ol { margin: 0; padding-inline-start: 20px; display: grid; gap: 3px; font-size: 13px; line-height: 1.6; color: var(--color-text-secondary); }
.mm-sw2__secret { position: relative; display: block; }
.mm-sw2__secret input { width: 100%; box-sizing: border-box; padding-inline-end: 34px; }
.mm-sw2__eye { position: absolute; inset-inline-end: 4px; top: 50%; transform: translateY(-50%); border: 0; background: none; cursor: pointer; color: var(--color-text-secondary); font-size: 16px; padding: 4px; }
.mm-sw2__search { padding: 7px 10px; border: 1px solid var(--color-border); border-radius: var(--radius-3, 6px); background: var(--color-bg); color: inherit; font: inherit; font-size: 13px; max-width: 320px; }
.mm-sw2__people { display: block; }
.mm-sw2__people h5 { margin: 8px 0 2px; font-size: 12px; color: var(--color-text-secondary); }
.mm-sw2__person { display: inline-flex; align-items: baseline; gap: 8px; margin: 0 8px 6px 0; padding: 8px 12px; border: 1px solid var(--color-border); border-radius: var(--radius-4); background: var(--color-bg); cursor: pointer; color: inherit; font: inherit; }
.mm-sw2__person:hover { border-color: var(--color-brand); }
.mm-sw2__person small { color: var(--color-text-secondary); font-size: 12px; }
.mm-sw2__guide summary { cursor: pointer; font-size: 12.5px; color: var(--color-brand); }
.mm-sw2__guide .mm-sw2__ol { margin-top: 6px; font-size: 12.5px; }
.mm-sw2__ip { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
.mm-sw2__ip b { font-size: 14px; margin-inline-start: 4px; }
.mm-sw2__consent { display: flex; gap: 8px; align-items: flex-start; font-size: 12.5px; line-height: 1.55; padding: 10px 12px; border-radius: var(--radius-4); background: color-mix(in srgb, var(--color-warning) 10%, transparent); }
.mm-sw2__consent input { margin-top: 3px; }
.mm-sw2__sum { list-style: none; margin: 0; padding: 0; display: grid; gap: 8px; }
.mm-sw2__sum li { display: flex; gap: 10px; align-items: center; padding: 10px 12px; border-radius: var(--radius-4); border: 1px solid var(--color-border-subtle); font-size: 13px; }
.mm-sw2__sum li i { font-size: 18px; color: var(--color-warning); }
.mm-sw2__sum li.done i { color: var(--color-success); }
.mm-sw2__sum li span { flex: 1; color: var(--color-text-secondary); }
.mm-sw2__foot { display: flex; align-items: center; gap: 10px; padding: 12px 22px; border-top: 1px solid var(--color-border-subtle); }
.mm-grow { flex: 1; }
.spin { animation: mm-sw2-spin 1s linear infinite; }
@keyframes mm-sw2-spin { to { transform: rotate(360deg); } }
@media (max-width: 760px) {
  .mm-sw2__body { grid-template-columns: 1fr; }
  .mm-sw2__steps { grid-auto-flow: column; grid-auto-columns: max-content; overflow-x: auto; border-inline-end: 0; border-bottom: 1px solid var(--color-border-subtle); }
}
</style>
