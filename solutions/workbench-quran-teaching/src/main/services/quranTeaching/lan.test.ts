/**
 * 古兰经教学平台 · 局域网学生端：真起服务、真打 HTTP，走完「认领 → 取卷 → 交卷」。
 *
 * 这条链最要紧的两件事，都在这里钉住：
 *   ① 学生设备上**拿不到正确答案**（下发的题目里不能有 answer 字段）；
 *   ② 学生交的卷子真的写回教师机的 store —— 教师端的薄弱点分析、强化教学、复测
 *      全都读这份记录，写不回去这套演示就是两张皮。
 */
import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

vi.mock('../../util/quitRegistry', () => ({ onAppWillQuit: () => {} }));

import { QuranTeachingStore } from './store';
import { QuranLanService } from './lan';
import { questionsForStudent } from '../../../shared/quranPaperVariant';

const CORPUS = join(__dirname, '..', '..', '..', '..', '..', '..', 'resources', 'quran-demo-corpus');

describe('局域网学生端', () => {
  let dir = '';
  let store: QuranTeachingStore;
  let svc: QuranLanService;
  let base = '';
  let paperId = '';

  beforeAll(async () => {
    dir = mkdtempSync(join(tmpdir(), 'quran-lan-'));
    store = new QuranTeachingStore({ dataDir: dir, bundledCorpusDir: CORPUS, llmReady: () => false });
    svc = new QuranLanService(store);
    const st = await svc.start();
    base = `http://127.0.0.1:${st.port}`;
    paperId = store.generatePaper({ chapter: 103, lang: 'zh', count: 6 }).paper.id;
    svc.setActivePaper(paperId, 'zh');
  });
  afterAll(async () => { await svc.stop(); rmSync(dir, { recursive: true, force: true }); });

  const post = (path: string, body: unknown, token?: string) => fetch(`${base}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    body: JSON.stringify(body),
  }).then((r) => r.json());

  it('名册先列出有哪些名字与哪些已被认领（别让学生瞎猜）', async () => {
    const r = await (await fetch(`${base}/api/roster?lang=zh`)).json();
    expect(r.students.length).toBe(store.listStudents().length);
    expect(r.students.every((s: any) => typeof s.name === 'string' && s.taken === false)).toBe(true);
  });

  it('班级码不对进不来；对了才发 token', async () => {
    const bad = await post('/api/join', { code: 'ZZZ-ZZZ', studentId: 'stu-a' });
    expect(bad.error).toBe('BAD_CODE');
    const ok = await post('/api/join', { code: svc.classCode, studentId: 'stu-a' });
    expect(typeof ok.token).toBe('string');
    // 班级码手输容易带上分隔符与大小写差异，归一化后等价
    const st2 = await post('/api/join', { code: svc.classCode.replace('-', '').toLowerCase(), studentId: 'stu-b' });
    expect(typeof st2.token).toBe('string');
  });

  it('一个名字同时只能有一个人用', async () => {
    const again = await post('/api/join', { code: svc.classCode, studentId: 'stu-a' });
    expect(again.error).toBe('TAKEN');
  });

  it('学习内容：先能学再能考（经文原样、单元与词汇按所选语言）', async () => {
    svc.releaseAll();
    const { token } = await post('/api/join', { code: svc.classCode, studentId: 'stu-a' });
    const d = await (await fetch(`${base}/api/learn`, { headers: { Authorization: `Bearer ${token}` } })).json();
    expect(d.chapter).toBe(103);
    expect(d.verses.length).toBeGreaterThan(0);
    // 经文是 L1 冻结原文，原样下发（阿拉伯字母）
    expect(d.verses.every((v: any) => /[\u0600-\u06ff]/.test(v.arabic))).toBe(true);
    expect(d.verses.every((v: any) => typeof v.ref === 'string')).toBe(true);
    // 单元与词义是教学资料，按下发的语言给 —— 中文卷就该是中文，不能甩一串阿语给新入门者
    expect(d.lang).toBe('zh');
    if (d.units.length) expect(d.units.every((u: any) => u.title && u.theme)).toBe(true);
    if (d.vocab.length) expect(d.vocab.every((w: any) => w.word && w.meaning)).toBe(true);
    svc.releaseAll();
  });
  it('学习内容的范围跟着下发的卷子走（不会对着别章经文做这一章的题）', async () => {
    const other = store.generatePaper({ chapter: 112, lang: 'zh', count: 3 }).paper;
    svc.setActivePaper(other.id, 'zh');
    svc.releaseAll();
    const { token } = await post('/api/join', { code: svc.classCode, studentId: 'stu-a' });
    const d = await (await fetch(`${base}/api/learn`, { headers: { Authorization: `Bearer ${token}` } })).json();
    expect(d.chapter).toBe(112);
    svc.setActivePaper(paperId, 'zh');
    svc.releaseAll();
  });
  it('课程与试卷分开下发：没发卷也有学习内容，发了课程还多一份课时安排', async () => {
    // 用户实拍反馈：「下发为什么只能下发试卷，课程呢？」—— 绑在一起会变成「不发卷学生就没东西看」
    const plan = await store.generatePlan({ chapter: 103, from: 1, to: 3, grade: '大学', level: 'beginner', sessionsPerWeek: 1, sessionMinutes: 45, weeks: 1, lang: 'zh' });
    svc.setActivePaper('', 'zh');            // 明确不发卷
    svc.setActiveLesson({ chapter: 103 }, 'zh', plan.id);
    svc.releaseAll();
    const { token } = await post('/api/join', { code: svc.classCode, studentId: 'stu-a' });
    const auth = { Authorization: `Bearer ${token}` };

    const d = await (await fetch(`${base}/api/learn`, { headers: auth })).json();
    expect(d.verses.length).toBeGreaterThan(0);          // 没发卷照样有经文可读
    expect(d.lesson).not.toBeNull();
    expect(d.lesson.sessions.length).toBeGreaterThan(0); // 课时安排下来了
    expect(d.lesson.objectives.length).toBeGreaterThan(0);
    // 卷子那一侧仍然明确是「还没发」，两条互不影响
    expect((await (await fetch(`${base}/api/paper`, { headers: auth })).json()).error).toBe('NO_PAPER');

    // 只发范围、不带课程：仍有经文，只是没有课时安排
    svc.setActiveLesson({ chapter: 103 }, 'zh', '');
    const d2 = await (await fetch(`${base}/api/learn`, { headers: auth })).json();
    expect(d2.verses.length).toBeGreaterThan(0);
    expect(d2.lesson).toBeNull();

    svc.setActivePaper(paperId, 'zh');
    svc.releaseAll();
  }, 60_000);

  it('单元带上自己覆盖的经文 ref：学生端按单元分页，一页只显示这个单元的经文', async () => {
    svc.releaseAll();
    const { token } = await post('/api/join', { code: svc.classCode, studentId: 'stu-a' });
    const d = await (await fetch(`${base}/api/learn`, { headers: { Authorization: `Bearer ${token}` } })).json();
    expect(d.units.length).toBeGreaterThan(0);
    // 没有 refs 的话学生端只能把整章经文堆在一页上 —— 手机上滚到一半就不知道自己在哪
    expect(d.units.every((u: any) => Array.isArray(u.refs))).toBe(true);
    const refs = new Set(d.verses.map((v: any) => v.ref));
    const covered = d.units.flatMap((u: any) => u.refs);
    expect(covered.length).toBeGreaterThan(0);
    expect(covered.every((r: string) => refs.has(r))).toBe(true); // ref 必须真能在本课经文里找到
    svc.releaseAll();
  });

  it('学生端能提问：命中批准资料才作答，命不中明说超出范围', async () => {
    svc.releaseAll();
    const { token } = await post('/api/join', { code: svc.classCode, studentId: 'stu-a' });
    // 空问题不去打模型
    expect((await post('/api/ask', { q: '   ' }, token)).error).toBe('EMPTY');
    // 命中本章批准资料（llmReady=false，走资料原文兜底，判定不依赖模型）
    const hit = await post('/api/ask', { q: '亏折是什么意思？' }, token);
    expect(hit.insufficient).toBe(false);
    expect(String(hit.answer).length).toBeGreaterThan(0);
    expect(hit.sources.length).toBeGreaterThan(0);  // 每句话都要说得出依据
    // 完全无关的问题：明确说超出范围，不让模型自由发挥
    const miss = await post('/api/ask', { q: 'zzqqxx' }, token);
    expect(miss.insufficient).toBe(true);
    svc.releaseAll();
  }, 30_000);

  it('提问限流：一个学生一分钟最多 6 次，超了回 TOO_MANY 而不是把教师机问垮', async () => {
    svc.releaseAll();
    const { token } = await post('/api/join', { code: svc.classCode, studentId: 'stu-b' });
    for (let i = 0; i < 6; i += 1) expect((await post('/api/ask', { q: '亏折' }, token)).error).toBeUndefined();
    expect((await post('/api/ask', { q: '亏折' }, token)).error).toBe('TOO_MANY');
    svc.releaseAll();  // releaseAll 同时清限流计数，下一轮演示不受影响
    const re = await post('/api/join', { code: svc.classCode, studentId: 'stu-b' });
    expect((await post('/api/ask', { q: '亏折' }, re.token)).error).toBeUndefined();
    svc.releaseAll();
  }, 30_000);

  it('取卷：每人自己那一版题序，且**不下发正确答案**', async () => {
    const { token } = await post('/api/join', { code: svc.classCode, studentId: 'stu-c' });
    const paper = await (await fetch(`${base}/api/paper`, { headers: { Authorization: `Bearer ${token}` } })).json();
    expect(paper.id).toBe(paperId);
    expect(paper.questions.length).toBeGreaterThan(0);
    for (const q of paper.questions) {
      expect(q).not.toHaveProperty('answer');   // 学生设备上没有答案可看
      expect(q).not.toHaveProperty('explanation');
      expect(Array.isArray(q.options)).toBe(true);
    }
    // 与教师机算出来的这名学生的题序一致
    const mine = store.paper(paperId).variants?.find((v) => v.studentId === 'stu-c');
    if (mine) expect(paper.questions.map((q: any) => q.id)).toEqual(mine.order);
  });

  it('交卷写回教师机的 store：记录、判分、错题解析都对得上', async () => {
    const { token } = await post('/api/join', { code: svc.classCode, studentId: 'stu-d' });
    const paper = await (await fetch(`${base}/api/paper`, { headers: { Authorization: `Bearer ${token}` } })).json();
    const answers: Record<string, number> = {};
    for (const q of paper.questions) answers[q.id] = 0; // 一律选第一项，必然有对有错
    const r = await post('/api/submit', { paperId, answers }, token);
    expect(r.total).toBe(paper.questions.length);
    expect(r.correct).toBeGreaterThanOrEqual(0);
    expect(r.correct + r.wrong.length).toBe(r.total);
    // 教师机上确实有这名学生的作答记录（教师端的分析就读这份）
    const recs = store.records(paperId).filter((x) => x.studentId === 'stu-d');
    expect(recs.length).toBe(paper.questions.length);
    expect(recs.filter((x) => x.correct).length).toBe(r.correct);
  });

  it('排序题与配对题：题面带得全，答案按数组判分（不再一律算错）', async () => {
    // 用户实拍反馈：配对题的题干只剩「为下列词语选择正确释义：」，词一个都没有 ——
    // 真因是下发时把 type 与 left 丢了，学生端只能当单选渲染，交上去的数组答案又被压成 null。
    //
    // ⚠️ 出题是随机种子驱动的，一张卷子里有没有配对题**不保证** —— 直接断言「一定有」
    // 会变成一条看运气的用例（我先写成那样，在整目录跑的时候真的红了，而且它失败后
    // 没放开 stu-e，把后面那条 401 用例也一起带红了）。所以这里多出几张直到出现为止，
    // 真的十次都出不来，那说明生成器坏了，该红。
    let big = null as ReturnType<typeof store.generatePaper>['paper'] | null;
    for (let i = 0; i < 10 && !big; i += 1) {
      const p = store.generatePaper({ chapter: 12, from: 65, to: 83, lang: 'zh', level: 'advanced', count: 14 }).paper;
      if (p.questions.some((q) => q.type === 'match') && p.questions.some((q) => q.type === 'order')) big = p;
    }
    expect(big).toBeTruthy();
    svc.setActivePaper(big!.id, 'zh', { chapter: 12, from: 65, to: 83 });
    svc.releaseAll();
    try {
      const { token } = await post('/api/join', { code: svc.classCode, studentId: 'stu-e' });
      const paper = await (await fetch(`${base}/api/paper`, { headers: { Authorization: `Bearer ${token}` } })).json();
      expect(paper.questions.every((q: any) => typeof q.type === 'string')).toBe(true);
      // dimension 也要带：同样是 match，词汇配对（左边是词）与跨节理解（左边是整节经文）
      // 的操作提示完全不一样。学生端只看 type 就会在「这些经文各属于哪个单元？」下面
      // 写「为每个词选出释义」（实拍截图里就是这样）。
      expect(paper.questions.every((q: any) => typeof q.dimension === 'string' && q.dimension)).toBe(true);
      const matches = paper.questions.filter((q: any) => q.type === 'match');
      expect(matches.length).toBeGreaterThan(0);
      for (const q of matches) {
        expect((q.left || []).length).toBeGreaterThan(0);          // 左列必须下发，否则题面是空的
        expect(['vocabulary', 'comprehension']).toContain(q.dimension);
      }

      // 按教师机上这名学生那一版的正确答案作答，应当满分 —— 数组答案要真的被判对
      const mine = questionsForStudent(big!, 'stu-e');
      const answers: Record<string, number | number[]> = {};
      for (const q of mine) answers[q.id] = q.answer;
      const r = await post('/api/submit', { paperId: big!.id, answers }, token);
      expect(r.total).toBe(mine.length);
      expect(r.correct).toBe(r.total);
      expect(r.wrong.length).toBe(0);
    } finally {
      // 放在 finally 里：这条要是断言失败，stu-e 会一直挂在「已被认领」上，
      // 后面那条 401 用例拿不到 token，跟着一起红 —— 排查时全是噪音。
      svc.setActivePaper(paperId, 'zh');
      svc.releaseAll();
    }
  }, 60_000);

  it('没 token 一律 401；卷子过期（换了卷）拒收旧答卷', async () => {
    expect((await fetch(`${base}/api/paper`)).status).toBe(401);
    const { token } = await post('/api/join', { code: svc.classCode, studentId: 'stu-e' });
    const stale = await post('/api/submit', { paperId: 'paper-does-not-exist', answers: {} }, token);
    expect(stale.error).toBe('STALE_PAPER');
  });

  it('未下发试卷时学生端收到 NO_PAPER，而不是一个空白页', async () => {
    svc.setActivePaper('', 'zh');
    svc.releaseAll(); // 这条用例自带前置，不依赖前面几条留下的认领状态
    const fresh = await post('/api/join', { code: svc.classCode, studentId: 'stu-a' });
    // 同一个名字第二个人来认领拿不到 token（顺带把「一人一名」再钉一次）
    expect((await post('/api/join', { code: svc.classCode, studentId: 'stu-a' })).token).toBeUndefined();
    const r = await (await fetch(`${base}/api/paper`, { headers: { Authorization: `Bearer ${fresh.token}` } })).json();
    expect(r.error).toBe('NO_PAPER');
    svc.setActivePaper(paperId, 'zh');
  });

  it('换班级码后旧码失效，但不踢已经在答题的学生', async () => {
    svc.releaseAll();
    const joined = await post('/api/join', { code: svc.classCode, studentId: 'stu-b' });
    const old = svc.classCode;
    svc.rotateCode();
    expect(svc.classCode).not.toBe(old);
    expect((await post('/api/join', { code: old, studentId: 'stu-c' })).error).toBe('BAD_CODE');
    // 换码是为了拦住外面的人，不是打断课堂：已在答题的人手上那张 token 还能用
    const still = await fetch(`${base}/api/paper`, { headers: { Authorization: `Bearer ${joined.token}` } });
    expect(still.status).toBe(200);
  });
});

/**
 * 下发状态必须由 status() 回报（2026-09-22 用户反馈）。
 *
 * 教师端那两个下拉原来是纯本地 ref：面板一重挂载（切 tab / 重开工作台 / 重启应用）
 * 就退回「未下发」，而服务端照样在发着卷 —— 老师看着「未下发」以为没发出去，
 * 会再发一遍。回显要按服务端的事实来。
 */
describe('status 回报当前下发的试卷与课程', () => {
  it('setActivePaper / setActiveLesson 之后能从 status 读回来，收回则变空串', async () => {
    const dir = mkdtempSync(join(tmpdir(), 'quran-lan-st-'));
    const store = new QuranTeachingStore({ dataDir: dir, bundledCorpusDir: CORPUS, llmReady: () => false });
    const svc = new QuranLanService(store);
    try {
      // 没起服务也要能问状态：教师端挂载时就会读一次
      expect(svc.status().paperId).toBe('');
      expect(svc.status().planId).toBe('');

      const pid = store.generatePaper({ chapter: 103, lang: 'zh', count: 4 }).paper.id;
      svc.setActivePaper(pid, 'zh');
      expect(svc.status().paperId).toBe(pid);

      svc.setActiveLesson({ chapter: 103 }, 'zh', 'plan-x');
      expect(svc.status().planId).toBe('plan-x');
      expect(svc.status().paperId, '发课程不该把卷子顺手收回') .toBe(pid);

      // 收回试卷：学习内容照常，卷子回到未下发
      svc.setActivePaper('', 'zh');
      expect(svc.status().paperId).toBe('');
      expect(svc.status().planId, '收卷不该把课程也收回').toBe('plan-x');
    } finally {
      await svc.stop();
      rmSync(dir, { recursive: true, force: true });
    }
  });
});
