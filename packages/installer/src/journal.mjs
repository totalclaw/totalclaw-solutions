// 发布日志：安装 / 升级的「切换」阶段先落日志，崩溃后启动时据此收尾。
//
//   pending   → 代码目录可能已 rename 到位，但 installed.json 还没切换：删除新目录（若不是别人在用），锁保持原样
//   committed → installed.json 已切换：只需清理 .trash
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { readJsonFile, rmrf, writeJsonAtomic } from './fsutil.mjs';
import { readLock } from './lock.mjs';

const FILE = '.journal.json';

export function beginJournal(root, entry) {
  writeJsonAtomic(join(root, FILE), { state: 'pending', at: new Date().toISOString(), ...entry });
}

export function commitJournal(root) {
  const j = readJsonFile(join(root, FILE), null);
  if (j) writeJsonAtomic(join(root, FILE), { ...j, state: 'committed' });
}

export function clearJournal(root) {
  rmrf(join(root, FILE));
}

/** 启动恢复；返回执行的动作描述（无事可做返回 null） */
export function recoverJournal(root) {
  const j = readJsonFile(join(root, FILE), null);
  rmrf(join(root, '.staging'));
  if (!j) return null;
  let action = 'cleanup';
  if (j.state === 'pending' && j.target) {
    const lock = readLock(root);
    const inUse = Object.values(lock.items).some(
      (it) => join(root, it.activePath) === j.target || (it.previous && join(root, it.previous.path) === j.target),
    );
    if (!inUse && existsSync(j.target)) {
      rmrf(j.target);
      action = 'rollback';
    }
  }
  rmrf(join(root, '.trash'));
  clearJournal(root);
  return { action, journal: j };
}
