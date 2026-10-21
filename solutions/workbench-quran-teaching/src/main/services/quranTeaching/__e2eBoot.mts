/**
 * 端到端验证用：起一台真的古兰经学生端局域网服务（走产品代码，不是桩）。
 *
 * 用法：npx vite-node apps/desktop-shell/src/main/services/quranTeaching/__e2eBoot.mts
 * 打印出 URL / 班级码 / 学生名单 / 试卷题型，然后常驻，供浏览器驱动作答。
 * 这个文件只服务于人工与自动化验收，不进产品链路（文件名带 __ 前缀，不被任何模块 import）。
 */
import { mkdtempSync, existsSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { QuranTeachingStore } from './store';
import { QuranLanService } from './lan';

const here = dirname(fileURLToPath(import.meta.url));
const CORPUS = join(here, '..', '..', '..', '..', '..', '..', 'resources', 'quran-demo-corpus');

const dir = mkdtempSync(join(tmpdir(), 'quran-e2e-'));
const store = new QuranTeachingStore({ dataDir: dir, bundledCorpusDir: CORPUS, llmReady: () => false });
const svc = new QuranLanService(store, {
  info: (...a: unknown[]) => console.log('[info]', ...a),
  warn: (...a: unknown[]) => console.log('[warn]', ...a),
  error: (...a: unknown[]) => console.log('[error]', ...a),
} as never);

const st = await svc.start();
// 多来几题，保证单选 / 排序 / 配对都出得来 —— 用户报的是「题之间互相影响」
const { paper } = store.generatePaper({ chapter: 103, lang: 'zh', count: 8 });
svc.setActivePaper(paper.id, 'zh');
svc.setActiveLesson({ chapter: paper.chapter, from: paper.from, to: paper.to }, 'zh');

console.log('READY', JSON.stringify({
  url: st.url,
  port: st.port,
  classCode: svc.classCode,
  paperId: paper.id,
  statusPaperId: svc.status().paperId,
  students: store.listStudents().map((s) => ({ id: s.id, name: s.name.zh })),
  questions: paper.questions.map((q) => ({ id: q.id, type: q.type, stem: q.stem.slice(0, 18) })),
  dataDir: dir,
}));

/**
 * 控制文件：外部驱动脚本往 <dataDir>/__simulate 写一下，这边就跑一次 store.simulate()，
 * 用来复现用户那个触发条件 —— 学生已经拿到卷之后，老师在教师端点了「5 名学生作答」。
 */
const TRIGGER = join(dir, '__simulate');
setInterval(() => {
  if (!existsSync(TRIGGER)) return;
  rmSync(TRIGGER, { force: true });
  try {
    store.simulate(paper.id);
    console.log('SIMULATED', JSON.stringify({
      variants: (store.paper(paper.id).variants || []).map((v) => ({ s: v.studentId, sig: v.signature.slice(0, 6) })),
    }));
  } catch (e) { console.log('SIMULATE_ERR', String(e)); }
}, 300);

setInterval(() => {
  const recs = store.records(paper.id).filter((r) => r.origin === 'edited');
  if (recs.length) {
    console.log('RECORDS', JSON.stringify(recs.map((r) => ({ q: r.questionId, s: r.studentId, a: r.answer, ok: r.correct }))));
  }
}, 5000);
