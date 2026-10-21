<template>
  <div class="ss-module">
    <StickyProgress :title="$t('AI 一键换装')" :metas="metas" :runtime="runtime" :current-key="currentKey" @jump="jump" />
    <div class="ss-steps">
      <!-- ① 选衣服 -->
      <StepCard step-key="ap-garment" :index="0" :title="metas[0].title" :hint="metas[0].hint" :runtime="runtime['ap-garment']" :is-current="currentKey === 'ap-garment'">
        <p v-if="!garments.length" class="ss-empty" @dragover.prevent @drop.prevent="onDrop">{{ $t('商品库还是空的：先导入服装白底图或平铺图（可直接拖进来）') }}</p>
        <div v-else class="ap-grid" @dragover.prevent @drop.prevent="onDrop">
          <button
            v-for="g in garments" :key="g.id" type="button" class="ap-g" :class="{ on: picked.includes(g.id) }" :title="g.sellingPoints"
            @click="toggleGarment(g.id)"
          >
            <img :src="fileUrl(g.image)" alt="" loading="lazy" />
            <span class="ap-g__name">{{ g.name }}</span>
            <span class="ap-g__meta">{{ [g.category, g.color, audienceLabel(g.audience)].filter(Boolean).join(' · ') }}</span>
          </button>
        </div>
        <div class="ss-actions">
          <button type="button" class="ss-btn sm" :disabled="!!busy" @click="importGarments"><i class="ri-image-add-line"></i>{{ $t('导入新款（AI 自动打标签）') }}</button>
          <span class="ss-muted">{{ $t('已选 {n} / 4 件', { n: picked.length }) }}</span>
        </div>
      </StepCard>

      <!-- ② 顾客照片与授权 -->
      <StepCard step-key="ap-photo" :index="1" :title="metas[1].title" :hint="metas[1].hint" :runtime="runtime['ap-photo']" :is-current="currentKey === 'ap-photo'">
        <div class="ss-actions">
          <label class="ss-field ap-grow"><span>{{ $t('顾客') }}</span>
            <select v-model="customerId">
              <option value="">{{ $t('— 新顾客 —') }}</option>
              <option v-for="c in customers" :key="c.id" :value="c.id">{{ c.nickname }}{{ c.source === 'mobile' ? $t('（手机）') : '' }} · {{ fmtDateTime(c.createdAt) }}</option>
            </select>
          </label>
        </div>
        <template v-if="!customer">
          <div class="ss-grid">
            <label class="ss-field"><span>{{ $t('称呼（选填）') }}</span><input v-model.trim="form.nickname" type="text" maxlength="20" /></label>
            <label class="ss-field"><span>{{ $t('身高 cm（选填，尺码助手用）') }}</span><input v-model.number="form.heightCm" type="number" min="50" max="230" /></label>
            <label class="ss-field"><span>{{ $t('体重 kg（选填）') }}</span><input v-model.number="form.weightKg" type="number" min="10" max="250" /></label>
          </div>
          <label class="ap-consent"><input v-model="form.consent" type="checkbox" />
            <span>{{ $t('顾客已同意：照片仅用于本次试穿，会发送到云端 AI 生成试穿图，保存在本店电脑，{d} 天后自动删除，可随时一键删除。', { d: state?.settings.retentionDays || 7 }) }}</span>
          </label>
          <div class="ss-actions">
            <button type="button" class="ss-btn primary" :disabled="!!busy || !form.consent" @click="createCustomer"><i class="ri-user-add-line"></i>{{ $t('建档并上传照片') }}</button>
            <span class="ss-muted">{{ $t('或让顾客扫「手机端」页签里的门店码自己上传，顾客会出现在上面的列表里') }}</span>
          </div>
        </template>
        <div v-else class="ap-customer">
          <img v-if="customer.photo" :src="fileUrl(customer.photo)" alt="" />
          <div v-else class="ap-customer__empty"><i class="ri-user-line"></i></div>
          <div class="ap-customer__info">
            <strong>{{ customer.nickname }}</strong>
            <span class="ss-muted">{{ customer.source === 'mobile' ? $t('手机端顾客') : $t('店内建档') }} · {{ $t('授权于 {p0}', { p0: fmtDateTime(customer.consentAt) }) }}</span>
            <p v-if="customer.purgedAt" class="ss-note warn"><i class="ri-delete-bin-line"></i>{{ $t('该顾客的照片与试穿图已清除') }}</p>
            <p v-else-if="customer.photo && !customer.photoCheck" class="ss-muted"><i class="ri-loader-4-line spin"></i>{{ $t('正在检查照片…') }}</p>
            <p v-else-if="customer.photoCheck && !customer.photoCheck.ok" class="ss-note danger"><i class="ri-error-warning-line"></i>{{ $t('照片不适合试穿：{p0}。请重拍一张单人、全身正面、光线充足的照片', { p0: customer.photoCheck.issues.join('；') || $t('不符合要求') }) }}</p>
            <p v-else-if="customer.photoCheck?.ok" class="ss-note ok"><i class="ri-check-line"></i>{{ $t('照片合格：单人、全身、光线正常') }}</p>
            <div class="ss-actions">
              <button type="button" class="ss-btn sm" :class="{ primary: !customer.photo }" :disabled="!!busy" @click="uploadPhoto"><i class="ri-camera-line"></i>{{ customer.photo ? $t('换一张照片') : $t('上传全身照') }}</button>
              <label class="ap-inline">{{ $t('身高') }} <input v-model.number="body.heightCm" type="number" min="50" max="230" /> cm</label>
              <label class="ap-inline">{{ $t('体重') }} <input v-model.number="body.weightKg" type="number" min="10" max="250" /> kg</label>
              <button type="button" class="ss-link" @click="saveBody">{{ $t('保存') }}</button>
              <span class="grow"></span>
              <button type="button" class="ss-btn sm danger" :disabled="!!busy || !!customer.purgedAt" @click="purge"><i class="ri-delete-bin-line"></i>{{ $t('删除该顾客照片') }}</button>
            </div>
          </div>
        </div>
      </StepCard>

      <!-- ③ AI 形象分析 -->
      <StepCard step-key="ap-analyze" :index="2" :title="metas[2].title" :hint="metas[2].hint" :runtime="runtime['ap-analyze']" :is-current="currentKey === 'ap-analyze'">
        <div class="ss-actions">
          <button type="button" class="ss-btn primary" :disabled="!!busy || !customer?.photo" @click="analyze"><i :class="busy === 'ap-analyze' ? 'ri-loader-4-line spin' : 'ri-body-scan-line'"></i>{{ customer?.profile ? $t('重新分析') : $t('分析体型、肤色、脸型') }}</button>
          <button type="button" class="ss-btn ghost sm" :disabled="!customer?.photo" @click="skipAnalyze = true">{{ $t('跳过') }}</button>
          <span class="ss-muted">{{ $t('AI 估计，仅供搭配参考') }}</span>
        </div>
        <template v-if="customer?.profile">
          <div class="ss-kpis">
            <div class="ss-kpi"><small>{{ $t('体型') }}</small><strong>{{ bodyShapeLabel(customer.profile.bodyShape) }}</strong></div>
            <div class="ss-kpi"><small>{{ $t('肤色') }}</small><strong>{{ customer.profile.skinTone || '—' }}</strong></div>
            <div class="ss-kpi"><small>{{ $t('脸型') }}</small><strong>{{ customer.profile.faceShape || '—' }}</strong></div>
          </div>
          <p v-if="customer.profile.notes" class="ss-note info"><i class="ri-lightbulb-line"></i>{{ customer.profile.notes }}</p>
          <div class="ap-sugs">
            <div v-for="(sg, i) in customer.profile.suggestions" :key="i" class="ap-sug">
              <strong>{{ $t('推荐 {n}', { n: i + 1 }) }}</strong>
              <span>{{ choiceLabel(sg) }}</span>
              <small v-if="sg.reason">{{ sg.reason }}</small>
            </div>
          </div>
          <div class="ss-actions"><button type="button" class="ss-btn sm" :disabled="!customer.profile.suggestions.length" @click="applySuggestions"><i class="ri-magic-line"></i>{{ $t('套用这 {n} 组推荐', { n: customer.profile.suggestions.length }) }}</button></div>
        </template>
      </StepCard>

      <!-- ④ 选造型 -->
      <StepCard step-key="ap-style" :index="3" :title="metas[3].title" :hint="metas[3].hint" :runtime="runtime['ap-style']" :is-current="currentKey === 'ap-style'">
        <div class="ap-looks">
          <button v-for="(c, i) in choices" :key="i" type="button" class="ap-look" :class="{ on: activeLook === i }" @click="activeLook = i">
            <strong>{{ $t('造型 {n}', { n: i + 1 }) }}</strong>
            <span>{{ choiceLabel(c) }}</span>
            <i v-if="choices.length > 1" class="ri-close-line" role="button" :aria-label="$t('删除')" @click.stop="removeLook(i)"></i>
          </button>
          <button v-if="choices.length < 4" type="button" class="ap-look add" @click="addLook"><i class="ri-add-line"></i>{{ $t('再加一组') }}</button>
        </div>
        <div class="ss-actions">
          <button v-if="firstGarment?.recommended" type="button" class="ss-btn sm ghost" @click="applyRecommended"><i class="ri-star-line"></i>{{ $t('用「{p0}」的店长推荐', { p0: firstGarment.name }) }}</button>
        </div>
        <StylePicker v-model="choices[activeLook]" :audience="firstGarment?.audience || null">
          <template #upload>
            <div class="ss-actions">
              <button type="button" class="ss-btn sm" :disabled="!customer || !!busy" @click="uploadBackground"><i class="ri-image-add-line"></i>{{ hasBackground ? $t('换一张背景照片') : $t('上传背景照片') }}</button>
              <span v-if="hasBackground" class="ss-chip ok">{{ $t('已上传') }}</span>
            </div>
          </template>
        </StylePicker>
      </StepCard>

      <!--
        ⑤ AI 合成。队列没有取消通道：还在跑时「可能已超时」卡只给 继续等待 / 查看日志（不放重新生成，
        放了就是重复排队烧钱）；全部失败 / 预检没过时才给「重新生成」= 失败的逐张重试，或重新发起。
      -->
      <StepCard step-key="ap-generate" :index="4" :title="metas[4].title" :hint="metas[4].hint" :runtime="runtime['ap-generate']" :is-current="currentKey === 'ap-generate'" :retry="pendingTryons.length ? undefined : retryGenerate">
        <p v-if="!state?.imageReady" class="ss-note warn"><i class="ri-key-2-line"></i>{{ $t('还没有配置图像服务：请到「设置 → 媒体模型」填写 fal 密钥，或联系管理员为本方案下发') }}</p>
        <div class="ss-actions">
          <button type="button" class="ss-btn primary" :disabled="!!busy || !canGenerate" @click="generate"><i :class="busy === 'ap-generate' ? 'ri-loader-4-line spin' : 'ri-magic-line'"></i>{{ $t('生成 {n} 张试穿图', { n: picked.length * choices.length }) }}</button>
          <span class="ss-muted">{{ $t('{a} 件 × {b} 组造型，单张约 5–30 秒，同时生成 2 张', { a: picked.length, b: choices.length }) }}</span>
        </div>
        <div v-if="mine.length" class="ap-queue">
          <div v-for="t in mine" :key="t.id" class="ap-q" :class="t.status">
            <span class="ss-chip" :class="t.status === 'done' ? 'ok' : t.status === 'failed' ? 'bad' : 'brand'">
              <i v-if="t.status === 'running' || t.status === 'queued'" class="ri-loader-4-line spin"></i>{{ statusLabel(t.status) }}
            </span>
            <span class="ap-q__what">{{ garmentName(t.garmentId) }} · {{ choiceLabel(t.choice) }}</span>
            <span v-if="t.error" class="ap-q__err">{{ t.error }}</span>
            <button v-if="t.status === 'failed'" type="button" class="ss-link" @click="retry(t.id)">{{ $t('重试') }}</button>
          </div>
        </div>
      </StepCard>

      <!-- ⑥ 查看与分享 -->
      <StepCard step-key="ap-view" :index="5" :title="metas[5].title" :hint="metas[5].hint" :runtime="runtime['ap-view']" :is-current="currentKey === 'ap-view'">
        <p v-if="!doneList.length" class="ss-empty">{{ $t('生成完成的试穿图会出现在这里') }}</p>
        <div v-else class="ap-results">
          <figure v-for="t in doneList" :key="t.id" :class="{ on: preview?.id === t.id }" @click="preview = t">
            <img :src="fileUrl(t.image!)" alt="" loading="lazy" />
            <figcaption><b>{{ garmentName(t.garmentId) }}</b><small>{{ choiceLabel(t.choice) }}</small></figcaption>
          </figure>
        </div>
        <div v-if="preview" class="ap-preview">
          <img :src="fileUrl(preview.image!)" alt="" />
          <div class="ap-preview__side">
            <strong>{{ garmentName(preview.garmentId) }}</strong>
            <span class="ss-muted">{{ choiceLabel(preview.choice) }}</span>
            <span class="ss-muted">{{ $t('试穿码') }} <b class="ap-code">{{ preview.code }}</b> · {{ modelLabel(preview.model || '') }}</span>
            <div class="ss-actions">
              <button type="button" class="ss-btn sm" @click="copyImage(preview)"><i class="ri-file-copy-line"></i>{{ $t('复制（带门店水印）') }}</button>
              <button type="button" class="ss-btn sm" @click="exportAll"><i class="ri-download-2-line"></i>{{ $t('导出全部试穿图') }}</button>
            </div>
            <div class="ap-phone">
              <strong><i class="ri-smartphone-line"></i>{{ $t('在顾客手机上查看') }}</strong>
              <template v-if="phoneQr">
                <img :src="phoneQr" alt="" />
                <small>{{ $t('顾客连店内 Wi-Fi 扫码，即可在手机上看到并长按保存这些试穿图') }}</small>
              </template>
              <p v-else-if="!state?.mobile.running" class="ss-muted">{{ $t('先在「手机端」页签开启门店手机服务') }}</p>
              <button v-else type="button" class="ss-btn sm" @click="makePhoneQr"><i class="ri-qr-code-line"></i>{{ $t('生成顾客查看码') }}</button>
            </div>
          </div>
        </div>
      </StepCard>

      <!-- ⑦ 到店试实物 -->
      <StepCard step-key="ap-visit" :index="6" :title="metas[6].title" :hint="metas[6].hint" :runtime="runtime['ap-visit']" :is-current="currentKey === 'ap-visit'">
        <p v-if="!doneList.length" class="ss-empty">{{ $t('有试穿图后，顾客点「想试实物」就会得到试穿码与推荐尺码') }}</p>
        <div v-else class="ss-table-wrap">
          <table class="ss-table">
            <thead><tr><th>{{ $t('款式') }}</th><th>{{ $t('造型') }}</th><th>{{ $t('试穿码') }}</th><th>{{ $t('推荐尺码') }}</th><th>{{ $t('到店') }}</th><th></th></tr></thead>
            <tbody>
              <tr v-for="t in doneList" :key="t.id">
                <td>{{ garmentName(t.garmentId) }}</td>
                <td class="ap-wrap">{{ choiceLabel(t.choice) }}</td>
                <td><b class="ap-code">{{ t.wantVisit ? t.code : '—' }}</b></td>
                <td>{{ t.size || (t.wantVisit ? $t('未填身高') : '—') }}</td>
                <td><span v-if="t.visit" class="ss-chip" :class="t.visit.status === 'purchased' ? 'ok' : t.visit.status === 'left' ? 'bad' : 'brand'">{{ visitLabel(t.visit.status) }}{{ t.visit.size ? ` · ${t.visit.size}` : '' }}</span><span v-else class="ss-muted">—</span></td>
                <td class="ap-row-actions">
                  <button v-if="!t.wantVisit" type="button" class="ss-btn sm primary" @click="want(t.id)">{{ $t('想试实物') }}</button>
                  <template v-else>
                    <button type="button" class="ss-link" @click="visit(t.id, 'prepared')">{{ $t('已备货') }}</button>
                    <button type="button" class="ss-link" @click="visit(t.id, 'tried')">{{ $t('已试穿') }}</button>
                    <button type="button" class="ss-link" @click="visit(t.id, 'purchased')">{{ $t('成交') }}</button>
                    <button type="button" class="ss-link" @click="visit(t.id, 'left')">{{ $t('未成交') }}</button>
                  </template>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </StepCard>
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * 服装实体店智能体 · AI 一键换装固定工作流（七步）。
 * 每步独立状态 + 粘性进度条（docs/solution-workbench-ux-guidelines.md）。
 */
import { computed, reactive, ref, watch } from 'vue';
import QRCode from 'qrcode';
import type { ApStyleChoice, ApTryon, ApVisitStatus } from '@totalclaw/ipc-contracts';
import { useNotificationStore } from '../../stores/notification';
import { t as i18nT } from '../../i18n';
import StepCard from '../service-settlement/StepCard.vue';
import StickyProgress from '../service-settlement/StickyProgress.vue';
import StylePicker from './StylePicker.vue';
import {
  IMAGE_RE, ap, apQueueProgressAt, apState, audienceLabel, bodyShapeLabel, choiceLabel, droppedPaths, earliestPendingAt, ensureApProgressTracking, errorMessage, fileUrl, fmtDateTime, modelLabel, pickImages, refreshState,
  scrollToStep, statusLabel, visitLabel, watermarked, type StepMeta, type StepRuntime,
} from './shared';

const notif = useNotificationStore();
const state = apState;
ensureApProgressTracking();
/** 单张预计秒数（fal 改图实测 5～30 秒，取上限）；并发 2 → 预计 = ceil(待生成 / 2) × 30 */
const TRYON_SEC_EACH = 30;
const TRYON_CONCURRENCY = 2;
const DEFAULT: ApStyleChoice = { backgroundId: 'B29', backgroundVariant: 'B29-1', poseId: 'P01', poseVariant: 'P01-1', hairId: 'H00' };

const garments = computed(() => state.value?.garments || []);
const customers = computed(() => (state.value?.customers || []).filter((c) => !c.purgedAt));
const picked = ref<string[]>([]);
const customerId = ref('');
const customer = computed(() => state.value?.customers.find((c) => c.id === customerId.value) || null);
const firstGarment = computed(() => garments.value.find((g) => g.id === picked.value[0]) || null);
const form = reactive({ nickname: '', heightCm: undefined as number | undefined, weightKg: undefined as number | undefined, consent: false });
const body = reactive({ heightCm: undefined as number | undefined, weightKg: undefined as number | undefined });
const skipAnalyze = ref(false);
const choices = ref<ApStyleChoice[]>([{ ...DEFAULT }]);
const activeLook = ref(0);
const touchedStyle = ref(false);
const hasBackground = ref(false);
const preview = ref<ApTryon | null>(null);
const phoneQr = ref('');
const busy = ref('');
const errors = ref<Record<string, string>>({});

watch(customer, (c) => {
  body.heightCm = c?.heightCm; body.weightKg = c?.weightKg;
  skipAnalyze.value = false; phoneQr.value = ''; preview.value = null;
  void refreshBackground();
}, { immediate: false });
watch(customerId, () => { phoneQr.value = ''; });
watch(choices, () => { touchedStyle.value = true; }, { deep: true });

const mine = computed(() => (state.value?.tryons || []).filter((t) => t.customerId === customerId.value));
const doneList = computed(() => mine.value.filter((t) => t.status === 'done' && t.image));
const pendingTryons = computed(() => mine.value.filter((t) => t.status === 'queued' || t.status === 'running'));
const photoOk = computed(() => !!customer.value?.photo && !customer.value.purgedAt && (!!customer.value.photoCheck?.ok || (!customer.value.photoCheck && !state.value?.imageReady)));
const canGenerate = computed(() => photoOk.value && picked.value.length > 0 && choices.value.length > 0);

const metas: StepMeta[] = [
  { key: 'ap-garment', title: i18nT('选衣服'), hint: i18nT('从商品库挑 1～4 件要试的衣服；新款可当场导入，AI 自动打标签') },
  { key: 'ap-photo', title: i18nT('顾客照片与授权'), hint: i18nT('勾选授权后上传一张全身正面照（电脑上传，或顾客扫门店码用手机上传）') },
  { key: 'ap-analyze', title: i18nT('AI 形象分析'), hint: i18nT('识别体型、肤色、脸型，推荐 3 组造型（可跳过）') },
  { key: 'ap-style', title: i18nT('选造型'), hint: i18nT('背景 / 姿势 / 发型及细分场景，一次最多 4 组') },
  { key: 'ap-generate', title: i18nT('AI 合成'), hint: i18nT('衣服 × 造型逐张生成，失败的单张可重试') },
  { key: 'ap-view', title: i18nT('手机、电脑查看'), hint: i18nT('电脑大图对比；顾客扫码在手机上看、长按保存（带门店名与试穿码）') },
  { key: 'ap-visit', title: i18nT('到店试实物'), hint: i18nT('想试实物 → 试穿码 + 推荐尺码 → 店员备货、登记试穿与成交') },
];
function st(key: string, done: boolean, summary?: string, running = false, extra?: Partial<StepRuntime>): StepRuntime {
  if (busy.value === key || running) return { state: 'running', ...(extra || {}) };
  if (errors.value[key]) return { state: 'failed', error: errors.value[key] };
  return done ? { state: 'done', summary } : { state: 'todo' };
}
const runtime = computed<Record<string, StepRuntime>>(() => {
  const c = customer.value;
  const pendingList = pendingTryons.value;
  const pending = pendingList.length > 0;
  const allFailed = mine.value.length > 0 && mine.value.every((t) => t.status === 'failed');
  // 第 ⑤ 步看门狗：从最早一张的入队时刻算（刷新 / 换页回来不归零），预计按并发折算，队列事件 = 心跳
  const generating: Partial<StepRuntime> | undefined = pending ? {
    kind: 'image',
    estimateSec: Math.ceil(pendingList.length / TRYON_CONCURRENCY) * TRYON_SEC_EACH,
    startedAt: earliestPendingAt(pendingList),
    progressAt: apQueueProgressAt.value || undefined,
  } : undefined;
  return {
    'ap-garment': st('ap-garment', picked.value.length > 0, i18nT('已选 {n} 件', { n: picked.value.length })),
    'ap-photo': c?.photoCheck && !c.photoCheck.ok && !busy.value ? { state: 'failed', error: i18nT('照片不合格，请重拍') } : st('ap-photo', photoOk.value, c?.nickname),
    'ap-analyze': st('ap-analyze', !!c?.profile || (skipAnalyze.value && !!c?.photo), c?.profile ? bodyShapeLabel(c.profile.bodyShape) : i18nT('已跳过')),
    'ap-style': st('ap-style', !!c?.photo && (touchedStyle.value || !!c?.profile), i18nT('{n} 组造型', { n: choices.value.length })),
    // 预检 / 本组件自己的报错优先于「上一批全失败」的汇总，否则点生成被拦下时卡上还写着上一批的旧原因
    'ap-generate': errors.value['ap-generate'] && !pending ? { state: 'failed', error: errors.value['ap-generate'] }
      : allFailed && !pending ? { state: 'failed', error: mine.value[0]?.error || i18nT('生成失败') }
        : st('ap-generate', doneList.value.length > 0, i18nT('{n} 张完成', { n: doneList.value.length }), pending, generating),
    'ap-view': st('ap-view', doneList.value.length > 0 && (!!preview.value || !!phoneQr.value || c?.source === 'mobile')),
    'ap-visit': st('ap-visit', mine.value.some((t) => !!t.visit), i18nT('{n} 件已登记', { n: mine.value.filter((t) => t.visit).length })),
  };
});
const currentKey = computed(() => metas.find((m) => runtime.value[m.key].state !== 'done')?.key || 'ap-visit');

function garmentName(id: string): string { return garments.value.find((g) => g.id === id)?.name || i18nT('已删除的商品'); }
function toggleGarment(id: string): void {
  const i = picked.value.indexOf(id);
  if (i >= 0) picked.value.splice(i, 1);
  else if (picked.value.length < 4) picked.value.push(id);
  else notif.warn(i18nT('一次最多选 4 件'));
}

async function run(key: string, fn: () => Promise<unknown>): Promise<void> {
  busy.value = key;
  errors.value = { ...errors.value, [key]: '' };
  try { await fn(); await refreshState(); } catch (e) { errors.value = { ...errors.value, [key]: errorMessage(e) }; void scrollToStep(key); } finally { busy.value = ''; }
}

async function importGarments(): Promise<void> {
  const paths = await pickImages(true, i18nT('选择服装白底图 / 平铺图'));
  if (paths.length) await importPaths(paths);
}
function onDrop(ev: DragEvent): void {
  const paths = droppedPaths(ev, IMAGE_RE);
  if (paths.length) void importPaths(paths);
}
async function importPaths(paths: string[]): Promise<void> {
  await run('ap-garment', async () => {
    const made = await ap<Array<{ id: string }>>('garments.import', { paths });
    picked.value = [...new Set([...picked.value, ...made.map((g) => g.id)])].slice(0, 4);
    await refreshState();
    for (const g of made) { try { await ap('garment.tag', { id: g.id }); } catch (e) { notif.warn(errorMessage(e)); break; } }
  });
}
async function createCustomer(): Promise<void> {
  await run('ap-photo', async () => {
    const c = await ap<{ id: string }>('customer.create', { ...form });
    customerId.value = c.id;
    Object.assign(form, { nickname: '', heightCm: undefined, weightKg: undefined, consent: false });
    await refreshState();
    await uploadPhotoInner();
  });
}
async function uploadPhotoInner(): Promise<void> {
  const paths = await pickImages(false, i18nT('选择顾客全身照'));
  if (paths.length) await ap('customer.image', { id: customerId.value, path: paths[0], kind: 'photo' });
}
async function uploadPhoto(): Promise<void> { await run('ap-photo', uploadPhotoInner); }
async function saveBody(): Promise<void> { await run('ap-photo', () => ap('customer.update', { id: customerId.value, patch: { heightCm: body.heightCm ?? null, weightKg: body.weightKg ?? null } })); }
async function purge(): Promise<void> {
  if (!customer.value || !window.confirm(i18nT('删除「{p0}」的照片、试穿图与分析结果？此操作不可恢复。', { p0: customer.value.nickname }))) return;
  await run('ap-photo', () => ap('customer.purge', { id: customerId.value }));
}
async function analyze(): Promise<void> {
  await run('ap-analyze', () => ap('customer.analyze', { id: customerId.value, audience: firstGarment.value?.audience }));
}
function applySuggestions(): void {
  const s = customer.value?.profile?.suggestions || [];
  if (!s.length) return;
  choices.value = s.map(({ reason: _r, ...c }) => ({ ...c }));
  activeLook.value = 0;
  void scrollToStep('ap-style');
}
function applyRecommended(): void {
  if (!firstGarment.value?.recommended) return;
  choices.value[activeLook.value] = { ...firstGarment.value.recommended };
}
function addLook(): void {
  choices.value.push({ ...(choices.value[choices.value.length - 1] || DEFAULT) });
  activeLook.value = choices.value.length - 1;
}
function removeLook(i: number): void {
  choices.value.splice(i, 1);
  activeLook.value = Math.min(activeLook.value, choices.value.length - 1);
}
async function refreshBackground(): Promise<void> {
  hasBackground.value = customerId.value ? !!(await ap<boolean>('customer.hasBackground', { id: customerId.value }).catch(() => false)) : false;
}
async function uploadBackground(): Promise<void> {
  const paths = await pickImages(false, i18nT('选择背景照片'));
  if (!paths.length) return;
  await run('ap-style', async () => { await ap('customer.image', { id: customerId.value, path: paths[0], kind: 'background' }); await refreshBackground(); });
}
async function generate(): Promise<void> {
  // 开跑前预检：没有图像服务密钥主进程每张都会失败，没必要先排一队再逐张红
  if (!state.value?.imageReady) {
    const msg = i18nT('还没有配置图像服务：请到「设置 → 媒体模型」填写 fal 密钥，或联系管理员为本方案下发');
    errors.value = { ...errors.value, 'ap-generate': msg };
    notif.warn(msg);
    void scrollToStep('ap-generate');
    return;
  }
  await run('ap-generate', () => ap('tryon.enqueue', {
    customerId: customerId.value, garmentIds: picked.value,
    choices: choices.value.map((c) => ({ ...c, customBackground: c.backgroundId === 'B30' && hasBackground.value ? 'yes' : undefined })),
  }));
}
async function retry(id: string): Promise<void> { await run('ap-generate', () => ap('tryon.retry', { id })); }
/** 步骤卡「重新生成」：有失败的就逐张重试（沿用原造型，不重复排队）；没有失败记录（预检没过）就重新发起 */
async function retryGenerate(): Promise<void> {
  const failed = mine.value.filter((t) => t.status === 'failed');
  if (!failed.length) { await generate(); return; }
  await run('ap-generate', async () => { for (const t of failed) await ap('tryon.retry', { id: t.id }); });
}
async function copyImage(t: ApTryon): Promise<void> {
  try {
    const data = state.value?.settings.watermark
      ? await watermarked(fileUrl(t.image!), `${state.value.settings.storeName} · ${i18nT('试穿码')} ${t.code}`)
      : fileUrl(t.image!);
    const blob = await (await fetch(data)).blob();
    const png = blob.type === 'image/png' ? blob : await toPng(blob);
    await navigator.clipboard.write([new ClipboardItem({ 'image/png': png })]);
    notif.success(i18nT('已复制，可直接粘贴到微信、朋友圈编辑器'));
  } catch (e) { notif.error(errorMessage(e)); }
}
async function toPng(blob: Blob): Promise<Blob> {
  const bmp = await createImageBitmap(blob);
  const cv = document.createElement('canvas');
  cv.width = bmp.width; cv.height = bmp.height;
  cv.getContext('2d')!.drawImage(bmp, 0, 0);
  return new Promise((resolve, reject) => cv.toBlob((b) => (b ? resolve(b) : reject(new Error('toBlob'))), 'image/png'));
}
async function exportAll(): Promise<void> {
  try {
    const s = state.value;
    const files = s?.settings.watermark
      ? await ap<string[]>('tryon.exportData', { items: await Promise.all(doneList.value.map(async (t) => ({
        name: `${garmentName(t.garmentId)}-${t.code}`,
        dataUrl: await watermarked(fileUrl(t.image!), `${s.settings.storeName} · ${i18nT('试穿码')} ${t.code}`),
      }))) })
      : await ap<string[]>('tryon.export', { ids: doneList.value.map((t) => t.id) });
    await ap('path.open', { path: files[0], reveal: true });
  } catch (e) { notif.error(errorMessage(e)); }
}
async function makePhoneQr(): Promise<void> {
  try {
    const url = await ap<string>('mobile.customerLink', { id: customerId.value });
    phoneQr.value = await QRCode.toDataURL(url, { margin: 1, width: 180 });
  } catch (e) { notif.error(errorMessage(e)); }
}
async function want(id: string): Promise<void> { await run('ap-visit', () => ap('tryon.want', { id })); }
async function visit(id: string, status: ApVisitStatus): Promise<void> { await run('ap-visit', () => ap('tryon.visit', { id, status })); }
function jump(key: string): void { void scrollToStep(key); }

/** 看板 / 核销页跳过来时定位到某个顾客 */
defineExpose({ focusCustomer: (id: string) => { customerId.value = id; } });
</script>

<style scoped>
.ap-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(128px, 1fr)); gap: 10px; }
.ap-g { display: grid; gap: 2px; padding: 0 0 8px; border: 2px solid var(--color-border); border-radius: 12px; background: var(--color-bg-card); overflow: hidden; cursor: pointer; text-align: start; font: inherit; color: var(--color-text-primary); position: relative; }
.ap-g img { width: 100%; aspect-ratio: 3 / 4; object-fit: contain; background: #fff; }
.ap-g__name { font-size: 12.5px; font-weight: 700; padding: 0 8px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.ap-g__meta { font-size: 11px; color: var(--color-text-secondary); padding: 0 8px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.ap-g.on { border-color: var(--color-brand); box-shadow: 0 0 0 3px color-mix(in srgb, var(--color-brand) 16%, transparent); }
.ap-g.on::after { content: "✓"; position: absolute; top: 6px; inset-inline-end: 6px; width: 22px; height: 22px; border-radius: 50%; background: var(--color-brand); color: #fff; font-size: 13px; display: flex; align-items: center; justify-content: center; }
.ap-grow { flex: 1; max-width: 420px; }
.ap-consent { display: flex; gap: 8px; align-items: flex-start; font-size: 12.5px; color: var(--color-text-secondary); line-height: 1.55; }
.ap-consent input { margin-top: 3px; accent-color: var(--color-brand); }
.ap-customer { display: flex; gap: 14px; align-items: flex-start; }
.ap-customer > img, .ap-customer__empty { width: 120px; height: 160px; object-fit: cover; border-radius: 12px; background: var(--color-bg-hover); flex: 0 0 auto; display: flex; align-items: center; justify-content: center; font-size: 30px; color: var(--color-text-secondary); }
.ap-customer__info { flex: 1; display: grid; gap: 6px; min-width: 0; }
.ap-inline { display: inline-flex; gap: 4px; align-items: center; font-size: 12px; color: var(--color-text-secondary); }
.ap-inline input { width: 62px; height: 28px; border-radius: 7px; border: 1px solid var(--color-border); background: var(--color-bg-input, var(--color-bg-primary)); color: var(--color-text-primary); padding: 0 6px; font: inherit; }
.ap-sugs { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 8px; }
.ap-sug { display: grid; gap: 2px; padding: 10px 12px; border: 1px solid var(--color-border); border-radius: 10px; background: var(--color-bg-primary); font-size: 12.5px; }
.ap-sug small { color: var(--color-text-secondary); }
.ap-looks { display: flex; gap: 8px; flex-wrap: wrap; }
.ap-look { display: grid; gap: 2px; text-align: start; padding: 8px 28px 8px 12px; border: 1px solid var(--color-border); border-radius: 10px; background: var(--color-bg-primary); color: var(--color-text-primary); font: inherit; font-size: 12px; max-width: 280px; cursor: pointer; position: relative; }
.ap-look span { color: var(--color-text-secondary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.ap-look i { position: absolute; top: 6px; inset-inline-end: 6px; color: var(--color-text-secondary); }
.ap-look.on { border-color: var(--color-brand); background: color-mix(in srgb, var(--color-brand) 8%, var(--color-bg-primary)); }
.ap-look.add { align-items: center; display: inline-flex; gap: 4px; border-style: dashed; padding-inline-end: 12px; }
.ap-queue { display: grid; gap: 6px; }
.ap-q { display: flex; gap: 10px; align-items: center; font-size: 12.5px; flex-wrap: wrap; }
.ap-q__what { color: var(--color-text-secondary); }
.ap-q__err { color: var(--color-danger); flex-basis: 100%; padding-inline-start: 4px; }
.ap-results { display: grid; grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)); gap: 10px; }
.ap-results figure { margin: 0; border: 2px solid var(--color-border); border-radius: 12px; overflow: hidden; cursor: pointer; background: var(--color-bg-card); }
.ap-results figure.on { border-color: var(--color-brand); }
.ap-results img { width: 100%; aspect-ratio: 3 / 4; object-fit: cover; display: block; }
.ap-results figcaption { padding: 6px 8px; display: grid; font-size: 12px; }
.ap-results figcaption small { color: var(--color-text-secondary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.ap-preview { display: grid; grid-template-columns: minmax(0, 420px) 1fr; gap: 16px; align-items: start; }
.ap-preview > img { width: 100%; border-radius: 14px; border: 1px solid var(--color-border); }
.ap-preview__side { display: grid; gap: 8px; align-content: start; }
.ap-phone { display: grid; gap: 6px; justify-items: start; padding: 12px; border: 1px solid var(--color-border); border-radius: 12px; background: var(--color-bg-primary); }
.ap-phone strong { display: flex; gap: 6px; align-items: center; font-size: 13px; }
.ap-phone img { width: 160px; height: 160px; border-radius: 8px; background: #fff; }
.ap-phone small { color: var(--color-text-secondary); font-size: 12px; }
.ap-code { font-family: ui-monospace, Menlo, monospace; letter-spacing: .12em; color: var(--color-brand); }
.ap-wrap { white-space: normal !important; min-width: 200px; }
.ap-row-actions { display: flex; gap: 10px; align-items: center; }
.grow { flex: 1; }
.spin { animation: ap-spin 1s linear infinite; }
@keyframes ap-spin { to { transform: rotate(360deg); } }
@media (max-width: 900px) { .ap-preview { grid-template-columns: 1fr; } }
</style>
