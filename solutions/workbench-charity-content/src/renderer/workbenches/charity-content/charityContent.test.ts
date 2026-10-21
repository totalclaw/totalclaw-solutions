/**
 * 慈善活动内容工场 · 渲染层护栏：
 *   · 四步向导：视图里恰好 4 张 CcStep + 1 条 CcProgress，进度条 sticky 贴顶（UX 硬规则二）
 *   · 步骤状态机：失败落在具体那一步、前面重跑打回后面、当前步随之推进（UX 硬规则一）
 *   · CcProgress / CcStep 真挂载：打勾 / 失败原因 / 真实阶段文案 / 停止按钮
 *   · 一键流程采纳规则：fallback 的结果照常采纳只记 console，失败抛出带原因
 *   · 动效尊重 prefers-reduced-motion
 */
import { describe, it, expect, vi } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { mount } from '@vue/test-utils';
import { nextTick } from 'vue';
import CcProgress from './CcProgress.vue';
import CcStep from './CcStep.vue';
import LangChips from './LangChips.vue';
import CcVideoPhases from './CcVideoPhases.vue';
import CcPromptBox from './CcPromptBox.vue';
import { CHARITY_PROMPT_MAX, DEFAULT_CONTENT_PROMPT, DEFAULT_VIDEO_PROMPT } from '../../../shared/charityPrompts';
import { useSteps, stepMetas, acceptStepResult, archiveReady, blankArchive, fmtDur, fmtRunTime, summaryTextOf, phaseFraction, VIDEO_PLAN, usePersistedPrompt, defaultPrompt, HD_VOICES, defaultVoices } from './shared';

const g = { global: { mocks: { $t: (s: string, p?: Record<string, unknown>) => (p ? s.replace(/\{(\w+)\}/g, (_, k) => String(p[k] ?? '')) : s) } } };
const read = (f: string) => readFileSync(join(__dirname, f), 'utf-8');
const view = readFileSync(join(__dirname, '..', '..', 'views', 'CharityContentWorkbenchView.vue'), 'utf-8');

describe('分步向导结构', () => {
  it('视图恰好 5 张步骤卡、1 条进度条、hero 一键按钮', () => {
    expect((view.match(/<CcStep\b/g) || []).length).toBe(5);
    expect((view.match(/<CcProgress\b/g) || []).length).toBe(1);
    expect(view).toContain('一键完整流程');
    expect(stepMetas().map((m) => m.key)).toEqual(['material', 'report', 'speech', 'video', 'publish']);
    expect(stepMetas('article').map((m) => m.key)).toEqual(['speech', 'video', 'publish']);
  });
  it('进度条 position: sticky 贴顶；减少动态效果时动画全关', () => {
    const css = read('styles.css');
    expect(css).toMatch(/\.cc-progress\s*\{[^}]*position:\s*sticky/);
    // 贴顶：top 为 0 或抵掉根节点 padding-top 的负值
    expect(css).toMatch(/\.cc-progress\s*\{[^}]*top:\s*(0|-\d+px)/);
    expect(css).toMatch(/@media \(prefers-reduced-motion: reduce\)[\s\S]*animation: none !important/);
  });
  it('步骤卡失败态把错误原因写在这一步上', () => {
    expect(read('CcStep.vue')).toContain("runtime.state === 'failed' && runtime.error");
  });
  it('每个产物都有 下载 / 所在目录 / 重新生成', () => {
    const a = read('AssetActions.vue');
    for (const k of ['下载', '所在目录', '重新生成']) expect(a).toContain(k);
    expect((view.match(/<AssetActions\b/g) || []).length).toBeGreaterThanOrEqual(4);
  });
});

describe('步骤状态机', () => {
  it('start / done / fail / resetAfter 各自独立，当前步跟着推进', () => {
    const s = useSteps(stepMetas());
    s.start('material');
    expect(s.runtime.material.state).toBe('running');
    expect(s.isRunning()).toBe(true);
    s.done('material', '6 个素材');
    expect(s.runtime.material.summary).toBe('6 个素材');
    expect(s.currentKey.value).toBe('report');
    s.start('report'); s.done('report'); s.start('speech'); s.fail('speech', new Error("Error invoking remote method 'x': edge-tts 挂了"));
    expect(s.runtime.speech.state).toBe('failed');
    expect(s.runtime.speech.error).toBe('edge-tts 挂了');
    expect(s.currentKey.value).toBe('speech');
    expect(s.runtime.report.state).toBe('done');
    s.resetAfter('material');
    expect(s.runtime.report.state).toBe('todo');
    expect(s.runtime.speech.state).toBe('todo');
    expect(s.runtime.material.state).toBe('done');
  });
});

describe('CcProgress 挂载', () => {
  function mountProgress(states: Record<string, 'todo' | 'running' | 'done' | 'failed'>, live: any = null) {
    const metas = stepMetas();
    const runtime: any = {};
    for (const m of metas) runtime[m.key] = { state: states[m.key] || 'todo', error: states[m.key] === 'failed' ? '视觉模型超时' : undefined };
    return mount(CcProgress, { props: { metas, runtime, currentKey: 'report', live }, ...g });
  }
  it('完成步打勾（SVG 描边）、失败步显示原因、进行中显示真实阶段文案与停止按钮', async () => {
    const w = mountProgress({ material: 'done', report: 'running', speech: 'failed' }, { runId: 'r', step: 'analyze', stage: 'analyze', msg: '视频抽帧并阅读：b.mp4', done: 2, total: 6 });
    await nextTick();
    // 共享步骤条：完成步带 done 类（数字位显示 ✓）；进行中 / 失败的原因走该步副标题
    expect(w.findAll('.wsb-step.done').length).toBe(1);
    expect(w.findAll('.wsb-step')[0].classes()).toContain('done');
    expect(w.findAll('.wsb-step')[1].text()).toContain('视频抽帧并阅读：b.mp4');
    expect(w.findAll('.wsb-step')[2].text()).toContain('视觉模型超时');
    // 当前查看第 2 步（report）：进度按步序 2/5 = 40%
    const fill = w.find('.wsb-progress i').attributes('style') || '';
    expect(fill).toContain('40');
    const stop = w.findAll('button').find((b) => b.text().includes('停止'))!;
    expect(stop).toBeTruthy();
    await stop.trigger('click');
    expect(w.emitted('cancel')).toHaveLength(1);
  });
  it('全部完成显示「全部完成」并铺满', async () => {
    const w = mountProgress({ material: 'done', report: 'done', speech: 'done', video: 'done', publish: 'done' });
    await nextTick();
    expect(w.text()).toContain('全部完成');
    expect(w.findAll('.wsb-step.done').length).toBe(5);
    expect(w.classes()).toContain('all-done');
  });
  it('点击步骤发 jump', async () => {
    const w = mountProgress({});
    await w.findAll('.wsb-step')[3].trigger('click');
    expect(w.emitted('jump')![0]).toEqual(['video']);
    // 共享条的下一步 / 上一步也走 jump：第 4 步 → 第 5 步 → 第 4 步
    const keys = stepMetas().map((m) => m.key);
    await w.findAll('button').find((b) => b.text().includes('下一步'))!.trigger('click');
    expect(w.emitted('jump')![1]).toEqual([keys[4]]);
    await w.findAll('button').find((b) => b.text().includes('上一步'))!.trigger('click');
    expect(w.emitted('jump')![2]).toEqual([keys[3]]);
    // 没在运行：不显示停止按钮
    expect(w.findAll('button').some((b) => b.text().includes('停止'))).toBe(false);
  });
});

describe('CcStep / LangChips 挂载', () => {
  it('步骤卡：编号、状态标签、失败原因、插槽内容', () => {
    const w = mount(CcStep, { props: { stepKey: 'video', index: 3, title: '宣传短视频', hint: 'h', icon: 'ri-film-line', runtime: { state: 'failed', error: 'ffmpeg 不在' }, isCurrent: true }, slots: { default: '<p class="body">内容</p>' }, ...g });
    expect(w.attributes('data-cc-step')).toBe('video');
    expect(w.classes()).toContain('is-failed');
    expect(w.classes()).toContain('current');
    expect(w.text()).toContain('第 4 步');
    expect(w.text()).toContain('ffmpeg 不在');
    expect(w.find('.body').exists()).toBe(true);
  });
  it('语言 chip：三语、当前高亮、缺失标记、切换发事件', async () => {
    const w = mount(LangChips, { props: { modelValue: 'zh', missing: ['ar'] }, ...g });
    const btns = w.findAll('button');
    expect(btns.length).toBe(3);
    expect(btns[0].classes()).toContain('active');
    expect(btns[2].classes()).toContain('missing');
    expect(btns[2].attributes('lang')).toBe('ar');
    await btns[1].trigger('click');
    expect(w.emitted('update:modelValue')![0]).toEqual(['en']);
  });
});

describe('一键流程采纳与工具函数', () => {
  it('acceptStepResult：ok 采纳；fallback 采纳只记 console.info；失败抛原因', () => {
    const info = vi.spyOn(console, 'info').mockImplementation(() => {});
    expect(acceptStepResult('x', { ok: true }).ok).toBe(true);
    expect(acceptStepResult('tts', { ok: true, fallback: true }).fallback).toBe(true);
    expect(info).toHaveBeenCalledTimes(1);
    expect(() => acceptStepResult('video', { ok: false, error: 'ffmpeg 缺失' })).toThrow('ffmpeg 缺失');
    expect(() => acceptStepResult('video', null)).toThrow('video');
    info.mockRestore();
  });
  it('archiveReady / summaryTextOf / 格式化', () => {
    expect(archiveReady(null)).toBe(false);
    expect(archiveReady(blankArchive())).toBe(false);
    const a = blankArchive(); a.orgName.zh = '机构'; a.eventName.en = 'Event';
    expect(archiveReady(a)).toBe(true);
    expect(summaryTextOf(null)).toEqual({});
    expect(fmtDur(65)).toBe('1:05');
    expect(fmtRunTime('20260918-174535')).toBe('2026-09-18 17:45');
  });
});

describe('第 4 步：AI 增强版默认 + 真实阶段进度', () => {
  it('成片方式默认 AI 增强版，一键流程强制走 AI 增强版；剪辑版仍可手选', () => {
    expect(view).toMatch(/const videoMode = ref<CharityVideoMode>\('ai'\)/);
    expect(view).toMatch(/videoMode\.value = 'ai';\s*await runVideo\(true\)/);
    expect(view).toContain("@click=\"videoMode = 'clip'\"");
  });
  it('回退原因与回退镜头写在结果上（「已改用素材剪辑版（原因）」/ 本地推拉 / 配乐来源 / 费用）', () => {
    expect(view).toContain("已改用素材剪辑版（{why}）");
    expect(view).toContain('本地推拉（回退）');
    expect(view).toContain('本次 fal 费用约 {usd} 美元');
    expect(view).toContain('<CcVideoPhases');
  });
  it('phaseFraction：已完成阶段 + 当前阶段内计数；没有阶段信息返回 null', () => {
    const plan = VIDEO_PLAN.ai;
    expect(phaseFraction({ runId: 'r', step: 'video', stage: 'video', msg: '', done: 0, total: 1, phase: 'upload', plan })).toBe(0);
    expect(phaseFraction({ runId: 'r', step: 'video', stage: 'video', msg: '', done: 1, total: 3, phase: 'shots', plan })).toBeCloseTo((1 + 1 / 3) / 5, 5);
    expect(phaseFraction({ runId: 'r', step: 'video', stage: 'video', msg: '', done: 3, total: 3, phase: 'compose', plan })).toBe(1);
    expect(phaseFraction({ runId: 'r', step: 'tts', stage: 'tts', msg: '', done: 1, total: 3 })).toBeNull();
  });
  it('阶段条挂载：已过阶段打勾、当前阶段计数 i/N、进度宽度按阶段折算、停止按钮发 cancel', async () => {
    const live = { runId: 'r', step: 'video' as const, stage: 'video', msg: '第 2/3 个动态镜头：生成中 12 秒', done: 1, total: 3, phase: 'shots' as const, plan: VIDEO_PLAN.ai };
    const w = mount(CcVideoPhases, { props: { live, fallbackPlan: VIDEO_PLAN.ai, langCount: 3 }, ...g });
    const lis = w.findAll('li');
    expect(lis).toHaveLength(5);
    expect(lis[0].classes()).toContain('done');
    expect(lis[1].classes()).toContain('running');
    expect(lis[1].text()).toContain('1/3');
    expect(lis[4].text()).toContain('三语合成');
    expect(w.text()).toContain('生成中 12 秒');
    expect(w.find('.cc-stagebar span').attributes('style')).toContain(`${Math.round(((1 + 1 / 3) / 5) * 100)}%`);
    await w.find('button').trigger('click');
    expect(w.emitted('cancel')).toHaveLength(1);
  });
  it('阶段条：还没收到事件时按预期计划显示，剪辑版没有上传 / 镜头段', () => {
    const w = mount(CcVideoPhases, { props: { live: null, fallbackPlan: VIDEO_PLAN.clip, langCount: 2 }, ...g });
    expect(w.findAll('li')).toHaveLength(3);
    expect(w.text()).not.toContain('动态镜头');
    expect(w.text()).toContain('多语合成');
  });
  it('顶部流程条在成片这一步按步序画进度、阶段文案进副标题，不按单阶段计数来回跳', async () => {
    const metas = stepMetas();
    const runtime: any = { material: { state: 'done' }, report: { state: 'done' }, speech: { state: 'done' }, video: { state: 'running' }, publish: { state: 'todo' } };
    const live = { runId: 'r', step: 'video' as const, stage: 'video', msg: '合成', done: 0, total: 3, phase: 'compose' as const, plan: VIDEO_PLAN.ai };
    const w = mount(CcProgress, { props: { metas, runtime, currentKey: 'video', live }, ...g });
    await nextTick();
    // 共享步骤条按步序画进度：查看第 4 步（video）→ 4/5 = 80%；阶段细节（真实阶段文案）走该步副标题
    const fill = w.find('.wsb-progress i').attributes('style') || '';
    expect(fill).toContain('80');
    expect(w.findAll('.wsb-step.done').length).toBe(3);
    expect(w.findAll('.wsb-step')[3].text()).toContain('合成');
    expect(w.findAll('.wsb-step')[3].classes()).toContain('on');
  });
});

describe('布局：不横向溢出 / hero 不塌', () => {
  const css = read('styles.css');
  it('单列网格一律 minmax(0,1fr)，工作台本身列宽只由容器决定、行按内容高', () => {
    expect(view).toMatch(/\.cc-workbench \{[^}]*grid-template-columns: minmax\(0, 1fr\)/);
    expect(view).toMatch(/\.cc-workbench \{[^}]*grid-auto-rows: max-content/);
    expect(css).toMatch(/\.cc-steps \{[^}]*minmax\(0, 1fr\)/);
    expect(css).toMatch(/\.cc-panel \{[^}]*minmax\(0, 1fr\)/);
  });
  it('hero 用 overflow: clip（hidden 会在定高网格里被压成一条）', () => {
    expect(css).toMatch(/\.cc-hero \{[^}]*overflow: clip/);
  });
  it('音频波形 canvas 钉死 CSS 宽度，不让 width 属性参与最小内容宽度', () => {
    expect(css).toMatch(/\.cc-audio__wave \{[^}]*width: 0;[^}]*min-width: 0/);
  });
});

describe('两个提示词输入框', () => {
  it('视图：第 1 步有「内容提示词」、第 4 步生成按钮上方有「视频提示词」，两个都随请求送出', () => {
    expect((view.match(/<CcPromptBox\b/g) || []).length).toBe(2);
    const step2 = view.indexOf('step-key="report"');
    const content = view.indexOf('kind="content"');
    expect(content).toBeGreaterThan(view.indexOf('step-key="material"'));
    expect(content).toBeLessThan(step2);
    const videoBox = view.indexOf('kind="video"');
    expect(videoBox).toBeGreaterThan(view.indexOf('step-key="video"'));
    expect(videoBox).toBeLessThan(view.indexOf("$t('生成短视频')"));
    expect(view).toMatch(/api\(\)\.analyze\(\{[^}]*contentPrompt: contentPrompt\.value/);
    expect(view).toMatch(/api\(\)\.report\(\{[^}]*contentPrompt: contentPrompt\.value/);
    expect(view).toMatch(/api\(\)\.video\(\{[^}]*contentPrompt: contentPrompt\.value, videoPrompt: videoPrompt\.value/);
    expect(view).toContain('<template #effective>');
  });

  it('CcPromptBox：预填内容可改；恢复默认回到默认值（已是默认时按钮禁用）；显示已用 / 上限字数；可展开实际使用的提示词', async () => {
    const w = mount(CcPromptBox, {
      ...g,
      props: { kind: 'video', modelValue: '我的视频提示词', defaultValue: '默认视频提示词', label: '视频提示词', hint: 'h' },
      slots: { effective: '<dl class="eff">merged</dl>' },
    });
    const ta = w.find('textarea');
    expect((ta.element as HTMLTextAreaElement).value).toBe('我的视频提示词');
    expect(ta.attributes('maxlength')).toBe(String(CHARITY_PROMPT_MAX));
    expect(w.text()).toContain(`7/${CHARITY_PROMPT_MAX} 字`);
    await ta.setValue('改过的');
    expect(w.emitted('update:modelValue')!.at(-1)).toEqual(['改过的']);
    await w.find('[data-act="reset"]').trigger('click');
    expect(w.emitted('update:modelValue')!.at(-1)).toEqual(['默认视频提示词']);
    expect(w.find('details .eff').exists()).toBe(true);
    await w.setProps({ modelValue: '默认视频提示词' });
    expect(w.find('[data-act="reset"]').attributes('disabled')).toBeDefined();
  });

  it('usePersistedPrompt：首次打开预填默认提示词；改动本会话刷新不丢（包括清空）；恢复默认', async () => {
    sessionStorage.clear();
    const a = usePersistedPrompt('content');
    expect(a.value.value).toBe(DEFAULT_CONTENT_PROMPT.zh);
    expect(a.defaultValue).toBe(defaultPrompt('content', 'zh'));
    a.value.value = '只讲孩子们';
    await nextTick();
    expect(usePersistedPrompt('content').value.value).toBe('只讲孩子们');
    a.value.value = '';
    await nextTick();
    expect(usePersistedPrompt('content').value.value).toBe('');
    a.reset();
    await nextTick();
    expect(usePersistedPrompt('content').value.value).toBe(DEFAULT_CONTENT_PROMPT.zh);
    expect(usePersistedPrompt('video').value.value).toBe(DEFAULT_VIDEO_PROMPT.zh);
    expect(defaultPrompt('video', 'ar')).toBe(DEFAULT_VIDEO_PROMPT.ar);
    sessionStorage.clear();
  });
});

describe('第 3 步女声 / 男声切换', () => {
  it('三语都有女声 / 男声两组，默认女声；男声默认：中文稳重高管、英文 Trustworth、阿语原生亲和男声', () => {
    for (const l of ['zh', 'en', 'ar'] as const) {
      expect(HD_VOICES()[l].female.length).toBeGreaterThan(0);
      expect(HD_VOICES()[l].male.length).toBeGreaterThan(0);
    }
    expect(defaultVoices('female')).toEqual({ zh: 'Wise_Woman', en: 'Calm_Woman', ar: 'Calm_Woman' });
    expect(defaultVoices('male')).toEqual({ zh: 'Chinese (Mandarin)_Reliable_Executive', en: 'English_Trustworth_Man', ar: 'Arabic_FriendlyGuy' });
  });
  it('视图：生成配置在按钮正上方，目标语言多选，每种语言各自定性别与音色', () => {
    // 配置块必须排在文稿框之后、合成按钮之前 —— 「要读什么 → 读成什么 → 开始生成」
    const iText = view.indexOf('v-model="sourceText"');
    const iPick = view.indexOf('class="cc-voice-pick"');
    const iBtn = view.indexOf('@click="runSpeech()"');
    expect(iText).toBeGreaterThan(0);
    expect(iPick).toBeGreaterThan(iText);
    expect(iBtn).toBeGreaterThan(iPick);
    // 目标语言多选：点一下是加减，不是切换
    expect(view).toContain('@click="toggleSpeechLang(l)"');
    expect(view).toContain("speechLangs.value.includes(l) ? speechLangs.value.filter((x) => x !== l) : [...speechLangs.value, l]");
    // 性别与音色按语言各记一份（选中几种就出几行）
    expect(view).toMatch(/v-for="l in speechLangs"/);
    expect(view).toContain('HD_VOICES()[l][speechGender[l]]');
    expect(view).toContain("const speechGender = reactive<Record<Lang, VoiceGender>>({ zh: 'female', en: 'female', ar: 'female' })");
    expect(view).toMatch(/api\(\)\.tts\(\{[\s\S]*?gender: speechGender\[lang\]/);
    expect(view).toMatch(/if \(useNarration\.value\) for \(const l of LANGS\) if \(speech\.value\[l\]\) narration\[l\] = speech\.value\[l\]!\.path/);
  });
  it('视图：最后一步是多平台发布，复用短视频工作台那条发布工作流，不另起一套', () => {
    // 两条线都以发布收尾（步骤表在 shared.ts）
    const shared = read('shared.ts');
    expect(shared).toContain("? ['speech', 'video', 'publish']");
    expect(shared).toContain("['material', 'report', 'speech', 'video', 'publish']");
    // 复用而不是抄：同一个 builder、同一个固定工作流 ID、同一份平台清单
    expect(view).toContain("import { FIXED_VIDEO_PUBLISH_WORKFLOW_ID, buildVideoPublishWorkflow, setWorkflowAutoRun } from '../composables/workflowAutoRun';");
    expect(view).toContain("from '../composables/publishPlatforms'");
    expect(view).toContain('await api.saveWorkflow(buildVideoPublishWorkflow(input));');
    expect(view).toContain('setWorkflowAutoRun(FIXED_VIDEO_PUBLISH_WORKFLOW_ID, input);');
    // 回程信息要指回本工作台，否则工作流页的「返回」会把人带去短视频工作台
    expect(view).toContain("workflowSource: 'charity-content'");
    expect(view).toContain("returnPath: '/workbenches/charity-content'");
    // 平台传的是机器可读 ID 串，不是中文标签（踩过的 bug）
    expect(view).toContain('platforms: platformIdsParam(ids)');
    // 没成片就不给发布；没勾平台 / 没文案时按钮禁用
    expect(view).toContain('const publishableLangs = computed(() => LANGS.filter((l) => videos.value[l]));');
    // 两组平台都空才禁用（海外那组后来加的，见下一条用例）
    expect(view).toContain('(!publishPlatformIds.length && !overseasIds.length) || !publishCaption.trim()');
  });
  it('视图：国内与海外两组平台各走各的链路，海外回执如实显示', () => {
    // 海外直驱那套与广告工作台共用同一份实现，不是抄第二份
    expect(view).toContain("from '../composables/overseasPublish'");
    expect(view).toContain('publish: publishOverseas, cancel: cancelOverseas } = useOverseasPublish();');
    // google_ads 是买广告不是发内容，这条线用不上
    expect(view).toContain("overseasPlatforms().filter((p) => p.id !== 'google_ads')");
    // 两组可同时勾选：按钮算的是两组之和
    expect(view).toContain('publishPlatformIds.length + overseasIds.length');
    expect(view).toContain('(!publishPlatformIds.length && !overseasIds.length) || !publishCaption.trim()');
    // 先跑海外（要盯浏览器），再跳工作流 —— 否则页面会在人操作到一半时被切走
    const iOverseas = view.indexOf('await publishOverseas(');
    const iRoute = view.indexOf("await router.push({ path: '/workflow' })");
    expect(iOverseas).toBeGreaterThan(0);
    expect(iRoute).toBeGreaterThan(iOverseas);
    // handback（停在人工闸门）不能写成「已发布」，也不计进成功数
    expect(view).toContain("r.status === 'handback' ? i18nT('等你确认') : i18nT('已发布')");
    expect(view).toContain("r.state === 'done' && r.status !== 'handback'");
  });
  it('视图：按「停止」要连海外发布一起停，且停了之后不许再写成「发布完成」', () => {
    // 实拍反馈：第 5 步已显示「已停止 / 第 5 步失败」，Facebook 回执还一直「进行中」。
    // 发布这一步不在主进程流水线里（渲染层驱动浏览器 + 主进程跑 Meta 自动化），
    // 只 cancel 流水线是停不住它的。
    const iCancel = view.indexOf('async function cancelRun()');
    expect(iCancel).toBeGreaterThan(0);
    const body = view.slice(iCancel, iCancel + 700);
    expect(body).toContain('cancelOverseas();');
    // 停掉之后 runPublish 不能再把这一步盖回绿的
    expect(view).toContain("if (overseasRuns.value.some((r) => r.state === 'cancelled')) return;");
    // 回执要看得出是「已停止」，别混进失败里（失败要去查原因，停止不用）
    expect(view).toContain("if (r.state === 'cancelled') return i18nT('已停止');");
  });
  it('视图：历史成品里的成片能直接发布，且用那一次归档的档案配文案', () => {
    // 两类成片（AI 增强版 / 素材剪辑版）各挂一个发布入口，与预览分开（@click.stop 防误发）
    expect((view.match(/publishFromHistory\(r, l,/g) || []).length).toBe(2);
    expect(view).toMatch(/@click\.stop="publishFromHistory/);
    // 先验真再选中：归档目录可能被手工清过
    expect(view).toMatch(/async function publishFromHistory[\s\S]*?const r = await api\(\)\.fileUrl\(\{ path, kind: 'video' \}\);/);
    // 发布目标是「历史选中优先，否则本次成片」
    expect(view).toContain('if (publishPick.value) return publishPick.value;');
    expect(view).toContain('const target = publishTarget.value;');
    expect(view).toContain('videoPath: target.path,');
    // 文案用那一次的档案，不能拿当前界面上的活动名去配上一次的片子
    expect(view).toContain('const arc = publishPick.value?.archive || archive.value || undefined;');
    // 有退路回到本次成片
    expect(view).toContain('function clearPublishPick()');
    // 没有本次成片时也不再直接判死，提示里指向历史
    expect(view).toContain("先在上一步生成成片，或在下面的历史成品里点「发布」。");
  });
  it('视图：只有一份文稿，与文稿语言不同的目标先转译再合成；成品按语言累加', () => {
    // 每次点按钮都按文稿框当前的文字重算：旧译文属于上一份文稿，先全清再填
    expect(view).toContain("for (const l of LANGS) speechText[l] = ''; // 旧译文属于上一份文稿，不能留");
    expect(view).toContain('speechText[src] = body;');
    expect(view).toContain('const need = targets.filter((l) => l !== src);');
    expect(view).toMatch(/api\(\)\.translate\(\{ runId: runId\.value, text: body, targets: need \}\)/);
    // 转译失败的语言不合成，也不拿旧译文顶替
    expect(view).toContain('return targets.filter((l) => speechText[l].trim());');
    // 成品合并不覆盖
    expect(view).toContain('speech.value = { ...speech.value, ...r.items };');
    // 一键流程的三语摘要是现成的，不再过转译
    expect(view).toContain('if (!(await runSpeechAll(true))) return;');
  });
});
