// @vitest-environment happy-dom
/**
 * 配置引导：电脑配置与模型推荐、下载按钮走组件安装器、演示组织确认、群机器人保存 / 测试、给自己填手机号、
 * 手机端自动开、声纹录音提交、大模型测试、完成。
 */
import { afterEach, describe, expect, it, vi } from 'vitest';
import { flushPromises, mount, type VueWrapper } from '@vue/test-utils';
import { createPinia } from 'pinia';
import SetupWizard from './SetupWizard.vue';
import { mmBoot } from './shared';

const $t = (s: string, args?: Record<string, unknown>) => s.replace(/\{(\w+)\}/g, (_, k) => String(args?.[k] ?? k));
let wrappers: VueWrapper[] = [];

const PRESETS = [{ id: 'dashscope', protocol: 'chat-audio', baseUrl: 'https://dashscope.aliyuncs.com/compatible-mode/v1', models: ['qwen3-asr-flash'], keyUrl: 'https://k' }, { id: 'siliconflow', protocol: 'transcriptions', baseUrl: 'https://api.siliconflow.cn/v1', models: ['FunAudioLLM/SenseVoiceSmall', 'TeleAI/TeleSpeechASR'], keyUrl: '' }, { id: 'openai', protocol: 'transcriptions', baseUrl: 'https://api.openai.com/v1', models: ['whisper-1'], keyUrl: '' }, { id: 'custom', protocol: 'transcriptions', baseUrl: '', models: [], keyUrl: '' }];

function status(over: Record<string, any> = {}) {
  return {
    done: false,
    org: { source: 'demo', people: 20, depts: 6, lastSync: null, mentionable: 0 },
    push: { channel: null, hasWebhook: false, webhookMasked: '', appConfigured: false },
    me: { id: 'linxiao', name: '林晓', deptName: '运营中心', mobile: '', voiceprint: false },
    mobile: { running: false },
    voiceprints: { collected: 0, total: 20 },
    hardware: { cpu: 'Apple M5 Pro', cores: 18, memGb: 24, arch: 'arm64', platform: 'darwin', appleSilicon: true, freeDiskGb: 120 },
    models: { python: true, ffmpeg: true, asrModel: 'small', senseVoice: false, fireRed: false, speaker: false, asrReady: false },
    recommend: { engine: 'firered', installIds: ['asr-meeting-sensevoice', 'asr-meeting-firered2'], sizeMb: 1406, estMinPerHour: 12, workers: 1, tier: 'good', speakerInstallId: 'speaker-campplus' },
    estimates: { firered: 12, sensevoice: 2 },
    asr: { mode: 'local', localModel: 'auto', cloud: null, presets: PRESETS },
    ...over,
  };
}

function setup() {
  let st: any = status();
  const calls: Array<[string, any]> = [];
  const invoke = vi.fn(async (action: string, payload: any) => {
    calls.push([action, payload]);
    switch (action) {
      case 'setup.status': return st;
      case 'boot': return mmBoot.value;
      case 'mobile.start': st = status({ ...st, mobile: { running: true, url: 'http://192.168.1.5:8280' } }); return st.mobile;
      case 'mobile.status': return st.mobile;
      case 'mobile.link': return { url: 'http://192.168.1.5:8280/m?t=abc' };
      case 'wecom.webhook.save': st = { ...st, push: { channel: 'webhook', hasWebhook: true, webhookMasked: '…key=693a****5aaa', appConfigured: false } }; return st.push;
      case 'wecom.webhook.test': return { ok: true };
      case 'org.person.contact': st = { ...st, me: { ...st.me, mobile: payload.mobile }, org: { ...st.org, mentionable: 1 } }; return {};
      case 'voiceprint.enrollData': st = { ...st, me: { ...st.me, voiceprint: true } }; return { ok: true, seconds: 12 };
      case 'setup.llmTest': return { ok: true, reply: '收到', ms: 1800 };
      case 'setup.finish': return { ok: true, doneAt: 1 };
      case 'asr.cloud.test': return payload.apiKey === 'bad' ? { ok: false, error: 'API Key 不对、已失效' } : { ok: true, ms: 320 };
      case 'asr.cloud.save': st = { ...st, asr: { ...st.asr, cloud: { provider: payload.provider, baseUrl: payload.baseUrl, model: payload.model, hasKey: true } } }; return st.asr;
      case 'asr.mode.save': st = { ...st, asr: { ...st.asr, mode: payload.mode, localModel: payload.localModel } }; return st.asr;
      default: throw new Error(`unexpected action ${action}`);
    }
  });
  const install = vi.fn(async (id: string) => {
    if (id === 'asr-meeting-sensevoice') st = { ...st, models: { ...st.models, senseVoice: true } };
    if (id === 'asr-meeting-firered2') st = { ...st, models: { ...st.models, fireRed: true, asrReady: !!st.models.senseVoice } };
    if (id === 'speaker-campplus') st = { ...st, models: { ...st.models, speaker: true } };
    return { ok: true, id };
  });
  (window as any).electronAPI = { workbenches: { meetingMgmt: { invoke, onEvent: () => () => {} } }, pyExt: { install, onInstallProgress: () => () => {} } };
  mmBoot.value = { me: { person: { id: 'linxiao', name: '林晓', deptId: 'd_ops' }, isAdmin: true, canCreateProject: true }, org: { source: 'demo', deptCount: 6, peopleCount: 20 }, settings: { adminIds: ['linxiao'] }, wecomConnected: false, mobile: { running: false }, badges: { home: 0, meetings: 0, tasks: 0 } } as any;
  const w = mount(SetupWizard, { global: { plugins: [createPinia()], mocks: { $t } }, attachTo: document.body });
  wrappers.push(w);
  return { w, calls, install, names: () => calls.map((c) => c[0]) };
}

afterEach(() => {
  wrappers.forEach((w) => w.unmount());
  wrappers = [];
  delete (window as any).electronAPI;
  mmBoot.value = null;
  vi.restoreAllMocks();
});

describe('配置引导', () => {
  it('第 1 步：显示电脑配置，跳出推荐的最好模型（FireRedASR2 + SenseVoice 兜底），一键依次下载；声纹模型也下好后这一步打勾', async () => {
    const { w, install } = setup();
    await flushPromises();
    expect(w.find('[data-test="mm-setup-hw"]').text()).toContain('Apple M5 Pro');
    const best = w.find('[data-test="mm-asr-best"]');
    expect(best.text()).toContain('FireRedASR2（最准）+ SenseVoice 兜底');
    expect(best.text()).toContain('1 小时录音约 12 分钟');
    expect(w.find('[data-test="mm-setup-progress"]').text()).toContain('已完成 0 / 6');
    await w.find('[data-test="mm-asr-best-install"]').trigger('click');
    await flushPromises();
    expect(install.mock.calls.map((c) => c[0])).toEqual(['asr-meeting-sensevoice', 'asr-meeting-firered2']);
    await w.find('[data-test="mm-setup-spk-install"]').trigger('click');
    await flushPromises();
    expect(install).toHaveBeenCalledWith('speaker-campplus');
    expect(w.find('[data-test="mm-asr-best-ready"]').exists()).toBe(true);
    expect(w.find('[data-test="mm-setup-step-models"]').classes()).toContain('ok');
    expect(w.find('[data-test="mm-setup-progress"]').text()).toContain('已完成 1 / 6');
  });

  it('组织 → 推送 → 手机端 → 声纹 → 大模型 → 完成：每步状态独立，完成时调 setup.finish', async () => {
    const { w, names, calls } = setup();
    await flushPromises();
    await w.find('[data-test="mm-setup-step-org"]').trigger('click');
    expect(w.find('[data-test="mm-setup-step-org"]').classes()).not.toContain('ok'); // 演示组织要点一下「就用演示组织」才算
    await w.find('[data-test="mm-setup-org-demo"]').trigger('click');
    await flushPromises();
    expect(w.find('[data-test="mm-setup-step-org"]').classes()).toContain('ok');
    expect(names()).not.toContain('org.sync'); // 已经是演示组织，不用再同步

    await w.find('[data-test="mm-setup-next"]').trigger('click');
    await w.find('[data-test="mm-setup-hook"]').setValue('https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=693a91f6-7a1b-4bc4-97a0-0ec2b1fa5aaa');
    await w.find('[data-test="mm-setup-hook-save"]').trigger('click');
    await flushPromises();
    await w.find('[data-test="mm-setup-hook-test"]').trigger('click');
    await flushPromises();
    expect(w.find('[data-test="mm-setup-hook-result"]').text()).toContain('已发到群里');
    await w.find('[data-test="mm-setup-mobile"]').setValue('13800000001');
    await w.find('[data-test="mm-setup-mobile-save"]').trigger('click');
    await flushPromises();
    expect(calls.find((c) => c[0] === 'org.person.contact')![1]).toEqual({ personId: 'linxiao', mobile: '13800000001' });
    expect(w.find('[data-test="mm-setup-mentionable"]').text()).toContain('1 / 20');
    expect(w.find('[data-test="mm-setup-step-push"]').classes()).toContain('ok');

    // 手机端：进这一步就自动开服务
    await w.find('[data-test="mm-setup-next"]').trigger('click');
    await flushPromises();
    expect(names()).toContain('mobile.start');
    expect(w.find('[data-test="mm-setup-step-mobile"]').classes()).toContain('ok');

    // 声纹：声纹模型没下载时不让提交；回第 1 步下载后，勾授权 + 录完才能提交（录音组件 emit recorded 模拟）
    await w.find('[data-test="mm-setup-next"]').trigger('click');
    const submit = () => w.find('[data-test="mm-setup-voice-submit"]');
    await w.find('[data-test="mm-setup-consent"]').setValue(true);
    w.findComponent({ name: 'VoiceRecorder' }).vm.$emit('recorded', { data: 'QUJD', ext: 'webm', seconds: 12 });
    await flushPromises();
    expect(submit().attributes('disabled')).toBeDefined();
    await w.find('[data-test="mm-setup-step-models"]').trigger('click');
    await w.find('[data-test="mm-setup-spk-install"]').trigger('click');
    await flushPromises();
    await w.find('[data-test="mm-setup-step-voice"]').trigger('click');
    // 刚录好的和勾过的授权都还在，不用重来
    expect(submit().attributes('disabled')).toBeUndefined();
    await submit().trigger('click');
    await flushPromises();
    expect(calls.find((c) => c[0] === 'voiceprint.enrollData')![1]).toEqual({ personId: 'linxiao', consent: true, data: 'QUJD', ext: 'webm' });
    expect(w.find('[data-test="mm-setup-voice-result"]').text()).toContain('声纹已采集');

    await w.find('[data-test="mm-setup-next"]').trigger('click');
    await w.find('[data-test="mm-setup-llm-test"]').trigger('click');
    await flushPromises();
    expect(w.find('[data-test="mm-setup-llm-result"]').text()).toContain('收到');

    await w.find('[data-test="mm-setup-next"]').trigger('click');
    expect(w.find('[data-test="mm-setup-finish"]').exists()).toBe(true);
    await w.find('[data-test="mm-setup-done"]').trigger('click');
    await flushPromises();
    expect(names()).toContain('setup.finish');
    expect(w.emitted('done')).toBeTruthy();
  });

  it('自建应用同步失败（企微 60020）：把错误里的出口 IP 单独显示出来，方便填进企业可信 IP', async () => {
    setup();
    const invoke = (window as any).electronAPI.workbenches.meetingMgmt.invoke;
    invoke.mockImplementation(async (a: string) => {
      if (a === 'setup.status') return status();
      if (a === 'wecom.save') return {};
      if (a === 'org.sync') return { error: '本机出口 IP（113.57.20.8）不在企业可信 IP 中：请在企业微信管理后台「应用管理 → 本应用 → 企业可信 IP」里加上它，约 1 分钟后生效', added: [], changed: [], left: [] };
      return null;
    });
    const w = mount(SetupWizard, { global: { plugins: [createPinia()], mocks: { $t } } });
    wrappers.push(w);
    await flushPromises();
    await w.find('[data-test="mm-setup-step-org"]').trigger('click');
    expect(w.find('[data-test="mm-setup-app-guide"]').text()).toContain('设置可信域名');
    await w.find('[data-test="mm-setup-corp"]').setValue('ww123');
    await w.find('[data-test="mm-setup-agent"]').setValue('1000002');
    await w.find('[data-test="mm-setup-secret"]').setValue('s3cret');
    await w.find('[data-test="mm-setup-app-sync"]').trigger('click');
    await flushPromises();
    expect(w.find('[data-test="mm-setup-egress-ip"]').text()).toContain('113.57.20.8');
  });

  it('通讯录换了、原身份不在里面：直接在引导里选「你是谁」，选完接着配置；不用退出去', async () => {
    setup();
    let chosen = '';
    const calls: string[] = [];
    const invoke = (window as any).electronAPI.workbenches.meetingMgmt.invoke;
    invoke.mockImplementation(async (a: string, p: any) => {
      calls.push(a);
      if (a === 'setup.status') {
        if (!chosen) throw new Error('当前身份无效，请先选择身份');
        return status({ me: { id: 'ZhangSan', name: '张三', deptName: '总部', mobile: '', voiceprint: false } });
      }
      if (a === 'people.list') return { depts: [{ id: '1', name: '总部' }], people: [{ id: 'ZhangSan', name: '张三', deptId: '1', title: '总经理' }, { id: 'LiSi', name: '李四', deptId: '1' }] };
      if (a === 'identity.set') { chosen = p.personId; return {}; }
      if (a === 'boot') return mmBoot.value;
      return null;
    });
    const w = mount(SetupWizard, { global: { plugins: [createPinia()], mocks: { $t } } });
    wrappers.push(w);
    await flushPromises();
    expect(w.find('[data-test="mm-setup-identity"]').text()).toContain('你是哪一位');
    expect(w.text()).not.toContain('当前身份无效');
    await w.find('[data-test="mm-setup-me-ZhangSan"]').trigger('click');
    await flushPromises();
    expect(chosen).toBe('ZhangSan');
    expect(w.find('[data-test="mm-setup-identity"]').exists()).toBe(false);
    expect(w.find('[data-test="mm-setup-models"]').exists()).toBe(true);
  });

  it('Secret：保存后留在框里不清空；重新打开时带出 CorpID / AgentID，点眼睛取回已保存的原文', async () => {
    setup();
    const invoke = (window as any).electronAPI.workbenches.meetingMgmt.invoke;
    invoke.mockImplementation(async (a: string) => {
      if (a === 'setup.status') return status({ wecom: { corpId: 'ww1', agentId: '1000002', hasSecret: true }, push: { channel: 'app', hasWebhook: false, webhookMasked: '', appConfigured: true } });
      if (a === 'wecom.secret.reveal') return { secret: 'saved-secret' };
      if (a === 'wecom.save') return {};
      if (a === 'org.sync') return { added: [], changed: [], left: [], needIdentity: false };
      if (a === 'boot') return mmBoot.value;
      return null;
    });
    const w = mount(SetupWizard, { global: { plugins: [createPinia()], mocks: { $t } } });
    wrappers.push(w);
    await flushPromises();
    await w.find('[data-test="mm-setup-step-org"]').trigger('click');
    expect((w.find('[data-test="mm-setup-corp"]').element as HTMLInputElement).value).toBe('ww1');
    expect((w.find('[data-test="mm-setup-agent"]').element as HTMLInputElement).value).toBe('1000002');
    const secret = () => w.find('[data-test="mm-setup-secret"]').element as HTMLInputElement;
    expect(secret().value).toBe('');
    expect(secret().placeholder).toContain('已保存');
    await w.find('[data-test="mm-setup-secret-eye"]').trigger('click');
    await flushPromises();
    expect(secret().value).toBe('saved-secret');
    expect(secret().type).toBe('text');
    await w.find('[data-test="mm-setup-app-sync"]').trigger('click');
    await flushPromises();
    expect(secret().value).toBe('saved-secret');
  });

  it('配置不够时说明原因：内存不到 16GB → 推荐 SenseVoice', async () => {
    const env = setup();
    const invoke = (window as any).electronAPI.workbenches.meetingMgmt.invoke;
    invoke.mockImplementation(async (a: string) => (a === 'setup.status'
      ? status({ hardware: { cpu: 'Intel', cores: 4, memGb: 7.8, arch: 'x64', platform: 'win32', appleSilicon: false, freeDiskGb: 50 }, recommend: { engine: 'sensevoice', installIds: ['asr-meeting-sensevoice'], sizeMb: 228, estMinPerHour: 3, workers: 1, tier: 'weak', downgradeReason: 'memory', speakerInstallId: 'speaker-campplus' } })
      : null));
    const w = mount(SetupWizard, { global: { plugins: [createPinia()], mocks: { $t } } });
    wrappers.push(w);
    await flushPromises();
    const best = w.find('[data-test="mm-asr-best"]').text();
    expect(best).toContain('SenseVoice（快速）');
    expect(best).toContain('内存 7.8 GB');
    void env;
  });

  it('改填在线接口：选服务商带出地址和模型，测试连接、保存后转写方式改成在线接口，这一步也算完成', async () => {
    const { w, calls } = setup();
    await flushPromises();
    await w.find('[data-test="mm-asr-mode-cloud"]').trigger('click');
    await w.find('[data-test="mm-asr-cloud-provider"]').setValue('siliconflow');
    expect((w.find('[data-test="mm-asr-cloud-url"]').element as HTMLInputElement).value).toBe('https://api.siliconflow.cn/v1');
    expect((w.find('[data-test="mm-asr-cloud-model"]').element as HTMLInputElement).value).toBe('FunAudioLLM/SenseVoiceSmall');
    await w.find('[data-test="mm-asr-cloud-model"]').setValue('TeleAI/TeleSpeechASR');
    await w.find('[data-test="mm-asr-cloud-key"]').setValue('bad');
    await w.find('[data-test="mm-asr-cloud-test"]').trigger('click');
    await flushPromises();
    expect(w.find('[data-test="mm-asr-cloud-test-msg"]').text()).toContain('API Key 不对');
    await w.find('[data-test="mm-asr-cloud-key"]').setValue('sk-ok');
    await w.find('[data-test="mm-asr-cloud-save"]').trigger('click');
    await flushPromises();
    expect(calls.find((c) => c[0] === 'asr.cloud.save')?.[1]).toEqual({ provider: 'siliconflow', baseUrl: 'https://api.siliconflow.cn/v1', model: 'TeleAI/TeleSpeechASR', apiKey: 'sk-ok' });
    expect(calls.find((c) => c[0] === 'asr.mode.save')?.[1]).toEqual({ mode: 'cloud', localModel: 'auto' });
  });

  it('配置引导所有网页直达跳转都经 electronAPI.openExternal 打开系统浏览器', async () => {
    const { w } = setup();
    const openExternal = vi.fn(async () => ({ ok: true }));
    (window as any).electronAPI.openExternal = openExternal;
    await flushPromises();

    // 第 1 步：在线语音识别 API Key 获取页
    await w.find('[data-test="mm-asr-mode-cloud"]').trigger('click');
    await w.find('.mm-asr__keylink').trigger('click');
    expect(openExternal).toHaveBeenLastCalledWith('https://k');

    // 第 2 步：企微后台 通讯录 / 我的企业 / 应用管理
    await w.find('[data-test="mm-setup-step-org"]').trigger('click');
    await w.find('[data-test="mm-setup-link-contacts"]').trigger('click');
    expect(openExternal).toHaveBeenLastCalledWith('https://work.weixin.qq.com/wework_admin/frame#contacts');
    await w.find('[data-test="mm-setup-link-profile"]').trigger('click');
    expect(openExternal).toHaveBeenLastCalledWith('https://work.weixin.qq.com/wework_admin/frame#profile');
    await w.find('[data-test="mm-setup-link-apps"]').trigger('click');
    expect(openExternal).toHaveBeenLastCalledWith('https://work.weixin.qq.com/wework_admin/frame#apps');

    // 第 3 步：企微群机器人官方配置说明
    await w.find('[data-test="mm-setup-step-push"]').trigger('click');
    await w.find('[data-test="mm-setup-link-webhook-doc"]').trigger('click');
    expect(openExternal).toHaveBeenLastCalledWith('https://developer.work.weixin.qq.com/document/path/91770');

    // 第 4 步：手机页在浏览器直接打开
    await w.find('[data-test="mm-setup-step-mobile"]').trigger('click');
    await flushPromises();
    await w.find('[data-test="mm-mobile-open"]').trigger('click');
    expect(openExternal).toHaveBeenLastCalledWith('http://192.168.1.5:8280/m?t=abc');
  });
});
