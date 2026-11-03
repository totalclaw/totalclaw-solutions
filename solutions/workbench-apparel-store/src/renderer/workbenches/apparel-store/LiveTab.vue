<template>
  <div class="ap-live">
    <section class="ss-panel">
      <header class="ap-head">
        <strong><i class="ri-live-line"></i>{{ $t('实时试衣') }}</strong>
        <span class="ss-chip" :class="phase === 'live' ? 'ok' : phase === 'error' ? 'danger' : ''">{{ statusText }}</span>
        <span v-if="phase === 'live' || phase === 'connecting'" class="ss-muted" data-test="ap-live-timer">{{ $t('已用 {a} 秒 / 最长 {b} 秒', { a: elapsed, b: maxSeconds }) }}</span>
        <span class="grow"></span>
        <button v-if="phase === 'idle' || phase === 'error'" type="button" class="ss-btn primary" :disabled="!canStart" data-test="ap-live-start" @click="start"><i class="ri-play-line"></i>{{ $t('开始') }}</button>
        <button v-else type="button" class="ss-btn" data-test="ap-live-stop" @click="stop()"><i class="ri-stop-line"></i>{{ $t('停止') }}</button>
      </header>
      <p class="ss-muted">{{ $t('摄像头画面实时交给 AI：几秒后右边就是穿上所选衣服的样子，顾客转身、走动都跟着变。实时模型按秒计费，单次最长 {n} 秒自动停；不用时请点「停止」。', { n: maxSeconds }) }}</p>
      <p v-if="!state?.imageReady" class="ss-note warn"><i class="ri-key-2-line"></i>{{ $t('还没有配置图像服务：请到「设置 → 媒体模型」填写 fal 密钥，或联系管理员为本方案下发') }}</p>
      <p v-if="error" class="ss-note danger" data-test="ap-live-error"><i class="ri-error-warning-line"></i>{{ error }}</p>
    </section>

    <div class="ap-live__grid">
      <section class="ss-panel">
        <header class="ap-head"><span class="ap-live__no">1</span><strong>{{ $t('选方式') }}</strong></header>
        <div class="ap-live__modes" role="radiogroup">
          <button v-for="m in MODES" :key="m.key" type="button" role="radio" class="ap-live__mode" :class="{ on: mode === m.key }" :aria-checked="mode === m.key" :data-test="`ap-live-mode-${m.key}`" @click="setMode(m.key)">
            <strong><i :class="m.icon"></i>{{ m.title }}</strong>
            <small>{{ m.desc }}</small>
          </button>
        </div>

        <header class="ap-head"><span class="ap-live__no">2</span><strong>{{ mode === 'outfit' ? $t('选衣服') : $t('选顾客') }}</strong>
          <span class="ss-muted">{{ mode === 'outfit' ? $t('上衣、外套、连衣裙效果最好；直播中点别的衣服几秒内就换') : $t('只列出已授权、已上传照片的顾客') }}</span>
        </header>
        <div v-if="mode === 'outfit'" class="ap-live__pick">
          <p v-if="!garments.length" class="ss-empty">{{ $t('商品库还没有带商品图的衣服：先到「商品库」导入，或点右上角「演示模式」') }}</p>
          <button v-for="g in garments" :key="g.id" type="button" class="ap-live__item" :class="{ on: garmentId === g.id }" :title="g.name" :data-test="`ap-live-garment-${g.id}`" @click="pickGarment(g.id)">
            <img :src="fileUrl(g.image)" alt="" loading="lazy" />
            <span>{{ g.name }}</span>
          </button>
        </div>
        <div v-else class="ap-live__pick">
          <p v-if="!customers.length" class="ss-empty">{{ $t('还没有可用的顾客照片：先在「一键换装」里给顾客建档、勾选授权并上传照片') }}</p>
          <button v-for="c in customers" :key="c.id" type="button" class="ap-live__item" :class="{ on: customerId === c.id }" :title="c.nickname" @click="pickCustomer(c.id)">
            <img :src="fileUrl(c.photo)" alt="" loading="lazy" />
            <span>{{ c.nickname }}</span>
          </button>
        </div>
      </section>

      <section class="ss-panel">
        <header class="ap-head"><span class="ap-live__no">3</span><strong>{{ $t('看效果') }}</strong><span class="ss-muted">{{ mode === 'outfit' ? $t('请顾客站在镜头前，上半身入镜') : $t('请店员穿上实物站在镜头前') }}</span></header>
        <div class="ap-live__videos">
          <figure><video ref="camEl" class="mirror" autoplay muted playsinline></video><figcaption>{{ $t('摄像头原画') }}</figcaption></figure>
          <figure><video ref="outEl" autoplay muted playsinline data-test="ap-live-output"></video><figcaption>{{ $t('AI 实时画面') }}</figcaption></figure>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * 服装AI试衣 · 实时试衣（参考 decart-swap-demo）：摄像头 → Decart Lucy（fal realtime 信令 + WebRTC 视频直连）。
 * 主进程给 120 秒的临时令牌、连接地址和参考图（live.start），永久密钥不进页面；结束时记一次用量（live.ended）。
 * 信令协议照参考实现：ready / iceServers → 建 PeerConnection 发 offer；answer、icecandidate 回来；输入参数（prompt + 参考图）先发一条才会启动。
 */
import { computed, onBeforeUnmount, ref } from 'vue';
import { t as i18nT } from '../../i18n';
import { ap, apState, errorMessage, fileUrl } from './shared';
import { decode, encode } from './msgpackLite';

type Mode = 'outfit' | 'person';
type Phase = 'idle' | 'connecting' | 'live' | 'error';
const MODES: Array<{ key: Mode; icon: string; title: string; desc: string }> = [
  { key: 'outfit', icon: 'ri-t-shirt-line', title: i18nT('实时换衣'), desc: i18nT('顾客站在镜头前，画面里身上换成选中的衣服') },
  { key: 'person', icon: 'ri-user-shared-line', title: i18nT('店员代穿'), desc: i18nT('店员穿着实物站在镜头前，画面里换成顾客本人（需顾客授权的照片）') },
];
const STUN = [{ urls: 'stun:stun.l.google.com:19302' }];

const state = apState;
const mode = ref<Mode>('outfit');
const garmentId = ref('');
const customerId = ref('');
const phase = ref<Phase>('idle');
const status = ref('');
const error = ref('');
const elapsed = ref(0);
const maxSeconds = ref(180);
const camEl = ref<HTMLVideoElement | null>(null);
const outEl = ref<HTMLVideoElement | null>(null);

const garments = computed(() => (state.value?.garments || []).filter((g) => !!g.image));
const customers = computed(() => (state.value?.customers || []).filter((c) => !c.purgedAt && !!c.photo && !!c.consentAt && !(c as { demoPlaceholder?: boolean }).demoPlaceholder));
const canStart = computed(() => !!state.value?.imageReady && (mode.value === 'outfit' ? !!garmentId.value : !!customerId.value));
const statusText = computed(() => status.value || { idle: i18nT('未连接'), connecting: i18nT('连接中…'), live: i18nT('直播中'), error: i18nT('已停止') }[phase.value]);

let ws: WebSocket | null = null;
let pc: RTCPeerConnection | null = null;
let cam: MediaStream | null = null;
let pending: RTCIceCandidateInit[] = [];
let input: { prompt: string; referenceImage: string } | null = null;
let timer: ReturnType<typeof setInterval> | null = null;
let startedAt = 0;
let session = 0;

const send = (msg: unknown) => { if (ws?.readyState === WebSocket.OPEN) ws.send(encode(msg)); };
const sendInput = () => input && send({ prompt: input.prompt, enable_prompt_expansion: true, reference_image_url: input.referenceImage });
const sel = () => (mode.value === 'outfit' ? { mode: mode.value, garmentId: garmentId.value } : { mode: mode.value, customerId: customerId.value });

async function start(): Promise<void> {
  stop(false);
  error.value = '';
  phase.value = 'connecting';
  status.value = i18nT('连接中…');
  const my = ++session;
  try {
    const r = await ap<{ app: string; url: string; maxSeconds: number; prompt: string; referenceImage: string }>('live.start', sel());
    if (my !== session) return;
    input = { prompt: r.prompt, referenceImage: r.referenceImage };
    maxSeconds.value = r.maxSeconds;
    cam = await navigator.mediaDevices.getUserMedia({ video: { width: 1280, height: 720, frameRate: 30 } });
    if (my !== session) { cam.getTracks().forEach((t) => t.stop()); return; }
    if (camEl.value) camEl.value.srcObject = cam;
    ws = new WebSocket(r.url);
    ws.binaryType = 'arraybuffer';
    ws.onopen = () => sendInput(); // 换衣模型要先收到一条输入才会启动
    ws.onmessage = (e) => { void onMessage(e).catch((err) => fail(errorMessage(err))); };
    ws.onclose = (e) => { if (my === session && phase.value !== 'idle') fail(i18nT('连接已关闭（{p0}）', { p0: `${e.code}${e.reason ? ` ${e.reason}` : ''}` })); };
    startedAt = Date.now();
    elapsed.value = 0;
    timer = setInterval(() => {
      elapsed.value = Math.round((Date.now() - startedAt) / 1000);
      if (elapsed.value >= maxSeconds.value) stop();
    }, 1000);
  } catch (e) {
    const name = (e as { name?: string })?.name;
    fail(name === 'NotAllowedError' || name === 'NotFoundError' ? i18nT('打不开摄像头：请确认电脑有摄像头，并在系统设置里允许本应用使用摄像头') : errorMessage(e));
  }
}

async function onMessage(e: MessageEvent): Promise<void> {
  const m: any = typeof e.data === 'string' ? JSON.parse(e.data) : decode(new Uint8Array(e.data as ArrayBuffer));
  const type = String(m?.type || '').toLowerCase();
  if (m?.error) { fail(i18nT('实时试衣服务报错：{p0}', { p0: `${m.error} ${m.reason ?? ''}`.trim() })); return; }
  if (type === 'ready' || type === 'iceservers') {
    const servers = m.iceServers ?? m.iceservers ?? m.ice_servers;
    if (servers) { await openPeer(servers); return; }
    const s = ws; // ready 有时不带 ICE 服务器、紧接着单独发；1 秒等不到就用默认 STUN
    setTimeout(() => { if (s === ws) void openPeer(STUN); }, 1000);
  } else if (type === 'answer' && pc) {
    await pc.setRemoteDescription({ type: 'answer', sdp: m.sdp });
    for (const c of pending.splice(0)) await pc.addIceCandidate(c);
  } else if (type === 'icecandidate' && m.candidate) {
    if (pc?.remoteDescription) await pc.addIceCandidate(m.candidate); else pending.push(m.candidate);
  }
}

async function openPeer(iceServers: RTCIceServer[]): Promise<void> {
  if (pc || !cam) return;
  const p = (pc = new RTCPeerConnection({ iceServers }));
  cam.getTracks().forEach((t) => p.addTrack(t, cam!));
  p.ontrack = (e) => { if (outEl.value) outEl.value.srcObject = e.streams[0] ?? new MediaStream([e.track]); };
  p.onicecandidate = ({ candidate: c }) => { if (c) send({ type: 'icecandidate', candidate: { candidate: c.candidate, sdpMid: c.sdpMid, sdpMLineIndex: c.sdpMLineIndex } }); };
  p.onconnectionstatechange = () => {
    const st = p.connectionState;
    if (st === 'connected') { phase.value = 'live'; status.value = i18nT('直播中'); }
    else if (st === 'failed') fail(i18nT('视频连接失败：网络可能挡住了 UDP，换个网络再试'));
    else if (st === 'disconnected') status.value = i18nT('视频断开，正在重连…');
    else if (st === 'connecting') status.value = i18nT('连接视频中…');
  };
  const offer = await p.createOffer();
  await p.setLocalDescription(offer);
  send({ type: 'offer', sdp: offer.sdp });
}

/** 直播中换衣服 / 换顾客：只发一条新输入，不用重连（服务端不回确认，几秒内画面会变） */
async function refreshInput(): Promise<void> {
  if (!ws) return;
  try {
    input = await ap<{ prompt: string; referenceImage: string }>('live.ref', sel());
    sendInput();
    status.value = i18nT('已换，稍等几秒');
  } catch (e) { error.value = errorMessage(e); }
}
function pickGarment(id: string): void { garmentId.value = id; void refreshInput(); }
function pickCustomer(id: string): void { customerId.value = id; void refreshInput(); }
/** 两种方式是两个模型，切方式要重连 */
function setMode(m: Mode): void {
  if (mode.value === m) return;
  const wasLive = !!ws;
  stop();
  mode.value = m;
  if (wasLive && canStart.value) void start();
}

function fail(msg: string): void {
  stop(false, msg);
  phase.value = 'error';
  error.value = msg;
  status.value = '';
}

function stop(report = true, err?: string): void {
  const wasActive = !!ws || !!cam;
  session += 1;
  if (ws) { ws.onclose = null; ws.onmessage = null; try { ws.close(); } catch { /* */ } }
  try { pc?.close(); } catch { /* */ }
  cam?.getTracks().forEach((t) => t.stop());
  ws = null; pc = null; cam = null; pending = []; input = null;
  if (timer) { clearInterval(timer); timer = null; }
  if (camEl.value) camEl.value.srcObject = null;
  if (outEl.value) outEl.value.srcObject = null;
  if (wasActive && startedAt) {
    const seconds = Math.round((Date.now() - startedAt) / 1000);
    void ap('live.ended', { mode: mode.value, seconds, ok: !err, ...(err ? { error: err } : {}) }).catch(() => undefined);
  }
  startedAt = 0;
  if (report) { phase.value = 'idle'; status.value = ''; }
}

onBeforeUnmount(() => stop());
</script>

<style scoped>
.ap-live { display: grid; gap: 14px; }
.ap-live__grid { display: grid; grid-template-columns: minmax(320px, 420px) minmax(0, 1fr); gap: 14px; align-items: start; }
@media (max-width: 1000px) { .ap-live__grid { grid-template-columns: 1fr; } }
.ap-head { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; margin-bottom: 10px; }
.ap-head .grow { flex: 1; }
.ap-live__no { width: 22px; height: 22px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 800; background: color-mix(in srgb, var(--color-brand) 14%, transparent); color: var(--color-brand); }
.ap-live__modes { display: grid; gap: 8px; margin-bottom: 16px; }
.ap-live__mode { text-align: start; display: grid; gap: 2px; padding: 10px 12px; border: 1px solid var(--color-border); border-radius: var(--radius-5); background: var(--color-bg-card); cursor: pointer; font: inherit; color: inherit; }
.ap-live__mode strong { display: inline-flex; gap: 6px; align-items: center; }
.ap-live__mode small { color: var(--color-text-secondary); }
.ap-live__mode.on { border-color: var(--color-brand); background: color-mix(in srgb, var(--color-brand) 8%, var(--color-bg-card)); }
.ap-live__pick { display: grid; grid-template-columns: repeat(auto-fill, minmax(92px, 1fr)); gap: 8px; max-height: 420px; overflow: auto; }
.ap-live__item { display: grid; gap: 4px; padding: 4px; border: 2px solid transparent; border-radius: var(--radius-4); background: var(--color-bg-hover); cursor: pointer; font: inherit; color: inherit; text-align: center; }
.ap-live__item img { width: 100%; aspect-ratio: 3 / 4; object-fit: cover; border-radius: var(--radius-3); background: #fff; }
.ap-live__item span { font-size: 12px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.ap-live__item.on { border-color: var(--color-brand); }
.ap-live__videos { display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 12px; }
.ap-live__videos figure { margin: 0; }
.ap-live__videos video { width: 100%; aspect-ratio: 16 / 9; background: #000; border-radius: var(--radius-5); }
.ap-live__videos video.mirror { transform: scaleX(-1); }
.ap-live__videos figcaption { color: var(--color-text-secondary); font-size: 12px; margin-top: 4px; }
</style>
