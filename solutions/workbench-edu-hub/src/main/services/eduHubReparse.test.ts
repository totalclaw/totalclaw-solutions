/**
 * 「解析失败」的就地重试。
 *
 * 客户截图里同一份 docx 出现了三条：因为 `status='parsing'` 的记录在应用重启时会被
 * 收敛成 failed（load() 里那段「不留永久转圈」），而失败后以前只能回文件选择框重导一遍。
 * 这类失败**文件本身完全没问题**，应该能就地重跑。
 *
 * 跑真实文件读写（临时账号目录），不 mock —— 这里最容易错的是「拿本地副本当源」时
 * copyFile 同路径把文件截成 0 字节，只有真跑一遍才看得出来。
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { mkdtempSync, rmSync, existsSync, readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';

let root = '';
vi.mock('./accountScope', () => ({
  accountPath: (...sub: string[]) => join(root, ...sub),
  privateRoot: () => root,
  onAccountKeyChange: () => {},
}));
vi.mock('electron', () => ({ app: { getPath: () => root, getVersion: () => '0.0.0' } }));

async function freshStore() {
  const { EduHubStore } = await import('./eduHubStore');
  return new EduHubStore({ llm: async () => '{}' });
}

/** 直接在盘上摆一条「上次进程中断」留下的记录 + 它的本地副本。 */
function seedInterrupted(dir: string, id = 'abc12345', ext = '.txt', body = '第一课 电气测量入门') {
  mkdirSync(join(dir, 'edu-hub', 'materials'), { recursive: true });
  writeFileSync(join(dir, 'edu-hub', 'materials', `${id}${ext}`), body, 'utf-8');
  writeFileSync(join(dir, 'edu-hub', 'materials.json'), JSON.stringify([
    { id, name: `讲义${ext}`, ext, pages: 0, chars: 0, status: 'parsing', importedAt: Date.now() },
  ]), 'utf-8');
  return id;
}

describe('资料解析失败后的就地重试', () => {
  beforeEach(() => { root = mkdtempSync(join(tmpdir(), 'eduhub-reparse-')); });
  afterEach(() => { rmSync(root, { recursive: true, force: true }); vi.resetModules(); });

  it('重启会把中断的 parsing 收敛成 failed —— 这正是客户看到的「解析失败」', async () => {
    const id = seedInterrupted(root);
    const s = await freshStore();
    const m = s.listMaterials().find((x) => x.id === id)!;
    expect(m.status).toBe('failed');
    // 原因必须留下来，否则界面只能显示干巴巴三个字
    expect(m.error).toBeTruthy();
  });

  it('重跑解析能把它救回 ready，且本地副本内容分毫不动（同路径 copyFile 会截成 0 字节）', async () => {
    const body = '第一课 电气测量入门：万用表与钳形表的安全使用';
    const id = seedInterrupted(root, 'def67890', '.txt', body);
    const copy = join(root, 'edu-hub', 'materials', `${id}.txt`);
    const s = await freshStore();
    expect(s.listMaterials().find((x) => x.id === id)!.status).toBe('failed');

    const after = await s.reparseMaterial(id);
    // txt 走纯文本分支，不依赖 agent python，所以这里能真跑出结果
    expect(after.status).toBe('ready');
    expect(after.chars).toBeGreaterThan(0);
    expect(after.error).toBeUndefined();
    // 关键：副本还在，而且没被截断
    expect(existsSync(copy)).toBe(true);
    expect(readFileSync(copy, 'utf-8')).toBe(body);
  });

  it('本地副本丢了要明确报错，指引重新导入，而不是静默失败', async () => {
    const id = seedInterrupted(root, 'aaa11111');
    rmSync(join(root, 'edu-hub', 'materials', `${id}.txt`), { force: true });
    const s = await freshStore();
    await expect(s.reparseMaterial(id)).rejects.toThrow(/副本已丢失|重新导入/);
  });

  it('资料已被删除时报错，不会凭空造一条记录', async () => {
    const s = await freshStore();
    await expect(s.reparseMaterial('nope0000')).rejects.toThrow(/找不到|已被删除/);
  });

  it('正在解析中时重复点是幂等的，不会并发跑两个解析进程', async () => {
    const id = seedInterrupted(root, 'bbb22222');
    const s = await freshStore();
    const mats = s.listMaterials();
    mats.find((x) => x.id === id)!.status = 'parsing';
    const same = await s.reparseMaterial(id);
    expect(same.status).toBe('parsing');
  });
});
