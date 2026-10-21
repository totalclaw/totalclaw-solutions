#!/usr/bin/env node
// 为当前提交里的方案版本打不可变 tag：<id>@<version>（客户端按 tag 取历史版本文件）。
// 在 npm run release 并提交之后执行；已有同名 tag 的跳过（tag 永不移动）。工作区必须干净。
// 用法：node tools/tag-release.mjs [--dry-run]
import { execFileSync } from 'node:child_process';
import { REPO_ROOT, listSolutionDirs, parseArgs, readJson, SOLUTIONS_DIR } from './lib/common.mjs';
import { join } from 'node:path';

const args = parseArgs(process.argv.slice(2));
const git = (...a) => execFileSync('git', a, { cwd: REPO_ROOT, encoding: 'utf8' }).trim();
if (git('status', '--porcelain')) {
  console.error('✗ 工作区有未提交的改动：先提交 npm run release 的产物再打 tag');
  process.exit(1);
}
const existing = new Set(git('tag', '--list').split('\n').filter(Boolean));
const created = [];
for (const id of listSolutionDirs()) {
  const m = readJson(join(SOLUTIONS_DIR, id, 'solution.json'));
  const tag = `${id}@${m.version}`;
  if (existing.has(tag)) continue;
  if (!args['dry-run']) git('tag', '-a', tag, '-m', `${m.name} ${m.version}`);
  created.push(tag);
}
console.log(created.length ? `✓ ${args['dry-run'] ? '将创建' : '已创建'} ${created.length} 个 tag：${created.join(' ')}` : '· 没有需要新建的 tag');
