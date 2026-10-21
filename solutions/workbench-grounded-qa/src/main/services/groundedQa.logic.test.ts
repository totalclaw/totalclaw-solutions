import { describe, it, expect } from 'vitest';
import {
  decide, isForbidden, search, buildPrompt, tokenize, compilePatterns,
  detectLang, buildRewritePrompt, parseRewrite, parseAnswer, cleanPageText, mergeParsedPages,
  MIN_EVIDENCE_SCORE, type GroundedPage,
} from './groundedQa.logic';

/**
 * 宗教内容助手的边界测试。
 *
 * 这不是普通的功能测试 —— 这里每一条失败都意味着「助手可能对宗教问题
 * 给出未经授权的裁决」。模型完全有能力基于入门材料推断出一个听起来很像
 * 那么回事的教法答案，那比拒答危险得多。所以边界必须是代码，且必须被钉死。
 */
const pages: GroundedPage[] = [
  { docId: 'd1', docTitle: '伊斯兰入门', page: 5,
    text: '伊斯兰五功包括念功、礼拜、天课、斋戒和朝觐。念功是作证词，礼拜每日五次。' },
  { docId: 'd1', docTitle: '伊斯兰入门', page: 12,
    text: '小净的步骤依次为洗手、漱口、呛鼻、洗脸、洗手臂、抹头、洗脚。大净在特定情况下必须进行。' },
  { docId: 'd2', docTitle: 'Grounded Training', page: 8,
    text: 'The foundations of grounded include wisdom, good counsel and respectful dialogue with others.' },
];

describe('禁区：这些问题无论资料里有没有都不许答', () => {
  const cases: [string, string][] = [
    ['教法裁决', '按照教法，这种情况的裁决是什么？'],
    ['法特瓦', '请给我一个 fatwa'],
    ['清真判定', '这个食物算不算哈拉目？'],
    ['派别争议', '逊尼和什叶哪个才是正确的？'],
    ['政治议题', '穆斯林应该支持哪个政权？'],
    ['极端内容', '什么情况下可以发动圣战？'],
    ['个人处境', '我想离婚该不该这么做？'],
  ];
  for (const [name, q] of cases) {
    it(`拦住「${name}」`, () => {
      expect(isForbidden(q), q).toBe(true);
      const d = decide(pages, q);
      expect(d.allowed).toBe(false);
      expect(d.reason).toBe('out_of_scope');
      expect(d.message).toBeTruthy();
    });
  }

  it('禁区判定发生在检索之前 —— 资料里就算有也不答', () => {
    const withFatwa: GroundedPage[] = [
      ...pages,
      { docId: 'd9', docTitle: '某资料', page: 1, text: '教法裁决相关内容教法裁决相关内容' },
    ];
    const d = decide(withFatwa, '这个教法裁决怎么说？');
    expect(d.allowed).toBe(false);
    expect(d.reason).toBe('out_of_scope');
    expect(d.hits).toEqual([]);          // 压根没去检索
  });
});

describe('证据不足必须拒答，绝不让模型凭印象补', () => {
  it('资料里查不到就拒答，并给出可执行的下一步', () => {
    const d = decide(pages, '请问本机构 2026 年的预算是多少？');
    expect(d.allowed).toBe(false);
    expect(d.reason).toBe('no_evidence');
    expect(d.message).toContain('待确认');
  });

  it('只蹭到一两个词不算证据', () => {
    const d = decide(pages, '伊斯兰的量子力学解释是什么？');
    expect(d.allowed).toBe(false);
  });

  it('有充分原文支撑才放行', () => {
    const d = decide(pages, '伊斯兰五功包括哪些？');
    expect(d.allowed).toBe(true);
    expect(d.hits.length).toBeGreaterThan(0);
    expect(d.hits[0].score).toBeGreaterThanOrEqual(MIN_EVIDENCE_SCORE);
  });
});

describe('权限边界', () => {
  it('无权限直接拒答，优先级高于一切', () => {
    const d = decide(pages, '伊斯兰五功包括哪些？', { canRead: false });
    expect(d.allowed).toBe(false);
    expect(d.reason).toBe('restricted');
    expect(d.hits).toEqual([]);
  });
});

describe('引用必须可核对', () => {
  it('每条命中都带文档名与原始页码', () => {
    const hits = search(pages, '小净的步骤');
    expect(hits.length).toBeGreaterThan(0);
    for (const h of hits) {
      expect(h.docTitle).toBeTruthy();
      expect(h.page).toBeGreaterThan(0);
      expect(h.snippet.length).toBeGreaterThan(0);
    }
  });

  it('片段取自原文，不是生成的', () => {
    const hits = search(pages, '小净的步骤');
    const src = pages.find((p) => p.page === hits[0].page)!.text.replace(/\s+/g, ' ');
    expect(src).toContain(hits[0].snippet.slice(0, 20));
  });

  it('中英文都能检索到（材料本身中英混排）', () => {
    expect(search(pages, 'foundations of grounded').length).toBeGreaterThan(0);
    expect(search(pages, '礼拜每日五次').length).toBeGreaterThan(0);
  });
});

describe('提示词把模型锁死在原文里', () => {
  const hits = search(pages, '伊斯兰五功包括哪些？');
  const p = buildPrompt('伊斯兰五功包括哪些？', hits, 'zh');

  it('明确禁止补充资料之外的内容与教法裁决', () => {
    expect(p).toContain('只能');
    expect(p).toContain('不得给出教法裁决');
    expect(p).toContain('不得推测');
  });

  it('只要答案：不许开场白、不许说资料缺什么，来源由末行编号报出', () => {
    expect(p).toContain('不要开场白');
    expect(p).toContain('不要说明资料缺少什么');
    expect(p).toContain('SOURCES:');
    expect(p).toContain('NO_ANSWER');
  });

  it('把原文和页码都带进去了', () => {
    expect(p).toContain('伊斯兰入门');
    expect(p).toMatch(/第 \d+ 页/);
  });

  it('三种回答语言各生成不同的语言指令', () => {
    const zh = buildPrompt('q', hits, 'zh');
    const en = buildPrompt('q', hits, 'en');
    const ar = buildPrompt('q', hits, 'ar');
    // 不断言具体字面量 —— 文案走词典，英文演示时整份提示词都会是英文。
    // 真正要保证的是：三种语言产出三份不同的指令，没有漏传 lang 参数。
    expect(new Set([zh, en, ar]).size).toBe(3);
  });
});

describe('分词', () => {
  it('中文出二元组，英文出词', () => {
    const t = tokenize('礼拜 grounded');
    expect(t).toContain('礼拜');
    expect(t).toContain('grounded');
  });
});

/**
 * 平台化：禁区表、拒答话术、证据阈值都来自角色配置（role.grounding），
 * 不再写死宗教场景。医疗、法务、合规各配各的，同一套引擎。
 */
describe('按角色配置生效，不绑行业', () => {
  const medPages: GroundedPage[] = [
    { docId: 'm1', docTitle: '用药手册', page: 3,
      text: '布洛芬为非甾体抗炎药，常用于缓解轻中度疼痛，成人单次剂量不超过说明书标注。' },
  ];

  it('角色自带禁区表生效（医疗场景拦「诊断/处方」）', () => {
    const forbidden = compilePatterns(['确诊|诊断一下|开(个)?处方|该吃多少药']);
    expect(forbidden).toBeTruthy();
    const d = decide(medPages, '你帮我诊断一下这是什么病', { canRead: true, forbidden });
    expect(d.allowed).toBe(false);
    expect(d.reason).toBe('out_of_scope');
    expect(d.hits).toEqual([]);   // 禁区仍先于检索
  });

  it('同一句话换一套禁区表就不再是禁区（说明判据真的来自配置）', () => {
    const q = '你帮我诊断一下这是什么病';
    const withMed = decide(medPages, q, { canRead: true, forbidden: compilePatterns(['诊断一下']) });
    const withOther = decide(medPages, q, { canRead: true, forbidden: compilePatterns(['与本句无关的词']) });
    expect(withMed.reason).toBe('out_of_scope');
    expect(withOther.reason).not.toBe('out_of_scope');
  });

  it('自定义拒答话术覆盖默认文案', () => {
    const msg = '本助手不提供诊疗意见，请联系值班医师。';
    const d = decide(medPages, '帮我开个处方', {
      canRead: true, forbidden: compilePatterns(['开个处方']), refusalMessage: msg,
    });
    expect(d.message).toBe(msg);
  });

  it('自定义证据阈值生效：调高之后原本能答的也拒答', () => {
    const q = '布洛芬是什么药？';
    expect(decide(medPages, q, { canRead: true }).allowed).toBe(true);
    expect(decide(medPages, q, { canRead: true, minScore: 99 }).allowed).toBe(false);
  });

  it('非法正则不会让助手整个不可用，跳过坏条目继续跑', () => {
    const p = compilePatterns(['(((((无法编译', '可以编译']);
    expect(p?.length).toBe(1);
    expect(isForbidden('可以编译的句子', p)).toBe(true);
  });

  it('禁区表为空数组时回落默认表，不是「什么都不拦」', () => {
    expect(compilePatterns([])).toBeUndefined();
    expect(isForbidden('这个算不算哈拉目？', compilePatterns([]))).toBe(true);
  });
});

describe('多轮与语言：回答跟着提问语言走', () => {
  it('按主语言识别，夹杂的术语不改变判断', () => {
    expect(detectLang('什么是五功？')).toBe('zh');
    expect(detectLang('What is dawah?')).toBe('en');
    expect(detectLang('ما هي أركان الإسلام الخمسة؟')).toBe('ar');
    // 中文句子夹英文术语仍是中文；英文句子夹一个阿语词仍是英文
    expect(detectLang('dawah 在中文里是什么意思？')).toBe('zh');
    expect(detectLang('What does the word شهادة mean in English?')).toBe('en');
  });

  it('识别不出任何文字时返回 null，由调用方沿用上一轮', () => {
    expect(detectLang('？？ 123')).toBeNull();
    expect(detectLang('')).toBeNull();
  });

  it('改写结果容忍代码块和前后说明，只取中英两条', () => {
    const raw = '好的：\n```json\n{"zh":"小净的具体步骤是什么？","en":"What are the steps of wudu?","keywords":["小净","wudu",""]}\n```';
    expect(parseRewrite(raw)).toEqual({
      queries: ['小净的具体步骤是什么？', 'What are the steps of wudu?'],
      keywords: ['小净', 'wudu'],
    });
  });

  it('改写输出不是 JSON / 字段为空时返回空数组，而不是把整段废话拿去检索', () => {
    const empty = { queries: [], keywords: [] };
    expect(parseRewrite('抱歉，我无法改写')).toEqual(empty);
    expect(parseRewrite('{"zh": "", "en": 3}')).toEqual(empty);
    expect(parseRewrite('{broken')).toEqual(empty);
  });

  it('改写提示词带上历史与最新问题，且声明只改写不回答', () => {
    const p = buildRewritePrompt('那具体怎么做？', [{ question: '小净是什么？', answer: '小净是……' }]);
    expect(p).toContain('小净是什么？');
    expect(p).toContain('那具体怎么做？');
    expect(p).toContain('不回答问题');
  });

  it('作答提示词：历史只作指代参考，引用的仍只有本轮原文', () => {
    const hits = search(pages, '小净的步骤');
    const p = buildPrompt('那具体怎么做？', hits, 'zh',
      [{ question: '小净是什么？', answer: '旧回答' }], '小净的具体步骤是什么？');
    expect(p).toContain('不能作为回答依据');
    expect(p).toContain('旧回答');
    expect(p).toContain('小净的具体步骤是什么？');
    expect(p).toContain('第 12 页');
  });

  it('被拒答的历史轮次在提示词里标成已拒答，不留空让模型脑补', () => {
    const p = buildPrompt('还有呢？', search(pages, '小净的步骤'), 'zh', [{ question: '今晚该不该离婚？' }]);
    expect(p).toContain('（已拒答）');
  });
});

describe('回答只留答案与来源', () => {
  it('拆出末行 SOURCES，编号换成下标，正文不带这一行', () => {
    const r = parseAnswer('1. 简述拜功的重要性\n2. 练习做小净和礼拜\nSOURCES: 3, 1', 3);
    expect(r).toEqual({ noAnswer: false, text: '1. 简述拜功的重要性\n2. 练习做小净和礼拜', used: [0, 2] });
  });

  it('没报来源或编号越界时列出全部命中，不能一条来源都不给', () => {
    expect(parseAnswer('答案正文', 2).used).toEqual([0, 1]);
    expect(parseAnswer('答案正文\nSOURCES: 9', 2).used).toEqual([0, 1]);
  });

  it('模型输出 NO_ANSWER → 转拒答，不把它的解释展示出去', () => {
    expect(parseAnswer('NO_ANSWER', 3).noAnswer).toBe(true);
    expect(parseAnswer('NO_ANSWER\nSOURCES: ', 3).noAnswer).toBe(true);
  });

  it('剥掉 Markdown 加粗与标题符号', () => {
    expect(parseAnswer('## 学习要求\n**一、** 礼拜', 1).text).toBe('学习要求\n一、 礼拜');
  });
});

describe('解析文本清洗', () => {
  it('收掉粗体描边造成的叠字，正常叠词不动', () => {
    expect(cleanPageText('相相信信有有后后世世吗吗？？')).toBe('相信有后世吗？');
    expect(cleanPageText('谢谢你，天天向上')).toBe('谢谢你，天天向上');
    expect(cleanPageText('a bookkeeper')).toBe('a bookkeeper');
  });

  it('去掉中文字与标点之间被插入的空格和换行，英文词间空格保留', () => {
    expect(cleanPageText('穆斯林 ？ 女性的人\n道权利')).toBe('穆斯林？女性的人道权利');
    expect(cleanPageText('Five  Pillars of Islam')).toBe('Five Pillars of Islam');
  });

  it('OCR 结果够完整就用 OCR；明显更短（漏识别）就留 pypdf', () => {
    const parsed = [{ n: 1, text: 'RIGHTS OF MANKIND 46' }, { n: 2, text: '这一页 pypdf 抽得很完整，有很多很多的正文内容在这里' }];
    const ocr = new Map([[1, '伊斯兰教中的女性\n伊斯兰降示的年代，人类社会还没有承认女性的人道权利'], [2, '漏了']]);
    const merged = mergeParsedPages(parsed, ocr);
    expect(merged[0].text).toContain('伊斯兰教中的女性');
    expect(merged[1].text).toContain('pypdf 抽得很完整');
  });
});

describe('检索召回（真实资料实测过的问法）', () => {
  const kb: GroundedPage[] = [
    { docId: 'z', docTitle: '新穆斯林', page: 46, text: '四、天课内容提要：则卡特（天课）是伊斯兰的重要的功修之一，在伊斯兰的五功中排列第三，其重要性仅次于拜功。' },
    { docId: 'z', docTitle: '新穆斯林', page: 14, text: '一、小净 1-洗小净的好处 2-小净的形式（1）举意，内心想到为礼拜而洗小净即可（2）念比思命俩（3）洗两手三次（4）漱口三次' },
    { docId: 'z', docTitle: '新穆斯林', page: 20, text: '大净：洗大净的正确方式，简便的大净方式，坏大净的事项，禁止无大净者做的事项。' },
  ];

  it('疑问词不再拖累检索：「什么是天课」「如何做小净」能答', () => {
    expect(decide(kb, '什么是天课？').allowed).toBe(true);
    expect(decide(kb, '如何做小净？').allowed).toBe(true);
  });

  it('中文改写里夹的英文译名不否决：「什么是天课（Zakat）？」', () => {
    expect(decide(kb, '什么是天课（Zakat）？').allowed).toBe(true);
  });

  it('问的是资料之外的概念仍然拒答（中文连续两字以上查无此词 / 纯英文实词查无此词）', () => {
    expect(decide(kb, '天课和比特币有什么关系？').allowed).toBe(false);
    expect(decide(kb, 'How does wudu relate to cryptocurrency?').allowed).toBe(false);
  });
});
