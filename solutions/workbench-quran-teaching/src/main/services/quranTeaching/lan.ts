/**
 * 古兰经教学平台 · 校内局域网学生端服务。
 *
 * 与 AI 学习中心共用 `lanServer` 底座（绑定 / 端口探测 / 单页 gzip+ETag / 限流 / 退出登记
 * 都在那边），这里只有路由表与「学生怎么认领自己」的规则。
 *
 * 本方案的学生是**演示语料里固定的那几位**（说明书 §11 的 5 名学生），不是自由注册：
 * 真人在自己设备上挑一个名字认领，答的题、算出来的薄弱点，与教师端看到的是同一份数据。
 * 所以这里没有「注册」，只有「认领 + 释放」。
 */
import type { Logger } from '@totalclaw/logger';
import { randomBytes } from 'crypto';
import type { QuranLang, QuranLessonPlan, QuranPaper } from '@totalclaw/ipc-contracts';
import { t as i18nT } from '@totalclaw/i18n';
import { LanServer, RateBucket, lanIp, type LanRoute } from '../lanServer';
import { questionsForStudent } from '../../../shared/quranPaperVariant';
import type { QuranTeachingStore } from './store';
import { QURAN_STUDENT_PAGE_HTML } from './studentPage';

export { lanIp };

/** 端口从 8230 起：与 AI 学习中心的 8210-8229 错开，两条线可以同时开着演示 */
const DEFAULT_PORT = 8230;
const CODE_FAIL_LIMIT = 10;
const CODE_LOCK_MS = 60_000;
/** 去掉易混字符（0/O、1/I/l）的字母表：学生要照着老师屏幕手输，别让他们在 0 和 O 之间猜 */
const CODE_ALPHABET = '23456789ABCDEFGHJKMNPQRSTUVWXYZ';
/** 每人每分钟最多问几次：模型调用在教师机上跑，一个班同时狂点会把教师机拖死 */
const ASK_PER_MIN = 6;

export interface QuranLanStatus {
  running: boolean;
  port: number | null;
  url: string | null;
  classCode: string;
  /** 已被真人认领的学生数 / 演示语料里的总数 */
  claimed: number;
  total: number;
  /**
   * 当前实际下发的试卷 / 课程计划（空串 = 未下发）。
   * ⚠️ 必须回报：教师端那两个下拉原来是纯本地状态，面板一重挂载就回到「未下发」，
   * 而服务端照样在发着卷 —— 显示与事实脱节，老师会以为没发出去而重发一遍。
   */
  paperId: string;
  planId: string;
}

interface Session { studentId: string; token: string; since: number }

function newClassCode(): string {
  const b = randomBytes(6);
  let s = '';
  for (let i = 0; i < 6; i += 1) s += CODE_ALPHABET[b[i] % CODE_ALPHABET.length];
  return `${s.slice(0, 3)}-${s.slice(3)}`;
}
const normalizeCode = (v: string): string => String(v || '').replace(/[^0-9a-z]/gi, '').toUpperCase();

export class QuranLanService {
  private lan: LanServer<Session>;
  private codeValue = newClassCode();
  /** studentId → 会话。一个名字同时只有一个人用；换设备重新认领即收回旧 token */
  private sessions = new Map<string, Session>();
  /** 教师端当前下发的卷子；没下发时学生端显示「老师还没有发卷」 */
  private activePaperId = '';
  private activeLang: QuranLang = 'zh';
  /**
   * 当前下发的**课程**：教学范围 + 可选的课程计划。
   *
   * 与试卷分开下发是有原因的：课程是「学什么」，试卷是「考什么」，课上先讲半节再考，
   * 或者只讲不考，都是常态。绑在一起会变成「不发卷学生就没东西看」。
   */
  private scope = { chapter: 103, from: undefined as number | undefined, to: undefined as number | undefined };
  private activePlanId = '';
  /** studentId → 最近一分钟的提问时间戳（受限问答限流，见 /api/ask） */
  private askRate = new Map<string, number[]>();

  constructor(private store: QuranTeachingStore, private logger?: Logger) {
    const fails = new RateBucket(CODE_FAIL_LIMIT, CODE_LOCK_MS);
    this.lan = new LanServer<Session>({
      name: 'quran-teaching',
      pageHtml: QURAN_STUDENT_PAGE_HTML,
      defaultPort: DEFAULT_PORT,
      logger,
      auth: (token) => this.sessionByToken(token),
      routes: this.routes(fails),
    });
  }

  get classCode(): string { return this.codeValue; }

  status(): QuranLanStatus {
    return {
      running: this.lan.running,
      port: this.lan.port,
      url: this.lan.url,
      classCode: this.codeValue,
      claimed: this.sessions.size,
      total: this.store.listStudents().length,
      paperId: this.activePaperId,
      planId: this.activePlanId,
    };
  }

  async start(): Promise<QuranLanStatus> { await this.lan.start(); return this.status(); }
  async stop(): Promise<void> { await this.lan.stop(); }

  /** 换班级码：旧码立刻失效，但**不踢已经在答题的学生** —— 换码是为了拦住外面的人，不是打断课堂 */
  rotateCode(): QuranLanStatus {
    this.codeValue = newClassCode();
    return this.status();
  }

  /**
   * 下发课程：学生端「学习内容」按它显示经文、单元、词汇与课时安排。
   * planId 可以为空 —— 只指定范围也算下发了课程（学生照样能读经文与单元）。
   */
  setActiveLesson(scope: { chapter?: number; from?: number; to?: number }, lang: QuranLang, planId?: string): QuranLanStatus {
    if (scope?.chapter) this.scope = { chapter: scope.chapter, from: scope.from, to: scope.to };
    this.activeLang = lang;
    this.activePlanId = planId || '';
    return this.status();
  }

  /**
   * 下发 / 收回试卷。收回后学生端的「练习 / 考试」回到「老师还没有发卷」，
   * **但学习内容照常在** —— 不发卷不等于没课可上。
   *
   * 下发卷子时顺带把教学范围对齐到这张卷子：只换卷不换范围，学生会对着别章的经文做这一章的题。
   */
  setActivePaper(paperId: string, lang: QuranLang, scope?: { chapter?: number; from?: number; to?: number }): QuranLanStatus {
    this.activePaperId = paperId || '';
    this.activeLang = lang;
    if (scope?.chapter) this.scope = { chapter: scope.chapter, from: scope.from, to: scope.to };
    else if (paperId) {
      try { const p = this.store.paper(paperId); this.scope = { chapter: p.chapter, from: p.from, to: p.to }; } catch { /* 卷子没了就沿用上次范围 */ }
    }
    return this.status();
  }

  /** 放开所有认领（清空演示数据时一起调，否则下一轮演示这些名字全是「已有人」） */
  releaseAll(): void { this.sessions.clear(); this.askRate.clear(); }

  private sessionByToken(token: string): Session | null {
    if (!token) return null;
    for (const s of this.sessions.values()) if (s.token === token) return s;
    return null;
  }

  private activePaper(): QuranPaper | null {
    if (!this.activePaperId) return null;
    try { return this.store.paper(this.activePaperId); } catch { return null; }
  }

  private routes(fails: RateBucket): LanRoute<Session>[] {
    return [
      {
        // 名册：登录页要把「有哪些名字、哪些已被认领」先列出来，避免学生瞎猜
        method: 'GET', path: '/api/roster', auth: 'none',
        handler: (c) => {
          let lang: QuranLang = this.activeLang;
          try {
            const q = new URL(c.req.url || '/', 'http://x').searchParams.get('lang');
            if (q === 'zh' || q === 'en' || q === 'ar') lang = q;
          } catch { /* 取不到就用卷子的语言 */ }
          c.json(200, {
            students: this.store.listStudents().map((s) => ({
              id: s.id,
              name: s.name[lang] || s.name.zh,
              taken: this.sessions.has(s.id),
            })),
          });
        },
      },
      {
        method: 'POST', path: '/api/join', auth: 'none',
        handler: async (c) => {
          if (fails.locked(c.clientIp)) { c.json(429, { error: 'TOO_MANY' }); return; }
          const body = await c.body();
          if (normalizeCode(body?.code) !== normalizeCode(this.codeValue)) {
            // 班级码离线可暴破，错码才计数；选错名字不该把人锁在门外
            if (fails.fail(c.clientIp)) this.logger?.warn?.('quran-teaching', i18nT('班级码尝试过于频繁，已临时限流'), { ip: c.clientIp });
            c.json(200, { error: 'BAD_CODE' });
            return;
          }
          fails.pass(c.clientIp);
          const studentId = String(body?.studentId || '');
          const known = this.store.listStudents().some((s) => s.id === studentId);
          if (!known) { c.json(200, { error: 'BAD_STUDENT' }); return; }
          if (this.sessions.has(studentId)) { c.json(200, { error: 'TAKEN' }); return; }
          const token = randomBytes(24).toString('hex');
          this.sessions.set(studentId, { studentId, token, since: Date.now() });
          c.json(200, { token, studentId });
        },
      },
      {
        /**
         * 学习内容：经文 + 本课单元 + 词汇。
         *
         * 学生扫码进来第一眼要先能「学」，不是直接甩一张卷子 —— 教师端的学生页本来就是
         * 「学习内容 → 练习/考试 → 结果」三段，局域网这一侧不该只剩中间那段。
         * 经文是 L1 冻结原文（原样下发），单元与词汇取所选语言的标签。
         */
        method: 'GET', path: '/api/learn', auth: 'bearer',
        handler: (c) => {
          const sel = this.scope;
          const lang = this.activeLang;
          let verses: Array<{ ref: string; arabic: string }> = [];
          let units: Array<{ title: string; theme: string; range: string; refs: string[] }> = [];
          let vocab: Array<{ word: string; meaning: string }> = [];
          try {
            verses = this.store.verses(sel.chapter, sel.from, sel.to).map((v) => ({ ref: v.ref, arabic: v.arabic }));
            const parsed = this.store.parse(sel.chapter, sel.from, sel.to);
            // 带上每个单元覆盖的经文 ref：学生端按单元分页，一页只显示这个单元的经文
            units = parsed.units.map((u) => ({
              title: u.title[lang] || u.title.zh,
              theme: u.theme[lang] || u.theme.zh,
              range: `${u.from}-${u.to}`,
              refs: u.verseRefs || [],
            }));
            vocab = parsed.vocabulary.filter((w) => w.meaning).slice(0, 24)
              .map((w) => ({ word: w.word, meaning: w.meaning![lang] || w.meaning!.zh }));
          } catch { /* 语料没导入 / 解析不出来：给空清单，学生端显示「老师还没准备内容」 */ }
          // 课程：教学目标 + 课时安排（没下发课程就没有这一段，学生端不显示）
          let lesson: { title: string; overview: string; objectives: string[]; sessions: Array<{ title: string; range: string; objectives: string[]; minutes: number }> } | null = null;
          const plan: QuranLessonPlan | null = this.activePlanId ? this.store.findPlan(this.activePlanId) : null;
          if (plan) {
            lesson = {
              title: plan.difficultyLabel || '',
              overview: plan.overview || '',
              objectives: plan.objectives || [],
              sessions: (plan.sessions || []).map((x) => ({
                title: x.title,
                range: `${x.from}-${x.to}`,
                objectives: x.objectives || [],
                minutes: (x.segments || []).reduce((a, g) => a + (Number(g.minutes) || 0), 0),
              })),
            };
          }
          // 章名也带上：学生端封面要显示「时光章 103:1-3」，光一个数字既不像课也不好认
          let chapterName = '';
          try { chapterName = this.store.chapterLabel(sel.chapter, lang); } catch { /* 语料没导入就只显示编号 */ }
          c.json(200, { chapter: sel.chapter, chapterName, from: sel.from, to: sel.to, lang, lesson, verses, units, vocab });
        },
      },
      {
        /**
         * 受限问答：学生就本课随时提问。
         *
         * 答案严格锚定教师批准过的资料（store.studentAsk 先检索批准资料再让模型据此作答，
         * 检索不到就直接 insufficient），学生设备上问不出「课外内容」—— 这条线的整个卖点
         * 就是可追溯，问答这一环要是放开了自由发挥，前面的批准流程等于白做。
         */
        method: 'POST', path: '/api/ask', auth: 'bearer',
        handler: async (c) => {
          const sid = c.principal!.studentId;
          const now = Date.now();
          const win = (this.askRate.get(sid) || []).filter((ts) => now - ts < 60_000);
          if (win.length >= ASK_PER_MIN) { c.json(429, { error: 'TOO_MANY' }); return; }
          const body = await c.body();
          const q = String(body?.q || '').replace(/\s+/g, ' ').trim().slice(0, 300);
          if (!q) { c.json(200, { error: 'EMPTY' }); return; }
          win.push(now);
          this.askRate.set(sid, win);
          try {
            const sel = this.scope;
            const r = await this.store.studentAsk(q, sel.chapter, sel.from, sel.to, this.activeLang);
            this.logger?.info?.('quran-teaching', i18nT('学生提问'), { studentId: sid, insufficient: r.insufficient });
            c.json(200, r);
          } catch (e: any) {
            this.logger?.warn?.('quran-teaching', i18nT('学生提问失败'), { studentId: sid, err: String(e?.message || e) });
            c.json(200, { error: 'INTERNAL' });
          }
        },
      },
      {
        method: 'GET', path: '/api/paper', auth: 'bearer',
        handler: (c) => {
          const paper = this.activePaper();
          if (!paper) { c.json(200, { error: 'NO_PAPER' }); return; }
          const sid = c.principal!.studentId;
          const student = this.store.listStudents().find((s) => s.id === sid);
          // 每人一份题序与选项顺序（说明书 11.2：5 名学生的试卷不得完全相同）。
          // 正确答案**不下发**：判分在教师机上做，学生设备上没有答案可看。
          // type 与 left 必须一起下发：配对题的词在 left 里，只给 options 的话学生看到的是
          // 「为下列词语选择正确释义：」后面空无一物；排序题同理，不知道题型就只能当单选渲染。
          //
          // dimension 也要带：同样是 type='match'，词汇配对（左边是词、右边是释义）和
          // 跨节理解（左边是整节经文、右边是单元）的操作提示完全不一样。实拍截图里
          // 「这些经文各属于哪个单元？」下面却写着「为每个词选出释义」，就是因为只看 type。
          /**
           * ⚠️ 必须走 pinned 版本：它在**发题这一刻**把该生的卷版本（题序 + 选项顺序）
           * 固化下来。原来用的是 questionsForStudent —— 没有变体时返回原卷，而变体要等
           * 老师点「5 名学生作答」或切语言时才由 simulate() 现建。于是学生先按原卷顺序答，
           * 之后变体一建，判分与重新发题都换成了另一套顺序：
           * 「我明明选的第 4 个，回头看变成第 1/2/3 个」，而且每题洗牌不同 ——
           * 用户报的「随机出现、选 4 会影响随机 1/2/3」就是这么来的。
           */
          const questions = this.store.questionsForStudentPinned(paper.id, sid).map((q) => ({
            id: q.id, type: q.type, dimension: q.dimension, stem: q.stem,
            options: q.options, left: q.left, sourceRefs: q.sourceRefs,
          }));
          c.json(200, {
            id: paper.id,
            title: paper.title,
            lang: this.activeLang,
            studentName: student ? (student.name[this.activeLang] || student.name.zh) : '',
            questions,
          });
        },
      },
      {
        method: 'POST', path: '/api/submit', auth: 'bearer',
        handler: async (c) => {
          const paper = this.activePaper();
          if (!paper) { c.json(200, { error: 'NO_PAPER' }); return; }
          const body = await c.body();
          if (String(body?.paperId || '') !== paper.id) { c.json(200, { error: 'STALE_PAPER' }); return; }
          const sid = c.principal!.studentId;
          // 判分同样走固化后的那一份，与学生看到的严格一致
          const mine = this.store.questionsForStudentPinned(paper.id, sid);
          const answers = (body?.answers && typeof body.answers === 'object') ? body.answers : {};
          // 逐题写回教师机的 store：教师端的薄弱点分析、强化教学、复测全部基于这份记录，
          // 学生在自己设备上答的题与「模拟 5 名学生」走的是同一条数据通路。
          let correct = 0;
          let skipped = 0;
          const wrong: Array<{ stem: string; explanation: string }> = [];
          for (const q of mine) {
            const raw = (answers as Record<string, unknown>)[q.id];
            // 排序题与配对题交上来的是下标数组，单选题是一个下标 —— 一律压成 number \| number[] \| null
            const picked = Array.isArray(raw)
              ? raw.map((n) => Number(n)).filter((n) => Number.isFinite(n))
              : (typeof raw === 'number' && Number.isFinite(raw) ? raw : null);
            // 判分交给 store（内部走 isCorrect，认得三种题型），这里不再自己比下标 ——
            // 自己比的那一版把数组答案一律当没作答，配对题永远算错。
            /**
             * ⚠️ 逐题容错 + 延迟落盘，两件事缺一不可：
             *  · 容错：教师在学生答题期间删题 / 重生成题目时，setAnswer 会抛
             *    QUESTION_NOT_FOUND。原来整个循环没有 try，抛出后被统一兜成 500，
             *    学生只看到「网络异常」，而抛错**之前**的几题已经逐题落盘 —— 半份卷子入库，
             *    重交时成绩口径混乱。现在跳过失效题并计数，其余照常判。
             *  · defer：save() 写的是整份 state，每题写一次会在多人同时交卷时卡死主进程。
             */
            let rec;
            try {
              rec = this.store.setAnswer(paper.id, sid, q.id, picked, { defer: true });
            } catch (err: any) {
              skipped += 1;
              this.logger?.warn?.('quran-teaching', i18nT('这道题已失效，交卷时跳过'), {
                studentId: sid, paperId: paper.id, questionId: q.id, err: String(err?.message || err),
              });
              continue;
            }
            if (rec.correct) correct += 1;
            else wrong.push({ stem: q.stem, explanation: q.explanation || '' });
          }
          // 整份卷子判完只落盘一次
          try { this.store.flush(); } catch (err: any) {
            this.logger?.warn?.('quran-teaching', i18nT('交卷落盘失败'), { studentId: sid, err: String(err?.message || err) });
          }
          this.logger?.info?.('quran-teaching', i18nT('学生已交卷'), { studentId: sid, paperId: paper.id, correct, total: mine.length, skipped });
          c.json(200, { correct, total: mine.length - skipped, wrong, ...(skipped ? { skipped } : {}) });
        },
      },
    ];
  }
}
