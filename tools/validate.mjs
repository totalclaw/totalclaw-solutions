#!/usr/bin/env node
// 方案仓库校验（PR / 发布前必须通过）。
//
// 用法：node tools/validate.mjs [--since <git-ref>] [--web <totalclaw-web 根目录>] [--json]
//   --since  对比该 ref：方案文件有变化但版本未提升 → 失败；版本只能递增
//   --web    直接读取 totalclaw-web 的 solution-catalog.ts 对账（默认用 registry/web-solution-ids.json 快照）
import { execFileSync } from 'node:child_process';
import { existsSync, lstatSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import * as semver from '../packages/installer/src/semver.mjs';
import { changelogSection } from './build-index.mjs';
import { ID_RE, MAX_FILE_BYTES, REPO_ROOT, SOLUTIONS_DIR, listSolutionDirs, parseArgs, readJson, walkFiles } from './lib/common.mjs';

const args = parseArgs(process.argv.slice(2));
const errors = [];
const warnings = [];
const err = (id, msg) => errors.push(`[${id}] ${msg}`);
const warn = (id, msg) => warnings.push(`[${id}] ${msg}`);

const KINDS = new Set(['workbench', 'runner', 'pipeline', 'kit']);
const RUNTIME_MODES = new Set(['bundled', 'dynamic']);
/** 宿主公共数据：任何方案都不得声明为自己的数据（卸载清数据时会误删） */
const HOST_DATA_ROOTS = new Set(['', '.', 'memory', 'conversations', 'totalclaw-agent', 'knowledge', 'workspaces', 'solutions', 'solution-packages', 'connectors', '.solution-data', '.solution-backups']);

function webIds() {
  if (args.web) {
    const file = join(args.web, 'server', 'user-info-api', 'backend', 'src', 'admin', 'solution-catalog.ts');
    const text = readFileSync(file, 'utf8');
    const block = text.slice(text.indexOf('ADMIN_SOLUTION_CATALOG'), text.indexOf('ADMIN_SOLUTION_IDS'));
    return new Set([...block.matchAll(/\bid:\s*'([^']+)'/g)].map((m) => m[1]));
  }
  return new Set(readJson(join(REPO_ROOT, 'registry', 'web-solution-ids.json')).items.map((it) => it.id));
}

function gitShow(ref, path) {
  try {
    return execFileSync('git', ['show', `${ref}:${path}`], { cwd: REPO_ROOT, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] });
  } catch {
    return null;
  }
}

function changedSolutions(ref) {
  const out = execFileSync('git', ['diff', '--name-only', ref, '--', 'solutions'], { cwd: REPO_ROOT, encoding: 'utf8' });
  const untracked = execFileSync('git', ['ls-files', '--others', '--exclude-standard', '--', 'solutions'], { cwd: REPO_ROOT, encoding: 'utf8' });
  return new Set(
    `${out}\n${untracked}`
      .split('\n')
      .filter(Boolean)
      .map((p) => p.split('/')[1]),
  );
}

const ids = listSolutionDirs();
const known = new Set(ids);
const manifests = new Map();
const names = new Map();
const web = webIds();

for (const id of ids) {
  const dir = join(SOLUTIONS_DIR, id);
  let m;
  try {
    m = readJson(join(dir, 'solution.json'));
  } catch (e) {
    err(id, `solution.json 无法解析：${e.message}`);
    continue;
  }
  manifests.set(id, m);

  // 基本字段
  if (m.manifestVersion !== 2) err(id, 'manifestVersion 必须为 2');
  if (m.schemaVersion !== 1) err(id, 'schemaVersion 必须保持 1（旧版 qiye-app SolutionRunView 以它判断 runner 兼容性）');
  if (!ID_RE.test(m.id || '')) err(id, `id 不合法：${m.id}`);
  if (m.id !== id) err(id, `id(${m.id}) 必须与目录名一致`);
  for (const k of ['name', 'category', 'description', 'icon']) if (!m[k] || typeof m[k] !== 'string') err(id, `缺少 ${k}`);
  if (!semver.valid(m.version)) err(id, `version 不是合法 semver：${m.version}`);
  if (!KINDS.has(m.kind)) err(id, `kind 必须是 ${[...KINDS].join('/')}`);
  if (!Array.isArray(m.aliases)) err(id, 'aliases 必须是数组');
  if (!Number.isInteger(m.order)) err(id, 'order 必须是整数');

  // 授权与 web 对账
  if (!m.access || typeof m.access.requiresSolutionGrant !== 'boolean') err(id, 'access.requiresSolutionGrant 必须是布尔');
  if (m.access?.requiresSolutionGrant && !web.has(id)) err(id, '需要授权的方案 id 必须存在于 totalclaw-web 方案目录（registry/web-solution-ids.json）');
  if (m.kind === 'kit' && (m.access?.requiresSolutionGrant || !m.access?.hidden)) err(id, 'kit 必须 hidden 且不需要授权');

  // 兼容性 / 运行时
  if (!semver.valid(m.compat?.minAppVersion)) err(id, 'compat.minAppVersion 必须是 semver');
  if (!Number.isInteger(m.compat?.hostApi)) err(id, 'compat.hostApi 必须是整数');
  if (!RUNTIME_MODES.has(m.runtime?.mode)) err(id, 'runtime.mode 必须是 bundled/dynamic');
  if (!m.runtime?.runner) err(id, 'runtime.runner 必填');
  if (m.kind === 'workbench' && !m.runtime?.route) err(id, 'workbench 必须有 runtime.route');
  if ((m.kind === 'runner' || m.kind === 'pipeline') && m.runner !== m.runtime?.runner) err(id, '市场包顶层 runner 必须与 runtime.runner 一致（旧版 solutionStore 读取顶层 runner）');
  for (const k of ['renderer', 'main']) {
    const p = m.runtime?.[k];
    if (p && !existsSync(join(dir, p))) err(id, `runtime.${k} 指向不存在的文件：${p}`);
  }

  // 数据声明
  if (!Number.isInteger(m.data?.schemaVersion) || m.data.schemaVersion < 1) err(id, 'data.schemaVersion 必须是 ≥1 的整数');
  for (const p of m.data?.paths || []) {
    const clean = p.split('#')[0].replace(/\/$/, '');
    if (clean.startsWith('/') || clean.split('/').includes('..')) err(id, `data.paths 必须是账号目录内相对路径：${p}`);
    if (HOST_DATA_ROOTS.has(clean)) err(id, `data.paths 不得声明宿主公共目录：${p}`);
  }
  if (m.data?.schemaVersion > 1) {
    const migDir = join(dir, 'migrations');
    const migs = existsSync(migDir) ? walkFiles(migDir).filter((f) => /^\d+[-_].+\.mjs$/.test(f)) : [];
    if (!migs.length) err(id, `data.schemaVersion=${m.data.schemaVersion} 但 migrations/ 下没有迁移脚本`);
  }

  // CHANGELOG
  if (!changelogSection(dir, m.version || '0.0.0')) err(id, `CHANGELOG.md 缺少当前版本 ${m.version} 一节`);

  // 文件安全
  for (const f of walkFiles(dir)) {
    const abs = join(dir, f);
    const st = lstatSync(abs);
    if (st.isSymbolicLink()) err(id, `禁止符号链接：${f}`);
    if (st.size > MAX_FILE_BYTES) err(id, `文件超过 ${MAX_FILE_BYTES / 1024 / 1024}MB，请改用 largeAssets：${f}`);
    if (f.split('/').some((s) => s === '..' || s.startsWith('.tcsol'))) err(id, `非法文件名：${f}`);
  }

  // 名称 / 别名冲突
  for (const n of [m.name, ...(m.aliases || [])]) {
    const owner = names.get(n);
    if (owner && owner !== id) err(id, `名称/别名「${n}」与 ${owner} 冲突`);
    else names.set(n, id);
  }
}

// 名称 / 别名不能等于别的方案 id
for (const [n, owner] of names) if (known.has(n) && n !== owner) err(owner, `别名「${n}」与方案 id 冲突`);

// 依赖
for (const [id, m] of manifests) {
  for (const d of m.dependsOn || []) {
    if (d === id) err(id, '不能依赖自己');
    else if (!known.has(d)) err(id, `依赖的方案不存在：${d}`);
  }
}
const cycles = new Map();
function dfs(id, stack) {
  if (stack.includes(id)) {
    const ring = stack.slice(stack.indexOf(id));
    const key = [...ring].sort().join(',');
    if (!cycles.has(key)) cycles.set(key, ring.concat(id).join(' → '));
    return;
  }
  for (const d of manifests.get(id)?.dependsOn || []) dfs(d, [...stack, id]);
}
for (const id of manifests.keys()) dfs(id, []);
for (const c of cycles.values()) warn('deps', `循环依赖（安装器会一并安装，阶段 B 动态加载前需拆解）：${c}`);

// web 目录里有、仓库里没有
for (const wid of web) if (!known.has(wid)) err(wid, 'totalclaw-web 方案目录中存在，但方案仓库没有该方案');

// 版本递增
if (args.since) {
  for (const id of changedSolutions(args.since)) {
    const m = manifests.get(id);
    if (!m) continue;
    const old = gitShow(args.since, `solutions/${id}/solution.json`);
    if (!old) continue; // 新方案
    const oldVersion = JSON.parse(old).version;
    if (!semver.gt(m.version, oldVersion)) err(id, `文件有变化但版本未提升（${args.since}: ${oldVersion} → 当前 ${m.version}）`);
  }
}

// 生成物是否最新
try {
  execFileSync(process.execPath, [join(REPO_ROOT, 'tools', 'build-index.mjs'), '--check'], { cwd: REPO_ROOT, stdio: 'pipe' });
} catch (e) {
  err('index', `index.json / catalog.json 不是最新，请运行 npm run index\n${e.stderr?.toString() || ''}`.trim());
}

if (args.json) {
  console.log(JSON.stringify({ ok: !errors.length, solutions: ids.length, errors, warnings }, null, 2));
} else {
  for (const w of warnings) console.warn(`⚠ ${w}`);
  for (const e of errors) console.error(`✗ ${e}`);
  console.log(errors.length ? `\n校验失败：${errors.length} 个错误` : `✓ ${ids.length} 个方案校验通过（${warnings.length} 个警告）`);
}
process.exit(errors.length ? 1 : 0);
