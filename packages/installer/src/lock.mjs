// installed.json（锁文件）与目录锁。
//
// 并发模型：同一进程内用 promise 链串行；跨进程用 `<root>/.lock` 目录锁（mkdir 原子），
// 超过 staleMs 视为上次进程崩溃留下的残锁，自动接管。
import { mkdirSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { readJsonFile, writeJsonAtomic } from './fsutil.mjs';

export const LOCK_SCHEMA = 1;

export function emptyLock() {
  return { schemaVersion: LOCK_SCHEMA, items: {}, tombstones: {} };
}

export function readLock(root) {
  const lock = readJsonFile(join(root, 'installed.json'), null) || emptyLock();
  lock.items ||= {};
  lock.tombstones ||= {};
  return lock;
}

export function writeLock(root, lock) {
  writeJsonAtomic(join(root, 'installed.json'), lock);
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

export class DirLock {
  constructor(root, { staleMs = 10 * 60_000, waitMs = 30_000 } = {}) {
    this.dir = join(root, '.lock');
    this.staleMs = staleMs;
    this.waitMs = waitMs;
    this.chain = Promise.resolve();
  }

  async acquire() {
    const deadline = Date.now() + this.waitMs;
    for (;;) {
      try {
        mkdirSync(this.dir);
        writeFileSync(join(this.dir, 'owner.json'), JSON.stringify({ pid: process.pid, at: Date.now() }));
        return;
      } catch (err) {
        if (err.code !== 'EEXIST') throw err;
        let age = 0;
        try {
          age = Date.now() - statSync(this.dir).mtimeMs;
          const owner = JSON.parse(readFileSync(join(this.dir, 'owner.json'), 'utf8'));
          if (owner.pid === process.pid) age = Infinity; // 本进程残留（上次异常退出前未释放）
        } catch {
          /* owner.json 还没写完 */
        }
        if (age > this.staleMs) {
          rmSync(this.dir, { recursive: true, force: true });
          continue;
        }
        if (Date.now() > deadline) throw new Error(`安装目录被其他进程占用：${this.dir}`);
        await sleep(200);
      }
    }
  }

  release() {
    rmSync(this.dir, { recursive: true, force: true });
  }

  /** 串行执行 fn：进程内排队 + 跨进程目录锁 */
  run(fn) {
    const next = this.chain.then(async () => {
      await this.acquire();
      try {
        return await fn();
      } finally {
        this.release();
      }
    });
    this.chain = next.catch(() => {});
    return next;
  }
}
