/**
 * 慈善活动内容工场 · 模型回复容错（对抗用例）。
 *
 * 验收现场：第 2 步第一张图的描述显示成原始 ```json{...}```——模型回的阿语串里有未转义的双引号
 * （`بعنوان "من الشراكة… إلى الأثر"`），严格 JSON.parse 失败后原文被塞进三语。
 * 这里把「写坏的 JSON」各种形态喂进去，断言：能救的救回来，救不回来标「未识别」用档案兜底，
 * 任何情况下界面拿到的描述里都不出现 JSON 骨架 / 代码围栏。
 */
import { describe, it, expect } from 'vitest';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import type { CharityArchive, CharityMediaDescription, CharityTri } from '@totalclaw/ipc-contracts';
import { extractJsonObject, extractStringFields, normalizeArchive, repairJsonText, stripImageLead } from './archive';
import { analyzeMaterials, parseDescribeReply, type PipelineDeps } from './pipeline';
import { describeFallback, deterministicReport, parseReportContent, reportPrompt } from './reportText';

const ARCHIVE: CharityArchive = {
  orgName: { zh: '丝绸之路文明交流协会', en: 'Silk Road Association', ar: 'جمعية طريق الحرير' },
  eventName: { zh: '从伙伴关系到影响力', en: 'From Partnership to Impact', ar: 'من الشراكة إلى الأثر' },
  date: '2026-08-15',
  location: { zh: '利雅得', en: 'Riyadh', ar: 'الرياض' },
  participants: 120,
  donation: '',
  organizer: { zh: '协会', en: 'Association', ar: 'الجمعية' },
  summary: { zh: '协会举办交流活动', en: 'An exchange event', ar: 'فعالية تواصل' },
  source: 'vlm',
};

/** 验收现场同款：阿语值里有未转义的英文双引号，外面还包着 ```json 围栏 */
const FIELD_BAD = '```json\n{\n  "zh": "宣传图：标题为「从伙伴关系到影响力」的论坛海报，蓝色背景。",\n  "en": "A forum poster titled \\"From Partnership to Impact\\" on a blue background.",\n  "ar": "ملصق منتدى بعنوان "من الشراكة… إلى الأثر" على خلفية زرقاء."\n}\n```';

function rawShown(t: CharityTri): boolean {
  return Object.values(t).some((v) => v.includes('```') || /^\s*[{[]/.test(v) || /"(?:zh|en|ar)"\s*:/.test(v));
}

describe('宽松 JSON 修复', () => {
  it('值里未转义的双引号（阿语 / 英文引用标题）能救回来，引号保留在文本里', () => {
    const obj = extractJsonObject(FIELD_BAD);
    expect(obj).not.toBeNull();
    expect(obj!.ar).toBe('ملصق منتدى بعنوان "من الشراكة… إلى الأثر" على خلفية زرقاء.');
    expect(obj!.en).toContain('"From Partnership to Impact"');
    const en = extractJsonObject('{"zh":"标题","en":"titled "Hope Week", held downtown","ar":"x"}');
    expect(en?.en).toBe('titled "Hope Week", held downtown');
  });
  it('引号紧贴结尾 / 紧贴逗号的边界', () => {
    expect(extractJsonObject('{"ar":"بعنوان "الأمل"","en":"ok"}')).toEqual({ ar: 'بعنوان "الأمل"', en: 'ok' });
    expect(extractJsonObject('{"zh":"a","en":"say "hi"","ar":"b"}')?.en).toBe('say "hi"');
  });
  it('尾逗号、字符串里的裸换行、前后废话都能容忍', () => {
    expect(extractJsonObject('好的，结果如下：\n{"zh":"甲","en":"B",}\n以上')).toEqual({ zh: '甲', en: 'B' });
    expect(extractJsonObject('{"zh":"第一行\n第二行","list":["a","b",],}')).toEqual({ zh: '第一行\n第二行', list: ['a', 'b'] });
  });
  it('只有开头围栏（结尾被截掉）也能找到 JSON', () => {
    expect(extractJsonObject('```json\n{"zh":"甲","en":"B","ar":"ج"}')).toEqual({ zh: '甲', en: 'B', ar: 'ج' });
  });
  it('截断的 JSON 不硬补：修复返回 null；按字段抽取只收完整收尾的值', () => {
    const cut = '```json\n{"zh":"志愿者在分发物资","en":"Volunteers hand out supplies","ar":"متطوعون يوزعون';
    expect(repairJsonText('{"zh":"志愿者","en":"Vol')).toBeNull();
    expect(extractJsonObject(cut)).toBeNull();
    expect(extractStringFields(cut, ['zh', 'en', 'ar'])).toEqual({ zh: '志愿者在分发物资', en: 'Volunteers hand out supplies' });
  });
  it('合法 JSON 行为不变（转义引号、嵌套对象）', () => {
    expect(extractJsonObject('{"a":"x \\"y\\" z","b":{"c":[1,2]}}')).toEqual({ a: 'x "y" z', b: { c: [1, 2] } });
    expect(extractJsonObject('没有 json')).toBeNull();
  });
});

describe('画面描述回复 → 三语描述', () => {
  it('验收现场同款（围栏 + 阿语未转义引号）：三语各归各位，不是原文', () => {
    const r = parseDescribeReply(FIELD_BAD, ARCHIVE)!;
    expect(r.unrecognized).toBeUndefined();
    expect(r.description.zh).toMatch(/^宣传图/);
    expect(r.description.en).toMatch(/^A forum poster/);
    expect(r.description.ar).toMatch(/^ملصق منتدى/);
    expect(rawShown(r.description)).toBe(false);
  });
  it('截断 JSON：已收尾的语言用上，缺的语言用档案兜底文字（同语言），不标未识别', () => {
    const r = parseDescribeReply('{"zh":"志愿者在分发物资","en":"Volunteers hand out supplies","ar":"متطوعون يوزعون', ARCHIVE)!;
    expect(r.unrecognized).toBeUndefined();
    expect(r.description.zh).toBe('志愿者在分发物资');
    expect(r.description.ar).toBe(describeFallback(ARCHIVE).ar);
    expect(rawShown(r.description)).toBe(false);
  });
  it('什么都救不回来：标「未识别」，整段用档案兜底，绝不显示原始 JSON', () => {
    for (const bad of ['```json\n{"zh": ', '{"description": {"text": "x"}}', '```json\n{ 模型说了一半 ```', '{"zh":"{\\"nested\\":1}"}']) {
      const r = parseDescribeReply(bad, ARCHIVE)!;
      expect(r.unrecognized, bad).toBe(true);
      expect(r.description).toEqual(describeFallback(ARCHIVE));
      expect(rawShown(r.description), bad).toBe(false);
    }
    expect(describeFallback(ARCHIVE).zh).toContain('从伙伴关系到影响力');
    expect(describeFallback(ARCHIVE).ar).toContain('من الشراكة إلى الأثر');
    expect(describeFallback().en).toBe('Event material');
  });
  it('纯文字回复照旧当描述；空回复记为读图失败', () => {
    expect(parseDescribeReply('志愿者在社区中心分发物资。', ARCHIVE)).toEqual({ description: { zh: '志愿者在社区中心分发物资。', en: '志愿者在社区中心分发物资。', ar: '志愿者在社区中心分发物资。' } });
    expect(parseDescribeReply('   ', ARCHIVE)).toBeNull();
  });
  it('analyzeMaterials：写坏的回复进结果时带 unrecognized，报告提示词与模板报告都不采用它', async () => {
    const dir = mkdtempSync(join(tmpdir(), 'cc-desc-'));
    try {
      const a = join(dir, 'a.jpg'); const b = join(dir, 'b.jpg');
      writeFileSync(a, 'x'); writeFileSync(b, 'x');
      const replies: Record<string, string> = { [a]: '```json\n{"zh": "一半', [b]: FIELD_BAD };
      const warns: string[] = [];
      const deps = {
        tools: null,
        vision: async (p: string) => replies[p],
        progress: () => undefined,
        log: { info: () => undefined, warn: (m: string) => { warns.push(m); } },
      } as unknown as PipelineDeps;
      const r = await analyzeMaterials(deps, [a, b], join(dir, '.work'), undefined, ARCHIVE);
      expect(r.failed).toBe(0);
      expect(r.descriptions.map((d) => !!d.unrecognized)).toEqual([true, false]);
      expect(r.descriptions.every((d) => !rawShown(d.description))).toBe(true);
      expect(warns.length).toBe(1);
      const prompt = reportPrompt(ARCHIVE, r.descriptions, 'zh');
      expect(prompt).not.toContain('活动素材');
      expect(prompt).toContain('宣传图');
      const onlyBad: CharityMediaDescription[] = [r.descriptions[0]];
      expect(deterministicReport(ARCHIVE, onlyBad).zh.scene).not.toContain('活动素材');
    } finally { rmSync(dir, { recursive: true, force: true }); }
  });
});

describe('简介以活动为主语（去掉看图口吻开头）', () => {
  it('三语常见开头都去掉；不是看图口吻的原样保留', () => {
    expect(stripImageLead('图片展示了一群志愿者在社区中心分发物资', 'zh')).toBe('一群志愿者在社区中心分发物资');
    expect(stripImageLead('这张照片显示的是协会举办的论坛', 'zh')).toBe('协会举办的论坛');
    expect(stripImageLead('画面中可以看到，志愿者正在布置会场', 'zh')).toBe('志愿者正在布置会场');
    expect(stripImageLead('The image shows volunteers handing out food.', 'en')).toBe('Volunteers handing out food.');
    expect(stripImageLead('In this photo, we see a forum on stage.', 'en')).toBe('A forum on stage.');
    expect(stripImageLead('تُظهر الصورة متطوعين يوزعون المساعدات', 'ar')).toBe('متطوعين يوزعون المساعدات');
    expect(stripImageLead('تظهر الصورة: ملصق المنتدى', 'ar')).toBe('ملصق المنتدى');
    expect(stripImageLead('في هذه الصورة، نرى متطوعين', 'ar')).toBe('متطوعين');
    expect(stripImageLead('协会在利雅得举办交流活动', 'zh')).toBe('协会在利雅得举办交流活动');
    expect(stripImageLead('Imagine a better future', 'en')).toBe('Imagine a better future');
  });
  it('normalizeArchive（视觉草案与报告入参都经过它）清洗简介；整句只剩看图口吻时回落活动名', () => {
    const a = normalizeArchive({
      eventName: ARCHIVE.eventName,
      summary: { zh: '图片展示了协会在利雅得举办的交流论坛', en: 'The image shows', ar: 'تُظهر الصورة منتدى للتواصل' },
    }, undefined, 'vlm');
    expect(a.summary.zh).toBe('协会在利雅得举办的交流论坛');
    expect(a.summary.en).toBe(ARCHIVE.eventName.en);
    expect(a.summary.ar).toBe('منتدى للتواصل');
  });
  it('报告的摘要与字幕（海报标语取首句字幕）也去掉看图开头', () => {
    const c = parseReportContent(JSON.stringify({ title: 'T', overview: 'The photo depicts a forum.', summary: 'The image shows a forum.', captions: ['The image shows hope', 'Thanks'] }), 'en')!;
    expect(c.summary).toBe('A forum.');
    expect(c.overview).toBe('A forum.');
    expect(c.captions[0]).toBe('Hope');
  });
});
