/**
 * eduHubProc 冒烟：真启动 HTTP 服务，走一遍学生完整链路。
 * 守住四条产品红线：
 *   1. 学生登录必须过班级码（错码拒绝）；
 *   2. 未登录（无 token）拿不到任何课程数据；
 *   3. 课文/小测下发给学生时**绝不包含答案与解析**（交卷后才回）；
 *   4. 学情三态可回看：打开课文记「已阅读」、交卷记成绩。
 */
import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import { mkdtempSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';

const userData = mkdtempSync(join(tmpdir(), 'edu-hub-test-'));

vi.mock('electron', () => ({
  app: {
    getPath: () => userData,
    on: () => { /* will-quit 钩子在测试里不触发 */ },
    isPackaged: false,
  },
}));

import { EduHubStore } from './eduHubStore';
import { EduHubProc } from './eduHubProc';

const LESSON = {
  id: 'les00001', materialId: 'mat00001', materialName: 'demo.pdf', status: 'published',
  plan: {
    title: '事实核查与可靠来源', grade: '初中', durationMinutes: 45,
    objectives: ['obj1'], keyPoints: ['kp1'], difficulties: ['d1'],
    schedule: [{ phase: '导入', minutes: 45, activity: 'a' }], boardNotes: ['b1'], homework: 'hw',
  },
  studentDigest: [{ sectionTitle: 'S1', bullets: ['b'], sourcePages: [2] }],
  quiz: [
    { q: 'Q1', options: ['A', 'B', 'C', 'D'], answer: 1, explain: 'because', sourcePage: 3 },
    { q: 'Q2', options: ['A', 'B', 'C', 'D'], answer: 2, explain: 'why', sourcePage: 4 },
  ],
  publishedAt: Date.now(),
};

let proc: EduHubProc;
let store: EduHubStore;
let base = '';

beforeAll(async () => {
  // 预置一节已发布课，绕过解析与 LLM（各自有独立冒烟/校验路径）
  const root = join(userData, 'edu-hub');
  mkdirSync(root, { recursive: true });
  writeFileSync(join(root, 'lessons.json'), JSON.stringify([LESSON]), 'utf-8');
  store = new EduHubStore({ llm: async () => '{}' });
  proc = new EduHubProc(store);
  const st = await proc.start();
  base = `http://127.0.0.1:${st.port}`;
});

afterAll(async () => { await proc.stop(); });

describe('eduHubProc 学生链路', () => {
  it('学生页可达且带 ETag 缓存（二次请求 304）', async () => {
    const r1 = await fetch(base + '/');
    expect(r1.status).toBe(200);
    expect(await r1.text()).toContain('AI Learning Hub');
    const etag = r1.headers.get('etag')!;
    const r2 = await fetch(base + '/', { headers: { 'If-None-Match': etag } });
    expect(r2.status).toBe(304);
  });

  it('班级码错误拒绝登录；正确则发 token', async () => {
    const bad = await (await fetch(base + '/api/join', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code: 'XXX-XXX', name: 'Ali' }),
    })).json();
    expect(bad.error).toBe('BAD_CODE');
    const ok = await (await fetch(base + '/api/join', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code: store.classCode, studentNo: 'S001', name: 'Ali' }),
    })).json();
    expect(ok.token).toBeTruthy();
  });

  it('无 token 请求课程返回 401', async () => {
    expect((await fetch(base + '/api/lessons')).status).toBe(401);
  });

  it('完整链路：列表 → 课文（无答案）→ 交卷判分 → 学情三态', async () => {
    const { token, studentId } = await (await fetch(base + '/api/join', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code: store.classCode, studentNo: 'S002', name: 'Sara' }),
    })).json();
    const auth = { Authorization: `Bearer ${token}` };

    const list = await (await fetch(base + '/api/lessons', { headers: auth })).json();
    expect(list).toHaveLength(1);
    expect(list[0].myScore).toBeNull();

    // 学情：登录后未打开 → 未开始
    expect(store.progressRows().find((r) => r.studentId === studentId)!.opens['les00001']).toBeUndefined();

    const lesson = await (await fetch(base + '/api/lessons/les00001', { headers: auth })).json();
    // 红线 3：下发的小测不含 answer / explain
    expect(JSON.stringify(lesson)).not.toContain('answer');
    expect(JSON.stringify(lesson)).not.toContain('because');
    expect(lesson.quiz).toHaveLength(2);

    // 学情：打开即「已阅读」
    expect(store.progressRows().find((r) => r.studentId === studentId)!.opens['les00001']).toBeTruthy();

    // 交卷：对 1 错 1 → 1/2；返回带解析与正确项
    const res = await (await fetch(base + '/api/lessons/les00001/submit', {
      method: 'POST', headers: { 'Content-Type': 'application/json', ...auth },
      body: JSON.stringify({ answers: [1, 0] }),
    })).json();
    expect(res.score).toBe(1);
    expect(res.total).toBe(2);
    expect(res.detail[0].correct).toBe(true);
    expect(res.detail[1].explain).toBe('why');

    // 学情：成绩落表 + 列表回显我的成绩
    const row = store.progressRows().find((r) => r.studentId === studentId)!;
    expect(row.submissions['les00001'].score).toBe(1);
    const list2 = await (await fetch(base + '/api/lessons', { headers: auth })).json();
    expect(list2[0].myScore.score).toBe(1);

    // 红线：重复提交不刷分 —— 第二次拿正确答案再交，成绩仍是首次的 1/2
    const res2 = await (await fetch(base + '/api/lessons/les00001/submit', {
      method: 'POST', headers: { 'Content-Type': 'application/json', ...auth },
      body: JSON.stringify({ answers: [1, 2] }),
    })).json();
    expect(res2.score).toBe(1);
    expect(res2.alreadySubmitted).toBe(true);
    expect(store.progressRows().find((r) => r.studentId === studentId)!.submissions['les00001'].score).toBe(1);
  });

  it('班级码大小写/去连字符归一化：小写无连字符也能登录', async () => {
    const noHyphen = store.classCode.replace('-', '').toLowerCase();
    const ok = await (await fetch(base + '/api/join', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code: noHyphen, studentNo: 'S003', name: 'Omar' }),
    })).json();
    expect(ok.token).toBeTruthy();
  });

  it('学号=账号主键：同学号收敛为同一账号（换发 token），姓名不符拒绝，异学号独立，缺学号拒绝', async () => {
    const j1 = await (await fetch(base + '/api/join', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code: store.classCode, studentNo: '2024001', name: 'Layla' }),
    })).json();
    // 同学号 + 同姓名再登：同一账号（studentId 一致），换发新 token 收回旧设备
    const j2 = await (await fetch(base + '/api/join', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code: store.classCode, studentNo: '2024001', name: 'Layla' }),
    })).json();
    expect(j2.studentId).toBe(j1.studentId);
    expect(j2.token).not.toBe(j1.token);
    // 同学号但姓名不符：学号+姓名双要素挡住冒名
    const bad = await (await fetch(base + '/api/join', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code: store.classCode, studentNo: '2024001', name: 'Mallory' }),
    })).json();
    expect(bad.error).toBe('BAD_MATCH');
    // 异学号：独立账号
    const j3 = await (await fetch(base + '/api/join', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code: store.classCode, studentNo: '2024002', name: 'Layla' }),
    })).json();
    expect(j3.studentId).not.toBe(j1.studentId);
    // 缺学号：拒绝（学号是主键，必填）
    const noNo = await (await fetch(base + '/api/join', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code: store.classCode, name: 'NoNumber' }),
    })).json();
    expect(noNo.error).toBe('BAD_NO');
  });

  it('课程下线后学生端拉取返回错误信封（api 层会抛，不渲染死页）', async () => {
    const { token } = await (await fetch(base + '/api/join', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code: store.classCode, studentNo: 'S005', name: 'Yousef' }),
    })).json();
    store.publishLesson('les00001', false); // 教师下线
    const r = await fetch(base + '/api/lessons/les00001', { headers: { Authorization: `Bearer ${token}` } });
    expect(r.status).toBe(404);
    expect((await r.json()).error).toBe('NOT_FOUND');
    store.publishLesson('les00001', true); // 复原给后续测试
  });
});

describe('eduHubStore 纯函数', () => {
  it('sanitizeQuiz：字母答案映射、越界整题丢弃', async () => {
    const mod = await import('./eduHubStore');
    // 通过 normalizeLesson 间接验证 sanitizeQuiz（后者非导出）
    const r = mod.normalizeLesson({
      plan: { objectives: ['x'] },
      quiz: [
        { q: 'letter', options: ['a', 'b', 'c', 'd'], answer: 'C', explain: '' }, // C → 2
        { q: 'oob', options: ['a', 'b', 'c', 'd'], answer: 9, explain: '' },        // 越界 → 丢
        { q: 'nan', options: ['a', 'b', 'c', 'd'], answer: 'Z', explain: '' },      // Z 越界 → 丢
        { q: 'ok', options: ['a', 'b', 'c', 'd'], answer: 1, explain: '' },
      ],
    }, 'T', { grade: 'g', durationMinutes: 45 });
    expect(r.quiz.map((q) => q.q)).toEqual(['letter', 'ok']);
    expect(r.quiz[0].answer).toBe(2);
  });

  it('budgetPages：长文档总量不超预算', async () => {
    const mod = await import('./eduHubStore');
    const pages = Array.from({ length: 400 }, (_, i) => ({ n: i + 1, text: 'x'.repeat(500) }));
    const out = mod.budgetPages(pages, 20_000);
    expect(out.length).toBeLessThanOrEqual(20_001);
  });

  it('sanitizePages 经 normalizeLesson：非数字来源页被过滤（防 SPA 端 XSS）', async () => {
    const mod = await import('./eduHubStore');
    const r = mod.normalizeLesson({
      plan: { objectives: ['x'] },
      studentDigest: [{ sectionTitle: 's', bullets: ['b'], sourcePages: ['<img onerror=x>', 3, -1, 3] }],
      quiz: [{ q: 'q', options: ['a', 'b', 'c', 'd'], answer: 0, explain: '' }],
    }, 'T', { grade: 'g', durationMinutes: 45 });
    expect(r.studentDigest[0].sourcePages).toEqual([3]);
  });

  it('normalizeLesson：解析知识导图与配图规格', async () => {
    const mod = await import('./eduHubStore');
    const r = mod.normalizeLesson({
      plan: { objectives: ['x'] },
      knowledgeMap: { center: '光合作用', branches: [{ label: '光反应', points: ['ATP', 'NADPH'] }, { label: '', points: [] }] },
      illustrations: [{ caption: '叶绿体结构', prompt: 'chloroplast diagram', sourcePage: 2 }, { caption: '', prompt: '' }],
      quiz: [{ q: 'q', options: ['a', 'b', 'c', 'd'], answer: 0, explain: '' }],
    }, 'T', { grade: 'g', durationMinutes: 45 });
    expect(r.knowledgeMap.center).toBe('光合作用');
    expect(r.knowledgeMap.branches.map((x) => x.label)).toEqual(['光反应']); // 空 label 分支被丢
    expect(r.illustrations).toHaveLength(1); // 空的被丢
    expect(r.illustrations[0]).toMatchObject({ caption: '叶绿体结构', sourcePage: 2 });
    expect((r.illustrations[0] as any).imageDataUrl).toBeUndefined(); // 绝不吃外来 imageDataUrl
  });

  it('renderConceptMapSvg：文本全部转义，无 XSS 面', async () => {
    const mod = await import('./eduHubStore');
    const svg = mod.renderConceptMapSvg({ center: '<script>', branches: [{ label: 'a"b', points: ['<img>'] }] });
    expect(svg.startsWith('<svg')).toBe(true);
    expect(svg).not.toContain('<script>');
    expect(svg).toContain('&lt;script&gt;');
    expect(svg).toContain('&lt;img&gt;');
  });

  it('normalizeLesson：章节 + 按 kind 只保留所需字段', async () => {
    const mod = await import('./eduHubStore');
    const r = mod.normalizeLesson({
      plan: { objectives: ['x'] },
      sections: [
        { title: '流程', intro: 'i', bullets: ['a'], sourcePages: [1], diagram: { kind: 'flow', title: 't', steps: ['s1', 's2', 's3'] }, imageQuery: 'process' },
        { title: '对比', bullets: ['b'], diagram: { kind: 'compare', title: 'c', left: { label: 'L', points: ['p1'] }, right: { label: 'R', points: ['p2'] } } },
        { title: '', bullets: [] }, // 空标题+空内容 → 丢
      ],
      quiz: [{ q: 'q', options: ['a', 'b', 'c', 'd'], answer: 0, explain: '' }],
    }, 'T', { grade: 'g', durationMinutes: 45 });
    expect(r.sections.map((s) => s.title)).toEqual(['流程', '对比']);
    expect(r.sections[0].diagram).toMatchObject({ kind: 'flow', steps: ['s1', 's2', 's3'] });
    expect((r.sections[0].diagram as any).left).toBeUndefined(); // flow 不带 compare 字段
    expect(r.sections[1].diagram).toMatchObject({ kind: 'compare' });
    expect(r.sections[0].imageQuery).toBe('process');
  });

  it('renderDiagramSvg：四种 kind 都出安全 SVG，文本转义', async () => {
    const mod = await import('./eduHubStore');
    const flow = mod.renderDiagramSvg({ kind: 'flow', title: 'T', steps: ['<b>a', 'b', 'c'] });
    const cmp = mod.renderDiagramSvg({ kind: 'compare', title: 'T', left: { label: 'L', points: ['x'] }, right: { label: 'R', points: ['y'] } });
    const cyc = mod.renderDiagramSvg({ kind: 'cycle', title: 'T', steps: ['1', '2', '3'] });
    for (const svg of [flow, cmp, cyc]) { expect(svg.startsWith('<svg')).toBe(true); expect(svg).not.toContain('<b>a'); }
    expect(flow).toContain('&lt;b&gt;a');
  });

  it('assembleLessonHtml：安全注入、ar 走 RTL、含来源标签', async () => {
    const mod = await import('./eduHubStore');
    const html = mod.assembleLessonHtml('课题', [
      { title: '<x>节', intro: 'i', bullets: ['要点'], sourcePages: [3], diagramSvg: '<svg id="d"></svg>', imageDataUrl: 'data:image/png;base64,AAAA', imageCaption: '图注', imageSourceUrl: 'https://ex/a' },
    ] as any, 'ar');
    expect(html).toContain('dir="rtl"');
    expect(html).toContain('<svg id="d">'); // 服务端 SVG 原样嵌入
    expect(html).toContain('&lt;x&gt;节'); // 标题转义
    expect(html).toContain('data:image/png;base64,AAAA');
    expect(html).toContain('المصدر'); // 阿语来源标签
  });

  it('sanitizeLessonHtml：删 script/on*/外链/iframe/style-url，留排版标签与安全内联 SVG（v4 安全核）', async () => {
    const mod = await import('./eduHubStore');
    const dirty = [
      '<section dir="rtl"><h2 onclick="alert(1)">标题</h2>',
      '<script>steal()</script>',
      '<p style="color:#0e6b5c;background:url(javascript:alert(1))">正文<strong>粗</strong></p>',
      '<iframe src="https://evil"></iframe>',
      '<a href="https://evil">链接文字</a>',
      '<img src="https://evil/x.png" onerror="alert(1)">',
      '<img data-eh-query="electric circuit" alt="配文">',
      '<svg viewBox="0 0 100 50"><rect x="1" y="2" width="8" height="8" fill="#0e6b5c"/>',
      '<text x="5" y="20" font-size="12">标注</text></svg>',
      '<foreignObject><body>x</body></foreignObject></section>',
    ].join('');
    const clean = mod.sanitizeLessonHtml(dirty);
    // —— 危险面全清 ——
    expect(clean).not.toContain('<script');
    expect(clean).not.toContain('steal()');
    expect(clean).not.toContain('onclick');
    expect(clean).not.toContain('onerror');
    expect(clean).not.toContain('<iframe');
    expect(clean).not.toContain('javascript:');
    expect(clean).not.toContain('url(');
    expect(clean).not.toMatch(/<img[^>]*\bsrc=/i); // 外链 img 的 src 被剥
    expect(clean).not.toContain('href=');           // <a> 被删（href 无处存活）
    expect(clean.toLowerCase()).not.toContain('foreignobject');
    // —— 安全内容保留 ——
    expect(clean).toContain('<section');
    expect(clean).toContain('dir="rtl"');
    expect(clean).toContain('<strong>粗</strong>');
    expect(clean).toContain('color:#0e6b5c');          // 安全 style 保留
    expect(clean).toContain('viewBox="0 0 100 50"');   // SVG 大小写属性保留（parser 不小写化）
    expect(clean).toContain('<rect');
    expect(clean).toContain('data-eh-query="electric circuit"'); // 图片占位符保留
    expect(clean).toContain('标注');
  });

  it('parseLessonOutput：哨兵分隔取小 JSON + 裸 HTML；含未转义引号/换行也稳', async () => {
    const mod = await import('./eduHubStore');
    // HTML 段故意塞入未转义的双引号与换行 —— 若走 JSON 解析必崩，走哨兵则无碍
    const raw = [
      '前言随便', '###LESSON_META###',
      '{"plan":{"title":"课"},"quiz":[{"q":"1?","options":["A","B"],"answer":0}]}',
      '###LESSON_HTML###',
      '<section>\n<h2 style="color:#0e6b5c">标题</h2>\n<p>含 "引号" 与\n换行</p>\n</section>',
      '###END###', '尾巴垃圾',
    ].join('\n');
    const out = mod.parseLessonOutput(raw);
    expect(out.meta.plan.title).toBe('课');
    expect(out.meta.quiz.length).toBe(1);
    expect(out.lessonHtml).toContain('<section>');
    expect(out.lessonHtml).toContain('含 "引号" 与');
    expect(out.lessonHtml).not.toContain('###END###');
    // 回落：无哨兵时整体当 JSON，lessonHtml 取内联字段
    const fb = mod.parseLessonOutput('{"plan":{"title":"x"},"quiz":[],"lessonHtml":"<p>hi</p>"}');
    expect(fb.lessonHtml).toBe('<p>hi</p>');
  });

  it('extractJson：GPT 系脏输出四类形状全兜住（gpt-5.5 报「不是合法 JSON」的回归）', async () => {
    const mod = await import('./eduHubStore');
    // ① 推理前言里复述了 prompt 的格式示例（带大括号）——旧「首{到尾}切片」在这里必崩；
    //    真答案裹在 ```json 围栏里
    const withPreamble = [
      '好的。按照要求的格式：{"plan": {...}, "quiz": [...]}，我来输出：',
      '```json',
      '{"plan":{"title":"电路基础"},"quiz":[{"q":"?","options":["A","B"],"answer":1}]}',
      '```',
      '以上就是教案。',
    ].join('\n');
    expect(mod.extractJson(withPreamble).plan.title).toBe('电路基础');

    // ② 字符串值里带字面换行（漏转义）
    const literalNewline = '{"plan":{"title":"第一课\n上午"},"quiz":[]}';
    expect(mod.extractJson(literalNewline).plan.title).toBe('第一课\n上午');

    // ③ 尾逗号
    expect(mod.extractJson('{"plan":{"title":"x",},"quiz":[],}').plan.title).toBe('x');

    // ④ 输出被截断（缺闭合括号）
    const truncated = '{"plan":{"title":"y"},"quiz":[{"q":"1?","options":["A","B"';
    expect(mod.extractJson(truncated).plan.title).toBe('y');

    // 多个候选对象并存时取能 parse 的最长者（真答案 > 格式示例）
    const two = '示例 {"a":1} 正文：{"plan":{"title":"真答案"},"quiz":[],"studentDigest":"长"}';
    expect(mod.extractJson(two).plan.title).toBe('真答案');
  });

  it('injectDiagrams：占位符 → 统一安全 SVG（含消毒后实体编码的 JSON），坏规格删除', async () => {
    const mod = await import('./eduHubStore');
    // 过一遍消毒 —— 属性值会被实体编码，验证 decode 后仍能解析渲染
    const clean = mod.sanitizeLessonHtml(`<div data-eh-diagram='{"kind":"flow","title":"步骤","steps":["读","做","查"]}'></div>`);
    expect(clean).toContain('data-eh-diagram'); // 占位符过消毒保留
    const out = mod.injectDiagrams(clean);
    expect(out).toContain('<svg');            // 渲染成 SVG
    expect(out).toContain('eh-fig');
    expect(out).not.toContain('data-eh-diagram'); // 占位符已被替换
    // 坏 JSON → 删占位符，不残留
    expect(mod.injectDiagrams(`<div data-eh-diagram='not json'></div>`)).toBe('');
  });
});
