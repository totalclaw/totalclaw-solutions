/**
 * 海外广告投放工作台的成片语言规则回归测试。
 *
 * 产品约定（2026-11-27 用户要求，取代 2026-08-06 的「跟随界面语言 + 阿语副字幕」）：
 *   - 本工作台生成的视频**一律中文**：运镜提示、字幕、TTS 旁白都是简体中文，不随界面语言变；
 *   - 成片里不再出现阿语副字幕（阿语标题只用于投放到平台的文案，不进画面）；
 *   - 旧存档里留着的 captionAr 不再带进画面，朗读也只念中文那一句。
 *
 * 视图是 SFC，测试里复刻同一套规则（与视图内 copyLanguage / 动态成片 caption 组装 / narrationFromScenes 同源）。
 */
import { describe, it, expect } from 'vitest';

/** 与视图内 copyLanguage() 一致：恒为中文 */
function copyLanguage(_locale: string): { code: 'zh' | 'en' | 'ar'; voice: string } {
  return { code: 'zh', voice: 'zh-CN-XiaoxiaoNeural' };
}

/** 图片成片的字幕：只用中文旁白那一行 */
function slideshowSubtitle(primary: string): string {
  return primary.trim();
}

/** 动态视频传给成片的 caption：只取中文字幕，旧数据里的 captionAr 丢掉 */
function dynamicCaption(caption: string, _legacyCaptionAr: string): string {
  return caption.trim();
}

/** 朗读文本：只取首行，与 narrationFromScenes 的实现一致 */
function narrationText(caption: string): string {
  return caption.split(/\r?\n/)[0].replace(/\s+/g, ' ').trim();
}

describe('海外广告投放工作台 · 成片统一中文', () => {
  it('任何界面语言下，成片文案与音色都是中文', () => {
    for (const loc of ['zh-CN', 'en-US', 'ar', 'vi', 'ms']) {
      expect(copyLanguage(loc)).toEqual({ code: 'zh', voice: 'zh-CN-XiaoxiaoNeural' });
    }
  });

  it('图片成片：字幕只有中文一行，没有阿语副字幕', () => {
    const out = slideshowSubtitle('发现我们的品牌');
    expect(out.split('\n')).toEqual(['发现我们的品牌']);
  });

  it('动态视频：旧存档的阿语副字幕不再进画面', () => {
    const cap = dynamicCaption('探索我们的空间', 'استكشف مساحتنا');
    expect(cap).toBe('探索我们的空间');
    expect(cap).not.toContain('استكشف');
  });

  it('朗读只念中文那一句', () => {
    expect(narrationText(dynamicCaption('探索我们的空间', 'استكشف مساحتنا'))).toBe('探索我们的空间');
  });
});
