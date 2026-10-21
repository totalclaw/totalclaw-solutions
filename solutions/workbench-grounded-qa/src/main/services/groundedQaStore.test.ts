/**
 * 受控问答知识库：知识手册文件夹同步 + 多轮检索改写的边界。
 *
 * 钉四件事：
 *   1. 手册文件夹里的资料自动导入且默认已审批（审批面板默认收起，打开页面就要能问）；
 *   2. 重复进入页面不重复导入；早期手动导入的同名资料被认领、重复的只留一份，且不改用户的审批选择；
 *   3. 改写后的检索问题同样过禁区表 —— 阿语/英文提问改写成中文后撞禁区，照样拒答；
 *   4. 多轮时按改写问题检索，不拿追问原句蹭到的虚词命中作答。
 * mock 掉 accountScope（落临时目录），解析器用假实现（不起文档解析进程）。
 */
import { describe, it, expect, beforeEach, afterAll, vi } from 'vitest';
import * as fs from 'node:fs';
import * as path from 'node:path';
import * as os from 'node:os';

const TMP = path.join(os.tmpdir(), 'gqa-store-' + process.pid);

vi.mock('./accountScope', () => ({
  accountPath: (...sub: string[]) => path.join(TMP, 'account', ...sub),
}));

const { GroundedQaStore, findHandbookDir, PARSER_VERSION, needsOcr } = await import('./groundedQaStore');

const PAGES: Record<string, string> = {
  'basics.txt': '伊斯兰五功包括念功、礼拜、天课、斋戒和朝觐。念功是作证词，礼拜每日五次，这是新穆斯林首先要学的内容。',
  'wudu.txt': '小净的步骤依次为洗手、漱口、呛鼻、洗脸、洗手臂、抹头、洗脚。做小净之前要先举意，洗的时候从右边开始，每处洗三遍。',
};
const fakeExtract = async (file: string) => {
  const text = fs.readFileSync(file, 'utf8');
  return [{ n: 1, text }];
};

function makeHandbook(): string {
  const dir = path.join(TMP, 'Desktop', '演示', '宣教助手知识手册');
  fs.mkdirSync(dir, { recursive: true });
  for (const [name, text] of Object.entries(PAGES)) fs.writeFileSync(path.join(dir, name), text);
  fs.writeFileSync(path.join(dir, '.DS_Store'), 'x');
  fs.writeFileSync(path.join(dir, 'cover.png'), 'x');
  return dir;
}

beforeEach(() => { fs.rmSync(TMP, { recursive: true, force: true }); });
afterAll(() => { fs.rmSync(TMP, { recursive: true, force: true }); });

describe('知识手册文件夹', () => {
  it('在桌面或桌面下一层都能找到；找不到返回 null', () => {
    expect(findHandbookDir(path.join(TMP, 'Desktop'))).toBeNull();
    const dir = makeHandbook();
    expect(findHandbookDir(path.join(TMP, 'Desktop'))).toBe(dir);
  });

  it('自动导入支持的格式，默认已审批；再同步一次不重复导入', async () => {
    const dir = makeHandbook();
    const kb = new GroundedQaStore(fakeExtract);
    const first = await kb.syncFolder(dir);
    expect(first.map((d) => d.name).sort()).toEqual(['basics.txt', 'wudu.txt']);
    expect(kb.list().every((d) => d.approved)).toBe(true);
    expect(await kb.syncFolder(dir)).toEqual([]);
    expect(kb.list()).toHaveLength(2);
  });

  it('用户手动取消审批后，重新同步不会又被打开', async () => {
    const dir = makeHandbook();
    const kb = new GroundedQaStore(fakeExtract);
    await kb.syncFolder(dir);
    const wudu = kb.list().find((d) => d.name === 'wudu.txt')!;
    kb.setApproved(wudu.id, false);
    await new GroundedQaStore(fakeExtract).syncFolder(dir);
    expect(new GroundedQaStore(fakeExtract).list().find((d) => d.name === 'wudu.txt')!.approved).toBe(false);
  });

  it('早期手动导入的同名资料被认领，重复导入的只留一份（留已审批的那份）', async () => {
    const dir = makeHandbook();
    const kb = new GroundedQaStore(fakeExtract);
    const a = await kb.import(path.join(dir, 'wudu.txt'));
    const b = await kb.import(path.join(dir, 'wudu.txt'));
    kb.setApproved(a.id, true);
    expect(b.approved).toBe(false);
    await kb.syncFolder(dir);
    const wudus = kb.list().filter((d) => d.name === 'wudu.txt');
    expect(wudus).toHaveLength(1);
    expect(wudus[0].id).toBe(a.id);
    expect(wudus[0].approved).toBe(true);
  });
});

describe('解析器升级', () => {
  it('旧解析器导入的手册资料会按新解析器重导，审批状态沿用', async () => {
    const dir = makeHandbook();
    const kb = new GroundedQaStore(fakeExtract);
    await kb.syncFolder(dir);
    const wudu = kb.list().find((d) => d.name === 'wudu.txt')!;
    kb.setApproved(wudu.id, false);
    // 模拟旧版本导入的记录
    const file = path.join(TMP, 'account', 'grounded-qa', 'docs.json');
    const docs = JSON.parse(fs.readFileSync(file, 'utf8')).map((d: any) => ({ ...d, parser: undefined }));
    fs.writeFileSync(file, JSON.stringify(docs));
    const kb2 = new GroundedQaStore(fakeExtract);
    const re = await kb2.syncFolder(dir);
    expect(re).toHaveLength(2);
    expect(kb2.list().every((d) => d.parser === PARSER_VERSION)).toBe(true);
    expect(kb2.list().find((d) => d.name === 'wudu.txt')!.approved).toBe(false);
    expect(kb2.list().find((d) => d.name === 'basics.txt')!.approved).toBe(true);
  });

  it('PDF 走 OCR 合并：pypdf 抽不出的转曲正文由 OCR 补上', async () => {
    const dir = path.join(TMP, 'Desktop', '宣教助手知识手册');
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, 'book.pdf'), 'x');
    const kb = new GroundedQaStore(
      async () => [{ n: 1, text: 'RIGHTS OF MANKIND 46' }],
      async () => new Map([[1, '伊斯兰教中的女性。伊斯兰降示的年代，人类社会还没有承认女性的人道权利，伊斯兰把女性权利归还给了女人。']]),
    );
    await kb.syncFolder(dir);
    expect(kb.ask('伊斯兰教中女性有哪些权利？').answered).toBe(true);
  });
});

describe('多轮检索改写的边界', () => {
  async function ready() {
    const kb = new GroundedQaStore(fakeExtract);
    await kb.syncFolder(makeHandbook());
    return kb;
  }

  it('阿语提问原句检索不到，但改写成中文后能依据原文作答', async () => {
    const kb = await ready();
    const q = 'ما هي خطوات الوضوء؟';
    expect(kb.ask(q, { lang: 'ar' }).answered).toBe(false);
    const r = kb.ask(q, { lang: 'ar', searchQueries: ['小净的步骤是什么？', 'What are the steps of wudu?'] });
    expect(r.answered).toBe(true);
    expect(r.citations[0].docName).toBe('wudu.txt');
  });

  it('改写后的问题撞禁区照样拒答，不调模型', async () => {
    const kb = await ready();
    const r = kb.ask('هل يجب أن أطلق زوجتي الليلة؟', {
      lang: 'ar', searchQueries: ['今晚离婚该不该？', 'Should I divorce tonight?'],
    });
    expect(r.answered).toBe(false);
    expect(r.reason).toBe('out_of_scope');
    expect(r.prompt).toBeUndefined();
  });

  it('原问题本身撞禁区时，改写再干净也拒答', async () => {
    const kb = await ready();
    const r = kb.ask('这个算不算哈拉目？', { searchQueries: ['小净的步骤是什么？'] });
    expect(r.reason).toBe('out_of_scope');
  });

  it('改写后仍查不到依据 → 按资料不足拒答', async () => {
    const kb = await ready();
    const r = kb.ask('那量子力学呢？', {
      history: [{ question: '小净的步骤是什么？', answer: '洗手、漱口……' }],
      searchQueries: ['伊斯兰如何解释量子力学？', 'How does Islam explain quantum mechanics?'],
    });
    expect(r.answered).toBe(false);
    expect(r.reason).toBe('no_evidence');
  });

  it('多轮作答的提示词带历史，并注明改写后的完整问题', async () => {
    const kb = await ready();
    const r = kb.ask('那具体怎么做？', {
      history: [{ question: '什么是小净？', answer: '小净是礼拜前的洗涤。' }],
      searchQueries: ['小净的步骤是什么？'],
    });
    expect(r.answered).toBe(true);
    expect(r.prompt).toContain('小净是礼拜前的洗涤。');
    expect(r.prompt).toContain('小净的步骤是什么？');
    expect(r.citations[0].docName).toBe('wudu.txt');
  });
});

describe('换文件夹是替换，不是合并', () => {
  it('选新文件夹后旧资料被清空，只剩新目录里的', async () => {
    const dirA = makeHandbook();
    const kb = new GroundedQaStore(fakeExtract);
    await kb.syncFolder(dirA);
    expect(kb.list()).toHaveLength(2);

    const dirB = path.join(TMP, 'Desktop', '另一批资料');
    fs.mkdirSync(dirB, { recursive: true });
    fs.writeFileSync(path.join(dirB, 'other.txt'), '公司报销标准：市内交通实报实销，住宿按城市分级，出差补贴按天计算，所有票据需在月底前提交。');
    const imported = await kb.replaceFolder(dirB);

    expect(imported.map((d) => d.name)).toEqual(['other.txt']);
    expect(kb.list().map((d) => d.name)).toEqual(['other.txt']);
    expect(kb.getFolder()).toBe(dirB);
    // 旧资料的原件也要删掉，别在账号目录里越堆越多
    expect(fs.readdirSync(path.join(TMP, 'account', 'grounded-qa', 'files'))).toHaveLength(1);
  });

  it('换完文件夹后，示例问题跟着换成新资料里的', async () => {
    const kb = new GroundedQaStore(fakeExtract);
    await kb.syncFolder(makeHandbook());
    const before = kb.suggestions().filter((x) => x.inScope).map((x) => x.q);
    expect(before.length).toBeGreaterThan(0);
    expect(before.join(' ')).toMatch(/小净|五功|礼拜|天课/);

    const dirB = path.join(TMP, 'Desktop', '报销资料');
    fs.mkdirSync(dirB, { recursive: true });
    fs.writeFileSync(path.join(dirB, 'expense.txt'),
      '差旅报销：市内交通实报实销。住宿标准按城市分级。差旅补贴按天计算。报销流程需先提交申请单再附票据。住宿发票必须与行程一致。');
    await kb.replaceFolder(dirB);
    const after = kb.suggestions().filter((x) => x.inScope).map((x) => x.q);
    expect(after.join(' ')).not.toMatch(/小净|五功/);
  });
});

describe('OCR 只挑需要的页', () => {
  it('文本抽得好的页不进 OCR，抽不到或叠字的才进', async () => {
    expect(needsOcr('A'.repeat(500))).toBe(false);
    expect(needsOcr('短短一行')).toBe(true);
    expect(needsOcr('相相信信有有后后世世吗吗？？'.repeat(30))).toBe(true);
  });
});

describe('示例问题：4 个能答 + 1 个演示拒答', () => {
  it('最后一条一定是资料外的问题，且真的会被判无依据', async () => {
    const kb = new GroundedQaStore(fakeExtract);
    await kb.syncFolder(makeHandbook());
    const list = kb.suggestions('zh', 4);
    expect(list.length).toBeGreaterThan(1);
    const last = list[list.length - 1];
    expect(last.inScope).toBe(false);
    // 不能只靠「我们觉得它答不上」——按真实判定过一遍
    expect(kb.ask(last.q).answered).toBe(false);
    for (const s of list.slice(0, -1)) {
      expect(s.inScope).toBe(true);
      expect(kb.ask(s.q).answered).toBe(true);
    }
  });

  it('预取的答案挂在资料指纹上：审批一关立刻失效', async () => {
    const kb = new GroundedQaStore(fakeExtract);
    await kb.syncFolder(makeHandbook());
    const q = kb.suggestions('zh', 4)[0].q;
    kb.setCachedAnswer(q, { answered: true, answer: '缓存的答案', lang: 'zh', citations: [] });
    expect(kb.getCachedAnswer(q)?.answer).toBe('缓存的答案');

    const doc = kb.list()[0];
    kb.setApproved(doc.id, false);
    expect(kb.getCachedAnswer(q)).toBeNull();
  });
});
