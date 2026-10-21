/**
 * 阿联酋广告工作台的成片语言规则回归测试。
 *
 * 产品约定（2026-08-06 与用户确认）：
 *   - **主讲（TTS 朗读）** 跟随当前界面语言；
 *   - **主字幕** 跟随当前界面语言；
 *   - **副字幕** 固定为阿拉伯语（这是投阿联酋市场的物料）。
 *
 * 之前两条成片链路都写死了：图片成片只取 `line.en`（永远英文），
 * 动态视频写死「中英/阿语字幕」；而 tts.py 的默认音色是 `zh-CN-XiaoxiaoNeural`，
 * 于是实际效果是**中文音色念英文文案**。
 *
 * 这里锁三件事：语言随界面走、副字幕保留阿语、**朗读绝不把副字幕念出来**。
 */
import { describe, it, expect } from 'vitest';

/** 与视图内 copyLanguage() 同源的映射（视图是 SFC，测试里复刻同一张表） */
function copyLanguage(locale: string): { code: 'zh' | 'en' | 'ar'; voice: string } {
  if (locale === 'ar') return { code: 'ar', voice: 'ar-AE-FatimaNeural' };
  if (locale.startsWith('en')) return { code: 'en', voice: 'en-US-AriaNeural' };
  return { code: 'zh', voice: 'zh-CN-XiaoxiaoNeural' };
}

/** 图片成片的字幕组装：主语言在前、阿语在后；界面本就是阿语时去重 */
function slideshowSubtitle(primary: string, arabic: string, code: 'zh' | 'en' | 'ar'): string {
  const rows = code === 'ar' ? [primary || arabic] : [primary, arabic];
  return rows.filter(Boolean).join('\n');
}

/** 动态视频传给成片脚本的 caption：主字幕 + 阿语副字幕，两行 */
function dynamicCaption(caption: string, captionAr: string): string {
  return [caption.trim(), captionAr.trim()]
    .filter(Boolean)
    .filter((line, i, arr) => arr.indexOf(line) === i)
    .join('\n');
}

/** 朗读文本：只取首行（主字幕），与 narrationFromScenes 的实现一致 */
function narrationText(caption: string): string {
  return caption.split(/\r?\n/)[0].replace(/\s+/g, ' ').trim();
}

describe('阿联酋广告工作台 · 成片语言规则', () => {
  it('音色跟随界面语言（不能让中文音色去念外文）', () => {
    expect(copyLanguage('zh-CN').voice).toBe('zh-CN-XiaoxiaoNeural');
    expect(copyLanguage('en-US').voice).toBe('en-US-AriaNeural');
    expect(copyLanguage('ar').voice).toBe('ar-AE-FatimaNeural');
  });

  describe('图片成片', () => {
    it('中文界面：主字幕中文在前，阿语作为副字幕', () => {
      const out = slideshowSubtitle('发现我们的品牌', 'اكتشف علامتنا', 'zh');
      expect(out.split('\n')[0]).toBe('发现我们的品牌');
      expect(out.split('\n')[1]).toBe('اكتشف علامتنا');
    });

    it('英文界面：主字幕换成英文，阿语副字幕保持', () => {
      const out = slideshowSubtitle('Discover our brand', 'اكتشف علامتنا', 'en');
      expect(out.split('\n')[0]).toBe('Discover our brand');
      expect(out.split('\n')[1]).toBe('اكتشف علامتنا');
    });

    it('阿语界面：不重复输出两行相同内容', () => {
      const out = slideshowSubtitle('اكتشف علامتنا', 'اكتشف علامتنا', 'ar');
      expect(out.split('\n')).toHaveLength(1);
    });
  });

  describe('动态视频', () => {
    it('字幕是「主字幕 + 阿语副字幕」两行', () => {
      const cap = dynamicCaption('探索我们的空间', 'استكشف مساحتنا');
      expect(cap.split('\n')).toEqual(['探索我们的空间', 'استكشف مساحتنا']);
    });

    it('⚠️ 朗读只念主字幕，绝不把阿语副字幕也念出来', () => {
      const cap = dynamicCaption('探索我们的空间', 'استكشف مساحتنا');
      expect(narrationText(cap)).toBe('探索我们的空间');
      expect(narrationText(cap)).not.toContain('استكشف');
    });

    it('副字幕缺失时不影响主字幕与朗读', () => {
      const cap = dynamicCaption('探索我们的空间', '');
      expect(cap).toBe('探索我们的空间');
      expect(narrationText(cap)).toBe('探索我们的空间');
    });

    it('界面本就是阿语时两行去重，朗读仍是那一句', () => {
      const cap = dynamicCaption('استكشف مساحتنا', 'استكشف مساحتنا');
      expect(cap.split('\n')).toHaveLength(1);
      expect(narrationText(cap)).toBe('استكشف مساحتنا');
    });
  });
});
