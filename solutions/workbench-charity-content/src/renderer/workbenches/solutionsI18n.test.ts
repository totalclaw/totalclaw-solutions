/**
 * 解决方案页多语言守卫：英文 / 阿语界面不许再冒中文。
 *
 * 用户反馈「解决方案中的 i18n，中文并没有完全替换掉」，实测残留分三类，这里各挡一类：
 *   ① 词典缺口 —— 方案目录、慈善活动内容工场、古兰经教学演示（含它们的主进程服务）里
 *      写进 $t / i18nT / i18nKey 的 key，en / ar 必须有译文且译文里没有汉字；
 *   ② 数据取错格 —— 三语对象固定取 .zh（活动名、历史标题），语言名写死「中文」；
 *   ③ 注册表卡片 —— 方案名称 / 分类 / 简介 / 详情在 en / ar 下逐条过一遍。
 * 生成物（PDF / 语音 / 视频）的内容语言与给模型的提示词不属于界面文案，不在这里查；
 * 古兰经模板生成内容另见 main/services/quranTeaching/quranTeaching.i18n.test.ts。
 */
import { afterEach, describe, expect, it } from 'vitest';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { containsHanText } from '@totalclaw/i18n';
import en from '@totalclaw/i18n/locales/en.json';
import ar from '@totalclaw/i18n/locales/ar.json';
import vi from '@totalclaw/i18n/locales/vi.json';
import ms from '@totalclaw/i18n/locales/ms.json';
import { i18n, contentLangLabel, pickContentLang, listSeparator } from '../i18n';
import { builtinWorkbenchDescriptors } from './registry';
import { stepMetas as charitySteps , lineMetas as charityLines} from './charity-content/shared';
import { stepMetas as quranSteps, dimLabel, typeLabel, classLabel, kindLabel, verdictLabel, difficultyLabel, tierLabel, studentBadge } from './quran-teaching/shared';

const SHELL = join(__dirname, '..', '..', '..');
const R = 'src/renderer';
const M = 'src/main';
const SURFACES = [
  `${R}/components/SolutionsPanel.vue`,
  `${R}/components/PageBackButton.vue`,
  `${R}/workbenches/registry.ts`,
  `${R}/views/CharityContentWorkbenchView.vue`,
  `${R}/workbenches/quran-teaching/QuranPlatform.vue`,
  `${R}/workbenches/charity-content`,
  `${R}/workbenches/quran-teaching`,
  `${M}/services/charityContent`,
  `${M}/services/quranTeaching`,
  `${M}/ipc/charityContent.ipc.ts`,
  `${M}/ipc/quranTeaching.ipc.ts`,
];
/** 只在中文界面分支里用到的语言名（主进程进度文案 zh 分支），译文保留「中文」是词典约定 */
const ZH_ONLY_KEYS = new Set(['中文']);

function* sourceFiles(p: string): Generator<string> {
  const abs = join(SHELL, p);
  if (statSync(abs).isDirectory()) {
    for (const e of readdirSync(abs)) yield* sourceFiles(`${p}/${e}`);
  } else if (/\.(ts|vue)$/.test(p) && !/\.test\.ts$/.test(p)) yield abs;
}

/** 源码里写死在 $t / i18nT / i18nKey 第一个参数上的字符串 key */
function literalKeys(src: string): string[] {
  const out: string[] = [];
  for (const m of src.matchAll(/(?<![\w.])(?:\$t|i18nT|i18nKey)\(\s*(['"])((?:\\.|(?!\1).)*)\1/g)) {
    out.push(m[2].replace(/\\(['"\\])/g, '$1').replace(/\\n/g, '\n'));
  }
  return out;
}

const dict = { en: en as Record<string, string>, ar: ar as Record<string, string>, vi: vi as Record<string, string>, ms: ms as Record<string, string> };

describe('① 解决方案页用到的 key 在 en / ar / vi / ms 都有非中文译文', () => {
  const problems: string[] = [];
  let checked = 0;
  for (const surface of SURFACES) {
    for (const file of sourceFiles(surface)) {
      for (const key of literalKeys(readFileSync(file, 'utf8'))) {
        if (!containsHanText(key) || ZH_ONLY_KEYS.has(key)) continue;
        checked += 1;
        for (const [loc, d] of Object.entries(dict)) {
          const v = d[key];
          if (!v) problems.push(`[缺译文 ${loc}] ${relative(SHELL, file)}: ${key}`);
          else if (containsHanText(v)) problems.push(`[译文含中文 ${loc}] ${relative(SHELL, file)}: ${key} → ${v}`);
        }
      }
    }
  }
  it(`扫描到的 key 全部可译（共 ${checked} 处）`, () => {
    expect(checked).toBeGreaterThan(300);
    expect(problems, problems.join('\n')).toEqual([]);
  });
});

describe.each(['en-US', 'ar', 'vi', 'ms'] as const)('② ③ 界面语言 = %s', (locale) => {
  const prev = i18n.global.locale.value;
  afterEach(() => { i18n.global.locale.value = prev; });
  const use = () => { i18n.global.locale.value = locale; };

  it('语言名按界面语言显示，不再写死「中文」', () => {
    use();
    for (const l of ['zh', 'en', 'ar'] as const) expect(containsHanText(contentLangLabel(l)), l).toBe(false);
    if (locale === 'en-US' || locale === 'ar') expect(contentLangLabel('zh')).toBe(locale === 'ar' ? 'الصينية' : 'Chinese');
    expect(containsHanText(listSeparator())).toBe(false);
  });

  it('三语对象取界面语言那一格（活动名、历史标题），那格空了才回落', () => {
    use();
    const tri = { zh: '从伙伴关系到影响力', en: 'From Partnership to Impact', ar: 'من الشراكة إلى الأثر' };
    expect(pickContentLang(tri)).toBe(locale === 'ar' ? tri.ar : tri.en);
    expect(pickContentLang({ zh: '只有中文', en: '', ar: '' })).toBe('只有中文');
  });

  it('方案目录卡片：名称 / 分类 / 简介 / 详情', () => {
    use();
    for (const d of builtinWorkbenchDescriptors()) {
      for (const f of ['name', 'category', 'description', 'detail'] as const) {
        expect(containsHanText(d[f] || ''), `${d.id}.${f} = ${d[f]}`).toBe(false);
      }
    }
  });

  it('「宣教」不译成基督教传教语境（missionary / التبشير），英文 Dawah、阿语 مواد الدعوة', () => {
    use();
    const qa = builtinWorkbenchDescriptors().find((d) => d.id === 'workbench-grounded-qa')!;
    const text = [qa.name, qa.category, qa.description, qa.detail].join('\n');
    expect(text).not.toMatch(/missionar|evangel|proselyt|تبشير|تنصير/i);
    if (locale === 'ar') expect(qa.description).toContain('مواد الدعوة');
    // 马来语本身就用 dakwah（马来西亚穆斯林语境的通行词）
    else if (locale === 'ms') expect(qa.description).toMatch(/dakwah/i);
    else expect(qa.description).toContain('Dawah');
    // 越南语 truyền giáo = 传教（基督教语境），不能用
    expect(text).not.toMatch(/truyền giáo/i);
  });

  it('两个工作台的步骤条与各类标签', () => {
    use();
    const labels = [
      // 慈善工场拆成两条制作线后，步骤集按线不同 —— 两条线都要扫到，别只测默认那条
      ...charitySteps('event').flatMap((m) => [m.title, m.hint]),
      ...charitySteps('article').flatMap((m) => [m.title, m.hint]),
      ...charityLines().flatMap((m) => [m.title, m.hint]),
      ...quranSteps().flatMap((m) => [m.title, m.hint]),
      ...(['memory', 'order', 'vocabulary', 'comprehension', 'concept'] as const).map(dimLabel),
      ...(['mcq', 'fill', 'order', 'match', 'concept'] as const).map(typeLabel),
      ...['memory', 'vocabulary', 'concept', 'order', 'question_type', 'coverage_gap'].map(classLabel),
      ...['vocab', 'concept_map', 'timeline', 'review', 'structure'].map(kindLabel),
      ...(['common', 'hint', 'individual'] as const).map(verdictLabel),
      ...([1, 2, 3] as const).flatMap((n) => [difficultyLabel(n), tierLabel(n)]),
    ];
    for (const s of labels) expect(containsHanText(s), s).toBe(false);
    // 英文步骤标题用标题式大小写（用户截图里的 understanding diagram / class / week 这类小写机翻）
    if (locale === 'en-US') for (const m of quranSteps()) expect(m.title[0], m.title).toMatch(/[A-Z0-9]/);
  });

  it('学生头像代号不再是「甲乙丙」', () => {
    use();
    const s = { id: 'stu-a', code: '甲', name: { zh: '学生甲', en: 'Student A', ar: 'الطالب أ' }, description: { zh: '', en: '', ar: '' }, traits: {} } as any;
    expect(studentBadge(s, locale === 'ar' ? 'ar' : 'en')).toBe(locale === 'ar' ? 'أ' : 'A');
  });
});
