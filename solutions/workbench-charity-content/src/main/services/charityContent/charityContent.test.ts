/**
 * 慈善活动内容工场 · 纯函数层：档案规范化 / 报告解析与数字核对 / PDF-海报 HTML / 时间轴与字幕 / 预置映射 / 入参校验。
 */
import { describe, it, expect } from 'vitest';
import { mkdtempSync, rmSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import type { CharityArchive, CharityMediaDescription } from '@totalclaw/ipc-contracts';
import { archiveNumbers, extractJsonObject, normalizeArchive, normalizeDate, parseParticipants, toTri, isBlankTri } from './archive';
import { deterministicReport, findForeignNumbers, parseReport, parseReportContent, reportPrompt } from './reportText';
import { buildPosterHtml, buildReportHtml } from './reportHtml';
import { assTime, buildAss, planCaptions, planTimeline } from './subtitles';
import { copyPrebakedFiles, loadPrebaked, mapPrebakedDescriptions, prebakedComplete } from './prebaked';
import { readDemoPackManifest } from './demoPack';
import { requireAbs, requireCaptions, requireLangs, requireMode, requireOutDir, requirePaths, requirePrompt, requireRunId, requireTriText } from './validate';
import { detectCharityLang, listMaterialFiles, makeRunId, outDirFor, translateChunks, translateText, type PipelineDeps } from './pipeline';
import { prepareSubtitleFonts } from './media';

const ARCHIVE: CharityArchive = {
  orgName: { zh: '丝绸之路文明交流协会', en: 'Silk Road Association', ar: 'جمعية طريق الحرير' },
  eventName: { zh: '文明交流公益周', en: 'Charity Week', ar: 'أسبوع التواصل' },
  date: '2026-08-15',
  location: { zh: '利雅得', en: 'Riyadh', ar: 'الرياض' },
  participants: 120,
  donation: 'SAR 85,000',
  organizer: { zh: '协会', en: 'Association', ar: 'الجمعية' },
  summary: { zh: '一句话', en: 'One line', ar: 'جملة' },
  source: 'demo',
};

describe('archive', () => {
  it('toTri：字符串三语同文，缺语言用其它语言补', () => {
    expect(toTri('x')).toEqual({ zh: 'x', en: 'x', ar: 'x' });
    expect(toTri({ zh: '甲' })).toEqual({ zh: '甲', en: '甲', ar: '甲' });
    expect(toTri({ en: 'B' }, { zh: '备', en: '', ar: '' })).toEqual({ zh: '备', en: 'B', ar: '备' });
    expect(toTri({ en: 'B' })).toEqual({ zh: 'B', en: 'B', ar: 'B' });
    expect(isBlankTri(toTri({}))).toBe(true);
  });
  it('参与人数与日期只认得出的，认不出不猜', () => {
    expect(parseParticipants('约 120 人')).toBe(120);
    expect(parseParticipants(88.4)).toBe(88);
    expect(parseParticipants('很多')).toBeNull();
    expect(normalizeDate('2026年8月5日')).toBe('2026-08-05');
    expect(normalizeDate('2026/08/15')).toBe('2026-08-15');
    expect(normalizeDate('八月')).toBe('');
  });
  it('normalizeArchive：模型 JSON → 规范档案，缺字段用 base 补', () => {
    const a = normalizeArchive({ orgName: { zh: '机构' }, participants: 'null', donation: 12000 }, ARCHIVE, 'vlm');
    expect(a.orgName).toEqual({ zh: '机构', en: ARCHIVE.orgName.en, ar: ARCHIVE.orgName.ar });
    expect(a.participants).toBeNull();
    expect(a.donation).toBe('12000');
    expect(a.eventName).toEqual(ARCHIVE.eventName);
    expect(a.source).toBe('vlm');
  });
  it('extractJsonObject 容忍围栏与前后废话', () => {
    expect(extractJsonObject('好的：```json\n{"a":1}\n```')).toEqual({ a: 1 });
    expect(extractJsonObject('前言 {"a":{"b":2}} 后记')).toEqual({ a: { b: 2 } });
    expect(extractJsonObject('没有 json')).toBeNull();
  });
  it('archiveNumbers 收齐人数 / 善款 / 日期分量', () => {
    const n = archiveNumbers(ARCHIVE);
    expect(n.has('120')).toBe(true);
    expect(n.has('85000')).toBe(true);
    expect(n.has('2026')).toBe(true);
    expect(n.has('15')).toBe(true);
  });
});

describe('reportText', () => {
  const content = { title: 'T', overview: 'O', highlights: ['h1'], scene: 'S', thanks: 'Th', summary: 'Su', captions: ['c1'] };
  it('单语言解析：缺 title/overview 判废；三语解析缺一语判废', () => {
    expect(parseReportContent(JSON.stringify(content))?.title).toBe('T');
    expect(parseReportContent(JSON.stringify({ title: 'x' }))).toBeNull();
    expect(parseReport(JSON.stringify({ zh: content, en: content }))).toBeNull();
    expect(parseReport(JSON.stringify({ zh: content, en: content, ar: content }))?.ar.summary).toBe('Su');
  });
  it('数字核对：档案外的数字被抓出来，年份 / 1~9 序号放行', () => {
    const bad = { ...content, overview: '共有 300 人参与，筹得 85,000 里亚尔，2026 年第 3 期' };
    expect(findForeignNumbers(bad, ARCHIVE)).toEqual(['300']);
    const good = { ...content, overview: '120 位参与者，善款 SAR 85,000，2026-08-15' };
    expect(findForeignNumbers(good, ARCHIVE)).toEqual([]);
  });
  it('模板报告：三语齐全、数字只来自档案、字幕非空', () => {
    const desc: CharityMediaDescription[] = [{ path: '/a.jpg', kind: 'image', description: { zh: '现场', en: 'scene', ar: 'مشهد' } }];
    const r = deterministicReport(ARCHIVE, desc);
    for (const l of ['zh', 'en', 'ar'] as const) {
      expect(r[l].title).toContain(ARCHIVE.eventName[l]);
      expect(r[l].captions.length).toBeGreaterThan(2);
      expect(findForeignNumbers(r[l], ARCHIVE)).toEqual([]);
    }
    expect(r.zh.overview).toContain('120 位');
    const none = deterministicReport({ ...ARCHIVE, participants: null, donation: '' }, desc);
    expect(findForeignNumbers(none, { ...ARCHIVE, participants: null, donation: '' })).toEqual([]);
  });
  it('提示词带档案事实与画面描述，按语言切换', () => {
    const p = reportPrompt(ARCHIVE, [{ path: '/v.mp4', kind: 'video', description: { zh: '视频画面', en: 'clip', ar: 'مقطع' } }], 'ar');
    expect(p).toContain('الرياض');
    expect(p).toContain('مقطع');
    expect(p).toContain('绝不新增任何数字');
  });
});

describe('reportHtml', () => {
  const c = { title: 'تقرير', overview: 'نظرة', highlights: ['أ', 'ب'], scene: 'مشهد', thanks: 'شكر', summary: 's', captions: ['c'] };
  it('阿语报告整页 RTL + 阿语字体栈 + 转义', () => {
    const html = buildReportHtml('ar', ARCHIVE, { ...c, title: '<b>x</b>' }, { photos: ['data:image/jpeg;base64,AA'] });
    expect(html).toContain('<html lang="ar" dir="rtl">');
    expect(html).toContain('direction: rtl');
    expect(html).toContain('Noto Naskh Arabic');
    expect(html).toContain('border-right: 4px solid');
    expect(html).toContain('&lt;b&gt;x&lt;/b&gt;');
    expect(html).toContain('SAR 85,000');
    expect(html).toContain('<img src="data:image/jpeg;base64,AA"');
  });
  it('中文报告 LTR，人数带「人」；未披露字段显示未披露', () => {
    const html = buildReportHtml('zh', { ...ARCHIVE, participants: null, donation: '' }, { ...c, title: '报告' });
    expect(html).toContain('dir="ltr"');
    expect(html).toContain('未披露');
    expect(html).toContain('PingFang SC');
  });
  it('海报 1080×1920，背景照片与标题，阿语 RTL', () => {
    const html = buildPosterHtml('ar', ARCHIVE, c, { background: 'data:image/jpeg;base64,BB' });
    expect(html).toContain('width: 1080px; height: 1920px');
    expect(html).toContain('url("data:image/jpeg;base64,BB")');
    expect(html).toContain('dir="rtl"');
    expect(html).toContain(ARCHIVE.eventName.ar);
    expect(buildPosterHtml('en', ARCHIVE, c)).toContain('CHARITY EVENT');
  });
});

describe('subtitles / timeline', () => {
  it('时间轴：无旁白落在 30s，视频段偏长，视频从 1s 切入且不超自身长度', () => {
    const { segments, totalSec } = planTimeline([
      { path: '/a.jpg', kind: 'image' }, { path: '/b.mp4', kind: 'video', durationSec: 4 }, { path: '/c.jpg', kind: 'image' },
    ]);
    expect(totalSec).toBeCloseTo(30, 0);
    const v = segments.find((s) => s.kind === 'video')!;
    expect(v.offsetSec).toBe(0);
    expect(v.durationSec).toBeLessThanOrEqual(4);
    const long = planTimeline([{ path: '/b.mp4', kind: 'video', durationSec: 60 }, { path: '/a.jpg', kind: 'image' }], 42);
    expect(long.totalSec).toBeCloseTo(42, 0);
    expect(long.segments[0].offsetSec).toBe(1);
    expect(long.segments[0].durationSec).toBeGreaterThan(long.segments[1].durationSec);
  });
  it('时间轴：全是视频段（AI 镜头只有 5 秒）时差额分给长视频，总长仍是目标时长', () => {
    const shots = [1, 2, 3].map((i) => ({ path: `/shot-${i}.mp4`, kind: 'video' as const, durationSec: 5.18 }));
    const long = [{ path: '/a.mp4', kind: 'video' as const, durationSec: 36 }, { path: '/b.mp4', kind: 'video' as const, durationSec: 76 }, { path: '/c.mp4', kind: 'video' as const, durationSec: 25 }];
    const { segments, totalSec } = planTimeline([...shots, ...long], 42);
    expect(totalSec).toBeCloseTo(42, 0);
    for (const s of segments.slice(0, 3)) expect(s.durationSec).toBeLessThanOrEqual(5.18);
    for (const [i, s] of segments.slice(3).entries()) expect(s.durationSec + (s.offsetSec || 0)).toBeLessThanOrEqual(long[i].durationSec + 0.01);
  });
  it('时间轴没有上限（跟旁白走，不截话）；空素材返回空', () => {
    expect(planTimeline([], 10).segments).toEqual([]);
    expect(planTimeline([{ path: '/a.jpg', kind: 'image' }], 75).totalSec).toBeCloseTo(75, 1);
  });
  it('时间轴：素材全是短视频、旁白更长 → 从头循环素材补齐，零头并进最后一段', () => {
    const shots = [1, 2, 3].map((i) => ({ path: `/shot-${i}.mp4`, kind: 'video' as const, durationSec: 5.18 }));
    const { segments, totalSec } = planTimeline(shots, 38.4);
    expect(totalSec).toBeCloseTo(38.4, 1);
    expect(segments.length).toBeGreaterThan(3);
    expect(segments.slice(3).map((s) => s.src)).toEqual(segments.slice(3).map((_, i) => shots[i % 3].path));
    for (const s of segments.slice(0, -1)) expect(s.durationSec).toBeLessThanOrEqual(5.18 + 0.01);
  });
  it('字幕铺满全片、不重叠、结束不超总长', () => {
    const cues = planCaptions(['一', '二', '三', ''], 30);
    expect(cues).toHaveLength(3);
    expect(cues[0].start).toBeCloseTo(0.6, 1);
    for (let i = 1; i < cues.length; i += 1) expect(cues[i].start).toBeGreaterThanOrEqual(cues[i - 1].end);
    expect(cues[cues.length - 1].end).toBeLessThanOrEqual(30);
  });
  it('ASS：时间格式、字体、标题事件、大括号转义', () => {
    expect(assTime(65.5)).toBe('0:01:05.50');
    const ass = buildAss([{ start: 0.5, end: 3, text: 'a{b}' }], 'ar', { width: 1080, height: 1920, fontName: 'Arial Unicode MS', title: 'ORG' });
    expect(ass).toContain('PlayResX: 1080');
    expect(ass).toContain('Style: Cap,Arial Unicode MS');
    expect(ass).toContain('Title,,0,0,0,,ORG');
    expect(ass).toContain('a(b)');
    expect(ass).toContain('\\fad(240,240)');
  });
  it('字幕字体：按平台挑候选并拷进 fontsdir；没有候选时也返回目录', () => {
    const dir = mkdtempSync(join(tmpdir(), 'cc-fonts-'));
    try {
      const f = prepareSubtitleFonts(dir, 'linux', () => false);
      expect(existsSync(f.dir)).toBe(true);
      expect(f.nameFor.ar).toBe('sans-serif');
      const g = prepareSubtitleFonts(dir, 'win32', (p) => p.endsWith('msyh.ttc') || p.endsWith('tahomabd.ttf'));
      expect(g.nameFor.zh).toBe('Microsoft YaHei');
      expect(g.nameFor.ar).toBe('Tahoma');
    } finally { rmSync(dir, { recursive: true, force: true }); }
  });
});

describe('prebaked', () => {
  it('缺目录时各项为空；映射按类别顺序套到素材上', () => {
    const dir = mkdtempSync(join(tmpdir(), 'cc-pre-'));
    try {
      const empty = loadPrebaked(dir);
      expect(empty.archive).toBeNull();
      expect(prebakedComplete(empty)).toBe(false);
      const root = join(dir, 'bundled-solutions', 'charity-content');
      mkdirSync(join(root, 'prebaked'), { recursive: true });
      writeFileSync(join(root, 'demo-archive.json'), JSON.stringify(ARCHIVE));
      writeFileSync(join(root, 'prebaked', 'descriptions.json'), JSON.stringify([
        { kind: 'image', description: { zh: '图1', en: 'i1', ar: 'ص1' } },
        { kind: 'video', description: { zh: '视1', en: 'v1', ar: 'ف1' } },
      ]));
      for (const l of ['zh', 'en', 'ar']) writeFileSync(join(root, 'prebaked', `speech-${l}.mp3`), 'x');
      const set = loadPrebaked(dir);
      expect(set.archive?.source).toBe('demo');
      expect(set.speech.ar).toContain('speech-ar.mp3');
      const mapped = mapPrebakedDescriptions(set, [{ path: '/a.jpg', kind: 'image' }, { path: '/b.jpg', kind: 'image' }, { path: '/c.mp4', kind: 'video' }]);
      expect(mapped.map((m) => m.description.zh)).toEqual(['图1', '图1', '视1']);
      const out = join(dir, 'out');
      const copied = copyPrebakedFiles(set.speech, out);
      expect(existsSync(copied.zh!)).toBe(true);
      expect(copied.zh).toBe(join(out, 'speech-zh.mp3'));
    } finally { rmSync(dir, { recursive: true, force: true }); }
  });
  it('演示包清单三语齐全（成品本身改走 CDN，不进 Git）', () => {
    const res = join(__dirname, '..', '..', '..', '..', '..', '..', 'resources');
    /**
     * 预置成品 2026-09-21 起整个目录都不进 Git：
     *   · 先是 6 个 mp4 反复重拍累计约 428 MB（gitee 配额）；
     *   · 随后整套（报告 / 海报 / 语音 / 成片，106 MB）改走 CDN 按需下载。
     * 所以新 clone 的机器上 `loadPrebaked` 读到空是**正常**的，不该再让测试红。
     * Git 里留下的、也是真正要守住的，是那份带 sha256 的清单 —— 它决定了下载下来
     * 到底对不对、三语是不是齐的。
     */
    const manifest = readDemoPackManifest(res);
    expect(manifest, '随包清单必须在 Git 里').toBeTruthy();
    expect(manifest!.files.length).toBeGreaterThanOrEqual(3);
    expect(manifest!.files.every((f) => /^[0-9a-f]{64}$/.test(f.sha256)), '每个文件都要有 sha256').toBe(true);
    for (const l of ['zh', 'en', 'ar'] as const) {
      for (const kind of ['report', 'poster', 'speech'] as const) {
        expect(manifest!.files.some((f) => f.name.includes(kind) && f.name.includes(l)), `${kind} ${l}`).toBe(true);
      }
    }
    // 本机还留着那份成品时（出包机 / 开发机），仍然要求整套是完整的
    const set = loadPrebaked(res);
    if (set.descriptions.length) {
      expect(set.archive?.orgName.ar).toContain('طريق الحرير');
      for (const l of ['zh', 'en', 'ar'] as const) {
        expect(set.pdf[l], `pdf ${l}`).toBeTruthy();
        expect(set.poster[l], `poster ${l}`).toBeTruthy();
        expect(set.speech[l], `speech ${l}`).toBeTruthy();
      }
      if ((['zh', 'en', 'ar'] as const).every((l) => set.video[l])) expect(prebakedComplete(set)).toBe(true);
    }
  });
});

describe('validate / pipeline helpers', () => {
  it('入参校验：绝对路径、runId、outDir 形状、语言、模式、文本', () => {
    expect(() => requireAbs('rel/x', 'p')).toThrow();
    expect(requireAbs('/a/b', 'p')).toBe('/a/b');
    expect(() => requireRunId('bad')).toThrow();
    const run = makeRunId(new Date(2026, 7, 15, 9, 5, 7));
    expect(run).toBe('20260815-090507');
    expect(requireOutDir(outDirFor('/m', run), run)).toBe(join('/m', '输出', run));
    expect(() => requireOutDir('/m/other/' + run, run)).toThrow();
    expect(() => requireOutDir(outDirFor('/m', '20260101-000000'), run)).toThrow();
    expect(requirePaths(['/a', '/b'], 'x')).toEqual(['/a', '/b']);
    expect(() => requirePaths(['a'], 'x')).toThrow();
    expect(requireLangs(undefined)).toEqual(['zh', 'en', 'ar']);
    expect(requireLangs(['ar', 'ar', 'xx'])).toEqual(['ar']);
    expect(() => requireLangs(['xx'])).toThrow();
    expect(requireMode('ai')).toBe('ai');
    expect(() => requireMode('other')).toThrow();
    expect(requireTriText({ zh: ' 你好 ', en: '', ar: 'x' })).toEqual({ zh: '你好', ar: 'x' });
    expect(() => requireTriText({ zh: '' })).toThrow();
    expect(requireCaptions({ zh: ['a', '', 'b'], en: 'no' })).toEqual({ zh: ['a', 'b'] });
  });
  it('素材清单跳过输出目录与隐藏文件，并入额外文件去重', () => {
    const dir = mkdtempSync(join(tmpdir(), 'cc-mat-'));
    try {
      writeFileSync(join(dir, 'a.jpg'), 'x'); writeFileSync(join(dir, 'b.mp4'), 'x'); writeFileSync(join(dir, 'c.txt'), 'x'); writeFileSync(join(dir, '.hidden.jpg'), 'x');
      mkdirSync(join(dir, '输出', '20260101-000000'), { recursive: true }); writeFileSync(join(dir, '输出', '20260101-000000', 'video-zh.mp4'), 'x');
      const extra = join(dir, 'd.pdf'); writeFileSync(extra, 'x');
      const list = listMaterialFiles(dir, [extra, join(dir, 'a.jpg'), '/nope.jpg']);
      expect(list.map((p) => p.split('/').pop())).toEqual(['a.jpg', 'b.mp4', 'd.pdf']);
    } finally { rmSync(dir, { recursive: true, force: true }); }
  });
});

describe('提示词 / 朗读文本的入参校验（上限 8000）', () => {
  it('提示词：缺省 → 空（与不加提示词一致）；8000 字通过、8001 字拒绝；非文本拒绝', () => {
    expect(requirePrompt(undefined, 'P')).toBe('');
    expect(requirePrompt(null, 'P')).toBe('');
    expect(requirePrompt('  暖色调\r\n慢镜头  ', 'P')).toBe('暖色调\n慢镜头');
    expect(requirePrompt('字'.repeat(8000), 'P')).toHaveLength(8000);
    expect(() => requirePrompt('字'.repeat(8001), 'P')).toThrow(/8000/);
    expect(() => requirePrompt(42, 'P')).toThrow();
    expect(() => requirePrompt('a\0b', 'P')).toThrow();
  });
  it('朗读文本每种语言上限 8000', () => {
    expect(requireTriText({ zh: '字'.repeat(9000) }).zh).toHaveLength(8000);
  });
});

describe('朗读文本转译（目标语言多选：一份文稿配多语言的音）', () => {
  it('源语言判定：阿拉伯字母与汉字谁多算谁，都没有按英文；与渲染层同一套判据', () => {
    expect(detectCharityLang('活动在利雅得举办。')).toBe('zh');
    expect(detectCharityLang('The event took place in Riyadh.')).toBe('en');
    expect(detectCharityLang('أقيمت الفعالية في الرياض.')).toBe('ar');
    // 中文里夹几个英文单词仍算中文；阿语里夹数字仍算阿语
    expect(detectCharityLang('活动在 Riyadh 举办，120 people。')).toBe('zh');
    expect(detectCharityLang('أقيمت الفعالية 2026 في الرياض')).toBe('ar');
    expect(detectCharityLang('   ')).toBe('en');
  });
  it('切块：按整句攒到上限为止，不从句子中间断开；单句超长自成一块', () => {
    const chunks = translateChunks('第一句话。第二句话。第三句话。', 'zh', 12);
    expect(chunks.every((c) => /。$/.test(c))).toBe(true);
    expect(chunks.join('').replace(/ /g, '')).toBe('第一句话。第二句话。第三句话。');
    const long = `${'字'.repeat(40)}。`;
    expect(translateChunks(long, 'zh', 12)).toEqual([long]);
  });

  function depsWith(reply: (prompt: string) => string, calls: string[] = []): PipelineDeps {
    return {
      resourcesDir: '', tools: null, fal: { run: null, tts: null, upload: null },
      vision: async () => '',
      text: async (prompt: string) => { calls.push(prompt); return reply(prompt); },
      renderPdf: async () => {}, renderImage: async () => {}, imageDataUrl: () => '',
      progress: () => {}, log: { info: () => {}, warn: () => {} },
    } as unknown as PipelineDeps;
  }

  it('与源语言相同的那一种原样返回、不过模型；其余逐块转译后拼回', async () => {
    const calls: string[] = [];
    const deps = depsWith((p) => JSON.stringify({ text: p.includes('English') ? 'Translated.' : 'مترجم.' }), calls);
    const r = await translateText(deps, '活动在利雅得举办。', ['zh', 'en', 'ar']);
    expect(r.source).toBe('zh');
    expect(r.items.zh).toBe('活动在利雅得举办。'); // 原文，没被「中译中」改写
    expect(r.items.en).toBe('Translated.');
    expect(r.items.ar).toBe('مترجم.');
    expect(r.failed).toEqual([]);
    expect(calls).toHaveLength(2); // 只为 en / ar 各调一次，zh 不调
  });
  it('某一种语言译失败只记进 failed，不拖累其它语言', async () => {
    const deps = depsWith((p) => (p.includes('Arabic') ? 'ç”µ' : JSON.stringify({ text: 'Translated.' })));
    const r = await translateText(deps, '活动在利雅得举办。', ['en', 'ar']);
    expect(r.items.en).toBe('Translated.');
    expect(r.items.ar).toBeUndefined();
    expect(r.failed).toEqual(['ar']);
  });
  it('空文稿：不调模型，返回空清单', async () => {
    const calls: string[] = [];
    const r = await translateText(depsWith(() => '{}', calls), '   ', ['en']);
    expect(r.items).toEqual({});
    expect(calls).toHaveLength(0);
  });
});
