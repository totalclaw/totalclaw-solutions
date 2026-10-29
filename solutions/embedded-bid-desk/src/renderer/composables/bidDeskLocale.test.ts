/**
 * AI 项目工作台本地化（useBidDeskLocale）的对抗性用例：
 * 界面语言不在 zh-CN / en-US / ar 三者之内时必须稳定落回中文，切语言要跟着 i18n 响应，
 * 阿文缺词条时回落中文而不是渲染 undefined。
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ref } from 'vue';

const holder = vi.hoisted(() => ({ locale: null as any }));

vi.mock('../i18n', async () => {
  const { ref: mkRef } = await import('vue');
  holder.locale = mkRef('zh-CN');
  return {
    i18n: { global: { locale: holder.locale } },
    t: (s: string) => s,
  };
});

import { useBidDeskLocale, type BidDeskMessageKey } from './bidDeskLocale';

describe('useBidDeskLocale', () => {
  beforeEach(() => { holder.locale.value = 'zh-CN'; });

  it.each([
    'fr', '', 'ZH-CN', 'zh', 'zh-TW', 'en', 'en-GB', 'ar-SA', 'AR', ' ar', 'ar ', '<script>', 'undefined', 'null',
  ])('未知 / 大小写不符的语言 %j → zh-CN，且不是 RTL', (value) => {
    holder.locale.value = value;
    const { locale, isRtl, bt } = useBidDeskLocale();
    expect(locale.value).toBe('zh-CN');
    expect(isRtl.value).toBe(false);
    expect(bt('title')).toBe('AI 项目工作台');
  });

  it('非字符串 locale（undefined / null / 数字 / 对象）也落回 zh-CN 不抛', () => {
    for (const v of [undefined, null, 0, 1, {}, [], ['zh']]) {
      holder.locale.value = v;
      const { locale, bt } = useBidDeskLocale();
      expect(locale.value).toBe('zh-CN');
      expect(typeof bt('title')).toBe('string');
    }
    // 单元素数组 String() 后等于其元素：['ar'] 会被当成 'ar'，这是 String() 语义，钉住以免误判为 bug
    holder.locale.value = ['ar'];
    expect(useBidDeskLocale().locale.value).toBe('ar');
  });

  it('en-US / ar 精确命中；ar 是 RTL', () => {
    holder.locale.value = 'en-US';
    let ctx = useBidDeskLocale();
    expect(ctx.locale.value).toBe('en-US');
    expect(ctx.isRtl.value).toBe(false);
    expect(ctx.bt('title')).not.toBe('AI 项目工作台');
    expect(ctx.bt('title')).toMatch(/[A-Za-z]/);

    holder.locale.value = 'ar';
    ctx = useBidDeskLocale();
    expect(ctx.locale.value).toBe('ar');
    expect(ctx.isRtl.value).toBe(true);
    expect(ctx.bt('title')).toMatch(/[؀-ۿ]/);
  });

  it('越南语 / 马来语界面用英文词表，不回落中文', () => {
    for (const lang of ['vi', 'ms']) {
      holder.locale.value = lang;
      const ctx = useBidDeskLocale();
      expect(ctx.locale.value).toBe('en-US');
      expect(ctx.isRtl.value).toBe(false);
      expect(ctx.bt('title')).not.toBe('AI 项目工作台');
      expect(ctx.bt('title')).toMatch(/[A-Za-z]/);
    }
  });

  it('同一个实例随 i18n 语言切换而响应，不需要重建', () => {
    const { locale, isRtl, bt } = useBidDeskLocale();
    expect(locale.value).toBe('zh-CN');
    holder.locale.value = 'ar';
    expect(locale.value).toBe('ar');
    expect(isRtl.value).toBe(true);
    expect(bt('approve')).toMatch(/[؀-ۿ]/);
    holder.locale.value = 'garbage';
    expect(locale.value).toBe('zh-CN');
    expect(isRtl.value).toBe(false);
  });

  it('中文词表的每一个 key 在三种语言下都能拿到非空字符串（缺词回落中文）', () => {
    holder.locale.value = 'zh-CN';
    const zh = useBidDeskLocale();
    const keys: BidDeskMessageKey[] = [
      'title', 'subtitle', 'newCase', 'customer', 'project', 'approve', 'rejectCase', 'workflow',
      'exportAll', 'exportSuccess', 'exportFailed', 'approvalBlocked', 'moreInformation', 'allocateBoq',
      'statusNew', 'statusApproved', 'decisionDraft', 'stageOutput', 'unitCost', 'customerUnitPrice',
    ];
    const zhValues = keys.map((k) => zh.bt(k));
    for (const v of zhValues) expect(typeof v === 'string' && v.length > 0).toBe(true);
    for (const lang of ['en-US', 'ar']) {
      holder.locale.value = lang;
      const ctx = useBidDeskLocale();
      for (const k of keys) {
        const v = ctx.bt(k);
        expect(typeof v).toBe('string');
        expect(v.length).toBeGreaterThan(0);
        expect(v).not.toMatch(/undefined|\[object/);
      }
    }
  });

  it('bt 不会把 key 当成模板插值执行（返回的是词表值而非 key 本身）', () => {
    holder.locale.value = 'en-US';
    const { bt } = useBidDeskLocale();
    expect(bt('customer')).not.toBe('customer');
    expect(bt('customer')).not.toContain('{');
  });

  it('响应式 ref 之外的调用（无组件上下文）也能工作', () => {
    const detached = ref('ar');
    holder.locale.value = detached.value;
    const { locale } = useBidDeskLocale();
    expect(locale.value).toBe('ar');
  });
});
