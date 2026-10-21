/**
 * 教案生成：内容不完整要自动重采，不能一次就判失败。
 *
 * 客户实测反复撞上的现象：同一份资料、同一套参数，第一次报「生成结果缺少必要字段」，
 * 手点一下重试就成功 —— 模型这一次采样内容偏薄而已，不是资料或参数有问题。
 *
 * 注意这和已有的 retryAsStrictJson 是两回事：那个只在 JSON 解析抛异常时触发；
 * 这里 JSON 完全合法，只是目标/小测/正文缺斤少两，以前这条分支一次就判死。
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { mkdtempSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';

let root = '';
vi.mock('./accountScope', () => ({
  accountPath: (...sub: string[]) => join(root, ...sub),
  privateRoot: () => root,
  onAccountKeyChange: () => {},
}));
vi.mock('electron', () => ({ app: { getPath: () => root, getVersion: () => '0.0.0' } }));

beforeEach(() => { root = mkdtempSync(join(tmpdir(), 'eduhub-gen-')); vi.resetModules(); });
afterEach(() => { try { rmSync(root, { recursive: true, force: true }); } catch { /* */ } });

/** 一份内容齐全的模型输出（哨兵分隔：小 JSON + 裸 HTML）。 */
function goodOutput(): string {
  // 结构必须和 normalizeLesson 读的一致：目标在 plan 下，不是顶层
  const meta = {
    plan: {
      title: '电气测试实务',
      objectives: ['认识万用表', '掌握安全规范'],
      keyPoints: ['量程选择'],
      schedule: [{ phase: '导入', minutes: 45, activity: '演示' }],
    },
    studentDigest: ['要点一'],
    quiz: Array.from({ length: 6 }, (_, i) => ({ q: `题${i}`, options: ['A', 'B', 'C', 'D'], answer: 0, explain: '因为', sourcePage: 1 })),
    sections: [{ title: '第一节', intro: '导语', bullets: ['要点'], sourcePage: 1 }],
  };
  return '### LESSON_META ###\n' + JSON.stringify(meta)
    + '\n### LESSON_HTML ###\n' + '<h1>电气测试实务</h1>' + '<p>正文</p>'.repeat(40) + '\n### END ###';
}
/** 合法 JSON，但目标和小测都是空的 —— 就是线上那种“薄”输出。 */
function thinOutput(): string {
  const meta = { plan: { title: '电气测试实务', objectives: [], schedule: [] }, studentDigest: [], quiz: [], sections: [] };
  return '### LESSON_META ###\n' + JSON.stringify(meta) + '\n### LESSON_HTML ###\n### END ###';
}

async function storeWith(outputs: string[]) {
  const calls: string[] = [];
  const { EduHubStore } = await import('./eduHubStore');
  const s = new EduHubStore({
    llm: async (prompt: string) => { calls.push(prompt); return outputs[Math.min(calls.length - 1, outputs.length - 1)]; },
  });
  (s as any).materials = [{ id: 'M1', name: 'x.docx', ext: '.docx', pages: 2, chars: 500, status: 'ready', importedAt: 1 }];
  const { mkdirSync, writeFileSync } = await import('node:fs');
  mkdirSync(join(root, 'edu-hub', 'materials'), { recursive: true });
  writeFileSync(join(root, 'edu-hub', 'materials', 'M1.pages.json'),
    JSON.stringify([{ page: 1, text: '万用表用于测量电压电流。'.repeat(30) }, { page: 2, text: '安全规范要求断电操作。'.repeat(30) }]));
  return { s, calls };
}

/** 等到该教案不再是 generating。 */
async function settle(s: any, id: string, ms = 8000) {
  const end = Date.now() + ms;
  while (Date.now() < end) {
    const l = s.getLesson(id);
    if (l && l.status !== 'generating') return l;
    await new Promise((r) => setTimeout(r, 20));
  }
  return s.getLesson(id);
}

/**
 * 被输出长度上限砍断且**修不回来**的 JSON。
 *
 * 挑样本要小心：extractJson 会主动补齐括号和引号救回截断输出（有意为之的能力，实测
 * 连 `{"plan":{"a":[{"b":["c` 这种都能救）。只有断在**键名中间**救不回来，
 * 真实事故（客户机 20878 字那次）就是这一类，报错里明确写着「多半是输出被长度上限截断」。
 */
function truncatedOutput(): string {
  return '### LESSON_META ###\n{"plan":{"title":"电气测试实务","objectives":["认识万用表"],"sched';
}

describe('输出被截断时也要自动重采', () => {
  it('第一轮被截断、第二轮正常 → 最终成功', async () => {
    const { s, calls } = await storeWith([truncatedOutput(), goodOutput()]);
    const lesson = s.generateLesson('M1', { grade: '中职/高职', durationMinutes: 45 });
    const done = await settle(s, lesson.id, 15000);
    expect(done.status).toBe('draft');
    // 截断那轮会先试一次「重排成合法 JSON」，修不回来才重采，所以调用次数 >= 2
    expect(calls.length).toBeGreaterThanOrEqual(2);
  });

  it('截断后的重采要求写短，而不是原样再问一遍', async () => {
    // 第一轮截断；修格式那次也给截断的（修不回来），逼出真正的第二轮重采
    const { s, calls } = await storeWith([truncatedOutput(), truncatedOutput(), goodOutput()]);
    const lesson = s.generateLesson('M1', { grade: '中职/高职', durationMinutes: 45 });
    const done = await settle(s, lesson.id, 15000);
    expect(done.status).toBe('draft');
    // 重采那一轮必须告诉模型「上一轮被截断了，写短点」，否则等于原样再问一遍
    expect(calls.some((c) => c.includes('被长度上限截断') && c.includes('压缩篇幅'))).toBe(true);
  });

  it('三轮都被截断 → 报的是截断真因，不是「缺少必要内容」', async () => {
    const { s } = await storeWith([truncatedOutput()]);
    const lesson = s.generateLesson('M1', { grade: '中职/高职', durationMinutes: 45 });
    const done = await settle(s, lesson.id, 20000);
    expect(done.status).toBe('failed');
    // 真因带着可照做的指导（换快速模式 / 换输出上限更高的模型），比泛泛的缺字段有用
    expect(done.error).toContain('截断');
    expect(done.error).not.toContain('生成结果缺少');
  });
});

describe('内容不完整时自动重采', () => {
  it('第一轮薄、第二轮齐 → 最终成功，用户看不到失败', async () => {
    const { s, calls } = await storeWith([thinOutput(), goodOutput()]);
    const lesson = s.generateLesson('M1', { grade: '中职/高职', durationMinutes: 45 });
    const done = await settle(s, lesson.id);
    expect(done.status).toBe('draft');
    expect(calls.length).toBe(2);
    // 第二轮必须把缺了什么点名塞回提示词，否则等于原样再问一遍
    expect(calls[1]).toContain('上一轮的输出缺少');
    expect(calls[1]).toContain('教学目标');
  });

  it('第一轮就齐 → 只调一次模型，成功路径一分 token 不多花', async () => {
    const { s, calls } = await storeWith([goodOutput()]);
    const lesson = s.generateLesson('M1', { grade: '中职/高职', durationMinutes: 45 });
    const done = await settle(s, lesson.id);
    expect(done.status).toBe('draft');
    expect(calls.length).toBe(1);
    expect(calls[0]).not.toContain('上一轮的输出缺少');
  });

  it('三轮都薄 → 判失败，且报错点名缺了什么，不再让人对着「缺少必要字段」猜', async () => {
    const { s, calls } = await storeWith([thinOutput()]);
    const lesson = s.generateLesson('M1', { grade: '中职/高职', durationMinutes: 45 });
    const done = await settle(s, lesson.id, 15000);
    expect(done.status).toBe('failed');
    expect(calls.length).toBe(3); // 重试有上限，不会无限烧 token
    expect(done.error).toContain('教学目标');
    expect(done.error).toContain('课堂小测');
  });

  it('成功后写了缓存，同参数再生成不再调模型', async () => {
    const { s, calls } = await storeWith([goodOutput()]);
    const first = s.generateLesson('M1', { grade: '中职/高职', durationMinutes: 45 });
    await settle(s, first.id);
    const before = calls.length;
    const second = s.generateLesson('M1', { grade: '中职/高职', durationMinutes: 45 });
    const done = await settle(s, second.id);
    expect(done.status).toBe('draft');
    expect(calls.length).toBe(before);
  });

  it('失败的那次不写缓存 —— 否则该资料会被永久锁死在秒级失败上', async () => {
    const { s } = await storeWith([thinOutput()]);
    const first = s.generateLesson('M1', { grade: '中职/高职', durationMinutes: 45 });
    await settle(s, first.id, 15000);
    const { existsSync, readdirSync } = await import('node:fs');
    const dir = join(root, 'edu-hub', 'gen-cache');
    expect(!existsSync(dir) || readdirSync(dir).length === 0).toBe(true);
  });
});
