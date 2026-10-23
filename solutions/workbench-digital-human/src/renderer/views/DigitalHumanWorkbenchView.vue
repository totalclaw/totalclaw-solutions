<template>
  <div class="workbench dh-workbench" :dir="isRtl ? 'rtl' : 'ltr'">
    <header class="hero">
      <PageBackButton />
      <div class="hero-copy">
        <div class="eyebrow">{{ $t('数字人') }}</div>
        <h1>{{ $t('数字人口播与直播工作台') }}</h1>
        <p>{{ $t('把文稿或 LLM 输出交给数字人念出来：离线出成片，或起一路实时会话做直播 / 教课。') }}</p>
      </div>
      <div class="hero-actions">
        <button class="button secondary" type="button" :disabled="statusLoading" @click="loadStatus">
          <i :class="statusLoading ? 'ri-loader-4-line spin' : 'ri-refresh-line'"></i>
          {{ statusLoading ? $t('正在检查…') : $t('刷新状态') }}
        </button>
      </div>
    </header>

    <!--
      计费横幅常驻：实时数字人按并发路数 / 在线时长计费，且**云厂商不会自动停机**。
      「N 路在跑」和急停按钮必须一直在视口里，不能滚出去 —— 忘了停的代价是账单。
    -->
    <div v-if="tracked.length" class="dh-billing" role="status">
      <i class="ri-money-cny-circle-line"></i>
      <span class="dh-billing-text">
        <strong>{{ $t('{p0} 路实时会话进行中', { p0: tracked.length }) }}</strong>
        <small>{{ $t('实时数字人按时长计费，云厂商不会自动停机。不用了请停掉。') }}</small>
      </span>
      <button class="button ghost" type="button" :disabled="busy" @click="stopAll(false)">{{ $t('全部停止') }}</button>
      <button class="button danger" type="button" :disabled="busy" @click="stopAll(true)">{{ $t('急停') }}</button>
    </div>

    <nav class="workbench-tabs">
      <button
        v-for="tab in TABS" :key="tab.id" type="button"
        :class="['tab', { active: activeTab === tab.id }]"
        @click="activeTab = tab.id"
      >
        <i :class="tab.icon"></i>{{ $t(tab.label) }}
      </button>
    </nav>

    <!-- ══ 配置 ══════════════════════════════════════════════════════════ -->
    <section v-show="activeTab === 'config'" class="panel">
      <div class="section-heading">
        <div>
          <span class="section-kicker">{{ $t('第 1 步 · 先把凭据配上') }}</span>
          <h2>{{ $t('数字人服务配置') }}</h2>
          <p>{{ $t('凭据写在本机的 agent 配置里，不上传。改完点「保存并测试」会立刻回读一次真实状态。') }}</p>
        </div>
        <span :class="['status-pill', statusTone]">
          <i class="ri-checkbox-blank-circle-fill"></i>{{ statusLabel }}
        </span>
      </div>

      <div v-if="statusError" class="message error" role="alert">
        <i class="ri-error-warning-line"></i><span>{{ statusError }}</span>
      </div>

      <div class="dh-form">
        <label class="sp-toggle">
          <input v-model="cfg.enabled" type="checkbox" />
          <span class="sp-track"></span>
          <span class="sp-toggle-text">
            <strong>{{ $t('启用数字人') }}</strong>
            <small>{{ $t('关着时数字人工具对模型仍可见，但调用会返回「未启用」的引导，不会误起会话。') }}</small>
          </span>
        </label>

        <label class="dh-field">
          <span>{{ $t('Provider（留空 = 按运行区域自动选，推荐）') }}</span>
          <select v-model="cfg.provider">
            <option value="">{{ $t('自动（按区域与能力选）') }}</option>
            <option v-for="p in providers" :key="p.name" :value="p.name">
              {{ p.name }} · {{ p.region || '—' }} · {{ (p.modes || []).join('/') || '—' }}
            </option>
          </select>
          <small>{{ $t('只有支持实时的 provider 才会被实时路径选中；离线-only 的 provider 显式指定会被拒。') }}</small>
        </label>

        <label class="dh-field">
          <span>{{ $t('跨区策略') }}</span>
          <select v-model="cfg.regionPolicy">
            <option value="prefer">{{ $t('prefer · 同区优先，跨区兜底') }}</option>
            <option value="strict">{{ $t('strict · 跨区直接拒（数据出境合规用）') }}</option>
            <option value="off">{{ $t('off · 不分区') }}</option>
          </select>
        </label>

        <div class="dh-row">
          <label class="dh-field">
            <span>{{ $t('缺省形象 code') }}</span>
            <input v-model="cfg.defaultAvatarId" type="text" placeholder="CH_2d_xxx" />
          </label>
          <label class="dh-field">
            <span>{{ $t('缺省音色 id') }}</span>
            <input v-model="cfg.defaultVoiceId" type="text" :placeholder="$t('留空用形象绑定的默认音色')" />
          </label>
        </div>

        <details class="dh-cred" open>
          <summary>{{ $t('阿里云数字人（境内，离线已实测）') }}</summary>
          <div class="dh-row">
            <label class="dh-field">
              <span>AccessKey ID</span>
              <input v-model="cred.aliyunDvh.accessKeyId" type="text" autocomplete="off" />
            </label>
            <label class="dh-field">
              <span>AccessKey Secret</span>
              <input v-model="cred.aliyunDvh.accessKeySecret" type="password" autocomplete="off" />
            </label>
          </div>
          <div class="dh-row">
            <label class="dh-field">
              <span>{{ $t('租户 id（控制台「开发者信息」页，不是账号 UID）') }}</span>
              <input v-model="cred.aliyunDvh.tenantId" type="text" />
            </label>
            <label class="dh-field">
              <span>{{ $t('数字人应用 App ID') }}</span>
              <input v-model="cred.aliyunDvh.appId" type="text" />
            </label>
          </div>
          <label class="dh-field">
            <span>{{ $t('接入区域') }}</span>
            <input v-model="cred.aliyunDvh.region" type="text" placeholder="cn-zhangjiakou" />
            <!-- 这条是实测结论，不是猜的：其它域名 DNS 直接 NXDOMAIN，而报错会伪装成 TLS 故障 -->
            <small>{{ $t('实测只有张家口一个接入点；填别的域名会 DNS 解析失败，且报错看着像网络问题。') }}</small>
          </label>
          <p class="dh-tip">
            {{ $t('买了套餐 ≠ 有应用：起实时会话前必须先在控制台创建数字人应用，否则被拒（10010023）。离线合成不需要。') }}
          </p>
        </details>

        <details class="dh-cred">
          <summary>{{ $t('HeyGen（境外）') }}</summary>
          <label class="dh-field">
            <span>API Key</span>
            <input v-model="cred.heygen.apiKey" type="password" autocomplete="off" />
          </label>
        </details>

        <details class="dh-cred">
          <summary>{{ $t('LiveTalking（私有化自建）') }}</summary>
          <label class="dh-field">
            <span>{{ $t('服务地址') }}</span>
            <input v-model="cred.livetalking.endpoint" type="text" placeholder="http://10.0.0.5:8010" />
            <small>{{ $t('数据不出内网；不按分钟计费，忘关只占 GPU 槽位。会话由端侧发起（WebRTC SDP 交换）。') }}</small>
          </label>
        </details>

        <div class="dh-actions">
          <button class="button primary" type="button" :disabled="busy" @click="saveConfig">
            <i :class="busy ? 'ri-loader-4-line spin' : 'ri-save-line'"></i>{{ $t('保存并测试') }}
          </button>
          <span v-if="saveHint" class="dh-hint">{{ saveHint }}</span>
        </div>
      </div>

      <div v-if="providers.length" class="dh-providers">
        <article v-for="p in providers" :key="p.name" class="dh-provider">
          <strong>{{ p.name }}</strong>
          <span :class="['mini-status', p.isAvailable ? 'available' : 'unknown']">
            {{ p.isAvailable ? $t('已连接') : $t('未就绪') }}
          </span>
          <small>{{ p.unavailableReason || [(p.region || ''), (p.modes || []).join('/')].filter(Boolean).join(' · ') }}</small>
        </article>
      </div>

      <!-- 运行时可插拔依赖：部分 provider（阿里云 DVH/IMS、火山）需额外 SDK，按需在线安装，免重装应用 -->
      <PyExtInstaller group="digital_human" style="margin-top:16px" />
    </section>

    <!-- ══ 离线成片 ════════════════════════════════════════════════════ -->
    <section v-show="activeTab === 'offline'" class="panel">
      <div class="section-heading">
        <div>
          <span class="section-kicker">{{ $t('离线口播') }}</span>
          <h2>{{ $t('文稿出成片') }}</h2>
          <p>{{ $t('提交文稿 → 云端渲染 → 拿 mp4。不按时长计费，做完就结束，适合固定口播内容。') }}</p>
        </div>
      </div>

      <!-- 分步进度条 sticky：长任务的进度必须一直在视口内（UX 硬规则二） -->
      <div class="dh-steps" :class="{ running: offline.running }">
        <div v-for="(s, i) in OFFLINE_STEPS" :key="s" class="dh-step" :class="stepState(i)">
          <span class="dh-step-no">{{ i + 1 }}</span>
          <span class="dh-step-label">
            {{ $t(s) }}
            <em v-if="offline.stepIndex === i && offline.stepNote">{{ offline.stepNote }}</em>
          </span>
        </div>
      </div>

      <div class="dh-form">
        <label class="dh-field">
          <span>{{ $t('文稿（任何语言都行 —— 语音合成与口型都在厂商侧做）') }}</span>
          <textarea v-model="offline.script" rows="6" :placeholder="$t('把要念的内容贴进来')"></textarea>
        </label>
        <div class="dh-row">
          <label class="dh-field">
            <span>{{ $t('形象 code') }}</span>
            <input v-model="offline.avatarId" type="text" :placeholder="cfg.defaultAvatarId || 'CH_2d_xxx'" />
          </label>
          <label class="dh-field">
            <span>{{ $t('形象类型') }}</span>
            <select v-model="offline.avatarType">
              <option value="2d">2D</option>
              <option value="3d">3D</option>
            </select>
            <!-- 实测踩过：3D 形象走 2D 接口会报「类型不匹配」，且报错文案看不出是这里的问题 -->
            <small>{{ $t('必须选对：3D 形象走 2D 接口会报「类型不匹配」。') }}</small>
          </label>
          <label class="dh-field">
            <span>{{ $t('画幅') }}</span>
            <select v-model="offline.aspectRatio">
              <option value="9:16">9:16</option>
              <option value="16:9">16:9</option>
            </select>
          </label>
        </div>
        <label class="sp-toggle">
          <input v-model="offline.subtitle" type="checkbox" />
          <span class="sp-track"></span>
          <span class="sp-toggle-text"><strong>{{ $t('烧字幕') }}</strong></span>
        </label>

        <div class="dh-actions">
          <button class="button primary" type="button" :disabled="offline.running || !offline.script.trim()" @click="runOffline">
            <i :class="offline.running ? 'ri-loader-4-line spin' : 'ri-movie-2-line'"></i>
            {{ offline.running ? $t('生成中…') : $t('开始生成') }}
          </button>
          <button v-if="offline.running" class="button ghost" type="button" @click="offline.cancelled = true">
            {{ $t('停止等待') }}
          </button>
          <span v-if="offline.running" class="dh-hint" data-test="dh-elapsed">{{ offlineElapsedLabel }}</span>
        </div>

        <!--
          失败（含 10 分钟硬上限）/ 可能已超时（查询连续失败）/ 上次运行已中断：
          失败与中断带「重新生成」；云端任务没有取消通道，怀疑卡只给 继续等待 / 查看日志。
        -->
        <StepRunAlert
          v-if="offlineAlert"
          :state="offlineAlert.state"
          :message="offlineAlert.message"
          :elapsed-sec="offlineWatchdog.elapsedSec.value"
          :estimate-sec="OFFLINE_ESTIMATE_MS / 1000"
          :since-heartbeat-sec="offlineWatchdog.sinceHeartbeatSec.value"
          :hide-retry="offlineAlert.state === 'suspect'"
          @retry="runOffline()"
          @keep-waiting="offlineWatchdog.keepWaiting()"
        />
        <div v-if="offline.videoUrl" class="dh-result">
          <i class="ri-check-line"></i>
          <span class="dh-result-url">{{ offline.videoUrl }}</span>
          <button class="button ghost" type="button" @click="openUrl(offline.videoUrl)">{{ $t('打开成片') }}</button>
        </div>
      </div>
    </section>

    <!-- ══ 实时口播 ════════════════════════════════════════════════════ -->
    <section v-show="activeTab === 'live'" class="panel">
      <div class="section-heading">
        <div>
          <span class="section-kicker">{{ $t('实时口播 · 直播 / 教课') }}</span>
          <h2>{{ $t('实时会话控制台') }}</h2>
          <p>{{ $t('把 LLM 的增量输出直接喂进来，切句 / 调速 / 合规过滤 / 插播都在后端做。') }}</p>
        </div>
        <span :class="['status-pill', live.sessionId ? 'success' : '']">
          <i class="ri-checkbox-blank-circle-fill"></i>
          {{ live.sessionId ? $t('会话进行中') : $t('未起会话') }}
        </span>
      </div>

      <div v-if="!live.sessionId" class="dh-form">
        <div class="dh-row">
          <label class="dh-field">
            <span>{{ $t('场景') }}</span>
            <select v-model="live.scene">
              <option value="live">{{ $t('直播带货（保留广告法词表）') }}</option>
              <option value="teaching">{{ $t('教课（关闭词表）') }}</option>
            </select>
            <!-- 关词表不是偷懒：默认词表含「疗效」「最佳」等，医学 / 金融课程会被大面积误伤 -->
            <small>{{ $t('教课关掉词表是刻意的：默认词表含「疗效」「最佳」等，医学 / 金融课程会被大面积误伤。') }}</small>
          </label>
          <label class="dh-field">
            <span>{{ $t('形象 code') }}</span>
            <input v-model="live.avatarId" type="text" :placeholder="cfg.defaultAvatarId || 'CH_2d_xxx'" />
          </label>
          <label class="dh-field">
            <span>{{ $t('音色 id') }}</span>
            <input v-model="live.voiceId" type="text" :placeholder="$t('留空用默认')" />
          </label>
        </div>
        <div class="dh-actions">
          <button class="button primary" type="button" :disabled="busy" @click="startLive">
            <i :class="busy ? 'ri-loader-4-line spin' : 'ri-live-line'"></i>{{ $t('起一路会话') }}
          </button>
          <span class="dh-hint">{{ $t('起会话即开始计费。') }}</span>
        </div>
        <div v-if="live.error" class="message error" role="alert">
          <i class="ri-error-warning-line"></i><span>{{ live.error }}</span>
        </div>
      </div>

      <template v-else>
        <!-- AI 标识是合规硬约束，规格由后端下发，端侧照着渲染即可 -->
        <div v-if="live.disclosureSpec" class="dh-disclosure">
          <i class="ri-shield-check-line"></i>
          <span>
            <strong>{{ $t('AI 生成标识（合规强制）') }}</strong>
            <small>{{ disclosureText }}</small>
          </span>
        </div>

        <div class="dh-live-grid">
          <div class="dh-live-col">
            <label class="dh-field">
              <span>{{ $t('剧本 / LLM 输出') }}</span>
              <textarea v-model="live.text" rows="4" :placeholder="$t('要念的内容，可以连续喂')"></textarea>
            </label>
            <div class="dh-actions">
              <button class="button primary" type="button" :disabled="busy || !live.text.trim()" @click="enqueue(false)">
                {{ $t('喂给数字人') }}
              </button>
              <button class="button ghost" type="button" :disabled="busy || !live.text.trim()" @click="enqueue(true)">
                {{ $t('喂完并收尾') }}
              </button>
            </div>
          </div>
          <div class="dh-live-col">
            <label class="dh-field">
              <span>{{ $t('观众提问 / 真人接管') }}</span>
              <textarea v-model="live.interject" rows="4" :placeholder="$t('下一拍插播，会打断当前那句')"></textarea>
            </label>
            <div class="dh-actions">
              <button class="button ghost" type="button" :disabled="busy || !live.interject.trim()" @click="interject('interaction')">
                {{ $t('作为提问插播') }}
              </button>
              <button class="button ghost" type="button" :disabled="busy || !live.interject.trim()" @click="interject('takeover')">
                {{ $t('真人接管') }}
              </button>
            </div>
          </div>
        </div>

        <div class="dh-live-bar">
          <span class="dh-metric">
            {{ $t('本地积压') }} <strong>{{ live.queueDepth }}</strong>
            <em v-if="live.queueDepth > 6">{{ $t('喂得比播得快，建议降速') }}</em>
          </span>
          <span class="dh-metric">{{ $t('已播') }} <strong>{{ live.spoken }}</strong></span>
          <span class="dh-metric">{{ $t('会话') }} <strong>{{ live.sessionId }}</strong></span>
          <span class="dh-spacer"></span>
          <button class="button ghost" type="button" :disabled="busy" @click="pause">
            {{ live.paused ? $t('恢复') : $t('暂停') }}
          </button>
          <button class="button secondary" type="button" :disabled="busy" @click="stopLive(false)">{{ $t('结束') }}</button>
          <button class="button danger" type="button" :disabled="busy" @click="stopLive(true)">{{ $t('急停') }}</button>
        </div>
        <p v-if="live.paused" class="dh-tip">{{ $t('暂停期间仍在为会话续期 —— 暂停不等于省钱，计费还在走。') }}</p>
        <div v-if="live.error" class="message error" role="alert">
          <i class="ri-error-warning-line"></i><span>{{ live.error }}</span>
        </div>
      </template>
    </section>

    <!-- ══ 会话与用量 ══════════════════════════════════════════════════ -->
    <section v-show="activeTab === 'usage'" class="panel">
      <div class="section-heading">
        <div>
          <span class="section-kicker">{{ $t('对账') }}</span>
          <h2>{{ $t('会话与用量') }}</h2>
          <p>{{ $t('这里列的是上游此刻真在跑的会话 —— 包括不是本应用起的那些。') }}</p>
        </div>
        <button class="button secondary" type="button" :disabled="busy" @click="loadUsage">
          <i class="ri-refresh-line"></i>{{ $t('刷新') }}
        </button>
      </div>

      <div v-if="!remoteSessions.length" class="dh-empty">{{ $t('没有在跑的会话。') }}</div>
      <table v-else class="dh-table">
        <thead>
          <tr>
            <th>{{ $t('会话') }}</th><th>Provider</th><th>{{ $t('已运行') }}</th>
            <th>{{ $t('空闲') }}</th><th>{{ $t('渲染') }}</th><th></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="s in remoteSessions" :key="s.sessionId || s.session_id">
            <td>{{ s.sessionId || s.session_id }}</td>
            <td>{{ s.provider || '—' }}</td>
            <td>{{ fmtSeconds(s.age) }}</td>
            <td>{{ fmtSeconds(s.idle) }}</td>
            <td>{{ s.renderType || s.render_type || '—' }}</td>
            <td>
              <button class="button ghost" type="button" :disabled="busy" @click="stopOne(s.sessionId || s.session_id)">
                {{ $t('停止') }}
              </button>
            </td>
          </tr>
        </tbody>
      </table>

      <div v-if="usageRows.length" class="dh-usage">
        <h3>{{ $t('累计用量（供对账，计费以厂商账单为准）') }}</h3>
        <div v-for="row in usageRows" :key="row.provider" class="dh-usage-row">
          <strong>{{ row.provider }}</strong>
          <span>{{ $t('{p0} 分钟', { p0: row.minutes }) }}</span>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
/**
 * 数字人工作台（解决方案 →「数字人口播与直播工作台」，企业旗舰版）。
 *
 * 四个 tab 对应两条完全不同的路：
 * - **离线**（synthesize/query）：提交 → 轮询 → mp4。今天就能跑通，做完即结束。
 * - **实时**（live/*）：会话常驻，按分钟计费。
 *
 * UI 上有两条硬约束，都不是装饰：
 * 1. **计费横幅常驻**（sticky）—— 实时会话开着就在烧钱且云厂商不自动停机，
 *    「N 路在跑」和急停必须一直在视口里。
 * 2. **AI 生成标识** —— 规格（面积 ≥1/10、不透明、常驻、不可遮挡）由后端随会话
 *    下发，端侧照着渲染。监管明确点名过「标了但放在被遮挡处」按违规处理。
 */
import { computed, onMounted, onUnmounted, reactive, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import PageBackButton from '../components/PageBackButton.vue';
import StepRunAlert from '../components/StepRunAlert.vue';
import { formatStepDuration, useStepWatchdog } from '../composables/useStepWatchdog';
import PyExtInstaller from '../workbenches/digital-human/PyExtInstaller.vue';
import { t as i18nT, i18nKey } from '../i18n';
import { useNotificationStore } from '../stores/notification';
import { humanizeErrorMessage } from '../utils/humanize';

const { locale } = useI18n();
const isRtl = computed(() => locale.value === 'ar');
const notifStore = useNotificationStore();

const TABS = [
  { id: 'config', label: i18nKey('配置'), icon: 'ri-settings-3-line' },
  { id: 'offline', label: i18nKey('口播成片'), icon: 'ri-movie-2-line' },
  { id: 'live', label: i18nKey('实时口播'), icon: 'ri-live-line' },
  { id: 'usage', label: i18nKey('会话与用量'), icon: 'ri-bar-chart-line' },
];
const OFFLINE_STEPS = [
  i18nKey('检查配置'), i18nKey('提交文稿'), i18nKey('云端渲染'), i18nKey('取回成片'),
];

const activeTab = ref('config');
const busy = ref(false);
const statusLoading = ref(false);
const statusError = ref('');
const saveHint = ref('');
const providers = ref<any[]>([]);
const tracked = ref<any[]>([]);
const remoteSessions = ref<any[]>([]);
const usageRows = ref<{ provider: string; minutes: number }[]>([]);
const enabledRemote = ref<boolean | null>(null);
let unsub: (() => void) | null = null;

const cfg = reactive({ enabled: false, provider: '', regionPolicy: 'prefer', defaultAvatarId: '', defaultVoiceId: '' });
const cred = reactive({
  aliyunDvh: { accessKeyId: '', accessKeySecret: '', tenantId: '', appId: '', region: '' },
  heygen: { apiKey: '' },
  livetalking: { endpoint: '' },
});

const offline = reactive({
  script: '', avatarId: '', avatarType: '2d', aspectRatio: '9:16', subtitle: true,
  running: false, cancelled: false, stepIndex: -1, stepNote: '', error: '', videoUrl: '',
  // 看门狗 / 恢复用：真实开始时刻、最近一次成功查询时刻、「继续等待」时刻、云端任务 id
  startedAt: 0, progressAt: 0, waitExtendedAt: 0, taskId: '',
  /** 用户点了「停止等待」：中性终态（不算完成也不算失败） */
  stopped: false,
  /** 重新打开页面时上次的任务已超过硬上限：按「上次运行已中断」给重新生成 */
  interrupted: false,
  /** 最近一次查询任务状态的报错（接口不通等）；查询恢复正常即清空 */
  pollError: '',
});
const live = reactive({
  scene: 'live', avatarId: '', voiceId: '', sessionId: '', text: '', interject: '',
  queueDepth: 0, spoken: 0, paused: false, error: '', disclosureSpec: null as any,
});

function api() {
  return (window as any).electronAPI?.digitalHuman;
}

const statusTone = computed(() => {
  if (statusError.value) return 'danger';
  if (enabledRemote.value === null) return '';
  return enabledRemote.value ? 'success' : 'loading';
});
const statusLabel = computed(() => {
  if (statusError.value) return i18nT('未就绪');
  if (enabledRemote.value === null) return i18nT('未检查');
  return enabledRemote.value ? i18nT('已启用') : i18nT('未启用');
});

const disclosureText = computed(() => {
  const spec = live.disclosureSpec || {};
  const ratio = Number(spec.minAreaRatio ?? spec.min_area_ratio ?? 0.1);
  return i18nT('画面占比 ≥ {p0}%，不透明、全程常驻、不得被遮挡。推流出去的画面必须把标识烧进视频帧。', {
    p0: Math.round(ratio * 100),
  });
});

function stepState(i: number): string {
  if ((offline.error || offline.interrupted) && offline.stepIndex === i) return 'failed';
  // 「停止等待」：这一步既没完成也没失败，别把它画成绿色对勾
  if (offline.stopped && offline.stepIndex === i) return 'stopped';
  if (offline.stepIndex > i) return 'done';
  if (offline.stepIndex === i) return offline.running ? 'running' : 'done';
  return '';
}

function fmtSeconds(v: unknown): string {
  const n = Number(v);
  if (!Number.isFinite(n) || n < 0) return '—';
  if (n < 60) return i18nT('{p0} 秒', { p0: Math.round(n) });
  return i18nT('{p0} 分钟', { p0: Math.round(n / 60) });
}

async function openUrl(url: string): Promise<void> {
  try {
    const open = (window as any).electronAPI?.openExternal;
    if (!open) throw new Error(i18nT('浏览器接口不可用'));
    await open(url);
  } catch (e) { notifStore.error(humanizeErrorMessage(e)); }
}

// ── 配置 ──────────────────────────────────────────────────────────────────

async function loadStatus(): Promise<void> {
  statusLoading.value = true;
  statusError.value = '';
  try {
    const res = await api()?.status?.();
    if (!res?.ok) { statusError.value = res?.message || i18nT('数字人服务未就绪'); return; }
    enabledRemote.value = !!res.enabled;
    cfg.enabled = !!res.enabled;
    if (res.provider) cfg.provider = res.provider;
    if (res.regionPolicy) cfg.regionPolicy = res.regionPolicy;
    providers.value = normalizeProviders(res);
  } catch (e) {
    statusError.value = humanizeErrorMessage(e, i18nT('读取数字人状态失败'));
  } finally {
    statusLoading.value = false;
  }
}

/** 上游同时可能回 available_providers（名字数组）或结构化清单，两种都收 */
function normalizeProviders(res: any): any[] {
  const raw = res?.availableProviders ?? res?.available_providers ?? [];
  if (Array.isArray(raw)) {
    return raw.map((p: any) => (typeof p === 'string'
      ? { name: p, isAvailable: true }
      : { ...p, isAvailable: p.isAvailable ?? p.is_available, unavailableReason: p.unavailableReason ?? p.unavailable_reason }));
  }
  if (raw && typeof raw === 'object') {
    return Object.entries(raw).map(([name, v]: [string, any]) => ({
      name, ...v, isAvailable: v?.isAvailable ?? v?.is_available,
      unavailableReason: v?.unavailableReason ?? v?.unavailable_reason,
    }));
  }
  return [];
}

async function saveConfig(): Promise<void> {
  busy.value = true;
  saveHint.value = '';
  try {
    // 空凭据不提交 —— 传空串会把已配好的值覆盖成空（用户只想改其中一项时最容易踩）
    const providersPayload: Record<string, any> = {};
    const put = (key: string, obj: Record<string, string>) => {
      const clean = Object.fromEntries(Object.entries(obj).filter(([, v]) => String(v || '').trim()));
      if (Object.keys(clean).length) providersPayload[key] = clean;
    };
    put('aliyun_dvh', cred.aliyunDvh);
    put('heygen', cred.heygen);
    put('livetalking', cred.livetalking);

    const res = await api()?.configure?.({
      enabled: cfg.enabled,
      provider: cfg.provider,
      regionPolicy: cfg.regionPolicy,
      defaultAvatarId: cfg.defaultAvatarId,
      defaultVoiceId: cfg.defaultVoiceId,
      ...(Object.keys(providersPayload).length ? { providers: providersPayload } : {}),
    });
    if (!res?.ok) { saveHint.value = res?.message || i18nT('保存失败'); return; }
    saveHint.value = i18nT('已保存');
    await loadStatus();
  } catch (e) {
    saveHint.value = humanizeErrorMessage(e, i18nT('保存失败'));
  } finally {
    busy.value = false;
  }
}

// ── 离线成片 ──────────────────────────────────────────────────────────────

/** 页面卸载后置 true：轮询链 / onMounted 的 await 之后不再推进、不再建定时器 */
let dhDisposed = false;
/** 云端渲染轮询硬上限：到点按失败报（带「重新生成」），不再挂着「渲染中」让人猜 */
const OFFLINE_DEADLINE_MS = 10 * 60_000;
/** 预计耗时（口播成片实测以分钟计） */
const OFFLINE_ESTIMATE_MS = 180_000;
/**
 * 连续这么久没有一次成功的查询（接口报错 / 不通）→ 「可能已超时」。
 * 云端只要还在正常回应就不怀疑（哪怕比预计慢），诚实区分「慢」和「死」；
 * 视频默认的 10 分钟上限与硬上限重合，永远看不到怀疑卡，所以这里单独给。
 */
const OFFLINE_POLL_STALL_MS = 3 * 60_000;
/** 进行中的任务落 localStorage：换页 / 刷新回来接着轮询那个 taskId，而不是显示空闲 */
const OFFLINE_TASK_KEY = 'totalclaw:digital-human-offline-task:v1';
interface OfflineTaskSnapshot {
  taskId: string;
  startedAt: number;
  scriptHash: string;
  form: { script: string; avatarId: string; avatarType: string; aspectRatio: string; subtitle: boolean };
}

/**
 * 看门狗：秒表从真实开始时刻走（重挂载后从 localStorage 恢复的 startedAt 也算）；
 * 心跳 = 一次成功的任务查询。
 */
const offlineWatchdog = useStepWatchdog({
  running: () => offline.running,
  startedAt: () => offline.startedAt || null,
  estimateMs: () => OFFLINE_ESTIMATE_MS,
  kind: 'video',
  stallMs: OFFLINE_POLL_STALL_MS,
  lastProgressAt: () => offline.progressAt || null,
  waitExtendedAt: () => offline.waitExtendedAt || null,
  onHeartbeat: (at) => { offline.progressAt = at; },
  onKeepWaiting: (at) => { offline.waitExtendedAt = at; },
});
/** 按钮旁的耗时文案：已用 / 预计；超预计就明说，并带上「云端仍有回应」让用户分清慢和死 */
const offlineElapsedLabel = computed(() => {
  const used = formatStepDuration(offlineWatchdog.elapsedSec.value);
  if (offlineWatchdog.suspect.value) return i18nT('已用 {p0} · 可能已超时', { p0: used });
  const snap = offlineWatchdog.snapshot.value;
  if (snap.overdueByMs > 5_000) {
    const over = formatStepDuration(snap.overdueByMs / 1000);
    const since = offlineWatchdog.sinceHeartbeatSec.value;
    return since != null && since < 120
      ? i18nT('已用 {p0} · 已超预计 {p1} · 云端仍有回应（{p2} 前）', { p0: used, p1: over, p2: formatStepDuration(since) })
      : i18nT('已用 {p0} · 已超预计 {p1}', { p0: used, p1: over });
  }
  return i18nT('已用 {p0} · 预计 {p1}', { p0: used, p1: formatStepDuration(OFFLINE_ESTIMATE_MS / 1000) });
});
/**
 * 三种必须有人处理的终态：失败（含硬上限到点）/ 可能已超时（查询连续失败）/ 上次运行已中断。
 * 云端任务没有取消通道：怀疑卡只给 继续等待 / 查看日志；失败与中断给「重新生成」。
 */
const offlineAlert = computed<{ state: 'failed' | 'suspect' | 'interrupted'; message: string } | null>(() => {
  if (offline.running) {
    if (!offlineWatchdog.suspect.value) return null;
    return { state: 'suspect', message: offline.pollError ? i18nT('最近一次查询失败：{p0}', { p0: offline.pollError }) : '' };
  }
  if (offline.interrupted) return { state: 'interrupted', message: '' };
  if (offline.error) return { state: 'failed', message: offline.error };
  return null;
});

function hashScript(s: string): string {
  let h = 5381;
  for (let i = 0; i < s.length; i += 1) h = ((h * 33) ^ s.charCodeAt(i)) >>> 0;
  return h.toString(16);
}
function saveOfflineTask(taskId: string, startedAt: number): void {
  const snap: OfflineTaskSnapshot = {
    taskId, startedAt, scriptHash: hashScript(offline.script),
    form: { script: offline.script, avatarId: offline.avatarId, avatarType: offline.avatarType, aspectRatio: offline.aspectRatio, subtitle: offline.subtitle },
  };
  try { localStorage.setItem(OFFLINE_TASK_KEY, JSON.stringify(snap)); } catch { /* 存不进只影响刷新后的恢复 */ }
}
function clearOfflineTask(): void {
  try { localStorage.removeItem(OFFLINE_TASK_KEY); } catch { /* */ }
}
function loadOfflineTask(): OfflineTaskSnapshot | null {
  try {
    const raw = localStorage.getItem(OFFLINE_TASK_KEY);
    if (!raw) return null;
    const v = JSON.parse(raw) as OfflineTaskSnapshot;
    if (!v?.taskId || !(Number(v.startedAt) > 0)) return null;
    return v;
  } catch { return null; }
}
function resetOffline(): void {
  Object.assign(offline, {
    running: false, cancelled: false, stopped: false, interrupted: false, stepIndex: -1, stepNote: '', error: '', videoUrl: '',
    startedAt: 0, progressAt: 0, waitExtendedAt: 0, taskId: '', pollError: '',
  });
}
function markOfflineStopped(): void {
  offline.stopped = true;
  offline.stepNote = i18nT('已停止等待');
  // 用户明确说不等了：下次打开页面不再替他接着等
  clearOfflineTask();
}

/**
 * 轮询云端任务直到：有成片 / 云端报失败 / 查询回 ok=false / 用户停止等待 / 硬上限到点。
 * 查询抛错（网络抖动、接口暂时不通）不当终态：记下原因继续轮询，看门狗负责在连续失败时报「可能已超时」。
 */
async function pollOffline(taskId: string, deadline: number): Promise<void> {
  while (Date.now() < deadline) {
    if (offline.cancelled) { markOfflineStopped(); return; }
    await new Promise((r) => setTimeout(r, 2000));
    if (dhDisposed) return;
    if (offline.cancelled) { markOfflineStopped(); return; }
    let q: any;
    try {
      q = await api()?.query?.({ taskId });
    } catch (e) {
      offline.pollError = humanizeErrorMessage(e, i18nT('查询任务状态失败'));
      continue;
    }
    if (dhDisposed) return;
    if (q?.ok === false) {
      offline.error = q.error || q.message || i18nT('云端渲染失败');
      return;
    }
    if (!q) { offline.pollError = i18nT('查询任务状态失败'); continue; }
    offlineWatchdog.heartbeat();
    offline.pollError = '';
    const url = String(q.videoUrl ?? q.video_url ?? '').trim();
    const st = String(q.status ?? '').toLowerCase();
    if (url) {
      offline.stepIndex = 3;
      offline.videoUrl = url;
      notifStore.success(i18nT('成片已生成'));
      return;
    }
    if (['failed', 'error', '4', '5', '6'].includes(st)) {
      offline.error = q.error || i18nT('云端渲染失败');
      return;
    }
    offline.stepNote = i18nT('渲染中…');
  }
  // 硬上限：挂着「渲染中」不如明说可能已失败，并给重新生成
  offline.error = i18nT('云端渲染超过 10 分钟仍未完成，可能已失败');
}

async function runOffline(): Promise<void> {
  if (offline.running) return;
  resetOffline();
  offline.running = true;
  offline.startedAt = Date.now();
  offline.stepIndex = 0;
  try {
    // 开跑前预检：都是本地能可靠判断的
    if (!offline.script.trim()) { offline.error = i18nT('文稿为空，请先填写要念的内容。'); return; }
    if (!cfg.enabled) { offline.error = i18nT('数字人未启用，请先在「配置」里打开。'); return; }
    const bridge = api();
    if (typeof bridge?.synthesize !== 'function' || typeof bridge?.query !== 'function') {
      offline.error = i18nT('数字人接口不可用');
      return;
    }

    offline.stepIndex = 1;
    const sub = await bridge.synthesize({
      script: offline.script,
      avatarId: offline.avatarId || cfg.defaultAvatarId,
      avatarType: offline.avatarType,
      voiceId: cfg.defaultVoiceId,
      aspectRatio: offline.aspectRatio,
      subtitle: offline.subtitle,
    });
    if (dhDisposed) return;
    const taskId = String(sub?.taskId ?? sub?.task_id ?? '').trim();
    if (!sub?.ok || !taskId) {
      offline.error = sub?.error || sub?.message || i18nT('提交失败');
      return;
    }
    offline.taskId = taskId;
    saveOfflineTask(taskId, offline.startedAt);

    offline.stepIndex = 2;
    await pollOffline(taskId, offline.startedAt + OFFLINE_DEADLINE_MS);
  } catch (e) {
    offline.error = humanizeErrorMessage(e, i18nT('生成失败'));
  } finally {
    if (!dhDisposed) {
      offline.running = false;
      if (offline.error || offline.videoUrl) clearOfflineTask();
    }
  }
}

/** 刷新 / 换页回来：上次的任务还在硬上限内就接着轮询它，不显示空闲 */
async function resumeOffline(saved: OfflineTaskSnapshot): Promise<void> {
  resetOffline();
  offline.running = true;
  offline.startedAt = saved.startedAt;
  offline.taskId = saved.taskId;
  offline.stepIndex = 2;
  offline.stepNote = i18nT('渲染中…');
  try {
    await pollOffline(saved.taskId, saved.startedAt + OFFLINE_DEADLINE_MS);
  } catch (e) {
    offline.error = humanizeErrorMessage(e, i18nT('生成失败'));
  } finally {
    if (!dhDisposed) {
      offline.running = false;
      if (offline.error || offline.videoUrl) clearOfflineTask();
    }
  }
}
function restoreOfflineForm(saved: OfflineTaskSnapshot): void {
  if (offline.script.trim() || !saved.form) return;
  offline.script = String(saved.form.script || '');
  offline.avatarId = String(saved.form.avatarId || '');
  offline.avatarType = String(saved.form.avatarType || offline.avatarType);
  offline.aspectRatio = String(saved.form.aspectRatio || offline.aspectRatio);
  offline.subtitle = saved.form.subtitle !== false;
}
/** 挂载时看有没有进行中的任务：硬上限内接着等；过了就按「上次运行已中断」给重新生成 */
function recoverOfflineTask(): void {
  const saved = loadOfflineTask();
  if (!saved) return;
  restoreOfflineForm(saved);
  activeTab.value = 'offline';
  if (Date.now() - saved.startedAt >= OFFLINE_DEADLINE_MS) {
    resetOffline();
    offline.interrupted = true;
    offline.stepIndex = 2;
    offline.startedAt = saved.startedAt;
    clearOfflineTask();
    return;
  }
  void resumeOffline(saved);
}

// ── 实时口播 ──────────────────────────────────────────────────────────────

async function startLive(): Promise<void> {
  busy.value = true;
  live.error = '';
  try {
    const res = await api()?.liveStart?.({
      scene: live.scene,
      avatarId: live.avatarId || cfg.defaultAvatarId,
      voiceId: live.voiceId || cfg.defaultVoiceId,
    });
    const sid = String(res?.sessionId ?? res?.session_id ?? '').trim();
    if (!res?.ok || !sid) { live.error = res?.message || res?.error || i18nT('起会话失败'); return; }
    live.sessionId = sid;
    live.disclosureSpec = res.aiDisclosureSpec ?? res.ai_disclosure_spec ?? { minAreaRatio: 0.1 };
    live.queueDepth = 0;
    live.spoken = 0;
    live.paused = false;
    await refreshTracked();
  } catch (e) {
    live.error = humanizeErrorMessage(e, i18nT('起会话失败'));
  } finally {
    busy.value = false;
  }
}

async function enqueue(done: boolean): Promise<void> {
  busy.value = true;
  try {
    const res = await api()?.liveEnqueue?.({ sessionId: live.sessionId, text: live.text, done });
    if (!res?.ok) { live.error = res?.message || i18nT('投喂失败'); return; }
    live.queueDepth = Number(res.localQueueDepth ?? res.local_queue_depth ?? live.queueDepth) || 0;
    live.spoken += (res.sentences?.length ?? 0);
    live.text = '';
    live.error = '';
  } catch (e) {
    live.error = humanizeErrorMessage(e, i18nT('投喂失败'));
  } finally {
    busy.value = false;
  }
}

async function interject(kind: 'interaction' | 'takeover'): Promise<void> {
  busy.value = true;
  try {
    const fn = kind === 'takeover' ? api()?.liveTakeover : api()?.liveInteraction;
    const res = await fn?.({ sessionId: live.sessionId, text: live.interject });
    if (!res?.ok) { live.error = res?.message || i18nT('插播失败'); return; }
    live.interject = '';
    live.error = '';
    if (kind === 'takeover') notifStore.success(i18nT('已接管，接管记录已留痕'));
  } catch (e) {
    live.error = humanizeErrorMessage(e, i18nT('插播失败'));
  } finally {
    busy.value = false;
  }
}

async function pause(): Promise<void> {
  busy.value = true;
  try {
    const next = !live.paused;
    const res = await api()?.livePause?.({ sessionId: live.sessionId, resume: !next });
    if (!res?.ok) throw new Error(res?.message || res?.error || i18nT('暂停操作失败'));
    live.paused = next;
  } catch (e) { notifStore.error(humanizeErrorMessage(e)); } finally {
    busy.value = false;
  }
}

async function stopLive(emergency: boolean): Promise<void> {
  busy.value = true;
  try {
    const res = await api()?.liveStop?.({ sessionId: live.sessionId, emergency });
    if (!res?.ok) throw new Error(res?.message || res?.error || i18nT('停止会话失败'));
    // 只有服务确认停止才清掉本地会话，失败保留停止入口。
    live.sessionId = '';
    live.disclosureSpec = null;
    live.paused = false;
  } catch (e) { notifStore.error(humanizeErrorMessage(e)); } finally {
    busy.value = false;
    await refreshTracked();
  }
}

// ── 对账与全停 ────────────────────────────────────────────────────────────

async function refreshTracked(): Promise<void> {
  try {
    const res = await api()?.tracked?.();
    tracked.value = res?.sessions ?? [];
  } catch { /* 拿不到就不显示横幅，不必打扰 */ }
}

async function loadUsage(): Promise<void> {
  busy.value = true;
  try {
    const list = await api()?.sessionList?.();
    remoteSessions.value = list?.sessions ?? list?.items ?? [];
    const usage = await api()?.usage?.();
    const byProvider = usage?.byProvider ?? usage?.by_provider ?? {};
    usageRows.value = Object.entries(byProvider).map(([provider, v]: [string, any]) => ({
      provider,
      minutes: Math.round(Number(v?.minutes ?? (Number(v?.seconds) || 0) / 60) * 10) / 10,
    }));
  } catch (e) {
    notifStore.warn(humanizeErrorMessage(e, i18nT('读取用量失败')));
  } finally {
    busy.value = false;
  }
}

async function stopOne(sessionId: string): Promise<void> {
  busy.value = true;
  try {
    const res = await api()?.liveStop?.({ sessionId, emergency: false });
    if (!res?.ok) throw new Error(res?.message || res?.error || i18nT('停止会话失败'));
    if (live.sessionId === sessionId) live.sessionId = '';
    await Promise.all([refreshTracked(), loadUsage()]);
  } catch (e) { notifStore.error(humanizeErrorMessage(e)); } finally {
    busy.value = false;
  }
}

async function stopAll(emergency: boolean): Promise<void> {
  busy.value = true;
  try {
    const r = await api()?.stopAll?.({ emergency });
    if (!r?.ok || r.failed > 0) throw new Error(r?.message || r?.error || i18nT('部分会话停止失败，请重试'));
    live.sessionId = '';
    notifStore.success(i18nT('已停止 {p0} 路会话', { p0: r.stopped ?? 0 }));
    await refreshTracked();
  } catch (e) { notifStore.error(humanizeErrorMessage(e)); await refreshTracked(); } finally {
    busy.value = false;
  }
}

onMounted(async () => {
  recoverOfflineTask();
  await loadStatus();
  await refreshTracked();
  if (dhDisposed) return;
  unsub = api()?.onEvent?.((ev: any) => {
    if (ev?.type === 'sessions') tracked.value = ev.sessions ?? [];
    else if (ev?.type === 'status') {
      const snap = ev.snapshot?.sessions?.[0] ?? ev.snapshot;
      if (snap) {
        live.queueDepth = Number(snap.localQueueDepth ?? snap.local_queue_depth ?? live.queueDepth) || 0;
        live.spoken = Number(snap.spoken ?? live.spoken) || live.spoken;
      }
    }
  }) || null;
});

// 离开页面**不停会话** —— 直播中切个页面就断流是灾难。
// 真正的兜底在主进程：应用退出时 DigitalHumanProc.shutdown() 会把在跑的都停掉。
onUnmounted(() => {
  dhDisposed = true;
  unsub?.();
});
</script>

<style src="../components/settingsPanel.css"></style>

<style scoped>
.workbench {
  display: flex; flex-direction: column; gap: 16px;
  padding: 20px 24px 32px; max-width: 1440px; margin: 0 auto; width: 100%;
  /* 外层 .page-wrap 是 overflow:hidden，这里不自己滚内容就会被切掉。
     顺带：sticky 是相对最近的滚动祖先定位的，所以滚动容器落在这一层，
     计费横幅与步骤条才真的钉得住。 */
  flex: 1; min-height: 0; overflow-y: auto;
}
.hero, .panel, .workbench-tabs {
  border: 1px solid var(--color-border); border-radius: var(--radius-6); background: var(--color-bg-card);
}
.hero { display: flex; gap: 16px; justify-content: space-between; align-items: flex-start; padding: 20px 22px; flex-wrap: wrap; }
.hero-copy { max-width: 780px; margin-inline-end: auto; }
.hero-actions { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
.eyebrow { font-size: var(--font-size-xs); letter-spacing: .08em; text-transform: uppercase; color: var(--color-text-muted); }
.hero h1 { margin: 6px 0; font-size: 22px; }
.hero p, .section-heading p { margin: 0; font-size: var(--font-size-md); color: var(--color-text-muted); line-height: 1.7; }

/* 计费横幅：sticky —— 实时会话在跑时这条不允许滚出视口 */
.dh-billing {
  position: sticky; top: 0; z-index: 20;
  display: flex; align-items: center; gap: 12px; padding: 12px 16px;
  border-radius: var(--radius-5); border: 1px solid var(--dhw-warn-a45);
  background: var(--dhw-warn-a12); color: var(--dhw-warn);
}
.dh-billing i { font-size: 20px; }
.dh-billing-text { display: flex; flex-direction: column; flex: 1; gap: 2px; }
.dh-billing-text small { font-size: var(--font-size-xs); opacity: .85; }

.workbench-tabs { display: flex; gap: 4px; padding: 6px; }
.tab {
  flex: 1; display: inline-flex; align-items: center; justify-content: center; gap: 6px;
  padding: 9px 12px; border: 0; border-radius: var(--radius-3); background: transparent; cursor: pointer;
  font-size: var(--font-size-md); color: var(--color-text-secondary);
}
.tab:hover:not(.active) { background: color-mix(in srgb, var(--color-bg-input) 60%, transparent); }
.tab.active {
  background: color-mix(in srgb, var(--color-brand) 15%, transparent);
  color: var(--color-brand); font-weight: 600;
}

.panel { padding: 20px 22px; display: flex; flex-direction: column; gap: 16px; }
.section-heading { display: flex; justify-content: space-between; gap: 16px; align-items: flex-start; flex-wrap: wrap; }
.section-kicker { font-size: var(--font-size-xs); letter-spacing: .06em; text-transform: uppercase; color: var(--color-text-muted); }
.section-heading h2 { margin: 4px 0; font-size: 19px; }
.status-pill {
  display: inline-flex; align-items: center; gap: 6px; padding: 7px 11px; border-radius: var(--radius-pill);
  background: var(--color-bg-input); font-size: var(--font-size-sm);
}
.status-pill i { font-size: 7px; }
.status-pill.success { color: var(--color-success); }
.status-pill.danger { color: var(--color-danger); }
.status-pill.loading { color: var(--color-info); }

/* 分步进度：sticky，长任务跑起来后仍在视口里（UX 硬规则二） */
.dh-steps {
  position: sticky; top: 60px; z-index: 10;
  display: flex; gap: 8px; padding: 12px; border-radius: var(--radius-5);
  background: var(--color-bg-input); flex-wrap: wrap;
}
.dh-step { display: flex; align-items: center; gap: 8px; flex: 1; min-width: 150px; font-size: var(--font-size-sm); opacity: .55; }
.dh-step.done, .dh-step.running, .dh-step.failed { opacity: 1; }
.dh-step-no {
  width: 22px; height: 22px; border-radius: 50%; display: grid; place-items: center;
  background: var(--color-bg-card); border: 1px solid var(--color-border); font-size: var(--font-size-xs); flex-shrink: 0;
}
.dh-step.done .dh-step-no { background: var(--color-success); color: var(--color-on-accent); border-color: transparent; }
.dh-step.running .dh-step-no { background: var(--color-info); color: var(--color-on-accent); border-color: transparent; }
.dh-step.failed .dh-step-no { background: var(--color-danger); color: var(--color-on-accent); border-color: transparent; }
.dh-step.failed .dh-step-label { color: var(--color-danger); }
/* 停止等待：中性灰，既不是对勾也不是红 */
.dh-step.stopped { opacity: 1; }
.dh-step.stopped .dh-step-no { background: var(--color-bg-hover); color: var(--color-text-secondary); }
.dh-step-label { display: flex; flex-direction: column; }
.dh-step-label em { font-style: normal; font-size: var(--font-size-xs); color: var(--color-text-muted); }

.dh-form { display: flex; flex-direction: column; gap: 16px; }
/* 一长条平铺的表单扫读时找不到边界，给凭据块和输入框补出层次 */
.dh-form > .sp-toggle {
  padding: 14px 16px; border-radius: var(--radius-5);
  background: var(--color-bg-input); border: 1px solid var(--color-border);
}
.dh-row { display: flex; gap: 12px; flex-wrap: wrap; }
.dh-row > .dh-field { flex: 1; min-width: 200px; }
.dh-field { display: flex; flex-direction: column; gap: 5px; font-size: var(--font-size-sm); color: var(--color-text-secondary); }
.dh-field input, .dh-field select, .dh-field textarea {
  padding: 9px 12px; border-radius: var(--radius-3); border: 1px solid var(--color-border);
  background: var(--color-bg-card); color: var(--color-text-primary); font-size: var(--font-size-md); font-family: inherit;
  transition: border-color .15s ease;
}
.dh-field input:focus, .dh-field select:focus, .dh-field textarea:focus {
  outline: none; border-color: var(--color-brand);
}
.dh-field textarea { resize: vertical; line-height: 1.6; }
.dh-field small { font-size: var(--font-size-xs); color: var(--color-text-muted); line-height: 1.5; }
.dh-check { display: flex; align-items: flex-start; gap: 10px; cursor: pointer; }
.dh-check span { display: flex; flex-direction: column; gap: 2px; }
.dh-check strong { font-size: var(--font-size-md); }
.dh-check small { font-size: var(--font-size-xs); color: var(--color-text-muted); line-height: 1.5; }
.dh-cred {
  border: 1px solid var(--color-border); border-radius: var(--radius-5); padding: 14px 16px;
  background: var(--color-bg-input);
}
.dh-cred summary {
  cursor: pointer; font-size: var(--font-size-md); font-weight: 600; margin-bottom: 8px;
  color: var(--color-text-primary);
}
.dh-cred[open] summary { margin-bottom: 12px; }
.dh-cred > *:not(summary) { margin-top: 10px; }
.dh-tip { font-size: var(--font-size-xs); color: var(--color-text-muted); line-height: 1.6; margin: 0; }
.dh-actions { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
.dh-hint { font-size: var(--font-size-sm); color: var(--color-text-muted); }

.button {
  display: inline-flex; align-items: center; gap: 6px; padding: 8px 14px; border-radius: var(--radius-3);
  border: 1px solid var(--color-border); background: var(--color-bg-input);
  color: var(--color-text-primary); font-size: var(--font-size-md); cursor: pointer;
}
.button:disabled { opacity: .55; cursor: not-allowed; }
.button.primary { background: var(--color-primary, var(--dhw-info)); border-color: transparent; color: var(--color-on-accent); }
.button.danger { background: var(--color-danger); border-color: transparent; color: var(--color-on-accent); }
.button.ghost { background: transparent; }

.message { display: flex; align-items: flex-start; gap: 8px; padding: 10px 12px; border-radius: var(--radius-3); font-size: var(--font-size-sm); }
.message.error { background: var(--dhw-danger-a10); color: var(--color-danger); }

.dh-providers { display: flex; gap: 10px; flex-wrap: wrap; }
.dh-provider {
  border: 1px solid var(--color-border); border-radius: var(--radius-4); padding: 11px 14px;
  background: var(--color-bg-input);
  display: flex; flex-direction: column; gap: 4px; min-width: 190px;
}
.dh-provider strong { font-size: var(--font-size-md); }
.dh-provider small { font-size: var(--font-size-xs); color: var(--color-text-muted); }
.mini-status { font-size: var(--font-size-xs); }
.mini-status.available { color: var(--color-success); }
.mini-status.unknown { color: var(--color-text-muted); }

.dh-result { display: flex; align-items: center; gap: 10px; font-size: var(--font-size-sm); }
.dh-result i { color: var(--color-success); }
.dh-result-url { flex: 1; word-break: break-all; color: var(--color-text-secondary); }

.dh-disclosure {
  display: flex; gap: 10px; align-items: flex-start; padding: 12px 14px; border-radius: var(--radius-4);
  background: var(--dhw-info-a8); color: var(--color-info);
}
.dh-disclosure span { display: flex; flex-direction: column; gap: 3px; }
.dh-disclosure small { font-size: var(--font-size-xs); line-height: 1.6; opacity: .9; }
.dh-live-grid { display: flex; gap: 16px; flex-wrap: wrap; }
.dh-live-col { flex: 1; min-width: 280px; display: flex; flex-direction: column; gap: 10px; }
.dh-live-bar {
  position: sticky; bottom: 0; z-index: 10;
  display: flex; align-items: center; gap: 14px; flex-wrap: wrap;
  padding: 10px 14px; border-radius: var(--radius-4); background: var(--color-bg-input);
}
.dh-metric { font-size: var(--font-size-sm); color: var(--color-text-secondary); }
.dh-metric strong { color: var(--color-text-primary); font-variant-numeric: tabular-nums; }
.dh-metric em { font-style: normal; margin-left: 6px; color: var(--dhw-warn); font-size: var(--font-size-xs); }
.dh-spacer { flex: 1; }

.dh-empty { font-size: var(--font-size-sm); color: var(--color-text-muted); }
.dh-table { width: 100%; border-collapse: collapse; font-size: var(--font-size-sm); }
.dh-table th, .dh-table td { text-align: start; padding: 8px 10px; border-bottom: 1px solid var(--color-border); }
.dh-table th { color: var(--color-text-muted); font-weight: 500; }
.dh-usage h3 { font-size: var(--font-size-md); margin: 0 0 8px; }
.dh-usage-row { display: flex; gap: 12px; font-size: var(--font-size-sm); padding: 4px 0; }
.dh-usage-row strong { min-width: 140px; }

.spin { animation: dh-spin 1s linear infinite; }
@keyframes dh-spin { to { transform: rotate(360deg); } }

/* 按实际内容宽度重排，兼容浏览器分栏与嵌入设置页。 */

.hero, .hero-actions, .dh-usage-row { flex-wrap: wrap; }
@container main-page (max-width: 640px) {
  .dh-workbench { padding: 14px; }
  .dh-live-col, .dh-row > .dh-field, .dh-field { min-width: 0; flex-basis: 100%; }
  .dh-step { min-width: 0; flex-basis: calc(50% - 12px); }
}

/* ─── 调色板（docs/ui-design-system.md）：经典主题保持原值；界面主题（data-ui-theme）下映射全局 token ─── */
.workbench { /* ui-theme-exempt: 经典主题原值 */
  --dhw-warn-a45: rgba(247, 144, 9, .45);
  --dhw-warn-a12: rgba(247, 144, 9, .12);
  --dhw-warn: #b45309;
  --dhw-info: #2563eb;
  --dhw-danger-a10: rgba(239, 68, 68, .1);
  --dhw-info-a8: rgba(37, 99, 235, .08);
}
:root[data-ui-theme] .workbench {
  --dhw-warn-a45: color-mix(in srgb, var(--color-warning) 45%, transparent);
  --dhw-warn-a12: color-mix(in srgb, var(--color-warning) 12%, transparent);
  --dhw-warn: var(--color-warning);
  --dhw-info: var(--color-info);
  --dhw-danger-a10: color-mix(in srgb, var(--color-danger) 10%, transparent);
  --dhw-info-a8: color-mix(in srgb, var(--color-info) 8%, transparent);
}
</style>
