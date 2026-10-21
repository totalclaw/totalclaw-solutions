/**
 * 慈善活动内容工场 · 字幕与旁白逐句对齐。
 *
 *   纯函数：三语切句 / 逐句时长累计成时间轴（停顿、片尾）/ 超长句拆屏 / ASS 与 SRT 时间格式 / 时间轴文件读写
 *   真实 ffmpeg：假 TTS（每句一段长短不一的正弦波 mp3）→ synthesizeSpeech 逐句合成拼接 → buildVideos 真合成，
 *   断言字幕条数 = 旁白句数、字幕原文 = 旁白原文、最后一条不晚于音频结束、成片不短于旁白（ffmpeg 缺席时 skip）
 */
import { describe, it, expect, afterAll } from 'vitest';
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import type { CharityArchive } from '@totalclaw/ipc-contracts';
import {
  NARRATION_PAUSE_SEC, NARRATION_TAIL_SEC, VIDEO_MIN_SEC, assTime, buildAss, buildSrt, displayCues, narrationTimeline,
  narrationTrackPath, narrationUnits, parseNarrationTrack, planTimeline, splitForDisplay, splitSentences, srtTime, videoDurationFor,
  CAPTION_LINE_CHARS, CAPTION_MAX_CHARS, wrapCaption,
} from './subtitles';
import { resolveFfmpegPair } from '../ffmpegPath';
import { buildVideos, readNarrationTrack, synthesizeSpeech, type PipelineDeps } from './pipeline';

describe('切句（每句 = 一次合成 = 一条字幕）', () => {
  it('中文按 。！？； 切，右引号跟着上一句，逗号不切', () => {
    expect(splitSentences('活动在利雅得举办，120 位朋友到场。大家说：“太好了！”下次再见？我们；继续', 'zh'))
      .toEqual(['活动在利雅得举办，120 位朋友到场。', '大家说：“太好了！”', '下次再见？', '我们；', '继续']);
  });
  it('英文按 . ! ? ; 切，小数 / 日期 / 千分位 / 缩写不切', () => {
    expect(splitSentences('On 2026-08-15, Dr. Ali raised SAR 85,000. Growth was 1.5x! Is it real? Yes; it is', 'en'))
      .toEqual(['On 2026-08-15, Dr. Ali raised SAR 85,000.', 'Growth was 1.5x!', 'Is it real?', 'Yes;', 'it is']);
  });
  it('阿语按 . ؟ ! ؛ 切，逗号 ، 不切', () => {
    expect(splitSentences('في الرياض، استضافت الجمعية الزيارة. هل كانت ناجحة؟ نعم؛ شكراً لكم', 'ar'))
      .toEqual(['في الرياض، استضافت الجمعية الزيارة.', 'هل كانت ناجحة؟', 'نعم؛', 'شكراً لكم']);
  });
  it('合成单元：短句一句一段；一屏放不下的长句在句内逗号处分组（各自合成、各自一条字幕），千分位不拆', () => {
    expect(narrationUnits('活动在利雅得举办。感谢每一位伙伴！', 'zh')).toEqual(['活动在利雅得举办。', '感谢每一位伙伴！']);
    expect(narrationUnits('2026年8月15日，我们在沙特阿拉伯·利雅得举办「从伙伴关系到影响力」，记录谢赫·穆罕默德·本·阿卜杜勒阿齐兹·拉吉希基金会的访问。下次见。', 'zh'))
      .toEqual(['2026年8月15日，', '我们在沙特阿拉伯·利雅得举办「从伙伴关系到影响力」，', '记录谢赫·穆罕默德·本·阿卜杜勒阿齐兹·拉吉希基金会的访问。', '下次见。']);
    const en = narrationUnits('On 2026-08-15 in Riyadh, Saudi Arabia, the Silk Road Civilizational Communication Association welcomed Sheikh Mohammed bin Abdulaziz Al Rajhi Endowments as a strategic partner. Together, with 120 participants and SAR 85,000 raised, we tracked the project.', 'en');
    expect(en[0]).toBe('On 2026-08-15 in Riyadh, Saudi Arabia,');
    expect(en.join(' ')).toContain('SAR 85,000 raised,');
    expect(en.every((u) => u.length <= CAPTION_MAX_CHARS.en || !/[,;:]\s/.test(u))).toBe(true); // 超长的只剩没有逗号可断的整段
  });
  it('换行也是句界；没有字母数字的碎片（序号）并进下一句；空文本返回空', () => {
    expect(splitSentences('第一行\n第二行。', 'zh')).toEqual(['第一行', '第二行。']);
    expect(splitSentences('1. First item. 2. Second item.', 'en')).toEqual(['1. First item.', '2. Second item.']);
    expect(splitSentences('   ', 'en')).toEqual([]);
  });
});

describe('时间轴（真实时长累计）', () => {
  it('第 i 句起点 = 前面各句时长 + 句间停顿，终点 = 起点 + 自身时长；总长含停顿不含片尾', () => {
    const { cues, totalSec } = narrationTimeline([{ text: 'a', durationSec: 2.4 }, { text: 'b', durationSec: 1.337 }, { text: 'c', durationSec: 3 }]);
    expect(NARRATION_PAUSE_SEC).toBe(0.25);
    expect(cues.map((c) => c.text)).toEqual(['a', 'b', 'c']);
    expect(cues[0]).toMatchObject({ start: 0, end: 2.4 });
    expect(cues[1].start).toBeCloseTo(2.65, 2);
    expect(cues[1].end).toBeCloseTo(3.98, 2); // 3.987 向下取整：字幕绝不晚于这句话
    expect(cues[2].start).toBeCloseTo(4.24, 2);
    expect(cues[2].end).toBeCloseTo(7.23, 2);
    expect(totalSec).toBeCloseTo(2.4 + 1.337 + 3 + 0.5, 3);
    for (let i = 1; i < cues.length; i += 1) expect(cues[i].start - cues[i - 1].end).toBeGreaterThanOrEqual(0.25 - 0.011);
  });
  it('成片时长 = 旁白 + 片尾留白（不设上限）；没有旁白 = 30s', () => {
    expect(videoDurationFor(7.237)).toBeCloseTo(7.237 + NARRATION_TAIL_SEC, 2);
    expect(videoDurationFor(92)).toBeCloseTo(93.5, 2);
    expect(videoDurationFor(0)).toBe(VIDEO_MIN_SEC);
  });
  it('超长句拆屏：只在它自己的语音区间内按字数比例分，整句起止不变、原文不丢', () => {
    const long = 'On 2026-08-15 in Riyadh, Saudi Arabia, the Silk Road Civilizational Communication Association welcomed Sheikh Mohammed bin Abdulaziz Al Rajhi Endowments as a strategic partner.';
    const parts = splitForDisplay(long, 'en');
    expect(parts.length).toBeGreaterThan(1);
    expect(parts.join(' ')).toBe(long);
    for (const p of parts) expect(p.length).toBeLessThanOrEqual(110);
    const shown = displayCues([{ start: 1, end: 13, text: long }, { start: 13.25, end: 14, text: 'Short.' }], 'en');
    expect(shown[0].start).toBe(1);
    expect(shown[parts.length - 1].end).toBe(13);
    expect(shown[parts.length]).toEqual({ start: 13.25, end: 14, text: 'Short.' });
    const zh = splitForDisplay('2026年8月15日，我们在沙特阿拉伯·利雅得举办「从伙伴关系到影响力」，记录谢赫·穆罕默德·本·阿卜杜勒阿齐兹·拉吉希基金会的访问。', 'zh');
    expect(zh.length).toBeGreaterThan(1);
    expect(zh[0].endsWith('，')).toBe(true); // 优先在句内标点处断
    expect(zh.join('')).toBe('2026年8月15日，我们在沙特阿拉伯·利雅得举办「从伙伴关系到影响力」，记录谢赫·穆罕默德·本·阿卜杜勒阿齐兹·拉吉希基金会的访问。');
    expect(splitForDisplay('تبرعات بلغت 85,000 ريال سعودي، وحوارات وزيارة ثقافية وجولة في LEAP تصنع أثرًا مستدامًا، ونبني جسوراً تصل إلى الإنسان في كل مكان.', 'ar').join(' ')).toContain('85,000');
  });
});

describe('字幕排版：预先换行、最多 2 行、不出画', () => {
  it('中文按字数换行（libass 不会给无空格的中文换行），标点不落行首、数字与英文单词不拆', () => {
    const w = wrapCaption('我们在沙特阿拉伯·利雅得举办「从伙伴关系到影响力」，', 'zh').split('\n');
    expect(w).toHaveLength(2);
    for (const line of w) expect(line.length).toBeLessThanOrEqual(CAPTION_LINE_CHARS.zh);
    for (const line of w) expect(/^[\p{P}]/u.test(line)).toBe(false);
    expect(w.join('')).toBe('我们在沙特阿拉伯·利雅得举办「从伙伴关系到影响力」，');
    expect(wrapCaption('120位朋友到场，汇聚SAR 85,000善款，', 'zh').split('\n').some((l) => l.includes('SAR 85,000'))).toBe(true);
    expect(wrapCaption('短句。', 'zh')).toBe('短句。');
  });
  it('中文按词边界换行，不在词中间断（「协会」「沙特阿拉伯」不拆），两行尽量均衡', () => {
    const w = wrapCaption('丝绸之路文明交流协会在沙特阿拉伯·利雅得举办', 'zh').split('\n');
    expect(w).toHaveLength(2);
    expect(w.join('')).toBe('丝绸之路文明交流协会在沙特阿拉伯·利雅得举办');
    expect(w[0].endsWith('协')).toBe(false);
    for (const word of ['协会', '沙特阿拉伯', '利雅得']) expect(w.some((line) => line.includes(word))).toBe(true);
    expect(Math.abs(w[0].length - w[1].length)).toBeLessThanOrEqual(6);
    // 词典外的译名（分词器拆成单字）不在中间断：按「·」分段
    const name = splitForDisplay('迎接战略伙伴谢赫·穆罕默德·本·阿卜杜勒阿齐兹·拉吉希基金会到访。', 'zh', 24);
    expect(name.join('')).toBe('迎接战略伙伴谢赫·穆罕默德·本·阿卜杜勒阿齐兹·拉吉希基金会到访。');
    expect(name.some((part) => part.includes('阿卜杜勒阿齐兹'))).toBe(true);
    expect(wrapCaption('迎接战略伙伴谢赫·穆罕默德·本·', 'zh').split('\n').some((l) => l.includes('谢赫'))).toBe(true);
    const seg = new Intl.Segmenter('zh', { granularity: 'word' });
    for (const text of ['记录谢赫·穆罕默德·本·阿卜杜勒阿齐兹·拉吉希基金会的访问。', '作为战略伙伴，双方一起跟踪「十亿指引」项目进展，', '迎接战略伙伴谢赫·穆罕默德·本·阿卜杜勒阿齐兹·拉吉希基金会到访。']) {
      const lines = wrapCaption(text, 'zh').split('\n');
      const bounds = new Set([...seg.segment(text)].map((x) => x.index));
      let at = 0;
      for (const line of lines.slice(0, -1)) { at += line.length; expect(bounds.has(at)).toBe(true); }
    }
  });
  it('英 / 阿按词换行，每行不超过上限；每条字幕上限 = 2 行', () => {
    const en = wrapCaption('Together, with 120 participants and SAR 85,000 raised,', 'en').split('\n');
    expect(en).toHaveLength(2);
    for (const line of en) expect(line.length).toBeLessThanOrEqual(CAPTION_LINE_CHARS.en);
    expect(en.join(' ')).toBe('Together, with 120 participants and SAR 85,000 raised,');
    const ar = wrapCaption('جمعية طريق الحرير للتواصل الحضاري تستضيف 120 مشاركًا،', 'ar').split('\n');
    expect(ar).toHaveLength(2);
    for (const line of ar) expect(line.length).toBeLessThanOrEqual(CAPTION_LINE_CHARS.ar);
    for (const l of ['zh', 'en', 'ar'] as const) expect(CAPTION_MAX_CHARS[l]).toBe(CAPTION_LINE_CHARS[l] * 2);
    for (const l of ['zh', 'en', 'ar'] as const) {
      const long = l === 'zh' ? '一'.repeat(70) : Array.from({ length: 30 }, (_, i) => `word${i}`).join(' ');
      for (const part of splitForDisplay(long, l)) expect(wrapCaption(part, l).split('\n').length).toBeLessThanOrEqual(2);
    }
  });
  it('ASS 里旁白字幕带预切好的换行 \\N', () => {
    const ass = buildAss([{ start: 0, end: 3, text: '我们在沙特阿拉伯·利雅得举办「从伙伴关系到影响力」，' }], 'zh', { width: 1080, height: 1920, fontName: 'PingFang SC' });
    expect(ass).toMatch(/Cap,,0,0,0,,\{\\fad\(240,240\)\}[^\n]+\\N[^\n]+/);
    expect(ass).toContain('WrapStyle: 0');
  });
});

describe('字幕文件', () => {
  it('ASS / SRT 时间格式', () => {
    expect(assTime(65.5)).toBe('0:01:05.50');
    expect(assTime(59.999)).toBe('0:01:00.00');
    expect(srtTime(3723.456)).toBe('01:02:03,456');
    const srt = buildSrt([{ start: 0, end: 2.4, text: '第一句。' }, { start: 2.65, end: 3.98, text: '第二句。' }]);
    expect(srt).toBe('1\n00:00:00,000 --> 00:00:02,400\n第一句。\n\n2\n00:00:02,650 --> 00:00:03,980\n第二句。\n');
  });
  it('ASS：旁白字幕与标题分两个样式两层，标题挂满成片；阿语用同一字体族', () => {
    const ass = buildAss([{ start: 0, end: 2.4, text: 'أ' }, { start: 2.65, end: 4, text: 'ب' }], 'ar', { width: 1080, height: 1920, fontName: 'Arial Unicode MS', title: 'ORG', durationSec: 5.5 });
    const dialogues = ass.split('\n').filter((l) => l.startsWith('Dialogue:'));
    expect(dialogues.filter((l) => l.includes(',Cap,'))).toHaveLength(2);
    expect(dialogues.filter((l) => l.includes(',Title,'))).toEqual(['Dialogue: 1,0:00:00.00,0:00:05.50,Title,,0,0,0,,ORG']);
    expect(ass).toContain('Dialogue: 0,0:00:02.65,0:00:04.00,Cap,,0,0,0,,{\\fad(240,240)}ب');
  });
  it('时间轴文件：路径与解析（损坏 / 空 → null）', () => {
    expect(narrationTrackPath('/o/speech-zh.mp3')).toBe('/o/speech-zh.cues.json');
    expect(parseNarrationTrack('{"version":1,"lang":"zh","pauseSec":0.25,"durationSec":3,"cues":[{"start":0,"end":1,"text":"一"}]}')?.cues).toHaveLength(1);
    expect(parseNarrationTrack('{"version":1,"cues":[]}')).toBeNull();
    expect(parseNarrationTrack('not json')).toBeNull();
  });
});

// ── 真实 ffmpeg：逐句合成 → 拼接 → 字幕烧录成片 ──

const RES_DIR = join(__dirname, '..', '..', '..', '..', '..', '..', 'resources');
const ff = resolveFfmpegPair(existsSync(RES_DIR) ? RES_DIR : null);
const ready = !!(ff.ffmpeg && ff.ffprobe);
const dirs: string[] = [];
afterAll(() => { for (const d of dirs) rmSync(d, { recursive: true, force: true }); });

const ARCHIVE: CharityArchive = {
  orgName: { zh: '丝绸之路文明交流协会', en: 'Silk Road Association', ar: 'جمعية طريق الحرير' }, eventName: { zh: '活动', en: 'Event', ar: 'فعالية' },
  date: '2026-08-15', location: { zh: '', en: '', ar: '' }, participants: 120, donation: '', organizer: { zh: '', en: '', ar: '' }, summary: { zh: '', en: '', ar: '' }, source: 'manual',
};

describe.skipIf(!ready)('真实 ffmpeg：字幕条数 = 旁白句数，最后一条不晚于音频结束', () => {
  it('三语各自逐句合成、各自时间轴、各自成片时长', async () => {
    const dir = mkdtempSync(join(tmpdir(), 'cc-narr-'));
    dirs.push(dir);
    const outDir = join(dir, 'out');
    mkdirSync(outDir, { recursive: true });
    const photo = join(dir, 'p.jpg');
    execFileSync(ff.ffmpeg!, ['-v', 'error', '-y', '-f', 'lavfi', '-i', 'color=c=0x336699:s=540x960', '-frames:v', '1', photo]);
    // 假 TTS：时长跟字数走（每句长短不一），同一句同一段音频
    let n = 0;
    const tts = {
      synthesize: async (req: { text: string }) => {
        n += 1;
        const f = join(dir, `tts-${n}.mp3`);
        const sec = Math.min(2.2, 0.5 + req.text.length * 0.03);
        execFileSync(ff.ffmpeg!, ['-v', 'error', '-y', '-f', 'lavfi', '-i', `sine=frequency=${300 + n * 40}:duration=${sec.toFixed(2)}`, '-c:a', 'libmp3lame', '-b:a', '64k', f]);
        return { ok: true, provider: 'fal' as const, degraded: false, voice: 'v', audioBase64: readFileSync(f).toString('base64') };
      },
      falAvailable: () => ({ ok: true }),
      resetCircuit: () => {},
    };
    const deps: PipelineDeps = {
      resourcesDir: RES_DIR,
      tools: { ffmpeg: ff.ffmpeg!, ffprobe: ff.ffprobe!, python: null, scriptsDir: join(dir, 'none'), env: process.env },
      fal: { run: null, tts, upload: null },
      vision: async () => '', text: async () => '', renderPdf: async () => {}, renderImage: async () => {}, imageDataUrl: () => '',
      progress: () => {}, log: { info: () => {}, warn: () => {} },
    };
    const text = {
      zh: '活动在利雅得举办。一百二十位朋友到场！感谢每一位伙伴。',
      en: 'The event took place in Riyadh. Thank you, partners!',
      ar: 'أقيمت الفعالية في الرياض. شكراً لكم؟',
    };
    const speech = await synthesizeSpeech(deps, text, outDir, { quality: 'hd' });
    const narration: Record<string, string> = {};
    for (const l of ['zh', 'en', 'ar'] as const) {
      expect(speech[l]?.quality).toBe('hd');
      narration[l] = speech[l]!.path;
      const probed = Number(execFileSync(ff.ffprobe!, ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', speech[l]!.path]).toString().trim());
      const track = readNarrationTrack(speech[l]!.path, probed)!;
      expect(track).not.toBeNull();
      expect(track.cues.map((c) => c.text)).toEqual(narrationUnits(text[l], l));
      expect(narrationUnits(text[l], l)).toEqual(splitSentences(text[l], l)); // 这几句都短：合成单元就是句子
      expect(track.cues[track.cues.length - 1].end).toBeLessThanOrEqual(probed);
      expect(probed - track.durationSec).toBeLessThan(0.15); // 拼接音频长度 = 逐句时长 + 停顿（mp3 编码只多几十毫秒）
    }

    const r = await buildVideos(deps, { items: [photo], mode: 'clip', langs: ['zh', 'en', 'ar'], archive: ARCHIVE, captions: { zh: ['报告短句'], en: ['slogan'], ar: ['شعار'] }, narration }, outDir);
    for (const l of ['zh', 'en', 'ar'] as const) {
      const audioSec = Number(execFileSync(ff.ffprobe!, ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', narration[l]]).toString().trim());
      const ass = readFileSync(join(outDir, '.work-video', `captions-${l}.ass`), 'utf8');
      const caps = ass.split('\n').filter((x) => x.startsWith('Dialogue:') && x.includes(',Cap,'));
      const sentences = narrationUnits(text[l], l);
      expect(caps).toHaveLength(sentences.length);
      expect(caps.map((x) => x.split('}').pop()!.replace(/\\N/g, l === 'zh' ? '' : ' '))).toEqual(sentences); // 字幕原文 = 旁白原文，不是报告短句
      const lastEnd = caps[caps.length - 1].split(',')[2];
      const [h, m, sec] = lastEnd.split(':');
      expect(Number(h) * 3600 + Number(m) * 60 + Number(sec)).toBeLessThanOrEqual(audioSec + 0.005);
      const srt = readFileSync(join(outDir, '.work-video', `captions-${l}.srt`), 'utf8');
      expect(srt.trim().split('\n\n')).toHaveLength(sentences.length);
      // 成片 = 该语言旁白 + 片尾留白：不截话，也不拖另一语言的长度
      expect(r.items[l]!.durationSec).toBeGreaterThanOrEqual(Math.floor(audioSec * 10) / 10);
      expect(r.items[l]!.durationSec).toBeLessThanOrEqual(Math.ceil((audioSec + NARRATION_TAIL_SEC + 0.2) * 10) / 10);
    }
  }, 180_000);
});

describe.skipIf(!ready)('fal 逐句失败不拖垮整段', () => {
  it('中间一句网络抖动：重试后接着用 fal，前面几句的高保真成果不作废', async () => {
    // 实测现场：阿语第 18 句一次 fetch failed，前 17 句合成好的高保真语音全被扔掉整段改 edge-tts，
    // 用户看到的就是「卡了很久最后还是备用音质」。瞬时失败必须先重试。
    const dir = mkdtempSync(join(tmpdir(), 'cc-tts-retry-'));
    dirs.push(dir);
    const outDir = join(dir, 'out');
    mkdirSync(outDir, { recursive: true });
    const clip = join(dir, 'unit.mp3');
    execFileSync(ff.ffmpeg!, ['-v', 'error', '-y', '-f', 'lavfi', '-i', 'sine=frequency=440:duration=0.6', '-c:a', 'libmp3lame', '-b:a', '64k', clip]);
    const audioBase64 = readFileSync(clip).toString('base64');

    const seen: string[] = [];
    let blown = false;
    const tts = {
      synthesize: async (req: { text: string }) => {
        seen.push(req.text);
        // 第 2 句第一次调用装成网络抖动（degradedReason='error' 才是可重试的那一类）
        if (req.text.startsWith('第二句') && !blown) {
          blown = true;
          return { ok: false, provider: 'none' as const, degraded: true, degradedReason: 'error' as const, error: 'fetch failed' };
        }
        return { ok: true, provider: 'fal' as const, degraded: false, voice: 'v', audioBase64 };
      },
      falAvailable: () => ({ ok: true }), resetCircuit: () => {},
    };
    const deps = {
      resourcesDir: RES_DIR,
      // python 为 null：一旦真的回落 edge-tts 就会抛「找不到 agent python」，等于把回退当失败暴露出来
      tools: { ffmpeg: ff.ffmpeg!, ffprobe: ff.ffprobe!, python: null, scriptsDir: join(dir, 'none'), env: process.env },
      fal: { run: null, tts, upload: null },
      vision: async () => '', text: async () => '', renderPdf: async () => {}, renderImage: async () => {}, imageDataUrl: () => '',
      progress: () => {}, log: { info: () => {}, warn: () => {} },
    } as unknown as PipelineDeps;

    const out = await synthesizeSpeech(deps, { zh: '第一句话。第二句话。第三句话。' }, outDir, { quality: 'hd' });
    expect(out.zh?.quality).toBe('hd'); // 仍是 fal，没被一句抖动打成 standard
    // 三句 + 第二句重试一次 = 四次调用，且多出来的那次就是失败那句。
    // 只比内容不比顺序：逐句合成是并发派发的，第三句会在第二句退避等待期间先跑掉。
    expect(seen).toHaveLength(4);
    expect([...seen].sort()).toEqual(['第一句话。', '第三句话。', '第二句话。', '第二句话。'].sort());
    expect(existsSync(out.zh!.path)).toBe(true);
    expect(readNarrationTrack(out.zh!.path, 99)?.cues).toHaveLength(3);
  }, 60_000);
});

describe('第 3 步女声 / 男声', () => {
  it('没指定音色时按所选性别交给 ttsRouter 取默认；指定了音色就用指定的', async () => {
    const dir = mkdtempSync(join(tmpdir(), 'cc-gender-'));
    dirs.push(dir);
    const reqs: Array<{ lang?: string; falVoice?: string; gender?: string }> = [];
    const male: Record<string, string> = { zh: 'Chinese (Mandarin)_Reliable_Executive', en: 'English_Trustworth_Man', ar: 'Arabic_FriendlyGuy' };
    const tts = {
      synthesize: async (req: { lang?: string; falVoice?: string; gender?: string }) => {
        reqs.push(req);
        return { ok: true, provider: 'fal' as const, degraded: false, voice: req.falVoice || (req.gender === 'male' ? male[req.lang!] : 'F'), audioBase64: Buffer.from('mp3').toString('base64') };
      },
      falAvailable: () => ({ ok: true }), resetCircuit: () => {},
    };
    const deps = {
      resourcesDir: dir, tools: null, fal: { run: null, tts, upload: null }, vision: async () => '', text: async () => '',
      renderPdf: async () => {}, renderImage: async () => {}, imageDataUrl: () => '', progress: () => {}, log: { info: () => {}, warn: () => {} },
    } as unknown as PipelineDeps;
    const out = await synthesizeSpeech(deps, { zh: '你好。', en: 'Hi.', ar: 'مرحبا.' }, join(dir, 'o'), { quality: 'hd', gender: 'male' });
    expect(reqs.map((r) => [r.lang, r.falVoice, r.gender])).toEqual([['zh', undefined, 'male'], ['en', undefined, 'male'], ['ar', undefined, 'male']]);
    expect(out.ar?.voice).toBe('Arabic_FriendlyGuy');
    expect(out.zh?.voice).toBe('Chinese (Mandarin)_Reliable_Executive');
    reqs.length = 0;
    await synthesizeSpeech(deps, { ar: 'مرحبا.' }, join(dir, 'o2'), { quality: 'hd', gender: 'male', voices: { ar: 'Deep_Voice_Man' } });
    expect(reqs[0]).toMatchObject({ falVoice: 'Deep_Voice_Man', gender: 'male' });
  });
});
