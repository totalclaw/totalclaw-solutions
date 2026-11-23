/**
 * eduHubProc —— AI Learning Hub 内网 Web 服务的**路由表**。
 *
 * 架构决策 D1/D3（docs/ai-learning-hub-requirements.md）：教师打开解决方案即启动，
 * 学生浏览器访问 http://<教师机IP>:<port>；学生端所有请求经本服务、数据不出教师机。
 *
 * 绑定 / 端口探测 / 单页 gzip+ETag / Range 文件 / 请求体限长 / 退出登记这些与业务无关的
 * 部分已抽到 `lanServer.ts`（古兰经教学平台复用同一套底座）。这里只剩「这条路由该调 store 的哪个方法」。
 */
import type { Logger } from '@totalclaw/logger';
import type { EduHubStatus } from '@totalclaw/ipc-contracts';
import { t as i18nT } from '@totalclaw/i18n';
import { EduHubStore } from './eduHubStore';
import { STUDENT_PAGE_HTML } from './eduHubStudentPage';
import { LanServer, RateBucket, lanIp, type LanRoute } from './lanServer';

export { lanIp };

/** 班级码 / 学习码这类短码离线可暴破：10 次/分钟即锁 60 秒 */
const JOIN_FAIL_LIMIT = 10;
const JOIN_LOCK_MS = 60_000;

type Student = ReturnType<EduHubStore['authStudent']>;

export class EduHubProc {
  private lan: LanServer<NonNullable<Student>>;

  constructor(private store: EduHubStore, private logger?: Logger) {
    const joinFails = new RateBucket(JOIN_FAIL_LIMIT, JOIN_LOCK_MS);
    this.lan = new LanServer<NonNullable<Student>>({
      name: 'edu-hub',
      pageHtml: STUDENT_PAGE_HTML,
      logger,
      auth: (token) => store.authStudent(token),
      onStop: () => store.flushStudents(),
      routes: this.routes(joinFails),
    });
  }

  status(): EduHubStatus {
    return {
      running: this.lan.running,
      port: this.lan.port,
      url: this.lan.url,
      classCode: this.store.classCode,
      onlineStudents: this.store.onlineCount(),
      totalStudents: this.store.studentCount(),
    };
  }

  async start(): Promise<EduHubStatus> {
    await this.lan.start();
    return this.status();
  }

  async stop(): Promise<void> {
    await this.lan.stop();
  }

  private routes(joinFails: RateBucket): LanRoute<NonNullable<Student>>[] {
    const s = this.store;
    return [
      { method: 'GET', path: '/api/ping', auth: 'none', handler: (c) => c.json(200, { ok: true }) },

      {
        method: 'POST', path: '/api/join', auth: 'none',
        handler: async (c) => {
          if (joinFails.locked(c.clientIp)) { c.json(429, { error: 'TOO_MANY' }); return; }
          const body = await c.body();
          try {
            const r = s.joinStudent(String(body?.code || ''), String(body?.studentNo || ''), String(body?.name || ''));
            joinFails.pass(c.clientIp);
            c.json(200, r);
          } catch (e: any) {
            const msg = e?.message;
            const code = msg === 'BAD_CODE' ? 'BAD_CODE' : msg === 'CLASS_FULL' ? 'CLASS_FULL'
              : msg === 'BAD_NO' ? 'BAD_NO' : msg === 'BAD_MATCH' ? 'BAD_MATCH' : 'BAD_NAME';
            // 只有班级码错才计入暴破计数：学号 / 姓名对不上是本班学生自己输错，不该把他锁在门外
            if (code === 'BAD_CODE' && joinFails.fail(c.clientIp)) {
              this.logger?.warn?.('edu-hub', i18nT('班级码尝试过于频繁，已临时限流'), { ip: c.clientIp });
            }
            c.json(200, { error: code });
          }
        },
      },
      {
        // 学习码接续：凭 班级码 + 学习码 找回既有档案。与 join 同一个限流桶（防枚举学习码）
        method: 'POST', path: '/api/resume', auth: 'none',
        handler: async (c) => {
          if (joinFails.locked(c.clientIp)) { c.json(429, { error: 'TOO_MANY' }); return; }
          const body = await c.body();
          try {
            const r = s.resumeStudent(String(body?.code || ''), String(body?.learningCode || ''));
            joinFails.pass(c.clientIp);
            c.json(200, r);
          } catch (e: any) {
            const code = e?.message === 'BAD_CODE' ? 'BAD_CODE' : 'NOT_FOUND';
            if (joinFails.fail(c.clientIp)) {
              this.logger?.warn?.('edu-hub', i18nT('接续尝试过于频繁，已临时限流'), { ip: c.clientIp });
            }
            c.json(200, { error: code });
          }
        },
      },

      // 数字人成片 / 音频总结：<video> 与 <audio> 不带 Authorization 头，走 ?t=<token>。
      // 成片是本机文件，只发给持有效学生 token 的请求（校内网，成片不出机）。
      {
        method: 'GET', path: /^\/media\/([\w-]+)\/(\d+)\.mp4$/, auth: 'query',
        handler: (c) => c.serveFile(s.avatarVideoPath(c.params[0], Number(c.params[1])), 'video/mp4'),
      },
      {
        method: 'GET', path: /^\/audio\/([\w-]+)\.mp3$/, auth: 'query',
        handler: (c) => c.serveFile(s.audioPath(c.params[0]), 'audio/mpeg'),
      },

      { method: 'GET', path: '/api/home', auth: 'bearer', handler: (c) => c.json(200, s.homeForStudent(c.principal!.id)) },
      { method: 'GET', path: '/api/lessons', auth: 'bearer', handler: (c) => c.json(200, s.publishedLessonsForStudent(c.principal!.id)) },
      {
        method: 'GET', path: /^\/api\/lessons\/([\w-]+)$/, auth: 'bearer',
        handler: (c) => {
          const lesson = s.lessonForStudent(c.params[0], c.principal!.id);
          c.json(lesson ? 200 : 404, lesson ?? { error: 'NOT_FOUND' });
        },
      },
      {
        method: 'POST', path: /^\/api\/lessons\/([\w-]+)\/submit$/, auth: 'bearer',
        handler: async (c) => {
          const body = await c.body();
          const answers = Array.isArray(body?.answers) ? body.answers.map((n: unknown) => Number(n)) : [];
          try { c.json(200, s.submitQuiz(c.principal!.id, c.params[0], answers)); }
          catch { c.json(404, { error: 'NOT_FOUND' }); }
        },
      },
      {
        // 受限问答：答案严格锚定本课内容，超范围拒答（store 侧限流 / 题长 / 防注入）
        method: 'POST', path: /^\/api\/lessons\/([\w-]+)\/ask$/, auth: 'bearer',
        handler: async (c) => {
          const body = await c.body();
          try { c.json(200, await s.answerQuestion(c.params[0], c.principal!.id, String(body?.q || ''))); }
          catch (e: any) {
            const code = e?.message;
            const status = code === 'TOO_MANY' ? 429 : code === 'NOT_FOUND' ? 404 : 200;
            c.json(status, { error: code === 'TOO_MANY' || code === 'NOT_FOUND' || code === 'EMPTY' || code === 'LLM' ? code : 'INTERNAL' });
          }
        },
      },

      // ── 学习卡③ / 复习计划⑦ ──
      {
        method: 'GET', path: /^\/api\/lessons\/([\w-]+)\/cards$/, auth: 'bearer',
        handler: (c) => c.json(200, s.cardsForLesson(c.principal!.id, c.params[0])),
      },
      { method: 'GET', path: '/api/review', auth: 'bearer', handler: (c) => c.json(200, s.dueCards(c.principal!.id, 40)) },
      {
        method: 'POST', path: '/api/cards/rate', auth: 'bearer',
        handler: async (c) => {
          const body = await c.body();
          const rating = String(body?.rating || '');
          if (rating !== 'unknown' && rating !== 'fuzzy' && rating !== 'known') { c.json(200, { error: 'BAD_RATING' }); return; }
          try { c.json(200, s.rateCard(c.principal!.id, String(body?.cardId || ''), rating)); }
          catch (e: any) {
            const code = e?.message === 'FORBIDDEN' ? 403 : 404;
            c.json(code, { error: code === 403 ? 'FORBIDDEN' : 'NOT_FOUND' });
          }
        },
      },

      // ── 知识导图节点掌握② ──
      {
        method: 'POST', path: /^\/api\/lessons\/([\w-]+)\/node$/, auth: 'bearer',
        handler: async (c) => {
          const body = await c.body();
          const state = String(body?.state || '');
          if (state !== 'known' && state !== 'weak') { c.json(200, { error: 'BAD_STATE' }); return; }
          try { s.markNode(c.principal!.id, c.params[0], Number(body?.node) || 0, state); c.json(200, { ok: true }); }
          catch { c.json(404, { error: 'NOT_FOUND' }); }
        },
      },

      // ── 模拟测试④·练习模式（可重考，错题自动成卡）──
      {
        method: 'POST', path: /^\/api\/lessons\/([\w-]+)\/practice$/, auth: 'bearer',
        handler: async (c) => {
          const body = await c.body();
          const answers = Array.isArray(body?.answers) ? body.answers.map((n: unknown) => Number(n)) : [];
          try { c.json(200, s.practiceQuiz(c.principal!.id, c.params[0], String(body?.mode || 'chapter'), answers)); }
          catch (e: any) {
            const code = e?.message === 'NOT_SUBMITTED' ? 403 : 404;
            c.json(code, { error: code === 403 ? 'NOT_SUBMITTED' : 'NOT_FOUND' });
          }
        },
      },

      // ── 个人笔记 / 学习记忆⑥ ──
      {
        method: 'POST', path: /^\/api\/lessons\/([\w-]+)\/note$/, auth: 'bearer',
        handler: async (c) => {
          const body = await c.body();
          try { c.json(200, s.addNote(c.principal!.id, c.params[0], Number(body?.section) || 0, String(body?.text || ''))); }
          catch (e: any) { c.json(e?.message === 'EMPTY' ? 200 : 404, { error: e?.message === 'EMPTY' ? 'EMPTY' : 'NOT_FOUND' }); }
        },
      },
      {
        method: 'POST', path: /^\/api\/notes\/([\w-]+)\/delete$/, auth: 'bearer',
        handler: (c) => { s.deleteNote(c.principal!.id, c.params[0]); c.json(200, { ok: true }); },
      },
      { method: 'GET', path: '/api/memory', auth: 'bearer', handler: (c) => c.json(200, s.memoryTimeline(c.principal!.id, 60)) },
    ];
  }
}
