/**
 * 慈善工场两个提示词的合并规则（纯函数）：内容（讲什么）+ 视频（怎么拍）→ 镜头 / 配乐 prompt、剪辑节奏转场、片尾标语。
 */
import { describe, it, expect } from 'vitest';
import {
  BASE_SHOT_PROMPT, CHARITY_PROMPT_MAX, CHARITY_TEXT_MAX, FAL_PROMPT_LIMIT, composeMerged, needsCondense, DEFAULT_CONTENT_PROMPT, DEFAULT_VIDEO_PROMPT, SHOT_PROMPT_MAX, MUSIC_PROMPT_MAX,
  cleanPrompt, clampPhrases, clipStyleFromPrompt, dedupePhrases, endSloganFromPrompt, mergeShotPrompt, musicPrompt, promptPhrases,
} from './charityPrompts';

const LANGS = ['zh', 'en', 'ar'] as const;

describe('默认提示词', () => {
  it('三语各一份、非空、不超上限；内容讲主题 / 数字只用档案 / 致谢，视频讲色调 / 镜头 / 配乐 / 片尾', () => {
    for (const l of LANGS) {
      expect(DEFAULT_CONTENT_PROMPT[l].length).toBeGreaterThan(40);
      expect(DEFAULT_VIDEO_PROMPT[l].length).toBeGreaterThan(40);
      expect(DEFAULT_CONTENT_PROMPT[l].length).toBeLessThanOrEqual(CHARITY_PROMPT_MAX);
    }
    expect(DEFAULT_CONTENT_PROMPT.zh).toMatch(/主办.*合作机构/);
    expect(DEFAULT_CONTENT_PROMPT.zh).toContain('数字只用活动档案');
    expect(DEFAULT_VIDEO_PROMPT.zh).toMatch(/9:16.*温暖明亮.*推拉与横移.*特写.*渐强.*配乐.*片尾出现机构名与活动口号/);
    expect(DEFAULT_VIDEO_PROMPT.ar).toMatch(/9:16/);
  });
});

describe('合并规则', () => {
  it('两个都空 → 镜头 / 配乐 prompt 与没有提示词时一字不差，剪辑 normal + 直切，没有片尾', () => {
    const m = mergeShotPrompt('', '  ');
    expect(m.shot).toBe(BASE_SHOT_PROMPT);
    expect(m.music).toBe('warm cinematic background music for a charity event highlight video, soft piano and strings, no vocals');
    expect(m.contentPoints).toEqual([]);
    expect(clipStyleFromPrompt('')).toEqual({ pace: 'normal', transition: 'cut' });
    expect(endSloganFromPrompt('')).toEqual({ wanted: false, text: '' });
  });
  it('内容要点（去掉数字规则 / 语气 / 受众）+ 视觉风格（去掉总起头、配乐、片尾）+ 固定约束', () => {
    for (const l of LANGS) {
      const m = mergeShotPrompt(DEFAULT_CONTENT_PROMPT[l], DEFAULT_VIDEO_PROMPT[l]);
      expect(m.shot.startsWith('Subject: ')).toBe(true);
      expect(m.shot).toContain('Visual style: ');
      expect(m.shot).toMatch(/no text overlay, no subtitles\.$/);
      expect(m.shot.length).toBeLessThanOrEqual(SHOT_PROMPT_MAX);
      expect(m.contentPoints).toHaveLength(3);
      expect(m.stylePoints).toHaveLength(3);
      expect(m.shot).not.toMatch(/9:16|数字|善款|语气|numbers|Tone|أرقام|النبرة/); // 画幅已固定、写作规则与画面无关
      expect(m.shot).not.toMatch(/配乐|片尾|music|slogan|موسيقى|الختام/); // 配乐进配乐 prompt、片尾进片尾卡
      expect(m.music.length).toBeLessThanOrEqual(MUSIC_PROMPT_MAX);
    }
    const zh = mergeShotPrompt(DEFAULT_CONTENT_PROMPT.zh, DEFAULT_VIDEO_PROMPT.zh);
    expect(zh.stylePoints).toEqual(['温暖明亮的色调', '稳定缓慢的推拉与横移镜头', '人物与现场细节特写']);
    expect(zh.music).toContain('Style notes: 配乐温暖励志、不喧宾夺主');
  });
  it('只填一个：只有内容 → 风格用原默认镜头描述；只有视频 → 没有 Subject 段', () => {
    const onlyContent = mergeShotPrompt('突出孩子们领取书包的笑脸', '');
    expect(onlyContent.shot).toBe('Subject: 突出孩子们领取书包的笑脸. Visual style: gentle cinematic camera move, people at a community charity event, natural light, subtle motion. natural motion, no text overlay, no subtitles.');
    const onlyVideo = mergeShotPrompt('', '黑白纪录片质感；手持跟拍');
    expect(onlyVideo.shot).toBe('Visual style: 黑白纪录片质感; 手持跟拍. natural motion, no text overlay, no subtitles.');
  });
  it('去重：同一意思只留一次（包含关系留长的；视频里重复内容提示词的短语不再进风格）', () => {
    expect(dedupePhrases(['暖色调', '温暖的暖色调画面', '暖色调', 'Close-ups', 'close ups'])).toEqual(['温暖的暖色调画面', 'Close-ups']);
    const m = mergeShotPrompt('人物特写；志愿者分发物资', '人物特写；慢镜头');
    expect(m.stylePoints).toEqual(['慢镜头']);
    expect(m.shot.match(/人物特写/g)).toHaveLength(1);
  });
  it('长度受控：按短语装到上限，不截半句；单条超长才硬截', () => {
    expect(clampPhrases(['aaaa', 'bbbb', 'cccc'], 10)).toBe('aaaa; bbbb');
    expect(clampPhrases(['x'.repeat(50)], 10)).toBe('x'.repeat(10));
    const long = Array.from({ length: 80 }, (_, i) => `风格要点${i}`).join('；');
    const m = mergeShotPrompt(Array.from({ length: 80 }, (_, i) => `内容要点${i}`).join('；'), long);
    expect(m.shot.length).toBeLessThanOrEqual(SHOT_PROMPT_MAX);
    expect(m.shot).toMatch(/内容要点0; 内容要点1/);
    expect(m.shot).toMatch(/风格要点0; 风格要点1/);
    expect(cleanPrompt('x'.repeat(CHARITY_PROMPT_MAX + 50))).toHaveLength(CHARITY_PROMPT_MAX);
    expect(cleanPrompt(42)).toBe('');
  });
  it('短语切分：分号 / 句号 / 换行切，逗号不切；小数与 9:16 不切', () => {
    expect(promptPhrases('warm, bright tones; slow pans.\nclose-ups 1.5x')).toEqual(['warm, bright tones', 'slow pans', 'close-ups 1.5x']);
    expect(promptPhrases('色调温暖；镜头缓慢。结尾渐强')).toEqual(['色调温暖', '镜头缓慢', '结尾渐强']);
  });
  it('配乐 prompt：原默认描述 + 视频提示词里的配乐短语', () => {
    expect(musicPrompt('calm')).toBe('calm cinematic background music for a charity event highlight video, soft piano and strings, no vocals');
    expect(mergeShotPrompt('', '配乐用阿拉伯乌德琴；镜头缓慢', 'hopeful').music).toBe('hopeful cinematic background music for a charity event highlight video, soft piano and strings, no vocals. Style notes: 配乐用阿拉伯乌德琴');
  });
});

describe('剪辑节奏 / 转场与片尾', () => {
  it('节奏与转场按关键词（中 / 英 / 阿）；转场没写时舒缓 → 淡入淡出', () => {
    for (const l of LANGS) expect(clipStyleFromPrompt(DEFAULT_VIDEO_PROMPT[l])).toEqual({ pace: 'slow', transition: 'fade' });
    expect(clipStyleFromPrompt('快节奏，动感十足')).toEqual({ pace: 'fast', transition: 'cut' });
    expect(clipStyleFromPrompt('energetic montage with crossfade')).toEqual({ pace: 'fast', transition: 'fade' });
    expect(clipStyleFromPrompt('إيقاع سريع')).toEqual({ pace: 'fast', transition: 'cut' });
    expect(clipStyleFromPrompt('画面干净')).toEqual({ pace: 'normal', transition: 'cut' });
  });
  it('片尾：明写标语就用它；只提片尾 / 口号 → 需要片尾、文案用活动名；没提 → 不加', () => {
    expect(endSloganFromPrompt('镜头缓慢；片尾口号：让爱传递下去。')).toEqual({ wanted: true, text: '让爱传递下去' });
    expect(endSloganFromPrompt('slow pans; slogan: Together we give')).toEqual({ wanted: true, text: 'Together we give' });
    expect(endSloganFromPrompt('شعار: معًا نصنع الأثر')).toEqual({ wanted: true, text: 'معًا نصنع الأثر' });
    for (const l of LANGS) expect(endSloganFromPrompt(DEFAULT_VIDEO_PROMPT[l])).toEqual({ wanted: true, text: '' });
    expect(endSloganFromPrompt('暖色调；慢镜头')).toEqual({ wanted: false, text: '' });
  });
});

describe('长度上限（8000 字）与按 fal 模型截断', () => {
  it('提示词与朗读文本上限都是 8000；两段合计超过阈值才需要浓缩', () => {
    expect(CHARITY_PROMPT_MAX).toBe(8000);
    expect(CHARITY_TEXT_MAX).toBe(8000);
    expect(needsCondense(DEFAULT_CONTENT_PROMPT.zh, DEFAULT_VIDEO_PROMPT.zh)).toBe(false);
    expect(needsCondense('x'.repeat(8000), '')).toBe(true);
  });
  it('浓缩后的要点照样去重、按目标长度装、再按 fal 硬上限截断', () => {
    const many = Array.from({ length: 200 }, (_, i) => `要点${i}`.repeat(6));
    const m = composeMerged(many, many.map((x) => `风格${x}`), many.map((x) => `配乐${x}`));
    expect(m.shot.length).toBeLessThanOrEqual(Math.min(SHOT_PROMPT_MAX, FAL_PROMPT_LIMIT.i2v));
    expect(m.music.length).toBeLessThanOrEqual(Math.min(MUSIC_PROMPT_MAX, FAL_PROMPT_LIMIT.music));
    expect(composeMerged(['a  ', 'a'], [], []).contentPoints).toEqual(['a']);
  });
});
